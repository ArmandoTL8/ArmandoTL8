/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/ui/core/Control","sap/ui/commons/Image","./DeploymentTypeRenderer"],function(t,i,e,n){"use strict";var o=i.extend("sap.landvisz.internal.DeploymentType",{metadata:{library:"sap.landvisz",properties:{type:{type:"string",group:"Data",defaultValue:null}}}});o.prototype.init=function(){this.left=0;this.top=0;this.initializationDone=false;this.entityId="";this.count=0;this.type="";this.standardWidth=0;this.srcEntityId=""};o.prototype.initControls=function(){var t=this.getId();this.iconType&&this.iconType.destroy();this.iconType=new e(t+"-solutionCategoryImg");this.iconLeft&&this.iconLeft.destroy();this.iconLeft=new e(t+"-solutionCategoryLeftImg");this.iconRight&&this.iconRight.destroy();this.iconRight=new e(t+"-solutionCategoryRightImg")};return o});
//# sourceMappingURL=DeploymentType.js.map