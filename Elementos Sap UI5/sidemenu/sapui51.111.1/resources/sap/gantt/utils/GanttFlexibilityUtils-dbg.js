sap.ui.define([], function() {
    'use strict';

    var GanttFlexibilityUtils = {
        fnCustomisationChangeHandler: function (uniqueKey) {
            return {
                "changeHandler": {
                    applyChange: function (oChange, oControl, mPropertyBag) {
                        var oModifier = mPropertyBag.modifier,
                            newValue = oChange.getContent()["newChange"],
                            oldValue = oChange.getContent()["oldChange"];
                        oChange.setRevertData(oldValue);
                        for (var property in newValue) {
                            oModifier.setPropertyBindingOrProperty(oControl, property, newValue[property]);
                        }
                        return true;
                    },
                    revertChange: function (oChange, oControl, mPropertyBag) {
                        var oModifier = mPropertyBag.modifier;
                        var oldValue = oChange.getRevertData();
                        for (var property in oldValue) {
                            oModifier.setPropertyBindingOrProperty(oControl, property, oldValue[property]);
                        }
                        oChange.resetRevertData();
                        return;
                    },
                    completeChangeContent: function (oChange, oSpecificChangeInfo, mPropertyBag) {
                        return;
                    },
                    getCondenserInfo: function (oChange) {
                        return {
                            affectedControl: oChange.getSelector(),
                            classification: sap.ui.fl.condenser.Classification.LastOneWins,
                            uniqueKey: uniqueKey
                        };
                    }
                },
                layers: {
                    "CUSTOMER_BASE": true,
                    "CUSTOMER": true
                }
            };
        },
        fnChangeHandler: function (uniqueKey) {
            return {
                "changeHandler": {
                    applyChange: function (oChange, oControl, mPropertyBag) {
                        var oModifier = mPropertyBag.modifier,
                            oChangeContent = oChange.getContent(),
                            sPropertyName = oChangeContent["propertyName"],
                            newValue = oChangeContent["newValue"],
                            oldValue = oChangeContent["oldValue"];
                        oChange.setRevertData(oldValue);
                        oModifier.setPropertyBindingOrProperty(oControl, sPropertyName, newValue);
                        return true;
                    },
                    revertChange: function (oChange, oControl, mPropertyBag) {
                        var oModifier = mPropertyBag.modifier;
                        var oldValue = oChange.getRevertData();
                        var oChangeContent = oChange.getContent(),
                            sPropertyName = oChangeContent["propertyName"];
                        oModifier.setPropertyBindingOrProperty(oControl, sPropertyName, oldValue);
                        oChange.resetRevertData();
                        return true;
                    },
                    completeChangeContent: function (oChange, oSpecificChangeInfo, mPropertyBag) {
                        return;
                    },
                    getCondenserInfo: function (oChange) {
                        return {
                            affectedControl: oChange.getSelector(),
                            classification: sap.ui.fl.condenser.Classification.LastOneWins,
                            uniqueKey: uniqueKey
                        };
                    }
                },
                layers: {
                    "USER": true // enables personalization which is by default disabled
                }
            };
        }
    };

    return GanttFlexibilityUtils;
}, /* bExport= */true);