/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","sap/base/Log","../utils/Utils","../utils/Constants"],function(t,e,a,i){"use strict";return t.extend("sap.feedback.ui.flpplugin.data.PushContextData",{_iType:null,_sAreaId:null,_sTriggerName:null,_sShortText:null,_oPayloadData:null,constructor:function(t,e,i,r){this._sAreaId=t;this._sTriggerName=e;this._iType=i;if(a.isString(r)&&!a.stringIsEmpty(r)){this._sShortText=r.trim()}},getAreaId:function(){return this._sAreaId},getTriggerName:function(){return this._sTriggerName},getType:function(){return this._iType},getShortText:function(){return this._sShortText||""},getIsBackendPushedSurvey:function(){return this._iType===i.E_PUSH_SRC_TYPE.backend},setPayloadData:function(t){this._oPayloadData=t},getPayloadDataString:function(){var t="";if(this._oPayloadData){try{t=JSON.stringify(this._oPayloadData)}catch(t){e.error("Fiori Feedback Plug-in error occured on parsing payload push data.",t.message,i.S_PLUGIN_PUSHCONTEXTDATA_NAME)}}return t}})});
//# sourceMappingURL=PushContextData.js.map