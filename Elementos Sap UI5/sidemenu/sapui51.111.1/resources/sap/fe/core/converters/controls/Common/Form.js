/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/ModelHelper","sap/fe/core/templating/DataModelPathHelper","../../../helpers/StableIdHelper","../../helpers/ConfigurableObject","../../helpers/DataFieldHelper","../../helpers/ID","../../helpers/Key","../../ManifestSettings"],function(e,t,a,n,o,i,r,l,s,v){"use strict";var c={};var d=v.ActionType;var u=s.KeyHelper;var f=l.getFormStandardActionButtonID;var p=l.getFormID;var m=r.isReferencePropertyStaticallyHidden;var y=i.Placement;var g=i.OverrideType;var P=i.insertCustomElements;var h=o.createIdForAnnotation;var O=n.getTargetObjectPath;var F=n.getTargetEntitySetPath;var b=t.pathInModel;var E=t.not;var I=t.ifElse;var C=t.getExpressionFromAnnotation;var T=t.equal;var D=t.compileExpression;var S=e.getSemanticObjectPath;let A;(function(e){e["Default"]="Default";e["Slot"]="Slot";e["Annotation"]="Annotation"})(A||(A={}));c.FormElementType=A;function w(){return{textLinesEdit:4}}function U(e,t){var a,n,o,i;return(t===null||t===void 0?void 0:t.valueOf())===false||((a=e.annotations)===null||a===void 0?void 0:(n=a.UI)===null||n===void 0?void 0:n.PartOfPreview)===undefined||((o=e.annotations)===null||o===void 0?void 0:(i=o.UI)===null||i===void 0?void 0:i.PartOfPreview.valueOf())===true}function N(e,t){const a=[];const n=t.getEntityTypeAnnotation(e.Target.value);const o=n.annotation;t=n.converterContext;function i(e,n){var o,i,r;const l=S(t,e);if(e.$Type!=="com.sap.vocabularies.UI.v1.DataFieldForAction"&&e.$Type!=="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"&&!m(e)&&((o=e.annotations)===null||o===void 0?void 0:(i=o.UI)===null||i===void 0?void 0:(r=i.Hidden)===null||r===void 0?void 0:r.valueOf())!==true){const o={key:u.generateKeyFromDataField(e),type:A.Annotation,annotationPath:`${t.getEntitySetBasedAnnotationPath(e.fullyQualifiedName)}/`,semanticObjectPath:l,formatOptions:w(),isPartOfPreview:U(e,n)};if(e.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"&&e.Target.$target.$Type==="com.sap.vocabularies.UI.v1.ConnectedFieldsType"){const a=Object.values(e.Target.$target.Data).filter(e=>e===null||e===void 0?void 0:e.hasOwnProperty("Value"));o.connectedFields=a.map(e=>({semanticObjectPath:S(t,e)}))}a.push(o)}}switch(o===null||o===void 0?void 0:o.term){case"com.sap.vocabularies.UI.v1.FieldGroup":o.Data.forEach(t=>{var a,n;return i(t,(a=e.annotations)===null||a===void 0?void 0:(n=a.UI)===null||n===void 0?void 0:n.PartOfPreview)});break;case"com.sap.vocabularies.UI.v1.Identification":o.forEach(t=>{var a,n;return i(t,(a=e.annotations)===null||a===void 0?void 0:(n=a.UI)===null||n===void 0?void 0:n.PartOfPreview)});break;case"com.sap.vocabularies.UI.v1.DataPoint":a.push({key:`DataPoint::${o.qualifier?o.qualifier:""}`,type:A.Annotation,annotationPath:`${t.getEntitySetBasedAnnotationPath(o.fullyQualifiedName)}/`});break;case"com.sap.vocabularies.Communication.v1.Contact":a.push({key:`Contact::${o.qualifier?o.qualifier:""}`,type:A.Annotation,annotationPath:`${t.getEntitySetBasedAnnotationPath(o.fullyQualifiedName)}/`});break;default:break}return a}function M(e,t){const a=t.getManifestWrapper();const n=a.getFormContainer(e.Target.value);const o={};if(n!==null&&n!==void 0&&n.fields){Object.keys(n===null||n===void 0?void 0:n.fields).forEach(e=>{o[e]={key:e,id:`CustomFormElement::${e}`,type:n.fields[e].type||A.Default,template:n.fields[e].template,label:n.fields[e].label,position:n.fields[e].position||{placement:y.After},formatOptions:{...w(),...n.fields[e].formatOptions}}})}return o}c.getFormElementsFromManifest=M;function $(e,t,n){var o,i,r,l,s,v;const c=h(e);const u=t.getEntitySetBasedAnnotationPath(e.fullyQualifiedName);const p=t.getEntityTypeAnnotation(e.Target.value);const m=D(E(T(true,C((o=e.annotations)===null||o===void 0?void 0:(i=o.UI)===null||i===void 0?void 0:i.Hidden))));let y;if(p.converterContext.getEntitySet()&&p.converterContext.getEntitySet()!==t.getEntitySet()){y=F(p.converterContext.getDataModelObjectPath())}else if(((r=p.converterContext.getDataModelObjectPath().targetObject)===null||r===void 0?void 0:r.containsTarget)===true){y=O(p.converterContext.getDataModelObjectPath(),false)}else if(p.converterContext.getEntitySet()&&!y&&a.isSingleton(p.converterContext.getEntitySet())){var S;y=(S=p.converterContext.getEntitySet())===null||S===void 0?void 0:S.fullyQualifiedName}const A=P(N(e,t),M(e,t),{formatOptions:g.overwrite});n=n!==undefined?n.filter(t=>t.facetName==e.fullyQualifiedName):[];if(n.length===0){n=undefined}const w={id:f(c,"ShowHideDetails"),key:"StandardAction::ShowHideDetails",text:D(I(T(b("showDetails","internal"),true),b("T_COMMON_OBJECT_PAGE_HIDE_FORM_CONTAINER_DETAILS","sap.fe.i18n"),b("T_COMMON_OBJECT_PAGE_SHOW_FORM_CONTAINER_DETAILS","sap.fe.i18n"))),type:d.ShowFormDetails,press:"FormContainerRuntime.toggleDetails"};if(((l=e.annotations)===null||l===void 0?void 0:(s=l.UI)===null||s===void 0?void 0:(v=s.PartOfPreview)===null||v===void 0?void 0:v.valueOf())!==false&&A.some(e=>e.isPartOfPreview===false)){if(n!==undefined){n.push(w)}else{n=[w]}}return{id:c,formElements:A,annotationPath:u,isVisible:m,entitySet:y,actions:n}}c.getFormContainer=$;function _(e,t,a){var n;const o=[];(n=e.Facets)===null||n===void 0?void 0:n.forEach(e=>{if(e.$Type==="com.sap.vocabularies.UI.v1.CollectionFacet"){return}o.push($(e,t,a))});return o}function x(e){return e.$Type==="com.sap.vocabularies.UI.v1.ReferenceFacet"}c.isReferenceFacet=x;function k(e,t,a,n){var o,i,r;switch(e.$Type){case"com.sap.vocabularies.UI.v1.CollectionFacet":return{id:p(e),useFormContainerLabels:true,hasFacetsNotPartOfPreview:e.Facets.some(e=>{var t,a,n;return((t=e.annotations)===null||t===void 0?void 0:(a=t.UI)===null||a===void 0?void 0:(n=a.PartOfPreview)===null||n===void 0?void 0:n.valueOf())===false}),formContainers:_(e,a,n),isVisible:t};case"com.sap.vocabularies.UI.v1.ReferenceFacet":return{id:p(e),useFormContainerLabels:false,hasFacetsNotPartOfPreview:((o=e.annotations)===null||o===void 0?void 0:(i=o.UI)===null||i===void 0?void 0:(r=i.PartOfPreview)===null||r===void 0?void 0:r.valueOf())===false,formContainers:[$(e,a,n)],isVisible:t};default:throw new Error("Cannot create form based on ReferenceURLFacet")}}c.createFormDefinition=k;return c},false);
//# sourceMappingURL=Form.js.map