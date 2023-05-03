// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/library",
    "sap/m/library"
], function (
    coreLib,
    mLib
) {
    "use strict";

    /**
     * SAP library: sap.ushell_abap
     * provides base functions for Fiori launchpad running on SAP NetWeaver ABAP
     *
     * @namespace
     * @name sap.ushell_abap
     * @author SAP SE
     * @version 1.111.1
     * @private
     * @ui5-restricted
     */
    var ushellAbapLib = sap.ui.getCore().initLibrary({
        name: "sap.ushell_abap",
        version: "1.111.1",
        dependencies: ["sap.ui.core", "sap.m"],
        noLibraryCSS: true,
        extensions: {
            "sap.ui.support": {
                diagnosticPlugins: [
                    "sap/ushell_abap/support/plugins/app-infra/AppInfraOnSapNetWeaverSupportPlugin"
                ]
            }
        }
    });

    return ushellAbapLib;
});
