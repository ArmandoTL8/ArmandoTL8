/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library"],function(e){"use strict";var i=e.LandscapeObject;var a={};a.render=function(e,a){if(!this.initializationDone){a.initControls();a.initializationDone=true;e.write("<div tabIndex='0' ");e.writeControlData(a);if(a.getSelected()){e.addClass("sapLandviszMiniNavigationSelected");if(a.getType()==i.TechnicalSystem)e.addClass("sapLandviszTechnicalSystem");else if(a.getType()==i.ProductSystem)e.addClass("sapLandviszProductSystem");else if(a.getType()==i.SapComponent)e.addClass("sapLandviszSapComponent");e.writeClasses()}else if(a.inDisplay==true)e.addClass("sapLandviszMiniNavigationInDisplay");else e.addClass("sapLandviszMiniNavigationNormal");e.writeClasses();e.writeAttributeEscaped("id",a.getId()+"MiniHeader");e.writeAttributeEscaped("title",a.getHeaderTooltip());e.addStyle("width",a.headerWidth+"px");e.writeStyles();e.write(">");e.write("</div>")}};return a},true);
//# sourceMappingURL=HeaderListRenderer.js.map