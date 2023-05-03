/*!
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
/*global sap */
sap.ui.define(
  "sap/zen/dsh/ValueHelpRangeOperation",
  [
  ],
  function(){
    /**
     * Sort Type
     *
     * @enum {string}
     * @alias sap.zen.dsh.ValueHelpRangeOperation
     * @public
     * @experimental
     * @deprecated since 1.89
     */
    var ValueHelpRangeOperation = {
      /**
       * The Between operation for the ranges.
       *
       * @public
       */
      BT: "BT",
      /**
       * The Equals operation for the ranges.
       *
       * @public
       */
      EQ: "EQ",
      /**
       * The Contains operation for the ranges.
       *
       * @public
       */
      Contains: "Contains",
      /**
       * The StartsWith operation for the ranges.
       *
       * @public
       */
      StartsWith: "StartsWith",
      /**
       * The EndsWith operation for the ranges.
       *
       * @public
       */
      EndsWith: "EndsWith",
      /**
       * The Less operation for the ranges.
       *
       * @public
       */
      LT: "LT",
      /**
       * The Less or equals operation for the ranges.
       *
       * @public
       */
      LE: "LE",
      /**
       * The Greater operation for the ranges.
       *
       * @public
       */
      GT: "GT",
      /**
       * The Between or equals operation for the ranges.
       *
       * @public
       */
      GE: "GE",
      /**
       * The Initial operation for the ranges.
       *
       * @private
       */
      Initial: "Initial"
    };
    return ValueHelpRangeOperation;
  }
);