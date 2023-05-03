//@ui5-bundle sap/fe/test/library-preload.js
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/BaseActions", ["sap/ui/test/Opa5", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/fe/test/Utils"],
	function (Opa5, OpaBuilder, FEBuilder, Utils) {
		"use strict";

		/**
		 * Constructs a new {@link sap.fe.test.Opa5} instance.
		 *
		 * @class All common actions (<code>When</code>) for all Opa tests are defined here.
		 * @alias sap.fe.test.BaseActions
		 * @public
		 */
		return Opa5.extend("sap.fe.test.BaseActions", {
			/**
			 * Closes the open popover via function.
			 *
			 * NOTE: This function ensures that a certain UI state is maintained in some exceptional cases.
			 * This function isn't usually called directly in a journey.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseActions#iClosePopover
			 * @public
			 */
			iClosePopover: function () {
				return FEBuilder.createClosePopoverBuilder(this).description("Closing open popover").execute();
			},
			/**
			 * Simulates the pressing of the Esc key for the element in focus.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseActions#iPressEscape
			 * @public
			 */
			iPressEscape: function () {
				return FEBuilder.create(this)
					.has(FEBuilder.Matchers.FOCUSED_ELEMENT)
					.do(FEBuilder.Actions.keyboardShortcut("Escape"))
					.description("Pressing escape button")
					.execute();
			},
			/**
			 * Waits for the specified amount of milliseconds.
			 *
			 * NOTE: Use this function with care, as waiting for a specified timeframe only makes sense in exceptional cases.
			 *
			 * @param {number} iMilliseconds The amount of milliseconds to wait before proceeding
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseActions#iWait
			 * @private
			 */
			iWait: function (iMilliseconds) {
				var bWaitingPeriodOver = false,
					bFirstTime = true;
				return FEBuilder.create(this)
					.check(function () {
						if (bFirstTime) {
							bFirstTime = false;
							setTimeout(function () {
								bWaitingPeriodOver = true;
							}, iMilliseconds);
						}
						return bWaitingPeriodOver;
					})
					.description(Utils.formatMessage("Waiting for '{0}' milliseconds ", iMilliseconds))
					.execute();
			},
			/**
			 * Emulates a browser back navigation.
			 *
			 * NOTE: If the application is executed within the FLP, use {@link sap.fe.test.Shell#iNavigateBack} instead.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseActions#iNavigateBack
			 * @private
			 */
			iNavigateBack: function () {
				return OpaBuilder.create(this)
					.viewId(null)
					.do(function () {
						Opa5.getWindow().history.back();
					})
					.description("Navigating back via browser back")
					.execute();
			},
			/**
			 * Emulates a browser forward navigation.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseActions#iNavigateForward
			 * @private
			 */
			iNavigateForward: function () {
				return OpaBuilder.create(this)
					.viewId(null)
					.do(function () {
						Opa5.getWindow().history.forward();
					})
					.description("Navigating back via browser forward")
					.execute();
			},
			/**
			 * Changes the timeout to the specified amount of seconds.
			 * The new timeout will be active for all waitFor calls to follow until a new timeout is set.
			 *
			 * @param {number} iSeconds The amount of seconds to be set for the timeout
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseActions#iChangeTimeout
			 * @private
			 */
			iChangeTimeout: function (iSeconds) {
				Opa5.extendConfig({
					timeout: iSeconds
				});
				return (
					FEBuilder.create(this)
						.check(function () {
							return true;
						})
						// .hasId("This.Id.does.not.exist")
						.description(Utils.formatMessage("Timeout set to '{0}' seconds ", iSeconds))
						.execute()
				);
			}
		});
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/BaseArrangements", ["sap/ui/test/Opa5", "sap/ui/test/OpaBuilder", "sap/ui/thirdparty/jquery", "sap/base/util/UriParameters", "./Utils", "./Stubs"],
	function (Opa5, OpaBuilder, jQuery, UriParameters, Utils, Stubs) {
		"use strict";

		/**
		 * Constructs a new {@link sap.fe.test.Opa5} instance.
		 *
		 * @param {object} mSettings The settings object required for launching the application
		 * @param {string} mSettings.launchUrl The URL to the launching page (usually a FLP.html)
		 * @param {object} mSettings.launchParameters The URL launch parameters
		 * @class All common arrangements (<code>Given</code>) for all Opa tests are defined here.
		 * @alias sap.fe.test.BaseArrangements
		 * @extends sap.ui.test.Opa5
		 * @public
		 */
		return Opa5.extend("sap.fe.test.BaseArrangements", {
			constructor: function (mSettings) {
				Opa5.apply(this);
				var oUriParams = new UriParameters(window.location.href),
					mDefaultLaunchParameters = {
						"sap-ui-log-level": "ERROR",
						"sap-ui-xx-viewCache": true
					};
				if (oUriParams.get("useBackendUrl")) {
					mDefaultLaunchParameters.useBackendUrl = oUriParams.get("useBackendUrl");
				}
				this._mSettings = Utils.mergeObjects(
					{
						launchParameters: mDefaultLaunchParameters
					},
					mSettings
				);
			},

			/**
			 * Starts the app in an IFrame, using the <code>launchUrl</code> and <code>launchParameters</code> provided via the settings object of the {@link sap.fe.test.BaseArrangements#constructor}.
			 *
			 * @param {string} [sAppHash] The app hash
			 * @param {object} [mInUrlParameters] A map with additional URL parameters
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseArrangements#iStartMyApp
			 * @public
			 */
			iStartMyApp: function (sAppHash, mInUrlParameters) {
				var sLaunchUrl = this._mSettings.launchUrl,
					mUrlParameters = Utils.mergeObjects(this._mSettings.launchParameters, mInUrlParameters),
					sUrlParameters = Object.keys(mUrlParameters).reduce(function (sCurrent, sKey) {
						return sCurrent + "&" + sKey + "=" + mUrlParameters[sKey];
					}, ""),
					sStartupUrl = sLaunchUrl + (sUrlParameters ? "?" + sUrlParameters.substring(1) : "") + (sAppHash ? "#" + sAppHash : "");

				this.iStartMyAppInAFrame(sStartupUrl);

				// We need to reset the native navigation functions in the IFrame
				// as the navigation mechanism in SAP Fiori elements uses them
				// (they are overridden in OPA by the iFrameLauncher)
				// We also need to override the native confirm dialog, as it blocks the test
				return OpaBuilder.create(this)
					.success(function () {
						var oWindow = Opa5.getWindow();

						Stubs.stubAll(oWindow);
					})
					.description(Utils.formatMessage("Started URL '{0}' in iFrame", sStartupUrl))
					.execute();
			},

			/**
			 * Clears the browser's local storage and session storage.
			 *
			 * NOTE: The function itself is not meant to be called directly within a journey.
			 * Instead, it can be overwritten to add custom clean-up functionality when calling {@link sap.fe.test.BaseArrangements#iResetTestData}.
			 *
			 * @returns {object} A <code>Promise</code> object
			 * @function
			 * @name sap.fe.test.BaseArrangements#resetTestData
			 * @protected
			 */
			resetTestData: function () {
				function _deleteDatabase(sName) {
					return new Promise(function (resolve, reject) {
						var oRequest = indexedDB.deleteDatabase(sName);
						oRequest.onsuccess = resolve;
						oRequest.onerror = reject;
					});
				}

				localStorage.clear();
				sessionStorage.clear();

				if (indexedDB) {
					if (typeof indexedDB.databases === "function") {
						// browser supports enumerating existing databases - wipe all.
						return indexedDB.databases().then(function (aDatabases) {
							return Promise.all(
								aDatabases.map(function (oDatabase) {
									return _deleteDatabase(oDatabase.name);
								})
							);
						});
					} else {
						// browser does not support enumerating databases (e.g. Firefox) - at least delete the UI5 cache.
						return _deleteDatabase("ui5-cachemanager-db");
					}
				} else {
					// no indexedDB
					return Promise.resolve();
				}
			},

			/**
			 * Resets the test data.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseArrangements#iResetTestData
			 * @public
			 */
			iResetTestData: function () {
				var that = this,
					bSuccess = false;

				return OpaBuilder.create(this)
					.success(function () {
						//clear local storage so no flex change / variant management zombies exist
						that.resetTestData()
							.finally(function () {
								bSuccess = true;
							})
							.catch(function (oError) {
								throw oError;
							});

						return OpaBuilder.create(this)
							.check(function () {
								return bSuccess;
							})
							.execute();
					})
					.description(Utils.formatMessage("Resetting test data"))
					.execute();
			},

			/**
			 * Resets the mock data.
			 *
			 * @param {object} [oAppInfo] The application id or a uri pointing to the service. One of the following properties needs to be provided within the parameter:
			 * <code><pre>
			 * 	{
			 * 		<ServiceUri>: <uri of the service like listed in the manifest (sap.app.dataSources.mainService.uri)>
			 * 		<AppId>: <application id like listed in the manifest (sap.app.id)>
			 *  }
			 * </pre></code>
			 * NOTE: When passing the AppId, the application needs to be running already. Calling the function before the application is started can be done by passing the ServiceUri.
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseArrangements#iResetMockData
			 * @public
			 */
			iResetMockData: function (oAppInfo) {
				var bSuccess = false;
				return OpaBuilder.create(this)
					.success(function () {
						var sServiceUri = oAppInfo.AppId
								? Opa5.getWindow()[oAppInfo.AppId].Component.getMetadata().getManifest()["sap.app"]["dataSources"][
										"mainService"
								  ]["uri"]
								: oAppInfo.ServiceUri,
							oReloadMockData = jQuery.post(sServiceUri + "\\$metadata/reload");

						Promise.all([oReloadMockData])
							.finally(function () {
								bSuccess = true;
							})
							.catch(function (oError) {
								throw oError;
							});

						return OpaBuilder.create(this)
							.check(function () {
								return bSuccess;
							})
							.execute();
					})
					.description(Utils.formatMessage("Resetting mock data"))
					.execute();
			},

			/**
			 * Tears down the current application.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseArrangements#iTearDownMyApp
			 * @public
			 */
			iTearDownMyApp: function () {
				return OpaBuilder.create(this)
					.do(function () {
						var oWindow = Opa5.getWindow();
						Stubs.restoreAll(oWindow);
					})
					.do(this.iTeardownMyAppFrame.bind(this))
					.description("Tearing down my app")
					.execute();
			},

			/**
			 * Simulates a refresh of the page by tearing it down and then restarting it with the very same hash.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseArrangements#iRestartMyApp
			 * @public
			 */
			iRestartMyApp: function () {
				var that = this;
				return OpaBuilder.create(this)
					.success(function () {
						var sCurrentHash = Opa5.getWindow().location.hash.substring(1);
						return that.iTearDownMyApp().and.iStartMyApp(sCurrentHash);
					})
					.description("Restarting the app")
					.execute();
			}
		});
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/BaseAssertions", ["sap/ui/test/Opa5", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/fe/test/Utils"],
	function (Opa5, OpaBuilder, FEBuilder, Utils) {
		"use strict";

		/**
		 * Constructs a new {@link sap.fe.test.Opa5} instance.
		 *
		 * @class All common assertions (<code>Then</code>) for all Opa tests are defined here.
		 * @alias sap.fe.test.BaseAssertions
		 * @public
		 */
		return Opa5.extend("sap.fe.test.BaseAssertions", {
			/**
			 * Checks whether a {@link sap.m.MessagePage} with given message is shown.
			 *
			 * @param {string} sMessage The message shown on the message page
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseAssertions#iSeeMessagePage
			 * @public
			 */
			iSeeMessagePage: function (sMessage) {
				return OpaBuilder.create(this)
					.hasType("sap.m.MessagePage")
					.hasProperties({ text: sMessage })
					.description(Utils.formatMessage("Error Page with message '{0}' is visible", sMessage))
					.execute();
			},
			/**
			 * Checks whether a {@link sap.m.Page} is shown.
			 *
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @alias sap.fe.test.BaseAssertions#iSeePage
			 * @public
			 */
			iSeePage: function () {
				return OpaBuilder.create(this).hasType("sap.m.Page").hasProperties({ showHeader: false }).execute();
			},
			/**
			 * Checks whether a {@link sap.m.IllustratedMessage} with given message is shown.
			 *
			 * @param {string} sMessage The message shown on the page
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @alias sap.fe.test.BaseAssertions#iSeeIllustratedMessage
			 * @public
			 */
			iSeeIllustratedMessage: function (sMessage) {
				return OpaBuilder.create(this).hasType("sap.m.IllustratedMessage").hasProperties({ title: sMessage }).execute();
			},
			/**
			 * Checks whether a {@link sap.m.MessageToast} with the given text is shown.
			 *
			 * @param {string} sText The text shown in the MessageToast
			 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
			 * @function
			 * @name sap.fe.test.BaseAssertions#iSeeMessageToast
			 * @public
			 */
			iSeeMessageToast: function (sText) {
				return FEBuilder.createMessageToastBuilder(sText).execute(this);
			}
		});
	}
);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/test/CollaborationClient", ["sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/test/api/CollaborationAPI", "sap/ui/test/OpaBuilder"], function (CollaborationCommon, CollaborationAPI, OpaBuilder) {
  "use strict";

  var Activity = CollaborationCommon.Activity;
  function CollaborationClient(oPageDefinition) {
    const sAppId = oPageDefinition.appId,
      sComponentId = oPageDefinition.componentId,
      viewId = `${sAppId}::${sComponentId}`;
    return {
      actions: {
        iEnterDraft: function (userID, userName) {
          return OpaBuilder.create(this).hasId(viewId).do(function (view) {
            const oContext = view.getBindingContext();
            CollaborationAPI.enterDraft(oContext, userID, userName);
          }).viewId("").description("Remote session entering draft").execute();
        },
        iLeaveDraft: function () {
          return OpaBuilder.create(this).do(function () {
            CollaborationAPI.leaveDraft();
          }).description("Remote session leaving draft").execute();
        },
        iLockPropertyForEdition: function (sPropertyPath) {
          return OpaBuilder.create(this).do(function () {
            CollaborationAPI.startLiveChange(sPropertyPath);
          }).description(`Remote session locking property ${sPropertyPath}`).execute();
        },
        iUnlockPropertyForEdition: function () {
          return OpaBuilder.create(this).do(function () {
            CollaborationAPI.undoChange();
          }).description("Remote session unlocking property ").execute();
        },
        iUpdatePropertyValue: function (sPropertyPath, value) {
          return OpaBuilder.create(this).do(function () {
            CollaborationAPI.updatePropertyValue(sPropertyPath, value);
          }).description(`Remote session updating property ${sPropertyPath} with ${value}`).execute();
        },
        iDiscardDraft: function () {
          return OpaBuilder.create(this).do(function () {
            CollaborationAPI.discardDraft();
          }).description("Remote session discarding draft").execute();
        },
        iDeleteDraft: function () {
          return OpaBuilder.create(this).do(function () {
            CollaborationAPI.deleteDraft();
          }).description("Remote session deleting draft").execute();
        }
      },
      assertions: {
        iCheckDefaultUserChangedValue: function (sPropertyPath) {
          return OpaBuilder.create(this).check(function () {
            return CollaborationAPI.checkReceived({
              userID: "DEFAULT_USER",
              userAction: Activity.Change,
              clientContent: sPropertyPath
            });
          }).description(`Remote session received change notification for${sPropertyPath} changed`).execute();
        },
        iCheckDefaultUserCanceledChangedValue: function (sPropertyPath) {
          return OpaBuilder.create(this).check(function () {
            return CollaborationAPI.checkReceived({
              userID: "DEFAULT_USER",
              userAction: Activity.Undo,
              clientContent: sPropertyPath
            });
          }).description(`Remote session received undo change notification for${sPropertyPath}`).execute();
        },
        iCheckDefaultUserLeftDraft: function () {
          return OpaBuilder.create(this).check(function () {
            return CollaborationAPI.checkReceived({
              userID: "DEFAULT_USER",
              userAction: Activity.Leave
            });
          }).description("Remote session received notification on default user leaving the draft session").execute();
        },
        iCheckDefaultUserEnteredDraft: function () {
          return OpaBuilder.create(this).check(function () {
            return CollaborationAPI.checkReceived({
              userID: "DEFAULT_USER",
              userAction: Activity.Join
            });
          }).description("Remote session received notification on default user entering the draft session").execute();
        },
        iCheckDefaultUserCreatedDocument: function (sDocumentPath) {
          return OpaBuilder.create(this).check(function () {
            return CollaborationAPI.checkReceived({
              userID: "DEFAULT_USER",
              userAction: Activity.Create,
              clientContent: sDocumentPath
            });
          }).description(sDocumentPath ? `Remote session received create notification for ${sDocumentPath}` : "Remote session received create notification").execute();
        }
      }
    };
  }
  return CollaborationClient;
}, false);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/ConfirmDialog", ["sap/ui/test/OpaBuilder", "sap/ui/test/Opa5", "sap/fe/test/Utils"], function (OpaBuilder, Opa5, Utils) {
	"use strict";

	function resetTestWindowConfirmDialog(oConfirmationContext) {
		if (oConfirmationContext.testWindow) {
			oConfirmationContext.testWindow.confirm = oConfirmationContext.testWindowConfirm;
			delete oConfirmationContext.testWindow;
			delete oConfirmationContext.testWindowConfirm;
		}
	}

	return {
		create: function () {
			return {
				actions: {
					iSetNextConfirmAnswer: function (bConfirm, oConfirmationContext) {
						return OpaBuilder.create(this)
							.do(function () {
								var oTestWindow = Opa5.getWindow(),
									fnConfirm = oTestWindow.confirm;

								function custConfirm(sMessage) {
									// Reset original confirm
									resetTestWindowConfirmDialog(oConfirmationContext);
									oConfirmationContext.confirmed = bConfirm;
									oConfirmationContext.message = sMessage;
									return bConfirm;
								}

								delete oConfirmationContext.confirmed;
								delete oConfirmationContext.message;
								oConfirmationContext.testWindow = oTestWindow;
								oConfirmationContext.testWindowConfirm = fnConfirm;
								oTestWindow.confirm = custConfirm;
							})
							.description(Utils.formatMessage("Next confirmation dialog will be {0}", bConfirm ? "accepted" : "refused"))
							.execute();
					}
				},
				assertions: {
					confirmDialogHasBeenDisplayed: function (bExpectedAnswer, oConfirmationContext) {
						return OpaBuilder.create(this)
							.check(function () {
								return oConfirmationContext && oConfirmationContext.confirmed === bExpectedAnswer;
							}, true)
							.description(
								Utils.formatMessage("Confirm dialog has been displayed and {0}", bExpectedAnswer ? "accepted" : "refused")
							)
							.execute();
					},

					confirmDialogHasNotBeenDisplayed: function (oConfirmationContext) {
						return OpaBuilder.create(this)
							.check(function () {
								return oConfirmationContext && !("confirmed" in oConfirmationContext);
							}, true)
							.success(function () {
								resetTestWindowConfirmDialog(oConfirmationContext);
							})
							.description("No confirm dialog has been displayed")
							.execute();
					}
				}
			};
		}
	};
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
/**
 * Actions and assertions to be used with a page hosted in an FCL
 */
sap.ui.predefine("sap/fe/test/FCLView", ["sap/ui/test/OpaBuilder"], function (OpaBuilder) {
	"use strict";
	return {
		actions: {
			iEnterFullScreenMode: function () {
				return OpaBuilder.create(this)
					.hasType("sap.m.OverflowToolbarButton")
					.hasProperties({ icon: "sap-icon://full-screen" })
					.description("Entering the FullScreen Button")
					.doPress()
					.execute();
			},
			iExitFullScreenMode: function () {
				return OpaBuilder.create(this)
					.hasType("sap.m.OverflowToolbarButton")
					.hasProperties({ icon: "sap-icon://exit-full-screen" })
					.description("Exiting Full screen mode")
					.doPress()
					.execute();
			},
			iCloseThisColumn: function () {
				return OpaBuilder.create(this)
					.hasType("sap.m.OverflowToolbarButton")
					.hasProperties({ icon: "sap-icon://decline" })
					.doPress()
					.description("Close FCL column for object page")
					.execute();
			}
		},
		assertions: {
			iCheckActionButton: function (bVisible, sIcon, sButtonName) {
				if (!sButtonName) {
					sButtonName = sIcon;
				}
				return OpaBuilder.create(this)
					.hasType("sap.uxap.ObjectPageDynamicHeaderTitle")
					.check(function (aHeaders) {
						var oHeader = aHeaders[0],
							aExists = oHeader.getNavigationActions().filter(function (oButton) {
								return oButton.getIcon && oButton.getIcon() === sIcon && oButton.getVisible();
							});

						return bVisible ? aExists.length !== 0 : aExists.length === 0;
					})
					.description((bVisible ? "Seeing" : "Not seeing") + " the " + sButtonName + " Button")
					.execute();
			},

			iCheckFullScreenButton: function (bVisible) {
				return this.iCheckActionButton(bVisible, "sap-icon://full-screen", "Fullscreen");
			},
			iCheckFullScreenExitButton: function (bVisible) {
				return this.iCheckActionButton(bVisible, "sap-icon://exit-full-screen", "Exit Fullscreen");
			},
			iCheckCloseColumnButton: function (bVisible) {
				return this.iCheckActionButton(bVisible, "sap-icon://decline", "Close Column");
			},
			iSeeEndColumnFullScreen: function () {
				return OpaBuilder.create(this)
					.hasType("sap.m.OverflowToolbarButton")
					.check(function (oButtons) {
						var bFound = oButtons.some(function (oButton) {
							return oButton.getProperty("icon") === "sap-icon://full-screen";
						});
						return bFound === false;
					}, true)
					.description("No FCL displayed")
					.execute();
			}
		}
	};
});
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/test/FeMocks", ["@sap-ux/jest-mock-ui5/dist/generic", "sap/fe/core/controllerextensions/InternalEditFlow", "sap/fe/core/PageController", "sap/ui/mdc/FilterBar"], function (generic, InternalEditFlow, PageController, FilterBar) {
  "use strict";

  var _exports = {};
  var mock = generic.mock;
  function mockListReportController() {
    // manually add ListReportController.controller functions since I am unable to import the prototype
    const listReport = {
      _getFilterBarControl: jest.fn(),
      _getControls: jest.fn(),
      _isFilterBarHidden: jest.fn(),
      _isMultiMode: jest.fn(),
      _getMultiModeControl: jest.fn(),
      _getFilterBarVariantControl: jest.fn(),
      _hasMultiVisualizations: jest.fn(),
      _shouldAutoTriggerSearch: jest.fn(),
      _getTable: jest.fn(),
      getExtensionAPI: jest.fn(),
      _editFlow: mock(InternalEditFlow),
      getChartControl: jest.fn()
    };
    return Object.assign(mock(PageController), listReport);
  }
  _exports.mockListReportController = mockListReportController;
  function mockObjectPageController() {
    // manually add ListReportController.controller functions since I am unable to import the prototype
    const objectPage = {
      getStickyEditMode: jest.fn(),
      getExtensionAPI: jest.fn(),
      _editFlow: mock(InternalEditFlow)
    };
    return Object.assign(mock(PageController), objectPage);
  }
  _exports.mockObjectPageController = mockObjectPageController;
  function mockContextForExtension(extension, controller, base) {
    const view = controller.getView();
    extension.getView = () => view;
    const mockedBase = mock(base || {});
    return Object.assign(mockedBase, extension);
  }
  _exports.mockContextForExtension = mockContextForExtension;
  function mockFilterBar() {
    const filterBar = mock(FilterBar);
    filterBar.mock.waitForInitialization = jest.fn();
    return filterBar;
  }
  _exports.mockFilterBar = mockFilterBar;
  return _exports;
}, false);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/Flexibility", ["sap/ui/test/Opa5", "sap/ui/test/OpaBuilder", "sap/ui/qunit/QUnitUtils"], function (Opa5, OpaBuilder, QUnitUtils) {
	"use strict";

	/**
	 * Creates a RegExp for HeaderFacetContainer Facet ID.
	 *
	 * @param {string} [sFacetId] The name of the Facet
	 * @returns {object} A RegExp matching the Facet ID.
	 * @private
	 */
	function getHeaderFacetContainerId(sFacetId) {
		return new RegExp("fe::HeaderFacetContainer::" + sFacetId + "$");
	}

	/**
	 * Creates a RegExp for Section Facet ID.
	 *
	 * @param {string} [sId] The name of the Section Facet
	 * @returns {object} A RegExp matching the Section Facet ID
	 * @private
	 */
	function getSectionId(sId) {
		return new RegExp("fe::FacetSection::" + sId + "-anchor$");
	}

	/**
	 * Creates a RegExp for FormElement ID for a field added via RTA.
	 *
	 * @param {string} [sId] The ID of the Field including the RTA specific part, i.e. GeneralInformation::Content_sap.fe.manageitems.TechnicalTestingService.LineItems_dataField
	 * @returns {object} A RegExp matching the FormElement ID.
	 * @private
	 */
	function getFormElementRTAId(sId) {
		return new RegExp("fe::Form::(.+)" + sId + "_FormElement" + "$");
	}

	/**
	 * Generates a matcher function to match the ID of the referenced control of an overlay.
	 *
	 * @param {string | RegExp} [vId] The name of the Facet
	 * @param {boolean} [bCheckParent] Set to true to check the parent element of the control
	 * @returns {object} A RegExp matching the Facet ID.
	 * @private
	 */
	function generateHasReferencedControlIdMatcher(vId, bCheckParent) {
		return function (oOverlay) {
			var oElement = bCheckParent ? oOverlay.getElement().getParent() : oOverlay.getElement(),
				sElementId = oElement && oElement.getId();

			return typeof vId === "string" ? sElementId === vId : vId.test(sElementId); // check ID of referenced control
		};
	}

	return {
		actions: {
			iExecuteById: function (vId, sDescription) {
				return OpaBuilder.create(this).viewId(null).hasId(vId).doPress().description(sDescription).execute();
			},

			iExecuteMeArea: function () {
				return this.iExecuteById("userActionsMenuHeaderButton", "Me Area");
			},

			iExecuteAdaptUI: function () {
				return this.iExecuteById(/RTA_Plugin_ActionButton$/, "Adapt UI");
			},

			iExecuteAdaptation: function () {
				return this.iExecuteById(/adaptationSwitcherButton$/, "Adaptation");
			},

			iExecuteNavigation: function () {
				return this.iExecuteById(/navigationSwitcherButton$/, "Navigation");
			},

			iWaitUntilTheBusyIndicatorIsGone: function () {
				// switch to Adapt UI can take some time, so we explicitly wait for non-busy
				return OpaBuilder.create(this)
					.viewId(null)
					.hasId("mainShell")
					.has(function (oRootView) {
						return oRootView.getBusy() === false;
					})
					.timeout(180) // could take some time
					.description("Busy indicator is gone")
					.execute();
			},

			iExecuteRightContextMenuById: function (vId, sDescription, bCheckParent) {
				var fnHasReferencedControlId = generateHasReferencedControlIdMatcher(vId, bCheckParent);

				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.ui.dt.ElementOverlay")
					.has(fnHasReferencedControlId)
					.do(function (oOverlay) {
						oOverlay.$().trigger("contextmenu"); // right click
					})
					.description(sDescription)
					.execute();
			},

			iExecuteLeftContextMenuById: function (vId, sDescription, bCheckParent) {
				var fnHasReferencedControlId = generateHasReferencedControlIdMatcher(vId, bCheckParent);

				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.ui.dt.ElementOverlay")
					.has(fnHasReferencedControlId)
					.doPress()
					.description(sDescription)
					.execute();
			},

			iExecuteRightContextMenuOnHeaderContainer: function () {
				return this.iExecuteRightContextMenuById(/fe::HeaderContentContainer$/, "Context menu for Header Container");
			},

			iExecuteRightContextMenuOnVariantManagement: function () {
				return this.iExecuteRightContextMenuById(/fe::PageVariantManagement$/, "Context menu for Variant Management");
			},

			iExecuteRightContextMenuOnTable: function () {
				return this.iExecuteRightContextMenuById(/fe::table::SalesOrderManage::LineItem$/, "Context menu for Table");
			},

			iExecuteRightContextMenuOnFilterBar: function () {
				return this.iExecuteRightContextMenuById(/fe::FilterBar::SalesOrderManage$/, "Context menu for FilterBar");
			},

			/*
			iExecuteLeftContextMenuOnHeaderContainer: function() {
				return this.iExecuteLeftContextMenuById(/fe::HeaderContentContainer$/, "Left Context menu for Header Container");
			},
			*/

			iExecuteRightContextMenuOnHeaderFacet: function (sFacetId) {
				return this.iExecuteRightContextMenuById(getHeaderFacetContainerId(sFacetId), "Context menu for " + sFacetId, true);
			},

			iExecuteRightContextMenuOnSection: function (sId) {
				return this.iExecuteRightContextMenuById(getSectionId(sId), "Context menu for " + sId, false);
			},

			iExecuteRightContextMenuOnFormContainer: function (sId) {
				return this.iExecuteRightContextMenuById(
					new RegExp("fe::FormContainer::" + sId + "$"),
					"Context menu for Form Container " + sId
				);
			},

			iExecuteRightContextMenuOnHeaderFacetFormContainer: function (sId) {
				return this.iExecuteRightContextMenuById(
					new RegExp("fe::HeaderFacet::FormContainer::" + sId + "$"),
					"Context menu for HeaderFacet Form Container " + sId
				);
			},

			iExecuteRightContextMenuOnHeaderFacetFormElement: function (sId) {
				return this.iExecuteRightContextMenuById(
					new RegExp("fe::HeaderFacet::FormContainer::" + sId + "::FormElement" + "$"),
					"Context menu for HeaderFacet Form Element " + sId
				);
			},

			iExecuteLeftContextMenuOnSection: function (sId) {
				return this.iExecuteLeftContextMenuById(getSectionId(sId), "Left context menu for " + sId, false);
			},

			iExecuteLeftContextMenuOnHeaderFacet: function (sFacetId) {
				return this.iExecuteLeftContextMenuById(getHeaderFacetContainerId(sFacetId), "Left Context menu for " + sFacetId, true);
			},

			iExecuteLeftContextMenuOnHeaderFacetFormContainer: function (sId) {
				return this.iExecuteLeftContextMenuById(
					new RegExp("fe::HeaderFacet::FormContainer::" + sId + "$"),
					"Left context menu for HeaderFacet Form Container " + sId
				);
			},

			iExecuteLeftContextMenuOnHeaderFacetFormElement: function (sId) {
				return this.iExecuteLeftContextMenuById(
					new RegExp("fe::HeaderFacet::FormContainer::" + sId + "::FormElement" + "$"),
					"Left context menu for HeaderFacet Form Element " + sId
				);
			},

			iExecuteRightContextMenuOnFieldAddedViaRTA: function (sId) {
				return this.iExecuteRightContextMenuById(getFormElementRTAId("_" + sId), "Context menu for Field " + sId);
			},

			iExecuteFocusOnAnchorBar: function () {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasId(/fe::ObjectPage-anchBar$/)
					.doPress()
					.description("Focus on AnchorBar")
					.execute();
			},

			iExecutePopOverActionByIcon: function (sIcon, sDescription) {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.ui.unified.MenuItem")
					.hasProperties({ icon: "sap-icon://" + sIcon }) // e.g. edit, add, rename, less (=remove), scissors (=cut), paste
					.isDialogElement()
					.doPress()
					.description(sDescription)
					.execute();
			},

			iExecutePopOverButtonByIcon: function (sIcon, sDescription) {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.Button")
					.hasProperties({ icon: "sap-icon://" + sIcon })
					.isDialogElement()
					.doPress()
					.description(sDescription)
					.execute();
			},

			iExecutePopOverActionRename: function (sId) {
				return this.iExecutePopOverActionByIcon("edit", "Press rename on " + sId);
			},

			iExecutePopOverActionAdd: function (sDescription) {
				return this.iExecutePopOverActionByIcon("add", sDescription);
			},

			iExecutePopOverActionRemove: function (sDescription) {
				return this.iExecutePopOverActionByIcon("less", sDescription);
			},

			iExecutePopOverActionCut: function (sDescription) {
				return this.iExecutePopOverActionByIcon("scissors", sDescription);
			},

			iExecutePopOverActionPaste: function (sDescription) {
				return this.iExecutePopOverActionByIcon("paste", sDescription);
			},

			iExecutePopOverActionDuplicate: function (sDescription) {
				return this.iExecutePopOverActionByIcon("duplicate", "Duplicate Variant '" + sDescription + "'");
			},

			iExecutePopOverActionSettings: function (sDescription) {
				return this.iExecutePopOverActionByIcon("key-user-settings", "Open " + sDescription + " Settings");
			},

			iExecutePopOverActionEmbedContent: function (sDescription) {
				return this.iExecutePopOverActionByIcon("tnt/content-enricher", "Open " + sDescription + " Settings");
			},

			iSwitchToGroupViewInTheFilterBarDialog: function () {
				return this.iExecutePopOverButtonByIcon("group-2", "Switch to grouped view in filter bar dialog");
			},

			iSelectExpandFiltersgroupInTheFilterBarDialog: function (sFiltersgroupName) {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.Panel")
					.hasChildren(OpaBuilder.create(this).hasType("sap.m.Title").hasProperties({ text: sFiltersgroupName }))
					.doOnChildren(OpaBuilder.create(this).hasType("sap.m.Button").doPress())
					.description("Expanding filter group wiht name '" + sFiltersgroupName + "'")
					.execute();
			},

			iSelectCheckBoxInTheFilterBarDialog: function (sText) {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.CustomListItem")
					.doOnChildren(
						OpaBuilder.create(this)
							.hasType("sap.m.CustomListItem")
							.hasChildren(OpaBuilder.create(this).hasType("sap.m.Label").hasProperties({ text: sText }))
							.doOnChildren(OpaBuilder.create(this).hasType("sap.m.CheckBox").doPress())
					)
					.description("Selected Checkbox next to '" + sText + "'")
					.execute();
			},

			iChangeVisibilityFilter: function (sSelection) {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.Bar")
					.isDialogElement()
					.doOnChildren(OpaBuilder.create(this).hasType("sap.m.Select").checkNumberOfMatches(1).doEnterText(sSelection))
					.description("Changed displayed fields to '" + sSelection + "'")
					.execute();
			},

			iEnterUrlInTheTextArea: function (sUrl) {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.TextArea")
					.hasId("sapUiRtaAddIFrameDialog_EditUrlTA")
					.isDialogElement()
					.doEnterText(sUrl)
					.description("Added URL '" + sUrl + "' to Text Area")
					.execute();
			},

			iSwitchToReorderOnDialog: function () {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.Button")
					.isDialogElement()
					.hasProperties({ text: "Reorder" })
					.doPress()
					.description("Switch to reorder view")
					.execute();
			},

			_iSelectALabelOnTheReorderDialog: function (sText) {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.Label")
					.isDialogElement()
					.hasProperties({ text: sText })
					.doPress()
					.execute();
			},

			/**
			 * Presses the according Button for the Reorder Process
			 *
			 * @param {string} [sLabel] label of column which should be reordered
			 * @param {number} [nNewPlace] which of the four reorder buttons should be pressed (0-3), effectively changes where the selected Label should move to
			 * @private
			 */

			iReorderTableColumn: function (sLabel, nNewPlace) {
				this._iSelectALabelOnTheReorderDialog(sLabel);
				var iconSpecific,
					Icon = "sap-icon://";

				if (nNewPlace === 0) {
					iconSpecific = "collapse-group";
				} else if (nNewPlace === 1) {
					iconSpecific = "slim-arrow-up";
				} else if (!nNewPlace === 2) {
					iconSpecific = "slim-arrow-down";
				} else if (!nNewPlace === 3) {
					iconSpecific = "expand-group";
				}
				Icon += iconSpecific;
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.Button")
					.isDialogElement()
					.hasProperties({ icon: Icon })
					.doPress()
					.description("Reorder '" + sLabel + "'")
					.execute();
			},

			iEnterTextInSearchfield: function (sNewText) {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.SearchField")
					.isDialogElement()
					.checkNumberOfMatches(1)
					.doEnterText(sNewText)
					.description("Enter text: '" + sNewText + "'")
					.execute();
			},

			iEnterTextinFilterField: function (sText) {
				return OpaBuilder.create(this)
					.hasType("sap.ui.mdc.field.FieldMultiInput")
					.checkNumberOfMatches(1)
					.doEnterText(sText)
					.description("Enter text: '" + sText + "'")
					.execute();
			},

			iSelectAFieldInTheDialog: function (vTooltip) {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.CustomListItem")
					.isDialogElement()
					.has(function (oListItem) {
						var sToolTip = oListItem.getTooltip(); // currently we check the tooltip
						return typeof vTooltip === "string" ? sToolTip === vTooltip : vTooltip.test(sToolTip);
					})
					.doPress()
					.description("Select " + vTooltip)
					.execute();
			},

			iExecutePopOverOk: function () {
				return OpaBuilder.create(this)
					.viewId(null)
					.hasType("sap.m.Button")
					.hasProperties({ text: "OK" }) // .has(OpaBuilder.Matchers.resourceBundle("title", "sap.ui.rta", "BTN_FREP_OK")) does not work?
					.isDialogElement()
					.doPress()
					.description("OK Button")
					.execute();
			},

			iExecuteSave: function () {
				return this.iExecuteById(/sapUiRta_save$/, "Save");
			},

			iExecuteExit: function () {
				return this.iExecuteById(/sapUiRta_exit$/, "Exit");
			},

			iExecuteUndo: function () {
				return this.iExecuteById(/sapUiRta_undo$/, "Undo");
			},

			iEnterTextForRTAEditableField: function (sNewText) {
				return OpaBuilder.create(this)
					.hasType("sap.ui.dt.ElementOverlay")
					.has(function (oOverlay) {
						if (oOverlay.$().hasClass("sapUiDtOverlaySelected")) {
							var $Overlay = oOverlay.$().find(".sapUiRtaEditableField");
							return $Overlay.children()[0];
						}
						return null;
					})
					.do(function (oEditableFieldDomNode) {
						oEditableFieldDomNode.innerHTML = sNewText;
						QUnitUtils.triggerEvent("keypress", oEditableFieldDomNode, { which: 13, keyCode: 13 });
						oEditableFieldDomNode.blur();
					})
					.description("Enter text: " + sNewText)
					.execute();
			},

			iEnterTextForTitle: function (sNewText) {
				return this.iEnterTextForRTAEditableField(sNewText);
			},

			iEnterTextForViewField: function (sNewText) {
				return OpaBuilder.create(this)
					.hasType("sap.m.Input")
					.isDialogElement()
					.doEnterText(sNewText, true)
					.description("Entering text: " + sNewText + " as variant name")
					.execute();
			}
		},

		assertions: {
			iSeeTheFLPToolbar: function () {
				return OpaBuilder.create(this)
					.hasType("sap.ushell.ui.ShellHeader")
					.hasId("shell-header")
					.description("Seeing the FLP toolbar")
					.execute();
			},

			iSeeTheRTAToolbar: function () {
				return OpaBuilder.create(this).hasType("sap.ui.rta.toolbar.Fiori").description("Seeing the RTA toolbar").execute();
			},

			iSeeTheHeaderFacet: function (sFacetId) {
				return OpaBuilder.create(this)
					.hasType("sap.fe.templates.ObjectPage.controls.StashableHBox")
					.hasId(getHeaderFacetContainerId(sFacetId))
					.description("Seeing the Header Facet " + sFacetId)
					.execute();
			},

			iSeeTheFieldAddedViaRTA: function (sId) {
				return OpaBuilder.create(this)
					.hasType("sap.ui.layout.form.FormElement")
					.hasId(getFormElementRTAId("_" + sId))
					.description("Seeing the Field " + sId)
					.execute();
			},

			iSeeTheEditableHeaderFieldAddedViaRTA: function (sId) {
				return OpaBuilder.create(this)
					.hasType("sap.ui.layout.form.FormElement")
					.hasId(new RegExp("fe::EditableHeaderForm_(.+)_" + sId + "_FormElement" + "$"))
					.description("Seeing the Editable Header Field " + sId)
					.execute();
			},

			iSeeTheEditableHeaderField: function (sId) {
				return OpaBuilder.create(this)
					.hasType("sap.ui.layout.form.FormElement")
					.hasId(new RegExp("fe::HeaderFacet::FormContainer::" + sId + "::FormElement" + "$"))
					.description("Seeing the Editable Header Field " + sId)
					.execute();
			},

			iDoNotSeeTheHeaderFacet: function (sFacetId) {
				var vId = getHeaderFacetContainerId(sFacetId);

				return OpaBuilder.create(this)
					.hasType("sap.fe.templates.ObjectPage.controls.StashableHBox")
					.check(function (facets) {
						var bFound = facets.some(function (oFacet) {
							return typeof vId === "string" ? oFacet.getId() === vId : vId.test(oFacet.getId());
						});
						return bFound === false;
					}, true)
					.description("Not seeing the Header Facet " + sFacetId)
					.execute();
			},

			iDoNotSeeTheField: function (sId) {
				return OpaBuilder.create(this)
					.hasType("sap.ui.layout.form.FormElement")
					.check(function (elements) {
						var bFound = elements.some(function (element) {
							return element.getId().indexOf(sId) > -1;
						});
						return bFound === false;
					}, true)
					.description("Not seeing the Field " + sId)
					.execute();
			},

			iSeeTheElementOverlayById: function (vId, sDescription, bCheckParent) {
				var fnHasReferencedControlId = generateHasReferencedControlIdMatcher(vId, bCheckParent);

				return OpaBuilder.create(this)
					.hasType("sap.ui.dt.ElementOverlay")
					.has(fnHasReferencedControlId)
					.description(sDescription)
					.execute();
			},

			iDoNotSeeTheElementOverlayById: function (vId, sDescription, bCheckParent) {
				var fnHasReferencedControlId = generateHasReferencedControlIdMatcher(vId, bCheckParent);

				return OpaBuilder.create(this)
					.hasType("sap.ui.dt.ElementOverlay")
					.check(function (oOverlay) {
						var bFound = oOverlay.some(fnHasReferencedControlId);
						return bFound === false;
					}, true)
					.description(sDescription)
					.execute();
			},

			iSeeTheElementOverlayForTheApp: function () {
				return this.iSeeTheElementOverlayById(/component---appRootView--appContent$/, "Seeing the ElementOverlay for the App");
			},

			iSeeThePopover: function () {
				return OpaBuilder.create(this).hasType("sap.ui.unified.Menu").description("Seeing the Popover").execute();
			},

			iSeeTheButtonByIcon: function (sIcon, sDescription) {
				return OpaBuilder.create(this)
					.hasType("sap.m.Button")
					.isDialogElement()
					.hasProperties({ icon: sIcon })
					.description("Seeing " + sDescription)
					.execute();
			},

			iSeeTheMenuItemByIcon: function (sIcon, sDescription) {
				return OpaBuilder.create(this)
					.hasType("sap.ui.unified.MenuItem")
					.isDialogElement()
					.hasProperties({ icon: sIcon })
					.description("Seeing " + sDescription)
					.execute();
			},

			iDoNotSeeTheButtonByIcon: function (sIcon, sDescription) {
				return OpaBuilder.create(this)
					.hasType("sap.m.Button")
					.isDialogElement()
					.check(function (aButtons) {
						var bFound = aButtons.some(function (oButton) {
							return oButton.getProperty("icon") === sIcon;
						});
						return bFound === false;
					}, true)
					.description("Not seeing " + sDescription)
					.execute();
			},

			iDoNotSeeTheMenuItemByIcon: function (sIcon, sDescription) {
				return OpaBuilder.create(this)
					.hasType("sap.ui.unified.MenuItem")
					.isDialogElement()
					.check(function (aButtons) {
						var bFound = aButtons.some(function (oButton) {
							return oButton.getProperty("icon") === sIcon;
						});
						return bFound === false;
					}, true)
					.description("Not seeing " + sDescription)
					.execute();
			},

			iSeeTheVariantManagementPopover: function () {
				return this.iSeeTheMenuItemByIcon("sap-icon://duplicate", "The Popover");
			},

			iSeeTheRTAPopover: function () {
				return this.iSeeTheMenuItemByIcon("sap-icon://key-user-settings", "The RTAPopover");
			},

			iSeeTheRenameButton: function () {
				return this.iSeeTheMenuItemByIcon("sap-icon://edit", "the button 'rename'");
			},

			iSeeTheAddButton: function () {
				return this.iSeeTheMenuItemByIcon("sap-icon://add", "the button 'add'");
			},

			iSeeTheCreateGroupButton: function () {
				return this.iSeeTheMenuItemByIcon("sap-icon://add-folder", "the button 'create group'");
			},

			iDoNotSeeTheRenameButton: function () {
				return this.iDoNotSeeTheMenuItemByIcon("sap-icon://edit", "the button 'rename'");
			},

			iDoNotSeeTheAddButton: function () {
				return this.iDoNotSeeTheMenuItemByIcon("sap-icon://add", "the button 'add'");
			},

			iDoNotSeeTheRemoveButton: function () {
				return this.iDoNotSeeTheMenuItemByIcon("sap-icon://less", "the button 'remove'");
			},

			iSeeThePopoverDialog: function () {
				return OpaBuilder.create(this).hasType("sap.m.Dialog").description("Seeing the Popover Dialog").execute();
			},

			iSeeThePopoverDialogWithId: function (sId) {
				return OpaBuilder.create(this)
					.hasType("sap.m.Dialog")
					.hasId(sId)
					.description("Seeing the Popover Dialog with Id:", sId)
					.execute();
			},

			iSeeTheHeaderFacetOverlay: function (sFacetId) {
				return this.iSeeTheElementOverlayById(getHeaderFacetContainerId(sFacetId), "Seeing the Header Facet: " + sFacetId, true);
			},

			iDoNotSeeTheHeaderFacetOverlay: function (sFacetId) {
				return this.iDoNotSeeTheElementOverlayById(
					getHeaderFacetContainerId(sFacetId),
					"Not seeing the Header Facet Overlay: " + sFacetId,
					true
				);
			},

			iSeeTheTitleOnTheUI: function (sText) {
				// Rename HeaderFacet seems to be locally more stable without .checkNumberOfMatches(1)
				return OpaBuilder.create(this)
					.hasType("sap.m.Title")
					.hasProperties({ text: sText })
					.description("Seeing the Title " + sText)
					.execute();
			},

			iSeeTheLinkOnTheUI: function (sText) {
				return OpaBuilder.create(this)
					.hasType("sap.m.Link")
					.hasProperties({ text: sText })
					.checkNumberOfMatches(1)
					.description("Seeing the Link " + sText)
					.execute();
			},

			iCheckTheHeaderFacetTitle: function (sFacetId, sText) {
				return OpaBuilder.create(this)
					.hasType("sap.fe.templates.ObjectPage.controls.StashableHBox")
					.hasId(getHeaderFacetContainerId(sFacetId))
					.hasProperties({ title: sText })
					.description("The Header Facet  " + sFacetId + " has title " + sText)
					.execute();
			},

			iSeeTheSectionTextById: function (sId, sText) {
				var vId = getSectionId(sId);

				return OpaBuilder.create(this)
					.hasId(vId)
					.hasProperties({ text: sText })
					.description("Seeing the section " + sId + " with text " + sText)
					.execute();
			},

			iSeeTheSectionAtPosition: function (sId, iPosition) {
				var vId = getSectionId(sId);

				return OpaBuilder.create(this)
					.hasType("sap.m.Button") // (not for HeaderInfo which is of type sap.m.MenuButton)
					.hasId(vId)
					.has(function (oElement) {
						var aContent = oElement.getParent().getContent(), // anchBar content
							iFound = aContent.findIndex(function (oSection) {
								return vId.test(oSection.getId());
							});

						return iFound === iPosition;
					})
					.description("Seeing the section " + sId + " at position " + iPosition)
					.execute();
			},

			iSeeTheAddedIFrameInHeader: function (sUrlWithContentForIFrame) {
				return OpaBuilder.create(this)
					.hasType("sap.ui.dt.AggregationOverlay")
					.hasProperties({ aggregationName: "headerContent" })
					.doOnChildren(OpaBuilder.create(this).hasType("sap.ui.fl.util.IFrame"))
					.description("Seeing the application with URL: " + sUrlWithContentForIFrame + " in iFrame in header content container")
					.execute();
			},

			iSeeTheIFrameInSectionWithTitle: function (sSectionTitle) {
				return OpaBuilder.create(this)
					.hasType("sap.uxap.ObjectPageSection")
					.hasProperties({ title: sSectionTitle })

					.doOnChildren(OpaBuilder.create(this).hasType("sap.ui.fl.util.IFrame"))
					.description("Seeing iFrame in section with title '" + sSectionTitle + "'")
					.execute();
			}
		}
	};
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/FlexibleColumnLayout", ["sap/base/util/merge", "./TemplatePage", "sap/ui/test/OpaBuilder", "sap/m/library"],
	function (mergeObjects, TemplatePage, OpaBuilder, mLibrary) {
		"use strict";
		return {
			create: function (sFlpAppName) {
				return {
					actions: {
						iClickFirstColumnExpandButton: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent-midForward")
								.description("Clicking the First Column Expand Button")
								.doPress()
								.execute();
						},
						iClickLastColumnExpandButton: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent-midBack")
								.description("Clicking the Last Column Expand Button")
								.doPress()
								.execute();
						},
						iClickLastColumnCollapseButton: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent-endForward")
								.doPress()
								.description("Seeing the Last Column Expand Button")
								.execute();
						},
						iClickFirstColumnCollapseButton: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent-beginBack")
								.doPress()
								.description("Seeing the Last Column Expand Button")
								.execute();
						}
					},
					assertions: {
						iSeeFirstColumnExpandButton: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent-midForward")
								.description("Seeing the First Column Expand Button")
								.execute();
						},
						iDoNotSeeFirstColumnExpandButton: function () {
							return OpaBuilder.create(this)
								.hasType("sap.m.Button")
								.check(function (oButtons) {
									var bFound = oButtons.some(function (oButton) {
										return (
											oButton.getId() ===
											"application-" + sFlpAppName + "-component---appRootView--appContent-midForward"
										);
									});
									return bFound === false;
								}, true)
								.description("Do not see the First Column Expand Button")
								.execute();
						},
						iSeeFirstColumnCollapseButton: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent-beginBack")
								.description("Seeing the Last Column Expand Button")
								.execute();
						},
						iClickLastColumnCollapseButton: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent-endForward")
								.description("Seeing the Last Column Expand Button")
								.execute();
						},
						iSeeLastColumnExpandButton: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent-midBack")
								.description("Seeing the Last Column Expand Button")
								.execute();
						},
						iDoNotSeeLastColumnExpandButton: function () {
							return OpaBuilder.create(this)
								.hasType("sap.m.Button")
								.check(function (oButtons) {
									var bFound = oButtons.some(function (oButton) {
										return (
											oButton.getId() ===
											"application-" + sFlpAppName + "-component---appRootView--appContent-midBack"
										);
									});
									return bFound === false;
								}, true)
								.description("Do not see the Last Column Expand Button")
								.execute();
						},
						iSeeNumberOfColumns: function (nCols) {
							// Map to have the number of visible columns from the layout
							// Hidden columns don't count, fullscreen is 1 column
							var mLayoutToColumn = {
								OneColumn: 1,
								TwoColumnsMidExpanded: 2,
								TwoColumnsBeginExpanded: 2,
								MidColumnFullScreen: 1,
								ThreeColumnsMidExpanded: 3,
								ThreeColumnsEndExpanded: 3,
								ThreeColumnsMidExpandedEndHidden: 2,
								ThreeColumnsBeginExpandedEndHidden: 2,
								EndColumnFullScreen: 1
							};

							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent")
								.check(function (oFCL) {
									return mLayoutToColumn[oFCL.getLayout()] === nCols;
								}, true)
								.description("FCL displays " + nCols + " columns")
								.execute();
						},
						iSeeFullscreen: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent")
								.check(function (oFCL) {
									return oFCL.getLayout() === "MidColumnFullScreen" || oFCL.getLayout() === "EndColumnFullScreen";
								}, true)
								.description("FCL is in fullscreen")
								.execute();
						},
						iSeeFCLLayout: function (sLayout) {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent")
								.hasProperties({ layout: sLayout })
								.description("Checking FCL layout: " + sLayout)
								.execute();
						},
						iGetDefaultLayoutOnFirstLevel: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent")
								.hasProperties({ layout: "TwoColumnsMidExpanded" })
								.description("Seeing default layout for FCL on first level: TwoColumnsMidExpanded ")
								.execute();
						},
						iGetDefaultLayoutOnSecondLevel: function () {
							return OpaBuilder.create(this)
								.hasId("application-" + sFlpAppName + "-component---appRootView--appContent")
								.hasProperties({ layout: "ThreeColumnsMidExpanded" })
								.description("Seeing default layout for FCL on second level: ThreeColumnsMidExpanded ")
								.execute();
						}
					}
				};
			}
		};
	}
);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/test/JestFlexibilityHelper", [], function () {
  "use strict";

  var _exports = {};
  function createFlexibilityChangesObject(viewId, flexChanges) {
    const FILENAME = "id_1656068872000_483";
    const viewIdPrefix = viewId + "--";
    const variantDependentControlChanges = getVariantDependentControlChanges(flexChanges, FILENAME, viewIdPrefix) ?? [];
    const changes = getChanges(flexChanges) ?? [];
    return {
      appDescriptorChanges: [],
      changes: changes,
      ui2personalization: {},
      comp: {
        variants: [],
        changes: [],
        defaultVariants: [],
        standardVariants: []
      },
      variants: [{
        fileName: FILENAME,
        fileType: "ctrl_variant",
        variantManagementReference: `${viewIdPrefix}fe::PageVariantManagement`,
        variantReference: `${viewIdPrefix}fe::PageVariantManagement`,
        reference: "catalog-admin-ui.Component",
        packageName: "$TMP",
        content: {
          title: "Default with additional fields and cols"
        },
        self: `apps/catalog-admin-ui/variants/${FILENAME}.ctrl_variant`,
        layer: "USER",
        texts: {},
        namespace: "apps/catalog-admin-ui/variants/",
        creation: "2022-06-24T11:07:52.139Z",
        originalLanguage: "EN",
        conditions: {},
        contexts: {},
        support: {
          generator: "Change.createInitialFileContent",
          service: "",
          user: "",
          sapui5Version: "1.80.0"
        }
      }],
      variantChanges: [{
        fileName: "id_1656068872134_509_setExecuteOnSelect",
        fileType: "ctrl_variant_change",
        changeType: "setExecuteOnSelect",
        moduleName: "",
        reference: "catalog-admin-ui.Component",
        packageName: "$TMP",
        content: {
          executeOnSelect: true
        },
        selector: {
          id: FILENAME,
          idIsLocal: false
        },
        layer: "USER",
        texts: {},
        namespace: "apps/catalog-admin-ui/changes/",
        projectId: "catalog-admin-ui",
        creation: "2022-06-24T11:07:52.146Z",
        originalLanguage: "EN",
        support: {
          generator: "Change.createInitialFileContent",
          service: "",
          user: "",
          sapui5Version: "1.80.0",
          sourceChangeFileName: "",
          compositeCommand: "",
          command: ""
        },
        oDataInformation: {},
        dependentSelector: {},
        jsOnly: false,
        variantReference: "",
        appDescriptorChange: false
      }],
      variantDependentControlChanges: variantDependentControlChanges,
      variantManagementChanges: [{
        fileName: "id_1656068872132_508_setDefault",
        fileType: "ctrl_variant_management_change",
        changeType: "setDefault",
        moduleName: "",
        reference: "catalog-admin-ui.Component",
        packageName: "$TMP",
        content: {
          defaultVariant: FILENAME
        },
        selector: {
          id: `${viewIdPrefix}fe::PageVariantManagement`,
          idIsLocal: false
        },
        layer: "USER",
        texts: {},
        namespace: "apps/catalog-admin-ui/changes/",
        projectId: "catalog-admin-ui",
        creation: "2022-06-24T11:07:52.145Z",
        originalLanguage: "EN",
        support: {
          generator: "Change.createInitialFileContent",
          service: "",
          user: "",
          sapui5Version: "1.80.0",
          sourceChangeFileName: "",
          compositeCommand: "",
          command: ""
        },
        oDataInformation: {},
        dependentSelector: {},
        jsOnly: false,
        variantReference: "",
        appDescriptorChange: false
      }],
      cacheKey: "1432039092"
    };
  }
  _exports.createFlexibilityChangesObject = createFlexibilityChangesObject;
  function getVariantDependentControlChanges(flexChanges, filename, viewIdPrefix) {
    var _flexChanges$variantD;
    return (_flexChanges$variantD = flexChanges.variantDependentControlChanges) === null || _flexChanges$variantD === void 0 ? void 0 : _flexChanges$variantD.map(variant => {
      variant.variantReference = filename;
      variant.selector.id = viewIdPrefix + variant.selector.id;
      return variant;
    });
  }
  function getChanges(flexChanges) {
    var _flexChanges$changes;
    return (_flexChanges$changes = flexChanges.changes) === null || _flexChanges$changes === void 0 ? void 0 : _flexChanges$changes.map(variant => {
      return variant;
    });
  }
  return _exports;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/test/JestTemplatingHelper", ["@sap/cds-compiler", "fs", "@prettier/plugin-xml", "path", "prettier", "sap/base/Log", "sap/base/util/LoaderExtensions", "sap/base/util/merge", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/ConverterContext", "sap/fe/core/services/SideEffectsServiceFactory", "sap/fe/core/TemplateModel", "sap/ui/base/BindingParser", "sap/ui/base/ManagedObjectMetadata", "sap/ui/core/Component", "sap/ui/core/InvisibleText", "sap/ui/core/util/serializer/Serializer", "sap/ui/core/util/XMLPreprocessor", "sap/ui/fl/apply/_internal/flexState/FlexState", "sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor", "sap/ui/fl/initial/_internal/Storage", "sap/ui/fl/Utils", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/lib/_MetadataRequestor", "sap/ui/model/odata/v4/ODataMetaModel", "xpath", "./JestFlexibilityHelper"], function (compiler, fs, plugin, path, prettier, Log, LoaderExtensions, merge, BuildingBlockRuntime, ConverterContext, SideEffectsFactory, TemplateModel, BindingParser, ManagedObjectMetadata, Component, InvisibleText, Serializer, XMLPreprocessor, FlexState, XmlPreprocessor, AppStorage, Utils, JSONModel, _MetadataRequestor, ODataMetaModel, xpath, JestFlexibilityHelper) {
  "use strict";

  var _exports = {};
  var createFlexibilityChangesObject = JestFlexibilityHelper.createFlexibilityChangesObject;
  var registerBuildingBlock = BuildingBlockRuntime.registerBuildingBlock;
  var format = prettier.format;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const formatXml = require("xml-formatter");
  Log.setLevel(1, "sap.ui.core.util.XMLPreprocessor");
  jest.setTimeout(40000);
  const nameSpaceMap = {
    macros: "sap.fe.macros",
    macro: "sap.fe.macros",
    macroField: "sap.fe.macros.field",
    macrodata: "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
    log: "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
    unittest: "http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1",
    control: "sap.fe.core.controls",
    core: "sap.ui.core",
    dt: "sap.ui.dt",
    m: "sap.m",
    f: "sap.ui.layout.form",
    fl: "sap.ui.fl",
    internalMacro: "sap.fe.macros.internal",
    mdc: "sap.ui.mdc",
    mdcat: "sap.ui.mdc.actiontoolbar",
    mdcField: "sap.ui.mdc.field",
    mdcTable: "sap.ui.mdc.table",
    u: "sap.ui.unified",
    macroMicroChart: "sap.fe.macros.microchart",
    microChart: "sap.suite.ui.microchart",
    macroTable: "sap.fe.macros.table"
  };
  const select = xpath.useNamespaces(nameSpaceMap);
  function _getTemplatedSelector(xmldom, selector) {
    /**
     * if a root element has been added during the templating by our Jest Templating methods
     * the root element is added to the selector path.
     */
    const rootPath = "/root";
    return `${xmldom.nodeName === "root" && !selector.startsWith(rootPath) ? rootPath : ""}${selector}`;
  }
  async function _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels) {
    const oMetaModel = await getMetaModel(sMetadataUrl);

    // To ensure our macro can use #setBindingContext we ensure there is a pre existing JSONModel for converterContext
    // if not already passed to teh templating
    if (!mModels.hasOwnProperty("converterContext")) {
      mModels = Object.assign(mModels, {
        converterContext: new TemplateModel({}, oMetaModel)
      });
    }
    Object.keys(mModels).forEach(function (sModelName) {
      if (mModels[sModelName] && mModels[sModelName].isTemplateModel) {
        mModels[sModelName] = new TemplateModel(mModels[sModelName].data, oMetaModel);
      }
    });
    const settings = {
      models: Object.assign({
        metaModel: oMetaModel
      }, mModels),
      bindingContexts: {}
    };

    //Inject models and bindingContexts
    Object.keys(mBindingContexts).forEach(function (sKey) {
      /* Assert to make sure the annotations are in the test metadata -> avoid misleading tests */
      expect(typeof oMetaModel.getObject(mBindingContexts[sKey])).toBeDefined();
      const oModel = mModels[sKey] || oMetaModel;
      settings.bindingContexts[sKey] = oModel.createBindingContext(mBindingContexts[sKey]); //Value is sPath
      settings.models[sKey] = oModel;
    });
    return settings;
  }
  function _removeCommentFromXml(xml) {
    return formatXml(xml, {
      filter: node => node.type !== "Comment"
    });
  }
  function _loadResourceView(viewName) {
    const name = viewName.replace(/\./g, "/") + ".view.xml";
    const view = LoaderExtensions.loadResource(name);
    return view.documentElement;
  }
  const registerMacro = function (macroMetadata) {
    registerBuildingBlock(macroMetadata);
  };
  _exports.registerMacro = registerMacro;
  const unregisterMacro = function (macroMetadata) {
    XMLPreprocessor.plugIn(null, macroMetadata.namespace, macroMetadata.name);
    if (macroMetadata.publicNamespace) {
      XMLPreprocessor.plugIn(null, macroMetadata.publicNamespace, macroMetadata.name);
    }
  };
  _exports.unregisterMacro = unregisterMacro;
  const runXPathQuery = function (selector, xmldom) {
    return select(selector, xmldom);
  };
  expect.extend({
    toHaveControl(xmldom, selector) {
      const nodes = runXPathQuery(_getTemplatedSelector(xmldom, selector), xmldom);
      return {
        message: () => {
          const outputXml = serializeXML(xmldom);
          return `did not find controls matching ${selector} in generated xml:\n ${outputXml}`;
        },
        pass: nodes && nodes.length >= 1
      };
    },
    toNotHaveControl(xmldom, selector) {
      const nodes = runXPathQuery(_getTemplatedSelector(xmldom, selector), xmldom);
      return {
        message: () => {
          const outputXml = serializeXML(xmldom);
          return `There is a control matching ${selector} in generated xml:\n ${outputXml}`;
        },
        pass: nodes && nodes.length === 0
      };
    }
  });
  _exports.runXPathQuery = runXPathQuery;
  const formatBuildingBlockXML = function (xmlString) {
    if (Array.isArray(xmlString)) {
      xmlString = xmlString.join("");
    }
    let xmlFormatted = formatXML(xmlString);
    xmlFormatted = xmlFormatted.replace(/uid--id-[0-9]{13}-[0-9]{1,2}/g, "uid--id");
    return xmlFormatted;
  };
  _exports.formatBuildingBlockXML = formatBuildingBlockXML;
  const getControlAttribute = function (controlSelector, attributeName, xmlDom) {
    const selector = `string(${_getTemplatedSelector(xmlDom, controlSelector)}/@${attributeName})`;
    return runXPathQuery(selector, xmlDom);
  };
  _exports.getControlAttribute = getControlAttribute;
  const serializeXML = function (xmlDom) {
    const serializer = new window.XMLSerializer();
    const xmlString = serializer.serializeToString(xmlDom);
    return formatXML(xmlString);
  };
  _exports.serializeXML = serializeXML;
  const formatXML = function (xmlString) {
    return format(xmlString, {
      parser: "xml",
      xmlWhitespaceSensitivity: "ignore",
      plugins: [plugin]
    });
  };

  /**
   * Compile a CDS file into an EDMX file.
   *
   * @param cdsUrl The path to the file containing the CDS definition. This file must declare the namespace
   * sap.fe.test and a service JestService
   * @param options Options for creating the EDMX output
   * @param edmxFileName Allows you to override the name of the compiled EDMX metadata file
   * @returns The path of the generated EDMX
   */
  _exports.formatXML = formatXML;
  const compileCDS = function (cdsUrl) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let edmxFileName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : path.basename(cdsUrl).replace(".cds", ".xml");
    const cdsString = fs.readFileSync(cdsUrl, "utf-8");
    const edmxContent = cds2edmx(cdsString, "sap.fe.test.JestService", options);
    const dir = path.resolve(cdsUrl, "..", "gen");
    const edmxFilePath = path.resolve(dir, edmxFileName);
    fs.mkdirSync(dir, {
      recursive: true
    });
    fs.writeFileSync(edmxFilePath, edmxContent);
    return edmxFilePath;
  };

  /**
   * Compile CDS to EDMX.
   *
   * @param cds The CDS model. It must define at least one service.
   * @param service The fully-qualified name of the service to be compiled. Defaults to "sap.fe.test.JestService".
   * @param options Options for creating the EDMX output
   * @returns The compiled service model as EDMX.
   */
  _exports.compileCDS = compileCDS;
  function cds2edmx(cds) {
    let service = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "sap.fe.test.JestService";
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const sources = {
      "source.cds": cds
    };

    // allow to include stuff from @sap/cds/common
    if (cds.includes("'@sap/cds/common'")) {
      sources["common.cds"] = fs.readFileSync(require.resolve("@sap/cds/common.cds"), "utf-8");
    }
    const csn = compiler.compileSources(sources, {});
    const edmxOptions = {
      odataForeignKeys: true,
      odataFormat: "structured",
      odataContainment: false,
      ...options,
      service: service
    };
    const edmx = compiler.to.edmx(csn, edmxOptions);
    if (!edmx) {
      throw new Error(`Compilation failed. Hint: Make sure that the CDS model defines service ${service}.`);
    }
    return edmx;
  }
  _exports.cds2edmx = cds2edmx;
  const getFakeSideEffectsService = async function (oMetaModel) {
    const oServiceContext = {
      scopeObject: {},
      scopeType: "",
      settings: {}
    };
    return new SideEffectsFactory().createInstance(oServiceContext).then(function (oServiceInstance) {
      const oJestSideEffectsService = oServiceInstance.getInterface();
      oJestSideEffectsService.getContext = function () {
        return {
          scopeObject: {
            getModel: function () {
              return {
                getMetaModel: function () {
                  return oMetaModel;
                }
              };
            }
          }
        };
      };
      return oJestSideEffectsService;
    });
  };
  _exports.getFakeSideEffectsService = getFakeSideEffectsService;
  const getFakeDiagnostics = function () {
    const issues = [];
    return {
      addIssue(issueCategory, issueSeverity, details) {
        issues.push({
          issueCategory,
          issueSeverity,
          details
        });
      },
      getIssues() {
        return issues;
      },
      checkIfIssueExists(issueCategory, issueSeverity, details) {
        return issues.find(issue => {
          return issue.issueCategory === issueCategory && issue.issueSeverity === issueSeverity && issue.details === details;
        });
      }
    };
  };
  _exports.getFakeDiagnostics = getFakeDiagnostics;
  const getConverterContextForTest = function (convertedTypes, manifestSettings) {
    const entitySet = convertedTypes.entitySets.find(es => es.name === manifestSettings.entitySet);
    const dataModelPath = getDataModelObjectPathForProperty(entitySet, convertedTypes, entitySet);
    return new ConverterContext(convertedTypes, manifestSettings, getFakeDiagnostics(), merge, dataModelPath);
  };
  _exports.getConverterContextForTest = getConverterContextForTest;
  const metaModelCache = {};
  const getMetaModel = async function (sMetadataUrl) {
    const oRequestor = _MetadataRequestor.create({}, "4.0", undefined, {});
    if (!metaModelCache[sMetadataUrl]) {
      const oMetaModel = new ODataMetaModel(oRequestor, sMetadataUrl, undefined, null);
      await oMetaModel.fetchEntityContainer();
      metaModelCache[sMetadataUrl] = oMetaModel;
    }
    return metaModelCache[sMetadataUrl];
  };
  _exports.getMetaModel = getMetaModel;
  const getDataModelObjectPathForProperty = function (entitySet, convertedTypes, property) {
    const targetPath = {
      startingEntitySet: entitySet,
      navigationProperties: [],
      targetObject: property,
      targetEntitySet: entitySet,
      targetEntityType: entitySet.entityType,
      convertedTypes: convertedTypes
    };
    targetPath.contextLocation = targetPath;
    return targetPath;
  };
  _exports.getDataModelObjectPathForProperty = getDataModelObjectPathForProperty;
  const evaluateBinding = function (bindingString) {
    const bindingElement = BindingParser.complexParser(bindingString);
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return bindingElement.formatter.apply(undefined, args);
  };
  _exports.evaluateBinding = evaluateBinding;
  /**
   * Evaluate a binding against a model.
   *
   * @param bindingString The binding string.
   * @param modelContent Content of the default model to use for evaluation.
   * @param namedModelsContent Contents of additional, named models to use.
   * @returns The evaluated binding.
   */
  function evaluateBindingWithModel(bindingString, modelContent, namedModelsContent) {
    const bindingElement = BindingParser.complexParser(bindingString);
    const text = new InvisibleText();
    text.bindProperty("text", bindingElement);
    const defaultModel = new JSONModel(modelContent);
    text.setModel(defaultModel);
    text.setBindingContext(defaultModel.createBindingContext("/"));
    if (namedModelsContent) {
      for (const [name, content] of Object.entries(namedModelsContent)) {
        const model = new JSONModel(content);
        text.setModel(model, name);
        text.setBindingContext(model.createBindingContext("/"), name);
      }
    }
    return text.getText();
  }
  _exports.evaluateBindingWithModel = evaluateBindingWithModel;
  const TESTVIEWID = "testViewId";
  const applyFlexChanges = async function (flexChanges, oMetaModel, resultXML) {
    var _flexChanges$changes, _flexChanges$variantD;
    // prefix Ids
    [...resultXML.querySelectorAll("[id]")].forEach(node => {
      node.id = `${TESTVIEWID}--${node.id}`;
    });
    const changes = createFlexibilityChangesObject(TESTVIEWID, flexChanges);
    const appId = "someComponent";
    const oManifest = {
      "sap.app": {
        id: appId,
        type: "application",
        crossNavigation: {
          outbounds: []
        }
      }
    };
    const oAppComponent = {
      getDiagnostics: jest.fn().mockReturnValue(getFakeDiagnostics()),
      getModel: jest.fn().mockReturnValue({
        getMetaModel: jest.fn().mockReturnValue(oMetaModel)
      }),
      getComponentData: jest.fn().mockReturnValue({}),
      getManifestObject: jest.fn().mockReturnValue({
        getEntry: function (name) {
          return oManifest[name];
        }
      }),
      getLocalId: jest.fn(sId => sId)
    };
    //fake changes
    jest.spyOn(AppStorage, "loadFlexData").mockReturnValue(Promise.resolve(changes));
    jest.spyOn(Component, "get").mockReturnValue(oAppComponent);
    jest.spyOn(Utils, "getAppComponentForControl").mockReturnValue(oAppComponent);
    await FlexState.initialize({
      componentId: appId
    });
    resultXML = await XmlPreprocessor.process(resultXML, {
      name: "Test Fragment",
      componentId: appId,
      id: TESTVIEWID
    });

    //Assert that all changes have been applied
    const changesApplied = getChangesFromXML(resultXML);
    expect(changesApplied.length).toBe((flexChanges === null || flexChanges === void 0 ? void 0 : (_flexChanges$changes = flexChanges.changes) === null || _flexChanges$changes === void 0 ? void 0 : _flexChanges$changes.length) ?? 0 + (flexChanges === null || flexChanges === void 0 ? void 0 : (_flexChanges$variantD = flexChanges.variantDependentControlChanges) === null || _flexChanges$variantD === void 0 ? void 0 : _flexChanges$variantD.length) ?? 0);
    return resultXML;
  };
  const getChangesFromXML = xml => [...xml.querySelectorAll("*")].flatMap(e => [...e.attributes].map(a => a.name)).filter(attr => attr.includes("sap.ui.fl.appliedChanges"));
  _exports.getChangesFromXML = getChangesFromXML;
  const getTemplatingResult = async function (xmlInput, sMetadataUrl, mBindingContexts, mModels, flexChanges) {
    const templatedXml = `<root>${xmlInput}</root>`;
    const parser = new window.DOMParser();
    const xmlDoc = parser.parseFromString(templatedXml, "text/xml");
    // To ensure our macro can use #setBindingContext we ensure there is a pre existing JSONModel for converterContext
    // if not already passed to teh templating

    const oMetaModel = await getMetaModel(sMetadataUrl);
    const oPreprocessorSettings = await _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels);

    //This context for macro testing
    if (oPreprocessorSettings.models["this"]) {
      oPreprocessorSettings.bindingContexts["this"] = oPreprocessorSettings.models["this"].createBindingContext("/");
    }
    let resultXML = await XMLPreprocessor.process(xmlDoc.firstElementChild, {
      name: "Test Fragment"
    }, oPreprocessorSettings);
    if (flexChanges) {
      // apply flex changes
      resultXML = await applyFlexChanges(flexChanges, oMetaModel, resultXML);
    }
    return resultXML;
  };
  _exports.getTemplatingResult = getTemplatingResult;
  const getTemplatedXML = async function (xmlInput, sMetadataUrl, mBindingContexts, mModels, flexChanges) {
    const templatedXML = await getTemplatingResult(xmlInput, sMetadataUrl, mBindingContexts, mModels, flexChanges);
    return serializeXML(templatedXML);
  };

  /**
   * Process the requested view with the provided data.
   *
   * @param name Fully qualified name of the view to be tested.
   * @param sMetadataUrl Url of the metadata.
   * @param mBindingContexts Map of the bindingContexts to set on the models.
   * @param mModels Map of the models.
   * @param flexChanges Object with UI changes like 'changes' or 'variantDependentControlChanges'
   * @returns Templated view as string
   */
  _exports.getTemplatedXML = getTemplatedXML;
  async function processView(name, sMetadataUrl, mBindingContexts, mModels, flexChanges) {
    var _oPreprocessedView;
    const oMetaModel = await getMetaModel(sMetadataUrl);
    const oViewDocument = _loadResourceView(name);
    const oPreprocessorSettings = await _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels);
    let oPreprocessedView = await XMLPreprocessor.process(oViewDocument, {
      name: name
    }, oPreprocessorSettings);
    if (flexChanges) {
      oPreprocessedView = await applyFlexChanges(flexChanges ?? [], oMetaModel, oPreprocessedView);
    }
    return {
      asElement: oPreprocessedView,
      asString: _removeCommentFromXml(((_oPreprocessedView = oPreprocessedView) === null || _oPreprocessedView === void 0 ? void 0 : _oPreprocessedView.outerHTML) || "")
    };
  }

  /**
   * Process the requested XML fragment with the provided data.
   *
   * @param name Fully qualified name of the fragment to be tested.
   * @param testData Test data consisting
   * @returns Templated fragment as string
   */
  _exports.processView = processView;
  async function processFragment(name, testData) {
    const inputXml = `<root><core:Fragment fragmentName="${name}" type="XML" xmlns:core="sap.ui.core" /></root>`;
    const parser = new window.DOMParser();
    const inputDoc = parser.parseFromString(inputXml, "text/xml");

    // build model and bindings for given test data
    const settings = {
      models: {},
      bindingContexts: {}
    };
    for (const model in testData) {
      const jsonModel = new JSONModel();
      jsonModel.setData(testData[model]);
      settings.models[model] = jsonModel;
      settings.bindingContexts[model] = settings.models[model].createBindingContext("/");
    }

    // execute the pre-processor
    const resultDoc = await XMLPreprocessor.process(inputDoc.firstElementChild, {
      name
    }, settings);

    // exclude nested fragments from test snapshots
    const fragments = resultDoc.getElementsByTagName("core:Fragment");
    if ((fragments === null || fragments === void 0 ? void 0 : fragments.length) > 0) {
      for (const fragment of fragments) {
        fragment.innerHTML = "";
      }
    }

    // Keep the fragment result as child of root node when fragment generates multiple root controls
    const xmlResult = resultDoc.children.length > 1 ? resultDoc.outerHTML : resultDoc.innerHTML;
    return _removeCommentFromXml(xmlResult);
  }
  _exports.processFragment = processFragment;
  function serializeControl(controlToSerialize) {
    let tabCount = 0;
    function getTab() {
      let toAdd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let tab = "";
      for (let i = 0; i < tabCount + toAdd; i++) {
        tab += "\t";
      }
      return tab;
    }
    const serializeDelegate = {
      start: function (control, sAggregationName) {
        let controlDetail = "";
        if (sAggregationName) {
          if (control.getParent()) {
            var _control$getParent$ge, _control$getParent$ge2;
            const indexInParent = (_control$getParent$ge = control.getParent().getAggregation(sAggregationName)) === null || _control$getParent$ge === void 0 ? void 0 : (_control$getParent$ge2 = _control$getParent$ge.indexOf) === null || _control$getParent$ge2 === void 0 ? void 0 : _control$getParent$ge2.call(_control$getParent$ge, control);
            if (indexInParent > 0) {
              controlDetail += `,\n${getTab()}`;
            }
          }
        }
        controlDetail += `${control.getMetadata().getName()}(`;
        return controlDetail;
      },
      end: function () {
        return "})";
      },
      middle: function (control) {
        const id = control.getId();
        let data = `{id: ${ManagedObjectMetadata.isGeneratedId(id) ? "__dynamicId" : id}`;
        for (const oControlKey in control.mProperties) {
          if (control.mProperties.hasOwnProperty(oControlKey)) {
            data += `,\n${getTab()} ${oControlKey}: ${control.mProperties[oControlKey]}`;
          } else if (control.mBindingInfos.hasOwnProperty(oControlKey)) {
            const bindingDetail = control.mBindingInfos[oControlKey];
            data += `,\n${getTab()} ${oControlKey}: ${JSON.stringify(bindingDetail)}`;
          }
        }
        for (const oControlKey in control.mAssociations) {
          if (control.mAssociations.hasOwnProperty(oControlKey)) {
            var _control$mAssociation, _control$mAssociation2, _control$mAssociation3;
            data += `,\n${getTab()} ${oControlKey}: ${(((_control$mAssociation = control.mAssociations[oControlKey]) === null || _control$mAssociation === void 0 ? void 0 : (_control$mAssociation2 = (_control$mAssociation3 = _control$mAssociation).join) === null || _control$mAssociation2 === void 0 ? void 0 : _control$mAssociation2.call(_control$mAssociation3, ",")) ?? control.mAssociations[oControlKey]) || undefined}`;
          }
        }
        for (const oControlKey in control.mEventRegistry) {
          if (control.mEventRegistry.hasOwnProperty(oControlKey)) {
            data += `,\n${getTab()} ${oControlKey}: true}`;
          }
        }
        data += ``;
        return data;
      },
      startAggregation: function (control, sName) {
        let out = `,\n${getTab()}${sName}`;
        tabCount++;
        if (control.mBindingInfos[sName]) {
          out += `={ path:'${control.mBindingInfos[sName].path}', template:\n${getTab()}`;
        } else {
          out += `=[\n${getTab()}`;
        }
        return out;
      },
      endAggregation: function (control, sName) {
        tabCount--;
        if (control.mBindingInfos[sName]) {
          return `\n${getTab()}}`;
        } else {
          return `\n${getTab()}]`;
        }
      }
    };
    if (Array.isArray(controlToSerialize)) {
      return controlToSerialize.map(controlToRender => {
        return new Serializer(controlToRender, serializeDelegate).serialize();
      });
    } else {
      return new Serializer(controlToSerialize, serializeDelegate).serialize();
    }
  }
  _exports.serializeControl = serializeControl;
  function createAwaiter() {
    let fnResolve;
    const myPromise = new Promise(resolve => {
      fnResolve = resolve;
    });
    return {
      promise: myPromise,
      resolve: fnResolve
    };
  }
  _exports.createAwaiter = createAwaiter;
  return _exports;
}, false);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
/* global QUnit */
sap.ui.predefine(
	"sap/fe/test/JourneyRunner", [
		"sap/ui/base/Object",
		"sap/ui/test/Opa5",
		"./Utils",
		"./BaseArrangements",
		"./BaseActions",
		"./BaseAssertions",
		"./Shell",
		"sap/ui/test/opaQunit",
		"sap/base/Log",
		"sap/base/util/ObjectPath"
	],
	function (BaseObject, Opa5, Utils, BaseArrangements, BaseActions, BaseAssertions, Shell, opaQunit, Log, ObjectPath) {
		"use strict";

		/**
		 * Sync all JourneyRunner instances.
		 *
		 * @type {Promise<void>}
		 * @private
		 */
		var _pRunning = Promise.resolve();

		var _oDefaultRunner;

		/**
		 * Constructs a new JourneyRunner instance.
		 *
		 * @class A JourneyRunner for executing integration tests with given settings.
		 * @param {object} [mSettings] The settings object
		 * @param {object} [mSettings.pages] The available Opa pages
		 * @param {object} [mSettings.opaConfig] The Opa configuration applied via {@link sap.ui.test.Opa5#sap.ui.test.Opa5.extendConfig}
		 * @param {string} [mSettings.launchUrl] The URL to the launching page (usually a FLP.html)
		 * @param {object} [mSettings.launchParameters] The URL launch parameters
		 * @param {boolean} [mSettings.async] If false (default), only one JourneyRunner is executed at a time
		 * @alias sap.fe.test.JourneyRunner
		 * @public
		 */
		var JourneyRunner = BaseObject.extend("sap.fe.test.JourneyRunner", {
			constructor: function (mSettings) {
				BaseObject.apply(this);
				// store a copy of the settings object
				this._mInstanceSettings = Utils.mergeObjects(
					{
						pages: {
							onTheShell: new Shell()
						}
					},
					mSettings
				);
			},

			/**
			 * Executes the journeys in the given order.
			 *
			 * The settings provided as first parameter are merged into the base settings of the JourneyRunner instance.
			 *
			 * @param {object} [mSettings] The settings object for the tests to run. Overrides instance settings
			 * @param {object} [mSettings.pages] The available Opa pages
			 * @param {object} [mSettings.opaConfig] The Opa configuration applied via {@link sap.ui.test.Opa5#sap.ui.test.Opa5.extendConfig}
			 * @param {string} [mSettings.launchUrl] The URL to the launching page (usually a FLP.html)
			 * @param {object} [mSettings.launchParameters] The URL launch parameters
			 * @param {boolean} [mSettings.async] If false (default), only one JourneyRunner is executed at a time
			 * @param {Function[] | string[]} vJourneys The journeys to be executed. If a journey is represented as a string, it will be interpreted
			 * as a module path to the file that should be loaded. Else it is expected to be a function.
			 * Alternatively, instead of being wrapped in an array, the journeys can also be given as separate parameters:
			 * <pre>.run(mSettings, Journey1, Journey2, ...)</pre>
			 * @returns {object} A <code>Promise</code> that is resolved after all tests have been executed
			 * @function
			 * @name sap.fe.test.JourneyRunner#run
			 * @public
			 */
			run: function (mSettings, vJourneys) {
				var iJourneyParameterIndex = 1;
				if (!Utils.isOfType(mSettings, Object)) {
					iJourneyParameterIndex = 0;
					mSettings = Utils.mergeObjects(this._mInstanceSettings);
				} else {
					mSettings = Utils.mergeObjects(this._mInstanceSettings, mSettings);
				}

				var aJourneys = Array.prototype.slice.call(arguments, iJourneyParameterIndex); // journey-related parameter(s) as array
				if (aJourneys && aJourneys.length && Array.isArray(aJourneys[0])) {
					// if the first journey parameter is an array...
					aJourneys = aJourneys[0]; // ...then unwrap it, to use this array itself
				}
				var bAsync = mSettings.async,
					pSyncPromise;

				if (bAsync) {
					pSyncPromise = Promise.resolve();
				} else {
					pSyncPromise = _pRunning;
				}

				pSyncPromise = pSyncPromise
					.then(this._preRunActions.bind(this, mSettings))
					.then(this._runActions.bind(this, aJourneys))
					.then(this._postRunActions.bind(this, mSettings))
					.catch(function (oError) {
						Log.error("JourneyRunner.run failed", oError);
					});

				if (!bAsync) {
					_pRunning = pSyncPromise;
				}

				return pSyncPromise;
			},

			/**
			 * Returns the base action instance to be used for {@link sap.ui.test.Opa5#sap.ui.test.Opa5.extendConfig} <code>actions</code> setting.
			 *
			 * This function is only used if <code>actions</code> is not defined via the runner settings.
			 * It is meant to be overridden by a custom JourneyRunner implementation to provide custom base actions.
			 *
			 * By default, an instance of {@link sap.fe.test.BaseActions} will be returned.
			 *
			 * @param {object} mSettings The settings object of the runner instance
			 * @returns {sap.ui.test.Opa} An Opa instance for the base actions
			 * @function
			 * @name sap.fe.test.JourneyRunner#getBaseActions
			 * @protected
			 */
			getBaseActions: function (mSettings) {
				return new BaseActions();
			},

			/**
			 * Returns the base assertions instance to be used for {@link sap.ui.test.Opa5#sap.ui.test.Opa5.extendConfig} <code>assertions</code> setting.
			 *
			 * This function is only used if <code>assertions</code> is not defined via the runner settings.
			 * It is meant to be overridden by a custom JourneyRunner implementation to provide custom base assertions.
			 *
			 * By default, an instance of {@link sap.fe.test.BaseAssertions} will be returned.
			 *
			 * @param {object} mSettings The settings object of the runner instance
			 * @returns {sap.ui.test.Opa} An Opa instance for the base assertions
			 * @function
			 * @name sap.fe.test.JourneyRunner#getBaseAssertions
			 * @protected
			 */
			getBaseAssertions: function (mSettings) {
				return new BaseAssertions();
			},

			/**
			 * Returns the base arrangements instance to be used for {@link sap.ui.test.Opa5#sap.ui.test.Opa5.extendConfig} <code>arrangements</code> setting.
			 *
			 * This function is only used if <code>arrangements</code> is not defined via the runner settings.
			 * It is meant to be overridden by a custom JourneyRunner implementation to provide custom base assertions.
			 *
			 * By default, an instance of {@link sap.fe.test.BaseArrangements} will be returned.
			 *
			 * @param {object} mSettings The settings object of the runner instance
			 * @returns {sap.ui.test.Opa} An Opa instance for the base arrangements
			 * @function
			 * @name sap.fe.test.JourneyRunner#getBaseArrangements
			 * @protected
			 */
			getBaseArrangements: function (mSettings) {
				return new BaseArrangements(mSettings);
			},

			_preRunActions: function (mSettings) {
				Opa5.extendConfig(this._getOpaConfig(mSettings));
				Opa5.createPageObjects(mSettings.pages);
			},

			_runActions: function (aJourneys) {
				var that = this,
					pPromiseChain = Promise.resolve(),
					fnRunnerResolve,
					pRunnerEnds = new Promise(function (resolve) {
						fnRunnerResolve = resolve;
					});

				Log.info("JourneyRunner started");

				QUnit.done(function () {
					Log.info("JourneyRunner ended");
					fnRunnerResolve();
				});

				aJourneys.forEach(function (vJourney) {
					if (Utils.isOfType(vJourney, String)) {
						pPromiseChain = pPromiseChain.then(function () {
							return new Promise(function (resolve, reject) {
								sap.ui.require([vJourney], function (oJourney) {
									resolve(oJourney);
								});
							});
						});
					} else {
						pPromiseChain = pPromiseChain.then(function () {
							return vJourney;
						});
					}
					pPromiseChain = pPromiseChain.then(that._runJourney);
				});
				return pPromiseChain.then(function () {
					return pRunnerEnds;
				});
			},

			_runJourney: function (vJourney) {
				if (Utils.isOfType(vJourney, Function)) {
					vJourney.call();
				}
			},

			_postRunActions: function (mSettings) {
				this._removePages(mSettings.pages);
				Opa5.resetConfig();
			},

			_removePages: function (mPages) {
				var that = this;
				if (mPages) {
					Object.keys(mPages).forEach(function (sPageName) {
						var mPage = mPages[sPageName],
							sClassName = that._createClassName(mPage.namespace || "sap.ui.test.opa.pageObject", sPageName);
						// remove path entry to avoid error log flooding from OPA5 - it is newly created anyways
						ObjectPath.set(sClassName, undefined);
					});
				}
			},

			_createClassName: function (sNameSpace, sName) {
				return sNameSpace + "." + sName;
			},

			_getOpaConfig: function (mSettings) {
				var oConfig = Object.assign(
					{
						viewNamespace: "sap.fe.templates",
						autoWait: true,
						timeout: 30,
						pollingInterval: 50,
						logLevel: "ERROR",
						disableHistoryOverride: true,
						asyncPolling: true
					},
					mSettings.opaConfig
				);

				if (!oConfig.actions) {
					oConfig.actions = this.getBaseActions(mSettings);
				}
				if (!oConfig.assertions) {
					oConfig.assertions = this.getBaseAssertions(mSettings);
				}
				if (!oConfig.arrangements) {
					oConfig.arrangements = this.getBaseArrangements(mSettings);
				}

				return oConfig;
			}
		});

		/**
		 * Gets the global journey runner instance.
		 *
		 * @returns {object} The global default {@link sap.fe.test.JourneyRunner} instance
		 * @function
		 * @public
		 * @static
		 */
		JourneyRunner.getDefaultRunner = function () {
			if (!_oDefaultRunner) {
				_oDefaultRunner = new JourneyRunner();
			}
			return _oDefaultRunner;
		};

		/**
		 * Sets the global journey runner instance.
		 *
		 * @param {sap.fe.test.JourneyRunner} oDefaultRunner Defines the global default {@link sap.fe.test.JourneyRunner} instance
		 * @function
		 * @public
		 * @static
		 */
		JourneyRunner.setDefaultRunner = function (oDefaultRunner) {
			if (_oDefaultRunner) {
				_oDefaultRunner.destroy();
			}
			_oDefaultRunner = oDefaultRunner;
		};

		/**
		 * Static function to run the default runner with given parameters.
		 * Shortcut for <pre>JourneyRunner.getDefaultRunner().run(mSettings, Journey1, Journey2, ...)</pre>
		 * See {@link sap.fe.test.JourneyRunner#run} for parameter details.
		 *
		 * @function
		 * @public
		 * @static
		 */
		JourneyRunner.run = function () {
			var oRunner = JourneyRunner.getDefaultRunner();
			oRunner.run.apply(oRunner, arguments);
		};

		return JourneyRunner;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/ListReport", [
		"sap/fe/test/Utils",
		"./TemplatePage",
		"sap/ui/test/Opa5",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"sap/fe/test/builder/VMBuilder",
		"sap/fe/test/builder/OverflowToolbarBuilder",
		"sap/fe/test/builder/KPIBuilder",
		"sap/fe/test/api/FooterActionsBase",
		"sap/fe/test/api/FooterAssertionsBase",
		"sap/fe/test/api/HeaderActionsLR",
		"sap/fe/test/api/HeaderAssertionsLR",
		"sap/fe/test/api/KPICardAssertions",
		"sap/fe/test/api/KPICardActions"
	],
	function (
		Utils,
		TemplatePage,
		Opa5,
		OpaBuilder,
		FEBuilder,
		FieldBuilder,
		VMBuilder,
		OverflowToolbarBuilder,
		KPIBuilder,
		FooterActionsBase,
		FooterAssertionsBase,
		HeaderActionsLR,
		HeaderAssertionsLR,
		KPICardAssertions,
		KPICardActions
	) {
		"use strict";

		function getTableId(sIconTabProperty) {
			return "fe::table::" + sIconTabProperty + "::LineItem";
		}

		function getChartId(sEntityType) {
			return "fe::Chart::" + sEntityType + "::Chart";
		}

		function _getHeaderBuilder(vOpaInstance, sPageId) {
			return FEBuilder.create(vOpaInstance).hasId(sPageId);
		}

		/**
		 * Constructs a new ListReport definition.
		 *
		 * @class Provides a test page definition for a list report page with the corresponding parameters.
		 *
		 * Sample usage:
		 * <code><pre>
		 * var oListReportDefinition = new ListReport({ appId: "MyApp", componentId: "MyListReportId", entitySet: "MyEntitySet" });
		 * </pre></code>
		 * @param {object} oPageDefinition The required parameters
		 * @param {string} oPageDefinition.appId The app id (defined in the manifest root)
		 * @param {string} oPageDefinition.componentId The component id (defined in the target section for the list report within the manifest)
		 * @param {string} oPageDefinition.entitySet The entitySet (optional)(defined in the settings of the corresponding target component within the manifest)
		 * @param {string} oPageDefinition.contextPath The contextPath (optional)(defined in the settings of the corresponding target component within the manifest)
		 * @param {...object} [aInAdditionalPageDefinitions] Additional custom page functions, provided in an object containing <code>actions</code> and <code>assertions</code>
		 * @returns {sap.fe.test.ListReport} A list report page definition
		 * @name sap.fe.test.ListReport
		 * @extends sap.fe.test.TemplatePage
		 * @public
		 */
		function ListReport(oPageDefinition, aInAdditionalPageDefinitions) {
			var sAppId = oPageDefinition.appId,
				sComponentId = oPageDefinition.componentId,
				sContextPath = oPageDefinition.contextPath,
				sEntityPath = sContextPath ? sContextPath.substring(1).replace("/", "::") : oPageDefinition.entitySet,
				ViewId = sAppId + "::" + sComponentId,
				SingleTableId = "fe::table::" + sEntityPath + "::LineItem",
				SingleChartId = "fe::Chart::" + sEntityPath + "::Chart",
				FilterBarId = "fe::FilterBar::" + sEntityPath,
				FilterBarVHDId = FilterBarId + "::FilterFieldValueHelp::",
				oResourceBundleCore = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core"),
				IconTabBarId = "fe::TabMultipleMode",
				PageId = "fe::ListReport",
				aAdditionalPageDefinitions = Array.isArray(arguments[1]) ? arguments[1] : Array.prototype.slice.call(arguments, 1);

			return TemplatePage.apply(
				TemplatePage,
				[
					ViewId,
					{
						/**
						 * ListReport actions
						 *
						 * @namespace sap.fe.test.ListReport.actions
						 * @extends sap.fe.test.TemplatePage.actions
						 * @public
						 */
						actions: {
							/**
							 * Returns a {@link sap.fe.test.api.TableActions} instance for the specified table.
							 *
							 * @param {string | sap.fe.test.api.TableIdentifier} vTableIdentifier The identifier of the table, or its header title
							 * @returns {sap.fe.test.api.TableActions} The available table actions
							 * @function
							 * @name sap.fe.test.ListReport.actions#onTable
							 * @public
							 */
							onTable: function (vTableIdentifier) {
								var sTableId;
								if (vTableIdentifier) {
									sTableId = !Utils.isOfType(vTableIdentifier, String)
										? getTableId(vTableIdentifier.property)
										: vTableIdentifier;
								} else {
									sTableId = SingleTableId;
								}
								return this._onTable({ id: sTableId });
							},
							onChart: function (vChartIdentifier) {
								var sChartId;
								if (vChartIdentifier) {
									sChartId = !Utils.isOfType(vChartIdentifier, String)
										? getChartId(vChartIdentifier.property)
										: vChartIdentifier;
								} else {
									sChartId = SingleChartId;
								}
								return this._onChart({
									id: sChartId
								});
							},
							onKPICard: function () {
								return new KPICardActions(KPIBuilder.create(this));
							},
							/**
							 * Returns a {@link sap.fe.test.api.FilterBarActions} instance.
							 *
							 * @returns {sap.fe.test.api.FilterBarActions} The available filter bar actions
							 * @function
							 * @alias sap.fe.test.ListReport.actions#onFilterBar
							 * @public
							 */
							onFilterBar: function () {
								return this._onFilterBar({ id: FilterBarId });
							},
							/**
							 * Returns a {@link sap.fe.test.api.HeaderActionsLR} instance.
							 *
							 * @returns {sap.fe.test.api.HeaderActionsLR} The available header actions
							 * @function
							 * @alias sap.fe.test.ListReport.actions#onHeader
							 * @public
							 */
							onHeader: function () {
								return new HeaderActionsLR(_getHeaderBuilder(this, PageId), { id: PageId });
							},
							/**
							 * Collapses or expands the page header.
							 *
							 * @param {boolean} [bCollapse] Defines whether the header should be collapsed, else it is expanded (default)
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @function
							 * @name sap.fe.test.ListReport.actions#iCollapseExpandPageHeader
							 * @public
							 */
							iCollapseExpandPageHeader: function (bCollapse) {
								return this._iCollapseExpandPageHeader(bCollapse);
							},
							iExecuteActionOnDialog: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Button")
									.hasProperties({ text: sText })
									.isDialogElement()
									.doPress()
									.description("Pressing dialog button '" + sText + "'")
									.execute();
							},
							iCheckLinksCount: function (count) {
								return OpaBuilder.create(this)
									.hasType("sap.m.ColumnListItem")
									.check(function (targets) {
										if (targets.length === count) {
											return true;
										} else {
											return false;
										}
									}, true)
									.description("Seeing QuickView Card with " + count + " target applications in ObjectPage")
									.execute();
							},
							iClickQuickViewMoreLinksButton: function () {
								return OpaBuilder.create(this)
									.hasType("sap.m.Button")
									.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "info.POPOVER_DEFINE_LINKS"))
									.doPress()
									.description("Pressing 'More Links' button")
									.execute();
							},
							iClickLinkWithText: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.hasProperties({ text: sText })
									.doPress()
									.description("Navigating via link '" + sText + "'")
									.execute();
							},
							/**
							 * Navigates to or focuses on the defined view of a Multiple Views List Report table.
							 *
							 * @param {string | sap.fe.test.api.ViewIdentifier} vViewIdentifier The identifier of a view as defined in the manifest file, or its label passed as a string
							 * if passed as an object, the following pattern will be considered:
							 * <code><pre>
							 * {
							 *     key: <string>,
							 * }
							 * </pre></code>
							 * Depending on property 'keepPreviousPersonalization' in the manifest the key could be set different within the id of the table. If necessary please check the UI control tree within the debugger.
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @function
							 * @name sap.fe.test.ListReport.actions#iGoToView
							 * @public
							 */
							iGoToView: function (vViewIdentifier) {
								var viewKey =
									Utils.isOfType(vViewIdentifier, Object) && typeof vViewIdentifier.key === "string"
										? { key: "fe::table::" + vViewIdentifier.key + "::LineItem" }
										: { text: vViewIdentifier };
								return OpaBuilder.create(this)
									.hasId(IconTabBarId)
									.has(OpaBuilder.Matchers.aggregation("items", OpaBuilder.Matchers.properties(viewKey)))
									.check(function (aItems) {
										return aItems.length > 0;
									})
									.doPress()
									.description(
										"Selecting view '" +
											(Utils.isOfType(vViewIdentifier, Object) ? vViewIdentifier.key : vViewIdentifier) +
											"'"
									)
									.execute();
							},
							/**
							 * TODO This function is only here for legacy reasons and therefore private. Use iGoToView instead.
							 *
							 * @param {string} sName The name of the view within the List Report table
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @private
							 */
							iOpenIconTabWithTitle: function (sName) {
								// return this.iGoToView(sName);
								return OpaBuilder.create(this)
									.timeout(1)
									.check(function () {
										return false;
									})
									.error(
										"Test function iOpenIconTabWithTitle() is deprecated - please use function iGoToView() with the same parameter"
									)
									.execute();
							},
							iSaveVariant: function (sVariantName, bSetAsDefault, bApplyAutomatically) {
								var aArguments = Utils.parseArguments([String, Boolean, Boolean], arguments),
									oVMBuilder = VMBuilder.create(this).hasId("fe::PageVariantManagement");

								if (aArguments[0]) {
									oVMBuilder
										.doSaveAs(sVariantName, bSetAsDefault, bApplyAutomatically)
										.description(
											Utils.formatMessage(
												"Saving variant for '{0}' as '{1}' with default='{2}' and applyAutomatically='{3}'",
												"Page Variant",
												sVariantName,
												!!bSetAsDefault,
												!!bApplyAutomatically
											)
										);
								} else {
									oVMBuilder
										.doSave()
										.description(Utils.formatMessage("Updating current variant for '{0}'", "Page Variant"));
								}
								return oVMBuilder.execute();
							},
							iSelectVariant: function (sVariantName) {
								return VMBuilder.create(this)
									.hasId("fe::PageVariantManagement")
									.doSelectVariant(sVariantName)
									.description(Utils.formatMessage("Selecting variant '{1}' from '{0}'", "Page Variant", sVariantName))
									.execute();
							},
							iOpenKPICard: function (sTitle) {
								return KPIBuilder.create(this)
									.clickKPITag(sTitle)
									.description("Opening card for KPI '" + sTitle + "'")
									.execute();
							}
						},
						/**
						 * ListReport assertions
						 *
						 * @namespace sap.fe.test.ListReport.assertions
						 * @extends sap.fe.test.TemplatePage.assertions
						 * @public
						 */
						assertions: {
							/**
							 * Returns a {@link sap.fe.test.api.TableAssertions} instance for the specified table.
							 *
							 * @param {string | sap.fe.test.api.TableIdentifier} vTableIdentifier The identifier of the table, or its header title
							 * @returns {sap.fe.test.api.TableAssertions} The available table assertions
							 * @function
							 * @alias sap.fe.test.ListReport.assertions#onTable
							 * @public
							 */
							onTable: function (vTableIdentifier) {
								if (!vTableIdentifier) {
									vTableIdentifier = { id: SingleTableId };
								} else {
									var sTableProperty = !Utils.isOfType(vTableIdentifier, String)
										? vTableIdentifier.property
										: vTableIdentifier;
									vTableIdentifier = { id: getTableId(sTableProperty) };
								}

								return this._onTable(vTableIdentifier);
							},
							onChart: function (vChartIdentifier) {
								var sChartId;
								if (vChartIdentifier) {
									sChartId = !Utils.isOfType(vChartIdentifier, String)
										? getChartId(vChartIdentifier.property)
										: vChartIdentifier;
								} else {
									sChartId = SingleChartId;
								}
								return this._onChart({
									id: sChartId
								});
							},
							/**
							 * Returns a {@link sap.fe.test.api.FilterBarAssertions} instance.
							 *
							 * @returns {sap.fe.test.api.FilterBarAssertions} The available filter bar assertions
							 * @function
							 * @alias sap.fe.test.ListReport.assertions#onFilterBar
							 * @public
							 */
							onFilterBar: function () {
								return this._onFilterBar({ id: FilterBarId });
							},
							/**
							 * Returns a {@link sap.fe.test.api.HeaderAssertionsLR} instance.
							 *
							 * @returns {sap.fe.test.api.HeaderAssertionsLR} The available header assertions
							 * @function
							 * @alias sap.fe.test.ListReport.assertions#onHeader
							 * @public
							 */
							onHeader: function () {
								return new HeaderAssertionsLR(_getHeaderBuilder(this, PageId), { id: PageId });
							},
							onKPICard: function () {
								return new KPICardAssertions(KPIBuilder.create(this));
							},
							iSeeTheMessageToast: function (sText) {
								return this._iSeeTheMessageToast(sText);
							},
							iSeeFilterFieldsInFilterBar: function (iNumberOfFilterFields, bIsVisualFilterLayout) {
								if (bIsVisualFilterLayout) {
									return OpaBuilder.create(this)
										.hasId(FilterBarId)
										.check(function (oControl) {
											return (
												oControl
													.getAggregation("layout")
													.isA("sap.fe.core.controls.filterbar.VisualFilterContainer") &&
												oControl.getAggregation("layout").getFilterFields().length === iNumberOfFilterFields
											);
										})
										.description("Seeing filter bar with " + iNumberOfFilterFields + " filter fields")
										.execute();
								}
								return OpaBuilder.create(this)
									.hasId(FilterBarId)
									.hasAggregationLength("filterItems", iNumberOfFilterFields)
									.description("Seeing filter bar with " + iNumberOfFilterFields + " filter fields")
									.execute();
							},
							iSeeTableCellWithActions: function (sPath, nCellPos, sButtonText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.ColumnListItem")
									.has(OpaBuilder.Matchers.bindingPath(sPath))
									.has(function (row) {
										var cell = row.getCells()[nCellPos];
										if (cell.isA("sap.fe.macros.MacroAPI")) {
											cell = cell.getContent();
										}
										return cell.getMetadata().getElementName() === "sap.m.Button" && cell.getText() === sButtonText;
									})
									.description("Inline Action is present in the table cell with the Text " + sButtonText)
									.execute();
							},
							iSeeLinkWithText: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.hasProperties({ text: sText })
									.description("Seeing link with text '" + sText + "'")
									.execute();
							},
							iSeeQuickViewMoreLinksButton: function () {
								return OpaBuilder.create(this)
									.isDialogElement(true)
									.hasType("sap.m.Button")
									.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "info.POPOVER_DEFINE_LINKS"))
									.description("The 'More Links' button found")
									.execute();
							},
							iSeeFlpLink: function (sDescription) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.isDialogElement(true)
									.hasProperties({ text: sDescription })
									.description("FLP link with text '" + sDescription + "' is present")
									.execute();
							},
							iSeeHeaderPinnableToggle: function (bVisible) {
								var sState = bVisible ? "visible" : "hidden";
								return OpaBuilder.create(this)
									.hasType("sap.f.DynamicPageHeader")
									.hasProperties({ pinnable: bVisible })
									.description("The Page Header Pinnable Toggle is " + sState)
									.execute();
							},
							iSeeContactPopoverWithAvatarImage: function (sImageSource) {
								return OpaBuilder.create(this)
									.hasType("sap.ui.mdc.link.Panel")
									.check(function (avatars) {
										var bFound = avatars.some(function (avatar) {
											return avatar.src === sImageSource;
										});
										return bFound === false;
									}, true)
									.description("Seeing Contact Card with Avatar Image in ListReport")
									.execute();
							},
							iSeeAvatarImage: function (sImageSource) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Avatar")
									.hasProperties({ src: sImageSource })
									.description("Seeing avatar image with url '" + sImageSource + "'")
									.execute();
							},
							iSeeLabelWithText: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Label")
									.hasProperties({ text: sText })
									.description("Seeing label with text '" + sText + "'")
									.execute();
							},
							iSeeTitleInQuickViewForm: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.ui.core.Title")
									.isDialogElement(true)
									.hasProperties({ text: sText })
									.description("Seeing title with text '" + sText + "'")
									.execute();
							},
							iSeeSummaryOfAppliedFilters: function () {
								var sAppliedFilters;
								OpaBuilder.create(this)
									.hasId(FilterBarId)
									.mustBeVisible(false)
									.do(function (oFilterbar) {
										sAppliedFilters = oFilterbar.getAssignedFiltersText().filtersText;
									})
									.execute();
								return OpaBuilder.create(this)
									.hasType("sap.f.DynamicPageTitle")
									.has(function (oDynamicPageTitle) {
										return oDynamicPageTitle.getSnappedContent()[0].getText() === sAppliedFilters;
									})
									.description("The correct text on the collapsed filterbar is displayed")
									.execute();
							},
							iSeeDeleteConfirmation: function () {
								return this._iSeeTheMessageToast(oResourceBundleCore.getText("C_TRANSACTION_HELPER_DELETE_TOAST_SINGULAR"));
							},
							iSeePageTitle: function (sTitle) {
								return OpaBuilder.create(this)
									.hasType("sap.f.DynamicPageTitle")
									.hasAggregationProperties("heading", { text: sTitle })
									.description("Seeing title '" + sTitle + "'")
									.execute();
							},
							iSeeVariantTitle: function (sTitle) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Title")
									.hasId("fe::PageVariantManagement-vm-text")
									.hasProperties({ text: sTitle })
									.description("Seeing variant title '" + sTitle + "'")
									.execute();
							},
							iSeeControlVMFilterBarTitle: function (sTitle) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Title")
									.hasId(FilterBarId + "::VariantManagement-vm-text")
									.hasProperties({ text: sTitle })
									.description("Seeing variant title '" + sTitle + "'")
									.execute();
							},
							iSeeControlVMTableTitle: function (sTitle, sIconTabProperty) {
								var sTableId = sIconTabProperty ? getTableId(sIconTabProperty) : SingleTableId;
								return OpaBuilder.create(this)
									.hasType("sap.m.Title")
									.hasId(sTableId + "::VM-vm-text")
									.hasProperties({ text: sTitle })
									.description("Seeing variant title '" + sTitle + "'")
									.execute();
							},
							iSeeVariantModified: function (bIsModified, bControl) {
								var sLabelId;
								if (bControl) {
									sLabelId = FilterBarId + "::VariantManagement-vm-modified";
								} else {
									sLabelId = "fe::PageVariantManagement-vm-modified";
								}

								bIsModified = bIsModified === undefined ? true : bIsModified;
								if (bIsModified) {
									return OpaBuilder.create(this)
										.hasType("sap.m.Text")
										.hasId(sLabelId)
										.hasProperties({ text: "*" })
										.description("Seeing variant state as 'modified'")
										.execute();
								} else {
									return OpaBuilder.create(this)
										.hasType("sap.m.Label")
										.check(function (oLabels) {
											return !oLabels.some(function (oLabel) {
												return oLabel.getId() === sLabelId;
											});
										}, true)
										.description("Seeing variant state as 'not modified'")
										.execute();
								}
							},
							iSeePageVM: function (mState) {
								return FEBuilder.create(this)
									.hasId("fe::PageVariantManagement")
									.hasState(mState)
									.description(Utils.formatMessage("Seeing page VM with state '{0}'", mState))
									.execute();
							},
							iSeeControlVMFilterBar: function () {
								return OpaBuilder.create(this)
									.hasId(FilterBarId + "::VariantManagement")
									.description("Seeing control VM - FilterBar")
									.execute();
							},
							iSeeDraftIndicator: function () {
								return OpaBuilder.create(this)
									.hasType("sap.m.ObjectMarker")
									.hasProperties({
										type: "Draft"
									})
									.description("Draft indicator is visible")
									.execute();
							},
							iSeeDraftIndicatorLocked: function (user) {
								var props = user ? { type: "LockedBy", additionalInfo: user } : { type: "Locked" };

								return OpaBuilder.create(this)
									.hasType("sap.m.ObjectMarker")
									.hasProperties(props)
									.description("Draft indicator is visible and locked" + (user ? " by '" + user + "'" : ""))
									.execute();
							},
							/**
							 * Checks the view of a Multiple View List Report table.
							 *
							 * @param {string | sap.fe.test.api.ViewIdentifier} vViewIdentifier The identifier of a view as defined in the manifest file, or its label passed as a string
							 * if passed as an object, the following pattern will be considered:
							 * <code><pre>
							 * {
							 *     key: <string>,
							 * }
							 * </pre></code>
							 * Depending on property 'keepPreviousPersonalization' in the manifest, the key could be set differently within the id of the table. If necessary please check the UI control tree within the debugger.
							 * @param {object} mState An object containing properties of the view to be checked
							 * Example:
							 * <code><pre>
							 * {
							 *     count: <number of records expected>,
							 * }
							 * </pre></code>
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @function
							 * @name sap.fe.test.ListReport.assertions#iCheckView
							 * @public
							 */
							iCheckView: function (vViewIdentifier, mState) {
								var viewKey =
									Utils.isOfType(vViewIdentifier, Object) && typeof vViewIdentifier.key === "string"
										? { key: "fe::table::" + vViewIdentifier.key + "::LineItem" }
										: { text: vViewIdentifier };

								return OpaBuilder.create(this)
									.hasId(IconTabBarId)
									.has(OpaBuilder.Matchers.aggregation("items", OpaBuilder.Matchers.properties(viewKey)))
									.has(FEBuilder.Matchers.atIndex(0))
									.hasProperties(mState)
									.description(Utils.formatMessage("Checking view '{0}' with properties '{1}'", vViewIdentifier, mState))
									.execute();
							},
							/**
							 * TODO This function is only here for legacy reasons and therefore private. Use iCheckView instead.
							 *
							 * @param {object} mProperties Object containing the text: property and any other properties to be checked
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @private
							 */
							iSeeIconTabWithProperties: function (mProperties) {
								// return this.iCheckView(mProperties.text, mProperties);
								return OpaBuilder.create(this)
									.timeout(1)
									.check(function () {
										return false;
									})
									.error("Test function iSeeIconTabWithProperties() is deprecated - please use function iCheckView()")
									.execute();
							},
							iSeeNumOfOperators: function (sFieldName, numItems) {
								return OpaBuilder.create(this)
									.hasId(FilterBarVHDId + sFieldName + "-DCP")
									.doOnChildren(OpaBuilder.create(this).hasAggregationLength("items", numItems))
									.description("Seeing a value list of condition operators with " + numItems + " items.")
									.execute();
							},
							iSeeKPI: function (sTitle, oProperties) {
								var sDescription = "Seeing KPI '" + sTitle + "'";
								if (oProperties) {
									sDescription += " with properties " + JSON.stringify(oProperties);
								}
								return KPIBuilder.create(this).checkKPITag(sTitle, oProperties).description(sDescription).execute();
							},
							iSeeKPICard: function () {
								return KPIBuilder.create(this).checkKPICard().description("Seeing KPI Card").execute();
							}
						}
					}
				].concat(aAdditionalPageDefinitions)
			);
		}

		return ListReport;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/LocationUtil", ["sap/ui/test/OpaBuilder", "sap/ui/test/Opa5", "sap/fe/test/Utils"], function (OpaBuilder, Opa5, Utils) {
	"use strict";

	// Match with V4Freestyle and SO Apps
	var getHash = function (oRootView, bGetHashFromWindow) {
		if (bGetHashFromWindow || !(typeof oRootView.getController().getRouter === "function")) {
			var oWindow = Opa5.getWindow();
			return oWindow.window.location.hash;
		}
		return oRootView.getController().getRouter().getHashChanger().getHash();
	};
	var getRootViewId = function (sFlpAppName) {
		return new RegExp(Utils.formatMessage("^application-{0}-component---app(RootView)?$", sFlpAppName));
	};

	return {
		create: function (sFlpAppName) {
			return {
				actions: {},
				assertions: {
					iCheckCurrentHashStartsWith: function (sHash, bGetHashFromWindow) {
						return OpaBuilder.create(this)
							.hasId(getRootViewId(sFlpAppName))
							.check(function (aRootViews) {
								var sCurrentHash = getHash(aRootViews[0], bGetHashFromWindow);
								return sCurrentHash.indexOf(sHash) === 0;
							})
							.description("Checking hash starts with " + sHash)
							.execute();
					},
					iCheckCurrentHashDoesNotContain: function (sPart, bGetHashFromWindow) {
						return OpaBuilder.create(this)
							.hasId(getRootViewId(sFlpAppName))
							.check(function (aRootViews) {
								var sCurrentHash = getHash(aRootViews[0], bGetHashFromWindow);
								return sCurrentHash.indexOf(sPart) === -1;
							})
							.description("Checking hash doesn't contain " + sPart)
							.execute();
					}
				}
			};
		}
	};
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/ObjectPage", [
		"sap/base/util/merge",
		"./TemplatePage",
		"sap/ui/test/OpaBuilder",
		"sap/ui/test/Opa5",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"sap/fe/test/builder/OverflowToolbarBuilder",
		"sap/fe/test/api/FooterActionsOP",
		"sap/fe/test/api/FooterAssertionsOP",
		"sap/fe/test/api/HeaderActions",
		"sap/fe/test/api/HeaderAssertions",
		"sap/fe/test/api/FormActions",
		"sap/fe/test/api/FormAssertions"
	],
	function (
		mergeObjects,
		TemplatePage,
		OpaBuilder,
		Opa5,
		Utils,
		FEBuilder,
		FieldBuilder,
		OverflowToolbarBuilder,
		FooterActionsOP,
		FooterAssertionsOP,
		HeaderActions,
		HeaderAssertions,
		FormActions,
		FormAssertions
	) {
		"use strict";

		function getTableId(sNavProperty, sQualifier) {
			return sQualifier
				? "fe::table::" + sNavProperty.split("/").join("::") + "::LineItem::" + sQualifier
				: "fe::table::" + sNavProperty.split("/").join("::") + "::LineItem";
		}

		function getChartId(sEntityType) {
			return "fe::Chart::" + sEntityType + "::Chart";
		}

		function _getOverflowToolbarBuilder(vOpaInstance, vFooterIdentifier) {
			return OverflowToolbarBuilder.create(vOpaInstance).hasId(vFooterIdentifier.id);
		}

		function _getHeaderBuilder(vOpaInstance, vHeaderIdentifier) {
			return FEBuilder.create(vOpaInstance).hasId(vHeaderIdentifier.id);
		}

		function _getFormBuilder(vOpaInstance, vFormIdentifier) {
			var oFormBuilder = FEBuilder.create(vOpaInstance);
			if (Utils.isOfType(vFormIdentifier, String)) {
				oFormBuilder.hasType("sap.uxap.ObjectPageSubSection");
				oFormBuilder.hasProperties({ title: vFormIdentifier });
			} else if (vFormIdentifier.fieldGroupId) {
				oFormBuilder.hasId(vFormIdentifier.fieldGroupId);
				if (vFormIdentifier.fullSubSectionId) {
					oFormBuilder.has(OpaBuilder.Matchers.ancestor(vFormIdentifier.fullSubSectionId, false));
				}
			} else {
				oFormBuilder.hasId(vFormIdentifier.id);
			}
			return oFormBuilder;
		}

		function _createSectionMatcher(vSectionIdentifier, sOPSectionIdPrefix) {
			var vMatcher, sActionId;

			if (!Utils.isOfType(vSectionIdentifier, String)) {
				if (typeof vSectionIdentifier.section === "string" && !vSectionIdentifier.subSection) {
					sActionId =
						vSectionIdentifier.section === "EditableHeaderSection"
							? "fe::" + vSectionIdentifier.section + "-anchor"
							: sOPSectionIdPrefix + "::" + vSectionIdentifier.section + "-anchor";
					vMatcher = OpaBuilder.Matchers.children(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sActionId))));
				} else {
					throw new Error(
						"not supported section and subsection parameters for creating a control id: " +
							vSectionIdentifier.section +
							"/" +
							vSectionIdentifier.subSection
					);
				}
			} else {
				vMatcher = OpaBuilder.Matchers.children(
					FEBuilder.Matchers.states({
						controlType: "sap.m.Button",
						text: vSectionIdentifier
					})
				);
			}
			return vMatcher;
		}

		function _createMenuActionExecutorBuilder(vMenuAction, sOPSubSectionIdPrefix) {
			if (!vMenuAction) {
				throw new Error("vMenuAction parameter missing");
			}
			var sActionId = sOPSubSectionIdPrefix + "::" + vMenuAction + "-anchor-unifiedmenu";

			return FEBuilder.create()
				.hasType("sap.ui.unified.MenuItem")
				.hasId(new RegExp(Utils.formatMessage("{0}$", sActionId)))
				.doPress()
				.description(Utils.formatMessage("Executing action '{0}' from currently open action menu", vMenuAction));
		}

		function _getObjectPageSectionSubSectionBuilder(vOpaInstance, SectionSubSectionIdentifier, SectionSubSectionIdPrefix, ControlType) {
			var SectionSubSectionBuilder = FEBuilder.create(vOpaInstance).hasType(ControlType);
			if (Utils.isOfType(SectionSubSectionIdentifier, String)) {
				SectionSubSectionBuilder.hasProperties({ title: SectionSubSectionIdentifier });
			} else if (SectionSubSectionIdentifier.section) {
				SectionSubSectionBuilder.hasId(SectionSubSectionIdPrefix + "::" + SectionSubSectionIdentifier.section);
			} else {
				throw new Error(
					"section or sub-section parameters not supported for creating a control id: " + SectionSubSectionIdentifier
				);
			}
			return SectionSubSectionBuilder;
		}
		function _getObjectPageSectionBuilder(vOpaInstance, ObjectPageSectionIdentifier, OPSectionIdPrefix) {
			return _getObjectPageSectionSubSectionBuilder(
				vOpaInstance,
				ObjectPageSectionIdentifier,
				OPSectionIdPrefix,
				"sap.uxap.ObjectPageSection"
			);
		}
		function _getObjectPageSubSectionBuilder(vOpaInstance, ObjectPageSubSectionIdentifier, OPSubSectionIdPrefix) {
			return _getObjectPageSectionSubSectionBuilder(
				vOpaInstance,
				ObjectPageSubSectionIdentifier,
				OPSubSectionIdPrefix,
				"sap.uxap.ObjectPageSubSection"
			);
		}

		/**
		 * Constructs a new ObjectPage instance.
		 *
		 * @class Provides a test page definition for an object page with the corresponding parameters.
		 *
		 * Sample usage:
		 * <code><pre>
		 * var oObjectPageDefinition = new ObjectPage({ appId: "MyApp", componentId: "MyObjectPageId", entitySet: "MyEntitySet" });
		 * </pre></code>
		 * @param {object} oPageDefinition The required parameters
		 * @param {string} oPageDefinition.appId The app id (defined in the manifest root)
		 * @param {string} oPageDefinition.componentId The component id (defined in the target section for the list report within the manifest)
		 * @param {string} oPageDefinition.entitySet The entitySet (defined in the settings of the corresponding target component within the manifest)
		 * @param {string} oPageDefinition.contextPath The contextPath (optional)(defined in the settings of the corresponding target component within the manifest)
		 * @param {...object} [aAdditionalPageDefinitions] Additional custom page functions, provided in an object containing <code>actions</code> and <code>assertions</code>
		 * @returns {sap.fe.test.ObjectPage} An object page page definition
		 * @name sap.fe.test.ObjectPage
		 * @extends sap.fe.test.TemplatePage
		 * @public
		 */
		function ObjectPage(oPageDefinition, aAdditionalPageDefinitions) {
			var sAppId = oPageDefinition.appId,
				sComponentId = oPageDefinition.componentId,
				ViewId = sAppId + "::" + sComponentId,
				ObjectPageLayoutId = ViewId + "--fe::ObjectPage",
				OPHeaderId = "fe::HeaderFacet",
				OPHeaderContentId = "fe::ObjectPage-OPHeaderContent",
				OPHeaderContentContainerId = ViewId + "--fe::HeaderContentContainer",
				OPFooterId = "fe::FooterBar",
				OPSectionIdPrefix = "fe::FacetSection",
				OPSubSectionIdPrefix = "fe::FacetSubSection",
				OPFormIdPrefix = "fe::Form",
				OPFormContainerIdPrefix = "fe::FormContainer",
				OPFormContainerHeaderFacetsIdPrefix = "fe::HeaderFacet::FormContainer",
				BreadCrumbId = ViewId + "--fe::Breadcrumbs",
				AnchorBarId = "fe::ObjectPage-anchBar",
				PaginatorId = "fe::Paginator",
				EditableHeaderTitleId = "EditableHeaderForm::EditableHeaderTitle",
				PageEditMode = {
					DISPLAY: "Display",
					EDITABLE: "Editable"
				},
				oResourceBundleCore = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core"),
				aAdditionalPages = Array.prototype.slice.call(arguments, 1);

			return TemplatePage.apply(
				TemplatePage,
				[
					ViewId,
					{
						/**
						 * ObjectPage actions
						 *
						 * @namespace sap.fe.test.ObjectPage.actions
						 * @extends sap.fe.test.TemplatePage.actions
						 * @public
						 */
						actions: {
							/**
							 * Returns a {@link sap.fe.test.api.TableActions} instance for the specified table.
							 *
							 * @param {string | sap.fe.test.api.TableIdentifier} vTableIdentifier The identifier of the table, or its header title
							 * @returns {sap.fe.test.api.TableActions} The available table actions
							 * @function
							 * @name sap.fe.test.ObjectPage.actions#onTable
							 * @public
							 */
							onTable: function (vTableIdentifier) {
								if (!Utils.isOfType(vTableIdentifier, String) && !vTableIdentifier.id) {
									vTableIdentifier = { id: getTableId(vTableIdentifier.property, vTableIdentifier.qualifier) };
								}
								return this._onTable(vTableIdentifier);
							},
							onChart: function (vChartIdentifier) {
								var sChartId;
								if (vChartIdentifier) {
									sChartId = !Utils.isOfType(vChartIdentifier, String)
										? getChartId(vChartIdentifier.property)
										: vChartIdentifier;
								}
								return this._onChart({
									id: sChartId
								});
							},
							/**
							 * Returns a {@link sap.fe.test.api.FilterBarActions} instance.
							 *
							 * @param {sap.fe.test.api.FilterBarIdentifier | string} vFilterBarIdentifier The identifier of the filterbar
							 * @returns {sap.fe.test.api.FilterBarActions} The available filter bar actions
							 * @function
							 * @alias sap.fe.test.ObjectPage.actions#onFilterBar
							 * @public
							 */
							onFilterBar: function (vFilterBarIdentifier) {
								var vIdentifier =
									typeof vFilterBarIdentifier === "string" ? { id: vFilterBarIdentifier } : vFilterBarIdentifier;
								return this._onFilterBar(vIdentifier);
							},
							/**
							 * Returns a {@link sap.fe.test.api.FooterActionsOP} instance.
							 *
							 * @returns {sap.fe.test.api.FooterActionsOP} The available footer actions
							 * @function
							 * @alias sap.fe.test.ObjectPage.actions#onFooter
							 * @public
							 */
							onFooter: function () {
								return new FooterActionsOP(_getOverflowToolbarBuilder(this, { id: OPFooterId }), {
									id: OPFooterId
								});
							},
							/**
							 * Returns a {@link sap.fe.test.api.HeaderActions} instance.
							 *
							 * @returns {sap.fe.test.api.HeaderActions} The available header actions
							 * @function
							 * @alias sap.fe.test.ObjectPage.actions#onHeader
							 * @public
							 */
							onHeader: function () {
								return new HeaderActions(_getHeaderBuilder(this, { id: ObjectPageLayoutId }), {
									id: ObjectPageLayoutId,
									headerId: OPHeaderId,
									headerContentId: OPHeaderContentId,
									headerContentContainerId: OPHeaderContentContainerId,
									viewId: ViewId,
									paginatorId: PaginatorId,
									breadCrumbId: BreadCrumbId
								});
							},
							/**
							 * Returns a {@link sap.fe.test.api.FormActions} instance.
							 *
							 * @param {sap.fe.test.api.FormIdentifier | string} vFormIdentifier The identifier of the form, or its title
							 * @returns {sap.fe.test.api.FormActions} The available form actions
							 * @function
							 * @alias sap.fe.test.ObjectPage.actions#onForm
							 * @public
							 */
							onForm: function (vFormIdentifier) {
								if (!Utils.isOfType(vFormIdentifier, String)) {
									if (vFormIdentifier.section) {
										vFormIdentifier.id = OPSubSectionIdPrefix + "::" + vFormIdentifier.section;
										vFormIdentifier.fullSubSectionId = ViewId + "--" + vFormIdentifier.id;
									}
									if (vFormIdentifier.fieldGroup) {
										vFormIdentifier.fieldGroupId = vFormIdentifier.isHeaderFacet
											? OPFormContainerHeaderFacetsIdPrefix + "::" + vFormIdentifier.fieldGroup
											: OPFormContainerIdPrefix + "::" + vFormIdentifier.fieldGroup;
									}
								}
								return new FormActions(_getFormBuilder(this, vFormIdentifier), vFormIdentifier);
							},
							/**
							 * Collapses or expands the page header.
							 *
							 * @param {boolean} [bCollapse] Defines whether header should be collapsed, else it gets expanded (default)
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @function
							 * @name sap.fe.test.ObjectPage.actions#iCollapseExpandPageHeader
							 * @public
							 */
							iCollapseExpandPageHeader: function (bCollapse) {
								return this._iCollapseExpandPageHeader(bCollapse);
							},
							iClickQuickViewMoreLinksButton: function () {
								return OpaBuilder.create(this)
									.hasType("sap.m.Button")
									.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "info.POPOVER_DEFINE_LINKS"))
									.doPress()
									.description("Pressing 'More Links' button")
									.execute();
							},
							iClickQuickViewCancelButton: function () {
								return OpaBuilder.create(this)
									.hasType("sap.m.Button")
									.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.CANCEL"))
									.doPress()
									.description("Pressing Quickview 'Cancel' button")
									.execute();
							},
							iClickQuickViewTitleLink: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.isDialogElement(true)
									.hasProperties({ text: sText })
									.doPress()
									.description("Navigating via quickview title link '" + sText + "'")
									.execute();
							},
							iClickLinkWithText: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.hasProperties({ text: sText })
									.doPress()
									.description("Navigating via link '" + sText + "'")
									.execute();
							},
							iClickObjectStatus: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.ObjectStatus")
									.hasProperties({ text: sText })
									.doPress()
									.description("Press Object Status '" + sText + "'")
									.execute();
							},
							iCheckLinksCount: function (count) {
								return OpaBuilder.create(this)
									.hasType("sap.m.ColumnListItem")
									.check(function (targets) {
										if (targets.length === count) {
											return true;
										} else {
											return false;
										}
									}, true)
									.description("Seeing QuickView Card with " + count + " target applications in ObjectPage")
									.execute();
							},
							iEnableLink: function (sText) {
								var vAggregationMatcher = FEBuilder.Matchers.deepAggregationMatcher("cells/items/items", [
									OpaBuilder.Matchers.properties({ text: sText })
								]);
								return OpaBuilder.create(this)
									.hasType("sap.m.ColumnListItem")
									.has(vAggregationMatcher)
									.doPress("selectMulti")
									.description("The CheckBox for link " + sText + " is selected")
									.execute();
							},
							iPressKeyboardShortcutOnSection: function (sShortcut, mProperties) {
								return this._iPressKeyboardShortcut(undefined, sShortcut, mProperties, "sap.uxap.ObjectPageSection");
							},
							/**
							 * Navigates to or focuses on the defined section.
							 *
							 * @param {string | sap.fe.test.api.SectionIdentifier} vSectionIdentifier The identifier of a section, or its label
							 * if passed as an object, the following pattern will be considered:
							 * <code><pre>
							 * {
							 *     section: <string>,
							 *     subSection: <string>
							 * }
							 * </pre></code>
							 * to open the editable header section use pattern:
							 * <code><pre>
							 * {
							 *     section: "EditableHeaderSection"
							 * }
							 * </pre></code>
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @function
							 * @name sap.fe.test.ObjectPage.actions#iGoToSection
							 * @public
							 */
							iGoToSection: function (vSectionIdentifier) {
								var oBuilder = OpaBuilder.create(this).hasId(AnchorBarId);

								if (
									Utils.isOfType(vSectionIdentifier, Object) &&
									typeof vSectionIdentifier.section === "string" &&
									typeof vSectionIdentifier.subSection === "string"
								) {
									// open sub-section via menu
									var oMenuButton = { section: vSectionIdentifier.section };
									return oBuilder
										.has(_createSectionMatcher(oMenuButton, OPSectionIdPrefix))
										.doOnChildren(
											OpaBuilder.create(this)
												.hasType("sap.m.Button")
												.has(
													OpaBuilder.Matchers.childrenMatcher(
														OpaBuilder.create(this).hasType("sap.ui.core.Icon"),
														true
													)
												)
												.doPress()
										)
										.success(function () {
											return _createMenuActionExecutorBuilder(
												vSectionIdentifier.subSection,
												OPSubSectionIdPrefix
											).execute();
										})

										.description("Selecting section " + vSectionIdentifier.section)
										.execute();
								} else {
									// open section by string (section label) or by object with section parameter
									return oBuilder
										.has(_createSectionMatcher(vSectionIdentifier, OPSectionIdPrefix))
										.doPress()
										.description("Selecting section " + (vSectionIdentifier.section || vSectionIdentifier))
										.execute();
								}
							},
							/**
							 * TODO This function is only here for legacy reasons and therefore private. Use iGoToSection instead.
							 *
							 * @param {string} sName The name of the section
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @private
							 */
							iOpenSectionWithTitle: function (sName) {
								return OpaBuilder.create(this)
									.timeout(1)
									.check(function () {
										return false;
									})
									.error(
										"Test function iOpenSectionWithTitle() is deprecated - please use function iGoToSection() with the same parameters"
									)
									.execute();
							},

							iEnterValueForFieldInEditableHeader: function (sValue) {
								return FieldBuilder.create(this)
									.hasId(ViewId + "--fe::" + EditableHeaderTitleId)
									.doEnterText(sValue)
									.description("Entering '" + sValue + " in field ")
									.execute();
							},
							iClickOnMessageButton: function () {
								return OpaBuilder.create(this)

									.hasType("sap.fe.macros.messages.MessageButton")
									.doPress()
									.description("Clicked on Message Button")
									.execute();
							},
							iCheckMessageButtonTooltip: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.fe.macros.messages.MessageButton")
									.check(function (oControl) {
										return oControl[0].getTooltip() === sText;
									}, true)
									.description("Checking tooltip of MessageButton")
									.execute();
							},
							iClickOnMessage: function (oMessageInfo) {
								return OpaBuilder.create(this)
									.hasType("sap.m.MessageListItem")
									.hasProperties({
										title: oMessageInfo.MessageText,
										groupAnnouncement: oMessageInfo.GroupLabel
									})
									.isDialogElement(true)
									.description("MessageItem with correct text and group label")
									.doOnChildren(
										OpaBuilder.create(this)
											.hasType("sap.m.Link")
											.hasProperties({ text: oMessageInfo.MessageText })
											.doPress()
											.description("Click on the message")
									)
									.execute();
							},
							iClickBackOnMessageView: function () {
								return OpaBuilder.create(this)
									.hasType("sap.m.MessageView")
									.isDialogElement(true)
									.doOnChildren(
										OpaBuilder.create(this)
											.hasType("sap.m.Button")
											.hasProperties({ icon: "sap-icon://nav-back" })
											.doPress()
											.description("Click on the message view back")
									)
									.execute();
							}
						},
						/**
						 * ObjectPage assertions
						 *
						 * @namespace sap.fe.test.ObjectPage.assertions
						 * @extends sap.fe.test.TemplatePage.assertions
						 * @public
						 */
						assertions: {
							/**
							 * Returns a {@link sap.fe.test.api.TableAssertions} instance for the specified table.
							 *
							 * @param {string | sap.fe.test.api.TableIdentifier} vTableIdentifier The identifier of the table, or its header title
							 * @returns {sap.fe.test.api.TableAssertions} The available table assertions
							 * @function
							 * @name sap.fe.test.ObjectPage.assertions#onTable
							 * @public
							 */
							onTable: function (vTableIdentifier) {
								if (!Utils.isOfType(vTableIdentifier, String) && !vTableIdentifier.id) {
									vTableIdentifier = { id: getTableId(vTableIdentifier.property, vTableIdentifier.qualifier) };
								}
								return this._onTable(vTableIdentifier);
							},
							onChart: function (vChartIdentifier) {
								var sChartId;
								if (vChartIdentifier) {
									sChartId = !Utils.isOfType(vChartIdentifier, String)
										? getChartId(vChartIdentifier.property)
										: vChartIdentifier;
								}
								return this._onChart({
									id: sChartId
								});
							},
							/**
							 * Returns a {@link sap.fe.test.api.FilterBarAssertions} instance.
							 *
							 * @param {sap.fe.test.api.FilterBarIdentifier | string} vFilterBarIdentifier The identifier of the filterbar
							 * @returns {sap.fe.test.api.FilterBarAssertions} The available filter bar assertions
							 * @function
							 * @alias sap.fe.test.ObjectPage.assertions#onFilterBar
							 * @public
							 */
							onFilterBar: function (vFilterBarIdentifier) {
								var vIdentifier =
									typeof vFilterBarIdentifier === "string" ? { id: vFilterBarIdentifier } : vFilterBarIdentifier;
								return this._onFilterBar(vIdentifier);
							},
							/**
							 * Returns a {@link sap.fe.test.api.FooterAssertionsOP} instance.
							 *
							 * @returns {sap.fe.test.api.FooterAssertionsOP} The available footer assertions
							 * @function
							 * @alias sap.fe.test.ObjectPage.assertions#onFooter
							 * @public
							 */
							onFooter: function () {
								return new FooterAssertionsOP(_getOverflowToolbarBuilder(this, { id: OPFooterId }), { id: OPFooterId });
							},
							/**
							 * Returns a {@link sap.fe.test.api.HeaderAssertions} instance.
							 *
							 * @returns {sap.fe.test.api.HeaderAssertions} The available header assertions
							 * @function
							 * @alias sap.fe.test.ObjectPage.assertions#onHeader
							 * @public
							 */
							onHeader: function () {
								return new HeaderAssertions(_getHeaderBuilder(this, { id: ObjectPageLayoutId }), {
									id: ObjectPageLayoutId,
									headerId: OPHeaderId,
									headerContentId: OPHeaderContentId,
									headerContentContainerId: OPHeaderContentContainerId,
									viewId: ViewId,
									paginatorId: PaginatorId,
									breadCrumbId: BreadCrumbId
								});
							},
							/**
							 * Returns a {@link sap.fe.test.api.FormAssertions} instance.
							 *
							 * @param {sap.fe.test.api.FormIdentifier | string} vFormIdentifier The identifier of the form, or its title
							 * @returns {sap.fe.test.api.FormAssertions} The available form actions
							 * @function
							 * @alias sap.fe.test.ObjectPage.assertions#onForm
							 * @public
							 */
							onForm: function (vFormIdentifier) {
								if (!Utils.isOfType(vFormIdentifier, String)) {
									if (vFormIdentifier.section) {
										vFormIdentifier.id = OPSubSectionIdPrefix + "::" + vFormIdentifier.section;
										vFormIdentifier.fullSubSectionId = ViewId + "--" + vFormIdentifier.id;
									}
									if (vFormIdentifier.fieldGroup) {
										vFormIdentifier.fieldGroupId = vFormIdentifier.isHeaderFacet
											? OPFormContainerHeaderFacetsIdPrefix + "::" + vFormIdentifier.fieldGroup
											: OPFormContainerIdPrefix + "::" + vFormIdentifier.fieldGroup;
									}
								}
								return new FormAssertions(_getFormBuilder(this, vFormIdentifier), vFormIdentifier);
							},

							iSeeMessageButton: function (messageType, messageButtonText) {
								var message = {
									Error: {
										type: "Negative"
									},
									Warning: {
										type: "Critical"
									},
									Information: {
										type: "Neutral"
									}
								};
								return OpaBuilder.create(this)
									.hasType("sap.fe.macros.messages.MessageButton")
									.hasProperties({
										text: messageButtonText,
										type: message[messageType]["type"]
									})
									.description("Messagebutton is visible with " + message[messageType]["type"] + " button type")
									.execute();
							},

							iSeeLinkWithText: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.hasProperties({ text: sText })
									.description("Seeing link with text '" + sText + "'")
									.execute();
							},
							iSeeTextWithText: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Text")
									.hasProperties({ text: sText })
									.description("Seeing Text with text '" + sText + "'")
									.execute();
							},
							iSeeTitleWithText: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Title")
									.hasProperties({ text: sText })
									.description("Seeing Title with text '" + sText + "'")
									.execute();
							},
							iSeeContactDetailsPopover: function (sTitle) {
								return (
									OpaBuilder.create(this)
										.hasType("sap.ui.mdc.link.Panel")
										// .hasAggregation("items", [
										// 	function(oItem) {
										// 		return oItem instanceof sap.m.Label;
										// 	},
										// 	{
										// 		properties: {
										// 			text: sTitle
										// 		}
										// 	}
										// ])
										.description("Contact card with title '" + sTitle + "' is present")
										.execute()
								);
							},
							iSeeContactPopoverWithAvatarImage: function (sImageSource) {
								return OpaBuilder.create(this)
									.hasType("sap.ui.mdc.link.Panel")
									.check(function (avatars) {
										var bFound = avatars.some(function (avatar) {
											return avatar.src === sImageSource;
										});
										return bFound === false;
									}, true)
									.description("Seeing Contact Card with Avatar Image in ObjectPage")
									.execute();
							},
							iSeeQuickViewMoreLinksButton: function () {
								return OpaBuilder.create(this)
									.isDialogElement(true)
									.hasType("sap.m.Button")
									.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "info.POPOVER_DEFINE_LINKS"))
									.description("The 'More Links' button found")
									.execute();
							},
							iSeeObjectPageInDisplayMode: function () {
								return this._iSeeObjectPageInMode(PageEditMode.DISPLAY);
							},
							iSeeObjectPageInEditMode: function () {
								return this._iSeeObjectPageInMode(PageEditMode.EDITABLE);
							},
							_iSeeObjectPageInMode: function (sMode) {
								return OpaBuilder.create(this)
									.hasId(ViewId)
									.viewId(null)
									.has(function (oObjectPage) {
										return oObjectPage.getModel("ui").getProperty("/editMode") === sMode;
									})
									.description("Object Page is in mode '" + sMode + "'")
									.execute();
							},
							/**
							 * Checks a section.
							 * It is checked if a section is already loaded and therefore the data is visible to the user. This function does not check properties of the anchor bar buttons for section selection.
							 *
							 * @param {string | sap.fe.test.api.SectionIdentifier} SectionIdentifier The identifier of the section.
							 * This can either be a string containing the label of the section or an object having the pattern
							 * <code><pre>
							 * 	{
							 *  	section: <section id>
							 * 	}
							 * </pre></code>
							 * @param {object} mState Defines the expected state of the section, e.g. its visibility
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @public
							 */
							iCheckSection: function (SectionIdentifier, mState) {
								var SectionBuilder = _getObjectPageSectionBuilder(this, SectionIdentifier, OPSectionIdPrefix);
								return SectionBuilder.hasState(mState)
									.description(
										Utils.formatMessage("Checking section '{0}' having state='{1}'", SectionIdentifier, mState)
									)
									.execute();
							},
							/**
							 * TODO This function is only here for legacy reasons and therefore private. Use iCheckSection instead.
							 *
							 * @param {string} sTitle The name of the section
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @private
							 */
							iSeeSectionWithTitle: function (sTitle) {
								return this.iCheckSection(sTitle, { visible: true });
							},

							/**
							 * Checks the expected number of sections in an object page.
							 *
							 * @param {number} ExpectedNumberOfSections The number of expected sections within the object page.
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @public
							 */
							iCheckNumberOfSections: function (ExpectedNumberOfSections) {
								return FEBuilder.create(this)
									.hasId(AnchorBarId)
									.hasAggregationLength("content", ExpectedNumberOfSections)
									.description(
										Utils.formatMessage(
											"Object Page contains the expected number of {0} sections",
											ExpectedNumberOfSections
										)
									)
									.execute();
							},

							/**
							 * Checks a sub-section.
							 *
							 * @param {string | sap.fe.test.api.SectionIdentifier} SubSectionIdentifier The identifier of the sub-section to be checked for visibility.
							 * This can either be a string containing the label of the sub-section or an object having the pattern
							 * <code><pre>
							 * 	{
							 *  	section: <sub-section id>
							 * 	}
							 * </pre></code>
							 * @param {object} mState Defines the expected state of the sub-section, e.g. its visibility
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @public
							 */
							iCheckSubSection: function (SubSectionIdentifier, mState) {
								var SubSectionBuilder = _getObjectPageSubSectionBuilder(this, SubSectionIdentifier, OPSubSectionIdPrefix);
								return SubSectionBuilder.hasState(mState)
									.description(
										Utils.formatMessage("Checking sub-section '{0}' having state='{1}'", SubSectionIdentifier, mState)
									)
									.execute();
							},
							/**
							 * TODO This function is only here for legacy reasons and therefore private. Use iCheckSubSection instead.
							 *
							 * @param {string} sTitle The name of the sub-section
							 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
							 * @private
							 */
							iSeeSubSectionWithTitle: function (sTitle) {
								return this.iCheckSubSection(sTitle, { visible: true });
							},

							iSeeSectionButtonWithTitle: function (sTitle, mState) {
								return FEBuilder.create(this)
									.hasId(AnchorBarId)
									.has(
										OpaBuilder.Matchers.children(
											FEBuilder.Matchers.states(
												mergeObjects({}, { controlType: "sap.m.Button", text: sTitle }, mState)
											)
										)
									)
									.description(
										Utils.formatMessage("Seeing section button with title '{0}' and state='{1}'", sTitle, mState)
									)
									.execute();
							},
							iSeeFlpLink: function (sDescription) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.isDialogElement(true)
									.hasProperties({ text: sDescription })
									.description("FLP link with text '" + sDescription + "' is present")
									.execute();
							},
							iSeeLabel: function (sDescription) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Label")
									.hasProperties({ text: sDescription })
									.description("Label '" + sDescription + "' is present")
									.execute();
							},
							iSeeSimpleFormWithLabel: function (sDescription) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Label")
									.isDialogElement(true)
									.hasProperties({ text: sDescription })
									.description("SimpleForm has label '" + sDescription + "' is present")
									.execute();
							},
							iSeeSimpleFormWithText: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.ui.layout.form.SimpleForm")
									.isDialogElement(true)
									.doOnChildren(OpaBuilder.create(this).hasType("sap.m.Text").hasProperties({ text: sText }))
									.description("SimpleForm has text '" + sText + "' is present")
									.execute();
							},
							iSeeSimpleFormWithLink: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.ui.layout.form.SimpleForm")
									.isDialogElement(true)
									.doOnChildren(OpaBuilder.create(this).hasType("sap.m.Link").hasProperties({ text: sText }))
									.description("SimpleForm has link '" + sText + "' is present")
									.execute();
							},
							iSeeSimpleFormWithTitle: function (sTitle) {
								return OpaBuilder.create(this)
									.hasType("sap.ui.core.Title")
									.isDialogElement(true)
									.hasProperties({ text: sTitle })
									.description("SimpleForm has label '" + sTitle + "' is present")
									.execute();
							},
							iSeeGridWithLabel: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.ui.layout.Grid")
									.isDialogElement(true)
									.doOnChildren(OpaBuilder.create(this).hasType("sap.m.Label").hasProperties({ text: sText }))
									.description("Grid Layout has label '" + sText + "' is present")
									.execute();
							},
							iSeeSelectLinksDialog: function () {
								return OpaBuilder.create(this)
									.hasType("sap.m.Title")
									.isDialogElement(true)
									.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "info.SELECTION_DIALOG_ALIGNEDTITLE"))
									.description("Seeing dialog open")
									.execute();
							},
							iDoNotSeeFlpLink: function (sDescription) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Link")
									.isDialogElement(true)
									.check(function (links) {
										var bFound = links.some(function (link) {
											return link.getText() === sDescription;
										});
										return bFound === false;
									}, true)
									.description("FLP link with text '" + sDescription + "' is not found")
									.execute();
							},
							iSeeTextInQuickViewForm: function (sText) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Text")
									.isDialogElement(true)
									.hasProperties({ text: sText })
									.description("Seeing label with text '" + sText + "'")
									.execute();
							},
							iSeeCreateConfirmation: function () {
								return this._iSeeTheMessageToast(oResourceBundleCore.getText("C_TRANSACTION_HELPER_OBJECT_CREATED"));
							},
							iSeeSaveConfirmation: function () {
								return this._iSeeTheMessageToast(oResourceBundleCore.getText("C_TRANSACTION_HELPER_OBJECT_SAVED"));
							},
							iSeeDeleteConfirmation: function () {
								return this._iSeeTheMessageToast(oResourceBundleCore.getText("C_TRANSACTION_HELPER_DELETE_TOAST_SINGULAR"));
							},
							iSeeConfirmMessageBoxWithTitle: function (sTitle) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Dialog")
									.isDialogElement(true)
									.hasProperties({ title: sTitle })
									.description("Seeing Message dialog open")
									.execute();
							},
							iSeeMoreFormContent: function (sSectionId) {
								return OpaBuilder.create(this)
									.hasId(OPFormIdPrefix + "::" + sSectionId + "::MoreContent")
									.description("Seeing More Form Content in " + sSectionId)
									.execute();
							},
							iDoNotSeeMoreFormContent: function (sSectionId) {
								return OpaBuilder.create(this)
									.hasType("sap.ui.layout.form.Form")
									.check(function (aElements) {
										var bFound = aElements.some(function (oElement) {
											return oElement.getId().includes(sSectionId + "::MoreContent");
										});
										return bFound === false;
									})
									.description("Not Seeing More Form Content in " + sSectionId)
									.execute();
							},
							iSeeControlVMTableTitle: function (sTitle, sNavProperty) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Title")
									.hasId(getTableId(sNavProperty) + "::VM-vm-text")
									.hasProperties({ text: sTitle })
									.description("Seeing variant title '" + sTitle + "'")
									.execute();
							},
							iSeeMessageView: function () {
								return OpaBuilder.create(this)
									.hasType("sap.m.MessageView")
									.isDialogElement(true)
									.description("MessageView is visible")
									.execute();
							},
							iCheckMessageItemsOrder: function (aBoundMessagesInfo) {
								return OpaBuilder.create(this)
									.hasType("sap.m.MessageView")
									.check(function (oMessageView) {
										var messages = oMessageView[0].getItems();
										var aNewBoundMessagesInfo = [];
										if (aBoundMessagesInfo instanceof Array) {
											aNewBoundMessagesInfo = aBoundMessagesInfo;
										} else {
											Object.keys(aBoundMessagesInfo).forEach(function (oElement) {
												aNewBoundMessagesInfo.push(aBoundMessagesInfo[oElement]);
											});
										}
										return (
											messages[0].getGroupName() === aNewBoundMessagesInfo[0].GroupLabel &&
											messages[1].getGroupName() === aNewBoundMessagesInfo[1].GroupLabel &&
											messages[0].getTitle() === aNewBoundMessagesInfo[0].MessageText &&
											messages[1].getTitle() === aNewBoundMessagesInfo[1].MessageText
										);
									}, true)
									.isDialogElement(true)
									.description("MessageItems are correctly ordered")
									.execute();
							},

							iCheckMessageItemProperties: function (oBoundMessageInfo, iMessagePosition) {
								return OpaBuilder.create(this)
									.hasType("sap.m.MessageView")
									.check(function (oMessageView) {
										var messages = oMessageView[0].getItems();
										var bMessageObjectHasExpectedValues =
											messages[iMessagePosition].getGroupName() === oBoundMessageInfo.GroupLabel &&
											messages[iMessagePosition].getTitle() === oBoundMessageInfo.MessageText &&
											messages[iMessagePosition].getSubtitle() === oBoundMessageInfo.SubTitle &&
											messages[iMessagePosition].getActiveTitle() === oBoundMessageInfo.ActiveTitle;
										if (oBoundMessageInfo.Description) {
											return (
												bMessageObjectHasExpectedValues &&
												messages[iMessagePosition].getGroupName() === oBoundMessageInfo.GroupLabel
											);
										}
										return bMessageObjectHasExpectedValues;
									}, true)
									.isDialogElement(true)
									.description("MessageItem is correctly displayed")
									.execute();
							},
							iCheckVisibilityOfButtonWithText: function (sText, bExpectedVisibility) {
								return OpaBuilder.create(this)
									.hasType("sap.m.Button")
									.mustBeVisible(bExpectedVisibility)
									.hasProperties({ text: sText, visible: bExpectedVisibility })
									.description("Button '" + sText + "' is " + (bExpectedVisibility ? "visible" : "NOT visible"))
									.execute();
							},
							iCheckFieldVisibilityInMassEditDialog: function (sFieldID, sValue) {
								return OpaBuilder.create(this)
									.isDialogElement()
									.hasType("sap.m.ComboBox")
									.check(function (aControls) {
										var bControlExists = aControls.some(function (oControl) {
											return oControl.getId() === sFieldID;
										});
										return bControlExists === sValue;
									})
									.description("Checking visibility of field in mass edit dialog")
									.execute();
							}
						}
					}
				].concat(aAdditionalPages)
			);
		}

		return ObjectPage;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/Shell", ["sap/ui/test/OpaBuilder", "sap/ui/test/Opa5", "sap/fe/test/Utils"], function (OpaBuilder, Opa5, Utils) {
	"use strict";

	/**
	 * Constructs a test page definition for the shell.
	 *
	 * @class Provides a test page definition for the shell.
	 *
	 * When using {@link sap.fe.test.JourneyRunner}, this page is made available by default via <code>onTheShell</code>.
	 * @param {...object} [aAdditionalPageDefinitions] Additional custom page functions, provided in an object containing <code>actions</code> and <code>assertions</code>
	 * @returns {sap.fe.test.Shell} A shell page definition
	 * @name sap.fe.test.Shell
	 * @public
	 */
	function ShellPage(aAdditionalPageDefinitions) {
		aAdditionalPageDefinitions = Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments, 0);
		return Utils.mergeObjects.apply(
			Utils,
			[
				{
					actions: {
						/**
						 * Navigates back via shell back button.
						 *
						 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
						 * @function
						 * @name sap.fe.test.Shell#iNavigateBack
						 * @public
						 */
						iNavigateBack: function () {
							return OpaBuilder.create(this).hasId("backBtn").doPress().description("Navigating back via shell").execute();
						},
						/**
						 * Navigates to the launch pad via the home button.
						 *
						 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
						 * @function
						 * @name sap.fe.test.Shell#iNavigateHome
						 * @public
						 */
						iNavigateHome: function () {
							return OpaBuilder.create(this)
								.hasId("shell-header")
								.do(function () {
									// the logo is not a UI5 control
									var oTestWindow = Opa5.getWindow();
									oTestWindow.document.getElementById("shell-header-logo").click();
								})
								.description("Pressing Home button in Shell header")
								.execute();
						},
						/**
						 * Opens the navigation menu in the shell header.
						 *
						 * @param {string} [NavigationTitle] The title of the navigation menu to be clicked. If undefined the menu is identified by the internal id only.
						 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
						 * @function
						 * @name sap.fe.test.Shell#iOpenNavigationMenu
						 * @public
						 */
						iOpenNavigationMenu: function (NavigationTitle) {
							return OpaBuilder.create(this)
								.pollingInterval(1000) // the shell needs some time to prepare the navigation menu
								.hasId("shellAppTitle")
								.has(function (oShellObject) {
									return NavigationTitle ? oShellObject.getText() === NavigationTitle : true;
								})
								.doPress()
								.description("Expanding Shell Navigation Menu")
								.execute();
						},
						/**
						 * Navigates via a navigation item in the shell's navigation menu.
						 *
						 * @param {string} sItem The label of the navigation item
						 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
						 * @function
						 * @name sap.fe.test.Shell#iNavigateViaMenu
						 * @public
						 */
						iNavigateViaMenu: function (sItem) {
							return OpaBuilder.create(this)
								.hasId("sapUshellNavHierarchyItems")
								.doOnAggregation("items", OpaBuilder.Matchers.properties({ title: sItem }), OpaBuilder.Actions.press())
								.description(Utils.formatMessage("Navigating to '{0}' via Shell Navigation Menu", sItem))
								.execute();
						},
						/**
						 * Selecting a tile in the launchpad by its target app, for example <code>iPressTile("SalesOrder-manage")</code>.
						 *
						 * @param {string} sTarget The target application (hash)
						 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
						 * @function
						 * @name sap.fe.test.Shell#iPressTile
						 * @public
						 */
						iPressTile: function (sTarget) {
							return this.waitFor({
								controlType: "sap.ushell.ui.launchpad.Tile",
								matchers: function (oTile) {
									return oTile.getTarget() === "#" + sTarget;
								},
								actions: function (oTile) {
									oTile.getTileViews()[0].$().trigger("tap");
								},
								success: function (oTile) {
									Opa5.assert.ok(true, Utils.formatMessage("Clicking on tile with target '{0}'", sTarget));
								},
								errorMessage: "Could not find the tile"
							});
						},
						iOpenDefaultValues: function () {
							return OpaBuilder.create(this)
								.hasId("userActionsMenuHeaderButton")
								.doPress()
								.description("Opening FLP Default Values dialog")
								.execute();
						},
						iEnterAValueForUserDefaults: function (oField, vValue) {
							return OpaBuilder.create(this)
								.hasProperties({
									name: oField.field
								})
								.isDialogElement()
								.doEnterText(vValue)
								.description("Entering text in the field '" + oField.field + "' with value '" + oField + "'")
								.execute();
						},
						iSelectAListItem: function (sOption) {
							return OpaBuilder.create(this)
								.hasType("sap.m.StandardListItem")
								.hasProperties({ title: sOption })
								.doPress()
								.description("Selecting item: " + sOption)
								.execute();
						},
						iLaunchExtendedParameterDialog: function (sProperty) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Button")
								.isDialogElement()
								.hasProperties({
									text: "Additional Values"
								})
								.doPress()
								.description("Launching Extended Parameter Dialog")
								.execute();
						},
						iClickOnButtonWithText: function (sText) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Button")
								.hasProperties({
									text: sText
								})
								.doPress()
								.description("Clicking on button with text: " + sText)
								.execute();
						},
						iClickOnButtonWithIcon: function (sIcon) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Button")
								.hasProperties({
									icon: "sap-icon://" + sIcon
								})
								.doPress()
								.description("Clicking on button with icon: " + sIcon)
								.execute();
						}
					},
					assertions: {
						iSeeFlpDashboard: function () {
							return OpaBuilder.create(this).hasId("sapUshellDashboardPage").description("Seeing FLP Dashboard").execute();
						},
						iShouldSeeTheAppTile: function (sTitle) {
							return OpaBuilder.create(this)
								.hasType("sap.ushell.ui.launchpad.Tile")
								.hasProperties({
									target: sTitle
								})
								.description("Seeing Tile " + sTitle)
								.execute();
						},
						iSeeShellNavHierarchyItem: function (sItemTitle, iItemPosition, iItemNumbers, sItemDesc) {
							return OpaBuilder.create(this)
								.viewId(null)
								.hasId("sapUshellNavHierarchyItems")
								.hasAggregationLength("items", iItemNumbers)
								.has(OpaBuilder.Matchers.aggregationAtIndex("items", iItemPosition - 1))
								.hasProperties({ title: sItemTitle, description: sItemDesc })
								.description(
									Utils.formatMessage(
										"Checking Navigation Hierarchy Items ({2}): Name={0}, Position={1}, Description={3}",
										sItemTitle,
										iItemPosition,
										iItemNumbers,
										sItemDesc
									)
								)
								.execute();
						},
						iSeeShellAppTitle: function (sTitle) {
							return OpaBuilder.create(this)
								.viewId(null)
								.hasId("shellAppTitle")
								.hasProperties({ text: sTitle })
								.description(sTitle + " is the Shell App Title")
								.execute();
						},
						/**
						 * Check an intent-based navigation.
						 * The function checks the semantic object and the action within the URL of an application.
						 * Optionally, further URL parameters can be checked.
						 *
						 * @param {string} sSemanticObject The semantic object of the application
						 * @param {string} sAction The action of the application
						 * @param {Array} [aURLParams] More URL parameters to be checked. The pattern is:
						 * <code><pre>
						 * 	[{
						 * 		property: &lt;expected name of URL parameter>,
						 * 		value: &lt;expected value of URL parameter>
						 *  }]
						 * </pre></code>
						 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
						 * @function
						 * @name sap.fe.test.Shell#iCheckIntentBasedNavigation
						 * @public
						 */
						iCheckIntentBasedNavigation: function (sSemanticObject, sAction, aURLParams) {
							function _hasAllURLParameters(oURLParams, aInputURLParams) {
								try {
									aInputURLParams.forEach(function (oParam) {
										if (oURLParams.hasOwnProperty(oParam.property)) {
											if (oURLParams[oParam.property][0] !== oParam.value) {
												throw "input parameter not equal to actual URL parameter";
											}
										} else {
											throw "input parameter not found in URL";
										}
									});
									return true;
								} catch (error) {
									return false;
								}
							}

							return OpaBuilder.create(this)
								.check(function () {
									var oParsedHash = Opa5.getWindow()
										.sap.ushell.Container.getService("URLParsing")
										.parseShellHash(Opa5.getWindow().document.location.hash);
									if (oParsedHash.semanticObject === sSemanticObject && oParsedHash.action === sAction) {
										return !aURLParams || _hasAllURLParameters(oParsedHash.params, aURLParams) ? true : false;
									} else {
										return false;
									}
								})
								.error(function () {
									var sHash = Opa5.getWindow().document.location.hash,
										sLogErr = "Expected properties/values: ";
									Opa5.assert.ok(false, "Current hash value: " + sHash);
									Opa5.assert.ok(false, "Expected semantic object: " + sSemanticObject);
									Opa5.assert.ok(false, "Expected action: " + sAction);
									if (aURLParams) {
										aURLParams.forEach(function (oParam) {
											sLogErr = sLogErr + oParam.property + "=" + oParam.value + ",";
										});
										Opa5.assert.ok(false, sLogErr);
									}
								})
								.success(
									"Navigation successful. SemanticObject: " +
										sSemanticObject +
										", Action: " +
										sAction +
										" and all URL parameters are valid."
								)
								.execute();
						}
					}
				}
			].concat(aAdditionalPageDefinitions)
		);
	}

	return ShellPage;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
/**
 * Actions and assertions to be used with a page hosted in an FCL
 */
sap.ui.predefine("sap/fe/test/Stubs", ["sap/ui/test/OpaBuilder"], function (OpaBuilder) {
	"use strict";
	var Stubs = {
		prepareStubs: function (oWindow) {
			if (!oWindow.sapFEStubs) {
				oWindow.sapFEStubs = {};
			}
		},

		stubAll: function (oWindow) {
			this.stubConfirm(oWindow);
			this.stubMessageToast(oWindow);
			this.stubMisc(oWindow);
		},

		restoreAll: function (oWindow) {
			this.restoreConfirm(oWindow);
			this.restoreMessageToast(oWindow);
			this.restoreMisc(oWindow);
		},

		stubConfirm: function (oWindow) {
			Stubs.prepareStubs(oWindow);

			oWindow.sapFEStubs._confirmOriginal = oWindow.confirm;
			oWindow.confirm = function (sMessage) {
				throw "Unexpected confirm dialog - " + sMessage;
			};
		},

		restoreConfirm: function (oWindow) {
			if (!oWindow.sapFEStubs || !oWindow.sapFEStubs._confirmOriginal) {
				return;
			}
			oWindow.confirm = oWindow.sapFEStubs._confirmOriginal;
			delete oWindow.sapFEStubs._confirmOriginal;
		},

		stubMessageToast: function (oWindow) {
			Stubs.prepareStubs(oWindow);
			var oMessageToast = oWindow.sap.ui.require("sap/m/MessageToast");
			oWindow.sapFEStubs._sapMMessageToastShowOriginal = oMessageToast.show;
			oWindow.sapFEStubs.setLastToastMessage = function (sMessage) {
				oWindow.sapFEStubs._sapMMessageToastLastMessage = sMessage;
			};
			oWindow.sapFEStubs.getLastToastMessage = function () {
				return oWindow.sapFEStubs._sapMMessageToastLastMessage;
			};
			oMessageToast.show = function (sMessage) {
				oWindow.sapFEStubs.setLastToastMessage(sMessage);
				return oWindow.sapFEStubs._sapMMessageToastShowOriginal.apply(this, arguments);
			};
		},
		restoreMessageToast: function (oWindow) {
			if (!oWindow.sapFEStubs || !oWindow.sapFEStubs._sapMMessageToastShowOriginal) {
				return;
			}
			var oMessageToast = oWindow.sap.ui.require("sap/m/MessageToast");
			oMessageToast.show = oWindow.sapFEStubs._sapMMessageToastShowOriginal;
			delete oWindow.sapFEStubs._sapMMessageToastShowOriginal;
			delete oWindow.sapFEStubs._sapMMessageToastLastMessage;
			delete oWindow.sapFEStubs.setLastToastMessage;
			delete oWindow.sapFEStubs.getLastToastMessage;
		},

		stubMisc: function (oWindow) {
			Stubs.prepareStubs(oWindow);

			// TODO workaround
			// pressing Enter in the creation row triggers creation of a new row, but we need Enter key for value validation
			oWindow.sap.ui.require(["sap/ui/table/CreationRow"], function (oCreationRow) {
				oWindow.sapFEStubs._sapUiTableCreationRowOnSapEnter = oCreationRow.prototype.onsapenter;
				delete oCreationRow.prototype.onsapenter;
			});
		},

		restoreMisc: function (oWindow) {
			if (!oWindow.sapFEStubs || !oWindow.sapFEStubs._sapUiTableCreationRowOnSapEnter) {
				return;
			}

			var oCreationRow = oWindow.sap.ui.require("sap/ui/table/CreationRow");
			oCreationRow.prototype.onsapenter = oWindow.sapFEStubs._sapUiTableCreationRowOnSapEnter;
			delete oWindow.sapFEStubs._sapUiTableCreationRowOnSapEnter;
		}
	};

	return Stubs;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/TemplatePage", [
		"sap/ui/test/OpaBuilder",
		"sap/ui/test/Opa5",
		"sap/ui/core/util/ShortcutHelper",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFieldBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/fe/test/builder/DialogBuilder",
		"sap/fe/test/api/DialogType",
		"sap/fe/test/api/DialogActions",
		"sap/fe/test/api/DialogAssertions",
		"sap/fe/test/api/DialogMessageActions",
		"sap/fe/test/api/DialogMessageAssertions",
		"sap/fe/test/api/DialogValueHelpActions",
		"sap/fe/test/api/DialogValueHelpAssertions",
		"sap/fe/test/api/DialogCreateActions",
		"sap/fe/test/api/DialogCreateAssertions",
		"sap/fe/test/api/DialogMassEditActions",
		"sap/fe/test/api/DialogMassEditAssertions",
		"sap/fe/test/api/TableAssertions",
		"sap/fe/test/api/TableActions",
		"sap/fe/test/api/ChartAssertions",
		"sap/fe/test/api/ChartActions",
		"sap/fe/test/builder/MdcFilterBarBuilder",
		"sap/fe/test/api/FilterBarAssertions",
		"sap/fe/test/api/FilterBarActions",
		"sap/base/util/deepEqual",
		"sap/ushell/resources"
	],
	function (
		OpaBuilder,
		Opa5,
		ShortcutHelper,
		Utils,
		FEBuilder,
		FieldBuilder,
		MacroFieldBuilder,
		TableBuilder,
		DialogBuilder,
		DialogType,
		DialogActions,
		DialogAssertions,
		DialogMessageActions,
		DialogMessageAssertions,
		DialogValueHelpActions,
		DialogValueHelpAssertions,
		DialogCreateActions,
		DialogCreateAssertions,
		DialogMassEditActions,
		DialogMassEditAssertions,
		TableAssertions,
		TableActions,
		ChartAssertions,
		ChartActions,
		FilterBarBuilder,
		FilterBarAssertions,
		FilterBarActions,
		deepEqual,
		resources
	) {
		"use strict";

		function _getTableBuilder(vOpaInstance, vTableIdentifier) {
			var oTableBuilder = TableBuilder.create(vOpaInstance);
			if (Utils.isOfType(vTableIdentifier, String)) {
				oTableBuilder.hasProperties({ header: vTableIdentifier });
			} else {
				oTableBuilder.hasId(vTableIdentifier.id);
			}
			return oTableBuilder;
		}

		function _getFilterBarBuilder(vOpaInstance, vFilterBarIdentifier) {
			return FilterBarBuilder.create(vOpaInstance).hasId(vFilterBarIdentifier.id);
		}

		function _getDialogAPI(vOpaInstance, vDialogIdentifier, bAction) {
			if (Utils.isOfType(vDialogIdentifier, String, true)) {
				vDialogIdentifier = { type: DialogType.Confirmation, title: vDialogIdentifier };
			}

			var oDialogBuilder = DialogBuilder.create(vOpaInstance);
			switch (vDialogIdentifier.type) {
				case DialogType.ValueHelp:
					// oDialogBuilder.hasAggregation("content", FEBuilder.Matchers.state("controlType", "sap.ui.mdc.field.ValueHelpPanel"));
					if (vDialogIdentifier.property) {
						oDialogBuilder.has(
							FEBuilder.Matchers.id(
								RegExp(
									Utils.formatMessage("::FieldValueHelp::{0}-dialog$", vDialogIdentifier.property.replaceAll("/", "::"))
								)
							)
						);
					}
					return bAction
						? new DialogValueHelpActions(oDialogBuilder, vDialogIdentifier)
						: new DialogValueHelpAssertions(oDialogBuilder, vDialogIdentifier);
				case DialogType.Error:
					oDialogBuilder.hasProperties({
						icon: "sap-icon://error",
						title: "Error" // TODO localized?!
					});
					return bAction
						? new DialogActions(oDialogBuilder, vDialogIdentifier)
						: new DialogAssertions(oDialogBuilder, vDialogIdentifier);
				case DialogType.Message:
					// oDialogBuilder.hasAggregation("content", FEBuilder.Matchers.state("controlType", "sap.m.MessageView"));
					return bAction
						? new DialogMessageActions(oDialogBuilder, vDialogIdentifier)
						: new DialogMessageAssertions(oDialogBuilder, vDialogIdentifier);
				case DialogType.Create:
					return bAction
						? new DialogCreateActions(oDialogBuilder, vDialogIdentifier)
						: new DialogCreateAssertions(oDialogBuilder, vDialogIdentifier);
				case DialogType.MassEdit:
					return bAction
						? new DialogMassEditActions(oDialogBuilder, vDialogIdentifier)
						: new DialogMassEditAssertions(oDialogBuilder, vDialogIdentifier);
				default:
					return bAction
						? new DialogActions(oDialogBuilder, vDialogIdentifier)
						: new DialogAssertions(oDialogBuilder, vDialogIdentifier);
			}
		}

		// assertions
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Confirmation })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onConfirmationDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.ValueHelp })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogValueHelpAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onValueHelpDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Message })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogMessageAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onMessageDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Error })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onErrorDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Action })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onActionDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Create })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogCreateAssertions} The available dialog assertions
		 * @function
		 * @name sap.fe.test.TemplatePage.assertions#onCreateDialog
		 * @public
		 */
		// actions
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Confirmation })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onConfirmationDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.ValueHelp })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogValueHelpActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onValueHelpDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Message })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogMessageActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onMessageDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Error })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onErrorDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Action })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onActionDialog
		 * @public
		 */
		/**
		 * Shortcut for <code>onDialog({ type: sap.fe.test.api.DialogType.Create })</code>.
		 *
		 * @returns {sap.fe.test.api.DialogCreateActions} The available dialog actions
		 * @function
		 * @name sap.fe.test.TemplatePage.actions#onCreateDialog
		 * @public
		 */
		function generateOnDialogShortcuts() {
			var oOnDialogFunctions = {};
			Object.keys(DialogType).forEach(function (sDialogType) {
				oOnDialogFunctions["on" + sDialogType + "Dialog"] = function () {
					return this.onDialog({ type: sDialogType });
				};
			});
			return oOnDialogFunctions;
		}

		/**
		 * @class Provides a test page definition for a template page with the corresponding parameters.
		 * @param {object | string} vViewId The viewId
		 * @param {...object} [aAdditionalPageDefinitions] Additional custom page functions, provided in an object containing <code>actions</code> and <code>assertions</code>
		 * @returns {sap.fe.test.TemplatePage} A list report page definition
		 * @name sap.fe.test.TemplatePage
		 * @hideconstructor
		 * @public
		 */
		function TemplatePage(vViewId, aAdditionalPageDefinitions) {
			var sViewId = Utils.isOfType(vViewId, String) ? vViewId : vViewId.viewId,
				aAdditionalPages = Array.prototype.slice.call(arguments, 1);

			return Utils.mergeObjects.apply(
				Utils,
				[
					{
						viewId: sViewId,
						/**
						 * TemplatePage actions
						 *
						 * @namespace sap.fe.test.TemplatePage.actions
						 * @public
						 */
						actions: Utils.mergeObjects(
							{
								_onTable: function (vTableIdentifier) {
									return new TableActions(_getTableBuilder(this, vTableIdentifier), vTableIdentifier);
								},
								_onChart: function (vChartIdentifier) {
									return new ChartActions(FEBuilder, vChartIdentifier);
								},
								_onFilterBar: function (vFilterBarIdentifier) {
									return new FilterBarActions(_getFilterBarBuilder(this, vFilterBarIdentifier), vFilterBarIdentifier);
								},
								/**
								 * Returns a {@link sap.fe.test.api.DialogActions} instance.
								 *
								 * @param {string | sap.fe.test.api.DialogIdentifier} vDialogIdentifier The identifier of the dialog, or its title
								 * @returns {sap.fe.test.api.DialogActions} The available dialog actions
								 * @function
								 * @name sap.fe.test.TemplatePage.actions#onDialog
								 * @public
								 */
								onDialog: function (vDialogIdentifier) {
									return _getDialogAPI(this, vDialogIdentifier, true);
								},
								iOpenVHOnActionDialog: function (sFieldName) {
									var sFieldId = "APD_::" + sFieldName + "-inner-vhi";
									return OpaBuilder.create(this)
										.hasId(sFieldId)
										.isDialogElement()
										.doPress()
										.description("Opening value help for '" + sFieldName + "'")
										.execute();
								},
								_iPressKeyboardShortcut: function (sId, sShortcut, mProperties, sType) {
									return OpaBuilder.create(this)
										.hasId(sId)
										.hasProperties(mProperties ? mProperties : {})
										.hasType(sType)
										.do(function (oElement) {
											var oNormalizedShorcut = ShortcutHelper.parseShortcut(sShortcut);
											oNormalizedShorcut.type = "keydown";
											oElement.$().trigger(oNormalizedShorcut);
										})
										.description("Execute keyboard shortcut " + sShortcut)
										.execute();
								},
								_iCollapseExpandPageHeader: function (bCollapse) {
									var oExpandedButtonMatcher = OpaBuilder.Matchers.resourceBundle(
											"tooltip",
											"sap.f",
											"COLLAPSE_HEADER_BUTTON_TOOLTIP"
										),
										oCollapsedButtonMatcher = OpaBuilder.Matchers.resourceBundle(
											"tooltip",
											"sap.f",
											"EXPAND_HEADER_BUTTON_TOOLTIP"
										);
									return OpaBuilder.create(this)
										.hasType("sap.m.Button")
										.has(OpaBuilder.Matchers.some(oExpandedButtonMatcher, oCollapsedButtonMatcher))
										.doConditional(
											bCollapse ? oExpandedButtonMatcher : oCollapsedButtonMatcher,
											OpaBuilder.Actions.press()
										)
										.description(
											Utils.formatMessage("{0} the current Page Header", bCollapse ? "Collapsing" : "Expanding")
										)
										.execute();
								}
							},
							generateOnDialogShortcuts()
						),
						/**
						 * Assertions that are available to all template pages used in SAP Fiori elements.
						 *
						 * @namespace sap.fe.test.TemplatePage.assertions
						 * @public
						 */
						assertions: Utils.mergeObjects(
							{
								_onTable: function (vTableIdentifier) {
									return new TableAssertions(_getTableBuilder(this, vTableIdentifier), vTableIdentifier);
								},
								_onChart: function (vChartIdentifier) {
									return new ChartAssertions(FEBuilder, vChartIdentifier);
								},
								_onFilterBar: function (vFilterBarIdentifier) {
									return new FilterBarAssertions(_getFilterBarBuilder(this, vFilterBarIdentifier), vFilterBarIdentifier);
								},
								/**
								 * Returns a {@link sap.fe.test.api.DialogAssertions} instance.
								 *
								 * @param {string | sap.fe.test.api.DialogIdentifier} vDialogIdentifier The identifier of the dialog, or its title
								 * @returns {sap.fe.test.api.DialogAssertions} The available dialog actions
								 * @function
								 * @alias sap.fe.test.TemplatePage.assertions#onDialog
								 * @public
								 */
								onDialog: function (vDialogIdentifier) {
									return _getDialogAPI(this, vDialogIdentifier, false);
								},
								/**
								 * Confirms the visibility of the current page.
								 *
								 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
								 * @function
								 * @name sap.fe.test.TemplatePage.assertions#iSeeThisPage
								 * @public
								 */
								iSeeThisPage: function () {
									return OpaBuilder.create(this)
										.hasId(sViewId)
										.do(
											function (oControl) {
												//storing the placeholder object
												var oContainer = oControl.getParent().oContainer;
												var oView = oContainer;
												do {
													oView = oView.getParent();
												} while (!oView.isA("sap.ui.core.mvc.XMLView"));

												this.oPlaceholder = oView.getController().oPlaceholder;
											}.bind(this)
										)
										.viewId(null)
										.viewName(null)
										.description(Utils.formatMessage("Seeing the page '{0}'", sViewId))
										.execute();
								},

								iResetPlaceholderStatistics: function () {
									return OpaBuilder.create(this)
										.do(
											function () {
												this.oPlaceholder.resetPlaceholderDebugStats();
											}.bind(this)
										)
										.description("Placeholder reset statistics")
										.execute();
								},

								//this function check that the placeholder is hidden as soon as (10ms delay) the event pageReady or HeroesBatchReceived is fired
								iCheckPlaceholderStatistics: function (sPlaceholderListener) {
									var placeholderListener = {
										pageReady: "iPageReadyEventTimestamp",
										heroesBatchReceived: "iHeroesBatchReceivedEventTimestamp"
									};
									return OpaBuilder.create(this)
										.check(
											function () {
												var oPlaceHolderDebugStats = this.oPlaceholder.getPlaceholderDebugStats();
												var sListener = placeholderListener[sPlaceholderListener];
												if (
													oPlaceHolderDebugStats.iHidePlaceholderTimestamp - oPlaceHolderDebugStats[sListener] <
													10
												) {
													return true;
												} else {
													return false;
												}
											}.bind(this)
										)
										.description("Placeholder statistics are correct")
										.execute();
								},
								iSeeFilterDefinedOnActionDialogValueHelp: function (sAction, sVHParameter, sFieldName, sValue) {
									return OpaBuilder.create(this)
										.hasId(sAction + "::" + sVHParameter + "::FilterBar::FilterField::" + sFieldName + "-inner")
										.isDialogElement()
										.hasAggregationProperties("tokens", { text: sValue })
										.description("Seeing filter for '" + sFieldName + "' set to '" + sValue + "'")
										.execute();
								},
								_iSeeTheMessageToast: function (sText) {
									return FEBuilder.createMessageToastBuilder(sText).execute(this);
								},
								_iSeeButtonWithText: function (sText, oButtonState) {
									return FEBuilder.create(this)
										.hasType("sap.m.Button")
										.hasProperties({ text: sText })
										.hasState(oButtonState)
										.checkNumberOfMatches(1)
										.description(
											Utils.formatMessage(
												"Seeing Button with text '{0}'" + (oButtonState ? " with state: '{1}'" : ""),
												sText,
												oButtonState
											)
										)
										.execute();
								},
								iSeePageHeaderButton: function (bCollapse) {
									return OpaBuilder.create(this)
										.hasType("sap.m.Button")
										.has(
											OpaBuilder.Matchers.resourceBundle(
												"tooltip",
												"sap.f",
												bCollapse ? "COLLAPSE_HEADER_BUTTON_TOOLTIP" : "EXPAND_HEADER_BUTTON_TOOLTIP"
											)
										)
										.description("Seeing the " + (bCollapse ? "Collapse" : "Expand") + " Page Header Button")
										.execute();
								},
								iSeeTileCreationMessage: function () {
									return this._iSeeTheMessageToast(resources.i18n.getText("tile_created_msg"));
								},
								iSeeMessageStrip: function (mProperties) {
									return OpaBuilder.create(this)
										.hasType("sap.m.MessageStrip")
										.hasProperties(mProperties)
										.description(Utils.formatMessage("Seeing message strip with properties='{0}'", mProperties))
										.execute();
								},
								iSeeQuickViewPopover: function () {
									return OpaBuilder.create(this)
										.hasType("sap.ui.mdc.link.Panel")
										.description("Seeing Quick View Popover")
										.execute();
								},
								iSeeQuickViewTitleLink: function (sDescription) {
									return OpaBuilder.create(this)
										.hasType("sap.m.Link")
										.isDialogElement(true)
										.hasProperties({ text: sDescription })
										.description("QuickView Title link with text '" + sDescription + "' is found")
										.execute();
								},
								iSeeQuickViewTitleWithLabel: function (sDescription) {
									return OpaBuilder.create(this)
										.hasType("sap.m.Title")
										.isDialogElement(true)
										.hasProperties({ text: sDescription })
										.description("QuickView Title label with text '" + sDescription + "' is found")
										.execute();
								}
							},
							generateOnDialogShortcuts()
						)
					}
				].concat(aAdditionalPages)
			);
		}

		return TemplatePage;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/TemplatingTestUtils", [
		"sap/ui/model/odata/v4/ODataMetaModel",
		"sap/ui/core/util/XMLPreprocessor",
		"sap/ui/core/XMLTemplateProcessor",
		"sap/fe/macros/macroLibrary",
		"sap/fe/core/TemplateModel",
		"sap/fe/macros/ResourceModel"
	],
	function (ODataMetaModel, XMLPreprocessor, XMLTemplateProcessor, macroLibrary, TemplateModel) {
		"use strict";
		/**
		 * Unit Test parts of XML fragments for mocked metadata against expected results.
		 *
		 * @param {object} QUnit Global QUnit object
		 * @param {string} sTitle The unique module title required for the QUnit
		 * @param {object} oMetaMockData A javascript object as defined by sap.ui.model.odata.v4.lib._Requestor.read
		 * @param {*} aFragmentTests An array that specifies the fragments and the elements that should be tested
		 * 							 and the expected results as defined here:
		 *  [
		 * 	{
		 * 		sFragmentName: "sap.fe.templates.ObjectPage.view.fragments.HeaderProgressIndicator",
		 * 		mModels: { //global models for the test e.g. ResourceBundles processed during templating
		 * 			"some.libs.i18n": new ResourceBundle(...)
		 * 		},
		 * 		tests: [
		 * 			{
		 * 				mBindingContexts: { //All contexts (metadata and others) that are used in the fragment
		 *			 		"someContext": "/someEntitySet/@someTerm#someQualifier"
		 * 					"someEntityType": "/someEntitySet/"
		 *		 	},
		 * 			oExpectedResultsPerTest:  { // expected attribute values per qunittest:id
		 * 				"a": { //Attributes of the element marked as qunittest:id="a"
		 * 					"someAttribute": "{PropertyInt16} of {PropertyInt32}",
		 *  				"otherAttribute": "{= ((${PropertyInt32} > 0) ? ((${PropertyInt16} > ${PropertyInt32}) ? 100 : ((${PropertyInt16} < 0) ? 0 : (${PropertyInt16} / ${PropertyInt32} * 100))) : 0) }"
		 * 				},
		 * 				"b": { //Attributes of the element marked as qunittest:id="b"
		 * 					"someAttribute": "Property of Type Int16"
		 * 				}
		 * 			}
		 * 		}
		 * 	}
		 * 	]
		 * @param {boolean} useMacros Enables macros during the test. Typically, a test should only template an indivdual fragement, so
		 * 							  the macros are switched off. For some special tests they can be enabled with this parameter
		 * @param {any} mResourceModel Required resource model from which to get the semantic texts
		 * @param {any} sandbox Sandbox used to stub getText method for semantic key tests
		 */
		function testFragments(QUnit, sTitle, oMetaMockData, aFragmentTests, useMacros, mResourceModel, sandbox) {
			var sServiceUrl = "./test/",
				//Mock the requestor for metadata only
				oRequestor = {
					read: function () {
						return Promise.resolve(oMetaMockData);
					},
					mHeaders: {}
				},
				oMetaModel = new ODataMetaModel(oRequestor, sServiceUrl + "$metadata", undefined, null);

			//Switch of all plugins as we only template individual fragments in the test
			macroLibrary.deregister();
			if (useMacros) {
				//Force option to use macros for some tests
				macroLibrary.register();
			}

			function templateFragment(assert, oDocumentElement, mBindingContexts, mModels) {
				var oPreprocessorSettings = {
					models: Object.assign({}, mModels),
					bindingContexts: {}
				};

				//Inject models and bindingContexts
				Object.keys(mBindingContexts).forEach(function (sKey) {
					var oModel = mModels[sKey] || oMetaModel;
					if (!(oModel instanceof sap.ui.model.Model) && !(oModel instanceof sap.ui.model.odata.v4.ODataMetaModel)) {
						oModel = new TemplateModel(oModel, oMetaModel);
					}
					/* Assert to make sure the annotations are in the test metadata -> avoid misleading tests */
					assert.ok(
						typeof oModel.getObject(mBindingContexts[sKey]) !== "undefined",
						sKey + ": " + mBindingContexts[sKey] + " exists"
					);
					oPreprocessorSettings.bindingContexts[sKey] = oModel.createBindingContext(mBindingContexts[sKey]); //Value is sPath
					oPreprocessorSettings.models[sKey] = oModel;
				});

				//This context for macro testing
				if (oPreprocessorSettings.models["this"]) {
					oPreprocessorSettings.bindingContexts["this"] = oPreprocessorSettings.models["this"].createBindingContext("/");
				}

				return Promise.resolve(XMLPreprocessor.process(oDocumentElement, {}, oPreprocessorSettings));
			}

			QUnit.module("Smoke Tests for " + sTitle);

			QUnit.test("Check if metadata is available", function (assert) {
				return Promise.all([
					oMetaModel.requestObject("/").then(function (oEntityContainer) {
						assert.ok(oEntityContainer, "Entity Container found");
					}),
					oMetaModel.requestObject("/$").then(function (oMetadataDocument) {
						assert.ok(oMetadataDocument, "Metadata Document found");
					})
				]);
			});

			/*
				Test expressions in fragments
			*/
			var mResourceBundleStub;
			function fragmentTest(oFragment) {
				oFragment.fileType = oFragment.fileType || "fragment";
				QUnit.module(
					"Tests for " +
						sTitle +
						" against " +
						oFragment.fileType +
						" " +
						oFragment.sFragmentName +
						(oFragment.sDescription ? " (" + oFragment.sDescription + ")" : ""),
					{
						beforeEach: function () {
							if (mResourceModel) {
								mResourceBundleStub = sandbox.stub(mResourceModel, "getText").callsFake(function (sKey) {
									if (sKey === "T_NEW_OBJECT") {
										return "New Object";
									} else {
										return "Unnamed Object";
									}
								});
							}
						},
						afterEach: function () {
							if (mResourceBundleStub) {
								mResourceBundleStub.restore();
							}
						}
					}
				);

				oFragment.tests.forEach(function (oScope, index) {
					QUnit.test(oScope.description || "Test " + oFragment.fileType + " scope: " + index, function (assert) {
						return oMetaModel
							.requestObject("/$")
							.then(function () {
								return XMLTemplateProcessor.loadTemplatePromise(oFragment.sFragmentName, oFragment.fileType);
							})
							.then(function (oDocumentElement) {
								return templateFragment(
									assert,
									oDocumentElement,
									oScope.mBindingContexts,
									Object.assign({}, oFragment.mModels, oScope.mModels)
								);
							})
							.then(function (oDocumentElement) {
								var aElements = [].filter.call(
										oDocumentElement.ownerDocument.querySelectorAll("*"),
										hasUnitTestIdAttribute
									),
									sTestId,
									iNumberOfTestsPerformed = 0;

								function hasUnitTestIdAttribute(oElement) {
									return oElement.getAttribute("unittest:id") !== null;
								}

								function testAttributes(oElement, oExpectedResults, sSubTestId) {
									function testSingleAttribute(sAttributeName) {
										if (oExpectedResults[sAttributeName] === undefined) {
											assert.ok(
												!oElement.hasAttribute(sAttributeName),
												'unittest:id="' +
													sSubTestId +
													"\": attribute '" +
													sAttributeName +
													"' is expected not to be rendered"
											);
										} else {
											var sResult = oElement.getAttribute(sAttributeName);
											assert.strictEqual(
												sResult,
												oExpectedResults[sAttributeName],
												'unittest:id="' +
													sSubTestId +
													"\": attribute '" +
													sAttributeName +
													"' properly created as " +
													sResult
											);
										}
									}
									if (oExpectedResults) {
										iNumberOfTestsPerformed++;
										Object.keys(oExpectedResults).forEach(testSingleAttribute);
									}
								}

								aElements.forEach(performTest);

								function performTest(oElement) {
									sTestId = oElement.getAttribute("unittest:id");
									testAttributes(oElement, oScope.oExpectedResultsPerTest[sTestId], sTestId);
								}

								assert.equal(
									iNumberOfTestsPerformed,
									Object.keys(oScope.oExpectedResultsPerTest).length,
									"All tests have been executed for this test case"
								);
							})
							.catch(function (vException) {
								var sExpectedException = oScope.sExpectedException;
								if (vException && sExpectedException) {
									assert.strictEqual(
										vException.message || vException,
										sExpectedException,
										"expected exception occurred: " + sExpectedException
									);
								} else {
									throw vException;
								}
							});
					});
				});
			}

			//Run the tests
			aFragmentTests.forEach(fragmentTest);
		}

		return {
			testFragments: testFragments
		};
	}
);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/test/UI5MockHelper", ["@sap-ux/jest-mock-ui5/dist/generic", "sap/fe/core/controllerextensions/EditFlow", "sap/fe/core/controllerextensions/InternalEditFlow", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/ui/base/Event", "sap/ui/core/mvc/Controller", "sap/ui/core/mvc/View", "sap/ui/model/CompositeBinding", "sap/ui/model/odata/v4/Context", "sap/ui/model/odata/v4/ODataContextBinding", "sap/ui/model/odata/v4/ODataListBinding", "sap/ui/model/odata/v4/ODataMetaModel", "sap/ui/model/odata/v4/ODataModel", "sap/ui/model/odata/v4/ODataPropertyBinding"], function (generic, EditFlow, InternalEditFlow, InternalRouting, Share, SideEffects, Event, Controller, View, CompositeBinding, Context, ODataContextBinding, ODataListBinding, ODataMetaModel, ODataModel, ODataPropertyBinding) {
  "use strict";

  var _exports = {};
  var mock = generic.mock;
  /**
   * Factory function to create a new MockContext.
   *
   * @param oContextData A map of the different properties of the context. The value for the key '$path' will be returned by the 'getPath' method
   * @param oBinding The binding of the context
   * @param isInactive Is the context iniactive or not
   * @returns A new MockContext
   */
  function createMockContext(oContextData, oBinding, isInactive) {
    // Ugly workaround to get a proper mock pbject, as Context isn't properly exported from UI5
    const mocked = mock(Object.getPrototypeOf(Context.createNewContext(null, null, "/e")));
    mocked._isKeptAlive = false;
    mocked._contextData = oContextData || {};
    mocked._oBinding = oBinding;
    mocked._isInactive = !!isInactive;

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.odata.v4.Context";
    });
    mocked.mock.getProperty.mockImplementation(key => {
      return mocked._contextData[key];
    });
    mocked.mock.requestProperty.mockImplementation(keyOrKeys => {
      if (Array.isArray(keyOrKeys)) {
        return Promise.resolve(keyOrKeys.map(key => mocked._contextData[key]));
      }
      return Promise.resolve(mocked._contextData[keyOrKeys]);
    });
    mocked.mock.requestObject.mockImplementation(key => {
      return Promise.resolve(mocked._contextData[key]);
    });
    mocked.mock.setProperty.mockImplementation((key, value) => {
      mocked._contextData[key] = value;
      return mocked._contextData[key];
    });
    mocked.mock.getObject.mockImplementation(path => {
      let result = path ? mocked._contextData[path] : mocked._contextData;
      if (!result && path && path.indexOf("/") > -1) {
        const parts = path.split("/");
        result = parts.reduce((sum, part) => {
          sum = part ? sum[part] : sum;
          return sum;
        }, mocked._contextData);
      }
      return result;
    });
    mocked.mock.getPath.mockImplementation(() => mocked._contextData["$path"]);
    mocked.mock.getBinding.mockImplementation(() => mocked._oBinding);
    mocked.mock.getModel.mockImplementation(() => {
      var _mocked$_oBinding;
      return (_mocked$_oBinding = mocked._oBinding) === null || _mocked$_oBinding === void 0 ? void 0 : _mocked$_oBinding.getModel();
    });
    mocked.mock.setKeepAlive.mockImplementation((bool, _fnOnBeforeDestroy, _bRequestMessages) => {
      mocked._isKeptAlive = bool;
    });
    mocked.mock.isKeepAlive.mockImplementation(() => mocked._isKeptAlive);
    mocked.mock.isInactive.mockImplementation(() => mocked._isInactive);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockContext instead.
   */
  _exports.createMockContext = createMockContext;
  const MockContext = createMockContext;

  /**
   * Utility type to mock a sap.ui.base.Event
   */
  _exports.MockContext = MockContext;
  /**
   * Factory function to create a new MockEvent.
   *
   * @param params The parameters of the event
   * @returns A new MockEvent
   */
  function createMockEvent(params) {
    const mocked = mock(Event);
    mocked._params = params || {};

    // Default behavior
    mocked.mock.getParameter.mockImplementation(name => mocked._params[name]);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockEvent instead.
   */
  _exports.createMockEvent = createMockEvent;
  const MockEvent = createMockEvent;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataListBinding
   */
  _exports.MockEvent = MockEvent;
  /**
   * Factory function to create a new MockListBinding.
   *
   * @param aContextData An array of objects holding the different properties of the contexts referenced by the ListBinding
   * @param oMockModel The model of the ListBinding
   * @returns A new MockListBinding
   */
  function createMockListBinding(aContextData, oMockModel) {
    const mocked = mock(ODataListBinding);
    aContextData = aContextData || [];
    mocked._aMockContexts = aContextData.map(contextData => {
      return createMockContext(contextData, mocked);
    });
    mocked._mockModel = oMockModel;

    // Utility API
    mocked.setModel = model => {
      mocked._mockModel = model;
    };

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.odata.v4.ODataListBinding";
    });
    mocked.mock.requestContexts.mockImplementation(() => {
      return Promise.resolve(mocked._aMockContexts);
    });
    mocked.mock.getCurrentContexts.mockImplementation(() => {
      return mocked._aMockContexts;
    });
    mocked.mock.getAllCurrentContexts.mockImplementation(() => {
      return mocked._aMockContexts;
    });
    mocked.mock.getContexts.mockImplementation(() => {
      return mocked._aMockContexts;
    });
    mocked.mock.getModel.mockImplementation(() => {
      return mocked._mockModel;
    });
    mocked.mock.getUpdateGroupId.mockReturnValue("auto");
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockListBinding instead.
   */
  _exports.createMockListBinding = createMockListBinding;
  const MockListBinding = createMockListBinding;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataPropertyBinding
   */
  _exports.MockListBinding = MockListBinding;
  /**
   * Factory function to create a new MockPropertyBinding.
   *
   * @param value The value returnd by the PropertyBinding
   * @param path The path of the PropertyBinding
   * @param oMockModel The model of the PropertyBinding
   * @returns A new MockPropertyBinding
   */
  function createMockPropertyBinding(value, path, oMockModel) {
    const mocked = mock(ODataPropertyBinding);
    mocked._mockModel = oMockModel;
    mocked._value = value;
    mocked._path = path;

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.odata.v4.ODataPropertyBinding";
    });
    mocked.mock.getModel.mockImplementation(() => {
      return mocked._mockModel;
    });
    mocked.mock.getValue.mockImplementation(() => {
      return mocked._value;
    });
    mocked.mock.getPath.mockImplementation(() => {
      return mocked._path;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockPropertyBinding instead.
   */
  _exports.createMockPropertyBinding = createMockPropertyBinding;
  const MockPropertyBinding = createMockPropertyBinding;

  /**
   * Utility type to mock a sap.ui.model.CompositeBinding
   */
  _exports.MockPropertyBinding = MockPropertyBinding;
  /**
   * Factory function to create a new MockCompositeBinding.
   *
   * @param aBindings The bindings of the CompositeBinding
   * @returns A new MockCompositeBinding
   */
  function createMockCompositeBinding(aBindings) {
    const mocked = mock(CompositeBinding);
    mocked._aBindings = aBindings;

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.CompositeBinding";
    });
    mocked.mock.getBindings.mockImplementation(() => {
      return mocked._aBindings;
    });
    mocked.mock.getValue.mockImplementation(() => {
      return mocked._aBindings.map(binding => binding.getValue());
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockCompositeBinding instead.
   */
  _exports.createMockCompositeBinding = createMockCompositeBinding;
  const MockCompositeBinding = createMockCompositeBinding;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataContextBinding
   */
  _exports.MockCompositeBinding = MockCompositeBinding;
  /**
   * Factory function to create a new MockContextBinding.
   *
   * @param oContext The context of the ContextBinding
   * @param oMockModel The model of the ContextBinding
   * @returns A new MockContextBinding
   */
  function createMockContextBinding(oContext, oMockModel) {
    const mocked = mock(ODataContextBinding);
    mocked.mockModel = oMockModel;
    mocked.oMockContext = createMockContext(oContext || {}, mocked);

    // Utility API
    mocked.getInternalMockContext = () => {
      return mocked.oMockContext;
    };
    mocked.setModel = oModel => {
      mocked.mockModel = oModel;
    };

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.odata.v4.ODataContextBinding";
    });
    mocked.mock.getBoundContext.mockImplementation(() => {
      return mocked.oMockContext;
    });
    mocked.mock.getModel.mockImplementation(() => {
      return mocked.mockModel;
    });
    mocked.mock.execute.mockResolvedValue(true);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockContextBinding instead.
   */
  _exports.createMockContextBinding = createMockContextBinding;
  const MockContextBinding = createMockContextBinding;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataMetaModel
   */
  _exports.MockContextBinding = MockContextBinding;
  /**
   * Factory function to create a new MockMetaModel.
   *
   * @param oMetaData A map of the different metadata properties of the MetaModel (path -> value).
   * @returns A new MockMetaModel
   */
  function createMockMetaModel(oMetaData) {
    const mocked = mock(ODataMetaModel);
    mocked.oMetaContext = createMockContext(oMetaData || {});

    // Default behavior
    mocked.mock.getMetaContext.mockImplementation(sPath => {
      return createMockContext({
        $path: sPath
      });
    });
    mocked.mock.getObject.mockImplementation(sPath => {
      return mocked.oMetaContext.getProperty(sPath);
    });
    mocked.mock.createBindingContext.mockImplementation(sPath => {
      return createMockContext({
        $path: sPath
      });
    });
    mocked.mock.getMetaPath.mockImplementation(sPath => {
      const metamodel = new ODataMetaModel();
      return sPath ? metamodel.getMetaPath(sPath) : sPath;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockMetaModel instead.
   */
  _exports.createMockMetaModel = createMockMetaModel;
  const MockMetaModel = createMockMetaModel;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataModel
   */
  _exports.MockMetaModel = MockMetaModel;
  /**
   * Factory function to create a new MockModel.
   *
   * @param oMockListBinding A list binding that will be returned when calling bindList.
   * @param oMockContextBinding A context binding that will be returned when calling bindContext.
   * @returns A new MockModel
   */
  function createMockModel(oMockListBinding, oMockContextBinding) {
    const mocked = mock(ODataModel);
    mocked.mockListBinding = oMockListBinding;
    mocked.mockContextBinding = oMockContextBinding;
    if (oMockListBinding) {
      oMockListBinding.setModel(mocked);
    }
    if (oMockContextBinding) {
      oMockContextBinding.setModel(mocked);
    }

    // Utility API
    mocked.setMetaModel = oMetaModel => {
      mocked.oMetaModel = oMetaModel;
    };

    // Default behavior
    mocked.mock.bindList.mockImplementation(() => {
      return mocked.mockListBinding;
    });
    mocked.mock.bindContext.mockImplementation(() => {
      return mocked.mockContextBinding;
    });
    mocked.mock.getMetaModel.mockImplementation(() => {
      return mocked.oMetaModel;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockModel instead.
   */
  _exports.createMockModel = createMockModel;
  const MockModel = createMockModel;
  /**
   * Factory function to create a new MockModel used with a listBinding.
   *
   * @param oMockListBinding A list binding that will be returned when calling bindList.
   * @returns A new MockModel
   */
  _exports.MockModel = MockModel;
  function createMockModelFromListBinding(oMockListBinding) {
    return createMockModel(oMockListBinding);
  }
  /**
   *  Factory function to create a new MockModel used with a contextBinding.
   *
   * @param oMockContextBinding A context binding that will be returned when calling bindContext.
   * @returns A new MockModel
   */
  _exports.createMockModelFromListBinding = createMockModelFromListBinding;
  function createMockModelFromContextBinding(oMockContextBinding) {
    return createMockModel(undefined, oMockContextBinding);
  }

  /**
   * Utility type to mock a sap.ui.core.mvc.View
   */
  _exports.createMockModelFromContextBinding = createMockModelFromContextBinding;
  /**
   * Factory function to create a new MockView.
   *
   * @returns A new MockView
   */
  function createMockView() {
    const mocked = mock(View);

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.core.mvc.View";
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockView instead.
   */
  _exports.createMockView = createMockView;
  const MockView = createMockView;

  /**
   * Utility type to mock a sap.fe.core.PageController
   */
  _exports.MockView = MockView;
  /**
   * Factory function to create a new MockController.
   *
   * @returns A new MockController
   */
  function createMockController() {
    const mocked = mock(Controller);
    mocked._routing = mock(InternalRouting);
    mocked._editFlow = mock(InternalEditFlow);
    mocked._sideEffects = mock(SideEffects);
    mocked.editFlow = mock(EditFlow);
    mocked.share = mock(Share);

    // Default Behavior
    mocked.mock.getView.mockReturnValue(createMockView());
    mocked.mock.isA.mockReturnValue(false);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function mockController instead.
   */
  _exports.createMockController = createMockController;
  const MockController = createMockController;
  _exports.MockController = MockController;
  /**
   * Generate model, view and controller mocks that refer to each other.
   *
   * @param existing Optional existing mocked instances that should be used
   * @returns Mocked model, view and controller instances
   */
  function mockMVC(existing) {
    const model = (existing === null || existing === void 0 ? void 0 : existing.model) || createMockModel();
    const view = (existing === null || existing === void 0 ? void 0 : existing.view) || createMockView();
    const controller = (existing === null || existing === void 0 ? void 0 : existing.controller) || createMockController();
    view.mock.getController.mockReturnValue(controller);
    view.mock.getModel.mockReturnValue(model);
    controller.mock.getView.mockReturnValue(view);
    return {
      model,
      view,
      controller
    };
  }
  _exports.mockMVC = mockMVC;
  return _exports;
}, false);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/Utils", [
		"sap/base/util/LoaderExtensions",
		"sap/base/util/UriParameters",
		"sap/base/util/merge",
		"sap/base/strings/formatMessage",
		"sap/base/strings/capitalize"
	],
	function (LoaderExtensions, UriParameters, mergeObjects, formatMessageRaw, capitalize) {
		"use strict";

		var Utils = {};

		Utils.getManifest = function (sComponentName) {
			var oUshellContainer = sap.ushell && sap.ushell.Container;
			if (!oUshellContainer) {
				var appPath = Utils.getNoFLPAppPath();
				sComponentName = "local" + appPath;
			}
			var oUriParams = new UriParameters(window.location.href),
				sDeltaManifest = oUriParams.get("manifest"),
				oTargetManifest = LoaderExtensions.loadResource(sComponentName + "/manifest.json");

			if (sDeltaManifest) {
				sDeltaManifest.split(",").forEach(function (sSingleDeltaManifest) {
					if (sSingleDeltaManifest.indexOf("/") !== 0) {
						sSingleDeltaManifest = sComponentName + "/" + sSingleDeltaManifest;
					}
					try {
						oTargetManifest = mergeObjects({}, oTargetManifest, LoaderExtensions.loadResource(sSingleDeltaManifest));
					} catch (ignore) {
						// not always an error, e.g. when navigating to a different app that does not have the delta manifest
					}
				});
			}

			var uri = new URL(oTargetManifest["sap.app"].dataSources.mainService.uri, document.location);
			var sUser = oUriParams.get("user");
			if (sUser) {
				uri.searchParams.set("user", sUser);
			}

			oTargetManifest["sap.app"].dataSources.mainService.uri = uri.toString();

			return oTargetManifest;
		};

		Utils.getNoFLPAppPath = function () {
			/*demokit.html scenario - parameter app = appName expected*/
			var oUriParameters = new UriParameters(window.location.href);
			var sApp = oUriParameters.get("app") || "SalesOrder";
			return Utils.getAppInfo(sApp).appPath;
		};

		Utils.getAppInfo = function (sApp) {
			var oApps = {
				"SalesOrder-manage": {
					appName: "SalesOrder",
					appPath: "/apps/salesorder/webapp"
				},
				"SalesOrder-manageInline": {
					appName: "SalesOrder",
					appPath: "/apps/salesorder/webapp"
				},
				"SalesOrder-manageFCL": {
					appName: "SalesOrderFCL",
					appPath: "/apps/salesorder-FCL/webapp"
				},
				"SalesOrder-aggregate": {
					appName: "SalesOrder",
					appPath: "/apps/salesorder-aggregate/webapp"
				},
				"SalesOrder-manageInlineTest": {
					appName: "SalesOrder",
					appPath: "/apps/salesorder/webapp"
				},
				"Customer-manage": {
					appName: "Customer",
					appPath: "/apps/customer/webapp"
				},
				"Customer-displayFactSheet": {
					appName: "Customer",
					appPath: "/apps/customer-displayFactSheet/webapp"
				},
				"SalesOrder-sticky": {
					appName: "SalesOrder",
					appPath: "/apps/salesorder/webapp"
				},
				"SalesOrder-stickyFCL": {
					appName: "SalesOrderFCL",
					appPath: "/apps/salesorder-FCL/webapp"
				},
				"Products-manage": {
					appName: "catalog-admin-ui",
					appPath: "/apps/office-supplies/admin/webapp"
				},
				"Products-custom": {
					appName: "catalog-admin-ui",
					appPath: "/apps/office-supplies/custompage/webapp"
				},
				"Chevron-Navigation": {
					appName: "SalesOrder",
					appPath: "/apps/salesorder/webapp"
				},
				"Manage-items": {
					appName: "ManageItems",
					appPath: "/apps/manage-items/webapp"
				},
				"Drafts-manage": {
					appName: "ManageDrafts",
					appPath: "/apps/manage-drafts/webapp"
				},
				"Drafts-manageFCL": {
					appName: "ManageDraftsFCL",
					appPath: "/apps/manage-drafts-FCL/webapp"
				},
				"Manage-itemsSem": {
					appName: "ManageItemsSem",
					appPath: "/apps/manage-drafts/webapp"
				},
				"CustomNavigation-sample": {
					appName: "customNavigation.sample",
					appPath: "/apps/customNav"
				},
				"SalesOrder-Create": {
					appName: "SalesOrderCreate",
					appPath: "/apps/salesorder-Create/webapp"
				},
				"SalesOrder-CreateFCL": {
					appName: "SalesOrderCreateFCL",
					appPath: "/apps/salesorder-CreateFCL/webapp"
				},
				SalesOrder: {
					appName: "SalesOrder",
					appPath: "/apps/salesorder/webapp"
				}
			};
			return oApps[sApp];
		};

		Utils.isOfType = function (vToTest, vValidTypes, bNullAndUndefinedAreValid) {
			var aValidTypes = Array.isArray(vValidTypes) ? vValidTypes : [vValidTypes];

			return aValidTypes.reduce(function (bIsOfType, vTypeToCheck) {
				if (bIsOfType) {
					return true;
				}

				if (vTypeToCheck === null || vTypeToCheck === undefined) {
					return vToTest === vTypeToCheck;
				}

				if (vToTest === null || vToTest === undefined) {
					return !!bNullAndUndefinedAreValid;
				}

				if (typeof vTypeToCheck === "function") {
					if (vTypeToCheck === Boolean) {
						return typeof vToTest === "boolean";
					}
					if (vTypeToCheck === Array) {
						return Array.isArray(vToTest);
					}
					if (vTypeToCheck === String) {
						return typeof vToTest === "string" || vToTest instanceof String;
					}
					if (vTypeToCheck === Object) {
						return typeof vToTest === "object" && vToTest.constructor === Object;
					}
					if (vTypeToCheck === Number) {
						return typeof vToTest === "number";
					}
					return vToTest instanceof vTypeToCheck;
				}

				return typeof vToTest === vTypeToCheck;
			}, false);
		};

		Utils.isArguments = function (vValue) {
			return Object.prototype.toString.call(vValue) === "[object Arguments]";
		};

		Utils.parseArguments = function (aExpectedTypes) {
			var aArguments = Array.prototype.slice.call(arguments, 1);

			if (aArguments.length === 1 && Utils.isArguments(aArguments[0])) {
				aArguments = Array.prototype.slice.call(aArguments[0], 0);
			}

			return aExpectedTypes.reduce(function (aActualArguments, vExpectedType) {
				if (Utils.isOfType(aArguments[0], vExpectedType, true)) {
					aActualArguments.push(aArguments.shift());
				} else {
					aActualArguments.push(undefined);
				}
				return aActualArguments;
			}, []);
		};

		Utils.formatObject = function (mObject) {
			if (Utils.isOfType(mObject, [null, undefined])) {
				return "";
			}
			if (Utils.isOfType(mObject, Array)) {
				return (
					"[" +
					mObject
						.map(function (oElement) {
							return Utils.formatObject(oElement);
						})
						.join(", ") +
					"]"
				);
			}
			if (Utils.isOfType(mObject, Object)) {
				return (
					"{" +
					Object.keys(mObject)
						.map(function (sKey) {
							return sKey + ": " + Utils.formatObject(mObject[sKey]);
						})
						.join(", ") +
					"}"
				);
			}
			return mObject.toString();
		};

		Utils.formatMessage = function (sMessage) {
			var aParameters = Array.prototype.slice.call(arguments, 1).map(function (vParameter) {
				return Utils.formatObject(vParameter);
			});
			return formatMessageRaw(sMessage && sMessage.replace(/'/g, "''"), aParameters);
		};

		Utils.mergeObjects = function () {
			return mergeObjects.apply(this, [{}].concat(Array.prototype.slice.call(arguments)));
		};

		Utils.getAggregation = function (oManagedObject, sAggregationName) {
			if (!oManagedObject) {
				return null;
			}
			var fnAggregation = oManagedObject["get" + capitalize(sAggregationName, 0)];
			if (!fnAggregation) {
				throw new Error("Object '" + oManagedObject + "' does not have an aggregation called '" + sAggregationName + "'");
			}
			return fnAggregation.call(oManagedObject);
		};

		Utils.pushToArray = function (vElement, vTarget, bAtTheBeginning) {
			if (vTarget === undefined) {
				vTarget = [];
			} else if (!Array.isArray(vTarget)) {
				vTarget = [vTarget];
			} else {
				vTarget = vTarget.slice(0);
			}

			if (Array.isArray(vElement)) {
				vTarget = bAtTheBeginning ? vElement.slice(0).concat(vTarget) : vTarget.concat(vElement);
			} else if (vElement !== undefined) {
				if (bAtTheBeginning) {
					vTarget.unshift(vElement);
				} else {
					vTarget.push(vElement);
				}
			}
			return vTarget;
		};

		return Utils;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/APIHelper", ["sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"], function (Utils, OpaBuilder, FEBuilder) {
	"use strict";

	var APIHelper = {
		createSaveAsTileCheckBuilder: function (mState) {
			return APIHelper.createMenuActionCheckBuilder({ icon: "sap-icon://add-favorite" })
				.hasState(mState)
				.description(Utils.formatMessage("Checking 'Save as Tile' action in state '{0}'", mState));
		},

		createSaveAsTileExecutorBuilder: function (sBookmarkTitle) {
			return APIHelper.createMenuActionExecutorBuilder({ icon: "sap-icon://add-favorite" }).success(
				FEBuilder.create()
					.isDialogElement()
					.hasType("sap.m.Input")
					.hasProperties({ id: "bookmarkTitleInput" })
					.doEnterText(sBookmarkTitle)
					.description(Utils.formatMessage("Enter '{0}' as Bookmark title", sBookmarkTitle))
					.success(
						FEBuilder.create()
							.isDialogElement()
							.hasType("sap.m.Button")
							.hasProperties({ id: "bookmarkOkBtn" })
							.doPress()
							.description("Confirm 'Save as Tile' dialog")
					)
			);
		},

		createSendEmailCheckBuilder: function (mState) {
			return APIHelper.createMenuActionCheckBuilder({ icon: "sap-icon://email" })
				.hasState(mState)
				.description(Utils.formatMessage("Checking 'Send Email' action in state '{0}'", mState));
		},

		createSendEmailExecutorBuilder: function () {
			return APIHelper.createMenuActionExecutorBuilder({ icon: "sap-icon://email" }).description("Executing 'Send Email' action");
		},

		createMenuAndListActionMatcher: function (vAction, bReturnAction) {
			var vActionMatcher;
			if (Utils.isOfType(vAction, String)) {
				vAction = { text: vAction };
			}
			if (Utils.isOfType(vAction, Object)) {
				if (vAction.visible === false) {
					var mStatesWOVisible = Object.assign(vAction);
					delete mStatesWOVisible.visible;
					vActionMatcher = OpaBuilder.Matchers.some(
						// either button is visible=false ...
						OpaBuilder.Matchers.aggregationMatcher("items", FEBuilder.Matchers.states(vAction)),
						// ... or it wasn't rendered at all (no match in the aggregation)
						OpaBuilder.Matchers.not(
							OpaBuilder.Matchers.aggregationMatcher("items", FEBuilder.Matchers.states(mStatesWOVisible))
						)
					);
				} else {
					vActionMatcher = bReturnAction
						? [OpaBuilder.Matchers.aggregation("items", FEBuilder.Matchers.states(vAction)), FEBuilder.Matchers.atIndex(0)]
						: OpaBuilder.Matchers.aggregationMatcher("items", FEBuilder.Matchers.states(vAction));
				}
			} else {
				throw new Error("vAction parameter must be a string or object");
			}
			return vActionMatcher;
		},

		createMenuActionExecutorBuilder: function (vAction) {
			if (!vAction) {
				throw new Error("vAction parameter missing");
			}

			return FEBuilder.create()
				.hasType("sap.ui.unified.Menu")
				.isDialogElement(true)
				.has(APIHelper.createMenuAndListActionMatcher(vAction, true))
				.doPress()
				.description(Utils.formatMessage("Executing action '{0}' from currently open action menu", vAction));
		},

		createMenuActionCheckBuilder: function (vAction) {
			if (!vAction) {
				throw new Error("vAction parameter missing");
			}

			return FEBuilder.create()
				.hasType("sap.ui.unified.Menu")
				.isDialogElement(true)
				.has(APIHelper.createMenuAndListActionMatcher(vAction))
				.description(Utils.formatMessage("Checking currently open action menu having action '{0}'", vAction));
		},

		createSelectListActionExecutorBuilder: function (vAction) {
			if (!vAction) {
				throw new Error("vAction parameter missing");
			}

			return FEBuilder.create()
				.hasType("sap.m.SelectList")
				.isDialogElement(true)
				.has(APIHelper.createMenuAndListActionMatcher(vAction, true))
				.doPress()
				.description(Utils.formatMessage("Executing action '{0}' from currently open selection list", vAction));
		}
	};

	return APIHelper;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/BaseAPI", ["sap/fe/test/Utils", "sap/ui/test/Opa5", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/m/p13n/BasePanel"],
	function (Utils, Opa5, OpaBuilder, FEBuilder, MdcP13nBasePanel) {
		"use strict";

		/**
		 * A table identifier
		 *
		 * @typedef {object} TableIdentifier
		 * @property {string} property The name of the navigation property used for the table
		 * @property {string} [qualifier] The name of a qualifier for the table
		 * @name sap.fe.test.api.TableIdentifier
		 * @public
		 */

		/**
		 * A dialog identifier
		 *
		 * @typedef {object} DialogIdentifier
		 * @property {sap.fe.test.api.DialogType} type The type of the dialog
		 * @name sap.fe.test.api.DialogIdentifier
		 * @public
		 */

		/**
		 * An action identifier
		 *
		 * @typedef {object} ActionIdentifier
		 * @property {string} service The name of the service
		 * @property {string} action The name of the action
		 * @property {boolean} [unbound] Defines whether the action is a bound action (default: false)
		 * @name sap.fe.test.api.ActionIdentifier
		 * @public
		 */

		/**
		 * A field identifier
		 *
		 * @typedef {object} FieldIdentifier
		 * @property {string} [fieldGroup] The name of the field group containing the field
		 * @property {string} property The name of the field
		 * @property {string} [connectedFields] The name of the connected field containing the field
		 * @name sap.fe.test.api.FieldIdentifier
		 * @public
		 */

		/**
		 * A section identifier
		 *
		 * @typedef {object} SectionIdentifier
		 * @property {string} section The name of the section facet
		 * @property {string} [subSection] The name of the sub-section facet
		 * @name sap.fe.test.api.SectionIdentifier
		 * @public
		 */

		/**
		 * An action parameter dialog field identifier
		 *
		 * @typedef {object} ActionDialogFieldIdentifier
		 * @property {string} property The name of the field
		 * @name sap.fe.test.api.ActionDialogFieldIdentifier
		 * @public
		 */

		/**
		 * An dialog field identifier
		 *
		 * @typedef {object} DialogFieldIdentifier
		 * @property {string} property The name of the field
		 * In case of an action parameter dialog, this is the fieldname only
		 * <code><pre>
		 * {
		 *     property: <fieldname>
		 * }
		 * </pre></code>
		 * In case of a create dialog, the concatenation of the entity and fieldname has to be provided
		 * <code><pre>
		 * {
		 *     property: <entity>::<fieldname>
		 * }
		 * </pre></code>
		 * @name sap.fe.test.api.DialogFieldIdentifier
		 * @public
		 */

		/**
		 * A view identifier
		 *
		 * @typedef {object} ViewIdentifier
		 * @property {string} key The name of the view as defined in the manifest file
		 * @name sap.fe.test.api.ViewIdentifier
		 * @public
		 */

		function _findParentChainFunction(oResult, sChainKeyword) {
			var oAnd = oResult.and;
			if (sChainKeyword in oAnd) {
				return _findParentChainFunction(oAnd[sChainKeyword], sChainKeyword);
			}
			return oAnd;
		}

		var BaseApi = function (oOpaBuilder, vIdentifier) {
			this._oBuilder = oOpaBuilder;
			this._vIdentifier = vIdentifier;
		};

		BaseApi.MDC_P13N_MODEL = MdcP13nBasePanel.prototype.P13N_MODEL;

		/**
		 * Defines whether the current API is meant for actions (<code>true</code>) or assertions (<code>false</code>).
		 * It is used to enable parent chaining via <code>and.when</code> or <code>and.then</code>.
		 *
		 * @type {boolean}
		 * @public
		 * @ui5-restricted
		 */
		BaseApi.prototype.isAction = undefined;

		/**
		 * Gets a new builder instance based on the given one.
		 *
		 * @returns {object} An OpaBuilder instance
		 * @public
		 * @ui5-restricted
		 */
		BaseApi.prototype.getBuilder = function () {
			return new this._oBuilder.constructor(this._oBuilder.getOpaInstance(), this._oBuilder.build());
		};

		/**
		 * Gets the underlying Opa5 instance.
		 *
		 * @returns {sap.ui.test.Opa5} An Opa instance
		 * @public
		 * @ui5-restricted
		 */
		BaseApi.prototype.getOpaInstance = function () {
			return this._oBuilder.getOpaInstance();
		};

		BaseApi.prototype.getIdentifier = function () {
			return this._vIdentifier;
		};

		BaseApi.prototype.prepareResult = function (oWaitForResult) {
			var oParentChain = _findParentChainFunction(oWaitForResult, this.isAction ? "when" : "then");
			oWaitForResult.and = this;
			if (!Utils.isOfType(this.isAction, [null, undefined])) {
				oWaitForResult.and[this.isAction ? "when" : "then"] = oParentChain;
			}
			return oWaitForResult;
		};

		/**
		 * Creates a matcher for actions.
		 *
		 * @param {sap.fe.api.ActionIdentifier | string} vActionIdentifier Identifier to be used for the matcher.
		 * @returns {object} A matcher
		 * @private
		 */
		BaseApi.prototype.createActionMatcher = function (vActionIdentifier) {
			var vMatcher, sActionId;

			if (!Utils.isOfType(vActionIdentifier, String)) {
				if (typeof vActionIdentifier.service === "string" && typeof vActionIdentifier.action === "string") {
					sActionId = vActionIdentifier.service + (vActionIdentifier.unbound ? "::" : ".") + vActionIdentifier.action;
					vMatcher = FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sActionId)));
				} else {
					throw new Error(
						"not supported service and action parameters for creating a control id: " +
							vActionIdentifier.service +
							"/" +
							vActionIdentifier.action
					);
				}
			} else {
				vMatcher = OpaBuilder.Matchers.properties({ text: vActionIdentifier });
			}
			return vMatcher;
		};

		/**
		 * Creates a matcher for fields.
		 *
		 * @param {sap.fe.test.api.FieldIdentifier | string} vFieldIdentifier Identifier to be used for the matcher
		 * @returns {object} A matcher
		 * @private
		 */
		BaseApi.prototype.createFieldMatcher = function (vFieldIdentifier) {
			var vMatcher, sFieldId;
			if (!Utils.isOfType(vFieldIdentifier, String)) {
				if (typeof vFieldIdentifier.property === "string") {
					if (vFieldIdentifier.connectedFields) {
						sFieldId =
							"ConnectedFields::" +
							vFieldIdentifier.connectedFields +
							"::" +
							vFieldIdentifier.property.replaceAll("/", "::") +
							"::Field";
					} else {
						sFieldId = vFieldIdentifier.property.replaceAll("/", "::") + "::Field";
					}
					return OpaBuilder.Matchers.some.apply(
						null,
						["DataField", "DataFieldWithURL", "DataFieldForAnnotation"].reduce(function (aMatchers, sDataFieldType) {
							return aMatchers.concat([
								FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("::{0}::{1}$", sDataFieldType, sFieldId)))
							]);
						}, [])
					);
				} else {
					throw new Error(
						"The 'property' parameter for creating a control ID for a field is not supported: " + vFieldIdentifier.property
					);
				}
			} else {
				// identify a field by its label
				vMatcher = FEBuilder.Matchers.label(vFieldIdentifier);
			}
			return vMatcher;
		};

		/**
		 * Creates a matcher for FormElements (sap.ui.layout.form.FormElement).
		 *
		 * @param {sap.fe.test.api.FieldIdentifier | string} vFormElementIdentifier Identifier of the field to be used for the matcher
		 * @param {string} sDataFieldType Added as prefix for the id. Can be values like 'DataField',
		 * 'DataFieldWithUrl', 'DataFieldWithNavigationPath', etc.
		 * @returns {object} A matcher
		 * @private
		 */
		BaseApi.prototype.createFormElementMatcher = function (vFormElementIdentifier, sDataFieldType) {
			var vMatcher, sFormElementId;
			if (!Utils.isOfType(vFormElementIdentifier, String)) {
				if (vFormElementIdentifier.property && typeof vFormElementIdentifier.property === "string") {
					if (vFormElementIdentifier.connectedFields) {
						sFormElementId =
							"SemanticFormElement::" + sDataFieldType + "::ConnectedFields::" + vFormElementIdentifier.connectedFields;
					} else {
						sFormElementId = "FormElement::" + sDataFieldType + "::" + vFormElementIdentifier.property.replaceAll("/", "::");
					}
					vMatcher = FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sFormElementId)));
				} else {
					throw new Error("Unsupported parameter for creating a control id for a FormElement");
				}
			} else {
				vMatcher = OpaBuilder.Matchers.properties({ label: vFormElementIdentifier });
			}
			return vMatcher;
		};

		/**
		 * Create a matcher for FieldGroups (sap.ui.layout.form.FormContainer).
		 *
		 * @param {object | string} vFieldGroupIdentifier Identifier of the field-group to be used for the matcher.
		 * if passed as an object, the following pattern will be considered:
		 * <code><pre>
		 * 	{
		 * 		fieldGroup: <fieldgroup-name>
		 *  }
		 * </pre></code>
		 * if passed as string, the content of the field will be checked with property 'title'
		 * @returns {object} A matcher
		 * @private
		 */
		BaseApi.prototype.createFieldGroupMatcher = function (vFieldGroupIdentifier) {
			var vMatcher, sFieldGroupId;
			if (!Utils.isOfType(vFieldGroupIdentifier, String)) {
				if (vFieldGroupIdentifier.fieldGroup && typeof vFieldGroupIdentifier.fieldGroup === "string") {
					sFieldGroupId = "FormContainer::" + vFieldGroupIdentifier.fieldGroup;
					vMatcher = FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sFieldGroupId)));
				} else {
					throw new Error(
						Utils.formatMessage(
							"The parameter for creating a control ID for a FieldGroup is not supported: {0}",
							vFieldGroupIdentifier
						)
					);
				}
			} else {
				vMatcher = OpaBuilder.Matchers.properties({ title: vFieldGroupIdentifier });
			}
			return vMatcher;
		};

		return BaseApi;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/ChartActions", ["./BaseAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"],
	function (BaseAPI, Utils, OpaBuilder) {
		"use strict";

		/**
		 * Constructs a new ChartActions instance.
		 *
		 * TODO this API does not fit the criteria for public API and needs some rework. Not considered critical for apps though.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oBuilderInstance  The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vChartDescription] Description (optional) of the chart to be used for logging messages
		 * @returns {sap.fe.test.api.ChartActions} The new instance
		 * @class
		 * @private
		 */
		var Actions = function (oBuilderInstance, vChartDescription) {
			return BaseAPI.call(this, oBuilderInstance, vChartDescription);
		};
		Actions.prototype = Object.create(BaseAPI.prototype);
		Actions.prototype.constructor = Actions;
		Actions.prototype.isAction = true;

		/**
		 * Selects the specified rows.
		 *
		 * @param {object} [mRowValues] a map of columns (either name or index) to its value, e.g. <code>{ 0: "Max", "Last Name": "Mustermann" }</code>
		 * @param {object} [mRowState] a map of states. Supported row states are
		 * <code><pre>
		 * 	{
		 * 		selected: true|false,
		 * 		focused: true|false
		 * 	}
		 * </pre></code>
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @private
		 */

		Actions.prototype.iSelectItems = function (innerData, bClearSelection) {
			if (typeof bClearSelection === "boolean") {
				bClearSelection = bClearSelection;
			} else {
				bClearSelection = true;
			}
			return OpaBuilder.create(this)
				.hasType("sap.chart.Chart")
				.check(function (oChart) {
					var bResult;
					var vizFrame = oChart[0]._getVizFrame();
					if (vizFrame) {
						var data = innerData
							? [
									{
										data: innerData
									}
							  ]
							: [];
						bResult = vizFrame.vizSelection(data, {
							clearSelection: bClearSelection
						});
					}
					return bResult;
				}, true)
				.description("Do not see the First Column Expand Button")
				.execute();
		};

		Actions.prototype.iChangeChartType = function (sType) {
			return OpaBuilder.create(this)
				.hasType("sap.ui.core.Icon")
				.hasProperties({
					src: "sap-icon://vertical-bar-chart"
				})
				.doPress()
				.success(function () {
					return OpaBuilder.create(this)
						.hasType("sap.m.StandardListItem")
						.hasProperties({
							icon: "sap-icon://horizontal-bar-chart"
						})
						.doPress()
						.description("blablabla")
						.execute();
				})
				.description("Opened the Dialog")
				.execute();
		};

		Actions.prototype.iDrillDown = function (sDimension) {
			return OpaBuilder.create(this)
				.hasType("sap.m.Button")
				.hasProperties({
					tooltip: "View By"
				})
				.doPress()
				.success(function () {
					return OpaBuilder.create(this)
						.hasType("sap.m.StandardListItem")
						.hasProperties({
							title: sDimension
						})
						.doPress()
						.description("blablabla")
						.execute();
				})
				.description("Opened the Dialog")
				.execute();
		};

		Actions.prototype.iExecuteActionWithText = function (sText) {
			return OpaBuilder.create(this)
				.hasType("sap.m.Button")
				.hasProperties({
					text: sText
				})
				.doPress()
				.description("Clicked on button" + sText)
				.execute();
		};

		return Actions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/ChartAssertions", ["./BaseAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/ui/core/SortOrder"],
	function (BaseAPI, Utils, OpaBuilder, FEBuilder, SortOrder) {
		"use strict";

		/**
		 * Constructs a new ChartAssertions instance.
		 *
		 * TODO this API does not fit the criteria for public API and needs some rework. Not considered critical for apps though.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oBuilderInstance  The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vChartDescription] Description (optional) of the chart to be used for logging messages
		 * @returns {sap.fe.test.api.ChartAssertions} The new instance
		 * @class
		 * @private
		 */
		var ChartAssertions = function (oBuilderInstance, vChartDescription) {
			return BaseAPI.call(this, oBuilderInstance, vChartDescription);
		};
		ChartAssertions.prototype = Object.create(BaseAPI.prototype);
		ChartAssertions.prototype.constructor = ChartAssertions;
		ChartAssertions.prototype.isAction = false;

		ChartAssertions.prototype.iCheckItems = function (iNumberOfItems, sTab) {
			return OpaBuilder.create(this)
				.hasType("sap.ui.mdc.Chart")
				.check(function (aCharts) {
					var oChart;
					if (sTab && aCharts && aCharts.length > 1) {
						for (var i = 0; i < aCharts.length; i++) {
							if (aCharts[i].getId().indexOf("fe::Chart::" + sTab) > -1) {
								oChart = aCharts[i];
								break;
							}
						}
					} else {
						oChart = aCharts[0];
					}
					var aContexts = oChart.getControlDelegate()._getChart(oChart).getBinding("data").getContexts();
					return (
						(aContexts && (iNumberOfItems === undefined ? aContexts.length !== 0 : aContexts.length === iNumberOfItems)) ||
						(!aContexts && iNumberOfItems === 0)
					);
				}, true)
				.description("Seeing " + iNumberOfItems + "of items")
				.execute();
		};

		ChartAssertions.prototype.iSeeChartType = function (sChartType) {
			return OpaBuilder.create(this)
				.hasType("sap.ui.mdc.Chart")
				.check(function (oChart) {
					return sChartType === oChart[0].getChartType();
				}, true)
				.description("Chart type is " + sChartType)
				.execute();
		};

		ChartAssertions.prototype.iSeeChartVisible = function () {
			return OpaBuilder.create(this)
				.hasType("sap.ui.mdc.Chart")
				.check(function (oChart) {
					return oChart[0].getVisible() === true;
				}, true)
				.description("Chart is Visible")
				.execute();
		};

		ChartAssertions.prototype.iCheckBreadCrumb = function (sLink) {
			return OpaBuilder.create(this)
				.hasType("sap.m.Breadcrumbs")
				.hasProperties({ currentLocationText: sLink })
				.description("BreadCrumb is " + sLink)
				.execute();
		};

		ChartAssertions.prototype.iCheckVisibleDimensions = function (aDimensions) {
			return OpaBuilder.create(this)
				.hasType("sap.chart.Chart")
				.check(function (oChart) {
					return oChart[0].getVisibleDimensions().toString() === aDimensions.toString();
				})
				.description("Visible Dimensions are checked correctly")
				.execute();
		};
		ChartAssertions.prototype.iCheckVisibleMeasures = function (aMeasures) {
			return OpaBuilder.create(this)
				.hasType("sap.chart.Chart")
				.check(function (oChart) {
					return oChart[0].getVisibleMeasures().toString() === aMeasures.toString();
				})
				.description("Visible Measures are checked correctly")
				.execute();
		};

		ChartAssertions.prototype.iCheckChartNoDataText = function (sNoDataText) {
			return OpaBuilder.create(this)
				.hasType("sap.ui.mdc.Chart")
				.check(function (oChart) {
					return sNoDataText === oChart[0].getNoDataText();
				})
				.description("No Data text is " + sNoDataText)
				.execute();
		};

		ChartAssertions.prototype.iCheckButtonWithText = function (sText) {
			return OpaBuilder.create(this)
				.hasType("sap.m.Button")
				.hasProperties({ text: sText })
				.description("Seeing Button with text '" + sText + "'")
				.execute();
		};

		ChartAssertions.prototype.iCheckMessageToastWithText = function (sText) {
			return FEBuilder.createMessageToastBuilder(sText).execute(this);
		};

		return ChartAssertions;
	}
);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/test/api/CollaborationAPI", ["sap/base/Log", "sap/fe/core/controllerextensions/collaboration/ActivityBase", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/ui/model/json/JSONModel"], function (Log, ActivityBase, CollaborationCommon, draft, JSONModel) {
  "use strict";

  var Activity = CollaborationCommon.Activity;
  var initializeCollaboration = ActivityBase.initializeCollaboration;
  var endCollaboration = ActivityBase.endCollaboration;
  var broadcastCollaborationMessage = ActivityBase.broadcastCollaborationMessage;
  const CollaborationAPI = {
    _lastReceivedMessage: undefined,
    _rootPath: "",
    _oModel: undefined,
    _lockedPropertyPath: "",
    _internalModel: undefined,
    /**
     * Open an existing collaborative draft with a new user, and creates a 'ghost client' for this user.
     *
     * @param oContext The context of the collaborative draft
     * @param userID The ID of the user
     * @param userName The name of the user
     */
    enterDraft: function (oContext, userID, userName) {
      const webSocketBaseURL = oContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");
      if (!webSocketBaseURL) {
        Log.error("Cannot find WebSocketBaseURL annotation");
        return;
      }
      const sDraftUUID = oContext.getProperty("DraftAdministrativeData/DraftUUID");
      this._internalModel = new JSONModel({});
      const serviceUrl = oContext.getModel().getServiceUrl();
      initializeCollaboration({
        id: userID,
        name: userName,
        initialName: userName
      }, webSocketBaseURL, sDraftUUID, serviceUrl, this._internalModel, this._onMessageReceived.bind(this), true);
      this._rootPath = oContext.getPath();
      this._oModel = oContext.getModel();
    },
    /**
     * Checks if the ghost client has revieved a given message.
     *
     * @param message The message content to be looked for
     * @returns True if the last recieved message matches the content
     */
    checkReceived: function (message) {
      if (!this._lastReceivedMessage) {
        return false;
      }
      const found = (!message.userID || message.userID === this._lastReceivedMessage.userID) && (!message.userAction || message.userAction === this._lastReceivedMessage.userAction) && (!message.clientContent || message.clientContent === this._lastReceivedMessage.clientContent);
      this._lastReceivedMessage = undefined; // reset history to avoid finding the same message twice

      return found;
    },
    /**
     * Closes the ghost client and removes the user from the collaborative draft.
     */
    leaveDraft: function () {
      if (this._internalModel) {
        endCollaboration(this._internalModel);
        this._internalModel.destroy();
        this._internalModel = undefined;
      }
    },
    /**
     * Simulates that the user starts typing in an input (live change).
     *
     * @param sPropertyPath The path of the property being modified
     */
    startLiveChange: function (sPropertyPath) {
      if (this._internalModel) {
        if (this._lockedPropertyPath) {
          // Unlock previous property path
          this.undoChange();
        }
        this._lockedPropertyPath = sPropertyPath;
        broadcastCollaborationMessage(Activity.LiveChange, `${this._rootPath}/${sPropertyPath}`, this._internalModel);
      }
    },
    /**
     * Simulates that the user has modified a property.
     *
     * @param sPropertyPath The path of the property being modified
     * @param value The new value of the property being modified
     */
    updatePropertyValue: function (sPropertyPath, value) {
      if (this._internalModel) {
        if (this._lockedPropertyPath !== sPropertyPath) {
          this.startLiveChange(sPropertyPath);
        }
        const oContextBinding = this._oModel.bindContext(this._rootPath, undefined, {
          $$patchWithoutSideEffects: true,
          $$groupId: "$auto",
          $$updateGroupId: "$auto"
        });
        const oPropertyBinding = this._oModel.bindProperty(sPropertyPath, oContextBinding.getBoundContext());
        oPropertyBinding.requestValue().then(() => {
          oPropertyBinding.setValue(value);
          oContextBinding.attachEventOnce("patchCompleted", () => {
            broadcastCollaborationMessage(Activity.Change, `${this._rootPath}/${sPropertyPath}`, this._internalModel);
            this._lockedPropertyPath = "";
          });
        }).catch(function (err) {
          Log.error(err);
        });
      }
    },
    /**
     * Simulates that the user did an 'undo' (to be called after startLiveChange).
     */
    undoChange: function () {
      if (this._lockedPropertyPath) {
        broadcastCollaborationMessage(Activity.Undo, `${this._rootPath}/${this._lockedPropertyPath}`, this._internalModel);
        this._lockedPropertyPath = "";
      }
    },
    /**
     * Simulates that the user has discarded the draft.
     */
    discardDraft: function () {
      if (this._internalModel) {
        const draftContext = this._getDraftContext();
        draftContext.requestProperty("IsActiveEntity").then(() => {
          draft.deleteDraft(draftContext);
        }).then(() => {
          broadcastCollaborationMessage(Activity.Discard, this._rootPath.replace("IsActiveEntity=false", "IsActiveEntity=true"), this._internalModel);
          this._internalModel.destroy();
          this._internalModel = undefined;
        }).catch(function (err) {
          Log.error(err);
        });
      }
    },
    /**
     * Simulates that the user has deleted the draft.
     */
    deleteDraft: function () {
      if (this._internalModel) {
        const draftContext = this._getDraftContext();
        let activeContext;
        draftContext.requestProperty("IsActiveEntity").then(() => {
          return draftContext.getModel().bindContext(`${this._rootPath}/SiblingEntity`).getBoundContext();
        }).then(context => {
          activeContext = context;
          return context.requestCanonicalPath();
        }).then(() => {
          return draft.deleteDraft(draftContext);
        }).then(() => {
          activeContext.delete();
          broadcastCollaborationMessage(Activity.Delete, this._rootPath, this._internalModel);
          this._internalModel.destroy();
          this._internalModel = undefined;
        }).catch(function (err) {
          Log.error(err);
        });
      }
    },
    // /////////////////////////////
    // Private methods

    _getDraftContext: function () {
      return this._oModel.bindContext(this._rootPath, undefined, {
        $$patchWithoutSideEffects: true,
        $$groupId: "$auto",
        $$updateGroupId: "$auto"
      }).getBoundContext();
    },
    /**
     * Callback of the ghost client when receiving a message on the web socket.
     *
     * @param oMessage The message
     */
    _onMessageReceived: function (oMessage) {
      oMessage.userAction = oMessage.userAction || oMessage.clientAction;
      this._lastReceivedMessage = oMessage;
      if (oMessage.userAction === Activity.Join) {
        broadcastCollaborationMessage(Activity.JoinEcho, this._lockedPropertyPath ? `${this._rootPath}/${this._lockedPropertyPath}` : undefined, this._internalModel);
      }
    }
  };
  return CollaborationAPI;
}, false);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/DialogAPI", [
		"./BaseAPI",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFieldBuilder",
		"sap/fe/test/builder/DialogBuilder"
	],
	function (BaseAPI, Utils, FEBuilder, MdcFieldBuilder, DialogBuilder) {
		"use strict";

		/**
		 * Constructs a new DialogAPI instance.
		 *
		 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
		 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
		 * @param {number} [iConfirmButtonIndex] Index of the 'confirm' button in the button aggregation; the default setting is 0 (first button from the left)
		 * @returns {sap.fe.test.api.DialogAPI} The new instance
		 * @class
		 * @private
		 */
		var DialogAPI = function (oDialogBuilder, vDialogDescription, iConfirmButtonIndex) {
			if (!Utils.isOfType(oDialogBuilder, DialogBuilder)) {
				throw new Error("oDialogBuilder parameter must be a DialogBuilder instance");
			}
			this._iConfirmButtonIndex = iConfirmButtonIndex || 0;
			this._iConfirmDiscardDraftButtonIndex = this._iConfirmButtonIndex + 1; // second button in the list
			return BaseAPI.call(this, oDialogBuilder, vDialogDescription);
		};
		DialogAPI.prototype = Object.create(BaseAPI.prototype);
		DialogAPI.prototype.constructor = DialogAPI;

		/**
		 * Creates a matcher for fields within create and action dialogs.
		 *
		 * @param {sap.fe.test.api.FieldIdentifier | string} vFieldIdentifier Identifier to be used for the matcher
		 * @param {object} oDialogIdentifier Identifier for the dialog (create/action)
		 * @returns {object} A matcher
		 * @private
		 */
		DialogAPI.prototype._createFieldMatcher = function (vFieldIdentifier, oDialogIdentifier) {
			var vMatcher, sFieldId;
			if (!Utils.isOfType(vFieldIdentifier, String)) {
				if (typeof vFieldIdentifier.property === "string") {
					sFieldId =
						oDialogIdentifier && oDialogIdentifier.type === "Create"
							? "CreateDialog::" + vFieldIdentifier.property.replaceAll("/", "::")
							: "APD_::" + vFieldIdentifier.property.replaceAll("/", "::");
				} else {
					throw new Error(
						"The 'property' parameter for creating a control ID for a field in an action dialog is not supported: " +
							vFieldIdentifier.property
					);
				}
				vMatcher = FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}", sFieldId)));
			} else {
				// identify a field by its label
				//vMatcher = FEBuilder.Matchers.label(vFieldIdentifier);
			}
			return vMatcher;
		};

		DialogAPI.prototype._createFieldBuilder = function (vFieldIdentifier, oDialogIdentifier) {
			var oMdcFieldBuilder = new MdcFieldBuilder(this.getOpaInstance());
			return oMdcFieldBuilder
				.isDialogElement()
				.hasType("sap.ui.mdc.Field")
				.has(this._createFieldMatcher(vFieldIdentifier, oDialogIdentifier));
		};

		DialogAPI.prototype._getConfirmButtonMatcher = function () {
			var iConfirmButtonIndex = this._iConfirmButtonIndex;
			return function (oButton) {
				var aButtons = oButton.getParent().getButtons();
				// Confirm is (usually) the first button
				return aButtons.indexOf(oButton) === Math.min(aButtons.length - 1, iConfirmButtonIndex);
			};
		};

		DialogAPI.prototype._getCancelButtonMatcher = function () {
			var iConfirmButtonIndex = this._iConfirmButtonIndex;
			return function (oButton) {
				var aButtons = oButton.getParent().getButtons();
				// Cancel is (usually) right next to the first (confirm) button and (usually) the last one in the list
				return aButtons.length > 2
					? aButtons.indexOf(oButton) === aButtons.length - 1
					: aButtons.indexOf(oButton) === Math.min(aButtons.length - 1, iConfirmButtonIndex + 1);
			};
		};

		DialogAPI.prototype._getConfirmDiscardDraftButtonMatcher = function () {
			var iConfirmDiscardDraftButtonIndex = this._iConfirmDiscardDraftButtonIndex;
			return function (oButton) {
				var aButtons = oButton.getParent().getButtons();
				// for the KeepDraft/DiscardDraft message, the DiscardDraft button is the second in the list
				return aButtons.indexOf(oButton) === iConfirmDiscardDraftButtonIndex;
			};
		};

		return DialogAPI;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/DialogActions", ["./DialogAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder"], function (DialogAPI, Utils, OpaBuilder) {
	"use strict";

	/**
	 * Constructs a new DialogActions instance.
	 *
	 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
	 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
	 * @param {number} [iConfirmButtonIndex] Index of the 'confirm' button in the button aggregation; the default setting is 0 (first button from the left)
	 * @returns {sap.fe.test.api.DialogActions} The new DialogActions instance
	 * @alias sap.fe.test.api.DialogActions
	 * @class
	 * @hideconstructor
	 * @public
	 */
	var DialogActions = function (oDialogBuilder, vDialogDescription, iConfirmButtonIndex) {
		return DialogAPI.call(this, oDialogBuilder, vDialogDescription, iConfirmButtonIndex);
	};
	DialogActions.prototype = Object.create(DialogAPI.prototype);
	DialogActions.prototype.constructor = DialogActions;
	DialogActions.prototype.isAction = true;

	/**
	 * Confirms the dialog by clicking the corresponding button (for example, 'OK').
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	DialogActions.prototype.iConfirm = function () {
		return this.prepareResult(
			this.getBuilder()
				.doPressFooterButton(this._getConfirmButtonMatcher())
				.description(Utils.formatMessage("Confirming dialog '{0}'", this.getIdentifier()))
				.execute()
		);
	};

	/**
	 * Cancels the dialog by clicking the corresponding button (for example, 'Cancel').
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	DialogActions.prototype.iCancel = function () {
		return this.prepareResult(
			this.getBuilder()
				.doPressFooterButton(this._getCancelButtonMatcher())
				.description(Utils.formatMessage("Cancelling dialog '{0}'", this.getIdentifier()))
				.execute()
		);
	};

	/**
	 * Closes the dialog by pressing the 'Escape' key.
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	DialogActions.prototype.iClose = function () {
		return this.prepareResult(
			this.getBuilder()
				.doPressKeyboardShortcut("Escape")
				.description(Utils.formatMessage("Closing dialog '{0}'", this.getIdentifier()))
				.execute()
		);
	};

	/**
	 * Changes the content of a field in a dialog.
	 *
	 * @param {sap.fe.test.api.DialogFieldIdentifier} vFieldIdentifier The identifier of the field
	 * @param {string} [vValue] The new target value.
	 * @param {boolean} [bClearFirst] Set to <code>true</code> to clear previously set filters, otherwise all previously set values will be kept
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
	 * @public
	 */
	DialogActions.prototype.iChangeDialogField = function (vFieldIdentifier, vValue, bClearFirst) {
		var aArguments = Utils.parseArguments([Object, String, Boolean], arguments);
		return this.prepareResult(
			this._createFieldBuilder(vFieldIdentifier, this.getIdentifier())
				.doChangeValue(aArguments[1], aArguments[2])
				.description(
					Utils.formatMessage(
						"Changing the field '{1}' of dialog '{0}' by adding '{2}' (was cleared first: {3})",
						this.getIdentifier(),
						aArguments[0],
						aArguments[1],
						!!aArguments[2]
					)
				)
				.execute()
		);
	};

	/**
	 * Changes the content of a field in an action parameter dialog.
	 *
	 * Deprecated: Please use dialog action iChangeDialogField.
	 *
	 * @param {sap.fe.test.api.ActionDialogFieldIdentifier} vFieldIdentifier The identifier of the field
	 * @param {string} [vValue] The new target value.
	 * @param {boolean} [bClearFirst] Set to <code>true</code> to clear previously set filters, otherwise all previously set values will be kept
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
	 * @ui5-restricted
	 */
	DialogActions.prototype.iChangeActionParameterDialogField = function (vFieldIdentifier, vValue, bClearFirst) {
		return this.iChangeDialogField(vFieldIdentifier, vValue, bClearFirst);
	};

	return DialogActions;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/DialogAssertions", ["./DialogAPI", "sap/fe/test/Utils"], function (DialogAPI, Utils) {
	"use strict";

	/**
	 * Constructs a new DialogAssertions instance.
	 *
	 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
	 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
	 * @param {number} [iConfirmButtonIndex] Index of the 'confirm' button in the button aggregation; the default setting is 0 (first button from the left)
	 * @returns {sap.fe.test.api.DialogAssertions} The new instance
	 * @alias sap.fe.test.api.DialogAssertions
	 * @class
	 * @hideconstructor
	 * @public
	 */
	var DialogAssertions = function (oDialogBuilder, vDialogDescription, iConfirmButtonIndex) {
		return DialogAPI.call(this, oDialogBuilder, vDialogDescription, iConfirmButtonIndex);
	};
	DialogAssertions.prototype = Object.create(DialogAPI.prototype);
	DialogAssertions.prototype.constructor = DialogAssertions;
	DialogAssertions.prototype.isAction = false;

	/**
	 * Checks the dialog.
	 *
	 * @param {object} [mDialogState] Defines the expected state of the dialog
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	DialogAssertions.prototype.iCheckState = function (mDialogState) {
		return this.prepareResult(
			this.getBuilder()
				.hasState(mDialogState)
				.description(Utils.formatMessage("Checking dialog '{0}' in state '{1}'", this.getIdentifier(), mDialogState))
				.execute()
		);
	};

	/**
	 * Checks the confirmation button of the dialog.
	 *
	 * @param {object} [mButtonState] Defines the expected state of the button
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	DialogAssertions.prototype.iCheckConfirm = function (mButtonState) {
		return this.prepareResult(
			this.getBuilder()
				.hasFooterButton(this._getConfirmButtonMatcher(), mButtonState)
				.description(
					Utils.formatMessage(
						"Checking dialog '{0}' having confirmation button with state '{1}'",
						this.getIdentifier(),
						mButtonState
					)
				)
				.execute()
		);
	};

	/**
	 * Checks the cancellation button of the dialog.
	 *
	 * @param {object} [mButtonState] Defines the expected state of the button
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	DialogAssertions.prototype.iCheckCancel = function (mButtonState) {
		return this.prepareResult(
			this.getBuilder()
				.hasFooterButton(this._getCancelButtonMatcher(), mButtonState)
				.description(
					Utils.formatMessage(
						"Checking dialog '{0}' having cancellation button with state '{1}'",
						this.getIdentifier(),
						mButtonState
					)
				)
				.execute()
		);
	};

	/**
	 * Checks the content and state of a field in a dialog.
	 *
	 * @param {sap.fe.test.api.DialogFieldIdentifier} vFieldIdentifier The identifier of the field
	 * @param {string | Array | object} [vValue] Expected value(s) of the field.
	 * if passed as an object, the following pattern will be considered:
	 * <code><pre>
	 * {
	 *     value: <string>, 		// optional
	 * }
	 * </pre></code>
	 * @param {object} [mState] Defines the expected state of the field
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	DialogAssertions.prototype.iCheckDialogField = function (vFieldIdentifier, vValue, mState) {
		var aArguments = Utils.parseArguments([Object, [String, Array, Object], Object], arguments);
		return this.prepareResult(
			this._createFieldBuilder(vFieldIdentifier, this.getIdentifier())
				.hasValue(aArguments[1])
				.hasState(aArguments[2])
				.description(
					Utils.formatMessage(
						"Checking field '{1}' of dialog '{0}' with content '{2}' and state '{3}'",
						this.getIdentifier(),
						aArguments[0],
						aArguments[1],
						aArguments[2]
					)
				)
				.execute()
		);
	};

	/**
	 * Checks the content and state of a field in an action parameter dialog.
	 *
	 * @param {sap.fe.test.api.ActionDialogFieldIdentifier} vFieldIdentifier The identifier of the field
	 * @param {string | Array | object} [vValue] Expected value(s) of the field.
	 * if passed as an object, the following pattern will be considered:
	 * <code><pre>
	 * {
	 *     value: <string>, 		// optional
	 * }
	 * </pre></code>
	 * @param {object} [mState] Defines the expected state of the field
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	DialogAssertions.prototype.iCheckActionParameterDialogField = function (vFieldIdentifier, vValue, mState) {
		return this.iCheckDialogField(vFieldIdentifier, vValue, mState);
	};

	return DialogAssertions;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/DialogCreateActions", ["./DialogActions", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder"], function (DialogActions, Utils, OpaBuilder) {
	"use strict";

	/**
	 * Constructs a new DialogCreateActions instance.
	 *
	 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
	 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
	 * @returns {sap.fe.test.api.DialogCreateActions} The new instance
	 * @extends sap.fe.test.api.DialogActions
	 * @alias sap.fe.test.api.DialogCreateActions
	 * @class
	 * @hideconstructor
	 * @public
	 */
	var DialogCreateActions = function (oDialogBuilder, vDialogDescription) {
		return DialogActions.call(this, oDialogBuilder, vDialogDescription, 0);
	};
	DialogCreateActions.prototype = Object.create(DialogActions.prototype);
	DialogCreateActions.prototype.constructor = DialogCreateActions;
	DialogCreateActions.prototype.isAction = true;

	/**
	 * Executes the <code>Create</code> action on the create dialog.
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	DialogCreateActions.prototype.iExecuteCreate = function () {
		return this.prepareResult(
			this.getBuilder()
				.doPressFooterButton(
					OpaBuilder.Matchers.resourceBundle("text", "sap.fe.core", "C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON")
				)
				.description(Utils.formatMessage("Pressing create button on dialog '{0}'", this.getIdentifier()))
				.execute()
		);
	};

	return DialogCreateActions;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/DialogCreateAssertions", ["./DialogAssertions", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/fe/test/Utils"],
	function (DialogAssertions, OpaBuilder, FEBuilder, Utils) {
		"use strict";

		/**
		 * Constructs a new DialogCreateAssertions instance.
		 *
		 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
		 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
		 * @returns {sap.fe.test.api.DialogCreateAssertions} The new instance
		 * @extends sap.fe.test.api.DialogAssertions
		 * @alias sap.fe.test.api.DialogCreateAssertions
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var DialogCreateAssertions = function (oDialogBuilder, vDialogDescription) {
			return DialogAssertions.call(this, oDialogBuilder, vDialogDescription, 0);
		};
		DialogCreateAssertions.prototype = Object.create(DialogAssertions.prototype);
		DialogCreateAssertions.prototype.constructor = DialogCreateAssertions;
		DialogCreateAssertions.prototype.isAction = false;

		/**
		 * Checks the <code>Create</code> action on the dialog.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		DialogCreateAssertions.prototype.iCheckCreate = function (mState) {
			return this.prepareResult(
				this.getBuilder()
					.hasFooterButton(
						OpaBuilder.Matchers.resourceBundle("text", "sap.fe.core", "C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON"),
						mState
					)
					.description(
						Utils.formatMessage("Checking that dialog '{0}' has create button with state '{1}'", this.getIdentifier(), mState)
					)
					.execute()
			);
		};

		return DialogCreateAssertions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/DialogHelper", ["./DialogAPI"], function (DialogAPI) {
	"use strict";

	return {
		/**
		 * A helper function that ensures that a draft is available and confirmed.
		 *
		 * @param {object} When The Opa5 When chain
		 * @param {object} Then The Opa5 Then chain
		 * @param {object} oParams The general object describing the parameters for this function
		 * @param {boolean} oParams.secondPage Optional boolean to describe whether the test is executed on the second or detailpage
		 * @param {string} oParams.formSection The form section on which the change shall be applied
		 * @param {string} oParams.fieldGroup The optional field group on which the change shall be applied, defaulted to "OrderData"
		 * @param {boolean} oParams.noFieldGroup The optional boolean parameter to remove the default fieldgroup again
		 * @param {object} oParams.changeField The field to be changed in a key value relationship
		 * @param {string} oParams.draftOption The draftOption that should be used in this helper, default "draftDataLossOptionKeep"
		 */
		iProcessDraftDataLossDialog: function (When, Then, oParams) {
			var loParams = oParams || {};
			var pageKey = loParams.secondPage ? "onTheSecondDetailPage" : "onTheDetailPage";
			var formSection = loParams.formSection ? loParams.formSection : "GeneralInfo";
			var changeField = loParams.changeField
				? loParams.changeField
				: {
						PurchaseOrderByCustomer: "CHANGED" //default field with "changed value"
				  };

			var draftOption = loParams.draftOption ? loParams.draftOption : "draftDataLossOptionKeep";
			var sGoToSection = loParams.goToSection ? loParams.goToSection : false;

			var aFields = Object.keys(changeField);
			var sFieldProperty;
			var sValue;
			if (aFields.length === 1) {
				var lsKey = aFields[0];
				sFieldProperty = lsKey;
				sValue = changeField[sFieldProperty];
			} // TODO: potentially prepare more use cases with multi changing fields

			var oFormSettings = { section: formSection };

			oFormSettings.fieldGroup = loParams.fieldGroup ? oFormSettings.fieldGroup : "OrderData";
			if (loParams.noFieldGroup) {
				delete oFormSettings["fieldGroup"];
			}

			if (sGoToSection) {
				When[pageKey].iGoToSection(sGoToSection);
			}

			When[pageKey].onForm(oFormSettings).iChangeField({ property: sFieldProperty }, sValue);
			Then[pageKey].onFooter().iCheckDraftStateSaved();
			When.onTheShell.iNavigateBack();
			When[pageKey].onMessageDialog().iSelectDraftDataLossOption(draftOption);
			When[pageKey].onMessageDialog().iConfirm();
		}
	};
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/DialogMassEditActions", ["./DialogActions", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"],
	function (DialogActions, Utils, OpaBuilder, FEBuilder) {
		"use strict";

		/**
		 * Constructs a new DialogMassEditActions instance.
		 *
		 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
		 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
		 * @returns {sap.fe.test.api.DialogMassEditActions} The new instance
		 * @extends sap.fe.test.api.DialogActions
		 * @alias sap.fe.test.api.DialogMassEditActions
		 * @class
		 * @hideconstructor
		 * @private
		 */
		var DialogMassEditActions = function (oDialogBuilder, vDialogDescription) {
			return DialogActions.call(this, oDialogBuilder, vDialogDescription, 0);
		};
		DialogMassEditActions.prototype = Object.create(DialogActions.prototype);
		DialogMassEditActions.prototype.constructor = DialogMassEditActions;
		DialogMassEditActions.prototype.isAction = true;

		/**
		 * A mass edit field identifier
		 *
		 * @typedef {object} MassEditFieldIdentifier
		 * @property {string} property The name of the property
		 * @name sap.fe.test.api.MassEditFieldIdentifier
		 * @private
		 */

		/**
		 * A mass edit field value
		 *
		 * @typedef {object} MassEditValue
		 * @property {string} dropDownText The dropdown text for the selection
		 * @property {string} rawText The raw text for the selection
		 * @name sap.fe.test.api.MassEditValue
		 * @private
		 */

		/**
		 * Changes the value of the defined filter field.
		 *
		 * @param {string | sap.fe.test.api.MassEditFieldIdentifier} vMassEditFieldIdentifier The identifier for the mass edit field
		 * @param {string | sap.fe.test.api.MassEditValue} vMassEditValue The new target value
		 * @param {object} [mState] The state of the mass edit field
		 * @param {object} [mProperties] The Properties of the mass edit field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @private
		 */
		DialogMassEditActions.prototype.iChangeField = function (vMassEditFieldIdentifier, vMassEditValue, mState, mProperties) {
			var that = this,
				sProperty = Utils.isOfType(vMassEditFieldIdentifier, String) ? vMassEditFieldIdentifier : vMassEditFieldIdentifier.property,
				vValue = vMassEditValue && (Utils.isOfType(vMassEditValue, String) ? { rawText: vMassEditValue } : vMassEditValue),
				fieldRegEx = new RegExp("^MED(.*)" + sProperty + "$", "gi");

			return that.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.has(FEBuilder.Matchers.id(fieldRegEx))
					.hasState(mState)
					.hasProperties(mProperties)
					.doPress()
					.success(function (aSelect) {
						var oRet,
							oSelect = aSelect[0],
							sControlType = oSelect.getMetadata().getName();
						if (vValue.dropDownText) {
							oRet = OpaBuilder.create()
								.hasType("sap.ui.core.Item")
								.has(OpaBuilder.Matchers.ancestor(oSelect[0], false))
								.hasProperties({ text: vValue.dropDownText })
								.doPress()
								.description(
									Utils.formatMessage(
										"Value '{3}' selected for '{0}' in mass edit dialog '{1}'",
										sProperty,
										that.getIdentifier(),
										vValue.dropDownText
									)
								)
								.execute();
						} else if (vValue.rawText && sControlType === "sap.m.ComboBox") {
							oRet = OpaBuilder.create()
								.hasId(oSelect.getId())
								.doEnterText(vValue.rawText)
								.description(
									Utils.formatMessage(
										"Value '{3}' entered for '{0}' in mass edit dialog '{1}'",
										sProperty,
										that.getIdentifier(),
										vValue.rawText
									)
								)
								.execute();
						}

						return oRet;
					})
					.description(Utils.formatMessage("Mass edit dropdown for '{0}' found in dialog '{1}'", sProperty, that.getIdentifier()))
					.execute()
			);
		};

		return DialogMassEditActions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/DialogMassEditAssertions", ["./DialogAssertions", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/fe/test/Utils"],
	function (DialogAssertions, OpaBuilder, FEBuilder, Utils) {
		"use strict";

		/**
		 * Constructs a new DialogMassEditAssertions instance.
		 *
		 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
		 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
		 * @returns {sap.fe.test.api.DialogMassEditAssertions} The new instance
		 * @extends sap.fe.test.api.DialogAssertions
		 * @alias sap.fe.test.api.DialogMassEditAssertions
		 * @class
		 * @hideconstructor
		 * @private
		 */
		var DialogMassEditAssertions = function (oDialogBuilder, vDialogDescription) {
			return DialogAssertions.call(this, oDialogBuilder, vDialogDescription, 0);
		};
		DialogMassEditAssertions.prototype = Object.create(DialogAssertions.prototype);
		DialogMassEditAssertions.prototype.constructor = DialogMassEditAssertions;
		DialogMassEditAssertions.prototype.isAction = false;

		/**
		 * A mass edit field identifier
		 *
		 * @typedef {object} MassEditFieldIdentifier
		 * @property {string} property The name of the property
		 * @name sap.fe.test.api.MassEditFieldIdentifier
		 * @private
		 */

		/**
		 * A mass edit field value
		 *
		 * @typedef {object} MassEditValue
		 * @property {string} dropDownText The dropdown text for the selection
		 * @property {string} rawText The raw text for the selection
		 * @name sap.fe.test.api.MassEditValue
		 * @private
		 */

		/**
		 * Check the value of the defined filter field.
		 *
		 * @param {string | sap.fe.test.api.MassEditFieldIdentifier} vMassEditFieldIdentifier The identifier for the mass edit field
		 * @param {string | sap.fe.test.api.MassEditValue} vMassEditValue The new target value
		 * @param {object} [mState] The state of the mass edit field
		 * @param {object} [mProperties] The Properties of the mass edit field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @private
		 */
		DialogMassEditAssertions.prototype.iCheckField = function (vMassEditFieldIdentifier, vMassEditValue, mState, mProperties) {
			var that = this,
				sProperty = Utils.isOfType(vMassEditFieldIdentifier, String) ? vMassEditFieldIdentifier : vMassEditFieldIdentifier.property,
				vValue =
					vMassEditValue &&
					(Utils.isOfType(vMassEditValue, String) ? vMassEditValue : vMassEditValue.rawText || vMassEditValue.dropDownText),
				fieldRegEx = new RegExp("^MED(.*)" + sProperty + "$", "gi");
			var sControlType;

			var vTest = FEBuilder.create(this.getOpaInstance()).isDialogElement();
			var vIdMatcher = FEBuilder.Matchers.id(fieldRegEx);
			var vMatcher = [FEBuilder.Matchers.states(mState), vIdMatcher];
			if (mState && mState.visible === false) {
				// two possibilities for non-visible action: either visible property is false, or the control wasn't rendered at all
				vMatcher = OpaBuilder.Matchers.some(vMatcher, OpaBuilder.Matchers.not(vIdMatcher));
				vTest = vTest.has(vMatcher);
			} else {
				vTest = vTest
					.has(vMatcher)
					.hasProperties(mProperties)
					.check(function (aSelect) {
						sControlType = aSelect && aSelect[0] && aSelect[0].getMetadata().getName();
						return (
							aSelect.length === 1 &&
							(sControlType === "sap.m.ComboBox" || sControlType === "sap.fe.core.controls.MassEditSelect")
						);
					})
					.success(function (aSelect) {
						var oSelect = aSelect[0],
							oRet = OpaBuilder.create().hasId(oSelect.getId());

						if (sControlType === "sap.m.ComboBox") {
							oRet = oRet.hasProperties({ value: vValue });
						} else if (sControlType === "sap.fe.core.controls.MassEditSelect") {
							oRet = oRet.has(function (oSelectControl) {
								return oSelectControl.getSelectedItem() ? oSelectControl.getSelectedItem().getText() === vValue : false;
							});
						}

						return oRet
							.description(
								Utils.formatMessage(
									"Value selection '{3}' found for '{0}' in mass edit dialog '{1}'",
									sProperty,
									that.getIdentifier(),
									vValue.toString()
								)
							)
							.execute();
					})
					.description(
						Utils.formatMessage("Mass edit dropdown for '{0}' found in dialog '{1}'", sProperty, that.getIdentifier())
					);
			}

			return that.prepareResult(vTest.execute());
		};

		/**
		 * Check the suggestions of the defined filter field.
		 *
		 * @param {string | sap.fe.test.api.MassEditFieldIdentifier} vMassEditFieldIdentifier The identifier for the mass edit field
		 * @param {string | sap.fe.test.api.MassEditValue} vMassEditValue The new target value
		 * @param {object} [mState] The state of the mass edit field
		 * @param {object} [mProperties] The Properties of the mass edit field
		 * @param {boolean} [bExists] Should the suggestion exist. Default is true
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @private
		 */
		DialogMassEditAssertions.prototype.iCheckFieldSuggestions = function (
			vMassEditFieldIdentifier,
			vMassEditValue,
			mState,
			mProperties,
			bExists
		) {
			var that = this,
				sProperty = Utils.isOfType(vMassEditFieldIdentifier, String) ? vMassEditFieldIdentifier : vMassEditFieldIdentifier.property,
				vValue =
					vMassEditValue &&
					(Utils.isOfType(vMassEditValue, String) ? vMassEditValue : vMassEditValue.dropDownText || vMassEditValue.rawText),
				fieldRegEx = new RegExp("^MED(.*)" + sProperty + "$", "gi");

			return that.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasId(fieldRegEx)
					.hasState(mState)
					.hasProperties(mProperties)
					.check(function (aSelect) {
						var oRet = false,
							oSelect = aSelect && aSelect[0],
							sControlType = aSelect && aSelect[0] && aSelect[0].getMetadata().getName();

						if (
							aSelect.length === 1 &&
							(sControlType === "sap.m.ComboBox" || sControlType === "sap.fe.core.controls.MassEditSelect")
						) {
							var aItems = oSelect.getItems(),
								iIndex = (aItems || []).findIndex(function (oItem) {
									return oItem.getText() === vValue;
								}),
								bFound = iIndex != -1;

							oRet = (bExists !== false) === bFound;
						}
						return oRet;
					})
					.description(Utils.formatMessage("Mass edit dropdown for '{0}' found in dialog '{1}'", sProperty, that.getIdentifier()))
					.execute()
			);
		};

		return DialogMassEditAssertions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/DialogMessageActions", ["./DialogActions", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"],
	function (DialogActions, Utils, OpaBuilder, FEBuilder) {
		"use strict";

		/**
		 * Constructs a new DialogMessageActions instance.
		 *
		 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
		 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
		 * @returns {sap.fe.test.api.DialogMessageActions} The new instance
		 * @extends sap.fe.test.api.DialogActions
		 * @alias sap.fe.test.api.DialogMessageActions
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var DialogMessageActions = function (oDialogBuilder, vDialogDescription) {
			return DialogActions.call(this, oDialogBuilder, vDialogDescription, 0);
		};
		DialogMessageActions.prototype = Object.create(DialogActions.prototype);
		DialogMessageActions.prototype.constructor = DialogMessageActions;
		DialogMessageActions.prototype.isAction = true;

		/**
		 * Executes the <code>Back</code> action on the message dialog.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		DialogMessageActions.prototype.iExecuteBack = function () {
			return this.prepareResult(
				this.getBuilder()
					.doPressHeaderButton(OpaBuilder.Matchers.properties({ icon: "sap-icon://nav-back" }))
					.description(Utils.formatMessage("Pressing back button on dialog '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Executes the <code>Refresh</code> action on the message dialog.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		DialogMessageActions.prototype.iExecuteRefresh = function () {
			return this.prepareResult(
				this.getBuilder()
					.doPressFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.fe.core", "C_COMMON_SAPFE_REFRESH"))
					.description(Utils.formatMessage("Pressing refresh button on dialog '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Selects the specified entry in the draft data loss popup.
		 *
		 * @param {any} optionKey
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		DialogMessageActions.prototype.iSelectDraftDataLossOption = function (optionKey) {
			// The logic below uses customData for identifying the entry in list in the dialog
			// which needs to be pressed
			// The dialog's XML fragment for the custom data and the used keys
			return this.prepareResult(
				FEBuilder.create()
					.hasType("sap.m.List")
					.isDialogElement(true)
					.has(OpaBuilder.Matchers.aggregation("items"))
					.has(function (oItem) {
						return oItem.find(function (element) {
							return element.data("itemKey") === optionKey;
						});
					})
					.doPress()
					.description("Selecting option with key {0} in draft data loss popup")
					.execute()
			);
		};

		return DialogMessageActions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/DialogMessageAssertions", ["./DialogAssertions", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/fe/test/Utils"],
	function (DialogAssertions, OpaBuilder, FEBuilder, Utils) {
		"use strict";

		/**
		 * Constructs a new DialogMessageActions instance.
		 *
		 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
		 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
		 * @returns {sap.fe.test.api.DialogMessageAssertions} The new instance
		 * @extends sap.fe.test.api.DialogAssertions
		 * @alias sap.fe.test.api.DialogMessageAssertions
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var DialogMessageAssertions = function (oDialogBuilder, vDialogDescription) {
			return DialogAssertions.call(this, oDialogBuilder, vDialogDescription, 0);
		};
		DialogMessageAssertions.prototype = Object.create(DialogAssertions.prototype);
		DialogMessageAssertions.prototype.constructor = DialogMessageAssertions;
		DialogMessageAssertions.prototype.isAction = false;

		/**
		 * Checks the <code>Back</code> action on the message dialog.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		DialogMessageAssertions.prototype.iCheckBack = function (mState) {
			return this.prepareResult(
				this.getBuilder()
					.hasHeaderButton(OpaBuilder.Matchers.properties({ icon: "sap-icon://nav-back" }), mState)
					.description(
						Utils.formatMessage("Checking that dialog '{0}' has a back button with state '{1}'", this.getIdentifier(), mState)
					)
					.execute()
			);
		};

		/**
		 * Checks the <code>Refresh</code> action on the dialog.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		DialogMessageAssertions.prototype.iCheckRefresh = function (mState) {
			return this.prepareResult(
				this.getBuilder()
					.hasFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.fe.core", "C_COMMON_SAPFE_REFRESH"), mState)
					.description(
						Utils.formatMessage(
							"Checking that dialog '{0}' has a refresh button with state '{1}'",
							this.getIdentifier(),
							mState
						)
					)
					.execute()
			);
		};

		/**
		 * Checks whether a certain message is shown in the dialog.
		 *
		 * @param {object} [oMessage] Defines the expected state of the message, e.g. <code>{ title: "My message" }</code>
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		DialogMessageAssertions.prototype.iCheckMessage = function (oMessage) {
			return this.prepareResult(
				this.getBuilder()
					.hasContent(FEBuilder.Matchers.states({ controlType: "sap.m.MessageView" }), true)
					.hasAggregation("items", OpaBuilder.Matchers.properties(oMessage))
					.description(Utils.formatMessage("Checking dialog '{0}' having a message '{1}' ", this.getIdentifier(), oMessage))
					.execute()
			);
		};

		return DialogMessageAssertions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/DialogType", [],
	function () {
		"use strict";

		/**
		 * Enum for supported dialog types.
		 *
		 * @name sap.fe.test.api.DialogType
		 * @enum {string}
		 * @public
		 */
		return {
			/**
			 * A simple dialog supporting base checks and actions such as 'Confirm' and 'Cancel'
			 *
			 * @name sap.fe.test.api.DialogType.Confirmation
			 * @constant
			 * @type {string}
			 * @public
			 */
			Confirmation: "Confirmation",
			/**
			 * A ValueHelp dialog that has a condition definition panel or a filterable selection table
			 *
			 * @name sap.fe.test.api.DialogType.ValueHelp
			 * @constant
			 * @type {string}
			 * @public
			 */
			ValueHelp: "ValueHelp",
			/**
			 * A message dialog for showing back-end messages
			 *
			 * @name sap.fe.test.api.DialogType.Message
			 * @constant
			 * @type {string}
			 * @public
			 */
			Message: "Message",
			/**
			 * A dialog used for showing an error message
			 *
			 * @name sap.fe.test.api.DialogType.Error
			 * @constant
			 * @type {string}
			 * @public
			 */
			Error: "Error",
			/**
			 * A default dialog for action parameters
			 *
			 * @name sap.fe.test.api.DialogType.Action
			 * @constant
			 * @type {string}
			 * @public
			 */
			Action: "Action",
			/**
			 * A dialog used for creating a new object
			 *
			 * @name sap.fe.test.api.DialogType.Create
			 * @constant
			 * @type {string}
			 * @public
			 */
			Create: "Create",
			/**
			 * A dialog used for mass edit
			 *
			 * @name sap.fe.test.api.DialogType.MassEdit
			 * @constant
			 * @type {string}
			 * @private
			 */
			MassEdit: "MassEdit"
		};
	},
	true
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/DialogValueHelpActions", [
		"./DialogActions",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFilterBarBuilder",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/fe/test/builder/MdcFieldBuilder",
		"./FilterBarAPI",
		"./TableAPI"
	],
	function (DialogActions, Utils, OpaBuilder, FEBuilder, FilterBarBuilder, TableBuilder, FieldBuilder, FilterBarAPI, TableAPI) {
		"use strict";

		/**
		 * Constructs a new DialogValueHelpActions instance.
		 *
		 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
		 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
		 * @returns {sap.fe.test.api.DialogValueHelpActions} The new instance
		 * @extends sap.fe.test.api.DialogActions
		 * @alias sap.fe.test.api.DialogValueHelpActions
		 * @hideconstructor
		 * @class
		 * @public
		 */
		var DialogValueHelpActions = function (oDialogBuilder, vDialogDescription) {
			return DialogActions.call(this, oDialogBuilder, vDialogDescription, 0);
		};
		DialogValueHelpActions.prototype = Object.create(DialogActions.prototype);
		DialogValueHelpActions.prototype.constructor = DialogValueHelpActions;
		DialogValueHelpActions.prototype.isAction = true;

		/**
		 * Navigates to the <code>Search and Select</code> tab.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iGoToSearchAndSelect = function () {
			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.m.IconTabFilter")
					.has(FEBuilder.Matchers.id(/-VHP--fromList$/))
					.doPress()
					.description(Utils.formatMessage("Going to 'Search and Select' on value help dialog '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Navigates to the <code>Define Conditions</code> tab.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iGoToDefineConditions = function () {
			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.m.IconTabFilter")
					.has(FEBuilder.Matchers.id(/-VHP--defineCondition$/))
					.doPress()
					.description(Utils.formatMessage("Going to 'Define Conditions' on value help dialog '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Clicks the <code>Hide/Show Filters</code> button.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iExecuteShowHideFilters = function () {
			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.m.Button")
					.has(FEBuilder.Matchers.id(/::FilterBar-btnShowFilters$/))
					.doPress()
					.description(Utils.formatMessage("Pressing 'Show/Hide Filters' on value help dialog '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Changes the value of the search field.
		 *
		 * @param {string} [sSearchText] The new search value.
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iChangeSearchField = function (sSearchText) {
			var oFilterBarBuilder = FilterBarBuilder.create(this.getOpaInstance())
				.isDialogElement()
				.hasType("sap.ui.mdc.filterbar.vh.FilterBar");

			return this.prepareResult(
				oFilterBarBuilder
					.doChangeSearch(sSearchText)
					.description("Entering search text " + sSearchText)
					.execute()
			);
		};

		/**
		 * Starts the search.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iExecuteSearch = function () {
			var oFilterBarBuilder = FilterBarBuilder.create(this.getOpaInstance())
				.isDialogElement()
				.hasType("sap.ui.mdc.filterbar.vh.FilterBar");

			return this.prepareResult(oFilterBarBuilder.doSearch().description("Starting value help search field search").execute());
		};

		/**
		 * Resets the search field value.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iResetSearchField = function () {
			var oFilterBarBuilder = FilterBarBuilder.create(this.getOpaInstance())
				.isDialogElement()
				.hasType("sap.ui.mdc.filterbar.vh.FilterBar");

			return this.prepareResult(oFilterBarBuilder.doResetSearch().description("Resetting value help search field").execute());
		};

		/**
		 * Changes the value of a filter field.
		 *
		 * @param {string | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the filter field
		 * @param {string} [vValue] The new target value.
		 * @param {boolean} [bClearFirst] Set to <code>true</code> to clear previously set filters, otherwise all previously set values will be kept
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iChangeFilterField = function (vFieldIdentifier, vValue, bClearFirst) {
			var aArguments = Utils.parseArguments([[String, Object], String, Boolean], arguments),
				oFilterBarBuilder = FilterBarBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.filterbar.vh.FilterBar"),
				oFieldBuilder = FilterBarAPI.createFilterFieldBuilder(oFilterBarBuilder, aArguments[0]);

			return this.prepareResult(
				oFieldBuilder
					.doChangeValue(aArguments[1], aArguments[2])
					.description(
						Utils.formatMessage(
							"Changing the filter field '{1}' of value help dialog '{0}' by adding '{2}' (was cleared first: {3})",
							this.getIdentifier(),
							aArguments[0],
							aArguments[1],
							!!aArguments[2]
						)
					)
					.execute()
			);
		};

		/**
		 * Selects the specified rows.
		 *
		 * @param {object | number} [vRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * Alternatively, the 0-based row index can be used.
		 * @param {object} [mState] Defines the expected state of the row
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iSelectRows = function (vRowValues, mState) {
			var aArguments = Utils.parseArguments([[Object, Number], Object], arguments),
				oTableBuilder = TableBuilder.createWrapper(this.getOpaInstance(), "sap.ui.table.Table").isDialogElement();
			return this.prepareResult(
				oTableBuilder
					.doClickOnRow(TableAPI.createRowMatchers(aArguments[0], aArguments[1]))
					.description(
						Utils.formatMessage(
							"Selecting rows of table in value help dialog '{0}' with values='{1}' and state='{2}'",
							this.getIdentifier(),
							aArguments[0],
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Adds a new condition.
		 *
		 * @param {string} sOperator The condition operator, like EQ, BT, LT, GT (see also {@link sap.ui.model.filter.FilterOperator})
		 * @param {string | string[]} vValues The values to be set. If the operator requires more than one value, like BT (between),
		 * an array with the two entries is expected
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iAddCondition = function (sOperator, vValues) {
			return this.iChangeCondition(sOperator || "EQ", vValues, -1);
		};

		/**
		 * Changes an existing condition.
		 *
		 * @param {string} sOperator The condition operator, like EQ, BT, LT, GT (see also {@link sap.ui.model.filter.FilterOperator})
		 * @param {string | string[]} vValues The values to be set. If the operator requires more than one value like BT (between)
		 * an array with the two entries is expected
		 * @param {number} [iConditionIndex] The index of the condition to be altered. If not set, the index 0 is used
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iChangeCondition = function (sOperator, vValues, iConditionIndex) {
			iConditionIndex = iConditionIndex || 0;
			var bIsEmpty = vValues === undefined;
			vValues = bIsEmpty || Array.isArray(vValues) ? vValues : [vValues];
			var oCondition = {
				operator: sOperator,
				values: vValues,
				isEmpty: bIsEmpty,
				validated: "NotValidated"
			};
			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.field.DefineConditionPanel")
					.do(function (oConditionsPanel) {
						var aConditions = [].concat(oConditionsPanel.getConditions());
						if (iConditionIndex === -1) {
							aConditions.push(oCondition);
						} else {
							aConditions[iConditionIndex] = oCondition;
						}
						oConditionsPanel.setConditions(aConditions);
					})
					.description(
						Utils.formatMessage(
							"Changing {1} on value help dialog '{0}' to '{2}'",
							this.getIdentifier(),
							iConditionIndex === -1 ? "newly added condition" : "condition at index " + iConditionIndex,
							oCondition
						)
					)
					.execute()
			);
		};

		/**
		 * Removes an existing condition.
		 *
		 * @param {number} [iConditionIndex] The index of the condition to be removed. If not set, the index 0 is used
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpActions.prototype.iRemoveCondition = function (iConditionIndex) {
			iConditionIndex = iConditionIndex || 0;
			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.field.DefineConditionPanel")
					.do(function (oConditionsPanel) {
						var aConditions = [].concat(oConditionsPanel.getConditions());
						aConditions.splice(iConditionIndex, 1);
						oConditionsPanel.setConditions(aConditions);
					})
					.description(
						Utils.formatMessage(
							"Removing condition at index {1} on value help dialog '{0}'",
							this.getIdentifier(),
							iConditionIndex
						)
					)
					.execute()
			);
		};

		return DialogValueHelpActions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/DialogValueHelpAssertions", [
		"./DialogAssertions",
		"./FilterBarAPI",
		"./TableAPI",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFilterBarBuilder",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/fe/test/Utils"
	],
	function (DialogAssertions, FilterBarAPI, TableAPI, OpaBuilder, FEBuilder, FilterBarBuilder, TableBuilder, Utils) {
		"use strict";

		/**
		 * Constructs a new DialogValueHelpAssertions instance.
		 *
		 * @param {sap.fe.test.builder.DialogBuilder} oDialogBuilder The {@link sap.fe.test.builder.DialogBuilder} instance used to interact with the UI
		 * @param {string} [vDialogDescription] Description (optional) of the dialog to be used for logging messages
		 * @returns {sap.fe.test.api.DialogValueHelpAssertions} The new instance
		 * @extends sap.fe.test.api.DialogAssertions
		 * @alias sap.fe.test.api.DialogValueHelpAssertions
		 * @hideconstructor
		 * @class
		 * @public
		 */
		var DialogValueHelpAssertions = function (oDialogBuilder, vDialogDescription) {
			return DialogAssertions.call(this, oDialogBuilder, vDialogDescription, 0);
		};
		DialogValueHelpAssertions.prototype = Object.create(DialogAssertions.prototype);
		DialogValueHelpAssertions.prototype.constructor = DialogValueHelpAssertions;
		DialogValueHelpAssertions.prototype.isAction = false;

		/**
		 * Checks the filter bar.
		 *
		 * @param {object} [mState] Defines the expected state of the filter bar
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckFilterBar = function (mState) {
			return this.prepareResult(
				FilterBarBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.filterbar.vh.FilterBar")
					.hasState(mState)
					.description(
						Utils.formatMessage(
							"Checking that the value help dialog '{0}' has a filter bar with state='{1}'",
							this.getIdentifier(),
							mState
						)
					)
					.execute()
			);
		};

		/**
		 * Checks a filter field.
		 * If <code>vConditionValues</code> is <code>undefined</code>, the current condition values are ignored.
		 *
		 * @param {object | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the filter field
		 * @param {string|object|Array} [vConditionValues] The expected value(s) of the filter field
		 * @param {string} [sOperator] The expected operator
		 * @param {object} [mState] Defines the expected state of the filter field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckFilterField = function (vFieldIdentifier, vConditionValues, sOperator, mState) {
			var aArguments = Utils.parseArguments([[String, Object], [String, Array, Object, Boolean], String, Object], arguments),
				oFilterBarBuilder = FilterBarBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.filterbar.vh.FilterBar"),
				oFieldBuilder = FilterBarAPI.createFilterFieldBuilder(oFilterBarBuilder, aArguments[0], aArguments[3]);

			if (!aArguments[3] || aArguments[3].visible !== false) {
				oFieldBuilder.hasValue(aArguments[1], aArguments[2]);
			}

			return this.prepareResult(
				oFieldBuilder
					.description(
						Utils.formatMessage(
							"Checking that the field '{1}' in value help dialog '{0}' has condition values='{2}' and operator='{3}' and state='{4}'",
							this.getIdentifier(),
							aArguments[0],
							aArguments[1],
							aArguments[2],
							aArguments[3]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the search field in the filter bar. If the <code>sSearchText</code> parameter is <code>undefined</code>, the search text is not validated.
		 *
		 * @param {string} [sSearchText] The expected text in the search field
		 * @param {object} [mState] Defines the expected state of the search field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckSearchField = function (sSearchText, mState) {
			var aArguments = Utils.parseArguments([String, Object], arguments),
				oFilterBarBuilder = FilterBarBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.filterbar.vh.FilterBar");
			return this.prepareResult(
				oFilterBarBuilder
					.hasSearchField(aArguments[0], aArguments[1])
					.description(
						Utils.formatMessage(
							"Checking that the search field on value help dialog '{0}' has search text '{1}' and state='{2}'",
							this.getIdentifier(),
							aArguments[0] || "",
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the table.
		 *
		 * @param {object} [mState] Defines the expected state of the search field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckTable = function (mState) {
			return this.prepareResult(
				TableBuilder.createWrapper(this.getOpaInstance(), "sap.ui.table.Table")
					.isDialogElement()
					.hasState(mState)
					.description(
						Utils.formatMessage(
							"Checking that the value help dialog '{0}' has a table with state='{1}'",
							this.getIdentifier(),
							mState
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the rows of a table.
		 * If <code>mRowValues</code> is provided, only rows with the corresponding values are considered.
		 * If <code>iNumberOfRows</code> is provided, the number of rows are checked with respect to the provided <code>mRowValues</code> (if set) or in total.
		 * If <code>iNumberOfRows</code> is omitted, it checks for at least one matching row.
		 * If <code>mState</code> is provided, the row must be in the given state.
		 *
		 * @param {object} [mRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * @param {number} [iExpectedNumberOfRows] The expected number of rows considering <code>mRowValues</code> and <code>mRowState</code>
		 * @param {object} [mState] Defines the expected state of the target row
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckRows = function (mRowValues, iExpectedNumberOfRows, mState) {
			var aArguments = Utils.parseArguments([Object, Number, Object], arguments),
				iNumberOfRows = aArguments[1],
				aRowMatcher = TableAPI.createRowMatchers(aArguments[0], aArguments[2]),
				oTableBuilder = TableBuilder.createWrapper(this.getOpaInstance(), "sap.ui.table.Table").isDialogElement();

			// the order of the matchers matters here
			if (aRowMatcher.length) {
				// if matchers are defined, first match rows then check number of results
				oTableBuilder.hasRows(aRowMatcher, true).has(function (aRows) {
					return Utils.isOfType(iNumberOfRows, Number) ? aRows.length === iNumberOfRows : aRows.length > 0;
				});
			} else {
				// if no row matchers are defined, check the numbers of row based on table (binding)
				oTableBuilder
					.hasNumberOfRows(iNumberOfRows)
					// but still ensure that matcher returns the row aggregation
					.hasRows(null, true);
			}

			return this.prepareResult(
				oTableBuilder
					.description(
						Utils.formatMessage(
							"Checking that the table on value help dialog '{0}' has {1} rows with values='{2}' and state='{3}'",
							this.getIdentifier(),
							iNumberOfRows === undefined ? "> 0" : iNumberOfRows,
							aArguments[0],
							aArguments[2]
						)
					)
					.execute()
			);
		};

		function _checkTabBuilder(oApiInstance, sIdSuffix, mState) {
			var oBuilder = FEBuilder.create(oApiInstance.getOpaInstance())
					.isDialogElement()
					.mustBeVisible(false)
					.description(
						Utils.formatMessage(
							"Checking that the tab '{1}' on value help dialog '{0}' has state='{2}'",
							oApiInstance.getIdentifier(),
							sIdSuffix,
							mState
						)
					),
				oTabIdMatcher = FEBuilder.Matchers.id(RegExp(sIdSuffix + "$"));

			if (mState && mState.visible === false) {
				oBuilder.hasType("sap.m.IconTabBar");
				oBuilder.check(function (aIconTabFilters) {
					return OpaBuilder.Matchers.filter(oTabIdMatcher)(aIconTabFilters).length === 0;
				});
			} else {
				oBuilder.hasType("sap.m.IconTabFilter").has(oTabIdMatcher).hasState(mState);
			}

			return oApiInstance.prepareResult(oBuilder.execute());
		}

		/**
		 * Checks the <code>Search and Select</code> tab.
		 *
		 * @param {object} [mState] Defines the expected state of the filter bar
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckSearchAndSelect = function (mState) {
			return _checkTabBuilder(this, "-ITB--header-0", mState); // might be an issue, but there´s no stable id provided anymore
		};

		/**
		 * Checks the <code>Define conditions</code> tab.
		 *
		 * @param {object} [mState] Defines the expected state of the filter bar
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckDefineConditions = function (mState) {
			return _checkTabBuilder(this, "-ITB--header-1", mState); // might be an issue, but there´s no stable id provided anymore
		};
		/**
		 * Checks the dialog.
		 *
		 * @param {object} [mDialogState] Defines the expected state of the dialog
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		DialogValueHelpAssertions.prototype.iCheckState = function (mDialogState) {
			if (this.getIdentifier().type === "ValueHelp" && mDialogState && mDialogState.title && Object.keys(mDialogState).length === 1) {
				//TODO: check VH Dialog title
				return this.prepareResult(
					this.getBuilder()
						.has(function (oControl) {
							var sTitle = oControl.getParent && oControl.getParent() && oControl.getParent().getProperty("title");
							return sTitle && sTitle.indexOf(mDialogState.title) >= 0;
						})
						//.hasState(mDialogState)
						.description(Utils.formatMessage("Checking dialog '{0}' in state '{1}'", this.getIdentifier(), mDialogState))
						.execute()
				);
			} else {
				return this.prepareResult(
					this.getBuilder()
						.has(function (oControl) {
							var sTitle = oControl.getTitle && oControl.getTitle();
							if (mDialogState && sTitle === "Select: " + mDialogState.title) {
								oControl.setTitle(mDialogState.title); //TODO testing
							}
							return true;
						})
						.hasState(mDialogState)
						.description(Utils.formatMessage("Checking dialog '{0}' in state '{1}'", this.getIdentifier(), mDialogState))
						.execute()
				);
			}
		};

		return DialogValueHelpAssertions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/EditState", ["sap/fe/macros/filter/DraftEditState"],
	function (EditState) {
		"use strict";

		/**
		 * Enum for supported editing states.
		 *
		 * @name sap.fe.test.api.EditState
		 * @enum {string}
		 * @public
		 */
		return {
			/**
			 * All
			 *
			 * @name sap.fe.test.api.EditState.All
			 * @constant
			 * @type {string}
			 * @public
			 */
			All: EditState.ALL.id,
			/**
			 * Unchanged
			 *
			 * @name sap.fe.test.api.EditState.Unchanged
			 * @constant
			 * @type {string}
			 * @public
			 */
			AllHidingDrafts: EditState.ALL_HIDING_DRAFTS.id,
			/**
			 * All (Hiding Drafts)
			 *
			 * @name sap.fe.test.api.EditState.AllHidingDrafts
			 * @constant
			 * @type {string}
			 * @public
			 */
			Unchanged: EditState.UNCHANGED.id,
			/**
			 * Own Draft
			 *
			 * @name sap.fe.test.api.EditState.OwnDraft
			 * @constant
			 * @type {string}
			 * @public
			 */
			OwnDraft: EditState.OWN_DRAFT.id,
			/**
			 * Locked by Another User
			 *
			 * @name sap.fe.test.api.EditState.Locked
			 * @constant
			 * @type {string}
			 * @public
			 */
			Locked: EditState.LOCKED.id,
			/**
			 * Unsaved Changes by Another User
			 *
			 * @name sap.fe.test.api.EditState.UnsavedChanges
			 * @constant
			 * @type {string}
			 * @public
			 */
			UnsavedChanges: EditState.UNSAVED_CHANGES.id
		};
	},
	true
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/FilterBarAPI", [
		"./BaseAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/ui/test/actions/Action",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFilterBarBuilder",
		"sap/fe/test/builder/MdcFilterFieldBuilder"
	],
	function (BaseAPI, Utils, OpaBuilder, Action, FEBuilder, FilterBarBuilder, FilterFieldBuilder) {
		"use strict";

		/**
		 * A filter field identifier
		 *
		 * @typedef {object} FilterFieldIdentifier
		 * @property {string} property The name of the property
		 * @name sap.fe.test.api.FilterFieldIdentifier
		 * @public
		 */

		/**
		 * Constructs a new FilterBarAPI instance.
		 *
		 * @param {sap.fe.test.builder.FilterBarBuilder} oFilterBarBuilder The {@link sap.fe.test.builder.FilterBarBuilder} instance used to interact with the UI
		 * @param {string} [vFilterBarDescription] Description (optional) of the filter bar to be used for logging messages
		 * @returns {sap.fe.test.api.FilterBarAPI} The new instance
		 * @alias sap.fe.test.api.FilterBarAPI
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var FilterBarAPI = function (oFilterBarBuilder, vFilterBarDescription) {
			if (!Utils.isOfType(oFilterBarBuilder, FilterBarBuilder)) {
				throw new Error("oFilterBarBuilder parameter must be a FilterBarBuilder instance");
			}
			return BaseAPI.call(this, oFilterBarBuilder, vFilterBarDescription);
		};
		FilterBarAPI.prototype = Object.create(BaseAPI.prototype);
		FilterBarAPI.prototype.constructor = FilterBarAPI;

		/**
		 * Retrieve a filter field by its identifier.
		 *
		 * @param {sap.fe.test.builder.FilterBarBuilder} oFilterBarBuilder The builder of the filter bar to which the field belongs
		 * @param {string | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the field in the filter bar
		 * @param {any} mState
		 * @returns {sap.fe.test.builder.FilterFieldBuilder} The FieldBuilder instance
		 * @ui5-restricted
		 */
		FilterBarAPI.createFilterFieldBuilder = function (oFilterBarBuilder, vFieldIdentifier, mState) {
			var vFieldMatcher;

			if (Utils.isOfType(vFieldIdentifier, String)) {
				vFieldMatcher = OpaBuilder.Matchers.properties({ label: vFieldIdentifier });
			} else {
				vFieldMatcher = FEBuilder.Matchers.id(
					RegExp(Utils.formatMessage("::FilterField::{0}$", vFieldIdentifier.property.replace(/\/|\*\//g, "::")))
				);
			}
			oFilterBarBuilder.hasField(vFieldMatcher, mState, true);

			return FilterFieldBuilder.create(oFilterBarBuilder.getOpaInstance()).options(oFilterBarBuilder.build());
		};

		/**
		 * Opens the filter bar adaptation. It can be used in an action chain as well as in an assertion chain.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarAPI.prototype.iOpenFilterAdaptation = function () {
			var oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder
					.doOpenSettings()
					.success(
						// the default view is a basic ungrouped list with growing enabled - lets switch to the grouped view...
						FEBuilder.create(this.getOpaInstance())
							.isDialogElement()
							.hasType("sap.m.Button")
							.hasProperties({
								icon: "sap-icon://group-2"
							})
							.doPress()
							.success(
								// ...and expand all groups for easy testing...
								FEBuilder.create(this.getOpaInstance())
									.hasType("sap.m.Panel")
									.isDialogElement()
									// ...and ensure that all filter fields are visible by expanding all filter groups (panels) if not yet done
									.doConditional(function (oPanel) {
										return !oPanel.getExpanded();
									}, OpaBuilder.Actions.press("expandButton"))
							)
					)
					.description(Utils.formatMessage("Opening the filter bar adaptation dialog for '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Confirms the filter bar adaptation. It can be used in an action chain as well as in an assertion chain.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarAPI.prototype.iConfirmFilterAdaptation = function () {
			return this.prepareResult(
				FilterBarBuilder.createAdaptationDialogBuilder(this.getOpaInstance())
					.doPressFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.OK"))
					.description(Utils.formatMessage("Closing the filter bar adaptation dialog for '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Helper method to adapt filter fields. If no actions are given, this function can be used for checking only.
		 * During execution it checks for an already open adaptation popover. If it does not exist, it is opened before
		 * the check/interaction of the filter fields, and closed directly afterwards.
		 *
		 * @param {string | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the field
		 * @param {object} [mState] Defines the expected state of the adaptation filter field
		 * @param {Function|Array|sap.ui.test.actions.Action} [vActions] The actions to be executed on found adaptation field
		 * @param {string} sDescription The description of the check or adaptation
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		FilterBarAPI.prototype.filterFieldAdaptation = function (vFieldIdentifier, mState, vActions, sDescription) {
			var aArguments = Utils.parseArguments([[String, Object], Object, [Function, Array, Action], String], arguments),
				oBuilder = FEBuilder.create(this.getOpaInstance()),
				bPopoverOpen,
				oAdaptColumnBuilder = FEBuilder.create(this.getOpaInstance())
					// NOTE: when using List instead of Group layout, the type is sap.m.ColumnListItem (consider this when the switching layout option becomes available)
					.hasType("sap.m.CustomListItem")
					.isDialogElement(),
				oAdaptationDialogBuilder = FilterBarBuilder.createAdaptationDialogBuilder(this.getOpaInstance());

			vFieldIdentifier = aArguments[0];
			if (Utils.isOfType(vFieldIdentifier, String)) {
				oAdaptColumnBuilder.has(OpaBuilder.Matchers.bindingProperties(BaseAPI.MDC_P13N_MODEL, { label: vFieldIdentifier }));
			} else {
				oAdaptColumnBuilder.has(OpaBuilder.Matchers.bindingProperties(BaseAPI.MDC_P13N_MODEL, { name: vFieldIdentifier.property }));
			}

			mState = aArguments[1];
			if (mState.visible !== undefined) {
				mState.exists = mState.visible;
				delete mState.visible;
			}
			if (mState.selected !== undefined) {
				mState.visible = mState.selected;
				delete mState.selected;
			}
			var bCheckForNotVisible = mState && mState.exists === false;
			if (!bCheckForNotVisible && !Utils.isOfType(mState, [null, undefined])) {
				oAdaptColumnBuilder.has(OpaBuilder.Matchers.bindingProperties(BaseAPI.MDC_P13N_MODEL, mState));
			}

			vActions = aArguments[2];
			if (!Utils.isOfType(vActions, [null, undefined])) {
				oAdaptationDialogBuilder.do(vActions);
			}

			sDescription = aArguments[3];
			return this.prepareResult(
				oBuilder
					.success(
						function () {
							bPopoverOpen = FEBuilder.controlsExist(oAdaptationDialogBuilder);

							if (!bPopoverOpen) {
								this.iOpenFilterAdaptation();
							}

							if (!bPopoverOpen) {
								oAdaptationDialogBuilder.success(this.iConfirmFilterAdaptation.bind(this));
							}

							return oAdaptationDialogBuilder
								.has(OpaBuilder.Matchers.children(oAdaptColumnBuilder))
								.has(function (aFoundAdaptationColumns) {
									if (bCheckForNotVisible) {
										return aFoundAdaptationColumns.length === 0;
									}
									return FEBuilder.Matchers.atIndex(0)(aFoundAdaptationColumns);
								})
								.description(sDescription)
								.execute();
						}.bind(this)
					)
					.execute()
			);
		};

		return FilterBarAPI;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/FilterBarActions", [
		"./FilterBarAPI",
		"sap/fe/test/Utils",
		"sap/fe/macros/filter/DraftEditState",
		"sap/fe/test/builder/FEBuilder",
		"sap/ui/test/Opa5",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/VMBuilder"
	],
	function (FilterBarAPI, Utils, EditState, FEBuilder, Opa5, OpaBuilder, VMBuilder) {
		"use strict";

		/**
		 * Constructs a new FilterBarActions instance.
		 *
		 * @param {sap.fe.test.builder.FilterBarBuilder} oFilterBarBuilder The {@link sap.fe.test.builder.FilterBarBuilder} instance used to interact with the UI
		 * @param {string} [vFilterBarDescription] Description (optional) of the filter bar to be used for logging messages
		 * @returns {sap.fe.test.api.FilterBarActions} The new instance
		 * @alias sap.fe.test.api.FilterBarActions
		 * @class
		 * @extends sap.fe.test.api.FilterBarAPI
		 * @hideconstructor
		 * @public
		 */
		var FilterBarActions = function (oFilterBarBuilder, vFilterBarDescription) {
			return FilterBarAPI.call(this, oFilterBarBuilder, vFilterBarDescription);
		};
		FilterBarActions.prototype = Object.create(FilterBarAPI.prototype);
		FilterBarActions.prototype.constructor = FilterBarActions;
		FilterBarActions.prototype.isAction = true;

		/**
		 * Changes the value of the defined filter field.
		 *
		 * @param {string | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier for the filter field
		 * @param {string} [vValue] The new target value
		 * @param {boolean} [bClearFirst] Set to <code>true</code> to clear previously set filters, otherwise all previously set values will be kept
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iChangeFilterField = function (vFieldIdentifier, vValue, bClearFirst) {
			var aArguments = Utils.parseArguments([[String, Object], String, Boolean], arguments),
				oFieldBuilder = FilterBarAPI.createFilterFieldBuilder(this.getBuilder(), aArguments[0]);

			return this.prepareResult(
				oFieldBuilder
					.doChangeValue(aArguments[1], aArguments[2])
					.description(
						Utils.formatMessage(
							"Changing the filter field '{1}' of filter bar '{0}' by adding '{2}' (was cleared first: {3})",
							this.getIdentifier(),
							aArguments[0],
							aArguments[1],
							!!aArguments[2]
						)
					)
					.execute()
			);
		};

		/**
		 * Opens the value help of the given field.
		 *
		 * @param {string | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the filter field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, that can be used for chaining statements
		 * @public
		 */
		FilterBarActions.prototype.iOpenValueHelp = function (vFieldIdentifier) {
			var oFieldBuilder = FilterBarAPI.createFilterFieldBuilder(this.getBuilder(), vFieldIdentifier);
			return this.prepareResult(
				oFieldBuilder
					.doOpenValueHelp()
					.description(
						Utils.formatMessage(
							"Opening the value help for filter field '{1}' of filter bar '{0}'",
							this.getIdentifier(),
							vFieldIdentifier
						)
					)
					.execute()
			);
		};

		/**
		 * Changes the search field.
		 *
		 * @param {string} [sSearchText] The new search text
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iChangeSearchField = function (sSearchText) {
			var oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder
					.doChangeSearch(sSearchText)
					.description(
						Utils.formatMessage(
							"Changing the search text on filter bar '{0}' to '{1}'",
							this.getIdentifier(),
							sSearchText || ""
						)
					)
					.execute()
			);
		};

		/**
		 * Resets the search field.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iResetSearchField = function () {
			var oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder
					.doResetSearch()
					.description(Utils.formatMessage("Resetting the search field on filter bar '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Changes the editing status filter field.
		 *
		 * @param {sap.fe.test.api.EditState} sEditState Value of an edit state
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iChangeEditingStatus = function (sEditState) {
			var oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder
					.doChangeEditingStatus(sEditState && EditState[sEditState])
					.description(
						Utils.formatMessage(
							"Changing the editing status on filter bar '{0}' to '{1}'",
							this.getIdentifier(),
							sEditState && EditState[sEditState].display
						)
					)
					.execute()
			);
		};

		/**
		 * Executes the search with the current filters.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iExecuteSearch = function () {
			var oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder
					.doSearch()
					.description(Utils.formatMessage("Executing search on filter bar '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Adds a field as a filter field.
		 *
		 * @param {string | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iAddAdaptationFilterField = function (vFieldIdentifier) {
			return this.filterFieldAdaptation(
				vFieldIdentifier,
				{ selected: false },
				OpaBuilder.Actions.press("selectMulti"),
				Utils.formatMessage("Adding field '{1}' to filter bar '{0}'", this.getIdentifier(), vFieldIdentifier)
			);
		};

		/**
		 * Removes a field as a filter field.
		 *
		 * @param {string | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iRemoveAdaptationFilterField = function (vFieldIdentifier) {
			return this.filterFieldAdaptation(
				vFieldIdentifier,
				{ selected: true },
				OpaBuilder.Actions.press("selectMulti"),
				Utils.formatMessage("Removing field '{1}' to filter bar '{0}'", this.getIdentifier(), vFieldIdentifier)
			);
		};

		/**
		 * Executes a keyboard shortcut.
		 *
		 * @param {string} sShortcut Pattern for the shortcut
		 * @param {string | sap.fe.test.api.FilterFieldIdentifier} [vFieldIdentifier] The identifier of the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iExecuteKeyboardShortcut = function (sShortcut, vFieldIdentifier) {
			var oBuilder = vFieldIdentifier
				? FilterBarAPI.createFilterFieldBuilder(this.getBuilder(), vFieldIdentifier)
				: this.getBuilder();
			return this.prepareResult(
				oBuilder
					.doPressKeyboardShortcut(sShortcut)
					.description(
						Utils.formatMessage(
							"Execute keyboard shortcut '{1}' on filter bar '{0}' on field '{2}'",
							this.getIdentifier(),
							sShortcut,
							vFieldIdentifier
						)
					)
					.execute()
			);
		};

		/**
		 * Saves a variant under the given name, or overwrites the current variant.
		 *
		 * @param {string} [sVariantName] The name of the new variant. If no new variant name is defined, the current variant will be overwritten.
		 * @param {string} [bSetAsDefault] Saves the new variant with option "Set as Default".
		 * @param {string} [bApplyAutomatically] Saves the new variant with option "Apply Automatically".
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iSaveVariant = function (sVariantName, bSetAsDefault, bApplyAutomatically) {
			var fnSuccessFunction = Utils.isOfType(sVariantName, String)
				? function (oFilterBar) {
						return VMBuilder.create(this)
							.hasId(oFilterBar.getId() + "::VariantManagement")
							.doSaveAs(sVariantName, bSetAsDefault, bApplyAutomatically)
							.description(
								Utils.formatMessage(
									"Saving variant for '{0}' as '{1}' with default='{2}' and applyAutomatically='{3}'",
									this.getIdentifier(),
									sVariantName,
									!!bSetAsDefault,
									!!bApplyAutomatically
								)
							)
							.execute();
				  }
				: function (oFilterBar) {
						return VMBuilder.create(this)
							.hasId(oFilterBar.getId() + "::VariantManagement")
							.doSave()
							.description(Utils.formatMessage("Saving current variant for '{0}'", this.getIdentifier()))
							.execute();
				  };

			return this.prepareResult(this.getBuilder().success(fnSuccessFunction.bind(this)).execute());
		};

		/**
		 * Selects the chosen variant.
		 *
		 * @param {string} sVariantName The name of the variant to be selected
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarActions.prototype.iSelectVariant = function (sVariantName) {
			return this.prepareResult(
				this.getBuilder()
					.success(
						function (oFilterBar) {
							return VMBuilder.create(this)
								.hasId(oFilterBar.getId() + "::VariantManagement")
								.doSelectVariant(sVariantName)
								.description(Utils.formatMessage("Selecting variant '{1}' from '{0}'", this.getIdentifier(), sVariantName))
								.execute();
						}.bind(this)
					)
					.execute()
			);
		};

		FilterBarActions.prototype.iSelectVisualFilter = function (sVisualFilterIdentifier, sLabelValue, bIsSelected) {
			// var that = this;
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.fe.core.controls.filterbar.VisualFilter")
					.hasId(new RegExp(sVisualFilterIdentifier, "i"))
					.success(function (aVisualFilter) {
						var oVisualFilter = aVisualFilter[0];
						var selectItem;
						var oInteractiveChart = oVisualFilter.getItems()[1].getItems()[0];
						var aItems =
							(oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveLineChart") && oInteractiveChart.getPoints()) ||
							(oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveBarChart") && oInteractiveChart.getBars());
						aItems.forEach(function (oItem) {
							if (oItem.getLabel() == sLabelValue) {
								selectItem = oItem;
							}
						});
						if (!selectItem) {
							selectItem = aItems[0];
						}
						if (oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveLineChart")) {
							var aLineChartPoints = oInteractiveChart.getSelectedPoints();
							return oInteractiveChart.fireSelectionChanged({
								selectedPoints: aLineChartPoints,
								point: selectItem,
								selected: bIsSelected
							});
						} else if (oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveBarChart")) {
							var aBarChartPoints = oInteractiveChart.getSelectedBars();
							return oInteractiveChart.fireSelectionChanged({
								selectedPoints: aBarChartPoints,
								point: selectItem,
								selected: bIsSelected
							});
						}
					})
					.description("Selecting an item in " + sVisualFilterIdentifier + " VisualFilter")
					.execute()
			);
		};
		FilterBarActions.prototype.iOpenVisualFilterValueHelp = function (sVisualFilterIdentifier) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.fe.core.controls.filterbar.VisualFilter")
					.hasId(new RegExp(sVisualFilterIdentifier, "i"))
					.success(function (aVisualFilter) {
						var sVFId = aVisualFilter[0].getId();
						OpaBuilder.create(this)
							.hasType("sap.m.Button")
							.hasId(sVFId + "::VisualFilterValueHelpButton")
							.doPress()
							.execute();
					})
					.description("Open ValueHelp Dialog " + sVisualFilterIdentifier + " VisualFilter")
					.execute()
			);
		};
		return FilterBarActions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/FilterBarAssertions", [
		"./FilterBarAPI",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/FEBuilder",
		"sap/ui/test/OpaBuilder",
		"sap/fe/macros/filter/DraftEditState"
	],
	function (FilterBarAPI, Utils, FEBuilder, OpaBuilder, EditState) {
		"use strict";

		/**
		 * Constructs a new FilterBarAssertions instance.
		 *
		 * @param {sap.fe.test.builder.FilterBarBuilder} oFilterBarBuilder The {@link sap.fe.test.builder.FilterBarBuilder} instance used to interact with the UI
		 * @param {string} [vFilterBarDescription] Description (optional) of the filter bar to be used for logging messages
		 * @returns {sap.fe.test.api.FilterBarAssertions} The new instance
		 * @alias sap.fe.test.api.FilterBarAssertions
		 * @class
		 * @extends sap.fe.test.api.FilterBarAPI
		 * @hideconstructor
		 * @public
		 */
		var FilterBarAssertions = function (oFilterBarBuilder, vFilterBarDescription) {
			return FilterBarAPI.call(this, oFilterBarBuilder, vFilterBarDescription);
		};
		FilterBarAssertions.prototype = Object.create(FilterBarAPI.prototype);
		FilterBarAssertions.prototype.constructor = FilterBarAssertions;
		FilterBarAssertions.prototype.isAction = false;

		/**
		 * Checks the filter bar.
		 *
		 * @param {object} [mFilterBarState] Defines the expected state of the filter bar
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarAssertions.prototype.iCheckState = function (mFilterBarState) {
			var oFilterBarBuilder = this.getBuilder(),
				sDescription = this.getIdentifier();

			if (sDescription) {
				oFilterBarBuilder.description(
					Utils.formatMessage("Checking filter bar '{0}' for state='{1}'", this.getIdentifier(), mFilterBarState)
				);
			}

			return this.prepareResult(oFilterBarBuilder.hasState(mFilterBarState).execute());
		};

		/**
		 * Checks a filter field.
		 * If <code>vConditionValues</code> is <code>undefined</code>, the current condition values are ignored.
		 *
		 * @param {object | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the filter field
		 * @param {string|object|Array} [vConditionValues] The expected value(s) of the filter field
		 * @param {string} [sOperator] The expected operator
		 * @param {object} [mState] Defines the expected state of the filter field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarAssertions.prototype.iCheckFilterField = function (vFieldIdentifier, vConditionValues, sOperator, mState) {
			var aArguments = Utils.parseArguments([[String, Object], [String, Array, Object, Boolean], String, Object], arguments),
				oFieldBuilder = FilterBarAPI.createFilterFieldBuilder(this.getBuilder(), aArguments[0], aArguments[3]);

			if (!aArguments[3] || aArguments[3].visible !== false) {
				oFieldBuilder.hasValue(aArguments[1], aArguments[2]);
			}

			return this.prepareResult(
				oFieldBuilder
					.description(
						Utils.formatMessage(
							"Checking the field '{1}' of filter bar '{0}' for condition values='{2}' and operator='{3}' and state='{4}'",
							this.getIdentifier(),
							aArguments[0],
							aArguments[1],
							aArguments[2],
							aArguments[3]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks if the focus is on the filter field.

		 * @param {string} [sFilterFieldLabel] The field label
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */

		FilterBarAssertions.prototype.iSeeFocusOnFilterField = function (sFilterFieldLabel) {
			var oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder
					.hasFocusOnFilterField(sFilterFieldLabel)
					.description(Utils.formatMessage("Checking focus on Filter Field '{0}' ", sFilterFieldLabel))
					.execute()
			);
		};

		/**
		 * Checks if the focus is on the Go Button of the filter bar.

		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */

		FilterBarAssertions.prototype.iSeeFocusOnGoButton = function () {
			var oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder.hasFocusOnGoButton().description(Utils.formatMessage("Checking focus on the Go Button' ")).execute()
			);
		};

		/**
		 * Checks the search field in the filter bar. If the <code>sSearchText</code> parameter is <code>undefined</code>, the search text is not validated.
		 *
		 * @param {string} [sSearchText] The expected text in the search field
		 * @param {object} [mState] Defines the expected state of the search field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarAssertions.prototype.iCheckSearchField = function (sSearchText, mState) {
			var aArguments = Utils.parseArguments([String, Object], arguments),
				oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder
					.hasSearchField(aArguments[0], aArguments[1])
					.description(
						Utils.formatMessage(
							"Checking the search field on filter bar '{0}' having search text '{1}' and state='{2}'",
							this.getIdentifier(),
							aArguments[0] || "",
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Check the filter field for the editing status.
		 *
		 * @param {sap.fe.test.api.EditState} [sEditState] The expected edit state value
		 * @param {object} [mFieldState] Defines the expected state of the filter field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarAssertions.prototype.iCheckEditingStatus = function (sEditState, mFieldState) {
			var aArguments = Utils.parseArguments([String, Object], arguments),
				oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder
					.hasEditingStatus(aArguments[0] && EditState[aArguments[0]], aArguments[1])
					.description(
						Utils.formatMessage(
							"Checking the editing status of filter bar '{0}' for value='{1}' and state='{2}'",
							this.getIdentifier(),
							aArguments[0] && EditState[aArguments[0]].display,
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the search button.
		 *
		 * @param {object} [mState] Defines the expected state of the Go button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarAssertions.prototype.iCheckSearch = function (mState) {
			var oFilterBarBuilder = this.getBuilder();
			return this.prepareResult(
				oFilterBarBuilder
					.hasProperties({ showGoButton: !mState || mState.visible === undefined ? true : mState.visible })
					.description(Utils.formatMessage("Checking search on filter bar '{0}' for state='{1}'", this.getIdentifier(), mState))
					.execute()
			);
		};

		/**
		 * Checks whether the filter adaptation dialog is open.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarAssertions.prototype.iCheckFilterAdaptation = function () {
			var oAdaptationPopoverBuilder = FEBuilder.createPopoverBuilder(
				this.getOpaInstance(),
				OpaBuilder.Matchers.resourceBundle("title", "sap.ui.mdc", "filterbar.ADAPT_TITLE")
			);
			return this.prepareResult(
				oAdaptationPopoverBuilder
					.description(Utils.formatMessage("Checking filter adaptation dialog for filter bar '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Checks a field in the adaptation dialog.
		 *
		 * @param {string | sap.fe.test.api.FilterFieldIdentifier} vFieldIdentifier The identifier of the filter field, or its label
		 * @param {object} [mState] Defines the expected state of the filter field in the adaptation dialog
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FilterBarAssertions.prototype.iCheckAdaptationFilterField = function (vFieldIdentifier, mState) {
			return this.filterFieldAdaptation(
				vFieldIdentifier,
				mState,
				Utils.formatMessage(
					"Checking adaptation filter field '{1}' on filter bar '{0}' for state='{2}'",
					this.getIdentifier(),
					vFieldIdentifier,
					mState
				)
			);
		};

		FilterBarAssertions.prototype.iCheckVisualFilterSelections = function (sVisualFilterIdentifier, aLabelValues) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.fe.core.controls.filterbar.VisualFilter")
					.check(function (aVisualFilters) {
						var oVisualFilter;
						for (var i = 0; i < aVisualFilters.length; i++) {
							if (
								aVisualFilters[i]
									.getParent()
									.getId()
									.indexOf("FilterField::" + sVisualFilterIdentifier) > -1
							) {
								oVisualFilter = aVisualFilters[i];
								break;
							}
						}
						var oInteractiveChart = oVisualFilter.getItems()[1].getItems()[0];
						var aSelectedItems =
							(oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveLineChart") &&
								oInteractiveChart.getSelectedPoints()) ||
							(oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveBarChart") && oInteractiveChart.getSelectedBars());
						var aSelectedValues = [];
						aSelectedItems.forEach(function (oItem) {
							aSelectedValues.push(oItem.getLabel());
						});
						aLabelValues.sort();
						aSelectedValues.sort();
						if (aLabelValues.length !== aSelectedValues.length) {
							return false;
						}
						for (var j = 0; j < aLabelValues.length; j++) {
							if (aLabelValues[j] !== aSelectedValues[j]) {
								return false;
							}
						}
						return true;
					})
					.description("Checking Selections of " + sVisualFilterIdentifier + " VisualFilter")
					.execute()
			);
		};

		FilterBarAssertions.prototype.iCheckVisualFilterTitleAndToolTip = function (sVisualFilterIdentifier, sTitle, sToolTip) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.fe.core.controls.filterbar.VisualFilter")
					.check(function (aVisualFilters) {
						var oVisualFilter;
						for (var i = 0; i < aVisualFilters.length; i++) {
							if (
								aVisualFilters[i]
									.getParent()
									.getId()
									.indexOf("FilterField::" + sVisualFilterIdentifier) > -1
							) {
								oVisualFilter = aVisualFilters[i];
								break;
							}
						}
						var sMeasureDimensionTitle = oVisualFilter.getItems()[0].getItems()[0].getContent()[0];
						var sScaleUOMTitle = oVisualFilter.getItems()[0].getItems()[0].getContent()[1];
						var sScaleUOMTitleText = sScaleUOMTitle ? sScaleUOMTitle.getText() : " | ";
						return (
							sTitle ===
								sMeasureDimensionTitle.getText() +
									(sScaleUOMTitleText === " " || sScaleUOMTitleText === " | " ? "" : sScaleUOMTitle.getText()) &&
							sToolTip === sMeasureDimensionTitle.getTooltip()
						);
					})
					.description("Checking Title and Tooltip of " + sVisualFilterIdentifier + " VisualFilter")
					.execute()
			);
		};

		FilterBarAssertions.prototype.iCheckVisualFilterValueHelp = function (sVisualFilterIdentifier, iCount) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.fe.core.controls.filterbar.VisualFilter")
					.check(function (aVisualFilters) {
						var oVisualFilter;
						for (var i = 0; i < aVisualFilters.length; i++) {
							if (
								aVisualFilters[i]
									.getParent()
									.getId()
									.indexOf("FilterField::" + sVisualFilterIdentifier) > -1
							) {
								oVisualFilter = aVisualFilters[i];
								break;
							}
						}
						var sValueHelp = oVisualFilter.getItems()[0].getItems()[0].getContent()[3];
						var sValueHelpCount = sValueHelp ? sValueHelp.getText() : undefined;
						return sValueHelp && sValueHelpCount === iCount;
					})
					.description("Checking Value Help and its count of " + sVisualFilterIdentifier + " VisualFilter")
					.execute()
			);
		};

		FilterBarAssertions.prototype.iCheckVisualFilterCriticality = function (sVisualFilterIdentifier, sLabelValue, sCriticality) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.fe.core.controls.filterbar.VisualFilter")
					.check(function (aVisualFilters) {
						var oVisualFilter;
						for (var i = 0; i < aVisualFilters.length; i++) {
							if (
								aVisualFilters[i]
									.getParent()
									.getId()
									.indexOf("FilterField::" + sVisualFilterIdentifier) > -1
							) {
								oVisualFilter = aVisualFilters[i];
								break;
							}
						}
						var oInteractiveChart = oVisualFilter.getItems()[1].getItems()[0];
						var aItems =
							(oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveLineChart") && oInteractiveChart.getPoints()) ||
							(oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveBarChart") && oInteractiveChart.getBars());
						for (var j = 0; j < aItems.length; j++) {
							if (aItems[j].getLabel() === sLabelValue && aItems[j].getColor() === sCriticality) {
								return true;
							}
						}
						return false;
					})
					.description("Checking Criticality of " + sLabelValue + " Item")
					.execute()
			);
		};

		FilterBarAssertions.prototype.iCheckVisualFilterValues = function (sVisualFilterIdentifier, aValues) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.fe.core.controls.filterbar.VisualFilter")
					.check(function (aVisualFilters) {
						var oVisualFilter;
						for (var i = 0; i < aVisualFilters.length; i++) {
							if (
								aVisualFilters[i]
									.getParent()
									.getId()
									.indexOf("FilterField::" + sVisualFilterIdentifier) > -1
							) {
								oVisualFilter = aVisualFilters[i];
								break;
							}
						}
						var oInteractiveChart = oVisualFilter.getItems()[1].getItems()[0];
						var aItems =
							(oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveLineChart") && oInteractiveChart.getPoints()) ||
							(oInteractiveChart.isA("sap.suite.ui.microchart.InteractiveBarChart") && oInteractiveChart.getBars());
						if (aItems.length !== aValues.length) {
							return false;
						}
						for (var j = 0; j < aItems.length; j++) {
							if (aItems[j].getDisplayedValue() !== aValues[j]) {
								return false;
							}
						}
						return true;
					})
					.description("Checking Values of " + sVisualFilterIdentifier + " VisualFilter")
					.execute()
			);
		};

		FilterBarAssertions.prototype.iCheckErrorMessageAndTitle = function (sVisualFilterIdentifier, sErrorMessage, sErrorMessageTitle) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.fe.core.controls.filterbar.VisualFilter")
					.check(function (aVisualFilters) {
						var oVisualFilter;
						for (var i = 0; i < aVisualFilters.length; i++) {
							if (
								aVisualFilters[i]
									.getParent()
									.getId()
									.indexOf("FilterField::" + sVisualFilterIdentifier) > -1
							) {
								oVisualFilter = aVisualFilters[i];
								break;
							}
						}
						var oInteractiveChart = oVisualFilter.getItems()[1].getItems()[0];
						var sText = oInteractiveChart.getErrorMessage();
						var sTitle = oInteractiveChart.getErrorMessageTitle();
						return sText === sErrorMessage && sTitle === sErrorMessageTitle;
					})
					.description("Checking error message and title of " + sVisualFilterIdentifier + " VisualFilter")
					.execute()
			);
		};

		FilterBarAssertions.prototype.iCheckIsVisualFilterRequired = function (sVisualFilterIdentifier) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.fe.core.controls.filterbar.VisualFilter")
					.check(function (aVisualFilters) {
						var oVisualFilter;
						for (var i = 0; i < aVisualFilters.length; i++) {
							if (
								aVisualFilters[i]
									.getParent()
									.getId()
									.indexOf("FilterField::" + sVisualFilterIdentifier) > -1
							) {
								oVisualFilter = aVisualFilters[i];
								break;
							}
						}
						var oLabel = oVisualFilter.getItems()[0].getItems()[0].getContent()[0];
						return oLabel.isA("sap.m.Label") && oLabel.getVisible() && oLabel.getRequired();
					})
					.description("Checking Whether " + sVisualFilterIdentifier + " VisualFilter is Mandatory")
					.execute()
			);
		};

		return FilterBarAssertions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/FooterAPI", [
		"./BaseAPI",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/OverflowToolbarBuilder",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder"
	],
	function (BaseAPI, Utils, OverflowToolbarBuilder, OpaBuilder, FEBuilder) {
		"use strict";

		/**
		 * Constructs a new FooterAPI instance.
		 *
		 * @param {sap.fe.test.builder.OverflowToolbarBuilder} oOverflowToolbarBuilder The {@link sap.fe.test.builder.OverflowToolbarBuilder} instance used to interact with the UI
		 * @param {string} [vFooterDescription] Description (optional) of the footer bar to be used for logging messages
		 * @returns {sap.fe.test.api.FooterAPI} The new instance
		 * @class
		 * @private
		 */
		var FooterAPI = function (oOverflowToolbarBuilder, vFooterDescription) {
			if (!Utils.isOfType(oOverflowToolbarBuilder, OverflowToolbarBuilder)) {
				throw new Error("oOverflowToolbarBuilder parameter must be a OverflowToolbarBuilder instance");
			}
			return BaseAPI.call(this, oOverflowToolbarBuilder, vFooterDescription);
		};
		FooterAPI.prototype = Object.create(BaseAPI.prototype);
		FooterAPI.prototype.constructor = FooterAPI;

		return FooterAPI;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/FooterActionsBase", ["./FooterAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder"], function (FooterAPI, Utils, OpaBuilder) {
	"use strict";

	/**
	 * Constructs a new FooterActionsBase instance.
	 *
	 * @param {sap.fe.test.builder.OverflowToolbarBuilder} oOverflowToolbarBuilder The {@link sap.fe.test.builder.OverflowToolbarBuilder} instance used to interact with the UI
	 * @param {string} [vFooterDescription] Description (optional) of the footer bar to be used for logging messages
	 * @returns {sap.fe.test.api.FooterActionsBase} The new instance
	 * @alias sap.fe.test.api.FooterActionsBase
	 * @class
	 * @hideconstructor
	 * @public
	 */
	var FooterActionsBase = function (oOverflowToolbarBuilder, vFooterDescription) {
		return FooterAPI.call(this, oOverflowToolbarBuilder, vFooterDescription);
	};
	FooterActionsBase.prototype = Object.create(FooterAPI.prototype);
	FooterActionsBase.prototype.constructor = FooterActionsBase;
	FooterActionsBase.prototype.isAction = true;

	/**
	 * Executes a footer action.
	 *
	 * @param {string | sap.fe.test.api.ActionIdentifier} [vActionIdentifier] The identifier of the action or its label
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterActionsBase.prototype.iExecuteAction = function (vActionIdentifier) {
		var oOverflowToolbarBuilder = this.getBuilder();

		return this.prepareResult(
			oOverflowToolbarBuilder
				.doOnContent(this.createActionMatcher(vActionIdentifier), OpaBuilder.Actions.press())
				.description(Utils.formatMessage("Executing footer action '{0}'", vActionIdentifier))
				.execute()
		);
	};

	return FooterActionsBase;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/FooterActionsOP", ["./FooterActionsBase", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder"], function (FooterActionsBase, Utils, OpaBuilder) {
	"use strict";

	/**
	 * Constructs a new FooterActionsOP instance.
	 *
	 * @param {sap.fe.test.builder.OverflowToolbarBuilder} oOverflowToolbarBuilder The {@link sap.fe.test.builder.OverflowToolbarBuilder} instance used to interact with the UI
	 * @param {string} [vFooterDescription] Description (optional) of the footer bar to be used for logging messages
	 * @returns {sap.fe.test.api.FooterActionsOP} The new instance
	 * @alias sap.fe.test.api.FooterActionsOP
	 * @class
	 * @extends sap.fe.test.api.FooterActionsBase
	 * @hideconstructor
	 * @public
	 */
	var FooterActionsOP = function (oOverflowToolbarBuilder, vFooterDescription) {
		return FooterActionsBase.call(this, oOverflowToolbarBuilder, vFooterDescription);
	};
	FooterActionsOP.prototype = Object.create(FooterActionsBase.prototype);
	FooterActionsOP.prototype.constructor = FooterActionsOP;
	FooterActionsOP.prototype.isAction = true;

	/**
	 * Executes the Save or Create action in the footer bar of the object page.
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterActionsOP.prototype.iExecuteSave = function () {
		return this.iExecuteAction({ service: "StandardAction", action: "Save", unbound: true });
	};

	/**
	 * Executes the Apply action in the footer bar of a sub-object page.
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterActionsOP.prototype.iExecuteApply = function () {
		return this.iExecuteAction({ service: "StandardAction", action: "Apply", unbound: true });
	};

	/**
	 * Executes the Cancel action in the footer bar of the object page.
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterActionsOP.prototype.iExecuteCancel = function () {
		return this.iExecuteAction({ service: "StandardAction", action: "Cancel", unbound: true });
	};

	/**
	 * Confirms the Cancel action when user clicks <code>Cancel</code> in draft mode.
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterActionsOP.prototype.iConfirmCancel = function () {
		return this.prepareResult(
			OpaBuilder.create(this)
				.hasType("sap.m.Popover")
				.isDialogElement()
				.doOnChildren(
					OpaBuilder.Matchers.resourceBundle("text", "sap.fe.core", "C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON"),
					OpaBuilder.Actions.press()
				)
				.description("Confirming discard changes")
				.execute()
		);
	};

	return FooterActionsOP;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/FooterAssertionsBase", ["./FooterAPI", "sap/fe/test/Utils"], function (FooterAPI, Utils) {
	"use strict";

	/**
	 * Constructs a new FooterAssertionsBase instance.
	 *
	 * @param {sap.fe.test.builder.OverflowToolbarBuilder} oOverflowToolbarBuilder The {@link sap.fe.test.builder.OverflowToolbarBuilder} instance used to interact with the UI
	 * @param {string} [vFooterDescription] Description (optional) of the footer bar to be used for logging messages
	 * @returns {sap.fe.test.api.FooterAssertionsBase} The new instance
	 * @alias sap.fe.test.api.FooterAssertionsBase
	 * @class
	 * @hideconstructor
	 * @public
	 */
	var FooterAssertionsBase = function (oOverflowToolbarBuilder, vFooterDescription) {
		return FooterAPI.call(this, oOverflowToolbarBuilder, vFooterDescription);
	};
	FooterAssertionsBase.prototype = Object.create(FooterAPI.prototype);
	FooterAssertionsBase.prototype.constructor = FooterAssertionsBase;
	FooterAssertionsBase.prototype.isAction = false;

	/**
	 * Checks the state of an action in the footer bar.
	 *
	 * @param {string | sap.fe.test.api.ActionIdentifier} vActionIdentifier The identifier of an action
	 * @param {object} [mState] Defines the expected state of the button
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterAssertionsBase.prototype.iCheckAction = function (vActionIdentifier, mState) {
		var oOverflowToolbarBuilder = this.getBuilder();

		return this.prepareResult(
			oOverflowToolbarBuilder
				.hasContent(this.createActionMatcher(vActionIdentifier), mState)
				.description(Utils.formatMessage("Checking footer action '{0}' with state='{1}'", vActionIdentifier, mState))
				.execute()
		);
	};

	/**
	 * Checks the state of the footer bar.
	 *
	 * @param {object} [mState] Defines the expected state of the footer bar
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterAssertionsBase.prototype.iCheckState = function (mState) {
		var oOverflowToolbarBuilder = this.getBuilder();
		return this.prepareResult(
			oOverflowToolbarBuilder.hasState(mState).description(Utils.formatMessage("Checking footer with state='{0}'", mState)).execute()
		);
	};

	return FooterAssertionsBase;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/FooterAssertionsOP", ["./FooterAssertionsBase", "sap/fe/test/Utils", "sap/m/library"], function (FooterAssertionsBase, Utils, mLibrary) {
	"use strict";

	/**
	 * Constructs a new FooterAssertionsOP instance.
	 *
	 * @param {sap.fe.test.builder.OverflowToolbarBuilder} oOverflowToolbarBuilder The {@link sap.fe.test.builder.OverflowToolbarBuilder} instance used to interact with the UI
	 * @param {string} [vFooterDescription] Description (optional) of the footer bar to be used for logging messages
	 * @returns {sap.fe.test.api.FooterAssertionsOP} The new instance
	 * @alias sap.fe.test.api.FooterAssertionsOP
	 * @class
	 * @extends sap.fe.test.api.FooterAssertionsBase
	 * @hideconstructor
	 * @public
	 */
	var FooterAssertionsOP = function (oOverflowToolbarBuilder, vFooterDescription) {
		return FooterAssertionsBase.call(this, oOverflowToolbarBuilder, vFooterDescription);
	};
	FooterAssertionsOP.prototype = Object.create(FooterAssertionsBase.prototype);
	FooterAssertionsOP.prototype.constructor = FooterAssertionsOP;
	FooterAssertionsOP.prototype.isAction = false;

	var DraftIndicatorState = mLibrary.DraftIndicatorState;

	function _checkDraftState(oOverflowToolbarBuilder, sState) {
		return oOverflowToolbarBuilder
			.hasContent(function (oObject) {
				return oObject.getMetadata().getName() === "sap.m.DraftIndicator" && oObject.getState() === sState;
			})
			.description("Draft Indicator on footer bar is in " + sState + " state")
			.execute();
	}

	/**
	 * Checks the state of the Save or Create action in the footer bar.
	 *
	 * @param {object} [mState] Defines the expected state of the button
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterAssertionsOP.prototype.iCheckSave = function (mState) {
		return this.iCheckAction({ service: "StandardAction", action: "Save", unbound: true }, mState);
	};

	/**
	 * Checks the state of the Apply action in the footer bar.
	 *
	 * @param {object} [mState] Defines the expected state of the button
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterAssertionsOP.prototype.iCheckApply = function (mState) {
		return this.iCheckAction({ service: "StandardAction", action: "Apply", unbound: true }, mState);
	};

	/**
	 * Checks the state of the Cancel action in the footer bar.
	 *
	 * @param {object} [mState] Defines the expected state of the button
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterAssertionsOP.prototype.iCheckCancel = function (mState) {
		return this.iCheckAction({ service: "StandardAction", action: "Cancel", unbound: true }, mState);
	};

	/**
	 * Checks for draft state 'Clear' in the footer bar.
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterAssertionsOP.prototype.iCheckDraftStateClear = function () {
		return this.prepareResult(_checkDraftState(this.getBuilder(), DraftIndicatorState.Clear));
	};

	/**
	 * Checks for draft state 'Saved' in the footer bar.
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 * @public
	 */
	FooterAssertionsOP.prototype.iCheckDraftStateSaved = function () {
		return this.prepareResult(_checkDraftState(this.getBuilder(), DraftIndicatorState.Saved));
	};

	return FooterAssertionsOP;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/FormAPI", [
		"./BaseAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"sap/base/Log"
	],
	function (BaseAPI, Utils, OpaBuilder, FEBuilder, MacroFieldBuilder, Log) {
		"use strict";

		/**
		 * A form identifier
		 *
		 * @typedef {object} FormIdentifier
		 * @property {string} section The facet ID
		 * @property {string} fieldGroup The fieldgroup ID
		 * @property {boolean} [isHeaderFacet] Is it about the editable header facet
		 * @name sap.fe.test.api.FormIdentifier
		 * @public
		 */

		/**
		 * Constructs a new FormAPI instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oFormBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vFormDescription] Description (optional) of the form to be used for logging messages
		 * @returns {sap.fe.test.api.FormAPI} The new instance
		 * @alias sap.fe.test.api.FormAPI
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var FormAPI = function (oFormBuilder, vFormDescription) {
			if (!Utils.isOfType(oFormBuilder, FEBuilder)) {
				throw new Error("oFormBuilder parameter must be a FEBuilder instance");
			}
			return BaseAPI.call(this, oFormBuilder, vFormDescription);
		};
		FormAPI.prototype = Object.create(BaseAPI.prototype);
		FormAPI.prototype.constructor = FormAPI;

		FormAPI.prototype.createFieldBuilder = function (vFieldIdentifier) {
			var oBuilder = new MacroFieldBuilder(this.getOpaInstance(), this.getBuilder().build());

			if (vFieldIdentifier.fieldGroup) {
				oBuilder.has(OpaBuilder.Matchers.children(this._getBuilderForFieldGroup(vFieldIdentifier)));
			}

			if (vFieldIdentifier.connectedFields) {
				return oBuilder
					.has(OpaBuilder.Matchers.children(this._getBuilderForFormElement(vFieldIdentifier)))
					.has(FEBuilder.Matchers.singleElement());
			} else {
				return oBuilder
					.has(OpaBuilder.Matchers.children(this._getBuilderForFormElement(vFieldIdentifier)))
					.has(FEBuilder.Matchers.singleElement())
					.has(OpaBuilder.Matchers.children(this.createFieldMatcher(vFieldIdentifier)))
					.has(FEBuilder.Matchers.singleElement());
			}
		};

		FormAPI.prototype._getBuilderForFormElement = function (vFieldIdentifier) {
			return FEBuilder.create(this.getOpaInstance()) // identifying the FormElement
				.hasType("sap.ui.layout.form.FormElement")
				.hasSome(
					this.createFormElementMatcher(vFieldIdentifier, "DataField"),
					this.createFormElementMatcher(vFieldIdentifier, "DataFieldWithNavigationPath"),
					this.createFormElementMatcher(vFieldIdentifier, "DataFieldWithUrl"),
					this.createFormElementMatcher(vFieldIdentifier, "DataFieldForAnnotation"),
					this.createFormElementMatcher(vFieldIdentifier, "DataFieldWithIntentBasedNavigation")
				);
		};

		FormAPI.prototype._getBuilderForFieldGroup = function (vFieldIdentifier) {
			return FEBuilder.create(this.getOpaInstance()) // identifying the FieldGroup
				.hasType("sap.ui.layout.form.FormContainer")
				.has(this.createFieldGroupMatcher(vFieldIdentifier));
		};

		return FormAPI;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/FormActions", [
		"./FormAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"sap/fe/test/builder/OverflowToolbarBuilder"
	],
	function (FormAPI, Utils, OpaBuilder, FEBuilder, MacroFieldBuilder, OverflowToolbarBuilder) {
		"use strict";

		/**
		 * Constructs a new FormActions instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oFormBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vFormDescription] Description (optional) of the form to be used for logging messages
		 * @returns {sap.fe.test.api.FormActions} The new instance
		 * @alias sap.fe.test.api.FormActions
		 * @class
		 * @extends sap.fe.test.api.FormAPI
		 * @hideconstructor
		 * @public
		 */
		var FormActions = function (oFormBuilder, vFormDescription) {
			return FormAPI.call(this, oFormBuilder, vFormDescription);
		};
		FormActions.prototype = Object.create(FormAPI.prototype);
		FormActions.prototype.constructor = FormActions;
		FormActions.prototype.isAction = true;

		function _executeShowMoreShowLess(vOpaInstance, bShowMore) {
			var oFormBuilder = vOpaInstance.getBuilder(),
				sSubSectionId,
				sButtonSuffix = bShowMore ? "--seeMore" : "--seeLess";

			oFormBuilder
				.has(function (oElement) {
					sSubSectionId = oElement.getId().substring(oElement.getId().lastIndexOf("::") + 2);
					return true;
				})
				.execute();

			return vOpaInstance.prepareResult(
				OpaBuilder.create(vOpaInstance)
					.hasId(new RegExp(Utils.formatMessage("{0}$", sButtonSuffix)))
					.has(function (oElement) {
						return oElement.getId().substring(oElement.getId().lastIndexOf("::") + 2) === sSubSectionId + sButtonSuffix;
					})
					.doPress()
					.description(Utils.formatMessage("Pressing '{0}' action", sButtonSuffix))
					.execute()
			);
		}

		/**
		 * Executes an action assigned to a form in a subsection.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} vActionIdentifier The identifier of the action or its label
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormActions.prototype.iExecuteAction = function (vActionIdentifier) {
			var oFormBuilder = this.getBuilder(),
				vFormDescription = this.getIdentifier(),
				sFormContainerId;
			if (vFormDescription.fieldGroupId === undefined) {
				// Action Button in Section Header
				return this.prepareResult(
					oFormBuilder
						.doOnSubSectionToolBar(this.createActionMatcher(vActionIdentifier))
						.description(Utils.formatMessage("Pressing action '{1}' on form '{0}'", this.getIdentifier(), vActionIdentifier))
						.execute()
				);
			} else {
				// Action Button in Form Container Toolbar ("Inline Action")
				sFormContainerId =
					vFormDescription.fullSubSectionId.substring(0, vFormDescription.fullSubSectionId.indexOf("--")) +
					"--" +
					vFormDescription.fieldGroupId;
				return this.prepareResult(
					OverflowToolbarBuilder.create(this)
						.hasId(sFormContainerId + "::FormActionsToolbar")
						.doOnContent(this.createActionMatcher(vActionIdentifier))
						.execute()
				);
			}
		};

		/**
		 * Executes the Show More action of a form in a subsection.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormActions.prototype.iExecuteShowMore = function () {
			return _executeShowMoreShowLess(this, true);
		};

		/**
		 * Executes the Show Less action of a form in a subsection.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormActions.prototype.iExecuteShowLess = function () {
			return _executeShowMoreShowLess(this, false);
		};

		/**
		 * Clicks a link within a form.
		 *
		 * @param {sap.fe.test.api.FieldIdentifier | string} vFieldIdentifier The identifier of the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormActions.prototype.iClickLink = function (vFieldIdentifier) {
			return this.prepareResult(
				this.createFieldBuilder(vFieldIdentifier)
					.hasState({ controlType: "sap.m.Link" })
					.doPress()
					.description(Utils.formatMessage("Clicking link '{1}' on form '{0}'", this.getIdentifier(), vFieldIdentifier))
					.execute()
			);
		};

		FormActions.prototype.iClickObjectStatus = function (vFieldIdentifier) {
			return this.prepareResult(
				this.createFieldBuilder(vFieldIdentifier)
					.hasState({ controlType: "sap.m.ObjectStatus" })
					.doPress()
					.description(Utils.formatMessage("Clicking ObjectStatus '{1}' on form '{0}'", this.getIdentifier(), vFieldIdentifier))
					.execute()
			);
		};
		/**
		 * Toggles the value of a checkbox within a form.
		 *
		 * @param {sap.fe.test.api.FieldIdentifier} vFieldIdentifier The identifier of the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormActions.prototype.iClickCheckBox = function (vFieldIdentifier) {
			return this.prepareResult(
				this.createFieldBuilder(vFieldIdentifier)
					.hasState({ controlType: "sap.m.CheckBox" })
					.doPress()
					.description(Utils.formatMessage("Clicking checkBox '{1}' on form '{0}'", this.getIdentifier(), vFieldIdentifier))
					.execute()
			);
		};

		/**
		 * Changes the value of a field within a form.
		 *
		 * @param {sap.fe.test.api.FieldIdentifier | string} vFieldIdentifier The identifier of the field
		 * @param {string} [sValue] The value to be set for the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormActions.prototype.iChangeField = function (vFieldIdentifier, sValue) {
			return this.prepareResult(
				this.createFieldBuilder(vFieldIdentifier)
					.doEnterText(sValue, true, false, true)
					.description(
						Utils.formatMessage(
							"Entering value '{1}' into field '{2}' on form '{0}'",
							this.getIdentifier(),
							sValue,
							vFieldIdentifier
						)
					)
					.execute()
			);
		};

		/**
		 * Opens the value help of the given field.
		 *
		 * @param {string | sap.fe.test.api.FieldIdentifier} vFieldIdentifier The identifier of the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function that can be used for chaining statements
		 * @public
		 */
		FormActions.prototype.iOpenValueHelp = function (vFieldIdentifier) {
			return this.prepareResult(
				this.createFieldBuilder(vFieldIdentifier)
					.hasState({ visible: true })
					.doOpenValueHelp()
					.description(
						Utils.formatMessage("Opening the value help for field '{1}' on form '{0}'", this.getIdentifier(), vFieldIdentifier)
					)
					.execute()
			);
		};

		return FormActions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/FormAssertions", ["./FormAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/fe/test/builder/MacroFieldBuilder"],
	function (FormAPI, Utils, OpaBuilder, FEBuilder, MacroFieldBuilder) {
		"use strict";

		/**
		 * Constructs a new FormAssertions instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oFormBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vFormDescription] Description (optional) of the form to be used for logging messages
		 * @returns {sap.fe.test.api.FormAssertions} The new instance
		 * @alias sap.fe.test.api.FormAssertions
		 * @class
		 * @extends sap.fe.test.api.FormAPI
		 * @hideconstructor
		 * @public
		 */
		var FormAssertions = function (oFormBuilder, vFormDescription) {
			return FormAPI.call(this, oFormBuilder, vFormDescription);
		};
		FormAssertions.prototype = Object.create(FormAPI.prototype);
		FormAssertions.prototype.constructor = FormAssertions;
		FormAssertions.prototype.isAction = false;

		function _checkShowMoreShowLess(vOpaInstance, bShowMore, mState) {
			var oFormBuilder = vOpaInstance.getBuilder(),
				sSubSectionId,
				sButtonSuffix = bShowMore ? "--seeMore" : "--seeLess";

			oFormBuilder
				.has(function (oElement) {
					sSubSectionId = oElement.getId().substring(oElement.getId().lastIndexOf("::") + 2);
					return true;
				})
				.execute();

			return vOpaInstance.prepareResult(
				FEBuilder.create(vOpaInstance)
					.hasId(new RegExp(Utils.formatMessage("{0}$", sButtonSuffix)))
					.has(function (oElement) {
						// check whether the control is in the correct SubSection
						return oElement.getId().substring(oElement.getId().lastIndexOf("::") + 2) === sSubSectionId + sButtonSuffix;
					})
					.hasState(mState)
					.description(Utils.formatMessage("Checking '{0}' action with state='{1}'", sButtonSuffix, mState))
					.execute()
			);
		}

		/**
		 * Checks the state of the form.
		 *
		 * @param {object} mState Defines the expected state of the form
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormAssertions.prototype.iCheckState = function (mState) {
			var oFormBuilder = this.getBuilder();
			return this.prepareResult(
				oFormBuilder
					.hasState(mState)
					.description(
						Utils.formatMessage(
							"Checking Form '{0}'{1}",
							this.getIdentifier(),
							mState ? Utils.formatMessage(" in state '{0}'", mState) : ""
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the state of an action in a subsection.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} vActionIdentifier The identifier of an action
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormAssertions.prototype.iCheckAction = function (vActionIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oFormBuilder = this.getBuilder();

			return this.prepareResult(
				oFormBuilder
					.hasAggregation("actions", [this.createActionMatcher(vActionIdentifier), FEBuilder.Matchers.states(mState)])
					.description(Utils.formatMessage("Checking custom action '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		/**
		 * Checks the Show More action of a form in a subsection.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormAssertions.prototype.iCheckShowMore = function (mState) {
			return _checkShowMoreShowLess(this, true, mState);
		};

		/**
		 * Checks the Show Less action of a form in a subsection.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormAssertions.prototype.iCheckShowLess = function (mState) {
			return _checkShowMoreShowLess(this, false, mState);
		};

		/**
		 * Checks the content and state of a field within a form.
		 *
		 * @param {string | sap.fe.test.api.FieldIdentifier} vFieldIdentifier The identifier of the field
		 * @param {string | Array | object} [vValue] Expected value(s) of the field.
		 * if passed as an object, the following pattern will be considered:
		 * <code><pre>
		 * {
		 *     value: <string>, 		// optional
		 *     description: <string> 	// optional
		 * }
		 * </pre></code>
		 * @param {object} [mState] Defines the expected state of the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormAssertions.prototype.iCheckField = function (vFieldIdentifier, vValue, mState) {
			var aArguments = Utils.parseArguments([[Object, String], [String, Array, Object], Object], arguments);
			return this.prepareResult(
				this.createFieldBuilder(vFieldIdentifier)
					.hasValue(aArguments[1])
					.hasState(aArguments[2])
					.description(
						Utils.formatMessage(
							"Checking field '{1}' on form '{0}' with value '{2}' and state='{3}'",
							this.getIdentifier(),
							aArguments[0],
							aArguments[1],
							aArguments[2]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the field is a link with the given text and state.
		 *
		 * @param {string | sap.fe.test.api.FieldIdentifier} vFieldIdentifier The identifier of the field
		 * @param {string} [sText] The link text
		 * @param {object} [mState] Defines the expected state of the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		FormAssertions.prototype.iCheckLink = function (vFieldIdentifier, sText, mState) {
			var aArguments = Utils.parseArguments([[Object, String], String, Object], arguments);
			return this.iCheckField(aArguments[0], aArguments[1], Utils.mergeObjects({ controlType: "sap.m.Link" }, aArguments[2]));
		};

		FormAssertions.prototype.iCheckFormContainersElementCount = function (sFormContainer, iCount, mState) {
			var aArguments = Utils.parseArguments([String, Number, Object], arguments),
				fullSubSectionId = this.getIdentifier().fullSubSectionId,
				mFormState = aArguments[2],
				sView = fullSubSectionId.split("--")[0],
				sForm = fullSubSectionId.split("--")[1].split("::")[2],
				sFormContainerId = sView + "--" + "fe::FormContainer::" + aArguments[0];
			return this.prepareResult(
				this.getBuilder()
					.hasId(sFormContainerId)
					.has(function (oFormContainer) {
						var oMatchingFormContainers;
						if (Object.keys(mFormState).length) {
							oMatchingFormContainers = oFormContainer.getFormElements().filter(function (oFormElement) {
								return Object.keys(mFormState).every(function (sFormElementKey) {
									return mFormState[sFormElementKey] === oFormElement.getProperty(sFormElementKey);
								});
							});
						} else {
							oMatchingFormContainers = oFormContainer.getFormElements();
						}
						return oMatchingFormContainers.length === iCount;
					})
					.description(
						Utils.formatMessage(
							"Form Container '{0}' on Form '{1}' has '{2}' Form Elements.",
							aArguments[0],
							sForm,
							aArguments[1]
						)
					)
					.execute()
			);
		};
		return FormAssertions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/HeaderAPI", [
		"./BaseAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/OverflowToolbarBuilder",
		"sap/fe/core/helpers/StableIdHelper"
	],
	function (BaseAPI, Utils, OpaBuilder, FEBuilder, OverflowToolbarBuilder, StableIdHelper) {
		"use strict";

		/**
		 * An identifier for the header facet
		 *
		 * @typedef {object} HeaderFacetIdentifier
		 * @property {string} facetId The identifier of the facet
		 * @property {boolean} [collection] Defines whether the facet is a collection facet (default: <code>false</code>)
		 * @property {boolean} [custom] Defines whether the facet is a custom header facet (default: <code>false</code>)
		 * @name sap.fe.test.api.HeaderFacetIdentifier
		 * @public
		 */

		/**
		 * Constructs a new HeaderAPI instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vHeaderDescription] Description (optional) of the header to be used for logging messages
		 * @returns {sap.fe.test.api.HeaderAPI} The new instance
		 * @hideconstructor
		 * @class
		 * @private
		 */
		var HeaderAPI = function (oHeaderBuilder, vHeaderDescription) {
			if (!Utils.isOfType(oHeaderBuilder, FEBuilder)) {
				throw new Error("oHeaderBuilder parameter must be a FEBuilder instance");
			}
			return BaseAPI.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderAPI.prototype = Object.create(BaseAPI.prototype);
		HeaderAPI.prototype.constructor = HeaderAPI;

		/**
		 * Helper method for creating an OverflowToolbarBuilder for the actions of the title used in the object page header.
		 *
		 * @param {string} sObjectPageLayoutId The identifier of <code>sap.uxap.ObjectPageLayout</code> control
		 * @returns {object} OverflowToolbarBuilder object
		 * @ui5-restricted
		 */
		HeaderAPI.prototype.createOverflowToolbarBuilder = function (sObjectPageLayoutId) {
			return OverflowToolbarBuilder.create(this.getOpaInstance())
				.hasType("sap.m.OverflowToolbar")
				.has(function (oOverflowToolbar) {
					return (
						oOverflowToolbar.getParent().getMetadata().getName() === "sap.uxap.ObjectPageDynamicHeaderTitle" &&
						oOverflowToolbar.getParent().getParent().getMetadata().getName() === "sap.uxap.ObjectPageLayout" &&
						oOverflowToolbar.getParent().getParent().getId() === sObjectPageLayoutId
					);
				});
		};

		/**
		 * Helper method for creating an OpaBuilder of the title used in the object page header.
		 *
		 * @param {string} sObjectPageLayoutId The identifier of <code>sap.uxap.ObjectPageLayout</code> control
		 * @returns {object} OpaBuilder object
		 * @ui5-restricted
		 */
		HeaderAPI.prototype.getObjectPageDynamicHeaderTitleBuilder = function (sObjectPageLayoutId) {
			return OpaBuilder.create(this.getOpaInstance())
				.hasType("sap.uxap.ObjectPageDynamicHeaderTitle")
				.has(OpaBuilder.Matchers.ancestor(sObjectPageLayoutId, true));
		};

		/**
		 * Helper method to for creating an OpaBuilder for object page header content.
		 *
		 * @param {string} sHeaderContentId The id of sap.uxap.ObjectPageDynamicHeaderContent control
		 * @returns {object} OpaBuilder object
		 * @ui5-restricted
		 */
		HeaderAPI.prototype.getObjectPageDynamicHeaderContentBuilder = function (sHeaderContentId) {
			return OpaBuilder.create(this.getOpaInstance()).hasId(sHeaderContentId);
		};

		/**
		 * Helper method for creating an OpaBuilder of the Object Page Layout.
		 *
		 * @param {string} sObjectPageLayoutId The identifier of <code>sap.uxap.ObjectPageLayout</code> control
		 * @returns {object} OpaBuilder object
		 * @ui5-restricted
		 */
		HeaderAPI.prototype.getObjectPageLayoutBuilder = function (sObjectPageLayoutId) {
			return FEBuilder.create(this.getOpaInstance()).hasType("sap.uxap.ObjectPageLayout").hasId(sObjectPageLayoutId);
		};

		/**
		 * Helper method for creating an OpaBuilder of the Object Page Header Content Container.
		 *
		 * @param {string} sObjectPageHeaderContentContainerId The identifier of <code>sap.m.FlexBox</code> control
		 * @returns {object} OpaBuilder object
		 * @ui5-restricted
		 */
		HeaderAPI.prototype.getObjectPageHeaderContentContainerBuilder = function (sObjectPageHeaderContentContainerId) {
			return FEBuilder.create(this.getOpaInstance()).hasType("sap.m.FlexBox").hasId(sObjectPageHeaderContentContainerId);
		};

		HeaderAPI.prototype.getFieldGroupFieldId = function (vFieldIdentifier, sViewId) {
			var sId = "fe::HeaderFacet";

			sId += "::Form";
			sId += "::" + StableIdHelper.prepareId(vFieldIdentifier.fieldGroup);
			sId += "::DataField";
			sId += "::" + vFieldIdentifier.field;
			sId += "::Field";

			sId = StableIdHelper.prepareId(sId);
			return sViewId ? sViewId + "--" + sId : sId;
		};

		HeaderAPI.prototype.getDataFieldForAnnotationId = function (vFieldIdentifier, sViewId) {
			var sId = "fe::HeaderFacet";

			sId += "::Form";
			sId += "::" + StableIdHelper.prepareId(vFieldIdentifier.fieldGroup);
			sId += "::DataFieldForAnnotation";
			sId += "::" + vFieldIdentifier.field;
			sId += "::" + vFieldIdentifier.targetAnnotation;
			sId += "::Field";

			sId = StableIdHelper.prepareId(sId);
			return sViewId ? sViewId + "--" + sId : sId;
		};

		/**
		 * Helper method to for creating an FEBuilder depending on given matchers and ancestor.
		 *
		 * @param {object} oMatcher The matcher-object like paginator icon
		 * @param {string} sAncestor The id of ancestor control
		 * @param {object} [mState] The matcher-object like visibility and enablement
		 * @returns {object} FEBuilder object
		 * @ui5-restricted
		 */
		HeaderAPI.prototype.createPaginatorBuilder = function (oMatcher, sAncestor, mState) {
			return FEBuilder.create(this.getOpaInstance())
				.hasType("sap.uxap.ObjectPageHeaderActionButton")
				.has(oMatcher)
				.hasState(mState)
				.has(OpaBuilder.Matchers.ancestor(sAncestor, false));
		};

		return HeaderAPI;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/HeaderActions", ["./HeaderAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "./APIHelper"],
	function (HeaderAPI, Utils, OpaBuilder, FEBuilder, APIHelper) {
		"use strict";

		/**
		 * Constructs a new HeaderActions instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vHeaderDescription] Description (optional) of the header to be used for logging messages
		 * @returns {sap.fe.test.api.HeaderActions} The new instance
		 * @alias sap.fe.test.api.HeaderActions
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var HeaderActions = function (oHeaderBuilder, vHeaderDescription) {
			this._sObjectPageLayoutId = vHeaderDescription.id;
			this._sHeaderContentId = vHeaderDescription.headerContentId;
			this._sHeaderContentContainerId = vHeaderDescription.headerContentContainerId;
			this._sViewId = vHeaderDescription.viewId;
			this._sPaginatorId = vHeaderDescription.paginatorId;
			this._sBreadCrumbId = vHeaderDescription.breadCrumbId;
			return HeaderAPI.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderActions.prototype = Object.create(HeaderAPI.prototype);
		HeaderActions.prototype.constructor = HeaderActions;
		HeaderActions.prototype.isAction = true;

		/**
		 * Executes an action in the header toolbar of an object page.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} vActionIdentifier The identifier of the action
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActions.prototype.iExecuteAction = function (vActionIdentifier) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId);
			return this.prepareResult(
				oOverflowToolbarBuilder
					.doOnContent(this.createActionMatcher(vActionIdentifier), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Executing header action '{0}'", vActionIdentifier))
					.execute()
			);
		};

		/**
		 * Executes the Edit action in the header toolbar of an object page.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActions.prototype.iExecuteEdit = function () {
			return this.iExecuteAction({ service: "StandardAction", action: "Edit", unbound: true });
		};

		/**
		 * Executes the Draft/Saved Version action in the header toolbar of an object page.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActions.prototype.iExecuteDraftAndSavedVersionSwitch = function () {
			return this.iExecuteAction({ service: "StandardAction", action: "SwitchDraftAndActiveObject", unbound: true });
		};

		/**
		 * Executes the Delete action in the header toolbar of an object page.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActions.prototype.iExecuteDelete = function () {
			return this.iExecuteAction({ service: "StandardAction", action: "Delete", unbound: true });
		};

		/**
		 * Executes the Related Apps action in the header toolbar of an object page.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActions.prototype.iExecuteRelatedApps = function () {
			return this.iExecuteAction({ service: "fe", action: "RelatedApps", unbound: true });
		};

		/**
		 * Executes an action in the drop-down menu that is currently open.
		 *
		 * @param {string | object} vAction The label of the action or its state
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActions.prototype.iExecuteMenuAction = function (vAction) {
			return this.prepareResult(APIHelper.createMenuActionExecutorBuilder(vAction).execute());
		};

		/**
		 * Executes an action in the selection list that is currently open.
		 *
		 * @param {string | object} vAction The label of the action or its state
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActions.prototype.iExecuteSelectListAction = function (vAction) {
			return this.prepareResult(APIHelper.createSelectListActionExecutorBuilder(vAction).execute());
		};

		/**
		 * Navigates to the next sub-object page.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActions.prototype.iExecutePaginatorDown = function () {
			return this.prepareResult(
				this.createPaginatorBuilder(
					OpaBuilder.Matchers.properties({ icon: "sap-icon://navigation-down-arrow" }),
					this._sViewId + "--" + this._sPaginatorId,
					{ visible: true, enabled: true }
				)
					.doPress()
					.description("Paginator button Down pressed")
					.execute()
			);
		};

		/**
		 * Navigates to the previous sub-object page.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActions.prototype.iExecutePaginatorUp = function () {
			return this.prepareResult(
				this.createPaginatorBuilder(
					OpaBuilder.Matchers.properties({ icon: "sap-icon://navigation-up-arrow" }),
					this._sViewId + "--" + this._sPaginatorId,
					{ visible: true, enabled: true }
				)
					.doPress()
					.description("Paginator button Up pressed")
					.execute()
			);
		};

		/**
		 * Navigates by using a breadcrumb link on an object page.
		 *
		 * @param {string} sLink The label of the link to be navigated to
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 * @ui5-restricted
		 */
		HeaderActions.prototype.iNavigateByBreadcrumb = function (sLink) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasId(this._sBreadCrumbId)
					.doOnAggregation("links", OpaBuilder.Matchers.properties({ text: sLink }), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Navigating by breadcrumb link '{0}'", sLink))
					.execute()
			);
		};

		/**
		 * Executes the <code>Save as Tile</code> action.
		 *
		 * @param {string} sBookmarkTitle The title of the new tile
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 * @ui5-restricted
		 */
		HeaderActions.prototype.iExecuteSaveAsTile = function (sBookmarkTitle) {
			var oShareProperties = {
					icon: "sap-icon://action"
				},
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId);

			return this.prepareResult(
				oOverflowToolbarBuilder
					.doOnContent(OpaBuilder.Matchers.properties(oShareProperties), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSaveAsTileExecutorBuilder(sBookmarkTitle))
					.execute()
			);
		};

		/**
		 * Executes the <code>Send E-Mail</code> action.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 * @ui5-restricted
		 */
		HeaderActions.prototype.iExecuteSendEmail = function () {
			var oShareProperties = {
					icon: "sap-icon://action"
				},
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId);

			return this.prepareResult(
				oOverflowToolbarBuilder
					.doOnContent(OpaBuilder.Matchers.properties(oShareProperties), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSendEmailExecutorBuilder())
					.execute()
			);
		};

		/**
		 * Clicks a link within the object page header.
		 *
		 * TODO this function will not made public as it is, it needs some refactoring to behave similar to the FormActions#iClickLink function.
		 *
		 * @param {string} vLinkIdentifier The label of the link to be clicked (TODO it actually must be the link text with the current implementation)
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		HeaderActions.prototype.iClickLink = function (vLinkIdentifier) {
			// TODO this function needs to aligned with onForm().iClickLink - for now vLinkIdentifier must be the link text!
			var oHeaderContentBuilder = this.getObjectPageHeaderContentContainerBuilder(this._sHeaderContentContainerId);
			return this.prepareResult(
				oHeaderContentBuilder
					.has(OpaBuilder.Matchers.children(FEBuilder.create().hasType("sap.m.Link").hasProperties({ text: vLinkIdentifier })))
					.doPress()
					.description(Utils.formatMessage("Pressing link '{0}'", vLinkIdentifier))
					.execute()
			);
		};

		return HeaderActions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/HeaderActionsLR", ["./HeaderLR", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "./APIHelper"],
	function (HeaderLR, Utils, OpaBuilder, FEBuilder, APIHelper) {
		"use strict";

		/**
		 * Constructs a new HeaderActionsLR instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vHeaderDescription] Description (optional) of the header to be used for logging messages
		 * @returns {sap.fe.test.api.HeaderActionsLR} The new instance
		 * @alias sap.fe.test.api.HeaderActionsLR
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var HeaderActionsLR = function (oHeaderBuilder, vHeaderDescription) {
			return HeaderLR.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderActionsLR.prototype = Object.create(HeaderLR.prototype);
		HeaderActionsLR.prototype.constructor = HeaderActionsLR;
		HeaderActionsLR.prototype.isAction = true;

		/**
		 * Executes an action in the header toolbar of a list report.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} [vActionIdentifier] The identifier of the action
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderActionsLR.prototype.iExecuteAction = function (vActionIdentifier) {
			var aArguments = Utils.parseArguments([[Object, String]], arguments),
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId);
			return this.prepareResult(
				oOverflowToolbarBuilder
					.doOnContent(this.createActionMatcher(vActionIdentifier), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Executing custom header action '{0}'", aArguments[0]))
					.execute()
			);
		};

		/**
		 * Executes the <code>Save as Tile</code> action.
		 *
		 * @param {string} sBookmarkTitle The title of the new tile
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		HeaderActionsLR.prototype.iExecuteSaveAsTile = function (sBookmarkTitle) {
			var sShareId = "fe::Share",
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId);

			return this.prepareResult(
				oOverflowToolbarBuilder
					.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSaveAsTileExecutorBuilder(sBookmarkTitle))
					.execute()
			);
		};

		/**
		 * Executes the <code>Send E-Mail</code> action.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		HeaderActionsLR.prototype.iExecuteSendEmail = function () {
			var sShareId = "fe::Share",
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId);

			return this.prepareResult(
				oOverflowToolbarBuilder
					.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSendEmailExecutorBuilder())
					.execute()
			);
		};

		return HeaderActionsLR;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/HeaderAssertions", [
		"./HeaderAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"./APIHelper"
	],
	function (HeaderAPI, Utils, OpaBuilder, FEBuilder, FieldBuilder, APIHelper) {
		"use strict";

		/**
		 * Constructs a new HeaderAssertions instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vHeaderDescription] Description (optional) of the header to be used for logging messages
		 * @returns {sap.fe.test.api.HeaderAssertions} The new instance
		 * @alias sap.fe.test.api.HeaderAssertions
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var HeaderAssertions = function (oHeaderBuilder, vHeaderDescription) {
			this._sObjectPageLayoutId = vHeaderDescription.id;
			this._sHeaderId = vHeaderDescription.headerId;
			this._sHeaderContentId = vHeaderDescription.headerContentId;
			this._sHeaderContentContainerId = vHeaderDescription.headerContentContainerId;
			this._sViewId = vHeaderDescription.viewId;
			this._sPaginatorId = vHeaderDescription.paginatorId;
			this._sBreadCrumbId = vHeaderDescription.breadCrumbId;
			return HeaderAPI.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderAssertions.prototype = Object.create(HeaderAPI.prototype);
		HeaderAssertions.prototype.constructor = HeaderAssertions;
		HeaderAssertions.prototype.isAction = false;

		/**
		 * Checks an action in the header toolbar.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} vActionIdentifier The identifier of the action
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckAction = function (vActionIdentifier, mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId);
			return this.prepareResult(
				oOverflowToolbarBuilder
					.hasContent(this.createActionMatcher(vActionIdentifier), mState)
					.description(Utils.formatMessage("Checking header action '{0}' in state '{1}'", vActionIdentifier, mState))
					.execute()
			);
		};

		/**
		 * Checks the <code>Edit</code> action in the header toolbar.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckEdit = function (mState) {
			return this.iCheckAction({ service: "StandardAction", action: "Edit", unbound: true }, mState);
		};

		/**
		 * Checks the <code>Delete</code> action in the header toolbar.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckDelete = function (mState) {
			return this.iCheckAction({ service: "StandardAction", action: "Delete", unbound: true }, mState);
		};

		/**
		 * Checks the <code>Related Apps</code> action in the header toolbar.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckRelatedApps = function (mState) {
			return this.iCheckAction({ service: "fe", action: "RelatedApps", unbound: true }, mState);
		};

		/**
		 * Checks an action in the popover that is currently open.
		 *
		 * @param {object | string} vAction The state map or label of the action
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckMenuAction = function (vAction) {
			return this.prepareResult(APIHelper.createMenuActionCheckBuilder(vAction).execute());
		};

		/**
		 * Checks the number of items available in the Object Page header.
		 *
		 * @param {number} iNumberOfItems The expected number of items
		 * @param {boolean} [bIncludeHidden] Defines whether non-visible items should be counted
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		HeaderAssertions.prototype.iCheckNumberOfHeaderContentItems = function (iNumberOfItems, bIncludeHidden) {
			var oHeaderContentBuilder = this.getObjectPageDynamicHeaderContentBuilder(this._sHeaderContentId);

			return this.prepareResult(
				oHeaderContentBuilder
					.has(function (oOPHeaderContent) {
						var aItems = oOPHeaderContent.getContent()[0].getItems();
						if (!bIncludeHidden) {
							aItems = aItems.filter(function (oControl) {
								return oControl.getVisible();
							});
						}
						return aItems.length === iNumberOfItems;
					})
					.description(Utils.formatMessage("Checking number of header content with '{0}' items", iNumberOfItems))
					.execute()
			);
		};

		/**
		 * Checks a field within a field group in the object page header.
		 *
		 * @param {sap.fe.test.api.FieldIdentifier | string} vFieldIdentifier The identifier of the field
		 * @param {string|Array|object} [vValue] The value to check. If it is an array, the first entry is considered as
		 * the value and the second as the description. If it is an object it must follow this pattern:
		 * <code><pre>
		 * 	{
		 * 		value: <string>, 		// optional
		 * 		description: <string> 	// optional
		 * 	}
		 * </pre></code>
		 * @param {object} [mState] Defines the expected state of the field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckFieldInFieldGroup = function (vFieldIdentifier, vValue, mState) {
			var aArguments = Utils.parseArguments([Object, [Array, String], Object], arguments),
				sFieldId =
					(vFieldIdentifier.targetAnnotation
						? this.getDataFieldForAnnotationId(vFieldIdentifier, this._sViewId)
						: this.getFieldGroupFieldId(vFieldIdentifier, this._sViewId)) + "-content";

			return this.prepareResult(
				FieldBuilder.create(this)
					.hasId(sFieldId)
					.hasValue(aArguments[1])
					.hasState(aArguments[2])
					.description(
						Utils.formatMessage(
							"Seeing field '{0}' with value '{1}' and state='{2}'",
							aArguments[0],
							aArguments[1],
							aArguments[2]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks a data point in the object page header.
		 *
		 * @param {string} sTitle The title of the data point
		 * @param {string} sValue The expected value of the data point
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		HeaderAssertions.prototype.iCheckDataPoint = function (sTitle, sValue) {
			var oHeaderContentBuilder = this.getObjectPageDynamicHeaderContentBuilder(this._sHeaderContentId);

			return this.prepareResult(
				oHeaderContentBuilder
					.has(
						OpaBuilder.Matchers.childrenMatcher(
							OpaBuilder.Matchers.some([
								OpaBuilder.create(this)
									.hasType("sap.m.ObjectNumber")
									.hasProperties({ number: sValue })
									.has(function (oObjectNumber) {
										return oObjectNumber.getParent();
									})
									.hasAggregationProperties("items", { text: sTitle }),
								OpaBuilder.create(this)
									.hasType("sap.m.ObjectStatus")
									.hasProperties({ text: sValue })
									.has(function (oObjectNumber) {
										return oObjectNumber.getParent();
									})
									.hasAggregationProperties("items", { text: sTitle })
							])
						)
					)
					.description(Utils.formatMessage("Seeing header data point '{0}' with value '{1}'", sTitle, sValue))
					.execute()
			);
		};

		/**
		 * Checks the title and description of the object page.
		 *
		 * If either title or description is <code>undefined</code>, it will not be checked.
		 *
		 * @param {string} [sTitle] Title of the object page header
		 * @param {string} [sDescription] Description of the object page header
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckTitle = function (sTitle, sDescription) {
			var oHeaderTitleBuilder = this.getObjectPageDynamicHeaderTitleBuilder(this._sObjectPageLayoutId);
			return this.prepareResult(
				oHeaderTitleBuilder
					.hasConditional(
						sTitle !== undefined,
						OpaBuilder.Matchers.childrenMatcher(OpaBuilder.create(this).hasType("sap.m.Title").hasProperties({ text: sTitle }))
					)
					.hasConditional(
						sDescription !== undefined,
						OpaBuilder.Matchers.childrenMatcher(
							OpaBuilder.create(this).hasType("sap.m.Label").hasProperties({ text: sDescription })
						)
					)
					.description(
						!sDescription
							? "Seeing Object Page header title '" + sTitle + "'"
							: "Seeing Object Page header title '" + sTitle + "' and subtitle '" + sDescription + "'"
					)
					.execute()
			);
		};

		/**
		 * Checks the paginator down button.
		 *
		 * @param {object} mState Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckPaginatorDown = function (mState) {
			return this.prepareResult(
				this.createPaginatorBuilder(
					OpaBuilder.Matchers.properties({ icon: "sap-icon://navigation-down-arrow" }),
					this._sViewId + "--" + this._sPaginatorId,
					mState
				)
					.description(Utils.formatMessage("Checking paginator down action with state='{0}'", mState))
					.execute()
			);
		};

		/**
		 * Checks the paginator up button.
		 *
		 * @param {object} mState Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckPaginatorUp = function (mState) {
			return this.prepareResult(
				this.createPaginatorBuilder(
					OpaBuilder.Matchers.properties({ icon: "sap-icon://navigation-up-arrow" }),
					this._sViewId + "--" + this._sPaginatorId,
					mState
				)
					.description(Utils.formatMessage("Checking paginator up action with state='{0}'", mState))
					.execute()
			);
		};

		/**
		 * Checks a MicroChart shown in the header of an object page.
		 *
		 * TODO this function will not be public yet: Its signature doesn't fit the framework.
		 *
		 * @param {object|string} vMicroChartIdentifier Id/Type or Title of MicroChart
		 * @param {string} sUoMLabel UoM label of the MicroChart
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		HeaderAssertions.prototype.iCheckMicroChart = function (vMicroChartIdentifier, sUoMLabel) {
			var oOpaBuilder = OpaBuilder.create(this.getOpaInstance());

			if (!Utils.isOfType(vMicroChartIdentifier, String)) {
				oOpaBuilder.hasId(
					this._sViewId +
						"--" +
						this._sHeaderId +
						"::MicroChart::" +
						vMicroChartIdentifier.chartId +
						"::" +
						vMicroChartIdentifier.chartType
				);
				if (sUoMLabel !== undefined) {
					oOpaBuilder.hasAggregationProperties("_uomLabel", { text: sUoMLabel });
					oOpaBuilder.description(
						Utils.formatMessage(
							"Seeing Micro Chart of type '{0}' with identifier '{1}' and UoM Label '{2}'",
							vMicroChartIdentifier.chartType,
							vMicroChartIdentifier.chartId,
							sUoMLabel
						)
					);
				} else {
					oOpaBuilder.description(
						Utils.formatMessage(
							"Seeing Micro Chart of type '{0}' with identifier '{1}'",
							vMicroChartIdentifier.chartType,
							vMicroChartIdentifier.chartId
						)
					);
				}
			} else {
				oOpaBuilder.hasProperties({ chartTitle: vMicroChartIdentifier });
				if (sUoMLabel !== undefined) {
					oOpaBuilder.hasAggregationProperties("_uomLabel", { text: sUoMLabel });
					oOpaBuilder.description(
						Utils.formatMessage("Seeing Micro Chart with title '{0}' and UoM Label '{1}'", vMicroChartIdentifier, sUoMLabel)
					);
				} else {
					oOpaBuilder.description(Utils.formatMessage("Seeing Micro Chart with title '{0}'", vMicroChartIdentifier));
				}
			}
			return this.prepareResult(oOpaBuilder.execute());
		};

		/**
		 * Checks the custom facet in the object page header.
		 *
		 * @param {sap.fe.test.api.HeaderFacetIdentifier} vFacetIdentifier The Identifier of the header facet
		 * @param {object} [mState] Defines the expected state
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckHeaderFacet = function (vFacetIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oHeaderContentBuilder = this.getObjectPageHeaderContentContainerBuilder(this._sHeaderContentContainerId),
				sId = new RegExp("fe::HeaderFacetContainer::" + vFacetIdentifier.facetId + "$");

			if (vFacetIdentifier.custom) {
				sId = new RegExp("fe::HeaderFacetCustomContainer::" + vFacetIdentifier.facetId + "$");
			} else if (vFacetIdentifier.collection) {
				sId = new RegExp("fe::HeaderCollectionFacetContainer::" + vFacetIdentifier.facetId + "$");
			}

			return this.prepareResult(
				oHeaderContentBuilder
					.has(OpaBuilder.Matchers.childrenMatcher(FEBuilder.create(this.getOpaInstance()).hasId(sId).hasState(mState)))
					.description(Utils.formatMessage("Checking Header Facet '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		/**
		 * Checks a specific breadcrumb link on the object page.
		 *
		 * TODO this function will not be public yet: Its signature doesn't fit the framework.
		 *
		 * @param {string} [sLink] The text property of the link to be tested.
		 * The <code>links</code> aggregation of the breadcrumb control is checked for the availability of the given text.
		 * If <code>sLink</code> is provided as an empty string, a check is executed to see whether the breadcrumb control exists and has an empty <code>links</code> aggregation.
		 * This is the case for the main object page, which does not show breadcrumb links.
		 * If <code>sLink</code> is not provided, a check is executed to ensure the breadcrumb control does not exist at all. This is the case for the flexible column layout
		 * showing multiple floorplans at the same time.
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		HeaderAssertions.prototype.iCheckBreadCrumb = function (sLink) {
			var oFEBuilder = FEBuilder.create(this.getOpaInstance()).hasId(this._sBreadCrumbId);

			if (sLink !== undefined && sLink.length > 0) {
				oFEBuilder.hasAggregationProperties("links", { text: sLink });
				oFEBuilder.description(Utils.formatMessage("Checking breadcrumb link '{0}'", sLink));
			} else if (sLink !== undefined && sLink.length === 0) {
				oFEBuilder.hasAggregationLength("links", 0);
				oFEBuilder.hasState({ visible: true });
				oFEBuilder.description("Checking for existing but empty breadcrumbs");
			} else if (sLink === undefined) {
				oFEBuilder.hasState({ visible: false });
				oFEBuilder.description("Checking for non-existent breadcrumbs");
			}

			return this.prepareResult(oFEBuilder.execute());
		};

		/**
		 * Checks the <code>Save as Tile</code> action.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckSaveAsTile = function (mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId),
				oShareButtonProperties = {
					icon: "sap-icon://action"
				};

			if (mState && mState.visible === false) {
				oOverflowToolbarBuilder
					.hasContent(OpaBuilder.Matchers.properties(oShareButtonProperties), mState)
					.description(Utils.formatMessage("Checking header '{0}' Share button with state='{1}'", this.getIdentifier(), mState));
			} else {
				oOverflowToolbarBuilder
					.doOnContent(OpaBuilder.Matchers.properties(oShareButtonProperties), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSaveAsTileCheckBuilder(mState));
			}

			return this.prepareResult(oOverflowToolbarBuilder.execute());
		};

		/**
		 * Checks <code>Send Email</code> action.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertions.prototype.iCheckSendEmail = function (mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId),
				oShareButtonProperties = {
					icon: "sap-icon://action"
				};

			if (mState && mState.visible === false) {
				oOverflowToolbarBuilder
					.hasContent(OpaBuilder.Matchers.properties(oShareButtonProperties), mState)
					.description(Utils.formatMessage("Checking header '{0}' Share button with state='{1}'", this.getIdentifier(), mState));
			} else {
				oOverflowToolbarBuilder
					.doOnContent(OpaBuilder.Matchers.properties(oShareButtonProperties), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSendEmailCheckBuilder(mState));
			}

			return this.prepareResult(oOverflowToolbarBuilder.execute());
		};

		/**
		 * Checks the state of a link located in the Object Page header.
		 *
		 * TODO this function will not be public yet: It needs some refactoring to behave similar to the FormAssertions#iCheckLink function.
		 *
		 * @param {object | string} vLinkIdentifier The identifier of the field
		 * @param {object} [mState] Defines the expected state of the link
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @private
		 */
		HeaderAssertions.prototype.iCheckLink = function (vLinkIdentifier, mState) {
			// TODO this function needs to aligned with onForm().iCheckLink - for now vLinkIdentifier must be the link text!
			var aArguments = Utils.parseArguments([String, Object], arguments),
				oHeaderContentBuilder = this.getObjectPageHeaderContentContainerBuilder(this._sHeaderContentContainerId);
			return this.prepareResult(
				oHeaderContentBuilder
					.has(
						OpaBuilder.Matchers.childrenMatcher(
							FEBuilder.create().hasType("sap.m.Link").hasProperties({ text: vLinkIdentifier }).hasState(aArguments[1])
						)
					)
					.description(Utils.formatMessage("Checking link '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		/**
		 * Checks the number of users collaborating in the draft.
		 *
		 * @param {number} iExpectedNumber The expected number of users
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		HeaderAssertions.prototype.iCheckNumberOfCollaboratingUsers = function (iExpectedNumber) {
			var objectPageBuilder = FEBuilder.create(this.getOpaInstance()).hasId(this._sObjectPageLayoutId);

			return this.prepareResult(
				objectPageBuilder
					.hasChildren(
						FEBuilder.create(this)
							.hasType("sap.uxap.ObjectPageDynamicHeaderTitle")
							.has(OpaBuilder.Matchers.children(FEBuilder.create(this).hasType("sap.m.Avatar")))
							.has(function (aAvatars) {
								return aAvatars && aAvatars.length == iExpectedNumber + 1; // +1 because of avatar to add a user
							})
						// .hasChildren(
						// 	FEBuilder.create(this)
						// 		.hasType("sap.m.Avatar")
						// 		.has(function(oControl) {
						// 			return true;
						// 		})
						// 		//.checkNumberOfMatches(iExpectedNumber + 1) // +1 because of avatar to add a user
						// )
					)
					.description(Utils.formatMessage("Checking number of collaborating user: {0}", iExpectedNumber))
					.execute()
			);
		};

		/**
		 * Checks if a collaborating user is present.
		 *
		 * @param {string} sInitials The initials of the user (displayed in the avatar)
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		HeaderAssertions.prototype.iCheckCollaboratingUser = function (sInitials) {
			var objectPageBuilder = FEBuilder.create(this.getOpaInstance()).hasId(this._sObjectPageLayoutId);

			return this.prepareResult(
				objectPageBuilder
					.hasChildren(
						FEBuilder.create(this)
							.hasType("sap.uxap.ObjectPageDynamicHeaderTitle")
							.hasChildren(FEBuilder.create(this).hasType("sap.m.Avatar").hasProperties({ initials: sInitials }))
					)
					.description(Utils.formatMessage("Checking collaborating user with initials '{0}'", sInitials))
					.execute()
			);
		};

		return HeaderAssertions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/HeaderAssertionsLR", [
		"./HeaderLR",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFieldBuilder",
		"./APIHelper"
	],
	function (HeaderLR, Utils, OpaBuilder, FEBuilder, FieldBuilder, APIHelper) {
		"use strict";

		/**
		 * Constructs a new HeaderAssertionsLR instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vHeaderDescription] Description (optional) of the header to be used for logging messages
		 * @returns {sap.fe.test.api.HeaderAssertionsLR} The new instance
		 * @alias sap.fe.test.api.HeaderAssertionsLR
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var HeaderAssertionsLR = function (oHeaderBuilder, vHeaderDescription) {
			return HeaderLR.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderAssertionsLR.prototype = Object.create(HeaderLR.prototype);
		HeaderAssertionsLR.prototype.constructor = HeaderAssertionsLR;
		HeaderAssertionsLR.prototype.isAction = false;

		/**
		 * Checks an action of the header toolbar.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} [vActionIdentifier] The identifier of the action, or its label
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertionsLR.prototype.iCheckAction = function (vActionIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId);
			return this.prepareResult(
				oOverflowToolbarBuilder
					.hasContent(this.createActionMatcher(vActionIdentifier), mState)
					.description(Utils.formatMessage("Checking custom header action '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		/**
		 * Checks the <code>Save as Tile</code> action.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertionsLR.prototype.iCheckSaveAsTile = function (mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId),
				oShareButtonProperties = {
					icon: "sap-icon://action"
				};

			if (mState && mState.visible === false) {
				oOverflowToolbarBuilder
					.hasContent(OpaBuilder.Matchers.properties(oShareButtonProperties), mState)
					.description(Utils.formatMessage("Checking header '{0}' Share button with state='{1}'", this.getIdentifier(), mState));
			} else {
				oOverflowToolbarBuilder
					.doOnContent(OpaBuilder.Matchers.properties(oShareButtonProperties), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSaveAsTileCheckBuilder(mState));
			}

			return this.prepareResult(oOverflowToolbarBuilder.execute());
		};

		/**
		 * Checks the <code>Send Email</code> action.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		HeaderAssertionsLR.prototype.iCheckSendEmail = function (mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId),
				oShareButtonProperties = {
					icon: "sap-icon://action"
				};

			if (mState && mState.visible === false) {
				oOverflowToolbarBuilder
					.hasContent(OpaBuilder.Matchers.properties(oShareButtonProperties), mState)
					.description(Utils.formatMessage("Checking header '{0}' Share button with state='{1}'", this.getIdentifier(), mState));
			} else {
				oOverflowToolbarBuilder
					.doOnContent(OpaBuilder.Matchers.properties(oShareButtonProperties), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(APIHelper.createSendEmailCheckBuilder(mState));
			}

			return this.prepareResult(oOverflowToolbarBuilder.execute());
		};

		return HeaderAssertionsLR;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/HeaderLR", [
		"./BaseAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/OverflowToolbarBuilder",
		"sap/fe/core/helpers/StableIdHelper"
	],
	function (BaseAPI, Utils, OpaBuilder, FEBuilder, OverflowToolbarBuilder, StableIdHelper) {
		"use strict";

		/**
		 * Constructs a new HeaderLR instance.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder The {@link sap.fe.test.builder.FEBuilder} instance used to interact with the UI
		 * @param {string} [vHeaderDescription] Description (optional) of the header to be used for logging messages
		 * @returns {sap.fe.test.api.HeaderLR} The new instance
		 * @alias sap.fe.test.api.HeaderLR
		 * @class
		 * @hideconstructor
		 * @private
		 */
		var HeaderLR = function (oHeaderBuilder, vHeaderDescription) {
			if (!Utils.isOfType(oHeaderBuilder, FEBuilder)) {
				throw new Error("oHeaderBuilder parameter must be a FEBuilder instance");
			}
			this._sPageId = vHeaderDescription.id;
			return BaseAPI.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderLR.prototype = Object.create(BaseAPI.prototype);
		HeaderLR.prototype.constructor = HeaderLR;

		/**
		 * Helper method to for creating an OverflowToolbarBuilder for the actions of the header title.
		 * Since there´s no stable id for the OverflowToolbar, it´s identified by checking the parent controls and
		 * the Page Id.
		 *
		 * @param {string} sPageId The id of page control.
		 * @returns {object} OverflowToolbarBuilder object
		 * @ui5-restricted
		 */
		HeaderLR.prototype.createOverflowToolbarBuilder = function (sPageId) {
			return OverflowToolbarBuilder.create(this.getOpaInstance())
				.hasType("sap.m.OverflowToolbar")
				.has(function (oOverflowToolbar) {
					return (
						oOverflowToolbar.getParent().getMetadata().getName() === "sap.f.DynamicPageTitle" &&
						oOverflowToolbar.getParent().getParent().getMetadata().getName() === "sap.f.DynamicPage" &&
						oOverflowToolbar.getParent().getParent().getId().endsWith(sPageId)
					);
				});
		};

		return HeaderLR;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/KPICardAPI", ["./BaseAPI", "sap/fe/test/Utils", "sap/fe/test/builder/KPIBuilder"], function (BaseAPI, Utils, KPIBuilder) {
	"use strict";

	/**
	 * Constructs a new KPICardAPI instance.
	 *
	 * @param {sap.fe.test.builder.KPIBuilder} oKPIBuilder The builder instance used to interact with the UI
	 * @returns {sap.fe.test.api.KPICardAPI} The new instance
	 * @alias sap.fe.test.api.TableAPI
	 * @class
	 * @hideconstructor
	 * @public
	 */
	var KPICardAPI = function (oKPIBuilder) {
		if (!Utils.isOfType(oKPIBuilder, KPIBuilder)) {
			throw new Error("oKPIBuilder parameter must be an KPIBuilder instance");
		}
		return BaseAPI.call(this, oKPIBuilder);
	};
	KPICardAPI.prototype = Object.create(BaseAPI.prototype);
	KPICardAPI.prototype.constructor = KPICardAPI;

	return KPICardAPI;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/KPICardActions", ["./KPICardAPI", "sap/fe/test/Utils", "sap/fe/test/builder/FEBuilder"], function (KPICardAPI, Utils, FEBuilder) {
	"use strict";

	/**
	 * Constructs a new TableAssertions instance.
	 *
	 * @param {sap.fe.test.builder.KPIBuilder} oBuilderInstance The builder instance used to interact with the UI
	 * @returns {sap.fe.test.api.KPICardAssertions} The new instance
	 * @class
	 * @extends sap.fe.test.api.KPICardAPI
	 * @hideconstructor
	 * @public
	 */
	var KPICardActions = function (oBuilderInstance) {
		return KPICardAPI.call(this, oBuilderInstance);
	};
	KPICardActions.prototype = Object.create(KPICardAPI.prototype);
	KPICardActions.prototype.constructor = KPICardActions;
	KPICardActions.prototype.isAction = true;

	/**
	 * Clicks on the header of the KPI Card.
	 *
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 */
	KPICardActions.prototype.iClickHeader = function () {
		var oKPIBuilder = this.getBuilder();

		return this.prepareResult(oKPIBuilder.doClickKPICardHeader().description("Clicking KPI card header").execute());
	};

	return KPICardActions;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/api/KPICardAssertions", ["./KPICardAPI", "sap/fe/test/Utils", "sap/fe/test/builder/FEBuilder"], function (KPICardAPI, Utils, FEBuilder) {
	"use strict";

	/**
	 * Constructs a new TableAssertions instance.
	 *
	 * @param {sap.fe.test.builder.KPIBuilder} oBuilderInstance The builder instance used to interact with the UI
	 * @returns {sap.fe.test.api.KPICardAssertions} The new instance
	 * @class
	 * @extends sap.fe.test.api.KPICardAPI
	 * @hideconstructor
	 * @public
	 */
	var KPICardAssertions = function (oBuilderInstance) {
		return KPICardAPI.call(this, oBuilderInstance);
	};
	KPICardAssertions.prototype = Object.create(KPICardAPI.prototype);
	KPICardAssertions.prototype.constructor = KPICardAssertions;
	KPICardAssertions.prototype.isAction = false;

	/**
	 * Checks the title of the KPI Card.
	 *
	 * @param {string} sTitle The expected title
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 */
	KPICardAssertions.prototype.iSeeHeaderTitle = function (sTitle) {
		var oKPIBuilder = this.getBuilder();
		var vTitleMatcher = FEBuilder.create(this)
			.hasType("sap.m.Text")
			.has(function (oControl) {
				return oControl.getId().endsWith("-title");
			})
			.hasProperties({ text: sTitle });

		return this.prepareResult(
			oKPIBuilder
				.doOnKPICardHeader(vTitleMatcher, true)
				.description("Checking card title: " + sTitle)
				.execute()
		);
	};

	/**
	 * Checks the subtitle of the KPI Card.
	 *
	 * @param {string} sSubtitle The expected title
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 */
	KPICardAssertions.prototype.iSeeHeaderSubtitle = function (sSubtitle) {
		var oKPIBuilder = this.getBuilder();
		var vTitleMatcher = FEBuilder.create(this)
			.hasType("sap.m.Text")
			.has(function (oControl) {
				return oControl.getId().endsWith("-subtitle");
			})
			.hasProperties({ text: sSubtitle });

		return this.prepareResult(
			oKPIBuilder
				.doOnKPICardHeader(vTitleMatcher, true)
				.description("Checking card sub-title: " + sSubtitle)
				.execute()
		);
	};

	/**
	 * Checks the unit of the KPI Card.
	 *
	 * @param {string} sText The expected unit
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 */
	KPICardAssertions.prototype.iSeeHeaderUnit = function (sText) {
		var oKPIBuilder = this.getBuilder();
		var vTitleMatcher = FEBuilder.create(this)
			.hasType("sap.m.Text")
			.has(function (oControl) {
				return oControl.getId().endsWith("-unitOfMeasurement");
			})
			.hasProperties({ text: sText });

		return this.prepareResult(
			oKPIBuilder
				.doOnKPICardHeader(vTitleMatcher, true)
				.description("Checking card unit: " + sText)
				.execute()
		);
	};

	/**
	 * Checks the details of the KPI Card.
	 *
	 * @param {string} sText The expected detail value
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 */
	KPICardAssertions.prototype.iSeeHeaderDetails = function (sText) {
		var oKPIBuilder = this.getBuilder();
		var vTitleMatcher = FEBuilder.create(this)
			.hasType("sap.m.Text")
			.has(function (oControl) {
				return oControl.getId().endsWith("-details");
			})
			.hasProperties({ text: sText });

		return this.prepareResult(
			oKPIBuilder
				.doOnKPICardHeader(vTitleMatcher, true)
				.description("Checking card details: " + sText)
				.execute()
		);
	};

	/**
	 * Checks the main indicator of the KPI Card.
	 *
	 * @param {string} sValue The expected value of the indicator
	 * @param {object} mStates Additionnal properties to check (indicator, valueColor, scale)
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 */
	KPICardAssertions.prototype.iSeeHeaderValue = function (sValue, mStates) {
		var oKPIBuilder = this.getBuilder();
		var oProperties = mStates || {};
		oProperties.number = sValue;

		var vTitleMatcher = FEBuilder.create(this).hasType("sap.f.cards.NumericIndicators").hasProperties(oProperties);

		var sDescription = mStates
			? Utils.formatMessage("Checking card header value '{0}' in state '{1}'", sValue, mStates)
			: Utils.formatMessage("Checking card header value '{0}'", sValue);
		return this.prepareResult(
			oKPIBuilder
				.doOnKPICardHeader(vTitleMatcher, true)
				.description("Checking card header: " + sDescription)
				.execute()
		);
	};

	/**
	 * Checks a side indicator of the KPI Card.
	 *
	 * @param {string} sTitle The expected title of the side indicator
	 * @param {string} sValue The expected value of the side indicator
	 * @param {string} sUnit The expected unit of the side indicator
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 */
	KPICardAssertions.prototype.iSeeSideIndicator = function (sTitle, sValue, sUnit) {
		var oKPIBuilder = this.getBuilder();

		var vIndicatorMatcher = FEBuilder.create(this)
			.hasType("sap.f.cards.NumericIndicators")
			.hasChildren(
				FEBuilder.create(this)
					.hasType("sap.f.cards.NumericSideIndicator")
					.hasChildren(FEBuilder.create(this).hasType("sap.m.Text").hasProperties({ text: sTitle }))
					.hasChildren(FEBuilder.create(this).hasType("sap.m.Text").hasProperties({ text: sTitle }))
					.hasChildren(FEBuilder.create(this).hasType("sap.m.Text").hasProperties({ text: sValue }))
			);

		return this.prepareResult(
			oKPIBuilder
				.doOnKPICardHeader(vIndicatorMatcher, true)
				.description("Checking card side indicator: " + sTitle + " - " + sValue + " - " + sUnit)
				.execute()
		);
	};

	/**
	 * Checks the chart of the KPI card.
	 *
	 * @param {object} mProperties The properties to be checked on the chart (vizType). If null or empty, we just check if the chart is visible.
	 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
	 */
	KPICardAssertions.prototype.iSeeChart = function (mProperties) {
		var oKPIBuilder = this.getBuilder();

		var vChartMatcher = mProperties && Object.keys(mProperties).length ? FEBuilder.create(this).hasProperties(mProperties) : undefined;

		var sDescription = vChartMatcher
			? Utils.formatMessage("Checking card chart with properties '{0}'", mProperties)
			: Utils.formatMessage("Checking card chart");

		return this.prepareResult(oKPIBuilder.doOnKPICardChart(vChartMatcher).description(sDescription).execute());
	};
	return KPICardAssertions;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/TableAPI", [
		"./BaseAPI",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/ui/test/OpaBuilder",
		"sap/ui/test/actions/Action",
		"sap/ui/core/SortOrder",
		"sap/ui/test/Opa5",
		"sap/base/util/UriParameters"
	],
	function (BaseAPI, Utils, FEBuilder, TableBuilder, OpaBuilder, Action, SortOrder, Opa5, SAPUriParameters) {
		"use strict";

		/**
		 * A column identifier
		 *
		 * @typedef {object} ColumnIdentifier
		 * @property {string} name The technical name of the column
		 * @name sap.fe.test.api.ColumnIdentifier
		 * @public
		 */

		/**
		 * Constructs a new TableAPI instance.
		 *
		 * @param {sap.fe.test.builder.TableBuilder} oTableBuilder The builder instance used to interact with the UI
		 * @param {string} [vTableDescription] Description (optional) of the table to be used for logging messages
		 * @returns {sap.fe.test.api.TableAPI} The new instance
		 * @alias sap.fe.test.api.TableAPI
		 * @class
		 * @hideconstructor
		 * @public
		 */
		var TableAPI = function (oTableBuilder, vTableDescription) {
			if (!Utils.isOfType(oTableBuilder, TableBuilder)) {
				throw new Error("oTableBuilder parameter must be an TableBuilder instance");
			}
			return BaseAPI.call(this, oTableBuilder, vTableDescription);
		};
		TableAPI.prototype = Object.create(BaseAPI.prototype);
		TableAPI.prototype.constructor = TableAPI;

		TableAPI.createRowMatchers = function (vRowValues, mRowState, vAdditionalMatchers, vHiddenCells) {
			var aArguments = Utils.parseArguments([[Object, Number], Object, [Array, Function], Array], arguments),
				aRowMatchers = [];
			if (Utils.isOfType(aArguments[0], Object)) {
				aRowMatchers.push(TableBuilder.Row.Matchers.cellValues(aArguments[0]));
			} else if (Utils.isOfType(aArguments[0], Number)) {
				aRowMatchers.push(function (oRow) {
					var oRowParent = oRow.getParent(),
						sParentAggregation = oRow.sParentAggregationName;
					return oRowParent && sParentAggregation
						? oRowParent.getAggregation(sParentAggregation).indexOf(oRow) === aArguments[0]
						: false;
				});
			}
			if (Utils.isOfType(aArguments[1], Object)) {
				aRowMatchers.push(TableBuilder.Row.Matchers.states(aArguments[1]));
			}
			if (!Utils.isOfType(aArguments[3], [null, undefined])) {
				aRowMatchers.push(TableBuilder.Row.Matchers.hiddenCells(aArguments[3]));
			}
			if (!Utils.isOfType(aArguments[2], [null, undefined])) {
				aRowMatchers = aRowMatchers.concat(aArguments[2]);
			}
			return aRowMatchers;
		};

		TableAPI.prototype.createGroupRowMatchers = function (iLevel, sTitle) {
			return [TableBuilder.Row.Matchers.visualGroup(iLevel, sTitle)];
		};

		/**
		 * Opens the column adaptation dialog of the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAPI.prototype.iOpenColumnAdaptation = function () {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doOpenColumnAdaptation()
					.description(
						Utils.formatMessage("Opening the column adaptation dialog for '{0}' (if not open yet)", this.getIdentifier())
					)
					.execute()
			);
		};

		/**
		 * Confirms and closes the adaptation dialog of the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAPI.prototype.iConfirmColumnAdaptation = function () {
			return this.prepareResult(
				TableBuilder.createAdaptationDialogBuilder(this.getOpaInstance())
					.doPressFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.OK"))
					.description(
						Utils.formatMessage("Confirming the column adaptation dialog for '{0}' (if currently open)", this.getIdentifier())
					)
					.execute()
			);
		};

		/**
		 * Opens the sorting dialog of the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAPI.prototype.iOpenColumnSorting = function () {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doOpenColumnSorting()
					.description(Utils.formatMessage("Opening the column sorting dialog for '{0}' (if not open yet)", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Confirms and closes the sorting dialog of the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAPI.prototype.iConfirmColumnSorting = function () {
			return this.prepareResult(
				TableBuilder.createSortingDialogBuilder(this.getOpaInstance())
					.doPressFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.OK"))
					.description(
						Utils.formatMessage("Closing the column sorting dialog for '{0}' (if currently open)", this.getIdentifier())
					)
					.execute()
			);
		};

		/**
		 * Opens the filtering dialog of the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAPI.prototype.iOpenFilterDialog = function () {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doOpenColumnFiltering()
					.description(Utils.formatMessage("Opening the filter dialog for '{0}' (if not open yet)", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Confirms and closes the filtering dialog of the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAPI.prototype.iConfirmFilterDialog = function () {
			// TODO: Remove this temporary toggle when MDC development for the "Filter Query Panel" has been finished
			var bUseQueryPanel = new SAPUriParameters(Opa5.getWindow().location.search).getAll("sap-ui-xx-filterQueryPanel")[0] === "true";
			if (bUseQueryPanel) {
				return this._iConfirmFilterDialogWithQueryPanel();
			} else {
				return this._iConfirmFilterDialogWithListPanel();
			}
		};

		TableAPI.prototype._iConfirmFilterDialogWithQueryPanel = function () {
			var sTableId = this.getIdentifier(),
				oFilterDialogBuilder = TableBuilder.createFilteringDialogBuilder(this.getOpaInstance()).hasChildren(
					OpaBuilder.create().hasType("sap.m.ComboBox")
				),
				oComboBoxBuilder = OpaBuilder.create(this.getOpaInstance()).isDialogElement().hasType("sap.m.ComboBox");
			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.success(function () {
						if (FEBuilder.controlsExist(oComboBoxBuilder)) {
							oFilterDialogBuilder
								.doPressFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.OK"))
								.description(Utils.formatMessage("Closing the filter dialog for '{0}' (if currently open)", sTableId))
								.execute();
						}
					})
					.execute()
			);
		};

		TableAPI.prototype._iConfirmFilterDialogWithListPanel = function () {
			return this.prepareResult(
				TableBuilder.createFilteringDialogBuilder(this.getOpaInstance())
					.doPressFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.OK"))
					.description(Utils.formatMessage("Closing the filter dialog for '{0}' (if currently open)", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Helper method to personalize table, to select a columns from the combo box on the filter dialog.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier provided
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		TableAPI.prototype.selectColumnOnFilterDialog = function (vColumnIdentifier) {
			var sTableId = this.getIdentifier().id,
				oComboBox,
				// TODO: Remove this temporary workaround when obsolete
				fnItemKeyCleansing = function (sKey) {
					return sKey.startsWith("Property::") ? sKey.split("::")[1] : sKey;
				},
				oColumnListBuilder = FEBuilder.create(this.getOpaInstance()).hasType("sap.m.ComboBox").isDialogElement(),
				oColumnBuilder = TableBuilder.createFilteringDialogBuilder(this.getOpaInstance())
					.has(OpaBuilder.Matchers.children(oColumnListBuilder))
					.has(function (aMatchingComboBoxes) {
						if (aMatchingComboBoxes.length !== 1) {
							throw Error(Utils.formatMessage("Cannot open filtering dialog of table '{0}'", sTableId));
						}
						oComboBox = aMatchingComboBoxes[0];
						return oComboBox.getItems();
					}),
				oColumnMatcher = function (aFoundComboBoxItems) {
					var fnFindColumn = Utils.isOfType(vColumnIdentifier, String)
						? function (oItem) {
								return oItem.getText() === vColumnIdentifier;
						  }
						: function (oItem) {
								return fnItemKeyCleansing(oItem.getKey()) === vColumnIdentifier.name;
						  };
					return aFoundComboBoxItems.filter(fnFindColumn);
				};
			return this.prepareResult(
				oColumnBuilder
					.has(oColumnMatcher)
					.do(function (aMatchingItems) {
						if (aMatchingItems.length === 0) {
							throw Error(Utils.formatMessage("Cannot open filter field '{0}'", vColumnIdentifier));
						}
						var oItemToSelect = aMatchingItems[0],
							sItemText = oItemToSelect.getText();
						OpaBuilder.Actions.executor(OpaBuilder.Actions.enterText(sItemText, false, false, true))(oComboBox);
					})
					.execute()
			);
		};

		/**
		 * Helper method to personalize table, either adapt columns or filter. If no actions are given, this function can be used for checking only.
		 * During execution it checks for an already open dialog. If it does not exist, it is opened before
		 * the check/interaction of the columns, and closed/confirmed directly afterwards.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The field identifier
		 * @param {object} [mState] The state of the personalization field. The following states are supported:
		 * <code><pre>
		 * 	{
		 * 		selected: true|false
		 * 	}
		 * </pre></code>
		 * @param {Function|Array|sap.ui.test.actions.Action} [vActions] The actions to be executed on found field
		 * @param {string} sDescription The description of the check or adaptation
		 * @param {sap.ui.test.OpaBuilder} oDialogBuilder The dialog builder
		 * @param {Function} fnOpenDialog A callback for opening the dialog
		 * @param {Function} fnCloseDialog A callback for closing the dialog
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		TableAPI.prototype.personalization = function (
			vColumnIdentifier,
			mState,
			vActions,
			sDescription,
			oDialogBuilder,
			fnOpenDialog,
			fnCloseDialog
		) {
			var aArguments = Utils.parseArguments(
					[[String, Object], Object, [Function, Array, Action], String, OpaBuilder, Function, Function],
					arguments
				),
				oBuilder = FEBuilder.create(this.getOpaInstance()),
				bDialogOpen,
				oAdaptColumnBuilder = FEBuilder.create(this.getOpaInstance()).hasType("sap.m.ColumnListItem").isDialogElement();

			oDialogBuilder = aArguments[4];
			fnOpenDialog = aArguments[5];
			fnCloseDialog = aArguments[6];

			vColumnIdentifier = aArguments[0];
			if (Utils.isOfType(vColumnIdentifier, String)) {
				// oAdaptColumnBuilder.has(OpaBuilder.Matchers.bindingProperties(BaseAPI.MDC_P13N_MODEL, { label: vColumnIdentifier }));
				oAdaptColumnBuilder.hasSome(
					OpaBuilder.Matchers.bindingProperties(BaseAPI.MDC_P13N_MODEL, { label: vColumnIdentifier }),
					OpaBuilder.Matchers.bindingProperties(BaseAPI.MDC_P13N_MODEL, { name: vColumnIdentifier })
				);
			} else {
				oAdaptColumnBuilder.has(
					OpaBuilder.Matchers.bindingProperties(BaseAPI.MDC_P13N_MODEL, {
						name: vColumnIdentifier.name
					})
				);
			}

			mState = aArguments[1];
			var bCheckForNotVisible = mState && mState.visible === false;
			if (!bCheckForNotVisible && !Utils.isOfType(mState, [null, undefined])) {
				oAdaptColumnBuilder.hasState(mState);
			}

			vActions = aArguments[2];
			if (!Utils.isOfType(vActions, [null, undefined])) {
				oDialogBuilder.do(vActions);
			}

			sDescription = aArguments[3];
			return this.prepareResult(
				oBuilder
					.success(function () {
						bDialogOpen = FEBuilder.controlsExist(oDialogBuilder);
						if (!bDialogOpen) {
							fnOpenDialog();
							oDialogBuilder.success(fnCloseDialog);
						}
						return oDialogBuilder
							.has(OpaBuilder.Matchers.children(oAdaptColumnBuilder))
							.has(function (aFoundAdaptationColumns) {
								if (bCheckForNotVisible) {
									return aFoundAdaptationColumns.length === 0;
								}
								return FEBuilder.Matchers.atIndex(0)(aFoundAdaptationColumns);
							})
							.description(sDescription)
							.execute();
					})
					.execute()
			);
		};
		/**
		 * Helper method to adapt the sorting of a table. If no actions are given, this function can be used for checking only.
		 * During execution it checks for an already open dialog. If it does not exist, it is opened before
		 * the check/interaction of the columns, and closed/confirmed directly afterwards.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The field identifier
		 * @param {object} [mState] The state of the personalization field. The following states are supported:
		 * <code><pre>
		 * 	{
		 * 		sortOrder: SortOrder.Ascending|SortOrder.Descending|SortOrder.None
		 * 	}
		 * </pre></code>
		 * @param {Function|Array|sap.ui.test.actions.Action} [vActions] The actions to be executed on found field
		 * @param {string} sDescription The description of the check or adaptation
		 * @param {sap.ui.test.OpaBuilder} oDialogBuilder The dialog builder
		 * @param {Function} fnOpenDialog A callback for opening the dialog
		 * @param {Function} fnCloseDialog A callback for closing the dialog
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		TableAPI.prototype.sortingPersonalization = function (
			vColumnIdentifier,
			mState,
			vActions,
			sDescription,
			oDialogBuilder,
			fnOpenDialog,
			fnCloseDialog
		) {
			var aArguments = Utils.parseArguments(
					[[String, Object], Object, [Function, Array, Action], String, OpaBuilder, Function, Function],
					arguments
				),
				oBuilder = FEBuilder.create(this.getOpaInstance()),
				bDialogOpen,
				oAdaptColumnBuilder = FEBuilder.create(this.getOpaInstance()).hasType("sap.m.CustomListItem").isDialogElement(),
				oNoneColumnMatcher = OpaBuilder.Matchers.childrenMatcher(
					OpaBuilder.create().hasType("sap.m.ComboBox").hasProperties({ placeholder: "Sort by" })
				),
				oTargetColumnMatcher;

			oDialogBuilder = aArguments[4];
			fnOpenDialog = aArguments[5];
			fnCloseDialog = aArguments[6];

			vColumnIdentifier = aArguments[0];
			if (Utils.isOfType(vColumnIdentifier, String)) {
				oTargetColumnMatcher = OpaBuilder.Matchers.childrenMatcher(
					OpaBuilder.create(this.getOpaInstance())
						.hasType("sap.m.ComboBox")
						.has(function (oSelectControl) {
							return oSelectControl.getSelectedItem()
								? oSelectControl.getSelectedItem().getText() === vColumnIdentifier
								: false;
						})
				);
			} else {
				oTargetColumnMatcher = OpaBuilder.Matchers.childrenMatcher(
					OpaBuilder.create(this.getOpaInstance())
						.hasType("sap.m.ComboBox")
						.hasProperties({ selectedKey: vColumnIdentifier.name })
				);
			}

			mState = aArguments[1];
			var bCheckForNotVisible = mState && mState.visible === false;

			oDialogBuilder
				.has(OpaBuilder.Matchers.children(oAdaptColumnBuilder))
				.has(function (aCustomListItems) {
					var aMatchingListItems = OpaBuilder.Matchers.filter(oTargetColumnMatcher)(aCustomListItems);
					if (aMatchingListItems.length) {
						return aMatchingListItems;
					}
					return OpaBuilder.Matchers.filter(oNoneColumnMatcher)(aCustomListItems);
				})
				.has(function (aFoundAdaptationColumns) {
					if (bCheckForNotVisible) {
						return aFoundAdaptationColumns.length === 0;
					}
					return FEBuilder.Matchers.atIndex(0)(aFoundAdaptationColumns);
				});

			if (!bCheckForNotVisible && !Utils.isOfType(mState, [null, undefined])) {
				if (mState.sortOrder) {
					var sSortOrder = mState.sortOrder;
					delete mState.sortOrder;
					oDialogBuilder.hasChildren(
						OpaBuilder.create()
							.hasType("sap.m.SegmentedButton")
							.has(function (oSegmentedButton) {
								if (sSortOrder === SortOrder.None) {
									return !oSegmentedButton.enabled;
								}
								return oSegmentedButton.getSelectedKey() === (sSortOrder === SortOrder.Ascending ? "asc" : "desc");
							})
					);
				}
				//oDialogBuilder.hasState(mState);
			}

			vActions = aArguments[2];
			if (!Utils.isOfType(vActions, [null, undefined])) {
				oDialogBuilder.do(vActions);
			}

			sDescription = aArguments[3];
			return this.prepareResult(
				oBuilder
					.success(function () {
						bDialogOpen = FEBuilder.controlsExist(oDialogBuilder);
						if (!bDialogOpen) {
							fnOpenDialog();
							oDialogBuilder.success(fnCloseDialog);
						}
						return oDialogBuilder.description(sDescription).execute();
					})
					.execute()
			);
		};
		/**
		 * Helper method to adapt columns fields. If no actions are given, this function can be used for checking only.
		 * During execution it checks for an already open adaptation dialog. If it does not exist, it is opened before
		 * the check/interaction of the columns, and closed/confirmed directly afterwards.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the column
		 * @param {object} [mState] Defines the state of the adaptation column
		 * @param {Function|Array|sap.ui.test.actions.Action} [vActions] The actions to be executed on found adaptation field
		 * @param {string} sDescription The description of the check or adaptation
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		TableAPI.prototype.columnAdaptation = function (vColumnIdentifier, mState, vActions, sDescription) {
			return this.personalization(
				vColumnIdentifier,
				mState,
				vActions,
				sDescription,
				TableBuilder.createAdaptationDialogBuilder(this.getOpaInstance()),
				this.iOpenColumnAdaptation.bind(this),
				this.iConfirmColumnAdaptation.bind(this)
			);
		};

		/**
		 * Helper method to sort columns fields. If no actions are given, this function can be used for checking only.
		 * During execution it checks for an already open sorting dialog. If it does not exist, it is opened before
		 * the check/interaction of the columns, and closed/confirmed directly afterwards.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the column
		 * @param {object} [mState] Defines the state of the adaptation column
		 * @param {Function|Array|sap.ui.test.actions.Action} [vActions] The actions to be executed on found adaptation field
		 * @param {string} sDescription The description of the check or adaptation
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		TableAPI.prototype.columnSorting = function (vColumnIdentifier, mState, vActions, sDescription) {
			return this.sortingPersonalization(
				vColumnIdentifier,
				mState,
				vActions,
				sDescription,
				TableBuilder.createSortingDialogBuilder(this.getOpaInstance()),
				this.iOpenColumnSorting.bind(this),
				this.iConfirmColumnSorting.bind(this)
			);
		};

		return TableAPI;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/TableActions", [
		"./TableAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/ui/test/matchers/Interactable",
		"sap/fe/test/builder/VMBuilder",
		"sap/ui/core/SortOrder",
		"sap/ui/core/Core",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/fe/test/builder/MdcFilterFieldBuilder",
		"./APIHelper",
		"sap/ui/test/Opa5",
		"sap/base/util/UriParameters"
	],
	function (
		TableAPI,
		Utils,
		OpaBuilder,
		FEBuilder,
		Interactable,
		VMBuilder,
		SortOrder,
		Core,
		TableBuilder,
		FilterFieldBuilder,
		APIHelper,
		Opa5,
		SAPUriParameters
	) {
		"use strict";

		/**
		 * Constructs a new TableActions instance.
		 *
		 * @param {sap.fe.test.builder.TableBuilder} oBuilderInstance The builder instance used to interact with the UI
		 * @param {string} [vTableDescription] Description (optional) of the table to be used for logging messages
		 * @returns {sap.fe.test.api.TableActions} The new instance
		 * @alias sap.fe.test.api.TableActions
		 * @class
		 * @extends sap.fe.test.api.TableAPI
		 * @hideconstructor
		 * @public
		 */
		var Actions = function (oBuilderInstance, vTableDescription) {
			return TableAPI.call(this, oBuilderInstance, vTableDescription);
		};
		Actions.prototype = Object.create(TableAPI.prototype);
		Actions.prototype.constructor = Actions;
		Actions.prototype.isAction = true;

		/**
		 * Presses the control in the table cell.
		 *
		 * @param {object} [mRowValues] Specifies the target row by column-value map, e.g.
		 * <code><pre>
		 * {
		 *     0: "Max",
		 *     "Last Name": "Mustermann"
		 * }
		 * </pre></code>
		 * @param {string | number} vColumn The column name, label or index
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iPressCell = function (mRowValues, vColumn) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.checkNumberOfMatches(1)
					.doClickOnCell(TableAPI.createRowMatchers(mRowValues), vColumn)
					.description(
						Utils.formatMessage(
							"Pressing cell of table '{0}' with row value = '{1}' and column {2} = '{3}' ",
							this.getIdentifier(),
							mRowValues,
							isNaN(vColumn) ? "header" : "index",
							vColumn
						)
					)
					.execute()
			);
		};

		/**
		 * Selects the specified rows.
		 *
		 * @param {object | number} [vRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * Alternatively, the 0-based row index can be used.
		 * @param {object} [mState] Defines the expected state of the row
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iSelectRows = function (vRowValues, mState) {
			var aArguments = Utils.parseArguments([[Object, Number], Object], arguments),
				oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doSelect(TableAPI.createRowMatchers(aArguments[0], aArguments[1]))
					.description(
						Utils.formatMessage(
							"Selecting rows of table '{0}' with values='{1}' and state='{2}'",
							this.getIdentifier(),
							aArguments[0],
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Selects all rows in a table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iSelectAllRows = function () {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doSelectAll()
					.description(Utils.formatMessage("Selecting all rows in table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Clicks the specified row.
		 *
		 * @param {object | number} [vRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * Alternatively, the 0-based row index can be used.
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iPressRow = function (vRowValues) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.checkNumberOfMatches(1)
					.doNavigate(TableAPI.createRowMatchers(vRowValues))
					.description(Utils.formatMessage("Pressing row of table '{0}' with values='{1}'", this.getIdentifier(), vRowValues))
					.execute()
			);
		};

		/**
		 * Expands a row corresponding to a visual group.
		 *
		 * @param {number} iLevel The level of the group row to be expanded (1-based)
		 * @param {string} sTitle The title of the group row to be expanded
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExpandGroupRow = function (iLevel, sTitle) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.checkNumberOfMatches(1)
					.doExpand(this.createGroupRowMatchers(iLevel, sTitle))
					.description(Utils.formatMessage("Expanding group row {0} - {1} of table '{2}'", iLevel, sTitle, this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Collapses a row corresponding to a visual group.
		 *
		 * @param {number} iLevel The level of the group row to be collapsed (1-based)
		 * @param {string} sTitle The title of the group row to be collapsed
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iCollapseGroupRow = function (iLevel, sTitle) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.checkNumberOfMatches(1)
					.doCollapse(this.createGroupRowMatchers(iLevel, sTitle))
					.description(Utils.formatMessage("Collapsing group row {0} - {1} of table '{2}'", iLevel, sTitle, this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Scrolls up/down to the first/last row of the table.
		 *
		 * @param {string} [sDirection] The scroll direction "up" or "down" (default)
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		Actions.prototype.iScroll = function (sDirection) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.checkNumberOfMatches(1)
					.doScroll(sDirection)
					.description(Utils.formatMessage("Scrolling the table '{0}' '{1}'", this.getIdentifier(), sDirection))
					.execute()
			);
		};

		/**
		 * Scrolls update the grow threshold of responsive table and rebind the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		Actions.prototype.iPressMore = function () {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder.checkNumberOfMatches(1).doPressMore().description(Utils.formatMessage("Press more")).execute()
			);
		};

		/**
		 * Changes the specified row. The given value map must match exactly one row.
		 *
		 * If only one parameter is provided, it must be the <code>mTargetValues</code> and <code>mRowValues</code> is considered undefined.
		 * If <code>vRowValues</code> are not defined, then the targetValues are inserted in the creationRow.
		 *
		 * @param {object | number} [vRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * Alternatively, the 0-based row index can be used.
		 * @param {object} mTargetValues A map of columns (either name or index) to its new value. The columns do not need to match the ones defined in <code>vRowValues</code>.
		 * @param {boolean} bInputNotFinalized If true, we keep the focus on the modified cell and don't press enter to validate the input
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iChangeRow = function (vRowValues, mTargetValues, bInputNotFinalized) {
			var oTableBuilder = this.getBuilder(),
				bIsCreationRow = false;

			if (arguments.length === 1) {
				bIsCreationRow = true;
				mTargetValues = vRowValues;
			}

			if (!bIsCreationRow) {
				oTableBuilder
					.checkNumberOfMatches(1)
					.doEditValues(TableAPI.createRowMatchers(vRowValues), mTargetValues, bInputNotFinalized);
			} else {
				oTableBuilder.checkNumberOfMatches(1).doEditCreationRowValues(mTargetValues, bInputNotFinalized);
			}

			return this.prepareResult(
				oTableBuilder
					.description(
						Utils.formatMessage(
							"Changing row values of table '{0}' with old values='{1}' to new values='{2}'",
							this.getIdentifier(),
							bIsCreationRow ? "<CreationRow>" : vRowValues,
							mTargetValues
						)
					)
					.execute()
			);
		};

		/**
		 * Executes an action on the table.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} [vActionIdentifier] The identifier of the action, or its label
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExecuteAction = function (vActionIdentifier) {
			var aArguments = Utils.parseArguments([[Object, String]], arguments),
				oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doExecuteAction(this.createActionMatcher(vActionIdentifier))
					.description(Utils.formatMessage("Executing table action '{0}'", aArguments[0]))
					.execute()
			);
		};

		/**
		 * Executes an action form the drop-down menu that is currently open.
		 *
		 * @param {string | object} vAction The label of the action or its state
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExecuteMenuAction = function (vAction) {
			return this.prepareResult(APIHelper.createMenuActionExecutorBuilder(vAction).execute());
		};

		/**
		 * Executes the <code>Show/Hide details</code> action on the table.
		 *
		 * @param {boolean} [bShowDetails] Optional parameter to enforce a certain state (showing details yes/no corresponds to true/false); if not set, state is toggled
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExecuteShowHideDetails = function (bShowDetails) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doShowHideDetails(bShowDetails)
					.description(
						Utils.formatMessage(
							"Executing the Show/Hide Details action for '{0}'{1}",
							this.getIdentifier(),
							bShowDetails !== undefined ? " enforcing 'Show Details' = " + bShowDetails : ""
						)
					)
					.execute()
			);
		};

		/**
		 * Executes the <code>Delete</code> action on the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExecuteDelete = function () {
			var oTableBuilder = this.getBuilder(),
				sDeleteId = "::StandardAction::Delete";

			return this.prepareResult(
				oTableBuilder
					.doExecuteAction(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sDeleteId))))
					.description(Utils.formatMessage("Pressing delete action of table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Selects a quick-filter item on the table.
		 *
		 * @param {object | string} [vItemIdentifier] If passed as an object, the following pattern will be considered:
		 * <code><pre>
		 * 	{
		 * 		<annotationPath>: <name of the key>
		 *  }
		 * </pre></code>
		 * If using a plain string as the identifier, it is considered the item label
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iSelectQuickFilterItem = function (vItemIdentifier) {
			var oPropertyMatcher;
			if (Utils.isOfType(vItemIdentifier, String)) {
				oPropertyMatcher = { text: vItemIdentifier };
			} else if (Utils.isOfType(vItemIdentifier, Object)) {
				oPropertyMatcher = { key: vItemIdentifier.annotationPath };
			}
			return this.prepareResult(
				this.getBuilder()
					.doSelectQuickFilter(OpaBuilder.Matchers.properties(oPropertyMatcher))
					.description(
						Utils.formatMessage(
							"Selecting on table '{0}' quickFilter Item  with text '{1}'",
							this.getIdentifier(),
							vItemIdentifier
						)
					)
					.execute()
			);
		};

		/**
		 * Executes the <code>Create</code> action on the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExecuteCreate = function () {
			var oTableBuilder = this.getBuilder(),
				sCreateId = "::StandardAction::Create";

			return this.prepareResult(
				oTableBuilder
					.doExecuteAction(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sCreateId))))
					.description(Utils.formatMessage("Pressing create action of table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Executes the <code>Fullscreen</code> action on the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExecuteFullScreen = function () {
			var oTableBuilder = this.getBuilder(),
				sFullScreenId = "::StandardAction::FullScreen";

			return this.prepareResult(
				oTableBuilder
					.doExecuteAction(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sFullScreenId))))
					.description(Utils.formatMessage("Pressing fullscreen action of table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Executes the action to create a row in the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExecuteInlineCreate = function () {
			var oTableBuilder = this.getBuilder();

			return this.prepareResult(
				oTableBuilder
					.doOnChildren(
						OpaBuilder.create(this)
							.hasType("sap.ui.table.CreationRow")
							.has(FEBuilder.Matchers.bound())
							.checkNumberOfMatches(1)
							.doPress("applyBtn")
					)
					.description(Utils.formatMessage("Pressing inline create action of table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Executes an action that is available in a certain column within a table row.
		 *
		 * @param {object | number} [vRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * Alternatively, the 0-based row index can be used.
		 * @param {string | number} vColumn The column name, label or index
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExecuteInlineAction = function (vRowValues, vColumn) {
			var aArguments = Utils.parseArguments(
					[
						[Object, Number],
						[String, Number]
					],
					arguments
				),
				oTableBuilder = this.getBuilder();

			return this.prepareResult(
				oTableBuilder
					.checkNumberOfMatches(1)
					.doExecuteInlineAction(TableAPI.createRowMatchers(aArguments[0]), aArguments[1])
					.description(
						Utils.formatMessage(
							"Pressing inline action of table '{0}' for row '{1}' and action " +
								(Utils.isOfType(aArguments[1], Number) ? "with column index '{2}'" : "'{2}'"),
							this.getIdentifier(),
							aArguments[0],
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Executes a keyboard shortcut on the table or a cell control.
		 * If only <code>sShortcut</code> is defined, the shortcut is executed on the table directly.
		 * If additionally <code>vRowValues</code> and <code>vColumn</code> are defined, the shortcut is executed on table cell level.
		 *
		 * @param {string} sShortcut The shortcut pattern
		 * @param {object | number} [vRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * Alternatively, the 0-based row index can be used.
		 * @param {string | number} vColumn The column name, label or index
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iExecuteKeyboardShortcut = function (sShortcut, vRowValues, vColumn) {
			return this.prepareResult(
				this.getBuilder()
					.doPressKeyboardShortcut(sShortcut, vRowValues, vColumn)
					.description(
						Utils.formatMessage(
							vRowValues && vColumn
								? "Execute keyboard shortcut '{1}' on column '{3}' of row with values '{2}' of table '{0}'"
								: "Execute keyboard shortcut '{1}' on table '{0}'",
							this.getIdentifier(),
							sShortcut,
							vRowValues,
							vColumn
						)
					)
					.execute()
			);
		};

		/**
		 * Saves a variant under the given name, or overwrites the current one.
		 *
		 * @param {string} [sVariantName] The name of the new variant. If omitted, the current variant will be overwritten
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iSaveVariant = function (sVariantName) {
			var fnSuccessFunction = Utils.isOfType(sVariantName, String)
				? function (oTable) {
						return VMBuilder.create(this)
							.hasId(oTable.getId ? oTable.getId() + "::VM" : oTable[0].getId() + "::VM")
							.doSaveAs(sVariantName)
							.description(Utils.formatMessage("Saving variant for '{0}' as '{1}'", this.getIdentifier(), sVariantName))
							.execute();
				  }
				: function (oTable) {
						return VMBuilder.create(this)
							.hasId(oTable.getId ? oTable.getId() + "::VM" : oTable[0].getId() + "::VM")
							.doSave()
							.description(Utils.formatMessage("Saving current variant for '{0}'", this.getIdentifier()))
							.execute();
				  };

			return this.prepareResult(this.getBuilder().success(fnSuccessFunction.bind(this)).execute());
		};

		/**
		 * Removes the variant of the given name.
		 *
		 * @param {string} sVariantName The name of the variant to be removed
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iRemoveVariant = function (sVariantName) {
			return this.prepareResult(
				this.getBuilder()
					.success(
						function (oTable) {
							return VMBuilder.create(this)
								.hasId(oTable.getId() + "::VM")
								.doRemoveVariant(sVariantName)
								.description(Utils.formatMessage("Removing variant '{1}' for '{0}'", this.getIdentifier(), sVariantName))
								.execute();
						}.bind(this)
					)
					.execute()
			);
		};

		/**
		 * Selects the chosen variant.
		 *
		 * @param {string} sVariantName The name of the variant to be selected
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iSelectVariant = function (sVariantName) {
			return this.prepareResult(
				this.getBuilder()
					.success(
						function (oTable) {
							return VMBuilder.create(this)
								.hasId(oTable.getId() + "::VM")
								.doSelectVariant(sVariantName)
								.description(Utils.formatMessage("Selecting variant '{1}' for '{0}'", this.getIdentifier(), sVariantName))
								.execute();
						}.bind(this)
					)
					.execute()
			);
		};

		/**
		 * Sets the variant as the default.
		 *
		 * @param {string} sVariantName The name of the variant to be set as the default variant. If omitted, the Standard variant is set as the default
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iSetDefaultVariant = function (sVariantName) {
			return this.prepareResult(
				this.getBuilder()
					.success(
						function (oTable) {
							return sVariantName
								? VMBuilder.create(this)
										.hasId(oTable.getId ? oTable.getId() + "::VM" : oTable[0].getId() + "::VM")
										.doSetVariantAsDefault(sVariantName)
										.description(
											Utils.formatMessage(
												"Setting variant '{1}' as default for '{0}'",
												this.getIdentifier(),
												sVariantName
											)
										)
										.execute()
								: VMBuilder.create(this)
										.hasId(oTable.getId ? oTable.getId() + "::VM" : oTable[0].getId() + "::VM")
										.doResetDefaultVariant()
										.description(
											Utils.formatMessage("Setting Standard variant as default for '{0}'", this.getIdentifier())
										)
										.execute();
						}.bind(this)
					)
					.execute()
			);
		};

		/**
		 * Adds a field as a column to the table.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the column field, or its label
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iAddAdaptationColumn = function (vColumnIdentifier) {
			return this.columnAdaptation(
				vColumnIdentifier,
				{ selected: false },
				OpaBuilder.Actions.press("selectMulti"),
				Utils.formatMessage("Adding column '{1}' to table '{0}'", this.getIdentifier(), vColumnIdentifier)
			);
		};

		/**
		 * Removes a field as a column from the table.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the column field, or its label
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iRemoveAdaptationColumn = function (vColumnIdentifier) {
			return this.columnAdaptation(
				vColumnIdentifier,
				{ selected: true },
				OpaBuilder.Actions.press("selectMulti"),
				Utils.formatMessage("Removing column '{1}' from table '{0}'", this.getIdentifier(), vColumnIdentifier)
			);
		};

		/**
		 * Adds a field to the sorting of the table via the sort dialog.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the column field, or its label
		 * @param {sap.ui.core.SortOrder} [sSortOrder] The sort order, default is {@link sap.ui.core.SortOrder.Ascending}
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iChangeSortOrder = function (vColumnIdentifier, sSortOrder) {
			var oOpaInstance = this.getOpaInstance(),
				aActions = [],
				fnSelectSortingColumnAction = function (oColumnListItem) {
					var oChildBuilder = OpaBuilder.create(oOpaInstance).hasType("sap.m.ComboBox"),
						vControls = OpaBuilder.Matchers.children(oChildBuilder)(oColumnListItem),
						fnFindItem = Utils.isOfType(vColumnIdentifier, String)
							? function (oItem) {
									return oItem.getText() === vColumnIdentifier;
							  }
							: function (oItem) {
									return oItem.getKey() === vColumnIdentifier.name;
							  };

					return OpaBuilder.Actions.executor(function (oSelectControl) {
						var oItemToSelect = oSelectControl.getItems().find(fnFindItem);
						if (!oItemToSelect) {
							throw Error(Utils.formatMessage("can not find sort item '{0}'", vColumnIdentifier));
						}
						oSelectControl.setSelectedItem(oItemToSelect);
						// not the recommended way - but seems to do?!
						oSelectControl.fireChange({ selectedItem: oItemToSelect });
					})(vControls);
				},
				fnSelectSortOrderAction = function (oColumnListItem) {
					var sIcon =
							sSortOrder === SortOrder.None
								? "sap-icon://decline"
								: "sap-icon://sort-" + (sSortOrder === SortOrder.Ascending ? "ascending" : "descending"),
						oTargetButtonMatcher = OpaBuilder.create(oOpaInstance).hasType("sap.m.Button").hasProperties({ icon: sIcon });
					var vControl = OpaBuilder.Matchers.children(oTargetButtonMatcher)(oColumnListItem);
					return OpaBuilder.Actions.executor(OpaBuilder.Actions.press())(vControl);
				};

			sSortOrder = sSortOrder || SortOrder.Ascending;
			switch (sSortOrder) {
				case SortOrder.Ascending:
				case SortOrder.Descending:
					aActions.push(fnSelectSortingColumnAction);
					aActions.push(fnSelectSortOrderAction);
					break;
				case SortOrder.None:
					aActions.push(fnSelectSortOrderAction);
					break;
				default:
					throw new Error("unhandled switch case: " + sSortOrder);
			}
			return this.columnSorting(
				vColumnIdentifier,
				undefined,
				aActions,
				Utils.formatMessage("Setting sort of '{1}' from table '{0}' to '{2}'", this.getIdentifier(), vColumnIdentifier, sSortOrder)
			);
		};

		/**
		 * Sorts the table entries by the specified column.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier | number} vColumnIdentifier The identifier of the column field, its label or index
		 * @param {string} [sFieldLabel] The target field for sorting in case the field label differs from the column label or in case of a complex property
		 * @param {boolean} [bDescending] Sorting (true=descending, false=ascending (default))
		 * @param {boolean} [bClearFirst] Set to <code>true</code> to clear previously set sortings (default), otherwise all previously set sorting fields will be kept.
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iSortByColumn = function (vColumnIdentifier, sFieldLabel, bDescending, bClearFirst) {
			var oTableBuilder = this.getBuilder(),
				vColumn = Utils.isOfType(vColumnIdentifier, Object) ? vColumnIdentifier.name : vColumnIdentifier,
				bClear = bClearFirst || bClearFirst === undefined,
				sFieldName = !sFieldLabel ? vColumn : sFieldLabel,
				sSorting = bDescending ? SortOrder.Descending : SortOrder.Ascending;

			return this.prepareResult(
				oTableBuilder
					.doSortByColumn(vColumn, sFieldName, sSorting, bClear)
					.description(
						Utils.formatMessage(
							"Sorting column '{1}{2}' of table '{0}'",
							this.getIdentifier(),
							vColumnIdentifier,
							sFieldLabel ? "/" + sFieldLabel : ""
						)
					)
					.execute()
			);
		};

		/**
		 * Groups the table entries by the specified column.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier | number} vColumnIdentifier The identifier of the column field, its label or index
		 * @param {string} [sFieldLabel] The target field for grouping. If undefined, parameter vColumnIdentifier is used as label to identify the toggle button.
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iGroupByColumn = function (vColumnIdentifier, sFieldLabel) {
			var oTableBuilder = this.getBuilder(),
				vColumn = Utils.isOfType(vColumnIdentifier, Object) ? vColumnIdentifier.name : vColumnIdentifier;

			return this.prepareResult(
				oTableBuilder
					.doGroupByColumn(vColumn, sFieldLabel)
					.description(
						Utils.formatMessage(
							"Grouping column '{1}{2}' of table '{0}'",
							this.getIdentifier(),
							vColumnIdentifier,
							sFieldLabel ? "/" + sFieldLabel : ""
						)
					)
					.execute()
			);
		};

		/**
		 * Aggregates the table entries by the specified column.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier | number} vColumnIdentifier The identifier of the column field, its label or index
		 * @param {string} [sFieldLabel] The target field to group on. If undefined, parameter vColumnIdentifier is used as label to identify the toggle button.
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iAggregateByColumn = function (vColumnIdentifier, sFieldLabel) {
			var oTableBuilder = this.getBuilder(),
				vColumn = Utils.isOfType(vColumnIdentifier, Object) ? vColumnIdentifier.name : vColumnIdentifier;
			return this.prepareResult(
				oTableBuilder
					.doAggregateByColumn(vColumn, sFieldLabel)
					.description(
						Utils.formatMessage(
							"Aggregating column '{1}{2}' of table '{0}'",
							this.getIdentifier(),
							vColumnIdentifier,
							sFieldLabel ? "/" + sFieldLabel : ""
						)
					)
					.execute()
			);
		};

		/**
		 * Changes the search field.
		 *
		 * @param {string} [sSearchText] The new search text
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iChangeSearchField = function (sSearchText) {
			return this.prepareResult(
				this.getBuilder()
					.doChangeSearch(sSearchText)
					.description(
						Utils.formatMessage("Changing the search text on table '{0}' to '{1}'", this.getIdentifier(), sSearchText || "")
					)
					.execute()
			);
		};

		/**
		 * Resets the search field.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iResetSearchField = function () {
			return this.prepareResult(
				this.getBuilder()
					.doResetSearch()
					.description(Utils.formatMessage("Resetting the search field on table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Adds a filter condition to the filter field.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the column
		 * @param {string | object} vValue Defines the value of the filter field condition
		 * @param {boolean} [bClearFirst] Set to <code>true</code> to clear previously set filters, otherwise all previously set values will be kept
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iChangeFilterField = function (vColumnIdentifier, vValue, bClearFirst) {
			// TODO: Remove this temporary toggle when MDC development for the "Filter Query Panel" has been finished
			var bUseQueryPanel = new SAPUriParameters(Opa5.getWindow().location.search).getAll("sap-ui-xx-filterQueryPanel")[0] === "true";
			if (bUseQueryPanel) {
				return this._iChangeFilterFieldOnQueryPanel(vColumnIdentifier, vValue, bClearFirst);
			} else {
				return this._iChangeFilterFieldOnListPanel(vColumnIdentifier, vValue, bClearFirst);
			}
		};

		Actions.prototype._iChangeFilterFieldOnQueryPanel = function (vColumnIdentifier, vValue, bClearFirst) {
			var that = this,
				bCloseDialog = false,
				sTableId = this.getIdentifier().id,
				// TODO: Remove this temporary workaround when obsolete
				fnItemKeyCleansing = function (sKey) {
					return sKey.startsWith("Property::") ? sKey.split("::")[1] : sKey;
				},
				oFilterDialogBuilder = TableBuilder.createFilteringDialogBuilder(this.getOpaInstance()).hasChildren(
					OpaBuilder.create().hasType("sap.m.ComboBox")
				),
				oFilterFieldBuilder = FilterFieldBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.FilterField")
					.has(function (oItem) {
						if (Utils.isOfType(vColumnIdentifier, String)) {
							return oItem.getLabel() === vColumnIdentifier;
						} else {
							return fnItemKeyCleansing(oItem.getFieldPath()) === vColumnIdentifier.name;
						}
					})
					.description(
						Utils.formatMessage(
							"Changing the filter field '{0}' of table '{1}' by adding '{2}' (was cleared first: {3})",
							vColumnIdentifier,
							sTableId,
							vValue,
							bClearFirst ? bClearFirst : false
						)
					);
			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.success(function () {
						if (!FEBuilder.controlsExist(oFilterDialogBuilder)) {
							that.iOpenFilterDialog.bind(that)();
							// Close the dialog again, when you have opened it!
							bCloseDialog = true;
						}
						return oFilterDialogBuilder
							.do(function () {
								if (!FEBuilder.controlsExist(oFilterFieldBuilder)) {
									that.selectColumnOnFilterDialog.bind(that, vColumnIdentifier)();
								}
							})
							.do(function () {
								oFilterFieldBuilder
									.doChangeValue(vValue, bClearFirst)
									.success(function () {
										if (bCloseDialog) {
											that.iConfirmFilterDialog.bind(that)();
										}
									})
									.execute();
							})
							.execute();
					})
					.execute()
			);
		};

		Actions.prototype._iChangeFilterFieldOnListPanel = function (vColumnIdentifier, vValue, bClearFirst) {
			var oFilterFieldBuilder = FilterFieldBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.FilterField")
					.hasConditional(
						Utils.isOfType(vColumnIdentifier, String),
						OpaBuilder.Matchers.properties({ label: vColumnIdentifier }),
						OpaBuilder.Matchers.properties({ fieldPath: vColumnIdentifier.name })
					)
					.checkNumberOfMatches(1),
				bDialogOpen,
				sDescription = Utils.formatMessage(
					"Changing the filter field '{0}' of table '{1}' by adding '{2}' (was cleared first: {3})",
					vColumnIdentifier,
					this.getIdentifier(),
					vValue,
					bClearFirst
				),
				fnOpenDialog = this.iOpenFilterDialog.bind(this),
				fnCloseDialog = this.iConfirmFilterDialog.bind(this);

			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.success(function () {
						bDialogOpen = FEBuilder.controlsExist(oFilterFieldBuilder);
						if (!bDialogOpen) {
							fnOpenDialog();
							oFilterFieldBuilder.success(fnCloseDialog);
						}
						return oFilterFieldBuilder.doChangeValue(vValue, bClearFirst).description(sDescription).execute();
					})
					.execute()
			);
		};

		/**
		 * Opens the value help of a filter field on the filter dialog.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the column
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @ui5-restricted
		 */
		Actions.prototype.iOpenValueHelpOfFilterField = function (vColumnIdentifier) {
			var that = this,
				sTableId = this.getIdentifier().id,
				sFieldId = Utils.isOfType(vColumnIdentifier, String) ? vColumnIdentifier : vColumnIdentifier.name,
				oComboBox,
				oColumnListBuilder = FEBuilder.create(this.getOpaInstance()).hasType("sap.m.ComboBox").isDialogElement(),
				oColumnBuilder = TableBuilder.createFilteringDialogBuilder(this.getOpaInstance())
					.has(OpaBuilder.Matchers.children(oColumnListBuilder))
					.has(function (aMatchingComboBoxes) {
						if (aMatchingComboBoxes.length !== 1) {
							throw Error(Utils.formatMessage("Cannot open filtering dialog of table '{0}'", sTableId));
						}
						oComboBox = aMatchingComboBoxes[0];
						return oComboBox.getItems();
					}),
				oColumnMatcher = function (aFoundComboBoxItems) {
					var fnFindColumn = function (oItem) {
						return oItem.getText() === sFieldId;
					};
					return aFoundComboBoxItems.filter(fnFindColumn);
				},
				oFilterFieldBuilder = FilterFieldBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.FilterField")
					.has(function (oItem) {
						return oItem.getId().split("::").pop() === sFieldId;
					}),
				oFilterFieldValueHelpBuilder = OpaBuilder.create(that.getOpaInstance())
					.hasId(sTableId + "::AdaptationFilterField::" + sFieldId + "-inner-vhi")
					.doPress()
					.description("Opening value help for '" + vColumnIdentifier + "' from within a dialog");

			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.success(function () {
						if (!FEBuilder.controlsExist(oFilterFieldBuilder)) {
							return oColumnBuilder
								.has(oColumnMatcher)
								.do(function (aMatchingItems) {
									if (aMatchingItems.length === 0) {
										throw Error(Utils.formatMessage("Cannot open filter field '{0}'", vColumnIdentifier));
									}
									var oItemToSelect = aMatchingItems[0],
										sItemText = oItemToSelect.getText();
									OpaBuilder.Actions.executor(OpaBuilder.Actions.enterText(sItemText, false, false, true))(oComboBox);
								})
								.success(function () {
									return oFilterFieldValueHelpBuilder.execute();
								})
								.execute();
						} else {
							return oFilterFieldValueHelpBuilder.execute();
						}
					})
					.execute()
			);
		};

		/**
		 * Pastes data into the table.
		 *
		 * @param {string[][]} aData The data to be pasted
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		Actions.prototype.iPasteData = function (aData) {
			return this.prepareResult(
				this.getBuilder()
					.doPasteData(aData)
					.description(Utils.formatMessage("Pasting {0} rows into table '{1}'", aData.length, this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Presses the messageStrip filter in case of issues, warnings or error message on the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 * @ui5-restricted
		 */
		Actions.prototype.iClickOnMessageStripFilter = function () {
			return this.getBuilder().doClickOnMessageStripFilter().execute();
		};

		return Actions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/api/TableAssertions", [
		"./TableAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/fe/test/builder/MdcFilterFieldBuilder",
		"sap/ui/core/SortOrder",
		"./APIHelper",
		"sap/ui/test/Opa5",
		"sap/base/util/UriParameters"
	],
	function (TableAPI, Utils, OpaBuilder, FEBuilder, TableBuilder, FilterFieldBuilder, SortOrder, APIHelper, Opa5, SAPUriParameters) {
		"use strict";

		/**
		 * Constructs a new TableAssertions instance.
		 *
		 * @param {sap.fe.test.builder.TableBuilder} oBuilderInstance The builder instance used to interact with the UI
		 * @param {string} [vTableDescription] Description (optional) of the table to be used for logging messages
		 * @returns {sap.fe.test.api.TableAssertions} The new instance
		 * @alias sap.fe.test.api.TableAssertions
		 * @class
		 * @extends sap.fe.test.api.TableAPI
		 * @hideconstructor
		 * @public
		 */
		var TableAssertions = function (oBuilderInstance, vTableDescription) {
			return TableAPI.call(this, oBuilderInstance, vTableDescription);
		};
		TableAssertions.prototype = Object.create(TableAPI.prototype);
		TableAssertions.prototype.constructor = TableAssertions;
		TableAssertions.prototype.isAction = false;

		/**
		 * Checks the state of the table.
		 *
		 * @param {object} [mState] Defines the expected state of the table
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckState = function (mState) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.hasState(mState)
					.description(Utils.formatMessage("Checking table '{0}' in state '{1}'", this.getIdentifier(), mState))
					.execute()
			);
		};

		/**
		 * Checks the rows of a table.
		 * If <code>mRowValues</code> is provided, only rows with the corresponding values are considered.
		 * If <code>iNumberOfRows</code> is provided, the number of rows are checked with respect to the provided <code>mRowValues</code> (if set) or in total.
		 * If <code>iNumberOfRows</code> is omitted, it checks for at least one matching row.
		 * If <code>mState</code> is provided, the row must be in the given state.
		 *
		 * @param {object} [mRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * @param {number} [iExpectedNumberOfRows] The expected number of rows considering <code>mRowValues</code> and <code>mRowState</code>
		 * @param {object} [mState] Defines the expected state of the target row
		 * @param {Array} [vHiddenCells] Defines the cells of the identified rows which are expected to the hidden (visible=false). You can also use test function iCheckCells to
		 * explicitly check a specific cell of a row.
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckRows = function (mRowValues, iExpectedNumberOfRows, mState, vHiddenCells) {
			var aArguments = Utils.parseArguments([Object, Number, Object, Array], arguments),
				iNumberOfRows = aArguments[1],
				aRowMatcher = TableAPI.createRowMatchers(aArguments[0], aArguments[2], undefined, aArguments[3]),
				oTableBuilder = this.getBuilder();

			// the order of the matchers matters here
			if (aRowMatcher.length) {
				// if matchers are defined, first match rows, then check number of results
				oTableBuilder.hasRows(aRowMatcher, true).has(function (aRows) {
					return Utils.isOfType(iNumberOfRows, Number) ? aRows.length === iNumberOfRows : aRows.length > 0;
				});
			} else {
				// if no row matchers are defined, check the numbers of row based on table (binding)
				oTableBuilder
					.hasNumberOfRows(iNumberOfRows)
					// but still ensure that matcher returns the row aggregation
					.hasRows(null, true);
			}

			return this.prepareResult(
				oTableBuilder
					.description(
						Utils.formatMessage(
							"Checking table '{0}' having {1} rows with values='{2}', state='{3}' and hidden cells='{4}'",
							this.getIdentifier(),
							iNumberOfRows === undefined ? "> 0" : iNumberOfRows,
							aArguments[0],
							aArguments[2],
							aArguments[3]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the state of the CreationRow button in the table.
		 *
		 * @param {object} [mRowValues] Defines the expected row values. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * @param {object} [mState] Defines the expected state of the target row
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckCreationRow = function (mRowValues, mState) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.has(
						OpaBuilder.Matchers.childrenMatcher(
							FEBuilder.create(this)
								.hasType("sap.ui.table.CreationRow")
								.has(TableBuilder.Row.Matchers.cellValues(mRowValues))
								.hasState(mState)
						)
					)
					.description(
						Utils.formatMessage(
							"Checking table '{0}' having a CreationRow with values='{1}' and state='{2}'",
							this.getIdentifier(),
							mRowValues,
							mState
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the number of items in the quick-filter menu.
		 *
		 * @param {number} iExpectedNumberOfItems The expected number of quick-filter items
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckQuickFilterItems = function (iExpectedNumberOfItems) {
			return this.prepareResult(
				this.getBuilder()
					.hasQuickFilterItems(iExpectedNumberOfItems)
					.description(
						Utils.formatMessage("Checking table '{0}' having  '{1}' item(s)", this.getIdentifier(), iExpectedNumberOfItems)
					)
					.execute()
			);
		};

		/**
		 * Checks the state of the columns of the table.
		 *
		 * @param {number} [iExpectedNumberOfColumns] The expected number of columns
		 * @param {object} [mColumnStateMap] A map of columns and their expected state. The map looks like
		 * <code><pre>
		 * 	{
		 * 		&lt;columnName | columnLabel | columnIndex>: {
		 *			header: "My header"
		 * 		}
		 * 	}
		 * </pre></code>
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckColumns = function (iExpectedNumberOfColumns, mColumnStateMap) {
			var aArguments = Utils.parseArguments([Number, Object], arguments),
				mColumns = aArguments[1],
				iNumberOfColumns = aArguments[0],
				oTableBuilder = this.getBuilder();

			if (iNumberOfColumns !== undefined) {
				oTableBuilder.hasAggregationLength("columns", iNumberOfColumns);
			} else {
				oTableBuilder.hasAggregation("columns");
			}
			oTableBuilder.hasColumns(mColumns);

			return this.prepareResult(
				oTableBuilder
					.description(
						Utils.formatMessage(
							"Checking table '{0}' having {1} columns and column states='{2}'",
							this.getIdentifier(),
							iNumberOfColumns === undefined ? "> 0" : iNumberOfColumns,
							mColumns
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the state of the cells of a table.
		 *
		 * @param {object | number} [vRowValues] Defines the row values of the target row. The pattern is:
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: &lt;expected-value>
		 *  }
		 * </pre></code>
		 * Alternatively, the 0-based row index can be used.
		 * @param {object} mColumnStateMap A map of columns and their state. The map looks like
		 * <code><pre>
		 * 	{
		 * 		&lt;column-name-or-index>: {
		 *			header: "My header"
		 * 		}
		 * 	}
		 * </pre></code>
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckCells = function (vRowValues, mColumnStateMap) {
			var mRows = arguments.length > 1 ? arguments[0] : undefined,
				mColumns = arguments.length > 1 ? arguments[1] : arguments[0],
				aRowMatcher = TableAPI.createRowMatchers(mRows, TableBuilder.Row.Matchers.cellProperties(mColumns)),
				oTableBuilder = this.getBuilder();

			return this.prepareResult(
				oTableBuilder
					.hasRows(aRowMatcher)
					.description(
						Utils.formatMessage(
							"Checking table '{0}' having cells properties '{2}' of rows with values '{1}'",
							this.getIdentifier(),
							mRows,
							mColumns
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the state of a table action.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} vActionIdentifier The identifier of the action, or its label
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckAction = function (vActionIdentifier, mState) {
			var oTableBuilder = this.getBuilder(),
				vActionMatcher = this.createActionMatcher(vActionIdentifier),
				vAggregationMatcher = FEBuilder.Matchers.deepAggregationMatcher("actions/action", [
					vActionMatcher,
					FEBuilder.Matchers.states(mState)
				]);

			if (mState && mState.visible === false) {
				// two possibilities for non-visible action: either visible property is false, or the control wasn't rendered at all
				vAggregationMatcher = OpaBuilder.Matchers.some(
					vAggregationMatcher,
					OpaBuilder.Matchers.not(FEBuilder.Matchers.deepAggregationMatcher("actions/action", vActionMatcher))
				);
			}

			return this.prepareResult(
				oTableBuilder
					.has(vAggregationMatcher)
					.description(
						Utils.formatMessage(
							"Checking table '{0}' having action '{1}' with state='{2}'",
							this.getIdentifier(),
							vActionIdentifier.service === "StandardAction" ? vActionIdentifier.action : vActionIdentifier,
							mState
						)
					)
					.execute()
			);
		};

		/**
		 * Checks an action in the drop-down menu that is currently open.
		 *
		 * @param {object | string} vAction The label of the action, or its state
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckMenuAction = function (vAction) {
			return this.prepareResult(APIHelper.createMenuActionCheckBuilder(vAction).execute());
		};

		/**
		 * Checks the <code>Delete</code> action of the table.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckDelete = function (mState) {
			return this.iCheckAction({ service: "StandardAction", action: "Delete", unbound: true }, mState);
		};

		/**
		 * Checks the search field in the table toolbar. If the <code>sSearchText</code> parameter is <code>undefined</code>, the search text is not validated.
		 *
		 * @param {string} [sSearchText] The expected text in the search field
		 * @param {object} [mState] Defines the expected state of the search field
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function that can be used for chaining statements
		 * @public
		 */
		TableAssertions.prototype.iCheckSearchField = function (sSearchText, mState) {
			var aArguments = Utils.parseArguments([String, Object], arguments),
				oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.hasSearchField(sSearchText, mState)
					.description(
						Utils.formatMessage(
							"Checking the search field on table '{0}' having search text '{1}' and state='{2}'",
							this.getIdentifier(),
							aArguments[0] || "",
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the <code>Create</code> action of the table.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckCreate = function (mState) {
			return this.iCheckAction({ service: "StandardAction", action: "Create", unbound: true }, mState);
		};

		/**
		 * Checks whether the paste button is available for the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckPaste = function () {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.hasPaste()
					.description(Utils.formatMessage("Checking paste action is available for table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Checks the <code>Fullscreen</code> action of the table.
		 *
		 * @param {object} [mState] Defines the expected state of the button
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckFullScreen = function (mState) {
			return this.iCheckAction({ service: "StandardAction", action: "FullScreen", unbound: true }, mState);
		};

		TableAssertions.prototype._iCheckTableProvidedAction = function (sProvidedAction) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder["has" + sProvidedAction]()
					.description(
						Utils.formatMessage("Checking table '{0}' having button available for '{1}'", this.getIdentifier(), sProvidedAction)
					)
					.execute()
			);
		};

		/**
		 * Checks whether the adaptation button is available for the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckColumnAdaptation = function () {
			return this._iCheckTableProvidedAction("ColumnAdaptation");
		};

		/**
		 * Checks whether the sort button is available for the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckColumnSorting = function () {
			this.iOpenColumnSorting();
			TableBuilder.createSortingDialogBuilder(this.getOpaInstance()).execute();
			return this.iConfirmColumnSorting();
		};

		/**
		 * Checks whether the filter button is available for the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckColumnFiltering = function () {
			this.iOpenFilterDialog();
			TableBuilder.createFilteringDialogBuilder(this.getOpaInstance()).execute();
			return this.iConfirmFilterDialog();
			// return this._iCheckTableProvidedAction("ColumnAdaptation");
		};

		/**
		 * Checks whether the export button is available for the table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckExport = function () {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.hasExport()
					.description(Utils.formatMessage("Checking export action is available for table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Checks the quick filter action of the table.
		 *
		 * @param {object} [mState] Defines the expected state of the control
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckQuickFilter = function (mState) {
			var oTableBuilder = this.getBuilder();
			var vAggregationMatcher = FEBuilder.Matchers.deepAggregationMatcher("quickFilter/selector", [
				[FEBuilder.Matchers.states(mState)]
			]);
			return this.prepareResult(
				oTableBuilder
					.has(vAggregationMatcher)
					.description(
						Utils.formatMessage(
							"Checking that table '{0}' has a QuickFilter Control with state='{1}'",
							this.getIdentifier(),
							mState
						)
					)
					.execute()
			);
		};

		/**
		 * Checks whether the column adaptation dialog is open.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckColumnAdaptationDialog = function () {
			var oAdaptationDialogBuilder = TableBuilder.createAdaptationDialogBuilder(this.getOpaInstance());
			return this.prepareResult(
				oAdaptationDialogBuilder
					.description(Utils.formatMessage("Checking column adaptation dialog for table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Checks a field in the adaptation dialog.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the column, or its label
		 * @param {object} [mState] Defines the expected state of the field control in the adaptation dialog
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckAdaptationColumn = function (vColumnIdentifier, mState) {
			return this.columnAdaptation(
				vColumnIdentifier,
				mState,
				undefined,
				Utils.formatMessage(
					"Checking adaptation column '{1}' on table '{0}' for state='{2}'",
					this.getIdentifier(),
					vColumnIdentifier,
					mState
				)
			);
		};

		/**
		 * Checks a field in the sorting dialog.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the column, or its label
		 * @param {sap.ui.core.SortOrder} [sSortOrder] The sort order of the column, default is {@link sap.ui.core.SortOrder.Ascending}
		 * @param {boolean} [bCheckPersonalization] Defines if the order is checked via sorting dialog, or via the column itself
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckSortOrder = function (vColumnIdentifier, sSortOrder, bCheckPersonalization) {
			var aArguments = Utils.parseArguments([[String, Object], String, Boolean], arguments);
			sSortOrder = aArguments[1] || SortOrder.Ascending;
			bCheckPersonalization = aArguments[2];

			var sDescription = Utils.formatMessage(
				"Checking column '{1}' on table '{0}' to be sorted '{2}'",
				this.getIdentifier(),
				vColumnIdentifier,
				sSortOrder
			);

			// either check via sorting dialog...
			if (bCheckPersonalization) {
				var mState = {};
				mState.sortOrder = sSortOrder;
				return this.columnSorting(vColumnIdentifier, mState, undefined, sDescription);
			}

			// ... or check the columns itself (default)
			var mColumnDefinition = {};
			mColumnDefinition[Utils.isOfType(vColumnIdentifier, Object) ? vColumnIdentifier.name : vColumnIdentifier] = {
				sortOrder: sSortOrder
			};
			return this.prepareResult(this.getBuilder().hasColumns(mColumnDefinition).description(sDescription).execute());
		};

		/**
		 * Checks, if a filter field is available in the filter dialog.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier The identifier of the field, or its label
		 * @param {object} [mState] Defines the expected state of the field control in the filter dialog
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckFilterField = function (vColumnIdentifier, mState) {
			// TODO: Remove this temporary toggle when MDC development for the "Filter Query Panel" has been finished
			var bUseQueryPanel = new SAPUriParameters(Opa5.getWindow().location.search).getAll("sap-ui-xx-filterQueryPanel")[0] === "true";
			if (bUseQueryPanel) {
				return this._iCheckFilterFieldOnQueryPanel(vColumnIdentifier, mState);
			} else {
				return this._iCheckFilterFieldOnListPanel(vColumnIdentifier, mState);
			}
		};

		TableAssertions.prototype._iCheckFilterFieldOnQueryPanel = function (vColumnIdentifier, mState) {
			var that = this,
				bCloseDialog = false,
				bFilterFieldFound = false,
				sTableId = this.getIdentifier().id,
				// TODO: Remove this temporary workaround when obsolete
				fnItemKeyCleansing = function (sKey) {
					return sKey.startsWith("Property::") ? sKey.split("::")[1] : sKey;
				},
				// Builder for opening filter-bar dialog
				oFilterDialogBuilder = TableBuilder.createFilteringDialogBuilder(this.getOpaInstance()).hasChildren(
					OpaBuilder.create().hasType("sap.m.ComboBox")
				),
				// Builder that checks, if any filter field is already listed in the dialog
				oFilterFieldBuilder = FilterFieldBuilder.create(this.getOpaInstance()).isDialogElement().hasType("sap.ui.mdc.FilterField"),
				// Builder that checks, if a filter field for given identifier is already listed in the dialog
				oFilterFieldByIdBuilder = FilterFieldBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.FilterField")
					.has(function (oItem) {
						// May be hit for several FilterFields - if any is already the right one don't check further
						if (!bFilterFieldFound) {
							if (Utils.isOfType(vColumnIdentifier, String)) {
								bFilterFieldFound = oItem.getLabel() === vColumnIdentifier;
							} else {
								bFilterFieldFound = fnItemKeyCleansing(oItem.getFieldPath()) === vColumnIdentifier.name;
							}
						}
						return true; // don't block further execution, only update bFilterFieldFound for later use
					})
					.description(
						Utils.formatMessage(
							"Checking the filter field '{0}' of table '{1}' in state '{2}'",
							vColumnIdentifier,
							sTableId,
							mState
						)
					),
				// Builder that checks, if a filter field for given identifier is listed in the combo box
				oFilterFieldInComboBoxBuilder = FEBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.m.ComboBox")
					.has(function (oMatchingComboBox) {
						return oMatchingComboBox.getItems();
					})
					.description(
						Utils.formatMessage(
							"Checking the filter field '{0}' of table '{1}' in state '{2}'",
							vColumnIdentifier,
							sTableId,
							mState
						)
					),
				fnFindColumn = Utils.isOfType(vColumnIdentifier, String)
					? function (oItem) {
							return oItem.getText() === vColumnIdentifier;
					  }
					: function (oItem) {
							return fnItemKeyCleansing(oItem.getKey()) === vColumnIdentifier.name;
					  },
				// Matchers for ComboBox according to mState
				oColumnMatcher = function (aFoundComboBoxItems) {
					return aFoundComboBoxItems.filter(fnFindColumn).length === 1 || bFilterFieldFound;
				},
				oColumnMatcherNot = function (aFoundComboBoxItems) {
					// Method 'check' passes a nested array, i.e. you have unwrap it first via index 0
					return aFoundComboBoxItems[0].every(function (oComboBoxItem) {
						return OpaBuilder.Matchers.not(fnFindColumn)(oComboBoxItem);
					});
				};

			// Handle the two possible states, i.e. whether a filter field is expected to be available or not
			if (mState && mState.visible === false) {
				oFilterFieldInComboBoxBuilder.check(oColumnMatcherNot);
			} else {
				oFilterFieldInComboBoxBuilder.has(oColumnMatcher);
			}

			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.success(function () {
						// (1) Open dialog, if required
						if (!FEBuilder.controlsExist(oFilterDialogBuilder)) {
							that.iOpenFilterDialog.bind(that)();
							// Close the dialog again, when you have opened it!
							bCloseDialog = true;
						}
					})
					.success(function () {
						// (2) Check, if filter field is already listed in the dialog (bFilterFieldFound will then be set to true internally)
						if (FEBuilder.controlsExist(oFilterFieldBuilder)) {
							return oFilterFieldByIdBuilder
								.success(function () {
									if (bCloseDialog) {
										that.iConfirmFilterDialog.bind(that)();
									}
									// Stop, when the state doesn't match!
									if (bFilterFieldFound && mState.visible === false) {
										throw new Error(
											Utils.formatMessage(
												"Set Filter Field '{0}' found on table '{1}' even though state should be: '{2}'",
												vColumnIdentifier,
												sTableId,
												mState
											)
										);
									}
								})
								.execute();
						}
						return true;
					})
					.success(function () {
						// (3) Check, if filter fields is still listed in the combo box (might return bFilterFieldFound = true otherwise)
						oFilterFieldInComboBoxBuilder
							.success(function () {
								if (bCloseDialog) {
									that.iConfirmFilterDialog.bind(that)();
								}
							})
							.execute();
					})
					.execute()
			);
		};

		TableAssertions.prototype._iCheckFilterFieldOnListPanel = function (vColumnIdentifier, mState) {
			var oFilterFieldBuilder = FilterFieldBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.FilterField")
					.description(
						Utils.formatMessage(
							"Checking the filter field '{0}' of table '{1}' in state '{2}'",
							vColumnIdentifier,
							this.getIdentifier(),
							mState
						)
					),
				oFilterFieldMatcher = Utils.isOfType(vColumnIdentifier, String)
					? OpaBuilder.Matchers.properties({ label: vColumnIdentifier })
					: OpaBuilder.Matchers.properties({ fieldPath: vColumnIdentifier.name }),
				bDialogOpen,
				bCheckForNotVisible = mState && mState.visible === false,
				fnOpenDialog = this.iOpenFilterDialog.bind(this),
				fnCloseDialog = this.iConfirmFilterDialog.bind(this);

			if (bCheckForNotVisible) {
				oFilterFieldBuilder.check(function (aFoundFilterFields) {
					// every field should not match name/fieldPath
					return aFoundFilterFields.every(function (oFilterField) {
						return OpaBuilder.Matchers.not(oFilterFieldMatcher)(oFilterField);
					});
				});
			} else {
				oFilterFieldBuilder.has(oFilterFieldMatcher).checkNumberOfMatches(1);
				if (!Utils.isOfType(mState, [null, undefined])) {
					oFilterFieldBuilder.hasState(mState);
				}
			}

			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.success(function () {
						bDialogOpen = FEBuilder.controlsExist(oFilterFieldBuilder);
						if (!bDialogOpen) {
							fnOpenDialog();
							oFilterFieldBuilder.success(fnCloseDialog);
						}
						return oFilterFieldBuilder.execute();
					})
					.execute()
			);
		};

		/**
		 * Checks a messageStrip on a table.
		 *
		 * @param {object} [mProperty] Defines the expected properties of the messageStrip in the table
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iCheckMessageStrip = function (mProperty) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.has(OpaBuilder.Matchers.childrenMatcher(FEBuilder.create(this).hasType("sap.m.MessageStrip").hasProperties(mProperty)))
					.description(
						Utils.formatMessage(
							"Checking table '{0}' having a MessageStrip with text ='{1}' and type ='{2}'",
							this.getIdentifier(),
							mProperty.text,
							mProperty.type
						)
					)
					.execute()
			);
		};

		/**
		 * Checks if the focus is on a table.
		 *
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iSeeFocusOnHeader = function () {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.hasHeaderFocused()
					.description(Utils.formatMessage("Checking focus on header table '{0}' ", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Checks if the focus is on a table row.
		 *
		 * @param {number} iRowIndex The expected focused row
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 * @public
		 */
		TableAssertions.prototype.iSeeFocusOnRow = function (iRowIndex) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.hasFocusOnRow(iRowIndex)
					.description(Utils.formatMessage("Checking focus on table '{0}', row '{1}' ", this.getIdentifier(), iRowIndex))
					.execute()
			);
		};

		/**
		 * Checks if a given column supports grouping.
		 * If <code>sFieldLabel</code> is not provided, we check for all grouping actions for the specified column in the column header context menu.
		 * If <code>sFieldLabel</code> is provided, we check that the column can be grouped on this field.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier | number} vColumnIdentifier The identifier of the column field, its label or index
		 * @param {number} iExpectedNumber The expected number of group options
		 * @param {string} sFieldLabel The target field to group on in case of a complex property
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		TableAssertions.prototype.iCheckGroupByColumn = function (vColumnIdentifier, iExpectedNumber, sFieldLabel) {
			var oTableBuilder = this.getBuilder(),
				vColumn = Utils.isOfType(vColumnIdentifier, Object) ? vColumnIdentifier.name : vColumnIdentifier;
			return this.prepareResult(
				oTableBuilder
					.hasGroupByColumn(vColumn, sFieldLabel, iExpectedNumber)
					.description(
						Utils.formatMessage(
							"Checking table '{0}' having {1} groupBy options for {2}{3}",
							this.getIdentifier(),
							iExpectedNumber === undefined ? "any" : iExpectedNumber,
							vColumnIdentifier,
							sFieldLabel ? "/" + sFieldLabel : ""
						)
					)
					.execute()
			);
		};

		/**
		 * Checks if a given column supports aggregations.
		 * If <code>iExpectedNumber</code> and <code>sFieldLabel</code> are not provided, we just check that the column header has an aggregation icon.
		 * If <code>iExpectedNumber</code> is provided, we check that the column has exactly this number of aggregation options.
		 * If <code>sFieldLabel</code> is provided, we check that the column can be aggregated on this field.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier | number} vColumnIdentifier The identifier of the column field, its label or index
		 * @param {number} iExpectedNumber The expected number of aggregation options
		 * @param {string} sFieldLabel The target field to aggregate on in case of a complex property
		 * @returns {object} The result of the {@link sap.ui.test.Opa5#waitFor} function, to be used for chained statements
		 */
		TableAssertions.prototype.iCheckAggregationColumn = function (vColumnIdentifier, iExpectedNumber, sFieldLabel) {
			var oTableBuilder = this.getBuilder(),
				vColumn = Utils.isOfType(vColumnIdentifier, Object) ? vColumnIdentifier.name : vColumnIdentifier;
			return this.prepareResult(
				oTableBuilder
					.hasAggregationColumn(vColumn, sFieldLabel, iExpectedNumber)
					.description(
						Utils.formatMessage(
							"Checking table '{0}' having {1} aggregate options for {2}{3}",
							this.getIdentifier(),
							iExpectedNumber === undefined ? "any" : iExpectedNumber,
							vColumnIdentifier,
							sFieldLabel ? "/" + sFieldLabel : ""
						)
					)
					.execute()
			);
		};

		TableAssertions.prototype.iCheckTitle = function (sTitle) {
			var oTableBuilder = this.getBuilder();

			return this.prepareResult(
				oTableBuilder
					.hasTitle(sTitle)
					.description(Utils.formatMessage("Checking table '{0}' has title '{1}'", this.getIdentifier(), sTitle))
					.execute()
			);
		};

		return TableAssertions;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/builder/DialogBuilder", ["./FEBuilder", "./OverflowToolbarBuilder", "sap/ui/test/OpaBuilder", "sap/fe/test/Utils"],
	function (FEBuilder, OverflowToolbarBuilder, OpaBuilder, Utils) {
		"use strict";

		// additionally, picking the dialog with the highest z-index (which is increased by UI5 internally) in success function
		function getMostUpperDialog(aDialogs) {
			return (
				Array.isArray(aDialogs) &&
				aDialogs
					.sort(function (oDialogA, oDialogB) {
						return Number.parseInt(oDialogA.$().css("z-index"), 10) - Number.parseInt(oDialogB.$().css("z-index"), 10);
					})
					.pop()
			);
		}

		var DialogBuilder = function () {
			var oDialogFinder = FEBuilder.create().isDialogElement().hasType("sap.m.Dialog");
			return FEBuilder.apply(this, arguments)
				.options(oDialogFinder.build())
				.has(function (oDialog) {
					return getMostUpperDialog(FEBuilder.getControls(oDialogFinder)) === oDialog;
				});
		};

		DialogBuilder.create = function (oOpaInstance, oOptions) {
			return new DialogBuilder(oOpaInstance, oOptions);
		};

		DialogBuilder.prototype = Object.create(FEBuilder.prototype);
		DialogBuilder.prototype.constructor = DialogBuilder;

		DialogBuilder.prototype.hasContent = function (vContentMatcher, bReturnContent) {
			this.has(
				bReturnContent
					? OpaBuilder.Matchers.aggregation("content", vContentMatcher)
					: OpaBuilder.Matchers.aggregationMatcher("content", vContentMatcher)
			);
			if (bReturnContent) {
				return this.has(FEBuilder.Matchers.atIndex(0));
			}
			return this;
		};

		DialogBuilder.prototype.hasHeaderButton = function (vButtonMatcher, mState) {
			return this.has(OpaBuilder.Matchers.aggregation("customHeader"))
				.has(FEBuilder.Matchers.atIndex(0))
				.hasSome(
					OpaBuilder.Matchers.aggregation("contentLeft", vButtonMatcher),
					OpaBuilder.Matchers.aggregation("contentMiddle", vButtonMatcher),
					OpaBuilder.Matchers.aggregation("contentRight", vButtonMatcher)
				)
				.has(FEBuilder.Matchers.atIndex(0))
				.hasState(mState);
		};

		DialogBuilder.prototype.hasFooterButton = function (vButtonMatcher, mState) {
			return this.doOpenFooterOverflow().success(function (vDialog) {
				if (Array.isArray(vDialog)) {
					if (vDialog.length !== 1) {
						throw new Error(Utils.formatMessage("no single dialog found: {0}", vDialog));
					}
					vDialog = vDialog[0];
				}
				return FEBuilder.create()
					.hasId(vDialog.getId())
					.has(OpaBuilder.Matchers.aggregation("buttons", vButtonMatcher))
					.has(FEBuilder.Matchers.atIndex(0))
					.hasState(mState)
					.execute();
			});
		};

		DialogBuilder.prototype.doPressHeaderButton = function (vButtonMatcher) {
			return this.has(OpaBuilder.Matchers.aggregation("customHeader"))
				.has(FEBuilder.Matchers.atIndex(0))
				.hasSome(
					OpaBuilder.Matchers.aggregation("contentLeft", vButtonMatcher),
					OpaBuilder.Matchers.aggregation("contentMiddle", vButtonMatcher),
					OpaBuilder.Matchers.aggregation("contentRight", vButtonMatcher)
				)
				.has(FEBuilder.Matchers.atIndex(0))
				.doPress();
		};

		DialogBuilder.prototype.doOpenFooterOverflow = function () {
			return OverflowToolbarBuilder.openOverflow(this, "footer");
		};

		DialogBuilder.prototype.doPressFooterButton = function (vButtonMatcher) {
			return this.doOpenFooterOverflow().success(function (vDialog) {
				if (Array.isArray(vDialog)) {
					if (vDialog.length !== 1) {
						throw new Error(Utils.formatMessage("no single dialog found: {0}", vDialog));
					}
					vDialog = vDialog[0];
				}
				return OpaBuilder.create()
					.hasId(vDialog.getId())
					.has(OpaBuilder.Matchers.aggregation("buttons", vButtonMatcher))
					.doPress()
					.execute();
			});
		};

		return DialogBuilder;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/builder/FEBuilder", [
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/Utils",
		"sap/ui/test/Opa5",
		"sap/ui/test/matchers/Matcher",
		"sap/ui/core/util/ShortcutHelper",
		"sap/base/util/deepEqual",
		"sap/ui/test/matchers/Interactable"
	],
	function (OpaBuilder, Utils, Opa5, Matcher, ShortcutHelper, deepEqual, Interactable) {
		"use strict";

		var FEBuilder = function () {
			return OpaBuilder.apply(this, arguments);
		};

		var ElementStates = {
			focused: function (bFocused) {
				var fnFocusedMatcher = OpaBuilder.Matchers.focused(true);
				return bFocused ? fnFocusedMatcher : OpaBuilder.Matchers.not(fnFocusedMatcher);
			},
			controlType: function (vType) {
				return function (oControl) {
					return oControl && oControl.isA(vType);
				};
			},
			content: function (mState) {
				return function (oControl) {
					if (!oControl) {
						return false;
					}
					var sAggregationName = oControl.getMetadata().getDefaultAggregationName() || "content",
						vAggControls = Utils.getAggregation(oControl, sAggregationName);
					if (!vAggControls) {
						return false;
					}
					if (!Array.isArray(vAggControls)) {
						vAggControls = [vAggControls];
					}
					return vAggControls.some(function (oAggControl) {
						return FEBuilder.Matchers.states(mState)(oAggControl);
					});
				};
			},
			p13nMode: function (aMode) {
				if (!Array.isArray(aMode)) {
					aMode = [];
				}
				aMode.sort();
				return function (oControl) {
					var p13nMode = oControl.getP13nMode();
					if (!Array.isArray(p13nMode)) {
						p13nMode = [];
					}
					p13nMode.sort();
					return deepEqual(aMode, p13nMode);
				};
			},
			label: function (sLabel) {
				return function (oControl) {
					if (oControl.getMetadata().getProperty("label")) {
						return OpaBuilder.Matchers.match(OpaBuilder.Matchers.properties({ label: sLabel }))(oControl);
					}
					return FEBuilder.Matchers.label(sLabel)(oControl);
				};
			}
		};

		FEBuilder.create = function (oOpaInstance) {
			return new FEBuilder(oOpaInstance);
		};

		FEBuilder.prototype = Object.create(OpaBuilder.prototype);
		FEBuilder.prototype.constructor = FEBuilder;

		/**
		 * Returns the matcher for states, which might be control specific. This function is meant to be overridden
		 * by concrete control builder if necessary.
		 *
		 * @param {any} mState
		 * @returns {Function} The state matcher function
		 * @protected
		 */
		FEBuilder.prototype.getStatesMatcher = function (mState) {
			return FEBuilder.Matchers.states(mState);
		};

		FEBuilder.prototype.hasState = function (mState) {
			if (!mState) {
				return this;
			}
			// check explicitly for boolean 'false', falsy value does not suffice
			if (mState.visible === false) {
				this.mustBeVisible(false);
				this.mustBeEnabled(false);
			}
			if (mState.enabled === false) {
				this.mustBeEnabled(false);
			}
			return this.has(this.getStatesMatcher(mState));
		};

		FEBuilder.prototype.doPressKeyboardShortcut = function (sShortcut) {
			return this.do(FEBuilder.Actions.keyboardShortcut(sShortcut));
		};

		FEBuilder.prototype.doOnSubSectionToolBar = function (vMatchers, vToolBarAction) {
			var fnDeepAggregation = FEBuilder.Matchers.deepAggregation("actions", vMatchers),
				fnGetDefaultActionButton = function (oMenuButton) {
					/* This helper function returns the default action button of a menu button (if it exists, otherwise returns null);
					 * Remark: Currently there is no official API to retrieve this button; an alternative way to achieve the same
					 * result might be to check oMenuButton.getButtonMode() === "Split" && oMenuButton.getUseDefaultActionOnly()
					 * first, and then call oMenuButton.fireDefaultAction(), but the interface parameter vContentAction expects
					 * a sap.m.button nonetheless. Hence, we currently use the internal aggregation names as a workaround.
					 */
					return oMenuButton.getAggregation("_button")
						? oMenuButton.getAggregation("_button").getAggregation("_textButton")
						: null;
				};
			return this.do(function (oSubSectionToolbar) {
				var oToolbarButton = fnDeepAggregation(oSubSectionToolbar)[0],
					oButtonForAction =
						oToolbarButton.getMetadata().getName() === "sap.m.MenuButton"
							? fnGetDefaultActionButton(oToolbarButton) || oToolbarButton
							: oToolbarButton;
				OpaBuilder.Actions.executor(vToolBarAction || OpaBuilder.Actions.press())(oButtonForAction);
			});
		};

		// overrides the base implementation to support operating on "deep" aggregation, e.g. "content/items" or "actions/action"
		FEBuilder.prototype.doOnAggregation = function (sAggregationName, vMatchers, vActions) {
			if (arguments.length < 3) {
				vActions = vMatchers;
				vMatchers = undefined;
			}
			var fnDeepAggregation = FEBuilder.Matchers.deepAggregation(sAggregationName, vMatchers);
			return this.do(function (oControl) {
				OpaBuilder.Actions.executor(vActions)(fnDeepAggregation(oControl));
			});
		};

		FEBuilder.getControls = function (vBuilder, bSingle) {
			var oOptions = vBuilder.build(),
				vControls = Opa5.getPlugin().getMatchingControls(oOptions),
				aControls = OpaBuilder.Matchers.filter(oOptions.matchers)(vControls);
			if (bSingle) {
				if (aControls.length > 1) {
					throw new Error("found ambiguous results");
				}
				return aControls.length ? aControls[0] : null;
			}
			return aControls;
		};

		FEBuilder.controlsExist = function (vBuilder) {
			return !!FEBuilder.getControls(vBuilder).length;
		};

		FEBuilder.createClosePopoverBuilder = function (oOpaInstance, vPopoverMatchers, bStrict) {
			return OpaBuilder.create(oOpaInstance).success(function () {
				var bPopoverClosed = false,
					fnCloseCallback = function () {
						bPopoverClosed = true;
					},
					oBuilder = FEBuilder.createPopoverBuilder(oOpaInstance, vPopoverMatchers);

				if (bStrict || FEBuilder.controlsExist(oBuilder)) {
					return oBuilder
						.do(function (oPopover) {
							oPopover.attachEventOnce("afterClose", fnCloseCallback);
							oPopover.close();
						})
						.success(
							OpaBuilder.create(oOpaInstance).check(function () {
								return bPopoverClosed;
							})
						)
						.execute();
				}
			});
		};

		FEBuilder.createPopoverBuilder = function (oOpaInstance, vPopoverMatchers) {
			var oBuilder = OpaBuilder.create(oOpaInstance)
				.hasType("sap.m.Popover")
				.isDialogElement(true)
				.has(function (oPopover) {
					return oPopover.isOpen();
				})
				.checkNumberOfMatches(1);

			if (vPopoverMatchers) {
				oBuilder.has(vPopoverMatchers || []);
			}

			return oBuilder;
		};

		FEBuilder.createMessageToastBuilder = function (sText) {
			return OpaBuilder.create()
				.check(function () {
					var oWindow = Opa5.getWindow();
					return (
						oWindow.sapFEStubs && oWindow.sapFEStubs.getLastToastMessage && oWindow.sapFEStubs.getLastToastMessage() === sText
					);
				})
				.description("Toast message '" + sText + "' was displayed");
		};

		FEBuilder.Matchers = {
			FOCUSED_ELEMENT: function () {
				var oTestCore = Opa5.getWindow().sap.ui.getCore(),
					sFocusedId = oTestCore.getCurrentFocusedControlId();
				if (sFocusedId) {
					return oTestCore.byId(sFocusedId);
				}
				return null;
			},
			state: function (sName, vValue) {
				if (sName in ElementStates) {
					return ElementStates[sName](vValue);
				}
				return function (oControl) {
					// check whether an aggregation exists with given name...
					var oMetadata = oControl.getMetadata(),
						vAggControls =
							oMetadata.hasAggregation(sName) && oMetadata.getAggregation(sName).multiple
								? Utils.getAggregation(oControl, sName)
								: null;
					// ...if not, use normal properties matcher
					if (!vAggControls) {
						var mProperties = {};
						mProperties[sName] = vValue;
						return FEBuilder.Matchers.match(OpaBuilder.Matchers.properties(mProperties))(oControl);
					}
					if (!Array.isArray(vAggControls)) {
						vAggControls = [vAggControls];
					}
					if (!Array.isArray(vValue)) {
						// implicit check for aggregation length if number is given after an aggregation name
						if (Utils.isOfType(vValue, Number)) {
							return vAggControls.length === vValue;
						}
						return vAggControls.some(function (oAggControl) {
							return FEBuilder.Matchers.states(vValue)(oAggControl);
						});
					}
					// at this point we have both vAggControls and vValue as arrays => we check each single element against its corresponding state
					return (
						vValue.length === vAggControls.length &&
						vAggControls.every(function (oAggControl, iIndex) {
							return FEBuilder.Matchers.states(vValue[iIndex])(oAggControl);
						})
					);
				};
			},
			states: function (mStateMap, fnSingleStateMatcher) {
				if (!Utils.isOfType(mStateMap, Object)) {
					return OpaBuilder.Matchers.TRUE;
				}
				if (!Utils.isOfType(fnSingleStateMatcher, Function)) {
					fnSingleStateMatcher = FEBuilder.Matchers.state;
				}
				return FEBuilder.Matchers.match(
					Object.keys(mStateMap).map(function (sProperty) {
						return fnSingleStateMatcher(sProperty, mStateMap[sProperty]);
					})
				);
			},
			match: function (vMatchers) {
				var fnMatch = OpaBuilder.Matchers.match(vMatchers);
				return function (oControl) {
					// ensure that the result is a boolean
					return !!fnMatch(oControl);
				};
			},
			bound: function () {
				return function (oControl) {
					return oControl && !!oControl.getBindingContext();
				};
			},
			allMatch: function (vMatchers) {
				var fnFilterMatcher = OpaBuilder.Matchers.filter(vMatchers);
				return function (aItems) {
					var iExpectedLength = (aItems && aItems.length) || 0;
					return iExpectedLength === fnFilterMatcher(aItems).length;
				};
			},
			someMatch: function (vMatchers) {
				var fnFilterMatcher = OpaBuilder.Matchers.filter(vMatchers);
				return function (aItems) {
					return fnFilterMatcher(aItems).length > 0;
				};
			},
			/**
			 * Creates a matcher function that is identifying a control by id.
			 * The result will be true in case of the string was found, otherwise false.
			 *
			 * @param {string|RegExp} vId The string/RegExp to be used for identifying the control
			 * @returns {Function} The matcher function returning true/false
			 * @public
			 * @static
			 */
			id: function (vId) {
				return function (oControl) {
					if (Utils.isOfType(vId, String)) {
						return oControl.getId() === vId;
					} else {
						return vId.test(oControl.getId());
					}
				};
			},
			/**
			 * Creates a matcher function that is identifying a control by type.
			 * The result will be true in case of the string was found, otherwise false.
			 *
			 * @param {string|RegExp} vType The string/RegExp to be used for identifying the control
			 * @returns {Function} The matcher function returning true/false
			 * @public
			 * @static
			 */
			type: function (vType) {
				return function (oControl) {
					if (Utils.isOfType(vType, String)) {
						return oControl.getMetadata().getName() === vType;
					} else {
						return vType.test(oControl.getMetadata().getName());
					}
				};
			},
			/**
			 * Creates a matcher that returns the element at <code>iIndex</code> from input array.
			 *
			 * @param {number} iIndex The index of the element to be returned
			 * @returns {Function} The matcher function returning element at given index
			 */
			atIndex: function (iIndex) {
				return function (vInput) {
					if (Utils.isOfType(vInput, [null, undefined])) {
						return null;
					}
					vInput = [].concat(vInput);
					return vInput.length > iIndex ? vInput[iIndex] : null;
				};
			},

			singleElement: function () {
				return function (vControls) {
					if (!Array.isArray(vControls)) {
						vControls = [vControls];
					}
					if (vControls.length !== 1) {
						return false;
					}
					return vControls[0];
				};
			},

			label: function (sText) {
				// either Label control exists having labelFor target the control, or ariaLabelledBy is available on control
				return OpaBuilder.Matchers.some(
					// alternative implementation to sap.ui.test.matchers.LabelFor, which does not support labels for links
					function (vControl) {
						var sControlId = vControl.getId && vControl.getId();
						return (
							sControlId &&
							FEBuilder.controlsExist(
								FEBuilder.create().hasType("sap.m.Label").hasProperties({ text: sText, labelFor: sControlId })
							)
						);
					},
					function (vControl) {
						var aAriaLabelledBy = vControl.getAriaLabelledBy && vControl.getAriaLabelledBy();
						if (Array.isArray(aAriaLabelledBy) && aAriaLabelledBy.length > 0) {
							return aAriaLabelledBy.some(function (sAriaLabelledById) {
								var oAriaLabelledBy = Opa5.getWindow().sap.ui.getCore().byId(sAriaLabelledById);
								return oAriaLabelledBy && oAriaLabelledBy.getText && oAriaLabelledBy.getText() === sText;
							});
						}
					}
				);
			},
			/**
			 * Supports an aggregation path to deeper aggregations like "actions/action" or "content/items/control".
			 *
			 * @param {string} sAggregationPath The aggregation path
			 * @param {any} [vMatchers] Matchers against target controls
			 * @returns {function(*): *} A matcher function that returns always an array with matching controls
			 */
			deepAggregation: function (sAggregationPath, vMatchers) {
				var fnFilter = OpaBuilder.Matchers.filter(vMatchers),
					fnMapControlToAggregationName = function (oControl) {
						return Utils.getAggregation(oControl, this);
					};
				return function (oControl) {
					var aAggregationNames = sAggregationPath.split("/"),
						aTargetControls = aAggregationNames.reduce(
							function (aCurrentControls, sAggregationName) {
								return Array.prototype.concat.apply(
									[],
									aCurrentControls.map(fnMapControlToAggregationName.bind(sAggregationName))
								);
							},
							[oControl]
						);
					return fnFilter(aTargetControls);
				};
			},

			deepAggregationMatcher: function (sAggregationPath, vMatchers) {
				var fnDeepAggregation = FEBuilder.Matchers.deepAggregation(sAggregationPath, vMatchers);
				return function (oControl) {
					return fnDeepAggregation(oControl).length > 0;
				};
			}
		};

		FEBuilder.Actions = {
			keyboardShortcut: function (sShortcut, sChildElement, bIgnoreFocus) {
				var aArguments = Utils.parseArguments([String, String, Boolean], arguments);
				sShortcut = aArguments[0];
				sChildElement = aArguments[1];
				bIgnoreFocus = aArguments[2];
				return function (oElement) {
					var oNormalizedShortCut = ShortcutHelper.parseShortcut(sShortcut);
					oNormalizedShortCut.type = "keydown";
					// do not lower-case single key definitions (e.g. Enter, Space, ...), else the event might not be triggered properly
					if (sShortcut.toLowerCase() === oNormalizedShortCut.key) {
						oNormalizedShortCut.key = sShortcut;
					}
					var oJqueryElement = sChildElement ? oElement.$().find(sChildElement) : oElement.$();
					if (!bIgnoreFocus) {
						oElement.focus();
					}
					oJqueryElement.trigger(oNormalizedShortCut);
				};
			}
		};

		return FEBuilder;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/builder/KPIBuilder", ["./FEBuilder", "sap/ui/test/OpaBuilder", "sap/fe/test/Utils"], function (FEBuilder, OpaBuilder, Utils) {
	"use strict";

	var KPIBuilder = function () {
		return FEBuilder.apply(this, arguments);
	};

	KPIBuilder.create = function (oOpaInstance) {
		return new KPIBuilder(oOpaInstance);
	};

	KPIBuilder.prototype = Object.create(FEBuilder.prototype);
	KPIBuilder.prototype.constructor = KPIBuilder;

	/**
	 * Checks if a KPI tag exists with a given label and other optional properties.
	 *
	 * @param {string} sKPILabel The label of the KPI
	 * @param {object} oKPIProperties Additional optional properties on the KPI (status, number, or unit)
	 * @returns {sap.fe.test.builder.KPIBuilder} This instance
	 * @private
	 * @ui5-restricted
	 */
	KPIBuilder.prototype.checkKPITag = function (sKPILabel, oKPIProperties) {
		var oTagProperties = { text: sKPILabel };

		if (oKPIProperties && oKPIProperties.status) {
			oTagProperties.status = oKPIProperties.status;
		}

		var retValue = this.hasType("sap.m.GenericTag").hasProperties(oTagProperties);

		if (oKPIProperties && (oKPIProperties.number || oKPIProperties.unit)) {
			var oNumberProperties = {};
			if (oKPIProperties.number) {
				oNumberProperties.number = oKPIProperties.number;
			}
			if (oKPIProperties.unit) {
				oNumberProperties.unit = oKPIProperties.unit;
			}
			retValue = retValue.hasChildren(FEBuilder.create(this).hasType("sap.m.ObjectNumber").hasProperties(oNumberProperties));
		}
		return retValue;
	};

	/**
	 * Clicks on a KPI tag to open the card.
	 *
	 * @param {string} sKPILabel The label of the KPI
	 * @returns {sap.fe.test.builder.KPIBuilder} This instance
	 * @private
	 */
	KPIBuilder.prototype.clickKPITag = function (sKPILabel) {
		var oTagProperties = { text: sKPILabel };

		return this.hasType("sap.m.GenericTag").hasProperties(oTagProperties).doPress();
	};

	/**
	 * Checks if a KPI Card is displayed.
	 *
	 * @returns {sap.fe.test.builder.KPIBuilder} This instance
	 * @private
	 */
	KPIBuilder.prototype.checkKPICard = function () {
		return this.hasType("sap.m.Popover").hasChildren(FEBuilder.create(this).hasType("sap.ui.integration.widgets.Card"));
	};

	/**
	 * Clicks on the KPI card header.
	 *
	 * @returns {sap.fe.test.builder.KPIBuilder} This instance
	 */
	KPIBuilder.prototype.doClickKPICardHeader = function () {
		return this.hasType("sap.ui.integration.cards.NumericHeader").doPress();
	};

	/**
	 * Applies a matcher to the content of the card header.
	 *
	 * @param {sap.ui.test.matchers.Matcher} vMatcher The matcher to filter child items
	 * @param {boolean} bDirectChild Specifies if the matcher should be applied only to direct children or all descendants
	 * @returns {sap.fe.test.builder.KPIBuilder} This instance
	 */
	KPIBuilder.prototype.doOnKPICardHeader = function (vMatcher, bDirectChild) {
		return this.hasType("sap.ui.integration.widgets.Card").hasChildren(
			FEBuilder.create(this).hasType("sap.ui.integration.cards.NumericHeader").hasChildren(vMatcher, bDirectChild)
		);
	};

	/**
	 * Applies a matcher to the card chart.
	 *
	 * @param {sap.ui.test.matchers.Matcher} vMatcher The matcher to be applied to the chart
	 * @returns {sap.fe.test.builder.KPIBuilder} This instance
	 */
	KPIBuilder.prototype.doOnKPICardChart = function (vMatcher) {
		var analyticalContentMatcher = vMatcher
			? FEBuilder.create(this).hasType("sap.ui.integration.cards.AnalyticalContent").hasChildren(vMatcher)
			: FEBuilder.create(this).hasType("sap.ui.integration.cards.AnalyticalContent");

		return this.hasType("sap.ui.integration.widgets.Card").hasChildren(analyticalContentMatcher);
	};

	return KPIBuilder;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/builder/MacroFieldBuilder", ["./FEBuilder", "./MdcFieldBuilder", "sap/ui/test/OpaBuilder", "sap/fe/test/Utils"],
	function (FEBuilder, FieldBuilder, OpaBuilder, Utils) {
		"use strict";

		function _getValueMatcher(oControl, vExpectedValue) {
			if (oControl.isA("sap.ui.mdc.Field")) {
				return FieldBuilder.Matchers.value(vExpectedValue);
			}
			if (oControl.isA("sap.ui.unified.Currency")) {
				return OpaBuilder.Matchers.properties({ stringValue: vExpectedValue.stringValue, currency: vExpectedValue.description });
			}
			var sExpectedValue = vExpectedValue;
			// we should avoid using the value description syntax when using non MDC controls but this is a workaround to have it working
			if (vExpectedValue.value) {
				sExpectedValue = vExpectedValue.description
					? vExpectedValue.description + " (" + vExpectedValue.value + ")"
					: vExpectedValue.value;
			}
			if (oControl.isA("sap.m.InputBase")) {
				return OpaBuilder.Matchers.properties({ value: sExpectedValue });
			}
			if (oControl.isA("sap.m.ObjectIdentifier")) {
				return OpaBuilder.Matchers.properties({ title: sExpectedValue });
			}
			return OpaBuilder.Matchers.properties({ text: sExpectedValue });
		}

		function _getStateMatcher(oControl, sName, vValue) {
			if (oControl.isA("sap.ui.mdc.Field")) {
				return FieldBuilder.Matchers.state(sName, vValue);
			} else if (sName === "lockedBy") {
				return function (oSubControl) {
					var oMatcher = OpaBuilder.Matchers.childrenMatcher(
						FEBuilder.create(this).hasType("sap.m.Avatar").hasProperties({ initials: vValue })
					);
					return FEBuilder.Matchers.match(oMatcher)(oSubControl);
				};
			}
			return FEBuilder.Matchers.state(sName, vValue);
		}

		function _getMainControls(oContent) {
			if (oContent.isA("sap.fe.macros.field.FieldAPI")) {
				return _getMainControls(oContent.getContent());
			}

			if (oContent.isA("sap.fe.core.controls.FormElementWrapper")) {
				// we need to do this to be able to retrieve the child of the FormElementWrapper when its child is not visible
				return _getMainControls(oContent.getContent());
			}
			if (oContent.isA("sap.fe.core.controls.FileWrapper")) {
				return _getMainControls(oContent.getAvatar());
			}
			if (oContent.isA("sap.fe.core.controls.FieldWrapper")) {
				if (oContent.getEditMode() === "Display") {
					return _getMainControls(oContent.getContentDisplay());
				} else {
					return _getMainControls(oContent.getContentEdit()[0]);
				}
			}
			if (oContent.isA("sap.fe.core.controls.ConditionalWrapper")) {
				var oLink = oContent.getCondition() ? oContent.getContentTrue() : oContent.getContentFalse();
				return _getMainControls(oLink);
			}

			return oContent.isA("sap.ui.mdc.Field") ||
				oContent.isA("sap.m.Text") ||
				oContent.isA("sap.m.ExpandableText") ||
				oContent.isA("sap.m.Label") ||
				oContent.isA("sap.m.CheckBox") ||
				oContent.isA("sap.m.Link") ||
				oContent.isA("sap.m.ObjectStatus") ||
				oContent.isA("sap.m.InputBase") ||
				oContent.isA("sap.m.Avatar") ||
				oContent.isA("sap.ui.unified.Currency") ||
				oContent.isA("sap.m.ObjectIdentifier") ||
				oContent.isA("sap.m.RatingIndicator") ||
				oContent.isA("sap.m.ProgressIndicator")
				? [oContent]
				: OpaBuilder.Matchers.children(
						OpaBuilder.create().hasSome(
							FEBuilder.Matchers.state("controlType", "sap.ui.mdc.Field"),
							FEBuilder.Matchers.state("controlType", "sap.m.Text"),
							FEBuilder.Matchers.state("controlType", "sap.m.ExpandableText"),
							FEBuilder.Matchers.state("controlType", "sap.m.Label"),
							FEBuilder.Matchers.state("controlType", "sap.m.CheckBox"),
							FEBuilder.Matchers.state("controlType", "sap.m.Link"),
							FEBuilder.Matchers.state("controlType", "sap.m.ObjectStatus"),
							FEBuilder.Matchers.state("controlType", "sap.m.InputBase"),
							FEBuilder.Matchers.state("controlType", "sap.m.Avatar"),
							FEBuilder.Matchers.state("controlType", "sap.ui.unified.Currency"),
							FEBuilder.Matchers.state("controlType", "sap.m.ObjectIdentifier"),
							FEBuilder.Matchers.state("controlType", "sap.m.RatingIndicator"),
							FEBuilder.Matchers.state("controlType", "sap.m.ProgressIndicator")
						)
				  )(oContent);
		}

		var MacroFieldBuilder = function () {
			return FEBuilder.apply(this, arguments);
		};

		MacroFieldBuilder.create = function (oOpaInstance) {
			return new MacroFieldBuilder(oOpaInstance);
		};

		MacroFieldBuilder.prototype = Object.create(FEBuilder.prototype);
		MacroFieldBuilder.prototype.constructor = MacroFieldBuilder;

		/**
		 * Returns the state matcher for the MdcField control.
		 *
		 * @param {any} mState
		 * @returns {*} The state matcher.
		 * @protected
		 */
		MacroFieldBuilder.prototype.getStatesMatcher = function (mState) {
			return MacroFieldBuilder.Matchers.states(mState);
		};

		MacroFieldBuilder.prototype.hasValue = function (vValue) {
			// silently ignore undefined argument for convenience
			if (vValue === undefined) {
				return this;
			}
			return this.has(MacroFieldBuilder.Matchers.value(vValue));
		};

		MacroFieldBuilder.prototype.do = function (vAction) {
			// whenever an action is performed on a MacroField we want it to be perform on its main control
			this.has(function (vControls) {
				if (!vControls) {
					return null;
				}
				if (!Array.isArray(vControls)) {
					vControls = [vControls];
				}
				return vControls.reduce(function (aMainControls, vControl) {
					return aMainControls.concat(_getMainControls(vControl));
				}, []);
			});
			return FEBuilder.prototype.do.call(this, OpaBuilder.Actions.executor(vAction));
		};

		MacroFieldBuilder.prototype.doOpenValueHelp = function () {
			return this.do(function (oControl) {
				if (oControl.isA("sap.ui.mdc.Field")) {
					FEBuilder.Actions.keyboardShortcut("F4", "input")(oControl);
				}
			});
		};

		MacroFieldBuilder.Matchers = {
			value: function (vExpectedValue) {
				return function (oControl) {
					var aMainControls = _getMainControls(oControl);
					return aMainControls.some(function (oMainControl) {
						return OpaBuilder.Matchers.match(_getValueMatcher(oMainControl, vExpectedValue))(oMainControl);
					});
				};
			},
			empty: function (oControl) {
				return oControl.getVisible() === false;
			},
			state: function (sName, vValue) {
				return function (oControl) {
					var aMainControls = [oControl].concat(_getMainControls(oControl));
					return aMainControls.some(function (oMainControl) {
						return OpaBuilder.Matchers.match(_getStateMatcher(oMainControl, sName, vValue))(oMainControl);
					});
				};
			},
			states: function (mStateMap) {
				return FEBuilder.Matchers.states(mStateMap, MacroFieldBuilder.Matchers.state);
			}
		};

		return MacroFieldBuilder;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/builder/MdcFieldBuilder", ["./FEBuilder", "sap/ui/test/OpaBuilder", "sap/ui/mdc/enum/FieldDisplay", "sap/fe/test/Utils", "sap/ui/mdc/enum/ConditionValidated"],
	function (FEBuilder, OpaBuilder, FieldDisplay, Utils, ConditionValidated) {
		"use strict";

		var VALUE_DESCRIPTION_PATTERN = /(.+?) \((.+?)\)/;

		/**
		 * This function checks whether the expected value is fulfilled by the checked value.
		 * Both values can be either an array or a single element.
		 * In case of arrays, the it checks the second parameter to start with the same vales as the expected value array.
		 *
		 * @param {any} vExpectedValue
		 * @param {any} vValueToCheck
		 * @returns {boolean} `true` if expected values are met, `false` else
		 * @private
		 */
		function _equalish(vExpectedValue, vValueToCheck) {
			vExpectedValue = (vExpectedValue && [].concat(vExpectedValue)) || [];
			vValueToCheck = (vValueToCheck && [].concat(vValueToCheck)) || [];

			return vExpectedValue.every(function (vValue, iIndex) {
				return iIndex < vValueToCheck.length && (vValue || "") == (vValueToCheck[iIndex] || "");
			});
		}

		/**
		 * This function checks the current value against expected values with respect to the display type.
		 *
		 * @param {sap.ui.mdc.enum.FieldDisplay} sDisplay The type of display
		 * @param {any} oExpectedValue
		 * @param {any} oExpectedDescription
		 * @param {any} vActualValue
		 * @param {any} vActualDescription
		 * @returns {boolean|boolean} The result of the check
		 * @private
		 */
		function _fieldDisplayEquals(sDisplay, oExpectedValue, oExpectedDescription, vActualValue, vActualDescription) {
			switch (sDisplay) {
				case FieldDisplay.Value:
					return _equalish(oExpectedValue, vActualValue);
				case FieldDisplay.Description:
					return oExpectedDescription === undefined
						? _equalish(oExpectedValue, vActualDescription)
						: _equalish(oExpectedDescription, vActualDescription);
				case FieldDisplay.ValueDescription:
				case FieldDisplay.DescriptionValue:
					return (
						_equalish(oExpectedValue, vActualValue) &&
						(oExpectedDescription === undefined || _equalish(oExpectedDescription, vActualDescription))
					);
				default:
					throw new Error(Utils.formatMessage("unsupported field display '{0}'", sDisplay));
			}
		}

		function _parseValue(vValue, sDisplay) {
			var mResult = {};
			if (Utils.isOfType(vValue, Array)) {
				mResult.value = vValue.length > 0 ? vValue[0] : null;
				mResult.description = vValue.length > 1 ? vValue[1] : undefined;
			} else if (Utils.isOfType(vValue, Object)) {
				mResult.value = vValue.value;
				mResult.description = vValue.description;
			} else {
				switch (sDisplay) {
					case FieldDisplay.Description:
						mResult.value = undefined;
						mResult.description = vValue;
						break;
					case FieldDisplay.ValueDescription:
					case FieldDisplay.DescriptionValue:
						var aMatches = VALUE_DESCRIPTION_PATTERN.exec(vValue);
						if (aMatches) {
							mResult.value = sDisplay === FieldDisplay.ValueDescription ? aMatches[1] : aMatches[2];
							mResult.description = sDisplay === FieldDisplay.ValueDescription ? aMatches[2] : aMatches[1];
							break;
						}
					// of no match, fall through to default
					case FieldDisplay.Value:
					default:
						mResult.value = vValue;
						mResult.description = undefined;
				}
			}
			return mResult;
		}

		var FieldBuilder = function () {
			return FEBuilder.apply(this, arguments);
		};

		FieldBuilder.create = function (oOpaInstance) {
			return new FieldBuilder(oOpaInstance);
		};

		FieldBuilder.prototype = Object.create(FEBuilder.prototype);
		FieldBuilder.prototype.constructor = FieldBuilder;

		FieldBuilder.prototype.hasValue = function (vValue) {
			// silently ignore undefined argument for convenience
			if (vValue === undefined) {
				return this;
			}
			return this.has(FieldBuilder.Matchers.value(vValue));
		};

		/**
		 * Checks for certain condition value(s).
		 *
		 * @param {string|object|Array} [vValue] The expected value(s)
		 * @param {string} [sOperator] The expected operator
		 * @returns {sap.fe.test.builder.FieldBuilder} `this`
		 * @public
		 * @ui5-restricted
		 */
		FieldBuilder.prototype.hasConditionValues = function (vValue, sOperator) {
			// silently ignore undefined argument for convenience
			if (vValue === undefined) {
				return this;
			}
			return this.has(FieldBuilder.Matchers.conditionsValue(vValue, sOperator));
		};

		/**
		 * Changes the value of the field.
		 *
		 * @param {string} vValue The new value
		 * @returns {sap.fe.test.builder.FieldBuilder} `this`
		 * @public
		 * @ui5-restricted
		 */
		FieldBuilder.prototype.doChangeValue = function (vValue) {
			// silently ignore undefined argument for convenience
			if (vValue === undefined) {
				return this;
			}
			return this.doEnterText(vValue);
		};

		/**
		 * Returns the state matcher for the MdcField control.
		 *
		 * @param {any} mState
		 * @returns {*} The state matcher.
		 * @protected
		 */
		FieldBuilder.prototype.getStatesMatcher = function (mState) {
			return FieldBuilder.Matchers.states(mState);
		};

		FieldBuilder.prototype.doPressKeyboardShortcut = function (sShortcut) {
			return this.do(FEBuilder.Actions.keyboardShortcut(sShortcut, "input"));
		};

		FieldBuilder.prototype.doOpenValueHelp = function () {
			return this.doPressKeyboardShortcut("F4");
		};

		FieldBuilder.Matchers = {
			value: function (vExpectedValue) {
				return function (oField) {
					if (!oField.isA("sap.ui.mdc.Field")) {
						throw new Error("Expected sap.ui.mdc.Field but got " + oField.getMetadata().getName());
					}

					var mExpectedValue = _parseValue(vExpectedValue, oField.getDisplay()),
						vValue = oField.getValue(),
						vDescription = oField.getAdditionalValue();

					return _fieldDisplayEquals(oField.getDisplay(), mExpectedValue.value, mExpectedValue.description, vValue, vDescription);
				};
			},
			/**
			 * Returns a matcher function that checks a field for given condition value(s) and operator (optional).
			 *
			 * @param {string|object|Array} vExpectedValue The expected value
			 * @param {string} [sOperator] The operator of the condition
			 * @returns {function(*=): *|boolean} The matcher function.
			 * @static
			 * @ui5-restricted
			 */
			conditionsValue: function (vExpectedValue, sOperator) {
				if (!Utils.isOfType(vExpectedValue, Array)) {
					vExpectedValue = [vExpectedValue];
				}
				return function (oField) {
					var aExpectedValues = vExpectedValue.map(function (vElement) {
							return _parseValue(vElement, oField.getDisplay());
						}),
						aConditions = oField.getConditions().map(function (oCondition) {
							return {
								conditionOperator: oCondition.operator,
								conditionValue: _parseValue(oCondition.values),
								conditionValidated: oCondition.validated === ConditionValidated.Validated
							};
						}),
						fnConditionsCheck = function (vExpected) {
							return function (oCondition) {
								if (sOperator && oCondition.conditionOperator !== sOperator) {
									return false;
								}
								return _fieldDisplayEquals(
									oField.getDisplay(),
									vExpected.value,
									vExpected.description,
									oCondition.conditionValue.value,
									oCondition.conditionValidated ? vExpected.description : oCondition.conditionValue.description
								);
							};
						};
					return (
						aConditions &&
						aExpectedValues.every(function (vExpected) {
							return aConditions.some(fnConditionsCheck(vExpected));
						})
					);
				};
			},
			state: function (sName, vValue) {
				switch (sName) {
					case "content":
						return function (oField) {
							var oContentDisplay = oField.getContentDisplay(),
								oContentEdit = oField.getContentEdit(),
								oContent = oField.getContent(),
								aContents = (oField.getAggregation("_content") || []).concat(
									oContent || [],
									oContentDisplay || [],
									oContentEdit || []
								),
								fnMatcher = FEBuilder.Matchers.states(vValue);
							return aContents.some(fnMatcher);
						};
					case "contentEdit":
					case "contentDisplay":
						return function (oField) {
							return FEBuilder.Matchers.states(vValue)(oField.getAggregation(sName));
						};
					default:
						return FEBuilder.Matchers.state(sName, vValue);
				}
			},
			states: function (mStateMap) {
				return FEBuilder.Matchers.states(mStateMap, FieldBuilder.Matchers.state);
			}
		};

		FieldBuilder.Actions = {};

		return FieldBuilder;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/builder/MdcFilterBarBuilder", ["./FEBuilder", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/DialogBuilder", "sap/ui/test/Opa5"],
	function (FEBuilder, Utils, OpaBuilder, DialogBuilder, Opa5) {
		"use strict";

		var FilterBarBuilder = function () {
			return FEBuilder.apply(this, arguments);
		};

		FilterBarBuilder.create = function (oOpaInstance) {
			return new FilterBarBuilder(oOpaInstance);
		};

		FilterBarBuilder.prototype = Object.create(FEBuilder.prototype);
		FilterBarBuilder.prototype.constructor = FilterBarBuilder;

		FilterBarBuilder.createAdaptationDialogBuilder = function (oOpaInstance) {
			return DialogBuilder.create(oOpaInstance).hasAggregation("customHeader");
		};

		FilterBarBuilder.prototype.hasField = function (vFieldMatcher, mState, bReturnField) {
			var aArguments = Utils.parseArguments([[Array, Object, Function], Object, Boolean], arguments);
			vFieldMatcher = aArguments[0];
			mState = aArguments[1];
			bReturnField = aArguments[2];

			if (mState) {
				var vStatesMatcher = this.getStatesMatcher(mState);
				if (mState.visible === false) {
					// when checking for not visible, the either no field exists or existing field is not visible (like the provided state)
					return this.hasSome(
						OpaBuilder.Matchers.not(OpaBuilder.Matchers.aggregationMatcher("filterItems", vFieldMatcher)),
						OpaBuilder.Matchers.aggregationMatcher("filterItems", [vStatesMatcher].concat(vFieldMatcher || []))
					);
				}
				vFieldMatcher = [vStatesMatcher].concat(vFieldMatcher || []);
			}

			return bReturnField
				? this.has(OpaBuilder.Matchers.aggregation("filterItems", vFieldMatcher)).has(FEBuilder.Matchers.atIndex(0))
				: this.has(OpaBuilder.Matchers.aggregationMatcher("filterItems", vFieldMatcher));
		};

		FilterBarBuilder.prototype.hasFocusOnFilterField = function (sFieldLabel) {
			return this.has(function (oFilterBar) {
				var oTestCore = Opa5.getWindow().sap.ui.getCore(),
					sFocusedEltId = oTestCore.getCurrentFocusedControlId();
				var oFilterItem = oFilterBar.getFilterItems().find(function (elt) {
					return elt.getLabel() === sFieldLabel;
				});
				return sFocusedEltId.includes(oFilterItem.getId());
			});
		};

		FilterBarBuilder.prototype.hasFocusOnGoButton = function () {
			return this.has(function (oFilterBar) {
				var oTestCore = Opa5.getWindow().sap.ui.getCore(),
					sFocusedEltId = oTestCore.getCurrentFocusedControlId(),
					sSearchButtonId = oFilterBar.getId() + "-btnSearch";
				return sFocusedEltId === sSearchButtonId;
			});
		};

		FilterBarBuilder.prototype.hasEditingStatus = function (oEditState, mState) {
			var fnEditStateMatcher = OpaBuilder.Matchers.resourceBundle("label", "sap.fe.macros", "FILTERBAR_EDITING_STATUS");
			if (mState && "visible" in mState && mState.visible === false) {
				return this.has(function (oFilterBar) {
					return !oFilterBar.getFilterItems().some(FEBuilder.Matchers.match(fnEditStateMatcher));
				});
			}

			var aFilterItemsMatchers = [fnEditStateMatcher];
			if (oEditState) {
				aFilterItemsMatchers.push(
					OpaBuilder.Matchers.hasAggregation("contentEdit", OpaBuilder.Matchers.properties("selectedKey", oEditState.id))
				);
			}
			if (mState && Object.keys(mState).length) {
				aFilterItemsMatchers.push(FEBuilder.Matchers.states(mState));
			}

			return this.hasAggregation("filterItems", aFilterItemsMatchers);
		};

		FilterBarBuilder.prototype.hasSearchField = function (sSearchText, mState) {
			var aMatchers = [];
			if (mState) {
				if (mState.visible === false) {
					return this.has(function (oFilterBar) {
						return !oFilterBar.getBasicSearchField();
					});
				}
				aMatchers.push(FEBuilder.Matchers.states(mState));
			}
			if (sSearchText) {
				aMatchers.push(OpaBuilder.Matchers.properties({ value: sSearchText }));
			}

			return this.hasAggregation("basicSearchField", aMatchers);
		};

		FilterBarBuilder.prototype.doChangeEditingStatus = function (vEditState) {
			var fnEditStateMatcher = OpaBuilder.Matchers.resourceBundle("label", "sap.fe.macros", "FILTERBAR_EDITING_STATUS");
			return this.doOnAggregation("filterItems", fnEditStateMatcher, OpaBuilder.Actions.enterText(vEditState.display));
		};

		FilterBarBuilder.prototype.doChangeSearch = function (sSearchText) {
			return this.doOnAggregation("basicSearchField", OpaBuilder.Actions.enterText(sSearchText || ""));
		};

		FilterBarBuilder.prototype.doResetSearch = function () {
			return this.doOnAggregation("basicSearchField", OpaBuilder.Actions.press("inner-reset"));
		};

		FilterBarBuilder.prototype.doSearch = function () {
			return this.doPress("btnSearch");
		};

		FilterBarBuilder.prototype.doOpenSettings = function () {
			return this.doPress("btnAdapt");
		};

		return FilterBarBuilder;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/builder/MdcFilterFieldBuilder", ["./MdcFieldBuilder", "sap/fe/test/Utils"], function (FieldBuilder, Utils) {
	"use strict";

	var FilterFieldBuilder = function () {
		return FieldBuilder.apply(this, arguments);
	};

	FilterFieldBuilder.create = function (oOpaInstance) {
		return new FilterFieldBuilder(oOpaInstance);
	};

	FilterFieldBuilder.prototype = Object.create(FieldBuilder.prototype);
	FilterFieldBuilder.prototype.constructor = FilterFieldBuilder;

	/**
	 * Checks for certain condition value(s).
	 *
	 * @param {string|Array} [vValue] The expected value(s)
	 * @param {string} [sOperator] The expected operator
	 * @returns {sap.fe.test.builder.FilterFieldBuilder} `this`
	 * @public
	 * @ui5-restricted
	 */
	FilterFieldBuilder.prototype.hasValue = function (vValue, sOperator) {
		return FieldBuilder.prototype.hasConditionValues.apply(this, arguments);
	};

	/**
	 * Changes the value of the filter field.
	 *
	 * @param {string} vValue The new value
	 * @param {boolean} bClearFirst
	 * @returns {sap.fe.test.builder.FilterFieldBuilder} `this`
	 * @public
	 * @ui5-restricted
	 */
	FilterFieldBuilder.prototype.doChangeValue = function (vValue, bClearFirst) {
		if (bClearFirst) {
			this.do(function (oFilterField) {
				oFilterField.setConditions([]);
			});
		}
		return FieldBuilder.prototype.doChangeValue.call(this, vValue);
	};

	FilterFieldBuilder.Matchers = {};

	FilterFieldBuilder.Actions = {};

	return FilterFieldBuilder;
});
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/builder/MdcTableBuilder", [
		"sap/ui/test/Opa5",
		"sap/ui/test/OpaBuilder",
		"./FEBuilder",
		"./MacroFieldBuilder",
		"./OverflowToolbarBuilder",
		"./DialogBuilder",
		"sap/fe/test/Utils",
		"sap/fe/test/api/APIHelper",
		"sap/ui/test/matchers/Interactable",
		"sap/ui/core/SortOrder",
		"sap/ui/test/actions/EnterText",
		"sap/ui/core/Core"
	],
	function (
		Opa5,
		OpaBuilder,
		FEBuilder,
		MacroFieldBuilder,
		OverflowToolbarBuilder,
		DialogBuilder,
		Utils,
		APIHelper,
		Interactable,
		SortOrder,
		EnterText,
		Core
	) {
		"use strict";

		var oSAPMResourceBundle = Core.getLibraryResourceBundle("sap.m");

		// depending on the sap.ui.table creates now extra request which are not optimal for test execution
		var RowActionType = {
			/**
			 * Custom defined Row Action.
			 *
			 * @public
			 */
			Custom: "Custom",

			/**
			 * Navigation Row Action.
			 *
			 * @public
			 */
			Navigation: "Navigation",

			/**
			 * Delete Row Action.
			 *
			 * @public
			 */
			Delete: "Delete"
		};

		var TableBuilder = function () {
			return FEBuilder.apply(this, arguments).hasType("sap.ui.mdc.Table").hasProperties({ busy: false });
		};

		function _isGridTable(oMdcTable) {
			return oMdcTable.getType().isA("sap.ui.mdc.table.GridTableType");
		}

		function _getRowAggregationName(oMdcTable) {
			return _isGridTable(oMdcTable) ? "rows" : "items";
		}

		function _getColumnIndex(vColumn, oMdcTable) {
			var iIndex = Number(vColumn);
			return Number.isNaN(iIndex)
				? oMdcTable.getColumns().findIndex(function (oColumn) {
						return oColumn.getHeader() === vColumn || oColumn.getDataProperty() === vColumn;
				  })
				: iIndex;
		}

		function _getMdcTable(vTableElement) {
			var oMdcTable = vTableElement;
			while (oMdcTable && !oMdcTable.isA("sap.ui.mdc.Table")) {
				oMdcTable = oMdcTable._feMdcTableWrapper || oMdcTable.getParent();
			}
			return oMdcTable;
		}

		function _getCellIndex(vColumn, oRow) {
			var oMdcTable = _getMdcTable(oRow);
			return oMdcTable ? _getColumnIndex(vColumn, oMdcTable) : -1;
		}

		function _getCell(oRow, iColumn) {
			var oCell;
			if (!oRow) {
				return null;
			}
			if (oRow.isA("sap.ui.mdc.table.CreationRow")) {
				oCell = oRow._oInnerCreationRow._getCell(iColumn);
			} else if (oRow.isA("sap.ui.table.CreationRow")) {
				oCell = oRow._getCell(iColumn);
			} else {
				oCell = oRow.getCells()[iColumn];
			}

			if (oCell.isA("sap.fe.macros.MacroAPI")) {
				oCell = oCell.getContent();
			}
			return oCell;
		}

		function _getCellButtonsForInlineAction(oCell, sButtonText) {
			if (oCell.isA("sap.fe.macros.MacroAPI")) {
				oCell = oCell.getContent();
			}

			var mState = {
					controlType: "sap.m.Button"
				},
				oStateMatcher;
			if (sButtonText) {
				mState.text = sButtonText;
			}
			oStateMatcher = FEBuilder.Matchers.states(mState);
			return oStateMatcher(oCell) ? [oCell] : OpaBuilder.Matchers.children(oStateMatcher)(oCell);
		}

		function _getButtonsForInlineActions(vColumn, oRow) {
			var iIndex = Number(vColumn);
			if (Number.isNaN(iIndex)) {
				return oRow.getCells().reduce(function (aPrev, oCell) {
					return aPrev.concat(_getCellButtonsForInlineAction(oCell, vColumn));
				}, []);
			}
			return _getCellButtonsForInlineAction(_getCell(oRow, iIndex));
		}

		function _getRowNavigationIconOnGridTable(oRow) {
			var oRowAction = oRow.getRowAction();
			return oRowAction.getItems().reduce(function (oIcon, oActionItem, iIndex) {
				if (!oIcon && oActionItem.getType() === RowActionType.Navigation) {
					oIcon = oRowAction.getAggregation("_icons")[iIndex];
				}
				return oIcon;
			}, null);
		}

		function _getRowMatcher(vRowMatcher) {
			var aRowMatcher = [new Interactable(), FEBuilder.Matchers.bound()];
			if (Utils.isOfType(vRowMatcher, Object)) {
				vRowMatcher = TableBuilder.Row.Matchers.cellValues(vRowMatcher);
			}
			if (vRowMatcher) {
				aRowMatcher = aRowMatcher.concat(vRowMatcher);
			}
			return aRowMatcher;
		}

		function _getInnerTable(oMdcTable) {
			return oMdcTable && oMdcTable._oTable;
		}

		function _createTableInternalButtonBuilder(oTableBuilder, sButtonSuffix, vAction, sButtonType) {
			sButtonType = sButtonType || "sap.m.Button";
			return oTableBuilder.doOpenOverflow().success(function (oTable) {
				return OpaBuilder.create()
					.hasType(sButtonType)
					.hasId(RegExp(Utils.formatMessage("-{0}$", sButtonSuffix)))
					.has(OpaBuilder.Matchers.ancestor(oTable))
					.doConditional(!!vAction, vAction)
					.execute();
			});
		}

		function _createColumnWrapper(oColumn, bGridTable) {
			return {
				getHeader: function () {
					return bGridTable
						? (oColumn.getLabel() && oColumn.getLabel().getText()) || oColumn.getName()
						: oColumn.getHeader() && oColumn.getHeader().getText();
				},
				getDataProperty: function () {
					return "$data property not available$";
				}
			};
		}

		function _createTableWrapper(oInnerTable) {
			var bGridTable = oInnerTable.isA("sap.ui.table.Table"),
				oWrapper = {
					_oTable: oInnerTable,
					isA: function (sName) {
						return sName === "sap.ui.mdc.Table";
					},
					getType: function () {
						return {
							isA: function (sName) {
								return sName === (bGridTable ? "sap.ui.mdc.table.GridTableType" : "sap.ui.mdc.table.ResponsiveTableType");
							}
						};
					},
					getColumns: function () {
						return oInnerTable.getColumns().map(function (oColumn) {
							return _createColumnWrapper(oColumn, bGridTable);
						});
					},
					getRowBinding: function () {
						return oInnerTable.getBinding(_getRowAggregationName(oWrapper));
					}
				};
			oInnerTable._feMdcTableWrapper = oWrapper;
			return oWrapper;
		}

		function _showHideDetailsOnTableToolbar(bShowDetails) {
			var sStateToPress;
			if (bShowDetails !== undefined) {
				sStateToPress = bShowDetails ? "showDetails" : "hideDetails";
			}
			OpaBuilder.create()
				.hasType("sap.m.SegmentedButton")
				.hasId(/-showHideDetails$/)
				.check(function (oSegmentedButton) {
					if (bShowDetails === undefined) {
						sStateToPress = oSegmentedButton[0].getSelectedKey() === "showDetails" ? "hideDetails" : "showDetails";
					}
					return true;
				})
				.success(function (oSegmButtonControl) {
					return FEBuilder.create()
						.hasType("sap.m.SegmentedButton")
						.hasId(/-showHideDetails$/)
						.doOnAggregation("items", OpaBuilder.Matchers.properties({ key: sStateToPress }), OpaBuilder.Actions.press())
						.execute();
				})
				.execute();
		}
		function _showHideDetailsOnOverflow(bShowDetails) {
			var oRb = Opa5.getWindow().sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc"),
				sExpectedText;
			if (bShowDetails !== undefined) {
				sExpectedText = bShowDetails ? oRb.getText("table.SHOWDETAILS_TEXT") : oRb.getText("table.HIDEDETAILS_TEXT");
			}
			return (
				OpaBuilder.create()
					.hasType("sap.m.Select")
					.hasId(/-showHideDetails-select$/)
					// .has(OpaBuilder.Matchers.ancestor(oMdcTable))
					.check(function (oSelectItem) {
						if (bShowDetails === undefined) {
							sExpectedText =
								oSelectItem[0].getSelectedItem().getText() === oRb.getText("table.SHOWDETAILS_TEXT")
									? oRb.getText("table.HIDEDETAILS_TEXT")
									: oRb.getText("table.SHOWDETAILS_TEXT");
						}
						return true;
					})
					.doPress()
					.success(function (oSegmButtonControl) {
						return FEBuilder.create()
							.hasType("sap.m.SelectList")
							.isDialogElement(true)
							.has(function (oSelectListItem) {
								return true;
							})
							.has(APIHelper.createMenuAndListActionMatcher(sExpectedText, true))
							.doPress()
							.description(Utils.formatMessage("Executing action '{0}' from currently open selection list", sExpectedText))
							.execute();
					})
					.execute()
			);
		}

		function _getColumnContextToggleBuilder(ToggleButtonLabel, ToggleType) {
			return OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.ToggleButton")
				.hasProperties({ text: ToggleButtonLabel })
				.doPress()
				.description(Utils.formatMessage(ToggleType + " column '{0}'", ToggleButtonLabel));
		}

		TableBuilder.create = function (oOpaInstance) {
			return new TableBuilder(oOpaInstance);
		};

		TableBuilder.createWrapper = function (oOpaInstance, sTableType, vTableMatcher) {
			var oBuilder = new TableBuilder(oOpaInstance).hasType(sTableType);

			if (vTableMatcher) {
				oBuilder.has(vTableMatcher);
			}

			return oBuilder.has(function (oTable) {
				return _createTableWrapper(oTable);
			});
		};

		TableBuilder.prototype = Object.create(FEBuilder.prototype);
		TableBuilder.prototype.constructor = TableBuilder;

		TableBuilder.prototype.getStatesMatcher = function (mState) {
			return TableBuilder.Matchers.states(mState);
		};

		TableBuilder.prototype.hasColumns = function (mColumnMap, bIgnoreColumnState) {
			if (!mColumnMap || Object.keys(mColumnMap).length === 0) {
				return this;
			}
			return this.has(TableBuilder.Matchers.columnsMatcher(mColumnMap, bIgnoreColumnState));
		};

		TableBuilder.prototype.hasTitle = function (sTitle) {
			return this.hasChildren(FEBuilder.create(this).hasType("sap.m.Title").hasProperties({ text: sTitle }));
		};

		TableBuilder.prototype.hasSearchField = function (sSearchText, mState) {
			var aArguments = Utils.parseArguments([String, Object], arguments);
			mState = aArguments[1];
			var oSuccessBuilder = new TableBuilder(this.getOpaInstance(), this.build()).hasConditional(
				mState && mState.visible === false,
				OpaBuilder.Matchers.not(FEBuilder.Matchers.deepAggregationMatcher("actions/action", FEBuilder.Matchers.id(/BasicSearch$/))),
				OpaBuilder.Matchers.childrenMatcher(
					FEBuilder.create(this)
						.hasType("sap.fe.macros.table.BasicSearch")
						.checkNumberOfMatches(1)
						.hasProperties(mState)
						.hasAggregation("filter", OpaBuilder.Matchers.properties(aArguments[0] ? { value: sSearchText } : {}))
				)
			);
			return this.doOpenOverflow().success(oSuccessBuilder);
		};

		TableBuilder.prototype.hasRows = function (vRowMatcher, bReturnAggregationItems) {
			vRowMatcher = _getRowMatcher(vRowMatcher);

			return bReturnAggregationItems
				? this.has(TableBuilder.Matchers.rows(vRowMatcher))
				: this.has(TableBuilder.Matchers.rowsMatcher(vRowMatcher));
		};

		TableBuilder.prototype.doOnRows = function (vRowMatcher, vRowAction) {
			if (arguments.length === 1) {
				vRowAction = vRowMatcher;
				vRowMatcher = undefined;
			}
			if (!vRowAction) {
				return this;
			}
			return this.hasRows(vRowMatcher, true).do(OpaBuilder.Actions.executor(vRowAction));
		};

		TableBuilder.prototype.doClickOnCell = function (vRowMatcher, vColumn) {
			return this.doOnRows(vRowMatcher, TableBuilder.Row.Actions.onCell(vColumn, OpaBuilder.Actions.press()));
		};
		TableBuilder.prototype.doClickOnRow = function (vRowMatcher) {
			return this.doOnRows(vRowMatcher, function (oRow) {
				if (oRow.getMetadata().getName() === "sap.ui.table.Row") {
					var oTable = oRow.getParent(),
						oRowIndex = oTable.indexOfRow(oRow);
					return OpaBuilder.Actions.press("rows-row" + oRowIndex + "-col0").executeOn(oTable);
				}
				return OpaBuilder.Actions.press().executeOn(oRow.getMultiSelectControl() || oRow.getSingleSelectControl());
			});
		};

		TableBuilder.prototype.doScroll = function (sDirection) {
			return this.do(function (oTable) {
				switch (sDirection) {
					case "up":
						oTable.scrollToIndex(0);
						break;
					case "down":
					default:
						oTable.scrollToIndex(-1);
						break;
				}
			});
		};

		TableBuilder.prototype.doPressKeyboardShortcut = function (sShortcut, vRowMatcher, vColumn) {
			// All arguments are passed -> shortcut will be executed on cell level
			if (vRowMatcher && vColumn) {
				return this.doOnRows(
					vRowMatcher,
					TableBuilder.Row.Actions.onCell(vColumn, FEBuilder.Actions.keyboardShortcut(sShortcut, "input"))
				);
			}
			// else shortcut will be executed on table level
			return this.do(FEBuilder.Actions.keyboardShortcut(sShortcut, true));
		};

		TableBuilder.prototype.doEditValues = function (vRowMatcher, mColumnValueMap, bInputNotFinalized) {
			if (arguments.length === 1) {
				mColumnValueMap = vRowMatcher;
				vRowMatcher = undefined;
			}
			return this.hasColumns(mColumnValueMap, true).doOnRows(
				vRowMatcher,
				TableBuilder.Row.Actions.editCells(mColumnValueMap, bInputNotFinalized)
			);
		};

		TableBuilder.prototype.doEditCreationRowValues = function (mColumnValueMap, bInputNotFinalized) {
			return this.hasColumns(mColumnValueMap, true)
				.has(OpaBuilder.Matchers.aggregation("creationRow"))
				.do(TableBuilder.Row.Actions.editCells(mColumnValueMap, bInputNotFinalized));
		};

		TableBuilder.prototype.doSelect = function (vRowMatcher) {
			return this.doOnRows(vRowMatcher, function (oRow) {
				var oTable = oRow.getParent();
				// if several rows are selected, the table may be blocked by other events, e.g. tableRuntime.js --> setContexts
				if (oTable.getBusy()) {
					oTable.setBusy(false);
				}
				if (oRow.getMetadata().getName() === "sap.ui.table.Row") {
					var oRowIndex = oTable.indexOfRow(oRow);
					return OpaBuilder.Actions.press("rowsel" + oRowIndex).executeOn(oTable);
				}
				return OpaBuilder.Actions.press().executeOn(oRow.getMultiSelectControl() || oRow.getSingleSelectControl());
			});
		};
		TableBuilder.prototype.doSelectAll = function () {
			return this.do(function (oTable) {
				var bIsGridTable = _isGridTable(oTable);
				if (bIsGridTable) {
					return OpaBuilder.Actions.press("selall").executeOn(oTable.getAggregation("_content"));
				}
				return OpaBuilder.Actions.press("sa").executeOn(oTable.getAggregation("_content"));
			});
		};

		TableBuilder.prototype.doNavigate = function (vRowMatcher) {
			return this.doOnRows(vRowMatcher, function (oRow) {
				if (oRow.getMetadata().getName() === "sap.ui.table.Row") {
					return OpaBuilder.Actions.press().executeOn(_getRowNavigationIconOnGridTable(oRow));
				}
				return OpaBuilder.Actions.press("imgNav").executeOn(oRow);
			});
		};

		TableBuilder.prototype.doPressColumnHeader = function (vColumn) {
			return this.has(TableBuilder.Matchers.columnControl(vColumn)).has(FEBuilder.Matchers.singleElement()).doPress();
		};

		TableBuilder.prototype.doColumnHeaderSorting = function (vColumn, sFieldName, sSortOrder, sIcon, bClearFirst) {
			var SortingIcon = sSortOrder === SortOrder.Ascending ? "sap-icon://sort-ascending" : "sap-icon://sort-descending";

			var TriggerSortOK = OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.Button")
				.hasProperties({ text: "OK" })
				.doPress()
				.description("Confirming the Sorting dialog");

			// Builder to clear existing sorting entries
			var DeclineSortingBuilder = OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.Button")
				.hasProperties({ icon: "sap-icon://decline" })
				.doPress()
				.description("Removing all previous sortings");

			// Builder to check for a specific sorting entry
			var CheckSortingFieldBuilder = OpaBuilder.create(this)
				.isDialogElement()
				.hasType("sap.m.ComboBox")
				.hasProperties({ value: sFieldName });

			// Builder for changing existing sorting entries
			var ExistingSortingFieldBuilder = OpaBuilder.create(this)
				.isDialogElement()
				.hasType("sap.m.CustomListItem")
				.hasChildren(OpaBuilder.create(this).hasType("sap.m.ComboBox").hasProperties({ value: sFieldName }))
				.doOnChildren(OpaBuilder.create(this).hasType("sap.m.Button").hasProperties({ icon: SortingIcon }).doPress())
				.description(Utils.formatMessage("Change existing sorting field '{0}': {1}", sFieldName, sSortOrder))
				.success(TriggerSortOK);

			// Builder for new sorting entries
			var NewSortingFieldBuilder = OpaBuilder.create(this)
				.isDialogElement()
				.hasType("sap.m.CustomListItem")
				.hasChildren(
					OpaBuilder.create(this).hasType("sap.m.ComboBox").hasProperties({ placeholder: "Sort by" }).hasProperties({ value: "" })
				)
				.doOnChildren(
					OpaBuilder.create(this)
						.hasType("sap.m.ComboBox")
						.hasProperties({ placeholder: "Sort by" })
						.hasProperties({ value: "" })
						.doEnterText(sFieldName, true, false, true)
				)
				.doOnChildren(OpaBuilder.create(this).hasType("sap.m.Button").hasProperties({ icon: SortingIcon }).doPress())
				.description(Utils.formatMessage("Insert new sorting field '{0}': {1}", sFieldName, sSortOrder))
				.success(TriggerSortOK);

			// Builder to distinguish between inserting a new entry or changing an existing entry
			var CheckSortingPanelBuilder = OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.p13n.SortPanel")
				.do(function () {
					if (bClearFirst) {
						DeclineSortingBuilder.execute();
					}
					if (!FEBuilder.controlsExist(CheckSortingFieldBuilder) || bClearFirst) {
						return NewSortingFieldBuilder.execute();
					} else {
						return ExistingSortingFieldBuilder.execute();
					}
				});

			// Opens the Sorting panel within the table column header context menu
			var TriggerSortingPanelBuilder = OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.StandardListItem")
				.hasProperties({ icon: sIcon })
				.doPress()
				.description("Opening the Sorting dialog")
				.success(CheckSortingPanelBuilder);

			// Triggers the sorting by using the toggle buttons on the context menu
			var TriggerToggleBuilder = OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.ToggleButton")
				.hasProperties({ text: sSortOrder })
				.has(function (oButton) {
					if (typeof oButton.getParent().getLabel === "function") {
						return (
							oButton.getParent().getLabel() ===
							Utils.formatMessage(oSAPMResourceBundle.getText("table.COLUMNMENU_QUICK_SORT"), sFieldName)
						);
					}
					return false;
				})
				.doPress()
				.description(Utils.formatMessage("Sorting column '{0}': {1}", vColumn, sSortOrder));

			// return this.doPressColumnHeader(vColumn).success(!sFieldName ? TriggerToggleBuilder : TriggerSortingPanelBuilder);
			return this.doPressColumnHeader(vColumn).success(bClearFirst ? TriggerToggleBuilder : TriggerSortingPanelBuilder);
		};
		TableBuilder.prototype.doSortByColumn = function (vColumn, sFieldName, sSortOrder, bClearFirst) {
			var sIcon = "sap-icon://sort";
			return this.doColumnHeaderSorting(vColumn, sFieldName, sSortOrder, sIcon, bClearFirst);
		};

		TableBuilder.prototype.doColumnHeaderGrouping = function (vColumn, sFieldName) {
			var sGroupingField = !sFieldName ? vColumn : sFieldName,
				// Triggers the grouping by using the toggle buttons on the context menu
				TriggerToggleBuilder = _getColumnContextToggleBuilder(sGroupingField, "Grouping");

			return this.doPressColumnHeader(vColumn).success(TriggerToggleBuilder);
		};
		TableBuilder.prototype.doGroupByColumn = function (vColumn, sFieldName) {
			return this.doColumnHeaderGrouping(vColumn, sFieldName);
		};

		TableBuilder.prototype.doColumnHeaderAggregating = function (vColumn, sFieldName) {
			var sAggregationField = !sFieldName ? vColumn : sFieldName,
				// Triggers the grouping by using the toggle buttons on the context menu
				TriggerToggleBuilder = _getColumnContextToggleBuilder(sAggregationField, "Aggregating");

			return this.doPressColumnHeader(vColumn).success(TriggerToggleBuilder);
		};
		TableBuilder.prototype.doAggregateByColumn = function (vColumn, sFieldName) {
			return this.doColumnHeaderAggregating(vColumn, sFieldName);
		};

		TableBuilder.prototype.doChangeSearch = function (sSearchText) {
			var oSuccessBuilder = new TableBuilder(this.getOpaInstance(), this.build()).doOnChildren(
				OpaBuilder.create(this)
					.hasType("sap.fe.macros.table.BasicSearch")
					.checkNumberOfMatches(1)
					.doOnAggregation("filter", OpaBuilder.Actions.press(), OpaBuilder.Actions.enterText(sSearchText || ""))
			);
			return this.doOpenOverflow().success(oSuccessBuilder);
		};

		TableBuilder.prototype.doResetSearch = function () {
			var oSuccessBuilder = new TableBuilder(this.getOpaInstance(), this.build()).doOnChildren(
				OpaBuilder.create(this)
					.hasType("sap.fe.macros.table.BasicSearch")
					.checkNumberOfMatches(1)
					.doOnAggregation("filter", OpaBuilder.Actions.press(), OpaBuilder.Actions.press("reset"))
			);
			return this.doOpenOverflow().success(oSuccessBuilder);
		};

		TableBuilder.prototype.checkColumnHeaderAction = function (vColumn, sActionIconName, sFieldName, iExpectedNumber, sGroupTotals) {
			var TriggerGroupingCancel = OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.Button")
				.hasProperties({ text: "Cancel" })
				.doPress()
				.description("Cancelling the dialog");

			// Opens the Grouping panel within the table column header context menu to successfully leave the context dialog with cancel button
			var TriggerGroupingPanelBuilder = OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.StandardListItem")
				.hasProperties({ icon: sActionIconName })
				.doPress()
				.success(TriggerGroupingCancel);

			var CheckMultipleGroupingBuilder = OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.ToggleButton")
				.has(function (oButton) {
					if (typeof oButton.getParent().getLabel === "function") {
						return oButton.getParent().getLabel() === sGroupTotals;
					}
					return false;
				})
				.checkNumberOfMatches(iExpectedNumber)
				.success(TriggerGroupingPanelBuilder);

			var CheckSingleGroupingBuilder = OpaBuilder.create()
				.isDialogElement()
				.hasType("sap.m.ToggleButton")
				.hasProperties({ text: sFieldName })
				.has(function (oButton) {
					if (typeof oButton.getParent().getLabel === "function") {
						return oButton.getParent().getLabel() === sGroupTotals;
					}
					return false;
				})
				.checkNumberOfMatches(iExpectedNumber)
				.success(TriggerGroupingPanelBuilder);

			return this.doPressColumnHeader(vColumn).success(sFieldName ? CheckSingleGroupingBuilder : CheckMultipleGroupingBuilder);
		};
		TableBuilder.prototype.hasGroupByColumn = function (vColumn, sFieldName, iExpectedNumber) {
			return this.checkColumnHeaderAction(
				vColumn,
				"sap-icon://group-2",
				sFieldName,
				iExpectedNumber,
				oSAPMResourceBundle.getText("table.COLUMNMENU_QUICK_GROUP")
			);
		};

		TableBuilder.prototype.hasAggregationColumn = function (vColumn, sFieldName, iExpectedNumber) {
			return this.checkColumnHeaderAction(
				vColumn,
				"sap-icon://table-column",
				sFieldName,
				iExpectedNumber,
				oSAPMResourceBundle.getText("table.COLUMNMENU_QUICK_TOTAL")
			);
		};

		TableBuilder.prototype.doExpand = function (vRowMatcher) {
			return this.doOnRows(vRowMatcher, function (oRow) {
				if (oRow.getMetadata().getName() === "sap.ui.table.Row") {
					oRow.expand();
				}
			});
		};

		TableBuilder.prototype.doCollapse = function (vRowMatcher) {
			return this.doOnRows(vRowMatcher, function (oRow) {
				if (oRow.getMetadata().getName() === "sap.ui.table.Row") {
					oRow.collapse();
				}
			});
		};

		TableBuilder.prototype.hasOverlay = function (bHasOverlay) {
			return this.has(TableBuilder.Matchers.overlay(bHasOverlay));
		};

		TableBuilder.prototype.hasNumberOfRows = function (iNumberOfRows) {
			return this.has(function (oTable) {
				var oRowBinding = oTable.getRowBinding(),
					// when having an overlay, the table is dirty and the rows do not reflect the actual table state
					bHasOverlay = TableBuilder.Matchers.overlay(true)(oTable);
				return (
					(oRowBinding &&
						!bHasOverlay &&
						(iNumberOfRows === undefined ? oRowBinding.getLength() !== 0 : oRowBinding.getLength() === iNumberOfRows)) ||
					((!oRowBinding || bHasOverlay) && iNumberOfRows === 0)
				);
			});
		};

		TableBuilder.prototype.hasHeaderFocused = function () {
			return this.has(function (oTable) {
				var oTestCore = Opa5.getWindow().sap.ui.getCore(),
					sFocusedEltId = oTestCore.getCurrentFocusedControlId(),
					oInnerTable = _getInnerTable(oTable);
				if (_isGridTable(oTable)) {
					return oInnerTable.getColumns()[0].getId() === sFocusedEltId;
				} else {
					return oInnerTable.getId() === sFocusedEltId;
				}
			});
		};

		TableBuilder.prototype.hasFocusOnRow = function (iRowIndex) {
			return this.has(function (oTable) {
				var oTestCore = Opa5.getWindow().sap.ui.getCore(),
					sFocusedEltId = oTestCore.getCurrentFocusedControlId(),
					oInnerTable = _getInnerTable(oTable);
				if (_isGridTable(oTable)) {
					return sFocusedEltId.includes(oInnerTable.getRows()[iRowIndex].getId());
				} else {
					return sFocusedEltId === oInnerTable.getItems()[iRowIndex].getId();
				}
			});
		};

		TableBuilder.prototype.hasQuickFilterItems = function (iNumberOfItems) {
			return this.has(function (oTable) {
				var oQuickFilter = oTable.getQuickFilter();
				if (oQuickFilter) {
					var aItems = oQuickFilter.getSelector().getItems();
					if (Utils.isOfType(aItems, Array)) {
						return aItems.length === iNumberOfItems;
					}
					return false;
				}
				return false;
			});
		};

		TableBuilder.prototype.doSelectQuickFilter = function (oItemMatcher) {
			return this.has(function (oTable) {
				return oTable.getQuickFilter().getSelector();
			})
				.doConditional(FEBuilder.Matchers.state("controlType", "sap.m.Select"), OpaBuilder.Actions.press())
				.success(
					function (oQFControl) {
						return FEBuilder.create(this)

							.hasId([].concat(oQFControl)[0].getId())
							.doOnAggregation("items", oItemMatcher, OpaBuilder.Actions.press())
							.execute();
					}.bind(this)
				);
		};

		TableBuilder.prototype.doPressMore = function () {
			return this.do(
				function (oTable) {
					return FEBuilder.create(this).hasId(oTable._oTable.getId("trigger")).do(OpaBuilder.Actions.press()).execute();
				}.bind(this)
			);
		};

		TableBuilder.prototype.doOpenOverflow = function () {
			return OverflowToolbarBuilder.openOverflow(this, "toolbar");
		};

		TableBuilder.prototype.doCloseOverflow = function () {
			return OverflowToolbarBuilder.closeOverflow(this, "toolbar");
		};

		TableBuilder.prototype.doExecuteAction = function (vActionMatcher, vAction) {
			var oOverflowToolbarBuilder = new TableBuilder(this.getOpaInstance(), this.build()),
				fnMatcherIsTextButton = function (oControl) {
					return !!oControl.getText;
				},
				fnDeepAggregation = FEBuilder.Matchers.deepAggregation("actions/action", [fnMatcherIsTextButton, vActionMatcher]),
				fnGetDefaultActionButton = function (oMenuButton) {
					/* This helper function returns the default action button of a menu button (if it exists, otherwise returns null);
					 * Remark: Currently there is no official API to retrieve this button; an alternative way to achieve the same
					 * result might be to check oMenuButton.getButtonMode() === "Split" && oMenuButton.getUseDefaultActionOnly()
					 * first, and then call oMenuButton.fireDefaultAction(), but the interface parameter vAction expects
					 * a sap.m.button nonetheless. Hence, we currently use the internal aggregation names as a workaround.
					 */
					return oMenuButton.getAggregation("_button")
						? oMenuButton.getAggregation("_button").getAggregation("_textButton")
						: null;
				},
				oSuccessHandler = function () {
					oOverflowToolbarBuilder
						.has(function (oOverflowToolbar) {
							return fnDeepAggregation(oOverflowToolbar).length === 1;
						})
						.do(function (oOverflowToolbar) {
							var oToolbarButton = fnDeepAggregation(oOverflowToolbar)[0],
								oButtonForAction =
									oToolbarButton.getMetadata().getName() === "sap.m.MenuButton"
										? fnGetDefaultActionButton(oToolbarButton) || oToolbarButton
										: oToolbarButton;
							OpaBuilder.Actions.executor(vAction || OpaBuilder.Actions.press())(oButtonForAction);
						})
						.execute();
				};
			return this.doOpenOverflow().success(oSuccessHandler);
		};

		TableBuilder.prototype.doClickOnMessageStripFilter = function () {
			return this.do(function (oMdcTable) {
				var oLink = oMdcTable.getDataStateIndicator()._oLink;
				return OpaBuilder.create()
					.hasType("sap.m.Link")
					.hasId(oLink.getId())
					.description("Press the messageStrip filter on Table")
					.doPress()
					.execute();
			});
		};

		TableBuilder.prototype.hasShowHideDetails = function () {
			return _createTableInternalButtonBuilder(this, "showHideDetails", false);
		};

		TableBuilder.prototype.doShowHideDetails = function (bShowDetails) {
			return this.doOpenOverflow().success(function (oMdcTable) {
				if (_isGridTable(oMdcTable)) {
					return;
				}
				OpaBuilder.create()
					.hasType("sap.m.SegmentedButton")
					.hasId(/-showHideDetails$/)
					.doConditional(
						OpaBuilder.Matchers.childrenMatcher(OpaBuilder.create(this).hasType("sap.m.Select"), true),
						function (oItem) {
							// in the overflow
							_showHideDetailsOnOverflow(bShowDetails);
							return true;
						},
						function (oItem) {
							// on the table toolbar
							_showHideDetailsOnTableToolbar(bShowDetails);
							return true;
						}
					)
					.execute();
			});
		};

		TableBuilder.prototype.hasColumnAdaptation = function () {
			return _createTableInternalButtonBuilder(this, "settings", false);
		};

		TableBuilder.prototype.doOpenColumnAdaptation = function () {
			return _createTableInternalButtonBuilder(this, "settings", OpaBuilder.Actions.press());
		};

		TableBuilder.prototype.hasColumnSorting = function () {
			return _createTableInternalButtonBuilder(this, "settings", false);
		};

		TableBuilder.prototype.doOpenColumnSorting = function () {
			return _createTableInternalButtonBuilder(this, "settings", OpaBuilder.Actions.press()).success(
				OpaBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.m.IconTabBar")
					.has(
						OpaBuilder.Matchers.aggregation(
							"items",
							OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.TAB_Sort")
						)
					)
					.has(FEBuilder.Matchers.singleElement())
					.doPress()
					.description("Selecting Icon Tab Sort")
			);
		};

		TableBuilder.prototype.hasColumnFiltering = function () {
			return _createTableInternalButtonBuilder(this, "filter", false);
		};

		TableBuilder.prototype.doOpenColumnFiltering = function () {
			return _createTableInternalButtonBuilder(this, "settings", OpaBuilder.Actions.press()).success(
				OpaBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.m.IconTabBar")
					.has(
						OpaBuilder.Matchers.aggregation(
							"items",
							OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.TAB_Filter")
						)
					)
					.has(FEBuilder.Matchers.singleElement())
					.doPress()
					.description("Selecting Icon Tab Filter")
			);
		};

		TableBuilder.prototype.hasExport = function () {
			return _createTableInternalButtonBuilder(this, "export", false, "sap.m.MenuButton");
		};

		TableBuilder.prototype.hasPaste = function () {
			return _createTableInternalButtonBuilder(this, "paste", false, "sap.m.OverflowToolbarButton");
		};

		TableBuilder.prototype.doExecuteInlineAction = function (vRowMatcher, vColumn) {
			return this.doOnRows(vRowMatcher, TableBuilder.Row.Actions.pressInlineAction(vColumn));
		};

		TableBuilder.prototype.doPasteData = function (aData) {
			return this.do(function (oMdcTable) {
				oMdcTable.firePaste({ data: aData });
			});
		};

		TableBuilder.createAdaptationDialogBuilder = function (oOpaInstance) {
			return DialogBuilder.create(oOpaInstance).hasSome(
				OpaBuilder.Matchers.resourceBundle("title", "sap.ui.mdc", "table.SETTINGS_COLUMN"),
				OpaBuilder.Matchers.resourceBundle("title", "sap.ui.mdc", "p13nDialog.VIEW_SETTINGS")
			);
		};

		TableBuilder.createSortingDialogBuilder = function (oOpaInstance) {
			return DialogBuilder.create(oOpaInstance)
				.has(OpaBuilder.Matchers.resourceBundle("title", "sap.ui.mdc", "p13nDialog.VIEW_SETTINGS"))
				.hasChildren(
					OpaBuilder.create(oOpaInstance)
						.hasType("sap.m.IconTabFilter")
						.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.TAB_Sort"))
				);
		};

		TableBuilder.createFilteringDialogBuilder = function (oOpaInstance) {
			return DialogBuilder.create(oOpaInstance)
				.has(OpaBuilder.Matchers.resourceBundle("title", "sap.ui.mdc", "p13nDialog.VIEW_SETTINGS"))
				.hasChildren(
					OpaBuilder.create(oOpaInstance)
						.hasType("sap.m.IconTabFilter")
						.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.TAB_Filter"))
				);
		};

		TableBuilder.Cell = {
			Matchers: {
				state: function (sName, vValue) {
					switch (sName) {
						case "editor":
						case "editors":
							return function (oCell) {
								return MacroFieldBuilder.Matchers.states(vValue)(oCell);
							};
						default:
							return FEBuilder.Matchers.state(sName, vValue);
					}
				},
				states: function (mStateMap) {
					return FEBuilder.Matchers.states(mStateMap, TableBuilder.Cell.Matchers.state);
				}
			}
		};

		TableBuilder.Column = {
			Matchers: {
				state: function (sName, vValue) {
					switch (sName) {
						case "sortOrder":
							return TableBuilder.Column.Matchers.sortOrder(vValue);
						case "template":
						case "creationTemplate":
							return function (oColumn) {
								return MacroFieldBuilder.Matchers.states(vValue)(oColumn.getAggregation(sName));
							};
						default:
							return FEBuilder.Matchers.state(sName, vValue);
					}
				},
				states: function (mStateMap) {
					return FEBuilder.Matchers.states(mStateMap, TableBuilder.Column.Matchers.state);
				},
				sortOrder: function (sSortOrder) {
					return function (oMdcColumn) {
						var oMdcTable = oMdcColumn.getParent(),
							bIsGridTable = _isGridTable(oMdcTable),
							mProperties = {};

						if (bIsGridTable) {
							mProperties.sorted = sSortOrder === SortOrder.None ? false : true;
							if (sSortOrder !== SortOrder.None) {
								mProperties.sortOrder = sSortOrder;
							}
						} else {
							mProperties.sortIndicator = sSortOrder;
						}

						return FEBuilder.controlsExist(
							FEBuilder.create()
								.hasId(oMdcColumn.getId() + "-innerColumn")
								.hasProperties(mProperties)
						);
					};
				}
			}
		};

		TableBuilder.Row = {
			Matchers: {
				cell: function (vColumn) {
					return function (oRow) {
						var iColumn = _getCellIndex(vColumn, oRow);
						return _getCell(oRow, iColumn);
					};
				},
				cellValue: function (vColumn, vExpectedValue) {
					return function (oRow) {
						var oCellField = TableBuilder.Row.Matchers.cell(vColumn)(oRow);
						while (oCellField.isA("sap.fe.macros.MacroAPI")) {
							oCellField = oCellField.getContent();
						}

						return MacroFieldBuilder.Matchers.value(vExpectedValue)(oCellField);
					};
				},
				cellValues: function (mColumnValueMap) {
					if (!mColumnValueMap) {
						return OpaBuilder.Matchers.TRUE;
					}
					return FEBuilder.Matchers.match(
						Object.keys(mColumnValueMap).map(function (sColumnName) {
							return TableBuilder.Row.Matchers.cellValue(sColumnName, mColumnValueMap[sColumnName]);
						})
					);
				},
				hiddenCell: function (sColumnName) {
					return function (oRow) {
						var oCellField = TableBuilder.Row.Matchers.cell(sColumnName)(oRow);
						while (oCellField.isA("sap.fe.macros.MacroAPI")) {
							oCellField = oCellField.getContent();
						}

						return MacroFieldBuilder.Matchers.empty(oCellField);
					};
				},
				hiddenCells: function (vColumn) {
					if (!vColumn || vColumn.length === 0) {
						return OpaBuilder.Matchers.TRUE;
					}
					return FEBuilder.Matchers.match(
						vColumn.map(function (sColumnName) {
							return TableBuilder.Row.Matchers.hiddenCell(sColumnName);
						})
					);
				},
				cellProperty: function (vColumn, oExpectedState) {
					return function (oRow) {
						var oCell = TableBuilder.Row.Matchers.cell(vColumn)(oRow);
						while (oCell.isA("sap.fe.macros.MacroAPI")) {
							oCell = oCell.getContent();
						}
						return TableBuilder.Cell.Matchers.states(oExpectedState)(oCell);
					};
				},
				cellProperties: function (mCellStateMap) {
					if (!mCellStateMap) {
						return OpaBuilder.Matchers.TRUE;
					}
					return FEBuilder.Matchers.match(
						Object.keys(mCellStateMap).map(function (sColumnName) {
							return TableBuilder.Row.Matchers.cellProperty(sColumnName, mCellStateMap[sColumnName]);
						})
					);
				},
				selected: function (bSelected) {
					return function (oRow) {
						var oTable = oRow.getParent(),
							oMdcTable = oTable.getParent(),
							bIsGridTable = _isGridTable(oMdcTable),
							bRowIsSelected = bIsGridTable
								? oMdcTable.getSelectedContexts().includes(oRow.getBindingContext())
								: oRow.getSelected();

						return bSelected ? bRowIsSelected : !bRowIsSelected;
					};
				},
				navigated: function (bNavigated) {
					return function (oRow) {
						var bRowIsNavigated;

						if (oRow.getMetadata().getName() === "sap.ui.table.Row") {
							bRowIsNavigated = oRow.getAggregation("_settings").getNavigated();
						} else {
							bRowIsNavigated = oRow.getNavigated();
						}
						return bNavigated ? bRowIsNavigated : !bRowIsNavigated;
					};
				},
				focused: function () {
					return function (oRow) {
						var aElementsToCheck = [oRow];
						if (oRow.getMetadata().getName() === "sap.ui.table.Row") {
							aElementsToCheck.push(_getRowNavigationIconOnGridTable(oRow));
						}
						return aElementsToCheck.some(OpaBuilder.Matchers.focused(true));
					};
				},
				highlighted: function (sHighlight) {
					return function (oRow) {
						var sRowHighlight;

						if (oRow.getMetadata().getName() === "sap.ui.table.Row") {
							sRowHighlight = oRow.getAggregation("_settings").getHighlight();
						} else {
							sRowHighlight = oRow.getHighlight();
						}
						return sHighlight === sRowHighlight;
					};
				},
				isDraft: function (bIsDraft) {
					var draftMatcher = OpaBuilder.Matchers.childrenMatcher(function (oRowChild) {
						return oRowChild.isA("sap.m.ObjectMarker");
					}, false);

					if (bIsDraft) {
						return draftMatcher;
					} else {
						return OpaBuilder.Matchers.not(draftMatcher);
					}
				},
				states: function (mStateMap) {
					if (!Utils.isOfType(mStateMap, Object)) {
						return OpaBuilder.Matchers.TRUE;
					}
					return FEBuilder.Matchers.match(
						Object.keys(mStateMap).map(function (sProperty) {
							switch (sProperty) {
								case "selected":
									return TableBuilder.Row.Matchers.selected(mStateMap.selected);
								case "focused":
									return TableBuilder.Row.Matchers.focused();
								case "navigated":
									return TableBuilder.Row.Matchers.navigated(mStateMap.navigated);
								case "highlight":
									return TableBuilder.Row.Matchers.highlighted(mStateMap.highlight);
								case "isDraft":
									return TableBuilder.Row.Matchers.isDraft(mStateMap.isDraft);
								default:
									return FEBuilder.Matchers.state(sProperty, mStateMap[sProperty]);
							}
						})
					);
				},
				visualGroup: function (iLevel, sTitle) {
					return function (oRow) {
						if (oRow.getMetadata().getName() === "sap.ui.table.Row") {
							return oRow.getLevel() === iLevel && oRow.getTitle() === sTitle;
						} else {
							return false; // Visual grouping not supported in responsive table yet
						}
					};
				}
			},
			Actions: {
				onCell: function (vColumn, vCellAction) {
					return function (oRow) {
						var iColumn = _getCellIndex(vColumn, oRow),
							oCellControl = _getCell(oRow, iColumn);

						// if the cellControl is a FieldWrapper replace it by its active control (edit or display)
						if (oCellControl.isA("sap.fe.core.controls.FieldWrapper")) {
							oCellControl =
								oCellControl.getEditMode() === "Display"
									? oCellControl.getContentDisplay()
									: oCellControl.getContentEdit()[0];
						}
						if (oCellControl.isA("sap.m.VBox")) {
							oCellControl =
								oCellControl.getItems()[0].getContent().getEditMode() === "Display"
									? oCellControl.getItems()[0].getContent().getContentDisplay()
									: oCellControl.getItems()[0].getContent().getContentEdit()[0];
						}
						if (oCellControl.isA("sap.fe.core.controls.ConditionalWrapper")) {
							oCellControl = oCellControl.getCondition() ? oCellControl.getContentTrue() : oCellControl.getContentFalse();
						}

						// Collaboration case: the field is wrapped in a HBox with an avatar
						if (
							oCellControl.isA("sap.m.HBox") &&
							oCellControl.getItems().length === 2 &&
							oCellControl.getItems()[1].isA("sap.m.Avatar")
						) {
							oCellControl = oCellControl.getItems()[0];
						}

						if (vCellAction.executeOn) {
							vCellAction.executeOn(oCellControl);
						} else {
							vCellAction(oCellControl);
						}
					};
				},
				editCell: function (vColumn, vValue, bInputNotFinalized) {
					return TableBuilder.Row.Actions.onCell(
						vColumn,
						new EnterText({
							text: vValue,
							clearTextFirst: true,
							keepFocus: bInputNotFinalized ? true : false,
							idSuffix: null,
							pressEnterKey: bInputNotFinalized ? false : true
						})
					);
				},
				editCells: function (mColumnValueMap, bInputNotFinalized) {
					return Object.keys(mColumnValueMap).map(function (sColumnName) {
						return TableBuilder.Row.Actions.editCell(sColumnName, mColumnValueMap[sColumnName], bInputNotFinalized);
					});
				},
				onCellInlineAction: function (vColumn, vCellAction) {
					return function (oRow) {
						var aButtons = _getButtonsForInlineActions(vColumn, oRow);
						return OpaBuilder.Actions.executor(vCellAction)(aButtons);
					};
				},
				pressInlineAction: function (vColumn) {
					return TableBuilder.Row.Actions.onCellInlineAction(vColumn, OpaBuilder.Actions.press());
				}
			}
		};

		TableBuilder.Matchers = {
			isGridTable: function () {
				return _isGridTable;
			},
			rows: function (vRowMatcher) {
				return function (oMdcTable) {
					// when having an overlay, the table is dirty and the rows do not reflect the actual table state
					if (TableBuilder.Matchers.overlay(true)(oMdcTable)) {
						return [];
					}
					return OpaBuilder.Matchers.aggregation(_getRowAggregationName(oMdcTable), vRowMatcher)(oMdcTable._oTable);
				};
			},
			rowsMatcher: function (vRowMatcher) {
				var fnMatchRows = TableBuilder.Matchers.rows(vRowMatcher);
				return function (oMdcTable) {
					return fnMatchRows(oMdcTable).length > 0;
				};
			},
			columnControl: function (vColumn) {
				return function (oMdcTable) {
					var iColumnIndex = _getColumnIndex(vColumn, oMdcTable),
						oInnerTable = _getInnerTable(oMdcTable);
					return oInnerTable.getColumns()[iColumnIndex];
				};
			},
			column: function (vColumn, mStates) {
				return function (oMdcTable) {
					var iColumnIndex = _getColumnIndex(vColumn, oMdcTable),
						aColumns = Utils.getAggregation(oMdcTable, "columns");
					if (iColumnIndex === -1) {
						// check for non-existing columns 'false' - add 'null' in case there is no column on purpose
						if (mStates && mStates.visible === false) {
							return true;
						}
					} else {
						var oColumn = aColumns[iColumnIndex];
						if (!mStates || FEBuilder.Matchers.match(TableBuilder.Column.Matchers.states(mStates))(oColumn)) {
							return oColumn;
						}
					}
					return false;
				};
			},
			columns: function (mColumnsStatesMaps, bIgnoreColumnState) {
				return function (oMdcTable) {
					return Object.keys(mColumnsStatesMaps).reduce(function (aResult, vColumn) {
						var oColumn = TableBuilder.Matchers.column(
							vColumn,
							bIgnoreColumnState ? undefined : mColumnsStatesMaps[vColumn]
						)(oMdcTable);
						if (oColumn) {
							aResult.push(oColumn === true ? null : oColumn);
						}
						return aResult;
					}, []);
				};
			},
			columnsMatcher: function (mColumnMatchers, bIgnoreColumnState) {
				var fnMatchColumns = TableBuilder.Matchers.columns(mColumnMatchers, bIgnoreColumnState);
				return function (oMdcTable) {
					return fnMatchColumns(oMdcTable).length === Object.keys(mColumnMatchers).length;
				};
			},
			overlay: function (bHasOverlay) {
				if (bHasOverlay === undefined) {
					bHasOverlay = true;
				}
				return function (oMdcTable) {
					oMdcTable = oMdcTable._feMdcTableWrapper || oMdcTable;
					return oMdcTable && oMdcTable._oTable.getShowOverlay() === bHasOverlay;
				};
			},
			state: function (sName, vValue) {
				switch (sName) {
					case "overlay":
						return TableBuilder.Matchers.overlay(vValue);
					default:
						return FEBuilder.Matchers.state(sName, vValue);
				}
			},
			states: function (mStateMap) {
				return FEBuilder.Matchers.states(mStateMap, TableBuilder.Matchers.state);
			}
		};

		TableBuilder.Actions = {};

		return TableBuilder;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/builder/OverflowToolbarBuilder", ["sap/ui/test/OpaBuilder", "./FEBuilder", "sap/fe/test/Utils", "sap/ui/test/matchers/Interactable"],
	function (OpaBuilder, FEBuilder, Utils, Interactable) {
		"use strict";

		var OverflowToolbarBuilder = function () {
			return FEBuilder.apply(this, arguments);
		};

		OverflowToolbarBuilder.create = function (oOpaInstance) {
			return new OverflowToolbarBuilder(oOpaInstance);
		};

		OverflowToolbarBuilder.prototype = Object.create(FEBuilder.prototype);
		OverflowToolbarBuilder.prototype.constructor = OverflowToolbarBuilder;

		OverflowToolbarBuilder._toggleOverflow = function (oBuilder, bOpen, sToolbarSuffix) {
			var sOverflowButtonId = "overflowButton";
			if (sToolbarSuffix) {
				sOverflowButtonId = sToolbarSuffix + "-" + sOverflowButtonId;
			}
			return oBuilder.doConditional(
				OpaBuilder.Matchers.childrenMatcher(
					OpaBuilder.create()
						.has(FEBuilder.Matchers.id(new RegExp(sOverflowButtonId + "$")))
						.hasProperties({ pressed: !bOpen })
						.has(new Interactable())
						.mustBeEnabled()
						.mustBeVisible()
				),
				OpaBuilder.Actions.press(sOverflowButtonId)
			);
		};

		OverflowToolbarBuilder.openOverflow = function (oBuilder, sToolbarSuffix) {
			return OverflowToolbarBuilder._toggleOverflow(oBuilder, true, sToolbarSuffix);
		};

		OverflowToolbarBuilder.closeOverflow = function (oBuilder, sToolbarSuffix) {
			return OverflowToolbarBuilder._toggleOverflow(oBuilder, false, sToolbarSuffix);
		};

		OverflowToolbarBuilder.prototype.doOpenOverflow = function () {
			return OverflowToolbarBuilder.openOverflow(this);
		};

		OverflowToolbarBuilder.prototype.doCloseOverflow = function () {
			return OverflowToolbarBuilder.closeOverflow(this);
		};

		OverflowToolbarBuilder.prototype.doOnContent = function (vContentMatcher, vContentAction) {
			var oOverflowToolbarBuilder = new FEBuilder(this.getOpaInstance(), this.build()).hasType("sap.m.OverflowToolbar"),
				fnMatcherIsTextButton = function (oControl) {
					if (oControl.isA("sap.fe.macros.ShareAPI")) {
						// ShareAPI does not have a text property
						// text property is on the MenuButton which is inside the shareAPI
						// so we get the ShareAPI's content
						return !!oControl.getContent().getText;
					} else {
						return !!oControl.getText;
					}
				},
				fnDeepAggregation = FEBuilder.Matchers.deepAggregation("content", [
					new Interactable(),
					fnMatcherIsTextButton,
					vContentMatcher
				]),
				fnGetDefaultActionButton = function (oMenuButton) {
					/* This helper function returns the default action button of a menu button (if it exists, otherwise returns null);
					 * Remark: Currently there is no official API to retrieve this button; an alternative way to achieve the same
					 * result might be to check oMenuButton.getButtonMode() === "Split" && oMenuButton.getUseDefaultActionOnly()
					 * first, and then call oMenuButton.fireDefaultAction(), but the interface parameter vContentAction expects
					 * a sap.m.button nonetheless. Hence, we currently use the internal aggregation names as a workaround.
					 */
					return oMenuButton.getAggregation("_button")
						? oMenuButton.getAggregation("_button").getAggregation("_textButton")
						: null;
				},
				oSuccessHandler = function () {
					oOverflowToolbarBuilder
						.has(function (oOverflowToolbar) {
							return fnDeepAggregation(oOverflowToolbar).length === 1;
						})
						.do(function (oOverflowToolbar) {
							var oToolbarButton = fnDeepAggregation(oOverflowToolbar)[0];
							if (oToolbarButton.isA("sap.fe.macros.ShareAPI")) {
								// MenuButton is inside the shareAPI so we do getContent
								oToolbarButton = oToolbarButton.getContent();
							}
							var oButtonForAction =
								oToolbarButton.getMetadata().getName() === "sap.m.MenuButton"
									? fnGetDefaultActionButton(oToolbarButton) || oToolbarButton
									: oToolbarButton;
							OpaBuilder.Actions.executor(vContentAction || OpaBuilder.Actions.press())(oButtonForAction);
						})
						.execute();
				};
			return this.doOpenOverflow().success(oSuccessHandler);
		};

		OverflowToolbarBuilder.prototype.hasContent = function (vContentMatcher, mState) {
			var oOverflowToolbarBuilder = new OverflowToolbarBuilder(this.getOpaInstance(), this.build()),
				aMatchers = [vContentMatcher, FEBuilder.Matchers.states(mState)];
			if (mState && mState.visible === false) {
				mState = Object.assign(mState);
				delete mState.visible;
				oOverflowToolbarBuilder.hasSome(
					// either button is visible=false ...
					OpaBuilder.Matchers.aggregationMatcher("content", aMatchers),
					// ... or it wasn't rendered at all (no match in the aggregation)
					OpaBuilder.Matchers.not(
						OpaBuilder.Matchers.aggregationMatcher("content", [vContentMatcher, FEBuilder.Matchers.states(mState)])
					),
					// for shareAPI look into the child menuButton
					OpaBuilder.Matchers.children(OpaBuilder.Matchers.match([vContentMatcher, FEBuilder.Matchers.states(mState)]))
				);
			} else {
				oOverflowToolbarBuilder.hasAggregation("content", aMatchers);
			}
			return this.doOpenOverflow().success(oOverflowToolbarBuilder);
		};

		return OverflowToolbarBuilder;
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine("sap/fe/test/builder/VMBuilder", ["./FEBuilder", "sap/ui/test/OpaBuilder", "sap/fe/test/Utils"], function (FEBuilder, OpaBuilder, Utils) {
	"use strict";

	var VMBuilder = function () {
		return FEBuilder.apply(this, arguments);
	};

	VMBuilder.create = function (oOpaInstance) {
		return new VMBuilder(oOpaInstance);
	};

	VMBuilder.prototype = Object.create(FEBuilder.prototype);
	VMBuilder.prototype.constructor = VMBuilder;

	/**
	 * Saves a variant under given name.
	 *
	 * @param {string} sVariantName The name of the new variant
	 * @param {boolean} bSetAsDefault
	 * @param {boolean} bApplyAutomatically
	 * @returns {sap.fe.test.builder.VMBuilder} This instance
	 * @public
	 * @ui5-restricted
	 */
	VMBuilder.prototype.doSaveAs = function (sVariantName, bSetAsDefault, bApplyAutomatically) {
		var vGivenDescription = Utils.formatMessage("Save as variant '{0}'", sVariantName);
		this.description = function (vDescription) {
			vGivenDescription = vDescription;
			return this;
		}.bind(this);

		return this.doPress().success(
			function (oVMControl) {
				return FEBuilder.create(this)
					.hasId(oVMControl.getId())
					.doPress("vm-saveas")
					.success(
						FEBuilder.create(this)
							.hasId(oVMControl.getId() + "-vm-savedialog")
							.doOnChildren(
								FEBuilder.create(this)
									.hasId(/-name$/)
									.hasType("sap.m.Input")
									.doEnterText(sVariantName, true, true)
							)
							.doOnChildren(
								FEBuilder.create(this)
									.hasId(/-default$/)
									.hasType("sap.m.CheckBox")
									.doConditional(!!bSetAsDefault, OpaBuilder.Actions.press())
							)
							.doOnChildren(
								FEBuilder.create(this)
									.hasId(/-execute$/)
									.hasType("sap.m.CheckBox")
									.doConditional(!!bApplyAutomatically, OpaBuilder.Actions.press())
							)
							.doOnChildren(
								FEBuilder.create(this)
									.hasId(/-variantsave$/)
									.hasType("sap.m.Button")
									.doPress()
							)
							.description(vGivenDescription)
					)
					.execute();
			}.bind(this)
		);
	};

	/**
	 * Saves the current variant.
	 *
	 * @returns {sap.fe.test.builder.VMBuilder} This instance
	 * @public
	 * @ui5-restricted
	 */
	VMBuilder.prototype.doSave = function () {
		var vGivenDescription = "Save variant";
		this.description = function (vDescription) {
			vGivenDescription = vDescription;
			return this;
		}.bind(this);

		return this.doPress().success(
			function (oVMControl) {
				return FEBuilder.create(this).hasId(oVMControl.getId()).doPress("vm-mainsave").description(vGivenDescription).execute();
			}.bind(this)
		);
	};

	/**
	 * Select a variant under given name.
	 *
	 * @param {string} sVariantName The name of the variant to select
	 * @returns {sap.fe.test.builder.VMBuilder} This instance
	 * @public
	 * @ui5-restricted
	 */
	VMBuilder.prototype.doSelectVariant = function (sVariantName) {
		var vGivenDescription = Utils.formatMessage("Selecting variant '{0}'", sVariantName);
		this.description = function (vDescription) {
			vGivenDescription = vDescription;
			return this;
		}.bind(this);
		return this.doPress().success(
			function (oVMControl) {
				return FEBuilder.create(this)
					.hasId(oVMControl.getId() + "-vm-list")
					.doOnAggregation("items", OpaBuilder.Matchers.properties({ text: sVariantName }), OpaBuilder.Actions.press())
					.description(vGivenDescription)
					.execute();
			}.bind(this)
		);
	};

	/**
	 * Removes a variant under given name.
	 *
	 * @param {string} sVariantName The name of the variant to remove
	 * @returns {sap.fe.test.builder.VMBuilder} This instance
	 * @public
	 * @ui5-restricted
	 */
	VMBuilder.prototype.doRemoveVariant = function (sVariantName) {
		var vGivenDescription = Utils.formatMessage("Removing variant '{0}'", sVariantName);
		this.description = function (vDescription) {
			vGivenDescription = vDescription;
			return this;
		}.bind(this);
		return this.doPress().success(
			function (oVMControl) {
				return FEBuilder.create(this)
					.hasId(oVMControl.getId())
					.doPress("vm-manage")
					.success(
						FEBuilder.create(this)
							.hasId(oVMControl.getId() + "-vm-managementTable")
							.doOnChildren(
								FEBuilder.create(this)
									.hasType("sap.m.ColumnListItem")
									.hasAggregationProperties("cells", { value: sVariantName })
									.has(
										OpaBuilder.Matchers.aggregation(
											"cells",
											OpaBuilder.Matchers.properties({ icon: "sap-icon://sys-cancel" })
										)
									)
									.has(FEBuilder.Matchers.atIndex(0))
									.doPress()
							)
							.doOnChildren(
								FEBuilder.create(this)
									.hasId(/-vm-managementsave$/)
									.hasType("sap.m.Button")
									.doPress()
							)
							.description(vGivenDescription)
					)
					.execute();
			}.bind(this)
		);
	};

	/**
	 * Selects a variant as the default.
	 *
	 * @param {string} sVariantName The name of the variant to be set as default
	 * @returns {sap.fe.test.builder.VMBuilder} `this` instance
	 * @public
	 * @ui5-restricted
	 */
	VMBuilder.prototype.doSetVariantAsDefault = function (sVariantName) {
		var vGivenDescription = Utils.formatMessage("Setting variant '{0}' as default", sVariantName);
		this.description = function (vDescription) {
			vGivenDescription = vDescription;
			return this;
		}.bind(this);
		return this.doPress().success(
			function (oVMControl) {
				return FEBuilder.create(this)
					.hasId(oVMControl.getId())
					.doPress("vm-manage")
					.success(
						FEBuilder.create(this)
							.hasId(oVMControl.getId() + "-vm-managementTable")
							.doOnChildren(
								FEBuilder.create(this)
									.hasType("sap.m.ColumnListItem")
									.hasAggregationProperties("cells", { value: sVariantName })
									.doOnChildren(FEBuilder.create(this).hasType("sap.m.RadioButton").doPress())
							)
							.description(vGivenDescription)
					)
					.success(
						FEBuilder.create(this)
							.hasId(oVMControl.getId() + "-vm-managementsave")
							.hasType("sap.m.Button")
							.doPress()
					)
					.execute();
			}.bind(this)
		);
	};

	/**
	 * Resets the default variant to Standard.
	 *
	 * @returns {sap.fe.test.builder.VMBuilder} `this` instance
	 * @public
	 * @ui5-restricted
	 */
	VMBuilder.prototype.doResetDefaultVariant = function () {
		var vGivenDescription = Utils.formatMessage("Resetting default variant ");
		this.description = function (vDescription) {
			vGivenDescription = vDescription;
			return this;
		}.bind(this);
		return this.doPress().success(
			function (oVMControl) {
				return FEBuilder.create(this)
					.hasId(oVMControl.getId())
					.doPress("vm-manage")
					.success(
						FEBuilder.create(this)
							.hasId(oVMControl.getId() + "-vm-managementTable")
							.doOnChildren(
								FEBuilder.create(this)
									.hasType("sap.m.ColumnListItem")
									.hasAggregationProperties("cells", { text: "SAP" })
									.doOnChildren(FEBuilder.create(this).hasType("sap.m.RadioButton").doPress())
							)
							.description(vGivenDescription)
					)
					.success(
						FEBuilder.create(this)
							.hasId(oVMControl.getId() + "-vm-managementsave")
							.hasType("sap.m.Button")
							.doPress()
					)
					.execute();
			}.bind(this)
		);
	};

	return VMBuilder;
});
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/test/internal/ConsoleErrorChecker", [], function () {
  "use strict";

  function wrapPatterns(pattern) {
    if (pattern instanceof RegExp) {
      return message => message.match(pattern) !== null;
    } else {
      return message => message.includes(pattern);
    }
  }

  /**
   * List of error message patterns that are always accepted.
   */
  const GLOBALLY_ACCEPTED_ERRORS = ["failed to load JavaScript resource: sap/esh/search/ui/i18n.js" // shell
  ].map(wrapPatterns);
  let ConsoleErrorChecker = /*#__PURE__*/function () {
    function ConsoleErrorChecker(window) {
      this.matchers = [];
      this.messages = [];
      this.observer = new MutationObserver(mutations => {
        const opaFrame = mutations.reduce((iFrame, mutation) => {
          if (iFrame !== null) {
            return iFrame;
          }
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof Element) {
              const element = node.querySelector("#OpaFrame");
              if (element instanceof HTMLIFrameElement && element.contentWindow) {
                return element;
              }
            }
          }
          return iFrame;
        }, null);
        if (opaFrame && opaFrame.contentWindow) {
          this.prepareWindow(opaFrame.contentWindow);
        }
      });
      QUnit.moduleStart(() => {
        this.observer.observe(window.document.body, {
          childList: true
        });
      });
      QUnit.moduleDone(() => {
        this.observer.disconnect();
      });
      QUnit.testStart(() => {
        this.reset();
      });
      QUnit.log(() => {
        this.handleFailedMessages();
      });
      this.karma = window.__karma__;

      // either go for Karma config option "ui5.config.strictConsoleErrors" or use URL query parameter "strict"
      const search = new URLSearchParams(window.location.search);
      const urlParam = search.get("strictConsoleErrors");
      if (urlParam !== null) {
        this.isStrict = urlParam === "true";
      } else {
        var _this$karma, _this$karma$config$ui;
        this.isStrict = ((_this$karma = this.karma) === null || _this$karma === void 0 ? void 0 : (_this$karma$config$ui = _this$karma.config.ui5) === null || _this$karma$config$ui === void 0 ? void 0 : _this$karma$config$ui.config.strictconsoleerrors) ?? false;
      }
      this.reset();
    }
    var _proto = ConsoleErrorChecker.prototype;
    _proto.handleFailedMessages = function handleFailedMessages() {
      const failedMessages = this.messages;
      this.messages = [];
      if (failedMessages.length > 0) {
        QUnit.assert.pushResult({
          result: false,
          source: "FE Console Log Check",
          message: `There were ${failedMessages.length} unexpected console errors`,
          actual: failedMessages,
          expected: []
        });
      }
    };
    _proto.reset = function reset() {
      this.messages = [];

      // this sets the default to apply if no allowed patterns are set via setAcceptedErrorPatterns().
      if (this.isStrict) {
        this.matchers = GLOBALLY_ACCEPTED_ERRORS;
      } else {
        this.matchers = [() => true];
      }
    };
    _proto.setAcceptedErrorPatterns = function setAcceptedErrorPatterns(patterns) {
      if (!patterns || patterns.length === 0) {
        this.matchers = GLOBALLY_ACCEPTED_ERRORS;
      } else {
        this.matchers = patterns.map(wrapPatterns).concat(GLOBALLY_ACCEPTED_ERRORS);
      }
    };
    _proto.checkAndLog = function checkAndLog(type) {
      for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
      }
      // only check the error messages
      if (type === "error") {
        const messageText = data[0];
        const isAllowed = this.matchers.some(matcher => matcher(messageText));
        if (!isAllowed) {
          this.messages.push(messageText);
        }
      }
      if (this.karma) {
        // wrap the data to facilitate parsing in the backend
        const wrappedData = data.map(d => [d]);
        this.karma.log(type, wrappedData);
      }
    };
    _proto.prepareWindow = function prepareWindow(window) {
      var _this = this;
      const console = window.console;

      // capture console.log(), console.debug(), etc.
      const patchConsoleMethod = method => {
        const fnOriginal = console[method];
        console[method] = function () {
          for (var _len2 = arguments.length, data = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            data[_key2] = arguments[_key2];
          }
          _this.checkAndLog(method, ...data);
          return fnOriginal.apply(console, data);
        };
      };
      patchConsoleMethod("log");
      patchConsoleMethod("debug");
      patchConsoleMethod("info");
      patchConsoleMethod("warn");
      patchConsoleMethod("error");

      // capture console.assert()
      // see https://console.spec.whatwg.org/#assert
      console.assert = function () {
        let condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        if (condition) {
          return;
        }
        const message = "Assertion failed";
        for (var _len3 = arguments.length, data = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          data[_key3 - 1] = arguments[_key3];
        }
        if (data.length === 0) {
          data.push(message);
        } else {
          let first = data[0];
          if (typeof first !== "string") {
            data.unshift(message);
          } else {
            first = `${message}: ${first}`;
            data[0] = first;
          }
        }
        console.error(...data);
      };

      // capture errors
      function onPromiseRejection(event) {
        var _event$reason;
        const message = `UNHANDLED PROMISE REJECTION: ${event.reason}`;
        this.checkAndLog("error", message, (_event$reason = event.reason) === null || _event$reason === void 0 ? void 0 : _event$reason.stack);
      }
      function onError(event) {
        const message = event.message;
        this.checkAndLog("error", message, event.filename);
      }
      window.addEventListener("error", onError.bind(this), {
        passive: true
      });
      window.addEventListener("unhandledrejection", onPromiseRejection.bind(this), {
        passive: true
      });
    };
    ConsoleErrorChecker.getInstance = function getInstance(window) {
      // the global instance is needed to support multiple tests in a row (in Karma)
      if (!window.sapFEConsoleErrorChecker) {
        window.sapFEConsoleErrorChecker = new ConsoleErrorChecker(window);
      }
      return window.sapFEConsoleErrorChecker;
    };
    return ConsoleErrorChecker;
  }();
  return ConsoleErrorChecker.getInstance(window);
}, false);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/internal/FEArrangements", [
		"sap/ui/test/Opa5",
		"sap/ui/test/OpaBuilder",
		"sap/base/util/UriParameters",
		"sap/fe/test/Utils",
		"sap/fe/test/Stubs",
		"sap/fe/test/BaseArrangements",
		"sap/fe/test/internal/ConsoleErrorChecker"
	],
	function (Opa5, OpaBuilder, UriParameters, Utils, Stubs, BaseArrangements, ConsoleErrorChecker) {
		"use strict";

		return BaseArrangements.extend("sap.fe.test.internal.FEArrangements", {
			constructor: function (mSettings) {
				BaseArrangements.call(
					this,
					Utils.mergeObjects(
						{
							launchUrl: "test-resources/sap/fe/templates/internal/demokit/flpSandbox.html"
						},
						mSettings
					)
				);
			},

			iResetTestData: function (bIgnoreRedeploy) {
				var that = this,
					oUriParams = new UriParameters(window.location.href),
					sBackendUrl = oUriParams.get("useBackendUrl"),
					sProxyPrefix = sBackendUrl ? "/databinding/proxy/" + sBackendUrl.replace("://", "/") : "",
					bSuccess = false,
					sTenantID =
						window.__karma__ && window.__karma__.config && window.__karma__.config.ui5
							? window.__karma__.config.ui5.shardIndex
							: "default";

				return OpaBuilder.create(this)
					.success(function () {
						var oResetData = that.resetTestData(),
							oRedeploy = bIgnoreRedeploy ? Promise.resolve() : jQuery.post(sProxyPrefix + "/redeploy?tenant=" + sTenantID);

						Promise.all([oResetData, oRedeploy])
							.finally(function () {
								bSuccess = true;
							})
							.catch(function (oError) {
								throw oError;
							});

						return OpaBuilder.create(this)
							.timeout(60) // allow some time (redeployment on the Java stack is slow)
							.check(function () {
								return bSuccess;
							})
							.execute();
					})
					.description(Utils.formatMessage("Reset test data on tenant '{0}'", sTenantID))
					.execute();
			},

			/**
			 * Fail the test if there are errors logged to the browser console.
			 *
			 * @param {Array<RegExp|string>} [aErrors] The allowed error messages. Either use regular expressions or strings. Pass undefined or an empty array to reject all error messages.
			 * @returns {*} The OPA promise
			 */
			iAcceptTheseErrors: function (aErrors) {
				return OpaBuilder.create(this)
					.do(function () {
						ConsoleErrorChecker.setAcceptedErrorPatterns(aErrors);
					})
					.description(
						!aErrors || aErrors.length === 0
							? "Do not accept error messages"
							: Utils.formatMessage("Only accept these error message patterns: {0}", aErrors)
					)
					.execute();
			}
		});
	}
);
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.predefine(
	"sap/fe/test/internal/FEJourneyRunner", ["sap/fe/test/JourneyRunner", "sap/fe/test/Utils", "./FEArrangements", "sap/base/Log"],
	function (JourneyRunner, Utils, FEArrangements) {
		"use strict";

		var FERunner = JourneyRunner.extend("sap.fe.test.internal.FEJourneyRunner", {
			constructor: function (mSettings) {
				var defaultSettings = {
					launchUrl: "test-resources/sap/fe/templates/internal/demokit/flpSandbox.html",
					launchParameters: {
						"sap-ui-xx-filterQueryPanel": true,
						"sap-ui-xx-csp-policy": "sap-target-level-3:ro"
					}
				};

				mSettings = Object.assign(defaultSettings, mSettings);

				try {
					if (window.__karma__.config.ui5.config.usetenants) {
						var sTenantID = window.__karma__.config.ui5.shardIndex;
						if (sTenantID !== undefined && sTenantID !== null) {
							mSettings.launchParameters["sap-client"] = sTenantID;
						}
					}
				} catch (e) {
					delete mSettings.launchParameters["sap-client"];
				}
				JourneyRunner.apply(this, [mSettings]);
			},

			getBaseArrangements: function (mSettings) {
				return new FEArrangements(mSettings);
			}
		});

		var DEFAULT_RUNNER = new FERunner({
			opaConfig: {
				frameWidth: 1300,
				frameHeight: 1024
			}
		});
		var WIDE_RUNNER = new FERunner({
			opaConfig: {
				frameWidth: 1700,
				frameHeight: 1024
			}
		});
		var FCL_RUNNER = new FERunner({
			opaConfig: {
				frameWidth: 1900,
				frameHeight: 1440,
				timeout: 90 // unstable FCL OPA tests in case of deep linking
			}
		});

		FERunner.run = DEFAULT_RUNNER.run.bind(DEFAULT_RUNNER);
		FERunner.runWide = WIDE_RUNNER.run.bind(WIDE_RUNNER);
		FERunner.runFCL = FCL_RUNNER.run.bind(FCL_RUNNER);

		return FERunner;
	}
);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/test/library", ["sap/ui/core/Core", "sap/ui/core/library"], function (Core, _library) {
  "use strict";

  /**
   * Test library for SAP Fiori elements
   *
   * @namespace
   * @name sap.fe.test
   * @public
   */

  // library dependencies
  const thisLib = Core.initLibrary({
    name: "sap.fe.test",
    dependencies: ["sap.ui.core"],
    types: [],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.111.1",
    noLibraryCSS: true
  });
  return thisLib;
}, false);
sap.ui.require.preload({
	"sap/fe/test/manifest.json":'{"_version":"1.21.0","sap.app":{"id":"sap.fe.test","type":"library","embeds":[],"applicationVersion":{"version":"1.111.1"},"title":"UI5 library: sap.fe.test","description":"UI5 library: sap.fe.test","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":[]},"sap.ui5":{"dependencies":{"libs":{"sap.ui.core":{}}},"library":{"i18n":false,"content":{"controls":[],"elements":[],"types":[],"interfaces":[]}}}}'
});
//# sourceMappingURL=library-preload.js.map
