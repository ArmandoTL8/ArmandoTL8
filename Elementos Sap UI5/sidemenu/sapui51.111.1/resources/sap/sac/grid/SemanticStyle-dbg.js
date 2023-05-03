/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(
  [
    "sap/ui/core/Element"
  ],
  function (
    Element
  ) {
    "use strict";
    /** Creates and initializes a new Semantic style.
     * settings.
     * @public
     *
     * @class Cell of a Pivot Table.
     * @extends sap.ui.core.Element
     * @abstract
     * @author SAP SE
     * @version 1.111.0
     * @experimental
     * @alias sap.sac.grid.SemanticStyle
     * @since 1.0.0
     */
    var oSemanticStyle = Element.extend(
      "sap.sac.grid.SemanticStyle", {
        metadata: {
          library: "sap.sac.grid",
          properties: {
            /**
             * The value that is displayed in the cell
             */
            "member": {
              type: "string"
            },
            /**
             * The associated css class
             */
            "class": {
              type: "string"
            }
          }
        }
      }
    );
    return oSemanticStyle;
  }
);
