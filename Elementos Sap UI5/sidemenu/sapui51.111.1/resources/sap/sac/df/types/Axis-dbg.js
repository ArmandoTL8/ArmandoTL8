/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/types/Axis",
  [
  ],
  function(){
    /**
     * Axis of a multidimensional Result Set
     *
     * @enum {string}
     * @alias sap.sac.df.types.Axis
     * @private
     */
    var Axis = {
      /**
       * Row axis (vertical direction in a Grid)
       * @public
       **/
      Rows: "Rows",
      /**
       * Columns axis (horizontal direction in a Grid)
       * @public
       **/
      Columns: "Columns",
      /**
       * Free axis (contains all dimensions that can be placed on the row/column axis)
       * @public
       **/
      Free: "Free",
      /**
       * Repository axis (contains all dimensions that cannot be placed on the row/column axis,
       * but are used in the variables/parameters of the query assigned to a dataprovider aggregated
       * in the <code>sap.sac.df.OlapModel</code>)
       * @public
       **/
      Repository: "Repository"
    };
    return Axis;
  }
);
