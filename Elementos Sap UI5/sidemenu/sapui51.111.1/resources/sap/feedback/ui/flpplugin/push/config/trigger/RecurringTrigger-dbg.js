/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BaseTrigger"], function (BaseTrigger) {
    "use strict";

    return BaseTrigger.extend("sap.feedback.ui.flpplugin.push.config.trigger.RecurringTrigger", {
        constructor: function () {
            return BaseTrigger.prototype.constructor.apply(this, arguments);
        },
        init: function (iInterval, iMaxLimitCount, iThresholdCountStart) {
            if (!Number.isInteger(iInterval)) {
                throw Error("Interval is not a valid number - " + iInterval);
            }
            if (!Number.isInteger(iMaxLimitCount)) {
                throw Error("Max Limit is not a valid number - " + iMaxLimitCount);
            }
            if (!Number.isInteger(iThresholdCountStart)) {
                throw Error("Start Threshold is not a valid number - " + iThresholdCountStart);
            }
            this._iInterval = iInterval;
            this._iMaxLimitCount = iMaxLimitCount;
            this._iThresholdCountStart = iThresholdCountStart;
        },
        initFromJSON: function (oParsedObject) {
            var iInterval = oParsedObject.interval;
            var iMaxLimitCount = oParsedObject.maxLimit;
            var iThresholdCountStart = oParsedObject.startThreshold;
            this.init(iInterval, iMaxLimitCount, iThresholdCountStart);
        }
    });
});
