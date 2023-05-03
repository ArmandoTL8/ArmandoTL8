import Log from "sap/base/Log";
import { aggregation, defineUI5Class, event, property } from "sap/fe/core/helpers/ClassSupport";
import macroLib from "sap/fe/macros/library";
import FlexBox from "sap/m/FlexBox";
import Label from "sap/m/Label";
import mobilelibrary from "sap/m/library";
import AreaMicroChart from "sap/suite/ui/microchart/AreaMicroChart";
import ColumnMicroChart from "sap/suite/ui/microchart/ColumnMicroChart";
import ComparisonMicroChart from "sap/suite/ui/microchart/ComparisonMicroChart";
import LineMicroChart from "sap/suite/ui/microchart/LineMicroChart";
import Control from "sap/ui/core/Control";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import type RenderManager from "sap/ui/core/RenderManager";
import type Context from "sap/ui/model/Context";
import ODataV4ListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import DateType from "sap/ui/model/type/Date";

const NavigationType = macroLib.NavigationType;
const ValueColor = mobilelibrary.ValueColor;
/**
 *  Container Control for Micro Chart and UoM.
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
@defineUI5Class("sap.fe.macros.microchart.MicroChartContainer")
class MicroChartContainer extends Control {
	@property({
		type: "boolean",
		defaultValue: false
	})
	showOnlyChart!: boolean;
	@property({
		type: "string",
		defaultValue: undefined
	})
	uomPath!: string;
	@property({
		type: "string[]",
		defaultValue: []
	})
	measures!: string[];
	@property({
		type: "string",
		defaultValue: undefined
	})
	dimension?: string;
	@property({
		type: "string[]",
		defaultValue: []
	})
	dataPointQualifiers!: string[];
	@property({
		type: "int",
		defaultValue: undefined
	})
	measurePrecision!: number;
	@property({
		type: "int",
		defaultValue: 1
	})
	measureScale!: number;
	@property({
		type: "int",
		defaultValue: undefined
	})
	dimensionPrecision?: number;
	@property({
		type: "string",
		defaultValue: ""
	})
	chartTitle!: string;
	@property({
		type: "string",
		defaultValue: ""
	})
	chartDescription!: string;
	@property({
		type: "sap.fe.macros.NavigationType",
		defaultValue: "None"
	})
	navigationType!: typeof NavigationType;
	@property({
		type: "string",
		defaultValue: ""
	})
	calendarPattern!: string;
	@event()
	onTitlePressed!: Function;

	@aggregation({
		type: "sap.ui.core.Control",
		multiple: false,
		isDefault: true
	})
	microChart!: Control;
	@aggregation({
		type: "sap.m.Label",
		multiple: false
	})
	_uomLabel!: Label;

	@aggregation({
		type: "sap.ui.core.Control",
		multiple: true
	})
	microChartTitle!: Control[];
	private _olistBinding?: ODataV4ListBinding;
	private _oDateType?: DateType;

	static render(oRm: RenderManager, oControl: MicroChartContainer) {
		oRm.openStart("div", oControl);
		oRm.openEnd();
		if (!oControl.showOnlyChart) {
			const oChartTitle = oControl.microChartTitle;
			if (oChartTitle) {
				oChartTitle.forEach(function (oSubChartTitle: any) {
					oRm.openStart("div");
					oRm.openEnd();
					oRm.renderControl(oSubChartTitle);
					oRm.close("div");
				});
			}
			oRm.openStart("div");
			oRm.openEnd();
			const oChartDescription = new Label({ text: oControl.chartDescription });
			oRm.renderControl(oChartDescription);
			oRm.close("div");
		}
		const oMicroChart = oControl.microChart;
		if (oMicroChart) {
			oMicroChart.addStyleClass("sapUiTinyMarginTopBottom");
			oRm.renderControl(oMicroChart);
			if (!oControl.showOnlyChart && oControl.uomPath) {
				const oSettings = oControl._checkIfChartRequiresRuntimeLabels() ? undefined : { text: { path: oControl.uomPath } },
					oLabel = new Label(oSettings),
					oFlexBox = new FlexBox({
						alignItems: "Start",
						justifyContent: "End",
						items: [oLabel]
					});
				oRm.renderControl(oFlexBox);
				oControl.setAggregation("_uomLabel", oLabel);
			}
		}
		oRm.close("div");
	}
	onBeforeRendering() {
		const oBinding = this._getListBindingForRuntimeLabels();
		if (oBinding) {
			oBinding.detachEvent("change", this._setRuntimeChartLabelsAndUnitOfMeasure, this);
			this._olistBinding = undefined;
		}
	}
	onAfterRendering() {
		const oBinding = this._getListBindingForRuntimeLabels();

		if (!this._checkIfChartRequiresRuntimeLabels()) {
			return;
		}
		if (oBinding) {
			(oBinding.attachEvent as any)("change", this._setRuntimeChartLabelsAndUnitOfMeasure, this);
			this._olistBinding = oBinding;
		}
	}
	setShowOnlyChart(sValue: any) {
		if (!sValue && this._olistBinding) {
			this._setChartLabels();
		}
		this.setProperty("showOnlyChart", sValue, false /*re-rendering*/);
	}
	_checkIfChartRequiresRuntimeLabels() {
		const oMicroChart = this.microChart;

		return Boolean(
			oMicroChart instanceof AreaMicroChart ||
				oMicroChart instanceof ColumnMicroChart ||
				oMicroChart instanceof LineMicroChart ||
				oMicroChart instanceof ComparisonMicroChart
		);
	}
	_checkForChartLabelAggregations() {
		const oMicroChart = this.microChart;
		return Boolean(
			(oMicroChart instanceof AreaMicroChart &&
				oMicroChart.getAggregation("firstYLabel") &&
				oMicroChart.getAggregation("lastYLabel") &&
				oMicroChart.getAggregation("firstXLabel") &&
				oMicroChart.getAggregation("lastXLabel")) ||
				(oMicroChart instanceof ColumnMicroChart &&
					oMicroChart.getAggregation("leftTopLabel") &&
					oMicroChart.getAggregation("rightTopLabel") &&
					oMicroChart.getAggregation("leftBottomLabel") &&
					oMicroChart.getAggregation("rightBottomLabel")) ||
				oMicroChart instanceof LineMicroChart
		);
	}
	_getListBindingForRuntimeLabels() {
		const oMicroChart = this.microChart;
		let oBinding;
		if (oMicroChart instanceof AreaMicroChart) {
			const oChart = oMicroChart.getChart();
			oBinding = oChart && oMicroChart.getChart().getBinding("points");
		} else if (oMicroChart instanceof ColumnMicroChart) {
			oBinding = oMicroChart.getBinding("columns");
		} else if (oMicroChart instanceof LineMicroChart) {
			const aLines = oMicroChart.getLines();
			oBinding = aLines && aLines.length && aLines[0].getBinding("points");
		} else if (oMicroChart instanceof ComparisonMicroChart) {
			oBinding = oMicroChart.getBinding("data");
		}
		return oBinding instanceof ODataV4ListBinding ? oBinding : false;
	}
	_setRuntimeChartLabelsAndUnitOfMeasure() {
		const oListBinding = this._olistBinding,
			aContexts = oListBinding?.getContexts(),
			aMeasures = this.measures || [],
			sDimension = this.dimension,
			sUnitOfMeasurePath = this.uomPath,
			oMicroChart = this.microChart,
			oUnitOfMeasureLabel = this._uomLabel;

		if (oUnitOfMeasureLabel && sUnitOfMeasurePath && aContexts && aContexts.length && !this.showOnlyChart) {
			oUnitOfMeasureLabel.setText(aContexts[0].getObject(sUnitOfMeasurePath));
		} else if (oUnitOfMeasureLabel) {
			oUnitOfMeasureLabel.setText("");
		}

		if (!this._checkForChartLabelAggregations()) {
			return;
		}

		if (!aContexts || !aContexts.length) {
			this._setChartLabels();
			return;
		}

		const oFirstContext = aContexts[0],
			oLastContext = aContexts[aContexts.length - 1],
			aLinesPomises: any[] = [],
			bLineChart = oMicroChart instanceof LineMicroChart,
			iCurrentMinX = oFirstContext.getObject(sDimension),
			iCurrentMaxX = oLastContext.getObject(sDimension);
		let iCurrentMinY,
			iCurrentMaxY,
			oMinX: any = { value: Infinity },
			oMaxX: any = { value: -Infinity },
			oMinY: any = { value: Infinity },
			oMaxY: any = { value: -Infinity };

		oMinX = iCurrentMinX == undefined ? oMinX : { context: oFirstContext, value: iCurrentMinX };
		oMaxX = iCurrentMaxX == undefined ? oMaxX : { context: oLastContext, value: iCurrentMaxX };

		aMeasures.forEach((sMeasure: any, i: any) => {
			iCurrentMinY = oFirstContext.getObject(sMeasure);
			iCurrentMaxY = oLastContext.getObject(sMeasure);
			oMaxY = iCurrentMaxY > oMaxY.value ? { context: oLastContext, value: iCurrentMaxY, index: bLineChart ? i : 0 } : oMaxY;
			oMinY = iCurrentMinY < oMinY.value ? { context: oFirstContext, value: iCurrentMinY, index: bLineChart ? i : 0 } : oMinY;
			if (bLineChart) {
				aLinesPomises.push(this._getCriticalityFromPoint({ context: oLastContext, value: iCurrentMaxY, index: i }));
			}
		});
		this._setChartLabels(oMinY.value, oMaxY.value, oMinX.value, oMaxX.value);
		if (bLineChart) {
			return Promise.all(aLinesPomises).then(function (aColors: any[]) {
				const aLines = oMicroChart.getLines();
				aLines.forEach(function (oLine: any, i: any) {
					oLine.setColor(aColors[i]);
				});
			});
		} else {
			return this._setChartLabelsColors(oMaxY, oMinY);
		}
	}
	_setChartLabelsColors(oMaxY: object, oMinY: object) {
		const oMicroChart = this.microChart;

		return Promise.all([this._getCriticalityFromPoint(oMinY), this._getCriticalityFromPoint(oMaxY)]).then(function (
			aCriticality: [any, any]
		) {
			if (oMicroChart instanceof AreaMicroChart) {
				(oMicroChart.getAggregation("firstYLabel") as any).setProperty("color", aCriticality[0], true);
				(oMicroChart.getAggregation("lastYLabel") as any).setProperty("color", aCriticality[1], true);
			} else if (oMicroChart instanceof ColumnMicroChart) {
				(oMicroChart.getAggregation("leftTopLabel") as any).setProperty("color", aCriticality[0], true);
				(oMicroChart.getAggregation("rightTopLabel") as any).setProperty("color", aCriticality[1], true);
			}
		});
	}
	_setChartLabels(leftTop?: object, rightTop?: object, leftBottom?: object, rightBottom?: object) {
		const oMicroChart = this.microChart;

		leftTop = this._formatDateAndNumberValue(leftTop, this.measurePrecision, this.measureScale);
		rightTop = this._formatDateAndNumberValue(rightTop, this.measurePrecision, this.measureScale);
		leftBottom = this._formatDateAndNumberValue(leftBottom, this.dimensionPrecision, undefined, this.calendarPattern);
		rightBottom = this._formatDateAndNumberValue(rightBottom, this.dimensionPrecision, undefined, this.calendarPattern);

		if (oMicroChart instanceof AreaMicroChart) {
			(oMicroChart.getAggregation("firstYLabel") as any).setProperty("label", leftTop, false);
			(oMicroChart.getAggregation("lastYLabel") as any).setProperty("label", rightTop, false);
			(oMicroChart.getAggregation("firstXLabel") as any).setProperty("label", leftBottom, false);
			(oMicroChart.getAggregation("lastXLabel") as any).setProperty("label", rightBottom, false);
		} else if (oMicroChart instanceof ColumnMicroChart) {
			(oMicroChart.getAggregation("leftTopLabel") as any).setProperty("label", leftTop, false);
			(oMicroChart.getAggregation("rightTopLabel") as any).setProperty("label", rightTop, false);
			(oMicroChart.getAggregation("leftBottomLabel") as any).setProperty("label", leftBottom, false);
			(oMicroChart.getAggregation("rightBottomLabel") as any).setProperty("label", rightBottom, false);
		} else if (oMicroChart instanceof LineMicroChart) {
			oMicroChart.setProperty("leftTopLabel", leftTop, false);
			oMicroChart.setProperty("rightTopLabel", rightTop, false);
			oMicroChart.setProperty("leftBottomLabel", leftBottom, false);
			oMicroChart.setProperty("rightBottomLabel", rightBottom, false);
		}
	}
	_getCriticalityFromPoint(oPoint: any) {
		let oReturn = Promise.resolve(ValueColor.Neutral);
		const oMetaModel = this.getModel() && (this.getModel().getMetaModel() as ODataMetaModel),
			aDataPointQualifiers = this.dataPointQualifiers,
			sMetaPath =
				oMetaModel instanceof ODataMetaModel &&
				oPoint &&
				oPoint.context &&
				oPoint.context.getPath() &&
				oMetaModel.getMetaPath(oPoint.context.getPath());

		if (typeof sMetaPath === "string") {
			oReturn = oMetaModel
				.requestObject(
					`${sMetaPath}/@com.sap.vocabularies.UI.v1.DataPoint${
						aDataPointQualifiers[oPoint.index] ? `#${aDataPointQualifiers[oPoint.index]}` : ""
					}`
				)
				.then((oDataPoint: any) => {
					let sCriticality = ValueColor.Neutral;
					const oContext = oPoint.context;
					if (oDataPoint.Criticality) {
						sCriticality = this._criticality(oDataPoint.Criticality, oContext);
					} else if (oDataPoint.CriticalityCalculation) {
						const oCriticalityCalculation = oDataPoint.CriticalityCalculation,
							oCC: any = {},
							fnGetValue = function (oProperty: any) {
								let sReturn;
								if (oProperty.$Path) {
									sReturn = oContext.getObject(oProperty.$Path);
								} else if (oProperty.hasOwnProperty("$Decimal")) {
									sReturn = oProperty.$Decimal;
								}
								return sReturn;
							};
						oCC.sAcceptanceHigh = oCriticalityCalculation.AcceptanceRangeHighValue
							? fnGetValue(oCriticalityCalculation.AcceptanceRangeHighValue)
							: undefined;
						oCC.sAcceptanceLow = oCriticalityCalculation.AcceptanceRangeLowValue
							? fnGetValue(oCriticalityCalculation.AcceptanceRangeLowValue)
							: undefined;
						oCC.sDeviationHigh = oCriticalityCalculation.DeviationRangeHighValue
							? fnGetValue(oCriticalityCalculation.DeviationRangeHighValue)
							: undefined;
						oCC.sDeviationLow = oCriticalityCalculation.DeviationRangeLowValue
							? fnGetValue(oCriticalityCalculation.DeviationRangeLowValue)
							: undefined;
						oCC.sToleranceHigh = oCriticalityCalculation.ToleranceRangeHighValue
							? fnGetValue(oCriticalityCalculation.ToleranceRangeHighValue)
							: undefined;
						oCC.sToleranceLow = oCriticalityCalculation.ToleranceRangeLowValue
							? fnGetValue(oCriticalityCalculation.ToleranceRangeLowValue)
							: undefined;
						oCC.sImprovementDirection = oCriticalityCalculation.ImprovementDirection.$EnumMember;

						sCriticality = this._criticalityCalculation(
							oCC.sImprovementDirection,
							oPoint.value,
							oCC.sDeviationLow,
							oCC.sToleranceLow,
							oCC.sAcceptanceLow,
							oCC.sAcceptanceHigh,
							oCC.sToleranceHigh,
							oCC.sDeviationHigh
						);
					}
					return sCriticality;
				});
		}
		return oReturn;
	}
	_criticality(oCriticality: any, oContext: Context) {
		let iCriticality,
			sCriticality = ValueColor.Neutral;
		if (oCriticality.$Path) {
			const sCriticalityPath = oCriticality.$Path;
			iCriticality = oContext.getObject(sCriticalityPath);
			if (iCriticality === "Negative" || iCriticality === "1" || iCriticality === 1) {
				sCriticality = ValueColor.Error;
			} else if (iCriticality === "Critical" || iCriticality === "2" || iCriticality === 2) {
				sCriticality = ValueColor.Critical;
			} else if (iCriticality === "Positive" || iCriticality === "3" || iCriticality === 3) {
				sCriticality = ValueColor.Good;
			}
		} else if (oCriticality.$EnumMember) {
			iCriticality = oCriticality.$EnumMember;
			if (iCriticality.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Negative") > -1) {
				sCriticality = ValueColor.Error;
			} else if (iCriticality.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Positive") > -1) {
				sCriticality = ValueColor.Good;
			} else if (iCriticality.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Critical") > -1) {
				sCriticality = ValueColor.Critical;
			}
		} else {
			Log.warning("Case not supported, returning the default Value Neutral");
		}
		return sCriticality;
	}
	_criticalityCalculation(
		sImprovementDirection: string,
		sValue: string,
		sDeviationLow?: string | number,
		sToleranceLow?: string | number,
		sAcceptanceLow?: string | number,
		sAcceptanceHigh?: string | number,
		sToleranceHigh?: string | number,
		sDeviationHigh?: string | number
	) {
		let sCriticalityExpression = ValueColor.Neutral; // Default Criticality State

		// Dealing with Decimal and Path based bingdings
		sDeviationLow = sDeviationLow == undefined ? -Infinity : sDeviationLow;
		sToleranceLow = sToleranceLow == undefined ? sDeviationLow : sToleranceLow;
		sAcceptanceLow = sAcceptanceLow == undefined ? sToleranceLow : sAcceptanceLow;
		sDeviationHigh = sDeviationHigh == undefined ? Infinity : sDeviationHigh;
		sToleranceHigh = sToleranceHigh == undefined ? sDeviationHigh : sToleranceHigh;
		sAcceptanceHigh = sAcceptanceHigh == undefined ? sToleranceHigh : sAcceptanceHigh;

		// Creating runtime expression binding from criticality calculation for Criticality State
		if (sImprovementDirection.indexOf("Minimize") > -1) {
			if (sValue <= sAcceptanceHigh) {
				sCriticalityExpression = ValueColor.Good;
			} else if (sValue <= sToleranceHigh) {
				sCriticalityExpression = ValueColor.Neutral;
			} else if (sDeviationHigh && sValue <= sDeviationHigh) {
				sCriticalityExpression = ValueColor.Critical;
			} else {
				sCriticalityExpression = ValueColor.Error;
			}
		} else if (sImprovementDirection.indexOf("Maximize") > -1) {
			if (sValue >= sAcceptanceLow) {
				sCriticalityExpression = ValueColor.Good;
			} else if (sValue >= sToleranceLow) {
				sCriticalityExpression = ValueColor.Neutral;
			} else if (sDeviationHigh && sValue >= sDeviationLow) {
				sCriticalityExpression = ValueColor.Critical;
			} else {
				sCriticalityExpression = ValueColor.Error;
			}
		} else if (sImprovementDirection.indexOf("Target") > -1) {
			if (sValue <= sAcceptanceHigh && sValue >= sAcceptanceLow) {
				sCriticalityExpression = ValueColor.Good;
			} else if ((sValue >= sToleranceLow && sValue < sAcceptanceLow) || (sValue > sAcceptanceHigh && sValue <= sToleranceHigh)) {
				sCriticalityExpression = ValueColor.Neutral;
			} else if (
				(sDeviationLow && sValue >= sDeviationLow && sValue < sToleranceLow) ||
				(sValue > sToleranceHigh && sDeviationHigh && sValue <= sDeviationHigh)
			) {
				sCriticalityExpression = ValueColor.Critical;
			} else {
				sCriticalityExpression = ValueColor.Error;
			}
		} else {
			Log.warning("Case not supported, returning the default Value Neutral");
		}

		return sCriticalityExpression;
	}
	_formatDateAndNumberValue(value: any, iPrecision: any, iScale: any, sPattern?: any) {
		if (sPattern) {
			return this._getSemanticsValueFormatter(sPattern).formatValue(value, "string");
		} else if (!isNaN(value)) {
			return this._getLabelNumberFormatter(iPrecision, iScale).format(value);
		}

		return value;
	}
	_getSemanticsValueFormatter(sPattern: any) {
		if (!this._oDateType) {
			this._oDateType = new DateType({
				style: "short",
				source: {
					pattern: sPattern
				}
			} as any);
		}
		return this._oDateType;
	}
	_getLabelNumberFormatter(iPrecision: any, iScale: any) {
		return NumberFormat.getFloatInstance({
			style: "short",
			showScale: true,
			precision: typeof iPrecision === "number" ? iPrecision : (null as any),
			decimals: typeof iScale === "number" ? iScale : (null as any)
		});
	}
}

export default MicroChartContainer;
