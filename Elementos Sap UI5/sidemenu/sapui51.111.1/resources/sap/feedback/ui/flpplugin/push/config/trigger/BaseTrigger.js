/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object"],function(t){"use strict";return t.extend("sap.feedback.ui.flpplugin.push.config.trigger.BaseTrigger",{_iInterval:-1,_iMaxLimitCount:-1,_iThresholdCountStart:-1,_canForcePush:false,constructor:function(){},getInterval:function(){return this._iInterval},getMaxLimitCount:function(){return this._iMaxLimitCount},getThresholdCountStart:function(){return this._iThresholdCountStart},canForcePush:function(){return this._canForcePush},isQualifiedForPush:function(t,i){var e=t.getTriggeredCount();var n=t.getExecutedCount();if(this._isMinimumThresholdReached(e)&&this._hasNotReachedMaxLimit(n)&&this._isIntervalMatching(e)){return true}return false},_isMinimumThresholdReached:function(t){return t>=this._iThresholdCountStart},_hasNotReachedMaxLimit:function(t){return t<this._iMaxLimitCount},_isIntervalMatching:function(t){if(this._iInterval===t||t%this._iInterval===0){return true}return false}})});
//# sourceMappingURL=BaseTrigger.js.map