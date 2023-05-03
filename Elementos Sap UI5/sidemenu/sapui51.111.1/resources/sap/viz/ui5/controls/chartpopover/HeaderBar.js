/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/m/library","sap/m/Bar","sap/m/Button","sap/m/Label","sap/ui/core/IconPool"],function(jQuery,t,e,o,i,s){"use strict";var n=t.ButtonType;var r=e.extend("sap.viz.ui5.controls.chartpopover.HeaderBar",{metadata:{properties:{showNavButton:"boolean",title:"string"},publicMethods:[],events:{navButtonPress:{},closeButtonPress:{}}},renderer:{apiVersion:2}});r.prototype.getContentLeft=function(){if(!this._oNavButton){this._oNavButton=new o(this._createId("popoverNavButton"),{type:n.Back,tooltip:sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PAGE_NAVBUTTON_TEXT"),press:jQuery.proxy(function(){this.fireNavButtonPress()},this)}).addStyleClass("viz-controls-chartPopover-backButton")}this._oNavButton.setVisible(this.getShowNavButton());this._oNavButton.onAfterRendering=function(){this.focus()};return[this._oNavButton]};r.prototype.getContentMiddle=function(){if(!this._oTitleLabel){this._oTitleLabel=new i(this._createId("popoverHeaderTitle")).addStyleClass("viz-controls-chartPopover-titleLabel");this.addAriaLabelledBy(this._oTitleLabel)}this._oTitleLabel.setText(this.getTitle());return[this._oTitleLabel]};r.prototype.getContentRight=function(){if(!this._oCloseButton){this._oCloseButton=new o(this._createId("popoverCloseButton"),{icon:s.getIconURI("decline"),tooltip:sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("MESSAGEPOPOVER_CLOSE"),press:jQuery.proxy(function(){this.fireCloseButtonPress()},this)}).addStyleClass("viz-controls-chartPopover-closeButton")}return[this._oCloseButton]};r.prototype.exit=function(){if(this._oCloseButton){this._oCloseButton.destroy();this._oCloseButton=null}if(this._oTitleLabel){this._oTitleLabel.destroy();this._oTitleLabel=null}if(this._oNavButton){this._oNavButton.destroy();this._oNavButton=null}e.prototype.exit.apply(this,arguments)};r.prototype._createId=function(t){return this.getId()+"-"+t};return r});
//# sourceMappingURL=HeaderBar.js.map