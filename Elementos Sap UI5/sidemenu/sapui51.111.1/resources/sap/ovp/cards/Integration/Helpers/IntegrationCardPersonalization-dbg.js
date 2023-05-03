sap.ui.define([
    "sap/m/MessageToast",
    "sap/ovp/app/OVPLogger",
    "sap/ovp/app/resources",
    "sap/ui/thirdparty/jquery"
], function (
    MessageToast,
    OVPLogger,
    OvpResources,
    jQuery
) {
    "use strict";

    var sContainerKey = "ovp-based-integration-cards";
    var oLogger = new OVPLogger("sap.ovp.cards.Integration.Helpers.IntegrationCardPersonalization");

    var IntegrationCardPersonalization = function (oContainer) {
        this.oContainer = oContainer;
    };

    IntegrationCardPersonalization.prototype.writeManifest = function (sKey, oData) {
        var bDesignTime = false;
        if (bDesignTime) {
            jQuery.ajax({
                type: "POST",
                url: "/editor/card/" + sKey.split(":")[0],
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(oData),
                success: function (oResponse) {
                    oLogger.info("Success:", oResponse);
                },
                error: function (oError) {
                    oLogger.error("Error:", oError);
                }
            });
        } else {
            try {
                //TODO: The key has a length restriction so maybe we store all pages in one entry in future...
                this.oContainer.setItemValue(sKey, oData);
                this.oContainer
                    .save()
                    .then(function () {
                        MessageToast.show(OvpResources.getText("INT_CARD_ADD_SUCCESS"));
                    })
                    .catch(function (err) {
                        MessageToast.show(OvpResources.getText("INT_CARD_ADD_ERROR"));
                    });
            } catch (e) {
                MessageToast.show(OvpResources.getText("INT_CARD_ADD_ERROR"));
            }
        }
    };

    IntegrationCardPersonalization.prototype.readManifest = function (sKey) {
        var oManifest = this.oContainer.getItemValue(sKey);
        return oManifest;
    };

    IntegrationCardPersonalization.prototype.readAllManifests = function () {
        var aKeys = this.oContainer.getItemKeys() || [];
        return aKeys.map(
            function (sKey) {
                return this.readManifest(sKey);
            }.bind(this)
        );
    };

    // unused at the moment, need to use i18n if this function is used while implementing removal
    IntegrationCardPersonalization.prototype.deleteAllManifests = function () {
        this.oContainer.clear();
        this.oContainer
            .save()
            .then(function () {
                MessageToast.show("All Cards have been removed from my insights");
            })
            .catch(function (err) {
                MessageToast.show("Error: Cards couldn't be removed");
            });
    };

    return {
        create: function (oComponent) {
            return sap.ushell.Container.getServiceAsync("Personalization")
                .then(function (oPersonalizationService) {
                    var oScope = {
                        shared: true
                    };
                    return oPersonalizationService.getContainer(sContainerKey, oScope);
                })
                .then(function (oPersContainer) {
                    return new IntegrationCardPersonalization(oPersContainer);
                });
        }
    };
}, /* bExport= */true);