// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @file Controller for ContentFinder view
 * @version 1.111.1
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (
    Controller
) {

    "use strict";

    return Controller.extend("sap.ushell.components.contentFinder.controller.ContentFinderDialog", {
        /**
         * The init function called after the view is initialized
         * @since 1.111.0
         * @private
         */
        onInit: function () {

        },

        /**
         * The hide function called when the 'Cancel' button is pressed
         * @since 1.111.0
         * @param {sap.ui.base.Event} oEvent The event data provided by the sap.m.Button
         * @ui5-restricted sap.ushell
         * @private
         */
        hide: function (oEvent) {
            oEvent.getSource().getParent().close();
            this.oEventBus.publish("contentFinderCancel");
        }

    });
});
