/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "sap/base/Log", "../utils/Constants"], function (BaseObject, Log, Constants) {
	"use strict";
	/* global QSI */

	return BaseObject.extend("sap.feedback.ui.flpplugin.controller.WebAppFeedbackLoader", {
		_oStartupConfig: null,
		_isAPILoaded: false,
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
		 * Initialization.
		 * Accepts the callback function and this callback is called when the qualtrics API is loaded.
		 * @param {function} fnOnAPILoadedCallback
		 */
		init: function (fnOnAPILoadedCallback) {
			this._registerAPILoadedEvent(fnOnAPILoadedCallback);
		},

		/**
		 * @returns {boolean} Returns true if qualtrics API is loaded successfully.
		 */
		getIsAPILoaded: function () {
			return this._isAPILoaded;
		},

		/**
		 * Listen to qualtrics API event qsi_js_loaded and set the boolean flag.
		 * @param {function} fnOnAPILoadedCallback.
		 */
		_registerAPILoadedEvent: function (fnOnAPILoadedCallback) {
			//Make sure to be notified once intercept API has been loaded
			/* eslint-disable sap-forbidden-window-property*/
			/* eslint-disable sap-no-global-define */
			// this is triggered by the creative close button and required as custom event trigger is not re-registered after survey ran once
			window.addEventListener(
				"qsi_js_loaded",
				function () {
					if (QSI && QSI.API) {
						this._isAPILoaded = true;
					} else {
						this._isAPILoaded = false;
						Log.error("Qualtrics API did not load correctly. QSI.API not available.", null, Constants.S_PLUGIN_WEBAPPFEEDBACKCTRL_NAME);
					}
					if (fnOnAPILoadedCallback) {
						fnOnAPILoadedCallback();
					}
				}.bind(this),
				false
			);
			/* eslint-enable sap-no-global-define */
			/* eslint-enable sap-forbidden-window-property*/
		},

		/**
		 * Injects Qualtrics URI into HTML DOM.
		 */
		loadAPI: function () {
			/* eslint-disable */
			//BEGIN: Qualtrics deployment snipppet
			try {
				var a = document.createElement("script");
				a.type = "text/javascript";
				a.src = this._oStartupConfig.getQualtricsUri();
				document.body && document.body.appendChild(a);
			} catch (oError) {
				Log.error("Cannot inject Qualtrics snippet", oError.message, Constants.S_PLUGIN_WEBAPPFEEDBACKLDR_NAME);
			}
			/* eslint-enable */
			//END: Qualtrics deployment snipppet
		},
		reloadIntercepts: function () {
			if (QSI && QSI.API) {
				QSI.API.unload();
				QSI.API.load().then(QSI.API.run());
			}
		}
	});
});
