sap.ui.define([
	"sap/gantt/utils/GanttFlexibilityUtils"
], function (GanttFlexibilityUtils) {
	"use strict";

	return {
		"hideControl": "default",
		"unhideControl": "default",
		"moveControls": "default",
		"ganttDeltaLineSettings": GanttFlexibilityUtils.fnCustomisationChangeHandler("ganttDeltaLineSettings")
	};
}, /* bExport= */ true);