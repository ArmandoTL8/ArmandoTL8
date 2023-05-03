/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/m/Button", "sap/m/Dialog", "sap/m/FormattedText"], function (Button, Dialog, FormattedText) {
	"use strict";

	return {
		createButton: function (constructorConfig) {
			return new Button(constructorConfig);
		},

		createDialog: function (constructorConfig) {
			return new Dialog(constructorConfig);
		},

		createFormattedText: function (constructorConfig) {
			return new FormattedText(constructorConfig);
		}
	};
});
