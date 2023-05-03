/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper","sap/fe/core/helpers/BindingToolkit","sap/fe/core/templating/CommonFormatters","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/FieldControlHelper","sap/fe/core/templating/PropertyHelper","sap/fe/core/templating/SemanticObjectHelper","sap/fe/core/templating/UIFormatters","sap/ui/model/json/JSONModel"],function(e,t,i,a,n,o,r,l,s){"use strict";var u={};var d=r.getDynamicPathFromSemanticObject;var c=n.isReadOnlyExpression;var v=a.getContextRelativeTargetObjectPath;var p=a.enhanceDataModelPath;var g=t.transformRecursively;var f=t.pathInModel;var m=t.or;var y=t.not;var b=t.isPathInModelExpression;var h=t.isComplexTypeExpression;var O=t.ifElse;var T=t.getExpressionFromAnnotation;var I=t.formatWithTypeInformation;var U=t.equal;var j=t.constant;var P=t.compileExpression;var F=t.and;var D=e.UI;const E=function(e,t){return g(e,"PathInModel",e=>{let a=e;if(e.modelName===undefined){const n=p(t,e.path);a=i.getBindingWithTextArrangement(n,e)}return a})};u.addTextArrangementToBindingExpression=E;const x=function(e,t){return g(e,"PathInModel",e=>{let i=e;if(e.modelName===undefined){const a=p(t,e.path);i=I(a.targetObject,e)}return i})};u.formatValueRecursively=x;const $=function(e,t){return S(e,t,true)};u.getTextBindingExpression=$;const S=function(e,t){var a,n,r,s,u,d,c,g,m,y,b,O,T,I,U;let F=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;if(((a=e.targetObject)===null||a===void 0?void 0:a.$Type)==="com.sap.vocabularies.UI.v1.DataField"||((n=e.targetObject)===null||n===void 0?void 0:n.$Type)==="com.sap.vocabularies.UI.v1.DataPointType"||((r=e.targetObject)===null||r===void 0?void 0:r.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath"||((s=e.targetObject)===null||s===void 0?void 0:s.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"||((u=e.targetObject)===null||u===void 0?void 0:u.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation"||((d=e.targetObject)===null||d===void 0?void 0:d.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithAction"){const t=e.targetObject.Value||"";return P(j(t))}if(o.isPathExpression(e.targetObject)&&e.targetObject.$target){e=p(e,e.targetObject.path)}const D=f(v(e));let E;if((c=e.targetObject)!==null&&c!==void 0&&(g=c.annotations)!==null&&g!==void 0&&(m=g.Measures)!==null&&m!==void 0&&m.Unit||(y=e.targetObject)!==null&&y!==void 0&&(b=y.annotations)!==null&&b!==void 0&&(O=b.Measures)!==null&&O!==void 0&&O.ISOCurrency){E=l.getBindingWithUnitOrCurrency(e,D);if((t===null||t===void 0?void 0:t.measureDisplayMode)==="Hidden"&&h(E)){E.formatOptions={...E.formatOptions,showMeasure:false}}}else if((T=e.targetObject)!==null&&T!==void 0&&(I=T.annotations)!==null&&I!==void 0&&(U=I.Common)!==null&&U!==void 0&&U.Timezone){E=l.getBindingWithTimezone(e,D,false,true,t.dateFormatOptions)}else{E=i.getBindingWithTextArrangement(e,D,t)}if(F){return E}return P(E)};u.getTextBinding=S;const B=function(e,t){let i=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;let a=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;let n=arguments.length>4?arguments[4]:undefined;let r=arguments.length>5&&arguments[5]!==undefined?arguments[5]:false;let s=arguments.length>6&&arguments[6]!==undefined?arguments[6]:false;if(o.isPathExpression(e.targetObject)&&e.targetObject.$target){const t=e.targetEntityType.resolvePath(e.targetObject.path,true);e.targetObject=t.target;t.visitedObjects.forEach(t=>{if(t&&t._type==="NavigationProperty"){e.navigationProperties.push(t)}})}const u=e.targetObject;if(o.isProperty(u)){let t=f(v(e));if(b(t)){var d,c,p,g,m,y;if((d=u.annotations)!==null&&d!==void 0&&(c=d.Communication)!==null&&c!==void 0&&c.IsEmailAddress){t.type="sap.fe.core.type.Email"}else if(!i&&((p=u.annotations)!==null&&p!==void 0&&(g=p.Measures)!==null&&g!==void 0&&g.ISOCurrency||(m=u.annotations)!==null&&m!==void 0&&(y=m.Measures)!==null&&y!==void 0&&y.Unit)){t=l.getBindingWithUnitOrCurrency(e,t,true,s?undefined:{showMeasure:false})}else{var h,O;const i=(h=e.targetObject.annotations)===null||h===void 0?void 0:(O=h.Common)===null||O===void 0?void 0:O.Timezone;if(i){t=l.getBindingWithTimezone(e,t,true)}else{t=I(u,t)}if(b(t)&&t.type==="sap.ui.model.odata.type.String"){t.formatOptions={parseKeepsEmptyString:true}}}if(b(t)){if(a){delete t.formatOptions;delete t.constraints;delete t.type}if(n){t.parameters=n}if(r){t.targetType="any"}}return P(t)}else{return""}}else if((u===null||u===void 0?void 0:u.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"||(u===null||u===void 0?void 0:u.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath"){return P(T(u.Value))}else{return""}};u.getValueBinding=B;const C=function(e,t){const i=o.getAssociatedTextPropertyPath(e.targetObject);if(i){const a=p(e,i);return B(a,t,true,true,{$$noPatch:true})}return undefined};u.getAssociatedTextBinding=C;const V=function(e,t){var i,a,n,o,r;const l=(e===null||e===void 0?void 0:(i=e.targetEntityType)===null||i===void 0?void 0:i.navigationProperties)||[];const s=(e===null||e===void 0?void 0:(a=e.targetEntityType)===null||a===void 0?void 0:(n=a.annotations)===null||n===void 0?void 0:(o=n.Common)===null||o===void 0?void 0:o.SemanticKey)||[];let u=false;l.forEach(e=>{if(e.referentialConstraint&&e.referentialConstraint.length){e.referentialConstraint.forEach(i=>{if((i===null||i===void 0?void 0:i.sourceProperty)===t.name){var a,n,o;if(e!==null&&e!==void 0&&(a=e.targetType)!==null&&a!==void 0&&(n=a.annotations)!==null&&n!==void 0&&(o=n.UI)!==null&&o!==void 0&&o.QuickViewFacets){u=true}}})}});if(((r=e.contextLocation)===null||r===void 0?void 0:r.targetEntitySet)!==e.targetEntitySet){var d,c,v;const i=s.some(function(e){var i;return(e===null||e===void 0?void 0:(i=e.$target)===null||i===void 0?void 0:i.name)===t.name});if((i||t.isKey)&&e!==null&&e!==void 0&&(d=e.targetEntityType)!==null&&d!==void 0&&(c=d.annotations)!==null&&c!==void 0&&(v=c.UI)!==null&&v!==void 0&&v.QuickViewFacets){u=true}}return u};u.isUsedInNavigationWithQuickViewFacets=V;const W=function(e,t){var i,a,n;const r=o.isPathExpression(e)&&e.$target||e;if(!((i=r.annotations)!==null&&i!==void 0&&(a=i.Common)!==null&&a!==void 0&&a.Text)&&!((n=r.annotations)!==null&&n!==void 0&&n.Measures)&&o.hasValueHelp(r)&&t.textAlignMode==="Form"){return true}return false};u.isRetrieveTextFromValueListEnabled=W;const A=function(e,t){var i,a,n,o,r,l;const s=e.targetObject;let u;if(s){switch(s.$Type){case"com.sap.vocabularies.UI.v1.DataField":case"com.sap.vocabularies.UI.v1.DataFieldWithUrl":case"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":case"com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":case"com.sap.vocabularies.UI.v1.DataFieldWithAction":case"com.sap.vocabularies.UI.v1.DataPointType":u=s.Value.$target;break;case"com.sap.vocabularies.UI.v1.DataFieldForAnnotation":if((s===null||s===void 0?void 0:(i=s.Target)===null||i===void 0?void 0:(a=i.$target)===null||a===void 0?void 0:a.$Type)==="com.sap.vocabularies.UI.v1.DataPointType"){var d;u=(d=s.Target.$target)===null||d===void 0?void 0:d.Value.$target;break}case"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":case"com.sap.vocabularies.UI.v1.DataFieldForAction":default:u=undefined}}const c=t!==null&&t!==void 0&&t.isAnalytics?D.IsExpanded:j(false);const v=t!==null&&t!==void 0&&t.isAnalytics?U(D.NodeLevel,0):j(false);return P(F(...[y(U(T(s===null||s===void 0?void 0:(n=s.annotations)===null||n===void 0?void 0:(o=n.UI)===null||o===void 0?void 0:o.Hidden),true)),O(!!u,u&&y(U(T((r=u.annotations)===null||r===void 0?void 0:(l=r.UI)===null||l===void 0?void 0:l.Hidden),true)),true),m(y(c),v)]))};u.getVisibleExpression=A;const M=function(e,t,i){let a=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;let n=B(e,i,a);if(n===""){n=S(t,i,a)}return n};u.QVTextBinding=M;const k=function(e){var t,i,a,n,o,r;const l=e.targetObject;if(l!==null&&l!==void 0&&(t=l.$target)!==null&&t!==void 0&&(i=t.annotations)!==null&&i!==void 0&&(a=i.Communication)!==null&&a!==void 0&&a.IsEmailAddress){return"email"}if(l!==null&&l!==void 0&&(n=l.$target)!==null&&n!==void 0&&(o=n.annotations)!==null&&o!==void 0&&(r=o.Communication)!==null&&r!==void 0&&r.IsPhoneNumber){return"phone"}return"text"};u.getQuickViewType=k;const N=function(e,t){const i=[];let a;let n;if(e){const r=Object.keys(e).filter(function(e){return e==="SemanticObject"||e.startsWith("SemanticObject#")});for(const l of r){var o;n=e[l];a=P(T(n));if(!t||t&&((o=n)===null||o===void 0?void 0:o.type)==="Path"){i.push({key:d(a)||a,value:a})}}}return i};u.getSemanticObjectExpressionToResolve=N;const w=function(e){if(e.length>0){let t="";let i="";const a=[];for(let n=0;n<e.length;n++){t=e[n].key;i=P(T(e[n].value));a.push({key:t,value:i})}const n=new s(a);n.$$valueAsPromise=true;const o=n.createBindingContext("/");return o}else{return new s([]).createBindingContext("/")}};u.getSemanticObjects=w;const H=function(e,t,i){if(e.wrap===false){return false}if(t!=="Edm.String"){return i}if(e.editMode==="Display"){return true}if(e.editMode.indexOf("{")>-1){return P(m(y(D.IsEditable),i))}return i};u.getMultipleLinesForDataField=H;const z=function(e,t){const i=o.getAssociatedUnitProperty(e);const a=o.getAssociatedCurrencyProperty(e);return o.hasValueHelp(e)&&e.type!=="Edm.Boolean"||t!=="Hidden"&&(i&&o.hasValueHelp(i)||a&&o.hasValueHelp(a))};const R=function(e,t,i,a){var n,r,s,u,d,v,p,g,f,m,b,h;const O=i.targetObject;if(!o.isProperty(O)){e.editStyle=null;return}if(!a){e.valueBindingExpression=B(i,e.formatOptions)}switch(t.$Type){case"com.sap.vocabularies.UI.v1.DataFieldForAnnotation":if(((n=t.Target)===null||n===void 0?void 0:(r=n.$target)===null||r===void 0?void 0:r.Visualization)==="UI.VisualizationType/Rating"){e.editStyle="RatingIndicator";return}break;case"com.sap.vocabularies.UI.v1.DataPointType":if((t===null||t===void 0?void 0:t.Visualization)==="UI.VisualizationType/Rating"){e.editStyle="RatingIndicator";return}break;case"com.sap.vocabularies.UI.v1.DataFieldForAction":case"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":case"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":e.editStyle=null;return;default:}if(z(O,(s=e.formatOptions)===null||s===void 0?void 0:s.measureDisplayMode)){if(!a){var T;e.textBindingExpression=C(i,e.formatOptions);if(((T=e.formatOptions)===null||T===void 0?void 0:T.measureDisplayMode)!=="Hidden"){e.valueBindingExpression=B(i,e.formatOptions,false,false,undefined,false,true)}}e.editStyle="InputWithValueHelp";return}switch(O.type){case"Edm.Date":e.editStyle="DatePicker";return;case"Edm.Time":case"Edm.TimeOfDay":e.editStyle="TimePicker";return;case"Edm.DateTime":case"Edm.DateTimeOffset":e.editStyle="DateTimePicker";if(!((u=O.annotations)!==null&&u!==void 0&&(d=u.Common)!==null&&d!==void 0&&d.Timezone)){e.showTimezone=undefined}else{e.showTimezone=true}return;case"Edm.Boolean":e.editStyle="CheckBox";return;case"Edm.Stream":e.editStyle="File";return;case"Edm.String":if((v=O.annotations)!==null&&v!==void 0&&(p=v.UI)!==null&&p!==void 0&&(g=p.MultiLineText)!==null&&g!==void 0&&g.valueOf()){e.editStyle="TextArea";return}break;default:e.editStyle="Input"}if((f=O.annotations)!==null&&f!==void 0&&(m=f.Measures)!==null&&m!==void 0&&m.ISOCurrency||(b=O.annotations)!==null&&b!==void 0&&(h=b.Measures)!==null&&h!==void 0&&h.Unit){if(!a){e.unitBindingExpression=P(l.getBindingForUnitOrCurrency(i));e.descriptionBindingExpression=l.ifUnitEditable(O,"",l.getBindingForUnitOrCurrency(i));const t=o.getAssociatedCurrencyProperty(O)||o.getAssociatedUnitProperty(O);e.unitEditable=P(y(c(t)))}e.editStyle="InputWithUnit";return}e.editStyle="Input"};u.setEditStyleProperties=R;const L=e=>{var t,i,a,n;const o=e.targetObject;if(r.hasSemanticObject(o)){return true}const l=e!==null&&e!==void 0&&(t=e.navigationProperties)!==null&&t!==void 0&&t.length?e===null||e===void 0?void 0:e.navigationProperties[(e===null||e===void 0?void 0:(i=e.navigationProperties)===null||i===void 0?void 0:i.length)-1]:null;if(!l||(a=e.contextLocation)!==null&&a!==void 0&&(n=a.navigationProperties)!==null&&n!==void 0&&n.find(e=>e.name===l.name)){return false}return r.hasSemanticObject(l)};u.hasSemanticObjectInNavigationOrProperty=L;const Q=e=>{if(!e.targetObject){return undefined}let t="";if(e.targetObject.term==="com.sap.vocabularies.UI.v1.DataPoint"){e.targetObject.$Type=e.targetObject.$Type||"com.sap.vocabularies.UI.v1.DataPointType"}switch(e.targetObject.$Type){case"com.sap.vocabularies.UI.v1.DataField":case"com.sap.vocabularies.UI.v1.DataPointType":case"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":case"com.sap.vocabularies.UI.v1.DataFieldWithUrl":case"com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":case"com.sap.vocabularies.UI.v1.DataFieldWithAction":if(typeof e.targetObject.Value==="object"){t=e.targetObject.Value.path}break;case"com.sap.vocabularies.UI.v1.DataFieldForAnnotation":if(e.targetObject.Target.$target){if(e.targetObject.Target.$target.$Type==="com.sap.vocabularies.UI.v1.DataField"||e.targetObject.Target.$target.$Type==="com.sap.vocabularies.UI.v1.DataPointType"){if(e.targetObject.Target.value.indexOf("/")>0){var i;t=e.targetObject.Target.value.replace(/\/@.*/,`/${(i=e.targetObject.Target.$target.Value)===null||i===void 0?void 0:i.path}`)}else{var a;t=(a=e.targetObject.Target.$target.Value)===null||a===void 0?void 0:a.path}}else{var n;t=(n=e.targetObject.Target)===null||n===void 0?void 0:n.path}}break}if(t&&t.length>0){return p(e,t)}else{return undefined}};u.getDataModelObjectPathForValue=Q;return u},false);
//# sourceMappingURL=FieldTemplating.js.map