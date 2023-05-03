/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/
sap.ui.define(
  "sap/sac/df/utils/ApplicationHelper",
  [
    "sap/base/Log",
    "sap/sac/df/thirdparty/lodash"
  ],
  function (Log, _) {
    "use strict";
    Log.info("ApplicationHelper loaded");
    
    function ApplicationHelper() {
      function createSystem(oSystemLandscape, oApplication, keepAliveInterval, oSystem) {
        var oSystemDescription = oSystemLandscape.createSystem();
        oSystemDescription.setName(oSystem.systemName);
        oSystemDescription.setTimeout(10000);
        oSystemDescription.setAuthenticationType(sap.firefly.AuthenticationType[oSystem.authentication || "NONE"]);
        var systemType = sap.firefly.SystemType[oSystem.systemType];
        oSystemDescription.setSystemType(systemType);
        oSystemDescription.setProtocolType(sap.firefly.ProtocolType[oSystem.protocol]);
        oSystemDescription.setHost(oSystem.host);
        oSystemDescription.setPort(oSystem.port);
        if (keepAliveInterval > 0) {
          oSystemDescription.setKeepAliveIntervalMs(keepAliveInterval * 1000);
          oSystemDescription.setKeepAliveDelayMs(keepAliveInterval * 2 * 1000);
        }
        oSystemLandscape.setSystemByDescription(oSystemDescription);
        if (systemType === sap.firefly.SystemType.BW) {
          oSystemDescription.setSessionCarrierType(sap.firefly.SessionCarrierType.SAP_CONTEXT_ID_HEADER);
          oApplication.getConnectionPool().setMaximumSharedConnections(oSystem.systemName, 10);
        }
  
      }
      
      this.createApplication = function (aSystemLandscape, sMasterSystem, keepAliveInterval) {
        var oProm = new Promise(function (resolve, reject) {
          sap.firefly.ApplicationFactory.createApplicationForDragonfly(
            function (oExtResult) {
              if (oExtResult.hasErrors()) {
                reject(oExtResult.getErrors());
              } else {
                resolve(oExtResult.getData());
              }
            }
          );
        });
        
        return oProm.then(
          function (oApplication) {
            var subSystemContainer = oApplication.getProcess().getKernel().getSubSystemContainer(sap.firefly.SubSystemType.SYSTEM_LANDSCAPE);
            var oSystemLandscape = subSystemContainer.getMainApi();
            oApplication.setSystemLandscape(oSystemLandscape);
            _.forEach(aSystemLandscape, createSystem.bind(null, oSystemLandscape, oApplication, keepAliveInterval));
            oSystemLandscape.setMasterSystemName(sMasterSystem);
            
            return oApplication;
          }
        );
      };
    }
    
    return new ApplicationHelper();
  }
);
