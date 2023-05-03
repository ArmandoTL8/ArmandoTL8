/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./DataSource"],function(e){function t(e,t){var n=typeof Symbol!=="undefined"&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=r(e))||t&&e&&typeof e.length==="number"){if(n)e=n;var u=0;var o=function(){};return{s:o,n:function(){if(u>=e.length)return{done:true};return{done:false,value:e[u++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a=true,i=false,c;return{s:function(){n=n.call(e)},n:function(){var e=n.next();a=e.done;return e},e:function(e){i=true;c=e},f:function(){try{if(!a&&n.return!=null)n.return()}finally{if(i)throw c}}}}function r(e,t){if(!e)return;if(typeof e==="string")return n(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor)r=e.constructor.name;if(r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return n(e,t)}function n(e,t){if(t==null||t>e.length)t=e.length;for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function u(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function o(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function a(e,t,r){if(t)o(e.prototype,t);if(r)o(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function i(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)c(e,t)}function c(e,t){c=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return c(e,t)}function f(e){var t=d();return function r(){var n=p(e),u;if(t){var o=p(this).constructor;u=Reflect.construct(n,arguments,o)}else{u=n.apply(this,arguments)}return s(this,u)}}function s(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return l(e)}function l(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function d(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function p(e){p=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return p(e)}function b(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var y=e["DataSource"];var S=function(e){i(n,e);var r=f(n);function n(e){var t,o;var a;u(this,n);a=r.call(this,e);b(l(a),"includeApps",false);b(l(a),"subDataSources",[]);b(l(a),"undefinedSubDataSourceIds",[]);a.includeApps=e.includeApps;a.subDataSources=(t=e.subDataSources)!==null&&t!==void 0?t:a.subDataSources;a.undefinedSubDataSourceIds=(o=e.undefinedSubDataSourceIds)!==null&&o!==void 0?o:a.undefinedSubDataSourceIds;return a}a(n,[{key:"isIncludeApps",value:function e(){return this.includeApps}},{key:"setIncludeApps",value:function e(t){this.includeApps=t}},{key:"addSubDataSource",value:function e(t){this.subDataSources.push(t)}},{key:"clearSubDataSources",value:function e(){this.subDataSources=[]}},{key:"getSubDataSources",value:function e(){return this.subDataSources}},{key:"hasSubDataSource",value:function e(r){var n=t(this.subDataSources),u;try{for(n.s();!(u=n.n()).done;){var o=u.value;if(o.id===r){return true}}}catch(e){n.e(e)}finally{n.f()}return false}},{key:"addUndefinedSubDataSourceId",value:function e(t){this.undefinedSubDataSourceIds.push(t)}},{key:"clearUndefinedSubDataSourceIds",value:function e(){this.undefinedSubDataSourceIds=[]}},{key:"getUndefinedSubDataSourceIds",value:function e(){return this.undefinedSubDataSourceIds}}]);return n}(y);var v={__esModule:true};v.UserCategoryDataSource=S;return v})})();
//# sourceMappingURL=UserCategoryDataSource.js.map