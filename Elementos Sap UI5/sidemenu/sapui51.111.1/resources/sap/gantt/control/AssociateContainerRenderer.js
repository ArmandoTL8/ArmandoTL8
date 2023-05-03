/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";var t={};t.render=function(t,e){if(e.getEnableRootDiv()){t.write("<div");t.writeControlData(e);t.addClass("sapGanttChartLayoutBG");t.writeClasses();t.addStyle("width","100%");t.addStyle("height","100%");t.addStyle("overflow","hidden");t.writeStyles();t.write(">")}t.renderControl(sap.ui.getCore().byId(e.getContent()));if(e.getEnableRootDiv()){t.write("</div>")}};return t},true);
//# sourceMappingURL=AssociateContainerRenderer.js.map