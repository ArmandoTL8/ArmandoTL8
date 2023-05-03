/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
  [
    "sap/ushell/library",
    "sap/base/Log",
    "sap/ui/core/Renderer",
    "sap/sac/df/types/WidgetType",
    "sap/ushell/ui/tile/TileBaseRenderer"
  ],
  function(
    ushellLibrary,Log, Renderer, WidgetType, TileBaseRenderer
  ) {
    "use strict";
    /**
     * @name sap.sac.df.inatile.InATileRenderer
     * @static
     * @private
     */
    var InATileRenderer = Renderer.extend(TileBaseRenderer);

    InATileRenderer.apiVersion = 2;

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
     * @param {sap.sac.df.inatile.InATile} oControl an object representation of the control that should be rendered
     *
     * @private
     */
    InATileRenderer.renderPart = function (oRm, oControl) {
      if(oControl.getWidgetType()===WidgetType.pivot){
        oRm.openStart("div");
        oRm.class("sapZenDshInATile");
        oRm.openEnd();
        // dynamic data
        oRm.openStart("div");
        oRm.class("sapZenDshInATileData");
        oRm.openEnd();
        oRm.openStart("div").class("sapZenDshInATileIndication").openEnd();
        // unit
        oRm.voidStart("br").voidEnd(); // br was added in order to solve the issue of all the combination of presentation options between Number - Arrow - Unit
        oRm.openStart("div");
        oRm.class("sapZenDshInATileNumberFactor");
        oRm.openEnd();

        oRm.close("div");
        // closeing the sapZenDshInATileIndication scope
        oRm.close("div");
        oRm.openStart("div");
        oRm.class("sapZenDshInATileNumber");
        oRm.openEnd();

        oRm.close("div");
        // end of dynamic data
        oRm.close("div");
        // span element
        oRm.close("div");
      } else {
        oRm.openStart(
          "div", oControl
        ).class(
          "sapZenDshInATile"
        ).openEnd();
        if (oControl.getMicrochartBar && oControl.getMicrochartBar()) {
          oRm.renderControl(oControl.getMicrochartBar());
        } else {
          oControl.getInit().then(
            function () {
              oControl.invalidate();
            }
          );
        }
        oRm.close("div");
      }
    };
    return InATileRenderer;
  },
  true
);
