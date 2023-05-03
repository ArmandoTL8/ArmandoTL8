/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var GridRenderer = {
    apiVersion: 2
  };

  GridRenderer.render = function (oRm, oControl) {
    oRm.openStart("div", oControl);
    oRm.attr("data-sap-ui-fastnavgroup", "true");
    oRm.style("width", "100%");
    oRm.style("height", "100%");
    oRm.openEnd();
    oRm.close("div");
  };

  return GridRenderer;
});
