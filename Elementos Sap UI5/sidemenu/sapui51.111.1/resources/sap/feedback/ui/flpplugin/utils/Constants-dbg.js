/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define([], function () {
	"use strict";
	var constants = {
		S_PLUGIN_COMPONENT_NAME: "sap.feedback.ui.flpplugin.Component",
		S_PLUGIN_PLGCTRL_NAME: "sap.feedback.ui.flpplugin.controller.PluginController",
		S_PLUGIN_CTXTDATACTRL_NAME: "sap.feedback.ui.flpplugin.controller.ContextDataController",
		S_PLUGIN_WEBAPPFEEDBACKLDR_NAME: "sap.feedback.ui.flpplugin.controller.WebAppFeedbackLoader",
		S_PLUGIN_APPCONTEXTDATA_NAME: "sap.feedback.ui.flpplugin.data.AppContextData",
		S_PLUGIN_PUSHCONTEXTDATA_NAME: "sap.feedback.ui.flpplugin.data.PushContextData",
		S_PLUGIN_CONFIGLOADER_NAME: "sap.feedback.ui.flpplugin.config.ConfigurationLoader",
		S_PLUGIN_INAPPFEATPUSHCTRL_NAME: "sap.feedback.ui.flpplugin.push.PushController",
		S_PLUGIN_DYNAMICPUSHTRIGGER_NAME: "sap.feedback.ui.flpplugin.push.DynamicPushTrigger",
		S_PLUGIN_LOCALSTATE_NAME: "sap.feedback.ui.flpplugin.push.state.LocalState",
		S_PLUGIN_STORAGE_NAME: "sap.feedback.ui.flpplugin.utils.Storage",
		S_PLUGIN_SURVEY_REQ_HANDLER_NAME: "sap.feedback.ui.flpplugin.survey.RequestHandler",
		S_PLUGIN_SURVEY_REQ_DISPATCHER: "sap.feedback.ui.flpplugin.survey.RequestDispatcher",
		S_PLUGIN_SURVEY_PRESENTATION_CONTROLLER_NAME: "sap.feedback.ui.flpplugin.survey.PresentationController",
		S_PLUGIN_UI_SHELLBARBUTTON_NAME: "sap.feedback.ui.flpplugin.ui.ShellBarButton",
		S_DEFAULT_VALUE: "N/A",
		S_LAUNCHPAD_VALUE: "LAUNCHPAD",
		S_SHELL_BTN_ID: "sap_qualtrics_surveyTriggerButton",
		S_INVISIBLE_ITEM_ID: "surveyTriggerButton",
		S_GENERIC_TRIGGER_AREAID: "sap.feedback.generic",
		S_STOR_PUSH_STATE: "sap.feedback.ui.pushState",
		S_STOR_THEME_START: "sap.feedback.ui.theme_start",
		S_STOR_THEME_FOLLOWUP_OPTIN: "sap.feedback.ui.theme_followup_opt_in",
		S_STOR_THEME_FOLLOWUP_OPTOUT: "sap.feedback.ui.theme_followup_opt_out",
		S_STOR_LAST_THEME: "sap.feedback.ui.last_theme",
		S_THEME_URL_PARAM_SWITCH: "qtx-teched",
		S_SCOPE_FIORI_NEXT_BETA1: "techEd21",
		S_SCOPE_FEATURE_PUSH: "featurePush",
		S_SCOPE_DYNAMIC_PUSH: "dynamicPush",
		S_IMMEDIATE_TEST: "immediateTestMode",
		I_DAYS_UNTIL_STATE_EXPIRY: 180,
		I_MAX_SNOOZE_COUNT: 2,
		E_CLIENT_ACTION: {
			init: "init",
			navBarClick: "navBarClick",
			appLoaded: "appLoaded",
			backendPush: "backendPush",
			inAppUserFeedback: "inAppUserFeedback",
			inAppPushFeedback: "inAppPushFeedback",
			themeChanged: "themeChanged",
			themeChangedOptIn: "themeChangedOptIn",
			themeChangedOptOut: "themeChangedOptOut",
			dynamicPushFeedBack: "dynamicPushFeedback"
		},
		E_THEME_NAME: {
			horizon: "sap_horizon",
			horizon_evening: "sap_horizon_dark",
			horizonHcb: "sap_horizon_hcb",
			horizonHcw: "sap_horizon_hcw",
			fiori3: "sap_fiori_3",
			fiori3Dark: "sap_fiori_3_dark",
			fiori3Hcb: "sap_fiori_3_hcb",
			fiori3Hcw: "sap_fiori_3_hcw",
			belize: "sap_belize",
			belizePlus: "sap_belize_plus",
			belizeHcb: "sap_belize_hcb",
			belizeHcw: "sap_belize_hcw"
		},
		E_PUSH_SRC_TYPE: {
			backend: 1,
			userInApp: 2,
			qualtrics: 3,
			pushInApp: 4,
			dynamic: 5
		},
		E_DISPLAY_FORMAT: {
			popover: 1,
			iframe: 2
		},
		E_SHELLBAR_BUTTON_STATE: {
			unchanged: 1,
			restart: 2
		},
		E_DATA_FORMAT: {
			version1: 1,
			version2: 2
		},
		E_APP_FRAMEWORK: {
			unknown: 1,
			ui5: 2,
			gui: 3,
			angular: 4,
			react: 5,
			vue: 6,
			tr: 7,
			wda: 8,
			nwbc: 9
		},
		E_TIME: {
			minutesToMilliseconds: 60000,
			hoursToMilliseconds: 3600000,
			daysToMilliseconds: 86400000
		},
		E_TRIGGER_NAME: {
			themeTimeSlotTrigger: "themeTimeSlotTrigger",
			themeChangedTrigger: "themeChangedTrigger",
			recurringTrigger: "recurringTrigger"
		}
	};
	return constants;
});