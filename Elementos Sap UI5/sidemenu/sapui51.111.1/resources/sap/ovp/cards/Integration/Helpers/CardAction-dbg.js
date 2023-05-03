sap.ui.define([
    "sap/ovp/app/NavigationHelper",
    "sap/ovp/cards/CommonUtils"
], function (NavigationHelper, CommonUtils) {
    "use strict";

    return {

        /**
         * 
         * formulates Integration card header and content actions from OVP cards and return it.
         * consider identificationannotationpath and noheadernav manifest properties for analytical card.
         * for List / Table cards consider both identificationannotationpath and lineitem annotationpath.
         * 
         * @param {object} oCardDefinition The card definition
         * @param {object} oSapCard The Integrtaion card definition
         * @returns {object} oActions The action object containing both header and content actions
         */
        getCardActions : function(oCardDefinition, oSapCard) {
            var oActions = {
                header: {
                    enabled: false,
                    actions: []
                },
                content: {
                    enabled: false,
                    actions: []
                }
            };
            var bHasNavigation = false,
                bHasHeaderNavigation = false;
            var oView = oCardDefinition.view;
            var oController = oView.getController();
            var oNavigationParameters = {};
            if (oCardDefinition.cardComponentName === "Analytical") {
                bHasHeaderNavigation = !oController.checkHeaderNavForChart();
            }
            bHasNavigation = NavigationHelper.bCheckNavigationForCard(oController);
            if (!bHasNavigation) {
                return oActions;
            }
            oNavigationParameters = NavigationHelper.getNavigationParameters(oController, oCardDefinition);
            if (oNavigationParameters === undefined) {
                return oActions;
            }

            if (oCardDefinition.cardComponentName === "List" || oCardDefinition.cardComponentName === "Table") {
                bHasHeaderNavigation = oNavigationParameters["semanticObject"] && oNavigationParameters["action"];
            }

            var oParams = {
                ibnTarget: {},
                ibnParams: {}
            };
    
            var oHeaderParameterValue = {
                type: "Navigation"
            };
    
            var oContentParameterValue = {
                type: "Navigation"
            };
    
            if (oNavigationParameters && oNavigationParameters.type === "url") {
                oParams = {
                    type: "Navigation",
                    parameters: {
                        target: "_self"
                    }
                };
                CommonUtils.updatePropertyValueForObject(oParams.parameters, oNavigationParameters.url, "url");
            } else {
                if (
                    oNavigationParameters.semanticObject ||
                    oNavigationParameters.action ||
                    oNavigationParameters.staticParams
                ) {
    
                    oParams.ibnTarget = {
                        "semanticObject": oNavigationParameters.semanticObject,
                        "action": oNavigationParameters.action
                    };
    
                    if (!oSapCard.configuration.parameters.state && oCardDefinition.cardComponentName === "Analytical") {
                        oSapCard.configuration.parameters.state = {
                            value : ""
                        };
                    }

                    var aSensitiveProps = [];

                    if (oNavigationParameters.staticParams) {
                        if (oNavigationParameters.staticParams.sNavPresentationVariant) {
                            oParams.ibnParams.presentationVariant = oNavigationParameters.staticParams.sNavPresentationVariant;
                        }
                        if (oNavigationParameters.staticParams.sensitiveProperties) {
                            aSensitiveProps = oNavigationParameters.staticParams.sensitiveProperties;
                        }
                        var oStaticProps = oNavigationParameters.staticParams.staticPropertyMap;
                        var aKeys = oStaticProps && Object.keys(oStaticProps) || [];
                        for (var i  = 0; i < aKeys.length; i++) {
                            if (aKeys[i] && oStaticProps[aKeys[i]] && !aSensitiveProps.includes(aKeys[i])) {
                                oParams.ibnParams[aKeys[i]] = oStaticProps[aKeys[i]];
                            }
                        }
                    }
                    oParams.sensitiveProps = aSensitiveProps;
                }
            }

            oActions.content.enabled = true;
            oActions.content.actions.push(oContentParameterValue);
            if (bHasHeaderNavigation) {
                oActions.header.enabled = true;
                oActions.header.actions.push(oHeaderParameterValue);
            }
    
            if (oCardDefinition.cardComponentName === "Analytical") {
                CommonUtils.updatePropertyValueForObject(oHeaderParameterValue, "{= extension.formatters.getNavigationContext(${parameters>/state/value})}", "parameters");
                CommonUtils.updatePropertyValueForObject(oContentParameterValue, "{= extension.formatters.getNavigationContext(${parameters>/state/value}, ${})}", "parameters");
                oSapCard.configuration.parameters.state.value = JSON.stringify(oParams);
            } else {
                if (oParams.ibnTarget["semanticObject"] && oParams.ibnTarget["action"]) {
                    CommonUtils.updatePropertyValueForObject(oHeaderParameterValue, "{= extension.formatters.getNavigationContext(${parameters>/headerState/value})}", "parameters");
                    oSapCard.configuration.parameters.headerState = {
                        value : ""
                    };
                    oSapCard.configuration.parameters.headerState.value = JSON.stringify(oParams);
                    oNavigationParameters["lineItemSemanticObject"] = oNavigationParameters["lineItemSemanticObject"] || oParams.ibnTarget["semanticObject"];
                    oNavigationParameters["lineItemAction"] = oNavigationParameters["lineItemAction"] || oParams.ibnTarget["action"];
                }

                if (oNavigationParameters["lineItemSemanticObject"] && oNavigationParameters["lineItemAction"]) {
                    oParams.ibnTarget["semanticObject"] = oNavigationParameters["lineItemSemanticObject"];
                    oParams.ibnTarget["action"] = oNavigationParameters["lineItemAction"];

                    CommonUtils.updatePropertyValueForObject(oContentParameterValue, "{= extension.formatters.getNavigationContext(${parameters>/lineItemState/value}, ${})}", "parameters");
                    oSapCard.configuration.parameters.lineItemState = {
                        value : ""
                    };
                    oSapCard.configuration.parameters.lineItemState.value = JSON.stringify(oParams);
                }
            }
            
            return oActions;
        }
    };
}, /* bExport= */ true);