/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/helpers/SideEffectsHelper","sap/ui/core/mvc/ControllerExtension","../CommonUtils","../helpers/ClassSupport"],function(e,t,i,r,o){"use strict";var s,n,d,f,c,p,a,l,u,g,y,E,h,F,S,v,_,m,O,G,P,b,x,C,w,j,M,I,D,T,q,R,A,$,V,B,Q,k,z,N;var U=o.publicExtension;var H=o.privateExtension;var L=o.methodOverride;var W=o.finalExtension;var J=o.defineUI5Class;function K(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;X(e,t)}function X(e,t){X=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return X(e,t)}function Y(e,t,i,r,o){var s={};Object.keys(r).forEach(function(e){s[e]=r[e]});s.enumerable=!!s.enumerable;s.configurable=!!s.configurable;if("value"in s||s.initializer){s.writable=true}s=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},s);if(o&&s.initializer!==void 0){s.value=s.initializer?s.initializer.call(o):void 0;s.initializer=undefined}if(s.initializer===void 0){Object.defineProperty(e,t,s);s=null}return s}let Z=(s=J("sap.fe.core.controllerextensions.SideEffects"),n=L(),d=U(),f=W(),c=U(),p=W(),a=U(),l=W(),u=U(),g=W(),y=U(),E=W(),h=U(),F=W(),S=U(),v=W(),_=U(),m=W(),O=U(),G=W(),P=U(),b=W(),x=U(),C=W(),w=U(),j=W(),M=H(),I=W(),D=U(),T=W(),q=H(),R=W(),A=H(),$=W(),V=H(),B=W(),Q=U(),k=W(),s(z=(N=function(i){K(o,i);function o(){return i.apply(this,arguments)||this}var s=o.prototype;s.onInit=function e(){this._view=this.base.getView();this._sideEffectsService=r.getAppComponent(this._view).getSideEffectsService();this._registeredFieldGroupMap={};this._fieldGroupInvalidity={};this._registeredFailedSideEffects={}};s.addControlSideEffects=function e(t,i){this._sideEffectsService.addControlSideEffects(t,i)};s.removeControlSideEffects=function e(t){var i;const r=((i=t.isA)===null||i===void 0?void 0:i.call(t,"sap.ui.base.ManagedObject"))&&t.getId();if(r){this._sideEffectsService.removeControlSideEffects(r)}};s.getContextForSideEffects=function e(t,i){let r=t,o=this._sideEffectsService.getEntityTypeFromContext(t);if(i!==o){r=t.getBinding().getContext();if(r){o=this._sideEffectsService.getEntityTypeFromContext(r);if(i!==o){r=r.getBinding().getContext();if(r){o=this._sideEffectsService.getEntityTypeFromContext(r);if(i!==o){return undefined}}}}}return r||undefined};s.getFieldSideEffectsMap=function e(t){let i={};const r=t.getFieldGroupIds(),o=this._view.getViewData().entitySet,s=this._sideEffectsService.getConvertedMetaModel().entitySets.find(e=>e.name===o);i=this.getSideEffectsMapForFieldGroups(r,t);if(o&&s){const e=s.entityType.fullyQualifiedName,r=this.getTargetProperty(t),o=this.getContextForSideEffects(t.getBindingContext(),e);if(r&&o){const t=this._sideEffectsService.getControlEntitySideEffects(e);Object.keys(t).forEach(s=>{const n=t[s];if(n.SourceProperties.includes(r)){const t=`${s}::${e}`;i[t]={name:t,immediate:true,sideEffects:n,context:o}}})}}return i};s.getSideEffectsMapForFieldGroups=function e(t,i){const r={};t.forEach(e=>{const{name:t,immediate:o,sideEffects:s,sideEffectEntityType:n}=this._getSideEffectsPropertyForFieldGroup(e);const d=i?this.getContextForSideEffects(i.getBindingContext(),n):undefined;if(s&&(!i||i&&d)){r[t]={name:t,immediate:o,sideEffects:s};if(i){r[t].context=d}}});return r};s.clearFieldGroupsValidity=function e(){this._fieldGroupInvalidity={}};s.isFieldGroupValid=function e(t,i){const r=this._getFieldGroupIndex(t,i);return Object.keys(this._fieldGroupInvalidity[r]??{}).length===0};s.getTargetProperty=function e(t){var i;const r=t.data("sourcePath");const o=this._view.getModel().getMetaModel();const s=(i=this._view.getBindingContext())===null||i===void 0?void 0:i.getPath();const n=s?`${o.getMetaPath(s)}/`:"";return r===null||r===void 0?void 0:r.replace(n,"")};s.handleFieldChange=async function t(i,r,o){const s=i.getSource();this._saveFieldPropertiesStatus(s,r);if(!r){return}try{await(i.getParameter("promise")??Promise.resolve())}catch(t){e.debug("Prerequisites on Field for the SideEffects have been rejected",t);return}return this._manageSideEffectsFromField(s,o??Promise.resolve())};s.handleFieldGroupChange=function t(i){const r=i.getSource(),o=i.getParameter("fieldGroupIds"),s=o.reduce((e,t)=>e.concat(this.getRegisteredSideEffectsForFieldGroup(t)),[]);return Promise.all(s.map(e=>this._requestFieldGroupSideEffects(e))).catch(t=>{var i;const o=(i=r.getBindingContext())===null||i===void 0?void 0:i.getPath();e.debug(`Error while processing FieldGroup SideEffects on context ${o}`,t)})};s.requestSideEffects=async function e(t,i,r,o){let s,n;if(o){const e=await o(t);s=e["aTargets"];n=e["TriggerAction"]}else{s=[...t.TargetEntities??[],...t.TargetProperties??[]];n=t.TriggerAction}if(n){this._sideEffectsService.executeAction(n,i,r)}if(s.length){return this._sideEffectsService.requestSideEffects(s,i,r).catch(e=>{this.registerFailedSideEffects(t,i);throw e})}};s.getRegisteredFailedRequests=function e(){return this._registeredFailedSideEffects};s.registerFailedSideEffects=function e(t,i){const r=i.getPath();this._registeredFailedSideEffects[r]=this._registeredFailedSideEffects[r]??[];const o=this._registeredFailedSideEffects[r].every(e=>t.fullyQualifiedName!==e.fullyQualifiedName);if(o){this._registeredFailedSideEffects[r].push(t)}};s.unregisterFailedSideEffectsForAContext=function e(t){delete this._registeredFailedSideEffects[t]};s.unregisterFailedSideEffects=function e(t,i){var r;const o=i.getPath();if((r=this._registeredFailedSideEffects[o])!==null&&r!==void 0&&r.length){this._registeredFailedSideEffects[o]=this._registeredFailedSideEffects[o].filter(e=>e.fullyQualifiedName!==t)}};s.registerFieldGroupSideEffects=function e(t,i){const r=this._getFieldGroupIndex(t.name,t.context);if(!this._registeredFieldGroupMap[r]){this._registeredFieldGroupMap[r]={promise:i??Promise.resolve(),sideEffectProperty:t}}};s.unregisterFieldGroupSideEffects=function e(t){const{context:i,name:r}=t;const o=this._getFieldGroupIndex(r,i);delete this._registeredFieldGroupMap[o]};s.getRegisteredSideEffectsForFieldGroup=function e(t){const i=[];for(const e of Object.keys(this._registeredFieldGroupMap)){if(e.startsWith(`${t}_`)){i.push(this._registeredFieldGroupMap[e])}}return i};s._getFieldGroupIndex=function e(t,i){return`${t}_${i.getPath()}`};s._getSideEffectsPropertyForFieldGroup=function e(i){var r;const o=i.indexOf(t.IMMEDIATE_REQUEST)!==-1,s=i.replace(t.IMMEDIATE_REQUEST,""),n=s.split("#"),d=n[0],f=`${d}@com.sap.vocabularies.Common.v1.SideEffects${n.length===2?`#${n[1]}`:""}`,c=(r=this._sideEffectsService.getODataEntitySideEffects(d))===null||r===void 0?void 0:r[f];return{name:s,immediate:o,sideEffects:c,sideEffectEntityType:d}};s._manageSideEffectsFromField=async function t(i,r){const o=this.getFieldSideEffectsMap(i);try{const e=[];const t=Object.keys(o).map(e=>{const t=o[e];if(t.immediate===true){this.unregisterFailedSideEffects(t.sideEffects.fullyQualifiedName,t.context);return this.requestSideEffects(t.sideEffects,t.context)}return this.registerFieldGroupSideEffects(t,r)});for(const t of[i.getBindingContext(),this._view.getBindingContext()]){if(t){const i=t.getPath();const r=this._registeredFailedSideEffects[i]??[];this.unregisterFailedSideEffectsForAContext(i);for(const i of r){e.push(this.requestSideEffects(i,t))}}}await Promise.all(t.concat(e))}catch(t){e.debug(`Error while managing Field SideEffects`,t)}};s._requestFieldGroupSideEffects=async function t(i){this.unregisterFieldGroupSideEffects(i.sideEffectProperty);try{await i.promise}catch(t){e.debug(`Error while processing FieldGroup SideEffects`,t);return}try{const{sideEffects:e,context:t,name:r}=i.sideEffectProperty;if(this.isFieldGroupValid(r,t)){await this.requestSideEffects(e,t)}}catch(t){e.debug(`Error while executing FieldGroup SideEffects`,t)}};s._saveFieldPropertiesStatus=function e(t,i){const r=this.getFieldSideEffectsMap(t);Object.keys(r).forEach(e=>{const{name:o,immediate:s,context:n}=r[e];if(!s){const e=this._getFieldGroupIndex(o,n);if(i){var d;(d=this._fieldGroupInvalidity[e])===null||d===void 0?true:delete d[t.getId()]}else{this._fieldGroupInvalidity[e]={...this._fieldGroupInvalidity[e],...{[t.getId()]:true}}}}})};return o}(i),Y(N.prototype,"onInit",[n],Object.getOwnPropertyDescriptor(N.prototype,"onInit"),N.prototype),Y(N.prototype,"addControlSideEffects",[d,f],Object.getOwnPropertyDescriptor(N.prototype,"addControlSideEffects"),N.prototype),Y(N.prototype,"removeControlSideEffects",[c,p],Object.getOwnPropertyDescriptor(N.prototype,"removeControlSideEffects"),N.prototype),Y(N.prototype,"getContextForSideEffects",[a,l],Object.getOwnPropertyDescriptor(N.prototype,"getContextForSideEffects"),N.prototype),Y(N.prototype,"getFieldSideEffectsMap",[u,g],Object.getOwnPropertyDescriptor(N.prototype,"getFieldSideEffectsMap"),N.prototype),Y(N.prototype,"getSideEffectsMapForFieldGroups",[y,E],Object.getOwnPropertyDescriptor(N.prototype,"getSideEffectsMapForFieldGroups"),N.prototype),Y(N.prototype,"clearFieldGroupsValidity",[h,F],Object.getOwnPropertyDescriptor(N.prototype,"clearFieldGroupsValidity"),N.prototype),Y(N.prototype,"isFieldGroupValid",[S,v],Object.getOwnPropertyDescriptor(N.prototype,"isFieldGroupValid"),N.prototype),Y(N.prototype,"getTargetProperty",[_,m],Object.getOwnPropertyDescriptor(N.prototype,"getTargetProperty"),N.prototype),Y(N.prototype,"handleFieldChange",[O,G],Object.getOwnPropertyDescriptor(N.prototype,"handleFieldChange"),N.prototype),Y(N.prototype,"handleFieldGroupChange",[P,b],Object.getOwnPropertyDescriptor(N.prototype,"handleFieldGroupChange"),N.prototype),Y(N.prototype,"requestSideEffects",[x,C],Object.getOwnPropertyDescriptor(N.prototype,"requestSideEffects"),N.prototype),Y(N.prototype,"getRegisteredFailedRequests",[w,j],Object.getOwnPropertyDescriptor(N.prototype,"getRegisteredFailedRequests"),N.prototype),Y(N.prototype,"registerFailedSideEffects",[M,I],Object.getOwnPropertyDescriptor(N.prototype,"registerFailedSideEffects"),N.prototype),Y(N.prototype,"unregisterFailedSideEffectsForAContext",[D,T],Object.getOwnPropertyDescriptor(N.prototype,"unregisterFailedSideEffectsForAContext"),N.prototype),Y(N.prototype,"unregisterFailedSideEffects",[q,R],Object.getOwnPropertyDescriptor(N.prototype,"unregisterFailedSideEffects"),N.prototype),Y(N.prototype,"registerFieldGroupSideEffects",[A,$],Object.getOwnPropertyDescriptor(N.prototype,"registerFieldGroupSideEffects"),N.prototype),Y(N.prototype,"unregisterFieldGroupSideEffects",[V,B],Object.getOwnPropertyDescriptor(N.prototype,"unregisterFieldGroupSideEffects"),N.prototype),Y(N.prototype,"getRegisteredSideEffectsForFieldGroup",[Q,k],Object.getOwnPropertyDescriptor(N.prototype,"getRegisteredSideEffectsForFieldGroup"),N.prototype),N))||z);return Z},false);
//# sourceMappingURL=SideEffects.js.map