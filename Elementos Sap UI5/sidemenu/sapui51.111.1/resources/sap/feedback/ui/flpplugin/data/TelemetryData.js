/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object"],function(t){"use strict";return t.extend("sap.feedback.ui.flpplugin.data.TelemetryData",{_pushEventTriggeredCount:0,_pushEventExecutedCount:0,_pushEventSnoozedCount:0,_timeSinceLastPushEvent:0,constructor:function(){},getPushEventTriggeredCount:function(){return this._pushEventTriggeredCount},setPushEventTriggeredCount:function(t){this._pushEventTriggeredCount=t},getPushEventExecutedCount:function(){return this._pushEventExecutedCount},setPushEventExecutedCount:function(t){this._pushEventExecutedCount=t},getPushEventSnoozedCount:function(){return this._pushEventSnoozedCount},setPushEventSnoozedCount:function(t){this._pushEventSnoozedCount=t},getTimeSinceLastPushEvent:function(){return this._timeSinceLastPushEvent},setTimeSinceLastPushEvent:function(t){this._timeSinceLastPushEvent=t}})});
//# sourceMappingURL=TelemetryData.js.map