/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object", "../utils/Utils", "../utils/Constants"], function (BaseObject, Utils, Constants) {
	"use strict";

	return BaseObject.extend("sap.feedback.ui.flpplugin.survey.ValidationHandler", {
		_oStorage: null,
		_oCentralConfig: null,

		/**
		 * Initialization.
		 * @param {sap.feedback.ui.flpplugin.utils.Storage} oStorage - User storage
		 * @param {sap.feedback.ui.flpplugin.config.CentralConfig} oCentralConfig - Central Configuration
		 */
		init: function (oStorage, oCentralConfig) {
			if (!oStorage) {
				throw Error("oStorage is not provided!");
			}
			if (!oCentralConfig) {
				throw Error("oCentralConfig is not provided!");
			}
			this._oStorage = oStorage;
			this._oCentralConfig = oCentralConfig;
		},

		/**
		 * Receive event data with information about appId and trigger which raised the event.
		 * @param {object} oEventData Event data containing AreaID and Trigger of the event raised.
		 * @returns {object} Returns an object with state and config of the successfully validated event. Returns null if no matching config found or validation failed.
		 */
		validate: function (oEventData) {
			//Validate appId and trigger
			if (oEventData.areaId && oEventData.triggerName) {
				var sAreaId = oEventData.areaId;
				var sTriggerName = oEventData.triggerName;
				// Is sent appId a generic one
				var bIsGenericTriggerType = sAreaId === Constants.S_GENERIC_TRIGGER_AREAID ? true : false;

				return this._getRelevantStateConfig(sAreaId, sTriggerName, bIsGenericTriggerType);
			}
			return null;
		},

		/**
		 * Get state and configuration for this event in case it is identifed as relevent (avoiding oversurveying etc.)
		 * @param {string} sAreaId AreaID of the current event
		 * @param {string} sTriggerName Trigger of the current event
		 * @param {boolean} bIsGenericTriggerType True if current event is raised by a generic trigger, false in case it's a custom trigger.
		 * @returns {object} Returns identified, relevant state and configuration.
		 */
		_getRelevantStateConfig: function (sAreaId, sTriggerName, bIsGenericTriggerType) {
			//Collect all configurations (specific and generic).
			var aMatchingConfigs = this._collectConfigurationForEvent(sAreaId, sTriggerName, bIsGenericTriggerType);
			if (aMatchingConfigs && aMatchingConfigs.length > 0) {
				//Collection of state + config {sCombinedKey,oState,oConfig}
				var aConfigStateList = this._combineRelatedStateConfigs(aMatchingConfigs);

				//Check if configuration+state+event result in match (what if two or more matches exist)
				var oStateConfig = this._selectStateConfig(aConfigStateList);
				if (oStateConfig) {
					this._increaseTriggeredCount(oStateConfig);
				}
				return oStateConfig;
			}
			return null;
		},

		/**
		 * Increase triggered count to track how often this state was already selected.
		 * @param {object} oStateConfig Identified, relevant state and configuration.
		 */
		_increaseTriggeredCount: function (oStateConfig) {
			if (oStateConfig.oConfig) {
				var oUserState = Utils.readUserState(this._oStorage);
				if (oUserState) {
					var oFeaturePushState = oUserState.getFeaturePushState(oStateConfig.oConfig.getAreaId(), oStateConfig.oConfig.getTriggerName());
					if (oFeaturePushState) {
						oFeaturePushState.increaseTriggeredCount();
						this._saveUserState(oUserState);
					}
				}
			}
		},

		/**
		 * Collect all configurations (specific and generic) for this event.
		 * @param {string} sAreaId AppID of the current event
		 * @param {string} sTriggerName Trigger of the current event
		 * @param {boolean} bIsGenericTriggerType Returns true if the current event is raised by a generic trigger. False if it's a custom trigger.
		 * @returns {array} Returns a list of matching configurations to provided input event parameters. Returns an empty list if no matches found.
		 */
		_collectConfigurationForEvent: function (sAreaId, sTriggerName, bIsGenericTriggerType) {
			if (bIsGenericTriggerType === true) {
				//Not all generic configs match, only those with matching triggertype (e.g. themeChanged)
				return this._findGenericConfigsWithTriggerType(sTriggerName);
			} else {
				var oAppIdConfig = this._oCentralConfig.getPushConfig().findFeaturePushConfigById(sAreaId, sTriggerName);
				if (oAppIdConfig) {
					return [oAppIdConfig];
				}
				return null;
			}
		},

		/**
		 * Create a list of found states and configurations by combining each pair to make accessing information easier.
		 * @param {array} aMatchingConfigs Found configurations which are relevant for the current event.
		 * @returns {array} Returns an array with objects containing related state + configuration.
		 */
		_combineRelatedStateConfigs: function (aMatchingConfigs) {
			var aConfigStateList = [];
			aMatchingConfigs.forEach(
				function (oConfig) {
					var oCurrentStateConfig = {};
					oCurrentStateConfig.sCombinedKey = oConfig.getCombinedKey();
					oCurrentStateConfig.oConfig = oConfig;
					//Collect states via appId and trigger, if exists
					var oState = this._findStateById(oConfig.getAreaId(), oConfig.getTriggerName());
					// If state does not exists, create new initial state to be able to identify multiple matches.
					if (!oState) {
						var oUserState = Utils.readUserState(this._oStorage);
						oState = oUserState.createAndAddFeaturePushState(oConfig.getAreaId(), oConfig.getTriggerName(), oConfig.getTriggerType());
						this._saveUserState(oUserState);
					}
					if (oState) {
						oCurrentStateConfig.oState = oState;
						aConfigStateList.push(oCurrentStateConfig);
					}
				}.bind(this)
			);
			return aConfigStateList;
		},

		/**
		 * Select one particular state+config if multiple exist as only one event can be processed.
		 * @param {array} aConfigStateList Combined state and configuration list
		 * @returns {?object} Returns a single state + configuration object.
		 */
		_selectStateConfig: function (aConfigStateList) {
			if (aConfigStateList && aConfigStateList.length > 0) {
				//Filter only for qualifying states
				var aQualifyingConfigStateList = this._filterQualifiedConfigs(aConfigStateList);

				if (aQualifyingConfigStateList.length === 1) {
					return aQualifyingConfigStateList[0];
				} else if (aQualifyingConfigStateList.length > 1) {
					var iRand = Utils.getRandomInt(0, aQualifyingConfigStateList.length);
					return aQualifyingConfigStateList[iRand];
				}
			}
			return null;
		},

		/**
		 * Filter all state+configuration objects which qualify to be taken for the current push event.
		 * @param {array} aConfigStateList Combined state and configuration list
		 * @returns {array} Returns a list of state+configurations objects which are qualified.
		 */
		_filterQualifiedConfigs: function (aConfigStateList) {
			var aResultList = [];
			if (aConfigStateList && aConfigStateList.length > 0) {
				var oUserState = Utils.readUserState(this._oStorage);
				aConfigStateList.forEach(function (oConfigState) {
					if (oConfigState.oConfig.isQualifiedForPush(oConfigState.oState, oUserState)) {
						aResultList.push(oConfigState);
					}
				});
			}
			return aResultList;
		},
		/**
		 * Find all configs which are flagged as generic
		 * @param {string} sTriggerType Triggertype of generic configs which has to match.
		 * @returns {array} Returns array of matching FeaturePushConfigs.
		 */
		_findGenericConfigsWithTriggerType: function (sTriggerType) {
			var aTypeConfigs = this._oCentralConfig.getPushConfig().findGenericFeaturePushConfigWithTriggerType(sTriggerType);
			if (aTypeConfigs && aTypeConfigs.length > 0) {
				return aTypeConfigs;
			}
			return null;
		},

		/**
		 * Find all states logged for a specific id (appId + trigger)
		 * @param {string} sAreaId App ID of the event
		 * @param {string} sTriggerName Trigger of the event
		 * @returns {string} Returns state for requested appId + trigger.
		 */
		_findStateById: function (sAreaId, sTriggerName) {
			var oUserState = Utils.readUserState(this._oStorage);
			if (oUserState) {
				return oUserState.getFeaturePushState(sAreaId, sTriggerName);
			}
			return null;
		},

		/**
		 * Save current user state to Storage.
		 * @param {sap.feedback.ui.flpplugin.data.UserState} oUserState User state which should be persisted.
		 */
		_saveUserState: function (oUserState) {
			if (oUserState) {
				this._oStorage.saveUserState(oUserState);
			}
		}
	});
});
