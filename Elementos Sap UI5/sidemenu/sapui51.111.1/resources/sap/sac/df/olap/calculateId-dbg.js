/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/olap/calculateId",
  [],
  function () {
    "use strict";
    var nCount = 0;
    return function () {
      return ++nCount;
    };
  }
);
