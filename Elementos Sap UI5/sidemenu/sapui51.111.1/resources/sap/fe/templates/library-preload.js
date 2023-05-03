//@ui5-bundle sap/fe/templates/library-preload.js
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/AnalyticalListPage/Component-dbg", ["sap/fe/core/helpers/ClassSupport", "sap/fe/templates/ListComponent"], function (ClassSupport, ListComponent) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let AnalyticalListPageComponent = (_dec = defineUI5Class("sap.fe.templates.AnalyticalListPage.Component"), _dec(_class = /*#__PURE__*/function (_ListComponent) {
    _inheritsLoose(AnalyticalListPageComponent, _ListComponent);
    function AnalyticalListPageComponent() {
      return _ListComponent.apply(this, arguments) || this;
    }
    return AnalyticalListPageComponent;
  }(ListComponent)) || _class);
  return AnalyticalListPageComponent;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/AnalyticalListPage/Component", ["sap/fe/core/helpers/ClassSupport","sap/fe/templates/ListComponent"],function(t,e){"use strict";var n,o;var r=t.defineUI5Class;function p(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;s(t,e)}function s(t,e){s=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,n){e.__proto__=n;return e};return s(t,e)}let a=(n=r("sap.fe.templates.AnalyticalListPage.Component"),n(o=function(t){p(e,t);function e(){return t.apply(this,arguments)||this}return e}(e))||o);return a},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/AnalyticalListPage/chart/FEChartDelegate-dbg", ["sap/fe/macros/chart/ChartDelegate"], function (BaseChartDelegate) {
  "use strict";

  // ---------------------------------------------------------------------------------------
  // Helper class used to help create content in the chart/item and fill relevant metadata
  // ---------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------
  const ChartDelegate = Object.assign({}, BaseChartDelegate);
  /**
   * @param oMDCChart The mdc chart control
   * @param oBindingInfo The binding info of chart
   * data in chart and table must be synchronised. every
   * time the chart refreshes, the table must be refreshed too.
   */
  ChartDelegate.rebind = function (oMDCChart, oBindingInfo) {
    //	var oComponent = flUtils.getAppComponentForControl(oMDCChart);
    //	var bIsSearchTriggered = oComponent.getAppStateHandler().getIsSearchTriggered();
    // workaround in place to prevent chart from loading when go button is present and initial load is false
    //	if (bIsSearchTriggered) {
    const oInternalModelContext = oMDCChart.getBindingContext("pageInternal");
    const sTemplateContentView = oInternalModelContext.getProperty(`${oInternalModelContext.getPath()}/alpContentView`);
    if (!sTemplateContentView || sTemplateContentView !== "Table") {
      BaseChartDelegate.rebind(oMDCChart, oBindingInfo);
    }
  };
  return ChartDelegate;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/AnalyticalListPage/chart/FEChartDelegate", ["sap/fe/macros/chart/ChartDelegate"],function(e){"use strict";const t=Object.assign({},e);t.rebind=function(t,n){const a=t.getBindingContext("pageInternal");const i=a.getProperty(`${a.getPath()}/alpContentView`);if(!i||i!=="Table"){e.rebind(t,n)}};return t},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListComponent-dbg", ["sap/fe/core/helpers/ClassSupport", "sap/fe/core/library", "sap/fe/core/TemplateComponent"], function (ClassSupport, CoreLibrary, TemplateComponent) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const VariantManagement = CoreLibrary.VariantManagement,
    InitialLoadMode = CoreLibrary.InitialLoadMode;
  let ListBasedComponent = (_dec = defineUI5Class("sap.fe.templates.ListComponent", {
    manifest: {
      "sap.ui": {
        technology: "UI5",
        deviceTypes: {
          desktop: true,
          tablet: true,
          phone: true
        },
        supportedThemes: ["sap_fiori_3", "sap_hcb", "sap_bluecrystal", "sap_belize", "sap_belize_plus", "sap_belize_hcw"]
      },
      "sap.ui5": {
        services: {
          templatedViewService: {
            factoryName: "sap.fe.core.services.TemplatedViewService",
            startup: "waitFor",
            settings: {
              viewName: "sap.fe.templates.ListReport.ListReport",
              converterType: "ListReport",
              errorViewName: "sap.fe.core.services.view.TemplatingErrorPage"
            }
          },
          asyncComponentService: {
            factoryName: "sap.fe.core.services.AsyncComponentService",
            startup: "waitFor"
          }
        },
        commands: {
          Create: {
            name: "Create",
            shortcut: "Ctrl+Enter"
          },
          DeleteEntry: {
            name: "DeleteEntry",
            shortcut: "Ctrl+D"
          },
          TableSettings: {
            name: "TableSettings",
            shortcut: "Ctrl+,"
          },
          Share: {
            name: "Share",
            shortcut: "Shift+Ctrl+S"
          },
          FE_FilterSearch: {
            name: "FE_FilterSearch",
            shortcut: "Ctrl+Enter"
          }
        },
        handleValidation: true,
        dependencies: {
          minUI5Version: "${sap.ui5.core.version}",
          libs: {
            "sap.f": {},
            "sap.fe.macros": {
              lazy: true
            },
            "sap.m": {},
            "sap.suite.ui.microchart": {
              lazy: true
            },
            "sap.ui.core": {},
            "sap.ui.layout": {},
            "sap.ui.mdc": {},
            "sap.ushell": {
              lazy: true
            },
            "sap.ui.fl": {}
          }
        },
        contentDensities: {
          compact: true,
          cozy: true
        }
      }
    },
    library: "sap.fe.templates"
  }), _dec2 = property({
    type: "sap.fe.core.InitialLoadMode",
    defaultValue: InitialLoadMode.Auto
  }), _dec3 = property({
    type: "sap.fe.core.VariantManagement",
    defaultValue: VariantManagement.Page
  }), _dec4 = property({
    type: "string",
    defaultValue: undefined
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_TemplateComponent) {
    _inheritsLoose(ListBasedComponent, _TemplateComponent);
    function ListBasedComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _TemplateComponent.call(this, ...args) || this;
      _initializerDefineProperty(_this, "initialLoad", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "defaultTemplateAnnotationPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    return ListBasedComponent;
  }(TemplateComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "initialLoad", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "defaultTemplateAnnotationPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ListBasedComponent;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListComponent", ["sap/fe/core/helpers/ClassSupport","sap/fe/core/library","sap/fe/core/TemplateComponent"],function(e,t,r){"use strict";var a,i,n,o,l,s,u,p,c,f,d;var b=e.property;var m=e.defineUI5Class;function y(e,t,r,a){if(!r)return;Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(a):void 0})}function h(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function v(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;g(e,t)}function g(e,t){g=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return g(e,t)}function w(e,t,r,a,i){var n={};Object.keys(a).forEach(function(e){n[e]=a[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=r.slice().reverse().reduce(function(r,a){return a(e,t,r)||r},n);if(i&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(i):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function z(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}const _=t.VariantManagement,C=t.InitialLoadMode;let S=(a=m("sap.fe.templates.ListComponent",{manifest:{"sap.ui":{technology:"UI5",deviceTypes:{desktop:true,tablet:true,phone:true},supportedThemes:["sap_fiori_3","sap_hcb","sap_bluecrystal","sap_belize","sap_belize_plus","sap_belize_hcw"]},"sap.ui5":{services:{templatedViewService:{factoryName:"sap.fe.core.services.TemplatedViewService",startup:"waitFor",settings:{viewName:"sap.fe.templates.ListReport.ListReport",converterType:"ListReport",errorViewName:"sap.fe.core.services.view.TemplatingErrorPage"}},asyncComponentService:{factoryName:"sap.fe.core.services.AsyncComponentService",startup:"waitFor"}},commands:{Create:{name:"Create",shortcut:"Ctrl+Enter"},DeleteEntry:{name:"DeleteEntry",shortcut:"Ctrl+D"},TableSettings:{name:"TableSettings",shortcut:"Ctrl+,"},Share:{name:"Share",shortcut:"Shift+Ctrl+S"},FE_FilterSearch:{name:"FE_FilterSearch",shortcut:"Ctrl+Enter"}},handleValidation:true,dependencies:{minUI5Version:"${sap.ui5.core.version}",libs:{"sap.f":{},"sap.fe.macros":{lazy:true},"sap.m":{},"sap.suite.ui.microchart":{lazy:true},"sap.ui.core":{},"sap.ui.layout":{},"sap.ui.mdc":{},"sap.ushell":{lazy:true},"sap.ui.fl":{}}},contentDensities:{compact:true,cozy:true}}},library:"sap.fe.templates"}),i=b({type:"sap.fe.core.InitialLoadMode",defaultValue:C.Auto}),n=b({type:"sap.fe.core.VariantManagement",defaultValue:_.Page}),o=b({type:"string",defaultValue:undefined}),l=b({type:"boolean",defaultValue:false}),a(s=(u=function(e){v(t,e);function t(){var t;for(var r=arguments.length,a=new Array(r),i=0;i<r;i++){a[i]=arguments[i]}t=e.call(this,...a)||this;y(t,"initialLoad",p,h(t));y(t,"variantManagement",c,h(t));y(t,"defaultTemplateAnnotationPath",f,h(t));y(t,"liveMode",d,h(t));return t}return t}(r),p=w(u.prototype,"initialLoad",[i],{configurable:true,enumerable:true,writable:true,initializer:null}),c=w(u.prototype,"variantManagement",[n],{configurable:true,enumerable:true,writable:true,initializer:null}),f=w(u.prototype,"defaultTemplateAnnotationPath",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),d=w(u.prototype,"liveMode",[l],{configurable:true,enumerable:true,writable:true,initializer:null}),u))||s);return S},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/Component-dbg", ["sap/fe/core/helpers/ClassSupport", "sap/fe/templates/ListComponent"], function (ClassSupport, ListComponent) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ListReportComponent = (_dec = defineUI5Class("sap.fe.templates.ListReport.Component", {
    library: "sap.fe.templates",
    manifest: "json"
  }), _dec2 = property({
    type: "object"
  }), _dec3 = property({
    type: "boolean",
    defaultValue: true
  }), _dec4 = property({
    type: "object"
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec6 = property({
    type: "boolean",
    defaultValue: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_ListComponent) {
    _inheritsLoose(ListReportComponent, _ListComponent);
    function ListReportComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ListComponent.call(this, ...args) || this;
      _initializerDefineProperty(_this, "views", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stickyMultiTabHeader", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "keyPerformanceIndicators", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hideFilterBar", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useHiddenFilterBar", _descriptor5, _assertThisInitialized(_this));
      return _this;
    }
    return ListReportComponent;
  }(ListComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "views", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "stickyMultiTabHeader", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "keyPerformanceIndicators", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "hideFilterBar", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "useHiddenFilterBar", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ListReportComponent;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/Component", ["sap/fe/core/helpers/ClassSupport","sap/fe/templates/ListComponent"],function(e,r){"use strict";var t,i,n,a,l,o,u,s,c,f,p,b,d;var y=e.property;var m=e.defineUI5Class;function v(e,r,t,i){if(!t)return;Object.defineProperty(e,r,{enumerable:t.enumerable,configurable:t.configurable,writable:t.writable,value:t.initializer?t.initializer.call(i):void 0})}function w(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function h(e,r){e.prototype=Object.create(r.prototype);e.prototype.constructor=e;z(e,r)}function z(e,r){z=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(r,t){r.__proto__=t;return r};return z(e,r)}function g(e,r,t,i,n){var a={};Object.keys(i).forEach(function(e){a[e]=i[e]});a.enumerable=!!a.enumerable;a.configurable=!!a.configurable;if("value"in a||a.initializer){a.writable=true}a=t.slice().reverse().reduce(function(t,i){return i(e,r,t)||t},a);if(n&&a.initializer!==void 0){a.value=a.initializer?a.initializer.call(n):void 0;a.initializer=undefined}if(a.initializer===void 0){Object.defineProperty(e,r,a);a=null}return a}function j(e,r){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let O=(t=m("sap.fe.templates.ListReport.Component",{library:"sap.fe.templates",manifest:"json"}),i=y({type:"object"}),n=y({type:"boolean",defaultValue:true}),a=y({type:"object"}),l=y({type:"boolean",defaultValue:false}),o=y({type:"boolean",defaultValue:false}),t(u=(s=function(e){h(r,e);function r(){var r;for(var t=arguments.length,i=new Array(t),n=0;n<t;n++){i[n]=arguments[n]}r=e.call(this,...i)||this;v(r,"views",c,w(r));v(r,"stickyMultiTabHeader",f,w(r));v(r,"keyPerformanceIndicators",p,w(r));v(r,"hideFilterBar",b,w(r));v(r,"useHiddenFilterBar",d,w(r));return r}return r}(r),c=g(s.prototype,"views",[i],{configurable:true,enumerable:true,writable:true,initializer:null}),f=g(s.prototype,"stickyMultiTabHeader",[n],{configurable:true,enumerable:true,writable:true,initializer:null}),p=g(s.prototype,"keyPerformanceIndicators",[a],{configurable:true,enumerable:true,writable:true,initializer:null}),b=g(s.prototype,"hideFilterBar",[l],{configurable:true,enumerable:true,writable:true,initializer:null}),d=g(s.prototype,"useHiddenFilterBar",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),s))||u);return O},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/ExtensionAPI-dbg", ["sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/filter/FilterUtils", "sap/fe/templates/ListReport/LRMessageStrip", "sap/ui/core/InvisibleMessage", "sap/ui/core/library"], function (ExtensionAPI, ClassSupport, ChartUtils, FilterUtils, $LRMessageStrip, InvisibleMessage, library) {
  "use strict";

  var _dec, _class;
  var InvisibleMessageMode = library.InvisibleMessageMode;
  var LRMessageStrip = $LRMessageStrip.LRMessageStrip;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Extension API for list reports in SAP Fiori elements for OData V4.
   *
   * @alias sap.fe.templates.ListReport.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  let ListReportExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ListReport.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ListReportExtensionAPI, _ExtensionAPI);
    function ListReportExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ListReportExtensionAPI.prototype;
    /**
     * Refreshes the List Report.
     * This method currently only supports triggering the search (by clicking on the GO button)
     * in the List Report Filter Bar. It can be used to request the initial load or to refresh the
     * currently shown data based on the filters entered by the user.
     * Please note: The Promise is resolved once the search is triggered and not once the data is returned.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#refresh
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh() {
      const oFilterBar = this._controller._getFilterBarControl();
      if (oFilterBar) {
        return oFilterBar.waitForInitialization().then(function () {
          oFilterBar.triggerSearch();
        });
      } else {
        // TODO: if there is no filter bar, make refresh work
        return Promise.resolve();
      }
    }

    /**
     * Gets the list entries currently selected for the displayed control.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getSelectedContexts
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts() {
      var _this$_controller$_ge, _this$_controller$_ge2;
      const oControl = this._controller._isMultiMode() && ((_this$_controller$_ge = this._controller._getMultiModeControl()) === null || _this$_controller$_ge === void 0 ? void 0 : (_this$_controller$_ge2 = _this$_controller$_ge.getSelectedInnerControl()) === null || _this$_controller$_ge2 === void 0 ? void 0 : _this$_controller$_ge2.content) || this._controller._getTable();
      if (oControl.isA("sap.ui.mdc.Chart")) {
        const aSelectedContexts = [];
        if (oControl && oControl.get_chart()) {
          const aSelectedDataPoints = ChartUtils.getChartSelectedData(oControl.get_chart());
          for (let i = 0; i < aSelectedDataPoints.length; i++) {
            aSelectedContexts.push(aSelectedDataPoints[i].context);
          }
        }
        return aSelectedContexts;
      } else {
        return oControl && oControl.getSelectedContexts() || [];
      }
    }

    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param sConditionPath The path to the property as a condition path
     * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @param vValues The values to be applied
     * @alias sap.fe.templates.ListReport.ExtensionAPI#setFilterValues
     * @returns A promise for asynchronous handling
     * @public
     */;
    _proto.setFilterValues = function setFilterValues(sConditionPath, sOperator, vValues) {
      // The List Report has two filter bars: The filter bar in the header and the filter bar in the "Adapt Filter" dialog;
      // when the dialog is opened, the user is working with that active control: Pass it to the setFilterValues method!
      const filterBar = this._controller._getAdaptationFilterBarControl() || this._controller._getFilterBarControl();
      if (arguments.length === 2) {
        vValues = sOperator;
        return FilterUtils.setFilterValues(filterBar, sConditionPath, vValues);
      }
      return FilterUtils.setFilterValues(filterBar, sConditionPath, sOperator, vValues);
    }

    /**
     * This method converts filter conditions to filters.
     *
     * @param mFilterConditions Map containing the filter conditions of the FilterBar.
     * @alias sap.fe.templates.ListReport.ExtensionAPI#createFiltersFromFilterConditions
     * @returns Object containing the converted FilterBar filters.
     * @public
     */;
    _proto.createFiltersFromFilterConditions = function createFiltersFromFilterConditions(mFilterConditions) {
      const oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilterInfo(oFilterBar, undefined, mFilterConditions);
    }
    /**
     * Provides all the model filters from the filter bar that are currently active
     * along with the search expression.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getFilters
     * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
     * @public
     */;
    _proto.getFilters = function getFilters() {
      const oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilters(oFilterBar);
    }

    /**
     * Provide an option for showing a custom message in the message strip above the list report table.
     *
     * @param {object} [message] Custom message along with the message type to be set on the table.
     * @param {string} message.message Message string to be displayed.
     * @param {sap.ui.core.MessageType} message.type Indicates the type of message.
     * @param {string[]|string} [tabKey] The tabKey identifying the table where the custom message is displayed. If tabKey is empty, the message is displayed in all tabs . If tabKey = ['1','2'], the message is displayed in tabs 1 and 2 only
     * @param {Function} [onClose] A function that is called when the user closes the message bar.
     * @public
     */;
    _proto.setCustomMessage = function setCustomMessage(message, tabKey, onClose) {
      if (!this.ListReportMessageStrip) {
        this.ListReportMessageStrip = new LRMessageStrip();
      }
      this.ListReportMessageStrip.showCustomMessage(message, this._controller, tabKey, onClose);
      if (message !== null && message !== void 0 && message.message) {
        InvisibleMessage.getInstance().announce(message.message, InvisibleMessageMode.Assertive);
      }
    };
    return ListReportExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ListReportExtensionAPI;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/ExtensionAPI", ["sap/fe/core/ExtensionAPI","sap/fe/core/helpers/ClassSupport","sap/fe/macros/chart/ChartUtils","sap/fe/macros/filter/FilterUtils","sap/fe/templates/ListReport/LRMessageStrip","sap/ui/core/InvisibleMessage","sap/ui/core/library"],function(t,e,r,o,s,n,i){"use strict";var l,a;var c=i.InvisibleMessageMode;var u=s.LRMessageStrip;var p=e.defineUI5Class;function f(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;g(t,e)}function g(t,e){g=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,r){e.__proto__=r;return e};return g(t,e)}let h=(l=p("sap.fe.templates.ListReport.ExtensionAPI"),l(a=function(t){f(e,t);function e(){return t.apply(this,arguments)||this}var s=e.prototype;s.refresh=function t(){const e=this._controller._getFilterBarControl();if(e){return e.waitForInitialization().then(function(){e.triggerSearch()})}else{return Promise.resolve()}};s.getSelectedContexts=function t(){var e,o;const s=this._controller._isMultiMode()&&((e=this._controller._getMultiModeControl())===null||e===void 0?void 0:(o=e.getSelectedInnerControl())===null||o===void 0?void 0:o.content)||this._controller._getTable();if(s.isA("sap.ui.mdc.Chart")){const t=[];if(s&&s.get_chart()){const e=r.getChartSelectedData(s.get_chart());for(let r=0;r<e.length;r++){t.push(e[r].context)}}return t}else{return s&&s.getSelectedContexts()||[]}};s.setFilterValues=function t(e,r,s){const n=this._controller._getAdaptationFilterBarControl()||this._controller._getFilterBarControl();if(arguments.length===2){s=r;return o.setFilterValues(n,e,s)}return o.setFilterValues(n,e,r,s)};s.createFiltersFromFilterConditions=function t(e){const r=this._controller._getFilterBarControl();return o.getFilterInfo(r,undefined,e)};s.getFilters=function t(){const e=this._controller._getFilterBarControl();return o.getFilters(e)};s.setCustomMessage=function t(e,r,o){if(!this.ListReportMessageStrip){this.ListReportMessageStrip=new u}this.ListReportMessageStrip.showCustomMessage(e,this._controller,r,o);if(e!==null&&e!==void 0&&e.message){n.getInstance().announce(e.message,c.Assertive)}};return e}(t))||a);return h},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/LRMessageStrip-dbg", ["sap/ui/core/Core", "sap/ui/core/message/Message"], function (Core, Message) {
  "use strict";

  var _exports = {};
  let LRMessageStrip = /*#__PURE__*/function () {
    function LRMessageStrip() {
      const messageManager = Core.getMessageManager();
      this.customMessageInfo = {
        messageManagerDataBinding: messageManager.getMessageModel().bindList("/"),
        multiModeControlMessagesMap: {}
      };
    }
    _exports.LRMessageStrip = LRMessageStrip;
    var _proto = LRMessageStrip.prototype;
    _proto.getCustomMessageInfo = function getCustomMessageInfo() {
      return this.customMessageInfo;
    };
    _proto.destroy = function destroy() {
      this.customMessageInfo.messageManagerDataBinding.detachChange(this._eventHandlerCustomMessage, this);
    };
    _proto._getMessagesWithSameTargetThanCustomMessage = function _getMessagesWithSameTargetThanCustomMessage() {
      const messageManager = Core.getMessageManager();
      return messageManager.getMessageModel().getData().filter(msg => {
        var _this$customMessageIn;
        return msg.getTargets()[0] === ((_this$customMessageIn = this.customMessageInfo.currentMessage) === null || _this$customMessageIn === void 0 ? void 0 : _this$customMessageIn.getTargets()[0]) && msg !== this.customMessageInfo.currentMessage;
      });
    }

    /**
     * MessageManager Event Handler responsible to add or remove the current customMessage.
     *
     * @alias sap.fe.core.helpers.LRMessageStrip#_eventHandlerCustomMessage
     * @private
     */;
    _proto._eventHandlerCustomMessage = function _eventHandlerCustomMessage() {
      const messageManager = Core.getMessageManager();
      if (this.customMessageInfo.currentMessage) {
        const aMessageWithSameTargetThanCustomMessage = this._getMessagesWithSameTargetThanCustomMessage();
        const isCustomMessageInMessageManager = !!messageManager.getMessageModel().getData().find(msg => msg === this.customMessageInfo.currentMessage);
        if (aMessageWithSameTargetThanCustomMessage.length > 0 && isCustomMessageInMessageManager) {
          var _this$customMessageIn2;
          //if there are other messages with the same message on the MessageManager and the customMessage
          //then we need to remove the customeMessage from the MessageManager
          messageManager.removeMessages([(_this$customMessageIn2 = this.customMessageInfo) === null || _this$customMessageIn2 === void 0 ? void 0 : _this$customMessageIn2.currentMessage]);
        } else if (aMessageWithSameTargetThanCustomMessage.length === 0 && !isCustomMessageInMessageManager) {
          messageManager.addMessages([this.customMessageInfo.currentMessage]);
        }
      }
    }

    /**
     * This function manages the lifecycle of the custom message (populates the customMessageInfo object, attaches an event to the message manager and inserts a message).
     *
     * @param event Event object (optional).
     * @param oData Parameters
     * @param oData.message The LRCustomMessage to be used to generate the message object
     * @param oData.table The table targeted by the message
     * @param oData.skipMessageManagerUpdate Should skip to insert the message in the MessageManager
     * @alias sap.fe.core.helpers.LRMessageStrip#createCustomMessage
     * @private
     */;
    _proto.createCustomMessage = function createCustomMessage(event, oData) {
      var _table$getRowBinding, _customMessageMap$tab;
      const message = oData.message;
      const table = oData.table;
      const skipMessageManagerUpdate = oData.skipMessageManagerUpdate;
      const rowBindingPath = (_table$getRowBinding = table.getRowBinding()) === null || _table$getRowBinding === void 0 ? void 0 : _table$getRowBinding.getPath();
      const messageManager = Core.getMessageManager();
      const customMessageMap = this.customMessageInfo.multiModeControlMessagesMap;
      customMessageMap[table.getId()] = message;
      if (!rowBindingPath) {
        table.attachEventOnce("bindingUpdated", oData, this.createCustomMessage, this);
        return;
      }
      if ((_customMessageMap$tab = customMessageMap[table.getId()]) !== null && _customMessageMap$tab !== void 0 && _customMessageMap$tab.onClose) {
        var _customMessageMap$tab2;
        table.getDataStateIndicator().detachEvent("close", (_customMessageMap$tab2 = customMessageMap[table.getId()]) === null || _customMessageMap$tab2 === void 0 ? void 0 : _customMessageMap$tab2.onClose, this);
      }
      const processor = table.getModel();
      const oMessage = message ? new Message({
        message: message.message,
        type: message.type,
        target: [rowBindingPath],
        persistent: true,
        processor
      }) : null;
      this.customMessageInfo.messageManagerDataBinding.detachChange(this._eventHandlerCustomMessage, this);
      if (!skipMessageManagerUpdate) {
        if (this.customMessageInfo.currentMessage) {
          messageManager.removeMessages([this.customMessageInfo.currentMessage]);
        }
        if (oMessage) {
          this.customMessageInfo.currentMessage = oMessage;
        } else {
          delete this.customMessageInfo.currentMessage;
        }
        if (oMessage && this._getMessagesWithSameTargetThanCustomMessage().length === 0) {
          messageManager.addMessages([oMessage]);
        }
      }
      this.customMessageInfo.messageManagerDataBinding.attachChange(this._eventHandlerCustomMessage, this);
      this.attachDataStateIndicatorCloseEvent(table, customMessageMap, message === null || message === void 0 ? void 0 : message.onClose);
    }

    /**
     * This function attaches the onClose event function to the dataStateIndicator.
     *
     * @param table The table associated with the dataStateIndicator
     * @param customMessageMap The CustomMessageMap object
     * @param fnOnClose A function to be attached to the "close" event
     * @alias sap.fe.core.helpers.LRMessageStrip#attachDataStateIndicatorCloseEvent
     * @private
     */;
    _proto.attachDataStateIndicatorCloseEvent = function attachDataStateIndicatorCloseEvent(table, customMessageMap, fnOnClose) {
      if (fnOnClose) {
        table.getDataStateIndicator().attachEventOnce("close", fnOnClose, this);
      }
      //When closing the the messageStrip, the associated message is removed
      table.getDataStateIndicator().attachEventOnce("close", () => {
        delete customMessageMap[table.getId()];
      });
    }

    /**
     * MultipleModeControl Event handler responsible for displaying the correct custom message when a specific tab is selected.
     *
     * @alias sap.fe.core.helpers.LRMessageStrip#onSelectMultipleModeControl
     * @private
     */;
    _proto.onSelectMultipleModeControl = function onSelectMultipleModeControl(event, controller) {
      const table = controller._getTable();
      const message = this.customMessageInfo.multiModeControlMessagesMap[table.getId()];
      this.createCustomMessage(null, {
        message,
        table
      });
    }

    /**
     * Provide an option for showing a custom message in the message bar above the list report table.
     *
     * @param {object} [message] Custom message along with the message type to be set on the table.
     * @param {string} [message.message] Message string to be displayed.
     * @param {sap.ui.core.MessageType} [message.type] Indicates the type of message.
     * @param {ListReportController} [controller] Controller of the current view.
     * @param {string[]|string} [tabKey] The entitySet identifying the table in which to display the custom message.
     * @param {Function} [onClose] A function that is called when the user closes the message bar.
     * @private
     */;
    _proto.showCustomMessage = function showCustomMessage(message, controller, tabKey, onClose) {
      const _tabKey = Array.isArray(tabKey) ? tabKey : [tabKey];
      const isMultiMode = controller._isMultiMode();
      let table;
      if (message) {
        message.onClose = onClose;
      }
      if (isMultiMode) {
        const multipleModeControl = controller._getMultiModeControl();
        //we fisrt need to detach the select event to prevent multiple attachments.
        multipleModeControl.detachEvent("select", this.onSelectMultipleModeControl, this);
        multipleModeControl.attachEvent("select", controller, this.onSelectMultipleModeControl, this);
        multipleModeControl.getAllInnerControls(true).forEach((innerControl, index) => {
          if (innerControl.isA("sap.fe.macros.table.TableAPI")) {
            if (!tabKey || _tabKey.indexOf(index.toString()) !== -1) {
              table = innerControl.getContent();
              this.createCustomMessage(null, {
                message,
                table,
                skipMessageManagerUpdate: multipleModeControl.getSelectedInnerControl() !== innerControl
              });
            }
          }
        });
        return;
      }
      table = controller._getTable();
      this.createCustomMessage(null, {
        message,
        table
      });
    };
    return LRMessageStrip;
  }();
  _exports.LRMessageStrip = LRMessageStrip;
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/LRMessageStrip", ["sap/ui/core/Core","sap/ui/core/message/Message"],function(e,s){"use strict";var t={};let a=function(){function a(){const s=e.getMessageManager();this.customMessageInfo={messageManagerDataBinding:s.getMessageModel().bindList("/"),multiModeControlMessagesMap:{}}}t.LRMessageStrip=a;var n=a.prototype;n.getCustomMessageInfo=function e(){return this.customMessageInfo};n.destroy=function e(){this.customMessageInfo.messageManagerDataBinding.detachChange(this._eventHandlerCustomMessage,this)};n._getMessagesWithSameTargetThanCustomMessage=function s(){const t=e.getMessageManager();return t.getMessageModel().getData().filter(e=>{var s;return e.getTargets()[0]===((s=this.customMessageInfo.currentMessage)===null||s===void 0?void 0:s.getTargets()[0])&&e!==this.customMessageInfo.currentMessage})};n._eventHandlerCustomMessage=function s(){const t=e.getMessageManager();if(this.customMessageInfo.currentMessage){const e=this._getMessagesWithSameTargetThanCustomMessage();const s=!!t.getMessageModel().getData().find(e=>e===this.customMessageInfo.currentMessage);if(e.length>0&&s){var a;t.removeMessages([(a=this.customMessageInfo)===null||a===void 0?void 0:a.currentMessage])}else if(e.length===0&&!s){t.addMessages([this.customMessageInfo.currentMessage])}}};n.createCustomMessage=function t(a,n){var o,g;const i=n.message;const r=n.table;const c=n.skipMessageManagerUpdate;const M=(o=r.getRowBinding())===null||o===void 0?void 0:o.getPath();const l=e.getMessageManager();const u=this.customMessageInfo.multiModeControlMessagesMap;u[r.getId()]=i;if(!M){r.attachEventOnce("bindingUpdated",n,this.createCustomMessage,this);return}if((g=u[r.getId()])!==null&&g!==void 0&&g.onClose){var d;r.getDataStateIndicator().detachEvent("close",(d=u[r.getId()])===null||d===void 0?void 0:d.onClose,this)}const h=r.getModel();const m=i?new s({message:i.message,type:i.type,target:[M],persistent:true,processor:h}):null;this.customMessageInfo.messageManagerDataBinding.detachChange(this._eventHandlerCustomMessage,this);if(!c){if(this.customMessageInfo.currentMessage){l.removeMessages([this.customMessageInfo.currentMessage])}if(m){this.customMessageInfo.currentMessage=m}else{delete this.customMessageInfo.currentMessage}if(m&&this._getMessagesWithSameTargetThanCustomMessage().length===0){l.addMessages([m])}}this.customMessageInfo.messageManagerDataBinding.attachChange(this._eventHandlerCustomMessage,this);this.attachDataStateIndicatorCloseEvent(r,u,i===null||i===void 0?void 0:i.onClose)};n.attachDataStateIndicatorCloseEvent=function e(s,t,a){if(a){s.getDataStateIndicator().attachEventOnce("close",a,this)}s.getDataStateIndicator().attachEventOnce("close",()=>{delete t[s.getId()]})};n.onSelectMultipleModeControl=function e(s,t){const a=t._getTable();const n=this.customMessageInfo.multiModeControlMessagesMap[a.getId()];this.createCustomMessage(null,{message:n,table:a})};n.showCustomMessage=function e(s,t,a,n){const o=Array.isArray(a)?a:[a];const g=t._isMultiMode();let i;if(s){s.onClose=n}if(g){const e=t._getMultiModeControl();e.detachEvent("select",this.onSelectMultipleModeControl,this);e.attachEvent("select",t,this.onSelectMultipleModeControl,this);e.getAllInnerControls(true).forEach((t,n)=>{if(t.isA("sap.fe.macros.table.TableAPI")){if(!a||o.indexOf(n.toString())!==-1){i=t.getContent();this.createCustomMessage(null,{message:s,table:i,skipMessageManagerUpdate:e.getSelectedInnerControl()!==t})}}});return}i=t._getTable();this.createCustomMessage(null,{message:s,table:i})};return a}();t.LRMessageStrip=a;return t},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/ListReportController-dbg.controller", ["sap/base/Log", "sap/base/util/ObjectPath", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/KPIManagement", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/MessageStrip", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/fe/core/PageController", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/templates/ListReport/ExtensionAPI", "sap/fe/templates/TableScroller", "sap/ui/core/mvc/OverrideExecution", "sap/ui/Device", "sap/ui/mdc/p13n/StateUtil", "sap/ui/thirdparty/hasher", "./ListReportTemplating", "./overrides/IntentBasedNavigation", "./overrides/Share", "./overrides/ViewState"], function (Log, ObjectPath, ActionRuntime, CommonUtils, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, KPIManagement, MassEdit, Placeholder, Share, SideEffects, ViewState, ClassSupport, DeleteHelper, EditState, MessageStrip, StableIdHelper, CoreLibrary, PageController, ChartUtils, CommonHelper, DelegateUtil, FilterUtils, ExtensionAPI, TableScroller, OverrideExecution, Device, StateUtil, hasher, ListReportTemplating, IntentBasedNavigationOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9;
  var system = Device.system;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const TemplateContentView = CoreLibrary.TemplateContentView,
    InitialLoadMode = CoreLibrary.InitialLoadMode;

  /**
   * Controller class for the list report page, used inside an SAP Fiori elements application.
   *
   * @hideconstructor
   * @public
   */
  let ListReportController = (_dec = defineUI5Class("sap.fe.templates.ListReport.ListReportController"), _dec2 = usingExtension(InternalRouting.override({
    onAfterBinding: function () {
      this.getView().getController()._onAfterBinding();
    }
  })), _dec3 = usingExtension(InternalIntentBasedNavigation.override({
    getEntitySet: function () {
      return this.base.getCurrentEntitySet();
    }
  })), _dec4 = usingExtension(SideEffects), _dec5 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec6 = usingExtension(Share.override(ShareOverrides)), _dec7 = usingExtension(ViewState.override(ViewStateOverrides)), _dec8 = usingExtension(KPIManagement), _dec9 = usingExtension(Placeholder), _dec10 = usingExtension(MassEdit), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = privateExtension(), _dec14 = extensible(OverrideExecution.After), _dec15 = publicExtension(), _dec16 = extensible(OverrideExecution.After), _dec17 = publicExtension(), _dec18 = extensible(OverrideExecution.After), _dec19 = publicExtension(), _dec20 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ListReportController, _PageController);
    function ListReportController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "_routing", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "sideEffects", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "kpiManagement", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "placeholder", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor9, _assertThisInitialized(_this));
      _this.handlers = {
        onFilterSearch() {
          this._getFilterBarControl().triggerSearch();
        },
        onFiltersChanged(oEvent) {
          const oFilterBar = this._getFilterBarControl();
          if (oFilterBar) {
            const oInternalModelContext = this.getView().getBindingContext("internal");
            // Pending filters into FilterBar to be used for custom views
            this.onPendingFilters();
            oInternalModelContext.setProperty("appliedFilters", oFilterBar.getAssignedFiltersText().filtersText);
            if (oEvent.getParameter("conditionsBased")) {
              oInternalModelContext.setProperty("hasPendingFilters", true);
            }
          }
        },
        onVariantSelected(oEvent) {
          const oVM = oEvent.getSource();
          const currentVariantKey = oEvent.getParameter("key");
          const oMultiModeControl = this._getMultiModeControl();
          oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.invalidateContent();
          oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.setFreezeContent(true);

          // setTimeout cause the variant needs to be applied before judging the auto search or updating the app state
          setTimeout(() => {
            if (this._shouldAutoTriggerSearch(oVM)) {
              // the app state will be updated via onSearch handler
              return this._getFilterBarControl().triggerSearch();
            } else if (!this._getApplyAutomaticallyOnVariant(oVM, currentVariantKey)) {
              this.getExtensionAPI().updateAppState();
            }
          }, 0);
        },
        onVariantSaved() {
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save!!!
          setTimeout(() => {
            this.getExtensionAPI().updateAppState();
          }, 1000);
        },
        onSearch() {
          const oFilterBar = this._getFilterBarControl();
          const oInternalModelContext = this.getView().getBindingContext("internal");
          const oMdcChart = this.getChartControl();
          const bHideDraft = FilterUtils.getEditStateIsHideDraft(oFilterBar.getConditions());
          oInternalModelContext.setProperty("hasPendingFilters", false);
          oInternalModelContext.setProperty("hideDraftInfo", bHideDraft);
          if (!this._getMultiModeControl()) {
            this._updateALPNotApplicableFields(oInternalModelContext, oFilterBar);
          }
          if (oMdcChart) {
            // disable bound actions TODO: this clears everything for the chart?
            oMdcChart.getBindingContext("internal").setProperty("", {});
            const oPageInternalModelContext = oMdcChart.getBindingContext("pageInternal");
            const sTemplateContentView = oPageInternalModelContext.getProperty(`${oPageInternalModelContext.getPath()}/alpContentView`);
            if (sTemplateContentView === TemplateContentView.Chart) {
              this.hasPendingChartChanges = true;
            }
            if (sTemplateContentView === TemplateContentView.Table) {
              this.hasPendingTableChanges = true;
            }
          }
          // store filter bar conditions to use later while navigation
          StateUtil.retrieveExternalState(oFilterBar).then(oExternalState => {
            this.filterBarConditions = oExternalState.filter;
          }).catch(function (oError) {
            Log.error("Error while retrieving the external state", oError);
          });
          if (this.getView().getViewData().liveMode === false) {
            this.getExtensionAPI().updateAppState();
          }
          if (system.phone) {
            const oDynamicPage = this._getDynamicListReportControl();
            oDynamicPage.setHeaderExpanded(false);
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onChartSelectionChanged(oEvent) {
          const oMdcChart = oEvent.getSource().getContent(),
            oTable = this._getTable(),
            aData = oEvent.getParameter("data"),
            oInternalModelContext = this.getView().getBindingContext("internal");
          if (aData) {
            ChartUtils.setChartFilters(oMdcChart);
          }
          const sTemplateContentView = oInternalModelContext.getProperty(`${oInternalModelContext.getPath()}/alpContentView`);
          if (sTemplateContentView === TemplateContentView.Chart) {
            this.hasPendingChartChanges = true;
          } else if (oTable) {
            oTable.rebind();
            this.hasPendingChartChanges = false;
          }
        },
        onSegmentedButtonPressed(oEvent) {
          const sSelectedKey = oEvent.mParameters.key ? oEvent.mParameters.key : null;
          const oInternalModelContext = this.getView().getBindingContext("internal");
          oInternalModelContext.setProperty("alpContentView", sSelectedKey);
          const oChart = this.getChartControl();
          const oTable = this._getTable();
          const oSegmentedButtonDelegate = {
            onAfterRendering() {
              const aItems = oSegmentedButton.getItems();
              aItems.forEach(function (oItem) {
                if (oItem.getKey() === sSelectedKey) {
                  oItem.focus();
                }
              });
              oSegmentedButton.removeEventDelegate(oSegmentedButtonDelegate);
            }
          };
          const oSegmentedButton = sSelectedKey === TemplateContentView.Table ? this._getSegmentedButton("Table") : this._getSegmentedButton("Chart");
          if (oSegmentedButton !== oEvent.getSource()) {
            oSegmentedButton.addEventDelegate(oSegmentedButtonDelegate);
          }
          switch (sSelectedKey) {
            case TemplateContentView.Table:
              this._updateTable(oTable);
              break;
            case TemplateContentView.Chart:
              this._updateChart(oChart);
              break;
            case TemplateContentView.Hybrid:
              this._updateTable(oTable);
              this._updateChart(oChart);
              break;
            default:
              break;
          }
          this.getExtensionAPI().updateAppState();
        },
        onFiltersSegmentedButtonPressed(oEvent) {
          const isCompact = oEvent.getParameter("key") === "Compact";
          this._getFilterBarControl().setVisible(isCompact);
          this._getVisualFilterBarControl().setVisible(!isCompact);
        },
        onStateChange() {
          this.getExtensionAPI().updateAppState();
        },
        onDynamicPageTitleStateChanged(oEvent) {
          const filterBar = this._getFilterBarControl();
          if (filterBar && filterBar.getSegmentedButton()) {
            if (oEvent.getParameter("isExpanded")) {
              filterBar.getSegmentedButton().setVisible(true);
            } else {
              filterBar.getSegmentedButton().setVisible(false);
            }
          }
        }
      };
      _this.formatters = {
        setALPControlMessageStrip(aIgnoredFields, bIsChart, oApplySupported) {
          let sText = "";
          bIsChart = bIsChart === "true" || bIsChart === true;
          const oFilterBar = this._getFilterBarControl();
          if (oFilterBar && Array.isArray(aIgnoredFields) && aIgnoredFields.length > 0 && bIsChart) {
            const aIgnoredLabels = MessageStrip.getLabels(aIgnoredFields, oFilterBar.data("entityType"), oFilterBar, this.oResourceBundle);
            const bIsSearchIgnored = !oApplySupported.enableSearch;
            sText = bIsChart ? MessageStrip.getALPText(aIgnoredLabels, oFilterBar, bIsSearchIgnored) : MessageStrip.getText(aIgnoredLabels, oFilterBar, "", DelegateUtil.getLocalizedText);
            return sText;
          }
        }
      };
      return _this;
    }
    var _proto = ListReportController.prototype;
    /**
     * Get the extension API for the current page.
     *
     * @public
     * @returns The extension API.
     */
    _proto.getExtensionAPI = function getExtensionAPI() {
      if (!this.extensionAPI) {
        this.extensionAPI = new ExtensionAPI(this);
      }
      return this.extensionAPI;
    };
    _proto.onInit = function onInit() {
      PageController.prototype.onInit.apply(this);
      const oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext.setProperty("hasPendingFilters", true);
      oInternalModelContext.setProperty("appliedFilters", "");
      oInternalModelContext.setProperty("hideDraftInfo", false);
      oInternalModelContext.setProperty("uom", {});
      oInternalModelContext.setProperty("scalefactor", {});
      oInternalModelContext.setProperty("scalefactorNumber", {});
      oInternalModelContext.setProperty("currency", {});
      if (this._hasMultiVisualizations()) {
        let alpContentView = this._getDefaultPath();
        if (!system.desktop && alpContentView === TemplateContentView.Hybrid) {
          alpContentView = TemplateContentView.Chart;
        }
        oInternalModelContext.setProperty("alpContentView", alpContentView);
      }

      // Store conditions from filter bar
      // this is later used before navigation to get conditions applied on the filter bar
      this.filterBarConditions = {};

      // As AppStateHandler.applyAppState triggers a navigation we want to make sure it will
      // happen after the routeMatch event has been processed (otherwise the router gets broken)
      this.getAppComponent().getRouterProxy().waitForRouteMatchBeforeNavigation();

      // Configure the initial load settings
      this._setInitLoad();
    };
    _proto.onExit = function onExit() {
      delete this.filterBarConditions;
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
    };
    _proto._onAfterBinding = function _onAfterBinding() {
      const aTables = this._getControls("table");
      if (EditState.isEditStateDirty()) {
        var _this$_getMultiModeCo, _this$_getTable;
        (_this$_getMultiModeCo = this._getMultiModeControl()) === null || _this$_getMultiModeCo === void 0 ? void 0 : _this$_getMultiModeCo.invalidateContent();
        const oTableBinding = (_this$_getTable = this._getTable()) === null || _this$_getTable === void 0 ? void 0 : _this$_getTable.getRowBinding();
        if (oTableBinding) {
          if (CommonUtils.getAppComponent(this.getView())._isFclEnabled()) {
            // there is an issue if we use a timeout with a kept alive context used on another page
            oTableBinding.refresh();
          } else {
            if (!this.sUpdateTimer) {
              this.sUpdateTimer = setTimeout(() => {
                oTableBinding.refresh();
                delete this.sUpdateTimer;
              }, 0);
            }

            // Update action enablement and visibility upon table data update.
            const fnUpdateTableActions = () => {
              this._updateTableActions(aTables);
              oTableBinding.detachDataReceived(fnUpdateTableActions);
            };
            oTableBinding.attachDataReceived(fnUpdateTableActions);
          }
        }
        EditState.setEditStateProcessed();
      }
      if (!this.sUpdateTimer) {
        this._updateTableActions(aTables);
      }
      const internalModelContext = this.getView().getBindingContext("internal");
      if (!internalModelContext.getProperty("initialVariantApplied")) {
        const viewId = this.getView().getId();
        this.pageReady.waitFor(this.getAppComponent().getAppStateHandler().applyAppState(viewId, this.getView()));
        internalModelContext.setProperty("initialVariantApplied", true);
      }
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      PageController.prototype.onBeforeRendering.apply(this);
    };
    _proto.onAfterRendering = function onAfterRendering() {
      this.getView().getModel("sap.fe.i18n").getResourceBundle().then(response => {
        this.oResourceBundle = response;
        const aTables = this._getControls();
        const sEntitySet = this.getView().getViewData().entitySet;
        const sText = CommonUtils.getTranslatedText("T_TABLE_AND_CHART_NO_DATA_TEXT", this.oResourceBundle, undefined, sEntitySet);
        aTables.forEach(function (oTable) {
          oTable.setNoData(sText);
        });
      }).catch(function (oError) {
        Log.error("Error while retrieving the resource bundle", oError);
      });
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      if (mParameters.forceFocus) {
        this._setInitialFocus();
      }
      // Remove the handler on back navigation that displays Draft confirmation
      this.getAppComponent().getShellServices().setBackNavigation(undefined);
    }

    /**
     * Method called when the content of a custom view used in a list report needs to be refreshed.
     * This happens either when there is a change on the FilterBar and the search is triggered,
     * or when a tab with custom content is selected.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @param mParameters Map containing the filter conditions of the FilterBar, the currentTabID
     * and the view refresh cause (tabChanged or search).
     * The map looks like this:
     * <code><pre>
     * 	{
     * 		filterConditions: {
     * 			Country: [
     * 				{
     * 					operator: "EQ"
     *					validated: "NotValidated"
     *					values: ["Germany", ...]
     * 				},
     * 				...
     * 			]
     * 			...
     * 		},
     *		currentTabId: "fe::CustomTab::tab1",
     *		refreshCause: "tabChanged" | "search"
     *	}
     * </pre></code>
     * @public
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onViewNeedsRefresh = function onViewNeedsRefresh(mParameters) {
      /* To be overriden */
    }

    /**
     * Method called when a filter or search value has been changed in the FilterBar,
     * but has not been validated yet by the end user (with the 'Go' or 'Search' button).
     * Typically, the content of the current tab is greyed out until the filters are validated.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @public
     */;
    _proto.onPendingFilters = function onPendingFilters() {
      /* To be overriden */
    };
    _proto.getCurrentEntitySet = function getCurrentEntitySet() {
      var _this$_getTable2;
      return (_this$_getTable2 = this._getTable()) === null || _this$_getTable2 === void 0 ? void 0 : _this$_getTable2.data("targetCollectionPath").slice(1);
    }

    /**
     * Method called when the 'Clear' button on the FilterBar is pressed.
     *
     * @public
     */;
    _proto.onAfterClear = function onAfterClear() {
      /* To be overriden */
    }

    /**
     * This method initiates the update of the enabled state of the DataFieldForAction and the visible state of the DataFieldForIBN buttons.
     *
     * @param aTables Array of tables in the list report
     * @private
     */;
    _proto._updateTableActions = function _updateTableActions(aTables) {
      let aIBNActions = [];
      aTables.forEach(function (oTable) {
        aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
        // Update 'enabled' property of DataFieldForAction buttons on table toolbar
        // The same is also performed on Table selectionChange event
        const oInternalModelContext = oTable.getBindingContext("internal"),
          oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))),
          aSelectedContexts = oTable.getSelectedContexts();
        oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
        oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
        // Refresh enablement of delete button
        DeleteHelper.updateDeleteInfoForSelectedContexts(oInternalModelContext, aSelectedContexts);
        ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
      });
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
    }

    /**
     * This method scrolls to a specific row on all the available tables.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_scrollTablesToRow
     * @param sRowPath The path of the table row context to be scrolled to
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      this._getControls("table").forEach(function (oTable) {
        TableScroller.scrollTableToRow(oTable, sRowPath);
      });
    }

    /**
     * This method set the initial focus within the List Report according to the UX guide lines.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_setInitialFocus
     */;
    _proto._setInitialFocus = function _setInitialFocus() {
      const dynamicPage = this._getDynamicListReportControl(),
        isHeaderExpanded = dynamicPage.getHeaderExpanded(),
        filterBar = this._getFilterBarControl();
      if (filterBar) {
        if (isHeaderExpanded) {
          //Enabling mandatory filter fields message dialog
          if (!filterBar.getShowMessages()) {
            filterBar.setShowMessages(true);
          }
          const firstEmptyMandatoryField = filterBar.getFilterItems().find(function (oFilterItem) {
            return oFilterItem.getRequired() && oFilterItem.getConditions().length === 0;
          });
          //Focusing on the first empty mandatory filter field, or on the first filter field if the table data is loaded
          if (firstEmptyMandatoryField) {
            firstEmptyMandatoryField.focus();
          } else if (this._isInitLoadEnabled() && filterBar.getFilterItems().length > 0) {
            //BCP: 2380008406 Add check for available filterItems
            filterBar.getFilterItems()[0].focus();
          } else {
            var _this$getView$byId;
            //Focusing on the Go button
            (_this$getView$byId = this.getView().byId(`${this._getFilterBarControlId()}-btnSearch`)) === null || _this$getView$byId === void 0 ? void 0 : _this$getView$byId.focus();
          }
        } else if (this._isInitLoadEnabled()) {
          var _this$_getTable3;
          (_this$_getTable3 = this._getTable()) === null || _this$_getTable3 === void 0 ? void 0 : _this$_getTable3.focusRow(0);
        }
      } else {
        var _this$_getTable4;
        (_this$_getTable4 = this._getTable()) === null || _this$_getTable4 === void 0 ? void 0 : _this$_getTable4.focusRow(0);
      }
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const oManifestEntry = this.getAppComponent().getManifestEntry("sap.app");
      return {
        title: oManifestEntry.title,
        subtitle: oManifestEntry.subTitle || "",
        intent: "",
        icon: ""
      };
    };
    _proto._getFilterBarControl = function _getFilterBarControl() {
      return this.getView().byId(this._getFilterBarControlId());
    };
    _proto._getDynamicListReportControl = function _getDynamicListReportControl() {
      return this.getView().byId(this._getDynamicListReportControlId());
    };
    _proto._getAdaptationFilterBarControl = function _getAdaptationFilterBarControl() {
      // If the adaptation filter bar is part of the DOM tree, the "Adapt Filter" dialog is open,
      // and we return the adaptation filter bar as an active control (visible for the user)
      const adaptationFilterBar = this._getFilterBarControl().getInbuiltFilter();
      return adaptationFilterBar !== null && adaptationFilterBar !== void 0 && adaptationFilterBar.getParent() ? adaptationFilterBar : undefined;
    };
    _proto._getSegmentedButton = function _getSegmentedButton(sControl) {
      var _ref;
      const sSegmentedButtonId = (_ref = sControl === "Chart" ? this.getChartControl() : this._getTable()) === null || _ref === void 0 ? void 0 : _ref.data("segmentedButtonId");
      return this.getView().byId(sSegmentedButtonId);
    };
    _proto._getControlFromPageModelProperty = function _getControlFromPageModelProperty(sPath) {
      var _this$_getPageModel;
      const controlId = (_this$_getPageModel = this._getPageModel()) === null || _this$_getPageModel === void 0 ? void 0 : _this$_getPageModel.getProperty(sPath);
      return controlId && this.getView().byId(controlId);
    };
    _proto._getDynamicListReportControlId = function _getDynamicListReportControlId() {
      var _this$_getPageModel2;
      return ((_this$_getPageModel2 = this._getPageModel()) === null || _this$_getPageModel2 === void 0 ? void 0 : _this$_getPageModel2.getProperty("/dynamicListReportId")) || "";
    };
    _proto._getFilterBarControlId = function _getFilterBarControlId() {
      var _this$_getPageModel3;
      return ((_this$_getPageModel3 = this._getPageModel()) === null || _this$_getPageModel3 === void 0 ? void 0 : _this$_getPageModel3.getProperty("/filterBarId")) || "";
    };
    _proto.getChartControl = function getChartControl() {
      return this._getControlFromPageModelProperty("/singleChartId");
    };
    _proto._getVisualFilterBarControl = function _getVisualFilterBarControl() {
      const sVisualFilterBarId = StableIdHelper.generate(["visualFilter", this._getFilterBarControlId()]);
      return sVisualFilterBarId && this.getView().byId(sVisualFilterBarId);
    };
    _proto._getFilterBarVariantControl = function _getFilterBarVariantControl() {
      return this._getControlFromPageModelProperty("/variantManagement/id");
    };
    _proto._getMultiModeControl = function _getMultiModeControl() {
      return this.getView().byId("fe::TabMultipleMode::Control");
    };
    _proto._getTable = function _getTable() {
      if (this._isMultiMode()) {
        var _this$_getMultiModeCo2, _this$_getMultiModeCo3;
        const oControl = (_this$_getMultiModeCo2 = this._getMultiModeControl()) === null || _this$_getMultiModeCo2 === void 0 ? void 0 : (_this$_getMultiModeCo3 = _this$_getMultiModeCo2.getSelectedInnerControl()) === null || _this$_getMultiModeCo3 === void 0 ? void 0 : _this$_getMultiModeCo3.content;
        return oControl !== null && oControl !== void 0 && oControl.isA("sap.ui.mdc.Table") ? oControl : undefined;
      } else {
        return this._getControlFromPageModelProperty("/singleTableId");
      }
    };
    _proto._getControls = function _getControls(sKey) {
      if (this._isMultiMode()) {
        const aControls = [];
        const oTabMultiMode = this._getMultiModeControl().content;
        oTabMultiMode.getItems().forEach(oItem => {
          const oControl = this.getView().byId(oItem.getKey());
          if (oControl && sKey) {
            if (oItem.getKey().indexOf(`fe::${sKey}`) > -1) {
              aControls.push(oControl);
            }
          } else if (oControl !== undefined && oControl !== null) {
            aControls.push(oControl);
          }
        });
        return aControls;
      } else if (sKey === "Chart") {
        const oChart = this.getChartControl();
        return oChart ? [oChart] : [];
      } else {
        const oTable = this._getTable();
        return oTable ? [oTable] : [];
      }
    };
    _proto._getDefaultPath = function _getDefaultPath() {
      var _this$_getPageModel4;
      const defaultPath = ListReportTemplating.getDefaultPath(((_this$_getPageModel4 = this._getPageModel()) === null || _this$_getPageModel4 === void 0 ? void 0 : _this$_getPageModel4.getProperty("/views")) || []);
      switch (defaultPath) {
        case "primary":
          return TemplateContentView.Chart;
        case "secondary":
          return TemplateContentView.Table;
        case "both":
        default:
          return TemplateContentView.Hybrid;
      }
    }

    /**
     * Method to know if ListReport is configured with Multiple Table mode.
     *
     * @function
     * @name _isMultiMode
     * @returns Is Multiple Table mode set?
     */;
    _proto._isMultiMode = function _isMultiMode() {
      var _this$_getPageModel5;
      return !!((_this$_getPageModel5 = this._getPageModel()) !== null && _this$_getPageModel5 !== void 0 && _this$_getPageModel5.getProperty("/multiViewsControl"));
    }

    /**
     * Method to know if ListReport is configured to load data at start up.
     *
     * @function
     * @name _isInitLoadDisabled
     * @returns Is InitLoad enabled?
     */;
    _proto._isInitLoadEnabled = function _isInitLoadEnabled() {
      const initLoadMode = this.getView().getViewData().initialLoad;
      return initLoadMode === InitialLoadMode.Enabled;
    };
    _proto._hasMultiVisualizations = function _hasMultiVisualizations() {
      var _this$_getPageModel6;
      return (_this$_getPageModel6 = this._getPageModel()) === null || _this$_getPageModel6 === void 0 ? void 0 : _this$_getPageModel6.getProperty("/hasMultiVisualizations");
    }

    /**
     * Method to suspend search on the filter bar. The initial loading of data is disabled based on the manifest configuration InitLoad - Disabled/Auto.
     * It is enabled later when the view state is set, when it is possible to realize if there are default filters.
     */;
    _proto._disableInitLoad = function _disableInitLoad() {
      const filterBar = this._getFilterBarControl();
      // check for filter bar hidden
      if (filterBar) {
        filterBar.setSuspendSelection(true);
      }
    }

    /**
     * Method called by flex to determine if the applyAutomatically setting on the variant is valid.
     * Called only for Standard Variant and only when there is display text set for applyAutomatically (FE only sets it for Auto).
     *
     * @returns Boolean true if data should be loaded automatically, false otherwise
     */;
    _proto._applyAutomaticallyOnStandardVariant = function _applyAutomaticallyOnStandardVariant() {
      // We always return false and take care of it when view state is set
      return false;
    }

    /**
     * Configure the settings for initial load based on
     * - manifest setting initLoad - Enabled/Disabled/Auto
     * - user's setting of applyAutomatically on variant
     * - if there are default filters
     * We disable the filter bar search at the beginning and enable it when view state is set.
     */;
    _proto._setInitLoad = function _setInitLoad() {
      // if initLoad is Disabled or Auto, switch off filter bar search temporarily at start
      if (!this._isInitLoadEnabled()) {
        this._disableInitLoad();
      }
      // set hook for flex for when standard variant is set (at start or by user at runtime)
      // required to override the user setting 'apply automatically' behaviour if there are no filters
      const variantManagementId = ListReportTemplating.getVariantBackReference(this.getView().getViewData(), this._getPageModel());
      const variantManagement = variantManagementId && this.getView().byId(variantManagementId);
      if (variantManagement) {
        variantManagement.registerApplyAutomaticallyOnStandardVariant(this._applyAutomaticallyOnStandardVariant.bind(this));
      }
    };
    _proto._setShareModel = function _setShareModel() {
      // TODO: deactivated for now - currently there is no _templPriv anymore, to be discussed
      // this method is currently not called anymore from the init method

      const fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
      //var oManifest = this.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
      //var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) || "";

      //shareModel: Holds all the sharing relevant information and info used in XML view
      const oShareInfo = {
        bookmarkTitle: document.title,
        //To name the bookmark according to the app title.
        bookmarkCustomUrl: function () {
          const sHash = hasher.getHash();
          return sHash ? `#${sHash}` : window.location.href;
        },
        /*
        				To be activated once the FLP shows the count - see comment above
        				bookmarkServiceUrl: function() {
        					//var oTable = oTable.getInnerTable(); oTable is already the sap.fe table (but not the inner one)
        					// we should use table.getListBindingInfo instead of the binding
        					var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
        					return oBinding ? fnGetDownloadUrl(oBinding) : "";
        				},*/
        isShareInJamActive: !!fnGetUser && fnGetUser().isJamActive()
      };
      const oTemplatePrivateModel = this.getOwnerComponent().getModel("_templPriv");
      oTemplatePrivateModel.setProperty("/listReport/share", oShareInfo);
    }

    /**
     * Method to update the local UI model of the page with the fields that are not applicable to the filter bar (this is specific to the ALP scenario).
     *
     * @param oInternalModelContext The internal model context
     * @param oFilterBar MDC filter bar
     */;
    _proto._updateALPNotApplicableFields = function _updateALPNotApplicableFields(oInternalModelContext, oFilterBar) {
      const mCache = {};
      const ignoredFields = {},
        aTables = this._getControls("table"),
        aCharts = this._getControls("Chart");
      if (!aTables.length || !aCharts.length) {
        // If there's not a table and a chart, we're not in the ALP case
        return;
      }

      // For the moment, there's nothing for tables...
      aCharts.forEach(function (oChart) {
        const sChartEntityPath = oChart.data("targetCollectionPath"),
          sChartEntitySet = sChartEntityPath.slice(1),
          sCacheKey = `${sChartEntitySet}Chart`;
        if (!mCache[sCacheKey]) {
          mCache[sCacheKey] = FilterUtils.getNotApplicableFilters(oFilterBar, oChart);
        }
        ignoredFields[sCacheKey] = mCache[sCacheKey];
      });
      oInternalModelContext.setProperty("controls/ignoredFields", ignoredFields);
    };
    _proto._isFilterBarHidden = function _isFilterBarHidden() {
      return this.getView().getViewData().hideFilterBar;
    };
    _proto._getApplyAutomaticallyOnVariant = function _getApplyAutomaticallyOnVariant(VariantManagement, key) {
      if (!VariantManagement || !key) {
        return false;
      }
      const variants = VariantManagement.getVariants();
      const currentVariant = variants.find(function (variant) {
        return variant && variant.key === key;
      });
      return currentVariant && currentVariant.executeOnSelect || false;
    };
    _proto._shouldAutoTriggerSearch = function _shouldAutoTriggerSearch(oVM) {
      if (this.getView().getViewData().initialLoad === InitialLoadMode.Auto && (!oVM || oVM.getStandardVariantKey() === oVM.getCurrentVariantKey())) {
        const oFilterBar = this._getFilterBarControl();
        if (oFilterBar) {
          const oConditions = oFilterBar.getConditions();
          for (const sKey in oConditions) {
            // ignore filters starting with $ (e.g. $search, $editState)
            if (!sKey.startsWith("$") && Array.isArray(oConditions[sKey]) && oConditions[sKey].length) {
              // load data as per user's setting of applyAutomatically on the variant
              const standardVariant = oVM.getVariants().find(variant => {
                return variant.key === oVM.getCurrentVariantKey();
              });
              return standardVariant && standardVariant.executeOnSelect;
            }
          }
        }
      }
      return false;
    };
    _proto._updateTable = function _updateTable(oTable) {
      if (!oTable.isTableBound() || this.hasPendingChartChanges) {
        oTable.rebind();
        this.hasPendingChartChanges = false;
      }
    };
    _proto._updateChart = function _updateChart(oChart) {
      const oInnerChart = oChart.getControlDelegate()._getChart(oChart);
      if (!(oInnerChart && oInnerChart.isBound("data")) || this.hasPendingTableChanges) {
        oChart.getControlDelegate().rebind(oChart, oInnerChart.getBindingInfo("data"));
        this.hasPendingTableChanges = false;
      }
    };
    return ListReportController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "sideEffects", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "kpiManagement", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onViewNeedsRefresh", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "onViewNeedsRefresh"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPendingFilters", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "onPendingFilters"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterClear", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterClear"), _class2.prototype)), _class2)) || _class);
  return ListReportController;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/ListReportController.controller", ["sap/base/Log","sap/base/util/ObjectPath","sap/fe/core/ActionRuntime","sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/IntentBasedNavigation","sap/fe/core/controllerextensions/InternalIntentBasedNavigation","sap/fe/core/controllerextensions/InternalRouting","sap/fe/core/controllerextensions/KPIManagement","sap/fe/core/controllerextensions/MassEdit","sap/fe/core/controllerextensions/Placeholder","sap/fe/core/controllerextensions/Share","sap/fe/core/controllerextensions/SideEffects","sap/fe/core/controllerextensions/ViewState","sap/fe/core/helpers/ClassSupport","sap/fe/core/helpers/DeleteHelper","sap/fe/core/helpers/EditState","sap/fe/core/helpers/MessageStrip","sap/fe/core/helpers/StableIdHelper","sap/fe/core/library","sap/fe/core/PageController","sap/fe/macros/chart/ChartUtils","sap/fe/macros/CommonHelper","sap/fe/macros/DelegateUtil","sap/fe/macros/filter/FilterUtils","sap/fe/templates/ListReport/ExtensionAPI","sap/fe/templates/TableScroller","sap/ui/core/mvc/OverrideExecution","sap/ui/Device","sap/ui/mdc/p13n/StateUtil","sap/ui/thirdparty/hasher","./ListReportTemplating","./overrides/IntentBasedNavigation","./overrides/Share","./overrides/ViewState"],function(e,t,i,n,r,o,a,s,l,u,g,d,c,p,h,f,C,b,y,P,_,v,m,w,A,B,I,S,V,T,F,x,E,M){"use strict";var D,R,O,L,N,z,k,H,j,U,K,$,J,q,W,X,G,Q,Y,Z,ee,te,ie,ne,re,oe,ae,se,le,ue,ge;var de=S.system;var ce=p.usingExtension;var pe=p.publicExtension;var he=p.privateExtension;var fe=p.finalExtension;var Ce=p.extensible;var be=p.defineUI5Class;function ye(e,t,i,n){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(n):void 0})}function Pe(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function _e(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;ve(e,t)}function ve(e,t){ve=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return ve(e,t)}function me(e,t,i,n,r){var o={};Object.keys(n).forEach(function(e){o[e]=n[e]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=i.slice().reverse().reduce(function(i,n){return n(e,t,i)||i},o);if(r&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(r):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(e,t,o);o=null}return o}function we(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}const Ae=y.TemplateContentView,Be=y.InitialLoadMode;let Ie=(D=be("sap.fe.templates.ListReport.ListReportController"),R=ce(a.override({onAfterBinding:function(){this.getView().getController()._onAfterBinding()}})),O=ce(o.override({getEntitySet:function(){return this.base.getCurrentEntitySet()}})),L=ce(d),N=ce(r.override(x)),z=ce(g.override(E)),k=ce(c.override(M)),H=ce(s),j=ce(u),U=ce(l),K=pe(),$=fe(),J=he(),q=Ce(I.After),W=pe(),X=Ce(I.After),G=pe(),Q=Ce(I.After),Y=pe(),Z=Ce(I.After),D(ee=(te=function(r){_e(o,r);function o(){var t;for(var i=arguments.length,n=new Array(i),o=0;o<i;o++){n[o]=arguments[o]}t=r.call(this,...n)||this;ye(t,"_routing",ie,Pe(t));ye(t,"_intentBasedNavigation",ne,Pe(t));ye(t,"sideEffects",re,Pe(t));ye(t,"intentBasedNavigation",oe,Pe(t));ye(t,"share",ae,Pe(t));ye(t,"viewState",se,Pe(t));ye(t,"kpiManagement",le,Pe(t));ye(t,"placeholder",ue,Pe(t));ye(t,"massEdit",ge,Pe(t));t.handlers={onFilterSearch(){this._getFilterBarControl().triggerSearch()},onFiltersChanged(e){const t=this._getFilterBarControl();if(t){const i=this.getView().getBindingContext("internal");this.onPendingFilters();i.setProperty("appliedFilters",t.getAssignedFiltersText().filtersText);if(e.getParameter("conditionsBased")){i.setProperty("hasPendingFilters",true)}}},onVariantSelected(e){const t=e.getSource();const i=e.getParameter("key");const n=this._getMultiModeControl();n===null||n===void 0?void 0:n.invalidateContent();n===null||n===void 0?void 0:n.setFreezeContent(true);setTimeout(()=>{if(this._shouldAutoTriggerSearch(t)){return this._getFilterBarControl().triggerSearch()}else if(!this._getApplyAutomaticallyOnVariant(t,i)){this.getExtensionAPI().updateAppState()}},0)},onVariantSaved(){setTimeout(()=>{this.getExtensionAPI().updateAppState()},1e3)},onSearch(){const t=this._getFilterBarControl();const i=this.getView().getBindingContext("internal");const n=this.getChartControl();const r=w.getEditStateIsHideDraft(t.getConditions());i.setProperty("hasPendingFilters",false);i.setProperty("hideDraftInfo",r);if(!this._getMultiModeControl()){this._updateALPNotApplicableFields(i,t)}if(n){n.getBindingContext("internal").setProperty("",{});const e=n.getBindingContext("pageInternal");const t=e.getProperty(`${e.getPath()}/alpContentView`);if(t===Ae.Chart){this.hasPendingChartChanges=true}if(t===Ae.Table){this.hasPendingTableChanges=true}}V.retrieveExternalState(t).then(e=>{this.filterBarConditions=e.filter}).catch(function(t){e.error("Error while retrieving the external state",t)});if(this.getView().getViewData().liveMode===false){this.getExtensionAPI().updateAppState()}if(de.phone){const e=this._getDynamicListReportControl();e.setHeaderExpanded(false)}},onChevronPressNavigateOutBound(e,t,i,n){return e._intentBasedNavigation.onChevronPressNavigateOutBound(e,t,i,n)},onChartSelectionChanged(e){const t=e.getSource().getContent(),i=this._getTable(),n=e.getParameter("data"),r=this.getView().getBindingContext("internal");if(n){_.setChartFilters(t)}const o=r.getProperty(`${r.getPath()}/alpContentView`);if(o===Ae.Chart){this.hasPendingChartChanges=true}else if(i){i.rebind();this.hasPendingChartChanges=false}},onSegmentedButtonPressed(e){const t=e.mParameters.key?e.mParameters.key:null;const i=this.getView().getBindingContext("internal");i.setProperty("alpContentView",t);const n=this.getChartControl();const r=this._getTable();const o={onAfterRendering(){const e=a.getItems();e.forEach(function(e){if(e.getKey()===t){e.focus()}});a.removeEventDelegate(o)}};const a=t===Ae.Table?this._getSegmentedButton("Table"):this._getSegmentedButton("Chart");if(a!==e.getSource()){a.addEventDelegate(o)}switch(t){case Ae.Table:this._updateTable(r);break;case Ae.Chart:this._updateChart(n);break;case Ae.Hybrid:this._updateTable(r);this._updateChart(n);break;default:break}this.getExtensionAPI().updateAppState()},onFiltersSegmentedButtonPressed(e){const t=e.getParameter("key")==="Compact";this._getFilterBarControl().setVisible(t);this._getVisualFilterBarControl().setVisible(!t)},onStateChange(){this.getExtensionAPI().updateAppState()},onDynamicPageTitleStateChanged(e){const t=this._getFilterBarControl();if(t&&t.getSegmentedButton()){if(e.getParameter("isExpanded")){t.getSegmentedButton().setVisible(true)}else{t.getSegmentedButton().setVisible(false)}}}};t.formatters={setALPControlMessageStrip(e,t,i){let n="";t=t==="true"||t===true;const r=this._getFilterBarControl();if(r&&Array.isArray(e)&&e.length>0&&t){const o=C.getLabels(e,r.data("entityType"),r,this.oResourceBundle);const a=!i.enableSearch;n=t?C.getALPText(o,r,a):C.getText(o,r,"",m.getLocalizedText);return n}}};return t}var a=o.prototype;a.getExtensionAPI=function e(){if(!this.extensionAPI){this.extensionAPI=new A(this)}return this.extensionAPI};a.onInit=function e(){P.prototype.onInit.apply(this);const t=this.getView().getBindingContext("internal");t.setProperty("hasPendingFilters",true);t.setProperty("appliedFilters","");t.setProperty("hideDraftInfo",false);t.setProperty("uom",{});t.setProperty("scalefactor",{});t.setProperty("scalefactorNumber",{});t.setProperty("currency",{});if(this._hasMultiVisualizations()){let e=this._getDefaultPath();if(!de.desktop&&e===Ae.Hybrid){e=Ae.Chart}t.setProperty("alpContentView",e)}this.filterBarConditions={};this.getAppComponent().getRouterProxy().waitForRouteMatchBeforeNavigation();this._setInitLoad()};a.onExit=function e(){delete this.filterBarConditions;if(this.extensionAPI){this.extensionAPI.destroy()}delete this.extensionAPI};a._onAfterBinding=function e(){const t=this._getControls("table");if(f.isEditStateDirty()){var i,r;(i=this._getMultiModeControl())===null||i===void 0?void 0:i.invalidateContent();const e=(r=this._getTable())===null||r===void 0?void 0:r.getRowBinding();if(e){if(n.getAppComponent(this.getView())._isFclEnabled()){e.refresh()}else{if(!this.sUpdateTimer){this.sUpdateTimer=setTimeout(()=>{e.refresh();delete this.sUpdateTimer},0)}const i=()=>{this._updateTableActions(t);e.detachDataReceived(i)};e.attachDataReceived(i)}}f.setEditStateProcessed()}if(!this.sUpdateTimer){this._updateTableActions(t)}const o=this.getView().getBindingContext("internal");if(!o.getProperty("initialVariantApplied")){const e=this.getView().getId();this.pageReady.waitFor(this.getAppComponent().getAppStateHandler().applyAppState(e,this.getView()));o.setProperty("initialVariantApplied",true)}};a.onBeforeRendering=function e(){P.prototype.onBeforeRendering.apply(this)};a.onAfterRendering=function t(){this.getView().getModel("sap.fe.i18n").getResourceBundle().then(e=>{this.oResourceBundle=e;const t=this._getControls();const i=this.getView().getViewData().entitySet;const r=n.getTranslatedText("T_TABLE_AND_CHART_NO_DATA_TEXT",this.oResourceBundle,undefined,i);t.forEach(function(e){e.setNoData(r)})}).catch(function(t){e.error("Error while retrieving the resource bundle",t)})};a.onPageReady=function e(t){if(t.forceFocus){this._setInitialFocus()}this.getAppComponent().getShellServices().setBackNavigation(undefined)};a.onViewNeedsRefresh=function e(t){};a.onPendingFilters=function e(){};a.getCurrentEntitySet=function e(){var t;return(t=this._getTable())===null||t===void 0?void 0:t.data("targetCollectionPath").slice(1)};a.onAfterClear=function e(){};a._updateTableActions=function e(t){let r=[];t.forEach(function(e){r=n.getIBNActions(e,r);const t=e.getBindingContext("internal"),o=JSON.parse(v.parseCustomData(m.getCustomData(e,"operationAvailableMap"))),a=e.getSelectedContexts();t.setProperty("selectedContexts",a);t.setProperty("numberOfSelectedContexts",a.length);h.updateDeleteInfoForSelectedContexts(t,a);i.setActionEnablement(t,o,a,"table")});n.updateDataFieldForIBNButtonsVisibility(r,this.getView())};a._scrollTablesToRow=function e(t){this._getControls("table").forEach(function(e){B.scrollTableToRow(e,t)})};a._setInitialFocus=function e(){const t=this._getDynamicListReportControl(),i=t.getHeaderExpanded(),n=this._getFilterBarControl();if(n){if(i){if(!n.getShowMessages()){n.setShowMessages(true)}const e=n.getFilterItems().find(function(e){return e.getRequired()&&e.getConditions().length===0});if(e){e.focus()}else if(this._isInitLoadEnabled()&&n.getFilterItems().length>0){n.getFilterItems()[0].focus()}else{var r;(r=this.getView().byId(`${this._getFilterBarControlId()}-btnSearch`))===null||r===void 0?void 0:r.focus()}}else if(this._isInitLoadEnabled()){var o;(o=this._getTable())===null||o===void 0?void 0:o.focusRow(0)}}else{var a;(a=this._getTable())===null||a===void 0?void 0:a.focusRow(0)}};a._getPageTitleInformation=function e(){const t=this.getAppComponent().getManifestEntry("sap.app");return{title:t.title,subtitle:t.subTitle||"",intent:"",icon:""}};a._getFilterBarControl=function e(){return this.getView().byId(this._getFilterBarControlId())};a._getDynamicListReportControl=function e(){return this.getView().byId(this._getDynamicListReportControlId())};a._getAdaptationFilterBarControl=function e(){const t=this._getFilterBarControl().getInbuiltFilter();return t!==null&&t!==void 0&&t.getParent()?t:undefined};a._getSegmentedButton=function e(t){var i;const n=(i=t==="Chart"?this.getChartControl():this._getTable())===null||i===void 0?void 0:i.data("segmentedButtonId");return this.getView().byId(n)};a._getControlFromPageModelProperty=function e(t){var i;const n=(i=this._getPageModel())===null||i===void 0?void 0:i.getProperty(t);return n&&this.getView().byId(n)};a._getDynamicListReportControlId=function e(){var t;return((t=this._getPageModel())===null||t===void 0?void 0:t.getProperty("/dynamicListReportId"))||""};a._getFilterBarControlId=function e(){var t;return((t=this._getPageModel())===null||t===void 0?void 0:t.getProperty("/filterBarId"))||""};a.getChartControl=function e(){return this._getControlFromPageModelProperty("/singleChartId")};a._getVisualFilterBarControl=function e(){const t=b.generate(["visualFilter",this._getFilterBarControlId()]);return t&&this.getView().byId(t)};a._getFilterBarVariantControl=function e(){return this._getControlFromPageModelProperty("/variantManagement/id")};a._getMultiModeControl=function e(){return this.getView().byId("fe::TabMultipleMode::Control")};a._getTable=function e(){if(this._isMultiMode()){var t,i;const e=(t=this._getMultiModeControl())===null||t===void 0?void 0:(i=t.getSelectedInnerControl())===null||i===void 0?void 0:i.content;return e!==null&&e!==void 0&&e.isA("sap.ui.mdc.Table")?e:undefined}else{return this._getControlFromPageModelProperty("/singleTableId")}};a._getControls=function e(t){if(this._isMultiMode()){const e=[];const i=this._getMultiModeControl().content;i.getItems().forEach(i=>{const n=this.getView().byId(i.getKey());if(n&&t){if(i.getKey().indexOf(`fe::${t}`)>-1){e.push(n)}}else if(n!==undefined&&n!==null){e.push(n)}});return e}else if(t==="Chart"){const e=this.getChartControl();return e?[e]:[]}else{const e=this._getTable();return e?[e]:[]}};a._getDefaultPath=function e(){var t;const i=F.getDefaultPath(((t=this._getPageModel())===null||t===void 0?void 0:t.getProperty("/views"))||[]);switch(i){case"primary":return Ae.Chart;case"secondary":return Ae.Table;case"both":default:return Ae.Hybrid}};a._isMultiMode=function e(){var t;return!!((t=this._getPageModel())!==null&&t!==void 0&&t.getProperty("/multiViewsControl"))};a._isInitLoadEnabled=function e(){const t=this.getView().getViewData().initialLoad;return t===Be.Enabled};a._hasMultiVisualizations=function e(){var t;return(t=this._getPageModel())===null||t===void 0?void 0:t.getProperty("/hasMultiVisualizations")};a._disableInitLoad=function e(){const t=this._getFilterBarControl();if(t){t.setSuspendSelection(true)}};a._applyAutomaticallyOnStandardVariant=function e(){return false};a._setInitLoad=function e(){if(!this._isInitLoadEnabled()){this._disableInitLoad()}const t=F.getVariantBackReference(this.getView().getViewData(),this._getPageModel());const i=t&&this.getView().byId(t);if(i){i.registerApplyAutomaticallyOnStandardVariant(this._applyAutomaticallyOnStandardVariant.bind(this))}};a._setShareModel=function e(){const i=t.get("sap.ushell.Container.getUser");const n={bookmarkTitle:document.title,bookmarkCustomUrl:function(){const e=T.getHash();return e?`#${e}`:window.location.href},isShareInJamActive:!!i&&i().isJamActive()};const r=this.getOwnerComponent().getModel("_templPriv");r.setProperty("/listReport/share",n)};a._updateALPNotApplicableFields=function e(t,i){const n={};const r={},o=this._getControls("table"),a=this._getControls("Chart");if(!o.length||!a.length){return}a.forEach(function(e){const t=e.data("targetCollectionPath"),o=t.slice(1),a=`${o}Chart`;if(!n[a]){n[a]=w.getNotApplicableFilters(i,e)}r[a]=n[a]});t.setProperty("controls/ignoredFields",r)};a._isFilterBarHidden=function e(){return this.getView().getViewData().hideFilterBar};a._getApplyAutomaticallyOnVariant=function e(t,i){if(!t||!i){return false}const n=t.getVariants();const r=n.find(function(e){return e&&e.key===i});return r&&r.executeOnSelect||false};a._shouldAutoTriggerSearch=function e(t){if(this.getView().getViewData().initialLoad===Be.Auto&&(!t||t.getStandardVariantKey()===t.getCurrentVariantKey())){const e=this._getFilterBarControl();if(e){const i=e.getConditions();for(const e in i){if(!e.startsWith("$")&&Array.isArray(i[e])&&i[e].length){const e=t.getVariants().find(e=>e.key===t.getCurrentVariantKey());return e&&e.executeOnSelect}}}}return false};a._updateTable=function e(t){if(!t.isTableBound()||this.hasPendingChartChanges){t.rebind();this.hasPendingChartChanges=false}};a._updateChart=function e(t){const i=t.getControlDelegate()._getChart(t);if(!(i&&i.isBound("data"))||this.hasPendingTableChanges){t.getControlDelegate().rebind(t,i.getBindingInfo("data"));this.hasPendingTableChanges=false}};return o}(P),ie=me(te.prototype,"_routing",[R],{configurable:true,enumerable:true,writable:true,initializer:null}),ne=me(te.prototype,"_intentBasedNavigation",[O],{configurable:true,enumerable:true,writable:true,initializer:null}),re=me(te.prototype,"sideEffects",[L],{configurable:true,enumerable:true,writable:true,initializer:null}),oe=me(te.prototype,"intentBasedNavigation",[N],{configurable:true,enumerable:true,writable:true,initializer:null}),ae=me(te.prototype,"share",[z],{configurable:true,enumerable:true,writable:true,initializer:null}),se=me(te.prototype,"viewState",[k],{configurable:true,enumerable:true,writable:true,initializer:null}),le=me(te.prototype,"kpiManagement",[H],{configurable:true,enumerable:true,writable:true,initializer:null}),ue=me(te.prototype,"placeholder",[j],{configurable:true,enumerable:true,writable:true,initializer:null}),ge=me(te.prototype,"massEdit",[U],{configurable:true,enumerable:true,writable:true,initializer:null}),me(te.prototype,"getExtensionAPI",[K,$],Object.getOwnPropertyDescriptor(te.prototype,"getExtensionAPI"),te.prototype),me(te.prototype,"onPageReady",[J,q],Object.getOwnPropertyDescriptor(te.prototype,"onPageReady"),te.prototype),me(te.prototype,"onViewNeedsRefresh",[W,X],Object.getOwnPropertyDescriptor(te.prototype,"onViewNeedsRefresh"),te.prototype),me(te.prototype,"onPendingFilters",[G,Q],Object.getOwnPropertyDescriptor(te.prototype,"onPendingFilters"),te.prototype),me(te.prototype,"onAfterClear",[Y,Z],Object.getOwnPropertyDescriptor(te.prototype,"onAfterClear"),te.prototype),te))||ee);return Ie},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/ListReportTemplating-dbg", ["sap/fe/core/helpers/StableIdHelper"], function (StableIdHelper) {
  "use strict";

  var _exports = {};
  var generate = StableIdHelper.generate;
  /**
   * Method returns an VariantBackReference expression based on variantManagement and oConverterContext value.
   *
   * @function
   * @name getVariantBackReference
   * @param {object} oViewData Object Containing View Data
   * @param {object} oConverterContext Object containing converted context
   * @returns {string}
   */

  const getVariantBackReference = function (oViewData, oConverterContext) {
    if (oViewData && oViewData.variantManagement === "Page") {
      return "fe::PageVariantManagement";
    }
    if (oViewData && oViewData.variantManagement === "Control") {
      return generate([oConverterContext.filterBarId, "VariantManagement"]);
    }
    return undefined;
  };
  _exports.getVariantBackReference = getVariantBackReference;
  const getDefaultPath = function (aViews) {
    for (let i = 0; i < aViews.length; i++) {
      if (aViews[i].defaultPath) {
        return aViews[i].defaultPath;
      }
    }
  };
  _exports.getDefaultPath = getDefaultPath;
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/ListReportTemplating", ["sap/fe/core/helpers/StableIdHelper"],function(e){"use strict";var a={};var t=e.generate;const n=function(e,a){if(e&&e.variantManagement==="Page"){return"fe::PageVariantManagement"}if(e&&e.variantManagement==="Control"){return t([a.filterBarId,"VariantManagement"])}return undefined};a.getVariantBackReference=n;const r=function(e){for(let a=0;a<e.length;a++){if(e[a].defaultPath){return e[a].defaultPath}}};a.getDefaultPath=r;return a},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/controls/MultipleModeControl-dbg", ["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/MessageStrip", "sap/fe/macros/DelegateUtil", "sap/m/IconTabFilter", "sap/ui/core/Control", "sap/ui/core/Core", "sap/ui/fl/write/api/ControlPersonalizationWriteAPI", "sap/ui/model/json/JSONModel"], function (Log, CommonUtils, ClassSupport, MessageStrip, DelegateUtil, IconTabFilter, Control, Core, ControlPersonalizationWriteAPI, JSONModel) {
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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/controls/MultipleModeControl", ["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/helpers/ClassSupport","sap/fe/core/helpers/MessageStrip","sap/fe/macros/DelegateUtil","sap/m/IconTabFilter","sap/ui/core/Control","sap/ui/core/Core","sap/ui/fl/write/api/ControlPersonalizationWriteAPI","sap/ui/model/json/JSONModel"],function(e,t,n,r,i,o,l,s,a,u){"use strict";var c,d,f,g,h,p,v,C,b,y,m,_,I,T,w,F,z;var S=n.property;var P=n.event;var A=n.defineUI5Class;var O=n.association;var B=n.aggregation;function D(e,t,n,r){if(!n)return;Object.defineProperty(e,t,{enumerable:n.enumerable,configurable:n.configurable,writable:n.writable,value:n.initializer?n.initializer.call(r):void 0})}function E(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function K(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;M(e,t)}function M(e,t){M=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,n){t.__proto__=n;return t};return M(e,t)}function V(e,t,n,r,i){var o={};Object.keys(r).forEach(function(e){o[e]=r[e]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=n.slice().reverse().reduce(function(n,r){return r(e,t,n)||n},o);if(i&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(i):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(e,t,o);o=null}return o}function R(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}var j;(function(e){e["Suspend"]="suspendBinding";e["Resume"]="resumeBinding"})(j||(j={}));let N=(c=A("sap.fe.templates.ListReport.controls.MultipleModeControl"),d=S({type:"boolean"}),f=S({type:"boolean",defaultValue:false}),g=S({type:"boolean",defaultValue:false}),h=B({type:"sap.m.IconTabBar",multiple:false,isDefault:true}),p=O({type:"sap.ui.core.Control",multiple:true}),v=O({type:"sap.fe.core.controls.FilterBar",multiple:false}),C=P(),c(b=(y=function(n){K(l,n);function l(){var e;for(var t=arguments.length,r=new Array(t),i=0;i<t;i++){r[i]=arguments[i]}e=n.call(this,...r)||this;D(e,"showCounts",m,E(e));D(e,"freezeContent",_,E(e));D(e,"countsOutDated",I,E(e));D(e,"content",T,E(e));D(e,"innerControls",w,E(e));D(e,"filterControl",F,E(e));D(e,"select",z,E(e));return e}var c=l.prototype;c.onBeforeRendering=function e(){this.getTabsModel();const t=this._getFilterControl();if(!t){this.setCountsOutDated(true)}const n=t===null||t===void 0?void 0:t.getParent();this.getAllInnerControls().forEach(e=>{var t;if(this.showCounts){e.attachEvent("internalDataRequested",this._refreshTabsCount.bind(this))}(t=e.suspendBinding)===null||t===void 0?void 0:t.call(e)});if(n){n.attachEvent("internalSearch",this._onSearch.bind(this));n.attachEvent("internalFilterChanged",this._onFilterChanged.bind(this))}};c.onAfterRendering=function e(){var t,n;(t=this.getSelectedInnerControl())===null||t===void 0?void 0:(n=t.resumeBinding)===null||n===void 0?void 0:n.call(t,!this.getProperty("freezeContent"))};l.render=function e(t,n){t.renderControl(n.content)};c.getTabsModel=function e(){const t="tabsInternal";const n=this.content;if(!n){return undefined}let r=n.getModel(t);if(!r){r=new u({});n.setModel(r,t)}return r};c.getSelectedInnerControl=function e(){var t;const n=(t=this.content)===null||t===void 0?void 0:t.getItems().find(e=>e.getKey()===this.content.getSelectedKey());return n?this.getAllInnerControls().find(e=>this._getTabFromInnerControl(e)===n):undefined};l.handleTabChange=function e(t){var n,r;const i=t.getSource();const o=i.getParent();const l=t.getParameters();o._setInnerBinding(true);const s=l===null||l===void 0?void 0:l.previousKey;const u=l===null||l===void 0?void 0:l.selectedKey;if(u&&s!==u){const e=o._getFilterControl();if(e&&!o.getProperty("freezeContent")){if(!o.getSelectedInnerControl()){o._refreshCustomView(e.getFilterConditions(),"tabChanged")}}a.add({changes:[{changeSpecificData:{changeType:"selectIconTabBarFilter",content:{selectedKey:u,previousSelectedKey:s}},selectorElement:i}]})}(n=o._getViewController())===null||n===void 0?void 0:(r=n.getExtensionAPI())===null||r===void 0?void 0:r.updateAppState();o.fireEvent("select",{iconTabBar:i,selectedKey:u,previousKey:s})};c.invalidateContent=function e(){this.setCountsOutDated(true);this.getAllInnerControls().forEach(e=>{var t;(t=e.invalidateContent)===null||t===void 0?void 0:t.call(e)})};c.setCountsOutDated=function e(){let t=arguments.length>0&&arguments[0]!==undefined?arguments[0]:true;this.setProperty("countsOutDated",t);if(t&&!this.getSelectedInnerControl()){this._refreshTabsCount()}};c.setFreezeContent=function e(t){this.setProperty("freezeContent",t);this._setInnerBinding()};c._updateMultiTabNotApplicableFields=function e(t){const n=this.getTabsModel();const r=this._getFilterControl();if(n&&r){const e={};this.getAllInnerControls().forEach(n=>{const i=this._getTabFromInnerControl(n);if(i){var o;const l=i.getKey();const s=((o=n.refreshNotApplicableFields)===null||o===void 0?void 0:o.call(n,r))||[];e[l]={notApplicable:{fields:s,title:this._setTabMessageStrip({entityTypePath:r.data("entityType"),ignoredFields:s,resourceBundle:t,title:i.getText()})}}}});n.setData(e)}};c.getAllInnerControls=function e(){let t=arguments.length>0&&arguments[0]!==undefined?arguments[0]:false;return this.innerControls.reduce((e,n)=>{const r=s.byId(n);if(r){e.push(r)}return e.filter(e=>{var n;return!t||((n=this._getTabFromInnerControl(e))===null||n===void 0?void 0:n.getVisible())})},[])||[]};c._getFilterControl=function e(){return s.byId(this.filterControl)};c._getTabFromInnerControl=function e(t){const n=o.getMetadata().getName();let r=t;if(r&&!r.isA(n)&&r.getParent){r=t.getParent()}return r&&r.isA(n)?r:undefined};c._getViewController=function e(){const n=t.getTargetView(this);return n&&n.getController()};c._refreshCustomView=function e(t,n){var r,i;(r=this._getViewController())===null||r===void 0?void 0:(i=r.onViewNeedsRefresh)===null||i===void 0?void 0:i.call(r,{filterConditions:t,currentTabId:this.content.getSelectedKey(),refreshCause:n})};c._refreshTabsCount=function t(n){var r,i;const o=n===null||n===void 0?void 0:n.getSource();const l=o?(r=this._getTabFromInnerControl(o))===null||r===void 0?void 0:r.getKey():(i=this.content)===null||i===void 0?void 0:i.getSelectedKey();this.getAllInnerControls(true).forEach(t=>{const n=this._getTabFromInnerControl(t);if(t!==null&&t!==void 0&&t.getCounts&&(this.countsOutDated||l===(n===null||n===void 0?void 0:n.getKey()))){if(n&&n.setCount){n.setCount("...");t.getCounts().then(e=>n.setCount(e||"0")).catch(function(t){e.error("Error while requesting Counts for Control",t)})}}});this.setCountsOutDated(false)};c._setInnerBinding=function e(){let t=arguments.length>0&&arguments[0]!==undefined?arguments[0]:false;if(this.content){this.getAllInnerControls().forEach(e=>{var n;const r=this._getTabFromInnerControl(e);const i=(r===null||r===void 0?void 0:r.getKey())===this.content.getSelectedKey();const o=i&&!this.getProperty("freezeContent")?j.Resume:j.Suspend;(n=e[o])===null||n===void 0?void 0:n.call(e,o===j.Resume?t&&i:undefined)})}};c._setTabMessageStrip=function e(t){let n="";const o=t.ignoredFields;const l=this._getFilterControl();if(l&&Array.isArray(o)&&o.length>0&&t.title){const e=r.getLabels(o,t.entityTypePath,l,t.resourceBundle);n=r.getText(e,l,t.title,i.getLocalizedText);return n}};c._onSearch=function e(t){this.setCountsOutDated(true);this.setFreezeContent(false);if(this.getSelectedInnerControl()){var n;this._updateMultiTabNotApplicableFields((n=this._getViewController())===null||n===void 0?void 0:n.oResourceBundle)}else{this._refreshCustomView(t.getParameter("conditions"),"search")}};c._onFilterChanged=function e(t){if(t.getParameter("conditionsBased")){this.setFreezeContent(true)}};return l}(l),m=V(y.prototype,"showCounts",[d],{configurable:true,enumerable:true,writable:true,initializer:null}),_=V(y.prototype,"freezeContent",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),I=V(y.prototype,"countsOutDated",[g],{configurable:true,enumerable:true,writable:true,initializer:null}),T=V(y.prototype,"content",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),w=V(y.prototype,"innerControls",[p],{configurable:true,enumerable:true,writable:true,initializer:null}),F=V(y.prototype,"filterControl",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),z=V(y.prototype,"select",[C],{configurable:true,enumerable:true,writable:true,initializer:null}),y))||b);return N},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/overrides/IntentBasedNavigation-dbg", ["sap/fe/core/CommonUtils"], function (CommonUtils) {
  "use strict";

  const IntentBasedNavigationOverride = {
    adaptNavigationContext: function (oSelectionVariant, oTargetInfo) {
      const oView = this.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl();
      // Adding filter bar values to the navigation does not make sense if no context has been selected.
      // Hence only consider filter bar values when SelectionVariant is not empty
      if (oFilterBar && !oSelectionVariant.isEmpty()) {
        const oViewData = oView.getViewData(),
          sRootPath = oViewData.fullContextPath;
        let oFilterBarConditions = Object.assign({}, this.base.getView().getController().filterBarConditions);
        let aParameters = [];
        if (oViewData.contextPath) {
          const oMetaModel = oView.getModel().getMetaModel(),
            oParameterInfo = CommonUtils.getParameterInfo(oMetaModel, oViewData.contextPath),
            oParamProperties = oParameterInfo.parameterProperties;
          aParameters = oParamProperties && Object.keys(oParamProperties) || [];
        }
        oFilterBarConditions = oController._intentBasedNavigation.prepareFiltersForExternalNavigation(oFilterBarConditions, sRootPath, aParameters);
        const oMultipleModeControl = oController._getMultiModeControl();
        if (oMultipleModeControl) {
          // Do we need to exclude Fields (multi tables mode with multi entity sets)?
          const oTabsModel = oMultipleModeControl.getTabsModel();
          if (oTabsModel) {
            var _oMultipleModeControl;
            const aIgnoredFieldsForTab = oTabsModel.getProperty(`/${(_oMultipleModeControl = oMultipleModeControl.content) === null || _oMultipleModeControl === void 0 ? void 0 : _oMultipleModeControl.getSelectedKey()}/notApplicable/fields`);
            if (Array.isArray(aIgnoredFieldsForTab) && aIgnoredFieldsForTab.length > 0) {
              aIgnoredFieldsForTab.forEach(function (sProperty) {
                delete oFilterBarConditions.filterConditions[sProperty];
              });
            }
          }
        }

        // TODO: move this also into the intent based navigation controller extension
        CommonUtils.addExternalStateFiltersToSelectionVariant(oSelectionVariant, oFilterBarConditions, oTargetInfo, oFilterBar);
        delete oTargetInfo.propertiesWithoutConflict;
      }
    },
    getEntitySet: function () {
      return this.base.getCurrentEntitySet();
    }
  };
  return IntentBasedNavigationOverride;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/overrides/IntentBasedNavigation", ["sap/fe/core/CommonUtils"],function(t){"use strict";const e={adaptNavigationContext:function(e,i){const n=this.getView(),o=n.getController(),r=o._getFilterBarControl();if(r&&!e.isEmpty()){const l=n.getViewData(),s=l.fullContextPath;let c=Object.assign({},this.base.getView().getController().filterBarConditions);let g=[];if(l.contextPath){const e=n.getModel().getMetaModel(),i=t.getParameterInfo(e,l.contextPath),o=i.parameterProperties;g=o&&Object.keys(o)||[]}c=o._intentBasedNavigation.prepareFiltersForExternalNavigation(c,s,g);const f=o._getMultiModeControl();if(f){const t=f.getTabsModel();if(t){var a;const e=t.getProperty(`/${(a=f.content)===null||a===void 0?void 0:a.getSelectedKey()}/notApplicable/fields`);if(Array.isArray(e)&&e.length>0){e.forEach(function(t){delete c.filterConditions[t]})}}}t.addExternalStateFiltersToSelectionVariant(e,c,i,r);delete i.propertiesWithoutConflict}},getEntitySet:function(){return this.base.getCurrentEntitySet()}};return e},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/overrides/Share-dbg", ["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/SemanticDateOperators", "sap/ui/core/routing/HashChanger"], function (Log, CommonUtils, SemanticDateOperators, HashChanger) {
  "use strict";

  function getCountUrl(oController) {
    var _oController$_getTabl;
    const oTable = (_oController$_getTabl = oController._getTable) === null || _oController$_getTabl === void 0 ? void 0 : _oController$_getTabl.call(oController);
    if (!oTable) {
      return "";
    }
    const oBinding = oTable.getRowBinding() || oTable.getBinding("items");
    const sDownloadUrl = oBinding && oBinding.getDownloadUrl() || "";
    const aSplitUrl = sDownloadUrl.split("?");
    const baseUrl = `${aSplitUrl[0]}/$count?`;
    // getDownloadUrl() returns url with $select, $expand which is not supported when /$count is used to get the record count. only $apply, $search, $filter is supported
    // ?$count=true returns count in a format which is not supported by FLP yet.
    // currently supported format for v4 is ../count.. only (where tile preview will still not work)
    const aSupportedParams = [];
    if (aSplitUrl.length > 1) {
      const urlParams = aSplitUrl[1];
      urlParams.split("&").forEach(function (urlParam) {
        const aUrlParamParts = urlParam.split("=");
        switch (aUrlParamParts[0]) {
          case "$apply":
          case "$search":
          case "$filter":
            aSupportedParams.push(urlParam);
        }
      });
    }
    return baseUrl + aSupportedParams.join("&");
  }
  function getShareEmailUrl() {
    const oUShellContainer = sap.ushell && sap.ushell.Container;
    if (oUShellContainer) {
      return oUShellContainer.getFLPUrlAsync(true).then(function (sFLPUrl) {
        return sFLPUrl;
      }).catch(function (sError) {
        Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
      });
    } else {
      return Promise.resolve(document.URL);
    }
  }
  function getSaveAsTileServiceUrl(oController) {
    const oFilterBar = oController._getFilterBarControl();
    if (oFilterBar) {
      const oConditions = oFilterBar.getFilterConditions();
      const bSaveAsTileServiceUrlAllowed = SemanticDateOperators.hasSemanticDateOperations(oConditions);
      if (bSaveAsTileServiceUrlAllowed) {
        return getCountUrl(oController);
      }
    }
    return "";
  }
  function getJamUrl() {
    const sHash = HashChanger.getInstance().getHash();
    const sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
    const sJamUrl = sHash ? sBasePath + sHash : window.location.hash;
    // in case we are in cFLP scenario, the application is running
    // inside an iframe, and there for we need to get the cFLP URL
    // and not 'document.URL' that represents the iframe URL
    if (sap.ushell && sap.ushell.Container && sap.ushell.Container.runningInIframe && sap.ushell.Container.runningInIframe()) {
      sap.ushell.Container.getFLPUrl(true).then(function (sUrl) {
        return sUrl.substr(0, sUrl.indexOf("#")) + sJamUrl;
      }).catch(function (sError) {
        Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
      });
    } else {
      return window.location.origin + window.location.pathname + sJamUrl;
    }
  }
  const ShareOverride = {
    adaptShareMetadata: function (oShareMetadata) {
      Promise.resolve(getJamUrl()).then(sJamUrl => {
        const oAppComponent = CommonUtils.getAppComponent(this.base.getView());
        const oMetadata = oAppComponent.getMetadata();
        const oUIManifest = oMetadata.getManifestEntry("sap.ui");
        const sIcon = oUIManifest && oUIManifest.icons && oUIManifest.icons.icon || "";
        const oAppManifest = oMetadata.getManifestEntry("sap.app");
        const sTitle = oAppManifest && oAppManifest.title || "";
        // TODO: check if there is any semantic date used before adding serviceURL as BLI:FIORITECHP1-18023
        oShareMetadata.tile = {
          icon: sIcon,
          title: sTitle,
          queryUrl: getSaveAsTileServiceUrl(this.base.getView().getController())
        };
        oShareMetadata.title = document.title;
        oShareMetadata.jam.url = sJamUrl;
        // MS Teams collaboration does not want to allow further changes to the URL
        // so update colloborationInfo model at LR override to ignore further extension changes at multiple levels
        const collaborationInfoModel = this.base.getView().getModel("collaborationInfo");
        collaborationInfoModel.setProperty("/url", oShareMetadata.url);
        collaborationInfoModel.setProperty("/appTitle", oShareMetadata.title);
      }).catch(function (error) {
        Log.error(error);
      });
      return Promise.resolve(getShareEmailUrl()).then(function (sFLPUrl) {
        oShareMetadata.email.url = sFLPUrl;
        return oShareMetadata;
      });
    }
  };
  return ShareOverride;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/overrides/Share", ["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/helpers/SemanticDateOperators","sap/ui/core/routing/HashChanger"],function(t,e,n,o){"use strict";function r(t){var e;const n=(e=t._getTable)===null||e===void 0?void 0:e.call(t);if(!n){return""}const o=n.getRowBinding()||n.getBinding("items");const r=o&&o.getDownloadUrl()||"";const i=r.split("?");const s=`${i[0]}/$count?`;const a=[];if(i.length>1){const t=i[1];t.split("&").forEach(function(t){const e=t.split("=");switch(e[0]){case"$apply":case"$search":case"$filter":a.push(t)}})}return s+a.join("&")}function i(){const e=sap.ushell&&sap.ushell.Container;if(e){return e.getFLPUrlAsync(true).then(function(t){return t}).catch(function(e){t.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)",e)})}else{return Promise.resolve(document.URL)}}function s(t){const e=t._getFilterBarControl();if(e){const o=e.getFilterConditions();const i=n.hasSemanticDateOperations(o);if(i){return r(t)}}return""}function a(){const e=o.getInstance().getHash();const n=o.getInstance().hrefForAppSpecificHash?o.getInstance().hrefForAppSpecificHash(""):"";const r=e?n+e:window.location.hash;if(sap.ushell&&sap.ushell.Container&&sap.ushell.Container.runningInIframe&&sap.ushell.Container.runningInIframe()){sap.ushell.Container.getFLPUrl(true).then(function(t){return t.substr(0,t.indexOf("#"))+r}).catch(function(e){t.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)",e)})}else{return window.location.origin+window.location.pathname+r}}const c={adaptShareMetadata:function(n){Promise.resolve(a()).then(t=>{const o=e.getAppComponent(this.base.getView());const r=o.getMetadata();const i=r.getManifestEntry("sap.ui");const a=i&&i.icons&&i.icons.icon||"";const c=r.getManifestEntry("sap.app");const l=c&&c.title||"";n.tile={icon:a,title:l,queryUrl:s(this.base.getView().getController())};n.title=document.title;n.jam.url=t;const u=this.base.getView().getModel("collaborationInfo");u.setProperty("/url",n.url);u.setProperty("/appTitle",n.title)}).catch(function(e){t.error(e)});return Promise.resolve(i()).then(function(t){n.email.url=t;return n})}};return c},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/overrides/ViewState-dbg", ["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/library", "sap/fe/core/templating/PropertyFormatters", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/navigation/library", "sap/ui/Device", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/p13n/StateUtil"], function (Log, CommonUtils, KeepAliveHelper, ModelHelper, CoreLibrary, PropertyFormatters, DelegateUtil, FilterUtils, NavLibrary, Device, ControlVariantApplyAPI, ConditionValidated, StateUtil) {
  "use strict";

  var system = Device.system;
  const NavType = NavLibrary.NavType,
    VariantManagementType = CoreLibrary.VariantManagement,
    TemplateContentView = CoreLibrary.TemplateContentView,
    InitialLoadMode = CoreLibrary.InitialLoadMode,
    CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /\+|\*/g;
  const ViewStateOverride = {
    _bSearchTriggered: false,
    applyInitialStateOnly: function () {
      return true;
    },
    onBeforeStateApplied: function (aPromises) {
      const oView = this.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl(),
        aTables = oController._getControls("table");
      if (oFilterBar) {
        oFilterBar.setSuspendSelection(true);
        aPromises.push(oFilterBar.waitForInitialization());
      }
      aTables.forEach(function (oTable) {
        aPromises.push(oTable.initialized());
      });
      delete this._bSearchTriggered;
    },
    onAfterStateApplied: function () {
      const oController = this.getView().getController();
      const oFilterBar = oController._getFilterBarControl();
      if (oFilterBar) {
        oFilterBar.setSuspendSelection(false);
      } else if (oController._isFilterBarHidden()) {
        const oInternalModelContext = oController.getView().getBindingContext("internal");
        oInternalModelContext.setProperty("hasPendingFilters", false);
        if (oController._isMultiMode()) {
          oController._getMultiModeControl().setCountsOutDated(true);
        }
      }
    },
    adaptBindingRefreshControls: function (aControls) {
      const oView = this.getView(),
        oController = oView.getController(),
        aViewControls = oController._getControls(),
        aControlsToRefresh = KeepAliveHelper.getControlsForRefresh(oView, aViewControls);
      Array.prototype.push.apply(aControls, aControlsToRefresh);
    },
    adaptStateControls: function (aStateControls) {
      const oView = this.getView(),
        oController = oView.getController(),
        oViewData = oView.getViewData(),
        bControlVM = oViewData.variantManagement === VariantManagementType.Control;
      const oFilterBarVM = this._getFilterBarVM(oView);
      if (oFilterBarVM) {
        aStateControls.push(oFilterBarVM);
      }
      if (oController._isMultiMode()) {
        aStateControls.push(oController._getMultiModeControl());
      }
      oController._getControls("table").forEach(function (oTable) {
        const oQuickFilter = oTable.getQuickFilter();
        if (oQuickFilter) {
          aStateControls.push(oQuickFilter);
        }
        if (bControlVM) {
          aStateControls.push(oTable.getVariant());
        }
        aStateControls.push(oTable);
      });
      if (oController._getControls("Chart")) {
        oController._getControls("Chart").forEach(function (oChart) {
          if (bControlVM) {
            aStateControls.push(oChart.getVariant());
          }
          aStateControls.push(oChart);
        });
      }
      if (oController._hasMultiVisualizations()) {
        aStateControls.push(oController._getSegmentedButton(TemplateContentView.Chart));
        aStateControls.push(oController._getSegmentedButton(TemplateContentView.Table));
      }
      const oFilterBar = oController._getFilterBarControl();
      if (oFilterBar) {
        aStateControls.push(oFilterBar);
      }
      aStateControls.push(oView.byId("fe::ListReport"));
    },
    retrieveAdditionalStates: function (mAdditionalStates) {
      const oView = this.getView(),
        oController = oView.getController(),
        bPendingFilter = oView.getBindingContext("internal").getProperty("hasPendingFilters");
      mAdditionalStates.dataLoaded = !bPendingFilter || !!this._bSearchTriggered;
      if (oController._hasMultiVisualizations()) {
        const sAlpContentView = oView.getBindingContext("internal").getProperty("alpContentView");
        mAdditionalStates.alpContentView = sAlpContentView;
      }
      delete this._bSearchTriggered;
    },
    applyAdditionalStates: function (oAdditionalStates) {
      const oView = this.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl();
      if (oAdditionalStates) {
        // explicit check for boolean values - 'undefined' should not alter the triggered search property
        if (oAdditionalStates.dataLoaded === false && oFilterBar) {
          // without this, the data is loaded on navigating back
          oFilterBar._bSearchTriggered = false;
        } else if (oAdditionalStates.dataLoaded === true) {
          if (oFilterBar) {
            oFilterBar.triggerSearch();
          }
          this._bSearchTriggered = true;
        }
        if (oController._hasMultiVisualizations()) {
          const oInternalModelContext = oView.getBindingContext("internal");
          if (!system.desktop && oAdditionalStates.alpContentView == TemplateContentView.Hybrid) {
            oAdditionalStates.alpContentView = TemplateContentView.Chart;
          }
          oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/alpContentView`, oAdditionalStates.alpContentView);
        }
      }
    },
    _applyNavigationParametersToFilterbar: function (oNavigationParameter, aResults) {
      const oView = this.getView();
      const oController = oView.getController();
      const oAppComponent = oController.getAppComponent();
      const oComponentData = oAppComponent.getComponentData();
      const oStartupParameters = oComponentData && oComponentData.startupParameters || {};
      const oVariantPromise = this.handleVariantIdPassedViaURLParams(oStartupParameters);
      let bFilterVariantApplied;
      aResults.push(oVariantPromise.then(aVariants => {
        if (aVariants && aVariants.length > 0) {
          if (aVariants[0] === true || aVariants[1] === true) {
            bFilterVariantApplied = true;
          }
        }
        return this._applySelectionVariant(oView, oNavigationParameter, bFilterVariantApplied);
      }).then(() => {
        const oDynamicPage = oController._getDynamicListReportControl();
        let bPreventInitialSearch = false;
        const oFilterBarVM = this._getFilterBarVM(oView);
        const oFilterBarControl = oController._getFilterBarControl();
        if (oFilterBarControl) {
          if (oNavigationParameter.navigationType !== NavType.initial && oNavigationParameter.requiresStandardVariant || !oFilterBarVM && oView.getViewData().initialLoad === InitialLoadMode.Enabled || oController._shouldAutoTriggerSearch(oFilterBarVM)) {
            oFilterBarControl.triggerSearch();
          } else {
            bPreventInitialSearch = this._preventInitialSearch(oFilterBarVM);
          }
          // reset the suspend selection on filter bar to allow loading of data when needed (was set on LR Init)
          oFilterBarControl.setSuspendSelection(false);
          this._bSearchTriggered = !bPreventInitialSearch;
          oDynamicPage.setHeaderExpanded(system.desktop || bPreventInitialSearch);
        }
      }).catch(function () {
        Log.error("Variant ID cannot be applied");
      }));
    },
    handleVariantIdPassedViaURLParams: function (oUrlParams) {
      const aPageVariantId = oUrlParams["sap-ui-fe-variant-id"],
        aFilterBarVariantId = oUrlParams["sap-ui-fe-filterbar-variant-id"],
        aTableVariantId = oUrlParams["sap-ui-fe-table-variant-id"],
        aChartVariantId = oUrlParams["sap-ui-fe-chart-variant-id"];
      let oVariantIDs;
      if (aPageVariantId || aFilterBarVariantId || aTableVariantId || aChartVariantId) {
        oVariantIDs = {
          sPageVariantId: aPageVariantId && aPageVariantId[0],
          sFilterBarVariantId: aFilterBarVariantId && aFilterBarVariantId[0],
          sTableVariantId: aTableVariantId && aTableVariantId[0],
          sChartVariantId: aChartVariantId && aChartVariantId[0]
        };
      }
      return this._handleControlVariantId(oVariantIDs);
    },
    _handleControlVariantId: function (oVariantIDs) {
      let oVM;
      const oView = this.getView(),
        aPromises = [];
      const sVariantManagement = oView.getViewData().variantManagement;
      if (oVariantIDs && oVariantIDs.sPageVariantId && sVariantManagement === "Page") {
        oVM = oView.byId("fe::PageVariantManagement");
        this._handlePageVariantId(oVariantIDs, oVM, aPromises);
      } else if (oVariantIDs && sVariantManagement === "Control") {
        if (oVariantIDs.sFilterBarVariantId) {
          oVM = oView.getController()._getFilterBarVariantControl();
          this._handleFilterBarVariantControlId(oVariantIDs, oVM, aPromises);
        }
        if (oVariantIDs.sTableVariantId) {
          const oController = oView.getController();
          this._handleTableControlVariantId(oVariantIDs, oController, aPromises);
        }
        if (oVariantIDs.sChartVariantId) {
          const oController = oView.getController();
          this._handleChartControlVariantId(oVariantIDs, oController, aPromises);
        }
      }
      return Promise.all(aPromises);
    },
    /*
     * Handles page level variant and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oVM contains the vairant management object for the page variant
     * @param aPromises is an array of all promises
     * @private
     */
    _handlePageVariantId: function (oVariantIDs, oVM, aPromises) {
      oVM.getVariants().forEach(oVariant => {
        this._findAndPushVariantToPromise(oVariant, oVariantIDs.sPageVariantId, oVM, aPromises, true);
      });
    },
    /*
     * Handles control level variant for filter bar and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oVM contains the vairant management object for the filter bar
     * @param aPromises is an array of all promises
     * @private
     */

    _handleFilterBarVariantControlId: function (oVariantIDs, oVM, aPromises) {
      if (oVM) {
        oVM.getVariants().forEach(oVariant => {
          this._findAndPushVariantToPromise(oVariant, oVariantIDs.sFilterBarVariantId, oVM, aPromises, true);
        });
      }
    },
    /*
     * Handles control level variant for table and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oController has the list report controller object
     * @param aPromises is an array of all promises
     * @private
     */
    _handleTableControlVariantId: function (oVariantIDs, oController, aPromises) {
      const aTables = oController._getControls("table");
      aTables.forEach(oTable => {
        const oTableVariant = oTable.getVariant();
        if (oTable && oTableVariant) {
          oTableVariant.getVariants().forEach(oVariant => {
            this._findAndPushVariantToPromise(oVariant, oVariantIDs.sTableVariantId, oTableVariant, aPromises);
          });
        }
      });
    },
    /*
     * Handles control level variant for chart and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oController has the list report controller object
     * @param aPromises is an array of all promises
     * @private
     */
    _handleChartControlVariantId: function (oVariantIDs, oController, aPromises) {
      const aCharts = oController._getControls("Chart");
      aCharts.forEach(oChart => {
        const oChartVariant = oChart.getVariant();
        const aVariants = oChartVariant.getVariants();
        if (aVariants) {
          aVariants.forEach(oVariant => {
            this._findAndPushVariantToPromise(oVariant, oVariantIDs.sChartVariantId, oChartVariant, aPromises);
          });
        }
      });
    },
    /*
     * Matches the variant ID provided in the url to the available vairant IDs and pushes the appropriate promise to the promise array
     *
     * @param oVariant is an object for a specific variant
     * @param sVariantId is the variant ID provided in the url
     * @param oVM is the variant management object for the specfic variant
     * @param aPromises is an array of promises
     * @param bFilterVariantApplied is an optional parameter which is set to ture in case the filter variant is applied
     * @private
     */
    _findAndPushVariantToPromise: function (oVariant, sVariantId, oVM, aPromises, bFilterVariantApplied) {
      if (oVariant.key === sVariantId) {
        aPromises.push(this._applyControlVariant(oVM, sVariantId, bFilterVariantApplied));
      }
    },
    _applyControlVariant: function (oVariant, sVariantID, bFilterVariantApplied) {
      const sVariantReference = this._checkIfVariantIdIsAvailable(oVariant, sVariantID) ? sVariantID : oVariant.getStandardVariantKey();
      const oVM = ControlVariantApplyAPI.activateVariant({
        element: oVariant,
        variantReference: sVariantReference
      });
      return oVM.then(function () {
        return bFilterVariantApplied;
      });
    },
    /************************************* private helper *****************************************/

    _getFilterBarVM: function (oView) {
      const oViewData = oView.getViewData();
      switch (oViewData.variantManagement) {
        case VariantManagementType.Page:
          return oView.byId("fe::PageVariantManagement");
        case VariantManagementType.Control:
          return oView.getController()._getFilterBarVariantControl();
        case VariantManagementType.None:
          return null;
        default:
          throw new Error(`unhandled variant setting: ${oViewData.variantManagement}`);
      }
    },
    _preventInitialSearch: function (oVariantManagement) {
      if (!oVariantManagement) {
        return true;
      }
      const aVariants = oVariantManagement.getVariants();
      const oCurrentVariant = aVariants.find(function (oItem) {
        return oItem.key === oVariantManagement.getCurrentVariantKey();
      });
      return !oCurrentVariant.executeOnSelect;
    },
    _applySelectionVariant: function (oView, oNavigationParameter, bFilterVariantApplied) {
      const oFilterBar = oView.getController()._getFilterBarControl(),
        oSelectionVariant = oNavigationParameter.selectionVariant,
        oSelectionVariantDefaults = oNavigationParameter.selectionVariantDefaults;
      if (!oFilterBar || !oSelectionVariant) {
        return Promise.resolve();
      }
      let oConditions = {};
      const oMetaModel = oView.getModel().getMetaModel();
      const oViewData = oView.getViewData();
      const sContextPath = oViewData.contextPath || `/${oViewData.entitySet}`;
      const aMandatoryFilterFields = CommonUtils.getMandatoryFilterFields(oMetaModel, sContextPath);
      const bUseSemanticDateRange = oFilterBar.data("useSemanticDateRange");
      let oVariant;
      switch (oViewData.variantManagement) {
        case VariantManagementType.Page:
          oVariant = oView.byId("fe::PageVariantManagement");
          break;
        case VariantManagementType.Control:
          oVariant = oView.getController()._getFilterBarVariantControl();
          break;
        case VariantManagementType.None:
        default:
          break;
      }
      const bRequiresStandardVariant = oNavigationParameter.requiresStandardVariant;
      // check if FLP default values are there and is it standard variant
      const bIsFLPValuePresent = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOptionsPropertyNames().length > 0 && oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey() && oNavigationParameter.bNavSelVarHasDefaultsOnly;

      // get conditions when FLP value is present
      if (bFilterVariantApplied || bIsFLPValuePresent) {
        oConditions = oFilterBar.getConditions();
      }
      CommonUtils.addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults);
      CommonUtils.addSelectionVariantToConditions(oSelectionVariant, oConditions, oMetaModel, sContextPath, bIsFLPValuePresent, bUseSemanticDateRange, oViewData);
      return this._activateSelectionVariant(oFilterBar, oConditions, oVariant, bRequiresStandardVariant, bFilterVariantApplied, bIsFLPValuePresent);
    },
    _activateSelectionVariant: function (oFilterBar, oConditions, oVariant, bRequiresStandardVariant, bFilterVariantApplied, bIsFLPValuePresent) {
      let oPromise;
      if (oVariant && !bFilterVariantApplied) {
        let oVariantKey = bRequiresStandardVariant ? oVariant.getStandardVariantKey() : oVariant.getDefaultVariantKey();
        if (oVariantKey === null) {
          oVariantKey = oVariant.getId();
        }
        oPromise = ControlVariantApplyAPI.activateVariant({
          element: oVariant,
          variantReference: oVariantKey
        }).then(function () {
          return bRequiresStandardVariant || oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey();
        });
      } else {
        oPromise = Promise.resolve(true);
      }
      return oPromise.then(bClearFilterAndReplaceWithAppState => {
        if (bClearFilterAndReplaceWithAppState) {
          return this._fnApplyConditions(oFilterBar, oConditions, bIsFLPValuePresent);
        }
      });
    },
    /*
     * Sets filtered: false flag to every field so that it can be cleared out
     *
     * @param oFilterBar filterbar control is used to display filter properties in a user-friendly manner to populate values for a query
     * @returns promise which will be resolved to object
     * @private
     */
    _fnClearStateBeforexAppNav: async function (oFilterBar) {
      return await StateUtil.retrieveExternalState(oFilterBar).then(oExternalState => {
        const oCondition = oExternalState.filter;
        for (const field in oCondition) {
          if (field !== "$editState" && field !== "$search") {
            oCondition[field][0]["filtered"] = false;
          }
        }
        return Promise.resolve(oCondition);
      }).catch(function (oError) {
        Log.error("Error while retrieving the external state", oError);
      });
    },
    _fnApplyConditions: async function (oFilterBar, oConditions, bIsFLPValuePresent) {
      const mFilter = {},
        aItems = [],
        fnAdjustValueHelpCondition = function (oCondition) {
          // in case the condition is meant for a field having a VH, the format required by MDC differs
          oCondition.validated = ConditionValidated.Validated;
          if (oCondition.operator === "Empty") {
            oCondition.operator = "EQ";
            oCondition.values = [""];
          } else if (oCondition.operator === "NotEmpty") {
            oCondition.operator = "NE";
            oCondition.values = [""];
          }
          delete oCondition.isEmpty;
        };
      const fnGetPropertyInfo = function (oFilterControl, sEntityTypePath) {
        const sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath),
          oMetaModel = oFilterControl.getModel().getMetaModel(),
          oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
          aNonFilterableProps = oFR.NonFilterableProperties,
          mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath),
          aPropertyInfo = [];
        Object.keys(mFilterFields).forEach(function (sFilterFieldKey) {
          const oConvertedProperty = mFilterFields[sFilterFieldKey];
          const sPropertyPath = oConvertedProperty.conditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
          if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
            const sAnnotationPath = oConvertedProperty.annotationPath;
            const oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
            aPropertyInfo.push({
              path: oConvertedProperty.conditionPath,
              hiddenFilter: oConvertedProperty.availability === "Hidden",
              hasValueHelp: !sAnnotationPath ? false : PropertyFormatters.hasValueHelp(oPropertyContext.getObject(), {
                context: oPropertyContext
              })
            });
          }
        });
        return aPropertyInfo;
      };
      return oFilterBar.waitForInitialization().then(async () => {
        const sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
        // During external app navigation, we have to clear the existing conditions to avoid merging of values coming from annotation and context
        // Condition !bIsFLPValuePresent indicates it's external app navigation
        if (!bIsFLPValuePresent) {
          const oClearConditions = await this._fnClearStateBeforexAppNav(oFilterBar);
          await StateUtil.applyExternalState(oFilterBar, {
            filter: oClearConditions,
            items: aItems
          });
        }
        const aPropertyInfo = fnGetPropertyInfo(oFilterBar, sEntityTypePath);
        aPropertyInfo.filter(function (oPropertyInfo) {
          return oPropertyInfo.path !== "$editState" && oPropertyInfo.path !== "$search";
        }).forEach(function (oPropertyInfo) {
          if (oPropertyInfo.path in oConditions) {
            mFilter[oPropertyInfo.path] = oConditions[oPropertyInfo.path];
            if (!oPropertyInfo.hiddenFilter) {
              aItems.push({
                name: oPropertyInfo.path
              });
            }
            if (oPropertyInfo.hasValueHelp) {
              mFilter[oPropertyInfo.path].forEach(fnAdjustValueHelpCondition);
            } else {
              mFilter[oPropertyInfo.path].forEach(function (oCondition) {
                oCondition.validated = oCondition.filtered ? ConditionValidated.NotValidated : oCondition.validated;
              });
            }
          } else {
            mFilter[oPropertyInfo.path] = [];
          }
        });
        return StateUtil.applyExternalState(oFilterBar, {
          filter: mFilter,
          items: aItems
        });
      });
    }
  };
  return ViewStateOverride;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/overrides/ViewState", ["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/helpers/KeepAliveHelper","sap/fe/core/helpers/ModelHelper","sap/fe/core/library","sap/fe/core/templating/PropertyFormatters","sap/fe/macros/DelegateUtil","sap/fe/macros/filter/FilterUtils","sap/fe/navigation/library","sap/ui/Device","sap/ui/fl/apply/api/ControlVariantApplyAPI","sap/ui/mdc/enum/ConditionValidated","sap/ui/mdc/p13n/StateUtil"],function(t,e,a,n,i,r,o,s,l,c,d,f,g){"use strict";var h=c.system;const u=l.NavType,p=i.VariantManagement,V=i.TemplateContentView,C=i.InitialLoadMode,_=/\+|\*/g;const y={_bSearchTriggered:false,applyInitialStateOnly:function(){return true},onBeforeStateApplied:function(t){const e=this.getView(),a=e.getController(),n=a._getFilterBarControl(),i=a._getControls("table");if(n){n.setSuspendSelection(true);t.push(n.waitForInitialization())}i.forEach(function(e){t.push(e.initialized())});delete this._bSearchTriggered},onAfterStateApplied:function(){const t=this.getView().getController();const e=t._getFilterBarControl();if(e){e.setSuspendSelection(false)}else if(t._isFilterBarHidden()){const e=t.getView().getBindingContext("internal");e.setProperty("hasPendingFilters",false);if(t._isMultiMode()){t._getMultiModeControl().setCountsOutDated(true)}}},adaptBindingRefreshControls:function(t){const e=this.getView(),n=e.getController(),i=n._getControls(),r=a.getControlsForRefresh(e,i);Array.prototype.push.apply(t,r)},adaptStateControls:function(t){const e=this.getView(),a=e.getController(),n=e.getViewData(),i=n.variantManagement===p.Control;const r=this._getFilterBarVM(e);if(r){t.push(r)}if(a._isMultiMode()){t.push(a._getMultiModeControl())}a._getControls("table").forEach(function(e){const a=e.getQuickFilter();if(a){t.push(a)}if(i){t.push(e.getVariant())}t.push(e)});if(a._getControls("Chart")){a._getControls("Chart").forEach(function(e){if(i){t.push(e.getVariant())}t.push(e)})}if(a._hasMultiVisualizations()){t.push(a._getSegmentedButton(V.Chart));t.push(a._getSegmentedButton(V.Table))}const o=a._getFilterBarControl();if(o){t.push(o)}t.push(e.byId("fe::ListReport"))},retrieveAdditionalStates:function(t){const e=this.getView(),a=e.getController(),n=e.getBindingContext("internal").getProperty("hasPendingFilters");t.dataLoaded=!n||!!this._bSearchTriggered;if(a._hasMultiVisualizations()){const a=e.getBindingContext("internal").getProperty("alpContentView");t.alpContentView=a}delete this._bSearchTriggered},applyAdditionalStates:function(t){const e=this.getView(),a=e.getController(),n=a._getFilterBarControl();if(t){if(t.dataLoaded===false&&n){n._bSearchTriggered=false}else if(t.dataLoaded===true){if(n){n.triggerSearch()}this._bSearchTriggered=true}if(a._hasMultiVisualizations()){const a=e.getBindingContext("internal");if(!h.desktop&&t.alpContentView==V.Hybrid){t.alpContentView=V.Chart}a.getModel().setProperty(`${a.getPath()}/alpContentView`,t.alpContentView)}}},_applyNavigationParametersToFilterbar:function(e,a){const n=this.getView();const i=n.getController();const r=i.getAppComponent();const o=r.getComponentData();const s=o&&o.startupParameters||{};const l=this.handleVariantIdPassedViaURLParams(s);let c;a.push(l.then(t=>{if(t&&t.length>0){if(t[0]===true||t[1]===true){c=true}}return this._applySelectionVariant(n,e,c)}).then(()=>{const t=i._getDynamicListReportControl();let a=false;const r=this._getFilterBarVM(n);const o=i._getFilterBarControl();if(o){if(e.navigationType!==u.initial&&e.requiresStandardVariant||!r&&n.getViewData().initialLoad===C.Enabled||i._shouldAutoTriggerSearch(r)){o.triggerSearch()}else{a=this._preventInitialSearch(r)}o.setSuspendSelection(false);this._bSearchTriggered=!a;t.setHeaderExpanded(h.desktop||a)}}).catch(function(){t.error("Variant ID cannot be applied")}))},handleVariantIdPassedViaURLParams:function(t){const e=t["sap-ui-fe-variant-id"],a=t["sap-ui-fe-filterbar-variant-id"],n=t["sap-ui-fe-table-variant-id"],i=t["sap-ui-fe-chart-variant-id"];let r;if(e||a||n||i){r={sPageVariantId:e&&e[0],sFilterBarVariantId:a&&a[0],sTableVariantId:n&&n[0],sChartVariantId:i&&i[0]}}return this._handleControlVariantId(r)},_handleControlVariantId:function(t){let e;const a=this.getView(),n=[];const i=a.getViewData().variantManagement;if(t&&t.sPageVariantId&&i==="Page"){e=a.byId("fe::PageVariantManagement");this._handlePageVariantId(t,e,n)}else if(t&&i==="Control"){if(t.sFilterBarVariantId){e=a.getController()._getFilterBarVariantControl();this._handleFilterBarVariantControlId(t,e,n)}if(t.sTableVariantId){const e=a.getController();this._handleTableControlVariantId(t,e,n)}if(t.sChartVariantId){const e=a.getController();this._handleChartControlVariantId(t,e,n)}}return Promise.all(n)},_handlePageVariantId:function(t,e,a){e.getVariants().forEach(n=>{this._findAndPushVariantToPromise(n,t.sPageVariantId,e,a,true)})},_handleFilterBarVariantControlId:function(t,e,a){if(e){e.getVariants().forEach(n=>{this._findAndPushVariantToPromise(n,t.sFilterBarVariantId,e,a,true)})}},_handleTableControlVariantId:function(t,e,a){const n=e._getControls("table");n.forEach(e=>{const n=e.getVariant();if(e&&n){n.getVariants().forEach(e=>{this._findAndPushVariantToPromise(e,t.sTableVariantId,n,a)})}})},_handleChartControlVariantId:function(t,e,a){const n=e._getControls("Chart");n.forEach(e=>{const n=e.getVariant();const i=n.getVariants();if(i){i.forEach(e=>{this._findAndPushVariantToPromise(e,t.sChartVariantId,n,a)})}})},_findAndPushVariantToPromise:function(t,e,a,n,i){if(t.key===e){n.push(this._applyControlVariant(a,e,i))}},_applyControlVariant:function(t,e,a){const n=this._checkIfVariantIdIsAvailable(t,e)?e:t.getStandardVariantKey();const i=d.activateVariant({element:t,variantReference:n});return i.then(function(){return a})},_getFilterBarVM:function(t){const e=t.getViewData();switch(e.variantManagement){case p.Page:return t.byId("fe::PageVariantManagement");case p.Control:return t.getController()._getFilterBarVariantControl();case p.None:return null;default:throw new Error(`unhandled variant setting: ${e.variantManagement}`)}},_preventInitialSearch:function(t){if(!t){return true}const e=t.getVariants();const a=e.find(function(e){return e.key===t.getCurrentVariantKey()});return!a.executeOnSelect},_applySelectionVariant:function(t,a,n){const i=t.getController()._getFilterBarControl(),r=a.selectionVariant,o=a.selectionVariantDefaults;if(!i||!r){return Promise.resolve()}let s={};const l=t.getModel().getMetaModel();const c=t.getViewData();const d=c.contextPath||`/${c.entitySet}`;const f=e.getMandatoryFilterFields(l,d);const g=i.data("useSemanticDateRange");let h;switch(c.variantManagement){case p.Page:h=t.byId("fe::PageVariantManagement");break;case p.Control:h=t.getController()._getFilterBarVariantControl();break;case p.None:default:break}const u=a.requiresStandardVariant;const V=o&&o.getSelectOptionsPropertyNames().length>0&&h.getDefaultVariantKey()===h.getStandardVariantKey()&&a.bNavSelVarHasDefaultsOnly;if(n||V){s=i.getConditions()}e.addDefaultDisplayCurrency(f,r,o);e.addSelectionVariantToConditions(r,s,l,d,V,g,c);return this._activateSelectionVariant(i,s,h,u,n,V)},_activateSelectionVariant:function(t,e,a,n,i,r){let o;if(a&&!i){let t=n?a.getStandardVariantKey():a.getDefaultVariantKey();if(t===null){t=a.getId()}o=d.activateVariant({element:a,variantReference:t}).then(function(){return n||a.getDefaultVariantKey()===a.getStandardVariantKey()})}else{o=Promise.resolve(true)}return o.then(a=>{if(a){return this._fnApplyConditions(t,e,r)}})},_fnClearStateBeforexAppNav:async function(e){return await g.retrieveExternalState(e).then(t=>{const e=t.filter;for(const t in e){if(t!=="$editState"&&t!=="$search"){e[t][0]["filtered"]=false}}return Promise.resolve(e)}).catch(function(e){t.error("Error while retrieving the external state",e)})},_fnApplyConditions:async function(t,a,i){const l={},c=[],d=function(t){t.validated=f.Validated;if(t.operator==="Empty"){t.operator="EQ";t.values=[""]}else if(t.operator==="NotEmpty"){t.operator="NE";t.values=[""]}delete t.isEmpty};const h=function(t,a){const i=n.getEntitySetPath(a),o=t.getModel().getMetaModel(),l=e.getFilterRestrictionsByPath(i,o),c=l.NonFilterableProperties,d=s.getConvertedFilterFields(t,a),f=[];Object.keys(d).forEach(function(t){const e=d[t];const a=e.conditionPath.replace(_,"");if(c.indexOf(a)===-1){const t=e.annotationPath;const a=o.createBindingContext(t);f.push({path:e.conditionPath,hiddenFilter:e.availability==="Hidden",hasValueHelp:!t?false:r.hasValueHelp(a.getObject(),{context:a})})}});return f};return t.waitForInitialization().then(async()=>{const e=o.getCustomData(t,"entityType");if(!i){const e=await this._fnClearStateBeforexAppNav(t);await g.applyExternalState(t,{filter:e,items:c})}const n=h(t,e);n.filter(function(t){return t.path!=="$editState"&&t.path!=="$search"}).forEach(function(t){if(t.path in a){l[t.path]=a[t.path];if(!t.hiddenFilter){c.push({name:t.path})}if(t.hasValueHelp){l[t.path].forEach(d)}else{l[t.path].forEach(function(t){t.validated=t.filtered?f.NotValidated:t.validated})}}else{l[t.path]=[]}});return g.applyExternalState(t,{filter:l,items:c})})}};return y},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/view/fragments/MultipleMode-dbg.fragment", ["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime"], function (BuildingBlock, BuildingBlockRuntime) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MultipleMode = (_dec = defineBuildingBlock({
    name: "MultipleMode",
    namespace: "sap.fe.templates.ListReport.view.fragments",
    isOpen: true
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(MultipleMode, _BuildingBlockBase);
    function MultipleMode() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "converterContext", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = MultipleMode;
    var _proto = MultipleMode.prototype;
    _proto.getInnerControlsAPI = function getInnerControlsAPI() {
      var _this$converterContex;
      return ((_this$converterContex = this.converterContext) === null || _this$converterContex === void 0 ? void 0 : _this$converterContex.views.reduce((innerControls, view) => {
        const innerControlId = view.tableControlId || view.chartControlId;
        if (innerControlId) {
          innerControls.push(`${innerControlId}::${view.tableControlId ? "Table" : "Chart"}`);
        }
        return innerControls;
      }, []).join(",")) || "";
    };
    _proto.getTemplate = function getTemplate() {
      var _this$converterContex2, _this$converterContex3, _this$converterContex4;
      return xml`
			<fe:MultipleModeControl
				xmlns="sap.m"
				xmlns:fe="sap.fe.templates.ListReport.controls"
				xmlns:core="sap.ui.core"
				xmlns:macro="sap.fe.macros"
				innerControls="${this.getInnerControlsAPI()}"
				filterControl="${this.converterContext.filterBarId}"
				showCounts="${(_this$converterContex2 = this.converterContext.multiViewsControl) === null || _this$converterContex2 === void 0 ? void 0 : _this$converterContex2.showTabCounts}"
				freezeContent="${!!this.converterContext.filterBarId}"
				id="${(_this$converterContex3 = this.converterContext.multiViewsControl) === null || _this$converterContex3 === void 0 ? void 0 : _this$converterContex3.id}::Control"
			>
				<IconTabBar
				core:require="{
					MULTICONTROL: 'sap/fe/templates/ListReport/controls/MultipleModeControl'
				}"
					expandable="false"
					headerMode="Inline"
					id="${(_this$converterContex4 = this.converterContext.multiViewsControl) === null || _this$converterContex4 === void 0 ? void 0 : _this$converterContex4.id}"
					stretchContentHeight="true"
					select="MULTICONTROL.handleTabChange($event)"
				>
					<items>
					${this.converterContext.views.map((view, viewIdx) => {
        return `<template:with path="converterContext>views/${viewIdx}/" var="view"
										template:require="{
											ID: 'sap/fe/core/helpers/StableIdHelper'
										}"
										xmlns:core="sap.ui.core"
										xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">
								<template:with path="view>presentation" var="presentationContext">
								<IconTabFilter
									text="${view.title}"
									key="{= ID.generate([\${view>tableControlId} || \${view>customTabId} || \${view>chartControlId}])}"
									visible="{view>visible}"
								>
									<content>
										<template:if test="{= \${view>type} === 'Custom'}">
											<template:then>
												<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CustomView" type="XML" />
											</template:then>
											<template:else>
												<MessageStrip
													text="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/title} ) }' }"
													type="Information"
													showIcon="true"
													showCloseButton="true"
													class="sapUiTinyMargin"
													visible="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/fields} || []).length>0 }' }"
												>
												</MessageStrip>
												<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CollectionVisualization" type="XML" />
											</template:else>
										</template:if>
									</content>
								</IconTabFilter>
							</template:with></template:with>`;
      }).join("")}
					</items>
				</IconTabBar>
			</fe:MultipleModeControl>`;
    };
    return MultipleMode;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "converterContext", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = MultipleMode;
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ListReport/view/fragments/MultipleMode.fragment", ["sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/buildingBlocks/BuildingBlockRuntime"],function(t,e){"use strict";var n,r,i,o,l;var a={};var s=e.xml;var c=t.defineBuildingBlock;var u=t.BuildingBlockBase;var p=t.blockAttribute;function f(t,e,n,r){if(!n)return;Object.defineProperty(t,e,{enumerable:n.enumerable,configurable:n.configurable,writable:n.writable,value:n.initializer?n.initializer.call(r):void 0})}function v(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function d(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;m(t,e)}function m(t,e){m=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,n){e.__proto__=n;return e};return m(t,e)}function b(t,e,n,r,i){var o={};Object.keys(r).forEach(function(t){o[t]=r[t]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=n.slice().reverse().reduce(function(n,r){return r(t,e,n)||n},o);if(i&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(i):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(t,e,o);o=null}return o}function h(t,e){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let C=(n=c({name:"MultipleMode",namespace:"sap.fe.templates.ListReport.view.fragments",isOpen:true}),r=p({type:"sap.ui.model.Context"}),n(i=(o=function(t){d(e,t);function e(){var e;for(var n=arguments.length,r=new Array(n),i=0;i<n;i++){r[i]=arguments[i]}e=t.call(this,...r)||this;f(e,"converterContext",l,v(e));return e}a=e;var n=e.prototype;n.getInnerControlsAPI=function t(){var e;return((e=this.converterContext)===null||e===void 0?void 0:e.views.reduce((t,e)=>{const n=e.tableControlId||e.chartControlId;if(n){t.push(`${n}::${e.tableControlId?"Table":"Chart"}`)}return t},[]).join(","))||""};n.getTemplate=function t(){var e,n,r;return s`
			<fe:MultipleModeControl
				xmlns="sap.m"
				xmlns:fe="sap.fe.templates.ListReport.controls"
				xmlns:core="sap.ui.core"
				xmlns:macro="sap.fe.macros"
				innerControls="${this.getInnerControlsAPI()}"
				filterControl="${this.converterContext.filterBarId}"
				showCounts="${(e=this.converterContext.multiViewsControl)===null||e===void 0?void 0:e.showTabCounts}"
				freezeContent="${!!this.converterContext.filterBarId}"
				id="${(n=this.converterContext.multiViewsControl)===null||n===void 0?void 0:n.id}::Control"
			>
				<IconTabBar
				core:require="{
					MULTICONTROL: 'sap/fe/templates/ListReport/controls/MultipleModeControl'
				}"
					expandable="false"
					headerMode="Inline"
					id="${(r=this.converterContext.multiViewsControl)===null||r===void 0?void 0:r.id}"
					stretchContentHeight="true"
					select="MULTICONTROL.handleTabChange($event)"
				>
					<items>
					${this.converterContext.views.map((t,e)=>`<template:with path="converterContext>views/${e}/" var="view"\n\t\t\t\t\t\t\t\t\t\ttemplate:require="{\n\t\t\t\t\t\t\t\t\t\t\tID: 'sap/fe/core/helpers/StableIdHelper'\n\t\t\t\t\t\t\t\t\t\t}"\n\t\t\t\t\t\t\t\t\t\txmlns:core="sap.ui.core"\n\t\t\t\t\t\t\t\t\t\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">\n\t\t\t\t\t\t\t\t<template:with path="view>presentation" var="presentationContext">\n\t\t\t\t\t\t\t\t<IconTabFilter\n\t\t\t\t\t\t\t\t\ttext="${t.title}"\n\t\t\t\t\t\t\t\t\tkey="{= ID.generate([\${view>tableControlId} || \${view>customTabId} || \${view>chartControlId}])}"\n\t\t\t\t\t\t\t\t\tvisible="{view>visible}"\n\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t<content>\n\t\t\t\t\t\t\t\t\t\t<template:if test="{= \${view>type} === 'Custom'}">\n\t\t\t\t\t\t\t\t\t\t\t<template:then>\n\t\t\t\t\t\t\t\t\t\t\t\t<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CustomView" type="XML" />\n\t\t\t\t\t\t\t\t\t\t\t</template:then>\n\t\t\t\t\t\t\t\t\t\t\t<template:else>\n\t\t\t\t\t\t\t\t\t\t\t\t<MessageStrip\n\t\t\t\t\t\t\t\t\t\t\t\t\ttext="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/title} ) }' }"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="Information"\n\t\t\t\t\t\t\t\t\t\t\t\t\tshowIcon="true"\n\t\t\t\t\t\t\t\t\t\t\t\t\tshowCloseButton="true"\n\t\t\t\t\t\t\t\t\t\t\t\t\tclass="sapUiTinyMargin"\n\t\t\t\t\t\t\t\t\t\t\t\t\tvisible="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/fields} || []).length>0 }' }"\n\t\t\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t\t</MessageStrip>\n\t\t\t\t\t\t\t\t\t\t\t\t<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CollectionVisualization" type="XML" />\n\t\t\t\t\t\t\t\t\t\t\t</template:else>\n\t\t\t\t\t\t\t\t\t\t</template:if>\n\t\t\t\t\t\t\t\t\t</content>\n\t\t\t\t\t\t\t\t</IconTabFilter>\n\t\t\t\t\t\t\t</template:with></template:with>`).join("")}
					</items>
				</IconTabBar>
			</fe:MultipleModeControl>`};return e}(u),l=b(o.prototype,"converterContext",[r],{configurable:true,enumerable:true,writable:true,initializer:null}),o))||i);a=C;return a},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/Component-dbg", ["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/library", "sap/fe/core/TemplateComponent", "sap/fe/templates/library", "sap/fe/templates/ObjectPage/ExtendPageDefinition", "sap/ui/model/odata/v4/ODataListBinding"], function (Log, CommonUtils, ClassSupport, CoreLibrary, TemplateComponent, templateLib, ExtendPageDefinition, ODataListBinding) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var extendObjectPageDefinition = ExtendPageDefinition.extendObjectPageDefinition;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const VariantManagement = CoreLibrary.VariantManagement,
    CreationMode = CoreLibrary.CreationMode;
  const SectionLayout = templateLib.ObjectPage.SectionLayout;
  let ObjectPageComponent = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.Component", {
    library: "sap.fe.templates",
    manifest: "json"
  }), _dec2 = property({
    type: "sap.fe.core.VariantManagement",
    defaultValue: VariantManagement.Control
  }), _dec3 = property({
    type: "sap.fe.templates.ObjectPage.SectionLayout",
    defaultValue: SectionLayout.Page
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "object"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "boolean",
    defaultValue: true
  }), _dec8 = property({
    type: "object"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_TemplateComponent) {
    _inheritsLoose(ObjectPageComponent, _TemplateComponent);
    function ObjectPageComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _TemplateComponent.call(this, ...args) || this;
      _initializerDefineProperty(_this, "variantManagement", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "sectionLayout", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showRelatedApps", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "additionalSemanticObjects", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editableHeaderContent", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showBreadCrumbs", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "inboundParameters", _descriptor7, _assertThisInitialized(_this));
      _this.DeferredContextCreated = false;
      return _this;
    }
    var _proto = ObjectPageComponent.prototype;
    _proto.isContextExpected = function isContextExpected() {
      return true;
    };
    _proto.extendPageDefinition = function extendPageDefinition(pageDefinition, converterContext) {
      return extendObjectPageDefinition(pageDefinition, converterContext);
    }

    // TODO: this should be ideally be handled by the editflow/routing without the need to have this method in the
    // object page - for now keep it here
    ;
    _proto.createDeferredContext = function createDeferredContext(sPath, oListBinding, bActionCreate) {
      if (!this.DeferredContextCreated) {
        this.DeferredContextCreated = true;
        const oParameters = {
          $$groupId: "$auto.Heroes",
          $$updateGroupId: "$auto"
        };
        // In fullscreen mode, we recreate the list binding, as we don't want to have synchronization between views
        // (it causes errors, e.g. pending changes due to creationRow)
        if (!oListBinding || oListBinding.isRelative() === false && !this.oAppComponent.getRootViewController().isFclEnabled()) {
          oListBinding = new ODataListBinding(this.getModel(), sPath.replace("(...)", ""), undefined, undefined, undefined, oParameters);
        }
        const oStartUpParams = this.oAppComponent && this.oAppComponent.getComponentData() && this.oAppComponent.getComponentData().startupParameters,
          oInboundParameters = this.getViewData().inboundParameters;
        let createParams;
        if (oStartUpParams && oStartUpParams.preferredMode && oStartUpParams.preferredMode[0].indexOf("create") !== -1) {
          createParams = CommonUtils.getAdditionalParamsForCreate(oStartUpParams, oInboundParameters);
        }

        // for now wait until the view and the controller is created
        this.getRootControl().getController().editFlow.createDocument(oListBinding, {
          creationMode: CreationMode.Sync,
          createAction: bActionCreate,
          data: createParams,
          bFromDeferred: true
        }).finally(() => {
          this.DeferredContextCreated = false;
        }).catch(function () {
          // Do Nothing ?
        });
      }
    };
    _proto.setVariantManagement = function setVariantManagement(sVariantManagement) {
      if (sVariantManagement === VariantManagement.Page) {
        Log.error("ObjectPage does not support Page-level variant management yet");
        sVariantManagement = VariantManagement.None;
      }
      this.setProperty("variantManagement", sVariantManagement);
    };
    return ObjectPageComponent;
  }(TemplateComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "sectionLayout", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "showRelatedApps", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "additionalSemanticObjects", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "editableHeaderContent", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showBreadCrumbs", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "inboundParameters", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ObjectPageComponent;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/Component", ["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/helpers/ClassSupport","sap/fe/core/library","sap/fe/core/TemplateComponent","sap/fe/templates/library","sap/fe/templates/ObjectPage/ExtendPageDefinition","sap/ui/model/odata/v4/ODataListBinding"],function(e,t,r,a,n,i,o,l){"use strict";var u,s,p,c,f,d,b,m,g,y,C,h,v,w,P,O,j;var z=o.extendObjectPageDefinition;var D=r.property;var x=r.defineUI5Class;function M(e,t,r,a){if(!r)return;Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(a):void 0})}function V(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function A(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;E(e,t)}function E(e,t){E=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return E(e,t)}function L(e,t,r,a,n){var i={};Object.keys(a).forEach(function(e){i[e]=a[e]});i.enumerable=!!i.enumerable;i.configurable=!!i.configurable;if("value"in i||i.initializer){i.writable=true}i=r.slice().reverse().reduce(function(r,a){return a(e,t,r)||r},i);if(n&&i.initializer!==void 0){i.value=i.initializer?i.initializer.call(n):void 0;i.initializer=undefined}if(i.initializer===void 0){Object.defineProperty(e,t,i);i=null}return i}function R(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}const S=a.VariantManagement,$=a.CreationMode;const F=i.ObjectPage.SectionLayout;let _=(u=x("sap.fe.templates.ObjectPage.Component",{library:"sap.fe.templates",manifest:"json"}),s=D({type:"sap.fe.core.VariantManagement",defaultValue:S.Control}),p=D({type:"sap.fe.templates.ObjectPage.SectionLayout",defaultValue:F.Page}),c=D({type:"boolean",defaultValue:false}),f=D({type:"object"}),d=D({type:"boolean",defaultValue:true}),b=D({type:"boolean",defaultValue:true}),m=D({type:"object"}),u(g=(y=function(r){A(a,r);function a(){var e;for(var t=arguments.length,a=new Array(t),n=0;n<t;n++){a[n]=arguments[n]}e=r.call(this,...a)||this;M(e,"variantManagement",C,V(e));M(e,"sectionLayout",h,V(e));M(e,"showRelatedApps",v,V(e));M(e,"additionalSemanticObjects",w,V(e));M(e,"editableHeaderContent",P,V(e));M(e,"showBreadCrumbs",O,V(e));M(e,"inboundParameters",j,V(e));e.DeferredContextCreated=false;return e}var n=a.prototype;n.isContextExpected=function e(){return true};n.extendPageDefinition=function e(t,r){return z(t,r)};n.createDeferredContext=function e(r,a,n){if(!this.DeferredContextCreated){this.DeferredContextCreated=true;const e={$$groupId:"$auto.Heroes",$$updateGroupId:"$auto"};if(!a||a.isRelative()===false&&!this.oAppComponent.getRootViewController().isFclEnabled()){a=new l(this.getModel(),r.replace("(...)",""),undefined,undefined,undefined,e)}const i=this.oAppComponent&&this.oAppComponent.getComponentData()&&this.oAppComponent.getComponentData().startupParameters,o=this.getViewData().inboundParameters;let u;if(i&&i.preferredMode&&i.preferredMode[0].indexOf("create")!==-1){u=t.getAdditionalParamsForCreate(i,o)}this.getRootControl().getController().editFlow.createDocument(a,{creationMode:$.Sync,createAction:n,data:u,bFromDeferred:true}).finally(()=>{this.DeferredContextCreated=false}).catch(function(){})}};n.setVariantManagement=function t(r){if(r===S.Page){e.error("ObjectPage does not support Page-level variant management yet");r=S.None}this.setProperty("variantManagement",r)};return a}(n),C=L(y.prototype,"variantManagement",[s],{configurable:true,enumerable:true,writable:true,initializer:null}),h=L(y.prototype,"sectionLayout",[p],{configurable:true,enumerable:true,writable:true,initializer:null}),v=L(y.prototype,"showRelatedApps",[c],{configurable:true,enumerable:true,writable:true,initializer:null}),w=L(y.prototype,"additionalSemanticObjects",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),P=L(y.prototype,"editableHeaderContent",[d],{configurable:true,enumerable:true,writable:true,initializer:null}),O=L(y.prototype,"showBreadCrumbs",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),j=L(y.prototype,"inboundParameters",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),y))||g);return _},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/ExtendPageDefinition-dbg", ["sap/fe/templates/ObjectPage/ObjectPageTemplating"], function (ObjectPageTemplating) {
  "use strict";

  var _exports = {};
  var getPressExpressionForPrimaryAction = ObjectPageTemplating.getPressExpressionForPrimaryAction;
  var getEditCommandExecutionVisible = ObjectPageTemplating.getEditCommandExecutionVisible;
  var getEditCommandExecutionEnabled = ObjectPageTemplating.getEditCommandExecutionEnabled;
  const extendObjectPageDefinition = function (pageDefinition, converterContext) {
    const convertedPageDefinition = pageDefinition;
    convertedPageDefinition.primaryAction = getPrimaryAction(converterContext, pageDefinition.header.actions, pageDefinition.footerActions);
    return convertedPageDefinition;
  };

  /**
   * Method to get the expression for the execute event of the forward action.
   * Generates primaryActionExpression to be executed on the keyboard shortcut Ctrl+Enter with the
   * forward flow (priority is the semantic positive action OR if that's not there, then the primary action).
   *
   * @param converterContext The converter context
   * @param headerActions An array containing all the actions for this ObjectPage header
   * @param footerActions An array containing all the actions for this ObjectPage footer
   * @returns  Binding expression or function string
   */
  _exports.extendObjectPageDefinition = extendObjectPageDefinition;
  const getPrimaryAction = function (converterContext, headerActions, footerActions) {
    let primaryActionExpression = "";
    const aActions = [...headerActions, ...footerActions];
    const getBindingExp = function (sExpression) {
      if (sExpression && sExpression.indexOf("{=") > -1) {
        return sExpression.replace("{=", "(").slice(0, -1) + ")";
      }
      return sExpression;
    };
    const aSemanticPositiveActions = aActions.filter(oAction => {
      if (oAction !== null && oAction !== void 0 && oAction.annotationPath) {
        const targetObject = converterContext.getConverterContextFor(oAction === null || oAction === void 0 ? void 0 : oAction.annotationPath).getDataModelObjectPath().targetObject;
        if (targetObject !== null && targetObject !== void 0 && targetObject.Criticality && (targetObject === null || targetObject === void 0 ? void 0 : targetObject.Criticality) === "UI.CriticalityType/Positive") {
          return true;
        }
      }
    });
    const oEntitySet = converterContext.getEntitySet();
    if (aSemanticPositiveActions.length > 0) {
      primaryActionExpression = getPressExpressionForPrimaryAction(aSemanticPositiveActions[0].annotationPath && converterContext.getConverterContextFor(aSemanticPositiveActions[0].annotationPath).getDataModelObjectPath().targetObject, oEntitySet === null || oEntitySet === void 0 ? void 0 : oEntitySet.name, aSemanticPositiveActions[0], getBindingExp(aSemanticPositiveActions[0].visible ?? "true"), getBindingExp(aSemanticPositiveActions[0].enabled ?? "true"), getBindingExp(getEditCommandExecutionVisible(headerActions)), getBindingExp(getEditCommandExecutionEnabled(headerActions)));
    } else {
      primaryActionExpression = getPressExpressionForPrimaryAction(null, oEntitySet === null || oEntitySet === void 0 ? void 0 : oEntitySet.name, null, "false", "false", getBindingExp(getEditCommandExecutionVisible(headerActions)), getBindingExp(getEditCommandExecutionEnabled(headerActions)));
    }
    return primaryActionExpression;
  };
  _exports.getPrimaryAction = getPrimaryAction;
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/ExtendPageDefinition", ["sap/fe/templates/ObjectPage/ObjectPageTemplating"],function(t){"use strict";var e={};var n=t.getPressExpressionForPrimaryAction;var i=t.getEditCommandExecutionVisible;var o=t.getEditCommandExecutionEnabled;const a=function(t,e){const n=t;n.primaryAction=r(e,t.header.actions,t.footerActions);return n};e.extendObjectPageDefinition=a;const r=function(t,e,a){let r="";const l=[...e,...a];const c=function(t){if(t&&t.indexOf("{=")>-1){return t.replace("{=","(").slice(0,-1)+")"}return t};const s=l.filter(e=>{if(e!==null&&e!==void 0&&e.annotationPath){const n=t.getConverterContextFor(e===null||e===void 0?void 0:e.annotationPath).getDataModelObjectPath().targetObject;if(n!==null&&n!==void 0&&n.Criticality&&(n===null||n===void 0?void 0:n.Criticality)==="UI.CriticalityType/Positive"){return true}}});const u=t.getEntitySet();if(s.length>0){r=n(s[0].annotationPath&&t.getConverterContextFor(s[0].annotationPath).getDataModelObjectPath().targetObject,u===null||u===void 0?void 0:u.name,s[0],c(s[0].visible??"true"),c(s[0].enabled??"true"),c(i(e)),c(o(e)))}else{r=n(null,u===null||u===void 0?void 0:u.name,null,"false","false",c(i(e)),c(o(e)))}return r};e.getPrimaryAction=r;return e},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/ExtensionAPI-dbg", ["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/ID", "sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/InvisibleMessage", "sap/ui/core/library", "sap/ui/core/message/Message"], function (Log, CommonUtils, ID, ExtensionAPI, ClassSupport, InvisibleMessage, library, Message) {
  "use strict";

  var _dec, _class;
  var MessageType = library.MessageType;
  var InvisibleMessageMode = library.InvisibleMessageMode;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var getSideContentLayoutID = ID.getSideContentLayoutID;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Extension API for object pages on SAP Fiori elements for OData V4.
   *
   * @alias sap.fe.templates.ObjectPage.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  let ObjectPageExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ObjectPageExtensionAPI, _ExtensionAPI);
    function ObjectPageExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ObjectPageExtensionAPI.prototype;
    /**
     * Refreshes either the whole object page or only parts of it.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#refresh
     * @param [vPath] Path or array of paths referring to entities or properties to be refreshed.
     * If omitted, the whole object page is refreshed. The path "" refreshes the entity assigned to the object page
     * without navigations
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh(vPath) {
      const oBindingContext = this._view.getBindingContext();
      if (!oBindingContext) {
        // nothing to be refreshed - do not block the app!
        return Promise.resolve();
      }
      const oAppComponent = CommonUtils.getAppComponent(this._view),
        oSideEffectsService = oAppComponent.getSideEffectsService(),
        oMetaModel = oBindingContext.getModel().getMetaModel(),
        oSideEffects = {
          TargetProperties: [],
          TargetEntities: []
        };
      let aPaths, sPath, sBaseEntitySet, sKind;
      if (vPath === undefined || vPath === null) {
        // we just add an empty path which should refresh the page with all dependent bindings
        oSideEffects.TargetEntities.push({
          $NavigationPropertyPath: ""
        });
      } else {
        aPaths = Array.isArray(vPath) ? vPath : [vPath];
        sBaseEntitySet = this._controller.getOwnerComponent().getEntitySet();
        for (let i = 0; i < aPaths.length; i++) {
          sPath = aPaths[i];
          if (sPath === "") {
            // an empty path shall refresh the entity without dependencies which means * for the model
            oSideEffects.TargetProperties.push({
              $PropertyPath: "*"
            });
          } else {
            sKind = oMetaModel.getObject(`/${sBaseEntitySet}/${sPath}/$kind`);
            if (sKind === "NavigationProperty") {
              oSideEffects.TargetEntities.push({
                $NavigationPropertyPath: sPath
              });
            } else if (sKind) {
              oSideEffects.TargetProperties.push({
                $PropertyPath: sPath
              });
            } else {
              return Promise.reject(`${sPath} is not a valid path to be refreshed`);
            }
          }
        }
      }
      return oSideEffectsService.requestSideEffects(oSideEffects.TargetEntities.concat(oSideEffects.TargetProperties), oBindingContext);
    }

    /**
     * Gets the list entries currently selected for the table.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getSelectedContexts
     * @param sTableId The ID identifying the table the selected context is requested for
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts(sTableId) {
      let oTable = this._view.byId(sTableId);
      if (oTable && oTable.isA("sap.fe.macros.table.TableAPI")) {
        oTable = oTable.getContent();
      }
      return oTable && oTable.isA("sap.ui.mdc.Table") && oTable.getSelectedContexts() || [];
    }

    /**
     * Displays or hides the side content of an object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showSideContent
     * @param sSubSectionKey Key of the side content fragment as defined in the manifest.json
     * @param [bShow] Optional Boolean flag to show or hide the side content
     * @public
     */;
    _proto.showSideContent = function showSideContent(sSubSectionKey, bShow) {
      const sBlockID = getSideContentLayoutID(sSubSectionKey),
        oBlock = this._view.byId(sBlockID),
        bBlockState = bShow === undefined ? !oBlock.getShowSideContent() : bShow;
      oBlock.setShowSideContent(bBlockState, false);
    }

    /**
     * Gets the bound context of the current object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getBindingContext
     * @returns Context bound to the object page
     * @public
     */;
    _proto.getBindingContext = function getBindingContext() {
      return this._view.getBindingContext();
    }

    /**
     * Build a message to be displayed below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#_buildOPMessage
     * @param {sap.ui.core.message.Message[]} messages Array of messages used to generated the message
     * @returns {Promise<Message>} Promise containing the generated message
     * @private
     */;
    _proto._buildOPMessage = async function _buildOPMessage(messages) {
      const view = this._view;
      const resourceBundle = await view.getModel("sap.fe.i18n").getResourceBundle();
      let message = null;
      switch (messages.length) {
        case 0:
          break;
        case 1:
          message = messages[0];
          break;
        default:
          const messageStats = {
            Error: {
              id: 2,
              count: 0
            },
            Warning: {
              id: 1,
              count: 0
            },
            Information: {
              id: 0,
              count: 0
            }
          };
          message = messages.reduce((acc, currentValue) => {
            const currentType = currentValue.getType();
            acc.setType(messageStats[currentType].id > messageStats[acc.getType()].id ? currentType : acc.getType());
            messageStats[currentType].count++;
            return acc;
          }, new Message({
            type: MessageType.Information
          }));
          if (messageStats.Error.count === 0 && messageStats.Warning.count === 0 && messageStats.Information.count > 0) {
            message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_INFORMATION"));
          } else if (messageStats.Error.count > 0 && messageStats.Warning.count > 0 || messageStats.Information.count > 0) {
            message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_ISSUE"));
          } else {
            message.setMessage(resourceBundle.getText(message.getType() === MessageType.Error ? "OBJECTPAGESTATE_ERROR" : "OBJECTPAGESTATE_WARNING"));
          }
      }
      return message;
    }

    /**
     * Displays the message strip between the title and the header of the ObjectPage.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showMessages
     * @param {sap.ui.core.message.Message} messages The message to be displayed
     * @public
     */;
    _proto.showMessages = async function showMessages(messages) {
      const view = this._view;
      const internalModelContext = view.getBindingContext("internal");
      try {
        const message = await this._buildOPMessage(messages);
        if (message) {
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", true);
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripText", message.getMessage());
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripType", message.getType());
          InvisibleMessage.getInstance().announce(message.getMessage(), InvisibleMessageMode.Assertive);
        } else {
          this.hideMessage();
        }
      } catch (err) {
        Log.error("Cannot display ObjectPage message");
      }
    }

    /**
     * Hides the message strip below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#hideMessage
     * @public
     */;
    _proto.hideMessage = function hideMessage() {
      const view = this._view;
      const internalModelContext = view.getBindingContext("internal");
      internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", false);
    };
    return ObjectPageExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ObjectPageExtensionAPI;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/ExtensionAPI", ["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/converters/helpers/ID","sap/fe/core/ExtensionAPI","sap/fe/core/helpers/ClassSupport","sap/ui/core/InvisibleMessage","sap/ui/core/library","sap/ui/core/message/Message"],function(e,t,n,s,i,r,o,a){"use strict";var c,g;var p=o.MessageType;var u=o.InvisibleMessageMode;var l=i.defineUI5Class;var d=n.getSideContentLayoutID;function f(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;y(e,t)}function y(e,t){y=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,n){t.__proto__=n;return t};return y(e,t)}let h=(c=l("sap.fe.templates.ObjectPage.ExtensionAPI"),c(g=function(n){f(s,n);function s(){return n.apply(this,arguments)||this}var i=s.prototype;i.refresh=function e(n){const s=this._view.getBindingContext();if(!s){return Promise.resolve()}const i=t.getAppComponent(this._view),r=i.getSideEffectsService(),o=s.getModel().getMetaModel(),a={TargetProperties:[],TargetEntities:[]};let c,g,p,u;if(n===undefined||n===null){a.TargetEntities.push({$NavigationPropertyPath:""})}else{c=Array.isArray(n)?n:[n];p=this._controller.getOwnerComponent().getEntitySet();for(let e=0;e<c.length;e++){g=c[e];if(g===""){a.TargetProperties.push({$PropertyPath:"*"})}else{u=o.getObject(`/${p}/${g}/$kind`);if(u==="NavigationProperty"){a.TargetEntities.push({$NavigationPropertyPath:g})}else if(u){a.TargetProperties.push({$PropertyPath:g})}else{return Promise.reject(`${g} is not a valid path to be refreshed`)}}}}return r.requestSideEffects(a.TargetEntities.concat(a.TargetProperties),s)};i.getSelectedContexts=function e(t){let n=this._view.byId(t);if(n&&n.isA("sap.fe.macros.table.TableAPI")){n=n.getContent()}return n&&n.isA("sap.ui.mdc.Table")&&n.getSelectedContexts()||[]};i.showSideContent=function e(t,n){const s=d(t),i=this._view.byId(s),r=n===undefined?!i.getShowSideContent():n;i.setShowSideContent(r,false)};i.getBindingContext=function e(){return this._view.getBindingContext()};i._buildOPMessage=async function e(t){const n=this._view;const s=await n.getModel("sap.fe.i18n").getResourceBundle();let i=null;switch(t.length){case 0:break;case 1:i=t[0];break;default:const e={Error:{id:2,count:0},Warning:{id:1,count:0},Information:{id:0,count:0}};i=t.reduce((t,n)=>{const s=n.getType();t.setType(e[s].id>e[t.getType()].id?s:t.getType());e[s].count++;return t},new a({type:p.Information}));if(e.Error.count===0&&e.Warning.count===0&&e.Information.count>0){i.setMessage(s.getText("OBJECTPAGESTATE_INFORMATION"))}else if(e.Error.count>0&&e.Warning.count>0||e.Information.count>0){i.setMessage(s.getText("OBJECTPAGESTATE_ISSUE"))}else{i.setMessage(s.getText(i.getType()===p.Error?"OBJECTPAGESTATE_ERROR":"OBJECTPAGESTATE_WARNING"))}}return i};i.showMessages=async function t(n){const s=this._view;const i=s.getBindingContext("internal");try{const e=await this._buildOPMessage(n);if(e){i===null||i===void 0?void 0:i.setProperty("OPMessageStripVisibility",true);i===null||i===void 0?void 0:i.setProperty("OPMessageStripText",e.getMessage());i===null||i===void 0?void 0:i.setProperty("OPMessageStripType",e.getType());r.getInstance().announce(e.getMessage(),u.Assertive)}else{this.hideMessage()}}catch(t){e.error("Cannot display ObjectPage message")}};i.hideMessage=function e(){const t=this._view;const n=t.getBindingContext("internal");n===null||n===void 0?void 0:n.setProperty("OPMessageStripVisibility",false)};return s}(s))||g);return h},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/ObjectPageController-dbg.controller", ["sap/base/Log", "sap/base/util/merge", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/Manage", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/MessageHandler", "sap/fe/core/controllerextensions/PageReady", "sap/fe/core/controllerextensions/Paginator", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/PageController", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/Utils", "sap/fe/navigation/SelectionVariant", "sap/fe/templates/ObjectPage/ExtensionAPI", "sap/fe/templates/TableScroller", "sap/m/InstanceManager", "sap/m/Link", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/odata/v4/ODataListBinding", "./overrides/IntentBasedNavigation", "./overrides/InternalRouting", "./overrides/MessageHandler", "./overrides/Paginator", "./overrides/Share", "./overrides/ViewState"], function (Log, merge, ActionRuntime, CommonUtils, BusyLocker, ActivitySync, Manage, draft, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, MassEdit, MessageHandler, PageReady, Paginator, Placeholder, Share, ViewState, ClassSupport, ModelHelper, PageController, CommonHelper, DelegateUtil, TableUtils, SelectionVariant, ExtensionAPI, TableScroller, InstanceManager, Link, MessageBox, Core, OverrideExecution, ODataListBinding, IntentBasedNavigationOverride, InternalRoutingOverride, MessageHandlerOverride, PaginatorOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var showUserDetails = Manage.showUserDetails;
  var openManageDialog = Manage.openManageDialog;
  var isConnected = ActivitySync.isConnected;
  var disconnect = ActivitySync.disconnect;
  var connect = ActivitySync.connect;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ObjectPageController = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ObjectPageController"), _dec2 = usingExtension(Placeholder), _dec3 = usingExtension(Share.override(ShareOverrides)), _dec4 = usingExtension(InternalRouting.override(InternalRoutingOverride)), _dec5 = usingExtension(Paginator.override(PaginatorOverride)), _dec6 = usingExtension(MessageHandler.override(MessageHandlerOverride)), _dec7 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec8 = usingExtension(InternalIntentBasedNavigation.override({
    getNavigationMode: function () {
      const bIsStickyEditMode = this.getView().getController().getStickyEditMode && this.getView().getController().getStickyEditMode();
      return bIsStickyEditMode ? "explace" : undefined;
    }
  })), _dec9 = usingExtension(ViewState.override(ViewStateOverrides)), _dec10 = usingExtension(PageReady.override({
    isContextExpected: function () {
      return true;
    }
  })), _dec11 = usingExtension(MassEdit), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ObjectPageController, _PageController);
    function ObjectPageController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "placeholder", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_routing", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "paginator", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pageReady", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor10, _assertThisInitialized(_this));
      _this.handlers = {
        /**
         * Invokes the page primary action on press of Ctrl+Enter.
         *
         * @param oController The page controller
         * @param oView
         * @param oContext Context for which the action is called
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @param [mConditions] Contains the following attributes:
         * @param [mConditions.positiveActionVisible] The visibility of sematic positive action
         * @param [mConditions.positiveActionEnabled] The enablement of semantic positive action
         * @param [mConditions.editActionVisible] The Edit button visibility
         * @param [mConditions.editActionEnabled] The enablement of Edit button
         * @ui5-restricted
         * @final
         */
        onPrimaryAction(oController, oView, oContext, sActionName, mParameters, mConditions) {
          const iViewLevel = oController.getView().getViewData().viewLevel,
            oObjectPage = oController._getObjectPageLayoutControl();
          if (mConditions.positiveActionVisible) {
            if (mConditions.positiveActionEnabled) {
              oController.handlers.onCallAction(oView, sActionName, mParameters);
            }
          } else if (mConditions.editActionVisible) {
            if (mConditions.editActionEnabled) {
              oController._editDocument(oContext);
            }
          } else if (iViewLevel === 1 && oObjectPage.getModel("ui").getProperty("/isEditable")) {
            oController._saveDocument(oContext);
          } else if (oObjectPage.getModel("ui").getProperty("/isEditable")) {
            oController._applyDocument(oContext);
          }
        },
        onTableContextChange(oEvent) {
          const oSource = oEvent.getSource();
          let oTable;
          this._findTables().some(function (_oTable) {
            if (_oTable.getRowBinding() === oSource) {
              oTable = _oTable;
              return true;
            }
            return false;
          });
          const oCurrentActionPromise = this._editFlow.getCurrentActionPromise();
          if (oCurrentActionPromise) {
            let aTableContexts;
            if (oTable.getType().getMetadata().isA("sap.ui.mdc.table.GridTableType")) {
              aTableContexts = oSource.getContexts(0);
            } else {
              aTableContexts = oSource.getCurrentContexts();
            }
            //if contexts are not fully loaded the getcontexts function above will trigger a new change event call
            if (!aTableContexts[0]) {
              return;
            }
            oCurrentActionPromise.then(oActionResponse => {
              if (!oActionResponse || oActionResponse.controlId !== oTable.sId) {
                return;
              }
              const oActionData = oActionResponse.oData;
              const aKeys = oActionResponse.keys;
              let iNewItemp = -1;
              aTableContexts.find(function (oTableContext, i) {
                const oTableData = oTableContext.getObject();
                const bCompare = aKeys.every(function (sKey) {
                  return oTableData[sKey] === oActionData[sKey];
                });
                if (bCompare) {
                  iNewItemp = i;
                }
                return bCompare;
              });
              if (iNewItemp !== -1) {
                const aDialogs = InstanceManager.getOpenDialogs();
                const oDialog = aDialogs.length > 0 ? aDialogs.find(dialog => dialog.data("FullScreenDialog") !== true) : null;
                if (oDialog) {
                  // by design, a sap.m.dialog set the focus to the previous focused element when closing.
                  // we should wait for the dialog to be close before to focus another element
                  oDialog.attachEventOnce("afterClose", function () {
                    oTable.focusRow(iNewItemp, true);
                  });
                } else {
                  oTable.focusRow(iNewItemp, true);
                }
                this._editFlow.deleteCurrentActionPromise();
              }
            }).catch(function (err) {
              Log.error(`An error occurs while scrolling to the newly created Item: ${err}`);
            });
          }
          // fire ModelContextChange on the message button whenever the table context changes
          this.messageButton.fireModelContextChange();
        },
        /**
         * Invokes an action - bound/unbound and sets the page dirty.
         *
         * @param oView
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @returns The action promise
         * @ui5-restricted
         * @final
         */
        onCallAction(oView, sActionName, mParameters) {
          const oController = oView.getController();
          return oController.editFlow.invokeAction(sActionName, mParameters).then(oController._showMessagePopover.bind(oController, undefined)).catch(oController._showMessagePopover.bind(oController));
        },
        onDataPointTitlePressed(oController, oSource, oManifestOutbound, sControlConfig, sCollectionPath) {
          oManifestOutbound = typeof oManifestOutbound === "string" ? JSON.parse(oManifestOutbound) : oManifestOutbound;
          const oTargetInfo = oManifestOutbound[sControlConfig],
            aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oTargetInfo),
            oDataPointOrChartBindingContext = oSource.getBindingContext(),
            sMetaPath = oDataPointOrChartBindingContext.getModel().getMetaModel().getMetaPath(oDataPointOrChartBindingContext.getPath());
          let aNavigationData = oController._getChartContextData(oDataPointOrChartBindingContext, sCollectionPath);
          let additionalNavigationParameters;
          aNavigationData = aNavigationData.map(function (oNavigationData) {
            return {
              data: oNavigationData,
              metaPath: sMetaPath + (sCollectionPath ? `/${sCollectionPath}` : "")
            };
          });
          if (oTargetInfo && oTargetInfo.parameters) {
            const oParams = oTargetInfo.parameters && oController._intentBasedNavigation.getOutboundParams(oTargetInfo.parameters);
            if (Object.keys(oParams).length > 0) {
              additionalNavigationParameters = oParams;
            }
          }
          if (oTargetInfo && oTargetInfo.semanticObject && oTargetInfo.action) {
            oController._intentBasedNavigation.navigate(oTargetInfo.semanticObject, oTargetInfo.action, {
              navigationContexts: aNavigationData,
              semanticObjectMapping: aSemanticObjectMapping,
              additionalNavigationParameters: additionalNavigationParameters
            });
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onNavigateChange(oEvent) {
          //will be called always when we click on a section tab
          this.getExtensionAPI().updateAppState();
          this.bSectionNavigated = true;
          const oInternalModelContext = this.getView().getBindingContext("internal");
          const oObjectPage = this._getObjectPageLayoutControl();
          if (oObjectPage.getModel("ui").getProperty("/isEditable") && this.getView().getViewData().sectionLayout === "Tabs" && oInternalModelContext.getProperty("errorNavigationSectionFlag") === false) {
            const oSubSection = oEvent.getParameter("subSection");
            this._updateFocusInEditMode([oSubSection]);
          }
        },
        onVariantSelected: function () {
          this.getExtensionAPI().updateAppState();
        },
        onVariantSaved: function () {
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save
          setTimeout(() => {
            this.getExtensionAPI().updateAppState();
          }, 500);
        },
        navigateToSubSection: function (oController, vDetailConfig) {
          const oDetailConfig = typeof vDetailConfig === "string" ? JSON.parse(vDetailConfig) : vDetailConfig;
          const oObjectPage = oController.getView().byId("fe::ObjectPage");
          let oSection;
          let oSubSection;
          if (oDetailConfig.sectionId) {
            oSection = oController.getView().byId(oDetailConfig.sectionId);
            oSubSection = oDetailConfig.subSectionId ? oController.getView().byId(oDetailConfig.subSectionId) : oSection && oSection.getSubSections() && oSection.getSubSections()[0];
          } else if (oDetailConfig.subSectionId) {
            oSubSection = oController.getView().byId(oDetailConfig.subSectionId);
            oSection = oSubSection && oSubSection.getParent();
          }
          if (!oSection || !oSubSection || !oSection.getVisible() || !oSubSection.getVisible()) {
            oController.getView().getModel("sap.fe.i18n").getResourceBundle().then(function (oResourceBundle) {
              const sTitle = CommonUtils.getTranslatedText("C_ROUTING_NAVIGATION_DISABLED_TITLE", oResourceBundle, undefined, oController.getView().getViewData().entitySet);
              Log.error(sTitle);
              MessageBox.error(sTitle);
            }).catch(function (error) {
              Log.error(error);
            });
          } else {
            oObjectPage.scrollToSection(oSubSection.getId());
            // trigger iapp state change
            oObjectPage.fireNavigate({
              section: oSection,
              subSection: oSubSection
            });
          }
        },
        onStateChange() {
          this.getExtensionAPI().updateAppState();
        },
        closeOPMessageStrip: function () {
          this.getExtensionAPI().hideMessage();
        }
      };
      return _this;
    }
    var _proto = ObjectPageController.prototype;
    _proto.getExtensionAPI = function getExtensionAPI(sId) {
      if (sId) {
        // to allow local ID usage for custom pages we'll create/return own instances for custom sections
        this.mCustomSectionExtensionAPIs = this.mCustomSectionExtensionAPIs || {};
        if (!this.mCustomSectionExtensionAPIs[sId]) {
          this.mCustomSectionExtensionAPIs[sId] = new ExtensionAPI(this, sId);
        }
        return this.mCustomSectionExtensionAPIs[sId];
      } else {
        if (!this.extensionAPI) {
          this.extensionAPI = new ExtensionAPI(this);
        }
        return this.extensionAPI;
      }
    };
    _proto.onInit = function onInit() {
      _PageController.prototype.onInit.call(this);
      const oObjectPage = this._getObjectPageLayoutControl();

      // Setting defaults of internal model context
      const oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("externalNavigationContext", {
        page: true
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("relatedApps", {
        visibility: false,
        items: null
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("batchGroups", this._getBatchGroupsForView());
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      if (!this.getView().getViewData().useNewLazyLoading && oObjectPage.getEnableLazyLoading()) {
        //Attaching the event to make the subsection context binding active when it is visible.
        oObjectPage.attachEvent("subSectionEnteredViewPort", this._handleSubSectionEnteredViewPort.bind(this));
      }
      this.messageButton = this.getView().byId("fe::FooterBar::MessageButton");
      this.messageButton.oItemBinding.attachChange(this._fnShowOPMessage, this);
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("rootEditEnabled", true);
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("rootEditVisible", true);
    };
    _proto.onExit = function onExit() {
      if (this.mCustomSectionExtensionAPIs) {
        for (const sId of Object.keys(this.mCustomSectionExtensionAPIs)) {
          if (this.mCustomSectionExtensionAPIs[sId]) {
            this.mCustomSectionExtensionAPIs[sId].destroy();
          }
        }
        delete this.mCustomSectionExtensionAPIs;
      }
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
      const oMessagePopover = this.messageButton ? this.messageButton.oMessagePopover : null;
      if (oMessagePopover && oMessagePopover.isOpen()) {
        oMessagePopover.close();
      }
      //when exiting we set keepAlive context to false
      const oContext = this.getView().getBindingContext();
      if (oContext && oContext.isKeepAlive()) {
        oContext.setKeepAlive(false);
      }
      if (isConnected(this.getView())) {
        disconnect(this.getView()); // Cleanup collaboration connection when leaving the app
      }
    }

    /**
     * Method to show the message strip on the object page.
     *
     * @private
     */;
    _proto._fnShowOPMessage = function _fnShowOPMessage() {
      const extensionAPI = this.getExtensionAPI();
      const view = this.getView();
      const messages = this.messageButton.oMessagePopover.getItems().map(item => item.getBindingContext("message").getObject()).filter(message => {
        var _view$getBindingConte;
        return message.getTargets()[0] === ((_view$getBindingConte = view.getBindingContext()) === null || _view$getBindingConte === void 0 ? void 0 : _view$getBindingConte.getPath());
      });
      if (extensionAPI) {
        extensionAPI.showMessages(messages);
      }
    };
    _proto._getTableBinding = function _getTableBinding(oTable) {
      return oTable && oTable.getRowBinding();
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      var _this$oView$oViewData;
      PageController.prototype.onBeforeRendering.apply(this);
      // In the retrieveTextFromValueList scenario we need to ensure in case of reload/refresh that the meta model in the methode retrieveTextFromValueList of the FieldRuntime is available
      if ((_this$oView$oViewData = this.oView.oViewData) !== null && _this$oView$oViewData !== void 0 && _this$oView$oViewData.retrieveTextFromValueList && CommonHelper.getMetaModel() === undefined) {
        CommonHelper.setMetaModel(this.getAppComponent().getMetaModel());
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      this.getView().getModel("sap.fe.i18n").getResourceBundle().then(response => {
        this.oResourceBundle = response;
      }).catch(function (oError) {
        Log.error("Error while retrieving the resource bundle", oError);
      });
    };
    _proto._onBeforeBinding = function _onBeforeBinding(oContext, mParameters) {
      // TODO: we should check how this comes together with the transaction helper, same to the change in the afterBinding
      const aTables = this._findTables(),
        oObjectPage = this._getObjectPageLayoutControl(),
        oInternalModelContext = this.getView().getBindingContext("internal"),
        oInternalModel = this.getView().getModel("internal"),
        aBatchGroups = oInternalModelContext.getProperty("batchGroups"),
        iViewLevel = this.getView().getViewData().viewLevel;
      let oFastCreationRow;
      aBatchGroups.push("$auto");
      if (mParameters.bDraftNavigation !== true) {
        this._closeSideContent();
      }
      const opContext = oObjectPage.getBindingContext();
      if (opContext && opContext.hasPendingChanges() && !aBatchGroups.some(opContext.getModel().hasPendingChanges.bind(opContext.getModel()))) {
        /* 	In case there are pending changes for the creation row and no others we need to reset the changes
         						TODO: this is just a quick solution, this needs to be reworked
         				 	*/

        opContext.getBinding().resetChanges();
      }

      // For now we have to set the binding context to null for every fast creation row
      // TODO: Get rid of this coding or move it to another layer - to be discussed with MDC and model
      for (let i = 0; i < aTables.length; i++) {
        oFastCreationRow = aTables[i].getCreationRow();
        if (oFastCreationRow) {
          oFastCreationRow.setBindingContext(null);
        }
      }

      // Scroll to present Section so that bindings are enabled during navigation through paginator buttons, as there is no view rerendering/rebind
      const fnScrollToPresentSection = function () {
        if (!oObjectPage.isFirstRendering() && !mParameters.bPersistOPScroll) {
          oObjectPage.setSelectedSection(null);
        }
      };
      oObjectPage.attachEventOnce("modelContextChange", fnScrollToPresentSection);

      // if the structure of the ObjectPageLayout is changed then scroll to present Section
      // FIXME Is this really working as intended ? Initially this was onBeforeRendering, but never triggered onBeforeRendering because it was registered after it
      const oDelegateOnBefore = {
        onAfterRendering: fnScrollToPresentSection
      };
      oObjectPage.addEventDelegate(oDelegateOnBefore, this);
      this.pageReady.attachEventOnce("pageReady", function () {
        oObjectPage.removeEventDelegate(oDelegateOnBefore);
      });

      //Set the Binding for Paginators using ListBinding ID
      if (iViewLevel > 1) {
        let oBinding = mParameters && mParameters.listBinding;
        const oPaginatorCurrentContext = oInternalModel.getProperty("/paginatorCurrentContext");
        if (oPaginatorCurrentContext) {
          const oBindingToUse = oPaginatorCurrentContext.getBinding();
          this.paginator.initialize(oBindingToUse, oPaginatorCurrentContext);
          oInternalModel.setProperty("/paginatorCurrentContext", null);
        } else if (oBinding) {
          if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
            this.paginator.initialize(oBinding, oContext);
          } else {
            // if the binding type is not ODataListBinding because of a deeplink navigation or a refresh of the page
            // we need to create it
            const sBindingPath = oBinding.getPath();
            if (/\([^\)]*\)$/.test(sBindingPath)) {
              // The current binding path ends with (xxx), so we create the listBinding by removing (xxx)
              const sListBindingPath = sBindingPath.replace(/\([^\)]*\)$/, "");
              oBinding = new ODataListBinding(oBinding.oModel, sListBindingPath);
              const _setListBindingAsync = () => {
                if (oBinding.getContexts().length > 0) {
                  this.paginator.initialize(oBinding, oContext);
                  oBinding.detachEvent("change", _setListBindingAsync);
                }
              };
              oBinding.getContexts(0);
              oBinding.attachEvent("change", _setListBindingAsync);
            } else {
              // The current binding doesn't end with (xxx) --> the last segment is a 1-1 navigation, so we don't display the paginator
              this.paginator.initialize(undefined);
            }
          }
        }
      }
      if (!this.getView().getViewData().useNewLazyLoading && oObjectPage.getEnableLazyLoading()) {
        const aSections = oObjectPage.getSections();
        const bUseIconTabBar = oObjectPage.getUseIconTabBar();
        let iSkip = 2;
        const bIsInEditMode = oObjectPage.getModel("ui").getProperty("/isEditable");
        const bEditableHeader = this.getView().getViewData().editableHeaderContent;
        for (let iSection = 0; iSection < aSections.length; iSection++) {
          const oSection = aSections[iSection];
          const aSubSections = oSection.getSubSections();
          for (let iSubSection = 0; iSubSection < aSubSections.length; iSubSection++, iSkip--) {
            // In IconTabBar mode keep the second section bound if there is an editable header and we are switching to display mode
            if (iSkip < 1 || bUseIconTabBar && (iSection > 1 || iSection === 1 && !bEditableHeader && !bIsInEditMode)) {
              const oSubSection = aSubSections[iSubSection];
              if (oSubSection.data().isVisibilityDynamic !== "true") {
                oSubSection.setBindingContext(null);
              }
            }
          }
        }
      }
      if (this.placeholder.isPlaceholderEnabled() && mParameters.showPlaceholder) {
        const oView = this.getView();
        const oNavContainer = oView.getParent().oContainer.getParent();
        if (oNavContainer) {
          oNavContainer.showPlaceholder({});
        }
      }
    };
    _proto._getFirstClickableElement = function _getFirstClickableElement(oObjectPage) {
      let oFirstClickableElement;
      const aActions = oObjectPage.getHeaderTitle() && oObjectPage.getHeaderTitle().getActions();
      if (aActions && aActions.length) {
        oFirstClickableElement = aActions.find(function (oAction) {
          // Due to the left alignment of the Draft switch and the collaborative draft avatar controls
          // there is a ToolbarSpacer in the actions aggregation which we need to exclude here!
          // Due to the ACC report, we also need not to check for the InvisibleText elements
          if (oAction.isA("sap.fe.macros.ShareAPI")) {
            // since ShareAPI does not have a disable property
            // hence there is no need to check if it is disbaled or not
            return oAction.getVisible();
          } else if (!oAction.isA("sap.ui.core.InvisibleText") && !oAction.isA("sap.m.ToolbarSpacer")) {
            return oAction.getVisible() && oAction.getEnabled();
          }
        });
      }
      return oFirstClickableElement;
    };
    _proto._getFirstEmptyMandatoryFieldFromSubSection = function _getFirstEmptyMandatoryFieldFromSubSection(aSubSections) {
      if (aSubSections) {
        for (let subSection = 0; subSection < aSubSections.length; subSection++) {
          const aBlocks = aSubSections[subSection].getBlocks();
          if (aBlocks) {
            for (let block = 0; block < aBlocks.length; block++) {
              let aFormContainers;
              if (aBlocks[block].isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getFormContainers();
              } else if (aBlocks[block].getContent && aBlocks[block].getContent() && aBlocks[block].getContent().isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getContent().getFormContainers();
              }
              if (aFormContainers) {
                for (let formContainer = 0; formContainer < aFormContainers.length; formContainer++) {
                  const aFormElements = aFormContainers[formContainer].getFormElements();
                  if (aFormElements) {
                    for (let formElement = 0; formElement < aFormElements.length; formElement++) {
                      const aFields = aFormElements[formElement].getFields();

                      // The first field is not necessarily an InputBase (e.g. could be a Text)
                      // So we need to check whether it has a getRequired method
                      try {
                        if (aFields[0].getRequired && aFields[0].getRequired() && !aFields[0].getValue()) {
                          return aFields[0];
                        }
                      } catch (error) {
                        Log.debug(`Error when searching for mandaotry empty field: ${error}`);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return undefined;
    };
    _proto._updateFocusInEditMode = function _updateFocusInEditMode(aSubSections) {
      const oObjectPage = this._getObjectPageLayoutControl();
      const oMandatoryField = this._getFirstEmptyMandatoryFieldFromSubSection(aSubSections);
      let oFieldToFocus;
      if (oMandatoryField) {
        oFieldToFocus = oMandatoryField.content.getContentEdit()[0];
      } else {
        oFieldToFocus = oObjectPage._getFirstEditableInput() || this._getFirstClickableElement(oObjectPage);
      }
      if (oFieldToFocus) {
        setTimeout(function () {
          // We set the focus in a timeeout, otherwise the focus sometimes goes to the TabBar
          oFieldToFocus.focus();
        }, 0);
      }
    };
    _proto._handleSubSectionEnteredViewPort = function _handleSubSectionEnteredViewPort(oEvent) {
      const oSubSection = oEvent.getParameter("subSection");
      oSubSection.setBindingContext(undefined);
    };
    _proto._onBackNavigationInDraft = function _onBackNavigationInDraft(oContext) {
      this.messageHandler.removeTransitionMessages();
      if (this.getAppComponent().getRouterProxy().checkIfBackHasSameContext()) {
        // Back nav will keep the same context --> no need to display the dialog
        history.back();
      } else {
        draft.processDataLossOrDraftDiscardConfirmation(function () {
          history.back();
        }, Function.prototype, oContext, this, false, draft.NavigationType.BackNavigation);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto._onAfterBinding = function _onAfterBinding(oBindingContext, mParameters) {
      const oObjectPage = this._getObjectPageLayoutControl();
      const aTables = this._findTables();
      this._sideEffects.clearFieldGroupsValidity();

      // TODO: this is only a temp solution as long as the model fix the cache issue and we use this additional
      // binding with ownRequest
      oBindingContext = oObjectPage.getBindingContext();
      let aIBNActions = [];
      oObjectPage.getSections().forEach(function (oSection) {
        oSection.getSubSections().forEach(function (oSubSection) {
          aIBNActions = CommonUtils.getIBNActions(oSubSection, aIBNActions);
        });
      });

      // Assign internal binding contexts to oFormContainer:
      // 1. It is not possible to assign the internal binding context to the XML fragment
      // (FormContainer.fragment.xml) yet - it is used already for the data-structure.
      // 2. Another problem is, that FormContainers assigned to a 'MoreBlock' does not have an
      // internal model context at all.

      aTables.forEach(function (oTable) {
        const oInternalModelContext = oTable.getBindingContext("internal");
        oInternalModelContext.setProperty("creationRowFieldValidity", {});
        oInternalModelContext.setProperty("creationRowCustomValidity", {});
        aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
        // temporary workaround for BCP: 2080218004
        // Need to fix with BLI: FIORITECHP1-15274
        // only for edit mode, we clear the table cache
        // Workaround starts here!!
        const oTableRowBinding = oTable.getRowBinding();
        if (oTableRowBinding) {
          if (ModelHelper.isStickySessionSupported(oTableRowBinding.getModel().getMetaModel())) {
            // apply for both edit and display mode in sticky
            oTableRowBinding.removeCachesAndMessages("");
          }
        }
        // Workaround ends here!!

        // Update 'enabled' property of DataFieldForAction buttons on table toolbar
        // The same is also performed on Table selectionChange event
        const oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))),
          aSelectedContexts = oTable.getSelectedContexts();
        ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
        // Clear the selection in the table, need to be fixed and review with BLI: FIORITECHP1-24318
        oTable.clearSelection();
      });
      CommonUtils.getSemanticTargetsFromPageModel(this, "_pageModel");
      //Retrieve Object Page header actions from Object Page title control
      const oObjectPageTitle = oObjectPage.getHeaderTitle();
      let aIBNHeaderActions = [];
      aIBNHeaderActions = CommonUtils.getIBNActions(oObjectPageTitle, aIBNHeaderActions);
      aIBNActions = aIBNActions.concat(aIBNHeaderActions);
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
      let oModel, oFinalUIState;

      // TODO: this should be moved into an init event of the MDC tables (not yet existing) and should be part
      // of any controller extension
      /**
       * @param oTable
       * @param oListBinding
       */
      async function enableFastCreationRow(oTable, oListBinding) {
        const oFastCreationRow = oTable.getCreationRow();
        let oFastCreationListBinding, oFastCreationContext;
        if (oFastCreationRow) {
          try {
            await oFinalUIState;
            if (oFastCreationRow.getModel("ui").getProperty("/isEditable")) {
              oFastCreationListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
                $$updateGroupId: "doNotSubmit",
                $$groupId: "doNotSubmit"
              });
              // Workaround suggested by OData model v4 colleagues
              oFastCreationListBinding.refreshInternal = function () {
                /* do nothing */
              };
              oFastCreationContext = oFastCreationListBinding.create();
              oFastCreationRow.setBindingContext(oFastCreationContext);

              // this is needed to avoid console error
              try {
                await oFastCreationContext.created();
              } catch (e) {
                Log.trace("transient fast creation context deleted");
              }
            }
          } catch (oError) {
            Log.error("Error while computing the final UI state", oError);
          }
        }
      }

      // this should not be needed at the all
      /**
       * @param oTable
       */
      const handleTableModifications = oTable => {
        const oBinding = this._getTableBinding(oTable),
          fnHandleTablePatchEvents = function () {
            enableFastCreationRow(oTable, oBinding);
          };
        if (!oBinding) {
          Log.error(`Expected binding missing for table: ${oTable.getId()}`);
          return;
        }
        if (oBinding.oContext) {
          fnHandleTablePatchEvents();
        } else {
          const fnHandleChange = function () {
            if (oBinding.oContext) {
              fnHandleTablePatchEvents();
              oBinding.detachChange(fnHandleChange);
            }
          };
          oBinding.attachChange(fnHandleChange);
        }
      };
      if (oBindingContext) {
        oModel = oBindingContext.getModel();

        // Compute Edit Mode
        oFinalUIState = this._editFlow.computeEditMode(oBindingContext);
        if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel())) {
          oFinalUIState.then(() => {
            if (this.getView().getModel("ui").getProperty("/isEditable")) {
              connect(this.getView());
            } else if (isConnected(this.getView())) {
              disconnect(this.getView()); // Cleanup collaboration connection in case we switch to another element (e.g. in FCL)
            }
          }).catch(function (oError) {
            Log.error("Error while waiting for the final UI State", oError);
          });
        }
        // update related apps once Data is received in case of binding cache is not available
        // TODO: this is only a temp solution since we need to call _updateRelatedApps method only after data for Object Page is received (if there is no binding)
        if (oBindingContext.getBinding().oCache) {
          this._updateRelatedApps();
        } else {
          const fnUpdateRelatedApps = () => {
            this._updateRelatedApps();
            oBindingContext.getBinding().detachDataReceived(fnUpdateRelatedApps);
          };
          oBindingContext.getBinding().attachDataReceived(fnUpdateRelatedApps);
        }

        //Attach the patch sent and patch completed event to the object page binding so that we can react
        const oBinding = oBindingContext.getBinding && oBindingContext.getBinding() || oBindingContext;

        // Attach the event handler only once to the same binding
        if (this.currentBinding !== oBinding) {
          oBinding.attachEvent("patchSent", this.editFlow.handlePatchSent, this);
          this.currentBinding = oBinding;
        }
        aTables.forEach(function (oTable) {
          // access binding only after table is bound
          TableUtils.whenBound(oTable).then(handleTableModifications).catch(function (oError) {
            Log.error("Error while waiting for the table to be bound", oError);
          });
        });
        if (!this.getView().getViewData().useNewLazyLoading) {
          // should be called only after binding is ready hence calling it in onAfterBinding
          oObjectPage._triggerVisibleSubSectionsEvents();
        }

        //To Compute the Edit Binding of the subObject page using root object page, create a context for draft root and update the edit button in sub OP using the context
        ActionRuntime.updateEditButtonVisibilityAndEnablement(this.getView());
      }
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      const setFocus = () => {
        // Set the focus to the first action button, or to the first editable input if in editable mode
        const oObjectPage = this._getObjectPageLayoutControl();
        const isInDisplayMode = !oObjectPage.getModel("ui").getProperty("/isEditable");
        if (isInDisplayMode) {
          const oFirstClickableElement = this._getFirstClickableElement(oObjectPage);
          if (oFirstClickableElement) {
            oFirstClickableElement.focus();
          }
        } else {
          const oSelectedSection = Core.byId(oObjectPage.getSelectedSection());
          if (oSelectedSection) {
            this._updateFocusInEditMode(oSelectedSection.getSubSections());
          }
        }
      };
      // Apply app state only after the page is ready with the first section selected
      const oView = this.getView();
      const oInternalModelContext = oView.getBindingContext("internal");
      const oBindingContext = oView.getBindingContext();
      //Show popup while navigating back from object page in case of draft
      if (oBindingContext) {
        const bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (!bIsStickyMode) {
          const oAppComponent = CommonUtils.getAppComponent(oView);
          oAppComponent.getShellServices().setBackNavigation(() => this._onBackNavigationInDraft(oBindingContext));
        }
      }
      const viewId = this.getView().getId();
      this.getAppComponent().getAppStateHandler().applyAppState(viewId, this.getView()).then(() => {
        if (mParameters.forceFocus) {
          setFocus();
        }
      }).catch(function (Error) {
        Log.error("Error while setting the focus", Error);
      });
      oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      this._checkDataPointTitleForExternalNavigation();
    }

    /**
     * Get the status of edit mode for sticky session.
     *
     * @returns The status of edit mode for sticky session
     */;
    _proto.getStickyEditMode = function getStickyEditMode() {
      const oBindingContext = this.getView().getBindingContext && this.getView().getBindingContext();
      let bIsStickyEditMode = false;
      if (oBindingContext) {
        const bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (bIsStickyMode) {
          bIsStickyEditMode = this.getView().getModel("ui").getProperty("/isEditable");
        }
      }
      return bIsStickyEditMode;
    };
    _proto._getObjectPageLayoutControl = function _getObjectPageLayoutControl() {
      return this.byId("fe::ObjectPage");
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const oObjectPage = this._getObjectPageLayoutControl();
      const oObjectPageSubtitle = oObjectPage.getCustomData().find(function (oCustomData) {
        return oCustomData.getKey() === "ObjectPageSubtitle";
      });
      return {
        title: oObjectPage.data("ObjectPageTitle") || "",
        subtitle: oObjectPageSubtitle && oObjectPageSubtitle.getValue(),
        intent: "",
        icon: ""
      };
    };
    _proto._executeHeaderShortcut = function _executeHeaderShortcut(sId) {
      const sButtonId = `${this.getView().getId()}--${sId}`,
        oButton = this._getObjectPageLayoutControl().getHeaderTitle().getActions().find(function (oElement) {
          return oElement.getId() === sButtonId;
        });
      if (oButton) {
        CommonUtils.fireButtonPress(oButton);
      }
    };
    _proto._executeFooterShortcut = function _executeFooterShortcut(sId) {
      const sButtonId = `${this.getView().getId()}--${sId}`,
        oButton = this._getObjectPageLayoutControl().getFooter().getContent().find(function (oElement) {
          return oElement.getMetadata().getName() === "sap.m.Button" && oElement.getId() === sButtonId;
        });
      CommonUtils.fireButtonPress(oButton);
    };
    _proto._executeTabShortCut = function _executeTabShortCut(oExecution) {
      const oObjectPage = this._getObjectPageLayoutControl(),
        aSections = oObjectPage.getSections(),
        iSectionIndexMax = aSections.length - 1,
        sCommand = oExecution.oSource.getCommand();
      let newSection,
        iSelectedSectionIndex = oObjectPage.indexOfSection(this.byId(oObjectPage.getSelectedSection()));
      if (iSelectedSectionIndex !== -1 && iSectionIndexMax > 0) {
        if (sCommand === "NextTab") {
          if (iSelectedSectionIndex <= iSectionIndexMax - 1) {
            newSection = aSections[++iSelectedSectionIndex];
          }
        } else if (iSelectedSectionIndex !== 0) {
          // PreviousTab
          newSection = aSections[--iSelectedSectionIndex];
        }
        if (newSection) {
          oObjectPage.setSelectedSection(newSection);
          newSection.focus();
        }
      }
    };
    _proto._getFooterVisibility = function _getFooterVisibility() {
      const oInternalModelContext = this.getView().getBindingContext("internal");
      const sViewId = this.getView().getId();
      oInternalModelContext.setProperty("messageFooterContainsErrors", false);
      sap.ui.getCore().getMessageManager().getMessageModel().getData().forEach(function (oMessage) {
        if (oMessage.validation && oMessage.type === "Error" && oMessage.target.indexOf(sViewId) > -1) {
          oInternalModelContext.setProperty("messageFooterContainsErrors", true);
        }
      });
    };
    _proto._showMessagePopover = function _showMessagePopover(err, oRet) {
      if (err) {
        Log.error(err);
      }
      const rootViewController = this.getAppComponent().getRootViewController();
      const currentPageView = rootViewController.isFclEnabled() ? rootViewController.getRightmostView() : this.getAppComponent().getRootContainer().getCurrentPage();
      if (!currentPageView.isA("sap.m.MessagePage")) {
        const oMessageButton = this.messageButton,
          oMessagePopover = oMessageButton.oMessagePopover,
          oItemBinding = oMessagePopover.getBinding("items");
        if (oItemBinding.getLength() > 0 && !oMessagePopover.isOpen()) {
          oMessageButton.setVisible(true);
          // workaround to ensure that oMessageButton is rendered when openBy is called
          setTimeout(function () {
            oMessagePopover.openBy(oMessageButton);
          }, 0);
        }
      }
      return oRet;
    };
    _proto._editDocument = function _editDocument(oContext) {
      const oModel = this.getView().getModel("ui");
      BusyLocker.lock(oModel);
      return this.editFlow.editDocument.apply(this.editFlow, [oContext]).finally(function () {
        BusyLocker.unlock(oModel);
      });
    }

    /**
     * Gets the context of the DraftRoot path.
     * If a view has been created with the draft Root Path, this method returns its bindingContext.
     * Where no view is found a new created context is returned.
     * The new created context request the key of the entity in order to get the Etag of this entity.
     *
     * @function
     * @name getDraftRootPath
     * @returns Returns a Promise
     */;
    _proto.getDraftRootContext = async function getDraftRootContext() {
      const view = this.getView();
      const context = view.getBindingContext();
      if (context) {
        const draftRootContextPath = ModelHelper.getDraftRootPath(context);
        let simpleDraftRootContext;
        if (draftRootContextPath) {
          var _this$getAppComponent, _simpleDraftRootConte;
          // Check if a view matches with the draft root path
          const existingBindingContextOnPage = (_this$getAppComponent = this.getAppComponent().getRootViewController().getInstancedViews().find(pageView => {
            var _pageView$getBindingC;
            return ((_pageView$getBindingC = pageView.getBindingContext()) === null || _pageView$getBindingC === void 0 ? void 0 : _pageView$getBindingC.getPath()) === draftRootContextPath;
          })) === null || _this$getAppComponent === void 0 ? void 0 : _this$getAppComponent.getBindingContext();
          if (existingBindingContextOnPage) {
            return existingBindingContextOnPage;
          }
          const internalModel = view.getModel("internal");
          simpleDraftRootContext = internalModel.getProperty("/simpleDraftRootContext");
          if (((_simpleDraftRootConte = simpleDraftRootContext) === null || _simpleDraftRootConte === void 0 ? void 0 : _simpleDraftRootConte.getPath()) === draftRootContextPath) {
            return simpleDraftRootContext;
          }
          const model = context.getModel();
          simpleDraftRootContext = model.bindContext(draftRootContextPath).getBoundContext();
          await CommonUtils.waitForContextRequested(simpleDraftRootContext);
          // Store this new created context to use it on the next iterations
          internalModel.setProperty("/simpleDraftRootContext", simpleDraftRootContext);
          return simpleDraftRootContext;
        }
        return undefined;
      }
      return undefined;
    };
    _proto._validateDocument = async function _validateDocument() {
      const control = Core.byId(Core.getCurrentFocusedControlId());
      const context = control === null || control === void 0 ? void 0 : control.getBindingContext();
      if (context && !context.isTransient()) {
        // Wait for the pending changes before starting this validation
        await this._editFlow.syncTask();
        const appComponent = this.getAppComponent();
        const sideEffectsService = appComponent.getSideEffectsService();
        const entityType = sideEffectsService.getEntityTypeFromContext(context);
        const globalSideEffects = entityType ? sideEffectsService.getGlobalODataEntitySideEffects(entityType) : [];
        // If there is at least one global SideEffects for the related entity, execute it/them
        if (globalSideEffects.length) {
          return Promise.all(globalSideEffects.map(sideEffects => this._sideEffects.requestSideEffects(sideEffects, context)));
        } else {
          const draftRootContext = await this.getDraftRootContext();
          //Execute the draftValidation if there is no globalSideEffects (ignore ETags in collaboration draft)
          if (draftRootContext) {
            return draft.executeDraftValidation(draftRootContext, appComponent, isConnected(this.getView()));
          }
        }
      }
      return undefined;
    };
    _proto._saveDocument = async function _saveDocument(oContext) {
      const oModel = this.getView().getModel("ui"),
        aWaitCreateDocuments = [];
      // indicates if we are creating a new row in the OP
      let bExecuteSideEffectsOnError = false;
      BusyLocker.lock(oModel);
      this._findTables().forEach(oTable => {
        const oBinding = this._getTableBinding(oTable);
        const mParameters = {
          creationMode: oTable.data("creationMode"),
          creationRow: oTable.getCreationRow(),
          createAtEnd: oTable.data("createAtEnd") === "true"
        };
        const bCreateDocument = mParameters.creationRow && mParameters.creationRow.getBindingContext() && Object.keys(mParameters.creationRow.getBindingContext().getObject()).length > 1;
        if (bCreateDocument) {
          // the bSkipSideEffects is a parameter created when we click the save key. If we press this key
          // we don't execute the handleSideEffects funciton to avoid batch redundancy
          mParameters.bSkipSideEffects = true;
          bExecuteSideEffectsOnError = true;
          aWaitCreateDocuments.push(this.editFlow.createDocument(oBinding, mParameters).then(function () {
            return oBinding;
          }));
        }
      });
      try {
        const aBindings = await Promise.all(aWaitCreateDocuments);
        const mParameters = {
          bExecuteSideEffectsOnError: bExecuteSideEffectsOnError,
          bindings: aBindings
        };
        // We need to either reject or resolve a promise here and return it since this save
        // function is not only called when pressing the save button in the footer, but also
        // when the user selects create or save in a dataloss popup.
        // The logic of the dataloss popup needs to detect if the save had errors or not in order
        // to decide if the subsequent action - like a back navigation - has to be executed or not.
        try {
          await this.editFlow.saveDocument(oContext, mParameters);
        } catch (error) {
          // If the saveDocument in editFlow returns errors we need
          // to show the message popover here and ensure that the
          // dataloss logic does not perform the follow up function
          // like e.g. a back navigation hence we return a promise and reject it
          this._showMessagePopover(error);
          throw error;
        }
      } finally {
        if (BusyLocker.isLocked(oModel)) {
          BusyLocker.unlock(oModel);
        }
      }
    };
    _proto._manageCollaboration = function _manageCollaboration() {
      openManageDialog(this.getView());
    };
    _proto._showCollaborationUserDetails = function _showCollaborationUserDetails(event) {
      showUserDetails(event, this.getView());
    };
    _proto._cancelDocument = function _cancelDocument(oContext, mParameters) {
      mParameters.cancelButton = this.getView().byId(mParameters.cancelButton); //to get the reference of the cancel button from command execution
      return this.editFlow.cancelDocument(oContext, mParameters);
    };
    _proto._applyDocument = function _applyDocument(oContext) {
      return this.editFlow.applyDocument(oContext).catch(() => this._showMessagePopover());
    };
    _proto._updateRelatedApps = function _updateRelatedApps() {
      const oObjectPage = this._getObjectPageLayoutControl();
      if (CommonUtils.resolveStringtoBoolean(oObjectPage.data("showRelatedApps"))) {
        CommonUtils.updateRelatedAppsDetails(oObjectPage);
      }
    };
    _proto._findControlInSubSection = function _findControlInSubSection(aParentElement, aSubsection, aControls, bIsChart) {
      const aSubSectionTables = [];
      for (let element = 0; element < aParentElement.length; element++) {
        let oElement = aParentElement[element].getContent instanceof Function && aParentElement[element].getContent();
        if (bIsChart) {
          if (oElement && oElement.mAggregations && oElement.getAggregation("items")) {
            const aItems = oElement.getAggregation("items");
            aItems.forEach(function (oItem) {
              if (oItem.isA("sap.fe.macros.chart.ChartAPI")) {
                oElement = oItem;
              }
            });
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.layout.DynamicSideContent")) {
          oElement = oElement.getMainContent instanceof Function && oElement.getMainContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.table.TableAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Table")) {
          aControls.push(oElement);
          aSubSectionTables.push({
            table: oElement,
            gridTable: oElement.getType().isA("sap.ui.mdc.table.GridTableType")
          });
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.chart.ChartAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Chart")) {
          aControls.push(oElement);
        }
      }
      if (aSubSectionTables.length === 1 && aParentElement.length === 1 && aSubSectionTables[0].gridTable && !aSubsection.hasStyleClass("sapUxAPObjectPageSubSectionFitContainer")) {
        //In case there is only a single table in a section we fit that to the whole page so that the scrollbar comes only on table and not on page
        aSubsection.addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
      }
    };
    _proto._getAllSubSections = function _getAllSubSections() {
      const oObjectPage = this._getObjectPageLayoutControl();
      let aSubSections = [];
      oObjectPage.getSections().forEach(function (oSection) {
        aSubSections = aSubSections.concat(oSection.getSubSections());
      });
      return aSubSections;
    };
    _proto._getAllBlocks = function _getAllBlocks() {
      let aBlocks = [];
      this._getAllSubSections().forEach(function (oSubSection) {
        aBlocks = aBlocks.concat(oSubSection.getBlocks());
      });
      return aBlocks;
    };
    _proto._findTables = function _findTables() {
      const aSubSections = this._getAllSubSections();
      const aTables = [];
      for (let subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aTables);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aTables);
      }
      return aTables;
    };
    _proto._findCharts = function _findCharts() {
      const aSubSections = this._getAllSubSections();
      const aCharts = [];
      for (let subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aCharts, true);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aCharts, true);
      }
      return aCharts;
    };
    _proto._closeSideContent = function _closeSideContent() {
      this._getAllBlocks().forEach(function (oBlock) {
        const oContent = oBlock.getContent instanceof Function && oBlock.getContent();
        if (oContent && oContent.isA && oContent.isA("sap.ui.layout.DynamicSideContent")) {
          if (oContent.setShowSideContent instanceof Function) {
            oContent.setShowSideContent(false);
          }
        }
      });
    }

    /**
     * Chart Context is resolved for 1:n microcharts.
     *
     * @param oChartContext The Context of the MicroChart
     * @param sChartPath The collectionPath of the the chart
     * @returns Array of Attributes of the chart Context
     */;
    _proto._getChartContextData = function _getChartContextData(oChartContext, sChartPath) {
      const oContextData = oChartContext.getObject();
      let oChartContextData = [oContextData];
      if (oChartContext && sChartPath) {
        if (oContextData[sChartPath]) {
          oChartContextData = oContextData[sChartPath];
          delete oContextData[sChartPath];
          oChartContextData.push(oContextData);
        }
      }
      return oChartContextData;
    }

    /**
     * Scroll the tables to the row with the sPath
     *
     * @function
     * @name sap.fe.templates.ObjectPage.ObjectPageController.controller#_scrollTablesToRow
     * @param {string} sRowPath 'sPath of the table row'
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      if (this._findTables && this._findTables().length > 0) {
        const aTables = this._findTables();
        for (let i = 0; i < aTables.length; i++) {
          TableScroller.scrollTableToRow(aTables[i], sRowPath);
        }
      }
    }

    /**
     * Method to merge selected contexts and filters.
     *
     * @function
     * @name _mergeMultipleContexts
     * @param oPageContext Page context
     * @param aLineContext Selected Contexts
     * @param sChartPath Collection name of the chart
     * @returns Selection Variant Object
     */;
    _proto._mergeMultipleContexts = function _mergeMultipleContexts(oPageContext, aLineContext, sChartPath) {
      let aAttributes = [],
        aPageAttributes = [],
        oContext,
        sMetaPathLine,
        sPathLine;
      const sPagePath = oPageContext.getPath();
      const oMetaModel = oPageContext && oPageContext.getModel() && oPageContext.getModel().getMetaModel();
      const sMetaPathPage = oMetaModel && oMetaModel.getMetaPath(sPagePath).replace(/^\/*/, "");

      // Get single line context if necessary
      if (aLineContext && aLineContext.length) {
        oContext = aLineContext[0];
        sPathLine = oContext.getPath();
        sMetaPathLine = oMetaModel && oMetaModel.getMetaPath(sPathLine).replace(/^\/*/, "");
        aLineContext.forEach(oSingleContext => {
          if (sChartPath) {
            const oChartContextData = this._getChartContextData(oSingleContext, sChartPath);
            if (oChartContextData) {
              aAttributes = oChartContextData.map(function (oSubChartContextData) {
                return {
                  contextData: oSubChartContextData,
                  entitySet: `${sMetaPathPage}/${sChartPath}`
                };
              });
            }
          } else {
            aAttributes.push({
              contextData: oSingleContext.getObject(),
              entitySet: sMetaPathLine
            });
          }
        });
      }
      aPageAttributes.push({
        contextData: oPageContext.getObject(),
        entitySet: sMetaPathPage
      });
      // Adding Page Context to selection variant
      aPageAttributes = CommonUtils.removeSensitiveData(aPageAttributes, oMetaModel);
      const oPageLevelSV = CommonUtils.addPageContextToSelectionVariant(new SelectionVariant(), aPageAttributes, this.getView());
      aAttributes = CommonUtils.removeSensitiveData(aAttributes, oMetaModel);
      return {
        selectionVariant: oPageLevelSV,
        attributes: aAttributes
      };
    };
    _proto._getBatchGroupsForView = function _getBatchGroupsForView() {
      const oViewData = this.getView().getViewData(),
        oConfigurations = oViewData.controlConfiguration,
        aConfigurations = oConfigurations && Object.keys(oConfigurations),
        aBatchGroups = ["$auto.Heroes", "$auto.Decoration", "$auto.Workers"];
      if (aConfigurations && aConfigurations.length > 0) {
        aConfigurations.forEach(function (sKey) {
          const oConfiguration = oConfigurations[sKey];
          if (oConfiguration.requestGroupId === "LongRunners") {
            aBatchGroups.push("$auto.LongRunners");
          }
        });
      }
      return aBatchGroups;
    }

    /*
     * Reset Breadcrumb links
     *
     * @function
     * @param {sap.m.Breadcrumbs} [oSource] parent control
     * @description Used when context of the object page changes.
     *              This event callback is attached to modelContextChange
     *              event of the Breadcrumb control to catch context change.
     *              Then element binding and hrefs are updated for each link.
     *
     * @ui5-restricted
     * @experimental
     */;
    _proto._setBreadcrumbLinks = async function _setBreadcrumbLinks(oSource) {
      const oContext = oSource.getBindingContext(),
        oAppComponent = this.getAppComponent(),
        aPromises = [],
        aSkipParameterized = [],
        sNewPath = oContext === null || oContext === void 0 ? void 0 : oContext.getPath(),
        aPathParts = (sNewPath === null || sNewPath === void 0 ? void 0 : sNewPath.split("/")) ?? [],
        oMetaModel = oAppComponent && oAppComponent.getMetaModel();
      let sPath = "";
      try {
        aPathParts.shift();
        aPathParts.splice(-1, 1);
        aPathParts.forEach(function (sPathPart) {
          sPath += `/${sPathPart}`;
          const oRootViewController = oAppComponent.getRootViewController();
          const sParameterPath = oMetaModel.getMetaPath(sPath);
          const bResultContext = oMetaModel.getObject(`${sParameterPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
          if (bResultContext) {
            // We dont need to create a breadcrumb for Parameter path
            aSkipParameterized.push(1);
            return;
          } else {
            aSkipParameterized.push(0);
          }
          aPromises.push(oRootViewController.getTitleInfoFromPath(sPath));
        });
        const titleHierarchyInfos = await Promise.all(aPromises);
        let idx, hierarchyPosition, oLink;
        for (const titleHierarchyInfo of titleHierarchyInfos) {
          hierarchyPosition = titleHierarchyInfos.indexOf(titleHierarchyInfo);
          idx = hierarchyPosition - aSkipParameterized[hierarchyPosition];
          oLink = oSource.getLinks()[idx] ? oSource.getLinks()[idx] : new Link();
          //sCurrentEntity is a fallback value in case of empty title
          oLink.setText(titleHierarchyInfo.subtitle || titleHierarchyInfo.title);
          //We apply an additional encodeURI in case of special characters (ie "/") used in the url through the semantic keys
          oLink.setHref(encodeURI(titleHierarchyInfo.intent));
          if (!oSource.getLinks()[idx]) {
            oSource.addLink(oLink);
          }
        }
      } catch (error) {
        Log.error("Error while setting the breadcrumb links:" + error);
      }
    };
    _proto._checkDataPointTitleForExternalNavigation = function _checkDataPointTitleForExternalNavigation() {
      const oView = this.getView();
      const oInternalModelContext = oView.getBindingContext("internal");
      const oDataPoints = CommonUtils.getHeaderFacetItemConfigForExternalNavigation(oView.getViewData(), this.getAppComponent().getRoutingService().getOutbounds());
      const oShellServices = this.getAppComponent().getShellServices();
      const oPageContext = oView && oView.getBindingContext();
      oInternalModelContext.setProperty("isHeaderDPLinkVisible", {});
      if (oPageContext) {
        oPageContext.requestObject().then(function (oData) {
          fnGetLinks(oDataPoints, oData);
        }).catch(function (oError) {
          Log.error("Cannot retrieve the links from the shell service", oError);
        });
      }

      /**
       * @param oError
       */
      function fnOnError(oError) {
        Log.error(oError);
      }
      function fnSetLinkEnablement(id, aSupportedLinks) {
        const sLinkId = id;
        // process viable links from getLinks for all datapoints having outbound
        if (aSupportedLinks && aSupportedLinks.length === 1 && aSupportedLinks[0].supported) {
          oInternalModelContext.setProperty(`isHeaderDPLinkVisible/${sLinkId}`, true);
        }
      }

      /**
       * @param oSubDataPoints
       * @param oPageData
       */
      function fnGetLinks(oSubDataPoints, oPageData) {
        for (const sId in oSubDataPoints) {
          const oDataPoint = oSubDataPoints[sId];
          const oParams = {};
          const oLink = oView.byId(sId);
          if (!oLink) {
            // for data points configured in app descriptor but not annotated in the header
            continue;
          }
          const oLinkContext = oLink.getBindingContext();
          const oLinkData = oLinkContext && oLinkContext.getObject();
          let oMixedContext = merge({}, oPageData, oLinkData);
          // process semantic object mappings
          if (oDataPoint.semanticObjectMapping) {
            const aSemanticObjectMapping = oDataPoint.semanticObjectMapping;
            for (const item in aSemanticObjectMapping) {
              const oMapping = aSemanticObjectMapping[item];
              const sMainProperty = oMapping["LocalProperty"]["$PropertyPath"];
              const sMappedProperty = oMapping["SemanticObjectProperty"];
              if (sMainProperty !== sMappedProperty) {
                if (oMixedContext.hasOwnProperty(sMainProperty)) {
                  const oNewMapping = {};
                  oNewMapping[sMappedProperty] = oMixedContext[sMainProperty];
                  oMixedContext = merge({}, oMixedContext, oNewMapping);
                  delete oMixedContext[sMainProperty];
                }
              }
            }
          }
          if (oMixedContext) {
            for (const sKey in oMixedContext) {
              if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
                oParams[sKey] = oMixedContext[sKey];
              }
            }
          }
          // validate if a link must be rendered
          oShellServices.isNavigationSupported([{
            target: {
              semanticObject: oDataPoint.semanticObject,
              action: oDataPoint.action
            },
            params: oParams
          }]).then(aLinks => {
            return fnSetLinkEnablement(sId, aLinks);
          }).catch(fnOnError);
        }
      }
    };
    return ObjectPageController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "paginator", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "pageReady", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype)), _class2)) || _class);
  return ObjectPageController;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/ObjectPageController.controller", ["sap/base/Log","sap/base/util/merge","sap/fe/core/ActionRuntime","sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/BusyLocker","sap/fe/core/controllerextensions/collaboration/ActivitySync","sap/fe/core/controllerextensions/collaboration/Manage","sap/fe/core/controllerextensions/editFlow/draft","sap/fe/core/controllerextensions/IntentBasedNavigation","sap/fe/core/controllerextensions/InternalIntentBasedNavigation","sap/fe/core/controllerextensions/InternalRouting","sap/fe/core/controllerextensions/MassEdit","sap/fe/core/controllerextensions/MessageHandler","sap/fe/core/controllerextensions/PageReady","sap/fe/core/controllerextensions/Paginator","sap/fe/core/controllerextensions/Placeholder","sap/fe/core/controllerextensions/Share","sap/fe/core/controllerextensions/ViewState","sap/fe/core/helpers/ClassSupport","sap/fe/core/helpers/ModelHelper","sap/fe/core/PageController","sap/fe/macros/CommonHelper","sap/fe/macros/DelegateUtil","sap/fe/macros/table/Utils","sap/fe/navigation/SelectionVariant","sap/fe/templates/ObjectPage/ExtensionAPI","sap/fe/templates/TableScroller","sap/m/InstanceManager","sap/m/Link","sap/m/MessageBox","sap/ui/core/Core","sap/ui/core/mvc/OverrideExecution","sap/ui/model/odata/v4/ODataListBinding","./overrides/IntentBasedNavigation","./overrides/InternalRouting","./overrides/MessageHandler","./overrides/Paginator","./overrides/Share","./overrides/ViewState"],function(t,e,n,i,o,s,a,r,c,l,g,u,d,f,h,p,b,m,C,y,w,S,v,P,x,E,A,B,_,I,M,V,O,D,F,T,R,j,k){"use strict";var L,N,z,$,H,U,G,q,J,K,W,Q,X,Y,Z,tt,et,nt,it,ot,st,at,rt,ct,lt,gt,ut;var dt=C.usingExtension;var ft=C.publicExtension;var ht=C.finalExtension;var pt=C.extensible;var bt=C.defineUI5Class;var mt=a.showUserDetails;var Ct=a.openManageDialog;var yt=s.isConnected;var wt=s.disconnect;var St=s.connect;function vt(t,e,n,i){if(!n)return;Object.defineProperty(t,e,{enumerable:n.enumerable,configurable:n.configurable,writable:n.writable,value:n.initializer?n.initializer.call(i):void 0})}function Pt(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function xt(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;Et(t,e)}function Et(t,e){Et=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,n){e.__proto__=n;return e};return Et(t,e)}function At(t,e,n,i,o){var s={};Object.keys(i).forEach(function(t){s[t]=i[t]});s.enumerable=!!s.enumerable;s.configurable=!!s.configurable;if("value"in s||s.initializer){s.writable=true}s=n.slice().reverse().reduce(function(n,i){return i(t,e,n)||n},s);if(o&&s.initializer!==void 0){s.value=s.initializer?s.initializer.call(o):void 0;s.initializer=undefined}if(s.initializer===void 0){Object.defineProperty(t,e,s);s=null}return s}function Bt(t,e){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let _t=(L=bt("sap.fe.templates.ObjectPage.ObjectPageController"),N=dt(p),z=dt(b.override(j)),$=dt(g.override(F)),H=dt(h.override(R)),U=dt(d.override(T)),G=dt(c.override(D)),q=dt(l.override({getNavigationMode:function(){const t=this.getView().getController().getStickyEditMode&&this.getView().getController().getStickyEditMode();return t?"explace":undefined}})),J=dt(m.override(k)),K=dt(f.override({isContextExpected:function(){return true}})),W=dt(u),Q=ft(),X=ht(),Y=ft(),Z=pt(V.After),L(tt=(et=function(s){xt(a,s);function a(){var e;for(var n=arguments.length,o=new Array(n),a=0;a<n;a++){o[a]=arguments[a]}e=s.call(this,...o)||this;vt(e,"placeholder",nt,Pt(e));vt(e,"share",it,Pt(e));vt(e,"_routing",ot,Pt(e));vt(e,"paginator",st,Pt(e));vt(e,"messageHandler",at,Pt(e));vt(e,"intentBasedNavigation",rt,Pt(e));vt(e,"_intentBasedNavigation",ct,Pt(e));vt(e,"viewState",lt,Pt(e));vt(e,"pageReady",gt,Pt(e));vt(e,"massEdit",ut,Pt(e));e.handlers={onPrimaryAction(t,e,n,i,o,s){const a=t.getView().getViewData().viewLevel,r=t._getObjectPageLayoutControl();if(s.positiveActionVisible){if(s.positiveActionEnabled){t.handlers.onCallAction(e,i,o)}}else if(s.editActionVisible){if(s.editActionEnabled){t._editDocument(n)}}else if(a===1&&r.getModel("ui").getProperty("/isEditable")){t._saveDocument(n)}else if(r.getModel("ui").getProperty("/isEditable")){t._applyDocument(n)}},onTableContextChange(e){const n=e.getSource();let i;this._findTables().some(function(t){if(t.getRowBinding()===n){i=t;return true}return false});const o=this._editFlow.getCurrentActionPromise();if(o){let e;if(i.getType().getMetadata().isA("sap.ui.mdc.table.GridTableType")){e=n.getContexts(0)}else{e=n.getCurrentContexts()}if(!e[0]){return}o.then(t=>{if(!t||t.controlId!==i.sId){return}const n=t.oData;const o=t.keys;let s=-1;e.find(function(t,e){const i=t.getObject();const a=o.every(function(t){return i[t]===n[t]});if(a){s=e}return a});if(s!==-1){const t=B.getOpenDialogs();const e=t.length>0?t.find(t=>t.data("FullScreenDialog")!==true):null;if(e){e.attachEventOnce("afterClose",function(){i.focusRow(s,true)})}else{i.focusRow(s,true)}this._editFlow.deleteCurrentActionPromise()}}).catch(function(e){t.error(`An error occurs while scrolling to the newly created Item: ${e}`)})}this.messageButton.fireModelContextChange()},onCallAction(t,e,n){const i=t.getController();return i.editFlow.invokeAction(e,n).then(i._showMessagePopover.bind(i,undefined)).catch(i._showMessagePopover.bind(i))},onDataPointTitlePressed(t,e,n,o,s){n=typeof n==="string"?JSON.parse(n):n;const a=n[o],r=i.getSemanticObjectMapping(a),c=e.getBindingContext(),l=c.getModel().getMetaModel().getMetaPath(c.getPath());let g=t._getChartContextData(c,s);let u;g=g.map(function(t){return{data:t,metaPath:l+(s?`/${s}`:"")}});if(a&&a.parameters){const e=a.parameters&&t._intentBasedNavigation.getOutboundParams(a.parameters);if(Object.keys(e).length>0){u=e}}if(a&&a.semanticObject&&a.action){t._intentBasedNavigation.navigate(a.semanticObject,a.action,{navigationContexts:g,semanticObjectMapping:r,additionalNavigationParameters:u})}},onChevronPressNavigateOutBound(t,e,n,i){return t._intentBasedNavigation.onChevronPressNavigateOutBound(t,e,n,i)},onNavigateChange(t){this.getExtensionAPI().updateAppState();this.bSectionNavigated=true;const e=this.getView().getBindingContext("internal");const n=this._getObjectPageLayoutControl();if(n.getModel("ui").getProperty("/isEditable")&&this.getView().getViewData().sectionLayout==="Tabs"&&e.getProperty("errorNavigationSectionFlag")===false){const e=t.getParameter("subSection");this._updateFocusInEditMode([e])}},onVariantSelected:function(){this.getExtensionAPI().updateAppState()},onVariantSaved:function(){setTimeout(()=>{this.getExtensionAPI().updateAppState()},500)},navigateToSubSection:function(e,n){const o=typeof n==="string"?JSON.parse(n):n;const s=e.getView().byId("fe::ObjectPage");let a;let r;if(o.sectionId){a=e.getView().byId(o.sectionId);r=o.subSectionId?e.getView().byId(o.subSectionId):a&&a.getSubSections()&&a.getSubSections()[0]}else if(o.subSectionId){r=e.getView().byId(o.subSectionId);a=r&&r.getParent()}if(!a||!r||!a.getVisible()||!r.getVisible()){e.getView().getModel("sap.fe.i18n").getResourceBundle().then(function(n){const o=i.getTranslatedText("C_ROUTING_NAVIGATION_DISABLED_TITLE",n,undefined,e.getView().getViewData().entitySet);t.error(o);I.error(o)}).catch(function(e){t.error(e)})}else{s.scrollToSection(r.getId());s.fireNavigate({section:a,subSection:r})}},onStateChange(){this.getExtensionAPI().updateAppState()},closeOPMessageStrip:function(){this.getExtensionAPI().hideMessage()}};return e}var c=a.prototype;c.getExtensionAPI=function t(e){if(e){this.mCustomSectionExtensionAPIs=this.mCustomSectionExtensionAPIs||{};if(!this.mCustomSectionExtensionAPIs[e]){this.mCustomSectionExtensionAPIs[e]=new E(this,e)}return this.mCustomSectionExtensionAPIs[e]}else{if(!this.extensionAPI){this.extensionAPI=new E(this)}return this.extensionAPI}};c.onInit=function t(){s.prototype.onInit.call(this);const e=this._getObjectPageLayoutControl();const n=this.getView().getBindingContext("internal");n===null||n===void 0?void 0:n.setProperty("externalNavigationContext",{page:true});n===null||n===void 0?void 0:n.setProperty("relatedApps",{visibility:false,items:null});n===null||n===void 0?void 0:n.setProperty("batchGroups",this._getBatchGroupsForView());n===null||n===void 0?void 0:n.setProperty("errorNavigationSectionFlag",false);if(!this.getView().getViewData().useNewLazyLoading&&e.getEnableLazyLoading()){e.attachEvent("subSectionEnteredViewPort",this._handleSubSectionEnteredViewPort.bind(this))}this.messageButton=this.getView().byId("fe::FooterBar::MessageButton");this.messageButton.oItemBinding.attachChange(this._fnShowOPMessage,this);n===null||n===void 0?void 0:n.setProperty("rootEditEnabled",true);n===null||n===void 0?void 0:n.setProperty("rootEditVisible",true)};c.onExit=function t(){if(this.mCustomSectionExtensionAPIs){for(const t of Object.keys(this.mCustomSectionExtensionAPIs)){if(this.mCustomSectionExtensionAPIs[t]){this.mCustomSectionExtensionAPIs[t].destroy()}}delete this.mCustomSectionExtensionAPIs}if(this.extensionAPI){this.extensionAPI.destroy()}delete this.extensionAPI;const e=this.messageButton?this.messageButton.oMessagePopover:null;if(e&&e.isOpen()){e.close()}const n=this.getView().getBindingContext();if(n&&n.isKeepAlive()){n.setKeepAlive(false)}if(yt(this.getView())){wt(this.getView())}};c._fnShowOPMessage=function t(){const e=this.getExtensionAPI();const n=this.getView();const i=this.messageButton.oMessagePopover.getItems().map(t=>t.getBindingContext("message").getObject()).filter(t=>{var e;return t.getTargets()[0]===((e=n.getBindingContext())===null||e===void 0?void 0:e.getPath())});if(e){e.showMessages(i)}};c._getTableBinding=function t(e){return e&&e.getRowBinding()};c.onBeforeRendering=function t(){var e;w.prototype.onBeforeRendering.apply(this);if((e=this.oView.oViewData)!==null&&e!==void 0&&e.retrieveTextFromValueList&&S.getMetaModel()===undefined){S.setMetaModel(this.getAppComponent().getMetaModel())}};c.onAfterRendering=function e(){this.getView().getModel("sap.fe.i18n").getResourceBundle().then(t=>{this.oResourceBundle=t}).catch(function(e){t.error("Error while retrieving the resource bundle",e)})};c._onBeforeBinding=function t(e,n){const i=this._findTables(),o=this._getObjectPageLayoutControl(),s=this.getView().getBindingContext("internal"),a=this.getView().getModel("internal"),r=s.getProperty("batchGroups"),c=this.getView().getViewData().viewLevel;let l;r.push("$auto");if(n.bDraftNavigation!==true){this._closeSideContent()}const g=o.getBindingContext();if(g&&g.hasPendingChanges()&&!r.some(g.getModel().hasPendingChanges.bind(g.getModel()))){g.getBinding().resetChanges()}for(let t=0;t<i.length;t++){l=i[t].getCreationRow();if(l){l.setBindingContext(null)}}const u=function(){if(!o.isFirstRendering()&&!n.bPersistOPScroll){o.setSelectedSection(null)}};o.attachEventOnce("modelContextChange",u);const d={onAfterRendering:u};o.addEventDelegate(d,this);this.pageReady.attachEventOnce("pageReady",function(){o.removeEventDelegate(d)});if(c>1){let t=n&&n.listBinding;const i=a.getProperty("/paginatorCurrentContext");if(i){const t=i.getBinding();this.paginator.initialize(t,i);a.setProperty("/paginatorCurrentContext",null)}else if(t){if(t.isA("sap.ui.model.odata.v4.ODataListBinding")){this.paginator.initialize(t,e)}else{const n=t.getPath();if(/\([^\)]*\)$/.test(n)){const i=n.replace(/\([^\)]*\)$/,"");t=new O(t.oModel,i);const o=()=>{if(t.getContexts().length>0){this.paginator.initialize(t,e);t.detachEvent("change",o)}};t.getContexts(0);t.attachEvent("change",o)}else{this.paginator.initialize(undefined)}}}}if(!this.getView().getViewData().useNewLazyLoading&&o.getEnableLazyLoading()){const t=o.getSections();const e=o.getUseIconTabBar();let n=2;const i=o.getModel("ui").getProperty("/isEditable");const s=this.getView().getViewData().editableHeaderContent;for(let o=0;o<t.length;o++){const a=t[o];const r=a.getSubSections();for(let t=0;t<r.length;t++,n--){if(n<1||e&&(o>1||o===1&&!s&&!i)){const e=r[t];if(e.data().isVisibilityDynamic!=="true"){e.setBindingContext(null)}}}}}if(this.placeholder.isPlaceholderEnabled()&&n.showPlaceholder){const t=this.getView();const e=t.getParent().oContainer.getParent();if(e){e.showPlaceholder({})}}};c._getFirstClickableElement=function t(e){let n;const i=e.getHeaderTitle()&&e.getHeaderTitle().getActions();if(i&&i.length){n=i.find(function(t){if(t.isA("sap.fe.macros.ShareAPI")){return t.getVisible()}else if(!t.isA("sap.ui.core.InvisibleText")&&!t.isA("sap.m.ToolbarSpacer")){return t.getVisible()&&t.getEnabled()}})}return n};c._getFirstEmptyMandatoryFieldFromSubSection=function e(n){if(n){for(let e=0;e<n.length;e++){const i=n[e].getBlocks();if(i){for(let e=0;e<i.length;e++){let n;if(i[e].isA("sap.ui.layout.form.Form")){n=i[e].getFormContainers()}else if(i[e].getContent&&i[e].getContent()&&i[e].getContent().isA("sap.ui.layout.form.Form")){n=i[e].getContent().getFormContainers()}if(n){for(let e=0;e<n.length;e++){const i=n[e].getFormElements();if(i){for(let e=0;e<i.length;e++){const n=i[e].getFields();try{if(n[0].getRequired&&n[0].getRequired()&&!n[0].getValue()){return n[0]}}catch(e){t.debug(`Error when searching for mandaotry empty field: ${e}`)}}}}}}}}}return undefined};c._updateFocusInEditMode=function t(e){const n=this._getObjectPageLayoutControl();const i=this._getFirstEmptyMandatoryFieldFromSubSection(e);let o;if(i){o=i.content.getContentEdit()[0]}else{o=n._getFirstEditableInput()||this._getFirstClickableElement(n)}if(o){setTimeout(function(){o.focus()},0)}};c._handleSubSectionEnteredViewPort=function t(e){const n=e.getParameter("subSection");n.setBindingContext(undefined)};c._onBackNavigationInDraft=function t(e){this.messageHandler.removeTransitionMessages();if(this.getAppComponent().getRouterProxy().checkIfBackHasSameContext()){history.back()}else{r.processDataLossOrDraftDiscardConfirmation(function(){history.back()},Function.prototype,e,this,false,r.NavigationType.BackNavigation)}};c._onAfterBinding=function e(o,s){const a=this._getObjectPageLayoutControl();const r=this._findTables();this._sideEffects.clearFieldGroupsValidity();o=a.getBindingContext();let c=[];a.getSections().forEach(function(t){t.getSubSections().forEach(function(t){c=i.getIBNActions(t,c)})});r.forEach(function(t){const e=t.getBindingContext("internal");e.setProperty("creationRowFieldValidity",{});e.setProperty("creationRowCustomValidity",{});c=i.getIBNActions(t,c);const o=t.getRowBinding();if(o){if(y.isStickySessionSupported(o.getModel().getMetaModel())){o.removeCachesAndMessages("")}}const s=JSON.parse(S.parseCustomData(v.getCustomData(t,"operationAvailableMap"))),a=t.getSelectedContexts();n.setActionEnablement(e,s,a,"table");t.clearSelection()});i.getSemanticTargetsFromPageModel(this,"_pageModel");const l=a.getHeaderTitle();let g=[];g=i.getIBNActions(l,g);c=c.concat(g);i.updateDataFieldForIBNButtonsVisibility(c,this.getView());let u,d;async function f(e,n){const i=e.getCreationRow();let o,s;if(i){try{await d;if(i.getModel("ui").getProperty("/isEditable")){o=u.bindList(n.getPath(),n.getContext(),[],[],{$$updateGroupId:"doNotSubmit",$$groupId:"doNotSubmit"});o.refreshInternal=function(){};s=o.create();i.setBindingContext(s);try{await s.created()}catch(e){t.trace("transient fast creation context deleted")}}}catch(e){t.error("Error while computing the final UI state",e)}}}const h=e=>{const n=this._getTableBinding(e),i=function(){f(e,n)};if(!n){t.error(`Expected binding missing for table: ${e.getId()}`);return}if(n.oContext){i()}else{const t=function(){if(n.oContext){i();n.detachChange(t)}};n.attachChange(t)}};if(o){u=o.getModel();d=this._editFlow.computeEditMode(o);if(y.isCollaborationDraftSupported(u.getMetaModel())){d.then(()=>{if(this.getView().getModel("ui").getProperty("/isEditable")){St(this.getView())}else if(yt(this.getView())){wt(this.getView())}}).catch(function(e){t.error("Error while waiting for the final UI State",e)})}if(o.getBinding().oCache){this._updateRelatedApps()}else{const t=()=>{this._updateRelatedApps();o.getBinding().detachDataReceived(t)};o.getBinding().attachDataReceived(t)}const e=o.getBinding&&o.getBinding()||o;if(this.currentBinding!==e){e.attachEvent("patchSent",this.editFlow.handlePatchSent,this);this.currentBinding=e}r.forEach(function(e){P.whenBound(e).then(h).catch(function(e){t.error("Error while waiting for the table to be bound",e)})});if(!this.getView().getViewData().useNewLazyLoading){a._triggerVisibleSubSectionsEvents()}n.updateEditButtonVisibilityAndEnablement(this.getView())}};c.onPageReady=function e(n){const o=()=>{const t=this._getObjectPageLayoutControl();const e=!t.getModel("ui").getProperty("/isEditable");if(e){const e=this._getFirstClickableElement(t);if(e){e.focus()}}else{const e=M.byId(t.getSelectedSection());if(e){this._updateFocusInEditMode(e.getSubSections())}}};const s=this.getView();const a=s.getBindingContext("internal");const r=s.getBindingContext();if(r){const t=y.isStickySessionSupported(r.getModel().getMetaModel());if(!t){const t=i.getAppComponent(s);t.getShellServices().setBackNavigation(()=>this._onBackNavigationInDraft(r))}}const c=this.getView().getId();this.getAppComponent().getAppStateHandler().applyAppState(c,this.getView()).then(()=>{if(n.forceFocus){o()}}).catch(function(e){t.error("Error while setting the focus",e)});a.setProperty("errorNavigationSectionFlag",false);this._checkDataPointTitleForExternalNavigation()};c.getStickyEditMode=function t(){const e=this.getView().getBindingContext&&this.getView().getBindingContext();let n=false;if(e){const t=y.isStickySessionSupported(e.getModel().getMetaModel());if(t){n=this.getView().getModel("ui").getProperty("/isEditable")}}return n};c._getObjectPageLayoutControl=function t(){return this.byId("fe::ObjectPage")};c._getPageTitleInformation=function t(){const e=this._getObjectPageLayoutControl();const n=e.getCustomData().find(function(t){return t.getKey()==="ObjectPageSubtitle"});return{title:e.data("ObjectPageTitle")||"",subtitle:n&&n.getValue(),intent:"",icon:""}};c._executeHeaderShortcut=function t(e){const n=`${this.getView().getId()}--${e}`,o=this._getObjectPageLayoutControl().getHeaderTitle().getActions().find(function(t){return t.getId()===n});if(o){i.fireButtonPress(o)}};c._executeFooterShortcut=function t(e){const n=`${this.getView().getId()}--${e}`,o=this._getObjectPageLayoutControl().getFooter().getContent().find(function(t){return t.getMetadata().getName()==="sap.m.Button"&&t.getId()===n});i.fireButtonPress(o)};c._executeTabShortCut=function t(e){const n=this._getObjectPageLayoutControl(),i=n.getSections(),o=i.length-1,s=e.oSource.getCommand();let a,r=n.indexOfSection(this.byId(n.getSelectedSection()));if(r!==-1&&o>0){if(s==="NextTab"){if(r<=o-1){a=i[++r]}}else if(r!==0){a=i[--r]}if(a){n.setSelectedSection(a);a.focus()}}};c._getFooterVisibility=function t(){const e=this.getView().getBindingContext("internal");const n=this.getView().getId();e.setProperty("messageFooterContainsErrors",false);sap.ui.getCore().getMessageManager().getMessageModel().getData().forEach(function(t){if(t.validation&&t.type==="Error"&&t.target.indexOf(n)>-1){e.setProperty("messageFooterContainsErrors",true)}})};c._showMessagePopover=function e(n,i){if(n){t.error(n)}const o=this.getAppComponent().getRootViewController();const s=o.isFclEnabled()?o.getRightmostView():this.getAppComponent().getRootContainer().getCurrentPage();if(!s.isA("sap.m.MessagePage")){const t=this.messageButton,e=t.oMessagePopover,n=e.getBinding("items");if(n.getLength()>0&&!e.isOpen()){t.setVisible(true);setTimeout(function(){e.openBy(t)},0)}}return i};c._editDocument=function t(e){const n=this.getView().getModel("ui");o.lock(n);return this.editFlow.editDocument.apply(this.editFlow,[e]).finally(function(){o.unlock(n)})};c.getDraftRootContext=async function t(){const e=this.getView();const n=e.getBindingContext();if(n){const t=y.getDraftRootPath(n);let a;if(t){var o,s;const r=(o=this.getAppComponent().getRootViewController().getInstancedViews().find(e=>{var n;return((n=e.getBindingContext())===null||n===void 0?void 0:n.getPath())===t}))===null||o===void 0?void 0:o.getBindingContext();if(r){return r}const c=e.getModel("internal");a=c.getProperty("/simpleDraftRootContext");if(((s=a)===null||s===void 0?void 0:s.getPath())===t){return a}const l=n.getModel();a=l.bindContext(t).getBoundContext();await i.waitForContextRequested(a);c.setProperty("/simpleDraftRootContext",a);return a}return undefined}return undefined};c._validateDocument=async function t(){const e=M.byId(M.getCurrentFocusedControlId());const n=e===null||e===void 0?void 0:e.getBindingContext();if(n&&!n.isTransient()){await this._editFlow.syncTask();const t=this.getAppComponent();const e=t.getSideEffectsService();const i=e.getEntityTypeFromContext(n);const o=i?e.getGlobalODataEntitySideEffects(i):[];if(o.length){return Promise.all(o.map(t=>this._sideEffects.requestSideEffects(t,n)))}else{const e=await this.getDraftRootContext();if(e){return r.executeDraftValidation(e,t,yt(this.getView()))}}}return undefined};c._saveDocument=async function t(e){const n=this.getView().getModel("ui"),i=[];let s=false;o.lock(n);this._findTables().forEach(t=>{const e=this._getTableBinding(t);const n={creationMode:t.data("creationMode"),creationRow:t.getCreationRow(),createAtEnd:t.data("createAtEnd")==="true"};const o=n.creationRow&&n.creationRow.getBindingContext()&&Object.keys(n.creationRow.getBindingContext().getObject()).length>1;if(o){n.bSkipSideEffects=true;s=true;i.push(this.editFlow.createDocument(e,n).then(function(){return e}))}});try{const t=await Promise.all(i);const a={bExecuteSideEffectsOnError:s,bindings:t};try{await this.editFlow.saveDocument(e,a)}catch(t){this._showMessagePopover(t);throw t}}finally{if(o.isLocked(n)){o.unlock(n)}}};c._manageCollaboration=function t(){Ct(this.getView())};c._showCollaborationUserDetails=function t(e){mt(e,this.getView())};c._cancelDocument=function t(e,n){n.cancelButton=this.getView().byId(n.cancelButton);return this.editFlow.cancelDocument(e,n)};c._applyDocument=function t(e){return this.editFlow.applyDocument(e).catch(()=>this._showMessagePopover())};c._updateRelatedApps=function t(){const e=this._getObjectPageLayoutControl();if(i.resolveStringtoBoolean(e.data("showRelatedApps"))){i.updateRelatedAppsDetails(e)}};c._findControlInSubSection=function t(e,n,i,o){const s=[];for(let t=0;t<e.length;t++){let n=e[t].getContent instanceof Function&&e[t].getContent();if(o){if(n&&n.mAggregations&&n.getAggregation("items")){const t=n.getAggregation("items");t.forEach(function(t){if(t.isA("sap.fe.macros.chart.ChartAPI")){n=t}})}}if(n&&n.isA&&n.isA("sap.ui.layout.DynamicSideContent")){n=n.getMainContent instanceof Function&&n.getMainContent();if(n&&n.length>0){n=n[0]}}if(n&&n.isA&&n.isA("sap.fe.macros.table.TableAPI")){n=n.getContent instanceof Function&&n.getContent();if(n&&n.length>0){n=n[0]}}if(n&&n.isA&&n.isA("sap.ui.mdc.Table")){i.push(n);s.push({table:n,gridTable:n.getType().isA("sap.ui.mdc.table.GridTableType")})}if(n&&n.isA&&n.isA("sap.fe.macros.chart.ChartAPI")){n=n.getContent instanceof Function&&n.getContent();if(n&&n.length>0){n=n[0]}}if(n&&n.isA&&n.isA("sap.ui.mdc.Chart")){i.push(n)}}if(s.length===1&&e.length===1&&s[0].gridTable&&!n.hasStyleClass("sapUxAPObjectPageSubSectionFitContainer")){n.addStyleClass("sapUxAPObjectPageSubSectionFitContainer")}};c._getAllSubSections=function t(){const e=this._getObjectPageLayoutControl();let n=[];e.getSections().forEach(function(t){n=n.concat(t.getSubSections())});return n};c._getAllBlocks=function t(){let e=[];this._getAllSubSections().forEach(function(t){e=e.concat(t.getBlocks())});return e};c._findTables=function t(){const e=this._getAllSubSections();const n=[];for(let t=0;t<e.length;t++){this._findControlInSubSection(e[t].getBlocks(),e[t],n);this._findControlInSubSection(e[t].getMoreBlocks(),e[t],n)}return n};c._findCharts=function t(){const e=this._getAllSubSections();const n=[];for(let t=0;t<e.length;t++){this._findControlInSubSection(e[t].getBlocks(),e[t],n,true);this._findControlInSubSection(e[t].getMoreBlocks(),e[t],n,true)}return n};c._closeSideContent=function t(){this._getAllBlocks().forEach(function(t){const e=t.getContent instanceof Function&&t.getContent();if(e&&e.isA&&e.isA("sap.ui.layout.DynamicSideContent")){if(e.setShowSideContent instanceof Function){e.setShowSideContent(false)}}})};c._getChartContextData=function t(e,n){const i=e.getObject();let o=[i];if(e&&n){if(i[n]){o=i[n];delete i[n];o.push(i)}}return o};c._scrollTablesToRow=function t(e){if(this._findTables&&this._findTables().length>0){const t=this._findTables();for(let n=0;n<t.length;n++){A.scrollTableToRow(t[n],e)}}};c._mergeMultipleContexts=function t(e,n,o){let s=[],a=[],r,c,l;const g=e.getPath();const u=e&&e.getModel()&&e.getModel().getMetaModel();const d=u&&u.getMetaPath(g).replace(/^\/*/,"");if(n&&n.length){r=n[0];l=r.getPath();c=u&&u.getMetaPath(l).replace(/^\/*/,"");n.forEach(t=>{if(o){const e=this._getChartContextData(t,o);if(e){s=e.map(function(t){return{contextData:t,entitySet:`${d}/${o}`}})}}else{s.push({contextData:t.getObject(),entitySet:c})}})}a.push({contextData:e.getObject(),entitySet:d});a=i.removeSensitiveData(a,u);const f=i.addPageContextToSelectionVariant(new x,a,this.getView());s=i.removeSensitiveData(s,u);return{selectionVariant:f,attributes:s}};c._getBatchGroupsForView=function t(){const e=this.getView().getViewData(),n=e.controlConfiguration,i=n&&Object.keys(n),o=["$auto.Heroes","$auto.Decoration","$auto.Workers"];if(i&&i.length>0){i.forEach(function(t){const e=n[t];if(e.requestGroupId==="LongRunners"){o.push("$auto.LongRunners")}})}return o};c._setBreadcrumbLinks=async function e(n){const i=n.getBindingContext(),o=this.getAppComponent(),s=[],a=[],r=i===null||i===void 0?void 0:i.getPath(),c=(r===null||r===void 0?void 0:r.split("/"))??[],l=o&&o.getMetaModel();let g="";try{c.shift();c.splice(-1,1);c.forEach(function(t){g+=`/${t}`;const e=o.getRootViewController();const n=l.getMetaPath(g);const i=l.getObject(`${n}/@com.sap.vocabularies.Common.v1.ResultContext`);if(i){a.push(1);return}else{a.push(0)}s.push(e.getTitleInfoFromPath(g))});const t=await Promise.all(s);let e,i,r;for(const o of t){i=t.indexOf(o);e=i-a[i];r=n.getLinks()[e]?n.getLinks()[e]:new _;r.setText(o.subtitle||o.title);r.setHref(encodeURI(o.intent));if(!n.getLinks()[e]){n.addLink(r)}}}catch(e){t.error("Error while setting the breadcrumb links:"+e)}};c._checkDataPointTitleForExternalNavigation=function n(){const o=this.getView();const s=o.getBindingContext("internal");const a=i.getHeaderFacetItemConfigForExternalNavigation(o.getViewData(),this.getAppComponent().getRoutingService().getOutbounds());const r=this.getAppComponent().getShellServices();const c=o&&o.getBindingContext();s.setProperty("isHeaderDPLinkVisible",{});if(c){c.requestObject().then(function(t){u(a,t)}).catch(function(e){t.error("Cannot retrieve the links from the shell service",e)})}function l(e){t.error(e)}function g(t,e){const n=t;if(e&&e.length===1&&e[0].supported){s.setProperty(`isHeaderDPLinkVisible/${n}`,true)}}function u(t,n){for(const i in t){const s=t[i];const a={};const c=o.byId(i);if(!c){continue}const u=c.getBindingContext();const d=u&&u.getObject();let f=e({},n,d);if(s.semanticObjectMapping){const t=s.semanticObjectMapping;for(const n in t){const i=t[n];const o=i["LocalProperty"]["$PropertyPath"];const s=i["SemanticObjectProperty"];if(o!==s){if(f.hasOwnProperty(o)){const t={};t[s]=f[o];f=e({},f,t);delete f[o]}}}}if(f){for(const t in f){if(t.indexOf("_")!==0&&t.indexOf("odata.context")===-1){a[t]=f[t]}}}r.isNavigationSupported([{target:{semanticObject:s.semanticObject,action:s.action},params:a}]).then(t=>g(i,t)).catch(l)}}};return a}(w),nt=At(et.prototype,"placeholder",[N],{configurable:true,enumerable:true,writable:true,initializer:null}),it=At(et.prototype,"share",[z],{configurable:true,enumerable:true,writable:true,initializer:null}),ot=At(et.prototype,"_routing",[$],{configurable:true,enumerable:true,writable:true,initializer:null}),st=At(et.prototype,"paginator",[H],{configurable:true,enumerable:true,writable:true,initializer:null}),at=At(et.prototype,"messageHandler",[U],{configurable:true,enumerable:true,writable:true,initializer:null}),rt=At(et.prototype,"intentBasedNavigation",[G],{configurable:true,enumerable:true,writable:true,initializer:null}),ct=At(et.prototype,"_intentBasedNavigation",[q],{configurable:true,enumerable:true,writable:true,initializer:null}),lt=At(et.prototype,"viewState",[J],{configurable:true,enumerable:true,writable:true,initializer:null}),gt=At(et.prototype,"pageReady",[K],{configurable:true,enumerable:true,writable:true,initializer:null}),ut=At(et.prototype,"massEdit",[W],{configurable:true,enumerable:true,writable:true,initializer:null}),At(et.prototype,"getExtensionAPI",[Q,X],Object.getOwnPropertyDescriptor(et.prototype,"getExtensionAPI"),et.prototype),At(et.prototype,"onPageReady",[Y,Z],Object.getOwnPropertyDescriptor(et.prototype,"onPageReady"),et.prototype),et))||tt);return _t},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/ObjectPageTemplating-dbg", ["sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/form/FormTemplating", "sap/m/library", "sap/ui/base/ManagedObject", "sap/ui/model/odata/v4/AnnotationHelper"], function (CommonUtils, BindingHelper, BindingToolkit, ModelHelper, DataModelPathHelper, CommonHelper, FieldTemplating, FormTemplating, mLibrary, ManagedObject, ODataModelAnnotationHelper) {
  "use strict";

  var _exports = {};
  var getLabelForConnectedFields = FormTemplating.getLabelForConnectedFields;
  var formatValueRecursively = FieldTemplating.formatValueRecursively;
  var addTextArrangementToBindingExpression = FieldTemplating.addTextArrangementToBindingExpression;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var or = BindingToolkit.or;
  var isEmpty = BindingToolkit.isEmpty;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var constant = BindingToolkit.constant;
  var concat = BindingToolkit.concat;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var Draft = BindingHelper.Draft;
  const ButtonType = mLibrary.ButtonType;
  //```mermaid
  // graph TD
  // A[Object Page Title] -->|Get DataField Value| C{Evaluate Create Mode}
  // C -->|In Create Mode| D{Is DataField Value empty}
  // D -->|Yes| F{Is there a TypeName}
  // F -->|Yes| G[Is there an custom title]
  // G -->|Yes| G1[Show the custom title + 'TypeName']
  // G -->|No| G2[Display the default title 'New + TypeName']
  // F -->|No| H[Is there a custom title]
  // H -->|Yes| I[Show the custom title]
  // H -->|No| J[Show the default 'Unamned Object']
  // D -->|No| E
  // C -->|Not in create mode| E[Show DataField Value]
  // ```
  /**
   * Compute the title for the object page.
   *
   * @param oHeaderInfo The @UI.HeaderInfo annotation content
   * @param oViewData The view data object we're currently on
   * @param fullContextPath The full context path used to reach that object page
   * @param oDraftRoot
   * @returns The binding expression for the object page title
   */
  const getExpressionForTitle = function (oHeaderInfo, oViewData, fullContextPath, oDraftRoot) {
    var _oHeaderInfo$Title, _oHeaderInfo$Title2, _oHeaderInfo$Title5, _oHeaderInfo$Title6;
    const titleNoHeaderInfo = CommonUtils.getTranslatedText("T_NEW_OBJECT", oViewData.resourceBundle, undefined, oViewData.entitySet);
    const titleWithHeaderInfo = CommonUtils.getTranslatedText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE", oViewData.resourceBundle, undefined, oViewData.entitySet);
    const oEmptyHeaderInfoTitle = (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : oHeaderInfo.Title) === undefined || (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : oHeaderInfo.Title) === "" || (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title = oHeaderInfo.Title) === null || _oHeaderInfo$Title === void 0 ? void 0 : _oHeaderInfo$Title.Value) === "";
    const titleForActiveHeaderNoHeaderInfo = !oEmptyHeaderInfoTitle ? CommonUtils.getTranslatedText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO", oViewData.resourceBundle) : "";
    let titleValueExpression,
      connectedFieldsPath,
      titleIsEmpty = constant(true),
      titleBooleanExpression;
    if ((oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title2 = oHeaderInfo.Title) === null || _oHeaderInfo$Title2 === void 0 ? void 0 : _oHeaderInfo$Title2.$Type) === "com.sap.vocabularies.UI.v1.DataField") {
      var _oHeaderInfo$Title3, _oHeaderInfo$Title4, _oHeaderInfo$Title4$V, _oHeaderInfo$Title4$V2, _oHeaderInfo$Title4$V3, _oHeaderInfo$Title4$V4, _oHeaderInfo$Title4$V5, _oHeaderInfo$Title4$V6, _oHeaderInfo$Title4$V7, _titleValueExpression, _titleValueExpression2;
      titleValueExpression = getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title3 = oHeaderInfo.Title) === null || _oHeaderInfo$Title3 === void 0 ? void 0 : _oHeaderInfo$Title3.Value);
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && (_oHeaderInfo$Title4 = oHeaderInfo.Title) !== null && _oHeaderInfo$Title4 !== void 0 && (_oHeaderInfo$Title4$V = _oHeaderInfo$Title4.Value) !== null && _oHeaderInfo$Title4$V !== void 0 && (_oHeaderInfo$Title4$V2 = _oHeaderInfo$Title4$V.$target) !== null && _oHeaderInfo$Title4$V2 !== void 0 && (_oHeaderInfo$Title4$V3 = _oHeaderInfo$Title4$V2.annotations) !== null && _oHeaderInfo$Title4$V3 !== void 0 && (_oHeaderInfo$Title4$V4 = _oHeaderInfo$Title4$V3.Common) !== null && _oHeaderInfo$Title4$V4 !== void 0 && (_oHeaderInfo$Title4$V5 = _oHeaderInfo$Title4$V4.Text) !== null && _oHeaderInfo$Title4$V5 !== void 0 && (_oHeaderInfo$Title4$V6 = _oHeaderInfo$Title4$V5.annotations) !== null && _oHeaderInfo$Title4$V6 !== void 0 && (_oHeaderInfo$Title4$V7 = _oHeaderInfo$Title4$V6.UI) !== null && _oHeaderInfo$Title4$V7 !== void 0 && _oHeaderInfo$Title4$V7.TextArrangement) {
        // In case an explicit text arrangement was set we make use of it in the description as well
        titleValueExpression = addTextArrangementToBindingExpression(titleValueExpression, fullContextPath);
      }
      titleValueExpression = formatValueRecursively(titleValueExpression, fullContextPath);
      titleIsEmpty = ((_titleValueExpression = titleValueExpression) === null || _titleValueExpression === void 0 ? void 0 : _titleValueExpression._type) === "Constant" ? constant(!((_titleValueExpression2 = titleValueExpression) !== null && _titleValueExpression2 !== void 0 && _titleValueExpression2.value)) : isEmpty(titleValueExpression);
    } else if ((oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title5 = oHeaderInfo.Title) === null || _oHeaderInfo$Title5 === void 0 ? void 0 : _oHeaderInfo$Title5.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title6 = oHeaderInfo.Title) === null || _oHeaderInfo$Title6 === void 0 ? void 0 : _oHeaderInfo$Title6.Target.$target.$Type) === "com.sap.vocabularies.UI.v1.ConnectedFieldsType") {
      var _titleValueExpression3, _titleValueExpression4;
      connectedFieldsPath = enhanceDataModelPath(fullContextPath, "$Type/@UI.HeaderInfo/Title/Target/$AnnotationPath");
      titleValueExpression = getLabelForConnectedFields(connectedFieldsPath, false);
      titleBooleanExpression = ((_titleValueExpression3 = titleValueExpression) === null || _titleValueExpression3 === void 0 ? void 0 : _titleValueExpression3._type) === "Constant" ? constant(!((_titleValueExpression4 = titleValueExpression) !== null && _titleValueExpression4 !== void 0 && _titleValueExpression4.value)) : isEmpty(titleValueExpression);
      titleIsEmpty = titleValueExpression ? titleBooleanExpression : constant(true);
    }

    // If there is a TypeName defined, show the default title 'New + TypeName', otherwise show the custom title or the default 'New object'
    const createModeTitle = oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.TypeName ? concat(titleWithHeaderInfo, ": ", resolveBindingString(oHeaderInfo.TypeName.toString())) : titleNoHeaderInfo;
    const activeExpression = oDraftRoot ? Entity.IsActive : true;
    return compileExpression(ifElse(and(UI.IsCreateMode, titleIsEmpty), createModeTitle,
    // Otherwise show the default expression
    ifElse(and(activeExpression, titleIsEmpty), titleForActiveHeaderNoHeaderInfo, titleValueExpression)));
  };

  /**
   * Retrieves the expression for the description of an object page.
   *
   * @param oHeaderInfo The @UI.HeaderInfo annotation content
   * @param fullContextPath The full context path used to reach that object page
   * @returns The binding expression for the object page description
   */
  _exports.getExpressionForTitle = getExpressionForTitle;
  const getExpressionForDescription = function (oHeaderInfo, fullContextPath) {
    var _oHeaderInfo$Descript, _oHeaderInfo$Descript2, _oHeaderInfo$Descript3, _oHeaderInfo$Descript4, _oHeaderInfo$Descript5, _oHeaderInfo$Descript6, _oHeaderInfo$Descript7, _oHeaderInfo$Descript8, _oHeaderInfo$Descript9;
    let pathInModel = getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Descript = oHeaderInfo.Description) === null || _oHeaderInfo$Descript === void 0 ? void 0 : _oHeaderInfo$Descript.Value);
    if (oHeaderInfo !== null && oHeaderInfo !== void 0 && (_oHeaderInfo$Descript2 = oHeaderInfo.Description) !== null && _oHeaderInfo$Descript2 !== void 0 && (_oHeaderInfo$Descript3 = _oHeaderInfo$Descript2.Value) !== null && _oHeaderInfo$Descript3 !== void 0 && (_oHeaderInfo$Descript4 = _oHeaderInfo$Descript3.$target) !== null && _oHeaderInfo$Descript4 !== void 0 && (_oHeaderInfo$Descript5 = _oHeaderInfo$Descript4.annotations) !== null && _oHeaderInfo$Descript5 !== void 0 && (_oHeaderInfo$Descript6 = _oHeaderInfo$Descript5.Common) !== null && _oHeaderInfo$Descript6 !== void 0 && (_oHeaderInfo$Descript7 = _oHeaderInfo$Descript6.Text) !== null && _oHeaderInfo$Descript7 !== void 0 && (_oHeaderInfo$Descript8 = _oHeaderInfo$Descript7.annotations) !== null && _oHeaderInfo$Descript8 !== void 0 && (_oHeaderInfo$Descript9 = _oHeaderInfo$Descript8.UI) !== null && _oHeaderInfo$Descript9 !== void 0 && _oHeaderInfo$Descript9.TextArrangement) {
      // In case an explicit text arrangement was set we make use of it in the description as well
      pathInModel = addTextArrangementToBindingExpression(pathInModel, fullContextPath);
    }
    return compileExpression(formatValueRecursively(pathInModel, fullContextPath));
  };

  /**
   * Return the expression for the save button.
   *
   * @param oViewData The current view data
   * @param fullContextPath The path used up until here
   * @returns The binding expression that shows the right save button text
   */
  _exports.getExpressionForDescription = getExpressionForDescription;
  const getExpressionForSaveButton = function (oViewData, fullContextPath) {
    var _annotations$Session;
    const saveButtonText = CommonUtils.getTranslatedText("T_OP_OBJECT_PAGE_SAVE", oViewData.resourceBundle);
    const createButtonText = CommonUtils.getTranslatedText("T_OP_OBJECT_PAGE_CREATE", oViewData.resourceBundle);
    let saveExpression;
    if ((_annotations$Session = fullContextPath.startingEntitySet.annotations.Session) !== null && _annotations$Session !== void 0 && _annotations$Session.StickySessionSupported) {
      // If we're in sticky mode AND the ui is in create mode, show Create, else show Save
      saveExpression = ifElse(UI.IsCreateMode, createButtonText, saveButtonText);
    } else {
      // If we're in draft AND the draft is a new object (!IsActiveEntity && !HasActiveEntity), show create, else show save
      saveExpression = ifElse(Draft.IsNewObject, createButtonText, saveButtonText);
    }
    return compileExpression(saveExpression);
  };

  /**
   * Method returns whether footer is visible or not on object / subobject page.
   *
   * @function
   * @name getFooterVisible
   * @param footerActions The footer action object coming from the converter
   * @param dataFields Data field array for normal footer visibility processing
   * @returns `true` if any action is true, otherwise compiled Binding or `false`
   */
  _exports.getExpressionForSaveButton = getExpressionForSaveButton;
  const getFooterVisible = function (footerActions, dataFields) {
    const manifestActions = footerActions.filter(action => isManifestAction(action));
    let customActionVisibility;
    if (manifestActions.length) {
      // If we have manifest actions
      const customActionIndividualVisibility = manifestActions.map(action => {
        return resolveBindingString(action.visible, "boolean");
      });
      // construct the footer's visibility-binding out of all actions' visibility-bindings, first the binding of all custom actions ...
      customActionVisibility = or(...customActionIndividualVisibility);
      // and then the binding of all annotation actions inside the footer ...
      const annotationActionVisibility = getDataFieldBasedFooterVisibility(dataFields, true);
      // finally, return everything.
      return compileExpression(or(customActionVisibility, resolveBindingString(annotationActionVisibility, "boolean")));
    }
    return getDataFieldBasedFooterVisibility(dataFields, true);
  };

  /**
   * Checks if the footer is visible or not.
   *
   * @function
   * @static
   * @name sap.fe.templates.ObjectPage.ObjectPageTemplating.getDataFieldBasedFooterVisibility
   * @memberof sap.fe.templates.ObjectPage.ObjectPageTemplating
   * @param aDataFields Array of DataFields in the identification
   * @param bConsiderEditable Whether the edit mode binding is required or not
   * @returns An expression if all the actions are ui.hidden, true otherwise
   * @private
   * @ui5-restricted
   */
  _exports.getFooterVisible = getFooterVisible;
  const getDataFieldBasedFooterVisibility = function (aDataFields, bConsiderEditable) {
    let sHiddenExpression = "";
    let sSemiHiddenExpression;
    const aHiddenActionPath = [];
    for (const i in aDataFields) {
      const oDataField = aDataFields[i];
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && oDataField.Determining === true) {
        const hiddenExpression = oDataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`];
        if (!hiddenExpression) {
          return true;
        } else if (hiddenExpression.$Path) {
          if (aHiddenActionPath.indexOf(hiddenExpression.$Path) === -1) {
            aHiddenActionPath.push(hiddenExpression.$Path);
          }
        }
      }
    }
    if (aHiddenActionPath.length) {
      for (let index = 0; index < aHiddenActionPath.length; index++) {
        if (aHiddenActionPath[index]) {
          sSemiHiddenExpression = "(%{" + aHiddenActionPath[index] + "} === true ? false : true )";
        }
        if (index == aHiddenActionPath.length - 1) {
          sHiddenExpression = sHiddenExpression + sSemiHiddenExpression;
        } else {
          sHiddenExpression = sHiddenExpression + sSemiHiddenExpression + "||";
        }
      }
      return "{= " + (bConsiderEditable ? "(" : "") + sHiddenExpression + (bConsiderEditable ? " || ${ui>/isEditable}) " : " ") + "&& ${internal>isCreateDialogOpen} !== true}";
    } else {
      return "{= " + (bConsiderEditable ? "${ui>/isEditable} && " : "") + "${internal>isCreateDialogOpen} !== true}";
    }
  };

  /**
   * Method returns Whether the action type is manifest or not.
   *
   * @function
   * @name isManifestActionVisible
   * @param oAction The action object
   * @returns `true` if action is coming from manifest, `false` otherwise
   */
  _exports.getDataFieldBasedFooterVisibility = getDataFieldBasedFooterVisibility;
  const isManifestAction = function (oAction) {
    const aActions = ["Primary", "DefaultApply", "Secondary", "ForAction", "ForNavigation", "SwitchToActiveObject", "SwitchToDraftObject", "DraftActions", "Copy"];
    return aActions.indexOf(oAction.type) < 0;
  };

  /**
   * If a critical action is rendered, it is considered to be the primary action.
   * Hence, the primary action of the template is set back to Default.
   *
   * @function
   * @static
   * @name sap.fe.templates.ObjectPage.ObjectPageTemplating.buildEmphasizedButtonExpression
   * @memberof sap.fe.templates.ObjectPage.ObjectPageTemplating
   * @param aIdentification Array of all the DataFields in Identification
   * @returns An expression to deduce if button type is Default or Emphasized
   * @private
   * @ui5-restricted
   */
  _exports.isManifestAction = isManifestAction;
  const buildEmphasizedButtonExpression = function (aIdentification) {
    if (!aIdentification) {
      return ButtonType.Emphasized;
    }
    let sFormatEmphasizedExpression;
    let bIsAlwaysDefault,
      sHiddenSimplePath,
      sHiddenExpression = "";
    aIdentification.forEach(function (oDataField) {
      const oCriticalityProperty = oDataField.Criticality;
      const oDataFieldHidden = oDataField["@com.sap.vocabularies.UI.v1.Hidden"];
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && !bIsAlwaysDefault && oCriticalityProperty) {
        if (!sFormatEmphasizedExpression && oDataFieldHidden === true) {
          // if DataField is set to hidden, we can skip other checks and return Default button type
          sFormatEmphasizedExpression = ButtonType.Emphasized;
          return;
        }
        if (oDataFieldHidden && oDataFieldHidden.$Path) {
          // when visibility of critical button is based on path, collect all paths for expression
          sHiddenSimplePath = oDataFieldHidden.$Path;
          if (sHiddenExpression) {
            sHiddenExpression = sHiddenExpression + " && ";
          }
          sHiddenExpression = sHiddenExpression + "%{" + sHiddenSimplePath + "} === true";
          sFormatEmphasizedExpression = "{= (" + sHiddenExpression + ") ? 'Emphasized' : 'Default' }";
        }
        switch (oCriticalityProperty.$EnumMember) {
          // supported criticality are [Positive/3/'3'] and [Negative/1/'1']
          case "com.sap.vocabularies.UI.v1.CriticalityType/Negative":
          case "com.sap.vocabularies.UI.v1.CriticalityType/Positive":
          case "1":
          case 1:
          case "3":
          case 3:
            if (!oDataFieldHidden) {
              sFormatEmphasizedExpression = ButtonType.Default;
              bIsAlwaysDefault = true;
            }
            sFormatEmphasizedExpression = sFormatEmphasizedExpression || ButtonType.Default;
            break;
          default:
            sFormatEmphasizedExpression = ButtonType.Emphasized;
        }
        if (oCriticalityProperty.$Path) {
          // when Criticality is set using a path, use the path for deducing the Emphsized type for default Primary Action
          const sCombinedHiddenExpression = sHiddenExpression ? "!(" + sHiddenExpression + ") && " : "";
          sFormatEmphasizedExpression = "{= " + sCombinedHiddenExpression + "((${" + oCriticalityProperty.$Path + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Negative') || (${" + oCriticalityProperty.$Path + "} === '1') || (${" + oCriticalityProperty.$Path + "} === 1) " + "|| (${" + oCriticalityProperty.$Path + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Positive') || (${" + oCriticalityProperty.$Path + "} === '3') || (${" + oCriticalityProperty.$Path + "} === 3)) ? " + "'Default'" + " : " + "'Emphasized'" + " }";
        }
      }
    });
    return sFormatEmphasizedExpression || ButtonType.Emphasized;
  };
  _exports.buildEmphasizedButtonExpression = buildEmphasizedButtonExpression;
  const getElementBinding = function (sPath) {
    const sNavigationPath = ODataModelAnnotationHelper.getNavigationPath(sPath);
    if (sNavigationPath) {
      return "{path:'" + sNavigationPath + "'}";
    } else {
      //no navigation property needs empty object
      return "{path: ''}";
    }
  };

  /**
   * Function to check if draft pattern is supported.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns the Boolean value based on draft state
   */
  _exports.getElementBinding = getElementBinding;
  const checkDraftState = function (oAnnotations) {
    if (oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] && oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["EditAction"]) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchToActive button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.checkDraftState = checkDraftState;
  const getSwitchToActiveVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( ${ui>/isEditable} && !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchToDraft button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.getSwitchToActiveVisibility = getSwitchToActiveVisibility;
  const getSwitchToDraftVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !(${ui>/isEditable}) && !${ui>createMode} && ${HasDraftEntity} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchDraftAndActive button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.getSwitchToDraftVisibility = getSwitchToDraftVisibility;
  const getSwitchDraftAndActiveVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to find an action from the array of header actions in the converter context.
   *
   * @param aConverterContextHeaderActions Array of 'header' actions on the object page.
   * @param sActionType The action type
   * @returns The action with the matching action type
   * @private
   */
  _exports.getSwitchDraftAndActiveVisibility = getSwitchDraftAndActiveVisibility;
  const _findAction = function (aConverterContextHeaderActions, sActionType) {
    let oAction;
    if (aConverterContextHeaderActions && aConverterContextHeaderActions.length) {
      oAction = aConverterContextHeaderActions.find(function (oHeaderAction) {
        return oHeaderAction.type === sActionType;
      });
    }
    return oAction;
  };

  /**
   * Function to format the 'enabled' property for the Delete button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports._findAction = _findAction;
  const getDeleteCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.enabled : "true";
  };

  /**
   * Function to format the 'visible' property for the Delete button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionEnabled = getDeleteCommandExecutionEnabled;
  const getDeleteCommandExecutionVisible = function (aConverterContextHeaderActions) {
    const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.visible : "true";
  };

  /**
   * Function to format the 'visible' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionVisible = getDeleteCommandExecutionVisible;
  const getEditCommandExecutionVisible = function (aConverterContextHeaderActions) {
    const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.visible : "false";
  };

  /**
   * Function to format the 'enabled' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getEditCommandExecutionVisible = getEditCommandExecutionVisible;
  const getEditCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.enabled : "false";
  };

  /**
   * Function to get the EditAction from the based on a draft-enabled application or a sticky application.
   *
   * @param [oEntitySet] The value from the expression.
   * @returns Returns expression binding or Boolean value based on vRawValue & oDraftNode
   */
  _exports.getEditCommandExecutionEnabled = getEditCommandExecutionEnabled;
  const getEditAction = function (oEntitySet) {
    const sPath = oEntitySet.getPath();
    const aPaths = sPath.split("/");
    const rootEntitySetPath = "/" + aPaths[1];
    // get the edit action from root entity sets
    const rootEntitySetAnnnotations = oEntitySet.getObject(rootEntitySetPath + "@");
    const bDraftRoot = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftRoot");
    const bDraftNode = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftNode");
    const bStickySession = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Session.v1.StickySessionSupported");
    let sActionName;
    if (bDraftRoot) {
      sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/EditAction`);
    } else if (bDraftNode) {
      sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Common.v1.DraftNode/EditAction`);
    } else if (bStickySession) {
      sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/EditAction`);
    }
    return !sActionName ? sActionName : `${rootEntitySetPath}/${sActionName}`;
  };
  _exports.getEditAction = getEditAction;
  const isReadOnlyFromStaticAnnotations = function (oAnnotations, oFieldControl) {
    let bComputed, bImmutable, bReadOnly;
    if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Computed"]) {
      bComputed = oAnnotations["@Org.OData.Core.V1.Computed"].Bool ? oAnnotations["@Org.OData.Core.V1.Computed"].Bool == "true" : true;
    }
    if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Immutable"]) {
      bImmutable = oAnnotations["@Org.OData.Core.V1.Immutable"].Bool ? oAnnotations["@Org.OData.Core.V1.Immutable"].Bool == "true" : true;
    }
    bReadOnly = bComputed || bImmutable;
    if (oFieldControl) {
      bReadOnly = bReadOnly || oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly";
    }
    if (bReadOnly) {
      return true;
    } else {
      return false;
    }
  };
  _exports.isReadOnlyFromStaticAnnotations = isReadOnlyFromStaticAnnotations;
  const readOnlyExpressionFromDynamicAnnotations = function (oFieldControl) {
    let sIsFieldControlPathReadOnly;
    if (oFieldControl) {
      if (ManagedObject.bindingParser(oFieldControl)) {
        sIsFieldControlPathReadOnly = "%" + oFieldControl + " === 1 ";
      }
    }
    if (sIsFieldControlPathReadOnly) {
      return "{= " + sIsFieldControlPathReadOnly + "? false : true }";
    } else {
      return undefined;
    }
  };

  /*
   * Function to get the expression for chart Title Press
   *
   * @functionw
   * @param {oConfiguration} [oConfigurations] control configuration from manifest
   *  @param {oManifest} [oManifest] Outbounds from manifest
   * returns {String} [sCollectionName] Collection Name of the Micro Chart
   *
   * returns {String} [Expression] Handler Expression for the title press
   *
   */
  _exports.readOnlyExpressionFromDynamicAnnotations = readOnlyExpressionFromDynamicAnnotations;
  const getExpressionForMicroChartTitlePress = function (oConfiguration, oManifestOutbound, sCollectionName) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] || oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] && oConfiguration["targetSections"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>/},'" + JSON.stringify(oManifestOutbound) + "','" + oConfiguration["targetOutbound"]["outbound"] + "','" + sCollectionName + "' )";
      } else if (oConfiguration["targetSections"]) {
        return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
      } else {
        return undefined;
      }
    }
  };

  /*
   * Function to render Chart Title as Link
   *
   * @function
   * @param {oControlConfiguration} [oConfigurations] control configuration from manifest
   * returns {String} [sKey] For the TargetOutbound and TargetSection
   *
   */
  _exports.getExpressionForMicroChartTitlePress = getExpressionForMicroChartTitlePress;
  const getMicroChartTitleAsLink = function (oControlConfiguration) {
    if (oControlConfiguration && (oControlConfiguration["targetOutbound"] || oControlConfiguration["targetOutbound"] && oControlConfiguration["targetSections"])) {
      return "External";
    } else if (oControlConfiguration && oControlConfiguration["targetSections"]) {
      return "InPage";
    } else {
      return "None";
    }
  };

  /* Get groupId from control configuration
   *
   * @function
   * @param {Object} [oConfigurations] control configuration from manifest
   * @param {String} [sAnnotationPath] Annotation Path for the configuration
   * @description Used to get the groupId for DataPoints and MicroCharts in the Header.
   *
   */
  _exports.getMicroChartTitleAsLink = getMicroChartTitleAsLink;
  const getGroupIdFromConfig = function (oConfigurations, sAnnotationPath, sDefaultGroupId) {
    const oConfiguration = oConfigurations[sAnnotationPath],
      aAutoPatterns = ["Heroes", "Decoration", "Workers", "LongRunners"];
    let sGroupId = sDefaultGroupId;
    if (oConfiguration && oConfiguration.requestGroupId && aAutoPatterns.some(function (autoPattern) {
      return autoPattern === oConfiguration.requestGroupId;
    })) {
      sGroupId = "$auto." + oConfiguration.requestGroupId;
    }
    return sGroupId;
  };

  /*
   * Get Context Binding with groupId from control configuration
   *
   * @function
   * @param {Object} [oConfigurations] control configuration from manifest
   * @param {String} [sKey] Annotation Path for of the configuration
   * @description Used to get the binding for DataPoints in the Header.
   *
   */
  _exports.getGroupIdFromConfig = getGroupIdFromConfig;
  const getBindingWithGroupIdFromConfig = function (oConfigurations, sKey) {
    const sGroupId = getGroupIdFromConfig(oConfigurations, sKey);
    let sBinding;
    if (sGroupId) {
      sBinding = "{ path : '', parameters : { $$groupId : '" + sGroupId + "' } }";
    }
    return sBinding;
  };

  /**
   * Method to check whether a FieldGroup consists of only 1 DataField with MultiLine Text annotation.
   *
   * @param aFormElements A collection of form elements used in the current field group
   * @returns Returns true if only 1 data field with Multiline Text annotation exists.
   */
  _exports.getBindingWithGroupIdFromConfig = getBindingWithGroupIdFromConfig;
  const doesFieldGroupContainOnlyOneMultiLineDataField = function (aFormElements) {
    return aFormElements && aFormElements.length === 1 && !!aFormElements[0].isValueMultilineText;
  };

  /*
   * Get Visiblity of breadcrumbs.
   *
   * @function
   * @param {Object} [oViewData] ViewData model
   * returns {*} Expression or boolean
   */
  _exports.doesFieldGroupContainOnlyOneMultiLineDataField = doesFieldGroupContainOnlyOneMultiLineDataField;
  const getVisibleExpressionForBreadcrumbs = function (oViewData) {
    return oViewData.showBreadCrumbs && oViewData.fclEnabled !== undefined ? "{fclhelper>/breadCrumbIsVisible}" : oViewData.showBreadCrumbs;
  };
  _exports.getVisibleExpressionForBreadcrumbs = getVisibleExpressionForBreadcrumbs;
  const getShareButtonVisibility = function (viewData) {
    let sShareButtonVisibilityExp = "!${ui>createMode}";
    if (viewData.fclEnabled) {
      sShareButtonVisibilityExp = "${fclhelper>/showShareIcon} && " + sShareButtonVisibilityExp;
    }
    return "{= " + sShareButtonVisibilityExp + " }";
  };

  /*
   * Gets the visibility of the header info in edit mode
   *
   * If either the title or description field from the header annotations are editable, then the
   * editable header info is visible.
   *
   * @function
   * @param {object} [oAnnotations] Annotations object for given entity set
   * @param {object} [oFieldControl] field control
   * returns {*}  binding expression or boolean value resolved form funcitons isReadOnlyFromStaticAnnotations and isReadOnlyFromDynamicAnnotations
   */
  _exports.getShareButtonVisibility = getShareButtonVisibility;
  const getVisiblityOfHeaderInfo = function (oTitleAnnotations, oDescriptionAnnotations, oFieldTitleFieldControl, oFieldDescriptionFieldControl) {
    // Check Annotations for Title Field
    // Set to true and don't take into account, if there are no annotations, i.e. no title exists
    const bIsTitleReadOnly = oTitleAnnotations ? isReadOnlyFromStaticAnnotations(oTitleAnnotations, oFieldTitleFieldControl) : true;
    const titleExpression = readOnlyExpressionFromDynamicAnnotations(oFieldTitleFieldControl);
    // There is no expression and the title is not ready only, this is sufficient for an editable header
    if (!bIsTitleReadOnly && !titleExpression) {
      return true;
    }

    // Check Annotations for Description Field
    // Set to true and don't take into account, if there are no annotations, i.e. no description exists
    const bIsDescriptionReadOnly = oDescriptionAnnotations ? isReadOnlyFromStaticAnnotations(oDescriptionAnnotations, oFieldDescriptionFieldControl) : true;
    const descriptionExpression = readOnlyExpressionFromDynamicAnnotations(oFieldDescriptionFieldControl);
    // There is no expression and the description is not ready only, this is sufficient for an editable header
    if (!bIsDescriptionReadOnly && !descriptionExpression) {
      return true;
    }

    // Both title and description are not editable and there are no dynamic annotations
    if (bIsTitleReadOnly && bIsDescriptionReadOnly && !titleExpression && !descriptionExpression) {
      return false;
    }

    // Now combine expressions
    if (titleExpression && !descriptionExpression) {
      return titleExpression;
    } else if (!titleExpression && descriptionExpression) {
      return descriptionExpression;
    } else {
      return combineTitleAndDescriptionExpression(oFieldTitleFieldControl, oFieldDescriptionFieldControl);
    }
  };
  _exports.getVisiblityOfHeaderInfo = getVisiblityOfHeaderInfo;
  const combineTitleAndDescriptionExpression = function (oTitleFieldControl, oDescriptionFieldControl) {
    // If both header and title field are based on dynmaic field control, the editable header
    // is visible if at least one of these is not ready only
    return "{= %" + oTitleFieldControl + " === 1 ? ( %" + oDescriptionFieldControl + " === 1 ? false : true ) : true }";
  };

  /*
   * Get Expression of press event of delete button.
   *
   * @function
   * @param {string} [sEntitySetName] Entity set name
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.combineTitleAndDescriptionExpression = combineTitleAndDescriptionExpression;
  const getPressExpressionForDelete = function (entitySet, oInterface) {
    const sDeletableContexts = "${$view>/getBindingContext}",
      sTitle = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedHeading/getItems/1/getText}",
      sDescription = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedContent/0/getItems/0/getText}";
    const esContext = oInterface && oInterface.context;
    const contextPath = esContext.getPath();
    const contextPathParts = contextPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const sEntitySetName = contextPathParts.length > 1 ? esContext.getModel().getObject(`/${contextPathParts.join("/")}@sapui.name`) : contextPathParts[0];
    const oParams = {
      title: sTitle,
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      description: sDescription
    };
    return CommonHelper.generateFunction(".editFlow.deleteDocument", sDeletableContexts, CommonHelper.objectToString(oParams));
  };
  getPressExpressionForDelete.requiresIContext = true;

  /*
   * Get Expression of press event of Edit button.
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.getPressExpressionForDelete = getPressExpressionForDelete;
  const getPressExpressionForEdit = function (oDataField, sEntitySetName, oHeaderAction) {
    const sEditableContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/getBindingContext}",
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField && oDataField.Label, true),
      isNavigable: oHeaderAction && oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sEditableContexts, CommonHelper.objectToString(oParams));
  };

  /*
   * Method to get the expression for the 'press' event for footer annotation actions
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * returns {string}  Binding expression or function string that is generated from the Commonhelper's function generateFunction
   */
  _exports.getPressExpressionForEdit = getPressExpressionForEdit;
  const getPressExpressionForFooterAnnotationAction = function (oDataField, sEntitySetName, oHeaderAction) {
    const sActionContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField && oDataField.Label, true),
      isNavigable: oHeaderAction && oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sActionContexts, CommonHelper.objectToString(oParams));
  };

  /*
   * Get Expression of execute event expression of primary action.
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * @param {CompiledBindingToolkitExpression | string} The visibility of sematic positive action
   * @param {CompiledBindingToolkitExpression | string} The enablement of semantic positive action
   * @param {CompiledBindingToolkitExpression | string} The Edit button visibility
   * @param {CompiledBindingToolkitExpression | string} The enablement of Edit button
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.getPressExpressionForFooterAnnotationAction = getPressExpressionForFooterAnnotationAction;
  const getPressExpressionForPrimaryAction = function (oDataField, sEntitySetName, oHeaderAction, positiveActionVisible, positiveActionEnabled, editActionVisible, editActionEnabled) {
    const sActionContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: sEntitySetName ? CommonHelper.addSingleQuotes(sEntitySetName) : "",
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField === null || oDataField === void 0 ? void 0 : oDataField.Label, true),
      isNavigable: oHeaderAction === null || oHeaderAction === void 0 ? void 0 : oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction !== null && oHeaderAction !== void 0 && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    const oConditions = {
      positiveActionVisible,
      positiveActionEnabled,
      editActionVisible,
      editActionEnabled
    };
    return CommonHelper.generateFunction(".handlers.onPrimaryAction", "$controller", "${$view>/}", "${$view>/getBindingContext}", sActionContexts, CommonHelper.objectToString(oParams), CommonHelper.objectToString(oConditions));
  };

  /*
   * Gets the binding of the container HBox for the header facet.
   *
   * @function
   * @param {object} [oControlConfiguration] The control configuration form of the viewData model
   * @param {object} [oHeaderFacet] The object of the header facet
   * returns {*}  The binding expression from function getBindingWithGroupIdFromConfig or undefined.
   */
  _exports.getPressExpressionForPrimaryAction = getPressExpressionForPrimaryAction;
  const getStashableHBoxBinding = function (oControlConfiguration, oHeaderFacet) {
    if (oHeaderFacet && oHeaderFacet.Facet && oHeaderFacet.Facet.targetAnnotationType === "DataPoint") {
      return getBindingWithGroupIdFromConfig(oControlConfiguration, oHeaderFacet.Facet.targetAnnotationValue);
    }
  };

  /*
   * Gets the 'Press' event expression for the external and internal data point link.
   *
   * @function
   * @param {object} [oConfiguration] Control configuration from manifest
   * @param {object} [oManifestOutbound] Outbounds from manifest
   * returns {string} The runtime binding of the 'Press' event
   */
  _exports.getStashableHBoxBinding = getStashableHBoxBinding;
  const getPressExpressionForLink = function (oConfiguration, oManifestOutbound) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>}, " + JSON.stringify(oManifestOutbound) + "," + JSON.stringify(oConfiguration["targetOutbound"]["outbound"]) + ")";
      } else if (oConfiguration["targetSections"]) {
        return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
      } else {
        return undefined;
      }
    }
  };
  _exports.getPressExpressionForLink = getPressExpressionForLink;
  const getHeaderFormHboxRenderType = function (dataField) {
    var _dataField$targetObje;
    if ((dataField === null || dataField === void 0 ? void 0 : (_dataField$targetObje = dataField.targetObject) === null || _dataField$targetObje === void 0 ? void 0 : _dataField$targetObje.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      return undefined;
    }
    return "Bare";
  };

  /**
   * The default action group handler that is invoked when adding the menu button handling appropriately.
   *
   * @param oCtx The current context in which the handler is called
   * @param oAction The current action context
   * @param oDataFieldForDefaultAction The current dataField for the default action
   * @param defaultActionContextOrEntitySet The current context for the default action
   * @returns The appropriate expression string
   */
  _exports.getHeaderFormHboxRenderType = getHeaderFormHboxRenderType;
  function getDefaultActionHandler(oCtx, oAction, oDataFieldForDefaultAction, defaultActionContextOrEntitySet) {
    if (oAction.defaultAction) {
      try {
        switch (oAction.defaultAction.type) {
          case "ForAction":
            {
              return getPressExpressionForEdit(oDataFieldForDefaultAction, defaultActionContextOrEntitySet, oAction.defaultAction);
            }
          case "ForNavigation":
            {
              if (oAction.defaultAction.command) {
                return "cmd:" + oAction.defaultAction.command;
              } else {
                return oAction.defaultAction.press;
              }
            }
          default:
            {
              if (oAction.defaultAction.command) {
                return "cmd:" + oAction.defaultAction.command;
              }
              if (oAction.defaultAction.noWrap) {
                return oAction.defaultAction.press;
              } else {
                return CommonHelper.buildActionWrapper(oAction.defaultAction, {
                  id: "forTheObjectPage"
                });
              }
            }
        }
      } catch (ioEx) {
        return "binding for the default action is not working as expected";
      }
    }
    return undefined;
  }
  _exports.getDefaultActionHandler = getDefaultActionHandler;
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/ObjectPageTemplating", ["sap/fe/core/CommonUtils","sap/fe/core/converters/helpers/BindingHelper","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/ModelHelper","sap/fe/core/templating/DataModelPathHelper","sap/fe/macros/CommonHelper","sap/fe/macros/field/FieldTemplating","sap/fe/macros/internal/form/FormTemplating","sap/m/library","sap/ui/base/ManagedObject","sap/ui/model/odata/v4/AnnotationHelper"],function(e,t,n,o,i,a,r,s,l,u,c){"use strict";var d={};var f=s.getLabelForConnectedFields;var g=r.formatValueRecursively;var v=r.addTextArrangementToBindingExpression;var p=i.enhanceDataModelPath;var m=n.resolveBindingString;var b=n.or;var E=n.isEmpty;var T=n.ifElse;var $=n.getExpressionFromAnnotation;var y=n.constant;var h=n.concat;var A=n.compileExpression;var S=n.and;var C=t.UI;var D=t.Entity;var O=t.Draft;const F=l.ButtonType;const x=function(t,n,o,i){var a,r,s,l;const u=e.getTranslatedText("T_NEW_OBJECT",n.resourceBundle,undefined,n.entitySet);const c=e.getTranslatedText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE",n.resourceBundle,undefined,n.entitySet);const d=(t===null||t===void 0?void 0:t.Title)===undefined||(t===null||t===void 0?void 0:t.Title)===""||(t===null||t===void 0?void 0:(a=t.Title)===null||a===void 0?void 0:a.Value)==="";const b=!d?e.getTranslatedText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO",n.resourceBundle):"";let O,F,x=y(true),I;if((t===null||t===void 0?void 0:(r=t.Title)===null||r===void 0?void 0:r.$Type)==="com.sap.vocabularies.UI.v1.DataField"){var P,B,V,N,_,M,w,H,G,U,j;O=$(t===null||t===void 0?void 0:(P=t.Title)===null||P===void 0?void 0:P.Value);if(t!==null&&t!==void 0&&(B=t.Title)!==null&&B!==void 0&&(V=B.Value)!==null&&V!==void 0&&(N=V.$target)!==null&&N!==void 0&&(_=N.annotations)!==null&&_!==void 0&&(M=_.Common)!==null&&M!==void 0&&(w=M.Text)!==null&&w!==void 0&&(H=w.annotations)!==null&&H!==void 0&&(G=H.UI)!==null&&G!==void 0&&G.TextArrangement){O=v(O,o)}O=g(O,o);x=((U=O)===null||U===void 0?void 0:U._type)==="Constant"?y(!((j=O)!==null&&j!==void 0&&j.value)):E(O)}else if((t===null||t===void 0?void 0:(s=t.Title)===null||s===void 0?void 0:s.$Type)==="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"&&(t===null||t===void 0?void 0:(l=t.Title)===null||l===void 0?void 0:l.Target.$target.$Type)==="com.sap.vocabularies.UI.v1.ConnectedFieldsType"){var R,L;F=p(o,"$Type/@UI.HeaderInfo/Title/Target/$AnnotationPath");O=f(F,false);I=((R=O)===null||R===void 0?void 0:R._type)==="Constant"?y(!((L=O)!==null&&L!==void 0&&L.value)):E(O);x=O?I:y(true)}const Q=t!==null&&t!==void 0&&t.TypeName?h(c,": ",m(t.TypeName.toString())):u;const k=i?D.IsActive:true;return A(T(S(C.IsCreateMode,x),Q,T(S(k,x),b,O)))};d.getExpressionForTitle=x;const I=function(e,t){var n,o,i,a,r,s,l,u,c;let d=$(e===null||e===void 0?void 0:(n=e.Description)===null||n===void 0?void 0:n.Value);if(e!==null&&e!==void 0&&(o=e.Description)!==null&&o!==void 0&&(i=o.Value)!==null&&i!==void 0&&(a=i.$target)!==null&&a!==void 0&&(r=a.annotations)!==null&&r!==void 0&&(s=r.Common)!==null&&s!==void 0&&(l=s.Text)!==null&&l!==void 0&&(u=l.annotations)!==null&&u!==void 0&&(c=u.UI)!==null&&c!==void 0&&c.TextArrangement){d=v(d,t)}return A(g(d,t))};d.getExpressionForDescription=I;const P=function(t,n){var o;const i=e.getTranslatedText("T_OP_OBJECT_PAGE_SAVE",t.resourceBundle);const a=e.getTranslatedText("T_OP_OBJECT_PAGE_CREATE",t.resourceBundle);let r;if((o=n.startingEntitySet.annotations.Session)!==null&&o!==void 0&&o.StickySessionSupported){r=T(C.IsCreateMode,a,i)}else{r=T(O.IsNewObject,a,i)}return A(r)};d.getExpressionForSaveButton=P;const B=function(e,t){const n=e.filter(e=>N(e));let o;if(n.length){const e=n.map(e=>m(e.visible,"boolean"));o=b(...e);const i=V(t,true);return A(b(o,m(i,"boolean")))}return V(t,true)};d.getFooterVisible=B;const V=function(e,t){let n="";let o;const i=[];for(const t in e){const n=e[t];if(n.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"&&n.Determining===true){const e=n[`@${"com.sap.vocabularies.UI.v1.Hidden"}`];if(!e){return true}else if(e.$Path){if(i.indexOf(e.$Path)===-1){i.push(e.$Path)}}}}if(i.length){for(let e=0;e<i.length;e++){if(i[e]){o="(%{"+i[e]+"} === true ? false : true )"}if(e==i.length-1){n=n+o}else{n=n+o+"||"}}return"{= "+(t?"(":"")+n+(t?" || ${ui>/isEditable}) ":" ")+"&& ${internal>isCreateDialogOpen} !== true}"}else{return"{= "+(t?"${ui>/isEditable} && ":"")+"${internal>isCreateDialogOpen} !== true}"}};d.getDataFieldBasedFooterVisibility=V;const N=function(e){const t=["Primary","DefaultApply","Secondary","ForAction","ForNavigation","SwitchToActiveObject","SwitchToDraftObject","DraftActions","Copy"];return t.indexOf(e.type)<0};d.isManifestAction=N;const _=function(e){if(!e){return F.Emphasized}let t;let n,o,i="";e.forEach(function(e){const a=e.Criticality;const r=e["@com.sap.vocabularies.UI.v1.Hidden"];if(e.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"&&!n&&a){if(!t&&r===true){t=F.Emphasized;return}if(r&&r.$Path){o=r.$Path;if(i){i=i+" && "}i=i+"%{"+o+"} === true";t="{= ("+i+") ? 'Emphasized' : 'Default' }"}switch(a.$EnumMember){case"com.sap.vocabularies.UI.v1.CriticalityType/Negative":case"com.sap.vocabularies.UI.v1.CriticalityType/Positive":case"1":case 1:case"3":case 3:if(!r){t=F.Default;n=true}t=t||F.Default;break;default:t=F.Emphasized}if(a.$Path){const e=i?"!("+i+") && ":"";t="{= "+e+"((${"+a.$Path+"} === 'com.sap.vocabularies.UI.v1.CriticalityType/Negative') || (${"+a.$Path+"} === '1') || (${"+a.$Path+"} === 1) "+"|| (${"+a.$Path+"} === 'com.sap.vocabularies.UI.v1.CriticalityType/Positive') || (${"+a.$Path+"} === '3') || (${"+a.$Path+"} === 3)) ? "+"'Default'"+" : "+"'Emphasized'"+" }"}}});return t||F.Emphasized};d.buildEmphasizedButtonExpression=_;const M=function(e){const t=c.getNavigationPath(e);if(t){return"{path:'"+t+"'}"}else{return"{path: ''}"}};d.getElementBinding=M;const w=function(e){if(e["@com.sap.vocabularies.Common.v1.DraftRoot"]&&e["@com.sap.vocabularies.Common.v1.DraftRoot"]["EditAction"]){return true}else{return false}};d.checkDraftState=w;const H=function(e){if(w(e)){return"{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( ${ui>/isEditable} && !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }"}else{return false}};d.getSwitchToActiveVisibility=H;const G=function(e){if(w(e)){return"{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !(${ui>/isEditable}) && !${ui>createMode} && ${HasDraftEntity} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }"}else{return false}};d.getSwitchToDraftVisibility=G;const U=function(e){if(w(e)){return"{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }"}else{return false}};d.getSwitchDraftAndActiveVisibility=U;const j=function(e,t){let n;if(e&&e.length){n=e.find(function(e){return e.type===t})}return n};d._findAction=j;const R=function(e){const t=j(e,"Secondary");return t?t.enabled:"true"};d.getDeleteCommandExecutionEnabled=R;const L=function(e){const t=j(e,"Secondary");return t?t.visible:"true"};d.getDeleteCommandExecutionVisible=L;const Q=function(e){const t=j(e,"Primary");return t?t.visible:"false"};d.getEditCommandExecutionVisible=Q;const k=function(e){const t=j(e,"Primary");return t?t.enabled:"false"};d.getEditCommandExecutionEnabled=k;const J=function(e){const t=e.getPath();const n=t.split("/");const o="/"+n[1];const i=e.getObject(o+"@");const a=i.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftRoot");const r=i.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftNode");const s=i.hasOwnProperty("@com.sap.vocabularies.Session.v1.StickySessionSupported");let l;if(a){l=e.getObject(`${o}@com.sap.vocabularies.Common.v1.DraftRoot/EditAction`)}else if(r){l=e.getObject(`${o}@com.sap.vocabularies.Common.v1.DraftNode/EditAction`)}else if(s){l=e.getObject(`${o}@com.sap.vocabularies.Session.v1.StickySessionSupported/EditAction`)}return!l?l:`${o}/${l}`};d.getEditAction=J;const z=function(e,t){let n,o,i;if(e&&e["@Org.OData.Core.V1.Computed"]){n=e["@Org.OData.Core.V1.Computed"].Bool?e["@Org.OData.Core.V1.Computed"].Bool=="true":true}if(e&&e["@Org.OData.Core.V1.Immutable"]){o=e["@Org.OData.Core.V1.Immutable"].Bool?e["@Org.OData.Core.V1.Immutable"].Bool=="true":true}i=n||o;if(t){i=i||t=="com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly"}if(i){return true}else{return false}};d.isReadOnlyFromStaticAnnotations=z;const W=function(e){let t;if(e){if(u.bindingParser(e)){t="%"+e+" === 1 "}}if(t){return"{= "+t+"? false : true }"}else{return undefined}};d.readOnlyExpressionFromDynamicAnnotations=W;const q=function(e,t,n){if(e){if(e["targetOutbound"]&&e["targetOutbound"]["outbound"]||e["targetOutbound"]&&e["targetOutbound"]["outbound"]&&e["targetSections"]){return".handlers.onDataPointTitlePressed($controller, ${$source>/},'"+JSON.stringify(t)+"','"+e["targetOutbound"]["outbound"]+"','"+n+"' )"}else if(e["targetSections"]){return".handlers.navigateToSubSection($controller, '"+JSON.stringify(e["targetSections"])+"')"}else{return undefined}}};d.getExpressionForMicroChartTitlePress=q;const K=function(e){if(e&&(e["targetOutbound"]||e["targetOutbound"]&&e["targetSections"])){return"External"}else if(e&&e["targetSections"]){return"InPage"}else{return"None"}};d.getMicroChartTitleAsLink=K;const X=function(e,t,n){const o=e[t],i=["Heroes","Decoration","Workers","LongRunners"];let a=n;if(o&&o.requestGroupId&&i.some(function(e){return e===o.requestGroupId})){a="$auto."+o.requestGroupId}return a};d.getGroupIdFromConfig=X;const Y=function(e,t){const n=X(e,t);let o;if(n){o="{ path : '', parameters : { $$groupId : '"+n+"' } }"}return o};d.getBindingWithGroupIdFromConfig=Y;const Z=function(e){return e&&e.length===1&&!!e[0].isValueMultilineText};d.doesFieldGroupContainOnlyOneMultiLineDataField=Z;const ee=function(e){return e.showBreadCrumbs&&e.fclEnabled!==undefined?"{fclhelper>/breadCrumbIsVisible}":e.showBreadCrumbs};d.getVisibleExpressionForBreadcrumbs=ee;const te=function(e){let t="!${ui>createMode}";if(e.fclEnabled){t="${fclhelper>/showShareIcon} && "+t}return"{= "+t+" }"};d.getShareButtonVisibility=te;const ne=function(e,t,n,o){const i=e?z(e,n):true;const a=W(n);if(!i&&!a){return true}const r=t?z(t,o):true;const s=W(o);if(!r&&!s){return true}if(i&&r&&!a&&!s){return false}if(a&&!s){return a}else if(!a&&s){return s}else{return oe(n,o)}};d.getVisiblityOfHeaderInfo=ne;const oe=function(e,t){return"{= %"+e+" === 1 ? ( %"+t+" === 1 ? false : true ) : true }"};d.combineTitleAndDescriptionExpression=oe;const ie=function(e,t){const n="${$view>/getBindingContext}",i="${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedHeading/getItems/1/getText}",r="${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedContent/0/getItems/0/getText}";const s=t&&t.context;const l=s.getPath();const u=l.split("/").filter(o.filterOutNavPropBinding);const c=u.length>1?s.getModel().getObject(`/${u.join("/")}@sapui.name`):u[0];const d={title:i,entitySetName:a.addSingleQuotes(c),description:r};return a.generateFunction(".editFlow.deleteDocument",n,a.objectToString(d))};ie.requiresIContext=true;d.getPressExpressionForDelete=ie;const ae=function(e,t,n){const o=a.addSingleQuotes(e&&e.Action),i=e&&e.InvocationGrouping&&e.InvocationGrouping["$EnumMember"],r=i==="com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"?"ChangeSet":"Isolated";const s={contexts:"${$view>/getBindingContext}",entitySetName:a.addSingleQuotes(t),invocationGrouping:a.addSingleQuotes(r),model:"${$source>/}.getModel()",label:a.addSingleQuotes(e&&e.Label,true),isNavigable:n&&n.isNavigable,defaultValuesExtensionFunction:n&&n.defaultValuesExtensionFunction?`'${n.defaultValuesExtensionFunction}'`:undefined};return a.generateFunction(".handlers.onCallAction","${$view>/}",o,a.objectToString(s))};d.getPressExpressionForEdit=ae;const re=function(e,t,n){const o=a.addSingleQuotes(e&&e.Action),i=e&&e.InvocationGrouping&&e.InvocationGrouping["$EnumMember"],r=i==="com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"?"ChangeSet":"Isolated";const s={contexts:"${$view>/#fe::ObjectPage/}.getBindingContext()",entitySetName:a.addSingleQuotes(t),invocationGrouping:a.addSingleQuotes(r),model:"${$source>/}.getModel()",label:a.addSingleQuotes(e&&e.Label,true),isNavigable:n&&n.isNavigable,defaultValuesExtensionFunction:n&&n.defaultValuesExtensionFunction?`'${n.defaultValuesExtensionFunction}'`:undefined};return a.generateFunction(".handlers.onCallAction","${$view>/}",o,a.objectToString(s))};d.getPressExpressionForFooterAnnotationAction=re;const se=function(e,t,n,o,i,r,s){const l=a.addSingleQuotes(e&&e.Action),u=e&&e.InvocationGrouping&&e.InvocationGrouping["$EnumMember"],c=u==="com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"?"ChangeSet":"Isolated";const d={contexts:"${$view>/#fe::ObjectPage/}.getBindingContext()",entitySetName:t?a.addSingleQuotes(t):"",invocationGrouping:a.addSingleQuotes(c),model:"${$source>/}.getModel()",label:a.addSingleQuotes(e===null||e===void 0?void 0:e.Label,true),isNavigable:n===null||n===void 0?void 0:n.isNavigable,defaultValuesExtensionFunction:n!==null&&n!==void 0&&n.defaultValuesExtensionFunction?`'${n.defaultValuesExtensionFunction}'`:undefined};const f={positiveActionVisible:o,positiveActionEnabled:i,editActionVisible:r,editActionEnabled:s};return a.generateFunction(".handlers.onPrimaryAction","$controller","${$view>/}","${$view>/getBindingContext}",l,a.objectToString(d),a.objectToString(f))};d.getPressExpressionForPrimaryAction=se;const le=function(e,t){if(t&&t.Facet&&t.Facet.targetAnnotationType==="DataPoint"){return Y(e,t.Facet.targetAnnotationValue)}};d.getStashableHBoxBinding=le;const ue=function(e,t){if(e){if(e["targetOutbound"]&&e["targetOutbound"]["outbound"]){return".handlers.onDataPointTitlePressed($controller, ${$source>}, "+JSON.stringify(t)+","+JSON.stringify(e["targetOutbound"]["outbound"])+")"}else if(e["targetSections"]){return".handlers.navigateToSubSection($controller, '"+JSON.stringify(e["targetSections"])+"')"}else{return undefined}}};d.getPressExpressionForLink=ue;const ce=function(e){var t;if((e===null||e===void 0?void 0:(t=e.targetObject)===null||t===void 0?void 0:t.$Type)==="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"){return undefined}return"Bare"};d.getHeaderFormHboxRenderType=ce;function de(e,t,n,o){if(t.defaultAction){try{switch(t.defaultAction.type){case"ForAction":{return ae(n,o,t.defaultAction)}case"ForNavigation":{if(t.defaultAction.command){return"cmd:"+t.defaultAction.command}else{return t.defaultAction.press}}default:{if(t.defaultAction.command){return"cmd:"+t.defaultAction.command}if(t.defaultAction.noWrap){return t.defaultAction.press}else{return a.buildActionWrapper(t.defaultAction,{id:"forTheObjectPage"})}}}}catch(e){return"binding for the default action is not working as expected"}}return undefined}d.getDefaultActionHandler=de;return d},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/components/DraftHandlerButton-dbg", ["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ClassSupport", "sap/fe/templates/ObjectPage/ObjectPageTemplating", "sap/m/Button", "sap/m/ResponsivePopover", "sap/m/SelectList", "sap/ui/core/InvisibleText", "sap/ui/core/Item", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/jsxs", "sap/fe/core/jsx-runtime/Fragment"], function (BuildingBlock, CommonUtils, BindingHelper, BindingToolkit, ClassSupport, ObjectPageTemplating, Button, ResponsivePopover, SelectList, InvisibleText, Item, _jsx, _jsxs, _Fragment) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var _exports = {};
  var getSwitchDraftAndActiveVisibility = ObjectPageTemplating.getSwitchDraftAndActiveVisibility;
  var defineReference = ClassSupport.defineReference;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let DraftHandlerButton = (_dec = defineBuildingBlock({
    name: "DraftHandlerButton",
    namespace: "sap.fe.templates.ObjectPage.components",
    isRuntime: true
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec4 = defineReference(), _dec5 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(DraftHandlerButton, _BuildingBlockBase);
    function DraftHandlerButton(oProps) {
      var _this;
      _this = _BuildingBlockBase.call(this, oProps) || this;
      _this.SWITCH_TO_DRAFT_KEY = "switchToDraft";
      _this.SWITCH_TO_ACTIVE_KEY = "switchToActive";
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "switchToActiveRef", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "switchToDraftRef", _descriptor4, _assertThisInitialized(_this));
      _this.initialSelectedKey = _this.SWITCH_TO_ACTIVE_KEY;
      _this.handleSelectedItemChange = event => {
        const selectedItemKey = event.getParameter("item").getProperty("key");
        if (selectedItemKey !== _this.initialSelectedKey) {
          _this._containingView.getController().editFlow.toggleDraftActive(_this._containingView.getBindingContext());
        }
        if (_this.popover) {
          _this.popover.close();
          _this.popover.destroy();
          delete _this.popover;
        }
      };
      _this.openSwitchActivePopover = event => {
        const sourceControl = event.getSource();
        const containingView = CommonUtils.getTargetView(sourceControl);
        const context = containingView.getBindingContext();
        const isActiveEntity = context.getObject().IsActiveEntity;
        _this.initialSelectedKey = isActiveEntity ? _this.SWITCH_TO_ACTIVE_KEY : _this.SWITCH_TO_DRAFT_KEY;
        _this.popover = _this.createPopover();
        _this._containingView = containingView;
        containingView.addDependent(_this.popover);
        _this.popover.openBy(sourceControl);
        _this.popover.attachEventOnce("afterOpen", () => {
          if (isActiveEntity) {
            var _this$switchToDraftRe;
            (_this$switchToDraftRe = _this.switchToDraftRef.current) === null || _this$switchToDraftRe === void 0 ? void 0 : _this$switchToDraftRe.focus();
          } else {
            var _this$switchToActiveR;
            (_this$switchToActiveR = _this.switchToActiveRef.current) === null || _this$switchToActiveR === void 0 ? void 0 : _this$switchToActiveR.focus();
          }
        });
        return _this.popover;
      };
      return _this;
    }
    _exports = DraftHandlerButton;
    var _proto = DraftHandlerButton.prototype;
    _proto.createPopover = function createPopover() {
      return _jsx(ResponsivePopover, {
        showHeader: false,
        contentWidth: "15.625rem",
        verticalScrolling: false,
        class: "sapUiNoContentPadding",
        placement: "Bottom",
        children: _jsxs(SelectList, {
          selectedKey: this.initialSelectedKey,
          itemPress: this.handleSelectedItemChange,
          children: [_jsx(Item, {
            text: "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_DRAFT_MIT}",
            ref: this.switchToDraftRef
          }, this.SWITCH_TO_DRAFT_KEY), _jsx(Item, {
            text: "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_SAVED_VERSION_MIT}",
            ref: this.switchToActiveRef
          }, this.SWITCH_TO_ACTIVE_KEY)]
        })
      });
    };
    _proto.getContent = function getContent() {
      const textValue = ifElse(and(not(UI.IsEditable), not(UI.IsCreateMode), Entity.HasDraft), pathInModel("C_COMMON_OBJECT_PAGE_SAVED_VERSION_BUT", "sap.fe.i18n"), pathInModel("C_COMMON_OBJECT_PAGE_DRAFT_BUT", "sap.fe.i18n"));
      const visible = getSwitchDraftAndActiveVisibility(this.contextPath.getObject("@"));
      return _jsxs(_Fragment, {
        children: [_jsx(Button, {
          id: "fe::StandardAction::SwitchDraftAndActiveObject",
          text: textValue,
          visible: visible,
          icon: "sap-icon://navigation-down-arrow",
          iconFirst: false,
          type: "Transparent",
          press: this.openSwitchActivePopover,
          ariaDescribedBy: ["fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"]
        }), _jsx(InvisibleText, {
          text: "{sap.fe.i18n>T_HEADER_DATAPOINT_TITLE_DRAFT_SWITCHER_ARIA_BUTTON}",
          id: "fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"
        })]
      });
    };
    return DraftHandlerButton;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "switchToActiveRef", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "switchToDraftRef", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DraftHandlerButton;
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/components/DraftHandlerButton", ["sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/CommonUtils","sap/fe/core/converters/helpers/BindingHelper","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/ClassSupport","sap/fe/templates/ObjectPage/ObjectPageTemplating","sap/m/Button","sap/m/ResponsivePopover","sap/m/SelectList","sap/ui/core/InvisibleText","sap/ui/core/Item","sap/fe/core/jsx-runtime/jsx","sap/fe/core/jsx-runtime/jsxs","sap/fe/core/jsx-runtime/Fragment"],function(e,t,i,r,n,o,a,c,l,s,p,f,u,d){"use strict";var v,_,T,h,b,A,g,O,w,m,C;var E={};var S=o.getSwitchDraftAndActiveVisibility;var y=n.defineReference;var I=r.pathInModel;var D=r.not;var P=r.ifElse;var B=r.and;var R=i.UI;var j=i.Entity;var x=e.defineBuildingBlock;var H=e.BuildingBlockBase;var V=e.blockAttribute;function z(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function K(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function M(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;F(e,t)}function F(e,t){F=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return F(e,t)}function N(e,t,i,r,n){var o={};Object.keys(r).forEach(function(e){o[e]=r[e]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},o);if(n&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(n):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(e,t,o);o=null}return o}function W(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let Y=(v=x({name:"DraftHandlerButton",namespace:"sap.fe.templates.ObjectPage.components",isRuntime:true}),_=V({type:"string"}),T=V({type:"sap.ui.model.Context"}),h=y(),b=y(),v(A=(g=function(e){M(i,e);function i(i){var r;r=e.call(this,i)||this;r.SWITCH_TO_DRAFT_KEY="switchToDraft";r.SWITCH_TO_ACTIVE_KEY="switchToActive";z(r,"id",O,K(r));z(r,"contextPath",w,K(r));z(r,"switchToActiveRef",m,K(r));z(r,"switchToDraftRef",C,K(r));r.initialSelectedKey=r.SWITCH_TO_ACTIVE_KEY;r.handleSelectedItemChange=e=>{const t=e.getParameter("item").getProperty("key");if(t!==r.initialSelectedKey){r._containingView.getController().editFlow.toggleDraftActive(r._containingView.getBindingContext())}if(r.popover){r.popover.close();r.popover.destroy();delete r.popover}};r.openSwitchActivePopover=e=>{const i=e.getSource();const n=t.getTargetView(i);const o=n.getBindingContext();const a=o.getObject().IsActiveEntity;r.initialSelectedKey=a?r.SWITCH_TO_ACTIVE_KEY:r.SWITCH_TO_DRAFT_KEY;r.popover=r.createPopover();r._containingView=n;n.addDependent(r.popover);r.popover.openBy(i);r.popover.attachEventOnce("afterOpen",()=>{if(a){var e;(e=r.switchToDraftRef.current)===null||e===void 0?void 0:e.focus()}else{var t;(t=r.switchToActiveRef.current)===null||t===void 0?void 0:t.focus()}});return r.popover};return r}E=i;var r=i.prototype;r.createPopover=function e(){return f(c,{showHeader:false,contentWidth:"15.625rem",verticalScrolling:false,class:"sapUiNoContentPadding",placement:"Bottom",children:u(l,{selectedKey:this.initialSelectedKey,itemPress:this.handleSelectedItemChange,children:[f(p,{text:"{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_DRAFT_MIT}",ref:this.switchToDraftRef},this.SWITCH_TO_DRAFT_KEY),f(p,{text:"{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_SAVED_VERSION_MIT}",ref:this.switchToActiveRef},this.SWITCH_TO_ACTIVE_KEY)]})})};r.getContent=function e(){const t=P(B(D(R.IsEditable),D(R.IsCreateMode),j.HasDraft),I("C_COMMON_OBJECT_PAGE_SAVED_VERSION_BUT","sap.fe.i18n"),I("C_COMMON_OBJECT_PAGE_DRAFT_BUT","sap.fe.i18n"));const i=S(this.contextPath.getObject("@"));return u(d,{children:[f(a,{id:"fe::StandardAction::SwitchDraftAndActiveObject",text:t,visible:i,icon:"sap-icon://navigation-down-arrow",iconFirst:false,type:"Transparent",press:this.openSwitchActivePopover,ariaDescribedBy:["fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"]}),f(s,{text:"{sap.fe.i18n>T_HEADER_DATAPOINT_TITLE_DRAFT_SWITCHER_ARIA_BUTTON}",id:"fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"})]})};return i}(H),O=N(g.prototype,"id",[_],{configurable:true,enumerable:true,writable:true,initializer:null}),w=N(g.prototype,"contextPath",[T],{configurable:true,enumerable:true,writable:true,initializer:null}),m=N(g.prototype,"switchToActiveRef",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),C=N(g.prototype,"switchToDraftRef",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),g))||A);E=Y;return E},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/controls/StashableHBox-dbg", ["sap/fe/core/helpers/ClassSupport", "sap/m/HBox", "sap/ui/core/StashedControlSupport"], function (ClassSupport, HBox, StashedControlSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let StashableHBox = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.controls.StashableHBox", {
    designtime: "sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime"
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_HBox) {
    _inheritsLoose(StashableHBox, _HBox);
    function StashableHBox() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _HBox.call(this, ...args) || this;
      _initializerDefineProperty(_this, "title", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fallbackTitle", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = StashableHBox.prototype;
    /*
     * Set title of visible Title/Link control and own title property.
     */
    _proto.setTitle = function setTitle(sTitle) {
      const oControl = this.getTitleControl();
      if (oControl) {
        oControl.setText(sTitle);
      }
      this.title = sTitle;
      return this;
    }

    /*
     * Return the title property.
     */;
    _proto.getTitle = function getTitle() {
      return this.title || this.fallbackTitle;
    }

    /*
     * In case of UI changes, Title/Link text needs to be set to new value after Header Facet control and inner controls are rendered.
     * Else: title property needs to be initialized.
     */;
    _proto.onAfterRendering = function onAfterRendering() {
      if (this.title) {
        this.setTitle(this.title);
      } else {
        const oControl = this.getTitleControl();
        if (oControl) {
          this.title = oControl.getText();
        }
      }
    }

    /*
     * Retrieves Title/Link control from items aggregation.
     */;
    _proto.getTitleControl = function getTitleControl() {
      let aItems = [],
        content,
        i;
      if (this.getItems && this.getItems()[0] && this.getItems()[0].getItems) {
        aItems = this.getItems()[0].getItems();
      } else if (this.getItems && this.getItems()[0] && this.getItems()[0].getMicroChartTitle) {
        aItems = this.getItems()[0].getMicroChartTitle();
      }
      for (i = 0; i < aItems.length; i++) {
        if (aItems[i].isA("sap.m.Title") || aItems[i].isA("sap.m.Link")) {
          if (aItems[i].isA("sap.m.Title")) {
            // If a title was found, check if there is a link in the content aggregation
            content = aItems[i].getContent();
            if (content && content.isA("sap.m.Link")) {
              return content;
            }
          }
          return aItems[i];
        }
      }
      return null;
    };
    return StashableHBox;
  }(HBox), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fallbackTitle", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  StashedControlSupport.mixInto(StashableHBox);
  return StashableHBox;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/controls/StashableHBox", ["sap/fe/core/helpers/ClassSupport","sap/m/HBox","sap/ui/core/StashedControlSupport"],function(e,t,i){"use strict";var r,n,l,s,a,o,u;var f=e.property;var c=e.defineUI5Class;function p(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function h(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function g(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;b(e,t)}function b(e,t){b=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return b(e,t)}function m(e,t,i,r,n){var l={};Object.keys(r).forEach(function(e){l[e]=r[e]});l.enumerable=!!l.enumerable;l.configurable=!!l.configurable;if("value"in l||l.initializer){l.writable=true}l=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},l);if(n&&l.initializer!==void 0){l.value=l.initializer?l.initializer.call(n):void 0;l.initializer=undefined}if(l.initializer===void 0){Object.defineProperty(e,t,l);l=null}return l}function d(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let v=(r=c("sap.fe.templates.ObjectPage.controls.StashableHBox",{designtime:"sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime"}),n=f({type:"string"}),l=f({type:"string"}),r(s=(a=function(e){g(t,e);function t(){var t;for(var i=arguments.length,r=new Array(i),n=0;n<i;n++){r[n]=arguments[n]}t=e.call(this,...r)||this;p(t,"title",o,h(t));p(t,"fallbackTitle",u,h(t));return t}var i=t.prototype;i.setTitle=function e(t){const i=this.getTitleControl();if(i){i.setText(t)}this.title=t;return this};i.getTitle=function e(){return this.title||this.fallbackTitle};i.onAfterRendering=function e(){if(this.title){this.setTitle(this.title)}else{const e=this.getTitleControl();if(e){this.title=e.getText()}}};i.getTitleControl=function e(){let t=[],i,r;if(this.getItems&&this.getItems()[0]&&this.getItems()[0].getItems){t=this.getItems()[0].getItems()}else if(this.getItems&&this.getItems()[0]&&this.getItems()[0].getMicroChartTitle){t=this.getItems()[0].getMicroChartTitle()}for(r=0;r<t.length;r++){if(t[r].isA("sap.m.Title")||t[r].isA("sap.m.Link")){if(t[r].isA("sap.m.Title")){i=t[r].getContent();if(i&&i.isA("sap.m.Link")){return i}}return t[r]}}return null};return t}(t),o=m(a.prototype,"title",[n],{configurable:true,enumerable:true,writable:true,initializer:null}),u=m(a.prototype,"fallbackTitle",[l],{configurable:true,enumerable:true,writable:true,initializer:null}),a))||s);i.mixInto(v);return v},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/controls/StashableVBox-dbg", ["sap/fe/core/helpers/ClassSupport", "sap/m/VBox", "sap/ui/core/StashedControlSupport"], function (ClassSupport, VBox, StashedControlSupport) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let StashableVBox = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.controls.StashableVBox", {
    designtime: "sap/fe/templates/ObjectPage/designtime/StashableVBox.designtime"
  }), _dec(_class = /*#__PURE__*/function (_VBox) {
    _inheritsLoose(StashableVBox, _VBox);
    function StashableVBox() {
      return _VBox.apply(this, arguments) || this;
    }
    return StashableVBox;
  }(VBox)) || _class);
  StashedControlSupport.mixInto(StashableVBox);
  return StashableVBox;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/controls/StashableVBox", ["sap/fe/core/helpers/ClassSupport","sap/m/VBox","sap/ui/core/StashedControlSupport"],function(t,e,o){"use strict";var r,s;var n=t.defineUI5Class;function p(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;a(t,e)}function a(t,e){a=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,o){e.__proto__=o;return e};return a(t,e)}let i=(r=n("sap.fe.templates.ObjectPage.controls.StashableVBox",{designtime:"sap/fe/templates/ObjectPage/designtime/StashableVBox.designtime"}),r(s=function(t){p(e,t);function e(){return t.apply(this,arguments)||this}return e}(e))||s);o.mixInto(i);return i},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/controls/SubSectionBlock-dbg", ["sap/fe/core/helpers/ClassSupport", "sap/uxap/BlockBase", "sap/uxap/library"], function (ClassSupport, BlockBase, uxapLib) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const BlockBaseFormAdjustment = uxapLib.BlockBaseFormAdjustment;
  let SubSectionBlock = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.controls.SubSectionBlock"), _dec2 = property({
    type: "sap.uxap.BlockBaseColumnLayout",
    group: "Behavior",
    defaultValue: 4
  }), _dec3 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BlockBase) {
    _inheritsLoose(SubSectionBlock, _BlockBase);
    function SubSectionBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "columnLayout", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = SubSectionBlock.prototype;
    _proto.init = function init() {
      _BlockBase.prototype.init.call(this);
      this._bConnected = true;
    };
    _proto._applyFormAdjustment = function _applyFormAdjustment() {
      const sFormAdjustment = this.getFormAdjustment(),
        oView = this._getSelectedViewContent(),
        oParent = this._oParentObjectPageSubSection;
      let oFormAdjustmentFields;
      if (sFormAdjustment !== BlockBaseFormAdjustment.None && oView && oParent) {
        oFormAdjustmentFields = this._computeFormAdjustmentFields(sFormAdjustment, oParent._oLayoutConfig);
        this._adjustForm(oView, oFormAdjustmentFields);
      }
    };
    _proto.setMode = function setMode(sMode) {
      this.setProperty("mode", sMode);
      // OPTIONAL: this.internalModel.setProperty("/mode", sMode);
    };
    _proto.connectToModels = function connectToModels() {
      // View is already connected to the UI5 model tree, hence no extra logic required here
    }
    /// SubSectionBlock use aggregation instead of a view, i.e. return that as the view content
    ;
    _proto._getSelectedViewContent = function _getSelectedViewContent() {
      return this.getAggregation("content");
    };
    return SubSectionBlock;
  }(BlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "columnLayout", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return SubSectionBlock;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/controls/SubSectionBlock", ["sap/fe/core/helpers/ClassSupport","sap/uxap/BlockBase","sap/uxap/library"],function(e,t,r){"use strict";var n,i,o,a,u,l,c;var s=e.property;var p=e.defineUI5Class;var f=e.aggregation;function b(e,t,r,n){if(!r)return;Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(n):void 0})}function d(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function y(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;m(e,t)}function m(e,t){m=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return m(e,t)}function g(e,t,r,n,i){var o={};Object.keys(n).forEach(function(e){o[e]=n[e]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=r.slice().reverse().reduce(function(r,n){return n(e,t,r)||r},o);if(i&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(i):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(e,t,o);o=null}return o}function h(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}const v=r.BlockBaseFormAdjustment;let j=(n=p("sap.fe.templates.ObjectPage.controls.SubSectionBlock"),i=s({type:"sap.uxap.BlockBaseColumnLayout",group:"Behavior",defaultValue:4}),o=f({type:"sap.ui.core.Control",multiple:false}),n(a=(u=function(e){y(t,e);function t(){var t;for(var r=arguments.length,n=new Array(r),i=0;i<r;i++){n[i]=arguments[i]}t=e.call(this,...n)||this;b(t,"columnLayout",l,d(t));b(t,"content",c,d(t));return t}var r=t.prototype;r.init=function t(){e.prototype.init.call(this);this._bConnected=true};r._applyFormAdjustment=function e(){const t=this.getFormAdjustment(),r=this._getSelectedViewContent(),n=this._oParentObjectPageSubSection;let i;if(t!==v.None&&r&&n){i=this._computeFormAdjustmentFields(t,n._oLayoutConfig);this._adjustForm(r,i)}};r.setMode=function e(t){this.setProperty("mode",t)};r.connectToModels=function e(){};r._getSelectedViewContent=function e(){return this.getAggregation("content")};return t}(t),l=g(u.prototype,"columnLayout",[i],{configurable:true,enumerable:true,writable:true,initializer:null}),c=g(u.prototype,"content",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),u))||a);return j},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/flexibility/ScrollableHeaderContainer.flexibility-dbg", ["sap/ui/fl/changeHandler/MoveControls"], function (MoveControls) {
  "use strict";

  const ScrollableHeaderContainerFlexibility = {
    moveControls: {
      changeHandler: {
        applyChange: function (change, control, propertyBag) {
          return MoveControls.applyChange(change, control, {
            ...propertyBag,
            sourceAggregation: "content",
            targetAggregation: "content"
          });
        },
        // all 3 changeHandlers have to be implemented
        // if variant managemant should be relevant for the object page header in future,
        // it might be necessary to override also the revertChange handler
        revertChange: MoveControls.revertChange,
        completeChangeContent: MoveControls.completeChangeContent
      }
    }
  };
  return ScrollableHeaderContainerFlexibility;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/flexibility/ScrollableHeaderContainer.flexibility", ["sap/ui/fl/changeHandler/MoveControls"],function(e){"use strict";const n={moveControls:{changeHandler:{applyChange:function(n,t,a){return e.applyChange(n,t,{...a,sourceAggregation:"content",targetAggregation:"content"})},revertChange:e.revertChange,completeChangeContent:e.completeChangeContent}}};return n},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/flexibility/StashableHBox.flexibility-dbg", ["sap/ui/fl/changeHandler/BaseRename"], function (BaseRename) {
  "use strict";

  const StashableHBoxFlexibility = {
    stashControl: "default",
    unstashControl: "default",
    renameHeaderFacet: BaseRename.createRenameChangeHandler({
      propertyName: "title",
      translationTextType: "XFLD",
      changePropertyName: "headerFacetTitle"
    })
  };
  return StashableHBoxFlexibility;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/flexibility/StashableHBox.flexibility", ["sap/ui/fl/changeHandler/BaseRename"],function(e){"use strict";const a={stashControl:"default",unstashControl:"default",renameHeaderFacet:e.createRenameChangeHandler({propertyName:"title",translationTextType:"XFLD",changePropertyName:"headerFacetTitle"})};return a},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/flexibility/StashableVBox.flexibility-dbg", [], function () {
  "use strict";

  const StashableVBoxFlexibility = {
    stashControl: "default",
    unstashControl: "default",
    moveControls: "default"
  };
  return StashableVBoxFlexibility;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/flexibility/StashableVBox.flexibility", [],function(){"use strict";const t={stashControl:"default",unstashControl:"default",moveControls:"default"};return t},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/IntentBasedNavigation-dbg", ["sap/fe/core/CommonUtils", "sap/fe/navigation/SelectionVariant"], function (CommonUtils, SelectionVariant) {
  "use strict";

  const IntentBasedNavigationOverride = {
    adaptNavigationContext: function (oSelectionVariant, oTargetInfo) {
      const oView = this.getView(),
        oController = oView.getController(),
        sMergeContext = oController.intentBasedNavigation.adaptContextPreparationStrategy(oTargetInfo),
        oInternalModelContext = this.getView().getBindingContext("internal"),
        oExternalNavigationContext = oInternalModelContext.getProperty("externalNavigationContext");
      const oAppComponent = CommonUtils.getAppComponent(oView);
      const oMetaModel = oAppComponent.getModel().getMetaModel();
      if (oExternalNavigationContext.page && sMergeContext === "default") {
        const oPageContext = oView.getBindingContext(),
          sMetaPath = oMetaModel.getMetaPath(oPageContext.getPath());
        const oPageContextData = oController._intentBasedNavigation.removeSensitiveData(oPageContext.getObject(), sMetaPath),
          oPageData = oController._intentBasedNavigation.prepareContextForExternalNavigation(oPageContextData, oPageContext),
          oPagePropertiesWithoutConflict = oPageData.propertiesWithoutConflict,
          // TODO: move this also into the intent based navigation controller extension
          oPageSV = CommonUtils.addPageContextToSelectionVariant(new SelectionVariant(), oPageData.semanticAttributes, oView),
          oPropertiesWithoutConflict = oTargetInfo.propertiesWithoutConflict;
        const aSelectOptionPropertyNames = oPageSV.getSelectOptionsPropertyNames();
        aSelectOptionPropertyNames.forEach(function (sPropertyName) {
          if (!oSelectionVariant.getSelectOption(sPropertyName)) {
            oSelectionVariant.massAddSelectOption(sPropertyName, oPageSV.getSelectOption(sPropertyName));
          } else {
            // Only when there is no conflict do we need to add something
            // in all other case the conflicted paths are already added in prepareContextForExternalNavigation
            // if property was without conflict in incoming context then add path from incoming context to SV
            // TO-DO. Remove the check for oPropertiesWithoutConflict once semantic links functionality is covered
            if (oPropertiesWithoutConflict && sPropertyName in oPropertiesWithoutConflict) {
              oSelectionVariant.massAddSelectOption(oPropertiesWithoutConflict[sPropertyName], oSelectionVariant.getSelectOption(sPropertyName));
            }
            // if property was without conflict in page context then add path from page context to SV
            if (sPropertyName in oPagePropertiesWithoutConflict) {
              oSelectionVariant.massAddSelectOption(oPagePropertiesWithoutConflict[sPropertyName], oPageSV.getSelectOption(sPropertyName));
            }
          }
        });
        // remove non public properties from targetInfo
        delete oTargetInfo.propertiesWithoutConflict;
      }
      oInternalModelContext.setProperty("externalNavigationContext", {
        page: true
      });
    }
  };
  return IntentBasedNavigationOverride;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/IntentBasedNavigation", ["sap/fe/core/CommonUtils","sap/fe/navigation/SelectionVariant"],function(t,e){"use strict";const n={adaptNavigationContext:function(n,i){const o=this.getView(),a=o.getController(),s=a.intentBasedNavigation.adaptContextPreparationStrategy(i),r=this.getView().getBindingContext("internal"),g=r.getProperty("externalNavigationContext");const p=t.getAppComponent(o);const c=p.getModel().getMetaModel();if(g.page&&s==="default"){const s=o.getBindingContext(),r=c.getMetaPath(s.getPath());const g=a._intentBasedNavigation.removeSensitiveData(s.getObject(),r),p=a._intentBasedNavigation.prepareContextForExternalNavigation(g,s),l=p.propertiesWithoutConflict,d=t.addPageContextToSelectionVariant(new e,p.semanticAttributes,o),f=i.propertiesWithoutConflict;const C=d.getSelectOptionsPropertyNames();C.forEach(function(t){if(!n.getSelectOption(t)){n.massAddSelectOption(t,d.getSelectOption(t))}else{if(f&&t in f){n.massAddSelectOption(f[t],n.getSelectOption(t))}if(t in l){n.massAddSelectOption(l[t],d.getSelectOption(t))}}});delete i.propertiesWithoutConflict}r.setProperty("externalNavigationContext",{page:true})}};return n},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/InternalRouting-dbg", [], function () {
  "use strict";

  const InternalRoutingExtension = {
    onBeforeBinding: function (oContext, mParameters) {
      this.getView().getController()._onBeforeBinding(oContext, mParameters);
    },
    onAfterBinding: function (oContext, mParameters) {
      this.getView().getController()._onAfterBinding(oContext, mParameters);
    },
    closeColumn: function () {
      const internalModelContext = this.getView().getBindingContext("internal");
      internalModelContext.setProperty("fclColumnClosed", true);
      const context = this.getView().getBindingContext();
      const path = context && context.getPath() || "";
      const metaModel = context.getModel().getMetaModel();
      const metaPath = metaModel.getMetaPath(path);
      const technicalKeys = metaModel.getObject(`${metaPath}/$Type/$Key`);
      const entry = context === null || context === void 0 ? void 0 : context.getObject();
      const technicalKeysObject = {};
      for (const key in technicalKeys) {
        const objKey = technicalKeys[key];
        if (!technicalKeysObject[objKey]) {
          technicalKeysObject[objKey] = entry[objKey];
        }
      }
      internalModelContext.setProperty("technicalKeysOfLastSeenRecord", technicalKeysObject);
    }
  };
  return InternalRoutingExtension;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/InternalRouting", [],function(){"use strict";const t={onBeforeBinding:function(t,e){this.getView().getController()._onBeforeBinding(t,e)},onAfterBinding:function(t,e){this.getView().getController()._onAfterBinding(t,e)},closeColumn:function(){const t=this.getView().getBindingContext("internal");t.setProperty("fclColumnClosed",true);const e=this.getView().getBindingContext();const n=e&&e.getPath()||"";const o=e.getModel().getMetaModel();const i=o.getMetaPath(n);const s=o.getObject(`${i}/$Type/$Key`);const c=e===null||e===void 0?void 0:e.getObject();const g={};for(const t in s){const e=s[t];if(!g[e]){g[e]=c[e]}}t.setProperty("technicalKeysOfLastSeenRecord",g)}};return t},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/MessageHandler-dbg", [], function () {
  "use strict";

  const MessageHandlerExtension = {
    getShowBoundMessagesInMessageDialog: function () {
      // in case of edit mode we show the messages in the message popover
      return !this.base.getModel("ui").getProperty("/isEditable") || this.base.getView().getBindingContext("internal").getProperty("isActionParameterDialogOpen") || this.base.getView().getBindingContext("internal").getProperty("getBoundMessagesForMassEdit");
    }
  };
  return MessageHandlerExtension;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/MessageHandler", [],function(){"use strict";const e={getShowBoundMessagesInMessageDialog:function(){return!this.base.getModel("ui").getProperty("/isEditable")||this.base.getView().getBindingContext("internal").getProperty("isActionParameterDialogOpen")||this.base.getView().getBindingContext("internal").getProperty("getBoundMessagesForMassEdit")}};return e},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/Paginator-dbg", [], function () {
  "use strict";

  const PaginatorExtensionOverride = {
    onBeforeContextUpdate: function (oListBinding, iCurrentContextIndex) {
      const oCurrentView = this.getView(),
        oControlContext = oCurrentView && oCurrentView.getBindingContext(),
        aCurrentContexts = oListBinding && oListBinding.getCurrentContexts(),
        oPaginatorCurrentContext = aCurrentContexts[iCurrentContextIndex];
      if (oPaginatorCurrentContext && oControlContext && oPaginatorCurrentContext.getPath() !== oControlContext.getPath()) {
        // Prevent default update of context index in Object Page Paginator when view context is different from the paginator context.
        return true;
      }
    },
    onContextUpdate: function (oContext) {
      this.base._routing.navigateToContext(oContext, {
        callExtension: true
      });
    }
  };
  return PaginatorExtensionOverride;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/Paginator", [],function(){"use strict";const t={onBeforeContextUpdate:function(t,e){const n=this.getView(),o=n&&n.getBindingContext(),i=t&&t.getCurrentContexts(),r=i[e];if(r&&o&&r.getPath()!==o.getPath()){return true}},onContextUpdate:function(t){this.base._routing.navigateToContext(t,{callExtension:true})}};return t},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/Share-dbg", ["sap/base/Log", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/ui/core/routing/HashChanger", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, ModelHelper, SemanticKeyHelper, HashChanger, Filter, FilterOperator) {
  "use strict";

  let bGlobalIsStickySupported;
  function createFilterToFetchActiveContext(mKeyValues, bIsActiveEntityDefined) {
    const aKeys = Object.keys(mKeyValues);
    const aFilters = aKeys.map(function (sKey) {
      const sValue = mKeyValues[sKey];
      if (sValue !== undefined) {
        return new Filter(sKey, FilterOperator.EQ, sValue);
      }
    });
    if (bIsActiveEntityDefined) {
      const oActiveFilter = new Filter({
        filters: [new Filter("SiblingEntity/IsActiveEntity", FilterOperator.EQ, true)],
        and: false
      });
      aFilters.push(oActiveFilter);
    }
    return new Filter(aFilters, true);
  }
  function getActiveContextPath(oController, sPageEntityName, oFilter) {
    const oListBinding = oController.getView().getBindingContext().getModel().bindList(`/${sPageEntityName}`, undefined, undefined, oFilter, {
      $$groupId: "$auto.Heroes"
    });
    return oListBinding.requestContexts(0, 2).then(function (oContexts) {
      if (oContexts && oContexts.length) {
        return oContexts[0].getPath();
      }
    });
  }
  function getActiveContextInstances(oContext, oController, oEntitySet) {
    const aActiveContextpromises = [];
    const aPages = [];
    let sMetaPath = oContext.getModel().getMetaModel().getMetaPath(oContext.getPath());
    if (sMetaPath.indexOf("/") === 0) {
      sMetaPath = sMetaPath.substring(1);
    }
    const aMetaPathArray = sMetaPath.split("/");
    const sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
    const aCurrentHashArray = sCurrentHashNoParams.split("/");

    // oPageMap - creating an object that contains map of metapath name and it's technical details
    // which is required to create a filter to fetch the relavant/correct active context
    // Example: {SalesOrderManage:{technicalID:technicalIDValue}, _Item:{technicalID:technicalIDValue}} etc.,
    const oPageMap = {};
    const aPageHashArray = [];
    aCurrentHashArray.forEach(function (sPageHash) {
      const aKeyValues = sPageHash.substring(sPageHash.indexOf("(") + 1, sPageHash.length - 1).split(",");
      const mKeyValues = {};
      const sPageHashName = sPageHash.split("(")[0];
      oPageMap[sPageHashName] = {};
      aPageHashArray.push(sPageHashName);
      oPageMap[sPageHashName]["bIsActiveEntityDefined"] = true;
      for (let i = 0; i < aKeyValues.length; i++) {
        const sKeyAssignment = aKeyValues[i];
        const aParts = sKeyAssignment.split("=");
        let sKeyValue = aParts[1];
        let sKey = aParts[0];
        // In case if only one technical key is defined then the url just contains the technicalIDValue but not the technicalID
        // Example: SalesOrderManage(ID=11111129-aaaa-bbbb-cccc-ddddeeeeffff,IsActiveEntity=false)/_Item(11111129-aaaa-bbbb-cccc-ddddeeeeffff)
        // In above example SalesOrderItem has only one technical key defined, hence technicalID info is not present in the url
        // Hence in such cases we get technical key and use them to fetch active context
        if (sKeyAssignment.indexOf("=") === -1) {
          const oMetaModel = oContext.getModel().getMetaModel();
          const aTechnicalKeys = oMetaModel.getObject(`/${aPageHashArray.join("/")}/$Type/$Key`);
          sKeyValue = aParts[0];
          sKey = aTechnicalKeys[0];
          oPageMap[sPageHash.split("(")[0]]["bIsActiveEntityDefined"] = false;
        }
        if (sKey !== "IsActiveEntity") {
          if (sKeyValue.indexOf("'") === 0 && sKeyValue.lastIndexOf("'") === sKeyValue.length - 1) {
            // Remove the quotes from the value and decode special chars
            sKeyValue = decodeURIComponent(sKeyValue.substring(1, sKeyValue.length - 1));
          }
          mKeyValues[sKey] = sKeyValue;
        }
      }
      oPageMap[sPageHashName].mKeyValues = mKeyValues;
    });
    let oPageEntitySet = oEntitySet;
    aMetaPathArray.forEach(function (sNavigationPath) {
      const oPageInfo = {};
      const sPageEntitySetName = oPageEntitySet.$NavigationPropertyBinding && oPageEntitySet.$NavigationPropertyBinding[sNavigationPath];
      if (sPageEntitySetName) {
        oPageInfo.pageEntityName = oPageEntitySet.$NavigationPropertyBinding[sNavigationPath];
        oPageEntitySet = oContext.getModel().getMetaModel().getObject(`/${sPageEntitySetName}`) || oEntitySet;
      } else {
        oPageInfo.pageEntityName = sNavigationPath;
      }
      oPageInfo.mKeyValues = oPageMap[sNavigationPath].mKeyValues;
      oPageInfo.bIsActiveEntityDefined = oPageMap[sNavigationPath].bIsActiveEntityDefined;
      aPages.push(oPageInfo);
    });
    aPages.forEach(function (oPageInfo) {
      const oFilter = createFilterToFetchActiveContext(oPageInfo.mKeyValues, oPageInfo.bIsActiveEntityDefined);
      aActiveContextpromises.push(getActiveContextPath(oController, oPageInfo.pageEntityName, oFilter));
    });
    return aActiveContextpromises;
  }

  /**
   * Method to fetch active context path's.
   *
   * @param oContext The Page Context
   * @param oController
   * @returns Promise which is resolved once the active context's are fetched
   */
  function getActiveContextPaths(oContext, oController) {
    const sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
    let sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
    if (sRootEntityName.indexOf("/") === 0) {
      sRootEntityName = sRootEntityName.substring(1);
    }
    const oEntitySet = oContext.getModel().getMetaModel().getObject(`/${sRootEntityName}`);
    const oPageContext = oContext;
    const aActiveContextpromises = getActiveContextInstances(oContext, oController, oEntitySet);
    if (aActiveContextpromises.length > 0) {
      return Promise.all(aActiveContextpromises).then(function (aData) {
        const aActiveContextPaths = [];
        let oPageEntitySet = oEntitySet;
        if (aData[0].indexOf("/") === 0) {
          aActiveContextPaths.push(aData[0].substring(1));
        } else {
          aActiveContextPaths.push(aData[0]);
        }
        // In the active context paths identify and replace the entitySet Name with corresponding navigation property name
        // Required to form the url pointing to active context
        // Example : SalesOrderItem --> _Item, MaterialDetails --> _MaterialDetails etc.,
        for (let i = 1; i < aData.length; i++) {
          let sActiveContextPath = aData[i];
          let sNavigatioProperty = "";
          let sEntitySetName = sActiveContextPath && sActiveContextPath.substr(0, sActiveContextPath.indexOf("("));
          if (sEntitySetName.indexOf("/") === 0) {
            sEntitySetName = sEntitySetName.substring(1);
          }
          if (sActiveContextPath.indexOf("/") === 0) {
            sActiveContextPath = sActiveContextPath.substring(1);
          }
          sNavigatioProperty = Object.keys(oPageEntitySet.$NavigationPropertyBinding)[Object.values(oPageEntitySet.$NavigationPropertyBinding).indexOf(sEntitySetName)];
          if (sNavigatioProperty) {
            aActiveContextPaths.push(sActiveContextPath.replace(sEntitySetName, sNavigatioProperty));
            oPageEntitySet = oPageContext.getModel().getMetaModel().getObject(`/${sEntitySetName}`) || oEntitySet;
          } else {
            aActiveContextPaths.push(sActiveContextPath);
          }
        }
        return aActiveContextPaths;
      }).catch(function (oError) {
        Log.info("Failed to retrieve one or more active context path's", oError);
      });
    } else {
      return Promise.resolve();
    }
  }
  function fetchActiveContextPaths(oContext, oController) {
    let oPromise, aSemanticKeys;
    const sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
    if (oContext) {
      const oModel = oContext.getModel();
      const oMetaModel = oModel.getMetaModel();
      bGlobalIsStickySupported = ModelHelper.isStickySessionSupported(oMetaModel);
      let sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
      if (sRootEntityName.indexOf("/") === 0) {
        sRootEntityName = sRootEntityName.substring(1);
      }
      aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sRootEntityName);
    }
    // Fetch active context details incase of below scenario's(where page is not sticky supported(we do not have draft instance))
    // 1. In case of draft enabled Object page where semantic key based URL is not possible(like semantic keys are not modeled in the entity set)
    // 2. In case of draft enabled Sub Object Pages (where semantic bookmarking is not supported)
    const oViewData = oController.getView().getViewData();
    if (oContext && !bGlobalIsStickySupported && (oViewData.viewLevel === 1 && !aSemanticKeys || oViewData.viewLevel >= 2)) {
      oPromise = getActiveContextPaths(oContext, oController);
      return oPromise;
    } else {
      return Promise.resolve();
    }
  }

  // /**
  //  * Get share URL.
  //  * @param bIsEditable
  //  * @param bIsStickySupported
  //  * @param aActiveContextPaths
  //  * @returns {string} The share URL
  //  * @protected
  //  * @static
  //  */
  function getShareUrl(bIsEditable, bIsStickySupported, aActiveContextPaths) {
    let sShareUrl;
    const sHash = HashChanger.getInstance().getHash();
    const sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
    if (bIsEditable && !bIsStickySupported && aActiveContextPaths) {
      sShareUrl = sBasePath + aActiveContextPaths.join("/");
    } else {
      sShareUrl = sHash ? sBasePath + sHash : window.location.hash;
    }
    return window.location.origin + window.location.pathname + window.location.search + sShareUrl;
  }
  function getShareEmailUrl() {
    const oUShellContainer = sap.ushell && sap.ushell.Container;
    if (oUShellContainer) {
      return oUShellContainer.getFLPUrlAsync(true).then(function (sFLPUrl) {
        return sFLPUrl;
      }).catch(function (sError) {
        Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
      });
    } else {
      return Promise.resolve(document.URL);
    }
  }
  function getJamUrl(bIsEditMode, bIsStickySupported, aActiveContextPaths) {
    let sJamUrl;
    const sHash = HashChanger.getInstance().getHash();
    const sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
    if (bIsEditMode && !bIsStickySupported && aActiveContextPaths) {
      sJamUrl = sBasePath + aActiveContextPaths.join("/");
    } else {
      sJamUrl = sHash ? sBasePath + sHash : window.location.hash;
    }
    // in case we are in cFLP scenario, the application is running
    // inside an iframe, and there for we need to get the cFLP URL
    // and not 'document.URL' that represents the iframe URL
    if (sap.ushell && sap.ushell.Container && sap.ushell.Container.runningInIframe && sap.ushell.Container.runningInIframe()) {
      sap.ushell.Container.getFLPUrl(true).then(function (sUrl) {
        return sUrl.substr(0, sUrl.indexOf("#")) + sJamUrl;
      }).catch(function (sError) {
        Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
      });
    } else {
      return Promise.resolve(window.location.origin + window.location.pathname + sJamUrl);
    }
  }
  const ShareExtensionOverride = {
    adaptShareMetadata: async function (oShareMetadata) {
      const oContext = this.base.getView().getBindingContext();
      const oUIModel = this.base.getView().getModel("ui");
      const bIsEditable = oUIModel.getProperty("/isEditable");
      try {
        const aActiveContextPaths = await fetchActiveContextPaths(oContext, this.base.getView().getController());
        const oPageTitleInfo = this.base.getView().getController()._getPageTitleInformation();
        const oData = await Promise.all([getJamUrl(bIsEditable, bGlobalIsStickySupported, aActiveContextPaths), getShareUrl(bIsEditable, bGlobalIsStickySupported, aActiveContextPaths), getShareEmailUrl()]);
        let sTitle = oPageTitleInfo.title;
        const sObjectSubtitle = oPageTitleInfo.subtitle ? oPageTitleInfo.subtitle.toString() : "";
        if (sObjectSubtitle) {
          sTitle = `${sTitle} - ${sObjectSubtitle}`;
        }
        oShareMetadata.tile = {
          title: oPageTitleInfo.title,
          subtitle: sObjectSubtitle
        };
        oShareMetadata.email.title = sTitle;
        oShareMetadata.title = sTitle;
        oShareMetadata.jam.url = oData[0];
        oShareMetadata.url = oData[1];
        oShareMetadata.email.url = oData[2];
        // MS Teams collaboration does not want to allow further changes to the URL
        // so update colloborationInfo model at LR override to ignore further extension changes at multiple levels
        const collaborationInfoModel = this.base.getView().getModel("collaborationInfo");
        collaborationInfoModel.setProperty("/url", oShareMetadata.url);
        collaborationInfoModel.setProperty("/appTitle", oShareMetadata.title);
        collaborationInfoModel.setProperty("/subTitle", sObjectSubtitle);
      } catch (error) {
        Log.error(error);
      }
      return oShareMetadata;
    }
  };
  return ShareExtensionOverride;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/Share", ["sap/base/Log","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/SemanticKeyHelper","sap/ui/core/routing/HashChanger","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,t,n,i,s,o){"use strict";let r;function l(e,t){const n=Object.keys(e);const i=n.map(function(t){const n=e[t];if(n!==undefined){return new s(t,o.EQ,n)}});if(t){const e=new s({filters:[new s("SiblingEntity/IsActiveEntity",o.EQ,true)],and:false});i.push(e)}return new s(i,true)}function a(e,t,n){const i=e.getView().getBindingContext().getModel().bindList(`/${t}`,undefined,undefined,n,{$$groupId:"$auto.Heroes"});return i.requestContexts(0,2).then(function(e){if(e&&e.length){return e[0].getPath()}})}function c(e,t,n){const s=[];const o=[];let r=e.getModel().getMetaModel().getMetaPath(e.getPath());if(r.indexOf("/")===0){r=r.substring(1)}const c=r.split("/");const u=i.getInstance().getHash().split("?")[0];const g=u.split("/");const f={};const d=[];g.forEach(function(t){const n=t.substring(t.indexOf("(")+1,t.length-1).split(",");const i={};const s=t.split("(")[0];f[s]={};d.push(s);f[s]["bIsActiveEntityDefined"]=true;for(let s=0;s<n.length;s++){const o=n[s];const r=o.split("=");let l=r[1];let a=r[0];if(o.indexOf("=")===-1){const n=e.getModel().getMetaModel();const i=n.getObject(`/${d.join("/")}/$Type/$Key`);l=r[0];a=i[0];f[t.split("(")[0]]["bIsActiveEntityDefined"]=false}if(a!=="IsActiveEntity"){if(l.indexOf("'")===0&&l.lastIndexOf("'")===l.length-1){l=decodeURIComponent(l.substring(1,l.length-1))}i[a]=l}}f[s].mKeyValues=i});let p=n;c.forEach(function(t){const i={};const s=p.$NavigationPropertyBinding&&p.$NavigationPropertyBinding[t];if(s){i.pageEntityName=p.$NavigationPropertyBinding[t];p=e.getModel().getMetaModel().getObject(`/${s}`)||n}else{i.pageEntityName=t}i.mKeyValues=f[t].mKeyValues;i.bIsActiveEntityDefined=f[t].bIsActiveEntityDefined;o.push(i)});o.forEach(function(e){const n=l(e.mKeyValues,e.bIsActiveEntityDefined);s.push(a(t,e.pageEntityName,n))});return s}function u(t,n){const s=i.getInstance().getHash().split("?")[0];let o=s&&s.substr(0,s.indexOf("("));if(o.indexOf("/")===0){o=o.substring(1)}const r=t.getModel().getMetaModel().getObject(`/${o}`);const l=t;const a=c(t,n,r);if(a.length>0){return Promise.all(a).then(function(e){const t=[];let n=r;if(e[0].indexOf("/")===0){t.push(e[0].substring(1))}else{t.push(e[0])}for(let i=1;i<e.length;i++){let s=e[i];let o="";let a=s&&s.substr(0,s.indexOf("("));if(a.indexOf("/")===0){a=a.substring(1)}if(s.indexOf("/")===0){s=s.substring(1)}o=Object.keys(n.$NavigationPropertyBinding)[Object.values(n.$NavigationPropertyBinding).indexOf(a)];if(o){t.push(s.replace(a,o));n=l.getModel().getMetaModel().getObject(`/${a}`)||r}else{t.push(s)}}return t}).catch(function(t){e.info("Failed to retrieve one or more active context path's",t)})}else{return Promise.resolve()}}function g(e,s){let o,l;const a=i.getInstance().getHash().split("?")[0];if(e){const i=e.getModel();const s=i.getMetaModel();r=t.isStickySessionSupported(s);let o=a&&a.substr(0,a.indexOf("("));if(o.indexOf("/")===0){o=o.substring(1)}l=n.getSemanticKeys(s,o)}const c=s.getView().getViewData();if(e&&!r&&(c.viewLevel===1&&!l||c.viewLevel>=2)){o=u(e,s);return o}else{return Promise.resolve()}}function f(e,t,n){let s;const o=i.getInstance().getHash();const r=i.getInstance().hrefForAppSpecificHash?i.getInstance().hrefForAppSpecificHash(""):"";if(e&&!t&&n){s=r+n.join("/")}else{s=o?r+o:window.location.hash}return window.location.origin+window.location.pathname+window.location.search+s}function d(){const t=sap.ushell&&sap.ushell.Container;if(t){return t.getFLPUrlAsync(true).then(function(e){return e}).catch(function(t){e.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)",t)})}else{return Promise.resolve(document.URL)}}function p(t,n,s){let o;const r=i.getInstance().getHash();const l=i.getInstance().hrefForAppSpecificHash?i.getInstance().hrefForAppSpecificHash(""):"";if(t&&!n&&s){o=l+s.join("/")}else{o=r?l+r:window.location.hash}if(sap.ushell&&sap.ushell.Container&&sap.ushell.Container.runningInIframe&&sap.ushell.Container.runningInIframe()){sap.ushell.Container.getFLPUrl(true).then(function(e){return e.substr(0,e.indexOf("#"))+o}).catch(function(t){e.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)",t)})}else{return Promise.resolve(window.location.origin+window.location.pathname+o)}}const h={adaptShareMetadata:async function(t){const n=this.base.getView().getBindingContext();const i=this.base.getView().getModel("ui");const s=i.getProperty("/isEditable");try{const e=await g(n,this.base.getView().getController());const i=this.base.getView().getController()._getPageTitleInformation();const o=await Promise.all([p(s,r,e),f(s,r,e),d()]);let l=i.title;const a=i.subtitle?i.subtitle.toString():"";if(a){l=`${l} - ${a}`}t.tile={title:i.title,subtitle:a};t.email.title=l;t.title=l;t.jam.url=o[0];t.url=o[1];t.email.url=o[2];const c=this.base.getView().getModel("collaborationInfo");c.setProperty("/url",t.url);c.setProperty("/appTitle",t.title);c.setProperty("/subTitle",a)}catch(t){e.error(t)}return t}};return h},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/ViewState-dbg", ["sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/library"], function (KeepAliveHelper, CoreLibrary) {
  "use strict";

  const VariantManagement = CoreLibrary.VariantManagement;
  const ViewStateExtensionOverride = {
    applyInitialStateOnly: function () {
      return false;
    },
    adaptStateControls: function (aStateControls) {
      const oView = this.getView(),
        oController = oView.getController(),
        oViewData = oView.getViewData();
      let bControlVM = false;
      switch (oViewData.variantManagement) {
        case VariantManagement.Control:
          bControlVM = true;
          break;
        case VariantManagement.Page:
        case VariantManagement.None:
          break;
        default:
          throw new Error(`unhandled variant setting: ${oViewData.getVariantManagement()}`);
      }
      oController._findTables().forEach(function (oTable) {
        const oQuickFilter = oTable.getQuickFilter();
        if (oQuickFilter) {
          aStateControls.push(oQuickFilter);
        }
        if (bControlVM) {
          aStateControls.push(oTable.getVariant());
        }
        aStateControls.push(oTable);
      });
      oController._findCharts().forEach(function (oChart) {
        if (bControlVM) {
          aStateControls.push(oChart.getVariant());
        }
        aStateControls.push(oChart);
      });
      aStateControls.push(oView.byId("fe::ObjectPage"));
    },
    adaptBindingRefreshControls: function (aControls) {
      const oView = this.getView(),
        sRefreshStrategy = KeepAliveHelper.getViewRefreshInfo(oView),
        oController = oView.getController();
      let aControlsToRefresh = [];
      if (sRefreshStrategy) {
        const oObjectPageControl = oController._getObjectPageLayoutControl();
        aControlsToRefresh.push(oObjectPageControl);
      }
      if (sRefreshStrategy !== "includingDependents") {
        const aViewControls = oController._findTables();
        aControlsToRefresh = aControlsToRefresh.concat(KeepAliveHelper.getControlsForRefresh(oView, aViewControls) || []);
      }
      return aControlsToRefresh.reduce(function (aPrevControls, oControl) {
        if (aPrevControls.indexOf(oControl) === -1) {
          aPrevControls.push(oControl);
        }
        return aPrevControls;
      }, aControls);
    }
  };
  return ViewStateExtensionOverride;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/ObjectPage/overrides/ViewState", ["sap/fe/core/helpers/KeepAliveHelper","sap/fe/core/library"],function(e,t){"use strict";const n=t.VariantManagement;const a={applyInitialStateOnly:function(){return false},adaptStateControls:function(e){const t=this.getView(),a=t.getController(),r=t.getViewData();let i=false;switch(r.variantManagement){case n.Control:i=true;break;case n.Page:case n.None:break;default:throw new Error(`unhandled variant setting: ${r.getVariantManagement()}`)}a._findTables().forEach(function(t){const n=t.getQuickFilter();if(n){e.push(n)}if(i){e.push(t.getVariant())}e.push(t)});a._findCharts().forEach(function(t){if(i){e.push(t.getVariant())}e.push(t)});e.push(t.byId("fe::ObjectPage"))},adaptBindingRefreshControls:function(t){const n=this.getView(),a=e.getViewRefreshInfo(n),r=n.getController();let i=[];if(a){const e=r._getObjectPageLayoutControl();i.push(e)}if(a!=="includingDependents"){const t=r._findTables();i=i.concat(e.getControlsForRefresh(n,t)||[])}return i.reduce(function(e,t){if(e.indexOf(t)===-1){e.push(t)}return e},t)}};return a},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/TableScroller-dbg", [], function () {
  "use strict";

  const TableScroller = {
    /**
     * Scrolls an MDC table to a given row, identified by its context path.
     * If the row with the path can't be found, the table stays unchanged.
     *
     * @param oTable The table to be scrolled
     * @param sRowPath The path identifying the row to scroll to
     */
    scrollTableToRow: function (oTable, sRowPath) {
      const oTableRowBinding = oTable.getRowBinding();
      const getTableContexts = function () {
        if (oTable.data().tableType === "GridTable") {
          return oTableRowBinding.getContexts(0);
        } else {
          return oTableRowBinding.getCurrentContexts();
        }
      };
      const findAndScroll = function () {
        const oTableRow = getTableContexts().find(function (item) {
          return item && item.getPath() === sRowPath;
        });
        if (oTableRow) {
          oTable.scrollToIndex(oTableRow.getIndex());
        }
      };
      if (oTableRowBinding) {
        const oTableRowBindingContexts = getTableContexts();
        if (oTableRowBindingContexts.length === 0 && oTableRowBinding.getLength() > 0 || oTableRowBindingContexts.some(function (context) {
          return context === undefined;
        })) {
          // The contexts are not loaded yet --> wait for a change event before scrolling
          oTableRowBinding.attachEventOnce("dataReceived", findAndScroll);
        } else {
          // Contexts are already loaded --> we can try to scroll immediately
          findAndScroll();
        }
      }
    }
  };
  return TableScroller;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/TableScroller", [],function(){"use strict";const t={scrollTableToRow:function(t,e){const n=t.getRowBinding();const o=function(){if(t.data().tableType==="GridTable"){return n.getContexts(0)}else{return n.getCurrentContexts()}};const i=function(){const n=o().find(function(t){return t&&t.getPath()===e});if(n){t.scrollToIndex(n.getIndex())}};if(n){const t=o();if(t.length===0&&n.getLength()>0||t.some(function(t){return t===undefined})){n.attachEventOnce("dataReceived",i)}else{i()}}}};return t},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/library-dbg", ["sap/f/library", "sap/fe/core/library", "sap/fe/macros/library", "sap/fe/templates/ListReport/view/fragments/MultipleMode.fragment", "sap/fe/templates/ObjectPage/components/DraftHandlerButton", "sap/ui/core/Core", "sap/ui/core/library"], function (_library, _library2, _library3, MultipleMode, DraftHandlerButton, Core, _library4) {
  "use strict";

  var _exports = {};
  /**
   * Library providing the official templates supported by SAP Fiori elements.
   *
   * @namespace
   * @name sap.fe.templates
   * @public
   */
  const templatesNamespace = "sap.fe.templates";

  /**
   * @namespace
   * @name sap.fe.templates.ListReport
   * @public
   */
  _exports.templatesNamespace = templatesNamespace;
  const templatesLRNamespace = "sap.fe.templates.ListReport";

  /**
   * @namespace
   * @name sap.fe.templates.ObjectPage
   * @public
   */
  _exports.templatesLRNamespace = templatesLRNamespace;
  const templatesOPNamespace = "sap.fe.templates.ObjectPage";
  _exports.templatesOPNamespace = templatesOPNamespace;
  const thisLib = Core.initLibrary({
    name: "sap.fe.templates",
    dependencies: ["sap.ui.core", "sap.fe.core", "sap.fe.macros", "sap.f"],
    types: ["sap.fe.templates.ObjectPage.SectionLayout"],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.111.1",
    noLibraryCSS: true
  });
  if (!thisLib.ObjectPage) {
    thisLib.ObjectPage = {};
  }
  thisLib.ObjectPage.SectionLayout = {
    /**
     * All sections are shown in one page
     *
     * @public
     */
    Page: "Page",
    /**
     * All top-level sections are shown in an own tab
     *
     * @public
     */
    Tabs: "Tabs"
  };
  MultipleMode.register();
  DraftHandlerButton.register();
  return thisLib;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/templates/library", ["sap/f/library","sap/fe/core/library","sap/fe/macros/library","sap/fe/templates/ListReport/view/fragments/MultipleMode.fragment","sap/fe/templates/ObjectPage/components/DraftHandlerButton","sap/ui/core/Core","sap/ui/core/library"],function(e,a,t,s,r,p,c){"use strict";var i={};const o="sap.fe.templates";i.templatesNamespace=o;const n="sap.fe.templates.ListReport";i.templatesLRNamespace=n;const f="sap.fe.templates.ObjectPage";i.templatesOPNamespace=f;const l=p.initLibrary({name:"sap.fe.templates",dependencies:["sap.ui.core","sap.fe.core","sap.fe.macros","sap.f"],types:["sap.fe.templates.ObjectPage.SectionLayout"],interfaces:[],controls:[],elements:[],version:"1.111.1",noLibraryCSS:true});if(!l.ObjectPage){l.ObjectPage={}}l.ObjectPage.SectionLayout={Page:"Page",Tabs:"Tabs"};s.register();r.register();return l},false);
sap.ui.require.preload({
	"sap/fe/templates/AnalyticalListPage/manifest.json":'{"_version":"1.14.0","sap.app":{"id":"sap.fe.templates.AnalyticalListPage","type":"component","applicationVersion":{"version":"1.111.1"},"title":"Analytical List Page","tags":{"keywords":["Analytical List Page"]},"ach":"CA-UI5-FE","embeddedBy":"../","offline":false,"resources":"resources.json"},"sap.ui5":{"services":{"templatedViewService":{"settings":{"converterType":"AnalyticalListPage"}}},"dependencies":{"minUI5Version":"${sap.ui5.core.version}","libs":{"sap.fe.macros":{}}}}}',
	"sap/fe/templates/ListReport/ListReport.view.xml":'<mvc:View\n\txmlns="sap.m"\n\txmlns:mvc="sap.ui.core.mvc"\n\txmlns:f="sap.f"\n\txmlns:macro="sap.fe.macros"\n\txmlns:macroInternal="sap.fe.macros.internal"\n\txmlns:control="sap.fe.core.controls"\n\txmlns:core="sap.ui.core"\n\txmlns:fragments="sap.fe.templates.ListReport.view.fragments"\n\txmlns:l="sap.ui.layout"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tFILTER: \'sap/fe/core/templating/FilterHelper\',\n\t\tLR: \'sap/fe/templates/ListReport/ListReportTemplating\'\n\t}"\n\tcontrollerName="sap.fe.templates.ListReport.ListReportController"\n><template:with path="converterContext>mainEntitySet" var="entitySet"><template:with path="converterContext>mainEntityType" var="entityType"><f:DynamicPage\n\t\t\t\tid="fe::ListReport"\n\t\t\t\tunittest:id="listReportFooterTest"\n\t\t\t\tstickySubheaderProvider="{converterContext>stickySubheaderProvider}"\n\t\t\t\tshowFooter="false"\n\t\t\t\tbusy="{ui>/busy}"\n\t\t\t\tbusyIndicatorDelay="0"\n\t\t\t\tclass="{= !${converterContext>hasMultiVisualizations} &amp;&amp; ${converterContext>views}.length > 1 ? \'sapUiNoContentPadding\' : \'sapUiResponsiveContentPadding\'}"\n\t\t\t><f:dependents><template:if test="{converterContext>headerActions}"><template:repeat list="{converterContext>headerActions}" var="headerAction"><template:if test="{headerAction>command}"><control:CommandExecution\n\t\t\t\t\t\t\t\t\tcore:require="{FPM: \'sap/fe/core/helpers/FPMHelper\'}"\n\t\t\t\t\t\t\t\t\texecute="{= COMMON.buildActionWrapper(${headerAction>})}"\n\t\t\t\t\t\t\t\t\tvisible="{headerAction>visible}"\n\t\t\t\t\t\t\t\t\tenabled="{headerAction>enabled}"\n\t\t\t\t\t\t\t\t\tcommand="{headerAction>command}"\n\t\t\t\t\t\t\t\t/></template:if></template:repeat></template:if><template:if test="{= !${converterContext>hideFilterBar} &amp;&amp; !${viewData>/liveMode} }"><template:then><control:CommandExecution execute=".handlers.onFilterSearch" command="FE_FilterSearch" /></template:then></template:if></f:dependents><f:title><f:DynamicPageTitle stateChange=".handlers.onDynamicPageTitleStateChanged"><f:heading><template:with path="converterContext>kpiDefinitions" var="definitions"><template:if test="{definitions>length}"><template:then><l:HorizontalLayout class="sapUiNoContentPadding sapUiNoMarginTop sapUiNoMarginBottom"><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ListReport.view.fragments.VariantManagement"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/><template:repeat list="{converterContext>kpiDefinitions}" var="kpi"><template:with path="kpi>datapoint" var="datapoint"><macro:KPITag\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tid="{kpi>id}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tmetaPath="{datapoint>annotationPath}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tkpiModelName="kpiModel"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\thasUnit="{= ${datapoint>unit} !== undefined}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t/></template:with></template:repeat></l:HorizontalLayout></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ListReport.view.fragments.VariantManagement"\n\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t/></template:else></template:if></template:with></f:heading><f:snappedContent><Text text="{internal>appliedFilters}" /></f:snappedContent><f:actions><ToolbarSpacer /><template:if test="{converterContext>headerActions}"><template:repeat list="{converterContext>headerActions}" var="headerAction"><Button\n\t\t\t\t\t\t\t\t\t\tcore:require="{FPM: \'sap/fe/core/helpers/FPMHelper\'}"\n\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\',${headerAction>id}])}"\n\t\t\t\t\t\t\t\t\t\ttext="{headerAction>text}"\n\t\t\t\t\t\t\t\t\t\tpress="{= ${headerAction>command} ? (\'cmd:\' + ${headerAction>command}) : COMMON.buildActionWrapper(${headerAction>})}"\n\t\t\t\t\t\t\t\t\t\ttype="Transparent"\n\t\t\t\t\t\t\t\t\t\tvisible="{headerAction>visible}"\n\t\t\t\t\t\t\t\t\t\tenabled="{headerAction>enabled}"\n\t\t\t\t\t\t\t\t\t/></template:repeat></template:if><template:if\n\t\t\t\t\t\t\t\ttest="{= ${converterContext>/filterLayout} === \'compactvisual\' &amp;&amp; !${converterContext>hideFilterBar}}"\n\t\t\t\t\t\t\t><SegmentedButton\n\t\t\t\t\t\t\t\t\tid="{= ID.generate([ ${converterContext>filterBarId}, \'LayoutToggle\']) }"\n\t\t\t\t\t\t\t\t\tselectedKey="{converterContext>/filterInitialLayout}"\n\t\t\t\t\t\t\t\t><items><SegmentedButtonItem\n\t\t\t\t\t\t\t\t\t\t\ttooltip="{sap.fe.i18n>T_SEGMENTED_BUTTON_TOOLTIP_COMPACT}"\n\t\t\t\t\t\t\t\t\t\t\tkey="compact"\n\t\t\t\t\t\t\t\t\t\t\ticon="sap-icon://filter-fields"\n\t\t\t\t\t\t\t\t\t\t/><SegmentedButtonItem\n\t\t\t\t\t\t\t\t\t\t\ttooltip="{sap.fe.i18n>T_SEGMENTED_BUTTON_TOOLTIP_VISUAL}"\n\t\t\t\t\t\t\t\t\t\t\tkey="visual"\n\t\t\t\t\t\t\t\t\t\t\ticon="sap-icon://filter-analytics"\n\t\t\t\t\t\t\t\t\t\t/></items></SegmentedButton></template:if><macro:Share id="fe::Share" visible="{= ${fclhelper>/} ? ${fclhelper>/showShareIcon} : true }" /></f:actions><template:if test="{converterContext>useHiddenFilterBar}"><template:then><f:dependents><template:with path="converterContext>filterBar" var="filterBarContext"><macroInternal:FilterBar\n\t\t\t\t\t\t\t\t\t\t\tunittest:id="listReportFilterBarTest"\n\t\t\t\t\t\t\t\t\t\t\tid="{converterContext>filterBarId}"\n\t\t\t\t\t\t\t\t\t\t\t_applyIdToContent="true"\n\t\t\t\t\t\t\t\t\t\t\tmetaPath="{entityType>}"\n\t\t\t\t\t\t\t\t\t\t\tvariantBackreference="{= LR.getVariantBackReference(${viewData>}, ${converterContext>} )}"\n\t\t\t\t\t\t\t\t\t\t\tselectionFields="{filterBarContext>selectionFields}"\n\t\t\t\t\t\t\t\t\t\t\tpropertyInfo="{filterBarContext>propertyInfo}"\n\t\t\t\t\t\t\t\t\t\t\tinternalFilterChanged=".handlers.onFiltersChanged"\n\t\t\t\t\t\t\t\t\t\t\tfilterConditions="{parts:[{path:\'converterContext>filterConditions\'}, {path:\'entitySet>\'}], formatter: \'FILTER.getFilterConditions\'}"\n\t\t\t\t\t\t\t\t\t\t\tinternalSearch=".handlers.onSearch"\n\t\t\t\t\t\t\t\t\t\t\thideBasicSearch="{filterBarContext>hideBasicSearch}"\n\t\t\t\t\t\t\t\t\t\t\tliveMode="{viewData>/liveMode}"\n\t\t\t\t\t\t\t\t\t\t\tshowAdaptFiltersButton="true"\n\t\t\t\t\t\t\t\t\t\t\tp13nMode="Item,Value"\n\t\t\t\t\t\t\t\t\t\t\tuseSemanticDateRange="{converterContext>useSemanticDateRange}"\n\t\t\t\t\t\t\t\t\t\t\tsuspendSelection="false"\n\t\t\t\t\t\t\t\t\t\t\ttoggleControlId="{= ${converterContext>/filterLayout} === \'compactvisual\' ? ID.generate([ ${converterContext>filterBarId}, \'LayoutToggle\']) : undefined }"\n\t\t\t\t\t\t\t\t\t\t\tinitialLayout="{= ${converterContext>/filterLayout} === \'compactvisual\' ? ${converterContext>/filterInitialLayout} : undefined }"\n\t\t\t\t\t\t\t\t\t\t\tstateChange=".handlers.onStateChange"\n\t\t\t\t\t\t\t\t\t\t/></template:with></f:dependents></template:then></template:if></f:DynamicPageTitle></f:title><f:header><template:if test="{= !${converterContext>hideFilterBar} }"><template:then><template:with path="converterContext>filterBar" var="filterBarContext"><f:DynamicPageHeader pinnable="{converterContext>showPinnableToggle}"><VBox><macroInternal:FilterBar\n\t\t\t\t\t\t\t\t\t\t\tunittest:id="listReportFilterBarTest"\n\t\t\t\t\t\t\t\t\t\t\tid="{converterContext>filterBarId}"\n\t\t\t\t\t\t\t\t\t\t\t_applyIdToContent="true"\n\t\t\t\t\t\t\t\t\t\t\tmetaPath="{entityType>}"\n\t\t\t\t\t\t\t\t\t\t\tvariantBackreference="{= LR.getVariantBackReference(${viewData>}, ${converterContext>} )}"\n\t\t\t\t\t\t\t\t\t\t\tselectionFields="{filterBarContext>selectionFields}"\n\t\t\t\t\t\t\t\t\t\t\tpropertyInfo="{filterBarContext>propertyInfo}"\n\t\t\t\t\t\t\t\t\t\t\tinternalFilterChanged=".handlers.onFiltersChanged"\n\t\t\t\t\t\t\t\t\t\t\tfilterConditions="{parts:[{path:\'converterContext>filterConditions\'}, {path:\'entitySet>\'}], formatter: \'FILTER.getFilterConditions\'}"\n\t\t\t\t\t\t\t\t\t\t\tinternalSearch=".handlers.onSearch"\n\t\t\t\t\t\t\t\t\t\t\thideBasicSearch="{filterBarContext>hideBasicSearch}"\n\t\t\t\t\t\t\t\t\t\t\tshowClearButton="{filterBarContext>showClearButton}"\n\t\t\t\t\t\t\t\t\t\t\tafterClear=".onAfterClear"\n\t\t\t\t\t\t\t\t\t\t\tliveMode="{viewData>/liveMode}"\n\t\t\t\t\t\t\t\t\t\t\tshowAdaptFiltersButton="true"\n\t\t\t\t\t\t\t\t\t\t\tp13nMode="Item,Value"\n\t\t\t\t\t\t\t\t\t\t\tuseSemanticDateRange="{converterContext>useSemanticDateRange}"\n\t\t\t\t\t\t\t\t\t\t\tsuspendSelection="false"\n\t\t\t\t\t\t\t\t\t\t\ttoggleControlId="{= ${converterContext>/filterLayout} === \'compactvisual\' ? ID.generate([ ${converterContext>filterBarId}, \'LayoutToggle\']) : undefined }"\n\t\t\t\t\t\t\t\t\t\t\tinitialLayout="{= ${converterContext>/filterLayout} === \'compactvisual\' ? ${converterContext>/filterInitialLayout} : undefined }"\n\t\t\t\t\t\t\t\t\t\t\tstateChange=".handlers.onStateChange"\n\t\t\t\t\t\t\t\t\t\t/></VBox></f:DynamicPageHeader></template:with></template:then></template:if></f:header><f:content><template:if test="{= ${converterContext>views}.length > 0}"><template:if test="{converterContext>multiViewsControl}"><template:then><fragments:MultipleMode /></template:then><template:elseif\n\t\t\t\t\t\t\t\ttest="{= ${converterContext>views}.length === 1 &amp;&amp; !${converterContext>hasMultiVisualizations} }"\n\t\t\t\t\t\t\t><template:with path="converterContext>views/0/presentation" var="presentationContext"><core:Fragment\n\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ListReport.view.fragments.CollectionVisualization"\n\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t/></template:with></template:elseif><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ListReport.view.fragments.CollectionVisualization"\n\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t/></template:else></template:if></template:if></f:content></f:DynamicPage></template:with></template:with></mvc:View>\n',
	"sap/fe/templates/ListReport/manifest.json":'{"_version":"1.14.0","sap.app":{"id":"sap.fe.templates.ListReport","type":"component","applicationVersion":{"version":"1.111.1"},"title":"List Report","tags":{"keywords":["List Report"]},"ach":"CA-UI5-FE","embeddedBy":"../","offline":false,"resources":"resources.json"},"sap.ui5":{"services":{"templatedViewService":{"settings":{"converterType":"ListReport"}}},"handleValidation":true,"dependencies":{"minUI5Version":"${sap.ui5.core.version}","libs":{"sap.fe.core":{},"sap.ui.mdc":{},"sap.fe.macros":{},"sap.ui.fl":{},"sap.fe.navigation":{}}}}}',
	"sap/fe/templates/ListReport/view/fragments/Chart.fragment.xml":'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.MacroChart" type="XML" /></core:FragmentDefinition>\n',
	"sap/fe/templates/ListReport/view/fragments/CollectionVisualization.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.fe.templates.controls"\n\txmlns:m="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n><template:if test="{= ${converterContext>hasMultiVisualizations} }"><template:then><m:VBox fitContainer="true" alignItems="Stretch" alignContent="Stretch" justifyContent="Start" renderType="Div"><template:repeat list="{converterContext>views}" var="view"><template:with path="view>primaryVisualization" var="presentationContext"><template:repeat list="{presentationContext>visualizations}" var="visualizationDefinition"><m:MessageStrip\n\t\t\t\t\t\t\t\ttext="{= \'{parts:[{path:\\\'internal>controls/ignoredFields\' + (${visualizationDefinition>collection}) + (${visualizationDefinition>type}) + \'\\\'}, {value: \\\'\' + (${visualizationDefinition>type} === \'Chart\') + \'\\\'},{value: \' + (${visualizationDefinition>type} === \'Chart\' ? JSON.stringify(${visualizationDefinition>applySupported}) : \'\\\'\\\'\') + \'}], formatter: \\\'.formatters.setALPControlMessageStrip\\\'}\'}"\n\t\t\t\t\t\t\t\ttype="Information"\n\t\t\t\t\t\t\t\tshowIcon="true"\n\t\t\t\t\t\t\t\tshowCloseButton="true"\n\t\t\t\t\t\t\t\tclass="sapUiSmallMargin"\n\t\t\t\t\t\t\t\tvisible="{= \'{= (${internal>controls/ignoredFields\' + (${visualizationDefinition>collection}) + (${visualizationDefinition>type}) + \'} || []).length>0 &amp;&amp; ${pageInternal>alpContentView} !== \\\'Table\\\'}\' }"\n\t\t\t\t\t\t\t/><core:Fragment\n\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ListReport.view.fragments.{visualizationDefinition>type}"\n\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t/></template:repeat></template:with><template:with path="view>secondaryVisualization" var="presentationContext"><template:repeat list="{presentationContext>visualizations}" var="visualizationDefinition"><m:HBox\n\t\t\t\t\t\t\t\theight="100%"\n\t\t\t\t\t\t\t\twidth="100%"\n\t\t\t\t\t\t\t\tvisible="{= ${pageInternal>alpContentView} !== \'Chart\'}"\n\t\t\t\t\t\t\t\tclass="sapUiSmallMarginTop"\n\t\t\t\t\t\t\t><core:Fragment\n\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ListReport.view.fragments.{visualizationDefinition>type}"\n\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t/></m:HBox></template:repeat></template:with></template:repeat></m:VBox></template:then><template:else><template:repeat list="{presentationContext>visualizations}" var="visualizationDefinition"><core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.{visualizationDefinition>type}" type="XML" /></template:repeat></template:else></template:if></core:FragmentDefinition>\n',
	"sap/fe/templates/ListReport/view/fragments/CustomView.fragment.xml":'<core:FragmentDefinition\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:core="sap.ui.core"\n\txmlns:fpm="sap.fe.macros.fpm"\n><fpm:CustomFragment id="{view>customTabId}" fragmentName="{view>fragment}" /></core:FragmentDefinition>\n',
	"sap/fe/templates/ListReport/view/fragments/MacroChart.fragment.xml":'<core:FragmentDefinition\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns="sap.m"\n\txmlns:macro="sap.fe.macros.internal"\n\txmlns:core="sap.ui.core"\n\ttemplate:require="{\n\t\tHELPER: \'sap/fe/macros/chart/ChartHelper\'\n\t}"\n><macro:Chart\n\t\tid="{visualizationDefinition>id}"\n\t\t_applyIdToContent="true"\n\t\tcontextPath="{visualizationDefinition>collection}"\n\t\tmetaPath="{presentationContext>annotationPath}"\n\t\tchartDefinition="{visualizationDefinition>}"\n\t\tselectionMode="Multiple"\n\t\tpersonalization="{visualizationDefinition>personalization}"\n\t\tchartDelegate="{= \'{name: \\\'sap/fe/templates/AnalyticalListPage/chart/FEChartDelegate\\\', payload: { contextPath: \\\'\' + HELPER.getCollectionName(${visualizationDefinition>collection}) + \'\\\', parameters:{$$groupId:\\\'$auto.Workers\\\'}, selectionMode: \\\'Multiple\\\' } }\' }"\n\t\tselectionChange=".handlers.onChartSelectionChanged"\n\t\theaderLevel="H2"\n\t\tnoDataText="{= ${sap.fe.i18n>T_TABLE_AND_CHART_NO_DATA_TEXT} }"\n\t\tstateChange=".handlers.onStateChange"\n\t\tvariantSaved=".handlers.onVariantSaved"\n\t\tvariantSelected=".handlers.onVariantSelected"\n\t/></core:FragmentDefinition>\n',
	"sap/fe/templates/ListReport/view/fragments/Table.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:macro="sap.fe.macros.internal"\n\txmlns:core="sap.ui.core"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n><macro:Table\n\t\tunittest:id="TablePropertyExpressionTest"\n\t\tmetaPath="{presentationContext>annotationPath}"\n\t\ttableDefinition="{visualizationDefinition>}"\n\t\tcontextPath="{fullContextPath>}"\n\t\tfilterBarId="{= ${converterContext>filterBarId} ? ${converterContext>filterBarId} : undefined}"\n\t\tnoDataText="{= ${sap.fe.i18n>T_TABLE_AND_CHART_NO_DATA_TEXT} }"\n\t\tbusy="{ui>/busy}"\n\t\tvariantSelected=".handlers.onVariantSelected"\n\t\tvariantSaved=".handlers.onVariantSaved"\n\t\tisAlp="{converterContext>hasMultiVisualizations}"\n\t\tonSegmentedButtonPressed="{= ${converterContext>hasMultiVisualizations} ? \'.handlers.onSegmentedButtonPressed\' : undefined }"\n\t\tvisible="{= ${converterContext>hasMultiVisualizations} ? \'{= ${pageInternal>alpContentView} !== \\\'Chart\\\'}\' : \'true\' }"\n\t\ttabTitle="{view>title}"\n\t\theaderLevel="H2"\n\t\tfieldMode="nowrapper"\n\t\tstateChange=".handlers.onStateChange"\n\t/></core:FragmentDefinition>\n',
	"sap/fe/templates/ListReport/view/fragments/VariantManagement.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:v="sap.ui.fl.variants"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\'\n\t}"\n><template:if\n\t\ttest="{= ${viewData>/variantManagement} === \'Page\' || (${viewData>/variantManagement} === \'Control\' &amp;&amp; !${converterContext>hideFilterBar})}"\n\t><template:then><v:VariantManagement\n\t\t\t\tid="{= ${viewData>/variantManagement} === \'Control\' ? ID.generate([ ${converterContext>filterBarId}, \'VariantManagement\']) : \'fe::PageVariantManagement\'}"\n\t\t\t\tunittest:id="{= ${viewData>/variantManagement} === \'Control\' ? \'listReportVMControlTest\' : \'listReportVMPageTest\'}"\n\t\t\t\tfor="{converterContext>variantManagement/targetControlIds}"\n\t\t\t\tshowSetAsDefault="true"\n\t\t\t\tselect=".handlers.onVariantSelected"\n\t\t\t\tsave=".handlers.onVariantSaved"\n\t\t\t\theaderLevel="H2"\n\t\t\t\tdisplayTextForExecuteOnSelectionForStandardVariant="{= ${viewData>/initialLoad} === \'Auto\' ? ${sap.fe.i18n>T_LR_VARIANT_APPLY_AUTOMATICALLY_WHEN_FILTER_SET} : undefined }"\n\t\t\t\texecuteOnSelectionForStandardDefault="{= ${viewData>/initialLoad} === \'Enabled\' || ${viewData>/initialLoad} === \'Auto\'}"\n\t\t\t/></template:then><template:else><Title unittest:id="listReportTitleTest" text="{= ${manifest>/sap.app/subTitle} || ${manifest>/sap.app/title} }" level="H2" /></template:else></template:if></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/ObjectPage.view.xml":'<mvc:View\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:customdata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"\n\txmlns:mvc="sap.ui.core.mvc"\n\txmlns:core="sap.ui.core"\n\txmlns:uxap="sap.uxap"\n\txmlns="sap.m"\n\txmlns:control="sap.fe.core.controls"\n\txmlns:fe="sap.fe.templates.controls"\n\txmlns:dt="sap.ui.dt"\n\txmlns:fl="sap.ui.fl"\n\txmlns:macro="sap.fe.macros"\n\txmlns:fclMacro="sap.fe.macros.fcl"\n\txmlns:internalMacro="sap.fe.macros.internal"\n\tcontrollerName="sap.fe.templates.ObjectPage.ObjectPageController"\n\ttemplate:require="{\n\t\t\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\t\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\t\t\tCONTACT: \'sap/fe/macros/contact/ContactHelper\',\n\t\t\t\tUI: \'sap/fe/core/templating/UIFormatters\',\n\t\t\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\t\t\tCOMMONFORMATTERS: \'sap/fe/core/templating/CommonFormatters\'\n\t\t\t}"\n><template:with path="entitySet>./" var="entityType"><template:with path="entityType>@com.sap.vocabularies.UI.v1.HeaderInfo" var="headerInfo"><uxap:ObjectPageLayout\n\t\t\t\tid="fe::ObjectPage"\n\t\t\t\tflexEnabled="true"\n\t\t\t\tunittest:id="objectPageLayoutTest"\n\t\t\t\tcustomdata:showRelatedApps="{viewData>/showRelatedApps}"\n\t\t\t\tcustomdata:ObjectPageTitle="{headerInfo>TypeName}"\n\t\t\t\tcustomdata:ObjectPageSubtitle="{= COMMONFORMATTERS.getBindingWithText(${headerInfo>Title/Value@@UI.getDataModelObjectPath}) }"\n\t\t\t\tshowHeaderContent="{converterContext>header/showContent}"\n\t\t\t\tshowFooter="true"\n\t\t\t\tbusy="{ui>/busy}"\n\t\t\t\tbusyIndicatorDelay="0"\n\t\t\t\tshowAnchorBar="{converterContext>showAnchorBar}"\n\t\t\t\tupperCaseAnchorBar="false"\n\t\t\t\tuseIconTabBar="{converterContext>useIconTabBar}"\n\t\t\t\ttoggleHeaderOnTitleClick="{converterContext>showAnchorBar}"\n\t\t\t\theaderContentPinnable="{converterContext>showAnchorBar}"\n\t\t\t\tenableLazyLoading="true"\n\t\t\t\tnavigate=".handlers.onNavigateChange"\n\t\t\t><uxap:dependents><control:CommandExecution execute="_executeTabShortCut" command="NextTab" /><control:CommandExecution execute="_executeTabShortCut" command="PreviousTab" /><control:CommandExecution\n\t\t\t\t\t\texecute="._editDocument(${$view>/getBindingContext})"\n\t\t\t\t\t\tenabled="{= OP.getEditCommandExecutionEnabled(${converterContext>header/actions}) }"\n\t\t\t\t\t\tvisible="{= OP.getEditCommandExecutionVisible(${converterContext>header/actions}) }"\n\t\t\t\t\t\tcommand="Edit"\n\t\t\t\t\t/><control:CommandExecution\n\t\t\t\t\t\texecute=".editFlow.toggleDraftActive(${$view>/getBindingContext})"\n\t\t\t\t\t\tvisible="{= OP.getSwitchToActiveVisibility(${entitySet>@}) }"\n\t\t\t\t\t\tcommand="SwitchToActiveObject"\n\t\t\t\t\t/><control:CommandExecution\n\t\t\t\t\t\texecute=".editFlow.toggleDraftActive(${$view>/getBindingContext})"\n\t\t\t\t\t\tvisible="{= OP.getSwitchToDraftVisibility(${entitySet>@}) }"\n\t\t\t\t\t\tcommand="SwitchToDraftObject"\n\t\t\t\t\t/><control:CommandExecution\n\t\t\t\t\t\texecute="{= ${entitySet>@@OP.getPressExpressionForDelete}}"\n\t\t\t\t\t\tvisible="{= OP.getDeleteCommandExecutionVisible(${converterContext>header/actions}) }"\n\t\t\t\t\t\tenabled="{= OP.getDeleteCommandExecutionEnabled(${converterContext>header/actions}) }"\n\t\t\t\t\t\tcommand="DeleteObject"\n\t\t\t\t\t/><control:CommandExecution\n\t\t\t\t\t\texecute="._saveDocument(${$view>/getBindingContext})"\n\t\t\t\t\t\tvisible="{ui>/isEditable}"\n\t\t\t\t\t\tcommand="Save"\n\t\t\t\t\t/><control:CommandExecution execute="._validateDocument" visible="{ui>/isEditable}" command="Validate" /><control:CommandExecution\n\t\t\t\t\t\texecute="._cancelDocument(${$view>/getBindingContext},{cancelButton:\'fe::FooterBar::StandardAction::Cancel\'})"\n\t\t\t\t\t\tvisible="{ui>/isEditable}"\n\t\t\t\t\t\tcommand="Cancel"\n\t\t\t\t\t/><control:CommandExecution execute="{converterContext>primaryAction}" command="FE_PrimaryAction" /><template:repeat list="{converterContext>headerCommandActions}" var="headerAction"><template:with path="headerAction>annotationPath" var="dataField"><template:with path="dataField>Action" helper="COMMON.getActionContext" var="actionContext"><template:with path="dataField>Action" helper="COMMON.getPathToBoundActionOverload" var="isBound"><template:if\n\t\t\t\t\t\t\t\t\t\ttest="{= ${headerAction>type} === \'ForAction\' ? ((${isBound>$IsBound} !== true || ${actionContext>@Org.OData.Core.V1.OperationAvailable} !== false) &amp;&amp; ${dataField>Determining} !== true) : true }"\n\t\t\t\t\t\t\t\t\t><internalMacro:ActionCommand\n\t\t\t\t\t\t\t\t\t\t\taction="{headerAction>}"\n\t\t\t\t\t\t\t\t\t\t\tonExecuteAction="{= OP.getPressExpressionForEdit(${dataField>}, ${entitySet>@sapui.name}, ${headerAction>}) }"\n\t\t\t\t\t\t\t\t\t\t\tonExecuteIBN="{headerAction>press}"\n\t\t\t\t\t\t\t\t\t\t\tonExecuteManifest="{= COMMON.buildActionWrapper(${headerAction>})}"\n\t\t\t\t\t\t\t\t\t\t\tisIBNEnabled="{headerAction>enabled}"\n\t\t\t\t\t\t\t\t\t\t\tisActionEnabled="{headerAction>enabled}"\n\t\t\t\t\t\t\t\t\t\t/></template:if></template:with></template:with></template:with></template:repeat><template:repeat list="{converterContext>footerCommandActions}" var="footerAction"><template:with path="footerAction>annotationPath" var="dataField"><template:with path="dataField>Action" helper="COMMON.getActionContext" var="actionContext"><template:with path="dataField>Action" helper="COMMON.getPathToBoundActionOverload" var="isBound"><template:if\n\t\t\t\t\t\t\t\t\t\ttest="{= ${footerAction>type} === \'ForAction\' ? ((${isBound>$IsBound} !== true || ${actionContext>@Org.OData.Core.V1.OperationAvailable} !== false) &amp;&amp; ${dataField>Determining} === true) : true }"\n\t\t\t\t\t\t\t\t\t><internalMacro:ActionCommand\n\t\t\t\t\t\t\t\t\t\t\taction="{footerAction>}"\n\t\t\t\t\t\t\t\t\t\t\tonExecuteAction="{= OP.getPressExpressionForFooterAnnotationAction(${dataField>}, ${entitySet>@sapui.name}, ${footerAction>}) }"\n\t\t\t\t\t\t\t\t\t\t\tonExecuteIBN="{footerAction>press}"\n\t\t\t\t\t\t\t\t\t\t\tonExecuteManifest="{= COMMON.buildActionWrapper(${footerAction>})}"\n\t\t\t\t\t\t\t\t\t\t\tisIBNEnabled="{footerAction>enabled}"\n\t\t\t\t\t\t\t\t\t\t\tisActionEnabled="{footerAction>enabled}"\n\t\t\t\t\t\t\t\t\t\t/></template:if></template:with></template:with></template:with></template:repeat></uxap:dependents><template:if test="{converterContext>header/visible}"><template:with path="converterContext>header" var="header"><uxap:headerTitle><uxap:ObjectPageDynamicHeaderTitle primaryArea="Begin" areaShrinkRatio="1:0:1.6"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.Heading" type="XML" /><uxap:expandedContent><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeadingContent" type="XML" /></uxap:expandedContent><uxap:snappedContent><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeadingContent" type="XML" /></uxap:snappedContent><uxap:content><template:if test="{entitySet>@com.sap.vocabularies.Common.v1.DraftRoot}"><macro:DraftIndicator\n\t\t\t\t\t\t\t\t\t\t\tdraftIndicatorType="IconOnly"\n\t\t\t\t\t\t\t\t\t\t\tclass="sapUiTinyMarginBegin sapMTB sapMTBNewFlex"\n\t\t\t\t\t\t\t\t\t\t\tentitySet="{entitySet>}"\n\t\t\t\t\t\t\t\t\t\t/></template:if><SituationsIndicator xmlns="sap.fe.macros.internal.situations" entitySet="{entitySet>}" /></uxap:content><uxap:navigationActions><template:if test="{= ${viewData>/viewLevel} > 1}"><macro:Paginator id="fe::Paginator" /></template:if><template:if test="{= ${viewData>/fclEnabled} }"><fclMacro:FlexibleColumnLayoutActions /></template:if></uxap:navigationActions><uxap:actions><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.Actions" type="XML" /></uxap:actions><uxap:breadcrumbs><Breadcrumbs\n\t\t\t\t\t\t\t\t\t\tunittest:id="BreadcrumbsTest"\n\t\t\t\t\t\t\t\t\t\tvisible="{= OP.getVisibleExpressionForBreadcrumbs(${viewData>/}) }"\n\t\t\t\t\t\t\t\t\t\tmodelContextChange="._setBreadcrumbLinks(${$source>/})"\n\t\t\t\t\t\t\t\t\t\tid="fe::Breadcrumbs"\n\t\t\t\t\t\t\t\t\t/></uxap:breadcrumbs></uxap:ObjectPageDynamicHeaderTitle></uxap:headerTitle><template:if test="{header>hasContent}"><uxap:headerContent><template:if test="{= COMMON.isDesktop() }"><template:then><FlexBox\n\t\t\t\t\t\t\t\t\t\t\tid="fe::HeaderContentContainer"\n\t\t\t\t\t\t\t\t\t\t\tunittest:id="FlexBoxTest"\n\t\t\t\t\t\t\t\t\t\t\tdt:designtime="sap/fe/templates/ObjectPage/designtime/FlexBox.designtime"\n\t\t\t\t\t\t\t\t\t\t\twrap="Wrap"\n\t\t\t\t\t\t\t\t\t\t\tfitContainer="false"\n\t\t\t\t\t\t\t\t\t\t\talignItems="Stretch"\n\t\t\t\t\t\t\t\t\t\t><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.HeaderContent"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></FlexBox></template:then><template:else><HeaderContainer\n\t\t\t\t\t\t\t\t\t\t\tid="fe::HeaderContentContainer"\n\t\t\t\t\t\t\t\t\t\t\tshowDividers="false"\n\t\t\t\t\t\t\t\t\t\t\tfl:flexibility="sap/fe/templates/ObjectPage/flexibility/ScrollableHeaderContainer.flexibility"\n\t\t\t\t\t\t\t\t\t\t><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.HeaderContent"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></HeaderContainer></template:else></template:if></uxap:headerContent></template:if></template:with></template:if><uxap:sections><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.Section" type="XML" /></uxap:sections><uxap:footer><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.FooterContent" type="XML" /></uxap:footer></uxap:ObjectPageLayout></template:with></template:with></mvc:View>\n',
	"sap/fe/templates/ObjectPage/manifest.json":'{"_version":"1.14.0","sap.app":{"id":"sap.fe.templates.ObjectPage","type":"component","applicationVersion":{"version":"1.111.1"},"title":"Object Page","tags":{"keywords":["Object Page"]},"ach":"CA-UI5-FE","embeddedBy":"../","offline":false,"resources":"resources.json"},"sap.ui":{"technology":"UI5","deviceTypes":{"desktop":true,"tablet":true,"phone":true},"supportedThemes":["sap_fiori_3","sap_hcb","sap_bluecrystal","sap_belize","sap_belize_plus","sap_belize_hcw"]},"sap.ui5":{"config":{"sapFiori2Adaptation":{"style":true,"hierarchy":true}},"commands":{"Cancel":{"name":"Cancel","shortcut":"Escape"},"Validate":{"name":"Validate","shortcut":"Enter"},"Create":{"name":"Create","shortcut":"Ctrl+Enter"},"DeleteEntry":{"name":"DeleteEntry","shortcut":"Ctrl+D"},"DeleteObject":{"name":"DeleteObject","shortcut":"Ctrl+Delete"},"Edit":{"name":"Edit","shortcut":"Ctrl+E"},"SwitchToActiveObject":{"name":"SwitchToActiveObject","shortcut":"Ctrl+Shift+A"},"SwitchToDraftObject":{"name":"SwitchToDraftObject","shortcut":"Ctrl+Shift+D"},"NextTab":{"name":"NextTab","shortcut":"Ctrl+F9"},"PreviousTab":{"name":"PreviousTab","shortcut":"Ctrl+Shift+F9"},"Save":{"name":"Save","shortcut":"Ctrl+S"},"TableSettings":{"name":"TableSettings","shortcut":"Ctrl+,"},"Share":{"name":"Share","shortcut":"Shift+Ctrl+S"},"FE_PrimaryAction":{"name":"FE_PrimaryAction","shortcut":"Ctrl+Enter"}},"services":{"templatedViewService":{"factoryName":"sap.fe.core.services.TemplatedViewService","startup":"waitFor","settings":{"converterType":"ObjectPage","viewName":"sap.fe.templates.ObjectPage.ObjectPage"}},"asyncComponentService":{"factoryName":"sap.fe.core.services.AsyncComponentService","startup":"waitFor"}},"handleValidation":true,"dependencies":{"minUI5Version":"${sap.ui5.core.version}","libs":{"sap.f":{},"sap.fe.macros":{"lazy":true},"sap.m":{},"sap.suite.ui.microchart":{"lazy":true},"sap.ui.core":{},"sap.ui.layout":{},"sap.ui.mdc":{},"sap.uxap":{},"sap.ui.fl":{}}},"contentDensities":{"compact":true,"cozy":true}}}',
	"sap/fe/templates/ObjectPage/view/fragments/Actions.fragment.xml":'<core:FragmentDefinition\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:macro="sap.fe.macros.internal"\n\txmlns:components="sap.fe.templates.ObjectPage.components"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tUI: \'sap/fe/core/templating/UIFormatters\',\n\t\tCRIT: \'sap/fe/core/templating/CriticalityFormatters\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tFIELD: \'sap/fe/macros/field/FieldHelper\',\n\t\tDEFAULTACTIONHANDLER: \'sap/fe/macros/internal/helpers/DefaultActionHandler\',\n\t\tFE_MODEL: \'sap/fe/core/helpers/ModelHelper\'\n\t}"\n><template:if test="{converterContext>header/actions}"><template:repeat list="{converterContext>header/actions}" var="headerAction"><template:if test="{= ${headerAction>type} === \'DraftActions\' &amp;&amp; OP.checkDraftState(${entitySet>@}) }"><template:then><components:DraftHandlerButton contextPath="{entitySet>}" id="fe::StandardAction::SwitchDraftAndActiveObject" /><template:if test="{= !${entitySet>@@FE_MODEL.isCollaborationDraftSupported} }"><ToolbarSpacer /></template:if></template:then><template:elseif test="{= ${headerAction>type} === \'CollaborationAvatars\' }"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.CollaborationDraft" type="XML" /><ToolbarSpacer /></template:elseif><template:elseif test="{= OP.isManifestAction(${headerAction>}) }"><template:if test="{= ${headerAction>type} === \'Menu\'}"><template:then><template:with path="headerAction>defaultAction/annotationPath" var="dataFieldForDefaultAction"><template:with\n\t\t\t\t\t\t\t\t\tpath="dataFieldForDefaultAction>Action"\n\t\t\t\t\t\t\t\t\thelper="COMMON.getActionContext"\n\t\t\t\t\t\t\t\t\tvar="defaultActionContext"\n\t\t\t\t\t\t\t\t><MenuButton\n\t\t\t\t\t\t\t\t\t\tcore:require="{FPM: \'sap/fe/core/helpers/FPMHelper\'}"\n\t\t\t\t\t\t\t\t\t\ttext="{headerAction>text}"\n\t\t\t\t\t\t\t\t\t\tmenuPosition="BeginBottom"\n\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\',${headerAction>id}])}"\n\t\t\t\t\t\t\t\t\t\tvisible="{headerAction>visible}"\n\t\t\t\t\t\t\t\t\t\tenabled="{headerAction>enabled}"\n\t\t\t\t\t\t\t\t\t\tuseDefaultActionOnly="{= DEFAULTACTIONHANDLER.getUseDefaultActionOnly(${headerAction>})}"\n\t\t\t\t\t\t\t\t\t\tbuttonMode="{= DEFAULTACTIONHANDLER.getButtonMode(${headerAction>})}"\n\t\t\t\t\t\t\t\t\t\tdefaultAction="{= OP.getDefaultActionHandler(${converterContext>header}, ${headerAction>}, ${dataFieldForDefaultAction>}, ${entitySet>@sapui.name})}"\n\t\t\t\t\t\t\t\t\t><menu><Menu><template:repeat list="{headerAction>menu}" var="menuItemAction"><template:with path="menuItemAction>annotationPath" var="dataField"><template:if test="{= ${menuItemAction>type} === \'ForAction\'}"><template:then><MenuItem\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${dataField>@@UI.getDataModelObjectPath}]) }"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\ttext="{dataField>Label}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tpress="{= ${menuItemAction>command} ? (\'cmd:\' + ${menuItemAction>command}) : OP.getPressExpressionForEdit(${dataField>}, ${entitySet>@sapui.name}, ${headerAction>}) }"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tvisible="{menuItemAction>visible}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tenabled="{menuItemAction>enabled}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/></template:then><template:elseif test="{= ${menuItemAction>type} === \'ForNavigation\'}"><MenuItem\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${dataField>@@UI.getDataModelObjectPath}]) }"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\ttext="{dataField>Label}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tpress="{= ${menuItemAction>command} ? (\'cmd:\' + ${menuItemAction>command}) : ${menuItemAction>press}}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tenabled="{menuItemAction>enabled}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tvisible="{menuItemAction>visible}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tmacrodata:IBNData="{menuItemAction>customData}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/></template:elseif><template:else><MenuItem\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\',${menuItemAction>id}])}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\ttext="{menuItemAction>text}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tpress="{= ${menuItemAction>command} ? (\'cmd:\' + ${menuItemAction>command}) : COMMON.buildActionWrapper(${menuItemAction>}, ${headerAction>})}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tvisible="{menuItemAction>visible}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tenabled="{menuItemAction>enabled}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t/></template:else></template:if></template:with></template:repeat></Menu></menu></MenuButton></template:with></template:with></template:then><template:else><Button\n\t\t\t\t\t\t\t\tunittest:id="ManifestActionTest"\n\t\t\t\t\t\t\t\tcore:require="{FPM: \'sap/fe/core/helpers/FPMHelper\'}"\n\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\',${headerAction>id}])}"\n\t\t\t\t\t\t\t\ttext="{headerAction>text}"\n\t\t\t\t\t\t\t\tpress="{= ${headerAction>command} ? (\'cmd:\' + ${headerAction>command}) : COMMON.buildActionWrapper(${headerAction>})}"\n\t\t\t\t\t\t\t\ttype="Default"\n\t\t\t\t\t\t\t\tvisible="{headerAction>visible}"\n\t\t\t\t\t\t\t\tenabled="{headerAction>enabled}"\n\t\t\t\t\t\t\t/></template:else></template:if></template:elseif><template:elseif test="{= ${headerAction>type} === \'Primary\'}"><template:with path="entitySet>" helper="OP.getEditAction" var="editAction"><template:with path="editAction>@Org.OData.Core.V1.OperationAvailable" var="operationAvailable"><template:if test="{= ${operationAvailable>} !== false }"><Button\n\t\t\t\t\t\t\t\t\tunittest:id="EditActionTest"\n\t\t\t\t\t\t\t\t\tid="fe::StandardAction::Edit"\n\t\t\t\t\t\t\t\t\ttype="{path: \'entitySet>./@com.sap.vocabularies.UI.v1.Identification\', formatter: \'OP.buildEmphasizedButtonExpression\'}"\n\t\t\t\t\t\t\t\t\ttext="{sap.fe.i18n>C_COMMON_OBJECT_PAGE_EDIT}"\n\t\t\t\t\t\t\t\t\tenabled="{headerAction>enabled}"\n\t\t\t\t\t\t\t\t\tvisible="{headerAction>visible}"\n\t\t\t\t\t\t\t\t\tpress="cmd:Edit"\n\t\t\t\t\t\t\t\t><layoutData><OverflowToolbarLayoutData priority="NeverOverflow" /></layoutData></Button></template:if></template:with></template:with></template:elseif><template:elseif test="{= ${headerAction>type} === \'Secondary\'}"><Button\n\t\t\t\t\t\tunittest:id="DeleteActionTest"\n\t\t\t\t\t\tid="fe::StandardAction::Delete"\n\t\t\t\t\t\ttype="Default"\n\t\t\t\t\t\ttext="{sap.fe.i18n>C_COMMON_DELETE}"\n\t\t\t\t\t\tvisible="{headerAction>visible}"\n\t\t\t\t\t\tenabled="{headerAction>enabled}"\n\t\t\t\t\t\tpress="cmd:DeleteObject"\n\t\t\t\t\t\tariaHasPopup="Dialog"\n\t\t\t\t\t/></template:elseif><template:elseif test="{= ${headerAction>type} === \'ForAction\' || ${headerAction>type} === \'Copy\'}"><template:with path="headerAction>annotationPath" var="dataField"><template:if\n\t\t\t\t\t\t\ttest="{= ${dataField>$Type} === \'com.sap.vocabularies.UI.v1.DataFieldForAction\' &amp;&amp; ${dataField>Determining} !== true }"\n\t\t\t\t\t\t><template:with path="dataField>Action" helper="COMMON.getActionContext" var="actionContext"><template:with path="dataField>Action" helper="COMMON.getPathToBoundActionOverload" var="isBound"><template:if\n\t\t\t\t\t\t\t\t\t\ttest="{= !(${dataField>./@com.sap.vocabularies.UI.v1.Hidden} === true) &amp;&amp; (${isBound>$IsBound} !== true || ${actionContext>@Org.OData.Core.V1.OperationAvailable} !== false) }"\n\t\t\t\t\t\t\t\t\t><Button\n\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${dataField>@@UI.getDataModelObjectPath}]) }"\n\t\t\t\t\t\t\t\t\t\t\tunittest:id="AnnotationActionTest"\n\t\t\t\t\t\t\t\t\t\t\ttext="{= ${headerAction>text} ? ${headerAction>text} : ${dataField>Label} }"\n\t\t\t\t\t\t\t\t\t\t\tpress="{= ${headerAction>command} ? (\'cmd:\' + ${headerAction>command}) : OP.getPressExpressionForEdit(${dataField>}, ${entitySet>@sapui.name}, ${headerAction>}) }"\n\t\t\t\t\t\t\t\t\t\t\tvisible="{headerAction>visible}"\n\t\t\t\t\t\t\t\t\t\t\tenabled="{headerAction>enabled}"\n\t\t\t\t\t\t\t\t\t\t\ttype="{= CRIT.buildExpressionForCriticalityButtonType(${dataField>@@UI.getDataModelObjectPath}) }"\n\t\t\t\t\t\t\t\t\t\t\tariaHasPopup="{actionContext>@@COMMON.isDialog}"\n\t\t\t\t\t\t\t\t\t\t/></template:if></template:with></template:with></template:if></template:with></template:elseif><template:elseif test="{= ${headerAction>type} === \'ForNavigation\'}"><template:with path="headerAction>annotationPath" var="dataField"><Button\n\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${dataField>@@UI.getDataModelObjectPath}]) }"\n\t\t\t\t\t\t\ttext="{headerAction>text}"\n\t\t\t\t\t\t\tpress="{= ${headerAction>command} ? (\'cmd:\' + ${headerAction>command}) : ${headerAction>press}}"\n\t\t\t\t\t\t\tenabled="{headerAction>enabled}"\n\t\t\t\t\t\t\ttype="{headerAction>buttonType}"\n\t\t\t\t\t\t\tvisible="{= ${headerAction>visible} &amp;&amp; \'{= !${internal>\' + ID.generate([\'fe\', ${dataField>}]) + \'/shellNavigationNotAvailable}}\'}"\n\t\t\t\t\t\t\tmacrodata:IBNData="{headerAction>customData}"\n\t\t\t\t\t\t/></template:with></template:elseif></template:if></template:repeat></template:if><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.RelatedApps" type="XML" /><macro:Share id="fe::Share" visible="{= OP.getShareButtonVisibility(${viewData>/}) }" /></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/Chart.fragment.xml":'<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><VBox fitContainer="true" alignItems="Stretch" alignContent="Stretch" justifyContent="Start" renderType="Div"><MessageStrip\n\t\t\ttext="{sap.fe.i18n>C_MULTIVIZ_CHART_IGNORED_FILTER_DRAFT_DATA}"\n\t\t\ttype="Information"\n\t\t\tshowIcon="true"\n\t\t\tshowCloseButton="true"\n\t\t\tclass="sapUiSmallMargin"\n\t\t\tvisible="{=\'{= ${internal>controls/showMessageStrip/\' + (${visualizationDefinition>entityName}) + (${visualizationDefinition>type}) + \'}  }\' }"\n\t\t/><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.MacroChart" type="XML" /></VBox></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/CollaborationDraft.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tFE_MODEL: \'sap/fe/core/helpers/ModelHelper\'\n\t}"\n><template:if test="{entitySet>@@FE_MODEL.isCollaborationDraftSupported}"><HBox\n\t\t\tclass="sapUiTinyMarginBegin"\n\t\t\titems="{internal>/collaboration/activeUsers}"\n\t\t\tvisible="{= ${ui>/isEditable} &amp;&amp; ${internal>/collaboration/connected} }"\n\t\t\talignItems="Center"\n\t\t\tjustifyContent="Start"\n\t\t><Avatar\n\t\t\t\tinitials="{internal>initials}"\n\t\t\t\tbackgroundColor="Accent{internal>color}"\n\t\t\t\tdisplaySize="XS"\n\t\t\t\tpress="._showCollaborationUserDetails"\n\t\t\t/></HBox><template:if test="{entitySet>@com.sap.vocabularies.Common.v1.DraftRoot/ShareAction}"><HBox visible="{ui>/isEditable}" alignItems="Center" justifyContent="Start"><Avatar backgroundColor="TileIcon" src="sap-icon://add-employee" displaySize="XS" press="._manageCollaboration" /></HBox></template:if></template:if></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/EditableHeaderFacet.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:f="sap.ui.layout.form"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:macro="sap.fe.macros"\n\txmlns:internalMacro="sap.fe.macros.internal"\n\txmlns:core="sap.ui.core"\n\txmlns:dt="sap.ui.dt"\n\txmlns:fl="sap.ui.fl"\n\txmlns:fpm="sap.fe.macros.fpm"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:formdata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"\n\ttemplate:require="{\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tFIELD: \'sap/fe/macros/field/FieldHelper\',\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tFORM: \'sap/fe/macros/form/FormHelper\',\n\t\tUI: \'sap/fe/core/templating/UIFormatters\'\n\t}"\n><f:Form\n\t\tfl:delegate=\'{\n\t\t\t"name": "sap/fe/macros/form/FormDelegate",\n\t\t\t"delegateType": "complete"\n\t\t}\'\n\t\tid="fe::EditableHeaderForm"\n\t\teditable="true"\n\t\tclass="sapUxAPObjectPageSubSectionAlignContent"\n\t\tformdata:navigationPath="{= COMMON.getNavigationPath(${entitySet>}, true) }"\n\t\tformdata:entitySet="{entitySet>@sapui.name}"\n\t><f:layout><f:ColumnLayout columnsM="2" columnsL="3" columnsXL="4" labelCellsLarge="12" /></f:layout><f:formContainers><f:FormContainer\n\t\t\t\tunittest:id="HeaderInfoFormContainerTest"\n\t\t\t\tid="fe::EditableHeaderForm::EditableHeaderInfo"\n\t\t\t\tvisible="{= OP.getVisiblityOfHeaderInfo(${entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@},${entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Description/Value/$Path@},${entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@@FIELD.fieldControl},${entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Description/Value/$Path@@FIELD.fieldControl}) }"\n\t\t\t><f:title><core:Title level="H4" text="{sap.fe.i18n>T_COMMON_OBJECT_PAGE_OBJECT_INFO}" /></f:title><f:dependents><macro:ValueHelp\n\t\t\t\t\t\tidPrefix="fe::EditableHeaderForm::EditableHeaderTitle::FieldValueHelp"\n\t\t\t\t\t\tproperty="{entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value}"\n\t\t\t\t\t/><macro:ValueHelp\n\t\t\t\t\t\tidPrefix="fe::EditableHeaderForm::EditableHeaderDescription::FieldValueHelp"\n\t\t\t\t\t\tproperty="{entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Description/Value}"\n\t\t\t\t\t/></f:dependents><f:formElements><f:FormElement id="fe::EditableHeaderForm::EditableHeaderTitle"><f:label><Label text="{entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Title/@@MODEL.label}"><layoutData><f:ColumnElementData cellsLarge="12" /></layoutData></Label></f:label><f:fields><internalMacro:Field\n\t\t\t\t\t\t\t\tidPrefix="fe::EditableHeaderForm::EditableHeaderTitle"\n\t\t\t\t\t\t\t\tvhIdPrefix="fe::EditableHeaderForm::EditableHeaderTitle::FieldValueHelp"\n\t\t\t\t\t\t\t\tentitySet="{entitySet>}"\n\t\t\t\t\t\t\t\tdataField="{entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Title}"\n\t\t\t\t\t\t\t><internalMacro:formatOptions textAlignMode="Form" showEmptyIndicator="true" /></internalMacro:Field></f:fields></f:FormElement><template:if test="{entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Description}"><f:FormElement id="fe::EditableHeaderForm::EditableHeaderDescription"><f:label><Label text="{entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Description/@@MODEL.label}"><layoutData><f:ColumnElementData cellsLarge="12" /></layoutData></Label></f:label><f:fields><internalMacro:Field\n\t\t\t\t\t\t\t\t\tidPrefix="fe::EditableHeaderForm::EditableHeaderDescription"\n\t\t\t\t\t\t\t\t\tvhIdPrefix="fe::EditableHeaderForm::EditableHeaderDescription::FieldValueHelp"\n\t\t\t\t\t\t\t\t\tentitySet="{entitySet>}"\n\t\t\t\t\t\t\t\t\tdataField="{entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Description}"\n\t\t\t\t\t\t\t\t><internalMacro:formatOptions textAlignMode="Form" showEmptyIndicator="true" /></internalMacro:Field></f:fields></f:FormElement></template:if></f:formElements></f:FormContainer><template:if test="{headerSection>subSections}"><template:repeat\n\t\t\t\t\tlist="{path: \'headerSection>subSections\', filters: [{path: \'type\', operator: \'EQ\', value1: \'Form\'}, {path: \'type\', operator: \'EQ\', value1: \'XMLFragment\'}]}"\n\t\t\t\t\tvar="subSection"\n\t\t\t\t><template:if test="{= !${subSection>stashed} }"><template:then><template:if test="{= !${subSection>template} }"><template:then><template:with path="subSection>annotationPath" var="facet"><template:repeat list="{path: \'subSection>formDefinition/formContainers\'}" var="formContainer"><template:if test="{= MODEL.getNavigationPath(${facet>Target/$AnnotationPath}) }"><template:then><template:with path="formContainer>entitySet" var="targetEntitySet"><macro:FormContainer\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tid="{= ${formContainer>id} ? ID.generate([\'fe\', \'HeaderFacet\', \'FormContainer\', ${formContainer>id} ]) : undefined }"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tdesigntimeSettings="{= ${subSection>flexSettings/designtime} === \'Default\' ? \'sap/fe/macros/form/FormContainer.designtime\' : ${subSection>flexSettings/designtime}}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\ttitle="{facet>@@MODEL.label}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\ttitleLevel="H4"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tdisplayMode="Edit"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tcontextPath="{targetEntitySet>}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tmetaPath="{formContainer>annotationPath}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tnavigationPath="{= MODEL.getNavigationPath(${facet>Target/$AnnotationPath}) ? MODEL.getNavigationPath(${facet>Target/$AnnotationPath}) : \'\'}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tdataFieldCollection="{formContainer>formElements}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tvisible="{subSection>visible}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t/></template:with></template:then><template:else><macro:FormContainer\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tid="{= ${formContainer>id} ? ID.generate([\'fe\', \'HeaderFacet\', \'FormContainer\', ${formContainer>id} ]) : undefined }"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tdesigntimeSettings="{= ${subSection>flexSettings/designtime} === \'Default\' ? \'sap/fe/macros/form/FormContainer.designtime\' : ${subSection>flexSettings/designtime}}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\ttitle="{facet>@@MODEL.label}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\ttitleLevel="H4"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tdisplayMode="Edit"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tcontextPath="{entitySet>}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tmetaPath="{formContainer>annotationPath}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tdataFieldCollection="{formContainer>formElements}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tvisible="{subSection>visible}"\n\t\t\t\t\t\t\t\t\t\t\t\t\t/></template:else></template:if></template:repeat></template:with></template:then><template:else><f:FormContainer\n\t\t\t\t\t\t\t\t\t\tid="{= ${subSection>id} ? ID.generate([${subSection>id}, \'CustomFormContainer\', ${subSection>@@UI.getDataModelObjectPath}]) : undefined }"\n\t\t\t\t\t\t\t\t\t\tvisible="{subSection>visible}"\n\t\t\t\t\t\t\t\t\t\tdt:designtime="{= ${subSection>flexSettings/designtime} === \'Default\' ? \'sap/ui/layout/designtime/form/FormContainer.designtime\' : ${subSection>flexSettings/designtime}}"\n\t\t\t\t\t\t\t\t\t><template:if test="{subSection>title}"><f:title><core:Title level="H4" text="{subSection>title}" /></f:title></template:if><f:formElements><fpm:CustomFragment\n\t\t\t\t\t\t\t\t\t\t\t\tid="{= ${subSection>id} ? ID.generate([${subSection>id}, \'CustomFragment\', ${subSection>@@UI.getDataModelObjectPath}]) : undefined }"\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="{subSection>template}"\n\t\t\t\t\t\t\t\t\t\t\t\tcontextPath="{entitySet>}"\n\t\t\t\t\t\t\t\t\t\t\t/></f:formElements></f:FormContainer></template:else></template:if></template:then></template:if></template:repeat></template:if></f:formContainers></f:Form></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/FooterContent.fragment.xml":'<core:FragmentDefinition\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:messages="sap.fe.macros.messages"\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\ttemplate:require="{\n\t\t\t\t\t\t\t ID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\t\t\t\t\t\t MODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\t\t\t\t\t\t OP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\t\t\t\t\t\t COMMON: \'sap/fe/macros/CommonHelper\',\n\t\t\t\t\t\t\t UI: \'sap/fe/core/templating/UIFormatters\',\n\t\t\t\t\t\t\t CRIT: \'sap/fe/core/templating/CriticalityFormatters\'\n\t\t\t\t\t\t\t}"\n><OverflowToolbar\n\t\tunittest:id="OverflowToolbarTest"\n\t\tid="fe::FooterBar"\n\t\tasyncMode="true"\n\t\tvisible="{= OP.getFooterVisible(${converterContext>footerActions}, ${entityType>./@com.sap.vocabularies.UI.v1.Identification})}"\n\t><core:InvisibleText\n\t\t\tid="fe::FooterBar::MessageButton::AriaText"\n\t\t\ttext="{sap.fe.i18n>C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_BUTTON_ARIA_TEXT}"\n\t\t/><messages:MessageButton\n\t\t\tid="fe::FooterBar::MessageButton"\n\t\t\tmessageChange="_getFooterVisibility"\n\t\t\tariaLabelledBy="fe::FooterBar::MessageButton::AriaText"\n\t\t\ttype="Emphasized"\n\t\t\tariaHasPopup="Dialog"\n\t\t/><ToolbarSpacer /><template:if\n\t\t\ttest="{= ${entitySet>@com.sap.vocabularies.Common.v1.DraftRoot} || ${entitySet>@com.sap.vocabularies.Common.v1.DraftNode}\n\t\t\t \t\t\t\t\t|| COMMON.isDraftParentEntityForContainment(${entitySet>$ContainsTarget}, undefined, ${converterContext>}) }"\n\t\t><DraftIndicator state="{ui>/draftStatus}" visible="{ui>/isEditable}" /></template:if><template:if test="{converterContext>footerActions}"><template:repeat list="{converterContext>footerActions}" var="footerAction"><template:if test="{= ${footerAction>type} === \'DefaultApply\'}"><template:then><Button\n\t\t\t\t\t\t\tunittest:id="ApplyActionTest"\n\t\t\t\t\t\t\tid="fe::FooterBar::StandardAction::Apply"\n\t\t\t\t\t\t\ttext="{sap.fe.i18n>T_COMMON_OBJECT_PAGE_APPLY_DRAFT}"\n\t\t\t\t\t\t\ttype="{path: \'entitySet>./@com.sap.vocabularies.UI.v1.Identification\', formatter: \'OP.buildEmphasizedButtonExpression\'}"\n\t\t\t\t\t\t\tenabled="true"\n\t\t\t\t\t\t\tpress="._applyDocument(${$view>/getBindingContext})"\n\t\t\t\t\t\t\tvisible="{ui>/isEditable}"\n\t\t\t\t\t\t/></template:then><template:elseif test="{= ${footerAction>type} === \'ForAction\'}"><template:with path="footerAction>annotationPath" var="dataField"><template:if test="{= !(${dataField>./@com.sap.vocabularies.UI.v1.Hidden} === true) }"><template:if\n\t\t\t\t\t\t\t\t\ttest="{= ${dataField>$Type} === \'com.sap.vocabularies.UI.v1.DataFieldForAction\' &amp;&amp; ${dataField>Determining} === true}"\n\t\t\t\t\t\t\t\t><template:with path="dataField>Action" helper="COMMON.getActionContext" var="actionContext"><template:with path="dataField>Action" helper="COMMON.getPathToBoundActionOverload" var="isBound"><template:if\n\t\t\t\t\t\t\t\t\t\t\t\ttest="{= ${isBound>$IsBound} !== true || ${actionContext>@Org.OData.Core.V1.OperationAvailable} !== false }"\n\t\t\t\t\t\t\t\t\t\t\t><Button\n\t\t\t\t\t\t\t\t\t\t\t\t\tunittest:id="AnnotationActionTest"\n\t\t\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', \'FooterBar\', ${dataField>@@UI.getDataModelObjectPath}] )}"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttext="{dataField>Label}"\n\t\t\t\t\t\t\t\t\t\t\t\t\tariaHasPopup="{actionContext>@@COMMON.isDialog}"\n\t\t\t\t\t\t\t\t\t\t\t\t\tpress="{= ${footerAction>command} ? (\'cmd:\' + ${footerAction>command}) : OP.getPressExpressionForFooterAnnotationAction(${dataField>}, ${entitySet>@sapui.name}, ${footerAction>}) }"\n\t\t\t\t\t\t\t\t\t\t\t\t\tvisible="{footerAction>visible}"\n\t\t\t\t\t\t\t\t\t\t\t\t\tenabled="{footerAction>enabled}"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="{= CRIT.buildExpressionForCriticalityButtonType(${dataField>@@UI.getDataModelObjectPath}) }"\n\t\t\t\t\t\t\t\t\t\t\t\t/></template:if></template:with></template:with></template:if></template:if></template:with></template:elseif><template:elseif test="{= ${footerAction>type} === \'Primary\'}"><Button\n\t\t\t\t\t\t\tunittest:id="PrimaryActionTest"\n\t\t\t\t\t\t\tid="fe::FooterBar::StandardAction::Save"\n\t\t\t\t\t\t\ttext="{= OP.getExpressionForSaveButton(${viewData>}, ${fullContextPath>@@UI.getDataModelObjectPath})}"\n\t\t\t\t\t\t\ttooltip="{= COMMON.getTooltipForKeyboardShortcuts(${sap.fe.i18n>T_KEYBOARD_SHORTCUT_SAVE_WIN}, ${sap.fe.i18n>T_KEYBOARD_SHORTCUT_SAVE_MAC})}"\n\t\t\t\t\t\t\ttype="{path: \'entitySet>./@com.sap.vocabularies.UI.v1.Identification\', formatter: \'OP.buildEmphasizedButtonExpression\'}"\n\t\t\t\t\t\t\tvisible="{ui>/isEditable}"\n\t\t\t\t\t\t\tenabled="true"\n\t\t\t\t\t\t\tpress="cmd:Save"\n\t\t\t\t\t\t/></template:elseif><template:elseif test="{= ${footerAction>type} === \'Secondary\'}"><Button\n\t\t\t\t\t\t\tunittest:id="SecondaryActionTest"\n\t\t\t\t\t\t\tid="fe::FooterBar::StandardAction::Cancel"\n\t\t\t\t\t\t\ttext="{= ${entitySet>@com.sap.vocabularies.Common.v1.DraftRoot} ? ${sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISCARD_DRAFT} : ${sap.fe.i18n>C_COMMON_OBJECT_PAGE_CANCEL} }"\n\t\t\t\t\t\t\tpress="cmd:Cancel"\n\t\t\t\t\t\t\tvisible="{ui>/isEditable}"\n\t\t\t\t\t\t\tariaHasPopup="Dialog"\n\t\t\t\t\t\t\tenabled="true"\n\t\t\t\t\t\t><layoutData><OverflowToolbarLayoutData priority="NeverOverflow" /></layoutData></Button></template:elseif><template:elseif test="{= OP.isManifestAction(${footerAction>}) }"><Button\n\t\t\t\t\t\t\tunittest:id="ManifestActionTest"\n\t\t\t\t\t\t\tcore:require="{FPM: \'sap/fe/core/helpers/FPMHelper\'}"\n\t\t\t\t\t\t\tid="{= ID.generate([\'fe\',\'FooterBar\',${footerAction>id}])}"\n\t\t\t\t\t\t\ttext="{footerAction>text}"\n\t\t\t\t\t\t\tpress="{= ${footerAction>command} ? (\'cmd:\' + ${footerAction>command}) : COMMON.buildActionWrapper(${footerAction>})}"\n\t\t\t\t\t\t\ttype="Transparent"\n\t\t\t\t\t\t\tvisible="{footerAction>visible}"\n\t\t\t\t\t\t\tenabled="{footerAction>enabled}"\n\t\t\t\t\t\t/></template:elseif></template:if></template:repeat></template:if></OverflowToolbar></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/FormActions.fragment.xml":'<core:FragmentDefinition\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:uxap="sap.uxap"\n><uxap:actions><template:repeat list="{subSection>actions}" var="action"><core:Fragment fragmentName="sap.fe.macros.form.FormActionButtons" type="XML" /></template:repeat></uxap:actions></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/HeaderContent.fragment.xml":'<core:FragmentDefinition\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:dt="sap.ui.dt"\n\txmlns:fl="sap.ui.fl"\n\txmlns:fe="sap.fe.templates.ObjectPage.controls"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\t\tID: \'sap/fe/core/helpers/StableIdHelper\'\n\t}"\n><template:if test="{header>avatar}"><Avatar\n\t\t\tunittest:id="AvatarOPHeaderContent"\n\t\t\tclass="sapUiSmallMarginEnd sapUiSmallMarginBottom"\n\t\t\tsrc="{header>avatar/src}"\n\t\t\tinitials="{header>avatar/initials}"\n\t\t\tfallbackIcon="{header>avatar/fallbackIcon}"\n\t\t\tdisplayShape="{header>avatar/displayShape}"\n\t\t\tdisplaySize="XL"\n\t\t/></template:if><template:with path="converterContext>header/facets" var="converterHeaderFacets"><template:repeat list="{converterHeaderFacets>}" var="converterHeaderFacet"><template:if test="{= ${converterHeaderFacet>type} === \'Annotation\'}"><template:then><template:with path="converterHeaderFacet>annotationPath" var="headerFacet"><template:with path="headerFacet>" var="collectionHeaderFacet"><template:if test="{= ${converterHeaderFacet>facetType} === \'Reference\' }"><template:then><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeaderFacet" type="XML" /></template:then><template:elseif test="{= ${converterHeaderFacet>facetType} === \'Collection\' }"><fe:StashableVBox\n\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', \'HeaderCollectionFacetContainer\', ${collectionHeaderFacet>@@UI.getDataModelObjectPath} ])}"\n\t\t\t\t\t\t\t\t\t\tdt:designtime="{= ${converterHeaderFacet>flexSettings/designtime} === \'Default\' ? \'sap/fe/templates/ObjectPage/designtime/StashableVBox.designtime\' : ${converterHeaderFacet>flexSettings/designtime}}"\n\t\t\t\t\t\t\t\t\t\tfl:flexibility="sap/fe/templates/ObjectPage/flexibility/StashableVBox.flexibility"\n\t\t\t\t\t\t\t\t\t\tstashed="{converterHeaderFacet>stashed}"\n\t\t\t\t\t\t\t\t\t\tdisplayInline="true"\n\t\t\t\t\t\t\t\t\t><template:repeat list="{converterHeaderFacet>facets}" var="converterHeaderFacet"><template:with path="converterHeaderFacet>annotationPath" var="headerFacet"><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.HeaderFacet"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t/></template:with></template:repeat></fe:StashableVBox></template:elseif></template:if></template:with></template:with></template:then><template:elseif test="{= ${converterHeaderFacet>fragmentName}}"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeaderFacetCustomContainer" type="XML" /></template:elseif></template:if></template:repeat></template:with></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/HeaderDataPoint.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:internalMacro="sap.fe.macros.internal"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tMESSAGE: \'sap/base/strings/formatMessage\',\n\t\tFIELD: \'sap/fe/macros/field/FieldHelper\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tUI: \'sap/fe/core/templating/UIFormatters\'\n\t}"\n><VBox\n\t\tid="{= ID.generate([\'fe\', \'HeaderFacet\', ${converterHeaderFacet>headerDataPointData/type} !== \'Content\' ? ${converterHeaderFacet>headerDataPointData/type} : \'KeyFigure\', ${headerFacet>@@UI.getDataModelObjectPath} ]) }"\n\t><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeaderDataPointTitle" type="XML" /><internalMacro:DataPoint metaPath="{dataPoint>}" contextPath="{entitySet>}"><internalMacro:formatOptions dataPointStyle="large" showLabels="true" iconSize="1.375rem" /></internalMacro:DataPoint></VBox></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/HeaderDataPointTitle.fragment.xml":'<core:FragmentDefinition\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tFIELD: \'sap/fe/macros/field/FieldHelper\',\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\'\n\t}"\n><template:if\n\t\ttest="{= ${viewData>controlConfiguration}[${converterHeaderFacet>targetAnnotationValue}][\'navigation\'][\'targetOutbound\'][\'outbound\'] }"\n\t><template:then><core:InvisibleText\n\t\t\t\ttext="{sap.fe.i18n>T_HEADER_DATAPOINT_TITLE_LINK_EXTERNAL_ARIA}"\n\t\t\t\tid="{= ID.generate([\'fe\', ${converterHeaderFacet>targetAnnotationValue}, \'AriaText\']) }"\n\t\t\t/><Title\n\t\t\t\tunittest:id="headerDataPointLinkTitleTest"\n\t\t\t\tlevel="H3"\n\t\t\t\tvisible="{= COMMON.getHeaderDataPointLinkVisibility(ID.generate([\'fe\', \'HeaderDPLink\', ${converterHeaderFacet>targetAnnotationValue}]), true, ${dataPoint>@@FIELD.isNotAlwaysHidden}) }"\n\t\t\t><content><Link\n\t\t\t\t\t\tunittest:id="headerDataPointLinkInsideTitleTest"\n\t\t\t\t\t\tid="{= ID.generate([\'fe\', \'HeaderDPLink\', ${converterHeaderFacet>targetAnnotationValue}]) }"\n\t\t\t\t\t\ttext="{dataPoint>Title@@MODEL.value}"\n\t\t\t\t\t\tpress="{= OP.getPressExpressionForLink(${viewData>controlConfiguration}[${converterHeaderFacet>targetAnnotationValue}][\'navigation\'], ${manifest>/sap.app/crossNavigation/outbounds})}"\n\t\t\t\t\t\tariaDescribedBy="{= ID.generate([\'fe\', ${converterHeaderFacet>targetAnnotationValue}, \'AriaText\']) }"\n\t\t\t\t\t\tclass="sapUiTinyMarginBottom"\n\t\t\t\t\t/></content></Title><Title\n\t\t\t\tunittest:id="headerDataPointTitleTest"\n\t\t\t\tid="{= ID.generate([\'fe\', \'HeaderDPTitle\', ${headerFacet>Target/$AnnotationPath}]) }"\n\t\t\t\tlevel="H3"\n\t\t\t\ttext="{dataPoint>Title@@MODEL.value}"\n\t\t\t\tclass="sapUiTinyMarginBottom"\n\t\t\t\tvisible="{= COMMON.getHeaderDataPointLinkVisibility(ID.generate([\'fe\', \'HeaderDPLink\', ${converterHeaderFacet>targetAnnotationValue}]), false, ${dataPoint>@@FIELD.isNotAlwaysHidden}) }"\n\t\t\t/></template:then><template:elseif\n\t\t\ttest="{= ${viewData>controlConfiguration}[${converterHeaderFacet>targetAnnotationValue}][\'navigation\'][\'targetSections\'] }"\n\t\t><core:InvisibleText\n\t\t\t\ttext="{sap.fe.i18n>T_COMMON_HEADERDP_TITLE_LINK_INPAGE_ARIA}"\n\t\t\t\tid="{= ID.generate([\'fe\', ${converterHeaderFacet>targetAnnotationValue}, \'AriaText\']) }"\n\t\t\t/><Title level="H3" visible="{= !!${dataPoint>Title}}"><content><Link\n\t\t\t\t\t\tunittest:id="HeaderDataPointInternalLinkTest"\n\t\t\t\t\t\tid="{= ID.generate([\'fe\', \'HeaderDPLink\', ${headerFacet>Target/$AnnotationPath}]) }"\n\t\t\t\t\t\ttext="{dataPoint>Title@@MODEL.value}"\n\t\t\t\t\t\tpress="{= OP.getPressExpressionForLink(${viewData>controlConfiguration}[${converterHeaderFacet>targetAnnotationValue}][\'navigation\']) }"\n\t\t\t\t\t\tariaDescribedBy="{= ID.generate([\'fe\', ${converterHeaderFacet>targetAnnotationValue}, \'AriaText\']) }"\n\t\t\t\t\t/></content></Title></template:elseif><template:else><Title\n\t\t\t\tid="{= ID.generate([\'fe\', \'HeaderDPTitle\', ${headerFacet>Target/$AnnotationPath}]) }"\n\t\t\t\tlevel="H3"\n\t\t\t\ttext="{dataPoint>Title@@MODEL.value}"\n\t\t\t\tclass="sapUiTinyMarginBottom"\n\t\t\t\tvisible="{dataPoint>@@FIELD.isNotAlwaysHidden}"\n\t\t\t/></template:else></template:if></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/HeaderFacet.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:macro="sap.fe.macros"\n\txmlns:internalMacro="sap.fe.macros.internal"\n\txmlns:dt="sap.ui.dt"\n\txmlns:fl="sap.ui.fl"\n\txmlns:fe="sap.fe.templates.ObjectPage.controls"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tUI: \'sap/fe/core/templating/UIFormatters\'\n\t}"\n><fe:StashableHBox\n\t\tid="{= ID.generate([\'fe\', \'HeaderFacetContainer\', ${headerFacet>@@UI.getDataModelObjectPath} ])}"\n\t\tdt:designtime="{= ${converterHeaderFacet>flexSettings/designtime} === \'Default\' ? \'sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime\' : ${converterHeaderFacet>flexSettings/designtime}}"\n\t\tfl:flexibility="sap/fe/templates/ObjectPage/flexibility/StashableHBox.flexibility"\n\t\tunittest:id="headerFacetContent"\n\t\tclass="sapUiMediumMarginEnd sapUiSmallMarginBottom"\n\t\tvisible="{converterHeaderFacet>visible}"\n\t\tfallbackTitle="{headerFacet>@@MODEL.label}"\n\t\tbinding="{= OP.getStashableHBoxBinding(${viewData>/controlConfiguration}, { Facet: ${converterHeaderFacet>} })}"\n\t\tstashed="{converterHeaderFacet>stashed}"\n\t><template:if test="{= ${converterHeaderFacet>targetAnnotationType} === \'DataPoint\'}"><template:then><template:with path="headerFacet>Target/$AnnotationPath/" var="dataPoint"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeaderDataPoint" type="XML" /></template:with></template:then><template:elseif test="{= ${converterHeaderFacet>targetAnnotationType} === \'Chart\'}"><template:with path="headerFacet>Target/$AnnotationPath" var="collection" helper="MODEL.resolve$Path"><template:with path="collection>" var="collection" helper="COMMON.getNavigationContext"><internalMacro:MicroChart\n\t\t\t\t\t\t\tunittest:id="macroMicroChart"\n\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', \'HeaderFacet\', \'MicroChart\', ${headerFacet>@@UI.getDataModelObjectPath} ]) }"\n\t\t\t\t\t\t\tbatchGroupId="{= OP.getGroupIdFromConfig(\n\t\t\t\t\t\t\t\t${viewData>/controlConfiguration},\n\t\t\t\t\t\t\t\t${headerFacet>Target/$AnnotationPath},\n\t\t\t\t\t\t\t\t(((${headerFacet>Target/$AnnotationPath}.indexOf(\'/\') > 0) &amp;&amp; ${collection>$isCollection}) ? \'$auto.Decoration\' : undefined) ) }"\n\t\t\t\t\t\t\tcontextPath="{collection>}"\n\t\t\t\t\t\t\tmetaPath="{headerFacet>Target/$AnnotationPath/}"\n\t\t\t\t\t\t\tnavigationType="{= OP.getMicroChartTitleAsLink(${viewData>controlConfiguration}[${headerFacet>Target/$AnnotationPath}][\'navigation\'])}"\n\t\t\t\t\t\t\tonTitlePressed="{= OP.getExpressionForMicroChartTitlePress(${viewData>controlConfiguration}[${headerFacet>Target/$AnnotationPath}][\'navigation\'], ${manifest>/sap.app/crossNavigation/outbounds}, ${collection>@sapui.name})}"\n\t\t\t\t\t\t/></template:with></template:with></template:elseif><template:elseif test="{= ${converterHeaderFacet>targetAnnotationType} === \'Identification\'}"><template:with path="headerFacet>Target" var="form"><Text text="Identification in header facet" /></template:with></template:elseif><template:elseif test="{= ${converterHeaderFacet>targetAnnotationType} === \'Contact\'}"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.ObjectPageHeaderContact" type="XML" /></template:elseif><template:elseif test="{= ${converterHeaderFacet>targetAnnotationType} === \'Address\'}"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.ObjectPageHeaderAddress" type="XML" /></template:elseif><template:elseif test="{= ${converterHeaderFacet>targetAnnotationType} === \'FieldGroup\'}"><template:with path="headerFacet>" var="headerForm"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.ObjectPageHeaderForm" type="XML" /></template:with></template:elseif><template:else><VBox width="150px" class="sapUiSmallMargin"><Text text="Unsupported Facet Type: {converterHeaderFacet>targetAnnotationType}" visible="true" wrapping="true" /></VBox></template:else></template:if></fe:StashableHBox></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/HeaderFacetCustomContainer.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:fpm="sap.fe.macros.fpm"\n\txmlns:fe="sap.fe.templates.ObjectPage.controls"\n\txmlns:dt="sap.ui.dt"\n\txmlns:fl="sap.ui.fl"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\'\n\t}"\n><fe:StashableHBox\n\t\tid="{converterHeaderFacet>containerId}"\n\t\tdt:designtime="{= ${converterHeaderFacet>flexSettings/designtime} === \'Default\' ? \'sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime\' : ${converterHeaderFacet>flexSettings/designtime}}"\n\t\tfl:flexibility="sap/fe/templates/ObjectPage/flexibility/StashableHBox.flexibility"\n\t\tunittest:id="headerFacetContent"\n\t\tclass="sapUiMediumMarginEnd sapUiSmallMarginBottom"\n\t\tvisible="{converterHeaderFacet>visible}"\n\t\tfallbackTitle="{converterHeaderFacet>title}"\n\t\tbinding="{converterHeaderFacet>binding}"\n\t\tstashed="{converterHeaderFacet>stashed}"\n\t><VBox displayInline="true"><template:if test="{= !!${converterHeaderFacet>title} &amp;&amp; !!${converterHeaderFacet>subTitle} }"><template:then><Title level="H3" text="{converterHeaderFacet>title}" /><Text text="{converterHeaderFacet>subTitle}" class="sapUiSmallMarginBottom" /></template:then><template:elseif test="{= !!${converterHeaderFacet>title} }"><Title level="H3" text="{converterHeaderFacet>title}" class="sapUiSmallMarginBottom" /></template:elseif></template:if><fpm:CustomFragment\n\t\t\t\tid="{converterHeaderFacet>id}"\n\t\t\t\tfragmentName="{converterHeaderFacet>fragmentName}"\n\t\t\t\tcontextPath="{entitySet>}"\n\t\t\t/></VBox></fe:StashableHBox></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/Heading.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:uxap="sap.uxap"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tUI: \'sap/fe/core/templating/UIFormatters\'\n\t}"\n><template:with path="entityType>@com.sap.vocabularies.UI.v1.HeaderInfo" var="headerInfo"><template:with path="header>avatar" var="avatar"><uxap:expandedHeading><FlexBox renderType="Bare"><FlexBox visible="{header>title/expandedImageVisible}"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeadingAvatar" type="XML" /></FlexBox><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeadingTitle" type="XML" /></FlexBox></uxap:expandedHeading><uxap:snappedHeading><FlexBox renderType="Bare"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeadingAvatar" type="XML" /><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeadingTitle" type="XML" /></FlexBox></uxap:snappedHeading><uxap:snappedTitleOnMobile><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.HeadingTitle" type="XML" /></uxap:snappedTitleOnMobile></template:with></template:with></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/HeadingAvatar.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n><template:if test="{avatar>}"><Avatar\n\t\t\tclass="sapUiSmallMarginEnd"\n\t\t\tsrc="{avatar>src}"\n\t\t\tinitials="{avatar>initials}"\n\t\t\tfallbackIcon="{avatar>fallbackIcon}"\n\t\t\tdisplayShape="{avatar>displayShape}"\n\t\t\tdisplaySize="S"\n\t\t/></template:if></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/HeadingContent.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:uxap="sap.uxap"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tDATAFIELDHELPER : \'sap/fe/core/converters/helpers/DataFieldHelper\'\n\t}"\n><FlexBox><template:if test="{entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Description}"><template:if test="{= !DATAFIELDHELPER.isHeaderStaticallyHidden(${headerInfo>Description@@UI.getDataModelObjectPath})}"><Label\n\t\t\t\t\ttext="{= OP.getExpressionForDescription(${headerInfo>@@UI.getConverterContext}, ${fullContextPath>@@UI.getDataModelObjectPath})}"\n\t\t\t\t\twrapping="true"\n\t\t\t\t/></template:if></template:if></FlexBox><MessageStrip\n\t\tvisible="{= ${internal>OPMessageStripVisibility} || false }"\n\t\ttext="{internal>OPMessageStripText}"\n\t\ttype="{internal>OPMessageStripType}"\n\t\tshowIcon="true"\n\t\tshowCloseButton="true"\n\t\tclass="sapUiSmallMarginTop"\n\t\tclose=".handlers.closeOPMessageStrip"\n\t/></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/HeadingTitle.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:uxap="sap.uxap"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tUI: \'sap/fe/core/templating/UIFormatters\',\n\t\tDATAFIELDHELPER : \'sap/fe/core/converters/helpers/DataFieldHelper\'\n\t}"\n><template:with path="entityType>@com.sap.vocabularies.UI.v1.HeaderInfo" var="headerInfo"><template:if test="{entityType>@com.sap.vocabularies.UI.v1.HeaderInfo/Title}"><template:if test="{= !DATAFIELDHELPER.isHeaderStaticallyHidden(${headerInfo>Title@@UI.getDataModelObjectPath})}"><Title\n\t\t\t\t\ttext="{= OP.getExpressionForTitle(${headerInfo>@@UI.getConverterContext}, ${viewData>}, ${fullContextPath>@@UI.getDataModelObjectPath}, ${entitySet>@com.sap.vocabularies.Common.v1.DraftRoot})}"\n\t\t\t\t\twrapping="true"\n\t\t\t\t\tlevel="H2"\n\t\t\t\t/></template:if></template:if></template:with></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/MacroChart.fragment.xml":'<core:FragmentDefinition\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns="sap.m"\n\txmlns:macro="sap.fe.macros.internal"\n\txmlns:core="sap.ui.core"\n\ttemplate:require="{\n\t\tHELPER: \'sap/fe/macros/chart/ChartHelper\'\n\t}"\n><macro:Chart\n\t\tid="{visualizationDefinition>id}"\n\t\t_applyIdToContent="true"\n\t\tcontextPath="{visualizationDefinition>collection}"\n\t\tmetaPath="{presentationContext>annotationPath}"\n\t\tchartDefinition="{visualizationDefinition>}"\n\t\tselectionMode="Multiple"\n\t\tpersonalization="{visualizationDefinition>personalization}"\n\t\tchartDelegate="{= \'{name: \\\'sap/fe/templates/AnalyticalListPage/chart/FEChartDelegate\\\', payload: { contextPath: \\\'\' + HELPER.getCollectionName(${visualizationDefinition>collection}) + \'\\\', parameters:{$$groupId:\\\'$auto.Workers\\\'}, selectionMode: \\\'Multiple\\\' } }\' }"\n\t\tselectionChange=".handlers.onChartSelectionChanged"\n\t\theaderLevel=\'{= ${section>subSections}.length > 1 ? (${subSection>level} === 2 &amp;&amp; ${subSection>titleVisible} ? "H6": "H5") : (${subSection>level} === 2 &amp;&amp; ${subSection>titleVisible} ? "H5": "H4")}\'\n\t\tstateChange=".handlers.onStateChange"\n\t\tvariantSaved=".handlers.onVariantSaved"\n\t\tvariantSelected=".handlers.onVariantSelected"\n\t/></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/ObjectPageHeaderAddress.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:macro="sap.fe.macros"\n\txmlns:dt="sap.ui.dt"\n\txmlns:fl="sap.ui.fl"\n\txmlns:fe="sap.fe.templates.ObjectPage.controls"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\'\n\t}"\n><template:with path="headerFacet>Target/$AnnotationPath/" var="addressPath"><VBox id="{= ${converterHeaderFacet>headerFormData/id} }" displayInline="true"><Title level="H3" text="{headerFacet>Label}" /><Text\n\t\t\t\tunittest:id="ObjectPageHeaderAddressTest"\n\t\t\t\trenderWhitespace="true"\n\t\t\t\tclass="sapMLabel"\n\t\t\t\ttext="{addressPath>label@@MODEL.format}"\n\t\t\t/></VBox></template:with></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/ObjectPageHeaderContact.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:macro="sap.fe.macros"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tUI: \'sap/fe/core/templating/UIFormatters\'\n\t}"\n><template:with path="headerFacet>Target/$AnnotationPath" var="collection" helper="MODEL.resolve$Path"><template:with path="collection>" var="collection" helper="COMMON.getNavigationContext"><VBox id="{= ID.generate([\'fe\', \'HeaderFacet\', \'Contact\', ${headerFacet>@@UI.getDataModelObjectPath}]) }" displayInline="true"><template:if test="{headerFacet>@@MODEL.label}"><Title level="H3" text="{headerFacet>@@MODEL.label}" class="sapUiSmallMarginBottom" /></template:if><template:with path="headerFacet>Target/$AnnotationPath" var="metaPath"><template:with path="headerFacet>Target/$AnnotationPath@@COMMON.getMetaPath" var="contactPath"><macro:Contact metaPath="{metaPath>}" contextPath="{entitySet>}" visible="true" /></template:with></template:with></VBox></template:with></template:with></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/ObjectPageHeaderForm.fragment.xml":'<core:FragmentDefinition\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns="sap.m"\n\txmlns:internalMacro="sap.fe.macros.internal"\n\txmlns:core="sap.ui.core"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n\txmlns:fpm="sap.fe.macros.fpm"\n\txmlns:l="sap.ui.layout"\n\ttemplate:require="{\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tFIELD: \'sap/fe/macros/field/FieldHelper\'\n\t}"\n><VBox id="{= ${converterHeaderFacet>headerFormData/id} }" displayInline="true"><template:if test="{converterHeaderFacet>headerFormData/label}"><Title level="H3" text="{converterHeaderFacet>headerFormData/label}" class="sapUiSmallMarginBottom" /></template:if><template:if test="{= OP.doesFieldGroupContainOnlyOneMultiLineDataField(${converterHeaderFacet>headerFormData/formElements})}"><template:then><template:with path="converterHeaderFacet>headerFormData/formElements/0/" var="dataField"><template:if test="{dataField>visible}"><layoutData><FlexItemData maxWidth="300px" /></layoutData><template:with path="dataField>annotationPath" var="annotationDataField"><Text text="{annotationDataField>Value@@MODEL.format}" emptyIndicatorMode="On" /></template:with></template:if></template:with></template:then><template:else><template:repeat list="{converterHeaderFacet>headerFormData/formElements}" var="formElement"><template:if test="{= ${formElement>type} === \'Annotation\' }"><template:then><template:with path="formElement>annotationPath" var="dataField"><HBox\n\t\t\t\t\t\t\t\t\tunittest:id="ObjectPageHeaderHBoxTest"\n\t\t\t\t\t\t\t\t\tclass="sapUiTinyMarginBottom"\n\t\t\t\t\t\t\t\t\tvisible="{formElement>visible}"\n\t\t\t\t\t\t\t\t\trenderType="{= OP.getHeaderFormHboxRenderType(${dataField>@@UI.getDataModelObjectPath})}"\n\t\t\t\t\t\t\t\t><Label\n\t\t\t\t\t\t\t\t\t\tunittest:id="ObjectPageHeaderLabelTest"\n\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([ ${formElement>idPrefix}, \'Label\'])}"\n\t\t\t\t\t\t\t\t\t\ttext="{= ${dataField>@@FIELD.computeLabelText} + \':\' }"\n\t\t\t\t\t\t\t\t\t\tvisible="{= !!${dataField>@@FIELD.computeLabelText} }"\n\t\t\t\t\t\t\t\t\t\tclass="sapUiTinyMarginEnd"\n\t\t\t\t\t\t\t\t\t\tvAlign="{= ${formElement>isValueMultilineText} === true ? \'Middle\' : \'Inherit\' }"\n\t\t\t\t\t\t\t\t\t\twrapping="true"\n\t\t\t\t\t\t\t\t\t/><internalMacro:Field\n\t\t\t\t\t\t\t\t\t\tidPrefix="{formElement>idPrefix}"\n\t\t\t\t\t\t\t\t\t\teditMode="Display"\n\t\t\t\t\t\t\t\t\t\tentitySet="{entitySet>}"\n\t\t\t\t\t\t\t\t\t\tdataField="{dataField>}"\n\t\t\t\t\t\t\t\t\t\tariaLabelledBy="{= ID.generate([ ${formElement>idPrefix}, \'Label\'])}"\n\t\t\t\t\t\t\t\t\t><internalMacro:formatOptions textAlignMode="Form" showEmptyIndicator="true" fieldMode="nowrapper" /></internalMacro:Field></HBox></template:with></template:then><template:elseif test="{= ${formElement>type} === \'Default\'}"><l:HorizontalLayout class="sapUiTinyMarginBottom"><template:if test="{formElement>label}"><Label text="{formElement>label}:" class="sapUiTinyMarginEnd" /></template:if><fpm:CustomFragment\n\t\t\t\t\t\t\t\t\tid="{formElement>key}"\n\t\t\t\t\t\t\t\t\tfragmentName="{formElement>template}"\n\t\t\t\t\t\t\t\t\tcontextPath="{entitySet>}"\n\t\t\t\t\t\t\t\t/></l:HorizontalLayout></template:elseif><template:else><VBox width="150px" class="sapUiSmallMargin"><Text text="Unsupported Facet Type: {formElement>type}" visible="true" wrapping="true" /></VBox></template:else></template:if></template:repeat></template:else></template:if></VBox></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/RelatedApps.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"\n\txmlns:core="sap.ui.core"\n><MenuButton\n\t\tid="fe::RelatedApps"\n\t\ttext="{sap.fe.i18n>T_OP_RELATED_APPS}"\n\t\tbinding="{internal>relatedApps}"\n\t\tvisible="{internal>visibility}"\n\t><menu><Menu items="{path: \'internal>items\', sorter: { path: \'text\' }}"><items><MenuItem\n\t\t\t\t\t\ttext="{internal>text}"\n\t\t\t\t\t\tcustomData:targetSemObject="{internal>targetSemObject}"\n\t\t\t\t\t\tcustomData:targetAction="{internal>targetAction}"\n\t\t\t\t\t\tpress="._intentBasedNavigation.navigate(${internal>targetSemObject}, ${internal>targetAction}, ${internal>targetParams})"\n\t\t\t\t\t/></items></Menu></menu></MenuButton></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/Section.fragment.xml":'<core:FragmentDefinition\n\txmlns:uxap="sap.uxap"\n\txmlns:core="sap.ui.core"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:macro="sap.fe.macros"\n\txmlns:dt="sap.ui.dt"\n\txmlns="sap.m"\n\txmlns:opcontrol="sap.fe.templates.ObjectPage.controls"\n\txmlns:control="sap.fe.core.controls"\n\txmlns:internalMacro="sap.fe.macros.internal"\n\ttemplate:require="{\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\'\n\t}"\n><template:with path="converterContext>header/section" var="headerSection"><template:if test="{viewData>/editableHeaderContent}"><uxap:ObjectPageSection\n\t\t\t\tdt:designtime="not-adaptable-visibility"\n\t\t\t\tid="{headerSection>id}"\n\t\t\t\ttitle="{headerSection>title}"\n\t\t\t\ttitleLevel="H3"\n\t\t\t\tvisible="{headerSection>visible}"\n\t\t\t\ttitleUppercase="false"\n\t\t\t><uxap:subSections><uxap:ObjectPageSubSection id="fe::EditableHeaderSubSection" title="{headerSection>title}" titleLevel="H4"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.EditableHeaderFacet" type="XML" /></uxap:ObjectPageSubSection></uxap:subSections></uxap:ObjectPageSection></template:if></template:with><template:with path="converterContext>sections" var="sections"><template:repeat list="{sections>}" var="section"><uxap:ObjectPageSection\n\t\t\t\tdt:designtime="not-adaptable-visibility"\n\t\t\t\tid="{section>id}"\n\t\t\t\ttitle="{section>title}"\n\t\t\t\ttitleLevel="H3"\n\t\t\t\tshowTitle="{section>showTitle}"\n\t\t\t\ttitleUppercase="false"\n\t\t\t\tvisible="{section>visible}"\n\t\t\t><uxap:subSections><template:repeat list="{section>subSections}" var="subSection"><uxap:ObjectPageSubSection\n\t\t\t\t\t\t\tdt:designtime="not-adaptable-visibility"\n\t\t\t\t\t\t\tid="{subSection>id}"\n\t\t\t\t\t\t\ttitle="{subSection>title}"\n\t\t\t\t\t\t\ttitleLevel="H4"\n\t\t\t\t\t\t\tshowTitle="{subSection>showTitle}"\n\t\t\t\t\t\t\tvisible="{subSection>visible}"\n\t\t\t\t\t\t><uxap:dependents><template:repeat list="{subSection>commandActions}" var="action"><internalMacro:ActionCommand\n\t\t\t\t\t\t\t\t\t\taction="{action>}"\n\t\t\t\t\t\t\t\t\t\tonExecuteAction="{action>press}"\n\t\t\t\t\t\t\t\t\t\tonExecuteIBN="{action>press}"\n\t\t\t\t\t\t\t\t\t\tonExecuteManifest="{= COMMON.buildActionWrapper(${action>})}"\n\t\t\t\t\t\t\t\t\t/></template:repeat></uxap:dependents><uxap:customData><core:CustomData key="isVisibilityDynamic" value="{subSection>isVisibilityDynamic}" /></uxap:customData><template:if test="{= ${subSection>type} === \'Mixed\'}"><template:then><template:if test="{viewData>/useNewLazyLoading}"><template:then><template:repeat list="{subSection>content}" var="subSection"><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionContentLazyLoader"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t/></template:repeat></template:then><template:else><template:repeat list="{subSection>content}" var="subSection"><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionContent"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t/></template:repeat></template:else></template:if></template:then><template:else><template:if test="{viewData>/useNewLazyLoading}"><template:then><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionContentLazyLoader"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionContent"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></template:else></template:if></template:else></template:if></uxap:ObjectPageSubSection></template:repeat></uxap:subSections></uxap:ObjectPageSection></template:repeat></template:with></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/SectionContent.fragment.xml":'<core:FragmentDefinition\n\txmlns:uxap="sap.uxap"\n\txmlns:core="sap.ui.core"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:macro="sap.fe.macros"\n\txmlns:layout="sap.ui.layout"\n\txmlns:dt="sap.ui.dt"\n\txmlns="sap.m"\n\txmlns:opcontrol="sap.fe.templates.ObjectPage.controls"\n\ttemplate:require="{\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\'\n\t}"\n><template:if test="{subSection>visible}"><template:if test="{= ${subSection>type} === \'XMLFragment\'}"><template:then><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.FormActions" type="XML" /><uxap:blocks><opcontrol:SubSectionBlock><opcontrol:content><template:if test="{= ${subSection>sideContent} !== undefined}"><template:then><layout:DynamicSideContent\n\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${subSection>key}, \'SideContentLayout\'])}"\n\t\t\t\t\t\t\t\t\t\tshowMainContent="true"\n\t\t\t\t\t\t\t\t\t\tshowSideContent="{subSection>sideContent/visible}"\n\t\t\t\t\t\t\t\t\t\tsideContentFallDown="BelowM"\n\t\t\t\t\t\t\t\t\t\tcontainerQuery="true"\n\t\t\t\t\t\t\t\t\t\tequalSplit="{subSection>sideContent/equalSplit}"\n\t\t\t\t\t\t\t\t\t><layout:mainContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionCustomSection"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></layout:mainContent><layout:sideContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SideContentCustomContainer"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></layout:sideContent></layout:DynamicSideContent></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionCustomSection"\n\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t/></template:else></template:if></opcontrol:content></opcontrol:SubSectionBlock></uxap:blocks></template:then><template:elseif test="{= ${subSection>type} === \'Form\'}"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.FormActions" type="XML" /><uxap:blocks><opcontrol:SubSectionBlock><opcontrol:content><template:if test="{= ${subSection>sideContent} !== undefined}"><template:then><layout:DynamicSideContent\n\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${subSection>key}, \'SideContentLayout\'])}"\n\t\t\t\t\t\t\t\t\t\tshowMainContent="true"\n\t\t\t\t\t\t\t\t\t\tshowSideContent="{subSection>sideContent/visible}"\n\t\t\t\t\t\t\t\t\t\tsideContentFallDown="BelowM"\n\t\t\t\t\t\t\t\t\t\tcontainerQuery="true"\n\t\t\t\t\t\t\t\t\t\tequalSplit="{subSection>sideContent/equalSplit}"\n\t\t\t\t\t\t\t\t\t><layout:mainContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionFormContent"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></layout:mainContent><layout:sideContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SideContentCustomContainer"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></layout:sideContent></layout:DynamicSideContent></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionFormContent"\n\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t/></template:else></template:if></opcontrol:content></opcontrol:SubSectionBlock></uxap:blocks><template:if test="{subSection>formDefinition/hasFacetsNotPartOfPreview}"><template:then><uxap:moreBlocks><template:if test="{= ${subSection>level} === 2}"><Title level="{= ${section>subSections}.length > 1 ? \'H5\' : \'H4\'}" text="{subSection>title}" /></template:if><opcontrol:SubSectionBlock><opcontrol:content><template:if test="{= ${subSection>sideContent} !== undefined}"><template:then><layout:DynamicSideContent\n\t\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${subSection>key}, \'MoreSideContentLayout\'])}"\n\t\t\t\t\t\t\t\t\t\t\t\tshowMainContent="true"\n\t\t\t\t\t\t\t\t\t\t\t\tshowSideContent="{subSection>sideContent/visible}"\n\t\t\t\t\t\t\t\t\t\t\t\tsideContentFallDown="BelowM"\n\t\t\t\t\t\t\t\t\t\t\t\tcontainerQuery="true"\n\t\t\t\t\t\t\t\t\t\t\t\tequalSplit="{subSection>sideContent/equalSplit}"\n\t\t\t\t\t\t\t\t\t\t\t><layout:mainContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionMoreFormContent"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t\t/></layout:mainContent><layout:sideContent></layout:sideContent></layout:DynamicSideContent></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionMoreFormContent"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></template:else></template:if></opcontrol:content></opcontrol:SubSectionBlock></uxap:moreBlocks></template:then></template:if></template:elseif><template:elseif test="{= ${subSection>type} === \'DataVisualization\'}"><uxap:blocks><template:if test="{= ${subSection>level} === 2}"><Title\n\t\t\t\t\t\t\tlevel="{= ${section>subSections}.length > 1 ? \'H5\' : \'H4\'}"\n\t\t\t\t\t\t\ttext="{subSection>title}"\n\t\t\t\t\t\t\tvisible="{subSection>titleVisible}"\n\t\t\t\t\t\t/></template:if><opcontrol:SubSectionBlock visible="{subSection>visible}"><opcontrol:content><template:if test="{= ${subSection>sideContent} !== undefined}"><template:then><layout:DynamicSideContent\n\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${subSection>key}, \'SideContentLayout\'])}"\n\t\t\t\t\t\t\t\t\t\tshowMainContent="true"\n\t\t\t\t\t\t\t\t\t\tshowSideContent="{subSection>sideContent/visible}"\n\t\t\t\t\t\t\t\t\t\tsideContentFallDown="BelowM"\n\t\t\t\t\t\t\t\t\t\tcontainerQuery="true"\n\t\t\t\t\t\t\t\t\t\tequalSplit="{subSection>sideContent/equalSplit}"\n\t\t\t\t\t\t\t\t\t><layout:mainContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionPresentationVisualization"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></layout:mainContent><layout:sideContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SideContentCustomContainer"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></layout:sideContent></layout:DynamicSideContent></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionPresentationVisualization"\n\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t/></template:else></template:if></opcontrol:content></opcontrol:SubSectionBlock></uxap:blocks></template:elseif><template:elseif test="{= ${subSection>type} === \'Unknown\'}"><Text text="{subSection>text}" /></template:elseif><template:else /></template:if></template:if></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/SectionContentLazyLoader.fragment.xml":'<core:FragmentDefinition\n\txmlns:uxap="sap.uxap"\n\txmlns:core="sap.ui.core"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\txmlns:macro="sap.fe.macros"\n\txmlns:layout="sap.ui.layout"\n\txmlns:dt="sap.ui.dt"\n\txmlns="sap.m"\n\txmlns:opcontrol="sap.fe.templates.ObjectPage.controls"\n\ttemplate:require="{\n\t\tMODEL: \'sap/ui/model/odata/v4/AnnotationHelper\',\n\t\tOP: \'sap/fe/templates/ObjectPage/ObjectPageTemplating\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\',\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\'\n\t}"\n><template:if test="{subSection>visible}"><template:if test="{= ${subSection>type} === \'XMLFragment\'}"><template:then><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.FormActions" type="XML" /><uxap:blocks><uxap:ObjectPageLazyLoader stashed="true" id="{= ID.generate([\'fe\', ${subSection>key}])}"><opcontrol:SubSectionBlock><opcontrol:content><template:if test="{= ${subSection>sideContent} !== undefined}"><template:then><layout:DynamicSideContent\n\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${subSection>key}, \'SideContentLayout\'])}"\n\t\t\t\t\t\t\t\t\t\t\tshowMainContent="true"\n\t\t\t\t\t\t\t\t\t\t\tshowSideContent="{subSection>sideContent/visible}"\n\t\t\t\t\t\t\t\t\t\t\tsideContentFallDown="BelowM"\n\t\t\t\t\t\t\t\t\t\t\tcontainerQuery="true"\n\t\t\t\t\t\t\t\t\t\t\tequalSplit="{subSection>sideContent/equalSplit}"\n\t\t\t\t\t\t\t\t\t\t><layout:mainContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionCustomSection"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t/></layout:mainContent><layout:sideContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SideContentCustomContainer"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t/></layout:sideContent></layout:DynamicSideContent></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionCustomSection"\n\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t/></template:else></template:if></opcontrol:content></opcontrol:SubSectionBlock></uxap:ObjectPageLazyLoader></uxap:blocks></template:then><template:elseif test="{= ${subSection>type} === \'Form\'}"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.FormActions" type="XML" /><uxap:blocks><uxap:ObjectPageLazyLoader stashed="true" id="{= ID.generate([\'fe\', ${subSection>key}])}"><opcontrol:SubSectionBlock><opcontrol:content><template:if test="{= ${subSection>sideContent} !== undefined}"><template:then><layout:DynamicSideContent\n\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${subSection>key}, \'SideContentLayout\'])}"\n\t\t\t\t\t\t\t\t\t\t\tshowMainContent="true"\n\t\t\t\t\t\t\t\t\t\t\tshowSideContent="{subSection>sideContent/visible}"\n\t\t\t\t\t\t\t\t\t\t\tsideContentFallDown="BelowM"\n\t\t\t\t\t\t\t\t\t\t\tcontainerQuery="true"\n\t\t\t\t\t\t\t\t\t\t\tequalSplit="{subSection>sideContent/equalSplit}"\n\t\t\t\t\t\t\t\t\t\t><layout:mainContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionFormContent"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t/></layout:mainContent><layout:sideContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SideContentCustomContainer"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t/></layout:sideContent></layout:DynamicSideContent></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionFormContent"\n\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t/></template:else></template:if></opcontrol:content></opcontrol:SubSectionBlock></uxap:ObjectPageLazyLoader></uxap:blocks><template:if test="{subSection>formDefinition/hasFacetsNotPartOfPreview}"><template:then><uxap:moreBlocks><template:if test="{= ${subSection>level} === 2}"><Title text="{subSection>title}" /></template:if><opcontrol:SubSectionBlock><opcontrol:content><template:if test="{= ${subSection>sideContent} !== undefined}"><template:then><layout:DynamicSideContent\n\t\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${subSection>key}, \'MoreSideContentLayout\'])}"\n\t\t\t\t\t\t\t\t\t\t\t\tshowMainContent="true"\n\t\t\t\t\t\t\t\t\t\t\t\tshowSideContent="{subSection>sideContent/visible}"\n\t\t\t\t\t\t\t\t\t\t\t\tsideContentFallDown="BelowM"\n\t\t\t\t\t\t\t\t\t\t\t\tcontainerQuery="true"\n\t\t\t\t\t\t\t\t\t\t\t\tequalSplit="{subSection>sideContent/equalSplit}"\n\t\t\t\t\t\t\t\t\t\t\t><layout:mainContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionMoreFormContent"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t\t/></layout:mainContent><layout:sideContent></layout:sideContent></layout:DynamicSideContent></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionMoreFormContent"\n\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t/></template:else></template:if></opcontrol:content></opcontrol:SubSectionBlock></uxap:moreBlocks></template:then></template:if></template:elseif><template:elseif test="{= ${subSection>type} === \'DataVisualization\'}"><uxap:blocks><uxap:ObjectPageLazyLoader stashed="true" id="{= ID.generate([\'fe\', ${subSection>key}])}"><template:if test="{= ${subSection>level} === 2}"><Title\n\t\t\t\t\t\t\t\ttext="{subSection>title}"\n\t\t\t\t\t\t\t\tvisible="{= ${subSection>visible} &amp;&amp; ${subSection>title} !==\'undefined\' &amp;&amp; ${subSection>showTitle} ? true : false}"\n\t\t\t\t\t\t\t/></template:if><opcontrol:SubSectionBlock visible="{subSection>visible}"><opcontrol:content><template:if test="{= ${subSection>sideContent} !== undefined}"><template:then><layout:DynamicSideContent\n\t\t\t\t\t\t\t\t\t\t\tid="{= ID.generate([\'fe\', ${subSection>key}, \'SideContentLayout\'])}"\n\t\t\t\t\t\t\t\t\t\t\tshowMainContent="true"\n\t\t\t\t\t\t\t\t\t\t\tshowSideContent="{subSection>sideContent/visible}"\n\t\t\t\t\t\t\t\t\t\t\tsideContentFallDown="BelowM"\n\t\t\t\t\t\t\t\t\t\t\tcontainerQuery="true"\n\t\t\t\t\t\t\t\t\t\t\tequalSplit="{subSection>sideContent/equalSplit}"\n\t\t\t\t\t\t\t\t\t\t><layout:mainContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionPresentationVisualization"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t/></layout:mainContent><layout:sideContent><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SideContentCustomContainer"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t\t\t/></layout:sideContent></layout:DynamicSideContent></template:then><template:else><core:Fragment\n\t\t\t\t\t\t\t\t\t\t\tfragmentName="sap.fe.templates.ObjectPage.view.fragments.SectionPresentationVisualization"\n\t\t\t\t\t\t\t\t\t\t\ttype="XML"\n\t\t\t\t\t\t\t\t\t\t/></template:else></template:if></opcontrol:content></opcontrol:SubSectionBlock></uxap:ObjectPageLazyLoader></uxap:blocks></template:elseif><template:elseif test="{= ${subSection>type} === \'Unknown\'}"><Text text="{subSection>text}" /></template:elseif><template:else /></template:if></template:if></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/SectionCustomSection.fragment.xml":'<core:FragmentDefinition\n\txmlns:core="sap.ui.core"\n\txmlns="sap.m"\n\txmlns:fpm="sap.fe.macros.fpm"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\'\n\t}"\n><fpm:CustomFragment id="{subSection>id}" contextPath="{entitySet>}" fragmentName="{subSection>template}" /></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/SectionFormContent.fragment.xml":'<core:FragmentDefinition\n\txmlns:core="sap.ui.core"\n\txmlns:macro="sap.fe.macros.internal"\n\txmlns="sap.m"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\'\n\t}"\n><macro:Form\n\t\tid="{= ID.generate([${subSection>formDefinition/id}, \'Content\']) }"\n\t\tmetaPath="{subSection>annotationPath}"\n\t\tcontextPath="{entitySet>}"\n\t\tuseFormContainerLabels="{= ${subSection>formDefinition/useFormContainerLabels}}"\n\t\tpartOfPreview="true"\n\t\tformContainers="{subSection>formDefinition/formContainers}"\n\t\tisVisible="{subSection>formDefinition/isVisible}"\n\t\ttitleLevel="{= ${section>subSections}.length > 1 ? \'H5\' : \'H4\'}"\n\t/></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/SectionMoreFormContent.fragment.xml":'<core:FragmentDefinition\n\txmlns:core="sap.ui.core"\n\txmlns="sap.m"\n\txmlns:macro="sap.fe.macros.internal"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\'\n\t}"\n><macro:Form\n\t\tid="{= ID.generate([${subSection>formDefinition/id}, \'MoreContent\']) }"\n\t\tmetaPath="{subSection>annotationPath}"\n\t\tcontextPath="{entitySet>}"\n\t\tuseFormContainerLabels="{= ${subSection>formDefinition/useFormContainerLabels}}"\n\t\tpartOfPreview="false"\n\t\tformContainers="{subSection>formDefinition/formContainers}"\n\t\tisVisible="{subSection>formDefinition/isVisible}"\n\t\ttitleLevel="{= ${section>subSections}.length > 1 ? (${subSection>level} === 2 ? \'H6\': \'H5\') : (${subSection>level} === 2 ? \'H5\': \'H4\')}"\n\t/></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/SectionPresentationVisualization.fragment.xml":'<core:FragmentDefinition\n\txmlns:core="sap.ui.core"\n\txmlns="sap.m"\n\txmlns:macro="sap.fe.macros"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\'\n\t}"\n><template:with path="subSection>presentation" var="presentationContext"><template:with path="subSection>presentation" var="primaryVisualization"><template:repeat list="{presentationContext>visualizations}" var="visualizationDefinition"><core:Fragment fragmentName="sap.fe.templates.ObjectPage.view.fragments.{visualizationDefinition>type}" type="XML" /></template:repeat></template:with></template:with></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/SideContentCustomContainer.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:fpm="sap.fe.macros.fpm"\n\txmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"\n\ttemplate:require="{\n\t\tID: \'sap/fe/core/helpers/StableIdHelper\',\n\t\tCOMMON: \'sap/fe/macros/CommonHelper\'\n\t}"\n><template:with path="subSection>sideContent" var="sideContent"><template:if test="{= ${subSection>sideContent} !== undefined }"><HBox class="sapUiSmallMarginBegin"><fpm:CustomFragment id="{sideContent>id}" fragmentName="{sideContent>template}" /></HBox></template:if></template:with></core:FragmentDefinition>\n',
	"sap/fe/templates/ObjectPage/view/fragments/Table.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:macro="sap.fe.macros.internal"\n\txmlns:core="sap.ui.core"\n\txmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"\n><macro:Table\n\t\tunittest:id="TablePropertyExpressionTest"\n\t\tmetaPath="{presentationContext>annotationPath}"\n\t\ttableDefinition="{visualizationDefinition>}"\n\t\tcontextPath="{fullContextPath>}"\n\t\tfilterBarId="{= ${converterContext>filterBarId} ? ${converterContext>filterBarId} : undefined}"\n\t\tbusy=\'{= "{ui>/busyLocal/"+${visualizationDefinition>annotation/id}+"}" }\'\n\t\tonContextChange=".handlers.onTableContextChange"\n\t\tvariantSelected=".handlers.onVariantSelected"\n\t\tvariantSaved=".handlers.onVariantSaved"\n\t\tisAlp="{converterContext>hasMultiVisualizations}"\n\t\tonSegmentedButtonPressed="{= ${converterContext>hasMultiVisualizations} ? \'.handlers.onSegmentedButtonPressed\' : undefined }"\n\t\tvisible="{= ${converterContext>hasMultiVisualizations} ? \'{= ${pageInternal>alpContentView} !== \\\'Chart\\\'}\' : \'true\' }"\n\t\ttabTitle="{view>title}"\n\t\theaderLevel=\'{= ${section>subSections}.length > 1 ? (${subSection>level} === 2 &amp;&amp; ${subSection>titleVisible} ? "H6": "H5") : (${subSection>level} === 2 &amp;&amp; ${subSection>titleVisible} ? "H5": "H4")}\'\n\t\tstateChange=".handlers.onStateChange"\n\t/></core:FragmentDefinition>\n',
	"sap/fe/templates/manifest.json":'{"_version":"1.21.0","sap.app":{"id":"sap.fe.templates","type":"library","embeds":["AnalyticalListPage","ListReport","ObjectPage"],"applicationVersion":{"version":"1.111.1"},"title":"UI5 library: sap.fe.templates","description":"UI5 library: sap.fe.templates","ach":"CA-UI5-FE","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":[]},"sap.ui5":{"dependencies":{"libs":{"sap.f":{},"sap.fe.core":{},"sap.m":{},"sap.fe.macros":{},"sap.suite.ui.microchart":{"lazy":true},"sap.ui.core":{},"sap.ui.layout":{"lazy":true},"sap.ui.mdc":{},"sap.uxap":{"lazy":true},"sap.ui.fl":{},"sap.collaboration":{}}},"library":{"i18n":{"bundleUrl":"messagebundle.properties","supportedLocales":["","ar","bg","ca","cs","cy","da","de","el","en","en-GB","en-US-sappsd","en-US-saprigi","en-US-saptrc","es","es-MX","et","fi","fr","fr-CA","hi","hr","hu","id","it","iw","ja","kk","ko","lt","lv","ms","nl","no","pl","pt","pt-PT","ro","ru","sh","sk","sl","sv","th","tr","uk","vi","zh-CN","zh-TW"]},"content":{"controls":[],"elements":[],"types":[],"interfaces":[]}}}}'
});
//# sourceMappingURL=library-preload.js.map
