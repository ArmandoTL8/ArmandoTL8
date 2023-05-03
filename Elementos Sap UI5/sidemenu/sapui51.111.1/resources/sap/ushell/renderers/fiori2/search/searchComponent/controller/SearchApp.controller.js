// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/Controller","sap/esh/search/ui/SearchShellHelper","sap/esh/search/ui/SearchShellHelperAndModuleLoader","../../util"],function(e,a,t,h){"use strict";var i=!a.collapseSearch;return e.extend("sap/ushell/renderers/fiori2/search/searchComponent/SearchApp",{onInit:function(){sap.ushell.Container.getServiceAsync("ShellNavigation").then(function(e){this.oShellNavigation=e;this.oShellNavigation.hashChanger.attachEvent("hashChanged",this.hashChanged)}.bind(this));if(a.oSearchFieldGroup===undefined){a.init()}if(i){a.setSearchState("EXP_S")}else{a.expandSearch()}},hashChanged:function(){var e=sap.esh.search.ui.getModelSingleton({},"flp");e.parseURL()},onExit:function(){this.oShellNavigation.hashChanger.detachEvent("hashChanged",this.hashChanged);var e=this.oView.getContent()[0].oTablePersoController;if(e&&e.getTablePersoDialog&&e.getTablePersoDialog()){e.getTablePersoDialog().destroy()}if(a.resetModel){a.resetModel()}if(i){if(a.getDefaultOpen()!==true){if(a.setSearchStateSync){a.setSearchStateSync("COL")}else{a.setSearchState("COL")}}else{a.setSearchState("EXP")}}else{if(!h.isSearchFieldExpandedByDefault()){a.collapseSearch()}else{a.expandSearch()}}if(this.oView.getContent()[0].oSearchPage.oFacetDialog){this.oView.getContent()[0].oSearchPage.oFacetDialog.destroy()}}})});
//# sourceMappingURL=SearchApp.controller.js.map