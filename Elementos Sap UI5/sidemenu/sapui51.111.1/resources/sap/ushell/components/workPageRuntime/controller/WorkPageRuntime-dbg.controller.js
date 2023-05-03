//Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @file WorkPageRuntime controller for WorkPageRuntime view
 * @version 1.111.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/workPageRuntime/services/WorkPage",
    "sap/base/util/deepExtend",
    "sap/ushell/EventHub",
    "sap/ushell/components/pages/controller/PagesAndSpaceId",
    "sap/ushell/resources",
    "sap/ushell/Config",
    "sap/base/util/ObjectPath"
], function (
    Log,
    Controller,
    WorkPageService,
    deepExtend,
    EventHub,
    PagesAndSpaceId,
    resources,
    Config,
    ObjectPath
) {
    "use strict";

    /**
     * Controller of the WorkPageRuntime view
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameters
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.99.0
     * @alias sap.ushell.components.workPageRuntime.controller.WorkPages
     */
    return Controller.extend("sap.ushell.components.workPageRuntime.controller.WorkPageRuntime", /** @lends sap.ushell.components.workPageRuntime.controller.WorkPageRuntime.prototype */ {
        /**
         * UI5 lifecycle method which is called upon controller initialization.
         * @return {Promise} Promise that resolves if method is successful
         * @private
         * @since 1.99.0
         */
        onInit: function () {
            var oRenderer = sap.ushell.Container.getRenderer();
            var oUrlParams = new URLSearchParams(window.location.search);

            this.oWorkPageService = new WorkPageService();
            this.oWorkPageNavContainer = this.byId("workpageNavContainer");
            this.oEmptyPage = this.byId("emptyPage");

            this._oWorkPageBuilderComponentCreatedPromise = new Promise(function (resolve, reject) {
                this._oWorkPageBuilderComponentResolve = resolve;
                this._oWorkPageBuilderComponentReject = reject;
            }.bind(this));

            return this._getPageId()
                .then(function (sPageId) {
                    this._sPageId = sPageId;
                    this._sSiteId = oUrlParams.get("siteId") || Config.last("/core/site/siteId");
                    this._bWorkPageIsDirty = false;

                    var oAttachEventPromise = this._oWorkPageBuilderComponentCreatedPromise.then(function (oComponent) {
                        oComponent.attachEvent("workPageEdited", this._onWorkPageChanged.bind(this, true));
                        oComponent.attachEvent("visualizationFilterApplied", this._loadFilteredVisualizations.bind(this));
                        oComponent.attachEvent("closeEditMode", this._closeEditMode.bind(this));
                    }.bind(this));

                    var oWorkPageLoadPromise = this._onWorkPageLoad()
                        .finally(function () {
                            // Required to load the core-ext bundles to enable menubar, usersettings, search, ...
                            EventHub.emit("CenterViewPointContentRendered");

                            if (!this.getOwnerComponent().getNavigationDisabled()) {
                                this.oContainerRouter = oRenderer.getRouter();
                                this.oContainerRouter.getRoute("home").attachMatched(this.onRouteMatched.bind(this, false));
                                this.oContainerRouter.getRoute("openFLPPage").attachMatched(this.onRouteMatched.bind(this, false));
                            }
                        }.bind(this));

                    return Promise.all([
                        oAttachEventPromise,
                        oWorkPageLoadPromise
                    ]);
                }.bind(this))
                .catch(this._handleErrors.bind(this));
        },

        /**
         * On first rendering of the page
         * @param {boolean} bEditable Flag if the WorkPage is allowed to be edited.
         * @return {Promise} Promise Resolves if operation is successful
         * @private
         *
         */
        _handleEditModeButton: function (bEditable) {
            var bPageIsEditable = bEditable; // Editable property comes from server
            var bIsAdminUser = sap.ushell.Container.getUser().isAdminUser(); // The flag comes from the server, too.
            if (bPageIsEditable && bIsAdminUser) {
                return this._createEditModeButton(
                    this._createEditButtonControlProperties()
                );
            }
            this._hideEditModeButton();
            return Promise.resolve();
        },

        /**
         * Called when the user has changed the work page during editing or the dirty state is cleared.
         * @param {boolean} bChanged If the page was changed after last save
         * @private
         *
         */
        _onWorkPageChanged: function (bChanged) {
            this._bWorkPageIsDirty = !!bChanged;
            sap.ushell.Container.setDirtyFlag(!!bChanged);
        },

        /**
         * Navigates to the WorkPage page in the NavContainer.
         *
         * @private
         */
        _navigate: function () {
            this.oWorkPageNavContainer.to(this.byId("workPage"));
        },

        /**
         * Create control properties for edit button
         * @returns {Object} control properties for the edit button
         * @private
         */
        _createEditButtonControlProperties: function () {
            var sButtonText = resources.i18n.getText("WorkpageRuntime.EditMode.Activate");
            Log.debug("cep/editMode: create Edit Button", "Workpage runtime");
            return {
                id: "EditModeBtn",
                text: sButtonText,
                icon: "sap-icon://edit",
                press: [this.pressEditModeButton, this]
            };
        },

        /**
         * Creates the edit button or sets visibility to true if it exists
         * @param {Object} oEditButtonObjectData UI data for edit button
         * @return {Promise} Promise Resolves if operation is successful
         * @private
         *
         */
        _createEditModeButton: function (oEditButtonObjectData) {
            var oAddEditButtonParameters = {
                controlType: "sap.ushell.ui.launchpad.ActionItem",
                oControlProperties: oEditButtonObjectData,
                bIsVisible: true,
                aStates: ["home"]
            };
            this._showEditModeButton();
            return sap.ushell.Container
                .getRenderer("fiori2")
                .addUserAction(oAddEditButtonParameters)
                .then(function (oEditButton) {
                    // if xRay is enabled
                    if (Config.last("/core/extension/enableHelp")) {
                        oEditButton.addStyleClass("help-id-EditModeBtn");// xRay help ID
                    }
                });
        },

        /**
         * Sets the text ID for the edit button
         * @param {String} sTextId Text ID
         * @private
         */
        _setEditButtonText: function (sTextId) {
            if (sTextId) {
                var oEditModeButton = sap.ui.getCore().byId("EditModeBtn");
                if (oEditModeButton) {
                    var sEditModeText = resources.i18n.getText(sTextId);
                    oEditModeButton.setText(sEditModeText);
                    oEditModeButton.setTooltip(sEditModeText);
                }
            }
        },

        /**
         * Toggles the edit mode via the user menu
         * Toggles the text of the edit menu entry
         * @private
         */
        pressEditModeButton: function () {
            // If edit mode and there are changes
            if (this._oWorkPageBuilderComponent.getEditMode()) {
                if (this._bWorkPageIsDirty) {
                    this._saveChanges(); // Save and exit
                } else {
                    this._toggleEditMode(false); // No changes, exit directly
                }
            } else {
                this._toggleEditMode(true); // Activate editing mode
            }
        },

        /**
         * Toggles the edit mode according to the given bEditMode argument.
         *
         * @param {boolean} bEditMode Boolean indicating if editMode should be entered or left.
         * @private
         */
        _toggleEditMode: function (bEditMode) {
            EventHub.emit("enableMenuBarNavigation", !bEditMode);
            Log.debug("cep/editMode: toggle edit mode", " Work Page runtime");
            this._oWorkPageBuilderComponent.setEditMode(bEditMode);
            this._setEditButtonText(
                bEditMode ? "PageRuntime.EditMode.Exit" : "WorkpageRuntime.EditMode.Activate"
            );
            // Clear the dirty flag when start or done with editing.
            this._onWorkPageChanged(false);
        },

        /**
         * Cancel any changes when the user pressed Cancel in Editing Mode and close editing.
         *
         * @private
         */
        _cancelChanges: function () {
            this._toggleEditMode(false);
            this._oWorkPageBuilderComponent.setPageData(deepExtend({}, this._oOriginalData));
        },

        /**
         * Save changes when the user pressed Save in Editing Mode and close editing.
         * @return {Promise} A promise resolving when the WorkPage has been updated.
         * @private
         */
        _saveChanges: function () {
            var oView = this.getView();
            oView.setBusy(true);
            return this._updateWorkPage()
                .then(function (oData) {
                    // Show message and update workpage builder.
                    sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                        MessageToast.show(resources.i18n.getText("savedChanges"), { duration: 4000 });
                    });
                    this._toggleEditMode(false);
                    this._oOriginalData = deepExtend({}, oData);
                    this._oWorkPageBuilderComponent.setPageData(oData);
                }.bind(this))
                .catch(function (oError) {
                    // Show error message
                    var sErrorMsg = oError.responseText || oError;
                    sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                        MessageBox.error(sErrorMsg, {
                            title: oError.statusText
                        });
                    });
                })
                .finally(function () {
                    oView.setBusy(false);
                });
        },

        /**
         * Closes the edit mode.
         *
         * @param {sap.base.Event} oEvent Event indicating if the changes have to be saved.
         * @private
         */
        _closeEditMode: function (oEvent) {
            (oEvent.getParameter("saveChanges") ? this._saveChanges : this._cancelChanges).bind(this)();
        },

        /**
         * @param {sap.base.Event} oEvent The "onWorkPageBuilderCreated" event.
         */
        onWorkPageBuilderCreated: function (oEvent) {
            this._oWorkPageBuilderComponent = oEvent.getParameter("component");
            this._oWorkPageBuilderComponent.setShowFooter(true);
            this._oWorkPageBuilderComponentResolve(this._oWorkPageBuilderComponent);
        },

        /**
         * Loads the available visualizations. If the "Type" filter is present, apply the given filter value.
         *
         * @param {sap.ui.base.Event} oEvent The "visualizationFilterApplied" event.
         * @return {Promise} A promise resolving when the resulting visualizations have been set to the WorkPageBuilder
         * @private
         */
        _loadFilteredVisualizations: function (oEvent) {
            var aFilters = oEvent.getParameter("filters") || [];
            var oTypeFilter;
            var aTypeFilterValues = [];

            if (aFilters.length > 0) {
                oTypeFilter = aFilters.find(function (oFilter) { return oFilter.filterKey === "Type"; });
                if (oTypeFilter && oTypeFilter.filterValue && oTypeFilter.filterValue.length > 0) {
                    aTypeFilterValues = oTypeFilter.filterValue;
                }
            }

            return this.oWorkPageService.loadFilteredVisualizations("", aTypeFilterValues).then(function (oVizNodes) {
                this._oWorkPageBuilderComponent.setVisualizationData(oVizNodes);
            }.bind(this));
        },

        /**
         * Saves the WorkPage on the backend after editing.
         * @return {Promise<{ WorkPage: {UsedVisualizations: { nodes: object[] }, Editable: boolean}}>} Promise resolving with the updated data.
         * @private
         */
        _updateWorkPage: function () {
            var oPageData = this._oWorkPageBuilderComponent.getPageData();
            var oWorkPageDataCopy = deepExtend({ Id: this._sPageId }, oPageData);
            return this.oWorkPageService.updateWorkPage(this._sPageId, ObjectPath.get("WorkPage.Contents", oWorkPageDataCopy));
        },

        /**
         * Hides the edit mode button
         *
         * @private
         * @since 1.107.0
         */
        _hideEditModeButton: function () {
            var oEditModeButton = sap.ui.getCore().byId("EditModeBtn");
            Log.debug("cep/editMode: hide Edit Mode button", "Work Page runtime");
            if (oEditModeButton) {
                oEditModeButton.setVisible(false);
            }
        },
        /**
         * Shows the edit mode button.
         *
         * @private
         * @since 1.107.0
         */
        _showEditModeButton: function () {
            var oEditModeButton = sap.ui.getCore().byId("EditModeBtn");
            Log.debug("cep/editMode: show Edit Mode button", "Work Page runtime");
            if (oEditModeButton) {
                oEditModeButton.setVisible(true);
            }
        },

        /**
         * Handles errors.
         * Hides the edit button.
         * Navigates to the error page.
         *
         * @param {object|string} vError An error object or string.
         * @private
         */
        _handleErrors: function (vError) {
            this._hideEditModeButton();
            Log.error("An error occurred while loading the page", vError);
            Log.debug("cep/editMode: on Route matched: Handle errors", "Work Page runtime");
            this.oWorkPageNavContainer.to(this.byId("errorPage"));
        },

        /**
         * Called by the runtime switcher if the Launchpad-openFLPPage route is matched and the page type is work page.
         *
         * @return {Promise} Resolves when the data has been loaded.
         * @private
         */
        onRouteMatched: function () {
            Log.debug("cep/editMode: on Route matched", "Work Page runtime");

            return this._getPageId()
                .then(function (sPageId) {
                    this._sPageId = sPageId;
                    return this._onWorkPageLoad();
                }.bind(this))
                .catch(this._handleErrors.bind(this));
        },

        /**
         * Called if a new WorkPage is loaded. This can either happen on a fresh reload, or on navigation to a WorkPage.
         * In both cases:
         * - Load the data from the server.
         * - Save a copy of the data to restore it later.
         * - Call 'setPageData' on the WorkPageBuilder component to render the WorkPage.
         * - Navigate the NavContainer to the "workpage" Page in case a different page is currently shown.
         * - Update the "Customize Page" button according to the Editable property.
         *
         * @returns {Promise} A Promise resolving when the data has been loaded and all the steps have been taken.
         * @private
         */
        _onWorkPageLoad: function () {
            this._oLoadWorkPageAndVisualizationsPromise = this.oWorkPageService.loadWorkPageAndVisualizations(this._sSiteId, this._sPageId);
            return Promise.all([
                this._oWorkPageBuilderComponentCreatedPromise,
                this._oLoadWorkPageAndVisualizationsPromise
            ]).then(function (oResult) {
                var oComponent = oResult[0];
                var oData = oResult[1];

                this._oOriginalData = deepExtend({}, oData);

                oComponent.setPageData(oData);

                this._navigate();
                return this._handleEditModeButton(oData.WorkPage.Editable);
            }.bind(this));
        },

        /**
         * Resolves with the MyHome pageId if it exists,
         * otherwise resolved the pageId from the hash or the default pageId.
         *
         * @return {Promise<string>} Promise resolving to the pageId string.
         * @private
         */
        _getPageId: function () {
            if (Config.last("/core/workPages/myHome/pageId")) {
                return Promise.resolve(Config.last("/core/workPages/myHome/pageId"));
            }
            return PagesAndSpaceId._getPageAndSpaceId()
                .then(function (oResult) { return oResult.pageId; });
        },

        /**
         * Hides the runtime.
         */
        hideRuntime: function () {
            Log.debug("cep/editMode: navigate to empty page", "Page runtime");
            this._hideEditModeButton();
            this.oWorkPageNavContainer.to(this.oEmptyPage);
        }
    });
});
