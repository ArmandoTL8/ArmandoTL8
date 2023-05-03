import Log from "sap/base/Log";
import CommonHelper from "sap/fe/macros/CommonHelper";
import mobilelibrary from "sap/m/library";
import DateFormat from "sap/ui/core/format/DateFormat";

const ValueColor = mobilelibrary.ValueColor;
const calendarPatternMap: any = {
	yyyy: new RegExp("[1-9][0-9]{3,}|0[0-9]{3}"),
	Q: new RegExp("[1-4]"),
	MM: new RegExp("0[1-9]|1[0-2]"),
	ww: new RegExp("0[1-9]|[1-4][0-9]|5[0-3]"),
	yyyyMMdd: new RegExp("([1-9][0-9]{3,}|0[0-9]{3})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])"),
	yyyyMM: new RegExp("([1-9][0-9]{3,}|0[0-9]{3})(0[1-9]|1[0-2])")
};
/**
 * Helper class used by MDC_Controls to handle SAP Fiori elements for OData V4
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
const MicroChartHelper = {
	/**
	 * This function returns the Threshold Color for bullet micro chart.
	 *
	 * @param sValue Threshold value provided in the annotations
	 * @param iContext InterfaceContext with path to the threshold
	 * @returns The indicator for Threshold Color
	 */
	getThresholdColor: function (sValue: string, iContext: any) {
		const oContext = iContext.context;
		const sPath = oContext.getPath();
		let sThresholdColor = ValueColor.Neutral;

		if (sPath.indexOf("DeviationRange") > -1) {
			sThresholdColor = ValueColor.Error;
		} else if (sPath.indexOf("ToleranceRange") > -1) {
			sThresholdColor = ValueColor.Critical;
		}
		return sThresholdColor;
	},

	/**
	 * To fetch measures from DataPoints.
	 *
	 * @param oChartAnnotations Chart Annotations
	 * @param oEntityTypeAnnotations EntityType Annotations
	 * @param sChartType Chart Type used
	 * @returns Containing all measures.
	 * @private
	 */
	getMeasurePropertyPaths: function (oChartAnnotations: any, oEntityTypeAnnotations: any, sChartType: string) {
		const aPropertyPath: any[] = [];

		if (!oEntityTypeAnnotations) {
			Log.warning("FE:Macro:MicroChart : Couldn't find annotations for the DataPoint.");
			return undefined;
		}

		oChartAnnotations.Measures.forEach(function (sMeasure: any, iMeasure: any) {
			const iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(iMeasure, oChartAnnotations),
				oMeasureAttribute =
					iMeasureAttribute > -1 && oChartAnnotations.MeasureAttributes && oChartAnnotations.MeasureAttributes[iMeasureAttribute],
				oDataPoint =
					oMeasureAttribute && oEntityTypeAnnotations && oEntityTypeAnnotations[oMeasureAttribute.DataPoint.$AnnotationPath];
			if (oDataPoint && oDataPoint.Value && oDataPoint.Value.$Path) {
				aPropertyPath.push(oDataPoint.Value.$Path);
			} else {
				Log.warning(
					`FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute ${sChartType} MicroChart.`
				);
			}
		});

		return aPropertyPath.join(",");
	},

	/**
	 * This function returns the visible expression path.
	 *
	 * @param args
	 * @returns Expression Binding for the visible.
	 */
	getHiddenPathExpression: function (...args: any[]) {
		if (!args[0] && !args[1]) {
			return true;
		} else if (args[0] === true || args[1] === true) {
			return false;
		} else {
			const hiddenPaths: any[] = [];
			[].forEach.call(args, function (hiddenProperty: any) {
				if (hiddenProperty && hiddenProperty.$Path) {
					hiddenPaths.push("%{" + hiddenProperty.$Path + "}");
				}
			});
			return "{= " + hiddenPaths.join(" || ") + " === true ? false : true }";
		}
	},

	/**
	 * This function returns the true/false to display chart.
	 *
	 * @param chartType The chart type
	 * @param sValue Datapoint value of Value
	 * @param sMaxValue Datapoint value of MaximumValue
	 * @param sValueHidden Hidden path object/boolean value for the referrenced property of value
	 * @param sMaxValueHidden Hidden path object/boolean value for the referrenced property of MaxValue
	 * @returns `true` or `false` to hide/show chart
	 */
	isNotAlwaysHidden: function (
		chartType: string,
		sValue: object,
		sMaxValue: object | undefined,
		sValueHidden: boolean | any,
		sMaxValueHidden?: boolean | any
	) {
		if (sValueHidden === true) {
			this.logError(chartType, sValue);
		}
		if (sMaxValueHidden === true) {
			this.logError(chartType, sMaxValue);
		}
		if (sValueHidden === undefined && sMaxValueHidden === undefined) {
			return true;
		} else {
			return ((!sValueHidden || sValueHidden.$Path) && sValueHidden !== undefined) ||
				((!sMaxValueHidden || sMaxValueHidden.$Path) && sMaxValueHidden !== undefined)
				? true
				: false;
		}
	},

	/**
	 * This function is to log errors for missing datapoint properties.
	 *
	 * @param chartType The chart type.
	 * @param sValue Dynamic hidden property name.
	 */
	logError: function (chartType: string, sValue: any) {
		Log.error(`Measure Property ${sValue.$Path} is hidden for the ${chartType} Micro Chart`);
	},

	/**
	 * This function returns the formatted value with scale factor for the value displayed.
	 *
	 * @param sPath Propertypath for the value
	 * @param oProperty The Property for constraints
	 * @param iFractionDigits No. of fraction digits specified from annotations
	 * @returns Expression Binding for the value with scale.
	 */
	formatDecimal: function (sPath: string, oProperty: any, iFractionDigits: number) {
		const aConstraints = [],
			aFormatOptions = ["style: 'short'"];
		let sScale;
		if (typeof iFractionDigits === "number") {
			sScale = iFractionDigits;
		} else {
			sScale = (oProperty && oProperty.$Scale) || 1;
		}
		let sBinding;

		if (sPath) {
			if (oProperty.$Nullable != undefined) {
				aConstraints.push("nullable: " + oProperty.$Nullable);
			}
			if (oProperty.$Precision != undefined) {
				aFormatOptions.push("precision: " + (oProperty.$Precision ? oProperty.$Precision : "1"));
			}
			aConstraints.push("scale: " + (sScale === "variable" ? "'" + sScale + "'" : sScale));

			sBinding =
				"{ path: '" +
				sPath +
				"'" +
				", type: 'sap.ui.model.odata.type.Decimal', constraints: { " +
				aConstraints.join(",") +
				" }, formatOptions: { " +
				aFormatOptions.join(",") +
				" } }";
		}
		return sBinding;
	},

	/**
	 * To fetch select parameters from annotations that need to be added to the list binding.
	 *
	 * @param args The select parameter
	 * param {string} sGroupId groupId to be used(optional)
	 * param {string} sUoMPath unit of measure path
	 * param {string} oCriticality criticality for the chart
	 * param {object} oCC criticality calculation object conatining the paths.
	 * @returns String containing all the propertypaths needed to be added to the $select query of the listbinding.
	 * @private
	 */
	getSelectParameters: function (...args: any[]) {
		const aPropertyPath = [],
			oCC = args[1],
			aParameters = [];

		if (args[0]) {
			aParameters.push("$$groupId : '" + args[0] + "'");
		}
		if (args[2]) {
			aPropertyPath.push(args[2]);
		} else if (oCC) {
			for (const k in oCC) {
				if (!oCC[k].$EnumMember && oCC[k].$Path) {
					aPropertyPath.push(oCC[k].$Path);
				}
			}
		}

		for (let i = 3; i < args.length; i++) {
			if (args[i]) {
				aPropertyPath.push(args[i]);
			}
		}

		if (aPropertyPath.length) {
			aParameters.push("$select : '" + aPropertyPath.join(",") + "'");
		}

		return aParameters.join(",");
	},

	/**
	 * To fetch DataPoint Qualifiers of measures.
	 *
	 * @param oChartAnnotations Chart Annotations
	 * @param oEntityTypeAnnotations EntityType Annotations
	 * @param sChartType Chart Type used
	 * @returns Containing all Datapoint Qualifiers.
	 * @private
	 */
	getDataPointQualifiersForMeasures: function (oChartAnnotations: any, oEntityTypeAnnotations: any, sChartType: string) {
		const aQualifers: any[] = [],
			aMeasureAttributes = oChartAnnotations.MeasureAttributes,
			fnAddDataPointQualifier = function (oMeasure: any) {
				const sMeasure = oMeasure.$PropertyPath;
				let sQualifer;
				aMeasureAttributes.forEach(function (oMeasureAttribute: any) {
					if (
						oEntityTypeAnnotations &&
						(oMeasureAttribute && oMeasureAttribute.Measure && oMeasureAttribute.Measure.$PropertyPath) === sMeasure &&
						oMeasureAttribute.DataPoint &&
						oMeasureAttribute.DataPoint.$AnnotationPath
					) {
						const sAnnotationPath = oMeasureAttribute.DataPoint.$AnnotationPath;
						if (oEntityTypeAnnotations[sAnnotationPath]) {
							sQualifer = sAnnotationPath.indexOf("#") ? sAnnotationPath.split("#")[1] : "";
							aQualifers.push(sQualifer);
						}
					}
				});
				if (sQualifer === undefined) {
					Log.warning(
						`FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute for ${sChartType} MicroChart.`
					);
				}
			};

		if (!oEntityTypeAnnotations) {
			Log.warning(`FE:Macro:MicroChart : Couldn't find annotations for the DataPoint ${sChartType} MicroChart.`);
		}
		oChartAnnotations.Measures.forEach(fnAddDataPointQualifier);
		return aQualifers.join(",");
	},

	/**
	 * This function is to log warnings for missing datapoint properties.
	 *
	 * @param sChart The Chart type.
	 * @param oError Object with properties from DataPoint.
	 */
	logWarning: function (sChart: string, oError: any) {
		for (const sKey in oError) {
			const sValue = oError[sKey];
			if (!sValue) {
				Log.warning(`${sKey} parameter is missing for the ${sChart} Micro Chart`);
			}
		}
	},

	/**
	 * This function is used to get DisplayValue for comparison micro chart data aggregation.
	 *
	 * @param oDataPoint Data point object.
	 * @param oPathText Object after evaluating @com.sap.vocabularies.Common.v1.Text annotation
	 * @param oValueTextPath Evaluation of @com.sap.vocabularies.Common.v1.Text/$Path/$ value of the annotation
	 * @param oValueDataPointPath DataPoint>Value/$Path/$ value after evaluating annotation
	 * @returns Expression binding for Display Value for comparison micro chart's aggregation data.
	 */
	getDisplayValueForMicroChart: function (oDataPoint: any, oPathText: any, oValueTextPath: object, oValueDataPointPath: object) {
		const sValueFormat = oDataPoint.ValueFormat && oDataPoint.ValueFormat.NumberOfFractionalDigits;
		let sResult;
		if (oPathText) {
			sResult = MicroChartHelper.formatDecimal(oPathText["$Path"], oValueTextPath, sValueFormat);
		} else {
			sResult = MicroChartHelper.formatDecimal(oDataPoint.Value["$Path"], oValueDataPointPath, sValueFormat);
		}
		return sResult;
	},
	/**
	 * This function is used to check whether micro chart is enabled or not by checking properties, chart annotations, hidden properties.
	 *
	 * @param sChartType MicroChart Type eg:- Bullet.
	 * @param oDataPoint Data point object.
	 * @param oDataPointValue Object with $Path annotation to get hidden value path
	 * @param oChartAnnotations ChartAnnotation object
	 * @param oDatapointMaxValue Object with $Path annotation to get hidden max value path
	 * @returns `true` if the chart has all values and properties and also it is not always hidden sFinalDataPointValue && bMicrochartVisible.
	 */
	shouldMicroChartRender: function (
		sChartType: string,
		oDataPoint: any,
		oDataPointValue: any,
		oChartAnnotations: any,
		oDatapointMaxValue: any
	) {
		const aChartTypes = ["Area", "Column", "Comparison"],
			sDataPointValue = oDataPoint && oDataPoint.Value,
			sHiddenPath = oDataPointValue && oDataPointValue["com.sap.vocabularies.UI.v1.Hidden"],
			sChartAnnotationDimension = oChartAnnotations && oChartAnnotations.Dimensions && oChartAnnotations.Dimensions[0],
			oFinalDataPointValue = aChartTypes.indexOf(sChartType) > -1 ? sDataPointValue && sChartAnnotationDimension : sDataPointValue; // only for three charts in array
		if (sChartType === "Harvey") {
			const oDataPointMaximumValue = oDataPoint && oDataPoint.MaximumValue,
				sMaxValueHiddenPath = oDatapointMaxValue && oDatapointMaxValue["com.sap.vocabularies.UI.v1.Hidden"];
			return (
				sDataPointValue &&
				oDataPointMaximumValue &&
				MicroChartHelper.isNotAlwaysHidden("Bullet", sDataPointValue, oDataPointMaximumValue, sHiddenPath, sMaxValueHiddenPath)
			);
		}
		return oFinalDataPointValue && MicroChartHelper.isNotAlwaysHidden(sChartType, sDataPointValue, undefined, sHiddenPath);
	},
	/**
	 * This function is used to get dataPointQualifiers for Column, Comparison and StackedBar micro charts.
	 *
	 * @param sUiName
	 * @returns Result string or undefined.
	 */
	getdataPointQualifiersForMicroChart: function (sUiName: string) {
		if (sUiName.indexOf("com.sap.vocabularies.UI.v1.DataPoint") === -1) {
			return undefined;
		}
		if (sUiName.indexOf("#") > -1) {
			return sUiName.split("#")[1];
		}
		return "";
	},
	/**
	 * This function is used to get colorPalette for comparison and HarveyBall Microcharts.
	 *
	 * @param oDataPoint Data point object.
	 * @returns Result string for colorPalette or undefined.
	 */
	getcolorPaletteForMicroChart: function (oDataPoint: any) {
		return oDataPoint.Criticality
			? undefined
			: "sapUiChartPaletteQualitativeHue1, sapUiChartPaletteQualitativeHue2, sapUiChartPaletteQualitativeHue3,          sapUiChartPaletteQualitativeHue4, sapUiChartPaletteQualitativeHue5, sapUiChartPaletteQualitativeHue6, sapUiChartPaletteQualitativeHue7,          sapUiChartPaletteQualitativeHue8, sapUiChartPaletteQualitativeHue9, sapUiChartPaletteQualitativeHue10, sapUiChartPaletteQualitativeHue11";
	},
	/**
	 * This function is used to get MeasureScale for Area, Column and Line micro charts.
	 *
	 * @param oDataPoint Data point object.
	 * @returns Datapoint valueformat or datapoint scale or 1.
	 */
	getMeasureScaleForMicroChart: function (oDataPoint: any) {
		if (oDataPoint.ValueFormat && oDataPoint.ValueFormat.NumberOfFractionalDigits) {
			return oDataPoint.ValueFormat.NumberOfFractionalDigits;
		}
		if (oDataPoint.Value && oDataPoint.Value["$Path"] && oDataPoint.Value["$Path"]["$Scale"]) {
			return oDataPoint.Value["$Path"]["$Scale"];
		}
		return 1;
	},
	/**
	 * This function is to return the binding expression of microchart.
	 *
	 * @param sChartType The type of micro chart (Bullet, Radial etc.)
	 * @param oMeasure Measure value for micro chart.
	 * @param oThis `this`/current model for micro chart.
	 * @param oCollection Collection object.
	 * @param sUiName The @sapui.name in collection model is not accessible here from model hence need to pass it.
	 * @param oDataPoint Data point object used in case of Harvey Ball micro chart
	 * @returns The binding expression for micro chart.
	 * @private
	 */
	getBindingExpressionForMicrochart: function (
		sChartType: string,
		oMeasure: any,
		oThis: any,
		oCollection: any,
		sUiName: string,
		oDataPoint: any
	) {
		const bCondition = oCollection["$isCollection"] || oCollection["$kind"] === "EntitySet";
		const sPath = bCondition ? "" : sUiName;
		let sCurrencyOrUnit = MicroChartHelper.getUOMPathForMicrochart(oMeasure);
		let sDataPointCriticallity = "";
		switch (sChartType) {
			case "Radial":
				sCurrencyOrUnit = "";
				break;
			case "Harvey":
				sDataPointCriticallity = oDataPoint.Criticality ? oDataPoint.Criticality["$Path"] : "";
				break;
		}
		const sFunctionValue = MicroChartHelper.getSelectParameters(oThis.batchGroupId, "", sDataPointCriticallity, sCurrencyOrUnit),
			sBinding = `{ path: '${sPath}'` + `, parameters : {${sFunctionValue}} }`;
		return sBinding;
	},
	/**
	 * This function is to return the UOMPath expression of the micro chart.
	 *
	 * @param bShowOnlyChart Whether only chart should be rendered or not.
	 * @param oMeasure Measures for the micro chart.
	 * @returns UOMPath String for the micro chart.
	 * @private
	 */
	getUOMPathForMicrochart: function (bShowOnlyChart: boolean, oMeasure?: any) {
		let bResult;
		if (oMeasure && !bShowOnlyChart) {
			bResult =
				(oMeasure["@Org.OData.Measures.V1.ISOCurrency"] && oMeasure["@Org.OData.Measures.V1.ISOCurrency"].$Path) ||
				(oMeasure["@Org.OData.Measures.V1.Unit"] && oMeasure["@Org.OData.Measures.V1.Unit"].$Path);
		}
		return bResult ? bResult : undefined;
	},

	/**
	 * This function is to return the aggregation binding expression of micro chart.
	 *
	 * @param sAggregationType Aggregation type of chart (eg:- Point for AreaMicrochart)
	 * @param oCollection Collection object.
	 * @param oDataPoint Data point info for micro chart.
	 * @param sUiName The @sapui.name in collection model is not accessible here from model hence need to pass it.
	 * @param oDimension Micro chart Dimensions.
	 * @param oMeasure Measure value for micro chart.
	 * @param sMeasureOrDimensionBar The measure or dimension passed specifically in case of bar chart
	 * @returns Aggregation binding expression for micro chart.
	 * @private
	 */
	getAggregationForMicrochart: function (
		sAggregationType: string,
		oCollection: any,
		oDataPoint: any,
		sUiName: string,
		oDimension: any,
		oMeasure: any,
		sMeasureOrDimensionBar: string
	) {
		let sPath = oCollection["$kind"] === "EntitySet" ? "/" : "";
		sPath = sPath + sUiName;
		const sGroupId = "";
		let sDataPointCriticallityCalc = "";
		let sDataPointCriticallity = oDataPoint.Criticality ? oDataPoint.Criticality["$Path"] : "";
		const sCurrencyOrUnit = MicroChartHelper.getUOMPathForMicrochart(false, oMeasure);
		let sTargetValuePath = "";
		let sDimensionPropertyPath = "";
		if (oDimension && oDimension.$PropertyPath && oDimension.$PropertyPath["@com.sap.vocabularies.Common.v1.Text"]) {
			sDimensionPropertyPath = oDimension.$PropertyPath["@com.sap.vocabularies.Common.v1.Text"].$Path;
		} else {
			sDimensionPropertyPath = oDimension.$PropertyPath;
		}
		switch (sAggregationType) {
			case "Points":
				sDataPointCriticallityCalc = oDataPoint && oDataPoint.CriticalityCalculation;
				sTargetValuePath = oDataPoint && oDataPoint.TargetValue && oDataPoint.TargetValue["$Path"];
				sDataPointCriticallity = "";
				break;
			case "Columns":
				sDataPointCriticallityCalc = oDataPoint && oDataPoint.CriticalityCalculation;
				break;
			case "LinePoints":
				sDataPointCriticallity = "";
				break;
			case "Bars":
				sDimensionPropertyPath = "";
				break;
		}
		const sFunctionValue = MicroChartHelper.getSelectParameters(
				sGroupId,
				sDataPointCriticallityCalc,
				sDataPointCriticallity,
				sCurrencyOrUnit,
				sTargetValuePath,
				sDimensionPropertyPath,
				sMeasureOrDimensionBar
			),
			sAggregationExpression = `{path:'${sPath}'` + `, parameters : {${sFunctionValue}} }`;
		return sAggregationExpression;
	},
	getCurrencyOrUnit: function (oMeasure: any) {
		if (oMeasure["@Org.OData.Measures.V1.ISOCurrency"]) {
			return oMeasure["@Org.OData.Measures.V1.ISOCurrency"].$Path || oMeasure["@Org.OData.Measures.V1.ISOCurrency"];
		} else if (oMeasure["@Org.OData.Measures.V1.Unit"]) {
			return oMeasure["@Org.OData.Measures.V1.Unit"].$Path || oMeasure["@Org.OData.Measures.V1.Unit"];
		} else {
			return "";
		}
	},

	getCalendarPattern: function (oAnnotations: any) {
		return (
			(oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarYear"] && "yyyy") ||
			(oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarQuarter"] && "Q") ||
			(oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarMonth"] && "MM") ||
			(oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarWeek"] && "ww") ||
			(oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarDate"] && "yyyyMMdd") ||
			(oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarYearMonth"] && "yyyyMM")
		);
	},

	formatDimension: function (sDate: any, sPattern: any, sPropertyPath: any) {
		const fValue = DateFormat.getDateInstance({ pattern: sPattern }).parse(sDate, false, true);
		if (fValue instanceof Date) {
			return parseFloat(fValue.getTime() as any);
		} else {
			Log.warning("Date value could not be determined for " + sPropertyPath);
		}
		return 0;
	},

	formatDateDimension: function (sDate: any) {
		return MicroChartHelper.formatDimension(sDate, "yyyy-MM-dd", "");
	},

	formatStringDimension: function (sValue: any, sPattern: any, sPropertyPath: any) {
		const sMatchedValue = sValue && sValue.toString().match(calendarPatternMap[sPattern]);
		if (sMatchedValue && sMatchedValue.length) {
			return MicroChartHelper.formatDimension(sMatchedValue[0], sPattern, sPropertyPath);
		} else {
			Log.warning("Pattern not supported for " + sPropertyPath);
		}
		return 0;
	},

	getX: function (sPropertyPath: any, sType: any, oAnnotations: any) {
		if (sType === "Edm.Date") {
			//TODO: Check why formatter is not getting called
			return (
				"{parts: [{path: '" +
				sPropertyPath +
				"', type: 'sap.ui.model.odata.type.String'}, {value: '" +
				sPropertyPath +
				"'}], formatter: 'MICROCHARTR.formatStringDimension'}"
			);
		} else if (sType === "Edm.String") {
			const sPattern = oAnnotations && MicroChartHelper.getCalendarPattern(oAnnotations);
			if (sPattern) {
				return (
					"{parts: [{path: '" +
					sPropertyPath +
					"', type: 'sap.ui.model.odata.type.String'}, {value: '" +
					sPattern +
					"'}, {value: '" +
					sPropertyPath +
					"'}], formatter: 'MICROCHARTR.formatStringDimension'}"
				);
			}
		}
	}
};

export default MicroChartHelper;
