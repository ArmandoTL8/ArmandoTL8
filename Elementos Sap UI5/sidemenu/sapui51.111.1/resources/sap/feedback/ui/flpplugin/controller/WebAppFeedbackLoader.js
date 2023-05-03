/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","sap/base/Log","../utils/Constants"],function(t,e,i){"use strict";return t.extend("sap.feedback.ui.flpplugin.controller.WebAppFeedbackLoader",{_oStartupConfig:null,_isAPILoaded:false,constructor:function(t){if(!t){throw Error("oStartupConfig is not provided!")}this._oStartupConfig=t},init:function(t){this._registerAPILoadedEvent(t)},getIsAPILoaded:function(){return this._isAPILoaded},_registerAPILoadedEvent:function(t){window.addEventListener("qsi_js_loaded",function(){if(QSI&&QSI.API){this._isAPILoaded=true}else{this._isAPILoaded=false;e.error("Qualtrics API did not load correctly. QSI.API not available.",null,i.S_PLUGIN_WEBAPPFEEDBACKCTRL_NAME)}if(t){t()}}.bind(this),false)},loadAPI:function(){try{var t=document.createElement("script");t.type="text/javascript";t.src=this._oStartupConfig.getQualtricsUri();document.body&&document.body.appendChild(t)}catch(t){e.error("Cannot inject Qualtrics snippet",t.message,i.S_PLUGIN_WEBAPPFEEDBACKLDR_NAME)}},reloadIntercepts:function(){if(QSI&&QSI.API){QSI.API.unload();QSI.API.load().then(QSI.API.run())}}})});
//# sourceMappingURL=WebAppFeedbackLoader.js.map