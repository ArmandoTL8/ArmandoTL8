/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
  [
    "sap/base/Log",
    "sap/sac/df/firefly/ff2210.ui.native",
    "sap/sac/df/firefly/ff4410.olap.ip.providers",
    "sap/sac/df/firefly/ff4330.olap.catalog.impl",
    "sap/sac/df/firefly/ff4340.olap.reference",
    "sap/sac/df/firefly/ff8010.olap.ui",
    "sap/sac/df/firefly/ff8050.application.ui"
  ],function(
    Log
  ){
    Log.info("Firefly loaded");
    return sap.firefly;
  }
);
