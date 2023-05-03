/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Action","sap/fe/core/converters/controls/ListReport/FilterBar","sap/fe/core/converters/helpers/ConfigurableObject","sap/fe/core/helpers/BindingToolkit","../controls/Common/DataVisualization","../controls/Common/KPI","../helpers/ID","../ManifestSettings"],function(t,e,n,i,a,o,r,s){"use strict";var l={};var c=s.VisualizationType;var u=s.VariantManagementType;var f=s.TemplateType;var d=r.getTableID;var p=r.getIconTabBarID;var h=r.getFilterVariantManagementID;var v=r.getFilterBarID;var y=r.getDynamicListReportID;var g=r.getCustomTabID;var m=r.getChartID;var C=o.getKPIDefinitions;var b=a.isSelectionPresentationCompliant;var P=a.isPresentationCompliant;var T=a.getSelectionVariant;var I=a.getSelectionPresentationVariant;var w=a.getDefaultPresentationVariant;var E=a.getDefaultLineItem;var V=a.getDefaultChart;var z=a.getDataVisualizationConfiguration;var S=i.getExpressionFromAnnotation;var k=i.compileExpression;var A=n.insertCustomElements;var M=e.getSelectionFields;var D=e.getManifestFilterFields;var F=e.getFilterBarhideBasicSearch;var L=t.getActionsFromManifest;function B(t){const e=[];t.forEach(function(t){if(!t.type){const n=t.secondaryVisualization?t.secondaryVisualization.visualizations:t.presentation.visualizations;n.forEach(function(t){if(t.type===c.Table){e.push(t)}})}});return e}function x(t){const e=[];t.forEach(function(t){if(!t.type){const n=t.primaryVisualization?t.primaryVisualization.visualizations:t.presentation.visualizations;n.forEach(function(t){if(t.type===c.Chart){e.push(t)}})}});return e}const R=function(t){const e={};for(const s in t){var n,i,a;if((n=t[s])!==null&&n!==void 0&&(i=n.settings)!==null&&i!==void 0&&(a=i.defaultValues)!==null&&a!==void 0&&a.length){var o,r;e[s]=(o=t[s])===null||o===void 0?void 0:(r=o.settings)===null||r===void 0?void 0:r.defaultValues}}return e};function W(t,e,n){const i=e.getManifestWrapper().getDefaultTemplateAnnotationPath();const a=I(t,i,e);const o="ALP flavor needs both chart and table to load the application";if(i&&a){const t=a.PresentationVariant;if(!t){throw new Error("Presentation Variant is not configured in the SPV mentioned in the manifest")}const e=P(t,n);if(!e){if(n){throw new Error(o)}else{return undefined}}if(b(a,n)){return a}}if(a){if(b(a,n)){return a}else if(n){throw new Error(o)}}const r=w(t);if(r){if(P(r,n)){return r}else if(n){throw new Error(o)}}if(!n){const e=E(t);if(e){return e}}return undefined}const H=function(t){let e=t;if(e.converterContext){var n,i;let t=e.converterContext;e=e;const a=function(t){return t.key!==undefined};let o=z(e.annotation?t.getRelativeAnnotationPath(e.annotation.fullyQualifiedName,t.getEntityType()):"",true,t,e,undefined,undefined,a(e));let r="";let s="";let l="";let u="";const p=function(t,e){let n;for(const i of t.visualizations){if(e&&i.type===c.Chart){n=i;break}if(!e&&i.type===c.Table){n=i;break}}const i=Object.assign({},t);if(n){i.visualizations=[n]}else{throw new Error((e?"Primary":"Secondary")+" visualisation needs valid "+(e?"chart":"table"))}return i};const h=function(n,i){const a=t.getEntityTypeAnnotation(n.annotationPath);const r=a.annotation;t=a.converterContext;const s=r;if(s||t.getTemplateType()===f.AnalyticalListPage){o=z(s?t.getRelativeAnnotationPath(s.fullyQualifiedName,t.getEntityType()):"",true,t,e);return o}else{const t="Annotation Path for the "+(i?"primary":"secondary")+" visualisation mentioned in the manifest is not found";throw new Error(t)}};const v=function(t,n){var i,a,o;const l=p(t[0],true);s=l===null||l===void 0?void 0:(i=l.visualizations[0])===null||i===void 0?void 0:i.id;const c=p(t[1]?t[1]:t[0],false);r=c===null||c===void 0?void 0:(a=c.visualizations[0])===null||a===void 0?void 0:(o=a.annotation)===null||o===void 0?void 0:o.id;if(l&&c){e=e;const t=e.visible;const i={primaryVisualization:l,secondaryVisualization:c,tableControlId:r,chartControlId:s,defaultPath:n,visible:t};return i}};if(((n=o)===null||n===void 0?void 0:(i=n.visualizations)===null||i===void 0?void 0:i.length)===2&&t.getTemplateType()===f.AnalyticalListPage){const t=v([o],"both");if(t){return t}}else if(t.getManifestWrapper().hasMultipleVisualizations(e)||t.getTemplateType()===f.AnalyticalListPage){const{primary:t,secondary:n}=e;if(t&&t.length&&n&&n.length){const i=v([h(t[0],true),h(n[0],false)],e.defaultPath);if(i){return i}}else{throw new Error("SecondaryItems in the Views is not present")}}else if(a(e)){const n=t.getEntityTypeAnnotation(e.annotationPath);const i=n.annotation;t=n.converterContext;l=k(S(i.Text));o.visualizations.forEach((t,n)=>{switch(t.type){case c.Table:const t=o.visualizations[n];const i=t.control.filters||{};i.hiddenFilters=i.hiddenFilters||{paths:[]};if(!e.keepPreviousPersonalization){t.annotation.id=d(e.key||"","LineItem")}e=e;if(e&&e.annotation&&e.annotation.term==="com.sap.vocabularies.UI.v1.SelectionPresentationVariant"){u=`@${e.annotation.SelectionVariant.fullyQualifiedName.split("@")[1]}`}else{u=e.annotationPath}i.hiddenFilters.paths.push({annotationPath:u});t.control.filters=i;break;case c.Chart:const a=o.visualizations[n];a.id=m(e.key||"","Chart");a.multiViews=true;break;default:break}})}o.visualizations.forEach(t=>{if(t.type===c.Table){r=t.annotation.id}else if(t.type===c.Chart){s=t.id}});e=e;const y=e.visible;return{presentation:o,tableControlId:r,chartControlId:s,title:l,selectionVariantPath:u,visible:y}}else{e=e;const t=e.label,n=e.template,i=e.type,a=g(e.key||""),o=e.visible;return{title:t,fragment:n,type:i,customTabId:a,visible:o}}};const j=function(t,e){let n=[];if(e){e.paths.forEach(i=>{if(t.getManifestWrapper().hasMultipleVisualizations(i)){if(e.paths.length>1){throw new Error("ALP flavor cannot have multiple views")}else{i=i;n.push({converterContext:t,primary:i.primary,secondary:i.secondary,defaultPath:i.defaultPath})}}else if(i.template){i=i;n.push({key:i.key,label:i.label,template:i.template,type:"Custom",visible:i.visible})}else{i=i;const e=t.getConverterContextFor(i.contextPath||i.entitySet&&`/${i.entitySet}`||t.getContextPath()),a=e.getEntityType();if(a&&e){let t;const o=e.getEntityTypeAnnotation(i.annotationPath);const r=o.annotation;if(r){t=r.term==="com.sap.vocabularies.UI.v1.SelectionVariant"?W(a,e,false):r;n.push({converterContext:e,annotation:t,annotationPath:i.annotationPath,keepPreviousPersonalization:i.keepPreviousPersonalization,key:i.key,visible:i.visible})}}else{}}})}else{const e=t.getEntityType();if(t.getTemplateType()===f.AnalyticalListPage){n=Q(t,n)}else{n.push({annotation:W(e,t,false),converterContext:t})}}return n.map(t=>H(t))};const N=function(t,e){const n=t.getManifestWrapper();const i=n.getViewConfiguration();if(e.length>1&&!$(t)){return{showTabCounts:i?(i===null||i===void 0?void 0:i.showCounts)||n.hasMultipleEntitySets():undefined,id:p()}}return undefined};function Q(t,e){const n=t.getEntityType();const i=W(n,t,true);let a,o;if(i){e.push({annotation:i,converterContext:t})}else{a=V(n);o=E(n);if(a&&o){const n=[{annotationPath:"@"+a.term}];const i=[{annotationPath:"@"+o.term}];e.push({converterContext:t,primary:n,secondary:i,defaultPath:"both"})}else{throw new Error("ALP flavor needs both chart and table to load the application")}}return e}function $(t){return t.getManifestWrapper().hasMultipleVisualizations()||t.getTemplateType()===f.AnalyticalListPage}const K=function(t){const e=t.getManifestWrapper();return A([],L(e.getHeaderActions(),t).actions)};l.getHeaderActions=K;const O=function(t,e){t.forEach(t=>{if(!t.type){const n=t.presentation;n.visualizations.forEach(t=>{if(t.type===c.Chart&&t.filterId!==e){t.filterId=e}})}})};l.checkChartFilterBarId=O;const U=function(t){const e=t.getEntityType();const n=t.getContextPath();if(!n){throw new Error("An EntitySet is required to be able to display a ListReport, please adjust your `entitySet` property to point to one.")}const i=t.getManifestWrapper();const a=i.getViewConfiguration();const o=i.hasMultipleEntitySets();const r=j(t,a);const s=B(r);const l=x(r);const c=s.some(t=>t.control.type==="ResponsiveTable");let f="";let d="";const p=y();const g=v(n);const m=h(g);const b=i.getFilterConfiguration();const P=(b===null||b===void 0?void 0:b.initialLayout)!==undefined?b===null||b===void 0?void 0:b.initialLayout.toLowerCase():"compact";const I=(b===null||b===void 0?void 0:b.layout)!==undefined?b===null||b===void 0?void 0:b.layout.toLowerCase():"compact";const w=b.useSemanticDateRange!==undefined?b.useSemanticDateRange:true;const E=b.showClearButton!==undefined?b.showClearButton:false;const V=q(t,r);if(V){d=V.chartId;f=V.tableId}const z=i.useHiddenFilterBar();const S=(i.isFilterBarHidden()||z)&&d==="";const k=M(t,s);const A=k.selectionFields;const L=k.sPropertyInfo;const W=F(s,l,t);const H=N(t,r);const Q=H?undefined:T(e,t);const U=w?R(D(e,t)):{};const G=K(t);if(o){O(r,g)}const J=s.map(t=>t.annotation.id).concat(l.map(t=>t.id));const X=[...S&&!z?[]:[g],...i.getVariantManagement()!==u.Control?J:[],...H?[H.id]:[]];const Y=H&&i.getStickyMultiTabHeaderConfiguration()?H.id:undefined;return{mainEntitySet:n,mainEntityType:`${n}/`,multiViewsControl:H,stickySubheaderProvider:Y,singleTableId:f,singleChartId:d,dynamicListReportId:p,headerActions:G,showPinnableToggle:c,filterBar:{propertyInfo:L,selectionFields:A,hideBasicSearch:W,showClearButton:E},views:r,filterBarId:S&&!z?"":g,filterConditions:{selectionVariant:Q,defaultSemanticDates:U},variantManagement:{id:m,targetControlIds:X.join(",")},hasMultiVisualizations:$(t),templateType:i.getTemplateType(),useSemanticDateRange:w,filterInitialLayout:P,filterLayout:I,kpiDefinitions:C(t),hideFilterBar:S,useHiddenFilterBar:z}};l.convertPage=U;function q(t,e){let n="",i="";if(t.getManifestWrapper().hasMultipleVisualizations()||t.getTemplateType()===f.AnalyticalListPage){for(let t of e){t=t;if(t.chartControlId&&t.tableControlId){i=t.chartControlId;n=t.tableControlId;break}}}else{for(let t of e){t=t;if(!n&&t.tableControlId){n=t.tableControlId||""}if(!i&&t.chartControlId){i=t.chartControlId||""}if(i&&n){break}}}if(n||i){return{chartId:i,tableId:n}}return undefined}return l},false);
//# sourceMappingURL=ListReportConverter.js.map