/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";
  /**
   * Alert Level.
   *
   * @enum {string}
   * @alias sap.sac.grid.AlertLevel
   * @public
   * @experimental
   */
  var AlertLevel = {
    /**
     * Normal
     * @public
     */
    NORMAL: "0",
    /**
     * Good 1
     * @public
     */
    GOOD_1: "1",
    /**
     * Good 2
     * @public
     */
    GOOD_2: "2",
    /**
     * Good 3
     * @public
     */
    GOOD_3: "3",
    /**
     * Critical 1
     * @public
     */
    CRITICAL_1: "4",
    /**
     * Critical 2
     * @public
     */
    CRITICAL_2: "5",
    /**
     * Critical 3
     * @public
     */
    CRITICAL_3: "6",
    /**
     * Bad 1
     * @public
     */
    BAD_1: "7",
    /**
     * Bad 2
     * @public
     */
    BAD_2: "8",
    /**
     * Bad 3
     * @public
     */
    BAD_3: "9"
  };
  return AlertLevel;
}
);
