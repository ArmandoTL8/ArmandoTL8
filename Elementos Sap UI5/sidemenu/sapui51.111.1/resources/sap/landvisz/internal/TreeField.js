/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/ui/core/Control","sap/ui/commons/Tree","sap/ui/commons/TreeNode","sap/ui/model/json/JSONModel","./TreeFieldRenderer"],function(e,t,i,o,r,n){"use strict";var s=t.extend("sap.landvisz.internal.TreeField",{metadata:{library:"sap.landvisz",properties:{treeModel:{type:"object",group:"Data",defaultValue:null},bindingName:{type:"string",group:"Data",defaultValue:null},renderingSize:{type:"sap.landvisz.EntityCSSSize",group:"Dimension",defaultValue:null}},aggregations:{treeNode:{type:"sap.ui.commons.TreeNode",multiple:true,singularName:"treeNode"}}}});s.prototype.init=function(){this.initializationDone=false};s.prototype.exit=function(){this.tree&&this.tree.destroy();this.oTreeNodeTemplate&&this.oTreeNodeTemplate.destroy();this.jsonModel&&this.jsonModel.destroy()};s.prototype.initControls=function(){var e=this.getId();if(!this.tree)this.tree=new i(e+"CLVTree");if(!this.jsonModel)this.jsonModel=new r;if(!this.oTreeNodeTemplate)this.oTreeNodeTemplate=new o(e+"CLVTreeNode")};return s});
//# sourceMappingURL=TreeField.js.map