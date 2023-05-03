/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	["sap/ui/base/Object", "sap/base/Log", "../data/UserState", "./Utils", "./Constants"],
	function (BaseObject, Log, UserState, Utils, Constants) {
		"use strict";

		return BaseObject.extend("sap.feedback.ui.flpplugin.utils.Storage", {
			_oLocalStorage: null,

			init: function () {
				this._oLocalStorage = Utils.getLocalStorage();
				var oPushStateRaw = this._getValueForKey(Constants.S_STOR_PUSH_STATE);
				if (this._oLocalStorage && !oPushStateRaw) {
					//Read local state once on init to execute cleanup activities
					this._upgradeAndInitNew();
				}
			},
			_initNew: function () {
				var oNewUserState = new UserState();
				this.saveUserState(oNewUserState);
				return oNewUserState;
			},
			_upgradeAndInitNew: function () {
				//No new state exists, do cleanup of old state
				var oNewUserState = this._initNew();
				this._migrateThemeData(oNewUserState);
				this.saveUserState(oNewUserState);
			},
			readUserState: function () {
				var oPushStateRaw = this._getValueForKey(Constants.S_STOR_PUSH_STATE);
				if (!oPushStateRaw) {
					return this._initNew();
				}
				try {
					var oParsedState = JSON.parse(oPushStateRaw);
					if (oParsedState) {
						var oUserState = new UserState();
						oUserState.initFromJSON(oParsedState);
						return oUserState;
					}
				} catch (oError) {
					Log.error("Reading user state failed.", oError.message, Constants.S_PLUGIN_STORAGE_NAME);
				}
				return null;
			},
			saveUserState: function (oUserState) {
				if (oUserState) {
					try {
						var sUserStateString = JSON.stringify(oUserState);
						this.updateValue(Constants.S_STOR_PUSH_STATE, sUserStateString);
					} catch (oError) {
						Log.error("Saving user state failed.", oError.message, Constants.S_PLUGIN_STORAGE_NAME);
					}
				}
			},
			_migrateThemeData: function (oNewUserState) {
				//Migrate values
				var sLastTheme = this._getValueForKey(Constants.S_STOR_LAST_THEME);
				if (sLastTheme) {
					oNewUserState.setLastTheme(sLastTheme);
					this.deleteKey(Constants.S_STOR_LAST_THEME);
				}
				var sLastThemeStart = this._getValueForKey(Constants.S_STOR_THEME_START);
				if (sLastThemeStart) {
					var iLastThemeStart = sLastThemeStart;
					if (Utils.isStringValidNumber(sLastThemeStart)) {
						iLastThemeStart = parseInt(sLastThemeStart);
					}
					oNewUserState.setThemeToggleStart(iLastThemeStart);
					this.deleteKey(Constants.S_STOR_THEME_START);
				}
				//Do not migrate values
				if (this._getValueForKey(Constants.S_STOR_THEME_FOLLOWUP_OPTIN)) {
					this.deleteKey(Constants.S_STOR_THEME_FOLLOWUP_OPTIN);
				}
				if (this._getValueForKey(Constants.S_STOR_THEME_FOLLOWUP_OPTOUT)) {
					this.deleteKey(Constants.S_STOR_THEME_FOLLOWUP_OPTOUT);
				}
			},
			///---Last theme---
			updateLastTheme: function (sThemeName) {
				var oUserState = this.readUserState();
				if (oUserState && oUserState.setLastTheme) {
					oUserState.setLastTheme(sThemeName);
					this.saveUserState(oUserState);
				}
			},
			getLastTheme: function () {
				var oState = this.readUserState();
				return oState.getLastTheme();
			},
			///---Current theme---
			updateCurrentTheme: function (sThemeName) {
				var oUserState = this.readUserState();
				if (oUserState && oUserState.setCurrentTheme) {
					oUserState.setCurrentTheme(sThemeName);
					this.saveUserState(oUserState);
				}
			},
			///---Theme start toggle---
			setThemeToggleStart: function (iTimestamp) {
				var oUserState = this.readUserState();
				if (oUserState) {
					oUserState.setThemeToggleStart(iTimestamp);
					this.saveUserState(oUserState);
				}
			},
			deleteThemeToggleStart: function () {
				var oUserState = this.readUserState();
				if (oUserState) {
					oUserState.clearThemeToggleStart();
					this.saveUserState(oUserState);
				}
			},
			///---Generic---
			deleteKey: function (sKey) {
				if (this._oLocalStorage && sKey) {
					this._oLocalStorage.removeItem(sKey);
				}
			},
			updateValue: function (sKey, sValue) {
				if (this._oLocalStorage && sKey && sValue) {
					this._oLocalStorage.setItem(sKey, sValue);
				}
			},
			_getValueForKey: function (sKey) {
				if (this._oLocalStorage && sKey) {
					return this._oLocalStorage.getItem(sKey);
				}
				return null;
			},
			getStringForKey: function (sKey) {
				return this._getValueForKey(sKey);
			},
			getNumberForKey: function (sKey) {
				var sValue = this._getValueForKey(sKey);
				if (sValue && Utils.isStringValidNumber(sValue)) {
					return parseInt(sValue);
				}
				return null;
			}
		});
	}
);
