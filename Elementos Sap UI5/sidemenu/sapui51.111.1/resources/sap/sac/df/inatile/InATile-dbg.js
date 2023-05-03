/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/
sap.ui.define(
  "sap/sac/df/inatile/InATile",
  [
    "sap/base/Log",
    "jquery.sap.global",
    "sap/ushell/ui/tile/TileBase",
    "sap/sac/df/olap/OlapModel",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/sac/df/inatile/InATileRenderer",
    "sap/sac/df/thirdparty/lodash",
    "sap/sac/df/library"
  ],
  function (
    Log, jQuery, TileBase, OlapModel, NumberFormat, Fragment, JSONModel, InATileRenderer, _
  ) {
    "use strict";
    /**
     * Constructor for a new <code>InATile</code>.
     * @private
     *
     * @class
     * Launcher tile that displays the total of a Data Provider of an OlapModel
     *
     * @extends sap.ui.core.Control
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     * @experimental since version 1.91
     * @author SAP SE
     * @version 1.111.0
     *
     * @constructor
     * @private
     * @alias sap.sac.df.inatile.InATile
     **/
    var InATile = TileBase.extend(
      "sap.sac.df.inatile.InATile",
      {
        metadata: {
          properties: {
            /**
             * the host of the datasource, falsy means use the origin of the website as domain
             * @private
             */
            host: {
              type: "string",
            },
            /**
             * the port of the service of the datasource
             * @private
             */
            port: {
              type: "int",
              defaultValue: 443
            },
            /**
             * the path to the service of the datasource
             * @private
             */
            path: {
              type: "string"
            },
            /**
             *  the system type of the service of the datasource
             * @private
             */
            systemType: {
              type: "sap.sac.df.types.SystemType"
            },
            /**
             *  the system name of the service of the datasource
             * @private
             */
            systemName: {
              type: "string",
              defaultValue: "localAbapAnalyticEngine"
            },
            /**
             *  the protocol type of the service of the datasource#ToDo: Make optional
             * @private
             */
            protocolType: {
              type: "sap.sac.df.types.ProtocolType",
            },
            /**
             *  the client of the service of the datasource (only relevant for abap based analytical engines)#ToDo: Make optional
             * @private
             */
            client: {
              type: "string",
            },
            /**
             *  the name of the datasource
             * @private
             */
            dataSourceName: {
              type: "string",
            },
            /**
             *  the type of the datasource
             * @private
             */
            dataSourceType: {
              type: "sap.sac.df.types.DataSourceType",
            },
            /**
             *  the package of the datasource #ToDo: Make optional
             * @private
             */
            packageName: {
              type: "string"
            },
            /**
             *  the schema of the datasource
             * @private
             */
            schemaName: {
              type: "string"
            },
            /**
             * Type of the Widget that is displayed in the Tile
             */
            widgetType: {
              widgetType: "sap.sac.df.types.WidgetType",
              defaultValue: "pivot"
            },
          }
        },
        renderer: InATileRenderer,
        init: function () {
          function normalizeNumber(numValue) {
            var number;
            var maxCharactersInDisplayNumber = 30;
            if (isNaN(numValue)) {
              number = numValue;
            } else {
              var oNForm = NumberFormat.getFloatInstance(
                {
                  maxFractionDigits: 2
                }
              );
              var numberFactor;
              var absNumValue = Math.abs(numValue);
              if (absNumValue >= 1000000000) {
                numberFactor = "B";
                numValue /= 1000000000;
              } else if (absNumValue >= 1000000) {
                numberFactor = "M";
                numValue /= 1000000;
              } else if (absNumValue >= 1000) {
                numberFactor = "K";
                numValue /= 1000;
              }
            }
            number = oNForm.format(numValue);
            var displayNumber = number;
            // we have to crop numbers to prevent overflow
            var cLastAllowedChar = displayNumber[maxCharactersInDisplayNumber - 1];
            // if last character is '.' or ',', we need to crop it also
            maxCharactersInDisplayNumber -= (cLastAllowedChar === "." || cLastAllowedChar === ",") ? 1 : 0;
            displayNumber = displayNumber.substring(0, maxCharactersInDisplayNumber);
            return [
              displayNumber,
              numberFactor
            ].join(" ");
          }
          
          var that = this;
          var oMircoBarChart = null;
          that.getMicrochartBar = function () {
            return oMircoBarChart;
          };
          TileBase.prototype.init.apply(that, arguments);
          that.setBusy(true);
          that.getInit = _.constant(
            Promise.resolve(
              Fragment.load(
                {
                  name: "sap.sac.df.inatile.MicroBarChart",
                  controller: {
                    press: function () {
                      Log.info("Micro Chart Pressed");
                    }
                  }
                }
              )
            ).then(
              function (oFrag) {
                that.addDependent(oFrag);
                oMircoBarChart = oFrag;
                if (that.getWidgetType() !== "pivot") {
                  oMircoBarChart.setModel(
                    new JSONModel(), "mc"
                  );
                }
                that.setBusy(true);
                var oParam = {
                  systemLandsape: that.getSystemType() ? [
                    {
                      systemName: that.getSystemName(),
                      systemType: that.getSystemType(),
                      protocolType: that.getProtocolType(),
                      port: that.getPort(),
                      client: that.getClient()
                    }
                  ] : null,
                  dataProvider: {
                    "0": {
                      dataSourceName: that.getDataSourceName(),
                      dataSourceType: that.getDataSourceType(),
                      packageName: that.getPackageName(),
                      schemaName: that.getSchemaName(),
                      systemName: that.getSystemName()
                    }
                  }
                };
                that.setModel(new OlapModel(oParam), "om");
                that.setBusy(true);
                return that.getModel("om").dataLoaded();
              }
            ).then(
              function () {
                var oDP = that.getModel("om").getDataProvider("0");
                that.setTitle(oDP.QueryTitle || oDP.QueryName);
                _.forEach(
                  oDP.FlatDimensions,
                  function (oDim) {
                    oDP.removeDrilldown(oDim.Name);
                  }
                );
                that.setBusy(true);
                return that.getModel("om").synchronize();
              }
            ).then(
              function () {
                var oDP = that.getModel("om").getDataProvider("0");
                if (oDP.FlatResultSet.length > 0) {
                  if (that.getWidgetType() === "pivot") {
                    that.setSubtitle(
                      _.map(
                        oDP.FlatResultSet[0],
                        function (n, s) {
                          var oM = _.find(
                            oDP.Measures,
                            function (o) {
                              return o.Name === s;
                            }
                          );
                          return [
                            (oM && oM.Description) || s,
                            normalizeNumber(n)
                          ].join(": ");
                        }
                      ).join("\n")
                    );
                  }
                  if (oDP.FlatResultSet.length > 1) {
                    if (that.getWidgetType() === "pivot") {
                      that.setInfo(
                        _.map(
                          oDP.FlatResultSet[1],
                          function (n, s) {
                            var oM = _.find(
                              oDP.Measures,
                              function (o) {
                                return o.Name === s;
                              });
                            return [
                              (oM && oM.Description) || s,
                              normalizeNumber(n)
                            ].join(": ");
                          }
                        ).join("\n")
                      );
                    } else {
                      oMircoBarChart.getModel("mc").setData(
                        {
                          columns: _.map(
                            oDP.FlatResultSet,
                            function (o) {
                              return _.reduce(
                                o,
                                function (c, n, s) {
                                  var oM = _.find(
                                    oDP.Measures,
                                    function (o) {
                                      return o.Name === s;
                                    }
                                  );
                                  return {
                                    label: (oM && oM.Description) || s,
                                    value: n,
                                    displayValue: normalizeNumber(n)
                                  };
                                }, null);
                            }
                          )
                        }
                      );
                      oMircoBarChart.getModel("mc").refresh();
                      that.getModel().refresh();
                      
                    }
                  }
                }
              }
            ).then(function () {
              oMircoBarChart.invalidate();
              that.invalidate();
            }).catch(function (oError) {
              Log.error(oError);
            }).then(function () {
              that.setBusy(false);
            })
          );
        },
        onAfterRendering: function () {
          var that = this;
          var $Tile = jQuery(that.getDomRef()).find(".sapZenDshInATile");
          $Tile.children().width($Tile.width() - 30);
        }
      }
    );
    return InATile;
  }
);
