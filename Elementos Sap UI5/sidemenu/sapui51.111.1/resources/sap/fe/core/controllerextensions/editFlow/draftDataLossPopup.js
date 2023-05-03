/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/controllerextensions/collaboration/ActivitySync","sap/fe/core/controls/DataLossOrDraftDiscard/DataLossOrDraftDiscardHandler","sap/fe/core/helpers/EditState"],function(t,e,a,i){"use strict";var n;(function(t){t["BackNavigation"]="BackNavigation";t["ForwardNavigation"]="ForwardNavigation"})(n||(n={}));function o(t){var e,a;let i=false;const n=t.getAppComponent().getManifest();i=(n===null||n===void 0?void 0:(e=n["sap.fe"])===null||e===void 0?void 0:(a=e.app)===null||a===void 0?void 0:a.silentlyKeepDraftOnForwardNavigation)||false;return i}async function r(t,e,i,n,o){if(t.CreationDateTime!==t.LastChangeDateTime){a.performAfterDiscardorKeepDraft(n,e,i,o)}else{n()}}async function s(e,o,r,s,c,l,f){if(i.isEditStateDirty()){if(e.CreationDateTime===e.LastChangeDateTime&&c===n.BackNavigation){try{await a.discardDraft(r,f);s()}catch(e){t.error("Error while canceling the document",e)}}else if(c===n.ForwardNavigation&&l){s()}else{a.performAfterDiscardorKeepDraft(s,o,r,f)}}else{s()}}async function c(e,a,i,o){if(o===n.BackNavigation){const n={skipDiscardPopover:true};try{await e.editFlow.cancelDocument(a,n);i()}catch(e){t.error("Error while canceling the document",e)}}else{i()}}async function l(t,e,i,o,r,s){if(o===n.ForwardNavigation&&r){i()}else{a.performAfterDiscardorKeepDraft(i,e,t,s)}}async function f(t,a,f,d,g,p){let D=arguments.length>6&&arguments[6]!==undefined?arguments[6]:n.BackNavigation;const v=e.isConnected(g.getView());const u=!v?a:function(){e.disconnect(g.getView());for(var t=arguments.length,i=new Array(t),n=0;n<t;n++){i[n]=arguments[n]}a.apply(null,...i)};const y=o(g);if(t){if(g.getAppComponent().getRootViewController().isFclEnabled()){await r(t,f,g,u,p)}else if(!d.getObject().HasActiveEntity){s(t,f,g,u,D,y,p)}else if(t.CreationDateTime===t.LastChangeDateTime){c(g,d,u,D)}else if(i.isEditStateDirty()){l(g,f,u,D,y,p)}else{u()}}else{a()}}async function d(e,a,i,o,r){let s=arguments.length>5&&arguments[5]!==undefined?arguments[5]:n.BackNavigation;const c=o.getView();const l=i.getModel();const d=l.getMetaModel();const g=c.getViewData().entitySet??"";const p=g&&d.getObject("/"+g+"@com.sap.vocabularies.Common.v1.DraftRoot");const D=c.getModel("ui");const v=D.getProperty("/isEditable");const u=l.bindContext(`${i.getPath()}/DraftAdministrativeData`).getBoundContext();if(i&&i.getObject()&&(!p&&s===n.BackNavigation||!v)){e()}else{try{const t=await u.requestObject();await f(t,e,a,i,o,r,s)}catch(e){t.error("Cannot retrieve draftDataContext information",e)}}}const g={processDataLossOrDraftDiscardConfirmation:d,silentlyKeepDraftOnForwardNavigation:o,NavigationType:n,processFclMode:r,processNoActiveEntityMode:s,processEditingDraftForExistingEntity:c,processEditStateDirty:l};return g},false);
//# sourceMappingURL=draftDataLossPopup.js.map