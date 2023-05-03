// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/m/Button","sap/m/ButtonRenderer","sap/m/library","sap/ushell/resources","sap/ushell/ui/footerbar/AboutButton","sap/ushell/ui/footerbar/LogoutButton","sap/ushell/ui/footerbar/UserPreferencesButton"],function(t,e,s,n,o,i,u){"use strict";var r=s.PlacementType;var a=t.extend("sap.ushell.ui.footerbar.SettingsButton",{metadata:{library:"sap.ushell"},renderer:e});a.prototype.init=function(){if(t.prototype.init){t.prototype.init.apply(this,arguments)}this.setIcon("sap-icon://action-settings");this.setTooltip(n.i18n.getText("helpBtn_tooltip"));this.attachPress(this.showSettingsMenu);this.defaultMenuItems=[new o,new u,new i]};a.prototype.setMenuItems=function(t){this.menuItems=t};a.prototype.showSettingsMenu=function(){sap.ui.require(["sap/m/ActionSheet"],function(t){var e=new t({id:"settingsMenu",showHeader:false,buttons:(this.menuItems||[]).concat(this.defaultMenuItems)});e.setPlacement(r.Vertical);e.openBy(this);e.attachAfterClose(function(){e.removeAllButtons();e.destroy()})}.bind(this))};return a});
//# sourceMappingURL=SettingsButton.js.map