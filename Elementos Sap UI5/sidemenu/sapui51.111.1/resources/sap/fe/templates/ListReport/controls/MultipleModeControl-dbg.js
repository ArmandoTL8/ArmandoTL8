/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/MessageStrip", "sap/fe/macros/DelegateUtil", "sap/m/IconTabFilter", "sap/ui/core/Control", "sap/ui/core/Core", "sap/ui/fl/write/api/ControlPersonalizationWriteAPI", "sap/ui/model/json/JSONModel"], function (Log, CommonUtils, ClassSupport, MessageStrip, DelegateUtil, IconTabFilter, Control, Core, ControlPersonalizationWriteAPI, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var BindingAction;
  (function (BindingAction) {
    BindingAction["Suspend"] = "suspendBinding";
    BindingAction["Resume"] = "resumeBinding";
  })(BindingAction || (BindingAction = {}));
  let MultipleModeControl = (_dec = defineUI5Class("sap.fe.templates.ListReport.controls.MultipleModeControl"), _dec2 = property({
    type: "boolean"
  }), _dec3 = property({
    type: "boolean",
    defaultValue: false
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = aggregation({
    type: "sap.m.IconTabBar",
    multiple: false,
    isDefault: true
  }), _dec6 = association({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec7 = association({
    type: "sap.fe.core.controls.FilterBar",
    multiple: false
  }), _dec8 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(MultipleModeControl, _Control);
    function MultipleModeControl() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "showCounts", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "freezeContent", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "countsOutDated", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "innerControls", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterControl", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "select", _descriptor7, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = MultipleModeControl.prototype;
    _proto.onBeforeRendering = function onBeforeRendering() {
      this.getTabsModel(); // Generate the model which is mandatory for some bindings

      const oFilterControl = this._getFilterControl();
      if (!oFilterControl) {
        // In case there's no filterbar, we have to update the counts in the tabs immediately
        this.setCountsOutDated(true);
      }
      const oFilterBarAPI = oFilterControl === null || oFilterControl === void 0 ? void 0 : oFilterControl.getParent();
      this.getAllInnerControls().forEach(oMacroAPI => {
        var _oMacroAPI$suspendBin;
        if (this.showCounts) {
          oMacroAPI.attachEvent("internalDataRequested", this._refreshTabsCount.bind(this));
        }
        (_oMacroAPI$suspendBin = oMacroAPI.suspendBinding) === null || _oMacroAPI$suspendBin === void 0 ? void 0 : _oMacroAPI$suspendBin.call(oMacroAPI);
      });
      if (oFilterBarAPI) {
        oFilterBarAPI.attachEvent("internalSearch", this._onSearch.bind(this));
        oFilterBarAPI.attachEvent("internalFilterChanged", this._onFilterChanged.bind(this));
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      var _this$getSelectedInne, _this$getSelectedInne2;
      (_this$getSelectedInne = this.getSelectedInnerControl()) === null || _this$getSelectedInne === void 0 ? void 0 : (_this$getSelectedInne2 = _this$getSelectedInne.resumeBinding) === null || _this$getSelectedInne2 === void 0 ? void 0 : _this$getSelectedInne2.call(_this$getSelectedInne, !this.getProperty("freezeContent"));
    };
    MultipleModeControl.render = function render(oRm, oControl) {
      oRm.renderControl(oControl.content);
    }

    /**
     * Gets the model containing information related to the IconTabFilters.
     *
     * @returns {sap.ui.model.Model | undefined} The model
     */;
    _proto.getTabsModel = function getTabsModel() {
      const sTabsModel = "tabsInternal";
      const oContent = this.content;
      if (!oContent) {
        return undefined;
      }
      let oModel = oContent.getModel(sTabsModel);
      if (!oModel) {
        oModel = new JSONModel({});
        oContent.setModel(oModel, sTabsModel);
      }
      return oModel;
    }

    /**
     * Gets the inner control of the displayed tab.
     *
     * @returns {InnerControlType | undefined} The control
     */;
    _proto.getSelectedInnerControl = function getSelectedInnerControl() {
      var _this$content;
      const oSelectedTab = (_this$content = this.content) === null || _this$content === void 0 ? void 0 : _this$content.getItems().find(oItem => oItem.getKey() === this.content.getSelectedKey());
      return oSelectedTab ? this.getAllInnerControls().find(oMacroAPI => this._getTabFromInnerControl(oMacroAPI) === oSelectedTab) : undefined;
    }

    /**
     * Manages the binding of all inner controls when the selected IconTabFilter is changed.
     *
     * @param {sap.ui.base.Event} oEvent Event fired by the IconTabBar
     */;
    MultipleModeControl.handleTabChange = function handleTabChange(oEvent) {
      var _oMultiControl$_getVi, _oMultiControl$_getVi2;
      const oIconTabBar = oEvent.getSource();
      const oMultiControl = oIconTabBar.getParent();
      const mParameters = oEvent.getParameters();
      oMultiControl._setInnerBinding(true);
      const sPreviousSelectedKey = mParameters === null || mParameters === void 0 ? void 0 : mParameters.previousKey;
      const sSelectedKey = mParameters === null || mParameters === void 0 ? void 0 : mParameters.selectedKey;
      if (sSelectedKey && sPreviousSelectedKey !== sSelectedKey) {
        const oFilterBar = oMultiControl._getFilterControl();
        if (oFilterBar && !oMultiControl.getProperty("freezeContent")) {
          if (!oMultiControl.getSelectedInnerControl()) {
            //custom tab
            oMultiControl._refreshCustomView(oFilterBar.getFilterConditions(), "tabChanged");
          }
        }
        ControlPersonalizationWriteAPI.add({
          changes: [{
            changeSpecificData: {
              changeType: "selectIconTabBarFilter",
              content: {
                selectedKey: sSelectedKey,
                previousSelectedKey: sPreviousSelectedKey
              }
            },
            selectorElement: oIconTabBar
          }]
        });
      }
      (_oMultiControl$_getVi = oMultiControl._getViewController()) === null || _oMultiControl$_getVi === void 0 ? void 0 : (_oMultiControl$_getVi2 = _oMultiControl$_getVi.getExtensionAPI()) === null || _oMultiControl$_getVi2 === void 0 ? void 0 : _oMultiControl$_getVi2.updateAppState();
      oMultiControl.fireEvent("select", {
        iconTabBar: oIconTabBar,
        selectedKey: sSelectedKey,
        previousKey: sPreviousSelectedKey
      });
    }

    /**
     * Invalidates the content of all inner controls.
     */;
    _proto.invalidateContent = function invalidateContent() {
      this.setCountsOutDated(true);
      this.getAllInnerControls().forEach(oMacroAPI => {
        var _oMacroAPI$invalidate;
        (_oMacroAPI$invalidate = oMacroAPI.invalidateContent) === null || _oMacroAPI$invalidate === void 0 ? void 0 : _oMacroAPI$invalidate.call(oMacroAPI);
      });
    }

    /**
     * Sets the counts to out of date or up to date
     * If the counts are set to "out of date" and the selected IconTabFilter doesn't contain an inner control all inner controls are requested to get the new counts.
     *
     * @param {boolean} bValue Freeze or not the control
     */;
    _proto.setCountsOutDated = function setCountsOutDated() {
      let bValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      this.setProperty("countsOutDated", bValue);
      // if the current tab is not configured with no inner Control
      // the tab counts must be manually refreshed since no Macro API will sent event internalDataRequested
      if (bValue && !this.getSelectedInnerControl()) {
        this._refreshTabsCount();
      }
    }

    /**
     * Freezes the content :
     *  - content is frozen: the binding of the inner controls are suspended.
     *  - content is unfrozen: the binding of inner control related to the selected IconTabFilter is resumed.
     *
     * @param {boolean} bValue Freeze or not the control
     */;
    _proto.setFreezeContent = function setFreezeContent(bValue) {
      this.setProperty("freezeContent", bValue);
      this._setInnerBinding();
    }

    /**
     * Updates the internal model with the properties that are not applicable on each IconTabFilter (containing inner control) according to the entityType of the filter control.
     *
     * @param oResourceBundle
     */;
    _proto._updateMultiTabNotApplicableFields = function _updateMultiTabNotApplicableFields(oResourceBundle) {
      const tabsModel = this.getTabsModel();
      const oFilterControl = this._getFilterControl();
      if (tabsModel && oFilterControl) {
        const results = {};
        this.getAllInnerControls().forEach(oMacroAPI => {
          const oTab = this._getTabFromInnerControl(oMacroAPI);
          if (oTab) {
            var _oMacroAPI$refreshNot;
            const sTabId = oTab.getKey();
            const mIgnoredFields = ((_oMacroAPI$refreshNot = oMacroAPI.refreshNotApplicableFields) === null || _oMacroAPI$refreshNot === void 0 ? void 0 : _oMacroAPI$refreshNot.call(oMacroAPI, oFilterControl)) || [];
            results[sTabId] = {
              notApplicable: {
                fields: mIgnoredFields,
                title: this._setTabMessageStrip({
                  entityTypePath: oFilterControl.data("entityType"),
                  ignoredFields: mIgnoredFields,
                  resourceBundle: oResourceBundle,
                  title: oTab.getText()
                })
              }
            };
          }
        });
        tabsModel.setData(results);
      }
    }

    /**
     * Gets the inner controls.
     *
     * @param {boolean} bOnlyForVisibleTab Should display only the visible controls
     * @returns {InnerControlType[]} An array of controls
     */;
    _proto.getAllInnerControls = function getAllInnerControls() {
      let bOnlyForVisibleTab = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return this.innerControls.reduce((aInnerControls, sInnerControl) => {
        const oControl = Core.byId(sInnerControl);
        if (oControl) {
          aInnerControls.push(oControl);
        }
        return aInnerControls.filter(oInnerControl => {
          var _this$_getTabFromInne;
          return !bOnlyForVisibleTab || ((_this$_getTabFromInne = this._getTabFromInnerControl(oInnerControl)) === null || _this$_getTabFromInne === void 0 ? void 0 : _this$_getTabFromInne.getVisible());
        });
      }, []) || [];
    };
    _proto._getFilterControl = function _getFilterControl() {
      return Core.byId(this.filterControl);
    };
    _proto._getTabFromInnerControl = function _getTabFromInnerControl(oControl) {
      const sSupportedClass = IconTabFilter.getMetadata().getName();
      let oTab = oControl;
      if (oTab && !oTab.isA(sSupportedClass) && oTab.getParent) {
        oTab = oControl.getParent();
      }
      return oTab && oTab.isA(sSupportedClass) ? oTab : undefined;
    };
    _proto._getViewController = function _getViewController() {
      const oView = CommonUtils.getTargetView(this);
      return oView && oView.getController();
    };
    _proto._refreshCustomView = function _refreshCustomView(oFilterConditions, sRefreshCause) {
      var _this$_getViewControl, _this$_getViewControl2;
      (_this$_getViewControl = this._getViewController()) === null || _this$_getViewControl === void 0 ? void 0 : (_this$_getViewControl2 = _this$_getViewControl.onViewNeedsRefresh) === null || _this$_getViewControl2 === void 0 ? void 0 : _this$_getViewControl2.call(_this$_getViewControl, {
        filterConditions: oFilterConditions,
        currentTabId: this.content.getSelectedKey(),
        refreshCause: sRefreshCause
      });
    };
    _proto._refreshTabsCount = function _refreshTabsCount(tableEvent) {
      var _this$_getTabFromInne2, _this$content2;
      // If the refresh is triggered by an event (internalDataRequested)
      // we cannot use the selected key as reference since table can be refreshed by SideEffects
      // so the table could be into a different tab -> we use the source of the event to find the targeted tab
      // If not triggered by an event -> refresh at least the counts of the current MacroAPI
      // In any case if the counts are set to Outdated for the MultipleModeControl all the counts are refreshed
      const eventMacroAPI = tableEvent === null || tableEvent === void 0 ? void 0 : tableEvent.getSource();
      const targetKey = eventMacroAPI ? (_this$_getTabFromInne2 = this._getTabFromInnerControl(eventMacroAPI)) === null || _this$_getTabFromInne2 === void 0 ? void 0 : _this$_getTabFromInne2.getKey() : (_this$content2 = this.content) === null || _this$content2 === void 0 ? void 0 : _this$content2.getSelectedKey();
      this.getAllInnerControls(true).forEach(oMacroAPI => {
        const oIconTabFilter = this._getTabFromInnerControl(oMacroAPI);
        if (oMacroAPI !== null && oMacroAPI !== void 0 && oMacroAPI.getCounts && (this.countsOutDated || targetKey === (oIconTabFilter === null || oIconTabFilter === void 0 ? void 0 : oIconTabFilter.getKey()))) {
          if (oIconTabFilter && oIconTabFilter.setCount) {
            oIconTabFilter.setCount("...");
            oMacroAPI.getCounts().then(iCount => oIconTabFilter.setCount(iCount || "0")).catch(function (oError) {
              Log.error("Error while requesting Counts for Control", oError);
            });
          }
        }
      });
      this.setCountsOutDated(false);
    };
    _proto._setInnerBinding = function _setInnerBinding() {
      let bRequestIfNotInitialized = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (this.content) {
        this.getAllInnerControls().forEach(oMacroAPI => {
          var _oMacroAPI$sAction;
          const oIconTabFilter = this._getTabFromInnerControl(oMacroAPI);
          const bIsSelectedKey = (oIconTabFilter === null || oIconTabFilter === void 0 ? void 0 : oIconTabFilter.getKey()) === this.content.getSelectedKey();
          const sAction = bIsSelectedKey && !this.getProperty("freezeContent") ? BindingAction.Resume : BindingAction.Suspend;
          (_oMacroAPI$sAction = oMacroAPI[sAction]) === null || _oMacroAPI$sAction === void 0 ? void 0 : _oMacroAPI$sAction.call(oMacroAPI, sAction === BindingAction.Resume ? bRequestIfNotInitialized && bIsSelectedKey : undefined);
        });
      }
    };
    _proto._setTabMessageStrip = function _setTabMessageStrip(properties) {
      let sText = "";
      const aIgnoredFields = properties.ignoredFields;
      const oFilterControl = this._getFilterControl();
      if (oFilterControl && Array.isArray(aIgnoredFields) && aIgnoredFields.length > 0 && properties.title) {
        const aIgnoredLabels = MessageStrip.getLabels(aIgnoredFields, properties.entityTypePath, oFilterControl, properties.resourceBundle);
        sText = MessageStrip.getText(aIgnoredLabels, oFilterControl, properties.title, DelegateUtil.getLocalizedText);
        return sText;
      }
    };
    _proto._onSearch = function _onSearch(oEvent) {
      this.setCountsOutDated(true);
      this.setFreezeContent(false);
      if (this.getSelectedInnerControl()) {
        var _this$_getViewControl3;
        this._updateMultiTabNotApplicableFields((_this$_getViewControl3 = this._getViewController()) === null || _this$_getViewControl3 === void 0 ? void 0 : _this$_getViewControl3.oResourceBundle);
      } else {
        // custom tab
        this._refreshCustomView(oEvent.getParameter("conditions"), "search");
      }
    };
    _proto._onFilterChanged = function _onFilterChanged(oEvent) {
      if (oEvent.getParameter("conditionsBased")) {
        this.setFreezeContent(true);
      }
    };
    return MultipleModeControl;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "showCounts", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "freezeContent", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "countsOutDated", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "innerControls", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "filterControl", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "select", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MultipleModeControl;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCaW5kaW5nQWN0aW9uIiwiTXVsdGlwbGVNb2RlQ29udHJvbCIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiYWdncmVnYXRpb24iLCJtdWx0aXBsZSIsImlzRGVmYXVsdCIsImFzc29jaWF0aW9uIiwiZXZlbnQiLCJvbkJlZm9yZVJlbmRlcmluZyIsImdldFRhYnNNb2RlbCIsIm9GaWx0ZXJDb250cm9sIiwiX2dldEZpbHRlckNvbnRyb2wiLCJzZXRDb3VudHNPdXREYXRlZCIsIm9GaWx0ZXJCYXJBUEkiLCJnZXRQYXJlbnQiLCJnZXRBbGxJbm5lckNvbnRyb2xzIiwiZm9yRWFjaCIsIm9NYWNyb0FQSSIsInNob3dDb3VudHMiLCJhdHRhY2hFdmVudCIsIl9yZWZyZXNoVGFic0NvdW50IiwiYmluZCIsInN1c3BlbmRCaW5kaW5nIiwiX29uU2VhcmNoIiwiX29uRmlsdGVyQ2hhbmdlZCIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJnZXRTZWxlY3RlZElubmVyQ29udHJvbCIsInJlc3VtZUJpbmRpbmciLCJnZXRQcm9wZXJ0eSIsInJlbmRlciIsIm9SbSIsIm9Db250cm9sIiwicmVuZGVyQ29udHJvbCIsImNvbnRlbnQiLCJzVGFic01vZGVsIiwib0NvbnRlbnQiLCJ1bmRlZmluZWQiLCJvTW9kZWwiLCJnZXRNb2RlbCIsIkpTT05Nb2RlbCIsInNldE1vZGVsIiwib1NlbGVjdGVkVGFiIiwiZ2V0SXRlbXMiLCJmaW5kIiwib0l0ZW0iLCJnZXRLZXkiLCJnZXRTZWxlY3RlZEtleSIsIl9nZXRUYWJGcm9tSW5uZXJDb250cm9sIiwiaGFuZGxlVGFiQ2hhbmdlIiwib0V2ZW50Iiwib0ljb25UYWJCYXIiLCJnZXRTb3VyY2UiLCJvTXVsdGlDb250cm9sIiwibVBhcmFtZXRlcnMiLCJnZXRQYXJhbWV0ZXJzIiwiX3NldElubmVyQmluZGluZyIsInNQcmV2aW91c1NlbGVjdGVkS2V5IiwicHJldmlvdXNLZXkiLCJzU2VsZWN0ZWRLZXkiLCJzZWxlY3RlZEtleSIsIm9GaWx0ZXJCYXIiLCJfcmVmcmVzaEN1c3RvbVZpZXciLCJnZXRGaWx0ZXJDb25kaXRpb25zIiwiQ29udHJvbFBlcnNvbmFsaXphdGlvbldyaXRlQVBJIiwiYWRkIiwiY2hhbmdlcyIsImNoYW5nZVNwZWNpZmljRGF0YSIsImNoYW5nZVR5cGUiLCJwcmV2aW91c1NlbGVjdGVkS2V5Iiwic2VsZWN0b3JFbGVtZW50IiwiX2dldFZpZXdDb250cm9sbGVyIiwiZ2V0RXh0ZW5zaW9uQVBJIiwidXBkYXRlQXBwU3RhdGUiLCJmaXJlRXZlbnQiLCJpY29uVGFiQmFyIiwiaW52YWxpZGF0ZUNvbnRlbnQiLCJiVmFsdWUiLCJzZXRQcm9wZXJ0eSIsInNldEZyZWV6ZUNvbnRlbnQiLCJfdXBkYXRlTXVsdGlUYWJOb3RBcHBsaWNhYmxlRmllbGRzIiwib1Jlc291cmNlQnVuZGxlIiwidGFic01vZGVsIiwicmVzdWx0cyIsIm9UYWIiLCJzVGFiSWQiLCJtSWdub3JlZEZpZWxkcyIsInJlZnJlc2hOb3RBcHBsaWNhYmxlRmllbGRzIiwibm90QXBwbGljYWJsZSIsImZpZWxkcyIsInRpdGxlIiwiX3NldFRhYk1lc3NhZ2VTdHJpcCIsImVudGl0eVR5cGVQYXRoIiwiZGF0YSIsImlnbm9yZWRGaWVsZHMiLCJyZXNvdXJjZUJ1bmRsZSIsImdldFRleHQiLCJzZXREYXRhIiwiYk9ubHlGb3JWaXNpYmxlVGFiIiwiaW5uZXJDb250cm9scyIsInJlZHVjZSIsImFJbm5lckNvbnRyb2xzIiwic0lubmVyQ29udHJvbCIsIkNvcmUiLCJieUlkIiwicHVzaCIsImZpbHRlciIsIm9Jbm5lckNvbnRyb2wiLCJnZXRWaXNpYmxlIiwiZmlsdGVyQ29udHJvbCIsInNTdXBwb3J0ZWRDbGFzcyIsIkljb25UYWJGaWx0ZXIiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJpc0EiLCJvVmlldyIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJvRmlsdGVyQ29uZGl0aW9ucyIsInNSZWZyZXNoQ2F1c2UiLCJvblZpZXdOZWVkc1JlZnJlc2giLCJmaWx0ZXJDb25kaXRpb25zIiwiY3VycmVudFRhYklkIiwicmVmcmVzaENhdXNlIiwidGFibGVFdmVudCIsImV2ZW50TWFjcm9BUEkiLCJ0YXJnZXRLZXkiLCJvSWNvblRhYkZpbHRlciIsImdldENvdW50cyIsImNvdW50c091dERhdGVkIiwic2V0Q291bnQiLCJ0aGVuIiwiaUNvdW50IiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImJSZXF1ZXN0SWZOb3RJbml0aWFsaXplZCIsImJJc1NlbGVjdGVkS2V5Iiwic0FjdGlvbiIsIlJlc3VtZSIsIlN1c3BlbmQiLCJwcm9wZXJ0aWVzIiwic1RleHQiLCJhSWdub3JlZEZpZWxkcyIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsImFJZ25vcmVkTGFiZWxzIiwiTWVzc2FnZVN0cmlwIiwiZ2V0TGFiZWxzIiwiRGVsZWdhdGVVdGlsIiwiZ2V0TG9jYWxpemVkVGV4dCIsImdldFBhcmFtZXRlciIsIkNvbnRyb2wiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk11bHRpcGxlTW9kZUNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9scy9GaWx0ZXJCYXJcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBhc3NvY2lhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IE1lc3NhZ2VTdHJpcCBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9NZXNzYWdlU3RyaXBcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgTWFjcm9BUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9BUElcIjtcbmltcG9ydCBJY29uVGFiQmFyIGZyb20gXCJzYXAvbS9JY29uVGFiQmFyXCI7XG5pbXBvcnQgSWNvblRhYkZpbHRlciBmcm9tIFwic2FwL20vSWNvblRhYkZpbHRlclwiO1xuaW1wb3J0IHR5cGUgQ29yZUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgUmVuZGVyTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvUmVuZGVyTWFuYWdlclwiO1xuaW1wb3J0IENvbnRyb2xQZXJzb25hbGl6YXRpb25Xcml0ZUFQSSBmcm9tIFwic2FwL3VpL2ZsL3dyaXRlL2FwaS9Db250cm9sUGVyc29uYWxpemF0aW9uV3JpdGVBUElcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTW9kZWxcIjtcblxuZXhwb3J0IHR5cGUgSW5uZXJDb250cm9sVHlwZSA9IE1hY3JvQVBJICZcblx0UGFydGlhbDx7XG5cdFx0cmVzdW1lQmluZGluZzogRnVuY3Rpb247XG5cdFx0c3VzcGVuZEJpbmRpbmc6IEZ1bmN0aW9uO1xuXHRcdGdldENvdW50czogRnVuY3Rpb247XG5cdFx0cmVmcmVzaE5vdEFwcGxpY2FibGVGaWVsZHM6IEZ1bmN0aW9uO1xuXHRcdGludmFsaWRhdGVDb250ZW50OiBGdW5jdGlvbjtcblx0fT47XG5cbnR5cGUgTWVzc2FnZVN0cmlwUHJvcGVydGllcyA9IHtcblx0ZW50aXR5VHlwZVBhdGg6IHN0cmluZztcblx0aWdub3JlZEZpZWxkczogYW55W107XG5cdHJlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZTtcblx0dGl0bGU6IHN0cmluZztcbn07XG5cbmVudW0gQmluZGluZ0FjdGlvbiB7XG5cdFN1c3BlbmQgPSBcInN1c3BlbmRCaW5kaW5nXCIsXG5cdFJlc3VtZSA9IFwicmVzdW1lQmluZGluZ1wiXG59XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5jb250cm9scy5NdWx0aXBsZU1vZGVDb250cm9sXCIpXG5jbGFzcyBNdWx0aXBsZU1vZGVDb250cm9sIGV4dGVuZHMgQ29udHJvbCB7XG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHNob3dDb3VudHMhOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGZyZWV6ZUNvbnRlbnQhOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGNvdW50c091dERhdGVkITogYm9vbGVhbjtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5tLkljb25UYWJCYXJcIiwgbXVsdGlwbGU6IGZhbHNlLCBpc0RlZmF1bHQ6IHRydWUgfSlcblx0Y29udGVudCE6IEljb25UYWJCYXI7XG5cblx0QGFzc29jaWF0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiB0cnVlIH0pXG5cdGlubmVyQ29udHJvbHMhOiBzdHJpbmdbXTtcblxuXHRAYXNzb2NpYXRpb24oeyB0eXBlOiBcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbHRlckJhclwiLCBtdWx0aXBsZTogZmFsc2UgfSlcblx0ZmlsdGVyQ29udHJvbCE6IHN0cmluZztcblxuXHRAZXZlbnQoKVxuXHRzZWxlY3QhOiBGdW5jdGlvbjtcblxuXHRvbkJlZm9yZVJlbmRlcmluZygpIHtcblx0XHR0aGlzLmdldFRhYnNNb2RlbCgpOyAvLyBHZW5lcmF0ZSB0aGUgbW9kZWwgd2hpY2ggaXMgbWFuZGF0b3J5IGZvciBzb21lIGJpbmRpbmdzXG5cblx0XHRjb25zdCBvRmlsdGVyQ29udHJvbCA9IHRoaXMuX2dldEZpbHRlckNvbnRyb2woKTtcblx0XHRpZiAoIW9GaWx0ZXJDb250cm9sKSB7XG5cdFx0XHQvLyBJbiBjYXNlIHRoZXJlJ3Mgbm8gZmlsdGVyYmFyLCB3ZSBoYXZlIHRvIHVwZGF0ZSB0aGUgY291bnRzIGluIHRoZSB0YWJzIGltbWVkaWF0ZWx5XG5cdFx0XHR0aGlzLnNldENvdW50c091dERhdGVkKHRydWUpO1xuXHRcdH1cblx0XHRjb25zdCBvRmlsdGVyQmFyQVBJID0gb0ZpbHRlckNvbnRyb2w/LmdldFBhcmVudCgpO1xuXHRcdHRoaXMuZ2V0QWxsSW5uZXJDb250cm9scygpLmZvckVhY2goKG9NYWNyb0FQSSkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuc2hvd0NvdW50cykge1xuXHRcdFx0XHRvTWFjcm9BUEkuYXR0YWNoRXZlbnQoXCJpbnRlcm5hbERhdGFSZXF1ZXN0ZWRcIiwgdGhpcy5fcmVmcmVzaFRhYnNDb3VudC5iaW5kKHRoaXMpKTtcblx0XHRcdH1cblx0XHRcdG9NYWNyb0FQSS5zdXNwZW5kQmluZGluZz8uKCk7XG5cdFx0fSk7XG5cdFx0aWYgKG9GaWx0ZXJCYXJBUEkpIHtcblx0XHRcdG9GaWx0ZXJCYXJBUEkuYXR0YWNoRXZlbnQoXCJpbnRlcm5hbFNlYXJjaFwiLCB0aGlzLl9vblNlYXJjaC5iaW5kKHRoaXMpKTtcblx0XHRcdG9GaWx0ZXJCYXJBUEkuYXR0YWNoRXZlbnQoXCJpbnRlcm5hbEZpbHRlckNoYW5nZWRcIiwgdGhpcy5fb25GaWx0ZXJDaGFuZ2VkLmJpbmQodGhpcykpO1xuXHRcdH1cblx0fVxuXG5cdG9uQWZ0ZXJSZW5kZXJpbmcoKSB7XG5cdFx0dGhpcy5nZXRTZWxlY3RlZElubmVyQ29udHJvbCgpPy5yZXN1bWVCaW5kaW5nPy4oIXRoaXMuZ2V0UHJvcGVydHkoXCJmcmVlemVDb250ZW50XCIpKTtcblx0fVxuXG5cdHN0YXRpYyByZW5kZXIob1JtOiBSZW5kZXJNYW5hZ2VyLCBvQ29udHJvbDogTXVsdGlwbGVNb2RlQ29udHJvbCkge1xuXHRcdG9SbS5yZW5kZXJDb250cm9sKG9Db250cm9sLmNvbnRlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIG1vZGVsIGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gcmVsYXRlZCB0byB0aGUgSWNvblRhYkZpbHRlcnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtzYXAudWkubW9kZWwuTW9kZWwgfCB1bmRlZmluZWR9IFRoZSBtb2RlbFxuXHQgKi9cblx0Z2V0VGFic01vZGVsKCk6IE1vZGVsIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBzVGFic01vZGVsID0gXCJ0YWJzSW50ZXJuYWxcIjtcblx0XHRjb25zdCBvQ29udGVudCA9IHRoaXMuY29udGVudDtcblx0XHRpZiAoIW9Db250ZW50KSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRsZXQgb01vZGVsID0gb0NvbnRlbnQuZ2V0TW9kZWwoc1RhYnNNb2RlbCk7XG5cdFx0aWYgKCFvTW9kZWwpIHtcblx0XHRcdG9Nb2RlbCA9IG5ldyBKU09OTW9kZWwoe30pO1xuXHRcdFx0b0NvbnRlbnQuc2V0TW9kZWwob01vZGVsLCBzVGFic01vZGVsKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9Nb2RlbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBpbm5lciBjb250cm9sIG9mIHRoZSBkaXNwbGF5ZWQgdGFiLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7SW5uZXJDb250cm9sVHlwZSB8IHVuZGVmaW5lZH0gVGhlIGNvbnRyb2xcblx0ICovXG5cdGdldFNlbGVjdGVkSW5uZXJDb250cm9sKCk6IElubmVyQ29udHJvbFR5cGUgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IG9TZWxlY3RlZFRhYiA9IHRoaXMuY29udGVudD8uZ2V0SXRlbXMoKS5maW5kKChvSXRlbSkgPT4gKG9JdGVtIGFzIEljb25UYWJGaWx0ZXIpLmdldEtleSgpID09PSB0aGlzLmNvbnRlbnQuZ2V0U2VsZWN0ZWRLZXkoKSk7XG5cdFx0cmV0dXJuIG9TZWxlY3RlZFRhYlxuXHRcdFx0PyB0aGlzLmdldEFsbElubmVyQ29udHJvbHMoKS5maW5kKChvTWFjcm9BUEkpID0+IHRoaXMuX2dldFRhYkZyb21Jbm5lckNvbnRyb2wob01hY3JvQVBJKSA9PT0gb1NlbGVjdGVkVGFiKVxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogTWFuYWdlcyB0aGUgYmluZGluZyBvZiBhbGwgaW5uZXIgY29udHJvbHMgd2hlbiB0aGUgc2VsZWN0ZWQgSWNvblRhYkZpbHRlciBpcyBjaGFuZ2VkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3NhcC51aS5iYXNlLkV2ZW50fSBvRXZlbnQgRXZlbnQgZmlyZWQgYnkgdGhlIEljb25UYWJCYXJcblx0ICovXG5cdHN0YXRpYyBoYW5kbGVUYWJDaGFuZ2Uob0V2ZW50OiBhbnkpOiB2b2lkIHtcblx0XHRjb25zdCBvSWNvblRhYkJhciA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBvTXVsdGlDb250cm9sID0gb0ljb25UYWJCYXIuZ2V0UGFyZW50KCk7XG5cblx0XHRjb25zdCBtUGFyYW1ldGVycyA9IG9FdmVudC5nZXRQYXJhbWV0ZXJzKCk7XG5cdFx0b011bHRpQ29udHJvbC5fc2V0SW5uZXJCaW5kaW5nKHRydWUpO1xuXHRcdGNvbnN0IHNQcmV2aW91c1NlbGVjdGVkS2V5ID0gbVBhcmFtZXRlcnM/LnByZXZpb3VzS2V5O1xuXHRcdGNvbnN0IHNTZWxlY3RlZEtleSA9IG1QYXJhbWV0ZXJzPy5zZWxlY3RlZEtleTtcblxuXHRcdGlmIChzU2VsZWN0ZWRLZXkgJiYgc1ByZXZpb3VzU2VsZWN0ZWRLZXkgIT09IHNTZWxlY3RlZEtleSkge1xuXHRcdFx0Y29uc3Qgb0ZpbHRlckJhciA9IG9NdWx0aUNvbnRyb2wuX2dldEZpbHRlckNvbnRyb2woKTtcblx0XHRcdGlmIChvRmlsdGVyQmFyICYmICFvTXVsdGlDb250cm9sLmdldFByb3BlcnR5KFwiZnJlZXplQ29udGVudFwiKSkge1xuXHRcdFx0XHRpZiAoIW9NdWx0aUNvbnRyb2wuZ2V0U2VsZWN0ZWRJbm5lckNvbnRyb2woKSkge1xuXHRcdFx0XHRcdC8vY3VzdG9tIHRhYlxuXHRcdFx0XHRcdG9NdWx0aUNvbnRyb2wuX3JlZnJlc2hDdXN0b21WaWV3KG9GaWx0ZXJCYXIuZ2V0RmlsdGVyQ29uZGl0aW9ucygpLCBcInRhYkNoYW5nZWRcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdENvbnRyb2xQZXJzb25hbGl6YXRpb25Xcml0ZUFQSS5hZGQoe1xuXHRcdFx0XHRjaGFuZ2VzOiBbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y2hhbmdlU3BlY2lmaWNEYXRhOiB7XG5cdFx0XHRcdFx0XHRcdGNoYW5nZVR5cGU6IFwic2VsZWN0SWNvblRhYkJhckZpbHRlclwiLFxuXHRcdFx0XHRcdFx0XHRjb250ZW50OiB7XG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRLZXk6IHNTZWxlY3RlZEtleSxcblx0XHRcdFx0XHRcdFx0XHRwcmV2aW91c1NlbGVjdGVkS2V5OiBzUHJldmlvdXNTZWxlY3RlZEtleVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0c2VsZWN0b3JFbGVtZW50OiBvSWNvblRhYkJhclxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0b011bHRpQ29udHJvbC5fZ2V0Vmlld0NvbnRyb2xsZXIoKT8uZ2V0RXh0ZW5zaW9uQVBJKCk/LnVwZGF0ZUFwcFN0YXRlKCk7XG5cblx0XHRvTXVsdGlDb250cm9sLmZpcmVFdmVudChcInNlbGVjdFwiLCB7XG5cdFx0XHRpY29uVGFiQmFyOiBvSWNvblRhYkJhcixcblx0XHRcdHNlbGVjdGVkS2V5OiBzU2VsZWN0ZWRLZXksXG5cdFx0XHRwcmV2aW91c0tleTogc1ByZXZpb3VzU2VsZWN0ZWRLZXlcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbnZhbGlkYXRlcyB0aGUgY29udGVudCBvZiBhbGwgaW5uZXIgY29udHJvbHMuXG5cdCAqL1xuXHRpbnZhbGlkYXRlQ29udGVudCgpIHtcblx0XHR0aGlzLnNldENvdW50c091dERhdGVkKHRydWUpO1xuXHRcdHRoaXMuZ2V0QWxsSW5uZXJDb250cm9scygpLmZvckVhY2goKG9NYWNyb0FQSSkgPT4ge1xuXHRcdFx0b01hY3JvQVBJLmludmFsaWRhdGVDb250ZW50Py4oKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBjb3VudHMgdG8gb3V0IG9mIGRhdGUgb3IgdXAgdG8gZGF0ZVxuXHQgKiBJZiB0aGUgY291bnRzIGFyZSBzZXQgdG8gXCJvdXQgb2YgZGF0ZVwiIGFuZCB0aGUgc2VsZWN0ZWQgSWNvblRhYkZpbHRlciBkb2Vzbid0IGNvbnRhaW4gYW4gaW5uZXIgY29udHJvbCBhbGwgaW5uZXIgY29udHJvbHMgYXJlIHJlcXVlc3RlZCB0byBnZXQgdGhlIG5ldyBjb3VudHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gYlZhbHVlIEZyZWV6ZSBvciBub3QgdGhlIGNvbnRyb2xcblx0ICovXG5cdHNldENvdW50c091dERhdGVkKGJWYWx1ZSA9IHRydWUpIHtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiY291bnRzT3V0RGF0ZWRcIiwgYlZhbHVlKTtcblx0XHQvLyBpZiB0aGUgY3VycmVudCB0YWIgaXMgbm90IGNvbmZpZ3VyZWQgd2l0aCBubyBpbm5lciBDb250cm9sXG5cdFx0Ly8gdGhlIHRhYiBjb3VudHMgbXVzdCBiZSBtYW51YWxseSByZWZyZXNoZWQgc2luY2Ugbm8gTWFjcm8gQVBJIHdpbGwgc2VudCBldmVudCBpbnRlcm5hbERhdGFSZXF1ZXN0ZWRcblx0XHRpZiAoYlZhbHVlICYmICF0aGlzLmdldFNlbGVjdGVkSW5uZXJDb250cm9sKCkpIHtcblx0XHRcdHRoaXMuX3JlZnJlc2hUYWJzQ291bnQoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRnJlZXplcyB0aGUgY29udGVudCA6XG5cdCAqICAtIGNvbnRlbnQgaXMgZnJvemVuOiB0aGUgYmluZGluZyBvZiB0aGUgaW5uZXIgY29udHJvbHMgYXJlIHN1c3BlbmRlZC5cblx0ICogIC0gY29udGVudCBpcyB1bmZyb3plbjogdGhlIGJpbmRpbmcgb2YgaW5uZXIgY29udHJvbCByZWxhdGVkIHRvIHRoZSBzZWxlY3RlZCBJY29uVGFiRmlsdGVyIGlzIHJlc3VtZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gYlZhbHVlIEZyZWV6ZSBvciBub3QgdGhlIGNvbnRyb2xcblx0ICovXG5cdHNldEZyZWV6ZUNvbnRlbnQoYlZhbHVlOiBib29sZWFuKSB7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcImZyZWV6ZUNvbnRlbnRcIiwgYlZhbHVlKTtcblx0XHR0aGlzLl9zZXRJbm5lckJpbmRpbmcoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBpbnRlcm5hbCBtb2RlbCB3aXRoIHRoZSBwcm9wZXJ0aWVzIHRoYXQgYXJlIG5vdCBhcHBsaWNhYmxlIG9uIGVhY2ggSWNvblRhYkZpbHRlciAoY29udGFpbmluZyBpbm5lciBjb250cm9sKSBhY2NvcmRpbmcgdG8gdGhlIGVudGl0eVR5cGUgb2YgdGhlIGZpbHRlciBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1Jlc291cmNlQnVuZGxlXG5cdCAqL1xuXHRfdXBkYXRlTXVsdGlUYWJOb3RBcHBsaWNhYmxlRmllbGRzKG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUpIHtcblx0XHRjb25zdCB0YWJzTW9kZWwgPSB0aGlzLmdldFRhYnNNb2RlbCgpO1xuXHRcdGNvbnN0IG9GaWx0ZXJDb250cm9sID0gdGhpcy5fZ2V0RmlsdGVyQ29udHJvbCgpIGFzIENvbnRyb2w7XG5cdFx0aWYgKHRhYnNNb2RlbCAmJiBvRmlsdGVyQ29udHJvbCkge1xuXHRcdFx0Y29uc3QgcmVzdWx0czogYW55ID0ge307XG5cdFx0XHR0aGlzLmdldEFsbElubmVyQ29udHJvbHMoKS5mb3JFYWNoKChvTWFjcm9BUEkpID0+IHtcblx0XHRcdFx0Y29uc3Qgb1RhYiA9IHRoaXMuX2dldFRhYkZyb21Jbm5lckNvbnRyb2wob01hY3JvQVBJKTtcblx0XHRcdFx0aWYgKG9UYWIpIHtcblx0XHRcdFx0XHRjb25zdCBzVGFiSWQgPSBvVGFiLmdldEtleSgpO1xuXHRcdFx0XHRcdGNvbnN0IG1JZ25vcmVkRmllbGRzID0gb01hY3JvQVBJLnJlZnJlc2hOb3RBcHBsaWNhYmxlRmllbGRzPy4ob0ZpbHRlckNvbnRyb2wpIHx8IFtdO1xuXHRcdFx0XHRcdHJlc3VsdHNbc1RhYklkXSA9IHtcblx0XHRcdFx0XHRcdG5vdEFwcGxpY2FibGU6IHtcblx0XHRcdFx0XHRcdFx0ZmllbGRzOiBtSWdub3JlZEZpZWxkcyxcblx0XHRcdFx0XHRcdFx0dGl0bGU6IHRoaXMuX3NldFRhYk1lc3NhZ2VTdHJpcCh7XG5cdFx0XHRcdFx0XHRcdFx0ZW50aXR5VHlwZVBhdGg6IG9GaWx0ZXJDb250cm9sLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0XHRcdFx0XHRcdGlnbm9yZWRGaWVsZHM6IG1JZ25vcmVkRmllbGRzLFxuXHRcdFx0XHRcdFx0XHRcdHJlc291cmNlQnVuZGxlOiBvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0dGl0bGU6IG9UYWIuZ2V0VGV4dCgpXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHQodGFic01vZGVsIGFzIGFueSkuc2V0RGF0YShyZXN1bHRzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgaW5uZXIgY29udHJvbHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gYk9ubHlGb3JWaXNpYmxlVGFiIFNob3VsZCBkaXNwbGF5IG9ubHkgdGhlIHZpc2libGUgY29udHJvbHNcblx0ICogQHJldHVybnMge0lubmVyQ29udHJvbFR5cGVbXX0gQW4gYXJyYXkgb2YgY29udHJvbHNcblx0ICovXG5cdGdldEFsbElubmVyQ29udHJvbHMoYk9ubHlGb3JWaXNpYmxlVGFiID0gZmFsc2UpOiBJbm5lckNvbnRyb2xUeXBlW10ge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0aGlzLmlubmVyQ29udHJvbHMucmVkdWNlKChhSW5uZXJDb250cm9sczogSW5uZXJDb250cm9sVHlwZVtdLCBzSW5uZXJDb250cm9sOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSBDb3JlLmJ5SWQoc0lubmVyQ29udHJvbCkgYXMgSW5uZXJDb250cm9sVHlwZTtcblx0XHRcdFx0aWYgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0YUlubmVyQ29udHJvbHMucHVzaChvQ29udHJvbCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGFJbm5lckNvbnRyb2xzLmZpbHRlcihcblx0XHRcdFx0XHQob0lubmVyQ29udHJvbCkgPT4gIWJPbmx5Rm9yVmlzaWJsZVRhYiB8fCB0aGlzLl9nZXRUYWJGcm9tSW5uZXJDb250cm9sKG9Jbm5lckNvbnRyb2wpPy5nZXRWaXNpYmxlKClcblx0XHRcdFx0KTtcblx0XHRcdH0sIFtdKSB8fCBbXVxuXHRcdCk7XG5cdH1cblxuXHRfZ2V0RmlsdGVyQ29udHJvbCgpOiBGaWx0ZXJCYXIgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiBDb3JlLmJ5SWQodGhpcy5maWx0ZXJDb250cm9sKSBhcyBGaWx0ZXJCYXIgfCB1bmRlZmluZWQ7XG5cdH1cblxuXHRfZ2V0VGFiRnJvbUlubmVyQ29udHJvbChvQ29udHJvbDogQ29udHJvbCk6IEljb25UYWJGaWx0ZXIgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IHNTdXBwb3J0ZWRDbGFzcyA9IEljb25UYWJGaWx0ZXIuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCk7XG5cdFx0bGV0IG9UYWI6IGFueSA9IG9Db250cm9sO1xuXHRcdGlmIChvVGFiICYmICFvVGFiLmlzQShzU3VwcG9ydGVkQ2xhc3MpICYmIG9UYWIuZ2V0UGFyZW50KSB7XG5cdFx0XHRvVGFiID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0fVxuXHRcdHJldHVybiBvVGFiICYmIG9UYWIuaXNBKHNTdXBwb3J0ZWRDbGFzcykgPyAob1RhYiBhcyBJY29uVGFiRmlsdGVyKSA6IHVuZGVmaW5lZDtcblx0fVxuXG5cdF9nZXRWaWV3Q29udHJvbGxlcigpIHtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyk7XG5cdFx0cmV0dXJuIG9WaWV3ICYmIG9WaWV3LmdldENvbnRyb2xsZXIoKTtcblx0fVxuXG5cdF9yZWZyZXNoQ3VzdG9tVmlldyhvRmlsdGVyQ29uZGl0aW9uczogYW55LCBzUmVmcmVzaENhdXNlOiBzdHJpbmcpIHtcblx0XHQodGhpcy5fZ2V0Vmlld0NvbnRyb2xsZXIoKSBhcyBhbnkpPy5vblZpZXdOZWVkc1JlZnJlc2g/Lih7XG5cdFx0XHRmaWx0ZXJDb25kaXRpb25zOiBvRmlsdGVyQ29uZGl0aW9ucyxcblx0XHRcdGN1cnJlbnRUYWJJZDogdGhpcy5jb250ZW50LmdldFNlbGVjdGVkS2V5KCksXG5cdFx0XHRyZWZyZXNoQ2F1c2U6IHNSZWZyZXNoQ2F1c2Vcblx0XHR9KTtcblx0fVxuXG5cdF9yZWZyZXNoVGFic0NvdW50KHRhYmxlRXZlbnQ/OiBDb3JlRXZlbnQpOiB2b2lkIHtcblx0XHQvLyBJZiB0aGUgcmVmcmVzaCBpcyB0cmlnZ2VyZWQgYnkgYW4gZXZlbnQgKGludGVybmFsRGF0YVJlcXVlc3RlZClcblx0XHQvLyB3ZSBjYW5ub3QgdXNlIHRoZSBzZWxlY3RlZCBrZXkgYXMgcmVmZXJlbmNlIHNpbmNlIHRhYmxlIGNhbiBiZSByZWZyZXNoZWQgYnkgU2lkZUVmZmVjdHNcblx0XHQvLyBzbyB0aGUgdGFibGUgY291bGQgYmUgaW50byBhIGRpZmZlcmVudCB0YWIgLT4gd2UgdXNlIHRoZSBzb3VyY2Ugb2YgdGhlIGV2ZW50IHRvIGZpbmQgdGhlIHRhcmdldGVkIHRhYlxuXHRcdC8vIElmIG5vdCB0cmlnZ2VyZWQgYnkgYW4gZXZlbnQgLT4gcmVmcmVzaCBhdCBsZWFzdCB0aGUgY291bnRzIG9mIHRoZSBjdXJyZW50IE1hY3JvQVBJXG5cdFx0Ly8gSW4gYW55IGNhc2UgaWYgdGhlIGNvdW50cyBhcmUgc2V0IHRvIE91dGRhdGVkIGZvciB0aGUgTXVsdGlwbGVNb2RlQ29udHJvbCBhbGwgdGhlIGNvdW50cyBhcmUgcmVmcmVzaGVkXG5cdFx0Y29uc3QgZXZlbnRNYWNyb0FQSSA9IHRhYmxlRXZlbnQ/LmdldFNvdXJjZSgpIGFzIE1hY3JvQVBJO1xuXHRcdGNvbnN0IHRhcmdldEtleSA9IGV2ZW50TWFjcm9BUEkgPyB0aGlzLl9nZXRUYWJGcm9tSW5uZXJDb250cm9sKGV2ZW50TWFjcm9BUEkpPy5nZXRLZXkoKSA6IHRoaXMuY29udGVudD8uZ2V0U2VsZWN0ZWRLZXkoKTtcblxuXHRcdHRoaXMuZ2V0QWxsSW5uZXJDb250cm9scyh0cnVlKS5mb3JFYWNoKChvTWFjcm9BUEkpID0+IHtcblx0XHRcdGNvbnN0IG9JY29uVGFiRmlsdGVyID0gdGhpcy5fZ2V0VGFiRnJvbUlubmVyQ29udHJvbChvTWFjcm9BUEkpO1xuXHRcdFx0aWYgKG9NYWNyb0FQST8uZ2V0Q291bnRzICYmICh0aGlzLmNvdW50c091dERhdGVkIHx8IHRhcmdldEtleSA9PT0gb0ljb25UYWJGaWx0ZXI/LmdldEtleSgpKSkge1xuXHRcdFx0XHRpZiAob0ljb25UYWJGaWx0ZXIgJiYgb0ljb25UYWJGaWx0ZXIuc2V0Q291bnQpIHtcblx0XHRcdFx0XHRvSWNvblRhYkZpbHRlci5zZXRDb3VudChcIi4uLlwiKTtcblx0XHRcdFx0XHRvTWFjcm9BUElcblx0XHRcdFx0XHRcdC5nZXRDb3VudHMoKVxuXHRcdFx0XHRcdFx0LnRoZW4oKGlDb3VudDogc3RyaW5nKSA9PiBvSWNvblRhYkZpbHRlci5zZXRDb3VudChpQ291bnQgfHwgXCIwXCIpKVxuXHRcdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXF1ZXN0aW5nIENvdW50cyBmb3IgQ29udHJvbFwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLnNldENvdW50c091dERhdGVkKGZhbHNlKTtcblx0fVxuXG5cdF9zZXRJbm5lckJpbmRpbmcoYlJlcXVlc3RJZk5vdEluaXRpYWxpemVkID0gZmFsc2UpIHtcblx0XHRpZiAodGhpcy5jb250ZW50KSB7XG5cdFx0XHR0aGlzLmdldEFsbElubmVyQ29udHJvbHMoKS5mb3JFYWNoKChvTWFjcm9BUEkpID0+IHtcblx0XHRcdFx0Y29uc3Qgb0ljb25UYWJGaWx0ZXIgPSB0aGlzLl9nZXRUYWJGcm9tSW5uZXJDb250cm9sKG9NYWNyb0FQSSk7XG5cdFx0XHRcdGNvbnN0IGJJc1NlbGVjdGVkS2V5ID0gb0ljb25UYWJGaWx0ZXI/LmdldEtleSgpID09PSB0aGlzLmNvbnRlbnQuZ2V0U2VsZWN0ZWRLZXkoKTtcblx0XHRcdFx0Y29uc3Qgc0FjdGlvbiA9IGJJc1NlbGVjdGVkS2V5ICYmICF0aGlzLmdldFByb3BlcnR5KFwiZnJlZXplQ29udGVudFwiKSA/IEJpbmRpbmdBY3Rpb24uUmVzdW1lIDogQmluZGluZ0FjdGlvbi5TdXNwZW5kO1xuXHRcdFx0XHRvTWFjcm9BUElbc0FjdGlvbl0/LihzQWN0aW9uID09PSBCaW5kaW5nQWN0aW9uLlJlc3VtZSA/IGJSZXF1ZXN0SWZOb3RJbml0aWFsaXplZCAmJiBiSXNTZWxlY3RlZEtleSA6IHVuZGVmaW5lZCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRfc2V0VGFiTWVzc2FnZVN0cmlwKHByb3BlcnRpZXM6IE1lc3NhZ2VTdHJpcFByb3BlcnRpZXMpIHtcblx0XHRsZXQgc1RleHQgPSBcIlwiO1xuXHRcdGNvbnN0IGFJZ25vcmVkRmllbGRzID0gcHJvcGVydGllcy5pZ25vcmVkRmllbGRzO1xuXHRcdGNvbnN0IG9GaWx0ZXJDb250cm9sID0gdGhpcy5fZ2V0RmlsdGVyQ29udHJvbCgpIGFzIENvbnRyb2w7XG5cdFx0aWYgKG9GaWx0ZXJDb250cm9sICYmIEFycmF5LmlzQXJyYXkoYUlnbm9yZWRGaWVsZHMpICYmIGFJZ25vcmVkRmllbGRzLmxlbmd0aCA+IDAgJiYgcHJvcGVydGllcy50aXRsZSkge1xuXHRcdFx0Y29uc3QgYUlnbm9yZWRMYWJlbHMgPSBNZXNzYWdlU3RyaXAuZ2V0TGFiZWxzKFxuXHRcdFx0XHRhSWdub3JlZEZpZWxkcyxcblx0XHRcdFx0cHJvcGVydGllcy5lbnRpdHlUeXBlUGF0aCxcblx0XHRcdFx0b0ZpbHRlckNvbnRyb2wsXG5cdFx0XHRcdHByb3BlcnRpZXMucmVzb3VyY2VCdW5kbGVcblx0XHRcdCk7XG5cdFx0XHRzVGV4dCA9IE1lc3NhZ2VTdHJpcC5nZXRUZXh0KGFJZ25vcmVkTGFiZWxzLCBvRmlsdGVyQ29udHJvbCwgcHJvcGVydGllcy50aXRsZSwgRGVsZWdhdGVVdGlsLmdldExvY2FsaXplZFRleHQpO1xuXHRcdFx0cmV0dXJuIHNUZXh0O1xuXHRcdH1cblx0fVxuXG5cdF9vblNlYXJjaChvRXZlbnQ6IENvcmVFdmVudCk6IHZvaWQge1xuXHRcdHRoaXMuc2V0Q291bnRzT3V0RGF0ZWQodHJ1ZSk7XG5cdFx0dGhpcy5zZXRGcmVlemVDb250ZW50KGZhbHNlKTtcblx0XHRpZiAodGhpcy5nZXRTZWxlY3RlZElubmVyQ29udHJvbCgpKSB7XG5cdFx0XHR0aGlzLl91cGRhdGVNdWx0aVRhYk5vdEFwcGxpY2FibGVGaWVsZHMoKHRoaXMuX2dldFZpZXdDb250cm9sbGVyKCkgYXMgYW55KT8ub1Jlc291cmNlQnVuZGxlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY3VzdG9tIHRhYlxuXHRcdFx0dGhpcy5fcmVmcmVzaEN1c3RvbVZpZXcob0V2ZW50LmdldFBhcmFtZXRlcihcImNvbmRpdGlvbnNcIiksIFwic2VhcmNoXCIpO1xuXHRcdH1cblx0fVxuXG5cdF9vbkZpbHRlckNoYW5nZWQob0V2ZW50OiBDb3JlRXZlbnQpOiB2b2lkIHtcblx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImNvbmRpdGlvbnNCYXNlZFwiKSkge1xuXHRcdFx0dGhpcy5zZXRGcmVlemVDb250ZW50KHRydWUpO1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBNdWx0aXBsZU1vZGVDb250cm9sO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O01Ba0NLQSxhQUFhO0VBQUEsV0FBYkEsYUFBYTtJQUFiQSxhQUFhO0lBQWJBLGFBQWE7RUFBQSxHQUFiQSxhQUFhLEtBQWJBLGFBQWE7RUFBQSxJQU1aQyxtQkFBbUIsV0FEeEJDLGNBQWMsQ0FBQywwREFBMEQsQ0FBQyxVQUV6RUMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxVQUc3QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVDLFlBQVksRUFBRTtFQUFNLENBQUMsQ0FBQyxVQUdsREYsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVDLFlBQVksRUFBRTtFQUFNLENBQUMsQ0FBQyxVQUdsREMsV0FBVyxDQUFDO0lBQUVGLElBQUksRUFBRSxrQkFBa0I7SUFBRUcsUUFBUSxFQUFFLEtBQUs7SUFBRUMsU0FBUyxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBRzNFQyxXQUFXLENBQUM7SUFBRUwsSUFBSSxFQUFFLHFCQUFxQjtJQUFFRyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHNURFLFdBQVcsQ0FBQztJQUFFTCxJQUFJLEVBQUUsZ0NBQWdDO0lBQUVHLFFBQVEsRUFBRTtFQUFNLENBQUMsQ0FBQyxVQUd4RUcsS0FBSyxF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