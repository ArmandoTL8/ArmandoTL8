/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define([],function(){"use strict";function t(e){var r=this;var i=false;var n=false;this.isKey=function(){return i};this.isParameterEntitySetKeyProperty=function(){return n};this.getAttribute=function(t){if(typeof this[t]!=="function"){return this[t]}};this.clone=function(){return new t(e)};function a(t,e){switch(t){case"isKey":if(e===true){i=true}break;case"isParameterEntitySetKeyProperty":if(e===true){n=true}break;default:if(typeof r[t]!=="function"){r[t]=e}}return r}function u(){for(var t in e){switch(t){case"dataType":for(var r in e.dataType){a(r,e.dataType[r])}break;default:a(t,e[t])}}}u()}sap.apf.core.MetadataProperty=t;return{constructor:t}},true);
//# sourceMappingURL=metadataProperty.js.map