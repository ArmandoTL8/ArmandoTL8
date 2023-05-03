sap.ui.define([
    "sap/fe/navigation/PresentationVariant",
    "sap/ovp/cards/AnnotationHelper",
    "sap/ovp/cards/CommonUtils",
    "sap/ovp/cards/Integration/Helpers/Filters",
    "sap/ovp/helpers/ODataAnnotationHelper"
], function (
    PresentationVariant,
    CardAnnotationHelper,
    CommonUtils,
    Filterhelper,
    ODataAnnotationHelper
) {
    "use strict";

    function getNavigationIntentFromAuthString(sAuthString) {
        if (sAuthString.startsWith("#")) {
            sAuthString = sAuthString.slice(1);
        }

        var aAuth = sAuthString.split("-");
        var sSemanticObject = aAuth[0] || "";
        var sAction = aAuth[1] ? aAuth[1].split("?")[0] : "";
        var oQueryMap = {};

        var sQueryParameters = aAuth[1] ? aAuth[1].split("?")[1] : undefined;
        if (sQueryParameters) {
            var aQueryParameters = sQueryParameters.split("&");
            for (var i = 0; i < aQueryParameters.length; i++) {
                var sQuery = aQueryParameters[i];
                var sParam = sQuery.split("=")[0];
                var sValue = sQuery.split("=")[1];
                oQueryMap[sParam] = sValue;
            }
        }
        return {
            semanticObject: sSemanticObject,
            action: sAction,
            parameters: oQueryMap
        };
    }

    function bCheckNavigationForCard(oController) {
        if (!oController) {
            return false;
        }

        var oEntityType = oController.getEntityType();
        var oCardPropertiesModel = oController.getCardPropertiesModel();

        if (oEntityType && oCardPropertiesModel) {
            var sIdentificationAnnotationPath = oCardPropertiesModel.getProperty("/identificationAnnotationPath");
            var aRecords = oEntityType[sIdentificationAnnotationPath];

            if (oController.isNavigationInAnnotation(aRecords)) {
                return true;
            }
        }

        var oCardPropertiesModel = oController.getCardPropertiesModel();
        var sCardType = oCardPropertiesModel && oCardPropertiesModel.getProperty("/template");
        var aLineItemSupportedCardTemplates = ["sap.ovp.cards.table", "sap.ovp.cards.list", "sap.ovp.cards.v4.table", "sap.ovp.cards.v4.list"];
        if (aLineItemSupportedCardTemplates.indexOf(sCardType) > -1 && oController.checkLineItemNavigation()) {
            return true;
        }

        return false;
    }

    function getNavigationParameters(oController, oCardDefinition) {
        var aNavigationFields = oController.getEntityNavigationEntries() || [];
        var oNavigationField = aNavigationFields.length > 0 ? aNavigationFields[0] : {};

        if (oCardDefinition.cardComponentName === "List" || oCardDefinition.cardComponentName === "Table") {
            var oCardItemsBinding = oController.getCardItemsBinding(),
                oLineItemContexts = oCardItemsBinding && oCardItemsBinding.getAllCurrentContexts(),
                oCurrentContext = oLineItemContexts && oLineItemContexts[0],
                sLineItemAnnotationPath = oController.getCardPropertiesModel().getProperty("/annotationPath"),
                aLineItemNavigationFields = oController.getEntityNavigationEntries(oCurrentContext, sLineItemAnnotationPath),
                oLineItemNavigationField = aLineItemNavigationFields.length > 0 ? aLineItemNavigationFields[0] : {};

            var oNavigationContextLineItem = {};
            var oNavigationContext = {};

            if (oNavigationField && oNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
                oNavigationContext = _getNavigationWithUrlParamters(oController, oNavigationField);
            } else if (oNavigationField && oNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
                oNavigationContext = _getNavigationWithIntent(oController, oNavigationField);
            }

            if (oLineItemNavigationField && oLineItemNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
                oNavigationContextLineItem = _getNavigationWithUrlParamters(oController, oLineItemNavigationField);
            } else if (oLineItemNavigationField && oLineItemNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
                oNavigationContextLineItem = _getNavigationWithIntent(oController, oLineItemNavigationField);
            }

            if (oNavigationContextLineItem.semanticObject &&
                oNavigationContextLineItem.action &&
                oNavigationContext.semanticObject &&
                oNavigationContext.action) {
                oNavigationContext["lineItemSemanticObject"] = oNavigationContextLineItem.semanticObject;
                oNavigationContext["lineItemAction"] = oNavigationContextLineItem.action;
            } else if (oNavigationContextLineItem.semanticObject &&
                oNavigationContextLineItem.action) {
                oNavigationContextLineItem["lineItemSemanticObject"] = oNavigationContextLineItem.semanticObject;
                oNavigationContextLineItem["lineItemAction"] = oNavigationContextLineItem.action;
                oNavigationContextLineItem.semanticObject = "";
                oNavigationContextLineItem.action = "";

                return oNavigationContextLineItem;
            }

            return oNavigationContext;
        }

        if (oNavigationField && oNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
            return _getNavigationWithUrlParamters(oController, oNavigationField);
        }

        if (oNavigationField && oNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
            return _getNavigationWithIntent(oController, oNavigationField);
        }

        // TODO: KPI detail type
    }

    function _getNavigationWithUrlParamters(oController, oNavigationField) {
        if (!sap.ushell.Container) {
            return;
        }

        var oParsingSerivce = sap.ushell.Container.getService("URLParsing");
        if (!oParsingSerivce.isIntentUrl(oNavigationField.url)) {
            return {
                type: "url",
                url: oNavigationField.url
            };
        } else {
            var oNav = _getNavigationWithIntent(oController, oNavigationField);
            if (oNav.semanticObject) {
                return oNav;
            } else {
                var oParsedShellHash = oParsingSerivce.parseShellHash(oNavigationField.url);
                //Url can also contain an intent based navigation with route, route can be static or dynamic with paramters
                //Url navigation without app specific route will trigger storing of appstate
                // var bWithRoute = oParsedShellHash.appSpecificRoute ? true : false;
                return _getNavigationWithIntent(oController, oParsedShellHash);
            }
        }
    }

    function getStaticParams(oController) {
        var oAllData = _getEntityNavigationParameters(oController);
        var oPresentationVariant = oAllData && oAllData["sNavPresentationVariant"];
        if (oPresentationVariant && !CommonUtils.isJSONData(oPresentationVariant)) {
            oAllData["sNavPresentationVariant"] = Filterhelper.removeExtraInfoVariant(oPresentationVariant);
        }
        return oAllData;
    }

    function _getSensitivePropertiesEntityType(oEntityType) {
        var aSensitiveProps = [];
        for (var i = 0; i < oEntityType.property.length; i++) {
            if (oEntityType.property[i]["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] &&
                oEntityType.property[i]["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"].Bool) {
                aSensitiveProps.push(oEntityType.property[i].name);
            }
        }
        return aSensitiveProps;
    }

    function _getEntityNavigationParameters(oController) {
        var oCardPropertiesModel = oController.getCardPropertiesModel(),
            oStaticLinkList = oCardPropertiesModel && oCardPropertiesModel.getProperty("/staticContent");
        var oStaticParameters, oPresentationVariant;

        if (!oStaticLinkList) {
            var oCardSorters = CardAnnotationHelper.getCardSorters(
                oController.getCardPropertiesModel()
            );
            var oEntityType = oController.getEntityType();

            oPresentationVariant = oCardSorters && new PresentationVariant(oCardSorters);
            oStaticParameters = oCardPropertiesModel && oCardPropertiesModel.getProperty("/staticParameters");
        }

        var aSensitiveProps = _getSensitivePropertiesEntityType(oEntityType);

        return {
            sensitiveProperties: aSensitiveProps,
            staticPropertyMap: oStaticParameters,
            sNavPresentationVariant: oPresentationVariant ? oPresentationVariant.toJSONObject() : null
        };
    }

    function _getNavigationWithIntent(oController, oNavigationField) {
        return {
            type: "intent",
            semanticObject: oNavigationField.semanticObject,
            action: oNavigationField.action,
            staticParams: getStaticParams(oController)
        };
    }

    function checkIBNNavigationInAnnotation (aAnnotationRecords, oEntityModel) {
        if (aAnnotationRecords && aAnnotationRecords.length) {
            var bOdataV4Model = CommonUtils.isODataV4(oEntityModel);
            for (var i = 0; i < aAnnotationRecords.length; i++) {
                var oItem = aAnnotationRecords[i];
                if (bOdataV4Model && oItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
                    return true;
                } else if (!bOdataV4Model && oItem.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
                    return true;
                }
            }
        }
        return false;
    }

    function checkHeaderNavForChart(oCardPropertiesModel) {
        if (oCardPropertiesModel) {
            var template = oCardPropertiesModel.getProperty("/template");
            var navigation = oCardPropertiesModel.getProperty("/navigation");
            if (navigation == "noHeaderNav" && ["sap.ovp.cards.charts.analytical","sap.ovp.cards.charts.smart.chart"].indexOf(template) > -1) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    function checkIdentificationAnnotationNavigation(oCardPropsModel, oEntityType, oEntityModel) {
        if (oEntityType && oCardPropsModel) {
            var sIdentificationAnnotationPath = oCardPropsModel.getProperty("/identificationAnnotationPath");
            var aRecords = ODataAnnotationHelper.getRecords(oEntityType, sIdentificationAnnotationPath, oEntityModel);
            return checkIBNNavigationInAnnotation(aRecords, oEntityModel);
        }
        return false;
    }

    function checkKPIAnnotationNavigation(oCardPropsModel, oEntityType) {
        if (oEntityType && oCardPropsModel) {
            if (oCardPropsModel.getProperty("/template") === "sap.ovp.cards.charts.analytical") {

                var sKpiAnnotationPath = oCardPropsModel.getProperty("/kpiAnnotationPath");

                if (sKpiAnnotationPath) {
                    var oRecord = oEntityType[sKpiAnnotationPath];
                    if (oRecord && oRecord.Detail) {
                        var sSemanticObject = oRecord.Detail.SemanticObject && oRecord.Detail.SemanticObject.String;
                        var sAction = oRecord.Detail.Action && oRecord.Detail.Action.String;
                        if (sSemanticObject && sAction) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    function checkLineItemNavigation(oCardPropsModel, oEntityType, oEntityModel) {
        if (oEntityType && oCardPropsModel) {
            var sAnnotationPath = oCardPropsModel.getProperty("/annotationPath");
            var aRecords = ODataAnnotationHelper.getRecords(oEntityType, sAnnotationPath, oEntityModel);
            return checkIBNNavigationInAnnotation(aRecords, oEntityModel);
        }
        return false;
    }


    return {
        getNavigationIntentFromAuthString: getNavigationIntentFromAuthString,
        bCheckNavigationForCard: bCheckNavigationForCard,
        getNavigationParameters: getNavigationParameters,
        checkHeaderNavForChart: checkHeaderNavForChart,
        checkLineItemNavigation: checkLineItemNavigation,
        checkIdentificationAnnotationNavigation: checkIdentificationAnnotationNavigation,
        checkKPIAnnotationNavigation: checkKPIAnnotationNavigation
    };
},/* bExport= */true);