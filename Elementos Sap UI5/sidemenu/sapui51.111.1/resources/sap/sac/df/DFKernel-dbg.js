/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/

sap.ui.define(
  [
    "sap/ui/model/Model",
    "sap/base/Log",
    "sap/sac/df/firefly/library"
  ],
  function (Model, Log, FF) {
    "use strict";
    // Reset storage
    FF.XLocalStorage.setInstance(null);

    /**
     * The DFKernel is a UI5 model which provides access to Firefly kernel - core infrastructure like processes, connections and system definitions.
     * This shared parts can be used by other Controls, Models and Components provided by sap.sac.df library.
     *
     * @class
     * Model implementation to access Firefly kernel
     *
     * @extends sap.ui.model.Model
     * @author SAP SE
     * @version 1.111.0
     * @private
     * @experimental
     * @alias sap.sac.df.DFKernel
     */
    var DFKernel = Model.extend("sap.sac.df.DFKernel", {
      constructor: function (mSettings, fnCallback) {
        Model.apply(this);
        var mSett = mSettings || {};
        this.init(mSett, fnCallback);
      },

      init: function (mSettings) {
        var that = this;
        if (!that.initPromise) {
          that.initPromise = new Promise(function (resolve) {
            if (!that.kernelProgram) {
              sap.firefly.XLogger.getInstance().setLogFilterLevel(sap.firefly.Severity.PRINT);
              that.initProgram = sap.firefly.KernelBoot.createByName("DragonflyAppProgram");
              that.initProgram.addProgramStartedListener(function (programStartAction, program) {
                if (!that.kernelProgram) {
                  that.kernelProgram = program;
                  if (that.aSystemLandscapes) {
                    that.addSystemLandscapes();
                  }
                  that.kernelProgram.getProcess().getApplication().setClientInfo(null, mSettings.clientIdentifier, null);
                  resolve(that.kernelProgram);
                }
              });
              that._setEnvironment(mSettings);
              that.initProgram.runFull();
            } else {
              resolve(that.kernelProgram);
            }
          });
        }
        return that.initPromise;
      },

      _setEnvironment: function (oEnvArgs) {
        this.initProgram.setEnvironmentVariable(sap.firefly.XEnvironmentConstants.FIREFLY_LOG_SEVERITY,  "Print");
        if (oEnvArgs.systemLandscape) {
          if (oEnvArgs.systemLandscape.URI) {
            var fullUri = oEnvArgs.systemLandscape.URI;
            if (!fullUri.startsWith("http")) {
              fullUri = window.location.protocol + "//";
              fullUri += window.location.hostname;
              fullUri += (window.location.port ? ":" + window.location.port : "");
              fullUri += oEnvArgs.systemLandscape.URI;
            }
            this.initProgram.setEnvironmentVariable("ff_system_landscape_uri", fullUri);
          } else if (oEnvArgs.systemLandscape.Systems) {
            this.aSystemLandscapes = [];
            var aKeys = Object.keys(oEnvArgs.systemLandscape.Systems);

            aKeys.forEach(function (key) {
              var oSystem = oEnvArgs.systemLandscape.Systems[key];
              this.aSystemLandscapes.push(oSystem);
            }.bind(this));
          }
        } else if (oEnvArgs.systemType) {

          this.masterSystemName = oEnvArgs.masterSystem || "local" + oEnvArgs.systemType;


          var defaultSystem = {
            systemName: this.masterSystemName,
            systemType: oEnvArgs.systemType,
            protocol: window.location.protocol === "http:" ? "HTTP" : "HTTPS",
            host: window.location.hostname,
            port: window.location.port,
            authentication: "NONE"
          };
          if (defaultSystem.systemType == "DWC") {
            defaultSystem.path = "/lcs/dwc";
          }
          this.aSystemLandscapes = [defaultSystem];
        } else {
          throw new Error("System Configuration is invalid");
        }
        this.masterSystemName = this.masterSystemName || oEnvArgs.masterSystem;

        if (!this.masterSystemName) {
          throw new Error("System Configuration is invalid");
        }
      },

      getSession: function () {
        if (!this.kernelProgram) {
          Log.error("Kernel not initialized");
          return null;
        }
        return this.kernelProgram.getSession();
      }
      ,
      getApplication: function () {
        if (!this.kernelProgram) {
          Log.error("Kernel not initialized");
          return null;
        }
        return this.kernelProgram.getApplication();
      }
      ,

      addSystemLandscapes: function () {
        var subSystemContainer = this.kernelProgram.getProcess().getKernel().getSubSystemContainer(sap.firefly.SubSystemType.SYSTEM_LANDSCAPE);
        var oSystemLandscape = subSystemContainer.getMainApi();
        var oApplication = this.kernelProgram.getApplication();
        oApplication.setSystemLandscape(oSystemLandscape);

        this.aSystemLandscapes.forEach(
          function (oSystem) {
            var oSystemDescription = oSystemLandscape.createSystem();
            oSystemDescription.setName(oSystem.systemName);
            oSystemDescription.setTimeout(10000);
            oSystemDescription.setAuthenticationType(sap.firefly.AuthenticationType[oSystem.authentication || "NONE"]);
            var systemType = sap.firefly.SystemType[oSystem.systemType];
            oSystemDescription.setSystemType(systemType);
            oSystemDescription.setProtocolType(sap.firefly.ProtocolType[oSystem.protocol]);
            oSystemDescription.setHost(oSystem.host);
            oSystemDescription.setPort(oSystem.port);
            oSystemDescription.setPath(oSystem.path);
            oSystemLandscape.setSystemByDescription(oSystemDescription);
            if (systemType.isTypeOf(sap.firefly.SystemType.BW)) {
              oSystemDescription.setSessionCarrierType(sap.firefly.SessionCarrierType.SAP_CONTEXT_ID_HEADER);
              oApplication.getConnectionPool().setMaximumSharedConnections(oSystem.systemName, 10);
            }
          }
        );
        oSystemLandscape.setMasterSystemName(this.masterSystemName);
      }
    });
    return DFKernel;
  }
)
;
