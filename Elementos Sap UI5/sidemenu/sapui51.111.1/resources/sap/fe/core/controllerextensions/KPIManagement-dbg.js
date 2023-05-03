/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/formatters/TableFormatterTypes", "sap/m/Popover", "sap/ui/core/Core", "sap/ui/core/format/DateFormat", "sap/ui/core/format/NumberFormat", "sap/ui/core/Locale", "sap/ui/core/mvc/ControllerExtension", "sap/ui/model/Filter", "sap/ui/model/json/JSONModel", "sap/ui/model/Sorter", "../helpers/ClassSupport"], function (Log, TableFormatterTypes, Popover, Core, DateFormat, NumberFormat, Locale, ControllerExtension, Filter, JSONModel, Sorter, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var MessageType = TableFormatterTypes.MessageType;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  const MessageTypeFromCriticality = {
    "1": MessageType.Error,
    "2": MessageType.Warning,
    "3": MessageType.Success,
    "5": MessageType.Information
  };
  const ValueColorFromMessageType = {
    Error: "Error",
    Warning: "Critical",
    Success: "Good",
    Information: "None",
    None: "None"
  };

  /**
   * Function to get a message state from a calculated criticality of type 'Target'.
   *
   * @param kpiValue The value of the KPI to be tested against.
   * @param aThresholds Thresholds to be used [DeviationRangeLowValue,ToleranceRangeLowValue,AcceptanceRangeLowValue,AcceptanceRangeHighValue,ToleranceRangeHighValue,DeviationRangeHighValue].
   * @returns The corresponding MessageType
   */
  function messageTypeFromTargetCalculation(kpiValue, aThresholds) {
    let criticalityProperty;
    if (aThresholds[0] !== undefined && aThresholds[0] !== null && kpiValue < aThresholds[0]) {
      criticalityProperty = MessageType.Error;
    } else if (aThresholds[1] !== undefined && aThresholds[1] !== null && kpiValue < aThresholds[1]) {
      criticalityProperty = MessageType.Warning;
    } else if (aThresholds[2] !== undefined && aThresholds[2] !== null && kpiValue < aThresholds[2]) {
      criticalityProperty = MessageType.None;
    } else if (aThresholds[5] !== undefined && aThresholds[5] !== null && kpiValue > aThresholds[5]) {
      criticalityProperty = MessageType.Error;
    } else if (aThresholds[4] !== undefined && aThresholds[4] !== null && kpiValue > aThresholds[4]) {
      criticalityProperty = MessageType.Warning;
    } else if (aThresholds[3] !== undefined && aThresholds[3] !== null && kpiValue > aThresholds[3]) {
      criticalityProperty = MessageType.None;
    } else {
      criticalityProperty = MessageType.Success;
    }
    return criticalityProperty;
  }

  /**
   * Function to get a message state from a calculated criticality of type 'Minimize'.
   *
   * @param kpiValue The value of the KPI to be tested against.
   * @param aThresholds Thresholds to be used [AcceptanceRangeHighValue,ToleranceRangeHighValue,DeviationRangeHighValue].
   * @returns The corresponding MessageType
   */
  function messageTypeFromMinimizeCalculation(kpiValue, aThresholds) {
    let criticalityProperty;
    if (aThresholds[2] !== undefined && aThresholds[2] !== null && kpiValue > aThresholds[2]) {
      criticalityProperty = MessageType.Error;
    } else if (aThresholds[1] !== undefined && aThresholds[1] !== null && kpiValue > aThresholds[1]) {
      criticalityProperty = MessageType.Warning;
    } else if (aThresholds[0] !== undefined && aThresholds[0] !== null && kpiValue > aThresholds[0]) {
      criticalityProperty = MessageType.None;
    } else {
      criticalityProperty = MessageType.Success;
    }
    return criticalityProperty;
  }

  /**
   * Function to get a message state from a calculated criticality of type 'Maximize'.
   *
   * @param kpiValue The value of the KPI to be tested against.
   * @param aThresholds Thresholds to be used [DeviationRangeLowValue,ToleranceRangeLowValue,AcceptanceRangeLowValue].
   * @returns The corresponding MessageType
   */
  function messageTypeFromMaximizeCalculation(kpiValue, aThresholds) {
    let criticalityProperty;
    if (aThresholds[0] !== undefined && aThresholds[0] !== null && kpiValue < aThresholds[0]) {
      criticalityProperty = MessageType.Error;
    } else if (aThresholds[1] !== undefined && aThresholds[1] !== null && kpiValue < aThresholds[1]) {
      criticalityProperty = MessageType.Warning;
    } else if (aThresholds[2] !== undefined && aThresholds[2] !== null && kpiValue < aThresholds[2]) {
      criticalityProperty = MessageType.None;
    } else {
      criticalityProperty = MessageType.Success;
    }
    return criticalityProperty;
  }

  /**
   * Function to calculate a DeviationIndicator value from a trend value.
   *
   * @param trendValue The criticality values.
   * @returns The corresponding DeviationIndicator value
   */
  function deviationIndicatorFromTrendType(trendValue) {
    let deviationIndicator;
    switch (trendValue) {
      case 1: // StrongUp
      case "1":
      case 2: // Up
      case "2":
        deviationIndicator = "Up";
        break;
      case 4: // Down
      case "4":
      case 5: // StrongDown
      case "5":
        deviationIndicator = "Down";
        break;
      default:
        deviationIndicator = "None";
    }
    return deviationIndicator;
  }

  /**
   * Function to calculate a DeviationIndicator from a TrendCalculation.
   *
   * @param kpiValue The value of the KPI
   * @param referenceValue The reference value to compare with
   * @param isRelative True is the comparison is relative
   * @param aThresholds Array of thresholds [StrongDownDifference, DownDifference, UpDifference, StrongUpDifference]
   * @returns The corresponding DeviationIndicator value
   */
  function deviationIndicatorFromCalculation(kpiValue, referenceValue, isRelative, aThresholds) {
    let deviationIndicator;
    if (!aThresholds || isRelative && !referenceValue) {
      return "None";
    }
    const compValue = isRelative ? (kpiValue - referenceValue) / referenceValue : kpiValue - referenceValue;
    if (aThresholds[0] !== undefined && aThresholds[0] !== null && compValue <= aThresholds[0]) {
      // StrongDown --> Down
      deviationIndicator = "Down";
    } else if (aThresholds[1] !== undefined && aThresholds[1] !== null && compValue <= aThresholds[1]) {
      // Down --> Down
      deviationIndicator = "Down";
    } else if (aThresholds[3] !== undefined && aThresholds[3] !== null && compValue >= aThresholds[3]) {
      // StrongUp --> Up
      deviationIndicator = "Up";
    } else if (aThresholds[2] !== undefined && aThresholds[2] !== null && compValue >= aThresholds[2]) {
      // Up --> Up
      deviationIndicator = "Up";
    } else {
      // Sideways --> None
      deviationIndicator = "None";
    }
    return deviationIndicator;
  }

  /**
   * Creates a sap.ui.model.Filter from a filter definition.
   *
   * @param filterDefinition The filter definition
   * @returns Returns a sap.ui.model.Filter from the definition, or undefined if the definition is empty (no ranges)
   */
  function createFilterFromDefinition(filterDefinition) {
    if (filterDefinition.ranges.length === 0) {
      return undefined;
    } else if (filterDefinition.ranges.length === 1) {
      return new Filter(filterDefinition.propertyPath, filterDefinition.ranges[0].operator, filterDefinition.ranges[0].rangeLow, filterDefinition.ranges[0].rangeHigh);
    } else {
      const aRangeFilters = filterDefinition.ranges.map(range => {
        return new Filter(filterDefinition.propertyPath, range.operator, range.rangeLow, range.rangeHigh);
      });
      return new Filter({
        filters: aRangeFilters,
        and: false
      });
    }
  }
  function getFilterStringFromDefinition(filterDefinition) {
    const currentLocale = new Locale(sap.ui.getCore().getConfiguration().getLanguage());
    const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
    const dateFormat = DateFormat.getDateInstance({
      style: "medium"
    }, currentLocale);
    function formatRange(range) {
      const valueLow = filterDefinition.propertyType.indexOf("Edm.Date") === 0 ? dateFormat.format(new Date(range.rangeLow)) : range.rangeLow;
      const valueHigh = filterDefinition.propertyType.indexOf("Edm.Date") === 0 ? dateFormat.format(new Date(range.rangeHigh)) : range.rangeHigh;
      switch (range.operator) {
        case "BT":
          return `[${valueLow} - ${valueHigh}]`;
        case "Contains":
          return `*${valueLow}*`;
        case "GE":
          return `\u2265${valueLow}`;
        case "GT":
          return `>${valueLow}`;
        case "LE":
          return `\u2264${valueLow}`;
        case "LT":
          return `<${valueLow}`;
        case "NB":
          return resBundle.getText("C_KPICARD_FILTERSTRING_NOT", [`[${valueLow} - ${valueHigh}]`]);
        case "NE":
          return `\u2260${valueLow}`;
        case "NotContains":
          return resBundle.getText("C_KPICARD_FILTERSTRING_NOT", [`*${valueLow}*`]);
        case "EQ":
        default:
          return valueLow;
      }
    }
    if (filterDefinition.ranges.length === 0) {
      return "";
    } else if (filterDefinition.ranges.length === 1) {
      return formatRange(filterDefinition.ranges[0]);
    } else {
      return `(${filterDefinition.ranges.map(formatRange).join(",")})`;
    }
  }
  function formatChartTitle(kpiDef) {
    const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
    function formatList(items) {
      if (items.length === 0) {
        return "";
      } else if (items.length === 1) {
        return items[0].label;
      } else {
        let res = items[0].label;
        for (let I = 1; I < items.length - 1; I++) {
          res += `, ${items[I].label}`;
        }
        return resBundle.getText("C_KPICARD_ITEMSLIST", [res, items[items.length - 1].label]);
      }
    }
    return resBundle.getText("C_KPICARD_CHARTTITLE", [formatList(kpiDef.chart.measures), formatList(kpiDef.chart.dimensions)]);
  }
  function updateChartLabelSettings(chartDefinition, oChartProperties) {
    switch (chartDefinition.chartType) {
      case "Donut":
        // Show data labels, do not show axis titles
        oChartProperties.categoryAxis = {
          title: {
            visible: false
          }
        };
        oChartProperties.valueAxis = {
          title: {
            visible: false
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.plotArea.dataLabel = {
          visible: true,
          type: "value",
          formatString: "ShortFloat_MFD2"
        };
        break;
      case "bubble":
        // Show axis title, bubble size legend, do not show data labels
        oChartProperties.valueAxis = {
          title: {
            visible: true
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.valueAxis2 = {
          title: {
            visible: true
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.legendGroup = {
          layout: {
            position: "bottom",
            alignment: "topLeft"
          }
        };
        oChartProperties.sizeLegend = {
          visible: true
        };
        oChartProperties.plotArea.dataLabel = {
          visible: false
        };
        break;
      case "scatter":
        // Do not show data labels and axis titles
        oChartProperties.valueAxis = {
          title: {
            visible: false
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.valueAxis2 = {
          title: {
            visible: false
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.plotArea.dataLabel = {
          visible: false
        };
        break;
      default:
        // Do not show data labels and axis titles
        oChartProperties.categoryAxis = {
          title: {
            visible: false
          }
        };
        oChartProperties.valueAxis = {
          title: {
            visible: false
          },
          label: {
            formatString: "ShortFloat"
          }
        };
        oChartProperties.plotArea.dataLabel = {
          visible: false
        };
    }
  }
  function filterMap(aObjects, aRoles) {
    if (aRoles && aRoles.length) {
      return aObjects.filter(dimension => {
        return aRoles.indexOf(dimension.role) >= 0;
      }).map(dimension => {
        return dimension.label;
      });
    } else {
      return aObjects.map(dimension => {
        return dimension.label;
      });
    }
  }
  function getScatterBubbleChartFeeds(chartDefinition) {
    const axis1Measures = filterMap(chartDefinition.measures, ["Axis1"]);
    const axis2Measures = filterMap(chartDefinition.measures, ["Axis2"]);
    const axis3Measures = filterMap(chartDefinition.measures, ["Axis3"]);
    const otherMeasures = filterMap(chartDefinition.measures, [undefined]);
    const seriesDimensions = filterMap(chartDefinition.dimensions, ["Series"]);

    // Get the first dimension with role "Category" for the shape
    const shapeDimension = chartDefinition.dimensions.find(dimension => {
      return dimension.role === "Category";
    });

    // Measure for the x-Axis : first measure for Axis1, or for Axis2 if not found, or for Axis3 if not found
    const xMeasure = axis1Measures.shift() || axis2Measures.shift() || axis3Measures.shift() || otherMeasures.shift() || "";
    // Measure for the y-Axis : first measure for Axis2, or second measure for Axis1 if not found, or first measure for Axis3 if not found
    const yMeasure = axis2Measures.shift() || axis1Measures.shift() || axis3Measures.shift() || otherMeasures.shift() || "";
    const res = [{
      uid: "valueAxis",
      type: "Measure",
      values: [xMeasure]
    }, {
      uid: "valueAxis2",
      type: "Measure",
      values: [yMeasure]
    }];
    if (chartDefinition.chartType === "bubble") {
      // Measure for the size of the bubble: first measure for Axis3, or remaining measure for Axis1/Axis2 if not found
      const sizeMeasure = axis3Measures.shift() || axis1Measures.shift() || axis2Measures.shift() || otherMeasures.shift() || "";
      res.push({
        uid: "bubbleWidth",
        type: "Measure",
        values: [sizeMeasure]
      });
    }

    // Color (optional)
    if (seriesDimensions.length) {
      res.push({
        uid: "color",
        type: "Dimension",
        values: seriesDimensions
      });
    }
    // Shape (optional)
    if (shapeDimension) {
      res.push({
        uid: "shape",
        type: "Dimension",
        values: [shapeDimension.label]
      });
    }
    return res;
  }
  function getChartFeeds(chartDefinition) {
    let res;
    switch (chartDefinition.chartType) {
      case "Donut":
        res = [{
          uid: "size",
          type: "Measure",
          values: filterMap(chartDefinition.measures)
        }, {
          uid: "color",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions)
        }];
        break;
      case "bubble":
      case "scatter":
        res = getScatterBubbleChartFeeds(chartDefinition);
        break;
      case "vertical_bullet":
        res = [{
          uid: "actualValues",
          type: "Measure",
          values: filterMap(chartDefinition.measures, [undefined, "Axis1"])
        }, {
          uid: "targetValues",
          type: "Measure",
          values: filterMap(chartDefinition.measures, ["Axis2"])
        }, {
          uid: "categoryAxis",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions, [undefined, "Category"])
        }, {
          uid: "color",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions, ["Series"])
        }];
        break;
      default:
        res = [{
          uid: "valueAxis",
          type: "Measure",
          values: filterMap(chartDefinition.measures)
        }, {
          uid: "categoryAxis",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions, [undefined, "Category"])
        }, {
          uid: "color",
          type: "Dimension",
          values: filterMap(chartDefinition.dimensions, ["Series"])
        }];
    }
    return res;
  }
  function getNavigationParameters(navInfo, oShellService) {
    if (navInfo.semanticObject) {
      if (navInfo.action) {
        // Action is already specified: check if it's available in the shell
        return oShellService.getLinks({
          semanticObject: navInfo.semanticObject,
          action: navInfo.action
        }).then(aLinks => {
          return aLinks.length ? {
            semanticObject: navInfo.semanticObject,
            action: navInfo.action
          } : undefined;
        });
      } else {
        // We get the primary intent from the shell
        return oShellService.getPrimaryIntent(navInfo.semanticObject).then(oLink => {
          if (!oLink) {
            // No primary intent...
            return undefined;
          }

          // Check that the primary intent is not part of the unavailable actions
          const oInfo = oShellService.parseShellHash(oLink.intent);
          return navInfo.unavailableActions && navInfo.unavailableActions.indexOf(oInfo.action) >= 0 ? undefined : {
            semanticObject: oInfo.semanticObject,
            action: oInfo.action
          };
        });
      }
    } else {
      // Outbound navigation specified in the manifest
      return navInfo.outboundNavigation ? Promise.resolve({
        outbound: navInfo.outboundNavigation
      }) : Promise.resolve(undefined);
    }
  }

  /**
   * @class A controller extension for managing the KPIs in an analytical list page
   * @name sap.fe.core.controllerextensions.KPIManagement
   * @hideconstructor
   * @private
   * @since 1.93.0
   */
  let KPIManagementControllerExtension = (_dec = defineUI5Class("sap.fe.core.controllerextensions.KPIManagement"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(KPIManagementControllerExtension, _ControllerExtension);
    function KPIManagementControllerExtension() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = KPIManagementControllerExtension.prototype;
    /**
     * Creates the card manifest for a KPI definition and stores it in a JSON model.
     *
     * @param kpiDefinition The KPI definition
     * @param oKPIModel The JSON model in which the manifest will be stored
     */
    _proto.initCardManifest = function initCardManifest(kpiDefinition, oKPIModel) {
      var _kpiDefinition$select;
      const oCardManifest = {
        "sap.app": {
          id: "sap.fe",
          type: "card"
        },
        "sap.ui": {
          technology: "UI5"
        },
        "sap.card": {
          type: "Analytical",
          data: {
            json: {}
          },
          header: {
            type: "Numeric",
            title: kpiDefinition.datapoint.title,
            subTitle: kpiDefinition.datapoint.description,
            unitOfMeasurement: "{mainUnit}",
            mainIndicator: {
              number: "{mainValueNoScale}",
              unit: "{mainValueScale}",
              state: "{mainState}",
              trend: "{trend}"
            }
          },
          content: {
            minHeight: "25rem",
            chartProperties: {
              plotArea: {},
              title: {
                visible: true,
                alignment: "left"
              }
            },
            data: {
              path: "/chartData"
            }
          }
        }
      };

      // Add side indicators in the card header if a target is defined for the KPI
      if (kpiDefinition.datapoint.targetPath || kpiDefinition.datapoint.targetValue !== undefined) {
        const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
        oCardManifest["sap.card"].header.sideIndicators = [{
          title: resBundle.getText("C_KPICARD_INDICATOR_TARGET"),
          number: "{targetNumber}",
          unit: "{targetUnit}"
        }, {
          title: resBundle.getText("C_KPICARD_INDICATOR_DEVIATION"),
          number: "{deviationNumber}",
          unit: "%"
        }];
      }

      // Details of the card: filter descriptions
      if ((_kpiDefinition$select = kpiDefinition.selectionVariantFilterDefinitions) !== null && _kpiDefinition$select !== void 0 && _kpiDefinition$select.length) {
        const aDescriptions = [];
        kpiDefinition.selectionVariantFilterDefinitions.forEach(filterDefinition => {
          const desc = getFilterStringFromDefinition(filterDefinition);
          if (desc) {
            aDescriptions.push(desc);
          }
        });
        if (aDescriptions.length) {
          oCardManifest["sap.card"].header.details = aDescriptions.join(", ");
        }
      }

      // Chart settings: type, title, dimensions and measures in the manifest
      oCardManifest["sap.card"].content.chartType = kpiDefinition.chart.chartType;
      updateChartLabelSettings(kpiDefinition.chart, oCardManifest["sap.card"].content.chartProperties);
      oCardManifest["sap.card"].content.chartProperties.title.text = formatChartTitle(kpiDefinition);
      oCardManifest["sap.card"].content.dimensions = kpiDefinition.chart.dimensions.map(dimension => {
        return {
          label: dimension.label,
          value: `{${dimension.name}}`
        };
      });
      oCardManifest["sap.card"].content.measures = kpiDefinition.chart.measures.map(measure => {
        return {
          label: measure.label,
          value: `{${measure.name}}`
        };
      });
      oCardManifest["sap.card"].content.feeds = getChartFeeds(kpiDefinition.chart);
      oKPIModel.setProperty(`/${kpiDefinition.id}`, {
        manifest: oCardManifest
      });
    };
    _proto.initNavigationInfo = function initNavigationInfo(kpiDefinition, oKPIModel, oShellService) {
      // Add navigation
      if (kpiDefinition.navigation) {
        return getNavigationParameters(kpiDefinition.navigation, oShellService).then(oNavInfo => {
          if (oNavInfo) {
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/header/actions`, [{
              type: "Navigation",
              parameters: oNavInfo
            }]);
          }
        });
      } else {
        return Promise.resolve();
      }
    };
    _proto.onInit = function onInit() {
      var _getPageModel;
      this.aKPIDefinitions = (_getPageModel = this.getView().getController()._getPageModel()) === null || _getPageModel === void 0 ? void 0 : _getPageModel.getProperty("/kpiDefinitions");
      if (this.aKPIDefinitions && this.aKPIDefinitions.length) {
        const oView = this.getView();
        const oAppComponent = oView.getController().getAppComponent();

        // Create a JSON model to store KPI data
        const oKPIModel = new JSONModel();
        oView.setModel(oKPIModel, "kpiModel");
        this.aKPIDefinitions.forEach(kpiDefinition => {
          // Create the manifest for the KPI card and store it in the KPI model
          this.initCardManifest(kpiDefinition, oKPIModel);

          // Set the navigation information in the manifest
          this.initNavigationInfo(kpiDefinition, oKPIModel, oAppComponent.getShellServices()).catch(function (err) {
            Log.error(err);
          });

          // Load tag data for the KPI
          this.loadKPITagData(kpiDefinition, oAppComponent.getModel(), oKPIModel).catch(function (err) {
            Log.error(err);
          });
        });
      }
    };
    _proto.onExit = function onExit() {
      const oKPIModel = this.getView().getModel("kpiModel");
      if (oKPIModel) {
        oKPIModel.destroy();
      }
    };
    _proto.updateDatapointValueAndCurrency = function updateDatapointValueAndCurrency(kpiDefinition, kpiContext, oKPIModel) {
      var _kpiDefinition$datapo, _kpiDefinition$datapo2, _kpiDefinition$datapo3;
      const currentLocale = new Locale(sap.ui.getCore().getConfiguration().getLanguage());
      const rawUnit = (_kpiDefinition$datapo = kpiDefinition.datapoint.unit) !== null && _kpiDefinition$datapo !== void 0 && _kpiDefinition$datapo.isPath ? kpiContext.getProperty(kpiDefinition.datapoint.unit.value) : (_kpiDefinition$datapo2 = kpiDefinition.datapoint.unit) === null || _kpiDefinition$datapo2 === void 0 ? void 0 : _kpiDefinition$datapo2.value;
      const isPercentage = ((_kpiDefinition$datapo3 = kpiDefinition.datapoint.unit) === null || _kpiDefinition$datapo3 === void 0 ? void 0 : _kpiDefinition$datapo3.isCurrency) === false && rawUnit === "%";

      // /////////////////////
      // Main KPI value
      const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));

      // Value formatted with a scale
      const kpiValue = NumberFormat.getFloatInstance({
        style: isPercentage ? undefined : "short",
        minFractionDigits: 0,
        maxFractionDigits: 1,
        showScale: !isPercentage
      }, currentLocale).format(rawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValue`, kpiValue);

      // Value without a scale
      const kpiValueUnscaled = NumberFormat.getFloatInstance({
        maxFractionDigits: 2,
        showScale: false,
        groupingEnabled: true
      }, currentLocale).format(rawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueUnscaled`, kpiValueUnscaled);

      // Value formatted with the scale omitted
      const kpiValueNoScale = NumberFormat.getFloatInstance({
        style: isPercentage ? undefined : "short",
        minFractionDigits: 0,
        maxFractionDigits: 1,
        showScale: false
      }, currentLocale).format(rawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueNoScale`, kpiValueNoScale);

      // Scale of the value
      const kpiValueScale = NumberFormat.getFloatInstance({
        style: isPercentage ? undefined : "short",
        decimals: 0,
        maxIntegerDigits: 0,
        showScale: true
      }, currentLocale).format(rawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueScale`, kpiValueScale);

      // /////////////////////
      // Unit or currency
      if (kpiDefinition.datapoint.unit && rawUnit) {
        if (kpiDefinition.datapoint.unit.isCurrency) {
          oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainUnit`, rawUnit);
        } else {
          // In case of unit of measure, we have to format it properly
          const kpiUnit = NumberFormat.getUnitInstance({
            showNumber: false
          }, currentLocale).format(rawValue, rawUnit);
          oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainUnit`, kpiUnit);
        }
      }
    };
    _proto.updateDatapointCriticality = function updateDatapointCriticality(kpiDefinition, kpiContext, oKPIModel) {
      const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));
      let criticalityValue = MessageType.None;
      if (kpiDefinition.datapoint.criticalityValue) {
        // Criticality is a fixed value
        criticalityValue = kpiDefinition.datapoint.criticalityValue;
      } else if (kpiDefinition.datapoint.criticalityPath) {
        // Criticality comes from another property (via a path)
        criticalityValue = MessageTypeFromCriticality[kpiContext.getProperty(kpiDefinition.datapoint.criticalityPath)] || MessageType.None;
      } else if (kpiDefinition.datapoint.criticalityCalculationThresholds && kpiDefinition.datapoint.criticalityCalculationMode) {
        // Criticality calculation
        switch (kpiDefinition.datapoint.criticalityCalculationMode) {
          case "UI.ImprovementDirectionType/Target":
            criticalityValue = messageTypeFromTargetCalculation(rawValue, kpiDefinition.datapoint.criticalityCalculationThresholds);
            break;
          case "UI.ImprovementDirectionType/Minimize":
            criticalityValue = messageTypeFromMinimizeCalculation(rawValue, kpiDefinition.datapoint.criticalityCalculationThresholds);
            break;
          case "UI.ImprovementDirectionType/Maximize":
          default:
            criticalityValue = messageTypeFromMaximizeCalculation(rawValue, kpiDefinition.datapoint.criticalityCalculationThresholds);
            break;
        }
      }
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainCriticality`, criticalityValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainState`, ValueColorFromMessageType[criticalityValue] || "None");
    };
    _proto.updateDatapointTrend = function updateDatapointTrend(kpiDefinition, kpiContext, oKPIModel) {
      const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));
      let trendValue = "None";
      if (kpiDefinition.datapoint.trendValue) {
        // Trend is a fixed value
        trendValue = kpiDefinition.datapoint.trendValue;
      } else if (kpiDefinition.datapoint.trendPath) {
        // Trend comes from another property via a path
        trendValue = deviationIndicatorFromTrendType(kpiContext.getProperty(kpiDefinition.datapoint.trendPath));
      } else if (kpiDefinition.datapoint.trendCalculationReferenceValue !== undefined || kpiDefinition.datapoint.trendCalculationReferencePath) {
        // Calculated trend
        let trendReferenceValue;
        if (kpiDefinition.datapoint.trendCalculationReferenceValue !== undefined) {
          trendReferenceValue = kpiDefinition.datapoint.trendCalculationReferenceValue;
        } else {
          trendReferenceValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.trendCalculationReferencePath || ""));
        }
        trendValue = deviationIndicatorFromCalculation(rawValue, trendReferenceValue, !!kpiDefinition.datapoint.trendCalculationIsRelative, kpiDefinition.datapoint.trendCalculationTresholds);
      }
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/trend`, trendValue);
    };
    _proto.updateTargetValue = function updateTargetValue(kpiDefinition, kpiContext, oKPIModel) {
      if (kpiDefinition.datapoint.targetValue === undefined && kpiDefinition.datapoint.targetPath === undefined) {
        return; // No target set for the KPI
      }

      const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));
      const currentLocale = new Locale(sap.ui.getCore().getConfiguration().getLanguage());
      let targetRawValue;
      if (kpiDefinition.datapoint.targetValue !== undefined) {
        targetRawValue = kpiDefinition.datapoint.targetValue;
      } else {
        targetRawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.targetPath || ""));
      }
      const deviationRawValue = targetRawValue !== 0 ? (rawValue - targetRawValue) / targetRawValue * 100 : undefined;

      // Formatting
      const targetValue = NumberFormat.getFloatInstance({
        style: "short",
        minFractionDigits: 0,
        maxFractionDigits: 1,
        showScale: false
      }, currentLocale).format(targetRawValue);
      const targetScale = NumberFormat.getFloatInstance({
        style: "short",
        decimals: 0,
        maxIntegerDigits: 0,
        showScale: true
      }, currentLocale).format(targetRawValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetNumber`, targetValue);
      oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetUnit`, targetScale);
      if (deviationRawValue !== undefined) {
        const deviationValue = NumberFormat.getFloatInstance({
          minFractionDigits: 0,
          maxFractionDigits: 1,
          showScale: false
        }, currentLocale).format(deviationRawValue);
        oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/deviationNumber`, deviationValue);
      } else {
        oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/deviationNumber`, "N/A");
      }
    }

    /**
     * Loads tag data for a KPI, and stores it in the JSON KPI model.
     *
     * @param kpiDefinition The definition of the KPI.
     * @param oMainModel The model used to load the data.
     * @param oKPIModel The JSON model where the data will be stored
     * @param loadFull If not true, loads only data for the KPI tag
     * @returns The promise that is resolved when data is loaded.
     */;
    _proto.loadKPITagData = function loadKPITagData(kpiDefinition, oMainModel, oKPIModel, loadFull) {
      var _kpiDefinition$datapo4, _kpiDefinition$select2;
      // If loadFull=false, then we're just loading data for the tag and we use the "$auto.LongRunners" groupID
      // If loadFull=true, we're loading data for the whole KPI (tag + card) and we use the "$auto.Workers" groupID
      const oListBinding = loadFull ? oMainModel.bindList(`/${kpiDefinition.entitySet}`, undefined, undefined, undefined, {
        $$groupId: "$auto.Workers"
      }) : oMainModel.bindList(`/${kpiDefinition.entitySet}`, undefined, undefined, undefined, {
        $$groupId: "$auto.LongRunners"
      });
      const oAggregate = {};

      // Main value + currency/unit
      if ((_kpiDefinition$datapo4 = kpiDefinition.datapoint.unit) !== null && _kpiDefinition$datapo4 !== void 0 && _kpiDefinition$datapo4.isPath) {
        oAggregate[kpiDefinition.datapoint.propertyPath] = {
          unit: kpiDefinition.datapoint.unit.value
        };
      } else {
        oAggregate[kpiDefinition.datapoint.propertyPath] = {};
      }

      // Property for criticality
      if (kpiDefinition.datapoint.criticalityPath) {
        oAggregate[kpiDefinition.datapoint.criticalityPath] = {};
      }

      // Properties for trend and trend calculation
      if (loadFull) {
        if (kpiDefinition.datapoint.trendPath) {
          oAggregate[kpiDefinition.datapoint.trendPath] = {};
        }
        if (kpiDefinition.datapoint.trendCalculationReferencePath) {
          oAggregate[kpiDefinition.datapoint.trendCalculationReferencePath] = {};
        }
        if (kpiDefinition.datapoint.targetPath) {
          oAggregate[kpiDefinition.datapoint.targetPath] = {};
        }
      }
      oListBinding.setAggregation({
        aggregate: oAggregate
      });

      // Manage SelectionVariant filters
      if ((_kpiDefinition$select2 = kpiDefinition.selectionVariantFilterDefinitions) !== null && _kpiDefinition$select2 !== void 0 && _kpiDefinition$select2.length) {
        const aFilters = kpiDefinition.selectionVariantFilterDefinitions.map(createFilterFromDefinition).filter(filter => {
          return filter !== undefined;
        });
        oListBinding.filter(aFilters);
      }
      return oListBinding.requestContexts(0, 1).then(aContexts => {
        if (aContexts.length) {
          var _kpiDefinition$datapo5, _kpiDefinition$datapo6;
          const rawUnit = (_kpiDefinition$datapo5 = kpiDefinition.datapoint.unit) !== null && _kpiDefinition$datapo5 !== void 0 && _kpiDefinition$datapo5.isPath ? aContexts[0].getProperty(kpiDefinition.datapoint.unit.value) : (_kpiDefinition$datapo6 = kpiDefinition.datapoint.unit) === null || _kpiDefinition$datapo6 === void 0 ? void 0 : _kpiDefinition$datapo6.value;
          if (kpiDefinition.datapoint.unit && !rawUnit) {
            // A unit/currency is defined, but its value is undefined --> multi-unit situation
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValue`, "*");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueUnscaled`, "*");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueNoScale`, "*");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueScale`, "");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainUnit`, undefined);
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainCriticality`, MessageType.None);
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainState`, "None");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/trend`, "None");
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetNumber`, undefined);
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetUnit`, undefined);
            oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/deviationNumber`, undefined);
          } else {
            this.updateDatapointValueAndCurrency(kpiDefinition, aContexts[0], oKPIModel);
            this.updateDatapointCriticality(kpiDefinition, aContexts[0], oKPIModel);
            if (loadFull) {
              this.updateDatapointTrend(kpiDefinition, aContexts[0], oKPIModel);
              this.updateTargetValue(kpiDefinition, aContexts[0], oKPIModel);
            }
          }
        }
      });
    }

    /**
     * Loads card data for a KPI, and stores it in the JSON KPI model.
     *
     * @param kpiDefinition The definition of the KPI.
     * @param oMainModel The model used to load the data.
     * @param oKPIModel The JSON model where the data will be stored
     * @returns The promise that is resolved when data is loaded.
     */;
    _proto.loadKPICardData = function loadKPICardData(kpiDefinition, oMainModel, oKPIModel) {
      var _kpiDefinition$select3;
      const oListBinding = oMainModel.bindList(`/${kpiDefinition.entitySet}`, undefined, undefined, undefined, {
        $$groupId: "$auto.Workers"
      });
      const oGroup = {};
      const oAggregate = {};
      kpiDefinition.chart.dimensions.forEach(dimension => {
        oGroup[dimension.name] = {};
      });
      kpiDefinition.chart.measures.forEach(measure => {
        oAggregate[measure.name] = {};
      });
      oListBinding.setAggregation({
        group: oGroup,
        aggregate: oAggregate
      });

      // Manage SelectionVariant filters
      if ((_kpiDefinition$select3 = kpiDefinition.selectionVariantFilterDefinitions) !== null && _kpiDefinition$select3 !== void 0 && _kpiDefinition$select3.length) {
        const aFilters = kpiDefinition.selectionVariantFilterDefinitions.map(createFilterFromDefinition).filter(filter => {
          return filter !== undefined;
        });
        oListBinding.filter(aFilters);
      }

      // Sorting
      if (kpiDefinition.chart.sortOrder) {
        oListBinding.sort(kpiDefinition.chart.sortOrder.map(sortInfo => {
          return new Sorter(sortInfo.name, sortInfo.descending);
        }));
      }
      return oListBinding.requestContexts(0, kpiDefinition.chart.maxItems).then(aContexts => {
        const chartData = aContexts.map(function (oContext) {
          const oData = {};
          kpiDefinition.chart.dimensions.forEach(dimension => {
            oData[dimension.name] = oContext.getProperty(dimension.name);
          });
          kpiDefinition.chart.measures.forEach(measure => {
            oData[measure.name] = oContext.getProperty(measure.name);
          });
          return oData;
        });
        oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/chartData`, chartData);
      });
    }

    /**
     * Gets the popover to display the KPI card
     * The popover and the contained card for the KPIs are created if necessary.
     * The popover is shared between all KPIs, so it's created only once.
     *
     * @param oKPITag The tag that triggered the popover opening.
     * @returns The shared popover as a promise.
     */;
    _proto.getPopover = function getPopover(oKPITag) {
      if (!this.oPopover) {
        return new Promise((resolve, reject) => {
          Core.loadLibrary("sap/ui/integration", {
            async: true
          }).then(() => {
            sap.ui.require(["sap/ui/integration/widgets/Card", "sap/ui/integration/Host"], (Card, Host) => {
              const oHost = new Host();
              oHost.attachAction(oEvent => {
                const sType = oEvent.getParameter("type");
                const oParams = oEvent.getParameter("parameters");
                if (sType === "Navigation") {
                  if (oParams.semanticObject) {
                    this.getView().getController()._intentBasedNavigation.navigate(oParams.semanticObject, oParams.action);
                  } else {
                    this.getView().getController()._intentBasedNavigation.navigateOutbound(oParams.outbound);
                  }
                }
              });
              this.oCard = new Card({
                width: "25rem",
                height: "auto"
              });
              this.oCard.setHost(oHost);
              this.oPopover = new Popover("kpi-Popover", {
                showHeader: false,
                placement: "Auto",
                content: [this.oCard]
              });
              oKPITag.addDependent(this.oPopover); // The first clicked tag gets the popover as dependent

              resolve(this.oPopover);
            });
          }).catch(function () {
            reject();
          });
        });
      } else {
        return Promise.resolve(this.oPopover);
      }
    };
    _proto.onKPIPressed = function onKPIPressed(oKPITag, kpiID) {
      const oKPIModel = oKPITag.getModel("kpiModel");
      if (this.aKPIDefinitions && this.aKPIDefinitions.length) {
        const kpiDefinition = this.aKPIDefinitions.find(function (oDef) {
          return oDef.id === kpiID;
        });
        if (kpiDefinition) {
          const oModel = oKPITag.getModel();
          const aPromises = [this.loadKPITagData(kpiDefinition, oModel, oKPIModel, true), this.loadKPICardData(kpiDefinition, oModel, oKPIModel), this.getPopover(oKPITag)];
          Promise.all(aPromises).then(aResults => {
            this.oCard.setManifest(oKPIModel.getProperty(`/${kpiID}/manifest`));
            this.oCard.refresh();
            const oPopover = aResults[2];
            oPopover.openBy(oKPITag, false);
          }).catch(err => {
            Log.error(err);
          });
        }
      }
    };
    return KPIManagementControllerExtension;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onKPIPressed", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "onKPIPressed"), _class2.prototype)), _class2)) || _class);
  return KPIManagementControllerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eSIsIk1lc3NhZ2VUeXBlIiwiRXJyb3IiLCJXYXJuaW5nIiwiU3VjY2VzcyIsIkluZm9ybWF0aW9uIiwiVmFsdWVDb2xvckZyb21NZXNzYWdlVHlwZSIsIk5vbmUiLCJtZXNzYWdlVHlwZUZyb21UYXJnZXRDYWxjdWxhdGlvbiIsImtwaVZhbHVlIiwiYVRocmVzaG9sZHMiLCJjcml0aWNhbGl0eVByb3BlcnR5IiwidW5kZWZpbmVkIiwibWVzc2FnZVR5cGVGcm9tTWluaW1pemVDYWxjdWxhdGlvbiIsIm1lc3NhZ2VUeXBlRnJvbU1heGltaXplQ2FsY3VsYXRpb24iLCJkZXZpYXRpb25JbmRpY2F0b3JGcm9tVHJlbmRUeXBlIiwidHJlbmRWYWx1ZSIsImRldmlhdGlvbkluZGljYXRvciIsImRldmlhdGlvbkluZGljYXRvckZyb21DYWxjdWxhdGlvbiIsInJlZmVyZW5jZVZhbHVlIiwiaXNSZWxhdGl2ZSIsImNvbXBWYWx1ZSIsImNyZWF0ZUZpbHRlckZyb21EZWZpbml0aW9uIiwiZmlsdGVyRGVmaW5pdGlvbiIsInJhbmdlcyIsImxlbmd0aCIsIkZpbHRlciIsInByb3BlcnR5UGF0aCIsIm9wZXJhdG9yIiwicmFuZ2VMb3ciLCJyYW5nZUhpZ2giLCJhUmFuZ2VGaWx0ZXJzIiwibWFwIiwicmFuZ2UiLCJmaWx0ZXJzIiwiYW5kIiwiZ2V0RmlsdGVyU3RyaW5nRnJvbURlZmluaXRpb24iLCJjdXJyZW50TG9jYWxlIiwiTG9jYWxlIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiZ2V0Q29uZmlndXJhdGlvbiIsImdldExhbmd1YWdlIiwicmVzQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImRhdGVGb3JtYXQiLCJEYXRlRm9ybWF0IiwiZ2V0RGF0ZUluc3RhbmNlIiwic3R5bGUiLCJmb3JtYXRSYW5nZSIsInZhbHVlTG93IiwicHJvcGVydHlUeXBlIiwiaW5kZXhPZiIsImZvcm1hdCIsIkRhdGUiLCJ2YWx1ZUhpZ2giLCJnZXRUZXh0Iiwiam9pbiIsImZvcm1hdENoYXJ0VGl0bGUiLCJrcGlEZWYiLCJmb3JtYXRMaXN0IiwiaXRlbXMiLCJsYWJlbCIsInJlcyIsIkkiLCJjaGFydCIsIm1lYXN1cmVzIiwiZGltZW5zaW9ucyIsInVwZGF0ZUNoYXJ0TGFiZWxTZXR0aW5ncyIsImNoYXJ0RGVmaW5pdGlvbiIsIm9DaGFydFByb3BlcnRpZXMiLCJjaGFydFR5cGUiLCJjYXRlZ29yeUF4aXMiLCJ0aXRsZSIsInZpc2libGUiLCJ2YWx1ZUF4aXMiLCJmb3JtYXRTdHJpbmciLCJwbG90QXJlYSIsImRhdGFMYWJlbCIsInR5cGUiLCJ2YWx1ZUF4aXMyIiwibGVnZW5kR3JvdXAiLCJsYXlvdXQiLCJwb3NpdGlvbiIsImFsaWdubWVudCIsInNpemVMZWdlbmQiLCJmaWx0ZXJNYXAiLCJhT2JqZWN0cyIsImFSb2xlcyIsImZpbHRlciIsImRpbWVuc2lvbiIsInJvbGUiLCJnZXRTY2F0dGVyQnViYmxlQ2hhcnRGZWVkcyIsImF4aXMxTWVhc3VyZXMiLCJheGlzMk1lYXN1cmVzIiwiYXhpczNNZWFzdXJlcyIsIm90aGVyTWVhc3VyZXMiLCJzZXJpZXNEaW1lbnNpb25zIiwic2hhcGVEaW1lbnNpb24iLCJmaW5kIiwieE1lYXN1cmUiLCJzaGlmdCIsInlNZWFzdXJlIiwidWlkIiwidmFsdWVzIiwic2l6ZU1lYXN1cmUiLCJwdXNoIiwiZ2V0Q2hhcnRGZWVkcyIsImdldE5hdmlnYXRpb25QYXJhbWV0ZXJzIiwibmF2SW5mbyIsIm9TaGVsbFNlcnZpY2UiLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsImdldExpbmtzIiwidGhlbiIsImFMaW5rcyIsImdldFByaW1hcnlJbnRlbnQiLCJvTGluayIsIm9JbmZvIiwicGFyc2VTaGVsbEhhc2giLCJpbnRlbnQiLCJ1bmF2YWlsYWJsZUFjdGlvbnMiLCJvdXRib3VuZE5hdmlnYXRpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsIm91dGJvdW5kIiwiS1BJTWFuYWdlbWVudENvbnRyb2xsZXJFeHRlbnNpb24iLCJkZWZpbmVVSTVDbGFzcyIsIm1ldGhvZE92ZXJyaWRlIiwicHVibGljRXh0ZW5zaW9uIiwiaW5pdENhcmRNYW5pZmVzdCIsImtwaURlZmluaXRpb24iLCJvS1BJTW9kZWwiLCJvQ2FyZE1hbmlmZXN0IiwiaWQiLCJ0ZWNobm9sb2d5IiwiZGF0YSIsImpzb24iLCJoZWFkZXIiLCJkYXRhcG9pbnQiLCJzdWJUaXRsZSIsImRlc2NyaXB0aW9uIiwidW5pdE9mTWVhc3VyZW1lbnQiLCJtYWluSW5kaWNhdG9yIiwibnVtYmVyIiwidW5pdCIsInN0YXRlIiwidHJlbmQiLCJjb250ZW50IiwibWluSGVpZ2h0IiwiY2hhcnRQcm9wZXJ0aWVzIiwicGF0aCIsInRhcmdldFBhdGgiLCJ0YXJnZXRWYWx1ZSIsInNpZGVJbmRpY2F0b3JzIiwic2VsZWN0aW9uVmFyaWFudEZpbHRlckRlZmluaXRpb25zIiwiYURlc2NyaXB0aW9ucyIsImZvckVhY2giLCJkZXNjIiwiZGV0YWlscyIsInRleHQiLCJ2YWx1ZSIsIm5hbWUiLCJtZWFzdXJlIiwiZmVlZHMiLCJzZXRQcm9wZXJ0eSIsIm1hbmlmZXN0IiwiaW5pdE5hdmlnYXRpb25JbmZvIiwibmF2aWdhdGlvbiIsIm9OYXZJbmZvIiwicGFyYW1ldGVycyIsIm9uSW5pdCIsImFLUElEZWZpbml0aW9ucyIsImdldFZpZXciLCJnZXRDb250cm9sbGVyIiwiX2dldFBhZ2VNb2RlbCIsImdldFByb3BlcnR5Iiwib1ZpZXciLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50IiwiSlNPTk1vZGVsIiwic2V0TW9kZWwiLCJnZXRTaGVsbFNlcnZpY2VzIiwiY2F0Y2giLCJlcnIiLCJMb2ciLCJlcnJvciIsImxvYWRLUElUYWdEYXRhIiwiZ2V0TW9kZWwiLCJvbkV4aXQiLCJkZXN0cm95IiwidXBkYXRlRGF0YXBvaW50VmFsdWVBbmRDdXJyZW5jeSIsImtwaUNvbnRleHQiLCJyYXdVbml0IiwiaXNQYXRoIiwiaXNQZXJjZW50YWdlIiwiaXNDdXJyZW5jeSIsInJhd1ZhbHVlIiwiTnVtYmVyIiwicGFyc2VGbG9hdCIsIk51bWJlckZvcm1hdCIsImdldEZsb2F0SW5zdGFuY2UiLCJtaW5GcmFjdGlvbkRpZ2l0cyIsIm1heEZyYWN0aW9uRGlnaXRzIiwic2hvd1NjYWxlIiwia3BpVmFsdWVVbnNjYWxlZCIsImdyb3VwaW5nRW5hYmxlZCIsImtwaVZhbHVlTm9TY2FsZSIsImtwaVZhbHVlU2NhbGUiLCJkZWNpbWFscyIsIm1heEludGVnZXJEaWdpdHMiLCJrcGlVbml0IiwiZ2V0VW5pdEluc3RhbmNlIiwic2hvd051bWJlciIsInVwZGF0ZURhdGFwb2ludENyaXRpY2FsaXR5IiwiY3JpdGljYWxpdHlWYWx1ZSIsImNyaXRpY2FsaXR5UGF0aCIsImNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UaHJlc2hvbGRzIiwiY3JpdGljYWxpdHlDYWxjdWxhdGlvbk1vZGUiLCJ1cGRhdGVEYXRhcG9pbnRUcmVuZCIsInRyZW5kUGF0aCIsInRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VWYWx1ZSIsInRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VQYXRoIiwidHJlbmRSZWZlcmVuY2VWYWx1ZSIsInRyZW5kQ2FsY3VsYXRpb25Jc1JlbGF0aXZlIiwidHJlbmRDYWxjdWxhdGlvblRyZXNob2xkcyIsInVwZGF0ZVRhcmdldFZhbHVlIiwidGFyZ2V0UmF3VmFsdWUiLCJkZXZpYXRpb25SYXdWYWx1ZSIsInRhcmdldFNjYWxlIiwiZGV2aWF0aW9uVmFsdWUiLCJvTWFpbk1vZGVsIiwibG9hZEZ1bGwiLCJvTGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsImVudGl0eVNldCIsIiQkZ3JvdXBJZCIsIm9BZ2dyZWdhdGUiLCJzZXRBZ2dyZWdhdGlvbiIsImFnZ3JlZ2F0ZSIsImFGaWx0ZXJzIiwicmVxdWVzdENvbnRleHRzIiwiYUNvbnRleHRzIiwibG9hZEtQSUNhcmREYXRhIiwib0dyb3VwIiwiZ3JvdXAiLCJzb3J0T3JkZXIiLCJzb3J0Iiwic29ydEluZm8iLCJTb3J0ZXIiLCJkZXNjZW5kaW5nIiwibWF4SXRlbXMiLCJjaGFydERhdGEiLCJvQ29udGV4dCIsIm9EYXRhIiwiZ2V0UG9wb3ZlciIsIm9LUElUYWciLCJvUG9wb3ZlciIsInJlamVjdCIsImxvYWRMaWJyYXJ5IiwiYXN5bmMiLCJyZXF1aXJlIiwiQ2FyZCIsIkhvc3QiLCJvSG9zdCIsImF0dGFjaEFjdGlvbiIsIm9FdmVudCIsInNUeXBlIiwiZ2V0UGFyYW1ldGVyIiwib1BhcmFtcyIsIl9pbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJuYXZpZ2F0ZSIsIm5hdmlnYXRlT3V0Ym91bmQiLCJvQ2FyZCIsIndpZHRoIiwiaGVpZ2h0Iiwic2V0SG9zdCIsIlBvcG92ZXIiLCJzaG93SGVhZGVyIiwicGxhY2VtZW50IiwiYWRkRGVwZW5kZW50Iiwib25LUElQcmVzc2VkIiwia3BpSUQiLCJvRGVmIiwib01vZGVsIiwiYVByb21pc2VzIiwiYWxsIiwiYVJlc3VsdHMiLCJzZXRNYW5pZmVzdCIsInJlZnJlc2giLCJvcGVuQnkiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJLUElNYW5hZ2VtZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQmFzZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSB7IEtQSUNoYXJ0RGVmaW5pdGlvbiwgS1BJRGVmaW5pdGlvbiwgTmF2aWdhdGlvbkluZm8gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vS1BJXCI7XG5pbXBvcnQgdHlwZSB7IEZpbHRlckRlZmluaXRpb24sIFJhbmdlRGVmaW5pdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvU2VsZWN0aW9uVmFyaWFudEhlbHBlclwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclR5cGVzXCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBHZW5lcmljVGFnIGZyb20gXCJzYXAvbS9HZW5lcmljVGFnXCI7XG5pbXBvcnQgUG9wb3ZlciBmcm9tIFwic2FwL20vUG9wb3ZlclwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBEYXRlRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvRGF0ZUZvcm1hdFwiO1xuaW1wb3J0IE51bWJlckZvcm1hdCBmcm9tIFwic2FwL3VpL2NvcmUvZm9ybWF0L051bWJlckZvcm1hdFwiO1xuaW1wb3J0IExvY2FsZSBmcm9tIFwic2FwL3VpL2NvcmUvTG9jYWxlXCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCB0eXBlIEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgU29ydGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvU29ydGVyXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgbWV0aG9kT3ZlcnJpZGUsIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCIuLi9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuXG5jb25zdCBNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eTogUmVjb3JkPHN0cmluZywgTWVzc2FnZVR5cGU+ID0ge1xuXHRcIjFcIjogTWVzc2FnZVR5cGUuRXJyb3IsXG5cdFwiMlwiOiBNZXNzYWdlVHlwZS5XYXJuaW5nLFxuXHRcIjNcIjogTWVzc2FnZVR5cGUuU3VjY2Vzcyxcblx0XCI1XCI6IE1lc3NhZ2VUeXBlLkluZm9ybWF0aW9uXG59O1xuXG5jb25zdCBWYWx1ZUNvbG9yRnJvbU1lc3NhZ2VUeXBlOiBSZWNvcmQ8TWVzc2FnZVR5cGUsIHN0cmluZz4gPSB7XG5cdEVycm9yOiBcIkVycm9yXCIsXG5cdFdhcm5pbmc6IFwiQ3JpdGljYWxcIixcblx0U3VjY2VzczogXCJHb29kXCIsXG5cdEluZm9ybWF0aW9uOiBcIk5vbmVcIixcblx0Tm9uZTogXCJOb25lXCJcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IGEgbWVzc2FnZSBzdGF0ZSBmcm9tIGEgY2FsY3VsYXRlZCBjcml0aWNhbGl0eSBvZiB0eXBlICdUYXJnZXQnLlxuICpcbiAqIEBwYXJhbSBrcGlWYWx1ZSBUaGUgdmFsdWUgb2YgdGhlIEtQSSB0byBiZSB0ZXN0ZWQgYWdhaW5zdC5cbiAqIEBwYXJhbSBhVGhyZXNob2xkcyBUaHJlc2hvbGRzIHRvIGJlIHVzZWQgW0RldmlhdGlvblJhbmdlTG93VmFsdWUsVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSxBY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZSxBY2NlcHRhbmNlUmFuZ2VIaWdoVmFsdWUsVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUsRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWVdLlxuICogQHJldHVybnMgVGhlIGNvcnJlc3BvbmRpbmcgTWVzc2FnZVR5cGVcbiAqL1xuZnVuY3Rpb24gbWVzc2FnZVR5cGVGcm9tVGFyZ2V0Q2FsY3VsYXRpb24oa3BpVmFsdWU6IG51bWJlciwgYVRocmVzaG9sZHM6IChudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKVtdKTogTWVzc2FnZVR5cGUge1xuXHRsZXQgY3JpdGljYWxpdHlQcm9wZXJ0eTogTWVzc2FnZVR5cGU7XG5cblx0aWYgKGFUaHJlc2hvbGRzWzBdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMF0gIT09IG51bGwgJiYga3BpVmFsdWUgPCBhVGhyZXNob2xkc1swXSkge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5FcnJvcjtcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1sxXSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzFdICE9PSBudWxsICYmIGtwaVZhbHVlIDwgYVRocmVzaG9sZHNbMV0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuV2FybmluZztcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1syXSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzJdICE9PSBudWxsICYmIGtwaVZhbHVlIDwgYVRocmVzaG9sZHNbMl0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1s1XSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzVdICE9PSBudWxsICYmIGtwaVZhbHVlID4gYVRocmVzaG9sZHNbNV0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuRXJyb3I7XG5cdH0gZWxzZSBpZiAoYVRocmVzaG9sZHNbNF0gIT09IHVuZGVmaW5lZCAmJiBhVGhyZXNob2xkc1s0XSAhPT0gbnVsbCAmJiBrcGlWYWx1ZSA+IGFUaHJlc2hvbGRzWzRdKSB7XG5cdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLldhcm5pbmc7XG5cdH0gZWxzZSBpZiAoYVRocmVzaG9sZHNbM10gIT09IHVuZGVmaW5lZCAmJiBhVGhyZXNob2xkc1szXSAhPT0gbnVsbCAmJiBrcGlWYWx1ZSA+IGFUaHJlc2hvbGRzWzNdKSB7XG5cdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLk5vbmU7XG5cdH0gZWxzZSB7XG5cdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLlN1Y2Nlc3M7XG5cdH1cblxuXHRyZXR1cm4gY3JpdGljYWxpdHlQcm9wZXJ0eTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byBnZXQgYSBtZXNzYWdlIHN0YXRlIGZyb20gYSBjYWxjdWxhdGVkIGNyaXRpY2FsaXR5IG9mIHR5cGUgJ01pbmltaXplJy5cbiAqXG4gKiBAcGFyYW0ga3BpVmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBLUEkgdG8gYmUgdGVzdGVkIGFnYWluc3QuXG4gKiBAcGFyYW0gYVRocmVzaG9sZHMgVGhyZXNob2xkcyB0byBiZSB1c2VkIFtBY2NlcHRhbmNlUmFuZ2VIaWdoVmFsdWUsVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUsRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWVdLlxuICogQHJldHVybnMgVGhlIGNvcnJlc3BvbmRpbmcgTWVzc2FnZVR5cGVcbiAqL1xuZnVuY3Rpb24gbWVzc2FnZVR5cGVGcm9tTWluaW1pemVDYWxjdWxhdGlvbihrcGlWYWx1ZTogbnVtYmVyLCBhVGhyZXNob2xkczogKG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwpW10pOiBNZXNzYWdlVHlwZSB7XG5cdGxldCBjcml0aWNhbGl0eVByb3BlcnR5OiBNZXNzYWdlVHlwZTtcblxuXHRpZiAoYVRocmVzaG9sZHNbMl0gIT09IHVuZGVmaW5lZCAmJiBhVGhyZXNob2xkc1syXSAhPT0gbnVsbCAmJiBrcGlWYWx1ZSA+IGFUaHJlc2hvbGRzWzJdKSB7XG5cdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLkVycm9yO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzFdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMV0gIT09IG51bGwgJiYga3BpVmFsdWUgPiBhVGhyZXNob2xkc1sxXSkge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5XYXJuaW5nO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzBdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMF0gIT09IG51bGwgJiYga3BpVmFsdWUgPiBhVGhyZXNob2xkc1swXSkge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHR9IGVsc2Uge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5TdWNjZXNzO1xuXHR9XG5cblx0cmV0dXJuIGNyaXRpY2FsaXR5UHJvcGVydHk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IGEgbWVzc2FnZSBzdGF0ZSBmcm9tIGEgY2FsY3VsYXRlZCBjcml0aWNhbGl0eSBvZiB0eXBlICdNYXhpbWl6ZScuXG4gKlxuICogQHBhcmFtIGtwaVZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgS1BJIHRvIGJlIHRlc3RlZCBhZ2FpbnN0LlxuICogQHBhcmFtIGFUaHJlc2hvbGRzIFRocmVzaG9sZHMgdG8gYmUgdXNlZCBbRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZSxUb2xlcmFuY2VSYW5nZUxvd1ZhbHVlLEFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlXS5cbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIE1lc3NhZ2VUeXBlXG4gKi9cbmZ1bmN0aW9uIG1lc3NhZ2VUeXBlRnJvbU1heGltaXplQ2FsY3VsYXRpb24oa3BpVmFsdWU6IG51bWJlciwgYVRocmVzaG9sZHM6IChudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKVtdKTogTWVzc2FnZVR5cGUge1xuXHRsZXQgY3JpdGljYWxpdHlQcm9wZXJ0eTogTWVzc2FnZVR5cGU7XG5cblx0aWYgKGFUaHJlc2hvbGRzWzBdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMF0gIT09IG51bGwgJiYga3BpVmFsdWUgPCBhVGhyZXNob2xkc1swXSkge1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5FcnJvcjtcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1sxXSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzFdICE9PSBudWxsICYmIGtwaVZhbHVlIDwgYVRocmVzaG9sZHNbMV0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuV2FybmluZztcblx0fSBlbHNlIGlmIChhVGhyZXNob2xkc1syXSAhPT0gdW5kZWZpbmVkICYmIGFUaHJlc2hvbGRzWzJdICE9PSBudWxsICYmIGtwaVZhbHVlIDwgYVRocmVzaG9sZHNbMl0pIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0fSBlbHNlIHtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuU3VjY2Vzcztcblx0fVxuXG5cdHJldHVybiBjcml0aWNhbGl0eVByb3BlcnR5O1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNhbGN1bGF0ZSBhIERldmlhdGlvbkluZGljYXRvciB2YWx1ZSBmcm9tIGEgdHJlbmQgdmFsdWUuXG4gKlxuICogQHBhcmFtIHRyZW5kVmFsdWUgVGhlIGNyaXRpY2FsaXR5IHZhbHVlcy5cbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIERldmlhdGlvbkluZGljYXRvciB2YWx1ZVxuICovXG5mdW5jdGlvbiBkZXZpYXRpb25JbmRpY2F0b3JGcm9tVHJlbmRUeXBlKHRyZW5kVmFsdWU6IG51bWJlciB8IHN0cmluZyk6IHN0cmluZyB7XG5cdGxldCBkZXZpYXRpb25JbmRpY2F0b3I6IHN0cmluZztcblxuXHRzd2l0Y2ggKHRyZW5kVmFsdWUpIHtcblx0XHRjYXNlIDE6IC8vIFN0cm9uZ1VwXG5cdFx0Y2FzZSBcIjFcIjpcblx0XHRjYXNlIDI6IC8vIFVwXG5cdFx0Y2FzZSBcIjJcIjpcblx0XHRcdGRldmlhdGlvbkluZGljYXRvciA9IFwiVXBcIjtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSA0OiAvLyBEb3duXG5cdFx0Y2FzZSBcIjRcIjpcblx0XHRjYXNlIDU6IC8vIFN0cm9uZ0Rvd25cblx0XHRjYXNlIFwiNVwiOlxuXHRcdFx0ZGV2aWF0aW9uSW5kaWNhdG9yID0gXCJEb3duXCI7XG5cdFx0XHRicmVhaztcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRkZXZpYXRpb25JbmRpY2F0b3IgPSBcIk5vbmVcIjtcblx0fVxuXG5cdHJldHVybiBkZXZpYXRpb25JbmRpY2F0b3I7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2FsY3VsYXRlIGEgRGV2aWF0aW9uSW5kaWNhdG9yIGZyb20gYSBUcmVuZENhbGN1bGF0aW9uLlxuICpcbiAqIEBwYXJhbSBrcGlWYWx1ZSBUaGUgdmFsdWUgb2YgdGhlIEtQSVxuICogQHBhcmFtIHJlZmVyZW5jZVZhbHVlIFRoZSByZWZlcmVuY2UgdmFsdWUgdG8gY29tcGFyZSB3aXRoXG4gKiBAcGFyYW0gaXNSZWxhdGl2ZSBUcnVlIGlzIHRoZSBjb21wYXJpc29uIGlzIHJlbGF0aXZlXG4gKiBAcGFyYW0gYVRocmVzaG9sZHMgQXJyYXkgb2YgdGhyZXNob2xkcyBbU3Ryb25nRG93bkRpZmZlcmVuY2UsIERvd25EaWZmZXJlbmNlLCBVcERpZmZlcmVuY2UsIFN0cm9uZ1VwRGlmZmVyZW5jZV1cbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIERldmlhdGlvbkluZGljYXRvciB2YWx1ZVxuICovXG5mdW5jdGlvbiBkZXZpYXRpb25JbmRpY2F0b3JGcm9tQ2FsY3VsYXRpb24oXG5cdGtwaVZhbHVlOiBudW1iZXIsXG5cdHJlZmVyZW5jZVZhbHVlOiBudW1iZXIsXG5cdGlzUmVsYXRpdmU6IGJvb2xlYW4sXG5cdGFUaHJlc2hvbGRzOiAobnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbClbXSB8IHVuZGVmaW5lZFxuKTogc3RyaW5nIHtcblx0bGV0IGRldmlhdGlvbkluZGljYXRvcjogc3RyaW5nO1xuXG5cdGlmICghYVRocmVzaG9sZHMgfHwgKGlzUmVsYXRpdmUgJiYgIXJlZmVyZW5jZVZhbHVlKSkge1xuXHRcdHJldHVybiBcIk5vbmVcIjtcblx0fVxuXG5cdGNvbnN0IGNvbXBWYWx1ZSA9IGlzUmVsYXRpdmUgPyAoa3BpVmFsdWUgLSByZWZlcmVuY2VWYWx1ZSkgLyByZWZlcmVuY2VWYWx1ZSA6IGtwaVZhbHVlIC0gcmVmZXJlbmNlVmFsdWU7XG5cblx0aWYgKGFUaHJlc2hvbGRzWzBdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMF0gIT09IG51bGwgJiYgY29tcFZhbHVlIDw9IGFUaHJlc2hvbGRzWzBdKSB7XG5cdFx0Ly8gU3Ryb25nRG93biAtLT4gRG93blxuXHRcdGRldmlhdGlvbkluZGljYXRvciA9IFwiRG93blwiO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzFdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMV0gIT09IG51bGwgJiYgY29tcFZhbHVlIDw9IGFUaHJlc2hvbGRzWzFdKSB7XG5cdFx0Ly8gRG93biAtLT4gRG93blxuXHRcdGRldmlhdGlvbkluZGljYXRvciA9IFwiRG93blwiO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzNdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbM10gIT09IG51bGwgJiYgY29tcFZhbHVlID49IGFUaHJlc2hvbGRzWzNdKSB7XG5cdFx0Ly8gU3Ryb25nVXAgLS0+IFVwXG5cdFx0ZGV2aWF0aW9uSW5kaWNhdG9yID0gXCJVcFwiO1xuXHR9IGVsc2UgaWYgKGFUaHJlc2hvbGRzWzJdICE9PSB1bmRlZmluZWQgJiYgYVRocmVzaG9sZHNbMl0gIT09IG51bGwgJiYgY29tcFZhbHVlID49IGFUaHJlc2hvbGRzWzJdKSB7XG5cdFx0Ly8gVXAgLS0+IFVwXG5cdFx0ZGV2aWF0aW9uSW5kaWNhdG9yID0gXCJVcFwiO1xuXHR9IGVsc2Uge1xuXHRcdC8vIFNpZGV3YXlzIC0tPiBOb25lXG5cdFx0ZGV2aWF0aW9uSW5kaWNhdG9yID0gXCJOb25lXCI7XG5cdH1cblxuXHRyZXR1cm4gZGV2aWF0aW9uSW5kaWNhdG9yO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzYXAudWkubW9kZWwuRmlsdGVyIGZyb20gYSBmaWx0ZXIgZGVmaW5pdGlvbi5cbiAqXG4gKiBAcGFyYW0gZmlsdGVyRGVmaW5pdGlvbiBUaGUgZmlsdGVyIGRlZmluaXRpb25cbiAqIEByZXR1cm5zIFJldHVybnMgYSBzYXAudWkubW9kZWwuRmlsdGVyIGZyb20gdGhlIGRlZmluaXRpb24sIG9yIHVuZGVmaW5lZCBpZiB0aGUgZGVmaW5pdGlvbiBpcyBlbXB0eSAobm8gcmFuZ2VzKVxuICovXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJGcm9tRGVmaW5pdGlvbihmaWx0ZXJEZWZpbml0aW9uOiBGaWx0ZXJEZWZpbml0aW9uKTogRmlsdGVyIHwgdW5kZWZpbmVkIHtcblx0aWYgKGZpbHRlckRlZmluaXRpb24ucmFuZ2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoZmlsdGVyRGVmaW5pdGlvbi5yYW5nZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIG5ldyBGaWx0ZXIoXG5cdFx0XHRmaWx0ZXJEZWZpbml0aW9uLnByb3BlcnR5UGF0aCxcblx0XHRcdGZpbHRlckRlZmluaXRpb24ucmFuZ2VzWzBdLm9wZXJhdG9yIGFzIEZpbHRlck9wZXJhdG9yLFxuXHRcdFx0ZmlsdGVyRGVmaW5pdGlvbi5yYW5nZXNbMF0ucmFuZ2VMb3csXG5cdFx0XHRmaWx0ZXJEZWZpbml0aW9uLnJhbmdlc1swXS5yYW5nZUhpZ2hcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGFSYW5nZUZpbHRlcnMgPSBmaWx0ZXJEZWZpbml0aW9uLnJhbmdlcy5tYXAoKHJhbmdlKSA9PiB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcihmaWx0ZXJEZWZpbml0aW9uLnByb3BlcnR5UGF0aCwgcmFuZ2Uub3BlcmF0b3IgYXMgRmlsdGVyT3BlcmF0b3IsIHJhbmdlLnJhbmdlTG93LCByYW5nZS5yYW5nZUhpZ2gpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IGFSYW5nZUZpbHRlcnMsXG5cdFx0XHRhbmQ6IGZhbHNlXG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RmlsdGVyU3RyaW5nRnJvbURlZmluaXRpb24oZmlsdGVyRGVmaW5pdGlvbjogRmlsdGVyRGVmaW5pdGlvbik6IHN0cmluZyB7XG5cdGNvbnN0IGN1cnJlbnRMb2NhbGUgPSBuZXcgTG9jYWxlKHNhcC51aS5nZXRDb3JlKCkuZ2V0Q29uZmlndXJhdGlvbigpLmdldExhbmd1YWdlKCkpO1xuXHRjb25zdCByZXNCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRjb25zdCBkYXRlRm9ybWF0ID0gRGF0ZUZvcm1hdC5nZXREYXRlSW5zdGFuY2UoeyBzdHlsZTogXCJtZWRpdW1cIiB9LCBjdXJyZW50TG9jYWxlKTtcblxuXHRmdW5jdGlvbiBmb3JtYXRSYW5nZShyYW5nZTogUmFuZ2VEZWZpbml0aW9uKTogc3RyaW5nIHtcblx0XHRjb25zdCB2YWx1ZUxvdyA9XG5cdFx0XHRmaWx0ZXJEZWZpbml0aW9uLnByb3BlcnR5VHlwZS5pbmRleE9mKFwiRWRtLkRhdGVcIikgPT09IDAgPyBkYXRlRm9ybWF0LmZvcm1hdChuZXcgRGF0ZShyYW5nZS5yYW5nZUxvdykpIDogcmFuZ2UucmFuZ2VMb3c7XG5cdFx0Y29uc3QgdmFsdWVIaWdoID1cblx0XHRcdGZpbHRlckRlZmluaXRpb24ucHJvcGVydHlUeXBlLmluZGV4T2YoXCJFZG0uRGF0ZVwiKSA9PT0gMCA/IGRhdGVGb3JtYXQuZm9ybWF0KG5ldyBEYXRlKHJhbmdlLnJhbmdlSGlnaCkpIDogcmFuZ2UucmFuZ2VIaWdoO1xuXG5cdFx0c3dpdGNoIChyYW5nZS5vcGVyYXRvcikge1xuXHRcdFx0Y2FzZSBcIkJUXCI6XG5cdFx0XHRcdHJldHVybiBgWyR7dmFsdWVMb3d9IC0gJHt2YWx1ZUhpZ2h9XWA7XG5cblx0XHRcdGNhc2UgXCJDb250YWluc1wiOlxuXHRcdFx0XHRyZXR1cm4gYCoke3ZhbHVlTG93fSpgO1xuXG5cdFx0XHRjYXNlIFwiR0VcIjpcblx0XHRcdFx0cmV0dXJuIGBcXHUyMjY1JHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiR1RcIjpcblx0XHRcdFx0cmV0dXJuIGA+JHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiTEVcIjpcblx0XHRcdFx0cmV0dXJuIGBcXHUyMjY0JHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiTFRcIjpcblx0XHRcdFx0cmV0dXJuIGA8JHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiTkJcIjpcblx0XHRcdFx0cmV0dXJuIHJlc0J1bmRsZS5nZXRUZXh0KFwiQ19LUElDQVJEX0ZJTFRFUlNUUklOR19OT1RcIiwgW2BbJHt2YWx1ZUxvd30gLSAke3ZhbHVlSGlnaH1dYF0pO1xuXG5cdFx0XHRjYXNlIFwiTkVcIjpcblx0XHRcdFx0cmV0dXJuIGBcXHUyMjYwJHt2YWx1ZUxvd31gO1xuXG5cdFx0XHRjYXNlIFwiTm90Q29udGFpbnNcIjpcblx0XHRcdFx0cmV0dXJuIHJlc0J1bmRsZS5nZXRUZXh0KFwiQ19LUElDQVJEX0ZJTFRFUlNUUklOR19OT1RcIiwgW2AqJHt2YWx1ZUxvd30qYF0pO1xuXG5cdFx0XHRjYXNlIFwiRVFcIjpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB2YWx1ZUxvdztcblx0XHR9XG5cdH1cblx0aWYgKGZpbHRlckRlZmluaXRpb24ucmFuZ2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9IGVsc2UgaWYgKGZpbHRlckRlZmluaXRpb24ucmFuZ2VzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBmb3JtYXRSYW5nZShmaWx0ZXJEZWZpbml0aW9uLnJhbmdlc1swXSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGAoJHtmaWx0ZXJEZWZpbml0aW9uLnJhbmdlcy5tYXAoZm9ybWF0UmFuZ2UpLmpvaW4oXCIsXCIpfSlgO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGZvcm1hdENoYXJ0VGl0bGUoa3BpRGVmOiBLUElEZWZpbml0aW9uKTogc3RyaW5nIHtcblx0Y29uc3QgcmVzQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblxuXHRmdW5jdGlvbiBmb3JtYXRMaXN0KGl0ZW1zOiB7IG5hbWU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9W10pIHtcblx0XHRpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9IGVsc2UgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGl0ZW1zWzBdLmxhYmVsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgcmVzID0gaXRlbXNbMF0ubGFiZWw7XG5cdFx0XHRmb3IgKGxldCBJID0gMTsgSSA8IGl0ZW1zLmxlbmd0aCAtIDE7IEkrKykge1xuXHRcdFx0XHRyZXMgKz0gYCwgJHtpdGVtc1tJXS5sYWJlbH1gO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzQnVuZGxlLmdldFRleHQoXCJDX0tQSUNBUkRfSVRFTVNMSVNUXCIsIFtyZXMsIGl0ZW1zW2l0ZW1zLmxlbmd0aCAtIDFdLmxhYmVsXSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHJlc0J1bmRsZS5nZXRUZXh0KFwiQ19LUElDQVJEX0NIQVJUVElUTEVcIiwgW2Zvcm1hdExpc3Qoa3BpRGVmLmNoYXJ0Lm1lYXN1cmVzKSwgZm9ybWF0TGlzdChrcGlEZWYuY2hhcnQuZGltZW5zaW9ucyldKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ2hhcnRMYWJlbFNldHRpbmdzKGNoYXJ0RGVmaW5pdGlvbjogS1BJQ2hhcnREZWZpbml0aW9uLCBvQ2hhcnRQcm9wZXJ0aWVzOiBhbnkpOiB2b2lkIHtcblx0c3dpdGNoIChjaGFydERlZmluaXRpb24uY2hhcnRUeXBlKSB7XG5cdFx0Y2FzZSBcIkRvbnV0XCI6XG5cdFx0XHQvLyBTaG93IGRhdGEgbGFiZWxzLCBkbyBub3Qgc2hvdyBheGlzIHRpdGxlc1xuXHRcdFx0b0NoYXJ0UHJvcGVydGllcy5jYXRlZ29yeUF4aXMgPSB7XG5cdFx0XHRcdHRpdGxlOiB7XG5cdFx0XHRcdFx0dmlzaWJsZTogZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMudmFsdWVBeGlzID0ge1xuXHRcdFx0XHR0aXRsZToge1xuXHRcdFx0XHRcdHZpc2libGU6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGxhYmVsOiB7XG5cdFx0XHRcdFx0Zm9ybWF0U3RyaW5nOiBcIlNob3J0RmxvYXRcIlxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0b0NoYXJ0UHJvcGVydGllcy5wbG90QXJlYS5kYXRhTGFiZWwgPSB7XG5cdFx0XHRcdHZpc2libGU6IHRydWUsXG5cdFx0XHRcdHR5cGU6IFwidmFsdWVcIixcblx0XHRcdFx0Zm9ybWF0U3RyaW5nOiBcIlNob3J0RmxvYXRfTUZEMlwiXG5cdFx0XHR9O1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFwiYnViYmxlXCI6XG5cdFx0XHQvLyBTaG93IGF4aXMgdGl0bGUsIGJ1YmJsZSBzaXplIGxlZ2VuZCwgZG8gbm90IHNob3cgZGF0YSBsYWJlbHNcblx0XHRcdG9DaGFydFByb3BlcnRpZXMudmFsdWVBeGlzID0ge1xuXHRcdFx0XHR0aXRsZToge1xuXHRcdFx0XHRcdHZpc2libGU6IHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0bGFiZWw6IHtcblx0XHRcdFx0XHRmb3JtYXRTdHJpbmc6IFwiU2hvcnRGbG9hdFwiXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRvQ2hhcnRQcm9wZXJ0aWVzLnZhbHVlQXhpczIgPSB7XG5cdFx0XHRcdHRpdGxlOiB7XG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRsYWJlbDoge1xuXHRcdFx0XHRcdGZvcm1hdFN0cmluZzogXCJTaG9ydEZsb2F0XCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMubGVnZW5kR3JvdXAgPSB7XG5cdFx0XHRcdGxheW91dDoge1xuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImJvdHRvbVwiLFxuXHRcdFx0XHRcdGFsaWdubWVudDogXCJ0b3BMZWZ0XCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMuc2l6ZUxlZ2VuZCA9IHtcblx0XHRcdFx0dmlzaWJsZTogdHJ1ZVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMucGxvdEFyZWEuZGF0YUxhYmVsID0geyB2aXNpYmxlOiBmYWxzZSB9O1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFwic2NhdHRlclwiOlxuXHRcdFx0Ly8gRG8gbm90IHNob3cgZGF0YSBsYWJlbHMgYW5kIGF4aXMgdGl0bGVzXG5cdFx0XHRvQ2hhcnRQcm9wZXJ0aWVzLnZhbHVlQXhpcyA9IHtcblx0XHRcdFx0dGl0bGU6IHtcblx0XHRcdFx0XHR2aXNpYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRsYWJlbDoge1xuXHRcdFx0XHRcdGZvcm1hdFN0cmluZzogXCJTaG9ydEZsb2F0XCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMudmFsdWVBeGlzMiA9IHtcblx0XHRcdFx0dGl0bGU6IHtcblx0XHRcdFx0XHR2aXNpYmxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRsYWJlbDoge1xuXHRcdFx0XHRcdGZvcm1hdFN0cmluZzogXCJTaG9ydEZsb2F0XCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdG9DaGFydFByb3BlcnRpZXMucGxvdEFyZWEuZGF0YUxhYmVsID0geyB2aXNpYmxlOiBmYWxzZSB9O1xuXHRcdFx0YnJlYWs7XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8gRG8gbm90IHNob3cgZGF0YSBsYWJlbHMgYW5kIGF4aXMgdGl0bGVzXG5cdFx0XHRvQ2hhcnRQcm9wZXJ0aWVzLmNhdGVnb3J5QXhpcyA9IHtcblx0XHRcdFx0dGl0bGU6IHtcblx0XHRcdFx0XHR2aXNpYmxlOiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0b0NoYXJ0UHJvcGVydGllcy52YWx1ZUF4aXMgPSB7XG5cdFx0XHRcdHRpdGxlOiB7XG5cdFx0XHRcdFx0dmlzaWJsZTogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0bGFiZWw6IHtcblx0XHRcdFx0XHRmb3JtYXRTdHJpbmc6IFwiU2hvcnRGbG9hdFwiXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRvQ2hhcnRQcm9wZXJ0aWVzLnBsb3RBcmVhLmRhdGFMYWJlbCA9IHsgdmlzaWJsZTogZmFsc2UgfTtcblx0fVxufVxuZnVuY3Rpb24gZmlsdGVyTWFwKGFPYmplY3RzOiB7IG5hbWU6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgcm9sZT86IHN0cmluZyB9W10sIGFSb2xlcz86IChzdHJpbmcgfCB1bmRlZmluZWQpW10pOiBzdHJpbmdbXSB7XG5cdGlmIChhUm9sZXMgJiYgYVJvbGVzLmxlbmd0aCkge1xuXHRcdHJldHVybiBhT2JqZWN0c1xuXHRcdFx0LmZpbHRlcigoZGltZW5zaW9uKSA9PiB7XG5cdFx0XHRcdHJldHVybiBhUm9sZXMuaW5kZXhPZihkaW1lbnNpb24ucm9sZSkgPj0gMDtcblx0XHRcdH0pXG5cdFx0XHQubWFwKChkaW1lbnNpb24pID0+IHtcblx0XHRcdFx0cmV0dXJuIGRpbWVuc2lvbi5sYWJlbDtcblx0XHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBhT2JqZWN0cy5tYXAoKGRpbWVuc2lvbikgPT4ge1xuXHRcdFx0cmV0dXJuIGRpbWVuc2lvbi5sYWJlbDtcblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRTY2F0dGVyQnViYmxlQ2hhcnRGZWVkcyhjaGFydERlZmluaXRpb246IEtQSUNoYXJ0RGVmaW5pdGlvbik6IHsgdWlkOiBzdHJpbmc7IHR5cGU6IHN0cmluZzsgdmFsdWVzOiBzdHJpbmdbXSB9W10ge1xuXHRjb25zdCBheGlzMU1lYXN1cmVzID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW1wiQXhpczFcIl0pO1xuXHRjb25zdCBheGlzMk1lYXN1cmVzID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW1wiQXhpczJcIl0pO1xuXHRjb25zdCBheGlzM01lYXN1cmVzID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW1wiQXhpczNcIl0pO1xuXHRjb25zdCBvdGhlck1lYXN1cmVzID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW3VuZGVmaW5lZF0pO1xuXHRjb25zdCBzZXJpZXNEaW1lbnNpb25zID0gZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5kaW1lbnNpb25zLCBbXCJTZXJpZXNcIl0pO1xuXG5cdC8vIEdldCB0aGUgZmlyc3QgZGltZW5zaW9uIHdpdGggcm9sZSBcIkNhdGVnb3J5XCIgZm9yIHRoZSBzaGFwZVxuXHRjb25zdCBzaGFwZURpbWVuc2lvbiA9IGNoYXJ0RGVmaW5pdGlvbi5kaW1lbnNpb25zLmZpbmQoKGRpbWVuc2lvbikgPT4ge1xuXHRcdHJldHVybiBkaW1lbnNpb24ucm9sZSA9PT0gXCJDYXRlZ29yeVwiO1xuXHR9KTtcblxuXHQvLyBNZWFzdXJlIGZvciB0aGUgeC1BeGlzIDogZmlyc3QgbWVhc3VyZSBmb3IgQXhpczEsIG9yIGZvciBBeGlzMiBpZiBub3QgZm91bmQsIG9yIGZvciBBeGlzMyBpZiBub3QgZm91bmRcblx0Y29uc3QgeE1lYXN1cmUgPSBheGlzMU1lYXN1cmVzLnNoaWZ0KCkgfHwgYXhpczJNZWFzdXJlcy5zaGlmdCgpIHx8IGF4aXMzTWVhc3VyZXMuc2hpZnQoKSB8fCBvdGhlck1lYXN1cmVzLnNoaWZ0KCkgfHwgXCJcIjtcblx0Ly8gTWVhc3VyZSBmb3IgdGhlIHktQXhpcyA6IGZpcnN0IG1lYXN1cmUgZm9yIEF4aXMyLCBvciBzZWNvbmQgbWVhc3VyZSBmb3IgQXhpczEgaWYgbm90IGZvdW5kLCBvciBmaXJzdCBtZWFzdXJlIGZvciBBeGlzMyBpZiBub3QgZm91bmRcblx0Y29uc3QgeU1lYXN1cmUgPSBheGlzMk1lYXN1cmVzLnNoaWZ0KCkgfHwgYXhpczFNZWFzdXJlcy5zaGlmdCgpIHx8IGF4aXMzTWVhc3VyZXMuc2hpZnQoKSB8fCBvdGhlck1lYXN1cmVzLnNoaWZ0KCkgfHwgXCJcIjtcblx0Y29uc3QgcmVzID0gW1xuXHRcdHtcblx0XHRcdHVpZDogXCJ2YWx1ZUF4aXNcIixcblx0XHRcdHR5cGU6IFwiTWVhc3VyZVwiLFxuXHRcdFx0dmFsdWVzOiBbeE1lYXN1cmVdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHR1aWQ6IFwidmFsdWVBeGlzMlwiLFxuXHRcdFx0dHlwZTogXCJNZWFzdXJlXCIsXG5cdFx0XHR2YWx1ZXM6IFt5TWVhc3VyZV1cblx0XHR9XG5cdF07XG5cblx0aWYgKGNoYXJ0RGVmaW5pdGlvbi5jaGFydFR5cGUgPT09IFwiYnViYmxlXCIpIHtcblx0XHQvLyBNZWFzdXJlIGZvciB0aGUgc2l6ZSBvZiB0aGUgYnViYmxlOiBmaXJzdCBtZWFzdXJlIGZvciBBeGlzMywgb3IgcmVtYWluaW5nIG1lYXN1cmUgZm9yIEF4aXMxL0F4aXMyIGlmIG5vdCBmb3VuZFxuXHRcdGNvbnN0IHNpemVNZWFzdXJlID0gYXhpczNNZWFzdXJlcy5zaGlmdCgpIHx8IGF4aXMxTWVhc3VyZXMuc2hpZnQoKSB8fCBheGlzMk1lYXN1cmVzLnNoaWZ0KCkgfHwgb3RoZXJNZWFzdXJlcy5zaGlmdCgpIHx8IFwiXCI7XG5cdFx0cmVzLnB1c2goe1xuXHRcdFx0dWlkOiBcImJ1YmJsZVdpZHRoXCIsXG5cdFx0XHR0eXBlOiBcIk1lYXN1cmVcIixcblx0XHRcdHZhbHVlczogW3NpemVNZWFzdXJlXVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gQ29sb3IgKG9wdGlvbmFsKVxuXHRpZiAoc2VyaWVzRGltZW5zaW9ucy5sZW5ndGgpIHtcblx0XHRyZXMucHVzaCh7XG5cdFx0XHR1aWQ6IFwiY29sb3JcIixcblx0XHRcdHR5cGU6IFwiRGltZW5zaW9uXCIsXG5cdFx0XHR2YWx1ZXM6IHNlcmllc0RpbWVuc2lvbnNcblx0XHR9KTtcblx0fVxuXHQvLyBTaGFwZSAob3B0aW9uYWwpXG5cdGlmIChzaGFwZURpbWVuc2lvbikge1xuXHRcdHJlcy5wdXNoKHtcblx0XHRcdHVpZDogXCJzaGFwZVwiLFxuXHRcdFx0dHlwZTogXCJEaW1lbnNpb25cIixcblx0XHRcdHZhbHVlczogW3NoYXBlRGltZW5zaW9uLmxhYmVsXVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGdldENoYXJ0RmVlZHMoY2hhcnREZWZpbml0aW9uOiBLUElDaGFydERlZmluaXRpb24pOiB7IHVpZDogc3RyaW5nOyB0eXBlOiBzdHJpbmc7IHZhbHVlczogc3RyaW5nW10gfVtdIHtcblx0bGV0IHJlczogeyB1aWQ6IHN0cmluZzsgdHlwZTogc3RyaW5nOyB2YWx1ZXM6IHN0cmluZ1tdIH1bXTtcblxuXHRzd2l0Y2ggKGNoYXJ0RGVmaW5pdGlvbi5jaGFydFR5cGUpIHtcblx0XHRjYXNlIFwiRG9udXRcIjpcblx0XHRcdHJlcyA9IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHVpZDogXCJzaXplXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJNZWFzdXJlXCIsXG5cdFx0XHRcdFx0dmFsdWVzOiBmaWx0ZXJNYXAoY2hhcnREZWZpbml0aW9uLm1lYXN1cmVzKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dWlkOiBcImNvbG9yXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJEaW1lbnNpb25cIixcblx0XHRcdFx0XHR2YWx1ZXM6IGZpbHRlck1hcChjaGFydERlZmluaXRpb24uZGltZW5zaW9ucylcblx0XHRcdFx0fVxuXHRcdFx0XTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBcImJ1YmJsZVwiOlxuXHRcdGNhc2UgXCJzY2F0dGVyXCI6XG5cdFx0XHRyZXMgPSBnZXRTY2F0dGVyQnViYmxlQ2hhcnRGZWVkcyhjaGFydERlZmluaXRpb24pO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFwidmVydGljYWxfYnVsbGV0XCI6XG5cdFx0XHRyZXMgPSBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR1aWQ6IFwiYWN0dWFsVmFsdWVzXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJNZWFzdXJlXCIsXG5cdFx0XHRcdFx0dmFsdWVzOiBmaWx0ZXJNYXAoY2hhcnREZWZpbml0aW9uLm1lYXN1cmVzLCBbdW5kZWZpbmVkLCBcIkF4aXMxXCJdKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dWlkOiBcInRhcmdldFZhbHVlc1wiLFxuXHRcdFx0XHRcdHR5cGU6IFwiTWVhc3VyZVwiLFxuXHRcdFx0XHRcdHZhbHVlczogZmlsdGVyTWFwKGNoYXJ0RGVmaW5pdGlvbi5tZWFzdXJlcywgW1wiQXhpczJcIl0pXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR1aWQ6IFwiY2F0ZWdvcnlBeGlzXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJEaW1lbnNpb25cIixcblx0XHRcdFx0XHR2YWx1ZXM6IGZpbHRlck1hcChjaGFydERlZmluaXRpb24uZGltZW5zaW9ucywgW3VuZGVmaW5lZCwgXCJDYXRlZ29yeVwiXSlcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHVpZDogXCJjb2xvclwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiRGltZW5zaW9uXCIsXG5cdFx0XHRcdFx0dmFsdWVzOiBmaWx0ZXJNYXAoY2hhcnREZWZpbml0aW9uLmRpbWVuc2lvbnMsIFtcIlNlcmllc1wiXSlcblx0XHRcdFx0fVxuXHRcdFx0XTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJlcyA9IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHVpZDogXCJ2YWx1ZUF4aXNcIixcblx0XHRcdFx0XHR0eXBlOiBcIk1lYXN1cmVcIixcblx0XHRcdFx0XHR2YWx1ZXM6IGZpbHRlck1hcChjaGFydERlZmluaXRpb24ubWVhc3VyZXMpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR1aWQ6IFwiY2F0ZWdvcnlBeGlzXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJEaW1lbnNpb25cIixcblx0XHRcdFx0XHR2YWx1ZXM6IGZpbHRlck1hcChjaGFydERlZmluaXRpb24uZGltZW5zaW9ucywgW3VuZGVmaW5lZCwgXCJDYXRlZ29yeVwiXSlcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHVpZDogXCJjb2xvclwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiRGltZW5zaW9uXCIsXG5cdFx0XHRcdFx0dmFsdWVzOiBmaWx0ZXJNYXAoY2hhcnREZWZpbml0aW9uLmRpbWVuc2lvbnMsIFtcIlNlcmllc1wiXSlcblx0XHRcdFx0fVxuXHRcdFx0XTtcblx0fVxuXG5cdHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIGdldE5hdmlnYXRpb25QYXJhbWV0ZXJzKFxuXHRuYXZJbmZvOiBOYXZpZ2F0aW9uSW5mbyxcblx0b1NoZWxsU2VydmljZTogYW55XG4pOiBQcm9taXNlPHsgc2VtYW50aWNPYmplY3Q/OiBzdHJpbmc7IGFjdGlvbj86IHN0cmluZzsgb3V0Ym91bmQ/OiBzdHJpbmcgfSB8IHVuZGVmaW5lZD4ge1xuXHRpZiAobmF2SW5mby5zZW1hbnRpY09iamVjdCkge1xuXHRcdGlmIChuYXZJbmZvLmFjdGlvbikge1xuXHRcdFx0Ly8gQWN0aW9uIGlzIGFscmVhZHkgc3BlY2lmaWVkOiBjaGVjayBpZiBpdCdzIGF2YWlsYWJsZSBpbiB0aGUgc2hlbGxcblx0XHRcdHJldHVybiBvU2hlbGxTZXJ2aWNlLmdldExpbmtzKHsgc2VtYW50aWNPYmplY3Q6IG5hdkluZm8uc2VtYW50aWNPYmplY3QsIGFjdGlvbjogbmF2SW5mby5hY3Rpb24gfSkudGhlbigoYUxpbmtzOiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYUxpbmtzLmxlbmd0aCA/IHsgc2VtYW50aWNPYmplY3Q6IG5hdkluZm8uc2VtYW50aWNPYmplY3QsIGFjdGlvbjogbmF2SW5mby5hY3Rpb24gfSA6IHVuZGVmaW5lZDtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBXZSBnZXQgdGhlIHByaW1hcnkgaW50ZW50IGZyb20gdGhlIHNoZWxsXG5cdFx0XHRyZXR1cm4gb1NoZWxsU2VydmljZS5nZXRQcmltYXJ5SW50ZW50KG5hdkluZm8uc2VtYW50aWNPYmplY3QpLnRoZW4oKG9MaW5rOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKCFvTGluaykge1xuXHRcdFx0XHRcdC8vIE5vIHByaW1hcnkgaW50ZW50Li4uXG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENoZWNrIHRoYXQgdGhlIHByaW1hcnkgaW50ZW50IGlzIG5vdCBwYXJ0IG9mIHRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zXG5cdFx0XHRcdGNvbnN0IG9JbmZvID0gb1NoZWxsU2VydmljZS5wYXJzZVNoZWxsSGFzaChvTGluay5pbnRlbnQpO1xuXHRcdFx0XHRyZXR1cm4gbmF2SW5mby51bmF2YWlsYWJsZUFjdGlvbnMgJiYgbmF2SW5mby51bmF2YWlsYWJsZUFjdGlvbnMuaW5kZXhPZihvSW5mby5hY3Rpb24pID49IDBcblx0XHRcdFx0XHQ/IHVuZGVmaW5lZFxuXHRcdFx0XHRcdDogeyBzZW1hbnRpY09iamVjdDogb0luZm8uc2VtYW50aWNPYmplY3QsIGFjdGlvbjogb0luZm8uYWN0aW9uIH07XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gT3V0Ym91bmQgbmF2aWdhdGlvbiBzcGVjaWZpZWQgaW4gdGhlIG1hbmlmZXN0XG5cdFx0cmV0dXJuIG5hdkluZm8ub3V0Ym91bmROYXZpZ2F0aW9uID8gUHJvbWlzZS5yZXNvbHZlKHsgb3V0Ym91bmQ6IG5hdkluZm8ub3V0Ym91bmROYXZpZ2F0aW9uIH0pIDogUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG5cdH1cbn1cblxuLyoqXG4gKiBAY2xhc3MgQSBjb250cm9sbGVyIGV4dGVuc2lvbiBmb3IgbWFuYWdpbmcgdGhlIEtQSXMgaW4gYW4gYW5hbHl0aWNhbCBsaXN0IHBhZ2VcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLktQSU1hbmFnZW1lbnRcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAc2luY2UgMS45My4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLktQSU1hbmFnZW1lbnRcIilcbmNsYXNzIEtQSU1hbmFnZW1lbnRDb250cm9sbGVyRXh0ZW5zaW9uIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBhS1BJRGVmaW5pdGlvbnM/OiBLUElEZWZpbml0aW9uW107XG5cdHByb3RlY3RlZCBvQ2FyZDogYW55O1xuXHRwcm90ZWN0ZWQgb1BvcG92ZXIhOiBQb3BvdmVyO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSBjYXJkIG1hbmlmZXN0IGZvciBhIEtQSSBkZWZpbml0aW9uIGFuZCBzdG9yZXMgaXQgaW4gYSBKU09OIG1vZGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0ga3BpRGVmaW5pdGlvbiBUaGUgS1BJIGRlZmluaXRpb25cblx0ICogQHBhcmFtIG9LUElNb2RlbCBUaGUgSlNPTiBtb2RlbCBpbiB3aGljaCB0aGUgbWFuaWZlc3Qgd2lsbCBiZSBzdG9yZWRcblx0ICovXG5cdHByb3RlY3RlZCBpbml0Q2FyZE1hbmlmZXN0KGtwaURlZmluaXRpb246IEtQSURlZmluaXRpb24sIG9LUElNb2RlbDogSlNPTk1vZGVsKTogdm9pZCB7XG5cdFx0Y29uc3Qgb0NhcmRNYW5pZmVzdDogYW55ID0ge1xuXHRcdFx0XCJzYXAuYXBwXCI6IHtcblx0XHRcdFx0aWQ6IFwic2FwLmZlXCIsXG5cdFx0XHRcdHR5cGU6IFwiY2FyZFwiXG5cdFx0XHR9LFxuXHRcdFx0XCJzYXAudWlcIjoge1xuXHRcdFx0XHR0ZWNobm9sb2d5OiBcIlVJNVwiXG5cdFx0XHR9LFxuXHRcdFx0XCJzYXAuY2FyZFwiOiB7XG5cdFx0XHRcdHR5cGU6IFwiQW5hbHl0aWNhbFwiLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0anNvbjoge31cblx0XHRcdFx0fSxcblx0XHRcdFx0aGVhZGVyOiB7XG5cdFx0XHRcdFx0dHlwZTogXCJOdW1lcmljXCIsXG5cdFx0XHRcdFx0dGl0bGU6IGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRpdGxlLFxuXHRcdFx0XHRcdHN1YlRpdGxlOiBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5kZXNjcmlwdGlvbixcblx0XHRcdFx0XHR1bml0T2ZNZWFzdXJlbWVudDogXCJ7bWFpblVuaXR9XCIsXG5cdFx0XHRcdFx0bWFpbkluZGljYXRvcjoge1xuXHRcdFx0XHRcdFx0bnVtYmVyOiBcInttYWluVmFsdWVOb1NjYWxlfVwiLFxuXHRcdFx0XHRcdFx0dW5pdDogXCJ7bWFpblZhbHVlU2NhbGV9XCIsXG5cdFx0XHRcdFx0XHRzdGF0ZTogXCJ7bWFpblN0YXRlfVwiLFxuXHRcdFx0XHRcdFx0dHJlbmQ6IFwie3RyZW5kfVwiXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRjb250ZW50OiB7XG5cdFx0XHRcdFx0bWluSGVpZ2h0OiBcIjI1cmVtXCIsXG5cdFx0XHRcdFx0Y2hhcnRQcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0XHRwbG90QXJlYToge30sXG5cdFx0XHRcdFx0XHR0aXRsZToge1xuXHRcdFx0XHRcdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRhbGlnbm1lbnQ6IFwibGVmdFwiXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRwYXRoOiBcIi9jaGFydERhdGFcIlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBBZGQgc2lkZSBpbmRpY2F0b3JzIGluIHRoZSBjYXJkIGhlYWRlciBpZiBhIHRhcmdldCBpcyBkZWZpbmVkIGZvciB0aGUgS1BJXG5cdFx0aWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRhcmdldFBhdGggfHwga3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudGFyZ2V0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgcmVzQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRcdG9DYXJkTWFuaWZlc3RbXCJzYXAuY2FyZFwiXS5oZWFkZXIuc2lkZUluZGljYXRvcnMgPSBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aXRsZTogcmVzQnVuZGxlLmdldFRleHQoXCJDX0tQSUNBUkRfSU5ESUNBVE9SX1RBUkdFVFwiKSxcblx0XHRcdFx0XHRudW1iZXI6IFwie3RhcmdldE51bWJlcn1cIixcblx0XHRcdFx0XHR1bml0OiBcInt0YXJnZXRVbml0fVwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0aXRsZTogcmVzQnVuZGxlLmdldFRleHQoXCJDX0tQSUNBUkRfSU5ESUNBVE9SX0RFVklBVElPTlwiKSxcblx0XHRcdFx0XHRudW1iZXI6IFwie2RldmlhdGlvbk51bWJlcn1cIixcblx0XHRcdFx0XHR1bml0OiBcIiVcIlxuXHRcdFx0XHR9XG5cdFx0XHRdO1xuXHRcdH1cblxuXHRcdC8vIERldGFpbHMgb2YgdGhlIGNhcmQ6IGZpbHRlciBkZXNjcmlwdGlvbnNcblx0XHRpZiAoa3BpRGVmaW5pdGlvbi5zZWxlY3Rpb25WYXJpYW50RmlsdGVyRGVmaW5pdGlvbnM/Lmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgYURlc2NyaXB0aW9uczogc3RyaW5nW10gPSBbXTtcblx0XHRcdGtwaURlZmluaXRpb24uc2VsZWN0aW9uVmFyaWFudEZpbHRlckRlZmluaXRpb25zLmZvckVhY2goKGZpbHRlckRlZmluaXRpb24pID0+IHtcblx0XHRcdFx0Y29uc3QgZGVzYyA9IGdldEZpbHRlclN0cmluZ0Zyb21EZWZpbml0aW9uKGZpbHRlckRlZmluaXRpb24pO1xuXHRcdFx0XHRpZiAoZGVzYykge1xuXHRcdFx0XHRcdGFEZXNjcmlwdGlvbnMucHVzaChkZXNjKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChhRGVzY3JpcHRpb25zLmxlbmd0aCkge1xuXHRcdFx0XHRvQ2FyZE1hbmlmZXN0W1wic2FwLmNhcmRcIl0uaGVhZGVyLmRldGFpbHMgPSBhRGVzY3JpcHRpb25zLmpvaW4oXCIsIFwiKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBDaGFydCBzZXR0aW5nczogdHlwZSwgdGl0bGUsIGRpbWVuc2lvbnMgYW5kIG1lYXN1cmVzIGluIHRoZSBtYW5pZmVzdFxuXHRcdG9DYXJkTWFuaWZlc3RbXCJzYXAuY2FyZFwiXS5jb250ZW50LmNoYXJ0VHlwZSA9IGtwaURlZmluaXRpb24uY2hhcnQuY2hhcnRUeXBlO1xuXHRcdHVwZGF0ZUNoYXJ0TGFiZWxTZXR0aW5ncyhrcGlEZWZpbml0aW9uLmNoYXJ0LCBvQ2FyZE1hbmlmZXN0W1wic2FwLmNhcmRcIl0uY29udGVudC5jaGFydFByb3BlcnRpZXMpO1xuXHRcdG9DYXJkTWFuaWZlc3RbXCJzYXAuY2FyZFwiXS5jb250ZW50LmNoYXJ0UHJvcGVydGllcy50aXRsZS50ZXh0ID0gZm9ybWF0Q2hhcnRUaXRsZShrcGlEZWZpbml0aW9uKTtcblx0XHRvQ2FyZE1hbmlmZXN0W1wic2FwLmNhcmRcIl0uY29udGVudC5kaW1lbnNpb25zID0ga3BpRGVmaW5pdGlvbi5jaGFydC5kaW1lbnNpb25zLm1hcCgoZGltZW5zaW9uKSA9PiB7XG5cdFx0XHRyZXR1cm4geyBsYWJlbDogZGltZW5zaW9uLmxhYmVsLCB2YWx1ZTogYHske2RpbWVuc2lvbi5uYW1lfX1gIH07XG5cdFx0fSk7XG5cdFx0b0NhcmRNYW5pZmVzdFtcInNhcC5jYXJkXCJdLmNvbnRlbnQubWVhc3VyZXMgPSBrcGlEZWZpbml0aW9uLmNoYXJ0Lm1lYXN1cmVzLm1hcCgobWVhc3VyZSkgPT4ge1xuXHRcdFx0cmV0dXJuIHsgbGFiZWw6IG1lYXN1cmUubGFiZWwsIHZhbHVlOiBgeyR7bWVhc3VyZS5uYW1lfX1gIH07XG5cdFx0fSk7XG5cdFx0b0NhcmRNYW5pZmVzdFtcInNhcC5jYXJkXCJdLmNvbnRlbnQuZmVlZHMgPSBnZXRDaGFydEZlZWRzKGtwaURlZmluaXRpb24uY2hhcnQpO1xuXG5cdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfWAsIHtcblx0XHRcdG1hbmlmZXN0OiBvQ2FyZE1hbmlmZXN0XG5cdFx0fSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgaW5pdE5hdmlnYXRpb25JbmZvKGtwaURlZmluaXRpb246IEtQSURlZmluaXRpb24sIG9LUElNb2RlbDogSlNPTk1vZGVsLCBvU2hlbGxTZXJ2aWNlOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyBBZGQgbmF2aWdhdGlvblxuXHRcdGlmIChrcGlEZWZpbml0aW9uLm5hdmlnYXRpb24pIHtcblx0XHRcdHJldHVybiBnZXROYXZpZ2F0aW9uUGFyYW1ldGVycyhrcGlEZWZpbml0aW9uLm5hdmlnYXRpb24sIG9TaGVsbFNlcnZpY2UpLnRoZW4oKG9OYXZJbmZvKSA9PiB7XG5cdFx0XHRcdGlmIChvTmF2SW5mbykge1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvaGVhZGVyL2FjdGlvbnNgLCBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IFwiTmF2aWdhdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRwYXJhbWV0ZXJzOiBvTmF2SW5mb1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0fVxuXG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdHB1YmxpYyBvbkluaXQoKTogdm9pZCB7XG5cdFx0dGhpcy5hS1BJRGVmaW5pdGlvbnMgPSAodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL2twaURlZmluaXRpb25zXCIpO1xuXG5cdFx0aWYgKHRoaXMuYUtQSURlZmluaXRpb25zICYmIHRoaXMuYUtQSURlZmluaXRpb25zLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSAob1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIEJhc2VDb250cm9sbGVyKS5nZXRBcHBDb21wb25lbnQoKSBhcyBhbnk7XG5cblx0XHRcdC8vIENyZWF0ZSBhIEpTT04gbW9kZWwgdG8gc3RvcmUgS1BJIGRhdGFcblx0XHRcdGNvbnN0IG9LUElNb2RlbCA9IG5ldyBKU09OTW9kZWwoKTtcblx0XHRcdG9WaWV3LnNldE1vZGVsKG9LUElNb2RlbCwgXCJrcGlNb2RlbFwiKTtcblxuXHRcdFx0dGhpcy5hS1BJRGVmaW5pdGlvbnMuZm9yRWFjaCgoa3BpRGVmaW5pdGlvbikgPT4ge1xuXHRcdFx0XHQvLyBDcmVhdGUgdGhlIG1hbmlmZXN0IGZvciB0aGUgS1BJIGNhcmQgYW5kIHN0b3JlIGl0IGluIHRoZSBLUEkgbW9kZWxcblx0XHRcdFx0dGhpcy5pbml0Q2FyZE1hbmlmZXN0KGtwaURlZmluaXRpb24sIG9LUElNb2RlbCk7XG5cblx0XHRcdFx0Ly8gU2V0IHRoZSBuYXZpZ2F0aW9uIGluZm9ybWF0aW9uIGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHR0aGlzLmluaXROYXZpZ2F0aW9uSW5mbyhrcGlEZWZpbml0aW9uLCBvS1BJTW9kZWwsIG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpKS5jYXRjaChmdW5jdGlvbiAoZXJyOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoZXJyKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gTG9hZCB0YWcgZGF0YSBmb3IgdGhlIEtQSVxuXHRcdFx0XHR0aGlzLmxvYWRLUElUYWdEYXRhKGtwaURlZmluaXRpb24sIG9BcHBDb21wb25lbnQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsLCBvS1BJTW9kZWwpLmNhdGNoKGZ1bmN0aW9uIChlcnI6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihlcnIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdHB1YmxpYyBvbkV4aXQoKTogdm9pZCB7XG5cdFx0Y29uc3Qgb0tQSU1vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJrcGlNb2RlbFwiKSBhcyBKU09OTW9kZWw7XG5cblx0XHRpZiAob0tQSU1vZGVsKSB7XG5cdFx0XHRvS1BJTW9kZWwuZGVzdHJveSgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlRGF0YXBvaW50VmFsdWVBbmRDdXJyZW5jeShrcGlEZWZpbml0aW9uOiBLUElEZWZpbml0aW9uLCBrcGlDb250ZXh0OiBDb250ZXh0LCBvS1BJTW9kZWw6IEpTT05Nb2RlbCkge1xuXHRcdGNvbnN0IGN1cnJlbnRMb2NhbGUgPSBuZXcgTG9jYWxlKHNhcC51aS5nZXRDb3JlKCkuZ2V0Q29uZmlndXJhdGlvbigpLmdldExhbmd1YWdlKCkpO1xuXHRcdGNvbnN0IHJhd1VuaXQgPSBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0Py5pc1BhdGhcblx0XHRcdD8ga3BpQ29udGV4dC5nZXRQcm9wZXJ0eShrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0LnZhbHVlKVxuXHRcdFx0OiBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0Py52YWx1ZTtcblxuXHRcdGNvbnN0IGlzUGVyY2VudGFnZSA9IGtwaURlZmluaXRpb24uZGF0YXBvaW50LnVuaXQ/LmlzQ3VycmVuY3kgPT09IGZhbHNlICYmIHJhd1VuaXQgPT09IFwiJVwiO1xuXG5cdFx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gTWFpbiBLUEkgdmFsdWVcblx0XHRjb25zdCByYXdWYWx1ZSA9IE51bWJlci5wYXJzZUZsb2F0KGtwaUNvbnRleHQuZ2V0UHJvcGVydHkoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQucHJvcGVydHlQYXRoKSk7XG5cblx0XHQvLyBWYWx1ZSBmb3JtYXR0ZWQgd2l0aCBhIHNjYWxlXG5cdFx0Y29uc3Qga3BpVmFsdWUgPSBOdW1iZXJGb3JtYXQuZ2V0RmxvYXRJbnN0YW5jZShcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IGlzUGVyY2VudGFnZSA/IHVuZGVmaW5lZCA6IFwic2hvcnRcIixcblx0XHRcdFx0bWluRnJhY3Rpb25EaWdpdHM6IDAsXG5cdFx0XHRcdG1heEZyYWN0aW9uRGlnaXRzOiAxLFxuXHRcdFx0XHRzaG93U2NhbGU6ICFpc1BlcmNlbnRhZ2Vcblx0XHRcdH0sXG5cdFx0XHRjdXJyZW50TG9jYWxlXG5cdFx0KS5mb3JtYXQocmF3VmFsdWUpO1xuXHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5WYWx1ZWAsIGtwaVZhbHVlKTtcblxuXHRcdC8vIFZhbHVlIHdpdGhvdXQgYSBzY2FsZVxuXHRcdGNvbnN0IGtwaVZhbHVlVW5zY2FsZWQgPSBOdW1iZXJGb3JtYXQuZ2V0RmxvYXRJbnN0YW5jZShcblx0XHRcdHtcblx0XHRcdFx0bWF4RnJhY3Rpb25EaWdpdHM6IDIsXG5cdFx0XHRcdHNob3dTY2FsZTogZmFsc2UsXG5cdFx0XHRcdGdyb3VwaW5nRW5hYmxlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdGN1cnJlbnRMb2NhbGVcblx0XHQpLmZvcm1hdChyYXdWYWx1ZSk7XG5cdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblZhbHVlVW5zY2FsZWRgLCBrcGlWYWx1ZVVuc2NhbGVkKTtcblxuXHRcdC8vIFZhbHVlIGZvcm1hdHRlZCB3aXRoIHRoZSBzY2FsZSBvbWl0dGVkXG5cdFx0Y29uc3Qga3BpVmFsdWVOb1NjYWxlID0gTnVtYmVyRm9ybWF0LmdldEZsb2F0SW5zdGFuY2UoXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiBpc1BlcmNlbnRhZ2UgPyB1bmRlZmluZWQgOiBcInNob3J0XCIsXG5cdFx0XHRcdG1pbkZyYWN0aW9uRGlnaXRzOiAwLFxuXHRcdFx0XHRtYXhGcmFjdGlvbkRpZ2l0czogMSxcblx0XHRcdFx0c2hvd1NjYWxlOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdGN1cnJlbnRMb2NhbGVcblx0XHQpLmZvcm1hdChyYXdWYWx1ZSk7XG5cdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblZhbHVlTm9TY2FsZWAsIGtwaVZhbHVlTm9TY2FsZSk7XG5cblx0XHQvLyBTY2FsZSBvZiB0aGUgdmFsdWVcblx0XHRjb25zdCBrcGlWYWx1ZVNjYWxlID0gTnVtYmVyRm9ybWF0LmdldEZsb2F0SW5zdGFuY2UoXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiBpc1BlcmNlbnRhZ2UgPyB1bmRlZmluZWQgOiBcInNob3J0XCIsXG5cdFx0XHRcdGRlY2ltYWxzOiAwLFxuXHRcdFx0XHRtYXhJbnRlZ2VyRGlnaXRzOiAwLFxuXHRcdFx0XHRzaG93U2NhbGU6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRjdXJyZW50TG9jYWxlXG5cdFx0KS5mb3JtYXQocmF3VmFsdWUpO1xuXHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5WYWx1ZVNjYWxlYCwga3BpVmFsdWVTY2FsZSk7XG5cblx0XHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBVbml0IG9yIGN1cnJlbmN5XG5cdFx0aWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LnVuaXQgJiYgcmF3VW5pdCkge1xuXHRcdFx0aWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LnVuaXQuaXNDdXJyZW5jeSkge1xuXHRcdFx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9tYWluVW5pdGAsIHJhd1VuaXQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gSW4gY2FzZSBvZiB1bml0IG9mIG1lYXN1cmUsIHdlIGhhdmUgdG8gZm9ybWF0IGl0IHByb3Blcmx5XG5cdFx0XHRcdGNvbnN0IGtwaVVuaXQgPSBOdW1iZXJGb3JtYXQuZ2V0VW5pdEluc3RhbmNlKHsgc2hvd051bWJlcjogZmFsc2UgfSwgY3VycmVudExvY2FsZSkuZm9ybWF0KHJhd1ZhbHVlLCByYXdVbml0KTtcblx0XHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblVuaXRgLCBrcGlVbml0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZURhdGFwb2ludENyaXRpY2FsaXR5KGtwaURlZmluaXRpb246IEtQSURlZmluaXRpb24sIGtwaUNvbnRleHQ6IENvbnRleHQsIG9LUElNb2RlbDogSlNPTk1vZGVsKSB7XG5cdFx0Y29uc3QgcmF3VmFsdWUgPSBOdW1iZXIucGFyc2VGbG9hdChrcGlDb250ZXh0LmdldFByb3BlcnR5KGtwaURlZmluaXRpb24uZGF0YXBvaW50LnByb3BlcnR5UGF0aCkpO1xuXG5cdFx0bGV0IGNyaXRpY2FsaXR5VmFsdWUgPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5jcml0aWNhbGl0eVZhbHVlKSB7XG5cdFx0XHQvLyBDcml0aWNhbGl0eSBpcyBhIGZpeGVkIHZhbHVlXG5cdFx0XHRjcml0aWNhbGl0eVZhbHVlID0ga3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuY3JpdGljYWxpdHlWYWx1ZTtcblx0XHR9IGVsc2UgaWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LmNyaXRpY2FsaXR5UGF0aCkge1xuXHRcdFx0Ly8gQ3JpdGljYWxpdHkgY29tZXMgZnJvbSBhbm90aGVyIHByb3BlcnR5ICh2aWEgYSBwYXRoKVxuXHRcdFx0Y3JpdGljYWxpdHlWYWx1ZSA9XG5cdFx0XHRcdE1lc3NhZ2VUeXBlRnJvbUNyaXRpY2FsaXR5W2twaUNvbnRleHQuZ2V0UHJvcGVydHkoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuY3JpdGljYWxpdHlQYXRoKV0gfHwgTWVzc2FnZVR5cGUuTm9uZTtcblx0XHR9IGVsc2UgaWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LmNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UaHJlc2hvbGRzICYmIGtwaURlZmluaXRpb24uZGF0YXBvaW50LmNyaXRpY2FsaXR5Q2FsY3VsYXRpb25Nb2RlKSB7XG5cdFx0XHQvLyBDcml0aWNhbGl0eSBjYWxjdWxhdGlvblxuXHRcdFx0c3dpdGNoIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5jcml0aWNhbGl0eUNhbGN1bGF0aW9uTW9kZSkge1xuXHRcdFx0XHRjYXNlIFwiVUkuSW1wcm92ZW1lbnREaXJlY3Rpb25UeXBlL1RhcmdldFwiOlxuXHRcdFx0XHRcdGNyaXRpY2FsaXR5VmFsdWUgPSBtZXNzYWdlVHlwZUZyb21UYXJnZXRDYWxjdWxhdGlvbihyYXdWYWx1ZSwga3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHMpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJVSS5JbXByb3ZlbWVudERpcmVjdGlvblR5cGUvTWluaW1pemVcIjpcblx0XHRcdFx0XHRjcml0aWNhbGl0eVZhbHVlID0gbWVzc2FnZVR5cGVGcm9tTWluaW1pemVDYWxjdWxhdGlvbihcblx0XHRcdFx0XHRcdHJhd1ZhbHVlLFxuXHRcdFx0XHRcdFx0a3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJVSS5JbXByb3ZlbWVudERpcmVjdGlvblR5cGUvTWF4aW1pemVcIjpcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRjcml0aWNhbGl0eVZhbHVlID0gbWVzc2FnZVR5cGVGcm9tTWF4aW1pemVDYWxjdWxhdGlvbihcblx0XHRcdFx0XHRcdHJhd1ZhbHVlLFxuXHRcdFx0XHRcdFx0a3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5Dcml0aWNhbGl0eWAsIGNyaXRpY2FsaXR5VmFsdWUpO1xuXHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShcblx0XHRcdGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblN0YXRlYCxcblx0XHRcdFZhbHVlQ29sb3JGcm9tTWVzc2FnZVR5cGVbY3JpdGljYWxpdHlWYWx1ZV0gfHwgXCJOb25lXCJcblx0XHQpO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVEYXRhcG9pbnRUcmVuZChrcGlEZWZpbml0aW9uOiBLUElEZWZpbml0aW9uLCBrcGlDb250ZXh0OiBDb250ZXh0LCBvS1BJTW9kZWw6IEpTT05Nb2RlbCkge1xuXHRcdGNvbnN0IHJhd1ZhbHVlID0gTnVtYmVyLnBhcnNlRmxvYXQoa3BpQ29udGV4dC5nZXRQcm9wZXJ0eShrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5wcm9wZXJ0eVBhdGgpKTtcblxuXHRcdGxldCB0cmVuZFZhbHVlID0gXCJOb25lXCI7XG5cblx0XHRpZiAoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudHJlbmRWYWx1ZSkge1xuXHRcdFx0Ly8gVHJlbmQgaXMgYSBmaXhlZCB2YWx1ZVxuXHRcdFx0dHJlbmRWYWx1ZSA9IGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kVmFsdWU7XG5cdFx0fSBlbHNlIGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZFBhdGgpIHtcblx0XHRcdC8vIFRyZW5kIGNvbWVzIGZyb20gYW5vdGhlciBwcm9wZXJ0eSB2aWEgYSBwYXRoXG5cdFx0XHR0cmVuZFZhbHVlID0gZGV2aWF0aW9uSW5kaWNhdG9yRnJvbVRyZW5kVHlwZShrcGlDb250ZXh0LmdldFByb3BlcnR5KGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kUGF0aCkpO1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZENhbGN1bGF0aW9uUmVmZXJlbmNlVmFsdWUgIT09IHVuZGVmaW5lZCB8fFxuXHRcdFx0a3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvblJlZmVyZW5jZVBhdGhcblx0XHQpIHtcblx0XHRcdC8vIENhbGN1bGF0ZWQgdHJlbmRcblx0XHRcdGxldCB0cmVuZFJlZmVyZW5jZVZhbHVlOiBudW1iZXI7XG5cdFx0XHRpZiAoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvblJlZmVyZW5jZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dHJlbmRSZWZlcmVuY2VWYWx1ZSA9IGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VWYWx1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRyZW5kUmVmZXJlbmNlVmFsdWUgPSBOdW1iZXIucGFyc2VGbG9hdChcblx0XHRcdFx0XHRrcGlDb250ZXh0LmdldFByb3BlcnR5KGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VQYXRoIHx8IFwiXCIpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHR0cmVuZFZhbHVlID0gZGV2aWF0aW9uSW5kaWNhdG9yRnJvbUNhbGN1bGF0aW9uKFxuXHRcdFx0XHRyYXdWYWx1ZSxcblx0XHRcdFx0dHJlbmRSZWZlcmVuY2VWYWx1ZSxcblx0XHRcdFx0ISFrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZENhbGN1bGF0aW9uSXNSZWxhdGl2ZSxcblx0XHRcdFx0a3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvblRyZXNob2xkc1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi90cmVuZGAsIHRyZW5kVmFsdWUpO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVUYXJnZXRWYWx1ZShrcGlEZWZpbml0aW9uOiBLUElEZWZpbml0aW9uLCBrcGlDb250ZXh0OiBDb250ZXh0LCBvS1BJTW9kZWw6IEpTT05Nb2RlbCkge1xuXHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50YXJnZXRWYWx1ZSA9PT0gdW5kZWZpbmVkICYmIGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRhcmdldFBhdGggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuOyAvLyBObyB0YXJnZXQgc2V0IGZvciB0aGUgS1BJXG5cdFx0fVxuXHRcdGNvbnN0IHJhd1ZhbHVlID0gTnVtYmVyLnBhcnNlRmxvYXQoa3BpQ29udGV4dC5nZXRQcm9wZXJ0eShrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5wcm9wZXJ0eVBhdGgpKTtcblx0XHRjb25zdCBjdXJyZW50TG9jYWxlID0gbmV3IExvY2FsZShzYXAudWkuZ2V0Q29yZSgpLmdldENvbmZpZ3VyYXRpb24oKS5nZXRMYW5ndWFnZSgpKTtcblxuXHRcdGxldCB0YXJnZXRSYXdWYWx1ZTogbnVtYmVyO1xuXHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50YXJnZXRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0YXJnZXRSYXdWYWx1ZSA9IGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRhcmdldFZhbHVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0YXJnZXRSYXdWYWx1ZSA9IE51bWJlci5wYXJzZUZsb2F0KGtwaUNvbnRleHQuZ2V0UHJvcGVydHkoa3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudGFyZ2V0UGF0aCB8fCBcIlwiKSk7XG5cdFx0fVxuXHRcdGNvbnN0IGRldmlhdGlvblJhd1ZhbHVlID0gdGFyZ2V0UmF3VmFsdWUgIT09IDAgPyAoKHJhd1ZhbHVlIC0gdGFyZ2V0UmF3VmFsdWUpIC8gdGFyZ2V0UmF3VmFsdWUpICogMTAwIDogdW5kZWZpbmVkO1xuXG5cdFx0Ly8gRm9ybWF0dGluZ1xuXHRcdGNvbnN0IHRhcmdldFZhbHVlID0gTnVtYmVyRm9ybWF0LmdldEZsb2F0SW5zdGFuY2UoXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiBcInNob3J0XCIsXG5cdFx0XHRcdG1pbkZyYWN0aW9uRGlnaXRzOiAwLFxuXHRcdFx0XHRtYXhGcmFjdGlvbkRpZ2l0czogMSxcblx0XHRcdFx0c2hvd1NjYWxlOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdGN1cnJlbnRMb2NhbGVcblx0XHQpLmZvcm1hdCh0YXJnZXRSYXdWYWx1ZSk7XG5cdFx0Y29uc3QgdGFyZ2V0U2NhbGUgPSBOdW1iZXJGb3JtYXQuZ2V0RmxvYXRJbnN0YW5jZShcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IFwic2hvcnRcIixcblx0XHRcdFx0ZGVjaW1hbHM6IDAsXG5cdFx0XHRcdG1heEludGVnZXJEaWdpdHM6IDAsXG5cdFx0XHRcdHNob3dTY2FsZTogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdGN1cnJlbnRMb2NhbGVcblx0XHQpLmZvcm1hdCh0YXJnZXRSYXdWYWx1ZSk7XG5cblx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi90YXJnZXROdW1iZXJgLCB0YXJnZXRWYWx1ZSk7XG5cdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vdGFyZ2V0VW5pdGAsIHRhcmdldFNjYWxlKTtcblxuXHRcdGlmIChkZXZpYXRpb25SYXdWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBkZXZpYXRpb25WYWx1ZSA9IE51bWJlckZvcm1hdC5nZXRGbG9hdEluc3RhbmNlKFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWluRnJhY3Rpb25EaWdpdHM6IDAsXG5cdFx0XHRcdFx0bWF4RnJhY3Rpb25EaWdpdHM6IDEsXG5cdFx0XHRcdFx0c2hvd1NjYWxlOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRjdXJyZW50TG9jYWxlXG5cdFx0XHQpLmZvcm1hdChkZXZpYXRpb25SYXdWYWx1ZSk7XG5cdFx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9kZXZpYXRpb25OdW1iZXJgLCBkZXZpYXRpb25WYWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL2RldmlhdGlvbk51bWJlcmAsIFwiTi9BXCIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyB0YWcgZGF0YSBmb3IgYSBLUEksIGFuZCBzdG9yZXMgaXQgaW4gdGhlIEpTT04gS1BJIG1vZGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0ga3BpRGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiBvZiB0aGUgS1BJLlxuXHQgKiBAcGFyYW0gb01haW5Nb2RlbCBUaGUgbW9kZWwgdXNlZCB0byBsb2FkIHRoZSBkYXRhLlxuXHQgKiBAcGFyYW0gb0tQSU1vZGVsIFRoZSBKU09OIG1vZGVsIHdoZXJlIHRoZSBkYXRhIHdpbGwgYmUgc3RvcmVkXG5cdCAqIEBwYXJhbSBsb2FkRnVsbCBJZiBub3QgdHJ1ZSwgbG9hZHMgb25seSBkYXRhIGZvciB0aGUgS1BJIHRhZ1xuXHQgKiBAcmV0dXJucyBUaGUgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gZGF0YSBpcyBsb2FkZWQuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgbG9hZEtQSVRhZ0RhdGEoa3BpRGVmaW5pdGlvbjogS1BJRGVmaW5pdGlvbiwgb01haW5Nb2RlbDogT0RhdGFNb2RlbCwgb0tQSU1vZGVsOiBKU09OTW9kZWwsIGxvYWRGdWxsPzogYm9vbGVhbik6IGFueSB7XG5cdFx0Ly8gSWYgbG9hZEZ1bGw9ZmFsc2UsIHRoZW4gd2UncmUganVzdCBsb2FkaW5nIGRhdGEgZm9yIHRoZSB0YWcgYW5kIHdlIHVzZSB0aGUgXCIkYXV0by5Mb25nUnVubmVyc1wiIGdyb3VwSURcblx0XHQvLyBJZiBsb2FkRnVsbD10cnVlLCB3ZSdyZSBsb2FkaW5nIGRhdGEgZm9yIHRoZSB3aG9sZSBLUEkgKHRhZyArIGNhcmQpIGFuZCB3ZSB1c2UgdGhlIFwiJGF1dG8uV29ya2Vyc1wiIGdyb3VwSURcblx0XHRjb25zdCBvTGlzdEJpbmRpbmcgPSBsb2FkRnVsbFxuXHRcdFx0PyBvTWFpbk1vZGVsLmJpbmRMaXN0KGAvJHtrcGlEZWZpbml0aW9uLmVudGl0eVNldH1gLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB7ICQkZ3JvdXBJZDogXCIkYXV0by5Xb3JrZXJzXCIgfSlcblx0XHRcdDogb01haW5Nb2RlbC5iaW5kTGlzdChgLyR7a3BpRGVmaW5pdGlvbi5lbnRpdHlTZXR9YCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgeyAkJGdyb3VwSWQ6IFwiJGF1dG8uTG9uZ1J1bm5lcnNcIiB9KTtcblx0XHRjb25zdCBvQWdncmVnYXRlOiBSZWNvcmQ8c3RyaW5nLCB7IHVuaXQ/OiBzdHJpbmcgfT4gPSB7fTtcblxuXHRcdC8vIE1haW4gdmFsdWUgKyBjdXJyZW5jeS91bml0XG5cdFx0aWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LnVuaXQ/LmlzUGF0aCkge1xuXHRcdFx0b0FnZ3JlZ2F0ZVtrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5wcm9wZXJ0eVBhdGhdID0geyB1bml0OiBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0LnZhbHVlIH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9BZ2dyZWdhdGVba3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQucHJvcGVydHlQYXRoXSA9IHt9O1xuXHRcdH1cblxuXHRcdC8vIFByb3BlcnR5IGZvciBjcml0aWNhbGl0eVxuXHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC5jcml0aWNhbGl0eVBhdGgpIHtcblx0XHRcdG9BZ2dyZWdhdGVba3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQuY3JpdGljYWxpdHlQYXRoXSA9IHt9O1xuXHRcdH1cblxuXHRcdC8vIFByb3BlcnRpZXMgZm9yIHRyZW5kIGFuZCB0cmVuZCBjYWxjdWxhdGlvblxuXHRcdGlmIChsb2FkRnVsbCkge1xuXHRcdFx0aWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kUGF0aCkge1xuXHRcdFx0XHRvQWdncmVnYXRlW2twaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kUGF0aF0gPSB7fTtcblx0XHRcdH1cblx0XHRcdGlmIChrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50cmVuZENhbGN1bGF0aW9uUmVmZXJlbmNlUGF0aCkge1xuXHRcdFx0XHRvQWdncmVnYXRlW2twaURlZmluaXRpb24uZGF0YXBvaW50LnRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VQYXRoXSA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LnRhcmdldFBhdGgpIHtcblx0XHRcdFx0b0FnZ3JlZ2F0ZVtrcGlEZWZpbml0aW9uLmRhdGFwb2ludC50YXJnZXRQYXRoXSA9IHt9O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG9MaXN0QmluZGluZy5zZXRBZ2dyZWdhdGlvbih7IGFnZ3JlZ2F0ZTogb0FnZ3JlZ2F0ZSB9KTtcblxuXHRcdC8vIE1hbmFnZSBTZWxlY3Rpb25WYXJpYW50IGZpbHRlcnNcblx0XHRpZiAoa3BpRGVmaW5pdGlvbi5zZWxlY3Rpb25WYXJpYW50RmlsdGVyRGVmaW5pdGlvbnM/Lmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgYUZpbHRlcnMgPSBrcGlEZWZpbml0aW9uLnNlbGVjdGlvblZhcmlhbnRGaWx0ZXJEZWZpbml0aW9ucy5tYXAoY3JlYXRlRmlsdGVyRnJvbURlZmluaXRpb24pLmZpbHRlcigoZmlsdGVyKSA9PiB7XG5cdFx0XHRcdHJldHVybiBmaWx0ZXIgIT09IHVuZGVmaW5lZDtcblx0XHRcdH0pIGFzIEZpbHRlcltdO1xuXHRcdFx0b0xpc3RCaW5kaW5nLmZpbHRlcihhRmlsdGVycyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9MaXN0QmluZGluZy5yZXF1ZXN0Q29udGV4dHMoMCwgMSkudGhlbigoYUNvbnRleHRzOiBDb250ZXh0W10pID0+IHtcblx0XHRcdGlmIChhQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnN0IHJhd1VuaXQgPSBrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0Py5pc1BhdGhcblx0XHRcdFx0XHQ/IGFDb250ZXh0c1swXS5nZXRQcm9wZXJ0eShrcGlEZWZpbml0aW9uLmRhdGFwb2ludC51bml0LnZhbHVlKVxuXHRcdFx0XHRcdDoga3BpRGVmaW5pdGlvbi5kYXRhcG9pbnQudW5pdD8udmFsdWU7XG5cblx0XHRcdFx0aWYgKGtwaURlZmluaXRpb24uZGF0YXBvaW50LnVuaXQgJiYgIXJhd1VuaXQpIHtcblx0XHRcdFx0XHQvLyBBIHVuaXQvY3VycmVuY3kgaXMgZGVmaW5lZCwgYnV0IGl0cyB2YWx1ZSBpcyB1bmRlZmluZWQgLS0+IG11bHRpLXVuaXQgc2l0dWF0aW9uXG5cdFx0XHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblZhbHVlYCwgXCIqXCIpO1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5WYWx1ZVVuc2NhbGVkYCwgXCIqXCIpO1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5WYWx1ZU5vU2NhbGVgLCBcIipcIik7XG5cdFx0XHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblZhbHVlU2NhbGVgLCBcIlwiKTtcblx0XHRcdFx0XHRvS1BJTW9kZWwuc2V0UHJvcGVydHkoYC8ke2twaURlZmluaXRpb24uaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9tYWluVW5pdGAsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpbkNyaXRpY2FsaXR5YCwgTWVzc2FnZVR5cGUuTm9uZSk7XG5cdFx0XHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblN0YXRlYCwgXCJOb25lXCIpO1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL3RyZW5kYCwgXCJOb25lXCIpO1xuXHRcdFx0XHRcdG9LUElNb2RlbC5zZXRQcm9wZXJ0eShgLyR7a3BpRGVmaW5pdGlvbi5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL3RhcmdldE51bWJlcmAsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vdGFyZ2V0VW5pdGAsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vZGV2aWF0aW9uTnVtYmVyYCwgdW5kZWZpbmVkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZURhdGFwb2ludFZhbHVlQW5kQ3VycmVuY3koa3BpRGVmaW5pdGlvbiwgYUNvbnRleHRzWzBdLCBvS1BJTW9kZWwpO1xuXHRcdFx0XHRcdHRoaXMudXBkYXRlRGF0YXBvaW50Q3JpdGljYWxpdHkoa3BpRGVmaW5pdGlvbiwgYUNvbnRleHRzWzBdLCBvS1BJTW9kZWwpO1xuXG5cdFx0XHRcdFx0aWYgKGxvYWRGdWxsKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnVwZGF0ZURhdGFwb2ludFRyZW5kKGtwaURlZmluaXRpb24sIGFDb250ZXh0c1swXSwgb0tQSU1vZGVsKTtcblx0XHRcdFx0XHRcdHRoaXMudXBkYXRlVGFyZ2V0VmFsdWUoa3BpRGVmaW5pdGlvbiwgYUNvbnRleHRzWzBdLCBvS1BJTW9kZWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGNhcmQgZGF0YSBmb3IgYSBLUEksIGFuZCBzdG9yZXMgaXQgaW4gdGhlIEpTT04gS1BJIG1vZGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0ga3BpRGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiBvZiB0aGUgS1BJLlxuXHQgKiBAcGFyYW0gb01haW5Nb2RlbCBUaGUgbW9kZWwgdXNlZCB0byBsb2FkIHRoZSBkYXRhLlxuXHQgKiBAcGFyYW0gb0tQSU1vZGVsIFRoZSBKU09OIG1vZGVsIHdoZXJlIHRoZSBkYXRhIHdpbGwgYmUgc3RvcmVkXG5cdCAqIEByZXR1cm5zIFRoZSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiBkYXRhIGlzIGxvYWRlZC5cblx0ICovXG5cdHByb3RlY3RlZCBsb2FkS1BJQ2FyZERhdGEoa3BpRGVmaW5pdGlvbjogS1BJRGVmaW5pdGlvbiwgb01haW5Nb2RlbDogT0RhdGFNb2RlbCwgb0tQSU1vZGVsOiBKU09OTW9kZWwpOiBhbnkge1xuXHRcdGNvbnN0IG9MaXN0QmluZGluZyA9IG9NYWluTW9kZWwuYmluZExpc3QoYC8ke2twaURlZmluaXRpb24uZW50aXR5U2V0fWAsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHtcblx0XHRcdCQkZ3JvdXBJZDogXCIkYXV0by5Xb3JrZXJzXCJcblx0XHR9KTtcblx0XHRjb25zdCBvR3JvdXA6IFJlY29yZDxzdHJpbmcsIE9iamVjdD4gPSB7fTtcblx0XHRjb25zdCBvQWdncmVnYXRlOiBSZWNvcmQ8c3RyaW5nLCBPYmplY3Q+ID0ge307XG5cblx0XHRrcGlEZWZpbml0aW9uLmNoYXJ0LmRpbWVuc2lvbnMuZm9yRWFjaCgoZGltZW5zaW9uKSA9PiB7XG5cdFx0XHRvR3JvdXBbZGltZW5zaW9uLm5hbWVdID0ge307XG5cdFx0fSk7XG5cdFx0a3BpRGVmaW5pdGlvbi5jaGFydC5tZWFzdXJlcy5mb3JFYWNoKChtZWFzdXJlKSA9PiB7XG5cdFx0XHRvQWdncmVnYXRlW21lYXN1cmUubmFtZV0gPSB7fTtcblx0XHR9KTtcblx0XHRvTGlzdEJpbmRpbmcuc2V0QWdncmVnYXRpb24oe1xuXHRcdFx0Z3JvdXA6IG9Hcm91cCxcblx0XHRcdGFnZ3JlZ2F0ZTogb0FnZ3JlZ2F0ZVxuXHRcdH0pO1xuXG5cdFx0Ly8gTWFuYWdlIFNlbGVjdGlvblZhcmlhbnQgZmlsdGVyc1xuXHRcdGlmIChrcGlEZWZpbml0aW9uLnNlbGVjdGlvblZhcmlhbnRGaWx0ZXJEZWZpbml0aW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBhRmlsdGVycyA9IGtwaURlZmluaXRpb24uc2VsZWN0aW9uVmFyaWFudEZpbHRlckRlZmluaXRpb25zLm1hcChjcmVhdGVGaWx0ZXJGcm9tRGVmaW5pdGlvbikuZmlsdGVyKChmaWx0ZXIpID0+IHtcblx0XHRcdFx0cmV0dXJuIGZpbHRlciAhPT0gdW5kZWZpbmVkO1xuXHRcdFx0fSkgYXMgRmlsdGVyW107XG5cdFx0XHRvTGlzdEJpbmRpbmcuZmlsdGVyKGFGaWx0ZXJzKTtcblx0XHR9XG5cblx0XHQvLyBTb3J0aW5nXG5cdFx0aWYgKGtwaURlZmluaXRpb24uY2hhcnQuc29ydE9yZGVyKSB7XG5cdFx0XHRvTGlzdEJpbmRpbmcuc29ydChcblx0XHRcdFx0a3BpRGVmaW5pdGlvbi5jaGFydC5zb3J0T3JkZXIubWFwKChzb3J0SW5mbykgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBuZXcgU29ydGVyKHNvcnRJbmZvLm5hbWUsIHNvcnRJbmZvLmRlc2NlbmRpbmcpO1xuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb0xpc3RCaW5kaW5nLnJlcXVlc3RDb250ZXh0cygwLCBrcGlEZWZpbml0aW9uLmNoYXJ0Lm1heEl0ZW1zKS50aGVuKChhQ29udGV4dHM6IENvbnRleHRbXSkgPT4ge1xuXHRcdFx0Y29uc3QgY2hhcnREYXRhID0gYUNvbnRleHRzLm1hcChmdW5jdGlvbiAob0NvbnRleHQpIHtcblx0XHRcdFx0Y29uc3Qgb0RhdGE6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblx0XHRcdFx0a3BpRGVmaW5pdGlvbi5jaGFydC5kaW1lbnNpb25zLmZvckVhY2goKGRpbWVuc2lvbikgPT4ge1xuXHRcdFx0XHRcdG9EYXRhW2RpbWVuc2lvbi5uYW1lXSA9IG9Db250ZXh0LmdldFByb3BlcnR5KGRpbWVuc2lvbi5uYW1lKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGtwaURlZmluaXRpb24uY2hhcnQubWVhc3VyZXMuZm9yRWFjaCgobWVhc3VyZSkgPT4ge1xuXHRcdFx0XHRcdG9EYXRhW21lYXN1cmUubmFtZV0gPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShtZWFzdXJlLm5hbWUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gb0RhdGE7XG5cdFx0XHR9KTtcblxuXHRcdFx0b0tQSU1vZGVsLnNldFByb3BlcnR5KGAvJHtrcGlEZWZpbml0aW9uLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vY2hhcnREYXRhYCwgY2hhcnREYXRhKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBwb3BvdmVyIHRvIGRpc3BsYXkgdGhlIEtQSSBjYXJkXG5cdCAqIFRoZSBwb3BvdmVyIGFuZCB0aGUgY29udGFpbmVkIGNhcmQgZm9yIHRoZSBLUElzIGFyZSBjcmVhdGVkIGlmIG5lY2Vzc2FyeS5cblx0ICogVGhlIHBvcG92ZXIgaXMgc2hhcmVkIGJldHdlZW4gYWxsIEtQSXMsIHNvIGl0J3MgY3JlYXRlZCBvbmx5IG9uY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBvS1BJVGFnIFRoZSB0YWcgdGhhdCB0cmlnZ2VyZWQgdGhlIHBvcG92ZXIgb3BlbmluZy5cblx0ICogQHJldHVybnMgVGhlIHNoYXJlZCBwb3BvdmVyIGFzIGEgcHJvbWlzZS5cblx0ICovXG5cdHByb3RlY3RlZCBnZXRQb3BvdmVyKG9LUElUYWc6IEdlbmVyaWNUYWcpOiBQcm9taXNlPFBvcG92ZXI+IHtcblx0XHRpZiAoIXRoaXMub1BvcG92ZXIpIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcdENvcmUubG9hZExpYnJhcnkoXCJzYXAvdWkvaW50ZWdyYXRpb25cIiwgeyBhc3luYzogdHJ1ZSB9KVxuXHRcdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdHNhcC51aS5yZXF1aXJlKFtcInNhcC91aS9pbnRlZ3JhdGlvbi93aWRnZXRzL0NhcmRcIiwgXCJzYXAvdWkvaW50ZWdyYXRpb24vSG9zdFwiXSwgKENhcmQ6IGFueSwgSG9zdDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9Ib3N0ID0gbmV3IEhvc3QoKTtcblxuXHRcdFx0XHRcdFx0XHRvSG9zdC5hdHRhY2hBY3Rpb24oKG9FdmVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc1R5cGUgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidHlwZVwiKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvUGFyYW1zID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInBhcmFtZXRlcnNcIik7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoc1R5cGUgPT09IFwiTmF2aWdhdGlvblwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob1BhcmFtcy5zZW1hbnRpY09iamVjdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUGFyYW1zLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9QYXJhbXMuYWN0aW9uXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZU91dGJvdW5kKG9QYXJhbXMub3V0Ym91bmQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0dGhpcy5vQ2FyZCA9IG5ldyBDYXJkKHtcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDogXCIyNXJlbVwiLFxuXHRcdFx0XHRcdFx0XHRcdGhlaWdodDogXCJhdXRvXCJcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdHRoaXMub0NhcmQuc2V0SG9zdChvSG9zdCk7XG5cblx0XHRcdFx0XHRcdFx0dGhpcy5vUG9wb3ZlciA9IG5ldyBQb3BvdmVyKFwia3BpLVBvcG92ZXJcIiwge1xuXHRcdFx0XHRcdFx0XHRcdHNob3dIZWFkZXI6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdHBsYWNlbWVudDogXCJBdXRvXCIsXG5cdFx0XHRcdFx0XHRcdFx0Y29udGVudDogW3RoaXMub0NhcmRdXG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdG9LUElUYWcuYWRkRGVwZW5kZW50KHRoaXMub1BvcG92ZXIpOyAvLyBUaGUgZmlyc3QgY2xpY2tlZCB0YWcgZ2V0cyB0aGUgcG9wb3ZlciBhcyBkZXBlbmRlbnRcblxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKHRoaXMub1BvcG92ZXIpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmVqZWN0KCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLm9Qb3BvdmVyKTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0cHVibGljIG9uS1BJUHJlc3NlZChvS1BJVGFnOiBhbnksIGtwaUlEOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zdCBvS1BJTW9kZWwgPSBvS1BJVGFnLmdldE1vZGVsKFwia3BpTW9kZWxcIikgYXMgSlNPTk1vZGVsO1xuXG5cdFx0aWYgKHRoaXMuYUtQSURlZmluaXRpb25zICYmIHRoaXMuYUtQSURlZmluaXRpb25zLmxlbmd0aCkge1xuXHRcdFx0Y29uc3Qga3BpRGVmaW5pdGlvbiA9IHRoaXMuYUtQSURlZmluaXRpb25zLmZpbmQoZnVuY3Rpb24gKG9EZWYpIHtcblx0XHRcdFx0cmV0dXJuIG9EZWYuaWQgPT09IGtwaUlEO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChrcGlEZWZpbml0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IG9Nb2RlbCA9IG9LUElUYWcuZ2V0TW9kZWwoKTtcblx0XHRcdFx0Y29uc3QgYVByb21pc2VzID0gW1xuXHRcdFx0XHRcdHRoaXMubG9hZEtQSVRhZ0RhdGEoa3BpRGVmaW5pdGlvbiwgb01vZGVsLCBvS1BJTW9kZWwsIHRydWUpLFxuXHRcdFx0XHRcdHRoaXMubG9hZEtQSUNhcmREYXRhKGtwaURlZmluaXRpb24sIG9Nb2RlbCwgb0tQSU1vZGVsKSxcblx0XHRcdFx0XHR0aGlzLmdldFBvcG92ZXIob0tQSVRhZylcblx0XHRcdFx0XTtcblxuXHRcdFx0XHRQcm9taXNlLmFsbChhUHJvbWlzZXMpXG5cdFx0XHRcdFx0LnRoZW4oKGFSZXN1bHRzKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLm9DYXJkLnNldE1hbmlmZXN0KG9LUElNb2RlbC5nZXRQcm9wZXJ0eShgLyR7a3BpSUR9L21hbmlmZXN0YCkpO1xuXHRcdFx0XHRcdFx0dGhpcy5vQ2FyZC5yZWZyZXNoKCk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IG9Qb3BvdmVyID0gYVJlc3VsdHNbMl07XG5cdFx0XHRcdFx0XHRvUG9wb3Zlci5vcGVuQnkob0tQSVRhZywgZmFsc2UpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihlcnIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBLUElNYW5hZ2VtZW50Q29udHJvbGxlckV4dGVuc2lvbjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0VBcUJBLE1BQU1BLDBCQUF1RCxHQUFHO0lBQy9ELEdBQUcs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