/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(
  "sap/sac/grid/library", [
  "sap/sac/grid/CellType",
  "sap/sac/grid/SemanticStyle",
  "sap/sac/grid/Format",
  "sap/sac/grid/AlertLevel"],
  function (
    CellType, SemanticStyle, Format, AlertLevel
  ) {
    "use strict";
    /**
     * The sac UI5 library
     *
     * @namespace
     * @alias sap.sac.grid
     * @author SAP SE
     * @version 1.111.0
     * @public
     */
    var thisLib = sap.ui.getCore().initLibrary(
      {
        name: "sap.sac.grid",
        version: "1.111.0",
        dependencies: [
          "sap.m",
          "sap.ui.core"
        ],
        types: [
          "sap.sac.grid.AlertLevel",
          "sap.sac.grid.CellType",
          "sap.sac.grid.Format"
        ],
        interfaces: [],
        controls: [
          "sap.sac.grid.Grid"
        ],
        elements: [
          "sap.sac.grid.Cell", "sap.sac.grid.SemanticStyle"
        ]
      }
    );
    thisLib.CellType = CellType;
    thisLib.AlertLevel = AlertLevel;
    thisLib.SemanticStyle = SemanticStyle;
    thisLib.Format = Format;
    return thisLib;
  }, /* bExport= */ false);
