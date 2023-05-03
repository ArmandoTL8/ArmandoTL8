/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
    "sap/ovp/app/resources",
    "sap/ovp/cards/CommonUtils",
    "sap/ovp/app/OVPUtils"
], function (
    OvpResources,
    CommonUtils,
    OVPUtils
) {
    "use strict";
    return {
        default: {
            //Template for Overview Page Extensibility via UI Adaptation Editor tool
            controllerExtensionTemplate: "sap/ovp/ui/OVPControllerExtensionTemplate",
            actions: {},
            // this object defines hooks that are being called when a tool, e.g. Runtime Adaptation, is started and stopped.
            tool: {
                start: function () {
                    var oMainController = CommonUtils.getApp();
                    oMainController.bRTAActive = true;
                },
                stop: function () {
                    var oMainController = CommonUtils.getApp();
                    oMainController.bRTAActive = false;
                }
            },
            aggregations: {
                DynamicPage: {
                    propagateMetadata: function (oElement) {
                        var validateClassToolBar = function (oControl) {
                            var classList1Exists =
                                oControl.hasStyleClass("sapUiSizeCompact") &&
                                oControl.hasStyleClass("dropDrownCompact"),
                                classList2Exists =
                                    oControl.hasStyleClass("sapUiSizeCozy") &&
                                    oControl.hasStyleClass("sapOvpDropDownPadding") &&
                                    oControl.hasStyleClass("dropDrownCozy");
                            return classList1Exists || classList2Exists;
                        };
                        var validateClassCountHeader = function (oControl) {
                            var classList1Exists =
                                oControl.hasStyleClass("sapOvpHeaderCounter");
                            return classList1Exists;
                        };
                        var validateClassTargetDeviation = function (oControl) {
                            var classList1Exists =
                                oControl.hasStyleClass("cardHeaderText") &&
                                oControl.hasStyleClass("sapOvpKPIHeaderTrendPercentStyle"),
                                classList2Exists =
                                    oControl.hasStyleClass("KpiDeviationText") &&
                                    oControl.hasStyleClass("sapOvpKPIHeaderTrendPercentStyle");
                            return classList1Exists || classList2Exists;
                        };
                        var sType = oElement.getMetadata().getName();
                        var sLayer = CommonUtils._getLayer();
                        var bKPIExists =
                            sType === "sap.m.FlexBox" &&
                            oElement &&
                            oElement.getId() &&
                            oElement.getId().indexOf("kpiHBoxNumeric"),
                            bInsightsAdditionalActions =
                                sType === "sap.m.Button" &&
                                oElement &&
                                oElement.getId() &&
                                oElement.getId().indexOf("sapOvpCardAdditionalActions"),
                            bKPITargetValue =
                                sType === "sap.m.Text" &&
                                oElement &&
                                oElement.getId() &&
                                oElement.getId().indexOf("ovpTargetValue") &&
                                validateClassTargetDeviation(oElement),
                            bKPIDeviation =
                                sType === "sap.m.Text" &&
                                oElement &&
                                oElement.getId() &&
                                oElement.getId().indexOf("ovpKPIDeviation") &&
                                validateClassTargetDeviation(oElement),
                            bCountHeader =
                                sType === "sap.m.Text" &&
                                oElement &&
                                oElement.getId() &&
                                oElement.getId().indexOf("ovpCountHeader") &&
                                validateClassCountHeader(oElement),
                            bLinklistItem =
                                sType === "sap.m.CustomListItem" &&
                                oElement &&
                                oElement.getId() &&
                                oElement.getId().indexOf("linkListItem"),
                            bTableSmartLink =
                                sType === "sap.ui.comp.navpopover.SmartLink" &&
                                oElement &&
                                oElement.getId() &&
                                oElement.getId().indexOf("ovpTable"),
                            bKPIHeader =
                                sType === "sap.m.VBox" &&
                                oElement &&
                                oElement.getId() &&
                                oElement.getId().indexOf("kpiHeader"),
                            bToolBarExists =
                                sType === "sap.m.Toolbar" &&
                                oElement &&
                                oElement.getId() &&
                                oElement.getId().indexOf("toolbar") &&
                                validateClassToolBar(oElement);

                        if (bKPIExists || bKPIHeader || bToolBarExists || bInsightsAdditionalActions || bTableSmartLink || bKPITargetValue || bKPIDeviation || bLinklistItem || bCountHeader) {
                            return {
                                actions: "not-adaptable"
                            };
                        } else if (
                            sType !== "sap.ovp.ui.EasyScanLayout" &&
                            sType !== "sap.ui.core.ComponentContainer" &&
                            !(
                                sLayer &&
                                (sLayer === OVPUtils.Layers.vendor || sLayer === OVPUtils.Layers.customer_base) &&
                                sType === "sap.ui.comp.smartfilterbar.SmartFilterBar"
                            )
                        ) {
                            return {
                                actions: {
                                    remove: null,
                                    reveal: null
                                }
                            };
                        }
                    },
                    propagateRelevantContainer: false
                }
            }
        },
        strict: {
            actions: {
                /*settings: function () {
                    return {
                        isEnabled: false, //Disabled as of now
                        handler: function (oElement, fGetUnsavedChanges) {
                            AppSettingsUtils.getDialogBox(oElement).then(function (oDialogBox) {
                                oDialogBox.open();
                            });
                            return Promise.resolve([]);
                        }
                    };
                }*/
            },
            name: {
                singular: OvpResources && OvpResources.getText("Card"),
                plural: OvpResources && OvpResources.getText("Cards")
            }
        }
    };
}, false);
