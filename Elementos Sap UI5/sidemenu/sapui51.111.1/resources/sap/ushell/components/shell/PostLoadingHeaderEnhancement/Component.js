// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/Device","sap/ui/core/Component","sap/ui/core/CustomData","sap/ui/core/IconPool","sap/ushell/Config","sap/ushell/EventHub","sap/ushell/library","sap/ushell/resources","sap/ushell/ui/shell/ShellHeadItem","sap/ui/core/Configuration"],function(e,t,i,n,a,o,r,l,p,s){"use strict";var u=r.AppTitleState;var c=r.FloatingNumberType;var g=[];return t.extend("sap.ushell.components.shell.PostLoadingHeaderEnhancement.Component",{metadata:{library:"sap.ushell"},init:function(){var e=sap.ushell.Container.getRenderer("fiori2").getShellConfig();g.push(this._createBackButton());g.push(this._createOverflowButton());if(e.moveAppFinderActionToShellHeader&&a.last("/core/catalog/enabled")&&!e.disableAppFinder){g.push(this._createAppFinderButton())}if(e.moveContactSupportActionToShellHeader){this._createSupportButton().then(function(e){g.push(e)})}this._createShellNavigationMenu(e);var t=sap.ui.getCore().byId("shell-header");t.updateAggregation("headItems");t.updateAggregation("headEndItems")},_createBackButton:function(){var e=s.getRTL()?"feeder-arrow":"nav-back";var t=new p({id:"backBtn",tooltip:l.i18n.getText("backBtn_tooltip"),ariaLabel:l.i18n.getText("backBtn_tooltip"),icon:n.getIconURI(e),press:function(){o.emit("navigateBack",Date.now())}});return t.getId()},_createOverflowButton:function(){var t=sap.ushell.Container.getRenderer("fiori2").getShellController().getModel();var i=new p({id:"endItemsOverflowBtn",tooltip:{path:"/notificationsCount",formatter:function(e){return this.tooltipFormatter(e)}},ariaLabel:l.i18n.getText("shellHeaderOverflowBtn_tooltip"),ariaHaspopup:"dialog",icon:"sap-icon://overflow",floatingNumber:"{/notificationsCount}",floatingNumberMaxValue:e.system.phone?99:999,floatingNumberType:c.OverflowButton,press:function(e){o.emit("showEndItemOverflow",e.getSource().getId(),true)}});i.setModel(t);return i.getId()},_createAppFinderButton:function(){var e=new p({id:"openCatalogBtn",text:l.i18n.getText("open_appFinderBtn"),tooltip:l.i18n.getText("open_appFinderBtn"),icon:"sap-icon://sys-find",target:"#Shell-appfinder"});if(a.last("/core/extension/enableHelp")){e.addStyleClass("help-id-openCatalogActionItem")}return e.getId()},_createSupportButton:function(){return new Promise(function(e){sap.ui.require(["sap/ushell/ui/footerbar/ContactSupportButton"],function(t){var i="ContactSupportBtn";var n=sap.ui.getCore().byId(i);if(!n){var a=new t("tempContactSupportBtn",{visible:true});var o=a.getIcon();var r=a.getText();n=new p({id:i,icon:o,tooltip:r,text:r,ariaHaspopup:"dialog",press:function(){a.firePress()}})}e(i)})})},_createShellNavigationMenu:function(e){return new Promise(function(t){sap.ui.require(["sap/m/StandardListItem","sap/ushell/ui/shell/NavigationMiniTile","sap/ushell/ui/shell/ShellNavigationMenu"],function(n,a,r){var l="shellNavigationMenu";var p=function(e,t){var a=t.getProperty("icon")||"sap-icon://circle-task-2",r=t.getProperty("title"),l=t.getProperty("subtitle"),p=t.getProperty("intent");var s=new n({type:"Active",title:r,description:l,icon:a,wrapping:true,customData:[new i({key:"intent",value:p})],press:function(){if(p&&p[0]==="#"){o.emit("navigateFromShellApplicationNavigationMenu",p,true)}}}).addStyleClass("sapUshellNavigationMenuListItems");return s};var s=function(e,t){var i=t.getProperty("icon"),n=t.getProperty("title"),r=t.getProperty("subtitle"),l=t.getProperty("intent");return new a({title:n,subtitle:r,icon:i,intent:l,press:function(){var e=this.getIntent();if(e&&e[0]==="#"){o.emit("navigateFromShellApplicationNavigationMenu",e,true)}}})};var c=new r(l,{title:"{/application/title}",description:"{/title}",icon:"{/application/icon}",showRelatedApps:e.appState!=="lean",items:{path:"/application/hierarchy",factory:p.bind(this)},miniTiles:{path:"/application/relatedApps",factory:s.bind(this)},visible:{path:"/ShellAppTitleState",formatter:function(e){return e===u.ShellNavMenu}}});var h=sap.ui.getCore().byId("shell-header");c.setModel(h.getModel());var d=sap.ui.getCore().byId("shellAppTitle");if(d){d.setNavigationMenu(c)}g.push(l);t(c)}.bind(this))})},exit:function(){g.forEach(function(e){var t=sap.ui.getCore().byId(e);if(t){t.destroy()}});g=[]}})});
//# sourceMappingURL=Component.js.map