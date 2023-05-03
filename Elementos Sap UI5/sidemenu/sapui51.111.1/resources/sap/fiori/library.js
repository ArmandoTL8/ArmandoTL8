/*!
 * SAPUI5
 *
 * (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/i18n/ResourceBundle","sap/ui/core/Core","sap/ui/core/library"],function(e,i,a){"use strict";var r=sap.ui.getCore().initLibrary({name:"sap.fiori",dependencies:["sap.ui.core"],types:[],interfaces:[],controls:[],elements:[],version:"1.111.1"});var s=sap.ui.getCore().getConfiguration(),n=s.getLanguage(),o=s.getLanguagesDeliveredWithCore(),u=e._getFallbackLocales(n,o);n=u[0];if(n&&!window["sap-ui-debug"]&&!sap.ui.loader.config().async){sap.ui.requireSync("sap/fiori/messagebundle-preload_"+n)}return r});
//# sourceMappingURL=library.js.map