/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/ui/core/Control","./EntityCustomActionRenderer"],function(t,i,e){"use strict";var n=t.EntityCSSSize;var o=i.extend("sap.landvisz.internal.EntityCustomAction",{metadata:{library:"sap.landvisz",properties:{customAction:{type:"string",group:"Data",defaultValue:null},renderingSize:{type:"sap.landvisz.EntityCSSSize",group:"Dimension",defaultValue:n.Regular}},events:{select:{}}}});o.prototype.init=function(){this.initializationDone=false;this.lastButton=false};o.prototype.exit=function(){this.customAction&&this.customAction.destroy()};o.prototype.initControls=function(){var t=this.getId()};o.prototype.select=function(t){this.fireSelect()};o.prototype.onclick=function(t){this.fireSelect()};return o});
//# sourceMappingURL=EntityCustomAction.js.map