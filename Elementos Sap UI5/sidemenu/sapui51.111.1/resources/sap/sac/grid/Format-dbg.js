/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(
  "sap/sac/grid/Format", [],
  function () {
    "use strict";
    /**
     * Format to be applied to a <code>Grid</code>
     *
     * @enum {string}
     * @alias sap.sac.grid.Format
     * @public
     * @experimental
     */
     var Format = {
      /**
       * Basic grid format
       * @public
       **/
      Basic: "Basic",
      /**
       * mimicking spreadsheet
       * @public
       **/
      ExcelStyle: "ExcelStyle",
      /**
       * business style
       * @public
       **/
      BusinessStyle: "BusinessStyle",
      /**
       * busines formular style
       * @public
       **/
      BusinessStyleFormular: "BusinessStyleFormular",
      /**
       * custom style
       * @public
       **/
       CustomStyle: "CustomStyle"
    };
    return Format;
  });
