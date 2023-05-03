/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/buildingBlocks/BuildingBlockRuntime","sap/fe/core/formatters/KPIFormatter","sap/fe/core/helpers/BindingToolkit"],function(e,t,i,r){"use strict";var n,a,o,l,s,u,p,c,d,f,g;var b={};var m=r.resolveBindingString;var h=r.pathInModel;var y=r.formatResult;var v=t.xml;var P=e.defineBuildingBlock;var x=e.BuildingBlockBase;var B=e.blockAttribute;function k(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function z(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function E(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;w(e,t)}function w(e,t){w=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return w(e,t)}function $(e,t,i,r,n){var a={};Object.keys(r).forEach(function(e){a[e]=r[e]});a.enumerable=!!a.enumerable;a.configurable=!!a.configurable;if("value"in a||a.initializer){a.writable=true}a=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},a);if(n&&a.initializer!==void 0){a.value=a.initializer?a.initializer.call(n):void 0;a.initializer=undefined}if(a.initializer===void 0){Object.defineProperty(e,t,a);a=null}return a}function K(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let O=(n=P({name:"KPITag",namespace:"sap.fe.macros"}),a=B({type:"string",required:true}),o=B({type:"sap.ui.model.Context",required:true}),l=B({type:"string",required:true}),s=B({type:"boolean",required:false}),n(u=(p=function(e){E(t,e);function t(){var t;for(var i=arguments.length,r=new Array(i),n=0;n<i;n++){r[n]=arguments[n]}t=e.call(this,...r)||this;k(t,"id",c,z(t));k(t,"metaPath",d,z(t));k(t,"kpiModelName",f,z(t));k(t,"hasUnit",g,z(t));return t}b=t;var r=t.prototype;r.getKpiPropertyExpression=function e(t){return h(`/${this.id}/manifest/sap.card/data/json/${t}`,this.kpiModelName)};r.getBindingExpressions=function e(){const t=this.metaPath.getProperty("Title");if(!t){return{text:undefined,tooltip:undefined}}const r=m(t);return{text:y([r],i.labelFormat),tooltip:y([r,this.getKpiPropertyExpression("mainValueUnscaled"),this.getKpiPropertyExpression("mainUnit"),this.getKpiPropertyExpression("mainCriticality"),String(this.hasUnit)],i.tooltipFormat)}};r.getTemplate=function e(){const{text:t,tooltip:i}=this.getBindingExpressions();return v`<m:GenericTag
			id="kpiTag-${this.id}"
			text="${t}"
			design="StatusIconHidden"
			status="${this.getKpiPropertyExpression("mainCriticality")}"
			class="sapUiTinyMarginBegin"
			tooltip="${i}"
			press=".kpiManagement.onKPIPressed(\${$source>},'${this.id}')"
		>
			<m:ObjectNumber
				state="${this.getKpiPropertyExpression("mainCriticality")}"
				emphasized="false"
				number="${this.getKpiPropertyExpression("mainValue")}"
				unit="${this.getKpiPropertyExpression("mainUnit")}"

			/>
		</m:GenericTag>`};return t}(x),c=$(p.prototype,"id",[a],{configurable:true,enumerable:true,writable:true,initializer:null}),d=$(p.prototype,"metaPath",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),f=$(p.prototype,"kpiModelName",[l],{configurable:true,enumerable:true,writable:true,initializer:null}),g=$(p.prototype,"hasUnit",[s],{configurable:true,enumerable:true,writable:true,initializer:null}),p))||u);b=O;return b},false);
//# sourceMappingURL=KPITag.block.js.map