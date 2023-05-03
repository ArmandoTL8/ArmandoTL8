/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/simple/GanttRowSettings"],function(t){"use strict";var e=t.extend("sap.gantt.simple.MultiActivityRowSettings",{metadata:{defaultAggregation:"tasks",aggregations:{tasks:{type:"sap.gantt.simple.BaseShape",multiple:true,singularName:"task"},pseudoShapeTemplate:{type:"sap.gantt.simple.MultiActivityGroup",multiple:false}}}});e.prototype.clone=function(){var e=t.prototype.clone.call(this);if(this.getParentGantt().getEnablePseudoShapesDisplay()){e.unbindAggregation("tasks")}return e};return e});
//# sourceMappingURL=MultiActivityRowSettings.js.map