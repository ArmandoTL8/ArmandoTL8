/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	["sap/ui/base/Object", "sap/base/Log", "../push/state/FeaturePushState", "../utils/Utils", "../utils/Constants"],
	function (BaseObject, Log, FeaturePushState, Utils, Constants) {
		"use strict";

		return BaseObject.extend("sap.feedback.ui.flpplugin.data.UserState", {
			_iVersion: 1,
			_iLastPush: undefined,
			_sLastTheme: undefined,
			_sCurrentTheme: undefined,
			_iThemeToggleStart: undefined,
			_oFeaturePushStates: undefined,
			_iDynamicPushDate: undefined,
			_iInAppPushDate: undefined,
			_iSnoozeCount: 0,

			constructor: function () {
				this._oFeaturePushStates = {};
			},

			/**
			 * Initialize the local state to the provided state, all other data will be cleared/resetted.
			 * @param {object} oParsedObject Parsed JSON String as object.
			 */
			initFromJSON: function (oParsedObject) {
				if (oParsedObject.version) {
					this._iVersion = oParsedObject.version;
				}
				if (oParsedObject.lastPush) {
					this._iLastPush = oParsedObject.lastPush;
				}
				if (oParsedObject.dynamicPushDate) {
					this._iDynamicPushDate = oParsedObject.dynamicPushDate;
				}
				if (oParsedObject.inAppPushDate) {
					this._iInAppPushDate = oParsedObject.inAppPushDate;
				}
				if (oParsedObject.lastTheme) {
					this._sLastTheme = oParsedObject.lastTheme;
				}
				if (oParsedObject.currentTheme) {
					this._sCurrentTheme = oParsedObject.currentTheme;
				}
				if (oParsedObject.toggleStart) {
					this._iThemeToggleStart = oParsedObject.toggleStart;
				}
				if (oParsedObject.snoozeCount) {
					this._iSnoozeCount = oParsedObject.snoozeCount;
				}
				this._oFeaturePushStates = {};
				if (oParsedObject.featurePushStates) {
					Object.keys(oParsedObject.featurePushStates).forEach(
						function (sKey) {
							try {
								var oParsedState = new FeaturePushState();
								oParsedState.initFromJSON(oParsedObject.featurePushStates[sKey]);
								//Make sure combined key is caculated again to allow updates/changes and not take over old persisted key.
								if (oParsedState.getCombinedKey()) {
									this._oFeaturePushStates[oParsedState.getCombinedKey()] = oParsedState;
								}
							} catch (oError) {
								Log.warning(
									"Feature Push state could not be parsed correctly, will be ignored.",
									oError.message,
									Constants.S_PLUGIN_USERSTATE_NAME
								);
							}
						}.bind(this)
					);
				}
			},

			/**
			 * Get the time of the last time a push event was triggered for this user.
			 * @returns {number} Returns the time of the last push event for this user.
			 */
			getLastPush: function () {
				return this._iLastPush;
			},

			/**
			 * Get the time of the current/next Dynamic Push.
			 * @returns {number} Returns the time of the current/next Dynamic Push for this user.
			 */
			getDynamicPushDate: function () {
				return this._iDynamicPushDate;
			},

			/**
			 * Set the time of the current/next Dynamic Push.
			 * @param {number} iDate Set the time of the current/next Dynamic Push for this user.
			 */
			setDynamicPushDate: function (iDate) {
				this._iDynamicPushDate = iDate;
			},

			/**
			 * Get the time of the current/next InApp Push.
			 * @returns {number} Returns the time of the current/next InApp Push for this user.
			 */
			getInAppPushDate: function () {
				return this._iInAppPushDate;
			},

			/**
			 * Set the time of the current/next InApp Push.
			 * @param {number} iDate Set the time of the current/next InApp Push for this user.
			 */
			setInAppPushDate: function (iDate) {
				this._iInAppPushDate = iDate;
			},

			/**
			 * Update timestamp of the last push event triggered for this user to the current Date+Time.
			 */
			updateLastPushToNow: function () {
				this._iLastPush = Date.now();
			},

			/**
			 * Get the theme id of the last/previous theme the user has used.
			 * @returns {string} Returns the last (previous) active theme id of the user or an empty string if not available.
			 */
			getLastTheme: function () {
				return this._sLastTheme || "";
			},

			setLastTheme: function (sThemeId) {
				this._sLastTheme = sThemeId;
			},

			/**
			 * Get the theme id of the current active theme.
			 * @returns {string} Returns the current active theme id or an empty string if not available.
			 */
			getCurrentTheme: function () {
				return this._sCurrentTheme || "";
			},

			setCurrentTheme: function (sThemeId) {
				this._sCurrentTheme = sThemeId;
			},

			/**
			 * Get the timestamp of the point in time when the user switched the 'New design' theme toggle to on.
			 * @returns {number} Returns the timestamp when the user has switched on the 'New design' theme toggle.
			 */
			getThemeToggleStart: function () {
				return this._iThemeToggleStart;
			},

			setThemeToggleStart: function (iValue) {
				this._iThemeToggleStart = iValue;
			},

			clearThemeToggleStart: function () {
				this._iThemeToggleStart = undefined;
			},

			getSnoozeCount: function () {
				return this._iSnoozeCount;
			},
			increaseSnoozeCount: function () {
				this._iSnoozeCount++;
			},
			resetSnoozeCount: function () {
				this._iSnoozeCount = 0;
			},

			/**
			 * Create a new state for the given app id, trigger and triggertype and persist it in local state.
			 * @param {string} sAreaId Source app id.
			 * @param {string} sTriggerName Source trigger
			 * @param {string} sTriggerType Trigger type for this areaid+triggername combination
			 * @returns {object} Returns the created state.
			 */
			createAndAddFeaturePushState: function (sAreaId, sTriggerName, sTriggerType) {
				var oNewState = new FeaturePushState();
				oNewState.init(sAreaId, sTriggerName, sTriggerType);
				this.addFeaturePushState(oNewState);
				return oNewState;
			},

			/**
			 * Add the given feature push state to the local state. If a state with the same combinedkey (areaid+triggername) already exists it will be replaced.
			 * @param {sap.feedback.ui.flpplugin.push.state.FeaturePushState} oFeaturePushState A feature push state which should be added to the local state.
			 */
			addFeaturePushState: function (oFeaturePushState) {
				var sCombinedKey = oFeaturePushState.getCombinedKey();
				this._oFeaturePushStates[sCombinedKey] = oFeaturePushState;
			},

			/**
			 * Get the feature push state for the given areaid+triggername read from the local state. If none exists undefined will be returned.
			 * @param {string} sAreaId Source app id
			 * @param {string} sTriggerName Source trigger
			 * @returns {sap.feedback.ui.flpplugin.push.state.FeaturePushState} Returns the feature push state for the given areaid+triggername. Returns undefined if none exists.
			 */
			getFeaturePushState: function (sAreaId, sTriggerName) {
				var sCombinedKey = Utils.getCombinedKey(sAreaId, sTriggerName);
				return this._oFeaturePushStates[sCombinedKey];
			},

			/**
			 * Find all feature push states which are identified as expired.
			 * @returns {[sap.feedback.ui.flpplugin.push.state.FeaturePushState]} Returns the feature push states reached expiry date. Returns an empty array if no expired identified.
			 */
			findFeaturePushStatesReachedExpiryDate: function () {
				var aResult = [];
				Object.keys(this._oFeaturePushStates).forEach(
					function (sKey) {
						var oCurrentState = this._oFeaturePushStates[sKey];
						if (oCurrentState.hasReachedExpiryDate()) {
							aResult.push(oCurrentState);
						}
					}.bind(this)
				);
				return aResult;
			},

			/**
			 * Removes the feature push state from current LocalState instance by identifying it using area id and trigger name. Does not automatically save result to persistence.
			 * @param {string} sAreaId Aread id
			 * @param {string} sTriggerName Trigger name
			 */
			removeFeaturePushState: function (sAreaId, sTriggerName) {
				var sCombinedKey = Utils.getCombinedKey(sAreaId, sTriggerName);
				if (this._oFeaturePushStates.hasOwnProperty(sCombinedKey)) {
					delete this._oFeaturePushStates[sCombinedKey];
				}
			},

			toJSON: function () {
				var oObject = {};
				if (this._iVersion) {
					oObject.version = this._iVersion;
				}
				if (this._iLastPush) {
					oObject.lastPush = this._iLastPush;
				}
				if (this._iDynamicPushDate) {
					oObject.dynamicPushDate = this._iDynamicPushDate;
				}
				if (this._iInAppPushDate) {
					oObject.inAppPushDate = this._iInAppPushDate;
				}
				if (this._sLastTheme) {
					oObject.lastTheme = this._sLastTheme;
				}
				if (this._sCurrentTheme) {
					oObject.currentTheme = this._sCurrentTheme;
				}
				if (this._iThemeToggleStart) {
					oObject.toggleStart = this._iThemeToggleStart;
				}
				if (this._iSnoozeCount) {
					oObject.snoozeCount = this._iSnoozeCount;
				}
				if (this._oFeaturePushStates) {
					oObject.featurePushStates = {};
					Object.keys(this._oFeaturePushStates).forEach(
						function (sKey) {
							oObject.featurePushStates[sKey] = this._oFeaturePushStates[sKey].toJSON();
						}.bind(this)
					);
				}
				return oObject;
			}
		});
	}
);
