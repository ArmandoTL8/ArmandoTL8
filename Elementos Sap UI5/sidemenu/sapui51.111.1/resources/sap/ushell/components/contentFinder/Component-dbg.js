//Copyright (c) 2009-2022 SAP SE, All Rights Reserved
/**
 * @fileOverview ContentFinder Component
 * This UIComponent gets initialized by the FLP renderer upon opening a contentFinder instance
 * (visiting a work page if work pages are enabled (/core/workPages/enabled).
 *
 * @version 1.111.1
 */

sap.ui.define([
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/ui/core/Core",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/UIComponent"
], function (Button, Dialog, Core, XMLView, UIComponent) {
    "use strict";

    /**
     * Component of the ContentFinder view.
     *
     * @param {string} sId Component id
     * @param {object} mSettings Optional Map object for Component settings
     *
     * @class
     * @extends sap.ui.core.UIComponent
     *
     * @private
     * @since 1.111.0
     * @alias sap.ushell.components.contentFinder.Component
     */
    return UIComponent.extend("sap.ushell.components.contentFinder.Component", /** @lends sap.ushell.components.contentFinder.Component */{
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.oEventBus = Core.getEventBus();
            this.oRootView = this.getRootControl();
            this.rootControlLoaded().then(function () {
                this.oNavContainer = this.oRootView.byId("contentFinderNavContainer");
                this.oContentFinderWidgetGalleryPage = this.oRootView.byId("contentFinderWidgetGalleryPage");
                this.oContentFinderAppSearchPage = this.oRootView.byId("contentFinderAppSearchPage");
                this.oDialog = this.oRootView.byId("contentFinderDialog");
            }.bind(this));
        },

        show: function (sTarget) {
            if (sTarget === "widgetGallery") {
                this.oNavContainer.to(this.oContentFinderWidgetGalleryPage);
                this.oDialog.getBeginButton().setVisible(false);
            } else if (sTarget === "appSearch") {
                this.oNavContainer.to(this.oContentFinderAppSearchPage);
                this.oDialog.getBeginButton().setVisible(true);
            }
            this.oDialog.open();
        }
    });
});
