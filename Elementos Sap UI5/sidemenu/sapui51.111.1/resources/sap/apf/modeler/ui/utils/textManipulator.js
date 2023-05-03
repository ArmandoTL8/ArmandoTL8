/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(function(){"use strict";var e={};e.addPrefixText=function(e,r){var t=[];if(e){t=e.map(function(e){return r(sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE)+": "+e})}return t};e.removePrefixText=function(e,r){var t=e.replace(r,"");return t.replace(": ","")};return e},true);
//# sourceMappingURL=textManipulator.js.map