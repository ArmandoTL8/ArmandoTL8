// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define([
    "./boottask",
    "sap/ushell_abap/pbServices/ui2/contracts/bag",
    "sap/ushell_abap/pbServices/ui2/contracts/configuration",
    "sap/ushell_abap/pbServices/ui2/contracts/configurationUi",
    "sap/ushell_abap/pbServices/ui2/contracts/fullscreen",
    "sap/ushell_abap/pbServices/ui2/contracts/preview",
    "sap/ushell_abap/pbServices/ui2/contracts/visible",
    "sap/ushell_abap/pbServices/ui2/contracts/refresh",
    "sap/ushell_abap/pbServices/ui2/contracts/search",
    "sap/ushell_abap/pbServices/ui2/contracts/url",
    "sap/ushell_abap/pbServices/ui2/contracts/actions",
    "sap/ushell_abap/pbServices/ui2/contracts/types"
], function (
    Boottask
    /*
    ui2ContractsBag,
    ui2Configuration,
    ui2ConfigurationUi,
    ui2Fullscreen,
    ui2Preview,
    ui2Visible,
    ui2Refresh,
    ui2Search,
    ui2Url,
    ui2Actions,
    ui2Types
    */
) {
    "use strict";
    return function () {
        sap.ui.require(["sap/ushell/iconfonts"], function (IconFonts) {
            window.sap.ushell.Container.createRenderer("fiori2", true).then(
                function (oContent) {
                    oContent.placeAt("canvas", "only");
                }
            );
            IconFonts.registerFiori2IconFont();
        });
        Boottask.afterBootstrap();
    };
});
