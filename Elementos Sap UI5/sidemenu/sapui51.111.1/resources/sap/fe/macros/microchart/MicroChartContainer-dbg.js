/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/library", "sap/m/FlexBox", "sap/m/Label", "sap/m/library", "sap/suite/ui/microchart/AreaMicroChart", "sap/suite/ui/microchart/ColumnMicroChart", "sap/suite/ui/microchart/ComparisonMicroChart", "sap/suite/ui/microchart/LineMicroChart", "sap/ui/core/Control", "sap/ui/core/format/NumberFormat", "sap/ui/model/odata/v4/ODataListBinding", "sap/ui/model/odata/v4/ODataMetaModel", "sap/ui/model/type/Date"], function (Log, ClassSupport, macroLib, FlexBox, Label, mobilelibrary, AreaMicroChart, ColumnMicroChart, ComparisonMicroChart, LineMicroChart, Control, NumberFormat, ODataV4ListBinding, ODataMetaModel, DateType) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const NavigationType = macroLib.NavigationType;
  const ValueColor = mobilelibrary.ValueColor;
  /**
   *  Container Control for Micro Chart and UoM.
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  let MicroChartContainer = (_dec = defineUI5Class("sap.fe.macros.microchart.MicroChartContainer"), _dec2 = property({
    type: "boolean",
    defaultValue: false
  }), _dec3 = property({
    type: "string",
    defaultValue: undefined
  }), _dec4 = property({
    type: "string[]",
    defaultValue: []
  }), _dec5 = property({
    type: "string",
    defaultValue: undefined
  }), _dec6 = property({
    type: "string[]",
    defaultValue: []
  }), _dec7 = property({
    type: "int",
    defaultValue: undefined
  }), _dec8 = property({
    type: "int",
    defaultValue: 1
  }), _dec9 = property({
    type: "int",
    defaultValue: undefined
  }), _dec10 = property({
    type: "string",
    defaultValue: ""
  }), _dec11 = property({
    type: "string",
    defaultValue: ""
  }), _dec12 = property({
    type: "sap.fe.macros.NavigationType",
    defaultValue: "None"
  }), _dec13 = property({
    type: "string",
    defaultValue: ""
  }), _dec14 = event(), _dec15 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec16 = aggregation({
    type: "sap.m.Label",
    multiple: false
  }), _dec17 = aggregation({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(MicroChartContainer, _Control);
    function MicroChartContainer() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "showOnlyChart", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "uomPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measures", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dimension", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataPointQualifiers", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measurePrecision", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measureScale", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dimensionPrecision", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartTitle", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartDescription", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationType", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "calendarPattern", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onTitlePressed", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "microChart", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_uomLabel", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "microChartTitle", _descriptor16, _assertThisInitialized(_this));
      return _this;
    }
    MicroChartContainer.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.openEnd();
      if (!oControl.showOnlyChart) {
        const oChartTitle = oControl.microChartTitle;
        if (oChartTitle) {
          oChartTitle.forEach(function (oSubChartTitle) {
            oRm.openStart("div");
            oRm.openEnd();
            oRm.renderControl(oSubChartTitle);
            oRm.close("div");
          });
        }
        oRm.openStart("div");
        oRm.openEnd();
        const oChartDescription = new Label({
          text: oControl.chartDescription
        });
        oRm.renderControl(oChartDescription);
        oRm.close("div");
      }
      const oMicroChart = oControl.microChart;
      if (oMicroChart) {
        oMicroChart.addStyleClass("sapUiTinyMarginTopBottom");
        oRm.renderControl(oMicroChart);
        if (!oControl.showOnlyChart && oControl.uomPath) {
          const oSettings = oControl._checkIfChartRequiresRuntimeLabels() ? undefined : {
              text: {
                path: oControl.uomPath
              }
            },
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
    };
    var _proto = MicroChartContainer.prototype;
    _proto.onBeforeRendering = function onBeforeRendering() {
      const oBinding = this._getListBindingForRuntimeLabels();
      if (oBinding) {
        oBinding.detachEvent("change", this._setRuntimeChartLabelsAndUnitOfMeasure, this);
        this._olistBinding = undefined;
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      const oBinding = this._getListBindingForRuntimeLabels();
      if (!this._checkIfChartRequiresRuntimeLabels()) {
        return;
      }
      if (oBinding) {
        oBinding.attachEvent("change", this._setRuntimeChartLabelsAndUnitOfMeasure, this);
        this._olistBinding = oBinding;
      }
    };
    _proto.setShowOnlyChart = function setShowOnlyChart(sValue) {
      if (!sValue && this._olistBinding) {
        this._setChartLabels();
      }
      this.setProperty("showOnlyChart", sValue, false /*re-rendering*/);
    };
    _proto._checkIfChartRequiresRuntimeLabels = function _checkIfChartRequiresRuntimeLabels() {
      const oMicroChart = this.microChart;
      return Boolean(oMicroChart instanceof AreaMicroChart || oMicroChart instanceof ColumnMicroChart || oMicroChart instanceof LineMicroChart || oMicroChart instanceof ComparisonMicroChart);
    };
    _proto._checkForChartLabelAggregations = function _checkForChartLabelAggregations() {
      const oMicroChart = this.microChart;
      return Boolean(oMicroChart instanceof AreaMicroChart && oMicroChart.getAggregation("firstYLabel") && oMicroChart.getAggregation("lastYLabel") && oMicroChart.getAggregation("firstXLabel") && oMicroChart.getAggregation("lastXLabel") || oMicroChart instanceof ColumnMicroChart && oMicroChart.getAggregation("leftTopLabel") && oMicroChart.getAggregation("rightTopLabel") && oMicroChart.getAggregation("leftBottomLabel") && oMicroChart.getAggregation("rightBottomLabel") || oMicroChart instanceof LineMicroChart);
    };
    _proto._getListBindingForRuntimeLabels = function _getListBindingForRuntimeLabels() {
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
    };
    _proto._setRuntimeChartLabelsAndUnitOfMeasure = function _setRuntimeChartLabelsAndUnitOfMeasure() {
      const oListBinding = this._olistBinding,
        aContexts = oListBinding === null || oListBinding === void 0 ? void 0 : oListBinding.getContexts(),
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
        aLinesPomises = [],
        bLineChart = oMicroChart instanceof LineMicroChart,
        iCurrentMinX = oFirstContext.getObject(sDimension),
        iCurrentMaxX = oLastContext.getObject(sDimension);
      let iCurrentMinY,
        iCurrentMaxY,
        oMinX = {
          value: Infinity
        },
        oMaxX = {
          value: -Infinity
        },
        oMinY = {
          value: Infinity
        },
        oMaxY = {
          value: -Infinity
        };
      oMinX = iCurrentMinX == undefined ? oMinX : {
        context: oFirstContext,
        value: iCurrentMinX
      };
      oMaxX = iCurrentMaxX == undefined ? oMaxX : {
        context: oLastContext,
        value: iCurrentMaxX
      };
      aMeasures.forEach((sMeasure, i) => {
        iCurrentMinY = oFirstContext.getObject(sMeasure);
        iCurrentMaxY = oLastContext.getObject(sMeasure);
        oMaxY = iCurrentMaxY > oMaxY.value ? {
          context: oLastContext,
          value: iCurrentMaxY,
          index: bLineChart ? i : 0
        } : oMaxY;
        oMinY = iCurrentMinY < oMinY.value ? {
          context: oFirstContext,
          value: iCurrentMinY,
          index: bLineChart ? i : 0
        } : oMinY;
        if (bLineChart) {
          aLinesPomises.push(this._getCriticalityFromPoint({
            context: oLastContext,
            value: iCurrentMaxY,
            index: i
          }));
        }
      });
      this._setChartLabels(oMinY.value, oMaxY.value, oMinX.value, oMaxX.value);
      if (bLineChart) {
        return Promise.all(aLinesPomises).then(function (aColors) {
          const aLines = oMicroChart.getLines();
          aLines.forEach(function (oLine, i) {
            oLine.setColor(aColors[i]);
          });
        });
      } else {
        return this._setChartLabelsColors(oMaxY, oMinY);
      }
    };
    _proto._setChartLabelsColors = function _setChartLabelsColors(oMaxY, oMinY) {
      const oMicroChart = this.microChart;
      return Promise.all([this._getCriticalityFromPoint(oMinY), this._getCriticalityFromPoint(oMaxY)]).then(function (aCriticality) {
        if (oMicroChart instanceof AreaMicroChart) {
          oMicroChart.getAggregation("firstYLabel").setProperty("color", aCriticality[0], true);
          oMicroChart.getAggregation("lastYLabel").setProperty("color", aCriticality[1], true);
        } else if (oMicroChart instanceof ColumnMicroChart) {
          oMicroChart.getAggregation("leftTopLabel").setProperty("color", aCriticality[0], true);
          oMicroChart.getAggregation("rightTopLabel").setProperty("color", aCriticality[1], true);
        }
      });
    };
    _proto._setChartLabels = function _setChartLabels(leftTop, rightTop, leftBottom, rightBottom) {
      const oMicroChart = this.microChart;
      leftTop = this._formatDateAndNumberValue(leftTop, this.measurePrecision, this.measureScale);
      rightTop = this._formatDateAndNumberValue(rightTop, this.measurePrecision, this.measureScale);
      leftBottom = this._formatDateAndNumberValue(leftBottom, this.dimensionPrecision, undefined, this.calendarPattern);
      rightBottom = this._formatDateAndNumberValue(rightBottom, this.dimensionPrecision, undefined, this.calendarPattern);
      if (oMicroChart instanceof AreaMicroChart) {
        oMicroChart.getAggregation("firstYLabel").setProperty("label", leftTop, false);
        oMicroChart.getAggregation("lastYLabel").setProperty("label", rightTop, false);
        oMicroChart.getAggregation("firstXLabel").setProperty("label", leftBottom, false);
        oMicroChart.getAggregation("lastXLabel").setProperty("label", rightBottom, false);
      } else if (oMicroChart instanceof ColumnMicroChart) {
        oMicroChart.getAggregation("leftTopLabel").setProperty("label", leftTop, false);
        oMicroChart.getAggregation("rightTopLabel").setProperty("label", rightTop, false);
        oMicroChart.getAggregation("leftBottomLabel").setProperty("label", leftBottom, false);
        oMicroChart.getAggregation("rightBottomLabel").setProperty("label", rightBottom, false);
      } else if (oMicroChart instanceof LineMicroChart) {
        oMicroChart.setProperty("leftTopLabel", leftTop, false);
        oMicroChart.setProperty("rightTopLabel", rightTop, false);
        oMicroChart.setProperty("leftBottomLabel", leftBottom, false);
        oMicroChart.setProperty("rightBottomLabel", rightBottom, false);
      }
    };
    _proto._getCriticalityFromPoint = function _getCriticalityFromPoint(oPoint) {
      let oReturn = Promise.resolve(ValueColor.Neutral);
      const oMetaModel = this.getModel() && this.getModel().getMetaModel(),
        aDataPointQualifiers = this.dataPointQualifiers,
        sMetaPath = oMetaModel instanceof ODataMetaModel && oPoint && oPoint.context && oPoint.context.getPath() && oMetaModel.getMetaPath(oPoint.context.getPath());
      if (typeof sMetaPath === "string") {
        oReturn = oMetaModel.requestObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.DataPoint${aDataPointQualifiers[oPoint.index] ? `#${aDataPointQualifiers[oPoint.index]}` : ""}`).then(oDataPoint => {
          let sCriticality = ValueColor.Neutral;
          const oContext = oPoint.context;
          if (oDataPoint.Criticality) {
            sCriticality = this._criticality(oDataPoint.Criticality, oContext);
          } else if (oDataPoint.CriticalityCalculation) {
            const oCriticalityCalculation = oDataPoint.CriticalityCalculation,
              oCC = {},
              fnGetValue = function (oProperty) {
                let sReturn;
                if (oProperty.$Path) {
                  sReturn = oContext.getObject(oProperty.$Path);
                } else if (oProperty.hasOwnProperty("$Decimal")) {
                  sReturn = oProperty.$Decimal;
                }
                return sReturn;
              };
            oCC.sAcceptanceHigh = oCriticalityCalculation.AcceptanceRangeHighValue ? fnGetValue(oCriticalityCalculation.AcceptanceRangeHighValue) : undefined;
            oCC.sAcceptanceLow = oCriticalityCalculation.AcceptanceRangeLowValue ? fnGetValue(oCriticalityCalculation.AcceptanceRangeLowValue) : undefined;
            oCC.sDeviationHigh = oCriticalityCalculation.DeviationRangeHighValue ? fnGetValue(oCriticalityCalculation.DeviationRangeHighValue) : undefined;
            oCC.sDeviationLow = oCriticalityCalculation.DeviationRangeLowValue ? fnGetValue(oCriticalityCalculation.DeviationRangeLowValue) : undefined;
            oCC.sToleranceHigh = oCriticalityCalculation.ToleranceRangeHighValue ? fnGetValue(oCriticalityCalculation.ToleranceRangeHighValue) : undefined;
            oCC.sToleranceLow = oCriticalityCalculation.ToleranceRangeLowValue ? fnGetValue(oCriticalityCalculation.ToleranceRangeLowValue) : undefined;
            oCC.sImprovementDirection = oCriticalityCalculation.ImprovementDirection.$EnumMember;
            sCriticality = this._criticalityCalculation(oCC.sImprovementDirection, oPoint.value, oCC.sDeviationLow, oCC.sToleranceLow, oCC.sAcceptanceLow, oCC.sAcceptanceHigh, oCC.sToleranceHigh, oCC.sDeviationHigh);
          }
          return sCriticality;
        });
      }
      return oReturn;
    };
    _proto._criticality = function _criticality(oCriticality, oContext) {
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
    };
    _proto._criticalityCalculation = function _criticalityCalculation(sImprovementDirection, sValue, sDeviationLow, sToleranceLow, sAcceptanceLow, sAcceptanceHigh, sToleranceHigh, sDeviationHigh) {
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
        } else if (sValue >= sToleranceLow && sValue < sAcceptanceLow || sValue > sAcceptanceHigh && sValue <= sToleranceHigh) {
          sCriticalityExpression = ValueColor.Neutral;
        } else if (sDeviationLow && sValue >= sDeviationLow && sValue < sToleranceLow || sValue > sToleranceHigh && sDeviationHigh && sValue <= sDeviationHigh) {
          sCriticalityExpression = ValueColor.Critical;
        } else {
          sCriticalityExpression = ValueColor.Error;
        }
      } else {
        Log.warning("Case not supported, returning the default Value Neutral");
      }
      return sCriticalityExpression;
    };
    _proto._formatDateAndNumberValue = function _formatDateAndNumberValue(value, iPrecision, iScale, sPattern) {
      if (sPattern) {
        return this._getSemanticsValueFormatter(sPattern).formatValue(value, "string");
      } else if (!isNaN(value)) {
        return this._getLabelNumberFormatter(iPrecision, iScale).format(value);
      }
      return value;
    };
    _proto._getSemanticsValueFormatter = function _getSemanticsValueFormatter(sPattern) {
      if (!this._oDateType) {
        this._oDateType = new DateType({
          style: "short",
          source: {
            pattern: sPattern
          }
        });
      }
      return this._oDateType;
    };
    _proto._getLabelNumberFormatter = function _getLabelNumberFormatter(iPrecision, iScale) {
      return NumberFormat.getFloatInstance({
        style: "short",
        showScale: true,
        precision: typeof iPrecision === "number" ? iPrecision : null,
        decimals: typeof iScale === "number" ? iScale : null
      });
    };
    return MicroChartContainer;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "showOnlyChart", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "uomPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "measures", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "dimension", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "dataPointQualifiers", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "measurePrecision", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "measureScale", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "dimensionPrecision", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "chartTitle", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "chartDescription", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "navigationType", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "calendarPattern", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "onTitlePressed", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "microChart", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "_uomLabel", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "microChartTitle", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MicroChartContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZpZ2F0aW9uVHlwZSIsIm1hY3JvTGliIiwiVmFsdWVDb2xvciIsIm1vYmlsZWxpYnJhcnkiLCJNaWNyb0NoYXJ0Q29udGFpbmVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJwcm9wZXJ0eSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJ1bmRlZmluZWQiLCJldmVudCIsImFnZ3JlZ2F0aW9uIiwibXVsdGlwbGUiLCJpc0RlZmF1bHQiLCJyZW5kZXIiLCJvUm0iLCJvQ29udHJvbCIsIm9wZW5TdGFydCIsIm9wZW5FbmQiLCJzaG93T25seUNoYXJ0Iiwib0NoYXJ0VGl0bGUiLCJtaWNyb0NoYXJ0VGl0bGUiLCJmb3JFYWNoIiwib1N1YkNoYXJ0VGl0bGUiLCJyZW5kZXJDb250cm9sIiwiY2xvc2UiLCJvQ2hhcnREZXNjcmlwdGlvbiIsIkxhYmVsIiwidGV4dCIsImNoYXJ0RGVzY3JpcHRpb24iLCJvTWljcm9DaGFydCIsIm1pY3JvQ2hhcnQiLCJhZGRTdHlsZUNsYXNzIiwidW9tUGF0aCIsIm9TZXR0aW5ncyIsIl9jaGVja0lmQ2hhcnRSZXF1aXJlc1J1bnRpbWVMYWJlbHMiLCJwYXRoIiwib0xhYmVsIiwib0ZsZXhCb3giLCJGbGV4Qm94IiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwiaXRlbXMiLCJzZXRBZ2dyZWdhdGlvbiIsIm9uQmVmb3JlUmVuZGVyaW5nIiwib0JpbmRpbmciLCJfZ2V0TGlzdEJpbmRpbmdGb3JSdW50aW1lTGFiZWxzIiwiZGV0YWNoRXZlbnQiLCJfc2V0UnVudGltZUNoYXJ0TGFiZWxzQW5kVW5pdE9mTWVhc3VyZSIsIl9vbGlzdEJpbmRpbmciLCJvbkFmdGVyUmVuZGVyaW5nIiwiYXR0YWNoRXZlbnQiLCJzZXRTaG93T25seUNoYXJ0Iiwic1ZhbHVlIiwiX3NldENoYXJ0TGFiZWxzIiwic2V0UHJvcGVydHkiLCJCb29sZWFuIiwiQXJlYU1pY3JvQ2hhcnQiLCJDb2x1bW5NaWNyb0NoYXJ0IiwiTGluZU1pY3JvQ2hhcnQiLCJDb21wYXJpc29uTWljcm9DaGFydCIsIl9jaGVja0ZvckNoYXJ0TGFiZWxBZ2dyZWdhdGlvbnMiLCJnZXRBZ2dyZWdhdGlvbiIsIm9DaGFydCIsImdldENoYXJ0IiwiZ2V0QmluZGluZyIsImFMaW5lcyIsImdldExpbmVzIiwibGVuZ3RoIiwiT0RhdGFWNExpc3RCaW5kaW5nIiwib0xpc3RCaW5kaW5nIiwiYUNvbnRleHRzIiwiZ2V0Q29udGV4dHMiLCJhTWVhc3VyZXMiLCJtZWFzdXJlcyIsInNEaW1lbnNpb24iLCJkaW1lbnNpb24iLCJzVW5pdE9mTWVhc3VyZVBhdGgiLCJvVW5pdE9mTWVhc3VyZUxhYmVsIiwiX3VvbUxhYmVsIiwic2V0VGV4dCIsImdldE9iamVjdCIsIm9GaXJzdENvbnRleHQiLCJvTGFzdENvbnRleHQiLCJhTGluZXNQb21pc2VzIiwiYkxpbmVDaGFydCIsImlDdXJyZW50TWluWCIsImlDdXJyZW50TWF4WCIsImlDdXJyZW50TWluWSIsImlDdXJyZW50TWF4WSIsIm9NaW5YIiwidmFsdWUiLCJJbmZpbml0eSIsIm9NYXhYIiwib01pblkiLCJvTWF4WSIsImNvbnRleHQiLCJzTWVhc3VyZSIsImkiLCJpbmRleCIsInB1c2giLCJfZ2V0Q3JpdGljYWxpdHlGcm9tUG9pbnQiLCJQcm9taXNlIiwiYWxsIiwidGhlbiIsImFDb2xvcnMiLCJvTGluZSIsInNldENvbG9yIiwiX3NldENoYXJ0TGFiZWxzQ29sb3JzIiwiYUNyaXRpY2FsaXR5IiwibGVmdFRvcCIsInJpZ2h0VG9wIiwibGVmdEJvdHRvbSIsInJpZ2h0Qm90dG9tIiwiX2Zvcm1hdERhdGVBbmROdW1iZXJWYWx1ZSIsIm1lYXN1cmVQcmVjaXNpb24iLCJtZWFzdXJlU2NhbGUiLCJkaW1lbnNpb25QcmVjaXNpb24iLCJjYWxlbmRhclBhdHRlcm4iLCJvUG9pbnQiLCJvUmV0dXJuIiwicmVzb2x2ZSIsIk5ldXRyYWwiLCJvTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJhRGF0YVBvaW50UXVhbGlmaWVycyIsImRhdGFQb2ludFF1YWxpZmllcnMiLCJzTWV0YVBhdGgiLCJPRGF0YU1ldGFNb2RlbCIsImdldFBhdGgiLCJnZXRNZXRhUGF0aCIsInJlcXVlc3RPYmplY3QiLCJvRGF0YVBvaW50Iiwic0NyaXRpY2FsaXR5Iiwib0NvbnRleHQiLCJDcml0aWNhbGl0eSIsIl9jcml0aWNhbGl0eSIsIkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24iLCJvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbiIsIm9DQyIsImZuR2V0VmFsdWUiLCJvUHJvcGVydHkiLCJzUmV0dXJuIiwiJFBhdGgiLCJoYXNPd25Qcm9wZXJ0eSIsIiREZWNpbWFsIiwic0FjY2VwdGFuY2VIaWdoIiwiQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlIiwic0FjY2VwdGFuY2VMb3ciLCJBY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZSIsInNEZXZpYXRpb25IaWdoIiwiRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWUiLCJzRGV2aWF0aW9uTG93IiwiRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZSIsInNUb2xlcmFuY2VIaWdoIiwiVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUiLCJzVG9sZXJhbmNlTG93IiwiVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSIsInNJbXByb3ZlbWVudERpcmVjdGlvbiIsIkltcHJvdmVtZW50RGlyZWN0aW9uIiwiJEVudW1NZW1iZXIiLCJfY3JpdGljYWxpdHlDYWxjdWxhdGlvbiIsIm9Dcml0aWNhbGl0eSIsImlDcml0aWNhbGl0eSIsInNDcml0aWNhbGl0eVBhdGgiLCJFcnJvciIsIkNyaXRpY2FsIiwiR29vZCIsImluZGV4T2YiLCJMb2ciLCJ3YXJuaW5nIiwic0NyaXRpY2FsaXR5RXhwcmVzc2lvbiIsImlQcmVjaXNpb24iLCJpU2NhbGUiLCJzUGF0dGVybiIsIl9nZXRTZW1hbnRpY3NWYWx1ZUZvcm1hdHRlciIsImZvcm1hdFZhbHVlIiwiaXNOYU4iLCJfZ2V0TGFiZWxOdW1iZXJGb3JtYXR0ZXIiLCJmb3JtYXQiLCJfb0RhdGVUeXBlIiwiRGF0ZVR5cGUiLCJzdHlsZSIsInNvdXJjZSIsInBhdHRlcm4iLCJOdW1iZXJGb3JtYXQiLCJnZXRGbG9hdEluc3RhbmNlIiwic2hvd1NjYWxlIiwicHJlY2lzaW9uIiwiZGVjaW1hbHMiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNaWNyb0NoYXJ0Q29udGFpbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgYWdncmVnYXRpb24sIGRlZmluZVVJNUNsYXNzLCBldmVudCwgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBtYWNyb0xpYiBmcm9tIFwic2FwL2ZlL21hY3Jvcy9saWJyYXJ5XCI7XG5pbXBvcnQgRmxleEJveCBmcm9tIFwic2FwL20vRmxleEJveFwiO1xuaW1wb3J0IExhYmVsIGZyb20gXCJzYXAvbS9MYWJlbFwiO1xuaW1wb3J0IG1vYmlsZWxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCBBcmVhTWljcm9DaGFydCBmcm9tIFwic2FwL3N1aXRlL3VpL21pY3JvY2hhcnQvQXJlYU1pY3JvQ2hhcnRcIjtcbmltcG9ydCBDb2x1bW5NaWNyb0NoYXJ0IGZyb20gXCJzYXAvc3VpdGUvdWkvbWljcm9jaGFydC9Db2x1bW5NaWNyb0NoYXJ0XCI7XG5pbXBvcnQgQ29tcGFyaXNvbk1pY3JvQ2hhcnQgZnJvbSBcInNhcC9zdWl0ZS91aS9taWNyb2NoYXJ0L0NvbXBhcmlzb25NaWNyb0NoYXJ0XCI7XG5pbXBvcnQgTGluZU1pY3JvQ2hhcnQgZnJvbSBcInNhcC9zdWl0ZS91aS9taWNyb2NoYXJ0L0xpbmVNaWNyb0NoYXJ0XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IE51bWJlckZvcm1hdCBmcm9tIFwic2FwL3VpL2NvcmUvZm9ybWF0L051bWJlckZvcm1hdFwiO1xuaW1wb3J0IHR5cGUgUmVuZGVyTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvUmVuZGVyTWFuYWdlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YVY0TGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IERhdGVUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvdHlwZS9EYXRlXCI7XG5cbmNvbnN0IE5hdmlnYXRpb25UeXBlID0gbWFjcm9MaWIuTmF2aWdhdGlvblR5cGU7XG5jb25zdCBWYWx1ZUNvbG9yID0gbW9iaWxlbGlicmFyeS5WYWx1ZUNvbG9yO1xuLyoqXG4gKiAgQ29udGFpbmVyIENvbnRyb2wgZm9yIE1pY3JvIENoYXJ0IGFuZCBVb00uXG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgaW50ZXJuYWwvZXhwZXJpbWVudGFsIHVzZSFcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5taWNyb2NoYXJ0Lk1pY3JvQ2hhcnRDb250YWluZXJcIilcbmNsYXNzIE1pY3JvQ2hhcnRDb250YWluZXIgZXh0ZW5kcyBDb250cm9sIHtcblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdH0pXG5cdHNob3dPbmx5Q2hhcnQhOiBib29sZWFuO1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcblx0fSlcblx0dW9tUGF0aCE6IHN0cmluZztcblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1tdXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBbXVxuXHR9KVxuXHRtZWFzdXJlcyE6IHN0cmluZ1tdO1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcblx0fSlcblx0ZGltZW5zaW9uPzogc3RyaW5nO1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nW11cIixcblx0XHRkZWZhdWx0VmFsdWU6IFtdXG5cdH0pXG5cdGRhdGFQb2ludFF1YWxpZmllcnMhOiBzdHJpbmdbXTtcblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImludFwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogdW5kZWZpbmVkXG5cdH0pXG5cdG1lYXN1cmVQcmVjaXNpb24hOiBudW1iZXI7XG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJpbnRcIixcblx0XHRkZWZhdWx0VmFsdWU6IDFcblx0fSlcblx0bWVhc3VyZVNjYWxlITogbnVtYmVyO1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiaW50XCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcblx0fSlcblx0ZGltZW5zaW9uUHJlY2lzaW9uPzogbnVtYmVyO1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBcIlwiXG5cdH0pXG5cdGNoYXJ0VGl0bGUhOiBzdHJpbmc7XG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiXCJcblx0fSlcblx0Y2hhcnREZXNjcmlwdGlvbiE6IHN0cmluZztcblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInNhcC5mZS5tYWNyb3MuTmF2aWdhdGlvblR5cGVcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiTm9uZVwiXG5cdH0pXG5cdG5hdmlnYXRpb25UeXBlITogdHlwZW9mIE5hdmlnYXRpb25UeXBlO1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBcIlwiXG5cdH0pXG5cdGNhbGVuZGFyUGF0dGVybiE6IHN0cmluZztcblx0QGV2ZW50KClcblx0b25UaXRsZVByZXNzZWQhOiBGdW5jdGlvbjtcblxuXHRAYWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLFxuXHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRpc0RlZmF1bHQ6IHRydWVcblx0fSlcblx0bWljcm9DaGFydCE6IENvbnRyb2w7XG5cdEBhZ2dyZWdhdGlvbih7XG5cdFx0dHlwZTogXCJzYXAubS5MYWJlbFwiLFxuXHRcdG11bHRpcGxlOiBmYWxzZVxuXHR9KVxuXHRfdW9tTGFiZWwhOiBMYWJlbDtcblxuXHRAYWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLFxuXHRcdG11bHRpcGxlOiB0cnVlXG5cdH0pXG5cdG1pY3JvQ2hhcnRUaXRsZSE6IENvbnRyb2xbXTtcblx0cHJpdmF0ZSBfb2xpc3RCaW5kaW5nPzogT0RhdGFWNExpc3RCaW5kaW5nO1xuXHRwcml2YXRlIF9vRGF0ZVR5cGU/OiBEYXRlVHlwZTtcblxuXHRzdGF0aWMgcmVuZGVyKG9SbTogUmVuZGVyTWFuYWdlciwgb0NvbnRyb2w6IE1pY3JvQ2hhcnRDb250YWluZXIpIHtcblx0XHRvUm0ub3BlblN0YXJ0KFwiZGl2XCIsIG9Db250cm9sKTtcblx0XHRvUm0ub3BlbkVuZCgpO1xuXHRcdGlmICghb0NvbnRyb2wuc2hvd09ubHlDaGFydCkge1xuXHRcdFx0Y29uc3Qgb0NoYXJ0VGl0bGUgPSBvQ29udHJvbC5taWNyb0NoYXJ0VGl0bGU7XG5cdFx0XHRpZiAob0NoYXJ0VGl0bGUpIHtcblx0XHRcdFx0b0NoYXJ0VGl0bGUuZm9yRWFjaChmdW5jdGlvbiAob1N1YkNoYXJ0VGl0bGU6IGFueSkge1xuXHRcdFx0XHRcdG9SbS5vcGVuU3RhcnQoXCJkaXZcIik7XG5cdFx0XHRcdFx0b1JtLm9wZW5FbmQoKTtcblx0XHRcdFx0XHRvUm0ucmVuZGVyQ29udHJvbChvU3ViQ2hhcnRUaXRsZSk7XG5cdFx0XHRcdFx0b1JtLmNsb3NlKFwiZGl2XCIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdG9SbS5vcGVuU3RhcnQoXCJkaXZcIik7XG5cdFx0XHRvUm0ub3BlbkVuZCgpO1xuXHRcdFx0Y29uc3Qgb0NoYXJ0RGVzY3JpcHRpb24gPSBuZXcgTGFiZWwoeyB0ZXh0OiBvQ29udHJvbC5jaGFydERlc2NyaXB0aW9uIH0pO1xuXHRcdFx0b1JtLnJlbmRlckNvbnRyb2wob0NoYXJ0RGVzY3JpcHRpb24pO1xuXHRcdFx0b1JtLmNsb3NlKFwiZGl2XCIpO1xuXHRcdH1cblx0XHRjb25zdCBvTWljcm9DaGFydCA9IG9Db250cm9sLm1pY3JvQ2hhcnQ7XG5cdFx0aWYgKG9NaWNyb0NoYXJ0KSB7XG5cdFx0XHRvTWljcm9DaGFydC5hZGRTdHlsZUNsYXNzKFwic2FwVWlUaW55TWFyZ2luVG9wQm90dG9tXCIpO1xuXHRcdFx0b1JtLnJlbmRlckNvbnRyb2wob01pY3JvQ2hhcnQpO1xuXHRcdFx0aWYgKCFvQ29udHJvbC5zaG93T25seUNoYXJ0ICYmIG9Db250cm9sLnVvbVBhdGgpIHtcblx0XHRcdFx0Y29uc3Qgb1NldHRpbmdzID0gb0NvbnRyb2wuX2NoZWNrSWZDaGFydFJlcXVpcmVzUnVudGltZUxhYmVscygpID8gdW5kZWZpbmVkIDogeyB0ZXh0OiB7IHBhdGg6IG9Db250cm9sLnVvbVBhdGggfSB9LFxuXHRcdFx0XHRcdG9MYWJlbCA9IG5ldyBMYWJlbChvU2V0dGluZ3MpLFxuXHRcdFx0XHRcdG9GbGV4Qm94ID0gbmV3IEZsZXhCb3goe1xuXHRcdFx0XHRcdFx0YWxpZ25JdGVtczogXCJTdGFydFwiLFxuXHRcdFx0XHRcdFx0anVzdGlmeUNvbnRlbnQ6IFwiRW5kXCIsXG5cdFx0XHRcdFx0XHRpdGVtczogW29MYWJlbF1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0b1JtLnJlbmRlckNvbnRyb2wob0ZsZXhCb3gpO1xuXHRcdFx0XHRvQ29udHJvbC5zZXRBZ2dyZWdhdGlvbihcIl91b21MYWJlbFwiLCBvTGFiZWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRvUm0uY2xvc2UoXCJkaXZcIik7XG5cdH1cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0Y29uc3Qgb0JpbmRpbmcgPSB0aGlzLl9nZXRMaXN0QmluZGluZ0ZvclJ1bnRpbWVMYWJlbHMoKTtcblx0XHRpZiAob0JpbmRpbmcpIHtcblx0XHRcdG9CaW5kaW5nLmRldGFjaEV2ZW50KFwiY2hhbmdlXCIsIHRoaXMuX3NldFJ1bnRpbWVDaGFydExhYmVsc0FuZFVuaXRPZk1lYXN1cmUsIHRoaXMpO1xuXHRcdFx0dGhpcy5fb2xpc3RCaW5kaW5nID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXHRvbkFmdGVyUmVuZGVyaW5nKCkge1xuXHRcdGNvbnN0IG9CaW5kaW5nID0gdGhpcy5fZ2V0TGlzdEJpbmRpbmdGb3JSdW50aW1lTGFiZWxzKCk7XG5cblx0XHRpZiAoIXRoaXMuX2NoZWNrSWZDaGFydFJlcXVpcmVzUnVudGltZUxhYmVscygpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChvQmluZGluZykge1xuXHRcdFx0KG9CaW5kaW5nLmF0dGFjaEV2ZW50IGFzIGFueSkoXCJjaGFuZ2VcIiwgdGhpcy5fc2V0UnVudGltZUNoYXJ0TGFiZWxzQW5kVW5pdE9mTWVhc3VyZSwgdGhpcyk7XG5cdFx0XHR0aGlzLl9vbGlzdEJpbmRpbmcgPSBvQmluZGluZztcblx0XHR9XG5cdH1cblx0c2V0U2hvd09ubHlDaGFydChzVmFsdWU6IGFueSkge1xuXHRcdGlmICghc1ZhbHVlICYmIHRoaXMuX29saXN0QmluZGluZykge1xuXHRcdFx0dGhpcy5fc2V0Q2hhcnRMYWJlbHMoKTtcblx0XHR9XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcInNob3dPbmx5Q2hhcnRcIiwgc1ZhbHVlLCBmYWxzZSAvKnJlLXJlbmRlcmluZyovKTtcblx0fVxuXHRfY2hlY2tJZkNoYXJ0UmVxdWlyZXNSdW50aW1lTGFiZWxzKCkge1xuXHRcdGNvbnN0IG9NaWNyb0NoYXJ0ID0gdGhpcy5taWNyb0NoYXJ0O1xuXG5cdFx0cmV0dXJuIEJvb2xlYW4oXG5cdFx0XHRvTWljcm9DaGFydCBpbnN0YW5jZW9mIEFyZWFNaWNyb0NoYXJ0IHx8XG5cdFx0XHRcdG9NaWNyb0NoYXJ0IGluc3RhbmNlb2YgQ29sdW1uTWljcm9DaGFydCB8fFxuXHRcdFx0XHRvTWljcm9DaGFydCBpbnN0YW5jZW9mIExpbmVNaWNyb0NoYXJ0IHx8XG5cdFx0XHRcdG9NaWNyb0NoYXJ0IGluc3RhbmNlb2YgQ29tcGFyaXNvbk1pY3JvQ2hhcnRcblx0XHQpO1xuXHR9XG5cdF9jaGVja0ZvckNoYXJ0TGFiZWxBZ2dyZWdhdGlvbnMoKSB7XG5cdFx0Y29uc3Qgb01pY3JvQ2hhcnQgPSB0aGlzLm1pY3JvQ2hhcnQ7XG5cdFx0cmV0dXJuIEJvb2xlYW4oXG5cdFx0XHQob01pY3JvQ2hhcnQgaW5zdGFuY2VvZiBBcmVhTWljcm9DaGFydCAmJlxuXHRcdFx0XHRvTWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImZpcnN0WUxhYmVsXCIpICYmXG5cdFx0XHRcdG9NaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGFzdFlMYWJlbFwiKSAmJlxuXHRcdFx0XHRvTWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImZpcnN0WExhYmVsXCIpICYmXG5cdFx0XHRcdG9NaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGFzdFhMYWJlbFwiKSkgfHxcblx0XHRcdFx0KG9NaWNyb0NoYXJ0IGluc3RhbmNlb2YgQ29sdW1uTWljcm9DaGFydCAmJlxuXHRcdFx0XHRcdG9NaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGVmdFRvcExhYmVsXCIpICYmXG5cdFx0XHRcdFx0b01pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJyaWdodFRvcExhYmVsXCIpICYmXG5cdFx0XHRcdFx0b01pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsZWZ0Qm90dG9tTGFiZWxcIikgJiZcblx0XHRcdFx0XHRvTWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcInJpZ2h0Qm90dG9tTGFiZWxcIikpIHx8XG5cdFx0XHRcdG9NaWNyb0NoYXJ0IGluc3RhbmNlb2YgTGluZU1pY3JvQ2hhcnRcblx0XHQpO1xuXHR9XG5cdF9nZXRMaXN0QmluZGluZ0ZvclJ1bnRpbWVMYWJlbHMoKSB7XG5cdFx0Y29uc3Qgb01pY3JvQ2hhcnQgPSB0aGlzLm1pY3JvQ2hhcnQ7XG5cdFx0bGV0IG9CaW5kaW5nO1xuXHRcdGlmIChvTWljcm9DaGFydCBpbnN0YW5jZW9mIEFyZWFNaWNyb0NoYXJ0KSB7XG5cdFx0XHRjb25zdCBvQ2hhcnQgPSBvTWljcm9DaGFydC5nZXRDaGFydCgpO1xuXHRcdFx0b0JpbmRpbmcgPSBvQ2hhcnQgJiYgb01pY3JvQ2hhcnQuZ2V0Q2hhcnQoKS5nZXRCaW5kaW5nKFwicG9pbnRzXCIpO1xuXHRcdH0gZWxzZSBpZiAob01pY3JvQ2hhcnQgaW5zdGFuY2VvZiBDb2x1bW5NaWNyb0NoYXJ0KSB7XG5cdFx0XHRvQmluZGluZyA9IG9NaWNyb0NoYXJ0LmdldEJpbmRpbmcoXCJjb2x1bW5zXCIpO1xuXHRcdH0gZWxzZSBpZiAob01pY3JvQ2hhcnQgaW5zdGFuY2VvZiBMaW5lTWljcm9DaGFydCkge1xuXHRcdFx0Y29uc3QgYUxpbmVzID0gb01pY3JvQ2hhcnQuZ2V0TGluZXMoKTtcblx0XHRcdG9CaW5kaW5nID0gYUxpbmVzICYmIGFMaW5lcy5sZW5ndGggJiYgYUxpbmVzWzBdLmdldEJpbmRpbmcoXCJwb2ludHNcIik7XG5cdFx0fSBlbHNlIGlmIChvTWljcm9DaGFydCBpbnN0YW5jZW9mIENvbXBhcmlzb25NaWNyb0NoYXJ0KSB7XG5cdFx0XHRvQmluZGluZyA9IG9NaWNyb0NoYXJ0LmdldEJpbmRpbmcoXCJkYXRhXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gb0JpbmRpbmcgaW5zdGFuY2VvZiBPRGF0YVY0TGlzdEJpbmRpbmcgPyBvQmluZGluZyA6IGZhbHNlO1xuXHR9XG5cdF9zZXRSdW50aW1lQ2hhcnRMYWJlbHNBbmRVbml0T2ZNZWFzdXJlKCkge1xuXHRcdGNvbnN0IG9MaXN0QmluZGluZyA9IHRoaXMuX29saXN0QmluZGluZyxcblx0XHRcdGFDb250ZXh0cyA9IG9MaXN0QmluZGluZz8uZ2V0Q29udGV4dHMoKSxcblx0XHRcdGFNZWFzdXJlcyA9IHRoaXMubWVhc3VyZXMgfHwgW10sXG5cdFx0XHRzRGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24sXG5cdFx0XHRzVW5pdE9mTWVhc3VyZVBhdGggPSB0aGlzLnVvbVBhdGgsXG5cdFx0XHRvTWljcm9DaGFydCA9IHRoaXMubWljcm9DaGFydCxcblx0XHRcdG9Vbml0T2ZNZWFzdXJlTGFiZWwgPSB0aGlzLl91b21MYWJlbDtcblxuXHRcdGlmIChvVW5pdE9mTWVhc3VyZUxhYmVsICYmIHNVbml0T2ZNZWFzdXJlUGF0aCAmJiBhQ29udGV4dHMgJiYgYUNvbnRleHRzLmxlbmd0aCAmJiAhdGhpcy5zaG93T25seUNoYXJ0KSB7XG5cdFx0XHRvVW5pdE9mTWVhc3VyZUxhYmVsLnNldFRleHQoYUNvbnRleHRzWzBdLmdldE9iamVjdChzVW5pdE9mTWVhc3VyZVBhdGgpKTtcblx0XHR9IGVsc2UgaWYgKG9Vbml0T2ZNZWFzdXJlTGFiZWwpIHtcblx0XHRcdG9Vbml0T2ZNZWFzdXJlTGFiZWwuc2V0VGV4dChcIlwiKTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuX2NoZWNrRm9yQ2hhcnRMYWJlbEFnZ3JlZ2F0aW9ucygpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCFhQ29udGV4dHMgfHwgIWFDb250ZXh0cy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuX3NldENoYXJ0TGFiZWxzKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb0ZpcnN0Q29udGV4dCA9IGFDb250ZXh0c1swXSxcblx0XHRcdG9MYXN0Q29udGV4dCA9IGFDb250ZXh0c1thQ29udGV4dHMubGVuZ3RoIC0gMV0sXG5cdFx0XHRhTGluZXNQb21pc2VzOiBhbnlbXSA9IFtdLFxuXHRcdFx0YkxpbmVDaGFydCA9IG9NaWNyb0NoYXJ0IGluc3RhbmNlb2YgTGluZU1pY3JvQ2hhcnQsXG5cdFx0XHRpQ3VycmVudE1pblggPSBvRmlyc3RDb250ZXh0LmdldE9iamVjdChzRGltZW5zaW9uKSxcblx0XHRcdGlDdXJyZW50TWF4WCA9IG9MYXN0Q29udGV4dC5nZXRPYmplY3Qoc0RpbWVuc2lvbik7XG5cdFx0bGV0IGlDdXJyZW50TWluWSxcblx0XHRcdGlDdXJyZW50TWF4WSxcblx0XHRcdG9NaW5YOiBhbnkgPSB7IHZhbHVlOiBJbmZpbml0eSB9LFxuXHRcdFx0b01heFg6IGFueSA9IHsgdmFsdWU6IC1JbmZpbml0eSB9LFxuXHRcdFx0b01pblk6IGFueSA9IHsgdmFsdWU6IEluZmluaXR5IH0sXG5cdFx0XHRvTWF4WTogYW55ID0geyB2YWx1ZTogLUluZmluaXR5IH07XG5cblx0XHRvTWluWCA9IGlDdXJyZW50TWluWCA9PSB1bmRlZmluZWQgPyBvTWluWCA6IHsgY29udGV4dDogb0ZpcnN0Q29udGV4dCwgdmFsdWU6IGlDdXJyZW50TWluWCB9O1xuXHRcdG9NYXhYID0gaUN1cnJlbnRNYXhYID09IHVuZGVmaW5lZCA/IG9NYXhYIDogeyBjb250ZXh0OiBvTGFzdENvbnRleHQsIHZhbHVlOiBpQ3VycmVudE1heFggfTtcblxuXHRcdGFNZWFzdXJlcy5mb3JFYWNoKChzTWVhc3VyZTogYW55LCBpOiBhbnkpID0+IHtcblx0XHRcdGlDdXJyZW50TWluWSA9IG9GaXJzdENvbnRleHQuZ2V0T2JqZWN0KHNNZWFzdXJlKTtcblx0XHRcdGlDdXJyZW50TWF4WSA9IG9MYXN0Q29udGV4dC5nZXRPYmplY3Qoc01lYXN1cmUpO1xuXHRcdFx0b01heFkgPSBpQ3VycmVudE1heFkgPiBvTWF4WS52YWx1ZSA/IHsgY29udGV4dDogb0xhc3RDb250ZXh0LCB2YWx1ZTogaUN1cnJlbnRNYXhZLCBpbmRleDogYkxpbmVDaGFydCA/IGkgOiAwIH0gOiBvTWF4WTtcblx0XHRcdG9NaW5ZID0gaUN1cnJlbnRNaW5ZIDwgb01pblkudmFsdWUgPyB7IGNvbnRleHQ6IG9GaXJzdENvbnRleHQsIHZhbHVlOiBpQ3VycmVudE1pblksIGluZGV4OiBiTGluZUNoYXJ0ID8gaSA6IDAgfSA6IG9NaW5ZO1xuXHRcdFx0aWYgKGJMaW5lQ2hhcnQpIHtcblx0XHRcdFx0YUxpbmVzUG9taXNlcy5wdXNoKHRoaXMuX2dldENyaXRpY2FsaXR5RnJvbVBvaW50KHsgY29udGV4dDogb0xhc3RDb250ZXh0LCB2YWx1ZTogaUN1cnJlbnRNYXhZLCBpbmRleDogaSB9KSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fc2V0Q2hhcnRMYWJlbHMob01pblkudmFsdWUsIG9NYXhZLnZhbHVlLCBvTWluWC52YWx1ZSwgb01heFgudmFsdWUpO1xuXHRcdGlmIChiTGluZUNoYXJ0KSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYUxpbmVzUG9taXNlcykudGhlbihmdW5jdGlvbiAoYUNvbG9yczogYW55W10pIHtcblx0XHRcdFx0Y29uc3QgYUxpbmVzID0gb01pY3JvQ2hhcnQuZ2V0TGluZXMoKTtcblx0XHRcdFx0YUxpbmVzLmZvckVhY2goZnVuY3Rpb24gKG9MaW5lOiBhbnksIGk6IGFueSkge1xuXHRcdFx0XHRcdG9MaW5lLnNldENvbG9yKGFDb2xvcnNbaV0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fc2V0Q2hhcnRMYWJlbHNDb2xvcnMob01heFksIG9NaW5ZKTtcblx0XHR9XG5cdH1cblx0X3NldENoYXJ0TGFiZWxzQ29sb3JzKG9NYXhZOiBvYmplY3QsIG9NaW5ZOiBvYmplY3QpIHtcblx0XHRjb25zdCBvTWljcm9DaGFydCA9IHRoaXMubWljcm9DaGFydDtcblxuXHRcdHJldHVybiBQcm9taXNlLmFsbChbdGhpcy5fZ2V0Q3JpdGljYWxpdHlGcm9tUG9pbnQob01pblkpLCB0aGlzLl9nZXRDcml0aWNhbGl0eUZyb21Qb2ludChvTWF4WSldKS50aGVuKGZ1bmN0aW9uIChcblx0XHRcdGFDcml0aWNhbGl0eTogW2FueSwgYW55XVxuXHRcdCkge1xuXHRcdFx0aWYgKG9NaWNyb0NoYXJ0IGluc3RhbmNlb2YgQXJlYU1pY3JvQ2hhcnQpIHtcblx0XHRcdFx0KG9NaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwiZmlyc3RZTGFiZWxcIikgYXMgYW55KS5zZXRQcm9wZXJ0eShcImNvbG9yXCIsIGFDcml0aWNhbGl0eVswXSwgdHJ1ZSk7XG5cdFx0XHRcdChvTWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImxhc3RZTGFiZWxcIikgYXMgYW55KS5zZXRQcm9wZXJ0eShcImNvbG9yXCIsIGFDcml0aWNhbGl0eVsxXSwgdHJ1ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKG9NaWNyb0NoYXJ0IGluc3RhbmNlb2YgQ29sdW1uTWljcm9DaGFydCkge1xuXHRcdFx0XHQob01pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsZWZ0VG9wTGFiZWxcIikgYXMgYW55KS5zZXRQcm9wZXJ0eShcImNvbG9yXCIsIGFDcml0aWNhbGl0eVswXSwgdHJ1ZSk7XG5cdFx0XHRcdChvTWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcInJpZ2h0VG9wTGFiZWxcIikgYXMgYW55KS5zZXRQcm9wZXJ0eShcImNvbG9yXCIsIGFDcml0aWNhbGl0eVsxXSwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0X3NldENoYXJ0TGFiZWxzKGxlZnRUb3A/OiBvYmplY3QsIHJpZ2h0VG9wPzogb2JqZWN0LCBsZWZ0Qm90dG9tPzogb2JqZWN0LCByaWdodEJvdHRvbT86IG9iamVjdCkge1xuXHRcdGNvbnN0IG9NaWNyb0NoYXJ0ID0gdGhpcy5taWNyb0NoYXJ0O1xuXG5cdFx0bGVmdFRvcCA9IHRoaXMuX2Zvcm1hdERhdGVBbmROdW1iZXJWYWx1ZShsZWZ0VG9wLCB0aGlzLm1lYXN1cmVQcmVjaXNpb24sIHRoaXMubWVhc3VyZVNjYWxlKTtcblx0XHRyaWdodFRvcCA9IHRoaXMuX2Zvcm1hdERhdGVBbmROdW1iZXJWYWx1ZShyaWdodFRvcCwgdGhpcy5tZWFzdXJlUHJlY2lzaW9uLCB0aGlzLm1lYXN1cmVTY2FsZSk7XG5cdFx0bGVmdEJvdHRvbSA9IHRoaXMuX2Zvcm1hdERhdGVBbmROdW1iZXJWYWx1ZShsZWZ0Qm90dG9tLCB0aGlzLmRpbWVuc2lvblByZWNpc2lvbiwgdW5kZWZpbmVkLCB0aGlzLmNhbGVuZGFyUGF0dGVybik7XG5cdFx0cmlnaHRCb3R0b20gPSB0aGlzLl9mb3JtYXREYXRlQW5kTnVtYmVyVmFsdWUocmlnaHRCb3R0b20sIHRoaXMuZGltZW5zaW9uUHJlY2lzaW9uLCB1bmRlZmluZWQsIHRoaXMuY2FsZW5kYXJQYXR0ZXJuKTtcblxuXHRcdGlmIChvTWljcm9DaGFydCBpbnN0YW5jZW9mIEFyZWFNaWNyb0NoYXJ0KSB7XG5cdFx0XHQob01pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJmaXJzdFlMYWJlbFwiKSBhcyBhbnkpLnNldFByb3BlcnR5KFwibGFiZWxcIiwgbGVmdFRvcCwgZmFsc2UpO1xuXHRcdFx0KG9NaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGFzdFlMYWJlbFwiKSBhcyBhbnkpLnNldFByb3BlcnR5KFwibGFiZWxcIiwgcmlnaHRUb3AsIGZhbHNlKTtcblx0XHRcdChvTWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImZpcnN0WExhYmVsXCIpIGFzIGFueSkuc2V0UHJvcGVydHkoXCJsYWJlbFwiLCBsZWZ0Qm90dG9tLCBmYWxzZSk7XG5cdFx0XHQob01pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsYXN0WExhYmVsXCIpIGFzIGFueSkuc2V0UHJvcGVydHkoXCJsYWJlbFwiLCByaWdodEJvdHRvbSwgZmFsc2UpO1xuXHRcdH0gZWxzZSBpZiAob01pY3JvQ2hhcnQgaW5zdGFuY2VvZiBDb2x1bW5NaWNyb0NoYXJ0KSB7XG5cdFx0XHQob01pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsZWZ0VG9wTGFiZWxcIikgYXMgYW55KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIGxlZnRUb3AsIGZhbHNlKTtcblx0XHRcdChvTWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcInJpZ2h0VG9wTGFiZWxcIikgYXMgYW55KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIHJpZ2h0VG9wLCBmYWxzZSk7XG5cdFx0XHQob01pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsZWZ0Qm90dG9tTGFiZWxcIikgYXMgYW55KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIGxlZnRCb3R0b20sIGZhbHNlKTtcblx0XHRcdChvTWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcInJpZ2h0Qm90dG9tTGFiZWxcIikgYXMgYW55KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIHJpZ2h0Qm90dG9tLCBmYWxzZSk7XG5cdFx0fSBlbHNlIGlmIChvTWljcm9DaGFydCBpbnN0YW5jZW9mIExpbmVNaWNyb0NoYXJ0KSB7XG5cdFx0XHRvTWljcm9DaGFydC5zZXRQcm9wZXJ0eShcImxlZnRUb3BMYWJlbFwiLCBsZWZ0VG9wLCBmYWxzZSk7XG5cdFx0XHRvTWljcm9DaGFydC5zZXRQcm9wZXJ0eShcInJpZ2h0VG9wTGFiZWxcIiwgcmlnaHRUb3AsIGZhbHNlKTtcblx0XHRcdG9NaWNyb0NoYXJ0LnNldFByb3BlcnR5KFwibGVmdEJvdHRvbUxhYmVsXCIsIGxlZnRCb3R0b20sIGZhbHNlKTtcblx0XHRcdG9NaWNyb0NoYXJ0LnNldFByb3BlcnR5KFwicmlnaHRCb3R0b21MYWJlbFwiLCByaWdodEJvdHRvbSwgZmFsc2UpO1xuXHRcdH1cblx0fVxuXHRfZ2V0Q3JpdGljYWxpdHlGcm9tUG9pbnQob1BvaW50OiBhbnkpIHtcblx0XHRsZXQgb1JldHVybiA9IFByb21pc2UucmVzb2x2ZShWYWx1ZUNvbG9yLk5ldXRyYWwpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLmdldE1vZGVsKCkgJiYgKHRoaXMuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCksXG5cdFx0XHRhRGF0YVBvaW50UXVhbGlmaWVycyA9IHRoaXMuZGF0YVBvaW50UXVhbGlmaWVycyxcblx0XHRcdHNNZXRhUGF0aCA9XG5cdFx0XHRcdG9NZXRhTW9kZWwgaW5zdGFuY2VvZiBPRGF0YU1ldGFNb2RlbCAmJlxuXHRcdFx0XHRvUG9pbnQgJiZcblx0XHRcdFx0b1BvaW50LmNvbnRleHQgJiZcblx0XHRcdFx0b1BvaW50LmNvbnRleHQuZ2V0UGF0aCgpICYmXG5cdFx0XHRcdG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob1BvaW50LmNvbnRleHQuZ2V0UGF0aCgpKTtcblxuXHRcdGlmICh0eXBlb2Ygc01ldGFQYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRvUmV0dXJuID0gb01ldGFNb2RlbFxuXHRcdFx0XHQucmVxdWVzdE9iamVjdChcblx0XHRcdFx0XHRgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnQke1xuXHRcdFx0XHRcdFx0YURhdGFQb2ludFF1YWxpZmllcnNbb1BvaW50LmluZGV4XSA/IGAjJHthRGF0YVBvaW50UXVhbGlmaWVyc1tvUG9pbnQuaW5kZXhdfWAgOiBcIlwiXG5cdFx0XHRcdFx0fWBcblx0XHRcdFx0KVxuXHRcdFx0XHQudGhlbigob0RhdGFQb2ludDogYW55KSA9PiB7XG5cdFx0XHRcdFx0bGV0IHNDcml0aWNhbGl0eSA9IFZhbHVlQ29sb3IuTmV1dHJhbDtcblx0XHRcdFx0XHRjb25zdCBvQ29udGV4dCA9IG9Qb2ludC5jb250ZXh0O1xuXHRcdFx0XHRcdGlmIChvRGF0YVBvaW50LkNyaXRpY2FsaXR5KSB7XG5cdFx0XHRcdFx0XHRzQ3JpdGljYWxpdHkgPSB0aGlzLl9jcml0aWNhbGl0eShvRGF0YVBvaW50LkNyaXRpY2FsaXR5LCBvQ29udGV4dCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvRGF0YVBvaW50LkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24pIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uID0gb0RhdGFQb2ludC5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLFxuXHRcdFx0XHRcdFx0XHRvQ0M6IGFueSA9IHt9LFxuXHRcdFx0XHRcdFx0XHRmbkdldFZhbHVlID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IHNSZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9Qcm9wZXJ0eS4kUGF0aCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0c1JldHVybiA9IG9Db250ZXh0LmdldE9iamVjdChvUHJvcGVydHkuJFBhdGgpO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAob1Byb3BlcnR5Lmhhc093blByb3BlcnR5KFwiJERlY2ltYWxcIikpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHNSZXR1cm4gPSBvUHJvcGVydHkuJERlY2ltYWw7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzUmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0b0NDLnNBY2NlcHRhbmNlSGlnaCA9IG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLkFjY2VwdGFuY2VSYW5nZUhpZ2hWYWx1ZVxuXHRcdFx0XHRcdFx0XHQ/IGZuR2V0VmFsdWUob0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24uQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlKVxuXHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdG9DQy5zQWNjZXB0YW5jZUxvdyA9IG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLkFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlXG5cdFx0XHRcdFx0XHRcdD8gZm5HZXRWYWx1ZShvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5BY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZSlcblx0XHRcdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRvQ0Muc0RldmlhdGlvbkhpZ2ggPSBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5EZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZVxuXHRcdFx0XHRcdFx0XHQ/IGZuR2V0VmFsdWUob0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24uRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWUpXG5cdFx0XHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0b0NDLnNEZXZpYXRpb25Mb3cgPSBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5EZXZpYXRpb25SYW5nZUxvd1ZhbHVlXG5cdFx0XHRcdFx0XHRcdD8gZm5HZXRWYWx1ZShvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5EZXZpYXRpb25SYW5nZUxvd1ZhbHVlKVxuXHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdG9DQy5zVG9sZXJhbmNlSGlnaCA9IG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLlRvbGVyYW5jZVJhbmdlSGlnaFZhbHVlXG5cdFx0XHRcdFx0XHRcdD8gZm5HZXRWYWx1ZShvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Ub2xlcmFuY2VSYW5nZUhpZ2hWYWx1ZSlcblx0XHRcdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRvQ0Muc1RvbGVyYW5jZUxvdyA9IG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLlRvbGVyYW5jZVJhbmdlTG93VmFsdWVcblx0XHRcdFx0XHRcdFx0PyBmbkdldFZhbHVlKG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLlRvbGVyYW5jZVJhbmdlTG93VmFsdWUpXG5cdFx0XHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0b0NDLnNJbXByb3ZlbWVudERpcmVjdGlvbiA9IG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLkltcHJvdmVtZW50RGlyZWN0aW9uLiRFbnVtTWVtYmVyO1xuXG5cdFx0XHRcdFx0XHRzQ3JpdGljYWxpdHkgPSB0aGlzLl9jcml0aWNhbGl0eUNhbGN1bGF0aW9uKFxuXHRcdFx0XHRcdFx0XHRvQ0Muc0ltcHJvdmVtZW50RGlyZWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRvUG9pbnQudmFsdWUsXG5cdFx0XHRcdFx0XHRcdG9DQy5zRGV2aWF0aW9uTG93LFxuXHRcdFx0XHRcdFx0XHRvQ0Muc1RvbGVyYW5jZUxvdyxcblx0XHRcdFx0XHRcdFx0b0NDLnNBY2NlcHRhbmNlTG93LFxuXHRcdFx0XHRcdFx0XHRvQ0Muc0FjY2VwdGFuY2VIaWdoLFxuXHRcdFx0XHRcdFx0XHRvQ0Muc1RvbGVyYW5jZUhpZ2gsXG5cdFx0XHRcdFx0XHRcdG9DQy5zRGV2aWF0aW9uSGlnaFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHNDcml0aWNhbGl0eTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBvUmV0dXJuO1xuXHR9XG5cdF9jcml0aWNhbGl0eShvQ3JpdGljYWxpdHk6IGFueSwgb0NvbnRleHQ6IENvbnRleHQpIHtcblx0XHRsZXQgaUNyaXRpY2FsaXR5LFxuXHRcdFx0c0NyaXRpY2FsaXR5ID0gVmFsdWVDb2xvci5OZXV0cmFsO1xuXHRcdGlmIChvQ3JpdGljYWxpdHkuJFBhdGgpIHtcblx0XHRcdGNvbnN0IHNDcml0aWNhbGl0eVBhdGggPSBvQ3JpdGljYWxpdHkuJFBhdGg7XG5cdFx0XHRpQ3JpdGljYWxpdHkgPSBvQ29udGV4dC5nZXRPYmplY3Qoc0NyaXRpY2FsaXR5UGF0aCk7XG5cdFx0XHRpZiAoaUNyaXRpY2FsaXR5ID09PSBcIk5lZ2F0aXZlXCIgfHwgaUNyaXRpY2FsaXR5ID09PSBcIjFcIiB8fCBpQ3JpdGljYWxpdHkgPT09IDEpIHtcblx0XHRcdFx0c0NyaXRpY2FsaXR5ID0gVmFsdWVDb2xvci5FcnJvcjtcblx0XHRcdH0gZWxzZSBpZiAoaUNyaXRpY2FsaXR5ID09PSBcIkNyaXRpY2FsXCIgfHwgaUNyaXRpY2FsaXR5ID09PSBcIjJcIiB8fCBpQ3JpdGljYWxpdHkgPT09IDIpIHtcblx0XHRcdFx0c0NyaXRpY2FsaXR5ID0gVmFsdWVDb2xvci5Dcml0aWNhbDtcblx0XHRcdH0gZWxzZSBpZiAoaUNyaXRpY2FsaXR5ID09PSBcIlBvc2l0aXZlXCIgfHwgaUNyaXRpY2FsaXR5ID09PSBcIjNcIiB8fCBpQ3JpdGljYWxpdHkgPT09IDMpIHtcblx0XHRcdFx0c0NyaXRpY2FsaXR5ID0gVmFsdWVDb2xvci5Hb29kO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAob0NyaXRpY2FsaXR5LiRFbnVtTWVtYmVyKSB7XG5cdFx0XHRpQ3JpdGljYWxpdHkgPSBvQ3JpdGljYWxpdHkuJEVudW1NZW1iZXI7XG5cdFx0XHRpZiAoaUNyaXRpY2FsaXR5LmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvTmVnYXRpdmVcIikgPiAtMSkge1xuXHRcdFx0XHRzQ3JpdGljYWxpdHkgPSBWYWx1ZUNvbG9yLkVycm9yO1xuXHRcdFx0fSBlbHNlIGlmIChpQ3JpdGljYWxpdHkuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZS9Qb3NpdGl2ZVwiKSA+IC0xKSB7XG5cdFx0XHRcdHNDcml0aWNhbGl0eSA9IFZhbHVlQ29sb3IuR29vZDtcblx0XHRcdH0gZWxzZSBpZiAoaUNyaXRpY2FsaXR5LmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvQ3JpdGljYWxcIikgPiAtMSkge1xuXHRcdFx0XHRzQ3JpdGljYWxpdHkgPSBWYWx1ZUNvbG9yLkNyaXRpY2FsO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cud2FybmluZyhcIkNhc2Ugbm90IHN1cHBvcnRlZCwgcmV0dXJuaW5nIHRoZSBkZWZhdWx0IFZhbHVlIE5ldXRyYWxcIik7XG5cdFx0fVxuXHRcdHJldHVybiBzQ3JpdGljYWxpdHk7XG5cdH1cblx0X2NyaXRpY2FsaXR5Q2FsY3VsYXRpb24oXG5cdFx0c0ltcHJvdmVtZW50RGlyZWN0aW9uOiBzdHJpbmcsXG5cdFx0c1ZhbHVlOiBzdHJpbmcsXG5cdFx0c0RldmlhdGlvbkxvdz86IHN0cmluZyB8IG51bWJlcixcblx0XHRzVG9sZXJhbmNlTG93Pzogc3RyaW5nIHwgbnVtYmVyLFxuXHRcdHNBY2NlcHRhbmNlTG93Pzogc3RyaW5nIHwgbnVtYmVyLFxuXHRcdHNBY2NlcHRhbmNlSGlnaD86IHN0cmluZyB8IG51bWJlcixcblx0XHRzVG9sZXJhbmNlSGlnaD86IHN0cmluZyB8IG51bWJlcixcblx0XHRzRGV2aWF0aW9uSGlnaD86IHN0cmluZyB8IG51bWJlclxuXHQpIHtcblx0XHRsZXQgc0NyaXRpY2FsaXR5RXhwcmVzc2lvbiA9IFZhbHVlQ29sb3IuTmV1dHJhbDsgLy8gRGVmYXVsdCBDcml0aWNhbGl0eSBTdGF0ZVxuXG5cdFx0Ly8gRGVhbGluZyB3aXRoIERlY2ltYWwgYW5kIFBhdGggYmFzZWQgYmluZ2RpbmdzXG5cdFx0c0RldmlhdGlvbkxvdyA9IHNEZXZpYXRpb25Mb3cgPT0gdW5kZWZpbmVkID8gLUluZmluaXR5IDogc0RldmlhdGlvbkxvdztcblx0XHRzVG9sZXJhbmNlTG93ID0gc1RvbGVyYW5jZUxvdyA9PSB1bmRlZmluZWQgPyBzRGV2aWF0aW9uTG93IDogc1RvbGVyYW5jZUxvdztcblx0XHRzQWNjZXB0YW5jZUxvdyA9IHNBY2NlcHRhbmNlTG93ID09IHVuZGVmaW5lZCA/IHNUb2xlcmFuY2VMb3cgOiBzQWNjZXB0YW5jZUxvdztcblx0XHRzRGV2aWF0aW9uSGlnaCA9IHNEZXZpYXRpb25IaWdoID09IHVuZGVmaW5lZCA/IEluZmluaXR5IDogc0RldmlhdGlvbkhpZ2g7XG5cdFx0c1RvbGVyYW5jZUhpZ2ggPSBzVG9sZXJhbmNlSGlnaCA9PSB1bmRlZmluZWQgPyBzRGV2aWF0aW9uSGlnaCA6IHNUb2xlcmFuY2VIaWdoO1xuXHRcdHNBY2NlcHRhbmNlSGlnaCA9IHNBY2NlcHRhbmNlSGlnaCA9PSB1bmRlZmluZWQgPyBzVG9sZXJhbmNlSGlnaCA6IHNBY2NlcHRhbmNlSGlnaDtcblxuXHRcdC8vIENyZWF0aW5nIHJ1bnRpbWUgZXhwcmVzc2lvbiBiaW5kaW5nIGZyb20gY3JpdGljYWxpdHkgY2FsY3VsYXRpb24gZm9yIENyaXRpY2FsaXR5IFN0YXRlXG5cdFx0aWYgKHNJbXByb3ZlbWVudERpcmVjdGlvbi5pbmRleE9mKFwiTWluaW1pemVcIikgPiAtMSkge1xuXHRcdFx0aWYgKHNWYWx1ZSA8PSBzQWNjZXB0YW5jZUhpZ2gpIHtcblx0XHRcdFx0c0NyaXRpY2FsaXR5RXhwcmVzc2lvbiA9IFZhbHVlQ29sb3IuR29vZDtcblx0XHRcdH0gZWxzZSBpZiAoc1ZhbHVlIDw9IHNUb2xlcmFuY2VIaWdoKSB7XG5cdFx0XHRcdHNDcml0aWNhbGl0eUV4cHJlc3Npb24gPSBWYWx1ZUNvbG9yLk5ldXRyYWw7XG5cdFx0XHR9IGVsc2UgaWYgKHNEZXZpYXRpb25IaWdoICYmIHNWYWx1ZSA8PSBzRGV2aWF0aW9uSGlnaCkge1xuXHRcdFx0XHRzQ3JpdGljYWxpdHlFeHByZXNzaW9uID0gVmFsdWVDb2xvci5Dcml0aWNhbDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNDcml0aWNhbGl0eUV4cHJlc3Npb24gPSBWYWx1ZUNvbG9yLkVycm9yO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoc0ltcHJvdmVtZW50RGlyZWN0aW9uLmluZGV4T2YoXCJNYXhpbWl6ZVwiKSA+IC0xKSB7XG5cdFx0XHRpZiAoc1ZhbHVlID49IHNBY2NlcHRhbmNlTG93KSB7XG5cdFx0XHRcdHNDcml0aWNhbGl0eUV4cHJlc3Npb24gPSBWYWx1ZUNvbG9yLkdvb2Q7XG5cdFx0XHR9IGVsc2UgaWYgKHNWYWx1ZSA+PSBzVG9sZXJhbmNlTG93KSB7XG5cdFx0XHRcdHNDcml0aWNhbGl0eUV4cHJlc3Npb24gPSBWYWx1ZUNvbG9yLk5ldXRyYWw7XG5cdFx0XHR9IGVsc2UgaWYgKHNEZXZpYXRpb25IaWdoICYmIHNWYWx1ZSA+PSBzRGV2aWF0aW9uTG93KSB7XG5cdFx0XHRcdHNDcml0aWNhbGl0eUV4cHJlc3Npb24gPSBWYWx1ZUNvbG9yLkNyaXRpY2FsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c0NyaXRpY2FsaXR5RXhwcmVzc2lvbiA9IFZhbHVlQ29sb3IuRXJyb3I7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChzSW1wcm92ZW1lbnREaXJlY3Rpb24uaW5kZXhPZihcIlRhcmdldFwiKSA+IC0xKSB7XG5cdFx0XHRpZiAoc1ZhbHVlIDw9IHNBY2NlcHRhbmNlSGlnaCAmJiBzVmFsdWUgPj0gc0FjY2VwdGFuY2VMb3cpIHtcblx0XHRcdFx0c0NyaXRpY2FsaXR5RXhwcmVzc2lvbiA9IFZhbHVlQ29sb3IuR29vZDtcblx0XHRcdH0gZWxzZSBpZiAoKHNWYWx1ZSA+PSBzVG9sZXJhbmNlTG93ICYmIHNWYWx1ZSA8IHNBY2NlcHRhbmNlTG93KSB8fCAoc1ZhbHVlID4gc0FjY2VwdGFuY2VIaWdoICYmIHNWYWx1ZSA8PSBzVG9sZXJhbmNlSGlnaCkpIHtcblx0XHRcdFx0c0NyaXRpY2FsaXR5RXhwcmVzc2lvbiA9IFZhbHVlQ29sb3IuTmV1dHJhbDtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdChzRGV2aWF0aW9uTG93ICYmIHNWYWx1ZSA+PSBzRGV2aWF0aW9uTG93ICYmIHNWYWx1ZSA8IHNUb2xlcmFuY2VMb3cpIHx8XG5cdFx0XHRcdChzVmFsdWUgPiBzVG9sZXJhbmNlSGlnaCAmJiBzRGV2aWF0aW9uSGlnaCAmJiBzVmFsdWUgPD0gc0RldmlhdGlvbkhpZ2gpXG5cdFx0XHQpIHtcblx0XHRcdFx0c0NyaXRpY2FsaXR5RXhwcmVzc2lvbiA9IFZhbHVlQ29sb3IuQ3JpdGljYWw7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzQ3JpdGljYWxpdHlFeHByZXNzaW9uID0gVmFsdWVDb2xvci5FcnJvcjtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJDYXNlIG5vdCBzdXBwb3J0ZWQsIHJldHVybmluZyB0aGUgZGVmYXVsdCBWYWx1ZSBOZXV0cmFsXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzQ3JpdGljYWxpdHlFeHByZXNzaW9uO1xuXHR9XG5cdF9mb3JtYXREYXRlQW5kTnVtYmVyVmFsdWUodmFsdWU6IGFueSwgaVByZWNpc2lvbjogYW55LCBpU2NhbGU6IGFueSwgc1BhdHRlcm4/OiBhbnkpIHtcblx0XHRpZiAoc1BhdHRlcm4pIHtcblx0XHRcdHJldHVybiB0aGlzLl9nZXRTZW1hbnRpY3NWYWx1ZUZvcm1hdHRlcihzUGF0dGVybikuZm9ybWF0VmFsdWUodmFsdWUsIFwic3RyaW5nXCIpO1xuXHRcdH0gZWxzZSBpZiAoIWlzTmFOKHZhbHVlKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2dldExhYmVsTnVtYmVyRm9ybWF0dGVyKGlQcmVjaXNpb24sIGlTY2FsZSkuZm9ybWF0KHZhbHVlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblx0X2dldFNlbWFudGljc1ZhbHVlRm9ybWF0dGVyKHNQYXR0ZXJuOiBhbnkpIHtcblx0XHRpZiAoIXRoaXMuX29EYXRlVHlwZSkge1xuXHRcdFx0dGhpcy5fb0RhdGVUeXBlID0gbmV3IERhdGVUeXBlKHtcblx0XHRcdFx0c3R5bGU6IFwic2hvcnRcIixcblx0XHRcdFx0c291cmNlOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogc1BhdHRlcm5cblx0XHRcdFx0fVxuXHRcdFx0fSBhcyBhbnkpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fb0RhdGVUeXBlO1xuXHR9XG5cdF9nZXRMYWJlbE51bWJlckZvcm1hdHRlcihpUHJlY2lzaW9uOiBhbnksIGlTY2FsZTogYW55KSB7XG5cdFx0cmV0dXJuIE51bWJlckZvcm1hdC5nZXRGbG9hdEluc3RhbmNlKHtcblx0XHRcdHN0eWxlOiBcInNob3J0XCIsXG5cdFx0XHRzaG93U2NhbGU6IHRydWUsXG5cdFx0XHRwcmVjaXNpb246IHR5cGVvZiBpUHJlY2lzaW9uID09PSBcIm51bWJlclwiID8gaVByZWNpc2lvbiA6IChudWxsIGFzIGFueSksXG5cdFx0XHRkZWNpbWFsczogdHlwZW9mIGlTY2FsZSA9PT0gXCJudW1iZXJcIiA/IGlTY2FsZSA6IChudWxsIGFzIGFueSlcblx0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TUFBTSxJQUFJLENBQUN1RixLQUFLLENBQUN2RixLQUFLLENBQUMsRUFBRTtRQUN6QixPQUFPLElBQUksQ0FBQ3dGLHdCQUF3QixDQUFDTixVQUFVLEVBQUVDLE1BQU0sQ0FBQyxDQUFDTSxNQUFNLENBQUN6RixLQUFLLENBQUM7TUFDdkU7TUFFQSxPQUFPQSxLQUFLO0lBQ2IsQ0FBQztJQUFBLE9BQ0RxRiwyQkFBMkIsR0FBM0IscUNBQTRCRCxRQUFhLEVBQUU7TUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQ00sVUFBVSxFQUFFO1FBQ3JCLElBQUksQ0FBQ0EsVUFBVSxHQUFHLElBQUlDLFFBQVEsQ0FBQztVQUM5QkMsS0FBSyxFQUFFLE9BQU87VUFDZEMsTUFBTSxFQUFFO1lBQ1BDLE9BQU8sRUFBRVY7VUFDVjtRQUNELENBQUMsQ0FBUTtNQUNWO01BQ0EsT0FBTyxJQUFJLENBQUNNLFVBQVU7SUFDdkIsQ0FBQztJQUFBLE9BQ0RGLHdCQUF3QixHQUF4QixrQ0FBeUJOLFVBQWUsRUFBRUMsTUFBVyxFQUFFO01BQ3RELE9BQU9ZLFlBQVksQ0FBQ0MsZ0JBQWdCLENBQUM7UUFDcENKLEtBQUssRUFBRSxPQUFPO1FBQ2RLLFNBQVMsRUFBRSxJQUFJO1FBQ2ZDLFNBQVMsRUFBRSxPQUFPaEIsVUFBVSxLQUFLLFFBQVEsR0FBR0EsVUFBVSxHQUFJLElBQVk7UUFDdEVpQixRQUFRLEVBQUUsT0FBT2hCLE1BQU0sS0FBSyxRQUFRLEdBQUdBLE1BQU0sR0FBSTtNQUNsRCxDQUFDLENBQUM7SUFDSCxDQUFDO0lBQUE7RUFBQSxFQXpkZ0NpQixPQUFPO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9BNGQxQjNMLG1CQUFtQjtBQUFBIn0=