/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/AppStateHandler","sap/fe/core/controllerextensions/routing/RouterProxy","sap/fe/core/helpers/ClassSupport","sap/fe/core/helpers/ModelHelper","sap/fe/core/library","sap/fe/core/manifestMerger/ChangePageConfiguration","sap/fe/core/support/Diagnostics","sap/ui/core/Core","sap/ui/core/UIComponent","sap/ui/model/json/JSONModel","./converters/MetaModelConverter","./helpers/SemanticDateOperators"],function(e,t,o,i,r,n,a,s,u,c,l,p,f){"use strict";var d,g,v;var C=p.deleteModelCacheData;var R=a.changeConfiguration;var h=i.defineUI5Class;function N(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;S(e,t)}function S(e,t){S=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,o){t.__proto__=o;return t};return S(e,t)}const A=n.StartupMode;const E={FCL:{VIEWNAME:"sap.fe.core.rootView.Fcl",VIEWNAME_COMPATIBILITY:"sap.fe.templates.RootContainer.view.Fcl",ROUTERCLASS:"sap.f.routing.Router"},NAVCONTAINER:{VIEWNAME:"sap.fe.core.rootView.NavContainer",VIEWNAME_COMPATIBILITY:"sap.fe.templates.RootContainer.view.NavContainer",ROUTERCLASS:"sap.m.routing.Router"}};let M=(d=h("sap.fe.core.AppComponent",{interfaces:["sap.ui.core.IAsyncContentCreation"],config:{fullWidth:true},manifest:{"sap.ui5":{services:{resourceModel:{factoryName:"sap.fe.core.services.ResourceModelService",startup:"waitFor",settings:{bundles:["sap.fe.core.messagebundle"],modelName:"sap.fe.i18n"}},routingService:{factoryName:"sap.fe.core.services.RoutingService",startup:"waitFor"},shellServices:{factoryName:"sap.fe.core.services.ShellServices",startup:"waitFor"},ShellUIService:{factoryName:"sap.ushell.ui5service.ShellUIService"},navigationService:{factoryName:"sap.fe.core.services.NavigationService",startup:"waitFor"},environmentCapabilities:{factoryName:"sap.fe.core.services.EnvironmentService",startup:"waitFor"},sideEffectsService:{factoryName:"sap.fe.core.services.SideEffectsService",startup:"waitFor"},asyncComponentService:{factoryName:"sap.fe.core.services.AsyncComponentService",startup:"waitFor"}},rootView:{viewName:E.NAVCONTAINER.VIEWNAME,type:"XML",async:true,id:"appRootView"},routing:{config:{controlId:"appContent",routerClass:E.NAVCONTAINER.ROUTERCLASS,viewType:"XML",controlAggregation:"pages",async:true,containerOptions:{propagateModel:true}}}}},designtime:"sap/fe/core/designtime/AppComponent.designtime",library:"sap.fe.core"}),d(g=(v=function(i){N(a,i);function a(){var e;for(var t=arguments.length,o=new Array(t),r=0;r<t;r++){o[r]=arguments[r]}e=i.call(this,...o)||this;e.startupMode=A.Normal;return e}var c=a.prototype;c._isFclEnabled=function e(){var t,o;const i=this.getManifestEntry("sap.ui5");return(i===null||i===void 0?void 0:(t=i.routing)===null||t===void 0?void 0:(o=t.config)===null||o===void 0?void 0:o.routerClass)===E.FCL.ROUTERCLASS};c.initializeFeatureToggles=function e(){};c.changePageConfiguration=function e(t,o,i){R(this.getManifest(),t,o,i)};c.getRouterProxy=function e(){return this._oRouterProxy};c.getAppStateHandler=function e(){return this._oAppStateHandler};c.getRootViewController=function e(){return this.getRootControl().getController()};c.getRootContainer=function e(){return this.getRootControl().getContent()[0]};c.getStartupMode=function e(){return this.startupMode};c.setStartupModeCreate=function e(){this.startupMode=A.Create};c.setStartupModeAutoCreate=function e(){this.startupMode=A.AutoCreate};c.setStartupModeDeeplink=function e(){this.startupMode=A.Deeplink};c.init=function u(){var c,p;this.initializeFeatureToggles();const d=new l({editMode:n.EditMode.Display,isEditable:false,draftStatus:n.DraftStatus.Clear,busy:false,busyLocal:{},pages:{}});const g=new l({pages:{}});d.setDefaultBindingMode("OneWay");r.enhanceUiJSONModel(d,n);r.enhanceInternalJSONModel(g);this.setModel(d,"ui");this.setModel(g,"internal");this.bInitializeRouting=this.bInitializeRouting!==undefined?this.bInitializeRouting:true;this._oRouterProxy=new o;this._oAppStateHandler=new t(this);this._oDiagnostics=new s;const v=this.getModel();if(v!==null&&v!==void 0&&(c=v.isA)!==null&&c!==void 0&&c.call(v,"sap.ui.model.odata.v4.ODataModel")){this.entityContainer=v.getMetaModel().requestObject("/$EntityContainer/")}else{this.entityContainer=Promise.resolve()}const C=this.getManifest()["sap.ui5"];if(C!==null&&C!==void 0&&(p=C.rootView)!==null&&p!==void 0&&p.viewName){var R,h,N,S,A,M;if(C.rootView.viewName===E.FCL.VIEWNAME_COMPATIBILITY){C.rootView.viewName=E.FCL.VIEWNAME}else if(C.rootView.viewName===E.NAVCONTAINER.VIEWNAME_COMPATIBILITY){C.rootView.viewName=E.NAVCONTAINER.VIEWNAME}if(C.rootView.viewName===E.FCL.VIEWNAME&&((R=C.routing)===null||R===void 0?void 0:(h=R.config)===null||h===void 0?void 0:h.routerClass)===E.FCL.ROUTERCLASS){e.info(`Rootcontainer: "${E.FCL.VIEWNAME}" - Routerclass: "${E.FCL.ROUTERCLASS}"`)}else if(C.rootView.viewName===E.NAVCONTAINER.VIEWNAME&&((N=C.routing)===null||N===void 0?void 0:(S=N.config)===null||S===void 0?void 0:S.routerClass)===E.NAVCONTAINER.ROUTERCLASS){e.info(`Rootcontainer: "${E.NAVCONTAINER.VIEWNAME}" - Routerclass: "${E.NAVCONTAINER.ROUTERCLASS}"`)}else if(((A=C.rootView)===null||A===void 0?void 0:(M=A.viewName)===null||M===void 0?void 0:M.indexOf("sap.fe.core.rootView"))!==-1){var w,I;throw Error(`\nWrong configuration for the couple (rootView/routerClass) in manifest file.\n`+`Current values are :(${C.rootView.viewName}/${(w=C.routing)===null||w===void 0?void 0:(I=w.config)===null||I===void 0?void 0:I.routerClass})\n`+`Expected values are \n`+`\t - (${E.NAVCONTAINER.VIEWNAME}/${E.NAVCONTAINER.ROUTERCLASS})\n`+`\t - (${E.FCL.VIEWNAME}/${E.FCL.ROUTERCLASS})`)}else{e.info(`Rootcontainer: "${C.rootView.viewName}" - Routerclass: "${E.NAVCONTAINER.ROUTERCLASS}"`)}}f.addSemanticDateOperators();i.prototype.init.call(this);a.instanceMap[this.getId()]=this};c.onServicesStarted=function t(){const o=()=>{this.entityContainer.then(()=>{if(this.getRootViewController().attachRouteMatchers){this.getRootViewController().attachRouteMatchers()}this.getRouter().initialize();this.getRouterProxy().init(this,this._isFclEnabled())}).catch(e=>{const t=u.getLibraryResourceBundle("sap.fe.core");this.getRootViewController().displayErrorPage(t.getText("C_APP_COMPONENT_SAPFE_APPSTART_TECHNICAL_ISSUES"),{title:t.getText("C_COMMON_SAPFE_ERROR"),description:e.message,FCLLevel:0})})};if(this.bInitializeRouting){return this.getRoutingService().initializeRouting().then(()=>{if(this.getRootViewController()){return o()}else{this.getRootControl().attachAfterInit(function(){o()})}}).catch(function(t){e.error(`cannot cannot initialize routing: ${t}`)})}};c.exit=function e(){this._oAppStateHandler.destroy();this._oRouterProxy.destroy();delete this._oAppStateHandler;delete this._oRouterProxy;C(this.getMetaModel());this.getModel("ui").destroy()};c.getMetaModel=function e(){return this.getModel().getMetaModel()};c.getDiagnostics=function e(){return this._oDiagnostics};c.destroy=function t(o){var r;try{delete a.instanceMap[this.getId()];delete window._routing}catch(t){e.info(t)}const n=this.oModels[undefined];let s;if(n.oRequestor){s=jQuery.extend({},n.oRequestor.mHeaders)}(r=this.getRoutingService())===null||r===void 0?void 0:r.beforeExit();i.prototype.destroy.call(this,o);if(s&&n.oRequestor){n.oRequestor.mHeaders=s}};c.getRoutingService=function e(){return{}};c.getShellServices=function e(){return{}};c.getNavigationService=function e(){return{}};c.getSideEffectsService=function e(){return{}};c.getEnvironmentCapabilities=function e(){return{}};c.getStartupParameters=async function e(){const t=this.getComponentData();return Promise.resolve(t&&t.startupParameters||{})};c.restore=function e(){this.getRootViewController().viewState.onRestore()};c.suspend=function e(){this.getRootViewController().viewState.onSuspend()};return a}(c),v.instanceMap={},v))||g);return M},false);
//# sourceMappingURL=AppComponent.js.map