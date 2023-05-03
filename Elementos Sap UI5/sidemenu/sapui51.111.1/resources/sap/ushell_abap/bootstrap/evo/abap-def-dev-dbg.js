// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define([
    "./abap.configure.ushell",
    "./abap.load.launchpad",
    "./boottask",
    "sap/ushell/bootstrap/common/common.configure.ui5",
    "sap/ushell/bootstrap/common/common.configure.ui5.extractLibs",
    "sap/ushell/bootstrap/common/common.debug.mode",
    "sap/ushell/bootstrap/common/common.load.bootstrapExtension"
], function (
    fnConfigureUshell,
    fnLoadLaunchpad,
    oBoottask,
    fnConfigureUi5,
    fnExtractUi5LibsFromUshellConfig,
    oDebugMode,
    fnLoadBootstrapExtension
) {
    "use strict";

    var oUShellConfig;

    window["sap-ui-debug"] = oDebugMode.isDebug(); //use in LaunchPageAdapter
    oUShellConfig = fnConfigureUshell();
    fnConfigureUi5({
        ushellConfig: oUShellConfig,
        libs: fnExtractUi5LibsFromUshellConfig(oUShellConfig),
        theme: "sap_fiori_3",
        platform: "abap",
        platformAdapters: {
                abap: "sap.ushell_abap.adapters.abap",
                hana: "sap.ushell_abap.adapters.hana"
            },
        bootTask: oBoottask.start,
        onInitCallback: fnLoadLaunchpad
    });

    fnLoadBootstrapExtension(oUShellConfig);
});
