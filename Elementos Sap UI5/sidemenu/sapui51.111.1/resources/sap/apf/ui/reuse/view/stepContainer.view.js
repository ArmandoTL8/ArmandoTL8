/*!
 * SAP APF Analysis Path Framework 
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/suite/ui/commons/ChartContainer","sap/suite/ui/commons/ChartContainerToolbarPlaceholder","sap/m/OverflowToolbar","sap/ui/layout/VerticalLayout"],function(e,t,a,r){"use strict";return sap.ui.jsview("sap.apf.ui.reuse.view.stepContainer",{getControllerName:function(){return"sap.apf.ui.reuse.controller.stepContainer"},createContent:function(i){if(sap.ui.Device.system.desktop){i.getView().addStyleClass("sapUiSizeCompact")}var o=new e({id:i.createId("idChartContainer"),showFullScreen:true}).addStyleClass("chartContainer ChartArea");var n=new a({id:i.createId("idChartContainerToolbar")});n.addContent(new t);o.setToolbar(n);this.stepLayout=new r({id:i.createId("idStepLayout"),content:[o],width:"100%"});this.stepLayout.setBusy(true);return this.stepLayout}})});
//# sourceMappingURL=stepContainer.view.js.map