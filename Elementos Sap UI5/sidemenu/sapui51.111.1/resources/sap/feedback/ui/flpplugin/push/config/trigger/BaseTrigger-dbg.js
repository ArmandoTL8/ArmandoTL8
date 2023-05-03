/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object"], function (BaseObject) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.push.config.trigger.BaseTrigger", {
		_iInterval: -1,
		_iMaxLimitCount: -1,
		_iThresholdCountStart: -1,
		_canForcePush: false,

		constructor: function () {},
		getInterval: function () {
			return this._iInterval;
		},
		getMaxLimitCount: function () {
			return this._iMaxLimitCount;
		},
		getThresholdCountStart: function () {
			return this._iThresholdCountStart;
		},
		canForcePush: function () {
			return this._canForcePush;
		},
		isQualifiedForPush: function (oCurrentState, oLocalState) {
			var iTriggeredCount = oCurrentState.getTriggeredCount();
			var iExecutedCount = oCurrentState.getExecutedCount();
			if (
				this._isMinimumThresholdReached(iTriggeredCount) &&
				this._hasNotReachedMaxLimit(iExecutedCount) &&
				this._isIntervalMatching(iTriggeredCount)
			) {
				return true;
			}
			return false;
		},
		_isMinimumThresholdReached: function (iTriggeredCounterValue) {
			return iTriggeredCounterValue >= this._iThresholdCountStart;
		},
		_hasNotReachedMaxLimit: function (iExecutedCounterValue) {
			return iExecutedCounterValue < this._iMaxLimitCount;
		},
		_isIntervalMatching: function (iTriggeredCounterValue) {
			if (this._iInterval === iTriggeredCounterValue || iTriggeredCounterValue % this._iInterval === 0) {
				return true;
			}
			return false;
		}
	});
});
