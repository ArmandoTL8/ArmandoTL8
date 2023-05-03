/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
  "sap/sac/df/types/export/PDFConfig",
  [
    "sap/ui/base/ManagedObject",
    "sap/sac/df/firefly/library"
  ],
  function (ManagedObject, FF) {
    "use strict";
    return ManagedObject.extend(
      "sap.sac.df.types.export.PDFConfig",
      {
        metadata: {
          properties: {
            pageSize: {
              type: "string",
              defaultValue: "a4"
            },
            fontSize: {
              type: "number",
              defaultValue: 6
            },
            orientation: {
              type: "string",
              defaultValue: "landscape"
            },
            builtInFont: {
              type: "string",
              defaultValue: "Helvetica"
            },
            autoSize: {
              type: "boolean",
              defaultValue: true
            },
            freezeRows: {
              type: "number"
            },
            numberLocation: {
              type: "string"
            },
          }
        },
        getFireflyConfig: function (fileName) {
          var export_config = FF.PdfConfig.createDefault(FF.PrFactory.createStructure(), fileName);
          export_config.setPageSize(this.getPageSize());
          export_config.setFontSize(this.getFontSize());
          export_config.setOrientation(this.getOrientation());
          export_config.setBuiltInFont(this.getBuiltInFont());
          export_config.setAutoSize(this.getAutoSize());
          export_config.setFreezeRows(this.getFreezeRows());
          export_config.setNumberLocation(this.getNumberLocation());
          return export_config;
        }
      }
    );
  }
);
