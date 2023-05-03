/*!
 *  SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library"],function(t){"use strict";var i=t.EntityCSSSize;var n={};n.render=function(t,n){if(!this.initializationDone){n.initControls();n.initializationDone=true;t.write("<div tabIndex='0' ");t.writeControlData(n);var e=n.getRenderingSize();if(n.entityMaximized!=true){if(e==i.Small||e==i.RegularSmall||e==i.Regular||e==i.Medium){t.addClass("sapLandviszIcon_buttonSmall")}else t.addClass("sapLandviszIcon_button")}else if(n.entityMaximized==true){t.addClass("sapLandviszIcon_button");n.entityActionIcon.setWidth("16px");n.entityActionIcon.setHeight("16px")}t.writeClasses();t.write(">");n.setTooltip(n.getActionTooltip());n.entityActionIcon.setSrc(n.getIconSrc());n.entityActionIcon.setTooltip(n.getActionTooltip());t.renderControl(n.entityActionIcon);t.write("</div>")}};return n},true);
//# sourceMappingURL=EntityActionRenderer.js.map