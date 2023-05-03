/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/buildingBlocks/BuildingBlockRuntime","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/PropertyFormatters","sap/fe/macros/CommonHelper","sap/fe/macros/field/FieldHelper","sap/fe/macros/filter/FilterFieldHelper","sap/fe/macros/filter/FilterFieldTemplating","sap/fe/core/helpers/BindingToolkit","sap/fe/core/templating/DataModelPathHelper"],function(e,t,i,r,a,l,n,o,s,u,p,d){"use strict";var c,f,m,b,h,y,g,v,P,F,x,$,C,O,B,w,T;var z={};var D=d.getTargetObjectPath;var E=p.getExpressionFromAnnotation;var I=p.compileExpression;var V=u.getFilterFieldDisplayFormat;var j=l.getRelativePropertyPath;var H=a.generate;var k=i.xml;var q=i.SAP_UI_MODEL_CONTEXT;var A=t.defineBuildingBlock;var M=t.BuildingBlockBase;var R=t.blockAttribute;function S(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function _(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function L(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;U(e,t)}function U(e,t){U=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return U(e,t)}function N(e,t,i,r,a){var l={};Object.keys(r).forEach(function(e){l[e]=r[e]});l.enumerable=!!l.enumerable;l.configurable=!!l.configurable;if("value"in l||l.initializer){l.writable=true}l=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},l);if(a&&l.initializer!==void 0){l.value=l.initializer?l.initializer.call(a):void 0;l.initializer=undefined}if(l.initializer===void 0){Object.defineProperty(e,t,l);l=null}return l}function W(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let X=(c=A({name:"FilterField",namespace:"sap.fe.macros.internal"}),f=R({type:"sap.ui.model.Context",required:true,isPublic:true}),m=R({type:"sap.ui.model.Context",required:true,isPublic:true}),b=R({type:"sap.ui.model.Context",isPublic:true}),h=R({type:"string",defaultValue:"FilterField",isPublic:true}),y=R({type:"string",defaultValue:"FilterFieldValueHelp",isPublic:true}),g=R({type:"boolean",defaultValue:true,isPublic:true}),v=R({type:"string",defaultValue:"",isPublic:true}),c(P=(F=function(t){L(i,t);function i(e,i,a){var l,u,p,d;var c;c=t.call(this,e,i,a)||this;S(c,"property",x,_(c));S(c,"contextPath",$,_(c));S(c,"visualFilter",C,_(c));S(c,"idPrefix",O,_(c));S(c,"vhIdPrefix",B,_(c));S(c,"useSemanticDateRange",w,_(c));S(c,"settings",T,_(c));const f=r.convertMetaModelContext(c.property);const m=r.getInvolvedDataModelObjects(c.property,c.contextPath);const b=f.name,h=!!((l=f.annotations)!==null&&l!==void 0&&(u=l.Common)!==null&&u!==void 0&&u.ValueListWithFixedValues);c.controlId=c.idPrefix&&H([c.idPrefix,b]);c.sourcePath=D(m);c.dataType=s.getDataType(f);const y=(f===null||f===void 0?void 0:(p=f.annotations)===null||p===void 0?void 0:(d=p.Common)===null||d===void 0?void 0:d.Label)||b;const g=E(y);c.label=I(g)||b;c.conditionsBinding=s.getConditionsBinding(m)||"";c.placeholder=s.getPlaceholder(f);c.vfEnabled=!!c.visualFilter&&!(c.idPrefix&&c.idPrefix.indexOf("Adaptation")>-1);c.vfId=c.vfEnabled?H([c.idPrefix,b,"VisualFilter"]):undefined;const v=c.property,P=v.getModel(),F=o.valueHelpPropertyForFilterField(v),z=n.isPropertyFilterable(v),k=v.getObject(),q={context:v};c.display=V(m,f,q);c.isFilterable=!(z===false||z==="false");c.maxConditions=s.maxConditions(k,q);c.dataTypeConstraints=s.constraints(k,q);c.dataTypeFormatOptions=s.formatOptions(k,q);c.required=s.isRequiredInFilter(k,q);c.operators=o.operators(v,k,c.useSemanticDateRange,c.settings||"",c.contextPath.getPath());const A=P.createBindingContext(F);const M=A.getObject(),R={context:A},L=j(M,R),U=j(k,q);c.fieldHelpProperty=o.getFieldHelpPropertyForFilterField(v,k,k.$Type,c.vhIdPrefix,U,L,h,c.useSemanticDateRange);return c}z=i;var a=i.prototype;a.getVisualFilterContent=function e(){var t,i;let r=this.visualFilter,a=k``;if(!this.vfEnabled||!r){return a}if((t=r)!==null&&t!==void 0&&(i=t.isA)!==null&&i!==void 0&&i.call(t,q)){r=r.getObject()}const{contextPath:l,presentationAnnotation:o,outParameter:s,inParameters:u,valuelistProperty:p,selectionVariantAnnotation:d,multipleSelectionAllowed:c,required:f,requiredProperties:m=[],showOverlayInitially:b,renderLineChart:h}=r;a=k`
				<macro:VisualFilter
					id="${this.vfId}"
					contextPath="${l}"
					metaPath="${o}"
					outParameter="${s}"
					inParameters="${u}"
					valuelistProperty="${p}"
					selectionVariantAnnotation="${d}"
					multipleSelectionAllowed="${c}"
					required="${f}"
					requiredProperties="${n.stringifyCustomData(m)}"
					showOverlayInitially="${b}"
					renderLineChart="${h}"
					filterBarEntityType="${l}"
				/>
			`;return a};a.getTemplate=async function t(){let i=``;if(this.isFilterable){let t;try{t=await this.display}catch(t){e.error(`FE : FilterField BuildingBlock : Error fetching display property for ${this.sourcePath} : ${t}`)}i=k`
				<mdc:FilterField
					xmlns:mdc="sap.ui.mdc"
					xmlns:macro="sap.fe.macros"
					xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
					xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					unittest:id="UnitTest::FilterField"
					customData:sourcePath="${this.sourcePath}"
					id="${this.controlId}"
					delegate="{name: 'sap/fe/macros/field/FieldBaseDelegate', payload:{isFilterField:true}}"
					label="${this.label}"
					dataType="${this.dataType}"
					display="${t}"
					maxConditions="${this.maxConditions}"
					fieldHelp="${this.fieldHelpProperty}"
					conditions="${this.conditionsBinding}"
					dataTypeConstraints="${this.dataTypeConstraints}"
					dataTypeFormatOptions="${this.dataTypeFormatOptions}"
					required="${this.required}"
					operators="${this.operators}"
					placeholder="${this.placeholder}"

				>
					${this.vfEnabled?this.getVisualFilterContent():k``}
				</mdc:FilterField>
			`}return i};return i}(M),x=N(F.prototype,"property",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),$=N(F.prototype,"contextPath",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),C=N(F.prototype,"visualFilter",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),O=N(F.prototype,"idPrefix",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),B=N(F.prototype,"vhIdPrefix",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),w=N(F.prototype,"useSemanticDateRange",[g],{configurable:true,enumerable:true,writable:true,initializer:null}),T=N(F.prototype,"settings",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),F))||P);z=X;return z},false);
//# sourceMappingURL=FilterField.js.map