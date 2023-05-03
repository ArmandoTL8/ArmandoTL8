/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define("sap/sac/df/FlexAnalysisPanel",[
  "sap/ui/core/Element"
], function(Element) {

  /**
   * Constructor for a new Flexible Analysis Panel.
   *
   * @param {string} [sId] id for the new control, generated automatically if no id is given
   * @param {object} [mSettings] initial settings for the new control
   *
   * @class A panel to be added into FlexAnalysis control
   * @extends sap.ui.core.Element
   *
   * @author SAP SE
   * @version 1.111.0
   *
   * @constructor
   * @public
   * @alias sap.sac.df.FlexAnalysisPanel
   */
  var  FlexAnalysisPanel = Element.extend("sap.sac.df.FlexAnalysisPanel",/** @lends sap.sac.df.FlexAnalysisPanel.prototype */ {
    metadata: {
      library: "sap.sac.df",
      properties: {
        /**
         * The description of the panel, displayed as tooltip on the side navigation item.
         */
        description: "string",

        /**
         * The title of the panel header.
         */
        title: "string",

        /**
         * The icon of the panel, displayed on the side navigation item and the panel header.
         */
        icon: "sap.ui.core.URI",
      },
      aggregations: {
        /**
         * The content of this panel
         */
        content : {
          type : "sap.ui.core.Control",
          multiple : false
        }
      },
      defaultAggregation: "content"
    },

    getPanelId: function () {
      var sId = this.getId();
      return sId.indexOf("--") !== -1 ? sId.split("--").pop() : sId;
    },
    
    getDocumentType: function() {
      return sap.firefly.AuGdsDocumentType.QUERY_BUILDER;
    },
    
    renderPanelContent: function(oContentWrapper) {
      var oContainer = oContentWrapper && oContentWrapper.getNativeControl();
      if (oContainer) {
        var oContent = this.getContent();
        if (oContent) {
          oContainer.insertContent(oContent);
        } else {
          throw new Error("No content defined for custom panel.");
        }
      } else {
        throw new Error("Container control not found. Unable to add custom panel.");
      }
    }
  });
  return FlexAnalysisPanel;
});
