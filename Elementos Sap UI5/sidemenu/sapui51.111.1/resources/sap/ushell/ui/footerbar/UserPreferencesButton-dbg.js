// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.UserPreferencesButton.
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/m/Bar",
    "sap/m/Button",
    "sap/m/ButtonRenderer",
    "sap/m/Dialog",
    "sap/m/DisplayListItem",
    "sap/m/library",
    "sap/m/List",
    "sap/m/Text",
    "sap/m/ObjectIdentifier",
    "sap/ui/base/Object",
    "sap/ui/core/Core",
    "sap/ui/core/IconPool",
    "sap/ui/Device",
    "sap/ui/layout/VerticalLayout",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ushell/ui/launchpad/ActionItem",
    "sap/ushell/ui/utils"
], function (
    Log,
    deepExtend,
    Bar,
    Button,
    ButtonRenderer,
    Dialog,
    DisplayListItem,
    mobileLibrary,
    List,
    Text,
    ObjectIdentifier,
    BaseObject,
    Core,
    IconPool,
    Device,
    VerticalLayout,
    JSONModel,
    Config,
    EventHub,
    ushellLibrary,
    resources,
    AccessibilityCustomData,
    ActionItem,
    oUiUtils
) {
    "use strict";

    var ButtonType = mobileLibrary.ButtonType;

    /**
     * Constructor for a new ui/footerbar/UserPreferencesButton.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Add your documentation for the new ui/footerbar/UserPreferencesButton
     * @extends sap.ushell.ui.launchpad.ActionItem
     * @constructor
     * @public
     * @name sap.ushell.ui.footerbar.UserPreferencesButton
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var UserPreferencesButton = ActionItem.extend("sap.ushell.ui.footerbar.UserPreferencesButton", /** @lends sap.ushell.ui.footerbar.UserPreferencesButton.prototype */ {
        metadata: { library: "sap.ushell" },
        renderer: ButtonRenderer
    });

    /**
     * UserPreferencesButton
     *
     * @name sap.ushell.ui.footerbar.UserPreferencesButton
     * @private
     * @since 1.16.0
     */
    UserPreferencesButton.prototype.init = function () {
        //call the parent button init method
        if (ActionItem.prototype.init) {
            ActionItem.prototype.init.apply(this, arguments);
        }
        this.setIcon("sap-icon://person-placeholder");
        this.setText(resources.i18n.getText("userSettings"));
        this.setTooltip(resources.i18n.getText("settings_tooltip"));
        this.attachPress(this.showUserPreferencesDialog);
        this.setModel(Config.createModel("/core/userPreferences", JSONModel));
    };

    UserPreferencesButton.prototype.createDialog = function () {
        this.oDialog = new Dialog({
            id: "userPreferencesDialog",
            title: "{/dialogTitle}",
            contentWidth: "29.6rem",
            contentHeight: "17rem",
            buttons: [
                new Button({
                    id: "saveButton",
                    text: resources.i18n.getText("saveBtn"),
                    type: ButtonType.Emphasized,
                    press: this._dialogSaveButtonHandler.bind(this),
                    visible: {
                        parts: ["/entries"],
                        formatter: function (aEntries) {
                            if (!aEntries) {
                                return false;
                            }
                            return aEntries.some(function (oEntry) {
                                return oEntry.editable;
                            });
                        }
                    }
                }),
                new Button({
                    id: "cancelButton",
                    text: {
                        parts: ["/entries"],
                        formatter: function (aEntries) {
                            if (!aEntries) {
                                return "";
                            }
                            var bEditableExist = aEntries.some(function (oEntry) {
                                return oEntry.editable;
                            });
                            return bEditableExist > 0 ? resources.i18n.getText("cancelBtn") : resources.i18n.getText("close");
                        }
                    },
                    press: this._dialogCancelButtonHandler.bind(this),
                    visible: true
                })
            ],
            afterClose: function () {
                this._destroyDialog();
                this.oUser.resetChangedProperties();
            }.bind(this),
            stretch: Device.system.phone,
            customHeader: new Bar({
                contentLeft: [
                    new Button({
                        id: "userPrefBackBtn",
                        visible: "{/isDetailedEntryMode}",
                        icon: IconPool.getIconURI("nav-back"),
                        press: this._dialogBackButtonHandler.bind(this),
                        tooltip: resources.i18n.getText("feedbackGoBackBtn_tooltip")
                    })
                ],
                contentMiddle: [
                    new Text({
                        id: "userPrefTitle",
                        text: "{/dialogTitle}"
                    })
                ]
            }),
            customData: [
                new AccessibilityCustomData({
                    key: "aria-label",
                    value: resources.i18n.getText("Settings_Dialog_Main_label"),
                    writeToDom: true
                })
            ],
            content: this._getOriginalDialogContent()
        }).addStyleClass("sapUshellUserPreferencesDialog").addStyleClass("sapContrastPlus");

        this.oDialog.setModel(this.getModel());
    };

    UserPreferencesButton.prototype._getOriginalDialogContent = function () {
        if (!this.oInitialContent) {
            var oEntryTemplate = this._getUserPrefEntriesTemplate();

            this.oInitialContent = new VerticalLayout({
                id: "userPreferencesLayout",
                content: [
                    new ObjectIdentifier({
                        title: this.oUser.getFullName(),
                        text: this.oUser.getEmail()
                    }).addStyleClass("sapUshellUserPrefUserIdentifier"),
                    new List({
                        id: "userPrefEnteryList",
                        items: {
                            path: "/entries",
                            template: oEntryTemplate
                        },
                        customData: [
                            new AccessibilityCustomData({
                                key: "aria-label",
                                value: resources.i18n.getText("Settings_EntryList_label") + this.oUser.getFullName(),
                                writeToDom: true
                            })
                        ]
                    }).addEventDelegate({
                        onAfterRendering: function () {
                            // for each item in the list we need to add XRay help id
                            // for each item in the list we need to execute the relevant function to get the entry value
                            Core.byId("userPrefEnteryList").getItems().forEach(function (oItem) {
                                var sEntryPath = oItem.getBindingContext().getPath();
                                // we would like to set the current entry value in case valueResult property is null
                                var oModel = this.getModel();
                                if (!oModel.getProperty(sEntryPath + "/valueResult")) {
                                    this._setEntryValueResult(sEntryPath);
                                }
                                if (oModel && oModel.getProperty("/enableHelp")) {
                                    var sEntryHelpId = oModel.getProperty(sEntryPath + "/entryHelpID");

                                    if (sEntryHelpId) {
                                        oItem.addStyleClass("help-id-" + sEntryHelpId);
                                    }
                                }
                            }.bind(this));
                        }.bind(this)
                    })
                ],
                width: "100%"
            });
        }

        return this.oInitialContent;
    };

    UserPreferencesButton.prototype._setEntryValueResult = function (entryPath) {
        var oModel = this.getModel();
        var bIsEditable = oModel.getProperty(entryPath + "/editable");
        var vValueArgument = oModel.getProperty(entryPath + "/valueArgument");

        if (typeof vValueArgument === "function") {
            // Display "Loading..." and disable the entry until the value result is available
            oModel.setProperty(entryPath + "/valueResult", resources.i18n.getText("genericLoading"));
            oModel.setProperty(entryPath + "/editable", false);
            var oValuePromise = vValueArgument();

            oValuePromise.done(function (valueResult) {
                oModel.setProperty(entryPath + "/editable", bIsEditable);
                oModel.setProperty(entryPath + "/visible", typeof (valueResult) === "object" ? !!valueResult.value : true);
                oModel.setProperty(entryPath + "/valueResult", typeof (valueResult) === "object" ? valueResult.displayText : valueResult);
            });
            oValuePromise.fail(function () {
                oModel.setProperty(entryPath + "/valueResult", resources.i18n.getText("loadingErrorMessage"));
            });
        } else if (vValueArgument) { // if valueArgument is not null or undefined, we would like to present it
            oModel.setProperty(entryPath + "/valueResult", vValueArgument);
            oModel.setProperty(entryPath + "/editable", bIsEditable);
        } else { // in any other case (valueArgument is not function \ String \ Number \ Boolean)
            oModel.setProperty(entryPath + "/valueResult", resources.i18n.getText("loadingErrorMessage"));
        }
    };

    UserPreferencesButton.prototype._emitEntryOpened = function (entryPath) {
        var oUserSettingsEntriesToSave = EventHub.last("UserSettingsOpened") || {};
        var sPosition = entryPath.split("/").pop();
        oUserSettingsEntriesToSave[sPosition] = true;

        EventHub.emit("UserSettingsOpened", oUserSettingsEntriesToSave);
    };

    UserPreferencesButton.prototype._getUserPrefEntriesTemplate = function () {
        return new DisplayListItem({
            label: "{title}",
            value: "{valueResult}",
            tooltip: {
                path: "valueResult",
                formatter: function (valueResult) {
                    return typeof (valueResult) === "string" ? valueResult : "";
                }
            },
            type: {
                path: "editable",
                formatter: function (editable) {
                    return (editable === true) ? "Navigation" : "Inactive"; // Default is Inactive
                }
            },
            visible: {
                path: "visible",
                formatter: function (visible) {
                    return (visible !== undefined) ? visible : true;
                }
            },
            press: function (e) {
                var oEventObj = deepExtend({}, e);

                sap.ui.require([
                    "sap/m/FlexBox",
                    "sap/m/FlexAlignItems",
                    "sap/m/FlexJustifyContent",
                    "sap/m/BusyIndicator"
                ], function (FlexBox, FlexAlignItems, FlexJustifyContent, BusyIndicator) {
                    var sEntryLabel = oEventObj.getSource().getLabel();
                    var sEntryPath = oEventObj.getSource().getBindingContext().getPath();

                    var oModel = this.getModel();
                    oModel.setProperty("/activeEntryPath", sEntryPath);
                    oModel.setProperty("/isDetailedEntryMode", true);
                    oModel.setProperty("/dialogTitle", sEntryLabel);
                    var fnContentFunction = oModel.getProperty(sEntryPath + "/contentFunc");
                    var sContentId = oModel.getProperty(sEntryPath + "/contentResult");

                    this.oDialog.removeAllContent();
                    if (sContentId) {
                        var oContent = Core.byId(sContentId);
                        this.oDialog.addContent(oContent);
                        this._emitEntryOpened(sEntryPath);
                    } else if (typeof fnContentFunction === "function") {
                        var oBusyIndicator = null; // oBusyIndicator is initialized only when bShowBusyIndicator === true
                        var bShowBusyIndicator = true;
                        var bIsBusyIndicatorShown = false;
                        var isContentValid = true;
                        this._emitEntryOpened(sEntryPath);

                        fnContentFunction()
                            .done(function (contentResult) {
                                bShowBusyIndicator = false;
                                if (bIsBusyIndicatorShown === true) {
                                    this.oDialog.removeAllContent();
                                    oBusyIndicator.destroy(); // oBusyIndicator is destroyed only when it is actually presented
                                }

                                if (BaseObject.isA(contentResult, "sap.ui.core.Control")) {
                                    oModel.setProperty(sEntryPath + "/contentResult", contentResult.getId());
                                    this.oDialog.addContent(contentResult);
                                } else {
                                    isContentValid = false;
                                }
                            })
                            .fail(function () {
                                bShowBusyIndicator = false;
                                if (bIsBusyIndicatorShown === true) {
                                    this.oDialog.removeAllContent();
                                    oBusyIndicator.destroy(); // oBusyIndicator is destroyed only when it is actually presented
                                }
                                isContentValid = false;
                            })
                            .always(function () {
                                if (isContentValid === false) {
                                    var oErrorContent = new FlexBox({
                                        id: "userPrefErrorFlexBox",
                                        height: "5rem",
                                        alignItems: FlexAlignItems.Center,
                                        justifyContent: FlexJustifyContent.Center,
                                        items: [
                                            new Text({
                                                id: "userPrefErrorText",
                                                text: resources.i18n.getText("loadingErrorMessage")
                                            })
                                        ]
                                    });

                                    oModel.setProperty(sEntryPath + "/contentResult", oErrorContent.getId());
                                    this.oDialog.addContent(oErrorContent);
                                }
                            });

                        if (bShowBusyIndicator === true) {
                            oBusyIndicator = new BusyIndicator({
                                id: "userPrefLoadingBusyIndicator",
                                size: "2rem"
                            });
                            this.oDialog.addContent(oBusyIndicator);
                            bIsBusyIndicatorShown = true;
                        }
                    }
                }.bind(this));
            }.bind(this),
            customData: [
                new AccessibilityCustomData({
                    key: "aria-label",
                    value: {
                        parts: [
                            { path: "title" },
                            { path: "valueResult" }
                        ],
                        formatter: function (sTitle, sValue) {
                            sValue = sValue || "";
                            return sTitle + " " + sValue;
                        }
                    },
                    writeToDom: true
                })
            ]
        });
    };

    UserPreferencesButton.prototype.showUserPreferencesDialog = function () {
        this.oUser = sap.ushell.Container.getUser();
        this.createDialog();
        this.oDialog.open();
    };

    UserPreferencesButton.prototype._dialogBackButtonHandler = function (/*e*/) {
        var oModel = this.getModel();
        oModel.setProperty("/isDetailedEntryMode", false);
        oModel.setProperty("/dialogTitle", resources.i18n.getText("userSettings"));
        this.oDialog.removeAllContent();
        this.oDialog.addContent(this._getOriginalDialogContent());
        this._setEntryValueResult(oModel.getProperty("/activeEntryPath"));
        oModel.setProperty("/activeEntryPath", null);
    };

    UserPreferencesButton.prototype._destroyDialog = function () {
        this.oInitialContent.destroy();
        delete this.oInitialContent;

        var oModel = this.getModel();
        oModel.setProperty("/isDetailedEntryMode", false);
        oModel.setProperty("/dialogTitle", resources.i18n.getText("userSettings"));

        this._entriesCleanUp();

        this.oDialog.destroy();
        delete this.oDialog;
    };

    UserPreferencesButton.prototype._entriesCleanUp = function () {
        var oModel = this.getModel();
        var aEntries = oModel.getProperty("/entries");

        aEntries.forEach(function (oEntry) {
            // destroy entry content if exists
            var sContentResultId = oEntry.contentResult;
            delete oEntry.contentResult;
            if (sContentResultId) {
                var oContentResult = Core.byId(sContentResultId);
                oContentResult.destroy();
                oContentResult = null;
            }
            delete oEntry.valueResult;
        });

        // update the entries model with the clean array
        oModel.setProperty("/entries", aEntries);
    };

    UserPreferencesButton.prototype._dialogSaveButtonHandler = function () {
        var oModel = this.getModel();

        // in case the save button is pressed in the detailed entry mode, there is a need to update value result in the model
        var isDetailedEntryMode = oModel.getProperty("/isDetailedEntryMode");
        if (isDetailedEntryMode) {
            oModel.setProperty("/activeEntryPath", null);
        }

        var aEntries = oModel.getProperty("/entries");
        oUiUtils.saveUserPreferenceEntries(aEntries)
            .done(function () {
                sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                    var message = resources.i18n.getText("savedChanges");

                    MessageToast.show(message, {
                        duration: 3000,
                        width: "15em",
                        my: "center bottom",
                        at: "center bottom",
                        of: window,
                        offset: "0 -50",
                        collision: "fit fit"
                    });
                });
            })
            .fail(function (failureMsgArr) {
                var sErrMessageText;
                var sErrMessageLog = "";

                if (failureMsgArr.length === 1) {
                    sErrMessageText = resources.i18n.getText("savingEntryError") + " ";
                } else {
                    sErrMessageText = resources.i18n.getText("savingEntriesError") + "\n";
                }
                failureMsgArr.forEach(function (errObject) {
                    sErrMessageText += errObject.entry + "\n";
                    sErrMessageLog += "Entry: " + errObject.entry + " - Error message: " + errObject.message + "\n";
                });

                sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
                    oMessageService.error(sErrMessageText, resources.i18n.getText("Error"));
                });

                Log.error(
                    "Failed to save the following entries",
                    sErrMessageLog,
                    "sap.ushell.ui.footerbar.UserPreferencesButton"
                );
            });
        this.oDialog.close();
        this._destroyDialog();
    };

    UserPreferencesButton.prototype._dialogCancelButtonHandler = function () {
        var aEntries = this.getModel().getProperty("/entries");

        // Invoke onCancel function for each userPreferences entry
        aEntries.forEach(function (oEntry) {
            if (oEntry && oEntry.onCancel) {
                oEntry.onCancel();
            }
        });

        this.oDialog.close();
        this._destroyDialog();
    };

    return UserPreferencesButton;
});
