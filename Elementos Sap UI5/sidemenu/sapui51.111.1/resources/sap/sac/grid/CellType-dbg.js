/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(
  [],
  function () {
    "use strict";
    /**
     * Types of a grid cell.
     *
     * @enum {string}
     * @alias sap.sac.grid.CellType
     * @public
     * @experimental
     */
    var CellType = {
      /**
       * A header cell, representing a member of a (virtual) dimension
       * @public
       */
      HEADER: "Header",
      /**
       * A title cell, representing a dimension
       * @public
       **/
      TITLE: "Title",
      /**
       * A result cell, representing an aggregated value
       * @public
       **/
      RESULT: "Result",
      /**
       * A result cell, representing an aggregated value with a positive flavour
       * @public
       **/
      RESULT_POSITIVE: "ResultPositive",
      /**
       * A virtual member of a dimension indicating an aggregation of members
       * @public
       **/
      RESULT_HEADER: "ResultHeader",
      /**
       * A result cell, representing an aggregated value with a negative flavour
       * @public
       **/
      RESULT_NEGATIVE: "ResultNegative",
      /**
       * A result cell, representing an aggregated value with a critical flavour
       * @public
       **/
      RESULT_CRITICAL: "ResultCritical",
      /**
       * A data cell, representing  value with a positive flavour
       * @public
       **/
      POSITIVE: "Positive",
      /**
       * A data cell, representing  value with a negative flavour
       * @public
       **/
      NEGATIVE: "Negative",
      /**
       * A data cell, representing  value with a critical flavour
       * @public
       **/
      CRITICAL: "Critical",
      /**
       * A data cell, representing  value
       * @public
       **/
      STANDARD: "Standard",
      /**
       * An empty data cell
       * @public
       **/
      EMPTY: "Empty"
    };
    return CellType;
  });
