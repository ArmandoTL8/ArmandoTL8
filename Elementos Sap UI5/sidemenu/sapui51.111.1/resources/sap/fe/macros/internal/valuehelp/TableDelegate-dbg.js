/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepEqual", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/DelegateUtil", "sap/fe/macros/ODataMetaModelUtil", "sap/ui/core/Core", "sap/ui/mdc/odata/v4/TableDelegate", "sap/ui/mdc/odata/v4/util/DelegateUtil", "sap/ui/mdc/util/FilterUtil", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"], function (Log, deepEqual, CommonUtils, FilterBar, MetaModelConverter, ModelHelper, DataModelPathHelper, DisplayModeFormatter, PropertyHelper, EDM, TypeUtil, MacrosDelegateUtil, ODataMetaModelUtil, Core, TableDelegate, DelegateUtil, FilterUtil, Filter, FilterOperator, Sorter) {
  "use strict";

  var isTypeFilterable = EDM.isTypeFilterable;
  var getLabel = PropertyHelper.getLabel;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedTimezonePropertyPath = PropertyHelper.getAssociatedTimezonePropertyPath;
  var getAssociatedTextPropertyPath = PropertyHelper.getAssociatedTextPropertyPath;
  var getAssociatedCurrencyPropertyPath = PropertyHelper.getAssociatedCurrencyPropertyPath;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var fetchTypeConfig = FilterBar.fetchTypeConfig;
  /**
   * Test delegate for OData V4.
   */
  const ODataTableDelegate = Object.assign({}, TableDelegate);
  ODataTableDelegate.fetchProperties = function (table) {
    const model = this._getModel(table);
    let createPropertyInfos;
    if (!model) {
      createPropertyInfos = new Promise(resolve => {
        table.attachModelContextChange({
          resolver: resolve
        }, onModelContextChange, this);
      }).then(oSubModel => {
        return this._createPropertyInfos(table, oSubModel);
      });
    } else {
      createPropertyInfos = this._createPropertyInfos(table, model);
    }
    return createPropertyInfos.then(function (properties) {
      MacrosDelegateUtil.setCachedProperties(table, properties);
      table.getBindingContext("internal").setProperty("tablePropertiesAvailable", true);
      return properties;
    });
  };
  ODataTableDelegate.createInternalBindingContext = function (table) {
    let dialog = table;
    while (dialog && !dialog.isA("sap.ui.mdc.valuehelp.Dialog")) {
      dialog = dialog.getParent();
    }
    if (dialog) {
      const internalModel = table.getModel("internal");
      const newInternalBindingContextPath = dialog.getBindingContext("internal").getPath() + `::VHDialog::${dialog.getId()}::table`;
      const newInternalBindingContext = internalModel.bindContext(newInternalBindingContextPath).getBoundContext();
      table.setBindingContext(newInternalBindingContext, "internal");
    }
  };
  function onModelContextChange(event, data) {
    const table = event.getSource();
    ODataTableDelegate.createInternalBindingContext(table);
    const model = this._getModel(table);
    if (model) {
      table.detachModelContextChange(onModelContextChange);
      data.resolver(model);
    }
  }
  /**
   * Collect related properties from a property's annotations.
   *
   * @param dataModelPropertyPath The model object path of the property.
   * @returns The related properties that were identified.
   */
  function _collectRelatedProperties(dataModelPropertyPath) {
    const dataModelAdditionalPropertyPath = _getAdditionalProperty(dataModelPropertyPath);
    const relatedProperties = {};
    if (dataModelAdditionalPropertyPath !== null && dataModelAdditionalPropertyPath !== void 0 && dataModelAdditionalPropertyPath.targetObject) {
      var _property$annotations, _property$annotations2, _textAnnotation$annot, _textAnnotation$annot2, _textAnnotation$annot3;
      const additionalProperty = dataModelAdditionalPropertyPath.targetObject;
      const additionalPropertyPath = getTargetObjectPath(dataModelAdditionalPropertyPath, true);
      const property = dataModelPropertyPath.targetObject;
      const propertyPath = getTargetObjectPath(dataModelPropertyPath, true);
      const textAnnotation = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Text,
        textArrangement = textAnnotation === null || textAnnotation === void 0 ? void 0 : (_textAnnotation$annot = textAnnotation.annotations) === null || _textAnnotation$annot === void 0 ? void 0 : (_textAnnotation$annot2 = _textAnnotation$annot.UI) === null || _textAnnotation$annot2 === void 0 ? void 0 : (_textAnnotation$annot3 = _textAnnotation$annot2.TextArrangement) === null || _textAnnotation$annot3 === void 0 ? void 0 : _textAnnotation$annot3.toString(),
        displayMode = textAnnotation && textArrangement && getDisplayMode(property);
      if (displayMode === "Description") {
        relatedProperties[additionalPropertyPath] = additionalProperty;
      } else if (displayMode && displayMode !== "Value" || !textAnnotation) {
        relatedProperties[propertyPath] = property;
        relatedProperties[additionalPropertyPath] = additionalProperty;
      }
    }
    return relatedProperties;
  }
  ODataTableDelegate._createPropertyInfos = function (oTable, oModel) {
    const oMetadataInfo = oTable.getDelegate().payload;
    const aProperties = [];
    const sEntitySetPath = `/${oMetadataInfo.collectionName}`;
    const oMetaModel = oModel.getMetaModel();
    return oMetaModel.requestObject(`${sEntitySetPath}@`).then(function (mEntitySetAnnotations) {
      const oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(mEntitySetAnnotations);
      const oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
      const oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);
      const customDataForColumns = MacrosDelegateUtil.getCustomData(oTable, "columns");
      const propertiesToBeCreated = {};
      const dataModelEntityPath = getInvolvedDataModelObjects(oTable.getModel().getMetaModel().getContext(sEntitySetPath));
      customDataForColumns.customData.forEach(function (columnDef) {
        const oPropertyInfo = {
          name: columnDef.path,
          label: columnDef.label,
          sortable: _isSortableProperty(oSortRestrictionsInfo, columnDef),
          filterable: _isFilterableProperty(oFilterRestrictionsInfo, columnDef),
          maxConditions: _getPropertyMaxConditions(oFilterRestrictionsInfo, columnDef),
          typeConfig: isTypeFilterable(columnDef.$Type) ? oTable.getTypeUtil().getTypeConfig(columnDef.$Type) : undefined
        };
        const dataModelPropertyPath = enhanceDataModelPath(dataModelEntityPath, columnDef.path);
        const property = dataModelPropertyPath.targetObject;
        if (property) {
          const targetPropertyPath = getTargetObjectPath(dataModelPropertyPath, true);
          let oTypeConfig;
          if (isTypeFilterable(property.type)) {
            const propertyTypeConfig = fetchTypeConfig(property);
            oTypeConfig = TypeUtil.getTypeConfig(propertyTypeConfig.type, propertyTypeConfig.formatOptions, propertyTypeConfig.constraints) ?? oTable.getTypeUtil().getTypeConfig(columnDef.$Type);
          }
          //Check if there is an additional property linked to the property as a Unit, Currency, Timezone or textArrangement
          const relatedPropertiesInfo = _collectRelatedProperties(dataModelPropertyPath);
          const relatedPropertyPaths = Object.keys(relatedPropertiesInfo);
          if (relatedPropertyPaths.length) {
            oPropertyInfo.propertyInfos = relatedPropertyPaths;
            //Complex properties must be hidden for sorting and filtering
            oPropertyInfo.sortable = false;
            oPropertyInfo.filterable = false;
            // Collect information of related columns to be created.
            relatedPropertyPaths.forEach(path => {
              propertiesToBeCreated[path] = relatedPropertiesInfo[path];
            });
            // Also add property for the inOut Parameters on the ValueHelp when textArrangement is set to #TextOnly
            // It will not be linked to the complex Property (BCP 2270141154)
            if (!relatedPropertyPaths.find(path => relatedPropertiesInfo[path] === property)) {
              propertiesToBeCreated[targetPropertyPath] = property;
            }
          } else {
            oPropertyInfo.path = columnDef.path;
          }
          oPropertyInfo.typeConfig = oPropertyInfo.typeConfig ? oTypeConfig : undefined;
        } else {
          oPropertyInfo.path = columnDef.path;
        }
        aProperties.push(oPropertyInfo);
      });
      const relatedColumns = _createRelatedProperties(propertiesToBeCreated, aProperties, oSortRestrictionsInfo, oFilterRestrictionsInfo);
      return aProperties.concat(relatedColumns);
    });
  };

  /**
   * Updates the binding info with the relevant path and model from the metadata.
   *
   * @param oMDCTable The MDCTable instance
   * @param oBindingInfo The bindingInfo of the table
   */
  ODataTableDelegate.updateBindingInfo = function (oMDCTable, oBindingInfo) {
    TableDelegate.updateBindingInfo.apply(this, [oMDCTable, oBindingInfo]);
    if (!oMDCTable) {
      return;
    }
    const oMetadataInfo = oMDCTable.getDelegate().payload;
    if (oMetadataInfo && oBindingInfo) {
      oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || `/${oMetadataInfo.collectionName}`;
      oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;
    }
    if (!oBindingInfo) {
      oBindingInfo = {};
    }
    const oFilter = Core.byId(oMDCTable.getFilter()),
      bFilterEnabled = oMDCTable.isFilteringEnabled();
    let mConditions;
    let oInnerFilterInfo, oOuterFilterInfo;
    const aFilters = [];
    const tableProperties = MacrosDelegateUtil.getCachedProperties(oMDCTable);

    //TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
    if (bFilterEnabled) {
      mConditions = oMDCTable.getConditions();
      oInnerFilterInfo = FilterUtil.getFilterInfo(oMDCTable, mConditions, tableProperties, []);
      if (oInnerFilterInfo.filters) {
        aFilters.push(oInnerFilterInfo.filters);
      }
    }
    if (oFilter) {
      mConditions = oFilter.getConditions();
      if (mConditions) {
        const aParameterNames = DelegateUtil.getParameterNames(oFilter);
        // The table properties needs to updated with the filter field if no Selectionfierlds are annotated and not part as value help parameter
        ODataTableDelegate._updatePropertyInfo(tableProperties, oMDCTable, mConditions, oMetadataInfo);
        oOuterFilterInfo = FilterUtil.getFilterInfo(oFilter, mConditions, tableProperties, aParameterNames);
        if (oOuterFilterInfo.filters) {
          aFilters.push(oOuterFilterInfo.filters);
        }
        const sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
        if (sParameterPath) {
          oBindingInfo.path = sParameterPath;
        }
      }

      // get the basic search
      oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oFilter.getSearch()) || undefined;
    }
    this._applyDefaultSorting(oBindingInfo, oMDCTable.getDelegate().payload);
    // add select to oBindingInfo (BCP 2170163012)
    oBindingInfo.parameters.$select = tableProperties === null || tableProperties === void 0 ? void 0 : tableProperties.reduce(function (sQuery, oProperty) {
      // Navigation properties (represented by X/Y) should not be added to $select.
      // ToDo : They should be added as $expand=X($select=Y) instead
      if (oProperty.path && oProperty.path.indexOf("/") === -1) {
        sQuery = sQuery ? `${sQuery},${oProperty.path}` : oProperty.path;
      }
      return sQuery;
    }, "");

    // Add $count
    oBindingInfo.parameters.$count = true;

    //If the entity is DraftEnabled add a DraftFilter
    if (ModelHelper.isDraftSupported(oMDCTable.getModel().getMetaModel(), oBindingInfo.path)) {
      aFilters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
    }
    oBindingInfo.filters = new Filter(aFilters, true);
  };
  ODataTableDelegate.getTypeUtil = function /*oPayload*/
  () {
    return TypeUtil;
  };
  ODataTableDelegate._getModel = function (oTable) {
    const oMetadataInfo = oTable.getDelegate().payload;
    return oTable.getModel(oMetadataInfo.model);
  };

  /**
   * Applies a default sort order if needed. This is only the case if the request is not a $search request
   * (means the parameter $search of the bindingInfo is undefined) and if not already a sort order is set,
   * e.g. via presentation variant or manual by the user.
   *
   * @param oBindingInfo The bindingInfo of the table
   * @param oPayload The payload of the TableDelegate
   */
  ODataTableDelegate._applyDefaultSorting = function (oBindingInfo, oPayload) {
    if (oBindingInfo.parameters && oBindingInfo.parameters.$search == undefined && oBindingInfo.sorter && oBindingInfo.sorter.length == 0) {
      const defaultSortPropertyName = oPayload ? oPayload.defaultSortPropertyName : undefined;
      if (defaultSortPropertyName) {
        oBindingInfo.sorter.push(new Sorter(defaultSortPropertyName, false));
      }
    }
  };

  /**
   * Updates the table properties with filter field infos.
   *
   * @param aTableProperties Array with table properties
   * @param oMDCTable The MDCTable instance
   * @param mConditions The conditions of the table
   * @param oMetadataInfo The metadata info of the filter field
   */
  ODataTableDelegate._updatePropertyInfo = function (aTableProperties, oMDCTable, mConditions, oMetadataInfo) {
    const aConditionKey = Object.keys(mConditions),
      oMetaModel = oMDCTable.getModel().getMetaModel();
    aConditionKey.forEach(function (conditionKey) {
      if (aTableProperties.findIndex(function (tableProperty) {
        return tableProperty.path === conditionKey;
      }) === -1) {
        const oColumnDef = {
          path: conditionKey,
          typeConfig: oMDCTable.getTypeUtil().getTypeConfig(oMetaModel.getObject(`/${oMetadataInfo.collectionName}/${conditionKey}`).$Type)
        };
        aTableProperties.push(oColumnDef);
      }
    });
  };
  ODataTableDelegate.updateBinding = function (oTable, oBindingInfo, oBinding) {
    let bNeedManualRefresh = false;
    const oInternalBindingContext = oTable.getBindingContext("internal");
    const sManualUpdatePropertyKey = "pendingManualBindingUpdate";
    const bPendingManualUpdate = oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.getProperty(sManualUpdatePropertyKey);
    let oRowBinding = oTable.getRowBinding();

    //oBinding=null means that a rebinding needs to be forced via updateBinding in mdc TableDelegate
    TableDelegate.updateBinding.apply(ODataTableDelegate, [oTable, oBindingInfo, oBinding]);
    //get row binding after rebind from TableDelegate.updateBinding in case oBinding was null
    if (!oRowBinding) {
      oRowBinding = oTable.getRowBinding();
    }
    if (oRowBinding) {
      /**
       * Manual refresh if filters are not changed by binding.refresh() since updating the bindingInfo
       * is not enough to trigger a batch request.
       * Removing columns creates one batch request that was not executed before
       */
      const oldFilters = oRowBinding.getFilters("Application");
      bNeedManualRefresh = deepEqual(oBindingInfo.filters, oldFilters[0]) && oRowBinding.getQueryOptionsFromParameters().$search === oBindingInfo.parameters.$search && !bPendingManualUpdate;
    }
    if (bNeedManualRefresh && oTable.getFilter()) {
      oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.setProperty(sManualUpdatePropertyKey, true);
      oRowBinding.requestRefresh(oRowBinding.getGroupId()).finally(function () {
        oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.setProperty(sManualUpdatePropertyKey, false);
      }).catch(function (oError) {
        Log.error("Error while refreshing a filterBar VH table", oError);
      });
    }
    oTable.fireEvent("bindingUpdated");
    //no need to check for semantic targets here since we are in a VH and don't want to allow further navigation
  };

  /**
   * Creates a simple property for each identified complex property.
   *
   * @param propertiesToBeCreated Identified properties.
   * @param existingColumns The list of columns created for properties defined on the Value List.
   * @param oSortRestrictionsInfo An object containing the sort restriction information
   * @param oFilterRestrictionsInfo An object containing the filter restriction information
   * @returns The array of properties created.
   */
  function _createRelatedProperties(propertiesToBeCreated, existingColumns, oSortRestrictionsInfo, oFilterRestrictionsInfo) {
    const relatedPropertyNameMap = {},
      relatedColumns = [];
    Object.keys(propertiesToBeCreated).forEach(path => {
      const property = propertiesToBeCreated[path],
        relatedColumn = existingColumns.find(column => column.path === path); // Complex properties doesn't get path so only simple column are found
      if (!relatedColumn) {
        const newName = `Property::${path}`;
        relatedPropertyNameMap[path] = newName;
        const valueHelpTableColumn = {
          name: newName,
          label: getLabel(property),
          path: path,
          sortable: _isSortableProperty(oSortRestrictionsInfo, property),
          filterable: _isFilterableProperty(oFilterRestrictionsInfo, property)
        };
        valueHelpTableColumn.maxConditions = _getPropertyMaxConditions(oFilterRestrictionsInfo, valueHelpTableColumn);
        if (isTypeFilterable(property.type)) {
          const propertyTypeConfig = fetchTypeConfig(property);
          valueHelpTableColumn.typeConfig = TypeUtil.getTypeConfig(propertyTypeConfig.type, propertyTypeConfig.formatOptions, propertyTypeConfig.constraints);
        }
        relatedColumns.push(valueHelpTableColumn);
      }
    });
    // The property 'name' has been prefixed with 'Property::' for uniqueness.
    // Update the same in other propertyInfos[] references which point to this property.
    existingColumns.forEach(column => {
      if (column.propertyInfos) {
        var _column$propertyInfos;
        column.propertyInfos = (_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.map(columnName => relatedPropertyNameMap[columnName] ?? columnName);
      }
    });
    return relatedColumns;
  }
  /**
   * Identifies if the given property is sortable based on the sort restriction information.
   *
   * @param sortRestrictionsInfo The sort restriction information from the restriction annotation.
   * @param property The target property.
   * @returns `true` if the given property is sortable.
   */
  function _isSortableProperty(sortRestrictionsInfo, property) {
    return property.path && sortRestrictionsInfo.propertyInfo[property.path] ? sortRestrictionsInfo.propertyInfo[property.path].sortable : property.sortable;
  }

  /**
   * Identifies if the given property is filterable based on the sort restriction information.
   *
   * @param oFilterRestrictionsInfo The filter restriction information from the restriction annotation.
   * @param property The target property.
   * @returns `true` if the given property is filterable.
   */
  function _isFilterableProperty(oFilterRestrictionsInfo, property) {
    return property.path && oFilterRestrictionsInfo[property.path] ? oFilterRestrictionsInfo[property.path].filterable : property.filterable;
  }

  /**
   * Identifies the maxConditions for a given property.
   *
   * @param oFilterRestrictionsInfo The filter restriction information from the restriction annotation.
   * @param valueHelpColumn The target property.
   * @returns `-1` or `1` if the property is a MultiValueFilterExpression.
   */
  function _getPropertyMaxConditions(oFilterRestrictionsInfo, valueHelpColumn) {
    return valueHelpColumn.path && ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[valueHelpColumn.path]) ? -1 : 1;
  }

  /**
   * Identifies the additional property which references to the unit, timezone, textArrangement or currency.
   *
   * @param dataModelPropertyPath The model object path of the property.
   * @returns The additional property.
   */

  function _getAdditionalProperty(dataModelPropertyPath) {
    const oProperty = dataModelPropertyPath.targetObject;
    const additionalPropertyPath = getAssociatedTextPropertyPath(oProperty) || getAssociatedCurrencyPropertyPath(oProperty) || getAssociatedUnitPropertyPath(oProperty) || getAssociatedTimezonePropertyPath(oProperty);
    if (!additionalPropertyPath) {
      return undefined;
    }
    const dataModelAdditionalProperty = enhanceDataModelPath(dataModelPropertyPath, additionalPropertyPath);

    //Additional Property could refer to a navigation property, keep the name and path as navigation property
    const additionalProperty = dataModelAdditionalProperty.targetObject;
    if (!additionalProperty) {
      return undefined;
    }
    return dataModelAdditionalProperty;
  }
  return ODataTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPRGF0YVRhYmxlRGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJUYWJsZURlbGVnYXRlIiwiZmV0Y2hQcm9wZXJ0aWVzIiwidGFibGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsImNyZWF0ZVByb3BlcnR5SW5mb3MiLCJQcm9taXNlIiwicmVzb2x2ZSIsImF0dGFjaE1vZGVsQ29udGV4dENoYW5nZSIsInJlc29sdmVyIiwib25Nb2RlbENvbnRleHRDaGFuZ2UiLCJ0aGVuIiwib1N1Yk1vZGVsIiwiX2NyZWF0ZVByb3BlcnR5SW5mb3MiLCJwcm9wZXJ0aWVzIiwiTWFjcm9zRGVsZWdhdGVVdGlsIiwic2V0Q2FjaGVkUHJvcGVydGllcyIsImdldEJpbmRpbmdDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJjcmVhdGVJbnRlcm5hbEJpbmRpbmdDb250ZXh0IiwiZGlhbG9nIiwiaXNBIiwiZ2V0UGFyZW50IiwiaW50ZXJuYWxNb2RlbCIsImdldE1vZGVsIiwibmV3SW50ZXJuYWxCaW5kaW5nQ29udGV4dFBhdGgiLCJnZXRQYXRoIiwiZ2V0SWQiLCJuZXdJbnRlcm5hbEJpbmRpbmdDb250ZXh0IiwiYmluZENvbnRleHQiLCJnZXRCb3VuZENvbnRleHQiLCJzZXRCaW5kaW5nQ29udGV4dCIsImV2ZW50IiwiZGF0YSIsImdldFNvdXJjZSIsImRldGFjaE1vZGVsQ29udGV4dENoYW5nZSIsIl9jb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMiLCJkYXRhTW9kZWxQcm9wZXJ0eVBhdGgiLCJkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoIiwiX2dldEFkZGl0aW9uYWxQcm9wZXJ0eSIsInJlbGF0ZWRQcm9wZXJ0aWVzIiwidGFyZ2V0T2JqZWN0IiwiYWRkaXRpb25hbFByb3BlcnR5IiwiYWRkaXRpb25hbFByb3BlcnR5UGF0aCIsImdldFRhcmdldE9iamVjdFBhdGgiLCJwcm9wZXJ0eSIsInByb3BlcnR5UGF0aCIsInRleHRBbm5vdGF0aW9uIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJUZXh0IiwidGV4dEFycmFuZ2VtZW50IiwiVUkiLCJUZXh0QXJyYW5nZW1lbnQiLCJ0b1N0cmluZyIsImRpc3BsYXlNb2RlIiwiZ2V0RGlzcGxheU1vZGUiLCJvVGFibGUiLCJvTW9kZWwiLCJvTWV0YWRhdGFJbmZvIiwiZ2V0RGVsZWdhdGUiLCJwYXlsb2FkIiwiYVByb3BlcnRpZXMiLCJzRW50aXR5U2V0UGF0aCIsImNvbGxlY3Rpb25OYW1lIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInJlcXVlc3RPYmplY3QiLCJtRW50aXR5U2V0QW5ub3RhdGlvbnMiLCJvU29ydFJlc3RyaWN0aW9uc0luZm8iLCJPRGF0YU1ldGFNb2RlbFV0aWwiLCJnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyIsIm9GaWx0ZXJSZXN0cmljdGlvbnMiLCJvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8iLCJjdXN0b21EYXRhRm9yQ29sdW1ucyIsImdldEN1c3RvbURhdGEiLCJwcm9wZXJ0aWVzVG9CZUNyZWF0ZWQiLCJkYXRhTW9kZWxFbnRpdHlQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiZ2V0Q29udGV4dCIsImN1c3RvbURhdGEiLCJmb3JFYWNoIiwiY29sdW1uRGVmIiwib1Byb3BlcnR5SW5mbyIsIm5hbWUiLCJwYXRoIiwibGFiZWwiLCJzb3J0YWJsZSIsIl9pc1NvcnRhYmxlUHJvcGVydHkiLCJmaWx0ZXJhYmxlIiwiX2lzRmlsdGVyYWJsZVByb3BlcnR5IiwibWF4Q29uZGl0aW9ucyIsIl9nZXRQcm9wZXJ0eU1heENvbmRpdGlvbnMiLCJ0eXBlQ29uZmlnIiwiaXNUeXBlRmlsdGVyYWJsZSIsIiRUeXBlIiwiZ2V0VHlwZVV0aWwiLCJnZXRUeXBlQ29uZmlnIiwidW5kZWZpbmVkIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJ0YXJnZXRQcm9wZXJ0eVBhdGgiLCJvVHlwZUNvbmZpZyIsInR5cGUiLCJwcm9wZXJ0eVR5cGVDb25maWciLCJmZXRjaFR5cGVDb25maWciLCJUeXBlVXRpbCIsImZvcm1hdE9wdGlvbnMiLCJjb25zdHJhaW50cyIsInJlbGF0ZWRQcm9wZXJ0aWVzSW5mbyIsInJlbGF0ZWRQcm9wZXJ0eVBhdGhzIiwia2V5cyIsImxlbmd0aCIsInByb3BlcnR5SW5mb3MiLCJmaW5kIiwicHVzaCIsInJlbGF0ZWRDb2x1bW5zIiwiX2NyZWF0ZVJlbGF0ZWRQcm9wZXJ0aWVzIiwiY29uY2F0IiwidXBkYXRlQmluZGluZ0luZm8iLCJvTURDVGFibGUiLCJvQmluZGluZ0luZm8iLCJhcHBseSIsImNvbGxlY3Rpb25QYXRoIiwib0ZpbHRlciIsIkNvcmUiLCJieUlkIiwiZ2V0RmlsdGVyIiwiYkZpbHRlckVuYWJsZWQiLCJpc0ZpbHRlcmluZ0VuYWJsZWQiLCJtQ29uZGl0aW9ucyIsIm9Jbm5lckZpbHRlckluZm8iLCJvT3V0ZXJGaWx0ZXJJbmZvIiwiYUZpbHRlcnMiLCJ0YWJsZVByb3BlcnRpZXMiLCJnZXRDYWNoZWRQcm9wZXJ0aWVzIiwiZ2V0Q29uZGl0aW9ucyIsIkZpbHRlclV0aWwiLCJnZXRGaWx0ZXJJbmZvIiwiZmlsdGVycyIsImFQYXJhbWV0ZXJOYW1lcyIsIkRlbGVnYXRlVXRpbCIsImdldFBhcmFtZXRlck5hbWVzIiwiX3VwZGF0ZVByb3BlcnR5SW5mbyIsInNQYXJhbWV0ZXJQYXRoIiwiZ2V0UGFyYW1ldGVyc0luZm8iLCJwYXJhbWV0ZXJzIiwiJHNlYXJjaCIsIkNvbW1vblV0aWxzIiwibm9ybWFsaXplU2VhcmNoVGVybSIsImdldFNlYXJjaCIsIl9hcHBseURlZmF1bHRTb3J0aW5nIiwiJHNlbGVjdCIsInJlZHVjZSIsInNRdWVyeSIsIm9Qcm9wZXJ0eSIsImluZGV4T2YiLCIkY291bnQiLCJNb2RlbEhlbHBlciIsImlzRHJhZnRTdXBwb3J0ZWQiLCJGaWx0ZXIiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwib1BheWxvYWQiLCJzb3J0ZXIiLCJkZWZhdWx0U29ydFByb3BlcnR5TmFtZSIsIlNvcnRlciIsImFUYWJsZVByb3BlcnRpZXMiLCJhQ29uZGl0aW9uS2V5IiwiY29uZGl0aW9uS2V5IiwiZmluZEluZGV4IiwidGFibGVQcm9wZXJ0eSIsIm9Db2x1bW5EZWYiLCJnZXRPYmplY3QiLCJ1cGRhdGVCaW5kaW5nIiwib0JpbmRpbmciLCJiTmVlZE1hbnVhbFJlZnJlc2giLCJvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCIsInNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSIsImJQZW5kaW5nTWFudWFsVXBkYXRlIiwiZ2V0UHJvcGVydHkiLCJvUm93QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJvbGRGaWx0ZXJzIiwiZ2V0RmlsdGVycyIsImRlZXBFcXVhbCIsImdldFF1ZXJ5T3B0aW9uc0Zyb21QYXJhbWV0ZXJzIiwicmVxdWVzdFJlZnJlc2giLCJnZXRHcm91cElkIiwiZmluYWxseSIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJmaXJlRXZlbnQiLCJleGlzdGluZ0NvbHVtbnMiLCJyZWxhdGVkUHJvcGVydHlOYW1lTWFwIiwicmVsYXRlZENvbHVtbiIsImNvbHVtbiIsIm5ld05hbWUiLCJ2YWx1ZUhlbHBUYWJsZUNvbHVtbiIsImdldExhYmVsIiwibWFwIiwiY29sdW1uTmFtZSIsInNvcnRSZXN0cmljdGlvbnNJbmZvIiwicHJvcGVydHlJbmZvIiwidmFsdWVIZWxwQ29sdW1uIiwiaXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbiIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVBhdGgiLCJnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eVBhdGgiLCJkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGRlZXBFcXVhbCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwRXF1YWxcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGZldGNoVHlwZUNvbmZpZyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvRmlsdGVyQmFyXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgRGF0YU1vZGVsT2JqZWN0UGF0aCwgZW5oYW5jZURhdGFNb2RlbFBhdGgsIGdldFRhcmdldE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBnZXREaXNwbGF5TW9kZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0Rpc3BsYXlNb2RlRm9ybWF0dGVyXCI7XG5pbXBvcnQge1xuXHRnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eVBhdGgsXG5cdGdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eVBhdGgsXG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoLFxuXHRnZXRMYWJlbFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHsgRGVmYXVsdFR5cGVGb3JFZG1UeXBlLCBpc1R5cGVGaWx0ZXJhYmxlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvRURNXCI7XG5pbXBvcnQgVHlwZVV0aWwgZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvVHlwZVV0aWxcIjtcbmltcG9ydCBNYWNyb3NEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWxVdGlsLCB7IHR5cGUgU29ydFJlc3RyaWN0aW9uc0luZm9UeXBlIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvT0RhdGFNZXRhTW9kZWxVdGlsXCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgVGFibGVEZWxlZ2F0ZSBmcm9tIFwic2FwL3VpL21kYy9vZGF0YS92NC9UYWJsZURlbGVnYXRlXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL29kYXRhL3Y0L3V0aWwvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IEZpbHRlclV0aWwgZnJvbSBcInNhcC91aS9tZGMvdXRpbC9GaWx0ZXJVdGlsXCI7XG5pbXBvcnQgTURDVGFibGUgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2NvbnRlbnQvTURDVGFibGVcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgU29ydGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvU29ydGVyXCI7XG5pbXBvcnQgeyBWNENvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5cbmV4cG9ydCB0eXBlIFZhbHVlSGVscFRhYmxlQ29sdW1uID0ge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHByb3BlcnR5SW5mb3M/OiBzdHJpbmdbXTtcblx0c29ydGFibGU/OiBib29sZWFuO1xuXHRwYXRoPzogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZztcblx0ZmlsdGVyYWJsZT86IGJvb2xlYW47XG5cdHR5cGVDb25maWc/OiBPYmplY3Q7XG5cdG1heENvbmRpdGlvbnM/OiBudW1iZXI7XG59O1xudHlwZSBDb21wbGV4UHJvcGVydHlNYXAgPSBSZWNvcmQ8c3RyaW5nLCBQcm9wZXJ0eT47XG5cbi8qKlxuICogVGVzdCBkZWxlZ2F0ZSBmb3IgT0RhdGEgVjQuXG4gKi9cbmNvbnN0IE9EYXRhVGFibGVEZWxlZ2F0ZSA9IE9iamVjdC5hc3NpZ24oe30sIFRhYmxlRGVsZWdhdGUpO1xuXG5PRGF0YVRhYmxlRGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSkge1xuXHRjb25zdCBtb2RlbCA9IHRoaXMuX2dldE1vZGVsKHRhYmxlKTtcblx0bGV0IGNyZWF0ZVByb3BlcnR5SW5mb3M7XG5cdGlmICghbW9kZWwpIHtcblx0XHRjcmVhdGVQcm9wZXJ0eUluZm9zID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHRhYmxlLmF0dGFjaE1vZGVsQ29udGV4dENoYW5nZShcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlc29sdmVyOiByZXNvbHZlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uTW9kZWxDb250ZXh0Q2hhbmdlIGFzIGFueSxcblx0XHRcdFx0dGhpc1xuXHRcdFx0KTtcblx0XHR9KS50aGVuKChvU3ViTW9kZWwpID0+IHtcblx0XHRcdHJldHVybiB0aGlzLl9jcmVhdGVQcm9wZXJ0eUluZm9zKHRhYmxlLCBvU3ViTW9kZWwpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGNyZWF0ZVByb3BlcnR5SW5mb3MgPSB0aGlzLl9jcmVhdGVQcm9wZXJ0eUluZm9zKHRhYmxlLCBtb2RlbCk7XG5cdH1cblxuXHRyZXR1cm4gY3JlYXRlUHJvcGVydHlJbmZvcy50aGVuKGZ1bmN0aW9uIChwcm9wZXJ0aWVzOiBhbnkpIHtcblx0XHRNYWNyb3NEZWxlZ2F0ZVV0aWwuc2V0Q2FjaGVkUHJvcGVydGllcyh0YWJsZSwgcHJvcGVydGllcyk7XG5cdFx0KHRhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgVjRDb250ZXh0KS5zZXRQcm9wZXJ0eShcInRhYmxlUHJvcGVydGllc0F2YWlsYWJsZVwiLCB0cnVlKTtcblx0XHRyZXR1cm4gcHJvcGVydGllcztcblx0fSk7XG59O1xuXG5PRGF0YVRhYmxlRGVsZWdhdGUuY3JlYXRlSW50ZXJuYWxCaW5kaW5nQ29udGV4dCA9IGZ1bmN0aW9uICh0YWJsZTogVGFibGUpIHtcblx0bGV0IGRpYWxvZzogTWFuYWdlZE9iamVjdCB8IG51bGwgPSB0YWJsZTtcblx0d2hpbGUgKGRpYWxvZyAmJiAhZGlhbG9nLmlzQShcInNhcC51aS5tZGMudmFsdWVoZWxwLkRpYWxvZ1wiKSkge1xuXHRcdGRpYWxvZyA9IChkaWFsb2cgYXMgTWFuYWdlZE9iamVjdCkuZ2V0UGFyZW50KCk7XG5cdH1cblx0aWYgKGRpYWxvZykge1xuXHRcdGNvbnN0IGludGVybmFsTW9kZWwgPSB0YWJsZS5nZXRNb2RlbChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IG5ld0ludGVybmFsQmluZGluZ0NvbnRleHRQYXRoID0gZGlhbG9nLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikhLmdldFBhdGgoKSArIGA6OlZIRGlhbG9nOjoke2RpYWxvZy5nZXRJZCgpfTo6dGFibGVgO1xuXHRcdGNvbnN0IG5ld0ludGVybmFsQmluZGluZ0NvbnRleHQgPSBpbnRlcm5hbE1vZGVsLmJpbmRDb250ZXh0KG5ld0ludGVybmFsQmluZGluZ0NvbnRleHRQYXRoKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHR0YWJsZS5zZXRCaW5kaW5nQ29udGV4dChuZXdJbnRlcm5hbEJpbmRpbmdDb250ZXh0ISwgXCJpbnRlcm5hbFwiKTtcblx0fVxufTtcblxuZnVuY3Rpb24gb25Nb2RlbENvbnRleHRDaGFuZ2UodGhpczogdHlwZW9mIE9EYXRhVGFibGVEZWxlZ2F0ZSwgZXZlbnQ6IEV2ZW50LCBkYXRhOiBhbnkpIHtcblx0Y29uc3QgdGFibGUgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBUYWJsZTtcblx0T0RhdGFUYWJsZURlbGVnYXRlLmNyZWF0ZUludGVybmFsQmluZGluZ0NvbnRleHQodGFibGUpO1xuXHRjb25zdCBtb2RlbCA9IHRoaXMuX2dldE1vZGVsKHRhYmxlKTtcblxuXHRpZiAobW9kZWwpIHtcblx0XHR0YWJsZS5kZXRhY2hNb2RlbENvbnRleHRDaGFuZ2Uob25Nb2RlbENvbnRleHRDaGFuZ2UgYXMgYW55KTtcblx0XHRkYXRhLnJlc29sdmVyKG1vZGVsKTtcblx0fVxufVxuLyoqXG4gKiBDb2xsZWN0IHJlbGF0ZWQgcHJvcGVydGllcyBmcm9tIGEgcHJvcGVydHkncyBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gZGF0YU1vZGVsUHJvcGVydHlQYXRoIFRoZSBtb2RlbCBvYmplY3QgcGF0aCBvZiB0aGUgcHJvcGVydHkuXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRlZCBwcm9wZXJ0aWVzIHRoYXQgd2VyZSBpZGVudGlmaWVkLlxuICovXG5mdW5jdGlvbiBfY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKGRhdGFNb2RlbFByb3BlcnR5UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRjb25zdCBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoID0gX2dldEFkZGl0aW9uYWxQcm9wZXJ0eShkYXRhTW9kZWxQcm9wZXJ0eVBhdGgpO1xuXHRjb25zdCByZWxhdGVkUHJvcGVydGllczogQ29tcGxleFByb3BlcnR5TWFwID0ge307XG5cdGlmIChkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoPy50YXJnZXRPYmplY3QpIHtcblx0XHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHkgPSBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoLnRhcmdldE9iamVjdDtcblx0XHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHlQYXRoID0gZ2V0VGFyZ2V0T2JqZWN0UGF0aChkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoLCB0cnVlKTtcblxuXHRcdGNvbnN0IHByb3BlcnR5ID0gZGF0YU1vZGVsUHJvcGVydHlQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eTtcblx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBnZXRUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbFByb3BlcnR5UGF0aCwgdHJ1ZSk7XG5cblx0XHRjb25zdCB0ZXh0QW5ub3RhdGlvbiA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQsXG5cdFx0XHR0ZXh0QXJyYW5nZW1lbnQgPSB0ZXh0QW5ub3RhdGlvbj8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQ/LnRvU3RyaW5nKCksXG5cdFx0XHRkaXNwbGF5TW9kZSA9IHRleHRBbm5vdGF0aW9uICYmIHRleHRBcnJhbmdlbWVudCAmJiBnZXREaXNwbGF5TW9kZShwcm9wZXJ0eSk7XG5cblx0XHRpZiAoZGlzcGxheU1vZGUgPT09IFwiRGVzY3JpcHRpb25cIikge1xuXHRcdFx0cmVsYXRlZFByb3BlcnRpZXNbYWRkaXRpb25hbFByb3BlcnR5UGF0aF0gPSBhZGRpdGlvbmFsUHJvcGVydHk7XG5cdFx0fSBlbHNlIGlmICgoZGlzcGxheU1vZGUgJiYgZGlzcGxheU1vZGUgIT09IFwiVmFsdWVcIikgfHwgIXRleHRBbm5vdGF0aW9uKSB7XG5cdFx0XHRyZWxhdGVkUHJvcGVydGllc1twcm9wZXJ0eVBhdGhdID0gcHJvcGVydHk7XG5cdFx0XHRyZWxhdGVkUHJvcGVydGllc1thZGRpdGlvbmFsUHJvcGVydHlQYXRoXSA9IGFkZGl0aW9uYWxQcm9wZXJ0eTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlbGF0ZWRQcm9wZXJ0aWVzO1xufVxuXG5PRGF0YVRhYmxlRGVsZWdhdGUuX2NyZWF0ZVByb3BlcnR5SW5mb3MgPSBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9Nb2RlbDogYW55KSB7XG5cdGNvbnN0IG9NZXRhZGF0YUluZm8gPSBvVGFibGUuZ2V0RGVsZWdhdGUoKS5wYXlsb2FkO1xuXHRjb25zdCBhUHJvcGVydGllczogVmFsdWVIZWxwVGFibGVDb2x1bW5bXSA9IFtdO1xuXHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IGAvJHtvTWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25OYW1lfWA7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cblx0cmV0dXJuIG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH1AYCkudGhlbihmdW5jdGlvbiAobUVudGl0eVNldEFubm90YXRpb25zOiBhbnkpIHtcblx0XHRjb25zdCBvU29ydFJlc3RyaWN0aW9uc0luZm8gPSBPRGF0YU1ldGFNb2RlbFV0aWwuZ2V0U29ydFJlc3RyaWN0aW9uc0luZm8obUVudGl0eVNldEFubm90YXRpb25zKTtcblx0XHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zID0gbUVudGl0eVNldEFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zXCJdO1xuXHRcdGNvbnN0IG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvID0gT0RhdGFNZXRhTW9kZWxVdGlsLmdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8ob0ZpbHRlclJlc3RyaWN0aW9ucyk7XG5cblx0XHRjb25zdCBjdXN0b21EYXRhRm9yQ29sdW1ucyA9IE1hY3Jvc0RlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJjb2x1bW5zXCIpO1xuXHRcdGNvbnN0IHByb3BlcnRpZXNUb0JlQ3JlYXRlZDogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+ID0ge307XG5cdFx0Y29uc3QgZGF0YU1vZGVsRW50aXR5UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvVGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRDb250ZXh0KHNFbnRpdHlTZXRQYXRoKSk7XG5cdFx0Y3VzdG9tRGF0YUZvckNvbHVtbnMuY3VzdG9tRGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChjb2x1bW5EZWY6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1Byb3BlcnR5SW5mbzogVmFsdWVIZWxwVGFibGVDb2x1bW4gPSB7XG5cdFx0XHRcdG5hbWU6IGNvbHVtbkRlZi5wYXRoLFxuXHRcdFx0XHRsYWJlbDogY29sdW1uRGVmLmxhYmVsLFxuXHRcdFx0XHRzb3J0YWJsZTogX2lzU29ydGFibGVQcm9wZXJ0eShvU29ydFJlc3RyaWN0aW9uc0luZm8sIGNvbHVtbkRlZiksXG5cdFx0XHRcdGZpbHRlcmFibGU6IF9pc0ZpbHRlcmFibGVQcm9wZXJ0eShvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbywgY29sdW1uRGVmKSxcblx0XHRcdFx0bWF4Q29uZGl0aW9uczogX2dldFByb3BlcnR5TWF4Q29uZGl0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbywgY29sdW1uRGVmKSxcblx0XHRcdFx0dHlwZUNvbmZpZzogaXNUeXBlRmlsdGVyYWJsZShjb2x1bW5EZWYuJFR5cGUpID8gb1RhYmxlLmdldFR5cGVVdGlsKCkuZ2V0VHlwZUNvbmZpZyhjb2x1bW5EZWYuJFR5cGUpIDogdW5kZWZpbmVkXG5cdFx0XHR9O1xuXG5cdFx0XHRjb25zdCBkYXRhTW9kZWxQcm9wZXJ0eVBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxFbnRpdHlQYXRoLCBjb2x1bW5EZWYucGF0aCk7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eSA9IGRhdGFNb2RlbFByb3BlcnR5UGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHk7XG5cdFx0XHRpZiAocHJvcGVydHkpIHtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0UHJvcGVydHlQYXRoID0gZ2V0VGFyZ2V0T2JqZWN0UGF0aChkYXRhTW9kZWxQcm9wZXJ0eVBhdGgsIHRydWUpO1xuXHRcdFx0XHRsZXQgb1R5cGVDb25maWc7XG5cdFx0XHRcdGlmIChpc1R5cGVGaWx0ZXJhYmxlKHByb3BlcnR5LnR5cGUgYXMga2V5b2YgdHlwZW9mIERlZmF1bHRUeXBlRm9yRWRtVHlwZSkpIHtcblx0XHRcdFx0XHRjb25zdCBwcm9wZXJ0eVR5cGVDb25maWcgPSBmZXRjaFR5cGVDb25maWcocHJvcGVydHkpO1xuXHRcdFx0XHRcdG9UeXBlQ29uZmlnID1cblx0XHRcdFx0XHRcdFR5cGVVdGlsLmdldFR5cGVDb25maWcocHJvcGVydHlUeXBlQ29uZmlnLnR5cGUsIHByb3BlcnR5VHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zLCBwcm9wZXJ0eVR5cGVDb25maWcuY29uc3RyYWludHMpID8/XG5cdFx0XHRcdFx0XHRvVGFibGUuZ2V0VHlwZVV0aWwoKS5nZXRUeXBlQ29uZmlnKGNvbHVtbkRlZi4kVHlwZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly9DaGVjayBpZiB0aGVyZSBpcyBhbiBhZGRpdGlvbmFsIHByb3BlcnR5IGxpbmtlZCB0byB0aGUgcHJvcGVydHkgYXMgYSBVbml0LCBDdXJyZW5jeSwgVGltZXpvbmUgb3IgdGV4dEFycmFuZ2VtZW50XG5cdFx0XHRcdGNvbnN0IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mbyA9IF9jb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoZGF0YU1vZGVsUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnR5UGF0aHM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMocmVsYXRlZFByb3BlcnRpZXNJbmZvKTtcblxuXHRcdFx0XHRpZiAocmVsYXRlZFByb3BlcnR5UGF0aHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0b1Byb3BlcnR5SW5mby5wcm9wZXJ0eUluZm9zID0gcmVsYXRlZFByb3BlcnR5UGF0aHM7XG5cdFx0XHRcdFx0Ly9Db21wbGV4IHByb3BlcnRpZXMgbXVzdCBiZSBoaWRkZW4gZm9yIHNvcnRpbmcgYW5kIGZpbHRlcmluZ1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eUluZm8uc29ydGFibGUgPSBmYWxzZTtcblx0XHRcdFx0XHRvUHJvcGVydHlJbmZvLmZpbHRlcmFibGUgPSBmYWxzZTtcblx0XHRcdFx0XHQvLyBDb2xsZWN0IGluZm9ybWF0aW9uIG9mIHJlbGF0ZWQgY29sdW1ucyB0byBiZSBjcmVhdGVkLlxuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eVBhdGhzLmZvckVhY2goKHBhdGgpID0+IHtcblx0XHRcdFx0XHRcdHByb3BlcnRpZXNUb0JlQ3JlYXRlZFtwYXRoXSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mb1twYXRoXTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvLyBBbHNvIGFkZCBwcm9wZXJ0eSBmb3IgdGhlIGluT3V0IFBhcmFtZXRlcnMgb24gdGhlIFZhbHVlSGVscCB3aGVuIHRleHRBcnJhbmdlbWVudCBpcyBzZXQgdG8gI1RleHRPbmx5XG5cdFx0XHRcdFx0Ly8gSXQgd2lsbCBub3QgYmUgbGlua2VkIHRvIHRoZSBjb21wbGV4IFByb3BlcnR5IChCQ1AgMjI3MDE0MTE1NClcblx0XHRcdFx0XHRpZiAoIXJlbGF0ZWRQcm9wZXJ0eVBhdGhzLmZpbmQoKHBhdGgpID0+IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mb1twYXRoXSA9PT0gcHJvcGVydHkpKSB7XG5cdFx0XHRcdFx0XHRwcm9wZXJ0aWVzVG9CZUNyZWF0ZWRbdGFyZ2V0UHJvcGVydHlQYXRoXSA9IHByb3BlcnR5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvUHJvcGVydHlJbmZvLnBhdGggPSBjb2x1bW5EZWYucGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRvUHJvcGVydHlJbmZvLnR5cGVDb25maWcgPSBvUHJvcGVydHlJbmZvLnR5cGVDb25maWcgPyBvVHlwZUNvbmZpZyA6IHVuZGVmaW5lZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Qcm9wZXJ0eUluZm8ucGF0aCA9IGNvbHVtbkRlZi5wYXRoO1xuXHRcdFx0fVxuXHRcdFx0YVByb3BlcnRpZXMucHVzaChvUHJvcGVydHlJbmZvKTtcblx0XHR9KTtcblx0XHRjb25zdCByZWxhdGVkQ29sdW1ucyA9IF9jcmVhdGVSZWxhdGVkUHJvcGVydGllcyhwcm9wZXJ0aWVzVG9CZUNyZWF0ZWQsIGFQcm9wZXJ0aWVzLCBvU29ydFJlc3RyaWN0aW9uc0luZm8sIG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvKTtcblx0XHRyZXR1cm4gYVByb3BlcnRpZXMuY29uY2F0KHJlbGF0ZWRDb2x1bW5zKTtcblx0fSk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIGJpbmRpbmcgaW5mbyB3aXRoIHRoZSByZWxldmFudCBwYXRoIGFuZCBtb2RlbCBmcm9tIHRoZSBtZXRhZGF0YS5cbiAqXG4gKiBAcGFyYW0gb01EQ1RhYmxlIFRoZSBNRENUYWJsZSBpbnN0YW5jZVxuICogQHBhcmFtIG9CaW5kaW5nSW5mbyBUaGUgYmluZGluZ0luZm8gb2YgdGhlIHRhYmxlXG4gKi9cbk9EYXRhVGFibGVEZWxlZ2F0ZS51cGRhdGVCaW5kaW5nSW5mbyA9IGZ1bmN0aW9uIChvTURDVGFibGU6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0VGFibGVEZWxlZ2F0ZS51cGRhdGVCaW5kaW5nSW5mby5hcHBseSh0aGlzLCBbb01EQ1RhYmxlLCBvQmluZGluZ0luZm9dKTtcblx0aWYgKCFvTURDVGFibGUpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBvTWV0YWRhdGFJbmZvID0gb01EQ1RhYmxlLmdldERlbGVnYXRlKCkucGF5bG9hZDtcblxuXHRpZiAob01ldGFkYXRhSW5mbyAmJiBvQmluZGluZ0luZm8pIHtcblx0XHRvQmluZGluZ0luZm8ucGF0aCA9IG9CaW5kaW5nSW5mby5wYXRoIHx8IG9NZXRhZGF0YUluZm8uY29sbGVjdGlvblBhdGggfHwgYC8ke29NZXRhZGF0YUluZm8uY29sbGVjdGlvbk5hbWV9YDtcblx0XHRvQmluZGluZ0luZm8ubW9kZWwgPSBvQmluZGluZ0luZm8ubW9kZWwgfHwgb01ldGFkYXRhSW5mby5tb2RlbDtcblx0fVxuXG5cdGlmICghb0JpbmRpbmdJbmZvKSB7XG5cdFx0b0JpbmRpbmdJbmZvID0ge307XG5cdH1cblxuXHRjb25zdCBvRmlsdGVyID0gQ29yZS5ieUlkKG9NRENUYWJsZS5nZXRGaWx0ZXIoKSkgYXMgYW55LFxuXHRcdGJGaWx0ZXJFbmFibGVkID0gb01EQ1RhYmxlLmlzRmlsdGVyaW5nRW5hYmxlZCgpO1xuXHRsZXQgbUNvbmRpdGlvbnM6IGFueTtcblx0bGV0IG9Jbm5lckZpbHRlckluZm8sIG9PdXRlckZpbHRlckluZm86IGFueTtcblx0Y29uc3QgYUZpbHRlcnMgPSBbXTtcblx0Y29uc3QgdGFibGVQcm9wZXJ0aWVzID0gTWFjcm9zRGVsZWdhdGVVdGlsLmdldENhY2hlZFByb3BlcnRpZXMob01EQ1RhYmxlKTtcblxuXHQvL1RPRE86IGNvbnNpZGVyIGEgbWVjaGFuaXNtICgnRmlsdGVyTWVyZ2VVdGlsJyBvciBlbmhhbmNlICdGaWx0ZXJVdGlsJykgdG8gYWxsb3cgdGhlIGNvbm5lY3Rpb24gYmV0d2VlbiBkaWZmZXJlbnQgZmlsdGVycylcblx0aWYgKGJGaWx0ZXJFbmFibGVkKSB7XG5cdFx0bUNvbmRpdGlvbnMgPSBvTURDVGFibGUuZ2V0Q29uZGl0aW9ucygpO1xuXHRcdG9Jbm5lckZpbHRlckluZm8gPSBGaWx0ZXJVdGlsLmdldEZpbHRlckluZm8ob01EQ1RhYmxlLCBtQ29uZGl0aW9ucywgdGFibGVQcm9wZXJ0aWVzISwgW10pIGFzIGFueTtcblx0XHRpZiAob0lubmVyRmlsdGVySW5mby5maWx0ZXJzKSB7XG5cdFx0XHRhRmlsdGVycy5wdXNoKG9Jbm5lckZpbHRlckluZm8uZmlsdGVycyk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKG9GaWx0ZXIpIHtcblx0XHRtQ29uZGl0aW9ucyA9IG9GaWx0ZXIuZ2V0Q29uZGl0aW9ucygpO1xuXHRcdGlmIChtQ29uZGl0aW9ucykge1xuXHRcdFx0Y29uc3QgYVBhcmFtZXRlck5hbWVzID0gRGVsZWdhdGVVdGlsLmdldFBhcmFtZXRlck5hbWVzKG9GaWx0ZXIpO1xuXHRcdFx0Ly8gVGhlIHRhYmxlIHByb3BlcnRpZXMgbmVlZHMgdG8gdXBkYXRlZCB3aXRoIHRoZSBmaWx0ZXIgZmllbGQgaWYgbm8gU2VsZWN0aW9uZmllcmxkcyBhcmUgYW5ub3RhdGVkIGFuZCBub3QgcGFydCBhcyB2YWx1ZSBoZWxwIHBhcmFtZXRlclxuXHRcdFx0T0RhdGFUYWJsZURlbGVnYXRlLl91cGRhdGVQcm9wZXJ0eUluZm8odGFibGVQcm9wZXJ0aWVzLCBvTURDVGFibGUsIG1Db25kaXRpb25zLCBvTWV0YWRhdGFJbmZvKTtcblx0XHRcdG9PdXRlckZpbHRlckluZm8gPSBGaWx0ZXJVdGlsLmdldEZpbHRlckluZm8ob0ZpbHRlciwgbUNvbmRpdGlvbnMsIHRhYmxlUHJvcGVydGllcyEsIGFQYXJhbWV0ZXJOYW1lcyk7XG5cblx0XHRcdGlmIChvT3V0ZXJGaWx0ZXJJbmZvLmZpbHRlcnMpIHtcblx0XHRcdFx0YUZpbHRlcnMucHVzaChvT3V0ZXJGaWx0ZXJJbmZvLmZpbHRlcnMpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBzUGFyYW1ldGVyUGF0aCA9IERlbGVnYXRlVXRpbC5nZXRQYXJhbWV0ZXJzSW5mbyhvRmlsdGVyLCBtQ29uZGl0aW9ucyk7XG5cdFx0XHRpZiAoc1BhcmFtZXRlclBhdGgpIHtcblx0XHRcdFx0b0JpbmRpbmdJbmZvLnBhdGggPSBzUGFyYW1ldGVyUGF0aDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBnZXQgdGhlIGJhc2ljIHNlYXJjaFxuXHRcdG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggPSBDb21tb25VdGlscy5ub3JtYWxpemVTZWFyY2hUZXJtKG9GaWx0ZXIuZ2V0U2VhcmNoKCkpIHx8IHVuZGVmaW5lZDtcblx0fVxuXG5cdHRoaXMuX2FwcGx5RGVmYXVsdFNvcnRpbmcob0JpbmRpbmdJbmZvLCBvTURDVGFibGUuZ2V0RGVsZWdhdGUoKS5wYXlsb2FkKTtcblx0Ly8gYWRkIHNlbGVjdCB0byBvQmluZGluZ0luZm8gKEJDUCAyMTcwMTYzMDEyKVxuXHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VsZWN0ID0gdGFibGVQcm9wZXJ0aWVzPy5yZWR1Y2UoZnVuY3Rpb24gKHNRdWVyeTogc3RyaW5nLCBvUHJvcGVydHk6IGFueSkge1xuXHRcdC8vIE5hdmlnYXRpb24gcHJvcGVydGllcyAocmVwcmVzZW50ZWQgYnkgWC9ZKSBzaG91bGQgbm90IGJlIGFkZGVkIHRvICRzZWxlY3QuXG5cdFx0Ly8gVG9EbyA6IFRoZXkgc2hvdWxkIGJlIGFkZGVkIGFzICRleHBhbmQ9WCgkc2VsZWN0PVkpIGluc3RlYWRcblx0XHRpZiAob1Byb3BlcnR5LnBhdGggJiYgb1Byb3BlcnR5LnBhdGguaW5kZXhPZihcIi9cIikgPT09IC0xKSB7XG5cdFx0XHRzUXVlcnkgPSBzUXVlcnkgPyBgJHtzUXVlcnl9LCR7b1Byb3BlcnR5LnBhdGh9YCA6IG9Qcm9wZXJ0eS5wYXRoO1xuXHRcdH1cblx0XHRyZXR1cm4gc1F1ZXJ5O1xuXHR9LCBcIlwiKTtcblxuXHQvLyBBZGQgJGNvdW50XG5cdG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRjb3VudCA9IHRydWU7XG5cblx0Ly9JZiB0aGUgZW50aXR5IGlzIERyYWZ0RW5hYmxlZCBhZGQgYSBEcmFmdEZpbHRlclxuXHRpZiAoTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChvTURDVGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSwgb0JpbmRpbmdJbmZvLnBhdGgpKSB7XG5cdFx0YUZpbHRlcnMucHVzaChuZXcgRmlsdGVyKFwiSXNBY3RpdmVFbnRpdHlcIiwgRmlsdGVyT3BlcmF0b3IuRVEsIHRydWUpKTtcblx0fVxuXG5cdG9CaW5kaW5nSW5mby5maWx0ZXJzID0gbmV3IEZpbHRlcihhRmlsdGVycywgdHJ1ZSk7XG59O1xuXG5PRGF0YVRhYmxlRGVsZWdhdGUuZ2V0VHlwZVV0aWwgPSBmdW5jdGlvbiAoLypvUGF5bG9hZCovKSB7XG5cdHJldHVybiBUeXBlVXRpbDtcbn07XG5cbk9EYXRhVGFibGVEZWxlZ2F0ZS5fZ2V0TW9kZWwgPSBmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSkge1xuXHRjb25zdCBvTWV0YWRhdGFJbmZvID0gKG9UYWJsZS5nZXREZWxlZ2F0ZSgpIGFzIGFueSkucGF5bG9hZDtcblx0cmV0dXJuIG9UYWJsZS5nZXRNb2RlbChvTWV0YWRhdGFJbmZvLm1vZGVsKTtcbn07XG5cbi8qKlxuICogQXBwbGllcyBhIGRlZmF1bHQgc29ydCBvcmRlciBpZiBuZWVkZWQuIFRoaXMgaXMgb25seSB0aGUgY2FzZSBpZiB0aGUgcmVxdWVzdCBpcyBub3QgYSAkc2VhcmNoIHJlcXVlc3RcbiAqIChtZWFucyB0aGUgcGFyYW1ldGVyICRzZWFyY2ggb2YgdGhlIGJpbmRpbmdJbmZvIGlzIHVuZGVmaW5lZCkgYW5kIGlmIG5vdCBhbHJlYWR5IGEgc29ydCBvcmRlciBpcyBzZXQsXG4gKiBlLmcuIHZpYSBwcmVzZW50YXRpb24gdmFyaWFudCBvciBtYW51YWwgYnkgdGhlIHVzZXIuXG4gKlxuICogQHBhcmFtIG9CaW5kaW5nSW5mbyBUaGUgYmluZGluZ0luZm8gb2YgdGhlIHRhYmxlXG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgb2YgdGhlIFRhYmxlRGVsZWdhdGVcbiAqL1xuT0RhdGFUYWJsZURlbGVnYXRlLl9hcHBseURlZmF1bHRTb3J0aW5nID0gZnVuY3Rpb24gKG9CaW5kaW5nSW5mbzogYW55LCBvUGF5bG9hZDogYW55KSB7XG5cdGlmIChvQmluZGluZ0luZm8ucGFyYW1ldGVycyAmJiBvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoID09IHVuZGVmaW5lZCAmJiBvQmluZGluZ0luZm8uc29ydGVyICYmIG9CaW5kaW5nSW5mby5zb3J0ZXIubGVuZ3RoID09IDApIHtcblx0XHRjb25zdCBkZWZhdWx0U29ydFByb3BlcnR5TmFtZSA9IG9QYXlsb2FkID8gb1BheWxvYWQuZGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUgOiB1bmRlZmluZWQ7XG5cdFx0aWYgKGRlZmF1bHRTb3J0UHJvcGVydHlOYW1lKSB7XG5cdFx0XHRvQmluZGluZ0luZm8uc29ydGVyLnB1c2gobmV3IFNvcnRlcihkZWZhdWx0U29ydFByb3BlcnR5TmFtZSwgZmFsc2UpKTtcblx0XHR9XG5cdH1cbn07XG5cbi8qKlxuICogVXBkYXRlcyB0aGUgdGFibGUgcHJvcGVydGllcyB3aXRoIGZpbHRlciBmaWVsZCBpbmZvcy5cbiAqXG4gKiBAcGFyYW0gYVRhYmxlUHJvcGVydGllcyBBcnJheSB3aXRoIHRhYmxlIHByb3BlcnRpZXNcbiAqIEBwYXJhbSBvTURDVGFibGUgVGhlIE1EQ1RhYmxlIGluc3RhbmNlXG4gKiBAcGFyYW0gbUNvbmRpdGlvbnMgVGhlIGNvbmRpdGlvbnMgb2YgdGhlIHRhYmxlXG4gKiBAcGFyYW0gb01ldGFkYXRhSW5mbyBUaGUgbWV0YWRhdGEgaW5mbyBvZiB0aGUgZmlsdGVyIGZpZWxkXG4gKi9cbk9EYXRhVGFibGVEZWxlZ2F0ZS5fdXBkYXRlUHJvcGVydHlJbmZvID0gZnVuY3Rpb24gKFxuXHRhVGFibGVQcm9wZXJ0aWVzOiBhbnlbXSxcblx0b01EQ1RhYmxlOiBNRENUYWJsZSxcblx0bUNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIGFueT4sXG5cdG9NZXRhZGF0YUluZm86IGFueVxuKSB7XG5cdGNvbnN0IGFDb25kaXRpb25LZXkgPSBPYmplY3Qua2V5cyhtQ29uZGl0aW9ucyksXG5cdFx0b01ldGFNb2RlbCA9IG9NRENUYWJsZS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpITtcblx0YUNvbmRpdGlvbktleS5mb3JFYWNoKGZ1bmN0aW9uIChjb25kaXRpb25LZXk6IGFueSkge1xuXHRcdGlmIChcblx0XHRcdGFUYWJsZVByb3BlcnRpZXMuZmluZEluZGV4KGZ1bmN0aW9uICh0YWJsZVByb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHRhYmxlUHJvcGVydHkucGF0aCA9PT0gY29uZGl0aW9uS2V5O1xuXHRcdFx0fSkgPT09IC0xXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBvQ29sdW1uRGVmID0ge1xuXHRcdFx0XHRwYXRoOiBjb25kaXRpb25LZXksXG5cdFx0XHRcdHR5cGVDb25maWc6IG9NRENUYWJsZVxuXHRcdFx0XHRcdC5nZXRUeXBlVXRpbCgpXG5cdFx0XHRcdFx0LmdldFR5cGVDb25maWcob01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke29NZXRhZGF0YUluZm8uY29sbGVjdGlvbk5hbWV9LyR7Y29uZGl0aW9uS2V5fWApLiRUeXBlKVxuXHRcdFx0fTtcblx0XHRcdGFUYWJsZVByb3BlcnRpZXMucHVzaChvQ29sdW1uRGVmKTtcblx0XHR9XG5cdH0pO1xufTtcblxuT0RhdGFUYWJsZURlbGVnYXRlLnVwZGF0ZUJpbmRpbmcgPSBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55LCBvQmluZGluZzogYW55KSB7XG5cdGxldCBiTmVlZE1hbnVhbFJlZnJlc2ggPSBmYWxzZTtcblx0Y29uc3Qgb0ludGVybmFsQmluZGluZ0NvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0Y29uc3Qgc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5ID0gXCJwZW5kaW5nTWFudWFsQmluZGluZ1VwZGF0ZVwiO1xuXHRjb25zdCBiUGVuZGluZ01hbnVhbFVwZGF0ZSA9IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0Py5nZXRQcm9wZXJ0eShzTWFudWFsVXBkYXRlUHJvcGVydHlLZXkpO1xuXHRsZXQgb1Jvd0JpbmRpbmcgPSBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXG5cdC8vb0JpbmRpbmc9bnVsbCBtZWFucyB0aGF0IGEgcmViaW5kaW5nIG5lZWRzIHRvIGJlIGZvcmNlZCB2aWEgdXBkYXRlQmluZGluZyBpbiBtZGMgVGFibGVEZWxlZ2F0ZVxuXHRUYWJsZURlbGVnYXRlLnVwZGF0ZUJpbmRpbmcuYXBwbHkoT0RhdGFUYWJsZURlbGVnYXRlLCBbb1RhYmxlLCBvQmluZGluZ0luZm8sIG9CaW5kaW5nXSk7XG5cdC8vZ2V0IHJvdyBiaW5kaW5nIGFmdGVyIHJlYmluZCBmcm9tIFRhYmxlRGVsZWdhdGUudXBkYXRlQmluZGluZyBpbiBjYXNlIG9CaW5kaW5nIHdhcyBudWxsXG5cdGlmICghb1Jvd0JpbmRpbmcpIHtcblx0XHRvUm93QmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdH1cblx0aWYgKG9Sb3dCaW5kaW5nKSB7XG5cdFx0LyoqXG5cdFx0ICogTWFudWFsIHJlZnJlc2ggaWYgZmlsdGVycyBhcmUgbm90IGNoYW5nZWQgYnkgYmluZGluZy5yZWZyZXNoKCkgc2luY2UgdXBkYXRpbmcgdGhlIGJpbmRpbmdJbmZvXG5cdFx0ICogaXMgbm90IGVub3VnaCB0byB0cmlnZ2VyIGEgYmF0Y2ggcmVxdWVzdC5cblx0XHQgKiBSZW1vdmluZyBjb2x1bW5zIGNyZWF0ZXMgb25lIGJhdGNoIHJlcXVlc3QgdGhhdCB3YXMgbm90IGV4ZWN1dGVkIGJlZm9yZVxuXHRcdCAqL1xuXHRcdGNvbnN0IG9sZEZpbHRlcnMgPSBvUm93QmluZGluZy5nZXRGaWx0ZXJzKFwiQXBwbGljYXRpb25cIik7XG5cdFx0Yk5lZWRNYW51YWxSZWZyZXNoID1cblx0XHRcdGRlZXBFcXVhbChvQmluZGluZ0luZm8uZmlsdGVycywgb2xkRmlsdGVyc1swXSkgJiZcblx0XHRcdG9Sb3dCaW5kaW5nLmdldFF1ZXJ5T3B0aW9uc0Zyb21QYXJhbWV0ZXJzKCkuJHNlYXJjaCA9PT0gb0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaCAmJlxuXHRcdFx0IWJQZW5kaW5nTWFudWFsVXBkYXRlO1xuXHR9XG5cblx0aWYgKGJOZWVkTWFudWFsUmVmcmVzaCAmJiBvVGFibGUuZ2V0RmlsdGVyKCkpIHtcblx0XHRvSW50ZXJuYWxCaW5kaW5nQ29udGV4dD8uc2V0UHJvcGVydHkoc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5LCB0cnVlKTtcblx0XHRvUm93QmluZGluZ1xuXHRcdFx0LnJlcXVlc3RSZWZyZXNoKG9Sb3dCaW5kaW5nLmdldEdyb3VwSWQoKSlcblx0XHRcdC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0b0ludGVybmFsQmluZGluZ0NvbnRleHQ/LnNldFByb3BlcnR5KHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSwgZmFsc2UpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVmcmVzaGluZyBhIGZpbHRlckJhciBWSCB0YWJsZVwiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cblx0b1RhYmxlLmZpcmVFdmVudChcImJpbmRpbmdVcGRhdGVkXCIpO1xuXHQvL25vIG5lZWQgdG8gY2hlY2sgZm9yIHNlbWFudGljIHRhcmdldHMgaGVyZSBzaW5jZSB3ZSBhcmUgaW4gYSBWSCBhbmQgZG9uJ3Qgd2FudCB0byBhbGxvdyBmdXJ0aGVyIG5hdmlnYXRpb25cbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHNpbXBsZSBwcm9wZXJ0eSBmb3IgZWFjaCBpZGVudGlmaWVkIGNvbXBsZXggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHByb3BlcnRpZXNUb0JlQ3JlYXRlZCBJZGVudGlmaWVkIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0gZXhpc3RpbmdDb2x1bW5zIFRoZSBsaXN0IG9mIGNvbHVtbnMgY3JlYXRlZCBmb3IgcHJvcGVydGllcyBkZWZpbmVkIG9uIHRoZSBWYWx1ZSBMaXN0LlxuICogQHBhcmFtIG9Tb3J0UmVzdHJpY3Rpb25zSW5mbyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgc29ydCByZXN0cmljdGlvbiBpbmZvcm1hdGlvblxuICogQHBhcmFtIG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb25cbiAqIEByZXR1cm5zIFRoZSBhcnJheSBvZiBwcm9wZXJ0aWVzIGNyZWF0ZWQuXG4gKi9cbmZ1bmN0aW9uIF9jcmVhdGVSZWxhdGVkUHJvcGVydGllcyhcblx0cHJvcGVydGllc1RvQmVDcmVhdGVkOiBSZWNvcmQ8c3RyaW5nLCBQcm9wZXJ0eT4sXG5cdGV4aXN0aW5nQ29sdW1uczogVmFsdWVIZWxwVGFibGVDb2x1bW5bXSxcblx0b1NvcnRSZXN0cmljdGlvbnNJbmZvOiBhbnksXG5cdG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnlcbik6IFZhbHVlSGVscFRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCByZWxhdGVkUHJvcGVydHlOYW1lTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge30sXG5cdFx0cmVsYXRlZENvbHVtbnM6IFZhbHVlSGVscFRhYmxlQ29sdW1uW10gPSBbXTtcblx0T2JqZWN0LmtleXMocHJvcGVydGllc1RvQmVDcmVhdGVkKS5mb3JFYWNoKChwYXRoKSA9PiB7XG5cdFx0Y29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzVG9CZUNyZWF0ZWRbcGF0aF0sXG5cdFx0XHRyZWxhdGVkQ29sdW1uID0gZXhpc3RpbmdDb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4gY29sdW1uLnBhdGggPT09IHBhdGgpOyAvLyBDb21wbGV4IHByb3BlcnRpZXMgZG9lc24ndCBnZXQgcGF0aCBzbyBvbmx5IHNpbXBsZSBjb2x1bW4gYXJlIGZvdW5kXG5cdFx0aWYgKCFyZWxhdGVkQ29sdW1uKSB7XG5cdFx0XHRjb25zdCBuZXdOYW1lID0gYFByb3BlcnR5Ojoke3BhdGh9YDtcblx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbcGF0aF0gPSBuZXdOYW1lO1xuXHRcdFx0Y29uc3QgdmFsdWVIZWxwVGFibGVDb2x1bW46IFZhbHVlSGVscFRhYmxlQ29sdW1uID0ge1xuXHRcdFx0XHRuYW1lOiBuZXdOYW1lLFxuXHRcdFx0XHRsYWJlbDogZ2V0TGFiZWwocHJvcGVydHkpLFxuXHRcdFx0XHRwYXRoOiBwYXRoLFxuXHRcdFx0XHRzb3J0YWJsZTogX2lzU29ydGFibGVQcm9wZXJ0eShvU29ydFJlc3RyaWN0aW9uc0luZm8sIHByb3BlcnR5KSxcblx0XHRcdFx0ZmlsdGVyYWJsZTogX2lzRmlsdGVyYWJsZVByb3BlcnR5KG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvLCBwcm9wZXJ0eSlcblx0XHRcdH07XG5cdFx0XHR2YWx1ZUhlbHBUYWJsZUNvbHVtbi5tYXhDb25kaXRpb25zID0gX2dldFByb3BlcnR5TWF4Q29uZGl0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbywgdmFsdWVIZWxwVGFibGVDb2x1bW4pO1xuXHRcdFx0aWYgKGlzVHlwZUZpbHRlcmFibGUocHJvcGVydHkudHlwZSBhcyBrZXlvZiB0eXBlb2YgRGVmYXVsdFR5cGVGb3JFZG1UeXBlKSkge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eVR5cGVDb25maWcgPSBmZXRjaFR5cGVDb25maWcocHJvcGVydHkpO1xuXHRcdFx0XHR2YWx1ZUhlbHBUYWJsZUNvbHVtbi50eXBlQ29uZmlnID0gVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGVDb25maWcudHlwZSxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGVDb25maWcuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGVDb25maWcuY29uc3RyYWludHNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdHJlbGF0ZWRDb2x1bW5zLnB1c2godmFsdWVIZWxwVGFibGVDb2x1bW4pO1xuXHRcdH1cblx0fSk7XG5cdC8vIFRoZSBwcm9wZXJ0eSAnbmFtZScgaGFzIGJlZW4gcHJlZml4ZWQgd2l0aCAnUHJvcGVydHk6OicgZm9yIHVuaXF1ZW5lc3MuXG5cdC8vIFVwZGF0ZSB0aGUgc2FtZSBpbiBvdGhlciBwcm9wZXJ0eUluZm9zW10gcmVmZXJlbmNlcyB3aGljaCBwb2ludCB0byB0aGlzIHByb3BlcnR5LlxuXHRleGlzdGluZ0NvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0aWYgKGNvbHVtbi5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRjb2x1bW4ucHJvcGVydHlJbmZvcyA9IGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5tYXAoKGNvbHVtbk5hbWUpID0+IHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbY29sdW1uTmFtZV0gPz8gY29sdW1uTmFtZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHJlbGF0ZWRDb2x1bW5zO1xufVxuLyoqXG4gKiBJZGVudGlmaWVzIGlmIHRoZSBnaXZlbiBwcm9wZXJ0eSBpcyBzb3J0YWJsZSBiYXNlZCBvbiB0aGUgc29ydCByZXN0cmljdGlvbiBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcGFyYW0gc29ydFJlc3RyaWN0aW9uc0luZm8gVGhlIHNvcnQgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb24gZnJvbSB0aGUgcmVzdHJpY3Rpb24gYW5ub3RhdGlvbi5cbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5LlxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBnaXZlbiBwcm9wZXJ0eSBpcyBzb3J0YWJsZS5cbiAqL1xuZnVuY3Rpb24gX2lzU29ydGFibGVQcm9wZXJ0eShzb3J0UmVzdHJpY3Rpb25zSW5mbzogU29ydFJlc3RyaWN0aW9uc0luZm9UeXBlLCBwcm9wZXJ0eTogVmFsdWVIZWxwVGFibGVDb2x1bW4pOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIHByb3BlcnR5LnBhdGggJiYgc29ydFJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3Byb3BlcnR5LnBhdGhdXG5cdFx0PyBzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bcHJvcGVydHkucGF0aF0uc29ydGFibGVcblx0XHQ6IHByb3BlcnR5LnNvcnRhYmxlO1xufVxuXG4vKipcbiAqIElkZW50aWZpZXMgaWYgdGhlIGdpdmVuIHByb3BlcnR5IGlzIGZpbHRlcmFibGUgYmFzZWQgb24gdGhlIHNvcnQgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb24uXG4gKlxuICogQHBhcmFtIG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvIFRoZSBmaWx0ZXIgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb24gZnJvbSB0aGUgcmVzdHJpY3Rpb24gYW5ub3RhdGlvbi5cbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5LlxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBnaXZlbiBwcm9wZXJ0eSBpcyBmaWx0ZXJhYmxlLlxuICovXG5mdW5jdGlvbiBfaXNGaWx0ZXJhYmxlUHJvcGVydHkob0ZpbHRlclJlc3RyaWN0aW9uc0luZm86IGFueSwgcHJvcGVydHk6IFZhbHVlSGVscFRhYmxlQ29sdW1uKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBwcm9wZXJ0eS5wYXRoICYmIG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvW3Byb3BlcnR5LnBhdGhdXG5cdFx0PyBvRmlsdGVyUmVzdHJpY3Rpb25zSW5mb1twcm9wZXJ0eS5wYXRoXS5maWx0ZXJhYmxlXG5cdFx0OiBwcm9wZXJ0eS5maWx0ZXJhYmxlO1xufVxuXG4vKipcbiAqIElkZW50aWZpZXMgdGhlIG1heENvbmRpdGlvbnMgZm9yIGEgZ2l2ZW4gcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvIFRoZSBmaWx0ZXIgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb24gZnJvbSB0aGUgcmVzdHJpY3Rpb24gYW5ub3RhdGlvbi5cbiAqIEBwYXJhbSB2YWx1ZUhlbHBDb2x1bW4gVGhlIHRhcmdldCBwcm9wZXJ0eS5cbiAqIEByZXR1cm5zIGAtMWAgb3IgYDFgIGlmIHRoZSBwcm9wZXJ0eSBpcyBhIE11bHRpVmFsdWVGaWx0ZXJFeHByZXNzaW9uLlxuICovXG5mdW5jdGlvbiBfZ2V0UHJvcGVydHlNYXhDb25kaXRpb25zKG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnksIHZhbHVlSGVscENvbHVtbjogVmFsdWVIZWxwVGFibGVDb2x1bW4pOiBudW1iZXIge1xuXHRyZXR1cm4gdmFsdWVIZWxwQ29sdW1uLnBhdGggJiZcblx0XHRPRGF0YU1ldGFNb2RlbFV0aWwuaXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bdmFsdWVIZWxwQ29sdW1uLnBhdGhdKVxuXHRcdD8gLTFcblx0XHQ6IDE7XG59XG5cbi8qKlxuICogSWRlbnRpZmllcyB0aGUgYWRkaXRpb25hbCBwcm9wZXJ0eSB3aGljaCByZWZlcmVuY2VzIHRvIHRoZSB1bml0LCB0aW1lem9uZSwgdGV4dEFycmFuZ2VtZW50IG9yIGN1cnJlbmN5LlxuICpcbiAqIEBwYXJhbSBkYXRhTW9kZWxQcm9wZXJ0eVBhdGggVGhlIG1vZGVsIG9iamVjdCBwYXRoIG9mIHRoZSBwcm9wZXJ0eS5cbiAqIEByZXR1cm5zIFRoZSBhZGRpdGlvbmFsIHByb3BlcnR5LlxuICovXG5cbmZ1bmN0aW9uIF9nZXRBZGRpdGlvbmFsUHJvcGVydHkoZGF0YU1vZGVsUHJvcGVydHlQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IG9Qcm9wZXJ0eSA9IGRhdGFNb2RlbFByb3BlcnR5UGF0aC50YXJnZXRPYmplY3Q7XG5cdGNvbnN0IGFkZGl0aW9uYWxQcm9wZXJ0eVBhdGggPVxuXHRcdGdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoKG9Qcm9wZXJ0eSkgfHxcblx0XHRnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eVBhdGgob1Byb3BlcnR5KSB8fFxuXHRcdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoKG9Qcm9wZXJ0eSkgfHxcblx0XHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eVBhdGgob1Byb3BlcnR5KTtcblx0aWYgKCFhZGRpdGlvbmFsUHJvcGVydHlQYXRoKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRjb25zdCBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHkgPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxQcm9wZXJ0eVBhdGgsIGFkZGl0aW9uYWxQcm9wZXJ0eVBhdGgpO1xuXG5cdC8vQWRkaXRpb25hbCBQcm9wZXJ0eSBjb3VsZCByZWZlciB0byBhIG5hdmlnYXRpb24gcHJvcGVydHksIGtlZXAgdGhlIG5hbWUgYW5kIHBhdGggYXMgbmF2aWdhdGlvbiBwcm9wZXJ0eVxuXHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHkgPSBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHkudGFyZ2V0T2JqZWN0O1xuXHRpZiAoIWFkZGl0aW9uYWxQcm9wZXJ0eSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIGRhdGFNb2RlbEFkZGl0aW9uYWxQcm9wZXJ0eTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgT0RhdGFUYWJsZURlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7RUE2Q0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUEsa0JBQWtCLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFQyxhQUFhLENBQUM7RUFFM0RILGtCQUFrQixDQUFDSSxlQUFlLEdBQUcsVUFBVUMsS0FBWSxFQUFFO0lBQzVELE1BQU1DLEtBQUssR0FBRyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0YsS0FBSyxDQUFDO0lBQ25DLElBQUlHLG1CQUFtQjtJQUN2QixJQUFJLENBQUNGLEtBQUssRUFBRTtNQUNYRSxtQkFBbUIsR0FBRyxJQUFJQyxPQUFPLENBQUVDLE9BQU8sSUFBSztRQUM5Q0wsS0FBSyxDQUFDTSx3QkFBd0IsQ0FDN0I7VUFDQ0MsUUFBUSxFQUFFRjtRQUNYLENBQUMsRUFDREcsb0JBQW9CLEVBQ3BCLElBQUksQ0FDSjtNQUNGLENBQUMsQ0FBQyxDQUFDQyxJQUFJLENBQUVDLFNBQVMsSUFBSztRQUN0QixPQUFPLElBQUksQ0FBQ0Msb0JBQW9CLENBQUNYLEtBQUssRUFBRVUsU0FBUyxDQUFDO01B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