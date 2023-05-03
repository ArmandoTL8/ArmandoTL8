/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	["sap/ui/base/Object", "sap/base/Log", "sap/ui/core/EventBus", "../utils/Constants", "../utils/Utils"],
	function (BaseObject, Log, EventBus, Constants, Utils) {
		"use strict";

		return BaseObject.extend("sap.feedback.ui.flpplugin.survey.RequestHandler", {
			_fnOnRequestReceivedCallback: null,

			/**
			 * Initialize the controller with the callback function required to show surveys and subscribe to the channel on the EventBus.
			 * @param {function} fnOnRequestReceivedCallback Callback function which will be called once an event was received via the EventBus.
			 */
			init: function (fnOnRequestReceivedCallback) {
				if (!fnOnRequestReceivedCallback) {
					throw Error("fnOnRequestReceivedCallback is not provided!");
				}
				this._fnOnRequestReceivedCallback = fnOnRequestReceivedCallback;
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.subscribe("sap.feedback", "inapp.feature", this._onFeatureEventBusFired, this);
			},

			/**
			 * 'Subscription' Callback function triggered when the Push event is fired.
			 * @param {string} sChannelId - Channel ID
			 * @param {string} sEventId - Event ID
			 * @param {object} oEventData - Event Payload
			 */
			_onFeatureEventBusFired: function (sChannelId, sEventId, oEventData) {
				oEventData.type = Constants.E_PUSH_SRC_TYPE.pushInApp;
				try {
					if (this._fnOnRequestReceivedCallback && this._isValidEventData(oEventData)) {
						this._fnOnRequestReceivedCallback(oEventData);
					}
				} catch (oError) {
					Log.error("Push message could not be processed.", oError.message, Constants.S_PLUGIN_SURVEY_REQ_HANDLER_NAME);
				}
			},

			/**
			 * Validate provided Event Data.
			 * Mandatory parameters Area ID and Trigger Name shall be valid and make sure that payload is valid object.
			 * (Note: This method can be moved a util class?)
			 * @param {object} oEventData.
			 * @returns {boolean} True if current Event Data is valid.
			 */
			_isValidEventData: function (oEventData) {
				if (oEventData.hasOwnProperty("areaId") && oEventData.hasOwnProperty("triggerName")) {
					var sAreaId = oEventData.areaId;
					var sTriggerName = oEventData.triggerName;
					var oPayload = oEventData.payload;
					if (!Utils.isString(sAreaId) || Utils.stringIsEmpty(sAreaId)) {
						Log.error("Event Payload data is invalid - Area ID is invalid", sAreaId, Constants.S_PLUGIN_SURVEY_REQ_HANDLER_NAME);
						return false;
					}
					if (!Utils.isString(sTriggerName) || Utils.stringIsEmpty(sTriggerName)) {
						Log.error(
							"Event Payload data is invalid - Trigger Name is invalid",
							sTriggerName,
							Constants.S_PLUGIN_SURVEY_REQ_HANDLER_NAME
						);
						return false;
					}
					if (oPayload && !Utils.isObject(oPayload)) {
						Log.error("Event Payload data is invalid - Payload is invalid", oPayload, Constants.S_PLUGIN_SURVEY_REQ_HANDLER_NAME);
						return false;
					}
				} else {
					Log.error(
						"Event Payload data is invalid: Area ID: " + oEventData.areaId + " Trigger Name: " + oEventData.triggerName + "",
						null,
						Constants.S_PLUGIN_SURVEY_REQ_HANDLER_NAME
					);
					return false;
				}
				return true;
			},

			/**
			 * Unsubscribe the push event. Currently for Unit-testing purpose.
			 */
			unsubscribeFromTheEventBusForTesting: function () {
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.unsubscribe("sap.feedback", "inapp.feature", this._onFeatureEventBusFired, this);
			}
		});
	}
);
