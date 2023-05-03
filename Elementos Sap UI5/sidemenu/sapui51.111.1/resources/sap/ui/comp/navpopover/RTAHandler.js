/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/library","sap/ui/comp/personalization/Controller","sap/ui/comp/personalization/Util","./Util","sap/ui/comp/navpopover/flexibility/changes/AddLink","sap/ui/comp/navpopover/flexibility/changes/RemoveLink","./Factory"],function(e,n,o,t,i,r,a){"use strict";var p=e.navpopover.ChangeHandlerType;var c={};c.isSettingsAvailable=function(){return!!a.getService("CrossApplicationNavigation")};c.getStableElements=function(e){if(!e||!e.isA("sap.ui.comp.navpopover.NavigationPopoverHandler")){return null}var n=e.getNavigationPopoverStableId();if(!n){return null}var o=e.getAppComponent();if(!o){return null}return[{id:n,appComponent:o}]};c.execute=function(e,n,o){return new Promise(function(n,t){if(!e||!e.isA("sap.ui.comp.navpopover.NavigationPopoverHandler")){t(new Error("oNavigationPopoverHandler is not of supported type sap.ui.comp.navpopover.NavigationPopoverHandler"));return}if(!e.getNavigationPopoverStableId()){t(new Error("StableId is not defined. SemanticObject="+e.getSemanticObject()));return}var i=e.getAppComponent();if(!i){t(new Error("AppComponent is not defined. oControl="+e.getControl()));return}e._getNavigationContainer().then(function(e){var t=[];var r=[];var a=function(o){var a=e.getId();t=o.filter(function(e){return e.visible===true}).map(function(e){return{selectorControl:{id:a,controlType:"sap.ui.comp.navpopover.NavigationContainer",appComponent:i},changeSpecificData:{changeType:p.addLink,content:e}}});r=o.filter(function(e){return e.visible===false}).map(function(e){return{selectorControl:{id:a,controlType:"sap.ui.comp.navpopover.NavigationContainer",appComponent:i},changeSpecificData:{changeType:p.removeLink,content:e}}});n(t.concat(r))};e.openSelectionDialog(true,false,a,false,o,undefined).then(function(){e.destroy()})})})};return c},true);
//# sourceMappingURL=RTAHandler.js.map