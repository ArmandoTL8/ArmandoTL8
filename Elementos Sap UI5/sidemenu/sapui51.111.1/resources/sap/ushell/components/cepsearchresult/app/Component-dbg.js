// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ushell/components/cepsearchresult/app/util/appendStyleVars"
], function (UIComponent, appendStyleVars) {
  "use strict";

  appendStyleVars([
    "_sap_m_IconTabBar_ShellHeaderShadow",
    "sapUiElementLineHeight",
    "sapUiShellNavigationBackground",
    "_sap_m_IconTabBar_HeaderMinHeight"
  ]);

  /* Utility functions */

  function getSingleIntentParameter (oComponent, sParameterName, defaultValue) {
    var oComponentData = oComponent.getComponentData && oComponent.getComponentData();
    if (oComponentData && oComponentData.startupParameters) {
      var mParams = oComponentData.startupParameters;
      // try to read the parameter value
      if (Array.isArray(mParams[sParameterName]) && mParams[sParameterName].length > 0) {
        return mParams[sParameterName][0] || defaultValue;
      }
    }
    return defaultValue;
  }

  /**
   * Component of the Search Result Application.
   *
   * @param {string} sId Component id
   * @param {object} oParams Component parameter
   *
   * @class
   * @extends sap.ui.core.UIComponent
   *
   * @private
   *
   * @since 1.110.0
   * @alias sap.ushell.components.cepsearchresult.app.Component
   */
  var Component = UIComponent.extend("sap.ushell.components.cepsearchresult.app.Component", /** @lends sap.ushell.components.cepsearchresult.app.Component */{
    metadata: {
      manifest: "json"
    },

    /**
     * Initializes the component and defaults its intent parameters
     *
     * @private
     */
    init: function () {
      // get intent parameter values
      this._sSearchTerm = getSingleIntentParameter(this, "searchTerm", "");
      this._sCategory = getSingleIntentParameter(this, "category", "all");
      this._sEdition = "standard";
      UIComponent.prototype.init.apply(this, arguments);
    },

    /**
     * Returns the search term the component was initialized with by the corresponding intent.
     *
     * @private
     * @returns {string} the current search term.
     */
    getSearchTerm: function () {
      return this._sSearchTerm;
    },

    /**
     * Returns the category the component was initialized with by the corresponding intent.
     *
     * @private
     * @returns {string} the current category.
     */
    getCategory: function () {
      return this._sCategory;
    },

    /**
     * Returns the search configuration for the component "standard", "advanced".
     *
     * @private
     * @returns {string} the current searchConfig.
     */
    getSearchConfig: function () {
      if (window["sap-ushell-config"] &&
        window["sap-ushell-config"].ushell &&
        window["sap-ushell-config"].ushell.cepSearchConfig) {
        this._sEdition = window["sap-ushell-config"].ushell.cepSearchConfig;
      }

      var oComponentData = this.getComponentData();
      if (oComponentData && oComponentData.searchConfig) {
        this._sEdition = oComponentData.searchConfig;
      }
      return this._sEdition;
    },

    changeEdition: function (sEdition) {
      this._sEdition = sEdition;
      if (this.getRootControl() && this.getRootControl().getController()) {
        this.getRootControl().getController().initSearchResultManager();
      }
    }
  });
  return Component;
});
