/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/helpers/Aggregation", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "../ResourceModel", "./InteractiveChartHelper"], function (Log, BuildingBlock, BuildingBlockRuntime, Aggregation, MetaModelConverter, ModelHelper, StableIdHelper, ResourceModel, InteractiveChartHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23;
  var _exports = {};
  var generate = StableIdHelper.generate;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var AggregationHelper = Aggregation.AggregationHelper;
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let VisualFilterBuildingBlock = (
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
  _dec = defineBuildingBlock({
    name: "VisualFilter",
    namespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string",
    defaultValue: ""
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    $kind: ["EntitySet", "NavigationProperty"]
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec9 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "boolean"
  }), _dec12 = blockAttribute({
    type: "boolean"
  }), _dec13 = blockAttribute({
    type: "string"
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec16 = blockAttribute({
    type: "boolean"
  }), _dec17 = blockAttribute({
    type: "string"
  }), _dec18 = blockAttribute({
    type: "boolean"
  }), _dec19 = blockAttribute({
    type: "boolean"
  }), _dec20 = blockAttribute({
    type: "boolean",
    defaultValue: false
  }), _dec21 = blockAttribute({
    type: "string",
    defaultValue: "$auto.visualFilters"
  }), _dec22 = blockAttribute({
    type: "string"
  }), _dec23 = blockAttribute({
    type: "string"
  }), _dec24 = blockAttribute({
    type: "boolean"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(VisualFilterBuildingBlock, _BuildingBlockBase);
    function VisualFilterBuildingBlock(oProps, configuration, mSettings) {
      var _this$metaPath, _chartAnnotation, _chartAnnotation$Meas, _chartAnnotation3, _chartAnnotation4, _chartAnnotation5, _chartAnnotation6, _aVisualizations$, _aVisualizations$$$ta, _aVisualizations$2, _aVisualizations$2$$t, _aVisualizations$2$$t2, _aVisualizations$2$$t3, _oAggregation$Aggrega, _oAggregation$Aggrega2, _propertyAnnotations$, _aggregatableProperty, _chartAnnotation8, _chartAnnotation9, _chartAnnotation10, _oProps$contextPath, _this$metaPath3;
      var _this;
      _this = _BuildingBlockBase.call(this, oProps, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "outParameter", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valuelistProperty", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionVariantAnnotation", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "inParameters", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "multipleSelectionAllowed", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "required", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showOverlayInitially", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "renderLineChart", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "requiredProperties", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBarEntityType", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showError", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartMeasure", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "bUoMHasCustomAggregate", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showValueHelp", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "bCustomAggregate", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "groupId", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "errorMessageTitle", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "errorMessage", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "draftSupported", _descriptor23, _assertThisInitialized(_this));
      _this.groupId = "$auto.visualFilters";
      _this.inParameters = oProps.inParameters;
      _this.metaPath = oProps.metaPath;
      _this.sMetaPath = (_this$metaPath = _this.metaPath) === null || _this$metaPath === void 0 ? void 0 : _this$metaPath.getPath();
      const oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, oProps.contextPath);
      const oConverterContext = _this.getConverterContext(oContextObjectPath, undefined, mSettings);
      const aggregationHelper = new AggregationHelper(oConverterContext.getEntityType(), oConverterContext);
      const customAggregates = aggregationHelper.getCustomAggregateDefinitions();
      const pvAnnotation = oContextObjectPath.targetObject;
      let chartAnnotation;
      let sMeasure;
      const aVisualizations = pvAnnotation && pvAnnotation.Visualizations;
      if (aVisualizations) {
        for (let i = 0; i < aVisualizations.length; i++) {
          const sAnnotationPath = pvAnnotation.Visualizations[i] && pvAnnotation.Visualizations[i].value;
          chartAnnotation = oConverterContext.getEntityTypeAnnotation(sAnnotationPath) && oConverterContext.getEntityTypeAnnotation(sAnnotationPath).annotation;
        }
      }
      let aAggregations,
        aCustAggMeasure = [];
      if ((_chartAnnotation = chartAnnotation) !== null && _chartAnnotation !== void 0 && (_chartAnnotation$Meas = _chartAnnotation.Measures) !== null && _chartAnnotation$Meas !== void 0 && _chartAnnotation$Meas.length) {
        aCustAggMeasure = customAggregates.filter(function (custAgg) {
          var _chartAnnotation2;
          return custAgg.qualifier === ((_chartAnnotation2 = chartAnnotation) === null || _chartAnnotation2 === void 0 ? void 0 : _chartAnnotation2.Measures[0].value);
        });
        sMeasure = aCustAggMeasure.length > 0 ? aCustAggMeasure[0].qualifier : chartAnnotation.Measures[0].value;
        aAggregations = aggregationHelper.getAggregatedProperties("AggregatedProperties")[0];
      }
      // if there are AggregatedProperty objects but no dynamic measures, rather there are transformation aggregates found in measures
      if (aAggregations && aAggregations.length > 0 && !((_chartAnnotation3 = chartAnnotation) !== null && _chartAnnotation3 !== void 0 && _chartAnnotation3.DynamicMeasures) && aCustAggMeasure.length === 0 && (_chartAnnotation4 = chartAnnotation) !== null && _chartAnnotation4 !== void 0 && _chartAnnotation4.Measures && ((_chartAnnotation5 = chartAnnotation) === null || _chartAnnotation5 === void 0 ? void 0 : _chartAnnotation5.Measures.length) > 0) {
        Log.warning("The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly.");
      }
      //if the chart has dynamic measures, but with no other custom aggregate measures then consider the dynamic measures
      if ((_chartAnnotation6 = chartAnnotation) !== null && _chartAnnotation6 !== void 0 && _chartAnnotation6.DynamicMeasures) {
        if (aCustAggMeasure.length === 0) {
          sMeasure = oConverterContext.getConverterContextFor(oConverterContext.getAbsoluteAnnotationPath(chartAnnotation.DynamicMeasures[0].value)).getDataModelObjectPath().targetObject.Name;
          aAggregations = aggregationHelper.getAggregatedProperties("AggregatedProperty");
        } else {
          Log.warning("The dynamic measures have been ignored as visual filters can deal with only 1 measure and the first (custom aggregate) measure defined under Chart.Measures is considered.");
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
      if (customAggregates.some(function (custAgg) {
        return custAgg.qualifier === sMeasure;
      })) {
        _this.bCustomAggregate = true;
      }
      let selectionVariant;
      if (oProps.selectionVariantAnnotation) {
        var _this$metaPath2;
        const selectionVariantContext = (_this$metaPath2 = _this.metaPath) === null || _this$metaPath2 === void 0 ? void 0 : _this$metaPath2.getModel().createBindingContext(oProps.selectionVariantAnnotation.getPath());
        selectionVariant = selectionVariantContext && getInvolvedDataModelObjects(selectionVariantContext, oProps.contextPath).targetObject;
      }
      let iSelectOptionsForDimension = 0;
      if (selectionVariant && !oProps.multipleSelectionAllowed) {
        for (let j = 0; j < selectionVariant.SelectOptions.length; j++) {
          var _chartAnnotation7;
          if (selectionVariant.SelectOptions[j].PropertyName.value === ((_chartAnnotation7 = chartAnnotation) === null || _chartAnnotation7 === void 0 ? void 0 : _chartAnnotation7.Dimensions[0].value)) {
            iSelectOptionsForDimension++;
            if (iSelectOptionsForDimension > 1) {
              throw new Error("Multiple SelectOptions for FilterField having SingleValue Allowed Expression");
            }
          }
        }
      }
      const oAggregation = _this.getAggregateProperties(aAggregations, sMeasure);
      if (oAggregation) {
        _this.aggregateProperties = oAggregation;
      }
      const propertyAnnotations = ((_aVisualizations$ = aVisualizations[0]) === null || _aVisualizations$ === void 0 ? void 0 : (_aVisualizations$$$ta = _aVisualizations$.$target) === null || _aVisualizations$$$ta === void 0 ? void 0 : _aVisualizations$$$ta.Measures) && ((_aVisualizations$2 = aVisualizations[0]) === null || _aVisualizations$2 === void 0 ? void 0 : (_aVisualizations$2$$t = _aVisualizations$2.$target) === null || _aVisualizations$2$$t === void 0 ? void 0 : (_aVisualizations$2$$t2 = _aVisualizations$2$$t.Measures[0]) === null || _aVisualizations$2$$t2 === void 0 ? void 0 : (_aVisualizations$2$$t3 = _aVisualizations$2$$t2.$target) === null || _aVisualizations$2$$t3 === void 0 ? void 0 : _aVisualizations$2$$t3.annotations);
      const aggregatablePropertyAnnotations = oAggregation === null || oAggregation === void 0 ? void 0 : (_oAggregation$Aggrega = oAggregation.AggregatableProperty) === null || _oAggregation$Aggrega === void 0 ? void 0 : (_oAggregation$Aggrega2 = _oAggregation$Aggrega.$target) === null || _oAggregation$Aggrega2 === void 0 ? void 0 : _oAggregation$Aggrega2.annotations;
      const measures = propertyAnnotations === null || propertyAnnotations === void 0 ? void 0 : propertyAnnotations.Measures;
      const aggregatablePropertyMeasures = aggregatablePropertyAnnotations === null || aggregatablePropertyAnnotations === void 0 ? void 0 : aggregatablePropertyAnnotations.Measures;
      const vUOM = _this.getUoM(measures, aggregatablePropertyMeasures);
      if (vUOM && customAggregates.some(function (custAgg) {
        return custAgg.qualifier === vUOM;
      })) {
        _this.bUoMHasCustomAggregate = true;
      } else {
        _this.bUoMHasCustomAggregate = false;
      }
      const propertyHidden = propertyAnnotations === null || propertyAnnotations === void 0 ? void 0 : (_propertyAnnotations$ = propertyAnnotations.UI) === null || _propertyAnnotations$ === void 0 ? void 0 : _propertyAnnotations$.Hidden;
      const aggregatablePropertyHidden = aggregatablePropertyAnnotations === null || aggregatablePropertyAnnotations === void 0 ? void 0 : (_aggregatableProperty = aggregatablePropertyAnnotations.UI) === null || _aggregatableProperty === void 0 ? void 0 : _aggregatableProperty.Hidden;
      const bHiddenMeasure = _this.getHiddenMeasure(propertyHidden, aggregatablePropertyHidden, _this.bCustomAggregate);
      const sDimensionType = ((_chartAnnotation8 = chartAnnotation) === null || _chartAnnotation8 === void 0 ? void 0 : _chartAnnotation8.Dimensions[0]) && ((_chartAnnotation9 = chartAnnotation) === null || _chartAnnotation9 === void 0 ? void 0 : _chartAnnotation9.Dimensions[0].$target) && chartAnnotation.Dimensions[0].$target.type;
      const sChartType = (_chartAnnotation10 = chartAnnotation) === null || _chartAnnotation10 === void 0 ? void 0 : _chartAnnotation10.ChartType;
      if (sDimensionType === "Edm.Date" || sDimensionType === "Edm.Time" || sDimensionType === "Edm.DateTimeOffset") {
        _this.showValueHelp = false;
      } else if (typeof bHiddenMeasure === "boolean" && bHiddenMeasure) {
        _this.showValueHelp = false;
      } else if (!(sChartType === "UI.ChartType/Bar" || sChartType === "UI.ChartType/Line")) {
        _this.showValueHelp = false;
      } else if (oProps.renderLineChart === "false" && sChartType === "UI.ChartType/Line") {
        _this.showValueHelp = false;
      } else {
        _this.showValueHelp = true;
      }
      _this.chartType = sChartType;
      _this.draftSupported = ModelHelper.isDraftSupported(mSettings.models.metaModel, (_oProps$contextPath = oProps.contextPath) === null || _oProps$contextPath === void 0 ? void 0 : _oProps$contextPath.getPath());
      /**
       * If the measure of the chart is marked as 'hidden', or if the chart type is invalid, or if the data type for the line chart is invalid,
       * the call is made to the InteractiveChartWithError fragment (using error-message related APIs, but avoiding batch calls)
       */
      if (typeof bHiddenMeasure === "boolean" && bHiddenMeasure || !validChartType || oProps.renderLineChart === "false") {
        _this.showError = true;
        _this.errorMessageTitle = bHiddenMeasure || !validChartType ? ResourceModel.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE") : ResourceModel.getText("M_VISUAL_FILTER_LINE_CHART_INVALID_DATATYPE");
        if (bHiddenMeasure) {
          _this.errorMessage = ResourceModel.getText("M_VISUAL_FILTER_HIDDEN_MEASURE", [sMeasure]);
        } else if (!validChartType) {
          _this.errorMessage = ResourceModel.getText("M_VISUAL_FILTER_UNSUPPORTED_CHART_TYPE");
        } else {
          _this.errorMessage = ResourceModel.getText("M_VISUAL_FILTER_LINE_CHART_UNSUPPORTED_DIMENSION");
        }
      }
      _this.chartMeasure = sMeasure;
      const chartPath = _this.sMetaPath + "Visualizations/0/$AnnotationPath";
      const chartAnnotationContext = (_this$metaPath3 = _this.metaPath) === null || _this$metaPath3 === void 0 ? void 0 : _this$metaPath3.getModel().createBindingContext(chartPath, chartAnnotation);
      _this._measureDimensionTitle = InteractiveChartHelper.getMeasureDimensionTitle(chartAnnotationContext, chartAnnotation, oProps.contextPath, _this.bCustomAggregate, _this.aggregateProperties);
      _this._toolTip = InteractiveChartHelper.getToolTip(chartAnnotationContext, chartAnnotation, oProps.contextPath, _this.sMetaPath, _this.bCustomAggregate, _this.aggregateProperties, _this.renderLineChart);
      _this._UoMVisibility = InteractiveChartHelper.getUoMVisiblity(chartAnnotation, _this.showError);
      _this._scaleUoMTitle = InteractiveChartHelper.getScaleUoMTitle(chartAnnotationContext, chartAnnotation, oProps.contextPath, _this.sMetaPath, _this.bCustomAggregate, _this.aggregateProperties);
      _this._filterCountBinding = InteractiveChartHelper.getfilterCountBinding(chartAnnotation);
      return _this;
    }
    _exports = VisualFilterBuildingBlock;
    var _proto = VisualFilterBuildingBlock.prototype;
    _proto.getAggregateProperties = function getAggregateProperties(aAggregations, sMeasure) {
      let oMatchedAggregate;
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
    };
    _proto.getUoM = function getUoM(measures, aggregatablePropertyMeasures) {
      var _vISOCurrency, _vUnit;
      let vISOCurrency = measures === null || measures === void 0 ? void 0 : measures.ISOCurrency;
      let vUnit = measures === null || measures === void 0 ? void 0 : measures.Unit;
      if (!vISOCurrency && !vUnit && aggregatablePropertyMeasures) {
        vISOCurrency = aggregatablePropertyMeasures.ISOCurrency;
        vUnit = aggregatablePropertyMeasures.Unit;
      }
      return ((_vISOCurrency = vISOCurrency) === null || _vISOCurrency === void 0 ? void 0 : _vISOCurrency.path) || ((_vUnit = vUnit) === null || _vUnit === void 0 ? void 0 : _vUnit.path);
    };
    _proto.getHiddenMeasure = function getHiddenMeasure(propertyHidden, aggregatablePropertyHidden, bCustomAggregate) {
      if (!bCustomAggregate && aggregatablePropertyHidden) {
        return aggregatablePropertyHidden.valueOf();
      } else {
        return propertyHidden === null || propertyHidden === void 0 ? void 0 : propertyHidden.valueOf();
      }
    };
    _proto.getRequired = function getRequired() {
      if (this.required) {
        return xml`<Label text="" width="0.5rem" required="true">
							<layoutData>
								<OverflowToolbarLayoutData priority="Never" />
							</layoutData>
						</Label>`;
      } else {
        return xml``;
      }
    };
    _proto.getUoMTitle = function getUoMTitle(showErrorExpression) {
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
    };
    _proto.getValueHelp = function getValueHelp(showErrorExpression) {
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
    };
    _proto.getInteractiveChartFragment = function getInteractiveChartFragment() {
      if (this.showError) {
        return xml`<core:Fragment fragmentName="sap.fe.macros.visualfilters.fragments.InteractiveChartWithError" type="XML" />`;
      } else if (this.chartType === "UI.ChartType/Bar") {
        return xml`<core:Fragment fragmentName="sap.fe.macros.visualfilters.fragments.InteractiveBarChart" type="XML" />`;
      } else {
        return xml`<core:Fragment fragmentName="sap.fe.macros.visualfilters.fragments.InteractiveLineChart" type="XML" />`;
      }
    };
    _proto.getTemplate = function getTemplate() {
      var _this$metaPath4;
      const id = generate([this.sMetaPath]);
      const showErrorExpression = "${internal>" + id + "/showError}";
      const sMetaPath = (_this$metaPath4 = this.metaPath) === null || _this$metaPath4 === void 0 ? void 0 : _this$metaPath4.getPath();
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
    };
    return VisualFilterBuildingBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "outParameter", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "valuelistProperty", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "selectionVariantAnnotation", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "inParameters", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "multipleSelectionAllowed", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "required", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "showOverlayInitially", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "renderLineChart", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "requiredProperties", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "filterBarEntityType", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "showError", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "chartMeasure", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "bUoMHasCustomAggregate", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "showValueHelp", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "bCustomAggregate", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "groupId", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "errorMessageTitle", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "errorMessage", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "draftSupported", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = VisualFilterBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXJCdWlsZGluZ0Jsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJyZXF1aXJlZCIsIiRraW5kIiwib1Byb3BzIiwiY29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsImdyb3VwSWQiLCJpblBhcmFtZXRlcnMiLCJtZXRhUGF0aCIsInNNZXRhUGF0aCIsImdldFBhdGgiLCJvQ29udGV4dE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJjb250ZXh0UGF0aCIsIm9Db252ZXJ0ZXJDb250ZXh0IiwiZ2V0Q29udmVydGVyQ29udGV4dCIsInVuZGVmaW5lZCIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiQWdncmVnYXRpb25IZWxwZXIiLCJnZXRFbnRpdHlUeXBlIiwiY3VzdG9tQWdncmVnYXRlcyIsImdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zIiwicHZBbm5vdGF0aW9uIiwidGFyZ2V0T2JqZWN0IiwiY2hhcnRBbm5vdGF0aW9uIiwic01lYXN1cmUiLCJhVmlzdWFsaXphdGlvbnMiLCJWaXN1YWxpemF0aW9ucyIsImkiLCJsZW5ndGgiLCJzQW5ub3RhdGlvblBhdGgiLCJ2YWx1ZSIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwiYW5ub3RhdGlvbiIsImFBZ2dyZWdhdGlvbnMiLCJhQ3VzdEFnZ01lYXN1cmUiLCJNZWFzdXJlcyIsImZpbHRlciIsImN1c3RBZ2ciLCJxdWFsaWZpZXIiLCJnZXRBZ2dyZWdhdGVkUHJvcGVydGllcyIsIkR5bmFtaWNNZWFzdXJlcyIsIkxvZyIsIndhcm5pbmciLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yIiwiZ2V0QWJzb2x1dGVBbm5vdGF0aW9uUGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJOYW1lIiwidmFsaWRDaGFydFR5cGUiLCJDaGFydFR5cGUiLCJzb21lIiwiYkN1c3RvbUFnZ3JlZ2F0ZSIsInNlbGVjdGlvblZhcmlhbnQiLCJzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbiIsInNlbGVjdGlvblZhcmlhbnRDb250ZXh0IiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImlTZWxlY3RPcHRpb25zRm9yRGltZW5zaW9uIiwibXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkIiwiaiIsIlNlbGVjdE9wdGlvbnMiLCJQcm9wZXJ0eU5hbWUiLCJEaW1lbnNpb25zIiwiRXJyb3IiLCJvQWdncmVnYXRpb24iLCJnZXRBZ2dyZWdhdGVQcm9wZXJ0aWVzIiwiYWdncmVnYXRlUHJvcGVydGllcyIsInByb3BlcnR5QW5ub3RhdGlvbnMiLCIkdGFyZ2V0IiwiYW5ub3RhdGlvbnMiLCJhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zIiwiQWdncmVnYXRhYmxlUHJvcGVydHkiLCJtZWFzdXJlcyIsImFnZ3JlZ2F0YWJsZVByb3BlcnR5TWVhc3VyZXMiLCJ2VU9NIiwiZ2V0VW9NIiwiYlVvTUhhc0N1c3RvbUFnZ3JlZ2F0ZSIsInByb3BlcnR5SGlkZGVuIiwiVUkiLCJIaWRkZW4iLCJhZ2dyZWdhdGFibGVQcm9wZXJ0eUhpZGRlbiIsImJIaWRkZW5NZWFzdXJlIiwiZ2V0SGlkZGVuTWVhc3VyZSIsInNEaW1lbnNpb25UeXBlIiwic0NoYXJ0VHlwZSIsInNob3dWYWx1ZUhlbHAiLCJyZW5kZXJMaW5lQ2hhcnQiLCJjaGFydFR5cGUiLCJkcmFmdFN1cHBvcnRlZCIsIk1vZGVsSGVscGVyIiwiaXNEcmFmdFN1cHBvcnRlZCIsIm1vZGVscyIsIm1ldGFNb2RlbCIsInNob3dFcnJvciIsImVycm9yTWVzc2FnZVRpdGxlIiwiUmVzb3VyY2VNb2RlbCIsImdldFRleHQiLCJlcnJvck1lc3NhZ2UiLCJjaGFydE1lYXN1cmUiLCJjaGFydFBhdGgiLCJjaGFydEFubm90YXRpb25Db250ZXh0IiwiX21lYXN1cmVEaW1lbnNpb25UaXRsZSIsIkludGVyYWN0aXZlQ2hhcnRIZWxwZXIiLCJnZXRNZWFzdXJlRGltZW5zaW9uVGl0bGUiLCJfdG9vbFRpcCIsImdldFRvb2xUaXAiLCJfVW9NVmlzaWJpbGl0eSIsImdldFVvTVZpc2libGl0eSIsIl9zY2FsZVVvTVRpdGxlIiwiZ2V0U2NhbGVVb01UaXRsZSIsIl9maWx0ZXJDb3VudEJpbmRpbmciLCJnZXRmaWx0ZXJDb3VudEJpbmRpbmciLCJvTWF0Y2hlZEFnZ3JlZ2F0ZSIsIm9BZ2dyZWdhdGUiLCJ2SVNPQ3VycmVuY3kiLCJJU09DdXJyZW5jeSIsInZVbml0IiwiVW5pdCIsInBhdGgiLCJ2YWx1ZU9mIiwiZ2V0UmVxdWlyZWQiLCJ4bWwiLCJnZXRVb01UaXRsZSIsInNob3dFcnJvckV4cHJlc3Npb24iLCJnZW5lcmF0ZSIsImlkIiwiZ2V0VmFsdWVIZWxwIiwiZ2V0SW50ZXJhY3RpdmVDaGFydEZyYWdtZW50IiwiZ2V0VGVtcGxhdGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlzdWFsRmlsdGVyQnVpbGRpbmdCbG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IEFnZ3JlZ2F0ZWRQcm9wZXJ0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FuYWx5dGljc1wiO1xuaW1wb3J0IHsgUHJvcGVydHlBbm5vdGF0aW9uc19NZWFzdXJlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvTWVhc3VyZXNfRWRtXCI7XG5pbXBvcnQgeyBDaGFydCwgSGlkZGVuIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tSdW50aW1lXCI7XG5pbXBvcnQgeyBBZ2dyZWdhdGlvbkhlbHBlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcIi4uL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBJbnRlcmFjdGl2ZUNoYXJ0SGVscGVyIGZyb20gXCIuL0ludGVyYWN0aXZlQ2hhcnRIZWxwZXJcIjtcblxuLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBWaXN1YWxGaWx0ZXIgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogQSBDaGFydCBhbm5vdGF0aW9uIGlzIHJlcXVpcmVkIHRvIGJyaW5nIHVwIGFuIGludGVyYWN0aXZlIGNoYXJ0XG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOlZpc3VhbEZpbHRlclxuICogICBjb2xsZWN0aW9uPVwie2VudGl0eVNldCZndDt9XCJcbiAqICAgY2hhcnRBbm5vdGF0aW9uPVwie2NoYXJ0QW5ub3RhdGlvbiZndDt9XCJcbiAqICAgaWQ9XCJzb21lSURcIlxuICogICBncm91cElkPVwic29tZUdyb3VwSURcIlxuICogICB0aXRsZT1cInNvbWUgVGl0bGVcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICogQGNsYXNzIHNhcC5mZS5tYWNyb3MuVmlzdWFsRmlsdGVyXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiVmlzdWFsRmlsdGVyXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaXN1YWxGaWx0ZXJCdWlsZGluZ0Jsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0aWQhOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGRlZmF1bHRWYWx1ZTogXCJcIlxuXHR9KVxuXHR0aXRsZSE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHQka2luZDogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIlxuXHR9KVxuXHRtZXRhUGF0aD86IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdG91dFBhcmFtZXRlciE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dmFsdWVsaXN0UHJvcGVydHkhOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0fSlcblx0c2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24hOiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdGluUGFyYW1ldGVycz86IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRtdWx0aXBsZVNlbGVjdGlvbkFsbG93ZWQhOiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0cmVxdWlyZWQhOiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0c2hvd092ZXJsYXlJbml0aWFsbHkhOiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRyZW5kZXJMaW5lQ2hhcnQhOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHJlcXVpcmVkUHJvcGVydGllcyE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIlxuXHR9KVxuXHRmaWx0ZXJCYXJFbnRpdHlUeXBlITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHNob3dFcnJvciE6IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdGNoYXJ0TWVhc3VyZT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdGJVb01IYXNDdXN0b21BZ2dyZWdhdGUhOiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0c2hvd1ZhbHVlSGVscCE6IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdH0pXG5cdGJDdXN0b21BZ2dyZWdhdGUhOiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiJGF1dG8udmlzdWFsRmlsdGVyc1wiXG5cdH0pXG5cdGdyb3VwSWQhOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdGVycm9yTWVzc2FnZVRpdGxlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRlcnJvck1lc3NhZ2U/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRkcmFmdFN1cHBvcnRlZDogYm9vbGVhbjtcblxuXHRhZ2dyZWdhdGVQcm9wZXJ0aWVzOiBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlIHwgdW5kZWZpbmVkO1xuXHRjaGFydFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c01ldGFQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdF9tZWFzdXJlRGltZW5zaW9uVGl0bGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0X3Rvb2xUaXA6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0X1VvTVZpc2liaWxpdHk6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdF9zY2FsZVVvTVRpdGxlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdF9maWx0ZXJDb3VudEJpbmRpbmc6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHRjb25zdHJ1Y3RvcihvUHJvcHM6IFByb3BlcnRpZXNPZjxWaXN1YWxGaWx0ZXJCdWlsZGluZ0Jsb2NrPiwgY29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdHN1cGVyKG9Qcm9wcywgY29uZmlndXJhdGlvbiwgbVNldHRpbmdzKTtcblx0XHR0aGlzLmdyb3VwSWQgPSBcIiRhdXRvLnZpc3VhbEZpbHRlcnNcIjtcblx0XHR0aGlzLmluUGFyYW1ldGVycyA9IG9Qcm9wcy5pblBhcmFtZXRlcnM7XG5cdFx0dGhpcy5tZXRhUGF0aCA9IG9Qcm9wcy5tZXRhUGF0aDtcblx0XHR0aGlzLnNNZXRhUGF0aCA9IHRoaXMubWV0YVBhdGg/LmdldFBhdGgoKTtcblx0XHRjb25zdCBvQ29udGV4dE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5tZXRhUGF0aCBhcyBDb250ZXh0LCBvUHJvcHMuY29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IG9Db252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5nZXRDb252ZXJ0ZXJDb250ZXh0KG9Db250ZXh0T2JqZWN0UGF0aCwgdW5kZWZpbmVkLCBtU2V0dGluZ3MpO1xuXHRcdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKG9Db252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgb0NvbnZlcnRlckNvbnRleHQpO1xuXHRcdGNvbnN0IGN1c3RvbUFnZ3JlZ2F0ZXMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucygpO1xuXHRcdGNvbnN0IHB2QW5ub3RhdGlvbiA9IG9Db250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0bGV0IGNoYXJ0QW5ub3RhdGlvbjogQ2hhcnQgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHNNZWFzdXJlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgYVZpc3VhbGl6YXRpb25zID0gcHZBbm5vdGF0aW9uICYmIHB2QW5ub3RhdGlvbi5WaXN1YWxpemF0aW9ucztcblx0XHRpZiAoYVZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFWaXN1YWxpemF0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBwdkFubm90YXRpb24uVmlzdWFsaXphdGlvbnNbaV0gJiYgcHZBbm5vdGF0aW9uLlZpc3VhbGl6YXRpb25zW2ldLnZhbHVlO1xuXHRcdFx0XHRjaGFydEFubm90YXRpb24gPVxuXHRcdFx0XHRcdG9Db252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKHNBbm5vdGF0aW9uUGF0aCkgJiZcblx0XHRcdFx0XHRvQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihzQW5ub3RhdGlvblBhdGgpLmFubm90YXRpb247XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGxldCBhQWdncmVnYXRpb25zLFxuXHRcdFx0YUN1c3RBZ2dNZWFzdXJlID0gW107XG5cblx0XHRpZiAoY2hhcnRBbm5vdGF0aW9uPy5NZWFzdXJlcz8ubGVuZ3RoKSB7XG5cdFx0XHRhQ3VzdEFnZ01lYXN1cmUgPSBjdXN0b21BZ2dyZWdhdGVzLmZpbHRlcihmdW5jdGlvbiAoY3VzdEFnZykge1xuXHRcdFx0XHRyZXR1cm4gY3VzdEFnZy5xdWFsaWZpZXIgPT09IGNoYXJ0QW5ub3RhdGlvbj8uTWVhc3VyZXNbMF0udmFsdWU7XG5cdFx0XHR9KTtcblx0XHRcdHNNZWFzdXJlID0gYUN1c3RBZ2dNZWFzdXJlLmxlbmd0aCA+IDAgPyBhQ3VzdEFnZ01lYXN1cmVbMF0ucXVhbGlmaWVyIDogY2hhcnRBbm5vdGF0aW9uLk1lYXN1cmVzWzBdLnZhbHVlO1xuXHRcdFx0YUFnZ3JlZ2F0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFwiQWdncmVnYXRlZFByb3BlcnRpZXNcIilbMF07XG5cdFx0fVxuXHRcdC8vIGlmIHRoZXJlIGFyZSBBZ2dyZWdhdGVkUHJvcGVydHkgb2JqZWN0cyBidXQgbm8gZHluYW1pYyBtZWFzdXJlcywgcmF0aGVyIHRoZXJlIGFyZSB0cmFuc2Zvcm1hdGlvbiBhZ2dyZWdhdGVzIGZvdW5kIGluIG1lYXN1cmVzXG5cdFx0aWYgKFxuXHRcdFx0YUFnZ3JlZ2F0aW9ucyAmJlxuXHRcdFx0YUFnZ3JlZ2F0aW9ucy5sZW5ndGggPiAwICYmXG5cdFx0XHQhY2hhcnRBbm5vdGF0aW9uPy5EeW5hbWljTWVhc3VyZXMgJiZcblx0XHRcdGFDdXN0QWdnTWVhc3VyZS5sZW5ndGggPT09IDAgJiZcblx0XHRcdGNoYXJ0QW5ub3RhdGlvbj8uTWVhc3VyZXMgJiZcblx0XHRcdGNoYXJ0QW5ub3RhdGlvbj8uTWVhc3VyZXMubGVuZ3RoID4gMFxuXHRcdCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFwiVGhlIHRyYW5zZm9ybWF0aW9uYWwgYWdncmVnYXRlIG1lYXN1cmVzIGFyZSBjb25maWd1cmVkIGFzIENoYXJ0Lk1lYXN1cmVzIGJ1dCBzaG91bGQgYmUgY29uZmlndXJlZCBhcyBDaGFydC5EeW5hbWljTWVhc3VyZXMgaW5zdGVhZC4gUGxlYXNlIGNoZWNrIHRoZSBTQVAgSGVscCBkb2N1bWVudGF0aW9uIGFuZCBjb3JyZWN0IHRoZSBjb25maWd1cmF0aW9uIGFjY29yZGluZ2x5LlwiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHQvL2lmIHRoZSBjaGFydCBoYXMgZHluYW1pYyBtZWFzdXJlcywgYnV0IHdpdGggbm8gb3RoZXIgY3VzdG9tIGFnZ3JlZ2F0ZSBtZWFzdXJlcyB0aGVuIGNvbnNpZGVyIHRoZSBkeW5hbWljIG1lYXN1cmVzXG5cdFx0aWYgKGNoYXJ0QW5ub3RhdGlvbj8uRHluYW1pY01lYXN1cmVzKSB7XG5cdFx0XHRpZiAoYUN1c3RBZ2dNZWFzdXJlLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRzTWVhc3VyZSA9IG9Db252ZXJ0ZXJDb250ZXh0XG5cdFx0XHRcdFx0LmdldENvbnZlcnRlckNvbnRleHRGb3Iob0NvbnZlcnRlckNvbnRleHQuZ2V0QWJzb2x1dGVBbm5vdGF0aW9uUGF0aChjaGFydEFubm90YXRpb24uRHluYW1pY01lYXN1cmVzWzBdLnZhbHVlKSlcblx0XHRcdFx0XHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdC5OYW1lO1xuXHRcdFx0XHRhQWdncmVnYXRpb25zID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMoXCJBZ2dyZWdhdGVkUHJvcGVydHlcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRMb2cud2FybmluZyhcblx0XHRcdFx0XHRcIlRoZSBkeW5hbWljIG1lYXN1cmVzIGhhdmUgYmVlbiBpZ25vcmVkIGFzIHZpc3VhbCBmaWx0ZXJzIGNhbiBkZWFsIHdpdGggb25seSAxIG1lYXN1cmUgYW5kIHRoZSBmaXJzdCAoY3VzdG9tIGFnZ3JlZ2F0ZSkgbWVhc3VyZSBkZWZpbmVkIHVuZGVyIENoYXJ0Lk1lYXN1cmVzIGlzIGNvbnNpZGVyZWQuXCJcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0bGV0IHZhbGlkQ2hhcnRUeXBlO1xuXHRcdGlmIChjaGFydEFubm90YXRpb24pIHtcblx0XHRcdGlmIChjaGFydEFubm90YXRpb24uQ2hhcnRUeXBlID09PSBcIlVJLkNoYXJ0VHlwZS9MaW5lXCIgfHwgY2hhcnRBbm5vdGF0aW9uLkNoYXJ0VHlwZSA9PT0gXCJVSS5DaGFydFR5cGUvQmFyXCIpIHtcblx0XHRcdFx0dmFsaWRDaGFydFR5cGUgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsaWRDaGFydFR5cGUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKFxuXHRcdFx0Y3VzdG9tQWdncmVnYXRlcy5zb21lKGZ1bmN0aW9uIChjdXN0QWdnKSB7XG5cdFx0XHRcdHJldHVybiBjdXN0QWdnLnF1YWxpZmllciA9PT0gc01lYXN1cmU7XG5cdFx0XHR9KVxuXHRcdCkge1xuXHRcdFx0dGhpcy5iQ3VzdG9tQWdncmVnYXRlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRsZXQgc2VsZWN0aW9uVmFyaWFudDtcblx0XHRpZiAob1Byb3BzLnNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uKSB7XG5cdFx0XHRjb25zdCBzZWxlY3Rpb25WYXJpYW50Q29udGV4dCA9IHRoaXMubWV0YVBhdGg/LmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQob1Byb3BzLnNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLmdldFBhdGgoKSk7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50ID1cblx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudENvbnRleHQgJiYgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHNlbGVjdGlvblZhcmlhbnRDb250ZXh0LCBvUHJvcHMuY29udGV4dFBhdGgpLnRhcmdldE9iamVjdDtcblx0XHR9XG5cdFx0bGV0IGlTZWxlY3RPcHRpb25zRm9yRGltZW5zaW9uID0gMDtcblx0XHRpZiAoc2VsZWN0aW9uVmFyaWFudCAmJiAhb1Byb3BzLm11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZCkge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBzZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0aWYgKHNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9uc1tqXS5Qcm9wZXJ0eU5hbWUudmFsdWUgPT09IGNoYXJ0QW5ub3RhdGlvbj8uRGltZW5zaW9uc1swXS52YWx1ZSkge1xuXHRcdFx0XHRcdGlTZWxlY3RPcHRpb25zRm9yRGltZW5zaW9uKys7XG5cdFx0XHRcdFx0aWYgKGlTZWxlY3RPcHRpb25zRm9yRGltZW5zaW9uID4gMSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTXVsdGlwbGUgU2VsZWN0T3B0aW9ucyBmb3IgRmlsdGVyRmllbGQgaGF2aW5nIFNpbmdsZVZhbHVlIEFsbG93ZWQgRXhwcmVzc2lvblwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBvQWdncmVnYXRpb24gPSB0aGlzLmdldEFnZ3JlZ2F0ZVByb3BlcnRpZXMoYUFnZ3JlZ2F0aW9ucywgc01lYXN1cmUpO1xuXG5cdFx0aWYgKG9BZ2dyZWdhdGlvbikge1xuXHRcdFx0dGhpcy5hZ2dyZWdhdGVQcm9wZXJ0aWVzID0gb0FnZ3JlZ2F0aW9uO1xuXHRcdH1cblx0XHRjb25zdCBwcm9wZXJ0eUFubm90YXRpb25zID0gYVZpc3VhbGl6YXRpb25zWzBdPy4kdGFyZ2V0Py5NZWFzdXJlcyAmJiBhVmlzdWFsaXphdGlvbnNbMF0/LiR0YXJnZXQ/Lk1lYXN1cmVzWzBdPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucztcblx0XHRjb25zdCBhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zID0gb0FnZ3JlZ2F0aW9uPy5BZ2dyZWdhdGFibGVQcm9wZXJ0eT8uJHRhcmdldD8uYW5ub3RhdGlvbnM7XG5cdFx0Y29uc3QgbWVhc3VyZXMgPSBwcm9wZXJ0eUFubm90YXRpb25zPy5NZWFzdXJlcztcblx0XHRjb25zdCBhZ2dyZWdhdGFibGVQcm9wZXJ0eU1lYXN1cmVzID0gYWdncmVnYXRhYmxlUHJvcGVydHlBbm5vdGF0aW9ucz8uTWVhc3VyZXM7XG5cdFx0Y29uc3QgdlVPTSA9IHRoaXMuZ2V0VW9NKG1lYXN1cmVzLCBhZ2dyZWdhdGFibGVQcm9wZXJ0eU1lYXN1cmVzKTtcblx0XHRpZiAoXG5cdFx0XHR2VU9NICYmXG5cdFx0XHRjdXN0b21BZ2dyZWdhdGVzLnNvbWUoZnVuY3Rpb24gKGN1c3RBZ2cpIHtcblx0XHRcdFx0cmV0dXJuIGN1c3RBZ2cucXVhbGlmaWVyID09PSB2VU9NO1xuXHRcdFx0fSlcblx0XHQpIHtcblx0XHRcdHRoaXMuYlVvTUhhc0N1c3RvbUFnZ3JlZ2F0ZSA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYlVvTUhhc0N1c3RvbUFnZ3JlZ2F0ZSA9IGZhbHNlO1xuXHRcdH1cblx0XHRjb25zdCBwcm9wZXJ0eUhpZGRlbiA9IHByb3BlcnR5QW5ub3RhdGlvbnM/LlVJPy5IaWRkZW47XG5cdFx0Y29uc3QgYWdncmVnYXRhYmxlUHJvcGVydHlIaWRkZW4gPSBhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zPy5VST8uSGlkZGVuO1xuXHRcdGNvbnN0IGJIaWRkZW5NZWFzdXJlID0gdGhpcy5nZXRIaWRkZW5NZWFzdXJlKHByb3BlcnR5SGlkZGVuLCBhZ2dyZWdhdGFibGVQcm9wZXJ0eUhpZGRlbiwgdGhpcy5iQ3VzdG9tQWdncmVnYXRlKTtcblx0XHRjb25zdCBzRGltZW5zaW9uVHlwZSA9XG5cdFx0XHRjaGFydEFubm90YXRpb24/LkRpbWVuc2lvbnNbMF0gJiYgY2hhcnRBbm5vdGF0aW9uPy5EaW1lbnNpb25zWzBdLiR0YXJnZXQgJiYgY2hhcnRBbm5vdGF0aW9uLkRpbWVuc2lvbnNbMF0uJHRhcmdldC50eXBlO1xuXHRcdGNvbnN0IHNDaGFydFR5cGUgPSBjaGFydEFubm90YXRpb24/LkNoYXJ0VHlwZTtcblx0XHRpZiAoc0RpbWVuc2lvblR5cGUgPT09IFwiRWRtLkRhdGVcIiB8fCBzRGltZW5zaW9uVHlwZSA9PT0gXCJFZG0uVGltZVwiIHx8IHNEaW1lbnNpb25UeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiKSB7XG5cdFx0XHR0aGlzLnNob3dWYWx1ZUhlbHAgPSBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBiSGlkZGVuTWVhc3VyZSA9PT0gXCJib29sZWFuXCIgJiYgYkhpZGRlbk1lYXN1cmUpIHtcblx0XHRcdHRoaXMuc2hvd1ZhbHVlSGVscCA9IGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoIShzQ2hhcnRUeXBlID09PSBcIlVJLkNoYXJ0VHlwZS9CYXJcIiB8fCBzQ2hhcnRUeXBlID09PSBcIlVJLkNoYXJ0VHlwZS9MaW5lXCIpKSB7XG5cdFx0XHR0aGlzLnNob3dWYWx1ZUhlbHAgPSBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKG9Qcm9wcy5yZW5kZXJMaW5lQ2hhcnQgPT09IFwiZmFsc2VcIiAmJiBzQ2hhcnRUeXBlID09PSBcIlVJLkNoYXJ0VHlwZS9MaW5lXCIpIHtcblx0XHRcdHRoaXMuc2hvd1ZhbHVlSGVscCA9IGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNob3dWYWx1ZUhlbHAgPSB0cnVlO1xuXHRcdH1cblx0XHR0aGlzLmNoYXJ0VHlwZSA9IHNDaGFydFR5cGU7XG5cdFx0dGhpcy5kcmFmdFN1cHBvcnRlZCA9IE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQobVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwsIG9Qcm9wcy5jb250ZXh0UGF0aD8uZ2V0UGF0aCgpIGFzIHN0cmluZyk7XG5cdFx0LyoqXG5cdFx0ICogSWYgdGhlIG1lYXN1cmUgb2YgdGhlIGNoYXJ0IGlzIG1hcmtlZCBhcyAnaGlkZGVuJywgb3IgaWYgdGhlIGNoYXJ0IHR5cGUgaXMgaW52YWxpZCwgb3IgaWYgdGhlIGRhdGEgdHlwZSBmb3IgdGhlIGxpbmUgY2hhcnQgaXMgaW52YWxpZCxcblx0XHQgKiB0aGUgY2FsbCBpcyBtYWRlIHRvIHRoZSBJbnRlcmFjdGl2ZUNoYXJ0V2l0aEVycm9yIGZyYWdtZW50ICh1c2luZyBlcnJvci1tZXNzYWdlIHJlbGF0ZWQgQVBJcywgYnV0IGF2b2lkaW5nIGJhdGNoIGNhbGxzKVxuXHRcdCAqL1xuXHRcdGlmICgodHlwZW9mIGJIaWRkZW5NZWFzdXJlID09PSBcImJvb2xlYW5cIiAmJiBiSGlkZGVuTWVhc3VyZSkgfHwgIXZhbGlkQ2hhcnRUeXBlIHx8IG9Qcm9wcy5yZW5kZXJMaW5lQ2hhcnQgPT09IFwiZmFsc2VcIikge1xuXHRcdFx0dGhpcy5zaG93RXJyb3IgPSB0cnVlO1xuXHRcdFx0dGhpcy5lcnJvck1lc3NhZ2VUaXRsZSA9XG5cdFx0XHRcdGJIaWRkZW5NZWFzdXJlIHx8ICF2YWxpZENoYXJ0VHlwZVxuXHRcdFx0XHRcdD8gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpXG5cdFx0XHRcdFx0OiBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJfTElORV9DSEFSVF9JTlZBTElEX0RBVEFUWVBFXCIpO1xuXHRcdFx0aWYgKGJIaWRkZW5NZWFzdXJlKSB7XG5cdFx0XHRcdHRoaXMuZXJyb3JNZXNzYWdlID0gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSX0hJRERFTl9NRUFTVVJFXCIsIFtzTWVhc3VyZV0pO1xuXHRcdFx0fSBlbHNlIGlmICghdmFsaWRDaGFydFR5cGUpIHtcblx0XHRcdFx0dGhpcy5lcnJvck1lc3NhZ2UgPSBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJfVU5TVVBQT1JURURfQ0hBUlRfVFlQRVwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuZXJyb3JNZXNzYWdlID0gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSX0xJTkVfQ0hBUlRfVU5TVVBQT1JURURfRElNRU5TSU9OXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmNoYXJ0TWVhc3VyZSA9IHNNZWFzdXJlO1xuXHRcdGNvbnN0IGNoYXJ0UGF0aCA9IHRoaXMuc01ldGFQYXRoICsgXCJWaXN1YWxpemF0aW9ucy8wLyRBbm5vdGF0aW9uUGF0aFwiO1xuXHRcdGNvbnN0IGNoYXJ0QW5ub3RhdGlvbkNvbnRleHQgPSB0aGlzLm1ldGFQYXRoPy5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGNoYXJ0UGF0aCwgY2hhcnRBbm5vdGF0aW9uIGFzIGFueSk7XG5cdFx0dGhpcy5fbWVhc3VyZURpbWVuc2lvblRpdGxlID0gSW50ZXJhY3RpdmVDaGFydEhlbHBlci5nZXRNZWFzdXJlRGltZW5zaW9uVGl0bGUoXG5cdFx0XHRjaGFydEFubm90YXRpb25Db250ZXh0LFxuXHRcdFx0Y2hhcnRBbm5vdGF0aW9uLFxuXHRcdFx0b1Byb3BzLmNvbnRleHRQYXRoLFxuXHRcdFx0dGhpcy5iQ3VzdG9tQWdncmVnYXRlLFxuXHRcdFx0dGhpcy5hZ2dyZWdhdGVQcm9wZXJ0aWVzXG5cdFx0KTtcblx0XHR0aGlzLl90b29sVGlwID0gSW50ZXJhY3RpdmVDaGFydEhlbHBlci5nZXRUb29sVGlwKFxuXHRcdFx0Y2hhcnRBbm5vdGF0aW9uQ29udGV4dCxcblx0XHRcdGNoYXJ0QW5ub3RhdGlvbixcblx0XHRcdG9Qcm9wcy5jb250ZXh0UGF0aCxcblx0XHRcdHRoaXMuc01ldGFQYXRoLFxuXHRcdFx0dGhpcy5iQ3VzdG9tQWdncmVnYXRlLFxuXHRcdFx0dGhpcy5hZ2dyZWdhdGVQcm9wZXJ0aWVzLFxuXHRcdFx0dGhpcy5yZW5kZXJMaW5lQ2hhcnRcblx0XHQpO1xuXHRcdHRoaXMuX1VvTVZpc2liaWxpdHkgPSBJbnRlcmFjdGl2ZUNoYXJ0SGVscGVyLmdldFVvTVZpc2libGl0eShjaGFydEFubm90YXRpb24sIHRoaXMuc2hvd0Vycm9yKTtcblx0XHR0aGlzLl9zY2FsZVVvTVRpdGxlID0gSW50ZXJhY3RpdmVDaGFydEhlbHBlci5nZXRTY2FsZVVvTVRpdGxlKFxuXHRcdFx0Y2hhcnRBbm5vdGF0aW9uQ29udGV4dCxcblx0XHRcdGNoYXJ0QW5ub3RhdGlvbixcblx0XHRcdG9Qcm9wcy5jb250ZXh0UGF0aCxcblx0XHRcdHRoaXMuc01ldGFQYXRoLFxuXHRcdFx0dGhpcy5iQ3VzdG9tQWdncmVnYXRlLFxuXHRcdFx0dGhpcy5hZ2dyZWdhdGVQcm9wZXJ0aWVzXG5cdFx0KTtcblx0XHR0aGlzLl9maWx0ZXJDb3VudEJpbmRpbmcgPSBJbnRlcmFjdGl2ZUNoYXJ0SGVscGVyLmdldGZpbHRlckNvdW50QmluZGluZyhjaGFydEFubm90YXRpb24pO1xuXHR9XG5cblx0Z2V0QWdncmVnYXRlUHJvcGVydGllcyhhQWdncmVnYXRpb25zOiBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlW10sIHNNZWFzdXJlPzogc3RyaW5nKSB7XG5cdFx0bGV0IG9NYXRjaGVkQWdncmVnYXRlOiBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlIHwgdW5kZWZpbmVkO1xuXHRcdGlmICghYUFnZ3JlZ2F0aW9ucykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRhQWdncmVnYXRpb25zLnNvbWUoZnVuY3Rpb24gKG9BZ2dyZWdhdGUpIHtcblx0XHRcdGlmIChvQWdncmVnYXRlLk5hbWUgPT09IHNNZWFzdXJlKSB7XG5cdFx0XHRcdG9NYXRjaGVkQWdncmVnYXRlID0gb0FnZ3JlZ2F0ZTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG9NYXRjaGVkQWdncmVnYXRlO1xuXHR9XG5cblx0Z2V0VW9NKG1lYXN1cmVzPzogUHJvcGVydHlBbm5vdGF0aW9uc19NZWFzdXJlcywgYWdncmVnYXRhYmxlUHJvcGVydHlNZWFzdXJlcz86IFByb3BlcnR5QW5ub3RhdGlvbnNfTWVhc3VyZXMpIHtcblx0XHRsZXQgdklTT0N1cnJlbmN5ID0gbWVhc3VyZXM/LklTT0N1cnJlbmN5O1xuXHRcdGxldCB2VW5pdCA9IG1lYXN1cmVzPy5Vbml0O1xuXHRcdGlmICghdklTT0N1cnJlbmN5ICYmICF2VW5pdCAmJiBhZ2dyZWdhdGFibGVQcm9wZXJ0eU1lYXN1cmVzKSB7XG5cdFx0XHR2SVNPQ3VycmVuY3kgPSBhZ2dyZWdhdGFibGVQcm9wZXJ0eU1lYXN1cmVzLklTT0N1cnJlbmN5O1xuXHRcdFx0dlVuaXQgPSBhZ2dyZWdhdGFibGVQcm9wZXJ0eU1lYXN1cmVzLlVuaXQ7XG5cdFx0fVxuXHRcdHJldHVybiAodklTT0N1cnJlbmN5IGFzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxTdHJpbmc+KT8ucGF0aCB8fCAodlVuaXQgYXMgUGF0aEFubm90YXRpb25FeHByZXNzaW9uPFN0cmluZz4pPy5wYXRoO1xuXHR9XG5cblx0Z2V0SGlkZGVuTWVhc3VyZShwcm9wZXJ0eUhpZGRlbjogSGlkZGVuLCBhZ2dyZWdhdGFibGVQcm9wZXJ0eUhpZGRlbj86IEhpZGRlbiwgYkN1c3RvbUFnZ3JlZ2F0ZT86IGJvb2xlYW4pIHtcblx0XHRpZiAoIWJDdXN0b21BZ2dyZWdhdGUgJiYgYWdncmVnYXRhYmxlUHJvcGVydHlIaWRkZW4pIHtcblx0XHRcdHJldHVybiBhZ2dyZWdhdGFibGVQcm9wZXJ0eUhpZGRlbi52YWx1ZU9mKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBwcm9wZXJ0eUhpZGRlbj8udmFsdWVPZigpO1xuXHRcdH1cblx0fVxuXG5cdGdldFJlcXVpcmVkKCkge1xuXHRcdGlmICh0aGlzLnJlcXVpcmVkKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxMYWJlbCB0ZXh0PVwiXCIgd2lkdGg9XCIwLjVyZW1cIiByZXF1aXJlZD1cInRydWVcIj5cblx0XHRcdFx0XHRcdFx0PGxheW91dERhdGE+XG5cdFx0XHRcdFx0XHRcdFx0PE92ZXJmbG93VG9vbGJhckxheW91dERhdGEgcHJpb3JpdHk9XCJOZXZlclwiIC8+XG5cdFx0XHRcdFx0XHRcdDwvbGF5b3V0RGF0YT5cblx0XHRcdFx0XHRcdDwvTGFiZWw+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGBgO1xuXHRcdH1cblx0fVxuXG5cdGdldFVvTVRpdGxlKHNob3dFcnJvckV4cHJlc3Npb246IHN0cmluZykge1xuXHRcdGlmICh0aGlzLl9Vb01WaXNpYmlsaXR5KSB7XG5cdFx0XHRyZXR1cm4geG1sYDxUaXRsZVxuXHRcdFx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiU2NhbGVVb01UaXRsZVwiXSl9XCJcblx0XHRcdFx0XHRcdFx0dmlzaWJsZT1cIns9ICEke3Nob3dFcnJvckV4cHJlc3Npb259fVwiXG5cdFx0XHRcdFx0XHRcdHRleHQ9XCIke3RoaXMuX3NjYWxlVW9NVGl0bGV9XCJcblx0XHRcdFx0XHRcdFx0dGl0bGVTdHlsZT1cIkg2XCJcblx0XHRcdFx0XHRcdFx0bGV2ZWw9XCJIM1wiXG5cdFx0XHRcdFx0XHRcdHdpZHRoPVwiNC4xNXJlbVwiXG5cdFx0XHRcdFx0XHQvPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB4bWxgYDtcblx0XHR9XG5cdH1cblxuXHRnZXRWYWx1ZUhlbHAoc2hvd0Vycm9yRXhwcmVzc2lvbjogc3RyaW5nKSB7XG5cdFx0aWYgKHRoaXMuc2hvd1ZhbHVlSGVscCkge1xuXHRcdFx0cmV0dXJuIHhtbGA8VG9vbGJhclNwYWNlciAvPlxuXHRcdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiVmlzdWFsRmlsdGVyVmFsdWVIZWxwQnV0dG9uXCJdKX1cIlxuXHRcdFx0XHRcdFx0XHR0eXBlPVwiVHJhbnNwYXJlbnRcIlxuXHRcdFx0XHRcdFx0XHRhcmlhSGFzUG9wdXA9XCJEaWFsb2dcIlxuXHRcdFx0XHRcdFx0XHR0ZXh0PVwiJHt0aGlzLl9maWx0ZXJDb3VudEJpbmRpbmd9XCJcblx0XHRcdFx0XHRcdFx0cHJlc3M9XCJWaXN1YWxGaWx0ZXJSdW50aW1lLmZpcmVWYWx1ZUhlbHBcIlxuXHRcdFx0XHRcdFx0XHRlbmFibGVkPVwiez0gISR7c2hvd0Vycm9yRXhwcmVzc2lvbn19XCJcblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0PGxheW91dERhdGE+XG5cdFx0XHRcdFx0XHRcdFx0PE92ZXJmbG93VG9vbGJhckxheW91dERhdGEgcHJpb3JpdHk9XCJOZXZlclwiIC8+XG5cdFx0XHRcdFx0XHRcdDwvbGF5b3V0RGF0YT5cblx0XHRcdFx0XHRcdDwvQnV0dG9uPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB4bWxgYDtcblx0XHR9XG5cdH1cblxuXHRnZXRJbnRlcmFjdGl2ZUNoYXJ0RnJhZ21lbnQoKSB7XG5cdFx0aWYgKHRoaXMuc2hvd0Vycm9yKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MudmlzdWFsZmlsdGVycy5mcmFnbWVudHMuSW50ZXJhY3RpdmVDaGFydFdpdGhFcnJvclwiIHR5cGU9XCJYTUxcIiAvPmA7XG5cdFx0fSBlbHNlIGlmICh0aGlzLmNoYXJ0VHlwZSA9PT0gXCJVSS5DaGFydFR5cGUvQmFyXCIpIHtcblx0XHRcdHJldHVybiB4bWxgPGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy52aXN1YWxmaWx0ZXJzLmZyYWdtZW50cy5JbnRlcmFjdGl2ZUJhckNoYXJ0XCIgdHlwZT1cIlhNTFwiIC8+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGA8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLnZpc3VhbGZpbHRlcnMuZnJhZ21lbnRzLkludGVyYWN0aXZlTGluZUNoYXJ0XCIgdHlwZT1cIlhNTFwiIC8+YDtcblx0XHR9XG5cdH1cblxuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBpZCA9IGdlbmVyYXRlKFt0aGlzLnNNZXRhUGF0aF0pO1xuXHRcdGNvbnN0IHNob3dFcnJvckV4cHJlc3Npb24gPSBcIiR7aW50ZXJuYWw+XCIgKyBpZCArIFwiL3Nob3dFcnJvcn1cIjtcblx0XHRjb25zdCBzTWV0YVBhdGggPSB0aGlzLm1ldGFQYXRoPy5nZXRQYXRoKCk7XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdDxjb250cm9sOlZpc3VhbEZpbHRlclxuXHRcdGNvcmU6cmVxdWlyZT1cIntWaXN1YWxGaWx0ZXJSdW50aW1lOiAnc2FwL2ZlL21hY3Jvcy92aXN1YWxmaWx0ZXJzL1Zpc3VhbEZpbHRlclJ1bnRpbWUnfVwiXG5cdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0eG1sbnM6Y29udHJvbD1cInNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhclwiXG5cdFx0eG1sbnM6Y3VzdG9tRGF0YT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIlxuXHRcdHhtbG5zOmNvcmU9XCJzYXAudWkuY29yZVwiXG5cdFx0aWQ9XCIke3RoaXMuaWR9XCJcblx0XHRoZWlnaHQ9XCIxM3JlbVwiXG5cdFx0d2lkdGg9XCIyMC41cmVtXCJcblx0XHRjbGFzcz1cInNhcFVpU21hbGxNYXJnaW5CZWdpbkVuZFwiXG5cdFx0Y3VzdG9tRGF0YTppbmZvUGF0aD1cIiR7Z2VuZXJhdGUoW3NNZXRhUGF0aF0pfVwiXG5cdD5cblx0XHQ8VkJveCBoZWlnaHQ9XCIycmVtXCIgY2xhc3M9XCJzYXBVaVNtYWxsTWFyZ2luQm90dG9tXCI+XG5cdFx0XHQ8T3ZlcmZsb3dUb29sYmFyIHN0eWxlPVwiQ2xlYXJcIj5cblx0XHRcdFx0JHt0aGlzLmdldFJlcXVpcmVkKCl9XG5cdFx0XHRcdDxUaXRsZVxuXHRcdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJNZWFzdXJlRGltZW5zaW9uVGl0bGVcIl0pfVwiXG5cdFx0XHRcdFx0dGV4dD1cIiR7dGhpcy5fbWVhc3VyZURpbWVuc2lvblRpdGxlfVwiXG5cdFx0XHRcdFx0dG9vbHRpcD1cIiR7dGhpcy5fdG9vbFRpcH1cIlxuXHRcdFx0XHRcdHRpdGxlU3R5bGU9XCJINlwiXG5cdFx0XHRcdFx0bGV2ZWw9XCJIM1wiXG5cdFx0XHRcdFx0Y2xhc3M9XCJzYXBVaVRpbnlNYXJnaW5FbmQgc2FwVWlOb01hcmdpbkJlZ2luXCJcblx0XHRcdFx0Lz5cblx0XHRcdFx0JHt0aGlzLmdldFVvTVRpdGxlKHNob3dFcnJvckV4cHJlc3Npb24pfVxuXHRcdFx0XHQke3RoaXMuZ2V0VmFsdWVIZWxwKHNob3dFcnJvckV4cHJlc3Npb24pfVxuXHRcdFx0PC9PdmVyZmxvd1Rvb2xiYXI+XG5cdFx0PC9WQm94PlxuXHRcdDxWQm94IGhlaWdodD1cIjEwMCVcIiB3aWR0aD1cIjEwMCVcIj5cblx0XHRcdCR7dGhpcy5nZXRJbnRlcmFjdGl2ZUNoYXJ0RnJhZ21lbnQoKX1cblx0XHQ8L1ZCb3g+XG5cdDwvY29udHJvbDpWaXN1YWxGaWx0ZXI+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BMENxQkEseUJBQXlCO0VBMUI5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQXJCQSxPQXNCQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxjQUFjO0lBQ3BCQyxTQUFTLEVBQUU7RUFDWixDQUFDLENBQUMsVUFFQUMsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBR0RGLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCRSxRQUFRLEVBQUUsSUFBSTtJQUNkQyxLQUFLLEVBQUUsQ0FBQyxXQUFXLEVBQUUsb0JBQW9CO0VBQzFDLENBQUMsQ0FBQyxVQUdESixjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsV0FHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxXQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFdBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsV0FHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxXQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFdBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsV0FHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxXQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFdBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsV0FHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxXQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLFNBQVM7SUFDZkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFdBR0RGLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUU7RUFDZixDQUFDLENBQUMsV0FHREYsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxXQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFdBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUM7SUFBQTtJQVlGLG1DQUFZSSxNQUErQyxFQUFFQyxhQUFrQixFQUFFQyxTQUFjLEVBQUU7TUFBQTtNQUFBO01BQ2hHLHNDQUFNRixNQUFNLEVBQUVDLGFBQWEsRUFBRUMsU0FBUyxDQUFDO01BQUM7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUN4QyxNQUFLQyxPQUFPLEdBQUcscUJBQXFCO01BQ3BDLE1BQUtDLFlBQVksR0FBR0osTUFBTSxDQUFDSSxZQUFZO01BQ3ZDLE1BQUtDLFFBQVEsR0FBR0wsTUFBTSxDQUFDSyxRQUFRO01BQy9CLE1BQUtDLFNBQVMscUJBQUcsTUFBS0QsUUFBUSxtREFBYixlQUFlRSxPQUFPLEVBQUU7TUFDekMsTUFBTUMsa0JBQWtCLEdBQUdDLDJCQUEyQixDQUFDLE1BQUtKLFFBQVEsRUFBYUwsTUFBTSxDQUFDVSxXQUFXLENBQUM7TUFDcEcsTUFBTUMsaUJBQWlCLEdBQUcsTUFBS0MsbUJBQW1CLENBQUNKLGtCQUFrQixFQUFFSyxTQUFTLEVBQUVYLFNBQVMsQ0FBQztNQUM1RixNQUFNWSxpQkFBaUIsR0FBRyxJQUFJQyxpQkFBaUIsQ0FBQ0osaUJBQWlCLENBQUNLLGFBQWEsRUFBRSxFQUFFTCxpQkFBaUIsQ0FBQztNQUNyRyxNQUFNTSxnQkFBZ0IsR0FBR0gsaUJBQWlCLENBQUNJLDZCQUE2QixFQUFFO01BQzFFLE1BQU1DLFlBQVksR0FBR1gsa0JBQWtCLENBQUNZLFlBQVk7TUFDcEQsSUFBSUMsZUFBa0M7TUFDdEMsSUFBSUMsUUFBNEI7TUFDaEMsTUFBTUMsZUFBZSxHQUFHSixZQUFZLElBQUlBLFlBQVksQ0FBQ0ssY0FBYztNQUNuRSxJQUFJRCxlQUFlLEVBQUU7UUFDcEIsS0FBSyxJQUFJRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdGLGVBQWUsQ0FBQ0csTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRTtVQUNoRCxNQUFNRSxlQUFlLEdBQUdSLFlBQVksQ0FBQ0ssY0FBYyxDQUFDQyxDQUFDLENBQUMsSUFBSU4sWUFBWSxDQUFDSyxjQUFjLENBQUNDLENBQUMsQ0FBQyxDQUFDRyxLQUFLO1VBQzlGUCxlQUFlLEdBQ2RWLGlCQUFpQixDQUFDa0IsdUJBQXVCLENBQUNGLGVBQWUsQ0FBQyxJQUMxRGhCLGlCQUFpQixDQUFDa0IsdUJBQXVCLENBQUNGLGVBQWUsQ0FBQyxDQUFDRyxVQUFVO1FBQ3ZFO01BQ0Q7TUFDQSxJQUFJQyxhQUFhO1FBQ2hCQyxlQUFlLEdBQUcsRUFBRTtNQUVyQix3QkFBSVgsZUFBZSxzRUFBZixpQkFBaUJZLFFBQVEsa0RBQXpCLHNCQUEyQlAsTUFBTSxFQUFFO1FBQ3RDTSxlQUFlLEdBQUdmLGdCQUFnQixDQUFDaUIsTUFBTSxDQUFDLFVBQVVDLE9BQU8sRUFBRTtVQUFBO1VBQzVELE9BQU9BLE9BQU8sQ0FBQ0MsU0FBUywyQkFBS2YsZUFBZSxzREFBZixrQkFBaUJZLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQ0wsS0FBSztRQUNoRSxDQUFDLENBQUM7UUFDRk4sUUFBUSxHQUFHVSxlQUFlLENBQUNOLE1BQU0sR0FBRyxDQUFDLEdBQUdNLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQ0ksU0FBUyxHQUFHZixlQUFlLENBQUNZLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQ0wsS0FBSztRQUN4R0csYUFBYSxHQUFHakIsaUJBQWlCLENBQUN1Qix1QkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNyRjtNQUNBO01BQ0EsSUFDQ04sYUFBYSxJQUNiQSxhQUFhLENBQUNMLE1BQU0sR0FBRyxDQUFDLElBQ3hCLHVCQUFDTCxlQUFlLDhDQUFmLGtCQUFpQmlCLGVBQWUsS0FDakNOLGVBQWUsQ0FBQ04sTUFBTSxLQUFLLENBQUMseUJBQzVCTCxlQUFlLDhDQUFmLGtCQUFpQlksUUFBUSxJQUN6QixzQkFBQVosZUFBZSxzREFBZixrQkFBaUJZLFFBQVEsQ0FBQ1AsTUFBTSxJQUFHLENBQUMsRUFDbkM7UUFDRGEsR0FBRyxDQUFDQyxPQUFPLENBQ1Ysd05BQXdOLENBQ3hOO01BQ0Y7TUFDQTtNQUNBLHlCQUFJbkIsZUFBZSw4Q0FBZixrQkFBaUJpQixlQUFlLEVBQUU7UUFDckMsSUFBSU4sZUFBZSxDQUFDTixNQUFNLEtBQUssQ0FBQyxFQUFFO1VBQ2pDSixRQUFRLEdBQUdYLGlCQUFpQixDQUMxQjhCLHNCQUFzQixDQUFDOUIsaUJBQWlCLENBQUMrQix5QkFBeUIsQ0FBQ3JCLGVBQWUsQ0FBQ2lCLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQ1YsS0FBSyxDQUFDLENBQUMsQ0FDN0dlLHNCQUFzQixFQUFFLENBQUN2QixZQUFZLENBQUN3QixJQUFJO1VBQzVDYixhQUFhLEdBQUdqQixpQkFBaUIsQ0FBQ3VCLHVCQUF1QixDQUFDLG9CQUFvQixDQUFDO1FBQ2hGLENBQUMsTUFBTTtVQUNORSxHQUFHLENBQUNDLE9BQU8sQ0FDViw0S0FBNEssQ0FDNUs7UUFDRjtNQUNEO01BQ0EsSUFBSUssY0FBYztNQUNsQixJQUFJeEIsZUFBZSxFQUFFO1FBQ3BCLElBQUlBLGVBQWUsQ0FBQ3lCLFNBQVMsS0FBSyxtQkFBbUIsSUFBSXpCLGVBQWUsQ0FBQ3lCLFNBQVMsS0FBSyxrQkFBa0IsRUFBRTtVQUMxR0QsY0FBYyxHQUFHLElBQUk7UUFDdEIsQ0FBQyxNQUFNO1VBQ05BLGNBQWMsR0FBRyxLQUFLO1FBQ3ZCO01BQ0Q7TUFDQSxJQUNDNUIsZ0JBQWdCLENBQUM4QixJQUFJLENBQUMsVUFBVVosT0FBTyxFQUFFO1FBQ3hDLE9BQU9BLE9BQU8sQ0FBQ0MsU0FBUyxLQUFLZCxRQUFRO01BQ3RDLENBQUMsQ0FBQyxFQUNEO1FBQ0QsTUFBSzBCLGdCQUFnQixHQUFHLElBQUk7TUFDN0I7TUFFQSxJQUFJQyxnQkFBZ0I7TUFDcEIsSUFBSWpELE1BQU0sQ0FBQ2tELDBCQUEwQixFQUFFO1FBQUE7UUFDdEMsTUFBTUMsdUJBQXVCLHNCQUFHLE1BQUs5QyxRQUFRLG9EQUFiLGdCQUFlK0MsUUFBUSxFQUFFLENBQUNDLG9CQUFvQixDQUFDckQsTUFBTSxDQUFDa0QsMEJBQTBCLENBQUMzQyxPQUFPLEVBQUUsQ0FBQztRQUMzSDBDLGdCQUFnQixHQUNmRSx1QkFBdUIsSUFBSTFDLDJCQUEyQixDQUFDMEMsdUJBQXVCLEVBQUVuRCxNQUFNLENBQUNVLFdBQVcsQ0FBQyxDQUFDVSxZQUFZO01BQ2xIO01BQ0EsSUFBSWtDLDBCQUEwQixHQUFHLENBQUM7TUFDbEMsSUFBSUwsZ0JBQWdCLElBQUksQ0FBQ2pELE1BQU0sQ0FBQ3VELHdCQUF3QixFQUFFO1FBQ3pELEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHUCxnQkFBZ0IsQ0FBQ1EsYUFBYSxDQUFDL0IsTUFBTSxFQUFFOEIsQ0FBQyxFQUFFLEVBQUU7VUFBQTtVQUMvRCxJQUFJUCxnQkFBZ0IsQ0FBQ1EsYUFBYSxDQUFDRCxDQUFDLENBQUMsQ0FBQ0UsWUFBWSxDQUFDOUIsS0FBSywyQkFBS1AsZUFBZSxzREFBZixrQkFBaUJzQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMvQixLQUFLLEdBQUU7WUFDbEcwQiwwQkFBMEIsRUFBRTtZQUM1QixJQUFJQSwwQkFBMEIsR0FBRyxDQUFDLEVBQUU7Y0FDbkMsTUFBTSxJQUFJTSxLQUFLLENBQUMsOEVBQThFLENBQUM7WUFDaEc7VUFDRDtRQUNEO01BQ0Q7TUFFQSxNQUFNQyxZQUFZLEdBQUcsTUFBS0Msc0JBQXNCLENBQUMvQixhQUFhLEVBQUVULFFBQVEsQ0FBQztNQUV6RSxJQUFJdUMsWUFBWSxFQUFFO1FBQ2pCLE1BQUtFLG1CQUFtQixHQUFHRixZQUFZO01BQ3hDO01BQ0EsTUFBTUcsbUJBQW1CLEdBQUcsc0JBQUF6QyxlQUFlLENBQUMsQ0FBQyxDQUFDLCtFQUFsQixrQkFBb0IwQyxPQUFPLDBEQUEzQixzQkFBNkJoQyxRQUFRLDRCQUFJVixlQUFlLENBQUMsQ0FBQyxDQUFDLGdGQUFsQixtQkFBb0IwQyxPQUFPLG9GQUEzQixzQkFBNkJoQyxRQUFRLENBQUMsQ0FBQyxDQUFDLHFGQUF4Qyx1QkFBMENnQyxPQUFPLDJEQUFqRCx1QkFBbURDLFdBQVc7TUFDbkksTUFBTUMsK0JBQStCLEdBQUdOLFlBQVksYUFBWkEsWUFBWSxnREFBWkEsWUFBWSxDQUFFTyxvQkFBb0Isb0ZBQWxDLHNCQUFvQ0gsT0FBTywyREFBM0MsdUJBQTZDQyxXQUFXO01BQ2hHLE1BQU1HLFFBQVEsR0FBR0wsbUJBQW1CLGFBQW5CQSxtQkFBbUIsdUJBQW5CQSxtQkFBbUIsQ0FBRS9CLFFBQVE7TUFDOUMsTUFBTXFDLDRCQUE0QixHQUFHSCwrQkFBK0IsYUFBL0JBLCtCQUErQix1QkFBL0JBLCtCQUErQixDQUFFbEMsUUFBUTtNQUM5RSxNQUFNc0MsSUFBSSxHQUFHLE1BQUtDLE1BQU0sQ0FBQ0gsUUFBUSxFQUFFQyw0QkFBNEIsQ0FBQztNQUNoRSxJQUNDQyxJQUFJLElBQ0p0RCxnQkFBZ0IsQ0FBQzhCLElBQUksQ0FBQyxVQUFVWixPQUFPLEVBQUU7UUFDeEMsT0FBT0EsT0FBTyxDQUFDQyxTQUFTLEtBQUttQyxJQUFJO01BQ2xDLENBQUMsQ0FBQyxFQUNEO1FBQ0QsTUFBS0Usc0JBQXNCLEdBQUcsSUFBSTtNQUNuQyxDQUFDLE1BQU07UUFDTixNQUFLQSxzQkFBc0IsR0FBRyxLQUFLO01BQ3BDO01BQ0EsTUFBTUMsY0FBYyxHQUFHVixtQkFBbUIsYUFBbkJBLG1CQUFtQixnREFBbkJBLG1CQUFtQixDQUFFVyxFQUFFLDBEQUF2QixzQkFBeUJDLE1BQU07TUFDdEQsTUFBTUMsMEJBQTBCLEdBQUdWLCtCQUErQixhQUEvQkEsK0JBQStCLGdEQUEvQkEsK0JBQStCLENBQUVRLEVBQUUsMERBQW5DLHNCQUFxQ0MsTUFBTTtNQUM5RSxNQUFNRSxjQUFjLEdBQUcsTUFBS0MsZ0JBQWdCLENBQUNMLGNBQWMsRUFBRUcsMEJBQTBCLEVBQUUsTUFBSzdCLGdCQUFnQixDQUFDO01BQy9HLE1BQU1nQyxjQUFjLEdBQ25CLHNCQUFBM0QsZUFBZSxzREFBZixrQkFBaUJzQyxVQUFVLENBQUMsQ0FBQyxDQUFDLDJCQUFJdEMsZUFBZSxzREFBZixrQkFBaUJzQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUNNLE9BQU8sS0FBSTVDLGVBQWUsQ0FBQ3NDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQ00sT0FBTyxDQUFDckUsSUFBSTtNQUN2SCxNQUFNcUYsVUFBVSx5QkFBRzVELGVBQWUsdURBQWYsbUJBQWlCeUIsU0FBUztNQUM3QyxJQUFJa0MsY0FBYyxLQUFLLFVBQVUsSUFBSUEsY0FBYyxLQUFLLFVBQVUsSUFBSUEsY0FBYyxLQUFLLG9CQUFvQixFQUFFO1FBQzlHLE1BQUtFLGFBQWEsR0FBRyxLQUFLO01BQzNCLENBQUMsTUFBTSxJQUFJLE9BQU9KLGNBQWMsS0FBSyxTQUFTLElBQUlBLGNBQWMsRUFBRTtRQUNqRSxNQUFLSSxhQUFhLEdBQUcsS0FBSztNQUMzQixDQUFDLE1BQU0sSUFBSSxFQUFFRCxVQUFVLEtBQUssa0JBQWtCLElBQUlBLFVBQVUsS0FBSyxtQkFBbUIsQ0FBQyxFQUFFO1FBQ3RGLE1BQUtDLGFBQWEsR0FBRyxLQUFLO01BQzNCLENBQUMsTUFBTSxJQUFJbEYsTUFBTSxDQUFDbUYsZUFBZSxLQUFLLE9BQU8sSUFBSUYsVUFBVSxLQUFLLG1CQUFtQixFQUFFO1FBQ3BGLE1BQUtDLGFBQWEsR0FBRyxLQUFLO01BQzNCLENBQUMsTUFBTTtRQUNOLE1BQUtBLGFBQWEsR0FBRyxJQUFJO01BQzFCO01BQ0EsTUFBS0UsU0FBUyxHQUFHSCxVQUFVO01BQzNCLE1BQUtJLGNBQWMsR0FBR0MsV0FBVyxDQUFDQyxnQkFBZ0IsQ0FBQ3JGLFNBQVMsQ0FBQ3NGLE1BQU0sQ0FBQ0MsU0FBUyx5QkFBRXpGLE1BQU0sQ0FBQ1UsV0FBVyx3REFBbEIsb0JBQW9CSCxPQUFPLEVBQUUsQ0FBVztNQUN2SDtBQUNGO0FBQ0E7QUFDQTtNQUNFLElBQUssT0FBT3VFLGNBQWMsS0FBSyxTQUFTLElBQUlBLGNBQWMsSUFBSyxDQUFDakMsY0FBYyxJQUFJN0MsTUFBTSxDQUFDbUYsZUFBZSxLQUFLLE9BQU8sRUFBRTtRQUNySCxNQUFLTyxTQUFTLEdBQUcsSUFBSTtRQUNyQixNQUFLQyxpQkFBaUIsR0FDckJiLGNBQWMsSUFBSSxDQUFDakMsY0FBYyxHQUM5QitDLGFBQWEsQ0FBQ0MsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLEdBQzdERCxhQUFhLENBQUNDLE9BQU8sQ0FBQyw2Q0FBNkMsQ0FBQztRQUN4RSxJQUFJZixjQUFjLEVBQUU7VUFDbkIsTUFBS2dCLFlBQVksR0FBR0YsYUFBYSxDQUFDQyxPQUFPLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQ3ZFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hGLENBQUMsTUFBTSxJQUFJLENBQUN1QixjQUFjLEVBQUU7VUFDM0IsTUFBS2lELFlBQVksR0FBR0YsYUFBYSxDQUFDQyxPQUFPLENBQUMsd0NBQXdDLENBQUM7UUFDcEYsQ0FBQyxNQUFNO1VBQ04sTUFBS0MsWUFBWSxHQUFHRixhQUFhLENBQUNDLE9BQU8sQ0FBQyxrREFBa0QsQ0FBQztRQUM5RjtNQUNEO01BQ0EsTUFBS0UsWUFBWSxHQUFHekUsUUFBUTtNQUM1QixNQUFNMEUsU0FBUyxHQUFHLE1BQUsxRixTQUFTLEdBQUcsa0NBQWtDO01BQ3JFLE1BQU0yRixzQkFBc0Isc0JBQUcsTUFBSzVGLFFBQVEsb0RBQWIsZ0JBQWUrQyxRQUFRLEVBQUUsQ0FBQ0Msb0JBQW9CLENBQUMyQyxTQUFTLEVBQUUzRSxlQUFlLENBQVE7TUFDaEgsTUFBSzZFLHNCQUFzQixHQUFHQyxzQkFBc0IsQ0FBQ0Msd0JBQXdCLENBQzVFSCxzQkFBc0IsRUFDdEI1RSxlQUFlLEVBQ2ZyQixNQUFNLENBQUNVLFdBQVcsRUFDbEIsTUFBS3NDLGdCQUFnQixFQUNyQixNQUFLZSxtQkFBbUIsQ0FDeEI7TUFDRCxNQUFLc0MsUUFBUSxHQUFHRixzQkFBc0IsQ0FBQ0csVUFBVSxDQUNoREwsc0JBQXNCLEVBQ3RCNUUsZUFBZSxFQUNmckIsTUFBTSxDQUFDVSxXQUFXLEVBQ2xCLE1BQUtKLFNBQVMsRUFDZCxNQUFLMEMsZ0JBQWdCLEVBQ3JCLE1BQUtlLG1CQUFtQixFQUN4QixNQUFLb0IsZUFBZSxDQUNwQjtNQUNELE1BQUtvQixjQUFjLEdBQUdKLHNCQUFzQixDQUFDSyxlQUFlLENBQUNuRixlQUFlLEVBQUUsTUFBS3FFLFNBQVMsQ0FBQztNQUM3RixNQUFLZSxjQUFjLEdBQUdOLHNCQUFzQixDQUFDTyxnQkFBZ0IsQ0FDNURULHNCQUFzQixFQUN0QjVFLGVBQWUsRUFDZnJCLE1BQU0sQ0FBQ1UsV0FBVyxFQUNsQixNQUFLSixTQUFTLEVBQ2QsTUFBSzBDLGdCQUFnQixFQUNyQixNQUFLZSxtQkFBbUIsQ0FDeEI7TUFDRCxNQUFLNEMsbUJBQW1CLEdBQUdSLHNCQUFzQixDQUFDUyxxQkFBcUIsQ0FBQ3ZGLGVBQWUsQ0FBQztNQUFDO0lBQzFGO0lBQUM7SUFBQTtJQUFBLE9BRUR5QyxzQkFBc0IsR0FBdEIsZ0NBQXVCL0IsYUFBdUMsRUFBRVQsUUFBaUIsRUFBRTtNQUNsRixJQUFJdUYsaUJBQXFEO01BQ3pELElBQUksQ0FBQzlFLGFBQWEsRUFBRTtRQUNuQjtNQUNEO01BQ0FBLGFBQWEsQ0FBQ2dCLElBQUksQ0FBQyxVQUFVK0QsVUFBVSxFQUFFO1FBQ3hDLElBQUlBLFVBQVUsQ0FBQ2xFLElBQUksS0FBS3RCLFFBQVEsRUFBRTtVQUNqQ3VGLGlCQUFpQixHQUFHQyxVQUFVO1VBQzlCLE9BQU8sSUFBSTtRQUNaO01BQ0QsQ0FBQyxDQUFDO01BQ0YsT0FBT0QsaUJBQWlCO0lBQ3pCLENBQUM7SUFBQSxPQUVEckMsTUFBTSxHQUFOLGdCQUFPSCxRQUF1QyxFQUFFQyw0QkFBMkQsRUFBRTtNQUFBO01BQzVHLElBQUl5QyxZQUFZLEdBQUcxQyxRQUFRLGFBQVJBLFFBQVEsdUJBQVJBLFFBQVEsQ0FBRTJDLFdBQVc7TUFDeEMsSUFBSUMsS0FBSyxHQUFHNUMsUUFBUSxhQUFSQSxRQUFRLHVCQUFSQSxRQUFRLENBQUU2QyxJQUFJO01BQzFCLElBQUksQ0FBQ0gsWUFBWSxJQUFJLENBQUNFLEtBQUssSUFBSTNDLDRCQUE0QixFQUFFO1FBQzVEeUMsWUFBWSxHQUFHekMsNEJBQTRCLENBQUMwQyxXQUFXO1FBQ3ZEQyxLQUFLLEdBQUczQyw0QkFBNEIsQ0FBQzRDLElBQUk7TUFDMUM7TUFDQSxPQUFPLGtCQUFDSCxZQUFZLGtEQUFiLGNBQW9ESSxJQUFJLGdCQUFLRixLQUFLLDJDQUFOLE9BQTZDRSxJQUFJO0lBQ3JILENBQUM7SUFBQSxPQUVEcEMsZ0JBQWdCLEdBQWhCLDBCQUFpQkwsY0FBc0IsRUFBRUcsMEJBQW1DLEVBQUU3QixnQkFBMEIsRUFBRTtNQUN6RyxJQUFJLENBQUNBLGdCQUFnQixJQUFJNkIsMEJBQTBCLEVBQUU7UUFDcEQsT0FBT0EsMEJBQTBCLENBQUN1QyxPQUFPLEVBQUU7TUFDNUMsQ0FBQyxNQUFNO1FBQ04sT0FBTzFDLGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFMEMsT0FBTyxFQUFFO01BQ2pDO0lBQ0QsQ0FBQztJQUFBLE9BRURDLFdBQVcsR0FBWCx1QkFBYztNQUNiLElBQUksSUFBSSxDQUFDdkgsUUFBUSxFQUFFO1FBQ2xCLE9BQU93SCxHQUFJO0FBQ2Q7QUFDQTtBQUNBO0FBQ0EsZUFBZTtNQUNiLENBQUMsTUFBTTtRQUNOLE9BQU9BLEdBQUksRUFBQztNQUNiO0lBQ0QsQ0FBQztJQUFBLE9BRURDLFdBQVcsR0FBWCxxQkFBWUMsbUJBQTJCLEVBQUU7TUFDeEMsSUFBSSxJQUFJLENBQUNqQixjQUFjLEVBQUU7UUFDeEIsT0FBT2UsR0FBSTtBQUNkLGFBQWFHLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQ0MsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFFO0FBQ2xELHNCQUFzQkYsbUJBQW9CO0FBQzFDLGVBQWUsSUFBSSxDQUFDZixjQUFlO0FBQ25DO0FBQ0E7QUFDQTtBQUNBLFNBQVM7TUFDUCxDQUFDLE1BQU07UUFDTixPQUFPYSxHQUFJLEVBQUM7TUFDYjtJQUNELENBQUM7SUFBQSxPQUVESyxZQUFZLEdBQVosc0JBQWFILG1CQUEyQixFQUFFO01BQ3pDLElBQUksSUFBSSxDQUFDdEMsYUFBYSxFQUFFO1FBQ3ZCLE9BQU9vQyxHQUFJO0FBQ2Q7QUFDQSxhQUFhRyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUNDLEVBQUUsRUFBRSw2QkFBNkIsQ0FBQyxDQUFFO0FBQ2hFO0FBQ0E7QUFDQSxlQUFlLElBQUksQ0FBQ2YsbUJBQW9CO0FBQ3hDO0FBQ0Esc0JBQXNCYSxtQkFBb0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7TUFDZCxDQUFDLE1BQU07UUFDTixPQUFPRixHQUFJLEVBQUM7TUFDYjtJQUNELENBQUM7SUFBQSxPQUVETSwyQkFBMkIsR0FBM0IsdUNBQThCO01BQzdCLElBQUksSUFBSSxDQUFDbEMsU0FBUyxFQUFFO1FBQ25CLE9BQU80QixHQUFJLDZHQUE0RztNQUN4SCxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUNsQyxTQUFTLEtBQUssa0JBQWtCLEVBQUU7UUFDakQsT0FBT2tDLEdBQUksdUdBQXNHO01BQ2xILENBQUMsTUFBTTtRQUNOLE9BQU9BLEdBQUksd0dBQXVHO01BQ25IO0lBQ0QsQ0FBQztJQUFBLE9BRURPLFdBQVcsR0FBWCx1QkFBYztNQUFBO01BQ2IsTUFBTUgsRUFBRSxHQUFHRCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUNuSCxTQUFTLENBQUMsQ0FBQztNQUNyQyxNQUFNa0gsbUJBQW1CLEdBQUcsYUFBYSxHQUFHRSxFQUFFLEdBQUcsYUFBYTtNQUM5RCxNQUFNcEgsU0FBUyxzQkFBRyxJQUFJLENBQUNELFFBQVEsb0RBQWIsZ0JBQWVFLE9BQU8sRUFBRTtNQUUxQyxPQUFPK0csR0FBSTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDSSxFQUFHO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QkQsUUFBUSxDQUFDLENBQUNuSCxTQUFTLENBQUMsQ0FBRTtBQUMvQztBQUNBO0FBQ0E7QUFDQSxNQUFNLElBQUksQ0FBQytHLFdBQVcsRUFBRztBQUN6QjtBQUNBLFdBQVdJLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQ0MsRUFBRSxFQUFFLHVCQUF1QixDQUFDLENBQUU7QUFDeEQsYUFBYSxJQUFJLENBQUN4QixzQkFBdUI7QUFDekMsZ0JBQWdCLElBQUksQ0FBQ0csUUFBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sSUFBSSxDQUFDa0IsV0FBVyxDQUFDQyxtQkFBbUIsQ0FBRTtBQUM1QyxNQUFNLElBQUksQ0FBQ0csWUFBWSxDQUFDSCxtQkFBbUIsQ0FBRTtBQUM3QztBQUNBO0FBQ0E7QUFDQSxLQUFLLElBQUksQ0FBQ0ksMkJBQTJCLEVBQUc7QUFDeEM7QUFDQSx5QkFBeUI7SUFDeEIsQ0FBQztJQUFBO0VBQUEsRUFwYnFERSxpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9