/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	["sap/ui/base/Object", "sap/base/Log", "sap/ui/core/InvisibleText", "../utils/Constants"],
	function (BaseObject, Log, InvisibleText, Constants) {
		"use strict";

		return BaseObject.extend("sap.feedback.ui.flpplugin.ui.ShellBarButton", {
			_fnRendererPromise: null,
			_oResourceBundle: null,
			_oInvisibleSurveyButton: null,
			_oHeaderItemOptions: {},
			_oHeaderItem: null,
			_fnDialogCallback: null,
			_bIsButtonHidden: false,
			constructor: function (fnRendererPromise, fnDialogCallback, oResourceBundle) {
				if (!fnRendererPromise) {
					Log.error("Renderer expected", null, Constants.S_PLUGIN_UI_SHELLBARBUTTON_NAME);
				}
				if (!fnDialogCallback) {
					Log.error("Dialog callback expected", null, Constants.S_PLUGIN_UI_SHELLBARBUTTON_NAME);
				}
				if (!oResourceBundle) {
					Log.error("ResourceBundle expected", null, Constants.S_PLUGIN_UI_SHELLBARBUTTON_NAME);
				}
				this._fnRendererPromise = fnRendererPromise;
				this._fnDialogCallback = fnDialogCallback;
				this._oResourceBundle = oResourceBundle;
			},
			init: function () {
				this._createInvisibleText();
				this._defineButtonOptions();
				return this._fnRendererPromise.then(
					function (oRenderer) {
						this._oHeaderItem = oRenderer.addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", this._oHeaderItemOptions, true);
					}.bind(this)
				);
			},
			_createInvisibleText: function () {
				this._oInvisibleSurveyButton = new InvisibleText({
					id: Constants.S_INVISIBLE_ITEM_ID,
					text: this._getText("SHELLBAR_BUTTON_TOOLTIP")
				}).toStatic();
			},
			_defineButtonOptions: function () {
				this._oHeaderItemOptions = {
					id: Constants.S_SHELL_BTN_ID,
					icon: "sap-icon://feedback",
					tooltip: this._getText("SHELLBAR_BUTTON_TOOLTIP"),
					ariaLabel: this._getText("SHELLBAR_BUTTON_TOOLTIP"),
					text: this._getText("SHELLBAR_BUTTON_TOOLTIP"),
					press: this._fnDialogCallback.bind(this)
				};
			},
			_getText: function (sTextKey) {
				if (this._oResourceBundle) {
					var text = this._oResourceBundle.getText(sTextKey);
					return text;
				}
				return sTextKey;
			}
		});
	}
);
