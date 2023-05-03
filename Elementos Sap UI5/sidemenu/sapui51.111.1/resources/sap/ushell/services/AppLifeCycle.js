// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/ui/base/EventProvider","sap/ui/core/Core","sap/ui/thirdparty/hasher","sap/ushell/AppInfoParameters","sap/ushell/EventHub","sap/ushell/TechnicalParameters","sap/ui/core/Component","sap/ushell/services/AppConfiguration"],function(e,t,n,a,r,i,o,p,s){"use strict";var c="appLoaded";function u(u,l,f,d){var h,g,m;this.getCurrentApplication=function(){return h};this.attachAppLoaded=function(e,t,n){m.attachEvent(c,e,t,n)};this.detachAppLoaded=function(e,t){m.detachEvent(c,e,t)};this.prepareCurrentAppObject=function(e,t,n,a){I(e,t,n,a)};this.reloadCurrentApp=function(){i.emit("reloadCurrentApp",{sAppContainerId:g.getId(),sCurrentHash:a.getHash(),date:Date.now()})};m=new t;if(sap.ushell.Container.inAppRuntime()===false){if(sap.ushell.Container.getRenderer()){C()}else{var v=function(){C();sap.ushell.Container.detachRendererCreatedEvent(v)};sap.ushell.Container.attachRendererCreatedEvent(v)}}function C(){var t=n.byId("viewPortContainer");if(!t||typeof t.attachAfterNavigate!=="function"){e.error("Error during instantiation of AppLifeCycle service","Could not attach to afterNavigate event","sap.ushell.services.AppLifeCycle");return}t.attachAfterNavigate(function(e){var t;var n;var a;var r;var i;var o=false;if(e.mParameters.toId.indexOf("applicationShellPage")===0){n=e.mParameters.to.getApp()}else if(e.mParameters.toId.indexOf("application")===0){n=e.mParameters.to}if(n&&typeof n.getComponentHandle==="function"&&n.getComponentHandle()){r=n.getComponentHandle().getInstance()}else if(n){t=n.getAggregation("child");if(t){r=t.getComponentInstance()}}else{r=p.get(e.mParameters.to.getComponent())}if(r){i=r.getId();o=i.indexOf("Shell-home-component")!==-1||i.indexOf("pages-component")!==-1||i.indexOf("workPageRuntime-component")!==-1||i.indexOf("Shell-appfinder-component")!==-1||i.indexOf("homeApp-component")!==-1||i.indexOf("runtimeSwitcher-component")!==-1}a=n&&typeof n.getApplicationType==="function"&&n.getApplicationType();if((!a||a==="URL")&&r){a="UI5"}I(a,r,o,n)})}function A(){var e=a.getHash();if(!e){return Promise.reject("Could not identify current application hash")}var t=sap.ushell.Container.getServiceAsync("URLParsing");return t.then(function(t){return t.parseShellHash(e)})}function I(e,t,n,a){g=a;h={applicationType:e,componentInstance:t,homePage:n,getTechnicalParameter:function(n){return o.getParameterValue(n,t,a,e)},getIntent:A,getInfo:function(e){return r.getInfo(e,h)},getSystemContext:function(){var e=s.getCurrentApplication()||{};var t=e.contentProviderId||"";return sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(e){return e.getSystemContext(t)})},disableKeepAliveAppRouterRetrigger:function(e){A().then(function(t){i.emit("disableKeepAliveRestoreRouterRetrigger",{disable:e,intent:t,componentId:h.componentInstance.oContainer.sId,date:Date.now()})})}};setTimeout(function(){m.fireEvent(c,h)},0)}}u.hasNoAdapter=true;return u},true);
//# sourceMappingURL=AppLifeCycle.js.map