/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/StableIdHelper", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/Utils", "sap/m/SegmentedButton", "sap/m/SegmentedButtonItem", "sap/m/Select", "sap/ui/core/Control", "sap/ui/core/Core", "sap/ui/core/Item", "sap/ui/model/json/JSONModel"], function (Log, CommonUtils, ClassSupport, StableIdHelper, ChartUtils, DelegateUtil, TableUtils, SegmentedButton, SegmentedButtonItem, Select, Control, Core, Item, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var generate = StableIdHelper.generate;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const PROPERTY_QUICKFILTER_KEY = "quickFilterKey";
  const FILTER_MODEL = "filters";
  /**
   *  Container Control for Table QuickFilters
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  let QuickFilterContainer = (_dec = defineUI5Class("sap.fe.macros.table.QuickFilterContainer", {
    interfaces: ["sap.m.IOverflowToolbarContent"]
  }), _dec2 = property({
    type: "boolean"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string",
    defaultValue: "$auto"
  }), _dec6 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(QuickFilterContainer, _Control);
    function QuickFilterContainer() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "showCounts", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "parentEntityType", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "batchGroupId", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selector", _descriptor5, _assertThisInitialized(_this));
      _this._attachedToView = false;
      return _this;
    }
    QuickFilterContainer.render = function render(oRm, oControl) {
      const macroBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      oRm.renderControl(oControl.selector);
      oRm.attr("aria-label", macroBundle.getText("M_TABLE_QUICKFILTER_ARIA"));
    };
    var _proto = QuickFilterContainer.prototype;
    _proto.init = function init() {
      _Control.prototype.init.call(this);
      this._attachedToView = false;
      this.attachEvent("modelContextChange", this._initControl);
      const oDelegateOnBeforeRendering = {
        onBeforeRendering: () => {
          // Need to wait for Control rendering to get parent view (.i.e into OP the highest parent is the Object Section)
          this._createControlSideEffects();
          this._attachedToView = true;
          this.removeEventDelegate(oDelegateOnBeforeRendering);
        }
      };
      this.addEventDelegate(oDelegateOnBeforeRendering, this);
    };
    _proto._initControl = function _initControl(oEvent) {
      // Need to wait for the OData Model to be propagated (models are propagated one by one when we come from FLP)
      if (this.getModel()) {
        this.detachEvent(oEvent.getId(), this._initControl);
        this._manageTable();
        this._createContent();
      }
    };
    _proto._manageTable = function _manageTable() {
      var _this$_oTable, _this$_oTable$getPare;
      let oControl = this.getParent();
      const oModel = this._getFilterModel(),
        aFilters = oModel.getObject("/paths"),
        sDefaultFilter = Array.isArray(aFilters) && aFilters.length > 0 ? aFilters[0].annotationPath : undefined;
      while (oControl && !oControl.isA("sap.ui.mdc.Table")) {
        oControl = oControl.getParent();
      }
      this._oTable = oControl;
      const FilterControl = Core.byId(this._oTable.getFilter());
      if (FilterControl && FilterControl.isA("sap.ui.mdc.FilterBar")) {
        FilterControl.attachFiltersChanged(this._onFiltersChanged.bind(this));
      }
      (_this$_oTable = this._oTable) === null || _this$_oTable === void 0 ? void 0 : (_this$_oTable$getPare = _this$_oTable.getParent()) === null || _this$_oTable$getPare === void 0 ? void 0 : _this$_oTable$getPare.attachEvent("internalDataRequested", this._onTableDataRequested.bind(this));
      DelegateUtil.setCustomData(oControl, PROPERTY_QUICKFILTER_KEY, sDefaultFilter);
    };
    _proto._onFiltersChanged = function _onFiltersChanged(event) {
      if (event.getParameter("conditionsBased")) {
        this.selector.setProperty("enabled", false);
      }
    };
    _proto._onTableDataRequested = function _onTableDataRequested() {
      this.selector.setProperty("enabled", true);
      if (this.showCounts) {
        this._updateCounts();
      }
    };
    _proto.setSelectorKey = function setSelectorKey(sKey) {
      const oSelector = this.selector;
      if (oSelector && oSelector.getSelectedKey() !== sKey) {
        oSelector.setSelectedKey(sKey);
        DelegateUtil.setCustomData(this._oTable, PROPERTY_QUICKFILTER_KEY, sKey);

        // Rebind the table to reflect the change in quick filter key.
        // We don't rebind the table if the filterbar for the table is suspended
        // as rebind will be done when the filterbar is resumed
        const sFilterBarID = this._oTable.getFilter && this._oTable.getFilter();
        const oFilterBar = sFilterBarID && Core.byId(sFilterBarID);
        const bSkipRebind = oFilterBar && oFilterBar.getSuspendSelection && oFilterBar.getSuspendSelection();
        if (!bSkipRebind) {
          this._oTable.rebind();
        }
      }
    };
    _proto.getSelectorKey = function getSelectorKey() {
      const oSelector = this.selector;
      return oSelector ? oSelector.getSelectedKey() : null;
    };
    _proto.getDomRef = function getDomRef(sSuffix) {
      const oSelector = this.selector;
      return oSelector ? oSelector.getDomRef(sSuffix) : null;
    };
    _proto._getFilterModel = function _getFilterModel() {
      let oModel = this.getModel(FILTER_MODEL);
      if (!oModel) {
        const mFilters = DelegateUtil.getCustomData(this, FILTER_MODEL);
        oModel = new JSONModel(mFilters);
        this.setModel(oModel, FILTER_MODEL);
      }
      return oModel;
    }
    /**
     * Create QuickFilter Selector (Select or SegmentedButton).
     */;
    _proto._createContent = function _createContent() {
      const oModel = this._getFilterModel(),
        aFilters = oModel.getObject("/paths"),
        bIsSelect = aFilters.length > 3,
        mSelectorOptions = {
          id: generate([this._oTable.getId(), "QuickFilter"]),
          enabled: oModel.getObject("/enabled"),
          items: {
            path: `${FILTER_MODEL}>/paths`,
            factory: (sId, oBindingContext) => {
              const mItemOptions = {
                key: oBindingContext.getObject().annotationPath,
                text: this._getSelectorItemText(oBindingContext)
              };
              return bIsSelect ? new Item(mItemOptions) : new SegmentedButtonItem(mItemOptions);
            }
          }
        };
      if (bIsSelect) {
        mSelectorOptions.autoAdjustWidth = true;
      }
      mSelectorOptions[bIsSelect ? "change" : "selectionChange"] = this._onSelectionChange.bind(this);
      this.selector = bIsSelect ? new Select(mSelectorOptions) : new SegmentedButton(mSelectorOptions);
    }

    /**
     * Returns properties for the interface IOverflowToolbarContent.
     *
     * @returns {object} Returns the configuration of IOverflowToolbarContent
     */;
    _proto.getOverflowToolbarConfig = function getOverflowToolbarConfig() {
      return {
        canOverflow: true
      };
    }

    /**
     * Creates SideEffects control that must be executed when table cells that are related to configured filter(s) change.
     *
     */;
    _proto._createControlSideEffects = function _createControlSideEffects() {
      const oSvControl = this.selector,
        oSvItems = oSvControl.getItems(),
        sTableNavigationPath = DelegateUtil.getCustomData(this._oTable, "navigationPath");
      /**
       * Cannot execute SideEffects with targetEntity = current Table collection
       */

      if (sTableNavigationPath) {
        var _this$_getSideEffectC;
        const aSourceProperties = [];
        for (const k in oSvItems) {
          const sItemKey = oSvItems[k].getKey(),
            oFilterInfos = TableUtils.getFiltersInfoForSV(this._oTable, sItemKey);
          oFilterInfos.properties.forEach(function (sProperty) {
            const sPropertyPath = `${sTableNavigationPath}/${sProperty}`;
            if (!aSourceProperties.includes(sPropertyPath)) {
              aSourceProperties.push(sPropertyPath);
            }
          });
        }
        (_this$_getSideEffectC = this._getSideEffectController()) === null || _this$_getSideEffectC === void 0 ? void 0 : _this$_getSideEffectC.addControlSideEffects(this.parentEntityType, {
          SourceProperties: aSourceProperties,
          TargetEntities: [{
            $NavigationPropertyPath: sTableNavigationPath
          }],
          sourceControlId: this.getId()
        });
      }
    };
    _proto._getSelectorItemText = function _getSelectorItemText(oItemContext) {
      const annotationPath = oItemContext.getObject().annotationPath,
        itemPath = oItemContext.getPath(),
        oMetaModel = this.getModel().getMetaModel(),
        oQuickFilter = oMetaModel.getObject(`${this.entitySet}/${annotationPath}`);
      return oQuickFilter.Text + (this.showCounts ? ` ({${FILTER_MODEL}>${itemPath}/count})` : "");
    };
    _proto._getSideEffectController = function _getSideEffectController() {
      const oController = this._getViewController();
      return oController ? oController._sideEffects : undefined;
    };
    _proto._getViewController = function _getViewController() {
      const oView = CommonUtils.getTargetView(this);
      return oView && oView.getController();
    }
    /**
     * Manage List Binding request related to Counts on QuickFilter control and update text
     * in line with batch result.
     *
     */;
    _proto._updateCounts = function _updateCounts() {
      const oTable = this._oTable,
        oController = this._getViewController(),
        oSvControl = this.selector,
        oSvItems = oSvControl.getItems(),
        oModel = this._getFilterModel(),
        aBindingPromises = [],
        aInitialItemTexts = [];
      let aAdditionalFilters = [];
      let aChartFilters = [];
      const sCurrentFilterKey = DelegateUtil.getCustomData(oTable, PROPERTY_QUICKFILTER_KEY);

      // Add filters related to the chart for ALP
      if (oController && oController.getChartControl) {
        const oChart = oController.getChartControl();
        if (oChart) {
          const oChartFilterInfo = ChartUtils.getAllFilterInfo(oChart);
          if (oChartFilterInfo && oChartFilterInfo.filters.length) {
            aChartFilters = oChartFilterInfo.filters;
          }
        }
      }
      aAdditionalFilters = aAdditionalFilters.concat(TableUtils.getHiddenFilters(oTable)).concat(aChartFilters);
      for (const k in oSvItems) {
        const sItemKey = oSvItems[k].getKey(),
          oFilterInfos = TableUtils.getFiltersInfoForSV(oTable, sItemKey);
        aInitialItemTexts.push(oFilterInfos.text);
        oModel.setProperty(`/paths/${k}/count`, "...");
        aBindingPromises.push(TableUtils.getListBindingForCount(oTable, oTable.getBindingContext(), {
          batchGroupId: sItemKey === sCurrentFilterKey ? this.batchGroupId : "$auto",
          additionalFilters: aAdditionalFilters.concat(oFilterInfos.filters)
        }));
      }
      Promise.all(aBindingPromises).then(function (aCounts) {
        for (const k in aCounts) {
          oModel.setProperty(`/paths/${k}/count`, TableUtils.getCountFormatted(aCounts[k]));
        }
      }).catch(function (oError) {
        Log.error("Error while retrieving the binding promises", oError);
      });
    };
    _proto._onSelectionChange = function _onSelectionChange(oEvent) {
      const oControl = oEvent.getSource();
      DelegateUtil.setCustomData(this._oTable, PROPERTY_QUICKFILTER_KEY, oControl.getSelectedKey());
      this._oTable.rebind();
      const oController = this._getViewController();
      if (oController && oController.getExtensionAPI && oController.getExtensionAPI().updateAppState) {
        oController.getExtensionAPI().updateAppState();
      }
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      if (this._attachedToView) {
        const oSideEffects = this._getSideEffectController();
        if (oSideEffects) {
          // if "destroy" signal comes when view is destroyed there is not anymore reference to Controller Extension
          oSideEffects.removeControlSideEffects(this);
        }
      }
      delete this._oTable;
      _Control.prototype.destroy.call(this, bSuppressInvalidate);
    };
    return QuickFilterContainer;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "showCounts", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "parentEntityType", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "batchGroupId", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "selector", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return QuickFilterContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVkiLCJGSUxURVJfTU9ERUwiLCJRdWlja0ZpbHRlckNvbnRhaW5lciIsImRlZmluZVVJNUNsYXNzIiwiaW50ZXJmYWNlcyIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFnZ3JlZ2F0aW9uIiwibXVsdGlwbGUiLCJpc0RlZmF1bHQiLCJfYXR0YWNoZWRUb1ZpZXciLCJyZW5kZXIiLCJvUm0iLCJvQ29udHJvbCIsIm1hY3JvQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInJlbmRlckNvbnRyb2wiLCJzZWxlY3RvciIsImF0dHIiLCJnZXRUZXh0IiwiaW5pdCIsImF0dGFjaEV2ZW50IiwiX2luaXRDb250cm9sIiwib0RlbGVnYXRlT25CZWZvcmVSZW5kZXJpbmciLCJvbkJlZm9yZVJlbmRlcmluZyIsIl9jcmVhdGVDb250cm9sU2lkZUVmZmVjdHMiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsIm9FdmVudCIsImdldE1vZGVsIiwiZGV0YWNoRXZlbnQiLCJnZXRJZCIsIl9tYW5hZ2VUYWJsZSIsIl9jcmVhdGVDb250ZW50IiwiZ2V0UGFyZW50Iiwib01vZGVsIiwiX2dldEZpbHRlck1vZGVsIiwiYUZpbHRlcnMiLCJnZXRPYmplY3QiLCJzRGVmYXVsdEZpbHRlciIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsImFubm90YXRpb25QYXRoIiwidW5kZWZpbmVkIiwiaXNBIiwiX29UYWJsZSIsIkZpbHRlckNvbnRyb2wiLCJieUlkIiwiZ2V0RmlsdGVyIiwiYXR0YWNoRmlsdGVyc0NoYW5nZWQiLCJfb25GaWx0ZXJzQ2hhbmdlZCIsImJpbmQiLCJfb25UYWJsZURhdGFSZXF1ZXN0ZWQiLCJEZWxlZ2F0ZVV0aWwiLCJzZXRDdXN0b21EYXRhIiwiZXZlbnQiLCJnZXRQYXJhbWV0ZXIiLCJzZXRQcm9wZXJ0eSIsInNob3dDb3VudHMiLCJfdXBkYXRlQ291bnRzIiwic2V0U2VsZWN0b3JLZXkiLCJzS2V5Iiwib1NlbGVjdG9yIiwiZ2V0U2VsZWN0ZWRLZXkiLCJzZXRTZWxlY3RlZEtleSIsInNGaWx0ZXJCYXJJRCIsIm9GaWx0ZXJCYXIiLCJiU2tpcFJlYmluZCIsImdldFN1c3BlbmRTZWxlY3Rpb24iLCJyZWJpbmQiLCJnZXRTZWxlY3RvcktleSIsImdldERvbVJlZiIsInNTdWZmaXgiLCJtRmlsdGVycyIsImdldEN1c3RvbURhdGEiLCJKU09OTW9kZWwiLCJzZXRNb2RlbCIsImJJc1NlbGVjdCIsIm1TZWxlY3Rvck9wdGlvbnMiLCJpZCIsImdlbmVyYXRlIiwiZW5hYmxlZCIsIml0ZW1zIiwicGF0aCIsImZhY3RvcnkiLCJzSWQiLCJvQmluZGluZ0NvbnRleHQiLCJtSXRlbU9wdGlvbnMiLCJrZXkiLCJ0ZXh0IiwiX2dldFNlbGVjdG9ySXRlbVRleHQiLCJJdGVtIiwiU2VnbWVudGVkQnV0dG9uSXRlbSIsImF1dG9BZGp1c3RXaWR0aCIsIl9vblNlbGVjdGlvbkNoYW5nZSIsIlNlbGVjdCIsIlNlZ21lbnRlZEJ1dHRvbiIsImdldE92ZXJmbG93VG9vbGJhckNvbmZpZyIsImNhbk92ZXJmbG93Iiwib1N2Q29udHJvbCIsIm9Tdkl0ZW1zIiwiZ2V0SXRlbXMiLCJzVGFibGVOYXZpZ2F0aW9uUGF0aCIsImFTb3VyY2VQcm9wZXJ0aWVzIiwiayIsInNJdGVtS2V5IiwiZ2V0S2V5Iiwib0ZpbHRlckluZm9zIiwiVGFibGVVdGlscyIsImdldEZpbHRlcnNJbmZvRm9yU1YiLCJwcm9wZXJ0aWVzIiwiZm9yRWFjaCIsInNQcm9wZXJ0eSIsInNQcm9wZXJ0eVBhdGgiLCJpbmNsdWRlcyIsInB1c2giLCJfZ2V0U2lkZUVmZmVjdENvbnRyb2xsZXIiLCJhZGRDb250cm9sU2lkZUVmZmVjdHMiLCJwYXJlbnRFbnRpdHlUeXBlIiwiU291cmNlUHJvcGVydGllcyIsIlRhcmdldEVudGl0aWVzIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJzb3VyY2VDb250cm9sSWQiLCJvSXRlbUNvbnRleHQiLCJpdGVtUGF0aCIsImdldFBhdGgiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib1F1aWNrRmlsdGVyIiwiZW50aXR5U2V0IiwiVGV4dCIsIm9Db250cm9sbGVyIiwiX2dldFZpZXdDb250cm9sbGVyIiwiX3NpZGVFZmZlY3RzIiwib1ZpZXciLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJnZXRDb250cm9sbGVyIiwib1RhYmxlIiwiYUJpbmRpbmdQcm9taXNlcyIsImFJbml0aWFsSXRlbVRleHRzIiwiYUFkZGl0aW9uYWxGaWx0ZXJzIiwiYUNoYXJ0RmlsdGVycyIsInNDdXJyZW50RmlsdGVyS2V5IiwiZ2V0Q2hhcnRDb250cm9sIiwib0NoYXJ0Iiwib0NoYXJ0RmlsdGVySW5mbyIsIkNoYXJ0VXRpbHMiLCJnZXRBbGxGaWx0ZXJJbmZvIiwiZmlsdGVycyIsImNvbmNhdCIsImdldEhpZGRlbkZpbHRlcnMiLCJnZXRMaXN0QmluZGluZ0ZvckNvdW50IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJiYXRjaEdyb3VwSWQiLCJhZGRpdGlvbmFsRmlsdGVycyIsIlByb21pc2UiLCJhbGwiLCJ0aGVuIiwiYUNvdW50cyIsImdldENvdW50Rm9ybWF0dGVkIiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImdldFNvdXJjZSIsImdldEV4dGVuc2lvbkFQSSIsInVwZGF0ZUFwcFN0YXRlIiwiZGVzdHJveSIsImJTdXBwcmVzc0ludmFsaWRhdGUiLCJvU2lkZUVmZmVjdHMiLCJyZW1vdmVDb250cm9sU2lkZUVmZmVjdHMiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJRdWlja0ZpbHRlckNvbnRhaW5lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBDaGFydFV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0VXRpbHNcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgVGFibGVVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IFNlZ21lbnRlZEJ1dHRvbiBmcm9tIFwic2FwL20vU2VnbWVudGVkQnV0dG9uXCI7XG5pbXBvcnQgU2VnbWVudGVkQnV0dG9uSXRlbSBmcm9tIFwic2FwL20vU2VnbWVudGVkQnV0dG9uSXRlbVwiO1xuaW1wb3J0IFNlbGVjdCBmcm9tIFwic2FwL20vU2VsZWN0XCI7XG5pbXBvcnQgdHlwZSBVSTVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IEl0ZW0gZnJvbSBcInNhcC91aS9jb3JlL0l0ZW1cIjtcbmltcG9ydCB0eXBlIFJlbmRlck1hbmFnZXIgZnJvbSBcInNhcC91aS9jb3JlL1JlbmRlck1hbmFnZXJcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcblxuY29uc3QgUFJPUEVSVFlfUVVJQ0tGSUxURVJfS0VZID0gXCJxdWlja0ZpbHRlcktleVwiO1xuY29uc3QgRklMVEVSX01PREVMID0gXCJmaWx0ZXJzXCI7XG4vKipcbiAqICBDb250YWluZXIgQ29udHJvbCBmb3IgVGFibGUgUXVpY2tGaWx0ZXJzXG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgaW50ZXJuYWwvZXhwZXJpbWVudGFsIHVzZSFcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5RdWlja0ZpbHRlckNvbnRhaW5lclwiLCB7XG5cdGludGVyZmFjZXM6IFtcInNhcC5tLklPdmVyZmxvd1Rvb2xiYXJDb250ZW50XCJdXG59KVxuY2xhc3MgUXVpY2tGaWx0ZXJDb250YWluZXIgZXh0ZW5kcyBDb250cm9sIHtcblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSkgc2hvd0NvdW50cyE6IGJvb2xlYW47XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRlbnRpdHlTZXQhOiBzdHJpbmc7XG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0cGFyZW50RW50aXR5VHlwZSE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0VmFsdWU6IFwiJGF1dG9cIiB9KVxuXHRiYXRjaEdyb3VwSWQhOiBzdHJpbmc7XG5cblx0QGFnZ3JlZ2F0aW9uKHtcblx0XHR0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIixcblx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0aXNEZWZhdWx0OiB0cnVlXG5cdH0pXG5cdHNlbGVjdG9yITogU2VsZWN0IHwgU2VnbWVudGVkQnV0dG9uO1xuXHRwcml2YXRlIF9vVGFibGU/OiBUYWJsZTtcblx0cHJpdmF0ZSBfYXR0YWNoZWRUb1ZpZXc6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRzdGF0aWMgcmVuZGVyKG9SbTogUmVuZGVyTWFuYWdlciwgb0NvbnRyb2w6IFF1aWNrRmlsdGVyQ29udGFpbmVyKSB7XG5cdFx0Y29uc3QgbWFjcm9CdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRyb2wuc2VsZWN0b3IpO1xuXHRcdG9SbS5hdHRyKFwiYXJpYS1sYWJlbFwiLCBtYWNyb0J1bmRsZS5nZXRUZXh0KFwiTV9UQUJMRV9RVUlDS0ZJTFRFUl9BUklBXCIpKTtcblx0fVxuXHRpbml0KCkge1xuXHRcdHN1cGVyLmluaXQoKTtcblx0XHR0aGlzLl9hdHRhY2hlZFRvVmlldyA9IGZhbHNlO1xuXHRcdHRoaXMuYXR0YWNoRXZlbnQoXCJtb2RlbENvbnRleHRDaGFuZ2VcIiwgdGhpcy5faW5pdENvbnRyb2wpO1xuXHRcdGNvbnN0IG9EZWxlZ2F0ZU9uQmVmb3JlUmVuZGVyaW5nID0ge1xuXHRcdFx0b25CZWZvcmVSZW5kZXJpbmc6ICgpID0+IHtcblx0XHRcdFx0Ly8gTmVlZCB0byB3YWl0IGZvciBDb250cm9sIHJlbmRlcmluZyB0byBnZXQgcGFyZW50IHZpZXcgKC5pLmUgaW50byBPUCB0aGUgaGlnaGVzdCBwYXJlbnQgaXMgdGhlIE9iamVjdCBTZWN0aW9uKVxuXHRcdFx0XHR0aGlzLl9jcmVhdGVDb250cm9sU2lkZUVmZmVjdHMoKTtcblx0XHRcdFx0dGhpcy5fYXR0YWNoZWRUb1ZpZXcgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLnJlbW92ZUV2ZW50RGVsZWdhdGUob0RlbGVnYXRlT25CZWZvcmVSZW5kZXJpbmcpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5hZGRFdmVudERlbGVnYXRlKG9EZWxlZ2F0ZU9uQmVmb3JlUmVuZGVyaW5nLCB0aGlzKTtcblx0fVxuXHRfaW5pdENvbnRyb2wob0V2ZW50OiBhbnkpIHtcblx0XHQvLyBOZWVkIHRvIHdhaXQgZm9yIHRoZSBPRGF0YSBNb2RlbCB0byBiZSBwcm9wYWdhdGVkIChtb2RlbHMgYXJlIHByb3BhZ2F0ZWQgb25lIGJ5IG9uZSB3aGVuIHdlIGNvbWUgZnJvbSBGTFApXG5cdFx0aWYgKHRoaXMuZ2V0TW9kZWwoKSkge1xuXHRcdFx0dGhpcy5kZXRhY2hFdmVudChvRXZlbnQuZ2V0SWQoKSwgdGhpcy5faW5pdENvbnRyb2wpO1xuXHRcdFx0dGhpcy5fbWFuYWdlVGFibGUoKTtcblx0XHRcdHRoaXMuX2NyZWF0ZUNvbnRlbnQoKTtcblx0XHR9XG5cdH1cblx0X21hbmFnZVRhYmxlKCkge1xuXHRcdGxldCBvQ29udHJvbCA9IHRoaXMuZ2V0UGFyZW50KCk7XG5cdFx0Y29uc3Qgb01vZGVsID0gdGhpcy5fZ2V0RmlsdGVyTW9kZWwoKSxcblx0XHRcdGFGaWx0ZXJzID0gb01vZGVsLmdldE9iamVjdChcIi9wYXRoc1wiKSxcblx0XHRcdHNEZWZhdWx0RmlsdGVyID0gQXJyYXkuaXNBcnJheShhRmlsdGVycykgJiYgYUZpbHRlcnMubGVuZ3RoID4gMCA/IGFGaWx0ZXJzWzBdLmFubm90YXRpb25QYXRoIDogdW5kZWZpbmVkO1xuXG5cdFx0d2hpbGUgKG9Db250cm9sICYmICFvQ29udHJvbC5pc0E8VGFibGU+KFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHR9XG5cdFx0dGhpcy5fb1RhYmxlID0gb0NvbnRyb2whO1xuXG5cdFx0Y29uc3QgRmlsdGVyQ29udHJvbCA9IENvcmUuYnlJZCh0aGlzLl9vVGFibGUuZ2V0RmlsdGVyKCkpO1xuXHRcdGlmIChGaWx0ZXJDb250cm9sICYmIEZpbHRlckNvbnRyb2wuaXNBPEZpbHRlckJhcj4oXCJzYXAudWkubWRjLkZpbHRlckJhclwiKSkge1xuXHRcdFx0RmlsdGVyQ29udHJvbC5hdHRhY2hGaWx0ZXJzQ2hhbmdlZCh0aGlzLl9vbkZpbHRlcnNDaGFuZ2VkLmJpbmQodGhpcykpO1xuXHRcdH1cblx0XHR0aGlzLl9vVGFibGU/LmdldFBhcmVudCgpPy5hdHRhY2hFdmVudChcImludGVybmFsRGF0YVJlcXVlc3RlZFwiLCB0aGlzLl9vblRhYmxlRGF0YVJlcXVlc3RlZC5iaW5kKHRoaXMpKTtcblx0XHREZWxlZ2F0ZVV0aWwuc2V0Q3VzdG9tRGF0YShvQ29udHJvbCwgUFJPUEVSVFlfUVVJQ0tGSUxURVJfS0VZLCBzRGVmYXVsdEZpbHRlcik7XG5cdH1cblxuXHRfb25GaWx0ZXJzQ2hhbmdlZChldmVudDogVUk1RXZlbnQpIHtcblx0XHRpZiAoZXZlbnQuZ2V0UGFyYW1ldGVyKFwiY29uZGl0aW9uc0Jhc2VkXCIpKSB7XG5cdFx0XHR0aGlzLnNlbGVjdG9yLnNldFByb3BlcnR5KFwiZW5hYmxlZFwiLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG5cblx0X29uVGFibGVEYXRhUmVxdWVzdGVkKCkge1xuXHRcdHRoaXMuc2VsZWN0b3Iuc2V0UHJvcGVydHkoXCJlbmFibGVkXCIsIHRydWUpO1xuXHRcdGlmICh0aGlzLnNob3dDb3VudHMpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZUNvdW50cygpO1xuXHRcdH1cblx0fVxuXHRzZXRTZWxlY3RvcktleShzS2V5OiBhbnkpIHtcblx0XHRjb25zdCBvU2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yO1xuXHRcdGlmIChvU2VsZWN0b3IgJiYgb1NlbGVjdG9yLmdldFNlbGVjdGVkS2V5KCkgIT09IHNLZXkpIHtcblx0XHRcdG9TZWxlY3Rvci5zZXRTZWxlY3RlZEtleShzS2V5KTtcblx0XHRcdERlbGVnYXRlVXRpbC5zZXRDdXN0b21EYXRhKHRoaXMuX29UYWJsZSwgUFJPUEVSVFlfUVVJQ0tGSUxURVJfS0VZLCBzS2V5KTtcblxuXHRcdFx0Ly8gUmViaW5kIHRoZSB0YWJsZSB0byByZWZsZWN0IHRoZSBjaGFuZ2UgaW4gcXVpY2sgZmlsdGVyIGtleS5cblx0XHRcdC8vIFdlIGRvbid0IHJlYmluZCB0aGUgdGFibGUgaWYgdGhlIGZpbHRlcmJhciBmb3IgdGhlIHRhYmxlIGlzIHN1c3BlbmRlZFxuXHRcdFx0Ly8gYXMgcmViaW5kIHdpbGwgYmUgZG9uZSB3aGVuIHRoZSBmaWx0ZXJiYXIgaXMgcmVzdW1lZFxuXHRcdFx0Y29uc3Qgc0ZpbHRlckJhcklEID0gdGhpcy5fb1RhYmxlIS5nZXRGaWx0ZXIgJiYgdGhpcy5fb1RhYmxlIS5nZXRGaWx0ZXIoKTtcblx0XHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBzRmlsdGVyQmFySUQgJiYgKENvcmUuYnlJZChzRmlsdGVyQmFySUQpIGFzIEZpbHRlckJhcik7XG5cdFx0XHRjb25zdCBiU2tpcFJlYmluZCA9IG9GaWx0ZXJCYXIgJiYgb0ZpbHRlckJhci5nZXRTdXNwZW5kU2VsZWN0aW9uICYmIG9GaWx0ZXJCYXIuZ2V0U3VzcGVuZFNlbGVjdGlvbigpO1xuXG5cdFx0XHRpZiAoIWJTa2lwUmViaW5kKSB7XG5cdFx0XHRcdCh0aGlzLl9vVGFibGUgYXMgYW55KS5yZWJpbmQoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Z2V0U2VsZWN0b3JLZXkoKSB7XG5cdFx0Y29uc3Qgb1NlbGVjdG9yID0gdGhpcy5zZWxlY3Rvcjtcblx0XHRyZXR1cm4gb1NlbGVjdG9yID8gb1NlbGVjdG9yLmdldFNlbGVjdGVkS2V5KCkgOiBudWxsO1xuXHR9XG5cdGdldERvbVJlZihzU3VmZml4Pzogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb1NlbGVjdG9yID0gdGhpcy5zZWxlY3Rvcjtcblx0XHRyZXR1cm4gb1NlbGVjdG9yID8gb1NlbGVjdG9yLmdldERvbVJlZihzU3VmZml4KSA6IChudWxsIGFzIGFueSk7XG5cdH1cblx0X2dldEZpbHRlck1vZGVsKCkge1xuXHRcdGxldCBvTW9kZWwgPSB0aGlzLmdldE1vZGVsKEZJTFRFUl9NT0RFTCk7XG5cdFx0aWYgKCFvTW9kZWwpIHtcblx0XHRcdGNvbnN0IG1GaWx0ZXJzID0gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEodGhpcywgRklMVEVSX01PREVMKTtcblx0XHRcdG9Nb2RlbCA9IG5ldyBKU09OTW9kZWwobUZpbHRlcnMpO1xuXHRcdFx0dGhpcy5zZXRNb2RlbChvTW9kZWwsIEZJTFRFUl9NT0RFTCk7XG5cdFx0fVxuXHRcdHJldHVybiBvTW9kZWw7XG5cdH1cblx0LyoqXG5cdCAqIENyZWF0ZSBRdWlja0ZpbHRlciBTZWxlY3RvciAoU2VsZWN0IG9yIFNlZ21lbnRlZEJ1dHRvbikuXG5cdCAqL1xuXHRfY3JlYXRlQ29udGVudCgpIHtcblx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLl9nZXRGaWx0ZXJNb2RlbCgpLFxuXHRcdFx0YUZpbHRlcnMgPSBvTW9kZWwuZ2V0T2JqZWN0KFwiL3BhdGhzXCIpLFxuXHRcdFx0YklzU2VsZWN0ID0gYUZpbHRlcnMubGVuZ3RoID4gMyxcblx0XHRcdG1TZWxlY3Rvck9wdGlvbnM6IGFueSA9IHtcblx0XHRcdFx0aWQ6IGdlbmVyYXRlKFt0aGlzLl9vVGFibGUhLmdldElkKCksIFwiUXVpY2tGaWx0ZXJcIl0pLFxuXHRcdFx0XHRlbmFibGVkOiBvTW9kZWwuZ2V0T2JqZWN0KFwiL2VuYWJsZWRcIiksXG5cdFx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdFx0cGF0aDogYCR7RklMVEVSX01PREVMfT4vcGF0aHNgLFxuXHRcdFx0XHRcdGZhY3Rvcnk6IChzSWQ6IGFueSwgb0JpbmRpbmdDb250ZXh0OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IG1JdGVtT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdFx0a2V5OiBvQmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KCkuYW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IHRoaXMuX2dldFNlbGVjdG9ySXRlbVRleHQob0JpbmRpbmdDb250ZXh0KVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJldHVybiBiSXNTZWxlY3QgPyBuZXcgSXRlbShtSXRlbU9wdGlvbnMpIDogbmV3IFNlZ21lbnRlZEJ1dHRvbkl0ZW0obUl0ZW1PcHRpb25zKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0aWYgKGJJc1NlbGVjdCkge1xuXHRcdFx0bVNlbGVjdG9yT3B0aW9ucy5hdXRvQWRqdXN0V2lkdGggPSB0cnVlO1xuXHRcdH1cblx0XHRtU2VsZWN0b3JPcHRpb25zW2JJc1NlbGVjdCA/IFwiY2hhbmdlXCIgOiBcInNlbGVjdGlvbkNoYW5nZVwiXSA9IHRoaXMuX29uU2VsZWN0aW9uQ2hhbmdlLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5zZWxlY3RvciA9IGJJc1NlbGVjdCA/IG5ldyBTZWxlY3QobVNlbGVjdG9yT3B0aW9ucykgOiBuZXcgU2VnbWVudGVkQnV0dG9uKG1TZWxlY3Rvck9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgcHJvcGVydGllcyBmb3IgdGhlIGludGVyZmFjZSBJT3ZlcmZsb3dUb29sYmFyQ29udGVudC5cblx0ICpcblx0ICogQHJldHVybnMge29iamVjdH0gUmV0dXJucyB0aGUgY29uZmlndXJhdGlvbiBvZiBJT3ZlcmZsb3dUb29sYmFyQ29udGVudFxuXHQgKi9cblx0Z2V0T3ZlcmZsb3dUb29sYmFyQ29uZmlnKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjYW5PdmVyZmxvdzogdHJ1ZVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBTaWRlRWZmZWN0cyBjb250cm9sIHRoYXQgbXVzdCBiZSBleGVjdXRlZCB3aGVuIHRhYmxlIGNlbGxzIHRoYXQgYXJlIHJlbGF0ZWQgdG8gY29uZmlndXJlZCBmaWx0ZXIocykgY2hhbmdlLlxuXHQgKlxuXHQgKi9cblxuXHRfY3JlYXRlQ29udHJvbFNpZGVFZmZlY3RzKCkge1xuXHRcdGNvbnN0IG9TdkNvbnRyb2wgPSB0aGlzLnNlbGVjdG9yLFxuXHRcdFx0b1N2SXRlbXMgPSBvU3ZDb250cm9sLmdldEl0ZW1zKCksXG5cdFx0XHRzVGFibGVOYXZpZ2F0aW9uUGF0aCA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRoaXMuX29UYWJsZSwgXCJuYXZpZ2F0aW9uUGF0aFwiKTtcblx0XHQvKipcblx0XHQgKiBDYW5ub3QgZXhlY3V0ZSBTaWRlRWZmZWN0cyB3aXRoIHRhcmdldEVudGl0eSA9IGN1cnJlbnQgVGFibGUgY29sbGVjdGlvblxuXHRcdCAqL1xuXG5cdFx0aWYgKHNUYWJsZU5hdmlnYXRpb25QYXRoKSB7XG5cdFx0XHRjb25zdCBhU291cmNlUHJvcGVydGllczogYW55W10gPSBbXTtcblx0XHRcdGZvciAoY29uc3QgayBpbiBvU3ZJdGVtcykge1xuXHRcdFx0XHRjb25zdCBzSXRlbUtleSA9IG9Tdkl0ZW1zW2tdLmdldEtleSgpLFxuXHRcdFx0XHRcdG9GaWx0ZXJJbmZvcyA9IFRhYmxlVXRpbHMuZ2V0RmlsdGVyc0luZm9Gb3JTVih0aGlzLl9vVGFibGUhLCBzSXRlbUtleSk7XG5cdFx0XHRcdG9GaWx0ZXJJbmZvcy5wcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHNQcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IGAke3NUYWJsZU5hdmlnYXRpb25QYXRofS8ke3NQcm9wZXJ0eX1gO1xuXHRcdFx0XHRcdGlmICghYVNvdXJjZVByb3BlcnRpZXMuaW5jbHVkZXMoc1Byb3BlcnR5UGF0aCkpIHtcblx0XHRcdFx0XHRcdGFTb3VyY2VQcm9wZXJ0aWVzLnB1c2goc1Byb3BlcnR5UGF0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2dldFNpZGVFZmZlY3RDb250cm9sbGVyKCk/LmFkZENvbnRyb2xTaWRlRWZmZWN0cyh0aGlzLnBhcmVudEVudGl0eVR5cGUsIHtcblx0XHRcdFx0U291cmNlUHJvcGVydGllczogYVNvdXJjZVByb3BlcnRpZXMsXG5cdFx0XHRcdFRhcmdldEVudGl0aWVzOiBbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0JE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHNUYWJsZU5hdmlnYXRpb25QYXRoXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzb3VyY2VDb250cm9sSWQ6IHRoaXMuZ2V0SWQoKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdF9nZXRTZWxlY3Rvckl0ZW1UZXh0KG9JdGVtQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3QgYW5ub3RhdGlvblBhdGggPSBvSXRlbUNvbnRleHQuZ2V0T2JqZWN0KCkuYW5ub3RhdGlvblBhdGgsXG5cdFx0XHRpdGVtUGF0aCA9IG9JdGVtQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRvTWV0YU1vZGVsID0gdGhpcy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpISxcblx0XHRcdG9RdWlja0ZpbHRlciA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3RoaXMuZW50aXR5U2V0fS8ke2Fubm90YXRpb25QYXRofWApO1xuXHRcdHJldHVybiBvUXVpY2tGaWx0ZXIuVGV4dCArICh0aGlzLnNob3dDb3VudHMgPyBgICh7JHtGSUxURVJfTU9ERUx9PiR7aXRlbVBhdGh9L2NvdW50fSlgIDogXCJcIik7XG5cdH1cblx0X2dldFNpZGVFZmZlY3RDb250cm9sbGVyKCkge1xuXHRcdGNvbnN0IG9Db250cm9sbGVyID0gdGhpcy5fZ2V0Vmlld0NvbnRyb2xsZXIoKTtcblx0XHRyZXR1cm4gb0NvbnRyb2xsZXIgPyBvQ29udHJvbGxlci5fc2lkZUVmZmVjdHMgOiB1bmRlZmluZWQ7XG5cdH1cblx0X2dldFZpZXdDb250cm9sbGVyKCkge1xuXHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0Vmlldyh0aGlzKTtcblx0XHRyZXR1cm4gb1ZpZXcgJiYgKG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcik7XG5cdH1cblx0LyoqXG5cdCAqIE1hbmFnZSBMaXN0IEJpbmRpbmcgcmVxdWVzdCByZWxhdGVkIHRvIENvdW50cyBvbiBRdWlja0ZpbHRlciBjb250cm9sIGFuZCB1cGRhdGUgdGV4dFxuXHQgKiBpbiBsaW5lIHdpdGggYmF0Y2ggcmVzdWx0LlxuXHQgKlxuXHQgKi9cblx0X3VwZGF0ZUNvdW50cygpIHtcblx0XHRjb25zdCBvVGFibGUgPSB0aGlzLl9vVGFibGUhLFxuXHRcdFx0b0NvbnRyb2xsZXIgPSB0aGlzLl9nZXRWaWV3Q29udHJvbGxlcigpIGFzIGFueSxcblx0XHRcdG9TdkNvbnRyb2wgPSB0aGlzLnNlbGVjdG9yLFxuXHRcdFx0b1N2SXRlbXMgPSBvU3ZDb250cm9sLmdldEl0ZW1zKCksXG5cdFx0XHRvTW9kZWw6IGFueSA9IHRoaXMuX2dldEZpbHRlck1vZGVsKCksXG5cdFx0XHRhQmluZGluZ1Byb21pc2VzID0gW10sXG5cdFx0XHRhSW5pdGlhbEl0ZW1UZXh0czogYW55W10gPSBbXTtcblx0XHRsZXQgYUFkZGl0aW9uYWxGaWx0ZXJzOiBhbnlbXSA9IFtdO1xuXHRcdGxldCBhQ2hhcnRGaWx0ZXJzID0gW107XG5cdFx0Y29uc3Qgc0N1cnJlbnRGaWx0ZXJLZXkgPSBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFBST1BFUlRZX1FVSUNLRklMVEVSX0tFWSk7XG5cblx0XHQvLyBBZGQgZmlsdGVycyByZWxhdGVkIHRvIHRoZSBjaGFydCBmb3IgQUxQXG5cdFx0aWYgKG9Db250cm9sbGVyICYmIG9Db250cm9sbGVyLmdldENoYXJ0Q29udHJvbCkge1xuXHRcdFx0Y29uc3Qgb0NoYXJ0ID0gb0NvbnRyb2xsZXIuZ2V0Q2hhcnRDb250cm9sKCk7XG5cdFx0XHRpZiAob0NoYXJ0KSB7XG5cdFx0XHRcdGNvbnN0IG9DaGFydEZpbHRlckluZm8gPSBDaGFydFV0aWxzLmdldEFsbEZpbHRlckluZm8ob0NoYXJ0KTtcblx0XHRcdFx0aWYgKG9DaGFydEZpbHRlckluZm8gJiYgb0NoYXJ0RmlsdGVySW5mby5maWx0ZXJzLmxlbmd0aCkge1xuXHRcdFx0XHRcdGFDaGFydEZpbHRlcnMgPSBvQ2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRhQWRkaXRpb25hbEZpbHRlcnMgPSBhQWRkaXRpb25hbEZpbHRlcnMuY29uY2F0KFRhYmxlVXRpbHMuZ2V0SGlkZGVuRmlsdGVycyhvVGFibGUpKS5jb25jYXQoYUNoYXJ0RmlsdGVycyk7XG5cdFx0Zm9yIChjb25zdCBrIGluIG9Tdkl0ZW1zKSB7XG5cdFx0XHRjb25zdCBzSXRlbUtleSA9IG9Tdkl0ZW1zW2tdLmdldEtleSgpLFxuXHRcdFx0XHRvRmlsdGVySW5mb3MgPSBUYWJsZVV0aWxzLmdldEZpbHRlcnNJbmZvRm9yU1Yob1RhYmxlLCBzSXRlbUtleSk7XG5cdFx0XHRhSW5pdGlhbEl0ZW1UZXh0cy5wdXNoKG9GaWx0ZXJJbmZvcy50ZXh0KTtcblx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShgL3BhdGhzLyR7a30vY291bnRgLCBcIi4uLlwiKTtcblx0XHRcdGFCaW5kaW5nUHJvbWlzZXMucHVzaChcblx0XHRcdFx0VGFibGVVdGlscy5nZXRMaXN0QmluZGluZ0ZvckNvdW50KG9UYWJsZSwgb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCksIHtcblx0XHRcdFx0XHRiYXRjaEdyb3VwSWQ6IHNJdGVtS2V5ID09PSBzQ3VycmVudEZpbHRlcktleSA/IHRoaXMuYmF0Y2hHcm91cElkIDogXCIkYXV0b1wiLFxuXHRcdFx0XHRcdGFkZGl0aW9uYWxGaWx0ZXJzOiBhQWRkaXRpb25hbEZpbHRlcnMuY29uY2F0KG9GaWx0ZXJJbmZvcy5maWx0ZXJzKVxuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0UHJvbWlzZS5hbGwoYUJpbmRpbmdQcm9taXNlcylcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChhQ291bnRzOiBhbnlbXSkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGsgaW4gYUNvdW50cykge1xuXHRcdFx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShgL3BhdGhzLyR7a30vY291bnRgLCBUYWJsZVV0aWxzLmdldENvdW50Rm9ybWF0dGVkKGFDb3VudHNba10pKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgYmluZGluZyBwcm9taXNlc1wiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cblx0X29uU2VsZWN0aW9uQ2hhbmdlKG9FdmVudDogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbnRyb2wgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0RGVsZWdhdGVVdGlsLnNldEN1c3RvbURhdGEodGhpcy5fb1RhYmxlLCBQUk9QRVJUWV9RVUlDS0ZJTFRFUl9LRVksIG9Db250cm9sLmdldFNlbGVjdGVkS2V5KCkpO1xuXHRcdCh0aGlzLl9vVGFibGUgYXMgYW55KS5yZWJpbmQoKTtcblx0XHRjb25zdCBvQ29udHJvbGxlciA9IHRoaXMuX2dldFZpZXdDb250cm9sbGVyKCk7XG5cdFx0aWYgKG9Db250cm9sbGVyICYmIG9Db250cm9sbGVyLmdldEV4dGVuc2lvbkFQSSAmJiBvQ29udHJvbGxlci5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSkge1xuXHRcdFx0b0NvbnRyb2xsZXIuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHR9XG5cdH1cblx0ZGVzdHJveShiU3VwcHJlc3NJbnZhbGlkYXRlPzogYm9vbGVhbikge1xuXHRcdGlmICh0aGlzLl9hdHRhY2hlZFRvVmlldykge1xuXHRcdFx0Y29uc3Qgb1NpZGVFZmZlY3RzID0gdGhpcy5fZ2V0U2lkZUVmZmVjdENvbnRyb2xsZXIoKTtcblx0XHRcdGlmIChvU2lkZUVmZmVjdHMpIHtcblx0XHRcdFx0Ly8gaWYgXCJkZXN0cm95XCIgc2lnbmFsIGNvbWVzIHdoZW4gdmlldyBpcyBkZXN0cm95ZWQgdGhlcmUgaXMgbm90IGFueW1vcmUgcmVmZXJlbmNlIHRvIENvbnRyb2xsZXIgRXh0ZW5zaW9uXG5cdFx0XHRcdG9TaWRlRWZmZWN0cy5yZW1vdmVDb250cm9sU2lkZUVmZmVjdHModGhpcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGRlbGV0ZSB0aGlzLl9vVGFibGU7XG5cdFx0c3VwZXIuZGVzdHJveShiU3VwcHJlc3NJbnZhbGlkYXRlKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBRdWlja0ZpbHRlckNvbnRhaW5lcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0VBb0JBLE1BQU1BLHdCQUF3QixHQUFHLGdCQUFnQjtFQUNqRCxNQUFNQyxZQUFZLEdBQUcsU0FBUztFQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQSxJQVNNQyxvQkFBb0IsV0FIekJDLGNBQWMsQ0FBQywwQ0FBMEMsRUFBRTtJQUMzREMsVUFBVSxFQUFFLENBQUMsK0JBQStCO0VBQzdDLENBQUMsQ0FBQyxVQUVBQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBRTdCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsWUFBWSxFQUFFO0VBQVEsQ0FBQyxDQUFDLFVBR25EQyxXQUFXLENBQUM7SUFDWkYsSUFBSSxFQUFFLHFCQUFxQjtJQUMzQkcsUUFBUSxFQUFFLEtBQUs7SUFDZkMsU0FBUyxFQUFFO0VBQ1osQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUEsTUFHTUMsZUFBZSxHQUFZLEtBQUs7TUFBQTtJQUFBO0lBQUEscUJBRWpDQyxNQUFNLEdBQWIsZ0JBQWNDLEdBQWtCLEVBQUVDLFFBQThCLEVBQUU7TUFDakUsTUFBTUMsV0FBVyxHQUFHQyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGVBQWUsQ0FBQztNQUNsRUosR0FBRyxDQUFDSyxhQUFhLENBQUNKLFFBQVEsQ0FBQ0ssUUFBUSxDQUFDO01BQ3BDTixHQUFHLENB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