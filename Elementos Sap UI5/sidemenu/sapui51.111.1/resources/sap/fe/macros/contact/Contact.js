/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/buildingBlocks/BuildingBlockRuntime","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/DataModelPathHelper"],function(e,t,i,r,a,n){"use strict";var l,o,u,s,c,d,f,p,b,m,h,v,g,y,P;var x={};var B=n.getRelativePaths;var w=a.generate;var z=r.getExpressionFromAnnotation;var k=i.getInvolvedDataModelObjects;var O=i.convertMetaModelContext;var C=t.xml;var I=e.defineBuildingBlock;var _=e.BuildingBlockBase;var j=e.blockAttribute;function F(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function M(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function $(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;D(e,t)}function D(e,t){D=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return D(e,t)}function E(e,t,i,r,a){var n={};Object.keys(r).forEach(function(e){n[e]=r[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},n);if(a&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(a):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function L(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let R=(l=I({name:"Contact",namespace:"sap.fe.macros",designtime:"sap/fe/macros/Contact.designtime"}),o=j({type:"string"}),u=j({type:"string"}),s=j({type:"sap.ui.model.Context",$Type:["com.sap.vocabularies.Communication.v1.ContactType"],required:true}),c=j({type:"sap.ui.model.Context",$kind:["EntitySet","NavigationProperty","EntityType","Singleton"]}),d=j({type:"string"}),f=j({type:"boolean"}),l(p=(b=function(e){$(t,e);function t(){var t;for(var i=arguments.length,r=new Array(i),a=0;a<i;a++){r[a]=arguments[a]}t=e.call(this,...r)||this;F(t,"idPrefix",m,M(t));F(t,"_flexId",h,M(t));F(t,"metaPath",v,M(t));F(t,"contextPath",g,M(t));F(t,"ariaLabelledBy",y,M(t));F(t,"visible",P,M(t));return t}x=t;var i=t.prototype;i.getTemplate=function e(){let t;if(this._flexId){t=this._flexId}else{t=this.idPrefix?w([this.idPrefix,"Field-content"]):undefined}const i=O(this.metaPath);const r=k(this.metaPath,this.contextPath);const a=z(i.fn,B(r));const n={name:"sap/fe/macros/contact/ContactDelegate",payload:{contact:this.metaPath.getPath()}};return C`<mdc:Field
		xmlns:mdc="sap.ui.mdc"
		delegate="{name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate'}"
		${this.attr("id",t)}
		editMode="Display"
		width="100%"
		${this.attr("visible",this.visible)}
		${this.attr("value",a)}
		${this.attr("ariaLabelledBy",this.ariaLabelledBy)}
	>
		<mdc:fieldInfo>
			<mdc:Link
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				enablePersonalization="false"
				${this.attr("delegate",JSON.stringify(n))}
			/>
		</mdc:fieldInfo>
	</mdc:Field>
			`};return t}(_),m=E(b.prototype,"idPrefix",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),h=E(b.prototype,"_flexId",[u],{configurable:true,enumerable:true,writable:true,initializer:null}),v=E(b.prototype,"metaPath",[s],{configurable:true,enumerable:true,writable:true,initializer:null}),g=E(b.prototype,"contextPath",[c],{configurable:true,enumerable:true,writable:true,initializer:null}),y=E(b.prototype,"ariaLabelledBy",[d],{configurable:true,enumerable:true,writable:true,initializer:null}),P=E(b.prototype,"visible",[f],{configurable:true,enumerable:true,writable:true,initializer:null}),b))||p);x=R;return x},false);
//# sourceMappingURL=Contact.js.map