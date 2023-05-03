/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["../utils/Constants"], function (Constants) {
	"use strict";

	return {
		/**
		 * Calculate Initial Dynamic Push Date:
		 * Add a certain amount of minutes to a given timestamp to calculate the new timestamp.
		 * @param {object} oPushConfig push configuration.
		 * @returns {number} Returns new timestamp of initial Dynamic Push Date.
		 */
		calculateInitialDynamicPushDate: function (oPushConfig) {
			return this._calculateNextSurveyDate(
				oPushConfig.getIntervalInitialDynamicPushInDays(),
				oPushConfig.getDeviationInitialDynamicPushInDays()
			);
		},

		/**
		 * Calculate Initial In-App Feature Push Date:
		 * Add a certain amount of minutes to a given timestamp to calculate the new timestamp.
		 * @param {object} oPushConfig push configuration.
		 * @returns {number} Returns new timestamp of initial Dynamic Push Date.
		 */
		calculateInitialInAppPushDate: function (oPushConfig) {
			return this._calculateNextSurveyDate(oPushConfig.getIntervalInitialInAppPushInDays(), oPushConfig.getDeviationInitialInAppPushInDays());
		},

		/**
		 * Calculate Next Dynamic Push Date:
		 * Add a certain amount of minutes to a given timestamp to calculate the new timestamp.
		 * @param {object} oPushConfig push configuration.
		 * @returns {number} Returns new timestamp of initial Dynamic Push Date.
		 */
		calculateNextDynamicPushDate: function (oPushConfig) {
			return this._calculateNextSurveyDate(oPushConfig.getIntervalNextDynamicPushInDays(), oPushConfig.getDeviationNextDynamicPushInDays());
		},

		/**
		 * Calculate Next In-App Feature Push Date:
		 * Add a certain amount of minutes to a given timestamp to calculate the new timestamp.
		 * @param {object} oPushConfig push configuration.
		 * @returns {number} Returns new timestamp of initial Dynamic Push Date.
		 */
		calculateNextInAppPushDate: function (oPushConfig) {
			return this._calculateNextSurveyDate(oPushConfig.getIntervalNextInAppPushInDays(), oPushConfig.getDeviationNextInAppPushInDays());
		},

		/**
		 * Add a certain amount of minutes to a given timestamp to calculate the new timestamp.
		 * @param {number} iDayInterval number of days from now when the next survey should occur.
		 * @param {number} iDayDeviation number of days may deviate from iDayInterval.
		 * @returns {?number} Returns new timestamp with minutes added, null in case not all parameters provided.
		 */
		_calculateNextSurveyDate: function (iDayInterval, iDayDeviation) {
			var iDaysToBeAddedToNow = iDayInterval + Math.round(Math.random() * iDayDeviation * 2) - iDayDeviation;
			return Date.now() + iDaysToBeAddedToNow * Constants.E_TIME.daysToMilliseconds;
		}
	};
});
