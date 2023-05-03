/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "../../utils/Utils"], function (BaseObject, Utils) {
    "use strict";

    return BaseObject.extend("sap.feedback.ui.flpplugin.push.config.FeaturePushConfig", {
        _sAreaId: null,
        _sTriggerName: null,
        _iValidFrom: null,
        _iValidTo: null,
        _bIsEnabled: null,
        _sTriggerType: null,
        _oTriggerConfig: null,
        _bIsGeneric: false,

        init: function (sAreaId, sTriggerName, iValidFrom, iValidTo, bIsEnabled, bIsGeneric) {
            this._sAreaId = sAreaId;
            this._sTriggerName = sTriggerName;
            if (!Number.isInteger(iValidFrom)) {
                throw Error("Valid-from not a number for " + sAreaId + "/" + sTriggerName);
            }
            if (!Number.isInteger(iValidTo)) {
                throw Error("Valid-to not a number for " + sAreaId + "/" + sTriggerName);
            }
            if (iValidFrom >= iValidTo) {
                throw Error("Valid-from date cannot be bigger than Valid-to date.");
            }
            this._iValidFrom = iValidFrom;
            this._iValidTo = iValidTo;
            this._bIsEnabled = bIsEnabled;
            if (bIsGeneric) {
                this._bIsGeneric = bIsGeneric;
            }
        },
        initFromJSON: function (oParsedObject) {
            var sAreaId = oParsedObject.areaId;
            var sTriggerName = oParsedObject.triggerName;
            var iValidFrom = new Date(oParsedObject.validFrom).getTime();
            var iValidTo = new Date(oParsedObject.validTo).getTime();
            var bIsEnabled = oParsedObject.isEnabled;
            var bIsGeneric = oParsedObject.isGeneric;
            this.init(sAreaId, sTriggerName, iValidFrom, iValidTo, bIsEnabled, bIsGeneric);
        },
        setTriggerConfig: function (sType, oConfig) {
            this._sTriggerType = sType;
            this._oTriggerConfig = oConfig;
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
        getValidFrom: function () {
            return this._iValidFrom;
        },
        getValidTo: function () {
            return this._iValidTo;
        },
        getIsEnabled: function () {
            return this._bIsEnabled;
        },
        getTriggerType: function () {
            return this._sTriggerType;
        },
        getTriggerConfig: function () {
            return this._oTriggerConfig;
        },
        getIsGeneric: function () {
            return this._bIsGeneric;
        },
        isQualifiedForPush: function (oCurrentState, oLocalState) {
            return this._oTriggerConfig.isQualifiedForPush(oCurrentState, oLocalState);
        },
        isActive: function () {
            if (this._bIsEnabled && !this.isExpired()) {
                return true;
            }
            return false;
        },
        isExpired: function () {
            var iNow = Date.now();
            if (this._isValidNow(iNow) || this._isValidInFuture(iNow)) {
                return false;
            }
            return true;
        },
        _isValidNow: function (iTimeToCompare) {
            if (!Number.isInteger(iTimeToCompare)) {
                return false;
            }
            if (this._iValidFrom < iTimeToCompare && this._iValidTo > iTimeToCompare) {
                return true;
            }
            return false;
        },
        _isValidInFuture: function (iTimeToCompare) {
            if (!Number.isInteger(iTimeToCompare)) {
                return false;
            }
            if (this._iValidFrom > iTimeToCompare && this._iValidTo > iTimeToCompare && this._iValidTo > this._iValidFrom) {
                return true;
            }
            return false;
        }
    });
});
