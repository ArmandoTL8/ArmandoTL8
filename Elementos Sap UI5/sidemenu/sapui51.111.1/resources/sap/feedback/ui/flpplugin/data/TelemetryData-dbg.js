/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object"], function (BaseObject) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.data.TelemetryData", {
		_pushEventTriggeredCount: 0,
		_pushEventExecutedCount: 0,
		_pushEventSnoozedCount: 0,
		_timeSinceLastPushEvent: 0,

		constructor: function () {},

		getPushEventTriggeredCount: function () {
			return this._pushEventTriggeredCount;
		},
		setPushEventTriggeredCount: function (iValue) {
			this._pushEventTriggeredCount = iValue;
		},

		getPushEventExecutedCount: function () {
			return this._pushEventExecutedCount;
		},
		setPushEventExecutedCount: function (iValue) {
			this._pushEventExecutedCount = iValue;
		},

		getPushEventSnoozedCount: function () {
			return this._pushEventSnoozedCount;
		},
		setPushEventSnoozedCount: function (iValue) {
			this._pushEventSnoozedCount = iValue;
		},

		getTimeSinceLastPushEvent: function () {
			return this._timeSinceLastPushEvent;
		},
		setTimeSinceLastPushEvent: function (iValue) {
			this._timeSinceLastPushEvent = iValue;
		}
	});
});
