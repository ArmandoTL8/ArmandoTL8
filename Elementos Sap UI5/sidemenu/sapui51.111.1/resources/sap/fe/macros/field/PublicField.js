/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/buildingBlocks/BuildingBlockRuntime","sap/fe/core/helpers/BindingToolkit","sap/fe/macros/field/FieldHelper"],function(e,t,i,r){"use strict";var a,n,o,l,s,u,p,c,d,f,h,m,b,y,x,g,O,v,w;var M={};var $=i.resolveBindingString;var D=i.ifElse;var P=i.equal;var E=i.compileExpression;var B=t.xml;var z=e.defineBuildingBlock;var j=e.BuildingBlockBase;var F=e.blockEvent;var k=e.blockAttribute;function T(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function H(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function V(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;q(e,t)}function q(e,t){q=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return q(e,t)}function _(e,t,i,r,a){var n={};Object.keys(r).forEach(function(e){n[e]=r[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},n);if(a&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(a):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}function A(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let C=(a=z({name:"Field",namespace:"sap.fe.macros"}),n=k({type:"string",isPublic:true,required:true}),o=k({type:"sap.ui.model.Context",required:true}),l=k({type:"sap.ui.model.Context",required:true}),s=k({type:"boolean",required:false}),u=k({type:"string",required:false}),p=k({type:"string",required:false}),c=k({type:"object",validate:function(e){if(e.displayMode&&!["Value","Description","ValueDescription","DescriptionValue"].includes(e.displayMode)){throw new Error(`Allowed value ${e.displayMode} for displayMode does not match`)}if(e.measureDisplayMode&&!["Hidden","ReadOnly"].includes(e.measureDisplayMode)){throw new Error(`Allowed value ${e.measureDisplayMode} for measureDisplayMode does not match`)}if(e.textExpandBehaviorDisplay&&!["InPlace","Popover"].includes(e.textExpandBehaviorDisplay)){throw new Error(`Allowed value ${e.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`)}return e}}),d=F(),a(f=(h=function(e){V(t,e);function t(t){var i;i=e.call(this,t)||this;T(i,"id",m,H(i));T(i,"metaPath",b,H(i));T(i,"contextPath",y,H(i));T(i,"readOnly",x,H(i));T(i,"semanticObject",g,H(i));T(i,"editModeExpression",O,H(i));T(i,"formatOptions",v,H(i));T(i,"change",w,H(i));if(i.readOnly!==undefined){i.editModeExpression=E(D(P($(i.readOnly,"boolean"),true),"Display","Editable"))}return i}M=t;var i=t.prototype;i.getFormatOptions=function e(){return B`
		<internalMacro:formatOptions
			textAlignMode="Form"
			showEmptyIndicator="true"
			displayMode="${this.formatOptions.displayMode}"
			measureDisplayMode="${this.formatOptions.measureDisplayMode}"
			textLinesEdit="${this.formatOptions.textLinesEdit}"
			textMaxLines="${this.formatOptions.textMaxLines}"
			textMaxCharactersDisplay="${this.formatOptions.textMaxCharactersDisplay}"
			textExpandBehaviorDisplay="${this.formatOptions.textExpandBehaviorDisplay}"
			textMaxLength="${this.formatOptions.textMaxLength}"
			>
			${this.writeDateFormatOptions()}
		</internalMacro:formatOptions>
			`};i.writeDateFormatOptions=function e(){if(this.formatOptions.showTime||this.formatOptions.showDate||this.formatOptions.showTimezone){return B`<internalMacro:dateFormatOptions showTime="${this.formatOptions.showTime}" 
				showDate="${this.formatOptions.showDate}" 
				showTimezone="${this.formatOptions.showTimezone}" 
				/>`}return""};i.getPossibleValueHelpTemplate=function e(){const t=r.valueHelpProperty(this.metaPath);const i=this.metaPath.getModel().createBindingContext(t,this.metaPath);const a=r.hasValueHelpAnnotation(i.getObject("@"));if(a){return B`
			<internalMacro:dependents>
				<macros:ValueHelp _flexId="${this.id}-content_FieldValueHelp" property="${i}" contextPath="${this.contextPath}" />
			</internalMacro:dependents>`}return""};i.getTemplate=function e(){const t=this.contextPath.getPath();const i=this.metaPath.getPath();return B`
		<internalMacro:Field
			xmlns:internalMacro="sap.fe.macros.internal"
			entitySet="${t}"
			dataField="${i}"
			editMode="${this.editModeExpression}"
			onChange="${this.change}"
			_flexId="${this.id}"
			semanticObject="${this.semanticObject}"
		>
			${this.getFormatOptions()}
			${this.getPossibleValueHelpTemplate()}
		</internalMacro:Field>`};return t}(j),m=_(h.prototype,"id",[n],{configurable:true,enumerable:true,writable:true,initializer:null}),b=_(h.prototype,"metaPath",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),y=_(h.prototype,"contextPath",[l],{configurable:true,enumerable:true,writable:true,initializer:null}),x=_(h.prototype,"readOnly",[s],{configurable:true,enumerable:true,writable:true,initializer:null}),g=_(h.prototype,"semanticObject",[u],{configurable:true,enumerable:true,writable:true,initializer:null}),O=_(h.prototype,"editModeExpression",[p],{configurable:true,enumerable:true,writable:true,initializer:null}),v=_(h.prototype,"formatOptions",[c],{configurable:true,enumerable:true,writable:true,initializer:function(){return{}}}),w=_(h.prototype,"change",[d],{configurable:true,enumerable:true,writable:true,initializer:function(){return""}}),h))||f);M=C;return M},false);
//# sourceMappingURL=PublicField.js.map