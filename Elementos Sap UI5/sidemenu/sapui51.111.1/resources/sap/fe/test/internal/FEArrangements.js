/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.define(
	[
		"sap/ui/test/Opa5",
		"sap/ui/test/OpaBuilder",
		"sap/base/util/UriParameters",
		"sap/fe/test/Utils",
		"sap/fe/test/Stubs",
		"sap/fe/test/BaseArrangements",
		"sap/fe/test/internal/ConsoleErrorChecker"
	],
	function (Opa5, OpaBuilder, UriParameters, Utils, Stubs, BaseArrangements, ConsoleErrorChecker) {
		"use strict";

		return BaseArrangements.extend("sap.fe.test.internal.FEArrangements", {
			constructor: function (mSettings) {
				BaseArrangements.call(
					this,
					Utils.mergeObjects(
						{
							launchUrl: "test-resources/sap/fe/templates/internal/demokit/flpSandbox.html"
						},
						mSettings
					)
				);
			},

			iResetTestData: function (bIgnoreRedeploy) {
				var that = this,
					oUriParams = new UriParameters(window.location.href),
					sBackendUrl = oUriParams.get("useBackendUrl"),
					sProxyPrefix = sBackendUrl ? "/databinding/proxy/" + sBackendUrl.replace("://", "/") : "",
					bSuccess = false,
					sTenantID =
						window.__karma__ && window.__karma__.config && window.__karma__.config.ui5
							? window.__karma__.config.ui5.shardIndex
							: "default";

				return OpaBuilder.create(this)
					.success(function () {
						var oResetData = that.resetTestData(),
							oRedeploy = bIgnoreRedeploy ? Promise.resolve() : jQuery.post(sProxyPrefix + "/redeploy?tenant=" + sTenantID);

						Promise.all([oResetData, oRedeploy])
							.finally(function () {
								bSuccess = true;
							})
							.catch(function (oError) {
								throw oError;
							});

						return OpaBuilder.create(this)
							.timeout(60) // allow some time (redeployment on the Java stack is slow)
							.check(function () {
								return bSuccess;
							})
							.execute();
					})
					.description(Utils.formatMessage("Reset test data on tenant '{0}'", sTenantID))
					.execute();
			},

			/**
			 * Fail the test if there are errors logged to the browser console.
			 *
			 * @param {Array<RegExp|string>} [aErrors] The allowed error messages. Either use regular expressions or strings. Pass undefined or an empty array to reject all error messages.
			 * @returns {*} The OPA promise
			 */
			iAcceptTheseErrors: function (aErrors) {
				return OpaBuilder.create(this)
					.do(function () {
						ConsoleErrorChecker.setAcceptedErrorPatterns(aErrors);
					})
					.description(
						!aErrors || aErrors.length === 0
							? "Do not accept error messages"
							: Utils.formatMessage("Only accept these error message patterns: {0}", aErrors)
					)
					.execute();
			}
		});
	}
);
