/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/Utils","sap/ui/rta/appVariant/AppVariantUtils","sap/ui/core/BusyIndicator","sap/base/util/UriParameters","sap/ui/fl/registry/Settings","sap/ui/fl/write/_internal/appVariant/AppVariantFactory","sap/ui/fl/write/api/FeaturesAPI","sap/base/util/merge"],function(e,n,r,i,t,a,s,o){"use strict";var u;var c;var p;var l;var f;var v=function(){return e.getAppDescriptor(p)};var h=function(){return t.getInstance()};var d=function(){window.onbeforeunload=f};var g=function(e){var r=e?"MSG_DO_NOT_CLOSE_BROWSER_CURRENTLY_ADAPTING":"MSG_DO_NOT_CLOSE_BROWSER";f=window.onbeforeunload;window.onbeforeunload=n.handleBeforeUnloadEvent;return n.showMessage(r)};var A=function(e,n){return c.triggerCatalogPublishing(e,n,true)};var w=function(e){return c.triggerCatalogPublishing(e,null,false)};var b=function(e,i){if(u){n.closeOverviewDialog();return this.onGetOverview(true,i)}else if(!u&&e){r.hide();return this.onGetOverview(true,i)}return Promise.resolve()};var S=function(e,r,i){return e?n.navigateToFLPHomepage():b.call(this,!r,i)};var m=function(e,n){if(e&&e.response&&e.response.IAMId){return c.notifyKeyUserWhenPublishingIsReady(e.response.IAMId,n,true)}return Promise.resolve()};var I=function(e,n){if(e&&e.response&&e.response.IAMId&&e.response.inProgress){return c.notifyKeyUserWhenPublishingIsReady(e.response.IAMId,n,false)}return Promise.resolve()};sap.ui.getCore().getEventBus().subscribe("sap.ui.rta.appVariant.manageApps.controller.ManageApps","navigate",function(){if(u){u.destroy();u=null}});return{onGetOverview:function(e,r){var i=v();return new Promise(function(t){var a=function(){n.closeOverviewDialog()};var s="sap/ui/rta/appVariant/AppVariantOverviewDialog";var o={idRunningApp:i["sap.app"].id,isOverviewForKeyUser:e,layer:r};sap.ui.require([s],function(e){if(!u){u=new e(o)}u.attachCancel(a);u.oPopup.attachOpened(function(){t(u)});u.open()})})},isOverviewExtended:function(){var e=i.fromQuery(window.location.search);var n=e.get("sap-ui-xx-app-variant-overview-extended");if(!n){return false}return n.toLowerCase()==="true"},isManifestSupported:function(){var e=v();return n.getManifirstSupport(e["sap.app"].id)},isSaveAsAvailable:function(e,r,i){p=e;l=i;var t=v();if(t["sap.app"]&&t["sap.app"].id){return s.isSaveAsAvailable(r).then(function(e){if(e){if(t["sap.app"].crossNavigation&&t["sap.app"].crossNavigation.inbounds){return n.getInboundInfo(t["sap.app"].crossNavigation.inbounds)}return n.getInboundInfo()}return undefined}).then(function(e){return!!e})}return Promise.resolve(false)},getAppVariantDescriptor:function(e){p=e;var n=v();if(n["sap.app"]&&n["sap.app"].id){return a.load({id:n["sap.app"].id})}return Promise.resolve(false)},_determineSelector:function(e,n){return e?p:{appId:n["sap.app"].id,appVersion:n["sap.app"].applicationVersion.version}},onSaveAs:function(i,t,a,s){var u;var p;var f=v();var w=true;if(s&&s["sap.app"].id===f["sap.app"].id){t=true;f=o({},s);s=null}else if(s){w=false;f=o({},s);s=null}var b=this._determineSelector(w,f);return new Promise(function(s){var v=function(){return c.processSaveAsDialog(f,i)};var w=function(e){r.show();return c.createAllInlineChanges(e,b)};var I=function(e){var r=e.slice();return n.addChangesToPersistence(r,b)};var P=function(){var e=n.getNewAppVariantId();return c.createAppVariant(e,b).catch(function(r){var i=r.messageKey;if(!i){i="MSG_SAVE_APP_VARIANT_FAILED"}return n.catchErrorDialog(r,i,e)})};var O=function(e){p=null;p=o({},e.response);return c.clearRTACommandStack(t)};var _=function(){var n=e.getUshellContainer();if(n&&t){n.setDirtyFlag(false)}};var D=function(e){_();u=n.isS4HanaCloud(e);var r=n.buildSuccessInfo(p.id,i,u);return c.showSuccessMessage(r)};var V=function(){var e=n.buildFinalSuccessInfoS4HANACloud();return c.showSuccessMessage(e)};var y=function(){r.show();if(u){var e;return g().then(function(){return A(p.id,p.reference)}).then(function(n){e=Object.assign({},n);r.hide();return S.call(this,i,null,a)}.bind(this)).then(function(){return m(e,p.id)}).then(function(){d();return V()}).then(function(){return i?s():S.call(this,i,u,a)}.bind(this))}r.hide();return S.call(this,i,u,a)};sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"],function(e){if(!c){c=new e({commandSerializer:l,layer:a})}return v().then(w).then(I).then(P).then(O).then(h).then(D).then(y.bind(this)).then(s).catch(function(e){if(!e){return false}if(u){d()}return S.call(this,null,u,a).then(s)}.bind(this))}.bind(this))}.bind(this))},onDeleteFromOverviewDialog:function(e,i,t){var a;return new Promise(function(s){sap.ui.require(["sap/ui/rta/appVariant/AppVariantManager"],function(o){if(!c){c=new o({rootControl:p,commandSerializer:l,layer:t})}var u=function(){return c.deleteAppVariant(e).catch(function(r){if(r==="cancel"){return Promise.reject("cancel")}var i=r.messageKey;if(!i){i="MSG_DELETE_APP_VARIANT_FAILED"}return n.catchErrorDialog(r,i,e)})};var f=function(){n.closeOverviewDialog();var r=n.buildDeleteSuccessMessage(e,a);return c.showSuccessMessage(r)};var v=function(s){a=n.isS4HanaCloud(s);if(a){var o;return g(i).then(function(){return w(e)}).then(function(e){o=Object.assign({},e);return b.call(this,!i,t)}.bind(this)).then(function(){return I(o,e)})}r.show();return Promise.resolve()};var A=function(){if(a){d()}r.hide();return i?s():b.call(this,!a,a,t).then(s)};if(i){n.closeOverviewDialog();n.navigateToFLPHomepage()}return h().then(v.bind(this)).then(u).then(f).then(A.bind(this)).catch(function(e){if(e==="cancel"){return false}if(a){d()}return b.call(this,null,a,t).then(s)}.bind(this))}.bind(this))}.bind(this))}}});
//# sourceMappingURL=Feature.js.map