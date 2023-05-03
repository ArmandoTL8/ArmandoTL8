/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define(["sap/ushell/library","sap/base/Log","sap/ui/core/Renderer","sap/sac/df/types/WidgetType","sap/ushell/ui/tile/TileBaseRenderer"],function(e,n,s,i,a){"use strict";var t=s.extend(a);t.apiVersion=2;t.renderPart=function(e,n){if(n.getWidgetType()===i.pivot){e.openStart("div");e.class("sapZenDshInATile");e.openEnd();e.openStart("div");e.class("sapZenDshInATileData");e.openEnd();e.openStart("div").class("sapZenDshInATileIndication").openEnd();e.voidStart("br").voidEnd();e.openStart("div");e.class("sapZenDshInATileNumberFactor");e.openEnd();e.close("div");e.close("div");e.openStart("div");e.class("sapZenDshInATileNumber");e.openEnd();e.close("div");e.close("div");e.close("div")}else{e.openStart("div",n).class("sapZenDshInATile").openEnd();if(n.getMicrochartBar&&n.getMicrochartBar()){e.renderControl(n.getMicrochartBar())}else{n.getInit().then(function(){n.invalidate()})}e.close("div")}};return t},true);
//# sourceMappingURL=InATileRenderer.js.map