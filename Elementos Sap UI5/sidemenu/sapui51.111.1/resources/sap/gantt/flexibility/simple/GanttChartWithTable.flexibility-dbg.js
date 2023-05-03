sap.ui.define([
	"sap/gantt/utils/GanttFlexibilityUtils"
], function (GanttFlexibilityUtils) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"moveControls": "default",
		"ganttChartWithTableSettings": GanttFlexibilityUtils.fnCustomisationChangeHandler("ganttChartWithTableSettings")
	};
}, /* bExport= */ true);