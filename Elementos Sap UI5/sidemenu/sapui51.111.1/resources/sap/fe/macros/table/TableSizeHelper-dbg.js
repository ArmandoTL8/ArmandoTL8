/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/templating/DisplayModeFormatter", "sap/m/Button", "sap/m/table/Util", "sap/ui/dom/units/Rem"], function (Log, DisplayModeFormatter, Button, TableUtil, Rem) {
  "use strict";

  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  const TableSizeHelper = {
    nbCalls: 0,
    oBtn: undefined,
    propertyHelper: undefined,
    init: function () {
      // Create a new button in static area sap.ui.getCore().getStaticAreaRef()
      this.nbCalls = this.nbCalls ? this.nbCalls : 0;
      this.nbCalls++;
      this.oBtn = this.oBtn ? this.oBtn : new Button().placeAt(sap.ui.getCore().getStaticAreaRef());
      // Hide button from accessibility tree
      this.oBtn.setVisible(false);
    },
    /**
     * Method to calculate the width of the button from a temporarily created button placed in the static area.
     *
     * @param text The text to measure inside the Button.
     * @returns The value of the Button width.
     */
    getButtonWidth: function (text) {
      if (!text) {
        return 0;
      }
      if (this.oBtn.getVisible() === false) {
        this.oBtn.setVisible(true);
      }
      this.oBtn.setText(text);
      //adding missing styles from buttons inside a table
      // for sync rendering
      this.oBtn.rerender();
      const nButtonWidth = Rem.fromPx(this.oBtn.getDomRef().scrollWidth);
      this.oBtn.setVisible(false);
      return Math.round(nButtonWidth * 100) / 100;
    },
    /**
     * Method to calculate the width of the MDCColumn.
     *
     * @param dataField The Property or PropertyInfo Object for which the width will be calculated.
     * @param properties An array containing all property definitions (optional)
     * @param convertedMetaData
     * @param includeLabel Indicates if the label should be part of the width calculation
     * @private
     * @alias sap.fe.macros.TableSizeHelper
     * @returns The width of the column.
     */
    getMDCColumnWidthFromDataField: function (dataField, properties, convertedMetaData) {
      let includeLabel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      const property = properties.find(prop => {
        var _convertedMetaData$re, _convertedMetaData$re2;
        return prop.metadataPath && ((_convertedMetaData$re = convertedMetaData.resolvePath(prop.metadataPath)) === null || _convertedMetaData$re === void 0 ? void 0 : (_convertedMetaData$re2 = _convertedMetaData$re.target) === null || _convertedMetaData$re2 === void 0 ? void 0 : _convertedMetaData$re2.fullyQualifiedName) === dataField.fullyQualifiedName;
      });
      return property ? this.getMDCColumnWidthFromProperty(property, properties, includeLabel) : 0;
    },
    getMDCColumnWidthFromProperty: function (property, properties) {
      var _property$visualSetti, _property$propertyInf, _property$typeConfig;
      let includeLabel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      const mWidthCalculation = Object.assign({
        gap: 0,
        truncateLabel: !includeLabel,
        excludeProperties: []
      }, (_property$visualSetti = property.visualSettings) === null || _property$visualSetti === void 0 ? void 0 : _property$visualSetti.widthCalculation);
      let types;
      if ((_property$propertyInf = property.propertyInfos) !== null && _property$propertyInf !== void 0 && _property$propertyInf.length) {
        types = property.propertyInfos.map(propName => {
          var _prop$typeConfig;
          const prop = properties.find(_property => _property.name === propName);
          return prop === null || prop === void 0 ? void 0 : (_prop$typeConfig = prop.typeConfig) === null || _prop$typeConfig === void 0 ? void 0 : _prop$typeConfig.typeInstance;
        }).filter(item => item);
      } else if (property !== null && property !== void 0 && (_property$typeConfig = property.typeConfig) !== null && _property$typeConfig !== void 0 && _property$typeConfig.typeInstance) {
        types = [property === null || property === void 0 ? void 0 : property.typeConfig.typeInstance];
      }
      const sSize = types ? TableUtil.calcColumnWidth(types, property.label, mWidthCalculation) : null;
      if (!sSize) {
        Log.error(`Cannot compute the column width for property: ${property.name}`);
      }
      return sSize ? parseFloat(sSize.replace("Rem", "")) : 0;
    },
    _getPropertyHelperCache: function (sTableId) {
      return this.propertyHelper && this.propertyHelper[sTableId];
    },
    _setPropertyHelperCache: function (sTableId, oPropertyHelper) {
      this.propertyHelper = Object.assign({}, this.propertyHelper);
      this.propertyHelper[sTableId] = oPropertyHelper;
    },
    /**
     * Method to calculate the  width of a DataFieldAnnotation object contained in a fieldGroup.
     *
     * @param dataField DataFieldAnnotation object.
     * @param properties Array containing all PropertyInfo objects.
     * @param convertedMetaData
     * @param showDataFieldsLabel Label is displayed inside the field
     * @private
     * @alias sap.fe.macros.TableSizeHelper
     * @returns Object containing the width of the label and the width of the property.
     */
    getWidthForDataFieldForAnnotation: function (dataField, properties, convertedMetaData) {
      var _dataField$Target;
      let showDataFieldsLabel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      const oTargetedProperty = dataField === null || dataField === void 0 ? void 0 : (_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : _dataField$Target.$target;
      let nPropertyWidth = 0,
        fLabelWidth = 0;
      if (oTargetedProperty !== null && oTargetedProperty !== void 0 && oTargetedProperty.Visualization) {
        switch (oTargetedProperty.Visualization) {
          case "UI.VisualizationType/Rating":
            const nbStars = oTargetedProperty.TargetValue;
            nPropertyWidth = parseInt(nbStars, 10) * 1.375;
            break;
          case "UI.VisualizationType/Progress":
          default:
            nPropertyWidth = 5;
        }
        const sLabel = oTargetedProperty ? oTargetedProperty.label : dataField.Label || "";
        fLabelWidth = showDataFieldsLabel && sLabel ? TableSizeHelper.getButtonWidth(sLabel) : 0;
      } else if (convertedMetaData && properties && (oTargetedProperty === null || oTargetedProperty === void 0 ? void 0 : oTargetedProperty.$Type) === "com.sap.vocabularies.Communication.v1.ContactType") {
        nPropertyWidth = this.getMDCColumnWidthFromDataField(oTargetedProperty.fn.$target, properties, convertedMetaData, false);
      }
      return {
        labelWidth: fLabelWidth,
        propertyWidth: nPropertyWidth
      };
    },
    /**
     * Method to calculate the width of a DataField object.
     *
     * @param dataField DataFieldAnnotation object.
     * @param showDataFieldsLabel Label is displayed inside the field.
     * @param properties Array containing all PropertyInfo objects.
     * @param convertedMetaData Context Object of the parent property.
     * @private
     * @alias sap.fe.macros.TableSizeHelper
     * @returns {object} Object containing the width of the label and the width of the property.
     */

    getWidthForDataField: function (dataField, showDataFieldsLabel, properties, convertedMetaData) {
      var _dataField$Value, _oTargetedProperty$an, _oTargetedProperty$an2, _dataField$Value2;
      const oTargetedProperty = (_dataField$Value = dataField.Value) === null || _dataField$Value === void 0 ? void 0 : _dataField$Value.$target,
        oTextArrangementTarget = oTargetedProperty === null || oTargetedProperty === void 0 ? void 0 : (_oTargetedProperty$an = oTargetedProperty.annotations) === null || _oTargetedProperty$an === void 0 ? void 0 : (_oTargetedProperty$an2 = _oTargetedProperty$an.Common) === null || _oTargetedProperty$an2 === void 0 ? void 0 : _oTargetedProperty$an2.Text,
        displayMode = getDisplayMode((_dataField$Value2 = dataField.Value) === null || _dataField$Value2 === void 0 ? void 0 : _dataField$Value2.$target);
      let nPropertyWidth = 0,
        fLabelWidth = 0;
      if (oTargetedProperty) {
        switch (displayMode) {
          case "Description":
            nPropertyWidth = this.getMDCColumnWidthFromDataField(oTextArrangementTarget.$target, properties, convertedMetaData, false) - 1;
            break;
          case "DescriptionValue":
          case "ValueDescription":
          case "Value":
          default:
            nPropertyWidth = this.getMDCColumnWidthFromDataField(oTargetedProperty, properties, convertedMetaData, false) - 1;
        }
        const sLabel = dataField.Label ? dataField.Label : oTargetedProperty.label;
        fLabelWidth = showDataFieldsLabel && sLabel ? TableSizeHelper.getButtonWidth(sLabel) : 0;
      } else {
        Log.error(`Cannot compute width for type object: ${dataField.$Type}`);
      }
      return {
        labelWidth: fLabelWidth,
        propertyWidth: nPropertyWidth
      };
    },
    _getPropertiesByPath: function (aProperties, sPath) {
      return aProperties.find(function (oProperty) {
        return oProperty.path === sPath;
      });
    },
    exit: function () {
      this.nbCalls--;
      if (this.nbCalls === 0) {
        this.oBtn.destroy();
        this.oBtn = null;
      }
    }
  };
  return TableSizeHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWJsZVNpemVIZWxwZXIiLCJuYkNhbGxzIiwib0J0biIsInVuZGVmaW5lZCIsInByb3BlcnR5SGVscGVyIiwiaW5pdCIsIkJ1dHRvbiIsInBsYWNlQXQiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJnZXRTdGF0aWNBcmVhUmVmIiwic2V0VmlzaWJsZSIsImdldEJ1dHRvbldpZHRoIiwidGV4dCIsImdldFZpc2libGUiLCJzZXRUZXh0IiwicmVyZW5kZXIiLCJuQnV0dG9uV2lkdGgiLCJSZW0iLCJmcm9tUHgiLCJnZXREb21SZWYiLCJzY3JvbGxXaWR0aCIsIk1hdGgiLCJyb3VuZCIsImdldE1EQ0NvbHVtbldpZHRoRnJvbURhdGFGaWVsZCIsImRhdGFGaWVsZCIsInByb3BlcnRpZXMiLCJjb252ZXJ0ZWRNZXRhRGF0YSIsImluY2x1ZGVMYWJlbCIsInByb3BlcnR5IiwiZmluZCIsInByb3AiLCJtZXRhZGF0YVBhdGgiLCJyZXNvbHZlUGF0aCIsInRhcmdldCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImdldE1EQ0NvbHVtbldpZHRoRnJvbVByb3BlcnR5IiwibVdpZHRoQ2FsY3VsYXRpb24iLCJPYmplY3QiLCJhc3NpZ24iLCJnYXAiLCJ0cnVuY2F0ZUxhYmVsIiwiZXhjbHVkZVByb3BlcnRpZXMiLCJ2aXN1YWxTZXR0aW5ncyIsIndpZHRoQ2FsY3VsYXRpb24iLCJ0eXBlcyIsInByb3BlcnR5SW5mb3MiLCJsZW5ndGgiLCJtYXAiLCJwcm9wTmFtZSIsIl9wcm9wZXJ0eSIsIm5hbWUiLCJ0eXBlQ29uZmlnIiwidHlwZUluc3RhbmNlIiwiZmlsdGVyIiwiaXRlbSIsInNTaXplIiwiVGFibGVVdGlsIiwiY2FsY0NvbHVtbldpZHRoIiwibGFiZWwiLCJMb2ciLCJlcnJvciIsInBhcnNlRmxvYXQiLCJyZXBsYWNlIiwiX2dldFByb3BlcnR5SGVscGVyQ2FjaGUiLCJzVGFibGVJZCIsIl9zZXRQcm9wZXJ0eUhlbHBlckNhY2hlIiwib1Byb3BlcnR5SGVscGVyIiwiZ2V0V2lkdGhGb3JEYXRhRmllbGRGb3JBbm5vdGF0aW9uIiwic2hvd0RhdGFGaWVsZHNMYWJlbCIsIm9UYXJnZXRlZFByb3BlcnR5IiwiVGFyZ2V0IiwiJHRhcmdldCIsIm5Qcm9wZXJ0eVdpZHRoIiwiZkxhYmVsV2lkdGgiLCJWaXN1YWxpemF0aW9uIiwibmJTdGFycyIsIlRhcmdldFZhbHVlIiwicGFyc2VJbnQiLCJzTGFiZWwiLCJMYWJlbCIsIiRUeXBlIiwiZm4iLCJsYWJlbFdpZHRoIiwicHJvcGVydHlXaWR0aCIsImdldFdpZHRoRm9yRGF0YUZpZWxkIiwiVmFsdWUiLCJvVGV4dEFycmFuZ2VtZW50VGFyZ2V0IiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJUZXh0IiwiZGlzcGxheU1vZGUiLCJnZXREaXNwbGF5TW9kZSIsIl9nZXRQcm9wZXJ0aWVzQnlQYXRoIiwiYVByb3BlcnRpZXMiLCJzUGF0aCIsIm9Qcm9wZXJ0eSIsInBhdGgiLCJleGl0IiwiZGVzdHJveSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGFibGVTaXplSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnZlcnRlZE1ldGFkYXRhIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL0VkbVwiO1xuaW1wb3J0IHsgQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbXVuaWNhdGlvblwiO1xuaW1wb3J0IHsgRGF0YUZpZWxkLCBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBBbm5vdGF0aW9uVGFibGVDb2x1bW4gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7IGdldERpc3BsYXlNb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGlzcGxheU1vZGVGb3JtYXR0ZXJcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IFRhYmxlVXRpbCBmcm9tIFwic2FwL20vdGFibGUvVXRpbFwiO1xuaW1wb3J0IFJlbSBmcm9tIFwic2FwL3VpL2RvbS91bml0cy9SZW1cIjtcbmltcG9ydCB7IFByb3BlcnR5SW5mbyB9IGZyb20gXCIuLi9EZWxlZ2F0ZVV0aWxcIjtcblxuY29uc3QgVGFibGVTaXplSGVscGVyID0ge1xuXHRuYkNhbGxzOiAwLFxuXHRvQnRuOiB1bmRlZmluZWQgYXMgYW55LFxuXHRwcm9wZXJ0eUhlbHBlcjogdW5kZWZpbmVkIGFzIGFueSxcblx0aW5pdDogZnVuY3Rpb24gKCkge1xuXHRcdC8vIENyZWF0ZSBhIG5ldyBidXR0b24gaW4gc3RhdGljIGFyZWEgc2FwLnVpLmdldENvcmUoKS5nZXRTdGF0aWNBcmVhUmVmKClcblx0XHR0aGlzLm5iQ2FsbHMgPSB0aGlzLm5iQ2FsbHMgPyB0aGlzLm5iQ2FsbHMgOiAwO1xuXHRcdHRoaXMubmJDYWxscysrO1xuXHRcdHRoaXMub0J0biA9IHRoaXMub0J0biA/IHRoaXMub0J0biA6IG5ldyBCdXR0b24oKS5wbGFjZUF0KHNhcC51aS5nZXRDb3JlKCkuZ2V0U3RhdGljQXJlYVJlZigpKTtcblx0XHQvLyBIaWRlIGJ1dHRvbiBmcm9tIGFjY2Vzc2liaWxpdHkgdHJlZVxuXHRcdHRoaXMub0J0bi5zZXRWaXNpYmxlKGZhbHNlKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBjYWxjdWxhdGUgdGhlIHdpZHRoIG9mIHRoZSBidXR0b24gZnJvbSBhIHRlbXBvcmFyaWx5IGNyZWF0ZWQgYnV0dG9uIHBsYWNlZCBpbiB0aGUgc3RhdGljIGFyZWEuXG5cdCAqXG5cdCAqIEBwYXJhbSB0ZXh0IFRoZSB0ZXh0IHRvIG1lYXN1cmUgaW5zaWRlIHRoZSBCdXR0b24uXG5cdCAqIEByZXR1cm5zIFRoZSB2YWx1ZSBvZiB0aGUgQnV0dG9uIHdpZHRoLlxuXHQgKi9cblx0Z2V0QnV0dG9uV2lkdGg6IGZ1bmN0aW9uICh0ZXh0Pzogc3RyaW5nKTogbnVtYmVyIHtcblx0XHRpZiAoIXRleHQpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblx0XHRpZiAodGhpcy5vQnRuLmdldFZpc2libGUoKSA9PT0gZmFsc2UpIHtcblx0XHRcdHRoaXMub0J0bi5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdH1cblx0XHR0aGlzLm9CdG4uc2V0VGV4dCh0ZXh0KTtcblx0XHQvL2FkZGluZyBtaXNzaW5nIHN0eWxlcyBmcm9tIGJ1dHRvbnMgaW5zaWRlIGEgdGFibGVcblx0XHQvLyBmb3Igc3luYyByZW5kZXJpbmdcblx0XHR0aGlzLm9CdG4ucmVyZW5kZXIoKTtcblx0XHRjb25zdCBuQnV0dG9uV2lkdGggPSBSZW0uZnJvbVB4KHRoaXMub0J0bi5nZXREb21SZWYoKS5zY3JvbGxXaWR0aCk7XG5cdFx0dGhpcy5vQnRuLnNldFZpc2libGUoZmFsc2UpO1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKG5CdXR0b25XaWR0aCAqIDEwMCkgLyAxMDA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBjYWxjdWxhdGUgdGhlIHdpZHRoIG9mIHRoZSBNRENDb2x1bW4uXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIFByb3BlcnR5IG9yIFByb3BlcnR5SW5mbyBPYmplY3QgZm9yIHdoaWNoIHRoZSB3aWR0aCB3aWxsIGJlIGNhbGN1bGF0ZWQuXG5cdCAqIEBwYXJhbSBwcm9wZXJ0aWVzIEFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIHByb3BlcnR5IGRlZmluaXRpb25zIChvcHRpb25hbClcblx0ICogQHBhcmFtIGNvbnZlcnRlZE1ldGFEYXRhXG5cdCAqIEBwYXJhbSBpbmNsdWRlTGFiZWwgSW5kaWNhdGVzIGlmIHRoZSBsYWJlbCBzaG91bGQgYmUgcGFydCBvZiB0aGUgd2lkdGggY2FsY3VsYXRpb25cblx0ICogQHByaXZhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVTaXplSGVscGVyXG5cdCAqIEByZXR1cm5zIFRoZSB3aWR0aCBvZiB0aGUgY29sdW1uLlxuXHQgKi9cblx0Z2V0TURDQ29sdW1uV2lkdGhGcm9tRGF0YUZpZWxkOiBmdW5jdGlvbiAoXG5cdFx0ZGF0YUZpZWxkOiBEYXRhRmllbGQsXG5cdFx0cHJvcGVydGllczogUHJvcGVydHlJbmZvW10sXG5cdFx0Y29udmVydGVkTWV0YURhdGE6IENvbnZlcnRlZE1ldGFkYXRhLFxuXHRcdGluY2x1ZGVMYWJlbCA9IGZhbHNlXG5cdCk6IG51bWJlciB7XG5cdFx0Y29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzLmZpbmQoXG5cdFx0XHQocHJvcCkgPT5cblx0XHRcdFx0cHJvcC5tZXRhZGF0YVBhdGggJiZcblx0XHRcdFx0KGNvbnZlcnRlZE1ldGFEYXRhLnJlc29sdmVQYXRoKHByb3AubWV0YWRhdGFQYXRoKSBhcyBhbnkpPy50YXJnZXQ/LmZ1bGx5UXVhbGlmaWVkTmFtZSA9PT0gZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdCk7XG5cdFx0cmV0dXJuIHByb3BlcnR5ID8gdGhpcy5nZXRNRENDb2x1bW5XaWR0aEZyb21Qcm9wZXJ0eShwcm9wZXJ0eSwgcHJvcGVydGllcywgaW5jbHVkZUxhYmVsKSA6IDA7XG5cdH0sXG5cblx0Z2V0TURDQ29sdW1uV2lkdGhGcm9tUHJvcGVydHk6IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHlJbmZvLCBwcm9wZXJ0aWVzOiBQcm9wZXJ0eUluZm9bXSwgaW5jbHVkZUxhYmVsID0gZmFsc2UpOiBudW1iZXIge1xuXHRcdGNvbnN0IG1XaWR0aENhbGN1bGF0aW9uID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdHtcblx0XHRcdFx0Z2FwOiAwLFxuXHRcdFx0XHR0cnVuY2F0ZUxhYmVsOiAhaW5jbHVkZUxhYmVsLFxuXHRcdFx0XHRleGNsdWRlUHJvcGVydGllczogW11cblx0XHRcdH0sXG5cdFx0XHRwcm9wZXJ0eS52aXN1YWxTZXR0aW5ncz8ud2lkdGhDYWxjdWxhdGlvblxuXHRcdCk7XG5cblx0XHRsZXQgdHlwZXM7XG5cblx0XHRpZiAocHJvcGVydHkucHJvcGVydHlJbmZvcz8ubGVuZ3RoKSB7XG5cdFx0XHR0eXBlcyA9IHByb3BlcnR5LnByb3BlcnR5SW5mb3Ncblx0XHRcdFx0Lm1hcCgocHJvcE5hbWUpID0+IHtcblx0XHRcdFx0XHRjb25zdCBwcm9wID0gcHJvcGVydGllcy5maW5kKChfcHJvcGVydHkpID0+IF9wcm9wZXJ0eS5uYW1lID09PSBwcm9wTmFtZSk7XG5cdFx0XHRcdFx0cmV0dXJuIHByb3A/LnR5cGVDb25maWc/LnR5cGVJbnN0YW5jZTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbSk7XG5cdFx0fSBlbHNlIGlmIChwcm9wZXJ0eT8udHlwZUNvbmZpZz8udHlwZUluc3RhbmNlKSB7XG5cdFx0XHR0eXBlcyA9IFtwcm9wZXJ0eT8udHlwZUNvbmZpZy50eXBlSW5zdGFuY2VdO1xuXHRcdH1cblx0XHRjb25zdCBzU2l6ZSA9IHR5cGVzID8gVGFibGVVdGlsLmNhbGNDb2x1bW5XaWR0aCh0eXBlcywgcHJvcGVydHkubGFiZWwsIG1XaWR0aENhbGN1bGF0aW9uKSA6IG51bGw7XG5cdFx0aWYgKCFzU2l6ZSkge1xuXHRcdFx0TG9nLmVycm9yKGBDYW5ub3QgY29tcHV0ZSB0aGUgY29sdW1uIHdpZHRoIGZvciBwcm9wZXJ0eTogJHtwcm9wZXJ0eS5uYW1lfWApO1xuXHRcdH1cblx0XHRyZXR1cm4gc1NpemUgPyBwYXJzZUZsb2F0KHNTaXplLnJlcGxhY2UoXCJSZW1cIiwgXCJcIikpIDogMDtcblx0fSxcblxuXHRfZ2V0UHJvcGVydHlIZWxwZXJDYWNoZTogZnVuY3Rpb24gKHNUYWJsZUlkOiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5wcm9wZXJ0eUhlbHBlciAmJiB0aGlzLnByb3BlcnR5SGVscGVyW3NUYWJsZUlkXTtcblx0fSxcblx0X3NldFByb3BlcnR5SGVscGVyQ2FjaGU6IGZ1bmN0aW9uIChzVGFibGVJZDogYW55LCBvUHJvcGVydHlIZWxwZXI6IGFueSkge1xuXHRcdHRoaXMucHJvcGVydHlIZWxwZXIgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BlcnR5SGVscGVyKTtcblx0XHR0aGlzLnByb3BlcnR5SGVscGVyW3NUYWJsZUlkXSA9IG9Qcm9wZXJ0eUhlbHBlcjtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGNhbGN1bGF0ZSB0aGUgIHdpZHRoIG9mIGEgRGF0YUZpZWxkQW5ub3RhdGlvbiBvYmplY3QgY29udGFpbmVkIGluIGEgZmllbGRHcm91cC5cblx0ICpcblx0ICogQHBhcmFtIGRhdGFGaWVsZCBEYXRhRmllbGRBbm5vdGF0aW9uIG9iamVjdC5cblx0ICogQHBhcmFtIHByb3BlcnRpZXMgQXJyYXkgY29udGFpbmluZyBhbGwgUHJvcGVydHlJbmZvIG9iamVjdHMuXG5cdCAqIEBwYXJhbSBjb252ZXJ0ZWRNZXRhRGF0YVxuXHQgKiBAcGFyYW0gc2hvd0RhdGFGaWVsZHNMYWJlbCBMYWJlbCBpcyBkaXNwbGF5ZWQgaW5zaWRlIHRoZSBmaWVsZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5UYWJsZVNpemVIZWxwZXJcblx0ICogQHJldHVybnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHdpZHRoIG9mIHRoZSBsYWJlbCBhbmQgdGhlIHdpZHRoIG9mIHRoZSBwcm9wZXJ0eS5cblx0ICovXG5cdGdldFdpZHRoRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjogZnVuY3Rpb24gKFxuXHRcdGRhdGFGaWVsZDogRGF0YUZpZWxkRm9yQW5ub3RhdGlvbixcblx0XHRwcm9wZXJ0aWVzPzogUHJvcGVydHlJbmZvW10sXG5cdFx0Y29udmVydGVkTWV0YURhdGE/OiBDb252ZXJ0ZWRNZXRhZGF0YSxcblx0XHRzaG93RGF0YUZpZWxkc0xhYmVsID0gZmFsc2Vcblx0KSB7XG5cdFx0Y29uc3Qgb1RhcmdldGVkUHJvcGVydHkgPSBkYXRhRmllbGQ/LlRhcmdldD8uJHRhcmdldCBhcyBhbnk7XG5cdFx0bGV0IG5Qcm9wZXJ0eVdpZHRoID0gMCxcblx0XHRcdGZMYWJlbFdpZHRoID0gMDtcblx0XHRpZiAob1RhcmdldGVkUHJvcGVydHk/LlZpc3VhbGl6YXRpb24pIHtcblx0XHRcdHN3aXRjaCAob1RhcmdldGVkUHJvcGVydHkuVmlzdWFsaXphdGlvbikge1xuXHRcdFx0XHRjYXNlIFwiVUkuVmlzdWFsaXphdGlvblR5cGUvUmF0aW5nXCI6XG5cdFx0XHRcdFx0Y29uc3QgbmJTdGFycyA9IG9UYXJnZXRlZFByb3BlcnR5LlRhcmdldFZhbHVlO1xuXHRcdFx0XHRcdG5Qcm9wZXJ0eVdpZHRoID0gcGFyc2VJbnQobmJTdGFycywgMTApICogMS4zNzU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJVSS5WaXN1YWxpemF0aW9uVHlwZS9Qcm9ncmVzc1wiOlxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdG5Qcm9wZXJ0eVdpZHRoID0gNTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHNMYWJlbCA9IG9UYXJnZXRlZFByb3BlcnR5ID8gb1RhcmdldGVkUHJvcGVydHkubGFiZWwgOiBkYXRhRmllbGQuTGFiZWwgfHwgXCJcIjtcblx0XHRcdGZMYWJlbFdpZHRoID0gc2hvd0RhdGFGaWVsZHNMYWJlbCAmJiBzTGFiZWwgPyBUYWJsZVNpemVIZWxwZXIuZ2V0QnV0dG9uV2lkdGgoc0xhYmVsKSA6IDA7XG5cdFx0fSBlbHNlIGlmIChjb252ZXJ0ZWRNZXRhRGF0YSAmJiBwcm9wZXJ0aWVzICYmIG9UYXJnZXRlZFByb3BlcnR5Py4kVHlwZSA9PT0gQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcy5Db250YWN0VHlwZSkge1xuXHRcdFx0blByb3BlcnR5V2lkdGggPSB0aGlzLmdldE1EQ0NvbHVtbldpZHRoRnJvbURhdGFGaWVsZChvVGFyZ2V0ZWRQcm9wZXJ0eS5mbi4kdGFyZ2V0LCBwcm9wZXJ0aWVzLCBjb252ZXJ0ZWRNZXRhRGF0YSwgZmFsc2UpO1xuXHRcdH1cblx0XHRyZXR1cm4geyBsYWJlbFdpZHRoOiBmTGFiZWxXaWR0aCwgcHJvcGVydHlXaWR0aDogblByb3BlcnR5V2lkdGggfTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGNhbGN1bGF0ZSB0aGUgd2lkdGggb2YgYSBEYXRhRmllbGQgb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkIERhdGFGaWVsZEFubm90YXRpb24gb2JqZWN0LlxuXHQgKiBAcGFyYW0gc2hvd0RhdGFGaWVsZHNMYWJlbCBMYWJlbCBpcyBkaXNwbGF5ZWQgaW5zaWRlIHRoZSBmaWVsZC5cblx0ICogQHBhcmFtIHByb3BlcnRpZXMgQXJyYXkgY29udGFpbmluZyBhbGwgUHJvcGVydHlJbmZvIG9iamVjdHMuXG5cdCAqIEBwYXJhbSBjb252ZXJ0ZWRNZXRhRGF0YSBDb250ZXh0IE9iamVjdCBvZiB0aGUgcGFyZW50IHByb3BlcnR5LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5UYWJsZVNpemVIZWxwZXJcblx0ICogQHJldHVybnMge29iamVjdH0gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHdpZHRoIG9mIHRoZSBsYWJlbCBhbmQgdGhlIHdpZHRoIG9mIHRoZSBwcm9wZXJ0eS5cblx0ICovXG5cblx0Z2V0V2lkdGhGb3JEYXRhRmllbGQ6IGZ1bmN0aW9uIChcblx0XHRkYXRhRmllbGQ6IERhdGFGaWVsZCxcblx0XHRzaG93RGF0YUZpZWxkc0xhYmVsOiBib29sZWFuLFxuXHRcdHByb3BlcnRpZXM6IFByb3BlcnR5SW5mb1tdLFxuXHRcdGNvbnZlcnRlZE1ldGFEYXRhOiBDb252ZXJ0ZWRNZXRhZGF0YVxuXHQpIHtcblx0XHRjb25zdCBvVGFyZ2V0ZWRQcm9wZXJ0eSA9IGRhdGFGaWVsZC5WYWx1ZT8uJHRhcmdldCxcblx0XHRcdG9UZXh0QXJyYW5nZW1lbnRUYXJnZXQgPSBvVGFyZ2V0ZWRQcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dCxcblx0XHRcdGRpc3BsYXlNb2RlID0gZ2V0RGlzcGxheU1vZGUoZGF0YUZpZWxkLlZhbHVlPy4kdGFyZ2V0KTtcblxuXHRcdGxldCBuUHJvcGVydHlXaWR0aCA9IDAsXG5cdFx0XHRmTGFiZWxXaWR0aCA9IDA7XG5cdFx0aWYgKG9UYXJnZXRlZFByb3BlcnR5KSB7XG5cdFx0XHRzd2l0Y2ggKGRpc3BsYXlNb2RlKSB7XG5cdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRcdG5Qcm9wZXJ0eVdpZHRoID1cblx0XHRcdFx0XHRcdHRoaXMuZ2V0TURDQ29sdW1uV2lkdGhGcm9tRGF0YUZpZWxkKG9UZXh0QXJyYW5nZW1lbnRUYXJnZXQuJHRhcmdldCwgcHJvcGVydGllcywgY29udmVydGVkTWV0YURhdGEsIGZhbHNlKSAtIDE7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblZhbHVlXCI6XG5cdFx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdGNhc2UgXCJWYWx1ZVwiOlxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdG5Qcm9wZXJ0eVdpZHRoID0gdGhpcy5nZXRNRENDb2x1bW5XaWR0aEZyb21EYXRhRmllbGQob1RhcmdldGVkUHJvcGVydHksIHByb3BlcnRpZXMsIGNvbnZlcnRlZE1ldGFEYXRhLCBmYWxzZSkgLSAxO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qgc0xhYmVsID0gZGF0YUZpZWxkLkxhYmVsID8gZGF0YUZpZWxkLkxhYmVsIDogb1RhcmdldGVkUHJvcGVydHkubGFiZWw7XG5cdFx0XHRmTGFiZWxXaWR0aCA9IHNob3dEYXRhRmllbGRzTGFiZWwgJiYgc0xhYmVsID8gVGFibGVTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKHNMYWJlbCkgOiAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cuZXJyb3IoYENhbm5vdCBjb21wdXRlIHdpZHRoIGZvciB0eXBlIG9iamVjdDogJHtkYXRhRmllbGQuJFR5cGV9YCk7XG5cdFx0fVxuXHRcdHJldHVybiB7IGxhYmVsV2lkdGg6IGZMYWJlbFdpZHRoLCBwcm9wZXJ0eVdpZHRoOiBuUHJvcGVydHlXaWR0aCB9O1xuXHR9LFxuXG5cdF9nZXRQcm9wZXJ0aWVzQnlQYXRoOiBmdW5jdGlvbiAoYVByb3BlcnRpZXM6IEFubm90YXRpb25UYWJsZUNvbHVtbltdLCBzUGF0aDogYW55KTogQW5ub3RhdGlvblRhYmxlQ29sdW1uIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gYVByb3BlcnRpZXMuZmluZChmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRcdHJldHVybiBvUHJvcGVydHkucGF0aCA9PT0gc1BhdGg7XG5cdFx0fSk7XG5cdH0sXG5cblx0ZXhpdDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMubmJDYWxscy0tO1xuXHRcdGlmICh0aGlzLm5iQ2FsbHMgPT09IDApIHtcblx0XHRcdHRoaXMub0J0bi5kZXN0cm95KCk7XG5cdFx0XHR0aGlzLm9CdG4gPSBudWxsO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgVGFibGVTaXplSGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQVdBLE1BQU1BLGVBQWUsR0FBRztJQUN2QkMsT0FBTyxFQUFFLENBQUM7SUFDVkMsSUFBSSxFQUFFQyxTQUFnQjtJQUN0QkMsY0FBYyxFQUFFRCxTQUFnQjtJQUNoQ0UsSUFBSSxFQUFFLFlBQVk7TUFDakI7TUFDQSxJQUFJLENBQUNKLE9BQU8sR0FBRyxJQUFJLENBQUNBLE9BQU8sR0FBRyxJQUFJLENBQUNBLE9BQU8sR0FBRyxDQUFDO01BQzlDLElBQUksQ0FBQ0EsT0FBTyxFQUFFO01BQ2QsSUFBSSxDQUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDQSxJQUFJLEdBQUcsSUFBSSxDQUFDQSxJQUFJLEdBQUcsSUFBSUksTUFBTSxFQUFFLENBQUNDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDQyxFQUFFLENBQUNDLE9BQU8sRUFBRSxDQUFDQyxnQkFBZ0IsRUFBRSxDQUFDO01BQzdGO01BQ0EsSUFBSSxDQUFDVCxJQUFJLENBQUNVLFVBQVUsQ0FBQyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxjQUFjLEVBQUUsVUFBVUMsSUFBYSxFQUFVO01BQ2hELElBQUksQ0FBQ0EsSUFBSSxFQUFFO1FBQ1YsT0FBTyxDQUFDO01BQ1Q7TUFDQSxJQUFJLElBQUksQ0FBQ1osSUFBSSxDQUFDYSxVQUFVLEVBQUUsS0FBSyxLQUFLLEVBQUU7UUFDckMsSUFBSSxDQUFDYixJQUFJLENBQUNVLFVBQVUsQ0FBQyxJQUFJLENBQUM7TUFDM0I7TUFDQSxJQUFJLENBQUNWLElBQUksQ0FBQ2MsT0FBTyxDQUFDRixJQUFJLENBQUM7TUFDdkI7TUFDQTtNQUNBLElBQUksQ0FBQ1osSUFBSSxDQUFDZSxRQUFRLEVBQUU7TUFDcEIsTUFBTUMsWUFBWSxHQUFHQyxHQUFHLENBQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUNsQixJQUFJLENBQUNtQixTQUFTLEVBQUUsQ0FBQ0MsV0FBVyxDQUFDO01BQ2xFLElBQUksQ0FBQ3BCLElBQUksQ0FBQ1UsVUFBVSxDQUFDLEtBQUssQ0FBQztNQUMzQixPQUFPVyxJQUFJLENBQUNDLEtBQUssQ0FBQ04sWUFBWSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUc7SUFDNUMsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ08sOEJBQThCLEVBQUUsVUFDL0JDLFNBQW9CLEVBQ3BCQyxVQUEwQixFQUMxQkMsaUJBQW9DLEVBRTNCO01BQUEsSUFEVEMsWUFBWSx1RUFBRyxLQUFLO01BRXBCLE1BQU1DLFFBQVEsR0FBR0gsVUFBVSxDQUFDSSxJQUFJLENBQzlCQyxJQUFJO1FBQUE7UUFBQSxPQUNKQSxJQUFJLENBQUNDLFlBQVksSUFDakIsMEJBQUNMLGlCQUFpQixDQUFDTSxXQUFXLENBQUNGLElBQUksQ0FBQ0MsWUFBWSxDQUFDLG9GQUFqRCxzQkFBMkRFLE1BQU0sMkRBQWpFLHVCQUFtRUMsa0JBQWtCLE1BQUtWLFNBQVMsQ0FBQ1Usa0JBQWtCO01BQUEsRUFDdkg7TUFDRCxPQUFPTixRQUFRLEdBQUcsSUFBSSxDQUFDTyw2QkFBNkIsQ0FBQ1AsUUFBUSxFQUFFSCxVQUFVLEVBQUVFLFlBQVksQ0FBQyxHQUFHLENBQUM7SUFDN0YsQ0FBQztJQUVEUSw2QkFBNkIsRUFBRSxVQUFVUCxRQUFzQixFQUFFSCxVQUEwQixFQUFnQztNQUFBO01BQUEsSUFBOUJFLFlBQVksdUVBQUcsS0FBSztNQUNoSCxNQUFNUyxpQkFBaUIsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQ3RDO1FBQ0NDLEdBQUcsRUFBRSxDQUFDO1FBQ05DLGFBQWEsRUFBRSxDQUFDYixZQUFZO1FBQzVCYyxpQkFBaUIsRUFBRTtNQUNwQixDQUFDLDJCQUNEYixRQUFRLENBQUNjLGNBQWMsMERBQXZCLHNCQUF5QkMsZ0JBQWdCLENBQ3pDO01BRUQsSUFBSUMsS0FBSztNQUVULDZCQUFJaEIsUUFBUSxDQUFDaUIsYUFBYSxrREFBdEIsc0JBQXdCQyxNQUFNLEVBQUU7UUFDbkNGLEtBQUssR0FBR2hCLFFBQVEsQ0FBQ2lCLGFBQWEsQ0FDNUJFLEdBQUcsQ0FBRUMsUUFBUSxJQUFLO1VBQUE7VUFDbEIsTUFBTWxCLElBQUksR0FBR0wsVUFBVSxDQUFDSSxJQUFJLENBQUVvQixTQUFTLElBQUtBLFNBQVMsQ0FBQ0MsSUFBSSxLQUFLRixRQUFRLENBQUM7VUFDeEUsT0FBT2xCLElBQUksYUFBSkEsSUFBSSwyQ0FBSkEsSUFBSSxDQUFFcUIsVUFBVSxxREFBaEIsaUJBQWtCQyxZQUFZO1FBQ3RDLENBQUMsQ0FBQyxDQUNEQyxNQUFNLENBQUVDLElBQUksSUFBS0EsSUFBSSxDQUFDO01BQ3pCLENBQUMsTUFBTSxJQUFJMUIsUUFBUSxhQUFSQSxRQUFRLHVDQUFSQSxRQUFRLENBQUV1QixVQUFVLGlEQUFwQixxQkFBc0JDLFlBQVksRUFBRTtRQUM5Q1IsS0FBSyxHQUFHLENBQUNoQixRQUFRLGFBQVJBLFFBQVEsdUJBQVJBLFFBQVEsQ0FBRXVCLFVBQVUsQ0FBQ0MsWUFBWSxDQUFDO01BQzVDO01BQ0EsTUFBTUcsS0FBSyxHQUFHWCxLQUFLLEdBQUdZLFNBQVMsQ0FBQ0MsZUFBZSxDQUFDYixLQUFLLEVBQUVoQixRQUFRLENBQUM4QixLQUFLLEVBQUV0QixpQkFBaUIsQ0FBQyxHQUFHLElBQUk7TUFDaEcsSUFBSSxDQUFDbUIsS0FBSyxFQUFFO1FBQ1hJLEdBQUcsQ0FBQ0MsS0FBSyxDQUFFLGlEQUFnRGhDLFFBQVEsQ0FBQ3NCLElBQUssRUFBQyxDQUFDO01BQzVFO01BQ0EsT0FBT0ssS0FBSyxHQUFHTSxVQUFVLENBQUNOLEtBQUssQ0FBQ08sT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDeEQsQ0FBQztJQUVEQyx1QkFBdUIsRUFBRSxVQUFVQyxRQUFhLEVBQUU7TUFDakQsT0FBTyxJQUFJLENBQUM5RCxjQUFjLElBQUksSUFBSSxDQUFDQSxjQUFjLENBQUM4RCxRQUFRLENBQUM7SUFDNUQsQ0FBQztJQUNEQyx1QkFBdUIsRUFBRSxVQUFVRCxRQUFhLEVBQUVFLGVBQW9CLEVBQUU7TUFDdkUsSUFBSSxDQUFDaEUsY0FBYyxHQUFHbUMsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDcEMsY0FBYyxDQUFDO01BQzVELElBQUksQ0FBQ0EsY0FBYyxDQUFDOEQsUUFBUSxDQUFDLEdBQUdFLGVBQWU7SUFDaEQsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsaUNBQWlDLEVBQUUsVUFDbEMzQyxTQUFpQyxFQUNqQ0MsVUFBMkIsRUFDM0JDLGlCQUFxQyxFQUVwQztNQUFBO01BQUEsSUFERDBDLG1CQUFtQix1RUFBRyxLQUFLO01BRTNCLE1BQU1DLGlCQUFpQixHQUFHN0MsU0FBUyxhQUFUQSxTQUFTLDRDQUFUQSxTQUFTLENBQUU4QyxNQUFNLHNEQUFqQixrQkFBbUJDLE9BQWM7TUFDM0QsSUFBSUMsY0FBYyxHQUFHLENBQUM7UUFDckJDLFdBQVcsR0FBRyxDQUFDO01BQ2hCLElBQUlKLGlCQUFpQixhQUFqQkEsaUJBQWlCLGVBQWpCQSxpQkFBaUIsQ0FBRUssYUFBYSxFQUFFO1FBQ3JDLFFBQVFMLGlCQUFpQixDQUFDSyxhQUFhO1VBQ3RDLEtBQUssNkJBQTZCO1lBQ2pDLE1BQU1DLE9BQU8sR0FBR04saUJBQWlCLENBQUNPLFdBQVc7WUFDN0NKLGNBQWMsR0FBR0ssUUFBUSxDQUFDRixPQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSztZQUM5QztVQUNELEtBQUssK0JBQStCO1VBQ3BDO1lBQ0NILGNBQWMsR0FBRyxDQUFDO1FBQUM7UUFFckIsTUFBTU0sTUFBTSxHQUFHVCxpQkFBaUIsR0FBR0EsaUJBQWlCLENBQUNYLEtBQUssR0FBR2xDLFNBQVMsQ0FBQ3VELEtBQUssSUFBSSxFQUFFO1FBQ2xGTixXQUFXLEdBQUdMLG1CQUFtQixJQUFJVSxNQUFNLEdBQUdoRixlQUFlLENBQUNhLGNBQWMsQ0FBQ21FLE1BQU0sQ0FBQyxHQUFHLENBQUM7TUFDekYsQ0FBQyxNQUFNLElBQUlwRCxpQkFBaUIsSUFBSUQsVUFBVSxJQUFJLENBQUE0QyxpQkFBaUIsYUFBakJBLGlCQUFpQix1QkFBakJBLGlCQUFpQixDQUFFVyxLQUFLLHlEQUE2QyxFQUFFO1FBQ3BIUixjQUFjLEdBQUcsSUFBSSxDQUFDakQsOEJBQThCLENBQUM4QyxpQkFBaUIsQ0FBQ1ksRUFBRSxDQUFDVixPQUFPLEVBQUU5QyxVQUFVLEVBQUVDLGlCQUFpQixFQUFFLEtBQUssQ0FBQztNQUN6SDtNQUNBLE9BQU87UUFBRXdELFVBQVUsRUFBRVQsV0FBVztRQUFFVSxhQUFhLEVBQUVYO01BQWUsQ0FBQztJQUNsRSxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7SUFFQ1ksb0JBQW9CLEVBQUUsVUFDckI1RCxTQUFvQixFQUNwQjRDLG1CQUE0QixFQUM1QjNDLFVBQTBCLEVBQzFCQyxpQkFBb0MsRUFDbkM7TUFBQTtNQUNELE1BQU0yQyxpQkFBaUIsdUJBQUc3QyxTQUFTLENBQUM2RCxLQUFLLHFEQUFmLGlCQUFpQmQsT0FBTztRQUNqRGUsc0JBQXNCLEdBQUdqQixpQkFBaUIsYUFBakJBLGlCQUFpQixnREFBakJBLGlCQUFpQixDQUFFa0IsV0FBVyxvRkFBOUIsc0JBQWdDQyxNQUFNLDJEQUF0Qyx1QkFBd0NDLElBQUk7UUFDckVDLFdBQVcsR0FBR0MsY0FBYyxzQkFBQ25FLFNBQVMsQ0FBQzZELEtBQUssc0RBQWYsa0JBQWlCZCxPQUFPLENBQUM7TUFFdkQsSUFBSUMsY0FBYyxHQUFHLENBQUM7UUFDckJDLFdBQVcsR0FBRyxDQUFDO01BQ2hCLElBQUlKLGlCQUFpQixFQUFFO1FBQ3RCLFFBQVFxQixXQUFXO1VBQ2xCLEtBQUssYUFBYTtZQUNqQmxCLGNBQWMsR0FDYixJQUFJLENBQUNqRCw4QkFBOEIsQ0FBQytELHNCQUFzQixDQUFDZixPQUFPLEVBQUU5QyxVQUFVLEVBQUVDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDOUc7VUFDRCxLQUFLLGtCQUFrQjtVQUN2QixLQUFLLGtCQUFrQjtVQUN2QixLQUFLLE9BQU87VUFDWjtZQUNDOEMsY0FBYyxHQUFHLElBQUksQ0FBQ2pELDhCQUE4QixDQUFDOEMsaUJBQWlCLEVBQUU1QyxVQUFVLEVBQUVDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFBQztRQUVwSCxNQUFNb0QsTUFBTSxHQUFHdEQsU0FBUyxDQUFDdUQsS0FBSyxHQUFHdkQsU0FBUyxDQUFDdUQsS0FBSyxHQUFHVixpQkFBaUIsQ0FBQ1gsS0FBSztRQUMxRWUsV0FBVyxHQUFHTCxtQkFBbUIsSUFBSVUsTUFBTSxHQUFHaEYsZUFBZSxDQUFDYSxjQUFjLENBQUNtRSxNQUFNLENBQUMsR0FBRyxDQUFDO01BQ3pGLENBQUMsTUFBTTtRQUNObkIsR0FBRyxDQUFDQyxLQUFLLENBQUUseUNBQXdDcEMsU0FBUyxDQUFDd0QsS0FBTSxFQUFDLENBQUM7TUFDdEU7TUFDQSxPQUFPO1FBQUVFLFVBQVUsRUFBRVQsV0FBVztRQUFFVSxhQUFhLEVBQUVYO01BQWUsQ0FBQztJQUNsRSxDQUFDO0lBRURvQixvQkFBb0IsRUFBRSxVQUFVQyxXQUFvQyxFQUFFQyxLQUFVLEVBQXFDO01BQ3BILE9BQU9ELFdBQVcsQ0FBQ2hFLElBQUksQ0FBQyxVQUFVa0UsU0FBYyxFQUFFO1FBQ2pELE9BQU9BLFNBQVMsQ0FBQ0MsSUFBSSxLQUFLRixLQUFLO01BQ2hDLENBQUMsQ0FBQztJQUNILENBQUM7SUFFREcsSUFBSSxFQUFFLFlBQVk7TUFDakIsSUFBSSxDQUFDbEcsT0FBTyxFQUFFO01BQ2QsSUFBSSxJQUFJLENBQUNBLE9BQU8sS0FBSyxDQUFDLEVBQUU7UUFDdkIsSUFBSSxDQUFDQyxJQUFJLENBQUNrRyxPQUFPLEVBQUU7UUFDbkIsSUFBSSxDQUFDbEcsSUFBSSxHQUFHLElBQUk7TUFDakI7SUFDRDtFQUNELENBQUM7RUFBQyxPQUVhRixlQUFlO0FBQUEifQ==