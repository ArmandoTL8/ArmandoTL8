/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/ManagedObject"],function(e){"use strict";var t=e.extend("sap.ui.fl.apply._internal.flexState.DataSelector",{metadata:{properties:{parentDataSelector:{type:"object"},cachedResult:{type:"any"},parameterKey:{type:"string"},initFunction:{type:"function"},executeFunction:{type:"function"},updateListeners:{type:"function[]",defaultValue:[]},checkInvalidation:{type:"function",defaultValue:function(){return true}}}},constructor:function(){e.apply(this,arguments);if(this.getParameterKey()){this.setCachedResult({})}var t=this.getParentDataSelector();if(t){this.onParentSelectorUpdate=this.checkUpdate.bind(this);t.addUpdateListener(this.onParentSelectorUpdate)}}});t.prototype.setParentDataSelector=function(e){if(e&&this.getParameterKey()&&this.getParameterKey()===e.getParameterKey()){throw new Error("Parameter key names must be unique")}return this.setProperty("parentDataSelector",e)};t.prototype.addUpdateListener=function(e){var t=this.getUpdateListeners();if(!t.includes(e)){this.setUpdateListeners([].concat(t,e))}};t.prototype.removeUpdateListener=function(e){var t=this.getUpdateListeners();this.setUpdateListeners(t.filter(function(t){return t!==e}))};t.prototype.exit=function(){var e=this.getParentDataSelector();if(e){e.removeUpdateListener(this.onParentSelectorUpdate)}};t.prototype._getParameterizedCachedResult=function(e){var t=this.getParameterKey();if(t){var a=e[t];return this.getCachedResult()[a]}return this.getCachedResult()};t.prototype._clearCache=function(e){if(e){this._setParameterizedCachedResult(e,null)}else{var t=!!this.getParameterKey();this.setCachedResult(t?{}:null)}};t.prototype.clearCachedResult=function(e){this._clearCache(e);this.getUpdateListeners().forEach(function(e){e()})};t.prototype._setParameterizedCachedResult=function(e,t){var a=this.getParameterKey();if(a&&e){var r={};var i=e[a];r[i]=t;return this.setCachedResult(Object.assign({},this.getCachedResult(),r))}return this.setCachedResult(t)};t.prototype.get=function(e){if(!this._bInitialized&&this.getInitFunction()){this.getInitFunction()(e);this._bInitialized=true}var t=this.getParameterKey();if(t&&!(e||{})[t]){throw new Error("Parameter '"+t+"' is missing")}var a=this._getParameterizedCachedResult(e);if(a!=null){return a}var r=this.getParentDataSelector();var i=r&&r.get(e);var n=this.getExecuteFunction()(i,(e||{})[t]);this._setParameterizedCachedResult(e,n);this.getUpdateListeners().forEach(function(e){e()});return n};t.prototype.checkUpdate=function(e){if(this.getCheckInvalidation()(e)){this._clearCache(e);this.getUpdateListeners().forEach(function(e){e()})}};return t});
//# sourceMappingURL=DataSelector.js.map