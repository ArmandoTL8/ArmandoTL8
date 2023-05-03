/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/ActionRuntime","sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/BusyLocker","sap/fe/core/helpers/DeleteHelper","sap/fe/core/library","sap/fe/macros/field/FieldRuntime","sap/fe/macros/table/TableHelper"],function(e,t,n,o,i,s,a,c){"use strict";const r=s.CreationMode;const l={displayTableSettings:function(e){const t=e.getSource().getParent(),o=sap.ui.getCore().byId(`${t.getId()}-settings`);n.fireButtonPress(o)},executeConditionalActionShortcut:function(e,t){const o=t.getParent();if(e!==r.CreationRow){const t=o.getActions().reduce(function(e,t){return e.concat(t.getAction())},[]).find(function(t){return t.getId().endsWith(e)});n.fireButtonPress(t)}else{const e=o.getAggregation("creationRow");if(e&&e.getApplyEnabled()&&e.getVisible()){e.fireApply()}}},setContexts:function(t,n,i,s,a,c,r){o.lock(t);return l.setContextsAsync(t,n,i,s,a,c,r).then(()=>{e.info("Selections updated")}).catch(t=>{e.error(t)}).finally(()=>{o.unlock(t)})},setContextsAsync:async function(e,n,o,s,a,r,l){try{const n=r?r.split(","):[];const d=JSON.parse(s);const g=a&&a!=="undefined"&&JSON.parse(a);let f=e.getSelectedContexts();const u=[];const p=e.data("displayModePropertyBinding")==="true"&&o!=="undefined";const y=[];const b={};const C={};const h=e.getBindingContext("internal");if(!h){return}f=f.filter(function(e){return!e.isInactive()});const x=Object.assign(h.getObject()||{},{selectedContexts:f,numberOfSelectedContexts:f.length,dynamicActions:b,ibn:C,deleteEnabled:true,deletableContexts:u,unSavedContexts:[],lockedContexts:[],draftsWithNonDeletableActive:[],draftsWithDeletableActive:[],createModeContexts:[],controlId:"",updatableContexts:y,semanticKeyHasDraftIndicator:h.getProperty("semanticKeyHasDraftIndicator")?h.getProperty("semanticKeyHasDraftIndicator"):undefined});for(const e of f){const t=e.getObject();for(const e in t){if(e.indexOf("#")===0){let t=e;t=t.substring(1,t.length);x.dynamicActions[t]={enabled:true};h.setProperty("",x)}}const n=l.length===0||!!e.getProperty(l);const o=!p||t.IsActiveEntity;if(n&&o){y.push(e)}}i.updateDeleteInfoForSelectedContexts(h,f);if(!e.data("enableAnalytics")){c.setIBNEnablement(h,g,f)}if(f.length>1){this.disableAction(n,b)}if(x){x["updatableContexts"]=y;x["controlId"]=e.getId();h.setProperty("",x)}return t.setActionEnablement(h,d,f,"table")}catch(e){throw e}},disableAction:function(e,t){e.forEach(function(e){t[e]={bEnabled:false}})},onFieldChangeInCreationRow:function(e,t){const n=a.getFieldStateOnChange(e),o=n.field,i=o.getId();const s=o.getBindingContext("internal"),c=s.getProperty("creationRowFieldValidity"),r=Object.assign({},c);r[i]=n.state;s.setProperty("creationRowFieldValidity",r);if(t){const e=s.getProperty("creationRowCustomValidity"),t=Object.assign({},e);t[o.getBinding("value").getPath()]={fieldId:o.getId()};s.setProperty("creationRowCustomValidity",t);const n=sap.ui.getCore().getMessageManager();const i=`${o.getBindingContext().getPath()}/${o.getBindingPath("value")}`;n.getMessageModel().getData().forEach(function(e){if(e.target===i){n.removeMessages(e)}})}}};return l},false);
//# sourceMappingURL=TableRuntime.js.map