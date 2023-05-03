// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
prepareModules();sap.ui.define(["sap/base/Log","sap/base/util/deepExtend","sap/base/util/isEmptyObject","sap/m/library","sap/ui/core/BusyIndicator","sap/ui/core/ComponentContainer","sap/ui/core/Popup","sap/ui/core/routing/History","sap/ui/thirdparty/hasher","sap/ui/thirdparty/jquery","sap/ui/thirdparty/URI","sap/ushell/appRuntime/ui5/AppCommunicationMgr","sap/ushell/appRuntime/ui5/AppRuntimePostMessageAPI","sap/ushell/appRuntime/ui5/AppRuntimeService","sap/ushell/appRuntime/ui5/performance/FesrEnhancer","sap/ushell/appRuntime/ui5/renderers/fiori2/AccessKeysAgent","sap/ushell/appRuntime/ui5/services/AppConfiguration","sap/ushell/appRuntime/ui5/services/AppLifeCycleAgent","sap/ushell/appRuntime/ui5/services/ShellUIService","sap/ushell/appRuntime/ui5/SessionHandlerAgent","sap/ushell/EventHub","sap/ushell/iconfonts","sap/ushell/UI5ComponentType","sap/ushell/ui5service/UserStatus","sap/ushell/utils/UrlParsing","sap/ushell/utils/WindowUtils","sap/ushell/appRuntime/ui5/AppRuntimeContext"],function(e,t,n,i,a,s,r,u,p,jQuery,l,o,c,h,d,f,g,m,v,y,C,A,R,S,b,w,P){"use strict";var I=i.URLHelper;d.init();var U,H=(new l).search(true),D,L=false,F,M=false,O=false,E=false,T=false,k=false,B;function N(){this.main=function(){jQuery("body").css("height","100%").css("width","100%");o.init(true);h.sendMessageToOuterShell("sap.ushell.appRuntime.iframeIsBusy",{bValue:true});P.setAppLifeCycleAgent(m);this.getPageConfig();m.expandSapIntentParams(U._getURI()).then(function(t){var n,i;if(t.hasOwnProperty("sap-remote-intent")===true){P.setIsScube(true);i=t["sap-remote-intent"];if(i===undefined){e.error("Application cannot be opened. 'sAppIntent' is undefined")}P.setRemoteSystemId(t["sap-remote-system"]);U.adjustIframeURL()}else{n=t["sap-ui-app-id"]}U.setModulePaths();U.init();var a=new Promise(function(e){sap.ui.require(["sap/ushell/appRuntime/ui5/services/UserInfo"],e)});var s,r;if(P.getIsScube()===true){s=U.initServicesContainer();r=Promise.resolve()}else{s=Promise.resolve();r=U.initServicesContainer()}s.then(function(){if(P.getIsScube()===true){sap.ushell.Container.getServiceAsync("CommonDataModel")}Promise.all([r,U.getAppInfo(n,i),a]).then(function(e){var a=e[1].oResolvedHashFragment;var s=e[1].oParsedHash;y.init();f.init();U._setInitialAppRoute();U.createApplication(n,t,a,i,s).then(function(e){U.renderApplication(e);h.sendMessageToOuterShell("sap.ushell.appRuntime.iframeIsBusy",{bValue:false})})})})})};this._setInitialAppRoute=function(){var e=b.parseShellHash(p.getHash());if(e&&e.appSpecificRoute&&e.appSpecificRoute.length>0){h.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.setInnerAppRoute",{appSpecificRoute:decodeURIComponent(e.appSpecificRoute)})}};this._getURI=function(){return(new l).query(true)};this.init=function(){A.registerFiori2IconFont();k=this._getURIParams()["sap-manifest-width"];g.setFullWidthFromManifest(k);c.registerCommHandlers({"sap.ushell.appRuntime":{oServiceCalls:{hashChange:{executeServiceCallFn:function(e){var t=e.oMessageData.body.sHash;if(typeof t==="string"){var n=b.parseShellHash(t),i=b.parseShellHash(p.getHash());if(n&&i&&n.semanticObject===i.semanticObject&&n.action===i.action){p.replaceHash(t)}}return(new jQuery.Deferred).resolve().promise()}},setDirtyFlag:{executeServiceCallFn:function(e){var t=e.oMessageData.body.bIsDirty;if(t!==sap.ushell.Container.getDirtyFlag()){sap.ushell.Container.setDirtyFlag(t)}return(new jQuery.Deferred).resolve().promise()}},getDirtyFlag:{executeServiceCallFn:function(e){return(new jQuery.Deferred).resolve(sap.ushell.Container.getDirtyFlag()).promise()}},themeChange:{executeServiceCallFn:function(e){var t=e.oMessageData.body.currentThemeId;sap.ushell.Container.getUser().setTheme(t);return(new jQuery.Deferred).resolve().promise()}},buttonClick:{executeServiceCallFn:function(e){sap.ushell.renderers.fiori2.Renderer.handleHeaderButtonClick(e.oMessageData.body.buttonId);return(new jQuery.Deferred).resolve().promise()}},uiDensityChange:{executeServiceCallFn:function(e){var t=e.oMessageData.body.isTouch;jQuery("body").toggleClass("sapUiSizeCompact",t==="0").toggleClass("sapUiSizeCozy",t==="1");return(new jQuery.Deferred).resolve().promise()}},handleDirtyStateProvider:{executeServiceCallFn:function(e){return(new jQuery.Deferred).resolve(sap.ushell.Container.handleDirtyStateProvider(e.oMessageData.body.oNavigationContext)).promise()}}}},"sap.ushell.services.MessageBroker":{oServiceCalls:{_execute:{executeServiceCallFn:function(e){return Promise.resolve()}}}}})};this.handleLinkElementOpen=function(e,t){try{if(t.isDefaultPrevented&&t.isDefaultPrevented()===true){return}var n=t.target;if(n&&n.tagName==="A"&&n.href&&n.href.indexOf("#")>0){if(n.target==="_blank"){var i=U.rebuildNewAppUrl(n.href,e);if(i!==n.href){w.openURL(i);t.preventDefault()}}else if(n.target===undefined||n.target===""){var a=n.href.split("#"),s=document.URL.split("#");if(a[0]===s[0]){var r=a[1]&&a[1].split("&/"),u=s[1]&&s[1].split("&/");if(typeof r[0]==="string"&&typeof u[0]==="string"&&r[0]!==u[0]){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(e){e.toExternal({target:{shellHash:a[1]}})});t.preventDefault()}}}}}catch(e){}};this.rebuildNewAppUrl=function(e,t){var n=e.split("#");if(n[0].length===0||n[0]===document.URL.split("#")[0]){return t+"#"+n[1]}return e};this.getPageConfig=function(){var e,n={};T=H["sap-spaces"]==="true";e=jQuery("meta[name='sap.ushellConfig.ui5appruntime']")[0];if(e!==undefined){n=JSON.parse(e.content);if(T===true){n.ushell=n.ushell||{};n.ushell.spaces={enabled:true}}}window["sap-ushell-config"]=t({},x(),n)};this.setModulePaths=function(){if(window["sap-ushell-config"].modulePaths){var e=Object.keys(window["sap-ushell-config"].modulePaths),t;for(var n in e){t=e[n];(function(e){var t={};t[e.replace(/\./g,"/")]=window["sap-ushell-config"].modulePaths[e];sap.ui.loader.config({paths:t})})(t)}}};this.adjustIframeURL=function(){};this.initServicesContainer=function(){return new Promise(function(e){sap.ui.require(["sap/ushell/appRuntime/ui5/services/Container"],function(t){t.bootstrap("apprt",{apprt:"sap.ushell.appRuntime.ui5.services.adapters"}).then(function(){sap.ushell.Container.getFLPUrlAsync().then(function(e){jQuery(document).on("click.appruntime",U.handleLinkElementOpen.bind(U,e));jQuery(document).on("keydown.appruntime",function(t){if(t.code==="Enter"){return U.handleLinkElementOpen(e,t)}})});sap.ushell.Container.getServiceAsync("ShellNavigation").then(function(t){B=t;B.init(function(){});m.setShellNavigationService(B);U._enableHistoryEntryReplacedDetection();e()})})})})};this._enableHistoryEntryReplacedDetection=function(){this._fnOriginalSetHash=p.setHash;this._fnOriginalReplaceHash=p.replaceHash;p.setHash=function(){if(p.disableCFLPUpdate===true){return this._fnOriginalSetHash.apply(p,arguments)}if(P.checkDataLossAndContinue()){return this._fnOriginalSetHash.apply(p,arguments)}}.bind(this);p.replaceHash=function(){if(p.disableCFLPUpdate===true){return this._fnOriginalReplaceHash.apply(p,arguments)}if(P.checkDataLossAndContinue()){return this._fnOriginalReplaceHash.apply(p,arguments)}}.bind(this)};this._getURIParams=function(){return H};this.getAppInfo=function(e,t){var i,a,s;if(e){i=window["sap-ushell-config"].ui5appruntime.config.appIndex.data;a=window["sap-ushell-config"].ui5appruntime.config.appIndex.module;s=window["sap-ushell-config"].ui5appruntime.config.appIndex.enableCache}return new Promise(function(r){if(e&&i&&!n(i)){m.init(a,U.createApplication.bind(U),U.renderApplication.bind(U),s,e,i);r({oResolvedHashFragment:i})}else{m.init(a,U.createApplication.bind(U),U.renderApplication.bind(U),s);m.getAppInfo(e,document.URL,t).then(r)}})};this.setHashChangedCallback=function(){if(O===true){return}function e(e,t){if(p.disableCFLPUpdate===true){return}if(e&&typeof e==="string"&&e.length>0){if(t&&typeof t==="string"&&t.length>0){var n=e.split("&/"),i=t.split("&/");if(n[0]!==i[0]){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(t){t.toExternal({target:{shellHash:e}})});return}}h.sendMessageToOuterShell("sap.ushell.appRuntime.hashChange",{newHash:e,direction:u.getInstance().getDirection()})}}p.changed.add(e.bind(this),this);O=true};this.createApplication=function(t,n,i,a,u){var p=b.getHash(window.location.href);return new Promise(function(l){var o="";if(n.hasOwnProperty("sap-history-dir")){o=n["sap-history-dir"];B.hashChanger.fireEvent("hashReplaced",{hash:B.hashChanger.getHash(),direction:o});e.debug("AppRuntime.createApplication :: Informed by the FLP, to change the History direction "+"property in the Iframe to: "+o)}D=new s({id:(P.getIsScube()===true?a:t)+"-content",width:"100%",height:"100%"});D.addStyleClass("sapAppRuntimeBaseStyle");var c="0";if(H.hasOwnProperty("sap-touch")){c=H["sap-touch"];if(c!=="0"&&c!=="1"){c="0"}}jQuery("body").toggleClass("sapUiSizeCompact",c==="0").toggleClass("sapUiSizeCozy",c==="1");if(E===false){var f=new v({scopeObject:D,scopeType:"component"});f.setBackNavigation();new S({scopeObject:D,scopeType:"component"});m.setShellUIService(f);sap.ushell.renderers.fiori2.utils.init();if(r.attachBlockLayerStateChange){r.attachBlockLayerStateChange(function(e){h.sendMessageToOuterShell("sap.ushell.services.ShellUIService.showShellUIBlocker",{bShow:e.getParameters().visible})})}E=true}(P.getIsScube()?Promise.resolve(""):m.getApplicationParameters(n)).then(function(e){i.url+=e;U.setHashChangedCallback();sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function(e){if(i.asyncHints&&Array.isArray(i.asyncHints.libs)){i.asyncHints.libs=i.asyncHints.libs.filter(function(e){return e.name!=="sap.ushell"})}var n,a;if(P.getIsScube()===true){n=i;a=u}else{n={ui5ComponentName:t,applicationDependencies:i,url:i.url};a=b.parseShellHash(p)}e.createComponent(n,a,[],R.Application).then(function(e){D.setComponent(e.componentHandle.getInstance());m.setComponent(D);d.setAppShortId(e.componentHandle);sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(t){t.prepareCurrentAppObject("UI5",e.componentHandle.getInstance(),false,undefined)});U.considerChangingTheDefaultFullWidthVal(e);U.overrideUrlHelperFuncs();l(e)})})})})};this.considerChangingTheDefaultFullWidthVal=function(e){if(k===true||k==="true"){C.emit("appWidthChange",false);var t=e.componentHandle.getInstance();var n=t.getMetadata();var i;if(n){i=t.getMetadata().getManifestEntry("/sap.ui/fullWidth");if(i===true||i==="true"){C.emit("appWidthChange",true)}else if(i===undefined){i=t.getMetadata().getManifestEntry("/sap.ui5/config/fullWidth");if(i===true||i==="true"){C.emit("appWidthChange",true)}}}}};this.overrideUrlHelperFuncs=function(){if(L===true){return}L=true;if(I){I.triggerEmail=function(e,t,n,i,a){h.sendMessageToOuterShell("sap.ushell.services.ShellUIService.sendEmail",{sTo:e,sSubject:t,sBody:n,sCc:i,sBcc:a,sIFrameURL:document.URL,bSetAppStateToPublic:true})};F=I.redirect;I.redirect=function(e,t){if(e&&t===true&&e.indexOf("#")>=0){sap.ushell.Container.getFLPUrlAsync().then(function(n){var i=U.rebuildNewAppUrl(e,n);F.call(I,i,t)})}else{F.call(I,e,t)}}}};this.loadPlugins=function(){if(M===true){return}M=true;sap.ushell.Container.getServiceAsync("PluginManager").then(function(e){i(e);N(e);e.loadPlugins("RendererExtensions")})};function i(e){e.registerPlugins({RTAPluginAgent:{component:"sap.ushell.appRuntime.ui5.plugins.rtaAgent",url:sap.ui.require.toUrl("sap/ushell/appRuntime/ui5/plugins/rtaAgent"),config:{"sap-plugin-agent":true}}})}function N(e){var t;if(H.hasOwnProperty("sap-wa-debug")&&H["sap-wa-debug"]==="dev"){t="https://education3.hana.ondemand.com/education3/web_assistant/framework/FioriAgent.js"}else if(H.hasOwnProperty("sap-wa-debug")&&H["sap-wa-debug"]==="prev"){t="https://webassistant-outlook.enable-now.cloud.sap/web_assistant/framework/FioriAgent.js"}else{t="https://webassistant.enable-now.cloud.sap/web_assistant/framework/FioriAgent.js"}e.registerPlugins({WAPluginAgent:{component:"sap.ushell.appRuntime.ui5.plugins.scriptAgent",url:sap.ui.require.toUrl("sap/ushell/appRuntime/ui5/plugins/scriptAgent"),config:{"sap-plugin-agent":true,url:t}}})}this.renderApplication=function(e){D.placeAt("content");a.hide();setTimeout(function(){if(e.componentHandle.getInstance().active){e.componentHandle.getInstance().active()}U.loadPlugins()},0)}}function x(){return{services:{CrossApplicationNavigation:{module:"sap.ushell.appRuntime.ui5.services.CrossApplicationNavigation",adapter:{module:"sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"}},NavTargetResolution:{module:"sap.ushell.appRuntime.ui5.services.NavTargetResolution",adapter:{module:"sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"}},ShellNavigation:{module:"sap.ushell.appRuntime.ui5.services.ShellNavigation",adapter:{module:"sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"}},AppConfiguration:{module:"sap.ushell.appRuntime.ui5.services.AppConfiguration"},Bookmark:{module:"sap.ushell.appRuntime.ui5.services.Bookmark",adapter:{module:"sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"}},LaunchPage:{module:"sap.ushell.appRuntime.ui5.services.LaunchPage",adapter:{module:"sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"}},UserInfo:{module:"sap.ushell.appRuntime.ui5.services.UserInfo",adapter:{module:"sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"}},AppState:{module:"sap.ushell.appRuntime.ui5.services.AppState",adapter:{module:"sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"}},PluginManager:{config:{isBlueBox:true}},Menu:{module:"sap.ushell.appRuntime.ui5.services.Menu",adapter:{module:"sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"}},CommonDataModel:{module:"sap.ushell.appRuntime.ui5.services.CommonDataModel",adapter:{module:"sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"}},Ui5ComponentLoader:{config:{loadDefaultDependencies:false}}},ushell:{customPreload:{enabled:false}}}}var _=new N;U=_;_.main();return _});function prepareModules(){"use strict";sap.ui.require(["sap/ui/core/BusyIndicator"],function(e){try{if(apprtBIdiv){document.body.classList.remove("apprtBIbg");apprtBIdiv.parentNode.removeChild(apprtBIdiv);apprtBIstyle.parentNode.removeChild(apprtBIstyle)}e.show(0)}catch(t){e.show(0)}});if(document.URL.indexOf("ui5appruntime")>0){sap.ui.define("sap/ushell/URLTemplateProcessor",[],function(){return{}});sap.ui.define("sap/ushell/_ApplicationType/wdaResolution",[],function(){return{}});sap.ui.define("sap/ushell/_ApplicationType/guiResolution",[],function(){return{}});if(document.URL.indexOf("sap-ui-app-id=")>0){sap.ui.define("sap/ushell/ApplicationType",[],function(){return{URL:{type:"URL"},WDA:{type:"WDA"},TR:{type:"TR"},NWBC:{type:"NWBC"},WCF:{type:"WCF"},SAPUI5:{type:"SAPUI5"}}})}sap.ui.define("sap/ushell/components/applicationIntegration/AppLifeCycle",[],function(){return{}});sap.ui.define("sap/ushell/services/_AppState/WindowAdapter",[],function(){return function(){}});sap.ui.define("sap/ushell/services/_AppState/SequentializingAdapter",[],function(){return function(){}});sap.ui.define("sap/ushell/services/_AppState/Sequentializer",[],function(){return function(){}});sap.ui.define("sap/ushell/services/Configuration",[],function(){function e(){this.attachSizeBehaviorUpdate=function(){};this.hasNoAdapter=true}e.hasNoAdapter=true;return e});sap.ui.define("sap/ushell/services/_PluginManager/Extensions",[],function(){return function(){}});sap.ui.define("sap/ushell/TechnicalParameters",[],function(){return{getParameterValue:function(){return Promise.resolve([])},getParameterValueSync:function(){return[]},getParameters:function(){return[]},getParameterNames:function(){return[]},isTechnicalParameter:function(){return false}}});sap.ui.define("sap/ushell/AppInfoParameters",[],function(){return{getInfo:function(){return Promise.resolve({})}}});sap.ui.define("sap/ushell/bootstrap/common/common.load.core-min",[],function(){return{loaded:false,load:function(e){}}})}}
//# sourceMappingURL=AppRuntime.js.map