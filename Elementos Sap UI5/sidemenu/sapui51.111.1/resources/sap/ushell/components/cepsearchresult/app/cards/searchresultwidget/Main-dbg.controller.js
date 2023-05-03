//Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/resource/ResourceModel",
  "sap/m/HBox",
  "./controls/SearchResultList",
  "sap/ushell/components/cepsearchresult/app/util/SearchResultManager"
], function (Controller, ResourceModel, HBox, SearchResultList, SearchResultManager) {
  "use strict";
  //load fragments only once
  return Controller.extend("sap.ushell.components.cepsearchresult.app.cards.searchresultwidget.Main", {
    onInit: function () {
      this.oView = this.getView();
      var oOwnerComponent = this.getOwnerComponent();
      this.oCard = oOwnerComponent.oCard;
      this.oResourceModel = new ResourceModel({
        bundleName: "sap.ushell.components.cepsearchresult.app.cards.searchresultwidget.i18n.i18n"
      });
      //the card i18n model
      this.oView.setModel(this.oResourceModel, "card_i18n");
      //allow data binding to parameters of the card
      this.oView.setModel(this.oCard.getModel("parameters"), "parameters");
      this.sCategories = oOwnerComponent.getCategories();
      this.sSearchTerm = oOwnerComponent.getSearchTerm();
      var sEdition = oOwnerComponent.getEdition();
      if (sEdition === "custom") {
        this.oSearchResultManager = new SearchResultManager(oOwnerComponent.getConfig());
      } else {
        this.oSearchResultManager = new SearchResultManager(oOwnerComponent.getEdition());
      }
      // init async
      this.oSearchResultManager._loaded.then(this.initUIAsync.bind(this));
    },
    initUIAsync: function () {
      this.oView.setModel(this.oSearchResultManager.getResourceModel(), "cati18n");
      this.oCategoriesModel = this.oSearchResultManager.getCategoriesModel(this.sCategories);
      this.oCategoriesModel.getProperty("/").forEach(function (oCategory) {
        if (!oCategory) {
          return;
        }
        // create the model
        var oSearchResultModel = this.oSearchResultManager.createSearchResultModel(
          oCategory.name,
          this.oCard,
          this.oCategoriesModel
        );
        //create a new list
        var oList = this._createList(oSearchResultModel);
        var oBox = new HBox({
          items: [oList]
        });
        oBox.addStyleClass("sapFCard");
        oBox.addStyleClass("sapUiCEPCatCard");
        // add to view
        this.oView.byId("content").addItem(oBox);
      }.bind(this));
      this.oView.setVisible(true);
    },
    _createList: function (oSearchResultModel) {
      //clone the List
      var oList = new SearchResultList({
        noDataText: "{category>_status/dataStatusText}",
        category: "{category>}",
        paging: "{= ${category>list/paging}}",
        viewAll: false,
        view: "{category>list/_currentView}",
        items: "{path:'data>'}",
        template: "{= ${category>list/item/template}}"
      });
      if (this.sCategories === "all") {
        oList.setViewAll(true);
        oList.attachShowAll(function (oEvent) {
          this._navigateTo(oEvent.getParameter("category"));
        }.bind(this));
      }
      if (this.sSearchTerm) {
        // Pass on the search term for highlighting text
        oList.setHighlightTerm(this.sSearchTerm);
      }
      //apply the models and binding contexts
      oList.applyModelContexts(oSearchResultModel, {
        category: "/",
        data: "/list/data/_result",
        count: "/list/data/_count"
      });
      oList.attachItemPress(function (oEvent) {
        var sUrl = oEvent.getParameter("listItem").getBindingContext("data").getProperty("url");
        document.location.hash = sUrl;
      });
      oList.attachFetchData(function (oEvent) {
        var mParameters = oEvent.getParameters();
        oSearchResultModel.setProperty("/list/paginator/pageSize", mParameters.pageSize);
        //trigger data fetch for the page
        oSearchResultModel.fetchCategoryData(mParameters.page);
      });
      oList.loadForVisibleItemCount(
        oSearchResultModel.getProperty("/list/paginator/pageSize"),
        this.oCard.getDomRef()
      );
      return oList;
    },
    _navigateTo: function (sCategory) {
      this.getOwnerComponent().oCard.fireAction({
        type: "Navigation",
        parameters: {
          category: sCategory
        }
      });
    }
  });
});
