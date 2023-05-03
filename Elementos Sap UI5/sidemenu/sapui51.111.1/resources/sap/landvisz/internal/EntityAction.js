/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/ui/core/Control","sap/ui/commons/Image","./EntityActionRenderer"],function(t,i,n,e){"use strict";var o=i.extend("sap.landvisz.internal.EntityAction",{metadata:{library:"sap.landvisz",properties:{actionTooltip:{type:"string",group:"Data",defaultValue:null},iconSrc:{type:"sap.ui.core.URI",group:"Data",defaultValue:null},renderingSize:{type:"string",group:"Dimension",defaultValue:null}},events:{press:{}}}});o.prototype.init=function(){this.initializationDone=false};o.prototype.exit=function(){this.entityActionIcon&&this.entityActionIcon.destroy();this.style="";this.entityMaximized};o.prototype.initControls=function(){var t=this.getId();this.entityActionIcon&&this.entityActionIcon.destroy();this.entityActionIcon=new n(t+"-CLVEntityActionImg")};o.prototype.press=function(t){this.fireSelect()};o.prototype.onclick=function(t){this.firePress()};return o});
//# sourceMappingURL=EntityAction.js.map