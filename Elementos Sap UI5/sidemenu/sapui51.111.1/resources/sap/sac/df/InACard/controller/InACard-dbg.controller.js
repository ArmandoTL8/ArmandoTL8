/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise */
sap.ui.define(
  [
    "jquery.sap.global",
    "sap/base/Log",
    "sap/ui/core/mvc/Controller"
  ],
  function (
    jQuery, Log, Controller
  ) {
    "use strict";
    Controller.extend(
      "sap.sac.df.InACard.controller.InACard", {
        resizeCard: function(oSize){
          var oView = this.getView();
          var $OvpContent = jQuery(
            oView.byId(
              "ovpCardContentContainer"
            ).getDomRef()
          );
          $OvpContent.css("visibility", "visible");
          if (oSize.showOnlyHeader) {
            $OvpContent.addClass("sapOvpContentHidden");
          } else {
            $OvpContent.removeClass("sapOvpContentHidden");
          }
          $OvpContent.height(
            (oSize.rowSpan * oSize.iRowHeightPx)- ( 2 * oSize.iCardBorderPx)
          );
        },
        onPress: function(oEvent){
          var that = this;
          that.getView().setBusy(
            oEvent.getParameter("navigationCmdType") !== "CellClick"
          );
          var oOM = that.getView().getModel("om");
          oOM.clearMessages();
          return Promise.resolve(null).then(
            oEvent.getParameter("cmd")
          ).then(
            function () {
              if (sap.ushell && sap.ushell.Container){
                sap.ushell.Container.setDirtyFlag(false);
              }
            }
          ).catch(
            function(oError){
              Log.error(oError);
            }
          ).then(
            function () {
              that.getView().setBusy(false);
            }
          );
        },
        onAfterRendering: function () {
          this.adjustHeight();
        },
        adjustHeight: function(){
          var oDR = this.getView().getDomRef();
          if(oDR){
            jQuery(
              oDR
            ).height(
              jQuery(
                this.getOwnerComponent().getRootControl().byId("vb1").getDomRef()
              ).height()
            );
            jQuery(
              this.getOwnerComponent().getRootControl().byId("vb1").getDomRef()
            ).children().css("height","100%");
          }
        },
        getItemHeight: function(){
          try{
            return jQuery(
              this.getView().byId(
                this.getView().getId()+"--ovpCardControl"
              ).getInnerCard().getItems()[1].getDomRef()
            ).height();
          }catch(oError){
            Log.error(oError);
            return 0;
          }
        }
      }
    );
  }
);
