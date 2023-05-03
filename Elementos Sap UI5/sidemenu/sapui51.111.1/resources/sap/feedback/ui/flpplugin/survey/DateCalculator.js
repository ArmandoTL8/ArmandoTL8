/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["../utils/Constants"],function(t){"use strict";return{calculateInitialDynamicPushDate:function(t){return this._calculateNextSurveyDate(t.getIntervalInitialDynamicPushInDays(),t.getDeviationInitialDynamicPushInDays())},calculateInitialInAppPushDate:function(t){return this._calculateNextSurveyDate(t.getIntervalInitialInAppPushInDays(),t.getDeviationInitialInAppPushInDays())},calculateNextDynamicPushDate:function(t){return this._calculateNextSurveyDate(t.getIntervalNextDynamicPushInDays(),t.getDeviationNextDynamicPushInDays())},calculateNextInAppPushDate:function(t){return this._calculateNextSurveyDate(t.getIntervalNextInAppPushInDays(),t.getDeviationNextInAppPushInDays())},_calculateNextSurveyDate:function(a,e){var n=a+Math.round(Math.random()*e*2)-e;return Date.now()+n*t.E_TIME.daysToMilliseconds}}});
//# sourceMappingURL=DateCalculator.js.map