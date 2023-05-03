/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["./SurveyInvitationDialog"], function (SurveyInvitationDialog) {
	"use strict";

	return {
		createSurveyInvitationDialog: function (oResourceBundle) {
			return new SurveyInvitationDialog(oResourceBundle);
		}
	};
});
