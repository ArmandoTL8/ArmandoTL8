/*global sap*/
sap.ui.define("sap/sac/df/variablebar/TypeUtil", [
  "sap/ui/mdc/util/TypeUtil"
], function (BaseTypeUtil) {
  "use strict";

  var DragonFlyTypeUtil = Object.assign({}, BaseTypeUtil, {
    getDataTypeClassName: function (sType) {
      var mTypes = {
        String: "sap.ui.model.type.String",
        Double: "sap.ui.model.type.Float",
        Date: "sap.ui.model.type.Date",
        Boolean: "sap.ui.model.type.Boolean"
      };
      return mTypes[sType] || sType;
    }
  });

  return DragonFlyTypeUtil;
});
