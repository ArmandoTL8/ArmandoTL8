/*!
 * Copyright (c) 2009-2022 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/core/Control","sap/ushell/services/VisualizationInstantiation"],function(e,t){"use strict";var n=new t;var i=1200;var s=e.extend("sap.ushell.components.cepsearchresult.app.cards.searchresultwidget.controls.Tile",{metadata:{properties:{viz:{type:"object",bindable:true}},aggregations:{_vizInstance:{type:"sap.ui.core.Control",multiple:false,hidden:true}}},renderer:function(e,t){e.openStart("div",t);e.openEnd();e.renderControl(t.getAggregation("_vizInstance"));e.close("div")}});s.prototype.setViz=function(e){if(e){if(this.getAggregation("_vizInstance")){this.getAggregation("_vizInstance").destroy()}e.displayFormatHint="standard";var t=n.instantiateVisualization(e);this.setAggregation("_vizInstance",t);setTimeout(function(){if(sap.ushell.Container){sap.ushell.Container.getServiceAsync("ReferenceResolver").then(function(){t.setActive(true,false)})}},i)}return this};return s});
//# sourceMappingURL=Tile.js.map