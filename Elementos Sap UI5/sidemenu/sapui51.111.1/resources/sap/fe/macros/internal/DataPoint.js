/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/buildingBlocks/BuildingBlockRuntime","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/CriticalityFormatters","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/PropertyHelper","sap/fe/core/templating/UIFormatters","sap/fe/macros/field/FieldHelper","sap/fe/macros/field/FieldTemplating","sap/fe/macros/internal/helpers/DataPointTemplating"],function(t,e,i,a,n,o,r,l,s,u,c,d){"use strict";var p,m,h,v,b,f,g,O,P,y,j,$,T,x,V,S,w,M,z,F,C;var D={};var E=d.getValueFormatted;var I=d.getHeaderRatingIndicatorText;var k=d.buildFieldBindingExpression;var R=d.buildExpressionForProgressIndicatorPercentValue;var B=d.buildExpressionForProgressIndicatorDisplayValue;var N=c.isUsedInNavigationWithQuickViewFacets;var L=c.getVisibleExpression;var A=c.getSemanticObjects;var Q=c.getSemanticObjectExpressionToResolve;var U=l.isProperty;var H=l.hasUnit;var _=l.hasCurrency;var q=r.getRelativePaths;var W=r.enhanceDataModelPath;var G=o.buildExpressionForCriticalityIcon;var J=o.buildExpressionForCriticalityColor;var K=n.generate;var X=a.pathInModel;var Y=a.notEqual;var Z=a.getExpressionFromAnnotation;var tt=a.formatResult;var et=a.compileExpression;var it=i.getInvolvedDataModelObjects;var at=i.convertMetaModelContext;var nt=e.xml;var ot=t.defineBuildingBlock;var rt=t.BuildingBlockBase;var lt=t.blockAttribute;function st(t,e,i,a){if(!i)return;Object.defineProperty(t,e,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(a):void 0})}function ut(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function ct(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;dt(t,e)}function dt(t,e){dt=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,i){e.__proto__=i;return e};return dt(t,e)}function pt(t,e,i,a,n){var o={};Object.keys(a).forEach(function(t){o[t]=a[t]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=i.slice().reverse().reduce(function(i,a){return a(t,e,i)||i},o);if(n&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(n):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(t,e,o);o=null}return o}function mt(t,e){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let ht=(p=ot({name:"DataPoint",namespace:"sap.fe.macros.internal"}),m=lt({type:"string"}),h=lt({type:"sap.ui.model.Context",required:true}),v=lt({type:"string"}),b=lt({type:"string"}),f=lt({type:"string"}),g=lt({type:"boolean"}),O=lt({type:"sap.ui.model.Context",required:false,computed:true}),P=lt({type:"object",validate:function(t){if(t!==null&&t!==void 0&&t.dataPointStyle&&!["","large"].includes(t===null||t===void 0?void 0:t.dataPointStyle)){throw new Error(`Allowed value ${t.dataPointStyle} for dataPointStyle does not match`)}if(t!==null&&t!==void 0&&t.displayMode&&!["Value","Description","ValueDescription","DescriptionValue"].includes(t===null||t===void 0?void 0:t.displayMode)){throw new Error(`Allowed value ${t.displayMode} for displayMode does not match`)}if(t!==null&&t!==void 0&&t.iconSize&&!["1rem","1.375rem","2rem"].includes(t===null||t===void 0?void 0:t.iconSize)){throw new Error(`Allowed value ${t.iconSize} for iconSize does not match`)}if(t!==null&&t!==void 0&&t.measureDisplayMode&&!["Hidden","ReadOnly"].includes(t===null||t===void 0?void 0:t.measureDisplayMode)){throw new Error(`Allowed value ${t.measureDisplayMode} for measureDisplayMode does not match`)}return t}}),y=lt({type:"sap.ui.model.Context",required:true,$kind:["EntitySet","NavigationProperty","EntityType","Singleton"]}),p(j=($=function(t){ct(e,t);e.getTemplatingObjects=function t(e){var i,a;const n=it(e.metaPath,e.contextPath);let o;e.visible=L(n);if(n!==null&&n!==void 0&&(i=n.targetObject)!==null&&i!==void 0&&(a=i.Value)!==null&&a!==void 0&&a.path){o=W(n,n.targetObject.Value.path)}const r=at(e.metaPath);return{dataModelPath:n,valueDataModelPath:o,dataPointConverted:r}};e.getDataPointVisualization=function t(i){var a,n;const{dataModelPath:o,valueDataModelPath:r,dataPointConverted:l}=e.getTemplatingObjects(i);if((l===null||l===void 0?void 0:l.Visualization)==="UI.VisualizationType/Rating"){i.visualization="Rating";return i}if((l===null||l===void 0?void 0:l.Visualization)==="UI.VisualizationType/Progress"){i.visualization="Progress";return i}const s=r&&r.targetObject;if(!(N(o,s)||s!==null&&s!==void 0&&(a=s.annotations)!==null&&a!==void 0&&(n=a.Common)!==null&&n!==void 0&&n.SemanticObject)){if(U(s)&&(H(s)||_(s))){i.visualization="ObjectNumber";return i}}i.visualization="ObjectStatus";return i};function e(i){var a;i.semanticObjects=A([]);i.hasQuickViewFacets=false;i.hasSemanticObjectOnNavigation=false;a=t.call(this,e.getDataPointVisualization(i))||this;st(a,"idPrefix",T,ut(a));st(a,"metaPath",x,ut(a));st(a,"ariaLabelledBy",V,ut(a));st(a,"visualization",S,ut(a));st(a,"visible",w,ut(a));st(a,"hasQuickViewFacets",M,ut(a));st(a,"semanticObjects",z,ut(a));st(a,"formatOptions",F,ut(a));st(a,"contextPath",C,ut(a));return a}D=e;var i=e.prototype;i.getRatingIndicatorTemplate=function t(){var i;const{dataModelPath:a,valueDataModelPath:n,dataPointConverted:o}=e.getTemplatingObjects(this);const r=a.targetObject;const l=this.getTargetValueBinding();const s=(r===null||r===void 0?void 0:r.Value)||"";const u=s===null||s===void 0?void 0:(i=s.$target)===null||i===void 0?void 0:i.type;let c;if(u==="Edm.Decimal"&&r.ValueFormat){if(r.ValueFormat.NumberOfFractionalDigits){c=r.ValueFormat.NumberOfFractionalDigits}}const d=E(n,s,u,c);const p=I(this.metaPath,r);let m="";let h="";const v=et(tt([X("T_HEADER_RATING_INDICATOR_FOOTER","sap.fe.i18n"),Z(o.Value,q(a)),o.TargetValue?Z(o.TargetValue,q(a)):"5"],"MESSAGE"));if(this.formatOptions.showLabels??false){m=nt`<Label xmlns="sap.m"
					${this.attr("text",p)}
					${this.attr("visible",r.SampleSize||r.Description?true:false)}
				/>`;h=nt`<Label
			xmlns="sap.m"
			core:require="{MESSAGE: 'sap/base/strings/formatMessage' }"
			${this.attr("text",v)}
			visible="true" />`}return nt`
		${m}
		<RatingIndicator
		xmlns="sap.m"

		${this.attr("id",this.idPrefix?K([this.idPrefix,"RatingIndicator-Field-display"]):undefined)}
		${this.attr("maxValue",l)}
		${this.attr("value",d)}
		${this.attr("tooltip",this.getTooltipValue())}
		${this.attr("iconSize",this.formatOptions.iconSize)}
		${this.attr("class",this.formatOptions.showLabels??false?"sapUiTinyMarginTopBottom":undefined)}
		editable="false"
	/>
	${h}`};i.getProgressIndicatorTemplate=function t(){var i;const{dataModelPath:a,valueDataModelPath:n,dataPointConverted:o}=e.getTemplatingObjects(this);const r=J(o,a);const l=B(a);const s=R(a);const u=a.targetObject;let c="";let d="";if((this===null||this===void 0?void 0:(i=this.formatOptions)===null||i===void 0?void 0:i.showLabels)??false){var p,m,h;c=nt`<Label
				xmlns="sap.m"
				${this.attr("text",u===null||u===void 0?void 0:u.Description)}
				${this.attr("visible",!!(u!==null&&u!==void 0&&u.Description))}
			/>`;const t=Z(n===null||n===void 0?void 0:(p=n.targetObject)===null||p===void 0?void 0:(m=p.annotations)===null||m===void 0?void 0:(h=m.Common)===null||h===void 0?void 0:h.Label);d=nt`<Label
				xmlns="sap.m"
				${this.attr("text",et(t))}
				${this.attr("visible",!!et(Y(undefined,t)))}
			/>`}return nt`
		${c}
			<ProgressIndicator
				xmlns="sap.m"
				${this.attr("id",this.idPrefix?K([this.idPrefix,"ProgressIndicator-Field-display"]):undefined)}
				${this.attr("displayValue",l)}
				${this.attr("percentValue",s)}
				${this.attr("state",r)}
				${this.attr("tooltip",this.getTooltipValue())}
			/>
			${d}`};i.getObjectNumberCommonTemplate=function t(){const{dataModelPath:i,valueDataModelPath:a,dataPointConverted:n}=e.getTemplatingObjects(this);const o=J(n,i);const r=this.formatOptions.showEmptyIndicator??false?"On":undefined;const l=k(i,this.formatOptions,true);const u=this.formatOptions.measureDisplayMode==="Hidden"?undefined:et(s.getBindingForUnitOrCurrency(a));return nt`<ObjectNumber
			xmlns="sap.m"
			${this.attr("id",this.idPrefix?K([this.idPrefix,"ObjectNumber-Field-display"]):undefined)}
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			${this.attr("state",o)}
			${this.attr("number",l)}
			${this.attr("unit",u)}
			${this.attr("visible",this.visible)}
			emphasized="false"
			${this.attr("class",this.formatOptions.dataPointStyle==="large"?"sapMObjectNumberLarge":undefined)}
			${this.attr("tooltip",this.getTooltipValue())}
			${this.attr("emptyIndicatorMode",r)}
		/>`};i.getObjectNumberTemplate=function t(){var i;const{valueDataModelPath:a}=e.getTemplatingObjects(this);if((this===null||this===void 0?void 0:(i=this.formatOptions)===null||i===void 0?void 0:i.isAnalytics)??false){return nt`
				<control:ConditionalWrapper
					xmlns:control="sap.fe.core.controls"
					${this.attr("condition",s.hasValidAnalyticalCurrencyOrUnit(a))}
				>
					<control:contentTrue>
						${this.getObjectNumberCommonTemplate()}
					</control:contentTrue>
					<control:contentFalse>
						<ObjectNumber
							xmlns="sap.m"
							${this.attr("id",this.idPrefix?K([this.idPrefix,"ObjectNumber-Field-display-differentUnit"]):undefined)}
							number="*"
							unit=""
							${this.attr("visible",this.visible)}
							emphasized="false"
							${this.attr("class",this.formatOptions.dataPointStyle==="large"?"sapMObjectNumberLarge":undefined)}
						/>
					</control:contentFalse>
				</control:ConditionalWrapper>`}else{return nt`${this.getObjectNumberCommonTemplate()}`}};i.getObjectStatusDependentsTemplate=function t(){var i,a,n;const{valueDataModelPath:o}=e.getTemplatingObjects(this);const r=o===null||o===void 0?void 0:(i=o.targetObject)===null||i===void 0?void 0:(a=i.annotations)===null||a===void 0?void 0:(n=a.Common)===null||n===void 0?void 0:n.SemanticObject;if(this.hasQuickViewFacets||r){return`<dependents><macro:QuickView\n\t\t\t\t\t\txmlns:macro="sap.fe.macros"\n\t\t\t\t\t\tdataField="{metaPath>}"\n\t\t\t\t\t\tsemanticObject="${this.semanticObject}"\n\t\t\t\t\t\tcontextPath="{contextPath>}"\n\t\t\t\t\t/></dependents>`}return""};i.getObjectStatusTemplate=function t(){var i;const{dataModelPath:a,valueDataModelPath:n,dataPointConverted:o}=e.getTemplatingObjects(this);const r=n&&n.targetObject;this.hasQuickViewFacets=r?N(a,r):false;this.semanticObject="";let l,s=[];if(typeof o.Value==="object"){var c,d;l=(c=o.Value.$target)===null||c===void 0?void 0:(d=c.annotations)===null||d===void 0?void 0:d.Common;s=Q(l)}if(!!this.semanticObject&&this.semanticObject[0]==="{"){s.push({key:this.semanticObject.substring(1,this.semanticObject.length-2),value:this.semanticObject})}this.semanticObjects=A(s);if(!this.semanticObject&&(n===null||n===void 0?void 0:(i=n.navigationProperties)===null||i===void 0?void 0:i.length)>0){n.navigationProperties.forEach(t=>{var e,i;if(t!==null&&t!==void 0&&(e=t.annotations)!==null&&e!==void 0&&(i=e.Common)!==null&&i!==void 0&&i.SemanticObject){this.semanticObject=t.annotations.Common.SemanticObject;this.hasSemanticObjectOnNavigation=true}})}let p=J(o,a);if(p==="None"&&n){p=this.hasQuickViewFacets?"Information":u.getStateDependingOnSemanticObjectTargets(n)}const m=u.hasSemanticObjectTargets(n);const h=this.hasQuickViewFacets||m;p=p?p:J(o,a);const v=this.formatOptions.showEmptyIndicator??false?"On":undefined;const b=k(a,this.formatOptions,false);const f=G(o,a);return nt`<ObjectStatus
						xmlns="sap.m"
						${this.attr("id",this.idPrefix?K([this.idPrefix,"ObjectStatus-Field-display"]):undefined)}
						core:require="{ FieldRuntime: 'sap/fe/macros/field/FieldRuntime' }"
						${this.attr("class",this.formatOptions.dataPointStyle==="large"?"sapMObjectStatusLarge":undefined)}
						${this.attr("icon",f)}
						${this.attr("tooltip",this.getTooltipValue())}
						${this.attr("state",p)}
						${this.attr("text",b)}
						${this.attr("emptyIndicatorMode",v)}
						${this.attr("active",h)}
						press="FieldRuntime.pressLink"
						${this.attr("ariaLabelledBy",this.ariaLabelledBy!==null?this.ariaLabelledBy:undefined)}
						${this.attr("modelContextChange",u.hasSemanticObjectsWithPath(this.semanticObjects.getObject())?u.computeSemanticLinkModelContextChange(this.semanticObjects.getObject(),n):undefined)}
				>${this.getObjectStatusDependentsTemplate()}
				</ObjectStatus>`};i.getTooltipValue=function t(){var i,a,n;const{dataModelPath:o,dataPointConverted:r}=e.getTemplatingObjects(this);return Z(r===null||r===void 0?void 0:(i=r.annotations)===null||i===void 0?void 0:(a=i.Common)===null||a===void 0?void 0:(n=a.QuickInfo)===null||n===void 0?void 0:n.valueOf(),q(o))};i.getTargetValueBinding=function t(){const{dataModelPath:i,dataPointConverted:a}=e.getTemplatingObjects(this);return Z(a.TargetValue,q(i))};i.getTemplate=function t(){switch(this.visualization){case"Rating":{return this.getRatingIndicatorTemplate()}case"Progress":{return this.getProgressIndicatorTemplate()}case"ObjectNumber":{return this.getObjectNumberTemplate()}default:{return this.getObjectStatusTemplate()}}};return e}(rt),T=pt($.prototype,"idPrefix",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),x=pt($.prototype,"metaPath",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),V=pt($.prototype,"ariaLabelledBy",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),S=pt($.prototype,"visualization",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),w=pt($.prototype,"visible",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),M=pt($.prototype,"hasQuickViewFacets",[g],{configurable:true,enumerable:true,writable:true,initializer:null}),z=pt($.prototype,"semanticObjects",[O],{configurable:true,enumerable:true,writable:true,initializer:null}),F=pt($.prototype,"formatOptions",[P],{configurable:true,enumerable:true,writable:true,initializer:null}),C=pt($.prototype,"contextPath",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),$))||j);D=ht;return D},false);
//# sourceMappingURL=DataPoint.js.map