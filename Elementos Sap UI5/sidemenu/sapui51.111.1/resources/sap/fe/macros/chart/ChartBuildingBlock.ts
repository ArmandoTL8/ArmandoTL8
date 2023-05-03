/**
 *
 * @classdesc
 * Building block for creating a Chart based on the metadata provided by OData V4.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Chart id="MyChart" metaPath="@com.sap.vocabularies.UI.v1.Chart" /&gt;
 * </pre>
 *
 * Building block for creating a Chart based on the metadata provided by OData V4.
 * @class sap.fe.macros.Chart
 * @hideconstructor
 * @private
 * @experimental
 */
import type { PrimitiveType } from "@sap-ux/vocabularies-types";
import {
	Chart,
	ChartMeasureAttributeType,
	ChartMeasureRoleType,
	DataFieldForAction,
	DataPoint,
	UIAnnotationTerms
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import uid from "sap/base/util/uid";
import {
	blockAggregation,
	blockAttribute,
	blockEvent,
	BuildingBlockBase,
	defineBuildingBlock
} from "sap/fe/core/buildingBlocks/BuildingBlock";
import { escapeXMLAttributeValue, xml } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import type { BaseAction, CustomAction } from "sap/fe/core/converters/controls/Common/Action";
import type { ChartVisualization } from "sap/fe/core/converters/controls/Common/Chart";
import {
	getDataVisualizationConfiguration,
	getVisualizationsFromPresentationVariant,
	VisualizationAndPath
} from "sap/fe/core/converters/controls/Common/DataVisualization";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import { AggregationHelper } from "sap/fe/core/converters/helpers/Aggregation";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { CompiledBindingToolkitExpression, resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import CommonHelper from "sap/fe/macros/CommonHelper";
import type { TitleLevel } from "sap/ui/core/library";
import JSONModel from "sap/ui/model/json/JSONModel";
import type { V4Context } from "types/extension_types";
import ActionHelper from "../internal/helpers/ActionHelper";
import DefaultActionHandler from "../internal/helpers/DefaultActionHandler";
import ODataMetaModelUtil from "../ODataMetaModelUtil";
import type { Action, ActionGroup } from "./ChartAPI";
import ChartHelper from "./ChartHelper";

const mMeasureRole: any = {
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1": "axis1",
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2": "axis2",
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3": "axis3",
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis4": "axis4"
};

type ExtendedActionGroup = ActionGroup & { menuContentActions?: Record<string, Action> };
type ActionOrActionGroup = Record<string, Action | ExtendedActionGroup>;
type CustomAndAction = CustomAction & (Action | ActionGroup);
type CustomToolbarMenuAction = {
	id: string;
	text: string | undefined;
	visible: string | undefined;
	enabled: string | boolean;
	useDefaultActionOnly?: boolean;
	buttonMode?: string;
	defaultAction?: string;
	actions?: CustomAction;
};

enum personalizationValues {
	Sort = "Sort",
	Type = "Type",
	Item = "Item"
}

/**
 * Build actions and action groups with all properties for chart visualization.
 *
 * @param childAction XML node corresponding to actions
 * @returns Prepared action object
 */
const setCustomActionProperties = function (childAction: Element) {
	let menuContentActions = null;
	const action = childAction;
	let menuActions: ActionGroup[] = [];
	const actionKey = action.getAttribute("key")?.replace("InlineXML_", "");
	if (action.children.length && action.localName === "ActionGroup" && action.namespaceURI === "sap.fe.macros") {
		const actionsToAdd = Array.prototype.slice.apply(action.children);
		let actionIdx = 0;
		menuContentActions = actionsToAdd.reduce((customAction, actToAdd) => {
			const actionKeyAdd = actToAdd.getAttribute("key")?.replace("InlineXML_", "") || actionKey + "_Menu_" + actionIdx;
			const curOutObject = {
				key: actionKeyAdd,
				text: actToAdd.getAttribute("text"),
				__noWrap: true,
				press: actToAdd.getAttribute("press"),
				requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
				enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled") === true
			};
			customAction[curOutObject.key] = curOutObject;
			actionIdx++;
			return customAction;
		}, {});
		menuActions = Object.values(menuContentActions)
			.slice(-action.children.length)
			.map(function (menuItem: any) {
				return menuItem.key;
			});
	}
	return {
		key: actionKey,
		text: action.getAttribute("text"),
		position: {
			placement: action.getAttribute("placement"),
			anchor: action.getAttribute("anchor")
		},
		__noWrap: true,
		press: action.getAttribute("press"),
		requiresSelection: action.getAttribute("requiresSelection") === "true",
		enabled: action.getAttribute("enabled") === null ? true : action.getAttribute("enabled"),
		menu: menuActions.length ? menuActions : null,
		menuContentActions: menuContentActions
	};
};

type MeasureType = {
	id?: string;
	key?: string;
	role?: string;
	propertyPath?: string;
	aggregationMethod?: string;
	label?: string | BindingToolkitExpression<PrimitiveType>;
	value?: string;
	dataPoint?: string;
	name?: string;
};

type DimensionType = {
	id?: string;
	key?: string;
	role?: string;
	propertyPath?: string;
	label?: string | BindingToolkitExpression<PrimitiveType>;
	value?: string;
};

type CommandAction = {
	actionContext: V4Context;
	onExecuteAction: string;
	onExecuteIBN: string;
	onExecuteManifest: CompiledBindingToolkitExpression;
};

type ToolBarAction = {
	unittestid: string;
	id?: string;
	label: string;
	ariaHasPopup?: string;
	press: string;
	enabled: string | boolean;
	visible: string | boolean;
};

type ChartCustomData = {
	targetCollectionPath: string;
	entitySet: string;
	entityType: string;
	operationAvailableMap: string;
	multiSelectDisabledActions: string;
	segmentedButtonId: string;
	customAgg: string;
	transAgg: string;
	applySupported: string;
	vizProperties: string;
	draftSupported?: boolean;
	multiViews?: boolean;
};
@defineBuildingBlock({
	name: "Chart",
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros"
})
export default class ChartBuildingBlock extends BuildingBlockBase {
	/**
	 * ID of the chart
	 */
	@blockAttribute({ type: "string", isPublic: true })
	id!: string;

	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	chartDefinition!: ChartVisualization;

	/**
	 * Metadata path to the presentation (UI.Chart w or w/o qualifier)
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true
	})
	metaPath!: V4Context;

	/**
	 * Metadata path to the entitySet or navigationProperty
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true
	})
	contextPath!: V4Context;

	/**
	 * The height of the chart
	 */
	@blockAttribute({
		type: "string",
		defaultValue: "100%"
	})
	height?: string;

	/**
	 * The width of the chart
	 */
	@blockAttribute({
		type: "string",
		defaultValue: "100%"
	})
	width?: string;

	/**
	 * Specifies the header text that is shown in the chart
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	header?: string;

	/**
	 * Specifies the visibility of the chart header
	 */
	@blockAttribute({
		type: "boolean",
		isPublic: true
	})
	headerVisible?: boolean;

	/**
	 * Defines the "aria-level" of the chart header
	 */
	@blockAttribute({
		type: "sap.ui.core.TitleLevel",
		defaultValue: "Auto",
		isPublic: true
	})
	headerLevel?: TitleLevel;

	/**
	 * Specifies the selection mode
	 */
	@blockAttribute({
		type: "string",
		defaultValue: "MULTIPLE",
		isPublic: true
	})
	selectionMode?: string;

	/**
	 * Parameter which sets the personalization of the chart
	 */
	@blockAttribute({
		type: "string|boolean",
		isPublic: true
	})
	personalization?: string | boolean;

	/**
	 * Parameter which sets the ID of the filterbar associating it to the chart
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	filterBar?: string;

	/**
	 * 	Parameter which sets the noDataText for the chart
	 */
	@blockAttribute({ type: "string" })
	noDataText?: string;

	/**
	 * Parameter which sets the chart delegate for the chart
	 */
	@blockAttribute({ type: "string" })
	chartDelegate?: string;

	/**
	 * Parameter which sets the visualization properties for the chart
	 */
	@blockAttribute({ type: "string" })
	vizProperties?: string;

	/**
	 * The actions to be shown in the action area of the chart
	 */
	@blockAttribute({ type: "sap.ui.model.Context" })
	chartActions?: V4Context;

	@blockAttribute({ type: "boolean" })
	draftSupported?: boolean;

	@blockAttribute({ type: "boolean" })
	autoBindOnInit?: boolean;

	@blockAttribute({ type: "string" })
	visible?: string;

	@blockAttribute({ type: "string" })
	navigationPath?: string;

	@blockAttribute({ type: "string" })
	filter?: string;

	@blockAttribute({ type: "string" })
	measures?: V4Context;

	@blockAttribute({
		type: "boolean",
		defaultValue: false
	})
	_applyIdToContent?: boolean;

	@blockAttribute({ type: "string", isPublic: true })
	variantManagement?: string;

	@blockEvent()
	variantSelected!: Function;

	@blockEvent()
	variantSaved!: Function;

	/**
	 * The XML and manifest actions to be shown in the action area of the chart
	 */
	@blockAggregation({
		type: "sap.fe.macros.internal.chart.Action | sap.fe.macros.internal.chart.ActionGroup",
		isPublic: true,
		processAggregations: setCustomActionProperties
	})
	actions!: ActionOrActionGroup;

	@blockEvent()
	onSegmentedButtonPressed!: string;

	/**
	 * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and
	 * the Boolean flag that indicates whether data is selected or deselected
	 */
	@blockEvent()
	selectionChange!: Function;

	/**
	 * Event handler to react to the stateChange event of the chart.
	 */
	@blockEvent()
	stateChange!: Function;
	useCondensedLayout!: boolean;
	_apiId!: string | undefined;
	_contentId: string | undefined;
	_commandActions: CommandAction[] = [];
	_chartType: string;
	_sortCondtions: string | undefined;
	_customData: ChartCustomData;
	_actions: string;

	constructor(oProps: PropertiesOf<ChartBuildingBlock>, configuration: any, mSettings: any) {
		super(oProps, configuration, mSettings);
		const oContextObjectPath = getInvolvedDataModelObjects(oProps.metaPath!, oProps.contextPath);
		const initialConverterContext = this.getConverterContext(oContextObjectPath, /*oProps.contextPath*/ undefined, mSettings);
		const visualizationPath = ChartBuildingBlock.getVisualizationPath(oProps, oContextObjectPath, initialConverterContext);
		const extraParams = ChartBuildingBlock.getExtraParams(oProps, visualizationPath);
		const oConverterContext = this.getConverterContext(oContextObjectPath, /*oProps.contextPath*/ undefined, mSettings, extraParams);
		const aggregationHelper = new AggregationHelper(oConverterContext.getEntityType(), oConverterContext);
		const oChartDefinition: ChartVisualization =
			oProps.chartDefinition === undefined || oProps.chartDefinition === null
				? this.createChartDefinition(oProps, oConverterContext, oContextObjectPath)
				: oProps.chartDefinition;
		// API Properties
		this.navigationPath = oChartDefinition.navigationPath;
		this.autoBindOnInit = oChartDefinition.autoBindOnInit;
		this.vizProperties = oChartDefinition.vizProperties;
		this.chartActions = this.createBindingContext(oChartDefinition.actions, mSettings);
		this.selectionMode = oProps.selectionMode!.toUpperCase();
		if (oProps.filterBar) {
			this.filter = this.getContentId(oProps.filterBar);
		} else if (!oProps.filter) {
			this.filter = oChartDefinition.filterId;
		}
		this.onSegmentedButtonPressed = oChartDefinition.onSegmentedButtonPressed;
		this.checkPersonalizationInChartProperties(oProps);
		this.variantManagement = this.getVariantManagement(oProps, oChartDefinition);
		this.visible = oChartDefinition.visible;
		let sContextPath = oProps.contextPath!.getPath();
		sContextPath = sContextPath[sContextPath.length - 1] === "/" ? sContextPath.slice(0, -1) : sContextPath;
		this.draftSupported = ModelHelper.isDraftSupported(mSettings.models.metaModel, sContextPath);
		if (oProps._applyIdToContent ?? false) {
			this._apiId = oProps.id + "::Chart";
			this._contentId = oProps.id;
		} else {
			this._apiId = oProps.id;
			this._contentId = this.getContentId(oProps.id!);
		}
		const chartContext = ChartHelper.getUiChart(this.metaPath);
		const chart = chartContext.getObject();
		this._chartType = ChartHelper.formatChartType(chart.ChartType);
		const operationAvailableMap = ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
			context: chartContext
		});
		if (Object.keys(this.chartDefinition?.commandActions).length > 0) {
			Object.keys(this.chartDefinition?.commandActions).forEach((sKey: string) => {
				const action = this.chartDefinition?.commandActions[sKey];
				const actionContext = this.createBindingContext(action, mSettings);
				const dataFieldContext = action.annotationPath && this.contextPath.getModel().createBindingContext(action.annotationPath);
				const dataField = dataFieldContext && dataFieldContext.getObject();
				const chartOperationAvailableMap = escapeXMLAttributeValue(operationAvailableMap);
				this.pushActionCommand(actionContext, dataField, chartOperationAvailableMap, action);
			});
		}
		this.measures = this.getChartMeasures(oProps, aggregationHelper);
		const presentationPath = CommonHelper.createPresentationPathContext(this.metaPath);
		this._sortCondtions = ChartHelper.getSortConditions(
			this.metaPath,
			this.metaPath.getObject(),
			presentationPath.getPath(),
			this.chartDefinition.applySupported
		);
		const chartActionsContext = this.contextPath.getModel().createBindingContext(chartContext.getPath() + "/Actions", chart.Actions);
		const contextPathContext = this.contextPath.getModel().createBindingContext(this.contextPath.getPath(), this.contextPath);
		const contextPathPath = CommonHelper.getContextPath(this.contextPath, { context: contextPathContext });
		const targetCollectionPath = CommonHelper.getTargetCollection(this.contextPath);
		const targetCollectionPathContext = this.contextPath.getModel().createBindingContext(targetCollectionPath, this.contextPath);
		this._customData = {
			targetCollectionPath: contextPathPath,
			entitySet:
				typeof targetCollectionPathContext.getObject() === "string"
					? targetCollectionPathContext.getObject()
					: targetCollectionPathContext.getObject("@sapui.name"),
			entityType: contextPathPath + "/",
			operationAvailableMap: CommonHelper.stringifyCustomData(JSON.parse(operationAvailableMap)),
			multiSelectDisabledActions:
				ActionHelper.getMultiSelectDisabledActions(chart.Actions, {
					context: chartActionsContext
				}) + "",
			segmentedButtonId: generate([this.id, "SegmentedButton", "TemplateContentView"]),
			customAgg: CommonHelper.stringifyCustomData(this.chartDefinition?.customAgg),
			transAgg: CommonHelper.stringifyCustomData(this.chartDefinition?.transAgg),
			applySupported: CommonHelper.stringifyCustomData(this.chartDefinition?.applySupported),
			vizProperties: this.vizProperties,
			draftSupported: this.draftSupported,
			multiViews: this.chartDefinition?.multiViews
		};
		this._actions = this.chartActions ? this.getToolbarActions(chartContext) : xml``;
	}

	createChartDefinition = (oProps: any, oConverterContext: ConverterContext, oContextObjectPath: DataModelObjectPath) => {
		let sVisualizationPath = getContextRelativeTargetObjectPath(oContextObjectPath);
		if (oProps.metaPath?.getObject().$Type === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
			const aVisualizations = oProps.metaPath.getObject().Visualizations;
			sVisualizationPath = ChartBuildingBlock.checkChartVisualizationPath(aVisualizations, sVisualizationPath);
		}
		const oVisualizationDefinition = getDataVisualizationConfiguration(
			sVisualizationPath!,
			oProps.useCondensedLayout as boolean,
			oConverterContext
		);
		oProps.chartDefinition = oVisualizationDefinition.visualizations[0] as ChartVisualization;
		this.chartDefinition = oVisualizationDefinition.visualizations[0] as ChartVisualization;
		return this.chartDefinition;
	};

	static checkChartVisualizationPath = (aVisualizations: Record<string, string>[], sVisualizationPath: string | undefined) => {
		aVisualizations.forEach(function (oVisualization: Record<string, string>) {
			if (oVisualization.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
				sVisualizationPath = oVisualization.$AnnotationPath;
			}
		});
		return sVisualizationPath;
	};

	getContentId(sMacroId: string) {
		return `${sMacroId}-content`;
	}

	static getExtraParams(props: PropertiesOf<ChartBuildingBlock>, visualizationPath: string | undefined) {
		const extraParams: Record<string, object> = {};
		if (props.actions) {
			Object.values(props.actions)?.forEach((item) => {
				props.actions = { ...(props.actions as ActionOrActionGroup), ...(item as ExtendedActionGroup).menuContentActions };
				delete (item as ExtendedActionGroup).menuContentActions;
			});
		}
		if (visualizationPath) {
			extraParams[visualizationPath] = {
				actions: props.actions
			};
		}
		return extraParams;
	}

	createBindingContext = function (oData: object | BaseAction[] | CustomAction, mSettings: any) {
		const sContextPath = `/${uid()}`;
		mSettings.models.converterContext.setProperty(sContextPath, oData);
		return mSettings.models.converterContext.createBindingContext(sContextPath);
	};

	getChartMeasures = (oProps: any, aggregationHelper: AggregationHelper): V4Context => {
		const aChartAnnotationPath = oProps.chartDefinition.annotationPath.split("/");
		// this is required because getAbsolutePath in converterContext returns "/SalesOrderManage/_Item/_Item/@com.sap.vocabularies.v1.Chart" as annotationPath
		const sChartAnnotationPath = aChartAnnotationPath
			.filter(function (item: object, pos: number) {
				return aChartAnnotationPath.indexOf(item) == pos;
			})
			.toString()
			.replaceAll(",", "/");
		const oChart = getInvolvedDataModelObjects(
			this.metaPath.getModel().createBindingContext(sChartAnnotationPath),
			this.contextPath
		).targetObject;
		const chartContext = ChartHelper.getUiChart(this.metaPath);
		const chart = chartContext.getObject();
		const aAggregatedProperty = aggregationHelper.getAggregatedProperties("AggregatedProperty");
		let aMeasures: MeasureType[] = [];
		const sAnnoPath = oProps.metaPath.getPath();
		const aAggregatedProperties = aggregationHelper.getAggregatedProperties("AggregatedProperties");
		const aChartMeasures = oChart.Measures ? oChart.Measures : [];
		const aChartDynamicMeasures = oChart.DynamicMeasures ? oChart.DynamicMeasures : [];
		//check if there are measures pointing to aggregatedproperties
		const aTransAggInMeasures = aAggregatedProperties[0]
			? aAggregatedProperties[0].filter(function (oAggregatedProperties: Record<string, string>) {
					return aChartMeasures.some(function (oMeasure: MeasureType) {
						return oAggregatedProperties.Name === oMeasure.value;
					});
			  })
			: undefined;
		const sEntitySetPath = sAnnoPath.replace(
			/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant|SelectionPresentationVariant).*/,
			""
		);
		const oTransAggregations = oProps.chartDefinition.transAgg;
		const oCustomAggregations = oProps.chartDefinition.customAgg;
		// intimate the user if there is Aggregatedproperty configured with no DYnamicMeasures, bu there are measures with AggregatedProperties
		if (aAggregatedProperty.length > 0 && !aChartDynamicMeasures && aTransAggInMeasures.length > 0) {
			Log.warning(
				"The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly."
			);
		}
		const bIsCustomAggregateIsMeasure = aChartMeasures.some((oChartMeasure: MeasureType) => {
			const oCustomAggMeasure = this.getCustomAggMeasure(oCustomAggregations, oChartMeasure);
			return !!oCustomAggMeasure;
		});
		if (aAggregatedProperty.length > 0 && !aChartDynamicMeasures.length && !bIsCustomAggregateIsMeasure) {
			throw new Error("Please configure DynamicMeasures for the chart");
		}
		if (aAggregatedProperty.length > 0) {
			for (const dynamicMeasure of aChartDynamicMeasures) {
				aMeasures = this.getDynamicMeasures(aMeasures, dynamicMeasure, sEntitySetPath, oChart);
			}
		}
		for (const chartMeasure of aChartMeasures) {
			const sKey = chartMeasure.value;
			const oCustomAggMeasure = this.getCustomAggMeasure(oCustomAggregations, chartMeasure);
			const oMeasure: MeasureType = {};
			if (oCustomAggMeasure) {
				aMeasures = this.setCustomAggMeasure(aMeasures, oMeasure, oCustomAggMeasure, sKey);
				//if there is neither aggregatedProperty nor measures pointing to customAggregates, but we have normal measures. Now check if these measures are part of AggregatedProperties Obj
			} else if (aAggregatedProperty.length === 0 && oTransAggregations[sKey]) {
				aMeasures = this.setTransAggMeasure(aMeasures, oMeasure, oTransAggregations, sKey);
			}
			this.setChartMeasureAttributes(chart.MeasureAttributes, sEntitySetPath, oMeasure);
		}
		const oMeasuresModel: JSONModel = new JSONModel(aMeasures);
		(oMeasuresModel as any).$$valueAsPromise = true;
		return oMeasuresModel.createBindingContext("/") as V4Context;
	};

	setCustomAggMeasure = (aMeasures: MeasureType[], oMeasure: MeasureType, oCustomAggMeasure: MeasureType, sKey: string) => {
		if (sKey.indexOf("/") > -1) {
			Log.error("$expand is not yet supported. Measure: ${sKey} from an association cannot be used");
		}
		oMeasure.key = oCustomAggMeasure.value;
		oMeasure.role = "axis1";

		oMeasure.propertyPath = oCustomAggMeasure.value;
		aMeasures.push(oMeasure);
		return aMeasures;
	};

	setTransAggMeasure = (
		aMeasures: MeasureType[],
		oMeasure: MeasureType,
		oTransAggregations: Record<string, MeasureType>,
		sKey: string
	) => {
		const oTransAggMeasure = oTransAggregations[sKey];
		oMeasure.key = oTransAggMeasure.name;
		oMeasure.role = "axis1";
		oMeasure.propertyPath = sKey;
		oMeasure.aggregationMethod = oTransAggMeasure.aggregationMethod;
		oMeasure.label = oTransAggMeasure.label || oMeasure.label;
		aMeasures.push(oMeasure);
		return aMeasures;
	};

	getDynamicMeasures = (aMeasures: MeasureType[], dynamicMeasure: MeasureType, sEntitySetPath: string, oChart: Chart): MeasureType[] => {
		const sKey = dynamicMeasure.value || "";
		const oAggregatedProperty = getInvolvedDataModelObjects(
			this.metaPath.getModel().createBindingContext(sEntitySetPath + sKey),
			this.contextPath
		).targetObject;
		if (sKey.indexOf("/") > -1) {
			Log.error("$expand is not yet supported. Measure: ${sKey} from an association cannot be used");
			// check if the annotation path is wrong
		} else if (!oAggregatedProperty) {
			throw new Error("Please provide the right AnnotationPath to the Dynamic Measure " + dynamicMeasure.value);
			// check if the path starts with @
		} else if (dynamicMeasure.value?.startsWith("@com.sap.vocabularies.Analytics.v1.AggregatedProperty") === null) {
			throw new Error("Please provide the right AnnotationPath to the Dynamic Measure " + dynamicMeasure.value);
		} else {
			// check if AggregatedProperty is defined in given DynamicMeasure
			const oDynamicMeasure: MeasureType = {
				key: oAggregatedProperty.Name,
				role: "axis1"
			};
			oDynamicMeasure.propertyPath = oAggregatedProperty.AggregatableProperty.value;
			oDynamicMeasure.aggregationMethod = oAggregatedProperty.AggregationMethod;
			oDynamicMeasure.label = resolveBindingString(
				oAggregatedProperty.annotations._annotations["com.sap.vocabularies.Common.v1.Label"] ||
					getInvolvedDataModelObjects(
						this.metaPath
							.getModel()
							.createBindingContext(sEntitySetPath + oDynamicMeasure.propertyPath + "@com.sap.vocabularies.Common.v1.Label"),
						this.contextPath
					).targetObject
			);
			this.setChartMeasureAttributes(oChart.MeasureAttributes, sEntitySetPath, oDynamicMeasure);
			aMeasures.push(oDynamicMeasure);
		}
		return aMeasures;
	};

	getCustomAggMeasure = (oCustomAggregations: Record<string, MeasureType | undefined>, oMeasure: MeasureType) => {
		if (oMeasure.value && oCustomAggregations[oMeasure.value]) {
			return oMeasure;
		}
		return null;
	};

	setChartMeasureAttributes = (aMeasureAttributes: ChartMeasureAttributeType[], sEntitySetPath: string, oMeasure: MeasureType) => {
		if (aMeasureAttributes?.length) {
			for (const measureAttribute of aMeasureAttributes) {
				this._setChartMeasureAttribute(measureAttribute, sEntitySetPath, oMeasure);
			}
		}
	};

	_setChartMeasureAttribute = (measureAttribute: ChartMeasureAttributeType, sEntitySetPath: string, oMeasure: MeasureType) => {
		const sPath = measureAttribute.DynamicMeasure ? measureAttribute?.DynamicMeasure?.value : measureAttribute?.Measure?.value;
		const dataPoint = measureAttribute.DataPoint ? measureAttribute?.DataPoint?.value : null;
		const role = measureAttribute.Role;
		const oDataPoint =
			dataPoint &&
			getInvolvedDataModelObjects(this.metaPath.getModel().createBindingContext(sEntitySetPath + dataPoint), this.contextPath)
				.targetObject;
		if (oMeasure.key === sPath) {
			this.setMeasureRole(oMeasure, role);
			//still to add data point, but UI5 Chart API is missing
			this.setMeasureDataPoint(oMeasure, oDataPoint);
		}
	};

	setMeasureDataPoint = (oMeasure: MeasureType, oDataPoint: DataPoint | undefined) => {
		if (oDataPoint && oDataPoint.Value.$Path == oMeasure.key) {
			oMeasure.dataPoint = this.formatJSONToString(ODataMetaModelUtil.createDataPointProperty(oDataPoint)) || "";
		}
	};

	setMeasureRole = (oMeasure: MeasureType, role: ChartMeasureRoleType | undefined) => {
		if (role) {
			const index = (role as any).$EnumMember;
			oMeasure.role = mMeasureRole[index];
		}
	};

	formatJSONToString = (oCrit: object) => {
		if (!oCrit) {
			return undefined;
		}
		let sCriticality = JSON.stringify(oCrit);
		sCriticality = sCriticality.replace(new RegExp("{", "g"), "\\{");
		sCriticality = sCriticality.replace(new RegExp("}", "g"), "\\}");
		return sCriticality;
	};

	getDependents = (chartContext: V4Context) => {
		if (this._commandActions.length > 0) {
			return this._commandActions.map((commandAction: CommandAction) => {
				return this.getActionCommand(commandAction, chartContext);
			});
		}
		return xml``;
	};

	/**
	 *
	 * @param oProps Specifies the chart properties
	 */
	checkPersonalizationInChartProperties = (oProps: any) => {
		if (oProps.personalization) {
			if (oProps.personalization === "false") {
				this.personalization = undefined;
			} else if (oProps.personalization === "true") {
				this.personalization = Object.values(personalizationValues).join(",");
			} else if (this.verifyValidPersonlization(oProps.personalization) === true) {
				this.personalization = oProps.personalization;
			} else {
				this.personalization = undefined;
			}
		}
	};

	/**
	 *
	 * @param personalization
	 * @returns `true` or `false` if the personalization is valid or not valid
	 */
	verifyValidPersonlization = (personalization: String) => {
		let valid: Boolean = true;
		const splitArray = personalization.split(",");
		const acceptedValues: string[] = Object.values(personalizationValues);
		splitArray.forEach((arrayElement) => {
			if (!acceptedValues.includes(arrayElement)) {
				valid = false;
			}
		});
		return valid;
	};

	getVariantManagement = (oProps: any, oChartDefinition: ChartVisualization) => {
		let variantManagement = oProps.variantManagement ? oProps.variantManagement : oChartDefinition.variantManagement;
		variantManagement = this.personalization === undefined ? "None" : variantManagement;
		return variantManagement;
	};

	createVariantManagement = () => {
		const personalization = this.personalization;
		if (personalization) {
			const variantManagement = this.variantManagement;
			if (variantManagement === "Control") {
				return xml`
					<mdc:variant>
					<variant:VariantManagement
						id="${generate([this.id, "VM"])}"
						for="${this.id}"
						showSetAsDefault="${true}"
						select="${this.variantSelected}"
						headerLevel="${this.headerLevel}"
						save="${this.variantSaved}"
					/>
					</mdc:variant>
			`;
			} else if (variantManagement === "None" || variantManagement === "Page") {
				return xml``;
			}
		} else if (!personalization) {
			Log.warning("Variant Management cannot be enabled when personalization is disabled");
		}
		return xml``;
	};

	getPersistenceProvider = () => {
		if (this.variantManagement === "None") {
			return xml`<p13n:PersistenceProvider id="${generate([this.id, "PersistenceProvider"])}" for="${this.id}"/>`;
		}
		return xml``;
	};

	pushActionCommand = (
		actionContext: V4Context,
		dataField: DataFieldForAction | undefined,
		chartOperationAvailableMap: string | undefined,
		action: BaseAction | { handlerModule: string; handlerMethod: string }
	) => {
		if (dataField) {
			const commandAction = {
				actionContext: actionContext,
				onExecuteAction: ChartHelper.getPressEventForDataFieldForActionButton(this.id, dataField, chartOperationAvailableMap || ""),
				onExecuteIBN: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false),
				onExecuteManifest: CommonHelper.buildActionWrapper(action as { handlerModule: string; handlerMethod: string }, this)
			};
			this._commandActions.push(commandAction);
		}
	};

	getActionCommand = (commandAction: CommandAction, chartContext: V4Context) => {
		const oAction = commandAction.actionContext;
		const action = oAction.getObject();
		const dataFieldContext = action.annotationPath && this.contextPath.getModel().createBindingContext(action.annotationPath);
		const dataField = dataFieldContext && dataFieldContext.getObject();
		const dataFieldAction = this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action");
		const actionContext = CommonHelper.getActionContext(dataFieldAction);
		const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
		const isBound = this.contextPath.getModel().createBindingContext(isBoundPath).getObject();
		const chartOperationAvailableMap = escapeXMLAttributeValue(
			ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
				context: chartContext
			})
		);
		const isActionEnabled = action.enabled
			? action.enabled
			: ChartHelper.isDataFieldForActionButtonEnabled(
					isBound && isBound.$IsBound,
					dataField.Action,
					this.contextPath,
					chartOperationAvailableMap || "",
					action.enableOnSelect || ""
			  );
		let isIBNEnabled;
		if (action.enabled) {
			isIBNEnabled = action.enabled;
		} else if (dataField.RequiresContext) {
			isIBNEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
		}
		const actionCommand = xml`<internalMacro:ActionCommand
		action="${action}"
		onExecuteAction="${commandAction.onExecuteAction}"
		onExecuteIBN="${commandAction.onExecuteIBN}"
		onExecuteManifest="${commandAction.onExecuteManifest}"
		isIBNEnabled="${isIBNEnabled}"
		isActionEnabled="${isActionEnabled}"
		visible="${this.getVisible(dataFieldContext)}"
	/>`;
		if (
			action.type == "ForAction" &&
			(!isBound || isBound.IsBound !== true || actionContext["@Org.OData.Core.V1.OperationAvailable"] !== false)
		) {
			return actionCommand;
		} else if (action.type == "ForAction") {
			return xml``;
		} else {
			return actionCommand;
		}
	};

	getItems = (chartContext: V4Context) => {
		const chart = chartContext.getObject();
		const dimensions: string[] = [];
		const measures: string[] = [];
		if (chart.Dimensions) {
			ChartHelper.formatDimensions(chartContext)
				.getObject()
				.forEach((dimension: DimensionType) => {
					dimension.id = generate([this.id, "dimension", dimension.key]);
					dimensions.push(
						this.getItem(
							{
								id: dimension.id,
								key: dimension.key,
								label: dimension.label,
								role: dimension.role
							},
							"_fe_groupable_",
							"groupable"
						)
					);
				});
		}
		if (this.measures) {
			ChartHelper.formatMeasures(this.measures).forEach((measure: MeasureType) => {
				measure.id = generate([this.id, "measure", measure.key]);
				measures.push(
					this.getItem(
						{
							id: measure.id,
							key: measure.key,
							label: measure.label,
							role: measure.role
						},
						"_fe_aggregatable_",
						"aggregatable"
					)
				);
			});
		}
		if (dimensions.length && measures.length) {
			return dimensions.concat(measures);
		}
		return xml``;
	};

	getItem = (item: MeasureType | DimensionType, prefix: string, type: string) => {
		return xml`<chart:Item
			id="${item.id}"
			name="${prefix + item.key}"
			type="${type}"
			label="${resolveBindingString(item.label as string, "string")}"
			role="${item.role}"
		/>`;
	};

	getToolbarActions = (chartContext: V4Context) => {
		const aActions = this.getActions(chartContext);
		if (this.onSegmentedButtonPressed) {
			aActions.push(this.getSegmentedButton());
		}
		if (aActions.length > 0) {
			return xml`<mdc:actions>${aActions}</mdc:actions>`;
		}
		return xml``;
	};

	getActions = (chartContext: V4Context) => {
		let actions = this.chartActions?.getObject();
		actions = this.removeMenuItems(actions);
		return actions.map((action: CustomAndAction) => {
			if (action.annotationPath) {
				// Load annotation based actions
				return this.getAction(action, chartContext, false);
			} else if (action.hasOwnProperty("noWrap")) {
				// Load XML or manifest based actions / action groups
				return this.getCustomActions(action, chartContext);
			}
		});
	};

	removeMenuItems = (actions: BaseAction[]) => {
		// If action is already part of menu in action group, then it will
		// be removed from the main actions list
		for (const action of actions) {
			if (action.menu) {
				action.menu.forEach((item) => {
					if (actions.indexOf(item as BaseAction) !== -1) {
						actions.splice(actions.indexOf(item as BaseAction), 1);
					}
				});
			}
		}
		return actions;
	};

	getCustomActions = (action: CustomAndAction, chartContext: V4Context) => {
		let actionEnabled = action.enabled as string | boolean;
		if ((action.requiresSelection ?? false) && action.enabled === "true") {
			actionEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
		}
		if (action.type === "Default") {
			// Load XML or manifest based toolbar actions
			return this.getActionToolbarAction(
				action,
				{
					id: generate([this.id, action.id]),
					unittestid: "DataFieldForActionButtonAction",
					label: action.text ? action.text : "",
					ariaHasPopup: undefined,
					press: action.press ? action.press : "",
					enabled: actionEnabled,
					visible: action.visible ? action.visible : false
				},
				false
			);
		} else if (action.type === "Menu") {
			// Load action groups (Menu)
			return this.getActionToolbarMenuAction(
				{
					id: generate([this.id, action.id]),
					text: action.text,
					visible: action.visible,
					enabled: actionEnabled,
					useDefaultActionOnly: DefaultActionHandler.getUseDefaultActionOnly(action),
					buttonMode: DefaultActionHandler.getButtonMode(action),
					defaultAction: undefined,
					actions: action
				},
				chartContext
			);
		}
	};

	getMenuItemFromMenu = (menuItemAction: CustomAction & { handlerModule: string; handlerMethod: string }, chartContext: V4Context) => {
		let pressHandler;
		if (menuItemAction.annotationPath) {
			//Annotation based action is passed as menu item for menu button
			return this.getAction(menuItemAction, chartContext, true);
		}
		if (menuItemAction.command) {
			pressHandler = "cmd:" + menuItemAction.command;
		} else if (menuItemAction.noWrap ?? false) {
			pressHandler = menuItemAction.press;
		} else {
			pressHandler = CommonHelper.buildActionWrapper(menuItemAction, this);
		}
		return xml`<MenuItem
		core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
		text="${menuItemAction.text}"
		press="${pressHandler}"
		visible="${menuItemAction.visible}"
		enabled="${menuItemAction.enabled}"
	/>`;
	};

	getActionToolbarMenuAction = (props: CustomToolbarMenuAction, chartContext: V4Context) => {
		const aMenuItems = props.actions?.menu?.map((action: CustomAction & { handlerModule: string; handlerMethod: string }) => {
			return this.getMenuItemFromMenu(action, chartContext);
		});
		return xml`<mdcat:ActionToolbarAction>
			<MenuButton
			text="${props.text}"
			type="Transparent"
			menuPosition="BeginBottom"
			id="${props.id}"
			visible="${props.visible}"
			enabled="${props.enabled}"
			useDefaultActionOnly="${props.useDefaultActionOnly}"
			buttonMode="${props.buttonMode}"
			defaultAction="${props.defaultAction}"
			>
				<menu>
					<Menu>
						${aMenuItems}
					</Menu>
				</menu>
			</MenuButton>
		</mdcat:ActionToolbarAction>`;
	};

	getAction = (action: BaseAction, chartContext: V4Context, isMenuItem: boolean) => {
		const dataFieldContext = this.contextPath.getModel().createBindingContext(action.annotationPath || "") as V4Context;
		if (action.type === "ForNavigation") {
			return this.getNavigationActions(action, dataFieldContext, isMenuItem);
		} else if (action.type === "ForAction") {
			return this.getAnnotationActions(chartContext, action, dataFieldContext, isMenuItem);
		}
		return xml``;
	};

	getNavigationActions = (action: BaseAction, dataFieldContext: V4Context, isMenuItem: boolean) => {
		let bEnabled = "true";
		const dataField = dataFieldContext.getObject();
		if (action.enabled !== undefined) {
			bEnabled = action.enabled;
		} else if (dataField.RequiresContext) {
			bEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
		}
		return this.getActionToolbarAction(
			action,
			{
				id: undefined,
				unittestid: "DataFieldForIntentBasedNavigationButtonAction",
				label: dataField.Label,
				ariaHasPopup: undefined,
				press: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false),
				enabled: bEnabled,
				visible: this.getVisible(dataFieldContext)
			},
			isMenuItem
		);
	};

	getAnnotationActions = (chartContext: V4Context, action: BaseAction, dataFieldContext: V4Context, isMenuItem: boolean) => {
		const dataFieldAction = this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action");
		const actionContext = this.contextPath.getModel().createBindingContext(CommonHelper.getActionContext(dataFieldAction));
		const actionObject = actionContext.getObject();
		const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
		const isBound = this.contextPath.getModel().createBindingContext(isBoundPath).getObject();
		const dataField = dataFieldContext.getObject();
		if (!isBound || isBound.$IsBound !== true || actionObject["@Org.OData.Core.V1.OperationAvailable"] !== false) {
			const bEnabled = this.getAnnotationActionsEnabled(action, isBound, dataField, chartContext);
			const ariaHasPopup = CommonHelper.isDialog(actionObject, { context: actionContext });
			const chartOperationAvailableMap =
				escapeXMLAttributeValue(
					ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
						context: chartContext
					})
				) || "";
			return this.getActionToolbarAction(
				action,
				{
					id: generate([this.id, getInvolvedDataModelObjects(dataFieldContext)]),
					unittestid: "DataFieldForActionButtonAction",
					label: dataField.Label,
					ariaHasPopup: ariaHasPopup,
					press: ChartHelper.getPressEventForDataFieldForActionButton(this.id, dataField, chartOperationAvailableMap),
					enabled: bEnabled,
					visible: this.getVisible(dataFieldContext)
				},
				isMenuItem
			);
		}
		return xml``;
	};

	getActionToolbarAction = (action: BaseAction & { noWrap?: boolean }, toolbarAction: ToolBarAction, isMenuItem: boolean) => {
		if (isMenuItem) {
			return xml`
			<MenuItem
				text="${toolbarAction.label}"
				press="${action.command ? "cmd:" + action.command : toolbarAction.press}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>`;
		} else {
			return this.buildAction(action, toolbarAction);
		}
	};

	buildAction = (action: BaseAction, toolbarAction: ToolBarAction) => {
		let actionPress: string | undefined = "";
		if (action.hasOwnProperty("noWrap")) {
			if (action.command) {
				actionPress = "cmd:" + action.command;
			} else if ((action as CustomAction).noWrap === true) {
				actionPress = toolbarAction.press;
			} else if (!action.annotationPath) {
				actionPress = CommonHelper.buildActionWrapper(
					action as BaseAction & { handlerModule: string; handlerMethod: string },
					this
				);
			}
			return xml`<mdcat:ActionToolbarAction>
			<Button
				core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
				unittest:id="${toolbarAction.unittestid}"
				id="${toolbarAction.id}"
				text="${toolbarAction.label}"
				ariaHasPopup="${toolbarAction.ariaHasPopup}"
				press="${actionPress}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>
		   </mdcat:ActionToolbarAction>`;
		} else {
			return xml`<mdcat:ActionToolbarAction>
			<Button
				unittest:id="${toolbarAction.unittestid}"
				id="${toolbarAction.id}"
				text="${toolbarAction.label}"
				ariaHasPopup="${toolbarAction.ariaHasPopup}"
				press="${action.command ? "cmd:" + action.command : toolbarAction.press}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>
		</mdcat:ActionToolbarAction>`;
		}
	};

	getAnnotationActionsEnabled = (
		action: BaseAction,
		isBound: Record<string, boolean>,
		dataField: DataFieldForAction,
		chartContext: V4Context
	) => {
		return action.enabled !== undefined
			? action.enabled
			: ChartHelper.isDataFieldForActionButtonEnabled(
					isBound && isBound.$IsBound,
					dataField.Action as string,
					this.contextPath,
					ChartHelper.getOperationAvailableMap(chartContext.getObject(), { context: chartContext }),
					action.enableOnSelect || ""
			  );
	};

	getSegmentedButton = () => {
		return xml`<mdcat:ActionToolbarAction layoutInformation="{
			aggregationName: 'end',
			alignment: 'End'
		}">
			<SegmentedButton
				id="${generate([this.id, "SegmentedButton", "TemplateContentView"])}"
				select="${this.onSegmentedButtonPressed}"
				visible="{= \${pageInternal>alpContentView} !== 'Table' }"
				selectedKey="{pageInternal>alpContentView}"
			>
				<items>
					${this.getSegmentedButtonItems()}
				</items>
			</SegmentedButton>
		</mdcat:ActionToolbarAction>`;
	};

	getSegmentedButtonItems = () => {
		const sSegmentedButtonItems = [];
		if (CommonHelper.isDesktop()) {
			sSegmentedButtonItems.push(
				this.getSegmentedButtonItem(
					"{sap.fe.i18n>M_COMMON_HYBRID_SEGMENTED_BUTTON_ITEM_TOOLTIP}",
					"Hybrid",
					"sap-icon://chart-table-view"
				)
			);
		}
		sSegmentedButtonItems.push(
			this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_CHART_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Chart", "sap-icon://bar-chart")
		);
		sSegmentedButtonItems.push(
			this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_TABLE_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Table", "sap-icon://table-view")
		);
		return sSegmentedButtonItems;
	};

	getSegmentedButtonItem = (tooltip: string, key: string, icon: string) => {
		return xml`<SegmentedButtonItem
			tooltip="${tooltip}"
			key="${key}"
			icon="${icon}"
		/>`;
	};

	/**
	 * Returns the annotation path pointing to the visualization annotation (Chart).
	 *
	 * @param props The chart properties
	 * @param contextObjectPath The datamodel object path for the chart
	 * @param converterContext The converter context
	 * @returns The annotation path
	 */
	static getVisualizationPath = (
		props: PropertiesOf<ChartBuildingBlock>,
		contextObjectPath: DataModelObjectPath,
		converterContext: ConverterContext
	) => {
		let metaPath: string | undefined = getContextRelativeTargetObjectPath(contextObjectPath) as string;
		if (contextObjectPath.targetObject.term === UIAnnotationTerms.Chart) {
			return metaPath; // MetaPath is already pointing to a Chart
		}
		if (props.metaPath?.getObject().$Type === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
			const aVisualizations = props.metaPath.getObject().Visualizations;
			metaPath = ChartBuildingBlock.checkChartVisualizationPath(aVisualizations, metaPath);
		}
		if (metaPath) {
			//Need to switch to the context related the PV or SPV
			const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);

			let visualizations: VisualizationAndPath[] = [];
			switch (contextObjectPath.targetObject?.term) {
				case UIAnnotationTerms.SelectionPresentationVariant:
					if (contextObjectPath.targetObject.PresentationVariant) {
						visualizations = getVisualizationsFromPresentationVariant(
							contextObjectPath.targetObject.PresentationVariant,
							metaPath,
							resolvedTarget.converterContext
						);
					}
					break;

				case UIAnnotationTerms.PresentationVariant:
					visualizations = getVisualizationsFromPresentationVariant(
						contextObjectPath.targetObject,
						metaPath,
						resolvedTarget.converterContext
					);
					break;

				default:
					Log.error(`Bad metapath parameter for chart : ${contextObjectPath.targetObject.term}`);
			}

			const chartViz = visualizations.find((viz) => {
				return viz.visualization.term === UIAnnotationTerms.Chart;
			});

			if (chartViz) {
				return chartViz.annotationPath;
			} else {
				return metaPath; // Fallback
			}
		} else {
			Log.error(`Bad metapath parameter for chart : ${contextObjectPath.targetObject.term}`);
			return metaPath;
		}
	};

	getVisible = (dataFieldContext: V4Context) => {
		const dataField = dataFieldContext.getObject();
		if (dataField["@com.sap.vocabularies.UI.v1.Hidden"] && dataField["@com.sap.vocabularies.UI.v1.Hidden"].$Path) {
			const hiddenPathContext = this.contextPath
				.getModel()
				.createBindingContext(
					dataFieldContext.getPath() + "/@com.sap.vocabularies.UI.v1.Hidden/$Path",
					dataField["@com.sap.vocabularies.UI.v1.Hidden"].$Path
				);
			return ChartHelper.getHiddenPathExpressionForTableActionsAndIBN(dataField["@com.sap.vocabularies.UI.v1.Hidden"].$Path, {
				context: hiddenPathContext
			});
		} else if (dataField["@com.sap.vocabularies.UI.v1.Hidden"]) {
			return !dataField["@com.sap.vocabularies.UI.v1.Hidden"];
		} else {
			return true;
		}
	};

	getContextPath = () => {
		return this.contextPath.getPath().lastIndexOf("/") === this.contextPath.getPath().length - 1
			? this.contextPath.getPath().replaceAll("/", "")
			: this.contextPath.getPath().split("/")[this.contextPath.getPath().split("/").length - 1];
	};

	getTemplate() {
		const chartContext = ChartHelper.getUiChart(this.metaPath);
		const chart = chartContext.getObject();
		let chartdelegate = "";
		if (this.chartDelegate) {
			chartdelegate = this.chartDelegate;
		} else {
			const sContextPath = this.getContextPath();
			chartdelegate =
				"{name:'sap/fe/macros/chart/ChartDelegate', payload: {contextPath: '" +
				sContextPath +
				"', parameters:{$$groupId:'$auto.Workers'}, selectionMode: '" +
				this.selectionMode +
				"'}}";
		}
		const binding = "{internal>controls/" + this.id + "}";
		if (!this.header) {
			this.header = chart.Title;
		}
		return xml`
			<macro:ChartAPI xmlns="sap.m" xmlns:macro="sap.fe.macros.chart" xmlns:variant="sap.ui.fl.variants" xmlns:p13n="sap.ui.mdc.p13n" xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1" xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1" xmlns:internalMacro="sap.fe.macros.internal" xmlns:chart="sap.ui.mdc.chart" xmlns:mdc="sap.ui.mdc" xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:core="sap.ui.core" id="${
				this._apiId
			}" selectionChange="${this.selectionChange}" stateChange="${this.stateChange}">
				<macro:layoutData>
					<FlexItemData growFactor="1" shrinkFactor="1" />
				</macro:layoutData>
				<mdc:Chart
					binding="${binding}"
					unittest:id="ChartMacroFragment"
					id="${this._contentId}"
					chartType="${this._chartType}"
					sortConditions="${this._sortCondtions}"
					header="${this.header}"
					headerVisible="${this.headerVisible}"
					height="${this.height}"
					width="${this.width}"
					headerLevel="${this.headerLevel}"
					p13nMode="${this.personalization}"
					filter="${this.filter}"
					noDataText="${this.noDataText}"
					autoBindOnInit="${this.autoBindOnInit}"
					delegate="${chartdelegate}"
					macrodata:targetCollectionPath="${this._customData.targetCollectionPath}"
					macrodata:entitySet="${this._customData.entitySet}"
					macrodata:entityType="${this._customData.entityType}"
					macrodata:operationAvailableMap="${this._customData.operationAvailableMap}"
					macrodata:multiSelectDisabledActions="${this._customData.multiSelectDisabledActions}"
					macrodata:segmentedButtonId="${this._customData.segmentedButtonId}"
					macrodata:customAgg="${this._customData.customAgg}"
					macrodata:transAgg="${this._customData.transAgg}"
					macrodata:applySupported="${this._customData.applySupported}"
					macrodata:vizProperties="${this._customData.vizProperties}"
					macrodata:draftSupported="${this._customData.draftSupported}"
					macrodata:multiViews="${this._customData.multiViews}"
					visible="${this.visible}"
				>
				<mdc:dependents>
					${this.getDependents(chartContext)}
					${this.getPersistenceProvider()}
				</mdc:dependents>
				<mdc:items>
					${this.getItems(chartContext)}
				</mdc:items>
				${this._actions}
				${this.createVariantManagement()}
			</mdc:Chart>
		</macro:ChartAPI>`;
	}
}
