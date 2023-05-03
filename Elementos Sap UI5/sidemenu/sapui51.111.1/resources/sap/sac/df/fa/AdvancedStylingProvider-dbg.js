/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define("sap/sac/df/fa/AdvancedStylingProvider", ["sap/ui/base/Object"],
  function (ObjectBase) {
    "use strict";

    var defaultTemplate = {
      "TableDefinition": {
        "CType": "VisualizationTableDefinition",
        "ScopedStyle": [],
        "ShowFormulas": false,
        "ShowFreezeLines": true,
        "ShowGrid": false,
        "ShowReferences": false,
        "ShowSubtitle": false,
        "ShowTableDetails": false,
        "ShowTableTitle": false,
        "StripeDataColumns": false,
        "StripeDataRows": false,
        "Styles": [],
        "TableHeaderCompactionType": "PreferablyColumn",
        "TableMarkup": []
      }
    };


    var facmp = ObjectBase.extend("sap.sac.df.fa.FlexAnalysisContextMenuProvider", {

      constructor: function () {
        this.astRegistry = {};
        this.astRegistry.default = defaultTemplate;
      },
      registerAdvancedStylingTemplate: function (name, templateObject) {
        this.astRegistry[name] = templateObject;
      },
      getTemplate: function (name) {
        var template = this.astRegistry[name] || defaultTemplate;
        return template;
      }
    });



    return facmp;
  }
);
