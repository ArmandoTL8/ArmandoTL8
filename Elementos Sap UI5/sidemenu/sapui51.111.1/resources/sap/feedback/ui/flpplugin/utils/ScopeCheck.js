/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["./Utils","./Constants"],function(e,t){"use strict";return{isUrlParamActive:function(e,t){var i=this._getWindowSearchLocation();if(i){var r=new URLSearchParams(i);if(r&&r.has(e)){var a=r.get(e);if(a.trim().toLocaleLowerCase()===t){return true}}}return false},isScopeItemActive:function(e,t){if(e&&e.hasScopeItem(t)){return true}return false},_getWindowSearchLocation:function(){return window.location.search},isFeaturePushConfigParamActive:function(){return this.isUrlParamActive(t.S_SCOPE_FEATURE_PUSH,"true")},isDynamicPushConfigParamActive:function(){return this.isUrlParamActive(t.S_SCOPE_DYNAMIC_PUSH,"true")},isFeaturePushScopeSetActive:function(e){return this.isScopeItemActive(e,t.S_SCOPE_FEATURE_PUSH)},isDynamicPushScopeSetActive:function(e){return this.isScopeItemActive(e,t.S_SCOPE_DYNAMIC_PUSH)},isImmediateTestModeParamActive:function(){return this.isUrlParamActive(t.S_IMMEDIATE_TEST,"true")},isFeaturePushAvailable:function(t){if((this.isFeaturePushConfigParamActive()||this.isFeaturePushScopeSetActive(t))&&e.isLocalStorageAvailable()){return true}return false},isDynamicPushAvailable:function(t){if((this.isDynamicPushConfigParamActive()||this.isDynamicPushScopeSetActive(t))&&e.isLocalStorageAvailable()){return true}return false}}});
//# sourceMappingURL=ScopeCheck.js.map