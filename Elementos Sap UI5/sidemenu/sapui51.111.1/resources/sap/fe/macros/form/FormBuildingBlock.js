/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/buildingBlocks/BuildingBlockRuntime","sap/fe/core/converters/controls/Common/Form","sap/fe/core/converters/helpers/BindingHelper","sap/fe/core/converters/helpers/ID","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/templating/DataModelPathHelper","sap/fe/macros/form/FormHelper","sap/ui/model/odata/v4/AnnotationHelper"],function(e,t,a,i,r,n,o,l,s,u){"use strict";var c,p,m,f,b,h,d,y,g,v,P,C,$,L,F,x,S,w,T,M,z,I,O,k,E,j,B,_,A;var D={};var X=l.getContextRelativeTargetObjectPath;var V=o.resolveBindingString;var R=o.ifElse;var N=o.equal;var U=o.compileExpression;var q=n.getInvolvedDataModelObjects;var H=r.getFormContainerID;var Q=i.UI;var G=a.createFormDefinition;var W=t.xml;var J=e.defineBuildingBlock;var K=e.BuildingBlockBase;var Y=e.blockEvent;var Z=e.blockAttribute;var ee=e.blockAggregation;function te(e,t,a,i){if(!a)return;Object.defineProperty(e,t,{enumerable:a.enumerable,configurable:a.configurable,writable:a.writable,value:a.initializer?a.initializer.call(i):void 0})}function ae(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function ie(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;re(e,t)}function re(e,t){re=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,a){t.__proto__=a;return t};return re(e,t)}function ne(e,t,a,i,r){var n={};Object.keys(i).forEach(function(e){n[e]=i[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=a.slice().reverse().reduce(function(a,i){return i(e,t,a)||a},n);if(r&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(r):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function oe(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let le=(c=J({name:"Form",namespace:"sap.fe.macros.internal",publicNamespace:"sap.fe.macros"}),p=Z({type:"string",isPublic:true,required:true}),m=Z({type:"sap.ui.model.Context",required:true,isPublic:true,$kind:["EntitySet","NavigationProperty","EntityType"]}),f=Z({type:"sap.ui.model.Context",isPublic:true,required:true}),b=Z({type:"sap.ui.model.Context"}),h=Z({type:"boolean"}),d=Z({type:"boolean",defaultValue:true}),y=Z({type:"string",isPublic:true}),g=Z({type:"sap.ui.core.TitleLevel",isPublic:true,defaultValue:"Auto"}),v=Z({type:"string"}),P=Z({type:"string",defaultValue:"true"}),C=Y(),$=ee({type:"sap.fe.macros.form.FormElement",isPublic:true,slot:"formElements",isDefault:true}),L=Z({type:"object",isPublic:true}),c(F=(x=function(e){ie(t,e);function t(t,a,i){var r;r=e.call(this,t,a,i)||this;te(r,"id",S,ae(r));te(r,"contextPath",w,ae(r));te(r,"metaPath",T,ae(r));te(r,"formContainers",M,ae(r));te(r,"useFormContainerLabels",z,ae(r));te(r,"partOfPreview",I,ae(r));te(r,"title",O,ae(r));te(r,"titleLevel",k,ae(r));te(r,"displayMode",E,ae(r));te(r,"isVisible",j,ae(r));te(r,"onChange",B,ae(r));te(r,"formElements",_,ae(r));te(r,"layout",A,ae(r));if(r.metaPath&&r.contextPath&&(r.formContainers===undefined||r.formContainers===null)){const e=q(r.metaPath,r.contextPath);const t={};let a=e.targetObject;let n=false;if(a&&a.$Type==="com.sap.vocabularies.UI.v1.FieldGroupType"){n=true;a={$Type:"com.sap.vocabularies.UI.v1.ReferenceFacet",Label:a.Label,Target:{$target:a,fullyQualifiedName:a.fullyQualifiedName,path:"",term:"",type:"AnnotationPath",value:X(e)},annotations:{},fullyQualifiedName:a.fullyQualifiedName};t[a.Target.value]={fields:r.formElements}}const o=r.getConverterContext(e,undefined,i,t);const l=G(a,r.isVisible,o);if(n){l.formContainers[0].annotationPath=r.metaPath.getPath()}r.formContainers=l.formContainers;r.useFormContainerLabels=l.useFormContainerLabels;r.facetType=a&&a.$Type}else{var n;r.facetType=(n=r.metaPath.getObject())===null||n===void 0?void 0:n.$Type}if(!r.isPublic){r._apiId=r.createId("Form");r._contentId=r.id}else{r._apiId=r.id;r._contentId=`${r.id}-content`}if(r.displayMode!==undefined){r._editable=U(R(N(V(r.displayMode,"boolean"),false),true,false))}else{r._editable=U(Q.IsEditable)}return r}D=t;var a=t.prototype;a.getDataFieldCollection=function e(t,a){const i=q(a).targetObject;let r;let n;if(i.$Type==="com.sap.vocabularies.UI.v1.ReferenceFacet"){r=u.getNavigationPath(i.Target.value);n=i}else{const e=this.contextPath.getPath();let t=a.getPath();if(t.startsWith(e)){t=t.substring(e.length)}r=u.getNavigationPath(t);n=t}const o=s.getFormContainerTitleLevel(this.title,this.titleLevel);const l=this.useFormContainerLabels&&i?u.label(i,{context:a}):"";const c=this.id?H(n):undefined;return W`
					<macro:FormContainer
					xmlns:macro="sap.fe.macros"
					${this.attr("id",c)}
					title="${l}"
					titleLevel="${o}"
					contextPath="${r?t.entitySet:this.contextPath}"
					metaPath="${a}"
					dataFieldCollection="${t.formElements}"
					navigationPath="${r}"
					visible="${t.isVisible}"
					displayMode="${this.displayMode}"
					onChange="${this.onChange}"
					actions="${t.actions}"
				>
				<macro:formElements>
					<slot name="formElements" />
				</macro:formElements>
			</macro:FormContainer>`};a.getFormContainers=function e(){if(this.formContainers.length===0){return""}if(this.facetType.indexOf("com.sap.vocabularies.UI.v1.CollectionFacet")>=0){return this.formContainers.map((e,t)=>{if(e.isVisible){const a=this.contextPath.getModel().createBindingContext(e.annotationPath,this.contextPath);const i=a.getObject();if(i.$Type==="com.sap.vocabularies.UI.v1.ReferenceFacet"&&s.isReferenceFacetPartOfPreview(i,this.partOfPreview)){if(i.Target.$AnnotationPath.$Type==="com.sap.vocabularies.Communication.v1.AddressType"){return W`<template:with path="formContainers>${t}" var="formContainer">
											<template:with path="formContainers>${t}/annotationPath" var="facet">
												<core:Fragment fragmentName="sap.fe.macros.form.AddressSection" type="XML" />
											</template:with>
										</template:with>`}return this.getDataFieldCollection(e,a)}}return""})}else if(this.facetType==="com.sap.vocabularies.UI.v1.ReferenceFacet"){return this.formContainers.map(e=>{if(e.isVisible){const t=this.contextPath.getModel().createBindingContext(e.annotationPath,this.contextPath);return this.getDataFieldCollection(e,t)}else{return""}})}return W``};a.getLayoutInformation=function e(){switch(this.layout.type){case"ResponsiveGridLayout":return W`<f:ResponsiveGridLayout adjustLabelSpan="${this.layout.adjustLabelSpan}"
													breakpointL="${this.layout.breakpointL}"
													breakpointM="${this.layout.breakpointM}"
													breakpointXL="${this.layout.breakpointXL}"
													columnsL="${this.layout.columnsL}"
													columnsM="${this.layout.columnsM}"
													columnsXL="${this.layout.columnsXL}"
													emptySpanL="${this.layout.emptySpanL}"
													emptySpanM="${this.layout.emptySpanM}"
													emptySpanS="${this.layout.emptySpanS}"
													emptySpanXL="${this.layout.emptySpanXL}"
													labelSpanL="${this.layout.labelSpanL}"
													labelSpanM="${this.layout.labelSpanM}"
													labelSpanS="${this.layout.labelSpanS}"
													labelSpanXL="${this.layout.labelSpanXL}"
													singleContainerFullSize="${this.layout.singleContainerFullSize}" />`;case"ColumnLayout":default:return W`<f:ColumnLayout
								columnsM="${this.layout.columnsM}"
								columnsL="${this.layout.columnsL}"
								columnsXL="${this.layout.columnsXL}"
								labelCellsLarge="${this.layout.labelCellsLarge}"
								emptyCellsLarge="${this.layout.emptyCellsLarge}" />`}};a.getTemplate=function e(){const t=this.onChange&&this.onChange.replace("{","\\{").replace("}","\\}")||"";const a=this.metaPath.getPath();const i=this.contextPath.getPath();if(!this.isVisible){return W``}else{return W`<macro:FormAPI xmlns:macro="sap.fe.macros.form"
					xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					xmlns:f="sap.ui.layout.form"
					xmlns:fl="sap.ui.fl"
					id="${this._apiId}"
					metaPath="${a}"
					contextPath="${i}">
				<f:Form
					fl:delegate='{
						"name": "sap/fe/macros/form/FormDelegate",
						"delegateType": "complete"
					}'
					id="${this._contentId}"
					editable="${this._editable}"
					macrodata:entitySet="{contextPath>@sapui.name}"
					visible="${this.isVisible}"
					class="sapUxAPObjectPageSubSectionAlignContent"
					macrodata:navigationPath="${i}"
					macrodata:onChange="${t}"
				>
					${this.addConditionally(this.title!==undefined,W`<f:title>
							<core:Title level="${this.titleLevel}" text="${this.title}" />
						</f:title>`)}
					<f:layout>
					${this.getLayoutInformation()}

					</f:layout>
					<f:formContainers>
						${this.getFormContainers()}
					</f:formContainers>
				</f:Form>
			</macro:FormAPI>`}};return t}(K),S=ne(x.prototype,"id",[p],{configurable:true,enumerable:true,writable:true,initializer:null}),w=ne(x.prototype,"contextPath",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),T=ne(x.prototype,"metaPath",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),M=ne(x.prototype,"formContainers",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),z=ne(x.prototype,"useFormContainerLabels",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),I=ne(x.prototype,"partOfPreview",[d],{configurable:true,enumerable:true,writable:true,initializer:null}),O=ne(x.prototype,"title",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),k=ne(x.prototype,"titleLevel",[g],{configurable:true,enumerable:true,writable:true,initializer:null}),E=ne(x.prototype,"displayMode",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),j=ne(x.prototype,"isVisible",[P],{configurable:true,enumerable:true,writable:true,initializer:null}),B=ne(x.prototype,"onChange",[C],{configurable:true,enumerable:true,writable:true,initializer:function(){return""}}),_=ne(x.prototype,"formElements",[$],{configurable:true,enumerable:true,writable:true,initializer:null}),A=ne(x.prototype,"layout",[L],{configurable:true,enumerable:true,writable:true,initializer:function(){return{type:"ColumnLayout",columnsM:2,columnsXL:6,columnsL:3,labelCellsLarge:12}}}),x))||F);D=le;return D},false);
//# sourceMappingURL=FormBuildingBlock.js.map