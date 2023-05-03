/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "sap/base/Log", "../utils/Constants"], function (BaseObject, Log, Constants) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.push.DynamicPushTrigger", {
		_oCentralConfig: null,
		_oStorage: null,
		_oTimeout: null,
		_fnHandleDynamicPush: null,
		_iDynamicPushDelayInMinutes: null,
		_iNextDynamicPushDate: null,
		_iMinimumTimeToStartTimerForDynamicPushInHrs: null,

		constructor: function (oCentralConfig, oStorage) {
			if (!oCentralConfig) {
				throw Error("oCentralConfig is not provided!");
			}
			this._oCentralConfig = oCentralConfig;

			if (!oStorage) {
				throw Error("oStorage is not provided!");
			}
			this._oStorage = oStorage;
		},

		init: function (fnHandleDynamicPush) {
			if (!fnHandleDynamicPush) {
				Log.error(
					"Callback for Dynamic Push trigger not set, could not start Dynamic Push trigger.",
					null,
					Constants.S_PLUGIN_DYNAMICPUSHTRIGGER_NAME
				);
				return;
			}
			var oPushConfig = this._oCentralConfig.getPushConfig();
			if (oPushConfig) {
				this._iDynamicPushDelayInMinutes = oPushConfig.getDynamicPushIntervalTimer();
				this._iMinimumTimeToStartTimerForDynamicPushInHrs = oPushConfig.getMinimumTimeToStartTimerForDynamicPush();
				var oUserState = this._readUserState();
				this._iNextDynamicPushDate = oUserState.getDynamicPushDate();
			}
			if (!Number.isFinite(this._iDynamicPushDelayInMinutes)) {
				Log.error(
					"Interval for Dynamic Push is invalid, could not start Dynamic Push trigger.",
					null,
					Constants.S_PLUGIN_DYNAMICPUSHTRIGGER_NAME
				);
				return;
			}
			if (!Number.isFinite(this._iMinimumTimeToStartTimerForDynamicPushInHrs)) {
				Log.error(
					"Minimum time to start timer for Dynamic Push is invalid, could not start Dynamic Push trigger.",
					null,
					Constants.S_PLUGIN_DYNAMICPUSHTRIGGER_NAME
				);
				return;
			}
			this._fnHandleDynamicPush = fnHandleDynamicPush;

			if (this._canTimerStart()) {
				this._startTimer(this._iDynamicPushDelayInMinutes);
			}
		},

		stopTimer: function () {
			clearTimeout(this._oTimeout);
			// set timer variable back to null
			this._oTimeout = null;
		},

		_onTimeoutCallback: function () {
			// set timer variable back to null
			this._oTimeout = null;

			if (this._fnHandleDynamicPush) {
				this._fnHandleDynamicPush();
			}

			// if necessary, restart timer, based on PushController's return / callback handler
			this._oTimeout = this._startTimer(this._iDynamicPushDelayInMinutes);
		},

		_startTimer: function () {
			this._oTimeout = setTimeout(
				this._onTimeoutCallback.bind(this),
				this._iDynamicPushDelayInMinutes * Constants.E_TIME.minutesToMilliseconds
			);
			Log.info(
				"Fiori Feedback Plug-in: dynamical push will be triggered in ",
				this._iDynamicPushDelayInMinutes + " minutes",
				Constants.S_PLUGIN_DYNAMICPUSHTRIGGER_NAME
			);
		},

		/**
		 * Read current user state from Storage.
		 * @returns {sap.feedback.ui.flpplugin.data.UserState} Returns latest user state from Storage.
		 */
		_readUserState: function () {
			return this._oStorage.readUserState();
		},

		/**
		 * Start the timer only if next dynamic push occurance time is lesser than configured time(refer 'iMinimumTimeToStartTimerForDynamicPushInHrs' in PushConfig).
		 * @returns {boolean} Returns true if the Timer can start now based on next dynamic push occurance time.
		 */
		_canTimerStart: function () {
			if (this._iNextDynamicPushDate - Date.now() <= this._iMinimumTimeToStartTimerForDynamicPushInHrs * Constants.E_TIME.hoursToMilliseconds) {
				return true;
			}
			return false;
		}
	});
});
