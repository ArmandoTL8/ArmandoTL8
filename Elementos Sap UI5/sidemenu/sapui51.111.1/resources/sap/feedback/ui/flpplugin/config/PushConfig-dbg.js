/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	["sap/ui/base/Object", "../push/config/FeaturePushConfig", "../utils/Utils", "../utils/ScopeCheck", "../push/config/trigger/TriggerFactory"],
	function (BaseObject, FeaturePushConfig, Utils, ScopeCheck, TriggerFactory) {
		"use strict";

		return BaseObject.extend("sap.feedback.ui.flpplugin.config.PushConfig", {
			_oStartupConfig: null,
			_oFeatureConfig: null,
			_iDynamicPushIntervalTimerInMinutes: null,
			_iMinimumTimeToStartTimerForDynamicPushInHrs: null,

			_iQuietPeriodInHrs: null,
			_iSnoozePeriodInHrs: null,

			_iIntervalInitialDynamicPushInDays: null,
			_iDeviationInitialDynamicPushInDays: null,
			_iIntervalInitialInAppPushInDays: null,
			_iDeviationInitialInAppPushInDays: null,

			_iIntervalNextDynamicPushInDays: null,
			_iDeviationNextDynamicPushInDays: null,
			_iIntervalNextInAppPushInDays: null,
			_iDeviationNextInAppPushInDays: null,

			/**
			 * Constructor:
			 * assign startup configuration to instance variable.
			 * @param {sap.feedback.ui.flpplugin.config.StartupConfig} oStartupConfig Startup configuration
			 */
			constructor: function (oStartupConfig) {
				if (!oStartupConfig) {
					throw Error("oStartupConfig is not provided!");
				}
				this._oStartupConfig = oStartupConfig;
			},

			/**
			 * Initialize the feature push configuration with empty Object.
			 */
			init: function () {
				this._oFeatureConfig = {};
			},

			/**
			 * Init a static configuration.
			 * This is only TEMPORARY as long as not backend exists.
			 * @param {object} oConfigJson JSON file to initialise from
			 */
			initFromJSON: function (oConfigJson) {
				this._initStaticProd();
				if (ScopeCheck.isImmediateTestModeParamActive()) {
					this._initStaticTest();
				}

				this._parseFeaturePushConfig(oConfigJson.pushConfig.featurePushConfigs);
			},

			/**
			 * Get each Feature Push Configuration and set a appropriate Trigger to it and then collect it into a array.
			 * @param {Array} aFeaturePushConfigs List of feature push configurations
			 */
			_parseFeaturePushConfig: function (aFeaturePushConfigs) {
				aFeaturePushConfigs.forEach(
					function (oFeaturePushConfigData) {
						if (ScopeCheck.isFeaturePushAvailable(this._oStartupConfig)) {
							var oFeaturePushTrigger = oFeaturePushConfigData.trigger;
							var sTriggerType = oFeaturePushTrigger.type;
							var oCurrentTrigger = TriggerFactory.createTrigger(oFeaturePushTrigger);
							var oFeaturePushConfig = new FeaturePushConfig();
							oFeaturePushConfig.initFromJSON(oFeaturePushConfigData);
							oFeaturePushConfig.setTriggerConfig(sTriggerType, oCurrentTrigger);
							this.addFeaturePushConfig(oFeaturePushConfig);
						}
					}.bind(this)
				);
			},

			/**
			 * Set the time in hrs - Minimum Time to Start the Timer to trigger the Dynamic push.
			 * @param {number} iTimeInHrs Time in Hours
			 */
			setMinimumTimeToStartTimerForDynamicPush: function (iTimeInHrs) {
				this._iMinimumTimeToStartTimerForDynamicPushInHrs = iTimeInHrs;
			},

			/**
			 * Set the interval in minutes between any push event.
			 * @param {number} iInterval Interval between push events in minutes.
			 */
			setDynamicPushIntervalTimer: function (iInterval) {
				this._iDynamicPushIntervalTimerInMinutes = iInterval;
			},

			//Time to Pause
			getQuietPeriodInHrs: function () {
				return this._iQuietPeriodInHrs;
			},
			getSnoozePeriodInHrs: function () {
				return this._iSnoozePeriodInHrs;
			},

			// Initial Dynamic Push
			getIntervalInitialDynamicPushInDays: function () {
				return this._iIntervalInitialDynamicPushInDays;
			},
			getDeviationInitialDynamicPushInDays: function () {
				return this._iDeviationInitialDynamicPushInDays;
			},

			// Next Dynamic Push
			getIntervalNextDynamicPushInDays: function () {
				return this._iIntervalNextDynamicPushInDays;
			},
			getDeviationNextDynamicPushInDays: function () {
				return this._iDeviationNextDynamicPushInDays;
			},

			// Initial InApp Push
			getIntervalInitialInAppPushInDays: function () {
				return this._iIntervalInitialInAppPushInDays;
			},
			getDeviationInitialInAppPushInDays: function () {
				return this._iDeviationInitialInAppPushInDays;
			},

			// Next InApp Push
			getIntervalNextInAppPushInDays: function () {
				return this._iIntervalNextInAppPushInDays;
			},
			getDeviationNextInAppPushInDays: function () {
				return this._iDeviationNextInAppPushInDays;
			},

			// Minimum Time to Start the Timer to trigger the Dynamic push.
			getMinimumTimeToStartTimerForDynamicPush: function () {
				return this._iMinimumTimeToStartTimerForDynamicPushInHrs;
			},

			/**
			 * Get the interval in minutes between any push event.
			 * @returns {number} Returns the interval in minutes.
			 */
			getDynamicPushIntervalTimer: function () {
				return this._iDynamicPushIntervalTimerInMinutes;
			},

			/**
			 * Add a new feature push config object to the configuration.
			 * If a feature push configuration with the same combined key (areaid+triggername) already exists, it will be replaced with the provided object.
			 * @param {sap.feedback.ui.flpplugin.push.config.FeaturePushConfig} oFeaturePushConfig The feature push config object which should be added to the configuration.
			 */
			addFeaturePushConfig: function (oFeaturePushConfig) {
				if (this._oFeatureConfig) {
					this._oFeatureConfig[oFeaturePushConfig.getCombinedKey()] = oFeaturePushConfig;
				}
			},

			/**
			 * Find a feature push configuration for the provided combined key (areaid+triggername). If none exists it will return undefined.
			 * @param {string} sAreaId Source app id
			 * @param {string} sTriggerName Source trigger
			 * @returns {sap.feedback.ui.flpplugin.push.config.FeaturePushConfig} Returns a single feature push configuration. If none exists for the provided combined key (areaid+triggername) it will return undefined.
			 */
			findFeaturePushConfigById: function (sAreaId, sTriggerName) {
				var sCombinedKey = Utils.getCombinedKey(sAreaId, sTriggerName);
				var oResult = this._oFeatureConfig[sCombinedKey];
				if (oResult && oResult.isActive()) {
					return oResult;
				}
				return null;
			},

			/**
			 * Find all feature push configurations which are flagged as generic and were the trigger type matches. If none exists an empty array will be returned.
			 * @param {string} sTriggerType Trigger type
			 * @returns {[sap.feedback.ui.flpplugin.push.config.FeaturePushConfig]} Returns all matching feature push configurations. If none exists for the provided parameters it will return an empty array.
			 */
			findGenericFeaturePushConfigWithTriggerType: function (sTriggerType) {
				var aResult = [];
				Object.keys(this._oFeatureConfig).forEach(
					function (sKey) {
						var oCurrentConfig = this._oFeatureConfig[sKey];
						if (oCurrentConfig.isActive() && oCurrentConfig.getIsGeneric() && oCurrentConfig.getTriggerType() === sTriggerType) {
							aResult.push(oCurrentConfig);
						}
					}.bind(this)
				);
				return aResult;
			},

			/**
			 * Find all feature push configurations which are identified as expired.
			 * @returns {[sap.feedback.ui.flpplugin.push.config.FeaturePushConfig]} Returns all matching feature push configurations. If none exists an empty array will be returned.
			 */
			findExpiredFeatureConfigs: function () {
				var aResult = [];
				Object.keys(this._oFeatureConfig).forEach(
					function (sKey) {
						var oCurrentConfig = this._oFeatureConfig[sKey];
						if (oCurrentConfig.isExpired()) {
							aResult.push(oCurrentConfig);
						}
					}.bind(this)
				);
				return aResult;
			},

			/**
			 * Initialize the Push Data in Hrs/Days - Production Mode.
			 */
			_initStaticProd: function () {
				this.setDynamicPushIntervalTimer(30);
				this.setMinimumTimeToStartTimerForDynamicPush(12);

				this._iQuietPeriodInHrs = 48;
				this._iSnoozePeriodInHrs = 25;

				this._iIntervalInitialDynamicPushInDays = 35;
				this._iDeviationInitialDynamicPushInDays = 7;

				this._iIntervalInitialInAppPushInDays = 14;
				this._iDeviationInitialInAppPushInDays = 7;

				this._iIntervalNextDynamicPushInDays = 90;
				this._iDeviationNextDynamicPushInDays = 28;

				this._iIntervalNextInAppPushInDays = 45;
				this._iDeviationNextInAppPushInDays = 7;
			},

			/**
			 * Initialize the Push Data in Hrs/Days - Test Mode.
			 */
			_initStaticTest: function () {
				this.setDynamicPushIntervalTimer(2);
				this.setMinimumTimeToStartTimerForDynamicPush(12);

				this._iQuietPeriodInHrs = 0;
				this._iSnoozePeriodInHrs = 0;

				this._iIntervalInitialDynamicPushInDays = 0;
				this._iDeviationInitialDynamicPushInDays = 0;

				this._iIntervalInitialInAppPushInDays = 0;
				this._iDeviationInitialInAppPushInDays = 0;

				this._iIntervalNextDynamicPushInDays = 0;
				this._iDeviationNextDynamicPushInDays = 0;

				this._iIntervalNextInAppPushInDays = 0;
				this._iDeviationNextInAppPushInDays = 0;
			}
		});
	}
);
