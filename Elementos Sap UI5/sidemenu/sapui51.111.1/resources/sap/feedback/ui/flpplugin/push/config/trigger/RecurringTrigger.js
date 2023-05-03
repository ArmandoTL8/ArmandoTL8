/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BaseTrigger"],function(r){"use strict";return r.extend("sap.feedback.ui.flpplugin.push.config.trigger.RecurringTrigger",{constructor:function(){return r.prototype.constructor.apply(this,arguments)},init:function(r,i,t){if(!Number.isInteger(r)){throw Error("Interval is not a valid number - "+r)}if(!Number.isInteger(i)){throw Error("Max Limit is not a valid number - "+i)}if(!Number.isInteger(t)){throw Error("Start Threshold is not a valid number - "+t)}this._iInterval=r;this._iMaxLimitCount=i;this._iThresholdCountStart=t},initFromJSON:function(r){var i=r.interval;var t=r.maxLimit;var n=r.startThreshold;this.init(i,t,n)}})});
//# sourceMappingURL=RecurringTrigger.js.map