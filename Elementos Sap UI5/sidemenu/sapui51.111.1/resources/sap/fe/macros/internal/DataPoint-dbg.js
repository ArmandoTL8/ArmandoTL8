/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/CriticalityFormatters", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/helpers/DataPointTemplating"], function (BuildingBlock, BuildingBlockRuntime, MetaModelConverter, BindingToolkit, StableIdHelper, CriticalityFormatters, DataModelPathHelper, PropertyHelper, UIFormatters, FieldHelper, FieldTemplating, DataPointTemplating) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9;
  var _exports = {};
  var getValueFormatted = DataPointTemplating.getValueFormatted;
  var getHeaderRatingIndicatorText = DataPointTemplating.getHeaderRatingIndicatorText;
  var buildFieldBindingExpression = DataPointTemplating.buildFieldBindingExpression;
  var buildExpressionForProgressIndicatorPercentValue = DataPointTemplating.buildExpressionForProgressIndicatorPercentValue;
  var buildExpressionForProgressIndicatorDisplayValue = DataPointTemplating.buildExpressionForProgressIndicatorDisplayValue;
  var isUsedInNavigationWithQuickViewFacets = FieldTemplating.isUsedInNavigationWithQuickViewFacets;
  var getVisibleExpression = FieldTemplating.getVisibleExpression;
  var getSemanticObjects = FieldTemplating.getSemanticObjects;
  var getSemanticObjectExpressionToResolve = FieldTemplating.getSemanticObjectExpressionToResolve;
  var isProperty = PropertyHelper.isProperty;
  var hasUnit = PropertyHelper.hasUnit;
  var hasCurrency = PropertyHelper.hasCurrency;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var buildExpressionForCriticalityIcon = CriticalityFormatters.buildExpressionForCriticalityIcon;
  var buildExpressionForCriticalityColor = CriticalityFormatters.buildExpressionForCriticalityColor;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var notEqual = BindingToolkit.notEqual;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
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
  let DataPoint = (_dec = defineBuildingBlock({
    name: "DataPoint",
    namespace: "sap.fe.macros.internal"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "string"
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "boolean"
  }), _dec8 = blockAttribute({
    type: "sap.ui.model.Context",
    required: false,
    computed: true
  }), _dec9 = blockAttribute({
    type: "object",
    validate: function (formatOptionsInput) {
      if (formatOptionsInput !== null && formatOptionsInput !== void 0 && formatOptionsInput.dataPointStyle && !["", "large"].includes(formatOptionsInput === null || formatOptionsInput === void 0 ? void 0 : formatOptionsInput.dataPointStyle)) {
        throw new Error(`Allowed value ${formatOptionsInput.dataPointStyle} for dataPointStyle does not match`);
      }
      if (formatOptionsInput !== null && formatOptionsInput !== void 0 && formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput === null || formatOptionsInput === void 0 ? void 0 : formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      if (formatOptionsInput !== null && formatOptionsInput !== void 0 && formatOptionsInput.iconSize && !["1rem", "1.375rem", "2rem"].includes(formatOptionsInput === null || formatOptionsInput === void 0 ? void 0 : formatOptionsInput.iconSize)) {
        throw new Error(`Allowed value ${formatOptionsInput.iconSize} for iconSize does not match`);
      }
      if (formatOptionsInput !== null && formatOptionsInput !== void 0 && formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput === null || formatOptionsInput === void 0 ? void 0 : formatOptionsInput.measureDisplayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
      }
      return formatOptionsInput;
    }
  }), _dec10 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    $kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(DataPoint, _BuildingBlockBase);
    /**
     * Prefix added to the generated ID of the field
     */
    /**
     * Metadata path to the dataPoint.
     * This property is usually a metadataContext pointing to a DataPoint having
     * $Type = "com.sap.vocabularies.UI.v1.DataPointType"
     */
    /**
     * Property added to associate the label with the DataPoint
     */
    /**
     * Property to set the visualization type
     */
    /**
     * Property to set the visibility
     */
    /**
     * Property to set property for the quick view facets
     */
    /**
     * Context pointing to an array of the property's semantic objects
     */
    /**
     * Retrieves the templating objects to further process the DataPoint.
     *
     * @param context DataPointProperties or a DataPoint
     * @returns The models containing infos like the DataModelPath, ValueDataModelPath and DataPointConverted
     */
    DataPoint.getTemplatingObjects = function getTemplatingObjects(context) {
      var _internalDataModelPat, _internalDataModelPat2;
      const internalDataModelPath = getInvolvedDataModelObjects(context.metaPath, context.contextPath);
      let internalValueDataModelPath;
      context.visible = getVisibleExpression(internalDataModelPath);
      if (internalDataModelPath !== null && internalDataModelPath !== void 0 && (_internalDataModelPat = internalDataModelPath.targetObject) !== null && _internalDataModelPat !== void 0 && (_internalDataModelPat2 = _internalDataModelPat.Value) !== null && _internalDataModelPat2 !== void 0 && _internalDataModelPat2.path) {
        internalValueDataModelPath = enhanceDataModelPath(internalDataModelPath, internalDataModelPath.targetObject.Value.path);
      }
      const internalDataPointConverted = convertMetaModelContext(context.metaPath);
      return {
        dataModelPath: internalDataModelPath,
        valueDataModelPath: internalValueDataModelPath,
        dataPointConverted: internalDataPointConverted
      };
    }

    /**
     * Function that calculates the visualization type for this DataPoint.
     *
     * @param properties The datapoint properties
     * @returns The DataPointProperties with the optimized coding for the visualization type
     */;
    DataPoint.getDataPointVisualization = function getDataPointVisualization(properties) {
      var _valueProperty$annota, _valueProperty$annota2;
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPoint.getTemplatingObjects(properties);
      if ((dataPointConverted === null || dataPointConverted === void 0 ? void 0 : dataPointConverted.Visualization) === "UI.VisualizationType/Rating") {
        properties.visualization = "Rating";
        return properties;
      }
      if ((dataPointConverted === null || dataPointConverted === void 0 ? void 0 : dataPointConverted.Visualization) === "UI.VisualizationType/Progress") {
        properties.visualization = "Progress";
        return properties;
      }
      const valueProperty = valueDataModelPath && valueDataModelPath.targetObject;
      //check whether the visualization type should be an object number in case one of the if conditions met
      if (!(isUsedInNavigationWithQuickViewFacets(dataModelPath, valueProperty) || valueProperty !== null && valueProperty !== void 0 && (_valueProperty$annota = valueProperty.annotations) !== null && _valueProperty$annota !== void 0 && (_valueProperty$annota2 = _valueProperty$annota.Common) !== null && _valueProperty$annota2 !== void 0 && _valueProperty$annota2.SemanticObject)) {
        if (isProperty(valueProperty) && (hasUnit(valueProperty) || hasCurrency(valueProperty))) {
          // we only show an objectNumber if there is no quickview and a unit or a currency
          properties.visualization = "ObjectNumber";
          return properties;
        }
      }

      //default case to handle this as objectStatus type
      properties.visualization = "ObjectStatus";
      return properties;
    }

    /**
     * Constructor method of the building block.
     *
     * @param properties The datapoint properties
     */;
    function DataPoint(properties) {
      var _this;
      //setup initial default property settings
      properties.semanticObjects = getSemanticObjects([]);
      properties.hasQuickViewFacets = false;
      properties.hasSemanticObjectOnNavigation = false;
      _this = _BuildingBlockBase.call(this, DataPoint.getDataPointVisualization(properties)) || this;
      _initializerDefineProperty(_this, "idPrefix", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visualization", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hasQuickViewFacets", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObjects", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor9, _assertThisInitialized(_this));
      return _this;
    }

    /**
     * The building block template for the rating indicator part.
     *
     * @returns An XML-based string with the definition of the rating indicator template
     */
    _exports = DataPoint;
    var _proto = DataPoint.prototype;
    _proto.getRatingIndicatorTemplate = function getRatingIndicatorTemplate() {
      var _dataPointValue$$targ;
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPoint.getTemplatingObjects(this);
      const dataPointTarget = dataModelPath.targetObject;
      const targetValue = this.getTargetValueBinding();
      const dataPointValue = (dataPointTarget === null || dataPointTarget === void 0 ? void 0 : dataPointTarget.Value) || "";
      const propertyType = dataPointValue === null || dataPointValue === void 0 ? void 0 : (_dataPointValue$$targ = dataPointValue.$target) === null || _dataPointValue$$targ === void 0 ? void 0 : _dataPointValue$$targ.type;
      let numberOfFractionalDigits;
      if (propertyType === "Edm.Decimal" && dataPointTarget.ValueFormat) {
        if (dataPointTarget.ValueFormat.NumberOfFractionalDigits) {
          numberOfFractionalDigits = dataPointTarget.ValueFormat.NumberOfFractionalDigits;
        }
      }
      const value = getValueFormatted(valueDataModelPath, dataPointValue, propertyType, numberOfFractionalDigits);
      const text = getHeaderRatingIndicatorText(this.metaPath, dataPointTarget);
      let headerLabel = "";
      let targetLabel = "";
      const targetLabelExpression = compileExpression(formatResult([pathInModel("T_HEADER_RATING_INDICATOR_FOOTER", "sap.fe.i18n"), getExpressionFromAnnotation(dataPointConverted.Value, getRelativePaths(dataModelPath)), dataPointConverted.TargetValue ? getExpressionFromAnnotation(dataPointConverted.TargetValue, getRelativePaths(dataModelPath)) : "5"], "MESSAGE"));
      if (this.formatOptions.showLabels ?? false) {
        headerLabel = xml`<Label xmlns="sap.m"
					${this.attr("text", text)}
					${this.attr("visible", dataPointTarget.SampleSize || dataPointTarget.Description ? true : false)}
				/>`;
        targetLabel = xml`<Label
			xmlns="sap.m"
			core:require="{MESSAGE: 'sap/base/strings/formatMessage' }"
			${this.attr("text", targetLabelExpression)}
			visible="true" />`;
      }
      return xml`
		${headerLabel}
		<RatingIndicator
		xmlns="sap.m"

		${this.attr("id", this.idPrefix ? generate([this.idPrefix, "RatingIndicator-Field-display"]) : undefined)}
		${this.attr("maxValue", targetValue)}
		${this.attr("value", value)}
		${this.attr("tooltip", this.getTooltipValue())}
		${this.attr("iconSize", this.formatOptions.iconSize)}
		${this.attr("class", this.formatOptions.showLabels ?? false ? "sapUiTinyMarginTopBottom" : undefined)}
		editable="false"
	/>
	${targetLabel}`;
    }

    /**
     * The building block template for the progress indicator part.
     *
     * @returns An XML-based string with the definition of the progress indicator template
     */;
    _proto.getProgressIndicatorTemplate = function getProgressIndicatorTemplate() {
      var _this$formatOptions;
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPoint.getTemplatingObjects(this);
      const criticalityColorExpression = buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
      const displayValue = buildExpressionForProgressIndicatorDisplayValue(dataModelPath);
      const percentValue = buildExpressionForProgressIndicatorPercentValue(dataModelPath);
      const dataPointTarget = dataModelPath.targetObject;
      let firstLabel = "";
      let secondLabel = "";
      if ((this === null || this === void 0 ? void 0 : (_this$formatOptions = this.formatOptions) === null || _this$formatOptions === void 0 ? void 0 : _this$formatOptions.showLabels) ?? false) {
        var _valueDataModelPath$t, _valueDataModelPath$t2, _valueDataModelPath$t3;
        firstLabel = xml`<Label
				xmlns="sap.m"
				${this.attr("text", dataPointTarget === null || dataPointTarget === void 0 ? void 0 : dataPointTarget.Description)}
				${this.attr("visible", !!(dataPointTarget !== null && dataPointTarget !== void 0 && dataPointTarget.Description))}
			/>`;

        // const secondLabelText = (valueDataModelPath?.targetObject as Property)?.annotations?.Common?.Label;
        const secondLabelExpression = getExpressionFromAnnotation(valueDataModelPath === null || valueDataModelPath === void 0 ? void 0 : (_valueDataModelPath$t = valueDataModelPath.targetObject) === null || _valueDataModelPath$t === void 0 ? void 0 : (_valueDataModelPath$t2 = _valueDataModelPath$t.annotations) === null || _valueDataModelPath$t2 === void 0 ? void 0 : (_valueDataModelPath$t3 = _valueDataModelPath$t2.Common) === null || _valueDataModelPath$t3 === void 0 ? void 0 : _valueDataModelPath$t3.Label);
        secondLabel = xml`<Label
				xmlns="sap.m"
				${this.attr("text", compileExpression(secondLabelExpression))}
				${this.attr("visible", !!compileExpression(notEqual(undefined, secondLabelExpression)))}
			/>`;
      }
      return xml`
		${firstLabel}
			<ProgressIndicator
				xmlns="sap.m"
				${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ProgressIndicator-Field-display"]) : undefined)}
				${this.attr("displayValue", displayValue)}
				${this.attr("percentValue", percentValue)}
				${this.attr("state", criticalityColorExpression)}
				${this.attr("tooltip", this.getTooltipValue())}
			/>
			${secondLabel}`;
    }

    /**
     * The building block template for the object number common part.
     *
     * @returns An XML-based string with the definition of the object number common template
     */;
    _proto.getObjectNumberCommonTemplate = function getObjectNumberCommonTemplate() {
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPoint.getTemplatingObjects(this);
      const criticalityColorExpression = buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
      const emptyIndicatorMode = this.formatOptions.showEmptyIndicator ?? false ? "On" : undefined;
      const objectStatusNumber = buildFieldBindingExpression(dataModelPath, this.formatOptions, true);
      const unit = this.formatOptions.measureDisplayMode === "Hidden" ? undefined : compileExpression(UIFormatters.getBindingForUnitOrCurrency(valueDataModelPath));
      return xml`<ObjectNumber
			xmlns="sap.m"
			${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ObjectNumber-Field-display"]) : undefined)}
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			${this.attr("state", criticalityColorExpression)}
			${this.attr("number", objectStatusNumber)}
			${this.attr("unit", unit)}
			${this.attr("visible", this.visible)}
			emphasized="false"
			${this.attr("class", this.formatOptions.dataPointStyle === "large" ? "sapMObjectNumberLarge" : undefined)}
			${this.attr("tooltip", this.getTooltipValue())}
			${this.attr("emptyIndicatorMode", emptyIndicatorMode)}
		/>`;
    }

    /**
     * The building block template for the object number.
     *
     * @returns An XML-based string with the definition of the object number template
     */;
    _proto.getObjectNumberTemplate = function getObjectNumberTemplate() {
      var _this$formatOptions2;
      const {
        valueDataModelPath
      } = DataPoint.getTemplatingObjects(this);
      if ((this === null || this === void 0 ? void 0 : (_this$formatOptions2 = this.formatOptions) === null || _this$formatOptions2 === void 0 ? void 0 : _this$formatOptions2.isAnalytics) ?? false) {
        return xml`
				<control:ConditionalWrapper
					xmlns:control="sap.fe.core.controls"
					${this.attr("condition", UIFormatters.hasValidAnalyticalCurrencyOrUnit(valueDataModelPath))}
				>
					<control:contentTrue>
						${this.getObjectNumberCommonTemplate()}
					</control:contentTrue>
					<control:contentFalse>
						<ObjectNumber
							xmlns="sap.m"
							${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ObjectNumber-Field-display-differentUnit"]) : undefined)}
							number="*"
							unit=""
							${this.attr("visible", this.visible)}
							emphasized="false"
							${this.attr("class", this.formatOptions.dataPointStyle === "large" ? "sapMObjectNumberLarge" : undefined)}
						/>
					</control:contentFalse>
				</control:ConditionalWrapper>`;
      } else {
        return xml`${this.getObjectNumberCommonTemplate()}`;
      }
    }

    /**
     * Returns the dependent or an empty string.
     *
     * @returns Dependent either with the QuickView or an empty string.
     */;
    _proto.getObjectStatusDependentsTemplate = function getObjectStatusDependentsTemplate() {
      var _valueDataModelPath$t4, _valueDataModelPath$t5, _valueDataModelPath$t6;
      const {
        valueDataModelPath
      } = DataPoint.getTemplatingObjects(this);
      const hasSemanticObject = valueDataModelPath === null || valueDataModelPath === void 0 ? void 0 : (_valueDataModelPath$t4 = valueDataModelPath.targetObject) === null || _valueDataModelPath$t4 === void 0 ? void 0 : (_valueDataModelPath$t5 = _valueDataModelPath$t4.annotations) === null || _valueDataModelPath$t5 === void 0 ? void 0 : (_valueDataModelPath$t6 = _valueDataModelPath$t5.Common) === null || _valueDataModelPath$t6 === void 0 ? void 0 : _valueDataModelPath$t6.SemanticObject;
      if (this.hasQuickViewFacets || hasSemanticObject) {
        return `<dependents><macro:QuickView
						xmlns:macro="sap.fe.macros"
						dataField="{metaPath>}"
						semanticObject="${this.semanticObject}"
						contextPath="{contextPath>}"
					/></dependents>`;
      }
      return "";
    }

    /**
     * The building block template for the object status.
     *
     * @returns An XML-based string with the definition of the object status template
     */;
    _proto.getObjectStatusTemplate = function getObjectStatusTemplate() {
      var _navigationProperties;
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPoint.getTemplatingObjects(this);
      const valueProperty = valueDataModelPath && valueDataModelPath.targetObject;
      this.hasQuickViewFacets = valueProperty ? isUsedInNavigationWithQuickViewFacets(dataModelPath, valueProperty) : false;
      this.semanticObject = "";
      let annotations,
        semanticObjectExpressionToResolve = [];
      if (typeof dataPointConverted.Value === "object") {
        var _dataPointConverted$V, _dataPointConverted$V2;
        annotations = (_dataPointConverted$V = dataPointConverted.Value.$target) === null || _dataPointConverted$V === void 0 ? void 0 : (_dataPointConverted$V2 = _dataPointConverted$V.annotations) === null || _dataPointConverted$V2 === void 0 ? void 0 : _dataPointConverted$V2.Common;
        semanticObjectExpressionToResolve = getSemanticObjectExpressionToResolve(annotations);
      }
      if (!!this.semanticObject && this.semanticObject[0] === "{") {
        semanticObjectExpressionToResolve.push({
          key: this.semanticObject.substring(1, this.semanticObject.length - 2),
          value: this.semanticObject
        });
      }
      this.semanticObjects = getSemanticObjects(semanticObjectExpressionToResolve); // this is used via semanticObjects>
      // This sets up the semantic links found in the navigation property, if there is no semantic links define before.
      if (!this.semanticObject && (valueDataModelPath === null || valueDataModelPath === void 0 ? void 0 : (_navigationProperties = valueDataModelPath.navigationProperties) === null || _navigationProperties === void 0 ? void 0 : _navigationProperties.length) > 0) {
        valueDataModelPath.navigationProperties.forEach(navProperty => {
          var _navProperty$annotati, _navProperty$annotati2;
          if (navProperty !== null && navProperty !== void 0 && (_navProperty$annotati = navProperty.annotations) !== null && _navProperty$annotati !== void 0 && (_navProperty$annotati2 = _navProperty$annotati.Common) !== null && _navProperty$annotati2 !== void 0 && _navProperty$annotati2.SemanticObject) {
            this.semanticObject = navProperty.annotations.Common.SemanticObject;
            this.hasSemanticObjectOnNavigation = true;
          }
        });
      }
      let criticalityColorExpression = buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
      if (criticalityColorExpression === "None" && valueDataModelPath) {
        criticalityColorExpression = this.hasQuickViewFacets ? "Information" : FieldHelper.getStateDependingOnSemanticObjectTargets(valueDataModelPath);
      }
      const semanticObjectTargets = FieldHelper.hasSemanticObjectTargets(valueDataModelPath);
      const active = this.hasQuickViewFacets || semanticObjectTargets;

      // if the semanticObjects already calculated the criticality we don't calculate it again
      criticalityColorExpression = criticalityColorExpression ? criticalityColorExpression : buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
      const emptyIndicatorMode = this.formatOptions.showEmptyIndicator ?? false ? "On" : undefined;
      const objectStatusText = buildFieldBindingExpression(dataModelPath, this.formatOptions, false);
      const iconExpression = buildExpressionForCriticalityIcon(dataPointConverted, dataModelPath);
      return xml`<ObjectStatus
						xmlns="sap.m"
						${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ObjectStatus-Field-display"]) : undefined)}
						core:require="{ FieldRuntime: 'sap/fe/macros/field/FieldRuntime' }"
						${this.attr("class", this.formatOptions.dataPointStyle === "large" ? "sapMObjectStatusLarge" : undefined)}
						${this.attr("icon", iconExpression)}
						${this.attr("tooltip", this.getTooltipValue())}
						${this.attr("state", criticalityColorExpression)}
						${this.attr("text", objectStatusText)}
						${this.attr("emptyIndicatorMode", emptyIndicatorMode)}
						${this.attr("active", active)}
						press="FieldRuntime.pressLink"
						${this.attr("ariaLabelledBy", this.ariaLabelledBy !== null ? this.ariaLabelledBy : undefined)}
						${this.attr("modelContextChange", FieldHelper.hasSemanticObjectsWithPath(this.semanticObjects.getObject()) ? FieldHelper.computeSemanticLinkModelContextChange(this.semanticObjects.getObject(), valueDataModelPath) : undefined)}
				>${this.getObjectStatusDependentsTemplate()}
				</ObjectStatus>`;
    }

    /**
     * The helper method to get a possible tooltip text.
     *
     * @returns BindingToolkitExpression
     */;
    _proto.getTooltipValue = function getTooltipValue() {
      var _dataPointConverted$a, _dataPointConverted$a2, _dataPointConverted$a3;
      const {
        dataModelPath,
        dataPointConverted
      } = DataPoint.getTemplatingObjects(this);
      return getExpressionFromAnnotation(dataPointConverted === null || dataPointConverted === void 0 ? void 0 : (_dataPointConverted$a = dataPointConverted.annotations) === null || _dataPointConverted$a === void 0 ? void 0 : (_dataPointConverted$a2 = _dataPointConverted$a.Common) === null || _dataPointConverted$a2 === void 0 ? void 0 : (_dataPointConverted$a3 = _dataPointConverted$a2.QuickInfo) === null || _dataPointConverted$a3 === void 0 ? void 0 : _dataPointConverted$a3.valueOf(), getRelativePaths(dataModelPath));
    }

    /**
     * The helper method to get a possible target value binding.
     *
     * @returns BindingToolkitExpression
     */;
    _proto.getTargetValueBinding = function getTargetValueBinding() {
      const {
        dataModelPath,
        dataPointConverted
      } = DataPoint.getTemplatingObjects(this);
      return getExpressionFromAnnotation(dataPointConverted.TargetValue, getRelativePaths(dataModelPath));
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */;
    _proto.getTemplate = function getTemplate() {
      switch (this.visualization) {
        case "Rating":
          {
            return this.getRatingIndicatorTemplate();
          }
        case "Progress":
          {
            return this.getProgressIndicatorTemplate();
          }
        case "ObjectNumber":
          {
            return this.getObjectNumberTemplate();
          }
        default:
          {
            return this.getObjectStatusTemplate();
          }
      }
    };
    return DataPoint;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "visualization", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "hasQuickViewFacets", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "semanticObjects", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DataPoint;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEYXRhUG9pbnQiLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsInJlcXVpcmVkIiwiY29tcHV0ZWQiLCJ2YWxpZGF0ZSIsImZvcm1hdE9wdGlvbnNJbnB1dCIsImRhdGFQb2ludFN0eWxlIiwiaW5jbHVkZXMiLCJFcnJvciIsImRpc3BsYXlNb2RlIiwiaWNvblNpemUiLCJtZWFzdXJlRGlzcGxheU1vZGUiLCIka2luZCIsImdldFRlbXBsYXRpbmdPYmplY3RzIiwiY29udGV4dCIsImludGVybmFsRGF0YU1vZGVsUGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm1ldGFQYXRoIiwiY29udGV4dFBhdGgiLCJpbnRlcm5hbFZhbHVlRGF0YU1vZGVsUGF0aCIsInZpc2libGUiLCJnZXRWaXNpYmxlRXhwcmVzc2lvbiIsInRhcmdldE9iamVjdCIsIlZhbHVlIiwicGF0aCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiaW50ZXJuYWxEYXRhUG9pbnRDb252ZXJ0ZWQiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsImRhdGFNb2RlbFBhdGgiLCJ2YWx1ZURhdGFNb2RlbFBhdGgiLCJkYXRhUG9pbnRDb252ZXJ0ZWQiLCJnZXREYXRhUG9pbnRWaXN1YWxpemF0aW9uIiwicHJvcGVydGllcyIsIlZpc3VhbGl6YXRpb24iLCJ2aXN1YWxpemF0aW9uIiwidmFsdWVQcm9wZXJ0eSIsImlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlNlbWFudGljT2JqZWN0IiwiaXNQcm9wZXJ0eSIsImhhc1VuaXQiLCJoYXNDdXJyZW5jeSIsInNlbWFudGljT2JqZWN0cyIsImdldFNlbWFudGljT2JqZWN0cyIsImhhc1F1aWNrVmlld0ZhY2V0cyIsImhhc1NlbWFudGljT2JqZWN0T25OYXZpZ2F0aW9uIiwiZ2V0UmF0aW5nSW5kaWNhdG9yVGVtcGxhdGUiLCJkYXRhUG9pbnRUYXJnZXQiLCJ0YXJnZXRWYWx1ZSIsImdldFRhcmdldFZhbHVlQmluZGluZyIsImRhdGFQb2ludFZhbHVlIiwicHJvcGVydHlUeXBlIiwiJHRhcmdldCIsIm51bWJlck9mRnJhY3Rpb25hbERpZ2l0cyIsIlZhbHVlRm9ybWF0IiwiTnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzIiwidmFsdWUiLCJnZXRWYWx1ZUZvcm1hdHRlZCIsInRleHQiLCJnZXRIZWFkZXJSYXRpbmdJbmRpY2F0b3JUZXh0IiwiaGVhZGVyTGFiZWwiLCJ0YXJnZXRMYWJlbCIsInRhcmdldExhYmVsRXhwcmVzc2lvbiIsImNvbXBpbGVFeHByZXNzaW9uIiwiZm9ybWF0UmVzdWx0IiwicGF0aEluTW9kZWwiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJnZXRSZWxhdGl2ZVBhdGhzIiwiVGFyZ2V0VmFsdWUiLCJmb3JtYXRPcHRpb25zIiwic2hvd0xhYmVscyIsInhtbCIsImF0dHIiLCJTYW1wbGVTaXplIiwiRGVzY3JpcHRpb24iLCJpZFByZWZpeCIsImdlbmVyYXRlIiwidW5kZWZpbmVkIiwiZ2V0VG9vbHRpcFZhbHVlIiwiZ2V0UHJvZ3Jlc3NJbmRpY2F0b3JUZW1wbGF0ZSIsImNyaXRpY2FsaXR5Q29sb3JFeHByZXNzaW9uIiwiYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlDb2xvciIsImRpc3BsYXlWYWx1ZSIsImJ1aWxkRXhwcmVzc2lvbkZvclByb2dyZXNzSW5kaWNhdG9yRGlzcGxheVZhbHVlIiwicGVyY2VudFZhbHVlIiwiYnVpbGRFeHByZXNzaW9uRm9yUHJvZ3Jlc3NJbmRpY2F0b3JQZXJjZW50VmFsdWUiLCJmaXJzdExhYmVsIiwic2Vjb25kTGFiZWwiLCJzZWNvbmRMYWJlbEV4cHJlc3Npb24iLCJMYWJlbCIsIm5vdEVxdWFsIiwiZ2V0T2JqZWN0TnVtYmVyQ29tbW9uVGVtcGxhdGUiLCJlbXB0eUluZGljYXRvck1vZGUiLCJzaG93RW1wdHlJbmRpY2F0b3IiLCJvYmplY3RTdGF0dXNOdW1iZXIiLCJidWlsZEZpZWxkQmluZGluZ0V4cHJlc3Npb24iLCJ1bml0IiwiVUlGb3JtYXR0ZXJzIiwiZ2V0QmluZGluZ0ZvclVuaXRPckN1cnJlbmN5IiwiZ2V0T2JqZWN0TnVtYmVyVGVtcGxhdGUiLCJpc0FuYWx5dGljcyIsImhhc1ZhbGlkQW5hbHl0aWNhbEN1cnJlbmN5T3JVbml0IiwiZ2V0T2JqZWN0U3RhdHVzRGVwZW5kZW50c1RlbXBsYXRlIiwiaGFzU2VtYW50aWNPYmplY3QiLCJzZW1hbnRpY09iamVjdCIsImdldE9iamVjdFN0YXR1c1RlbXBsYXRlIiwic2VtYW50aWNPYmplY3RFeHByZXNzaW9uVG9SZXNvbHZlIiwiZ2V0U2VtYW50aWNPYmplY3RFeHByZXNzaW9uVG9SZXNvbHZlIiwicHVzaCIsImtleSIsInN1YnN0cmluZyIsImxlbmd0aCIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwiZm9yRWFjaCIsIm5hdlByb3BlcnR5IiwiRmllbGRIZWxwZXIiLCJnZXRTdGF0ZURlcGVuZGluZ09uU2VtYW50aWNPYmplY3RUYXJnZXRzIiwic2VtYW50aWNPYmplY3RUYXJnZXRzIiwiaGFzU2VtYW50aWNPYmplY3RUYXJnZXRzIiwiYWN0aXZlIiwib2JqZWN0U3RhdHVzVGV4dCIsImljb25FeHByZXNzaW9uIiwiYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlJY29uIiwiYXJpYUxhYmVsbGVkQnkiLCJoYXNTZW1hbnRpY09iamVjdHNXaXRoUGF0aCIsImdldE9iamVjdCIsImNvbXB1dGVTZW1hbnRpY0xpbmtNb2RlbENvbnRleHRDaGFuZ2UiLCJRdWlja0luZm8iLCJ2YWx1ZU9mIiwiZ2V0VGVtcGxhdGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGF0YVBvaW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgU2VtYW50aWNPYmplY3QgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhUG9pbnRUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIEJ1aWxkaW5nQmxvY2tCYXNlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuaW1wb3J0IHsgY29udmVydE1ldGFNb2RlbENvbnRleHQsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGZvcm1hdFJlc3VsdCwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLCBub3RFcXVhbCwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlDb2xvciwgYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlJY29uIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvQ3JpdGljYWxpdHlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBlbmhhbmNlRGF0YU1vZGVsUGF0aCwgZ2V0UmVsYXRpdmVQYXRocyB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGhhc0N1cnJlbmN5LCBoYXNVbml0LCBpc1Byb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCAqIGFzIFVJRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBGaWVsZEhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBTZW1hbnRpY09iamVjdEN1c3RvbURhdGEgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFRlbXBsYXRpbmdcIjtcbmltcG9ydCB7XG5cdGdldFNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZSxcblx0Z2V0U2VtYW50aWNPYmplY3RzLFxuXHRnZXRWaXNpYmxlRXhwcmVzc2lvbixcblx0aXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0c1xufSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFRlbXBsYXRpbmdcIjtcbmltcG9ydCB7XG5cdGJ1aWxkRXhwcmVzc2lvbkZvclByb2dyZXNzSW5kaWNhdG9yRGlzcGxheVZhbHVlLFxuXHRidWlsZEV4cHJlc3Npb25Gb3JQcm9ncmVzc0luZGljYXRvclBlcmNlbnRWYWx1ZSxcblx0YnVpbGRGaWVsZEJpbmRpbmdFeHByZXNzaW9uLFxuXHRnZXRIZWFkZXJSYXRpbmdJbmRpY2F0b3JUZXh0LFxuXHRnZXRWYWx1ZUZvcm1hdHRlZFxufSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9oZWxwZXJzL0RhdGFQb2ludFRlbXBsYXRpbmdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxudHlwZSBEYXRhUG9pbnRGb3JtYXRPcHRpb25zID0gUGFydGlhbDx7XG5cdGRhdGFQb2ludFN0eWxlOiBcIlwiIHwgXCJsYXJnZVwiO1xuXHRkaXNwbGF5TW9kZTogRGlzcGxheU1vZGU7XG5cdC8qKlxuXHQgKiBEZWZpbmUgdGhlIHNpemUgb2YgdGhlIGljb25zIChGb3IgUmF0aW5nSW5kaWNhdG9yIG9ubHkpXG5cdCAqL1xuXHRpY29uU2l6ZTogXCIxcmVtXCIgfCBcIjEuMzc1cmVtXCIgfCBcIjJyZW1cIjtcblx0aXNBbmFseXRpY3M6IGJvb2xlYW47XG5cdG1lYXN1cmVEaXNwbGF5TW9kZTogc3RyaW5nO1xuXHQvKipcblx0ICogSWYgc2V0IHRvICd0cnVlJywgU0FQIEZpb3JpIGVsZW1lbnRzIHNob3dzIGFuIGVtcHR5IGluZGljYXRvciBpbiBkaXNwbGF5IG1vZGUgZm9yIHRoZSBPYmplY3ROdW1iZXJcblx0ICovXG5cdHNob3dFbXB0eUluZGljYXRvcjogYm9vbGVhbjtcblx0LyoqXG5cdCAqIFdoZW4gdHJ1ZSwgZGlzcGxheXMgdGhlIGxhYmVscyBmb3IgdGhlIFJhdGluZyBhbmQgUHJvZ3Jlc3MgaW5kaWNhdG9yc1xuXHQgKi9cblx0c2hvd0xhYmVsczogYm9vbGVhbjtcbn0+O1xuZXhwb3J0IHR5cGUgRGF0YVBvaW50UHJvcGVydGllcyA9IHtcblx0bWV0YVBhdGg6IFY0Q29udGV4dDtcblx0ZWRpdE1vZGU/OiBzdHJpbmc7XG5cdGNvbnRleHRQYXRoOiBWNENvbnRleHQ7XG5cdGZvcm1hdE9wdGlvbnM6IERhdGFQb2ludEZvcm1hdE9wdGlvbnM7XG5cdGlkUHJlZml4Pzogc3RyaW5nO1xuXHQvLyBjb21wdXRlZCBwcm9wZXJ0aWVzXG5cdGNyaXRpY2FsaXR5Q29sb3JFeHByZXNzaW9uPzogc3RyaW5nO1xuXHRkaXNwbGF5VmFsdWU/OiBzdHJpbmc7XG5cdGVtcHR5SW5kaWNhdG9yTW9kZT86IFwiT25cIjtcblx0aGFzUXVpY2tWaWV3RmFjZXRzPzogYm9vbGVhbjtcblx0aGFzU2VtYW50aWNPYmplY3RPbk5hdmlnYXRpb24/OiBib29sZWFuO1xuXHRvYmplY3RTdGF0dXNOdW1iZXI/OiBzdHJpbmc7XG5cdHBlcmNlbnRWYWx1ZT86IHN0cmluZztcblx0c2VtYW50aWNPYmplY3Q/OiBzdHJpbmcgfCBTZW1hbnRpY09iamVjdDtcblx0c2VtYW50aWNPYmplY3RzPzogc3RyaW5nO1xuXHR0YXJnZXRMYWJlbD86IHN0cmluZztcblx0dW5pdD86IHN0cmluZztcblx0dmlzaWJsZT86IHN0cmluZztcblx0dmlzdWFsaXphdGlvbj86IHN0cmluZztcblx0b2JqZWN0U3RhdHVzVGV4dD86IHN0cmluZztcblx0aWNvbkV4cHJlc3Npb24/OiBzdHJpbmc7XG59O1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiRGF0YVBvaW50XCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCJcbn0pXG5cbi8qKlxuICogUHVibGljIGV4dGVybmFsIGZpZWxkIHJlcHJlc2VudGF0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFQb2ludCBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0LyoqXG5cdCAqIFByZWZpeCBhZGRlZCB0byB0aGUgZ2VuZXJhdGVkIElEIG9mIHRoZSBmaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBpZFByZWZpeCE6IHN0cmluZztcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgZGF0YVBvaW50LlxuXHQgKiBUaGlzIHByb3BlcnR5IGlzIHVzdWFsbHkgYSBtZXRhZGF0YUNvbnRleHQgcG9pbnRpbmcgdG8gYSBEYXRhUG9pbnQgaGF2aW5nXG5cdCAqICRUeXBlID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRUeXBlXCJcblx0ICovXG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWVcblx0fSlcblx0cHVibGljIG1ldGFQYXRoITogVjRDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBQcm9wZXJ0eSBhZGRlZCB0byBhc3NvY2lhdGUgdGhlIGxhYmVsIHdpdGggdGhlIERhdGFQb2ludFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBhcmlhTGFiZWxsZWRCeSE6IHN0cmluZztcblxuXHQvKipcblx0ICogUHJvcGVydHkgdG8gc2V0IHRoZSB2aXN1YWxpemF0aW9uIHR5cGVcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwcml2YXRlIHZpc3VhbGl6YXRpb24hOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IHRvIHNldCB0aGUgdmlzaWJpbGl0eVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHByaXZhdGUgdmlzaWJsZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogUHJvcGVydHkgdG8gc2V0IHByb3BlcnR5IGZvciB0aGUgcXVpY2sgdmlldyBmYWNldHNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0cHJpdmF0ZSBoYXNRdWlja1ZpZXdGYWNldHMhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDb250ZXh0IHBvaW50aW5nIHRvIGFuIGFycmF5IG9mIHRoZSBwcm9wZXJ0eSdzIHNlbWFudGljIG9iamVjdHNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiBmYWxzZSxcblx0XHRjb21wdXRlZDogdHJ1ZVxuXHR9KVxuXHRwdWJsaWMgc2VtYW50aWNPYmplY3RzITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwib2JqZWN0XCIsXG5cdFx0dmFsaWRhdGU6IGZ1bmN0aW9uIChmb3JtYXRPcHRpb25zSW5wdXQ6IERhdGFQb2ludEZvcm1hdE9wdGlvbnMpIHtcblx0XHRcdGlmIChmb3JtYXRPcHRpb25zSW5wdXQ/LmRhdGFQb2ludFN0eWxlICYmICFbXCJcIiwgXCJsYXJnZVwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQ/LmRhdGFQb2ludFN0eWxlKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQuZGF0YVBvaW50U3R5bGV9IGZvciBkYXRhUG9pbnRTdHlsZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnNJbnB1dD8uZGlzcGxheU1vZGUgJiZcblx0XHRcdFx0IVtcIlZhbHVlXCIsIFwiRGVzY3JpcHRpb25cIiwgXCJWYWx1ZURlc2NyaXB0aW9uXCIsIFwiRGVzY3JpcHRpb25WYWx1ZVwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQ/LmRpc3BsYXlNb2RlKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5kaXNwbGF5TW9kZX0gZm9yIGRpc3BsYXlNb2RlIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChmb3JtYXRPcHRpb25zSW5wdXQ/Lmljb25TaXplICYmICFbXCIxcmVtXCIsIFwiMS4zNzVyZW1cIiwgXCIycmVtXCJdLmluY2x1ZGVzKGZvcm1hdE9wdGlvbnNJbnB1dD8uaWNvblNpemUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5pY29uU2l6ZX0gZm9yIGljb25TaXplIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChmb3JtYXRPcHRpb25zSW5wdXQ/Lm1lYXN1cmVEaXNwbGF5TW9kZSAmJiAhW1wiSGlkZGVuXCIsIFwiUmVhZE9ubHlcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0Py5tZWFzdXJlRGlzcGxheU1vZGUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5tZWFzdXJlRGlzcGxheU1vZGV9IGZvciBtZWFzdXJlRGlzcGxheU1vZGUgZG9lcyBub3QgbWF0Y2hgKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnNJbnB1dDtcblx0XHR9XG5cdH0pXG5cdHB1YmxpYyBmb3JtYXRPcHRpb25zITogRGF0YVBvaW50Rm9ybWF0T3B0aW9ucztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHQka2luZDogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCIsIFwiRW50aXR5VHlwZVwiLCBcIlNpbmdsZXRvblwiXVxuXHR9KVxuXHRwdWJsaWMgY29udGV4dFBhdGghOiBWNENvbnRleHQ7XG5cblx0cHJpdmF0ZSBzZW1hbnRpY09iamVjdD86IHN0cmluZyB8IFNlbWFudGljT2JqZWN0O1xuXHRwcml2YXRlIGhhc1NlbWFudGljT2JqZWN0T25OYXZpZ2F0aW9uPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB0ZW1wbGF0aW5nIG9iamVjdHMgdG8gZnVydGhlciBwcm9jZXNzIHRoZSBEYXRhUG9pbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IERhdGFQb2ludFByb3BlcnRpZXMgb3IgYSBEYXRhUG9pbnRcblx0ICogQHJldHVybnMgVGhlIG1vZGVscyBjb250YWluaW5nIGluZm9zIGxpa2UgdGhlIERhdGFNb2RlbFBhdGgsIFZhbHVlRGF0YU1vZGVsUGF0aCBhbmQgRGF0YVBvaW50Q29udmVydGVkXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBnZXRUZW1wbGF0aW5nT2JqZWN0cyhjb250ZXh0OiBEYXRhUG9pbnRQcm9wZXJ0aWVzIHwgRGF0YVBvaW50KToge1xuXHRcdGRhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGg7XG5cdFx0dmFsdWVEYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoIHwgdW5kZWZpbmVkO1xuXHRcdGRhdGFQb2ludENvbnZlcnRlZDogRGF0YVBvaW50VHlwZTtcblx0fSB7XG5cdFx0Y29uc3QgaW50ZXJuYWxEYXRhTW9kZWxQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKGNvbnRleHQubWV0YVBhdGgsIGNvbnRleHQuY29udGV4dFBhdGgpO1xuXHRcdGxldCBpbnRlcm5hbFZhbHVlRGF0YU1vZGVsUGF0aDtcblx0XHQoY29udGV4dCBhcyBEYXRhUG9pbnRQcm9wZXJ0aWVzKS52aXNpYmxlID0gZ2V0VmlzaWJsZUV4cHJlc3Npb24oaW50ZXJuYWxEYXRhTW9kZWxQYXRoKTtcblx0XHRpZiAoaW50ZXJuYWxEYXRhTW9kZWxQYXRoPy50YXJnZXRPYmplY3Q/LlZhbHVlPy5wYXRoKSB7XG5cdFx0XHRpbnRlcm5hbFZhbHVlRGF0YU1vZGVsUGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGludGVybmFsRGF0YU1vZGVsUGF0aCwgaW50ZXJuYWxEYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdC5WYWx1ZS5wYXRoKTtcblx0XHR9XG5cdFx0Y29uc3QgaW50ZXJuYWxEYXRhUG9pbnRDb252ZXJ0ZWQgPSBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dChjb250ZXh0Lm1ldGFQYXRoKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRkYXRhTW9kZWxQYXRoOiBpbnRlcm5hbERhdGFNb2RlbFBhdGgsXG5cdFx0XHR2YWx1ZURhdGFNb2RlbFBhdGg6IGludGVybmFsVmFsdWVEYXRhTW9kZWxQYXRoLFxuXHRcdFx0ZGF0YVBvaW50Q29udmVydGVkOiBpbnRlcm5hbERhdGFQb2ludENvbnZlcnRlZFxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gdGhhdCBjYWxjdWxhdGVzIHRoZSB2aXN1YWxpemF0aW9uIHR5cGUgZm9yIHRoaXMgRGF0YVBvaW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydGllcyBUaGUgZGF0YXBvaW50IHByb3BlcnRpZXNcblx0ICogQHJldHVybnMgVGhlIERhdGFQb2ludFByb3BlcnRpZXMgd2l0aCB0aGUgb3B0aW1pemVkIGNvZGluZyBmb3IgdGhlIHZpc3VhbGl6YXRpb24gdHlwZVxuXHQgKi9cblx0cHJpdmF0ZSBzdGF0aWMgZ2V0RGF0YVBvaW50VmlzdWFsaXphdGlvbihwcm9wZXJ0aWVzOiBEYXRhUG9pbnRQcm9wZXJ0aWVzKTogRGF0YVBvaW50UHJvcGVydGllcyB7XG5cdFx0Y29uc3QgeyBkYXRhTW9kZWxQYXRoLCB2YWx1ZURhdGFNb2RlbFBhdGgsIGRhdGFQb2ludENvbnZlcnRlZCB9ID0gRGF0YVBvaW50LmdldFRlbXBsYXRpbmdPYmplY3RzKHByb3BlcnRpZXMpO1xuXHRcdGlmIChkYXRhUG9pbnRDb252ZXJ0ZWQ/LlZpc3VhbGl6YXRpb24gPT09IFwiVUkuVmlzdWFsaXphdGlvblR5cGUvUmF0aW5nXCIpIHtcblx0XHRcdHByb3BlcnRpZXMudmlzdWFsaXphdGlvbiA9IFwiUmF0aW5nXCI7XG5cdFx0XHRyZXR1cm4gcHJvcGVydGllcztcblx0XHR9XG5cdFx0aWYgKGRhdGFQb2ludENvbnZlcnRlZD8uVmlzdWFsaXphdGlvbiA9PT0gXCJVSS5WaXN1YWxpemF0aW9uVHlwZS9Qcm9ncmVzc1wiKSB7XG5cdFx0XHRwcm9wZXJ0aWVzLnZpc3VhbGl6YXRpb24gPSBcIlByb2dyZXNzXCI7XG5cdFx0XHRyZXR1cm4gcHJvcGVydGllcztcblx0XHR9XG5cdFx0Y29uc3QgdmFsdWVQcm9wZXJ0eSA9IHZhbHVlRGF0YU1vZGVsUGF0aCAmJiB2YWx1ZURhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdC8vY2hlY2sgd2hldGhlciB0aGUgdmlzdWFsaXphdGlvbiB0eXBlIHNob3VsZCBiZSBhbiBvYmplY3QgbnVtYmVyIGluIGNhc2Ugb25lIG9mIHRoZSBpZiBjb25kaXRpb25zIG1ldFxuXHRcdGlmICghKGlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMoZGF0YU1vZGVsUGF0aCwgdmFsdWVQcm9wZXJ0eSkgfHwgdmFsdWVQcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRpZiAoaXNQcm9wZXJ0eSh2YWx1ZVByb3BlcnR5KSAmJiAoaGFzVW5pdCh2YWx1ZVByb3BlcnR5KSB8fCBoYXNDdXJyZW5jeSh2YWx1ZVByb3BlcnR5KSkpIHtcblx0XHRcdFx0Ly8gd2Ugb25seSBzaG93IGFuIG9iamVjdE51bWJlciBpZiB0aGVyZSBpcyBubyBxdWlja3ZpZXcgYW5kIGEgdW5pdCBvciBhIGN1cnJlbmN5XG5cdFx0XHRcdHByb3BlcnRpZXMudmlzdWFsaXphdGlvbiA9IFwiT2JqZWN0TnVtYmVyXCI7XG5cdFx0XHRcdHJldHVybiBwcm9wZXJ0aWVzO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vZGVmYXVsdCBjYXNlIHRvIGhhbmRsZSB0aGlzIGFzIG9iamVjdFN0YXR1cyB0eXBlXG5cdFx0cHJvcGVydGllcy52aXN1YWxpemF0aW9uID0gXCJPYmplY3RTdGF0dXNcIjtcblx0XHRyZXR1cm4gcHJvcGVydGllcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvciBtZXRob2Qgb2YgdGhlIGJ1aWxkaW5nIGJsb2NrLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydGllcyBUaGUgZGF0YXBvaW50IHByb3BlcnRpZXNcblx0ICovXG5cdGNvbnN0cnVjdG9yKHByb3BlcnRpZXM6IERhdGFQb2ludFByb3BlcnRpZXMpIHtcblx0XHQvL3NldHVwIGluaXRpYWwgZGVmYXVsdCBwcm9wZXJ0eSBzZXR0aW5nc1xuXHRcdHByb3BlcnRpZXMuc2VtYW50aWNPYmplY3RzID0gZ2V0U2VtYW50aWNPYmplY3RzKFtdKTtcblx0XHRwcm9wZXJ0aWVzLmhhc1F1aWNrVmlld0ZhY2V0cyA9IGZhbHNlO1xuXHRcdHByb3BlcnRpZXMuaGFzU2VtYW50aWNPYmplY3RPbk5hdmlnYXRpb24gPSBmYWxzZTtcblxuXHRcdHN1cGVyKERhdGFQb2ludC5nZXREYXRhUG9pbnRWaXN1YWxpemF0aW9uKHByb3BlcnRpZXMpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZm9yIHRoZSByYXRpbmcgaW5kaWNhdG9yIHBhcnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgcmF0aW5nIGluZGljYXRvciB0ZW1wbGF0ZVxuXHQgKi9cblx0Z2V0UmF0aW5nSW5kaWNhdG9yVGVtcGxhdGUoKSB7XG5cdFx0Y29uc3QgeyBkYXRhTW9kZWxQYXRoLCB2YWx1ZURhdGFNb2RlbFBhdGgsIGRhdGFQb2ludENvbnZlcnRlZCB9ID0gRGF0YVBvaW50LmdldFRlbXBsYXRpbmdPYmplY3RzKHRoaXMpO1xuXHRcdGNvbnN0IGRhdGFQb2ludFRhcmdldCA9IGRhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdGNvbnN0IHRhcmdldFZhbHVlID0gdGhpcy5nZXRUYXJnZXRWYWx1ZUJpbmRpbmcoKTtcblxuXHRcdGNvbnN0IGRhdGFQb2ludFZhbHVlID0gZGF0YVBvaW50VGFyZ2V0Py5WYWx1ZSB8fCBcIlwiO1xuXHRcdGNvbnN0IHByb3BlcnR5VHlwZSA9IGRhdGFQb2ludFZhbHVlPy4kdGFyZ2V0Py50eXBlO1xuXG5cdFx0bGV0IG51bWJlck9mRnJhY3Rpb25hbERpZ2l0cztcblx0XHRpZiAocHJvcGVydHlUeXBlID09PSBcIkVkbS5EZWNpbWFsXCIgJiYgZGF0YVBvaW50VGFyZ2V0LlZhbHVlRm9ybWF0KSB7XG5cdFx0XHRpZiAoZGF0YVBvaW50VGFyZ2V0LlZhbHVlRm9ybWF0Lk51bWJlck9mRnJhY3Rpb25hbERpZ2l0cykge1xuXHRcdFx0XHRudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMgPSBkYXRhUG9pbnRUYXJnZXQuVmFsdWVGb3JtYXQuTnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHZhbHVlID0gZ2V0VmFsdWVGb3JtYXR0ZWQodmFsdWVEYXRhTW9kZWxQYXRoIGFzIERhdGFNb2RlbE9iamVjdFBhdGgsIGRhdGFQb2ludFZhbHVlLCBwcm9wZXJ0eVR5cGUsIG51bWJlck9mRnJhY3Rpb25hbERpZ2l0cyk7XG5cblx0XHRjb25zdCB0ZXh0ID0gZ2V0SGVhZGVyUmF0aW5nSW5kaWNhdG9yVGV4dCh0aGlzLm1ldGFQYXRoLCBkYXRhUG9pbnRUYXJnZXQpO1xuXG5cdFx0bGV0IGhlYWRlckxhYmVsID0gXCJcIjtcblx0XHRsZXQgdGFyZ2V0TGFiZWwgPSBcIlwiO1xuXG5cdFx0Y29uc3QgdGFyZ2V0TGFiZWxFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRmb3JtYXRSZXN1bHQoXG5cdFx0XHRcdFtcblx0XHRcdFx0XHRwYXRoSW5Nb2RlbChcIlRfSEVBREVSX1JBVElOR19JTkRJQ0FUT1JfRk9PVEVSXCIsIFwic2FwLmZlLmkxOG5cIiksXG5cdFx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFQb2ludENvbnZlcnRlZC5WYWx1ZSwgZ2V0UmVsYXRpdmVQYXRocyhkYXRhTW9kZWxQYXRoKSksXG5cdFx0XHRcdFx0ZGF0YVBvaW50Q29udmVydGVkLlRhcmdldFZhbHVlXG5cdFx0XHRcdFx0XHQ/IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhUG9pbnRDb252ZXJ0ZWQuVGFyZ2V0VmFsdWUsIGdldFJlbGF0aXZlUGF0aHMoZGF0YU1vZGVsUGF0aCkpXG5cdFx0XHRcdFx0XHQ6IFwiNVwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdFwiTUVTU0FHRVwiXG5cdFx0XHQpXG5cdFx0KTtcblxuXHRcdGlmICh0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd0xhYmVscyA/PyBmYWxzZSkge1xuXHRcdFx0aGVhZGVyTGFiZWwgPSB4bWxgPExhYmVsIHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwidGV4dFwiLCB0ZXh0KX1cblx0XHRcdFx0XHQke3RoaXMuYXR0cihcInZpc2libGVcIiwgZGF0YVBvaW50VGFyZ2V0LlNhbXBsZVNpemUgfHwgZGF0YVBvaW50VGFyZ2V0LkRlc2NyaXB0aW9uID8gdHJ1ZSA6IGZhbHNlKX1cblx0XHRcdFx0Lz5gO1xuXG5cdFx0XHR0YXJnZXRMYWJlbCA9IHhtbGA8TGFiZWxcblx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0Y29yZTpyZXF1aXJlPVwie01FU1NBR0U6ICdzYXAvYmFzZS9zdHJpbmdzL2Zvcm1hdE1lc3NhZ2UnIH1cIlxuXHRcdFx0JHt0aGlzLmF0dHIoXCJ0ZXh0XCIsIHRhcmdldExhYmVsRXhwcmVzc2lvbil9XG5cdFx0XHR2aXNpYmxlPVwidHJ1ZVwiIC8+YDtcblx0XHR9XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdCR7aGVhZGVyTGFiZWx9XG5cdFx0PFJhdGluZ0luZGljYXRvclxuXHRcdHhtbG5zPVwic2FwLm1cIlxuXG5cdFx0JHt0aGlzLmF0dHIoXCJpZFwiLCB0aGlzLmlkUHJlZml4ID8gZ2VuZXJhdGUoW3RoaXMuaWRQcmVmaXgsIFwiUmF0aW5nSW5kaWNhdG9yLUZpZWxkLWRpc3BsYXlcIl0pIDogdW5kZWZpbmVkKX1cblx0XHQke3RoaXMuYXR0cihcIm1heFZhbHVlXCIsIHRhcmdldFZhbHVlKX1cblx0XHQke3RoaXMuYXR0cihcInZhbHVlXCIsIHZhbHVlKX1cblx0XHQke3RoaXMuYXR0cihcInRvb2x0aXBcIiwgdGhpcy5nZXRUb29sdGlwVmFsdWUoKSl9XG5cdFx0JHt0aGlzLmF0dHIoXCJpY29uU2l6ZVwiLCB0aGlzLmZvcm1hdE9wdGlvbnMuaWNvblNpemUpfVxuXHRcdCR7dGhpcy5hdHRyKFwiY2xhc3NcIiwgdGhpcy5mb3JtYXRPcHRpb25zLnNob3dMYWJlbHMgPz8gZmFsc2UgPyBcInNhcFVpVGlueU1hcmdpblRvcEJvdHRvbVwiIDogdW5kZWZpbmVkKX1cblx0XHRlZGl0YWJsZT1cImZhbHNlXCJcblx0Lz5cblx0JHt0YXJnZXRMYWJlbH1gO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmb3IgdGhlIHByb2dyZXNzIGluZGljYXRvciBwYXJ0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIHByb2dyZXNzIGluZGljYXRvciB0ZW1wbGF0ZVxuXHQgKi9cblx0Z2V0UHJvZ3Jlc3NJbmRpY2F0b3JUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCB7IGRhdGFNb2RlbFBhdGgsIHZhbHVlRGF0YU1vZGVsUGF0aCwgZGF0YVBvaW50Q29udmVydGVkIH0gPSBEYXRhUG9pbnQuZ2V0VGVtcGxhdGluZ09iamVjdHModGhpcyk7XG5cdFx0Y29uc3QgY3JpdGljYWxpdHlDb2xvckV4cHJlc3Npb24gPSBidWlsZEV4cHJlc3Npb25Gb3JDcml0aWNhbGl0eUNvbG9yKGRhdGFQb2ludENvbnZlcnRlZCwgZGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3QgZGlzcGxheVZhbHVlID0gYnVpbGRFeHByZXNzaW9uRm9yUHJvZ3Jlc3NJbmRpY2F0b3JEaXNwbGF5VmFsdWUoZGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3QgcGVyY2VudFZhbHVlID0gYnVpbGRFeHByZXNzaW9uRm9yUHJvZ3Jlc3NJbmRpY2F0b3JQZXJjZW50VmFsdWUoZGF0YU1vZGVsUGF0aCk7XG5cblx0XHRjb25zdCBkYXRhUG9pbnRUYXJnZXQgPSBkYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdDtcblx0XHRsZXQgZmlyc3RMYWJlbCA9IFwiXCI7XG5cdFx0bGV0IHNlY29uZExhYmVsID0gXCJcIjtcblxuXHRcdGlmICh0aGlzPy5mb3JtYXRPcHRpb25zPy5zaG93TGFiZWxzID8/IGZhbHNlKSB7XG5cdFx0XHRmaXJzdExhYmVsID0geG1sYDxMYWJlbFxuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0JHt0aGlzLmF0dHIoXCJ0ZXh0XCIsIGRhdGFQb2ludFRhcmdldD8uRGVzY3JpcHRpb24pfVxuXHRcdFx0XHQke3RoaXMuYXR0cihcInZpc2libGVcIiwgISFkYXRhUG9pbnRUYXJnZXQ/LkRlc2NyaXB0aW9uKX1cblx0XHRcdC8+YDtcblxuXHRcdFx0Ly8gY29uc3Qgc2Vjb25kTGFiZWxUZXh0ID0gKHZhbHVlRGF0YU1vZGVsUGF0aD8udGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5KT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw7XG5cdFx0XHRjb25zdCBzZWNvbmRMYWJlbEV4cHJlc3Npb24gPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdCh2YWx1ZURhdGFNb2RlbFBhdGg/LnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eSk/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsXG5cdFx0XHQpO1xuXHRcdFx0c2Vjb25kTGFiZWwgPSB4bWxgPExhYmVsXG5cdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHQke3RoaXMuYXR0cihcInRleHRcIiwgY29tcGlsZUV4cHJlc3Npb24oc2Vjb25kTGFiZWxFeHByZXNzaW9uKSl9XG5cdFx0XHRcdCR7dGhpcy5hdHRyKFwidmlzaWJsZVwiLCAhIWNvbXBpbGVFeHByZXNzaW9uKG5vdEVxdWFsKHVuZGVmaW5lZCwgc2Vjb25kTGFiZWxFeHByZXNzaW9uKSkpfVxuXHRcdFx0Lz5gO1xuXHRcdH1cblxuXHRcdHJldHVybiB4bWxgXG5cdFx0JHtmaXJzdExhYmVsfVxuXHRcdFx0PFByb2dyZXNzSW5kaWNhdG9yXG5cdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHQke3RoaXMuYXR0cihcImlkXCIsIHRoaXMuaWRQcmVmaXggPyBnZW5lcmF0ZShbdGhpcy5pZFByZWZpeCwgXCJQcm9ncmVzc0luZGljYXRvci1GaWVsZC1kaXNwbGF5XCJdKSA6IHVuZGVmaW5lZCl9XG5cdFx0XHRcdCR7dGhpcy5hdHRyKFwiZGlzcGxheVZhbHVlXCIsIGRpc3BsYXlWYWx1ZSl9XG5cdFx0XHRcdCR7dGhpcy5hdHRyKFwicGVyY2VudFZhbHVlXCIsIHBlcmNlbnRWYWx1ZSl9XG5cdFx0XHRcdCR7dGhpcy5hdHRyKFwic3RhdGVcIiwgY3JpdGljYWxpdHlDb2xvckV4cHJlc3Npb24pfVxuXHRcdFx0XHQke3RoaXMuYXR0cihcInRvb2x0aXBcIiwgdGhpcy5nZXRUb29sdGlwVmFsdWUoKSl9XG5cdFx0XHQvPlxuXHRcdFx0JHtzZWNvbmRMYWJlbH1gO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmb3IgdGhlIG9iamVjdCBudW1iZXIgY29tbW9uIHBhcnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgb2JqZWN0IG51bWJlciBjb21tb24gdGVtcGxhdGVcblx0ICovXG5cdGdldE9iamVjdE51bWJlckNvbW1vblRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IHsgZGF0YU1vZGVsUGF0aCwgdmFsdWVEYXRhTW9kZWxQYXRoLCBkYXRhUG9pbnRDb252ZXJ0ZWQgfSA9IERhdGFQb2ludC5nZXRUZW1wbGF0aW5nT2JqZWN0cyh0aGlzKTtcblx0XHRjb25zdCBjcml0aWNhbGl0eUNvbG9yRXhwcmVzc2lvbiA9IGJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5Q29sb3IoZGF0YVBvaW50Q29udmVydGVkLCBkYXRhTW9kZWxQYXRoKTtcblx0XHRjb25zdCBlbXB0eUluZGljYXRvck1vZGUgPSB0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd0VtcHR5SW5kaWNhdG9yID8/IGZhbHNlID8gXCJPblwiIDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IG9iamVjdFN0YXR1c051bWJlciA9IGJ1aWxkRmllbGRCaW5kaW5nRXhwcmVzc2lvbihkYXRhTW9kZWxQYXRoLCB0aGlzLmZvcm1hdE9wdGlvbnMsIHRydWUpO1xuXHRcdGNvbnN0IHVuaXQgPVxuXHRcdFx0dGhpcy5mb3JtYXRPcHRpb25zLm1lYXN1cmVEaXNwbGF5TW9kZSA9PT0gXCJIaWRkZW5cIlxuXHRcdFx0XHQ/IHVuZGVmaW5lZFxuXHRcdFx0XHQ6IGNvbXBpbGVFeHByZXNzaW9uKFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kodmFsdWVEYXRhTW9kZWxQYXRoIGFzIERhdGFNb2RlbE9iamVjdFBhdGgpKTtcblxuXHRcdHJldHVybiB4bWxgPE9iamVjdE51bWJlclxuXHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHQke3RoaXMuYXR0cihcImlkXCIsIHRoaXMuaWRQcmVmaXggPyBnZW5lcmF0ZShbdGhpcy5pZFByZWZpeCwgXCJPYmplY3ROdW1iZXItRmllbGQtZGlzcGxheVwiXSkgOiB1bmRlZmluZWQpfVxuXHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0JHt0aGlzLmF0dHIoXCJzdGF0ZVwiLCBjcml0aWNhbGl0eUNvbG9yRXhwcmVzc2lvbil9XG5cdFx0XHQke3RoaXMuYXR0cihcIm51bWJlclwiLCBvYmplY3RTdGF0dXNOdW1iZXIpfVxuXHRcdFx0JHt0aGlzLmF0dHIoXCJ1bml0XCIsIHVuaXQpfVxuXHRcdFx0JHt0aGlzLmF0dHIoXCJ2aXNpYmxlXCIsIHRoaXMudmlzaWJsZSl9XG5cdFx0XHRlbXBoYXNpemVkPVwiZmFsc2VcIlxuXHRcdFx0JHt0aGlzLmF0dHIoXCJjbGFzc1wiLCB0aGlzLmZvcm1hdE9wdGlvbnMuZGF0YVBvaW50U3R5bGUgPT09IFwibGFyZ2VcIiA/IFwic2FwTU9iamVjdE51bWJlckxhcmdlXCIgOiB1bmRlZmluZWQpfVxuXHRcdFx0JHt0aGlzLmF0dHIoXCJ0b29sdGlwXCIsIHRoaXMuZ2V0VG9vbHRpcFZhbHVlKCkpfVxuXHRcdFx0JHt0aGlzLmF0dHIoXCJlbXB0eUluZGljYXRvck1vZGVcIiwgZW1wdHlJbmRpY2F0b3JNb2RlKX1cblx0XHQvPmA7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHRlbXBsYXRlIGZvciB0aGUgb2JqZWN0IG51bWJlci5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBvYmplY3QgbnVtYmVyIHRlbXBsYXRlXG5cdCAqL1xuXHRnZXRPYmplY3ROdW1iZXJUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCB7IHZhbHVlRGF0YU1vZGVsUGF0aCB9ID0gRGF0YVBvaW50LmdldFRlbXBsYXRpbmdPYmplY3RzKHRoaXMpO1xuXHRcdGlmICh0aGlzPy5mb3JtYXRPcHRpb25zPy5pc0FuYWx5dGljcyA/PyBmYWxzZSkge1xuXHRcdFx0cmV0dXJuIHhtbGBcblx0XHRcdFx0PGNvbnRyb2w6Q29uZGl0aW9uYWxXcmFwcGVyXG5cdFx0XHRcdFx0eG1sbnM6Y29udHJvbD1cInNhcC5mZS5jb3JlLmNvbnRyb2xzXCJcblx0XHRcdFx0XHQke3RoaXMuYXR0cihcImNvbmRpdGlvblwiLCBVSUZvcm1hdHRlcnMuaGFzVmFsaWRBbmFseXRpY2FsQ3VycmVuY3lPclVuaXQodmFsdWVEYXRhTW9kZWxQYXRoIGFzIERhdGFNb2RlbE9iamVjdFBhdGgpKX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxjb250cm9sOmNvbnRlbnRUcnVlPlxuXHRcdFx0XHRcdFx0JHt0aGlzLmdldE9iamVjdE51bWJlckNvbW1vblRlbXBsYXRlKCl9XG5cdFx0XHRcdFx0PC9jb250cm9sOmNvbnRlbnRUcnVlPlxuXHRcdFx0XHRcdDxjb250cm9sOmNvbnRlbnRGYWxzZT5cblx0XHRcdFx0XHRcdDxPYmplY3ROdW1iZXJcblx0XHRcdFx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwiaWRcIiwgdGhpcy5pZFByZWZpeCA/IGdlbmVyYXRlKFt0aGlzLmlkUHJlZml4LCBcIk9iamVjdE51bWJlci1GaWVsZC1kaXNwbGF5LWRpZmZlcmVudFVuaXRcIl0pIDogdW5kZWZpbmVkKX1cblx0XHRcdFx0XHRcdFx0bnVtYmVyPVwiKlwiXG5cdFx0XHRcdFx0XHRcdHVuaXQ9XCJcIlxuXHRcdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcInZpc2libGVcIiwgdGhpcy52aXNpYmxlKX1cblx0XHRcdFx0XHRcdFx0ZW1waGFzaXplZD1cImZhbHNlXCJcblx0XHRcdFx0XHRcdFx0JHt0aGlzLmF0dHIoXCJjbGFzc1wiLCB0aGlzLmZvcm1hdE9wdGlvbnMuZGF0YVBvaW50U3R5bGUgPT09IFwibGFyZ2VcIiA/IFwic2FwTU9iamVjdE51bWJlckxhcmdlXCIgOiB1bmRlZmluZWQpfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8L2NvbnRyb2w6Y29udGVudEZhbHNlPlxuXHRcdFx0XHQ8L2NvbnRyb2w6Q29uZGl0aW9uYWxXcmFwcGVyPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB4bWxgJHt0aGlzLmdldE9iamVjdE51bWJlckNvbW1vblRlbXBsYXRlKCl9YDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZGVwZW5kZW50IG9yIGFuIGVtcHR5IHN0cmluZy5cblx0ICpcblx0ICogQHJldHVybnMgRGVwZW5kZW50IGVpdGhlciB3aXRoIHRoZSBRdWlja1ZpZXcgb3IgYW4gZW1wdHkgc3RyaW5nLlxuXHQgKi9cblx0cHJpdmF0ZSBnZXRPYmplY3RTdGF0dXNEZXBlbmRlbnRzVGVtcGxhdGUoKSB7XG5cdFx0Y29uc3QgeyB2YWx1ZURhdGFNb2RlbFBhdGggfSA9IERhdGFQb2ludC5nZXRUZW1wbGF0aW5nT2JqZWN0cyh0aGlzKTtcblx0XHRjb25zdCBoYXNTZW1hbnRpY09iamVjdCA9IHZhbHVlRGF0YU1vZGVsUGF0aD8udGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdDtcblx0XHRpZiAodGhpcy5oYXNRdWlja1ZpZXdGYWNldHMgfHwgaGFzU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdHJldHVybiBgPGRlcGVuZGVudHM+PG1hY3JvOlF1aWNrVmlld1xuXHRcdFx0XHRcdFx0eG1sbnM6bWFjcm89XCJzYXAuZmUubWFjcm9zXCJcblx0XHRcdFx0XHRcdGRhdGFGaWVsZD1cInttZXRhUGF0aD59XCJcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0PVwiJHt0aGlzLnNlbWFudGljT2JqZWN0fVwiXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aD1cIntjb250ZXh0UGF0aD59XCJcblx0XHRcdFx0XHQvPjwvZGVwZW5kZW50cz5gO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZm9yIHRoZSBvYmplY3Qgc3RhdHVzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIG9iamVjdCBzdGF0dXMgdGVtcGxhdGVcblx0ICovXG5cdGdldE9iamVjdFN0YXR1c1RlbXBsYXRlKCkge1xuXHRcdGNvbnN0IHsgZGF0YU1vZGVsUGF0aCwgdmFsdWVEYXRhTW9kZWxQYXRoLCBkYXRhUG9pbnRDb252ZXJ0ZWQgfSA9IERhdGFQb2ludC5nZXRUZW1wbGF0aW5nT2JqZWN0cyh0aGlzKTtcblx0XHRjb25zdCB2YWx1ZVByb3BlcnR5ID0gdmFsdWVEYXRhTW9kZWxQYXRoICYmIHZhbHVlRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0dGhpcy5oYXNRdWlja1ZpZXdGYWNldHMgPSB2YWx1ZVByb3BlcnR5ID8gaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyhkYXRhTW9kZWxQYXRoLCB2YWx1ZVByb3BlcnR5KSA6IGZhbHNlO1xuXHRcdHRoaXMuc2VtYW50aWNPYmplY3QgPSBcIlwiO1xuXHRcdGxldCBhbm5vdGF0aW9ucyxcblx0XHRcdHNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZTogU2VtYW50aWNPYmplY3RDdXN0b21EYXRhW10gPSBbXTtcblx0XHRpZiAodHlwZW9mIGRhdGFQb2ludENvbnZlcnRlZC5WYWx1ZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0YW5ub3RhdGlvbnMgPSBkYXRhUG9pbnRDb252ZXJ0ZWQuVmFsdWUuJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbjtcblx0XHRcdHNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZSA9IGdldFNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZShhbm5vdGF0aW9ucyk7XG5cdFx0fVxuXHRcdGlmICghIXRoaXMuc2VtYW50aWNPYmplY3QgJiYgdGhpcy5zZW1hbnRpY09iamVjdFswXSA9PT0gXCJ7XCIpIHtcblx0XHRcdHNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZS5wdXNoKHtcblx0XHRcdFx0a2V5OiB0aGlzLnNlbWFudGljT2JqZWN0LnN1YnN0cmluZygxLCB0aGlzLnNlbWFudGljT2JqZWN0Lmxlbmd0aCAtIDIpLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zZW1hbnRpY09iamVjdFxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHRoaXMuc2VtYW50aWNPYmplY3RzID0gZ2V0U2VtYW50aWNPYmplY3RzKHNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZSk7IC8vIHRoaXMgaXMgdXNlZCB2aWEgc2VtYW50aWNPYmplY3RzPlxuXHRcdC8vIFRoaXMgc2V0cyB1cCB0aGUgc2VtYW50aWMgbGlua3MgZm91bmQgaW4gdGhlIG5hdmlnYXRpb24gcHJvcGVydHksIGlmIHRoZXJlIGlzIG5vIHNlbWFudGljIGxpbmtzIGRlZmluZSBiZWZvcmUuXG5cdFx0aWYgKCF0aGlzLnNlbWFudGljT2JqZWN0ICYmICh2YWx1ZURhdGFNb2RlbFBhdGggYXMgRGF0YU1vZGVsT2JqZWN0UGF0aCk/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzPy5sZW5ndGggPiAwKSB7XG5cdFx0XHQodmFsdWVEYXRhTW9kZWxQYXRoIGFzIERhdGFNb2RlbE9iamVjdFBhdGgpLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZvckVhY2goKG5hdlByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdGlmIChuYXZQcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdFx0XHR0aGlzLnNlbWFudGljT2JqZWN0ID0gbmF2UHJvcGVydHkuYW5ub3RhdGlvbnMuQ29tbW9uLlNlbWFudGljT2JqZWN0O1xuXHRcdFx0XHRcdHRoaXMuaGFzU2VtYW50aWNPYmplY3RPbk5hdmlnYXRpb24gPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0bGV0IGNyaXRpY2FsaXR5Q29sb3JFeHByZXNzaW9uID0gYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlDb2xvcihkYXRhUG9pbnRDb252ZXJ0ZWQsIGRhdGFNb2RlbFBhdGgpO1xuXHRcdGlmIChjcml0aWNhbGl0eUNvbG9yRXhwcmVzc2lvbiA9PT0gXCJOb25lXCIgJiYgdmFsdWVEYXRhTW9kZWxQYXRoKSB7XG5cdFx0XHRjcml0aWNhbGl0eUNvbG9yRXhwcmVzc2lvbiA9IHRoaXMuaGFzUXVpY2tWaWV3RmFjZXRzXG5cdFx0XHRcdD8gXCJJbmZvcm1hdGlvblwiXG5cdFx0XHRcdDogRmllbGRIZWxwZXIuZ2V0U3RhdGVEZXBlbmRpbmdPblNlbWFudGljT2JqZWN0VGFyZ2V0cyh2YWx1ZURhdGFNb2RlbFBhdGgpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNlbWFudGljT2JqZWN0VGFyZ2V0cyA9IEZpZWxkSGVscGVyLmhhc1NlbWFudGljT2JqZWN0VGFyZ2V0cyh2YWx1ZURhdGFNb2RlbFBhdGggYXMgRGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0Y29uc3QgYWN0aXZlID0gdGhpcy5oYXNRdWlja1ZpZXdGYWNldHMgfHwgc2VtYW50aWNPYmplY3RUYXJnZXRzO1xuXG5cdFx0Ly8gaWYgdGhlIHNlbWFudGljT2JqZWN0cyBhbHJlYWR5IGNhbGN1bGF0ZWQgdGhlIGNyaXRpY2FsaXR5IHdlIGRvbid0IGNhbGN1bGF0ZSBpdCBhZ2FpblxuXHRcdGNyaXRpY2FsaXR5Q29sb3JFeHByZXNzaW9uID0gY3JpdGljYWxpdHlDb2xvckV4cHJlc3Npb25cblx0XHRcdD8gY3JpdGljYWxpdHlDb2xvckV4cHJlc3Npb25cblx0XHRcdDogYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlDb2xvcihkYXRhUG9pbnRDb252ZXJ0ZWQsIGRhdGFNb2RlbFBhdGgpO1xuXHRcdGNvbnN0IGVtcHR5SW5kaWNhdG9yTW9kZSA9IHRoaXMuZm9ybWF0T3B0aW9ucy5zaG93RW1wdHlJbmRpY2F0b3IgPz8gZmFsc2UgPyBcIk9uXCIgOiB1bmRlZmluZWQ7XG5cdFx0Y29uc3Qgb2JqZWN0U3RhdHVzVGV4dCA9IGJ1aWxkRmllbGRCaW5kaW5nRXhwcmVzc2lvbihkYXRhTW9kZWxQYXRoLCB0aGlzLmZvcm1hdE9wdGlvbnMsIGZhbHNlKTtcblx0XHRjb25zdCBpY29uRXhwcmVzc2lvbiA9IGJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5SWNvbihkYXRhUG9pbnRDb252ZXJ0ZWQsIGRhdGFNb2RlbFBhdGgpO1xuXG5cdFx0cmV0dXJuIHhtbGA8T2JqZWN0U3RhdHVzXG5cdFx0XHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwiaWRcIiwgdGhpcy5pZFByZWZpeCA/IGdlbmVyYXRlKFt0aGlzLmlkUHJlZml4LCBcIk9iamVjdFN0YXR1cy1GaWVsZC1kaXNwbGF5XCJdKSA6IHVuZGVmaW5lZCl9XG5cdFx0XHRcdFx0XHRjb3JlOnJlcXVpcmU9XCJ7IEZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJyB9XCJcblx0XHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwiY2xhc3NcIiwgdGhpcy5mb3JtYXRPcHRpb25zLmRhdGFQb2ludFN0eWxlID09PSBcImxhcmdlXCIgPyBcInNhcE1PYmplY3RTdGF0dXNMYXJnZVwiIDogdW5kZWZpbmVkKX1cblx0XHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwiaWNvblwiLCBpY29uRXhwcmVzc2lvbil9XG5cdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcInRvb2x0aXBcIiwgdGhpcy5nZXRUb29sdGlwVmFsdWUoKSl9XG5cdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcInN0YXRlXCIsIGNyaXRpY2FsaXR5Q29sb3JFeHByZXNzaW9uKX1cblx0XHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwidGV4dFwiLCBvYmplY3RTdGF0dXNUZXh0KX1cblx0XHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwiZW1wdHlJbmRpY2F0b3JNb2RlXCIsIGVtcHR5SW5kaWNhdG9yTW9kZSl9XG5cdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcImFjdGl2ZVwiLCBhY3RpdmUpfVxuXHRcdFx0XHRcdFx0cHJlc3M9XCJGaWVsZFJ1bnRpbWUucHJlc3NMaW5rXCJcblx0XHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwiYXJpYUxhYmVsbGVkQnlcIiwgdGhpcy5hcmlhTGFiZWxsZWRCeSAhPT0gbnVsbCA/IHRoaXMuYXJpYUxhYmVsbGVkQnkgOiB1bmRlZmluZWQpfVxuXHRcdFx0XHRcdFx0JHt0aGlzLmF0dHIoXG5cdFx0XHRcdFx0XHRcdFwibW9kZWxDb250ZXh0Q2hhbmdlXCIsXG5cdFx0XHRcdFx0XHRcdEZpZWxkSGVscGVyLmhhc1NlbWFudGljT2JqZWN0c1dpdGhQYXRoKHRoaXMuc2VtYW50aWNPYmplY3RzLmdldE9iamVjdCgpKVxuXHRcdFx0XHRcdFx0XHRcdD8gRmllbGRIZWxwZXIuY29tcHV0ZVNlbWFudGljTGlua01vZGVsQ29udGV4dENoYW5nZSh0aGlzLnNlbWFudGljT2JqZWN0cy5nZXRPYmplY3QoKSwgdmFsdWVEYXRhTW9kZWxQYXRoKVxuXHRcdFx0XHRcdFx0XHRcdDogdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQpfVxuXHRcdFx0XHQ+JHt0aGlzLmdldE9iamVjdFN0YXR1c0RlcGVuZGVudHNUZW1wbGF0ZSgpfVxuXHRcdFx0XHQ8L09iamVjdFN0YXR1cz5gO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBoZWxwZXIgbWV0aG9kIHRvIGdldCBhIHBvc3NpYmxlIHRvb2x0aXAgdGV4dC5cblx0ICpcblx0ICogQHJldHVybnMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uXG5cdCAqL1xuXHRwcml2YXRlIGdldFRvb2x0aXBWYWx1ZSgpIHtcblx0XHRjb25zdCB7IGRhdGFNb2RlbFBhdGgsIGRhdGFQb2ludENvbnZlcnRlZCB9ID0gRGF0YVBvaW50LmdldFRlbXBsYXRpbmdPYmplY3RzKHRoaXMpO1xuXHRcdHJldHVybiBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YVBvaW50Q29udmVydGVkPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm8/LnZhbHVlT2YoKSwgZ2V0UmVsYXRpdmVQYXRocyhkYXRhTW9kZWxQYXRoKSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGhlbHBlciBtZXRob2QgdG8gZ2V0IGEgcG9zc2libGUgdGFyZ2V0IHZhbHVlIGJpbmRpbmcuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvblxuXHQgKi9cblx0cHJpdmF0ZSBnZXRUYXJnZXRWYWx1ZUJpbmRpbmcoKSB7XG5cdFx0Y29uc3QgeyBkYXRhTW9kZWxQYXRoLCBkYXRhUG9pbnRDb252ZXJ0ZWQgfSA9IERhdGFQb2ludC5nZXRUZW1wbGF0aW5nT2JqZWN0cyh0aGlzKTtcblx0XHRyZXR1cm4gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFQb2ludENvbnZlcnRlZC5UYXJnZXRWYWx1ZSwgZ2V0UmVsYXRpdmVQYXRocyhkYXRhTW9kZWxQYXRoKSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHRlbXBsYXRlIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdHN3aXRjaCAodGhpcy52aXN1YWxpemF0aW9uKSB7XG5cdFx0XHRjYXNlIFwiUmF0aW5nXCI6IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0UmF0aW5nSW5kaWNhdG9yVGVtcGxhdGUoKTtcblx0XHRcdH1cblx0XHRcdGNhc2UgXCJQcm9ncmVzc1wiOiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFByb2dyZXNzSW5kaWNhdG9yVGVtcGxhdGUoKTtcblx0XHRcdH1cblx0XHRcdGNhc2UgXCJPYmplY3ROdW1iZXJcIjoge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRPYmplY3ROdW1iZXJUZW1wbGF0ZSgpO1xuXHRcdFx0fVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRPYmplY3RTdGF0dXNUZW1wbGF0ZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01Ba0ZxQkEsU0FBUyxXQVI3QkMsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxXQUFXO0lBQ2pCQyxTQUFTLEVBQUU7RUFDWixDQUFDLENB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O1FBQUVFO01BQW1CLENBQUMsR0FBR2xDLFNBQVMsQ0FBQ2lCLG9CQUFvQixDQUFDLElBQUksQ0FBQztNQUNsRixPQUFPc0QsMkJBQTJCLENBQUNyQyxrQkFBa0IsYUFBbEJBLGtCQUFrQixnREFBbEJBLGtCQUFrQixDQUFFTyxXQUFXLG9GQUEvQixzQkFBaUNDLE1BQU0scUZBQXZDLHVCQUF5QzBGLFNBQVMsMkRBQWxELHVCQUFvREMsT0FBTyxFQUFFLEVBQUU3RCxnQkFBZ0IsQ0FBQ3hDLGFBQWEsQ0FBQyxDQUFDO0lBQ25JOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS1FzQixxQkFBcUIsR0FBN0IsaUNBQWdDO01BQy9CLE1BQU07UUFBRXRCLGFBQWE7UUFBRUU7TUFBbUIsQ0FBQyxHQUFHbEMsU0FBUyxDQUFDaUIsb0JBQW9CLENBQUMsSUFBSSxDQUFDO01BQ2xGLE9BQU9zRCwyQkFBMkIsQ0FBQ3JDLGtCQUFrQixDQUFDdUMsV0FBVyxFQUFFRCxnQkFBZ0IsQ0FBQ3hDLGFBQWEsQ0FBQyxDQUFDO0lBQ3BHOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS0FzRyxXQUFXLEdBQVgsdUJBQWM7TUFDYixRQUFRLElBQUksQ0FBQ2hHLGFBQWE7UUFDekIsS0FBSyxRQUFRO1VBQUU7WUFDZCxPQUFPLElBQUksQ0FBQ2EsMEJBQTBCLEVBQUU7VUFDekM7UUFDQSxLQUFLLFVBQVU7VUFBRTtZQUNoQixPQUFPLElBQUksQ0FBQ2lDLDRCQUE0QixFQUFFO1VBQzNDO1FBQ0EsS0FBSyxjQUFjO1VBQUU7WUFDcEIsT0FBTyxJQUFJLENBQUNvQix1QkFBdUIsRUFBRTtVQUN0QztRQUNBO1VBQVM7WUFDUixPQUFPLElBQUksQ0FBQ00sdUJBQXVCLEVBQUU7VUFDdEM7TUFBQztJQUVILENBQUM7SUFBQTtFQUFBLEVBamVxQ3lCLGlCQUFpQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9