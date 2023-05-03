/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object"], function (BaseObject) {
	"use strict";
	/* global Request, fetch */

	return BaseObject.extend("sap.feedback.ui.flpplugin.utils.InitDetection", {
		_sUrl: null,

		constructor: function (sUrl) {
			this._sUrl = sUrl;
		},
		isUrlLoadable: function () {
			return this._canLoadUrl(this._sUrl);
		},
		_canLoadUrl: function (sUrl) {
			return new Promise(function (fnResolve, fnReject) {
				var oHeader = {
					method: "HEAD",
					mode: "no-cors"
				};

				var oValidationRequest = new Request(sUrl, oHeader);

				fetch(oValidationRequest)
					.then(function (oResponse) {
						return oResponse;
					})
					.then(function () {
						fnResolve(true);
					})
					.catch(function () {
						fnReject(false);
					});
			});
		}
	});
});
