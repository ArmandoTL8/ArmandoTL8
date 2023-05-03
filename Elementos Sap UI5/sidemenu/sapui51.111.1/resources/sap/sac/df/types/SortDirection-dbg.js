/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/types/SortDirection",
  [
  ],
  function(){
    /**
     * Sort Direction
     *
     * @enum {string}
     * @alias sap.sac.df.types.SortDirection
     * @private
     */
    var SortDirection = {
      /**
       * Ascending
       * @public
       **/
      ASCENDING: "ASCENDING",
      /**
       * Descending
       * @public
       **/
      DESCENDING: "DESCENDING",
      /**
       * No sorting
       * @public
       **/
      NONE: "NONE"
    };
    return SortDirection;
  }
);
