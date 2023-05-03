/*global sap,Promise*/
sap.ui.define("sap/sac/df/variablebar/FieldBaseDelegate", [
  "sap/ui/mdc/field/FieldBaseDelegate",
  "sap/sac/df/variablebar/TypeUtil"
], function (FieldBaseDelegate, DragonFlyTypeUtil) {
  "use strict";
  var DragonFlyFieldBaseDelegate = Object.assign({}, FieldBaseDelegate);

  DragonFlyFieldBaseDelegate._getDataProvider = function (oFilterField) {
    var oFilterBar = oFilterField.getParent();
    if (oFilterBar.isA("sap.sac.df.FilterBar")) {
      return oFilterBar._oFilterBarHandler._getDataProvider();
    } else if (oFilterBar.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar")) {
      return sap.ui.getCore().byId(oFilterBar.getAdaptationControl())._oFilterBarHandler._getDataProvider();
    }
    return null;
  };

  DragonFlyFieldBaseDelegate.getDescription = function (oPayload, oFieldHelp, vKey, oInParameters, oOutParameters, oBindingContext, oConditionModel, sConditionModelName, oConditionPayload, oControl) {
    var sVariableName = oControl.getFieldPath();
    var sText = "";
    var oCurrentCondition = oControl.getConditions(sVariableName).find(function (oCondition) {
      return oCondition.values[0] === vKey;
    });
    if (oCurrentCondition.values.length > 1) {
      return Promise.resolve(oCurrentCondition.values[1]);
    }
    var oParentControl = oControl.getParent();
    if (oParentControl.isA("sap.ui.mdc.filterbar.p13n.AdaptationFilterBar")) {
      var aFilterItems = sap.ui.getCore().byId(oParentControl.getAdaptationControl()).getFilterItems();
      var oCurrentFilterItem = aFilterItems.find(function(oItem) {
        return oItem.getFieldPath() === sVariableName;
      });
      var oCondition = oCurrentFilterItem && oCurrentFilterItem.getConditions().find(function(oCondition) {
        return oCondition.values[0] === oCurrentCondition.values[0];
      });
      if (oCondition && oCondition.values.length > 1) {
        return Promise.resolve(oCondition.values[1]);
      }
    }
    var oDataProvider = this._getDataProvider(oControl);
    if (oDataProvider) {
      var oVariable = oDataProvider.Variables[sVariableName];
      var oMemberFilter = oVariable.MemberFilter.find(function (oItem) {
        return vKey === oItem.Low;
      });
      sText = oMemberFilter && oMemberFilter.Text !== oMemberFilter.Low ? oMemberFilter.Text : "";
      if (!sText) {
        return this._requestText(oDataProvider, sVariableName, vKey);
      }
    }
    return Promise.resolve(sText);
  };


  DragonFlyFieldBaseDelegate.getItemForValue = function (oPayload, oFieldHelp, oConfig) {
    if (!oConfig.value) {
      return Promise.resolve();
    }

    var oFilterField = oConfig.control;
    var oDataProvider = this._getDataProvider(oFilterField);
    if (oDataProvider && oConfig.value) {
      var sKey = oConfig.dataType.getName() === "String" ? oConfig.value.toUpperCase() : oConfig.value;
      return this._requestText(oDataProvider, oFilterField.getFieldPath(), sKey);
    }
    return Promise.resolve();
  };

  DragonFlyFieldBaseDelegate._requestText = function (oDataProvider, sFieldName, sKey) {
    return oDataProvider.searchVariableValues(sFieldName, sKey, false, true, true)
      .then(function (aResult) {
        if (!aResult.length) {
          return Promise.resolve();
        }
        var oResult = this._getResult(aResult);
        var oValue = {
          key: oResult.Key
        };
        oValue.description = aResult.length === 1 && oResult.Key !== oResult.Text ? oResult.Text : "";
        return oValue;
      }.bind(DragonFlyFieldBaseDelegate));
  };

  //for hierarchy value help, the key + text is in the deepest children
  DragonFlyFieldBaseDelegate._getResult = function (aResult) {
    var oResult = aResult[0];
    while (oResult.Children) {
      oResult = oResult.Children[0];
    }
    return oResult;
  };

  DragonFlyFieldBaseDelegate.isInvalidInputAllowed = function () {
    return false;
  };

  DragonFlyFieldBaseDelegate.isInputValidationEnabled = function(oPayload) {
    return oPayload.supportsValueHelp && oPayload.valueType !== "Date";
  };

  DragonFlyFieldBaseDelegate.getDataTypeClass = function(oPayload, sType) {
    return DragonFlyTypeUtil.getDataTypeClassName(sType);
  };

  DragonFlyFieldBaseDelegate.getTypeUtil = function () {
    return DragonFlyTypeUtil;
  };

  return DragonFlyFieldBaseDelegate;
});
