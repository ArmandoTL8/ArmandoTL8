// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/base/security/encodeXML","sap/base/util/deepEqual","sap/base/util/uid","sap/base/util/UriParameters","sap/m/MessagePopover","sap/m/Text","sap/ui/core/Component","sap/ui/core/ComponentContainer","sap/ui/core/Control","sap/ui/core/Icon","sap/ui/core/mvc/View","sap/ui/core/routing/History","sap/ui/Device","sap/ui/thirdparty/jquery","sap/ui/thirdparty/URI","sap/ushell/ApplicationType","sap/ushell/Config","sap/ushell/EventHub","sap/ushell/library","sap/ushell/resources","sap/ushell/System","sap/ushell/User","sap/ushell/utils","sap/ushell/utils/UrlParsing","sap/ui/core/Core","sap/ui/thirdparty/hasher","sap/ui/core/Configuration"],function(e,t,a,r,n,o,i,s,p,l,u,f,d,c,jQuery,g,m,h,y,v,C,I,b,_,P,A,S,E){"use strict";var w="sap.ushell.components.container.",U=w+"ApplicationContainer",x="sap.ushell.Container.dirtyState.",R="autoplay;battery;camera;display-capture;geolocation;gyroscope;magnetometer;microphone;midi;clipboard-write;clipboard-read;fullscreen;serial;",T,M,D,L=false,F=false,O=[],N=0,H=0;var V=["sap-ach","sap-fiori-id","sap-hide-intent-link","sap-priority","sap-tag","sap-ui-app-id-hint","sap-ui-debug","sap-ui-fl-control-variant-id","sap-ui-fl-max-layer","sap-ui-tech-hint","sap-ui2-tcode","sap-ui2-wd-app-id","sap-ui2-wd-conf-id","sap-ushell-cdm-site-url","sap-ushell-navmode","sap-ushell-next-navmode","sap-ushell-url","sap-app-origin-hint"];function j(e){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(t){t.isUrlSupported(e.url).done(function(){e.promise.resolve({allowed:true,id:e.id})}).fail(function(){e.promise.resolve({allowed:false,id:e.id})})})}function W(e){var t={asyncURLHandler:Ce.prototype._adaptIsUrlSupportedResultForMessagePopover};if(o&&o.setDefaultHandlers){o.setDefaultHandlers(t)}y.emit("StepDone",e.stepName)}y.once("initMessagePopover").do(W);T=new _.Map;function k(e){return T.get(e.getId())}function q(){return M}function B(e){var t=n.fromURL(e).mParams,a=t["sap-xapp-state"],r;delete t["sap-xapp-state"];r={startupParameters:t};if(a){r["sap-xapp-state"]=a}return r}function J(e,t){return C.i18n.getText(e,t)}function K(){return new u({size:"2rem",src:"sap-icon://error",tooltip:Ce.prototype._getTranslatedText("an_error_has_occured")})}function z(t){var a=t.getAggregation("child"),r;if(a instanceof p){r=a.getComponentInstance().getMetadata().getName().replace(/\.Component$/,"");e.debug("unloading component "+r,null,U)}t.destroyAggregation("child")}function G(t,a,r){return new Promise(function(n){var o,i,l,u,d,c={},g,m;function h(e){e.setWidth(t.getWidth());e.setHeight(t.getHeight());e.addStyleClass("sapUShellApplicationContainer");t.setAggregation("child",e,true)}o=a.indexOf("?");if(o>=0){u=Ce.prototype._getParameterMap(a);c=u.startupParameters;a=a.slice(0,o)}if(a.slice(-1)!=="/"){a+="/"}if(/\.view\.(\w+)$/i.test(r)){l=/^SAPUI5=(?:([^/]+)\/)?([^/]+)\.view\.(\w+)$/i.exec(r);if(!l){e.error("Invalid SAPUI5 URL",r,U);n(Ce.prototype._createErrorControl());return}d=l[1];g=l[2];m=l[3].toUpperCase();if(d){g=d+"."+g}else{i=g.lastIndexOf(".");if(i<1){e.error("Missing namespace",r,U);return Ce.prototype._createErrorControl()}d=g.slice(0,i)}}else{d=r.replace(/^SAPUI5=/,"")}var y={};var v=d.replace(/\./g,"/");y[d]=a+v;sap.ui.loader.config({paths:y});Ce.prototype._destroyChild(t);if(g){if(t.getApplicationConfiguration()){c.config=t.getApplicationConfiguration()}f.create({id:t.getId()+"-content",type:m,viewData:c||{},viewName:g}).then(function(e){t.fireEvent("applicationConfiguration");h(e);n(e)})}else{e.debug("loading component "+d,null,U);var C=u?{startupParameters:u.startupParameters}:{startupParameters:{}};if(u&&u["sap-xapp-state"]){C["sap-xapp-state"]=u["sap-xapp-state"]}if(t.getApplicationConfiguration()){C.config=t.getApplicationConfiguration()}s.create({id:t.getId()+"-component",componentData:C,name:d}).then(function(e){t.fireEvent("applicationConfiguration",{configuration:e.getMetadata().getConfig()});var a=new p({id:t.getId()+"-content",component:e});h(a);n(a)})}})}function $(e,t){setTimeout(function(){A.getEventBus().publish("sap.ushell",e,t)},0)}function Q(t,a,r){var n=this,o,i={oControl:undefined,oPromise:undefined},l,u,f,d={startupParameters:{}},c,g=t.getComponentHandle(),m,h;function y(e){t.fireEvent("applicationConfiguration",{configuration:e.getMetadata().getConfig()});u=new p({id:t.getId()+"-content",component:e});u.setHeight(t.getHeight());u.setWidth(t.getWidth());u.addStyleClass("sapUShellApplicationContainer");t._disableRouterEventHandler=Ce.prototype._disableRouter.bind(n,e);A.getEventBus().subscribe("sap.ushell.components.container.ApplicationContainer","_prior.newUI5ComponentInstantion",t._disableRouterEventHandler);t.setAggregation("child",u,true);sap.ushell.Container.getServiceAsync("PluginManager").then(function(t){m=t.getPluginLoadingPromise("RendererExtensions");h=m&&m.state();if(h==="pending"){m.done(function(){Ce.prototype._publishExternalEvent("appComponentLoaded",{component:e})}).fail(function(){Ce.prototype._publishExternalEvent("appComponentLoaded",{component:e})})}if(h==="resolved"||h==="rejected"){Ce.prototype._publishExternalEvent("appComponentLoaded",{component:e})}});return u}l=a.indexOf("?");if(l>=0){f=Ce.prototype._getParameterMap(a);d={startupParameters:f.startupParameters};if(f["sap-xapp-state"]){d["sap-xapp-state"]=f["sap-xapp-state"]}a=a.slice(0,l)}if(t.getApplicationConfiguration()){d.config=t.getApplicationConfiguration()}if(a.slice(-1)!=="/"){a+="/"}Ce.prototype._destroyChild(t);c={id:t.getId()+"-component",name:r,componentData:d};e.debug("Creating component instance for "+r,JSON.stringify(c),U);A.getEventBus().publish("sap.ushell.components.container.ApplicationContainer","_prior.newUI5ComponentInstantion",{name:r});if(g){var v=g.getInstance(c);i.oControl=y(v)}else{o=new jQuery.Deferred;var C={};var I=r.replace(/\./g,"/");C[I]=a;sap.ui.loader.config({paths:C});e.error("No component handle available for '"+r+"'; fallback to component.load()",null,U);s.create({id:t.getId()+"-component",name:r,manifest:false,componentData:d}).then(function(e){o.resolve(y(e))});i.oPromise=o.promise()}return i}function X(t){var a;if(t instanceof s&&typeof t.getRouter==="function"){a=t.getRouter();if(a&&typeof a.stop==="function"){e.info("router stopped for instance "+t.getId());a.stop()}}}function Y(e){var t=document.createElement("a"),a=n.fromURL(e).get("sap-client"),r;t.href=e;r=t.protocol+"//"+t.host;return new I({alias:a?r+"?sap-client="+a:r,baseUrl:r,client:a||undefined,platform:"abap"})}function Z(e,t){var a=false,r=e.getDomRef(),n,o;if(e.getIframeWithPost()===true&&r&&r.getAttribute&&r.getAttribute("sap-iframe-app")=="true"){r=jQuery("#"+r.getAttribute("id")+"-iframe")[0]}if(r){n=g(e._getIFrameUrl(r)||window.location&&window.location.href||"");o=n.protocol()+"://"+n.host();a=t.source===r.contentWindow||t.origin===o}return a}function ee(t,a,n){var o=JSON.stringify({type:"request",service:a,request_id:r(),body:{}});e.debug("Sending post message request to origin ' "+n+"': "+o,null,"sap.ushell.components.container.ApplicationContainer");t.postMessage(o,n)}function te(){var e=this.getDomRef();if(!e||e.tagName!=="IFRAME"){if(this.getIframeWithPost()===true&&e&&e.getAttribute&&e.getAttribute("sap-iframe-app")=="true"){return jQuery("#"+e.getAttribute("id")+"-iframe")[0]}return null}return e}function ae(e){var t;if(e===undefined){e=this._getIFrame()}if(this.getIframeWithPost()===true){t=jQuery("#"+e.getAttribute("id").replace("-iframe","-form"))[0].action;if(t===undefined&&(new g).query(true).hasOwnProperty("sap-isolation-enabled")){t=e.src}}else{t=e.src}return t}function re(t,a){var r=t&&t.getUi5ComponentName&&t.getUi5ComponentName(),n=a.data,o=typeof n==="string"&&n.indexOf("sap.ushell.appRuntime.iframeIsValid")>0;if(t&&!t.getActive()&&o!==true){e.debug("Skipping handling of postMessage 'message' event with data '"+JSON.stringify(n)+"' on inactive container '"+t.getId()+"'","Only active containers can handle 'message' postMessage event","sap.ushell.components.container.ApplicationContainer");return}if(typeof r==="string"){e.debug("Skipping handling of postMessage 'message' event with data '"+JSON.stringify(n)+"' on container of UI5 application '"+r+"'","Only non UI5 application containers can handle 'message' postMessage event","sap.ushell.components.container.ApplicationContainer");return}var i={bPluginsStatusChecked:L,bKeepMessagesForPlugins:F,bApiRegistered:true};D(t,a,i);Ce.prototype._handlePostMessagesForPluginsPostLoading(t,a,i)}function ne(t,a,r){var n,o;if(r.bApiRegistered!==false){return}sap.ushell.Container.getServiceAsync("PluginManager").then(function(r){if(L===false){L=true;n=r.getPluginLoadingPromise("RendererExtensions");o=n&&n.state();if(o==="pending"){F=true;n.always(function(){var t;F=false;e.debug("Processing post messages queue after 'RendererExtensions' plugins loaded, queue size is: "+O.length,null,"sap.ushell.components.container.ApplicationContainer");for(var a=0;a<O.length;a++){t=O[a];try{Ce.prototype._handleMessageEvent.call(t.that,t.oContainer,t.oMessage)}catch(t){e.error(t.message||t,null,"sap.ushell.components.container.ApplicationContainer")}}O=[]})}}if(F===true){O.push({index:N++,that:this,oContainer:t,oMessage:a})}})}function oe(){L=false;F=false;O=[];N=0}function ie(e,t){var a=e._getIFrame(),r=e.getApplicationType();if(_.isApplicationTypeEmbeddedInIframe(e.getApplicationType(r))&&a){var n=new g(e._getIFrameUrl(a));var o=n.protocol()+"://"+n.host();a.contentWindow.postMessage(JSON.stringify({action:"pro54_disableDirtyHandler"}),o);t.preventDefault()}}function se(e,t,a){e.openStart("div",t).accessibilityState(t).class("sapUShellApplicationContainer").style("height",t.getHeight()).style("width",t.getWidth()).openEnd();if(a){e.renderControl(a)}e.close("div")}function pe(e,t,a){if(_.isApplicationTypeEmbeddedInIframe(t)||_.isApplicationTypeEmbeddedInIframe(e.getFrameworkId())){var r=e.getTargetNavigationMode();a=Ce.prototype._adjustNwbcUrl(a,t,r,e.getIsStateful());_.localStorageSetItem(e.globalDirtyStorageKey,sap.ushell.Container.DirtyState.INITIAL)}return a}function le(e,t,a,r){var o,i=function(){var e=_.getParameterValueBoolean("sap-accessibility");if(e!==undefined){return e}return sap.ushell.Container.getUser().getAccessibilityMode()},s=function(){var t=n.fromURL(e)||{mParams:{}};if(t.mParams["sap-theme"]===undefined){return sap.ushell.Container.getUser().getTheme(b.prototype.constants.themeFormat.NWBC)}return undefined},p=function(){var t=false,a=n.fromURL(e)||{mParams:{}};t=E.getStatistics()&&a.mParams["sap-statistics"]===undefined;return t},l=function(){var e=S&&S.getHash(),t="",a;if(e&&e.length>0&&e.indexOf("sap-iapp-state=")>0){a=/(?:sap-iapp-state=)([^&/]+)/.exec(e);if(a&&a.length===2){t=a[1]}}return t},u=function(){var e="";var t=!!jQuery("body.sapUiSizeCompact").length;var a=!!jQuery("body.sapUiSizeCozy").length;if(t===true){e="0"}else if(a){e="1"}return e};e+=e.indexOf("?")>=0?"&":"?";e+="sap-ie=edge";o=s();if(o){e+=e.indexOf("?")>=0?"&":"?";e+="sap-theme="+encodeURIComponent(o)}if(a){e+=e.indexOf("?")>=0?"&":"?";e+="sap-target-navmode="+encodeURIComponent(a)}if(i()){e+=e.indexOf("?")>=0?"&":"?";e+="sap-accessibility=X"}if(p()){e+=e.indexOf("?")>=0?"&":"?";e+="sap-statistics=true"}if(t==="TR"||t==="GUI"){e+=e.indexOf("?")>=0?"&":"?";e+="sap-keepclientsession=2"}else if(r){e+=e.indexOf("?")>=0?"&":"?";e+="sap-keepclientsession=1"}var f=l();if(f&&f.length>0){e+=e.indexOf("?")>=0?"&":"?";e+="sap-iapp-state="+f}var d=u();if(d&&d.length>0){e+=e.indexOf("?")>=0?"&":"?";e+="sap-touch="+d}var c=0;if(h.last("/core/shell/sessionTimeoutIntervalInMinutes")>0){c=h.last("/core/shell/sessionTimeoutIntervalInMinutes")}e+=e.indexOf("?")>=0?"&":"?";e+="sap-ushell-timeout="+c;return _.appendSapShellParam(e,t)}function ue(e,t,a,r){var n=t.getAggregation("child"),o,i;if(!n||t._bRecreateChild){i=Ce.prototype._createUi5Component(t,a,r);if(i.oControl!==undefined){t._bRecreateChild=false;Ce.prototype._renderControlInDiv(e,t,i.oControl)}else{t.oDeferredControlCreation=new jQuery.Deferred;Ce.prototype._renderControlInDiv(e,t);i.oPromise.then(function(e){t._bRecreateChild=false;o=A.createRenderManager();o.renderControl(e);o.flush(jQuery("#"+t.getId())[0]);o.destroy();t.oDeferredControlCreation.resolve()})}}else{Ce.prototype._renderControlInDiv(e,t,n)}}function fe(e,t,r){var n=e.getProperty(t);if(a(n,r)){return}e.setProperty(t,r);e._bRecreateChild=true}function de(t,a,r,o,i){var s,p=true,l=false;localStorage.removeItem(a.globalDirtyStorageKey);a.oDeferredControlCreation=undefined;if(i&&i.indexOf("SAPUI5.Component=")===0&&r===m.URL.type){ue(t,a,o,i.replace(/^SAPUI5\.Component=/,""));return}if(i&&i.indexOf("SAPUI5=")===0&&r===m.URL.type){Ce.prototype._renderControlInDiv(t,a,undefined,"open");a.oDeferredControlCreation=new jQuery.Deferred;Ce.prototype._createUi5View(a,o,i).then(function(e){var r,n=jQuery("#"+a.getId());if(n&&n.length>0){r=A.createRenderManager();r.renderControl(e);r.flush(jQuery("#"+a.getId())[0]);r.destroy()}else{t.renderControl(e)}a.oDeferredControlCreation.resolve()});Ce.prototype._renderControlInDiv(t,a,undefined,"close");return}e.debug('Not resolved as "SAPUI5.Component=" or "SAPUI5=" , '+"will attempt to load into iframe "+i);if(!a.getActive()){e.debug("Skipping rendering container iframe","Container '"+a.getId()+"' is inactive");return}try{o=a.getFrameSource(r,o)}catch(r){e.error(r.message||r,null,U);a.fireEvent("applicationConfiguration");t.renderControl(Ce.prototype._createErrorControl());return}if(sap.ushell.Container){s=Ce.prototype._getLogoutHandler(a);if(!s){if(_.isApplicationTypeEmbeddedInIframe(r)){s=Ce.prototype._logout.bind(null,a);T.put(a.getId(),s);sap.ushell.Container.attachLogoutEvent(s);sap.ushell.Container.addRemoteSystem(Ce.prototype._createSystemForUrl(o))}}else if(!_.isApplicationTypeEmbeddedInIframe(r)){sap.ushell.Container.detachLogoutEvent(s);T.remove(a.getId())}}o=Ce.prototype._checkNwbcUrlAdjustment(a,r,o);var u=n.fromURL(document.URL);if(u.has("sap-iframe-params")){var f=u.get("sap-iframe-params")||"",d=f.split(",");if(d.length>0){var c=new g(o);d.forEach(function(e){if(e&&e.length>0){if(u.has(e)){c.addQuery(e,u.get(e))}}});o=c.toString()}}if(r==="TR"){a.setProperty("iframePostAllParams",true,true)}if(u.get("sap-post")==="false"){p=false}else if(window.QUnit!==undefined){p=a.getIframeWithPost()}if(p===true&&a.getOpenWithPostByAppParam()===false){p=false}if(u.get("sap-post")==="true"){l=true}if(p===true&&(r==="NWBC"||r==="TR"||r==="WDA"||r==="WCF")||l===true){a.setProperty("iframeWithPost",true,true);a.oDeferredRenderer=new jQuery.Deferred;o=Ce.prototype._filterURLParams(o);var y=[];var v=Ce.prototype._getParamKeys(o,y);Ce.prototype._generateRootElementForIFrame(t,a,true);if(v.length>0){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(e){e.getAppStateData(v).then(function(e){var r;var n=jQuery("#"+a.getId());if(n.length>0){r=A.createRenderManager();Ce.prototype._buildHTMLElements(r,a,e,y,o);r.flush(n[0]);r.destroy()}else{Ce.prototype._buildHTMLElements(t,a,e,y,o)}setTimeout(a.oDeferredRenderer.resolve,0)},function(e){Ce.prototype._buildHTMLElements(t,a,undefined,y,o);setTimeout(a.oDeferredRenderer.resolve,0)})})}else{Ce.prototype._buildHTMLElements(t,a,undefined,y,o);setTimeout(a.oDeferredRenderer.resolve,0)}Ce.prototype._generateRootElementForIFrame(t,a,false);return}if(a.getFrameworkId&&a.getFrameworkId()==="UI5"&&a.getIsStateful&&a.getIsStateful()===true){a.setProperty("isIframeBusy",true,true)}a.fireEvent("applicationConfiguration");t.openStart("iframe",a).accessibilityState(a).attr("src",o).attr("title",C.i18n.getText("AppilcationContainer.IframeTitle")).attr("sap-iframe-idx",++H).class("sapUShellApplicationContainer").style("height",a.getHeight()).style("width",a.getWidth());if(h.last("/core/shell/enableFeaturePolicyInIframes")===true){t.attr("allow",R)}t.openEnd().close("iframe")}function ce(e){var t=new g(e);t=t.removeSearch(V);return t.toString()}function ge(e,t){var a=[],r;if(e.indexOf("sap-intent-param=")>0){r=/(?:sap-intent-param=)([^&/]+)/.exec(e);if(r&&r.length===2){a.push([r[1]]);t.push("sap-intent-param-data")}}if(e.indexOf("sap-xapp-state=")>0){r=/(?:sap-xapp-state=)([^&/]+)/.exec(e);if(r&&r.length===2){a.push([r[1]]);t.push("sap-xapp-state-data")}}if(e.indexOf("sap-iapp-state=")>0){r=/(?:sap-iapp-state=)([^&/]+)/.exec(e);if(r&&r.length===2){a.push([r[1]]);t.push("sap-iapp-state-data")}}return a}function me(e,t,a,r,o){var i=t.getId()+"-form",s="",p=false;if(a===undefined){a=[]}a.push([sap.ushell.Container.getFLPUrl(true)]);r.push("sap-flp-url");a.push([t.getSystemAlias()]);r.push("system-alias");var l="";var u={};r.forEach(function(e,t){if(a[t][0]){u[e]=a[t][0]}});var f=o;l=JSON.stringify(u);var d={};if(t.getIframePostAllParams()===true){d=n.fromURL(o);s=he(t,d,false);if(s!==""){o=ye(o,d)}}t.fireEvent("applicationConfiguration");e.openStart("form").attr("id",i).attr("method","post").attr("name",i).attr("target",t.getId()+"-iframe").attr("action",o).style("display","none").openEnd();e.voidStart("input").attr("name","sap-flp-params").attr("value",l).voidEnd();if(t.getIframePostAllParams()===true){he(t,d,true,e)}e.close("form");var c=t.sId;if(t.hasStyleClass("sapUShellApplicationContainerIframeHidden")){p=true;t.toggleStyleClass("sapUShellApplicationContainerIframeHidden",false)}t.sId+="-iframe";e.openStart("iframe",t).attr("name",t.getId()).accessibilityState(t).attr("sap-orig-src",f).attr("title",C.i18n.getText("AppilcationContainer.IframeTitle")).attr("sap-iframe-idx",++H).class("sapUShellApplicationContainer").style("height",t.getHeight()).style("width",t.getWidth());if(h.last("/core/shell/enableFeaturePolicyInIframes")===true){e.attr("allow",R.replaceAll(";"," "+new g(o).origin()+";"))}e.openEnd().close("iframe");t.sId=c;if(p){t.toggleStyleClass("sapUShellApplicationContainerIframeHidden",true)}}function he(e,t,a,r){var n="";var o="";if(t.has("sap-iframe-hint")){n=t.get("sap-iframe-hint")}var i=t.mParams;if(e.getApplicationType()==="TR"||n==="GUI"){var s,p;for(s in i){if(s==="sap-iframe-hint"||s==="sap-keep-alive"){continue}p=i[s][0];if(a===true){r.voidStart("input").attr("name",s).attr("value",p).voidEnd()}else{o+="*"}}}return o}function ye(e,t){var a=t.get("sap-iframe-hint"),r=t.get("sap-keep-alive"),n=new g(e).query("");if(typeof a==="string"){n.addSearch("sap-iframe-hint",a)}if(typeof r==="string"){n.addSearch("sap-keep-alive",r)}return n.toString()}function ve(e,t,a){if(a){e.openStart("div",t).attr("sap-iframe-app","true").class("sapUShellApplicationContainer").style("height",t.getHeight()).style("width",t.getWidth()).openEnd()}else{e.close("div")}}var Ce=l.extend(U,{metadata:{properties:{additionalInformation:{defaultValue:"",type:"string"},application:{type:"object"},applicationConfiguration:{type:"object"},applicationType:{defaultValue:"URL",type:w+"ApplicationType"},height:{defaultValue:"100%",type:"sap.ui.core.CSSSize"},navigationMode:{defaultValue:"",type:"string"},targetNavigationMode:{defaultValue:"",type:"string"},text:{defaultValue:"",type:"string"},url:{defaultValue:"",type:"string"},visible:{defaultValue:true,type:"boolean"},active:{defaultValue:true,type:"boolean"},"sap-system":{type:"string"},applicationDependencies:{type:"object"},componentHandle:{type:"object"},ui5ComponentName:{type:"string"},width:{defaultValue:"100%",type:"sap.ui.core.CSSSize"},shellUIService:{type:"object"},appIsolationService:{type:"object"},reservedParameters:{type:"object"},coreResourcesFullyLoaded:{type:"boolean"},isStateful:{defaultValue:false,type:"boolean"},iframeHandlers:{defaultValue:"",type:"string"},openWithPostByAppParam:{defaultValue:true,type:"boolean"},iframeWithPost:{defaultValue:false,type:"boolean"},beforeAppCloseEvent:{type:"object"},extendedInfo:{type:"object"},systemAlias:{defaultValue:"",type:"string"},iframePostAllParams:{defaultValue:false,type:"boolean"},isKeepAlive:{defaultValue:false,type:"boolean"},frameworkId:{defaultValue:"",type:"string"},iframeReusedForApp:{defaultValue:false,type:"boolean"},isIframeValidTime:{defaultValue:{time:0},type:"object"},isIframeBusy:{defaultValue:false,type:"boolean"},isInvalidIframe:{defaultValue:false,type:"boolean"}},events:{applicationConfiguration:{}},aggregations:{child:{multiple:false,type:"sap.ui.core.Control",visibility:"hidden"}},library:"sap.ushell",designtime:"sap/ushell/designtime/ApplicationContainer.designtime"},exit:function(){var e,t=this;if(sap.ushell.Container){e=Ce.prototype._getLogoutHandler(t);if(e){sap.ushell.Container.detachLogoutEvent(e);T.remove(t.getId())}}localStorage.removeItem(t.globalDirtyStorageKey);if(t._unloadEventListener){removeEventListener("unload",t._unloadEventListener)}if(t._disableRouterEventHandler){A.getEventBus().unsubscribe("sap.ushell.components.container.ApplicationContainer","_prior.newUI5ComponentInstantion",t._disableRouterEventHandler)}if(t._storageEventListener){removeEventListener("storage",t._storageEventListener)}if(t._messageEventListener){removeEventListener("message",t._messageEventListener)}Ce.prototype._destroyChild(t);if(l.exit){l.exit.apply(t)}},setHandleMessageEvent:function(e){D=e},init:function(){var t=this;t.globalDirtyStorageKey=x+r();t._unloadEventListener=t.exit.bind(t);addEventListener("unload",t._unloadEventListener);t._storageEventListener=function(a){var r=t.getApplicationType();if(a.key===t.globalDirtyStorageKey&&a.newValue===sap.ushell.Container.DirtyState.PENDING&&_.isApplicationTypeEmbeddedInIframe(r)){var n=t._getIFrame();if(n){e.debug("getGlobalDirty() send pro54_getGlobalDirty ",null,"sap.ushell.components.container.ApplicationContainer");var o=new g(t._getIFrameUrl(n));var i=o.protocol()+"://"+o.host();n.contentWindow.postMessage(JSON.stringify({action:"pro54_getGlobalDirty"}),i)}}};addEventListener("storage",t._storageEventListener);t._messageEventListener=Ce.prototype._handleMessageEvent.bind(null,t);addEventListener("message",t._messageEventListener)},onAfterRendering:function(){var e=this;this.rerender=function(){};if(c.os.ios&&this.$().prop("tagName")==="IFRAME"){this.$().parent().css("overflow","auto")}if(this.oDeferredRenderer){this.oDeferredRenderer.done(function(){var t=document.getElementById(e.getId()+"-form");if(t){t.submit()}})}},renderer:{apiVersion:2,render:function(t,a){var r=a.getApplication(),n=a.launchpadData,o;if(!a.getVisible()){Ce.prototype._renderControlInDiv(t,a);return}if(a.bTestControl){Ce.prototype._renderControlInDiv(t,a,a.oTestControl)}else if(a.error){delete a.error;Ce.prototype._renderControlInDiv(t,a,Ce.prototype._createErrorControl())}else if(!r){Ce.prototype._render(t,a,a.getApplicationType(),a.getUrl(),a.getAdditionalInformation())}else if(!r.isResolvable()){Ce.prototype._render(t,a,r.getType(),r.getUrl(),"")}else if(n){Ce.prototype._render(t,a,n.applicationType,n.Absolute.url.replace(/\?$/,""),n.applicationData)}else{e.debug("Resolving "+r.getUrl(),null,U);r.resolve(function(t){e.debug("Resolved "+r.getUrl(),JSON.stringify(t),U);a.launchpadData=t;Ce.prototype._destroyChild(a)},function(e){var t=r.getMenu().getDefaultErrorHandler();if(t){t(e)}Ce.prototype._destroyChild(a);a.error=e});o=new i({text:Ce.prototype._getTranslatedText("loading",[r.getText()])});Ce.prototype._destroyChild(a);a.setAggregation("child",o);Ce.prototype._renderControlInDiv(t,a,o)}}}});Ce.prototype.getFrameSource=function(e,t){if(!Object.prototype.hasOwnProperty.call(m.enum,e)){throw new Error("Illegal application type: "+e)}return t};Ce.prototype.setUrl=function(e){fe(this,"url",e)};Ce.prototype.setAdditionalInformation=function(e){fe(this,"additionalInformation",e)};Ce.prototype.setApplicationType=function(e){fe(this,"applicationType",e)};Ce.prototype.createPostMessageRequest=function(e,t){var a=Date.now().toString();return{type:"request",request_id:a,service:e,body:t}};Ce.prototype.setNewTRApplicationContext=function(e){var t=new jQuery.Deferred,a=this._getIFrame(),r,n,o=this;if(!a){return t.promise().reject({message:"Expected an existing TR application application frame but found none."})}function i(){if(n){n["sap-flp-url"]=sap.ushell.Container.getFLPUrl(true);n["system-alias"]=o.getSystemAlias();r["sap-flp-params"]=n}var e=o.createPostMessageRequest("sap.its.startService",r);o.postMessageToIframe(e,a,true).then(function(){t.resolve()}).catch(function(e){t.reject({eventData:e,message:"Failed to change application context."})})}e=_.appendSapShellParam(e);e=Ce.prototype._filterURLParams(e);r={url:e};if(this.getIframeWithPost&&this.getIframeWithPost()===true){var s=[];var p=Ce.prototype._getParamKeys(e,s);if(p.length>0){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(e){e.getAppStateData(p).then(function(e){n={};s.forEach(function(t,a){if(e[a][0]){n[t]=e[a][0]}});i()},function(e){i()})})}else{n={};i()}}else{i()}return t.promise()};Ce.prototype.postMessageToIframe=function(t,a,r){var n=this;var o=t.request_id;return new Promise(function(i,s){function p(a){var r={};try{if(typeof a.data==="string"&&a.data.indexOf("{")===0){try{r=JSON.parse(a.data)}catch(e){r={}}}else{return}if(!r.request_id||o!==r.request_id){return}if(r.status==="success"){i(r)}else{s(r)}window.removeEventListener("message",p)}catch(r){i();e.warning("Obtained bad response from framework in response to message "+t.request_id);e.debug("Underlying framework returned invalid response data: '"+a.data+"'")}}var l=JSON.stringify(t);e.debug("Sending postMessage "+l+" to application container '"+n.getId()+"'");var u=new g(n._getIFrameUrl(a));var f=u.protocol()+"://"+u.host();if(r){window.addEventListener("message",p,false);a.contentWindow.postMessage(l,f)}else{a.contentWindow.postMessage(l,f);i()}})};Ce.prototype.postMessageToCurrentIframe=function(e,t){if(t===undefined){t=false}var a=this._getIFrame();if(!a){if(t){return Promise.reject({message:"Expected opened iframe not found."})}return}return this.postMessageToIframe(e,a,t)};Ce.prototype.setNewApplicationContext=function(e,t){var a=this;var r=this["setNew"+e+"ApplicationContext"];if(!r){return Promise.reject({message:"Unsupported application type"})}var n=this._getIFrame();if(!n){return Promise.reject({message:"Expected an existing TR application application frame but found none."})}var o=this.createPostMessageRequest("sap.gui.triggerCloseSessionImmediately",{});return this.postMessageToIframe(o,n,true).then(function(){return r.call(a,t)},function(e){return Promise.reject({eventData:e,message:"Failed to change application context."})})};Ce.prototype.onApplicationOpened=function(e){var t=this.getIsStateful();if(!t){return Promise.resolve()}var a=this.getApplicationType();if(a==="TR"&&e!=="TR"){var r=this._getIFrame();if(!r){return Promise.reject({message:"Expected an exisiting TR application application frame but found none."})}var n=this.createPostMessageRequest("sap.gui.triggerCloseSession",{});return this.postMessageToIframe(n,r,false).catch(function(e){return Promise.reject({eventData:e,message:"Failed to change application context."})})}return Promise.resolve()};Ce.prototype.postMessageRequest=function(e,t){var a=this._getIFrame();if(!a){return Promise.reject({message:"Expected an exisiting TR application application frame but found none."})}var r=this.createPostMessageRequest(e,t||{});return this.postMessageToIframe(r,a,false).catch(function(e){return Promise.reject({eventData:e,message:"Failed to post message."})})};Ce.prototype.sendBeforeAppCloseEvent=function(){var e=this.getBeforeAppCloseEvent&&this.getBeforeAppCloseEvent(),t;if(e&&e.enabled&&e.enabled===true){t=this.createPostMessageRequest("sap.ushell.services.CrossApplicationNavigation.beforeAppCloseEvent",e.params);return this.postMessageToIframe(t,this._getIFrame(),true)}return undefined};Ce.prototype.getDeffedControlCreation=function(e){return this.oDeferredControlCreation?this.oDeferredControlCreation.promise():jQuery.Deferred().resolve().promise()};Ce.prototype._getCommunicationHandlers=q;Ce.prototype._adaptIsUrlSupportedResultForMessagePopover=j;Ce.prototype._getLogoutHandler=k;Ce.prototype._getParameterMap=B;Ce.prototype._getTranslatedText=J;Ce.prototype._createErrorControl=K;Ce.prototype._destroyChild=z;Ce.prototype._createUi5View=G;Ce.prototype._publishExternalEvent=$;Ce.prototype._createUi5Component=Q;Ce.prototype._disableRouter=X;Ce.prototype._createSystemForUrl=Y;Ce.prototype._isTrustedPostMessageSource=Z;Ce.prototype._handleMessageEvent=re;Ce.prototype._logout=ie;Ce.prototype._renderControlInDiv=se;Ce.prototype._checkNwbcUrlAdjustment=pe;Ce.prototype._adjustNwbcUrl=le;Ce.prototype._render=de;Ce.prototype._getParamKeys=ge;Ce.prototype._buildHTMLElements=me;Ce.prototype._buildHTMLForAllPostParams=he;Ce.prototype._generateRootElementForIFrame=ve;Ce.prototype._backButtonPressedCallback=ee;Ce.prototype._getIFrame=te;Ce.prototype._getIFrameUrl=ae;Ce.prototype._filterURLParams=ce;Ce.prototype._resetPluginsLoadIndications=oe;Ce.prototype._handlePostMessagesForPluginsPostLoading=ne;return Ce},true);
//# sourceMappingURL=ApplicationContainer.js.map