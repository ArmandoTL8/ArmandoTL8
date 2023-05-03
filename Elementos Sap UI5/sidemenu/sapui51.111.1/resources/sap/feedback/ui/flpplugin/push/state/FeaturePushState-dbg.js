/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "../../utils/Utils", "../../utils/Constants"], function (BaseObject, Utils, Constants) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.push.state.FeaturePushState", {
		_sAreaId: null,
		_sTriggerName: null,
		_sTriggerType: null,
		_iTriggeredCount: 0,
		_iExecutedCount: 0,
		_iLastChanged: null,

		init: function (sAreaId, sTriggerName, sTriggerType, iTriggeredCount, iExecutedCount) {
			this._sAreaId = sAreaId;
			this._sTriggerName = sTriggerName;
			this._sTriggerType = sTriggerType;
			if (iTriggeredCount) {
				this._iTriggeredCount = iTriggeredCount;
			}
			if (iExecutedCount) {
				this._iExecutedCount = iExecutedCount;
			}
			this._iLastChanged = Date.now();
		},
		initFromJSON: function (oParsedObject) {
			this._sAreaId = oParsedObject.areaId;
			this._sTriggerName = oParsedObject.triggerName;
			this._sTriggerType = oParsedObject.triggerType;
			if (oParsedObject.triggeredCount) {
				this._iTriggeredCount = oParsedObject.triggeredCount;
			}
			if (oParsedObject.executedCount) {
				this._iExecutedCount = oParsedObject.executedCount;
			}
			if (oParsedObject.lastChanged) {
				this._iLastChanged = oParsedObject.lastChanged;
			}
		},
		getCombinedKey: function () {
			return Utils.getCombinedKey(this._sAreaId, this._sTriggerName);
		},
		getAreaId: function () {
			return this._sAreaId;
		},
		getTriggerName: function () {
			return this._sTriggerName;
		},
		getTriggerType: function () {
			return this._sTriggerType;
		},
		getTriggeredCount: function () {
			return this._iTriggeredCount;
		},
		getExecutedCount: function () {
			return this._iExecutedCount;
		},
		increaseTriggeredCount: function () {
			this._iTriggeredCount++;
			this._iLastChanged = Date.now();
		},
		increaseExecutedCount: function () {
			this._iExecutedCount++;
			this._iLastChanged = Date.now();
		},
		hasReachedExpiryDate: function () {
			if (!Number.isInteger(this._iLastChanged)) {
				this._iLastChanged = Date.now();
				return false;
			}
			var iTimeSinceLastChange = Date.now() - this._iLastChanged;
			if (iTimeSinceLastChange / 86400000 >= Constants.I_DAYS_UNTIL_STATE_EXPIRY) {
				return true;
			}
			return false;
		},
		toJSON: function () {
			var oObject = {
				areaId: this._sAreaId,
				triggerName: this._sTriggerName,
				triggerType: this._sTriggerType,
				lastChanged: this._iLastChanged
			};
			if (this._iTriggeredCount >= 0) {
				oObject.triggeredCount = this._iTriggeredCount;
			}
			if (this._iExecutedCount >= 0) {
				oObject.executedCount = this._iExecutedCount;
			}
			return oObject;
		}
	});
});
