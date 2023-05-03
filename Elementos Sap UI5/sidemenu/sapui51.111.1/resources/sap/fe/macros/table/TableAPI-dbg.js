/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/routing/NavigationReason", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/PasteHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/ResourceModel", "sap/fe/macros/table/Utils", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/message/Message", "../MacroAPI"], function (Log, CommonUtils, NavigationReason, ManifestSettings, ClassSupport, PasteHelper, DelegateUtil, FilterUtils, ResourceModel, TableUtils, MessageBox, Core, Message, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  var CreationMode = ManifestSettings.CreationMode;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block used to create a table based on the metadata provided by OData V4.
   * <br>
   * Usually, a LineItem or PresentationVariant annotation is expected, but the Table building block can also be used to display an EntitySet.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Table id="MyTable" metaPath="@com.sap.vocabularies.UI.v1.LineItem" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Table
   * @public
   */
  let TableAPI = (_dec = defineUI5Class("sap.fe.macros.table.TableAPI"), _dec2 = property({
    type: "string",
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.PresentationVariant", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant"]
  }), _dec3 = property({
    type: "sap.ui.model.Context"
  }), _dec4 = property({
    type: "boolean"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: false
  }), _dec7 = property({
    type: "string",
    defaultValue: "ResponsiveTable"
  }), _dec8 = property({
    type: "boolean",
    defaultValue: true
  }), _dec9 = property({
    type: "boolean",
    defaultValue: false
  }), _dec10 = property({
    type: "boolean",
    defaultValue: false
  }), _dec11 = property({
    type: "string"
  }), _dec12 = property({
    type: "string"
  }), _dec13 = property({
    type: "string"
  }), _dec14 = property({
    type: "boolean",
    defaultValue: true
  }), _dec15 = property({
    type: "boolean",
    defaultValue: false
  }), _dec16 = property({
    type: "boolean",
    defaultValue: true
  }), _dec17 = aggregation({
    type: "sap.fe.macros.table.Action"
  }), _dec18 = aggregation({
    type: "sap.fe.macros.table.Column"
  }), _dec19 = property({
    type: "boolean",
    defaultValue: false
  }), _dec20 = property({
    type: "boolean",
    defaultValue: false
  }), _dec21 = property({
    type: "boolean",
    defaultValue: false
  }), _dec22 = property({
    type: "boolean",
    defaultValue: false
  }), _dec23 = event(), _dec24 = event(), _dec25 = event(), _dec26 = property({
    type: "boolean|string",
    defaultValue: true
  }), _dec27 = property({
    type: "string"
  }), _dec28 = property({
    type: "string"
  }), _dec29 = property({
    type: "boolean",
    defaultValue: true
  }), _dec30 = event(), _dec31 = xmlEventHandler(), _dec32 = xmlEventHandler(), _dec33 = xmlEventHandler(), _dec34 = xmlEventHandler(), _dec35 = xmlEventHandler(), _dec36 = xmlEventHandler(), _dec37 = xmlEventHandler(), _dec38 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(TableAPI, _MacroAPI);
    function TableAPI(mSettings) {
      var _this;
      for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        others[_key - 1] = arguments[_key];
      }
      _this = _MacroAPI.call(this, mSettings, ...others) || this;
      _initializerDefineProperty(_this, "metaPath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDefinition", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "busy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "type", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableExport", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enablePaste", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFullScreen", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableAutoColumnWidth", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isOptimizedForSmallDevice", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "columns", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataInitialized", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "bindingSuspended", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "outDatedBinding", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pendingRequest", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "rowPress", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalDataRequested", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menu", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isSearchable", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor29, _assertThisInitialized(_this));
      _this.updateFilterBar();
      if (_this.content) {
        _this.content.attachEvent("selectionChange", {}, _this.onTableSelectionChange, _assertThisInitialized(_this));
      }
      return _this;
    }

    /**
     * Defines the relative path of the property in the metamodel, based on the current contextPath.
     *
     * @public
     */
    var _proto = TableAPI.prototype;
    /**
     * Gets contexts from the table that have been selected by the user.
     *
     * @returns Contexts of the rows selected by the user
     * @public
     */
    _proto.getSelectedContexts = function getSelectedContexts() {
      return this.content.getSelectedContexts();
    }

    /**
     * Adds a message to the table.
     *
     * The message applies to the whole table and not to an individual table row.
     *
     * @param [parameters] The parameters to create the message
     * @param parameters.type Message type
     * @param parameters.message Message text
     * @param parameters.description Message description
     * @param parameters.persistent True if the message is persistent
     * @returns The ID of the message
     * @public
     */;
    _proto.addMessage = function addMessage(parameters) {
      const msgManager = this._getMessageManager();
      const oTable = this.content;
      const oMessage = new Message({
        target: oTable.getRowBinding().getResolvedPath(),
        type: parameters.type,
        message: parameters.message,
        processor: oTable.getModel(),
        description: parameters.description,
        persistent: parameters.persistent
      });
      msgManager.addMessages(oMessage);
      return oMessage.getId();
    }

    /**
     * Removes a message from the table.
     *
     * @param id The id of the message
     * @public
     */;
    _proto.removeMessage = function removeMessage(id) {
      const msgManager = this._getMessageManager();
      const messages = msgManager.getMessageModel().getData();
      const result = messages.find(e => e.id === id);
      if (result) {
        msgManager.removeMessages(result);
      }
    };
    _proto._getMessageManager = function _getMessageManager() {
      return sap.ui.getCore().getMessageManager();
    }

    /**
     * An event triggered when the selection in the table changes.
     *
     * @public
     */;
    _proto._getRowBinding = function _getRowBinding() {
      const oTable = this.getContent();
      return oTable.getRowBinding();
    };
    _proto.getCounts = function getCounts() {
      const oTable = this.getContent();
      return TableUtils.getListBindingForCount(oTable, oTable.getBindingContext(), {
        batchGroupId: !this.getProperty("bindingSuspended") ? oTable.data("batchGroupId") : "$auto",
        additionalFilters: TableUtils.getHiddenFilters(oTable)
      }).then(iValue => {
        return TableUtils.getCountFormatted(iValue);
      }).catch(() => {
        return "0";
      });
    };
    _proto.onTableRowPress = function onTableRowPress(oEvent, oController, oContext, mParameters) {
      // prevent navigation to an empty row
      if (oContext && oContext.isInactive() && oContext.isTransient()) {
        return false;
      }
      // In the case of an analytical table, if we're trying to navigate to a context corresponding to a visual group or grand total
      // --> Cancel navigation
      if (this.getTableDefinition().enableAnalytics && oContext && oContext.isA("sap.ui.model.odata.v4.Context") && typeof oContext.getProperty("@$ui5.node.isExpanded") === "boolean") {
        return false;
      } else {
        const navigationParameters = Object.assign({}, mParameters, {
          reason: NavigationReason.RowPress
        });
        oController._routing.navigateForwardToContext(oContext, navigationParameters);
      }
    };
    _proto.onInternalDataReceived = function onInternalDataReceived(oEvent) {
      if (oEvent.getParameter("error")) {
        this.getController().messageHandler.showMessageDialog();
      }
    };
    _proto.onInternalDataRequested = function onInternalDataRequested(oEvent) {
      this.setProperty("dataInitialized", true);
      this.fireEvent("internalDataRequested", oEvent.getParameters());
    };
    _proto.onPaste = function onPaste(oEvent, oController) {
      // If paste is disable or if we're not in edit mode, we can't paste anything
      if (!this.tableDefinition.control.enablePaste || !this.getModel("ui").getProperty("/isEditable")) {
        return;
      }
      const aRawPastedData = oEvent.getParameter("data"),
        oTable = oEvent.getSource();
      if (oTable.getEnablePaste() === true) {
        PasteHelper.pasteData(aRawPastedData, oTable, oController);
      } else {
        const oResourceModel = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");
        MessageBox.error(oResourceModel.getText("T_OP_CONTROLLER_SAPFE_PASTE_DISABLED_MESSAGE"), {
          title: oResourceModel.getText("C_COMMON_SAPFE_ERROR")
        });
      }
    }

    // This event will allow us to intercept the export before is triggered to cover specific cases
    // that couldn't be addressed on the propertyInfos for each column.
    // e.g. Fixed Target Value for the datapoints
    ;
    _proto.onBeforeExport = function onBeforeExport(exportEvent) {
      var _exportEvent$getParam;
      const isSplitMode = exportEvent.getParameter("userExportSettings").splitCells,
        tableController = exportEvent.getSource(),
        exportColumns = (_exportEvent$getParam = exportEvent.getParameter("exportSettings").workbook) === null || _exportEvent$getParam === void 0 ? void 0 : _exportEvent$getParam.columns,
        tableColumns = this.tableDefinition.columns;
      TableAPI.updateExportSettings(exportColumns, tableColumns, tableController, isSplitMode);
    }

    /**
     * Handles the MDC DataStateIndicator plugin to display messageStrip on a table.
     *
     * @param oMessage
     * @param oTable
     * @name dataStateFilter
     * @returns Whether to render the messageStrip visible
     */;
    TableAPI.dataStateIndicatorFilter = function dataStateIndicatorFilter(oMessage, oTable) {
      var _oTable$getBindingCon;
      const sTableContextBindingPath = (_oTable$getBindingCon = oTable.getBindingContext()) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getPath();
      const sTableRowBinding = (sTableContextBindingPath ? `${sTableContextBindingPath}/` : "") + oTable.getRowBinding().getPath();
      return sTableRowBinding === oMessage.getTarget() ? true : false;
    }

    /**
     * This event handles the DataState of the DataStateIndicator plugin from MDC on a table.
     * It's fired when new error messages are sent from the backend to update row highlighting.
     *
     * @name onDataStateChange
     * @param oEvent Event object
     */;
    _proto.onDataStateChange = function onDataStateChange(oEvent) {
      const oDataStateIndicator = oEvent.getSource();
      const aFilteredMessages = oEvent.getParameter("filteredMessages");
      if (aFilteredMessages) {
        const oInternalModel = oDataStateIndicator.getModel("internal");
        oInternalModel.setProperty("filteredMessages", aFilteredMessages, oDataStateIndicator.getBindingContext("internal"));
      }
    }

    /**
     * Updates the columns to be exported of a table.
     *
     * @param exportColumns The columns to be exported
     * @param columns The columns from the table converter
     * @param tableController The table controller
     * @param isSplitMode Defines if the export has been launched using split mode
     * @returns The updated columns to be exported
     */;
    TableAPI.updateExportSettings = function updateExportSettings(exportColumns, columns, tableController, isSplitMode) {
      for (let index = exportColumns.length - 1; index >= 0; index--) {
        const exportColumn = exportColumns[index];
        exportColumn.label = DelegateUtil.getLocalizedText(exportColumn.label, tableController);
        //translate boolean values
        if (exportColumn.type === "Boolean") {
          exportColumn.falseValue = ResourceModel.getText("no");
          exportColumn.trueValue = ResourceModel.getText("yes");
        }
        const targetValueColumn = columns === null || columns === void 0 ? void 0 : columns.find(column => {
          if (isSplitMode) {
            return this._columnWithTargetValueToBeAdded(column, exportColumn);
          } else {
            return false;
          }
        });
        if (targetValueColumn) {
          const columnToBeAdded = {
            label: ResourceModel.getText("TargetValue"),
            property: Array.isArray(exportColumn.property) ? exportColumn.property : [exportColumn.property],
            template: targetValueColumn.exportDataPointTargetValue
          };
          exportColumns.splice(index + 1, 0, columnToBeAdded);
        }
      }
      return exportColumns;
    }

    /**
     * Defines if a column that is to be exported and contains a DataPoint with a fixed target value needs to be added.
     *
     * @param column The column from the annotations column
     * @param columnExport The column to be exported
     * @returns `true` if the referenced column has defined a targetValue for the dataPoint, false else
     */;
    TableAPI._columnWithTargetValueToBeAdded = function _columnWithTargetValueToBeAdded(column, columnExport) {
      var _column$propertyInfos;
      let columnNeedsToBeAdded = false;
      if (column.exportDataPointTargetValue && ((_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.length) === 1) {
        //Add TargetValue column when exporting on split mode
        if (column.relativePath === columnExport.property || columnExport.property[0] === column.propertyInfos[0] || columnExport.property.includes(column.relativePath) || columnExport.property.includes(column.name)) {
          // part of a FieldGroup or from a lineItem or from a column on the entitySet
          delete columnExport.template;
          columnNeedsToBeAdded = true;
        }
      }
      return columnNeedsToBeAdded;
    };
    _proto.resumeBinding = function resumeBinding(bRequestIfNotInitialized) {
      this.setProperty("bindingSuspended", false);
      if (bRequestIfNotInitialized && !this.getDataInitialized() || this.getProperty("outDatedBinding")) {
        var _getContent;
        this.setProperty("outDatedBinding", false);
        (_getContent = this.getContent()) === null || _getContent === void 0 ? void 0 : _getContent.rebind();
      }
    };
    _proto.refreshNotApplicableFields = function refreshNotApplicableFields(oFilterControl) {
      const oTable = this.getContent();
      return FilterUtils.getNotApplicableFilters(oFilterControl, oTable);
    };
    _proto.suspendBinding = function suspendBinding() {
      this.setProperty("bindingSuspended", true);
    };
    _proto.invalidateContent = function invalidateContent() {
      this.setProperty("dataInitialized", false);
      this.setProperty("outDatedBinding", false);
    };
    _proto.onMassEditButtonPressed = function onMassEditButtonPressed(oEvent, pageController) {
      const oTable = this.content;
      if (pageController && pageController.massEdit) {
        pageController.massEdit.openMassEditDialog(oTable);
      } else {
        Log.warning("The Controller is not enhanced with Mass Edit functionality");
      }
    };
    _proto.onTableSelectionChange = function onTableSelectionChange(oEvent) {
      this.fireEvent("selectionChange", oEvent.getParameters());
    }

    /**
     * Expose the internal table definition for external usage in delegate.
     *
     * @returns The tableDefinition
     */;
    _proto.getTableDefinition = function getTableDefinition() {
      return this.tableDefinition;
    }

    /**
     * connect the filter to the tableAPI if required
     *
     * @private
     * @alias sap.fe.macros.TableAPI
     */;
    _proto.updateFilterBar = function updateFilterBar() {
      const table = this.getContent();
      const filterBarRefId = this.getFilterBar();
      if (table && filterBarRefId && table.getFilter() !== filterBarRefId) {
        this._setFilterBar(filterBarRefId);
      }
    }

    /**
     * Sets the filter depending on the type of filterBar.
     *
     * @param filterBarRefId Id of the filter bar
     * @private
     * @alias sap.fe.macros.TableAPI
     */;
    _proto._setFilterBar = function _setFilterBar(filterBarRefId) {
      var _CommonUtils$getTarge;
      const table = this.getContent();

      // 'filterBar' property of macro:Table(passed as customData) might be
      // 1. A localId wrt View(FPM explorer example).
      // 2. Absolute Id(this was not supported in older versions).
      // 3. A localId wrt FragmentId(when an XMLComposite or Fragment is independently processed) instead of ViewId.
      //    'filterBar' was supported earlier as an 'association' to the 'mdc:Table' control inside 'macro:Table' in prior versions.
      //    In newer versions 'filterBar' is used like an association to 'macro:TableAPI'.
      //    This means that the Id is relative to 'macro:TableAPI'.
      //    This scenario happens in case of FilterBar and Table in a custom sections in OP of FEV4.

      const tableAPIId = this === null || this === void 0 ? void 0 : this.getId();
      const tableAPILocalId = this.data("tableAPILocalId");
      const potentialfilterBarId = tableAPILocalId && filterBarRefId && tableAPIId && tableAPIId.replace(new RegExp(tableAPILocalId + "$"), filterBarRefId); // 3

      const filterBar = ((_CommonUtils$getTarge = CommonUtils.getTargetView(this)) === null || _CommonUtils$getTarge === void 0 ? void 0 : _CommonUtils$getTarge.byId(filterBarRefId)) || Core.byId(filterBarRefId) || Core.byId(potentialfilterBarId);
      if (filterBar) {
        if (filterBar.isA("sap.fe.macros.filterBar.FilterBarAPI")) {
          table.setFilter(`${filterBar.getId()}-content`);
        } else if (filterBar.isA("sap.ui.mdc.FilterBar")) {
          table.setFilter(filterBar.getId());
        }
      }
    };
    _proto.checkIfColumnExists = function checkIfColumnExists(aFilteredColummns, columnName) {
      return aFilteredColummns.some(function (oColumn) {
        if ((oColumn === null || oColumn === void 0 ? void 0 : oColumn.columnName) === columnName && oColumn !== null && oColumn !== void 0 && oColumn.sColumnNameVisible || (oColumn === null || oColumn === void 0 ? void 0 : oColumn.sTextArrangement) !== undefined && (oColumn === null || oColumn === void 0 ? void 0 : oColumn.sTextArrangement) === columnName) {
          return columnName;
        }
      });
    };
    _proto.getIdentifierColumn = function getIdentifierColumn() {
      const oTable = this.getContent();
      const headerInfoTitlePath = this.getTableDefinition().headerInfoTitle;
      const oMetaModel = oTable && oTable.getModel().getMetaModel(),
        sCurrentEntitySetName = oTable.data("metaPath");
      const aTechnicalKeys = oMetaModel.getObject(`${sCurrentEntitySetName}/$Type/$Key`);
      const aFilteredTechnicalKeys = [];
      if (aTechnicalKeys && aTechnicalKeys.length > 0) {
        aTechnicalKeys.forEach(function (technicalKey) {
          if (technicalKey !== "IsActiveEntity") {
            aFilteredTechnicalKeys.push(technicalKey);
          }
        });
      }
      const semanticKeyColumns = this.getTableDefinition().semanticKeys;
      const aVisibleColumns = [];
      const aFilteredColummns = [];
      const aTableColumns = oTable.getColumns();
      aTableColumns.forEach(function (oColumn) {
        const column = oColumn === null || oColumn === void 0 ? void 0 : oColumn.getDataProperty();
        aVisibleColumns.push(column);
      });
      aVisibleColumns.forEach(function (oColumn) {
        var _oTextArrangement$Co, _oTextArrangement$Co2;
        const oTextArrangement = oMetaModel.getObject(`${sCurrentEntitySetName}/$Type/${oColumn}@`);
        const sTextArrangement = oTextArrangement && ((_oTextArrangement$Co = oTextArrangement["@com.sap.vocabularies.Common.v1.Text"]) === null || _oTextArrangement$Co === void 0 ? void 0 : _oTextArrangement$Co.$Path);
        const sTextPlacement = oTextArrangement && ((_oTextArrangement$Co2 = oTextArrangement["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) === null || _oTextArrangement$Co2 === void 0 ? void 0 : _oTextArrangement$Co2.$EnumMember);
        aFilteredColummns.push({
          columnName: oColumn,
          sTextArrangement: sTextArrangement,
          sColumnNameVisible: !(sTextPlacement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly")
        });
      });
      let column;
      if (headerInfoTitlePath !== undefined && this.checkIfColumnExists(aFilteredColummns, headerInfoTitlePath)) {
        column = headerInfoTitlePath;
      } else if (semanticKeyColumns !== undefined && semanticKeyColumns.length === 1 && this.checkIfColumnExists(aFilteredColummns, semanticKeyColumns[0])) {
        column = semanticKeyColumns[0];
      } else if (aFilteredTechnicalKeys !== undefined && aFilteredTechnicalKeys.length === 1 && this.checkIfColumnExists(aFilteredColummns, aFilteredTechnicalKeys[0])) {
        column = aFilteredTechnicalKeys[0];
      }
      return column;
    };
    _proto.setUpEmptyRows = async function setUpEmptyRows(table) {
      var _this$tableDefinition, _this$tableDefinition2, _table$getBindingCont;
      let createButtonWasPressed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (((_this$tableDefinition = this.tableDefinition.control) === null || _this$tableDefinition === void 0 ? void 0 : _this$tableDefinition.creationMode) !== CreationMode.InlineCreationRows) {
        return;
      }
      if ((_this$tableDefinition2 = this.tableDefinition.control) !== null && _this$tableDefinition2 !== void 0 && _this$tableDefinition2.inlineCreationRowsHiddenInEditMode && !((_table$getBindingCont = table.getBindingContext("ui")) !== null && _table$getBindingCont !== void 0 && _table$getBindingCont.getProperty("createMode")) && !createButtonWasPressed) {
        return;
      }
      const waitTableRendered = new Promise(resolve => {
        if (table.getDomRef()) {
          resolve();
        } else {
          const delegate = {
            onAfterRendering: function () {
              table.removeEventDelegate(delegate);
              resolve();
            }
          };
          table.addEventDelegate(delegate, this);
        }
      });
      await waitTableRendered;
      const uiModel = table.getModel("ui");
      if (uiModel.getProperty("/isEditablePending")) {
        // The edit mode is still being computed, so we wait until this computation is done before checking its value
        const watchBinding = uiModel.bindProperty("/isEditablePending");
        await new Promise(resolve => {
          const fnHandler = () => {
            watchBinding.detachChange(fnHandler);
            watchBinding.destroy();
            resolve();
          };
          watchBinding.attachChange(fnHandler);
        });
      }
      const isInEditMode = uiModel.getProperty("/isEditable");
      if (!isInEditMode) {
        return;
      }
      const binding = table.getRowBinding();
      if (binding.isResolved() && binding.isLengthFinal()) {
        const contextPath = binding.getContext().getPath();
        const inactiveContext = binding.getAllCurrentContexts().find(function (context) {
          return context.isInactive() && context.getPath().startsWith(contextPath);
        });
        if (!inactiveContext) {
          await this._createEmptyRow(binding, table);
        }
      }
    };
    _proto._createEmptyRow = async function _createEmptyRow(oBinding, oTable) {
      var _this$tableDefinition3;
      const iInlineCreationRowCount = ((_this$tableDefinition3 = this.tableDefinition.control) === null || _this$tableDefinition3 === void 0 ? void 0 : _this$tableDefinition3.inlineCreationRowCount) || 2;
      const aData = [];
      for (let i = 0; i < iInlineCreationRowCount; i += 1) {
        aData.push({});
      }
      const bAtEnd = oTable.data("tableType") !== "ResponsiveTable";
      const bInactive = true;
      const oView = CommonUtils.getTargetView(oTable);
      const oController = oView.getController();
      const oInternalEditFlow = oController._editFlow;
      if (!this.creatingEmptyRows) {
        this.creatingEmptyRows = true;
        try {
          const aContexts = await oInternalEditFlow.createMultipleDocuments(oBinding, aData, bAtEnd, false, oController.editFlow.onBeforeCreate, bInactive);
          aContexts === null || aContexts === void 0 ? void 0 : aContexts.forEach(function (oContext) {
            oContext.created().catch(function (oError) {
              if (!oError.canceled) {
                throw oError;
              }
            });
          });
        } catch (e) {
          Log.error(e);
        } finally {
          this.creatingEmptyRows = false;
        }
      }
    };
    return TableAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "tableDefinition", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "busy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "type", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "enableExport", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "enablePaste", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "enableFullScreen", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "enableAutoColumnWidth", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "isOptimizedForSmallDevice", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "columns", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "dataInitialized", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "bindingSuspended", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "outDatedBinding", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "pendingRequest", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "rowPress", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "internalDataRequested", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "menu", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "isSearchable", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "onTableRowPress", [_dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "onTableRowPress"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataReceived", [_dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataReceived"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataRequested", [_dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataRequested"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPaste", [_dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "onPaste"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeExport", [_dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeExport"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onDataStateChange", [_dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "onDataStateChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onMassEditButtonPressed", [_dec37], Object.getOwnPropertyDescriptor(_class2.prototype, "onMassEditButtonPressed"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onTableSelectionChange", [_dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "onTableSelectionChange"), _class2.prototype)), _class2)) || _class);
  return TableAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWJsZUFQSSIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiZXhwZWN0ZWRUeXBlcyIsImV4cGVjdGVkQW5ub3RhdGlvbnMiLCJkZWZhdWx0VmFsdWUiLCJhZ2dyZWdhdGlvbiIsImV2ZW50IiwieG1sRXZlbnRIYW5kbGVyIiwibVNldHRpbmdzIiwib3RoZXJzIiwidXBkYXRlRmlsdGVyQmFyIiwiY29udGVudCIsImF0dGFjaEV2ZW50Iiwib25UYWJsZVNlbGVjdGlvbkNoYW5nZSIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJhZGRNZXNzYWdlIiwicGFyYW1ldGVycyIsIm1zZ01hbmFnZXIiLCJfZ2V0TWVzc2FnZU1hbmFnZXIiLCJvVGFibGUiLCJvTWVzc2FnZSIsIk1lc3NhZ2UiLCJ0YXJnZXQiLCJnZXRSb3dCaW5kaW5nIiwiZ2V0UmVzb2x2ZWRQYXRoIiwibWVzc2FnZSIsInByb2Nlc3NvciIsImdldE1vZGVsIiwiZGVzY3JpcHRpb24iLCJwZXJzaXN0ZW50IiwiYWRkTWVzc2FnZXMiLCJnZXRJZCIsInJlbW92ZU1lc3NhZ2UiLCJpZCIsIm1lc3NhZ2VzIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsInJlc3VsdCIsImZpbmQiLCJlIiwicmVtb3ZlTWVzc2FnZXMiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJnZXRNZXNzYWdlTWFuYWdlciIsIl9nZXRSb3dCaW5kaW5nIiwiZ2V0Q29udGVudCIsImdldENvdW50cyIsIlRhYmxlVXRpbHMiLCJnZXRMaXN0QmluZGluZ0ZvckNvdW50IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJiYXRjaEdyb3VwSWQiLCJnZXRQcm9wZXJ0eSIsImRhdGEiLCJhZGRpdGlvbmFsRmlsdGVycyIsImdldEhpZGRlbkZpbHRlcnMiLCJ0aGVuIiwiaVZhbHVlIiwiZ2V0Q291bnRGb3JtYXR0ZWQiLCJjYXRjaCIsIm9uVGFibGVSb3dQcmVzcyIsIm9FdmVudCIsIm9Db250cm9sbGVyIiwib0NvbnRleHQiLCJtUGFyYW1ldGVycyIsImlzSW5hY3RpdmUiLCJpc1RyYW5zaWVudCIsImdldFRhYmxlRGVmaW5pdGlvbiIsImVuYWJsZUFuYWx5dGljcyIsImlzQSIsIm5hdmlnYXRpb25QYXJhbWV0ZXJzIiwiT2JqZWN0IiwiYXNzaWduIiwicmVhc29uIiwiTmF2aWdhdGlvblJlYXNvbiIsIlJvd1ByZXNzIiwiX3JvdXRpbmciLCJuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQiLCJvbkludGVybmFsRGF0YVJlY2VpdmVkIiwiZ2V0UGFyYW1ldGVyIiwiZ2V0Q29udHJvbGxlciIsIm1lc3NhZ2VIYW5kbGVyIiwic2hvd01lc3NhZ2VEaWFsb2ciLCJvbkludGVybmFsRGF0YVJlcXVlc3RlZCIsInNldFByb3BlcnR5IiwiZmlyZUV2ZW50IiwiZ2V0UGFyYW1ldGVycyIsIm9uUGFzdGUiLCJ0YWJsZURlZmluaXRpb24iLCJjb250cm9sIiwiZW5hYmxlUGFzdGUiLCJhUmF3UGFzdGVkRGF0YSIsImdldFNvdXJjZSIsImdldEVuYWJsZVBhc3RlIiwiUGFzdGVIZWxwZXIiLCJwYXN0ZURhdGEiLCJvUmVzb3VyY2VNb2RlbCIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsIk1lc3NhZ2VCb3giLCJlcnJvciIsImdldFRleHQiLCJ0aXRsZSIsIm9uQmVmb3JlRXhwb3J0IiwiZXhwb3J0RXZlbnQiLCJpc1NwbGl0TW9kZSIsInNwbGl0Q2VsbHMiLCJ0YWJsZUNvbnRyb2xsZXIiLCJleHBvcnRDb2x1bW5zIiwid29ya2Jvb2siLCJjb2x1bW5zIiwidGFibGVDb2x1bW5zIiwidXBkYXRlRXhwb3J0U2V0dGluZ3MiLCJkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXIiLCJzVGFibGVDb250ZXh0QmluZGluZ1BhdGgiLCJnZXRQYXRoIiwic1RhYmxlUm93QmluZGluZyIsImdldFRhcmdldCIsIm9uRGF0YVN0YXRlQ2hhbmdlIiwib0RhdGFTdGF0ZUluZGljYXRvciIsImFGaWx0ZXJlZE1lc3NhZ2VzIiwib0ludGVybmFsTW9kZWwiLCJpbmRleCIsImxlbmd0aCIsImV4cG9ydENvbHVtbiIsImxhYmVsIiwiRGVsZWdhdGVVdGlsIiwiZ2V0TG9jYWxpemVkVGV4dCIsImZhbHNlVmFsdWUiLCJSZXNvdXJjZU1vZGVsIiwidHJ1ZVZhbHVlIiwidGFyZ2V0VmFsdWVDb2x1bW4iLCJjb2x1bW4iLCJfY29sdW1uV2l0aFRhcmdldFZhbHVlVG9CZUFkZGVkIiwiY29sdW1uVG9CZUFkZGVkIiwiQXJyYXkiLCJpc0FycmF5IiwidGVtcGxhdGUiLCJleHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSIsInNwbGljZSIsImNvbHVtbkV4cG9ydCIsImNvbHVtbk5lZWRzVG9CZUFkZGVkIiwicHJvcGVydHlJbmZvcyIsInJlbGF0aXZlUGF0aCIsImluY2x1ZGVzIiwibmFtZSIsInJlc3VtZUJpbmRpbmciLCJiUmVxdWVzdElmTm90SW5pdGlhbGl6ZWQiLCJnZXREYXRhSW5pdGlhbGl6ZWQiLCJyZWJpbmQiLCJyZWZyZXNoTm90QXBwbGljYWJsZUZpZWxkcyIsIm9GaWx0ZXJDb250cm9sIiwiRmlsdGVyVXRpbHMiLCJnZXROb3RBcHBsaWNhYmxlRmlsdGVycyIsInN1c3BlbmRCaW5kaW5nIiwiaW52YWxpZGF0ZUNvbnRlbnQiLCJvbk1hc3NFZGl0QnV0dG9uUHJlc3NlZCIsInBhZ2VDb250cm9sbGVyIiwibWFzc0VkaXQiLCJvcGVuTWFzc0VkaXREaWFsb2ciLCJMb2ciLCJ3YXJuaW5nIiwidGFibGUiLCJmaWx0ZXJCYXJSZWZJZCIsImdldEZpbHRlckJhciIsImdldEZpbHRlciIsIl9zZXRGaWx0ZXJCYXIiLCJ0YWJsZUFQSUlkIiwidGFibGVBUElMb2NhbElkIiwicG90ZW50aWFsZmlsdGVyQmFySWQiLCJyZXBsYWNlIiwiUmVnRXhwIiwiZmlsdGVyQmFyIiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiYnlJZCIsIkNvcmUiLCJzZXRGaWx0ZXIiLCJjaGVja0lmQ29sdW1uRXhpc3RzIiwiYUZpbHRlcmVkQ29sdW1tbnMiLCJjb2x1bW5OYW1lIiwic29tZSIsIm9Db2x1bW4iLCJzQ29sdW1uTmFtZVZpc2libGUiLCJzVGV4dEFycmFuZ2VtZW50IiwidW5kZWZpbmVkIiwiZ2V0SWRlbnRpZmllckNvbHVtbiIsImhlYWRlckluZm9UaXRsZVBhdGgiLCJoZWFkZXJJbmZvVGl0bGUiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0N1cnJlbnRFbnRpdHlTZXROYW1lIiwiYVRlY2huaWNhbEtleXMiLCJnZXRPYmplY3QiLCJhRmlsdGVyZWRUZWNobmljYWxLZXlzIiwiZm9yRWFjaCIsInRlY2huaWNhbEtleSIsInB1c2giLCJzZW1hbnRpY0tleUNvbHVtbnMiLCJzZW1hbnRpY0tleXMiLCJhVmlzaWJsZUNvbHVtbnMiLCJhVGFibGVDb2x1bW5zIiwiZ2V0Q29sdW1ucyIsImdldERhdGFQcm9wZXJ0eSIsIm9UZXh0QXJyYW5nZW1lbnQiLCIkUGF0aCIsInNUZXh0UGxhY2VtZW50IiwiJEVudW1NZW1iZXIiLCJzZXRVcEVtcHR5Um93cyIsImNyZWF0ZUJ1dHRvbldhc1ByZXNzZWQiLCJjcmVhdGlvbk1vZGUiLCJDcmVhdGlvbk1vZGUiLCJJbmxpbmVDcmVhdGlvblJvd3MiLCJpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlIiwid2FpdFRhYmxlUmVuZGVyZWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImdldERvbVJlZiIsImRlbGVnYXRlIiwib25BZnRlclJlbmRlcmluZyIsInJlbW92ZUV2ZW50RGVsZWdhdGUiLCJhZGRFdmVudERlbGVnYXRlIiwidWlNb2RlbCIsIndhdGNoQmluZGluZyIsImJpbmRQcm9wZXJ0eSIsImZuSGFuZGxlciIsImRldGFjaENoYW5nZSIsImRlc3Ryb3kiLCJhdHRhY2hDaGFuZ2UiLCJpc0luRWRpdE1vZGUiLCJiaW5kaW5nIiwiaXNSZXNvbHZlZCIsImlzTGVuZ3RoRmluYWwiLCJjb250ZXh0UGF0aCIsImdldENvbnRleHQiLCJpbmFjdGl2ZUNvbnRleHQiLCJnZXRBbGxDdXJyZW50Q29udGV4dHMiLCJjb250ZXh0Iiwic3RhcnRzV2l0aCIsIl9jcmVhdGVFbXB0eVJvdyIsIm9CaW5kaW5nIiwiaUlubGluZUNyZWF0aW9uUm93Q291bnQiLCJpbmxpbmVDcmVhdGlvblJvd0NvdW50IiwiYURhdGEiLCJpIiwiYkF0RW5kIiwiYkluYWN0aXZlIiwib1ZpZXciLCJvSW50ZXJuYWxFZGl0RmxvdyIsIl9lZGl0RmxvdyIsImNyZWF0aW5nRW1wdHlSb3dzIiwiYUNvbnRleHRzIiwiY3JlYXRlTXVsdGlwbGVEb2N1bWVudHMiLCJlZGl0RmxvdyIsIm9uQmVmb3JlQ3JlYXRlIiwiY3JlYXRlZCIsIm9FcnJvciIsImNhbmNlbGVkIiwiTWFjcm9BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IE5hdmlnYXRpb25SZWFzb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvTmF2aWdhdGlvblJlYXNvblwiO1xuaW1wb3J0IHR5cGUgeyBBbm5vdGF0aW9uVGFibGVDb2x1bW4sIFRhYmxlQ29sdW1uLCBUYWJsZVZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7IENyZWF0aW9uTW9kZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBwcm9wZXJ0eSwgeG1sRXZlbnRIYW5kbGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgUGFzdGVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUGFzdGVIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvbWFjcm9zL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBUYWJsZVV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1V0aWxzXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IERhdGFTdGF0ZUluZGljYXRvciBmcm9tIFwic2FwL20vcGx1Z2lucy9EYXRhU3RhdGVJbmRpY2F0b3JcIjtcbmltcG9ydCBVSTVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IEZpbHRlckJhckFQSSBmcm9tIFwiLi4vZmlsdGVyQmFyL0ZpbHRlckJhckFQSVwiO1xuaW1wb3J0IE1hY3JvQVBJIGZyb20gXCIuLi9NYWNyb0FQSVwiO1xuXG4vKipcbiAqIERlZmluaXRpb24gb2YgYSBjdXN0b20gYWN0aW9uIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSB0YWJsZSB0b29sYmFyXG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MudGFibGUuQWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGlvbiA9IHtcblx0LyoqXG5cdCAqIFVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0a2V5OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGZvciB0aGlzIGFjdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHR0ZXh0OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBSZWZlcmVuY2UgdG8gdGhlIGtleSBvZiBhbm90aGVyIGFjdGlvbiBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgdG9vbGJhciB0byBwcm9wZXJseSBwbGFjZSB0aGlzIG9uZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhbmNob3I/OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXJlIHRoaXMgYWN0aW9uIHNob3VsZCBiZSBwbGFjZWQgcmVsYXRpdmUgdG8gdGhlIGRlZmluZWQgYW5jaG9yXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgQmVmb3JlYCBhbmQgYEFmdGVyYFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRwbGFjZW1lbnQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHVzZXIgY2hvb3NlcyB0aGUgYWN0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHByZXNzOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgaWYgdGhlIGFjdGlvbiByZXF1aXJlcyBhIHNlbGVjdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmVxdWlyZXNTZWxlY3Rpb24/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0ZW5hYmxlZD86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIERlZmluaXRpb24gb2YgYSBjdXN0b20gQWN0aW9uR3JvdXAgdG8gYmUgdXNlZCBpbnNpZGUgdGhlIHRhYmxlIHRvb2xiYXJcbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy50YWJsZS5BY3Rpb25Hcm91cFxuICogQHB1YmxpY1xuICovXG5leHBvcnQgdHlwZSBBY3Rpb25Hcm91cCA9IHtcblx0LyoqXG5cdCAqIFVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBBY3Rpb25Hcm91cFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRrZXk6IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgbmVzdGVkIGFjdGlvbnNcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YWN0aW9uczogQWN0aW9uW107XG5cblx0LyoqXG5cdCAqIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgZm9yIHRoaXMgYWN0aW9uIGdyb3VwXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHRleHQ6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB3aGVyZSB0aGlzIGFjdGlvbiBncm91cCBzaG91bGQgYmUgcGxhY2VkIHJlbGF0aXZlIHRvIHRoZSBkZWZpbmVkIGFuY2hvclxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYEJlZm9yZWAgYW5kIGBBZnRlcmBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cGxhY2VtZW50Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBSZWZlcmVuY2UgdG8gdGhlIGtleSBvZiBhbm90aGVyIGFjdGlvbiBvciBhY3Rpb24gZ3JvdXAgYWxyZWFkeSBkaXNwbGF5ZWQgaW4gdGhlIHRvb2xiYXIgdG8gcHJvcGVybHkgcGxhY2UgdGhpcyBvbmVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YW5jaG9yPzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBEZWZpbml0aW9uIG9mIGEgY3VzdG9tIGNvbHVtbiB0byBiZSB1c2VkIGluc2lkZSB0aGUgdGFibGUuXG4gKlxuICogVGhlIHRlbXBsYXRlIGZvciB0aGUgY29sdW1uIGhhcyB0byBiZSBwcm92aWRlZCBhcyB0aGUgZGVmYXVsdCBhZ2dyZWdhdGlvblxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLnRhYmxlLkNvbHVtblxuICogQHB1YmxpY1xuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgdHlwZSBDb2x1bW4gPSB7XG5cdC8qKlxuXHQgKiBVbmlxdWUgaWRlbnRpZmllciBvZiB0aGUgY29sdW1uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGtleTogc3RyaW5nO1xuXHQvKipcblx0ICogVGhlIHRleHQgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBmb3IgdGhpcyBjb2x1bW4gaGVhZGVyXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGhlYWRlcjogc3RyaW5nO1xuXHQvKipcblx0ICogUmVmZXJlbmNlIHRvIHRoZSBrZXkgb2YgYW5vdGhlciBjb2x1bW4gYWxyZWFkeSBkaXNwbGF5ZWQgaW4gdGhlIHRhYmxlIHRvIHByb3Blcmx5IHBsYWNlIHRoaXMgb25lXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFuY2hvcj86IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIGNvbHVtbiBpbXBvcnRhbmNlXG5cdCAqXG5cdCAqIFlvdSBjYW4gZGVmaW5lIHdoaWNoIGNvbHVtbnMgc2hvdWxkIGJlIGF1dG9tYXRpY2FsbHkgbW92ZWQgdG8gdGhlIHBvcC1pbiBhcmVhIGJhc2VkIG9uIHRoZWlyIGltcG9ydGFuY2Vcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0aW1wb3J0YW5jZT86IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgd2hlcmUgdGhpcyBjb2x1bW4gc2hvdWxkIGJlIHBsYWNlZCByZWxhdGl2ZSB0byB0aGUgZGVmaW5lZCBhbmNob3Jcblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIGBCZWZvcmVgIGFuZCBgQWZ0ZXJgXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHBsYWNlbWVudD86IHN0cmluZztcbn07XG5cbnR5cGUgZXhwb3J0Q29sdW1uID0ge1xuXHRsYWJlbDogc3RyaW5nO1xuXHRwcm9wZXJ0eTogc3RyaW5nIHwgQXJyYXk8c3RyaW5nPjtcblx0dHlwZT86IHN0cmluZztcblx0d2lkdGg/OiBudW1iZXI7XG5cdHRleHRBbGlnbj86IHN0cmluZztcblx0c2NhbGU/OiBudW1iZXI7XG5cdGRlbGltaXRlcj86IGJvb2xlYW47XG5cdHVuaXQ/OiBzdHJpbmc7XG5cdHVuaXRQcm9wZXJ0eT86IHN0cmluZztcblx0ZGlzcGxheVVuaXQ/OiBib29sZWFuO1xuXHR0cnVlVmFsdWU/OiBzdHJpbmc7XG5cdGZhbHNlVmFsdWU/OiBzdHJpbmc7XG5cdHRlbXBsYXRlPzogc3RyaW5nO1xuXHRpbnB1dEZvcm1hdD86IHN0cmluZztcblx0dXRjPzogYm9vbGVhbjtcblx0dmFsdWVNYXA/OiBzdHJpbmc7XG5cdHdyYXA/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayB1c2VkIHRvIGNyZWF0ZSBhIHRhYmxlIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgTGluZUl0ZW0gb3IgUHJlc2VudGF0aW9uVmFyaWFudCBhbm5vdGF0aW9uIGlzIGV4cGVjdGVkLCBidXQgdGhlIFRhYmxlIGJ1aWxkaW5nIGJsb2NrIGNhbiBhbHNvIGJlIHVzZWQgdG8gZGlzcGxheSBhbiBFbnRpdHlTZXQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOlRhYmxlIGlkPVwiTXlUYWJsZVwiIG1ldGFQYXRoPVwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtXCIgLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlRhYmxlXG4gKiBAcHVibGljXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MudGFibGUuVGFibGVBUElcIilcbmNsYXNzIFRhYmxlQVBJIGV4dGVuZHMgTWFjcm9BUEkge1xuXHRjcmVhdGluZ0VtcHR5Um93cz86IGJvb2xlYW47XG5cdGNvbnN0cnVjdG9yKG1TZXR0aW5ncz86IFByb3BlcnRpZXNPZjxUYWJsZUFQST4sIC4uLm90aGVyczogYW55W10pIHtcblx0XHRzdXBlcihtU2V0dGluZ3MgYXMgYW55LCAuLi5vdGhlcnMpO1xuXG5cdFx0dGhpcy51cGRhdGVGaWx0ZXJCYXIoKTtcblxuXHRcdGlmICh0aGlzLmNvbnRlbnQpIHtcblx0XHRcdHRoaXMuY29udGVudC5hdHRhY2hFdmVudChcInNlbGVjdGlvbkNoYW5nZVwiLCB7fSwgdGhpcy5vblRhYmxlU2VsZWN0aW9uQ2hhbmdlLCB0aGlzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1ldGFtb2RlbCwgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29udGV4dFBhdGguXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdLFxuXHRcdGV4cGVjdGVkQW5ub3RhdGlvbnM6IFtcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTGluZUl0ZW1cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudFwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XCJcblx0XHRdXG5cdH0pXG5cdG1ldGFQYXRoITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiB9KVxuXHR0YWJsZURlZmluaXRpb24hOiBUYWJsZVZpc3VhbGl6YXRpb247XG5cblx0LyoqXG5cdCAqIEFuIGV4cHJlc3Npb24gdGhhdCBhbGxvd3MgeW91IHRvIGNvbnRyb2wgdGhlICdyZWFkLW9ubHknIHN0YXRlIG9mIHRoZSB0YWJsZS5cblx0ICpcblx0ICogSWYgeW91IGRvIG5vdCBzZXQgYW55IGV4cHJlc3Npb24sIFNBUCBGaW9yaSBlbGVtZW50cyBob29rcyBpbnRvIHRoZSBzdGFuZGFyZCBsaWZlY3ljbGUgdG8gZGV0ZXJtaW5lIHRoZSBjdXJyZW50IHN0YXRlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRyZWFkT25seSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSB0YWJsZSBjb250cm9sLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBBbiBleHByZXNzaW9uIHRoYXQgYWxsb3dzIHlvdSB0byBjb250cm9sIHRoZSAnYnVzeScgc3RhdGUgb2YgdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRidXN5ITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgdHlwZSBvZiB0YWJsZSB0aGF0IHdpbGwgYmUgdXNlZCBieSB0aGUgYnVpbGRpbmcgYmxvY2sgdG8gcmVuZGVyIHRoZSBkYXRhLlxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYEdyaWRUYWJsZWAgYW5kIGBSZXNwb25zaXZlVGFibGVgXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHRWYWx1ZTogXCJSZXNwb25zaXZlVGFibGVcIiB9KVxuXHR0eXBlITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBDb250cm9scyBpZiB0aGUgZXhwb3J0IGZ1bmN0aW9uYWxpdHkgb2YgdGhlIHRhYmxlIGlzIGVuYWJsZWQgb3Igbm90LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdGVuYWJsZUV4cG9ydCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIGlmIHRoZSBwYXN0ZSBmdW5jdGlvbmFsaXR5IG9mIHRoZSB0YWJsZSBpcyBlbmFibGVkIG9yIG5vdC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0ZW5hYmxlUGFzdGUhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDb250cm9scyB3aGV0aGVyIHRoZSB0YWJsZSBjYW4gYmUgb3BlbmVkIGluIGZ1bGxzY3JlZW4gbW9kZSBvciBub3QuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGVuYWJsZUZ1bGxTY3JlZW4hOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgRmlsdGVyQmFyIGJ1aWxkaW5nIGJsb2NrIGFzc29jaWF0ZWQgd2l0aCB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZmlsdGVyQmFyITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBzZWxlY3Rpb24gbW9kZSB0byBiZSB1c2VkIGJ5IHRoZSB0YWJsZS5cblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIGBOb25lYCwgYFNpbmdsZWAsIGBNdWx0aWAgb3IgYEF1dG9gXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0c2VsZWN0aW9uTW9kZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBoZWFkZXIgdGV4dCB0aGF0IGlzIHNob3duIGluIHRoZSB0YWJsZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRoZWFkZXIhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyBpZiB0aGUgY29sdW1uIHdpZHRoIGlzIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogdHJ1ZSB9KVxuXHRlbmFibGVBdXRvQ29sdW1uV2lkdGghOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgaXQgdGhlIHRhYmxlIGlzIGRlc2lnbmVkIGZvciBhIG1vYmlsZSBkZXZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRpc09wdGltaXplZEZvclNtYWxsRGV2aWNlITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ29udHJvbHMgaWYgdGhlIGhlYWRlciB0ZXh0IHNob3VsZCBiZSBzaG93biBvciBub3QuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0aGVhZGVyVmlzaWJsZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFnZ3JlZ2F0ZSBhY3Rpb25zIG9mIHRoZSB0YWJsZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLnRhYmxlLkFjdGlvblwiIH0pXG5cdGFjdGlvbnMhOiBBY3Rpb25bXTtcblxuXHQvKipcblx0ICogQWdncmVnYXRlIGNvbHVtbnMgb2YgdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5mZS5tYWNyb3MudGFibGUuQ29sdW1uXCIgfSlcblx0Y29sdW1ucyE6IENvbHVtbltdO1xuXG5cdC8qKlxuXHQgKlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0ZGF0YUluaXRpYWxpemVkITogYm9vbGVhbjtcblxuXHQvKipcblx0ICpcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGJpbmRpbmdTdXNwZW5kZWQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0b3V0RGF0ZWRCaW5kaW5nITogYm9vbGVhbjtcblxuXHQvKipcblx0ICpcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdHBlbmRpbmdSZXF1ZXN0ITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gdGhlIHVzZXIgY2hvb3NlcyBhIHJvdzsgdGhlIGV2ZW50IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHdoaWNoIHJvdyB3YXMgY2hvc2VuLlxuXHQgKlxuXHQgKiBZb3UgY2FuIHNldCB0aGlzIGluIG9yZGVyIHRvIGhhbmRsZSB0aGUgbmF2aWdhdGlvbiBtYW51YWxseS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0cm93UHJlc3MhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gdGhlIFRhYmxlIFN0YXRlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIFlvdSBjYW4gc2V0IHRoaXMgaW4gb3JkZXIgdG8gc3RvcmUgdGhlIHRhYmxlIHN0YXRlIGluIHRoZSBhcHBzdGF0ZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBldmVudCgpXG5cdHN0YXRlQ2hhbmdlITogRnVuY3Rpb247XG5cblx0QGV2ZW50KClcblx0aW50ZXJuYWxEYXRhUmVxdWVzdGVkITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIHdoaWNoIG9wdGlvbnMgc2hvdWxkIGJlIGVuYWJsZWQgZm9yIHRoZSB0YWJsZSBwZXJzb25hbGl6YXRpb24gZGlhbG9nLlxuXHQgKlxuXHQgKiBJZiBpdCBpcyBzZXQgdG8gYHRydWVgLCBhbGwgcG9zc2libGUgb3B0aW9ucyBmb3IgdGhpcyBraW5kIG9mIHRhYmxlIGFyZSBlbmFibGVkLjxici8+XG5cdCAqIElmIGl0IGlzIHNldCB0byBgZmFsc2VgLCBwZXJzb25hbGl6YXRpb24gaXMgZGlzYWJsZWQuPGJyLz5cblx0ICo8YnIvPlxuXHQgKiBZb3UgY2FuIGFsc28gcHJvdmlkZSBhIG1vcmUgZ3JhbnVsYXIgY29udHJvbCBmb3IgdGhlIHBlcnNvbmFsaXphdGlvbiBieSBwcm92aWRpbmcgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCB3aXRoIHRoZSBvcHRpb25zIHlvdSB3YW50IHRvIGJlIGF2YWlsYWJsZS48YnIvPlxuXHQgKiBBdmFpbGFibGUgb3B0aW9ucyBhcmU6PGJyLz5cblx0ICogIC0gU29ydDxici8+XG5cdCAqICAtIENvbHVtbjxici8+XG5cdCAqICAtIEZpbHRlcjxici8+XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhbnxzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdHBlcnNvbmFsaXphdGlvbiE6IGJvb2xlYW4gfCBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIHRoZSBraW5kIG9mIHZhcmlhbnQgbWFuYWdlbWVudCB0aGF0IHNob3VsZCBiZSBlbmFibGVkIGZvciB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWUgaXMgYENvbnRyb2xgLjxici8+XG5cdCAqIElmIHNldCB3aXRoIHZhbHVlIGBDb250cm9sYCwgYSB2YXJpYW50IG1hbmFnZW1lbnQgY29udHJvbCBpcyBzZWVuIHdpdGhpbiB0aGUgdGFibGUgYW5kIHRoZSB0YWJsZSBpcyBsaW5rZWQgdG8gdGhpcy48YnIvPlxuXHQgKiBJZiBub3Qgc2V0IHdpdGggYW55IHZhbHVlLCBjb250cm9sIGxldmVsIHZhcmlhbnQgbWFuYWdlbWVudCBpcyBub3QgYXZhaWxhYmxlIGZvciB0aGlzIHRhYmxlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZhcmlhbnRNYW5hZ2VtZW50ITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBHcm91cHMgbWVudSBhY3Rpb25zIGJ5IGtleS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRtZW51Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXRoZXIgdG8gZGlzcGxheSB0aGUgc2VhcmNoIGFjdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogdHJ1ZSB9KVxuXHRpc1NlYXJjaGFibGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBHZXRzIGNvbnRleHRzIGZyb20gdGhlIHRhYmxlIHRoYXQgaGF2ZSBiZWVuIHNlbGVjdGVkIGJ5IHRoZSB1c2VyLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBDb250ZXh0cyBvZiB0aGUgcm93cyBzZWxlY3RlZCBieSB0aGUgdXNlclxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRTZWxlY3RlZENvbnRleHRzKCk6IENvbnRleHRbXSB7XG5cdFx0cmV0dXJuICh0aGlzLmNvbnRlbnQgYXMgYW55KS5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG1lc3NhZ2UgdG8gdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBUaGUgbWVzc2FnZSBhcHBsaWVzIHRvIHRoZSB3aG9sZSB0YWJsZSBhbmQgbm90IHRvIGFuIGluZGl2aWR1YWwgdGFibGUgcm93LlxuXHQgKlxuXHQgKiBAcGFyYW0gW3BhcmFtZXRlcnNdIFRoZSBwYXJhbWV0ZXJzIHRvIGNyZWF0ZSB0aGUgbWVzc2FnZVxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy50eXBlIE1lc3NhZ2UgdHlwZVxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy5tZXNzYWdlIE1lc3NhZ2UgdGV4dFxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy5kZXNjcmlwdGlvbiBNZXNzYWdlIGRlc2NyaXB0aW9uXG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLnBlcnNpc3RlbnQgVHJ1ZSBpZiB0aGUgbWVzc2FnZSBpcyBwZXJzaXN0ZW50XG5cdCAqIEByZXR1cm5zIFRoZSBJRCBvZiB0aGUgbWVzc2FnZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhZGRNZXNzYWdlKHBhcmFtZXRlcnM6IHsgdHlwZT86IE1lc3NhZ2VUeXBlOyBtZXNzYWdlPzogc3RyaW5nOyBkZXNjcmlwdGlvbj86IHN0cmluZzsgcGVyc2lzdGVudD86IGJvb2xlYW4gfSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgbXNnTWFuYWdlciA9IHRoaXMuX2dldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cblx0XHRjb25zdCBvVGFibGUgPSB0aGlzLmNvbnRlbnQgYXMgYW55IGFzIFRhYmxlO1xuXG5cdFx0Y29uc3Qgb01lc3NhZ2UgPSBuZXcgTWVzc2FnZSh7XG5cdFx0XHR0YXJnZXQ6IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0UmVzb2x2ZWRQYXRoKCksXG5cdFx0XHR0eXBlOiBwYXJhbWV0ZXJzLnR5cGUsXG5cdFx0XHRtZXNzYWdlOiBwYXJhbWV0ZXJzLm1lc3NhZ2UsXG5cdFx0XHRwcm9jZXNzb3I6IG9UYWJsZS5nZXRNb2RlbCgpLFxuXHRcdFx0ZGVzY3JpcHRpb246IHBhcmFtZXRlcnMuZGVzY3JpcHRpb24sXG5cdFx0XHRwZXJzaXN0ZW50OiBwYXJhbWV0ZXJzLnBlcnNpc3RlbnRcblx0XHR9KTtcblxuXHRcdG1zZ01hbmFnZXIuYWRkTWVzc2FnZXMob01lc3NhZ2UpO1xuXHRcdHJldHVybiBvTWVzc2FnZS5nZXRJZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBtZXNzYWdlIGZyb20gdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGlkIG9mIHRoZSBtZXNzYWdlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlbW92ZU1lc3NhZ2UoaWQ6IHN0cmluZykge1xuXHRcdGNvbnN0IG1zZ01hbmFnZXIgPSB0aGlzLl9nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHRcdGNvbnN0IG1lc3NhZ2VzID0gbXNnTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0Y29uc3QgcmVzdWx0ID0gbWVzc2FnZXMuZmluZCgoZTogYW55KSA9PiBlLmlkID09PSBpZCk7XG5cdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0bXNnTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhyZXN1bHQpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRNZXNzYWdlTWFuYWdlcigpIHtcblx0XHRyZXR1cm4gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIHRoZSBzZWxlY3Rpb24gaW4gdGhlIHRhYmxlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBldmVudCgpXG5cdHNlbGVjdGlvbkNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdF9nZXRSb3dCaW5kaW5nKCkge1xuXHRcdGNvbnN0IG9UYWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdHJldHVybiBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHR9XG5cblx0Z2V0Q291bnRzKCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0Y29uc3Qgb1RhYmxlID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cdFx0cmV0dXJuIFRhYmxlVXRpbHMuZ2V0TGlzdEJpbmRpbmdGb3JDb3VudChvVGFibGUsIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpLCB7XG5cdFx0XHRiYXRjaEdyb3VwSWQ6ICF0aGlzLmdldFByb3BlcnR5KFwiYmluZGluZ1N1c3BlbmRlZFwiKSA/IG9UYWJsZS5kYXRhKFwiYmF0Y2hHcm91cElkXCIpIDogXCIkYXV0b1wiLFxuXHRcdFx0YWRkaXRpb25hbEZpbHRlcnM6IFRhYmxlVXRpbHMuZ2V0SGlkZGVuRmlsdGVycyhvVGFibGUpXG5cdFx0fSlcblx0XHRcdC50aGVuKChpVmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gVGFibGVVdGlscy5nZXRDb3VudEZvcm1hdHRlZChpVmFsdWUpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBcIjBcIjtcblx0XHRcdH0pO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uVGFibGVSb3dQcmVzcyhvRXZlbnQ6IFVJNUV2ZW50LCBvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIG9Db250ZXh0OiBDb250ZXh0LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0Ly8gcHJldmVudCBuYXZpZ2F0aW9uIHRvIGFuIGVtcHR5IHJvd1xuXHRcdGlmIChvQ29udGV4dCAmJiBvQ29udGV4dC5pc0luYWN0aXZlKCkgJiYgb0NvbnRleHQuaXNUcmFuc2llbnQoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHQvLyBJbiB0aGUgY2FzZSBvZiBhbiBhbmFseXRpY2FsIHRhYmxlLCBpZiB3ZSdyZSB0cnlpbmcgdG8gbmF2aWdhdGUgdG8gYSBjb250ZXh0IGNvcnJlc3BvbmRpbmcgdG8gYSB2aXN1YWwgZ3JvdXAgb3IgZ3JhbmQgdG90YWxcblx0XHQvLyAtLT4gQ2FuY2VsIG5hdmlnYXRpb25cblx0XHRpZiAoXG5cdFx0XHR0aGlzLmdldFRhYmxlRGVmaW5pdGlvbigpLmVuYWJsZUFuYWx5dGljcyAmJlxuXHRcdFx0b0NvbnRleHQgJiZcblx0XHRcdG9Db250ZXh0LmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0XCIpICYmXG5cdFx0XHR0eXBlb2Ygb0NvbnRleHQuZ2V0UHJvcGVydHkoXCJAJHVpNS5ub2RlLmlzRXhwYW5kZWRcIikgPT09IFwiYm9vbGVhblwiXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG5hdmlnYXRpb25QYXJhbWV0ZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgbVBhcmFtZXRlcnMsIHsgcmVhc29uOiBOYXZpZ2F0aW9uUmVhc29uLlJvd1ByZXNzIH0pO1xuXHRcdFx0KG9Db250cm9sbGVyIGFzIGFueSkuX3JvdXRpbmcubmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KG9Db250ZXh0LCBuYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGlmIChvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiZXJyb3JcIikpIHtcblx0XHRcdHRoaXMuZ2V0Q29udHJvbGxlcigpLm1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKCk7XG5cdFx0fVxuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkKG9FdmVudDogVUk1RXZlbnQpIHtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiZGF0YUluaXRpYWxpemVkXCIsIHRydWUpO1xuXHRcdCh0aGlzIGFzIGFueSkuZmlyZUV2ZW50KFwiaW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIsIG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uUGFzdGUob0V2ZW50OiBVSTVFdmVudCwgb0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyKSB7XG5cdFx0Ly8gSWYgcGFzdGUgaXMgZGlzYWJsZSBvciBpZiB3ZSdyZSBub3QgaW4gZWRpdCBtb2RlLCB3ZSBjYW4ndCBwYXN0ZSBhbnl0aGluZ1xuXHRcdGlmICghdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5lbmFibGVQYXN0ZSB8fCAhdGhpcy5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBhUmF3UGFzdGVkRGF0YSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJkYXRhXCIpLFxuXHRcdFx0b1RhYmxlID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIFRhYmxlO1xuXG5cdFx0aWYgKG9UYWJsZS5nZXRFbmFibGVQYXN0ZSgpID09PSB0cnVlKSB7XG5cdFx0XHRQYXN0ZUhlbHBlci5wYXN0ZURhdGEoYVJhd1Bhc3RlZERhdGEsIG9UYWJsZSwgb0NvbnRyb2xsZXIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBvUmVzb3VyY2VNb2RlbCA9IHNhcC51aS5nZXRDb3JlKCkuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHRNZXNzYWdlQm94LmVycm9yKG9SZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX09QX0NPTlRST0xMRVJfU0FQRkVfUEFTVEVfRElTQUJMRURfTUVTU0FHRVwiKSwge1xuXHRcdFx0XHR0aXRsZTogb1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvLyBUaGlzIGV2ZW50IHdpbGwgYWxsb3cgdXMgdG8gaW50ZXJjZXB0IHRoZSBleHBvcnQgYmVmb3JlIGlzIHRyaWdnZXJlZCB0byBjb3ZlciBzcGVjaWZpYyBjYXNlc1xuXHQvLyB0aGF0IGNvdWxkbid0IGJlIGFkZHJlc3NlZCBvbiB0aGUgcHJvcGVydHlJbmZvcyBmb3IgZWFjaCBjb2x1bW4uXG5cdC8vIGUuZy4gRml4ZWQgVGFyZ2V0IFZhbHVlIGZvciB0aGUgZGF0YXBvaW50c1xuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25CZWZvcmVFeHBvcnQoZXhwb3J0RXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0Y29uc3QgaXNTcGxpdE1vZGUgPSBleHBvcnRFdmVudC5nZXRQYXJhbWV0ZXIoXCJ1c2VyRXhwb3J0U2V0dGluZ3NcIikuc3BsaXRDZWxscyxcblx0XHRcdHRhYmxlQ29udHJvbGxlciA9IGV4cG9ydEV2ZW50LmdldFNvdXJjZSgpIGFzIFBhZ2VDb250cm9sbGVyLFxuXHRcdFx0ZXhwb3J0Q29sdW1ucyA9IGV4cG9ydEV2ZW50LmdldFBhcmFtZXRlcihcImV4cG9ydFNldHRpbmdzXCIpLndvcmtib29rPy5jb2x1bW5zLFxuXHRcdFx0dGFibGVDb2x1bW5zID0gdGhpcy50YWJsZURlZmluaXRpb24uY29sdW1ucztcblxuXHRcdFRhYmxlQVBJLnVwZGF0ZUV4cG9ydFNldHRpbmdzKGV4cG9ydENvbHVtbnMsIHRhYmxlQ29sdW1ucywgdGFibGVDb250cm9sbGVyLCBpc1NwbGl0TW9kZSk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyB0aGUgTURDIERhdGFTdGF0ZUluZGljYXRvciBwbHVnaW4gdG8gZGlzcGxheSBtZXNzYWdlU3RyaXAgb24gYSB0YWJsZS5cblx0ICpcblx0ICogQHBhcmFtIG9NZXNzYWdlXG5cdCAqIEBwYXJhbSBvVGFibGVcblx0ICogQG5hbWUgZGF0YVN0YXRlRmlsdGVyXG5cdCAqIEByZXR1cm5zIFdoZXRoZXIgdG8gcmVuZGVyIHRoZSBtZXNzYWdlU3RyaXAgdmlzaWJsZVxuXHQgKi9cblx0c3RhdGljIGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcihvTWVzc2FnZTogYW55LCBvVGFibGU6IGFueSk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHNUYWJsZUNvbnRleHRCaW5kaW5nUGF0aCA9IG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc1RhYmxlUm93QmluZGluZyA9IChzVGFibGVDb250ZXh0QmluZGluZ1BhdGggPyBgJHtzVGFibGVDb250ZXh0QmluZGluZ1BhdGh9L2AgOiBcIlwiKSArIG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0UGF0aCgpO1xuXHRcdHJldHVybiBzVGFibGVSb3dCaW5kaW5nID09PSBvTWVzc2FnZS5nZXRUYXJnZXQoKSA/IHRydWUgOiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGV2ZW50IGhhbmRsZXMgdGhlIERhdGFTdGF0ZSBvZiB0aGUgRGF0YVN0YXRlSW5kaWNhdG9yIHBsdWdpbiBmcm9tIE1EQyBvbiBhIHRhYmxlLlxuXHQgKiBJdCdzIGZpcmVkIHdoZW4gbmV3IGVycm9yIG1lc3NhZ2VzIGFyZSBzZW50IGZyb20gdGhlIGJhY2tlbmQgdG8gdXBkYXRlIHJvdyBoaWdobGlnaHRpbmcuXG5cdCAqXG5cdCAqIEBuYW1lIG9uRGF0YVN0YXRlQ2hhbmdlXG5cdCAqIEBwYXJhbSBvRXZlbnQgRXZlbnQgb2JqZWN0XG5cdCAqL1xuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25EYXRhU3RhdGVDaGFuZ2Uob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IG9EYXRhU3RhdGVJbmRpY2F0b3IgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgRGF0YVN0YXRlSW5kaWNhdG9yO1xuXHRcdGNvbnN0IGFGaWx0ZXJlZE1lc3NhZ2VzID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImZpbHRlcmVkTWVzc2FnZXNcIik7XG5cdFx0aWYgKGFGaWx0ZXJlZE1lc3NhZ2VzKSB7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbCA9IG9EYXRhU3RhdGVJbmRpY2F0b3IuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcImZpbHRlcmVkTWVzc2FnZXNcIiwgYUZpbHRlcmVkTWVzc2FnZXMsIG9EYXRhU3RhdGVJbmRpY2F0b3IuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBDb250ZXh0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgY29sdW1ucyB0byBiZSBleHBvcnRlZCBvZiBhIHRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXhwb3J0Q29sdW1ucyBUaGUgY29sdW1ucyB0byBiZSBleHBvcnRlZFxuXHQgKiBAcGFyYW0gY29sdW1ucyBUaGUgY29sdW1ucyBmcm9tIHRoZSB0YWJsZSBjb252ZXJ0ZXJcblx0ICogQHBhcmFtIHRhYmxlQ29udHJvbGxlciBUaGUgdGFibGUgY29udHJvbGxlclxuXHQgKiBAcGFyYW0gaXNTcGxpdE1vZGUgRGVmaW5lcyBpZiB0aGUgZXhwb3J0IGhhcyBiZWVuIGxhdW5jaGVkIHVzaW5nIHNwbGl0IG1vZGVcblx0ICogQHJldHVybnMgVGhlIHVwZGF0ZWQgY29sdW1ucyB0byBiZSBleHBvcnRlZFxuXHQgKi9cblx0c3RhdGljIHVwZGF0ZUV4cG9ydFNldHRpbmdzKFxuXHRcdGV4cG9ydENvbHVtbnM6IGV4cG9ydENvbHVtbltdLFxuXHRcdGNvbHVtbnM6IFRhYmxlQ29sdW1uW10sXG5cdFx0dGFibGVDb250cm9sbGVyOiBQYWdlQ29udHJvbGxlcixcblx0XHRpc1NwbGl0TW9kZTogYm9vbGVhblxuXHQpOiBleHBvcnRDb2x1bW5bXSB7XG5cdFx0Zm9yIChsZXQgaW5kZXggPSBleHBvcnRDb2x1bW5zLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcblx0XHRcdGNvbnN0IGV4cG9ydENvbHVtbiA9IGV4cG9ydENvbHVtbnNbaW5kZXhdO1xuXHRcdFx0ZXhwb3J0Q29sdW1uLmxhYmVsID0gRGVsZWdhdGVVdGlsLmdldExvY2FsaXplZFRleHQoZXhwb3J0Q29sdW1uLmxhYmVsLCB0YWJsZUNvbnRyb2xsZXIpO1xuXHRcdFx0Ly90cmFuc2xhdGUgYm9vbGVhbiB2YWx1ZXNcblx0XHRcdGlmIChleHBvcnRDb2x1bW4udHlwZSA9PT0gXCJCb29sZWFuXCIpIHtcblx0XHRcdFx0ZXhwb3J0Q29sdW1uLmZhbHNlVmFsdWUgPSBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJub1wiKTtcblx0XHRcdFx0ZXhwb3J0Q29sdW1uLnRydWVWYWx1ZSA9IFJlc291cmNlTW9kZWwuZ2V0VGV4dChcInllc1wiKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHRhcmdldFZhbHVlQ29sdW1uID0gY29sdW1ucz8uZmluZCgoY29sdW1uKSA9PiB7XG5cdFx0XHRcdGlmIChpc1NwbGl0TW9kZSkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9jb2x1bW5XaXRoVGFyZ2V0VmFsdWVUb0JlQWRkZWQoY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbiwgZXhwb3J0Q29sdW1uKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYgKHRhcmdldFZhbHVlQ29sdW1uKSB7XG5cdFx0XHRcdGNvbnN0IGNvbHVtblRvQmVBZGRlZCA9IHtcblx0XHRcdFx0XHRsYWJlbDogUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVGFyZ2V0VmFsdWVcIiksXG5cdFx0XHRcdFx0cHJvcGVydHk6IEFycmF5LmlzQXJyYXkoZXhwb3J0Q29sdW1uLnByb3BlcnR5KSA/IGV4cG9ydENvbHVtbi5wcm9wZXJ0eSA6IFtleHBvcnRDb2x1bW4ucHJvcGVydHldLFxuXHRcdFx0XHRcdHRlbXBsYXRlOiAodGFyZ2V0VmFsdWVDb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uKS5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRleHBvcnRDb2x1bW5zLnNwbGljZShpbmRleCArIDEsIDAsIGNvbHVtblRvQmVBZGRlZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBleHBvcnRDb2x1bW5zO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlZmluZXMgaWYgYSBjb2x1bW4gdGhhdCBpcyB0byBiZSBleHBvcnRlZCBhbmQgY29udGFpbnMgYSBEYXRhUG9pbnQgd2l0aCBhIGZpeGVkIHRhcmdldCB2YWx1ZSBuZWVkcyB0byBiZSBhZGRlZC5cblx0ICpcblx0ICogQHBhcmFtIGNvbHVtbiBUaGUgY29sdW1uIGZyb20gdGhlIGFubm90YXRpb25zIGNvbHVtblxuXHQgKiBAcGFyYW0gY29sdW1uRXhwb3J0IFRoZSBjb2x1bW4gdG8gYmUgZXhwb3J0ZWRcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSByZWZlcmVuY2VkIGNvbHVtbiBoYXMgZGVmaW5lZCBhIHRhcmdldFZhbHVlIGZvciB0aGUgZGF0YVBvaW50LCBmYWxzZSBlbHNlXG5cdCAqL1xuXHRzdGF0aWMgX2NvbHVtbldpdGhUYXJnZXRWYWx1ZVRvQmVBZGRlZChjb2x1bW46IEFubm90YXRpb25UYWJsZUNvbHVtbiwgY29sdW1uRXhwb3J0OiBleHBvcnRDb2x1bW4pOiBib29sZWFuIHtcblx0XHRsZXQgY29sdW1uTmVlZHNUb0JlQWRkZWQgPSBmYWxzZTtcblx0XHRpZiAoY29sdW1uLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlICYmIGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5sZW5ndGggPT09IDEpIHtcblx0XHRcdC8vQWRkIFRhcmdldFZhbHVlIGNvbHVtbiB3aGVuIGV4cG9ydGluZyBvbiBzcGxpdCBtb2RlXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGNvbHVtbi5yZWxhdGl2ZVBhdGggPT09IGNvbHVtbkV4cG9ydC5wcm9wZXJ0eSB8fFxuXHRcdFx0XHRjb2x1bW5FeHBvcnQucHJvcGVydHlbMF0gPT09IGNvbHVtbi5wcm9wZXJ0eUluZm9zWzBdIHx8XG5cdFx0XHRcdGNvbHVtbkV4cG9ydC5wcm9wZXJ0eS5pbmNsdWRlcyhjb2x1bW4ucmVsYXRpdmVQYXRoKSB8fFxuXHRcdFx0XHRjb2x1bW5FeHBvcnQucHJvcGVydHkuaW5jbHVkZXMoY29sdW1uLm5hbWUpXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gcGFydCBvZiBhIEZpZWxkR3JvdXAgb3IgZnJvbSBhIGxpbmVJdGVtIG9yIGZyb20gYSBjb2x1bW4gb24gdGhlIGVudGl0eVNldFxuXHRcdFx0XHRkZWxldGUgY29sdW1uRXhwb3J0LnRlbXBsYXRlO1xuXHRcdFx0XHRjb2x1bW5OZWVkc1RvQmVBZGRlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjb2x1bW5OZWVkc1RvQmVBZGRlZDtcblx0fVxuXG5cdHJlc3VtZUJpbmRpbmcoYlJlcXVlc3RJZk5vdEluaXRpYWxpemVkOiBib29sZWFuKSB7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcImJpbmRpbmdTdXNwZW5kZWRcIiwgZmFsc2UpO1xuXHRcdGlmICgoYlJlcXVlc3RJZk5vdEluaXRpYWxpemVkICYmICEodGhpcyBhcyBhbnkpLmdldERhdGFJbml0aWFsaXplZCgpKSB8fCB0aGlzLmdldFByb3BlcnR5KFwib3V0RGF0ZWRCaW5kaW5nXCIpKSB7XG5cdFx0XHR0aGlzLnNldFByb3BlcnR5KFwib3V0RGF0ZWRCaW5kaW5nXCIsIGZhbHNlKTtcblx0XHRcdCh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpPy5yZWJpbmQoKTtcblx0XHR9XG5cdH1cblxuXHRyZWZyZXNoTm90QXBwbGljYWJsZUZpZWxkcyhvRmlsdGVyQ29udHJvbDogQ29udHJvbCk6IGFueVtdIHtcblx0XHRjb25zdCBvVGFibGUgPSAodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKTtcblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMob0ZpbHRlckNvbnRyb2wsIG9UYWJsZSk7XG5cdH1cblxuXHRzdXNwZW5kQmluZGluZygpIHtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiYmluZGluZ1N1c3BlbmRlZFwiLCB0cnVlKTtcblx0fVxuXG5cdGludmFsaWRhdGVDb250ZW50KCkge1xuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJkYXRhSW5pdGlhbGl6ZWRcIiwgZmFsc2UpO1xuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJvdXREYXRlZEJpbmRpbmdcIiwgZmFsc2UpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uTWFzc0VkaXRCdXR0b25QcmVzc2VkKG9FdmVudDogVUk1RXZlbnQsIHBhZ2VDb250cm9sbGVyOiBhbnkpIHtcblx0XHRjb25zdCBvVGFibGUgPSB0aGlzLmNvbnRlbnQ7XG5cdFx0aWYgKHBhZ2VDb250cm9sbGVyICYmIHBhZ2VDb250cm9sbGVyLm1hc3NFZGl0KSB7XG5cdFx0XHRwYWdlQ29udHJvbGxlci5tYXNzRWRpdC5vcGVuTWFzc0VkaXREaWFsb2cob1RhYmxlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJUaGUgQ29udHJvbGxlciBpcyBub3QgZW5oYW5jZWQgd2l0aCBNYXNzIEVkaXQgZnVuY3Rpb25hbGl0eVwiKTtcblx0XHR9XG5cdH1cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uVGFibGVTZWxlY3Rpb25DaGFuZ2Uob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdHRoaXMuZmlyZUV2ZW50KFwic2VsZWN0aW9uQ2hhbmdlXCIsIG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4cG9zZSB0aGUgaW50ZXJuYWwgdGFibGUgZGVmaW5pdGlvbiBmb3IgZXh0ZXJuYWwgdXNhZ2UgaW4gZGVsZWdhdGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSB0YWJsZURlZmluaXRpb25cblx0ICovXG5cdGdldFRhYmxlRGVmaW5pdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy50YWJsZURlZmluaXRpb247XG5cdH1cblxuXHQvKipcblx0ICogY29ubmVjdCB0aGUgZmlsdGVyIHRvIHRoZSB0YWJsZUFQSSBpZiByZXF1aXJlZFxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5UYWJsZUFQSVxuXHQgKi9cblxuXHR1cGRhdGVGaWx0ZXJCYXIoKSB7XG5cdFx0Y29uc3QgdGFibGUgPSAodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKTtcblx0XHRjb25zdCBmaWx0ZXJCYXJSZWZJZCA9ICh0aGlzIGFzIGFueSkuZ2V0RmlsdGVyQmFyKCk7XG5cdFx0aWYgKHRhYmxlICYmIGZpbHRlckJhclJlZklkICYmIHRhYmxlLmdldEZpbHRlcigpICE9PSBmaWx0ZXJCYXJSZWZJZCkge1xuXHRcdFx0dGhpcy5fc2V0RmlsdGVyQmFyKGZpbHRlckJhclJlZklkKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgZmlsdGVyIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiBmaWx0ZXJCYXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJCYXJSZWZJZCBJZCBvZiB0aGUgZmlsdGVyIGJhclxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5UYWJsZUFQSVxuXHQgKi9cblx0X3NldEZpbHRlckJhcihmaWx0ZXJCYXJSZWZJZDogc3RyaW5nKTogdm9pZCB7XG5cdFx0Y29uc3QgdGFibGUgPSAodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKTtcblxuXHRcdC8vICdmaWx0ZXJCYXInIHByb3BlcnR5IG9mIG1hY3JvOlRhYmxlKHBhc3NlZCBhcyBjdXN0b21EYXRhKSBtaWdodCBiZVxuXHRcdC8vIDEuIEEgbG9jYWxJZCB3cnQgVmlldyhGUE0gZXhwbG9yZXIgZXhhbXBsZSkuXG5cdFx0Ly8gMi4gQWJzb2x1dGUgSWQodGhpcyB3YXMgbm90IHN1cHBvcnRlZCBpbiBvbGRlciB2ZXJzaW9ucykuXG5cdFx0Ly8gMy4gQSBsb2NhbElkIHdydCBGcmFnbWVudElkKHdoZW4gYW4gWE1MQ29tcG9zaXRlIG9yIEZyYWdtZW50IGlzIGluZGVwZW5kZW50bHkgcHJvY2Vzc2VkKSBpbnN0ZWFkIG9mIFZpZXdJZC5cblx0XHQvLyAgICAnZmlsdGVyQmFyJyB3YXMgc3VwcG9ydGVkIGVhcmxpZXIgYXMgYW4gJ2Fzc29jaWF0aW9uJyB0byB0aGUgJ21kYzpUYWJsZScgY29udHJvbCBpbnNpZGUgJ21hY3JvOlRhYmxlJyBpbiBwcmlvciB2ZXJzaW9ucy5cblx0XHQvLyAgICBJbiBuZXdlciB2ZXJzaW9ucyAnZmlsdGVyQmFyJyBpcyB1c2VkIGxpa2UgYW4gYXNzb2NpYXRpb24gdG8gJ21hY3JvOlRhYmxlQVBJJy5cblx0XHQvLyAgICBUaGlzIG1lYW5zIHRoYXQgdGhlIElkIGlzIHJlbGF0aXZlIHRvICdtYWNybzpUYWJsZUFQSScuXG5cdFx0Ly8gICAgVGhpcyBzY2VuYXJpbyBoYXBwZW5zIGluIGNhc2Ugb2YgRmlsdGVyQmFyIGFuZCBUYWJsZSBpbiBhIGN1c3RvbSBzZWN0aW9ucyBpbiBPUCBvZiBGRVY0LlxuXG5cdFx0Y29uc3QgdGFibGVBUElJZCA9IHRoaXM/LmdldElkKCk7XG5cdFx0Y29uc3QgdGFibGVBUElMb2NhbElkID0gdGhpcy5kYXRhKFwidGFibGVBUElMb2NhbElkXCIpO1xuXHRcdGNvbnN0IHBvdGVudGlhbGZpbHRlckJhcklkID1cblx0XHRcdHRhYmxlQVBJTG9jYWxJZCAmJiBmaWx0ZXJCYXJSZWZJZCAmJiB0YWJsZUFQSUlkICYmIHRhYmxlQVBJSWQucmVwbGFjZShuZXcgUmVnRXhwKHRhYmxlQVBJTG9jYWxJZCArIFwiJFwiKSwgZmlsdGVyQmFyUmVmSWQpOyAvLyAzXG5cblx0XHRjb25zdCBmaWx0ZXJCYXIgPVxuXHRcdFx0Q29tbW9uVXRpbHMuZ2V0VGFyZ2V0Vmlldyh0aGlzKT8uYnlJZChmaWx0ZXJCYXJSZWZJZCkgfHwgQ29yZS5ieUlkKGZpbHRlckJhclJlZklkKSB8fCBDb3JlLmJ5SWQocG90ZW50aWFsZmlsdGVyQmFySWQpO1xuXG5cdFx0aWYgKGZpbHRlckJhcikge1xuXHRcdFx0aWYgKGZpbHRlckJhci5pc0E8RmlsdGVyQmFyQVBJPihcInNhcC5mZS5tYWNyb3MuZmlsdGVyQmFyLkZpbHRlckJhckFQSVwiKSkge1xuXHRcdFx0XHR0YWJsZS5zZXRGaWx0ZXIoYCR7ZmlsdGVyQmFyLmdldElkKCl9LWNvbnRlbnRgKTtcblx0XHRcdH0gZWxzZSBpZiAoZmlsdGVyQmFyLmlzQTxGaWx0ZXJCYXI+KFwic2FwLnVpLm1kYy5GaWx0ZXJCYXJcIikpIHtcblx0XHRcdFx0dGFibGUuc2V0RmlsdGVyKGZpbHRlckJhci5nZXRJZCgpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjaGVja0lmQ29sdW1uRXhpc3RzKGFGaWx0ZXJlZENvbHVtbW5zOiBhbnksIGNvbHVtbk5hbWU6IGFueSkge1xuXHRcdHJldHVybiBhRmlsdGVyZWRDb2x1bW1ucy5zb21lKGZ1bmN0aW9uIChvQ29sdW1uOiBhbnkpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0KG9Db2x1bW4/LmNvbHVtbk5hbWUgPT09IGNvbHVtbk5hbWUgJiYgb0NvbHVtbj8uc0NvbHVtbk5hbWVWaXNpYmxlKSB8fFxuXHRcdFx0XHQob0NvbHVtbj8uc1RleHRBcnJhbmdlbWVudCAhPT0gdW5kZWZpbmVkICYmIG9Db2x1bW4/LnNUZXh0QXJyYW5nZW1lbnQgPT09IGNvbHVtbk5hbWUpXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIGNvbHVtbk5hbWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0Z2V0SWRlbnRpZmllckNvbHVtbigpOiBhbnkge1xuXHRcdGNvbnN0IG9UYWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdGNvbnN0IGhlYWRlckluZm9UaXRsZVBhdGggPSB0aGlzLmdldFRhYmxlRGVmaW5pdGlvbigpLmhlYWRlckluZm9UaXRsZTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlICYmIG9UYWJsZS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0c0N1cnJlbnRFbnRpdHlTZXROYW1lID0gb1RhYmxlLmRhdGEoXCJtZXRhUGF0aFwiKTtcblx0XHRjb25zdCBhVGVjaG5pY2FsS2V5cyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJFR5cGUvJEtleWApO1xuXHRcdGNvbnN0IGFGaWx0ZXJlZFRlY2huaWNhbEtleXM6IHN0cmluZ1tdID0gW107XG5cblx0XHRpZiAoYVRlY2huaWNhbEtleXMgJiYgYVRlY2huaWNhbEtleXMubGVuZ3RoID4gMCkge1xuXHRcdFx0YVRlY2huaWNhbEtleXMuZm9yRWFjaChmdW5jdGlvbiAodGVjaG5pY2FsS2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0aWYgKHRlY2huaWNhbEtleSAhPT0gXCJJc0FjdGl2ZUVudGl0eVwiKSB7XG5cdFx0XHRcdFx0YUZpbHRlcmVkVGVjaG5pY2FsS2V5cy5wdXNoKHRlY2huaWNhbEtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zdCBzZW1hbnRpY0tleUNvbHVtbnMgPSB0aGlzLmdldFRhYmxlRGVmaW5pdGlvbigpLnNlbWFudGljS2V5cztcblxuXHRcdGNvbnN0IGFWaXNpYmxlQ29sdW1uczogYW55ID0gW107XG5cdFx0Y29uc3QgYUZpbHRlcmVkQ29sdW1tbnM6IGFueSA9IFtdO1xuXHRcdGNvbnN0IGFUYWJsZUNvbHVtbnMgPSBvVGFibGUuZ2V0Q29sdW1ucygpO1xuXHRcdGFUYWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRjb25zdCBjb2x1bW4gPSBvQ29sdW1uPy5nZXREYXRhUHJvcGVydHkoKTtcblx0XHRcdGFWaXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0fSk7XG5cblx0XHRhVmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRjb25zdCBvVGV4dEFycmFuZ2VtZW50ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS8kVHlwZS8ke29Db2x1bW59QGApO1xuXHRcdFx0Y29uc3Qgc1RleHRBcnJhbmdlbWVudCA9IG9UZXh0QXJyYW5nZW1lbnQgJiYgb1RleHRBcnJhbmdlbWVudFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXT8uJFBhdGg7XG5cdFx0XHRjb25zdCBzVGV4dFBsYWNlbWVudCA9XG5cdFx0XHRcdG9UZXh0QXJyYW5nZW1lbnQgJiZcblx0XHRcdFx0b1RleHRBcnJhbmdlbWVudFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0/LiRFbnVtTWVtYmVyO1xuXHRcdFx0YUZpbHRlcmVkQ29sdW1tbnMucHVzaCh7XG5cdFx0XHRcdGNvbHVtbk5hbWU6IG9Db2x1bW4sXG5cdFx0XHRcdHNUZXh0QXJyYW5nZW1lbnQ6IHNUZXh0QXJyYW5nZW1lbnQsXG5cdFx0XHRcdHNDb2x1bW5OYW1lVmlzaWJsZTogIShzVGV4dFBsYWNlbWVudCA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIpXG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRsZXQgY29sdW1uOiBhbnk7XG5cblx0XHRpZiAoaGVhZGVySW5mb1RpdGxlUGF0aCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY2hlY2tJZkNvbHVtbkV4aXN0cyhhRmlsdGVyZWRDb2x1bW1ucywgaGVhZGVySW5mb1RpdGxlUGF0aCkpIHtcblx0XHRcdGNvbHVtbiA9IGhlYWRlckluZm9UaXRsZVBhdGg7XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdHNlbWFudGljS2V5Q29sdW1ucyAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRzZW1hbnRpY0tleUNvbHVtbnMubGVuZ3RoID09PSAxICYmXG5cdFx0XHR0aGlzLmNoZWNrSWZDb2x1bW5FeGlzdHMoYUZpbHRlcmVkQ29sdW1tbnMsIHNlbWFudGljS2V5Q29sdW1uc1swXSlcblx0XHQpIHtcblx0XHRcdGNvbHVtbiA9IHNlbWFudGljS2V5Q29sdW1uc1swXTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0YUZpbHRlcmVkVGVjaG5pY2FsS2V5cyAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRhRmlsdGVyZWRUZWNobmljYWxLZXlzLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0dGhpcy5jaGVja0lmQ29sdW1uRXhpc3RzKGFGaWx0ZXJlZENvbHVtbW5zLCBhRmlsdGVyZWRUZWNobmljYWxLZXlzWzBdKVxuXHRcdCkge1xuXHRcdFx0Y29sdW1uID0gYUZpbHRlcmVkVGVjaG5pY2FsS2V5c1swXTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbHVtbjtcblx0fVxuXG5cdGFzeW5jIHNldFVwRW1wdHlSb3dzKHRhYmxlOiBUYWJsZSwgY3JlYXRlQnV0dG9uV2FzUHJlc3NlZDogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0aWYgKHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2w/LmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLklubGluZUNyZWF0aW9uUm93cykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHR0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sPy5pbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlICYmXG5cdFx0XHQhdGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJ1aVwiKT8uZ2V0UHJvcGVydHkoXCJjcmVhdGVNb2RlXCIpICYmXG5cdFx0XHQhY3JlYXRlQnV0dG9uV2FzUHJlc3NlZFxuXHRcdCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCB3YWl0VGFibGVSZW5kZXJlZCA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRpZiAodGFibGUuZ2V0RG9tUmVmKCkpIHtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZGVsZWdhdGUgPSB7XG5cdFx0XHRcdFx0b25BZnRlclJlbmRlcmluZzogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dGFibGUucmVtb3ZlRXZlbnREZWxlZ2F0ZShkZWxlZ2F0ZSk7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0XHR0YWJsZS5hZGRFdmVudERlbGVnYXRlKGRlbGVnYXRlLCB0aGlzKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRhd2FpdCB3YWl0VGFibGVSZW5kZXJlZDtcblxuXHRcdGNvbnN0IHVpTW9kZWwgPSB0YWJsZS5nZXRNb2RlbChcInVpXCIpO1xuXHRcdGlmICh1aU1vZGVsLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVQZW5kaW5nXCIpKSB7XG5cdFx0XHQvLyBUaGUgZWRpdCBtb2RlIGlzIHN0aWxsIGJlaW5nIGNvbXB1dGVkLCBzbyB3ZSB3YWl0IHVudGlsIHRoaXMgY29tcHV0YXRpb24gaXMgZG9uZSBiZWZvcmUgY2hlY2tpbmcgaXRzIHZhbHVlXG5cdFx0XHRjb25zdCB3YXRjaEJpbmRpbmcgPSB1aU1vZGVsLmJpbmRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlUGVuZGluZ1wiKTtcblx0XHRcdGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGZuSGFuZGxlciA9ICgpID0+IHtcblx0XHRcdFx0XHR3YXRjaEJpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuSGFuZGxlcik7XG5cdFx0XHRcdFx0d2F0Y2hCaW5kaW5nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHdhdGNoQmluZGluZy5hdHRhY2hDaGFuZ2UoZm5IYW5kbGVyKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zdCBpc0luRWRpdE1vZGUgPSB1aU1vZGVsLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIik7XG5cdFx0aWYgKCFpc0luRWRpdE1vZGUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgYmluZGluZyA9IHRhYmxlLmdldFJvd0JpbmRpbmcoKSBhcyBPRGF0YUxpc3RCaW5kaW5nO1xuXHRcdGlmIChiaW5kaW5nLmlzUmVzb2x2ZWQoKSAmJiBiaW5kaW5nLmlzTGVuZ3RoRmluYWwoKSkge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhdGggPSBiaW5kaW5nLmdldENvbnRleHQoKS5nZXRQYXRoKCk7XG5cdFx0XHRjb25zdCBpbmFjdGl2ZUNvbnRleHQgPSBiaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cygpLmZpbmQoZnVuY3Rpb24gKGNvbnRleHQpIHtcblx0XHRcdFx0cmV0dXJuIGNvbnRleHQuaXNJbmFjdGl2ZSgpICYmIGNvbnRleHQuZ2V0UGF0aCgpLnN0YXJ0c1dpdGgoY29udGV4dFBhdGgpO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoIWluYWN0aXZlQ29udGV4dCkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLl9jcmVhdGVFbXB0eVJvdyhiaW5kaW5nLCB0YWJsZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGFzeW5jIF9jcmVhdGVFbXB0eVJvdyhvQmluZGluZzogT0RhdGFMaXN0QmluZGluZywgb1RhYmxlOiBUYWJsZSkge1xuXHRcdGNvbnN0IGlJbmxpbmVDcmVhdGlvblJvd0NvdW50ID0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbD8uaW5saW5lQ3JlYXRpb25Sb3dDb3VudCB8fCAyO1xuXHRcdGNvbnN0IGFEYXRhID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpSW5saW5lQ3JlYXRpb25Sb3dDb3VudDsgaSArPSAxKSB7XG5cdFx0XHRhRGF0YS5wdXNoKHt9KTtcblx0XHR9XG5cdFx0Y29uc3QgYkF0RW5kID0gb1RhYmxlLmRhdGEoXCJ0YWJsZVR5cGVcIikgIT09IFwiUmVzcG9uc2l2ZVRhYmxlXCI7XG5cdFx0Y29uc3QgYkluYWN0aXZlID0gdHJ1ZTtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1RhYmxlKTtcblx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblx0XHRjb25zdCBvSW50ZXJuYWxFZGl0RmxvdyA9IG9Db250cm9sbGVyLl9lZGl0Rmxvdztcblx0XHRpZiAoIXRoaXMuY3JlYXRpbmdFbXB0eVJvd3MpIHtcblx0XHRcdHRoaXMuY3JlYXRpbmdFbXB0eVJvd3MgPSB0cnVlO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgYUNvbnRleHRzID0gYXdhaXQgb0ludGVybmFsRWRpdEZsb3cuY3JlYXRlTXVsdGlwbGVEb2N1bWVudHMoXG5cdFx0XHRcdFx0b0JpbmRpbmcsXG5cdFx0XHRcdFx0YURhdGEsXG5cdFx0XHRcdFx0YkF0RW5kLFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdG9Db250cm9sbGVyLmVkaXRGbG93Lm9uQmVmb3JlQ3JlYXRlLFxuXHRcdFx0XHRcdGJJbmFjdGl2ZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRhQ29udGV4dHM/LmZvckVhY2goZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRcdFx0XHRvQ29udGV4dC5jcmVhdGVkKCkuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAoIW9FcnJvci5jYW5jZWxlZCkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoZSBhcyBhbnkpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0dGhpcy5jcmVhdGluZ0VtcHR5Um93cyA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBUYWJsZUFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFrTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWJBLElBZU1BLFFBQVEsV0FEYkMsY0FBYyxDQUFDLDhCQUE4QixDQUFDLFVBa0I3Q0MsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxRQUFRO0lBQ2RDLGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixDQUFDO0lBQzdFQyxtQkFBbUIsRUFBRSxDQUNwQixxQ0FBcUMsRUFDckMsZ0RBQWdELEVBQ2hELHlEQUF5RDtFQUUzRCxDQUFDLENBQUMsVUFHREgsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUF1QixDQUFDLENBQUMsVUFVMUNELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVSxDQUFDLENBQUMsVUFRN0JELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFRNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFVbERKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFRyxZQUFZLEVBQUU7RUFBa0IsQ0FBQyxDQUFDLFVBUTdESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBUWpESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBVTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBUTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBUTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFdBUWpESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFdBUWpEQyxXQUFXLENBQUM7SUFBRUosSUFBSSxFQUFFO0VBQTZCLENBQUMsQ0FBQyxXQVFuREksV0FBVyxDQUFDO0lBQUVKLElBQUks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U0FBUyxhQUFUQSxTQUFTLHVCQUFUQSxTQUFTLENBQUV4RCxPQUFPLENBQUMsVUFBVW5JLFFBQWEsRUFBRTtZQUMzQ0EsUUFBUSxDQUFDK0wsT0FBTyxFQUFFLENBQUNuTSxLQUFLLENBQUMsVUFBVW9NLE1BQVcsRUFBRTtjQUMvQyxJQUFJLENBQUNBLE1BQU0sQ0FBQ0MsUUFBUSxFQUFFO2dCQUNyQixNQUFNRCxNQUFNO2NBQ2I7WUFDRCxDQUFDLENBQUM7VUFDSCxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsT0FBT3hOLENBQUMsRUFBRTtVQUNYd0gsR0FBRyxDQUFDNUQsS0FBSyxDQUFDNUQsQ0FBQyxDQUFRO1FBQ3BCLENBQUMsU0FBUztVQUNULElBQUksQ0FBQ2tOLGlCQUFpQixHQUFHLEtBQUs7UUFDL0I7TUFDRDtJQUNELENBQUM7SUFBQTtFQUFBLEVBenZCcUJRLFFBQVE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9BNHZCaEJuUSxRQUFRO0FBQUEifQ==