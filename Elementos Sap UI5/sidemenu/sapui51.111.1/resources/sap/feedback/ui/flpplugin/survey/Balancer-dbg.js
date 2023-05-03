/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "../utils/Utils", "../utils/Constants"], function (BaseObject, Utils, Constants) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.survey.Balancer", {
		/**
		 * Initialization.
		 * @param {sap.feedback.ui.flpplugin.utils.Storage} oStorage - User storage
		 */
		init: function (oStorage) {
			if (!oStorage) {
				throw Error("oStorage is not provided!");
			}
			this._oStorage = oStorage;
		},

		/**
		 * protect the user from oversurveying.
		 * @param {number} iPushSrcType Source of the push event.
		 * @returns {boolean} Returns true if the user may be asked to take the survey.
		 */
		balance: function (iPushSrcType) {
			//Check for over-surveying
			return this._isSurveyTimeframeReached(iPushSrcType);
		},

		/**
		 * Validate that a certain amount of time has passed since the last push (considering all push events) to this user.
		 * The purpose is to avoid oversurveying.
		 * @param {number} iPushSrcType Source of the push event
		 * @returns {boolean} Returns true if timeframe to present a survey to the user has passed. False if it has not passed.
		 */
		_isSurveyTimeframeReached: function (iPushSrcType) {
			var oUserState = this._readUserState();
			var iPushDate = null;
			if (iPushSrcType === Constants.E_PUSH_SRC_TYPE.dynamic) {
				iPushDate = oUserState.getDynamicPushDate();
			} else if (iPushSrcType === Constants.E_PUSH_SRC_TYPE.pushInApp) {
				iPushDate = oUserState.getInAppPushDate();
			} else {
				iPushDate = Date.now() + 850301;
			}
			return iPushDate <= Date.now();
		},
		/**
		 * Read current user state from Storage.
		 * @returns {sap.feedback.ui.flpplugin.data.UserState} Returns latest user state from Storage.
		 */
		_readUserState: function () {
			return this._oStorage.readUserState();
		}
	});
});
