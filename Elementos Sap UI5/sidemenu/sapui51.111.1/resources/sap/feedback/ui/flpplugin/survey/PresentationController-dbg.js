/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	[
		"sap/ui/base/Object",
		"sap/base/Log",
		"../data/PushContextData",
		"../data/TelemetryData",
		"../utils/Constants",
		"../ui/UiFactory",
		"./DateCalculator",
		"../utils/Utils"
	],
	function (BaseObject, Log, PushContextData, TelemetryData, Constants, UiFactory, DateCalculator, Utils) {
		"use strict";
		/* global QSI */

		return BaseObject.extend("sap.feedback.ui.flpplugin.survey.PresentationController", {
			_oContextDataController: null,
			_oResourceBundle: null,
			_oUserStorage: null,
			_oCentralConfig: null,
			_oSurveyInvitationDialog: null,

			/**
			 * Initialization.
			 * @param {sap.feedback.ui.flpplugin.controller.ContextDataControlle} oContextDataController - Context data controller
			 * @param {sap.base.i18n.ResourceBundle} oResourceBundle - Resource bundle for text translation
			 * @param {sap.feedback.ui.flpplugin.utils.Storage} oUserStorage - User storage
			 * @param {sap.feedback.ui.flpplugin.config.CentralConfig} oCentralConfig - Central Configuration
			 */
			init: function (oContextDataController, oResourceBundle, oUserStorage, oCentralConfig) {
				if (!oContextDataController) {
					throw Error("oContextDataController is not provided!");
				}
				if (!oResourceBundle) {
					throw Error("oResourceBundle is not provided!");
				}
				if (!oUserStorage) {
					throw Error("oUserStorage is not provided!");
				}
				if (!oCentralConfig) {
					throw Error("oCentralConfig is not provided!");
				}
				this._oContextDataController = oContextDataController;
				this._oResourceBundle = oResourceBundle;
				this._oUserStorage = oUserStorage;
				this._oCentralConfig = oCentralConfig;
			},

			/**
			 * Show feature push survey for current push event. Finally update state for this push event.
			 * Survey will be shown based on the user's activity on the displayed survey invitation dialog.
			 * We have two options on survey invitation dialog
			 *  1. Provide Feedback - opens the Qualtrics survey
			 *  2. Ask me later/ Not now - snoozes the survey
			 * @param {object} oEventData Event data.
			 * @param {object} oStateConfig State and config of the selected event.
			 * @returns {promise} Returns a promise.
			 */
			surveyUser: function (oEventData, oStateConfig) {
				return this._prepareAndRunPushSurvey(oEventData, oStateConfig);
			},

			/**
			 * Trigger push survey for current push event. Finally, update the state for this push event.
			 * Survey will be shown based on the user's activity on the displayed survey invitation dialog.
			 * We have two options on survey invitation dialog
			 *  1. Provide Feedback - opens the Qualtrics survey
			 *  2. Ask me later/ Not now - snoozes the survey
			 * @param {object} oEventData Event data.
			 * @param {object} oStateConfig State and config of the selected event.
			 * @returns {promise} Returns a promise.
			 */
			_prepareAndRunPushSurvey: function (oEventData, oStateConfig) {
				var oPushContextData = this._preparePushContextData(oEventData, oStateConfig);
				if (!this._oSurveyInvitationDialog) {
					this._oSurveyInvitationDialog = UiFactory.createSurveyInvitationDialog(this._oResourceBundle);
				}
				return new Promise(
					function (fnResolve, fnReject) {
						this._oSurveyInvitationDialog.show(
							function (bShowSurvey) {
								if (bShowSurvey) {
									this._updateContextDataAndOpenSurvey(oPushContextData, oStateConfig).then(fnResolve);
								} else {
									this._snoozePush();
									fnResolve();
								}
							}.bind(this),
							oEventData.type
						);
					}.bind(this)
				);
			},

			/**
			 * Create and Get the new Push Context Data. Area ID, Trigger Name and Push Event type are mandatory to get the push context data.
			 * Note: State configuration is absent in case of Dynamic push
			 * @param {object} oEventData - Event Payload.
			 * @param {object} oStateConfig - User State along with the Configurations.
			 * @returns {sap.feedback.ui.flpplugin.data.PushContextData} - oPushContextData.
			 */
			_preparePushContextData: function (oEventData, oStateConfig) {
				var oPushContextData = null;
				var sAreaId, sTriggerName, sShortText, oPayload;
				var iType = oEventData.type;
				if (oStateConfig) {
					// In-App Feature Push
					sAreaId = oStateConfig.oConfig.getAreaId();
					sTriggerName = oStateConfig.oConfig.getTriggerName();
				} else {
					// Dynamic Push
					sAreaId = oEventData.areaId;
					sTriggerName = oEventData.triggerName;
				}
				sShortText = oEventData.shortText || "";
				oPayload = oEventData.payload || null;
				oPushContextData = new PushContextData(sAreaId, sTriggerName, iType, sShortText);
				//Append additional data from caller
				if (oPayload) {
					oPushContextData.setPayloadData(oPayload);
				}
				return oPushContextData;
			},

			/**
			 * Update the Push Context data.
			 * Once the Survey is opened, Update the last push timestamp, update the user push state and calculate + update the next push dates.
			 * @param {sap.feedback.ui.flpplugin.data.PushContextData} oPushContextData - Push Context Data
			 * @param {object} oStateConfig - State along with Configuration
			 * @returns {promise} Returns a promise.
			 */
			_updateContextDataAndOpenSurvey: function (oPushContextData, oStateConfig) {
				var sClientAction = Constants.E_CLIENT_ACTION.inAppPushFeedback;
				if (oPushContextData.getType() === Constants.E_PUSH_SRC_TYPE.dynamic) {
					sClientAction = Constants.E_CLIENT_ACTION.dynamicPushFeedBack;
				}
				var iExecutedCount = 0;
				if (oStateConfig) {
					iExecutedCount = oStateConfig.oState.getExecutedCount();
				}
				var oTelemetryData = this._collectTelemetry(oStateConfig);

				return this._oContextDataController
					.updateContextData(sClientAction, oPushContextData, oTelemetryData)
					.then(
						function () {
							return this._openSurvey(sClientAction, iExecutedCount).then(
								function () {
									//Update last push timestamp
									this._updateLastPushTimestamp();
									//Update local state (push counter etc.)
									this._updatePushState(oStateConfig);
									//Update the next Push dates
									this._updateNextPushDates(oPushContextData.getType());
								}.bind(this)
							);
						}.bind(this)
					)
					.catch(function (oError) {
						Log.error(
							"Fiori Feedback Plug-in error occured on updating push context data.",
							oError.message,
							Constants.S_PLUGIN_SURVEY_PRESENTATION_CONTROLLER_NAME
						);
					});
			},

			/**
			 * Returns Push Telemetry data.
			 * @param {object} oStateConfig - State along with Configuration
			 * @returns {sap.feedback.ui.flpplugin.data.TelemetryData} oTelemetryData - Push Telemetry Data.
			 */
			_collectTelemetry: function (oStateConfig) {
				var oTelemetryData = new TelemetryData();
				var oUserState = Utils.readUserState(this._oUserStorage);
				if (oUserState) {
					oTelemetryData.setPushEventSnoozedCount(oUserState.getSnoozeCount());
					var iTimeSinceLastPush = Date.now() - oUserState.getLastPush();
					oTelemetryData.setTimeSinceLastPushEvent(iTimeSinceLastPush);
				}
				if (oStateConfig && oStateConfig.oState) {
					oTelemetryData.setPushEventTriggeredCount(oStateConfig.oState.getTriggeredCount());
					oTelemetryData.setPushEventExecutedCount(oStateConfig.oState.getExecutedCount());
				}
				return oTelemetryData;
			},

			/**
			 * Snooze the push trigger. Add configured snooze time to the upcoming push.
			 */
			_snoozePush: function () {
				var oUserState = Utils.readUserState(this._oUserStorage);
				if (oUserState) {
					var iSnoozeCount = oUserState.getSnoozeCount();
					if (iSnoozeCount >= Constants.I_MAX_SNOOZE_COUNT) {
						this._skipOnSnooze();
					} else {
						this._updateSnoozeValues(iSnoozeCount + 1);
					}
				}
			},
			/**
			 * Skip push time slot and recalculate next push time slots for both push types.
			 */
			_skipOnSnooze: function () {
				this._updateNextPushDates(Constants.E_PUSH_SRC_TYPE.pushInApp);
				this._updateNextPushDates(Constants.E_PUSH_SRC_TYPE.dynamic);
				var oUserState = Utils.readUserState(this._oUserStorage);
				oUserState.resetSnoozeCount();
				this._saveUserState(oUserState);
			},

			/**
			 * Update any push time slot which is possibly within calculated snooze time frame.
			 * @param {number} iCurrentSnoozeCount - Current snooze counter
			 */
			_updateSnoozeValues: function (iCurrentSnoozeCount) {
				var oUserState = Utils.readUserState(this._oUserStorage);
				var iInAppPushDate = oUserState.getInAppPushDate();
				var iDynamicPushDate = oUserState.getDynamicPushDate();
				var iSnoozeTimeOver =
					Date.now() + Constants.E_TIME.hoursToMilliseconds * (this._getPushConfig().getSnoozePeriodInHrs() * iCurrentSnoozeCount);
				if (iInAppPushDate && iInAppPushDate < iSnoozeTimeOver) {
					oUserState.setInAppPushDate(iSnoozeTimeOver);
				}
				if (iDynamicPushDate && iDynamicPushDate < iSnoozeTimeOver) {
					oUserState.setDynamicPushDate(iSnoozeTimeOver);
				}
				oUserState.increaseSnoozeCount();
				this._saveUserState(oUserState);
			},

			/**
			 * Update the values(current Client action, Last theme, Survey Execution count) and Opens the Survey.
			 * @param {string} sClientAction - current Client Action
			 * @param {number} iExecutedCount - Executed push count
			 * @returns {promise} Returns a promise.
			 */
			_openSurvey: function (sClientAction, iExecutedCount) {
				if (this._oContextDataController) {
					this._oContextDataController.setClientAction(sClientAction);
					this._oContextDataController.setLastTheme(this._sLastThemeId);
					this._oContextDataController.setFollowUpCount(iExecutedCount);
				}
				QSI.API.unload();
				return QSI.API.load().then(function () {
					QSI.API.run();
				});
			},

			/**
			 * Read latest local state, update timestamp of last pushed survey and persist back to local state.
			 */
			_updateLastPushTimestamp: function () {
				var oUserState = Utils.readUserState(this._oUserStorage);
				oUserState.updateLastPushToNow();
				oUserState.resetSnoozeCount();
				this._saveUserState(oUserState);
			},

			/**
			 * Update the current state in localstorage of the event which has been triggered and is being pushed.
			 * @param {object} oStateConfig Current state+config object where the state needs to be updated as a push will happen.
			 */
			_updatePushState: function (oStateConfig) {
				if (oStateConfig) {
					var oState = oStateConfig.oState;
					var oUserState = Utils.readUserState(this._oUserStorage);
					oUserState.resetSnoozeCount();
					var oLatestState = oUserState.getFeaturePushState(oState.getAreaId(), oState.getTriggerName());
					if (oLatestState) {
						oLatestState.increaseExecutedCount();
						this._saveUserState(oUserState);
					} else {
						Log.error("Feature Push state could not be updated.", null, Constants.S_PLUGIN_SURVEY_PRESENTATION_CONTROLLER_NAME);
					}
				}
			},

			/**
			 * Update the push date for the current push event in localstorage and add quite period of 2 days to other push event type.
			 * @param {number} iPushSrcType Current Push Event Type.
			 */
			_updateNextPushDates: function (iPushSrcType) {
				var iQuietPeriodOver = Date.now() + Constants.E_TIME.hoursToMilliseconds * this._getPushConfig().getQuietPeriodInHrs(); //2days
				var oUserState = Utils.readUserState(this._oUserStorage);
				if (oUserState) {
					if (iPushSrcType === Constants.E_PUSH_SRC_TYPE.dynamic) {
						oUserState.setDynamicPushDate(DateCalculator.calculateNextDynamicPushDate(this._getPushConfig()));
						var iInAppPushDate = oUserState.getInAppPushDate();
						if (iInAppPushDate && iInAppPushDate < iQuietPeriodOver) {
							oUserState.setInAppPushDate(iQuietPeriodOver); // trigger next In-App push survey after 2 days
						}
					} else if (iPushSrcType === Constants.E_PUSH_SRC_TYPE.pushInApp) {
						// or just ELSE?
						oUserState.setInAppPushDate(DateCalculator.calculateNextInAppPushDate(this._getPushConfig()));
						var iDynamicPushDate = oUserState.getDynamicPushDate();
						if (iDynamicPushDate && iDynamicPushDate < iQuietPeriodOver) {
							oUserState.setDynamicPushDate(iQuietPeriodOver); // trigger next Dynamic push survey after 2 days
						}
					}
					this._saveUserState(oUserState);
				}
			},

			/**
			 * Returns the current Push Configuration.
			 * @returns {sap.feedback.ui.flpplugin.config.PushConfig} Push Configuration
			 */
			_getPushConfig: function () {
				return this._oCentralConfig.getPushConfig();
			},

			/**
			 * Save the current user state to user storage.
			 * @param {sap.feedback.ui.flpplugin.data.UserState} oUserState User state which should be persisted.
			 */
			_saveUserState: function (oUserState) {
				this._oUserStorage.saveUserState(oUserState);
			}
		});
	}
);
