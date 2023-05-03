/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/
sap.ui.define(
  ["sap/ui/core/Control",
    "sap/base/Log",
    "jquery.sap.global",
    "sap/sac/df/DFKernel",
    "sap/sac/df/firefly/library"
  ],
  function (Control, Log, jQuery, DFKernel) {
    "use strict";

    var DFProgram = Control.extend("sap.sac.df.DFProgram", {
      metadata: {
        properties: {
          program: {
            type: "string",
          },
          arguments: {
            type: "string[]",
            defaultValue: [],
          },
          environment: {
            type: "string[]",
            defaultValue: [],
          },
          systemLandscape: {
            type: "string",
            defaultValue: "",
          },
          systemLandscapeDef: {
            type: "object",
            defaultValue: null,
          },
          configuration: {
            type: "string",
            defaultValue: "",
          },
          configurationURI: {
            type: "string",
            defaultValue: null,
          },
          kernelId: {
            type: "string",
            defaultValue: "dfk"
          },
          width: {
            type: "sap.ui.core.CSSSize",
            defaultValue: "100%",
          },
          height: {
            type: "sap.ui.core.CSSSize",
            defaultValue: "100%",
          },
        },
        aggregations: {},
      },

      init: function () {

        var programContainerID = this.getId() + "--program";
        this.programContainer = jQuery("<div id=\"" + programContainerID + "\" style=\"width=100%; height=100%\"/>");
      },


      renderer: {
        apiVersion: 2,
        render: function (oRm, oControl) {
          oRm.openStart("div", oControl);
          oRm.style("flex", "auto");
          oRm.style("width", oControl.getWidth());
          oRm.style("height", oControl.getHeight());
          oRm.openEnd();
          oRm.close("div");
        }
      },

      onAfterRendering: function () {
        if (Control.prototype.onAfterRendering) {
          Control.prototype.onAfterRendering.apply(
            this,
            arguments
          ); //run the super class's method first
        }

        // attached the div the program is using to the ui5 Controls div
        var ui5Div = jQuery(window.document.getElementById(this.getId()));
        this.programContainer.appendTo(ui5Div);
        ui5Div.css("position", "relative");
        if (this.getProgram() && !this.program) {
          this.runProgram(this.getProgram());
        }
      },

      runProgram: function (programName) {
        if (programName === this.programName) {
          return;
        }
        if (this.program) {
          this._cleanUpProgram();
        }

        try {
          var that = this;
          this._getKernel().then(function (kernel) {
            that.program = sap.firefly.ProgramRunner.createRunner(
              kernel.getSession(),
              programName
            );
            that.setClientArgs();
            that.setClientEnvironment(that.program);
            that.program.setNativeAnchorId(that.getId() + "--program");

            that.processConfigURI(
              function () {
                that.program.runProgram();
              }
            );
          });

        } catch (error) {
          Log.error(error);
        }
      },

      exit: function () {
        if (this.program) {
          this._cleanUpProgram();
        }
      },

      _cleanUpProgram: function () {
        sap.firefly.XObjectExt.release(this.program);
        this.program.releaseObject();
        this.program = null;
      },
      _getKernel: function () {
        return Promise.resolve().then(function () {

          if (this.localKernel) {
            return this.localKernel;
          }
          var kernelId = this.getKernelId();
          if (kernelId) {
            var providedModel = this.getParent().getModel(kernelId);
            if (providedModel) {
              return providedModel;
            }
          }

          var kernelConfig = {systemLandscape: {type: "BW"}};
          var systemLandscapeDef = this.getSystemLandscapeDef();
          if (systemLandscapeDef) {
            kernelConfig.systemLandscape.Systems = systemLandscapeDef;
            kernelConfig.masterSystem = systemLandscapeDef.masterSystemName;
          }
          this.localKernel = new DFKernel(kernelConfig);
          return this.localKernel;

        }.bind(this));
      },

      setClientArgs: function () {
        var args = this.getArguments();
        args.forEach(
          function (element) {
            var parts = element.split("=");
            var key = parts[0].trim();
            var value = parts[1].trim();

            if (value === "true" || value === "false") {
              var bValue = value === "true" ? true : false;
              this.program.setBooleanArgument(key, bValue);
            } else if (value.startsWith("$")) {
              value = this.getUrlParams(key);
              if (key === "datasource") {
                value = "query:[][][" + value + "]";
              }
              this.program.setArgument(key, value);
            } else {
              this.program.setArgument(key, value);
            }
          }.bind(this)
        );

        if (this.getConfiguration() !== "") {
          this.program.setArgument("configuration", this.getConfiguration());
        }
      },

      processConfigURI: function (callback) {
        if (this.getConfigurationURI()) {
          var configFile = this.getConfigurationURI();
          if (!configFile.startsWith("http")) {
            configFile = window.location.protocol + "//";
            configFile += window.location.hostname;
            configFile += (window.location.port ? ":" + window.location.port : "");
            configFile += this.getConfigurationURI();
          }

          this.readJsonFile(configFile,
            function (configJson) {
              this.program.setArgument("configuration", configJson);
              callback();
            }.bind(this)
          );
        } else {
          callback();
        }
      },
      readJsonFile: function (file, callbackOK) {
        var jsonFile = new XMLHttpRequest();
        jsonFile.overrideMimeType("application/json");
        jsonFile.open("GET", file, true);
        jsonFile.onreadystatechange = function () {
          if (jsonFile.readyState === 4 && jsonFile.status === 200) {
            callbackOK(jsonFile.responseText);
          }
        };
        jsonFile.send(null);
      },

      getUrlParams: function (key) {
        return (window.location.href.split(key + "=")[1] || "").split("&")[0];
      },

      setClientEnvironment: function (program) {
        var aEnvArgs = this.getEnvironment();
        aEnvArgs.forEach(
          function (element) {
            var parts = element.split("=");
            program.setEnvironmentVariable(parts[0], parts[1]);
          }.bind(this)
        );
      },
    });
    return DFProgram;
  }
);
