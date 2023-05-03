/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/theming/Parameters","sap/gantt/misc/Utility"],function(e,t){"use strict";var a={};a.render=function(e,t){e.write("<div");e.writeControlData(t);e.addClass("sapGanttChartWithTable");e.writeClasses();e.addStyle("width",t.getWidth());e.addStyle("height",t.getHeight());e.writeStyles();e.write(">");this._setTableColumnHeaderHeight(t);e.renderControl(t._oSplitter);e.write("</div>")};a._setTableColumnHeaderHeight=function(a){var i=a._oToolbar.getAllToolbarItems().length===0;if(i){var r=t.findSapUiSizeClass(),n=sap.ui.getCore().getConfiguration().getTheme().endsWith("hcb"),s=0,o=n?4:2;if(r==="sapUiSizeCozy"){s=parseInt(e.get("_sap_gantt_Gantt_HeaderHeight"),10)-o}else{s=parseInt(e.get("_sap_gantt_Gantt_CompactHeaderHeight"),10)-o}a._oTT.setColumnHeaderHeight(s)}};return a},true);
//# sourceMappingURL=GanttChartWithTableRenderer.js.map