import type { Chart, DataFieldAbstractTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import { isDataFieldForActionAbstract } from "sap/fe/core/converters/annotations/DataField";
import type {
	AnnotationAction,
	BaseAction,
	CombinedAction,
	CustomAction,
	OverrideTypeAction
} from "sap/fe/core/converters/controls/Common/Action";
import { getActionsFromManifest } from "sap/fe/core/converters/controls/Common/Action";
import { insertCustomElements, OverrideType } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import { compileExpression, equal, getExpressionFromAnnotation, not } from "sap/fe/core/helpers/BindingToolkit";
import { getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import Core from "sap/ui/core/Core";
import type ConverterContext from "../../ConverterContext";
import { AggregationHelper } from "../../helpers/Aggregation";
import { getChartID, getFilterBarID } from "../../helpers/ID";
import type { ChartManifestConfiguration, ChartPersonalizationManifestSettings } from "../../ManifestSettings";
import { ActionType, TemplateType, VariantManagementType, VisualizationType } from "../../ManifestSettings";
import type ManifestWrapper from "../../ManifestWrapper";

/**
 * @typedef ChartVisualization
 */
export type ChartVisualization = {
	type: VisualizationType.Chart;
	id: string;
	collection: string;
	entityName: string;
	personalization?: string;
	navigationPath: string;
	annotationPath: string;
	filterId?: string;
	vizProperties: string;
	actions: BaseAction[];
	commandActions: Record<string, CustomAction>;
	title: string;
	autoBindOnInit: boolean | undefined;
	onSegmentedButtonPressed: string;
	visible: string;
	customAgg: object;
	transAgg: object;
	applySupported: {
		$Type: string;
		enableSearch: boolean;
		AggregatableProperties: any[];
		GroupableProperties: any[];
	};
	multiViews?: boolean;
	variantManagement: VariantManagementType;
};

/**
 * Method to retrieve all chart actions from annotations.
 *
 * @param chartAnnotation
 * @param visualizationPath
 * @param converterContext
 * @returns The table annotation actions
 */
function getChartActionsFromAnnotations(
	chartAnnotation: Chart,
	visualizationPath: string,
	converterContext: ConverterContext
): BaseAction[] {
	const chartActions: BaseAction[] = [];
	if (chartAnnotation) {
		const aActions = chartAnnotation.Actions || [];
		aActions.forEach((dataField: DataFieldAbstractTypes) => {
			let chartAction: AnnotationAction | undefined;
			if (
				isDataFieldForActionAbstract(dataField) &&
				!(dataField.annotations?.UI?.Hidden?.valueOf() === true) &&
				!dataField.Inline &&
				!dataField.Determining &&
				!(dataField as any)?.ActionTarget?.isBound
			) {
				const key = KeyHelper.generateKeyFromDataField(dataField);
				switch (dataField.$Type) {
					case UIAnnotationTypes.DataFieldForAction:
						chartAction = {
							type: ActionType.DataFieldForAction,
							annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
							key: key,
							visible: getCompileExpressionForAction(dataField, converterContext)
						};
						break;

					case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
						chartAction = {
							type: ActionType.DataFieldForIntentBasedNavigation,
							annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
							key: key,
							visible: getCompileExpressionForAction(dataField, converterContext),
							isNavigable: true
						};
						break;
				}
			}
			if (chartAction) {
				chartActions.push(chartAction);
			}
		});
	}
	return chartActions;
}

export function getChartActions(chartAnnotation: Chart, visualizationPath: string, converterContext: ConverterContext): CombinedAction {
	const aAnnotationActions: BaseAction[] = getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext);
	const manifestActions = getActionsFromManifest(
		converterContext.getManifestControlConfiguration(visualizationPath).actions,
		converterContext,
		aAnnotationActions
	);
	const actionOverwriteConfig: OverrideTypeAction = {
		enabled: OverrideType.overwrite,
		enableOnSelect: OverrideType.overwrite,
		visible: OverrideType.overwrite,
		command: OverrideType.overwrite
	};
	const chartActions = insertCustomElements(aAnnotationActions, manifestActions.actions, actionOverwriteConfig);
	return {
		actions: chartActions,
		commandActions: manifestActions.commandActions
	};
}

export function getP13nMode(visualizationPath: string, converterContext: ConverterContext): string | undefined {
	const chartManifestSettings: ChartManifestConfiguration = converterContext.getManifestControlConfiguration(visualizationPath);
	let personalization: ChartPersonalizationManifestSettings = true;
	const aPersonalization: string[] = [];
	if (chartManifestSettings?.chartSettings?.personalization !== undefined) {
		personalization = chartManifestSettings.chartSettings.personalization;
	}
	if (personalization) {
		//Variant Management should be enabled when personalization is enabled. Irrespective of wheather or not variant management is enabled, personalization should be enabled.
		if (personalization === true) {
			return "Sort,Type,Item";
		} else if (typeof personalization === "object") {
			if (personalization.type) {
				aPersonalization.push("Type");
			}
			if (personalization.item) {
				aPersonalization.push("Item");
			}
			if (personalization.sort) {
				aPersonalization.push("Sort");
			}
			return aPersonalization.join(",");
		}
	}
	return undefined;
}

/**
 * Create the ChartVisualization configuration that will be used to display a chart using the Chart building block.
 *
 * @param chartAnnotation The target chart annotation
 * @param visualizationPath The current visualization annotation path
 * @param converterContext The converter context
 * @param doNotCheckApplySupported Flag that indicates whether applysupported needs to be checked or not
 * @returns The chart visualization based on the annotation
 */
export function createChartVisualization(
	chartAnnotation: Chart,
	visualizationPath: string,
	converterContext: ConverterContext,
	doNotCheckApplySupported?: boolean
): ChartVisualization {
	const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
	if (!doNotCheckApplySupported && !aggregationHelper.isAnalyticsSupported()) {
		throw new Error("ApplySupported is not added to the annotations");
	}
	const aTransAggregations = aggregationHelper.getTransAggregations();
	const aCustomAggregates = aggregationHelper.getCustomAggregateDefinitions();
	const mCustomAggregates = {} as any;
	const pageManifestSettings: ManifestWrapper = converterContext.getManifestWrapper();
	const variantManagement: VariantManagementType = pageManifestSettings.getVariantManagement();
	const p13nMode: string | undefined = getP13nMode(visualizationPath, converterContext);
	if (p13nMode === undefined && variantManagement === "Control") {
		Log.warning("Variant Management cannot be enabled when personalization is disabled");
	}
	if (aCustomAggregates) {
		const entityType = aggregationHelper.getEntityType();
		for (const customAggregate of aCustomAggregates) {
			const aContextDefiningProperties = customAggregate?.annotations?.Aggregation?.ContextDefiningProperties;
			const qualifier = customAggregate?.qualifier;
			const relatedCustomAggregateProperty = qualifier && entityType.entityProperties.find((property) => property.name === qualifier);
			const label = relatedCustomAggregateProperty && relatedCustomAggregateProperty?.annotations?.Common?.Label?.toString();
			mCustomAggregates[qualifier] = {
				name: qualifier,
				label: label || `Custom Aggregate (${qualifier})`,
				sortable: true,
				sortOrder: "both",
				contextDefiningProperty: aContextDefiningProperties
					? aContextDefiningProperties.map((oCtxDefProperty) => {
							return oCtxDefProperty.value;
					  })
					: []
			};
		}
	}

	const mTransAggregations = {} as any;
	const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
	if (aTransAggregations) {
		for (let i = 0; i < aTransAggregations.length; i++) {
			mTransAggregations[aTransAggregations[i].Name] = {
				name: aTransAggregations[i].Name,
				propertyPath: aTransAggregations[i].AggregatableProperty.valueOf().value,
				aggregationMethod: aTransAggregations[i].AggregationMethod,
				label: aTransAggregations[i]?.annotations?.Common?.Label
					? aTransAggregations[i]?.annotations?.Common?.Label.toString()
					: `${oResourceBundleCore.getText("AGGREGATABLE_PROPERTY")} (${aTransAggregations[i].Name})`,
				sortable: true,
				sortOrder: "both",
				custom: false
			};
		}
	}

	const aAggProps = aggregationHelper.getAggregatableProperties();
	const aGrpProps = aggregationHelper.getGroupableProperties();
	const mApplySupported = {} as any;
	mApplySupported.$Type = "Org.OData.Aggregation.V1.ApplySupportedType";
	mApplySupported.AggregatableProperties = [];
	mApplySupported.GroupableProperties = [];

	for (let i = 0; aAggProps && i < aAggProps.length; i++) {
		const obj = {
			$Type: aAggProps[i]?.$Type,
			Property: {
				$PropertyPath: aAggProps[i]?.Property?.value
			}
		};

		mApplySupported.AggregatableProperties.push(obj);
	}

	for (let i = 0; aGrpProps && i < aGrpProps.length; i++) {
		const obj = { $PropertyPath: aGrpProps[i]?.value };

		mApplySupported.GroupableProperties.push(obj);
	}

	const chartActions = getChartActions(chartAnnotation, visualizationPath, converterContext);
	let [navigationPropertyPath /*, annotationPath*/] = visualizationPath.split("@");
	if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
		// Drop trailing slash
		navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
	}
	const title: any = chartAnnotation.Title; // read title from chart annotation
	const dataModelPath = converterContext.getDataModelObjectPath();
	const isEntitySet: boolean = navigationPropertyPath.length === 0;
	const entityName: string = dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
	const sFilterbarId = isEntitySet ? getFilterBarID(converterContext.getContextPath()) : undefined;
	const oVizProperties = {
		legendGroup: {
			layout: {
				position: "bottom"
			}
		}
	};
	let autoBindOnInit: boolean | undefined;
	if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
		autoBindOnInit = true;
	} else if (
		converterContext.getTemplateType() === TemplateType.ListReport ||
		converterContext.getTemplateType() === TemplateType.AnalyticalListPage
	) {
		autoBindOnInit = false;
	}
	const hasMultipleVisualizations =
		converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === "AnalyticalListPage";
	const onSegmentedButtonPressed = hasMultipleVisualizations ? ".handlers.onSegmentedButtonPressed" : "";
	const visible = hasMultipleVisualizations ? "{= ${pageInternal>alpContentView} !== 'Table'}" : "true";
	const allowedTransformations = aggregationHelper.getAllowedTransformations();
	mApplySupported.enableSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;
	let qualifier: string = "";
	if (chartAnnotation.fullyQualifiedName.split("#").length > 1) {
		qualifier = chartAnnotation.fullyQualifiedName.split("#")[1];
	}
	return {
		type: VisualizationType.Chart,
		id: qualifier
			? getChartID(isEntitySet ? entityName : navigationPropertyPath, qualifier, VisualizationType.Chart)
			: getChartID(isEntitySet ? entityName : navigationPropertyPath, VisualizationType.Chart),
		collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
		entityName: entityName,
		personalization: getP13nMode(visualizationPath, converterContext),
		navigationPath: navigationPropertyPath,
		annotationPath: converterContext.getAbsoluteAnnotationPath(visualizationPath),
		filterId: sFilterbarId,
		vizProperties: JSON.stringify(oVizProperties),
		actions: chartActions.actions,
		commandActions: chartActions.commandActions,
		title: title,
		autoBindOnInit: autoBindOnInit,
		onSegmentedButtonPressed: onSegmentedButtonPressed,
		visible: visible,
		customAgg: mCustomAggregates,
		transAgg: mTransAggregations,
		applySupported: mApplySupported,
		variantManagement: findVariantManagement(p13nMode, variantManagement)
	};
}
/**
 * Method to determine variant management.
 *
 * @param p13nMode
 * @param variantManagement
 * @returns The variant management for chart
 */
function findVariantManagement(p13nMode: string | undefined, variantManagement: VariantManagementType) {
	return variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement;
}

/**
 * Method to get compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation.
 *
 * @param dataField
 * @param converterContext
 * @returns Compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation
 */
function getCompileExpressionForAction(dataField: DataFieldAbstractTypes, converterContext: ConverterContext) {
	return compileExpression(
		not(
			equal(
				getExpressionFromAnnotation(
					dataField.annotations?.UI?.Hidden,
					[],
					undefined,
					converterContext.getRelativeModelPathFunction()
				),
				true
			)
		)
	);
}
