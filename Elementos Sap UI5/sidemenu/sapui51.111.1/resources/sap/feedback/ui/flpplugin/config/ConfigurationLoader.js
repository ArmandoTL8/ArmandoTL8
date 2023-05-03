/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object","./PushConfig","sap/base/Log","../utils/Constants"],function(n,i,t,o){"use strict";return n.extend("sap.feedback.ui.flpplugin.config.ConfigurationLoader",{_oStartupConfig:null,init:function(n){if(!n){throw Error("oStartupConfig is not provided!")}this._oStartupConfig=n},getPushConfiguration:function(){return this._loadPushConfiguration().then(function(n){var t=new i(this._oStartupConfig);t.init();t.initFromJSON(n);return t}.bind(this)).catch(function(){return null})},_loadPushConfiguration:function(){return new Promise(function(n,i){var u=this._getConfigurationFilePath();fetch(u).then(function(n){return n.json()}).then(function(i){n(i)}).catch(function(n){t.error("Fiori Feedback Plug-in error occured on loading the push configuration.",n.statusText,o.S_PLUGIN_CONFIGLOADER_NAME);i()})}.bind(this))},_getConfigurationFilePath:function(){return sap.ui.require.toUrl("sap/feedback/ui/flpplugin/config/PushConfigSample.json")}})});
//# sourceMappingURL=ConfigurationLoader.js.map