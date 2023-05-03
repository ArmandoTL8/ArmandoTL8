/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	["sap/ui/base/Object", "sap/base/Log", "sap/ushell/services/AppConfiguration", "../utils/Constants", "../utils/Utils", "../utils/UI5Utils"],
	function (BaseObject, Log, AppConfiguration, Constants, Utils, UI5Utils) {
		"use strict";

		return BaseObject.extend("sap.feedback.ui.flpplugin.data.AppContextData", {
			_dataV1: null,
			_dataV2: null,

			constructor: function () {},

			/**
			 * Returns the appropriate context data based on the data format type provided in the startup configuration.
			 * We have two types currently version V1 and version V2. V1 is older format and more specific to UI5 apps but the newer format V2 is latest which shall be used in future for all applications.
			 * This context data will be set to sap/qualtrics global variables which are referred in the qualtrics survey. May be to "sap.qtxAppContext" for V1 format or to "sap.qtx.appcontext" for V2 format.
			 * Please Note: Version V1 is deprecated since UI5 v1.93
			 * @param {number} iFormat - Data Format type in number.
			 * @returns {promise<object>} data in either V1 or V2 format
			 */
			getData: function (iFormat) {
				return this._updateData().then(
					function () {
						if (iFormat === Constants.E_DATA_FORMAT.version1) {
							return this._dataV1;
						} else if (iFormat === Constants.E_DATA_FORMAT.version2) {
							return this._dataV2;
						}
						return null;
					}.bind(this)
				);
			},

			/**
			 * Get the Context data and with that update the Data(with V1/V2).
			 */
			_updateData: function () {
				this._resetData();
				return this._collectData().then(
					function (oContextData) {
						this._setData(oContextData);
					}.bind(this),
					function () {
						//Clear in case of rejection
						this._resetData();
					}.bind(this)
				);
			},

			/**
			 * Reset the data.
			 */
			_resetData: function () {
				this._dataV1 = {
					ui5Version: Constants.S_DEFAULT_VALUE,
					ui5Theme: Constants.S_DEFAULT_VALUE,
					fioriId: Constants.S_DEFAULT_VALUE,
					appTitle: Constants.S_DEFAULT_VALUE,
					language: Constants.S_DEFAULT_VALUE,
					componentId: Constants.S_DEFAULT_VALUE,
					appVersion: Constants.S_DEFAULT_VALUE,
					ach: Constants.S_DEFAULT_VALUE
				};

				this._dataV2 = {
					appFrameworkId: Constants.S_DEFAULT_VALUE,
					appFrameworkVersion: Constants.S_DEFAULT_VALUE,
					theme: Constants.S_DEFAULT_VALUE,
					appId: Constants.S_DEFAULT_VALUE,
					appTitle: Constants.S_DEFAULT_VALUE,
					languageTag: Constants.S_DEFAULT_VALUE,
					technicalAppComponentId: Constants.S_DEFAULT_VALUE,
					appVersion: Constants.S_DEFAULT_VALUE,
					appSupportInfo: Constants.S_DEFAULT_VALUE
				};
			},

			/**
			 * Set the data.
			 * @param {object} oContextData - Current Application's Context Data.
			 */
			_setData: function (oContextData) {
				this._dataV1 = {
					ui5Version: oContextData.appFrameworkVersion,
					ui5Theme: oContextData.theme,
					fioriId: oContextData.appId,
					appTitle: oContextData.appTitle,
					language: oContextData.languageTag,
					componentId: oContextData.technicalAppComponentId,
					appVersion: oContextData.appVersion,
					ach: oContextData.appSupportInfo
				};

				this._dataV2 = oContextData;
			},

			/**
			 * Returns Current User language else returns the default core language based on current locale information.
			 * @param {sap.ushell.User} oUserData Current User Data.
			 * @returns {string} Current Language.
			 */
			_getLanguage: function (oUserData) {
				if (oUserData) {
					var sValue = oUserData.getLanguage();
					//in some cases (e.g. local debugging 'en-US' is returned and survey logic does not work)
					if (sValue && sValue.length === 2) {
						return sValue.toUpperCase();
					}
				}
				return UI5Utils.getLanguage().toUpperCase();
			},

			/**
			 * Get the current application information and extract the context data and then resolve it.
			 * @returns {Promise<oContextData>} Promise of Context data.
			 */
			_collectData: function () {
				return new Promise(
					function (fnResolve, fnReject) {
						var oCurrentApp = UI5Utils.getCurrentApp();
						if (Utils.isSupportedAppType(oCurrentApp)) {
							this._collectionAppInfoData(oCurrentApp).then(
								function (oInfo) {
									var oContextData = this._assignAppInfoData(oInfo);
									fnResolve(oContextData);
								}.bind(this)
							);
						} else {
							Log.warning("App not of a supported app type.", null, Constants.S_PLUGIN_APPCONTEXTDATA_NAME);
							fnReject();
						}
					}.bind(this)
				);
			},

			/**
			 * Returns the application's information.
			 * We have a case where S4's home page is directly embedded in Launchpad (applicable only in Fiori Next theme).
			 * In this case to get the correct application context we need to set the hardcoded values to app id, app title, and technical component id. Else, we can pick the app title directly from the application's metadata.
			 * @param {object} oCurrentApp - current application from "sap.ushell.components.applicationIntegration.AppLifeCycle".
			 * @returns {Promise<oInfo>} oInfo Promise of current application's information.
			 */
			_collectionAppInfoData: function (oCurrentApp) {
				return new Promise(function (fnResolve, fnReject) {
					var aAppInfoParameters = [
						"appId",
						"appVersion",
						"appSupportInfo",
						"technicalAppComponentId",
						"appFrameworkId",
						"appFrameworkVersion"
					];

					oCurrentApp
						.getInfo(aAppInfoParameters)
						.then(function (oInfo) {
							var oMetaData = AppConfiguration.getMetadata();

							if (oMetaData && oMetaData.title) {
								oInfo.appTitle = oMetaData.title;
							}

							if (oInfo.appId && oInfo.appId === Constants.S_LAUNCHPAD_VALUE) {
								oInfo.appTitle = Utils.stringToTitleCase(oInfo.appId);
							}
							fnResolve(oInfo);
						})
						.catch(function (error) {
							fnReject(error);
						});
				});
			},

			/**
			 * Extract the Application information into Context data.
			 * @param {object} oInfo - Current application information.
			 * @returns {object} Collected Context data.
			 */
			_assignAppInfoData: function (oInfo) {
				var oContextData = {};
				var oUserInfo = UI5Utils.getUserInfo();
				if (oUserInfo) {
					var oUserData = oUserInfo.getUser();
					if (oUserData) {
						oContextData.languageTag = this._getLanguage(oUserData);
					}
				}
				oContextData.theme = UI5Utils.getTheme();

				if (oInfo) {
					oContextData.appFrameworkId = Utils.convertAppFrameworkTypeToId(oInfo["appFrameworkId"]) || Constants.S_DEFAULT_VALUE;
					oContextData.appFrameworkVersion = oInfo["appFrameworkVersion"] || Constants.S_DEFAULT_VALUE;
					oContextData.appId = oInfo["appId"] || Constants.S_DEFAULT_VALUE;
					oContextData.appTitle = oInfo["appTitle"] || Constants.S_DEFAULT_VALUE;
					oContextData.technicalAppComponentId = oInfo["technicalAppComponentId"] || Constants.S_DEFAULT_VALUE;
					oContextData.appVersion = oInfo["appVersion"] || Constants.S_DEFAULT_VALUE;
					oContextData.appSupportInfo = oInfo["appSupportInfo"] || Constants.S_DEFAULT_VALUE;
				}
				return oContextData;
			}
		});
	}
);
