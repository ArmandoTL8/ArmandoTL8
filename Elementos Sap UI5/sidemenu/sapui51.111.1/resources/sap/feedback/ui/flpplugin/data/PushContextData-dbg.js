/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "sap/base/Log", "../utils/Utils", "../utils/Constants"], function (BaseObject, Log, Utils, Constants) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.data.PushContextData", {
		_iType: null,
		_sAreaId: null,
		_sTriggerName: null,
		_sShortText: null,
		_oPayloadData: null,

		/**
		 * Constructor.
		 * @param {string} sAreaId - Area ID
		 * @param {string} sTriggerName - Trigger Name
		 * @param {number} iType - Current Push Event Type
		 * @param {string} sShortText - Feature Short Text
		 */
		constructor: function (sAreaId, sTriggerName, iType, sShortText) {
			this._sAreaId = sAreaId;
			this._sTriggerName = sTriggerName;
			this._iType = iType;
			if (Utils.isString(sShortText) && !Utils.stringIsEmpty(sShortText)) {
				this._sShortText = sShortText.trim();
			}
		},

		/**
		 * Returns the current Area ID.
		 * @returns {string} Area ID.
		 */
		getAreaId: function () {
			return this._sAreaId;
		},

		/**
		 * Returns the current Trigger Name.
		 * @returns {string} Trigger Name.
		 */
		getTriggerName: function () {
			return this._sTriggerName;
		},

		/**
		 * Returns the current Push Event Type.
		 * @returns {number} Push Event Type.
		 */
		getType: function () {
			return this._iType;
		},

		/**
		 * Returns the current Short Text.
		 * @returns {string} Short Text.
		 */
		getShortText: function () {
			return this._sShortText || "";
		},

		/**
		 * @returns {boolean} true if current Push event is from Backend
		 */
		getIsBackendPushedSurvey: function () {
			return this._iType === Constants.E_PUSH_SRC_TYPE.backend;
		},

		/**
		 * Set Payload
		 * @param {object} Push Event Payload.
		 */
		setPayloadData: function (oValue) {
			this._oPayloadData = oValue;
		},

		/**
		 * Returns the current event payload in string format.
		 * @returns {string} Event Payload.
		 */
		getPayloadDataString: function () {
			var sResult = "";
			if (this._oPayloadData) {
				try {
					sResult = JSON.stringify(this._oPayloadData);
				} catch (oError) {
					Log.error(
						"Fiori Feedback Plug-in error occured on parsing payload push data.",
						oError.message,
						Constants.S_PLUGIN_PUSHCONTEXTDATA_NAME
					);
				}
			}
			return sResult;
		}
	});
});
