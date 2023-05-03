/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BaseTrigger", "../../../utils/Utils"], function (BaseTrigger, Utils) {
    "use strict";

	return BaseTrigger.extend("sap.feedback.ui.flpplugin.push.config.trigger.ThemeChangedTrigger", {
		_sStartThemeId: null,
		_sTargetThemeId: null,

		constructor: function () {
			return BaseTrigger.prototype.constructor.apply(this, arguments);
		},

        init: function (iInterval, iMaxLimitCount, iThresholdCountStart, sStartThemeId, sTargetThemeId, canForcePush) {
            if (!Number.isInteger(iInterval)) {
                throw Error("Interval is not a valid number - " + iInterval);
            }
            if (!Number.isInteger(iMaxLimitCount)) {
                throw Error("Max Limit is not a valid number - " + iMaxLimitCount);
            }
            if (!Number.isInteger(iThresholdCountStart)) {
                throw Error("Start Threshold is not a valid number - " + iThresholdCountStart);
            }
            if (!sStartThemeId) {
                throw Error("Start Theme ID is missing");
            }
            if (!sTargetThemeId) {
                throw Error("Target Theme ID is missing");
            }
            if (canForcePush && typeof canForcePush !== "boolean") {
                throw Error("Force Push shall be either 'true' or 'false'");
            }
            this._iInterval = iInterval;
            this._iMaxLimitCount = iMaxLimitCount;
            this._iThresholdCountStart = iThresholdCountStart;
            this._sStartThemeId = sStartThemeId;
            this._sTargetThemeId = sTargetThemeId;
            this._canForcePush = canForcePush ? canForcePush : false;
        },
        initFromJSON: function (oParsedObject) {
            var iInterval = oParsedObject.interval;
            var iMaxLimitCount = oParsedObject.maxLimit;
            var iThresholdCountStart = oParsedObject.startThreshold;
            var sStartThemeId = oParsedObject.startThemeId;
            var sTargetThemeId = oParsedObject.targetThemeId;
            var canForcePush = oParsedObject.forcePush;
            this.init(iInterval, iMaxLimitCount, iThresholdCountStart, sStartThemeId, sTargetThemeId, canForcePush);
        },
        getStartThemeId: function () {
            return this._sStartThemeId;
        },
        getTargetThemeId: function () {
            return this._sTargetThemeId;
        },
        isQualifiedForPush: function (oCurrentState, oLocalState) {
            var bBaseResult = BaseTrigger.prototype.isQualifiedForPush.apply(this, arguments);
            var sLastThemeId = oLocalState.getLastTheme();
            var sCurrentThemeId = oLocalState.getCurrentTheme();
            //Only if base parameters (threshold, min, max counter) are ok, validate the additional criteria
            if (bBaseResult === true) {
                //Is source (where the user is coming from) matching (source==start) or wildcard (*)
                if (this._isStartThemeMatching(sLastThemeId)) {
                    //Is target matching (target==current) or wildcard (*)
                    if (this._isTargetThemeMatching(sCurrentThemeId)) {
                        return true;
                    }
                }
            }
            return false;
        },
        _isStartThemeMatching: function (sLastThemeIdState) {
            if (Utils.isString(sLastThemeIdState)) {
                if (sLastThemeIdState.toLowerCase() === this._sStartThemeId.toLowerCase() || this._sStartThemeId.trim() === "*") {
                    return true;
                }
            }
            return false;
        },
        _isTargetThemeMatching: function (sCurrentThemeIdState) {
            if (Utils.isString(sCurrentThemeIdState)) {
                if (sCurrentThemeIdState.toLowerCase() === this._sTargetThemeId.toLowerCase() || this._sTargetThemeId.trim() === "*") {
                    return true;
                }
            }
            return false;
        }
    });
});
