/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/ui/core/Control","sap/ui/commons/Image","./ModelingStatusRenderer"],function(t,a,e,s){"use strict";var i=a.extend("sap.landvisz.internal.ModelingStatus",{metadata:{library:"sap.landvisz",properties:{status:{type:"string",group:"Data",defaultValue:null},statusTooltip:{type:"string",group:"Data",defaultValue:null},stateIconSrc:{type:"string",group:"Data",defaultValue:null},stateIconTooltip:{type:"any",group:"Data",defaultValue:null}}}});i.prototype.init=function(){this.initializationDone=false;this._imgResourcePath=sap.ui.resource("sap.landvisz","themes/base/img/status/");this._imgFolderPath;this.renderSize;if(!this.statusImage)this.statusImage=new e(this.getId()+"-CLVEntityStatusImage")};i.prototype.exit=function(){this.statusImage&&this.statusImage.destroy()};i.prototype.initControls=function(){var t=this.getId();if(!this.statusImage)this.statusImage=new e(t+"-CLVEntityStatusImage");if(!this.stateImage)this.stateImage=new e(t+"-EntityStateImage");this.entityMaximized};return i});
//# sourceMappingURL=ModelingStatus.js.map