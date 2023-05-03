import { PathAnnotationExpression } from "@sap-ux/vocabularies-types";
import { AggregatedPropertyType } from "@sap-ux/vocabularies-types/vocabularies/Analytics";
import { PropertyAnnotations_Measures } from "@sap-ux/vocabularies-types/vocabularies/Measures_Edm";
import { Chart, Hidden } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import { blockAttribute, BuildingBlockBase, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlock";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import { AggregationHelper } from "sap/fe/core/converters/helpers/Aggregation";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import Context from "sap/ui/model/odata/v4/Context";
import ResourceModel from "../ResourceModel";
import InteractiveChartHelper from "./InteractiveChartHelper";

/**
 * @classdesc
 * Building block for creating a VisualFilter based on the metadata provided by OData V4.
 * <br>
 * A Chart annotation is required to bring up an interactive chart
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:VisualFilter
 *   collection="{entitySet&gt;}"
 *   chartAnnotation="{chartAnnotation&gt;}"
 *   id="someID"
 *   groupId="someGroupID"
 *   title="some Title"
 * /&gt;
 * </pre>
 * @class sap.fe.macros.VisualFilter
 * @hideconstructor
 * @private
 * @experimental
 */
@defineBuildingBlock({
	name: "VisualFilter",
	namespace: "sap.fe.macros"
})
export default class VisualFilterBuildingBlock extends BuildingBlockBase {
	@blockAttribute({
		type: "string"
	})
	id!: string;

	@blockAttribute({
		type: "string",
		defaultValue: ""
	})
	title!: string;

	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		$kind: ["EntitySet", "NavigationProperty"]
	})
	contextPath!: Context;

	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	metaPath?: Context;

	@blockAttribute({
		type: "string"
	})
	outParameter!: string;

	@blockAttribute({
		type: "string"
	})
	valuelistProperty!: string;

	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	selectionVariantAnnotation!: Context;

	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	inParameters?: Context;

	@blockAttribute({
		type: "boolean"
	})
	multipleSelectionAllowed!: boolean;

	@blockAttribute({
		type: "boolean"
	})
	required!: boolean;

	@blockAttribute({
		type: "boolean"
	})
	showOverlayInitially!: boolean;

	@blockAttribute({
		type: "string"
	})
	renderLineChart!: string;

	@blockAttribute({
		type: "string"
	})
	requiredProperties!: string;

	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	filterBarEntityType!: Context;

	@blockAttribute({
		type: "boolean"
	})
	showError!: boolean;

	@blockAttribute({
		type: "string"
	})
	chartMeasure?: string;

	@blockAttribute({
		type: "boolean"
	})
	bUoMHasCustomAggregate!: boolean;

	@blockAttribute({
		type: "boolean"
	})
	showValueHelp!: boolean;

	@blockAttribute({
		type: "boolean",
		defaultValue: false
	})
	bCustomAggregate!: boolean;

	@blockAttribute({
		type: "string",
		defaultValue: "$auto.visualFilters"
	})
	groupId!: string;

	@blockAttribute({
		type: "string"
	})
	errorMessageTitle?: string;

	@blockAttribute({
		type: "string"
	})
	errorMessage?: string;

	@blockAttribute({
		type: "boolean"
	})
	draftSupported: boolean;

	aggregateProperties: AggregatedPropertyType | undefined;
	chartType: string | undefined;
	sMetaPath: string | undefined;
	_measureDimensionTitle: string | undefined;
	_toolTip: string | undefined;
	_UoMVisibility: boolean | undefined;
	_scaleUoMTitle: string | undefined;
	_filterCountBinding: string | undefined;

	constructor(oProps: PropertiesOf<VisualFilterBuildingBlock>, configuration: any, mSettings: any) {
		super(oProps, configuration, mSettings);
		this.groupId = "$auto.visualFilters";
		this.inParameters = oProps.inParameters;
		this.metaPath = oProps.metaPath;
		this.sMetaPath = this.metaPath?.getPath();
		const oContextObjectPath = getInvolvedDataModelObjects(this.metaPath as Context, oProps.contextPath);
		const oConverterContext = this.getConverterContext(oContextObjectPath, undefined, mSettings);
		const aggregationHelper = new AggregationHelper(oConverterContext.getEntityType(), oConverterContext);
		const customAggregates = aggregationHelper.getCustomAggregateDefinitions();
		const pvAnnotation = oContextObjectPath.targetObject;
		let chartAnnotation: Chart | undefined;
		let sMeasure: string | undefined;
		const aVisualizations = pvAnnotation && pvAnnotation.Visualizations;
		if (aVisualizations) {
			for (let i = 0; i < aVisualizations.length; i++) {
				const sAnnotationPath = pvAnnotation.Visualizations[i] && pvAnnotation.Visualizations[i].value;
				chartAnnotation =
					oConverterContext.getEntityTypeAnnotation(sAnnotationPath) &&
					oConverterContext.getEntityTypeAnnotation(sAnnotationPath).annotation;
			}
		}
		let aAggregations,
			aCustAggMeasure = [];

		if (chartAnnotation?.Measures?.length) {
			aCustAggMeasure = customAggregates.filter(function (custAgg) {
				return custAgg.qualifier === chartAnnotation?.Measures[0].value;
			});
			sMeasure = aCustAggMeasure.length > 0 ? aCustAggMeasure[0].qualifier : chartAnnotation.Measures[0].value;
			aAggregations = aggregationHelper.getAggregatedProperties("AggregatedProperties")[0];
		}
		// if there are AggregatedProperty objects but no dynamic measures, rather there are transformation aggregates found in measures
		if (
			aAggregations &&
			aAggregations.length > 0 &&
			!chartAnnotation?.DynamicMeasures &&
			aCustAggMeasure.length === 0 &&
			chartAnnotation?.Measures &&
			chartAnnotation?.Measures.length > 0
		) {
			Log.warning(
				"The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly."
			);
		}
		//if the chart has dynamic measures, but with no other custom aggregate measures then consider the dynamic measures
		if (chartAnnotation?.DynamicMeasures) {
			if (aCustAggMeasure.length === 0) {
				sMeasure = oConverterContext
					.getConverterContextFor(oConverterContext.getAbsoluteAnnotationPath(chartAnnotation.DynamicMeasures[0].value))
					.getDataModelObjectPath().targetObject.Name;
				aAggregations = aggregationHelper.getAggregatedProperties("AggregatedProperty");
			} else {
				Log.warning(
					"The dynamic measures have been ignored as visual filters can deal with only 1 measure and the first (custom aggregate) measure defined under Chart.Measures is considered."
				);
			}
		}
		let validChartType;
		if (chartAnnotation) {
			if (chartAnnotation.ChartType === "UI.ChartType/Line" || chartAnnotation.ChartType === "UI.ChartType/Bar") {
				validChartType = true;
			} else {
				validChartType = false;
			}
		}
		if (
			customAggregates.some(function (custAgg) {
				return custAgg.qualifier === sMeasure;
			})
		) {
			this.bCustomAggregate = true;
		}

		let selectionVariant;
		if (oProps.selectionVariantAnnotation) {
			const selectionVariantContext = this.metaPath?.getModel().createBindingContext(oProps.selectionVariantAnnotation.getPath());
			selectionVariant =
				selectionVariantContext && getInvolvedDataModelObjects(selectionVariantContext, oProps.contextPath).targetObject;
		}
		let iSelectOptionsForDimension = 0;
		if (selectionVariant && !oProps.multipleSelectionAllowed) {
			for (let j = 0; j < selectionVariant.SelectOptions.length; j++) {
				if (selectionVariant.SelectOptions[j].PropertyName.value === chartAnnotation?.Dimensions[0].value) {
					iSelectOptionsForDimension++;
					if (iSelectOptionsForDimension > 1) {
						throw new Error("Multiple SelectOptions for FilterField having SingleValue Allowed Expression");
					}
				}
			}
		}

		const oAggregation = this.getAggregateProperties(aAggregations, sMeasure);

		if (oAggregation) {
			this.aggregateProperties = oAggregation;
		}
		const propertyAnnotations = aVisualizations[0]?.$target?.Measures && aVisualizations[0]?.$target?.Measures[0]?.$target?.annotations;
		const aggregatablePropertyAnnotations = oAggregation?.AggregatableProperty?.$target?.annotations;
		const measures = propertyAnnotations?.Measures;
		const aggregatablePropertyMeasures = aggregatablePropertyAnnotations?.Measures;
		const vUOM = this.getUoM(measures, aggregatablePropertyMeasures);
		if (
			vUOM &&
			customAggregates.some(function (custAgg) {
				return custAgg.qualifier === vUOM;
			})
		) {
			this.bUoMHasCustomAggregate = true;
		} else {
			this.bUoMHasCustomAggregate = false;
		}
		const propertyHidden = propertyAnnotations?.UI?.Hidden;
		const aggregatablePropertyHidden = aggregatablePropertyAnnotations?.UI?.Hidden;
		const bHiddenMeasure = this.getHiddenMeasure(propertyHidden, aggregatablePropertyHidden, this.bCustomAggregate);
		const sDimensionType =
			chartAnnotation?.Dimensions[0] && chartAnnotation?.Dimensions[0].$target && chartAnnotation.Dimensions[0].$target.type;
		const sChartType = chartAnnotation?.ChartType;
		if (sDimensionType === "Edm.Date" || sDimensionType === "Edm.Time" || sDimensionType === "Edm.DateTimeOffset") {
			this.showValueHelp = false;
		} else if (typeof bHiddenMeasure === "boolean" && bHiddenMeasure) {
			this.showValueHelp = false;
		} else if (!(sChartType === "UI.ChartType/Bar" || sChartType === "UI.ChartType/Line")) {
			this.showValueHelp = false;
		} else if (oProps.renderLineChart === "false" && sChartType === "UI.ChartType/Line") {
			this.showValueHelp = false;
		} else {
			this.showValueHelp = true;
		}
		this.chartType = sChartType;
		this.draftSupported = ModelHelper.isDraftSupported(mSettings.models.metaModel, oProps.contextPath?.getPath() as string);
		/**
		 * If the measure of the chart is marked as 'hidden', or if the chart type is invalid, or if the data type for the line chart is invalid,
		 * the call is made to the InteractiveChartWithError fragment (using error-message related APIs, but avoiding batch calls)
		 */
		if ((typeof bHiddenMeasure === "boolean" && bHiddenMeasure) || !validChartType || oProps.renderLineChart === "false") {
			this.showError = true;
			this.errorMessageTitle =
				bHiddenMeasure || !validChartType
					? ResourceModel.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE")
					: ResourceModel.getText("M_VISUAL_FILTER_LINE_CHART_INVALID_DATATYPE");
			if (bHiddenMeasure) {
				this.errorMessage = ResourceModel.getText("M_VISUAL_FILTER_HIDDEN_MEASURE", [sMeasure]);
			} else if (!validChartType) {
				this.errorMessage = ResourceModel.getText("M_VISUAL_FILTER_UNSUPPORTED_CHART_TYPE");
			} else {
				this.errorMessage = ResourceModel.getText("M_VISUAL_FILTER_LINE_CHART_UNSUPPORTED_DIMENSION");
			}
		}
		this.chartMeasure = sMeasure;
		const chartPath = this.sMetaPath + "Visualizations/0/$AnnotationPath";
		const chartAnnotationContext = this.metaPath?.getModel().createBindingContext(chartPath, chartAnnotation as any);
		this._measureDimensionTitle = InteractiveChartHelper.getMeasureDimensionTitle(
			chartAnnotationContext,
			chartAnnotation,
			oProps.contextPath,
			this.bCustomAggregate,
			this.aggregateProperties
		);
		this._toolTip = InteractiveChartHelper.getToolTip(
			chartAnnotationContext,
			chartAnnotation,
			oProps.contextPath,
			this.sMetaPath,
			this.bCustomAggregate,
			this.aggregateProperties,
			this.renderLineChart
		);
		this._UoMVisibility = InteractiveChartHelper.getUoMVisiblity(chartAnnotation, this.showError);
		this._scaleUoMTitle = InteractiveChartHelper.getScaleUoMTitle(
			chartAnnotationContext,
			chartAnnotation,
			oProps.contextPath,
			this.sMetaPath,
			this.bCustomAggregate,
			this.aggregateProperties
		);
		this._filterCountBinding = InteractiveChartHelper.getfilterCountBinding(chartAnnotation);
	}

	getAggregateProperties(aAggregations: AggregatedPropertyType[], sMeasure?: string) {
		let oMatchedAggregate: AggregatedPropertyType | undefined;
		if (!aAggregations) {
			return;
		}
		aAggregations.some(function (oAggregate) {
			if (oAggregate.Name === sMeasure) {
				oMatchedAggregate = oAggregate;
				return true;
			}
		});
		return oMatchedAggregate;
	}

	getUoM(measures?: PropertyAnnotations_Measures, aggregatablePropertyMeasures?: PropertyAnnotations_Measures) {
		let vISOCurrency = measures?.ISOCurrency;
		let vUnit = measures?.Unit;
		if (!vISOCurrency && !vUnit && aggregatablePropertyMeasures) {
			vISOCurrency = aggregatablePropertyMeasures.ISOCurrency;
			vUnit = aggregatablePropertyMeasures.Unit;
		}
		return (vISOCurrency as PathAnnotationExpression<String>)?.path || (vUnit as PathAnnotationExpression<String>)?.path;
	}

	getHiddenMeasure(propertyHidden: Hidden, aggregatablePropertyHidden?: Hidden, bCustomAggregate?: boolean) {
		if (!bCustomAggregate && aggregatablePropertyHidden) {
			return aggregatablePropertyHidden.valueOf();
		} else {
			return propertyHidden?.valueOf();
		}
	}

	getRequired() {
		if (this.required) {
			return xml`<Label text="" width="0.5rem" required="true">
							<layoutData>
								<OverflowToolbarLayoutData priority="Never" />
							</layoutData>
						</Label>`;
		} else {
			return xml``;
		}
	}

	getUoMTitle(showErrorExpression: string) {
		if (this._UoMVisibility) {
			return xml`<Title
							id="${generate([this.id, "ScaleUoMTitle"])}"
							visible="{= !${showErrorExpression}}"
							text="${this._scaleUoMTitle}"
							titleStyle="H6"
							level="H3"
							width="4.15rem"
						/>`;
		} else {
			return xml``;
		}
	}

	getValueHelp(showErrorExpression: string) {
		if (this.showValueHelp) {
			return xml`<ToolbarSpacer />
						<Button
							id="${generate([this.id, "VisualFilterValueHelpButton"])}"
							type="Transparent"
							ariaHasPopup="Dialog"
							text="${this._filterCountBinding}"
							press="VisualFilterRuntime.fireValueHelp"
							enabled="{= !${showErrorExpression}}"
						>
							<layoutData>
								<OverflowToolbarLayoutData priority="Never" />
							</layoutData>
						</Button>`;
		} else {
			return xml``;
		}
	}

	getInteractiveChartFragment() {
		if (this.showError) {
			return xml`<core:Fragment fragmentName="sap.fe.macros.visualfilters.fragments.InteractiveChartWithError" type="XML" />`;
		} else if (this.chartType === "UI.ChartType/Bar") {
			return xml`<core:Fragment fragmentName="sap.fe.macros.visualfilters.fragments.InteractiveBarChart" type="XML" />`;
		} else {
			return xml`<core:Fragment fragmentName="sap.fe.macros.visualfilters.fragments.InteractiveLineChart" type="XML" />`;
		}
	}

	getTemplate() {
		const id = generate([this.sMetaPath]);
		const showErrorExpression = "${internal>" + id + "/showError}";
		const sMetaPath = this.metaPath?.getPath();

		return xml`
		<control:VisualFilter
		core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
		xmlns="sap.m"
		xmlns:control="sap.fe.core.controls.filterbar"
		xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		xmlns:core="sap.ui.core"
		id="${this.id}"
		height="13rem"
		width="20.5rem"
		class="sapUiSmallMarginBeginEnd"
		customData:infoPath="${generate([sMetaPath])}"
	>
		<VBox height="2rem" class="sapUiSmallMarginBottom">
			<OverflowToolbar style="Clear">
				${this.getRequired()}
				<Title
					id="${generate([this.id, "MeasureDimensionTitle"])}"
					text="${this._measureDimensionTitle}"
					tooltip="${this._toolTip}"
					titleStyle="H6"
					level="H3"
					class="sapUiTinyMarginEnd sapUiNoMarginBegin"
				/>
				${this.getUoMTitle(showErrorExpression)}
				${this.getValueHelp(showErrorExpression)}
			</OverflowToolbar>
		</VBox>
		<VBox height="100%" width="100%">
			${this.getInteractiveChartFragment()}
		</VBox>
	</control:VisualFilter>`;
	}
}
