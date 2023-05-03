//Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ushell/ui/contentFinder/AppBox","sap/f/GridContainerItemLayoutData","sap/base/Log"],function(e,t,r,i,n,o){"use strict";return e.extend("sap.ushell.components.ContentFinderAppSearch.controller.ContentFinderAppSearch",{onAfterRendering:function(){this.oModel=this.getView().getModel();this.oBindingPath=this.getView().getBindingContext().getPath();if(this.oModel){this.byId("overflowToolbar").setVisible(true)}if(this.getOwnerComponent().getModel()){this.oParentContentFinderDialogModel=this.getOwnerComponent().getModel()}},onInit:function(){this._oFilters={}},handleBreakpointChanged:function(e){if(this.oParentContentFinderDialogModel&&this.oParentContentFinderDialogModel.getProperty("/currentPageIndex")===1){var t=e.getParameter("currentBreakpoint");this.oParentContentFinderDialogModel.setProperty("/currentBreakpoint",t)}},showPreview:function(e){if(this.oModel.getProperty(this.oBindingPath+"/type")==="tiles"){this.oModel.setProperty(this.oBindingPath+"/tilePreviewShown",e.getParameter("showPreview"))}else{this.oModel.setProperty(this.oBindingPath+"/cardPreviewShown",e.getParameter("showPreview"))}},_getGridContainer:function(){if(this.oModel){return this.byId(this.oModel.getProperty(this.oBindingPath+"/type")==="tiles"?"tileGridList":"cardGridList")}return this.byId("tileGridList")},onTileSearch:function(e){var i=e.getParameter("newValue");if(i){this._oFilters.oSearchFilter=new t({filters:[new t("appId",r.Contains,i),new t("title",r.Contains,i),new t("subtitle",r.Contains,i),new t("systemInfo",r.Contains,i)],and:false});this._applyFilters()}else{this.resetFilters(["oSearchFilter"])}},_applyFilters:function(){var e=this._getGridContainer();var r=e.getBinding("items");r.filter(new t({filters:Object.values(this._oFilters),and:true}),"Control");this._setSelectAllButton()},titleFormatter:function(e,t,r,i,n,o){var s=this._getGridContainer().getItems().length;var l=s===0;var a=this.getView().getModel("i18n");if(r){if(l){return a.getResourceBundle().getText("ContentFinder.AppBoxContainer.Title.NoSearchResult",r)}return a.getResourceBundle().getText("ContentFinder.AppBoxContainer.Title.SearchResult",[s,r])}if(i){if(n===0){return a.getResourceBundle().getText("ContentFinder.AppBoxContainer.Title.NoSelectedApp")}return a.getResourceBundle().getText("ContentFinder.AppBoxContainer.Title.SelectedApp",n)}if(o&&o!==a.getResourceBundle().getText("ContentFinder.CategoryTree.Row.AllTiles")&&o!==a.getResourceBundle().getText("ContentFinder.CategoryTree.Row.AllCards")){return o+" ("+s+")"}if(e==="tiles"){if(l){return a.getResourceBundle().getText("ContentFinder.AppBoxContainer.Title.NoTiles")}return a.getResourceBundle().getText("ContentFinder.AppBoxContainer.Title.AllTiles",s)}if(l){return a.getResourceBundle().getText("ContentFinder.AppBoxContainer.Title.NoCards")}return a.getResourceBundle().getText("ContentFinder.AppBoxContainer.Title.AllCards",s)},onAppBoxSelected:function(){var e=this.oModel.getProperty(this.oBindingPath+"/tiles").filter(function(e){return e.selected&&!e.disabled}).length;if(this.oParentContentFinderDialogModel){this.oParentContentFinderDialogModel.setProperty("/selectedAppCount",e)}this.oModel.setProperty(this.oBindingPath+"/selectedAppCount",e);this._setSelectAllButton()},onCardAppBoxPressed:function(e){this.getOwnerComponent().fireEvent("cardSelected",e)},onSelectAllPressed:function(e){var t=e.getParameter("pressed");var r=this._getGridContainer();r.getItems().forEach(function(e){if(!e.getDisabled()){e.setSelected(t)}});this.onAppBoxSelected();this._setSelectAllButton();var i=this.oModel.getProperty(this.oBindingPath+"/showSelectedPressed");if(!t&&i){this.byId("ShowSelectedToggleBtn").setPressed(false).firePress()}},onShowSelectedPressed:function(e){this._updateFiltersAfterShowSelectedChange(e.getParameter("pressed"))},_updateFiltersAfterShowSelectedChange:function(e){if(e){this.byId("AppBoxSearch").clear();this._oFilters.oSelectFilter=new t("selected",r.EQ,true);this._applyFilters()}else{this.resetFilters(["oSelectFilter","oSearchFilter"]);this.byId("AppBoxSearch").clear()}},_updateFiltersAfterSelectionChange:function(e){var i=e.isLeaf();var n=e.getTitle();var o=this.getView().getModel("i18n");var s=n===o.getResourceBundle().getText("ContentFinder.CategoryTree.Row.AllTiles")||n===o.getResourceBundle().getText("ContentFinder.CategoryTree.Row.AllCards");var l=this.getView().getModel();l.setProperty("/CurrentSelectedTreeNode",n);if(s||!i){this.resetFilters(["oCatalogFilter"])}else{var a=!!l.getProperty("/roles")[n];if(a){var d=l.getProperty("/roles")[n];this._oFilters.oCatalogFilter=new t({filters:d.map(function(e){return new t("catalogId",r.EQ,e)}),and:false})}else{this._oFilters.oCatalogFilter=new t("catalogId",r.EQ,n)}var p=this.byId("ShowSelectedToggleBtn");if(p.getPressed()){p.setPressed(false);this._updateFiltersAfterShowSelectedChange(false)}this._applyFilters()}this.byId("ContentFinderAppSearchDynamicSideContent").toggle()},_setSelectAllButton:function(){var e=this._getGridContainer();var t=e.getItems().length;var r=e.getItems().filter(function(e){return e.getSelected()}).length;var i=t!==r;this.oModel.setProperty(this.oBindingPath+"/hasSelectables",i);this.oModel.setProperty(this.oBindingPath+"/appBoxCount",t)},_tileAppBoxFactory:function(e,t){var r=new n({columns:1,rows:1});var o=new i({id:"ContentFinderAppBoxTile-"+e,appId:t.getProperty("appId"),dataHelpId:t.getProperty("dataHelpId"),disabled:"{disabled}",disablePreview:true,gridGapSize:1.5,icon:t.getProperty("icon"),posinset:t.getProperty("posinset"),selectable:true,setsize:t.getProperty("setsize"),showExtraInformation:true,showPreview:false,type:t.getProperty("type"),visible:"{visible}",selected:"{selected}",select:this.onAppBoxSelected.bind(this),layoutData:r});o.setLaunchUrl(t.getProperty("launchUrl"));o.setTitle(t.getProperty("title"));o.setSubtitle(t.getProperty("subtitle"));o.setInfo(t.getProperty("info"));o.setSystemInfo(t.getProperty("systemInfo"));return o},_cardAppBoxFactory:function(e,t){var r=new n({columns:1,rows:1});var o=new i({id:"ContentFinderAppBoxCard-"+e,appId:t.getProperty("appId"),dataHelpId:t.getProperty("dataHelpId"),disabled:"{disabled}",disablePreview:true,gridGapSize:.75,icon:t.getProperty("icon"),previewSize:"Large",posinset:t.getProperty("posinset"),selectable:false,setsize:t.getProperty("setsize"),showExtraInformation:true,showPreview:false,type:t.getProperty("type"),visible:"{visible}",press:this.onCardAppBoxPressed.bind(this),layoutData:r});o.setLaunchUrl(t.getProperty("launchUrl"));o.setTitle(t.getProperty("title"));o.setSubtitle(t.getProperty("subtitle"));o.setInfo(t.getProperty("info"));o.setSystemInfo(t.getProperty("systemInfo"));return o},resetFilters:function(e){var t=["oSearchFilter","oSelectFilter","oCatalogFilter"];if(!e){e=Object.keys(this._oFilters)}e.forEach(function(e){if(!t.includes(e)){o.error("Invalid filter provided. Skipping.",null,"sap.ushell.components.ContentFinderAppSearch.controller.ContentFinderAppSearch");return}delete this._oFilters[e]}.bind(this));this._applyFilters()}})});
//# sourceMappingURL=ContentFinderAppSearch.controller.js.map