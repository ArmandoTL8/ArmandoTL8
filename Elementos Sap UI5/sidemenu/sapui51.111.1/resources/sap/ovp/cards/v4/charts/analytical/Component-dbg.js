sap.ui.define([
    "sap/ovp/cards/v4/generic/Component",
    "sap/ovp/cards/v4/charts/VizAnnotationManager",
    "sap/ovp/cards/jUtils"
], function (
    CardComponent,
    VizAnnotationManager,
    jUtils
) {
    "use strict";

    return CardComponent.extend("sap.ovp.cards.v4.charts.analytical.Component", {
        // use inline declaration instead of component.json to save 1 round trip
        metadata: {
            properties: {
                headerExtensionFragment: {
                    type: "string",
                    defaultValue: "sap.ovp.cards.v4.generic.KPIHeader"
                },
                contentFragment: {
                    type: "string",
                    defaultValue: "sap.ovp.cards.v4.charts.analytical.analyticalChart"
                },
                controllerName: {
                    type: "string",
                    defaultValue: "sap.ovp.cards.v4.charts.analytical.analyticalChart"
                },
                enableAddToInsights : {
                    type: "boolean",
                    defaultValue: false
                }
            },
            version: "1.111.0",
            library: "sap.ovp",
            includes: [],
            dependencies: {
                libs: ["sap.viz"],
                components: []
            },
            config: {}
        },

        onAfterRendering: function () {
            jUtils.setAttributeToMultipleElements(".tabindex0", "tabindex", 0);
            jUtils.setAttributeToMultipleElements(".tabindex-1", "tabindex", -1);
        }
    });
});
