import JSTokenizer from "sap/base/util/JSTokenizer";
import CommonUtils from "sap/fe/core/CommonUtils";
import VisualFilterUtils from "sap/fe/core/controls/filterbar/utils/VisualFilterUtils";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { buildExpressionForCriticalityColorMicroChart } from "sap/fe/core/templating/CriticalityFormatters";
import { getFiltersConditionsFromSelectionVariant } from "sap/fe/core/templating/FilterHelper";
import TypeUtil from "sap/fe/core/type/TypeUtil";
import CommonHelper from "sap/fe/macros/CommonHelper";
import FilterFieldHelper from "sap/fe/macros/filter/FilterFieldHelper";
import ResourceModel from "sap/fe/macros/ResourceModel";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import ConditionConverter from "sap/ui/mdc/condition/ConditionConverter";
import ODataModelAnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import ODataUtils from "sap/ui/model/odata/v4/ODataUtils";

const InteractiveChartHelper = {
	getChartDisplayedValue: function (value: any, oValueFormat: any, sMetaPath: any) {
		//var sType = "" + value + "@odata.type";
		const sInfoPath = generate([sMetaPath]);
		return (
			"{parts:[{path:'" +
			value +
			"',type:'sap.ui.model.odata.type.Decimal', constraints:{'nullable':false}}" +
			(oValueFormat && oValueFormat.ScaleFactor
				? ",{value:'" + oValueFormat.ScaleFactor.$Decimal + "'}"
				: ",{path:'internal>scalefactorNumber/" + sInfoPath + "'}") +
			(oValueFormat && oValueFormat.NumberOfFractionalDigits
				? ",{value:'" + oValueFormat.NumberOfFractionalDigits + "'}"
				: ",{value:'0'}") +
			",{path:'internal>currency/" +
			sInfoPath +
			"'}" +
			",{path:'" +
			value +
			"',type:'sap.ui.model.odata.type.String', constraints:{'nullable':false}}" +
			"], formatter:'VisualFilterRuntime.scaleVisualFilterValue'}"
		); //+ sType.split('#').length ? sType.split('#')[1] : 'Decimal' + "}";
	},
	getChartValue: function (oValue: any) {
		return "{path:'" + oValue + "',type:'sap.ui.model.odata.type.Decimal', constraints:{'nullable':false}}";
	},
	getChart: function (oMetaPath: any) {
		const oModel = oMetaPath.getModel();
		const oPresentationVariant = oModel.getObject(oMetaPath.getPath());
		const aVisualizations = oPresentationVariant.Visualizations;
		for (let i = 0; i < aVisualizations.length; i++) {
			if (aVisualizations[i].$AnnotationPath.indexOf("com.sap.vocabularies.UI.v1.Chart") > -1) {
				const sCollectionPath = ODataModelAnnotationHelper.getNavigationPath(oMetaPath.getPath());
				return oModel.createBindingContext(sCollectionPath + "/" + aVisualizations[i].$AnnotationPath);
			}
		}
		return undefined;
	},
	getChartLabel: function (...args: any[]) {
		return args[2];
	},
	/**
	 * Build the expression for measure path based on whether CustomAggregate/Dynamic/TransformationAggregate measures exists.
	 *
	 * @param oChartAnnotation Chart configurations.
	 * @param bCustomAggregate Indicator for existence for custom aggregates in chart measures.
	 * @returns Measure Path
	 */
	_getMeasurePath: function (oChartAnnotation: any, bCustomAggregate: Boolean): String {
		let sMeasurePath;
		if (bCustomAggregate) {
			sMeasurePath = "/Measures/0/$PropertyPath";
		}
		if (oChartAnnotation.DynamicMeasures && oChartAnnotation.DynamicMeasures.length > 0) {
			sMeasurePath = "/DynamicMeasures/0/$AnnotationPath/AggregatableProperty/$PropertyPath";
		} else if (!bCustomAggregate && oChartAnnotation.Measures && oChartAnnotation.Measures.length > 0) {
			sMeasurePath = "/Measures/0/$PropertyPath";
		}
		return sMeasurePath as String;
	},
	getAggregationBinding: function (
		oInterface: any,
		oChartAnnotations: any,
		oCollection: any,
		oTextAssociation: any,
		oDimensionType: any,
		aSortOrder: any,
		selectionVariantAnnotation: any,
		bCustomAggregate: any,
		oAggregation: any,
		bUoMHasCustomAggregate: any,
		aParameters: any,
		oFilterBarContext: any,
		bDraftSupported: any,
		sChartMeasure: any
	) {
		const sEntityType = oFilterBarContext ? oFilterBarContext.getPath() : "";
		const sDimension = oChartAnnotations.Dimensions[0].$PropertyPath;
		const aFilters: any[] = [];
		let sAggregationExpression, sUOMExpression, filterConditions, sBindingPath;
		let sCollectionName =
			oCollection.$kind == "NavigationProperty"
				? oInterface.getPath(1)
				: (oCollection.$kind == "EntitySet" ? "/" : "") + oInterface.getModel(1).getObject(`${oInterface.getPath(1)}@sapui.name`);
		const vUOM = InteractiveChartHelper.getUoM(oInterface, oChartAnnotations, oCollection, undefined, bCustomAggregate, oAggregation);
		const sEntitySetPath = oInterface.getInterface(1).getPath(),
			oMetaModel = oInterface.getInterface(1).getModel();
		if (bDraftSupported) {
			aFilters.push({
				operator: "EQ",
				value1: "true",
				value2: null,
				path: "IsActiveEntity",
				isParameter: true
			});
		}
		if (selectionVariantAnnotation && selectionVariantAnnotation.getObject()) {
			filterConditions = getFiltersConditionsFromSelectionVariant(
				sEntitySetPath,
				oMetaModel,
				selectionVariantAnnotation.getObject(),
				VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils)
			);
			for (const sPath in filterConditions) {
				const aConditions = filterConditions[sPath];
				aConditions.forEach(function (oCondition: any) {
					if (!oCondition.isParameter) {
						aFilters.push(oCondition);
					}
				});
			}
		}
		if (sEntityType !== `${sCollectionName}/` && aParameters && aParameters.length && filterConditions) {
			const aParams = [];
			const convertedFilterConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
			const parameterProperties = CommonUtils.getParameterInfo(oMetaModel, sCollectionName).parameterProperties;
			if (parameterProperties) {
				for (const i in aParameters) {
					const parameter = aParameters[i];
					const oProperty = parameterProperties[parameter];
					const sEntityPath = sEntitySetPath.split("/")[1];
					const oPropertyContext = oMetaModel.createBindingContext(`/${sEntityPath}/${parameter}`);
					const oFormatOptions = JSTokenizer.parseJS(
						FilterFieldHelper.formatOptions(oProperty, { context: oPropertyContext }) || "{}"
					);
					const oConstraints = JSTokenizer.parseJS(
						FilterFieldHelper.constraints(oProperty, { context: oPropertyContext }) || "{}"
					);
					const typeConfig = TypeUtil.getTypeConfig(oProperty.$Type, oFormatOptions, oConstraints);
					const oCondition = convertedFilterConditions[parameter];
					const oConditionInternal = oCondition ? oCondition[0] : undefined;
					if (oConditionInternal) {
						const mInternalParameterCondition = ConditionConverter.toType(oConditionInternal, typeConfig, TypeUtil as any);
						const sEdmType = oProperty.$Type;
						let sValue = encodeURIComponent(ODataUtils.formatLiteral(mInternalParameterCondition.values[0], sEdmType));
						sValue = (sValue as any).replaceAll("'", "\\'");
						aParams.push(`${parameter}=${sValue}`);
					}
				}
			}

			const sParameterEntitySet = sCollectionName.slice(0, sCollectionName.lastIndexOf("/"));
			const sTargetNavigation = sCollectionName.substring(sCollectionName.lastIndexOf("/") + 1);
			// create parameter context
			sBindingPath = `${sParameterEntitySet}(${aParams.toString()})/${sTargetNavigation}`;
			sCollectionName = sBindingPath;
		}
		if (bCustomAggregate) {
			//custom aggregate for a currency or unit of measure corresponding to this aggregatable property
			if (bUoMHasCustomAggregate) {
				sAggregationExpression = vUOM && vUOM.$Path ? `{ 'unit' : '${vUOM.$Path}' }` : "{}";
				sUOMExpression = "";
			} else {
				sAggregationExpression = "{}";
				sUOMExpression = vUOM && vUOM.$Path ? `, '${vUOM.$Path}' : {}` : "";
			}
		} else if (
			oAggregation &&
			oAggregation.AggregatableProperty &&
			oAggregation.AggregatableProperty.value &&
			oAggregation.AggregationMethod
		) {
			sAggregationExpression =
				"{ 'name' : '" + oAggregation.AggregatableProperty.value + "', 'with' : '" + oAggregation.AggregationMethod + "'}";
			sUOMExpression = vUOM && vUOM.$Path ? ", '" + vUOM.$Path + "' : {}" : "";
		}
		const sTextAssociationExpression = oTextAssociation ? "' : { 'additionally' : ['" + oTextAssociation.$Path + "'] }" : "' : { }";
		const sFilterExpression = JSON.stringify(aFilters);
		return (
			"{path: '" +
			sCollectionName +
			"', templateShareable: true, suspended : true, 'filters' : " +
			sFilterExpression +
			",'parameters' : {" +
			InteractiveChartHelper.getSortOrder(oInterface, oMetaModel, oChartAnnotations, oDimensionType, aSortOrder, sChartMeasure) +
			", '$$aggregation' : {'aggregate' : {'" +
			sChartMeasure +
			"' : " +
			sAggregationExpression +
			"},'group' : {'" +
			sDimension +
			sTextAssociationExpression +
			sUOMExpression +
			"} } }" +
			InteractiveChartHelper.getMaxItems(oChartAnnotations) +
			"}"
		);
	},
	getSortOrder: function (
		oInterface: any,
		oMetaModel: any,
		oChartAnnotations: any,
		sDimensionType: any,
		aSortOrder: any,
		sChartMeasure: any
	) {
		let sSortPropertyName;
		if (
			oChartAnnotations.ChartType.$EnumMember === "com.sap.vocabularies.UI.v1.ChartType/Donut" ||
			oChartAnnotations.ChartType.$EnumMember === "com.sap.vocabularies.UI.v1.ChartType/Bar"
		) {
			if (aSortOrder && aSortOrder.length) {
				if (aSortOrder[0].DynamicProperty) {
					sSortPropertyName = oMetaModel.getObject(
						oInterface.getPath(0).split("@")[0] + aSortOrder[0].DynamicProperty.$AnnotationPath
					).Name;
				} else {
					sSortPropertyName = aSortOrder[0].Property.$PropertyPath;
				}
				if (sSortPropertyName === sChartMeasure) {
					return "'$orderby' : '" + sChartMeasure + (aSortOrder[0].Descending ? " desc'" : "'");
				}
				return "'$orderby' : '" + sChartMeasure + " desc'";
			}
			return "'$orderby' : '" + sChartMeasure + " desc'";
		} else if (sDimensionType === "Edm.Date" || sDimensionType === "Edm.Time" || sDimensionType === "Edm.DateTimeOffset") {
			return "'$orderby' : '" + oChartAnnotations.Dimensions[0].$PropertyPath + "'";
		} else if (
			aSortOrder &&
			aSortOrder.length &&
			aSortOrder[0].Property.$PropertyPath === oChartAnnotations.Dimensions[0].$PropertyPath
		) {
			return "'$orderby' : '" + aSortOrder[0].Property.$PropertyPath + (aSortOrder[0].Descending ? " desc'" : "'");
		} else {
			return "'$orderby' : '" + oChartAnnotations.Dimensions[0].$PropertyPath + "'";
		}
	},
	getMaxItems: function (oChartAnnotations: any) {
		if (oChartAnnotations.ChartType.$EnumMember === "com.sap.vocabularies.UI.v1.ChartType/Bar") {
			return ",'startIndex' : 0,'length' : 3";
		} else if (oChartAnnotations.ChartType.$EnumMember === "com.sap.vocabularies.UI.v1.ChartType/Line") {
			return ",'startIndex' : 0,'length' : 6";
		} else {
			return "";
		}
	},
	getColorBinding: function (iContext: any, oDataPoint: any, oDimension: any) {
		const oModel = iContext.getModel(0);
		const oDimensionPath = iContext.getPath(1);
		const aValueCriticality = oModel.getObject(`${oDimensionPath}$PropertyPath@com.sap.vocabularies.UI.v1.ValueCriticality`);
		oDataPoint = oDataPoint.targetObject;
		if (oDataPoint.Criticality) {
			return buildExpressionForCriticalityColorMicroChart(oDataPoint);
		} else if (oDataPoint.CriticalityCalculation) {
			const oDirection =
				oDataPoint.CriticalityCalculation.ImprovementDirection &&
				oDataPoint.CriticalityCalculation.ImprovementDirection.$EnumMember;
			const oDataPointValue = ODataModelAnnotationHelper.value(oDataPoint.Value, { context: iContext.getInterface(0) });
			const oDeviationRangeLowValue = ODataModelAnnotationHelper.value(oDataPoint.CriticalityCalculation.DeviationRangeLowValue, {
				context: iContext.getInterface(0)
			});
			const oToleranceRangeLowValue = ODataModelAnnotationHelper.value(oDataPoint.CriticalityCalculation.ToleranceRangeLowValue, {
				context: iContext.getInterface(0)
			});
			const oAcceptanceRangeLowValue = ODataModelAnnotationHelper.value(oDataPoint.CriticalityCalculation.AcceptanceRangeLowValue, {
				context: iContext.getInterface(0)
			});
			const oAcceptanceRangeHighValue = ODataModelAnnotationHelper.value(oDataPoint.CriticalityCalculation.AcceptanceRangeHighValue, {
				context: iContext.getInterface(0)
			});
			const oToleranceRangeHighValue = ODataModelAnnotationHelper.value(oDataPoint.CriticalityCalculation.ToleranceRangeHighValue, {
				context: iContext.getInterface(0)
			});
			const oDeviationRangeHighValue = ODataModelAnnotationHelper.value(oDataPoint.CriticalityCalculation.DeviationRangeHighValue, {
				context: iContext.getInterface(0)
			});
			return CommonHelper.getCriticalityCalculationBinding(
				oDirection,
				oDataPointValue,
				oDeviationRangeLowValue,
				oToleranceRangeLowValue,
				oAcceptanceRangeLowValue,
				oAcceptanceRangeHighValue,
				oToleranceRangeHighValue,
				oDeviationRangeHighValue
			);
		} else if (aValueCriticality && aValueCriticality.length) {
			return CommonHelper.getValueCriticality(oDimension.$PropertyPath, aValueCriticality);
		} else {
			return undefined;
		}
	},
	getScaleUoMTitle: function (
		oInterface: any,
		oChartAnnotation: any,
		oCollection: any,
		sMetaPath: any,
		bCustomAggregate: any,
		oAggregation: any,
		sSeperator?: any,
		bIsToolTip?: any
	) {
		const oModel = oInterface.getModel(0);
		const sScaleFactor = oModel.getObject(
			`${oInterface.getPath(0)}/MeasureAttributes/0/DataPoint/$AnnotationPath/ValueFormat/ScaleFactor/$Decimal`
		);
		const sInfoPath = generate([sMetaPath]);
		const fixedInteger = NumberFormat.getIntegerInstance({
			style: "short",
			showScale: false,
			shortRefNumber: sScaleFactor
		});
		let sScale = (fixedInteger as any).getScale();
		let vUOM = InteractiveChartHelper.getUoM(oInterface, oChartAnnotation, oCollection, undefined, bCustomAggregate, oAggregation);
		vUOM = vUOM && (vUOM.$Path ? "${internal>uom/" + sInfoPath + "}" : "'" + vUOM + "'");
		sScale = sScale ? "'" + sScale + "'" : "${internal>scalefactor/" + sInfoPath + "}";
		if (!sSeperator) {
			sSeperator = "|";
		}
		sSeperator = vUOM ? "' " + sSeperator + " ' + " : "";
		const sExpression = sScale && vUOM ? sSeperator + sScale + " + ' ' + " + vUOM : sSeperator + (sScale || vUOM);
		return bIsToolTip ? sExpression : "{= " + sExpression + "}";
	},
	getMeasureDimensionTitle: function (
		oInterface: any,
		oChartAnnotation: any,
		oCollection: any,
		bCustomAggregate: any,
		oAggregation: any
	) {
		const oModel = oInterface.getModel(0);
		let sMeasureLabel;
		const sMeasurePathExpression = InteractiveChartHelper._getMeasurePath(oChartAnnotation, bCustomAggregate);
		const sMeasurePath = oModel.getObject(`${oInterface.getPath(0)}` + sMeasurePathExpression);
		const sDimensionPath = oModel.getObject(`${oInterface.getPath(0)}/Dimensions/0/$PropertyPath`);
		let sDimensionLabel = InteractiveChartHelper.getLabel(oModel, oInterface, "Dimensions");
		if (!bCustomAggregate && oAggregation) {
			// check if the label is part of aggregated properties (Transformation aggregates)
			sMeasureLabel = oAggregation.annotations && oAggregation.annotations.Common && oAggregation.annotations.Common.Label;
			if (sMeasureLabel === undefined) {
				sMeasureLabel = sMeasureLabel = InteractiveChartHelper.getLabel(oModel, oInterface, "Measures");
			}
		} else {
			sMeasureLabel = InteractiveChartHelper.getLabel(oModel, oInterface, "Measures");
		}
		if (sMeasureLabel === undefined) {
			sMeasureLabel = sMeasurePath;
		}
		if (sDimensionLabel === undefined) {
			sDimensionLabel = sDimensionPath;
		}
		return (
			ResourceModel &&
			ResourceModel.getText("M_INTERACTIVE_CHART_HELPER_VISUALFILTER_MEASURE_DIMENSION_TITLE", [sMeasureLabel, sDimensionLabel])
		);
	},
	getLabel: function (oModel: any, oInterface: any, sProperty: any) {
		return oModel.getObject(`${oInterface.getPath(0)}/${sProperty}/0/$PropertyPath@com.sap.vocabularies.Common.v1.Label`);
	},

	getToolTip: function (
		oInterface: any,
		oChartAnnotation: any,
		oCollection: any,
		sMetaPath: any,
		bCustomAggregate: any,
		oAggregation: any,
		bRenderLineChart: any
	) {
		const sChartType = oChartAnnotation && oChartAnnotation["ChartType"];

		let sMeasureDimensionToolTip = InteractiveChartHelper.getMeasureDimensionTitle(
			oInterface,
			oChartAnnotation,
			oCollection,
			bCustomAggregate,
			oAggregation
		);
		sMeasureDimensionToolTip = CommonHelper.escapeSingleQuotes(sMeasureDimensionToolTip);
		if (bRenderLineChart === "false" && sChartType === "UI.ChartType/Line") {
			return `{= '${sMeasureDimensionToolTip}'}`;
		}

		const sSeperator = ResourceModel.getText("M_INTERACTIVE_CHART_HELPER_VISUALFILTER_TOOLTIP_SEPERATOR");
		const sInfoPath = generate([sMetaPath]);
		const sScaleUOMTooltip = InteractiveChartHelper.getScaleUoMTitle(
			oInterface,
			oChartAnnotation,
			oCollection,
			sInfoPath,
			bCustomAggregate,
			oAggregation,
			sSeperator,
			true
		);
		return "{= '" + sMeasureDimensionToolTip + (sScaleUOMTooltip ? "' + " + sScaleUOMTooltip : "'") + "}";
	},
	getUoM: function (
		oInterface: any,
		oChartAnnotation: any,
		oCollection: any,
		isCustomData: any,
		bCustomAggregate: any,
		oAggregation: any
	) {
		const oModel = oInterface.getModel(0);
		const sMeasurePathExpression = InteractiveChartHelper._getMeasurePath(oChartAnnotation, bCustomAggregate);
		const vISOCurrency = oModel.getObject(`${oInterface.getPath(0)}` + sMeasurePathExpression + `@Org.OData.Measures.V1.ISOCurrency`);
		const vUnit = oModel.getObject(`${oInterface.getPath(0)}` + sMeasurePathExpression + `@Org.OData.Measures.V1.Unit`);
		const sMeasurePath = oModel.getObject(`${oInterface.getPath(0)}` + sMeasurePathExpression);
		let sAggregatablePropertyPath: any;
		if (!bCustomAggregate && oAggregation) {
			sAggregatablePropertyPath = oAggregation.AggregatableProperty && oAggregation.AggregatableProperty.value;
		} else {
			sAggregatablePropertyPath = sMeasurePath;
		}
		const _getUOM = function (vUOM: any, sAnnotation: any) {
			const sUOM = sAnnotation && sAnnotation.split("V1.")[1];
			const oUOM: any = {};
			if (vUOM) {
				// check if the UOM is part of Measure annotations(Custom aggregates)
				oUOM[sUOM] = vUOM;
				return isCustomData && vUOM.$Path ? JSON.stringify(oUOM) : vUOM;
			} else if (sAggregatablePropertyPath) {
				// check if the UOM is part of base property annotations(Transformation aggregates)
				vUOM = oInterface.getModel(1).getObject(`${oInterface.getPath(1)}/${sAggregatablePropertyPath}${sAnnotation}`);
				oUOM[sUOM] = vUOM;
				return vUOM && isCustomData && vUOM.$Path ? JSON.stringify(oUOM) : vUOM;
			}
		};
		return _getUOM(vISOCurrency, "@Org.OData.Measures.V1.ISOCurrency") || _getUOM(vUnit, "@Org.OData.Measures.V1.Unit");
	},
	getScaleFactor: function (oValueFormat: any) {
		if (oValueFormat && oValueFormat.ScaleFactor) {
			return oValueFormat.ScaleFactor.$Decimal;
		}
		return undefined;
	},
	getUoMVisiblity: function (oChartAnnotation: any, bShowError: any) {
		const sChartType = oChartAnnotation && oChartAnnotation["ChartType"];
		if (bShowError) {
			return false;
		} else if (!(sChartType === "UI.ChartType/Bar" || sChartType === "UI.ChartType/Line")) {
			return false;
		} else {
			return true;
		}
	},
	getInParameterFiltersBinding: function (aInParameters: any) {
		if (aInParameters.length > 0) {
			const aParts: any[] = [];
			let sPaths = "";
			aInParameters.forEach(function (oInParameter: any) {
				if (oInParameter.localDataProperty) {
					aParts.push(`{path:'$filters>/conditions/${oInParameter.localDataProperty}'}`);
				}
			});
			if (aParts.length > 0) {
				sPaths = aParts.join();
				return `{parts:[${sPaths}], formatter:'sap.fe.macros.visualfilters.VisualFilterRuntime.getFiltersFromConditions'}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},

	getfilterCountBinding: function (oChartAnnotation: any) {
		const sDimension = oChartAnnotation.Dimensions[0]?.$target?.name;
		return (
			"{path:'$filters>/conditions/" + sDimension + "', formatter:'sap.fe.macros.visualfilters.VisualFilterRuntime.getFilterCounts'}"
		);
	}
};
(InteractiveChartHelper.getColorBinding as any).requiresIContext = true;
(InteractiveChartHelper.getAggregationBinding as any).requiresIContext = true;
(InteractiveChartHelper.getUoM as any).requiresIContext = true;
(InteractiveChartHelper.getScaleUoMTitle as any).requiresIContext = true;
(InteractiveChartHelper.getToolTip as any).requiresIContext = true;
(InteractiveChartHelper.getMeasureDimensionTitle as any).requiresIContext = true;

export default InteractiveChartHelper;
