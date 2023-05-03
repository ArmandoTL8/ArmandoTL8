/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define([],function(){"use strict";var i={};i.render=function(i,t){if(!this.initializationDone){t.initControls();t.initializationDone=true;i.write("<div");i.writeControlData(t);i.addClass("sapLandviszAction");i.writeClasses();i.write('id="');i.write(t.getId()+"Action");i.write('" title ="');i.writeEscaped(t.getCustomAction());i.write('">');i.writeEscaped(t.getCustomAction());i.write("</div>")}};return i},true);
//# sourceMappingURL=EntityCustomActionRenderer.js.map