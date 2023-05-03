//@ui5-bundle sap/ushell/components/shell/Search/Component-preload.js
sap.ui.require.preload({
	"sap/ushell/components/shell/Search/Component.js":function(){
// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/components/shell/Search/ESearch","sap/ui/core/UIComponent","sap/ui/core/Component","sap/ushell/utils","sap/base/util/ObjectPath"],function(e,a,t,s,n){"use strict";return a.extend("sap.ushell.components.shell.Search.Component",{metadata:{manifest:"json",library:"sap.ushell"},createContent:function(){var a=this;var l=n.get("sap-ushell-config.services.SearchCEP")!==undefined;var r=sap.ushell.Container.getRenderer("fiori2").getShellController(),o=r.getView(),i=(o.getViewData()?o.getViewData().config:{})||{};var c=i.enableSearch!==false;if(!c){sap.ui.getCore().getEventBus().publish("shell","searchCompLoaded",{delay:0});return}sap.ushell.Container.getFLPPlatform().then(function(n){if(n==="MYHOME"||n==="cFLP"&&l===true){t.create({manifest:false,name:"sap.ushell.components.shell.SearchCEP"})}else{e.createContent(a);sap.ui.getCore().getEventBus().publish("shell","searchCompLoaded",{delay:0})}s.setPerformanceMark("FLP -- search component is loaded")})},exit:function(){e.exit()}})});
},
	"sap/ushell/components/shell/Search/ESearch.js":function(){
// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/resources","sap/ui/core/IconPool","sap/ui/core/routing/HashChanger","sap/ui/thirdparty/jquery","sap/ushell/renderers/fiori2/search/util"],function(e,a,r,jQuery,n){"use strict";var s=false;var i=function(e){if(!e._searchShellHelperPromise){e._searchShellHelperPromise=new Promise(function(e){sap.ui.getCore().loadLibrary("sap.esh.search.ui",{async:true}).then(function(){sap.ui.require(["sap/esh/search/ui/SearchShellHelperAndModuleLoader","sap/esh/search/ui/SearchShellHelper"],function(a,r){r.init();e(r)})})})}return e._searchShellHelperPromise};function t(t){s=true;var h={id:"sf",tooltip:"{i18n>openSearchBtn}",text:"{i18n>searchBtn}",ariaLabel:"{i18n>openSearchBtn}",icon:a.getIconURI("search"),visible:true,showSeparator:false,press:function(e){i(t).then(function(a){a.onShellSearchButtonPressed(e)})}};var l=sap.ushell.Container.getRenderer("fiori2").addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem",h,true,false);if(n.isSearchFieldExpandedByDefault()){l.setVisible(false)}l.setModel(e.i18nModel,"i18n");if(n.isSearchFieldExpandedByDefault()){i(t).then(function(e){if(e.expandSearch){e.expandSearch()}else{l.setVisible(true)}})}t.oHashChanger=r.getInstance();t.oHashChanger.attachEvent("shellHashChanged",function(e){var a=e.mParameters;setTimeout(function(){sap.ui.getCore().loadLibrary("sap.esh.search.ui",{async:true}).then(function(){sap.ui.require(["sap/esh/search/ui/HashChangeHandler"],function(e){e.handle(a)})})},6e3)});l.addEventDelegate({onAfterRendering:function(){jQuery("#sf").attr("aria-pressed",false)}})}function h(){if(s){sap.ushell.Container.getRenderer("fiori2").hideHeaderEndItem("sf");var e=sap.ui.getCore().byId("sf");if(e){e.destroy()}}}return{createContent:t,exit:h}});
},
	"sap/ushell/components/shell/Search/manifest.json":'{"_version":"1.34.0","sap.app":{"id":"sap.ushell.components.shell.Search","applicationVersion":{"version":"1.111.1"},"i18n":{"bundleUrl":"../../../renderers/fiori2/resources/resources.properties","fallbackLocale":"en"},"type":"component","title":"","resources":"resources.json"},"sap.ui":{"technology":"UI5","deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"dependencies":{"minUI5Version":"1.92","libs":{"sap.m":{},"sap.ui.layout":{}}},"models":{},"contentDensities":{"compact":true,"cozy":true}}}'
});
//# sourceMappingURL=Component-preload.js.map