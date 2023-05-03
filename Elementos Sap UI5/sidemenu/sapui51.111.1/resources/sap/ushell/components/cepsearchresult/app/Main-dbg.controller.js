//Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @private
 */

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ushell/components/cepsearchresult/app/util/SearchResultManager",
  "sap/ui/integration/Host"
], function (Controller, SearchResultManager, Host) {

  "use strict";

  return Controller.extend("sap.ushell.components.cepsearchresult.app.Main", {

    onInit: function () {
      this.initCard();
      this.initSearchResultManager();
    },

    initCard: function () {
      var oCard = this.getView().byId("searchResultWidget");
      if (!this.oHost) {
        this.oHost = new Host({
          actions: [
            {
              type: 'Navigation',
              action: this.handleCardAction.bind(this)
            }
          ],
          id: "searchAppHost",
          resolveDestination: function (sName) {
            return null; // TODO
          }
        });
        oCard.setHost(this.oHost);
        // oCard.attachAction(this.handleCardAction.bind(this));
      }
    },
    initSearchResultManager: function () {
      this.oSearchResultManager = new SearchResultManager(this.getOwnerComponent().getSearchConfig());
      var oModel = this.oSearchResultManager.getModel();
      this.oSearchResultManager._loaded.then(function () {
        if (oModel.getProperty("/categories/0/name") === "all" && oModel.getProperty("/categories").length === 2) {
          this.setCategory(oModel.getProperty("/categories/1/name"));
          this.byId("searchCategoriesTabs").getItems()[0].setVisible(false);
        } else {
          this.setCategory(this.getOwnerComponent().getCategory());
        }
        this.getView().setVisible(true);
        this.byId("searchResultWidget").setManifest(sap.ui.require.toUrl("sap/ushell/components/cepsearchresult/app/cards/searchresultwidget/manifest.json"));
      }.bind(this));
      this.getView().setModel(oModel, "manager");
    },

    onExit: function () {
      if (this.oHost) {
        this.oHost.destroy();
      }
      this.oSearchResultManager = null;
      this.oHost = null;
    },

    tabSelectionChange: function (oEvent) {
      this.setCategory(oEvent.getParameters().item.getKey());
    },

    setCategory: function (sKey) {
      this.byId("searchCategoriesTabs").setSelectedKey(sKey);
      this.updateResultCard();
    },

    updateResultCard: function () {
      // remove the card from cell
      // necessary to reset the height of the cell
      // otherwise the scroll area is not updated when switching tabs
      var oCard = this.byId("searchResultWidget");
      var oCell = oCard.getParent();
      oCell.removeItem(oCard);
      oCard.setParameters({
        categories: this.byId("searchCategoriesTabs").getSelectedKey(),
        searchTerm: this.getOwnerComponent().getSearchTerm(),
        edition: this.getOwnerComponent().getSearchConfig()
      });
      // add the card again
      oCell.addItem(oCard);
    },

    onAfterRendering: function () {
      var oContentArea = this.getView().getDomRef().querySelector(".sapUiCEPSRAppScroll");
      oContentArea.style.height = "calc( 100% - " + oContentArea.offsetTop + "px )";
    },

    handleCardAction: function (oEvent) {
      if (oEvent.mParameters &&
        oEvent.mParameters.type === "Navigation" &&
        oEvent.mParameters.parameters.category) {
        this.setCategory(oEvent.mParameters.parameters.category);
      }
      return true;
    },

    translateTitle: function (sTranslatedTitle) {
      return sTranslatedTitle
        .replace("{0}", this.getOwnerComponent().getSearchTerm())
        .replace("{1}", "--");
    }

  });
});
