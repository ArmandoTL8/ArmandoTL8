/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
	[
		"sap/ui/base/Object",
		"sap/base/Log",
		"../utils/Constants",
		"../utils/Utils",
		"../utils/ScopeCheck",
		"../utils/UI5Utils",
		"./ContextDataController",
		"../push/config/trigger/TriggerType",
		"../push/DynamicPushTrigger",
		"../ui/ShellBarButton",
		"../ui/PopOverVisual",
		"./WebAppFeedbackLoader",
		"../utils/Storage",
		"../survey/RequestDispatcher",
		"../survey/SurveyFactory"
	],
	function (
		BaseObject,
		Log,
		Constants,
		Utils,
		ScopeCheck,
		UI5Utils,
		ContextDataController,
		TriggerType,
		DynamicPushTrigger,
		ShellBarButton,
		PopOverVisual,
		WebAppFeedbackLoader,
		Storage,
		RequestDispatcher,
		SurveyFactory
	) {
		"use strict";
		/* global QSI, sap */

		return BaseObject.extend("sap.feedback.ui.flpplugin.controller.PluginController", {
			_oStartupConfig: null,
			_oCentralConfig: null,
			_oContextDataController: null,
			_oShellButton: null,
			_oWebAppFeedbackLoader: null,
			_fnRendererPromise: null,
			_oResourceBundle: null,
			_oLocalStorage: null,
			_sLastThemeId: null,
			_sCurrentThemeId: null,
			_oRequestDispatcher: null,
			_oDynamicPushTrigger: null,

			constructor: function (oStartupConfig, fnRendererPromise, oResourceBundle) {
				this._oStartupConfig = oStartupConfig;
				this._fnRendererPromise = fnRendererPromise;
				this._oResourceBundle = oResourceBundle;
			},
			init: function () {
				if (this._initStorage()) {
					this._initLastTheme();
					return new Promise(
						function (resolve, reject) {
							if (this._oStartupConfig) {
								this._initAndGetCentralConfiguration().then(
									function (oCentralConfig) {
										if (oCentralConfig) {
											this._initContextData();
											this._initRequestDispatcher(oCentralConfig);
											this._initUI();
											this._initWebAppFeedback();
											this._initDynamicPushTrigger(oCentralConfig);
											this._updateInitialContextData()
												.then(function () {
													resolve();
												})
												.catch(function (oError) {
													Log.error(
														"Fiori Feedback Plug-in error occured on updating context data on init.",
														oError.message,
														Constants.S_PLUGIN_PLGCTRL_NAME
													);
													resolve();
												});
										} else {
											reject();
										}
									}.bind(this)
								);
							} else {
								reject();
							}
						}.bind(this)
					);
				} else {
					return Promise.reject();
				}
			},
			_initStorage: function () {
				if (Utils.isLocalStorageAvailable()) {
					this._oLocalStorage = new Storage();
					this._oLocalStorage.init();
					return true;
				}
				return false;
			},
			_initLastTheme: function () {
				var sCurrentThemeId = UI5Utils.getTheme();
				var sLastThemeId = sCurrentThemeId;
				if (this._oLocalStorage) {
					sLastThemeId = this._oLocalStorage.getLastTheme();
					if (!sLastThemeId) {
						// No last theme persisted, do it now with current one.
						sLastThemeId = sCurrentThemeId;
					}
				}
				this._updateThemeState(sLastThemeId, sCurrentThemeId, true);
			},
			_initContextData: function () {
				this._oContextDataController = new ContextDataController(this._oStartupConfig);
				return this._oContextDataController.init();
			},
			_initRequestDispatcher: function (oCentralConfig) {
				if (this._oLocalStorage) {
					//Feature Push (scopeSet: featurePush OR Url-parameter) is set
					//Dynamic Push (scopeSet: dynamicPush OR Url-parameter) is set
					if (ScopeCheck.isFeaturePushAvailable(this._oStartupConfig) || ScopeCheck.isDynamicPushAvailable(this._oStartupConfig)) {
						if (!this._oRequestDispatcher) {
							this._oRequestDispatcher = new RequestDispatcher();
							this._oRequestDispatcher.init(
								this._oStartupConfig,
								oCentralConfig,
								this._oContextDataController,
								this._oResourceBundle,
								this._oLocalStorage
							);
						}
					}
				}
			},
			_initAndGetCentralConfiguration: function () {
				var oCentralConfig = SurveyFactory.createCentralConfiguration();
				var oConfigLoader = SurveyFactory.createConfigurationLoader();
				oConfigLoader.init(this._oStartupConfig);
				return oConfigLoader
					.getPushConfiguration()
					.then(
						function (oPushConfig) {
							oCentralConfig.setPushConfig(oPushConfig);
							this._oCentralConfig = oCentralConfig;
							return oCentralConfig;
						}.bind(this)
					)
					.catch(function () {
						return null;
					});
			},
			_initUI: function () {
				this._oVisual = new PopOverVisual();
				if (this._oVisual) {
					this._oShellButton = new ShellBarButton(this._fnRendererPromise, this._onSurveyShow.bind(this), this._oResourceBundle);
					this._oShellButton.init();
				}
			},
			_initWebAppFeedback: function () {
				this._oWebAppFeedbackLoader = new WebAppFeedbackLoader(this._oStartupConfig);
				this._oWebAppFeedbackLoader.init(this._onAPILoadedCallback.bind(this));
				this._oWebAppFeedbackLoader.loadAPI();
			},
			_initDynamicPushTrigger: function (oCentralConfig) {
				if (ScopeCheck.isDynamicPushAvailable(this._oStartupConfig) && this._oRequestDispatcher) {
					this._oDynamicPushTrigger = new DynamicPushTrigger(oCentralConfig, this._oLocalStorage);
					this._oDynamicPushTrigger.init(this._oRequestDispatcher.handleDynamicPush.bind(this._oRequestDispatcher));
				}
			},
			_initGenericFeaturePushTriggers: function () {
				// Generic trigger
				if (ScopeCheck.isFeaturePushAvailable(this._oStartupConfig)) {
					sap.ui.getCore().attachThemeChanged(
						function (oEvent) {
							this._onThemeChanged(oEvent);
						}.bind(this)
					);
				}
			},

			_updateInitialContextData: function () {
				return this._oContextDataController.updateContextData(Constants.E_CLIENT_ACTION.init);
			},
			_onAPILoadedCallback: function () {
				return this._oContextDataController
					.updateContextData(Constants.E_CLIENT_ACTION.init)
					.then(
						function () {
							UI5Utils.getAppLifeCycleService().attachAppLoaded({}, this._onAppLoaded, this);
							this._initGenericFeaturePushTriggers();
						}.bind(this)
					)
					.catch(function (oError) {
						Log.error(
							"Fiori Feedback Plug-in error occured on updating context data on load.",
							oError.message,
							Constants.S_PLUGIN_PLGCTRL_NAME
						);
					});
			},
			_openSurvey: function (sClientAction, iFollowUpCount) {
				if (this._oContextDataController) {
					this._oContextDataController.setClientAction(sClientAction);
					this._oContextDataController.setLastTheme(this._sLastThemeId);
					this._oContextDataController.setFollowUpCount(iFollowUpCount);
				}
				QSI.API.unload();
				QSI.API.load().then(function () {
					QSI.API.run();
				});
			},
			_onSurveyShow: function () {
				return new Promise(
					function (fnResolve, fnReject) {
						if (this._oWebAppFeedbackLoader.getIsAPILoaded()) {
							this._oContextDataController
								.updateContextData(Constants.E_CLIENT_ACTION.navBarClick, null)
								.then(
									function () {
										this._oVisual.show();
										fnResolve();
									}.bind(this)
								)
								.catch(function (oError) {
									Log.error(
										"Fiori Feedback Plug-in error occured on updating context data on show.",
										oError.message,
										Constants.S_PLUGIN_PLGCTRL_NAME
									);
									fnReject();
								});
						}
					}.bind(this)
				);
			},
			_onAppLoaded: function () {
				return this._oContextDataController
					.updateContextData(Constants.E_CLIENT_ACTION.appLoaded)
					.then(
						function () {
							// Generic Feature Push trigger
							if (ScopeCheck.isFeaturePushAvailable(this._oStartupConfig)) {
								sap.ui.getCore().getEventBus().publish("sap.feedback", "inapp.feature", {
									areaId: Constants.S_GENERIC_TRIGGER_AREAID,
									triggerName: TriggerType.E_TRIGGER_TYPE.recurring
								});
							}
						}.bind(this)
					)
					.catch(function (oError) {
						Log.error("Fiori Feedback Plug-in error occured on updating context data.", oError.message, Constants.S_PLUGIN_PLGCTRL_NAME);
					});
			},
			_onThemeChanged: function (oEvent) {
				var sNewThemeId = oEvent.getParameters().theme;
				//Check current theme against new theme, as themeChanged event is fired multiple times.
				if (this._sCurrentThemeId !== sNewThemeId) {
					//Update lastTheme and currentTheme with this._sCurrentThemeId
					this._updateThemeState(this._sCurrentThemeId, sNewThemeId, false);

					return this._oContextDataController
						.updateContextData(Constants.E_CLIENT_ACTION.themeChanged)
						.then(function () {
							sap.ui.getCore().getEventBus().publish("sap.feedback", "inapp.feature", {
								areaId: Constants.S_GENERIC_TRIGGER_AREAID,
								triggerName: TriggerType.E_TRIGGER_TYPE.themeChanged
							});
						})
						.catch(function (oError) {
							Log.error(
								"Fiori Feedback Plug-in error occured on updating context data.",
								oError.message,
								Constants.S_PLUGIN_PLGCTRL_NAME
							);
						});
				}
			},
			_updateThemeState: function (sNewLastThemeId, sCurrentThemeId, isInit) {
				if (this._oLocalStorage) {
					//On client startup don't interpret as theme toggle, just update init state.
					if (!isInit) {
						this._updateThemeToggleStart(sNewLastThemeId, sCurrentThemeId);
					}
					this._oLocalStorage.updateLastTheme(sNewLastThemeId); //Update persistence
					this._sLastThemeId = sNewLastThemeId; //Update local variable
					this._oLocalStorage.updateCurrentTheme(sCurrentThemeId); //Update persistence
					this._sCurrentThemeId = sCurrentThemeId; //Update local variable
				} else {
					this._sCurrentThemeId = sCurrentThemeId; //Update local variable
				}
			},
			_updateThemeToggleStart: function (sLastThemeId, sCurrentThemeId) {
				if (this._oLocalStorage) {
					if (Utils.isHorizonTheme(sCurrentThemeId)) {
						//Is current active theme Horizon
						this._oLocalStorage.setThemeToggleStart(Date.now());
					} else if (Utils.isHorizonTheme(sLastThemeId)) {
						//Is previous theme Horizon
						this._oLocalStorage.deleteThemeToggleStart();
					}
				}
			}
		});
	}
);
