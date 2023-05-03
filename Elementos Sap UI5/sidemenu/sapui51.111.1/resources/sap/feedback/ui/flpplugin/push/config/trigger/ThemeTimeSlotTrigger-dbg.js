/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BaseTrigger", "../../../utils/Utils", "../../../utils/Constants"], function (BaseTrigger, Utils, Constants) {
    "use strict";

	return BaseTrigger.extend("sap.feedback.ui.flpplugin.push.config.trigger.ThemeTimeSlotTrigger", {
		_sTargetingThemeId: null,
		_aTimeSlots: null,

		constructor: function () {
			return BaseTrigger.prototype.constructor.apply(this, arguments);
		},

        init: function (iInterval, iThresholdCountStart, sTargetingThemeId, aTimeSlots, canForcePush) {
            if (!Number.isInteger(iInterval)) {
                throw Error("Interval is not a valid number - " + iInterval);
            }
            if (!Number.isInteger(iThresholdCountStart)) {
                throw Error("Start Threshold is not a valid number - " + iThresholdCountStart);
            }
            if (!sTargetingThemeId) {
                throw Error("Targeting Theme ID is missing - " + sTargetingThemeId);
            }
            if (!aTimeSlots || !Array.isArray(aTimeSlots) || aTimeSlots.length < 1) {
                throw Error("Time slots are invalid");
            }
            if (canForcePush && typeof canForcePush !== "boolean") {
                throw Error("Force Push shall be either 'true' or 'false'");
            }
            this._iInterval = iInterval;
            this._iMaxLimitCount = aTimeSlots.length;
            this._iThresholdCountStart = iThresholdCountStart;
            this._sTargetingThemeId = sTargetingThemeId;
            this._aTimeSlots = aTimeSlots;
            this._canForcePush = canForcePush ? true : false;
        },
        initFromJSON: function (oParsedObject) {
            var iInterval = oParsedObject.interval;
            var iThresholdCountStart = oParsedObject.startThreshold;
            var sTargetingThemeId = oParsedObject.targetingThemeId;
            var aTimeSlots = oParsedObject.timeSlots;
            var bForcePush = oParsedObject.forcePush;
            this.init(iInterval, iThresholdCountStart, sTargetingThemeId, aTimeSlots, bForcePush);
        },
        getTargetingThemeId: function () {
            return this._sTargetingThemeId;
        },
        getTimeSlots: function () {
            return this._aTimeSlots;
        },
        getTimeSlotFor: function (iOccurrence) {
            if (iOccurrence <= this._aTimeSlots.length) {
                return this._aTimeSlots[iOccurrence];
            }
            return null;
        },
        isQualifiedForPush: function (oCurrentState, oLocalState) {
            var bBaseResult = BaseTrigger.prototype.isQualifiedForPush.apply(this, arguments);
            var sCurrentThemeId = oLocalState.getCurrentTheme();
            //Only if base parameters (threshold, min, max counter) are ok, validate the additional criteria
            if (bBaseResult === true) {
                //Is targeting theme matching (targeting==current) or wildcard (*)
                if (this._isTargetingThemeMatching(sCurrentThemeId)) {
                    if (this._isTimeSlotReached(oCurrentState, oLocalState)) {
                        return true;
                    }
                }
            }
            return false;
        },
        _isTargetingThemeMatching: function (sCurrentThemeIdState) {
            if (Utils.isString(sCurrentThemeIdState)) {
                if (sCurrentThemeIdState.toLowerCase() === this._sTargetingThemeId.toLowerCase() || this._sTargetingThemeId.trim() === "*") {
                    return true;
                }
            }
            return false;
        },
        _isTimeSlotReached: function (oCurrentState, oLocalState) {
            //Currently only takes executed counts into account...how about when interval is >1, then also triggeredCount is relevant???
            var iExecutedCount = oCurrentState.getExecutedCount();
            var iCurrentTimeSlot = this.getTimeSlotFor(iExecutedCount);
            var iThemeToggleStart = oLocalState.getThemeToggleStart();
            if (iCurrentTimeSlot && iThemeToggleStart) {
                return this._hasDurationPassed(iCurrentTimeSlot, iThemeToggleStart);
            }
            return false;
        },
        _hasDurationPassed: function (iDurationToPass, iTimestamp) {
            //Convert minutes to ticks to generate new timestamp.
            var iThreshold = new Date(iTimestamp + iDurationToPass * Constants.E_TIME.minutesToMilliseconds).getTime();
            // If threshold (timestamp + timeslot) has passed, showing survey allowed
            if (iThreshold && iThreshold < Date.now()) {
                return true;
            }
            return false;
        }
    });
});
