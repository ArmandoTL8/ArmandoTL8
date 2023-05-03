/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/fe/core/CommonUtils", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/ODataMetaModelUtil", "sap/m/table/Util", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/dom/units/Rem", "sap/ui/mdc/valuehelp/content/Conditions", "sap/ui/mdc/valuehelp/content/MDCTable", "sap/ui/mdc/valuehelp/content/MTable", "sap/ui/model/json/JSONModel"], function (Log, ObjectPath, CommonUtils, PropertyHelper, UIFormatters, ODataMetaModelUtil, Util, Fragment, XMLPreprocessor, XMLTemplateProcessor, Rem, Conditions, MDCTable, MTable, JSONModel) {
  "use strict";

  var _exports = {};
  var getTypeConfig = UIFormatters.getTypeConfig;
  var getDisplayMode = UIFormatters.getDisplayMode;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedTextProperty = PropertyHelper.getAssociatedTextProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var Level = Log.Level;
  const columnNotAlreadyDefined = (columnDefs, vhKey) => !columnDefs.some(column => column.path === vhKey);
  const AnnotationLabel = "@com.sap.vocabularies.Common.v1.Label",
    AnnotationText = "@com.sap.vocabularies.Common.v1.Text",
    AnnotationTextUITextArrangement = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement",
    AnnotationValueListParameterIn = "com.sap.vocabularies.Common.v1.ValueListParameterIn",
    AnnotationValueListParameterConstant = "com.sap.vocabularies.Common.v1.ValueListParameterConstant",
    AnnotationValueListParameterOut = "com.sap.vocabularies.Common.v1.ValueListParameterOut",
    AnnotationValueListParameterInOut = "com.sap.vocabularies.Common.v1.ValueListParameterInOut",
    AnnotationValueListWithFixedValues = "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues";
  _exports.AnnotationLabel = AnnotationLabel;
  _exports.AnnotationValueListWithFixedValues = AnnotationValueListWithFixedValues;
  _exports.AnnotationValueListParameterInOut = AnnotationValueListParameterInOut;
  _exports.AnnotationValueListParameterOut = AnnotationValueListParameterOut;
  _exports.AnnotationValueListParameterConstant = AnnotationValueListParameterConstant;
  _exports.AnnotationValueListParameterIn = AnnotationValueListParameterIn;
  _exports.AnnotationTextUITextArrangement = AnnotationTextUITextArrangement;
  _exports.AnnotationText = AnnotationText;
  function _getDefaultSortPropertyName(valueListInfo) {
    let sortFieldName;
    const metaModel = valueListInfo.$model.getMetaModel();
    const entitySetAnnotations = metaModel.getObject(`/${valueListInfo.CollectionPath}@`) || {};
    const sortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(entitySetAnnotations);
    const foundElement = valueListInfo.Parameters.find(function (element) {
      return (element.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterInOut" || element.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterOut" || element.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly") && !(metaModel.getObject(`/${valueListInfo.CollectionPath}/${element.ValueListProperty}@com.sap.vocabularies.UI.v1.Hidden`) === true);
    });
    if (foundElement) {
      if (metaModel.getObject(`/${valueListInfo.CollectionPath}/${foundElement.ValueListProperty}@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember`) === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        sortFieldName = metaModel.getObject(`/${valueListInfo.CollectionPath}/${foundElement.ValueListProperty}@com.sap.vocabularies.Common.v1.Text/$Path`);
      } else {
        sortFieldName = foundElement.ValueListProperty;
      }
    }
    if (sortFieldName && (!sortRestrictionsInfo.propertyInfo[sortFieldName] || sortRestrictionsInfo.propertyInfo[sortFieldName].sortable)) {
      return sortFieldName;
    } else {
      return undefined;
    }
  }
  function _redundantDescription(oVLParameter, aColumnInfo) {
    const oColumnInfo = aColumnInfo.find(function (columnInfo) {
      return oVLParameter.ValueListProperty === columnInfo.textColumnName;
    });
    if (oVLParameter.ValueListProperty === (oColumnInfo === null || oColumnInfo === void 0 ? void 0 : oColumnInfo.textColumnName) && !oColumnInfo.keyColumnHidden && oColumnInfo.keyColumnDisplayFormat !== "Value") {
      return true;
    }
    return undefined;
  }
  function _hasImportanceHigh(oValueListContext) {
    return oValueListContext.Parameters.some(function (oParameter) {
      return oParameter["@com.sap.vocabularies.UI.v1.Importance"] && oParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High";
    });
  }
  function _build$SelectString(control) {
    const oViewData = control.getModel("viewData");
    if (oViewData) {
      const oData = oViewData.getData();
      if (oData) {
        const aColumns = oData.columns;
        if (aColumns) {
          return aColumns.reduce(function (sQuery, oProperty) {
            // Navigation properties (represented by X/Y) should not be added to $select.
            // TODO : They should be added as $expand=X($select=Y) instead
            if (oProperty.path && oProperty.path.indexOf("/") === -1) {
              sQuery = sQuery ? `${sQuery},${oProperty.path}` : oProperty.path;
            }
            return sQuery;
          }, undefined);
        }
      }
    }
    return undefined;
  }
  function _getValueHelpColumnDisplayFormat(oPropertyAnnotations, isValueHelpWithFixedValues) {
    const sDisplayMode = CommonUtils.computeDisplayMode(oPropertyAnnotations, undefined);
    const oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
    const oTextArrangementAnnotation = oTextAnnotation && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"];
    if (isValueHelpWithFixedValues) {
      return oTextAnnotation && typeof oTextAnnotation !== "string" && oTextAnnotation.$Path ? sDisplayMode : "Value";
    } else {
      // Only explicit defined TextArrangements in a Value Help with Dialog are considered
      return oTextArrangementAnnotation ? sDisplayMode : "Value";
    }
  }
  const ValueListHelper = {
    getValueListCollectionEntitySet: function (oValueListContext) {
      const mValueList = oValueListContext.getObject();
      return mValueList.$model.getMetaModel().createBindingContext(`/${mValueList.CollectionPath}`);
    },
    getTableDelegate: function (oValueList) {
      let sDefaultSortPropertyName = _getDefaultSortPropertyName(oValueList);
      if (sDefaultSortPropertyName) {
        sDefaultSortPropertyName = `'${sDefaultSortPropertyName}'`;
      }
      return "{name: 'sap/fe/macros/internal/valuehelp/TableDelegate', payload: {collectionName: '" + oValueList.CollectionPath + "'" + (sDefaultSortPropertyName ? ", defaultSortPropertyName: " + sDefaultSortPropertyName : "") + "}}";
    },
    getSortConditionsFromPresentationVariant: function (valueListInfo, isSuggestion) {
      const presentationVariantQualifier = valueListInfo.PresentationVariantQualifier === "" ? "" : `#${valueListInfo.PresentationVariantQualifier}`,
        presentationVariantPath = `/${valueListInfo.CollectionPath}/@com.sap.vocabularies.UI.v1.PresentationVariant${presentationVariantQualifier}`;
      const presentationVariant = valueListInfo.$model.getMetaModel().getObject(presentationVariantPath);
      if (presentationVariant && presentationVariant.SortOrder) {
        const sortConditions = {
          sorters: []
        };
        if (isSuggestion) {
          presentationVariant.SortOrder.forEach(function (condition) {
            const sorter = {};
            sorter.path = condition.Property.$PropertyPath;
            if (condition.Descending) {
              sorter.descending = true;
            } else {
              sorter.ascending = true;
            }
            sortConditions.sorters.push(sorter);
          });
          return `sorter: ${JSON.stringify(sortConditions.sorters)}`;
        } else {
          presentationVariant.SortOrder.forEach(function (condition) {
            const sorter = {};
            sorter.name = condition.Property.$PropertyPath;
            if (condition.Descending) {
              sorter.descending = true;
            } else {
              sorter.ascending = true;
            }
            sortConditions.sorters.push(sorter);
          });
          return JSON.stringify(sortConditions);
        }
      }
      return undefined;
    },
    getPropertyPath: function (oParameters) {
      return !oParameters.UnboundAction ? `${oParameters.EntityTypePath}/${oParameters.Action}/${oParameters.Property}` : `/${oParameters.Action.substring(oParameters.Action.lastIndexOf(".") + 1)}/${oParameters.Property}`;
    },
    getValueListProperty: function (oPropertyContext) {
      const oValueListModel = oPropertyContext.getModel();
      const mValueList = oValueListModel.getObject("/");
      return mValueList.$model.getMetaModel().createBindingContext(`/${mValueList.CollectionPath}/${oPropertyContext.getObject()}`);
    },
    // This function is used for value help m-table and mdc-table
    getColumnVisibility: function (oValueList, oVLParameter, oSource) {
      const isDropDownList = oSource && !!oSource.valueHelpWithFixedValues,
        oColumnInfo = oSource.columnInfo,
        isVisible = !_redundantDescription(oVLParameter, oColumnInfo.columnInfos),
        isDialogTable = oColumnInfo.isDialogTable;
      if (isDropDownList || !isDropDownList && isDialogTable || !isDropDownList && !_hasImportanceHigh(oValueList)) {
        const columnWithHiddenAnnotation = oColumnInfo.columnInfos.find(function (columnInfo) {
          return oVLParameter.ValueListProperty === columnInfo.columnName && columnInfo.hasHiddenAnnotation === true;
        });
        return !columnWithHiddenAnnotation ? isVisible : false;
      } else if (!isDropDownList && _hasImportanceHigh(oValueList)) {
        return oVLParameter && oVLParameter["@com.sap.vocabularies.UI.v1.Importance"] && oVLParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High" ? true : false;
      }
      return true;
    },
    getColumnVisibilityInfo: function (oValueList, sPropertyFullPath, bIsDropDownListe, isDialogTable) {
      const oMetaModel = oValueList.$model.getMetaModel();
      const aColumnInfos = [];
      const oColumnInfos = {
        isDialogTable: isDialogTable,
        columnInfos: aColumnInfos
      };
      oValueList.Parameters.forEach(function (oParameter) {
        const oPropertyAnnotations = oMetaModel.getObject(`/${oValueList.CollectionPath}/${oParameter.ValueListProperty}@`);
        const oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
        let columnInfo = {};
        if (oTextAnnotation) {
          columnInfo = {
            keyColumnHidden: oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false,
            keyColumnDisplayFormat: oTextAnnotation && _getValueHelpColumnDisplayFormat(oPropertyAnnotations, bIsDropDownListe),
            textColumnName: oTextAnnotation && oTextAnnotation.$Path,
            columnName: oParameter.ValueListProperty,
            hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
          };
        } else if (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"]) {
          columnInfo = {
            columnName: oParameter.ValueListProperty,
            hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
          };
        }
        oColumnInfos.columnInfos.push(columnInfo);
      });
      return oColumnInfos;
    },
    getTableItemsParameters: function (valueListInfo, requestGroupId, isSuggestion, isValueHelpWithFixedValues) {
      const itemParameters = [`path: '/${valueListInfo.CollectionPath}'`];

      // add select to oBindingInfo (BCP 2180255956 / 2170163012)
      const selectString = _build$SelectString(this);
      if (requestGroupId) {
        const selectStringPart = selectString ? `, '${selectString}'` : "";
        itemParameters.push(`parameters: {$$groupId: '${requestGroupId}'${selectStringPart}}`);
      } else if (selectString) {
        itemParameters.push(`parameters: {$select: '${selectString}'}`);
      }
      const isSuspended = valueListInfo.Parameters.some(function (oParameter) {
        return isSuggestion || oParameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterIn";
      });
      itemParameters.push(`suspended: ${isSuspended}`);
      if (!isValueHelpWithFixedValues) {
        itemParameters.push("length: 10");
      }
      const sortConditionsFromPresentationVariant = ValueListHelper.getSortConditionsFromPresentationVariant(valueListInfo, isSuggestion);
      if (sortConditionsFromPresentationVariant) {
        itemParameters.push(sortConditionsFromPresentationVariant);
      } else if (isValueHelpWithFixedValues) {
        const defaultSortPropertyName = _getDefaultSortPropertyName(valueListInfo);
        if (defaultSortPropertyName) {
          itemParameters.push(`sorter: [{path: '${defaultSortPropertyName}', ascending: true}]`);
        }
      }
      return "{" + itemParameters.join(", ") + "}";
    },
    // Is needed for "external" representation in qunit
    hasImportance: function (oValueListContext) {
      return _hasImportanceHigh(oValueListContext.getObject()) ? "Importance/High" : "None";
    },
    // Is needed for "external" representation in qunit
    getMinScreenWidth: function (oValueList) {
      return _hasImportanceHigh(oValueList) ? "{= ${_VHUI>/minScreenWidth}}" : "416px";
    },
    /**
     * Retrieves the column width for a given property.
     *
     * @param propertyPath The propertyPath
     * @returns The width as a string.
     */
    getColumnWidth: function (propertyPath) {
      var _property$annotations, _property$annotations2, _textAnnotation$annot, _textAnnotation$annot2, _textAnnotation$annot3, _property$annotations3, _property$annotations4, _property$annotations5;
      const property = propertyPath.targetObject;
      let relatedProperty = [property];
      // The additional property could refer to the text, currency, unit or timezone
      const additionalProperty = getAssociatedTextProperty(property) || getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property) || getAssociatedTimezoneProperty(property),
        textAnnotation = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Text,
        textArrangement = textAnnotation === null || textAnnotation === void 0 ? void 0 : (_textAnnotation$annot = textAnnotation.annotations) === null || _textAnnotation$annot === void 0 ? void 0 : (_textAnnotation$annot2 = _textAnnotation$annot.UI) === null || _textAnnotation$annot2 === void 0 ? void 0 : (_textAnnotation$annot3 = _textAnnotation$annot2.TextArrangement) === null || _textAnnotation$annot3 === void 0 ? void 0 : _textAnnotation$annot3.toString(),
        label = (_property$annotations3 = property.annotations) === null || _property$annotations3 === void 0 ? void 0 : (_property$annotations4 = _property$annotations3.Common) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.Label) === null || _property$annotations5 === void 0 ? void 0 : _property$annotations5.toString(),
        displayMode = textArrangement && getDisplayMode(propertyPath);
      if (additionalProperty) {
        if (displayMode === "Description") {
          relatedProperty = [additionalProperty];
        } else if (!textAnnotation || displayMode && displayMode !== "Value") {
          relatedProperty.push(additionalProperty);
        }
      }
      let size = 0;
      const instances = [];
      relatedProperty.forEach(prop => {
        const propertyTypeConfig = getTypeConfig(prop, undefined);
        const PropertyODataConstructor = ObjectPath.get(propertyTypeConfig.type);
        if (PropertyODataConstructor) {
          instances.push(new PropertyODataConstructor(propertyTypeConfig.formatOptions, propertyTypeConfig.constraints));
        }
      });
      const sWidth = Util.calcColumnWidth(instances, label);
      size = sWidth ? parseFloat(sWidth.replace("rem", "")) : 0;
      if (size === 0) {
        Log.error(`Cannot compute the column width for property: ${property.name}`);
      }
      return size <= 20 ? size.toString() + "rem" : "20rem";
    },
    getOutParameterPaths: function (aParameters) {
      let sPath = "";
      aParameters.forEach(function (oParameter) {
        if (oParameter.$Type.endsWith("Out")) {
          sPath += `{${oParameter.ValueListProperty}}`;
        }
      });
      return sPath;
    },
    entityIsSearchable: function (propertyAnnotations, collectionAnnotations) {
      var _propertyAnnotations$, _collectionAnnotation;
      const searchSupported = (_propertyAnnotations$ = propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"]) === null || _propertyAnnotations$ === void 0 ? void 0 : _propertyAnnotations$.SearchSupported,
        searchable = (_collectionAnnotation = collectionAnnotations["@Org.OData.Capabilities.V1.SearchRestrictions"]) === null || _collectionAnnotation === void 0 ? void 0 : _collectionAnnotation.Searchable;
      if (searchable === undefined && searchSupported === false || searchable === true && searchSupported === false || searchable === false) {
        return false;
      }
      return true;
    },
    /**
     * Returns the condition path required for the condition model.
     * For e.g. <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
     *
     * @param metaModel The metamodel instance
     * @param entitySet The entity set path
     * @param propertyPath The property path
     * @returns The formatted condition path
     * @private
     */
    _getConditionPath: function (metaModel, entitySet, propertyPath) {
      // (see also: sap/fe/core/converters/controls/ListReport/FilterBar.ts)
      const parts = propertyPath.split("/");
      let conditionPath = "",
        partialPath;
      while (parts.length) {
        let part = parts.shift();
        partialPath = partialPath ? `${partialPath}/${part}` : part;
        const property = metaModel.getObject(`${entitySet}/${partialPath}`);
        if (property && property.$kind === "NavigationProperty" && property.$isCollection) {
          part += "*";
        }
        conditionPath = conditionPath ? `${conditionPath}/${part}` : part;
      }
      return conditionPath;
    },
    /**
     * Returns array of column definitions corresponding to properties defined as Selection Fields on the CollectionPath entity set in a ValueHelp.
     *
     * @param metaModel The metamodel instance
     * @param entitySet The entity set path
     * @returns Array of column definitions
     * @private
     */
    _getColumnDefinitionFromSelectionFields: function (metaModel, entitySet) {
      const columnDefs = [],
        //selectionFields = metaModel.getObject(entitySet + "/@com.sap.vocabularies.UI.v1.SelectionFields") as SelectionField[] | undefined;
        entityTypeAnnotations = metaModel.getObject(`${entitySet}/@`),
        selectionFields = entityTypeAnnotations["@com.sap.vocabularies.UI.v1.SelectionFields"];
      if (selectionFields) {
        selectionFields.forEach(function (selectionField) {
          const selectionFieldPath = `${entitySet}/${selectionField.$PropertyPath}`,
            conditionPath = ValueListHelper._getConditionPath(metaModel, entitySet, selectionField.$PropertyPath),
            propertyAnnotations = metaModel.getObject(`${selectionFieldPath}@`),
            columnDef = {
              path: conditionPath,
              label: propertyAnnotations[AnnotationLabel] || selectionFieldPath,
              sortable: true,
              filterable: CommonUtils.isPropertyFilterable(metaModel, entitySet, selectionField.$PropertyPath, false),
              $Type: metaModel.getObject(selectionFieldPath).$Type
            };
          columnDefs.push(columnDef);
        });
      }
      return columnDefs;
    },
    _mergeColumnDefinitionsFromProperties: function (columnDefs, valueListInfo, valueListProperty, property, propertyAnnotations) {
      var _propertyAnnotations$2;
      let columnPath = valueListProperty,
        columnPropertyType = property.$Type;
      const label = propertyAnnotations[AnnotationLabel] || columnPath,
        textAnnotation = propertyAnnotations[AnnotationText];
      if (textAnnotation && ((_propertyAnnotations$2 = propertyAnnotations[AnnotationTextUITextArrangement]) === null || _propertyAnnotations$2 === void 0 ? void 0 : _propertyAnnotations$2.$EnumMember) === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        // the column property is the one coming from the text annotation
        columnPath = textAnnotation.$Path;
        const textPropertyPath = `/${valueListInfo.CollectionPath}/${columnPath}`;
        columnPropertyType = valueListInfo.$model.getMetaModel().getObject(textPropertyPath).$Type;
      }
      if (columnNotAlreadyDefined(columnDefs, columnPath)) {
        const columnDef = {
          path: columnPath,
          label: label,
          sortable: true,
          filterable: !propertyAnnotations["@com.sap.vocabularies.UI.v1.HiddenFilter"],
          $Type: columnPropertyType
        };
        columnDefs.push(columnDef);
      }
    },
    filterInOutParameters: function (vhParameters, typeFilter) {
      return vhParameters.filter(function (parameter) {
        return typeFilter.indexOf(parameter.parmeterType) > -1;
      });
    },
    getInParameters: function (vhParameters) {
      return ValueListHelper.filterInOutParameters(vhParameters, [AnnotationValueListParameterIn, AnnotationValueListParameterConstant, AnnotationValueListParameterInOut]);
    },
    getOutParameters: function (vhParameters) {
      return ValueListHelper.filterInOutParameters(vhParameters, [AnnotationValueListParameterOut, AnnotationValueListParameterInOut]);
    },
    createVHUIModel: function (valueHelp, propertyPath, metaModel) {
      // setting the _VHUI model evaluated in the ValueListTable fragment
      const vhUIModel = new JSONModel({}),
        propertyAnnotations = metaModel.getObject(`${propertyPath}@`);
      valueHelp.setModel(vhUIModel, "_VHUI");
      // Identifies the "ContextDependent-Scenario"
      vhUIModel.setProperty("/hasValueListRelevantQualifiers", !!propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"]);
      /* Property label for dialog title */
      vhUIModel.setProperty("/propertyLabel", propertyAnnotations[AnnotationLabel]);
      return vhUIModel;
    },
    /**
     * Returns the title of the value help dialog.
     * By default, the data field label is used, otherwise either the property label or the value list label is used as a fallback.
     * For context-dependent value helps, by default the value list label is used, otherwise either the property label or the data field label is used as a fallback.
     *
     * @param valueHelp The valueHelp instance
     * @param valuehelpLabel The label in the value help metadata
     * @returns The title for the valueHelp dialog
     * @private
     */
    _getDialogTitle: function (valueHelp, valuehelpLabel) {
      var _valueHelp$getControl;
      const propertyLabel = valueHelp.getModel("_VHUI").getProperty("/propertyLabel");
      const dataFieldLabel = (_valueHelp$getControl = valueHelp.getControl()) === null || _valueHelp$getControl === void 0 ? void 0 : _valueHelp$getControl.getProperty("label");
      return valueHelp.getModel("_VHUI").getProperty("/hasValueListRelevantQualifiers") ? valuehelpLabel || propertyLabel || dataFieldLabel : dataFieldLabel || propertyLabel || valuehelpLabel;
    },
    destroyVHContent: function (valueHelp) {
      if (valueHelp.getDialog()) {
        valueHelp.getDialog().destroyContent();
      }
      if (valueHelp.getTypeahead()) {
        valueHelp.getTypeahead().destroyContent();
      }
    },
    putDefaultQualifierFirst: function (qualifiers) {
      const indexDefaultVH = qualifiers.indexOf("");

      // default ValueHelp without qualifier should be the first
      if (indexDefaultVH > 0) {
        qualifiers.unshift(qualifiers[indexDefaultVH]);
        qualifiers.splice(indexDefaultVH + 1, 1);
      }
      return qualifiers;
    },
    _getContextPrefix: function (bindingContext, propertyBindingParts) {
      if (bindingContext && bindingContext.getPath()) {
        const bindigContextParts = bindingContext.getPath().split("/");
        if (propertyBindingParts.length - bindigContextParts.length > 1) {
          const contextPrefixParts = [];
          for (let i = bindigContextParts.length; i < propertyBindingParts.length - 1; i++) {
            contextPrefixParts.push(propertyBindingParts[i]);
          }
          return `${contextPrefixParts.join("/")}/`;
        }
      }
      return "";
    },
    _getVhParameter: function (conditionModel, valueHelp, contextPrefix, parameter, vhMetaModel, localDataPropertyPath) {
      let valuePath = "";
      const bindingContext = valueHelp.getBindingContext();
      if (conditionModel && conditionModel.length > 0) {
        var _valueHelp$getParent;
        if ((_valueHelp$getParent = valueHelp.getParent()) !== null && _valueHelp$getParent !== void 0 && _valueHelp$getParent.isA("sap.ui.mdc.Table") && bindingContext && ValueListHelper._parameterIsA(parameter, ["com.sap.vocabularies.Common.v1.ValueListParameterIn", "com.sap.vocabularies.Common.v1.ValueListParameterInOut"])) {
          // Special handling for value help used in filter dialog
          const parts = localDataPropertyPath.split("/");
          if (parts.length > 1) {
            const firstNavigationProperty = parts[0];
            const oBoundEntity = vhMetaModel.getMetaContext(bindingContext.getPath());
            const sPathOfTable = valueHelp.getParent().getRowBinding().getPath(); //TODO
            if (oBoundEntity.getObject(`${sPathOfTable}/$Partner`) === firstNavigationProperty) {
              // Using the condition model doesn't make any sense in case an in-parameter uses a navigation property
              // referring to the partner. Therefore reducing the path and using the FVH context instead of the condition model
              valuePath = localDataPropertyPath.replace(firstNavigationProperty + "/", "");
            }
          }
        }
        if (!valuePath) {
          valuePath = conditionModel + ">/conditions/" + localDataPropertyPath;
        }
      } else {
        valuePath = contextPrefix + localDataPropertyPath;
      }
      return {
        parmeterType: parameter.$Type,
        source: valuePath,
        helpPath: parameter.ValueListProperty,
        constantValue: parameter.Constant,
        initialValueFilterEmpty: Boolean(parameter.InitialValueIsSignificant)
      };
    },
    _parameterIsA(parameter, parameterTypes) {
      return parameterTypes.includes(parameter.$Type);
    },
    _enrichPath: function (path, propertyPath, localDataPropertyPath, parameter, propertyName, propertyAnnotations) {
      if (!path.key && ValueListHelper._parameterIsA(parameter, ["com.sap.vocabularies.Common.v1.ValueListParameterOut", "com.sap.vocabularies.Common.v1.ValueListParameterInOut"]) && localDataPropertyPath === propertyName) {
        var _propertyAnnotations$3;
        path.fieldPropertyPath = propertyPath;
        path.key = parameter.ValueListProperty;

        //Only the text annotation of the key can specify the description
        path.descriptionPath = ((_propertyAnnotations$3 = propertyAnnotations[AnnotationText]) === null || _propertyAnnotations$3 === void 0 ? void 0 : _propertyAnnotations$3.$Path) || "";
      }
    },
    _enrichKeys: function (vhKeys, parameter) {
      if (ValueListHelper._parameterIsA(parameter, ["com.sap.vocabularies.Common.v1.ValueListParameterOut", "com.sap.vocabularies.Common.v1.ValueListParameterInOut"]) && !vhKeys.includes(parameter.ValueListProperty)) {
        vhKeys.push(parameter.ValueListProperty);
      }
    },
    _processParameters: function (annotationValueListType, propertyName, conditionModel, valueHelp, contextPrefix, vhMetaModel, valueHelpQualifier) {
      var _metaModel$getObject;
      const metaModel = annotationValueListType.$model.getMetaModel(),
        entitySetPath = `/${annotationValueListType.CollectionPath}`,
        columnDefs = ValueListHelper._getColumnDefinitionFromSelectionFields(metaModel, entitySetPath),
        vhParameters = [],
        vhKeys = (_metaModel$getObject = metaModel.getObject(entitySetPath + `/`)) !== null && _metaModel$getObject !== void 0 && _metaModel$getObject.$Key ? [...metaModel.getObject(entitySetPath + `/`).$Key] : [];
      const path = {
        fieldPropertyPath: "",
        descriptionPath: "",
        key: ""
      };
      for (const parameter of annotationValueListType.Parameters) {
        var _parameter$LocalDataP;
        //All String fields are allowed for filter
        const propertyPath = `/${annotationValueListType.CollectionPath}/${parameter.ValueListProperty}`,
          property = metaModel.getObject(propertyPath),
          propertyAnnotations = metaModel.getObject(`${propertyPath}@`) || {},
          localDataPropertyPath = ((_parameter$LocalDataP = parameter.LocalDataProperty) === null || _parameter$LocalDataP === void 0 ? void 0 : _parameter$LocalDataP.$PropertyPath) || "";

        // If property is undefined, then the property coming for the entry isn't defined in
        // the metamodel, therefore we don't need to add it in the in/out parameters
        if (property) {
          // Search for the *out Parameter mapped to the local property
          ValueListHelper._enrichPath(path, propertyPath, localDataPropertyPath, parameter, propertyName, propertyAnnotations);
          const valueListProperty = parameter.ValueListProperty;
          ValueListHelper._mergeColumnDefinitionsFromProperties(columnDefs, annotationValueListType, valueListProperty, property, propertyAnnotations);
        }

        //In and InOut and Out
        if (ValueListHelper._parameterIsA(parameter, ["com.sap.vocabularies.Common.v1.ValueListParameterIn", "com.sap.vocabularies.Common.v1.ValueListParameterOut", "com.sap.vocabularies.Common.v1.ValueListParameterInOut"]) && localDataPropertyPath !== propertyName) {
          const vhParameter = ValueListHelper._getVhParameter(conditionModel, valueHelp, contextPrefix, parameter, vhMetaModel, localDataPropertyPath);
          vhParameters.push(vhParameter);
        }

        //Constant as InParamter for filtering
        if (parameter.$Type === AnnotationValueListParameterConstant) {
          vhParameters.push({
            parmeterType: parameter.$Type,
            source: parameter.ValueListProperty,
            helpPath: parameter.ValueListProperty,
            constantValue: parameter.Constant,
            initialValueFilterEmpty: Boolean(parameter.InitialValueIsSignificant)
          });
        }

        // Enrich keys with out-parameters
        ValueListHelper._enrichKeys(vhKeys, parameter);
      }

      /* Ensure that vhKeys are part of the columnDefs, otherwise it is not considered in $select (BCP 2270141154) */
      for (const vhKey of vhKeys) {
        if (columnNotAlreadyDefined(columnDefs, vhKey)) {
          const columnDef = {
            path: vhKey,
            $Type: metaModel.getObject(`/${annotationValueListType.CollectionPath}/${path.key}`).$Type,
            label: "",
            sortable: false,
            filterable: undefined
          };
          columnDefs.push(columnDef);
        }
      }
      return {
        keyValue: path.key,
        descriptionValue: path.descriptionPath,
        fieldPropertyPath: path.fieldPropertyPath,
        vhKeys: vhKeys,
        vhParameters: vhParameters,
        valueListInfo: annotationValueListType,
        columnDefs: columnDefs,
        valueHelpQualifier
      };
    },
    _logError: function (propertyPath, error) {
      const status = error ? error.status : undefined;
      const message = error instanceof Error ? error.message : String(error);
      const msg = status === 404 ? `Metadata not found (${status}) for value help of property ${propertyPath}` : message;
      Log.error(msg);
    },
    getValueListInfo: async function (valueHelp, propertyPath, payload) {
      const bindingContext = valueHelp.getBindingContext(),
        conditionModel = payload.conditionModel,
        vhMetaModel = valueHelp.getModel().getMetaModel(),
        valueListInfos = [],
        propertyPathParts = propertyPath.split("/");
      try {
        const valueListByQualifier = await vhMetaModel.requestValueListInfo(propertyPath, true, bindingContext);
        const valueHelpQualifiers = ValueListHelper.putDefaultQualifierFirst(Object.keys(valueListByQualifier)),
          propertyName = propertyPathParts.pop();
        const contextPrefix = payload.useMultiValueField ? ValueListHelper._getContextPrefix(bindingContext, propertyPathParts) : "";
        for (const valueHelpQualifier of valueHelpQualifiers) {
          // Add column definitions for properties defined as Selection fields on the CollectionPath entity set.
          const annotationValueListType = valueListByQualifier[valueHelpQualifier];
          const valueListInfo = ValueListHelper._processParameters(annotationValueListType, propertyName, conditionModel, valueHelp, contextPrefix, vhMetaModel, valueHelpQualifier);
          valueListInfos.push(valueListInfo);
        }
      } catch (err) {
        this._logError(propertyPath, err);
        ValueListHelper.destroyVHContent(valueHelp);
      }
      return valueListInfos;
    },
    ALLFRAGMENTS: undefined,
    logFragment: undefined,
    _logTemplatedFragments: function (propertyPath, fragmentName, fragmentDefinition) {
      const logInfo = {
        path: propertyPath,
        fragmentName: fragmentName,
        fragment: fragmentDefinition
      };
      if (Log.getLevel() === Level.DEBUG) {
        //In debug mode we log all generated fragments
        ValueListHelper.ALLFRAGMENTS = ValueListHelper.ALLFRAGMENTS || [];
        ValueListHelper.ALLFRAGMENTS.push(logInfo);
      }
      if (ValueListHelper.logFragment) {
        //One Tool Subscriber allowed
        setTimeout(function () {
          ValueListHelper.logFragment(logInfo);
        }, 0);
      }
    },
    _templateFragment: async function (fragmentName, valueListInfo, sourceModel, propertyPath) {
      const localValueListInfo = valueListInfo.valueListInfo,
        valueListModel = new JSONModel(localValueListInfo),
        valueListServiceMetaModel = localValueListInfo.$model.getMetaModel(),
        viewData = new JSONModel({
          converterType: "ListReport",
          columns: valueListInfo.columnDefs || null
        });
      const fragmentDefinition = await XMLPreprocessor.process(XMLTemplateProcessor.loadTemplate(fragmentName, "fragment"), {
        name: fragmentName
      }, {
        bindingContexts: {
          valueList: valueListModel.createBindingContext("/"),
          contextPath: valueListServiceMetaModel.createBindingContext(`/${localValueListInfo.CollectionPath}/`),
          source: sourceModel.createBindingContext("/")
        },
        models: {
          valueList: valueListModel,
          contextPath: valueListServiceMetaModel,
          source: sourceModel,
          metaModel: valueListServiceMetaModel,
          viewData: viewData
        }
      });
      ValueListHelper._logTemplatedFragments(propertyPath, fragmentName, fragmentDefinition);
      return await Fragment.load({
        definition: fragmentDefinition
      });
    },
    _getContentId: function (valueHelpId, valueHelpQualifier, isTypeahead) {
      const contentType = isTypeahead ? "Popover" : "Dialog";
      return `${valueHelpId}::${contentType}::qualifier::${valueHelpQualifier}`;
    },
    _addInOutParametersToPayload: function (payload, valueListInfo) {
      const valueHelpQualifier = valueListInfo.valueHelpQualifier;
      if (!payload.qualifiers) {
        payload.qualifiers = {};
      }
      if (!payload.qualifiers[valueHelpQualifier]) {
        payload.qualifiers[valueHelpQualifier] = {
          vhKeys: valueListInfo.vhKeys,
          vhParameters: valueListInfo.vhParameters
        };
      }
    },
    _getValueHelpColumnDisplayFormat: function (propertyAnnotations, isValueHelpWithFixedValues) {
      const displayMode = CommonUtils.computeDisplayMode(propertyAnnotations, undefined),
        textAnnotation = propertyAnnotations && propertyAnnotations[AnnotationText],
        textArrangementAnnotation = textAnnotation && propertyAnnotations[AnnotationTextUITextArrangement];
      if (isValueHelpWithFixedValues) {
        return textAnnotation && typeof textAnnotation !== "string" && textAnnotation.$Path ? displayMode : "Value";
      } else {
        // Only explicit defined TextArrangements in a Value Help with Dialog are considered
        return textArrangementAnnotation ? displayMode : "Value";
      }
    },
    _getWidthInRem: function (control, isUnitValueHelp) {
      let width = control.$().width(); // JQuery
      if (isUnitValueHelp && width) {
        width = 0.3 * width;
      }
      const floatWidth = width ? parseFloat(String(Rem.fromPx(width))) : 0;
      return isNaN(floatWidth) ? 0 : floatWidth;
    },
    _getTableWidth: function (table, minWidth) {
      let width;
      const columns = table.getColumns(),
        visibleColumns = columns && columns.filter(function (column) {
          return column && column.getVisible && column.getVisible();
        }) || [],
        sumWidth = visibleColumns.reduce(function (sum, column) {
          width = column.getWidth();
          if (width && width.endsWith("px")) {
            width = String(Rem.fromPx(width));
          }
          const floatWidth = parseFloat(width);
          return sum + (isNaN(floatWidth) ? 9 : floatWidth);
        }, visibleColumns.length);
      return `${Math.max(sumWidth, minWidth)}em`;
    },
    _createValueHelpTypeahead: async function (propertyPath, valueHelp, content, valueListInfo, payload) {
      const contentId = content.getId(),
        propertyAnnotations = valueHelp.getModel().getMetaModel().getObject(`${propertyPath}@`),
        valueHelpWithFixedValues = propertyAnnotations[AnnotationValueListWithFixedValues] ?? false,
        isDialogTable = false,
        columnInfo = ValueListHelper.getColumnVisibilityInfo(valueListInfo.valueListInfo, propertyPath, valueHelpWithFixedValues, isDialogTable),
        sourceModel = new JSONModel({
          id: contentId,
          groupId: payload.requestGroupId || undefined,
          bSuggestion: true,
          propertyPath: propertyPath,
          columnInfo: columnInfo,
          valueHelpWithFixedValues: valueHelpWithFixedValues
        });
      content.setKeyPath(valueListInfo.keyValue);
      content.setDescriptionPath(valueListInfo.descriptionValue);
      payload.isValueListWithFixedValues = valueHelpWithFixedValues;
      const collectionAnnotations = valueListInfo.valueListInfo.$model.getMetaModel().getObject(`/${valueListInfo.valueListInfo.CollectionPath}@`) || {};
      content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");
      const table = await ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListTable", valueListInfo, sourceModel, propertyPath);
      table.setModel(valueListInfo.valueListInfo.$model);
      Log.info(`Value List- suggest Table XML content created [${propertyPath}]`, table.getMetadata().getName(), "MDC Templating");
      content.setTable(table);
      const field = valueHelp.getControl();
      if (field !== undefined && (field.isA("sap.ui.mdc.FilterField") || field.isA("sap.ui.mdc.Field") || field.isA("sap.ui.mdc.MultiValueField"))) {
        //Can the filterfield be something else that we need the .isA() check?
        const reduceWidthForUnitValueHelp = Boolean(payload.isUnitValueHelp);
        const tableWidth = ValueListHelper._getTableWidth(table, ValueListHelper._getWidthInRem(field, reduceWidthForUnitValueHelp));
        table.setWidth(tableWidth);
        if (valueHelpWithFixedValues) {
          table.setMode(field.getMaxConditions() === 1 ? "SingleSelectMaster" : "MultiSelect");
        } else {
          table.setMode("SingleSelectMaster");
        }
      }
    },
    _createValueHelpDialog: async function (propertyPath, valueHelp, content, valueListInfo, payload) {
      const propertyAnnotations = valueHelp.getModel().getMetaModel().getObject(`${propertyPath}@`),
        isDropDownListe = false,
        isDialogTable = true,
        columnInfo = ValueListHelper.getColumnVisibilityInfo(valueListInfo.valueListInfo, propertyPath, isDropDownListe, isDialogTable),
        sourceModel = new JSONModel({
          id: content.getId(),
          groupId: payload.requestGroupId || undefined,
          bSuggestion: false,
          columnInfo: columnInfo,
          valueHelpWithFixedValues: isDropDownListe
        });
      content.setKeyPath(valueListInfo.keyValue);
      content.setDescriptionPath(valueListInfo.descriptionValue);
      const collectionAnnotations = valueListInfo.valueListInfo.$model.getMetaModel().getObject(`/${valueListInfo.valueListInfo.CollectionPath}@`) || {};
      content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");
      const tablePromise = ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListDialogTable", valueListInfo, sourceModel, propertyPath);
      const filterBarPromise = ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListFilterBar", valueListInfo, sourceModel, propertyPath);
      const [table, filterBar] = await Promise.all([tablePromise, filterBarPromise]);
      table.setModel(valueListInfo.valueListInfo.$model);
      filterBar.setModel(valueListInfo.valueListInfo.$model);
      content.setFilterBar(filterBar);
      content.setTable(table);
      table.setFilter(filterBar.getId());
      table.initialized();
      const field = valueHelp.getControl();
      if (field !== undefined) {
        table.setSelectionMode(field.getMaxConditions() === 1 ? "SingleMaster" : "Multi");
      }
      table.setWidth("100%");

      //This is a temporary workarround - provided by MDC (see FIORITECHP1-24002)
      const mdcTable = table;
      mdcTable._setShowP13nButton(false);
    },
    _getContentById: function (contentList, contentId) {
      return contentList.find(function (item) {
        return item.getId() === contentId;
      });
    },
    _createPopoverContent: function (contentId, caseSensitive, useAsValueHelp) {
      return new MTable({
        id: contentId,
        group: "group1",
        caseSensitive: caseSensitive,
        useAsValueHelp: useAsValueHelp
      });
    },
    _createDialogContent: function (contentId, caseSensitive, forceBind) {
      return new MDCTable({
        id: contentId,
        group: "group1",
        caseSensitive: caseSensitive,
        forceBind: forceBind
      });
    },
    _showConditionsContent: function (contentList, container) {
      let conditionsContent = contentList.length && contentList[contentList.length - 1].getMetadata().getName() === "sap.ui.mdc.valuehelp.content.Conditions" ? contentList[contentList.length - 1] : undefined;
      if (conditionsContent) {
        conditionsContent.setVisible(true);
      } else {
        conditionsContent = new Conditions();
        container.addContent(conditionsContent);
      }
    },
    _alignOrCreateContent: function (valueListInfo, contentId, caseSensitive, showConditionPanel, container) {
      const contentList = container.getContent();
      let content = ValueListHelper._getContentById(contentList, contentId);
      if (!content) {
        const forceBind = valueListInfo.valueListInfo.FetchValues === 2 ? false : true;
        content = ValueListHelper._createDialogContent(contentId, caseSensitive, forceBind);
        if (!showConditionPanel) {
          container.addContent(content);
        } else {
          container.insertContent(content, contentList.length - 1); // insert content before conditions content
        }
      } else {
        content.setVisible(true);
      }
      return content;
    },
    _prepareValueHelpTypeAhead: function (valueHelp, container, valueListInfos, payload, caseSensitive, firstTypeAheadContent) {
      const contentList = container.getContent();
      let qualifierForTypeahead = valueHelp.data("valuelistForValidation") || ""; // can also be null
      if (qualifierForTypeahead === " ") {
        qualifierForTypeahead = "";
      }
      const valueListInfo = qualifierForTypeahead ? valueListInfos.filter(function (subValueListInfo) {
        return subValueListInfo.valueHelpQualifier === qualifierForTypeahead;
      })[0] : valueListInfos[0];
      ValueListHelper._addInOutParametersToPayload(payload, valueListInfo);
      const contentId = ValueListHelper._getContentId(valueHelp.getId(), valueListInfo.valueHelpQualifier, true);
      let content = ValueListHelper._getContentById(contentList, contentId);
      if (!content) {
        const useAsValueHelp = firstTypeAheadContent.getUseAsValueHelp();
        content = ValueListHelper._createPopoverContent(contentId, caseSensitive, useAsValueHelp);
        container.insertContent(content, 0); // insert content as first content
      } else if (contentId !== contentList[0].getId()) {
        // content already available but not as first content?
        container.removeContent(content);
        container.insertContent(content, 0); // move content to first position
      }

      return {
        valueListInfo,
        content
      };
    },
    _prepareValueHelpDialog: function (valueHelp, container, valueListInfos, payload, selectedContentId, caseSensitive) {
      const showConditionPanel = valueHelp.data("showConditionPanel") && valueHelp.data("showConditionPanel") !== "false";
      const contentList = container.getContent();

      // set all contents to invisible
      for (const contentListItem of contentList) {
        contentListItem.setVisible(false);
      }
      if (showConditionPanel) {
        this._showConditionsContent(contentList, container);
      }
      let selectedInfo, selectedContent;

      // Create or reuse contents for the current context
      for (const valueListInfo of valueListInfos) {
        const valueHelpQualifier = valueListInfo.valueHelpQualifier;
        ValueListHelper._addInOutParametersToPayload(payload, valueListInfo);
        const contentId = ValueListHelper._getContentId(valueHelp.getId(), valueHelpQualifier, false);
        const content = this._alignOrCreateContent(valueListInfo, contentId, caseSensitive, showConditionPanel, container);
        if (valueListInfo.valueListInfo.Label) {
          const title = CommonUtils.getTranslatedTextFromExpBindingString(valueListInfo.valueListInfo.Label, valueHelp.getControl());
          content.setTitle(title);
        }
        if (!selectedContent || selectedContentId && selectedContentId === contentId) {
          selectedContent = content;
          selectedInfo = valueListInfo;
        }
      }
      if (!selectedInfo || !selectedContent) {
        throw new Error("selectedInfo or selectedContent undefined");
      }
      return {
        selectedInfo,
        selectedContent
      };
    },
    showValueList: async function (payload, container, selectedContentId) {
      const valueHelp = container.getParent(),
        isTypeahead = container.isTypeahead(),
        propertyPath = payload.propertyPath,
        metaModel = valueHelp.getModel().getMetaModel(),
        vhUIModel = valueHelp.getModel("_VHUI") || ValueListHelper.createVHUIModel(valueHelp, propertyPath, metaModel);
      if (!payload.qualifiers) {
        payload.qualifiers = {};
      }
      vhUIModel.setProperty("/isSuggestion", isTypeahead);
      vhUIModel.setProperty("/minScreenWidth", !isTypeahead ? "418px" : undefined);
      try {
        const valueListInfos = await ValueListHelper.getValueListInfo(valueHelp, propertyPath, payload);
        const firstTypeAheadContent = valueHelp.getTypeahead().getContent()[0],
          caseSensitive = firstTypeAheadContent.getCaseSensitive(); // take caseSensitive from first Typeahead content

        if (isTypeahead) {
          const {
            valueListInfo,
            content
          } = ValueListHelper._prepareValueHelpTypeAhead(valueHelp, container, valueListInfos, payload, caseSensitive, firstTypeAheadContent);
          payload.valueHelpQualifier = valueListInfo.valueHelpQualifier;
          if (content.getTable() === undefined || content.getTable() === null) {
            await ValueListHelper._createValueHelpTypeahead(propertyPath, valueHelp, content, valueListInfo, payload);
          }
        } else {
          var _selectedInfo$valueLi;
          const {
            selectedInfo,
            selectedContent
          } = ValueListHelper._prepareValueHelpDialog(valueHelp, container, valueListInfos, payload, selectedContentId, caseSensitive);
          payload.valueHelpQualifier = selectedInfo.valueHelpQualifier;
          /* For context depentent value helps the value list label is used for the dialog title */
          const title = CommonUtils.getTranslatedTextFromExpBindingString(ValueListHelper._getDialogTitle(valueHelp, (_selectedInfo$valueLi = selectedInfo.valueListInfo) === null || _selectedInfo$valueLi === void 0 ? void 0 : _selectedInfo$valueLi.Label), valueHelp.getControl());
          container.setTitle(title);
          if (selectedContent.getTable() === undefined || selectedContent.getTable() === null) {
            await ValueListHelper._createValueHelpDialog(propertyPath, valueHelp, selectedContent, selectedInfo, payload);
          }
        }
      } catch (err) {
        this._logError(propertyPath, err);
        ValueListHelper.destroyVHContent(valueHelp);
      }
    }
  };
  return ValueListHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb2x1bW5Ob3RBbHJlYWR5RGVmaW5lZCIsImNvbHVtbkRlZnMiLCJ2aEtleSIsInNvbWUiLCJjb2x1bW4iLCJwYXRoIiwiQW5ub3RhdGlvbkxhYmVsIiwiQW5ub3RhdGlvblRleHQiLCJBbm5vdGF0aW9uVGV4dFVJVGV4dEFycmFuZ2VtZW50IiwiQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluIiwiQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckNvbnN0YW50IiwiQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlck91dCIsIkFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dCIsIkFubm90YXRpb25WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMiLCJfZ2V0RGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUiLCJ2YWx1ZUxpc3RJbmZvIiwic29ydEZpZWxkTmFtZSIsIm1ldGFNb2RlbCIsIiRtb2RlbCIsImdldE1ldGFNb2RlbCIsImVudGl0eVNldEFubm90YXRpb25zIiwiZ2V0T2JqZWN0IiwiQ29sbGVjdGlvblBhdGgiLCJzb3J0UmVzdHJpY3Rpb25zSW5mbyIsIk9EYXRhTWV0YU1vZGVsVXRpbCIsImdldFNvcnRSZXN0cmljdGlvbnNJbmZvIiwiZm91bmRFbGVtZW50IiwiUGFyYW1ldGVycyIsImZpbmQiLCJlbGVtZW50IiwiJFR5cGUiLCJWYWx1ZUxpc3RQcm9wZXJ0eSIsInByb3BlcnR5SW5mbyIsInNvcnRhYmxlIiwidW5kZWZpbmVkIiwiX3JlZHVuZGFudERlc2NyaXB0aW9uIiwib1ZMUGFyYW1ldGVyIiwiYUNvbHVtbkluZm8iLCJvQ29sdW1uSW5mbyIsImNvbHVtbkluZm8iLCJ0ZXh0Q29sdW1uTmFtZSIsImtleUNvbHVtbkhpZGRlbiIsImtleUNvbHVtbkRpc3BsYXlGb3JtYXQiLCJfaGFzSW1wb3J0YW5jZUhpZ2giLCJvVmFsdWVMaXN0Q29udGV4dCIsIm9QYXJhbWV0ZXIiLCIkRW51bU1lbWJlciIsIl9idWlsZCRTZWxlY3RTdHJpbmciLCJjb250cm9sIiwib1ZpZXdEYXRhIiwiZ2V0TW9kZWwiLCJvRGF0YSIsImdldERhdGEiLCJhQ29sdW1ucyIsImNvbHVtbnMiLCJyZWR1Y2UiLCJzUXVlcnkiLCJvUHJvcGVydHkiLCJpbmRleE9mIiwiX2dldFZhbHVlSGVscENvbHVtbkRpc3BsYXlGb3JtYXQiLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsImlzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzIiwic0Rpc3BsYXlNb2RlIiwiQ29tbW9uVXRpbHMiLCJjb21wdXRlRGlzcGxheU1vZGUiLCJvVGV4dEFubm90YXRpb24iLCJvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiIsIiRQYXRoIiwiVmFsdWVMaXN0SGVscGVyIiwiZ2V0VmFsdWVMaXN0Q29sbGVjdGlvbkVudGl0eVNldCIsIm1WYWx1ZUxpc3QiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldFRhYmxlRGVsZWdhdGUiLCJvVmFsdWVMaXN0Iiwic0RlZmF1bHRTb3J0UHJvcGVydHlOYW1lIiwiZ2V0U29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCIsImlzU3VnZ2VzdGlvbiIsInByZXNlbnRhdGlvblZhcmlhbnRRdWFsaWZpZXIiLCJQcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyIiwicHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJwcmVzZW50YXRpb25WYXJpYW50IiwiU29ydE9yZGVyIiwic29ydENvbmRpdGlvbnMiLCJzb3J0ZXJzIiwiZm9yRWFjaCIsImNvbmRpdGlvbiIsInNvcnRlciIsIlByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIkRlc2NlbmRpbmciLCJkZXNjZW5kaW5nIiwiYXNjZW5kaW5nIiwicHVzaCIsIkpTT04iLCJzdHJpbmdpZnkiLCJuYW1lIiwiZ2V0UHJvcGVydHlQYXRoIiwib1BhcmFtZXRlcnMiLCJVbmJvdW5kQWN0aW9uIiwiRW50aXR5VHlwZVBhdGgiLCJBY3Rpb24iLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsImdldFZhbHVlTGlzdFByb3BlcnR5Iiwib1Byb3BlcnR5Q29udGV4dCIsIm9WYWx1ZUxpc3RNb2RlbCIsImdldENvbHVtblZpc2liaWxpdHkiLCJvU291cmNlIiwiaXNEcm9wRG93bkxpc3QiLCJ2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMiLCJpc1Zpc2libGUiLCJjb2x1bW5JbmZvcyIsImlzRGlhbG9nVGFibGUiLCJjb2x1bW5XaXRoSGlkZGVuQW5ub3RhdGlvbiIsImNvbHVtbk5hbWUiLCJoYXNIaWRkZW5Bbm5vdGF0aW9uIiwiZ2V0Q29sdW1uVmlzaWJpbGl0eUluZm8iLCJzUHJvcGVydHlGdWxsUGF0aCIsImJJc0Ryb3BEb3duTGlzdGUiLCJvTWV0YU1vZGVsIiwiYUNvbHVtbkluZm9zIiwib0NvbHVtbkluZm9zIiwiZ2V0VGFibGVJdGVtc1BhcmFtZXRlcnMiLCJyZXF1ZXN0R3JvdXBJZCIsIml0ZW1QYXJhbWV0ZXJzIiwic2VsZWN0U3RyaW5nIiwic2VsZWN0U3RyaW5nUGFydCIsImlzU3VzcGVuZGVkIiwic29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCIsImRlZmF1bHRTb3J0UHJvcGVydHlOYW1lIiwiam9pbiIsImhhc0ltcG9ydGFuY2UiLCJnZXRNaW5TY3JlZW5XaWR0aCIsImdldENvbHVtbldpZHRoIiwicHJvcGVydHlQYXRoIiwicHJvcGVydHkiLCJ0YXJnZXRPYmplY3QiLCJyZWxhdGVkUHJvcGVydHkiLCJhZGRpdGlvbmFsUHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkiLCJ0ZXh0QW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsInRleHRBcnJhbmdlbWVudCIsIlVJIiwiVGV4dEFycmFuZ2VtZW50IiwidG9TdHJpbmciLCJsYWJlbCIsIkxhYmVsIiwiZGlzcGxheU1vZGUiLCJnZXREaXNwbGF5TW9kZSIsInNpemUiLCJpbnN0YW5jZXMiLCJwcm9wIiwicHJvcGVydHlUeXBlQ29uZmlnIiwiZ2V0VHlwZUNvbmZpZyIsIlByb3BlcnR5T0RhdGFDb25zdHJ1Y3RvciIsIk9iamVjdFBhdGgiLCJnZXQiLCJ0eXBlIiwiZm9ybWF0T3B0aW9ucyIsImNvbnN0cmFpbnRzIiwic1dpZHRoIiwiVXRpbCIsImNhbGNDb2x1bW5XaWR0aCIsInBhcnNlRmxvYXQiLCJyZXBsYWNlIiwiTG9nIiwiZXJyb3IiLCJnZXRPdXRQYXJhbWV0ZXJQYXRocyIsImFQYXJhbWV0ZXJzIiwic1BhdGgiLCJlbmRzV2l0aCIsImVudGl0eUlzU2VhcmNoYWJsZSIsInByb3BlcnR5QW5ub3RhdGlvbnMiLCJjb2xsZWN0aW9uQW5ub3RhdGlvbnMiLCJzZWFyY2hTdXBwb3J0ZWQiLCJTZWFyY2hTdXBwb3J0ZWQiLCJzZWFyY2hhYmxlIiwiU2VhcmNoYWJsZSIsIl9nZXRDb25kaXRpb25QYXRoIiwiZW50aXR5U2V0IiwicGFydHMiLCJzcGxpdCIsImNvbmRpdGlvblBhdGgiLCJwYXJ0aWFsUGF0aCIsImxlbmd0aCIsInBhcnQiLCJzaGlmdCIsIiRraW5kIiwiJGlzQ29sbGVjdGlvbiIsIl9nZXRDb2x1bW5EZWZpbml0aW9uRnJvbVNlbGVjdGlvbkZpZWxkcyIsImVudGl0eVR5cGVBbm5vdGF0aW9ucyIsInNlbGVjdGlvbkZpZWxkcyIsInNlbGVjdGlvbkZpZWxkIiwic2VsZWN0aW9uRmllbGRQYXRoIiwiY29sdW1uRGVmIiwiZmlsdGVyYWJsZSIsImlzUHJvcGVydHlGaWx0ZXJhYmxlIiwiX21lcmdlQ29sdW1uRGVmaW5pdGlvbnNGcm9tUHJvcGVydGllcyIsInZhbHVlTGlzdFByb3BlcnR5IiwiY29sdW1uUGF0aCIsImNvbHVtblByb3BlcnR5VHlwZSIsInRleHRQcm9wZXJ0eVBhdGgiLCJmaWx0ZXJJbk91dFBhcmFtZXRlcnMiLCJ2aFBhcmFtZXRlcnMiLCJ0eXBlRmlsdGVyIiwiZmlsdGVyIiwicGFyYW1ldGVyIiwicGFybWV0ZXJUeXBlIiwiZ2V0SW5QYXJhbWV0ZXJzIiwiZ2V0T3V0UGFyYW1ldGVycyIsImNyZWF0ZVZIVUlNb2RlbCIsInZhbHVlSGVscCIsInZoVUlNb2RlbCIsIkpTT05Nb2RlbCIsInNldE1vZGVsIiwic2V0UHJvcGVydHkiLCJfZ2V0RGlhbG9nVGl0bGUiLCJ2YWx1ZWhlbHBMYWJlbCIsInByb3BlcnR5TGFiZWwiLCJnZXRQcm9wZXJ0eSIsImRhdGFGaWVsZExhYmVsIiwiZ2V0Q29udHJvbCIsImRlc3Ryb3lWSENvbnRlbnQiLCJnZXREaWFsb2ciLCJkZXN0cm95Q29udGVudCIsImdldFR5cGVhaGVhZCIsInB1dERlZmF1bHRRdWFsaWZpZXJGaXJzdCIsInF1YWxpZmllcnMiLCJpbmRleERlZmF1bHRWSCIsInVuc2hpZnQiLCJzcGxpY2UiLCJfZ2V0Q29udGV4dFByZWZpeCIsImJpbmRpbmdDb250ZXh0IiwicHJvcGVydHlCaW5kaW5nUGFydHMiLCJnZXRQYXRoIiwiYmluZGlnQ29udGV4dFBhcnRzIiwiY29udGV4dFByZWZpeFBhcnRzIiwiaSIsIl9nZXRWaFBhcmFtZXRlciIsImNvbmRpdGlvbk1vZGVsIiwiY29udGV4dFByZWZpeCIsInZoTWV0YU1vZGVsIiwibG9jYWxEYXRhUHJvcGVydHlQYXRoIiwidmFsdWVQYXRoIiwiZ2V0QmluZGluZ0NvbnRleHQiLCJnZXRQYXJlbnQiLCJpc0EiLCJfcGFyYW1ldGVySXNBIiwiZmlyc3ROYXZpZ2F0aW9uUHJvcGVydHkiLCJvQm91bmRFbnRpdHkiLCJnZXRNZXRhQ29udGV4dCIsInNQYXRoT2ZUYWJsZSIsImdldFJvd0JpbmRpbmciLCJzb3VyY2UiLCJoZWxwUGF0aCIsImNvbnN0YW50VmFsdWUiLCJDb25zdGFudCIsImluaXRpYWxWYWx1ZUZpbHRlckVtcHR5IiwiQm9vbGVhbiIsIkluaXRpYWxWYWx1ZUlzU2lnbmlmaWNhbnQiLCJwYXJhbWV0ZXJUeXBlcyIsImluY2x1ZGVzIiwiX2VucmljaFBhdGgiLCJwcm9wZXJ0eU5hbWUiLCJrZXkiLCJmaWVsZFByb3BlcnR5UGF0aCIsImRlc2NyaXB0aW9uUGF0aCIsIl9lbnJpY2hLZXlzIiwidmhLZXlzIiwiX3Byb2Nlc3NQYXJhbWV0ZXJzIiwiYW5ub3RhdGlvblZhbHVlTGlzdFR5cGUiLCJ2YWx1ZUhlbHBRdWFsaWZpZXIiLCJlbnRpdHlTZXRQYXRoIiwiJEtleSIsIkxvY2FsRGF0YVByb3BlcnR5IiwidmhQYXJhbWV0ZXIiLCJrZXlWYWx1ZSIsImRlc2NyaXB0aW9uVmFsdWUiLCJfbG9nRXJyb3IiLCJzdGF0dXMiLCJtZXNzYWdlIiwiRXJyb3IiLCJTdHJpbmciLCJtc2ciLCJnZXRWYWx1ZUxpc3RJbmZvIiwicGF5bG9hZCIsInZhbHVlTGlzdEluZm9zIiwicHJvcGVydHlQYXRoUGFydHMiLCJ2YWx1ZUxpc3RCeVF1YWxpZmllciIsInJlcXVlc3RWYWx1ZUxpc3RJbmZvIiwidmFsdWVIZWxwUXVhbGlmaWVycyIsIk9iamVjdCIsImtleXMiLCJwb3AiLCJ1c2VNdWx0aVZhbHVlRmllbGQiLCJlcnIiLCJBTExGUkFHTUVOVFMiLCJsb2dGcmFnbWVudCIsIl9sb2dUZW1wbGF0ZWRGcmFnbWVudHMiLCJmcmFnbWVudE5hbWUiLCJmcmFnbWVudERlZmluaXRpb24iLCJsb2dJbmZvIiwiZnJhZ21lbnQiLCJnZXRMZXZlbCIsIkxldmVsIiwiREVCVUciLCJzZXRUaW1lb3V0IiwiX3RlbXBsYXRlRnJhZ21lbnQiLCJzb3VyY2VNb2RlbCIsImxvY2FsVmFsdWVMaXN0SW5mbyIsInZhbHVlTGlzdE1vZGVsIiwidmFsdWVMaXN0U2VydmljZU1ldGFNb2RlbCIsInZpZXdEYXRhIiwiY29udmVydGVyVHlwZSIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsImJpbmRpbmdDb250ZXh0cyIsInZhbHVlTGlzdCIsImNvbnRleHRQYXRoIiwibW9kZWxzIiwiRnJhZ21lbnQiLCJsb2FkIiwiZGVmaW5pdGlvbiIsIl9nZXRDb250ZW50SWQiLCJ2YWx1ZUhlbHBJZCIsImlzVHlwZWFoZWFkIiwiY29udGVudFR5cGUiLCJfYWRkSW5PdXRQYXJhbWV0ZXJzVG9QYXlsb2FkIiwidGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiIsIl9nZXRXaWR0aEluUmVtIiwiaXNVbml0VmFsdWVIZWxwIiwid2lkdGgiLCIkIiwiZmxvYXRXaWR0aCIsIlJlbSIsImZyb21QeCIsImlzTmFOIiwiX2dldFRhYmxlV2lkdGgiLCJ0YWJsZSIsIm1pbldpZHRoIiwiZ2V0Q29sdW1ucyIsInZpc2libGVDb2x1bW5zIiwiZ2V0VmlzaWJsZSIsInN1bVdpZHRoIiwic3VtIiwiZ2V0V2lkdGgiLCJNYXRoIiwibWF4IiwiX2NyZWF0ZVZhbHVlSGVscFR5cGVhaGVhZCIsImNvbnRlbnQiLCJjb250ZW50SWQiLCJnZXRJZCIsImlkIiwiZ3JvdXBJZCIsImJTdWdnZXN0aW9uIiwic2V0S2V5UGF0aCIsInNldERlc2NyaXB0aW9uUGF0aCIsImlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwic2V0RmlsdGVyRmllbGRzIiwiaW5mbyIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsInNldFRhYmxlIiwiZmllbGQiLCJyZWR1Y2VXaWR0aEZvclVuaXRWYWx1ZUhlbHAiLCJ0YWJsZVdpZHRoIiwic2V0V2lkdGgiLCJzZXRNb2RlIiwiZ2V0TWF4Q29uZGl0aW9ucyIsIl9jcmVhdGVWYWx1ZUhlbHBEaWFsb2ciLCJpc0Ryb3BEb3duTGlzdGUiLCJ0YWJsZVByb21pc2UiLCJmaWx0ZXJCYXJQcm9taXNlIiwiZmlsdGVyQmFyIiwiUHJvbWlzZSIsImFsbCIsInNldEZpbHRlckJhciIsInNldEZpbHRlciIsImluaXRpYWxpemVkIiwic2V0U2VsZWN0aW9uTW9kZSIsIm1kY1RhYmxlIiwiX3NldFNob3dQMTNuQnV0dG9uIiwiX2dldENvbnRlbnRCeUlkIiwiY29udGVudExpc3QiLCJpdGVtIiwiX2NyZWF0ZVBvcG92ZXJDb250ZW50IiwiY2FzZVNlbnNpdGl2ZSIsInVzZUFzVmFsdWVIZWxwIiwiTVRhYmxlIiwiZ3JvdXAiLCJfY3JlYXRlRGlhbG9nQ29udGVudCIsImZvcmNlQmluZCIsIk1EQ1RhYmxlIiwiX3Nob3dDb25kaXRpb25zQ29udGVudCIsImNvbnRhaW5lciIsImNvbmRpdGlvbnNDb250ZW50Iiwic2V0VmlzaWJsZSIsIkNvbmRpdGlvbnMiLCJhZGRDb250ZW50IiwiX2FsaWduT3JDcmVhdGVDb250ZW50Iiwic2hvd0NvbmRpdGlvblBhbmVsIiwiZ2V0Q29udGVudCIsIkZldGNoVmFsdWVzIiwiaW5zZXJ0Q29udGVudCIsIl9wcmVwYXJlVmFsdWVIZWxwVHlwZUFoZWFkIiwiZmlyc3RUeXBlQWhlYWRDb250ZW50IiwicXVhbGlmaWVyRm9yVHlwZWFoZWFkIiwiZGF0YSIsInN1YlZhbHVlTGlzdEluZm8iLCJnZXRVc2VBc1ZhbHVlSGVscCIsInJlbW92ZUNvbnRlbnQiLCJfcHJlcGFyZVZhbHVlSGVscERpYWxvZyIsInNlbGVjdGVkQ29udGVudElkIiwiY29udGVudExpc3RJdGVtIiwic2VsZWN0ZWRJbmZvIiwic2VsZWN0ZWRDb250ZW50IiwidGl0bGUiLCJnZXRUcmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nIiwic2V0VGl0bGUiLCJzaG93VmFsdWVMaXN0IiwiZ2V0Q2FzZVNlbnNpdGl2ZSIsImdldFRhYmxlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWYWx1ZUxpc3RIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgQ29tbW9uQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCBMb2csIHsgTGV2ZWwgfSBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgT2JqZWN0UGF0aCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9PYmplY3RQYXRoXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5LFxuXHRnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5LFxuXHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVxufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUsIGdldFR5cGVDb25maWcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbFV0aWwsIHsgdHlwZSBBbm5vdGF0aW9uc0ZvckNvbGxlY3Rpb24gfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9PRGF0YU1ldGFNb2RlbFV0aWxcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvbS9UYWJsZVwiO1xuaW1wb3J0IFV0aWwgZnJvbSBcInNhcC9tL3RhYmxlL1V0aWxcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgUmVtIGZyb20gXCJzYXAvdWkvZG9tL3VuaXRzL1JlbVwiO1xuaW1wb3J0IHR5cGUgRmllbGQgZnJvbSBcInNhcC91aS9tZGMvRmllbGRcIjtcbmltcG9ydCB0eXBlIEZpZWxkQmFzZSBmcm9tIFwic2FwL3VpL21kYy9maWVsZC9GaWVsZEJhc2VcIjtcbmltcG9ydCB0eXBlIE1kY0ZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9maWx0ZXJiYXIvRmlsdGVyQmFyQmFzZVwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyRmllbGQgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyRmllbGRcIjtcbmltcG9ydCB0eXBlIE11bHRpVmFsdWVGaWVsZCBmcm9tIFwic2FwL3VpL21kYy9NdWx0aVZhbHVlRmllbGRcIjtcbmltcG9ydCB0eXBlIE1kY0lubmVyVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIFZhbHVlSGVscCBmcm9tIFwic2FwL3VpL21kYy9WYWx1ZUhlbHBcIjtcbmltcG9ydCB0eXBlIENvbnRhaW5lciBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvYmFzZS9Db250YWluZXJcIjtcbmltcG9ydCB0eXBlIENvbnRlbnQgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2Jhc2UvQ29udGVudFwiO1xuaW1wb3J0IENvbmRpdGlvbnMgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2NvbnRlbnQvQ29uZGl0aW9uc1wiO1xuaW1wb3J0IE1EQ1RhYmxlLCB7IHR5cGUgJE1EQ1RhYmxlU2V0dGluZ3MgfSBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvY29udGVudC9NRENUYWJsZVwiO1xuaW1wb3J0IE1UYWJsZSwgeyB0eXBlICRNVGFibGVTZXR0aW5ncyB9IGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9jb250ZW50L01UYWJsZVwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgT0RhdGFUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdHlwZS9PRGF0YVR5cGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuXG5leHBvcnQgdHlwZSBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyID0ge1xuXHQkVHlwZTogc3RyaW5nO1xuXHRWYWx1ZUxpc3RQcm9wZXJ0eTogc3RyaW5nO1xuXHRMb2NhbERhdGFQcm9wZXJ0eT86IHtcblx0XHQkUHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdH07XG5cdENvbnN0YW50Pzogc3RyaW5nO1xuXHRJbml0aWFsVmFsdWVJc1NpZ25pZmljYW50PzogYm9vbGVhbjtcbn07XG5cbi8vIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RUeXBlXG5leHBvcnQgdHlwZSBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSA9IHtcblx0JFR5cGU6IHN0cmluZzsgLy8gQ29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFR5cGU7XG5cdExhYmVsPzogc3RyaW5nO1xuXHRDb2xsZWN0aW9uUGF0aDogc3RyaW5nO1xuXHRDb2xsZWN0aW9uUm9vdD86IHN0cmluZztcblx0RGlzdGluY3RWYWx1ZXNTdXBwb3J0ZWQ/OiBib29sZWFuO1xuXHRTZWFyY2hTdXBwb3J0ZWQ/OiBib29sZWFuO1xuXHRGZXRjaFZhbHVlcz86IG51bWJlcjtcblx0UHJlc2VudGF0aW9uVmFyaWFudFF1YWxpZmllcj86IHN0cmluZztcblx0U2VsZWN0aW9uVmFyaWFudFF1YWxpZmllcj86IHN0cmluZztcblx0UGFyYW1ldGVyczogQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlcltdO1xuXHQkbW9kZWw6IE9EYXRhTW9kZWw7XG59O1xuXG5leHBvcnQgdHlwZSBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZUJ5UXVhbGlmaWVyID0gUmVjb3JkPHN0cmluZywgQW5ub3RhdGlvblZhbHVlTGlzdFR5cGU+O1xuXG5jb25zdCBjb2x1bW5Ob3RBbHJlYWR5RGVmaW5lZCA9IChjb2x1bW5EZWZzOiBDb2x1bW5EZWZbXSwgdmhLZXk6IHN0cmluZyk6IGJvb2xlYW4gPT4gIWNvbHVtbkRlZnMuc29tZSgoY29sdW1uKSA9PiBjb2x1bW4ucGF0aCA9PT0gdmhLZXkpO1xuXG5leHBvcnQgY29uc3QgQW5ub3RhdGlvbkxhYmVsID0gXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCIsXG5cdEFubm90YXRpb25UZXh0ID0gXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIixcblx0QW5ub3RhdGlvblRleHRVSVRleHRBcnJhbmdlbWVudCA9IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFwiLFxuXHRBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVySW4gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJJblwiLFxuXHRBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyQ29uc3RhbnQgPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJDb25zdGFudFwiLFxuXHRBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyT3V0ID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVyT3V0XCIsXG5cdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dCA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckluT3V0XCIsXG5cdEFubm90YXRpb25WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMgPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzXCI7XG5cbnR5cGUgQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eSA9IHtcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFwiPzoge1xuXHRcdFNlYXJjaFN1cHBvcnRlZD86IGJvb2xlYW47XG5cdH07XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbFwiPzogc3RyaW5nOyAvLyBBbm5vdGF0aW9uTGFiZWxcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIj86IHtcblx0XHQvLyBBbm5vdGF0aW9uVGV4dFxuXHRcdCRQYXRoOiBzdHJpbmc7XG5cdH07XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFwiPzoge1xuXHRcdC8vIEFubm90YXRpb25UZXh0VUlUZXh0QXJyYW5nZW1lbnRcblx0XHQkRW51bU1lbWJlcj86IHN0cmluZztcblx0fTtcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuRmlsdGVyXCI/OiBib29sZWFuO1xuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzXCI/OiBib29sZWFuOyAvLyBBbm5vdGF0aW9uVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzXG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnNcIj86IHN0cmluZ1tdO1xuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIj86IHN0cmluZztcbn07XG5cbnR5cGUgQW5ub3RhdGlvblNlbGVjdGlvbkZpZWxkID0ge1xuXHQkUHJvcGVydHlQYXRoOiBzdHJpbmc7XG59O1xuXG50eXBlIEFubm90YXRpb25zRm9yRW50aXR5VHlwZSA9IHtcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCI/OiBBbm5vdGF0aW9uU2VsZWN0aW9uRmllbGRbXTtcbn07XG5cbnR5cGUgQ29sdW1uUHJvcGVydHkgPSB7XG5cdCRUeXBlOiBzdHJpbmc7XG5cdCRraW5kOiBzdHJpbmc7XG5cdCRpc0NvbGxlY3Rpb246IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBJbk91dFBhcmFtZXRlciA9IHtcblx0cGFybWV0ZXJUeXBlOiBzdHJpbmc7XG5cdHNvdXJjZTogc3RyaW5nO1xuXHRoZWxwUGF0aDogc3RyaW5nO1xuXHRpbml0aWFsVmFsdWVGaWx0ZXJFbXB0eTogYm9vbGVhbjtcblx0Y29uc3RhbnRWYWx1ZT86IHN0cmluZyB8IGJvb2xlYW47XG59O1xuXG50eXBlIFZhbHVlSGVscFBheWxvYWRJbmZvID0ge1xuXHR2aEtleXM/OiBzdHJpbmdbXTtcblx0dmhQYXJhbWV0ZXJzPzogSW5PdXRQYXJhbWV0ZXJbXTtcbn07XG5cbnR5cGUgVmFsdWVIZWxwUXVhbGlmaWVyTWFwID0gUmVjb3JkPHN0cmluZywgVmFsdWVIZWxwUGF5bG9hZEluZm8+O1xuXG5leHBvcnQgdHlwZSBWYWx1ZUhlbHBQYXlsb2FkID0ge1xuXHRwcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0cXVhbGlmaWVyczogVmFsdWVIZWxwUXVhbGlmaWVyTWFwO1xuXHR2YWx1ZUhlbHBRdWFsaWZpZXI6IHN0cmluZztcblx0Y29uZGl0aW9uTW9kZWw/OiBhbnk7XG5cdGlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nPzogYm9vbGVhbjtcblx0aXNVbml0VmFsdWVIZWxwPzogYm9vbGVhbjtcblx0cmVxdWVzdEdyb3VwSWQ/OiBzdHJpbmc7XG5cdHVzZU11bHRpVmFsdWVGaWVsZD86IGJvb2xlYW47XG5cdGlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzPzogYm9vbGVhbjtcbn07XG5cbnR5cGUgQ29sdW1uRGVmID0ge1xuXHRwYXRoOiBzdHJpbmc7XG5cdGxhYmVsOiBzdHJpbmc7XG5cdHNvcnRhYmxlOiBib29sZWFuO1xuXHRmaWx0ZXJhYmxlOiBib29sZWFuIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdCRUeXBlOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBWYWx1ZUxpc3RJbmZvID0ge1xuXHRrZXlWYWx1ZTogc3RyaW5nO1xuXHRkZXNjcmlwdGlvblZhbHVlOiBzdHJpbmc7XG5cdGZpZWxkUHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdHZoS2V5czogc3RyaW5nW107XG5cdHZoUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXTtcblx0dmFsdWVMaXN0SW5mbzogQW5ub3RhdGlvblZhbHVlTGlzdFR5cGU7XG5cdGNvbHVtbkRlZnM6IENvbHVtbkRlZltdO1xuXHR2YWx1ZUhlbHBRdWFsaWZpZXI6IHN0cmluZztcbn07XG5cbnR5cGUgRGlzcGxheUZvcm1hdCA9IFwiRGVzY3JpcHRpb25cIiB8IFwiVmFsdWVEZXNjcmlwdGlvblwiIHwgXCJWYWx1ZVwiIHwgXCJEZXNjcmlwdGlvblZhbHVlXCI7XG5cbnR5cGUgUGF0aCA9IHtcblx0ZmllbGRQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0ZGVzY3JpcHRpb25QYXRoOiBzdHJpbmc7XG5cdGtleTogc3RyaW5nO1xufTtcblxuZnVuY3Rpb24gX2dldERlZmF1bHRTb3J0UHJvcGVydHlOYW1lKHZhbHVlTGlzdEluZm86IEFubm90YXRpb25WYWx1ZUxpc3RUeXBlKSB7XG5cdGxldCBzb3J0RmllbGROYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGNvbnN0IG1ldGFNb2RlbCA9IHZhbHVlTGlzdEluZm8uJG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRjb25zdCBlbnRpdHlTZXRBbm5vdGF0aW9ucyA9IChtZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHt2YWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofUBgKSB8fCB7fSkgYXMgQW5ub3RhdGlvbnNGb3JDb2xsZWN0aW9uO1xuXHRjb25zdCBzb3J0UmVzdHJpY3Rpb25zSW5mbyA9IE9EYXRhTWV0YU1vZGVsVXRpbC5nZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyhlbnRpdHlTZXRBbm5vdGF0aW9ucyk7XG5cdGNvbnN0IGZvdW5kRWxlbWVudCA9IHZhbHVlTGlzdEluZm8uUGFyYW1ldGVycy5maW5kKGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdChlbGVtZW50LiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXQgfHxcblx0XHRcdFx0ZWxlbWVudC4kVHlwZSA9PT0gQ29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlck91dCB8fFxuXHRcdFx0XHRlbGVtZW50LiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVyRGlzcGxheU9ubHkpICYmXG5cdFx0XHQhKFxuXHRcdFx0XHRtZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHt2YWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofS8ke2VsZW1lbnQuVmFsdWVMaXN0UHJvcGVydHl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbmApID09PVxuXHRcdFx0XHR0cnVlXG5cdFx0XHQpXG5cdFx0KTtcblx0fSk7XG5cdGlmIChmb3VuZEVsZW1lbnQpIHtcblx0XHRpZiAoXG5cdFx0XHRtZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRgLyR7dmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH0vJHtmb3VuZEVsZW1lbnQuVmFsdWVMaXN0UHJvcGVydHl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudC8kRW51bU1lbWJlcmBcblx0XHRcdCkgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiXG5cdFx0KSB7XG5cdFx0XHRzb3J0RmllbGROYW1lID0gbWV0YU1vZGVsLmdldE9iamVjdChcblx0XHRcdFx0YC8ke3ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9LyR7Zm91bmRFbGVtZW50LlZhbHVlTGlzdFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dC8kUGF0aGBcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNvcnRGaWVsZE5hbWUgPSBmb3VuZEVsZW1lbnQuVmFsdWVMaXN0UHJvcGVydHk7XG5cdFx0fVxuXHR9XG5cdGlmIChzb3J0RmllbGROYW1lICYmICghc29ydFJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3NvcnRGaWVsZE5hbWVdIHx8IHNvcnRSZXN0cmljdGlvbnNJbmZvLnByb3BlcnR5SW5mb1tzb3J0RmllbGROYW1lXS5zb3J0YWJsZSkpIHtcblx0XHRyZXR1cm4gc29ydEZpZWxkTmFtZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9yZWR1bmRhbnREZXNjcmlwdGlvbihvVkxQYXJhbWV0ZXI6IGFueSwgYUNvbHVtbkluZm86IGFueVtdKSB7XG5cdGNvbnN0IG9Db2x1bW5JbmZvID0gYUNvbHVtbkluZm8uZmluZChmdW5jdGlvbiAoY29sdW1uSW5mbzogYW55KSB7XG5cdFx0cmV0dXJuIG9WTFBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSA9PT0gY29sdW1uSW5mby50ZXh0Q29sdW1uTmFtZTtcblx0fSk7XG5cdGlmIChcblx0XHRvVkxQYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHkgPT09IG9Db2x1bW5JbmZvPy50ZXh0Q29sdW1uTmFtZSAmJlxuXHRcdCFvQ29sdW1uSW5mby5rZXlDb2x1bW5IaWRkZW4gJiZcblx0XHRvQ29sdW1uSW5mby5rZXlDb2x1bW5EaXNwbGF5Rm9ybWF0ICE9PSBcIlZhbHVlXCJcblx0KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gX2hhc0ltcG9ydGFuY2VIaWdoKG9WYWx1ZUxpc3RDb250ZXh0OiBhbnkpIHtcblx0cmV0dXJuIG9WYWx1ZUxpc3RDb250ZXh0LlBhcmFtZXRlcnMuc29tZShmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdG9QYXJhbWV0ZXJbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZVwiXSAmJlxuXHRcdFx0b1BhcmFtZXRlcltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCJdLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VUeXBlL0hpZ2hcIlxuXHRcdCk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBfYnVpbGQkU2VsZWN0U3RyaW5nKGNvbnRyb2w6IGFueSkge1xuXHRjb25zdCBvVmlld0RhdGEgPSBjb250cm9sLmdldE1vZGVsKFwidmlld0RhdGFcIik7XG5cdGlmIChvVmlld0RhdGEpIHtcblx0XHRjb25zdCBvRGF0YSA9IG9WaWV3RGF0YS5nZXREYXRhKCk7XG5cdFx0aWYgKG9EYXRhKSB7XG5cdFx0XHRjb25zdCBhQ29sdW1ucyA9IG9EYXRhLmNvbHVtbnM7XG5cdFx0XHRpZiAoYUNvbHVtbnMpIHtcblx0XHRcdFx0cmV0dXJuIGFDb2x1bW5zLnJlZHVjZShmdW5jdGlvbiAoc1F1ZXJ5OiBhbnksIG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdFx0Ly8gTmF2aWdhdGlvbiBwcm9wZXJ0aWVzIChyZXByZXNlbnRlZCBieSBYL1kpIHNob3VsZCBub3QgYmUgYWRkZWQgdG8gJHNlbGVjdC5cblx0XHRcdFx0XHQvLyBUT0RPIDogVGhleSBzaG91bGQgYmUgYWRkZWQgYXMgJGV4cGFuZD1YKCRzZWxlY3Q9WSkgaW5zdGVhZFxuXHRcdFx0XHRcdGlmIChvUHJvcGVydHkucGF0aCAmJiBvUHJvcGVydHkucGF0aC5pbmRleE9mKFwiL1wiKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdHNRdWVyeSA9IHNRdWVyeSA/IGAke3NRdWVyeX0sJHtvUHJvcGVydHkucGF0aH1gIDogb1Byb3BlcnR5LnBhdGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBzUXVlcnk7XG5cdFx0XHRcdH0sIHVuZGVmaW5lZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIF9nZXRWYWx1ZUhlbHBDb2x1bW5EaXNwbGF5Rm9ybWF0KG9Qcm9wZXJ0eUFubm90YXRpb25zOiBhbnksIGlzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzOiBhbnkpIHtcblx0Y29uc3Qgc0Rpc3BsYXlNb2RlID0gQ29tbW9uVXRpbHMuY29tcHV0ZURpc3BsYXlNb2RlKG9Qcm9wZXJ0eUFubm90YXRpb25zLCB1bmRlZmluZWQpO1xuXHRjb25zdCBvVGV4dEFubm90YXRpb24gPSBvUHJvcGVydHlBbm5vdGF0aW9ucyAmJiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXTtcblx0Y29uc3Qgb1RleHRBcnJhbmdlbWVudEFubm90YXRpb24gPVxuXHRcdG9UZXh0QW5ub3RhdGlvbiAmJiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl07XG5cdGlmIChpc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcykge1xuXHRcdHJldHVybiBvVGV4dEFubm90YXRpb24gJiYgdHlwZW9mIG9UZXh0QW5ub3RhdGlvbiAhPT0gXCJzdHJpbmdcIiAmJiBvVGV4dEFubm90YXRpb24uJFBhdGggPyBzRGlzcGxheU1vZGUgOiBcIlZhbHVlXCI7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gT25seSBleHBsaWNpdCBkZWZpbmVkIFRleHRBcnJhbmdlbWVudHMgaW4gYSBWYWx1ZSBIZWxwIHdpdGggRGlhbG9nIGFyZSBjb25zaWRlcmVkXG5cdFx0cmV0dXJuIG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID8gc0Rpc3BsYXlNb2RlIDogXCJWYWx1ZVwiO1xuXHR9XG59XG5cbmNvbnN0IFZhbHVlTGlzdEhlbHBlciA9IHtcblx0Z2V0VmFsdWVMaXN0Q29sbGVjdGlvbkVudGl0eVNldDogZnVuY3Rpb24gKG9WYWx1ZUxpc3RDb250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBtVmFsdWVMaXN0ID0gb1ZhbHVlTGlzdENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0cmV0dXJuIG1WYWx1ZUxpc3QuJG1vZGVsLmdldE1ldGFNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAvJHttVmFsdWVMaXN0LkNvbGxlY3Rpb25QYXRofWApO1xuXHR9LFxuXG5cdGdldFRhYmxlRGVsZWdhdGU6IGZ1bmN0aW9uIChvVmFsdWVMaXN0OiBhbnkpIHtcblx0XHRsZXQgc0RlZmF1bHRTb3J0UHJvcGVydHlOYW1lID0gX2dldERlZmF1bHRTb3J0UHJvcGVydHlOYW1lKG9WYWx1ZUxpc3QpO1xuXHRcdGlmIChzRGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUpIHtcblx0XHRcdHNEZWZhdWx0U29ydFByb3BlcnR5TmFtZSA9IGAnJHtzRGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWV9J2A7XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0XHRcIntuYW1lOiAnc2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVGFibGVEZWxlZ2F0ZScsIHBheWxvYWQ6IHtjb2xsZWN0aW9uTmFtZTogJ1wiICtcblx0XHRcdG9WYWx1ZUxpc3QuQ29sbGVjdGlvblBhdGggK1xuXHRcdFx0XCInXCIgK1xuXHRcdFx0KHNEZWZhdWx0U29ydFByb3BlcnR5TmFtZSA/IFwiLCBkZWZhdWx0U29ydFByb3BlcnR5TmFtZTogXCIgKyBzRGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUgOiBcIlwiKSArXG5cdFx0XHRcIn19XCJcblx0XHQpO1xuXHR9LFxuXG5cdGdldFNvcnRDb25kaXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQ6IGZ1bmN0aW9uICh2YWx1ZUxpc3RJbmZvOiBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSwgaXNTdWdnZXN0aW9uOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgcHJlc2VudGF0aW9uVmFyaWFudFF1YWxpZmllciA9XG5cdFx0XHRcdHZhbHVlTGlzdEluZm8uUHJlc2VudGF0aW9uVmFyaWFudFF1YWxpZmllciA9PT0gXCJcIiA/IFwiXCIgOiBgIyR7dmFsdWVMaXN0SW5mby5QcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyfWAsXG5cdFx0XHRwcmVzZW50YXRpb25WYXJpYW50UGF0aCA9IGAvJHt2YWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudCR7cHJlc2VudGF0aW9uVmFyaWFudFF1YWxpZmllcn1gO1xuXHRcdGNvbnN0IHByZXNlbnRhdGlvblZhcmlhbnQgPSB2YWx1ZUxpc3RJbmZvLiRtb2RlbC5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QocHJlc2VudGF0aW9uVmFyaWFudFBhdGgpO1xuXHRcdGlmIChwcmVzZW50YXRpb25WYXJpYW50ICYmIHByZXNlbnRhdGlvblZhcmlhbnQuU29ydE9yZGVyKSB7XG5cdFx0XHRjb25zdCBzb3J0Q29uZGl0aW9uczogYW55ID0ge1xuXHRcdFx0XHRzb3J0ZXJzOiBbXVxuXHRcdFx0fTtcblx0XHRcdGlmIChpc1N1Z2dlc3Rpb24pIHtcblx0XHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudC5Tb3J0T3JkZXIuZm9yRWFjaChmdW5jdGlvbiAoY29uZGl0aW9uOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzb3J0ZXI6IGFueSA9IHt9O1xuXHRcdFx0XHRcdHNvcnRlci5wYXRoID0gY29uZGl0aW9uLlByb3BlcnR5LiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdFx0aWYgKGNvbmRpdGlvbi5EZXNjZW5kaW5nKSB7XG5cdFx0XHRcdFx0XHRzb3J0ZXIuZGVzY2VuZGluZyA9IHRydWU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNvcnRlci5hc2NlbmRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzb3J0Q29uZGl0aW9ucy5zb3J0ZXJzLnB1c2goc29ydGVyKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBgc29ydGVyOiAke0pTT04uc3RyaW5naWZ5KHNvcnRDb25kaXRpb25zLnNvcnRlcnMpfWA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50LlNvcnRPcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChjb25kaXRpb246IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IHNvcnRlcjogYW55ID0ge307XG5cdFx0XHRcdFx0c29ydGVyLm5hbWUgPSBjb25kaXRpb24uUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRpZiAoY29uZGl0aW9uLkRlc2NlbmRpbmcpIHtcblx0XHRcdFx0XHRcdHNvcnRlci5kZXNjZW5kaW5nID0gdHJ1ZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c29ydGVyLmFzY2VuZGluZyA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNvcnRDb25kaXRpb25zLnNvcnRlcnMucHVzaChzb3J0ZXIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHNvcnRDb25kaXRpb25zKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHRnZXRQcm9wZXJ0eVBhdGg6IGZ1bmN0aW9uIChvUGFyYW1ldGVyczogYW55KSB7XG5cdFx0cmV0dXJuICFvUGFyYW1ldGVycy5VbmJvdW5kQWN0aW9uXG5cdFx0XHQ/IGAke29QYXJhbWV0ZXJzLkVudGl0eVR5cGVQYXRofS8ke29QYXJhbWV0ZXJzLkFjdGlvbn0vJHtvUGFyYW1ldGVycy5Qcm9wZXJ0eX1gXG5cdFx0XHQ6IGAvJHtvUGFyYW1ldGVycy5BY3Rpb24uc3Vic3RyaW5nKG9QYXJhbWV0ZXJzLkFjdGlvbi5sYXN0SW5kZXhPZihcIi5cIikgKyAxKX0vJHtvUGFyYW1ldGVycy5Qcm9wZXJ0eX1gO1xuXHR9LFxuXG5cdGdldFZhbHVlTGlzdFByb3BlcnR5OiBmdW5jdGlvbiAob1Byb3BlcnR5Q29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb1ZhbHVlTGlzdE1vZGVsID0gb1Byb3BlcnR5Q29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGNvbnN0IG1WYWx1ZUxpc3QgPSBvVmFsdWVMaXN0TW9kZWwuZ2V0T2JqZWN0KFwiL1wiKTtcblx0XHRyZXR1cm4gbVZhbHVlTGlzdC4kbW9kZWwuZ2V0TWV0YU1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke21WYWx1ZUxpc3QuQ29sbGVjdGlvblBhdGh9LyR7b1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoKX1gKTtcblx0fSxcblxuXHQvLyBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgZm9yIHZhbHVlIGhlbHAgbS10YWJsZSBhbmQgbWRjLXRhYmxlXG5cdGdldENvbHVtblZpc2liaWxpdHk6IGZ1bmN0aW9uIChvVmFsdWVMaXN0OiBhbnksIG9WTFBhcmFtZXRlcjogYW55LCBvU291cmNlOiBhbnkpIHtcblx0XHRjb25zdCBpc0Ryb3BEb3duTGlzdCA9IG9Tb3VyY2UgJiYgISFvU291cmNlLnZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcyxcblx0XHRcdG9Db2x1bW5JbmZvID0gb1NvdXJjZS5jb2x1bW5JbmZvLFxuXHRcdFx0aXNWaXNpYmxlID0gIV9yZWR1bmRhbnREZXNjcmlwdGlvbihvVkxQYXJhbWV0ZXIsIG9Db2x1bW5JbmZvLmNvbHVtbkluZm9zKSxcblx0XHRcdGlzRGlhbG9nVGFibGUgPSBvQ29sdW1uSW5mby5pc0RpYWxvZ1RhYmxlO1xuXG5cdFx0aWYgKGlzRHJvcERvd25MaXN0IHx8ICghaXNEcm9wRG93bkxpc3QgJiYgaXNEaWFsb2dUYWJsZSkgfHwgKCFpc0Ryb3BEb3duTGlzdCAmJiAhX2hhc0ltcG9ydGFuY2VIaWdoKG9WYWx1ZUxpc3QpKSkge1xuXHRcdFx0Y29uc3QgY29sdW1uV2l0aEhpZGRlbkFubm90YXRpb24gPSBvQ29sdW1uSW5mby5jb2x1bW5JbmZvcy5maW5kKGZ1bmN0aW9uIChjb2x1bW5JbmZvOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9WTFBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSA9PT0gY29sdW1uSW5mby5jb2x1bW5OYW1lICYmIGNvbHVtbkluZm8uaGFzSGlkZGVuQW5ub3RhdGlvbiA9PT0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuICFjb2x1bW5XaXRoSGlkZGVuQW5ub3RhdGlvbiA/IGlzVmlzaWJsZSA6IGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoIWlzRHJvcERvd25MaXN0ICYmIF9oYXNJbXBvcnRhbmNlSGlnaChvVmFsdWVMaXN0KSkge1xuXHRcdFx0cmV0dXJuIG9WTFBhcmFtZXRlciAmJlxuXHRcdFx0XHRvVkxQYXJhbWV0ZXJbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZVwiXSAmJlxuXHRcdFx0XHRvVkxQYXJhbWV0ZXJbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZVwiXS4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlVHlwZS9IaWdoXCJcblx0XHRcdFx0PyB0cnVlXG5cdFx0XHRcdDogZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdGdldENvbHVtblZpc2liaWxpdHlJbmZvOiBmdW5jdGlvbiAob1ZhbHVlTGlzdDogYW55LCBzUHJvcGVydHlGdWxsUGF0aDogYW55LCBiSXNEcm9wRG93bkxpc3RlOiBhbnksIGlzRGlhbG9nVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvVmFsdWVMaXN0LiRtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBhQ29sdW1uSW5mb3M6IGFueVtdID0gW107XG5cdFx0Y29uc3Qgb0NvbHVtbkluZm9zID0ge1xuXHRcdFx0aXNEaWFsb2dUYWJsZTogaXNEaWFsb2dUYWJsZSxcblx0XHRcdGNvbHVtbkluZm9zOiBhQ29sdW1uSW5mb3Ncblx0XHR9O1xuXG5cdFx0b1ZhbHVlTGlzdC5QYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1Byb3BlcnR5QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7b1ZhbHVlTGlzdC5Db2xsZWN0aW9uUGF0aH0vJHtvUGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5fUBgKTtcblx0XHRcdGNvbnN0IG9UZXh0QW5ub3RhdGlvbiA9IG9Qcm9wZXJ0eUFubm90YXRpb25zICYmIG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdO1xuXHRcdFx0bGV0IGNvbHVtbkluZm86IGFueSA9IHt9O1xuXHRcdFx0aWYgKG9UZXh0QW5ub3RhdGlvbikge1xuXHRcdFx0XHRjb2x1bW5JbmZvID0ge1xuXHRcdFx0XHRcdGtleUNvbHVtbkhpZGRlbjogb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdID8gdHJ1ZSA6IGZhbHNlLFxuXHRcdFx0XHRcdGtleUNvbHVtbkRpc3BsYXlGb3JtYXQ6IG9UZXh0QW5ub3RhdGlvbiAmJiBfZ2V0VmFsdWVIZWxwQ29sdW1uRGlzcGxheUZvcm1hdChvUHJvcGVydHlBbm5vdGF0aW9ucywgYklzRHJvcERvd25MaXN0ZSksXG5cdFx0XHRcdFx0dGV4dENvbHVtbk5hbWU6IG9UZXh0QW5ub3RhdGlvbiAmJiBvVGV4dEFubm90YXRpb24uJFBhdGgsXG5cdFx0XHRcdFx0Y29sdW1uTmFtZTogb1BhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdFx0XHRoYXNIaWRkZW5Bbm5vdGF0aW9uOiBvUHJvcGVydHlBbm5vdGF0aW9ucyAmJiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0gPyB0cnVlIDogZmFsc2Vcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSBpZiAob1Byb3BlcnR5QW5ub3RhdGlvbnMgJiYgb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdKSB7XG5cdFx0XHRcdGNvbHVtbkluZm8gPSB7XG5cdFx0XHRcdFx0Y29sdW1uTmFtZTogb1BhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdFx0XHRoYXNIaWRkZW5Bbm5vdGF0aW9uOiBvUHJvcGVydHlBbm5vdGF0aW9ucyAmJiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0gPyB0cnVlIDogZmFsc2Vcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdG9Db2x1bW5JbmZvcy5jb2x1bW5JbmZvcy5wdXNoKGNvbHVtbkluZm8pO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG9Db2x1bW5JbmZvcztcblx0fSxcblxuXHRnZXRUYWJsZUl0ZW1zUGFyYW1ldGVyczogZnVuY3Rpb24gKFxuXHRcdHZhbHVlTGlzdEluZm86IEFubm90YXRpb25WYWx1ZUxpc3RUeXBlLFxuXHRcdHJlcXVlc3RHcm91cElkOiBzdHJpbmcsXG5cdFx0aXNTdWdnZXN0aW9uOiBib29sZWFuLFxuXHRcdGlzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzOiBib29sZWFuXG5cdCkge1xuXHRcdGNvbnN0IGl0ZW1QYXJhbWV0ZXJzID0gW2BwYXRoOiAnLyR7dmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH0nYF07XG5cblx0XHQvLyBhZGQgc2VsZWN0IHRvIG9CaW5kaW5nSW5mbyAoQkNQIDIxODAyNTU5NTYgLyAyMTcwMTYzMDEyKVxuXHRcdGNvbnN0IHNlbGVjdFN0cmluZyA9IF9idWlsZCRTZWxlY3RTdHJpbmcodGhpcyk7XG5cblx0XHRpZiAocmVxdWVzdEdyb3VwSWQpIHtcblx0XHRcdGNvbnN0IHNlbGVjdFN0cmluZ1BhcnQgPSBzZWxlY3RTdHJpbmcgPyBgLCAnJHtzZWxlY3RTdHJpbmd9J2AgOiBcIlwiO1xuXG5cdFx0XHRpdGVtUGFyYW1ldGVycy5wdXNoKGBwYXJhbWV0ZXJzOiB7JCRncm91cElkOiAnJHtyZXF1ZXN0R3JvdXBJZH0nJHtzZWxlY3RTdHJpbmdQYXJ0fX1gKTtcblx0XHR9IGVsc2UgaWYgKHNlbGVjdFN0cmluZykge1xuXHRcdFx0aXRlbVBhcmFtZXRlcnMucHVzaChgcGFyYW1ldGVyczogeyRzZWxlY3Q6ICcke3NlbGVjdFN0cmluZ30nfWApO1xuXHRcdH1cblxuXHRcdGNvbnN0IGlzU3VzcGVuZGVkID0gdmFsdWVMaXN0SW5mby5QYXJhbWV0ZXJzLnNvbWUoZnVuY3Rpb24gKG9QYXJhbWV0ZXIpIHtcblx0XHRcdHJldHVybiBpc1N1Z2dlc3Rpb24gfHwgb1BhcmFtZXRlci4kVHlwZSA9PT0gQ29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlckluO1xuXHRcdH0pO1xuXHRcdGl0ZW1QYXJhbWV0ZXJzLnB1c2goYHN1c3BlbmRlZDogJHtpc1N1c3BlbmRlZH1gKTtcblxuXHRcdGlmICghaXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMpIHtcblx0XHRcdGl0ZW1QYXJhbWV0ZXJzLnB1c2goXCJsZW5ndGg6IDEwXCIpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNvcnRDb25kaXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQgPSBWYWx1ZUxpc3RIZWxwZXIuZ2V0U29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCh2YWx1ZUxpc3RJbmZvLCBpc1N1Z2dlc3Rpb24pO1xuXG5cdFx0aWYgKHNvcnRDb25kaXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdGl0ZW1QYXJhbWV0ZXJzLnB1c2goc29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCk7XG5cdFx0fSBlbHNlIGlmIChpc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcykge1xuXHRcdFx0Y29uc3QgZGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUgPSBfZ2V0RGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUodmFsdWVMaXN0SW5mbyk7XG5cblx0XHRcdGlmIChkZWZhdWx0U29ydFByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRpdGVtUGFyYW1ldGVycy5wdXNoKGBzb3J0ZXI6IFt7cGF0aDogJyR7ZGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWV9JywgYXNjZW5kaW5nOiB0cnVlfV1gKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gXCJ7XCIgKyBpdGVtUGFyYW1ldGVycy5qb2luKFwiLCBcIikgKyBcIn1cIjtcblx0fSxcblxuXHQvLyBJcyBuZWVkZWQgZm9yIFwiZXh0ZXJuYWxcIiByZXByZXNlbnRhdGlvbiBpbiBxdW5pdFxuXHRoYXNJbXBvcnRhbmNlOiBmdW5jdGlvbiAob1ZhbHVlTGlzdENvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiBfaGFzSW1wb3J0YW5jZUhpZ2gob1ZhbHVlTGlzdENvbnRleHQuZ2V0T2JqZWN0KCkpID8gXCJJbXBvcnRhbmNlL0hpZ2hcIiA6IFwiTm9uZVwiO1xuXHR9LFxuXG5cdC8vIElzIG5lZWRlZCBmb3IgXCJleHRlcm5hbFwiIHJlcHJlc2VudGF0aW9uIGluIHF1bml0XG5cdGdldE1pblNjcmVlbldpZHRoOiBmdW5jdGlvbiAob1ZhbHVlTGlzdDogYW55KSB7XG5cdFx0cmV0dXJuIF9oYXNJbXBvcnRhbmNlSGlnaChvVmFsdWVMaXN0KSA/IFwiez0gJHtfVkhVST4vbWluU2NyZWVuV2lkdGh9fVwiIDogXCI0MTZweFwiO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGNvbHVtbiB3aWR0aCBmb3IgYSBnaXZlbiBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5UGF0aCBUaGUgcHJvcGVydHlQYXRoXG5cdCAqIEByZXR1cm5zIFRoZSB3aWR0aCBhcyBhIHN0cmluZy5cblx0ICovXG5cdGdldENvbHVtbldpZHRoOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0Y29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0eVBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdGxldCByZWxhdGVkUHJvcGVydHk6IFByb3BlcnR5W10gPSBbcHJvcGVydHldO1xuXHRcdC8vIFRoZSBhZGRpdGlvbmFsIHByb3BlcnR5IGNvdWxkIHJlZmVyIHRvIHRoZSB0ZXh0LCBjdXJyZW5jeSwgdW5pdCBvciB0aW1lem9uZVxuXHRcdGNvbnN0IGFkZGl0aW9uYWxQcm9wZXJ0eSA9XG5cdFx0XHRcdGdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHkocHJvcGVydHkpIHx8XG5cdFx0XHRcdGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5KHByb3BlcnR5KSB8fFxuXHRcdFx0XHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5KHByb3BlcnR5KSB8fFxuXHRcdFx0XHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eShwcm9wZXJ0eSksXG5cdFx0XHR0ZXh0QW5ub3RhdGlvbiA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQsXG5cdFx0XHR0ZXh0QXJyYW5nZW1lbnQgPSB0ZXh0QW5ub3RhdGlvbj8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQ/LnRvU3RyaW5nKCksXG5cdFx0XHRsYWJlbCA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsPy50b1N0cmluZygpLFxuXHRcdFx0ZGlzcGxheU1vZGUgPSB0ZXh0QXJyYW5nZW1lbnQgJiYgZ2V0RGlzcGxheU1vZGUocHJvcGVydHlQYXRoKTtcblx0XHRpZiAoYWRkaXRpb25hbFByb3BlcnR5KSB7XG5cdFx0XHRpZiAoZGlzcGxheU1vZGUgPT09IFwiRGVzY3JpcHRpb25cIikge1xuXHRcdFx0XHRyZWxhdGVkUHJvcGVydHkgPSBbYWRkaXRpb25hbFByb3BlcnR5XTtcblx0XHRcdH0gZWxzZSBpZiAoIXRleHRBbm5vdGF0aW9uIHx8IChkaXNwbGF5TW9kZSAmJiBkaXNwbGF5TW9kZSAhPT0gXCJWYWx1ZVwiKSkge1xuXHRcdFx0XHRyZWxhdGVkUHJvcGVydHkucHVzaChhZGRpdGlvbmFsUHJvcGVydHkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBzaXplID0gMDtcblx0XHRjb25zdCBpbnN0YW5jZXM6IE9EYXRhVHlwZVtdID0gW107XG5cblx0XHRyZWxhdGVkUHJvcGVydHkuZm9yRWFjaCgocHJvcDogUHJvcGVydHkpID0+IHtcblx0XHRcdGNvbnN0IHByb3BlcnR5VHlwZUNvbmZpZyA9IGdldFR5cGVDb25maWcocHJvcCwgdW5kZWZpbmVkKTtcblx0XHRcdGNvbnN0IFByb3BlcnR5T0RhdGFDb25zdHJ1Y3RvciA9IE9iamVjdFBhdGguZ2V0KHByb3BlcnR5VHlwZUNvbmZpZy50eXBlKTtcblx0XHRcdGlmIChQcm9wZXJ0eU9EYXRhQ29uc3RydWN0b3IpIHtcblx0XHRcdFx0aW5zdGFuY2VzLnB1c2gobmV3IFByb3BlcnR5T0RhdGFDb25zdHJ1Y3Rvcihwcm9wZXJ0eVR5cGVDb25maWcuZm9ybWF0T3B0aW9ucywgcHJvcGVydHlUeXBlQ29uZmlnLmNvbnN0cmFpbnRzKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y29uc3Qgc1dpZHRoID0gVXRpbC5jYWxjQ29sdW1uV2lkdGgoaW5zdGFuY2VzLCBsYWJlbCk7XG5cdFx0c2l6ZSA9IHNXaWR0aCA/IHBhcnNlRmxvYXQoc1dpZHRoLnJlcGxhY2UoXCJyZW1cIiwgXCJcIikpIDogMDtcblxuXHRcdGlmIChzaXplID09PSAwKSB7XG5cdFx0XHRMb2cuZXJyb3IoYENhbm5vdCBjb21wdXRlIHRoZSBjb2x1bW4gd2lkdGggZm9yIHByb3BlcnR5OiAke3Byb3BlcnR5Lm5hbWV9YCk7XG5cdFx0fVxuXHRcdHJldHVybiBzaXplIDw9IDIwID8gc2l6ZS50b1N0cmluZygpICsgXCJyZW1cIiA6IFwiMjByZW1cIjtcblx0fSxcblxuXHRnZXRPdXRQYXJhbWV0ZXJQYXRoczogZnVuY3Rpb24gKGFQYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRsZXQgc1BhdGggPSBcIlwiO1xuXHRcdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdFx0aWYgKG9QYXJhbWV0ZXIuJFR5cGUuZW5kc1dpdGgoXCJPdXRcIikpIHtcblx0XHRcdFx0c1BhdGggKz0gYHske29QYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHl9fWA7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHNQYXRoO1xuXHR9LFxuXG5cdGVudGl0eUlzU2VhcmNoYWJsZTogZnVuY3Rpb24gKHByb3BlcnR5QW5ub3RhdGlvbnM6IEFubm90YXRpb25zRm9yUHJvcGVydHksIGNvbGxlY3Rpb25Bbm5vdGF0aW9uczogQW5ub3RhdGlvbnNGb3JDb2xsZWN0aW9uKTogYm9vbGVhbiB7XG5cdFx0Y29uc3Qgc2VhcmNoU3VwcG9ydGVkID0gcHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdPy5TZWFyY2hTdXBwb3J0ZWQsXG5cdFx0XHRzZWFyY2hhYmxlID0gY29sbGVjdGlvbkFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zXCJdPy5TZWFyY2hhYmxlO1xuXG5cdFx0aWYgKFxuXHRcdFx0KHNlYXJjaGFibGUgPT09IHVuZGVmaW5lZCAmJiBzZWFyY2hTdXBwb3J0ZWQgPT09IGZhbHNlKSB8fFxuXHRcdFx0KHNlYXJjaGFibGUgPT09IHRydWUgJiYgc2VhcmNoU3VwcG9ydGVkID09PSBmYWxzZSkgfHxcblx0XHRcdHNlYXJjaGFibGUgPT09IGZhbHNlXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjb25kaXRpb24gcGF0aCByZXF1aXJlZCBmb3IgdGhlIGNvbmRpdGlvbiBtb2RlbC5cblx0ICogRm9yIGUuZy4gPDE6Ti1Qcm9wZXJ0eU5hbWU+KlxcLzwxOjEtUHJvcGVydHlOYW1lPi88UHJvcGVydHlOYW1lPi5cblx0ICpcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBUaGUgbWV0YW1vZGVsIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgVGhlIGVudGl0eSBzZXQgcGF0aFxuXHQgKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBwcm9wZXJ0eSBwYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgY29uZGl0aW9uIHBhdGhcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRDb25kaXRpb25QYXRoOiBmdW5jdGlvbiAobWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgZW50aXR5U2V0OiBzdHJpbmcsIHByb3BlcnR5UGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHQvLyAoc2VlIGFsc286IHNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXIudHMpXG5cdFx0Y29uc3QgcGFydHMgPSBwcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdGxldCBjb25kaXRpb25QYXRoID0gXCJcIixcblx0XHRcdHBhcnRpYWxQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0XHR3aGlsZSAocGFydHMubGVuZ3RoKSB7XG5cdFx0XHRsZXQgcGFydCA9IHBhcnRzLnNoaWZ0KCkgYXMgc3RyaW5nO1xuXHRcdFx0cGFydGlhbFBhdGggPSBwYXJ0aWFsUGF0aCA/IGAke3BhcnRpYWxQYXRofS8ke3BhcnR9YCA6IHBhcnQ7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eSA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0fS8ke3BhcnRpYWxQYXRofWApO1xuXHRcdFx0aWYgKHByb3BlcnR5ICYmIHByb3BlcnR5LiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIHByb3BlcnR5LiRpc0NvbGxlY3Rpb24pIHtcblx0XHRcdFx0cGFydCArPSBcIipcIjtcblx0XHRcdH1cblx0XHRcdGNvbmRpdGlvblBhdGggPSBjb25kaXRpb25QYXRoID8gYCR7Y29uZGl0aW9uUGF0aH0vJHtwYXJ0fWAgOiBwYXJ0O1xuXHRcdH1cblx0XHRyZXR1cm4gY29uZGl0aW9uUGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyBhcnJheSBvZiBjb2x1bW4gZGVmaW5pdGlvbnMgY29ycmVzcG9uZGluZyB0byBwcm9wZXJ0aWVzIGRlZmluZWQgYXMgU2VsZWN0aW9uIEZpZWxkcyBvbiB0aGUgQ29sbGVjdGlvblBhdGggZW50aXR5IHNldCBpbiBhIFZhbHVlSGVscC5cblx0ICpcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBUaGUgbWV0YW1vZGVsIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgVGhlIGVudGl0eSBzZXQgcGF0aFxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBjb2x1bW4gZGVmaW5pdGlvbnNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRDb2x1bW5EZWZpbml0aW9uRnJvbVNlbGVjdGlvbkZpZWxkczogZnVuY3Rpb24gKG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIGVudGl0eVNldDogc3RyaW5nKTogQ29sdW1uRGVmW10ge1xuXHRcdGNvbnN0IGNvbHVtbkRlZnM6IENvbHVtbkRlZltdID0gW10sXG5cdFx0XHQvL3NlbGVjdGlvbkZpZWxkcyA9IG1ldGFNb2RlbC5nZXRPYmplY3QoZW50aXR5U2V0ICsgXCIvQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiKSBhcyBTZWxlY3Rpb25GaWVsZFtdIHwgdW5kZWZpbmVkO1xuXHRcdFx0ZW50aXR5VHlwZUFubm90YXRpb25zID0gbWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXR9L0BgKSBhcyBBbm5vdGF0aW9uc0ZvckVudGl0eVR5cGUsXG5cdFx0XHRzZWxlY3Rpb25GaWVsZHMgPSBlbnRpdHlUeXBlQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCJdO1xuXG5cdFx0aWYgKHNlbGVjdGlvbkZpZWxkcykge1xuXHRcdFx0c2VsZWN0aW9uRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdGlvbkZpZWxkKSB7XG5cdFx0XHRcdGNvbnN0IHNlbGVjdGlvbkZpZWxkUGF0aCA9IGAke2VudGl0eVNldH0vJHtzZWxlY3Rpb25GaWVsZC4kUHJvcGVydHlQYXRofWAsXG5cdFx0XHRcdFx0Y29uZGl0aW9uUGF0aCA9IFZhbHVlTGlzdEhlbHBlci5fZ2V0Q29uZGl0aW9uUGF0aChtZXRhTW9kZWwsIGVudGl0eVNldCwgc2VsZWN0aW9uRmllbGQuJFByb3BlcnR5UGF0aCksXG5cdFx0XHRcdFx0cHJvcGVydHlBbm5vdGF0aW9ucyA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7c2VsZWN0aW9uRmllbGRQYXRofUBgKSBhcyBBbm5vdGF0aW9uc0ZvclByb3BlcnR5LFxuXHRcdFx0XHRcdGNvbHVtbkRlZiA9IHtcblx0XHRcdFx0XHRcdHBhdGg6IGNvbmRpdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRsYWJlbDogcHJvcGVydHlBbm5vdGF0aW9uc1tBbm5vdGF0aW9uTGFiZWxdIHx8IHNlbGVjdGlvbkZpZWxkUGF0aCxcblx0XHRcdFx0XHRcdHNvcnRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0ZmlsdGVyYWJsZTogQ29tbW9uVXRpbHMuaXNQcm9wZXJ0eUZpbHRlcmFibGUobWV0YU1vZGVsLCBlbnRpdHlTZXQsIHNlbGVjdGlvbkZpZWxkLiRQcm9wZXJ0eVBhdGgsIGZhbHNlKSxcblx0XHRcdFx0XHRcdCRUeXBlOiBtZXRhTW9kZWwuZ2V0T2JqZWN0KHNlbGVjdGlvbkZpZWxkUGF0aCkuJFR5cGVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRjb2x1bW5EZWZzLnB1c2goY29sdW1uRGVmKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBjb2x1bW5EZWZzO1xuXHR9LFxuXG5cdF9tZXJnZUNvbHVtbkRlZmluaXRpb25zRnJvbVByb3BlcnRpZXM6IGZ1bmN0aW9uIChcblx0XHRjb2x1bW5EZWZzOiBDb2x1bW5EZWZbXSxcblx0XHR2YWx1ZUxpc3RJbmZvOiBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSxcblx0XHR2YWx1ZUxpc3RQcm9wZXJ0eTogc3RyaW5nLFxuXHRcdHByb3BlcnR5OiBDb2x1bW5Qcm9wZXJ0eSxcblx0XHRwcm9wZXJ0eUFubm90YXRpb25zOiBBbm5vdGF0aW9uc0ZvclByb3BlcnR5XG5cdCk6IHZvaWQge1xuXHRcdGxldCBjb2x1bW5QYXRoID0gdmFsdWVMaXN0UHJvcGVydHksXG5cdFx0XHRjb2x1bW5Qcm9wZXJ0eVR5cGUgPSBwcm9wZXJ0eS4kVHlwZTtcblx0XHRjb25zdCBsYWJlbCA9IHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvbkxhYmVsXSB8fCBjb2x1bW5QYXRoLFxuXHRcdFx0dGV4dEFubm90YXRpb24gPSBwcm9wZXJ0eUFubm90YXRpb25zW0Fubm90YXRpb25UZXh0XTtcblxuXHRcdGlmIChcblx0XHRcdHRleHRBbm5vdGF0aW9uICYmXG5cdFx0XHRwcm9wZXJ0eUFubm90YXRpb25zW0Fubm90YXRpb25UZXh0VUlUZXh0QXJyYW5nZW1lbnRdPy4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCJcblx0XHQpIHtcblx0XHRcdC8vIHRoZSBjb2x1bW4gcHJvcGVydHkgaXMgdGhlIG9uZSBjb21pbmcgZnJvbSB0aGUgdGV4dCBhbm5vdGF0aW9uXG5cdFx0XHRjb2x1bW5QYXRoID0gdGV4dEFubm90YXRpb24uJFBhdGg7XG5cdFx0XHRjb25zdCB0ZXh0UHJvcGVydHlQYXRoID0gYC8ke3ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9LyR7Y29sdW1uUGF0aH1gO1xuXHRcdFx0Y29sdW1uUHJvcGVydHlUeXBlID0gdmFsdWVMaXN0SW5mby4kbW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KHRleHRQcm9wZXJ0eVBhdGgpLiRUeXBlIGFzIHN0cmluZztcblx0XHR9XG5cblx0XHRpZiAoY29sdW1uTm90QWxyZWFkeURlZmluZWQoY29sdW1uRGVmcywgY29sdW1uUGF0aCkpIHtcblx0XHRcdGNvbnN0IGNvbHVtbkRlZjogQ29sdW1uRGVmID0ge1xuXHRcdFx0XHRwYXRoOiBjb2x1bW5QYXRoLFxuXHRcdFx0XHRsYWJlbDogbGFiZWwsXG5cdFx0XHRcdHNvcnRhYmxlOiB0cnVlLFxuXHRcdFx0XHRmaWx0ZXJhYmxlOiAhcHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5GaWx0ZXJcIl0sXG5cdFx0XHRcdCRUeXBlOiBjb2x1bW5Qcm9wZXJ0eVR5cGVcblx0XHRcdH07XG5cdFx0XHRjb2x1bW5EZWZzLnB1c2goY29sdW1uRGVmKTtcblx0XHR9XG5cdH0sXG5cblx0ZmlsdGVySW5PdXRQYXJhbWV0ZXJzOiBmdW5jdGlvbiAodmhQYXJhbWV0ZXJzOiBJbk91dFBhcmFtZXRlcltdLCB0eXBlRmlsdGVyOiBzdHJpbmdbXSkge1xuXHRcdHJldHVybiB2aFBhcmFtZXRlcnMuZmlsdGVyKGZ1bmN0aW9uIChwYXJhbWV0ZXIpIHtcblx0XHRcdHJldHVybiB0eXBlRmlsdGVyLmluZGV4T2YocGFyYW1ldGVyLnBhcm1ldGVyVHlwZSkgPiAtMTtcblx0XHR9KTtcblx0fSxcblxuXHRnZXRJblBhcmFtZXRlcnM6IGZ1bmN0aW9uICh2aFBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW10pIHtcblx0XHRyZXR1cm4gVmFsdWVMaXN0SGVscGVyLmZpbHRlckluT3V0UGFyYW1ldGVycyh2aFBhcmFtZXRlcnMsIFtcblx0XHRcdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbixcblx0XHRcdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJDb25zdGFudCxcblx0XHRcdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dFxuXHRcdF0pO1xuXHR9LFxuXG5cdGdldE91dFBhcmFtZXRlcnM6IGZ1bmN0aW9uICh2aFBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW10pIHtcblx0XHRyZXR1cm4gVmFsdWVMaXN0SGVscGVyLmZpbHRlckluT3V0UGFyYW1ldGVycyh2aFBhcmFtZXRlcnMsIFtBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyT3V0LCBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVySW5PdXRdKTtcblx0fSxcblxuXHRjcmVhdGVWSFVJTW9kZWw6IGZ1bmN0aW9uICh2YWx1ZUhlbHA6IFZhbHVlSGVscCwgcHJvcGVydHlQYXRoOiBzdHJpbmcsIG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpOiBKU09OTW9kZWwge1xuXHRcdC8vIHNldHRpbmcgdGhlIF9WSFVJIG1vZGVsIGV2YWx1YXRlZCBpbiB0aGUgVmFsdWVMaXN0VGFibGUgZnJhZ21lbnRcblx0XHRjb25zdCB2aFVJTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHt9KSxcblx0XHRcdHByb3BlcnR5QW5ub3RhdGlvbnMgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3Byb3BlcnR5UGF0aH1AYCkgYXMgQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eTtcblxuXHRcdHZhbHVlSGVscC5zZXRNb2RlbCh2aFVJTW9kZWwsIFwiX1ZIVUlcIik7XG5cdFx0Ly8gSWRlbnRpZmllcyB0aGUgXCJDb250ZXh0RGVwZW5kZW50LVNjZW5hcmlvXCJcblx0XHR2aFVJTW9kZWwuc2V0UHJvcGVydHkoXG5cdFx0XHRcIi9oYXNWYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnNcIixcblx0XHRcdCEhcHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UmVsZXZhbnRRdWFsaWZpZXJzXCJdXG5cdFx0KTtcblx0XHQvKiBQcm9wZXJ0eSBsYWJlbCBmb3IgZGlhbG9nIHRpdGxlICovXG5cdFx0dmhVSU1vZGVsLnNldFByb3BlcnR5KFwiL3Byb3BlcnR5TGFiZWxcIiwgcHJvcGVydHlBbm5vdGF0aW9uc1tBbm5vdGF0aW9uTGFiZWxdKTtcblxuXHRcdHJldHVybiB2aFVJTW9kZWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHRpdGxlIG9mIHRoZSB2YWx1ZSBoZWxwIGRpYWxvZy5cblx0ICogQnkgZGVmYXVsdCwgdGhlIGRhdGEgZmllbGQgbGFiZWwgaXMgdXNlZCwgb3RoZXJ3aXNlIGVpdGhlciB0aGUgcHJvcGVydHkgbGFiZWwgb3IgdGhlIHZhbHVlIGxpc3QgbGFiZWwgaXMgdXNlZCBhcyBhIGZhbGxiYWNrLlxuXHQgKiBGb3IgY29udGV4dC1kZXBlbmRlbnQgdmFsdWUgaGVscHMsIGJ5IGRlZmF1bHQgdGhlIHZhbHVlIGxpc3QgbGFiZWwgaXMgdXNlZCwgb3RoZXJ3aXNlIGVpdGhlciB0aGUgcHJvcGVydHkgbGFiZWwgb3IgdGhlIGRhdGEgZmllbGQgbGFiZWwgaXMgdXNlZCBhcyBhIGZhbGxiYWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWVIZWxwIFRoZSB2YWx1ZUhlbHAgaW5zdGFuY2Vcblx0ICogQHBhcmFtIHZhbHVlaGVscExhYmVsIFRoZSBsYWJlbCBpbiB0aGUgdmFsdWUgaGVscCBtZXRhZGF0YVxuXHQgKiBAcmV0dXJucyBUaGUgdGl0bGUgZm9yIHRoZSB2YWx1ZUhlbHAgZGlhbG9nXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0RGlhbG9nVGl0bGU6IGZ1bmN0aW9uICh2YWx1ZUhlbHA6IFZhbHVlSGVscCwgdmFsdWVoZWxwTGFiZWw6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgcHJvcGVydHlMYWJlbCA9IHZhbHVlSGVscC5nZXRNb2RlbChcIl9WSFVJXCIpLmdldFByb3BlcnR5KFwiL3Byb3BlcnR5TGFiZWxcIik7XG5cdFx0Y29uc3QgZGF0YUZpZWxkTGFiZWwgPSB2YWx1ZUhlbHAuZ2V0Q29udHJvbCgpPy5nZXRQcm9wZXJ0eShcImxhYmVsXCIpO1xuXHRcdHJldHVybiB2YWx1ZUhlbHAuZ2V0TW9kZWwoXCJfVkhVSVwiKS5nZXRQcm9wZXJ0eShcIi9oYXNWYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnNcIilcblx0XHRcdD8gdmFsdWVoZWxwTGFiZWwgfHwgcHJvcGVydHlMYWJlbCB8fCBkYXRhRmllbGRMYWJlbFxuXHRcdFx0OiBkYXRhRmllbGRMYWJlbCB8fCBwcm9wZXJ0eUxhYmVsIHx8IHZhbHVlaGVscExhYmVsO1xuXHR9LFxuXG5cdGRlc3Ryb3lWSENvbnRlbnQ6IGZ1bmN0aW9uICh2YWx1ZUhlbHA6IFZhbHVlSGVscCk6IHZvaWQge1xuXHRcdGlmICh2YWx1ZUhlbHAuZ2V0RGlhbG9nKCkpIHtcblx0XHRcdHZhbHVlSGVscC5nZXREaWFsb2coKS5kZXN0cm95Q29udGVudCgpO1xuXHRcdH1cblx0XHRpZiAodmFsdWVIZWxwLmdldFR5cGVhaGVhZCgpKSB7XG5cdFx0XHR2YWx1ZUhlbHAuZ2V0VHlwZWFoZWFkKCkuZGVzdHJveUNvbnRlbnQoKTtcblx0XHR9XG5cdH0sXG5cblx0cHV0RGVmYXVsdFF1YWxpZmllckZpcnN0OiBmdW5jdGlvbiAocXVhbGlmaWVyczogc3RyaW5nW10pIHtcblx0XHRjb25zdCBpbmRleERlZmF1bHRWSCA9IHF1YWxpZmllcnMuaW5kZXhPZihcIlwiKTtcblxuXHRcdC8vIGRlZmF1bHQgVmFsdWVIZWxwIHdpdGhvdXQgcXVhbGlmaWVyIHNob3VsZCBiZSB0aGUgZmlyc3Rcblx0XHRpZiAoaW5kZXhEZWZhdWx0VkggPiAwKSB7XG5cdFx0XHRxdWFsaWZpZXJzLnVuc2hpZnQocXVhbGlmaWVyc1tpbmRleERlZmF1bHRWSF0pO1xuXHRcdFx0cXVhbGlmaWVycy5zcGxpY2UoaW5kZXhEZWZhdWx0VkggKyAxLCAxKTtcblx0XHR9XG5cdFx0cmV0dXJuIHF1YWxpZmllcnM7XG5cdH0sXG5cblx0X2dldENvbnRleHRQcmVmaXg6IGZ1bmN0aW9uIChiaW5kaW5nQ29udGV4dDogQ29udGV4dCB8IHVuZGVmaW5lZCwgcHJvcGVydHlCaW5kaW5nUGFydHM6IHN0cmluZ1tdKSB7XG5cdFx0aWYgKGJpbmRpbmdDb250ZXh0ICYmIGJpbmRpbmdDb250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0Y29uc3QgYmluZGlnQ29udGV4dFBhcnRzID0gYmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRcdGlmIChwcm9wZXJ0eUJpbmRpbmdQYXJ0cy5sZW5ndGggLSBiaW5kaWdDb250ZXh0UGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRjb25zdCBjb250ZXh0UHJlZml4UGFydHMgPSBbXTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IGJpbmRpZ0NvbnRleHRQYXJ0cy5sZW5ndGg7IGkgPCBwcm9wZXJ0eUJpbmRpbmdQYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0XHRjb250ZXh0UHJlZml4UGFydHMucHVzaChwcm9wZXJ0eUJpbmRpbmdQYXJ0c1tpXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGAke2NvbnRleHRQcmVmaXhQYXJ0cy5qb2luKFwiL1wiKX0vYDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gXCJcIjtcblx0fSxcblxuXHRfZ2V0VmhQYXJhbWV0ZXI6IGZ1bmN0aW9uIChcblx0XHRjb25kaXRpb25Nb2RlbDogc3RyaW5nLFxuXHRcdHZhbHVlSGVscDogVmFsdWVIZWxwLFxuXHRcdGNvbnRleHRQcmVmaXg6IHN0cmluZyxcblx0XHRwYXJhbWV0ZXI6IEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXIsXG5cdFx0dmhNZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRcdGxvY2FsRGF0YVByb3BlcnR5UGF0aDogc3RyaW5nXG5cdCk6IEluT3V0UGFyYW1ldGVyIHtcblx0XHRsZXQgdmFsdWVQYXRoID0gXCJcIjtcblx0XHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IHZhbHVlSGVscC5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGlmIChjb25kaXRpb25Nb2RlbCAmJiBjb25kaXRpb25Nb2RlbC5sZW5ndGggPiAwKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHZhbHVlSGVscC5nZXRQYXJlbnQoKT8uaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSAmJlxuXHRcdFx0XHRiaW5kaW5nQ29udGV4dCAmJlxuXHRcdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX3BhcmFtZXRlcklzQShwYXJhbWV0ZXIsIFtcblx0XHRcdFx0XHRDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW4sXG5cdFx0XHRcdFx0Q29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlckluT3V0XG5cdFx0XHRcdF0pXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdmFsdWUgaGVscCB1c2VkIGluIGZpbHRlciBkaWFsb2dcblx0XHRcdFx0Y29uc3QgcGFydHMgPSBsb2NhbERhdGFQcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdGNvbnN0IGZpcnN0TmF2aWdhdGlvblByb3BlcnR5ID0gcGFydHNbMF07XG5cdFx0XHRcdFx0Y29uc3Qgb0JvdW5kRW50aXR5ID0gdmhNZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQoYmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdFx0XHRjb25zdCBzUGF0aE9mVGFibGUgPSAodmFsdWVIZWxwLmdldFBhcmVudCgpIGFzIGFueSkuZ2V0Um93QmluZGluZygpLmdldFBhdGgoKTsgLy9UT0RPXG5cdFx0XHRcdFx0aWYgKG9Cb3VuZEVudGl0eS5nZXRPYmplY3QoYCR7c1BhdGhPZlRhYmxlfS8kUGFydG5lcmApID09PSBmaXJzdE5hdmlnYXRpb25Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0Ly8gVXNpbmcgdGhlIGNvbmRpdGlvbiBtb2RlbCBkb2Vzbid0IG1ha2UgYW55IHNlbnNlIGluIGNhc2UgYW4gaW4tcGFyYW1ldGVyIHVzZXMgYSBuYXZpZ2F0aW9uIHByb3BlcnR5XG5cdFx0XHRcdFx0XHQvLyByZWZlcnJpbmcgdG8gdGhlIHBhcnRuZXIuIFRoZXJlZm9yZSByZWR1Y2luZyB0aGUgcGF0aCBhbmQgdXNpbmcgdGhlIEZWSCBjb250ZXh0IGluc3RlYWQgb2YgdGhlIGNvbmRpdGlvbiBtb2RlbFxuXHRcdFx0XHRcdFx0dmFsdWVQYXRoID0gbG9jYWxEYXRhUHJvcGVydHlQYXRoLnJlcGxhY2UoZmlyc3ROYXZpZ2F0aW9uUHJvcGVydHkgKyBcIi9cIiwgXCJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXZhbHVlUGF0aCkge1xuXHRcdFx0XHR2YWx1ZVBhdGggPSBjb25kaXRpb25Nb2RlbCArIFwiPi9jb25kaXRpb25zL1wiICsgbG9jYWxEYXRhUHJvcGVydHlQYXRoO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YWx1ZVBhdGggPSBjb250ZXh0UHJlZml4ICsgbG9jYWxEYXRhUHJvcGVydHlQYXRoO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRwYXJtZXRlclR5cGU6IHBhcmFtZXRlci4kVHlwZSxcblx0XHRcdHNvdXJjZTogdmFsdWVQYXRoLFxuXHRcdFx0aGVscFBhdGg6IHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdGNvbnN0YW50VmFsdWU6IHBhcmFtZXRlci5Db25zdGFudCxcblx0XHRcdGluaXRpYWxWYWx1ZUZpbHRlckVtcHR5OiBCb29sZWFuKHBhcmFtZXRlci5Jbml0aWFsVmFsdWVJc1NpZ25pZmljYW50KVxuXHRcdH07XG5cdH0sXG5cblx0X3BhcmFtZXRlcklzQShwYXJhbWV0ZXI6IEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXIsIHBhcmFtZXRlclR5cGVzOiBDb21tb25Bbm5vdGF0aW9uVHlwZXNbXSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBwYXJhbWV0ZXJUeXBlcy5pbmNsdWRlcyhwYXJhbWV0ZXIuJFR5cGUgYXMgQ29tbW9uQW5ub3RhdGlvblR5cGVzKTtcblx0fSxcblxuXHRfZW5yaWNoUGF0aDogZnVuY3Rpb24gKFxuXHRcdHBhdGg6IFBhdGgsXG5cdFx0cHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdFx0bG9jYWxEYXRhUHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdFx0cGFyYW1ldGVyOiBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyLFxuXHRcdHByb3BlcnR5TmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRcdHByb3BlcnR5QW5ub3RhdGlvbnM6IEFubm90YXRpb25zRm9yUHJvcGVydHlcblx0KSB7XG5cdFx0aWYgKFxuXHRcdFx0IXBhdGgua2V5ICYmXG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX3BhcmFtZXRlcklzQShwYXJhbWV0ZXIsIFtcblx0XHRcdFx0Q29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlck91dCxcblx0XHRcdFx0Q29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlckluT3V0XG5cdFx0XHRdKSAmJlxuXHRcdFx0bG9jYWxEYXRhUHJvcGVydHlQYXRoID09PSBwcm9wZXJ0eU5hbWVcblx0XHQpIHtcblx0XHRcdHBhdGguZmllbGRQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eVBhdGg7XG5cdFx0XHRwYXRoLmtleSA9IHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eTtcblxuXHRcdFx0Ly9Pbmx5IHRoZSB0ZXh0IGFubm90YXRpb24gb2YgdGhlIGtleSBjYW4gc3BlY2lmeSB0aGUgZGVzY3JpcHRpb25cblx0XHRcdHBhdGguZGVzY3JpcHRpb25QYXRoID0gcHJvcGVydHlBbm5vdGF0aW9uc1tBbm5vdGF0aW9uVGV4dF0/LiRQYXRoIHx8IFwiXCI7XG5cdFx0fVxuXHR9LFxuXG5cdF9lbnJpY2hLZXlzOiBmdW5jdGlvbiAodmhLZXlzOiBzdHJpbmdbXSwgcGFyYW1ldGVyOiBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyKSB7XG5cdFx0aWYgKFxuXHRcdFx0VmFsdWVMaXN0SGVscGVyLl9wYXJhbWV0ZXJJc0EocGFyYW1ldGVyLCBbXG5cdFx0XHRcdENvbW1vbkFubm90YXRpb25UeXBlcy5WYWx1ZUxpc3RQYXJhbWV0ZXJPdXQsXG5cdFx0XHRcdENvbW1vbkFubm90YXRpb25UeXBlcy5WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dFxuXHRcdFx0XSkgJiZcblx0XHRcdCF2aEtleXMuaW5jbHVkZXMocGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5KVxuXHRcdCkge1xuXHRcdFx0dmhLZXlzLnB1c2gocGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5KTtcblx0XHR9XG5cdH0sXG5cblx0X3Byb2Nlc3NQYXJhbWV0ZXJzOiBmdW5jdGlvbiAoXG5cdFx0YW5ub3RhdGlvblZhbHVlTGlzdFR5cGU6IEFubm90YXRpb25WYWx1ZUxpc3RUeXBlLFxuXHRcdHByb3BlcnR5TmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRcdGNvbmRpdGlvbk1vZGVsOiBzdHJpbmcsXG5cdFx0dmFsdWVIZWxwOiBWYWx1ZUhlbHAsXG5cdFx0Y29udGV4dFByZWZpeDogc3RyaW5nLFxuXHRcdHZoTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0XHR2YWx1ZUhlbHBRdWFsaWZpZXI6IHN0cmluZ1xuXHQpOiBWYWx1ZUxpc3RJbmZvIHtcblx0XHRjb25zdCBtZXRhTW9kZWwgPSBhbm5vdGF0aW9uVmFsdWVMaXN0VHlwZS4kbW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRlbnRpdHlTZXRQYXRoID0gYC8ke2Fubm90YXRpb25WYWx1ZUxpc3RUeXBlLkNvbGxlY3Rpb25QYXRofWAsXG5cdFx0XHRjb2x1bW5EZWZzID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb2x1bW5EZWZpbml0aW9uRnJvbVNlbGVjdGlvbkZpZWxkcyhtZXRhTW9kZWwsIGVudGl0eVNldFBhdGgpLFxuXHRcdFx0dmhQYXJhbWV0ZXJzOiBJbk91dFBhcmFtZXRlcltdID0gW10sXG5cdFx0XHR2aEtleXM6IHN0cmluZ1tdID0gbWV0YU1vZGVsLmdldE9iamVjdChlbnRpdHlTZXRQYXRoICsgYC9gKT8uJEtleSA/IFsuLi5tZXRhTW9kZWwuZ2V0T2JqZWN0KGVudGl0eVNldFBhdGggKyBgL2ApLiRLZXldIDogW107XG5cblx0XHRjb25zdCBwYXRoOiBQYXRoID0ge1xuXHRcdFx0ZmllbGRQcm9wZXJ0eVBhdGg6IFwiXCIsXG5cdFx0XHRkZXNjcmlwdGlvblBhdGg6IFwiXCIsXG5cdFx0XHRrZXk6IFwiXCJcblx0XHR9O1xuXG5cdFx0Zm9yIChjb25zdCBwYXJhbWV0ZXIgb2YgYW5ub3RhdGlvblZhbHVlTGlzdFR5cGUuUGFyYW1ldGVycykge1xuXHRcdFx0Ly9BbGwgU3RyaW5nIGZpZWxkcyBhcmUgYWxsb3dlZCBmb3IgZmlsdGVyXG5cdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBgLyR7YW5ub3RhdGlvblZhbHVlTGlzdFR5cGUuQ29sbGVjdGlvblBhdGh9LyR7cGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5fWAsXG5cdFx0XHRcdHByb3BlcnR5ID0gbWV0YU1vZGVsLmdldE9iamVjdChwcm9wZXJ0eVBhdGgpLFxuXHRcdFx0XHRwcm9wZXJ0eUFubm90YXRpb25zID0gKG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7cHJvcGVydHlQYXRofUBgKSB8fCB7fSkgYXMgQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eSxcblx0XHRcdFx0bG9jYWxEYXRhUHJvcGVydHlQYXRoID0gcGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5Py4kUHJvcGVydHlQYXRoIHx8IFwiXCI7XG5cblx0XHRcdC8vIElmIHByb3BlcnR5IGlzIHVuZGVmaW5lZCwgdGhlbiB0aGUgcHJvcGVydHkgY29taW5nIGZvciB0aGUgZW50cnkgaXNuJ3QgZGVmaW5lZCBpblxuXHRcdFx0Ly8gdGhlIG1ldGFtb2RlbCwgdGhlcmVmb3JlIHdlIGRvbid0IG5lZWQgdG8gYWRkIGl0IGluIHRoZSBpbi9vdXQgcGFyYW1ldGVyc1xuXHRcdFx0aWYgKHByb3BlcnR5KSB7XG5cdFx0XHRcdC8vIFNlYXJjaCBmb3IgdGhlICpvdXQgUGFyYW1ldGVyIG1hcHBlZCB0byB0aGUgbG9jYWwgcHJvcGVydHlcblx0XHRcdFx0VmFsdWVMaXN0SGVscGVyLl9lbnJpY2hQYXRoKHBhdGgsIHByb3BlcnR5UGF0aCwgbG9jYWxEYXRhUHJvcGVydHlQYXRoLCBwYXJhbWV0ZXIsIHByb3BlcnR5TmFtZSwgcHJvcGVydHlBbm5vdGF0aW9ucyk7XG5cblx0XHRcdFx0Y29uc3QgdmFsdWVMaXN0UHJvcGVydHkgPSBwYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHk7XG5cdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5fbWVyZ2VDb2x1bW5EZWZpbml0aW9uc0Zyb21Qcm9wZXJ0aWVzKFxuXHRcdFx0XHRcdGNvbHVtbkRlZnMsXG5cdFx0XHRcdFx0YW5ub3RhdGlvblZhbHVlTGlzdFR5cGUsXG5cdFx0XHRcdFx0dmFsdWVMaXN0UHJvcGVydHksXG5cdFx0XHRcdFx0cHJvcGVydHksXG5cdFx0XHRcdFx0cHJvcGVydHlBbm5vdGF0aW9uc1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL0luIGFuZCBJbk91dCBhbmQgT3V0XG5cdFx0XHRpZiAoXG5cdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5fcGFyYW1ldGVySXNBKHBhcmFtZXRlciwgW1xuXHRcdFx0XHRcdENvbW1vbkFubm90YXRpb25UeXBlcy5WYWx1ZUxpc3RQYXJhbWV0ZXJJbixcblx0XHRcdFx0XHRDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVyT3V0LFxuXHRcdFx0XHRcdENvbW1vbkFubm90YXRpb25UeXBlcy5WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dFxuXHRcdFx0XHRdKSAmJlxuXHRcdFx0XHRsb2NhbERhdGFQcm9wZXJ0eVBhdGggIT09IHByb3BlcnR5TmFtZVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IHZoUGFyYW1ldGVyID0gVmFsdWVMaXN0SGVscGVyLl9nZXRWaFBhcmFtZXRlcihcblx0XHRcdFx0XHRjb25kaXRpb25Nb2RlbCxcblx0XHRcdFx0XHR2YWx1ZUhlbHAsXG5cdFx0XHRcdFx0Y29udGV4dFByZWZpeCxcblx0XHRcdFx0XHRwYXJhbWV0ZXIsXG5cdFx0XHRcdFx0dmhNZXRhTW9kZWwsXG5cdFx0XHRcdFx0bG9jYWxEYXRhUHJvcGVydHlQYXRoXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHZoUGFyYW1ldGVycy5wdXNoKHZoUGFyYW1ldGVyKTtcblx0XHRcdH1cblxuXHRcdFx0Ly9Db25zdGFudCBhcyBJblBhcmFtdGVyIGZvciBmaWx0ZXJpbmdcblx0XHRcdGlmIChwYXJhbWV0ZXIuJFR5cGUgPT09IEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJDb25zdGFudCkge1xuXHRcdFx0XHR2aFBhcmFtZXRlcnMucHVzaCh7XG5cdFx0XHRcdFx0cGFybWV0ZXJUeXBlOiBwYXJhbWV0ZXIuJFR5cGUsXG5cdFx0XHRcdFx0c291cmNlOiBwYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHksXG5cdFx0XHRcdFx0aGVscFBhdGg6IHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdFx0XHRjb25zdGFudFZhbHVlOiBwYXJhbWV0ZXIuQ29uc3RhbnQsXG5cdFx0XHRcdFx0aW5pdGlhbFZhbHVlRmlsdGVyRW1wdHk6IEJvb2xlYW4ocGFyYW1ldGVyLkluaXRpYWxWYWx1ZUlzU2lnbmlmaWNhbnQpXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBFbnJpY2gga2V5cyB3aXRoIG91dC1wYXJhbWV0ZXJzXG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX2VucmljaEtleXModmhLZXlzLCBwYXJhbWV0ZXIpO1xuXHRcdH1cblxuXHRcdC8qIEVuc3VyZSB0aGF0IHZoS2V5cyBhcmUgcGFydCBvZiB0aGUgY29sdW1uRGVmcywgb3RoZXJ3aXNlIGl0IGlzIG5vdCBjb25zaWRlcmVkIGluICRzZWxlY3QgKEJDUCAyMjcwMTQxMTU0KSAqL1xuXHRcdGZvciAoY29uc3QgdmhLZXkgb2YgdmhLZXlzKSB7XG5cdFx0XHRpZiAoY29sdW1uTm90QWxyZWFkeURlZmluZWQoY29sdW1uRGVmcywgdmhLZXkpKSB7XG5cdFx0XHRcdGNvbnN0IGNvbHVtbkRlZjogQ29sdW1uRGVmID0ge1xuXHRcdFx0XHRcdHBhdGg6IHZoS2V5LFxuXHRcdFx0XHRcdCRUeXBlOiBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHthbm5vdGF0aW9uVmFsdWVMaXN0VHlwZS5Db2xsZWN0aW9uUGF0aH0vJHtwYXRoLmtleX1gKS4kVHlwZSxcblx0XHRcdFx0XHRsYWJlbDogXCJcIixcblx0XHRcdFx0XHRzb3J0YWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0ZmlsdGVyYWJsZTogdW5kZWZpbmVkXG5cdFx0XHRcdH07XG5cdFx0XHRcdGNvbHVtbkRlZnMucHVzaChjb2x1bW5EZWYpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRrZXlWYWx1ZTogcGF0aC5rZXksXG5cdFx0XHRkZXNjcmlwdGlvblZhbHVlOiBwYXRoLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdGZpZWxkUHJvcGVydHlQYXRoOiBwYXRoLmZpZWxkUHJvcGVydHlQYXRoLFxuXHRcdFx0dmhLZXlzOiB2aEtleXMsXG5cdFx0XHR2aFBhcmFtZXRlcnM6IHZoUGFyYW1ldGVycyxcblx0XHRcdHZhbHVlTGlzdEluZm86IGFubm90YXRpb25WYWx1ZUxpc3RUeXBlLFxuXHRcdFx0Y29sdW1uRGVmczogY29sdW1uRGVmcyxcblx0XHRcdHZhbHVlSGVscFF1YWxpZmllclxuXHRcdH07XG5cdH0sXG5cblx0X2xvZ0Vycm9yOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBzdHJpbmcsIGVycm9yPzogdW5rbm93bikge1xuXHRcdGNvbnN0IHN0YXR1cyA9IGVycm9yID8gKGVycm9yIGFzIFhNTEh0dHBSZXF1ZXN0KS5zdGF0dXMgOiB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcblx0XHRjb25zdCBtc2cgPSBzdGF0dXMgPT09IDQwNCA/IGBNZXRhZGF0YSBub3QgZm91bmQgKCR7c3RhdHVzfSkgZm9yIHZhbHVlIGhlbHAgb2YgcHJvcGVydHkgJHtwcm9wZXJ0eVBhdGh9YCA6IG1lc3NhZ2U7XG5cblx0XHRMb2cuZXJyb3IobXNnKTtcblx0fSxcblxuXHRnZXRWYWx1ZUxpc3RJbmZvOiBhc3luYyBmdW5jdGlvbiAodmFsdWVIZWxwOiBWYWx1ZUhlbHAsIHByb3BlcnR5UGF0aDogc3RyaW5nLCBwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkKTogUHJvbWlzZTxWYWx1ZUxpc3RJbmZvW10+IHtcblx0XHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IHZhbHVlSGVscC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQsXG5cdFx0XHRjb25kaXRpb25Nb2RlbCA9IHBheWxvYWQuY29uZGl0aW9uTW9kZWwsXG5cdFx0XHR2aE1ldGFNb2RlbCA9IHZhbHVlSGVscC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsLFxuXHRcdFx0dmFsdWVMaXN0SW5mb3M6IFZhbHVlTGlzdEluZm9bXSA9IFtdLFxuXHRcdFx0cHJvcGVydHlQYXRoUGFydHMgPSBwcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCB2YWx1ZUxpc3RCeVF1YWxpZmllciA9IChhd2FpdCB2aE1ldGFNb2RlbC5yZXF1ZXN0VmFsdWVMaXN0SW5mbyhcblx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRiaW5kaW5nQ29udGV4dFxuXHRcdFx0KSkgYXMgQW5ub3RhdGlvblZhbHVlTGlzdFR5cGVCeVF1YWxpZmllcjtcblx0XHRcdGNvbnN0IHZhbHVlSGVscFF1YWxpZmllcnMgPSBWYWx1ZUxpc3RIZWxwZXIucHV0RGVmYXVsdFF1YWxpZmllckZpcnN0KE9iamVjdC5rZXlzKHZhbHVlTGlzdEJ5UXVhbGlmaWVyKSksXG5cdFx0XHRcdHByb3BlcnR5TmFtZSA9IHByb3BlcnR5UGF0aFBhcnRzLnBvcCgpO1xuXG5cdFx0XHRjb25zdCBjb250ZXh0UHJlZml4ID0gcGF5bG9hZC51c2VNdWx0aVZhbHVlRmllbGQgPyBWYWx1ZUxpc3RIZWxwZXIuX2dldENvbnRleHRQcmVmaXgoYmluZGluZ0NvbnRleHQsIHByb3BlcnR5UGF0aFBhcnRzKSA6IFwiXCI7XG5cblx0XHRcdGZvciAoY29uc3QgdmFsdWVIZWxwUXVhbGlmaWVyIG9mIHZhbHVlSGVscFF1YWxpZmllcnMpIHtcblx0XHRcdFx0Ly8gQWRkIGNvbHVtbiBkZWZpbml0aW9ucyBmb3IgcHJvcGVydGllcyBkZWZpbmVkIGFzIFNlbGVjdGlvbiBmaWVsZHMgb24gdGhlIENvbGxlY3Rpb25QYXRoIGVudGl0eSBzZXQuXG5cdFx0XHRcdGNvbnN0IGFubm90YXRpb25WYWx1ZUxpc3RUeXBlID0gdmFsdWVMaXN0QnlRdWFsaWZpZXJbdmFsdWVIZWxwUXVhbGlmaWVyXTtcblxuXHRcdFx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvOiBWYWx1ZUxpc3RJbmZvID0gVmFsdWVMaXN0SGVscGVyLl9wcm9jZXNzUGFyYW1ldGVycyhcblx0XHRcdFx0XHRhbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSxcblx0XHRcdFx0XHRwcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdFx0Y29uZGl0aW9uTW9kZWwsXG5cdFx0XHRcdFx0dmFsdWVIZWxwLFxuXHRcdFx0XHRcdGNvbnRleHRQcmVmaXgsXG5cdFx0XHRcdFx0dmhNZXRhTW9kZWwsXG5cdFx0XHRcdFx0dmFsdWVIZWxwUXVhbGlmaWVyXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHZhbHVlTGlzdEluZm9zLnB1c2godmFsdWVMaXN0SW5mbyk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLl9sb2dFcnJvcihwcm9wZXJ0eVBhdGgsIGVycik7XG5cblx0XHRcdFZhbHVlTGlzdEhlbHBlci5kZXN0cm95VkhDb250ZW50KHZhbHVlSGVscCk7XG5cdFx0fVxuXHRcdHJldHVybiB2YWx1ZUxpc3RJbmZvcztcblx0fSxcblxuXHRBTExGUkFHTUVOVFM6IHVuZGVmaW5lZCBhcyBhbnksXG5cdGxvZ0ZyYWdtZW50OiB1bmRlZmluZWQgYXMgYW55LFxuXG5cdF9sb2dUZW1wbGF0ZWRGcmFnbWVudHM6IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IHN0cmluZywgZnJhZ21lbnROYW1lOiBzdHJpbmcsIGZyYWdtZW50RGVmaW5pdGlvbjogYW55KTogdm9pZCB7XG5cdFx0Y29uc3QgbG9nSW5mbyA9IHtcblx0XHRcdHBhdGg6IHByb3BlcnR5UGF0aCxcblx0XHRcdGZyYWdtZW50TmFtZTogZnJhZ21lbnROYW1lLFxuXHRcdFx0ZnJhZ21lbnQ6IGZyYWdtZW50RGVmaW5pdGlvblxuXHRcdH07XG5cdFx0aWYgKExvZy5nZXRMZXZlbCgpID09PSBMZXZlbC5ERUJVRykge1xuXHRcdFx0Ly9JbiBkZWJ1ZyBtb2RlIHdlIGxvZyBhbGwgZ2VuZXJhdGVkIGZyYWdtZW50c1xuXHRcdFx0VmFsdWVMaXN0SGVscGVyLkFMTEZSQUdNRU5UUyA9IFZhbHVlTGlzdEhlbHBlci5BTExGUkFHTUVOVFMgfHwgW107XG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuQUxMRlJBR01FTlRTLnB1c2gobG9nSW5mbyk7XG5cdFx0fVxuXHRcdGlmIChWYWx1ZUxpc3RIZWxwZXIubG9nRnJhZ21lbnQpIHtcblx0XHRcdC8vT25lIFRvb2wgU3Vic2NyaWJlciBhbGxvd2VkXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0VmFsdWVMaXN0SGVscGVyLmxvZ0ZyYWdtZW50KGxvZ0luZm8pO1xuXHRcdFx0fSwgMCk7XG5cdFx0fVxuXHR9LFxuXG5cdF90ZW1wbGF0ZUZyYWdtZW50OiBhc3luYyBmdW5jdGlvbiA8VCBleHRlbmRzIFRhYmxlIHwgTWRjSW5uZXJUYWJsZSB8IE1kY0ZpbHRlckJhcj4oXG5cdFx0ZnJhZ21lbnROYW1lOiBzdHJpbmcsXG5cdFx0dmFsdWVMaXN0SW5mbzogVmFsdWVMaXN0SW5mbyxcblx0XHRzb3VyY2VNb2RlbDogSlNPTk1vZGVsLFxuXHRcdHByb3BlcnR5UGF0aDogc3RyaW5nXG5cdCk6IFByb21pc2U8VD4ge1xuXHRcdGNvbnN0IGxvY2FsVmFsdWVMaXN0SW5mbyA9IHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mbyxcblx0XHRcdHZhbHVlTGlzdE1vZGVsID0gbmV3IEpTT05Nb2RlbChsb2NhbFZhbHVlTGlzdEluZm8pLFxuXHRcdFx0dmFsdWVMaXN0U2VydmljZU1ldGFNb2RlbCA9IGxvY2FsVmFsdWVMaXN0SW5mby4kbW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHR2aWV3RGF0YSA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0XHRjb252ZXJ0ZXJUeXBlOiBcIkxpc3RSZXBvcnRcIixcblx0XHRcdFx0Y29sdW1uczogdmFsdWVMaXN0SW5mby5jb2x1bW5EZWZzIHx8IG51bGxcblx0XHRcdH0pO1xuXG5cdFx0Y29uc3QgZnJhZ21lbnREZWZpbml0aW9uID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRYTUxUZW1wbGF0ZVByb2Nlc3Nvci5sb2FkVGVtcGxhdGUoZnJhZ21lbnROYW1lLCBcImZyYWdtZW50XCIpLFxuXHRcdFx0eyBuYW1lOiBmcmFnbWVudE5hbWUgfSxcblx0XHRcdHtcblx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0dmFsdWVMaXN0OiB2YWx1ZUxpc3RNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0Y29udGV4dFBhdGg6IHZhbHVlTGlzdFNlcnZpY2VNZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke2xvY2FsVmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH0vYCksXG5cdFx0XHRcdFx0c291cmNlOiBzb3VyY2VNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdFx0fSxcblx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0dmFsdWVMaXN0OiB2YWx1ZUxpc3RNb2RlbCxcblx0XHRcdFx0XHRjb250ZXh0UGF0aDogdmFsdWVMaXN0U2VydmljZU1ldGFNb2RlbCxcblx0XHRcdFx0XHRzb3VyY2U6IHNvdXJjZU1vZGVsLFxuXHRcdFx0XHRcdG1ldGFNb2RlbDogdmFsdWVMaXN0U2VydmljZU1ldGFNb2RlbCxcblx0XHRcdFx0XHR2aWV3RGF0YTogdmlld0RhdGFcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdFx0VmFsdWVMaXN0SGVscGVyLl9sb2dUZW1wbGF0ZWRGcmFnbWVudHMocHJvcGVydHlQYXRoLCBmcmFnbWVudE5hbWUsIGZyYWdtZW50RGVmaW5pdGlvbik7XG5cdFx0cmV0dXJuIChhd2FpdCBGcmFnbWVudC5sb2FkKHsgZGVmaW5pdGlvbjogZnJhZ21lbnREZWZpbml0aW9uIH0pKSBhcyBUO1xuXHR9LFxuXG5cdF9nZXRDb250ZW50SWQ6IGZ1bmN0aW9uICh2YWx1ZUhlbHBJZDogc3RyaW5nLCB2YWx1ZUhlbHBRdWFsaWZpZXI6IHN0cmluZywgaXNUeXBlYWhlYWQ6IGJvb2xlYW4pOiBzdHJpbmcge1xuXHRcdGNvbnN0IGNvbnRlbnRUeXBlID0gaXNUeXBlYWhlYWQgPyBcIlBvcG92ZXJcIiA6IFwiRGlhbG9nXCI7XG5cblx0XHRyZXR1cm4gYCR7dmFsdWVIZWxwSWR9Ojoke2NvbnRlbnRUeXBlfTo6cXVhbGlmaWVyOjoke3ZhbHVlSGVscFF1YWxpZmllcn1gO1xuXHR9LFxuXG5cdF9hZGRJbk91dFBhcmFtZXRlcnNUb1BheWxvYWQ6IGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCB2YWx1ZUxpc3RJbmZvOiBWYWx1ZUxpc3RJbmZvKTogdm9pZCB7XG5cdFx0Y29uc3QgdmFsdWVIZWxwUXVhbGlmaWVyID0gdmFsdWVMaXN0SW5mby52YWx1ZUhlbHBRdWFsaWZpZXI7XG5cblx0XHRpZiAoIXBheWxvYWQucXVhbGlmaWVycykge1xuXHRcdFx0cGF5bG9hZC5xdWFsaWZpZXJzID0ge307XG5cdFx0fVxuXG5cdFx0aWYgKCFwYXlsb2FkLnF1YWxpZmllcnNbdmFsdWVIZWxwUXVhbGlmaWVyXSkge1xuXHRcdFx0cGF5bG9hZC5xdWFsaWZpZXJzW3ZhbHVlSGVscFF1YWxpZmllcl0gPSB7XG5cdFx0XHRcdHZoS2V5czogdmFsdWVMaXN0SW5mby52aEtleXMsXG5cdFx0XHRcdHZoUGFyYW1ldGVyczogdmFsdWVMaXN0SW5mby52aFBhcmFtZXRlcnNcblx0XHRcdH07XG5cdFx0fVxuXHR9LFxuXG5cdF9nZXRWYWx1ZUhlbHBDb2x1bW5EaXNwbGF5Rm9ybWF0OiBmdW5jdGlvbiAoXG5cdFx0cHJvcGVydHlBbm5vdGF0aW9uczogQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eSxcblx0XHRpc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlczogYm9vbGVhblxuXHQpOiBEaXNwbGF5Rm9ybWF0IHtcblx0XHRjb25zdCBkaXNwbGF5TW9kZSA9IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShwcm9wZXJ0eUFubm90YXRpb25zLCB1bmRlZmluZWQpLFxuXHRcdFx0dGV4dEFubm90YXRpb24gPSBwcm9wZXJ0eUFubm90YXRpb25zICYmIHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvblRleHRdLFxuXHRcdFx0dGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9IHRleHRBbm5vdGF0aW9uICYmIHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvblRleHRVSVRleHRBcnJhbmdlbWVudF07XG5cblx0XHRpZiAoaXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMpIHtcblx0XHRcdHJldHVybiB0ZXh0QW5ub3RhdGlvbiAmJiB0eXBlb2YgdGV4dEFubm90YXRpb24gIT09IFwic3RyaW5nXCIgJiYgdGV4dEFubm90YXRpb24uJFBhdGggPyBkaXNwbGF5TW9kZSA6IFwiVmFsdWVcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gT25seSBleHBsaWNpdCBkZWZpbmVkIFRleHRBcnJhbmdlbWVudHMgaW4gYSBWYWx1ZSBIZWxwIHdpdGggRGlhbG9nIGFyZSBjb25zaWRlcmVkXG5cdFx0XHRyZXR1cm4gdGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA/IGRpc3BsYXlNb2RlIDogXCJWYWx1ZVwiO1xuXHRcdH1cblx0fSxcblxuXHRfZ2V0V2lkdGhJblJlbTogZnVuY3Rpb24gKGNvbnRyb2w6IENvbnRyb2wsIGlzVW5pdFZhbHVlSGVscDogYm9vbGVhbik6IG51bWJlciB7XG5cdFx0bGV0IHdpZHRoID0gY29udHJvbC4kKCkud2lkdGgoKTsgLy8gSlF1ZXJ5XG5cdFx0aWYgKGlzVW5pdFZhbHVlSGVscCAmJiB3aWR0aCkge1xuXHRcdFx0d2lkdGggPSAwLjMgKiB3aWR0aDtcblx0XHR9XG5cdFx0Y29uc3QgZmxvYXRXaWR0aCA9IHdpZHRoID8gcGFyc2VGbG9hdChTdHJpbmcoUmVtLmZyb21QeCh3aWR0aCkpKSA6IDA7XG5cblx0XHRyZXR1cm4gaXNOYU4oZmxvYXRXaWR0aCkgPyAwIDogZmxvYXRXaWR0aDtcblx0fSxcblxuXHRfZ2V0VGFibGVXaWR0aDogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgbWluV2lkdGg6IG51bWJlcik6IHN0cmluZyB7XG5cdFx0bGV0IHdpZHRoOiBzdHJpbmc7XG5cdFx0Y29uc3QgY29sdW1ucyA9IHRhYmxlLmdldENvbHVtbnMoKSxcblx0XHRcdHZpc2libGVDb2x1bW5zID1cblx0XHRcdFx0KGNvbHVtbnMgJiZcblx0XHRcdFx0XHRjb2x1bW5zLmZpbHRlcihmdW5jdGlvbiAoY29sdW1uKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29sdW1uICYmIGNvbHVtbi5nZXRWaXNpYmxlICYmIGNvbHVtbi5nZXRWaXNpYmxlKCk7XG5cdFx0XHRcdFx0fSkpIHx8XG5cdFx0XHRcdFtdLFxuXHRcdFx0c3VtV2lkdGggPSB2aXNpYmxlQ29sdW1ucy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgY29sdW1uKSB7XG5cdFx0XHRcdHdpZHRoID0gY29sdW1uLmdldFdpZHRoKCk7XG5cdFx0XHRcdGlmICh3aWR0aCAmJiB3aWR0aC5lbmRzV2l0aChcInB4XCIpKSB7XG5cdFx0XHRcdFx0d2lkdGggPSBTdHJpbmcoUmVtLmZyb21QeCh3aWR0aCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGZsb2F0V2lkdGggPSBwYXJzZUZsb2F0KHdpZHRoKTtcblxuXHRcdFx0XHRyZXR1cm4gc3VtICsgKGlzTmFOKGZsb2F0V2lkdGgpID8gOSA6IGZsb2F0V2lkdGgpO1xuXHRcdFx0fSwgdmlzaWJsZUNvbHVtbnMubGVuZ3RoKTtcblx0XHRyZXR1cm4gYCR7TWF0aC5tYXgoc3VtV2lkdGgsIG1pbldpZHRoKX1lbWA7XG5cdH0sXG5cblx0X2NyZWF0ZVZhbHVlSGVscFR5cGVhaGVhZDogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdHByb3BlcnR5UGF0aDogc3RyaW5nLFxuXHRcdHZhbHVlSGVscDogVmFsdWVIZWxwLFxuXHRcdGNvbnRlbnQ6IE1UYWJsZSxcblx0XHR2YWx1ZUxpc3RJbmZvOiBWYWx1ZUxpc3RJbmZvLFxuXHRcdHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWRcblx0KSB7XG5cdFx0Y29uc3QgY29udGVudElkID0gY29udGVudC5nZXRJZCgpLFxuXHRcdFx0cHJvcGVydHlBbm5vdGF0aW9ucyA9IHZhbHVlSGVscC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIS5nZXRPYmplY3QoYCR7cHJvcGVydHlQYXRofUBgKSBhcyBBbm5vdGF0aW9uc0ZvclByb3BlcnR5LFxuXHRcdFx0dmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzID0gcHJvcGVydHlBbm5vdGF0aW9uc1tBbm5vdGF0aW9uVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzXSA/PyBmYWxzZSxcblx0XHRcdGlzRGlhbG9nVGFibGUgPSBmYWxzZSxcblx0XHRcdGNvbHVtbkluZm8gPSBWYWx1ZUxpc3RIZWxwZXIuZ2V0Q29sdW1uVmlzaWJpbGl0eUluZm8oXG5cdFx0XHRcdHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mbyxcblx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHR2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMsXG5cdFx0XHRcdGlzRGlhbG9nVGFibGVcblx0XHRcdCksXG5cdFx0XHRzb3VyY2VNb2RlbCA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0XHRpZDogY29udGVudElkLFxuXHRcdFx0XHRncm91cElkOiBwYXlsb2FkLnJlcXVlc3RHcm91cElkIHx8IHVuZGVmaW5lZCxcblx0XHRcdFx0YlN1Z2dlc3Rpb246IHRydWUsXG5cdFx0XHRcdHByb3BlcnR5UGF0aDogcHJvcGVydHlQYXRoLFxuXHRcdFx0XHRjb2x1bW5JbmZvOiBjb2x1bW5JbmZvLFxuXHRcdFx0XHR2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXM6IHZhbHVlSGVscFdpdGhGaXhlZFZhbHVlc1xuXHRcdFx0fSk7XG5cblx0XHRjb250ZW50LnNldEtleVBhdGgodmFsdWVMaXN0SW5mby5rZXlWYWx1ZSk7XG5cdFx0Y29udGVudC5zZXREZXNjcmlwdGlvblBhdGgodmFsdWVMaXN0SW5mby5kZXNjcmlwdGlvblZhbHVlKTtcblx0XHRwYXlsb2FkLmlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzID0gdmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzO1xuXG5cdFx0Y29uc3QgY29sbGVjdGlvbkFubm90YXRpb25zID0gKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby4kbW9kZWxcblx0XHRcdC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0LmdldE9iamVjdChgLyR7dmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofUBgKSB8fCB7fSkgYXMgQW5ub3RhdGlvbnNGb3JDb2xsZWN0aW9uO1xuXG5cdFx0Y29udGVudC5zZXRGaWx0ZXJGaWVsZHMoVmFsdWVMaXN0SGVscGVyLmVudGl0eUlzU2VhcmNoYWJsZShwcm9wZXJ0eUFubm90YXRpb25zLCBjb2xsZWN0aW9uQW5ub3RhdGlvbnMpID8gXCIkc2VhcmNoXCIgOiBcIlwiKTtcblxuXHRcdGNvbnN0IHRhYmxlID0gYXdhaXQgVmFsdWVMaXN0SGVscGVyLl90ZW1wbGF0ZUZyYWdtZW50PFRhYmxlPihcblx0XHRcdFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC52YWx1ZWhlbHAuVmFsdWVMaXN0VGFibGVcIixcblx0XHRcdHZhbHVlTGlzdEluZm8sXG5cdFx0XHRzb3VyY2VNb2RlbCxcblx0XHRcdHByb3BlcnR5UGF0aFxuXHRcdCk7XG5cblx0XHR0YWJsZS5zZXRNb2RlbCh2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uJG1vZGVsKTtcblxuXHRcdExvZy5pbmZvKGBWYWx1ZSBMaXN0LSBzdWdnZXN0IFRhYmxlIFhNTCBjb250ZW50IGNyZWF0ZWQgWyR7cHJvcGVydHlQYXRofV1gLCB0YWJsZS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSwgXCJNREMgVGVtcGxhdGluZ1wiKTtcblxuXHRcdGNvbnRlbnQuc2V0VGFibGUodGFibGUpO1xuXG5cdFx0Y29uc3QgZmllbGQgPSB2YWx1ZUhlbHAuZ2V0Q29udHJvbCgpO1xuXG5cdFx0aWYgKFxuXHRcdFx0ZmllbGQgIT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0KGZpZWxkLmlzQTxGaWx0ZXJGaWVsZD4oXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpIHx8XG5cdFx0XHRcdGZpZWxkLmlzQTxGaWVsZD4oXCJzYXAudWkubWRjLkZpZWxkXCIpIHx8XG5cdFx0XHRcdGZpZWxkLmlzQTxNdWx0aVZhbHVlRmllbGQ+KFwic2FwLnVpLm1kYy5NdWx0aVZhbHVlRmllbGRcIikpXG5cdFx0KSB7XG5cdFx0XHQvL0NhbiB0aGUgZmlsdGVyZmllbGQgYmUgc29tZXRoaW5nIGVsc2UgdGhhdCB3ZSBuZWVkIHRoZSAuaXNBKCkgY2hlY2s/XG5cdFx0XHRjb25zdCByZWR1Y2VXaWR0aEZvclVuaXRWYWx1ZUhlbHAgPSBCb29sZWFuKHBheWxvYWQuaXNVbml0VmFsdWVIZWxwKTtcblx0XHRcdGNvbnN0IHRhYmxlV2lkdGggPSBWYWx1ZUxpc3RIZWxwZXIuX2dldFRhYmxlV2lkdGgodGFibGUsIFZhbHVlTGlzdEhlbHBlci5fZ2V0V2lkdGhJblJlbShmaWVsZCwgcmVkdWNlV2lkdGhGb3JVbml0VmFsdWVIZWxwKSk7XG5cdFx0XHR0YWJsZS5zZXRXaWR0aCh0YWJsZVdpZHRoKTtcblxuXHRcdFx0aWYgKHZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcykge1xuXHRcdFx0XHR0YWJsZS5zZXRNb2RlKChmaWVsZCBhcyBGaWVsZEJhc2UpLmdldE1heENvbmRpdGlvbnMoKSA9PT0gMSA/IFwiU2luZ2xlU2VsZWN0TWFzdGVyXCIgOiBcIk11bHRpU2VsZWN0XCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFibGUuc2V0TW9kZShcIlNpbmdsZVNlbGVjdE1hc3RlclwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X2NyZWF0ZVZhbHVlSGVscERpYWxvZzogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdHByb3BlcnR5UGF0aDogc3RyaW5nLFxuXHRcdHZhbHVlSGVscDogVmFsdWVIZWxwLFxuXHRcdGNvbnRlbnQ6IE1EQ1RhYmxlLFxuXHRcdHZhbHVlTGlzdEluZm86IFZhbHVlTGlzdEluZm8sXG5cdFx0cGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZFxuXHQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBwcm9wZXJ0eUFubm90YXRpb25zID0gdmFsdWVIZWxwLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkhLmdldE9iamVjdChgJHtwcm9wZXJ0eVBhdGh9QGApIGFzIEFubm90YXRpb25zRm9yUHJvcGVydHksXG5cdFx0XHRpc0Ryb3BEb3duTGlzdGUgPSBmYWxzZSxcblx0XHRcdGlzRGlhbG9nVGFibGUgPSB0cnVlLFxuXHRcdFx0Y29sdW1uSW5mbyA9IFZhbHVlTGlzdEhlbHBlci5nZXRDb2x1bW5WaXNpYmlsaXR5SW5mbyh2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8sIHByb3BlcnR5UGF0aCwgaXNEcm9wRG93bkxpc3RlLCBpc0RpYWxvZ1RhYmxlKSxcblx0XHRcdHNvdXJjZU1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdGlkOiBjb250ZW50LmdldElkKCksXG5cdFx0XHRcdGdyb3VwSWQ6IHBheWxvYWQucmVxdWVzdEdyb3VwSWQgfHwgdW5kZWZpbmVkLFxuXHRcdFx0XHRiU3VnZ2VzdGlvbjogZmFsc2UsXG5cdFx0XHRcdGNvbHVtbkluZm86IGNvbHVtbkluZm8sXG5cdFx0XHRcdHZhbHVlSGVscFdpdGhGaXhlZFZhbHVlczogaXNEcm9wRG93bkxpc3RlXG5cdFx0XHR9KTtcblxuXHRcdGNvbnRlbnQuc2V0S2V5UGF0aCh2YWx1ZUxpc3RJbmZvLmtleVZhbHVlKTtcblx0XHRjb250ZW50LnNldERlc2NyaXB0aW9uUGF0aCh2YWx1ZUxpc3RJbmZvLmRlc2NyaXB0aW9uVmFsdWUpO1xuXG5cdFx0Y29uc3QgY29sbGVjdGlvbkFubm90YXRpb25zID0gKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby4kbW9kZWxcblx0XHRcdC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0LmdldE9iamVjdChgLyR7dmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofUBgKSB8fCB7fSkgYXMgQW5ub3RhdGlvbnNGb3JDb2xsZWN0aW9uO1xuXG5cdFx0Y29udGVudC5zZXRGaWx0ZXJGaWVsZHMoVmFsdWVMaXN0SGVscGVyLmVudGl0eUlzU2VhcmNoYWJsZShwcm9wZXJ0eUFubm90YXRpb25zLCBjb2xsZWN0aW9uQW5ub3RhdGlvbnMpID8gXCIkc2VhcmNoXCIgOiBcIlwiKTtcblxuXHRcdGNvbnN0IHRhYmxlUHJvbWlzZSA9IFZhbHVlTGlzdEhlbHBlci5fdGVtcGxhdGVGcmFnbWVudDxNZGNJbm5lclRhYmxlPihcblx0XHRcdFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC52YWx1ZWhlbHAuVmFsdWVMaXN0RGlhbG9nVGFibGVcIixcblx0XHRcdHZhbHVlTGlzdEluZm8sXG5cdFx0XHRzb3VyY2VNb2RlbCxcblx0XHRcdHByb3BlcnR5UGF0aFxuXHRcdCk7XG5cblx0XHRjb25zdCBmaWx0ZXJCYXJQcm9taXNlID0gVmFsdWVMaXN0SGVscGVyLl90ZW1wbGF0ZUZyYWdtZW50PE1kY0ZpbHRlckJhcj4oXG5cdFx0XHRcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudmFsdWVoZWxwLlZhbHVlTGlzdEZpbHRlckJhclwiLFxuXHRcdFx0dmFsdWVMaXN0SW5mbyxcblx0XHRcdHNvdXJjZU1vZGVsLFxuXHRcdFx0cHJvcGVydHlQYXRoXG5cdFx0KTtcblxuXHRcdGNvbnN0IFt0YWJsZSwgZmlsdGVyQmFyXSA9IGF3YWl0IFByb21pc2UuYWxsKFt0YWJsZVByb21pc2UsIGZpbHRlckJhclByb21pc2VdKTtcblxuXHRcdHRhYmxlLnNldE1vZGVsKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby4kbW9kZWwpO1xuXHRcdGZpbHRlckJhci5zZXRNb2RlbCh2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uJG1vZGVsKTtcblxuXHRcdGNvbnRlbnQuc2V0RmlsdGVyQmFyKGZpbHRlckJhcik7XG5cdFx0Y29udGVudC5zZXRUYWJsZSh0YWJsZSk7XG5cblx0XHR0YWJsZS5zZXRGaWx0ZXIoZmlsdGVyQmFyLmdldElkKCkpO1xuXHRcdHRhYmxlLmluaXRpYWxpemVkKCk7XG5cblx0XHRjb25zdCBmaWVsZCA9IHZhbHVlSGVscC5nZXRDb250cm9sKCk7XG5cdFx0aWYgKGZpZWxkICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRhYmxlLnNldFNlbGVjdGlvbk1vZGUoKGZpZWxkIGFzIEZpZWxkQmFzZSkuZ2V0TWF4Q29uZGl0aW9ucygpID09PSAxID8gXCJTaW5nbGVNYXN0ZXJcIiA6IFwiTXVsdGlcIik7XG5cdFx0fVxuXHRcdHRhYmxlLnNldFdpZHRoKFwiMTAwJVwiKTtcblxuXHRcdC8vVGhpcyBpcyBhIHRlbXBvcmFyeSB3b3JrYXJyb3VuZCAtIHByb3ZpZGVkIGJ5IE1EQyAoc2VlIEZJT1JJVEVDSFAxLTI0MDAyKVxuXHRcdGNvbnN0IG1kY1RhYmxlID0gdGFibGUgYXMgYW55O1xuXHRcdG1kY1RhYmxlLl9zZXRTaG93UDEzbkJ1dHRvbihmYWxzZSk7XG5cdH0sXG5cblx0X2dldENvbnRlbnRCeUlkOiBmdW5jdGlvbiA8VCBleHRlbmRzIE1UYWJsZSB8IE1EQ1RhYmxlPihjb250ZW50TGlzdDogQ29udGVudFtdLCBjb250ZW50SWQ6IHN0cmluZykge1xuXHRcdHJldHVybiBjb250ZW50TGlzdC5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRyZXR1cm4gaXRlbS5nZXRJZCgpID09PSBjb250ZW50SWQ7XG5cdFx0fSkgYXMgVCB8IHVuZGVmaW5lZDtcblx0fSxcblxuXHRfY3JlYXRlUG9wb3ZlckNvbnRlbnQ6IGZ1bmN0aW9uIChjb250ZW50SWQ6IHN0cmluZywgY2FzZVNlbnNpdGl2ZTogYm9vbGVhbiwgdXNlQXNWYWx1ZUhlbHA6IGJvb2xlYW4pIHtcblx0XHRyZXR1cm4gbmV3IE1UYWJsZSh7XG5cdFx0XHRpZDogY29udGVudElkLFxuXHRcdFx0Z3JvdXA6IFwiZ3JvdXAxXCIsXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBjYXNlU2Vuc2l0aXZlLFxuXHRcdFx0dXNlQXNWYWx1ZUhlbHA6IHVzZUFzVmFsdWVIZWxwXG5cdFx0fSBhcyAkTVRhYmxlU2V0dGluZ3MpO1xuXHR9LFxuXG5cdF9jcmVhdGVEaWFsb2dDb250ZW50OiBmdW5jdGlvbiAoY29udGVudElkOiBzdHJpbmcsIGNhc2VTZW5zaXRpdmU6IGJvb2xlYW4sIGZvcmNlQmluZDogYm9vbGVhbikge1xuXHRcdHJldHVybiBuZXcgTURDVGFibGUoe1xuXHRcdFx0aWQ6IGNvbnRlbnRJZCxcblx0XHRcdGdyb3VwOiBcImdyb3VwMVwiLFxuXHRcdFx0Y2FzZVNlbnNpdGl2ZTogY2FzZVNlbnNpdGl2ZSxcblx0XHRcdGZvcmNlQmluZDogZm9yY2VCaW5kXG5cdFx0fSBhcyAkTURDVGFibGVTZXR0aW5ncyk7XG5cdH0sXG5cblx0X3Nob3dDb25kaXRpb25zQ29udGVudDogZnVuY3Rpb24gKGNvbnRlbnRMaXN0OiBDb250ZW50W10sIGNvbnRhaW5lcjogQ29udGFpbmVyKSB7XG5cdFx0bGV0IGNvbmRpdGlvbnNDb250ZW50ID1cblx0XHRcdGNvbnRlbnRMaXN0Lmxlbmd0aCAmJiBjb250ZW50TGlzdFtjb250ZW50TGlzdC5sZW5ndGggLSAxXS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSA9PT0gXCJzYXAudWkubWRjLnZhbHVlaGVscC5jb250ZW50LkNvbmRpdGlvbnNcIlxuXHRcdFx0XHQ/IGNvbnRlbnRMaXN0W2NvbnRlbnRMaXN0Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdDogdW5kZWZpbmVkO1xuXG5cdFx0aWYgKGNvbmRpdGlvbnNDb250ZW50KSB7XG5cdFx0XHRjb25kaXRpb25zQ29udGVudC5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25kaXRpb25zQ29udGVudCA9IG5ldyBDb25kaXRpb25zKCk7XG5cdFx0XHRjb250YWluZXIuYWRkQ29udGVudChjb25kaXRpb25zQ29udGVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9hbGlnbk9yQ3JlYXRlQ29udGVudDogZnVuY3Rpb24gKFxuXHRcdHZhbHVlTGlzdEluZm86IFZhbHVlTGlzdEluZm8sXG5cdFx0Y29udGVudElkOiBzdHJpbmcsXG5cdFx0Y2FzZVNlbnNpdGl2ZTogYm9vbGVhbixcblx0XHRzaG93Q29uZGl0aW9uUGFuZWw6IGJvb2xlYW4sXG5cdFx0Y29udGFpbmVyOiBDb250YWluZXJcblx0KSB7XG5cdFx0Y29uc3QgY29udGVudExpc3QgPSBjb250YWluZXIuZ2V0Q29udGVudCgpO1xuXHRcdGxldCBjb250ZW50ID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb250ZW50QnlJZDxNRENUYWJsZT4oY29udGVudExpc3QsIGNvbnRlbnRJZCk7XG5cblx0XHRpZiAoIWNvbnRlbnQpIHtcblx0XHRcdGNvbnN0IGZvcmNlQmluZCA9IHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby5GZXRjaFZhbHVlcyA9PT0gMiA/IGZhbHNlIDogdHJ1ZTtcblxuXHRcdFx0Y29udGVudCA9IFZhbHVlTGlzdEhlbHBlci5fY3JlYXRlRGlhbG9nQ29udGVudChjb250ZW50SWQsIGNhc2VTZW5zaXRpdmUsIGZvcmNlQmluZCk7XG5cblx0XHRcdGlmICghc2hvd0NvbmRpdGlvblBhbmVsKSB7XG5cdFx0XHRcdGNvbnRhaW5lci5hZGRDb250ZW50KGNvbnRlbnQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGFpbmVyLmluc2VydENvbnRlbnQoY29udGVudCwgY29udGVudExpc3QubGVuZ3RoIC0gMSk7IC8vIGluc2VydCBjb250ZW50IGJlZm9yZSBjb25kaXRpb25zIGNvbnRlbnRcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29udGVudC5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjb250ZW50O1xuXHR9LFxuXG5cdF9wcmVwYXJlVmFsdWVIZWxwVHlwZUFoZWFkOiBmdW5jdGlvbiAoXG5cdFx0dmFsdWVIZWxwOiBWYWx1ZUhlbHAsXG5cdFx0Y29udGFpbmVyOiBDb250YWluZXIsXG5cdFx0dmFsdWVMaXN0SW5mb3M6IFZhbHVlTGlzdEluZm9bXSxcblx0XHRwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLFxuXHRcdGNhc2VTZW5zaXRpdmU6IGJvb2xlYW4sXG5cdFx0Zmlyc3RUeXBlQWhlYWRDb250ZW50OiBNVGFibGVcblx0KSB7XG5cdFx0Y29uc3QgY29udGVudExpc3QgPSBjb250YWluZXIuZ2V0Q29udGVudCgpO1xuXHRcdGxldCBxdWFsaWZpZXJGb3JUeXBlYWhlYWQgPSB2YWx1ZUhlbHAuZGF0YShcInZhbHVlbGlzdEZvclZhbGlkYXRpb25cIikgfHwgXCJcIjsgLy8gY2FuIGFsc28gYmUgbnVsbFxuXHRcdGlmIChxdWFsaWZpZXJGb3JUeXBlYWhlYWQgPT09IFwiIFwiKSB7XG5cdFx0XHRxdWFsaWZpZXJGb3JUeXBlYWhlYWQgPSBcIlwiO1xuXHRcdH1cblx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvID0gcXVhbGlmaWVyRm9yVHlwZWFoZWFkXG5cdFx0XHQ/IHZhbHVlTGlzdEluZm9zLmZpbHRlcihmdW5jdGlvbiAoc3ViVmFsdWVMaXN0SW5mbykge1xuXHRcdFx0XHRcdHJldHVybiBzdWJWYWx1ZUxpc3RJbmZvLnZhbHVlSGVscFF1YWxpZmllciA9PT0gcXVhbGlmaWVyRm9yVHlwZWFoZWFkO1xuXHRcdFx0ICB9KVswXVxuXHRcdFx0OiB2YWx1ZUxpc3RJbmZvc1swXTtcblxuXHRcdFZhbHVlTGlzdEhlbHBlci5fYWRkSW5PdXRQYXJhbWV0ZXJzVG9QYXlsb2FkKHBheWxvYWQsIHZhbHVlTGlzdEluZm8pO1xuXG5cdFx0Y29uc3QgY29udGVudElkID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb250ZW50SWQodmFsdWVIZWxwLmdldElkKCksIHZhbHVlTGlzdEluZm8udmFsdWVIZWxwUXVhbGlmaWVyLCB0cnVlKTtcblx0XHRsZXQgY29udGVudCA9IFZhbHVlTGlzdEhlbHBlci5fZ2V0Q29udGVudEJ5SWQ8TVRhYmxlPihjb250ZW50TGlzdCwgY29udGVudElkKTtcblxuXHRcdGlmICghY29udGVudCkge1xuXHRcdFx0Y29uc3QgdXNlQXNWYWx1ZUhlbHAgPSBmaXJzdFR5cGVBaGVhZENvbnRlbnQuZ2V0VXNlQXNWYWx1ZUhlbHAoKTtcblx0XHRcdGNvbnRlbnQgPSBWYWx1ZUxpc3RIZWxwZXIuX2NyZWF0ZVBvcG92ZXJDb250ZW50KGNvbnRlbnRJZCwgY2FzZVNlbnNpdGl2ZSwgdXNlQXNWYWx1ZUhlbHApO1xuXG5cdFx0XHRjb250YWluZXIuaW5zZXJ0Q29udGVudChjb250ZW50LCAwKTsgLy8gaW5zZXJ0IGNvbnRlbnQgYXMgZmlyc3QgY29udGVudFxuXHRcdH0gZWxzZSBpZiAoY29udGVudElkICE9PSBjb250ZW50TGlzdFswXS5nZXRJZCgpKSB7XG5cdFx0XHQvLyBjb250ZW50IGFscmVhZHkgYXZhaWxhYmxlIGJ1dCBub3QgYXMgZmlyc3QgY29udGVudD9cblx0XHRcdGNvbnRhaW5lci5yZW1vdmVDb250ZW50KGNvbnRlbnQpO1xuXHRcdFx0Y29udGFpbmVyLmluc2VydENvbnRlbnQoY29udGVudCwgMCk7IC8vIG1vdmUgY29udGVudCB0byBmaXJzdCBwb3NpdGlvblxuXHRcdH1cblxuXHRcdHJldHVybiB7IHZhbHVlTGlzdEluZm8sIGNvbnRlbnQgfTtcblx0fSxcblxuXHRfcHJlcGFyZVZhbHVlSGVscERpYWxvZzogZnVuY3Rpb24gKFxuXHRcdHZhbHVlSGVscDogVmFsdWVIZWxwLFxuXHRcdGNvbnRhaW5lcjogQ29udGFpbmVyLFxuXHRcdHZhbHVlTGlzdEluZm9zOiBWYWx1ZUxpc3RJbmZvW10sXG5cdFx0cGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCxcblx0XHRzZWxlY3RlZENvbnRlbnRJZDogc3RyaW5nLFxuXHRcdGNhc2VTZW5zaXRpdmU6IGJvb2xlYW5cblx0KSB7XG5cdFx0Y29uc3Qgc2hvd0NvbmRpdGlvblBhbmVsID0gdmFsdWVIZWxwLmRhdGEoXCJzaG93Q29uZGl0aW9uUGFuZWxcIikgJiYgdmFsdWVIZWxwLmRhdGEoXCJzaG93Q29uZGl0aW9uUGFuZWxcIikgIT09IFwiZmFsc2VcIjtcblx0XHRjb25zdCBjb250ZW50TGlzdCA9IGNvbnRhaW5lci5nZXRDb250ZW50KCk7XG5cblx0XHQvLyBzZXQgYWxsIGNvbnRlbnRzIHRvIGludmlzaWJsZVxuXHRcdGZvciAoY29uc3QgY29udGVudExpc3RJdGVtIG9mIGNvbnRlbnRMaXN0KSB7XG5cdFx0XHRjb250ZW50TGlzdEl0ZW0uc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0fVxuXG5cdFx0aWYgKHNob3dDb25kaXRpb25QYW5lbCkge1xuXHRcdFx0dGhpcy5fc2hvd0NvbmRpdGlvbnNDb250ZW50KGNvbnRlbnRMaXN0LCBjb250YWluZXIpO1xuXHRcdH1cblxuXHRcdGxldCBzZWxlY3RlZEluZm86IFZhbHVlTGlzdEluZm8gfCB1bmRlZmluZWQsIHNlbGVjdGVkQ29udGVudDogTURDVGFibGUgfCB1bmRlZmluZWQ7XG5cblx0XHQvLyBDcmVhdGUgb3IgcmV1c2UgY29udGVudHMgZm9yIHRoZSBjdXJyZW50IGNvbnRleHRcblx0XHRmb3IgKGNvbnN0IHZhbHVlTGlzdEluZm8gb2YgdmFsdWVMaXN0SW5mb3MpIHtcblx0XHRcdGNvbnN0IHZhbHVlSGVscFF1YWxpZmllciA9IHZhbHVlTGlzdEluZm8udmFsdWVIZWxwUXVhbGlmaWVyO1xuXG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX2FkZEluT3V0UGFyYW1ldGVyc1RvUGF5bG9hZChwYXlsb2FkLCB2YWx1ZUxpc3RJbmZvKTtcblxuXHRcdFx0Y29uc3QgY29udGVudElkID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb250ZW50SWQodmFsdWVIZWxwLmdldElkKCksIHZhbHVlSGVscFF1YWxpZmllciwgZmFsc2UpO1xuXG5cdFx0XHRjb25zdCBjb250ZW50ID0gdGhpcy5fYWxpZ25PckNyZWF0ZUNvbnRlbnQodmFsdWVMaXN0SW5mbywgY29udGVudElkLCBjYXNlU2Vuc2l0aXZlLCBzaG93Q29uZGl0aW9uUGFuZWwsIGNvbnRhaW5lcik7XG5cblx0XHRcdGlmICh2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uTGFiZWwpIHtcblx0XHRcdFx0Y29uc3QgdGl0bGUgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby5MYWJlbCwgdmFsdWVIZWxwLmdldENvbnRyb2woKSk7XG5cdFx0XHRcdGNvbnRlbnQuc2V0VGl0bGUodGl0bGUpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXNlbGVjdGVkQ29udGVudCB8fCAoc2VsZWN0ZWRDb250ZW50SWQgJiYgc2VsZWN0ZWRDb250ZW50SWQgPT09IGNvbnRlbnRJZCkpIHtcblx0XHRcdFx0c2VsZWN0ZWRDb250ZW50ID0gY29udGVudDtcblx0XHRcdFx0c2VsZWN0ZWRJbmZvID0gdmFsdWVMaXN0SW5mbztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIXNlbGVjdGVkSW5mbyB8fCAhc2VsZWN0ZWRDb250ZW50KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3RlZEluZm8gb3Igc2VsZWN0ZWRDb250ZW50IHVuZGVmaW5lZFwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4geyBzZWxlY3RlZEluZm8sIHNlbGVjdGVkQ29udGVudCB9O1xuXHR9LFxuXG5cdHNob3dWYWx1ZUxpc3Q6IGFzeW5jIGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCBjb250YWluZXI6IENvbnRhaW5lciwgc2VsZWN0ZWRDb250ZW50SWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHZhbHVlSGVscCA9IGNvbnRhaW5lci5nZXRQYXJlbnQoKSBhcyBWYWx1ZUhlbHAsXG5cdFx0XHRpc1R5cGVhaGVhZCA9IGNvbnRhaW5lci5pc1R5cGVhaGVhZCgpLFxuXHRcdFx0cHJvcGVydHlQYXRoID0gcGF5bG9hZC5wcm9wZXJ0eVBhdGgsXG5cdFx0XHRtZXRhTW9kZWwgPSB2YWx1ZUhlbHAuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHZoVUlNb2RlbCA9ICh2YWx1ZUhlbHAuZ2V0TW9kZWwoXCJfVkhVSVwiKSBhcyBKU09OTW9kZWwpIHx8IFZhbHVlTGlzdEhlbHBlci5jcmVhdGVWSFVJTW9kZWwodmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGgsIG1ldGFNb2RlbCk7XG5cblx0XHRpZiAoIXBheWxvYWQucXVhbGlmaWVycykge1xuXHRcdFx0cGF5bG9hZC5xdWFsaWZpZXJzID0ge307XG5cdFx0fVxuXG5cdFx0dmhVSU1vZGVsLnNldFByb3BlcnR5KFwiL2lzU3VnZ2VzdGlvblwiLCBpc1R5cGVhaGVhZCk7XG5cdFx0dmhVSU1vZGVsLnNldFByb3BlcnR5KFwiL21pblNjcmVlbldpZHRoXCIsICFpc1R5cGVhaGVhZCA/IFwiNDE4cHhcIiA6IHVuZGVmaW5lZCk7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgdmFsdWVMaXN0SW5mb3MgPSBhd2FpdCBWYWx1ZUxpc3RIZWxwZXIuZ2V0VmFsdWVMaXN0SW5mbyh2YWx1ZUhlbHAsIHByb3BlcnR5UGF0aCwgcGF5bG9hZCk7XG5cdFx0XHRjb25zdCBmaXJzdFR5cGVBaGVhZENvbnRlbnQgPSB2YWx1ZUhlbHAuZ2V0VHlwZWFoZWFkKCkuZ2V0Q29udGVudCgpWzBdIGFzIE1UYWJsZSxcblx0XHRcdFx0Y2FzZVNlbnNpdGl2ZSA9IGZpcnN0VHlwZUFoZWFkQ29udGVudC5nZXRDYXNlU2Vuc2l0aXZlKCk7IC8vIHRha2UgY2FzZVNlbnNpdGl2ZSBmcm9tIGZpcnN0IFR5cGVhaGVhZCBjb250ZW50XG5cblx0XHRcdGlmIChpc1R5cGVhaGVhZCkge1xuXHRcdFx0XHRjb25zdCB7IHZhbHVlTGlzdEluZm8sIGNvbnRlbnQgfSA9IFZhbHVlTGlzdEhlbHBlci5fcHJlcGFyZVZhbHVlSGVscFR5cGVBaGVhZChcblx0XHRcdFx0XHR2YWx1ZUhlbHAsXG5cdFx0XHRcdFx0Y29udGFpbmVyLFxuXHRcdFx0XHRcdHZhbHVlTGlzdEluZm9zLFxuXHRcdFx0XHRcdHBheWxvYWQsXG5cdFx0XHRcdFx0Y2FzZVNlbnNpdGl2ZSxcblx0XHRcdFx0XHRmaXJzdFR5cGVBaGVhZENvbnRlbnRcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRwYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllciA9IHZhbHVlTGlzdEluZm8udmFsdWVIZWxwUXVhbGlmaWVyO1xuXG5cdFx0XHRcdGlmIChjb250ZW50LmdldFRhYmxlKCkgPT09IHVuZGVmaW5lZCB8fCBjb250ZW50LmdldFRhYmxlKCkgPT09IG51bGwpIHtcblx0XHRcdFx0XHRhd2FpdCBWYWx1ZUxpc3RIZWxwZXIuX2NyZWF0ZVZhbHVlSGVscFR5cGVhaGVhZChwcm9wZXJ0eVBhdGgsIHZhbHVlSGVscCwgY29udGVudCwgdmFsdWVMaXN0SW5mbywgcGF5bG9hZCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHsgc2VsZWN0ZWRJbmZvLCBzZWxlY3RlZENvbnRlbnQgfSA9IFZhbHVlTGlzdEhlbHBlci5fcHJlcGFyZVZhbHVlSGVscERpYWxvZyhcblx0XHRcdFx0XHR2YWx1ZUhlbHAsXG5cdFx0XHRcdFx0Y29udGFpbmVyLFxuXHRcdFx0XHRcdHZhbHVlTGlzdEluZm9zLFxuXHRcdFx0XHRcdHBheWxvYWQsXG5cdFx0XHRcdFx0c2VsZWN0ZWRDb250ZW50SWQsXG5cdFx0XHRcdFx0Y2FzZVNlbnNpdGl2ZVxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdHBheWxvYWQudmFsdWVIZWxwUXVhbGlmaWVyID0gc2VsZWN0ZWRJbmZvLnZhbHVlSGVscFF1YWxpZmllcjtcblx0XHRcdFx0LyogRm9yIGNvbnRleHQgZGVwZW50ZW50IHZhbHVlIGhlbHBzIHRoZSB2YWx1ZSBsaXN0IGxhYmVsIGlzIHVzZWQgZm9yIHRoZSBkaWFsb2cgdGl0bGUgKi9cblx0XHRcdFx0Y29uc3QgdGl0bGUgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nKFxuXHRcdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5fZ2V0RGlhbG9nVGl0bGUodmFsdWVIZWxwLCBzZWxlY3RlZEluZm8udmFsdWVMaXN0SW5mbz8uTGFiZWwpLFxuXHRcdFx0XHRcdHZhbHVlSGVscC5nZXRDb250cm9sKClcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29udGFpbmVyLnNldFRpdGxlKHRpdGxlKTtcblxuXHRcdFx0XHRpZiAoc2VsZWN0ZWRDb250ZW50LmdldFRhYmxlKCkgPT09IHVuZGVmaW5lZCB8fCBzZWxlY3RlZENvbnRlbnQuZ2V0VGFibGUoKSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdGF3YWl0IFZhbHVlTGlzdEhlbHBlci5fY3JlYXRlVmFsdWVIZWxwRGlhbG9nKHByb3BlcnR5UGF0aCwgdmFsdWVIZWxwLCBzZWxlY3RlZENvbnRlbnQsIHNlbGVjdGVkSW5mbywgcGF5bG9hZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHRoaXMuX2xvZ0Vycm9yKHByb3BlcnR5UGF0aCwgZXJyKTtcblxuXHRcdFx0VmFsdWVMaXN0SGVscGVyLmRlc3Ryb3lWSENvbnRlbnQodmFsdWVIZWxwKTtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZhbHVlTGlzdEhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0VBbUVBLE1BQU1BLHVCQUF1QixHQUFHLENBQUNDLFVBQXVCLEVBQUVDLEtBQWEsS0FBYyxDQUFDRCxVQUFVLENBQUNFLElBQUksQ0FBRUMsTUFBTSxJQUFLQSxNQUFNLENBQUNDLElBQUksS0FBS0gsS0FBSyxDQUFDO0VBRWpJLE1BQU1JLGVBQWUsR0FBRyx1Q0FBdUM7SUFDckVDLGNBQWMsR0FBRyxzQ0FBc0M7SUFDdkRDLCtCQUErQixHQUFHLGlGQUFpRjtJQUNuSEMsOEJBQThCLEdBQUcscURBQXFEO0lBQ3RGQyxvQ0FBb0MsR0FBRywyREFBMkQ7SUFDbEdDLCtCQUErQixHQUFHLHNEQUFzRDtJQUN4RkMsaUNBQWlDLEdBQUcsd0RBQXdEO0lBQzVGQyxrQ0FBa0MsR0FBRywwREFBMEQ7RUFBQztFQUFBO0VBQUE7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFBO0VBeUZqRyxTQUFTQywyQkFBMkIsQ0FBQ0Ms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