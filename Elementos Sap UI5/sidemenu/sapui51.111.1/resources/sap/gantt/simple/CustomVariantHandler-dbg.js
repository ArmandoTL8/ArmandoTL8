sap.ui.define([
    "sap/ui/core/Element"
], function (Element) {
    'use strict';

    /**
	 * Creates and initializes the new Custom Variant Handler instance.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Custom variant handler of the <code>sap.gantt.simple.GanttChartContainer</code> instance.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.111.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.gantt.simple.CustomVariantHandler
	 */

    var CustomVariantHandler = Element.extend("sap.gantt.simple.CustomVariantHandler", {
        metadata: {
            properties: {
                data: {
                    type: "object", multiple: false
                },
                dependantControlID: {
                    /**
                     * Pass custom IDs to stop applying variant before controller initialization
                     * @since 1.88
                     */
                    type: "string[]", multiple: false, defaultValue: []
                }
            },
            events: {
                /**
				 * The event is triggered when custom variant data is set to update gantt chart with table
                 * @private
				 * @since 1.88
				 */
                setDataComplete: {}
            }
        },
        setData: function (oCustomData) {
            this.setProperty("data", oCustomData);
            this.fireSetDataComplete();
        },
        apply: function() {
        },
        revert: function() {
        }
    });

    return CustomVariantHandler;
});