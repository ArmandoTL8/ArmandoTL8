/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
*/
(function(){"use strict";sap.ui.jsview("sap.apf.ui.reuse.view.facetFilter",{getControllerName:function(){return"sap.apf.ui.reuse.controller.facetFilter"},createContent:function(e){var t=new sap.m.FacetFilter(e.createId("idAPFFacetFilter"),{type:"Simple",showReset:true,showPopoverOKButton:true,reset:e.onResetPress.bind(e)}).addStyleClass("facetFilterInitialAlign");if(sap.ui.Device.system.desktop){t.addStyleClass("facetfilter")}return t}})})();
//# sourceMappingURL=facetFilter.view.js.map