/**
 * @classdesc
 * Building block for creating a FilterBar based on the provided OData V4 metadata.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:FilterBar
 *   id="SomeID"
 *   entitySet="{entitySet>}"
 *   hideBasicSearch="false"
 *   p13nMode=["Item","Value"]
 *   listBindingNames = "sap.fe.tableBinding"
 *   liveMode="true"
 *   search=".handlers.onSearch"
 *   filterChanged=".handlers.onFiltersChanged"
 * /&gt;
 * </pre>
 *
 * Building block for creating a FilterBar based on the provided OData V4 metadata.
 * @class sap.fe.macros.FilterBar
 * @hideconstructor
 * @private
 * @experimental
 */
import Log from "sap/base/Log";
import { getExpandFilterFields, getSelectionFields } from "sap/fe/core/converters/controls/ListReport/FilterBar";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import TemplateModel from "sap/fe/core/TemplateModel";
import MacroMetadata from "sap/fe/macros/MacroMetadata";

const ValueHelpFilterBar = MacroMetadata.extend("sap.fe.macros.valuehelp.ValueHelpFilterBar", {
	/**
	 * Name of the macro control.
	 */
	name: "ValueHelpFilterBar",
	/**
	 * Namespace of the macro control
	 */
	namespace: "sap.fe.macros.valuehelp",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.valuehelp.ValueHelpFilterBar",

	/**
	 * The metadata describing the macro control.
	 */
	metadata: {
		/**
		 * Define macro stereotype for documentation
		 */
		stereotype: "xmlmacro",
		/**
		 * Location of the designtime info
		 */
		designtime: "sap/fe/macros/valuehelp/ValueHelpFilterBar.designtime",
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * ID of the FilterBar
			 */
			id: {
				type: "string"
			},
			contextPath: {
				type: "sap.ui.model.Context"
			},
			/**
			 * Don't show the basic search field
			 */
			hideBasicSearch: {
				type: "boolean",
				defaultValue: false
			},

			/**
			 * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
			 */
			enableFallback: {
				type: "boolean",
				defaultValue: false
			},

			/**
			 * Specifies the personalization options for the filter bar.
			 */
			p13nMode: {
				type: "sap.ui.mdc.FilterBarP13nMode[]"
			},

			/**
			 * Specifies the Sematic Date Range option for the filter bar.
			 */
			useSemanticDateRange: {
				type: "boolean",
				defaultValue: true
			},

			/**
			 * If set the search will be automatically triggered, when a filter value was changed.
			 */
			liveMode: {
				type: "boolean",
				defaultValue: false
			},
			/**
			 * Temporary workaround only
			 * path to valuelist
			 */
			_valueList: {
				type: "sap.ui.model.Context",
				required: false
			},
			/**
			 * selectionFields to be displayed
			 */
			selectionFields: {
				type: "sap.ui.model.Context",
				required: false
			},
			/**
			 * Filter conditions to be applied to the filter bar
			 */
			filterConditions: {
				type: "string",
				required: false
			},
			/**
			 * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
			 * a search is triggered immediately if one or more search requests have been triggered in the meantime
			 * but were ignored based on the setting.
			 */
			suspendSelection: {
				type: "boolean",
				defaultValue: false
			},
			/**
			 * Determines whether the Show/Hide Filters button is in the state show or hide.
			 */
			expandFilterFields: {
				type: "boolean",
				defaultValue: true
			}
		},
		events: {
			/**
			 * Search handler name
			 */
			search: {
				type: "function"
			},
			/**
			 * Filters changed handler name
			 */
			filterChanged: {
				type: "function"
			}
		}
	},
	create: function (oProps: any, oControlConfiguration: any, mSettings: any) {
		const oContext = oProps.contextPath;

		if (!oContext) {
			Log.error("Context Path not available for FilterBar Macro.");
			return;
		}
		const sContextPath = oContext.getPath();
		const sEntitySetPath = ModelHelper.getEntitySetPath(sContextPath);
		const oMetaModel = oContext.getModel();
		let oConverterContext;
		if (!oProps.selectionFields) {
			const oMetaPathContext = oProps.metaPath;
			const sMetaPath = oMetaPathContext && oMetaPathContext.getPath();
			const oVisualizationObjectPath = getInvolvedDataModelObjects(oContext);
			oConverterContext = this.getConverterContext(oVisualizationObjectPath, undefined, mSettings);

			const oSelectionFields = getSelectionFields(oConverterContext, [], sMetaPath).selectionFields;
			oProps.selectionFields = new TemplateModel(oSelectionFields, oMetaModel).createBindingContext("/");
		}

		// TODO: this could be also moved into a central place
		if (
			oMetaModel.getObject(sEntitySetPath + "@com.sap.vocabularies.Common.v1.DraftRoot") ||
			oMetaModel.getObject(sEntitySetPath + "@com.sap.vocabularies.Common.v1.DraftNode")
		) {
			oProps.showDraftEditState = true;
		}

		const oFilterRestrictionsAnnotation = oMetaModel.getObject(sEntitySetPath + "@Org.OData.Capabilities.V1.FilterRestrictions");
		oProps.expandFilterFields = getExpandFilterFields(oConverterContext, oFilterRestrictionsAnnotation, oProps._valueList);

		return oProps;
	}
});
export default ValueHelpFilterBar;
