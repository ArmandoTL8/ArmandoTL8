/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","../utils/Utils","../utils/Constants"],function(e,t,a){"use strict";return e.extend("sap.feedback.ui.flpplugin.survey.Balancer",{init:function(e){if(!e){throw Error("oStorage is not provided!")}this._oStorage=e},balance:function(e){return this._isSurveyTimeframeReached(e)},_isSurveyTimeframeReached:function(e){var t=this._readUserState();var i=null;if(e===a.E_PUSH_SRC_TYPE.dynamic){i=t.getDynamicPushDate()}else if(e===a.E_PUSH_SRC_TYPE.pushInApp){i=t.getInAppPushDate()}else{i=Date.now()+850301}return i<=Date.now()},_readUserState:function(){return this._oStorage.readUserState()}})});
//# sourceMappingURL=Balancer.js.map