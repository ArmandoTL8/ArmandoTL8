/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "./PushConfig"], function (BaseObject, PushConfig) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.config.CentralConfig", {
		_oPushConfig: null,

		/**
		 * Returns Push Configuration.
		 * @returns {sap.feedback.ui.flpplugin.config.PushConfig} Push Configuration.
		 */
		getPushConfig: function () {
			return this._oPushConfig;
		},

		/**
		 * Set Push Configuration.
		 * @param {sap.feedback.ui.flpplugin.config.PushConfig} oPushConfig.
		 */
		setPushConfig: function (oPushConfig) {
			this._oPushConfig = oPushConfig;
		}
	});
});
