/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["./Utils", "./Constants"], function (Utils, Constants) {
	"use strict";
	/* globals URLSearchParams */
	return {
		isUrlParamActive: function (sUrlParamKey, sExpectedValue) {
			var sQueryString = this._getWindowSearchLocation();
			if (sQueryString) {
				var oUrlParams = new URLSearchParams(sQueryString);
				if (oUrlParams && oUrlParams.has(sUrlParamKey)) {
					var bUrlParamState = oUrlParams.get(sUrlParamKey);
					if (bUrlParamState.trim().toLocaleLowerCase() === sExpectedValue) {
						return true;
					}
				}
			}
			return false;
		},
		isScopeItemActive: function (oConfig, sExpectedScopeItem) {
			if (oConfig && oConfig.hasScopeItem(sExpectedScopeItem)) {
				return true;
			}
			return false;
		},
		_getWindowSearchLocation: function () {
			return window.location.search;
		},
		isFeaturePushConfigParamActive: function () {
			return this.isUrlParamActive(Constants.S_SCOPE_FEATURE_PUSH, "true");
		},
		isDynamicPushConfigParamActive: function () {
			return this.isUrlParamActive(Constants.S_SCOPE_DYNAMIC_PUSH, "true");
		},
		isFeaturePushScopeSetActive: function (oConfig) {
			return this.isScopeItemActive(oConfig, Constants.S_SCOPE_FEATURE_PUSH);
		},
		isDynamicPushScopeSetActive: function (oConfig) {
			return this.isScopeItemActive(oConfig, Constants.S_SCOPE_DYNAMIC_PUSH);
		},
		isImmediateTestModeParamActive: function () {
			return this.isUrlParamActive(Constants.S_IMMEDIATE_TEST, "true");
		},
		isFeaturePushAvailable: function (oConfig) {
			if ((this.isFeaturePushConfigParamActive() || this.isFeaturePushScopeSetActive(oConfig)) && Utils.isLocalStorageAvailable()) {
				return true;
			}
			return false;
		},
		isDynamicPushAvailable: function (oConfig) {
			if ((this.isDynamicPushConfigParamActive() || this.isDynamicPushScopeSetActive(oConfig)) && Utils.isLocalStorageAvailable()) {
				return true;
			}
			return false;
		}
	};
});
