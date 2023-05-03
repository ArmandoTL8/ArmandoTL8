/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
  [
    "sap/base/Log",
    "sap/ui/model/json/JSONModel",
    "sap/ovp/cards/custom/Component",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/sac/df/thirdparty/lodash"
  ],
  function (
    Log, JSONModel, Component, FeedItem, _
  ) {
    "use strict";
    /**
     * Creates and initializes a new sap.sac.df.InACard component.
     * Such a card component displays the resultset of a dataProvider in an overview page
     * settings.
     * @private
     *
     * @class Card Component.
     * @extends sap.ui.core.UIComponent
     * @abstract
     * @author SAP SE
     * @version 1.111.0
     * @alias sap.sac.df.InACard.Component
     * @since 1.91
     * @experimental
     */
    var InACard = Component.extend(
      "sap.sac.df.InACard.Component", {
        metadata: {
          manifest: "json",
          properties: {
            /**
             *  fragment for the inner Card Control
             */
            contentFragment: {
              type: "string",
              defaultValue: "sap.sac.df.InACard.fragment.InACard"
            },
            /**
             * Controller of the Widget inside the Card
             */
            controllerName: {
              type: "string",
              defaultValue: "sap.sac.df.InACard.controller.InACard"
            },
            /**
             * Fragment that is used for the footer of the Card
             */
            footerFragment: {
              type: "string",
              defaultValue: ""
            },
            /**
             * Type of the Widget that is displayed in the Card
             */
            widgetType: {
              widgetType: "sap.sac.df.types.WidgetType",
              defaultValue:"pivot"
            },
            /**
             * Name of the Data Provider within {sap.sac.df.olap.OlapModel} with name <code>om</code>,
             * which is displayed and available for interactions
             */
            dataProviderName:"string"
          }
        },
        init: function(){
          var that = this;
          Component.prototype.init.apply(that,arguments);
          that.setModel( that.getComponentData().model, "om");
          that.setModel( that.getComponentData().model, "$FlexVariants");

          var oG = sap.ui.getCore().byId("mainView");
          if(oG && !oG.getModel("$FlexVariants")){
            oG.setModel(that.getModel("om"),"$FlexVariants");
          }
          var oCP = sap.ui.getCore().byId("viewPortContainer") && sap.ui.getCore().byId("viewPortContainer").getPages();
          oCP = oCP && oCP[0].getComponentHandle &&  oCP[0].getComponentHandle() && oCP[0].getComponentHandle().getInstance();
          if(oCP && !oCP.getModel("$FlexVariants")){
            oCP.setModel(that.getModel("om"),"$FlexVariants");
          }
          var oDP;
          that.getRootControl().setBusy(true);
          that.rootControlLoaded(
          ).then(
            function(){
              return that.getRootControl().loaded();
            }
          ).then(
            function(){
              that.setDataProviderName(
                that.getRootControl().getModel("ovpCardProperties").getProperty("/dataProviderName")
              );
              return that.getModel("om").dataLoaded();
            }
          ).then(
            function(){
              oDP =that.getModel("om").getDataProvider(
                that.getRootControl().getModel("ovpCardProperties").getProperty("/dataProviderName")
              );
              that.getRootControl().getModel(
                "ovpCardProperties"
              ).setProperty(
                "/title",
                oDP.QueryTitle || oDP.QueryName
              );
              var sDPName = that.getRootControl().getModel("ovpCardProperties").getProperty("/dataProviderName");
              var oVizFrame = that.getRootControl().byId("idVizFrame");
              var oBIvp = _.clone(oVizFrame.getBindingInfo("vizProperties"));
              oBIvp.parts[0].path = ["/dataProvider/", sDPName, "/Chart/vizProperties"].join("");
              var oFDS =  that.getRootControl().byId("flatDS");
              var oBIDims = _.clone(oFDS.getBindingInfo("dimensions"));
              oBIDims.path = ["/dataProvider/", sDPName, "/FlatDimensions"].join("");
              oFDS.bindAggregation("dimensions", oBIDims);
              var oBIKyf = _.clone(oFDS.getBindingInfo("measures"));
              oBIKyf.path = ["/dataProvider/", sDPName, "/Measures"].join("");
              oFDS.bindAggregation("measures", oBIKyf);
              var oBIFRS = _.clone(oFDS.getBindingInfo("data"));
              oBIFRS.path = ["/dataProvider/", sDPName, "/FlatResultSet"].join("");
              oFDS.bindAggregation("data", oBIFRS);
              that.getModel("om").attachRequestCompleted(
                function(){
                  oVizFrame.bindProperty("vizProperties", oBIvp);
                  oVizFrame.destroyFeeds();
                  var aFeeds = that.getModel("om").getProperty(["/dataProvider/", sDPName, "/Chart/Feeds"].join(""));
                  _.forEach( aFeeds, function( oFeed ){
                    oVizFrame.addFeed(
                      new FeedItem(
                        {
                          type: oFeed.type,
                          uid: oFeed.uid,
                          values: oFeed.values
                        }
                      )
                    );
                  });
                  var oView = that.getRootControl();
                  _.forEach(
                    oView.byId("flatDS").getDimensions(),
                    function (oD) {
                      oD.bindProperty("value", "om>" + oD.getIdentity());
                    }
                  );
                  _.forEach(
                    oView.byId("flatDS").getMeasures(),
                    function (oM) {
                      oM.bindProperty("value", "om>" + oM.getIdentity());
                    }
                  );
                  oView.byId("idVizFrame").setVizProperties(
                    _.clone(
                      oView.byId("idVizFrame").getVizProperties()
                    )
                  );
                }
              );
              return that.getModel("om").synchronize();
            }
          ).catch(
            function(oError){
              Log.error(oError);
            }
          ).then(
            function(){
              that.getRootControl().setBusy(false);
            }
          );
        }
      }
    );
    return InACard;
  }
);
