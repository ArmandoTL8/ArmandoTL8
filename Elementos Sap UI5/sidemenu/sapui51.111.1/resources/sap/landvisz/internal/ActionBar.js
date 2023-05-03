/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/ui/core/Control","sap/ui/core/CustomData","sap/ui/commons/Image","sap/ui/commons/MenuButton","sap/ui/commons/Menu","sap/ui/commons/MenuItem","./ActionBarRenderer"],function(t,e,n,o,i,a,s,u){"use strict";var r=t.ActionType;var l=t.EntityCSSSize;var c=e.extend("sap.landvisz.internal.ActionBar",{metadata:{library:"sap.landvisz",properties:{actionLabel:{type:"string",group:"Data",defaultValue:null},renderingSize:{type:"sap.landvisz.EntityCSSSize",group:"Dimension",defaultValue:l.Regular},iconSrc:{type:"sap.ui.core.URI",group:"Data",defaultValue:null},actionType:{type:"sap.landvisz.ActionType",group:"Data",defaultValue:r.NORMAL},menuData:{type:"object",group:"Data",defaultValue:null},actionTooltip:{type:"string",group:"Data",defaultValue:null},enable:{type:"boolean",group:"Identification",defaultValue:true},changeView:{type:"boolean",group:"Identification",defaultValue:false}},aggregations:{menu:{type:"sap.ui.commons.Menu",multiple:true,singularName:"menu"}},events:{select:{}}}});c.prototype.init=function(){this.initializationDone=false;this.lastButton=false;this.selectedItem;this.systemId=""};c.prototype.exit=function(){this.customAction&&this.customAction.destroy();this.oActToolBar&&this.oActToolBar.destroy();this.oToolBarBtn&&this.oToolBarBtn.destroy()};c.prototype.initControls=function(){var t=this.getId();this.oToolBarBtn;this.oActToolBar;if(!this.customActionIcon&&this.getIconSrc()&&this.getIconSrc()!="")this.customActionIcon=new o(t+"-CLVCustomActionImg");if(!this.menuButton)this.menuButton=new i(t+"-"+"MenuButton")};c.prototype.onclick=function(t){if(this.getEnable()==false)t.preventDefault();else this.fireSelect()};c.prototype.onsapenter=function(t){if(this.getEnable()==false)t.preventDefault();else this.fireSelect()};c.prototype.nsapenter=function(t){if(this.getEnable()==false)t.preventDefault();else this.fireSelect()};c.prototype.getSelectedItem=function(){return this.selectedItem};c.prototype.getSystemId=function(){return this.systemId};c.prototype.setSelectedItemSubAction=function(t){var e=this.getMenuData();var n=this._addSubActions(e,t)};c.prototype._addSubActions=function(t,e){for(var n=0;n<t.length;n++){if(this.selectedItem.getText()==t[n].text){t[n].subActions=e;return}}};c.prototype._createMenu=function(t){var e=null;var o=null;var i=new a;i.addStyleClass("sapLandviszMenuItemBorber");for(var u=0;u<t.length;u++){o=t[u];e=new s({text:o.text,tooltip:o.tooltip});if(o.customdata){var r=new n({key:o.customdata});e.addCustomData(r)}i.addItem(e);if(o.subActions&&o.subActions.length>0){var l=this._createMenu(o.subActions);e.setSubmenu(l)}}return i};return c});
//# sourceMappingURL=ActionBar.js.map