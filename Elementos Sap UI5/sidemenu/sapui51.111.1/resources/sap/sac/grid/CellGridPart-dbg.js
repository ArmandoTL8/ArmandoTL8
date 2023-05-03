/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(
  [],
  function () {
    "use strict";
    /**
     * Part of the grid in which a <code>cell</code> resides.
     *
     * @enum {string}
     * @alias sap.sac.grid.CellGridPart
     * @public
     * @experimental
     */
    var CellGridPart = {
      /**
       * Cell is rendered in the rows section (header/title)
       * @public
       **/
      Rows: "Rows",
      /**
       * Cell is rendered in the columns section (header/title)
       * @public
       **/
      Columns: "Columns",
      /**
       * Cell is rendered in the data section
       * @public
       **/
      Data: "Data",
      /**
       * Cell is rendered in the intersection between row titles and column titles section
       * @public
       **/
      Mixed: "Mixed",
      /**
       * Cell is in the empty section
       * @public
       **/
      Empty: "Empty"
    };
    return CellGridPart;
  }
);
