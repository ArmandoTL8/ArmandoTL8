/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/service/Service","sap/ui/core/service/ServiceFactory","sap/ui/VersionInfo","../converters/MetaModelConverter"],function(t,e,i,n,r){"use strict";var s={};var a=r.DefaultEnvironmentCapabilities;function o(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;c(t,e)}function c(t,e){c=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,i){e.__proto__=i;return e};return c(t,e)}let p=function(e){o(i,e);function i(){return e.apply(this,arguments)||this}s.EnvironmentCapabilitiesService=i;var r=i.prototype;r.init=function t(){this.initPromise=new Promise((t,e)=>{this.resolveFn=t;this.rejectFn=e});const e=this.getContext();this.environmentCapabilities=Object.assign({},a);n.load().then(t=>{this.environmentCapabilities.Chart=!!t.libraries.find(t=>t.name==="sap.viz");this.environmentCapabilities.MicroChart=!!t.libraries.find(t=>t.name==="sap.suite.ui.microchart");this.environmentCapabilities.UShell=!!(sap&&sap.ushell&&sap.ushell.Container);this.environmentCapabilities.IntentBasedNavigation=!!(sap&&sap.ushell&&sap.ushell.Container);this.environmentCapabilities=Object.assign(this.environmentCapabilities,e.settings);this.resolveFn(this)}).catch(this.rejectFn)};r.resolveLibrary=function e(i){return new Promise(function(e){try{t.loadLibrary(`${i.replace(/\./g,"/")}`,{async:true}).then(function(){e(true)}).catch(function(){e(false)})}catch(t){e(false)}})};r.setCapabilities=function t(e){this.environmentCapabilities=e};r.setCapability=function t(e,i){this.environmentCapabilities[e]=i};r.getCapabilities=function t(){return this.environmentCapabilities};r.getInterface=function t(){return this};return i}(e);s.EnvironmentCapabilitiesService=p;let u=function(t){o(e,t);function e(){return t.apply(this,arguments)||this}var i=e.prototype;i.createInstance=function t(e){const i=new p(e);return i.initPromise};return e}(i);return u},false);
//# sourceMappingURL=EnvironmentServiceFactory.js.map