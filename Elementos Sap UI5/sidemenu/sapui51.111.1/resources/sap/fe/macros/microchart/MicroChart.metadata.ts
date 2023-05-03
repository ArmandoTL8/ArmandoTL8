import MacroMetadata from "sap/fe/macros/MacroMetadata";

/**
 * @classdesc
 * Building block used to create a MicroChart based on the metadata provided by OData V4.
 * @class sap.fe.macros.MicroChart
 * @hideconstructor
 * @public
 * @since 1.93.0
 */
const MicroChart = MacroMetadata.extend("sap.fe.macros.microchart.MicroChart", {
	/**
	 * Name of the macro control.
	 */
	name: "MicroChart",
	/**
	 * Namespace of the macro control.
	 */
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name.
	 */
	fragment: "sap.fe.macros.microchart.MicroChart",

	/**
	 * The metadata describing the macro control.
	 */
	metadata: {
		/**
		 * Macro stereotype for documentation generation. Not visible in documentation.
		 */
		stereotype: "xmlmacro",
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * Metadata path to the entitySet or navigationProperty.
			 */
			contextPath: {
				type: "sap.ui.model.Context",
				$kind: ["EntitySet", "NavigationProperty"],
				isPublic: true
			},
			/**
			 * Metadata path to the Chart annotations.
			 */
			metaPath: {
				type: "sap.ui.model.Context",
				required: true,
				isPublic: true
			},
			/**
			 * ID of the MicroChart.
			 */
			id: {
				type: "string",
				isPublic: true,
				required: true
			},
			/**
			 * To control the rendering of Title, Subtitle and Currency Labels. When the size is xs then we do
			 * not see the inner labels of the MicroChart as well.
			 */
			showOnlyChart: {
				type: "boolean",
				defaultValue: false,
				isPublic: true
			},
			/**
			 * Batch group ID along with which this call should be grouped.
			 */
			batchGroupId: {
				type: "string",
				defaultValue: "",
				isPublic: true
			},
			/**
			 * Title for the MicroChart. If no title is provided, the title from the Chart annotation is used.
			 */
			title: {
				type: "string",
				defaultValue: "",
				visibility: "hidden"
			},
			/**
			 * Show blank space in case there is no data in the chart
			 */
			hideOnNoData: {
				type: "boolean",
				defaultValue: false,
				isPublic: true
			},
			/**
			 * Description for the MicroChart. If no description is provided, the description from the Chart annotation is used.
			 */
			description: {
				type: "string",
				defaultValue: "",
				visibility: "hidden"
			},
			/**
			 * Type of navigation, that is, External or InPage
			 */
			navigationType: {
				type: "sap.fe.macros.NavigationType",
				defaultValue: "None",
				visibility: "hidden"
			},
			/**
			 * Event handler for onTitlePressed event
			 */
			onTitlePressed: {
				type: "string",
				visibility: "hidden"
			},
			/**
			 * Size of the MicroChart
			 */
			size: {
				type: "string",
				isPublic: true
			},
			/**
			 * Defines whether the MicroChart is part of an analytical table
			 */
			isAnalytics: {
				type: "boolean",
				defaultValue: false,
				visibility: "hidden"
			}
		},

		events: {}
	}
});
export default MicroChart;
