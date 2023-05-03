/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Table","sap/fe/core/converters/controls/ListReport/VisualFilters","sap/fe/core/converters/helpers/ConfigurableObject","sap/fe/core/converters/helpers/IssueManager","sap/fe/core/converters/helpers/Key","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/ModelHelper","../../ManifestSettings","../Common/DataVisualization"],function(e,t,n,i,o,r,l,a,s){"use strict";var c={};var u=s.getSelectionVariant;var d=a.AvailabilityType;var v=r.getExpressionFromAnnotation;var p=r.compileExpression;var f=o.KeyHelper;var g=i.IssueType;var y=i.IssueSeverity;var h=i.IssueCategory;var m=n.Placement;var P=n.OverrideType;var b=n.insertCustomElements;var F=t.getVisualFilters;var S=e.isFilteringCaseSensitive;var E=e.getTypeConfig;var x=e.getSelectionVariantConfiguration;var O;(function(e){e["Default"]="Default";e["Slot"]="Slot"})(O||(O={}));const T="Edm.String";const C="sap.ui.model.odata.type.String";function I(e){const t={};e.Data.forEach(n=>{if(n.$Type==="com.sap.vocabularies.UI.v1.DataField"){var i,o;t[n.Value.path]={group:e.fullyQualifiedName,groupLabel:p(v(e.Label||((i=e.annotations)===null||i===void 0?void 0:(o=i.Common)===null||o===void 0?void 0:o.Label)||e.qualifier))||e.qualifier}}});return t}function A(e){return e.reduce((e,t)=>{t.propertyNames.forEach(t=>{e[t]=true});return e},{})}function D(e,t){if(t&&e.length>0){return e.every(e=>e.enableAnalytics&&t===e.annotation.collection)}return false}function N(e,t){const n=[];return e.map(e=>{const i=e.control.filters;const o=[];for(const e in i){if(Array.isArray(i[e].paths)){const r=i[e].paths;r.forEach(e=>{if(e&&e.annotationPath&&n.indexOf(e.annotationPath)===-1){n.push(e.annotationPath);const i=x(e.annotationPath,t);if(i){o.push(i)}}})}}return o}).reduce((e,t)=>e.concat(t),[])}const R=function(e,t){const n=t.split("/");let i;let o="";while(n.length){let t=n.shift();i=i?`${i}/${t}`:t;const r=e.resolvePath(i);if(r._type==="NavigationProperty"&&r.isCollection){t+="*"}o=o?`${o}/${t}`:t}return o};const V=function(e,t,n,i,o){var r,l,a;if(t!==undefined&&t.targetType===undefined&&(i||((r=t.annotations)===null||r===void 0?void 0:(l=r.UI)===null||l===void 0?void 0:(a=l.Hidden)===null||a===void 0?void 0:a.valueOf())!==true)){var s,c,u,g,y,h,m,P;const i=o.getAnnotationEntityType(t);return{key:f.getSelectionFieldKeyFromPath(n),annotationPath:o.getAbsoluteAnnotationPath(n),conditionPath:R(e,n),availability:((s=t.annotations)===null||s===void 0?void 0:(c=s.UI)===null||c===void 0?void 0:(u=c.HiddenFilter)===null||u===void 0?void 0:u.valueOf())===true?d.Hidden:d.Adaptation,label:p(v(((g=t.annotations.Common)===null||g===void 0?void 0:(y=g.Label)===null||y===void 0?void 0:y.valueOf())||t.name)),group:i.name,groupLabel:p(v((i===null||i===void 0?void 0:(h=i.annotations)===null||h===void 0?void 0:(m=h.Common)===null||m===void 0?void 0:(P=m.Label)===null||P===void 0?void 0:P.valueOf())||i.name))}}return undefined};const w=function(e,t,n,i,o){const r={};if(n){n.forEach(n=>{const l=n.name;const a=(t?`${t}/`:"")+l;const s=V(e,n,a,i,o);if(s){r[a]=s}})}return r};const L=function(e,t,n,i){let o={};if(t){t.forEach(t=>{let r;const l=e.resolvePath(t);if(l===undefined){return}if(l._type==="NavigationProperty"){r=w(e,t,l.targetType.entityProperties,n,i)}else if(l.targetType!==undefined&&l.targetType._type==="ComplexType"){r=w(e,t,l.targetType.properties,n,i)}else{const o=t.includes("/")?t.split("/").splice(0,1).join("/"):"";r=w(e,o,[l],n,i)}o={...o,...r}})}return o};const j=function(e,t,n,i){let o=e[t];if(o){delete e[t]}else{o=V(i,i.resolvePath(t),t,true,n)}if(!o){var r;(r=n.getDiagnostics())===null||r===void 0?void 0:r.addIssue(h.Annotation,y.High,g.MISSING_SELECTIONFIELD)}if(o){var l,a;o.availability=o.availability===d.Hidden?d.Hidden:d.Default;o.isParameter=!!((l=i.annotations)!==null&&l!==void 0&&(a=l.Common)!==null&&a!==void 0&&a.ResultContext)}return o};const M=function(e,t,n,i,o){const r=[];const l={};const a=t.entityProperties;o===null||o===void 0?void 0:o.forEach(e=>{l[e.value]=true});if(e&&e.length>0){e===null||e===void 0?void 0:e.forEach(e=>{const l=e.PropertyName;const a=l.value;const s={};o===null||o===void 0?void 0:o.forEach(e=>{s[e.value]=true});if(!(a in i)){if(!(a in s)){const e=k(a,n,t);if(e){r.push(e)}}}})}else if(a){a.forEach(e=>{var o,a;const s=(o=e.annotations)===null||o===void 0?void 0:(a=o.Common)===null||a===void 0?void 0:a.FilterDefaultValue;const c=e.name;if(!(c in i)){if(s&&!(c in l)){const e=k(c,n,t);if(e){r.push(e)}}}})}return r};function $(e){var t,n;const i=e.getDataModelObjectPath();const o=i.startingEntitySet.entityType;const r=!!((t=o.annotations)!==null&&t!==void 0&&(n=t.Common)!==null&&n!==void 0&&n.ResultContext)&&!i.targetEntitySet;const l=r&&e.getConverterContextFor(`/${i.startingEntitySet.name}`);return l?o.entityProperties.map(function(e){return j({},e.name,l,o)}):[]}const U=function(e,t,n){const i=t.length===0||t.every(e=>!e.applySupported.enableSearch);const o=e.length===0||e.every(e=>e.enableAnalytics&&!e.enableAnalyticsSearch);const r=n.getContextPath();if(r&&i&&o){return true}else{return false}};c.getFilterBarhideBasicSearch=U;const q=function(e,t){const n=t.getManifestWrapper().getFilterConfiguration();const i=(n===null||n===void 0?void 0:n.filterFields)||{};const o=L(e,Object.keys(i).map(e=>f.getPathFromSelectionFieldKey(e)),true,t);const r={};for(const n in i){const l=i[n];const a=f.getPathFromSelectionFieldKey(n);const s=o[a];const c=l.type==="Slot"?O.Slot:O.Default;const u=l&&l!==null&&l!==void 0&&l.visualFilter?F(e,t,n,i):undefined;r[n]={key:n,type:c,slotName:(l===null||l===void 0?void 0:l.slotName)||n,annotationPath:s===null||s===void 0?void 0:s.annotationPath,conditionPath:(s===null||s===void 0?void 0:s.conditionPath)||a,template:l.template,label:l.label,position:l.position||{placement:m.After},availability:l.availability||d.Default,settings:l.settings,visualFilter:u,required:l.required}}return r};c.getManifestFilterFields=q;const k=function(e,t,n){return j({},e,t,n)};c.getFilterField=k;const H=function(e,t){if(t==="RequiredProperties"||t==="NonFilterableProperties"){let n=[];if(e&&e[t]){n=e[t].map(function(e){return e.$PropertyPath||e.value})}return n}else if(t==="FilterAllowedExpressions"){const t={};if(e&&e.FilterExpressionRestrictions){e.FilterExpressionRestrictions.forEach(function(e){if(t[e.Property.value]){t[e.Property.value].push(e.AllowedExpressions)}else{t[e.Property.value]=[e.AllowedExpressions]}})}return t}return e};c.getFilterRestrictions=H;const B=function(){return{name:"$search",path:"$search",dataType:C,maxConditions:1}};const K=function(){return{name:"$editState",path:"$editState",groupLabel:"",group:"",dataType:C,hiddenFilter:false}};const J=function(e){let t;if(!l.isSingleton(e.getEntitySet())){var n,i;const o=(n=e.getEntitySet())===null||n===void 0?void 0:(i=n.annotations)===null||i===void 0?void 0:i.Capabilities;t=o===null||o===void 0?void 0:o.SearchRestrictions}return t};const W=function(e,t){var n,i,o;const r=(n=e.getEntitySet())===null||n===void 0?void 0:(i=n.annotations)===null||i===void 0?void 0:(o=i.Capabilities)===null||o===void 0?void 0:o.NavigationRestrictions;const l=r&&r.RestrictedProperties;return l&&l.find(function(e){return e&&e.NavigationProperty&&(e.NavigationProperty.$NavigationPropertyPath===t||e.NavigationProperty.value===t)})};c.getNavigationRestrictions=W;const _=function(e){return{key:e.key,annotationPath:e.annotationPath,conditionPath:e.conditionPath,name:e.conditionPath,label:e.label,hiddenFilter:e.availability==="Hidden",display:"Value",isParameter:e.isParameter,caseSensitive:e.caseSensitive,availability:e.availability,position:e.position,type:e.type,template:e.template,menu:e.menu,required:e.required}};const G=function(e){const t=["SingleValue","MultiValue","SingleRange","MultiRange","SearchExpression","MultiRangeOrSearchExpression"];e.sort(function(e,n){return t.indexOf(e)-t.indexOf(n)});return e[0]};c.getSpecificAllowedExpression=G;const z=function(e,t){var n,i,o,r,l,a;const s=e===null||e===void 0?void 0:(n=e.Common)===null||n===void 0?void 0:n.Text,c=s&&(e&&(e===null||e===void 0?void 0:(i=e.Common)===null||i===void 0?void 0:(o=i.Text)===null||o===void 0?void 0:(r=o.annotations)===null||r===void 0?void 0:(l=r.UI)===null||l===void 0?void 0:l.TextArrangement)||t&&(t===null||t===void 0?void 0:(a=t.UI)===null||a===void 0?void 0:a.TextArrangement));if(c){if(c.valueOf()==="UI.TextArrangementType/TextOnly"){return"Description"}else if(c.valueOf()==="UI.TextArrangementType/TextLast"){return"ValueDescription"}return"DescriptionValue"}return s?"DescriptionValue":"Value"};c.displayMode=z;const Q=function(e,t,n){var i;let o=_(t);const r=t.annotationPath;if(!r){return o}const l=e.getConverterContextFor(r).getDataModelObjectPath().targetObject;const a=l===null||l===void 0?void 0:l.annotations;const s=e===null||e===void 0?void 0:(i=e.getDataModelObjectPath().targetObject)===null||i===void 0?void 0:i.annotations;const c=n.formatOptions;const u=n.constraints;o=Object.assign(o,{formatOptions:c,constraints:u,display:z(a,s)});return o};c.fetchPropertyInfo=Q;const X=function(e){let t=true;switch(e.filterExpression){case"SearchExpression":case"SingleRange":case"SingleValue":t=false;break;default:break}if(e.type&&e.type.indexOf("Boolean")>0){t=false}return t};c.isMultiValue=X;const Y=function(e){return(e.$Type==="com.sap.vocabularies.UI.v1.DataField"||e.$Type==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"||e.$Type==="com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath")&&e.Value.path.includes("/")};const Z=function(e){var t,n,i;let o=arguments.length>1&&arguments[1]!==undefined?arguments[1]:[];let r=arguments.length>2&&arguments[2]!==undefined?arguments[2]:"";let l=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;let a=arguments.length>4?arguments[4]:undefined;const s=N(o,e);const c=A(s);const d=e.getEntityType();const v=r&&((t=e.getEntityTypeAnnotation(r))===null||t===void 0?void 0:t.annotation)||((n=d.annotations)===null||n===void 0?void 0:(i=n.UI)===null||i===void 0?void 0:i.SelectionFields)||[];const p=[];if(o.length===0&&!!a){var f;(f=e.getEntityTypeAnnotation(a).annotation)===null||f===void 0?void 0:f.forEach(e=>{if(Y(e)){const t=e.Value.path.slice(0,e.Value.path.lastIndexOf("/"));if(!p.includes(t)){p.push(t)}}})}const g={...w(d,"",d.entityProperties,l,e),...L(d,p,false,e),...L(d,e.getManifestWrapper().getFilterConfiguration().navigationProperties,l,e)};let y=[];const h=u(d,e);if(h){y=h.SelectOptions}const m=(v===null||v===void 0?void 0:v.reduce((t,n)=>{const i=n.value;if(!(i in c)){let n;if(r.startsWith("@com.sap.vocabularies.UI.v1.SelectionFields")){n=""}else{n=r.split("/@com.sap.vocabularies.UI.v1.SelectionFields")[0]}const o=n?n+"/"+i:i;const l=j(g,o,e,d);if(l){l.group="";l.groupLabel="";t.push(l)}}return t},[]))||[];const P=M(y,d,e,c,v);return{excludedFilterProperties:c,entityType:d,annotatedSelectionFields:v,filterFields:g,propertyInfoFields:m,defaultFilterFields:P}};const ee=function(e){const t=E(e,e===null||e===void 0?void 0:e.type);if((e===null||e===void 0?void 0:e.type)===T&&(t.constraints.nullable===undefined||t.constraints.nullable===true)){t.formatOptions.parseKeepsEmptyString=false}return t};c.fetchTypeConfig=ee;const te=function(e,t,n,i){let o=Q(t,e,i[e.key]),r="";if(e.conditionPath){r=e.conditionPath.replace(/\+|\*/g,"")}if(o){o=Object.assign(o,{maxConditions:!o.isParameter&&X(o)?-1:1,required:e.required??(o.isParameter||n.indexOf(r)>=0),caseSensitive:S(t),dataType:i[e.key].type})}return o};c.assignDataTypeToPropertyInfo=te;const ne=function(e,t,n){const i=[];const o={};if(n){e=e.concat(n)}e.forEach(function(e){if(e.annotationPath){const n=t.getConverterContextFor(e.annotationPath);const r=n.getDataModelObjectPath().targetObject;i.push(r===null||r===void 0?void 0:r.type);const l=ee(r);o[e.key]=l}else{i.push(T);o[e.key]={type:C}}});let r;if(!l.isSingleton(t.getEntitySet())){var a,s,c;r=(a=t.getEntitySet())===null||a===void 0?void 0:(s=a.annotations)===null||s===void 0?void 0:(c=s.Capabilities)===null||c===void 0?void 0:c.FilterRestrictions}const u=r;const d={};d["RequiredProperties"]=H(u,"RequiredProperties")||[];d["NonFilterableProperties"]=H(u,"NonFilterableProperties")||[];d["FilterAllowedExpressions"]=H(u,"FilterAllowedExpressions")||{};const v=t.getContextPath();const p=v.split("/");if(p.length>2){const e=p[p.length-1];p.splice(-1,1);const n=W(t,e);const i=n&&n.FilterRestrictions;d.RequiredProperties.concat(H(i,"RequiredProperties")||[]);d.NonFilterableProperties.concat(H(i,"NonFilterableProperties")||[]);d.FilterAllowedExpressions={...H(i,"FilterAllowedExpressions")||{},...d.FilterAllowedExpressions}}const f=d.RequiredProperties;const g=d.NonFilterableProperties;const y=[];e.forEach(function(e){let n;if(g.indexOf(n)===-1){const n=te(e,t,f,o);y.push(n)}});const h=t.getDataModelObjectPath();if(l.isObjectPathDraftSupported(h)){y.push(K())}const m=J(t);const P=Boolean(m&&!m.Searchable);if(v&&P!==true){if(!m||m!==null&&m!==void 0&&m.Searchable){y.push(B())}}return y};c.processSelectionFields=ne;const ie=function(e,t,n){return b(e,q(t,n),{availability:P.overwrite,label:P.overwrite,type:P.overwrite,position:P.overwrite,slotName:P.overwrite,template:P.overwrite,settings:P.overwrite,visualFilter:P.overwrite,required:P.overwrite})};c.insertCustomManifestElements=ie;const oe=function(e){var t,n;let i=arguments.length>1&&arguments[1]!==undefined?arguments[1]:[];let o=arguments.length>2&&arguments[2]!==undefined?arguments[2]:"";let r=arguments.length>3?arguments[3]:undefined;let l=arguments.length>4?arguments[4]:undefined;const a=Z(e,i,o,r,l);const s=$(e);let c=JSON.parse(JSON.stringify(a.propertyInfoFields));const u=a.entityType;c=s.concat(c);c=ie(c,u,e);const d=ne(c,e,a.defaultFilterFields);d.sort(function(e,t){if(e.groupLabel===undefined||e.groupLabel===null){return-1}if(t.groupLabel===undefined||t.groupLabel===null){return 1}return e.groupLabel.localeCompare(t.groupLabel)});let v=JSON.stringify(d);v=v.replace(/\{/g,"\\{");v=v.replace(/\}/g,"\\}");const p=v;let f=JSON.parse(JSON.stringify(a.propertyInfoFields));f=s.concat(f);const g=a.excludedFilterProperties;const y=u===null||u===void 0?void 0:(t=u.annotations)===null||t===void 0?void 0:(n=t.UI)===null||n===void 0?void 0:n.FilterFacets;let h={};const m=e.getAnnotationsByTerm("UI","com.sap.vocabularies.UI.v1.FieldGroup");if(y===undefined||y.length<0){for(const e in m){h={...h,...I(m[e])}}}else{h=y.reduce((e,t)=>{for(let d=0;d<(t===null||t===void 0?void 0:(n=t.Target)===null||n===void 0?void 0:(i=n.$target)===null||i===void 0?void 0:(o=i.Data)===null||o===void 0?void 0:o.length);d++){var n,i,o,r,l,a,s,c,u;e[t===null||t===void 0?void 0:(r=t.Target)===null||r===void 0?void 0:(l=r.$target)===null||l===void 0?void 0:(a=l.Data[d])===null||a===void 0?void 0:(s=a.Value)===null||s===void 0?void 0:s.path]={group:t===null||t===void 0?void 0:(c=t.ID)===null||c===void 0?void 0:c.toString(),groupLabel:t===null||t===void 0?void 0:(u=t.Label)===null||u===void 0?void 0:u.toString()}}return e},{})}const P=a.filterFields;let b=f.concat(Object.keys(P).filter(e=>!(e in g)).map(e=>Object.assign(P[e],h[e])));const F=e.getContextPath();if(D(i,F)){const e=i[0].aggregates;if(e){const t=Object.keys(e).map(t=>e[t].relativePath);b=b.filter(e=>t.indexOf(e.key)===-1)}}const E=ie(b,u,e);const x=S(e);E.forEach(e=>{e.caseSensitive=x});return{selectionFields:E,sPropertyInfo:p}};c.getSelectionFields=oe;const re=function(e,t,n){const i=H(t,"RequiredProperties");const o=J(e);const r=Boolean(o&&!o.Searchable);const l=n.getObject();if(i.length>0||r||(l===null||l===void 0?void 0:l.FetchValues)===2){return true}return false};c.getExpandFilterFields=re;return c},false);
//# sourceMappingURL=FilterBar.js.map