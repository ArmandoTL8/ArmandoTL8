/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.modeler.core.textHandler");(function(){"use strict";sap.apf.modeler.core.TextHandler=function(){var e;this.getMessageText=function(e,r){return this.getText(e,r)};this.getText=function(r,t){return e.getResourceBundle().getText(r,t)};function r(){var r;var t;var s=jQuery.sap.getModulePath("sap.apf");r=s+"/modeler/resources/i18n/texts.properties";e=new sap.ui.model.resource.ResourceModel({bundleUrl:r});t=s+"/resources/i18n/apfUi.properties";e.enhance({bundleUrl:t})}r()}})();
//# sourceMappingURL=textHandler.js.map