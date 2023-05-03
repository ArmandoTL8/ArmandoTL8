/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/core/Core","./AssociateContainerRenderer"],function(t,e){"use strict";var o=t.extend("sap.gantt.control.AssociateContainer",{metadata:{library:"sap.gantt",properties:{enableRootDiv:{type:"boolean",defaultValue:false}},associations:{content:{type:"sap.ui.core.Control",multiple:false}}}});o.prototype.setContent=function(t){this.setAssociation("content",t);if(t){var o=typeof t==="string"?e.byId(t):t;o._oAC=this}return this};return o},true);
//# sourceMappingURL=AssociateContainer.js.map