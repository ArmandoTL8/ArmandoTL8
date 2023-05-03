/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	[
		"sap/ui/base/Object",
		"sap/base/Log",
		"./SurveyFactory",
		"./RequestHandler",
		"../utils/Constants",
		"./DateCalculator",
		"../utils/Utils",
		"../utils/ScopeCheck",
		"../push/config/trigger/TriggerType"
	],
	function (BaseObject, Log, SurveyFactory, RequestHandler, Constants, DateCalculator, Utils, ScopeCheck, TriggerType) {
		"use strict";

		return BaseObject.extend("sap.feedback.ui.flpplugin.survey.RequestDispatcher", {
			_oStartupConfig: null,
			_oCentralConfig: null,
			_oContextDataController: null,
			_oRequestHandler: null,
			_oResourceBundle: null,
			_bInitializationErrorOccured: false,
			_oPresentationController: null,
			/**
			 * Validate if current config can override the general rules/threshold to protect the user from oversurveying.
			 * @param {sap.feedback.ui.flpplugin.config.StartupConfig} oStartupConfig config which should be checked.
			 * @param {sap.feedback.ui.flpplugin.config.CentralConfig} oCentralConfig config which should be checked.
			 * @param {sap.feedback.ui.flpplugin.controller.ContextDataController} oContextDataController survey context data collection.
			 * @param {sap.base.i18n.ResourceBundle} oResourceBundle text bundle for invitation dialog.
			 * @param {sap.feedback.ui.flpplugin.utils.Storage} oUserStorage access class to manage the user's state.
			 */
			init: function (oStartupConfig, oCentralConfig, oContextDataController, oResourceBundle, oUserStorage) {
				if (!oStartupConfig) {
					Log.error("oStartupConfig is missing during initialization!", null, Constants.S_PLUGIN_SURVEY_REQ_DISPATCHER);
					this._bInitializationErrorOccured = true;
				}
				if (!oCentralConfig) {
					Log.error("oCentralConfig is missing during initialization!", null, Constants.S_PLUGIN_SURVEY_REQ_DISPATCHER);
					this._bInitializationErrorOccured = true;
				}
				if (!oContextDataController) {
					Log.error("oContextDataController is missing during initialization!", null, Constants.S_PLUGIN_SURVEY_REQ_DISPATCHER);
					this._bInitializationErrorOccured = true;
				}
				if (!oResourceBundle) {
					Log.error("oResourceBundle is missing during initialization!", null, Constants.S_PLUGIN_SURVEY_REQ_DISPATCHER);
					this._bInitializationErrorOccured = true;
				}
				if (!oUserStorage) {
					Log.error("oUserStorage is missing during initialization!", null, Constants.S_PLUGIN_SURVEY_REQ_DISPATCHER);
					this._bInitializationErrorOccured = true;
				}
				if (!this._bInitializationErrorOccured) {
					this._oStartupConfig = oStartupConfig;
					this._oCentralConfig = oCentralConfig;
					this._oContextDataController = oContextDataController;
					this._oResourceBundle = oResourceBundle;
					this._oUserStorage = oUserStorage;
					this._oRequestHandler = new RequestHandler();
					this._setupInitialPushDates();
					this._oRequestHandler.init(this._onRequestReceivedCallback.bind(this));
				}
			},

			/**
			 * Handle dynamic push request.
			 * Public method to trigger the Dynamic Push Survey.
			 * */
			handleDynamicPush: function () {
				if (this._canUserDigestSurvey(Constants.E_PUSH_SRC_TYPE.dynamic)) {
					var oEventData = {
						areaId: Constants.S_GENERIC_TRIGGER_AREAID,
						triggerName: TriggerType.E_TRIGGER_TYPE.dynamic,
						type: Constants.E_PUSH_SRC_TYPE.dynamic
					};
					this._triggerPushSurvey(oEventData, null);
				}
			},

			/**
			 * Receive event data with information about appId and trigger which raised the event.
			 * @param {object} oEventData Event data containing AreaID, TriggerName, ShortText and Payload of the event raised.
			 */
			_onRequestReceivedCallback: function (oEventData) {
				var oValidationHandler = SurveyFactory.createValidationHandler();
				oValidationHandler.init(this._oUserStorage, this._oCentralConfig);
				var oStateConfig = oValidationHandler.validate(oEventData);
				if (oStateConfig) {
					var isForcePush = this._isForcePush(oStateConfig.oConfig);
					if (this._canUserDigestSurvey(oEventData.type) || isForcePush) {
						this._triggerPushSurvey(oEventData, oStateConfig);
					}
				}
			},

			/**
			 * Evaluate if the user is ready for a new survey.
			 * @param {number} iPushSrcType Source of the push event.
			 * @returns {boolean} Returns true if the user is ready for a new survey otherwise false.
			 */
			_canUserDigestSurvey: function (iPushSrcType) {
				if (!Utils.isQualtricsSurveyPopupOpen()) {
					var oBalancer = SurveyFactory.createBalancer();
					oBalancer.init(this._oUserStorage);
					return oBalancer.balance(iPushSrcType);
				}
				return false;
			},

			/**
			 * Call up the survey. Will always ask the user if it's ok.
			 * @param {object} oEventData Event data containing AreaID, TriggerName, ShortText and Payload of the event raised.
			 * @param {object} oStateConfig Current configuration: Collection of state + config {sCombinedKey,oState,oConfig}.
			 */
			_triggerPushSurvey: function (oEventData, oStateConfig) {
				if (!this._PresentationController) {
					this._PresentationController = SurveyFactory.createPresentationController();
					this._PresentationController.init(this._oContextDataController, this._oResourceBundle, this._oUserStorage, this._oCentralConfig);
				}
				this._PresentationController.surveyUser(oEventData, oStateConfig);
			},

			/**
			 * Validate if current config can override the general rules/threshold to protect the user from oversurveying. If any survey is already open will always return false.
			 * @param {object} oPushConfig Feature Push config which should be checked.
			 * @returns {boolean} Returns true if current config is allowed to push anytime and returns false if it is protected from oversurveying or when any survey already open.
			 */
			_isForcePush: function (oPushConfig) {
				return oPushConfig.getTriggerConfig().canForcePush() && !Utils.isQualtricsSurveyPopupOpen();
			},

			/**
			 * Validate if current config can override the general rules/threshold to protect the user from oversurveying.
			 */
			_setupInitialPushDates: function () {
				var oUserState = this._oUserStorage.readUserState();
				if (oUserState) {
					var iDynamicPushDate = oUserState.getDynamicPushDate();
					var iInAppPushDate = oUserState.getInAppPushDate();
					var bDirty = false;
					if (!iDynamicPushDate && ScopeCheck.isDynamicPushAvailable(this._oStartupConfig)) {
						var iInitialDynamicPushDate = DateCalculator.calculateInitialDynamicPushDate(this._getPushConfig());
						oUserState.setDynamicPushDate(iInitialDynamicPushDate);
						bDirty = true;
					}
					if (!iInAppPushDate && ScopeCheck.isFeaturePushAvailable(this._oStartupConfig)) {
						var iInitialInAppPushDate = DateCalculator.calculateInitialInAppPushDate(this._getPushConfig());
						oUserState.setInAppPushDate(iInitialInAppPushDate);
						bDirty = true;
					}
					if (bDirty) {
						this._oUserStorage.saveUserState(oUserState);
					}
				}
			},

			/**
			 * Get the Push Configuration.
			 * @returns {ap.feedback.ui.flpplugin.data.PushConfig} Push Configuration
			 */
			_getPushConfig: function () {
				return this._oCentralConfig.getPushConfig();
			}
		});
	}
);
