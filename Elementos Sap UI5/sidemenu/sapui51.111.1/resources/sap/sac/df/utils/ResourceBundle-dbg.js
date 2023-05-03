/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
  "sap/sac/df/utils/ResourceBundle",
  [
    "sap/sac/df/utils/ResourceModel"
  ],
  function (ResourceModel) {
    "use strict";
    var resourceBundle = ResourceModel.getResourceBundle();
    resourceBundle.getTextWithPlaceholder = function (text, placeholder){
      return resourceBundle.getText(text, placeholder);
    };
    resourceBundle.getTextWithPlaceholder2 = function (text, placeHolder, placeHolder2){
      return resourceBundle.getText(text, [placeHolder, placeHolder2]);
    };
    return resourceBundle;
  }
);
