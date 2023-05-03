/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "./Ui5ControlFactory", "../utils/Constants"], function (BaseObject, Ui5ControlFactory, Constants) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.ui.SurveyInvitationDialog", {
		_oResourceBundle: null,
		_oSurveyInvitationDialog: null,
		_fnDialogCallback: null,
		_oAskLaterButton: null,

		constructor: function (oResourceBundle) {
			this._oResourceBundle = oResourceBundle;
		},

		_dialogCallBack: function (bProvide) {
			this._oSurveyInvitationDialog.close();
			this._fnDialogCallback(bProvide);
		},

		show: function (fnCallBack, iPushType) {
			if (!this._oSurveyInvitationDialog || (this._oSurveyInvitationDialog && !this._oSurveyInvitationDialog.isOpen())) {
				this._fnDialogCallback = fnCallBack;
			}
			if (!this._oSurveyInvitationDialog) {
				this._oProvideButton = Ui5ControlFactory.createButton({
					id: "ProvideButton",
					type: sap.m.ButtonType.Emphasized,
					text: this._getText("YOUR_OPINION_PROVIDEBUTTON"),
					press: function () {
						this._dialogCallBack(true);
					}.bind(this)
				});
				this._oAskLaterButton = Ui5ControlFactory.createButton({
					id: "AskLaterButton",
					press: function () {
						this._dialogCallBack(false);
					}.bind(this)
				});
				this._oSurveyInvitationDialog = Ui5ControlFactory.createDialog({
					type: sap.m.DialogType.Message,
					title: this._getText("YOUR_OPINION_TITLE"),
					content: Ui5ControlFactory.createFormattedText({ htmlText: this._getText("YOUR_OPINION_TEXT") }),
					beginButton: this._oProvideButton,
					endButton: this._oAskLaterButton,
					escapeHandler: function (promise) {
						promise.resolve();
						this._fnDialogCallback(false);
					}.bind(this)
				});
			}
			if (!this._oSurveyInvitationDialog.isOpen()) {
				var sAskLaterText = this._getText("YOUR_OPINION_NOTNOW");
				if (iPushType === Constants.E_PUSH_SRC_TYPE.dynamic) {
					sAskLaterText = this._getText("YOUR_OPINION_ASKLATERBUTTON");
				}
				this._oAskLaterButton.setText(sAskLaterText);
				this._oSurveyInvitationDialog.open();
			}
		},

		_getText: function (sTextKey) {
			var text = this._oResourceBundle.getText(sTextKey);
			return text;
		}
	});
});
