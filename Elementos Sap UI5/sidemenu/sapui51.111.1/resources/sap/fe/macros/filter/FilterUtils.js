/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/base/util/deepClone","sap/base/util/merge","sap/fe/core/CommonUtils","sap/fe/core/converters/controls/ListReport/FilterBar","sap/fe/core/converters/ConverterContext","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/SemanticDateOperators","sap/fe/core/templating/DisplayModeFormatter","sap/fe/macros/CommonHelper","sap/fe/macros/DelegateUtil","sap/fe/macros/filter/DraftEditState","sap/fe/macros/ODataMetaModelUtil","sap/ui/core/Core","sap/ui/mdc/condition/Condition","sap/ui/mdc/condition/ConditionConverter","sap/ui/mdc/enum/ConditionValidated","sap/ui/mdc/odata/v4/TypeUtil","sap/ui/mdc/p13n/StateUtil","sap/ui/mdc/util/FilterUtil","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/odata/v4/ODataUtils"],function(t,e,n,i,o,a,r,s,l,c,f,d,g,u,p,y,h,C,m,F,v,T,P,S){"use strict";var b=c.ODATA_TYPE_MAPPING;const M={getFilter:function(t){const e=M.getFilterInfo(t).filters;return e.length?new T(M.getFilterInfo(t).filters,false):undefined},getFilterField:function(t,e,n){return o.getFilterField(t,e,n)},buildProperyInfo:function(t,e){let n;const i={};const a=e.getConverterContextFor(t.annotationPath);const r=a.getDataModelObjectPath().targetObject;const s=o.fetchTypeConfig(r);n=o.fetchPropertyInfo(e,t,s);i[t.key]=s;n=o.assignDataTypeToPropertyInfo(n,e,[],i);return n},createConverterContext:function(t,e,o,s){const l=d.getCustomData(t,"entityType"),c=e||l;const f=t.isA?i.getTargetView(t):null;const g=o||t.getModel().getMetaModel();const u=s||f&&i.getAppComponent(f);const p=r.getInvolvedDataModelObjects(g.createBindingContext(c));let y;if(t.isA&&!t.isA("sap.ui.mdc.filterbar.vh.FilterBar")){y=f&&f.getViewData()||{}}return a.createConverterContextForMacro(p.startingEntitySet.name,g,u===null||u===void 0?void 0:u.getDiagnostics(),n,p.contextLocation,y)},getConvertedFilterFields:function(t,e,n,i,o,a,r){const s=this._getFilterMetaModel(t,i);const l=d.getCustomData(t,"entityType"),c=e||l;const f=this._getFieldsForTable(t,e);const g=this.createConverterContext(t,e,i,o);return this._getSelectionFields(t,e,l,c,f,s,g,n,a,r)},getBindingPathForParameters:function(t,e,i,o){const a=[];i=M.setTypeConfigToProperties(i);for(let r=0;r<o.length;r++){const s=o[r];if(e[s]&&e[s].length>0){const o=n({},e[s][0]);const r=v.getPropertyByKey(i,s);const l=r.typeConfig||m.getTypeConfig(r.dataType,r.formatOptions,r.constraints);const c=h.toType(o,l,t.getTypeUtil());const f=b[l.className];a.push(`${s}=${encodeURIComponent(S.formatLiteral(c.values[0],f))}`)}}const r=t.data("entityType");const s=r.substring(0,r.length-1);const l=s.slice(0,s.lastIndexOf("/"));const c=s.substring(s.lastIndexOf("/")+1);return`${l}(${a.toString()})/${c}`},getEditStateIsHideDraft:function(t){let e=false;if(t&&t.$editState){const n=t.$editState.find(function(t){return t.operator==="DRAFT_EDIT_STATE"});if(n&&(n.values.includes("ALL_HIDING_DRAFTS")||n.values.includes("SAVED_ONLY"))){e=true}}return e},getFilterInfo:function(t,e,n){let i=e&&e.ignoredProperties||[];const o=e&&e.targetControl,a=o?o.data("entityType"):undefined;let r=t,s,l=[],c,f=e&&e.propertiesMetadata;if(typeof t==="string"){r=p.byId(t)}if(r){s=this._getSearchField(r,i);const t=this._getFilterConditions(e,n,r);let o=r.getPropertyInfoSet?r.getPropertyInfoSet():null;o=this._getFilterPropertiesMetadata(o,r);if(e&&e.targetControl&&e.targetControl.isA("sap.ui.mdc.Chart")){Object.keys(t).forEach(function(e){if(e==="$editState"){delete t["$editState"]}})}let d=r.data("parameters")||[];d=typeof d==="string"?JSON.parse(d):d;if(d&&d.length>0){c=M.getBindingPathForParameters(r,t,o,d)}if(t){if(a&&r.data("entityType")!==a){const t=r.getModel().getMetaModel();const e=r.getControlDelegate().fetchPropertiesForEntity(a,t,r);f=e;const n={};for(const t in e){const i=e[t];n[i.name]={hasProperty:true,dataType:i.dataType}}const s=this._getIgnoredProperties(o,n);if(s.length>0){i=i.concat(s)}}else if(!f){f=o}const e=v.getFilterInfo(r,t,M.setTypeConfigToProperties(f),i.concat(d)).filters;l=e?[e]:[]}}return{filters:l,search:s||undefined,bindingPath:c}},setTypeConfigToProperties:function(t){if(t&&t.length){t.forEach(function(t){if(t.typeConfig&&t.typeConfig.typeInstance&&t.typeConfig.typeInstance.getConstraints instanceof Function){return}if(t.path==="$editState"){t.typeConfig=m.getTypeConfig("sap.ui.model.odata.type.String",{},{})}else if(t.path==="$search"){t.typeConfig=m.getTypeConfig("sap.ui.model.odata.type.String",{},{})}else if(t.dataType||t.typeConfig&&t.typeConfig.className){t.typeConfig=m.getTypeConfig(t.dataType||t.typeConfig.className,t.formatOptions,t.constraints)}})}return t},getNotApplicableFilters:function(t,e){const n=e.data("entityType"),i=t.data("entityType"),o=t.getModel().getMetaModel().getObject(i),a=[],r=t.getConditions(),s=t.getModel().getMetaModel(),l=n===t.data("entityType"),c=e.isA("sap.ui.mdc.Chart"),g=!c&&e.getParent().getTableDefinition().enableAnalytics,p=c?f.parseCustomData(d.getCustomData(e,"applySupported")).enableSearch:!g||e.getParent().getTableDefinition().enableAnalyticsSearch;if(r&&(!l||g||c)){const i=l?[]:t.getControlDelegate().fetchPropertiesForEntity(n,s,t),f=i.reduce(function(t,e){t[e.name]=e;return t},{}),d=!c&&e.getParent().getTableDefinition().aggregates||{},g={};Object.keys(d).forEach(function(t){const e=d[t];g[e.relativePath]=e});const p=e.getModel().getMetaModel().getObject(e.data("targetCollectionPath")+"/");if(e.isA("sap.ui.mdc.Chart")){const t=e.getModel().getMetaModel().getObject(`${e.data("targetCollectionPath")}@`),n=u.getAllCustomAggregates(t);Object.keys(n).forEach(function(t){if(!g[t]){const e=n[t];g[t]=e}})}for(const t in r){const e=r[t];let n=true;if(p[t]&&o[t]){n=p[t]["$Type"]===o[t]["$Type"]}if(Array.isArray(e)&&e.length>0&&((!f[t]||f[t]&&!n)&&(!l||t==="$editState"&&c)||g[t])){a.push(t.replace(/\+|\*/g,""))}}}if(!p&&t.getSearch()){a.push("$search")}return a},async _getValueListInfo(t,e){var n;const i=(n=t.getModel())===null||n===void 0?void 0:n.getMetaModel();if(!i){return undefined}const o=t.data("entityType")??"";const a=await i.requestValueListInfo(o+e,true,undefined).catch(()=>null);return a===null||a===void 0?void 0:a[""]},_getConditionValidated:async function(t,e,n){if(!t){return C.NotValidated}const i=new T({path:e,operator:P.EQ,value1:n});const o=t.$model.bindList(`/${t.CollectionPath}`,undefined,undefined,i,{$select:e});const a=(await o.requestContexts()).length>0;if(a){return C.Validated}else{return C.NotValidated}},clearFilterValues:async function(t){var n;if(!t){return}const i=await F.retrieveExternalState(t);const o="$editState";const a=g.ALL.id;const r=e((n=i.filter[o])===null||n===void 0?void 0:n[0]);const s=(r===null||r===void 0?void 0:r.values[0])===a;for(const t of Object.keys(i.filter)){if(t===o&&s){continue}for(const e of i.filter[t]){e.filtered=false}}await F.applyExternalState(t,{filter:i.filter});if(r&&!s){r.values=[a];await F.applyExternalState(t,{filter:{[o]:[r]}})}t.getParent().fireAfterClear()},async _clearFilterValue(t,e){const n=await F.retrieveExternalState(t);if(n.filter[e]){n.filter[e].forEach(t=>{t.filtered=false});await F.applyExternalState(t,{filter:{[e]:n.filter[e]}})}},setFilterValues:async function(e,n){for(var i=arguments.length,o=new Array(i>2?i-2:0),a=2;a<i;a++){o[a-2]=arguments[a]}let r=o===null||o===void 0?void 0:o[0];let s=o===null||o===void 0?void 0:o[1];if(!e){return}if(o.length===2&&(s===undefined||s===null||s==="")&&r&&Object.keys(P).indexOf(r)!==-1){t.warning(`An empty filter value cannot be applied with the ${r} operator`);return}if(s===undefined&&!l.getSemanticDateOperations().includes(r||"")){s=r??[];r=undefined}if(!r){r=P.EQ}const c=["string","number","boolean"];if(s!==undefined&&(!Array.isArray(s)&&!c.includes(typeof s)||Array.isArray(s)&&s.length>0&&!c.includes(typeof s[0]))){throw new Error("FilterUtils.js#_setFilterValues: Filter value not supported; only primitive values or an array thereof can be used.")}let f;if(s!==undefined){f=Array.isArray(s)?s:[s]}const d=await this._getValueListInfo(e,n);const g={};if(n){if(f&&f.length){if(r===P.BT){g[n]=[y.createCondition(r,f,null,null,C.NotValidated)]}else{g[n]=await Promise.all(f.map(async t=>{const e=r===P.EQ?await this._getConditionValidated(d,n,t):C.NotValidated;return y.createCondition(r,[t],null,null,e)}))}}else if(l.getSemanticDateOperations().includes(r||"")){g[n]=[y.createCondition(r,[],null,null,C.NotValidated)]}}await this._clearFilterValue(e,n);if(g[n]){await F.applyExternalState(e,{filter:g})}},conditionToModelPath:function(t){return t.replace(/\//g,"\\")},_getFilterMetaModel:function(t,e){return e||t.getModel().getMetaModel()},_getEntitySetPath:function(t){return t&&s.getEntitySetPath(t)},_getFieldsForTable:function(t,e){const n=[];if(e){const e=i.getTargetView(t);const o=e&&e.getController()&&e.getController()._getControls&&e.getController()._getControls("table");if(o){o.forEach(function(t){n.push(t.getParent().getTableDefinition())})}return n}return[]},_getSelectionFields:function(t,e,n,i,a,s,l,c,f,d){let g=o.getSelectionFields(l,a,undefined,c,d).selectionFields;if((f?f.getControlType(t)==="sap.ui.mdc.FilterBar":t.isA("sap.ui.mdc.FilterBar"))&&e!==n){const t=r.getInvolvedDataModelObjects(s.createBindingContext(i));const e=l.getConverterContextFor(n);const a=e.getEntityTypeAnnotation("@com.sap.vocabularies.UI.v1.SelectionFields").annotation||[];const c={};g.forEach(function(t){c[t.conditionPath]=true});a.forEach(function(e){const n=e.value;if(!c[n]){const e=o.getFilterField(n,l,t.startingEntitySet.entityType);if(e){g.push(e)}}})}if(g){const e=[];g.forEach(function(t){e.push(t.key)});g=this._getSelectionFieldsFromPropertyInfos(t,e,g)}return g},_getSelectionFieldsFromPropertyInfos:function(t,e,n){const i=t.getPropertyInfo&&t.getPropertyInfo()||[];i.forEach(function(t){if(t.name==="$search"||t.name==="$editState"){return}const i=n[e.indexOf(t.key)];if(e.indexOf(t.key)!==-1&&i.annotationPath){t.group=i.group;t.groupLabel=i.groupLabel;t.settings=i.settings;t.visualFilter=i.visualFilter;t.label=i.label;n[e.indexOf(t.key)]=t}if(e.indexOf(t.key)===-1&&!t.annotationPath){n.push(t)}});return n},_getSearchField:function(t,e){return t.getSearch&&e.indexOf("search")===-1?t.getSearch():null},_getFilterConditions:function(t,e,n){const i=e||n.getConditions();if(t&&t.targetControl&&t.targetControl.isA("sap.ui.mdc.Chart")){Object.keys(i).forEach(function(t){if(t==="$editState"){delete i["$editState"]}})}return i},_getFilterPropertiesMetadata:function(t,e){if(!(t&&t.length)){if(e.getPropertyInfo){t=e.getPropertyInfo()}else{t=null}}return t},_getIgnoredProperties:function(t,e){const n=[];t.forEach(function(t){const i=t.name;const o=e[i];if(o&&(!o["hasProperty"]||o["hasProperty"]&&t.dataType!==o.dataType)){n.push(i)}});return n},getFilters:function(t){const{filters:e,search:n}=this.getFilterInfo(t);return{filters:e,search:n}}};return M},false);
//# sourceMappingURL=FilterUtils.js.map