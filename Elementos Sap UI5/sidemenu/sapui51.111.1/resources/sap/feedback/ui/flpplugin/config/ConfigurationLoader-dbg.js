/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "./PushConfig", "sap/base/Log", "../utils/Constants"], function (BaseObject, PushConfig, Log, Constants) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.config.ConfigurationLoader", {
		_oStartupConfig: null,

		/**
		 * Init with Startup Configuration
		 * @param {sap.feedback.ui.flpplugin.config.StartupConfig} oStartupConfig
		 */
		init: function (oStartupConfig) {
			if (!oStartupConfig) {
				throw Error("oStartupConfig is not provided!");
			}
			this._oStartupConfig = oStartupConfig;
		},

		/**
		 * Loads the central configuration and initiates the push configuration
		 * @returns {sap.feedback.ui.flpplugin.config.PushConfig} oPushConfig
		 */
		getPushConfiguration: function () {
			return this._loadPushConfiguration()
				.then(
					function (oConfigJson) {
						var oPushConfig = new PushConfig(this._oStartupConfig);
						oPushConfig.init();
						oPushConfig.initFromJSON(oConfigJson);
						return oPushConfig;
					}.bind(this)
				)
				.catch(function () {
					return null;
				});
		},

		/**
		 * Fetches the central configuration and returns it once it is loaded
		 * @returns {Promise<oConfigJson>}
		 */
		_loadPushConfiguration: function () {
			return new Promise(
				function (fnResolve, fnReject) {
					var sConfigurationPath = this._getConfigurationFilePath();
					fetch(sConfigurationPath)
						.then(function (oResponse) {
							return oResponse.json();
						})
						.then(function (oConfigJson) {
							fnResolve(oConfigJson);
						})
						.catch(function (oResponse) {
							Log.error(
								"Fiori Feedback Plug-in error occured on loading the push configuration.",
								oResponse.statusText,
								Constants.S_PLUGIN_CONFIGLOADER_NAME
							);
							fnReject();
						});
				}.bind(this)
			);
		},

		/**
		 * Returns Configuration <JSON file path>
		 * @returns {string} Configuration <JSON file> path
		 */
		_getConfigurationFilePath: function () {
			return sap.ui.require.toUrl("sap/feedback/ui/flpplugin/config/PushConfigSample.json");
		}
	});
});
