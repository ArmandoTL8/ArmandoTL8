//@ui5-bundle sap/fiori/library-preload.js
/*!
 * SAPUI5
 *
 * (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fiori/library", ["sap/base/i18n/ResourceBundle","sap/ui/core/Core","sap/ui/core/library"],function(e,i,a){"use strict";var r=sap.ui.getCore().initLibrary({name:"sap.fiori",dependencies:["sap.ui.core"],types:[],interfaces:[],controls:[],elements:[],version:"1.111.1"});var s=sap.ui.getCore().getConfiguration(),n=s.getLanguage(),o=s.getLanguagesDeliveredWithCore(),u=e._getFallbackLocales(n,o);n=u[0];if(n&&!window["sap-ui-debug"]&&!sap.ui.loader.config().async){sap.ui.requireSync("sap/fiori/messagebundle-preload_"+n)}return r});
sap.ui.require.preload({
	"sap/fiori/manifest.json":'{"_version":"1.21.0","sap.app":{"id":"sap.fiori","type":"library","embeds":[],"applicationVersion":{"version":"1.111.1"},"title":"A hybrid UILibrary merged from the most common UILibraries that are used in Fiori apps","description":"A hybrid UILibrary merged from the most common UILibraries that are used in Fiori apps","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":["base","sap_belize","sap_belize_hcb","sap_belize_hcw","sap_belize_plus","sap_bluecrystal","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_hcb","sap_horizon","sap_horizon_dark","sap_horizon_hcb","sap_horizon_hcw"]},"sap.ui5":{"dependencies":{"minUI5Version":"1.111","libs":{"sap.ui.core":{"minVersion":"1.111.1"}}},"library":{"i18n":false,"content":{"controls":[],"elements":[],"types":[],"interfaces":[]}}}}'
});
//# sourceMappingURL=library-preload.js.map
