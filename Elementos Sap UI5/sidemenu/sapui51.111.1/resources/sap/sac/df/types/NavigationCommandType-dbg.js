/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
  "sap/sac/df/types/NavigationCommandType",
  [],
  function () {
    "use strict";
    /**
     * Types of navigation commands.
     *
     * @enum {string}
     * @alias sap.sac.df.types.NavigationCommandType
     * @public
     */
    var NavigationCommandType = {
      /**
       * Hierachy drill operation
       * @public
       **/
      HierarchyNavigation: "HierarchyNavigation",
      /**
       * Click on a cell
       * @public
       **/
      CellClick: "CellClick",
      /**
       * Context menu entry
       * @public
       **/
      ContextMenuCmd: "ContextMenuCmd",
      /**
       * request for additional rows
       * @public
       **/
      RowRequest: "RowRequest",
      /**
       * request for additional columns
       * @public
       **/
      ColumnRequest: "ColumnRequest"
    };
    return NavigationCommandType;
  }
);
