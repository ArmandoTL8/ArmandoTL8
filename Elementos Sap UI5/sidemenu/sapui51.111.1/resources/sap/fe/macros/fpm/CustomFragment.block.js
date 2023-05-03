/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/buildingBlocks/BuildingBlockRuntime"],function(e,t){"use strict";var r,i,n,a,o,l,u,c,f;var s={};var p=t.xml;var m=e.defineBuildingBlock;var b=e.BuildingBlockBase;var d=e.blockAttribute;function g(e,t,r,i){if(!r)return;Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(i):void 0})}function v(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function y(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;h(e,t)}function h(e,t){h=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return h(e,t)}function w(e,t,r,i,n){var a={};Object.keys(i).forEach(function(e){a[e]=i[e]});a.enumerable=!!a.enumerable;a.configurable=!!a.configurable;if("value"in a||a.initializer){a.writable=true}a=r.slice().reverse().reduce(function(r,i){return i(e,t,r)||r},a);if(n&&a.initializer!==void 0){a.value=a.initializer?a.initializer.call(n):void 0;a.initializer=undefined}if(a.initializer===void 0){Object.defineProperty(e,t,a);a=null}return a}function z(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let B=(r=m({name:"CustomFragment",namespace:"sap.fe.macros.fpm"}),i=d({type:"string",required:true}),n=d({type:"sap.ui.model.Context",required:false}),a=d({type:"string",required:true}),r(o=(l=function(e){y(t,e);function t(){var t;for(var r=arguments.length,i=new Array(r),n=0;n<r;n++){i[n]=arguments[n]}t=e.call(this,...i)||this;g(t,"id",u,v(t));g(t,"contextPath",c,v(t));g(t,"fragmentName",f,v(t));return t}s=t;var r=t.prototype;r.getTemplate=function e(){const t=this.fragmentName+"-JS".replace(/\//g,".");return p`<core:Fragment
			xmlns:compo="http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1"
			fragmentName="${t}"
			id="${this.id}"
			type="CUSTOM"
		>
			<compo:fragmentContent>
				<core:FragmentDefinition>
					<core:Fragment fragmentName="${this.fragmentName}" type="XML" />
				</core:FragmentDefinition>
			</compo:fragmentContent>
		</core:Fragment>`};return t}(b),u=w(l.prototype,"id",[i],{configurable:true,enumerable:true,writable:true,initializer:null}),c=w(l.prototype,"contextPath",[n],{configurable:true,enumerable:true,writable:true,initializer:null}),f=w(l.prototype,"fragmentName",[a],{configurable:true,enumerable:true,writable:true,initializer:null}),l))||o);s=B;return s},false);
//# sourceMappingURL=CustomFragment.block.js.map