/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/changeHandlers/simple/GanttChartWithTable","sap/gantt/utils/GanttCustomisationUtils"],function(t,e){"use strict";return{actions:{remove:{changeType:"hideControl",isEnabled:true},reveal:{changeType:"unhideControl",isEnabled:true},settings:e.designTimeSettings.bind(null,"TXT_DT_GANTT_CHART_WITH_TABLE",t.fnConfigureContainerSettings)},tool:{start:function(t){t.setProperty("_enableRTA",true)},stop:function(t){t.setProperty("_enableRTA",false)}}}});
//# sourceMappingURL=GanttChartWithTable.designtime.js.map