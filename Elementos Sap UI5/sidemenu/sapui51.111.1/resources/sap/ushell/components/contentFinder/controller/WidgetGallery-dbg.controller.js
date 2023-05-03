// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @file Controller for WidgetGallery view
 * @version 1.111.1
 */
sap.ui.define([
    "./ContentFinderDialog.controller"
], function (
    ContentFinderController
) {
    "use strict";

    /**
     * Controller of the WidgetGallery view.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameters
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.111.0
     * @alias sap.ushell.components.contentFinder.controller.WidgetGallery
     */
    return ContentFinderController.extend("sap.ushell.components.contentFinder.controller.WidgetGallery", {
        /**
         * Initializes the controller instance after the view is initialized. Only to be called once.
         * @since 1.111.0
         * @private
         */
        onInit: function () {}
    });
});
