/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	["sap/ui/base/Object", "sap/base/util/extend", "../utils/Utils", "../utils/Constants", "../data/AppContextData"],
	function (BaseObject, extend, Utils, Constants, AppContextData) {
		"use strict";

		return BaseObject.extend("sap.feedback.ui.flpplugin.controller.ContextDataController", {
			_oStartupConfig: {},
			_oAppContextData: null,
			_oSessionData: null,
			_sClientAction: null,
			_sLastTheme: null,
			_iFollowUpCount: null,

			/**
			 * Constructor
			 * @param {sap.feedback.ui.flpplugin.config.StartupConfig} oStartupConfig
			 */
			constructor: function (oStartupConfig) {
				if (!oStartupConfig) {
					throw Error("oStartupConfig is not provided!");
				}
				this._oStartupConfig = oStartupConfig;
			},

			/**
			 * Capture the tenant/product/platform specific information into a instance variable which is then set to "session" context during the updates.
			 */
			init: function () {
				this._oAppContextData = new AppContextData();
				this._collectSessionContextData(
					this._oStartupConfig.getTenantId(),
					this._oStartupConfig.getTenantRole(),
					this._oStartupConfig.getProductName(),
					this._oStartupConfig.getPlatformType()
				);
			},

			/**
			 * Update/Set the current context data to qualtrics global variables.
			 * Currently we have Five Categories of Context data
			 * 	1. Device,
			 * 	2. Application context,
			 * 	3. Session,
			 * 	4. Push,
			 * 	5. Telemetry
			 * and all these are set/updated in this method.
			 * @param {string} sClientAction
			 * @param {sap.feedback.ui.flpplugin.data.PushContextData} oPushEventData.
			 * @param {sap.feedback.ui.flpplugin.data.TelemetryData} oTelemetryData.
			 * @returns {promise} Returns a Promise
			 */
			updateContextData: function (sClientAction, oPushEventData, oTelemetryData) {
				this._resetContextData();
				this.setDeviceInfos();
				this.setClientAction(sClientAction);
				var iDataFormat = this._oStartupConfig.getDataFormat();
				this._setSessionContextData(iDataFormat);
				if (oTelemetryData) {
					this._setTelemetryData(oTelemetryData);
				} else {
					this._clearTelemetryData();
				}

				return this._collectAppContextData(iDataFormat).then(
					function () {
						this._collectPushContextData(oPushEventData);
					}.bind(this)
				);
			},

			/**
			 * Set & Update the current "Client action" means, basically from where survey was triggered or source of the survey.
			 * Currently supported ACTIONS can be found in class .../utils/Constants.js (E_CLIENT_ACTION).
			 * @param {string} sClientAction.
			 */
			setClientAction: function (sClientAction) {
				this._sClientAction = sClientAction;
				this._updateClientAction();
			},

			/**
			 * Set & Update Last theme.
			 * @param {string} sLastTheme.
			 */
			setLastTheme: function (sLastTheme) {
				this._sLastTheme = sLastTheme;
				this._updateLastTheme();
			},

			/**
			 * Set followup count
			 * (TODO: Add more information?)
			 * @param {number} iFollowUpCount
			 */
			setFollowUpCount: function (iFollowUpCount) {
				this._iFollowUpCount = iFollowUpCount;
				this._updateFollowUpCount();
			},

			/**
			 * Update the Device specific data like Type/OS/Orientation.
			 */
			setDeviceInfos: function () {
				this._updateDeviceData();
			},

			/**
			 * Set Push Context data. This can be In-App Push or Dynamic Push.
			 * @param {sap.feedback.ui.flpplugin.data.PushContextData} oPushEventData.
			 */
			_collectPushContextData: function (oPushEventData) {
				if (Utils.isClientActionPushEvent(this._sClientAction) && oPushEventData) {
					this._setPushContextData(oPushEventData);
				}
			},

			/**
			 * Set the Push context data into qualtrics global variable
			 * @param {sap.feedback.ui.flpplugin.data.PushContextData} oPushData
			 */
			_setPushContextData: function (oPushData) {
				if (!sap.qtx) {
					sap.qtx = {};
				}
				sap.qtx.push = {};
				sap.qtx.push.type = oPushData.getType();
				sap.qtx.push.areaId = oPushData.getAreaId();
				sap.qtx.push.triggerName = oPushData.getTriggerName();
				sap.qtx.push.shortText = oPushData.getShortText();
				sap.qtx.push.payload = oPushData.getPayloadDataString();
			},

			/**
			 * Set tenant/product specific data to instance variable.
			 * @param {string} sTenantId
			 * @param {string} sRole
			 * @param {string} sProductName
			 * @param {string} sPlatformType
			 */
			_collectSessionContextData: function (sTenantId, sRole, sProductName, sPlatformType) {
				this._oSessionData = {
					tenantId: sTenantId,
					tenantRole: sRole,
					productName: sProductName,
					platformType: sPlatformType
				};
			},

			/**
			 * Set session data into existing qualtrics global variable "qtxAppContext" in case of V1.
			 * Set session data into a qualtrics global variable "session" in case of V2.
			 * Note: Qualtrics global varibale "session" is introduced in V2.
			 * @param {number} iDataFormat - Data Format either of type V1 or V2
			 */
			_setSessionContextData: function (iDataFormat) {
				if (iDataFormat === Constants.E_DATA_FORMAT.version1) {
					if (!sap.qtxAppContext) {
						sap.qtxAppContext = {};
					}
					sap.qtxAppContext = extend(sap.qtxAppContext, this._oSessionData);
				} else if (iDataFormat === Constants.E_DATA_FORMAT.version2) {
					if (!sap.qtx) {
						sap.qtx = {};
					}
					sap.qtx.session = this._oSessionData;
				}
			},

			/**
			 * Set the Push Telemetry data to qualtric global variables.
			 * This data provides the high level metrics of the push surveys like number of times survey times taken, snoozed etc.
			 * Please refer "sap.qtx.metrics" in our Context Data wiki for detailed descriptions about these metrics.
			 * @param {sap.feedback.ui.flpplugin.data.TelemetryData} oTelemetryData.
			 */
			_setTelemetryData: function (oTelemetryData) {
				this._ensureExistenceOfMetricsOnGlobalQtx();
				if (oTelemetryData) {
					sap.qtx.metrics.push.triggered = oTelemetryData.getPushEventTriggeredCount();
					sap.qtx.metrics.push.executed = oTelemetryData.getPushEventExecutedCount();
					sap.qtx.metrics.push.snoozed = oTelemetryData.getPushEventSnoozedCount();
					sap.qtx.metrics.push.timeSinceLastPush = oTelemetryData.getTimeSinceLastPushEvent();
				}
			},

			/**
			 * Reset Telemetry data.
			 */
			_clearTelemetryData: function () {
				if (sap.qtx && sap.qtx.metrics) {
					sap.qtx.metrics = {};
				}
			},

			/**
			 * Reset Context Data.
			 */
			_resetContextData: function () {
				sap.qtxAppContext = {};
				if (!sap.qtx) {
					sap.qtx = {};
				}
				sap.qtx.appcontext = {};
				sap.qtx.push = {};
				sap.qtx.metrics = {};
			},

			/**
			 * Get the Application Context Data using the version type and set into Qualtrics globals "appcontext".
			 * @param {number} iDataFormat - Data format either in V1 or V2.
			 * @returns
			 */
			_collectAppContextData: function (iDataFormat) {
				return this._oAppContextData.getData(iDataFormat).then(
					function (oContextData) {
						this._setAppContextData(oContextData, iDataFormat);
					}.bind(this)
				);
			},

			/**
			 * Set the appropriate Qualtric global variable with context data based on the data version type.
			 * @param {object} oContextData
			 * @param {number} iDataFormat - Data in V1 or V2 format
			 */
			_setAppContextData: function (oContextData, iDataFormat) {
				//Version 1 deprecated
				if (iDataFormat === Constants.E_DATA_FORMAT.version1) {
					sap.qtxAppContext = extend(sap.qtxAppContext, oContextData);
				} else if (iDataFormat === Constants.E_DATA_FORMAT.version2) {
					sap.qtx.appcontext = oContextData;
					this._updateClientAction();
				}
			},

			/**
			 * Make sure that Qualtrics Application conext gloabl variable is available for setup.
			 */
			_ensureExistenceOfAppContextOnGlobalQtx: function () {
				if (!sap.qtx) {
					sap.qtx = {};
				}
				if (!sap.qtx.appcontext) {
					sap.qtx.appcontext = {};
				}
			},

			/**
			 * Make sure that Qualtrics Device gloabl variable is available for setup.
			 */
			_ensureExistenceOfDeviceOnGlobalQtx: function () {
				if (!sap.qtx) {
					sap.qtx = {};
				}
				if (!sap.qtx.device) {
					sap.qtx.device = {};
				}
			},

			/**
			 * Make sure that Qualtrics Metrics gloabl variable is available for setup.
			 */
			_ensureExistenceOfMetricsOnGlobalQtx: function () {
				if (!sap.qtx) {
					sap.qtx = {};
				}
				if (!sap.qtx.metrics) {
					sap.qtx.metrics = {};
				}
				if (!sap.qtx.metrics.push) {
					sap.qtx.metrics.push = {};
				}
			},

			/**
			 * Set current client action into qualtrics global variable.
			 */
			_updateClientAction: function () {
				this._ensureExistenceOfAppContextOnGlobalQtx();
				sap.qtx.appcontext.clientAction = this._sClientAction;
			},

			/**
			 * Set Previous theme information into qualtrics global variable
			 */
			_updateLastTheme: function () {
				this._ensureExistenceOfAppContextOnGlobalQtx();
				sap.qtx.appcontext.previousTheme = this._sLastTheme;
			},

			/**
			 * Set the follow up count information into qualtrics global variable
			 */
			_updateFollowUpCount: function () {
				this._ensureExistenceOfAppContextOnGlobalQtx();
				sap.qtx.appcontext.followUpCount = this._iFollowUpCount;
			},

			/**
			 * Set the device information into qualtrics globals.
			 */
			_updateDeviceData: function () {
				this._ensureExistenceOfDeviceOnGlobalQtx();
				//clear all
				sap.qtx.device = {};
				//Type
				sap.qtx.device.type = this._getDeviceType();
				//Orientation
				sap.qtx.device.orientation = this._getScreenOrientation();
				//OS Name
				sap.qtx.device.osName = sap.ui.Device.os.name;
				//Browser Name
				sap.qtx.device.browserName = sap.ui.Device.browser.name;
			},

			/**
			 * Get the current device type.
			 * @returns {string} - Device type.
			 */
			_getDeviceType: function () {
				if (sap.ui.Device.system.tablet && !sap.ui.Device.system.desktop) {
					return "tablet";
				} else if (!sap.ui.Device.system.tablet && sap.ui.Device.system.desktop) {
					return "desktop";
				} else if (sap.ui.Device.system.combi) {
					return "combi";
				} else if (sap.ui.Device.system.phone) {
					return "phone";
				} else {
					return Constants.S_DEFAULT_VALUE;
				}
			},

			/**
			 * Get the Device Orientation.
			 * @returns {string} - Device Orientation.
			 */
			_getScreenOrientation: function () {
				if (sap.ui.Device.orientation.landscape) {
					return "landscape";
				} else if (sap.ui.Device.orientation.portrait) {
					return "portrait";
				} else {
					return Constants.S_DEFAULT_VALUE;
				}
			}
		});
	}
);
