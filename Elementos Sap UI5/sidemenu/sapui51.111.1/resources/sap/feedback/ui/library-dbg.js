/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */

/**
 * Initialization Code and shared classes of library sap.feedback.ui.
 */
sap.ui.define(["sap/ui/core/library"], function () {
	//Keep library dependency even if not used.
	"use strict";

	/**
	 * UI5 library: sap.feedback.ui.
	 *
	 * @namespace
	 * @alias sap.feedback.ui
	 * @public
	 */

	// delegate further initialization of this library to the Core
	var thisLib = sap.ui.getCore().initLibrary({
		name: "sap.feedback.ui",
		dependencies: ["sap.ui.core"],
		interfaces: [],
		elements: [],
		noLibraryCSS: true,
		version: "1.111.0"
	});

	return thisLib;
});
