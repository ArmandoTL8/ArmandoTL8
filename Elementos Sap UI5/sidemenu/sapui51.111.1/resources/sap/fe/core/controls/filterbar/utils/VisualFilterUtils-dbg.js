/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/templating/FilterHelper", "sap/ui/core/format/NumberFormat", "sap/ui/mdc/condition/Condition", "sap/ui/model/odata/type/DateTimeOffset"], function (Log, FilterHelper, NumberFormat, Condition, DateTimeOffset) {
  "use strict";

  var getTypeCompliantValue = FilterHelper.getTypeCompliantValue;
  var getRangeProperty = FilterHelper.getRangeProperty;
  const VisualFilterUtils = {
    /**
     * Applies the median scale to the chart data.
     *
     * @param oInteractiveChart InteractiveChart in the VisualFilter control
     * @param oView Instance of the view
     * @param sVFId VisualFilter control ID
     * @param sInfoPath Internal model context path to store info.
     */
    applyMedianScaleToChartData: function (oInteractiveChart, oView, sVFId, sInfoPath) {
      const oData = [];
      const sMeasure = oInteractiveChart.data("measure");
      const oInternalModelContext = oView.getBindingContext("internal");
      const aAggregation = oInteractiveChart.getPoints && oInteractiveChart.getPoints() || oInteractiveChart.getBars && oInteractiveChart.getBars() || oInteractiveChart.getSegments && oInteractiveChart.getSegments();
      for (let i = 0; i < aAggregation.length; i++) {
        oData.push(aAggregation[i].getBindingContext().getObject());
      }
      const scaleFactor = this._getMedianScaleFactor(oData, sMeasure);
      if (scaleFactor && scaleFactor.iShortRefNumber && scaleFactor.scale) {
        oInternalModelContext.setProperty(`scalefactor/${sInfoPath}`, scaleFactor.scale);
        oInternalModelContext.setProperty(`scalefactorNumber/${sInfoPath}`, scaleFactor.iShortRefNumber);
      } else {
        oInternalModelContext.setProperty(`scalefactor/${sInfoPath}`, "");
        oInternalModelContext.setProperty(`scalefactorNumber/${sInfoPath}`, "");
        const oScaleTitle = oView.byId(`${sVFId}::ScaleUoMTitle`);
        const oMeasureDimensionTitle = oView.byId(`${sVFId}::MeasureDimensionTitle`);
        const sText = oScaleTitle.getText();
        if (sText === " | ") {
          oScaleTitle.setVisible(false);
          oMeasureDimensionTitle.setTooltip(oMeasureDimensionTitle.getText());
        }
      }
    },
    /**
     * Returns the median scale factor.
     *
     * @param oData VisualFilter data
     * @param sMeasureField Path of the measure
     * @returns Object containing scale and iShortRefNumber
     */
    _getMedianScaleFactor: function (oData, sMeasureField) {
      let i;
      let scaleFactor;
      oData.sort(function (a, b) {
        if (Number(a[sMeasureField]) < Number(b[sMeasureField])) {
          return -1;
        }
        if (Number(a[sMeasureField]) > Number(b[sMeasureField])) {
          return 1;
        }
        return 0;
      });
      if (oData.length > 0) {
        // get median index
        const iMid = oData.length / 2,
          // get mid of array
          // if iMid is whole number, array length is even, calculate median
          // if iMid is not whole number, array length is odd, take median as iMid - 1
          iMedian = iMid % 1 === 0 ? (parseFloat(oData[iMid - 1][sMeasureField]) + parseFloat(oData[iMid][sMeasureField])) / 2 : parseFloat(oData[Math.floor(iMid)][sMeasureField]),
          // get scale factor on median
          val = iMedian;
        for (i = 0; i < 14; i++) {
          scaleFactor = Math.pow(10, i);
          if (Math.round(Math.abs(val) / scaleFactor) < 10) {
            break;
          }
        }
      }
      const fixedInteger = NumberFormat.getIntegerInstance({
        style: "short",
        showScale: false,
        shortRefNumber: scaleFactor
      });

      // apply scale factor to other values and check
      for (i = 0; i < oData.length; i++) {
        const aData = oData[i],
          sScaledValue = fixedInteger.format(aData[sMeasureField]),
          aScaledValueParts = sScaledValue.split(".");
        // if scaled value has only 0 before decimal or 0 after decimal (example: 0.02)
        // then ignore this scale factor else proceed with this scale factor
        // if scaled value divided by 1000 is >= 1000 then also ignore scale factor
        if (!aScaledValueParts[1] && parseInt(aScaledValueParts[0], 10) === 0 || aScaledValueParts[1] && parseInt(aScaledValueParts[0], 10) === 0 && aScaledValueParts[1].indexOf("0") === 0 || sScaledValue / 1000 >= 1000) {
          scaleFactor = undefined;
          break;
        }
      }
      return {
        iShortRefNumber: scaleFactor,
        scale: scaleFactor ? fixedInteger.getScale() : ""
      };
    },
    /**
     * Returns the formatted number according to the rules of VisualChartFilters.
     *
     * @param value Value which needs to be formatted
     * @param scaleFactor ScaleFactor to which the value needs to be scaled
     * @param numberOfFractionalDigits NumberOfFractionalDigits digits in the decimals according to scale
     * @param currency Currency code
     * @returns The formatted number
     */
    getFormattedNumber: function (value, scaleFactor, numberOfFractionalDigits, currency) {
      let fixedInteger;
      value = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
      if (currency) {
        const currencyFormat = NumberFormat.getCurrencyInstance({
          showMeasure: false
        });
        return currencyFormat.format(parseFloat(value), currency);
        // parseFloat(value) is required otherwise -ve value are wrongly rounded off
        // Example: "-1.9" rounds off to -1 instead of -2. however -1.9 rounds off to -2
      } else if (scaleFactor) {
        fixedInteger = NumberFormat.getFloatInstance({
          style: "short",
          showScale: false,
          shortRefNumber: scaleFactor,
          shortDecimals: numberOfFractionalDigits
        });
        return fixedInteger.format(parseFloat(value));
      } else {
        fixedInteger = NumberFormat.getFloatInstance({
          decimals: numberOfFractionalDigits
        });
        return fixedInteger.format(parseFloat(value));
      }
    },
    /**
     * Applies the UOM to the title of the visual filter control.
     *
     * @param oInteractiveChart InteractiveChart in the VisualFilter control
     * @param oContextData Data of the VisualFilter
     * @param oView Instance of the view
     * @param sInfoPath Internal model context path to store info.
     */
    applyUOMToTitle: function (oInteractiveChart, oContextData, oView, sInfoPath) {
      const vUOM = oInteractiveChart.data("uom");
      let sUOM;
      let sCurrency;
      if (vUOM && vUOM["ISOCurrency"]) {
        sUOM = vUOM["ISOCurrency"];
        sCurrency = sUOM.$Path ? oContextData[sUOM.$Path] : sUOM;
      } else if (vUOM && vUOM["Unit"]) {
        sUOM = vUOM["Unit"];
      }
      if (sUOM) {
        const sUOMValue = sUOM.$Path ? oContextData[sUOM.$Path] : sUOM;
        const oInternalModelContext = oView.getBindingContext("internal");
        oInternalModelContext.setProperty(`uom/${sInfoPath}`, sUOMValue);
        if (sCurrency) {
          oInternalModelContext.setProperty(`currency/${sInfoPath}`, sUOMValue);
        }
      }
    },
    /**
     * Updates the scale factor in the title of the visual filter.
     *
     * @param oInteractiveChart InteractiveChart in the VisualFilter control
     * @param oView Instance of the view
     * @param sVFId VisualFilter control ID
     * @param sInfoPath Internal model context path to store info.
     */
    updateChartScaleFactorTitle: function (oInteractiveChart, oView, sVFId, sInfoPath) {
      if (!oInteractiveChart.data("scalefactor")) {
        this.applyMedianScaleToChartData(oInteractiveChart, oView, sVFId, sInfoPath);
      } else {
        const fixedInteger = NumberFormat.getIntegerInstance({
          style: "short",
          showScale: false,
          shortRefNumber: oInteractiveChart.data("scalefactor")
        });
        const oInternalModelContext = oView.getBindingContext("internal");
        oInternalModelContext.setProperty(`scalefactor/${sInfoPath}`, fixedInteger.getScale());
      }
    },
    /**
     *
     * @param s18nMessageTitle Text of the error message title.
     * @param s18nMessage Text of the error message description.
     * @param sInfoPath Internal model context path to store info.
     * @param oView Instance of the view.
     */
    applyErrorMessageAndTitle: function (s18nMessageTitle, s18nMessage, sInfoPath, oView) {
      const oInternalModelContext = oView.getBindingContext("internal");
      oInternalModelContext.setProperty(sInfoPath, {});
      oInternalModelContext.setProperty(sInfoPath, {
        errorMessageTitle: s18nMessageTitle,
        errorMessage: s18nMessage,
        showError: true
      });
    },
    /**
     * Checks if multiple units are present.
     *
     * @param oContexts Contexts of the VisualFilter
     * @param sUnitfield The path of the unit field
     * @returns Returns if multiple units are configured or not
     */
    checkMulitUnit: function (oContexts, sUnitfield) {
      const aData = [];
      if (oContexts && sUnitfield) {
        for (let i = 0; i < oContexts.length; i++) {
          const aContextData = oContexts[i] && oContexts[i].getObject();
          aData.push(aContextData[sUnitfield]);
        }
      }
      return !!aData.reduce(function (data, key) {
        return data === key ? data : NaN;
      });
    },
    /**
     * Sets an error message if multiple UOM are present.
     *
     * @param oData Data of the VisualFilter control
     * @param oInteractiveChart InteractiveChart in the VisualFilter control
     * @param sInfoPath Internal model context path to store info.
     * @param oResourceBundle The resource bundle
     * @param oView Instance of the view
     */
    setMultiUOMMessage: function (oData, oInteractiveChart, sInfoPath, oResourceBundle, oView) {
      const vUOM = oInteractiveChart.data("uom");
      const sIsCurrency = vUOM && vUOM["ISOCurrency"] && vUOM["ISOCurrency"].$Path;
      const sIsUnit = vUOM && vUOM["Unit"] && vUOM["Unit"].$Path;
      const sUnitfield = sIsCurrency || sIsUnit;
      let s18nMessageTitle, s18nMessage;
      if (sUnitfield) {
        if (!this.checkMulitUnit(oData, sUnitfield)) {
          if (sIsCurrency) {
            s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
            s18nMessage = oResourceBundle.getText("M_VISUAL_FILTERS_MULTIPLE_CURRENCY", sUnitfield);
            this.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInfoPath, oView);
            Log.warning(`Filter is set for multiple Currency for${sUnitfield}`);
          } else if (sIsUnit) {
            s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
            s18nMessage = oResourceBundle.getText("M_VISUAL_FILTERS_MULTIPLE_UNIT", sUnitfield);
            this.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInfoPath, oView);
            Log.warning(`Filter is set for multiple UOMs for${sUnitfield}`);
          }
        }
      }
    },
    /**
     * Sets an error message if response data is empty.
     *
     * @param sInfoPath Internal model context path to store info.
     * @param oResourceBundle The resource bundle
     * @param oView Instance of the view
     */
    setNoDataMessage: function (sInfoPath, oResourceBundle, oView) {
      const s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
      const s18nMessage = oResourceBundle.getText("M_VISUAL_FILTER_NO_DATA_TEXT");
      this.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInfoPath, oView);
    },
    convertFilterCondions: function (oFilterConditions) {
      const oConvertedConditions = {};
      Object.keys(oFilterConditions).forEach(function (sKey) {
        const aConvertedConditions = [];
        const aConditions = oFilterConditions[sKey];
        for (let i = 0; i < aConditions.length; i++) {
          const values = aConditions[i].value2 ? [aConditions[i].value1, aConditions[i].value2] : [aConditions[i].value1];
          aConvertedConditions.push(Condition.createCondition(aConditions[i].operator, values, null, null, "Validated"));
        }
        if (aConvertedConditions.length) {
          oConvertedConditions[sKey] = aConvertedConditions;
        }
      });
      return oConvertedConditions;
    },
    getCustomConditions: function (Range, oValidProperty, sPropertyName) {
      let value1, value2;
      if (oValidProperty.$Type === "Edm.DateTimeOffset") {
        value1 = this._parseDateTime(getTypeCompliantValue(this._formatDateTime(Range.Low), oValidProperty.$Type));
        value2 = Range.High ? this._parseDateTime(getTypeCompliantValue(this._formatDateTime(Range.High), oValidProperty.$Type)) : null;
      } else {
        value1 = Range.Low;
        value2 = Range.High ? Range.High : null;
      }
      return {
        operator: Range.Option ? getRangeProperty(Range.Option.$EnumMember || Range.Option) : null,
        value1: value1,
        value2: value2,
        path: sPropertyName
      };
    },
    _parseDateTime: function (sValue) {
      return this._getDateTimeTypeInstance().parseValue(sValue, "string");
    },
    _formatDateTime: function (sValue) {
      return this._getDateTimeTypeInstance().formatValue(sValue, "string");
    },
    _getDateTimeTypeInstance: function () {
      return new DateTimeOffset({
        pattern: "yyyy-MM-ddTHH:mm:ssZ",
        calendarType: "Gregorian"
      }, {
        V4: true
      });
    }
  };
  return VisualFilterUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXJVdGlscyIsImFwcGx5TWVkaWFuU2NhbGVUb0NoYXJ0RGF0YSIsIm9JbnRlcmFjdGl2ZUNoYXJ0Iiwib1ZpZXciLCJzVkZJZCIsInNJbmZvUGF0aCIsIm9EYXRhIiwic01lYXN1cmUiLCJkYXRhIiwib0ludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJhQWdncmVnYXRpb24iLCJnZXRQb2ludHMiLCJnZXRCYXJzIiwiZ2V0U2VnbWVudHMiLCJpIiwibGVuZ3RoIiwicHVzaCIsImdldE9iamVjdCIsInNjYWxlRmFjdG9yIiwiX2dldE1lZGlhblNjYWxlRmFjdG9yIiwiaVNob3J0UmVmTnVtYmVyIiwic2NhbGUiLCJzZXRQcm9wZXJ0eSIsIm9TY2FsZVRpdGxlIiwiYnlJZCIsIm9NZWFzdXJlRGltZW5zaW9uVGl0bGUiLCJzVGV4dCIsImdldFRleHQiLCJzZXRWaXNpYmxlIiwic2V0VG9vbHRpcCIsInNNZWFzdXJlRmllbGQiLCJzb3J0IiwiYSIsImIiLCJOdW1iZXIiLCJpTWlkIiwiaU1lZGlhbiIsInBhcnNlRmxvYXQiLCJNYXRoIiwiZmxvb3IiLCJ2YWwiLCJwb3ciLCJyb3VuZCIsImFicyIsImZpeGVkSW50ZWdlciIsIk51bWJlckZvcm1hdCIsImdldEludGVnZXJJbnN0YW5jZSIsInN0eWxlIiwic2hvd1NjYWxlIiwic2hvcnRSZWZOdW1iZXIiLCJhRGF0YSIsInNTY2FsZWRWYWx1ZSIsImZvcm1hdCIsImFTY2FsZWRWYWx1ZVBhcnRzIiwic3BsaXQiLCJwYXJzZUludCIsImluZGV4T2YiLCJ1bmRlZmluZWQiLCJnZXRTY2FsZSIsImdldEZvcm1hdHRlZE51bWJlciIsInZhbHVlIiwibnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzIiwiY3VycmVuY3kiLCJyZXBsYWNlIiwiY3VycmVuY3lGb3JtYXQiLCJnZXRDdXJyZW5jeUluc3RhbmNlIiwic2hvd01lYXN1cmUiLCJnZXRGbG9hdEluc3RhbmNlIiwic2hvcnREZWNpbWFscyIsImRlY2ltYWxzIiwiYXBwbHlVT01Ub1RpdGxlIiwib0NvbnRleHREYXRhIiwidlVPTSIsInNVT00iLCJzQ3VycmVuY3kiLCIkUGF0aCIsInNVT01WYWx1ZSIsInVwZGF0ZUNoYXJ0U2NhbGVGYWN0b3JUaXRsZSIsImFwcGx5RXJyb3JNZXNzYWdlQW5kVGl0bGUiLCJzMThuTWVzc2FnZVRpdGxlIiwiczE4bk1lc3NhZ2UiLCJlcnJvck1lc3NhZ2VUaXRsZSIsImVycm9yTWVzc2FnZSIsInNob3dFcnJvciIsImNoZWNrTXVsaXRVbml0Iiwib0NvbnRleHRzIiwic1VuaXRmaWVsZCIsImFDb250ZXh0RGF0YSIsInJlZHVjZSIsImtleSIsIk5hTiIsInNldE11bHRpVU9NTWVzc2FnZSIsIm9SZXNvdXJjZUJ1bmRsZSIsInNJc0N1cnJlbmN5Iiwic0lzVW5pdCIsIkxvZyIsIndhcm5pbmciLCJzZXROb0RhdGFNZXNzYWdlIiwiY29udmVydEZpbHRlckNvbmRpb25zIiwib0ZpbHRlckNvbmRpdGlvbnMiLCJvQ29udmVydGVkQ29uZGl0aW9ucyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwic0tleSIsImFDb252ZXJ0ZWRDb25kaXRpb25zIiwiYUNvbmRpdGlvbnMiLCJ2YWx1ZXMiLCJ2YWx1ZTIiLCJ2YWx1ZTEiLCJDb25kaXRpb24iLCJjcmVhdGVDb25kaXRpb24iLCJvcGVyYXRvciIsImdldEN1c3RvbUNvbmRpdGlvbnMiLCJSYW5nZSIsIm9WYWxpZFByb3BlcnR5Iiwic1Byb3BlcnR5TmFtZSIsIiRUeXBlIiwiX3BhcnNlRGF0ZVRpbWUiLCJnZXRUeXBlQ29tcGxpYW50VmFsdWUiLCJfZm9ybWF0RGF0ZVRpbWUiLCJMb3ciLCJIaWdoIiwiT3B0aW9uIiwiZ2V0UmFuZ2VQcm9wZXJ0eSIsIiRFbnVtTWVtYmVyIiwicGF0aCIsInNWYWx1ZSIsIl9nZXREYXRlVGltZVR5cGVJbnN0YW5jZSIsInBhcnNlVmFsdWUiLCJmb3JtYXRWYWx1ZSIsIkRhdGVUaW1lT2Zmc2V0IiwicGF0dGVybiIsImNhbGVuZGFyVHlwZSIsIlY0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWaXN1YWxGaWx0ZXJVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdldFJhbmdlUHJvcGVydHksIGdldFR5cGVDb21wbGlhbnRWYWx1ZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0ZpbHRlckhlbHBlclwiO1xuaW1wb3J0IHR5cGUgVGl0bGUgZnJvbSBcInNhcC9tL1RpdGxlXCI7XG5pbXBvcnQgTnVtYmVyRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvTnVtYmVyRm9ybWF0XCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgdHlwZSBDb25kaXRpb25WYWxpZGF0ZWQgZnJvbSBcInNhcC91aS9tZGMvZW51bS9Db25kaXRpb25WYWxpZGF0ZWRcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgRGF0ZVRpbWVPZmZzZXQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS90eXBlL0RhdGVUaW1lT2Zmc2V0XCI7XG5cbmNvbnN0IFZpc3VhbEZpbHRlclV0aWxzID0ge1xuXHQvKipcblx0ICogQXBwbGllcyB0aGUgbWVkaWFuIHNjYWxlIHRvIHRoZSBjaGFydCBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0ludGVyYWN0aXZlQ2hhcnQgSW50ZXJhY3RpdmVDaGFydCBpbiB0aGUgVmlzdWFsRmlsdGVyIGNvbnRyb2xcblx0ICogQHBhcmFtIG9WaWV3IEluc3RhbmNlIG9mIHRoZSB2aWV3XG5cdCAqIEBwYXJhbSBzVkZJZCBWaXN1YWxGaWx0ZXIgY29udHJvbCBJRFxuXHQgKiBAcGFyYW0gc0luZm9QYXRoIEludGVybmFsIG1vZGVsIGNvbnRleHQgcGF0aCB0byBzdG9yZSBpbmZvLlxuXHQgKi9cblx0YXBwbHlNZWRpYW5TY2FsZVRvQ2hhcnREYXRhOiBmdW5jdGlvbiAob0ludGVyYWN0aXZlQ2hhcnQ6IGFueSwgb1ZpZXc6IFZpZXcsIHNWRklkOiBzdHJpbmcsIHNJbmZvUGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb0RhdGEgPSBbXTtcblx0XHRjb25zdCBzTWVhc3VyZSA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJtZWFzdXJlXCIpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0Y29uc3QgYUFnZ3JlZ2F0aW9uID1cblx0XHRcdChvSW50ZXJhY3RpdmVDaGFydC5nZXRQb2ludHMgJiYgb0ludGVyYWN0aXZlQ2hhcnQuZ2V0UG9pbnRzKCkpIHx8XG5cdFx0XHQob0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmFycyAmJiBvSW50ZXJhY3RpdmVDaGFydC5nZXRCYXJzKCkpIHx8XG5cdFx0XHQob0ludGVyYWN0aXZlQ2hhcnQuZ2V0U2VnbWVudHMgJiYgb0ludGVyYWN0aXZlQ2hhcnQuZ2V0U2VnbWVudHMoKSk7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQWdncmVnYXRpb24ubGVuZ3RoOyBpKyspIHtcblx0XHRcdG9EYXRhLnB1c2goYUFnZ3JlZ2F0aW9uW2ldLmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0T2JqZWN0KCkpO1xuXHRcdH1cblx0XHRjb25zdCBzY2FsZUZhY3RvciA9IHRoaXMuX2dldE1lZGlhblNjYWxlRmFjdG9yKG9EYXRhLCBzTWVhc3VyZSk7XG5cdFx0aWYgKHNjYWxlRmFjdG9yICYmIHNjYWxlRmFjdG9yLmlTaG9ydFJlZk51bWJlciAmJiBzY2FsZUZhY3Rvci5zY2FsZSkge1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KGBzY2FsZWZhY3Rvci8ke3NJbmZvUGF0aH1gLCBzY2FsZUZhY3Rvci5zY2FsZSk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoYHNjYWxlZmFjdG9yTnVtYmVyLyR7c0luZm9QYXRofWAsIHNjYWxlRmFjdG9yLmlTaG9ydFJlZk51bWJlcik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShgc2NhbGVmYWN0b3IvJHtzSW5mb1BhdGh9YCwgXCJcIik7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoYHNjYWxlZmFjdG9yTnVtYmVyLyR7c0luZm9QYXRofWAsIFwiXCIpO1xuXHRcdFx0Y29uc3Qgb1NjYWxlVGl0bGUgPSBvVmlldy5ieUlkKGAke3NWRklkfTo6U2NhbGVVb01UaXRsZWApIGFzIFRpdGxlO1xuXHRcdFx0Y29uc3Qgb01lYXN1cmVEaW1lbnNpb25UaXRsZSA9IG9WaWV3LmJ5SWQoYCR7c1ZGSWR9OjpNZWFzdXJlRGltZW5zaW9uVGl0bGVgKSBhcyBUaXRsZTtcblx0XHRcdGNvbnN0IHNUZXh0ID0gb1NjYWxlVGl0bGUuZ2V0VGV4dCgpO1xuXHRcdFx0aWYgKHNUZXh0ID09PSBcIiB8IFwiKSB7XG5cdFx0XHRcdG9TY2FsZVRpdGxlLnNldFZpc2libGUoZmFsc2UpO1xuXHRcdFx0XHRvTWVhc3VyZURpbWVuc2lvblRpdGxlLnNldFRvb2x0aXAob01lYXN1cmVEaW1lbnNpb25UaXRsZS5nZXRUZXh0KCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbWVkaWFuIHNjYWxlIGZhY3Rvci5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhIFZpc3VhbEZpbHRlciBkYXRhXG5cdCAqIEBwYXJhbSBzTWVhc3VyZUZpZWxkIFBhdGggb2YgdGhlIG1lYXN1cmVcblx0ICogQHJldHVybnMgT2JqZWN0IGNvbnRhaW5pbmcgc2NhbGUgYW5kIGlTaG9ydFJlZk51bWJlclxuXHQgKi9cblx0X2dldE1lZGlhblNjYWxlRmFjdG9yOiBmdW5jdGlvbiAob0RhdGE6IGFueVtdLCBzTWVhc3VyZUZpZWxkOiBzdHJpbmcpIHtcblx0XHRsZXQgaTtcblx0XHRsZXQgc2NhbGVGYWN0b3I7XG5cdFx0b0RhdGEuc29ydChmdW5jdGlvbiAoYTogYW55LCBiOiBhbnkpIHtcblx0XHRcdGlmIChOdW1iZXIoYVtzTWVhc3VyZUZpZWxkXSkgPCBOdW1iZXIoYltzTWVhc3VyZUZpZWxkXSkpIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXHRcdFx0aWYgKE51bWJlcihhW3NNZWFzdXJlRmllbGRdKSA+IE51bWJlcihiW3NNZWFzdXJlRmllbGRdKSkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAwO1xuXHRcdH0pO1xuXHRcdGlmIChvRGF0YS5sZW5ndGggPiAwKSB7XG5cdFx0XHQvLyBnZXQgbWVkaWFuIGluZGV4XG5cdFx0XHRjb25zdCBpTWlkID0gb0RhdGEubGVuZ3RoIC8gMiwgLy8gZ2V0IG1pZCBvZiBhcnJheVxuXHRcdFx0XHQvLyBpZiBpTWlkIGlzIHdob2xlIG51bWJlciwgYXJyYXkgbGVuZ3RoIGlzIGV2ZW4sIGNhbGN1bGF0ZSBtZWRpYW5cblx0XHRcdFx0Ly8gaWYgaU1pZCBpcyBub3Qgd2hvbGUgbnVtYmVyLCBhcnJheSBsZW5ndGggaXMgb2RkLCB0YWtlIG1lZGlhbiBhcyBpTWlkIC0gMVxuXHRcdFx0XHRpTWVkaWFuID1cblx0XHRcdFx0XHRpTWlkICUgMSA9PT0gMFxuXHRcdFx0XHRcdFx0PyAocGFyc2VGbG9hdChvRGF0YVtpTWlkIC0gMV1bc01lYXN1cmVGaWVsZF0pICsgcGFyc2VGbG9hdChvRGF0YVtpTWlkXVtzTWVhc3VyZUZpZWxkXSkpIC8gMlxuXHRcdFx0XHRcdFx0OiBwYXJzZUZsb2F0KG9EYXRhW01hdGguZmxvb3IoaU1pZCldW3NNZWFzdXJlRmllbGRdKSxcblx0XHRcdFx0Ly8gZ2V0IHNjYWxlIGZhY3RvciBvbiBtZWRpYW5cblx0XHRcdFx0dmFsID0gaU1lZGlhbjtcblx0XHRcdGZvciAoaSA9IDA7IGkgPCAxNDsgaSsrKSB7XG5cdFx0XHRcdHNjYWxlRmFjdG9yID0gTWF0aC5wb3coMTAsIGkpO1xuXHRcdFx0XHRpZiAoTWF0aC5yb3VuZChNYXRoLmFicyh2YWwpIC8gc2NhbGVGYWN0b3IpIDwgMTApIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IGZpeGVkSW50ZWdlciA9IE51bWJlckZvcm1hdC5nZXRJbnRlZ2VySW5zdGFuY2Uoe1xuXHRcdFx0c3R5bGU6IFwic2hvcnRcIixcblx0XHRcdHNob3dTY2FsZTogZmFsc2UsXG5cdFx0XHRzaG9ydFJlZk51bWJlcjogc2NhbGVGYWN0b3Jcblx0XHR9KTtcblxuXHRcdC8vIGFwcGx5IHNjYWxlIGZhY3RvciB0byBvdGhlciB2YWx1ZXMgYW5kIGNoZWNrXG5cdFx0Zm9yIChpID0gMDsgaSA8IG9EYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBhRGF0YSA9IG9EYXRhW2ldLFxuXHRcdFx0XHRzU2NhbGVkVmFsdWUgPSBmaXhlZEludGVnZXIuZm9ybWF0KGFEYXRhW3NNZWFzdXJlRmllbGRdKSBhcyBhbnksXG5cdFx0XHRcdGFTY2FsZWRWYWx1ZVBhcnRzID0gc1NjYWxlZFZhbHVlLnNwbGl0KFwiLlwiKTtcblx0XHRcdC8vIGlmIHNjYWxlZCB2YWx1ZSBoYXMgb25seSAwIGJlZm9yZSBkZWNpbWFsIG9yIDAgYWZ0ZXIgZGVjaW1hbCAoZXhhbXBsZTogMC4wMilcblx0XHRcdC8vIHRoZW4gaWdub3JlIHRoaXMgc2NhbGUgZmFjdG9yIGVsc2UgcHJvY2VlZCB3aXRoIHRoaXMgc2NhbGUgZmFjdG9yXG5cdFx0XHQvLyBpZiBzY2FsZWQgdmFsdWUgZGl2aWRlZCBieSAxMDAwIGlzID49IDEwMDAgdGhlbiBhbHNvIGlnbm9yZSBzY2FsZSBmYWN0b3Jcblx0XHRcdGlmIChcblx0XHRcdFx0KCFhU2NhbGVkVmFsdWVQYXJ0c1sxXSAmJiBwYXJzZUludChhU2NhbGVkVmFsdWVQYXJ0c1swXSwgMTApID09PSAwKSB8fFxuXHRcdFx0XHQoYVNjYWxlZFZhbHVlUGFydHNbMV0gJiYgcGFyc2VJbnQoYVNjYWxlZFZhbHVlUGFydHNbMF0sIDEwKSA9PT0gMCAmJiBhU2NhbGVkVmFsdWVQYXJ0c1sxXS5pbmRleE9mKFwiMFwiKSA9PT0gMCkgfHxcblx0XHRcdFx0c1NjYWxlZFZhbHVlIC8gMTAwMCA+PSAxMDAwXG5cdFx0XHQpIHtcblx0XHRcdFx0c2NhbGVGYWN0b3IgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0aVNob3J0UmVmTnVtYmVyOiBzY2FsZUZhY3Rvcixcblx0XHRcdHNjYWxlOiBzY2FsZUZhY3RvciA/IChmaXhlZEludGVnZXIgYXMgYW55KS5nZXRTY2FsZSgpIDogXCJcIlxuXHRcdH07XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGZvcm1hdHRlZCBudW1iZXIgYWNjb3JkaW5nIHRvIHRoZSBydWxlcyBvZiBWaXN1YWxDaGFydEZpbHRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB3aGljaCBuZWVkcyB0byBiZSBmb3JtYXR0ZWRcblx0ICogQHBhcmFtIHNjYWxlRmFjdG9yIFNjYWxlRmFjdG9yIHRvIHdoaWNoIHRoZSB2YWx1ZSBuZWVkcyB0byBiZSBzY2FsZWRcblx0ICogQHBhcmFtIG51bWJlck9mRnJhY3Rpb25hbERpZ2l0cyBOdW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMgZGlnaXRzIGluIHRoZSBkZWNpbWFscyBhY2NvcmRpbmcgdG8gc2NhbGVcblx0ICogQHBhcmFtIGN1cnJlbmN5IEN1cnJlbmN5IGNvZGVcblx0ICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBudW1iZXJcblx0ICovXG5cdGdldEZvcm1hdHRlZE51bWJlcjogZnVuY3Rpb24gKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIsIHNjYWxlRmFjdG9yPzogbnVtYmVyLCBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHM/OiBudW1iZXIsIGN1cnJlbmN5Pzogc3RyaW5nKSB7XG5cdFx0bGV0IGZpeGVkSW50ZWdlcjtcblx0XHR2YWx1ZSA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IE51bWJlcih2YWx1ZS5yZXBsYWNlKC8sL2csIFwiXCIpKSA6IHZhbHVlO1xuXG5cdFx0aWYgKGN1cnJlbmN5KSB7XG5cdFx0XHRjb25zdCBjdXJyZW5jeUZvcm1hdCA9IE51bWJlckZvcm1hdC5nZXRDdXJyZW5jeUluc3RhbmNlKHtcblx0XHRcdFx0c2hvd01lYXN1cmU6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBjdXJyZW5jeUZvcm1hdC5mb3JtYXQocGFyc2VGbG9hdCh2YWx1ZSBhcyBhbnkpLCBjdXJyZW5jeSk7XG5cdFx0XHQvLyBwYXJzZUZsb2F0KHZhbHVlKSBpcyByZXF1aXJlZCBvdGhlcndpc2UgLXZlIHZhbHVlIGFyZSB3cm9uZ2x5IHJvdW5kZWQgb2ZmXG5cdFx0XHQvLyBFeGFtcGxlOiBcIi0xLjlcIiByb3VuZHMgb2ZmIHRvIC0xIGluc3RlYWQgb2YgLTIuIGhvd2V2ZXIgLTEuOSByb3VuZHMgb2ZmIHRvIC0yXG5cdFx0fSBlbHNlIGlmIChzY2FsZUZhY3Rvcikge1xuXHRcdFx0Zml4ZWRJbnRlZ2VyID0gTnVtYmVyRm9ybWF0LmdldEZsb2F0SW5zdGFuY2Uoe1xuXHRcdFx0XHRzdHlsZTogXCJzaG9ydFwiLFxuXHRcdFx0XHRzaG93U2NhbGU6IGZhbHNlLFxuXHRcdFx0XHRzaG9ydFJlZk51bWJlcjogc2NhbGVGYWN0b3IsXG5cdFx0XHRcdHNob3J0RGVjaW1hbHM6IG51bWJlck9mRnJhY3Rpb25hbERpZ2l0c1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gZml4ZWRJbnRlZ2VyLmZvcm1hdChwYXJzZUZsb2F0KHZhbHVlIGFzIGFueSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmaXhlZEludGVnZXIgPSBOdW1iZXJGb3JtYXQuZ2V0RmxvYXRJbnN0YW5jZSh7XG5cdFx0XHRcdGRlY2ltYWxzOiBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHNcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGZpeGVkSW50ZWdlci5mb3JtYXQocGFyc2VGbG9hdCh2YWx1ZSBhcyBhbnkpKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFwcGxpZXMgdGhlIFVPTSB0byB0aGUgdGl0bGUgb2YgdGhlIHZpc3VhbCBmaWx0ZXIgY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIG9JbnRlcmFjdGl2ZUNoYXJ0IEludGVyYWN0aXZlQ2hhcnQgaW4gdGhlIFZpc3VhbEZpbHRlciBjb250cm9sXG5cdCAqIEBwYXJhbSBvQ29udGV4dERhdGEgRGF0YSBvZiB0aGUgVmlzdWFsRmlsdGVyXG5cdCAqIEBwYXJhbSBvVmlldyBJbnN0YW5jZSBvZiB0aGUgdmlld1xuXHQgKiBAcGFyYW0gc0luZm9QYXRoIEludGVybmFsIG1vZGVsIGNvbnRleHQgcGF0aCB0byBzdG9yZSBpbmZvLlxuXHQgKi9cblx0YXBwbHlVT01Ub1RpdGxlOiBmdW5jdGlvbiAob0ludGVyYWN0aXZlQ2hhcnQ6IGFueSwgb0NvbnRleHREYXRhOiBhbnksIG9WaWV3OiBWaWV3LCBzSW5mb1BhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IHZVT00gPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwidW9tXCIpO1xuXHRcdGxldCBzVU9NO1xuXHRcdGxldCBzQ3VycmVuY3k7XG5cdFx0aWYgKHZVT00gJiYgdlVPTVtcIklTT0N1cnJlbmN5XCJdKSB7XG5cdFx0XHRzVU9NID0gdlVPTVtcIklTT0N1cnJlbmN5XCJdO1xuXHRcdFx0c0N1cnJlbmN5ID0gc1VPTS4kUGF0aCA/IG9Db250ZXh0RGF0YVtzVU9NLiRQYXRoXSA6IHNVT007XG5cdFx0fSBlbHNlIGlmICh2VU9NICYmIHZVT01bXCJVbml0XCJdKSB7XG5cdFx0XHRzVU9NID0gdlVPTVtcIlVuaXRcIl07XG5cdFx0fVxuXHRcdGlmIChzVU9NKSB7XG5cdFx0XHRjb25zdCBzVU9NVmFsdWUgPSBzVU9NLiRQYXRoID8gb0NvbnRleHREYXRhW3NVT00uJFBhdGhdIDogc1VPTTtcblx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoYHVvbS8ke3NJbmZvUGF0aH1gLCBzVU9NVmFsdWUpO1xuXHRcdFx0aWYgKHNDdXJyZW5jeSkge1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoYGN1cnJlbmN5LyR7c0luZm9QYXRofWAsIHNVT01WYWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgc2NhbGUgZmFjdG9yIGluIHRoZSB0aXRsZSBvZiB0aGUgdmlzdWFsIGZpbHRlci5cblx0ICpcblx0ICogQHBhcmFtIG9JbnRlcmFjdGl2ZUNoYXJ0IEludGVyYWN0aXZlQ2hhcnQgaW4gdGhlIFZpc3VhbEZpbHRlciBjb250cm9sXG5cdCAqIEBwYXJhbSBvVmlldyBJbnN0YW5jZSBvZiB0aGUgdmlld1xuXHQgKiBAcGFyYW0gc1ZGSWQgVmlzdWFsRmlsdGVyIGNvbnRyb2wgSURcblx0ICogQHBhcmFtIHNJbmZvUGF0aCBJbnRlcm5hbCBtb2RlbCBjb250ZXh0IHBhdGggdG8gc3RvcmUgaW5mby5cblx0ICovXG5cdHVwZGF0ZUNoYXJ0U2NhbGVGYWN0b3JUaXRsZTogZnVuY3Rpb24gKG9JbnRlcmFjdGl2ZUNoYXJ0OiBhbnksIG9WaWV3OiBWaWV3LCBzVkZJZDogc3RyaW5nLCBzSW5mb1BhdGg6IHN0cmluZykge1xuXHRcdGlmICghb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInNjYWxlZmFjdG9yXCIpKSB7XG5cdFx0XHR0aGlzLmFwcGx5TWVkaWFuU2NhbGVUb0NoYXJ0RGF0YShvSW50ZXJhY3RpdmVDaGFydCwgb1ZpZXcsIHNWRklkLCBzSW5mb1BhdGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBmaXhlZEludGVnZXIgPSBOdW1iZXJGb3JtYXQuZ2V0SW50ZWdlckluc3RhbmNlKHtcblx0XHRcdFx0c3R5bGU6IFwic2hvcnRcIixcblx0XHRcdFx0c2hvd1NjYWxlOiBmYWxzZSxcblx0XHRcdFx0c2hvcnRSZWZOdW1iZXI6IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJzY2FsZWZhY3RvclwiKVxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KGBzY2FsZWZhY3Rvci8ke3NJbmZvUGF0aH1gLCAoZml4ZWRJbnRlZ2VyIGFzIGFueSkuZ2V0U2NhbGUoKSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gczE4bk1lc3NhZ2VUaXRsZSBUZXh0IG9mIHRoZSBlcnJvciBtZXNzYWdlIHRpdGxlLlxuXHQgKiBAcGFyYW0gczE4bk1lc3NhZ2UgVGV4dCBvZiB0aGUgZXJyb3IgbWVzc2FnZSBkZXNjcmlwdGlvbi5cblx0ICogQHBhcmFtIHNJbmZvUGF0aCBJbnRlcm5hbCBtb2RlbCBjb250ZXh0IHBhdGggdG8gc3RvcmUgaW5mby5cblx0ICogQHBhcmFtIG9WaWV3IEluc3RhbmNlIG9mIHRoZSB2aWV3LlxuXHQgKi9cblx0YXBwbHlFcnJvck1lc3NhZ2VBbmRUaXRsZTogZnVuY3Rpb24gKHMxOG5NZXNzYWdlVGl0bGU6IHN0cmluZywgczE4bk1lc3NhZ2U6IHN0cmluZywgc0luZm9QYXRoOiBzdHJpbmcsIG9WaWV3OiBWaWV3KSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0luZm9QYXRoLCB7fSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbmZvUGF0aCwge1xuXHRcdFx0ZXJyb3JNZXNzYWdlVGl0bGU6IHMxOG5NZXNzYWdlVGl0bGUsXG5cdFx0XHRlcnJvck1lc3NhZ2U6IHMxOG5NZXNzYWdlLFxuXHRcdFx0c2hvd0Vycm9yOiB0cnVlXG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgbXVsdGlwbGUgdW5pdHMgYXJlIHByZXNlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dHMgQ29udGV4dHMgb2YgdGhlIFZpc3VhbEZpbHRlclxuXHQgKiBAcGFyYW0gc1VuaXRmaWVsZCBUaGUgcGF0aCBvZiB0aGUgdW5pdCBmaWVsZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIGlmIG11bHRpcGxlIHVuaXRzIGFyZSBjb25maWd1cmVkIG9yIG5vdFxuXHQgKi9cblx0Y2hlY2tNdWxpdFVuaXQ6IGZ1bmN0aW9uIChvQ29udGV4dHM6IENvbnRleHRbXSwgc1VuaXRmaWVsZDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgYURhdGEgPSBbXTtcblx0XHRpZiAob0NvbnRleHRzICYmIHNVbml0ZmllbGQpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgb0NvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IGFDb250ZXh0RGF0YSA9IG9Db250ZXh0c1tpXSAmJiBvQ29udGV4dHNbaV0uZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdGFEYXRhLnB1c2goYUNvbnRleHREYXRhW3NVbml0ZmllbGRdKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuICEhYURhdGEucmVkdWNlKGZ1bmN0aW9uIChkYXRhOiBhbnksIGtleTogYW55KSB7XG5cdFx0XHRyZXR1cm4gZGF0YSA9PT0ga2V5ID8gZGF0YSA6IE5hTjtcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogU2V0cyBhbiBlcnJvciBtZXNzYWdlIGlmIG11bHRpcGxlIFVPTSBhcmUgcHJlc2VudC5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhIERhdGEgb2YgdGhlIFZpc3VhbEZpbHRlciBjb250cm9sXG5cdCAqIEBwYXJhbSBvSW50ZXJhY3RpdmVDaGFydCBJbnRlcmFjdGl2ZUNoYXJ0IGluIHRoZSBWaXN1YWxGaWx0ZXIgY29udHJvbFxuXHQgKiBAcGFyYW0gc0luZm9QYXRoIEludGVybmFsIG1vZGVsIGNvbnRleHQgcGF0aCB0byBzdG9yZSBpbmZvLlxuXHQgKiBAcGFyYW0gb1Jlc291cmNlQnVuZGxlIFRoZSByZXNvdXJjZSBidW5kbGVcblx0ICogQHBhcmFtIG9WaWV3IEluc3RhbmNlIG9mIHRoZSB2aWV3XG5cdCAqL1xuXHRzZXRNdWx0aVVPTU1lc3NhZ2U6IGZ1bmN0aW9uIChcblx0XHRvRGF0YTogQ29udGV4dFtdLFxuXHRcdG9JbnRlcmFjdGl2ZUNoYXJ0OiBhbnksXG5cdFx0c0luZm9QYXRoOiBzdHJpbmcsXG5cdFx0b1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSxcblx0XHRvVmlldzogVmlld1xuXHQpIHtcblx0XHRjb25zdCB2VU9NID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInVvbVwiKTtcblx0XHRjb25zdCBzSXNDdXJyZW5jeSA9IHZVT00gJiYgdlVPTVtcIklTT0N1cnJlbmN5XCJdICYmIHZVT01bXCJJU09DdXJyZW5jeVwiXS4kUGF0aDtcblx0XHRjb25zdCBzSXNVbml0ID0gdlVPTSAmJiB2VU9NW1wiVW5pdFwiXSAmJiB2VU9NW1wiVW5pdFwiXS4kUGF0aDtcblx0XHRjb25zdCBzVW5pdGZpZWxkID0gc0lzQ3VycmVuY3kgfHwgc0lzVW5pdDtcblx0XHRsZXQgczE4bk1lc3NhZ2VUaXRsZSwgczE4bk1lc3NhZ2U7XG5cdFx0aWYgKHNVbml0ZmllbGQpIHtcblx0XHRcdGlmICghdGhpcy5jaGVja011bGl0VW5pdChvRGF0YSwgc1VuaXRmaWVsZCkpIHtcblx0XHRcdFx0aWYgKHNJc0N1cnJlbmN5KSB7XG5cdFx0XHRcdFx0czE4bk1lc3NhZ2VUaXRsZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpO1xuXHRcdFx0XHRcdHMxOG5NZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX01VTFRJUExFX0NVUlJFTkNZXCIsIHNVbml0ZmllbGQpO1xuXHRcdFx0XHRcdHRoaXMuYXBwbHlFcnJvck1lc3NhZ2VBbmRUaXRsZShzMThuTWVzc2FnZVRpdGxlLCBzMThuTWVzc2FnZSwgc0luZm9QYXRoLCBvVmlldyk7XG5cdFx0XHRcdFx0TG9nLndhcm5pbmcoYEZpbHRlciBpcyBzZXQgZm9yIG11bHRpcGxlIEN1cnJlbmN5IGZvciR7c1VuaXRmaWVsZH1gKTtcblx0XHRcdFx0fSBlbHNlIGlmIChzSXNVbml0KSB7XG5cdFx0XHRcdFx0czE4bk1lc3NhZ2VUaXRsZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpO1xuXHRcdFx0XHRcdHMxOG5NZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX01VTFRJUExFX1VOSVRcIiwgc1VuaXRmaWVsZCk7XG5cdFx0XHRcdFx0dGhpcy5hcHBseUVycm9yTWVzc2FnZUFuZFRpdGxlKHMxOG5NZXNzYWdlVGl0bGUsIHMxOG5NZXNzYWdlLCBzSW5mb1BhdGgsIG9WaWV3KTtcblx0XHRcdFx0XHRMb2cud2FybmluZyhgRmlsdGVyIGlzIHNldCBmb3IgbXVsdGlwbGUgVU9NcyBmb3Ike3NVbml0ZmllbGR9YCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldHMgYW4gZXJyb3IgbWVzc2FnZSBpZiByZXNwb25zZSBkYXRhIGlzIGVtcHR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gc0luZm9QYXRoIEludGVybmFsIG1vZGVsIGNvbnRleHQgcGF0aCB0byBzdG9yZSBpbmZvLlxuXHQgKiBAcGFyYW0gb1Jlc291cmNlQnVuZGxlIFRoZSByZXNvdXJjZSBidW5kbGVcblx0ICogQHBhcmFtIG9WaWV3IEluc3RhbmNlIG9mIHRoZSB2aWV3XG5cdCAqL1xuXHRzZXROb0RhdGFNZXNzYWdlOiBmdW5jdGlvbiAoc0luZm9QYXRoOiBzdHJpbmcsIG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUsIG9WaWV3OiBWaWV3KSB7XG5cdFx0Y29uc3QgczE4bk1lc3NhZ2VUaXRsZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpO1xuXHRcdGNvbnN0IHMxOG5NZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJfTk9fREFUQV9URVhUXCIpO1xuXHRcdHRoaXMuYXBwbHlFcnJvck1lc3NhZ2VBbmRUaXRsZShzMThuTWVzc2FnZVRpdGxlLCBzMThuTWVzc2FnZSwgc0luZm9QYXRoLCBvVmlldyk7XG5cdH0sXG5cdGNvbnZlcnRGaWx0ZXJDb25kaW9uczogZnVuY3Rpb24gKG9GaWx0ZXJDb25kaXRpb25zOiBhbnkpIHtcblx0XHRjb25zdCBvQ29udmVydGVkQ29uZGl0aW9uczogYW55ID0ge307XG5cdFx0T2JqZWN0LmtleXMob0ZpbHRlckNvbmRpdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0Y29uc3QgYUNvbnZlcnRlZENvbmRpdGlvbnMgPSBbXTtcblx0XHRcdGNvbnN0IGFDb25kaXRpb25zID0gb0ZpbHRlckNvbmRpdGlvbnNbc0tleV07XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFDb25kaXRpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlcyA9IGFDb25kaXRpb25zW2ldLnZhbHVlMiA/IFthQ29uZGl0aW9uc1tpXS52YWx1ZTEsIGFDb25kaXRpb25zW2ldLnZhbHVlMl0gOiBbYUNvbmRpdGlvbnNbaV0udmFsdWUxXTtcblx0XHRcdFx0YUNvbnZlcnRlZENvbmRpdGlvbnMucHVzaChcblx0XHRcdFx0XHRDb25kaXRpb24uY3JlYXRlQ29uZGl0aW9uKGFDb25kaXRpb25zW2ldLm9wZXJhdG9yLCB2YWx1ZXMsIG51bGwsIG51bGwsIFwiVmFsaWRhdGVkXCIgYXMgQ29uZGl0aW9uVmFsaWRhdGVkKVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGFDb252ZXJ0ZWRDb25kaXRpb25zLmxlbmd0aCkge1xuXHRcdFx0XHRvQ29udmVydGVkQ29uZGl0aW9uc1tzS2V5XSA9IGFDb252ZXJ0ZWRDb25kaXRpb25zO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBvQ29udmVydGVkQ29uZGl0aW9ucztcblx0fSxcblx0Z2V0Q3VzdG9tQ29uZGl0aW9uczogZnVuY3Rpb24gKFJhbmdlOiBhbnksIG9WYWxpZFByb3BlcnR5OiBhbnksIHNQcm9wZXJ0eU5hbWU6IGFueSkge1xuXHRcdGxldCB2YWx1ZTEsIHZhbHVlMjtcblx0XHRpZiAob1ZhbGlkUHJvcGVydHkuJFR5cGUgPT09IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIpIHtcblx0XHRcdHZhbHVlMSA9IHRoaXMuX3BhcnNlRGF0ZVRpbWUoZ2V0VHlwZUNvbXBsaWFudFZhbHVlKHRoaXMuX2Zvcm1hdERhdGVUaW1lKFJhbmdlLkxvdyksIG9WYWxpZFByb3BlcnR5LiRUeXBlKSk7XG5cdFx0XHR2YWx1ZTIgPSBSYW5nZS5IaWdoID8gdGhpcy5fcGFyc2VEYXRlVGltZShnZXRUeXBlQ29tcGxpYW50VmFsdWUodGhpcy5fZm9ybWF0RGF0ZVRpbWUoUmFuZ2UuSGlnaCksIG9WYWxpZFByb3BlcnR5LiRUeXBlKSkgOiBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YWx1ZTEgPSBSYW5nZS5Mb3c7XG5cdFx0XHR2YWx1ZTIgPSBSYW5nZS5IaWdoID8gUmFuZ2UuSGlnaCA6IG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHRvcGVyYXRvcjogUmFuZ2UuT3B0aW9uID8gZ2V0UmFuZ2VQcm9wZXJ0eShSYW5nZS5PcHRpb24uJEVudW1NZW1iZXIgfHwgUmFuZ2UuT3B0aW9uKSA6IG51bGwsXG5cdFx0XHR2YWx1ZTE6IHZhbHVlMSxcblx0XHRcdHZhbHVlMjogdmFsdWUyLFxuXHRcdFx0cGF0aDogc1Byb3BlcnR5TmFtZVxuXHRcdH07XG5cdH0sXG5cdF9wYXJzZURhdGVUaW1lOiBmdW5jdGlvbiAoc1ZhbHVlOiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0RGF0ZVRpbWVUeXBlSW5zdGFuY2UoKS5wYXJzZVZhbHVlKHNWYWx1ZSwgXCJzdHJpbmdcIik7XG5cdH0sXG5cdF9mb3JtYXREYXRlVGltZTogZnVuY3Rpb24gKHNWYWx1ZTogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldERhdGVUaW1lVHlwZUluc3RhbmNlKCkuZm9ybWF0VmFsdWUoc1ZhbHVlLCBcInN0cmluZ1wiKTtcblx0fSxcblx0X2dldERhdGVUaW1lVHlwZUluc3RhbmNlOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZU9mZnNldCh7IHBhdHRlcm46IFwieXl5eS1NTS1kZFRISDptbTpzc1pcIiwgY2FsZW5kYXJUeXBlOiBcIkdyZWdvcmlhblwiIH0sIHsgVjQ6IHRydWUgfSk7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZpc3VhbEZpbHRlclV0aWxzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFZQSxNQUFNQSxpQkFBaUIsR0FBRztJQUN6QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLDJCQUEyQixFQUFFLFVBQVVDLGlCQUFzQixFQUFFQyxLQUFXLEVBQUVDLEtBQWEsRUFBRUMsU0FBaUIsRUFBRTtNQUM3RyxNQUFNQyxLQUFLLEdBQUcsRUFBRTtNQUNoQixNQUFNQyxRQUFRLEdBQUdMLGlCQUFpQixDQUFDTSxJQUFJLENBQUMsU0FBUyxDQUFDO01BQ2xELE1BQU1DLHFCQUFxQixHQUFHTixLQUFLLENBQUNPLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7TUFDekYsTUFBTUMsWUFBWSxHQUNoQlQsaUJBQWlCLENBQUNVLFNBQVMsSUFBSVYsaUJBQWlCLENBQUNVLFNBQVMsRUFBRSxJQUM1RFYsaUJBQWlCLENBQUNXLE9BQU8sSUFBSVgsaUJBQWlCLENBQUNXLE9BQU8sRUFBRyxJQUN6RFgsaUJBQWlCLENBQUNZLFdBQVcsSUFBSVosaUJBQWlCLENBQUNZLFdBQVcsRUFBRztNQUNuRSxLQUFLLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0osWUFBWSxDQUFDSyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO1FBQzdDVCxLQUFLLENBQUNXLElBQUksQ0FBQ04sWUFBWSxDQUFDSSxDQUFDLENBQUMsQ0FBQ0wsaUJBQWlCLEVBQUUsQ0FBQ1EsU0FBUyxFQUFFLENBQUM7TUFDNUQ7TUFDQSxNQUFNQyxXQUFXLEdBQUcsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBQ2QsS0FBSyxFQUFFQyxRQUFRLENBQUM7TUFDL0QsSUFBSVksV0FBVyxJQUFJQSxXQUFXLENBQUNFLGVBQWUsSUFBSUYsV0FBVyxDQUFDRyxLQUFLLEVBQUU7UUFDcEViLHFCQUFxQixDQUFDYyxXQUFXLENBQUUsZUFBY2xCLFNBQVUsRUFBQyxFQUFFYyxXQUFXLENBQUNHLEtBQUssQ0FBQztRQUNoRmIscUJBQXFCLENBQUNjLFdBQVcsQ0FBRSxxQkFBb0JsQixTQUFVLEVBQUMsRUFBRWMsV0FBVyxDQUFDRSxlQUFlLENBQUM7TUFDakcsQ0FBQyxNQUFNO1FBQ05aLHFCQUFxQixDQUFDYyxXQUFXLENBQUUsZUFBY2xCLFNBQVUsRUFBQyxFQUFFLEVBQUUsQ0FBQztRQUNqRUkscUJBQXFCLENBQUNjLFdBQVcsQ0FBRSxxQkFBb0JsQixTQUFVLEVBQUMsRUFBRSxFQUFFLENBQUM7UUFDdkUsTUFBTW1CLFdBQVcsR0FBR3JCLEtBQUssQ0FBQ3NCLElBQUksQ0FBRSxHQUFFckIsS0FBTSxpQkFBZ0IsQ0FBVTtRQUNsRSxNQUFNc0Isc0JBQXNCLEdBQUd2QixLQUFLLENBQUNzQixJQUFJLENBQUUsR0FBRXJCLEtBQU0seUJBQXdCLENBQVU7UUFDckYsTUFBTXVCLEtBQUssR0FBR0gsV0FBVyxDQUFDSSxPQUFPLEVBQUU7UUFDbkMsSUFBSUQsS0FBSyxLQUFLLEtBQUssRUFBRTtVQUNwQkgsV0FBVyxDQUFDSyxVQUFVLENBQUMsS0FBSyxDQUFDO1VBQzdCSCxzQkFBc0IsQ0FBQ0ksVUFBVSxDQUFDSixzQkFBc0IsQ0FBQ0UsT0FBTyxFQUFFLENBQUM7UUFDcEU7TUFDRDtJQUNELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDUixxQkFBcUIsRUFBRSxVQUFVZCxLQUFZLEVBQUV5QixhQUFxQixFQUFFO01BQ3JFLElBQUloQixDQUFDO01BQ0wsSUFBSUksV0FBVztNQUNmYixLQUFLLENBQUMwQixJQUFJLENBQUMsVUFBVUMsQ0FBTSxFQUFFQyxDQUFNLEVBQUU7UUFDcEMsSUFBSUMsTUFBTSxDQUFDRixDQUFDLENBQUNGLGFBQWEsQ0FBQyxDQUFDLEdBQUdJLE1BQU0sQ0FBQ0QsQ0FBQyxDQUFDSCxhQUFhLENBQUMsQ0FBQyxFQUFFO1VBQ3hELE9BQU8sQ0FBQyxDQUFDO1FBQ1Y7UUFDQSxJQUFJSSxNQUFNLENBQUNGLENBQUMsQ0FBQ0YsYUFBYSxDQUFDLENBQUMsR0FBR0ksTUFBTSxDQUFDRCxDQUFDLENBQUNILGFBQWEsQ0FBQyxDQUFDLEVBQUU7VUFDeEQsT0FBTyxDQUFDO1FBQ1Q7UUFDQSxPQUFPLENBQUM7TUFDVCxDQUFDLENBQUM7TUFDRixJQUFJekIsS0FBSyxDQUFDVSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3JCO1FBQ0EsTUFBTW9CLElBQUksR0FBRzlCLEtBQUssQ0FBQ1UsTUFBTSxHQUFHLENBQUM7VUFBRTtVQUM5QjtVQUNBO1VBQ0FxQixPQUFPLEdBQ05ELElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUNYLENBQUNFLFVBQVUsQ0FBQ2hDLEtBQUssQ0FBQzhCLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQ0wsYUFBYSxDQUFDLENBQUMsR0FBR08sVUFBVSxDQUFDaEMsS0FBSyxDQUFDOEIsSUFBSSxDQUFDLENBQUNMLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUN6Rk8sVUFBVSxDQUFDaEMsS0FBSyxDQUFDaUMsSUFBSSxDQUFDQyxLQUFLLENBQUNKLElBQUksQ0FBQyxDQUFDLENBQUNMLGFBQWEsQ0FBQyxDQUFDO1VBQ3REO1VBQ0FVLEdBQUcsR0FBR0osT0FBTztRQUNkLEtBQUt0QixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsRUFBRSxFQUFFQSxDQUFDLEVBQUUsRUFBRTtVQUN4QkksV0FBVyxHQUFHb0IsSUFBSSxDQUFDRyxHQUFHLENBQUMsRUFBRSxFQUFFM0IsQ0FBQyxDQUFDO1VBQzdCLElBQUl3QixJQUFJLENBQUNJLEtBQUssQ0FBQ0osSUFBSSxDQUFDSyxHQUFHLENBQUNILEdBQUcsQ0FBQyxHQUFHdEIsV0FBVyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2pEO1VBQ0Q7UUFDRDtNQUNEO01BRUEsTUFBTTBCLFlBQVksR0FBR0MsWUFBWSxDQUFDQyxrQkFBa0IsQ0FBQztRQUNwREMsS0FBSyxFQUFFLE9BQU87UUFDZEMsU0FBUyxFQUFFLEtBQUs7UUFDaEJDLGNBQWMsRUFBRS9CO01BQ2pCLENBQUMsQ0FBQzs7TUFFRjtNQUNBLEtBQUtKLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1QsS0FBSyxDQUFDVSxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO1FBQ2xDLE1BQU1vQyxLQUFLLEdBQUc3QyxLQUFLLENBQUNTLENBQUMsQ0FBQztVQUNyQnFDLFlBQVksR0FBR1AsWUFBWSxDQUFDUSxNQUFNLENBQUNGLEtBQUssQ0FBQ3BCLGFBQWEsQ0FBQyxDQUFRO1VBQy9EdUIsaUJBQWlCLEdBQUdGLFlBQVksQ0FBQ0csS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUM1QztRQUNBO1FBQ0E7UUFDQSxJQUNFLENBQUNELGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJRSxRQUFRLENBQUNGLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFDakVBLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJRSxRQUFRLENBQUNGLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSUEsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLElBQzdHTCxZQUFZLEdBQUcsSUFBSSxJQUFJLElBQUksRUFDMUI7VUFDRGpDLFdBQVcsR0FBR3VDLFNBQVM7VUFDdkI7UUFDRDtNQUNEO01BQ0EsT0FBTztRQUNOckMsZUFBZSxFQUFFRixXQUFXO1FBQzVCRyxLQUFLLEVBQUVILFdBQVcsR0FBSTBCLFlBQVksQ0FBU2MsUUFBUSxFQUFFLEdBQUc7TUFDekQsQ0FBQztJQUNGLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0Msa0JBQWtCLEVBQUUsVUFBVUMsS0FBc0IsRUFBRTFDLFdBQW9CLEVBQUUyQyx3QkFBaUMsRUFBRUMsUUFBaUIsRUFBRTtNQUNqSSxJQUFJbEIsWUFBWTtNQUNoQmdCLEtBQUssR0FBRyxPQUFPQSxLQUFLLEtBQUssUUFBUSxHQUFHMUIsTUFBTSxDQUFDMEIsS0FBSyxDQUFDRyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUdILEtBQUs7TUFFM0UsSUFBSUUsUUFBUSxFQUFFO1FBQ2IsTUFBTUUsY0FBYyxHQUFHbkIsWUFBWSxDQUFDb0IsbUJBQW1CLENBQUM7VUFDdkRDLFdBQVcsRUFBRTtRQUNkLENBQUMsQ0FBQztRQUNGLE9BQU9GLGNBQWMsQ0FBQ1osTUFBTSxDQUFDZixVQUFVLENBQUN1QixLQUFLLENBQVEsRUFBRUUsUUFBUSxDQUFDO1FBQ2hFO1FBQ0E7TUFDRCxDQUFDLE1BQU0sSUFBSTVDLFdBQVcsRUFBRTtRQUN2QjBCLFlBQVksR0FBR0MsWUFBWSxDQUFDc0IsZ0JBQWdCLENBQUM7VUFDNUNwQixLQUFLLEVBQUUsT0FBTztVQUNkQyxTQUFTLEVBQUUsS0FBSztVQUNoQkMsY0FBYyxFQUFFL0IsV0FBVztVQUMzQmtELGFBQWEsRUFBRVA7UUFDaEIsQ0FBQyxDQUFDO1FBQ0YsT0FBT2pCLFlBQVksQ0FBQ1EsTUFBTSxDQUFDZixVQUFVLENBQUN1QixLQUFLLENBQVEsQ0FBQztNQUNyRCxDQUFDLE1BQU07UUFDTmhCLFlBQVksR0FBR0MsWUFBWSxDQUFDc0IsZ0JBQWdCLENBQUM7VUFDNUNFLFFBQVEsRUFBRVI7UUFDWCxDQUFDLENBQUM7UUFDRixPQUFPakIsWUFBWSxDQUFDUSxNQUFNLENBQUNmLFVBQVUsQ0FBQ3VCLEtBQUssQ0FBUSxDQUFDO01BQ3JEO0lBQ0QsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ1UsZUFBZSxFQUFFLFVBQVVyRSxpQkFBc0IsRUFBRXNFLFlBQWlCLEVBQUVyRSxLQUFXLEVBQUVFLFNBQWlCLEVBQUU7TUFDckcsTUFBTW9FLElBQUksR0FBR3ZFLGlCQUFpQixDQUFDTSxJQUFJLENBQUMsS0FBSyxDQUFDO01BQzFDLElBQUlrRSxJQUFJO01BQ1IsSUFBSUMsU0FBUztNQUNiLElBQUlGLElBQUksSUFBSUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQ2hDQyxJQUFJLEdBQUdELElBQUksQ0FBQyxhQUFhLENBQUM7UUFDMUJFLFNBQVMsR0FBR0QsSUFBSSxDQUFDRSxLQUFLLEdBQUdKLFlBQVksQ0FBQ0UsSUFBSSxDQUFDRSxLQUFLLENBQUMsR0FBR0YsSUFBSTtNQUN6RCxDQUFDLE1BQU0sSUFBSUQsSUFBSSxJQUFJQSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDaENDLElBQUksR0FBR0QsSUFBSSxDQUFDLE1BQU0sQ0FBQztNQUNwQjtNQUNBLElBQUlDLElBQUksRUFBRTtRQUNULE1BQU1HLFNBQVMsR0FBR0gsSUFBSSxDQUFDRSxLQUFLLEdBQUdKLFlBQVksQ0FBQ0UsSUFBSSxDQUFDRSxLQUFLLENBQUMsR0FBR0YsSUFBSTtRQUM5RCxNQUFNakUscUJBQXFCLEdBQUdOLEtBQUssQ0FBQ08saUJBQWlCLENBQUMsVUFBVSxDQUF5QjtRQUN6RkQscUJBQXFCLENBQUNjLFdBQVcsQ0FBRSxPQUFNbEIsU0FBVSxFQUFDLEVBQUV3RSxTQUFTLENBQUM7UUFDaEUsSUFBSUYsU0FBUyxFQUFFO1VBQ2RsRSxxQkFBcUIsQ0FBQ2MsV0FBVyxDQUFFLFlBQVdsQixTQUFVLEVBQUMsRUFBRXdFLFNBQVMsQ0FBQztRQUN0RTtNQUNEO0lBQ0QsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsMkJBQTJCLEVBQUUsVUFBVTVFLGlCQUFzQixFQUFFQyxLQUFXLEVBQUVDLEtBQWEsRUFBRUMsU0FBaUIsRUFBRTtNQUM3RyxJQUFJLENBQUNILGlCQUFpQixDQUFDTSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDM0MsSUFBSSxDQUFDUCwyQkFBMkIsQ0FBQ0MsaUJBQWlCLEVBQUVDLEtBQUssRUFBRUMsS0FBSyxFQUFFQyxTQUFTLENBQUM7TUFDN0UsQ0FBQyxNQUFNO1FBQ04sTUFBTXdDLFlBQVksR0FBR0MsWUFBWSxDQUFDQyxrQkFBa0IsQ0FBQztVQUNwREMsS0FBSyxFQUFFLE9BQU87VUFDZEMsU0FBUyxFQUFFLEtBQUs7VUFDaEJDLGNBQWMsRUFBRWhELGlCQUFpQixDQUFDTSxJQUFJLENBQUMsYUFBYTtRQUNyRCxDQUFDLENBQUM7UUFDRixNQUFNQyxxQkFBcUIsR0FBR04sS0FBSyxDQUFDTyxpQkFBaUIsQ0FBQyxVQUFVLENBQXlCO1FBQ3pGRCxxQkFBcUIsQ0FBQ2MsV0FBVyxDQUFFLGVBQWNsQixTQUFVLEVBQUMsRUFBR3dDLFlBQVksQ0FBU2MsUUFBUSxFQUFFLENBQUM7TUFDaEc7SUFDRCxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ29CLHlCQUF5QixFQUFFLFVBQVVDLGdCQUF3QixFQUFFQyxXQUFtQixFQUFFNUUsU0FBaUIsRUFBRUYsS0FBVyxFQUFFO01BQ25ILE1BQU1NLHFCQUFxQixHQUFHTixLQUFLLENBQUNPLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7TUFDekZELHFCQUFxQixDQUFDYyxXQUFXLENBQUNsQixTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDaERJLHFCQUFxQixDQUFDYyxXQUFXLENBQUNsQixTQUFTLEVBQUU7UUFDNUM2RSxpQkFBaUIsRUFBRUYsZ0JBQWdCO1FBQ25DRyxZQUFZLEVBQUVGLFdBQVc7UUFDekJHLFNBQVMsRUFBRTtNQUNaLENBQUMsQ0FBQztJQUNILENBQUM7SUFDRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxjQUFjLEVBQUUsVUFBVUMsU0FBb0IsRUFBRUMsVUFBa0IsRUFBRTtNQUNuRSxNQUFNcEMsS0FBSyxHQUFHLEVBQUU7TUFDaEIsSUFBSW1DLFNBQVMsSUFBSUMsVUFBVSxFQUFFO1FBQzVCLEtBQUssSUFBSXhFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3VFLFNBQVMsQ0FBQ3RFLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUU7VUFDMUMsTUFBTXlFLFlBQVksR0FBR0YsU0FBUyxDQUFDdkUsQ0FBQyxDQUFDLElBQUl1RSxTQUFTLENBQUN2RSxDQUFDLENBQUMsQ0FBQ0csU0FBUyxFQUFFO1VBQzdEaUMsS0FBSyxDQUFDbEMsSUFBSSxDQUFDdUUsWUFBWSxDQUFDRCxVQUFVLENBQUMsQ0FBQztRQUNyQztNQUNEO01BQ0EsT0FBTyxDQUFDLENBQUNwQyxLQUFLLENBQUNzQyxNQUFNLENBQUMsVUFBVWpGLElBQVMsRUFBRWtGLEdBQVEsRUFBRTtRQUNwRCxPQUFPbEYsSUFBSSxLQUFLa0YsR0FBRyxHQUFHbEYsSUFBSSxHQUFHbUYsR0FBRztNQUNqQyxDQUFDLENBQUM7SUFDSCxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLGtCQUFrQixFQUFFLFVBQ25CdEYsS0FBZ0IsRUFDaEJKLGlCQUFzQixFQUN0QkcsU0FBaUIsRUFDakJ3RixlQUErQixFQUMvQjFGLEtBQVcsRUFDVjtNQUNELE1BQU1zRSxJQUFJLEdBQUd2RSxpQkFBaUIsQ0FBQ00sSUFBSSxDQUFDLEtBQUssQ0FBQztNQUMxQyxNQUFNc0YsV0FBVyxHQUFHckIsSUFBSSxJQUFJQSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUlBLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQ0csS0FBSztNQUM1RSxNQUFNbUIsT0FBTyxHQUFHdEIsSUFBSSxJQUFJQSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUlBLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQ0csS0FBSztNQUMxRCxNQUFNVyxVQUFVLEdBQUdPLFdBQVcsSUFBSUMsT0FBTztNQUN6QyxJQUFJZixnQkFBZ0IsRUFBRUMsV0FBVztNQUNqQyxJQUFJTSxVQUFVLEVBQUU7UUFDZixJQUFJLENBQUMsSUFBSSxDQUFDRixjQUFjLENBQUMvRSxLQUFLLEVBQUVpRixVQUFVLENBQUMsRUFBRTtVQUM1QyxJQUFJTyxXQUFXLEVBQUU7WUFDaEJkLGdCQUFnQixHQUFHYSxlQUFlLENBQUNqRSxPQUFPLENBQUMsc0NBQXNDLENBQUM7WUFDbEZxRCxXQUFXLEdBQUdZLGVBQWUsQ0FBQ2pFLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRTJELFVBQVUsQ0FBQztZQUN2RixJQUFJLENBQUNSLHlCQUF5QixDQUFDQyxnQkFBZ0IsRUFBRUMsV0FBVyxFQUFFNUUsU0FBUyxFQUFFRixLQUFLLENBQUM7WUFDL0U2RixHQUFHLENBQUNDLE9BQU8sQ0FBRSwwQ0FBeUNWLFVBQVcsRUFBQyxDQUFDO1VBQ3BFLENBQUMsTUFBTSxJQUFJUSxPQUFPLEVBQUU7WUFDbkJmLGdCQUFnQixHQUFHYSxlQUFlLENBQUNqRSxPQUFPLENBQUMsc0NBQXNDLENBQUM7WUFDbEZxRCxXQUFXLEdBQUdZLGVBQWUsQ0FBQ2pFLE9BQU8sQ0FBQyxnQ0FBZ0MsRUFBRTJELFVBQVUsQ0FBQztZQUNuRixJQUFJLENBQUNSLHlCQUF5QixDQUFDQyxnQkFBZ0IsRUFBRUMsV0FBVyxFQUFFNUUsU0FBUyxFQUFFRixLQUFLLENBQUM7WUFDL0U2RixHQUFHLENBQUNDLE9BQU8sQ0FBRSxzQ0FBcUNWLFVBQVcsRUFBQyxDQUFDO1VBQ2hFO1FBQ0Q7TUFDRDtJQUNELENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDVyxnQkFBZ0IsRUFBRSxVQUFVN0YsU0FBaUIsRUFBRXdGLGVBQStCLEVBQUUxRixLQUFXLEVBQUU7TUFDNUYsTUFBTTZFLGdCQUFnQixHQUFHYSxlQUFlLENBQUNqRSxPQUFPLENBQUMsc0NBQXNDLENBQUM7TUFDeEYsTUFBTXFELFdBQVcsR0FBR1ksZUFBZSxDQUFDakUsT0FBTyxDQUFDLDhCQUE4QixDQUFDO01BQzNFLElBQUksQ0FBQ21ELHlCQUF5QixDQUFDQyxnQkFBZ0IsRUFBRUMsV0FBVyxFQUFFNUUsU0FBUyxFQUFFRixLQUFLLENBQUM7SUFDaEYsQ0FBQztJQUNEZ0cscUJBQXFCLEVBQUUsVUFBVUMsaUJBQXNCLEVBQUU7TUFDeEQsTUFBTUMsb0JBQXlCLEdBQUcsQ0FBQyxDQUFDO01BQ3BDQyxNQUFNLENBQUNDLElBQUksQ0FBQ0gsaUJBQWlCLENBQUMsQ0FBQ0ksT0FBTyxDQUFDLFVBQVVDLElBQVksRUFBRTtRQUM5RCxNQUFNQyxvQkFBb0IsR0FBRyxFQUFFO1FBQy9CLE1BQU1DLFdBQVcsR0FBR1AsaUJBQWlCLENBQUNLLElBQUksQ0FBQztRQUMzQyxLQUFLLElBQUkxRixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc0RixXQUFXLENBQUMzRixNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO1VBQzVDLE1BQU02RixNQUFNLEdBQUdELFdBQVcsQ0FBQzVGLENBQUMsQ0FBQyxDQUFDOEYsTUFBTSxHQUFHLENBQUNGLFdBQVcsQ0FBQzVGLENBQUMsQ0FBQyxDQUFDK0YsTUFBTSxFQUFFSCxXQUFXLENBQUM1RixDQUFDLENBQUMsQ0FBQzhGLE1BQU0sQ0FBQyxHQUFHLENBQUNGLFdBQVcsQ0FBQzVGLENBQUMsQ0FBQyxDQUFDK0YsTUFBTSxDQUFDO1VBQy9HSixvQkFBb0IsQ0FBQ3pGLElBQUksQ0FDeEI4RixTQUFTLENBQUNDLGVBQWUsQ0FBQ0wsV0FBVyxDQUFDNUYsQ0FBQyxDQUFDLENBQUNrRyxRQUFRLEVBQUVMLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBdUIsQ0FDekc7UUFDRjtRQUNBLElBQUlGLG9CQUFvQixDQUFDMUYsTUFBTSxFQUFFO1VBQ2hDcUYsb0JBQW9CLENBQUNJLElBQUksQ0FBQyxHQUFHQyxvQkFBb0I7UUFDbEQ7TUFDRCxDQUFDLENBQUM7TUFDRixPQUFPTCxvQkFBb0I7SUFDNUIsQ0FBQztJQUNEYSxtQkFBbUIsRUFBRSxVQUFVQyxLQUFVLEVBQUVDLGNBQW1CLEVBQUVDLGFBQWtCLEVBQUU7TUFDbkYsSUFBSVAsTUFBTSxFQUFFRCxNQUFNO01BQ2xCLElBQUlPLGNBQWMsQ0FBQ0UsS0FBSyxLQUFLLG9CQUFvQixFQUFFO1FBQ2xEUixNQUFNLEdBQUcsSUFBSSxDQUFDUyxjQUFjLENBQUNDLHFCQUFxQixDQUFDLElBQUksQ0FBQ0MsZUFBZSxDQUFDTixLQUFLLENBQUNPLEdBQUcsQ0FBQyxFQUFFTixjQUFjLENBQUNFLEtBQUssQ0FBQyxDQUFDO1FBQzFHVCxNQUFNLEdBQUdNLEtBQUssQ0FBQ1EsSUFBSSxHQUFHLElBQUksQ0FBQ0osY0FBYyxDQUFDQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUNDLGVBQWUsQ0FBQ04sS0FBSyxDQUFDUSxJQUFJLENBQUMsRUFBRVAsY0FBYyxDQUFDRSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUk7TUFDaEksQ0FBQyxNQUFNO1FBQ05SLE1BQU0sR0FBR0ssS0FBSyxDQUFDTyxHQUFHO1FBQ2xCYixNQUFNLEdBQUdNLEtBQUssQ0FBQ1EsSUFBSSxHQUFHUixLQUFLLENBQUNRLElBQUksR0FBRyxJQUFJO01BQ3hDO01BQ0EsT0FBTztRQUNOVixRQUFRLEVBQUVFLEtBQUssQ0FBQ1MsTUFBTSxHQUFHQyxnQkFBZ0IsQ0FBQ1YsS0FBSyxDQUFDUyxNQUFNLENBQUNFLFdBQVcsSUFBSVgsS0FBSyxDQUFDUyxNQUFNLENBQUMsR0FBRyxJQUFJO1FBQzFGZCxNQUFNLEVBQUVBLE1BQU07UUFDZEQsTUFBTSxFQUFFQSxNQUFNO1FBQ2RrQixJQUFJLEVBQUVWO01BQ1AsQ0FBQztJQUNGLENBQUM7SUFDREUsY0FBYyxFQUFFLFVBQVVTLE1BQVcsRUFBRTtNQUN0QyxPQUFPLElBQUksQ0FBQ0Msd0JBQXdCLEVBQUUsQ0FBQ0MsVUFBVSxDQUFDRixNQUFNLEVBQUUsUUFBUSxDQUFDO0lBQ3BFLENBQUM7SUFDRFAsZUFBZSxFQUFFLFVBQVVPLE1BQVcsRUFBRTtNQUN2QyxPQUFPLElBQUksQ0FBQ0Msd0JBQXdCLEVBQUUsQ0FBQ0UsV0FBVyxDQUFDSCxNQUFNLEVBQUUsUUFBUSxDQUFDO0lBQ3JFLENBQUM7SUFDREMsd0JBQXdCLEVBQUUsWUFBWTtNQUNyQyxPQUFPLElBQUlHLGNBQWMsQ0FBQztRQUFFQyxPQUFPLEVBQUUsc0JBQXNCO1FBQUVDLFlBQVksRUFBRTtNQUFZLENBQUMsRUFBRTtRQUFFQyxFQUFFLEVBQUU7TUFBSyxDQUFDLENBQUM7SUFDeEc7RUFDRCxDQUFDO0VBQUMsT0FFYXZJLGlCQUFpQjtBQUFBIn0=