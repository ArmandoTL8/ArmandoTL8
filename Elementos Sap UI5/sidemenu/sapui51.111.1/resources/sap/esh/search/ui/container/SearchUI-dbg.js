/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
window.onload = function () {
  sap.ui.loader.config({
    baseUrl: "../../../../../../resources/",
    paths: {
      "sap/esh/search/ui": "/resources/sap/esh/search/ui"
    }
  });
  sap.ui.getCore().attachInit(function () {
    sap.ui.require(["sap/esh/search/ui/SearchCompositeControl", "sap/m/Button", "sap/m/OverflowToolbarButton", "sap/m/ToolbarSeparator", "sap/m/MessageBox"], function (SearchCompositeControl, Button, OverflowToolbarButton, ToolbarSeparator, MessageBox) {
      var options = {
        // see SearchCompositeControl.ts and SearchConfigurationSettings.ts for available options
        sinaConfiguration: {
          provider: "sample"
        },
        getCustomToolbar: function getCustomToolbar() {
          return [new Button({
            text: "Search Dev. Guide",
            tooltip: "SAP HANA Search Developer Guide",
            press: function press() {
              return window.open("https://help.sap.com/viewer/691cb949c1034198800afde3e5be6570/2.0.05/en-US/ce86ef2fd97610149eaaaa0244ca4d36.html");
            }
          }), new Button({
            text: "Search (help.sap)",
            tooltip: "Search and Operational Analytics",
            press: function press() {
              return window.open("https://help.sap.com/viewer/6522d0462aeb4909a79c3462b090ec51/1709%20002/en-US");
            }
          }), new ToolbarSeparator(), new OverflowToolbarButton({
            icon: "sap-icon://hint",
            text: "About",
            tooltip: "About this Sample UI",
            press: function press() {
              return MessageBox.information("This is SAP Search UI, based on UI5 control 'sap.esh.search.ui.SearchCompositeControl' and 'Sample Data Provider'.");
            }
          })];
        }
        /* extendTableColumn: {    // extending columns does not work, needs refactoring
        column: {
            name: "ExtendTableCol",
            attributeId: "EXTEND_TABLE_COL",
            width: "500px",
        },
        // eslint-disable-next-line no-unused-vars
        assembleCell: (data) => {
            const itemId = "EXTEND_TABLE_COL";
            const cell = {
                isExtendTableColumnCell: true,
                itemId: itemId,
            };
            return cell;
        },
        // eslint-disable-next-line no-unused-vars
        bindingFunction: (bindingObject) => {
            new sap.m.Text({ text: "This is cell content of custom column" });
        },
        }, */
      };

      var control = new SearchCompositeControl(options);
      window.addEventListener("hashchange", function () {
        control.getModel().parseURL();
      }, false);
      control.placeAt("content");
    });
    jQuery("html").css("overflow-y", "auto");
    jQuery("html").css("height", "100%");
  });
};
})();