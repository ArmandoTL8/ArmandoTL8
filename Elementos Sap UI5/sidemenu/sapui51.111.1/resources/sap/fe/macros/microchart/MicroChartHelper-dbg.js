/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/macros/CommonHelper", "sap/m/library", "sap/ui/core/format/DateFormat"], function (Log, CommonHelper, mobilelibrary, DateFormat) {
  "use strict";

  const ValueColor = mobilelibrary.ValueColor;
  const calendarPatternMap = {
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
    getThresholdColor: function (sValue, iContext) {
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
    getMeasurePropertyPaths: function (oChartAnnotations, oEntityTypeAnnotations, sChartType) {
      const aPropertyPath = [];
      if (!oEntityTypeAnnotations) {
        Log.warning("FE:Macro:MicroChart : Couldn't find annotations for the DataPoint.");
        return undefined;
      }
      oChartAnnotations.Measures.forEach(function (sMeasure, iMeasure) {
        const iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(iMeasure, oChartAnnotations),
          oMeasureAttribute = iMeasureAttribute > -1 && oChartAnnotations.MeasureAttributes && oChartAnnotations.MeasureAttributes[iMeasureAttribute],
          oDataPoint = oMeasureAttribute && oEntityTypeAnnotations && oEntityTypeAnnotations[oMeasureAttribute.DataPoint.$AnnotationPath];
        if (oDataPoint && oDataPoint.Value && oDataPoint.Value.$Path) {
          aPropertyPath.push(oDataPoint.Value.$Path);
        } else {
          Log.warning(`FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute ${sChartType} MicroChart.`);
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
    getHiddenPathExpression: function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (!args[0] && !args[1]) {
        return true;
      } else if (args[0] === true || args[1] === true) {
        return false;
      } else {
        const hiddenPaths = [];
        [].forEach.call(args, function (hiddenProperty) {
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
    isNotAlwaysHidden: function (chartType, sValue, sMaxValue, sValueHidden, sMaxValueHidden) {
      if (sValueHidden === true) {
        this.logError(chartType, sValue);
      }
      if (sMaxValueHidden === true) {
        this.logError(chartType, sMaxValue);
      }
      if (sValueHidden === undefined && sMaxValueHidden === undefined) {
        return true;
      } else {
        return (!sValueHidden || sValueHidden.$Path) && sValueHidden !== undefined || (!sMaxValueHidden || sMaxValueHidden.$Path) && sMaxValueHidden !== undefined ? true : false;
      }
    },
    /**
     * This function is to log errors for missing datapoint properties.
     *
     * @param chartType The chart type.
     * @param sValue Dynamic hidden property name.
     */
    logError: function (chartType, sValue) {
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
    formatDecimal: function (sPath, oProperty, iFractionDigits) {
      const aConstraints = [],
        aFormatOptions = ["style: 'short'"];
      let sScale;
      if (typeof iFractionDigits === "number") {
        sScale = iFractionDigits;
      } else {
        sScale = oProperty && oProperty.$Scale || 1;
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
        sBinding = "{ path: '" + sPath + "'" + ", type: 'sap.ui.model.odata.type.Decimal', constraints: { " + aConstraints.join(",") + " }, formatOptions: { " + aFormatOptions.join(",") + " } }";
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
    getSelectParameters: function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
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
    getDataPointQualifiersForMeasures: function (oChartAnnotations, oEntityTypeAnnotations, sChartType) {
      const aQualifers = [],
        aMeasureAttributes = oChartAnnotations.MeasureAttributes,
        fnAddDataPointQualifier = function (oMeasure) {
          const sMeasure = oMeasure.$PropertyPath;
          let sQualifer;
          aMeasureAttributes.forEach(function (oMeasureAttribute) {
            if (oEntityTypeAnnotations && (oMeasureAttribute && oMeasureAttribute.Measure && oMeasureAttribute.Measure.$PropertyPath) === sMeasure && oMeasureAttribute.DataPoint && oMeasureAttribute.DataPoint.$AnnotationPath) {
              const sAnnotationPath = oMeasureAttribute.DataPoint.$AnnotationPath;
              if (oEntityTypeAnnotations[sAnnotationPath]) {
                sQualifer = sAnnotationPath.indexOf("#") ? sAnnotationPath.split("#")[1] : "";
                aQualifers.push(sQualifer);
              }
            }
          });
          if (sQualifer === undefined) {
            Log.warning(`FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute for ${sChartType} MicroChart.`);
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
    logWarning: function (sChart, oError) {
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
    getDisplayValueForMicroChart: function (oDataPoint, oPathText, oValueTextPath, oValueDataPointPath) {
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
    shouldMicroChartRender: function (sChartType, oDataPoint, oDataPointValue, oChartAnnotations, oDatapointMaxValue) {
      const aChartTypes = ["Area", "Column", "Comparison"],
        sDataPointValue = oDataPoint && oDataPoint.Value,
        sHiddenPath = oDataPointValue && oDataPointValue["com.sap.vocabularies.UI.v1.Hidden"],
        sChartAnnotationDimension = oChartAnnotations && oChartAnnotations.Dimensions && oChartAnnotations.Dimensions[0],
        oFinalDataPointValue = aChartTypes.indexOf(sChartType) > -1 ? sDataPointValue && sChartAnnotationDimension : sDataPointValue; // only for three charts in array
      if (sChartType === "Harvey") {
        const oDataPointMaximumValue = oDataPoint && oDataPoint.MaximumValue,
          sMaxValueHiddenPath = oDatapointMaxValue && oDatapointMaxValue["com.sap.vocabularies.UI.v1.Hidden"];
        return sDataPointValue && oDataPointMaximumValue && MicroChartHelper.isNotAlwaysHidden("Bullet", sDataPointValue, oDataPointMaximumValue, sHiddenPath, sMaxValueHiddenPath);
      }
      return oFinalDataPointValue && MicroChartHelper.isNotAlwaysHidden(sChartType, sDataPointValue, undefined, sHiddenPath);
    },
    /**
     * This function is used to get dataPointQualifiers for Column, Comparison and StackedBar micro charts.
     *
     * @param sUiName
     * @returns Result string or undefined.
     */
    getdataPointQualifiersForMicroChart: function (sUiName) {
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
    getcolorPaletteForMicroChart: function (oDataPoint) {
      return oDataPoint.Criticality ? undefined : "sapUiChartPaletteQualitativeHue1, sapUiChartPaletteQualitativeHue2, sapUiChartPaletteQualitativeHue3,          sapUiChartPaletteQualitativeHue4, sapUiChartPaletteQualitativeHue5, sapUiChartPaletteQualitativeHue6, sapUiChartPaletteQualitativeHue7,          sapUiChartPaletteQualitativeHue8, sapUiChartPaletteQualitativeHue9, sapUiChartPaletteQualitativeHue10, sapUiChartPaletteQualitativeHue11";
    },
    /**
     * This function is used to get MeasureScale for Area, Column and Line micro charts.
     *
     * @param oDataPoint Data point object.
     * @returns Datapoint valueformat or datapoint scale or 1.
     */
    getMeasureScaleForMicroChart: function (oDataPoint) {
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
    getBindingExpressionForMicrochart: function (sChartType, oMeasure, oThis, oCollection, sUiName, oDataPoint) {
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
    getUOMPathForMicrochart: function (bShowOnlyChart, oMeasure) {
      let bResult;
      if (oMeasure && !bShowOnlyChart) {
        bResult = oMeasure["@Org.OData.Measures.V1.ISOCurrency"] && oMeasure["@Org.OData.Measures.V1.ISOCurrency"].$Path || oMeasure["@Org.OData.Measures.V1.Unit"] && oMeasure["@Org.OData.Measures.V1.Unit"].$Path;
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
    getAggregationForMicrochart: function (sAggregationType, oCollection, oDataPoint, sUiName, oDimension, oMeasure, sMeasureOrDimensionBar) {
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
      const sFunctionValue = MicroChartHelper.getSelectParameters(sGroupId, sDataPointCriticallityCalc, sDataPointCriticallity, sCurrencyOrUnit, sTargetValuePath, sDimensionPropertyPath, sMeasureOrDimensionBar),
        sAggregationExpression = `{path:'${sPath}'` + `, parameters : {${sFunctionValue}} }`;
      return sAggregationExpression;
    },
    getCurrencyOrUnit: function (oMeasure) {
      if (oMeasure["@Org.OData.Measures.V1.ISOCurrency"]) {
        return oMeasure["@Org.OData.Measures.V1.ISOCurrency"].$Path || oMeasure["@Org.OData.Measures.V1.ISOCurrency"];
      } else if (oMeasure["@Org.OData.Measures.V1.Unit"]) {
        return oMeasure["@Org.OData.Measures.V1.Unit"].$Path || oMeasure["@Org.OData.Measures.V1.Unit"];
      } else {
        return "";
      }
    },
    getCalendarPattern: function (oAnnotations) {
      return oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarYear"] && "yyyy" || oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarQuarter"] && "Q" || oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarMonth"] && "MM" || oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarWeek"] && "ww" || oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarDate"] && "yyyyMMdd" || oAnnotations["@com.sap.vocabularies.Common.v1.IsCalendarYearMonth"] && "yyyyMM";
    },
    formatDimension: function (sDate, sPattern, sPropertyPath) {
      const fValue = DateFormat.getDateInstance({
        pattern: sPattern
      }).parse(sDate, false, true);
      if (fValue instanceof Date) {
        return parseFloat(fValue.getTime());
      } else {
        Log.warning("Date value could not be determined for " + sPropertyPath);
      }
      return 0;
    },
    formatDateDimension: function (sDate) {
      return MicroChartHelper.formatDimension(sDate, "yyyy-MM-dd", "");
    },
    formatStringDimension: function (sValue, sPattern, sPropertyPath) {
      const sMatchedValue = sValue && sValue.toString().match(calendarPatternMap[sPattern]);
      if (sMatchedValue && sMatchedValue.length) {
        return MicroChartHelper.formatDimension(sMatchedValue[0], sPattern, sPropertyPath);
      } else {
        Log.warning("Pattern not supported for " + sPropertyPath);
      }
      return 0;
    },
    getX: function (sPropertyPath, sType, oAnnotations) {
      if (sType === "Edm.Date") {
        //TODO: Check why formatter is not getting called
        return "{parts: [{path: '" + sPropertyPath + "', type: 'sap.ui.model.odata.type.String'}, {value: '" + sPropertyPath + "'}], formatter: 'MICROCHARTR.formatStringDimension'}";
      } else if (sType === "Edm.String") {
        const sPattern = oAnnotations && MicroChartHelper.getCalendarPattern(oAnnotations);
        if (sPattern) {
          return "{parts: [{path: '" + sPropertyPath + "', type: 'sap.ui.model.odata.type.String'}, {value: '" + sPattern + "'}, {value: '" + sPropertyPath + "'}], formatter: 'MICROCHARTR.formatStringDimension'}";
        }
      }
    }
  };
  return MicroChartHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUNvbG9yIiwibW9iaWxlbGlicmFyeSIsImNhbGVuZGFyUGF0dGVybk1hcCIsInl5eXkiLCJSZWdFeHAiLCJRIiwiTU0iLCJ3dyIsInl5eXlNTWRkIiwieXl5eU1NIiwiTWljcm9DaGFydEhlbHBlciIsImdldFRocmVzaG9sZENvbG9yIiwic1ZhbHVlIiwiaUNvbnRleHQiLCJvQ29udGV4dCIsImNvbnRleHQiLCJzUGF0aCIsImdldFBhdGgiLCJzVGhyZXNob2xkQ29sb3IiLCJOZXV0cmFsIiwiaW5kZXhPZiIsIkVycm9yIiwiQ3JpdGljYWwiLCJnZXRNZWFzdXJlUHJvcGVydHlQYXRocyIsIm9DaGFydEFubm90YXRpb25zIiwib0VudGl0eVR5cGVBbm5vdGF0aW9ucyIsInNDaGFydFR5cGUiLCJhUHJvcGVydHlQYXRoIiwiTG9nIiwid2FybmluZyIsInVuZGVmaW5lZCIsIk1lYXN1cmVzIiwiZm9yRWFjaCIsInNNZWFzdXJlIiwiaU1lYXN1cmUiLCJpTWVhc3VyZUF0dHJpYnV0ZSIsIkNvbW1vbkhlbHBlciIsImdldE1lYXN1cmVBdHRyaWJ1dGVJbmRleCIsIm9NZWFzdXJlQXR0cmlidXRlIiwiTWVhc3VyZUF0dHJpYnV0ZXMiLCJvRGF0YVBvaW50IiwiRGF0YVBvaW50IiwiJEFubm90YXRpb25QYXRoIiwiVmFsdWUiLCIkUGF0aCIsInB1c2giLCJqb2luIiwiZ2V0SGlkZGVuUGF0aEV4cHJlc3Npb24iLCJhcmdzIiwiaGlkZGVuUGF0aHMiLCJjYWxsIiwiaGlkZGVuUHJvcGVydHkiLCJpc05vdEFsd2F5c0hpZGRlbiIsImNoYXJ0VHlwZSIsInNNYXhWYWx1ZSIsInNWYWx1ZUhpZGRlbiIsInNNYXhWYWx1ZUhpZGRlbiIsImxvZ0Vycm9yIiwiZXJyb3IiLCJmb3JtYXREZWNpbWFsIiwib1Byb3BlcnR5IiwiaUZyYWN0aW9uRGlnaXRzIiwiYUNvbnN0cmFpbnRzIiwiYUZvcm1hdE9wdGlvbnMiLCJzU2NhbGUiLCIkU2NhbGUiLCJzQmluZGluZyIsIiROdWxsYWJsZSIsIiRQcmVjaXNpb24iLCJnZXRTZWxlY3RQYXJhbWV0ZXJzIiwib0NDIiwiYVBhcmFtZXRlcnMiLCJrIiwiJEVudW1NZW1iZXIiLCJpIiwibGVuZ3RoIiwiZ2V0RGF0YVBvaW50UXVhbGlmaWVyc0Zvck1lYXN1cmVzIiwiYVF1YWxpZmVycyIsImFNZWFzdXJlQXR0cmlidXRlcyIsImZuQWRkRGF0YVBvaW50UXVhbGlmaWVyIiwib01lYXN1cmUiLCIkUHJvcGVydHlQYXRoIiwic1F1YWxpZmVyIiwiTWVhc3VyZSIsInNBbm5vdGF0aW9uUGF0aCIsInNwbGl0IiwibG9nV2FybmluZyIsInNDaGFydCIsIm9FcnJvciIsInNLZXkiLCJnZXREaXNwbGF5VmFsdWVGb3JNaWNyb0NoYXJ0Iiwib1BhdGhUZXh0Iiwib1ZhbHVlVGV4dFBhdGgiLCJvVmFsdWVEYXRhUG9pbnRQYXRoIiwic1ZhbHVlRm9ybWF0IiwiVmFsdWVGb3JtYXQiLCJOdW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMiLCJzUmVzdWx0Iiwic2hvdWxkTWljcm9DaGFydFJlbmRlciIsIm9EYXRhUG9pbnRWYWx1ZSIsIm9EYXRhcG9pbnRNYXhWYWx1ZSIsImFDaGFydFR5cGVzIiwic0RhdGFQb2ludFZhbHVlIiwic0hpZGRlblBhdGgiLCJzQ2hhcnRBbm5vdGF0aW9uRGltZW5zaW9uIiwiRGltZW5zaW9ucyIsIm9GaW5hbERhdGFQb2ludFZhbHVlIiwib0RhdGFQb2ludE1heGltdW1WYWx1ZSIsIk1heGltdW1WYWx1ZSIsInNNYXhWYWx1ZUhpZGRlblBhdGgiLCJnZXRkYXRhUG9pbnRRdWFsaWZpZXJzRm9yTWljcm9DaGFydCIsInNVaU5hbWUiLCJnZXRjb2xvclBhbGV0dGVGb3JNaWNyb0NoYXJ0IiwiQ3JpdGljYWxpdHkiLCJnZXRNZWFzdXJlU2NhbGVGb3JNaWNyb0NoYXJ0IiwiZ2V0QmluZGluZ0V4cHJlc3Npb25Gb3JNaWNyb2NoYXJ0Iiwib1RoaXMiLCJvQ29sbGVjdGlvbiIsImJDb25kaXRpb24iLCJzQ3VycmVuY3lPclVuaXQiLCJnZXRVT01QYXRoRm9yTWljcm9jaGFydCIsInNEYXRhUG9pbnRDcml0aWNhbGxpdHkiLCJzRnVuY3Rpb25WYWx1ZSIsImJhdGNoR3JvdXBJZCIsImJTaG93T25seUNoYXJ0IiwiYlJlc3VsdCIsImdldEFnZ3JlZ2F0aW9uRm9yTWljcm9jaGFydCIsInNBZ2dyZWdhdGlvblR5cGUiLCJvRGltZW5zaW9uIiwic01lYXN1cmVPckRpbWVuc2lvbkJhciIsInNHcm91cElkIiwic0RhdGFQb2ludENyaXRpY2FsbGl0eUNhbGMiLCJzVGFyZ2V0VmFsdWVQYXRoIiwic0RpbWVuc2lvblByb3BlcnR5UGF0aCIsIkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24iLCJUYXJnZXRWYWx1ZSIsInNBZ2dyZWdhdGlvbkV4cHJlc3Npb24iLCJnZXRDdXJyZW5jeU9yVW5pdCIsImdldENhbGVuZGFyUGF0dGVybiIsIm9Bbm5vdGF0aW9ucyIsImZvcm1hdERpbWVuc2lvbiIsInNEYXRlIiwic1BhdHRlcm4iLCJzUHJvcGVydHlQYXRoIiwiZlZhbHVlIiwiRGF0ZUZvcm1hdCIsImdldERhdGVJbnN0YW5jZSIsInBhdHRlcm4iLCJwYXJzZSIsIkRhdGUiLCJwYXJzZUZsb2F0IiwiZ2V0VGltZSIsImZvcm1hdERhdGVEaW1lbnNpb24iLCJmb3JtYXRTdHJpbmdEaW1lbnNpb24iLCJzTWF0Y2hlZFZhbHVlIiwidG9TdHJpbmciLCJtYXRjaCIsImdldFgiLCJzVHlwZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWljcm9DaGFydEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgbW9iaWxlbGlicmFyeSBmcm9tIFwic2FwL20vbGlicmFyeVwiO1xuaW1wb3J0IERhdGVGb3JtYXQgZnJvbSBcInNhcC91aS9jb3JlL2Zvcm1hdC9EYXRlRm9ybWF0XCI7XG5cbmNvbnN0IFZhbHVlQ29sb3IgPSBtb2JpbGVsaWJyYXJ5LlZhbHVlQ29sb3I7XG5jb25zdCBjYWxlbmRhclBhdHRlcm5NYXA6IGFueSA9IHtcblx0eXl5eTogbmV3IFJlZ0V4cChcIlsxLTldWzAtOV17Myx9fDBbMC05XXszfVwiKSxcblx0UTogbmV3IFJlZ0V4cChcIlsxLTRdXCIpLFxuXHRNTTogbmV3IFJlZ0V4cChcIjBbMS05XXwxWzAtMl1cIiksXG5cdHd3OiBuZXcgUmVnRXhwKFwiMFsxLTldfFsxLTRdWzAtOV18NVswLTNdXCIpLFxuXHR5eXl5TU1kZDogbmV3IFJlZ0V4cChcIihbMS05XVswLTldezMsfXwwWzAtOV17M30pKDBbMS05XXwxWzAtMl0pKDBbMS05XXxbMTJdWzAtOV18M1swMV0pXCIpLFxuXHR5eXl5TU06IG5ldyBSZWdFeHAoXCIoWzEtOV1bMC05XXszLH18MFswLTldezN9KSgwWzEtOV18MVswLTJdKVwiKVxufTtcbi8qKlxuICogSGVscGVyIGNsYXNzIHVzZWQgYnkgTURDX0NvbnRyb2xzIHRvIGhhbmRsZSBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIE9EYXRhIFY0XG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgaW50ZXJuYWwvZXhwZXJpbWVudGFsIHVzZSFcbiAqL1xuY29uc3QgTWljcm9DaGFydEhlbHBlciA9IHtcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgVGhyZXNob2xkIENvbG9yIGZvciBidWxsZXQgbWljcm8gY2hhcnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzVmFsdWUgVGhyZXNob2xkIHZhbHVlIHByb3ZpZGVkIGluIHRoZSBhbm5vdGF0aW9uc1xuXHQgKiBAcGFyYW0gaUNvbnRleHQgSW50ZXJmYWNlQ29udGV4dCB3aXRoIHBhdGggdG8gdGhlIHRocmVzaG9sZFxuXHQgKiBAcmV0dXJucyBUaGUgaW5kaWNhdG9yIGZvciBUaHJlc2hvbGQgQ29sb3Jcblx0ICovXG5cdGdldFRocmVzaG9sZENvbG9yOiBmdW5jdGlvbiAoc1ZhbHVlOiBzdHJpbmcsIGlDb250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IGlDb250ZXh0LmNvbnRleHQ7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0bGV0IHNUaHJlc2hvbGRDb2xvciA9IFZhbHVlQ29sb3IuTmV1dHJhbDtcblxuXHRcdGlmIChzUGF0aC5pbmRleE9mKFwiRGV2aWF0aW9uUmFuZ2VcIikgPiAtMSkge1xuXHRcdFx0c1RocmVzaG9sZENvbG9yID0gVmFsdWVDb2xvci5FcnJvcjtcblx0XHR9IGVsc2UgaWYgKHNQYXRoLmluZGV4T2YoXCJUb2xlcmFuY2VSYW5nZVwiKSA+IC0xKSB7XG5cdFx0XHRzVGhyZXNob2xkQ29sb3IgPSBWYWx1ZUNvbG9yLkNyaXRpY2FsO1xuXHRcdH1cblx0XHRyZXR1cm4gc1RocmVzaG9sZENvbG9yO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUbyBmZXRjaCBtZWFzdXJlcyBmcm9tIERhdGFQb2ludHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ2hhcnRBbm5vdGF0aW9ucyBDaGFydCBBbm5vdGF0aW9uc1xuXHQgKiBAcGFyYW0gb0VudGl0eVR5cGVBbm5vdGF0aW9ucyBFbnRpdHlUeXBlIEFubm90YXRpb25zXG5cdCAqIEBwYXJhbSBzQ2hhcnRUeXBlIENoYXJ0IFR5cGUgdXNlZFxuXHQgKiBAcmV0dXJucyBDb250YWluaW5nIGFsbCBtZWFzdXJlcy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldE1lYXN1cmVQcm9wZXJ0eVBhdGhzOiBmdW5jdGlvbiAob0NoYXJ0QW5ub3RhdGlvbnM6IGFueSwgb0VudGl0eVR5cGVBbm5vdGF0aW9uczogYW55LCBzQ2hhcnRUeXBlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBhUHJvcGVydHlQYXRoOiBhbnlbXSA9IFtdO1xuXG5cdFx0aWYgKCFvRW50aXR5VHlwZUFubm90YXRpb25zKSB7XG5cdFx0XHRMb2cud2FybmluZyhcIkZFOk1hY3JvOk1pY3JvQ2hhcnQgOiBDb3VsZG4ndCBmaW5kIGFubm90YXRpb25zIGZvciB0aGUgRGF0YVBvaW50LlwiKTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0b0NoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZXMuZm9yRWFjaChmdW5jdGlvbiAoc01lYXN1cmU6IGFueSwgaU1lYXN1cmU6IGFueSkge1xuXHRcdFx0Y29uc3QgaU1lYXN1cmVBdHRyaWJ1dGUgPSBDb21tb25IZWxwZXIuZ2V0TWVhc3VyZUF0dHJpYnV0ZUluZGV4KGlNZWFzdXJlLCBvQ2hhcnRBbm5vdGF0aW9ucyksXG5cdFx0XHRcdG9NZWFzdXJlQXR0cmlidXRlID1cblx0XHRcdFx0XHRpTWVhc3VyZUF0dHJpYnV0ZSA+IC0xICYmIG9DaGFydEFubm90YXRpb25zLk1lYXN1cmVBdHRyaWJ1dGVzICYmIG9DaGFydEFubm90YXRpb25zLk1lYXN1cmVBdHRyaWJ1dGVzW2lNZWFzdXJlQXR0cmlidXRlXSxcblx0XHRcdFx0b0RhdGFQb2ludCA9XG5cdFx0XHRcdFx0b01lYXN1cmVBdHRyaWJ1dGUgJiYgb0VudGl0eVR5cGVBbm5vdGF0aW9ucyAmJiBvRW50aXR5VHlwZUFubm90YXRpb25zW29NZWFzdXJlQXR0cmlidXRlLkRhdGFQb2ludC4kQW5ub3RhdGlvblBhdGhdO1xuXHRcdFx0aWYgKG9EYXRhUG9pbnQgJiYgb0RhdGFQb2ludC5WYWx1ZSAmJiBvRGF0YVBvaW50LlZhbHVlLiRQYXRoKSB7XG5cdFx0XHRcdGFQcm9wZXJ0eVBhdGgucHVzaChvRGF0YVBvaW50LlZhbHVlLiRQYXRoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcdGBGRTpNYWNybzpNaWNyb0NoYXJ0IDogQ291bGRuJ3QgZmluZCBEYXRhUG9pbnQoVmFsdWUpIG1lYXN1cmUgZm9yIHRoZSBtZWFzdXJlQXR0cmlidXRlICR7c0NoYXJ0VHlwZX0gTWljcm9DaGFydC5gXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gYVByb3BlcnR5UGF0aC5qb2luKFwiLFwiKTtcblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSB2aXNpYmxlIGV4cHJlc3Npb24gcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIGFyZ3Ncblx0ICogQHJldHVybnMgRXhwcmVzc2lvbiBCaW5kaW5nIGZvciB0aGUgdmlzaWJsZS5cblx0ICovXG5cdGdldEhpZGRlblBhdGhFeHByZXNzaW9uOiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcblx0XHRpZiAoIWFyZ3NbMF0gJiYgIWFyZ3NbMV0pIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZSBpZiAoYXJnc1swXSA9PT0gdHJ1ZSB8fCBhcmdzWzFdID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGhpZGRlblBhdGhzOiBhbnlbXSA9IFtdO1xuXHRcdFx0W10uZm9yRWFjaC5jYWxsKGFyZ3MsIGZ1bmN0aW9uIChoaWRkZW5Qcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdGlmIChoaWRkZW5Qcm9wZXJ0eSAmJiBoaWRkZW5Qcm9wZXJ0eS4kUGF0aCkge1xuXHRcdFx0XHRcdGhpZGRlblBhdGhzLnB1c2goXCIle1wiICsgaGlkZGVuUHJvcGVydHkuJFBhdGggKyBcIn1cIik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIFwiez0gXCIgKyBoaWRkZW5QYXRocy5qb2luKFwiIHx8IFwiKSArIFwiID09PSB0cnVlID8gZmFsc2UgOiB0cnVlIH1cIjtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgdHJ1ZS9mYWxzZSB0byBkaXNwbGF5IGNoYXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gY2hhcnRUeXBlIFRoZSBjaGFydCB0eXBlXG5cdCAqIEBwYXJhbSBzVmFsdWUgRGF0YXBvaW50IHZhbHVlIG9mIFZhbHVlXG5cdCAqIEBwYXJhbSBzTWF4VmFsdWUgRGF0YXBvaW50IHZhbHVlIG9mIE1heGltdW1WYWx1ZVxuXHQgKiBAcGFyYW0gc1ZhbHVlSGlkZGVuIEhpZGRlbiBwYXRoIG9iamVjdC9ib29sZWFuIHZhbHVlIGZvciB0aGUgcmVmZXJyZW5jZWQgcHJvcGVydHkgb2YgdmFsdWVcblx0ICogQHBhcmFtIHNNYXhWYWx1ZUhpZGRlbiBIaWRkZW4gcGF0aCBvYmplY3QvYm9vbGVhbiB2YWx1ZSBmb3IgdGhlIHJlZmVycmVuY2VkIHByb3BlcnR5IG9mIE1heFZhbHVlXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBvciBgZmFsc2VgIHRvIGhpZGUvc2hvdyBjaGFydFxuXHQgKi9cblx0aXNOb3RBbHdheXNIaWRkZW46IGZ1bmN0aW9uIChcblx0XHRjaGFydFR5cGU6IHN0cmluZyxcblx0XHRzVmFsdWU6IG9iamVjdCxcblx0XHRzTWF4VmFsdWU6IG9iamVjdCB8IHVuZGVmaW5lZCxcblx0XHRzVmFsdWVIaWRkZW46IGJvb2xlYW4gfCBhbnksXG5cdFx0c01heFZhbHVlSGlkZGVuPzogYm9vbGVhbiB8IGFueVxuXHQpIHtcblx0XHRpZiAoc1ZhbHVlSGlkZGVuID09PSB0cnVlKSB7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGNoYXJ0VHlwZSwgc1ZhbHVlKTtcblx0XHR9XG5cdFx0aWYgKHNNYXhWYWx1ZUhpZGRlbiA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhpcy5sb2dFcnJvcihjaGFydFR5cGUsIHNNYXhWYWx1ZSk7XG5cdFx0fVxuXHRcdGlmIChzVmFsdWVIaWRkZW4gPT09IHVuZGVmaW5lZCAmJiBzTWF4VmFsdWVIaWRkZW4gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAoKCFzVmFsdWVIaWRkZW4gfHwgc1ZhbHVlSGlkZGVuLiRQYXRoKSAmJiBzVmFsdWVIaWRkZW4gIT09IHVuZGVmaW5lZCkgfHxcblx0XHRcdFx0KCghc01heFZhbHVlSGlkZGVuIHx8IHNNYXhWYWx1ZUhpZGRlbi4kUGF0aCkgJiYgc01heFZhbHVlSGlkZGVuICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdD8gdHJ1ZVxuXHRcdFx0XHQ6IGZhbHNlO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB0byBsb2cgZXJyb3JzIGZvciBtaXNzaW5nIGRhdGFwb2ludCBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gY2hhcnRUeXBlIFRoZSBjaGFydCB0eXBlLlxuXHQgKiBAcGFyYW0gc1ZhbHVlIER5bmFtaWMgaGlkZGVuIHByb3BlcnR5IG5hbWUuXG5cdCAqL1xuXHRsb2dFcnJvcjogZnVuY3Rpb24gKGNoYXJ0VHlwZTogc3RyaW5nLCBzVmFsdWU6IGFueSkge1xuXHRcdExvZy5lcnJvcihgTWVhc3VyZSBQcm9wZXJ0eSAke3NWYWx1ZS4kUGF0aH0gaXMgaGlkZGVuIGZvciB0aGUgJHtjaGFydFR5cGV9IE1pY3JvIENoYXJ0YCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgZm9ybWF0dGVkIHZhbHVlIHdpdGggc2NhbGUgZmFjdG9yIGZvciB0aGUgdmFsdWUgZGlzcGxheWVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggUHJvcGVydHlwYXRoIGZvciB0aGUgdmFsdWVcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgUHJvcGVydHkgZm9yIGNvbnN0cmFpbnRzXG5cdCAqIEBwYXJhbSBpRnJhY3Rpb25EaWdpdHMgTm8uIG9mIGZyYWN0aW9uIGRpZ2l0cyBzcGVjaWZpZWQgZnJvbSBhbm5vdGF0aW9uc1xuXHQgKiBAcmV0dXJucyBFeHByZXNzaW9uIEJpbmRpbmcgZm9yIHRoZSB2YWx1ZSB3aXRoIHNjYWxlLlxuXHQgKi9cblx0Zm9ybWF0RGVjaW1hbDogZnVuY3Rpb24gKHNQYXRoOiBzdHJpbmcsIG9Qcm9wZXJ0eTogYW55LCBpRnJhY3Rpb25EaWdpdHM6IG51bWJlcikge1xuXHRcdGNvbnN0IGFDb25zdHJhaW50cyA9IFtdLFxuXHRcdFx0YUZvcm1hdE9wdGlvbnMgPSBbXCJzdHlsZTogJ3Nob3J0J1wiXTtcblx0XHRsZXQgc1NjYWxlO1xuXHRcdGlmICh0eXBlb2YgaUZyYWN0aW9uRGlnaXRzID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHRzU2NhbGUgPSBpRnJhY3Rpb25EaWdpdHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNTY2FsZSA9IChvUHJvcGVydHkgJiYgb1Byb3BlcnR5LiRTY2FsZSkgfHwgMTtcblx0XHR9XG5cdFx0bGV0IHNCaW5kaW5nO1xuXG5cdFx0aWYgKHNQYXRoKSB7XG5cdFx0XHRpZiAob1Byb3BlcnR5LiROdWxsYWJsZSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0YUNvbnN0cmFpbnRzLnB1c2goXCJudWxsYWJsZTogXCIgKyBvUHJvcGVydHkuJE51bGxhYmxlKTtcblx0XHRcdH1cblx0XHRcdGlmIChvUHJvcGVydHkuJFByZWNpc2lvbiAhPSB1bmRlZmluZWQpIHtcblx0XHRcdFx0YUZvcm1hdE9wdGlvbnMucHVzaChcInByZWNpc2lvbjogXCIgKyAob1Byb3BlcnR5LiRQcmVjaXNpb24gPyBvUHJvcGVydHkuJFByZWNpc2lvbiA6IFwiMVwiKSk7XG5cdFx0XHR9XG5cdFx0XHRhQ29uc3RyYWludHMucHVzaChcInNjYWxlOiBcIiArIChzU2NhbGUgPT09IFwidmFyaWFibGVcIiA/IFwiJ1wiICsgc1NjYWxlICsgXCInXCIgOiBzU2NhbGUpKTtcblxuXHRcdFx0c0JpbmRpbmcgPVxuXHRcdFx0XHRcInsgcGF0aDogJ1wiICtcblx0XHRcdFx0c1BhdGggK1xuXHRcdFx0XHRcIidcIiArXG5cdFx0XHRcdFwiLCB0eXBlOiAnc2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRGVjaW1hbCcsIGNvbnN0cmFpbnRzOiB7IFwiICtcblx0XHRcdFx0YUNvbnN0cmFpbnRzLmpvaW4oXCIsXCIpICtcblx0XHRcdFx0XCIgfSwgZm9ybWF0T3B0aW9uczogeyBcIiArXG5cdFx0XHRcdGFGb3JtYXRPcHRpb25zLmpvaW4oXCIsXCIpICtcblx0XHRcdFx0XCIgfSB9XCI7XG5cdFx0fVxuXHRcdHJldHVybiBzQmluZGluZztcblx0fSxcblxuXHQvKipcblx0ICogVG8gZmV0Y2ggc2VsZWN0IHBhcmFtZXRlcnMgZnJvbSBhbm5vdGF0aW9ucyB0aGF0IG5lZWQgdG8gYmUgYWRkZWQgdG8gdGhlIGxpc3QgYmluZGluZy5cblx0ICpcblx0ICogQHBhcmFtIGFyZ3MgVGhlIHNlbGVjdCBwYXJhbWV0ZXJcblx0ICogcGFyYW0ge3N0cmluZ30gc0dyb3VwSWQgZ3JvdXBJZCB0byBiZSB1c2VkKG9wdGlvbmFsKVxuXHQgKiBwYXJhbSB7c3RyaW5nfSBzVW9NUGF0aCB1bml0IG9mIG1lYXN1cmUgcGF0aFxuXHQgKiBwYXJhbSB7c3RyaW5nfSBvQ3JpdGljYWxpdHkgY3JpdGljYWxpdHkgZm9yIHRoZSBjaGFydFxuXHQgKiBwYXJhbSB7b2JqZWN0fSBvQ0MgY3JpdGljYWxpdHkgY2FsY3VsYXRpb24gb2JqZWN0IGNvbmF0aW5pbmcgdGhlIHBhdGhzLlxuXHQgKiBAcmV0dXJucyBTdHJpbmcgY29udGFpbmluZyBhbGwgdGhlIHByb3BlcnR5cGF0aHMgbmVlZGVkIHRvIGJlIGFkZGVkIHRvIHRoZSAkc2VsZWN0IHF1ZXJ5IG9mIHRoZSBsaXN0YmluZGluZy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldFNlbGVjdFBhcmFtZXRlcnM6IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xuXHRcdGNvbnN0IGFQcm9wZXJ0eVBhdGggPSBbXSxcblx0XHRcdG9DQyA9IGFyZ3NbMV0sXG5cdFx0XHRhUGFyYW1ldGVycyA9IFtdO1xuXG5cdFx0aWYgKGFyZ3NbMF0pIHtcblx0XHRcdGFQYXJhbWV0ZXJzLnB1c2goXCIkJGdyb3VwSWQgOiAnXCIgKyBhcmdzWzBdICsgXCInXCIpO1xuXHRcdH1cblx0XHRpZiAoYXJnc1syXSkge1xuXHRcdFx0YVByb3BlcnR5UGF0aC5wdXNoKGFyZ3NbMl0pO1xuXHRcdH0gZWxzZSBpZiAob0NDKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGsgaW4gb0NDKSB7XG5cdFx0XHRcdGlmICghb0NDW2tdLiRFbnVtTWVtYmVyICYmIG9DQ1trXS4kUGF0aCkge1xuXHRcdFx0XHRcdGFQcm9wZXJ0eVBhdGgucHVzaChvQ0Nba10uJFBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgaSA9IDM7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoYXJnc1tpXSkge1xuXHRcdFx0XHRhUHJvcGVydHlQYXRoLnB1c2goYXJnc1tpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGFQcm9wZXJ0eVBhdGgubGVuZ3RoKSB7XG5cdFx0XHRhUGFyYW1ldGVycy5wdXNoKFwiJHNlbGVjdCA6ICdcIiArIGFQcm9wZXJ0eVBhdGguam9pbihcIixcIikgKyBcIidcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFQYXJhbWV0ZXJzLmpvaW4oXCIsXCIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUbyBmZXRjaCBEYXRhUG9pbnQgUXVhbGlmaWVycyBvZiBtZWFzdXJlcy5cblx0ICpcblx0ICogQHBhcmFtIG9DaGFydEFubm90YXRpb25zIENoYXJ0IEFubm90YXRpb25zXG5cdCAqIEBwYXJhbSBvRW50aXR5VHlwZUFubm90YXRpb25zIEVudGl0eVR5cGUgQW5ub3RhdGlvbnNcblx0ICogQHBhcmFtIHNDaGFydFR5cGUgQ2hhcnQgVHlwZSB1c2VkXG5cdCAqIEByZXR1cm5zIENvbnRhaW5pbmcgYWxsIERhdGFwb2ludCBRdWFsaWZpZXJzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0RGF0YVBvaW50UXVhbGlmaWVyc0Zvck1lYXN1cmVzOiBmdW5jdGlvbiAob0NoYXJ0QW5ub3RhdGlvbnM6IGFueSwgb0VudGl0eVR5cGVBbm5vdGF0aW9uczogYW55LCBzQ2hhcnRUeXBlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBhUXVhbGlmZXJzOiBhbnlbXSA9IFtdLFxuXHRcdFx0YU1lYXN1cmVBdHRyaWJ1dGVzID0gb0NoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZUF0dHJpYnV0ZXMsXG5cdFx0XHRmbkFkZERhdGFQb2ludFF1YWxpZmllciA9IGZ1bmN0aW9uIChvTWVhc3VyZTogYW55KSB7XG5cdFx0XHRcdGNvbnN0IHNNZWFzdXJlID0gb01lYXN1cmUuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0bGV0IHNRdWFsaWZlcjtcblx0XHRcdFx0YU1lYXN1cmVBdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24gKG9NZWFzdXJlQXR0cmlidXRlOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRvRW50aXR5VHlwZUFubm90YXRpb25zICYmXG5cdFx0XHRcdFx0XHQob01lYXN1cmVBdHRyaWJ1dGUgJiYgb01lYXN1cmVBdHRyaWJ1dGUuTWVhc3VyZSAmJiBvTWVhc3VyZUF0dHJpYnV0ZS5NZWFzdXJlLiRQcm9wZXJ0eVBhdGgpID09PSBzTWVhc3VyZSAmJlxuXHRcdFx0XHRcdFx0b01lYXN1cmVBdHRyaWJ1dGUuRGF0YVBvaW50ICYmXG5cdFx0XHRcdFx0XHRvTWVhc3VyZUF0dHJpYnV0ZS5EYXRhUG9pbnQuJEFubm90YXRpb25QYXRoXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBvTWVhc3VyZUF0dHJpYnV0ZS5EYXRhUG9pbnQuJEFubm90YXRpb25QYXRoO1xuXHRcdFx0XHRcdFx0aWYgKG9FbnRpdHlUeXBlQW5ub3RhdGlvbnNbc0Fubm90YXRpb25QYXRoXSkge1xuXHRcdFx0XHRcdFx0XHRzUXVhbGlmZXIgPSBzQW5ub3RhdGlvblBhdGguaW5kZXhPZihcIiNcIikgPyBzQW5ub3RhdGlvblBhdGguc3BsaXQoXCIjXCIpWzFdIDogXCJcIjtcblx0XHRcdFx0XHRcdFx0YVF1YWxpZmVycy5wdXNoKHNRdWFsaWZlcik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKHNRdWFsaWZlciA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFx0XHRgRkU6TWFjcm86TWljcm9DaGFydCA6IENvdWxkbid0IGZpbmQgRGF0YVBvaW50KFZhbHVlKSBtZWFzdXJlIGZvciB0aGUgbWVhc3VyZUF0dHJpYnV0ZSBmb3IgJHtzQ2hhcnRUeXBlfSBNaWNyb0NoYXJ0LmBcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0aWYgKCFvRW50aXR5VHlwZUFubm90YXRpb25zKSB7XG5cdFx0XHRMb2cud2FybmluZyhgRkU6TWFjcm86TWljcm9DaGFydCA6IENvdWxkbid0IGZpbmQgYW5ub3RhdGlvbnMgZm9yIHRoZSBEYXRhUG9pbnQgJHtzQ2hhcnRUeXBlfSBNaWNyb0NoYXJ0LmApO1xuXHRcdH1cblx0XHRvQ2hhcnRBbm5vdGF0aW9ucy5NZWFzdXJlcy5mb3JFYWNoKGZuQWRkRGF0YVBvaW50UXVhbGlmaWVyKTtcblx0XHRyZXR1cm4gYVF1YWxpZmVycy5qb2luKFwiLFwiKTtcblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB0byBsb2cgd2FybmluZ3MgZm9yIG1pc3NpbmcgZGF0YXBvaW50IHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQ2hhcnQgVGhlIENoYXJ0IHR5cGUuXG5cdCAqIEBwYXJhbSBvRXJyb3IgT2JqZWN0IHdpdGggcHJvcGVydGllcyBmcm9tIERhdGFQb2ludC5cblx0ICovXG5cdGxvZ1dhcm5pbmc6IGZ1bmN0aW9uIChzQ2hhcnQ6IHN0cmluZywgb0Vycm9yOiBhbnkpIHtcblx0XHRmb3IgKGNvbnN0IHNLZXkgaW4gb0Vycm9yKSB7XG5cdFx0XHRjb25zdCBzVmFsdWUgPSBvRXJyb3Jbc0tleV07XG5cdFx0XHRpZiAoIXNWYWx1ZSkge1xuXHRcdFx0XHRMb2cud2FybmluZyhgJHtzS2V5fSBwYXJhbWV0ZXIgaXMgbWlzc2luZyBmb3IgdGhlICR7c0NoYXJ0fSBNaWNybyBDaGFydGApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGdldCBEaXNwbGF5VmFsdWUgZm9yIGNvbXBhcmlzb24gbWljcm8gY2hhcnQgZGF0YSBhZ2dyZWdhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhUG9pbnQgRGF0YSBwb2ludCBvYmplY3QuXG5cdCAqIEBwYXJhbSBvUGF0aFRleHQgT2JqZWN0IGFmdGVyIGV2YWx1YXRpbmcgQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0IGFubm90YXRpb25cblx0ICogQHBhcmFtIG9WYWx1ZVRleHRQYXRoIEV2YWx1YXRpb24gb2YgQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0LyRQYXRoLyQgdmFsdWUgb2YgdGhlIGFubm90YXRpb25cblx0ICogQHBhcmFtIG9WYWx1ZURhdGFQb2ludFBhdGggRGF0YVBvaW50PlZhbHVlLyRQYXRoLyQgdmFsdWUgYWZ0ZXIgZXZhbHVhdGluZyBhbm5vdGF0aW9uXG5cdCAqIEByZXR1cm5zIEV4cHJlc3Npb24gYmluZGluZyBmb3IgRGlzcGxheSBWYWx1ZSBmb3IgY29tcGFyaXNvbiBtaWNybyBjaGFydCdzIGFnZ3JlZ2F0aW9uIGRhdGEuXG5cdCAqL1xuXHRnZXREaXNwbGF5VmFsdWVGb3JNaWNyb0NoYXJ0OiBmdW5jdGlvbiAob0RhdGFQb2ludDogYW55LCBvUGF0aFRleHQ6IGFueSwgb1ZhbHVlVGV4dFBhdGg6IG9iamVjdCwgb1ZhbHVlRGF0YVBvaW50UGF0aDogb2JqZWN0KSB7XG5cdFx0Y29uc3Qgc1ZhbHVlRm9ybWF0ID0gb0RhdGFQb2ludC5WYWx1ZUZvcm1hdCAmJiBvRGF0YVBvaW50LlZhbHVlRm9ybWF0Lk51bWJlck9mRnJhY3Rpb25hbERpZ2l0cztcblx0XHRsZXQgc1Jlc3VsdDtcblx0XHRpZiAob1BhdGhUZXh0KSB7XG5cdFx0XHRzUmVzdWx0ID0gTWljcm9DaGFydEhlbHBlci5mb3JtYXREZWNpbWFsKG9QYXRoVGV4dFtcIiRQYXRoXCJdLCBvVmFsdWVUZXh0UGF0aCwgc1ZhbHVlRm9ybWF0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1Jlc3VsdCA9IE1pY3JvQ2hhcnRIZWxwZXIuZm9ybWF0RGVjaW1hbChvRGF0YVBvaW50LlZhbHVlW1wiJFBhdGhcIl0sIG9WYWx1ZURhdGFQb2ludFBhdGgsIHNWYWx1ZUZvcm1hdCk7XG5cdFx0fVxuXHRcdHJldHVybiBzUmVzdWx0O1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGNoZWNrIHdoZXRoZXIgbWljcm8gY2hhcnQgaXMgZW5hYmxlZCBvciBub3QgYnkgY2hlY2tpbmcgcHJvcGVydGllcywgY2hhcnQgYW5ub3RhdGlvbnMsIGhpZGRlbiBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NoYXJ0VHlwZSBNaWNyb0NoYXJ0IFR5cGUgZWc6LSBCdWxsZXQuXG5cdCAqIEBwYXJhbSBvRGF0YVBvaW50IERhdGEgcG9pbnQgb2JqZWN0LlxuXHQgKiBAcGFyYW0gb0RhdGFQb2ludFZhbHVlIE9iamVjdCB3aXRoICRQYXRoIGFubm90YXRpb24gdG8gZ2V0IGhpZGRlbiB2YWx1ZSBwYXRoXG5cdCAqIEBwYXJhbSBvQ2hhcnRBbm5vdGF0aW9ucyBDaGFydEFubm90YXRpb24gb2JqZWN0XG5cdCAqIEBwYXJhbSBvRGF0YXBvaW50TWF4VmFsdWUgT2JqZWN0IHdpdGggJFBhdGggYW5ub3RhdGlvbiB0byBnZXQgaGlkZGVuIG1heCB2YWx1ZSBwYXRoXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgY2hhcnQgaGFzIGFsbCB2YWx1ZXMgYW5kIHByb3BlcnRpZXMgYW5kIGFsc28gaXQgaXMgbm90IGFsd2F5cyBoaWRkZW4gc0ZpbmFsRGF0YVBvaW50VmFsdWUgJiYgYk1pY3JvY2hhcnRWaXNpYmxlLlxuXHQgKi9cblx0c2hvdWxkTWljcm9DaGFydFJlbmRlcjogZnVuY3Rpb24gKFxuXHRcdHNDaGFydFR5cGU6IHN0cmluZyxcblx0XHRvRGF0YVBvaW50OiBhbnksXG5cdFx0b0RhdGFQb2ludFZhbHVlOiBhbnksXG5cdFx0b0NoYXJ0QW5ub3RhdGlvbnM6IGFueSxcblx0XHRvRGF0YXBvaW50TWF4VmFsdWU6IGFueVxuXHQpIHtcblx0XHRjb25zdCBhQ2hhcnRUeXBlcyA9IFtcIkFyZWFcIiwgXCJDb2x1bW5cIiwgXCJDb21wYXJpc29uXCJdLFxuXHRcdFx0c0RhdGFQb2ludFZhbHVlID0gb0RhdGFQb2ludCAmJiBvRGF0YVBvaW50LlZhbHVlLFxuXHRcdFx0c0hpZGRlblBhdGggPSBvRGF0YVBvaW50VmFsdWUgJiYgb0RhdGFQb2ludFZhbHVlW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdLFxuXHRcdFx0c0NoYXJ0QW5ub3RhdGlvbkRpbWVuc2lvbiA9IG9DaGFydEFubm90YXRpb25zICYmIG9DaGFydEFubm90YXRpb25zLkRpbWVuc2lvbnMgJiYgb0NoYXJ0QW5ub3RhdGlvbnMuRGltZW5zaW9uc1swXSxcblx0XHRcdG9GaW5hbERhdGFQb2ludFZhbHVlID0gYUNoYXJ0VHlwZXMuaW5kZXhPZihzQ2hhcnRUeXBlKSA+IC0xID8gc0RhdGFQb2ludFZhbHVlICYmIHNDaGFydEFubm90YXRpb25EaW1lbnNpb24gOiBzRGF0YVBvaW50VmFsdWU7IC8vIG9ubHkgZm9yIHRocmVlIGNoYXJ0cyBpbiBhcnJheVxuXHRcdGlmIChzQ2hhcnRUeXBlID09PSBcIkhhcnZleVwiKSB7XG5cdFx0XHRjb25zdCBvRGF0YVBvaW50TWF4aW11bVZhbHVlID0gb0RhdGFQb2ludCAmJiBvRGF0YVBvaW50Lk1heGltdW1WYWx1ZSxcblx0XHRcdFx0c01heFZhbHVlSGlkZGVuUGF0aCA9IG9EYXRhcG9pbnRNYXhWYWx1ZSAmJiBvRGF0YXBvaW50TWF4VmFsdWVbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl07XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRzRGF0YVBvaW50VmFsdWUgJiZcblx0XHRcdFx0b0RhdGFQb2ludE1heGltdW1WYWx1ZSAmJlxuXHRcdFx0XHRNaWNyb0NoYXJ0SGVscGVyLmlzTm90QWx3YXlzSGlkZGVuKFwiQnVsbGV0XCIsIHNEYXRhUG9pbnRWYWx1ZSwgb0RhdGFQb2ludE1heGltdW1WYWx1ZSwgc0hpZGRlblBhdGgsIHNNYXhWYWx1ZUhpZGRlblBhdGgpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gb0ZpbmFsRGF0YVBvaW50VmFsdWUgJiYgTWljcm9DaGFydEhlbHBlci5pc05vdEFsd2F5c0hpZGRlbihzQ2hhcnRUeXBlLCBzRGF0YVBvaW50VmFsdWUsIHVuZGVmaW5lZCwgc0hpZGRlblBhdGgpO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGdldCBkYXRhUG9pbnRRdWFsaWZpZXJzIGZvciBDb2x1bW4sIENvbXBhcmlzb24gYW5kIFN0YWNrZWRCYXIgbWljcm8gY2hhcnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1VpTmFtZVxuXHQgKiBAcmV0dXJucyBSZXN1bHQgc3RyaW5nIG9yIHVuZGVmaW5lZC5cblx0ICovXG5cdGdldGRhdGFQb2ludFF1YWxpZmllcnNGb3JNaWNyb0NoYXJ0OiBmdW5jdGlvbiAoc1VpTmFtZTogc3RyaW5nKSB7XG5cdFx0aWYgKHNVaU5hbWUuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiKSA9PT0gLTEpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGlmIChzVWlOYW1lLmluZGV4T2YoXCIjXCIpID4gLTEpIHtcblx0XHRcdHJldHVybiBzVWlOYW1lLnNwbGl0KFwiI1wiKVsxXTtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH0sXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gZ2V0IGNvbG9yUGFsZXR0ZSBmb3IgY29tcGFyaXNvbiBhbmQgSGFydmV5QmFsbCBNaWNyb2NoYXJ0cy5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhUG9pbnQgRGF0YSBwb2ludCBvYmplY3QuXG5cdCAqIEByZXR1cm5zIFJlc3VsdCBzdHJpbmcgZm9yIGNvbG9yUGFsZXR0ZSBvciB1bmRlZmluZWQuXG5cdCAqL1xuXHRnZXRjb2xvclBhbGV0dGVGb3JNaWNyb0NoYXJ0OiBmdW5jdGlvbiAob0RhdGFQb2ludDogYW55KSB7XG5cdFx0cmV0dXJuIG9EYXRhUG9pbnQuQ3JpdGljYWxpdHlcblx0XHRcdD8gdW5kZWZpbmVkXG5cdFx0XHQ6IFwic2FwVWlDaGFydFBhbGV0dGVRdWFsaXRhdGl2ZUh1ZTEsIHNhcFVpQ2hhcnRQYWxldHRlUXVhbGl0YXRpdmVIdWUyLCBzYXBVaUNoYXJ0UGFsZXR0ZVF1YWxpdGF0aXZlSHVlMywgICAgICAgICAgc2FwVWlDaGFydFBhbGV0dGVRdWFsaXRhdGl2ZUh1ZTQsIHNhcFVpQ2hhcnRQYWxldHRlUXVhbGl0YXRpdmVIdWU1LCBzYXBVaUNoYXJ0UGFsZXR0ZVF1YWxpdGF0aXZlSHVlNiwgc2FwVWlDaGFydFBhbGV0dGVRdWFsaXRhdGl2ZUh1ZTcsICAgICAgICAgIHNhcFVpQ2hhcnRQYWxldHRlUXVhbGl0YXRpdmVIdWU4LCBzYXBVaUNoYXJ0UGFsZXR0ZVF1YWxpdGF0aXZlSHVlOSwgc2FwVWlDaGFydFBhbGV0dGVRdWFsaXRhdGl2ZUh1ZTEwLCBzYXBVaUNoYXJ0UGFsZXR0ZVF1YWxpdGF0aXZlSHVlMTFcIjtcblx0fSxcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBnZXQgTWVhc3VyZVNjYWxlIGZvciBBcmVhLCBDb2x1bW4gYW5kIExpbmUgbWljcm8gY2hhcnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGFQb2ludCBEYXRhIHBvaW50IG9iamVjdC5cblx0ICogQHJldHVybnMgRGF0YXBvaW50IHZhbHVlZm9ybWF0IG9yIGRhdGFwb2ludCBzY2FsZSBvciAxLlxuXHQgKi9cblx0Z2V0TWVhc3VyZVNjYWxlRm9yTWljcm9DaGFydDogZnVuY3Rpb24gKG9EYXRhUG9pbnQ6IGFueSkge1xuXHRcdGlmIChvRGF0YVBvaW50LlZhbHVlRm9ybWF0ICYmIG9EYXRhUG9pbnQuVmFsdWVGb3JtYXQuTnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzKSB7XG5cdFx0XHRyZXR1cm4gb0RhdGFQb2ludC5WYWx1ZUZvcm1hdC5OdW1iZXJPZkZyYWN0aW9uYWxEaWdpdHM7XG5cdFx0fVxuXHRcdGlmIChvRGF0YVBvaW50LlZhbHVlICYmIG9EYXRhUG9pbnQuVmFsdWVbXCIkUGF0aFwiXSAmJiBvRGF0YVBvaW50LlZhbHVlW1wiJFBhdGhcIl1bXCIkU2NhbGVcIl0pIHtcblx0XHRcdHJldHVybiBvRGF0YVBvaW50LlZhbHVlW1wiJFBhdGhcIl1bXCIkU2NhbGVcIl07XG5cdFx0fVxuXHRcdHJldHVybiAxO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB0byByZXR1cm4gdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBvZiBtaWNyb2NoYXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NoYXJ0VHlwZSBUaGUgdHlwZSBvZiBtaWNybyBjaGFydCAoQnVsbGV0LCBSYWRpYWwgZXRjLilcblx0ICogQHBhcmFtIG9NZWFzdXJlIE1lYXN1cmUgdmFsdWUgZm9yIG1pY3JvIGNoYXJ0LlxuXHQgKiBAcGFyYW0gb1RoaXMgYHRoaXNgL2N1cnJlbnQgbW9kZWwgZm9yIG1pY3JvIGNoYXJ0LlxuXHQgKiBAcGFyYW0gb0NvbGxlY3Rpb24gQ29sbGVjdGlvbiBvYmplY3QuXG5cdCAqIEBwYXJhbSBzVWlOYW1lIFRoZSBAc2FwdWkubmFtZSBpbiBjb2xsZWN0aW9uIG1vZGVsIGlzIG5vdCBhY2Nlc3NpYmxlIGhlcmUgZnJvbSBtb2RlbCBoZW5jZSBuZWVkIHRvIHBhc3MgaXQuXG5cdCAqIEBwYXJhbSBvRGF0YVBvaW50IERhdGEgcG9pbnQgb2JqZWN0IHVzZWQgaW4gY2FzZSBvZiBIYXJ2ZXkgQmFsbCBtaWNybyBjaGFydFxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciBtaWNybyBjaGFydC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldEJpbmRpbmdFeHByZXNzaW9uRm9yTWljcm9jaGFydDogZnVuY3Rpb24gKFxuXHRcdHNDaGFydFR5cGU6IHN0cmluZyxcblx0XHRvTWVhc3VyZTogYW55LFxuXHRcdG9UaGlzOiBhbnksXG5cdFx0b0NvbGxlY3Rpb246IGFueSxcblx0XHRzVWlOYW1lOiBzdHJpbmcsXG5cdFx0b0RhdGFQb2ludDogYW55XG5cdCkge1xuXHRcdGNvbnN0IGJDb25kaXRpb24gPSBvQ29sbGVjdGlvbltcIiRpc0NvbGxlY3Rpb25cIl0gfHwgb0NvbGxlY3Rpb25bXCIka2luZFwiXSA9PT0gXCJFbnRpdHlTZXRcIjtcblx0XHRjb25zdCBzUGF0aCA9IGJDb25kaXRpb24gPyBcIlwiIDogc1VpTmFtZTtcblx0XHRsZXQgc0N1cnJlbmN5T3JVbml0ID0gTWljcm9DaGFydEhlbHBlci5nZXRVT01QYXRoRm9yTWljcm9jaGFydChvTWVhc3VyZSk7XG5cdFx0bGV0IHNEYXRhUG9pbnRDcml0aWNhbGxpdHkgPSBcIlwiO1xuXHRcdHN3aXRjaCAoc0NoYXJ0VHlwZSkge1xuXHRcdFx0Y2FzZSBcIlJhZGlhbFwiOlxuXHRcdFx0XHRzQ3VycmVuY3lPclVuaXQgPSBcIlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJIYXJ2ZXlcIjpcblx0XHRcdFx0c0RhdGFQb2ludENyaXRpY2FsbGl0eSA9IG9EYXRhUG9pbnQuQ3JpdGljYWxpdHkgPyBvRGF0YVBvaW50LkNyaXRpY2FsaXR5W1wiJFBhdGhcIl0gOiBcIlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0Y29uc3Qgc0Z1bmN0aW9uVmFsdWUgPSBNaWNyb0NoYXJ0SGVscGVyLmdldFNlbGVjdFBhcmFtZXRlcnMob1RoaXMuYmF0Y2hHcm91cElkLCBcIlwiLCBzRGF0YVBvaW50Q3JpdGljYWxsaXR5LCBzQ3VycmVuY3lPclVuaXQpLFxuXHRcdFx0c0JpbmRpbmcgPSBgeyBwYXRoOiAnJHtzUGF0aH0nYCArIGAsIHBhcmFtZXRlcnMgOiB7JHtzRnVuY3Rpb25WYWx1ZX19IH1gO1xuXHRcdHJldHVybiBzQmluZGluZztcblx0fSxcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgdG8gcmV0dXJuIHRoZSBVT01QYXRoIGV4cHJlc3Npb24gb2YgdGhlIG1pY3JvIGNoYXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gYlNob3dPbmx5Q2hhcnQgV2hldGhlciBvbmx5IGNoYXJ0IHNob3VsZCBiZSByZW5kZXJlZCBvciBub3QuXG5cdCAqIEBwYXJhbSBvTWVhc3VyZSBNZWFzdXJlcyBmb3IgdGhlIG1pY3JvIGNoYXJ0LlxuXHQgKiBAcmV0dXJucyBVT01QYXRoIFN0cmluZyBmb3IgdGhlIG1pY3JvIGNoYXJ0LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0VU9NUGF0aEZvck1pY3JvY2hhcnQ6IGZ1bmN0aW9uIChiU2hvd09ubHlDaGFydDogYm9vbGVhbiwgb01lYXN1cmU/OiBhbnkpIHtcblx0XHRsZXQgYlJlc3VsdDtcblx0XHRpZiAob01lYXN1cmUgJiYgIWJTaG93T25seUNoYXJ0KSB7XG5cdFx0XHRiUmVzdWx0ID1cblx0XHRcdFx0KG9NZWFzdXJlW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXSAmJiBvTWVhc3VyZVtcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3lcIl0uJFBhdGgpIHx8XG5cdFx0XHRcdChvTWVhc3VyZVtcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdFwiXSAmJiBvTWVhc3VyZVtcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdFwiXS4kUGF0aCk7XG5cdFx0fVxuXHRcdHJldHVybiBiUmVzdWx0ID8gYlJlc3VsdCA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB0byByZXR1cm4gdGhlIGFnZ3JlZ2F0aW9uIGJpbmRpbmcgZXhwcmVzc2lvbiBvZiBtaWNybyBjaGFydC5cblx0ICpcblx0ICogQHBhcmFtIHNBZ2dyZWdhdGlvblR5cGUgQWdncmVnYXRpb24gdHlwZSBvZiBjaGFydCAoZWc6LSBQb2ludCBmb3IgQXJlYU1pY3JvY2hhcnQpXG5cdCAqIEBwYXJhbSBvQ29sbGVjdGlvbiBDb2xsZWN0aW9uIG9iamVjdC5cblx0ICogQHBhcmFtIG9EYXRhUG9pbnQgRGF0YSBwb2ludCBpbmZvIGZvciBtaWNybyBjaGFydC5cblx0ICogQHBhcmFtIHNVaU5hbWUgVGhlIEBzYXB1aS5uYW1lIGluIGNvbGxlY3Rpb24gbW9kZWwgaXMgbm90IGFjY2Vzc2libGUgaGVyZSBmcm9tIG1vZGVsIGhlbmNlIG5lZWQgdG8gcGFzcyBpdC5cblx0ICogQHBhcmFtIG9EaW1lbnNpb24gTWljcm8gY2hhcnQgRGltZW5zaW9ucy5cblx0ICogQHBhcmFtIG9NZWFzdXJlIE1lYXN1cmUgdmFsdWUgZm9yIG1pY3JvIGNoYXJ0LlxuXHQgKiBAcGFyYW0gc01lYXN1cmVPckRpbWVuc2lvbkJhciBUaGUgbWVhc3VyZSBvciBkaW1lbnNpb24gcGFzc2VkIHNwZWNpZmljYWxseSBpbiBjYXNlIG9mIGJhciBjaGFydFxuXHQgKiBAcmV0dXJucyBBZ2dyZWdhdGlvbiBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIG1pY3JvIGNoYXJ0LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0QWdncmVnYXRpb25Gb3JNaWNyb2NoYXJ0OiBmdW5jdGlvbiAoXG5cdFx0c0FnZ3JlZ2F0aW9uVHlwZTogc3RyaW5nLFxuXHRcdG9Db2xsZWN0aW9uOiBhbnksXG5cdFx0b0RhdGFQb2ludDogYW55LFxuXHRcdHNVaU5hbWU6IHN0cmluZyxcblx0XHRvRGltZW5zaW9uOiBhbnksXG5cdFx0b01lYXN1cmU6IGFueSxcblx0XHRzTWVhc3VyZU9yRGltZW5zaW9uQmFyOiBzdHJpbmdcblx0KSB7XG5cdFx0bGV0IHNQYXRoID0gb0NvbGxlY3Rpb25bXCIka2luZFwiXSA9PT0gXCJFbnRpdHlTZXRcIiA/IFwiL1wiIDogXCJcIjtcblx0XHRzUGF0aCA9IHNQYXRoICsgc1VpTmFtZTtcblx0XHRjb25zdCBzR3JvdXBJZCA9IFwiXCI7XG5cdFx0bGV0IHNEYXRhUG9pbnRDcml0aWNhbGxpdHlDYWxjID0gXCJcIjtcblx0XHRsZXQgc0RhdGFQb2ludENyaXRpY2FsbGl0eSA9IG9EYXRhUG9pbnQuQ3JpdGljYWxpdHkgPyBvRGF0YVBvaW50LkNyaXRpY2FsaXR5W1wiJFBhdGhcIl0gOiBcIlwiO1xuXHRcdGNvbnN0IHNDdXJyZW5jeU9yVW5pdCA9IE1pY3JvQ2hhcnRIZWxwZXIuZ2V0VU9NUGF0aEZvck1pY3JvY2hhcnQoZmFsc2UsIG9NZWFzdXJlKTtcblx0XHRsZXQgc1RhcmdldFZhbHVlUGF0aCA9IFwiXCI7XG5cdFx0bGV0IHNEaW1lbnNpb25Qcm9wZXJ0eVBhdGggPSBcIlwiO1xuXHRcdGlmIChvRGltZW5zaW9uICYmIG9EaW1lbnNpb24uJFByb3BlcnR5UGF0aCAmJiBvRGltZW5zaW9uLiRQcm9wZXJ0eVBhdGhbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0pIHtcblx0XHRcdHNEaW1lbnNpb25Qcm9wZXJ0eVBhdGggPSBvRGltZW5zaW9uLiRQcm9wZXJ0eVBhdGhbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0uJFBhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNEaW1lbnNpb25Qcm9wZXJ0eVBhdGggPSBvRGltZW5zaW9uLiRQcm9wZXJ0eVBhdGg7XG5cdFx0fVxuXHRcdHN3aXRjaCAoc0FnZ3JlZ2F0aW9uVHlwZSkge1xuXHRcdFx0Y2FzZSBcIlBvaW50c1wiOlxuXHRcdFx0XHRzRGF0YVBvaW50Q3JpdGljYWxsaXR5Q2FsYyA9IG9EYXRhUG9pbnQgJiYgb0RhdGFQb2ludC5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uO1xuXHRcdFx0XHRzVGFyZ2V0VmFsdWVQYXRoID0gb0RhdGFQb2ludCAmJiBvRGF0YVBvaW50LlRhcmdldFZhbHVlICYmIG9EYXRhUG9pbnQuVGFyZ2V0VmFsdWVbXCIkUGF0aFwiXTtcblx0XHRcdFx0c0RhdGFQb2ludENyaXRpY2FsbGl0eSA9IFwiXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkNvbHVtbnNcIjpcblx0XHRcdFx0c0RhdGFQb2ludENyaXRpY2FsbGl0eUNhbGMgPSBvRGF0YVBvaW50ICYmIG9EYXRhUG9pbnQuQ3JpdGljYWxpdHlDYWxjdWxhdGlvbjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTGluZVBvaW50c1wiOlxuXHRcdFx0XHRzRGF0YVBvaW50Q3JpdGljYWxsaXR5ID0gXCJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiQmFyc1wiOlxuXHRcdFx0XHRzRGltZW5zaW9uUHJvcGVydHlQYXRoID0gXCJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGNvbnN0IHNGdW5jdGlvblZhbHVlID0gTWljcm9DaGFydEhlbHBlci5nZXRTZWxlY3RQYXJhbWV0ZXJzKFxuXHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0c0RhdGFQb2ludENyaXRpY2FsbGl0eUNhbGMsXG5cdFx0XHRcdHNEYXRhUG9pbnRDcml0aWNhbGxpdHksXG5cdFx0XHRcdHNDdXJyZW5jeU9yVW5pdCxcblx0XHRcdFx0c1RhcmdldFZhbHVlUGF0aCxcblx0XHRcdFx0c0RpbWVuc2lvblByb3BlcnR5UGF0aCxcblx0XHRcdFx0c01lYXN1cmVPckRpbWVuc2lvbkJhclxuXHRcdFx0KSxcblx0XHRcdHNBZ2dyZWdhdGlvbkV4cHJlc3Npb24gPSBge3BhdGg6JyR7c1BhdGh9J2AgKyBgLCBwYXJhbWV0ZXJzIDogeyR7c0Z1bmN0aW9uVmFsdWV9fSB9YDtcblx0XHRyZXR1cm4gc0FnZ3JlZ2F0aW9uRXhwcmVzc2lvbjtcblx0fSxcblx0Z2V0Q3VycmVuY3lPclVuaXQ6IGZ1bmN0aW9uIChvTWVhc3VyZTogYW55KSB7XG5cdFx0aWYgKG9NZWFzdXJlW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXSkge1xuXHRcdFx0cmV0dXJuIG9NZWFzdXJlW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXS4kUGF0aCB8fCBvTWVhc3VyZVtcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3lcIl07XG5cdFx0fSBlbHNlIGlmIChvTWVhc3VyZVtcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdFwiXSkge1xuXHRcdFx0cmV0dXJuIG9NZWFzdXJlW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5Vbml0XCJdLiRQYXRoIHx8IG9NZWFzdXJlW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5Vbml0XCJdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdH0sXG5cblx0Z2V0Q2FsZW5kYXJQYXR0ZXJuOiBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnkpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0KG9Bbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhclllYXJcIl0gJiYgXCJ5eXl5XCIpIHx8XG5cdFx0XHQob0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyUXVhcnRlclwiXSAmJiBcIlFcIikgfHxcblx0XHRcdChvQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJNb250aFwiXSAmJiBcIk1NXCIpIHx8XG5cdFx0XHQob0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyV2Vla1wiXSAmJiBcInd3XCIpIHx8XG5cdFx0XHQob0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyRGF0ZVwiXSAmJiBcInl5eXlNTWRkXCIpIHx8XG5cdFx0XHQob0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyWWVhck1vbnRoXCJdICYmIFwieXl5eU1NXCIpXG5cdFx0KTtcblx0fSxcblxuXHRmb3JtYXREaW1lbnNpb246IGZ1bmN0aW9uIChzRGF0ZTogYW55LCBzUGF0dGVybjogYW55LCBzUHJvcGVydHlQYXRoOiBhbnkpIHtcblx0XHRjb25zdCBmVmFsdWUgPSBEYXRlRm9ybWF0LmdldERhdGVJbnN0YW5jZSh7IHBhdHRlcm46IHNQYXR0ZXJuIH0pLnBhcnNlKHNEYXRlLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0aWYgKGZWYWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdHJldHVybiBwYXJzZUZsb2F0KGZWYWx1ZS5nZXRUaW1lKCkgYXMgYW55KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJEYXRlIHZhbHVlIGNvdWxkIG5vdCBiZSBkZXRlcm1pbmVkIGZvciBcIiArIHNQcm9wZXJ0eVBhdGgpO1xuXHRcdH1cblx0XHRyZXR1cm4gMDtcblx0fSxcblxuXHRmb3JtYXREYXRlRGltZW5zaW9uOiBmdW5jdGlvbiAoc0RhdGU6IGFueSkge1xuXHRcdHJldHVybiBNaWNyb0NoYXJ0SGVscGVyLmZvcm1hdERpbWVuc2lvbihzRGF0ZSwgXCJ5eXl5LU1NLWRkXCIsIFwiXCIpO1xuXHR9LFxuXG5cdGZvcm1hdFN0cmluZ0RpbWVuc2lvbjogZnVuY3Rpb24gKHNWYWx1ZTogYW55LCBzUGF0dGVybjogYW55LCBzUHJvcGVydHlQYXRoOiBhbnkpIHtcblx0XHRjb25zdCBzTWF0Y2hlZFZhbHVlID0gc1ZhbHVlICYmIHNWYWx1ZS50b1N0cmluZygpLm1hdGNoKGNhbGVuZGFyUGF0dGVybk1hcFtzUGF0dGVybl0pO1xuXHRcdGlmIChzTWF0Y2hlZFZhbHVlICYmIHNNYXRjaGVkVmFsdWUubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gTWljcm9DaGFydEhlbHBlci5mb3JtYXREaW1lbnNpb24oc01hdGNoZWRWYWx1ZVswXSwgc1BhdHRlcm4sIHNQcm9wZXJ0eVBhdGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cud2FybmluZyhcIlBhdHRlcm4gbm90IHN1cHBvcnRlZCBmb3IgXCIgKyBzUHJvcGVydHlQYXRoKTtcblx0XHR9XG5cdFx0cmV0dXJuIDA7XG5cdH0sXG5cblx0Z2V0WDogZnVuY3Rpb24gKHNQcm9wZXJ0eVBhdGg6IGFueSwgc1R5cGU6IGFueSwgb0Fubm90YXRpb25zOiBhbnkpIHtcblx0XHRpZiAoc1R5cGUgPT09IFwiRWRtLkRhdGVcIikge1xuXHRcdFx0Ly9UT0RPOiBDaGVjayB3aHkgZm9ybWF0dGVyIGlzIG5vdCBnZXR0aW5nIGNhbGxlZFxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XCJ7cGFydHM6IFt7cGF0aDogJ1wiICtcblx0XHRcdFx0c1Byb3BlcnR5UGF0aCArXG5cdFx0XHRcdFwiJywgdHlwZTogJ3NhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZyd9LCB7dmFsdWU6ICdcIiArXG5cdFx0XHRcdHNQcm9wZXJ0eVBhdGggK1xuXHRcdFx0XHRcIid9XSwgZm9ybWF0dGVyOiAnTUlDUk9DSEFSVFIuZm9ybWF0U3RyaW5nRGltZW5zaW9uJ31cIlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKHNUeXBlID09PSBcIkVkbS5TdHJpbmdcIikge1xuXHRcdFx0Y29uc3Qgc1BhdHRlcm4gPSBvQW5ub3RhdGlvbnMgJiYgTWljcm9DaGFydEhlbHBlci5nZXRDYWxlbmRhclBhdHRlcm4ob0Fubm90YXRpb25zKTtcblx0XHRcdGlmIChzUGF0dGVybikge1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFwie3BhcnRzOiBbe3BhdGg6ICdcIiArXG5cdFx0XHRcdFx0c1Byb3BlcnR5UGF0aCArXG5cdFx0XHRcdFx0XCInLCB0eXBlOiAnc2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nJ30sIHt2YWx1ZTogJ1wiICtcblx0XHRcdFx0XHRzUGF0dGVybiArXG5cdFx0XHRcdFx0XCInfSwge3ZhbHVlOiAnXCIgK1xuXHRcdFx0XHRcdHNQcm9wZXJ0eVBhdGggK1xuXHRcdFx0XHRcdFwiJ31dLCBmb3JtYXR0ZXI6ICdNSUNST0NIQVJUUi5mb3JtYXRTdHJpbmdEaW1lbnNpb24nfVwiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBNaWNyb0NoYXJ0SGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBS0EsTUFBTUEsVUFBVSxHQUFHQyxhQUFhLENBQUNELFVBQVU7RUFDM0MsTUFBTUUsa0JBQXVCLEdBQUc7SUFDL0JDLElBQUksRUFBRSxJQUFJQyxNQUFNLENBQUMsMEJBQTBCLENBQUM7SUFDNUNDLENBQUMsRUFBRSxJQUFJRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ3RCRSxFQUFFLEVBQUUsSUFBSUYsTUFBTSxDQUFDLGVBQWUsQ0FBQztJQUMvQkcsRUFBRSxFQUFFLElBQUlILE1BQU0sQ0FBQywwQkFBMEIsQ0FBQztJQUMxQ0ksUUFBUSxFQUFFLElBQUlKLE1BQU0sQ0FBQyxtRUFBbUUsQ0FBQztJQUN6RkssTUFBTSxFQUFFLElBQUlMLE1BQU0sQ0FBQywyQ0FBMkM7RUFDL0QsQ0FBQztFQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1NLGdCQUFnQixHQUFHO0lBQ3hCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLGlCQUFpQixFQUFFLFVBQVVDLE1BQWMsRUFBRUMsUUFBYSxFQUFFO01BQzNELE1BQU1DLFFBQVEsR0FBR0QsUUFBUSxDQUFDRSxPQUFPO01BQ2pDLE1BQU1DLEtBQUssR0FBR0YsUUFBUSxDQUFDRyxPQUFPLEVBQUU7TUFDaEMsSUFBSUMsZUFBZSxHQUFHbEIsVUFBVSxDQUFDbUIsT0FBTztNQUV4QyxJQUFJSCxLQUFLLENBQUNJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQ3pDRixlQUFlLEdBQUdsQixVQUFVLENBQUNxQixLQUFLO01BQ25DLENBQUMsTUFBTSxJQUFJTCxLQUFL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