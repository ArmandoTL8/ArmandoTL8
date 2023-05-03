/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controls/filterbar/utils/VisualFilterUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/CommonHelper", "sap/fe/macros/filter/FilterUtils", "sap/m/VBox", "sap/ui/core/Core", "../../templating/FilterHelper"], function (CommonUtils, VisualFilterUtils, ClassSupport, CommonHelper, FilterUtils, VBox, Core, FilterHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var getFiltersConditionsFromSelectionVariant = FilterHelper.getFiltersConditionsFromSelectionVariant;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Constructor for a new filterBar/aligned/FilterItemLayout.
   *
   * @param {string} [sId] ID for the new control, generated automatically if no ID is given
   * @param {object} [mSettings] Initial settings for the new control
   * @class Represents a filter item on the UI.
   * @extends sap.m.VBox
   * @implements {sap.ui.core.IFormContent}
   * @class
   * @private
   * @since 1.61.0
   * @alias control sap.fe.core.controls.filterbar.VisualFilter
   */
  let VisualFilter = (_dec = defineUI5Class("sap.fe.core.controls.filterbar.VisualFilter"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "boolean"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_VBox) {
    _inheritsLoose(VisualFilter, _VBox);
    function VisualFilter() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _VBox.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showValueHelp", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueHelpIconSrc", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueHelpRequest", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = VisualFilter.prototype;
    _proto.onAfterRendering = function onAfterRendering() {
      var _this$getParent;
      let sLabel;
      const oInteractiveChart = this.getItems()[1].getItems()[0];
      const sInternalContextPath = this.data("infoPath");
      const oInteractiveChartListBinding = oInteractiveChart.getBinding("segments") || oInteractiveChart.getBinding("bars") || oInteractiveChart.getBinding("points");
      const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      const bShowOverLayInitially = oInteractiveChart.data("showOverlayInitially");
      const oSelectionVariantAnnotation = oInteractiveChart.data("selectionVariantAnnotation") ? CommonHelper.parseCustomData(oInteractiveChart.data("selectionVariantAnnotation")) : {
        SelectOptions: []
      };
      const aRequiredProperties = oInteractiveChart.data("requiredProperties") ? CommonHelper.parseCustomData(oInteractiveChart.data("requiredProperties")) : [];
      const oMetaModel = oInteractiveChart.getModel().getMetaModel();
      const sEntitySetPath = oInteractiveChartListBinding ? oInteractiveChartListBinding.getPath() : "";
      let oFilterBar = (_this$getParent = this.getParent()) === null || _this$getParent === void 0 ? void 0 : _this$getParent.getParent();
      // TODO: Remove this part once 2170204347 is fixed
      if (oFilterBar.getMetadata().getElementName() === "sap.ui.mdc.filterbar.p13n.AdaptationFilterBar") {
        var _oFilterBar$getParent;
        oFilterBar = (_oFilterBar$getParent = oFilterBar.getParent()) === null || _oFilterBar$getParent === void 0 ? void 0 : _oFilterBar$getParent.getParent();
      }
      let oFilterBarConditions = {};
      let aPropertyInfoSet = [];
      let sFilterEntityName;
      if (oFilterBar.getMetadata().getElementName() === "sap.fe.core.controls.FilterBar") {
        oFilterBarConditions = oFilterBar.getConditions();
        aPropertyInfoSet = oFilterBar.getPropertyInfoSet();
        sFilterEntityName = oFilterBar.data("entityType").split("/")[1];
      }
      const aParameters = oInteractiveChart.data("parameters") ? oInteractiveChart.data("parameters").customData : [];
      const filterConditions = getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, oSelectionVariantAnnotation, VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils));
      const oSelectionVariantConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
      const mConditions = {};
      Object.keys(oFilterBarConditions).forEach(function (sKey) {
        if (oFilterBarConditions[sKey].length) {
          mConditions[sKey] = oFilterBarConditions[sKey];
        }
      });
      Object.keys(oSelectionVariantConditions).forEach(function (sKey) {
        if (!mConditions[sKey]) {
          mConditions[sKey] = oSelectionVariantConditions[sKey];
        }
      });
      if (bShowOverLayInitially === "true") {
        if (!Object.keys(oSelectionVariantAnnotation).length) {
          if (aRequiredProperties.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            sLabel = oMetaModel.getObject(`${sEntitySetPath}/${aRequiredProperties[0]}@com.sap.vocabularies.Common.v1.Label`) || aRequiredProperties[0];
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel)
            });
          }
        } else {
          const aSelectOptions = [];
          const aNotMatchedConditions = [];
          if (oSelectionVariantAnnotation.SelectOptions) {
            oSelectionVariantAnnotation.SelectOptions.forEach(function (oSelectOption) {
              aSelectOptions.push(oSelectOption.PropertyName.$PropertyPath);
            });
          }
          if (oSelectionVariantAnnotation.Parameters) {
            oSelectionVariantAnnotation.Parameters.forEach(function (oParameter) {
              aSelectOptions.push(oParameter.PropertyName.$PropertyPath);
            });
          }
          aRequiredProperties.forEach(function (sPath) {
            if (aSelectOptions.indexOf(sPath) === -1) {
              aNotMatchedConditions.push(sPath);
            }
          });
          if (aNotMatchedConditions.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            sLabel = oMetaModel.getObject(`${sEntitySetPath}/${aNotMatchedConditions[0]}@com.sap.vocabularies.Common.v1.Label`) || aNotMatchedConditions[0];
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel)
            });
          }
          if (aNotMatchedConditions.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", aNotMatchedConditions[0])
            });
          }
        }
      }
      if (!this._oChartBinding || this._oChartBinding !== oInteractiveChartListBinding) {
        if (this._oChartBinding) {
          this.detachDataReceivedHandler(this._oChartBinding);
        }
        this.attachDataRecivedHandler(oInteractiveChartListBinding);
        this._oChartBinding = oInteractiveChartListBinding;
      }
      const bShowOverlay = oInternalModelContext.getProperty(sInternalContextPath) && oInternalModelContext.getProperty(sInternalContextPath).showError;
      const sChartEntityName = sEntitySetPath !== "" ? sEntitySetPath.split("/")[1].split("(")[0] : "";
      if (aParameters && aParameters.length && sFilterEntityName === sChartEntityName) {
        const sBindingPath = FilterUtils.getBindingPathForParameters(oFilterBar, mConditions, aPropertyInfoSet, aParameters);
        if (sBindingPath) {
          oInteractiveChartListBinding.sPath = sBindingPath;
        }
      }
      // resume binding for only those visual filters that do not have a in parameter attached.
      // Bindings of visual filters with inParameters will be resumed later after considering in parameters.
      if (oInteractiveChartListBinding && oInteractiveChartListBinding.isSuspended() && !bShowOverlay) {
        oInteractiveChartListBinding.resume();
      }
    };
    _proto.attachDataRecivedHandler = function attachDataRecivedHandler(oInteractiveChartListBinding) {
      if (oInteractiveChartListBinding) {
        oInteractiveChartListBinding.attachEvent("dataReceived", this.onInternalDataReceived, this);
        this._oChartBinding = oInteractiveChartListBinding;
      }
    };
    _proto.detachDataReceivedHandler = function detachDataReceivedHandler(oInteractiveChartListBinding) {
      if (oInteractiveChartListBinding) {
        oInteractiveChartListBinding.detachEvent("dataReceived", this.onInternalDataReceived, this);
        this._oChartBinding = undefined;
      }
    };
    _proto.setShowValueHelp = function setShowValueHelp(bShowValueHelp) {
      if (this.getItems().length > 0) {
        const oVisualFilterControl = this.getItems()[0].getItems()[0];
        oVisualFilterControl.getContent().some(function (oInnerControl) {
          if (oInnerControl.isA("sap.m.Button")) {
            oInnerControl.setVisible(bShowValueHelp);
          }
        });
        this.setProperty("showValueHelp", bShowValueHelp);
      }
    };
    _proto.setValueHelpIconSrc = function setValueHelpIconSrc(sIconSrc) {
      if (this.getItems().length > 0) {
        const oVisualFilterControl = this.getItems()[0].getItems()[0];
        oVisualFilterControl.getContent().some(function (oInnerControl) {
          if (oInnerControl.isA("sap.m.Button")) {
            oInnerControl.setIcon(sIconSrc);
          }
        });
        this.setProperty("valueHelpIconSrc", sIconSrc);
      }
    };
    _proto.onInternalDataReceived = function onInternalDataReceived(oEvent) {
      const sId = this.getId();
      const oView = CommonUtils.getTargetView(this);
      const oInteractiveChart = this.getItems()[1].getItems()[0];
      const sInternalContextPath = this.data("infoPath");
      const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      const vUOM = oInteractiveChart.data("uom");
      VisualFilterUtils.updateChartScaleFactorTitle(oInteractiveChart, oView, sId, sInternalContextPath);
      if (oEvent.getParameter("error")) {
        const s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
        const s18nMessage = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_DATA_TEXT");
        VisualFilterUtils.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInternalContextPath, oView);
      } else if (oEvent.getParameter("data")) {
        const oData = oEvent.getSource().getCurrentContexts();
        if (oData && oData.length === 0) {
          VisualFilterUtils.setNoDataMessage(sInternalContextPath, oResourceBundle, oView);
        } else {
          oInternalModelContext.setProperty(sInternalContextPath, {});
        }
        VisualFilterUtils.setMultiUOMMessage(oData, oInteractiveChart, sInternalContextPath, oResourceBundle, oView);
      }
      if (vUOM && (vUOM["ISOCurrency"] && vUOM["ISOCurrency"].$Path || vUOM["Unit"] && vUOM["Unit"].$Path)) {
        const oContexts = oEvent.getSource().getContexts();
        const oContextData = oContexts && oContexts[0].getObject();
        VisualFilterUtils.applyUOMToTitle(oInteractiveChart, oContextData, oView, sInternalContextPath);
      }
    };
    return VisualFilter;
  }(VBox), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "showValueHelp", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "valueHelpIconSrc", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "valueHelpRequest", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return VisualFilter;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImV2ZW50Iiwib25BZnRlclJlbmRlcmluZyIsInNMYWJlbCIsIm9JbnRlcmFjdGl2ZUNoYXJ0IiwiZ2V0SXRlbXMiLCJzSW50ZXJuYWxDb250ZXh0UGF0aCIsImRhdGEiLCJvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nIiwiZ2V0QmluZGluZyIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImJTaG93T3ZlckxheUluaXRpYWxseSIsIm9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbiIsIkNvbW1vbkhlbHBlciIsInBhcnNlQ3VzdG9tRGF0YSIsIlNlbGVjdE9wdGlvbnMiLCJhUmVxdWlyZWRQcm9wZXJ0aWVzIiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0VudGl0eVNldFBhdGgiLCJnZXRQYXRoIiwib0ZpbHRlckJhciIsImdldFBhcmVudCIsImdldE1ldGFkYXRhIiwiZ2V0RWxlbWVudE5hbWUiLCJvRmlsdGVyQmFyQ29uZGl0aW9ucyIsImFQcm9wZXJ0eUluZm9TZXQiLCJzRmlsdGVyRW50aXR5TmFtZSIsImdldENvbmRpdGlvbnMiLCJnZXRQcm9wZXJ0eUluZm9TZXQiLCJzcGxpdCIsImFQYXJhbWV0ZXJzIiwiY3VzdG9tRGF0YSIsImZpbHRlckNvbmRpdGlvbnMiLCJnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50IiwiVmlzdWFsRmlsdGVyVXRpbHMiLCJnZXRDdXN0b21Db25kaXRpb25zIiwiYmluZCIsIm9TZWxlY3Rpb25WYXJpYW50Q29uZGl0aW9ucyIsImNvbnZlcnRGaWx0ZXJDb25kaW9ucyIsIm1Db25kaXRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzS2V5IiwibGVuZ3RoIiwic2V0UHJvcGVydHkiLCJzaG93RXJyb3IiLCJlcnJvck1lc3NhZ2VUaXRsZSIsImdldFRleHQiLCJlcnJvck1lc3NhZ2UiLCJnZXRPYmplY3QiLCJhU2VsZWN0T3B0aW9ucyIsImFOb3RNYXRjaGVkQ29uZGl0aW9ucyIsIm9TZWxlY3RPcHRpb24iLCJwdXNoIiwiUHJvcGVydHlOYW1lIiwiJFByb3BlcnR5UGF0aCIsIlBhcmFtZXRlcnMiLCJvUGFyYW1ldGVyIiwic1BhdGgiLCJpbmRleE9mIiwiX29DaGFydEJpbmRpbmciLCJkZXRhY2hEYXRhUmVjZWl2ZWRIYW5kbGVyIiwiYXR0YWNoRGF0YVJlY2l2ZWRIYW5kbGVyIiwiYlNob3dPdmVybGF5IiwiZ2V0UHJvcGVydHkiLCJzQ2hhcnRFbnRpdHlOYW1lIiwic0JpbmRpbmdQYXRoIiwiRmlsdGVyVXRpbHMiLCJnZXRCaW5kaW5nUGF0aEZvclBhcmFtZXRlcnMiLCJpc1N1c3BlbmRlZCIsInJlc3VtZSIsImF0dGFjaEV2ZW50Iiwib25JbnRlcm5hbERhdGFSZWNlaXZlZCIsImRldGFjaEV2ZW50IiwidW5kZWZpbmVkIiwic2V0U2hvd1ZhbHVlSGVscCIsImJTaG93VmFsdWVIZWxwIiwib1Zpc3VhbEZpbHRlckNvbnRyb2wiLCJnZXRDb250ZW50Iiwic29tZSIsIm9Jbm5lckNvbnRyb2wiLCJpc0EiLCJzZXRWaXNpYmxlIiwic2V0VmFsdWVIZWxwSWNvblNyYyIsInNJY29uU3JjIiwic2V0SWNvbiIsIm9FdmVudCIsInNJZCIsImdldElkIiwib1ZpZXciLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJ2VU9NIiwidXBkYXRlQ2hhcnRTY2FsZUZhY3RvclRpdGxlIiwiZ2V0UGFyYW1ldGVyIiwiczE4bk1lc3NhZ2VUaXRsZSIsInMxOG5NZXNzYWdlIiwiYXBwbHlFcnJvck1lc3NhZ2VBbmRUaXRsZSIsIm9EYXRhIiwiZ2V0U291cmNlIiwiZ2V0Q3VycmVudENvbnRleHRzIiwic2V0Tm9EYXRhTWVzc2FnZSIsInNldE11bHRpVU9NTWVzc2FnZSIsIiRQYXRoIiwib0NvbnRleHRzIiwiZ2V0Q29udGV4dHMiLCJvQ29udGV4dERhdGEiLCJhcHBseVVPTVRvVGl0bGUiLCJWQm94Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWaXN1YWxGaWx0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IFZpc3VhbEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9scy9maWx0ZXJiYXIvdXRpbHMvVmlzdWFsRmlsdGVyVXRpbHNcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBldmVudCwgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCBWQm94IGZyb20gXCJzYXAvbS9WQm94XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgeyBJRm9ybUNvbnRlbnQgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IHsgZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudCB9IGZyb20gXCIuLi8uLi90ZW1wbGF0aW5nL0ZpbHRlckhlbHBlclwiO1xuLyoqXG4gKiBDb25zdHJ1Y3RvciBmb3IgYSBuZXcgZmlsdGVyQmFyL2FsaWduZWQvRmlsdGVySXRlbUxheW91dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gW3NJZF0gSUQgZm9yIHRoZSBuZXcgY29udHJvbCwgZ2VuZXJhdGVkIGF1dG9tYXRpY2FsbHkgaWYgbm8gSUQgaXMgZ2l2ZW5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbbVNldHRpbmdzXSBJbml0aWFsIHNldHRpbmdzIGZvciB0aGUgbmV3IGNvbnRyb2xcbiAqIEBjbGFzcyBSZXByZXNlbnRzIGEgZmlsdGVyIGl0ZW0gb24gdGhlIFVJLlxuICogQGV4dGVuZHMgc2FwLm0uVkJveFxuICogQGltcGxlbWVudHMge3NhcC51aS5jb3JlLklGb3JtQ29udGVudH1cbiAqIEBjbGFzc1xuICogQHByaXZhdGVcbiAqIEBzaW5jZSAxLjYxLjBcbiAqIEBhbGlhcyBjb250cm9sIHNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhci5WaXN1YWxGaWx0ZXJcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLlZpc3VhbEZpbHRlclwiKVxuY2xhc3MgVmlzdWFsRmlsdGVyIGV4dGVuZHMgVkJveCBpbXBsZW1lbnRzIElGb3JtQ29udGVudCB7XG5cdEBpbXBsZW1lbnRJbnRlcmZhY2UoXCJzYXAudWkuY29yZS5JRm9ybUNvbnRlbnRcIilcblx0X19pbXBsZW1lbnRzX19zYXBfdWlfY29yZV9JRm9ybUNvbnRlbnQ6IGJvb2xlYW4gPSB0cnVlO1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHNob3dWYWx1ZUhlbHAhOiBib29sZWFuO1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dmFsdWVIZWxwSWNvblNyYyE6IHN0cmluZztcblx0QGV2ZW50KClcblx0dmFsdWVIZWxwUmVxdWVzdCE6IEZ1bmN0aW9uO1xuXHRwcml2YXRlIF9vQ2hhcnRCaW5kaW5nPzogYm9vbGVhbjtcblxuXHRvbkFmdGVyUmVuZGVyaW5nKCkge1xuXHRcdGxldCBzTGFiZWw7XG5cdFx0Y29uc3Qgb0ludGVyYWN0aXZlQ2hhcnQgPSAodGhpcy5nZXRJdGVtcygpWzFdIGFzIGFueSkuZ2V0SXRlbXMoKVswXTtcblx0XHRjb25zdCBzSW50ZXJuYWxDb250ZXh0UGF0aCA9IHRoaXMuZGF0YShcImluZm9QYXRoXCIpO1xuXHRcdGNvbnN0IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcgPVxuXHRcdFx0b0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZyhcInNlZ21lbnRzXCIpIHx8IG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJpbmRpbmcoXCJiYXJzXCIpIHx8IG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJpbmRpbmcoXCJwb2ludHNcIik7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cdFx0Y29uc3QgYlNob3dPdmVyTGF5SW5pdGlhbGx5ID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInNob3dPdmVybGF5SW5pdGlhbGx5XCIpO1xuXHRcdGNvbnN0IG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbjogYW55ID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uXCIpXG5cdFx0XHQ/IENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEob0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uXCIpKVxuXHRcdFx0OiB7IFNlbGVjdE9wdGlvbnM6IFtdIH07XG5cdFx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllczogYW55W10gPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwicmVxdWlyZWRQcm9wZXJ0aWVzXCIpXG5cdFx0XHQ/IChDb21tb25IZWxwZXIucGFyc2VDdXN0b21EYXRhKG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJyZXF1aXJlZFByb3BlcnRpZXNcIikpIGFzIGFueVtdKVxuXHRcdFx0OiBbXTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0ludGVyYWN0aXZlQ2hhcnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcgPyBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLmdldFBhdGgoKSA6IFwiXCI7XG5cdFx0bGV0IG9GaWx0ZXJCYXIgPSB0aGlzLmdldFBhcmVudCgpPy5nZXRQYXJlbnQoKSBhcyBGaWx0ZXJCYXI7XG5cdFx0Ly8gVE9ETzogUmVtb3ZlIHRoaXMgcGFydCBvbmNlIDIxNzAyMDQzNDcgaXMgZml4ZWRcblx0XHRpZiAob0ZpbHRlckJhci5nZXRNZXRhZGF0YSgpLmdldEVsZW1lbnROYW1lKCkgPT09IFwic2FwLnVpLm1kYy5maWx0ZXJiYXIucDEzbi5BZGFwdGF0aW9uRmlsdGVyQmFyXCIpIHtcblx0XHRcdG9GaWx0ZXJCYXIgPSBvRmlsdGVyQmFyLmdldFBhcmVudCgpPy5nZXRQYXJlbnQoKSBhcyBGaWx0ZXJCYXI7XG5cdFx0fVxuXHRcdGxldCBvRmlsdGVyQmFyQ29uZGl0aW9uczogYW55ID0ge307XG5cdFx0bGV0IGFQcm9wZXJ0eUluZm9TZXQgPSBbXTtcblx0XHRsZXQgc0ZpbHRlckVudGl0eU5hbWU7XG5cdFx0aWYgKG9GaWx0ZXJCYXIuZ2V0TWV0YWRhdGEoKS5nZXRFbGVtZW50TmFtZSgpID09PSBcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbHRlckJhclwiKSB7XG5cdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9ucyA9IG9GaWx0ZXJCYXIuZ2V0Q29uZGl0aW9ucygpO1xuXHRcdFx0YVByb3BlcnR5SW5mb1NldCA9IChvRmlsdGVyQmFyIGFzIGFueSkuZ2V0UHJvcGVydHlJbmZvU2V0KCk7XG5cdFx0XHRzRmlsdGVyRW50aXR5TmFtZSA9IG9GaWx0ZXJCYXIuZGF0YShcImVudGl0eVR5cGVcIikuc3BsaXQoXCIvXCIpWzFdO1xuXHRcdH1cblx0XHRjb25zdCBhUGFyYW1ldGVycyA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJwYXJhbWV0ZXJzXCIpID8gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInBhcmFtZXRlcnNcIikuY3VzdG9tRGF0YSA6IFtdO1xuXHRcdGNvbnN0IGZpbHRlckNvbmRpdGlvbnMgPSBnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50KFxuXHRcdFx0c0VudGl0eVNldFBhdGgsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0VmlzdWFsRmlsdGVyVXRpbHMuZ2V0Q3VzdG9tQ29uZGl0aW9ucy5iaW5kKFZpc3VhbEZpbHRlclV0aWxzKVxuXHRcdCk7XG5cdFx0Y29uc3Qgb1NlbGVjdGlvblZhcmlhbnRDb25kaXRpb25zID0gVmlzdWFsRmlsdGVyVXRpbHMuY29udmVydEZpbHRlckNvbmRpb25zKGZpbHRlckNvbmRpdGlvbnMpO1xuXHRcdGNvbnN0IG1Db25kaXRpb25zOiBhbnkgPSB7fTtcblxuXHRcdE9iamVjdC5rZXlzKG9GaWx0ZXJCYXJDb25kaXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdGlmIChvRmlsdGVyQmFyQ29uZGl0aW9uc1tzS2V5XS5sZW5ndGgpIHtcblx0XHRcdFx0bUNvbmRpdGlvbnNbc0tleV0gPSBvRmlsdGVyQmFyQ29uZGl0aW9uc1tzS2V5XTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdE9iamVjdC5rZXlzKG9TZWxlY3Rpb25WYXJpYW50Q29uZGl0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRpZiAoIW1Db25kaXRpb25zW3NLZXldKSB7XG5cdFx0XHRcdG1Db25kaXRpb25zW3NLZXldID0gb1NlbGVjdGlvblZhcmlhbnRDb25kaXRpb25zW3NLZXldO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGlmIChiU2hvd092ZXJMYXlJbml0aWFsbHkgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRpZiAoIU9iamVjdC5rZXlzKG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbikubGVuZ3RoKSB7XG5cdFx0XHRcdGlmIChhUmVxdWlyZWRQcm9wZXJ0aWVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgsIHtcblx0XHRcdFx0XHRcdHNob3dFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZVRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX1BST1ZJREVfRklMVEVSX1ZBTF9NVUxUSVBMRVZGXCIpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c0xhYmVsID1cblx0XHRcdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS8ke2FSZXF1aXJlZFByb3BlcnRpZXNbMF19QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbGApIHx8XG5cdFx0XHRcdFx0XHRhUmVxdWlyZWRQcm9wZXJ0aWVzWzBdO1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCwge1xuXHRcdFx0XHRcdFx0c2hvd0Vycm9yOiB0cnVlLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlVGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX1NJTkdMRVZGXCIsIHNMYWJlbClcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgYVNlbGVjdE9wdGlvbnM6IGFueVtdID0gW107XG5cdFx0XHRcdGNvbnN0IGFOb3RNYXRjaGVkQ29uZGl0aW9uczogYW55W10gPSBbXTtcblx0XHRcdFx0aWYgKG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbi5TZWxlY3RPcHRpb25zKSB7XG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLlNlbGVjdE9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob1NlbGVjdE9wdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRhU2VsZWN0T3B0aW9ucy5wdXNoKG9TZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lLiRQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24uUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbi5QYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdFx0XHRcdFx0YVNlbGVjdE9wdGlvbnMucHVzaChvUGFyYW1ldGVyLlByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhUmVxdWlyZWRQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHNQYXRoOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAoYVNlbGVjdE9wdGlvbnMuaW5kZXhPZihzUGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRhTm90TWF0Y2hlZENvbmRpdGlvbnMucHVzaChzUGF0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKGFOb3RNYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoLCB7XG5cdFx0XHRcdFx0XHRzaG93RXJyb3I6IHRydWUsXG5cdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2VUaXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIiksXG5cdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2U6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19QUk9WSURFX0ZJTFRFUl9WQUxfTVVMVElQTEVWRlwiKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNMYWJlbCA9XG5cdFx0XHRcdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH0vJHthTm90TWF0Y2hlZENvbmRpdGlvbnNbMF19QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbGApIHx8XG5cdFx0XHRcdFx0XHRhTm90TWF0Y2hlZENvbmRpdGlvbnNbMF07XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoLCB7XG5cdFx0XHRcdFx0XHRzaG93RXJyb3I6IHRydWUsXG5cdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2VUaXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIiksXG5cdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2U6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19QUk9WSURFX0ZJTFRFUl9WQUxfU0lOR0xFVkZcIiwgc0xhYmVsKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhTm90TWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCwge1xuXHRcdFx0XHRcdFx0c2hvd0Vycm9yOiB0cnVlLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlVGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX01VTFRJUExFVkZcIilcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgsIHtcblx0XHRcdFx0XHRcdHNob3dFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZVRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX1BST1ZJREVfRklMVEVSX1ZBTF9TSU5HTEVWRlwiLCBhTm90TWF0Y2hlZENvbmRpdGlvbnNbMF0pXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuX29DaGFydEJpbmRpbmcgfHwgdGhpcy5fb0NoYXJ0QmluZGluZyAhPT0gb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZykge1xuXHRcdFx0aWYgKHRoaXMuX29DaGFydEJpbmRpbmcpIHtcblx0XHRcdFx0dGhpcy5kZXRhY2hEYXRhUmVjZWl2ZWRIYW5kbGVyKHRoaXMuX29DaGFydEJpbmRpbmcpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5hdHRhY2hEYXRhUmVjaXZlZEhhbmRsZXIob0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZyk7XG5cdFx0XHR0aGlzLl9vQ2hhcnRCaW5kaW5nID0gb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZztcblx0XHR9XG5cdFx0Y29uc3QgYlNob3dPdmVybGF5ID1cblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCkgJiYgb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoKS5zaG93RXJyb3I7XG5cdFx0Y29uc3Qgc0NoYXJ0RW50aXR5TmFtZSA9IHNFbnRpdHlTZXRQYXRoICE9PSBcIlwiID8gc0VudGl0eVNldFBhdGguc3BsaXQoXCIvXCIpWzFdLnNwbGl0KFwiKFwiKVswXSA6IFwiXCI7XG5cdFx0aWYgKGFQYXJhbWV0ZXJzICYmIGFQYXJhbWV0ZXJzLmxlbmd0aCAmJiBzRmlsdGVyRW50aXR5TmFtZSA9PT0gc0NoYXJ0RW50aXR5TmFtZSkge1xuXHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gRmlsdGVyVXRpbHMuZ2V0QmluZGluZ1BhdGhGb3JQYXJhbWV0ZXJzKG9GaWx0ZXJCYXIsIG1Db25kaXRpb25zLCBhUHJvcGVydHlJbmZvU2V0LCBhUGFyYW1ldGVycyk7XG5cdFx0XHRpZiAoc0JpbmRpbmdQYXRoKSB7XG5cdFx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuc1BhdGggPSBzQmluZGluZ1BhdGg7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIHJlc3VtZSBiaW5kaW5nIGZvciBvbmx5IHRob3NlIHZpc3VhbCBmaWx0ZXJzIHRoYXQgZG8gbm90IGhhdmUgYSBpbiBwYXJhbWV0ZXIgYXR0YWNoZWQuXG5cdFx0Ly8gQmluZGluZ3Mgb2YgdmlzdWFsIGZpbHRlcnMgd2l0aCBpblBhcmFtZXRlcnMgd2lsbCBiZSByZXN1bWVkIGxhdGVyIGFmdGVyIGNvbnNpZGVyaW5nIGluIHBhcmFtZXRlcnMuXG5cdFx0aWYgKG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcgJiYgb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5pc1N1c3BlbmRlZCgpICYmICFiU2hvd092ZXJsYXkpIHtcblx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcucmVzdW1lKCk7XG5cdFx0fVxuXHR9XG5cblx0YXR0YWNoRGF0YVJlY2l2ZWRIYW5kbGVyKG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmc6IGFueSkge1xuXHRcdGlmIChvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nKSB7XG5cdFx0XHRvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLmF0dGFjaEV2ZW50KFwiZGF0YVJlY2VpdmVkXCIsIHRoaXMub25JbnRlcm5hbERhdGFSZWNlaXZlZCwgdGhpcyk7XG5cdFx0XHR0aGlzLl9vQ2hhcnRCaW5kaW5nID0gb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZztcblx0XHR9XG5cdH1cblxuXHRkZXRhY2hEYXRhUmVjZWl2ZWRIYW5kbGVyKG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmc6IGFueSkge1xuXHRcdGlmIChvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nKSB7XG5cdFx0XHRvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLmRldGFjaEV2ZW50KFwiZGF0YVJlY2VpdmVkXCIsIHRoaXMub25JbnRlcm5hbERhdGFSZWNlaXZlZCwgdGhpcyk7XG5cdFx0XHR0aGlzLl9vQ2hhcnRCaW5kaW5nID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdHNldFNob3dWYWx1ZUhlbHAoYlNob3dWYWx1ZUhlbHA6IGFueSkge1xuXHRcdGlmICh0aGlzLmdldEl0ZW1zKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3Qgb1Zpc3VhbEZpbHRlckNvbnRyb2wgPSAodGhpcy5nZXRJdGVtcygpWzBdIGFzIGFueSkuZ2V0SXRlbXMoKVswXTtcblx0XHRcdG9WaXN1YWxGaWx0ZXJDb250cm9sLmdldENvbnRlbnQoKS5zb21lKGZ1bmN0aW9uIChvSW5uZXJDb250cm9sOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9Jbm5lckNvbnRyb2wuaXNBKFwic2FwLm0uQnV0dG9uXCIpKSB7XG5cdFx0XHRcdFx0b0lubmVyQ29udHJvbC5zZXRWaXNpYmxlKGJTaG93VmFsdWVIZWxwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFByb3BlcnR5KFwic2hvd1ZhbHVlSGVscFwiLCBiU2hvd1ZhbHVlSGVscCk7XG5cdFx0fVxuXHR9XG5cblx0c2V0VmFsdWVIZWxwSWNvblNyYyhzSWNvblNyYzogYW55KSB7XG5cdFx0aWYgKHRoaXMuZ2V0SXRlbXMoKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBvVmlzdWFsRmlsdGVyQ29udHJvbCA9ICh0aGlzLmdldEl0ZW1zKClbMF0gYXMgYW55KS5nZXRJdGVtcygpWzBdO1xuXHRcdFx0b1Zpc3VhbEZpbHRlckNvbnRyb2wuZ2V0Q29udGVudCgpLnNvbWUoZnVuY3Rpb24gKG9Jbm5lckNvbnRyb2w6IGFueSkge1xuXHRcdFx0XHRpZiAob0lubmVyQ29udHJvbC5pc0EoXCJzYXAubS5CdXR0b25cIikpIHtcblx0XHRcdFx0XHRvSW5uZXJDb250cm9sLnNldEljb24oc0ljb25TcmMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UHJvcGVydHkoXCJ2YWx1ZUhlbHBJY29uU3JjXCIsIHNJY29uU3JjKTtcblx0XHR9XG5cdH1cblxuXHRvbkludGVybmFsRGF0YVJlY2VpdmVkKG9FdmVudDogYW55KSB7XG5cdFx0Y29uc3Qgc0lkID0gdGhpcy5nZXRJZCgpO1xuXHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0Vmlldyh0aGlzKTtcblx0XHRjb25zdCBvSW50ZXJhY3RpdmVDaGFydCA9ICh0aGlzLmdldEl0ZW1zKClbMV0gYXMgYW55KS5nZXRJdGVtcygpWzBdO1xuXHRcdGNvbnN0IHNJbnRlcm5hbENvbnRleHRQYXRoID0gdGhpcy5kYXRhKFwiaW5mb1BhdGhcIik7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cdFx0Y29uc3QgdlVPTSA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJ1b21cIik7XG5cdFx0VmlzdWFsRmlsdGVyVXRpbHMudXBkYXRlQ2hhcnRTY2FsZUZhY3RvclRpdGxlKG9JbnRlcmFjdGl2ZUNoYXJ0LCBvVmlldywgc0lkLCBzSW50ZXJuYWxDb250ZXh0UGF0aCk7XG5cdFx0aWYgKG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJlcnJvclwiKSkge1xuXHRcdFx0Y29uc3QgczE4bk1lc3NhZ2VUaXRsZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpO1xuXHRcdFx0Y29uc3QgczE4bk1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfREFUQV9URVhUXCIpO1xuXHRcdFx0VmlzdWFsRmlsdGVyVXRpbHMuYXBwbHlFcnJvck1lc3NhZ2VBbmRUaXRsZShzMThuTWVzc2FnZVRpdGxlLCBzMThuTWVzc2FnZSwgc0ludGVybmFsQ29udGV4dFBhdGgsIG9WaWV3KTtcblx0XHR9IGVsc2UgaWYgKG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJkYXRhXCIpKSB7XG5cdFx0XHRjb25zdCBvRGF0YSA9IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRDdXJyZW50Q29udGV4dHMoKTtcblx0XHRcdGlmIChvRGF0YSAmJiBvRGF0YS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0VmlzdWFsRmlsdGVyVXRpbHMuc2V0Tm9EYXRhTWVzc2FnZShzSW50ZXJuYWxDb250ZXh0UGF0aCwgb1Jlc291cmNlQnVuZGxlLCBvVmlldyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgsIHt9KTtcblx0XHRcdH1cblx0XHRcdFZpc3VhbEZpbHRlclV0aWxzLnNldE11bHRpVU9NTWVzc2FnZShvRGF0YSwgb0ludGVyYWN0aXZlQ2hhcnQsIHNJbnRlcm5hbENvbnRleHRQYXRoLCBvUmVzb3VyY2VCdW5kbGUsIG9WaWV3KTtcblx0XHR9XG5cdFx0aWYgKHZVT00gJiYgKCh2VU9NW1wiSVNPQ3VycmVuY3lcIl0gJiYgdlVPTVtcIklTT0N1cnJlbmN5XCJdLiRQYXRoKSB8fCAodlVPTVtcIlVuaXRcIl0gJiYgdlVPTVtcIlVuaXRcIl0uJFBhdGgpKSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRleHRzID0gb0V2ZW50LmdldFNvdXJjZSgpLmdldENvbnRleHRzKCk7XG5cdFx0XHRjb25zdCBvQ29udGV4dERhdGEgPSBvQ29udGV4dHMgJiYgb0NvbnRleHRzWzBdLmdldE9iamVjdCgpO1xuXHRcdFx0VmlzdWFsRmlsdGVyVXRpbHMuYXBwbHlVT01Ub1RpdGxlKG9JbnRlcmFjdGl2ZUNoYXJ0LCBvQ29udGV4dERhdGEsIG9WaWV3LCBzSW50ZXJuYWxDb250ZXh0UGF0aCk7XG5cdFx0fVxuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBWaXN1YWxGaWx0ZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVpBLElBY01BLFlBQVksV0FEakJDLGNBQWMsQ0FBQyw2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