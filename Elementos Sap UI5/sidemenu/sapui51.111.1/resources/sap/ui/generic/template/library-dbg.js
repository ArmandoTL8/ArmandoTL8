/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.ui.generic.template.
 */
sap.ui.define(['sap/ui/core/Core','sap/ui/core/library', 'sap/ui/comp/library', 'sap/ui/generic/app/library'],
	function(Core) {
	"use strict";

	/**
	 * SAPUI5 library that provides functionality used by Smart Template Applications.
	 *
	 *
	 *
	 * @namespace
	 * @name sap.ui.generic.template
	 * @author SAP SE
	 * @version 1.111.0
	 * @private
	 */

	// delegate further initialization of this library to the Core
	var thisLib = Core.initLibrary({
		name : "sap.ui.generic.template",
		version: "1.111.0",
		dependencies : ["sap.ui.core", "sap.ui.comp", "sap.ui.generic.app"],
		types: [],
		interfaces: [],
		controls: [],
		elements: [],
		noLibraryCSS: true
	});

	return thisLib;

}, /* bExport= */ true);