/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/deepEqual", "sap/base/util/deepExtend", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/ExcelFormatHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filterBar/FilterBarDelegate", "sap/fe/macros/ResourceModel", "sap/fe/macros/table/TableSizeHelper", "sap/fe/macros/table/Utils", "sap/ui/core/Fragment", "sap/ui/mdc/odata/v4/TableDelegate", "sap/ui/model/Filter", "sap/ui/model/json/JSONModel"], function (Log, deepClone, deepEqual, deepExtend, ActionRuntime, CommonUtils, MetaModelConverter, ValueFormatter, DeleteHelper, ExcelFormat, ModelHelper, EDM, TypeUtil, CommonHelper, DelegateUtil, FilterBarDelegate, ResourceModel, TableSizeHelper, TableUtils, Fragment, TableDelegateBase, Filter, JSONModel) {
  "use strict";

  var isTypeFilterable = EDM.isTypeFilterable;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  const SEMANTICKEY_HAS_DRAFTINDICATOR = "/semanticKeyHasDraftIndicator";

  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * The class is experimental and the API and the behavior are not finalized. This class is not intended for productive usage.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69
   * @alias sap.fe.macros.TableDelegate
   */
  return Object.assign({}, TableDelegateBase, {
    /**
     * This function calculates the width for a FieldGroup column.
     * The width of the FieldGroup is the width of the widest property contained in the FieldGroup (including the label if showDataFieldsLabel is true)
     * The result of this calculation is stored in the visualSettings.widthCalculation.minWidth property, which is used by the MDCtable.
     *
     * @param oTable Instance of the MDCtable
     * @param oProperty Current property
     * @param aProperties Array of properties
     * @private
     * @alias sap.fe.macros.TableDelegate
     */
    _computeVisualSettingsForFieldGroup: function (oTable, oProperty, aProperties) {
      if (oProperty.name.indexOf("DataFieldForAnnotation::FieldGroup::") === 0) {
        const oColumn = oTable.getColumns().find(function (oCol) {
          return oCol.getDataProperty() === oProperty.name;
        });
        const bShowDataFieldsLabel = oColumn ? oColumn.data("showDataFieldsLabel") === "true" : false;
        const oMetaModel = oTable.getModel().getMetaModel();
        const involvedDataModelObjects = getInvolvedDataModelObjects(oMetaModel.getContext(oProperty.metadataPath));
        const convertedMetaData = involvedDataModelObjects.convertedTypes;
        const oDataField = involvedDataModelObjects.targetObject;
        const oFieldGroup = oDataField.Target.$target;
        const aFieldWidth = [];
        oFieldGroup.Data.forEach(function (oData) {
          let oDataFieldWidth;
          switch (oData.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
              oDataFieldWidth = TableSizeHelper.getWidthForDataFieldForAnnotation(oData, aProperties, convertedMetaData, bShowDataFieldsLabel);
              break;
            case "com.sap.vocabularies.UI.v1.DataField":
              oDataFieldWidth = TableSizeHelper.getWidthForDataField(oData, bShowDataFieldsLabel, aProperties, convertedMetaData);
              break;
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              oDataFieldWidth = {
                labelWidth: 0,
                propertyWidth: TableSizeHelper.getButtonWidth(oData.Label)
              };
              break;
            default:
          }
          if (oDataFieldWidth) {
            aFieldWidth.push(oDataFieldWidth.labelWidth + oDataFieldWidth.propertyWidth);
          }
        });
        const nWidest = aFieldWidth.reduce(function (acc, value) {
          return Math.max(acc, value);
        }, 0);
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            verticalArrangement: true,
            minWidth: Math.ceil(nWidest)
          }
        });
      }
    },
    _computeVisualSettingsForPropertyWithValueHelp: function (table, property) {
      const tableAPI = table.getParent();
      if (!property.propertyInfos) {
        const metaModel = table.getModel().getMetaModel();
        if (property.metadataPath && metaModel) {
          const dataField = metaModel.getObject(`${property.metadataPath}@`);
          if (dataField && dataField["@com.sap.vocabularies.Common.v1.ValueList"]) {
            property.visualSettings = deepExtend(property.visualSettings || {}, {
              widthCalculation: {
                gap: tableAPI.getProperty("readOnly") ? 0 : 4
              }
            });
          }
        }
      }
    },
    _computeVisualSettingsForPropertyWithUnit: function (oTable, oProperty, oUnit, oUnitText, oTimezoneText) {
      const oTableAPI = oTable ? oTable.getParent() : null;
      // update gap for properties with string unit
      const sUnitText = oUnitText || oTimezoneText;
      if (sUnitText) {
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            gap: Math.ceil(TableSizeHelper.getButtonWidth(sUnitText))
          }
        });
      }
      if (oUnit) {
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            // For properties with unit, a gap needs to be added to properly render the column width on edit mode
            gap: oTableAPI && oTableAPI.getReadOnly() ? 0 : 6
          }
        });
      }
    },
    _computeLabel: function (property, labelMap) {
      if (property.label) {
        var _property$path;
        const propertiesWithSameLabel = labelMap[property.label];
        if ((propertiesWithSameLabel === null || propertiesWithSameLabel === void 0 ? void 0 : propertiesWithSameLabel.length) > 1 && (_property$path = property.path) !== null && _property$path !== void 0 && _property$path.includes("/") && property.additionalLabels) {
          property.label = property.label + " (" + property.additionalLabels.join(" / ") + ")";
        }
        delete property.additionalLabels;
      }
    },
    //Update VisualSetting for columnWidth calculation and labels on navigation properties
    _updatePropertyInfo: function (table, properties) {
      const labelMap = {};
      // Check available p13n modes
      const p13nMode = table.getP13nMode();
      properties.forEach(property => {
        if (!property.propertyInfos && property.label) {
          // Only for non-complex properties
          if ((p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Sort")) > -1 && property.sortable || (p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Filter")) > -1 && property.filterable || (p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Group")) > -1 && property.groupable) {
            labelMap[property.label] = labelMap[property.label] !== undefined ? labelMap[property.label].concat([property]) : [property];
          }
        }
      });
      properties.forEach(property => {
        this._computeVisualSettingsForFieldGroup(table, property, properties);
        this._computeVisualSettingsForPropertyWithValueHelp(table, property);
        // bcp: 2270003577
        // Some columns (eg: custom columns) have no typeConfig property.
        // initializing it prevents an exception throw
        property.typeConfig = deepExtend(property.typeConfig, {});
        this._computeLabel(property, labelMap);
      });
      return properties;
    },
    getColumnsFor: function (table) {
      return table.getParent().getTableDefinition().columns;
    },
    _getAggregatedPropertyMap: function (oTable) {
      return oTable.getParent().getTableDefinition().aggregates;
    },
    /**
     * Returns the export capabilities for the given sap.ui.mdc.Table instance.
     *
     * @param oTable Instance of the table
     * @returns Promise representing the export capabilities of the table instance
     */
    fetchExportCapabilities: function (oTable) {
      const oCapabilities = {
        XLSX: {}
      };
      let oModel;
      return DelegateUtil.fetchModel(oTable).then(function (model) {
        oModel = model;
        return oModel.getMetaModel().getObject("/$EntityContainer@Org.OData.Capabilities.V1.SupportedFormats");
      }).then(function (aSupportedFormats) {
        const aLowerFormats = (aSupportedFormats || []).map(element => {
          return element.toLowerCase();
        });
        if (aLowerFormats.indexOf("application/pdf") > -1) {
          return oModel.getMetaModel().getObject("/$EntityContainer@com.sap.vocabularies.PDF.v1.Features");
        }
        return undefined;
      }).then(function (oAnnotation) {
        if (oAnnotation) {
          oCapabilities["PDF"] = Object.assign({}, oAnnotation);
        }
      }).catch(function (err) {
        Log.error(`An error occurs while computing export capabilities: ${err}`);
      }).then(function () {
        return oCapabilities;
      });
    },
    /**
     * Filtering on 1:n navigation properties and navigation
     * properties not part of the LineItem annotation is forbidden.
     *
     * @param columnInfo
     * @param metaModel
     * @param table
     * @returns Boolean true if filtering is allowed, false otherwise
     */
    _isFilterableNavigationProperty: function (columnInfo, metaModel, table) {
      // get the DataModelObjectPath for the table
      const tableDataModelObjectPath = getInvolvedDataModelObjects(metaModel.getContext(DelegateUtil.getCustomData(table, "metaPath"))),
        // get all navigation properties leading to the column
        columnNavigationProperties = getInvolvedDataModelObjects(metaModel.getContext(columnInfo.annotationPath)).navigationProperties,
        // we are only interested in navigation properties relative to the table, so all before and including the tables targetType can be filtered
        tableTargetEntityIndex = columnNavigationProperties.findIndex(prop => {
          var _prop$targetType;
          return ((_prop$targetType = prop.targetType) === null || _prop$targetType === void 0 ? void 0 : _prop$targetType.name) === tableDataModelObjectPath.targetEntityType.name;
        }),
        relativeNavigationProperties = columnNavigationProperties.slice(tableTargetEntityIndex > 0 ? tableTargetEntityIndex : 0);
      return !columnInfo.relativePath.includes("/") || columnInfo.isPartOfLineItem === true && !relativeNavigationProperties.some(navigationProperty => navigationProperty._type == "NavigationProperty" && navigationProperty.isCollection);
    },
    _fetchPropertyInfo: function (metaModel, columnInfo, table, appComponent) {
      var _columnInfo$typeConfi, _columnInfo$typeConfi2, _columnInfo$propertyI;
      const sAbsoluteNavigationPath = columnInfo.annotationPath,
        oDataField = metaModel.getObject(sAbsoluteNavigationPath),
        oNavigationContext = metaModel.createBindingContext(sAbsoluteNavigationPath),
        oTypeConfig = (_columnInfo$typeConfi = columnInfo.typeConfig) !== null && _columnInfo$typeConfi !== void 0 && _columnInfo$typeConfi.className && isTypeFilterable(columnInfo.typeConfig.className) ? TypeUtil.getTypeConfig(columnInfo.typeConfig.className, columnInfo.typeConfig.formatOptions, columnInfo.typeConfig.constraints) : {},
        bFilterable = CommonHelper.isPropertyFilterable(oNavigationContext, oDataField),
        isComplexType = columnInfo.typeConfig && columnInfo.typeConfig.className && ((_columnInfo$typeConfi2 = columnInfo.typeConfig.className) === null || _columnInfo$typeConfi2 === void 0 ? void 0 : _columnInfo$typeConfi2.indexOf("Edm.")) !== 0,
        bIsAnalyticalTable = DelegateUtil.getCustomData(table, "enableAnalytics") === "true",
        aAggregatedPropertyMapUnfilterable = bIsAnalyticalTable ? this._getAggregatedPropertyMap(table) : {},
        label = DelegateUtil.getLocalizedText(columnInfo.label ?? "", appComponent ?? table);
      const propertyInfo = {
        name: columnInfo.name,
        metadataPath: sAbsoluteNavigationPath,
        groupLabel: columnInfo.groupLabel,
        group: columnInfo.group,
        label: label,
        tooltip: columnInfo.tooltip,
        typeConfig: oTypeConfig,
        visible: columnInfo.availability !== "Hidden" && !isComplexType,
        exportSettings: this._setPropertyInfoExportSettings(columnInfo.exportSettings, columnInfo),
        unit: columnInfo.unit
      };

      // Set visualSettings only if it exists
      if (columnInfo.visualSettings && Object.keys(columnInfo.visualSettings).length > 0) {
        propertyInfo.visualSettings = columnInfo.visualSettings;
      }
      if (columnInfo.exportDataPointTargetValue) {
        propertyInfo.exportDataPointTargetValue = columnInfo.exportDataPointTargetValue;
      }

      // MDC expects  'propertyInfos' only for complex properties.
      // An empty array throws validation error and undefined value is unhandled.
      if ((_columnInfo$propertyI = columnInfo.propertyInfos) !== null && _columnInfo$propertyI !== void 0 && _columnInfo$propertyI.length) {
        propertyInfo.propertyInfos = columnInfo.propertyInfos;
        //only in case of complex properties, wrap the cell content	on the excel exported file
        if (propertyInfo.exportSettings) {
          var _columnInfo$exportSet;
          propertyInfo.exportSettings.wrap = (_columnInfo$exportSet = columnInfo.exportSettings) === null || _columnInfo$exportSet === void 0 ? void 0 : _columnInfo$exportSet.wrap;
        }
      } else {
        var _extension;
        // Add properties which are supported only by simple PropertyInfos.
        propertyInfo.path = columnInfo.relativePath;
        // TODO with the new complex property info, a lot of "Description" fields are added as filter/sort fields
        propertyInfo.sortable = columnInfo.sortable;
        if (bIsAnalyticalTable) {
          this._updateAnalyticalPropertyInfoAttributes(propertyInfo, columnInfo);
        }
        propertyInfo.filterable = !!bFilterable && this._isFilterableNavigationProperty(columnInfo, metaModel, table) && (
        // TODO ignoring all properties that are not also available for adaptation for now, but proper concept required
        !bIsAnalyticalTable || !aAggregatedPropertyMapUnfilterable[propertyInfo.name] && !((_extension = columnInfo.extension) !== null && _extension !== void 0 && _extension.technicallyGroupable));
        propertyInfo.key = columnInfo.isKey;
        propertyInfo.groupable = columnInfo.isGroupable;
        if (columnInfo.textArrangement) {
          const descriptionColumn = this.getColumnsFor(table).find(function (oCol) {
            var _columnInfo$textArran;
            return oCol.name === ((_columnInfo$textArran = columnInfo.textArrangement) === null || _columnInfo$textArran === void 0 ? void 0 : _columnInfo$textArran.textProperty);
          });
          if (descriptionColumn) {
            propertyInfo.mode = columnInfo.textArrangement.mode;
            propertyInfo.valueProperty = columnInfo.relativePath;
            propertyInfo.descriptionProperty = descriptionColumn.relativePath;
          }
        }
        propertyInfo.text = columnInfo.textArrangement && columnInfo.textArrangement.textProperty;
        propertyInfo.caseSensitive = columnInfo.caseSensitive;
        if (columnInfo.additionalLabels) {
          propertyInfo.additionalLabels = columnInfo.additionalLabels.map(additionalLabel => {
            return DelegateUtil.getLocalizedText(additionalLabel, appComponent || table);
          });
        }
      }
      this._computeVisualSettingsForPropertyWithUnit(table, propertyInfo, columnInfo.unit, columnInfo.unitText, columnInfo.timezoneText);
      return propertyInfo;
    },
    /**
     * Extend the export settings based on the column info.
     *
     * @param exportSettings The export settings to be extended
     * @param columnInfo The columnInfo object
     * @returns The extended export settings
     */
    _setPropertyInfoExportSettings: function (exportSettings, columnInfo) {
      var _columnInfo$typeConfi3;
      const exportFormat = this._getExportFormat((_columnInfo$typeConfi3 = columnInfo.typeConfig) === null || _columnInfo$typeConfi3 === void 0 ? void 0 : _columnInfo$typeConfi3.className);
      if (exportSettings) {
        if (exportFormat && !exportSettings.timezoneProperty) {
          exportSettings.format = exportFormat;
        }
        // Set the exportSettings template only if it exists.
        if (exportSettings.template) {
          var _columnInfo$exportSet2;
          exportSettings.template = (_columnInfo$exportSet2 = columnInfo.exportSettings) === null || _columnInfo$exportSet2 === void 0 ? void 0 : _columnInfo$exportSet2.template;
        }
      }
      return exportSettings;
    },
    _updateAnalyticalPropertyInfoAttributes(propertyInfo, columnInfo) {
      if (columnInfo.aggregatable) {
        propertyInfo.aggregatable = columnInfo.aggregatable;
      }
      if (columnInfo.extension) {
        propertyInfo.extension = columnInfo.extension;
      }
    },
    _fetchCustomPropertyInfo: function (oColumnInfo, oTable, oAppComponent) {
      const sLabel = DelegateUtil.getLocalizedText(oColumnInfo.header, oAppComponent || oTable); // Todo: To be removed once MDC provides translation support
      const oPropertyInfo = {
        name: oColumnInfo.name,
        groupLabel: undefined,
        group: undefined,
        label: sLabel,
        type: "Edm.String",
        // TBD
        visible: oColumnInfo.availability !== "Hidden",
        exportSettings: oColumnInfo.exportSettings,
        visualSettings: oColumnInfo.visualSettings
      };

      // MDC expects 'propertyInfos' only for complex properties.
      // An empty array throws validation error and undefined value is unhandled.
      if (oColumnInfo.propertyInfos && oColumnInfo.propertyInfos.length) {
        oPropertyInfo.propertyInfos = oColumnInfo.propertyInfos;
        //only in case of complex properties, wrap the cell content on the excel exported file
        oPropertyInfo.exportSettings = {
          wrap: oColumnInfo.exportSettings.wrap,
          template: oColumnInfo.exportSettings.template
        };
      } else {
        // Add properties which are supported only by simple PropertyInfos.
        oPropertyInfo.path = oColumnInfo.name;
        oPropertyInfo.sortable = false;
        oPropertyInfo.filterable = false;
      }
      return oPropertyInfo;
    },
    _bColumnHasPropertyWithDraftIndicator: function (oColumnInfo) {
      return !!(oColumnInfo.formatOptions && oColumnInfo.formatOptions.hasDraftIndicator || oColumnInfo.formatOptions && oColumnInfo.formatOptions.fieldGroupDraftIndicatorPropertyPath);
    },
    _updateDraftIndicatorModel: function (_oTable, _oColumnInfo) {
      const aVisibleColumns = _oTable.getColumns();
      const oInternalBindingContext = _oTable.getBindingContext("internal");
      const sInternalPath = oInternalBindingContext && oInternalBindingContext.getPath();
      if (aVisibleColumns && oInternalBindingContext) {
        for (const index in aVisibleColumns) {
          if (this._bColumnHasPropertyWithDraftIndicator(_oColumnInfo) && _oColumnInfo.name === aVisibleColumns[index].getDataProperty()) {
            if (oInternalBindingContext.getProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR) === undefined) {
              oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, _oColumnInfo.name);
              break;
            }
          }
        }
      }
    },
    _fetchPropertiesForEntity: function (oTable, sEntityTypePath, oMetaModel, oAppComponent) {
      // when fetching properties, this binding context is needed - so lets create it only once and use if for all properties/data-fields/line-items
      const sBindingPath = ModelHelper.getEntitySetPath(sEntityTypePath);
      let aFetchedProperties = [];
      const oFR = CommonUtils.getFilterRestrictionsByPath(sBindingPath, oMetaModel);
      const aNonFilterableProps = oFR.NonFilterableProperties;
      return Promise.resolve(this.getColumnsFor(oTable)).then(aColumns => {
        // DraftAdministrativeData does not work via 'entitySet/$NavigationPropertyBinding/DraftAdministrativeData'
        if (aColumns) {
          let oPropertyInfo;
          aColumns.forEach(oColumnInfo => {
            this._updateDraftIndicatorModel(oTable, oColumnInfo);
            switch (oColumnInfo.type) {
              case "Annotation":
                oPropertyInfo = this._fetchPropertyInfo(oMetaModel, oColumnInfo, oTable, oAppComponent);
                if (oPropertyInfo && aNonFilterableProps.indexOf(oPropertyInfo.name) === -1) {
                  oPropertyInfo.maxConditions = DelegateUtil.isMultiValue(oPropertyInfo) ? -1 : 1;
                }
                break;
              case "Slot":
              case "Default":
                oPropertyInfo = this._fetchCustomPropertyInfo(oColumnInfo, oTable, oAppComponent);
                break;
              default:
                throw new Error(`unhandled switch case ${oColumnInfo.type}`);
            }
            aFetchedProperties.push(oPropertyInfo);
          });
        }
      }).then(() => {
        aFetchedProperties = this._updatePropertyInfo(oTable, aFetchedProperties);
      }).catch(function (err) {
        Log.error(`An error occurs while updating fetched properties: ${err}`);
      }).then(function () {
        return aFetchedProperties;
      });
    },
    _getCachedOrFetchPropertiesForEntity: function (table, entityTypePath, metaModel, appComponent) {
      const fetchedProperties = DelegateUtil.getCachedProperties(table);
      if (fetchedProperties) {
        return Promise.resolve(fetchedProperties);
      }
      return this._fetchPropertiesForEntity(table, entityTypePath, metaModel, appComponent).then(function (subFetchedProperties) {
        DelegateUtil.setCachedProperties(table, subFetchedProperties);
        return subFetchedProperties;
      });
    },
    _setTableNoDataText: function (oTable, oBindingInfo) {
      let sNoDataKey = "";
      const oTableFilterInfo = TableUtils.getAllFilterInfo(oTable),
        suffixResourceKey = oBindingInfo.path.startsWith("/") ? oBindingInfo.path.substr(1) : oBindingInfo.path;
      const _getNoDataTextWithFilters = function () {
        if (oTable.data("hiddenFilters") || oTable.data("quickFilterKey")) {
          return "M_TABLE_AND_CHART_NO_DATA_TEXT_MULTI_VIEW";
        } else {
          return "T_TABLE_AND_CHART_NO_DATA_TEXT_WITH_FILTER";
        }
      };
      const sFilterAssociation = oTable.getFilter();
      if (sFilterAssociation && !/BasicSearch$/.test(sFilterAssociation)) {
        // check if a FilterBar is associated to the Table (basic search on toolBar is excluded)
        if (oTableFilterInfo.search || oTableFilterInfo.filters && oTableFilterInfo.filters.length) {
          // check if table has any Filterbar filters or personalization filters
          sNoDataKey = _getNoDataTextWithFilters();
        } else {
          sNoDataKey = "T_TABLE_AND_CHART_NO_DATA_TEXT";
        }
      } else if (oTableFilterInfo.search || oTableFilterInfo.filters && oTableFilterInfo.filters.length) {
        //check if table has any personalization filters
        sNoDataKey = _getNoDataTextWithFilters();
      } else {
        sNoDataKey = "M_TABLE_AND_CHART_NO_FILTERS_NO_DATA_TEXT";
      }
      return oTable.getModel("sap.fe.i18n").getResourceBundle().then(function (oResourceBundle) {
        oTable.setNoData(CommonUtils.getTranslatedText(sNoDataKey, oResourceBundle, undefined, suffixResourceKey));
      }).catch(function (error) {
        Log.error(error);
      });
    },
    handleTableDataReceived: function (oTable, oInternalModelContext) {
      const oBinding = oTable && oTable.getRowBinding(),
        bDataReceivedAttached = oInternalModelContext && oInternalModelContext.getProperty("dataReceivedAttached");
      if (oInternalModelContext && !bDataReceivedAttached) {
        oBinding.attachDataReceived(function () {
          // Refresh the selected contexts to trigger re-calculation of enabled state of actions.
          oInternalModelContext.setProperty("selectedContexts", []);
          const aSelectedContexts = oTable.getSelectedContexts();
          oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
          oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
          const oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap")));
          ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
          // Refresh enablement of delete button
          DeleteHelper.updateDeleteInfoForSelectedContexts(oInternalModelContext, aSelectedContexts);
          const oTableAPI = oTable ? oTable.getParent() : null;
          if (oTableAPI) {
            oTableAPI.setUpEmptyRows(oTable);
          }
        });
        oInternalModelContext.setProperty("dataReceivedAttached", true);
      }
    },
    rebind: function (oTable, oBindingInfo) {
      const oTableAPI = oTable.getParent();
      const bIsSuspended = oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.getProperty("bindingSuspended");
      oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.setProperty("outDatedBinding", bIsSuspended);
      if (!bIsSuspended) {
        TableUtils.clearSelection(oTable);
        TableDelegateBase.rebind.apply(this, [oTable, oBindingInfo]);
        TableUtils.onTableBound(oTable);
        this._setTableNoDataText(oTable, oBindingInfo);
        return TableUtils.whenBound(oTable).then(this.handleTableDataReceived(oTable, oTable.getBindingContext("internal"))).catch(function (oError) {
          Log.error("Error while waiting for the table to be bound", oError);
        });
      }
      return Promise.resolve();
    },
    /**
     * Fetches the relevant metadata for the table and returns property info array.
     *
     * @param table Instance of the MDCtable
     * @returns Array of property info
     */
    fetchProperties: function (table) {
      return DelegateUtil.fetchModel(table).then(model => {
        return this._getCachedOrFetchPropertiesForEntity(table, DelegateUtil.getCustomData(table, "entityType"), model.getMetaModel());
      }).then(properties => {
        table.getBindingContext("internal").setProperty("tablePropertiesAvailable", true);
        return properties;
      });
    },
    preInit: function (oTable) {
      return TableDelegateBase.preInit.apply(this, [oTable]).then(function () {
        /**
         * Set the binding context to null for every fast creation row to avoid it inheriting
         * the wrong context and requesting the table columns on the parent entity
         * Set the correct binding context in ObjectPageController.enableFastCreationRow()
         */
        const oFastCreationRow = oTable.getCreationRow();
        if (oFastCreationRow) {
          oFastCreationRow.setBindingContext(null);
        }
      });
    },
    updateBindingInfo: function (oTable, oBindingInfo) {
      TableDelegateBase.updateBindingInfo.apply(this, [oTable, oBindingInfo]);
      this._internalUpdateBindingInfo(oTable, oBindingInfo);
      oBindingInfo.events.dataReceived = oTable.getParent().onInternalDataReceived.bind(oTable.getParent());
      oBindingInfo.events.dataRequested = oTable.getParent().onInternalDataRequested.bind(oTable.getParent());
      this._setTableNoDataText(oTable, oBindingInfo);
    },
    _manageSemanticTargets: function (oMDCTable) {
      const oRowBinding = oMDCTable.getRowBinding();
      if (oRowBinding) {
        oRowBinding.attachEventOnce("dataRequested", function () {
          setTimeout(function () {
            const _oView = CommonUtils.getTargetView(oMDCTable);
            if (_oView) {
              TableUtils.getSemanticTargetsFromTable(_oView.getController(), oMDCTable);
            }
          }, 0);
        });
      }
    },
    updateBinding: function (oTable, oBindingInfo, oBinding) {
      const oTableAPI = oTable.getParent();
      const bIsSuspended = oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.getProperty("bindingSuspended");
      if (!bIsSuspended) {
        let bNeedManualRefresh = false;
        const _oView = CommonUtils.getTargetView(oTable);
        const oInternalBindingContext = oTable.getBindingContext("internal");
        const sManualUpdatePropertyKey = "pendingManualBindingUpdate";
        const bPendingManualUpdate = oInternalBindingContext.getProperty(sManualUpdatePropertyKey);
        const oRowBinding = oTable.getRowBinding();
        if (oRowBinding) {
          /**
           * Manual refresh if filters are not changed by binding.refresh() since updating the bindingInfo
           * is not enough to trigger a batch request.
           * Removing columns creates one batch request that was not executed before
           */
          const oldFilters = oRowBinding.getFilters("Application");
          bNeedManualRefresh = deepEqual(oBindingInfo.filters, oldFilters[0]) && oRowBinding.getQueryOptionsFromParameters().$search === oBindingInfo.parameters.$search && !bPendingManualUpdate && _oView && _oView.getViewData().converterType === "ListReport";
        }
        TableDelegateBase.updateBinding.apply(this, [oTable, oBindingInfo, oBinding]);
        oTable.fireEvent("bindingUpdated");
        if (bNeedManualRefresh && oTable.getFilter() && oBinding) {
          oRowBinding.requestRefresh(oRowBinding.getGroupId()).finally(function () {
            oInternalBindingContext.setProperty(sManualUpdatePropertyKey, false);
          }).catch(function (oError) {
            Log.error("Error while refreshing the table", oError);
          });
          oInternalBindingContext.setProperty(sManualUpdatePropertyKey, true);
        }
        this._manageSemanticTargets(oTable);
      }
      oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.setProperty("outDatedBinding", bIsSuspended);
    },
    _computeRowBindingInfoFromTemplate: function (oTable) {
      // We need to deepClone the info we get from the custom data, otherwise some of its subobjects (e.g. parameters) will
      // be shared with oBindingInfo and modified later (Object.assign only does a shallow clone)
      const rowBindingInfo = deepClone(DelegateUtil.getCustomData(oTable, "rowsBindingInfo"));
      // if the rowBindingInfo has a $$getKeepAliveContext parameter we need to check it is the only Table with such a
      // parameter for the collectionMetaPath
      if (rowBindingInfo.parameters.$$getKeepAliveContext) {
        const collectionPath = DelegateUtil.getCustomData(oTable, "targetCollectionPath");
        const internalModel = oTable.getModel("internal");
        const keptAliveLists = internalModel.getObject("/keptAliveLists") || {};
        if (!keptAliveLists[collectionPath]) {
          keptAliveLists[collectionPath] = oTable.getId();
          internalModel.setProperty("/keptAliveLists", keptAliveLists);
        } else if (keptAliveLists[collectionPath] !== oTable.getId()) {
          delete rowBindingInfo.parameters.$$getKeepAliveContext;
        }
      }
      return rowBindingInfo;
    },
    _internalUpdateBindingInfo: function (oTable, oBindingInfo) {
      const oInternalModelContext = oTable.getBindingContext("internal");
      Object.assign(oBindingInfo, this._computeRowBindingInfoFromTemplate(oTable));
      /**
       * Binding info might be suspended at the beginning when the first bindRows is called:
       * To avoid duplicate requests but still have a binding to create new entries.				 *
       * After the initial binding step, follow up bindings should not longer be suspended.
       */
      if (oTable.getRowBinding()) {
        oBindingInfo.suspended = false;
      }
      // The previously added handler for the event 'dataReceived' is not anymore there
      // since the bindingInfo is recreated from scratch so we need to set the flag to false in order
      // to again add the handler on this event if needed
      if (oInternalModelContext) {
        oInternalModelContext.setProperty("dataReceivedAttached", false);
      }
      let oFilter;
      const oFilterInfo = TableUtils.getAllFilterInfo(oTable);
      // Prepare binding info with filter/search parameters
      if (oFilterInfo.filters.length > 0) {
        oFilter = new Filter({
          filters: oFilterInfo.filters,
          and: true
        });
      }
      if (oFilterInfo.bindingPath) {
        oBindingInfo.path = oFilterInfo.bindingPath;
      }
      const oDataStateIndicator = oTable.getDataStateIndicator();
      if (oDataStateIndicator && oDataStateIndicator.isFiltering()) {
        // Include filters on messageStrip
        if (oBindingInfo.filters.length > 0) {
          oFilter = new Filter({
            filters: oBindingInfo.filters.concat(oFilterInfo.filters),
            and: true
          });
          TableUtils.updateBindingInfo(oBindingInfo, oFilterInfo, oFilter);
        }
      } else {
        TableUtils.updateBindingInfo(oBindingInfo, oFilterInfo, oFilter);
      }
    },
    _templateCustomColumnFragment: function (oColumnInfo, oView, oModifier, sTableId) {
      const oColumnModel = new JSONModel(oColumnInfo),
        oThis = new JSONModel({
          id: sTableId
        }),
        oPreprocessorSettings = {
          bindingContexts: {
            this: oThis.createBindingContext("/"),
            column: oColumnModel.createBindingContext("/")
          },
          models: {
            this: oThis,
            column: oColumnModel
          }
        };
      return DelegateUtil.templateControlFragment("sap.fe.macros.table.CustomColumn", oPreprocessorSettings, {
        view: oView
      }, oModifier).then(function (oItem) {
        oColumnModel.destroy();
        return oItem;
      });
    },
    _templateSlotColumnFragment: async function (oColumnInfo, oView, oModifier, sTableId) {
      const oColumnModel = new JSONModel(oColumnInfo),
        oThis = new JSONModel({
          id: sTableId
        }),
        oPreprocessorSettings = {
          bindingContexts: {
            this: oThis.createBindingContext("/"),
            column: oColumnModel.createBindingContext("/")
          },
          models: {
            this: oThis,
            column: oColumnModel
          }
        };
      const slotColumnsXML = await DelegateUtil.templateControlFragment("sap.fe.macros.table.SlotColumn", oPreprocessorSettings, {
        isXML: true
      });
      if (!slotColumnsXML) {
        return Promise.resolve(null);
      }
      const slotXML = slotColumnsXML.getElementsByTagName("slot")[0],
        mdcTableTemplateXML = slotColumnsXML.getElementsByTagName("mdcTable:template")[0];
      mdcTableTemplateXML.removeChild(slotXML);
      if (oColumnInfo.template) {
        const oTemplate = new DOMParser().parseFromString(oColumnInfo.template, "text/xml");
        mdcTableTemplateXML.appendChild(oTemplate.firstElementChild);
      } else {
        Log.error(`Please provide content inside this Building Block Column: ${oColumnInfo.header}`);
        return Promise.resolve(null);
      }
      if (oModifier.targets !== "jsControlTree") {
        return slotColumnsXML;
      }
      return Fragment.load({
        type: "XML",
        definition: slotColumnsXML
      });
    },
    _getExportFormat: function (dataType) {
      switch (dataType) {
        case "Edm.Date":
          return ExcelFormat.getExcelDatefromJSDate();
        case "Edm.DateTimeOffset":
          return ExcelFormat.getExcelDateTimefromJSDateTime();
        case "Edm.TimeOfDay":
          return ExcelFormat.getExcelTimefromJSTime();
        default:
          return undefined;
      }
    },
    _getVHRelevantFields: function (oMetaModel, sMetadataPath, sBindingPath) {
      let aFields = [],
        oDataFieldData = oMetaModel.getObject(sMetadataPath);
      if (oDataFieldData.$kind && oDataFieldData.$kind === "Property") {
        oDataFieldData = oMetaModel.getObject(`${sMetadataPath}@com.sap.vocabularies.UI.v1.DataFieldDefault`);
        sMetadataPath = `${sMetadataPath}@com.sap.vocabularies.UI.v1.DataFieldDefault`;
      }
      switch (oDataFieldData.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          if (oMetaModel.getObject(`${sMetadataPath}/Target/$AnnotationPath`).includes("com.sap.vocabularies.UI.v1.FieldGroup")) {
            oMetaModel.getObject(`${sMetadataPath}/Target/$AnnotationPath/Data`).forEach((oValue, iIndex) => {
              aFields = aFields.concat(this._getVHRelevantFields(oMetaModel, `${sMetadataPath}/Target/$AnnotationPath/Data/${iIndex}`));
            });
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          aFields.push(oMetaModel.getObject(`${sMetadataPath}/Value/$Path`));
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          break;
        default:
          // property
          // temporary workaround to make sure VH relevant field path do not contain the bindingpath
          if (sMetadataPath.indexOf(sBindingPath) === 0) {
            aFields.push(sMetadataPath.substring(sBindingPath.length + 1));
            break;
          }
          aFields.push(CommonHelper.getNavigationPath(sMetadataPath, true));
          break;
      }
      return aFields;
    },
    _setDraftIndicatorOnVisibleColumn: function (oTable, aColumns, oColumnInfo) {
      const oInternalBindingContext = oTable.getBindingContext("internal");
      if (!oInternalBindingContext) {
        return;
      }
      const sInternalPath = oInternalBindingContext.getPath();
      const aColumnsWithDraftIndicator = aColumns.filter(oColumn => {
        return this._bColumnHasPropertyWithDraftIndicator(oColumn);
      });
      const aVisibleColumns = oTable.getColumns();
      let sAddVisibleColumnName, sVisibleColumnName, bFoundColumnVisibleWithDraft, sColumnNameWithDraftIndicator;
      for (const i in aVisibleColumns) {
        sVisibleColumnName = aVisibleColumns[i].getDataProperty();
        for (const j in aColumnsWithDraftIndicator) {
          sColumnNameWithDraftIndicator = aColumnsWithDraftIndicator[j].name;
          if (sVisibleColumnName === sColumnNameWithDraftIndicator) {
            bFoundColumnVisibleWithDraft = true;
            break;
          }
          if (oColumnInfo && oColumnInfo.name === sColumnNameWithDraftIndicator) {
            sAddVisibleColumnName = oColumnInfo.name;
          }
        }
        if (bFoundColumnVisibleWithDraft) {
          oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, sVisibleColumnName);
          break;
        }
      }
      if (!bFoundColumnVisibleWithDraft && sAddVisibleColumnName) {
        oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, sAddVisibleColumnName);
      }
    },
    removeItem: function (oPropertyInfoName, oTable, mPropertyBag) {
      let doRemoveItem = true;
      if (!oPropertyInfoName) {
        // 1. Application removed the property from their data model
        // 2. addItem failed before revertData created
        return Promise.resolve(doRemoveItem);
      }
      const oModifier = mPropertyBag.modifier;
      const sDataProperty = oModifier.getProperty(oPropertyInfoName, "dataProperty");
      if (sDataProperty && sDataProperty.indexOf && sDataProperty.indexOf("InlineXML") !== -1) {
        oModifier.insertAggregation(oTable, "dependents", oPropertyInfoName);
        doRemoveItem = false;
      }
      if (oTable.isA && oModifier.targets === "jsControlTree") {
        this._setDraftIndicatorStatus(oModifier, oTable, this.getColumnsFor(oTable));
      }
      return Promise.resolve(doRemoveItem);
    },
    _getMetaModel: function (mPropertyBag) {
      return mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel();
    },
    _setDraftIndicatorStatus: function (oModifier, oTable, aColumns, oColumnInfo) {
      if (oModifier.targets === "jsControlTree") {
        this._setDraftIndicatorOnVisibleColumn(oTable, aColumns, oColumnInfo);
      }
    },
    _getGroupId: function (sRetrievedGroupId) {
      return sRetrievedGroupId || undefined;
    },
    _getDependent: function (oDependent, sPropertyInfoName, sDataProperty) {
      if (sPropertyInfoName === sDataProperty) {
        return oDependent;
      }
      return undefined;
    },
    _fnTemplateValueHelp: function (fnTemplateValueHelp, bValueHelpRequired, bValueHelpExists) {
      if (bValueHelpRequired && !bValueHelpExists) {
        return fnTemplateValueHelp("sap.fe.macros.table.ValueHelp");
      }
      return Promise.resolve();
    },
    _getDisplayMode: function (bDisplayMode) {
      let columnEditMode;
      if (bDisplayMode !== undefined) {
        bDisplayMode = typeof bDisplayMode === "boolean" ? bDisplayMode : bDisplayMode === "true";
        columnEditMode = bDisplayMode ? "Display" : "Editable";
        return {
          displaymode: bDisplayMode,
          columnEditMode: columnEditMode
        };
      }
      return {
        displaymode: undefined,
        columnEditMode: undefined
      };
    },
    _insertAggregation: function (oValueHelp, oModifier, oTable) {
      if (oValueHelp) {
        return oModifier.insertAggregation(oTable, "dependents", oValueHelp, 0);
      }
      return undefined;
    },
    /**
     * Invoked when a column is added using the table personalization dialog.
     *
     * @param sPropertyInfoName Name of the property for which the column is added
     * @param oTable Instance of table control
     * @param mPropertyBag Instance of property bag from the flexibility API
     * @returns Once resolved, a table column definition is returned
     */
    addItem: async function (sPropertyInfoName, oTable, mPropertyBag) {
      const oMetaModel = this._getMetaModel(mPropertyBag),
        oModifier = mPropertyBag.modifier,
        sTableId = oModifier.getId(oTable),
        aColumns = oTable.isA ? this.getColumnsFor(oTable) : null;
      if (!aColumns) {
        return Promise.resolve(null);
      }
      const oColumnInfo = aColumns.find(function (oColumn) {
        return oColumn.name === sPropertyInfoName;
      });
      if (!oColumnInfo) {
        Log.error(`${sPropertyInfoName} not found while adding column`);
        return Promise.resolve(null);
      }
      this._setDraftIndicatorStatus(oModifier, oTable, aColumns, oColumnInfo);
      // render custom column
      if (oColumnInfo.type === "Default") {
        return this._templateCustomColumnFragment(oColumnInfo, mPropertyBag.view, oModifier, sTableId);
      }
      if (oColumnInfo.type === "Slot") {
        return this._templateSlotColumnFragment(oColumnInfo, mPropertyBag.view, oModifier, sTableId);
      }
      // fall-back
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      const sPath = await DelegateUtil.getCustomData(oTable, "metaPath", oModifier);
      const sEntityTypePath = await DelegateUtil.getCustomData(oTable, "entityType", oModifier);
      const sRetrievedGroupId = await DelegateUtil.getCustomData(oTable, "requestGroupId", oModifier);
      const sGroupId = this._getGroupId(sRetrievedGroupId);
      const oTableContext = oMetaModel.createBindingContext(sPath);
      const aFetchedProperties = await this._getCachedOrFetchPropertiesForEntity(oTable, sEntityTypePath, oMetaModel, mPropertyBag.appComponent);
      const oPropertyInfo = aFetchedProperties.find(function (oInfo) {
        return oInfo.name === sPropertyInfoName;
      });
      const oPropertyContext = oMetaModel.createBindingContext(oPropertyInfo.metadataPath);
      const aVHProperties = this._getVHRelevantFields(oMetaModel, oPropertyInfo.metadataPath, sPath);
      const oParameters = {
        sBindingPath: sPath,
        sValueHelpType: "TableValueHelp",
        oControl: oTable,
        oMetaModel,
        oModifier,
        oPropertyInfo
      };
      const fnTemplateValueHelp = async sFragmentName => {
        const oThis = new JSONModel({
            id: sTableId,
            requestGroupId: sGroupId
          }),
          oPreprocessorSettings = {
            bindingContexts: {
              this: oThis.createBindingContext("/"),
              dataField: oPropertyContext,
              contextPath: oTableContext
            },
            models: {
              this: oThis,
              dataField: oMetaModel,
              metaModel: oMetaModel,
              contextPath: oMetaModel
            }
          };
        try {
          const oValueHelp = await DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {}, oModifier);
          return await this._insertAggregation(oValueHelp, oModifier, oTable);
        } catch (oError) {
          //We always resolve the promise to ensure that the app does not crash
          Log.error(`ValueHelp not loaded : ${oError.message}`);
          return null;
        } finally {
          oThis.destroy();
        }
      };
      const fnTemplateFragment = (oInPropertyInfo, oView) => {
        const sFragmentName = "sap.fe.macros.table.Column";
        let bDisplayMode;
        let sTableTypeCustomData;
        let sOnChangeCustomData;
        let sCreationModeCustomData;
        return Promise.all([DelegateUtil.getCustomData(oTable, "displayModePropertyBinding", oModifier), DelegateUtil.getCustomData(oTable, "tableType", oModifier), DelegateUtil.getCustomData(oTable, "onChange", oModifier), DelegateUtil.getCustomData(oTable, "creationMode", oModifier)]).then(aCustomData => {
          bDisplayMode = aCustomData[0];
          sTableTypeCustomData = aCustomData[1];
          sOnChangeCustomData = aCustomData[2];
          sCreationModeCustomData = aCustomData[3];
          // Read Only and Column Edit Mode can both have three state
          // Undefined means that the framework decides what to do
          // True / Display means always read only
          // False / Editable means editable but while still respecting the low level principle (immutable property will not be editable)
          const oDisplayModes = this._getDisplayMode(bDisplayMode);
          bDisplayMode = oDisplayModes.displaymode;
          const columnEditMode = oDisplayModes.columnEditMode;
          const oThis = new JSONModel({
              enableAutoColumnWidth: oTable.getParent().enableAutoColumnWidth,
              isOptimizedForSmallDevice: oTable.getParent().isOptimizedForSmallDevice,
              readOnly: bDisplayMode,
              columnEditMode: columnEditMode,
              tableType: sTableTypeCustomData,
              onChange: sOnChangeCustomData,
              id: sTableId,
              navigationPropertyPath: sPropertyInfoName,
              columnInfo: oColumnInfo,
              collection: {
                sPath: sPath,
                oModel: oMetaModel
              },
              creationMode: sCreationModeCustomData
            }),
            oPreprocessorSettings = {
              bindingContexts: {
                entitySet: oTableContext,
                collection: oTableContext,
                dataField: oPropertyContext,
                this: oThis.createBindingContext("/"),
                column: oThis.createBindingContext("/columnInfo")
              },
              models: {
                this: oThis,
                entitySet: oMetaModel,
                collection: oMetaModel,
                dataField: oMetaModel,
                metaModel: oMetaModel,
                column: oThis
              }
            };
          return DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {
            view: oView
          }, oModifier).finally(function () {
            oThis.destroy();
          });
        });
      };
      await Promise.all(aVHProperties.map(async sPropertyName => {
        const mParameters = Object.assign({}, oParameters, {
          sPropertyName: sPropertyName
        });
        const aResults = await Promise.all([DelegateUtil.isValueHelpRequired(mParameters), DelegateUtil.doesValueHelpExist(mParameters)]);
        const bValueHelpRequired = aResults[0],
          bValueHelpExists = aResults[1];
        return this._fnTemplateValueHelp(fnTemplateValueHelp, bValueHelpRequired, bValueHelpExists);
      }));
      // If view is not provided try to get it by accessing to the parental hierarchy
      // If it doesn't work (table into an unattached OP section) get the view via the AppComponent
      const view = mPropertyBag.view || CommonUtils.getTargetView(oTable) || (mPropertyBag.appComponent ? CommonUtils.getCurrentPageView(mPropertyBag.appComponent) : undefined);
      return fnTemplateFragment(oPropertyInfo, view);
    },
    /**
     * Provide the Table's filter delegate to provide basic filter functionality such as adding FilterFields.
     *
     * @returns Object for the Tables filter personalization.
     */
    getFilterDelegate: function () {
      return Object.assign({}, FilterBarDelegate, {
        addItem: function (sPropertyInfoName, oParentControl) {
          if (sPropertyInfoName.indexOf("Property::") === 0) {
            // Correct the name of complex property info references.
            sPropertyInfoName = sPropertyInfoName.replace("Property::", "");
          }
          return FilterBarDelegate.addItem(sPropertyInfoName, oParentControl);
        }
      });
    },
    /**
     * Returns the TypeUtil attached to this delegate.
     *
     * @returns Any instance of TypeUtil
     */
    getTypeUtil: function /*oPayload: object*/
    () {
      return TypeUtil;
    },
    formatGroupHeader(oTable, oContext, sProperty) {
      var _oFormatInfo$typeConf, _oFormatInfo$typeConf2;
      const mFormatInfos = DelegateUtil.getCachedProperties(oTable),
        oFormatInfo = mFormatInfos && mFormatInfos.filter(obj => {
          return obj.name === sProperty;
        })[0],
        /*For a Date or DateTime property, the value is returned in external format using a UI5 type for the
              given property path that formats corresponding to the property's EDM type and constraints*/
        bExternalFormat = (oFormatInfo === null || oFormatInfo === void 0 ? void 0 : (_oFormatInfo$typeConf = oFormatInfo.typeConfig) === null || _oFormatInfo$typeConf === void 0 ? void 0 : _oFormatInfo$typeConf.baseType) === "DateTime" || (oFormatInfo === null || oFormatInfo === void 0 ? void 0 : (_oFormatInfo$typeConf2 = oFormatInfo.typeConfig) === null || _oFormatInfo$typeConf2 === void 0 ? void 0 : _oFormatInfo$typeConf2.baseType) === "Date";
      let sValue;
      if (oFormatInfo && oFormatInfo.mode) {
        switch (oFormatInfo.mode) {
          case "Description":
            sValue = oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat);
            break;
          case "DescriptionValue":
            sValue = ValueFormatter.formatWithBrackets(oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat), oContext.getProperty(oFormatInfo.valueProperty, bExternalFormat));
            break;
          case "ValueDescription":
            sValue = ValueFormatter.formatWithBrackets(oContext.getProperty(oFormatInfo.valueProperty, bExternalFormat), oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat));
            break;
          default:
            break;
        }
      } else {
        sValue = oContext.getProperty(oFormatInfo === null || oFormatInfo === void 0 ? void 0 : oFormatInfo.path, bExternalFormat);
      }
      return ResourceModel.getText("M_TABLE_GROUP_HEADER_TITLE", [oFormatInfo === null || oFormatInfo === void 0 ? void 0 : oFormatInfo.label, sValue]);
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IiLCJPYmplY3QiLCJhc3NpZ24iLCJUYWJsZURlbGVnYXRlQmFzZSIsIl9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JGaWVsZEdyb3VwIiwib1RhYmxlIiwib1Byb3BlcnR5IiwiYVByb3BlcnRpZXMiLCJuYW1lIiwiaW5kZXhPZiIsIm9Db2x1bW4iLCJnZXRDb2x1bW5zIiwiZmluZCIsIm9Db2wiLCJnZXREYXRhUHJvcGVydHkiLCJiU2hvd0RhdGFGaWVsZHNMYWJlbCIsImRhdGEiLCJvTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJpbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJnZXRDb250ZXh0IiwibWV0YWRhdGFQYXRoIiwiY29udmVydGVkTWV0YURhdGEiLCJjb252ZXJ0ZWRUeXBlcyIsIm9EYXRhRmllbGQiLCJ0YXJnZXRPYmplY3QiLCJvRmllbGRHcm91cCIsIlRhcmdldCIsIiR0YXJnZXQiLCJhRmllbGRXaWR0aCIsIkRhdGEiLCJmb3JFYWNoIiwib0RhdGEiLCJvRGF0YUZpZWxkV2lkdGgiLCIkVHlwZSIsIlRhYmxlU2l6ZUhlbHBlciIsImdldFdpZHRoRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiIsImdldFdpZHRoRm9yRGF0YUZpZWxkIiwibGFiZWxXaWR0aCIsInByb3BlcnR5V2lkdGgiLCJnZXRCdXR0b25XaWR0aCIsIkxhYmVsIiwicHVzaCIsIm5XaWRlc3QiLCJyZWR1Y2UiLCJhY2MiLCJ2YWx1ZSIsIk1hdGgiLCJtYXgiLCJ2aXN1YWxTZXR0aW5ncyIsImRlZXBFeHRlbmQiLCJ3aWR0aENhbGN1bGF0aW9uIiwidmVydGljYWxBcnJhbmdlbWVudCIsIm1pbldpZHRoIiwiY2VpbCIsIl9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JQcm9wZXJ0eVdpdGhWYWx1ZUhlbHAiLCJ0YWJsZSIsInByb3BlcnR5IiwidGFibGVBUEkiLCJnZXRQYXJlbnQiLCJwcm9wZXJ0eUluZm9zIiwibWV0YU1vZGVsIiwiZGF0YUZpZWxkIiwiZ2V0T2JqZWN0IiwiZ2FwIiwiZ2V0UHJvcGVydHkiLCJfY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yUHJvcGVydHlXaXRoVW5pdCIsIm9Vbml0Iiwib1VuaXRUZXh0Iiwib1RpbWV6b25lVGV4dCIsIm9UYWJsZUFQSSIsInNVbml0VGV4dCIsImdldFJlYWRPbmx5IiwiX2NvbXB1dGVMYWJlbCIsImxhYmVsTWFwIiwibGFiZWwiLCJwcm9wZXJ0aWVzV2l0aFNhbWVMYWJlbCIsImxlbmd0aCIsInBhdGgiLCJpbmNsdWRlcyIsImFkZGl0aW9uYWxMYWJlbHMiLCJqb2luIiwiX3VwZGF0ZVByb3BlcnR5SW5mbyIsInByb3BlcnRpZXMiLCJwMTNuTW9kZSIsImdldFAxM25Nb2RlIiwic29ydGFibGUiLCJmaWx0ZXJhYmxlIiwiZ3JvdXBhYmxlIiwidW5kZWZpbmVkIiwiY29uY2F0IiwidHlwZUNvbmZpZyIsImdldENvbHVtbnNGb3IiLCJnZXRUYWJsZURlZmluaXRpb24iLCJjb2x1bW5zIiwiX2dldEFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcCIsImFnZ3JlZ2F0ZXMiLCJmZXRjaEV4cG9ydENhcGFiaWxpdGllcyIsIm9DYXBhYmlsaXRpZXMiLCJYTFNYIiwib01vZGVsIiwiRGVsZWdhdGVVdGlsIiwiZmV0Y2hNb2RlbCIsInRoZW4iLCJtb2RlbCIsImFTdXBwb3J0ZWRGb3JtYXRzIiwiYUxvd2VyRm9ybWF0cyIsIm1hcCIsImVsZW1lbnQiLCJ0b0xvd2VyQ2FzZSIsIm9Bbm5vdGF0aW9uIiwiY2F0Y2giLCJlcnIiLCJMb2ciLCJlcnJvciIsIl9pc0ZpbHRlcmFibGVOYXZpZ2F0aW9uUHJvcGVydHkiLCJjb2x1bW5JbmZvIiwidGFibGVEYXRhTW9kZWxPYmplY3RQYXRoIiwiZ2V0Q3VzdG9tRGF0YSIsImNvbHVtbk5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwiYW5ub3RhdGlvblBhdGgiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsInRhYmxlVGFyZ2V0RW50aXR5SW5kZXgiLCJmaW5kSW5kZXgiLCJwcm9wIiwidGFyZ2V0VHlwZSIsInRhcmdldEVudGl0eVR5cGUiLCJyZWxhdGl2ZU5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwic2xpY2UiLCJyZWxhdGl2ZVBhdGgiLCJpc1BhcnRPZkxpbmVJdGVtIiwic29tZSIsIm5hdmlnYXRpb25Qcm9wZXJ0eSIsIl90eXBlIiwiaXNDb2xsZWN0aW9uIiwiX2ZldGNoUHJvcGVydHlJbmZvIiwiYXBwQ29tcG9uZW50Iiwic0Fic29sdXRlTmF2aWdhdGlvblBhdGgiLCJvTmF2aWdhdGlvbkNvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsIm9UeXBlQ29uZmlnIiwiY2xhc3NOYW1lIiwiaXNUeXBlRmlsdGVyYWJsZSIsIlR5cGVVdGlsIiwiZ2V0VHlwZUNvbmZpZyIsImZvcm1hdE9wdGlvbnMiLCJjb25zdHJhaW50cyIsImJGaWx0ZXJhYmxlIiwiQ29tbW9uSGVscGVyIiwiaXNQcm9wZXJ0eUZpbHRlcmFibGUiLCJpc0NvbXBsZXhUeXBlIiwiYklzQW5hbHl0aWNhbFRhYmxlIiwiYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcFVuZmlsdGVyYWJsZSIsImdldExvY2FsaXplZFRleHQiLCJwcm9wZXJ0eUluZm8iLCJncm91cExhYmVsIiwiZ3JvdXAiLCJ0b29sdGlwIiwidmlzaWJsZSIsImF2YWlsYWJpbGl0eSIsImV4cG9ydFNldHRpbmdzIiwiX3NldFByb3BlcnR5SW5mb0V4cG9ydFNldHRpbmdzIiwidW5pdCIsImtleXMiLCJleHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSIsIndyYXAiLCJfdXBkYXRlQW5hbHl0aWNhbFByb3BlcnR5SW5mb0F0dHJpYnV0ZXMiLCJleHRlbnNpb24iLCJ0ZWNobmljYWxseUdyb3VwYWJsZSIsImtleSIsImlzS2V5IiwiaXNHcm91cGFibGUiLCJ0ZXh0QXJyYW5nZW1lbnQiLCJkZXNjcmlwdGlvbkNvbHVtbiIsInRleHRQcm9wZXJ0eSIsIm1vZGUiLCJ2YWx1ZVByb3BlcnR5IiwiZGVzY3JpcHRpb25Qcm9wZXJ0eSIsInRleHQiLCJjYXNlU2Vuc2l0aXZlIiwiYWRkaXRpb25hbExhYmVsIiwidW5pdFRleHQiLCJ0aW1lem9uZVRleHQiLCJleHBvcnRGb3JtYXQiLCJfZ2V0RXhwb3J0Rm9ybWF0IiwidGltZXpvbmVQcm9wZXJ0eSIsImZvcm1hdCIsInRlbXBsYXRlIiwiYWdncmVnYXRhYmxlIiwiX2ZldGNoQ3VzdG9tUHJvcGVydHlJbmZvIiwib0NvbHVtbkluZm8iLCJvQXBwQ29tcG9uZW50Iiwic0xhYmVsIiwiaGVhZGVyIiwib1Byb3BlcnR5SW5mbyIsInR5cGUiLCJfYkNvbHVtbkhhc1Byb3BlcnR5V2l0aERyYWZ0SW5kaWNhdG9yIiwiaGFzRHJhZnRJbmRpY2F0b3IiLCJmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGgiLCJfdXBkYXRlRHJhZnRJbmRpY2F0b3JNb2RlbCIsIl9vVGFibGUiLCJfb0NvbHVtbkluZm8iLCJhVmlzaWJsZUNvbHVtbnMiLCJvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwic0ludGVybmFsUGF0aCIsImdldFBhdGgiLCJpbmRleCIsInNldFByb3BlcnR5IiwiX2ZldGNoUHJvcGVydGllc0ZvckVudGl0eSIsInNFbnRpdHlUeXBlUGF0aCIsInNCaW5kaW5nUGF0aCIsIk1vZGVsSGVscGVyIiwiZ2V0RW50aXR5U2V0UGF0aCIsImFGZXRjaGVkUHJvcGVydGllcyIsIm9GUiIsIkNvbW1vblV0aWxzIiwiZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoIiwiYU5vbkZpbHRlcmFibGVQcm9wcyIsIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJhQ29sdW1ucyIsIm1heENvbmRpdGlvbnMiLCJpc011bHRpVmFsdWUiLCJFcnJvciIsIl9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eSIsImVudGl0eVR5cGVQYXRoIiwiZmV0Y2hlZFByb3BlcnRpZXMiLCJnZXRDYWNoZWRQcm9wZXJ0aWVzIiwic3ViRmV0Y2hlZFByb3BlcnRpZXMiLCJzZXRDYWNoZWRQcm9wZXJ0aWVzIiwiX3NldFRhYmxlTm9EYXRhVGV4dCIsIm9CaW5kaW5nSW5mbyIsInNOb0RhdGFLZXkiLCJvVGFibGVGaWx0ZXJJbmZvIiwiVGFibGVVdGlscyIsImdldEFsbEZpbHRlckluZm8iLCJzdWZmaXhSZXNvdXJjZUtleSIsInN0YXJ0c1dpdGgiLCJzdWJzdHIiLCJfZ2V0Tm9EYXRhVGV4dFdpdGhGaWx0ZXJzIiwic0ZpbHRlckFzc29jaWF0aW9uIiwiZ2V0RmlsdGVyIiwidGVzdCIsInNlYXJjaCIsImZpbHRlcnMiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsIm9SZXNvdXJjZUJ1bmRsZSIsInNldE5vRGF0YSIsImdldFRyYW5zbGF0ZWRUZXh0IiwiaGFuZGxlVGFibGVEYXRhUmVjZWl2ZWQiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJvQmluZGluZyIsImdldFJvd0JpbmRpbmciLCJiRGF0YVJlY2VpdmVkQXR0YWNoZWQiLCJhdHRhY2hEYXRhUmVjZWl2ZWQiLCJhU2VsZWN0ZWRDb250ZXh0cyIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiSlNPTiIsInBhcnNlIiwicGFyc2VDdXN0b21EYXRhIiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnQiLCJEZWxldGVIZWxwZXIiLCJ1cGRhdGVEZWxldGVJbmZvRm9yU2VsZWN0ZWRDb250ZXh0cyIsInNldFVwRW1wdHlSb3dzIiwicmViaW5kIiwiYklzU3VzcGVuZGVkIiwiY2xlYXJTZWxlY3Rpb24iLCJhcHBseSIsIm9uVGFibGVCb3VuZCIsIndoZW5Cb3VuZCIsIm9FcnJvciIsImZldGNoUHJvcGVydGllcyIsInByZUluaXQiLCJvRmFzdENyZWF0aW9uUm93IiwiZ2V0Q3JlYXRpb25Sb3ciLCJzZXRCaW5kaW5nQ29udGV4dCIsInVwZGF0ZUJpbmRpbmdJbmZvIiwiX2ludGVybmFsVXBkYXRlQmluZGluZ0luZm8iLCJldmVudHMiLCJkYXRhUmVjZWl2ZWQiLCJvbkludGVybmFsRGF0YVJlY2VpdmVkIiwiYmluZCIsImRhdGFSZXF1ZXN0ZWQiLCJvbkludGVybmFsRGF0YVJlcXVlc3RlZCIsIl9tYW5hZ2VTZW1hbnRpY1RhcmdldHMiLCJvTURDVGFibGUiLCJvUm93QmluZGluZyIsImF0dGFjaEV2ZW50T25jZSIsInNldFRpbWVvdXQiLCJfb1ZpZXciLCJnZXRUYXJnZXRWaWV3IiwiZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlIiwiZ2V0Q29udHJvbGxlciIsInVwZGF0ZUJpbmRpbmciLCJiTmVlZE1hbnVhbFJlZnJlc2giLCJzTWFudWFsVXBkYXRlUHJvcGVydHlLZXkiLCJiUGVuZGluZ01hbnVhbFVwZGF0ZSIsIm9sZEZpbHRlcnMiLCJnZXRGaWx0ZXJzIiwiZGVlcEVxdWFsIiwiZ2V0UXVlcnlPcHRpb25zRnJvbVBhcmFtZXRlcnMiLCIkc2VhcmNoIiwicGFyYW1ldGVycyIsImdldFZpZXdEYXRhIiwiY29udmVydGVyVHlwZSIsImZpcmVFdmVudCIsInJlcXVlc3RSZWZyZXNoIiwiZ2V0R3JvdXBJZCIsImZpbmFsbHkiLCJfY29tcHV0ZVJvd0JpbmRpbmdJbmZvRnJvbVRlbXBsYXRlIiwicm93QmluZGluZ0luZm8iLCJkZWVwQ2xvbmUiLCIkJGdldEtlZXBBbGl2ZUNvbnRleHQiLCJjb2xsZWN0aW9uUGF0aCIsImludGVybmFsTW9kZWwiLCJrZXB0QWxpdmVMaXN0cyIsImdldElkIiwic3VzcGVuZGVkIiwib0ZpbHRlciIsIm9GaWx0ZXJJbmZvIiwiRmlsdGVyIiwiYW5kIiwiYmluZGluZ1BhdGgiLCJvRGF0YVN0YXRlSW5kaWNhdG9yIiwiZ2V0RGF0YVN0YXRlSW5kaWNhdG9yIiwiaXNGaWx0ZXJpbmciLCJfdGVtcGxhdGVDdXN0b21Db2x1bW5GcmFnbWVudCIsIm9WaWV3Iiwib01vZGlmaWVyIiwic1RhYmxlSWQiLCJvQ29sdW1uTW9kZWwiLCJKU09OTW9kZWwiLCJvVGhpcyIsImlkIiwib1ByZXByb2Nlc3NvclNldHRpbmdzIiwiYmluZGluZ0NvbnRleHRzIiwidGhpcyIsImNvbHVtbiIsIm1vZGVscyIsInRlbXBsYXRlQ29udHJvbEZyYWdtZW50IiwidmlldyIsIm9JdGVtIiwiZGVzdHJveSIsIl90ZW1wbGF0ZVNsb3RDb2x1bW5GcmFnbWVudCIsInNsb3RDb2x1bW5zWE1MIiwiaXNYTUwiLCJzbG90WE1MIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJtZGNUYWJsZVRlbXBsYXRlWE1MIiwicmVtb3ZlQ2hpbGQiLCJvVGVtcGxhdGUiLCJET01QYXJzZXIiLCJwYXJzZUZyb21TdHJpbmciLCJhcHBlbmRDaGlsZCIsImZpcnN0RWxlbWVudENoaWxkIiwidGFyZ2V0cyIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJkYXRhVHlwZSIsIkV4Y2VsRm9ybWF0IiwiZ2V0RXhjZWxEYXRlZnJvbUpTRGF0ZSIsImdldEV4Y2VsRGF0ZVRpbWVmcm9tSlNEYXRlVGltZSIsImdldEV4Y2VsVGltZWZyb21KU1RpbWUiLCJfZ2V0VkhSZWxldmFudEZpZWxkcyIsInNNZXRhZGF0YVBhdGgiLCJhRmllbGRzIiwib0RhdGFGaWVsZERhdGEiLCIka2luZCIsIm9WYWx1ZSIsImlJbmRleCIsInN1YnN0cmluZyIsImdldE5hdmlnYXRpb25QYXRoIiwiX3NldERyYWZ0SW5kaWNhdG9yT25WaXNpYmxlQ29sdW1uIiwiYUNvbHVtbnNXaXRoRHJhZnRJbmRpY2F0b3IiLCJmaWx0ZXIiLCJzQWRkVmlzaWJsZUNvbHVtbk5hbWUiLCJzVmlzaWJsZUNvbHVtbk5hbWUiLCJiRm91bmRDb2x1bW5WaXNpYmxlV2l0aERyYWZ0Iiwic0NvbHVtbk5hbWVXaXRoRHJhZnRJbmRpY2F0b3IiLCJpIiwiaiIsInJlbW92ZUl0ZW0iLCJvUHJvcGVydHlJbmZvTmFtZSIsIm1Qcm9wZXJ0eUJhZyIsImRvUmVtb3ZlSXRlbSIsIm1vZGlmaWVyIiwic0RhdGFQcm9wZXJ0eSIsImluc2VydEFnZ3JlZ2F0aW9uIiwiaXNBIiwiX3NldERyYWZ0SW5kaWNhdG9yU3RhdHVzIiwiX2dldE1ldGFNb2RlbCIsIl9nZXRHcm91cElkIiwic1JldHJpZXZlZEdyb3VwSWQiLCJfZ2V0RGVwZW5kZW50Iiwib0RlcGVuZGVudCIsInNQcm9wZXJ0eUluZm9OYW1lIiwiX2ZuVGVtcGxhdGVWYWx1ZUhlbHAiLCJmblRlbXBsYXRlVmFsdWVIZWxwIiwiYlZhbHVlSGVscFJlcXVpcmVkIiwiYlZhbHVlSGVscEV4aXN0cyIsIl9nZXREaXNwbGF5TW9kZSIsImJEaXNwbGF5TW9kZSIsImNvbHVtbkVkaXRNb2RlIiwiZGlzcGxheW1vZGUiLCJfaW5zZXJ0QWdncmVnYXRpb24iLCJvVmFsdWVIZWxwIiwiYWRkSXRlbSIsInNQYXRoIiwic0dyb3VwSWQiLCJvVGFibGVDb250ZXh0Iiwib0luZm8iLCJvUHJvcGVydHlDb250ZXh0IiwiYVZIUHJvcGVydGllcyIsIm9QYXJhbWV0ZXJzIiwic1ZhbHVlSGVscFR5cGUiLCJvQ29udHJvbCIsInNGcmFnbWVudE5hbWUiLCJyZXF1ZXN0R3JvdXBJZCIsImNvbnRleHRQYXRoIiwibWVzc2FnZSIsImZuVGVtcGxhdGVGcmFnbWVudCIsIm9JblByb3BlcnR5SW5mbyIsInNUYWJsZVR5cGVDdXN0b21EYXRhIiwic09uQ2hhbmdlQ3VzdG9tRGF0YSIsInNDcmVhdGlvbk1vZGVDdXN0b21EYXRhIiwiYWxsIiwiYUN1c3RvbURhdGEiLCJvRGlzcGxheU1vZGVzIiwiZW5hYmxlQXV0b0NvbHVtbldpZHRoIiwiaXNPcHRpbWl6ZWRGb3JTbWFsbERldmljZSIsInJlYWRPbmx5IiwidGFibGVUeXBlIiwib25DaGFuZ2UiLCJuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiY29sbGVjdGlvbiIsImNyZWF0aW9uTW9kZSIsImVudGl0eVNldCIsInNQcm9wZXJ0eU5hbWUiLCJtUGFyYW1ldGVycyIsImFSZXN1bHRzIiwiaXNWYWx1ZUhlbHBSZXF1aXJlZCIsImRvZXNWYWx1ZUhlbHBFeGlzdCIsImdldEN1cnJlbnRQYWdlVmlldyIsImdldEZpbHRlckRlbGVnYXRlIiwiRmlsdGVyQmFyRGVsZWdhdGUiLCJvUGFyZW50Q29udHJvbCIsInJlcGxhY2UiLCJnZXRUeXBlVXRpbCIsImZvcm1hdEdyb3VwSGVhZGVyIiwib0NvbnRleHQiLCJzUHJvcGVydHkiLCJtRm9ybWF0SW5mb3MiLCJvRm9ybWF0SW5mbyIsIm9iaiIsImJFeHRlcm5hbEZvcm1hdCIsImJhc2VUeXBlIiwic1ZhbHVlIiwiVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXRXaXRoQnJhY2tldHMiLCJSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGFibGVEZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uLCBGaWVsZEdyb3VwVHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGRlZXBDbG9uZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwQ2xvbmVcIjtcbmltcG9ydCBkZWVwRXF1YWwgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcEVxdWFsXCI7XG5pbXBvcnQgZGVlcEV4dGVuZCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwRXh0ZW5kXCI7XG5pbXBvcnQgQWN0aW9uUnVudGltZSBmcm9tIFwic2FwL2ZlL2NvcmUvQWN0aW9uUnVudGltZVwiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEFubm90YXRpb25UYWJsZUNvbHVtbixcblx0Q3VzdG9tQmFzZWRUYWJsZUNvbHVtbixcblx0ZXhwb3J0U2V0dGluZ3MsXG5cdFRhYmxlQ29sdW1uLFxuXHRUZWNobmljYWxDb2x1bW5cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSB7IEN1c3RvbUVsZW1lbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgVmFsdWVGb3JtYXR0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvVmFsdWVGb3JtYXR0ZXJcIjtcbmltcG9ydCBEZWxldGVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRGVsZXRlSGVscGVyXCI7XG5pbXBvcnQgRXhjZWxGb3JtYXQgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRXhjZWxGb3JtYXRIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgaXNUeXBlRmlsdGVyYWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS90eXBlL0VETVwiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eUluZm8sIHRhYmxlRGVsZWdhdGVNb2RlbCB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJCYXJEZWxlZ2F0ZSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXJCYXIvRmlsdGVyQmFyRGVsZWdhdGVcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvbWFjcm9zL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBUYWJsZVNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVTaXplSGVscGVyXCI7XG5pbXBvcnQgVGFibGVVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IEZyYWdtZW50IGZyb20gXCJzYXAvdWkvY29yZS9GcmFnbWVudFwiO1xuaW1wb3J0IFRhYmxlRGVsZWdhdGVCYXNlIGZyb20gXCJzYXAvdWkvbWRjL29kYXRhL3Y0L1RhYmxlRGVsZWdhdGVcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgeyBWNENvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgdHlwZSBUYWJsZUFQSSBmcm9tIFwiLi4vVGFibGVBUElcIjtcblxuY29uc3QgU0VNQU5USUNLRVlfSEFTX0RSQUZUSU5ESUNBVE9SID0gXCIvc2VtYW50aWNLZXlIYXNEcmFmdEluZGljYXRvclwiO1xuXG4vKipcbiAqIEhlbHBlciBjbGFzcyBmb3Igc2FwLnVpLm1kYy5UYWJsZS5cbiAqIDxoMz48Yj5Ob3RlOjwvYj48L2gzPlxuICogVGhlIGNsYXNzIGlzIGV4cGVyaW1lbnRhbCBhbmQgdGhlIEFQSSBhbmQgdGhlIGJlaGF2aW9yIGFyZSBub3QgZmluYWxpemVkLiBUaGlzIGNsYXNzIGlzIG5vdCBpbnRlbmRlZCBmb3IgcHJvZHVjdGl2ZSB1c2FnZS5cbiAqXG4gKiBAYXV0aG9yIFNBUCBTRVxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqIEBzaW5jZSAxLjY5XG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5UYWJsZURlbGVnYXRlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IE9iamVjdC5hc3NpZ24oe30sIFRhYmxlRGVsZWdhdGVCYXNlLCB7XG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGNhbGN1bGF0ZXMgdGhlIHdpZHRoIGZvciBhIEZpZWxkR3JvdXAgY29sdW1uLlxuXHQgKiBUaGUgd2lkdGggb2YgdGhlIEZpZWxkR3JvdXAgaXMgdGhlIHdpZHRoIG9mIHRoZSB3aWRlc3QgcHJvcGVydHkgY29udGFpbmVkIGluIHRoZSBGaWVsZEdyb3VwIChpbmNsdWRpbmcgdGhlIGxhYmVsIGlmIHNob3dEYXRhRmllbGRzTGFiZWwgaXMgdHJ1ZSlcblx0ICogVGhlIHJlc3VsdCBvZiB0aGlzIGNhbGN1bGF0aW9uIGlzIHN0b3JlZCBpbiB0aGUgdmlzdWFsU2V0dGluZ3Mud2lkdGhDYWxjdWxhdGlvbi5taW5XaWR0aCBwcm9wZXJ0eSwgd2hpY2ggaXMgdXNlZCBieSB0aGUgTURDdGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGUgSW5zdGFuY2Ugb2YgdGhlIE1EQ3RhYmxlXG5cdCAqIEBwYXJhbSBvUHJvcGVydHkgQ3VycmVudCBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gYVByb3BlcnRpZXMgQXJyYXkgb2YgcHJvcGVydGllc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5UYWJsZURlbGVnYXRlXG5cdCAqL1xuXHRfY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yRmllbGRHcm91cDogZnVuY3Rpb24gKG9UYWJsZTogVGFibGUsIG9Qcm9wZXJ0eTogYW55LCBhUHJvcGVydGllczogYW55W10pIHtcblx0XHRpZiAob1Byb3BlcnR5Lm5hbWUuaW5kZXhPZihcIkRhdGFGaWVsZEZvckFubm90YXRpb246OkZpZWxkR3JvdXA6OlwiKSA9PT0gMCkge1xuXHRcdFx0Y29uc3Qgb0NvbHVtbiA9IG9UYWJsZS5nZXRDb2x1bW5zKCkuZmluZChmdW5jdGlvbiAob0NvbDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvQ29sLmdldERhdGFQcm9wZXJ0eSgpID09PSBvUHJvcGVydHkubmFtZTtcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgYlNob3dEYXRhRmllbGRzTGFiZWwgPSBvQ29sdW1uID8gb0NvbHVtbi5kYXRhKFwic2hvd0RhdGFGaWVsZHNMYWJlbFwiKSA9PT0gXCJ0cnVlXCIgOiBmYWxzZTtcblx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvVGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRcdGNvbnN0IGludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvTWV0YU1vZGVsLmdldENvbnRleHQob1Byb3BlcnR5Lm1ldGFkYXRhUGF0aCkpO1xuXHRcdFx0Y29uc3QgY29udmVydGVkTWV0YURhdGEgPSBpbnZvbHZlZERhdGFNb2RlbE9iamVjdHMuY29udmVydGVkVHlwZXM7XG5cdFx0XHRjb25zdCBvRGF0YUZpZWxkID0gaW52b2x2ZWREYXRhTW9kZWxPYmplY3RzLnRhcmdldE9iamVjdCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uO1xuXHRcdFx0Y29uc3Qgb0ZpZWxkR3JvdXAgPSBvRGF0YUZpZWxkLlRhcmdldC4kdGFyZ2V0IGFzIEZpZWxkR3JvdXBUeXBlO1xuXHRcdFx0Y29uc3QgYUZpZWxkV2lkdGg6IGFueSA9IFtdO1xuXHRcdFx0b0ZpZWxkR3JvdXAuRGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChvRGF0YTogYW55KSB7XG5cdFx0XHRcdGxldCBvRGF0YUZpZWxkV2lkdGg6IGFueTtcblx0XHRcdFx0c3dpdGNoIChvRGF0YS4kVHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCI6XG5cdFx0XHRcdFx0XHRvRGF0YUZpZWxkV2lkdGggPSBUYWJsZVNpemVIZWxwZXIuZ2V0V2lkdGhGb3JEYXRhRmllbGRGb3JBbm5vdGF0aW9uKFxuXHRcdFx0XHRcdFx0XHRvRGF0YSxcblx0XHRcdFx0XHRcdFx0YVByb3BlcnRpZXMsXG5cdFx0XHRcdFx0XHRcdGNvbnZlcnRlZE1ldGFEYXRhLFxuXHRcdFx0XHRcdFx0XHRiU2hvd0RhdGFGaWVsZHNMYWJlbFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIjpcblx0XHRcdFx0XHRcdG9EYXRhRmllbGRXaWR0aCA9IFRhYmxlU2l6ZUhlbHBlci5nZXRXaWR0aEZvckRhdGFGaWVsZChvRGF0YSwgYlNob3dEYXRhRmllbGRzTGFiZWwsIGFQcm9wZXJ0aWVzLCBjb252ZXJ0ZWRNZXRhRGF0YSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCI6XG5cdFx0XHRcdFx0XHRvRGF0YUZpZWxkV2lkdGggPSB7XG5cdFx0XHRcdFx0XHRcdGxhYmVsV2lkdGg6IDAsXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5V2lkdGg6IFRhYmxlU2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aChvRGF0YS5MYWJlbClcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvRGF0YUZpZWxkV2lkdGgpIHtcblx0XHRcdFx0XHRhRmllbGRXaWR0aC5wdXNoKG9EYXRhRmllbGRXaWR0aC5sYWJlbFdpZHRoICsgb0RhdGFGaWVsZFdpZHRoLnByb3BlcnR5V2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG5XaWRlc3QgPSBhRmllbGRXaWR0aC5yZWR1Y2UoZnVuY3Rpb24gKGFjYzogYW55LCB2YWx1ZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBNYXRoLm1heChhY2MsIHZhbHVlKTtcblx0XHRcdH0sIDApO1xuXHRcdFx0b1Byb3BlcnR5LnZpc3VhbFNldHRpbmdzID0gZGVlcEV4dGVuZChvUHJvcGVydHkudmlzdWFsU2V0dGluZ3MsIHtcblx0XHRcdFx0d2lkdGhDYWxjdWxhdGlvbjoge1xuXHRcdFx0XHRcdHZlcnRpY2FsQXJyYW5nZW1lbnQ6IHRydWUsXG5cdFx0XHRcdFx0bWluV2lkdGg6IE1hdGguY2VpbChuV2lkZXN0KVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0X2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFZhbHVlSGVscDogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgcHJvcGVydHk6IFByb3BlcnR5SW5mbykge1xuXHRcdGNvbnN0IHRhYmxlQVBJID0gdGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEk7XG5cdFx0aWYgKCFwcm9wZXJ0eS5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRjb25zdCBtZXRhTW9kZWwgPSB0YWJsZS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0aWYgKHByb3BlcnR5Lm1ldGFkYXRhUGF0aCAmJiBtZXRhTW9kZWwpIHtcblx0XHRcdFx0Y29uc3QgZGF0YUZpZWxkID0gbWV0YU1vZGVsLmdldE9iamVjdChgJHtwcm9wZXJ0eS5tZXRhZGF0YVBhdGh9QGApO1xuXHRcdFx0XHRpZiAoZGF0YUZpZWxkICYmIGRhdGFGaWVsZFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdKSB7XG5cdFx0XHRcdFx0cHJvcGVydHkudmlzdWFsU2V0dGluZ3MgPSBkZWVwRXh0ZW5kKHByb3BlcnR5LnZpc3VhbFNldHRpbmdzIHx8IHt9LCB7XG5cdFx0XHRcdFx0XHR3aWR0aENhbGN1bGF0aW9uOiB7XG5cdFx0XHRcdFx0XHRcdGdhcDogdGFibGVBUEkuZ2V0UHJvcGVydHkoXCJyZWFkT25seVwiKSA/IDAgOiA0XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFVuaXQ6IGZ1bmN0aW9uIChcblx0XHRvVGFibGU6IGFueSxcblx0XHRvUHJvcGVydHk6IGFueSxcblx0XHRvVW5pdD86IHN0cmluZyxcblx0XHRvVW5pdFRleHQ/OiBzdHJpbmcsXG5cdFx0b1RpbWV6b25lVGV4dD86IHN0cmluZ1xuXHQpIHtcblx0XHRjb25zdCBvVGFibGVBUEkgPSBvVGFibGUgPyBvVGFibGUuZ2V0UGFyZW50KCkgOiBudWxsO1xuXHRcdC8vIHVwZGF0ZSBnYXAgZm9yIHByb3BlcnRpZXMgd2l0aCBzdHJpbmcgdW5pdFxuXHRcdGNvbnN0IHNVbml0VGV4dCA9IG9Vbml0VGV4dCB8fCBvVGltZXpvbmVUZXh0O1xuXHRcdGlmIChzVW5pdFRleHQpIHtcblx0XHRcdG9Qcm9wZXJ0eS52aXN1YWxTZXR0aW5ncyA9IGRlZXBFeHRlbmQob1Byb3BlcnR5LnZpc3VhbFNldHRpbmdzLCB7XG5cdFx0XHRcdHdpZHRoQ2FsY3VsYXRpb246IHtcblx0XHRcdFx0XHRnYXA6IE1hdGguY2VpbChUYWJsZVNpemVIZWxwZXIuZ2V0QnV0dG9uV2lkdGgoc1VuaXRUZXh0KSlcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmIChvVW5pdCkge1xuXHRcdFx0b1Byb3BlcnR5LnZpc3VhbFNldHRpbmdzID0gZGVlcEV4dGVuZChvUHJvcGVydHkudmlzdWFsU2V0dGluZ3MsIHtcblx0XHRcdFx0d2lkdGhDYWxjdWxhdGlvbjoge1xuXHRcdFx0XHRcdC8vIEZvciBwcm9wZXJ0aWVzIHdpdGggdW5pdCwgYSBnYXAgbmVlZHMgdG8gYmUgYWRkZWQgdG8gcHJvcGVybHkgcmVuZGVyIHRoZSBjb2x1bW4gd2lkdGggb24gZWRpdCBtb2RlXG5cdFx0XHRcdFx0Z2FwOiBvVGFibGVBUEkgJiYgb1RhYmxlQVBJLmdldFJlYWRPbmx5KCkgPyAwIDogNlxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0X2NvbXB1dGVMYWJlbDogZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eUluZm8sIGxhYmVsTWFwOiB7IFtsYWJlbDogc3RyaW5nXTogUHJvcGVydHlJbmZvW10gfSkge1xuXHRcdGlmIChwcm9wZXJ0eS5sYWJlbCkge1xuXHRcdFx0Y29uc3QgcHJvcGVydGllc1dpdGhTYW1lTGFiZWwgPSBsYWJlbE1hcFtwcm9wZXJ0eS5sYWJlbF07XG5cdFx0XHRpZiAocHJvcGVydGllc1dpdGhTYW1lTGFiZWw/Lmxlbmd0aCA+IDEgJiYgcHJvcGVydHkucGF0aD8uaW5jbHVkZXMoXCIvXCIpICYmIHByb3BlcnR5LmFkZGl0aW9uYWxMYWJlbHMpIHtcblx0XHRcdFx0cHJvcGVydHkubGFiZWwgPSBwcm9wZXJ0eS5sYWJlbCArIFwiIChcIiArIHByb3BlcnR5LmFkZGl0aW9uYWxMYWJlbHMuam9pbihcIiAvIFwiKSArIFwiKVwiO1xuXHRcdFx0fVxuXHRcdFx0ZGVsZXRlIHByb3BlcnR5LmFkZGl0aW9uYWxMYWJlbHM7XG5cdFx0fVxuXHR9LFxuXHQvL1VwZGF0ZSBWaXN1YWxTZXR0aW5nIGZvciBjb2x1bW5XaWR0aCBjYWxjdWxhdGlvbiBhbmQgbGFiZWxzIG9uIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRfdXBkYXRlUHJvcGVydHlJbmZvOiBmdW5jdGlvbiAodGFibGU6IFRhYmxlLCBwcm9wZXJ0aWVzOiBQcm9wZXJ0eUluZm9bXSkge1xuXHRcdGNvbnN0IGxhYmVsTWFwOiB7IFtsYWJlbDogc3RyaW5nXTogUHJvcGVydHlJbmZvW10gfSA9IHt9O1xuXHRcdC8vIENoZWNrIGF2YWlsYWJsZSBwMTNuIG1vZGVzXG5cdFx0Y29uc3QgcDEzbk1vZGUgPSB0YWJsZS5nZXRQMTNuTW9kZSgpO1xuXHRcdHByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IFByb3BlcnR5SW5mbykgPT4ge1xuXHRcdFx0aWYgKCFwcm9wZXJ0eS5wcm9wZXJ0eUluZm9zICYmIHByb3BlcnR5LmxhYmVsKSB7XG5cdFx0XHRcdC8vIE9ubHkgZm9yIG5vbi1jb21wbGV4IHByb3BlcnRpZXNcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdChwMTNuTW9kZT8uaW5kZXhPZihcIlNvcnRcIikgPiAtMSAmJiBwcm9wZXJ0eS5zb3J0YWJsZSkgfHxcblx0XHRcdFx0XHQocDEzbk1vZGU/LmluZGV4T2YoXCJGaWx0ZXJcIikgPiAtMSAmJiBwcm9wZXJ0eS5maWx0ZXJhYmxlKSB8fFxuXHRcdFx0XHRcdChwMTNuTW9kZT8uaW5kZXhPZihcIkdyb3VwXCIpID4gLTEgJiYgcHJvcGVydHkuZ3JvdXBhYmxlKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRsYWJlbE1hcFtwcm9wZXJ0eS5sYWJlbF0gPVxuXHRcdFx0XHRcdFx0bGFiZWxNYXBbcHJvcGVydHkubGFiZWxdICE9PSB1bmRlZmluZWQgPyBsYWJlbE1hcFtwcm9wZXJ0eS5sYWJlbF0uY29uY2F0KFtwcm9wZXJ0eV0pIDogW3Byb3BlcnR5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IGFueSkgPT4ge1xuXHRcdFx0dGhpcy5fY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yRmllbGRHcm91cCh0YWJsZSwgcHJvcGVydHksIHByb3BlcnRpZXMpO1xuXHRcdFx0dGhpcy5fY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yUHJvcGVydHlXaXRoVmFsdWVIZWxwKHRhYmxlLCBwcm9wZXJ0eSk7XG5cdFx0XHQvLyBiY3A6IDIyNzAwMDM1Nzdcblx0XHRcdC8vIFNvbWUgY29sdW1ucyAoZWc6IGN1c3RvbSBjb2x1bW5zKSBoYXZlIG5vIHR5cGVDb25maWcgcHJvcGVydHkuXG5cdFx0XHQvLyBpbml0aWFsaXppbmcgaXQgcHJldmVudHMgYW4gZXhjZXB0aW9uIHRocm93XG5cdFx0XHRwcm9wZXJ0eS50eXBlQ29uZmlnID0gZGVlcEV4dGVuZChwcm9wZXJ0eS50eXBlQ29uZmlnLCB7fSk7XG5cdFx0XHR0aGlzLl9jb21wdXRlTGFiZWwocHJvcGVydHksIGxhYmVsTWFwKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gcHJvcGVydGllcztcblx0fSxcblxuXHRnZXRDb2x1bW5zRm9yOiBmdW5jdGlvbiAodGFibGU6IFRhYmxlKTogVGFibGVDb2x1bW5bXSB7XG5cdFx0cmV0dXJuICh0YWJsZS5nZXRQYXJlbnQoKSBhcyBUYWJsZUFQSSkuZ2V0VGFibGVEZWZpbml0aW9uKCkuY29sdW1ucztcblx0fSxcblxuXHRfZ2V0QWdncmVnYXRlZFByb3BlcnR5TWFwOiBmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRyZXR1cm4gb1RhYmxlLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpLmFnZ3JlZ2F0ZXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGV4cG9ydCBjYXBhYmlsaXRpZXMgZm9yIHRoZSBnaXZlbiBzYXAudWkubWRjLlRhYmxlIGluc3RhbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIHRoZSB0YWJsZVxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlcHJlc2VudGluZyB0aGUgZXhwb3J0IGNhcGFiaWxpdGllcyBvZiB0aGUgdGFibGUgaW5zdGFuY2Vcblx0ICovXG5cdGZldGNoRXhwb3J0Q2FwYWJpbGl0aWVzOiBmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRjb25zdCBvQ2FwYWJpbGl0aWVzOiBhbnkgPSB7IFhMU1g6IHt9IH07XG5cdFx0bGV0IG9Nb2RlbCE6IGFueTtcblx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmZldGNoTW9kZWwob1RhYmxlKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG1vZGVsOiBhbnkpIHtcblx0XHRcdFx0b01vZGVsID0gbW9kZWw7XG5cdFx0XHRcdHJldHVybiBvTW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KFwiLyRFbnRpdHlDb250YWluZXJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TdXBwb3J0ZWRGb3JtYXRzXCIpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChhU3VwcG9ydGVkRm9ybWF0czogc3RyaW5nW10gfCB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y29uc3QgYUxvd2VyRm9ybWF0cyA9IChhU3VwcG9ydGVkRm9ybWF0cyB8fCBbXSkubWFwKChlbGVtZW50KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGVsZW1lbnQudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChhTG93ZXJGb3JtYXRzLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9wZGZcIikgPiAtMSkge1xuXHRcdFx0XHRcdHJldHVybiBvTW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KFwiLyRFbnRpdHlDb250YWluZXJAY29tLnNhcC52b2NhYnVsYXJpZXMuUERGLnYxLkZlYXR1cmVzXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9Bbm5vdGF0aW9uOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9Bbm5vdGF0aW9uKSB7XG5cdFx0XHRcdFx0b0NhcGFiaWxpdGllc1tcIlBERlwiXSA9IE9iamVjdC5hc3NpZ24oe30sIG9Bbm5vdGF0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKGBBbiBlcnJvciBvY2N1cnMgd2hpbGUgY29tcHV0aW5nIGV4cG9ydCBjYXBhYmlsaXRpZXM6ICR7ZXJyfWApO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIG9DYXBhYmlsaXRpZXM7XG5cdFx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogRmlsdGVyaW5nIG9uIDE6biBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgYW5kIG5hdmlnYXRpb25cblx0ICogcHJvcGVydGllcyBub3QgcGFydCBvZiB0aGUgTGluZUl0ZW0gYW5ub3RhdGlvbiBpcyBmb3JiaWRkZW4uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb2x1bW5JbmZvXG5cdCAqIEBwYXJhbSBtZXRhTW9kZWxcblx0ICogQHBhcmFtIHRhYmxlXG5cdCAqIEByZXR1cm5zIEJvb2xlYW4gdHJ1ZSBpZiBmaWx0ZXJpbmcgaXMgYWxsb3dlZCwgZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRfaXNGaWx0ZXJhYmxlTmF2aWdhdGlvblByb3BlcnR5OiBmdW5jdGlvbiAoY29sdW1uSW5mbzogQW5ub3RhdGlvblRhYmxlQ29sdW1uLCBtZXRhTW9kZWw6IE1ldGFNb2RlbCwgdGFibGU6IFRhYmxlKSA6Qm9vbGVhbiB7XG5cdFx0Ly8gZ2V0IHRoZSBEYXRhTW9kZWxPYmplY3RQYXRoIGZvciB0aGUgdGFibGVcblx0XHRjb25zdCB0YWJsZURhdGFNb2RlbE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMobWV0YU1vZGVsLmdldENvbnRleHQoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEodGFibGUsIFwibWV0YVBhdGhcIikpKSxcblx0XHRcdC8vIGdldCBhbGwgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIGxlYWRpbmcgdG8gdGhlIGNvbHVtblxuXHRcdFx0Y29sdW1uTmF2aWdhdGlvblByb3BlcnRpZXMgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMobWV0YU1vZGVsLmdldENvbnRleHQoY29sdW1uSW5mby5hbm5vdGF0aW9uUGF0aCkpLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLFxuXHRcdFx0Ly8gd2UgYXJlIG9ubHkgaW50ZXJlc3RlZCBpbiBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgcmVsYXRpdmUgdG8gdGhlIHRhYmxlLCBzbyBhbGwgYmVmb3JlIGFuZCBpbmNsdWRpbmcgdGhlIHRhYmxlcyB0YXJnZXRUeXBlIGNhbiBiZSBmaWx0ZXJlZFxuXHRcdFx0dGFibGVUYXJnZXRFbnRpdHlJbmRleCA9IGNvbHVtbk5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZpbmRJbmRleChcblx0XHRcdFx0KHByb3ApID0+IHByb3AudGFyZ2V0VHlwZT8ubmFtZSA9PT0gdGFibGVEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVR5cGUubmFtZVxuXHRcdFx0KSxcblx0XHRcdHJlbGF0aXZlTmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb2x1bW5OYXZpZ2F0aW9uUHJvcGVydGllcy5zbGljZSh0YWJsZVRhcmdldEVudGl0eUluZGV4ID4gMCA/IHRhYmxlVGFyZ2V0RW50aXR5SW5kZXggOiAwKTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0IWNvbHVtbkluZm8ucmVsYXRpdmVQYXRoLmluY2x1ZGVzKFwiL1wiKSB8fFxuXHRcdFx0KGNvbHVtbkluZm8uaXNQYXJ0T2ZMaW5lSXRlbSA9PT0gdHJ1ZSAmJlxuXHRcdFx0XHQhcmVsYXRpdmVOYXZpZ2F0aW9uUHJvcGVydGllcy5zb21lKFxuXHRcdFx0XHRcdChuYXZpZ2F0aW9uUHJvcGVydHkpID0+IG5hdmlnYXRpb25Qcm9wZXJ0eS5fdHlwZSA9PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIG5hdmlnYXRpb25Qcm9wZXJ0eS5pc0NvbGxlY3Rpb25cblx0XHRcdFx0KSlcblx0XHQpO1xuXHR9LFxuXG5cdF9mZXRjaFByb3BlcnR5SW5mbzogZnVuY3Rpb24gKG1ldGFNb2RlbDogTWV0YU1vZGVsLCBjb2x1bW5JbmZvOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4sIHRhYmxlOiBUYWJsZSwgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBzQWJzb2x1dGVOYXZpZ2F0aW9uUGF0aCA9IGNvbHVtbkluZm8uYW5ub3RhdGlvblBhdGgsXG5cdFx0XHRvRGF0YUZpZWxkID0gbWV0YU1vZGVsLmdldE9iamVjdChzQWJzb2x1dGVOYXZpZ2F0aW9uUGF0aCksXG5cdFx0XHRvTmF2aWdhdGlvbkNvbnRleHQgPSBtZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Fic29sdXRlTmF2aWdhdGlvblBhdGgpIGFzIENvbnRleHQsXG5cdFx0XHRvVHlwZUNvbmZpZyA9XG5cdFx0XHRcdGNvbHVtbkluZm8udHlwZUNvbmZpZz8uY2xhc3NOYW1lICYmIGlzVHlwZUZpbHRlcmFibGUoY29sdW1uSW5mby50eXBlQ29uZmlnLmNsYXNzTmFtZSlcblx0XHRcdFx0XHQ/IFR5cGVVdGlsLmdldFR5cGVDb25maWcoXG5cdFx0XHRcdFx0XHRcdGNvbHVtbkluZm8udHlwZUNvbmZpZy5jbGFzc05hbWUsXG5cdFx0XHRcdFx0XHRcdGNvbHVtbkluZm8udHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zLFxuXHRcdFx0XHRcdFx0XHRjb2x1bW5JbmZvLnR5cGVDb25maWcuY29uc3RyYWludHNcblx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHQ6IHt9LFxuXHRcdFx0YkZpbHRlcmFibGUgPSBDb21tb25IZWxwZXIuaXNQcm9wZXJ0eUZpbHRlcmFibGUob05hdmlnYXRpb25Db250ZXh0LCBvRGF0YUZpZWxkKSxcblx0XHRcdGlzQ29tcGxleFR5cGUgPVxuXHRcdFx0XHRjb2x1bW5JbmZvLnR5cGVDb25maWcgJiYgY29sdW1uSW5mby50eXBlQ29uZmlnLmNsYXNzTmFtZSAmJiBjb2x1bW5JbmZvLnR5cGVDb25maWcuY2xhc3NOYW1lPy5pbmRleE9mKFwiRWRtLlwiKSAhPT0gMCxcblx0XHRcdGJJc0FuYWx5dGljYWxUYWJsZSA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRhYmxlLCBcImVuYWJsZUFuYWx5dGljc1wiKSA9PT0gXCJ0cnVlXCIsXG5cdFx0XHRhQWdncmVnYXRlZFByb3BlcnR5TWFwVW5maWx0ZXJhYmxlID0gYklzQW5hbHl0aWNhbFRhYmxlID8gdGhpcy5fZ2V0QWdncmVnYXRlZFByb3BlcnR5TWFwKHRhYmxlKSA6IHt9LFxuXHRcdFx0bGFiZWwgPSBEZWxlZ2F0ZVV0aWwuZ2V0TG9jYWxpemVkVGV4dChjb2x1bW5JbmZvLmxhYmVsID8/IFwiXCIsIGFwcENvbXBvbmVudCA/PyB0YWJsZSk7XG5cblx0XHRjb25zdCBwcm9wZXJ0eUluZm86IFByb3BlcnR5SW5mbyA9IHtcblx0XHRcdG5hbWU6IGNvbHVtbkluZm8ubmFtZSxcblx0XHRcdG1ldGFkYXRhUGF0aDogc0Fic29sdXRlTmF2aWdhdGlvblBhdGgsXG5cdFx0XHRncm91cExhYmVsOiBjb2x1bW5JbmZvLmdyb3VwTGFiZWwsXG5cdFx0XHRncm91cDogY29sdW1uSW5mby5ncm91cCxcblx0XHRcdGxhYmVsOiBsYWJlbCxcblx0XHRcdHRvb2x0aXA6IGNvbHVtbkluZm8udG9vbHRpcCxcblx0XHRcdHR5cGVDb25maWc6IG9UeXBlQ29uZmlnLFxuXHRcdFx0dmlzaWJsZTogY29sdW1uSW5mby5hdmFpbGFiaWxpdHkgIT09IFwiSGlkZGVuXCIgJiYgIWlzQ29tcGxleFR5cGUsXG5cdFx0XHRleHBvcnRTZXR0aW5nczogdGhpcy5fc2V0UHJvcGVydHlJbmZvRXhwb3J0U2V0dGluZ3MoY29sdW1uSW5mby5leHBvcnRTZXR0aW5ncywgY29sdW1uSW5mbyksXG5cdFx0XHR1bml0OiBjb2x1bW5JbmZvLnVuaXRcblx0XHR9O1xuXG5cdFx0Ly8gU2V0IHZpc3VhbFNldHRpbmdzIG9ubHkgaWYgaXQgZXhpc3RzXG5cdFx0aWYgKGNvbHVtbkluZm8udmlzdWFsU2V0dGluZ3MgJiYgT2JqZWN0LmtleXMoY29sdW1uSW5mby52aXN1YWxTZXR0aW5ncykubGVuZ3RoID4gMCkge1xuXHRcdFx0cHJvcGVydHlJbmZvLnZpc3VhbFNldHRpbmdzID0gY29sdW1uSW5mby52aXN1YWxTZXR0aW5ncztcblx0XHR9XG5cblx0XHRpZiAoY29sdW1uSW5mby5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSkge1xuXHRcdFx0cHJvcGVydHlJbmZvLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlID0gY29sdW1uSW5mby5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZTtcblx0XHR9XG5cblx0XHQvLyBNREMgZXhwZWN0cyAgJ3Byb3BlcnR5SW5mb3MnIG9ubHkgZm9yIGNvbXBsZXggcHJvcGVydGllcy5cblx0XHQvLyBBbiBlbXB0eSBhcnJheSB0aHJvd3MgdmFsaWRhdGlvbiBlcnJvciBhbmQgdW5kZWZpbmVkIHZhbHVlIGlzIHVuaGFuZGxlZC5cblx0XHRpZiAoY29sdW1uSW5mby5wcm9wZXJ0eUluZm9zPy5sZW5ndGgpIHtcblx0XHRcdHByb3BlcnR5SW5mby5wcm9wZXJ0eUluZm9zID0gY29sdW1uSW5mby5wcm9wZXJ0eUluZm9zO1xuXHRcdFx0Ly9vbmx5IGluIGNhc2Ugb2YgY29tcGxleCBwcm9wZXJ0aWVzLCB3cmFwIHRoZSBjZWxsIGNvbnRlbnRcdG9uIHRoZSBleGNlbCBleHBvcnRlZCBmaWxlXG5cdFx0XHRpZiAocHJvcGVydHlJbmZvLmV4cG9ydFNldHRpbmdzKSB7XG5cdFx0XHRcdHByb3BlcnR5SW5mby5leHBvcnRTZXR0aW5ncy53cmFwID0gY29sdW1uSW5mby5leHBvcnRTZXR0aW5ncz8ud3JhcDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQWRkIHByb3BlcnRpZXMgd2hpY2ggYXJlIHN1cHBvcnRlZCBvbmx5IGJ5IHNpbXBsZSBQcm9wZXJ0eUluZm9zLlxuXHRcdFx0cHJvcGVydHlJbmZvLnBhdGggPSBjb2x1bW5JbmZvLnJlbGF0aXZlUGF0aDtcblx0XHRcdC8vIFRPRE8gd2l0aCB0aGUgbmV3IGNvbXBsZXggcHJvcGVydHkgaW5mbywgYSBsb3Qgb2YgXCJEZXNjcmlwdGlvblwiIGZpZWxkcyBhcmUgYWRkZWQgYXMgZmlsdGVyL3NvcnQgZmllbGRzXG5cdFx0XHRwcm9wZXJ0eUluZm8uc29ydGFibGUgPSBjb2x1bW5JbmZvLnNvcnRhYmxlO1xuXHRcdFx0aWYgKGJJc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0XHR0aGlzLl91cGRhdGVBbmFseXRpY2FsUHJvcGVydHlJbmZvQXR0cmlidXRlcyhwcm9wZXJ0eUluZm8sIGNvbHVtbkluZm8pO1xuXHRcdFx0fVxuXHRcdFx0cHJvcGVydHlJbmZvLmZpbHRlcmFibGUgPVxuXHRcdFx0XHQhIWJGaWx0ZXJhYmxlICYmXG5cdFx0XHRcdHRoaXMuX2lzRmlsdGVyYWJsZU5hdmlnYXRpb25Qcm9wZXJ0eShjb2x1bW5JbmZvLCBtZXRhTW9kZWwsIHRhYmxlKSAmJlxuXHRcdFx0XHQvLyBUT0RPIGlnbm9yaW5nIGFsbCBwcm9wZXJ0aWVzIHRoYXQgYXJlIG5vdCBhbHNvIGF2YWlsYWJsZSBmb3IgYWRhcHRhdGlvbiBmb3Igbm93LCBidXQgcHJvcGVyIGNvbmNlcHQgcmVxdWlyZWRcblx0XHRcdFx0KCFiSXNBbmFseXRpY2FsVGFibGUgfHxcblx0XHRcdFx0XHQoIWFBZ2dyZWdhdGVkUHJvcGVydHlNYXBVbmZpbHRlcmFibGVbcHJvcGVydHlJbmZvLm5hbWVdICYmXG5cdFx0XHRcdFx0XHQhKGNvbHVtbkluZm8gYXMgVGVjaG5pY2FsQ29sdW1uKS5leHRlbnNpb24/LnRlY2huaWNhbGx5R3JvdXBhYmxlKSk7XG5cdFx0XHRwcm9wZXJ0eUluZm8ua2V5ID0gY29sdW1uSW5mby5pc0tleTtcblx0XHRcdHByb3BlcnR5SW5mby5ncm91cGFibGUgPSBjb2x1bW5JbmZvLmlzR3JvdXBhYmxlO1xuXHRcdFx0aWYgKGNvbHVtbkluZm8udGV4dEFycmFuZ2VtZW50KSB7XG5cdFx0XHRcdGNvbnN0IGRlc2NyaXB0aW9uQ29sdW1uID0gKHRoaXMuZ2V0Q29sdW1uc0Zvcih0YWJsZSkgYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uW10pLmZpbmQoZnVuY3Rpb24gKG9Db2wpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0NvbC5uYW1lID09PSBjb2x1bW5JbmZvLnRleHRBcnJhbmdlbWVudD8udGV4dFByb3BlcnR5O1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKGRlc2NyaXB0aW9uQ29sdW1uKSB7XG5cdFx0XHRcdFx0cHJvcGVydHlJbmZvLm1vZGUgPSBjb2x1bW5JbmZvLnRleHRBcnJhbmdlbWVudC5tb2RlO1xuXHRcdFx0XHRcdHByb3BlcnR5SW5mby52YWx1ZVByb3BlcnR5ID0gY29sdW1uSW5mby5yZWxhdGl2ZVBhdGg7XG5cdFx0XHRcdFx0cHJvcGVydHlJbmZvLmRlc2NyaXB0aW9uUHJvcGVydHkgPSBkZXNjcmlwdGlvbkNvbHVtbi5yZWxhdGl2ZVBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHByb3BlcnR5SW5mby50ZXh0ID0gY29sdW1uSW5mby50ZXh0QXJyYW5nZW1lbnQgJiYgY29sdW1uSW5mby50ZXh0QXJyYW5nZW1lbnQudGV4dFByb3BlcnR5O1xuXHRcdFx0cHJvcGVydHlJbmZvLmNhc2VTZW5zaXRpdmUgPSBjb2x1bW5JbmZvLmNhc2VTZW5zaXRpdmU7XG5cdFx0XHRpZiAoY29sdW1uSW5mby5hZGRpdGlvbmFsTGFiZWxzKSB7XG5cdFx0XHRcdHByb3BlcnR5SW5mby5hZGRpdGlvbmFsTGFiZWxzID0gY29sdW1uSW5mby5hZGRpdGlvbmFsTGFiZWxzLm1hcCgoYWRkaXRpb25hbExhYmVsOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmdldExvY2FsaXplZFRleHQoYWRkaXRpb25hbExhYmVsLCBhcHBDb21wb25lbnQgfHwgdGFibGUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JQcm9wZXJ0eVdpdGhVbml0KHRhYmxlLCBwcm9wZXJ0eUluZm8sIGNvbHVtbkluZm8udW5pdCwgY29sdW1uSW5mby51bml0VGV4dCwgY29sdW1uSW5mby50aW1lem9uZVRleHQpO1xuXG5cdFx0cmV0dXJuIHByb3BlcnR5SW5mbztcblx0fSxcblxuXHQvKipcblx0ICogRXh0ZW5kIHRoZSBleHBvcnQgc2V0dGluZ3MgYmFzZWQgb24gdGhlIGNvbHVtbiBpbmZvLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXhwb3J0U2V0dGluZ3MgVGhlIGV4cG9ydCBzZXR0aW5ncyB0byBiZSBleHRlbmRlZFxuXHQgKiBAcGFyYW0gY29sdW1uSW5mbyBUaGUgY29sdW1uSW5mbyBvYmplY3Rcblx0ICogQHJldHVybnMgVGhlIGV4dGVuZGVkIGV4cG9ydCBzZXR0aW5nc1xuXHQgKi9cblx0X3NldFByb3BlcnR5SW5mb0V4cG9ydFNldHRpbmdzOiBmdW5jdGlvbiAoXG5cdFx0ZXhwb3J0U2V0dGluZ3M6IGV4cG9ydFNldHRpbmdzIHwgdW5kZWZpbmVkIHwgbnVsbCxcblx0XHRjb2x1bW5JbmZvOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5cblx0KTogZXhwb3J0U2V0dGluZ3MgfCB1bmRlZmluZWQgfCBudWxsIHtcblx0XHRjb25zdCBleHBvcnRGb3JtYXQgPSB0aGlzLl9nZXRFeHBvcnRGb3JtYXQoY29sdW1uSW5mby50eXBlQ29uZmlnPy5jbGFzc05hbWUpO1xuXHRcdGlmIChleHBvcnRTZXR0aW5ncykge1xuXHRcdFx0aWYgKGV4cG9ydEZvcm1hdCAmJiAhZXhwb3J0U2V0dGluZ3MudGltZXpvbmVQcm9wZXJ0eSkge1xuXHRcdFx0XHRleHBvcnRTZXR0aW5ncy5mb3JtYXQgPSBleHBvcnRGb3JtYXQ7XG5cdFx0XHR9XG5cdFx0XHQvLyBTZXQgdGhlIGV4cG9ydFNldHRpbmdzIHRlbXBsYXRlIG9ubHkgaWYgaXQgZXhpc3RzLlxuXHRcdFx0aWYgKGV4cG9ydFNldHRpbmdzLnRlbXBsYXRlKSB7XG5cdFx0XHRcdGV4cG9ydFNldHRpbmdzLnRlbXBsYXRlID0gY29sdW1uSW5mby5leHBvcnRTZXR0aW5ncz8udGVtcGxhdGU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBleHBvcnRTZXR0aW5ncztcblx0fSxcblxuXHRfdXBkYXRlQW5hbHl0aWNhbFByb3BlcnR5SW5mb0F0dHJpYnV0ZXMocHJvcGVydHlJbmZvOiBQcm9wZXJ0eUluZm8sIGNvbHVtbkluZm86IEFubm90YXRpb25UYWJsZUNvbHVtbikge1xuXHRcdGlmIChjb2x1bW5JbmZvLmFnZ3JlZ2F0YWJsZSkge1xuXHRcdFx0cHJvcGVydHlJbmZvLmFnZ3JlZ2F0YWJsZSA9IGNvbHVtbkluZm8uYWdncmVnYXRhYmxlO1xuXHRcdH1cblx0XHRpZiAoY29sdW1uSW5mby5leHRlbnNpb24pIHtcblx0XHRcdHByb3BlcnR5SW5mby5leHRlbnNpb24gPSBjb2x1bW5JbmZvLmV4dGVuc2lvbjtcblx0XHR9XG5cdH0sXG5cblx0X2ZldGNoQ3VzdG9tUHJvcGVydHlJbmZvOiBmdW5jdGlvbiAob0NvbHVtbkluZm86IGFueSwgb1RhYmxlOiBhbnksIG9BcHBDb21wb25lbnQ6IGFueSkge1xuXHRcdGNvbnN0IHNMYWJlbCA9IERlbGVnYXRlVXRpbC5nZXRMb2NhbGl6ZWRUZXh0KG9Db2x1bW5JbmZvLmhlYWRlciwgb0FwcENvbXBvbmVudCB8fCBvVGFibGUpOyAvLyBUb2RvOiBUbyBiZSByZW1vdmVkIG9uY2UgTURDIHByb3ZpZGVzIHRyYW5zbGF0aW9uIHN1cHBvcnRcblx0XHRjb25zdCBvUHJvcGVydHlJbmZvOiBhbnkgPSB7XG5cdFx0XHRuYW1lOiBvQ29sdW1uSW5mby5uYW1lLFxuXHRcdFx0Z3JvdXBMYWJlbDogdW5kZWZpbmVkLFxuXHRcdFx0Z3JvdXA6IHVuZGVmaW5lZCxcblx0XHRcdGxhYmVsOiBzTGFiZWwsXG5cdFx0XHR0eXBlOiBcIkVkbS5TdHJpbmdcIiwgLy8gVEJEXG5cdFx0XHR2aXNpYmxlOiBvQ29sdW1uSW5mby5hdmFpbGFiaWxpdHkgIT09IFwiSGlkZGVuXCIsXG5cdFx0XHRleHBvcnRTZXR0aW5nczogb0NvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MsXG5cdFx0XHR2aXN1YWxTZXR0aW5nczogb0NvbHVtbkluZm8udmlzdWFsU2V0dGluZ3Ncblx0XHR9O1xuXG5cdFx0Ly8gTURDIGV4cGVjdHMgJ3Byb3BlcnR5SW5mb3MnIG9ubHkgZm9yIGNvbXBsZXggcHJvcGVydGllcy5cblx0XHQvLyBBbiBlbXB0eSBhcnJheSB0aHJvd3MgdmFsaWRhdGlvbiBlcnJvciBhbmQgdW5kZWZpbmVkIHZhbHVlIGlzIHVuaGFuZGxlZC5cblx0XHRpZiAob0NvbHVtbkluZm8ucHJvcGVydHlJbmZvcyAmJiBvQ29sdW1uSW5mby5wcm9wZXJ0eUluZm9zLmxlbmd0aCkge1xuXHRcdFx0b1Byb3BlcnR5SW5mby5wcm9wZXJ0eUluZm9zID0gb0NvbHVtbkluZm8ucHJvcGVydHlJbmZvcztcblx0XHRcdC8vb25seSBpbiBjYXNlIG9mIGNvbXBsZXggcHJvcGVydGllcywgd3JhcCB0aGUgY2VsbCBjb250ZW50IG9uIHRoZSBleGNlbCBleHBvcnRlZCBmaWxlXG5cdFx0XHRvUHJvcGVydHlJbmZvLmV4cG9ydFNldHRpbmdzID0ge1xuXHRcdFx0XHR3cmFwOiBvQ29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy53cmFwLFxuXHRcdFx0XHR0ZW1wbGF0ZTogb0NvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudGVtcGxhdGVcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEFkZCBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBzdXBwb3J0ZWQgb25seSBieSBzaW1wbGUgUHJvcGVydHlJbmZvcy5cblx0XHRcdG9Qcm9wZXJ0eUluZm8ucGF0aCA9IG9Db2x1bW5JbmZvLm5hbWU7XG5cdFx0XHRvUHJvcGVydHlJbmZvLnNvcnRhYmxlID0gZmFsc2U7XG5cdFx0XHRvUHJvcGVydHlJbmZvLmZpbHRlcmFibGUgPSBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG5cdH0sXG5cdF9iQ29sdW1uSGFzUHJvcGVydHlXaXRoRHJhZnRJbmRpY2F0b3I6IGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogYW55KSB7XG5cdFx0cmV0dXJuICEhKFxuXHRcdFx0KG9Db2x1bW5JbmZvLmZvcm1hdE9wdGlvbnMgJiYgb0NvbHVtbkluZm8uZm9ybWF0T3B0aW9ucy5oYXNEcmFmdEluZGljYXRvcikgfHxcblx0XHRcdChvQ29sdW1uSW5mby5mb3JtYXRPcHRpb25zICYmIG9Db2x1bW5JbmZvLmZvcm1hdE9wdGlvbnMuZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoKVxuXHRcdCk7XG5cdH0sXG5cdF91cGRhdGVEcmFmdEluZGljYXRvck1vZGVsOiBmdW5jdGlvbiAoX29UYWJsZTogYW55LCBfb0NvbHVtbkluZm86IGFueSkge1xuXHRcdGNvbnN0IGFWaXNpYmxlQ29sdW1ucyA9IF9vVGFibGUuZ2V0Q29sdW1ucygpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0ID0gX29UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IHNJbnRlcm5hbFBhdGggPSBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCAmJiBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0aWYgKGFWaXNpYmxlQ29sdW1ucyAmJiBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Zm9yIChjb25zdCBpbmRleCBpbiBhVmlzaWJsZUNvbHVtbnMpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHRoaXMuX2JDb2x1bW5IYXNQcm9wZXJ0eVdpdGhEcmFmdEluZGljYXRvcihfb0NvbHVtbkluZm8pICYmXG5cdFx0XHRcdFx0X29Db2x1bW5JbmZvLm5hbWUgPT09IGFWaXNpYmxlQ29sdW1uc1tpbmRleF0uZ2V0RGF0YVByb3BlcnR5KClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0aWYgKG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LmdldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IsIF9vQ29sdW1uSW5mby5uYW1lKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0X2ZldGNoUHJvcGVydGllc0ZvckVudGl0eTogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBzRW50aXR5VHlwZVBhdGg6IGFueSwgb01ldGFNb2RlbDogYW55LCBvQXBwQ29tcG9uZW50OiBhbnkpIHtcblx0XHQvLyB3aGVuIGZldGNoaW5nIHByb3BlcnRpZXMsIHRoaXMgYmluZGluZyBjb250ZXh0IGlzIG5lZWRlZCAtIHNvIGxldHMgY3JlYXRlIGl0IG9ubHkgb25jZSBhbmQgdXNlIGlmIGZvciBhbGwgcHJvcGVydGllcy9kYXRhLWZpZWxkcy9saW5lLWl0ZW1zXG5cdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzRW50aXR5VHlwZVBhdGgpO1xuXHRcdGxldCBhRmV0Y2hlZFByb3BlcnRpZXM6IGFueVtdID0gW107XG5cdFx0Y29uc3Qgb0ZSID0gQ29tbW9uVXRpbHMuZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKHNCaW5kaW5nUGF0aCwgb01ldGFNb2RlbCk7XG5cdFx0Y29uc3QgYU5vbkZpbHRlcmFibGVQcm9wcyA9IG9GUi5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcztcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuZ2V0Q29sdW1uc0ZvcihvVGFibGUpKVxuXHRcdFx0LnRoZW4oKGFDb2x1bW5zOiBUYWJsZUNvbHVtbltdKSA9PiB7XG5cdFx0XHRcdC8vIERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhIGRvZXMgbm90IHdvcmsgdmlhICdlbnRpdHlTZXQvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEnXG5cdFx0XHRcdGlmIChhQ29sdW1ucykge1xuXHRcdFx0XHRcdGxldCBvUHJvcGVydHlJbmZvO1xuXHRcdFx0XHRcdGFDb2x1bW5zLmZvckVhY2goKG9Db2x1bW5JbmZvKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLl91cGRhdGVEcmFmdEluZGljYXRvck1vZGVsKG9UYWJsZSwgb0NvbHVtbkluZm8pO1xuXHRcdFx0XHRcdFx0c3dpdGNoIChvQ29sdW1uSW5mby50eXBlKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJBbm5vdGF0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mbyA9IHRoaXMuX2ZldGNoUHJvcGVydHlJbmZvKFxuXHRcdFx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRcdG9Db2x1bW5JbmZvIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbixcblx0XHRcdFx0XHRcdFx0XHRcdG9UYWJsZSxcblx0XHRcdFx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnRcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHlJbmZvICYmIGFOb25GaWx0ZXJhYmxlUHJvcHMuaW5kZXhPZihvUHJvcGVydHlJbmZvLm5hbWUpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mby5tYXhDb25kaXRpb25zID0gRGVsZWdhdGVVdGlsLmlzTXVsdGlWYWx1ZShvUHJvcGVydHlJbmZvKSA/IC0xIDogMTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJTbG90XCI6XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJEZWZhdWx0XCI6XG5cdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mbyA9IHRoaXMuX2ZldGNoQ3VzdG9tUHJvcGVydHlJbmZvKG9Db2x1bW5JbmZvLCBvVGFibGUsIG9BcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5oYW5kbGVkIHN3aXRjaCBjYXNlICR7b0NvbHVtbkluZm8udHlwZX1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGFGZXRjaGVkUHJvcGVydGllcy5wdXNoKG9Qcm9wZXJ0eUluZm8pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRhRmV0Y2hlZFByb3BlcnRpZXMgPSB0aGlzLl91cGRhdGVQcm9wZXJ0eUluZm8ob1RhYmxlLCBhRmV0Y2hlZFByb3BlcnRpZXMpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKGBBbiBlcnJvciBvY2N1cnMgd2hpbGUgdXBkYXRpbmcgZmV0Y2hlZCBwcm9wZXJ0aWVzOiAke2Vycn1gKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBhRmV0Y2hlZFByb3BlcnRpZXM7XG5cdFx0XHR9KTtcblx0fSxcblxuXHRfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHk6IGZ1bmN0aW9uICh0YWJsZTogVGFibGUsIGVudGl0eVR5cGVQYXRoOiBzdHJpbmcsIG1ldGFNb2RlbDogYW55LCBhcHBDb21wb25lbnQ/OiBBcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBmZXRjaGVkUHJvcGVydGllcyA9IERlbGVnYXRlVXRpbC5nZXRDYWNoZWRQcm9wZXJ0aWVzKHRhYmxlKTtcblxuXHRcdGlmIChmZXRjaGVkUHJvcGVydGllcykge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShmZXRjaGVkUHJvcGVydGllcyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9mZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkodGFibGUsIGVudGl0eVR5cGVQYXRoLCBtZXRhTW9kZWwsIGFwcENvbXBvbmVudCkudGhlbihmdW5jdGlvbiAoc3ViRmV0Y2hlZFByb3BlcnRpZXM6IGFueVtdKSB7XG5cdFx0XHREZWxlZ2F0ZVV0aWwuc2V0Q2FjaGVkUHJvcGVydGllcyh0YWJsZSwgc3ViRmV0Y2hlZFByb3BlcnRpZXMpO1xuXHRcdFx0cmV0dXJuIHN1YkZldGNoZWRQcm9wZXJ0aWVzO1xuXHRcdH0pO1xuXHR9LFxuXG5cdF9zZXRUYWJsZU5vRGF0YVRleHQ6IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0XHRsZXQgc05vRGF0YUtleSA9IFwiXCI7XG5cdFx0Y29uc3Qgb1RhYmxlRmlsdGVySW5mbyA9IFRhYmxlVXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhvVGFibGUpLFxuXHRcdFx0c3VmZml4UmVzb3VyY2VLZXkgPSBvQmluZGluZ0luZm8ucGF0aC5zdGFydHNXaXRoKFwiL1wiKSA/IG9CaW5kaW5nSW5mby5wYXRoLnN1YnN0cigxKSA6IG9CaW5kaW5nSW5mby5wYXRoO1xuXG5cdFx0Y29uc3QgX2dldE5vRGF0YVRleHRXaXRoRmlsdGVycyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChvVGFibGUuZGF0YShcImhpZGRlbkZpbHRlcnNcIikgfHwgb1RhYmxlLmRhdGEoXCJxdWlja0ZpbHRlcktleVwiKSkge1xuXHRcdFx0XHRyZXR1cm4gXCJNX1RBQkxFX0FORF9DSEFSVF9OT19EQVRBX1RFWFRfTVVMVElfVklFV1wiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFwiVF9UQUJMRV9BTkRfQ0hBUlRfTk9fREFUQV9URVhUX1dJVEhfRklMVEVSXCI7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBzRmlsdGVyQXNzb2NpYXRpb24gPSBvVGFibGUuZ2V0RmlsdGVyKCk7XG5cblx0XHRpZiAoc0ZpbHRlckFzc29jaWF0aW9uICYmICEvQmFzaWNTZWFyY2gkLy50ZXN0KHNGaWx0ZXJBc3NvY2lhdGlvbikpIHtcblx0XHRcdC8vIGNoZWNrIGlmIGEgRmlsdGVyQmFyIGlzIGFzc29jaWF0ZWQgdG8gdGhlIFRhYmxlIChiYXNpYyBzZWFyY2ggb24gdG9vbEJhciBpcyBleGNsdWRlZClcblx0XHRcdGlmIChvVGFibGVGaWx0ZXJJbmZvLnNlYXJjaCB8fCAob1RhYmxlRmlsdGVySW5mby5maWx0ZXJzICYmIG9UYWJsZUZpbHRlckluZm8uZmlsdGVycy5sZW5ndGgpKSB7XG5cdFx0XHRcdC8vIGNoZWNrIGlmIHRhYmxlIGhhcyBhbnkgRmlsdGVyYmFyIGZpbHRlcnMgb3IgcGVyc29uYWxpemF0aW9uIGZpbHRlcnNcblx0XHRcdFx0c05vRGF0YUtleSA9IF9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNOb0RhdGFLZXkgPSBcIlRfVEFCTEVfQU5EX0NIQVJUX05PX0RBVEFfVEVYVFwiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAob1RhYmxlRmlsdGVySW5mby5zZWFyY2ggfHwgKG9UYWJsZUZpbHRlckluZm8uZmlsdGVycyAmJiBvVGFibGVGaWx0ZXJJbmZvLmZpbHRlcnMubGVuZ3RoKSkge1xuXHRcdFx0Ly9jaGVjayBpZiB0YWJsZSBoYXMgYW55IHBlcnNvbmFsaXphdGlvbiBmaWx0ZXJzXG5cdFx0XHRzTm9EYXRhS2V5ID0gX2dldE5vRGF0YVRleHRXaXRoRmlsdGVycygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzTm9EYXRhS2V5ID0gXCJNX1RBQkxFX0FORF9DSEFSVF9OT19GSUxURVJTX05PX0RBVEFfVEVYVFwiO1xuXHRcdH1cblx0XHRyZXR1cm4gb1RhYmxlXG5cdFx0XHQuZ2V0TW9kZWwoXCJzYXAuZmUuaTE4blwiKVxuXHRcdFx0LmdldFJlc291cmNlQnVuZGxlKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChvUmVzb3VyY2VCdW5kbGU6IGFueSkge1xuXHRcdFx0XHRvVGFibGUuc2V0Tm9EYXRhKENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KHNOb0RhdGFLZXksIG9SZXNvdXJjZUJ1bmRsZSwgdW5kZWZpbmVkLCBzdWZmaXhSZXNvdXJjZUtleSkpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0sXG5cblx0aGFuZGxlVGFibGVEYXRhUmVjZWl2ZWQ6IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0ludGVybmFsTW9kZWxDb250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvQmluZGluZyA9IG9UYWJsZSAmJiBvVGFibGUuZ2V0Um93QmluZGluZygpLFxuXHRcdFx0YkRhdGFSZWNlaXZlZEF0dGFjaGVkID0gb0ludGVybmFsTW9kZWxDb250ZXh0ICYmIG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcImRhdGFSZWNlaXZlZEF0dGFjaGVkXCIpO1xuXG5cdFx0aWYgKG9JbnRlcm5hbE1vZGVsQ29udGV4dCAmJiAhYkRhdGFSZWNlaXZlZEF0dGFjaGVkKSB7XG5cdFx0XHRvQmluZGluZy5hdHRhY2hEYXRhUmVjZWl2ZWQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvLyBSZWZyZXNoIHRoZSBzZWxlY3RlZCBjb250ZXh0cyB0byB0cmlnZ2VyIHJlLWNhbGN1bGF0aW9uIG9mIGVuYWJsZWQgc3RhdGUgb2YgYWN0aW9ucy5cblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwic2VsZWN0ZWRDb250ZXh0c1wiLCBbXSk7XG5cdFx0XHRcdGNvbnN0IGFTZWxlY3RlZENvbnRleHRzID0gb1RhYmxlLmdldFNlbGVjdGVkQ29udGV4dHMoKTtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwic2VsZWN0ZWRDb250ZXh0c1wiLCBhU2VsZWN0ZWRDb250ZXh0cyk7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1wiLCBhU2VsZWN0ZWRDb250ZXh0cy5sZW5ndGgpO1xuXHRcdFx0XHRjb25zdCBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gSlNPTi5wYXJzZShcblx0XHRcdFx0XHRDb21tb25IZWxwZXIucGFyc2VDdXN0b21EYXRhKERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJvcGVyYXRpb25BdmFpbGFibGVNYXBcIikpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChvSW50ZXJuYWxNb2RlbENvbnRleHQsIG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAsIGFTZWxlY3RlZENvbnRleHRzLCBcInRhYmxlXCIpO1xuXHRcdFx0XHQvLyBSZWZyZXNoIGVuYWJsZW1lbnQgb2YgZGVsZXRlIGJ1dHRvblxuXHRcdFx0XHREZWxldGVIZWxwZXIudXBkYXRlRGVsZXRlSW5mb0ZvclNlbGVjdGVkQ29udGV4dHMob0ludGVybmFsTW9kZWxDb250ZXh0LCBhU2VsZWN0ZWRDb250ZXh0cyk7XG5cdFx0XHRcdGNvbnN0IG9UYWJsZUFQSSA9IG9UYWJsZSA/IG9UYWJsZS5nZXRQYXJlbnQoKSA6IG51bGw7XG5cdFx0XHRcdGlmIChvVGFibGVBUEkpIHtcblx0XHRcdFx0XHRvVGFibGVBUEkuc2V0VXBFbXB0eVJvd3Mob1RhYmxlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJkYXRhUmVjZWl2ZWRBdHRhY2hlZFwiLCB0cnVlKTtcblx0XHR9XG5cdH0sXG5cblx0cmViaW5kOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55KTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBvVGFibGVBUEkgPSBvVGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEk7XG5cdFx0Y29uc3QgYklzU3VzcGVuZGVkID0gb1RhYmxlQVBJPy5nZXRQcm9wZXJ0eShcImJpbmRpbmdTdXNwZW5kZWRcIik7XG5cdFx0b1RhYmxlQVBJPy5zZXRQcm9wZXJ0eShcIm91dERhdGVkQmluZGluZ1wiLCBiSXNTdXNwZW5kZWQpO1xuXHRcdGlmICghYklzU3VzcGVuZGVkKSB7XG5cdFx0XHRUYWJsZVV0aWxzLmNsZWFyU2VsZWN0aW9uKG9UYWJsZSk7XG5cdFx0XHRUYWJsZURlbGVnYXRlQmFzZS5yZWJpbmQuYXBwbHkodGhpcywgW29UYWJsZSwgb0JpbmRpbmdJbmZvXSk7XG5cdFx0XHRUYWJsZVV0aWxzLm9uVGFibGVCb3VuZChvVGFibGUpO1xuXHRcdFx0dGhpcy5fc2V0VGFibGVOb0RhdGFUZXh0KG9UYWJsZSwgb0JpbmRpbmdJbmZvKTtcblx0XHRcdHJldHVybiBUYWJsZVV0aWxzLndoZW5Cb3VuZChvVGFibGUpXG5cdFx0XHRcdC50aGVuKHRoaXMuaGFuZGxlVGFibGVEYXRhUmVjZWl2ZWQob1RhYmxlLCBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSkpXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSB3YWl0aW5nIGZvciB0aGUgdGFibGUgdG8gYmUgYm91bmRcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fSxcblxuXHQvKipcblx0ICogRmV0Y2hlcyB0aGUgcmVsZXZhbnQgbWV0YWRhdGEgZm9yIHRoZSB0YWJsZSBhbmQgcmV0dXJucyBwcm9wZXJ0eSBpbmZvIGFycmF5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdGFibGUgSW5zdGFuY2Ugb2YgdGhlIE1EQ3RhYmxlXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIHByb3BlcnR5IGluZm9cblx0ICovXG5cdGZldGNoUHJvcGVydGllczogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSkge1xuXHRcdHJldHVybiBEZWxlZ2F0ZVV0aWwuZmV0Y2hNb2RlbCh0YWJsZSlcblx0XHRcdC50aGVuKChtb2RlbCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoXG5cdFx0XHRcdFx0dGFibGUsXG5cdFx0XHRcdFx0RGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEodGFibGUsIFwiZW50aXR5VHlwZVwiKSxcblx0XHRcdFx0XHRtb2RlbC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0XHQpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKChwcm9wZXJ0aWVzKSA9PiB7XG5cdFx0XHRcdCh0YWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIFY0Q29udGV4dCkuc2V0UHJvcGVydHkoXCJ0YWJsZVByb3BlcnRpZXNBdmFpbGFibGVcIiwgdHJ1ZSk7XG5cdFx0XHRcdHJldHVybiBwcm9wZXJ0aWVzO1xuXHRcdFx0fSk7XG5cdH0sXG5cblx0cHJlSW5pdDogZnVuY3Rpb24gKG9UYWJsZTogVGFibGUpIHtcblx0XHRyZXR1cm4gVGFibGVEZWxlZ2F0ZUJhc2UucHJlSW5pdC5hcHBseSh0aGlzLCBbb1RhYmxlXSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIFNldCB0aGUgYmluZGluZyBjb250ZXh0IHRvIG51bGwgZm9yIGV2ZXJ5IGZhc3QgY3JlYXRpb24gcm93IHRvIGF2b2lkIGl0IGluaGVyaXRpbmdcblx0XHRcdCAqIHRoZSB3cm9uZyBjb250ZXh0IGFuZCByZXF1ZXN0aW5nIHRoZSB0YWJsZSBjb2x1bW5zIG9uIHRoZSBwYXJlbnQgZW50aXR5XG5cdFx0XHQgKiBTZXQgdGhlIGNvcnJlY3QgYmluZGluZyBjb250ZXh0IGluIE9iamVjdFBhZ2VDb250cm9sbGVyLmVuYWJsZUZhc3RDcmVhdGlvblJvdygpXG5cdFx0XHQgKi9cblx0XHRcdGNvbnN0IG9GYXN0Q3JlYXRpb25Sb3cgPSBvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKTtcblx0XHRcdGlmIChvRmFzdENyZWF0aW9uUm93KSB7XG5cdFx0XHRcdG9GYXN0Q3JlYXRpb25Sb3cuc2V0QmluZGluZ0NvbnRleHQobnVsbCBhcyBhbnkgYXMgQ29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdHVwZGF0ZUJpbmRpbmdJbmZvOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55KSB7XG5cdFx0VGFibGVEZWxlZ2F0ZUJhc2UudXBkYXRlQmluZGluZ0luZm8uYXBwbHkodGhpcywgW29UYWJsZSwgb0JpbmRpbmdJbmZvXSk7XG5cdFx0dGhpcy5faW50ZXJuYWxVcGRhdGVCaW5kaW5nSW5mbyhvVGFibGUsIG9CaW5kaW5nSW5mbyk7XG5cdFx0b0JpbmRpbmdJbmZvLmV2ZW50cy5kYXRhUmVjZWl2ZWQgPSBvVGFibGUuZ2V0UGFyZW50KCkub25JbnRlcm5hbERhdGFSZWNlaXZlZC5iaW5kKG9UYWJsZS5nZXRQYXJlbnQoKSk7XG5cdFx0b0JpbmRpbmdJbmZvLmV2ZW50cy5kYXRhUmVxdWVzdGVkID0gb1RhYmxlLmdldFBhcmVudCgpLm9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkLmJpbmQob1RhYmxlLmdldFBhcmVudCgpKTtcblx0XHR0aGlzLl9zZXRUYWJsZU5vRGF0YVRleHQob1RhYmxlLCBvQmluZGluZ0luZm8pO1xuXHR9LFxuXG5cdF9tYW5hZ2VTZW1hbnRpY1RhcmdldHM6IGZ1bmN0aW9uIChvTURDVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0gb01EQ1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRpZiAob1Jvd0JpbmRpbmcpIHtcblx0XHRcdG9Sb3dCaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZXF1ZXN0ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjb25zdCBfb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9NRENUYWJsZSk7XG5cdFx0XHRcdFx0aWYgKF9vVmlldykge1xuXHRcdFx0XHRcdFx0VGFibGVVdGlscy5nZXRTZW1hbnRpY1RhcmdldHNGcm9tVGFibGUoX29WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlciwgb01EQ1RhYmxlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXG5cdHVwZGF0ZUJpbmRpbmc6IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnksIG9CaW5kaW5nOiBhbnkpIHtcblx0XHRjb25zdCBvVGFibGVBUEkgPSBvVGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEk7XG5cdFx0Y29uc3QgYklzU3VzcGVuZGVkID0gb1RhYmxlQVBJPy5nZXRQcm9wZXJ0eShcImJpbmRpbmdTdXNwZW5kZWRcIik7XG5cdFx0aWYgKCFiSXNTdXNwZW5kZWQpIHtcblx0XHRcdGxldCBiTmVlZE1hbnVhbFJlZnJlc2ggPSBmYWxzZTtcblx0XHRcdGNvbnN0IF9vVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1RhYmxlKTtcblx0XHRcdGNvbnN0IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0XHRjb25zdCBzTWFudWFsVXBkYXRlUHJvcGVydHlLZXkgPSBcInBlbmRpbmdNYW51YWxCaW5kaW5nVXBkYXRlXCI7XG5cdFx0XHRjb25zdCBiUGVuZGluZ01hbnVhbFVwZGF0ZSA9IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LmdldFByb3BlcnR5KHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSk7XG5cdFx0XHRjb25zdCBvUm93QmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cblx0XHRcdGlmIChvUm93QmluZGluZykge1xuXHRcdFx0XHQvKipcblx0XHRcdFx0ICogTWFudWFsIHJlZnJlc2ggaWYgZmlsdGVycyBhcmUgbm90IGNoYW5nZWQgYnkgYmluZGluZy5yZWZyZXNoKCkgc2luY2UgdXBkYXRpbmcgdGhlIGJpbmRpbmdJbmZvXG5cdFx0XHRcdCAqIGlzIG5vdCBlbm91Z2ggdG8gdHJpZ2dlciBhIGJhdGNoIHJlcXVlc3QuXG5cdFx0XHRcdCAqIFJlbW92aW5nIGNvbHVtbnMgY3JlYXRlcyBvbmUgYmF0Y2ggcmVxdWVzdCB0aGF0IHdhcyBub3QgZXhlY3V0ZWQgYmVmb3JlXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRjb25zdCBvbGRGaWx0ZXJzID0gb1Jvd0JpbmRpbmcuZ2V0RmlsdGVycyhcIkFwcGxpY2F0aW9uXCIpO1xuXHRcdFx0XHRiTmVlZE1hbnVhbFJlZnJlc2ggPVxuXHRcdFx0XHRcdGRlZXBFcXVhbChvQmluZGluZ0luZm8uZmlsdGVycywgb2xkRmlsdGVyc1swXSkgJiZcblx0XHRcdFx0XHRvUm93QmluZGluZy5nZXRRdWVyeU9wdGlvbnNGcm9tUGFyYW1ldGVycygpLiRzZWFyY2ggPT09IG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggJiZcblx0XHRcdFx0XHQhYlBlbmRpbmdNYW51YWxVcGRhdGUgJiZcblx0XHRcdFx0XHRfb1ZpZXcgJiZcblx0XHRcdFx0XHQoX29WaWV3LmdldFZpZXdEYXRhKCkgYXMgYW55KS5jb252ZXJ0ZXJUeXBlID09PSBcIkxpc3RSZXBvcnRcIjtcblx0XHRcdH1cblx0XHRcdFRhYmxlRGVsZWdhdGVCYXNlLnVwZGF0ZUJpbmRpbmcuYXBwbHkodGhpcywgW29UYWJsZSwgb0JpbmRpbmdJbmZvLCBvQmluZGluZ10pO1xuXHRcdFx0b1RhYmxlLmZpcmVFdmVudChcImJpbmRpbmdVcGRhdGVkXCIpO1xuXHRcdFx0aWYgKGJOZWVkTWFudWFsUmVmcmVzaCAmJiBvVGFibGUuZ2V0RmlsdGVyKCkgJiYgb0JpbmRpbmcpIHtcblx0XHRcdFx0b1Jvd0JpbmRpbmdcblx0XHRcdFx0XHQucmVxdWVzdFJlZnJlc2gob1Jvd0JpbmRpbmcuZ2V0R3JvdXBJZCgpKVxuXHRcdFx0XHRcdC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSwgZmFsc2UpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVmcmVzaGluZyB0aGUgdGFibGVcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0b0ludGVybmFsQmluZGluZ0NvbnRleHQuc2V0UHJvcGVydHkoc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5LCB0cnVlKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX21hbmFnZVNlbWFudGljVGFyZ2V0cyhvVGFibGUpO1xuXHRcdH1cblx0XHRvVGFibGVBUEk/LnNldFByb3BlcnR5KFwib3V0RGF0ZWRCaW5kaW5nXCIsIGJJc1N1c3BlbmRlZCk7XG5cdH0sXG5cblx0X2NvbXB1dGVSb3dCaW5kaW5nSW5mb0Zyb21UZW1wbGF0ZTogZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0Ly8gV2UgbmVlZCB0byBkZWVwQ2xvbmUgdGhlIGluZm8gd2UgZ2V0IGZyb20gdGhlIGN1c3RvbSBkYXRhLCBvdGhlcndpc2Ugc29tZSBvZiBpdHMgc3Vib2JqZWN0cyAoZS5nLiBwYXJhbWV0ZXJzKSB3aWxsXG5cdFx0Ly8gYmUgc2hhcmVkIHdpdGggb0JpbmRpbmdJbmZvIGFuZCBtb2RpZmllZCBsYXRlciAoT2JqZWN0LmFzc2lnbiBvbmx5IGRvZXMgYSBzaGFsbG93IGNsb25lKVxuXHRcdGNvbnN0IHJvd0JpbmRpbmdJbmZvID0gZGVlcENsb25lKERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJyb3dzQmluZGluZ0luZm9cIikpO1xuXHRcdC8vIGlmIHRoZSByb3dCaW5kaW5nSW5mbyBoYXMgYSAkJGdldEtlZXBBbGl2ZUNvbnRleHQgcGFyYW1ldGVyIHdlIG5lZWQgdG8gY2hlY2sgaXQgaXMgdGhlIG9ubHkgVGFibGUgd2l0aCBzdWNoIGFcblx0XHQvLyBwYXJhbWV0ZXIgZm9yIHRoZSBjb2xsZWN0aW9uTWV0YVBhdGhcblx0XHRpZiAocm93QmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGdldEtlZXBBbGl2ZUNvbnRleHQpIHtcblx0XHRcdGNvbnN0IGNvbGxlY3Rpb25QYXRoID0gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcInRhcmdldENvbGxlY3Rpb25QYXRoXCIpO1xuXHRcdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IG9UYWJsZS5nZXRNb2RlbChcImludGVybmFsXCIpO1xuXHRcdFx0Y29uc3Qga2VwdEFsaXZlTGlzdHMgPSBpbnRlcm5hbE1vZGVsLmdldE9iamVjdChcIi9rZXB0QWxpdmVMaXN0c1wiKSB8fCB7fTtcblx0XHRcdGlmICgha2VwdEFsaXZlTGlzdHNbY29sbGVjdGlvblBhdGhdKSB7XG5cdFx0XHRcdGtlcHRBbGl2ZUxpc3RzW2NvbGxlY3Rpb25QYXRoXSA9IG9UYWJsZS5nZXRJZCgpO1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL2tlcHRBbGl2ZUxpc3RzXCIsIGtlcHRBbGl2ZUxpc3RzKTtcblx0XHRcdH0gZWxzZSBpZiAoa2VwdEFsaXZlTGlzdHNbY29sbGVjdGlvblBhdGhdICE9PSBvVGFibGUuZ2V0SWQoKSkge1xuXHRcdFx0XHRkZWxldGUgcm93QmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGdldEtlZXBBbGl2ZUNvbnRleHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByb3dCaW5kaW5nSW5mbztcblx0fSxcblx0X2ludGVybmFsVXBkYXRlQmluZGluZ0luZm86IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRPYmplY3QuYXNzaWduKG9CaW5kaW5nSW5mbywgdGhpcy5fY29tcHV0ZVJvd0JpbmRpbmdJbmZvRnJvbVRlbXBsYXRlKG9UYWJsZSkpO1xuXHRcdC8qKlxuXHRcdCAqIEJpbmRpbmcgaW5mbyBtaWdodCBiZSBzdXNwZW5kZWQgYXQgdGhlIGJlZ2lubmluZyB3aGVuIHRoZSBmaXJzdCBiaW5kUm93cyBpcyBjYWxsZWQ6XG5cdFx0ICogVG8gYXZvaWQgZHVwbGljYXRlIHJlcXVlc3RzIGJ1dCBzdGlsbCBoYXZlIGEgYmluZGluZyB0byBjcmVhdGUgbmV3IGVudHJpZXMuXHRcdFx0XHQgKlxuXHRcdCAqIEFmdGVyIHRoZSBpbml0aWFsIGJpbmRpbmcgc3RlcCwgZm9sbG93IHVwIGJpbmRpbmdzIHNob3VsZCBub3QgbG9uZ2VyIGJlIHN1c3BlbmRlZC5cblx0XHQgKi9cblx0XHRpZiAob1RhYmxlLmdldFJvd0JpbmRpbmcoKSkge1xuXHRcdFx0b0JpbmRpbmdJbmZvLnN1c3BlbmRlZCA9IGZhbHNlO1xuXHRcdH1cblx0XHQvLyBUaGUgcHJldmlvdXNseSBhZGRlZCBoYW5kbGVyIGZvciB0aGUgZXZlbnQgJ2RhdGFSZWNlaXZlZCcgaXMgbm90IGFueW1vcmUgdGhlcmVcblx0XHQvLyBzaW5jZSB0aGUgYmluZGluZ0luZm8gaXMgcmVjcmVhdGVkIGZyb20gc2NyYXRjaCBzbyB3ZSBuZWVkIHRvIHNldCB0aGUgZmxhZyB0byBmYWxzZSBpbiBvcmRlclxuXHRcdC8vIHRvIGFnYWluIGFkZCB0aGUgaGFuZGxlciBvbiB0aGlzIGV2ZW50IGlmIG5lZWRlZFxuXHRcdGlmIChvSW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImRhdGFSZWNlaXZlZEF0dGFjaGVkXCIsIGZhbHNlKTtcblx0XHR9XG5cblx0XHRsZXQgb0ZpbHRlcjtcblx0XHRjb25zdCBvRmlsdGVySW5mbyA9IFRhYmxlVXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhvVGFibGUpO1xuXHRcdC8vIFByZXBhcmUgYmluZGluZyBpbmZvIHdpdGggZmlsdGVyL3NlYXJjaCBwYXJhbWV0ZXJzXG5cdFx0aWYgKG9GaWx0ZXJJbmZvLmZpbHRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0b0ZpbHRlciA9IG5ldyBGaWx0ZXIoeyBmaWx0ZXJzOiBvRmlsdGVySW5mby5maWx0ZXJzLCBhbmQ6IHRydWUgfSk7XG5cdFx0fVxuXHRcdGlmIChvRmlsdGVySW5mby5iaW5kaW5nUGF0aCkge1xuXHRcdFx0b0JpbmRpbmdJbmZvLnBhdGggPSBvRmlsdGVySW5mby5iaW5kaW5nUGF0aDtcblx0XHR9XG5cblx0XHRjb25zdCBvRGF0YVN0YXRlSW5kaWNhdG9yID0gb1RhYmxlLmdldERhdGFTdGF0ZUluZGljYXRvcigpO1xuXHRcdGlmIChvRGF0YVN0YXRlSW5kaWNhdG9yICYmIG9EYXRhU3RhdGVJbmRpY2F0b3IuaXNGaWx0ZXJpbmcoKSkge1xuXHRcdFx0Ly8gSW5jbHVkZSBmaWx0ZXJzIG9uIG1lc3NhZ2VTdHJpcFxuXHRcdFx0aWYgKG9CaW5kaW5nSW5mby5maWx0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0b0ZpbHRlciA9IG5ldyBGaWx0ZXIoeyBmaWx0ZXJzOiBvQmluZGluZ0luZm8uZmlsdGVycy5jb25jYXQob0ZpbHRlckluZm8uZmlsdGVycyksIGFuZDogdHJ1ZSB9KTtcblx0XHRcdFx0VGFibGVVdGlscy51cGRhdGVCaW5kaW5nSW5mbyhvQmluZGluZ0luZm8sIG9GaWx0ZXJJbmZvLCBvRmlsdGVyKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0VGFibGVVdGlscy51cGRhdGVCaW5kaW5nSW5mbyhvQmluZGluZ0luZm8sIG9GaWx0ZXJJbmZvLCBvRmlsdGVyKTtcblx0XHR9XG5cdH0sXG5cblx0X3RlbXBsYXRlQ3VzdG9tQ29sdW1uRnJhZ21lbnQ6IGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogVGFibGVDb2x1bW4sIG9WaWV3OiBhbnksIG9Nb2RpZmllcjogYW55LCBzVGFibGVJZDogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbHVtbk1vZGVsID0gbmV3IEpTT05Nb2RlbChvQ29sdW1uSW5mbyksXG5cdFx0XHRvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0XHRpZDogc1RhYmxlSWRcblx0XHRcdH0pLFxuXHRcdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHR0aGlzOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0Y29sdW1uOiBvQ29sdW1uTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdHRoaXM6IG9UaGlzLFxuXHRcdFx0XHRcdGNvbHVtbjogb0NvbHVtbk1vZGVsXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFxuXHRcdFx0XCJzYXAuZmUubWFjcm9zLnRhYmxlLkN1c3RvbUNvbHVtblwiLFxuXHRcdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzLFxuXHRcdFx0eyB2aWV3OiBvVmlldyB9LFxuXHRcdFx0b01vZGlmaWVyXG5cdFx0KS50aGVuKGZ1bmN0aW9uIChvSXRlbTogYW55KSB7XG5cdFx0XHRvQ29sdW1uTW9kZWwuZGVzdHJveSgpO1xuXHRcdFx0cmV0dXJuIG9JdGVtO1xuXHRcdH0pO1xuXHR9LFxuXG5cdF90ZW1wbGF0ZVNsb3RDb2x1bW5GcmFnbWVudDogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdG9Db2x1bW5JbmZvOiBDdXN0b21FbGVtZW50PEN1c3RvbUJhc2VkVGFibGVDb2x1bW4+LFxuXHRcdG9WaWV3OiBhbnksXG5cdFx0b01vZGlmaWVyOiBhbnksXG5cdFx0c1RhYmxlSWQ6IGFueVxuXHQpIHtcblx0XHRjb25zdCBvQ29sdW1uTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG9Db2x1bW5JbmZvKSxcblx0XHRcdG9UaGlzID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdGlkOiBzVGFibGVJZFxuXHRcdFx0fSksXG5cdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSxcblx0XHRcdFx0XHRjb2x1bW46IG9Db2x1bW5Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdFx0fSxcblx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHRcdFx0Y29sdW1uOiBvQ29sdW1uTW9kZWxcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRjb25zdCBzbG90Q29sdW1uc1hNTCA9IChhd2FpdCBEZWxlZ2F0ZVV0aWwudGVtcGxhdGVDb250cm9sRnJhZ21lbnQoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlNsb3RDb2x1bW5cIiwgb1ByZXByb2Nlc3NvclNldHRpbmdzLCB7XG5cdFx0XHRpc1hNTDogdHJ1ZVxuXHRcdH0pKSBhcyBFbGVtZW50O1xuXHRcdGlmICghc2xvdENvbHVtbnNYTUwpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXHRcdGNvbnN0IHNsb3RYTUwgPSBzbG90Q29sdW1uc1hNTC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNsb3RcIilbMF0sXG5cdFx0XHRtZGNUYWJsZVRlbXBsYXRlWE1MID0gc2xvdENvbHVtbnNYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJtZGNUYWJsZTp0ZW1wbGF0ZVwiKVswXTtcblx0XHRtZGNUYWJsZVRlbXBsYXRlWE1MLnJlbW92ZUNoaWxkKHNsb3RYTUwpO1xuXHRcdGlmIChvQ29sdW1uSW5mby50ZW1wbGF0ZSkge1xuXHRcdFx0Y29uc3Qgb1RlbXBsYXRlID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhvQ29sdW1uSW5mby50ZW1wbGF0ZSwgXCJ0ZXh0L3htbFwiKTtcblx0XHRcdG1kY1RhYmxlVGVtcGxhdGVYTUwuYXBwZW5kQ2hpbGQob1RlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkISk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdExvZy5lcnJvcihgUGxlYXNlIHByb3ZpZGUgY29udGVudCBpbnNpZGUgdGhpcyBCdWlsZGluZyBCbG9jayBDb2x1bW46ICR7b0NvbHVtbkluZm8uaGVhZGVyfWApO1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cdFx0aWYgKG9Nb2RpZmllci50YXJnZXRzICE9PSBcImpzQ29udHJvbFRyZWVcIikge1xuXHRcdFx0cmV0dXJuIHNsb3RDb2x1bW5zWE1MO1xuXHRcdH1cblx0XHRyZXR1cm4gRnJhZ21lbnQubG9hZCh7XG5cdFx0XHR0eXBlOiBcIlhNTFwiLFxuXHRcdFx0ZGVmaW5pdGlvbjogc2xvdENvbHVtbnNYTUxcblx0XHR9KTtcblx0fSxcblxuXHRfZ2V0RXhwb3J0Rm9ybWF0OiBmdW5jdGlvbiAoZGF0YVR5cGU6IGFueSkge1xuXHRcdHN3aXRjaCAoZGF0YVR5cGUpIHtcblx0XHRcdGNhc2UgXCJFZG0uRGF0ZVwiOlxuXHRcdFx0XHRyZXR1cm4gRXhjZWxGb3JtYXQuZ2V0RXhjZWxEYXRlZnJvbUpTRGF0ZSgpO1xuXHRcdFx0Y2FzZSBcIkVkbS5EYXRlVGltZU9mZnNldFwiOlxuXHRcdFx0XHRyZXR1cm4gRXhjZWxGb3JtYXQuZ2V0RXhjZWxEYXRlVGltZWZyb21KU0RhdGVUaW1lKCk7XG5cdFx0XHRjYXNlIFwiRWRtLlRpbWVPZkRheVwiOlxuXHRcdFx0XHRyZXR1cm4gRXhjZWxGb3JtYXQuZ2V0RXhjZWxUaW1lZnJvbUpTVGltZSgpO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0sXG5cblx0X2dldFZIUmVsZXZhbnRGaWVsZHM6IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBhbnksIHNNZXRhZGF0YVBhdGg6IGFueSwgc0JpbmRpbmdQYXRoPzogYW55KSB7XG5cdFx0bGV0IGFGaWVsZHM6IGFueVtdID0gW10sXG5cdFx0XHRvRGF0YUZpZWxkRGF0YSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNNZXRhZGF0YVBhdGgpO1xuXG5cdFx0aWYgKG9EYXRhRmllbGREYXRhLiRraW5kICYmIG9EYXRhRmllbGREYXRhLiRraW5kID09PSBcIlByb3BlcnR5XCIpIHtcblx0XHRcdG9EYXRhRmllbGREYXRhID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFkYXRhUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRGVmYXVsdGApO1xuXHRcdFx0c01ldGFkYXRhUGF0aCA9IGAke3NNZXRhZGF0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZERlZmF1bHRgO1xuXHRcdH1cblx0XHRzd2l0Y2ggKG9EYXRhRmllbGREYXRhLiRUeXBlKSB7XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiOlxuXHRcdFx0XHRpZiAob01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFkYXRhUGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aGApLmluY2x1ZGVzKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cFwiKSkge1xuXHRcdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhZGF0YVBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGgvRGF0YWApLmZvckVhY2goKG9WYWx1ZTogYW55LCBpSW5kZXg6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0YUZpZWxkcyA9IGFGaWVsZHMuY29uY2F0KFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9nZXRWSFJlbGV2YW50RmllbGRzKG9NZXRhTW9kZWwsIGAke3NNZXRhZGF0YVBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGgvRGF0YS8ke2lJbmRleH1gKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvblwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb25cIjpcblx0XHRcdFx0YUZpZWxkcy5wdXNoKG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhZGF0YVBhdGh9L1ZhbHVlLyRQYXRoYCkpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjpcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBwcm9wZXJ0eVxuXHRcdFx0XHQvLyB0ZW1wb3Jhcnkgd29ya2Fyb3VuZCB0byBtYWtlIHN1cmUgVkggcmVsZXZhbnQgZmllbGQgcGF0aCBkbyBub3QgY29udGFpbiB0aGUgYmluZGluZ3BhdGhcblx0XHRcdFx0aWYgKHNNZXRhZGF0YVBhdGguaW5kZXhPZihzQmluZGluZ1BhdGgpID09PSAwKSB7XG5cdFx0XHRcdFx0YUZpZWxkcy5wdXNoKHNNZXRhZGF0YVBhdGguc3Vic3RyaW5nKHNCaW5kaW5nUGF0aC5sZW5ndGggKyAxKSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0YUZpZWxkcy5wdXNoKENvbW1vbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChzTWV0YWRhdGFQYXRoLCB0cnVlKSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gYUZpZWxkcztcblx0fSxcblx0X3NldERyYWZ0SW5kaWNhdG9yT25WaXNpYmxlQ29sdW1uOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIGFDb2x1bW5zOiBhbnksIG9Db2x1bW5JbmZvOiBhbnkpIHtcblx0XHRjb25zdCBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCA9IG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGlmICghb0ludGVybmFsQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3Qgc0ludGVybmFsUGF0aCA9IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LmdldFBhdGgoKTtcblx0XHRjb25zdCBhQ29sdW1uc1dpdGhEcmFmdEluZGljYXRvciA9IGFDb2x1bW5zLmZpbHRlcigob0NvbHVtbjogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYkNvbHVtbkhhc1Byb3BlcnR5V2l0aERyYWZ0SW5kaWNhdG9yKG9Db2x1bW4pO1xuXHRcdH0pO1xuXHRcdGNvbnN0IGFWaXNpYmxlQ29sdW1ucyA9IG9UYWJsZS5nZXRDb2x1bW5zKCk7XG5cdFx0bGV0IHNBZGRWaXNpYmxlQ29sdW1uTmFtZSwgc1Zpc2libGVDb2x1bW5OYW1lLCBiRm91bmRDb2x1bW5WaXNpYmxlV2l0aERyYWZ0LCBzQ29sdW1uTmFtZVdpdGhEcmFmdEluZGljYXRvcjtcblx0XHRmb3IgKGNvbnN0IGkgaW4gYVZpc2libGVDb2x1bW5zKSB7XG5cdFx0XHRzVmlzaWJsZUNvbHVtbk5hbWUgPSBhVmlzaWJsZUNvbHVtbnNbaV0uZ2V0RGF0YVByb3BlcnR5KCk7XG5cdFx0XHRmb3IgKGNvbnN0IGogaW4gYUNvbHVtbnNXaXRoRHJhZnRJbmRpY2F0b3IpIHtcblx0XHRcdFx0c0NvbHVtbk5hbWVXaXRoRHJhZnRJbmRpY2F0b3IgPSBhQ29sdW1uc1dpdGhEcmFmdEluZGljYXRvcltqXS5uYW1lO1xuXHRcdFx0XHRpZiAoc1Zpc2libGVDb2x1bW5OYW1lID09PSBzQ29sdW1uTmFtZVdpdGhEcmFmdEluZGljYXRvcikge1xuXHRcdFx0XHRcdGJGb3VuZENvbHVtblZpc2libGVXaXRoRHJhZnQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvQ29sdW1uSW5mbyAmJiBvQ29sdW1uSW5mby5uYW1lID09PSBzQ29sdW1uTmFtZVdpdGhEcmFmdEluZGljYXRvcikge1xuXHRcdFx0XHRcdHNBZGRWaXNpYmxlQ29sdW1uTmFtZSA9IG9Db2x1bW5JbmZvLm5hbWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChiRm91bmRDb2x1bW5WaXNpYmxlV2l0aERyYWZ0KSB7XG5cdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IsIHNWaXNpYmxlQ29sdW1uTmFtZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWJGb3VuZENvbHVtblZpc2libGVXaXRoRHJhZnQgJiYgc0FkZFZpc2libGVDb2x1bW5OYW1lKSB7XG5cdFx0XHRvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxQYXRoICsgU0VNQU5USUNLRVlfSEFTX0RSQUZUSU5ESUNBVE9SLCBzQWRkVmlzaWJsZUNvbHVtbk5hbWUpO1xuXHRcdH1cblx0fSxcblx0cmVtb3ZlSXRlbTogZnVuY3Rpb24gKG9Qcm9wZXJ0eUluZm9OYW1lOiBhbnksIG9UYWJsZTogYW55LCBtUHJvcGVydHlCYWc6IGFueSkge1xuXHRcdGxldCBkb1JlbW92ZUl0ZW0gPSB0cnVlO1xuXHRcdGlmICghb1Byb3BlcnR5SW5mb05hbWUpIHtcblx0XHRcdC8vIDEuIEFwcGxpY2F0aW9uIHJlbW92ZWQgdGhlIHByb3BlcnR5IGZyb20gdGhlaXIgZGF0YSBtb2RlbFxuXHRcdFx0Ly8gMi4gYWRkSXRlbSBmYWlsZWQgYmVmb3JlIHJldmVydERhdGEgY3JlYXRlZFxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShkb1JlbW92ZUl0ZW0pO1xuXHRcdH1cblx0XHRjb25zdCBvTW9kaWZpZXIgPSBtUHJvcGVydHlCYWcubW9kaWZpZXI7XG5cdFx0Y29uc3Qgc0RhdGFQcm9wZXJ0eSA9IG9Nb2RpZmllci5nZXRQcm9wZXJ0eShvUHJvcGVydHlJbmZvTmFtZSwgXCJkYXRhUHJvcGVydHlcIik7XG5cdFx0aWYgKHNEYXRhUHJvcGVydHkgJiYgc0RhdGFQcm9wZXJ0eS5pbmRleE9mICYmIHNEYXRhUHJvcGVydHkuaW5kZXhPZihcIklubGluZVhNTFwiKSAhPT0gLTEpIHtcblx0XHRcdG9Nb2RpZmllci5pbnNlcnRBZ2dyZWdhdGlvbihvVGFibGUsIFwiZGVwZW5kZW50c1wiLCBvUHJvcGVydHlJbmZvTmFtZSk7XG5cdFx0XHRkb1JlbW92ZUl0ZW0gPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKG9UYWJsZS5pc0EgJiYgb01vZGlmaWVyLnRhcmdldHMgPT09IFwianNDb250cm9sVHJlZVwiKSB7XG5cdFx0XHR0aGlzLl9zZXREcmFmdEluZGljYXRvclN0YXR1cyhvTW9kaWZpZXIsIG9UYWJsZSwgdGhpcy5nZXRDb2x1bW5zRm9yKG9UYWJsZSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRvUmVtb3ZlSXRlbSk7XG5cdH0sXG5cdF9nZXRNZXRhTW9kZWw6IGZ1bmN0aW9uIChtUHJvcGVydHlCYWc6IGFueSkge1xuXHRcdHJldHVybiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0fSxcblx0X3NldERyYWZ0SW5kaWNhdG9yU3RhdHVzOiBmdW5jdGlvbiAob01vZGlmaWVyOiBhbnksIG9UYWJsZTogYW55LCBhQ29sdW1uczogYW55LCBvQ29sdW1uSW5mbz86IGFueSkge1xuXHRcdGlmIChvTW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJqc0NvbnRyb2xUcmVlXCIpIHtcblx0XHRcdHRoaXMuX3NldERyYWZ0SW5kaWNhdG9yT25WaXNpYmxlQ29sdW1uKG9UYWJsZSwgYUNvbHVtbnMsIG9Db2x1bW5JbmZvKTtcblx0XHR9XG5cdH0sXG5cdF9nZXRHcm91cElkOiBmdW5jdGlvbiAoc1JldHJpZXZlZEdyb3VwSWQ6IGFueSkge1xuXHRcdHJldHVybiBzUmV0cmlldmVkR3JvdXBJZCB8fCB1bmRlZmluZWQ7XG5cdH0sXG5cdF9nZXREZXBlbmRlbnQ6IGZ1bmN0aW9uIChvRGVwZW5kZW50OiBhbnksIHNQcm9wZXJ0eUluZm9OYW1lOiBhbnksIHNEYXRhUHJvcGVydHk6IGFueSkge1xuXHRcdGlmIChzUHJvcGVydHlJbmZvTmFtZSA9PT0gc0RhdGFQcm9wZXJ0eSkge1xuXHRcdFx0cmV0dXJuIG9EZXBlbmRlbnQ7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cdF9mblRlbXBsYXRlVmFsdWVIZWxwOiBmdW5jdGlvbiAoZm5UZW1wbGF0ZVZhbHVlSGVscDogYW55LCBiVmFsdWVIZWxwUmVxdWlyZWQ6IGFueSwgYlZhbHVlSGVscEV4aXN0czogYW55KSB7XG5cdFx0aWYgKGJWYWx1ZUhlbHBSZXF1aXJlZCAmJiAhYlZhbHVlSGVscEV4aXN0cykge1xuXHRcdFx0cmV0dXJuIGZuVGVtcGxhdGVWYWx1ZUhlbHAoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlZhbHVlSGVscFwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9LFxuXHRfZ2V0RGlzcGxheU1vZGU6IGZ1bmN0aW9uIChiRGlzcGxheU1vZGU6IGFueSkge1xuXHRcdGxldCBjb2x1bW5FZGl0TW9kZTtcblx0XHRpZiAoYkRpc3BsYXlNb2RlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGJEaXNwbGF5TW9kZSA9IHR5cGVvZiBiRGlzcGxheU1vZGUgPT09IFwiYm9vbGVhblwiID8gYkRpc3BsYXlNb2RlIDogYkRpc3BsYXlNb2RlID09PSBcInRydWVcIjtcblx0XHRcdGNvbHVtbkVkaXRNb2RlID0gYkRpc3BsYXlNb2RlID8gXCJEaXNwbGF5XCIgOiBcIkVkaXRhYmxlXCI7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRkaXNwbGF5bW9kZTogYkRpc3BsYXlNb2RlLFxuXHRcdFx0XHRjb2x1bW5FZGl0TW9kZTogY29sdW1uRWRpdE1vZGVcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHRkaXNwbGF5bW9kZTogdW5kZWZpbmVkLFxuXHRcdFx0Y29sdW1uRWRpdE1vZGU6IHVuZGVmaW5lZFxuXHRcdH07XG5cdH0sXG5cdF9pbnNlcnRBZ2dyZWdhdGlvbjogZnVuY3Rpb24gKG9WYWx1ZUhlbHA6IGFueSwgb01vZGlmaWVyOiBhbnksIG9UYWJsZTogYW55KSB7XG5cdFx0aWYgKG9WYWx1ZUhlbHApIHtcblx0XHRcdHJldHVybiBvTW9kaWZpZXIuaW5zZXJ0QWdncmVnYXRpb24ob1RhYmxlLCBcImRlcGVuZGVudHNcIiwgb1ZhbHVlSGVscCwgMCk7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cdC8qKlxuXHQgKiBJbnZva2VkIHdoZW4gYSBjb2x1bW4gaXMgYWRkZWQgdXNpbmcgdGhlIHRhYmxlIHBlcnNvbmFsaXphdGlvbiBkaWFsb2cuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJvcGVydHlJbmZvTmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSBmb3Igd2hpY2ggdGhlIGNvbHVtbiBpcyBhZGRlZFxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIHRhYmxlIGNvbnRyb2xcblx0ICogQHBhcmFtIG1Qcm9wZXJ0eUJhZyBJbnN0YW5jZSBvZiBwcm9wZXJ0eSBiYWcgZnJvbSB0aGUgZmxleGliaWxpdHkgQVBJXG5cdCAqIEByZXR1cm5zIE9uY2UgcmVzb2x2ZWQsIGEgdGFibGUgY29sdW1uIGRlZmluaXRpb24gaXMgcmV0dXJuZWRcblx0ICovXG5cdGFkZEl0ZW06IGFzeW5jIGZ1bmN0aW9uIChzUHJvcGVydHlJbmZvTmFtZTogc3RyaW5nLCBvVGFibGU6IGFueSwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gdGhpcy5fZ2V0TWV0YU1vZGVsKG1Qcm9wZXJ0eUJhZyksXG5cdFx0XHRvTW9kaWZpZXIgPSBtUHJvcGVydHlCYWcubW9kaWZpZXIsXG5cdFx0XHRzVGFibGVJZCA9IG9Nb2RpZmllci5nZXRJZChvVGFibGUpLFxuXHRcdFx0YUNvbHVtbnMgPSBvVGFibGUuaXNBID8gdGhpcy5nZXRDb2x1bW5zRm9yKG9UYWJsZSkgOiBudWxsO1xuXHRcdGlmICghYUNvbHVtbnMpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb0NvbHVtbkluZm8gPSBhQ29sdW1ucy5maW5kKGZ1bmN0aW9uIChvQ29sdW1uKSB7XG5cdFx0XHRyZXR1cm4gb0NvbHVtbi5uYW1lID09PSBzUHJvcGVydHlJbmZvTmFtZTtcblx0XHR9KTtcblx0XHRpZiAoIW9Db2x1bW5JbmZvKSB7XG5cdFx0XHRMb2cuZXJyb3IoYCR7c1Byb3BlcnR5SW5mb05hbWV9IG5vdCBmb3VuZCB3aGlsZSBhZGRpbmcgY29sdW1uYCk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblx0XHR0aGlzLl9zZXREcmFmdEluZGljYXRvclN0YXR1cyhvTW9kaWZpZXIsIG9UYWJsZSwgYUNvbHVtbnMsIG9Db2x1bW5JbmZvKTtcblx0XHQvLyByZW5kZXIgY3VzdG9tIGNvbHVtblxuXHRcdGlmIChvQ29sdW1uSW5mby50eXBlID09PSBcIkRlZmF1bHRcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3RlbXBsYXRlQ3VzdG9tQ29sdW1uRnJhZ21lbnQob0NvbHVtbkluZm8sIG1Qcm9wZXJ0eUJhZy52aWV3LCBvTW9kaWZpZXIsIHNUYWJsZUlkKTtcblx0XHR9XG5cblx0XHRpZiAob0NvbHVtbkluZm8udHlwZSA9PT0gXCJTbG90XCIpIHtcblx0XHRcdHJldHVybiB0aGlzLl90ZW1wbGF0ZVNsb3RDb2x1bW5GcmFnbWVudChcblx0XHRcdFx0b0NvbHVtbkluZm8gYXMgQ3VzdG9tRWxlbWVudDxDdXN0b21CYXNlZFRhYmxlQ29sdW1uPixcblx0XHRcdFx0bVByb3BlcnR5QmFnLnZpZXcsXG5cdFx0XHRcdG9Nb2RpZmllcixcblx0XHRcdFx0c1RhYmxlSWRcblx0XHRcdCk7XG5cdFx0fVxuXHRcdC8vIGZhbGwtYmFja1xuXHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cblx0XHRjb25zdCBzUGF0aDogc3RyaW5nID0gYXdhaXQgRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcIm1ldGFQYXRoXCIsIG9Nb2RpZmllcik7XG5cdFx0Y29uc3Qgc0VudGl0eVR5cGVQYXRoOiBzdHJpbmcgPSBhd2FpdCBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwiZW50aXR5VHlwZVwiLCBvTW9kaWZpZXIpO1xuXHRcdGNvbnN0IHNSZXRyaWV2ZWRHcm91cElkID0gYXdhaXQgRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcInJlcXVlc3RHcm91cElkXCIsIG9Nb2RpZmllcik7XG5cdFx0Y29uc3Qgc0dyb3VwSWQ6IHN0cmluZyA9IHRoaXMuX2dldEdyb3VwSWQoc1JldHJpZXZlZEdyb3VwSWQpO1xuXHRcdGNvbnN0IG9UYWJsZUNvbnRleHQ6IENvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNQYXRoKTtcblx0XHRjb25zdCBhRmV0Y2hlZFByb3BlcnRpZXMgPSBhd2FpdCB0aGlzLl9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eShcblx0XHRcdG9UYWJsZSxcblx0XHRcdHNFbnRpdHlUeXBlUGF0aCxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50XG5cdFx0KTtcblx0XHRjb25zdCBvUHJvcGVydHlJbmZvID0gYUZldGNoZWRQcm9wZXJ0aWVzLmZpbmQoZnVuY3Rpb24gKG9JbmZvOiBhbnkpIHtcblx0XHRcdHJldHVybiBvSW5mby5uYW1lID09PSBzUHJvcGVydHlJbmZvTmFtZTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IG9Qcm9wZXJ0eUNvbnRleHQ6IENvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9Qcm9wZXJ0eUluZm8ubWV0YWRhdGFQYXRoKTtcblx0XHRjb25zdCBhVkhQcm9wZXJ0aWVzID0gdGhpcy5fZ2V0VkhSZWxldmFudEZpZWxkcyhvTWV0YU1vZGVsLCBvUHJvcGVydHlJbmZvLm1ldGFkYXRhUGF0aCwgc1BhdGgpO1xuXHRcdGNvbnN0IG9QYXJhbWV0ZXJzID0ge1xuXHRcdFx0c0JpbmRpbmdQYXRoOiBzUGF0aCxcblx0XHRcdHNWYWx1ZUhlbHBUeXBlOiBcIlRhYmxlVmFsdWVIZWxwXCIsXG5cdFx0XHRvQ29udHJvbDogb1RhYmxlLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdG9Nb2RpZmllcixcblx0XHRcdG9Qcm9wZXJ0eUluZm9cblx0XHR9O1xuXG5cdFx0Y29uc3QgZm5UZW1wbGF0ZVZhbHVlSGVscCA9IGFzeW5jIChzRnJhZ21lbnROYW1lOiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IG9UaGlzID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdFx0aWQ6IHNUYWJsZUlkLFxuXHRcdFx0XHRcdHJlcXVlc3RHcm91cElkOiBzR3JvdXBJZFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkOiBvUHJvcGVydHlDb250ZXh0LFxuXHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9UYWJsZUNvbnRleHRcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHRcdFx0XHRkYXRhRmllbGQ6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogb01ldGFNb2RlbFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb1ZhbHVlSGVscCA9IGF3YWl0IERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChzRnJhZ21lbnROYW1lLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHt9LCBvTW9kaWZpZXIpO1xuXHRcdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5faW5zZXJ0QWdncmVnYXRpb24ob1ZhbHVlSGVscCwgb01vZGlmaWVyLCBvVGFibGUpO1xuXHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0Ly9XZSBhbHdheXMgcmVzb2x2ZSB0aGUgcHJvbWlzZSB0byBlbnN1cmUgdGhhdCB0aGUgYXBwIGRvZXMgbm90IGNyYXNoXG5cdFx0XHRcdExvZy5lcnJvcihgVmFsdWVIZWxwIG5vdCBsb2FkZWQgOiAke29FcnJvci5tZXNzYWdlfWApO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdG9UaGlzLmRlc3Ryb3koKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3QgZm5UZW1wbGF0ZUZyYWdtZW50ID0gKG9JblByb3BlcnR5SW5mbzogYW55LCBvVmlldzogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBzRnJhZ21lbnROYW1lID0gXCJzYXAuZmUubWFjcm9zLnRhYmxlLkNvbHVtblwiO1xuXG5cdFx0XHRsZXQgYkRpc3BsYXlNb2RlO1xuXHRcdFx0bGV0IHNUYWJsZVR5cGVDdXN0b21EYXRhO1xuXHRcdFx0bGV0IHNPbkNoYW5nZUN1c3RvbURhdGE7XG5cdFx0XHRsZXQgc0NyZWF0aW9uTW9kZUN1c3RvbURhdGE7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLmFsbChbXG5cdFx0XHRcdERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJkaXNwbGF5TW9kZVByb3BlcnR5QmluZGluZ1wiLCBvTW9kaWZpZXIpLFxuXHRcdFx0XHREZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwidGFibGVUeXBlXCIsIG9Nb2RpZmllciksXG5cdFx0XHRcdERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJvbkNoYW5nZVwiLCBvTW9kaWZpZXIpLFxuXHRcdFx0XHREZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwiY3JlYXRpb25Nb2RlXCIsIG9Nb2RpZmllcilcblx0XHRcdF0pLnRoZW4oKGFDdXN0b21EYXRhOiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRiRGlzcGxheU1vZGUgPSBhQ3VzdG9tRGF0YVswXTtcblx0XHRcdFx0c1RhYmxlVHlwZUN1c3RvbURhdGEgPSBhQ3VzdG9tRGF0YVsxXTtcblx0XHRcdFx0c09uQ2hhbmdlQ3VzdG9tRGF0YSA9IGFDdXN0b21EYXRhWzJdO1xuXHRcdFx0XHRzQ3JlYXRpb25Nb2RlQ3VzdG9tRGF0YSA9IGFDdXN0b21EYXRhWzNdO1xuXHRcdFx0XHQvLyBSZWFkIE9ubHkgYW5kIENvbHVtbiBFZGl0IE1vZGUgY2FuIGJvdGggaGF2ZSB0aHJlZSBzdGF0ZVxuXHRcdFx0XHQvLyBVbmRlZmluZWQgbWVhbnMgdGhhdCB0aGUgZnJhbWV3b3JrIGRlY2lkZXMgd2hhdCB0byBkb1xuXHRcdFx0XHQvLyBUcnVlIC8gRGlzcGxheSBtZWFucyBhbHdheXMgcmVhZCBvbmx5XG5cdFx0XHRcdC8vIEZhbHNlIC8gRWRpdGFibGUgbWVhbnMgZWRpdGFibGUgYnV0IHdoaWxlIHN0aWxsIHJlc3BlY3RpbmcgdGhlIGxvdyBsZXZlbCBwcmluY2lwbGUgKGltbXV0YWJsZSBwcm9wZXJ0eSB3aWxsIG5vdCBiZSBlZGl0YWJsZSlcblx0XHRcdFx0Y29uc3Qgb0Rpc3BsYXlNb2RlcyA9IHRoaXMuX2dldERpc3BsYXlNb2RlKGJEaXNwbGF5TW9kZSk7XG5cdFx0XHRcdGJEaXNwbGF5TW9kZSA9IG9EaXNwbGF5TW9kZXMuZGlzcGxheW1vZGU7XG5cdFx0XHRcdGNvbnN0IGNvbHVtbkVkaXRNb2RlID0gb0Rpc3BsYXlNb2Rlcy5jb2x1bW5FZGl0TW9kZTtcblxuXHRcdFx0XHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0XHRcdFx0ZW5hYmxlQXV0b0NvbHVtbldpZHRoOiAob1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJKS5lbmFibGVBdXRvQ29sdW1uV2lkdGgsXG5cdFx0XHRcdFx0XHRpc09wdGltaXplZEZvclNtYWxsRGV2aWNlOiAob1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJKS5pc09wdGltaXplZEZvclNtYWxsRGV2aWNlLFxuXHRcdFx0XHRcdFx0cmVhZE9ubHk6IGJEaXNwbGF5TW9kZSxcblx0XHRcdFx0XHRcdGNvbHVtbkVkaXRNb2RlOiBjb2x1bW5FZGl0TW9kZSxcblx0XHRcdFx0XHRcdHRhYmxlVHlwZTogc1RhYmxlVHlwZUN1c3RvbURhdGEsXG5cdFx0XHRcdFx0XHRvbkNoYW5nZTogc09uQ2hhbmdlQ3VzdG9tRGF0YSxcblx0XHRcdFx0XHRcdGlkOiBzVGFibGVJZCxcblx0XHRcdFx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHNQcm9wZXJ0eUluZm9OYW1lLFxuXHRcdFx0XHRcdFx0Y29sdW1uSW5mbzogb0NvbHVtbkluZm8sXG5cdFx0XHRcdFx0XHRjb2xsZWN0aW9uOiB7XG5cdFx0XHRcdFx0XHRcdHNQYXRoOiBzUGF0aCxcblx0XHRcdFx0XHRcdFx0b01vZGVsOiBvTWV0YU1vZGVsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBzQ3JlYXRpb25Nb2RlQ3VzdG9tRGF0YVxuXHRcdFx0XHRcdH0gYXMgdGFibGVEZWxlZ2F0ZU1vZGVsKSxcblx0XHRcdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBvVGFibGVDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRjb2xsZWN0aW9uOiBvVGFibGVDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRkYXRhRmllbGQ6IG9Qcm9wZXJ0eUNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSxcblx0XHRcdFx0XHRcdFx0Y29sdW1uOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9jb2x1bW5JbmZvXCIpXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRcdHRoaXM6IG9UaGlzLFxuXHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGNvbGxlY3Rpb246IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGRhdGFGaWVsZDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0bWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRjb2x1bW46IG9UaGlzXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KHNGcmFnbWVudE5hbWUsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywgeyB2aWV3OiBvVmlldyB9LCBvTW9kaWZpZXIpLmZpbmFsbHkoXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChcblx0XHRcdGFWSFByb3BlcnRpZXMubWFwKGFzeW5jIChzUHJvcGVydHlOYW1lOiBhbnkpID0+IHtcblx0XHRcdFx0Y29uc3QgbVBhcmFtZXRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBvUGFyYW1ldGVycywgeyBzUHJvcGVydHlOYW1lOiBzUHJvcGVydHlOYW1lIH0pO1xuXG5cdFx0XHRcdGNvbnN0IGFSZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHRcdERlbGVnYXRlVXRpbC5pc1ZhbHVlSGVscFJlcXVpcmVkKG1QYXJhbWV0ZXJzKSxcblx0XHRcdFx0XHREZWxlZ2F0ZVV0aWwuZG9lc1ZhbHVlSGVscEV4aXN0KG1QYXJhbWV0ZXJzKVxuXHRcdFx0XHRdKTtcblxuXHRcdFx0XHRjb25zdCBiVmFsdWVIZWxwUmVxdWlyZWQgPSBhUmVzdWx0c1swXSxcblx0XHRcdFx0XHRiVmFsdWVIZWxwRXhpc3RzID0gYVJlc3VsdHNbMV07XG5cdFx0XHRcdHJldHVybiB0aGlzLl9mblRlbXBsYXRlVmFsdWVIZWxwKGZuVGVtcGxhdGVWYWx1ZUhlbHAsIGJWYWx1ZUhlbHBSZXF1aXJlZCwgYlZhbHVlSGVscEV4aXN0cyk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdFx0Ly8gSWYgdmlldyBpcyBub3QgcHJvdmlkZWQgdHJ5IHRvIGdldCBpdCBieSBhY2Nlc3NpbmcgdG8gdGhlIHBhcmVudGFsIGhpZXJhcmNoeVxuXHRcdC8vIElmIGl0IGRvZXNuJ3Qgd29yayAodGFibGUgaW50byBhbiB1bmF0dGFjaGVkIE9QIHNlY3Rpb24pIGdldCB0aGUgdmlldyB2aWEgdGhlIEFwcENvbXBvbmVudFxuXHRcdGNvbnN0IHZpZXcgPVxuXHRcdFx0bVByb3BlcnR5QmFnLnZpZXcgfHxcblx0XHRcdENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1RhYmxlKSB8fFxuXHRcdFx0KG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQgPyBDb21tb25VdGlscy5nZXRDdXJyZW50UGFnZVZpZXcobVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCkgOiB1bmRlZmluZWQpO1xuXHRcdHJldHVybiBmblRlbXBsYXRlRnJhZ21lbnQob1Byb3BlcnR5SW5mbywgdmlldyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFByb3ZpZGUgdGhlIFRhYmxlJ3MgZmlsdGVyIGRlbGVnYXRlIHRvIHByb3ZpZGUgYmFzaWMgZmlsdGVyIGZ1bmN0aW9uYWxpdHkgc3VjaCBhcyBhZGRpbmcgRmlsdGVyRmllbGRzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBPYmplY3QgZm9yIHRoZSBUYWJsZXMgZmlsdGVyIHBlcnNvbmFsaXphdGlvbi5cblx0ICovXG5cdGdldEZpbHRlckRlbGVnYXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIEZpbHRlckJhckRlbGVnYXRlLCB7XG5cdFx0XHRhZGRJdGVtOiBmdW5jdGlvbiAoc1Byb3BlcnR5SW5mb05hbWU6IGFueSwgb1BhcmVudENvbnRyb2w6IGFueSkge1xuXHRcdFx0XHRpZiAoc1Byb3BlcnR5SW5mb05hbWUuaW5kZXhPZihcIlByb3BlcnR5OjpcIikgPT09IDApIHtcblx0XHRcdFx0XHQvLyBDb3JyZWN0IHRoZSBuYW1lIG9mIGNvbXBsZXggcHJvcGVydHkgaW5mbyByZWZlcmVuY2VzLlxuXHRcdFx0XHRcdHNQcm9wZXJ0eUluZm9OYW1lID0gc1Byb3BlcnR5SW5mb05hbWUucmVwbGFjZShcIlByb3BlcnR5OjpcIiwgXCJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIEZpbHRlckJhckRlbGVnYXRlLmFkZEl0ZW0oc1Byb3BlcnR5SW5mb05hbWUsIG9QYXJlbnRDb250cm9sKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgVHlwZVV0aWwgYXR0YWNoZWQgdG8gdGhpcyBkZWxlZ2F0ZS5cblx0ICpcblx0ICogQHJldHVybnMgQW55IGluc3RhbmNlIG9mIFR5cGVVdGlsXG5cdCAqL1xuXHRnZXRUeXBlVXRpbDogZnVuY3Rpb24gKC8qb1BheWxvYWQ6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFR5cGVVdGlsO1xuXHR9LFxuXG5cdGZvcm1hdEdyb3VwSGVhZGVyKG9UYWJsZTogYW55LCBvQ29udGV4dDogYW55LCBzUHJvcGVydHk6IGFueSkge1xuXHRcdGNvbnN0IG1Gb3JtYXRJbmZvcyA9IERlbGVnYXRlVXRpbC5nZXRDYWNoZWRQcm9wZXJ0aWVzKG9UYWJsZSksXG5cdFx0XHRvRm9ybWF0SW5mbyA9XG5cdFx0XHRcdG1Gb3JtYXRJbmZvcyAmJlxuXHRcdFx0XHRtRm9ybWF0SW5mb3MuZmlsdGVyKChvYmo6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBvYmoubmFtZSA9PT0gc1Byb3BlcnR5O1xuXHRcdFx0XHR9KVswXSxcblx0XHRcdC8qRm9yIGEgRGF0ZSBvciBEYXRlVGltZSBwcm9wZXJ0eSwgdGhlIHZhbHVlIGlzIHJldHVybmVkIGluIGV4dGVybmFsIGZvcm1hdCB1c2luZyBhIFVJNSB0eXBlIGZvciB0aGVcblx0ICAgICAgICBnaXZlbiBwcm9wZXJ0eSBwYXRoIHRoYXQgZm9ybWF0cyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm9wZXJ0eSdzIEVETSB0eXBlIGFuZCBjb25zdHJhaW50cyovXG5cdFx0XHRiRXh0ZXJuYWxGb3JtYXQgPSBvRm9ybWF0SW5mbz8udHlwZUNvbmZpZz8uYmFzZVR5cGUgPT09IFwiRGF0ZVRpbWVcIiB8fCBvRm9ybWF0SW5mbz8udHlwZUNvbmZpZz8uYmFzZVR5cGUgPT09IFwiRGF0ZVwiO1xuXHRcdGxldCBzVmFsdWU7XG5cdFx0aWYgKG9Gb3JtYXRJbmZvICYmIG9Gb3JtYXRJbmZvLm1vZGUpIHtcblx0XHRcdHN3aXRjaCAob0Zvcm1hdEluZm8ubW9kZSkge1xuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHRzVmFsdWUgPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShvRm9ybWF0SW5mby5kZXNjcmlwdGlvblByb3BlcnR5LCBiRXh0ZXJuYWxGb3JtYXQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblZhbHVlXCI6XG5cdFx0XHRcdFx0c1ZhbHVlID0gVmFsdWVGb3JtYXR0ZXIuZm9ybWF0V2l0aEJyYWNrZXRzKFxuXHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0UHJvcGVydHkob0Zvcm1hdEluZm8uZGVzY3JpcHRpb25Qcm9wZXJ0eSwgYkV4dGVybmFsRm9ybWF0KSxcblx0XHRcdFx0XHRcdG9Db250ZXh0LmdldFByb3BlcnR5KG9Gb3JtYXRJbmZvLnZhbHVlUHJvcGVydHksIGJFeHRlcm5hbEZvcm1hdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0c1ZhbHVlID0gVmFsdWVGb3JtYXR0ZXIuZm9ybWF0V2l0aEJyYWNrZXRzKFxuXHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0UHJvcGVydHkob0Zvcm1hdEluZm8udmFsdWVQcm9wZXJ0eSwgYkV4dGVybmFsRm9ybWF0KSxcblx0XHRcdFx0XHRcdG9Db250ZXh0LmdldFByb3BlcnR5KG9Gb3JtYXRJbmZvLmRlc2NyaXB0aW9uUHJvcGVydHksIGJFeHRlcm5hbEZvcm1hdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzVmFsdWUgPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShvRm9ybWF0SW5mbz8ucGF0aCwgYkV4dGVybmFsRm9ybWF0KTtcblx0XHR9XG5cdFx0cmV0dXJuIFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fVEFCTEVfR1JPVVBfSEVBREVSX1RJVExFXCIsIFtvRm9ybWF0SW5mbz8ubGFiZWwsIHNWYWx1ZV0pO1xuXHR9XG59KTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBMENBLE1BQU1BLDhCQUE4QixHQUFHLCtCQUErQjs7RUFFdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVZBLE9BV2VDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFQyxpQkFBaUIsRUFBRTtJQUNuRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLG1DQUFtQyxFQUFFLFVBQVVDLE1BQWEsRUFBRUMsU0FBYyxFQUFFQyxXQUFrQixFQUFFO01BQ2pHLElBQUlELFNBQVMsQ0FBQ0UsSUFBSSxDQUFDQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDekUsTUFBTUMsT0FBTyxHQUFHTCxNQUFNLENBQUNNLFVBQVUsRUFBRSxDQUFDQyxJQUFJLENBQUMsVUFBVUMsSUFBUyxFQUFFO1VBQzdELE9BQU9BLElBQUksQ0FBQ0MsZUFBZSxFQUFFLEtBQUtSLFNBQVMsQ0FBQ0UsSUFBSTtRQUNqRCxDQUFDLENBQUM7UUFDRixNQUFNTyxvQkFBb0IsR0FBR0wsT0FBTyxHQUFHQSxPQUFPLENBQUNNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLE1BQU0sR0FBRyxLQUFLO1FBQzdGLE1BQU1DLFVBQVUsR0FBR1osTUFBTSxDQUFDYSxRQUFRLEVBQUUsQ0FBQ0MsWUFBWSxFQUFvQjtRQUNyRSxNQUFNQyx3QkFBd0IsR0FBR0MsMkJBQTJCLENBQUNKLFVBQVUsQ0FBQ0ssVUFBVSxDQUFDaEIsU0FBUyxDQUFDaUIsWUFBWSxDQUFDLENBQUM7UUFDM0csTUFBTUMsaUJBQWlCLEdBQUdKLHdCQUF3QixDQUFDSyxjQUFjO1FB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