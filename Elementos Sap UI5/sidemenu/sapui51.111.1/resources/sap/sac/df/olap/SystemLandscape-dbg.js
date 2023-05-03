/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/olap/SystemLandscape", [], function () {
    return {
      Systems: [
        {
          systemName: "localBW",
          systemType: "BW",
          protocol: window.location.protocol === "http:" ? "HTTP" : "HTTPS",
          port: window.location.port,
          host: window.location.hostname,
          authentication: "NONE"
        },
        {
          systemName: "localHana",
          systemType: "HANA",
          protocol: window.location.protocol === "http:" ? "HTTP" : "HTTPS",
          host: window.location.hostname,
          port: window.location.port,
          authentication: "NONE"
        },
        {
          systemName: "localDWC",
          systemType: "DWC",
          protocol: window.location.protocol === "http:" ? "HTTP" : "HTTPS",
          host: window.location.hostname,
          port: window.location.port,
          path: "lcs/dwc",
          authentication: "NONE"
        }
      ]
    };
  });
