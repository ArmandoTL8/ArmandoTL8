//@ui5-bundle sap/fe/core/designtime/library-preload.designtime.js
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/core/designtime/AppComponent-dbg.designtime", [], function () {
  "use strict";

  var _sap$ushell, _urlParams$fioriTool, _urlParams$fioriTool$;
  const urlParserMock = {
    parseParameters: function () {
      return {};
    }
  };
  const urlParser = (_sap$ushell = sap.ushell) !== null && _sap$ushell !== void 0 && _sap$ushell.Container ? sap.ushell.Container.getService("URLParsing") : urlParserMock;
  const urlParams = urlParser.parseParameters(window.location.search);
  const fioriToolsRtaMode = ((_urlParams$fioriTool = urlParams["fiori-tools-rta-mode"]) === null || _urlParams$fioriTool === void 0 ? void 0 : (_urlParams$fioriTool$ = _urlParams$fioriTool[0]) === null || _urlParams$fioriTool$ === void 0 ? void 0 : _urlParams$fioriTool$.toLowerCase()) === "true";
  const isOnDynamicPage = function (element) {
    if (element.getMetadata().getName() === "sap.f.DynamicPage") {
      return true;
    } else {
      const parent = element.getParent();
      return parent ? isOnDynamicPage(parent) : false;
    }
  };
  const getAllowList = function (element) {
    let allowList = {};
    const elementName = element.getMetadata().getName();
    if (fioriToolsRtaMode) {
      // build the allow list for Fiori tools (developers)
      if (isOnDynamicPage(element)) {
        allowList = {
          "sap.ui.fl.variants.VariantManagement": true,
          "sap.fe.core.controls.FilterBar": true,
          "sap.ui.mdc.Table": true
        };
      }
    } else {
      var _element$getParent, _element$getParent2;
      // build the allow list for UI Adaptation (key users)
      allowList = {
        "sap.fe.templates.ObjectPage.controls.StashableVBox": true,
        "sap.fe.templates.ObjectPage.controls.StashableHBox": true,
        "sap.uxap.ObjectPageLayout": true,
        "sap.uxap.AnchorBar": true,
        "sap.uxap.ObjectPageSection": true,
        "sap.uxap.ObjectPageSubSection": true,
        "sap.ui.fl.util.IFrame": true,
        "sap.ui.layout.form.Form": true,
        "sap.ui.layout.form.FormContainer": true,
        "sap.ui.layout.form.FormElement": true,
        "sap.ui.fl.variants.VariantManagement": true,
        "sap.fe.core.controls.FilterBar": true,
        "sap.ui.mdc.Table": true,
        "sap.m.IconTabBar": true
      };
      // currently we support the adaptation of MenuButtons only for the AnchorBar on Object Page (adaptation of sections and subsections)
      if (elementName === "sap.m.MenuButton" && ((_element$getParent = element.getParent()) === null || _element$getParent === void 0 ? void 0 : _element$getParent.getMetadata().getName()) === "sap.uxap.AnchorBar") {
        allowList["sap.m.MenuButton"] = true;
      }
      // currently we support the adaptation of Buttons only for the AnchorBar on Object Page (adaptation of sections and subsections)
      if (elementName === "sap.m.Button" && ((_element$getParent2 = element.getParent()) === null || _element$getParent2 === void 0 ? void 0 : _element$getParent2.getMetadata().getName()) === "sap.uxap.AnchorBar") {
        allowList["sap.m.Button"] = true;
      }
      // the adaptation of FlexBoxes is only supported for the HeaderContainer on Object Page
      if (elementName === "sap.m.FlexBox" && element.getId().indexOf("--fe::HeaderContentContainer") >= 0) {
        allowList["sap.m.FlexBox"] = true;
      }
    }
    return allowList;
  };

  // To enable all actions, remove the propagateMetadata function. Or, remove this file and its entry in AppComponent.js referring 'designTime'.
  const AppComponentDesignTime = {
    actions: "not-adaptable",
    aggregations: {
      rootControl: {
        actions: "not-adaptable",
        propagateMetadata: function (element) {
          const allowList = getAllowList(element);
          if (allowList[element.getMetadata().getName()]) {
            // by returning the empty object, the same will be merged with element's native designtime definition, i.e. all actions will be enabled for this element
            return {};
          } else {
            // not-adaptable will be interpreted by flex to disable all actions for this element
            return {
              actions: "not-adaptable"
            };
          }
        }
      }
    },
    tool: {
      start: function (appComponent) {
        appComponent.getEnvironmentCapabilities().setCapability("AppState", false);
      },
      stop: function (appComponent) {
        appComponent.getEnvironmentCapabilities().setCapability("AppState", true);
      }
    }
  };
  return AppComponentDesignTime;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/core/designtime/AppComponent.designtime", [],function(){"use strict";var t,e,a;const r={parseParameters:function(){return{}}};const n=(t=sap.ushell)!==null&&t!==void 0&&t.Container?sap.ushell.Container.getService("URLParsing"):r;const o=n.parseParameters(window.location.search);const s=((e=o["fiori-tools-rta-mode"])===null||e===void 0?void 0:(a=e[0])===null||a===void 0?void 0:a.toLowerCase())==="true";const u=function(t){if(t.getMetadata().getName()==="sap.f.DynamicPage"){return true}else{const e=t.getParent();return e?u(e):false}};const i=function(t){let e={};const a=t.getMetadata().getName();if(s){if(u(t)){e={"sap.ui.fl.variants.VariantManagement":true,"sap.fe.core.controls.FilterBar":true,"sap.ui.mdc.Table":true}}}else{var r,n;e={"sap.fe.templates.ObjectPage.controls.StashableVBox":true,"sap.fe.templates.ObjectPage.controls.StashableHBox":true,"sap.uxap.ObjectPageLayout":true,"sap.uxap.AnchorBar":true,"sap.uxap.ObjectPageSection":true,"sap.uxap.ObjectPageSubSection":true,"sap.ui.fl.util.IFrame":true,"sap.ui.layout.form.Form":true,"sap.ui.layout.form.FormContainer":true,"sap.ui.layout.form.FormElement":true,"sap.ui.fl.variants.VariantManagement":true,"sap.fe.core.controls.FilterBar":true,"sap.ui.mdc.Table":true,"sap.m.IconTabBar":true};if(a==="sap.m.MenuButton"&&((r=t.getParent())===null||r===void 0?void 0:r.getMetadata().getName())==="sap.uxap.AnchorBar"){e["sap.m.MenuButton"]=true}if(a==="sap.m.Button"&&((n=t.getParent())===null||n===void 0?void 0:n.getMetadata().getName())==="sap.uxap.AnchorBar"){e["sap.m.Button"]=true}if(a==="sap.m.FlexBox"&&t.getId().indexOf("--fe::HeaderContentContainer")>=0){e["sap.m.FlexBox"]=true}}return e};const l={actions:"not-adaptable",aggregations:{rootControl:{actions:"not-adaptable",propagateMetadata:function(t){const e=i(t);if(e[t.getMetadata().getName()]){return{}}else{return{actions:"not-adaptable"}}}}},tool:{start:function(t){t.getEnvironmentCapabilities().setCapability("AppState",false)},stop:function(t){t.getEnvironmentCapabilities().setCapability("AppState",true)}}};return l},false);
//# sourceMappingURL=library-preload.designtime.js.map
