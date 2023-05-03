/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","../utils/Utils","../utils/Constants"],function(e,t,r){"use strict";return e.extend("sap.feedback.ui.flpplugin.survey.ValidationHandler",{_oStorage:null,_oCentralConfig:null,init:function(e,t){if(!e){throw Error("oStorage is not provided!")}if(!t){throw Error("oCentralConfig is not provided!")}this._oStorage=e;this._oCentralConfig=t},validate:function(e){if(e.areaId&&e.triggerName){var t=e.areaId;var i=e.triggerName;var n=t===r.S_GENERIC_TRIGGER_AREAID?true:false;return this._getRelevantStateConfig(t,i,n)}return null},_getRelevantStateConfig:function(e,t,r){var i=this._collectConfigurationForEvent(e,t,r);if(i&&i.length>0){var n=this._combineRelatedStateConfigs(i);var a=this._selectStateConfig(n);if(a){this._increaseTriggeredCount(a)}return a}return null},_increaseTriggeredCount:function(e){if(e.oConfig){var r=t.readUserState(this._oStorage);if(r){var i=r.getFeaturePushState(e.oConfig.getAreaId(),e.oConfig.getTriggerName());if(i){i.increaseTriggeredCount();this._saveUserState(r)}}}},_collectConfigurationForEvent:function(e,t,r){if(r===true){return this._findGenericConfigsWithTriggerType(t)}else{var i=this._oCentralConfig.getPushConfig().findFeaturePushConfigById(e,t);if(i){return[i]}return null}},_combineRelatedStateConfigs:function(e){var r=[];e.forEach(function(e){var i={};i.sCombinedKey=e.getCombinedKey();i.oConfig=e;var n=this._findStateById(e.getAreaId(),e.getTriggerName());if(!n){var a=t.readUserState(this._oStorage);n=a.createAndAddFeaturePushState(e.getAreaId(),e.getTriggerName(),e.getTriggerType());this._saveUserState(a)}if(n){i.oState=n;r.push(i)}}.bind(this));return r},_selectStateConfig:function(e){if(e&&e.length>0){var r=this._filterQualifiedConfigs(e);if(r.length===1){return r[0]}else if(r.length>1){var i=t.getRandomInt(0,r.length);return r[i]}}return null},_filterQualifiedConfigs:function(e){var r=[];if(e&&e.length>0){var i=t.readUserState(this._oStorage);e.forEach(function(e){if(e.oConfig.isQualifiedForPush(e.oState,i)){r.push(e)}})}return r},_findGenericConfigsWithTriggerType:function(e){var t=this._oCentralConfig.getPushConfig().findGenericFeaturePushConfigWithTriggerType(e);if(t&&t.length>0){return t}return null},_findStateById:function(e,r){var i=t.readUserState(this._oStorage);if(i){return i.getFeaturePushState(e,r)}return null},_saveUserState:function(e){if(e){this._oStorage.saveUserState(e)}}})});
//# sourceMappingURL=ValidationHandler.js.map