import { UIAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { VisualizationAndPath } from "sap/fe/core/converters/controls/Common/DataVisualization";
import {
	getDataVisualizationConfiguration,
	getVisualizationsFromPresentationVariant
} from "sap/fe/core/converters/controls/Common/DataVisualization";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { buildExpressionForHeaderVisible } from "sap/fe/macros/internal/helpers/TableTemplating";
import MacroMetadata from "sap/fe/macros/MacroMetadata";

/**
 * @classdesc
 * Building block used to create a table based on the metadata provided by OData V4.
 *
 * Usage example:
 * <pre>
 * &lt;macro:Table
 *   id="someID"
 *   type="ResponsiveTable"
 *   collection="collection",
 *   presentation="presentation"
 *   selectionMode="Multi"
 *   requestGroupId="$auto.test"
 *   displayMode="false"
 *   personalization="Column,Sort"
 * /&gt;
 * </pre>
 * @class sap.fe.macros.Table
 * @hideconstructor
 * @private
 * @experimental
 */
const Table = MacroMetadata.extend("sap.fe.macros.table.Table", {
	/**
	 * Name of the macro control.
	 */
	name: "Table",
	/**
	 * Namespace of the macro control
	 */
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.table.Table",
	/**
	 * The metadata describing the macro control.
	 */
	metadata: {
		/**
		 * Define macro stereotype for documentation
		 */
		stereotype: "xmlmacro",
		/**
		 * Properties.
		 */
		properties: {
			tableDefinition: {
				type: "sap.ui.model.Context"
			},
			metaPath: {
				type: "sap.ui.model.Context",
				isPublic: true
			},
			contextPath: {
				type: "sap.ui.model.Context",
				isPublic: true
			},

			/**
			 * metadataContext:collection Mandatory context to a collection (entitySet or 1:n navigation)
			 */
			collection: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: ["EntitySet", "NavigationProperty", "Singleton"]
			},
			/**
			 * Parent EntitySet for the present collection
			 */
			parentEntitySet: {
				type: "sap.ui.model.Context"
			},

			/**
			 * ID of the table
			 */
			id: {
				type: "string",
				isPublic: true
			},
			_apiId: {
				type: "string"
			},
			/**
			 * Used for binding the table to a navigation path. Only the path is used for binding rows.
			 */
			navigationPath: {
				type: "string"
			},
			/**
			 * Specifies whether the table should be read-only or not.
			 */
			readOnly: {
				type: "boolean",
				isPublic: true
			},
			fieldMode: {
				type: "string",
				defaultValue: "",
				allowedValues: ["", "nowrapper"]
			},
			/**
			 * Specifies whether the button is hidden when no data has been entered yet in the row (true/false). The default setting is `false`.
			 */
			disableAddRowButtonForEmptyData: {
				type: "boolean"
			},
			/**
			 * Specifies the full path and function name of a custom validation function.
			 */
			customValidationFunction: {
				type: "string"
			},
			/**
			 * Specifies whether the table is displayed with condensed layout (true/false). The default setting is `false`.
			 */
			useCondensedTableLayout: {
				type: "boolean"
			},
			/**
			 * Specifies the possible actions available on the table row (Navigation,null). The default setting is `undefined`
			 */
			rowAction: {
				type: "string",
				defaultValue: undefined
			},
			/**
			 * Specifies the selection mode (None,Single,Multi,Auto)
			 */
			selectionMode: {
				type: "string",
				isPublic: true
			},

			/**
			 * The `busy` mode of table
			 */
			busy: {
				type: "boolean",
				isPublic: true
			},
			/**
			 * Parameter used to show the fullScreen button on the table.
			 */
			enableFullScreen: {
				type: "boolean",
				isPublic: true
			},
			/**
			 * Specifies header text that is shown in table.
			 */
			header: {
				type: "string",
				isPublic: true
			},
			/**
			 * Controls if the header text should be shown or not
			 */
			headerVisible: {
				type: "boolean",
				isPublic: true
			},
			/**
			 * Defines the "aria-level" of the table header
			 */
			headerLevel: {
				type: "sap.ui.core.TitleLevel",
				defaultValue: "Auto",
				isPublic: true
			},
			/**
			 * Parameter which sets the noDataText for the mdc table
			 */
			noDataText: {
				type: "string"
			},
			/**
			 * Creation Mode to be passed to the onCreate hanlder. Values: ["Inline", "NewPage"]
			 */
			creationMode: {
				type: "string"
			},
			/**
			 * Setting to determine if the new row should be created at the end or beginning
			 */
			createAtEnd: {
				type: "boolean"
			},
			createOutbound: {
				type: "string"
			},
			createOutboundDetail: {
				type: "string"
			},
			createNewAction: {
				type: "string"
			},
			/**
			 * Personalization Mode
			 */
			personalization: {
				type: "string|boolean",
				isPublic: true
			},
			isSearchable: {
				type: "boolean",
				isPublic: true
			},
			/**
			 * Allows to choose the Table type. Allowed values are `ResponsiveTable` or `GridTable`.
			 */
			type: {
				type: "string",
				isPublic: true
			},
			tableType: {
				type: "string"
			},
			/**
			 * Enable export to file
			 */
			enableExport: {
				type: "boolean",
				isPublic: true
			},
			/**
			 * Enable export to file
			 */
			enablePaste: {
				type: "boolean",
				isPublic: true
			},
			/**
			 * ONLY FOR GRID TABLE: Number of indices which can be selected in a range. If set to 0, the selection limit is disabled, and the Select All checkbox appears instead of the Deselect All button.
			 */
			selectionLimit: {
				type: "string"
			},
			/**
			 * ONLY FOR RESPONSIVE TABLE: Setting to define the checkbox in the column header: Allowed values are `Default` or `ClearAll`. If set to `Default`, the sap.m.Table control renders the Select All checkbox, otherwise the Deselect All button is rendered.
			 */
			multiSelectMode: {
				type: "string"
			},
			/**
			 * The control ID of the FilterBar that is used to filter the rows of the table.
			 */
			filterBar: {
				type: "string",
				isPublic: true
			},
			/**
			 * The control ID of the FilterBar that is used internally to filter the rows of the table.
			 */
			filterBarId: {
				type: "string"
			},
			tableDelegate: {
				type: "string"
			},
			enableAutoScroll: {
				type: "boolean"
			},
			visible: {
				type: "string"
			},
			isAlp: {
				type: "boolean",
				defaultValue: false
			},
			variantManagement: {
				type: "string",
				isPublic: true
			},
			columnEditMode: {
				type: "string",
				computed: true
			},
			tabTitle: {
				type: "string",
				defaultValue: ""
			},
			isOptimizedForSmallDevice: {
				type: "boolean"
			},
			enableAutoColumnWidth: {
				type: "boolean"
			},
			dataStateIndicatorFilter: {
				type: "string"
			},
			isCompactType: {
				type: "boolean"
			}
		},
		events: {
			variantSaved: {
				type: "function"
			},
			variantSelected: {
				type: "function"
			},
			/**
			 * Event handler for change event
			 */
			onChange: {
				type: "function"
			},
			/**
			 * Event handler to react when the user chooses a row
			 */
			rowPress: {
				type: "function",
				isPublic: true
			},
			/**
			 * Event handler to react to the contextChange event of the table.
			 */
			onContextChange: {
				type: "function"
			},
			/**
			 * Event handler called when the user chooses an option of the segmented button in the ALP View
			 */
			onSegmentedButtonPressed: {
				type: "function"
			},
			/**
			 * Event handler to react to the stateChange event of the table.
			 */
			stateChange: {
				type: "function"
			},
			/**
			 * Event handler to react when the table selection changes
			 */
			selectionChange: {
				type: "function",
				isPublic: true
			}
		},
		aggregations: {
			actions: {
				type: "sap.fe.macros.internal.table.Action | sap.fe.macros.internal.table.ActionGroup",
				isPublic: true
			},
			columns: {
				type: "sap.fe.macros.internal.table.Column",
				isPublic: true
			}
		}
	},
	create: function (oProps: any, oControlConfiguration: any, mSettings: any, oAggregations: any) {
		let oTableDefinition;
		const oContextObjectPath = getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);

		if (!oProps.tableDefinition) {
			const initialConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings);
			const sVisualizationPath = this._getVisualizationPath(oContextObjectPath, initialConverterContext);
			const sPresentationPath = this._getPresentationPath(oContextObjectPath);

			//Check if we have ActionGroup and add nested actions
			const oExtraActions = this._buildActions(oAggregations.actions);

			const oExtraColumns = this.parseAggregation(oAggregations.columns, function (childColumn: any, columnChildIdx: number) {
				const columnKey = childColumn.getAttribute("key") || "InlineXMLColumn_" + columnChildIdx;
				oAggregations[columnKey] = childColumn;
				return {
					// Defaults are to be defined in Table.ts
					key: columnKey,
					type: "Slot",
					width: childColumn.getAttribute("width"),
					importance: childColumn.getAttribute("importance"),
					horizontalAlign: childColumn.getAttribute("horizontalAlign"),
					availability: childColumn.getAttribute("availability"),
					header: childColumn.getAttribute("header"),
					template: childColumn.children[0]?.outerHTML || "",
					properties: childColumn.getAttribute("properties") ? childColumn.getAttribute("properties").split(",") : undefined,
					position: {
						placement: childColumn.getAttribute("positionPlacement"),
						anchor: childColumn.getAttribute("positionAnchor")
					}
				};
			});
			const oExtraParams: any = {};
			let mTableSettings = {
				enableExport: oProps.enableExport,
				enableFullScreen: oProps.enableFullScreen,
				enablePaste: oProps.enablePaste,
				selectionMode: oProps.selectionMode,
				type: oProps.type
			};
			//removes undefined values from mTableSettings
			mTableSettings = JSON.parse(JSON.stringify(mTableSettings));

			oExtraParams[sVisualizationPath] = {
				actions: oExtraActions,
				columns: oExtraColumns,
				tableSettings: mTableSettings
			};
			const oConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings, oExtraParams);

			const oVisualizationDefinition = getDataVisualizationConfiguration(
				sVisualizationPath,
				oProps.useCondensedLayout,
				oConverterContext,
				undefined,
				undefined,
				sPresentationPath,
				true
			);
			oTableDefinition = oVisualizationDefinition.visualizations[0];

			oProps.tableDefinition = this.createBindingContext(oTableDefinition, mSettings);
		} else {
			oTableDefinition = oProps.tableDefinition.getObject();
		}
		oTableDefinition.path = "{_pageModel>" + oProps.tableDefinition.getPath() + "}";
		// public properties processed by converter context
		this.setDefaultValue(oProps, "selectionMode", oTableDefinition.annotation.selectionMode, true);
		this.setDefaultValue(oProps, "enableFullScreen", oTableDefinition.control.enableFullScreen, true);
		this.setDefaultValue(oProps, "enableExport", oTableDefinition.control.enableExport, true);
		this.setDefaultValue(oProps, "enablePaste", oTableDefinition.annotation.standardActions.actions.paste.enabled, true);
		this.setDefaultValue(oProps, "updatablePropertyPath", oTableDefinition.annotation.standardActions.updatablePropertyPath, true);
		this.setDefaultValue(oProps, "type", oTableDefinition.control.type, true);

		this.setDefaultValue(oProps, "useCondensedTableLayout", oTableDefinition.control.useCondensedTableLayout);
		this.setDefaultValue(oProps, "disableAddRowButtonForEmptyData", oTableDefinition.control.disableAddRowButtonForEmptyData);
		this.setDefaultValue(oProps, "customValidationFunction", oTableDefinition.control.customValidationFunction);
		this.setDefaultValue(oProps, "headerVisible", oTableDefinition.control.headerVisible);
		this.setDefaultValue(oProps, "searchable", oTableDefinition.annotation.searchable);
		this.setDefaultValue(oProps, "showRowCount", oTableDefinition.control.showRowCount);
		this.setDefaultValue(oProps, "inlineCreationRowCount", oTableDefinition.control.inlineCreationRowCount);
		this.setDefaultValue(oProps, "header", oTableDefinition.annotation.title);
		this.setDefaultValue(oProps, "selectionLimit", oTableDefinition.control.selectionLimit);
		this.setDefaultValue(oProps, "isCompactType", oTableDefinition.control.isCompactType);
		this.setDefaultValue(oProps, "inlineCreationRowsHiddenInEditMode", oTableDefinition.annotation.inlineCreationRowsHiddenInEditMode);
		if (oProps.id) {
			// The given ID shall be assigned to the TableAPI and not to the MDC Table
			oProps._apiId = oProps.id;
			oProps.id = this.getContentId(oProps.id);
		} else {
			// We generate the ID. Due to compatibility reasons we keep it on the MDC Table but provide assign
			// the ID with a ::Table suffix to the TableAPI
			this.setDefaultValue(oProps, "id", oTableDefinition.annotation.id);
			oProps._apiId = oTableDefinition.annotation.id + "::Table";
		}

		this.setDefaultValue(oProps, "creationMode", oTableDefinition.annotation.create.mode);
		this.setDefaultValue(oProps, "createAtEnd", oTableDefinition.annotation.create.append);
		this.setDefaultValue(oProps, "createOutbound", oTableDefinition.annotation.create.outbound);
		this.setDefaultValue(oProps, "createNewAction", oTableDefinition.annotation.create.newAction);
		this.setDefaultValue(oProps, "createOutboundDetail", oTableDefinition.annotation.create.outboundDetail);
		this.setDefaultValue(oProps, "personalization", oTableDefinition.annotation.p13nMode);
		this.setDefaultValue(oProps, "variantManagement", oTableDefinition.annotation.variantManagement);
		this.setDefaultValue(oProps, "enableAutoColumnWidth", true);
		this.setDefaultValue(oProps, "dataStateIndicatorFilter", oTableDefinition.control.dataStateIndicatorFilter);
		this.setDefaultValue(oProps, "isOptimizedForSmallDevice", CommonUtils.isSmallDevice());
		// Special code for readOnly
		// readonly = false -> Force editable
		// readonly = true -> Force display mode
		// readonly = undefined -> Bound to edit flow

		switch (oProps.readOnly) {
			case "false":
				oProps.readOnly = false;
				break;
			case "true":
				oProps.readOnly = true;
				break;
			default:
		}

		switch (oProps.enableAutoColumnWidth) {
			case "false":
				oProps.enableAutoColumnWidth = false;
				break;
			case "true":
				oProps.enableAutoColumnWidth = true;
				break;
			default:
		}

		if (oProps.readOnly === undefined && oTableDefinition.annotation.displayMode === true) {
			oProps.readOnly = true;
		}

		if (oProps.rowPress) {
			oProps.rowAction = "Navigation";
		}
		this.setDefaultValue(oProps, "rowPress", oTableDefinition.annotation.row.press);
		this.setDefaultValue(oProps, "rowAction", oTableDefinition.annotation.row.action);

		if (oProps.personalization === "false") {
			oProps.personalization = undefined;
		} else if (oProps.personalization === "true") {
			oProps.personalization = "Sort,Column,Filter";
		}

		switch (oProps.personalization) {
			case "false":
				oProps.personalization = undefined;
				break;
			case "true":
				oProps.personalization = "Sort,Column,Filter";
				break;
			default:
		}

		if (oProps.isSearchable === "false") {
			oProps.searchable = false;
		} else {
			oProps.searchable = oTableDefinition.annotation.searchable;
		}

		let useBasicSearch = false;

		// Note for the 'filterBar' property:
		// 1. ID relative to the view of the Table.
		// 2. Absolute ID.
		// 3. ID would be considered in association to TableAPI's ID.
		if (!oProps.filterBar && !oProps.filterBarId && oProps.searchable) {
			// filterBar: Public property for building blocks
			// filterBarId: Only used as Internal private property for FE templates
			oProps.filterBarId = generate([oProps.id, "StandardAction", "BasicSearch"]);
			useBasicSearch = true;
		}
		// Internal properties
		oProps.useBasicSearch = useBasicSearch;
		oProps.tableType = oProps.type;
		oProps.showCreate = oTableDefinition.annotation.standardActions.actions.create.visible || true;
		oProps.autoBindOnInit = oTableDefinition.annotation.autoBindOnInit;

		// Internal that I want to remove in the end
		oProps.navigationPath = oTableDefinition.annotation.navigationPath; // oTableDefinition.annotation.collection; //DataModelPathHelper.getContextRelativeTargetObjectPath(oContextObjectPath); //
		if (oTableDefinition.annotation.collection.startsWith("/") && oContextObjectPath.startingEntitySet._type === "Singleton") {
			oTableDefinition.annotation.collection = oProps.navigationPath;
		}
		oProps.parentEntitySet = mSettings.models.metaModel.createBindingContext(
			"/" +
				(oContextObjectPath.contextLocation!.targetEntitySet
					? oContextObjectPath.contextLocation!.targetEntitySet.name
					: oContextObjectPath.startingEntitySet.name)
		);
		oProps.collection = mSettings.models.metaModel.createBindingContext(oTableDefinition.annotation.collection);

		switch (oProps.readOnly) {
			case true:
				oProps.columnEditMode = "Display";
				break;
			case false:
				oProps.columnEditMode = "Editable";
				break;
			default:
				oProps.columnEditMode = undefined;
		}
		// Regarding the remaining ones that I think we could review
		// selectedContextsModel -> potentially hardcoded or internal only
		// onContextChange -> Autoscroll ... might need revision
		// onChange -> Just proxied down to the Field may need to see if needed or not
		// variantSelected / variantSaved -> Variant Management standard helpers ?
		// tableDelegate  -> used externally for ALP ... might need to see if relevant still
		// onSegmentedButtonPressed -> ALP specific, should be a dedicated control for the contentViewSwitcher
		// visible -> related to this ALP contentViewSwitcher... maybe an outer control would make more sense ?

		oProps.headerBindingExpression = buildExpressionForHeaderVisible(oProps);
		return oProps;
	},
	/**
	 * Build actions and action groups for table visualisation.
	 *
	 * @param oActions XML node corresponding to actions
	 * @returns Prepared actions
	 */
	_buildActions: function (oActions: any) {
		const oExtraActions: any = {};
		if (oActions && oActions.children.length > 0) {
			const actions = Array.prototype.slice.apply(oActions.children);
			let actionIdx = 0;
			actions.forEach(function (act) {
				actionIdx++;
				let menuActions: any[] = [];
				if (act.children.length && act.localName === "ActionGroup" && act.namespaceURI === "sap.fe.macros") {
					const actionsToAdd = Array.prototype.slice.apply(act.children);
					actionsToAdd.forEach(function (actToAdd) {
						const actionKeyAdd = actToAdd.getAttribute("key") || "InlineXMLAction_" + actionIdx;
						const curOutObject = {
							key: actionKeyAdd,
							text: actToAdd.getAttribute("text"),
							__noWrap: true,
							press: actToAdd.getAttribute("press"),
							requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
							enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled")
						};
						oExtraActions[curOutObject.key] = curOutObject;
						actionIdx++;
					});
					menuActions = Object.values(oExtraActions)
						.slice(-act.children.length)
						.map(function (menuItem: any) {
							return menuItem.key;
						});
				}
				const actionKey = act.getAttribute("key") || "InlineXMLAction_" + actionIdx;
				const actObject = {
					key: actionKey,
					text: act.getAttribute("text"),
					position: {
						placement: act.getAttribute("placement"),
						anchor: act.getAttribute("anchor")
					},
					__noWrap: true,
					press: act.getAttribute("press"),
					requiresSelection: act.getAttribute("requiresSelection") === "true",
					enabled: act.getAttribute("enabled") === null ? true : act.getAttribute("enabled"),
					menu: menuActions.length ? menuActions : null
				};
				oExtraActions[actObject.key] = actObject;
			});
		}
		return oExtraActions;
	},

	/**
	 * Returns the annotation path pointing to the visualization annotation (LineItem).
	 *
	 * @param contextObjectPath The datamodel object path for the table
	 * @param converterContext The converter context
	 * @returns The annotation path
	 */
	_getVisualizationPath: function (contextObjectPath: DataModelObjectPath, converterContext: ConverterContext): string {
		const metaPath = getContextRelativeTargetObjectPath(contextObjectPath) as string;
		if (contextObjectPath.targetObject.term === UIAnnotationTerms.LineItem) {
			return metaPath; // MetaPath is already pointing to a LineItem
		}
		//Need to switch to the context related the PV or SPV
		const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);

		let visualizations: VisualizationAndPath[] = [];
		switch (contextObjectPath.targetObject.term) {
			case UIAnnotationTerms.SelectionPresentationVariant:
				if (contextObjectPath.targetObject.PresentationVariant) {
					visualizations = getVisualizationsFromPresentationVariant(
						contextObjectPath.targetObject.PresentationVariant,
						metaPath,
						resolvedTarget.converterContext,
						true
					);
				}
				break;

			case UIAnnotationTerms.PresentationVariant:
				visualizations = getVisualizationsFromPresentationVariant(
					contextObjectPath.targetObject,
					metaPath,
					resolvedTarget.converterContext,
					true
				);
				break;

			default:
				Log.error(`Bad metapath parameter for table : ${contextObjectPath.targetObject.term}`);
		}

		const lineItemViz = visualizations.find((viz) => {
			return viz.visualization.term === UIAnnotationTerms.LineItem;
		});

		if (lineItemViz) {
			return lineItemViz.annotationPath;
		} else {
			return metaPath; // Fallback
		}
	},

	_getPresentationPath: function (oContextObjectPath: any) {
		let presentationPath;
		switch (oContextObjectPath.targetObject.term) {
			case UIAnnotationTerms.PresentationVariant:
				presentationPath = getContextRelativeTargetObjectPath(oContextObjectPath);
				break;
			case UIAnnotationTerms.SelectionPresentationVariant:
				presentationPath = getContextRelativeTargetObjectPath(oContextObjectPath) + "/PresentationVariant";
				break;
			default:
				presentationPath = null;
		}
		return presentationPath;
	}
});
export default Table;
