/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object"],function(n){"use strict";return n.extend("sap.feedback.ui.flpplugin.utils.InitDetection",{_sUrl:null,constructor:function(n){this._sUrl=n},isUrlLoadable:function(){return this._canLoadUrl(this._sUrl)},_canLoadUrl:function(n){return new Promise(function(t,e){var i={method:"HEAD",mode:"no-cors"};var r=new Request(n,i);fetch(r).then(function(n){return n}).then(function(){t(true)}).catch(function(){e(false)})})}})});
//# sourceMappingURL=InitDetection.js.map