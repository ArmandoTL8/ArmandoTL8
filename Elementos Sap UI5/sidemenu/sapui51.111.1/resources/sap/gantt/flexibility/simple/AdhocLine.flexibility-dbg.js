sap.ui.define([
	"sap/gantt/utils/GanttFlexibilityUtils"
], function (GanttFlexibilityUtils) {
	"use strict";
	return {
		"hideControl": "default",
		"unhideControl": "default",
		"moveControls": "default",
		"ganttAdhocLineSettings": GanttFlexibilityUtils.fnCustomisationChangeHandler("ganttAdhocLineSettings")
	};
}, /* bExport= */ true);