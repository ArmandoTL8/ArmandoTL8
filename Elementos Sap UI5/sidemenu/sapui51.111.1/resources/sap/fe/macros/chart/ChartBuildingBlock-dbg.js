/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/uid", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/helpers/Aggregation", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/CommonHelper", "sap/ui/model/json/JSONModel", "../internal/helpers/ActionHelper", "../internal/helpers/DefaultActionHandler", "../ODataMetaModelUtil", "./ChartHelper"], function (Log, uid, BuildingBlock, BuildingBlockRuntime, DataVisualization, Aggregation, MetaModelConverter, BindingToolkit, ModelHelper, StableIdHelper, DataModelPathHelper, CommonHelper, JSONModel, ActionHelper, DefaultActionHandler, ODataMetaModelUtil, ChartHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _class3;
  var _exports = {};
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var generate = StableIdHelper.generate;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getVisualizationsFromPresentationVariant = DataVisualization.getVisualizationsFromPresentationVariant;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var xml = BuildingBlockRuntime.xml;
  var escapeXMLAttributeValue = BuildingBlockRuntime.escapeXMLAttributeValue;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockEvent = BuildingBlock.blockEvent;
  var blockAttribute = BuildingBlock.blockAttribute;
  var blockAggregation = BuildingBlock.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const mMeasureRole = {
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1": "axis1",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2": "axis2",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3": "axis3",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis4": "axis4"
  };
  var personalizationValues;
  /**
   * Build actions and action groups with all properties for chart visualization.
   *
   * @param childAction XML node corresponding to actions
   * @returns Prepared action object
   */
  (function (personalizationValues) {
    personalizationValues["Sort"] = "Sort";
    personalizationValues["Type"] = "Type";
    personalizationValues["Item"] = "Item";
  })(personalizationValues || (personalizationValues = {}));
  const setCustomActionProperties = function (childAction) {
    var _action$getAttribute;
    let menuContentActions = null;
    const action = childAction;
    let menuActions = [];
    const actionKey = (_action$getAttribute = action.getAttribute("key")) === null || _action$getAttribute === void 0 ? void 0 : _action$getAttribute.replace("InlineXML_", "");
    if (action.children.length && action.localName === "ActionGroup" && action.namespaceURI === "sap.fe.macros") {
      const actionsToAdd = Array.prototype.slice.apply(action.children);
      let actionIdx = 0;
      menuContentActions = actionsToAdd.reduce((customAction, actToAdd) => {
        var _actToAdd$getAttribut;
        const actionKeyAdd = ((_actToAdd$getAttribut = actToAdd.getAttribute("key")) === null || _actToAdd$getAttribut === void 0 ? void 0 : _actToAdd$getAttribut.replace("InlineXML_", "")) || actionKey + "_Menu_" + actionIdx;
        const curOutObject = {
          key: actionKeyAdd,
          text: actToAdd.getAttribute("text"),
          __noWrap: true,
          press: actToAdd.getAttribute("press"),
          requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
          enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled") === true
        };
        customAction[curOutObject.key] = curOutObject;
        actionIdx++;
        return customAction;
      }, {});
      menuActions = Object.values(menuContentActions).slice(-action.children.length).map(function (menuItem) {
        return menuItem.key;
      });
    }
    return {
      key: actionKey,
      text: action.getAttribute("text"),
      position: {
        placement: action.getAttribute("placement"),
        anchor: action.getAttribute("anchor")
      },
      __noWrap: true,
      press: action.getAttribute("press"),
      requiresSelection: action.getAttribute("requiresSelection") === "true",
      enabled: action.getAttribute("enabled") === null ? true : action.getAttribute("enabled"),
      menu: menuActions.length ? menuActions : null,
      menuContentActions: menuContentActions
    };
  };
  let ChartBuildingBlock = (_dec = defineBuildingBlock({
    name: "Chart",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "string",
    defaultValue: "100%"
  }), _dec7 = blockAttribute({
    type: "string",
    defaultValue: "100%"
  }), _dec8 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec10 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    defaultValue: "Auto",
    isPublic: true
  }), _dec11 = blockAttribute({
    type: "string",
    defaultValue: "MULTIPLE",
    isPublic: true
  }), _dec12 = blockAttribute({
    type: "string|boolean",
    isPublic: true
  }), _dec13 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "string"
  }), _dec16 = blockAttribute({
    type: "string"
  }), _dec17 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec18 = blockAttribute({
    type: "boolean"
  }), _dec19 = blockAttribute({
    type: "boolean"
  }), _dec20 = blockAttribute({
    type: "string"
  }), _dec21 = blockAttribute({
    type: "string"
  }), _dec22 = blockAttribute({
    type: "string"
  }), _dec23 = blockAttribute({
    type: "string"
  }), _dec24 = blockAttribute({
    type: "boolean",
    defaultValue: false
  }), _dec25 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec26 = blockEvent(), _dec27 = blockEvent(), _dec28 = blockAggregation({
    type: "sap.fe.macros.internal.chart.Action | sap.fe.macros.internal.chart.ActionGroup",
    isPublic: true,
    processAggregations: setCustomActionProperties
  }), _dec29 = blockEvent(), _dec30 = blockEvent(), _dec31 = blockEvent(), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ChartBuildingBlock, _BuildingBlockBase);
    /**
     * ID of the chart
     */

    /**
     * Metadata path to the presentation (UI.Chart w or w/o qualifier)
     */

    /**
     * Metadata path to the entitySet or navigationProperty
     */

    /**
     * The height of the chart
     */

    /**
     * The width of the chart
     */

    /**
     * Specifies the header text that is shown in the chart
     */

    /**
     * Specifies the visibility of the chart header
     */

    /**
     * Defines the "aria-level" of the chart header
     */

    /**
     * Specifies the selection mode
     */

    /**
     * Parameter which sets the personalization of the chart
     */

    /**
     * Parameter which sets the ID of the filterbar associating it to the chart
     */

    /**
     * 	Parameter which sets the noDataText for the chart
     */

    /**
     * Parameter which sets the chart delegate for the chart
     */

    /**
     * Parameter which sets the visualization properties for the chart
     */

    /**
     * The actions to be shown in the action area of the chart
     */

    /**
     * The XML and manifest actions to be shown in the action area of the chart
     */

    /**
     * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and
     * the Boolean flag that indicates whether data is selected or deselected
     */

    /**
     * Event handler to react to the stateChange event of the chart.
     */

    function ChartBuildingBlock(_oProps, configuration, _mSettings) {
      var _this$chartDefinition, _this$chartDefinition4, _this$chartDefinition5, _this$chartDefinition6, _this$chartDefinition7;
      var _this;
      _this = _BuildingBlockBase.call(this, _oProps, configuration, _mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartDefinition", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "height", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerLevel", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "noDataText", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartDelegate", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vizProperties", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartActions", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "draftSupported", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "autoBindOnInit", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPath", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filter", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measures", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_applyIdToContent", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSelected", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSaved", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onSegmentedButtonPressed", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor29, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor30, _assertThisInitialized(_this));
      _this._commandActions = [];
      _this.createChartDefinition = (oProps, oConverterContext, oContextObjectPath) => {
        var _oProps$metaPath;
        let sVisualizationPath = getContextRelativeTargetObjectPath(oContextObjectPath);
        if (((_oProps$metaPath = oProps.metaPath) === null || _oProps$metaPath === void 0 ? void 0 : _oProps$metaPath.getObject().$Type) === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
          const aVisualizations = oProps.metaPath.getObject().Visualizations;
          sVisualizationPath = ChartBuildingBlock.checkChartVisualizationPath(aVisualizations, sVisualizationPath);
        }
        const oVisualizationDefinition = getDataVisualizationConfiguration(sVisualizationPath, oProps.useCondensedLayout, oConverterContext);
        oProps.chartDefinition = oVisualizationDefinition.visualizations[0];
        _this.chartDefinition = oVisualizationDefinition.visualizations[0];
        return _this.chartDefinition;
      };
      _this.createBindingContext = function (oData, mSettings) {
        const sContextPath = `/${uid()}`;
        mSettings.models.converterContext.setProperty(sContextPath, oData);
        return mSettings.models.converterContext.createBindingContext(sContextPath);
      };
      _this.getChartMeasures = (oProps, aggregationHelper) => {
        const aChartAnnotationPath = oProps.chartDefinition.annotationPath.split("/");
        // this is required because getAbsolutePath in converterContext returns "/SalesOrderManage/_Item/_Item/@com.sap.vocabularies.v1.Chart" as annotationPath
        const sChartAnnotationPath = aChartAnnotationPath.filter(function (item, pos) {
          return aChartAnnotationPath.indexOf(item) == pos;
        }).toString().replaceAll(",", "/");
        const oChart = getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(sChartAnnotationPath), _this.contextPath).targetObject;
        const chartContext = ChartHelper.getUiChart(_this.metaPath);
        const chart = chartContext.getObject();
        const aAggregatedProperty = aggregationHelper.getAggregatedProperties("AggregatedProperty");
        let aMeasures = [];
        const sAnnoPath = oProps.metaPath.getPath();
        const aAggregatedProperties = aggregationHelper.getAggregatedProperties("AggregatedProperties");
        const aChartMeasures = oChart.Measures ? oChart.Measures : [];
        const aChartDynamicMeasures = oChart.DynamicMeasures ? oChart.DynamicMeasures : [];
        //check if there are measures pointing to aggregatedproperties
        const aTransAggInMeasures = aAggregatedProperties[0] ? aAggregatedProperties[0].filter(function (oAggregatedProperties) {
          return aChartMeasures.some(function (oMeasure) {
            return oAggregatedProperties.Name === oMeasure.value;
          });
        }) : undefined;
        const sEntitySetPath = sAnnoPath.replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant|SelectionPresentationVariant).*/, "");
        const oTransAggregations = oProps.chartDefinition.transAgg;
        const oCustomAggregations = oProps.chartDefinition.customAgg;
        // intimate the user if there is Aggregatedproperty configured with no DYnamicMeasures, bu there are measures with AggregatedProperties
        if (aAggregatedProperty.length > 0 && !aChartDynamicMeasures && aTransAggInMeasures.length > 0) {
          Log.warning("The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly.");
        }
        const bIsCustomAggregateIsMeasure = aChartMeasures.some(oChartMeasure => {
          const oCustomAggMeasure = _this.getCustomAggMeasure(oCustomAggregations, oChartMeasure);
          return !!oCustomAggMeasure;
        });
        if (aAggregatedProperty.length > 0 && !aChartDynamicMeasures.length && !bIsCustomAggregateIsMeasure) {
          throw new Error("Please configure DynamicMeasures for the chart");
        }
        if (aAggregatedProperty.length > 0) {
          for (const dynamicMeasure of aChartDynamicMeasures) {
            aMeasures = _this.getDynamicMeasures(aMeasures, dynamicMeasure, sEntitySetPath, oChart);
          }
        }
        for (const chartMeasure of aChartMeasures) {
          const sKey = chartMeasure.value;
          const oCustomAggMeasure = _this.getCustomAggMeasure(oCustomAggregations, chartMeasure);
          const oMeasure = {};
          if (oCustomAggMeasure) {
            aMeasures = _this.setCustomAggMeasure(aMeasures, oMeasure, oCustomAggMeasure, sKey);
            //if there is neither aggregatedProperty nor measures pointing to customAggregates, but we have normal measures. Now check if these measures are part of AggregatedProperties Obj
          } else if (aAggregatedProperty.length === 0 && oTransAggregations[sKey]) {
            aMeasures = _this.setTransAggMeasure(aMeasures, oMeasure, oTransAggregations, sKey);
          }
          _this.setChartMeasureAttributes(chart.MeasureAttributes, sEntitySetPath, oMeasure);
        }
        const oMeasuresModel = new JSONModel(aMeasures);
        oMeasuresModel.$$valueAsPromise = true;
        return oMeasuresModel.createBindingContext("/");
      };
      _this.setCustomAggMeasure = (aMeasures, oMeasure, oCustomAggMeasure, sKey) => {
        if (sKey.indexOf("/") > -1) {
          Log.error("$expand is not yet supported. Measure: ${sKey} from an association cannot be used");
        }
        oMeasure.key = oCustomAggMeasure.value;
        oMeasure.role = "axis1";
        oMeasure.propertyPath = oCustomAggMeasure.value;
        aMeasures.push(oMeasure);
        return aMeasures;
      };
      _this.setTransAggMeasure = (aMeasures, oMeasure, oTransAggregations, sKey) => {
        const oTransAggMeasure = oTransAggregations[sKey];
        oMeasure.key = oTransAggMeasure.name;
        oMeasure.role = "axis1";
        oMeasure.propertyPath = sKey;
        oMeasure.aggregationMethod = oTransAggMeasure.aggregationMethod;
        oMeasure.label = oTransAggMeasure.label || oMeasure.label;
        aMeasures.push(oMeasure);
        return aMeasures;
      };
      _this.getDynamicMeasures = (aMeasures, dynamicMeasure, sEntitySetPath, oChart) => {
        var _dynamicMeasure$value;
        const sKey = dynamicMeasure.value || "";
        const oAggregatedProperty = getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(sEntitySetPath + sKey), _this.contextPath).targetObject;
        if (sKey.indexOf("/") > -1) {
          Log.error("$expand is not yet supported. Measure: ${sKey} from an association cannot be used");
          // check if the annotation path is wrong
        } else if (!oAggregatedProperty) {
          throw new Error("Please provide the right AnnotationPath to the Dynamic Measure " + dynamicMeasure.value);
          // check if the path starts with @
        } else if (((_dynamicMeasure$value = dynamicMeasure.value) === null || _dynamicMeasure$value === void 0 ? void 0 : _dynamicMeasure$value.startsWith("@com.sap.vocabularies.Analytics.v1.AggregatedProperty")) === null) {
          throw new Error("Please provide the right AnnotationPath to the Dynamic Measure " + dynamicMeasure.value);
        } else {
          // check if AggregatedProperty is defined in given DynamicMeasure
          const oDynamicMeasure = {
            key: oAggregatedProperty.Name,
            role: "axis1"
          };
          oDynamicMeasure.propertyPath = oAggregatedProperty.AggregatableProperty.value;
          oDynamicMeasure.aggregationMethod = oAggregatedProperty.AggregationMethod;
          oDynamicMeasure.label = resolveBindingString(oAggregatedProperty.annotations._annotations["com.sap.vocabularies.Common.v1.Label"] || getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(sEntitySetPath + oDynamicMeasure.propertyPath + "@com.sap.vocabularies.Common.v1.Label"), _this.contextPath).targetObject);
          _this.setChartMeasureAttributes(oChart.MeasureAttributes, sEntitySetPath, oDynamicMeasure);
          aMeasures.push(oDynamicMeasure);
        }
        return aMeasures;
      };
      _this.getCustomAggMeasure = (oCustomAggregations, oMeasure) => {
        if (oMeasure.value && oCustomAggregations[oMeasure.value]) {
          return oMeasure;
        }
        return null;
      };
      _this.setChartMeasureAttributes = (aMeasureAttributes, sEntitySetPath, oMeasure) => {
        if (aMeasureAttributes !== null && aMeasureAttributes !== void 0 && aMeasureAttributes.length) {
          for (const measureAttribute of aMeasureAttributes) {
            _this._setChartMeasureAttribute(measureAttribute, sEntitySetPath, oMeasure);
          }
        }
      };
      _this._setChartMeasureAttribute = (measureAttribute, sEntitySetPath, oMeasure) => {
        var _measureAttribute$Dyn, _measureAttribute$Mea, _measureAttribute$Dat;
        const sPath = measureAttribute.DynamicMeasure ? measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Dyn = measureAttribute.DynamicMeasure) === null || _measureAttribute$Dyn === void 0 ? void 0 : _measureAttribute$Dyn.value : measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Mea = measureAttribute.Measure) === null || _measureAttribute$Mea === void 0 ? void 0 : _measureAttribute$Mea.value;
        const dataPoint = measureAttribute.DataPoint ? measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Dat = measureAttribute.DataPoint) === null || _measureAttribute$Dat === void 0 ? void 0 : _measureAttribute$Dat.value : null;
        const role = measureAttribute.Role;
        const oDataPoint = dataPoint && getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(sEntitySetPath + dataPoint), _this.contextPath).targetObject;
        if (oMeasure.key === sPath) {
          _this.setMeasureRole(oMeasure, role);
          //still to add data point, but UI5 Chart API is missing
          _this.setMeasureDataPoint(oMeasure, oDataPoint);
        }
      };
      _this.setMeasureDataPoint = (oMeasure, oDataPoint) => {
        if (oDataPoint && oDataPoint.Value.$Path == oMeasure.key) {
          oMeasure.dataPoint = _this.formatJSONToString(ODataMetaModelUtil.createDataPointProperty(oDataPoint)) || "";
        }
      };
      _this.setMeasureRole = (oMeasure, role) => {
        if (role) {
          const index = role.$EnumMember;
          oMeasure.role = mMeasureRole[index];
        }
      };
      _this.formatJSONToString = oCrit => {
        if (!oCrit) {
          return undefined;
        }
        let sCriticality = JSON.stringify(oCrit);
        sCriticality = sCriticality.replace(new RegExp("{", "g"), "\\{");
        sCriticality = sCriticality.replace(new RegExp("}", "g"), "\\}");
        return sCriticality;
      };
      _this.getDependents = chartContext => {
        if (_this._commandActions.length > 0) {
          return _this._commandActions.map(commandAction => {
            return _this.getActionCommand(commandAction, chartContext);
          });
        }
        return xml``;
      };
      _this.checkPersonalizationInChartProperties = oProps => {
        if (oProps.personalization) {
          if (oProps.personalization === "false") {
            _this.personalization = undefined;
          } else if (oProps.personalization === "true") {
            _this.personalization = Object.values(personalizationValues).join(",");
          } else if (_this.verifyValidPersonlization(oProps.personalization) === true) {
            _this.personalization = oProps.personalization;
          } else {
            _this.personalization = undefined;
          }
        }
      };
      _this.verifyValidPersonlization = personalization => {
        let valid = true;
        const splitArray = personalization.split(",");
        const acceptedValues = Object.values(personalizationValues);
        splitArray.forEach(arrayElement => {
          if (!acceptedValues.includes(arrayElement)) {
            valid = false;
          }
        });
        return valid;
      };
      _this.getVariantManagement = (oProps, oChartDefinition) => {
        let variantManagement = oProps.variantManagement ? oProps.variantManagement : oChartDefinition.variantManagement;
        variantManagement = _this.personalization === undefined ? "None" : variantManagement;
        return variantManagement;
      };
      _this.createVariantManagement = () => {
        const personalization = _this.personalization;
        if (personalization) {
          const variantManagement = _this.variantManagement;
          if (variantManagement === "Control") {
            return xml`
					<mdc:variant>
					<variant:VariantManagement
						id="${generate([_this.id, "VM"])}"
						for="${_this.id}"
						showSetAsDefault="${true}"
						select="${_this.variantSelected}"
						headerLevel="${_this.headerLevel}"
						save="${_this.variantSaved}"
					/>
					</mdc:variant>
			`;
          } else if (variantManagement === "None" || variantManagement === "Page") {
            return xml``;
          }
        } else if (!personalization) {
          Log.warning("Variant Management cannot be enabled when personalization is disabled");
        }
        return xml``;
      };
      _this.getPersistenceProvider = () => {
        if (_this.variantManagement === "None") {
          return xml`<p13n:PersistenceProvider id="${generate([_this.id, "PersistenceProvider"])}" for="${_this.id}"/>`;
        }
        return xml``;
      };
      _this.pushActionCommand = (actionContext, dataField, chartOperationAvailableMap, action) => {
        if (dataField) {
          const commandAction = {
            actionContext: actionContext,
            onExecuteAction: ChartHelper.getPressEventForDataFieldForActionButton(_this.id, dataField, chartOperationAvailableMap || ""),
            onExecuteIBN: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false),
            onExecuteManifest: CommonHelper.buildActionWrapper(action, _assertThisInitialized(_this))
          };
          _this._commandActions.push(commandAction);
        }
      };
      _this.getActionCommand = (commandAction, chartContext) => {
        const oAction = commandAction.actionContext;
        const action = oAction.getObject();
        const dataFieldContext = action.annotationPath && _this.contextPath.getModel().createBindingContext(action.annotationPath);
        const dataField = dataFieldContext && dataFieldContext.getObject();
        const dataFieldAction = _this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action");
        const actionContext = CommonHelper.getActionContext(dataFieldAction);
        const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
        const isBound = _this.contextPath.getModel().createBindingContext(isBoundPath).getObject();
        const chartOperationAvailableMap = escapeXMLAttributeValue(ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
          context: chartContext
        }));
        const isActionEnabled = action.enabled ? action.enabled : ChartHelper.isDataFieldForActionButtonEnabled(isBound && isBound.$IsBound, dataField.Action, _this.contextPath, chartOperationAvailableMap || "", action.enableOnSelect || "");
        let isIBNEnabled;
        if (action.enabled) {
          isIBNEnabled = action.enabled;
        } else if (dataField.RequiresContext) {
          isIBNEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
        }
        const actionCommand = xml`<internalMacro:ActionCommand
		action="${action}"
		onExecuteAction="${commandAction.onExecuteAction}"
		onExecuteIBN="${commandAction.onExecuteIBN}"
		onExecuteManifest="${commandAction.onExecuteManifest}"
		isIBNEnabled="${isIBNEnabled}"
		isActionEnabled="${isActionEnabled}"
		visible="${_this.getVisible(dataFieldContext)}"
	/>`;
        if (action.type == "ForAction" && (!isBound || isBound.IsBound !== true || actionContext["@Org.OData.Core.V1.OperationAvailable"] !== false)) {
          return actionCommand;
        } else if (action.type == "ForAction") {
          return xml``;
        } else {
          return actionCommand;
        }
      };
      _this.getItems = chartContext => {
        const chart = chartContext.getObject();
        const dimensions = [];
        const measures = [];
        if (chart.Dimensions) {
          ChartHelper.formatDimensions(chartContext).getObject().forEach(dimension => {
            dimension.id = generate([_this.id, "dimension", dimension.key]);
            dimensions.push(_this.getItem({
              id: dimension.id,
              key: dimension.key,
              label: dimension.label,
              role: dimension.role
            }, "_fe_groupable_", "groupable"));
          });
        }
        if (_this.measures) {
          ChartHelper.formatMeasures(_this.measures).forEach(measure => {
            measure.id = generate([_this.id, "measure", measure.key]);
            measures.push(_this.getItem({
              id: measure.id,
              key: measure.key,
              label: measure.label,
              role: measure.role
            }, "_fe_aggregatable_", "aggregatable"));
          });
        }
        if (dimensions.length && measures.length) {
          return dimensions.concat(measures);
        }
        return xml``;
      };
      _this.getItem = (item, prefix, type) => {
        return xml`<chart:Item
			id="${item.id}"
			name="${prefix + item.key}"
			type="${type}"
			label="${resolveBindingString(item.label, "string")}"
			role="${item.role}"
		/>`;
      };
      _this.getToolbarActions = chartContext => {
        const aActions = _this.getActions(chartContext);
        if (_this.onSegmentedButtonPressed) {
          aActions.push(_this.getSegmentedButton());
        }
        if (aActions.length > 0) {
          return xml`<mdc:actions>${aActions}</mdc:actions>`;
        }
        return xml``;
      };
      _this.getActions = chartContext => {
        var _this$chartActions;
        let actions = (_this$chartActions = _this.chartActions) === null || _this$chartActions === void 0 ? void 0 : _this$chartActions.getObject();
        actions = _this.removeMenuItems(actions);
        return actions.map(action => {
          if (action.annotationPath) {
            // Load annotation based actions
            return _this.getAction(action, chartContext, false);
          } else if (action.hasOwnProperty("noWrap")) {
            // Load XML or manifest based actions / action groups
            return _this.getCustomActions(action, chartContext);
          }
        });
      };
      _this.removeMenuItems = actions => {
        // If action is already part of menu in action group, then it will
        // be removed from the main actions list
        for (const action of actions) {
          if (action.menu) {
            action.menu.forEach(item => {
              if (actions.indexOf(item) !== -1) {
                actions.splice(actions.indexOf(item), 1);
              }
            });
          }
        }
        return actions;
      };
      _this.getCustomActions = (action, chartContext) => {
        let actionEnabled = action.enabled;
        if ((action.requiresSelection ?? false) && action.enabled === "true") {
          actionEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
        }
        if (action.type === "Default") {
          // Load XML or manifest based toolbar actions
          return _this.getActionToolbarAction(action, {
            id: generate([_this.id, action.id]),
            unittestid: "DataFieldForActionButtonAction",
            label: action.text ? action.text : "",
            ariaHasPopup: undefined,
            press: action.press ? action.press : "",
            enabled: actionEnabled,
            visible: action.visible ? action.visible : false
          }, false);
        } else if (action.type === "Menu") {
          // Load action groups (Menu)
          return _this.getActionToolbarMenuAction({
            id: generate([_this.id, action.id]),
            text: action.text,
            visible: action.visible,
            enabled: actionEnabled,
            useDefaultActionOnly: DefaultActionHandler.getUseDefaultActionOnly(action),
            buttonMode: DefaultActionHandler.getButtonMode(action),
            defaultAction: undefined,
            actions: action
          }, chartContext);
        }
      };
      _this.getMenuItemFromMenu = (menuItemAction, chartContext) => {
        let pressHandler;
        if (menuItemAction.annotationPath) {
          //Annotation based action is passed as menu item for menu button
          return _this.getAction(menuItemAction, chartContext, true);
        }
        if (menuItemAction.command) {
          pressHandler = "cmd:" + menuItemAction.command;
        } else if (menuItemAction.noWrap ?? false) {
          pressHandler = menuItemAction.press;
        } else {
          pressHandler = CommonHelper.buildActionWrapper(menuItemAction, _assertThisInitialized(_this));
        }
        return xml`<MenuItem
		core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
		text="${menuItemAction.text}"
		press="${pressHandler}"
		visible="${menuItemAction.visible}"
		enabled="${menuItemAction.enabled}"
	/>`;
      };
      _this.getActionToolbarMenuAction = (props, chartContext) => {
        var _props$actions, _props$actions$menu;
        const aMenuItems = (_props$actions = props.actions) === null || _props$actions === void 0 ? void 0 : (_props$actions$menu = _props$actions.menu) === null || _props$actions$menu === void 0 ? void 0 : _props$actions$menu.map(action => {
          return _this.getMenuItemFromMenu(action, chartContext);
        });
        return xml`<mdcat:ActionToolbarAction>
			<MenuButton
			text="${props.text}"
			type="Transparent"
			menuPosition="BeginBottom"
			id="${props.id}"
			visible="${props.visible}"
			enabled="${props.enabled}"
			useDefaultActionOnly="${props.useDefaultActionOnly}"
			buttonMode="${props.buttonMode}"
			defaultAction="${props.defaultAction}"
			>
				<menu>
					<Menu>
						${aMenuItems}
					</Menu>
				</menu>
			</MenuButton>
		</mdcat:ActionToolbarAction>`;
      };
      _this.getAction = (action, chartContext, isMenuItem) => {
        const dataFieldContext = _this.contextPath.getModel().createBindingContext(action.annotationPath || "");
        if (action.type === "ForNavigation") {
          return _this.getNavigationActions(action, dataFieldContext, isMenuItem);
        } else if (action.type === "ForAction") {
          return _this.getAnnotationActions(chartContext, action, dataFieldContext, isMenuItem);
        }
        return xml``;
      };
      _this.getNavigationActions = (action, dataFieldContext, isMenuItem) => {
        let bEnabled = "true";
        const dataField = dataFieldContext.getObject();
        if (action.enabled !== undefined) {
          bEnabled = action.enabled;
        } else if (dataField.RequiresContext) {
          bEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
        }
        return _this.getActionToolbarAction(action, {
          id: undefined,
          unittestid: "DataFieldForIntentBasedNavigationButtonAction",
          label: dataField.Label,
          ariaHasPopup: undefined,
          press: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false),
          enabled: bEnabled,
          visible: _this.getVisible(dataFieldContext)
        }, isMenuItem);
      };
      _this.getAnnotationActions = (chartContext, action, dataFieldContext, isMenuItem) => {
        const dataFieldAction = _this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action");
        const actionContext = _this.contextPath.getModel().createBindingContext(CommonHelper.getActionContext(dataFieldAction));
        const actionObject = actionContext.getObject();
        const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
        const isBound = _this.contextPath.getModel().createBindingContext(isBoundPath).getObject();
        const dataField = dataFieldContext.getObject();
        if (!isBound || isBound.$IsBound !== true || actionObject["@Org.OData.Core.V1.OperationAvailable"] !== false) {
          const bEnabled = _this.getAnnotationActionsEnabled(action, isBound, dataField, chartContext);
          const ariaHasPopup = CommonHelper.isDialog(actionObject, {
            context: actionContext
          });
          const chartOperationAvailableMap = escapeXMLAttributeValue(ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
            context: chartContext
          })) || "";
          return _this.getActionToolbarAction(action, {
            id: generate([_this.id, getInvolvedDataModelObjects(dataFieldContext)]),
            unittestid: "DataFieldForActionButtonAction",
            label: dataField.Label,
            ariaHasPopup: ariaHasPopup,
            press: ChartHelper.getPressEventForDataFieldForActionButton(_this.id, dataField, chartOperationAvailableMap),
            enabled: bEnabled,
            visible: _this.getVisible(dataFieldContext)
          }, isMenuItem);
        }
        return xml``;
      };
      _this.getActionToolbarAction = (action, toolbarAction, isMenuItem) => {
        if (isMenuItem) {
          return xml`
			<MenuItem
				text="${toolbarAction.label}"
				press="${action.command ? "cmd:" + action.command : toolbarAction.press}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>`;
        } else {
          return _this.buildAction(action, toolbarAction);
        }
      };
      _this.buildAction = (action, toolbarAction) => {
        let actionPress = "";
        if (action.hasOwnProperty("noWrap")) {
          if (action.command) {
            actionPress = "cmd:" + action.command;
          } else if (action.noWrap === true) {
            actionPress = toolbarAction.press;
          } else if (!action.annotationPath) {
            actionPress = CommonHelper.buildActionWrapper(action, _assertThisInitialized(_this));
          }
          return xml`<mdcat:ActionToolbarAction>
			<Button
				core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
				unittest:id="${toolbarAction.unittestid}"
				id="${toolbarAction.id}"
				text="${toolbarAction.label}"
				ariaHasPopup="${toolbarAction.ariaHasPopup}"
				press="${actionPress}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>
		   </mdcat:ActionToolbarAction>`;
        } else {
          return xml`<mdcat:ActionToolbarAction>
			<Button
				unittest:id="${toolbarAction.unittestid}"
				id="${toolbarAction.id}"
				text="${toolbarAction.label}"
				ariaHasPopup="${toolbarAction.ariaHasPopup}"
				press="${action.command ? "cmd:" + action.command : toolbarAction.press}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>
		</mdcat:ActionToolbarAction>`;
        }
      };
      _this.getAnnotationActionsEnabled = (action, isBound, dataField, chartContext) => {
        return action.enabled !== undefined ? action.enabled : ChartHelper.isDataFieldForActionButtonEnabled(isBound && isBound.$IsBound, dataField.Action, _this.contextPath, ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
          context: chartContext
        }), action.enableOnSelect || "");
      };
      _this.getSegmentedButton = () => {
        return xml`<mdcat:ActionToolbarAction layoutInformation="{
			aggregationName: 'end',
			alignment: 'End'
		}">
			<SegmentedButton
				id="${generate([_this.id, "SegmentedButton", "TemplateContentView"])}"
				select="${_this.onSegmentedButtonPressed}"
				visible="{= \${pageInternal>alpContentView} !== 'Table' }"
				selectedKey="{pageInternal>alpContentView}"
			>
				<items>
					${_this.getSegmentedButtonItems()}
				</items>
			</SegmentedButton>
		</mdcat:ActionToolbarAction>`;
      };
      _this.getSegmentedButtonItems = () => {
        const sSegmentedButtonItems = [];
        if (CommonHelper.isDesktop()) {
          sSegmentedButtonItems.push(_this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_HYBRID_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Hybrid", "sap-icon://chart-table-view"));
        }
        sSegmentedButtonItems.push(_this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_CHART_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Chart", "sap-icon://bar-chart"));
        sSegmentedButtonItems.push(_this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_TABLE_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Table", "sap-icon://table-view"));
        return sSegmentedButtonItems;
      };
      _this.getSegmentedButtonItem = (tooltip, key, icon) => {
        return xml`<SegmentedButtonItem
			tooltip="${tooltip}"
			key="${key}"
			icon="${icon}"
		/>`;
      };
      _this.getVisible = dataFieldContext => {
        const dataField = dataFieldContext.getObject();
        if (dataField["@com.sap.vocabularies.UI.v1.Hidden"] && dataField["@com.sap.vocabularies.UI.v1.Hidden"].$Path) {
          const hiddenPathContext = _this.contextPath.getModel().createBindingContext(dataFieldContext.getPath() + "/@com.sap.vocabularies.UI.v1.Hidden/$Path", dataField["@com.sap.vocabularies.UI.v1.Hidden"].$Path);
          return ChartHelper.getHiddenPathExpressionForTableActionsAndIBN(dataField["@com.sap.vocabularies.UI.v1.Hidden"].$Path, {
            context: hiddenPathContext
          });
        } else if (dataField["@com.sap.vocabularies.UI.v1.Hidden"]) {
          return !dataField["@com.sap.vocabularies.UI.v1.Hidden"];
        } else {
          return true;
        }
      };
      _this.getContextPath = () => {
        return _this.contextPath.getPath().lastIndexOf("/") === _this.contextPath.getPath().length - 1 ? _this.contextPath.getPath().replaceAll("/", "") : _this.contextPath.getPath().split("/")[_this.contextPath.getPath().split("/").length - 1];
      };
      const _oContextObjectPath = getInvolvedDataModelObjects(_oProps.metaPath, _oProps.contextPath);
      const initialConverterContext = _this.getConverterContext(_oContextObjectPath, /*oProps.contextPath*/undefined, _mSettings);
      const visualizationPath = ChartBuildingBlock.getVisualizationPath(_oProps, _oContextObjectPath, initialConverterContext);
      const extraParams = ChartBuildingBlock.getExtraParams(_oProps, visualizationPath);
      const _oConverterContext = _this.getConverterContext(_oContextObjectPath, /*oProps.contextPath*/undefined, _mSettings, extraParams);
      const _aggregationHelper = new AggregationHelper(_oConverterContext.getEntityType(), _oConverterContext);
      const _oChartDefinition = _oProps.chartDefinition === undefined || _oProps.chartDefinition === null ? _this.createChartDefinition(_oProps, _oConverterContext, _oContextObjectPath) : _oProps.chartDefinition;
      // API Properties
      _this.navigationPath = _oChartDefinition.navigationPath;
      _this.autoBindOnInit = _oChartDefinition.autoBindOnInit;
      _this.vizProperties = _oChartDefinition.vizProperties;
      _this.chartActions = _this.createBindingContext(_oChartDefinition.actions, _mSettings);
      _this.selectionMode = _oProps.selectionMode.toUpperCase();
      if (_oProps.filterBar) {
        _this.filter = _this.getContentId(_oProps.filterBar);
      } else if (!_oProps.filter) {
        _this.filter = _oChartDefinition.filterId;
      }
      _this.onSegmentedButtonPressed = _oChartDefinition.onSegmentedButtonPressed;
      _this.checkPersonalizationInChartProperties(_oProps);
      _this.variantManagement = _this.getVariantManagement(_oProps, _oChartDefinition);
      _this.visible = _oChartDefinition.visible;
      let _sContextPath = _oProps.contextPath.getPath();
      _sContextPath = _sContextPath[_sContextPath.length - 1] === "/" ? _sContextPath.slice(0, -1) : _sContextPath;
      _this.draftSupported = ModelHelper.isDraftSupported(_mSettings.models.metaModel, _sContextPath);
      if (_oProps._applyIdToContent ?? false) {
        _this._apiId = _oProps.id + "::Chart";
        _this._contentId = _oProps.id;
      } else {
        _this._apiId = _oProps.id;
        _this._contentId = _this.getContentId(_oProps.id);
      }
      const _chartContext = ChartHelper.getUiChart(_this.metaPath);
      const _chart = _chartContext.getObject();
      _this._chartType = ChartHelper.formatChartType(_chart.ChartType);
      const operationAvailableMap = ChartHelper.getOperationAvailableMap(_chartContext.getObject(), {
        context: _chartContext
      });
      if (Object.keys((_this$chartDefinition = _this.chartDefinition) === null || _this$chartDefinition === void 0 ? void 0 : _this$chartDefinition.commandActions).length > 0) {
        var _this$chartDefinition2;
        Object.keys((_this$chartDefinition2 = _this.chartDefinition) === null || _this$chartDefinition2 === void 0 ? void 0 : _this$chartDefinition2.commandActions).forEach(sKey => {
          var _this$chartDefinition3;
          const action = (_this$chartDefinition3 = _this.chartDefinition) === null || _this$chartDefinition3 === void 0 ? void 0 : _this$chartDefinition3.commandActions[sKey];
          const actionContext = _this.createBindingContext(action, _mSettings);
          const dataFieldContext = action.annotationPath && _this.contextPath.getModel().createBindingContext(action.annotationPath);
          const dataField = dataFieldContext && dataFieldContext.getObject();
          const chartOperationAvailableMap = escapeXMLAttributeValue(operationAvailableMap);
          _this.pushActionCommand(actionContext, dataField, chartOperationAvailableMap, action);
        });
      }
      _this.measures = _this.getChartMeasures(_oProps, _aggregationHelper);
      const presentationPath = CommonHelper.createPresentationPathContext(_this.metaPath);
      _this._sortCondtions = ChartHelper.getSortConditions(_this.metaPath, _this.metaPath.getObject(), presentationPath.getPath(), _this.chartDefinition.applySupported);
      const chartActionsContext = _this.contextPath.getModel().createBindingContext(_chartContext.getPath() + "/Actions", _chart.Actions);
      const contextPathContext = _this.contextPath.getModel().createBindingContext(_this.contextPath.getPath(), _this.contextPath);
      const contextPathPath = CommonHelper.getContextPath(_this.contextPath, {
        context: contextPathContext
      });
      const targetCollectionPath = CommonHelper.getTargetCollection(_this.contextPath);
      const targetCollectionPathContext = _this.contextPath.getModel().createBindingContext(targetCollectionPath, _this.contextPath);
      _this._customData = {
        targetCollectionPath: contextPathPath,
        entitySet: typeof targetCollectionPathContext.getObject() === "string" ? targetCollectionPathContext.getObject() : targetCollectionPathContext.getObject("@sapui.name"),
        entityType: contextPathPath + "/",
        operationAvailableMap: CommonHelper.stringifyCustomData(JSON.parse(operationAvailableMap)),
        multiSelectDisabledActions: ActionHelper.getMultiSelectDisabledActions(_chart.Actions, {
          context: chartActionsContext
        }) + "",
        segmentedButtonId: generate([_this.id, "SegmentedButton", "TemplateContentView"]),
        customAgg: CommonHelper.stringifyCustomData((_this$chartDefinition4 = _this.chartDefinition) === null || _this$chartDefinition4 === void 0 ? void 0 : _this$chartDefinition4.customAgg),
        transAgg: CommonHelper.stringifyCustomData((_this$chartDefinition5 = _this.chartDefinition) === null || _this$chartDefinition5 === void 0 ? void 0 : _this$chartDefinition5.transAgg),
        applySupported: CommonHelper.stringifyCustomData((_this$chartDefinition6 = _this.chartDefinition) === null || _this$chartDefinition6 === void 0 ? void 0 : _this$chartDefinition6.applySupported),
        vizProperties: _this.vizProperties,
        draftSupported: _this.draftSupported,
        multiViews: (_this$chartDefinition7 = _this.chartDefinition) === null || _this$chartDefinition7 === void 0 ? void 0 : _this$chartDefinition7.multiViews
      };
      _this._actions = _this.chartActions ? _this.getToolbarActions(_chartContext) : xml``;
      return _this;
    }
    _exports = ChartBuildingBlock;
    var _proto = ChartBuildingBlock.prototype;
    _proto.getContentId = function getContentId(sMacroId) {
      return `${sMacroId}-content`;
    };
    ChartBuildingBlock.getExtraParams = function getExtraParams(props, visualizationPath) {
      const extraParams = {};
      if (props.actions) {
        var _Object$values;
        (_Object$values = Object.values(props.actions)) === null || _Object$values === void 0 ? void 0 : _Object$values.forEach(item => {
          props.actions = {
            ...props.actions,
            ...item.menuContentActions
          };
          delete item.menuContentActions;
        });
      }
      if (visualizationPath) {
        extraParams[visualizationPath] = {
          actions: props.actions
        };
      }
      return extraParams;
    };
    _proto.getTemplate = function getTemplate() {
      const chartContext = ChartHelper.getUiChart(this.metaPath);
      const chart = chartContext.getObject();
      let chartdelegate = "";
      if (this.chartDelegate) {
        chartdelegate = this.chartDelegate;
      } else {
        const sContextPath = this.getContextPath();
        chartdelegate = "{name:'sap/fe/macros/chart/ChartDelegate', payload: {contextPath: '" + sContextPath + "', parameters:{$$groupId:'$auto.Workers'}, selectionMode: '" + this.selectionMode + "'}}";
      }
      const binding = "{internal>controls/" + this.id + "}";
      if (!this.header) {
        this.header = chart.Title;
      }
      return xml`
			<macro:ChartAPI xmlns="sap.m" xmlns:macro="sap.fe.macros.chart" xmlns:variant="sap.ui.fl.variants" xmlns:p13n="sap.ui.mdc.p13n" xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1" xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1" xmlns:internalMacro="sap.fe.macros.internal" xmlns:chart="sap.ui.mdc.chart" xmlns:mdc="sap.ui.mdc" xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:core="sap.ui.core" id="${this._apiId}" selectionChange="${this.selectionChange}" stateChange="${this.stateChange}">
				<macro:layoutData>
					<FlexItemData growFactor="1" shrinkFactor="1" />
				</macro:layoutData>
				<mdc:Chart
					binding="${binding}"
					unittest:id="ChartMacroFragment"
					id="${this._contentId}"
					chartType="${this._chartType}"
					sortConditions="${this._sortCondtions}"
					header="${this.header}"
					headerVisible="${this.headerVisible}"
					height="${this.height}"
					width="${this.width}"
					headerLevel="${this.headerLevel}"
					p13nMode="${this.personalization}"
					filter="${this.filter}"
					noDataText="${this.noDataText}"
					autoBindOnInit="${this.autoBindOnInit}"
					delegate="${chartdelegate}"
					macrodata:targetCollectionPath="${this._customData.targetCollectionPath}"
					macrodata:entitySet="${this._customData.entitySet}"
					macrodata:entityType="${this._customData.entityType}"
					macrodata:operationAvailableMap="${this._customData.operationAvailableMap}"
					macrodata:multiSelectDisabledActions="${this._customData.multiSelectDisabledActions}"
					macrodata:segmentedButtonId="${this._customData.segmentedButtonId}"
					macrodata:customAgg="${this._customData.customAgg}"
					macrodata:transAgg="${this._customData.transAgg}"
					macrodata:applySupported="${this._customData.applySupported}"
					macrodata:vizProperties="${this._customData.vizProperties}"
					macrodata:draftSupported="${this._customData.draftSupported}"
					macrodata:multiViews="${this._customData.multiViews}"
					visible="${this.visible}"
				>
				<mdc:dependents>
					${this.getDependents(chartContext)}
					${this.getPersistenceProvider()}
				</mdc:dependents>
				<mdc:items>
					${this.getItems(chartContext)}
				</mdc:items>
				${this._actions}
				${this.createVariantManagement()}
			</mdc:Chart>
		</macro:ChartAPI>`;
    };
    return ChartBuildingBlock;
  }(BuildingBlockBase), _class3.checkChartVisualizationPath = (aVisualizations, sVisualizationPath) => {
    aVisualizations.forEach(function (oVisualization) {
      if (oVisualization.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
        sVisualizationPath = oVisualization.$AnnotationPath;
      }
    });
    return sVisualizationPath;
  }, _class3.getVisualizationPath = (props, contextObjectPath, converterContext) => {
    var _props$metaPath;
    let metaPath = getContextRelativeTargetObjectPath(contextObjectPath);
    if (contextObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.Chart") {
      return metaPath; // MetaPath is already pointing to a Chart
    }

    if (((_props$metaPath = props.metaPath) === null || _props$metaPath === void 0 ? void 0 : _props$metaPath.getObject().$Type) === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
      const aVisualizations = props.metaPath.getObject().Visualizations;
      metaPath = _class3.checkChartVisualizationPath(aVisualizations, metaPath);
    }
    if (metaPath) {
      var _contextObjectPath$ta;
      //Need to switch to the context related the PV or SPV
      const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);
      let visualizations = [];
      switch ((_contextObjectPath$ta = contextObjectPath.targetObject) === null || _contextObjectPath$ta === void 0 ? void 0 : _contextObjectPath$ta.term) {
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          if (contextObjectPath.targetObject.PresentationVariant) {
            visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject.PresentationVariant, metaPath, resolvedTarget.converterContext);
          }
          break;
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject, metaPath, resolvedTarget.converterContext);
          break;
        default:
          Log.error(`Bad metapath parameter for chart : ${contextObjectPath.targetObject.term}`);
      }
      const chartViz = visualizations.find(viz => {
        return viz.visualization.term === "com.sap.vocabularies.UI.v1.Chart";
      });
      if (chartViz) {
        return chartViz.annotationPath;
      } else {
        return metaPath; // Fallback
      }
    } else {
      Log.error(`Bad metapath parameter for chart : ${contextObjectPath.targetObject.term}`);
      return metaPath;
    }
  }, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "chartDefinition", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "height", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "headerLevel", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "noDataText", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "chartDelegate", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "vizProperties", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "chartActions", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "draftSupported", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "autoBindOnInit", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "navigationPath", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "filter", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "measures", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "_applyIdToContent", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "variantSelected", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "variantSaved", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "onSegmentedButtonPressed", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec31], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ChartBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtTWVhc3VyZVJvbGUiLCJwZXJzb25hbGl6YXRpb25WYWx1ZXMiLCJzZXRDdXN0b21BY3Rpb25Qcm9wZXJ0aWVzIiwiY2hpbGRBY3Rpb24iLCJtZW51Q29udGVudEFjdGlvbnMiLCJhY3Rpb24iLCJtZW51QWN0aW9ucyIsImFjdGlvbktleSIsImdldEF0dHJpYnV0ZSIsInJlcGxhY2UiLCJjaGlsZHJlbiIsImxlbmd0aCIsImxvY2FsTmFtZSIsIm5hbWVzcGFjZVVSSSIsImFjdGlvbnNUb0FkZCIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJhcHBseSIsImFjdGlvbklkeCIsInJlZHVjZSIsImN1c3RvbUFjdGlvbiIsImFjdFRvQWRkIiwiYWN0aW9uS2V5QWRkIiwiY3VyT3V0T2JqZWN0Iiwia2V5IiwidGV4dCIsIl9fbm9XcmFwIiwicHJlc3MiLCJyZXF1aXJlc1NlbGVjdGlvbiIsImVuYWJsZWQiLCJPYmplY3QiLCJ2YWx1ZXMiLCJtYXAiLCJtZW51SXRlbSIsInBvc2l0aW9uIiwicGxhY2VtZW50IiwiYW5jaG9yIiwibWVudSIsIkNoYXJ0QnVpbGRpbmdCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJkZWZhdWx0VmFsdWUiLCJibG9ja0V2ZW50IiwiYmxvY2tBZ2dyZWdhdGlvbiIsInByb2Nlc3NBZ2dyZWdhdGlvbnMiLCJvUHJvcHMiLCJjb25maWd1cmF0aW9uIiwibVNldHRpbmdzIiwiX2NvbW1hbmRBY3Rpb25zIiwiY3JlYXRlQ2hhcnREZWZpbml0aW9uIiwib0NvbnZlcnRlckNvbnRleHQiLCJvQ29udGV4dE9iamVjdFBhdGgiLCJzVmlzdWFsaXphdGlvblBhdGgiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwibWV0YVBhdGgiLCJnZXRPYmplY3QiLCIkVHlwZSIsImFWaXN1YWxpemF0aW9ucyIsIlZpc3VhbGl6YXRpb25zIiwiY2hlY2tDaGFydFZpc3VhbGl6YXRpb25QYXRoIiwib1Zpc3VhbGl6YXRpb25EZWZpbml0aW9uIiwiZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uIiwidXNlQ29uZGVuc2VkTGF5b3V0IiwiY2hhcnREZWZpbml0aW9uIiwidmlzdWFsaXphdGlvbnMiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsIm9EYXRhIiwic0NvbnRleHRQYXRoIiwidWlkIiwibW9kZWxzIiwiY29udmVydGVyQ29udGV4dCIsInNldFByb3BlcnR5IiwiZ2V0Q2hhcnRNZWFzdXJlcyIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiYUNoYXJ0QW5ub3RhdGlvblBhdGgiLCJhbm5vdGF0aW9uUGF0aCIsInNwbGl0Iiwic0NoYXJ0QW5ub3RhdGlvblBhdGgiLCJmaWx0ZXIiLCJpdGVtIiwicG9zIiwiaW5kZXhPZiIsInRvU3RyaW5nIiwicmVwbGFjZUFsbCIsIm9DaGFydCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImdldE1vZGVsIiwiY29udGV4dFBhdGgiLCJ0YXJnZXRPYmplY3QiLCJjaGFydENvbnRleHQiLCJDaGFydEhlbHBlciIsImdldFVpQ2hhcnQiLCJjaGFydCIsImFBZ2dyZWdhdGVkUHJvcGVydHkiLCJnZXRBZ2dyZWdhdGVkUHJvcGVydGllcyIsImFNZWFzdXJlcyIsInNBbm5vUGF0aCIsImdldFBhdGgiLCJhQWdncmVnYXRlZFByb3BlcnRpZXMiLCJhQ2hhcnRNZWFzdXJlcyIsIk1lYXN1cmVzIiwiYUNoYXJ0RHluYW1pY01lYXN1cmVzIiwiRHluYW1pY01lYXN1cmVzIiwiYVRyYW5zQWdnSW5NZWFzdXJlcyIsIm9BZ2dyZWdhdGVkUHJvcGVydGllcyIsInNvbWUiLCJvTWVhc3VyZSIsIk5hbWUiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsInNFbnRpdHlTZXRQYXRoIiwib1RyYW5zQWdncmVnYXRpb25zIiwidHJhbnNBZ2ciLCJvQ3VzdG9tQWdncmVnYXRpb25zIiwiY3VzdG9tQWdnIiwiTG9nIiwid2FybmluZyIsImJJc0N1c3RvbUFnZ3JlZ2F0ZUlzTWVhc3VyZSIsIm9DaGFydE1lYXN1cmUiLCJvQ3VzdG9tQWdnTWVhc3VyZSIsImdldEN1c3RvbUFnZ01lYXN1cmUiLCJFcnJvciIsImR5bmFtaWNNZWFzdXJlIiwiZ2V0RHluYW1pY01lYXN1cmVzIiwiY2hhcnRNZWFzdXJlIiwic0tleSIsInNldEN1c3RvbUFnZ01lYXN1cmUiLCJzZXRUcmFuc0FnZ01lYXN1cmUiLCJzZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGVzIiwiTWVhc3VyZUF0dHJpYnV0ZXMiLCJvTWVhc3VyZXNNb2RlbCIsIkpTT05Nb2RlbCIsIiQkdmFsdWVBc1Byb21pc2UiLCJlcnJvciIsInJvbGUiLCJwcm9wZXJ0eVBhdGgiLCJwdXNoIiwib1RyYW5zQWdnTWVhc3VyZSIsImFnZ3JlZ2F0aW9uTWV0aG9kIiwibGFiZWwiLCJvQWdncmVnYXRlZFByb3BlcnR5Iiwic3RhcnRzV2l0aCIsIm9EeW5hbWljTWVhc3VyZSIsIkFnZ3JlZ2F0YWJsZVByb3BlcnR5IiwiQWdncmVnYXRpb25NZXRob2QiLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsImFubm90YXRpb25zIiwiX2Fubm90YXRpb25zIiwiYU1lYXN1cmVBdHRyaWJ1dGVzIiwibWVhc3VyZUF0dHJpYnV0ZSIsIl9zZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGUiLCJzUGF0aCIsIkR5bmFtaWNNZWFzdXJlIiwiTWVhc3VyZSIsImRhdGFQb2ludCIsIkRhdGFQb2ludCIsIlJvbGUiLCJvRGF0YVBvaW50Iiwic2V0TWVhc3VyZVJvbGUiLCJzZXRNZWFzdXJlRGF0YVBvaW50IiwiVmFsdWUiLCIkUGF0aCIsImZvcm1hdEpTT05Ub1N0cmluZyIsIk9EYXRhTWV0YU1vZGVsVXRpbCIsImNyZWF0ZURhdGFQb2ludFByb3BlcnR5IiwiaW5kZXgiLCIkRW51bU1lbWJlciIsIm9Dcml0Iiwic0NyaXRpY2FsaXR5IiwiSlNPTiIsInN0cmluZ2lmeSIsIlJlZ0V4cCIsImdldERlcGVuZGVudHMiLCJjb21tYW5kQWN0aW9uIiwiZ2V0QWN0aW9uQ29tbWFuZCIsInhtbCIsImNoZWNrUGVyc29uYWxpemF0aW9uSW5DaGFydFByb3BlcnRpZXMiLCJwZXJzb25hbGl6YXRpb24iLCJqb2luIiwidmVyaWZ5VmFsaWRQZXJzb25saXphdGlvbiIsInZhbGlkIiwic3BsaXRBcnJheSIsImFjY2VwdGVkVmFsdWVzIiwiZm9yRWFjaCIsImFycmF5RWxlbWVudCIsImluY2x1ZGVzIiwiZ2V0VmFyaWFudE1hbmFnZW1lbnQiLCJvQ2hhcnREZWZpbml0aW9uIiwidmFyaWFudE1hbmFnZW1lbnQiLCJjcmVhdGVWYXJpYW50TWFuYWdlbWVudCIsImdlbmVyYXRlIiwiaWQiLCJ2YXJpYW50U2VsZWN0ZWQiLCJoZWFkZXJMZXZlbCIsInZhcmlhbnRTYXZlZCIsImdldFBlcnNpc3RlbmNlUHJvdmlkZXIiLCJwdXNoQWN0aW9uQ29tbWFuZCIsImFjdGlvbkNvbnRleHQiLCJkYXRhRmllbGQiLCJjaGFydE9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsIm9uRXhlY3V0ZUFjdGlvbiIsImdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJvbkV4ZWN1dGVJQk4iLCJDb21tb25IZWxwZXIiLCJnZXRQcmVzc0hhbmRsZXJGb3JEYXRhRmllbGRGb3JJQk4iLCJvbkV4ZWN1dGVNYW5pZmVzdCIsImJ1aWxkQWN0aW9uV3JhcHBlciIsIm9BY3Rpb24iLCJkYXRhRmllbGRDb250ZXh0IiwiZGF0YUZpZWxkQWN0aW9uIiwiZ2V0QWN0aW9uQ29udGV4dCIsImlzQm91bmRQYXRoIiwiZ2V0UGF0aFRvQm91bmRBY3Rpb25PdmVybG9hZCIsImlzQm91bmQiLCJlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZSIsImdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImNvbnRleHQiLCJpc0FjdGlvbkVuYWJsZWQiLCJpc0RhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbkVuYWJsZWQiLCIkSXNCb3VuZCIsIkFjdGlvbiIsImVuYWJsZU9uU2VsZWN0IiwiaXNJQk5FbmFibGVkIiwiUmVxdWlyZXNDb250ZXh0IiwiYWN0aW9uQ29tbWFuZCIsImdldFZpc2libGUiLCJJc0JvdW5kIiwiZ2V0SXRlbXMiLCJkaW1lbnNpb25zIiwibWVhc3VyZXMiLCJEaW1lbnNpb25zIiwiZm9ybWF0RGltZW5zaW9ucyIsImRpbWVuc2lvbiIsImdldEl0ZW0iLCJmb3JtYXRNZWFzdXJlcyIsIm1lYXN1cmUiLCJjb25jYXQiLCJwcmVmaXgiLCJnZXRUb29sYmFyQWN0aW9ucyIsImFBY3Rpb25zIiwiZ2V0QWN0aW9ucyIsIm9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCIsImdldFNlZ21lbnRlZEJ1dHRvbiIsImFjdGlvbnMiLCJjaGFydEFjdGlvbnMiLCJyZW1vdmVNZW51SXRlbXMiLCJnZXRBY3Rpb24iLCJoYXNPd25Qcm9wZXJ0eSIsImdldEN1c3RvbUFjdGlvbnMiLCJzcGxpY2UiLCJhY3Rpb25FbmFibGVkIiwiZ2V0QWN0aW9uVG9vbGJhckFjdGlvbiIsInVuaXR0ZXN0aWQiLCJhcmlhSGFzUG9wdXAiLCJ2aXNpYmxlIiwiZ2V0QWN0aW9uVG9vbGJhck1lbnVBY3Rpb24iLCJ1c2VEZWZhdWx0QWN0aW9uT25seSIsIkRlZmF1bHRBY3Rpb25IYW5kbGVyIiwiZ2V0VXNlRGVmYXVsdEFjdGlvbk9ubHkiLCJidXR0b25Nb2RlIiwiZ2V0QnV0dG9uTW9kZSIsImRlZmF1bHRBY3Rpb24iLCJnZXRNZW51SXRlbUZyb21NZW51IiwibWVudUl0ZW1BY3Rpb24iLCJwcmVzc0hhbmRsZXIiLCJjb21tYW5kIiwibm9XcmFwIiwicHJvcHMiLCJhTWVudUl0ZW1zIiwiaXNNZW51SXRlbSIsImdldE5hdmlnYXRpb25BY3Rpb25zIiwiZ2V0QW5ub3RhdGlvbkFjdGlvbnMiLCJiRW5hYmxlZCIsIkxhYmVsIiwiYWN0aW9uT2JqZWN0IiwiZ2V0QW5ub3RhdGlvbkFjdGlvbnNFbmFibGVkIiwiaXNEaWFsb2ciLCJ0b29sYmFyQWN0aW9uIiwiYnVpbGRBY3Rpb24iLCJhY3Rpb25QcmVzcyIsImdldFNlZ21lbnRlZEJ1dHRvbkl0ZW1zIiwic1NlZ21lbnRlZEJ1dHRvbkl0ZW1zIiwiaXNEZXNrdG9wIiwiZ2V0U2VnbWVudGVkQnV0dG9uSXRlbSIsInRvb2x0aXAiLCJpY29uIiwiaGlkZGVuUGF0aENvbnRleHQiLCJnZXRIaWRkZW5QYXRoRXhwcmVzc2lvbkZvclRhYmxlQWN0aW9uc0FuZElCTiIsImdldENvbnRleHRQYXRoIiwibGFzdEluZGV4T2YiLCJpbml0aWFsQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJ2aXN1YWxpemF0aW9uUGF0aCIsImdldFZpc3VhbGl6YXRpb25QYXRoIiwiZXh0cmFQYXJhbXMiLCJnZXRFeHRyYVBhcmFtcyIsIkFnZ3JlZ2F0aW9uSGVscGVyIiwiZ2V0RW50aXR5VHlwZSIsIm5hdmlnYXRpb25QYXRoIiwiYXV0b0JpbmRPbkluaXQiLCJ2aXpQcm9wZXJ0aWVzIiwic2VsZWN0aW9uTW9kZSIsInRvVXBwZXJDYXNlIiwiZmlsdGVyQmFyIiwiZ2V0Q29udGVudElkIiwiZmlsdGVySWQiLCJkcmFmdFN1cHBvcnRlZCIsIk1vZGVsSGVscGVyIiwiaXNEcmFmdFN1cHBvcnRlZCIsIm1ldGFNb2RlbCIsIl9hcHBseUlkVG9Db250ZW50IiwiX2FwaUlkIiwiX2NvbnRlbnRJZCIsIl9jaGFydFR5cGUiLCJmb3JtYXRDaGFydFR5cGUiLCJDaGFydFR5cGUiLCJvcGVyYXRpb25BdmFpbGFibGVNYXAiLCJrZXlzIiwiY29tbWFuZEFjdGlvbnMiLCJwcmVzZW50YXRpb25QYXRoIiwiY3JlYXRlUHJlc2VudGF0aW9uUGF0aENvbnRleHQiLCJfc29ydENvbmR0aW9ucyIsImdldFNvcnRDb25kaXRpb25zIiwiYXBwbHlTdXBwb3J0ZWQiLCJjaGFydEFjdGlvbnNDb250ZXh0IiwiQWN0aW9ucyIsImNvbnRleHRQYXRoQ29udGV4dCIsImNvbnRleHRQYXRoUGF0aCIsInRhcmdldENvbGxlY3Rpb25QYXRoIiwiZ2V0VGFyZ2V0Q29sbGVjdGlvbiIsInRhcmdldENvbGxlY3Rpb25QYXRoQ29udGV4dCIsIl9jdXN0b21EYXRhIiwiZW50aXR5U2V0IiwiZW50aXR5VHlwZSIsInN0cmluZ2lmeUN1c3RvbURhdGEiLCJwYXJzZSIsIm11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zIiwiQWN0aW9uSGVscGVyIiwiZ2V0TXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnMiLCJzZWdtZW50ZWRCdXR0b25JZCIsIm11bHRpVmlld3MiLCJfYWN0aW9ucyIsInNNYWNyb0lkIiwiZ2V0VGVtcGxhdGUiLCJjaGFydGRlbGVnYXRlIiwiY2hhcnREZWxlZ2F0ZSIsImJpbmRpbmciLCJoZWFkZXIiLCJUaXRsZSIsInNlbGVjdGlvbkNoYW5nZSIsInN0YXRlQ2hhbmdlIiwiaGVhZGVyVmlzaWJsZSIsImhlaWdodCIsIndpZHRoIiwibm9EYXRhVGV4dCIsIkJ1aWxkaW5nQmxvY2tCYXNlIiwib1Zpc3VhbGl6YXRpb24iLCIkQW5ub3RhdGlvblBhdGgiLCJjb250ZXh0T2JqZWN0UGF0aCIsInRlcm0iLCJyZXNvbHZlZFRhcmdldCIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwiUHJlc2VudGF0aW9uVmFyaWFudCIsImdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQiLCJjaGFydFZpeiIsImZpbmQiLCJ2aXoiLCJ2aXN1YWxpemF0aW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDaGFydEJ1aWxkaW5nQmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKlxuICogQGNsYXNzZGVzY1xuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgQ2hhcnQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpDaGFydCBpZD1cIk15Q2hhcnRcIiBtZXRhUGF0aD1cIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBDaGFydCBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiBAY2xhc3Mgc2FwLmZlLm1hY3Jvcy5DaGFydFxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuaW1wb3J0IHR5cGUgeyBQcmltaXRpdmVUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQge1xuXHRDaGFydCxcblx0Q2hhcnRNZWFzdXJlQXR0cmlidXRlVHlwZSxcblx0Q2hhcnRNZWFzdXJlUm9sZVR5cGUsXG5cdERhdGFGaWVsZEZvckFjdGlvbixcblx0RGF0YVBvaW50LFxuXHRVSUFubm90YXRpb25UZXJtc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB1aWQgZnJvbSBcInNhcC9iYXNlL3V0aWwvdWlkXCI7XG5pbXBvcnQge1xuXHRibG9ja0FnZ3JlZ2F0aW9uLFxuXHRibG9ja0F0dHJpYnV0ZSxcblx0YmxvY2tFdmVudCxcblx0QnVpbGRpbmdCbG9ja0Jhc2UsXG5cdGRlZmluZUJ1aWxkaW5nQmxvY2tcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCB7IGVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlLCB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCB0eXBlIHsgQmFzZUFjdGlvbiwgQ3VzdG9tQWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBDaGFydFZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQ2hhcnRcIjtcbmltcG9ydCB7XG5cdGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbixcblx0Z2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCxcblx0VmlzdWFsaXphdGlvbkFuZFBhdGhcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IEFnZ3JlZ2F0aW9uSGVscGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9BZ2dyZWdhdGlvblwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgcmVzb2x2ZUJpbmRpbmdTdHJpbmcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFRpdGxlTGV2ZWwgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbmltcG9ydCBBY3Rpb25IZWxwZXIgZnJvbSBcIi4uL2ludGVybmFsL2hlbHBlcnMvQWN0aW9uSGVscGVyXCI7XG5pbXBvcnQgRGVmYXVsdEFjdGlvbkhhbmRsZXIgZnJvbSBcIi4uL2ludGVybmFsL2hlbHBlcnMvRGVmYXVsdEFjdGlvbkhhbmRsZXJcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbFV0aWwgZnJvbSBcIi4uL09EYXRhTWV0YU1vZGVsVXRpbFwiO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb24sIEFjdGlvbkdyb3VwIH0gZnJvbSBcIi4vQ2hhcnRBUElcIjtcbmltcG9ydCBDaGFydEhlbHBlciBmcm9tIFwiLi9DaGFydEhlbHBlclwiO1xuXG5jb25zdCBtTWVhc3VyZVJvbGU6IGFueSA9IHtcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydE1lYXN1cmVSb2xlVHlwZS9BeGlzMVwiOiBcImF4aXMxXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRNZWFzdXJlUm9sZVR5cGUvQXhpczJcIjogXCJheGlzMlwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0TWVhc3VyZVJvbGVUeXBlL0F4aXMzXCI6IFwiYXhpczNcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydE1lYXN1cmVSb2xlVHlwZS9BeGlzNFwiOiBcImF4aXM0XCJcbn07XG5cbnR5cGUgRXh0ZW5kZWRBY3Rpb25Hcm91cCA9IEFjdGlvbkdyb3VwICYgeyBtZW51Q29udGVudEFjdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBBY3Rpb24+IH07XG50eXBlIEFjdGlvbk9yQWN0aW9uR3JvdXAgPSBSZWNvcmQ8c3RyaW5nLCBBY3Rpb24gfCBFeHRlbmRlZEFjdGlvbkdyb3VwPjtcbnR5cGUgQ3VzdG9tQW5kQWN0aW9uID0gQ3VzdG9tQWN0aW9uICYgKEFjdGlvbiB8IEFjdGlvbkdyb3VwKTtcbnR5cGUgQ3VzdG9tVG9vbGJhck1lbnVBY3Rpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0dmlzaWJsZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRlbmFibGVkOiBzdHJpbmcgfCBib29sZWFuO1xuXHR1c2VEZWZhdWx0QWN0aW9uT25seT86IGJvb2xlYW47XG5cdGJ1dHRvbk1vZGU/OiBzdHJpbmc7XG5cdGRlZmF1bHRBY3Rpb24/OiBzdHJpbmc7XG5cdGFjdGlvbnM/OiBDdXN0b21BY3Rpb247XG59O1xuXG5lbnVtIHBlcnNvbmFsaXphdGlvblZhbHVlcyB7XG5cdFNvcnQgPSBcIlNvcnRcIixcblx0VHlwZSA9IFwiVHlwZVwiLFxuXHRJdGVtID0gXCJJdGVtXCJcbn1cblxuLyoqXG4gKiBCdWlsZCBhY3Rpb25zIGFuZCBhY3Rpb24gZ3JvdXBzIHdpdGggYWxsIHByb3BlcnRpZXMgZm9yIGNoYXJ0IHZpc3VhbGl6YXRpb24uXG4gKlxuICogQHBhcmFtIGNoaWxkQWN0aW9uIFhNTCBub2RlIGNvcnJlc3BvbmRpbmcgdG8gYWN0aW9uc1xuICogQHJldHVybnMgUHJlcGFyZWQgYWN0aW9uIG9iamVjdFxuICovXG5jb25zdCBzZXRDdXN0b21BY3Rpb25Qcm9wZXJ0aWVzID0gZnVuY3Rpb24gKGNoaWxkQWN0aW9uOiBFbGVtZW50KSB7XG5cdGxldCBtZW51Q29udGVudEFjdGlvbnMgPSBudWxsO1xuXHRjb25zdCBhY3Rpb24gPSBjaGlsZEFjdGlvbjtcblx0bGV0IG1lbnVBY3Rpb25zOiBBY3Rpb25Hcm91cFtdID0gW107XG5cdGNvbnN0IGFjdGlvbktleSA9IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJrZXlcIik/LnJlcGxhY2UoXCJJbmxpbmVYTUxfXCIsIFwiXCIpO1xuXHRpZiAoYWN0aW9uLmNoaWxkcmVuLmxlbmd0aCAmJiBhY3Rpb24ubG9jYWxOYW1lID09PSBcIkFjdGlvbkdyb3VwXCIgJiYgYWN0aW9uLm5hbWVzcGFjZVVSSSA9PT0gXCJzYXAuZmUubWFjcm9zXCIpIHtcblx0XHRjb25zdCBhY3Rpb25zVG9BZGQgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoYWN0aW9uLmNoaWxkcmVuKTtcblx0XHRsZXQgYWN0aW9uSWR4ID0gMDtcblx0XHRtZW51Q29udGVudEFjdGlvbnMgPSBhY3Rpb25zVG9BZGQucmVkdWNlKChjdXN0b21BY3Rpb24sIGFjdFRvQWRkKSA9PiB7XG5cdFx0XHRjb25zdCBhY3Rpb25LZXlBZGQgPSBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJrZXlcIik/LnJlcGxhY2UoXCJJbmxpbmVYTUxfXCIsIFwiXCIpIHx8IGFjdGlvbktleSArIFwiX01lbnVfXCIgKyBhY3Rpb25JZHg7XG5cdFx0XHRjb25zdCBjdXJPdXRPYmplY3QgPSB7XG5cdFx0XHRcdGtleTogYWN0aW9uS2V5QWRkLFxuXHRcdFx0XHR0ZXh0OiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJ0ZXh0XCIpLFxuXHRcdFx0XHRfX25vV3JhcDogdHJ1ZSxcblx0XHRcdFx0cHJlc3M6IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcInByZXNzXCIpLFxuXHRcdFx0XHRyZXF1aXJlc1NlbGVjdGlvbjogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwicmVxdWlyZXNTZWxlY3Rpb25cIikgPT09IFwidHJ1ZVwiLFxuXHRcdFx0XHRlbmFibGVkOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpID09PSBudWxsID8gdHJ1ZSA6IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcImVuYWJsZWRcIikgPT09IHRydWVcblx0XHRcdH07XG5cdFx0XHRjdXN0b21BY3Rpb25bY3VyT3V0T2JqZWN0LmtleV0gPSBjdXJPdXRPYmplY3Q7XG5cdFx0XHRhY3Rpb25JZHgrKztcblx0XHRcdHJldHVybiBjdXN0b21BY3Rpb247XG5cdFx0fSwge30pO1xuXHRcdG1lbnVBY3Rpb25zID0gT2JqZWN0LnZhbHVlcyhtZW51Q29udGVudEFjdGlvbnMpXG5cdFx0XHQuc2xpY2UoLWFjdGlvbi5jaGlsZHJlbi5sZW5ndGgpXG5cdFx0XHQubWFwKGZ1bmN0aW9uIChtZW51SXRlbTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBtZW51SXRlbS5rZXk7XG5cdFx0XHR9KTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdGtleTogYWN0aW9uS2V5LFxuXHRcdHRleHQ6IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJ0ZXh0XCIpLFxuXHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRwbGFjZW1lbnQ6IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJwbGFjZW1lbnRcIiksXG5cdFx0XHRhbmNob3I6IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJhbmNob3JcIilcblx0XHR9LFxuXHRcdF9fbm9XcmFwOiB0cnVlLFxuXHRcdHByZXNzOiBhY3Rpb24uZ2V0QXR0cmlidXRlKFwicHJlc3NcIiksXG5cdFx0cmVxdWlyZXNTZWxlY3Rpb246IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJyZXF1aXJlc1NlbGVjdGlvblwiKSA9PT0gXCJ0cnVlXCIsXG5cdFx0ZW5hYmxlZDogYWN0aW9uLmdldEF0dHJpYnV0ZShcImVuYWJsZWRcIikgPT09IG51bGwgPyB0cnVlIDogYWN0aW9uLmdldEF0dHJpYnV0ZShcImVuYWJsZWRcIiksXG5cdFx0bWVudTogbWVudUFjdGlvbnMubGVuZ3RoID8gbWVudUFjdGlvbnMgOiBudWxsLFxuXHRcdG1lbnVDb250ZW50QWN0aW9uczogbWVudUNvbnRlbnRBY3Rpb25zXG5cdH07XG59O1xuXG50eXBlIE1lYXN1cmVUeXBlID0ge1xuXHRpZD86IHN0cmluZztcblx0a2V5Pzogc3RyaW5nO1xuXHRyb2xlPzogc3RyaW5nO1xuXHRwcm9wZXJ0eVBhdGg/OiBzdHJpbmc7XG5cdGFnZ3JlZ2F0aW9uTWV0aG9kPzogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZyB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxQcmltaXRpdmVUeXBlPjtcblx0dmFsdWU/OiBzdHJpbmc7XG5cdGRhdGFQb2ludD86IHN0cmluZztcblx0bmFtZT86IHN0cmluZztcbn07XG5cbnR5cGUgRGltZW5zaW9uVHlwZSA9IHtcblx0aWQ/OiBzdHJpbmc7XG5cdGtleT86IHN0cmluZztcblx0cm9sZT86IHN0cmluZztcblx0cHJvcGVydHlQYXRoPzogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZyB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxQcmltaXRpdmVUeXBlPjtcblx0dmFsdWU/OiBzdHJpbmc7XG59O1xuXG50eXBlIENvbW1hbmRBY3Rpb24gPSB7XG5cdGFjdGlvbkNvbnRleHQ6IFY0Q29udGV4dDtcblx0b25FeGVjdXRlQWN0aW9uOiBzdHJpbmc7XG5cdG9uRXhlY3V0ZUlCTjogc3RyaW5nO1xuXHRvbkV4ZWN1dGVNYW5pZmVzdDogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG59O1xuXG50eXBlIFRvb2xCYXJBY3Rpb24gPSB7XG5cdHVuaXR0ZXN0aWQ6IHN0cmluZztcblx0aWQ/OiBzdHJpbmc7XG5cdGxhYmVsOiBzdHJpbmc7XG5cdGFyaWFIYXNQb3B1cD86IHN0cmluZztcblx0cHJlc3M6IHN0cmluZztcblx0ZW5hYmxlZDogc3RyaW5nIHwgYm9vbGVhbjtcblx0dmlzaWJsZTogc3RyaW5nIHwgYm9vbGVhbjtcbn07XG5cbnR5cGUgQ2hhcnRDdXN0b21EYXRhID0ge1xuXHR0YXJnZXRDb2xsZWN0aW9uUGF0aDogc3RyaW5nO1xuXHRlbnRpdHlTZXQ6IHN0cmluZztcblx0ZW50aXR5VHlwZTogc3RyaW5nO1xuXHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IHN0cmluZztcblx0bXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnM6IHN0cmluZztcblx0c2VnbWVudGVkQnV0dG9uSWQ6IHN0cmluZztcblx0Y3VzdG9tQWdnOiBzdHJpbmc7XG5cdHRyYW5zQWdnOiBzdHJpbmc7XG5cdGFwcGx5U3VwcG9ydGVkOiBzdHJpbmc7XG5cdHZpelByb3BlcnRpZXM6IHN0cmluZztcblx0ZHJhZnRTdXBwb3J0ZWQ/OiBib29sZWFuO1xuXHRtdWx0aVZpZXdzPzogYm9vbGVhbjtcbn07XG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiQ2hhcnRcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0cHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYXJ0QnVpbGRpbmdCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0LyoqXG5cdCAqIElEIG9mIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0aWQhOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0fSlcblx0Y2hhcnREZWZpbml0aW9uITogQ2hhcnRWaXN1YWxpemF0aW9uO1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBwcmVzZW50YXRpb24gKFVJLkNoYXJ0IHcgb3Igdy9vIHF1YWxpZmllcilcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdG1ldGFQYXRoITogVjRDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBlbnRpdHlTZXQgb3IgbmF2aWdhdGlvblByb3BlcnR5XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRjb250ZXh0UGF0aCE6IFY0Q29udGV4dDtcblxuXHQvKipcblx0ICogVGhlIGhlaWdodCBvZiB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiMTAwJVwiXG5cdH0pXG5cdGhlaWdodD86IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIHdpZHRoIG9mIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGRlZmF1bHRWYWx1ZTogXCIxMDAlXCJcblx0fSlcblx0d2lkdGg/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgaGVhZGVyIHRleHQgdGhhdCBpcyBzaG93biBpbiB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRoZWFkZXI/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgY2hhcnQgaGVhZGVyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGhlYWRlclZpc2libGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBcImFyaWEtbGV2ZWxcIiBvZiB0aGUgY2hhcnQgaGVhZGVyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuVGl0bGVMZXZlbFwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogXCJBdXRvXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0aGVhZGVyTGV2ZWw/OiBUaXRsZUxldmVsO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgdGhlIHNlbGVjdGlvbiBtb2RlXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBcIk1VTFRJUExFXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0c2VsZWN0aW9uTW9kZT86IHN0cmluZztcblxuXHQvKipcblx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIHBlcnNvbmFsaXphdGlvbiBvZiB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmd8Ym9vbGVhblwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHBlcnNvbmFsaXphdGlvbj86IHN0cmluZyB8IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFBhcmFtZXRlciB3aGljaCBzZXRzIHRoZSBJRCBvZiB0aGUgZmlsdGVyYmFyIGFzc29jaWF0aW5nIGl0IHRvIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGZpbHRlckJhcj86IHN0cmluZztcblxuXHQvKipcblx0ICogXHRQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgbm9EYXRhVGV4dCBmb3IgdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG5vRGF0YVRleHQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFBhcmFtZXRlciB3aGljaCBzZXRzIHRoZSBjaGFydCBkZWxlZ2F0ZSBmb3IgdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGNoYXJ0RGVsZWdhdGU/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFBhcmFtZXRlciB3aGljaCBzZXRzIHRoZSB2aXN1YWxpemF0aW9uIHByb3BlcnRpZXMgZm9yIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR2aXpQcm9wZXJ0aWVzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgYWN0aW9ucyB0byBiZSBzaG93biBpbiB0aGUgYWN0aW9uIGFyZWEgb2YgdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIgfSlcblx0Y2hhcnRBY3Rpb25zPzogVjRDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGRyYWZ0U3VwcG9ydGVkPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRhdXRvQmluZE9uSW5pdD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR2aXNpYmxlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0bmF2aWdhdGlvblBhdGg/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRmaWx0ZXI/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRtZWFzdXJlcz86IFY0Q29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0fSlcblx0X2FwcGx5SWRUb0NvbnRlbnQ/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHZhcmlhbnRNYW5hZ2VtZW50Pzogc3RyaW5nO1xuXG5cdEBibG9ja0V2ZW50KClcblx0dmFyaWFudFNlbGVjdGVkITogRnVuY3Rpb247XG5cblx0QGJsb2NrRXZlbnQoKVxuXHR2YXJpYW50U2F2ZWQhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogVGhlIFhNTCBhbmQgbWFuaWZlc3QgYWN0aW9ucyB0byBiZSBzaG93biBpbiB0aGUgYWN0aW9uIGFyZWEgb2YgdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBZ2dyZWdhdGlvbih7XG5cdFx0dHlwZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsLmNoYXJ0LkFjdGlvbiB8IHNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuY2hhcnQuQWN0aW9uR3JvdXBcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRwcm9jZXNzQWdncmVnYXRpb25zOiBzZXRDdXN0b21BY3Rpb25Qcm9wZXJ0aWVzXG5cdH0pXG5cdGFjdGlvbnMhOiBBY3Rpb25PckFjdGlvbkdyb3VwO1xuXG5cdEBibG9ja0V2ZW50KClcblx0b25TZWdtZW50ZWRCdXR0b25QcmVzc2VkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBjaGFydCBzZWxlY3Rpb25zIGFyZSBjaGFuZ2VkLiBUaGUgZXZlbnQgY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGRhdGEgc2VsZWN0ZWQvZGVzZWxlY3RlZCBhbmRcblx0ICogdGhlIEJvb2xlYW4gZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGRhdGEgaXMgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZFxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRzZWxlY3Rpb25DaGFuZ2UhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgc3RhdGVDaGFuZ2UgZXZlbnQgb2YgdGhlIGNoYXJ0LlxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRzdGF0ZUNoYW5nZSE6IEZ1bmN0aW9uO1xuXHR1c2VDb25kZW5zZWRMYXlvdXQhOiBib29sZWFuO1xuXHRfYXBpSWQhOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdF9jb250ZW50SWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0X2NvbW1hbmRBY3Rpb25zOiBDb21tYW5kQWN0aW9uW10gPSBbXTtcblx0X2NoYXJ0VHlwZTogc3RyaW5nO1xuXHRfc29ydENvbmR0aW9uczogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRfY3VzdG9tRGF0YTogQ2hhcnRDdXN0b21EYXRhO1xuXHRfYWN0aW9uczogc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKG9Qcm9wczogUHJvcGVydGllc09mPENoYXJ0QnVpbGRpbmdCbG9jaz4sIGNvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihvUHJvcHMsIGNvbmZpZ3VyYXRpb24sIG1TZXR0aW5ncyk7XG5cdFx0Y29uc3Qgb0NvbnRleHRPYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9Qcm9wcy5tZXRhUGF0aCEsIG9Qcm9wcy5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3QgaW5pdGlhbENvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQob0NvbnRleHRPYmplY3RQYXRoLCAvKm9Qcm9wcy5jb250ZXh0UGF0aCovIHVuZGVmaW5lZCwgbVNldHRpbmdzKTtcblx0XHRjb25zdCB2aXN1YWxpemF0aW9uUGF0aCA9IENoYXJ0QnVpbGRpbmdCbG9jay5nZXRWaXN1YWxpemF0aW9uUGF0aChvUHJvcHMsIG9Db250ZXh0T2JqZWN0UGF0aCwgaW5pdGlhbENvbnZlcnRlckNvbnRleHQpO1xuXHRcdGNvbnN0IGV4dHJhUGFyYW1zID0gQ2hhcnRCdWlsZGluZ0Jsb2NrLmdldEV4dHJhUGFyYW1zKG9Qcm9wcywgdmlzdWFsaXphdGlvblBhdGgpO1xuXHRcdGNvbnN0IG9Db252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5nZXRDb252ZXJ0ZXJDb250ZXh0KG9Db250ZXh0T2JqZWN0UGF0aCwgLypvUHJvcHMuY29udGV4dFBhdGgqLyB1bmRlZmluZWQsIG1TZXR0aW5ncywgZXh0cmFQYXJhbXMpO1xuXHRcdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKG9Db252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgb0NvbnZlcnRlckNvbnRleHQpO1xuXHRcdGNvbnN0IG9DaGFydERlZmluaXRpb246IENoYXJ0VmlzdWFsaXphdGlvbiA9XG5cdFx0XHRvUHJvcHMuY2hhcnREZWZpbml0aW9uID09PSB1bmRlZmluZWQgfHwgb1Byb3BzLmNoYXJ0RGVmaW5pdGlvbiA9PT0gbnVsbFxuXHRcdFx0XHQ/IHRoaXMuY3JlYXRlQ2hhcnREZWZpbml0aW9uKG9Qcm9wcywgb0NvbnZlcnRlckNvbnRleHQsIG9Db250ZXh0T2JqZWN0UGF0aClcblx0XHRcdFx0OiBvUHJvcHMuY2hhcnREZWZpbml0aW9uO1xuXHRcdC8vIEFQSSBQcm9wZXJ0aWVzXG5cdFx0dGhpcy5uYXZpZ2F0aW9uUGF0aCA9IG9DaGFydERlZmluaXRpb24ubmF2aWdhdGlvblBhdGg7XG5cdFx0dGhpcy5hdXRvQmluZE9uSW5pdCA9IG9DaGFydERlZmluaXRpb24uYXV0b0JpbmRPbkluaXQ7XG5cdFx0dGhpcy52aXpQcm9wZXJ0aWVzID0gb0NoYXJ0RGVmaW5pdGlvbi52aXpQcm9wZXJ0aWVzO1xuXHRcdHRoaXMuY2hhcnRBY3Rpb25zID0gdGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChvQ2hhcnREZWZpbml0aW9uLmFjdGlvbnMsIG1TZXR0aW5ncyk7XG5cdFx0dGhpcy5zZWxlY3Rpb25Nb2RlID0gb1Byb3BzLnNlbGVjdGlvbk1vZGUhLnRvVXBwZXJDYXNlKCk7XG5cdFx0aWYgKG9Qcm9wcy5maWx0ZXJCYXIpIHtcblx0XHRcdHRoaXMuZmlsdGVyID0gdGhpcy5nZXRDb250ZW50SWQob1Byb3BzLmZpbHRlckJhcik7XG5cdFx0fSBlbHNlIGlmICghb1Byb3BzLmZpbHRlcikge1xuXHRcdFx0dGhpcy5maWx0ZXIgPSBvQ2hhcnREZWZpbml0aW9uLmZpbHRlcklkO1xuXHRcdH1cblx0XHR0aGlzLm9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCA9IG9DaGFydERlZmluaXRpb24ub25TZWdtZW50ZWRCdXR0b25QcmVzc2VkO1xuXHRcdHRoaXMuY2hlY2tQZXJzb25hbGl6YXRpb25JbkNoYXJ0UHJvcGVydGllcyhvUHJvcHMpO1xuXHRcdHRoaXMudmFyaWFudE1hbmFnZW1lbnQgPSB0aGlzLmdldFZhcmlhbnRNYW5hZ2VtZW50KG9Qcm9wcywgb0NoYXJ0RGVmaW5pdGlvbik7XG5cdFx0dGhpcy52aXNpYmxlID0gb0NoYXJ0RGVmaW5pdGlvbi52aXNpYmxlO1xuXHRcdGxldCBzQ29udGV4dFBhdGggPSBvUHJvcHMuY29udGV4dFBhdGghLmdldFBhdGgoKTtcblx0XHRzQ29udGV4dFBhdGggPSBzQ29udGV4dFBhdGhbc0NvbnRleHRQYXRoLmxlbmd0aCAtIDFdID09PSBcIi9cIiA/IHNDb250ZXh0UGF0aC5zbGljZSgwLCAtMSkgOiBzQ29udGV4dFBhdGg7XG5cdFx0dGhpcy5kcmFmdFN1cHBvcnRlZCA9IE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQobVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwsIHNDb250ZXh0UGF0aCk7XG5cdFx0aWYgKG9Qcm9wcy5fYXBwbHlJZFRvQ29udGVudCA/PyBmYWxzZSkge1xuXHRcdFx0dGhpcy5fYXBpSWQgPSBvUHJvcHMuaWQgKyBcIjo6Q2hhcnRcIjtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IG9Qcm9wcy5pZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fYXBpSWQgPSBvUHJvcHMuaWQ7XG5cdFx0XHR0aGlzLl9jb250ZW50SWQgPSB0aGlzLmdldENvbnRlbnRJZChvUHJvcHMuaWQhKTtcblx0XHR9XG5cdFx0Y29uc3QgY2hhcnRDb250ZXh0ID0gQ2hhcnRIZWxwZXIuZ2V0VWlDaGFydCh0aGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCBjaGFydCA9IGNoYXJ0Q29udGV4dC5nZXRPYmplY3QoKTtcblx0XHR0aGlzLl9jaGFydFR5cGUgPSBDaGFydEhlbHBlci5mb3JtYXRDaGFydFR5cGUoY2hhcnQuQ2hhcnRUeXBlKTtcblx0XHRjb25zdCBvcGVyYXRpb25BdmFpbGFibGVNYXAgPSBDaGFydEhlbHBlci5nZXRPcGVyYXRpb25BdmFpbGFibGVNYXAoY2hhcnRDb250ZXh0LmdldE9iamVjdCgpLCB7XG5cdFx0XHRjb250ZXh0OiBjaGFydENvbnRleHRcblx0XHR9KTtcblx0XHRpZiAoT2JqZWN0LmtleXModGhpcy5jaGFydERlZmluaXRpb24/LmNvbW1hbmRBY3Rpb25zKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRPYmplY3Qua2V5cyh0aGlzLmNoYXJ0RGVmaW5pdGlvbj8uY29tbWFuZEFjdGlvbnMpLmZvckVhY2goKHNLZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRjb25zdCBhY3Rpb24gPSB0aGlzLmNoYXJ0RGVmaW5pdGlvbj8uY29tbWFuZEFjdGlvbnNbc0tleV07XG5cdFx0XHRcdGNvbnN0IGFjdGlvbkNvbnRleHQgPSB0aGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGFjdGlvbiwgbVNldHRpbmdzKTtcblx0XHRcdFx0Y29uc3QgZGF0YUZpZWxkQ29udGV4dCA9IGFjdGlvbi5hbm5vdGF0aW9uUGF0aCAmJiB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYWN0aW9uLmFubm90YXRpb25QYXRoKTtcblx0XHRcdFx0Y29uc3QgZGF0YUZpZWxkID0gZGF0YUZpZWxkQ29udGV4dCAmJiBkYXRhRmllbGRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRjb25zdCBjaGFydE9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IGVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlKG9wZXJhdGlvbkF2YWlsYWJsZU1hcCk7XG5cdFx0XHRcdHRoaXMucHVzaEFjdGlvbkNvbW1hbmQoYWN0aW9uQ29udGV4dCwgZGF0YUZpZWxkLCBjaGFydE9wZXJhdGlvbkF2YWlsYWJsZU1hcCwgYWN0aW9uKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLm1lYXN1cmVzID0gdGhpcy5nZXRDaGFydE1lYXN1cmVzKG9Qcm9wcywgYWdncmVnYXRpb25IZWxwZXIpO1xuXHRcdGNvbnN0IHByZXNlbnRhdGlvblBhdGggPSBDb21tb25IZWxwZXIuY3JlYXRlUHJlc2VudGF0aW9uUGF0aENvbnRleHQodGhpcy5tZXRhUGF0aCk7XG5cdFx0dGhpcy5fc29ydENvbmR0aW9ucyA9IENoYXJ0SGVscGVyLmdldFNvcnRDb25kaXRpb25zKFxuXHRcdFx0dGhpcy5tZXRhUGF0aCxcblx0XHRcdHRoaXMubWV0YVBhdGguZ2V0T2JqZWN0KCksXG5cdFx0XHRwcmVzZW50YXRpb25QYXRoLmdldFBhdGgoKSxcblx0XHRcdHRoaXMuY2hhcnREZWZpbml0aW9uLmFwcGx5U3VwcG9ydGVkXG5cdFx0KTtcblx0XHRjb25zdCBjaGFydEFjdGlvbnNDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGNoYXJ0Q29udGV4dC5nZXRQYXRoKCkgKyBcIi9BY3Rpb25zXCIsIGNoYXJ0LkFjdGlvbnMpO1xuXHRcdGNvbnN0IGNvbnRleHRQYXRoQ29udGV4dCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dCh0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKSwgdGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3QgY29udGV4dFBhdGhQYXRoID0gQ29tbW9uSGVscGVyLmdldENvbnRleHRQYXRoKHRoaXMuY29udGV4dFBhdGgsIHsgY29udGV4dDogY29udGV4dFBhdGhDb250ZXh0IH0pO1xuXHRcdGNvbnN0IHRhcmdldENvbGxlY3Rpb25QYXRoID0gQ29tbW9uSGVscGVyLmdldFRhcmdldENvbGxlY3Rpb24odGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3QgdGFyZ2V0Q29sbGVjdGlvblBhdGhDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHRhcmdldENvbGxlY3Rpb25QYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHR0aGlzLl9jdXN0b21EYXRhID0ge1xuXHRcdFx0dGFyZ2V0Q29sbGVjdGlvblBhdGg6IGNvbnRleHRQYXRoUGF0aCxcblx0XHRcdGVudGl0eVNldDpcblx0XHRcdFx0dHlwZW9mIHRhcmdldENvbGxlY3Rpb25QYXRoQ29udGV4dC5nZXRPYmplY3QoKSA9PT0gXCJzdHJpbmdcIlxuXHRcdFx0XHRcdD8gdGFyZ2V0Q29sbGVjdGlvblBhdGhDb250ZXh0LmdldE9iamVjdCgpXG5cdFx0XHRcdFx0OiB0YXJnZXRDb2xsZWN0aW9uUGF0aENvbnRleHQuZ2V0T2JqZWN0KFwiQHNhcHVpLm5hbWVcIiksXG5cdFx0XHRlbnRpdHlUeXBlOiBjb250ZXh0UGF0aFBhdGggKyBcIi9cIixcblx0XHRcdG9wZXJhdGlvbkF2YWlsYWJsZU1hcDogQ29tbW9uSGVscGVyLnN0cmluZ2lmeUN1c3RvbURhdGEoSlNPTi5wYXJzZShvcGVyYXRpb25BdmFpbGFibGVNYXApKSxcblx0XHRcdG11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zOlxuXHRcdFx0XHRBY3Rpb25IZWxwZXIuZ2V0TXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnMoY2hhcnQuQWN0aW9ucywge1xuXHRcdFx0XHRcdGNvbnRleHQ6IGNoYXJ0QWN0aW9uc0NvbnRleHRcblx0XHRcdFx0fSkgKyBcIlwiLFxuXHRcdFx0c2VnbWVudGVkQnV0dG9uSWQ6IGdlbmVyYXRlKFt0aGlzLmlkLCBcIlNlZ21lbnRlZEJ1dHRvblwiLCBcIlRlbXBsYXRlQ29udGVudFZpZXdcIl0pLFxuXHRcdFx0Y3VzdG9tQWdnOiBDb21tb25IZWxwZXIuc3RyaW5naWZ5Q3VzdG9tRGF0YSh0aGlzLmNoYXJ0RGVmaW5pdGlvbj8uY3VzdG9tQWdnKSxcblx0XHRcdHRyYW5zQWdnOiBDb21tb25IZWxwZXIuc3RyaW5naWZ5Q3VzdG9tRGF0YSh0aGlzLmNoYXJ0RGVmaW5pdGlvbj8udHJhbnNBZ2cpLFxuXHRcdFx0YXBwbHlTdXBwb3J0ZWQ6IENvbW1vbkhlbHBlci5zdHJpbmdpZnlDdXN0b21EYXRhKHRoaXMuY2hhcnREZWZpbml0aW9uPy5hcHBseVN1cHBvcnRlZCksXG5cdFx0XHR2aXpQcm9wZXJ0aWVzOiB0aGlzLnZpelByb3BlcnRpZXMsXG5cdFx0XHRkcmFmdFN1cHBvcnRlZDogdGhpcy5kcmFmdFN1cHBvcnRlZCxcblx0XHRcdG11bHRpVmlld3M6IHRoaXMuY2hhcnREZWZpbml0aW9uPy5tdWx0aVZpZXdzXG5cdFx0fTtcblx0XHR0aGlzLl9hY3Rpb25zID0gdGhpcy5jaGFydEFjdGlvbnMgPyB0aGlzLmdldFRvb2xiYXJBY3Rpb25zKGNoYXJ0Q29udGV4dCkgOiB4bWxgYDtcblx0fVxuXG5cdGNyZWF0ZUNoYXJ0RGVmaW5pdGlvbiA9IChvUHJvcHM6IGFueSwgb0NvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIG9Db250ZXh0T2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkgPT4ge1xuXHRcdGxldCBzVmlzdWFsaXphdGlvblBhdGggPSBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9Db250ZXh0T2JqZWN0UGF0aCk7XG5cdFx0aWYgKG9Qcm9wcy5tZXRhUGF0aD8uZ2V0T2JqZWN0KCkuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudFR5cGVcIikge1xuXHRcdFx0Y29uc3QgYVZpc3VhbGl6YXRpb25zID0gb1Byb3BzLm1ldGFQYXRoLmdldE9iamVjdCgpLlZpc3VhbGl6YXRpb25zO1xuXHRcdFx0c1Zpc3VhbGl6YXRpb25QYXRoID0gQ2hhcnRCdWlsZGluZ0Jsb2NrLmNoZWNrQ2hhcnRWaXN1YWxpemF0aW9uUGF0aChhVmlzdWFsaXphdGlvbnMsIHNWaXN1YWxpemF0aW9uUGF0aCk7XG5cdFx0fVxuXHRcdGNvbnN0IG9WaXN1YWxpemF0aW9uRGVmaW5pdGlvbiA9IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdHNWaXN1YWxpemF0aW9uUGF0aCEsXG5cdFx0XHRvUHJvcHMudXNlQ29uZGVuc2VkTGF5b3V0IGFzIGJvb2xlYW4sXG5cdFx0XHRvQ29udmVydGVyQ29udGV4dFxuXHRcdCk7XG5cdFx0b1Byb3BzLmNoYXJ0RGVmaW5pdGlvbiA9IG9WaXN1YWxpemF0aW9uRGVmaW5pdGlvbi52aXN1YWxpemF0aW9uc1swXSBhcyBDaGFydFZpc3VhbGl6YXRpb247XG5cdFx0dGhpcy5jaGFydERlZmluaXRpb24gPSBvVmlzdWFsaXphdGlvbkRlZmluaXRpb24udmlzdWFsaXphdGlvbnNbMF0gYXMgQ2hhcnRWaXN1YWxpemF0aW9uO1xuXHRcdHJldHVybiB0aGlzLmNoYXJ0RGVmaW5pdGlvbjtcblx0fTtcblxuXHRzdGF0aWMgY2hlY2tDaGFydFZpc3VhbGl6YXRpb25QYXRoID0gKGFWaXN1YWxpemF0aW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nPltdLCBzVmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCkgPT4ge1xuXHRcdGFWaXN1YWxpemF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvVmlzdWFsaXphdGlvbjogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuXHRcdFx0aWYgKG9WaXN1YWxpemF0aW9uLiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCIpID4gLTEpIHtcblx0XHRcdFx0c1Zpc3VhbGl6YXRpb25QYXRoID0gb1Zpc3VhbGl6YXRpb24uJEFubm90YXRpb25QYXRoO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBzVmlzdWFsaXphdGlvblBhdGg7XG5cdH07XG5cblx0Z2V0Q29udGVudElkKHNNYWNyb0lkOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gYCR7c01hY3JvSWR9LWNvbnRlbnRgO1xuXHR9XG5cblx0c3RhdGljIGdldEV4dHJhUGFyYW1zKHByb3BzOiBQcm9wZXJ0aWVzT2Y8Q2hhcnRCdWlsZGluZ0Jsb2NrPiwgdmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IGV4dHJhUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBvYmplY3Q+ID0ge307XG5cdFx0aWYgKHByb3BzLmFjdGlvbnMpIHtcblx0XHRcdE9iamVjdC52YWx1ZXMocHJvcHMuYWN0aW9ucyk/LmZvckVhY2goKGl0ZW0pID0+IHtcblx0XHRcdFx0cHJvcHMuYWN0aW9ucyA9IHsgLi4uKHByb3BzLmFjdGlvbnMgYXMgQWN0aW9uT3JBY3Rpb25Hcm91cCksIC4uLihpdGVtIGFzIEV4dGVuZGVkQWN0aW9uR3JvdXApLm1lbnVDb250ZW50QWN0aW9ucyB9O1xuXHRcdFx0XHRkZWxldGUgKGl0ZW0gYXMgRXh0ZW5kZWRBY3Rpb25Hcm91cCkubWVudUNvbnRlbnRBY3Rpb25zO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmICh2aXN1YWxpemF0aW9uUGF0aCkge1xuXHRcdFx0ZXh0cmFQYXJhbXNbdmlzdWFsaXphdGlvblBhdGhdID0ge1xuXHRcdFx0XHRhY3Rpb25zOiBwcm9wcy5hY3Rpb25zXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gZXh0cmFQYXJhbXM7XG5cdH1cblxuXHRjcmVhdGVCaW5kaW5nQ29udGV4dCA9IGZ1bmN0aW9uIChvRGF0YTogb2JqZWN0IHwgQmFzZUFjdGlvbltdIHwgQ3VzdG9tQWN0aW9uLCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IGAvJHt1aWQoKX1gO1xuXHRcdG1TZXR0aW5ncy5tb2RlbHMuY29udmVydGVyQ29udGV4dC5zZXRQcm9wZXJ0eShzQ29udGV4dFBhdGgsIG9EYXRhKTtcblx0XHRyZXR1cm4gbVNldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0LmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNDb250ZXh0UGF0aCk7XG5cdH07XG5cblx0Z2V0Q2hhcnRNZWFzdXJlcyA9IChvUHJvcHM6IGFueSwgYWdncmVnYXRpb25IZWxwZXI6IEFnZ3JlZ2F0aW9uSGVscGVyKTogVjRDb250ZXh0ID0+IHtcblx0XHRjb25zdCBhQ2hhcnRBbm5vdGF0aW9uUGF0aCA9IG9Qcm9wcy5jaGFydERlZmluaXRpb24uYW5ub3RhdGlvblBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdC8vIHRoaXMgaXMgcmVxdWlyZWQgYmVjYXVzZSBnZXRBYnNvbHV0ZVBhdGggaW4gY29udmVydGVyQ29udGV4dCByZXR1cm5zIFwiL1NhbGVzT3JkZXJNYW5hZ2UvX0l0ZW0vX0l0ZW0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLnYxLkNoYXJ0XCIgYXMgYW5ub3RhdGlvblBhdGhcblx0XHRjb25zdCBzQ2hhcnRBbm5vdGF0aW9uUGF0aCA9IGFDaGFydEFubm90YXRpb25QYXRoXG5cdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChpdGVtOiBvYmplY3QsIHBvczogbnVtYmVyKSB7XG5cdFx0XHRcdHJldHVybiBhQ2hhcnRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKGl0ZW0pID09IHBvcztcblx0XHRcdH0pXG5cdFx0XHQudG9TdHJpbmcoKVxuXHRcdFx0LnJlcGxhY2VBbGwoXCIsXCIsIFwiL1wiKTtcblx0XHRjb25zdCBvQ2hhcnQgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoXG5cdFx0XHR0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoc0NoYXJ0QW5ub3RhdGlvblBhdGgpLFxuXHRcdFx0dGhpcy5jb250ZXh0UGF0aFxuXHRcdCkudGFyZ2V0T2JqZWN0O1xuXHRcdGNvbnN0IGNoYXJ0Q29udGV4dCA9IENoYXJ0SGVscGVyLmdldFVpQ2hhcnQodGhpcy5tZXRhUGF0aCk7XG5cdFx0Y29uc3QgY2hhcnQgPSBjaGFydENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0Y29uc3QgYUFnZ3JlZ2F0ZWRQcm9wZXJ0eSA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFwiQWdncmVnYXRlZFByb3BlcnR5XCIpO1xuXHRcdGxldCBhTWVhc3VyZXM6IE1lYXN1cmVUeXBlW10gPSBbXTtcblx0XHRjb25zdCBzQW5ub1BhdGggPSBvUHJvcHMubWV0YVBhdGguZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGFBZ2dyZWdhdGVkUHJvcGVydGllcyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFwiQWdncmVnYXRlZFByb3BlcnRpZXNcIik7XG5cdFx0Y29uc3QgYUNoYXJ0TWVhc3VyZXMgPSBvQ2hhcnQuTWVhc3VyZXMgPyBvQ2hhcnQuTWVhc3VyZXMgOiBbXTtcblx0XHRjb25zdCBhQ2hhcnREeW5hbWljTWVhc3VyZXMgPSBvQ2hhcnQuRHluYW1pY01lYXN1cmVzID8gb0NoYXJ0LkR5bmFtaWNNZWFzdXJlcyA6IFtdO1xuXHRcdC8vY2hlY2sgaWYgdGhlcmUgYXJlIG1lYXN1cmVzIHBvaW50aW5nIHRvIGFnZ3JlZ2F0ZWRwcm9wZXJ0aWVzXG5cdFx0Y29uc3QgYVRyYW5zQWdnSW5NZWFzdXJlcyA9IGFBZ2dyZWdhdGVkUHJvcGVydGllc1swXVxuXHRcdFx0PyBhQWdncmVnYXRlZFByb3BlcnRpZXNbMF0uZmlsdGVyKGZ1bmN0aW9uIChvQWdncmVnYXRlZFByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcblx0XHRcdFx0XHRyZXR1cm4gYUNoYXJ0TWVhc3VyZXMuc29tZShmdW5jdGlvbiAob01lYXN1cmU6IE1lYXN1cmVUeXBlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0FnZ3JlZ2F0ZWRQcm9wZXJ0aWVzLk5hbWUgPT09IG9NZWFzdXJlLnZhbHVlO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0ICB9KVxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBzQW5ub1BhdGgucmVwbGFjZShcblx0XHRcdC9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuKENoYXJ0fFByZXNlbnRhdGlvblZhcmlhbnR8U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCkuKi8sXG5cdFx0XHRcIlwiXG5cdFx0KTtcblx0XHRjb25zdCBvVHJhbnNBZ2dyZWdhdGlvbnMgPSBvUHJvcHMuY2hhcnREZWZpbml0aW9uLnRyYW5zQWdnO1xuXHRcdGNvbnN0IG9DdXN0b21BZ2dyZWdhdGlvbnMgPSBvUHJvcHMuY2hhcnREZWZpbml0aW9uLmN1c3RvbUFnZztcblx0XHQvLyBpbnRpbWF0ZSB0aGUgdXNlciBpZiB0aGVyZSBpcyBBZ2dyZWdhdGVkcHJvcGVydHkgY29uZmlndXJlZCB3aXRoIG5vIERZbmFtaWNNZWFzdXJlcywgYnUgdGhlcmUgYXJlIG1lYXN1cmVzIHdpdGggQWdncmVnYXRlZFByb3BlcnRpZXNcblx0XHRpZiAoYUFnZ3JlZ2F0ZWRQcm9wZXJ0eS5sZW5ndGggPiAwICYmICFhQ2hhcnREeW5hbWljTWVhc3VyZXMgJiYgYVRyYW5zQWdnSW5NZWFzdXJlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRMb2cud2FybmluZyhcblx0XHRcdFx0XCJUaGUgdHJhbnNmb3JtYXRpb25hbCBhZ2dyZWdhdGUgbWVhc3VyZXMgYXJlIGNvbmZpZ3VyZWQgYXMgQ2hhcnQuTWVhc3VyZXMgYnV0IHNob3VsZCBiZSBjb25maWd1cmVkIGFzIENoYXJ0LkR5bmFtaWNNZWFzdXJlcyBpbnN0ZWFkLiBQbGVhc2UgY2hlY2sgdGhlIFNBUCBIZWxwIGRvY3VtZW50YXRpb24gYW5kIGNvcnJlY3QgdGhlIGNvbmZpZ3VyYXRpb24gYWNjb3JkaW5nbHkuXCJcblx0XHRcdCk7XG5cdFx0fVxuXHRcdGNvbnN0IGJJc0N1c3RvbUFnZ3JlZ2F0ZUlzTWVhc3VyZSA9IGFDaGFydE1lYXN1cmVzLnNvbWUoKG9DaGFydE1lYXN1cmU6IE1lYXN1cmVUeXBlKSA9PiB7XG5cdFx0XHRjb25zdCBvQ3VzdG9tQWdnTWVhc3VyZSA9IHRoaXMuZ2V0Q3VzdG9tQWdnTWVhc3VyZShvQ3VzdG9tQWdncmVnYXRpb25zLCBvQ2hhcnRNZWFzdXJlKTtcblx0XHRcdHJldHVybiAhIW9DdXN0b21BZ2dNZWFzdXJlO1xuXHRcdH0pO1xuXHRcdGlmIChhQWdncmVnYXRlZFByb3BlcnR5Lmxlbmd0aCA+IDAgJiYgIWFDaGFydER5bmFtaWNNZWFzdXJlcy5sZW5ndGggJiYgIWJJc0N1c3RvbUFnZ3JlZ2F0ZUlzTWVhc3VyZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGNvbmZpZ3VyZSBEeW5hbWljTWVhc3VyZXMgZm9yIHRoZSBjaGFydFwiKTtcblx0XHR9XG5cdFx0aWYgKGFBZ2dyZWdhdGVkUHJvcGVydHkubGVuZ3RoID4gMCkge1xuXHRcdFx0Zm9yIChjb25zdCBkeW5hbWljTWVhc3VyZSBvZiBhQ2hhcnREeW5hbWljTWVhc3VyZXMpIHtcblx0XHRcdFx0YU1lYXN1cmVzID0gdGhpcy5nZXREeW5hbWljTWVhc3VyZXMoYU1lYXN1cmVzLCBkeW5hbWljTWVhc3VyZSwgc0VudGl0eVNldFBhdGgsIG9DaGFydCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAoY29uc3QgY2hhcnRNZWFzdXJlIG9mIGFDaGFydE1lYXN1cmVzKSB7XG5cdFx0XHRjb25zdCBzS2V5ID0gY2hhcnRNZWFzdXJlLnZhbHVlO1xuXHRcdFx0Y29uc3Qgb0N1c3RvbUFnZ01lYXN1cmUgPSB0aGlzLmdldEN1c3RvbUFnZ01lYXN1cmUob0N1c3RvbUFnZ3JlZ2F0aW9ucywgY2hhcnRNZWFzdXJlKTtcblx0XHRcdGNvbnN0IG9NZWFzdXJlOiBNZWFzdXJlVHlwZSA9IHt9O1xuXHRcdFx0aWYgKG9DdXN0b21BZ2dNZWFzdXJlKSB7XG5cdFx0XHRcdGFNZWFzdXJlcyA9IHRoaXMuc2V0Q3VzdG9tQWdnTWVhc3VyZShhTWVhc3VyZXMsIG9NZWFzdXJlLCBvQ3VzdG9tQWdnTWVhc3VyZSwgc0tleSk7XG5cdFx0XHRcdC8vaWYgdGhlcmUgaXMgbmVpdGhlciBhZ2dyZWdhdGVkUHJvcGVydHkgbm9yIG1lYXN1cmVzIHBvaW50aW5nIHRvIGN1c3RvbUFnZ3JlZ2F0ZXMsIGJ1dCB3ZSBoYXZlIG5vcm1hbCBtZWFzdXJlcy4gTm93IGNoZWNrIGlmIHRoZXNlIG1lYXN1cmVzIGFyZSBwYXJ0IG9mIEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIE9ialxuXHRcdFx0fSBlbHNlIGlmIChhQWdncmVnYXRlZFByb3BlcnR5Lmxlbmd0aCA9PT0gMCAmJiBvVHJhbnNBZ2dyZWdhdGlvbnNbc0tleV0pIHtcblx0XHRcdFx0YU1lYXN1cmVzID0gdGhpcy5zZXRUcmFuc0FnZ01lYXN1cmUoYU1lYXN1cmVzLCBvTWVhc3VyZSwgb1RyYW5zQWdncmVnYXRpb25zLCBzS2V5KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuc2V0Q2hhcnRNZWFzdXJlQXR0cmlidXRlcyhjaGFydC5NZWFzdXJlQXR0cmlidXRlcywgc0VudGl0eVNldFBhdGgsIG9NZWFzdXJlKTtcblx0XHR9XG5cdFx0Y29uc3Qgb01lYXN1cmVzTW9kZWw6IEpTT05Nb2RlbCA9IG5ldyBKU09OTW9kZWwoYU1lYXN1cmVzKTtcblx0XHQob01lYXN1cmVzTW9kZWwgYXMgYW55KS4kJHZhbHVlQXNQcm9taXNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gb01lYXN1cmVzTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpIGFzIFY0Q29udGV4dDtcblx0fTtcblxuXHRzZXRDdXN0b21BZ2dNZWFzdXJlID0gKGFNZWFzdXJlczogTWVhc3VyZVR5cGVbXSwgb01lYXN1cmU6IE1lYXN1cmVUeXBlLCBvQ3VzdG9tQWdnTWVhc3VyZTogTWVhc3VyZVR5cGUsIHNLZXk6IHN0cmluZykgPT4ge1xuXHRcdGlmIChzS2V5LmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdExvZy5lcnJvcihcIiRleHBhbmQgaXMgbm90IHlldCBzdXBwb3J0ZWQuIE1lYXN1cmU6ICR7c0tleX0gZnJvbSBhbiBhc3NvY2lhdGlvbiBjYW5ub3QgYmUgdXNlZFwiKTtcblx0XHR9XG5cdFx0b01lYXN1cmUua2V5ID0gb0N1c3RvbUFnZ01lYXN1cmUudmFsdWU7XG5cdFx0b01lYXN1cmUucm9sZSA9IFwiYXhpczFcIjtcblxuXHRcdG9NZWFzdXJlLnByb3BlcnR5UGF0aCA9IG9DdXN0b21BZ2dNZWFzdXJlLnZhbHVlO1xuXHRcdGFNZWFzdXJlcy5wdXNoKG9NZWFzdXJlKTtcblx0XHRyZXR1cm4gYU1lYXN1cmVzO1xuXHR9O1xuXG5cdHNldFRyYW5zQWdnTWVhc3VyZSA9IChcblx0XHRhTWVhc3VyZXM6IE1lYXN1cmVUeXBlW10sXG5cdFx0b01lYXN1cmU6IE1lYXN1cmVUeXBlLFxuXHRcdG9UcmFuc0FnZ3JlZ2F0aW9uczogUmVjb3JkPHN0cmluZywgTWVhc3VyZVR5cGU+LFxuXHRcdHNLZXk6IHN0cmluZ1xuXHQpID0+IHtcblx0XHRjb25zdCBvVHJhbnNBZ2dNZWFzdXJlID0gb1RyYW5zQWdncmVnYXRpb25zW3NLZXldO1xuXHRcdG9NZWFzdXJlLmtleSA9IG9UcmFuc0FnZ01lYXN1cmUubmFtZTtcblx0XHRvTWVhc3VyZS5yb2xlID0gXCJheGlzMVwiO1xuXHRcdG9NZWFzdXJlLnByb3BlcnR5UGF0aCA9IHNLZXk7XG5cdFx0b01lYXN1cmUuYWdncmVnYXRpb25NZXRob2QgPSBvVHJhbnNBZ2dNZWFzdXJlLmFnZ3JlZ2F0aW9uTWV0aG9kO1xuXHRcdG9NZWFzdXJlLmxhYmVsID0gb1RyYW5zQWdnTWVhc3VyZS5sYWJlbCB8fCBvTWVhc3VyZS5sYWJlbDtcblx0XHRhTWVhc3VyZXMucHVzaChvTWVhc3VyZSk7XG5cdFx0cmV0dXJuIGFNZWFzdXJlcztcblx0fTtcblxuXHRnZXREeW5hbWljTWVhc3VyZXMgPSAoYU1lYXN1cmVzOiBNZWFzdXJlVHlwZVtdLCBkeW5hbWljTWVhc3VyZTogTWVhc3VyZVR5cGUsIHNFbnRpdHlTZXRQYXRoOiBzdHJpbmcsIG9DaGFydDogQ2hhcnQpOiBNZWFzdXJlVHlwZVtdID0+IHtcblx0XHRjb25zdCBzS2V5ID0gZHluYW1pY01lYXN1cmUudmFsdWUgfHwgXCJcIjtcblx0XHRjb25zdCBvQWdncmVnYXRlZFByb3BlcnR5ID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKFxuXHRcdFx0dGhpcy5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNFbnRpdHlTZXRQYXRoICsgc0tleSksXG5cdFx0XHR0aGlzLmNvbnRleHRQYXRoXG5cdFx0KS50YXJnZXRPYmplY3Q7XG5cdFx0aWYgKHNLZXkuaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0TG9nLmVycm9yKFwiJGV4cGFuZCBpcyBub3QgeWV0IHN1cHBvcnRlZC4gTWVhc3VyZTogJHtzS2V5fSBmcm9tIGFuIGFzc29jaWF0aW9uIGNhbm5vdCBiZSB1c2VkXCIpO1xuXHRcdFx0Ly8gY2hlY2sgaWYgdGhlIGFubm90YXRpb24gcGF0aCBpcyB3cm9uZ1xuXHRcdH0gZWxzZSBpZiAoIW9BZ2dyZWdhdGVkUHJvcGVydHkpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlBsZWFzZSBwcm92aWRlIHRoZSByaWdodCBBbm5vdGF0aW9uUGF0aCB0byB0aGUgRHluYW1pYyBNZWFzdXJlIFwiICsgZHluYW1pY01lYXN1cmUudmFsdWUpO1xuXHRcdFx0Ly8gY2hlY2sgaWYgdGhlIHBhdGggc3RhcnRzIHdpdGggQFxuXHRcdH0gZWxzZSBpZiAoZHluYW1pY01lYXN1cmUudmFsdWU/LnN0YXJ0c1dpdGgoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFnZ3JlZ2F0ZWRQcm9wZXJ0eVwiKSA9PT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIHByb3ZpZGUgdGhlIHJpZ2h0IEFubm90YXRpb25QYXRoIHRvIHRoZSBEeW5hbWljIE1lYXN1cmUgXCIgKyBkeW5hbWljTWVhc3VyZS52YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGNoZWNrIGlmIEFnZ3JlZ2F0ZWRQcm9wZXJ0eSBpcyBkZWZpbmVkIGluIGdpdmVuIER5bmFtaWNNZWFzdXJlXG5cdFx0XHRjb25zdCBvRHluYW1pY01lYXN1cmU6IE1lYXN1cmVUeXBlID0ge1xuXHRcdFx0XHRrZXk6IG9BZ2dyZWdhdGVkUHJvcGVydHkuTmFtZSxcblx0XHRcdFx0cm9sZTogXCJheGlzMVwiXG5cdFx0XHR9O1xuXHRcdFx0b0R5bmFtaWNNZWFzdXJlLnByb3BlcnR5UGF0aCA9IG9BZ2dyZWdhdGVkUHJvcGVydHkuQWdncmVnYXRhYmxlUHJvcGVydHkudmFsdWU7XG5cdFx0XHRvRHluYW1pY01lYXN1cmUuYWdncmVnYXRpb25NZXRob2QgPSBvQWdncmVnYXRlZFByb3BlcnR5LkFnZ3JlZ2F0aW9uTWV0aG9kO1xuXHRcdFx0b0R5bmFtaWNNZWFzdXJlLmxhYmVsID0gcmVzb2x2ZUJpbmRpbmdTdHJpbmcoXG5cdFx0XHRcdG9BZ2dyZWdhdGVkUHJvcGVydHkuYW5ub3RhdGlvbnMuX2Fubm90YXRpb25zW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCJdIHx8XG5cdFx0XHRcdFx0Z2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKFxuXHRcdFx0XHRcdFx0dGhpcy5tZXRhUGF0aFxuXHRcdFx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0XHQuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVNldFBhdGggKyBvRHluYW1pY01lYXN1cmUucHJvcGVydHlQYXRoICsgXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCIpLFxuXHRcdFx0XHRcdFx0dGhpcy5jb250ZXh0UGF0aFxuXHRcdFx0XHRcdCkudGFyZ2V0T2JqZWN0XG5cdFx0XHQpO1xuXHRcdFx0dGhpcy5zZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGVzKG9DaGFydC5NZWFzdXJlQXR0cmlidXRlcywgc0VudGl0eVNldFBhdGgsIG9EeW5hbWljTWVhc3VyZSk7XG5cdFx0XHRhTWVhc3VyZXMucHVzaChvRHluYW1pY01lYXN1cmUpO1xuXHRcdH1cblx0XHRyZXR1cm4gYU1lYXN1cmVzO1xuXHR9O1xuXG5cdGdldEN1c3RvbUFnZ01lYXN1cmUgPSAob0N1c3RvbUFnZ3JlZ2F0aW9uczogUmVjb3JkPHN0cmluZywgTWVhc3VyZVR5cGUgfCB1bmRlZmluZWQ+LCBvTWVhc3VyZTogTWVhc3VyZVR5cGUpID0+IHtcblx0XHRpZiAob01lYXN1cmUudmFsdWUgJiYgb0N1c3RvbUFnZ3JlZ2F0aW9uc1tvTWVhc3VyZS52YWx1ZV0pIHtcblx0XHRcdHJldHVybiBvTWVhc3VyZTtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH07XG5cblx0c2V0Q2hhcnRNZWFzdXJlQXR0cmlidXRlcyA9IChhTWVhc3VyZUF0dHJpYnV0ZXM6IENoYXJ0TWVhc3VyZUF0dHJpYnV0ZVR5cGVbXSwgc0VudGl0eVNldFBhdGg6IHN0cmluZywgb01lYXN1cmU6IE1lYXN1cmVUeXBlKSA9PiB7XG5cdFx0aWYgKGFNZWFzdXJlQXR0cmlidXRlcz8ubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKGNvbnN0IG1lYXN1cmVBdHRyaWJ1dGUgb2YgYU1lYXN1cmVBdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHRoaXMuX3NldENoYXJ0TWVhc3VyZUF0dHJpYnV0ZShtZWFzdXJlQXR0cmlidXRlLCBzRW50aXR5U2V0UGF0aCwgb01lYXN1cmUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRfc2V0Q2hhcnRNZWFzdXJlQXR0cmlidXRlID0gKG1lYXN1cmVBdHRyaWJ1dGU6IENoYXJ0TWVhc3VyZUF0dHJpYnV0ZVR5cGUsIHNFbnRpdHlTZXRQYXRoOiBzdHJpbmcsIG9NZWFzdXJlOiBNZWFzdXJlVHlwZSkgPT4ge1xuXHRcdGNvbnN0IHNQYXRoID0gbWVhc3VyZUF0dHJpYnV0ZS5EeW5hbWljTWVhc3VyZSA/IG1lYXN1cmVBdHRyaWJ1dGU/LkR5bmFtaWNNZWFzdXJlPy52YWx1ZSA6IG1lYXN1cmVBdHRyaWJ1dGU/Lk1lYXN1cmU/LnZhbHVlO1xuXHRcdGNvbnN0IGRhdGFQb2ludCA9IG1lYXN1cmVBdHRyaWJ1dGUuRGF0YVBvaW50ID8gbWVhc3VyZUF0dHJpYnV0ZT8uRGF0YVBvaW50Py52YWx1ZSA6IG51bGw7XG5cdFx0Y29uc3Qgcm9sZSA9IG1lYXN1cmVBdHRyaWJ1dGUuUm9sZTtcblx0XHRjb25zdCBvRGF0YVBvaW50ID1cblx0XHRcdGRhdGFQb2ludCAmJlxuXHRcdFx0Z2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMubWV0YVBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChzRW50aXR5U2V0UGF0aCArIGRhdGFQb2ludCksIHRoaXMuY29udGV4dFBhdGgpXG5cdFx0XHRcdC50YXJnZXRPYmplY3Q7XG5cdFx0aWYgKG9NZWFzdXJlLmtleSA9PT0gc1BhdGgpIHtcblx0XHRcdHRoaXMuc2V0TWVhc3VyZVJvbGUob01lYXN1cmUsIHJvbGUpO1xuXHRcdFx0Ly9zdGlsbCB0byBhZGQgZGF0YSBwb2ludCwgYnV0IFVJNSBDaGFydCBBUEkgaXMgbWlzc2luZ1xuXHRcdFx0dGhpcy5zZXRNZWFzdXJlRGF0YVBvaW50KG9NZWFzdXJlLCBvRGF0YVBvaW50KTtcblx0XHR9XG5cdH07XG5cblx0c2V0TWVhc3VyZURhdGFQb2ludCA9IChvTWVhc3VyZTogTWVhc3VyZVR5cGUsIG9EYXRhUG9pbnQ6IERhdGFQb2ludCB8IHVuZGVmaW5lZCkgPT4ge1xuXHRcdGlmIChvRGF0YVBvaW50ICYmIG9EYXRhUG9pbnQuVmFsdWUuJFBhdGggPT0gb01lYXN1cmUua2V5KSB7XG5cdFx0XHRvTWVhc3VyZS5kYXRhUG9pbnQgPSB0aGlzLmZvcm1hdEpTT05Ub1N0cmluZyhPRGF0YU1ldGFNb2RlbFV0aWwuY3JlYXRlRGF0YVBvaW50UHJvcGVydHkob0RhdGFQb2ludCkpIHx8IFwiXCI7XG5cdFx0fVxuXHR9O1xuXG5cdHNldE1lYXN1cmVSb2xlID0gKG9NZWFzdXJlOiBNZWFzdXJlVHlwZSwgcm9sZTogQ2hhcnRNZWFzdXJlUm9sZVR5cGUgfCB1bmRlZmluZWQpID0+IHtcblx0XHRpZiAocm9sZSkge1xuXHRcdFx0Y29uc3QgaW5kZXggPSAocm9sZSBhcyBhbnkpLiRFbnVtTWVtYmVyO1xuXHRcdFx0b01lYXN1cmUucm9sZSA9IG1NZWFzdXJlUm9sZVtpbmRleF07XG5cdFx0fVxuXHR9O1xuXG5cdGZvcm1hdEpTT05Ub1N0cmluZyA9IChvQ3JpdDogb2JqZWN0KSA9PiB7XG5cdFx0aWYgKCFvQ3JpdCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0bGV0IHNDcml0aWNhbGl0eSA9IEpTT04uc3RyaW5naWZ5KG9Dcml0KTtcblx0XHRzQ3JpdGljYWxpdHkgPSBzQ3JpdGljYWxpdHkucmVwbGFjZShuZXcgUmVnRXhwKFwie1wiLCBcImdcIiksIFwiXFxcXHtcIik7XG5cdFx0c0NyaXRpY2FsaXR5ID0gc0NyaXRpY2FsaXR5LnJlcGxhY2UobmV3IFJlZ0V4cChcIn1cIiwgXCJnXCIpLCBcIlxcXFx9XCIpO1xuXHRcdHJldHVybiBzQ3JpdGljYWxpdHk7XG5cdH07XG5cblx0Z2V0RGVwZW5kZW50cyA9IChjaGFydENvbnRleHQ6IFY0Q29udGV4dCkgPT4ge1xuXHRcdGlmICh0aGlzLl9jb21tYW5kQWN0aW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY29tbWFuZEFjdGlvbnMubWFwKChjb21tYW5kQWN0aW9uOiBDb21tYW5kQWN0aW9uKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldEFjdGlvbkNvbW1hbmQoY29tbWFuZEFjdGlvbiwgY2hhcnRDb250ZXh0KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYGA7XG5cdH07XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBvUHJvcHMgU3BlY2lmaWVzIHRoZSBjaGFydCBwcm9wZXJ0aWVzXG5cdCAqL1xuXHRjaGVja1BlcnNvbmFsaXphdGlvbkluQ2hhcnRQcm9wZXJ0aWVzID0gKG9Qcm9wczogYW55KSA9PiB7XG5cdFx0aWYgKG9Qcm9wcy5wZXJzb25hbGl6YXRpb24pIHtcblx0XHRcdGlmIChvUHJvcHMucGVyc29uYWxpemF0aW9uID09PSBcImZhbHNlXCIpIHtcblx0XHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2UgaWYgKG9Qcm9wcy5wZXJzb25hbGl6YXRpb24gPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRcdHRoaXMucGVyc29uYWxpemF0aW9uID0gT2JqZWN0LnZhbHVlcyhwZXJzb25hbGl6YXRpb25WYWx1ZXMpLmpvaW4oXCIsXCIpO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnZlcmlmeVZhbGlkUGVyc29ubGl6YXRpb24ob1Byb3BzLnBlcnNvbmFsaXphdGlvbikgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSBvUHJvcHMucGVyc29uYWxpemF0aW9uO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gcGVyc29uYWxpemF0aW9uXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBvciBgZmFsc2VgIGlmIHRoZSBwZXJzb25hbGl6YXRpb24gaXMgdmFsaWQgb3Igbm90IHZhbGlkXG5cdCAqL1xuXHR2ZXJpZnlWYWxpZFBlcnNvbmxpemF0aW9uID0gKHBlcnNvbmFsaXphdGlvbjogU3RyaW5nKSA9PiB7XG5cdFx0bGV0IHZhbGlkOiBCb29sZWFuID0gdHJ1ZTtcblx0XHRjb25zdCBzcGxpdEFycmF5ID0gcGVyc29uYWxpemF0aW9uLnNwbGl0KFwiLFwiKTtcblx0XHRjb25zdCBhY2NlcHRlZFZhbHVlczogc3RyaW5nW10gPSBPYmplY3QudmFsdWVzKHBlcnNvbmFsaXphdGlvblZhbHVlcyk7XG5cdFx0c3BsaXRBcnJheS5mb3JFYWNoKChhcnJheUVsZW1lbnQpID0+IHtcblx0XHRcdGlmICghYWNjZXB0ZWRWYWx1ZXMuaW5jbHVkZXMoYXJyYXlFbGVtZW50KSkge1xuXHRcdFx0XHR2YWxpZCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB2YWxpZDtcblx0fTtcblxuXHRnZXRWYXJpYW50TWFuYWdlbWVudCA9IChvUHJvcHM6IGFueSwgb0NoYXJ0RGVmaW5pdGlvbjogQ2hhcnRWaXN1YWxpemF0aW9uKSA9PiB7XG5cdFx0bGV0IHZhcmlhbnRNYW5hZ2VtZW50ID0gb1Byb3BzLnZhcmlhbnRNYW5hZ2VtZW50ID8gb1Byb3BzLnZhcmlhbnRNYW5hZ2VtZW50IDogb0NoYXJ0RGVmaW5pdGlvbi52YXJpYW50TWFuYWdlbWVudDtcblx0XHR2YXJpYW50TWFuYWdlbWVudCA9IHRoaXMucGVyc29uYWxpemF0aW9uID09PSB1bmRlZmluZWQgPyBcIk5vbmVcIiA6IHZhcmlhbnRNYW5hZ2VtZW50O1xuXHRcdHJldHVybiB2YXJpYW50TWFuYWdlbWVudDtcblx0fTtcblxuXHRjcmVhdGVWYXJpYW50TWFuYWdlbWVudCA9ICgpID0+IHtcblx0XHRjb25zdCBwZXJzb25hbGl6YXRpb24gPSB0aGlzLnBlcnNvbmFsaXphdGlvbjtcblx0XHRpZiAocGVyc29uYWxpemF0aW9uKSB7XG5cdFx0XHRjb25zdCB2YXJpYW50TWFuYWdlbWVudCA9IHRoaXMudmFyaWFudE1hbmFnZW1lbnQ7XG5cdFx0XHRpZiAodmFyaWFudE1hbmFnZW1lbnQgPT09IFwiQ29udHJvbFwiKSB7XG5cdFx0XHRcdHJldHVybiB4bWxgXG5cdFx0XHRcdFx0PG1kYzp2YXJpYW50PlxuXHRcdFx0XHRcdDx2YXJpYW50OlZhcmlhbnRNYW5hZ2VtZW50XG5cdFx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiVk1cIl0pfVwiXG5cdFx0XHRcdFx0XHRmb3I9XCIke3RoaXMuaWR9XCJcblx0XHRcdFx0XHRcdHNob3dTZXRBc0RlZmF1bHQ9XCIke3RydWV9XCJcblx0XHRcdFx0XHRcdHNlbGVjdD1cIiR7dGhpcy52YXJpYW50U2VsZWN0ZWR9XCJcblx0XHRcdFx0XHRcdGhlYWRlckxldmVsPVwiJHt0aGlzLmhlYWRlckxldmVsfVwiXG5cdFx0XHRcdFx0XHRzYXZlPVwiJHt0aGlzLnZhcmlhbnRTYXZlZH1cIlxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PC9tZGM6dmFyaWFudD5cblx0XHRcdGA7XG5cdFx0XHR9IGVsc2UgaWYgKHZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIk5vbmVcIiB8fCB2YXJpYW50TWFuYWdlbWVudCA9PT0gXCJQYWdlXCIpIHtcblx0XHRcdFx0cmV0dXJuIHhtbGBgO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIXBlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJWYXJpYW50IE1hbmFnZW1lbnQgY2Fubm90IGJlIGVuYWJsZWQgd2hlbiBwZXJzb25hbGl6YXRpb24gaXMgZGlzYWJsZWRcIik7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fTtcblxuXHRnZXRQZXJzaXN0ZW5jZVByb3ZpZGVyID0gKCkgPT4ge1xuXHRcdGlmICh0aGlzLnZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIk5vbmVcIikge1xuXHRcdFx0cmV0dXJuIHhtbGA8cDEzbjpQZXJzaXN0ZW5jZVByb3ZpZGVyIGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJQZXJzaXN0ZW5jZVByb3ZpZGVyXCJdKX1cIiBmb3I9XCIke3RoaXMuaWR9XCIvPmA7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fTtcblxuXHRwdXNoQWN0aW9uQ29tbWFuZCA9IChcblx0XHRhY3Rpb25Db250ZXh0OiBWNENvbnRleHQsXG5cdFx0ZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JBY3Rpb24gfCB1bmRlZmluZWQsXG5cdFx0Y2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXA6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHRhY3Rpb246IEJhc2VBY3Rpb24gfCB7IGhhbmRsZXJNb2R1bGU6IHN0cmluZzsgaGFuZGxlck1ldGhvZDogc3RyaW5nIH1cblx0KSA9PiB7XG5cdFx0aWYgKGRhdGFGaWVsZCkge1xuXHRcdFx0Y29uc3QgY29tbWFuZEFjdGlvbiA9IHtcblx0XHRcdFx0YWN0aW9uQ29udGV4dDogYWN0aW9uQ29udGV4dCxcblx0XHRcdFx0b25FeGVjdXRlQWN0aW9uOiBDaGFydEhlbHBlci5nZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uKHRoaXMuaWQsIGRhdGFGaWVsZCwgY2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXAgfHwgXCJcIiksXG5cdFx0XHRcdG9uRXhlY3V0ZUlCTjogQ29tbW9uSGVscGVyLmdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTihkYXRhRmllbGQsIGBcXCR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c31gLCBmYWxzZSksXG5cdFx0XHRcdG9uRXhlY3V0ZU1hbmlmZXN0OiBDb21tb25IZWxwZXIuYnVpbGRBY3Rpb25XcmFwcGVyKGFjdGlvbiBhcyB7IGhhbmRsZXJNb2R1bGU6IHN0cmluZzsgaGFuZGxlck1ldGhvZDogc3RyaW5nIH0sIHRoaXMpXG5cdFx0XHR9O1xuXHRcdFx0dGhpcy5fY29tbWFuZEFjdGlvbnMucHVzaChjb21tYW5kQWN0aW9uKTtcblx0XHR9XG5cdH07XG5cblx0Z2V0QWN0aW9uQ29tbWFuZCA9IChjb21tYW5kQWN0aW9uOiBDb21tYW5kQWN0aW9uLCBjaGFydENvbnRleHQ6IFY0Q29udGV4dCkgPT4ge1xuXHRcdGNvbnN0IG9BY3Rpb24gPSBjb21tYW5kQWN0aW9uLmFjdGlvbkNvbnRleHQ7XG5cdFx0Y29uc3QgYWN0aW9uID0gb0FjdGlvbi5nZXRPYmplY3QoKTtcblx0XHRjb25zdCBkYXRhRmllbGRDb250ZXh0ID0gYWN0aW9uLmFubm90YXRpb25QYXRoICYmIHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24uYW5ub3RhdGlvblBhdGgpO1xuXHRcdGNvbnN0IGRhdGFGaWVsZCA9IGRhdGFGaWVsZENvbnRleHQgJiYgZGF0YUZpZWxkQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRjb25zdCBkYXRhRmllbGRBY3Rpb24gPSB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYWN0aW9uLmFubm90YXRpb25QYXRoICsgXCIvQWN0aW9uXCIpO1xuXHRcdGNvbnN0IGFjdGlvbkNvbnRleHQgPSBDb21tb25IZWxwZXIuZ2V0QWN0aW9uQ29udGV4dChkYXRhRmllbGRBY3Rpb24pO1xuXHRcdGNvbnN0IGlzQm91bmRQYXRoID0gQ29tbW9uSGVscGVyLmdldFBhdGhUb0JvdW5kQWN0aW9uT3ZlcmxvYWQoZGF0YUZpZWxkQWN0aW9uKTtcblx0XHRjb25zdCBpc0JvdW5kID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGlzQm91bmRQYXRoKS5nZXRPYmplY3QoKTtcblx0XHRjb25zdCBjaGFydE9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IGVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlKFxuXHRcdFx0Q2hhcnRIZWxwZXIuZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKGNoYXJ0Q29udGV4dC5nZXRPYmplY3QoKSwge1xuXHRcdFx0XHRjb250ZXh0OiBjaGFydENvbnRleHRcblx0XHRcdH0pXG5cdFx0KTtcblx0XHRjb25zdCBpc0FjdGlvbkVuYWJsZWQgPSBhY3Rpb24uZW5hYmxlZFxuXHRcdFx0PyBhY3Rpb24uZW5hYmxlZFxuXHRcdFx0OiBDaGFydEhlbHBlci5pc0RhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbkVuYWJsZWQoXG5cdFx0XHRcdFx0aXNCb3VuZCAmJiBpc0JvdW5kLiRJc0JvdW5kLFxuXHRcdFx0XHRcdGRhdGFGaWVsZC5BY3Rpb24sXG5cdFx0XHRcdFx0dGhpcy5jb250ZXh0UGF0aCxcblx0XHRcdFx0XHRjaGFydE9wZXJhdGlvbkF2YWlsYWJsZU1hcCB8fCBcIlwiLFxuXHRcdFx0XHRcdGFjdGlvbi5lbmFibGVPblNlbGVjdCB8fCBcIlwiXG5cdFx0XHQgICk7XG5cdFx0bGV0IGlzSUJORW5hYmxlZDtcblx0XHRpZiAoYWN0aW9uLmVuYWJsZWQpIHtcblx0XHRcdGlzSUJORW5hYmxlZCA9IGFjdGlvbi5lbmFibGVkO1xuXHRcdH0gZWxzZSBpZiAoZGF0YUZpZWxkLlJlcXVpcmVzQ29udGV4dCkge1xuXHRcdFx0aXNJQk5FbmFibGVkID0gXCJ7PSAle2ludGVybmFsPm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c30gPj0gMX1cIjtcblx0XHR9XG5cdFx0Y29uc3QgYWN0aW9uQ29tbWFuZCA9IHhtbGA8aW50ZXJuYWxNYWNybzpBY3Rpb25Db21tYW5kXG5cdFx0YWN0aW9uPVwiJHthY3Rpb259XCJcblx0XHRvbkV4ZWN1dGVBY3Rpb249XCIke2NvbW1hbmRBY3Rpb24ub25FeGVjdXRlQWN0aW9ufVwiXG5cdFx0b25FeGVjdXRlSUJOPVwiJHtjb21tYW5kQWN0aW9uLm9uRXhlY3V0ZUlCTn1cIlxuXHRcdG9uRXhlY3V0ZU1hbmlmZXN0PVwiJHtjb21tYW5kQWN0aW9uLm9uRXhlY3V0ZU1hbmlmZXN0fVwiXG5cdFx0aXNJQk5FbmFibGVkPVwiJHtpc0lCTkVuYWJsZWR9XCJcblx0XHRpc0FjdGlvbkVuYWJsZWQ9XCIke2lzQWN0aW9uRW5hYmxlZH1cIlxuXHRcdHZpc2libGU9XCIke3RoaXMuZ2V0VmlzaWJsZShkYXRhRmllbGRDb250ZXh0KX1cIlxuXHQvPmA7XG5cdFx0aWYgKFxuXHRcdFx0YWN0aW9uLnR5cGUgPT0gXCJGb3JBY3Rpb25cIiAmJlxuXHRcdFx0KCFpc0JvdW5kIHx8IGlzQm91bmQuSXNCb3VuZCAhPT0gdHJ1ZSB8fCBhY3Rpb25Db250ZXh0W1wiQE9yZy5PRGF0YS5Db3JlLlYxLk9wZXJhdGlvbkF2YWlsYWJsZVwiXSAhPT0gZmFsc2UpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gYWN0aW9uQ29tbWFuZDtcblx0XHR9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09IFwiRm9yQWN0aW9uXCIpIHtcblx0XHRcdHJldHVybiB4bWxgYDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGFjdGlvbkNvbW1hbmQ7XG5cdFx0fVxuXHR9O1xuXG5cdGdldEl0ZW1zID0gKGNoYXJ0Q29udGV4dDogVjRDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgY2hhcnQgPSBjaGFydENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0Y29uc3QgZGltZW5zaW9uczogc3RyaW5nW10gPSBbXTtcblx0XHRjb25zdCBtZWFzdXJlczogc3RyaW5nW10gPSBbXTtcblx0XHRpZiAoY2hhcnQuRGltZW5zaW9ucykge1xuXHRcdFx0Q2hhcnRIZWxwZXIuZm9ybWF0RGltZW5zaW9ucyhjaGFydENvbnRleHQpXG5cdFx0XHRcdC5nZXRPYmplY3QoKVxuXHRcdFx0XHQuZm9yRWFjaCgoZGltZW5zaW9uOiBEaW1lbnNpb25UeXBlKSA9PiB7XG5cdFx0XHRcdFx0ZGltZW5zaW9uLmlkID0gZ2VuZXJhdGUoW3RoaXMuaWQsIFwiZGltZW5zaW9uXCIsIGRpbWVuc2lvbi5rZXldKTtcblx0XHRcdFx0XHRkaW1lbnNpb25zLnB1c2goXG5cdFx0XHRcdFx0XHR0aGlzLmdldEl0ZW0oXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZDogZGltZW5zaW9uLmlkLFxuXHRcdFx0XHRcdFx0XHRcdGtleTogZGltZW5zaW9uLmtleSxcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogZGltZW5zaW9uLmxhYmVsLFxuXHRcdFx0XHRcdFx0XHRcdHJvbGU6IGRpbWVuc2lvbi5yb2xlXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFwiX2ZlX2dyb3VwYWJsZV9cIixcblx0XHRcdFx0XHRcdFx0XCJncm91cGFibGVcIlxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAodGhpcy5tZWFzdXJlcykge1xuXHRcdFx0Q2hhcnRIZWxwZXIuZm9ybWF0TWVhc3VyZXModGhpcy5tZWFzdXJlcykuZm9yRWFjaCgobWVhc3VyZTogTWVhc3VyZVR5cGUpID0+IHtcblx0XHRcdFx0bWVhc3VyZS5pZCA9IGdlbmVyYXRlKFt0aGlzLmlkLCBcIm1lYXN1cmVcIiwgbWVhc3VyZS5rZXldKTtcblx0XHRcdFx0bWVhc3VyZXMucHVzaChcblx0XHRcdFx0XHR0aGlzLmdldEl0ZW0oXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlkOiBtZWFzdXJlLmlkLFxuXHRcdFx0XHRcdFx0XHRrZXk6IG1lYXN1cmUua2V5LFxuXHRcdFx0XHRcdFx0XHRsYWJlbDogbWVhc3VyZS5sYWJlbCxcblx0XHRcdFx0XHRcdFx0cm9sZTogbWVhc3VyZS5yb2xlXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XCJfZmVfYWdncmVnYXRhYmxlX1wiLFxuXHRcdFx0XHRcdFx0XCJhZ2dyZWdhdGFibGVcIlxuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAoZGltZW5zaW9ucy5sZW5ndGggJiYgbWVhc3VyZXMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZGltZW5zaW9ucy5jb25jYXQobWVhc3VyZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYGA7XG5cdH07XG5cblx0Z2V0SXRlbSA9IChpdGVtOiBNZWFzdXJlVHlwZSB8IERpbWVuc2lvblR5cGUsIHByZWZpeDogc3RyaW5nLCB0eXBlOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4geG1sYDxjaGFydDpJdGVtXG5cdFx0XHRpZD1cIiR7aXRlbS5pZH1cIlxuXHRcdFx0bmFtZT1cIiR7cHJlZml4ICsgaXRlbS5rZXl9XCJcblx0XHRcdHR5cGU9XCIke3R5cGV9XCJcblx0XHRcdGxhYmVsPVwiJHtyZXNvbHZlQmluZGluZ1N0cmluZyhpdGVtLmxhYmVsIGFzIHN0cmluZywgXCJzdHJpbmdcIil9XCJcblx0XHRcdHJvbGU9XCIke2l0ZW0ucm9sZX1cIlxuXHRcdC8+YDtcblx0fTtcblxuXHRnZXRUb29sYmFyQWN0aW9ucyA9IChjaGFydENvbnRleHQ6IFY0Q29udGV4dCkgPT4ge1xuXHRcdGNvbnN0IGFBY3Rpb25zID0gdGhpcy5nZXRBY3Rpb25zKGNoYXJ0Q29udGV4dCk7XG5cdFx0aWYgKHRoaXMub25TZWdtZW50ZWRCdXR0b25QcmVzc2VkKSB7XG5cdFx0XHRhQWN0aW9ucy5wdXNoKHRoaXMuZ2V0U2VnbWVudGVkQnV0dG9uKCkpO1xuXHRcdH1cblx0XHRpZiAoYUFjdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIHhtbGA8bWRjOmFjdGlvbnM+JHthQWN0aW9uc308L21kYzphY3Rpb25zPmA7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fTtcblxuXHRnZXRBY3Rpb25zID0gKGNoYXJ0Q29udGV4dDogVjRDb250ZXh0KSA9PiB7XG5cdFx0bGV0IGFjdGlvbnMgPSB0aGlzLmNoYXJ0QWN0aW9ucz8uZ2V0T2JqZWN0KCk7XG5cdFx0YWN0aW9ucyA9IHRoaXMucmVtb3ZlTWVudUl0ZW1zKGFjdGlvbnMpO1xuXHRcdHJldHVybiBhY3Rpb25zLm1hcCgoYWN0aW9uOiBDdXN0b21BbmRBY3Rpb24pID0+IHtcblx0XHRcdGlmIChhY3Rpb24uYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdFx0Ly8gTG9hZCBhbm5vdGF0aW9uIGJhc2VkIGFjdGlvbnNcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0QWN0aW9uKGFjdGlvbiwgY2hhcnRDb250ZXh0LCBmYWxzZSk7XG5cdFx0XHR9IGVsc2UgaWYgKGFjdGlvbi5oYXNPd25Qcm9wZXJ0eShcIm5vV3JhcFwiKSkge1xuXHRcdFx0XHQvLyBMb2FkIFhNTCBvciBtYW5pZmVzdCBiYXNlZCBhY3Rpb25zIC8gYWN0aW9uIGdyb3Vwc1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRDdXN0b21BY3Rpb25zKGFjdGlvbiwgY2hhcnRDb250ZXh0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fTtcblxuXHRyZW1vdmVNZW51SXRlbXMgPSAoYWN0aW9uczogQmFzZUFjdGlvbltdKSA9PiB7XG5cdFx0Ly8gSWYgYWN0aW9uIGlzIGFscmVhZHkgcGFydCBvZiBtZW51IGluIGFjdGlvbiBncm91cCwgdGhlbiBpdCB3aWxsXG5cdFx0Ly8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBtYWluIGFjdGlvbnMgbGlzdFxuXHRcdGZvciAoY29uc3QgYWN0aW9uIG9mIGFjdGlvbnMpIHtcblx0XHRcdGlmIChhY3Rpb24ubWVudSkge1xuXHRcdFx0XHRhY3Rpb24ubWVudS5mb3JFYWNoKChpdGVtKSA9PiB7XG5cdFx0XHRcdFx0aWYgKGFjdGlvbnMuaW5kZXhPZihpdGVtIGFzIEJhc2VBY3Rpb24pICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0YWN0aW9ucy5zcGxpY2UoYWN0aW9ucy5pbmRleE9mKGl0ZW0gYXMgQmFzZUFjdGlvbiksIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBhY3Rpb25zO1xuXHR9O1xuXG5cdGdldEN1c3RvbUFjdGlvbnMgPSAoYWN0aW9uOiBDdXN0b21BbmRBY3Rpb24sIGNoYXJ0Q29udGV4dDogVjRDb250ZXh0KSA9PiB7XG5cdFx0bGV0IGFjdGlvbkVuYWJsZWQgPSBhY3Rpb24uZW5hYmxlZCBhcyBzdHJpbmcgfCBib29sZWFuO1xuXHRcdGlmICgoYWN0aW9uLnJlcXVpcmVzU2VsZWN0aW9uID8/IGZhbHNlKSAmJiBhY3Rpb24uZW5hYmxlZCA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdGFjdGlvbkVuYWJsZWQgPSBcIns9ICV7aW50ZXJuYWw+bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzfSA+PSAxfVwiO1xuXHRcdH1cblx0XHRpZiAoYWN0aW9uLnR5cGUgPT09IFwiRGVmYXVsdFwiKSB7XG5cdFx0XHQvLyBMb2FkIFhNTCBvciBtYW5pZmVzdCBiYXNlZCB0b29sYmFyIGFjdGlvbnNcblx0XHRcdHJldHVybiB0aGlzLmdldEFjdGlvblRvb2xiYXJBY3Rpb24oXG5cdFx0XHRcdGFjdGlvbixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBnZW5lcmF0ZShbdGhpcy5pZCwgYWN0aW9uLmlkXSksXG5cdFx0XHRcdFx0dW5pdHRlc3RpZDogXCJEYXRhRmllbGRGb3JBY3Rpb25CdXR0b25BY3Rpb25cIixcblx0XHRcdFx0XHRsYWJlbDogYWN0aW9uLnRleHQgPyBhY3Rpb24udGV4dCA6IFwiXCIsXG5cdFx0XHRcdFx0YXJpYUhhc1BvcHVwOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0cHJlc3M6IGFjdGlvbi5wcmVzcyA/IGFjdGlvbi5wcmVzcyA6IFwiXCIsXG5cdFx0XHRcdFx0ZW5hYmxlZDogYWN0aW9uRW5hYmxlZCxcblx0XHRcdFx0XHR2aXNpYmxlOiBhY3Rpb24udmlzaWJsZSA/IGFjdGlvbi52aXNpYmxlIDogZmFsc2Vcblx0XHRcdFx0fSxcblx0XHRcdFx0ZmFsc2Vcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gXCJNZW51XCIpIHtcblx0XHRcdC8vIExvYWQgYWN0aW9uIGdyb3VwcyAoTWVudSlcblx0XHRcdHJldHVybiB0aGlzLmdldEFjdGlvblRvb2xiYXJNZW51QWN0aW9uKFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IGdlbmVyYXRlKFt0aGlzLmlkLCBhY3Rpb24uaWRdKSxcblx0XHRcdFx0XHR0ZXh0OiBhY3Rpb24udGV4dCxcblx0XHRcdFx0XHR2aXNpYmxlOiBhY3Rpb24udmlzaWJsZSxcblx0XHRcdFx0XHRlbmFibGVkOiBhY3Rpb25FbmFibGVkLFxuXHRcdFx0XHRcdHVzZURlZmF1bHRBY3Rpb25Pbmx5OiBEZWZhdWx0QWN0aW9uSGFuZGxlci5nZXRVc2VEZWZhdWx0QWN0aW9uT25seShhY3Rpb24pLFxuXHRcdFx0XHRcdGJ1dHRvbk1vZGU6IERlZmF1bHRBY3Rpb25IYW5kbGVyLmdldEJ1dHRvbk1vZGUoYWN0aW9uKSxcblx0XHRcdFx0XHRkZWZhdWx0QWN0aW9uOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0YWN0aW9uczogYWN0aW9uXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNoYXJ0Q29udGV4dFxuXHRcdFx0KTtcblx0XHR9XG5cdH07XG5cblx0Z2V0TWVudUl0ZW1Gcm9tTWVudSA9IChtZW51SXRlbUFjdGlvbjogQ3VzdG9tQWN0aW9uICYgeyBoYW5kbGVyTW9kdWxlOiBzdHJpbmc7IGhhbmRsZXJNZXRob2Q6IHN0cmluZyB9LCBjaGFydENvbnRleHQ6IFY0Q29udGV4dCkgPT4ge1xuXHRcdGxldCBwcmVzc0hhbmRsZXI7XG5cdFx0aWYgKG1lbnVJdGVtQWN0aW9uLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHQvL0Fubm90YXRpb24gYmFzZWQgYWN0aW9uIGlzIHBhc3NlZCBhcyBtZW51IGl0ZW0gZm9yIG1lbnUgYnV0dG9uXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRBY3Rpb24obWVudUl0ZW1BY3Rpb24sIGNoYXJ0Q29udGV4dCwgdHJ1ZSk7XG5cdFx0fVxuXHRcdGlmIChtZW51SXRlbUFjdGlvbi5jb21tYW5kKSB7XG5cdFx0XHRwcmVzc0hhbmRsZXIgPSBcImNtZDpcIiArIG1lbnVJdGVtQWN0aW9uLmNvbW1hbmQ7XG5cdFx0fSBlbHNlIGlmIChtZW51SXRlbUFjdGlvbi5ub1dyYXAgPz8gZmFsc2UpIHtcblx0XHRcdHByZXNzSGFuZGxlciA9IG1lbnVJdGVtQWN0aW9uLnByZXNzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcmVzc0hhbmRsZXIgPSBDb21tb25IZWxwZXIuYnVpbGRBY3Rpb25XcmFwcGVyKG1lbnVJdGVtQWN0aW9uLCB0aGlzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHhtbGA8TWVudUl0ZW1cblx0XHRjb3JlOnJlcXVpcmU9XCJ7RlBNOiAnc2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXInfVwiXG5cdFx0dGV4dD1cIiR7bWVudUl0ZW1BY3Rpb24udGV4dH1cIlxuXHRcdHByZXNzPVwiJHtwcmVzc0hhbmRsZXJ9XCJcblx0XHR2aXNpYmxlPVwiJHttZW51SXRlbUFjdGlvbi52aXNpYmxlfVwiXG5cdFx0ZW5hYmxlZD1cIiR7bWVudUl0ZW1BY3Rpb24uZW5hYmxlZH1cIlxuXHQvPmA7XG5cdH07XG5cblx0Z2V0QWN0aW9uVG9vbGJhck1lbnVBY3Rpb24gPSAocHJvcHM6IEN1c3RvbVRvb2xiYXJNZW51QWN0aW9uLCBjaGFydENvbnRleHQ6IFY0Q29udGV4dCkgPT4ge1xuXHRcdGNvbnN0IGFNZW51SXRlbXMgPSBwcm9wcy5hY3Rpb25zPy5tZW51Py5tYXAoKGFjdGlvbjogQ3VzdG9tQWN0aW9uICYgeyBoYW5kbGVyTW9kdWxlOiBzdHJpbmc7IGhhbmRsZXJNZXRob2Q6IHN0cmluZyB9KSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRNZW51SXRlbUZyb21NZW51KGFjdGlvbiwgY2hhcnRDb250ZXh0KTtcblx0XHR9KTtcblx0XHRyZXR1cm4geG1sYDxtZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPlxuXHRcdFx0PE1lbnVCdXR0b25cblx0XHRcdHRleHQ9XCIke3Byb3BzLnRleHR9XCJcblx0XHRcdHR5cGU9XCJUcmFuc3BhcmVudFwiXG5cdFx0XHRtZW51UG9zaXRpb249XCJCZWdpbkJvdHRvbVwiXG5cdFx0XHRpZD1cIiR7cHJvcHMuaWR9XCJcblx0XHRcdHZpc2libGU9XCIke3Byb3BzLnZpc2libGV9XCJcblx0XHRcdGVuYWJsZWQ9XCIke3Byb3BzLmVuYWJsZWR9XCJcblx0XHRcdHVzZURlZmF1bHRBY3Rpb25Pbmx5PVwiJHtwcm9wcy51c2VEZWZhdWx0QWN0aW9uT25seX1cIlxuXHRcdFx0YnV0dG9uTW9kZT1cIiR7cHJvcHMuYnV0dG9uTW9kZX1cIlxuXHRcdFx0ZGVmYXVsdEFjdGlvbj1cIiR7cHJvcHMuZGVmYXVsdEFjdGlvbn1cIlxuXHRcdFx0PlxuXHRcdFx0XHQ8bWVudT5cblx0XHRcdFx0XHQ8TWVudT5cblx0XHRcdFx0XHRcdCR7YU1lbnVJdGVtc31cblx0XHRcdFx0XHQ8L01lbnU+XG5cdFx0XHRcdDwvbWVudT5cblx0XHRcdDwvTWVudUJ1dHRvbj5cblx0XHQ8L21kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24+YDtcblx0fTtcblxuXHRnZXRBY3Rpb24gPSAoYWN0aW9uOiBCYXNlQWN0aW9uLCBjaGFydENvbnRleHQ6IFY0Q29udGV4dCwgaXNNZW51SXRlbTogYm9vbGVhbikgPT4ge1xuXHRcdGNvbnN0IGRhdGFGaWVsZENvbnRleHQgPSB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYWN0aW9uLmFubm90YXRpb25QYXRoIHx8IFwiXCIpIGFzIFY0Q29udGV4dDtcblx0XHRpZiAoYWN0aW9uLnR5cGUgPT09IFwiRm9yTmF2aWdhdGlvblwiKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXROYXZpZ2F0aW9uQWN0aW9ucyhhY3Rpb24sIGRhdGFGaWVsZENvbnRleHQsIGlzTWVudUl0ZW0pO1xuXHRcdH0gZWxzZSBpZiAoYWN0aW9uLnR5cGUgPT09IFwiRm9yQWN0aW9uXCIpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldEFubm90YXRpb25BY3Rpb25zKGNoYXJ0Q29udGV4dCwgYWN0aW9uLCBkYXRhRmllbGRDb250ZXh0LCBpc01lbnVJdGVtKTtcblx0XHR9XG5cdFx0cmV0dXJuIHhtbGBgO1xuXHR9O1xuXG5cdGdldE5hdmlnYXRpb25BY3Rpb25zID0gKGFjdGlvbjogQmFzZUFjdGlvbiwgZGF0YUZpZWxkQ29udGV4dDogVjRDb250ZXh0LCBpc01lbnVJdGVtOiBib29sZWFuKSA9PiB7XG5cdFx0bGV0IGJFbmFibGVkID0gXCJ0cnVlXCI7XG5cdFx0Y29uc3QgZGF0YUZpZWxkID0gZGF0YUZpZWxkQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRpZiAoYWN0aW9uLmVuYWJsZWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0YkVuYWJsZWQgPSBhY3Rpb24uZW5hYmxlZDtcblx0XHR9IGVsc2UgaWYgKGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQpIHtcblx0XHRcdGJFbmFibGVkID0gXCJ7PSAle2ludGVybmFsPm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c30gPj0gMX1cIjtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QWN0aW9uVG9vbGJhckFjdGlvbihcblx0XHRcdGFjdGlvbixcblx0XHRcdHtcblx0XHRcdFx0aWQ6IHVuZGVmaW5lZCxcblx0XHRcdFx0dW5pdHRlc3RpZDogXCJEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25CdXR0b25BY3Rpb25cIixcblx0XHRcdFx0bGFiZWw6IGRhdGFGaWVsZC5MYWJlbCxcblx0XHRcdFx0YXJpYUhhc1BvcHVwOiB1bmRlZmluZWQsXG5cdFx0XHRcdHByZXNzOiBDb21tb25IZWxwZXIuZ2V0UHJlc3NIYW5kbGVyRm9yRGF0YUZpZWxkRm9ySUJOKGRhdGFGaWVsZCwgYFxcJHtpbnRlcm5hbD5zZWxlY3RlZENvbnRleHRzfWAsIGZhbHNlKSxcblx0XHRcdFx0ZW5hYmxlZDogYkVuYWJsZWQsXG5cdFx0XHRcdHZpc2libGU6IHRoaXMuZ2V0VmlzaWJsZShkYXRhRmllbGRDb250ZXh0KVxuXHRcdFx0fSxcblx0XHRcdGlzTWVudUl0ZW1cblx0XHQpO1xuXHR9O1xuXG5cdGdldEFubm90YXRpb25BY3Rpb25zID0gKGNoYXJ0Q29udGV4dDogVjRDb250ZXh0LCBhY3Rpb246IEJhc2VBY3Rpb24sIGRhdGFGaWVsZENvbnRleHQ6IFY0Q29udGV4dCwgaXNNZW51SXRlbTogYm9vbGVhbikgPT4ge1xuXHRcdGNvbnN0IGRhdGFGaWVsZEFjdGlvbiA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24uYW5ub3RhdGlvblBhdGggKyBcIi9BY3Rpb25cIik7XG5cdFx0Y29uc3QgYWN0aW9uQ29udGV4dCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChDb21tb25IZWxwZXIuZ2V0QWN0aW9uQ29udGV4dChkYXRhRmllbGRBY3Rpb24pKTtcblx0XHRjb25zdCBhY3Rpb25PYmplY3QgPSBhY3Rpb25Db250ZXh0LmdldE9iamVjdCgpO1xuXHRcdGNvbnN0IGlzQm91bmRQYXRoID0gQ29tbW9uSGVscGVyLmdldFBhdGhUb0JvdW5kQWN0aW9uT3ZlcmxvYWQoZGF0YUZpZWxkQWN0aW9uKTtcblx0XHRjb25zdCBpc0JvdW5kID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGlzQm91bmRQYXRoKS5nZXRPYmplY3QoKTtcblx0XHRjb25zdCBkYXRhRmllbGQgPSBkYXRhRmllbGRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdGlmICghaXNCb3VuZCB8fCBpc0JvdW5kLiRJc0JvdW5kICE9PSB0cnVlIHx8IGFjdGlvbk9iamVjdFtcIkBPcmcuT0RhdGEuQ29yZS5WMS5PcGVyYXRpb25BdmFpbGFibGVcIl0gIT09IGZhbHNlKSB7XG5cdFx0XHRjb25zdCBiRW5hYmxlZCA9IHRoaXMuZ2V0QW5ub3RhdGlvbkFjdGlvbnNFbmFibGVkKGFjdGlvbiwgaXNCb3VuZCwgZGF0YUZpZWxkLCBjaGFydENvbnRleHQpO1xuXHRcdFx0Y29uc3QgYXJpYUhhc1BvcHVwID0gQ29tbW9uSGVscGVyLmlzRGlhbG9nKGFjdGlvbk9iamVjdCwgeyBjb250ZXh0OiBhY3Rpb25Db250ZXh0IH0pO1xuXHRcdFx0Y29uc3QgY2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXAgPVxuXHRcdFx0XHRlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZShcblx0XHRcdFx0XHRDaGFydEhlbHBlci5nZXRPcGVyYXRpb25BdmFpbGFibGVNYXAoY2hhcnRDb250ZXh0LmdldE9iamVjdCgpLCB7XG5cdFx0XHRcdFx0XHRjb250ZXh0OiBjaGFydENvbnRleHRcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpIHx8IFwiXCI7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRBY3Rpb25Ub29sYmFyQWN0aW9uKFxuXHRcdFx0XHRhY3Rpb24sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogZ2VuZXJhdGUoW3RoaXMuaWQsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhkYXRhRmllbGRDb250ZXh0KV0pLFxuXHRcdFx0XHRcdHVuaXR0ZXN0aWQ6IFwiRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uQWN0aW9uXCIsXG5cdFx0XHRcdFx0bGFiZWw6IGRhdGFGaWVsZC5MYWJlbCxcblx0XHRcdFx0XHRhcmlhSGFzUG9wdXA6IGFyaWFIYXNQb3B1cCxcblx0XHRcdFx0XHRwcmVzczogQ2hhcnRIZWxwZXIuZ2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbih0aGlzLmlkLCBkYXRhRmllbGQsIGNoYXJ0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRcdFx0XHRlbmFibGVkOiBiRW5hYmxlZCxcblx0XHRcdFx0XHR2aXNpYmxlOiB0aGlzLmdldFZpc2libGUoZGF0YUZpZWxkQ29udGV4dClcblx0XHRcdFx0fSxcblx0XHRcdFx0aXNNZW51SXRlbVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHhtbGBgO1xuXHR9O1xuXG5cdGdldEFjdGlvblRvb2xiYXJBY3Rpb24gPSAoYWN0aW9uOiBCYXNlQWN0aW9uICYgeyBub1dyYXA/OiBib29sZWFuIH0sIHRvb2xiYXJBY3Rpb246IFRvb2xCYXJBY3Rpb24sIGlzTWVudUl0ZW06IGJvb2xlYW4pID0+IHtcblx0XHRpZiAoaXNNZW51SXRlbSkge1xuXHRcdFx0cmV0dXJuIHhtbGBcblx0XHRcdDxNZW51SXRlbVxuXHRcdFx0XHR0ZXh0PVwiJHt0b29sYmFyQWN0aW9uLmxhYmVsfVwiXG5cdFx0XHRcdHByZXNzPVwiJHthY3Rpb24uY29tbWFuZCA/IFwiY21kOlwiICsgYWN0aW9uLmNvbW1hbmQgOiB0b29sYmFyQWN0aW9uLnByZXNzfVwiXG5cdFx0XHRcdGVuYWJsZWQ9XCIke3Rvb2xiYXJBY3Rpb24uZW5hYmxlZH1cIlxuXHRcdFx0XHR2aXNpYmxlPVwiJHt0b29sYmFyQWN0aW9uLnZpc2libGV9XCJcblx0XHRcdC8+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuYnVpbGRBY3Rpb24oYWN0aW9uLCB0b29sYmFyQWN0aW9uKTtcblx0XHR9XG5cdH07XG5cblx0YnVpbGRBY3Rpb24gPSAoYWN0aW9uOiBCYXNlQWN0aW9uLCB0b29sYmFyQWN0aW9uOiBUb29sQmFyQWN0aW9uKSA9PiB7XG5cdFx0bGV0IGFjdGlvblByZXNzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBcIlwiO1xuXHRcdGlmIChhY3Rpb24uaGFzT3duUHJvcGVydHkoXCJub1dyYXBcIikpIHtcblx0XHRcdGlmIChhY3Rpb24uY29tbWFuZCkge1xuXHRcdFx0XHRhY3Rpb25QcmVzcyA9IFwiY21kOlwiICsgYWN0aW9uLmNvbW1hbmQ7XG5cdFx0XHR9IGVsc2UgaWYgKChhY3Rpb24gYXMgQ3VzdG9tQWN0aW9uKS5ub1dyYXAgPT09IHRydWUpIHtcblx0XHRcdFx0YWN0aW9uUHJlc3MgPSB0b29sYmFyQWN0aW9uLnByZXNzO1xuXHRcdFx0fSBlbHNlIGlmICghYWN0aW9uLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRcdGFjdGlvblByZXNzID0gQ29tbW9uSGVscGVyLmJ1aWxkQWN0aW9uV3JhcHBlcihcblx0XHRcdFx0XHRhY3Rpb24gYXMgQmFzZUFjdGlvbiAmIHsgaGFuZGxlck1vZHVsZTogc3RyaW5nOyBoYW5kbGVyTWV0aG9kOiBzdHJpbmcgfSxcblx0XHRcdFx0XHR0aGlzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4geG1sYDxtZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPlxuXHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRjb3JlOnJlcXVpcmU9XCJ7RlBNOiAnc2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXInfVwiXG5cdFx0XHRcdHVuaXR0ZXN0OmlkPVwiJHt0b29sYmFyQWN0aW9uLnVuaXR0ZXN0aWR9XCJcblx0XHRcdFx0aWQ9XCIke3Rvb2xiYXJBY3Rpb24uaWR9XCJcblx0XHRcdFx0dGV4dD1cIiR7dG9vbGJhckFjdGlvbi5sYWJlbH1cIlxuXHRcdFx0XHRhcmlhSGFzUG9wdXA9XCIke3Rvb2xiYXJBY3Rpb24uYXJpYUhhc1BvcHVwfVwiXG5cdFx0XHRcdHByZXNzPVwiJHthY3Rpb25QcmVzc31cIlxuXHRcdFx0XHRlbmFibGVkPVwiJHt0b29sYmFyQWN0aW9uLmVuYWJsZWR9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7dG9vbGJhckFjdGlvbi52aXNpYmxlfVwiXG5cdFx0XHQvPlxuXHRcdCAgIDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4geG1sYDxtZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPlxuXHRcdFx0PEJ1dHRvblxuXHRcdFx0XHR1bml0dGVzdDppZD1cIiR7dG9vbGJhckFjdGlvbi51bml0dGVzdGlkfVwiXG5cdFx0XHRcdGlkPVwiJHt0b29sYmFyQWN0aW9uLmlkfVwiXG5cdFx0XHRcdHRleHQ9XCIke3Rvb2xiYXJBY3Rpb24ubGFiZWx9XCJcblx0XHRcdFx0YXJpYUhhc1BvcHVwPVwiJHt0b29sYmFyQWN0aW9uLmFyaWFIYXNQb3B1cH1cIlxuXHRcdFx0XHRwcmVzcz1cIiR7YWN0aW9uLmNvbW1hbmQgPyBcImNtZDpcIiArIGFjdGlvbi5jb21tYW5kIDogdG9vbGJhckFjdGlvbi5wcmVzc31cIlxuXHRcdFx0XHRlbmFibGVkPVwiJHt0b29sYmFyQWN0aW9uLmVuYWJsZWR9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7dG9vbGJhckFjdGlvbi52aXNpYmxlfVwiXG5cdFx0XHQvPlxuXHRcdDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHRcdH1cblx0fTtcblxuXHRnZXRBbm5vdGF0aW9uQWN0aW9uc0VuYWJsZWQgPSAoXG5cdFx0YWN0aW9uOiBCYXNlQWN0aW9uLFxuXHRcdGlzQm91bmQ6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+LFxuXHRcdGRhdGFGaWVsZDogRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdGNoYXJ0Q29udGV4dDogVjRDb250ZXh0XG5cdCkgPT4ge1xuXHRcdHJldHVybiBhY3Rpb24uZW5hYmxlZCAhPT0gdW5kZWZpbmVkXG5cdFx0XHQ/IGFjdGlvbi5lbmFibGVkXG5cdFx0XHQ6IENoYXJ0SGVscGVyLmlzRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uRW5hYmxlZChcblx0XHRcdFx0XHRpc0JvdW5kICYmIGlzQm91bmQuJElzQm91bmQsXG5cdFx0XHRcdFx0ZGF0YUZpZWxkLkFjdGlvbiBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0dGhpcy5jb250ZXh0UGF0aCxcblx0XHRcdFx0XHRDaGFydEhlbHBlci5nZXRPcGVyYXRpb25BdmFpbGFibGVNYXAoY2hhcnRDb250ZXh0LmdldE9iamVjdCgpLCB7IGNvbnRleHQ6IGNoYXJ0Q29udGV4dCB9KSxcblx0XHRcdFx0XHRhY3Rpb24uZW5hYmxlT25TZWxlY3QgfHwgXCJcIlxuXHRcdFx0ICApO1xuXHR9O1xuXG5cdGdldFNlZ21lbnRlZEJ1dHRvbiA9ICgpID0+IHtcblx0XHRyZXR1cm4geG1sYDxtZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uIGxheW91dEluZm9ybWF0aW9uPVwie1xuXHRcdFx0YWdncmVnYXRpb25OYW1lOiAnZW5kJyxcblx0XHRcdGFsaWdubWVudDogJ0VuZCdcblx0XHR9XCI+XG5cdFx0XHQ8U2VnbWVudGVkQnV0dG9uXG5cdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJTZWdtZW50ZWRCdXR0b25cIiwgXCJUZW1wbGF0ZUNvbnRlbnRWaWV3XCJdKX1cIlxuXHRcdFx0XHRzZWxlY3Q9XCIke3RoaXMub25TZWdtZW50ZWRCdXR0b25QcmVzc2VkfVwiXG5cdFx0XHRcdHZpc2libGU9XCJ7PSBcXCR7cGFnZUludGVybmFsPmFscENvbnRlbnRWaWV3fSAhPT0gJ1RhYmxlJyB9XCJcblx0XHRcdFx0c2VsZWN0ZWRLZXk9XCJ7cGFnZUludGVybmFsPmFscENvbnRlbnRWaWV3fVwiXG5cdFx0XHQ+XG5cdFx0XHRcdDxpdGVtcz5cblx0XHRcdFx0XHQke3RoaXMuZ2V0U2VnbWVudGVkQnV0dG9uSXRlbXMoKX1cblx0XHRcdFx0PC9pdGVtcz5cblx0XHRcdDwvU2VnbWVudGVkQnV0dG9uPlxuXHRcdDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHR9O1xuXG5cdGdldFNlZ21lbnRlZEJ1dHRvbkl0ZW1zID0gKCkgPT4ge1xuXHRcdGNvbnN0IHNTZWdtZW50ZWRCdXR0b25JdGVtcyA9IFtdO1xuXHRcdGlmIChDb21tb25IZWxwZXIuaXNEZXNrdG9wKCkpIHtcblx0XHRcdHNTZWdtZW50ZWRCdXR0b25JdGVtcy5wdXNoKFxuXHRcdFx0XHR0aGlzLmdldFNlZ21lbnRlZEJ1dHRvbkl0ZW0oXG5cdFx0XHRcdFx0XCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fSFlCUklEX1NFR01FTlRFRF9CVVRUT05fSVRFTV9UT09MVElQfVwiLFxuXHRcdFx0XHRcdFwiSHlicmlkXCIsXG5cdFx0XHRcdFx0XCJzYXAtaWNvbjovL2NoYXJ0LXRhYmxlLXZpZXdcIlxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRzU2VnbWVudGVkQnV0dG9uSXRlbXMucHVzaChcblx0XHRcdHRoaXMuZ2V0U2VnbWVudGVkQnV0dG9uSXRlbShcIntzYXAuZmUuaTE4bj5NX0NPTU1PTl9DSEFSVF9TRUdNRU5URURfQlVUVE9OX0lURU1fVE9PTFRJUH1cIiwgXCJDaGFydFwiLCBcInNhcC1pY29uOi8vYmFyLWNoYXJ0XCIpXG5cdFx0KTtcblx0XHRzU2VnbWVudGVkQnV0dG9uSXRlbXMucHVzaChcblx0XHRcdHRoaXMuZ2V0U2VnbWVudGVkQnV0dG9uSXRlbShcIntzYXAuZmUuaTE4bj5NX0NPTU1PTl9UQUJMRV9TRUdNRU5URURfQlVUVE9OX0lURU1fVE9PTFRJUH1cIiwgXCJUYWJsZVwiLCBcInNhcC1pY29uOi8vdGFibGUtdmlld1wiKVxuXHRcdCk7XG5cdFx0cmV0dXJuIHNTZWdtZW50ZWRCdXR0b25JdGVtcztcblx0fTtcblxuXHRnZXRTZWdtZW50ZWRCdXR0b25JdGVtID0gKHRvb2x0aXA6IHN0cmluZywga2V5OiBzdHJpbmcsIGljb246IHN0cmluZykgPT4ge1xuXHRcdHJldHVybiB4bWxgPFNlZ21lbnRlZEJ1dHRvbkl0ZW1cblx0XHRcdHRvb2x0aXA9XCIke3Rvb2x0aXB9XCJcblx0XHRcdGtleT1cIiR7a2V5fVwiXG5cdFx0XHRpY29uPVwiJHtpY29ufVwiXG5cdFx0Lz5gO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhbm5vdGF0aW9uIHBhdGggcG9pbnRpbmcgdG8gdGhlIHZpc3VhbGl6YXRpb24gYW5ub3RhdGlvbiAoQ2hhcnQpLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcHMgVGhlIGNoYXJ0IHByb3BlcnRpZXNcblx0ICogQHBhcmFtIGNvbnRleHRPYmplY3RQYXRoIFRoZSBkYXRhbW9kZWwgb2JqZWN0IHBhdGggZm9yIHRoZSBjaGFydFxuXHQgKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcblx0ICogQHJldHVybnMgVGhlIGFubm90YXRpb24gcGF0aFxuXHQgKi9cblx0c3RhdGljIGdldFZpc3VhbGl6YXRpb25QYXRoID0gKFxuXHRcdHByb3BzOiBQcm9wZXJ0aWVzT2Y8Q2hhcnRCdWlsZGluZ0Jsb2NrPixcblx0XHRjb250ZXh0T2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG5cdCkgPT4ge1xuXHRcdGxldCBtZXRhUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChjb250ZXh0T2JqZWN0UGF0aCkgYXMgc3RyaW5nO1xuXHRcdGlmIChjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQpIHtcblx0XHRcdHJldHVybiBtZXRhUGF0aDsgLy8gTWV0YVBhdGggaXMgYWxyZWFkeSBwb2ludGluZyB0byBhIENoYXJ0XG5cdFx0fVxuXHRcdGlmIChwcm9wcy5tZXRhUGF0aD8uZ2V0T2JqZWN0KCkuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudFR5cGVcIikge1xuXHRcdFx0Y29uc3QgYVZpc3VhbGl6YXRpb25zID0gcHJvcHMubWV0YVBhdGguZ2V0T2JqZWN0KCkuVmlzdWFsaXphdGlvbnM7XG5cdFx0XHRtZXRhUGF0aCA9IENoYXJ0QnVpbGRpbmdCbG9jay5jaGVja0NoYXJ0VmlzdWFsaXphdGlvblBhdGgoYVZpc3VhbGl6YXRpb25zLCBtZXRhUGF0aCk7XG5cdFx0fVxuXHRcdGlmIChtZXRhUGF0aCkge1xuXHRcdFx0Ly9OZWVkIHRvIHN3aXRjaCB0byB0aGUgY29udGV4dCByZWxhdGVkIHRoZSBQViBvciBTUFZcblx0XHRcdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihtZXRhUGF0aCk7XG5cblx0XHRcdGxldCB2aXN1YWxpemF0aW9uczogVmlzdWFsaXphdGlvbkFuZFBhdGhbXSA9IFtdO1xuXHRcdFx0c3dpdGNoIChjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LnRlcm0pIHtcblx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRcdGlmIChjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QuUHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRcdFx0dmlzdWFsaXphdGlvbnMgPSBnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KFxuXHRcdFx0XHRcdFx0XHRjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QuUHJlc2VudGF0aW9uVmFyaWFudCxcblx0XHRcdFx0XHRcdFx0bWV0YVBhdGgsXG5cdFx0XHRcdFx0XHRcdHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0XHR2aXN1YWxpemF0aW9ucyA9IGdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQoXG5cdFx0XHRcdFx0XHRjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QsXG5cdFx0XHRcdFx0XHRtZXRhUGF0aCxcblx0XHRcdFx0XHRcdHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0TG9nLmVycm9yKGBCYWQgbWV0YXBhdGggcGFyYW1ldGVyIGZvciBjaGFydCA6ICR7Y29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnRlcm19YCk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGNoYXJ0Vml6ID0gdmlzdWFsaXphdGlvbnMuZmluZCgodml6KSA9PiB7XG5cdFx0XHRcdHJldHVybiB2aXoudmlzdWFsaXphdGlvbi50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5DaGFydDtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoY2hhcnRWaXopIHtcblx0XHRcdFx0cmV0dXJuIGNoYXJ0Vml6LmFubm90YXRpb25QYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG1ldGFQYXRoOyAvLyBGYWxsYmFja1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cuZXJyb3IoYEJhZCBtZXRhcGF0aCBwYXJhbWV0ZXIgZm9yIGNoYXJ0IDogJHtjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybX1gKTtcblx0XHRcdHJldHVybiBtZXRhUGF0aDtcblx0XHR9XG5cdH07XG5cblx0Z2V0VmlzaWJsZSA9IChkYXRhRmllbGRDb250ZXh0OiBWNENvbnRleHQpID0+IHtcblx0XHRjb25zdCBkYXRhRmllbGQgPSBkYXRhRmllbGRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdGlmIChkYXRhRmllbGRbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdICYmIGRhdGFGaWVsZFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0uJFBhdGgpIHtcblx0XHRcdGNvbnN0IGhpZGRlblBhdGhDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aFxuXHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHQuY3JlYXRlQmluZGluZ0NvbnRleHQoXG5cdFx0XHRcdFx0ZGF0YUZpZWxkQ29udGV4dC5nZXRQYXRoKCkgKyBcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuLyRQYXRoXCIsXG5cdFx0XHRcdFx0ZGF0YUZpZWxkW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXS4kUGF0aFxuXHRcdFx0XHQpO1xuXHRcdFx0cmV0dXJuIENoYXJ0SGVscGVyLmdldEhpZGRlblBhdGhFeHByZXNzaW9uRm9yVGFibGVBY3Rpb25zQW5kSUJOKGRhdGFGaWVsZFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0uJFBhdGgsIHtcblx0XHRcdFx0Y29udGV4dDogaGlkZGVuUGF0aENvbnRleHRcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAoZGF0YUZpZWxkW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSkge1xuXHRcdFx0cmV0dXJuICFkYXRhRmllbGRbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH07XG5cblx0Z2V0Q29udGV4dFBhdGggPSAoKSA9PiB7XG5cdFx0cmV0dXJuIHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpLmxhc3RJbmRleE9mKFwiL1wiKSA9PT0gdGhpcy5jb250ZXh0UGF0aC5nZXRQYXRoKCkubGVuZ3RoIC0gMVxuXHRcdFx0PyB0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKS5yZXBsYWNlQWxsKFwiL1wiLCBcIlwiKVxuXHRcdFx0OiB0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKS5zcGxpdChcIi9cIilbdGhpcy5jb250ZXh0UGF0aC5nZXRQYXRoKCkuc3BsaXQoXCIvXCIpLmxlbmd0aCAtIDFdO1xuXHR9O1xuXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IGNoYXJ0Q29udGV4dCA9IENoYXJ0SGVscGVyLmdldFVpQ2hhcnQodGhpcy5tZXRhUGF0aCk7XG5cdFx0Y29uc3QgY2hhcnQgPSBjaGFydENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0bGV0IGNoYXJ0ZGVsZWdhdGUgPSBcIlwiO1xuXHRcdGlmICh0aGlzLmNoYXJ0RGVsZWdhdGUpIHtcblx0XHRcdGNoYXJ0ZGVsZWdhdGUgPSB0aGlzLmNoYXJ0RGVsZWdhdGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IHRoaXMuZ2V0Q29udGV4dFBhdGgoKTtcblx0XHRcdGNoYXJ0ZGVsZWdhdGUgPVxuXHRcdFx0XHRcIntuYW1lOidzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0RGVsZWdhdGUnLCBwYXlsb2FkOiB7Y29udGV4dFBhdGg6ICdcIiArXG5cdFx0XHRcdHNDb250ZXh0UGF0aCArXG5cdFx0XHRcdFwiJywgcGFyYW1ldGVyczp7JCRncm91cElkOickYXV0by5Xb3JrZXJzJ30sIHNlbGVjdGlvbk1vZGU6ICdcIiArXG5cdFx0XHRcdHRoaXMuc2VsZWN0aW9uTW9kZSArXG5cdFx0XHRcdFwiJ319XCI7XG5cdFx0fVxuXHRcdGNvbnN0IGJpbmRpbmcgPSBcIntpbnRlcm5hbD5jb250cm9scy9cIiArIHRoaXMuaWQgKyBcIn1cIjtcblx0XHRpZiAoIXRoaXMuaGVhZGVyKSB7XG5cdFx0XHR0aGlzLmhlYWRlciA9IGNoYXJ0LlRpdGxlO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PG1hY3JvOkNoYXJ0QVBJIHhtbG5zPVwic2FwLm1cIiB4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3MuY2hhcnRcIiB4bWxuczp2YXJpYW50PVwic2FwLnVpLmZsLnZhcmlhbnRzXCIgeG1sbnM6cDEzbj1cInNhcC51aS5tZGMucDEzblwiIHhtbG5zOnVuaXR0ZXN0PVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvcHJlcHJvY2Vzc29yZXh0ZW5zaW9uL3NhcC5mZS51bml0dGVzdGluZy8xXCIgeG1sbnM6bWFjcm9kYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiIHhtbG5zOmludGVybmFsTWFjcm89XCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIgeG1sbnM6Y2hhcnQ9XCJzYXAudWkubWRjLmNoYXJ0XCIgeG1sbnM6bWRjPVwic2FwLnVpLm1kY1wiIHhtbG5zOm1kY2F0PVwic2FwLnVpLm1kYy5hY3Rpb250b29sYmFyXCIgeG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCIgaWQ9XCIke1xuXHRcdFx0XHR0aGlzLl9hcGlJZFxuXHRcdFx0fVwiIHNlbGVjdGlvbkNoYW5nZT1cIiR7dGhpcy5zZWxlY3Rpb25DaGFuZ2V9XCIgc3RhdGVDaGFuZ2U9XCIke3RoaXMuc3RhdGVDaGFuZ2V9XCI+XG5cdFx0XHRcdDxtYWNybzpsYXlvdXREYXRhPlxuXHRcdFx0XHRcdDxGbGV4SXRlbURhdGEgZ3Jvd0ZhY3Rvcj1cIjFcIiBzaHJpbmtGYWN0b3I9XCIxXCIgLz5cblx0XHRcdFx0PC9tYWNybzpsYXlvdXREYXRhPlxuXHRcdFx0XHQ8bWRjOkNoYXJ0XG5cdFx0XHRcdFx0YmluZGluZz1cIiR7YmluZGluZ31cIlxuXHRcdFx0XHRcdHVuaXR0ZXN0OmlkPVwiQ2hhcnRNYWNyb0ZyYWdtZW50XCJcblx0XHRcdFx0XHRpZD1cIiR7dGhpcy5fY29udGVudElkfVwiXG5cdFx0XHRcdFx0Y2hhcnRUeXBlPVwiJHt0aGlzLl9jaGFydFR5cGV9XCJcblx0XHRcdFx0XHRzb3J0Q29uZGl0aW9ucz1cIiR7dGhpcy5fc29ydENvbmR0aW9uc31cIlxuXHRcdFx0XHRcdGhlYWRlcj1cIiR7dGhpcy5oZWFkZXJ9XCJcblx0XHRcdFx0XHRoZWFkZXJWaXNpYmxlPVwiJHt0aGlzLmhlYWRlclZpc2libGV9XCJcblx0XHRcdFx0XHRoZWlnaHQ9XCIke3RoaXMuaGVpZ2h0fVwiXG5cdFx0XHRcdFx0d2lkdGg9XCIke3RoaXMud2lkdGh9XCJcblx0XHRcdFx0XHRoZWFkZXJMZXZlbD1cIiR7dGhpcy5oZWFkZXJMZXZlbH1cIlxuXHRcdFx0XHRcdHAxM25Nb2RlPVwiJHt0aGlzLnBlcnNvbmFsaXphdGlvbn1cIlxuXHRcdFx0XHRcdGZpbHRlcj1cIiR7dGhpcy5maWx0ZXJ9XCJcblx0XHRcdFx0XHRub0RhdGFUZXh0PVwiJHt0aGlzLm5vRGF0YVRleHR9XCJcblx0XHRcdFx0XHRhdXRvQmluZE9uSW5pdD1cIiR7dGhpcy5hdXRvQmluZE9uSW5pdH1cIlxuXHRcdFx0XHRcdGRlbGVnYXRlPVwiJHtjaGFydGRlbGVnYXRlfVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOnRhcmdldENvbGxlY3Rpb25QYXRoPVwiJHt0aGlzLl9jdXN0b21EYXRhLnRhcmdldENvbGxlY3Rpb25QYXRofVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOmVudGl0eVNldD1cIiR7dGhpcy5fY3VzdG9tRGF0YS5lbnRpdHlTZXR9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6ZW50aXR5VHlwZT1cIiR7dGhpcy5fY3VzdG9tRGF0YS5lbnRpdHlUeXBlfVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOm9wZXJhdGlvbkF2YWlsYWJsZU1hcD1cIiR7dGhpcy5fY3VzdG9tRGF0YS5vcGVyYXRpb25BdmFpbGFibGVNYXB9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6bXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnM9XCIke3RoaXMuX2N1c3RvbURhdGEubXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnN9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6c2VnbWVudGVkQnV0dG9uSWQ9XCIke3RoaXMuX2N1c3RvbURhdGEuc2VnbWVudGVkQnV0dG9uSWR9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6Y3VzdG9tQWdnPVwiJHt0aGlzLl9jdXN0b21EYXRhLmN1c3RvbUFnZ31cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTp0cmFuc0FnZz1cIiR7dGhpcy5fY3VzdG9tRGF0YS50cmFuc0FnZ31cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTphcHBseVN1cHBvcnRlZD1cIiR7dGhpcy5fY3VzdG9tRGF0YS5hcHBseVN1cHBvcnRlZH1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTp2aXpQcm9wZXJ0aWVzPVwiJHt0aGlzLl9jdXN0b21EYXRhLnZpelByb3BlcnRpZXN9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6ZHJhZnRTdXBwb3J0ZWQ9XCIke3RoaXMuX2N1c3RvbURhdGEuZHJhZnRTdXBwb3J0ZWR9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6bXVsdGlWaWV3cz1cIiR7dGhpcy5fY3VzdG9tRGF0YS5tdWx0aVZpZXdzfVwiXG5cdFx0XHRcdFx0dmlzaWJsZT1cIiR7dGhpcy52aXNpYmxlfVwiXG5cdFx0XHRcdD5cblx0XHRcdFx0PG1kYzpkZXBlbmRlbnRzPlxuXHRcdFx0XHRcdCR7dGhpcy5nZXREZXBlbmRlbnRzKGNoYXJ0Q29udGV4dCl9XG5cdFx0XHRcdFx0JHt0aGlzLmdldFBlcnNpc3RlbmNlUHJvdmlkZXIoKX1cblx0XHRcdFx0PC9tZGM6ZGVwZW5kZW50cz5cblx0XHRcdFx0PG1kYzppdGVtcz5cblx0XHRcdFx0XHQke3RoaXMuZ2V0SXRlbXMoY2hhcnRDb250ZXh0KX1cblx0XHRcdFx0PC9tZGM6aXRlbXM+XG5cdFx0XHRcdCR7dGhpcy5fYWN0aW9uc31cblx0XHRcdFx0JHt0aGlzLmNyZWF0ZVZhcmlhbnRNYW5hZ2VtZW50KCl9XG5cdFx0XHQ8L21kYzpDaGFydD5cblx0XHQ8L21hY3JvOkNoYXJ0QVBJPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUErREEsTUFBTUEsWUFBaUIsR0FBRztJQUN6Qix1REFBdUQsRUFBRSxPQUFPO0lBQ2hFLHVEQUF1RCxFQUFFLE9BQU87SUFDaEUsdURBQXVELEVBQUUsT0FBTztJQUNoRSx1REFBdUQsRUFBRTtFQUMxRCxDQUFDO0VBQUMsSUFnQkdDLHFCQUFxQjtFQU0xQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQSxXQU5LQSxxQkFBcUI7SUFBckJBLHFCQUFxQjtJQUFyQkEscUJBQXFCO0lBQXJCQSxxQkFBcUI7RUFBQSxHQUFyQkEscUJBQXFCLEtBQXJCQSxxQkFBcUI7RUFZMUIsTUFBTUMseUJBQXlCLEdBQUcsVUFBVUMsV0FBb0IsRUFBRTtJQUFBO0lBQ2pFLElBQUlDLGtCQUFrQixHQUFHLElBQUk7SUFDN0IsTUFBTUMsTUFBTSxHQUFHRixXQUFXO0lBQzFCLElBQUlHLFdBQTBCLEdBQUcsRUFBRTtJQUNuQyxNQUFNQyxTQUFTLDJCQUFHRixNQUFNLENBQUNHLFlBQVksQ0FBQyxLQUFLLENBQUMseURBQTFCLHFCQUE0QkMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7SUFDdkUsSUFBSUosTUFBTSxDQUFDSyxRQUFRLENBQUNDLE1BQU0sSUFBSU4sTUFBTSxDQUFDTyxTQUFTLEtBQUssYUFBYSxJQUFJUCxNQUFNLENBQUNRLFlBQVksS0FBSyxlQUFlLEVBQUU7TUFDNUcsTUFBTUMsWUFBWSxHQUFHQyxLQUFLLENBQUNDLFNBQVMsQ0FBQ0MsS0FBSyxDQUFDQyxLQUFLLENBQUNiLE1BQU0sQ0FBQ0ssUUFBUSxDQUFDO01BQ2pFLElBQUlTLFNBQVMsR0FBRyxDQUFDO01BQ2pCZixrQkFBa0IsR0FBR1UsWUFBWSxDQUFD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QUUsc0NBQXFDaU8saUJBQWlCLENBQUM5USxZQUFZLENBQUMrUSxJQUFLLEVBQUMsQ0FBQztNQUN0RixPQUFPalQsUUFBUTtJQUNoQjtFQUNELENBQUM7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==