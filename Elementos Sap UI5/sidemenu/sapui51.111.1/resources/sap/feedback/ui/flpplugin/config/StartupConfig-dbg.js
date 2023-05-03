/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "../utils/Utils"], function (BaseObject, Utils) {
	"use strict";
	/* global sap */

	return BaseObject.extend("sap.feedback.ui.flpplugin.config.StartupConfig", {
		_sQualtricsUri: null,
		_sTenantId: null,
		_sTenantRole: null,
		_bIsPushEnabled: false,
		_iDataFormat: null,
		_sProductName: null,
		_sPlatformType: null,
		_bIsLibraryLoadable: false,
		_sScopeSet: null,
		_aScopeSet: [],

		constructor: function (sQualtricsUri, sTenantId, iDataFormat) {
			this.setQualtricUri(sQualtricsUri);
			this.setTenantId(sTenantId);
			this.setDataFormat(iDataFormat);
		},
		setQualtricUri: function (sValue) {
			this._sQualtricsUri = sValue;
		},
		getQualtricsUri: function () {
			return this._sQualtricsUri;
		},
		setTenantId: function (sValue) {
			this._sTenantId = sValue;
		},
		getTenantId: function () {
			return this._sTenantId;
		},
		setTenantRole: function (sValue) {
			this._sTenantRole = sValue;
		},
		getTenantRole: function () {
			return this._sTenantRole;
		},
		setIsPushEnabled: function (bIsPushEnabled) {
			if (bIsPushEnabled === true || bIsPushEnabled.toLowerCase() === "true" || bIsPushEnabled.toLowerCase() === "x") {
				this._bIsPushEnabled = true;
			} else {
				this._bIsPushEnabled = false;
			}
		},
		getIsPushEnabled: function () {
			return this._bIsPushEnabled;
		},
		setDataFormat: function (iDataFormat) {
			this._iDataFormat = iDataFormat;
		},
		getDataFormat: function () {
			return this._iDataFormat;
		},
		setProductName: function (sProductName) {
			this._sProductName = sProductName;
		},
		getProductName: function () {
			return this._sProductName;
		},
		setPlatformType: function (sPlatformType) {
			this._sPlatformType = sPlatformType;
		},
		getPlatformType: function () {
			return this._sPlatformType;
		},
		setIsLibraryLoadable: function (bIsLoadable) {
			this._bIsLibraryLoadable = bIsLoadable;
		},
		getIsLibraryLoadable: function () {
			return this._bIsLibraryLoadable;
		},
		setScopeSet: function (sScopeSet) {
			if (sScopeSet) {
				this._sScopeSet = sScopeSet;
				this._aScopeSet = this._sScopeSet.split(",").map(function (scopeItem) {
					return scopeItem.trim().toLowerCase();
				});
			}
		},
		hasScopeItem: function (sScopeItemId) {
			if (Utils.isString(sScopeItemId) && !Utils.stringIsEmpty(sScopeItemId) && this._aScopeSet && this._aScopeSet.length > 0) {
				if (this._aScopeSet.includes(sScopeItemId.trim().toLowerCase())) {
					return true;
				}
			}
			return false;
		}
	});
});
