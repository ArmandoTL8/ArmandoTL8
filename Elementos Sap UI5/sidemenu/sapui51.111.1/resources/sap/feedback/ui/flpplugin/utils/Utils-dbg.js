/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["./Constants", "sap/ui/thirdparty/jquery"], function (Constants, $) {
	"use strict";
	/* globals localStorage */
	return {
		getTriggerButton: function () {
			return $("#surveyTriggerButton");
		},
		getLocalStorage: function () {
			return localStorage;
		},
		//Checks for null, undefined, 0, "", false, NaN
		hasValue: function (oValue) {
			if (typeof oValue !== "undefined" && oValue) {
				return true;
			}
			return false;
		},
		getRandomInt: function (iMin, iMax) {
			iMin = Math.ceil(iMin);
			iMax = Math.floor(iMax);
			return Math.floor(Math.random() * (iMax - iMin)) + iMin;
		},
		isSupportedAppType: function (oCurrentApplication) {
			if (oCurrentApplication && oCurrentApplication.applicationType) {
				var sAppType = oCurrentApplication.applicationType.toLowerCase();
				if (sAppType === "ui5" || sAppType === "wda" || sAppType === "gui" || sAppType === "tr" || sAppType === "nwbc") {
					return true;
				}
			}
			return false;
		},
		convertAppFrameworkTypeToId: function (sType) {
			if (sType) {
				return Constants.E_APP_FRAMEWORK[sType.toLowerCase()] || Constants.E_APP_FRAMEWORK["unknown"];
			}
			return Constants.E_APP_FRAMEWORK["unknown"];
		},
		isObject: function (oValue) {
			if (typeof oValue === "object" || oValue instanceof Object) {
				return true;
			}
			return false;
		},
		isString: function (sValue) {
			if (sValue === "" || typeof sValue === "string" || sValue instanceof String) {
				return true;
			}
			return false;
		},
		stringIsEmpty: function (sValue) {
			if (this.isString(sValue)) {
				return sValue.length === 0 || !sValue.trim();
			}
			return false;
		},
		stringToTitleCase: function (sInput) {
			if (sInput) {
				return sInput.replace(/\w\S*/g, function (sIntermediate) {
					return sIntermediate.charAt(0).toUpperCase() + sIntermediate.substr(1).toLowerCase();
				});
			}
			return sInput;
		},
		isHorizonTheme: function (sThemeName) {
			if (
				sThemeName &&
				(sThemeName === Constants.E_THEME_NAME.horizon ||
					sThemeName === Constants.E_THEME_NAME.horizon_evening ||
					sThemeName === Constants.E_THEME_NAME.horizonHcw ||
					sThemeName === Constants.E_THEME_NAME.horizonHcb)
			) {
				return true;
			}
			return false;
		},
		_isLocalStorageAvailable: function (oWindow) {
			try {
				return "localStorage" in oWindow && oWindow["localStorage"] !== null && oWindow["localStorage"] !== undefined;
			} catch (e) {
				return false;
			}
		},
		isLocalStorageAvailable: function () {
			return this._isLocalStorageAvailable(window);
		},
		isStringValidNumber: function (sInput) {
			return !isNaN(parseFloat(sInput)) && isFinite(sInput);
		},
		isPositiveInteger: function (iValue) {
			return /^\d+$/.test(iValue);
		},
		getCombinedKey: function (sValue1, sValue2) {
			if (this.isString(sValue1) && !this.stringIsEmpty(sValue1) && this.isString(sValue2) && !this.stringIsEmpty(sValue2)) {
				return sValue1.trim().toLowerCase() + "/" + sValue2.trim().toLowerCase();
			}
			return null;
		},
		isClientActionPushEvent: function (sClientAction) {
			if (
				sClientAction === Constants.E_CLIENT_ACTION.backendPush ||
				sClientAction === Constants.E_CLIENT_ACTION.inAppUserFeedback ||
				sClientAction === Constants.E_CLIENT_ACTION.inAppPushFeedback ||
				sClientAction === Constants.E_CLIENT_ACTION.dynamicPushFeedBack
			) {
				return true;
			}
			return false;
		},
		/**
		 * TDOD: verify - Moved this to Util class since it is used in multiple classes now. need to adjust other classes well
		 * @param {object} oUserStorage user storage
		 * @returns {object} userState
		 */
		readUserState: function (oUserStorage) {
			return oUserStorage.readUserState();
		},

		/**
		 * Check the dom to see if a qualtrics survey is open currently
		 * @returns {boolean} userState
		 */
		isQualtricsSurveyPopupOpen: function () {
			var isOpen = false;
			var qualtricsPopup = document.getElementsByClassName("QSIPopOver");
			if (qualtricsPopup && qualtricsPopup.length) {
				isOpen = true;
			}
			return isOpen;
		}
	};
});
