/*!
 * SAPUI5
 *
 * (c) Copyright 2009-2023 SAP SE. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.fiori.
 */
sap.ui.define([
	"sap/base/i18n/ResourceBundle",
	"sap/ui/core/Core", // provides sap.ui.getCore()
	"sap/ui/core/library" // library dependency
], function(ResourceBundle, oCore, library) {

	"use strict";

	/**
	 * A hybrid UILibrary, merged from the most common UILibraries that are used in Fiori apps
	 *
	 * @namespace
	 * @alias sap.fiori
	 * @public
	 */
	var thisLib = sap.ui.getCore().initLibrary({
		name : "sap.fiori",
		dependencies : ["sap.ui.core"],
		types: [],
		interfaces: [],
		controls: [],
		elements: [],
		version: "1.111.1"
	});

	var oConfig = sap.ui.getCore().getConfiguration(),
		sLanguage = oConfig.getLanguage(),
		aDeliveredLanguages = oConfig.getLanguagesDeliveredWithCore(),
		aLanguages = ResourceBundle._getFallbackLocales(sLanguage, aDeliveredLanguages); 

	// chose the most specific language first
	sLanguage = aLanguages[0];

	// if it is not undefined or the 'raw' language, load the corr. preload file 
	if ( sLanguage && !window["sap-ui-debug"] && !sap.ui.loader.config().async ) {
		sap.ui.requireSync("sap/fiori/messagebundle-preload_" + sLanguage);
	}

	return thisLib;

});
