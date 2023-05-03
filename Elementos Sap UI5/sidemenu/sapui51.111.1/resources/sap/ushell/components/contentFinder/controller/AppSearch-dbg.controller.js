// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @file AppSearch controller for AppSearch view
 * @version 1.111.1
 */
sap.ui.define([
    "./ContentFinderDialog.controller"
], function (
    ContentFinderController
) {
    "use strict";

    /**
     * Controller of the AppSearch view.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameters
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.111.0
     * @alias sap.ushell.components.contentFinder.controller.AppSearch
     */
    return ContentFinderController.extend("sap.ushell.components.contentFinder.controller.AppSearch", {
        /**
         * The init function called after the view is initialized
         * @since 1.111.0
         * @private
         */
        onInit: function () { }
    });
});
