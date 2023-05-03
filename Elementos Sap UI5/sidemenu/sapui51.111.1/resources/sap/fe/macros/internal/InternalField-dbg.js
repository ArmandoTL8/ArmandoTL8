/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/CollaborationFormatter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/TemplateModel", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/situations/SituationsIndicator.fragment", "sap/ui/mdc/enum/EditMode"], function (BuildingBlock, BuildingBlockRuntime, CommonUtils, BindingHelper, MetaModelConverter, CollaborationFormatters, valueFormatters, BindingToolkit, ModelHelper, StableIdHelper, TemplateModel, DataModelPathHelper, PropertyHelper, UIFormatters, FieldTemplating, SituationsIndicator, EditMode) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30;
  var _exports = {};
  var isSemanticKey = PropertyHelper.isSemanticKey;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatWithTypeInformation = BindingToolkit.formatWithTypeInformation;
  var formatResult = BindingToolkit.formatResult;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var Entity = BindingHelper.Entity;
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockEvent = BuildingBlock.blockEvent;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let Field = (
  /**
   * Building block for creating a Field based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField annotation is expected
   *
   * Usage example:
   * <pre>
   * <internalMacro:Field
   *   idPrefix="SomePrefix"
   *   contextPath="{entitySet>}"
   *   metaPath="{dataField>}"
   * />
   * </pre>
   *
   * @hideconstructor
   * @private
   * @experimental
   * @since 1.94.0
   */
  _dec = defineBuildingBlock({
    name: "Field",
    namespace: "sap.fe.macros.internal",
    designtime: "sap/fe/macros/internal/Field.designtime"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "string"
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "string",
    defaultValue: "FieldValueHelp"
  }), _dec9 = blockAttribute({
    type: "string",
    computed: true
  }), _dec10 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    $kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec11 = blockAttribute({
    type: "sap.ui.model.Context",
    required: false,
    computed: true,
    $kind: ["EntityType"]
  }), _dec12 = blockAttribute({
    type: "boolean",
    defaultValue: true
  }), _dec13 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    $kind: ["Property"],
    $Type: ["com.sap.vocabularies.UI.v1.DataField", "com.sap.vocabularies.UI.v1.DataFieldWithUrl", "com.sap.vocabularies.UI.v1.DataFieldForAnnotation", "com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithAction", "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath", "com.sap.vocabularies.UI.v1.DataPointType"]
  }), _dec14 = blockAttribute({
    type: "sap.ui.model.Context",
    required: false,
    computed: true
  }), _dec15 = blockAttribute({
    type: "sap.ui.mdc.enum.EditMode"
  }), _dec16 = blockAttribute({
    type: "boolean"
  }), _dec17 = blockAttribute({
    type: "string"
  }), _dec18 = blockAttribute({
    type: "string"
  }), _dec19 = blockAttribute({
    type: "sap.ui.core.TextAlign"
  }), _dec20 = blockAttribute({
    type: "string",
    computed: true
  }), _dec21 = blockAttribute({
    type: "string",
    computed: true
  }), _dec22 = blockAttribute({
    type: "boolean",
    computed: true
  }), _dec23 = blockAttribute({
    type: "string",
    computed: true
  }), _dec24 = blockAttribute({
    type: "string",
    computed: true
  }), _dec25 = blockAttribute({
    type: "string",
    computed: true
  }), _dec26 = blockAttribute({
    type: "string",
    required: false
  }), _dec27 = blockAttribute({
    type: "boolean",
    required: false
  }), _dec28 = blockAttribute({
    type: "string"
  }), _dec29 = blockAttribute({
    type: "boolean"
  }), _dec30 = blockAttribute({
    type: "object",
    validate: function (formatOptionsInput) {
      if (formatOptionsInput.textAlignMode && !["Table", "Form"].includes(formatOptionsInput.textAlignMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.textAlignMode} for textAlignMode does not match`);
      }
      if (formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      if (formatOptionsInput.fieldMode && !["nowrapper", ""].includes(formatOptionsInput.fieldMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.fieldMode} for fieldMode does not match`);
      }
      if (formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput.measureDisplayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
      }
      if (formatOptionsInput.textExpandBehaviorDisplay && !["InPlace", "Popover"].includes(formatOptionsInput.textExpandBehaviorDisplay)) {
        throw new Error(`Allowed value ${formatOptionsInput.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`);
      }
      if (formatOptionsInput.semanticKeyStyle && !["ObjectIdentifier", "Label", ""].includes(formatOptionsInput.semanticKeyStyle)) {
        throw new Error(`Allowed value ${formatOptionsInput.semanticKeyStyle} for semanticKeyStyle does not match`);
      }

      /*
      Historical default values are currently disabled
      if (!formatOptionsInput.semanticKeyStyle) {
      	formatOptionsInput.semanticKeyStyle = "";
      }
      */

      return formatOptionsInput;
    }
  }), _dec31 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(Field, _BuildingBlockBase);
    /**
     * Metadata path to the entity set
     */
    /**
     * Metadata path to the entity set
     */
    /**
     * Flag indicating whether action will navigate after execution
     */
    /**
     * Metadata path to the dataField.
     * This property is usually a metadataContext pointing to a DataField having
     * $Type of DataField, DataFieldWithUrl, DataFieldForAnnotation, DataFieldForAction, DataFieldForIntentBasedNavigation, DataFieldWithNavigationPath, or DataPointType.
     * But it can also be a Property with $kind="Property"
     */
    /**
     * Context pointing to an array of the property's semantic objects
     */
    /**
     * Edit Mode of the field.
     *
     * If the editMode is undefined then we compute it based on the metadata
     * Otherwise we use the value provided here.
     */
    /**
     * Wrap field
     */
    /**
     * CSS class for margin
     */
    /**
     * Property added to associate the label with the Field
     */
    /**
     * Option to add a semantic object to a field
     */
    /**
     * Event handler for change event
     */
    Field.getOverrides = function getOverrides(mControlConfiguration, sID) {
      const oProps = {};
      if (mControlConfiguration) {
        const oControlConfig = mControlConfiguration[sID];
        if (oControlConfig) {
          Object.keys(oControlConfig).forEach(function (sConfigKey) {
            oProps[sConfigKey] = oControlConfig[sConfigKey];
          });
        }
      }
      return oProps;
    };
    Field.getObjectIdentifierTitle = function getObjectIdentifierTitle(fieldFormatOptions, oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$, _oPropertyDefinition$2, _oPropertyDataModelOb, _oPropertyDataModelOb2, _oPropertyDataModelOb3, _oPropertyDataModelOb4, _oPropertyDataModelOb5, _oPropertyDataModelOb6, _commonText$annotatio, _commonText$annotatio2;
      let propertyBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      let targetDisplayMode = fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.displayMode;
      const oPropertyDefinition = oPropertyDataModelObjectPath.targetObject.type === "PropertyPath" ? oPropertyDataModelObjectPath.targetObject.$target : oPropertyDataModelObjectPath.targetObject;
      propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);
      const commonText = (_oPropertyDefinition$ = oPropertyDefinition.annotations) === null || _oPropertyDefinition$ === void 0 ? void 0 : (_oPropertyDefinition$2 = _oPropertyDefinition$.Common) === null || _oPropertyDefinition$2 === void 0 ? void 0 : _oPropertyDefinition$2.Text;
      if (commonText === undefined) {
        // there is no property for description
        targetDisplayMode = "Value";
      }
      const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
      const parametersForFormatter = [];
      parametersForFormatter.push(pathInModel("T_NEW_OBJECT", "sap.fe.i18n"));
      parametersForFormatter.push(pathInModel("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO", "sap.fe.i18n"));
      if (!!((_oPropertyDataModelOb = oPropertyDataModelObjectPath.targetEntitySet) !== null && _oPropertyDataModelOb !== void 0 && (_oPropertyDataModelOb2 = _oPropertyDataModelOb.annotations) !== null && _oPropertyDataModelOb2 !== void 0 && (_oPropertyDataModelOb3 = _oPropertyDataModelOb2.Common) !== null && _oPropertyDataModelOb3 !== void 0 && _oPropertyDataModelOb3.DraftRoot) || !!((_oPropertyDataModelOb4 = oPropertyDataModelObjectPath.targetEntitySet) !== null && _oPropertyDataModelOb4 !== void 0 && (_oPropertyDataModelOb5 = _oPropertyDataModelOb4.annotations) !== null && _oPropertyDataModelOb5 !== void 0 && (_oPropertyDataModelOb6 = _oPropertyDataModelOb5.Common) !== null && _oPropertyDataModelOb6 !== void 0 && _oPropertyDataModelOb6.DraftNode)) {
        parametersForFormatter.push(Entity.HasDraft);
        parametersForFormatter.push(Entity.IsActive);
      } else {
        parametersForFormatter.push(constant(null));
        parametersForFormatter.push(constant(null));
      }
      switch (targetDisplayMode) {
        case "Value":
          parametersForFormatter.push(propertyBindingExpression);
          parametersForFormatter.push(constant(null));
          break;
        case "Description":
          parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
          parametersForFormatter.push(constant(null));
          break;
        case "ValueDescription":
          parametersForFormatter.push(propertyBindingExpression);
          parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
          break;
        default:
          if (commonText !== null && commonText !== void 0 && (_commonText$annotatio = commonText.annotations) !== null && _commonText$annotatio !== void 0 && (_commonText$annotatio2 = _commonText$annotatio.UI) !== null && _commonText$annotatio2 !== void 0 && _commonText$annotatio2.TextArrangement) {
            parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
            parametersForFormatter.push(propertyBindingExpression);
          } else {
            var _oPropertyDataModelOb7, _oPropertyDataModelOb8, _oPropertyDataModelOb9;
            // if DescriptionValue is set by default and not by TextArrangement
            // we show description in ObjectIdentifier Title and value in ObjectIdentifier Text
            parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
            // if DescriptionValue is set by default and property has a semantic object
            // we show description and value in ObjectIdentifier Title
            if ((_oPropertyDataModelOb7 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb7 !== void 0 && (_oPropertyDataModelOb8 = _oPropertyDataModelOb7.annotations) !== null && _oPropertyDataModelOb8 !== void 0 && (_oPropertyDataModelOb9 = _oPropertyDataModelOb8.Common) !== null && _oPropertyDataModelOb9 !== void 0 && _oPropertyDataModelOb9.SemanticObject) {
              parametersForFormatter.push(propertyBindingExpression);
            } else {
              parametersForFormatter.push(constant(null));
            }
          }
          break;
      }
      return compileExpression(formatResult(parametersForFormatter, valueFormatters.formatOPTitle));
    };
    Field.getObjectIdentifierText = function getObjectIdentifierText(fieldFormatOptions, oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$3, _oPropertyDefinition$4, _commonText$annotatio3, _commonText$annotatio4;
      let propertyBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      const targetDisplayMode = fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.displayMode;
      const oPropertyDefinition = oPropertyDataModelObjectPath.targetObject.type === "PropertyPath" ? oPropertyDataModelObjectPath.targetObject.$target : oPropertyDataModelObjectPath.targetObject;
      const commonText = (_oPropertyDefinition$3 = oPropertyDefinition.annotations) === null || _oPropertyDefinition$3 === void 0 ? void 0 : (_oPropertyDefinition$4 = _oPropertyDefinition$3.Common) === null || _oPropertyDefinition$4 === void 0 ? void 0 : _oPropertyDefinition$4.Text;
      if (commonText === undefined || commonText !== null && commonText !== void 0 && (_commonText$annotatio3 = commonText.annotations) !== null && _commonText$annotatio3 !== void 0 && (_commonText$annotatio4 = _commonText$annotatio3.UI) !== null && _commonText$annotatio4 !== void 0 && _commonText$annotatio4.TextArrangement) {
        return undefined;
      }
      propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);
      switch (targetDisplayMode) {
        case "ValueDescription":
          const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
          return compileExpression(getExpressionFromAnnotation(commonText, relativeLocation));
        case "DescriptionValue":
          return compileExpression(formatResult([propertyBindingExpression], valueFormatters.formatToKeepWhitespace));
        default:
          return undefined;
      }
    };
    Field.setUpDataPointType = function setUpDataPointType(oDataField) {
      // data point annotations need not have $Type defined, so add it if missing
      if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.term) === "com.sap.vocabularies.UI.v1.DataPoint") {
        oDataField.$Type = oDataField.$Type || "com.sap.vocabularies.UI.v1.DataPointType";
      }
    };
    Field.setUpVisibleProperties = function setUpVisibleProperties(oFieldProps, oPropertyDataModelObjectPath) {
      // we do this before enhancing the dataModelPath so that it still points at the DataField
      oFieldProps.visible = FieldTemplating.getVisibleExpression(oPropertyDataModelObjectPath, oFieldProps.formatOptions);
      oFieldProps.displayVisible = oFieldProps.formatOptions.fieldMode === "nowrapper" ? oFieldProps.visible : undefined;
    };
    Field.getContentId = function getContentId(sMacroId) {
      return `${sMacroId}-content`;
    };
    Field.setUpSemanticObjects = function setUpSemanticObjects(oProps, oDataModelPath) {
      var _oDataModelPath$targe, _oDataModelPath$targe2;
      let aSemObjExprToResolve = [];
      aSemObjExprToResolve = FieldTemplating.getSemanticObjectExpressionToResolve(oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe = oDataModelPath.targetObject) === null || _oDataModelPath$targe === void 0 ? void 0 : (_oDataModelPath$targe2 = _oDataModelPath$targe.annotations) === null || _oDataModelPath$targe2 === void 0 ? void 0 : _oDataModelPath$targe2.Common);

      /**
       * If the field building block has a binding expression in the custom semantic objects,
       * it is then used by the QuickView Form BB.
       * This is needed to resolve the link at runtime. The QuickViewDelegate.js then gets the resolved
       * binding expression from the custom data.
       * All other semanticObjects are processed in the QuickView building block.
       */
      if (!!oProps.semanticObject && typeof oProps.semanticObject === "string" && oProps.semanticObject[0] === "{") {
        aSemObjExprToResolve.push({
          key: oProps.semanticObject.substr(1, oProps.semanticObject.length - 2),
          value: oProps.semanticObject
        });
      }
      oProps.semanticObjects = FieldTemplating.getSemanticObjects(aSemObjExprToResolve);
      // This sets up the semantic links found in the navigation property, if there is no semantic links define before.
      if (!oProps.semanticObject && oDataModelPath.navigationProperties.length > 0) {
        oDataModelPath.navigationProperties.forEach(function (navProperty) {
          var _navProperty$annotati, _navProperty$annotati2;
          if (navProperty !== null && navProperty !== void 0 && (_navProperty$annotati = navProperty.annotations) !== null && _navProperty$annotati !== void 0 && (_navProperty$annotati2 = _navProperty$annotati.Common) !== null && _navProperty$annotati2 !== void 0 && _navProperty$annotati2.SemanticObject) {
            oProps.semanticObject = navProperty.annotations.Common.SemanticObject;
            oProps.hasSemanticObjectOnNavigation = true;
          }
        });
      }
    };
    Field.setUpEditableProperties = function setUpEditableProperties(oProps, oDataField, oDataModelPath, oMetaModel) {
      var _oDataModelPath$targe3, _oProps$entitySet, _oProps$entitySet2;
      const oPropertyForFieldControl = oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe3 = oDataModelPath.targetObject) !== null && _oDataModelPath$targe3 !== void 0 && _oDataModelPath$targe3.Value ? oDataModelPath.targetObject.Value : oDataModelPath === null || oDataModelPath === void 0 ? void 0 : oDataModelPath.targetObject;
      if (oProps.editMode !== undefined && oProps.editMode !== null) {
        // Even if it provided as a string it's a valid part of a binding expression that can be later combined into something else.
        oProps.editModeAsObject = oProps.editMode;
      } else {
        const bMeasureReadOnly = oProps.formatOptions.measureDisplayMode ? oProps.formatOptions.measureDisplayMode === "ReadOnly" : false;
        oProps.editModeAsObject = UIFormatters.getEditMode(oPropertyForFieldControl, oDataModelPath, bMeasureReadOnly, true, oDataField);
        oProps.editMode = compileExpression(oProps.editModeAsObject);
      }
      const editableExpression = UIFormatters.getEditableExpressionAsObject(oPropertyForFieldControl, oDataField, oDataModelPath);
      const aRequiredPropertiesFromInsertRestrictions = CommonUtils.getRequiredPropertiesFromInsertRestrictions((_oProps$entitySet = oProps.entitySet) === null || _oProps$entitySet === void 0 ? void 0 : _oProps$entitySet.getPath().replaceAll("/$NavigationPropertyBinding/", "/"), oMetaModel);
      const aRequiredPropertiesFromUpdateRestrictions = CommonUtils.getRequiredPropertiesFromUpdateRestrictions((_oProps$entitySet2 = oProps.entitySet) === null || _oProps$entitySet2 === void 0 ? void 0 : _oProps$entitySet2.getPath().replaceAll("/$NavigationPropertyBinding/", "/"), oMetaModel);
      const oRequiredProperties = {
        requiredPropertiesFromInsertRestrictions: aRequiredPropertiesFromInsertRestrictions,
        requiredPropertiesFromUpdateRestrictions: aRequiredPropertiesFromUpdateRestrictions
      };
      if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
        oProps.collaborationEnabled = true;
        // Expressions needed for Collaboration Visualization
        const collaborationExpression = UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.hasCollaborationActivity);
        oProps.collaborationHasActivityExpression = compileExpression(collaborationExpression);
        oProps.collaborationInitialsExpression = compileExpression(UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityInitials));
        oProps.collaborationColorExpression = compileExpression(UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityColor));
        oProps.editableExpression = compileExpression(and(editableExpression, not(collaborationExpression)));
        oProps.editMode = compileExpression(ifElse(collaborationExpression, constant("ReadOnly"), oProps.editModeAsObject));
      } else {
        oProps.editableExpression = compileExpression(editableExpression);
      }
      oProps.enabledExpression = UIFormatters.getEnabledExpression(oPropertyForFieldControl, oDataField, false, oDataModelPath);
      oProps.requiredExpression = UIFormatters.getRequiredExpression(oPropertyForFieldControl, oDataField, false, false, oRequiredProperties, oDataModelPath);
    };
    Field.setUpFormatOptions = function setUpFormatOptions(oProps, oDataModelPath, oControlConfiguration, mSettings) {
      var _mSettings$models$vie;
      const oOverrideProps = Field.getOverrides(oControlConfiguration, oProps.dataField.getPath());
      if (!oProps.formatOptions.displayMode) {
        oProps.formatOptions.displayMode = UIFormatters.getDisplayMode(oDataModelPath);
      }
      oProps.formatOptions.textLinesEdit = oOverrideProps.textLinesEdit || oOverrideProps.formatOptions && oOverrideProps.formatOptions.textLinesEdit || oProps.formatOptions.textLinesEdit || 4;
      oProps.formatOptions.textMaxLines = oOverrideProps.textMaxLines || oOverrideProps.formatOptions && oOverrideProps.formatOptions.textMaxLines || oProps.formatOptions.textMaxLines;

      // Retrieve text from value list as fallback feature for missing text annotation on the property
      if ((_mSettings$models$vie = mSettings.models.viewData) !== null && _mSettings$models$vie !== void 0 && _mSettings$models$vie.getProperty("/retrieveTextFromValueList")) {
        oProps.formatOptions.retrieveTextFromValueList = FieldTemplating.isRetrieveTextFromValueListEnabled(oDataModelPath.targetObject, oProps.formatOptions);
        if (oProps.formatOptions.retrieveTextFromValueList) {
          var _oDataModelPath$targe4, _oDataModelPath$targe5, _oDataModelPath$targe6;
          // Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
          const hasEntityTextArrangement = !!(oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe4 = oDataModelPath.targetEntityType) !== null && _oDataModelPath$targe4 !== void 0 && (_oDataModelPath$targe5 = _oDataModelPath$targe4.annotations) !== null && _oDataModelPath$targe5 !== void 0 && (_oDataModelPath$targe6 = _oDataModelPath$targe5.UI) !== null && _oDataModelPath$targe6 !== void 0 && _oDataModelPath$targe6.TextArrangement);
          oProps.formatOptions.displayMode = hasEntityTextArrangement ? oProps.formatOptions.displayMode : "DescriptionValue";
        }
      }
      if (oProps.formatOptions.fieldMode === "nowrapper" && oProps.editMode === "Display") {
        if (oProps._flexId) {
          oProps.noWrapperId = oProps._flexId;
        } else {
          oProps.noWrapperId = oProps.idPrefix ? generate([oProps.idPrefix, "Field-content"]) : undefined;
        }
      }
    };
    Field.setUpDisplayStyle = function setUpDisplayStyle(oProps, oDataField, oDataModelPath) {
      var _oProperty$annotation, _oProperty$annotation2, _oDataField$Target, _oDataField$Target$$t, _oDataField$Target2, _oDataField$Target2$$, _oProperty$annotation3, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6, _oProperty$annotation7, _oProperty$annotation8, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14, _oProperty$annotation15, _oDataModelPath$navig, _oDataModelPath$navig2;
      const oProperty = oDataModelPath.targetObject;
      if (!oDataModelPath.targetObject) {
        oProps.displayStyle = "Text";
        return;
      }
      if (oProperty.type === "Edm.Stream") {
        oProps.fileSrc = compileExpression(getExpressionFromAnnotation(oDataField.Value));
        oProps.displayStyle = "File";
        return;
      }
      if ((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.UI) !== null && _oProperty$annotation2 !== void 0 && _oProperty$annotation2.IsImageURL) {
        oProps.avatarVisible = FieldTemplating.getVisibleExpression(oDataModelPath);
        oProps.avatarSrc = compileExpression(getExpressionFromAnnotation(oDataField.Value));
        oProps.displayStyle = "Avatar";
        return;
      }
      const hasQuickViewFacets = oProperty ? FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, oProperty) : false;
      switch (oDataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataPointType":
          oProps.displayStyle = "DataPoint";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          if (((_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : (_oDataField$Target$$t = _oDataField$Target.$target) === null || _oDataField$Target$$t === void 0 ? void 0 : _oDataField$Target$$t.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            oProps.displayStyle = "DataPoint";
            return;
          } else if (((_oDataField$Target2 = oDataField.Target) === null || _oDataField$Target2 === void 0 ? void 0 : (_oDataField$Target2$$ = _oDataField$Target2.$target) === null || _oDataField$Target2$$ === void 0 ? void 0 : _oDataField$Target2$$.$Type) === "com.sap.vocabularies.Communication.v1.ContactType") {
            oProps.displayStyle = "Contact";
            return;
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          oProps.displayStyle = "Button";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          Field.setUpNavigationAvailable(oProps, oDataField);
          oProps.displayStyle = "Button";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
          oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        // falls through
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          oProps.displayStyle = "Link";
          return;
      }
      if (isSemanticKey(oProperty, oDataModelPath) && oProps.formatOptions.semanticKeyStyle) {
        var _oDataModelPath$targe7, _oDataModelPath$targe8, _oDataModelPath$targe9;
        oProps.hasQuickViewFacets = hasQuickViewFacets;
        oProps.hasSituationsIndicator = SituationsIndicator.getSituationsNavigationProperty(oDataModelPath.targetEntityType) !== undefined;
        Field.setUpObjectIdentifierTitleAndText(oProps, oDataModelPath);
        if ((_oDataModelPath$targe7 = oDataModelPath.targetEntitySet) !== null && _oDataModelPath$targe7 !== void 0 && (_oDataModelPath$targe8 = _oDataModelPath$targe7.annotations) !== null && _oDataModelPath$targe8 !== void 0 && (_oDataModelPath$targe9 = _oDataModelPath$targe8.Common) !== null && _oDataModelPath$targe9 !== void 0 && _oDataModelPath$targe9.DraftRoot) {
          oProps.displayStyle = "SemanticKeyWithDraftIndicator";
          return;
        }
        oProps.displayStyle = oProps.formatOptions.semanticKeyStyle === "ObjectIdentifier" ? "ObjectIdentifier" : "LabelSemanticKey";
        return;
      }
      if (oDataField.Criticality) {
        oProps.hasQuickViewFacets = hasQuickViewFacets;
        oProps.displayStyle = "ObjectStatus";
        return;
      }
      if ((_oProperty$annotation3 = oProperty.annotations) !== null && _oProperty$annotation3 !== void 0 && (_oProperty$annotation4 = _oProperty$annotation3.Measures) !== null && _oProperty$annotation4 !== void 0 && _oProperty$annotation4.ISOCurrency && String(oProps.formatOptions.isCurrencyAligned) === "true") {
        if (oProps.formatOptions.measureDisplayMode === "Hidden") {
          oProps.displayStyle = "Text";
          return;
        }
        oProps.valueAsStringBindingExpression = FieldTemplating.getValueBinding(oDataModelPath, oProps.formatOptions, true, true, undefined, true);
        oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        oProps.displayStyle = "AmountWithCurrency";
        return;
      }
      if ((_oProperty$annotation5 = oProperty.annotations) !== null && _oProperty$annotation5 !== void 0 && (_oProperty$annotation6 = _oProperty$annotation5.Communication) !== null && _oProperty$annotation6 !== void 0 && _oProperty$annotation6.IsEmailAddress || (_oProperty$annotation7 = oProperty.annotations) !== null && _oProperty$annotation7 !== void 0 && (_oProperty$annotation8 = _oProperty$annotation7.Communication) !== null && _oProperty$annotation8 !== void 0 && _oProperty$annotation8.IsPhoneNumber) {
        oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.displayStyle = "Link";
        return;
      }
      if ((_oProperty$annotation9 = oProperty.annotations) !== null && _oProperty$annotation9 !== void 0 && (_oProperty$annotation10 = _oProperty$annotation9.UI) !== null && _oProperty$annotation10 !== void 0 && _oProperty$annotation10.MultiLineText) {
        oProps.displayStyle = "ExpandableText";
        return;
      }
      if (hasQuickViewFacets) {
        oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.hasQuickViewFacets = true;
        oProps.displayStyle = "LinkWithQuickView";
        return;
      }
      if (oProps.semanticObject && !(oProperty !== null && oProperty !== void 0 && (_oProperty$annotation11 = oProperty.annotations) !== null && _oProperty$annotation11 !== void 0 && (_oProperty$annotation12 = _oProperty$annotation11.Communication) !== null && _oProperty$annotation12 !== void 0 && _oProperty$annotation12.IsEmailAddress || oProperty !== null && oProperty !== void 0 && (_oProperty$annotation13 = oProperty.annotations) !== null && _oProperty$annotation13 !== void 0 && (_oProperty$annotation14 = _oProperty$annotation13.Communication) !== null && _oProperty$annotation14 !== void 0 && _oProperty$annotation14.IsPhoneNumber)) {
        oProps.hasQuickViewFacets = hasQuickViewFacets;
        oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.displayStyle = "LinkWithQuickView";
        return;
      }
      if (FieldTemplating.hasSemanticObjectInNavigationOrProperty(oDataModelPath)) {
        oProps.hasQuickViewFacets = hasQuickViewFacets;
        oProps.displayStyle = "LinkWrapper";
        return;
      }
      const _oPropertyCommonAnnotations = (_oProperty$annotation15 = oProperty.annotations) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Common;
      const _oPropertyNavigationPropertyAnnotations = oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$navig = oDataModelPath.navigationProperties[0]) === null || _oDataModelPath$navig === void 0 ? void 0 : (_oDataModelPath$navig2 = _oDataModelPath$navig.annotations) === null || _oDataModelPath$navig2 === void 0 ? void 0 : _oDataModelPath$navig2.Common;
      for (const key in _oPropertyCommonAnnotations) {
        if (key.indexOf("SemanticObject") === 0) {
          oProps.hasQuickViewFacets = hasQuickViewFacets;
          oProps.displayStyle = "LinkWrapper";
          return;
        }
      }
      for (const key in _oPropertyNavigationPropertyAnnotations) {
        if (key.indexOf("SemanticObject") === 0) {
          oProps.hasQuickViewFacets = hasQuickViewFacets;
          oProps.displayStyle = "LinkWrapper";
          return;
        }
      }
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
        oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.displayStyle = "Link";
        oProps.iconUrl = oDataField.IconUrl ? compileExpression(getExpressionFromAnnotation(oDataField.IconUrl)) : undefined;
        oProps.linkUrl = compileExpression(getExpressionFromAnnotation(oDataField.Url));
        return;
      }
      oProps.displayStyle = "Text";
    };
    Field.setUpEditStyle = function setUpEditStyle(oProps, oDataField, oDataModelPath) {
      FieldTemplating.setEditStyleProperties(oProps, oDataField, oDataModelPath);
    };
    Field.setUpObjectIdentifierTitleAndText = function setUpObjectIdentifierTitleAndText(_oProps, oPropertyDataModelObjectPath) {
      var _oProps$formatOptions;
      if (((_oProps$formatOptions = _oProps.formatOptions) === null || _oProps$formatOptions === void 0 ? void 0 : _oProps$formatOptions.semanticKeyStyle) === "ObjectIdentifier") {
        var _oPropertyDataModelOb10, _oPropertyDataModelOb11, _oPropertyDataModelOb12;
        _oProps.identifierTitle = Field.getObjectIdentifierTitle(_oProps.formatOptions, oPropertyDataModelObjectPath);
        if (!((_oPropertyDataModelOb10 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb10 !== void 0 && (_oPropertyDataModelOb11 = _oPropertyDataModelOb10.annotations) !== null && _oPropertyDataModelOb11 !== void 0 && (_oPropertyDataModelOb12 = _oPropertyDataModelOb11.Common) !== null && _oPropertyDataModelOb12 !== void 0 && _oPropertyDataModelOb12.SemanticObject)) {
          _oProps.identifierText = Field.getObjectIdentifierText(_oProps.formatOptions, oPropertyDataModelObjectPath);
        } else {
          _oProps.identifierText = undefined;
        }
      } else {
        _oProps.identifierTitle = undefined;
        _oProps.identifierText = undefined;
      }
    };
    Field.getTextWithWhiteSpace = function getTextWithWhiteSpace(formatOptions, oDataModelPath) {
      const text = FieldTemplating.getTextBinding(oDataModelPath, formatOptions, true);
      return text._type === "PathInModel" || typeof text === "string" ? compileExpression(formatResult([text], "WSR")) : compileExpression(text);
    };
    Field.setUpNavigationAvailable = function setUpNavigationAvailable(oProps, oDataField) {
      oProps.navigationAvailable = true;
      if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && oDataField.NavigationAvailable !== undefined && String(oProps.formatOptions.ignoreNavigationAvailable) !== "true") {
        oProps.navigationAvailable = compileExpression(getExpressionFromAnnotation(oDataField.NavigationAvailable));
      }
    };
    function Field(props, controlConfiguration, settings) {
      var _this$dataField$getOb;
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "dataSourcePath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "emptyIndicatorMode", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_flexId", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "idPrefix", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_apiId", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "noWrapperId", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vhIdPrefix", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_vhFlexId", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entityType", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigateAfterAction", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataField", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObjects", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editMode", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "wrap", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "class", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "textAlign", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editableExpression", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enabledExpression", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationEnabled", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationHasActivityExpression", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationInitialsExpression", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationColorExpression", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hasSemanticObjectOnNavigation", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "requiredExpression", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor29, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor30, _assertThisInitialized(_this));
      const oDataFieldConverted = MetaModelConverter.convertMetaModelContext(_this.dataField);
      let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.dataField, _this.entitySet);
      Field.setUpDataPointType(oDataFieldConverted);
      Field.setUpVisibleProperties(_assertThisInitialized(_this), oDataModelPath);
      if (_this._flexId) {
        _this._apiId = _this._flexId;
        _this._flexId = Field.getContentId(_this._flexId);
        _this._vhFlexId = `${_this._flexId}_${_this.vhIdPrefix}`;
      }
      const valueDataModelPath = FieldTemplating.getDataModelObjectPathForValue(oDataModelPath);
      oDataModelPath = valueDataModelPath || oDataModelPath;
      Field.setUpSemanticObjects(_assertThisInitialized(_this), oDataModelPath);
      _this.dataSourcePath = getTargetObjectPath(oDataModelPath);
      const oMetaModel = settings.models.metaModel || settings.models.entitySet;
      _this.entityType = oMetaModel.createBindingContext(`/${oDataModelPath.targetEntityType.fullyQualifiedName}`);
      Field.setUpEditableProperties(_assertThisInitialized(_this), oDataFieldConverted, oDataModelPath, oMetaModel);
      Field.setUpFormatOptions(_assertThisInitialized(_this), oDataModelPath, controlConfiguration, settings);
      Field.setUpDisplayStyle(_assertThisInitialized(_this), oDataFieldConverted, oDataModelPath);
      Field.setUpEditStyle(_assertThisInitialized(_this), oDataFieldConverted, oDataModelPath);

      // ---------------------------------------- compute bindings----------------------------------------------------
      const aDisplayStylesWithoutPropText = ["Avatar", "AmountWithCurrency"];
      if (_this.displayStyle && aDisplayStylesWithoutPropText.indexOf(_this.displayStyle) === -1 && oDataModelPath.targetObject) {
        _this.text = _this.text ?? FieldTemplating.getTextBinding(oDataModelPath, _this.formatOptions);
        Field.setUpObjectIdentifierTitleAndText(_assertThisInitialized(_this), oDataModelPath);
      } else {
        _this.text = "";
      }

      //TODO this is fixed twice
      // data point annotations need not have $Type defined, so add it if missing
      if (((_this$dataField$getOb = _this.dataField.getObject("@sapui.name")) === null || _this$dataField$getOb === void 0 ? void 0 : _this$dataField$getOb.indexOf("com.sap.vocabularies.UI.v1.DataPoint")) > -1) {
        const oDataPoint = _this.dataField.getObject();
        oDataPoint.$Type = oDataPoint.$Type || "com.sap.vocabularies.UI.v1.DataPointType";
        _this.dataField = new TemplateModel(oDataPoint, _this.dataField.getModel()).createBindingContext("/");
      }
      _this.emptyIndicatorMode = _this.formatOptions.showEmptyIndicator ? "On" : undefined;
      return _this;
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */
    _exports = Field;
    var _proto = Field.prototype;
    _proto.getTemplate = function getTemplate() {
      if (this.formatOptions.fieldMode === "nowrapper" && this.editMode === EditMode.Display) {
        return xml`<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />`;
      } else {
        let id;
        if (this._apiId) {
          id = this._apiId;
        } else if (this.idPrefix) {
          id = generate([this.idPrefix, "Field"]);
        } else {
          id = undefined;
        }
        if (this.onChange !== null && this.onChange !== "null") {
          return xml`
					<macroField:FieldAPI
						xmlns:macroField="sap.fe.macros.field"
						change="${this.onChange}"
						id="${id}"
						required="${this.requiredExpression}"
						editable="${this.editableExpression}"
						collaborationEnabled="${this.collaborationEnabled}"
						visible="${this.visible}"
					>
						<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />
					</macroField:FieldAPI>
				`;
        } else {
          return xml`<macroField:FieldAPI
						xmlns:macroField="sap.fe.macros.field"
						id="${id}"
						required="${this.requiredExpression}"
						editable="${this.editableExpression}"
						collaborationEnabled="${this.collaborationEnabled}"
						visible="${this.visible}"
					>
						<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />
					</macroField:FieldAPI>
					`;
        }
      }
    };
    return Field;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "dataSourcePath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "emptyIndicatorMode", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "_flexId", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "_apiId", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "noWrapperId", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "vhIdPrefix", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "_vhFlexId", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "entityType", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "navigateAfterAction", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "dataField", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "semanticObjects", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "editMode", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "wrap", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "class", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "textAlign", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "editableExpression", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "enabledExpression", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "collaborationEnabled", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "collaborationHasActivityExpression", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "collaborationInitialsExpression", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "collaborationColorExpression", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "hasSemanticObjectOnNavigation", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "requiredExpression", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec31], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  _exports = Field;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWVsZCIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiZGVzaWdudGltZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImNvbXB1dGVkIiwicmVxdWlyZWQiLCIka2luZCIsIiRUeXBlIiwidmFsaWRhdGUiLCJmb3JtYXRPcHRpb25zSW5wdXQiLCJ0ZXh0QWxpZ25Nb2RlIiwiaW5jbHVkZXMiLCJFcnJvciIsImRpc3BsYXlNb2RlIiwiZmllbGRNb2RlIiwibWVhc3VyZURpc3BsYXlNb2RlIiwidGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheSIsInNlbWFudGljS2V5U3R5bGUiLCJibG9ja0V2ZW50IiwiZ2V0T3ZlcnJpZGVzIiwibUNvbnRyb2xDb25maWd1cmF0aW9uIiwic0lEIiwib1Byb3BzIiwib0NvbnRyb2xDb25maWciLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInNDb25maWdLZXkiLCJnZXRPYmplY3RJZGVudGlmaWVyVGl0bGUiLCJmaWVsZEZvcm1hdE9wdGlvbnMiLCJvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoIiwicHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbiIsInBhdGhJbk1vZGVsIiwiZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCIsInRhcmdldERpc3BsYXlNb2RlIiwib1Byb3BlcnR5RGVmaW5pdGlvbiIsInRhcmdldE9iamVjdCIsIiR0YXJnZXQiLCJmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uIiwiY29tbW9uVGV4dCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsInVuZGVmaW5lZCIsInJlbGF0aXZlTG9jYXRpb24iLCJnZXRSZWxhdGl2ZVBhdGhzIiwicGFyYW1ldGVyc0ZvckZvcm1hdHRlciIsInB1c2giLCJ0YXJnZXRFbnRpdHlTZXQiLCJEcmFmdFJvb3QiLCJEcmFmdE5vZGUiLCJFbnRpdHkiLCJIYXNEcmFmdCIsIklzQWN0aXZlIiwiY29uc3RhbnQiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJVSSIsIlRleHRBcnJhbmdlbWVudCIsIlNlbWFudGljT2JqZWN0IiwiY29tcGlsZUV4cHJlc3Npb24iLCJmb3JtYXRSZXN1bHQiLCJ2YWx1ZUZvcm1hdHRlcnMiLCJmb3JtYXRPUFRpdGxlIiwiZ2V0T2JqZWN0SWRlbnRpZmllclRleHQiLCJmb3JtYXRUb0tlZXBXaGl0ZXNwYWNlIiwic2V0VXBEYXRhUG9pbnRUeXBlIiwib0RhdGFGaWVsZCIsInRlcm0iLCJzZXRVcFZpc2libGVQcm9wZXJ0aWVzIiwib0ZpZWxkUHJvcHMiLCJ2aXNpYmxlIiwiRmllbGRUZW1wbGF0aW5nIiwiZ2V0VmlzaWJsZUV4cHJlc3Npb24iLCJmb3JtYXRPcHRpb25zIiwiZGlzcGxheVZpc2libGUiLCJnZXRDb250ZW50SWQiLCJzTWFjcm9JZCIsInNldFVwU2VtYW50aWNPYmplY3RzIiwib0RhdGFNb2RlbFBhdGgiLCJhU2VtT2JqRXhwclRvUmVzb2x2ZSIsImdldFNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZSIsInNlbWFudGljT2JqZWN0Iiwia2V5Iiwic3Vic3RyIiwibGVuZ3RoIiwidmFsdWUiLCJzZW1hbnRpY09iamVjdHMiLCJnZXRTZW1hbnRpY09iamVjdHMiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsIm5hdlByb3BlcnR5IiwiaGFzU2VtYW50aWNPYmplY3RPbk5hdmlnYXRpb24iLCJzZXRVcEVkaXRhYmxlUHJvcGVydGllcyIsIm9NZXRhTW9kZWwiLCJvUHJvcGVydHlGb3JGaWVsZENvbnRyb2wiLCJWYWx1ZSIsImVkaXRNb2RlIiwiZWRpdE1vZGVBc09iamVjdCIsImJNZWFzdXJlUmVhZE9ubHkiLCJVSUZvcm1hdHRlcnMiLCJnZXRFZGl0TW9kZSIsImVkaXRhYmxlRXhwcmVzc2lvbiIsImdldEVkaXRhYmxlRXhwcmVzc2lvbkFzT2JqZWN0IiwiYVJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMiLCJDb21tb25VdGlscyIsImdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMiLCJlbnRpdHlTZXQiLCJnZXRQYXRoIiwicmVwbGFjZUFsbCIsImFSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zIiwiZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9ucyIsIm9SZXF1aXJlZFByb3BlcnRpZXMiLCJyZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zIiwicmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9ucyIsIk1vZGVsSGVscGVyIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJjb2xsYWJvcmF0aW9uRW5hYmxlZCIsImNvbGxhYm9yYXRpb25FeHByZXNzaW9uIiwiZ2V0Q29sbGFib3JhdGlvbkV4cHJlc3Npb24iLCJDb2xsYWJvcmF0aW9uRm9ybWF0dGVycyIsImhhc0NvbGxhYm9yYXRpb25BY3Rpdml0eSIsImNvbGxhYm9yYXRpb25IYXNBY3Rpdml0eUV4cHJlc3Npb24iLCJjb2xsYWJvcmF0aW9uSW5pdGlhbHNFeHByZXNzaW9uIiwiZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5SW5pdGlhbHMiLCJjb2xsYWJvcmF0aW9uQ29sb3JFeHByZXNzaW9uIiwiZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5Q29sb3IiLCJhbmQiLCJub3QiLCJpZkVsc2UiLCJlbmFibGVkRXhwcmVzc2lvbiIsImdldEVuYWJsZWRFeHByZXNzaW9uIiwicmVxdWlyZWRFeHByZXNzaW9uIiwiZ2V0UmVxdWlyZWRFeHByZXNzaW9uIiwic2V0VXBGb3JtYXRPcHRpb25zIiwib0NvbnRyb2xDb25maWd1cmF0aW9uIiwibVNldHRpbmdzIiwib092ZXJyaWRlUHJvcHMiLCJkYXRhRmllbGQiLCJnZXREaXNwbGF5TW9kZSIsInRleHRMaW5lc0VkaXQiLCJ0ZXh0TWF4TGluZXMiLCJtb2RlbHMiLCJ2aWV3RGF0YSIsImdldFByb3BlcnR5IiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsImlzUmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdEVuYWJsZWQiLCJoYXNFbnRpdHlUZXh0QXJyYW5nZW1lbnQiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiX2ZsZXhJZCIsIm5vV3JhcHBlcklkIiwiaWRQcmVmaXgiLCJnZW5lcmF0ZSIsInNldFVwRGlzcGxheVN0eWxlIiwib1Byb3BlcnR5IiwiZGlzcGxheVN0eWxlIiwiZmlsZVNyYyIsIklzSW1hZ2VVUkwiLCJhdmF0YXJWaXNpYmxlIiwiYXZhdGFyU3JjIiwiaGFzUXVpY2tWaWV3RmFjZXRzIiwiaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyIsIlRhcmdldCIsInNldFVwTmF2aWdhdGlvbkF2YWlsYWJsZSIsInRleHQiLCJnZXRUZXh0V2l0aFdoaXRlU3BhY2UiLCJpc1NlbWFudGljS2V5IiwiaGFzU2l0dWF0aW9uc0luZGljYXRvciIsIlNpdHVhdGlvbnNJbmRpY2F0b3IiLCJnZXRTaXR1YXRpb25zTmF2aWdhdGlvblByb3BlcnR5Iiwic2V0VXBPYmplY3RJZGVudGlmaWVyVGl0bGVBbmRUZXh0IiwiQ3JpdGljYWxpdHkiLCJNZWFzdXJlcyIsIklTT0N1cnJlbmN5IiwiU3RyaW5nIiwiaXNDdXJyZW5jeUFsaWduZWQiLCJ2YWx1ZUFzU3RyaW5nQmluZGluZ0V4cHJlc3Npb24iLCJnZXRWYWx1ZUJpbmRpbmciLCJ1bml0QmluZGluZ0V4cHJlc3Npb24iLCJnZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kiLCJDb21tdW5pY2F0aW9uIiwiSXNFbWFpbEFkZHJlc3MiLCJJc1Bob25lTnVtYmVyIiwiTXVsdGlMaW5lVGV4dCIsImhhc1NlbWFudGljT2JqZWN0SW5OYXZpZ2F0aW9uT3JQcm9wZXJ0eSIsIl9vUHJvcGVydHlDb21tb25Bbm5vdGF0aW9ucyIsIl9vUHJvcGVydHlOYXZpZ2F0aW9uUHJvcGVydHlBbm5vdGF0aW9ucyIsImluZGV4T2YiLCJpY29uVXJsIiwiSWNvblVybCIsImxpbmtVcmwiLCJVcmwiLCJzZXRVcEVkaXRTdHlsZSIsInNldEVkaXRTdHlsZVByb3BlcnRpZXMiLCJfb1Byb3BzIiwiaWRlbnRpZmllclRpdGxlIiwiaWRlbnRpZmllclRleHQiLCJnZXRUZXh0QmluZGluZyIsIl90eXBlIiwibmF2aWdhdGlvbkF2YWlsYWJsZSIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCJpZ25vcmVOYXZpZ2F0aW9uQXZhaWxhYmxlIiwicHJvcHMiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsInNldHRpbmdzIiwib0RhdGFGaWVsZENvbnZlcnRlZCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiX2FwaUlkIiwiX3ZoRmxleElkIiwidmhJZFByZWZpeCIsInZhbHVlRGF0YU1vZGVsUGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGhGb3JWYWx1ZSIsImRhdGFTb3VyY2VQYXRoIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsIm1ldGFNb2RlbCIsImVudGl0eVR5cGUiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImFEaXNwbGF5U3R5bGVzV2l0aG91dFByb3BUZXh0IiwiZ2V0T2JqZWN0Iiwib0RhdGFQb2ludCIsIlRlbXBsYXRlTW9kZWwiLCJnZXRNb2RlbCIsImVtcHR5SW5kaWNhdG9yTW9kZSIsInNob3dFbXB0eUluZGljYXRvciIsImdldFRlbXBsYXRlIiwiRWRpdE1vZGUiLCJEaXNwbGF5IiwieG1sIiwiaWQiLCJvbkNoYW5nZSIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJJbnRlcm5hbEZpZWxkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5U2V0LCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBTZW1hbnRpY09iamVjdCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFQb2ludFR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBibG9ja0V2ZW50LCBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0ICogYXMgQ29sbGFib3JhdGlvbkZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvQ29sbGFib3JhdGlvbkZvcm1hdHRlclwiO1xuaW1wb3J0IHZhbHVlRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9WYWx1ZUZvcm1hdHRlclwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7XG5cdGFuZCxcblx0Y29tcGlsZUV4cHJlc3Npb24sXG5cdGNvbnN0YW50LFxuXHRmb3JtYXRSZXN1bHQsXG5cdGZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24sXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRub3QsXG5cdHBhdGhJbk1vZGVsXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiwgU3RyaWN0UHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoLCBnZXRSZWxhdGl2ZVBhdGhzLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgaXNTZW1hbnRpY0tleSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERpc3BsYXlNb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgKiBhcyBVSUZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgdHlwZSB7IFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YSB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0ICogYXMgRmllbGRUZW1wbGF0aW5nIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0IFNpdHVhdGlvbnNJbmRpY2F0b3IgZnJvbSBcInNhcC9mZS9tYWNyb3Mvc2l0dWF0aW9ucy9TaXR1YXRpb25zSW5kaWNhdG9yLmZyYWdtZW50XCI7XG5pbXBvcnQgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxudHlwZSBEaXNwbGF5U3R5bGUgPVxuXHR8IFwiVGV4dFwiXG5cdHwgXCJBdmF0YXJcIlxuXHR8IFwiRmlsZVwiXG5cdHwgXCJEYXRhUG9pbnRcIlxuXHR8IFwiQ29udGFjdFwiXG5cdHwgXCJCdXR0b25cIlxuXHR8IFwiTGlua1wiXG5cdHwgXCJPYmplY3RTdGF0dXNcIlxuXHR8IFwiQW1vdW50V2l0aEN1cnJlbmN5XCJcblx0fCBcIlNlbWFudGljS2V5V2l0aERyYWZ0SW5kaWNhdG9yXCJcblx0fCBcIk9iamVjdElkZW50aWZpZXJcIlxuXHR8IFwiTGFiZWxTZW1hbnRpY0tleVwiXG5cdHwgXCJMaW5rV2l0aFF1aWNrVmlld1wiXG5cdHwgXCJMaW5rV3JhcHBlclwiXG5cdHwgXCJFeHBhbmRhYmxlVGV4dFwiO1xuXG50eXBlIEVkaXRTdHlsZSA9XG5cdHwgXCJJbnB1dFdpdGhWYWx1ZUhlbHBcIlxuXHR8IFwiVGV4dEFyZWFcIlxuXHR8IFwiRmlsZVwiXG5cdHwgXCJEYXRlUGlja2VyXCJcblx0fCBcIlRpbWVQaWNrZXJcIlxuXHR8IFwiRGF0ZVRpbWVQaWNrZXJcIlxuXHR8IFwiQ2hlY2tCb3hcIlxuXHR8IFwiSW5wdXRXaXRoVW5pdFwiXG5cdHwgXCJJbnB1dFwiXG5cdHwgXCJSYXRpbmdJbmRpY2F0b3JcIjtcblxudHlwZSBGaWVsZEZvcm1hdE9wdGlvbnMgPSBQYXJ0aWFsPHtcblx0LyoqIGV4cHJlc3Npb24gZm9yIE9iamVjdFN0YXR1cyB2aXNpYmxlIHByb3BlcnR5ICovXG5cdGNvbnRhaW5zRXJyb3JWaXNpYmlsaXR5OiBzdHJpbmc7XG5cdGRpc3BsYXlNb2RlOiBEaXNwbGF5TW9kZTtcblx0ZmllbGRNb2RlOiBzdHJpbmc7XG5cdGhhc0RyYWZ0SW5kaWNhdG9yOiBib29sZWFuO1xuXHRpc0FuYWx5dGljczogYm9vbGVhbjtcblx0LyoqIElmIHRydWUgdGhlbiBuYXZpZ2F0aW9uYXZhaWxhYmxlIHByb3BlcnR5IHdpbGwgbm90IGJlIHVzZWQgZm9yIGVuYWJsZW1lbnQgb2YgSUJOIGJ1dHRvbiAqL1xuXHRpZ25vcmVOYXZpZ2F0aW9uQXZhaWxhYmxlOiBib29sZWFuO1xuXHRpc0N1cnJlbmN5QWxpZ25lZDogYm9vbGVhbjtcblx0bWVhc3VyZURpc3BsYXlNb2RlOiBzdHJpbmc7XG5cdC8qKiBFbmFibGVzIHRoZSBmYWxsYmFjayBmZWF0dXJlIGZvciB1c2FnZSB0aGUgdGV4dCBhbm5vdGF0aW9uIGZyb20gdGhlIHZhbHVlIGxpc3RzICovXG5cdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q6IGJvb2xlYW47XG5cdHNlbWFudGlja2V5czogc3RyaW5nW107XG5cdC8qKiBQcmVmZXJyZWQgY29udHJvbCB0byB2aXN1YWxpemUgc2VtYW50aWMga2V5IHByb3BlcnRpZXMgKi9cblx0c2VtYW50aWNLZXlTdHlsZTogc3RyaW5nO1xuXHQvKiogSWYgc2V0IHRvICd0cnVlJywgU0FQIEZpb3JpIGVsZW1lbnRzIHNob3dzIGFuIGVtcHR5IGluZGljYXRvciBpbiBkaXNwbGF5IG1vZGUgZm9yIHRoZSB0ZXh0IGFuZCBsaW5rcyAqL1xuXHRzaG93RW1wdHlJbmRpY2F0b3I6IGJvb2xlYW47XG5cdC8qKiBJZiB0cnVlIHRoZW4gc2V0cyB0aGUgZ2l2ZW4gaWNvbiBpbnN0ZWFkIG9mIHRleHQgaW4gQWN0aW9uL0lCTiBCdXR0b24gKi9cblx0c2hvd0ljb25Vcmw6IGJvb2xlYW47XG5cdC8qKiBEZXNjcmliZSBob3cgdGhlIGFsaWdubWVudCB3b3JrcyBiZXR3ZWVuIFRhYmxlIG1vZGUgKERhdGUgYW5kIE51bWVyaWMgRW5kIGFsaWdubWVudCkgYW5kIEZvcm0gbW9kZSAobnVtZXJpYyBhbGlnbmVkIEVuZCBpbiBlZGl0IGFuZCBCZWdpbiBpbiBkaXNwbGF5KSAqL1xuXHR0ZXh0QWxpZ25Nb2RlOiBzdHJpbmc7XG5cdC8qKiBNYXhpbXVtIG51bWJlciBvZiBsaW5lcyBmb3IgbXVsdGlsaW5lIHRleHRzIGluIGVkaXQgbW9kZSAqL1xuXHR0ZXh0TGluZXNFZGl0OiBzdHJpbmc7XG5cdC8qKiBNYXhpbXVtIG51bWJlciBvZiBsaW5lcyB0aGF0IG11bHRpbGluZSB0ZXh0cyBpbiBlZGl0IG1vZGUgY2FuIGdyb3cgdG8gKi9cblx0dGV4dE1heExpbmVzOiBzdHJpbmc7XG5cdGNvbXBhY3RTZW1hbnRpY0tleTogc3RyaW5nO1xuXHRmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0ZmllbGRHcm91cE5hbWU6IHN0cmluZztcblx0dGV4dE1heExlbmd0aDogbnVtYmVyO1xuXHQvKiogTWF4aW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHRleHQgZmllbGQgdGhhdCBhcmUgc2hvd24gaW5pdGlhbGx5LiAqL1xuXHR0ZXh0TWF4Q2hhcmFjdGVyc0Rpc3BsYXk6IG51bWJlcjtcblx0LyoqIERlZmluZXMgaG93IHRoZSBmdWxsIHRleHQgd2lsbCBiZSBkaXNwbGF5ZWQgLSBJblBsYWNlIG9yIFBvcG92ZXIgKi9cblx0dGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheTogc3RyaW5nO1xuXHRkYXRlRm9ybWF0T3B0aW9ucz86IFVJRm9ybWF0dGVycy5kYXRlRm9ybWF0T3B0aW9uczsgLy8gc2hvd1RpbWUgaGVyZSBpcyB1c2VkIGZvciB0ZXh0IGZvcm1hdHRpbmcgb25seVxufT47XG5cbmV4cG9ydCB0eXBlIEZpZWxkUHJvcGVydGllcyA9IFN0cmljdFByb3BlcnRpZXNPZjxGaWVsZD47XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmllbGQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogVXN1YWxseSwgYSBEYXRhRmllbGQgYW5ub3RhdGlvbiBpcyBleHBlY3RlZFxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogPGludGVybmFsTWFjcm86RmllbGRcbiAqICAgaWRQcmVmaXg9XCJTb21lUHJlZml4XCJcbiAqICAgY29udGV4dFBhdGg9XCJ7ZW50aXR5U2V0Pn1cIlxuICogICBtZXRhUGF0aD1cIntkYXRhRmllbGQ+fVwiXG4gKiAvPlxuICogPC9wcmU+XG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqIEBzaW5jZSAxLjk0LjBcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkZpZWxkXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdGRlc2lnbnRpbWU6IFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9GaWVsZC5kZXNpZ250aW1lXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWVsZCBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBkYXRhU291cmNlUGF0aD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIGVtcHR5SW5kaWNhdG9yTW9kZT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIF9mbGV4SWQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBpZFByZWZpeD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIF9hcGlJZD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIG5vV3JhcHBlcklkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiRmllbGRWYWx1ZUhlbHBcIlxuXHR9KVxuXHRwdWJsaWMgdmhJZFByZWZpeCE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0Y29tcHV0ZWQ6IHRydWVcblx0fSlcblx0cHVibGljIF92aEZsZXhJZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgZW50aXR5IHNldFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0JGtpbmQ6IFtcIkVudGl0eVNldFwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIl1cblx0fSlcblx0cHVibGljIGVudGl0eVNldCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGVudGl0eSBzZXRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiBmYWxzZSxcblx0XHRjb21wdXRlZDogdHJ1ZSxcblx0XHQka2luZDogW1wiRW50aXR5VHlwZVwiXVxuXHR9KVxuXHRwdWJsaWMgZW50aXR5VHlwZSE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIEZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIGFjdGlvbiB3aWxsIG5hdmlnYXRlIGFmdGVyIGV4ZWN1dGlvblxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0fSlcblx0cHVibGljIG5hdmlnYXRlQWZ0ZXJBY3Rpb24hOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBkYXRhRmllbGQuXG5cdCAqIFRoaXMgcHJvcGVydHkgaXMgdXN1YWxseSBhIG1ldGFkYXRhQ29udGV4dCBwb2ludGluZyB0byBhIERhdGFGaWVsZCBoYXZpbmdcblx0ICogJFR5cGUgb2YgRGF0YUZpZWxkLCBEYXRhRmllbGRXaXRoVXJsLCBEYXRhRmllbGRGb3JBbm5vdGF0aW9uLCBEYXRhRmllbGRGb3JBY3Rpb24sIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiwgRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoLCBvciBEYXRhUG9pbnRUeXBlLlxuXHQgKiBCdXQgaXQgY2FuIGFsc28gYmUgYSBQcm9wZXJ0eSB3aXRoICRraW5kPVwiUHJvcGVydHlcIlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0JGtpbmQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdCRUeXBlOiBbXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoQWN0aW9uXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFR5cGVcIlxuXHRcdF1cblx0fSlcblx0cHVibGljIGRhdGFGaWVsZCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIENvbnRleHQgcG9pbnRpbmcgdG8gYW4gYXJyYXkgb2YgdGhlIHByb3BlcnR5J3Mgc2VtYW50aWMgb2JqZWN0c1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IGZhbHNlLFxuXHRcdGNvbXB1dGVkOiB0cnVlXG5cdH0pXG5cdHB1YmxpYyBzZW1hbnRpY09iamVjdHMhOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBFZGl0IE1vZGUgb2YgdGhlIGZpZWxkLlxuXHQgKlxuXHQgKiBJZiB0aGUgZWRpdE1vZGUgaXMgdW5kZWZpbmVkIHRoZW4gd2UgY29tcHV0ZSBpdCBiYXNlZCBvbiB0aGUgbWV0YWRhdGFcblx0ICogT3RoZXJ3aXNlIHdlIHVzZSB0aGUgdmFsdWUgcHJvdmlkZWQgaGVyZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubWRjLmVudW0uRWRpdE1vZGVcIlxuXHR9KVxuXHRwdWJsaWMgZWRpdE1vZGU/OiBFZGl0TW9kZSB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdC8qKlxuXHQgKiBXcmFwIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHB1YmxpYyB3cmFwPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ1NTIGNsYXNzIGZvciBtYXJnaW5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgY2xhc3M/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IGFkZGVkIHRvIGFzc29jaWF0ZSB0aGUgbGFiZWwgd2l0aCB0aGUgRmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgYXJpYUxhYmVsbGVkQnk/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5jb3JlLlRleHRBbGlnblwiXG5cdH0pXG5cdHB1YmxpYyB0ZXh0QWxpZ24/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGNvbXB1dGVkOiB0cnVlXG5cdH0pXG5cdHB1YmxpYyBlZGl0YWJsZUV4cHJlc3Npb24hOiBzdHJpbmcgfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0Y29tcHV0ZWQ6IHRydWVcblx0fSlcblx0cHVibGljIGVuYWJsZWRFeHByZXNzaW9uITogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRjb21wdXRlZDogdHJ1ZVxuXHR9KVxuXHRwdWJsaWMgY29sbGFib3JhdGlvbkVuYWJsZWQhOiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRjb21wdXRlZDogdHJ1ZVxuXHR9KVxuXHRwdWJsaWMgY29sbGFib3JhdGlvbkhhc0FjdGl2aXR5RXhwcmVzc2lvbiE6IHN0cmluZyB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRjb21wdXRlZDogdHJ1ZVxuXHR9KVxuXHRwdWJsaWMgY29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbiE6IHN0cmluZyB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRjb21wdXRlZDogdHJ1ZVxuXHR9KVxuXHRwdWJsaWMgY29sbGFib3JhdGlvbkNvbG9yRXhwcmVzc2lvbiE6IHN0cmluZyB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdC8qKlxuXHQgKiBPcHRpb24gdG8gYWRkIGEgc2VtYW50aWMgb2JqZWN0IHRvIGEgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRyZXF1aXJlZDogZmFsc2Vcblx0fSlcblx0cHVibGljIHNlbWFudGljT2JqZWN0Pzogc3RyaW5nIHwgU2VtYW50aWNPYmplY3Q7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRyZXF1aXJlZDogZmFsc2Vcblx0fSlcblx0cHVibGljIGhhc1NlbWFudGljT2JqZWN0T25OYXZpZ2F0aW9uPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIHJlcXVpcmVkRXhwcmVzc2lvbj86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHB1YmxpYyB2aXNpYmxlPzogYm9vbGVhbiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJvYmplY3RcIixcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKGZvcm1hdE9wdGlvbnNJbnB1dDogRmllbGRGb3JtYXRPcHRpb25zKSB7XG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0LnRleHRBbGlnbk1vZGUgJiYgIVtcIlRhYmxlXCIsIFwiRm9ybVwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQudGV4dEFsaWduTW9kZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LnRleHRBbGlnbk1vZGV9IGZvciB0ZXh0QWxpZ25Nb2RlIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChcblx0XHRcdFx0Zm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlICYmXG5cdFx0XHRcdCFbXCJWYWx1ZVwiLCBcIkRlc2NyaXB0aW9uXCIsIFwiVmFsdWVEZXNjcmlwdGlvblwiLCBcIkRlc2NyaXB0aW9uVmFsdWVcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5kaXNwbGF5TW9kZX0gZm9yIGRpc3BsYXlNb2RlIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChmb3JtYXRPcHRpb25zSW5wdXQuZmllbGRNb2RlICYmICFbXCJub3dyYXBwZXJcIiwgXCJcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0LmZpZWxkTW9kZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LmZpZWxkTW9kZX0gZm9yIGZpZWxkTW9kZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0Lm1lYXN1cmVEaXNwbGF5TW9kZSAmJiAhW1wiSGlkZGVuXCIsIFwiUmVhZE9ubHlcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0Lm1lYXN1cmVEaXNwbGF5TW9kZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0Lm1lYXN1cmVEaXNwbGF5TW9kZX0gZm9yIG1lYXN1cmVEaXNwbGF5TW9kZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnNJbnB1dC50ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5ICYmXG5cdFx0XHRcdCFbXCJJblBsYWNlXCIsIFwiUG9wb3ZlclwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQudGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheSlcblx0XHRcdCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0YEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQudGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheX0gZm9yIHRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXkgZG9lcyBub3QgbWF0Y2hgXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChmb3JtYXRPcHRpb25zSW5wdXQuc2VtYW50aWNLZXlTdHlsZSAmJiAhW1wiT2JqZWN0SWRlbnRpZmllclwiLCBcIkxhYmVsXCIsIFwiXCJdLmluY2x1ZGVzKGZvcm1hdE9wdGlvbnNJbnB1dC5zZW1hbnRpY0tleVN0eWxlKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQuc2VtYW50aWNLZXlTdHlsZX0gZm9yIHNlbWFudGljS2V5U3R5bGUgZG9lcyBub3QgbWF0Y2hgKTtcblx0XHRcdH1cblxuXHRcdFx0Lypcblx0XHRcdEhpc3RvcmljYWwgZGVmYXVsdCB2YWx1ZXMgYXJlIGN1cnJlbnRseSBkaXNhYmxlZFxuXHRcdFx0aWYgKCFmb3JtYXRPcHRpb25zSW5wdXQuc2VtYW50aWNLZXlTdHlsZSkge1xuXHRcdFx0XHRmb3JtYXRPcHRpb25zSW5wdXQuc2VtYW50aWNLZXlTdHlsZSA9IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHQqL1xuXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9uc0lucHV0O1xuXHRcdH1cblx0fSlcblx0cHVibGljIGZvcm1hdE9wdGlvbnM6IEZpZWxkRm9ybWF0T3B0aW9ucyA9IHt9O1xuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIGZvciBjaGFuZ2UgZXZlbnRcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0b25DaGFuZ2U6IHN0cmluZyA9IFwiXCI7XG5cblx0Ly8gQ29tcHV0ZWQgcHJvcGVydGllc1xuXHRkZXNjcmlwdGlvbkJpbmRpbmdFeHByZXNzaW9uPzogc3RyaW5nO1xuXG5cdGRpc3BsYXlWaXNpYmxlPzogc3RyaW5nIHwgYm9vbGVhbjtcblxuXHRlZGl0TW9kZUFzT2JqZWN0PzogYW55O1xuXG5cdGVkaXRTdHlsZT86IEVkaXRTdHlsZSB8IG51bGw7XG5cblx0aGFzUXVpY2tWaWV3RmFjZXRzPzogYm9vbGVhbjtcblxuXHRuYXZpZ2F0aW9uQXZhaWxhYmxlPzogYm9vbGVhbiB8IHN0cmluZztcblxuXHRzaG93VGltZXpvbmU/OiBib29sZWFuO1xuXG5cdHRleHQ/OiBzdHJpbmcgfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGlkZW50aWZpZXJUaXRsZT86IHN0cmluZyB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0aWRlbnRpZmllclRleHQ/OiBzdHJpbmcgfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdHRleHRCaW5kaW5nRXhwcmVzc2lvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdHVuaXRCaW5kaW5nRXhwcmVzc2lvbj86IHN0cmluZztcblxuXHR1bml0RWRpdGFibGU/OiBzdHJpbmc7XG5cblx0dmFsdWVCaW5kaW5nRXhwcmVzc2lvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdHZhbHVlQXNTdHJpbmdCaW5kaW5nRXhwcmVzc2lvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGxpbmtVcmw/OiBzdHJpbmcgfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRpY29uVXJsPzogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZGlzcGxheVN0eWxlPzogRGlzcGxheVN0eWxlIHwgbnVsbDtcblxuXHRoYXNTaXR1YXRpb25zSW5kaWNhdG9yPzogYm9vbGVhbjtcblxuXHRhdmF0YXJWaXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0YXZhdGFyU3JjPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGZpbGVTcmM/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRzdGF0aWMgZ2V0T3ZlcnJpZGVzKG1Db250cm9sQ29uZmlndXJhdGlvbjogYW55LCBzSUQ6IHN0cmluZykge1xuXHRcdGNvbnN0IG9Qcm9wczogeyBbaW5kZXg6IHN0cmluZ106IGFueSB9ID0ge307XG5cdFx0aWYgKG1Db250cm9sQ29uZmlndXJhdGlvbikge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xDb25maWcgPSBtQ29udHJvbENvbmZpZ3VyYXRpb25bc0lEXTtcblx0XHRcdGlmIChvQ29udHJvbENvbmZpZykge1xuXHRcdFx0XHRPYmplY3Qua2V5cyhvQ29udHJvbENvbmZpZykuZm9yRWFjaChmdW5jdGlvbiAoc0NvbmZpZ0tleSkge1xuXHRcdFx0XHRcdG9Qcm9wc1tzQ29uZmlnS2V5XSA9IG9Db250cm9sQ29uZmlnW3NDb25maWdLZXldO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9Qcm9wcztcblx0fVxuXG5cdHN0YXRpYyBnZXRPYmplY3RJZGVudGlmaWVyVGl0bGUoXG5cdFx0ZmllbGRGb3JtYXRPcHRpb25zOiBGaWVsZEZvcm1hdE9wdGlvbnMsXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQpOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0XHRsZXQgcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4gPSBwYXRoSW5Nb2RlbChcblx0XHRcdGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aClcblx0XHQpO1xuXHRcdGxldCB0YXJnZXREaXNwbGF5TW9kZSA9IGZpZWxkRm9ybWF0T3B0aW9ucz8uZGlzcGxheU1vZGU7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5RGVmaW5pdGlvbiA9XG5cdFx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC50eXBlID09PSBcIlByb3BlcnR5UGF0aFwiXG5cdFx0XHRcdD8gKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LiR0YXJnZXQgYXMgUHJvcGVydHkpXG5cdFx0XHRcdDogKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5KTtcblx0XHRwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uID0gZm9ybWF0V2l0aFR5cGVJbmZvcm1hdGlvbihvUHJvcGVydHlEZWZpbml0aW9uLCBwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uKTtcblxuXHRcdGNvbnN0IGNvbW1vblRleHQgPSBvUHJvcGVydHlEZWZpbml0aW9uLmFubm90YXRpb25zPy5Db21tb24/LlRleHQ7XG5cdFx0aWYgKGNvbW1vblRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gdGhlcmUgaXMgbm8gcHJvcGVydHkgZm9yIGRlc2NyaXB0aW9uXG5cdFx0XHR0YXJnZXREaXNwbGF5TW9kZSA9IFwiVmFsdWVcIjtcblx0XHR9XG5cdFx0Y29uc3QgcmVsYXRpdmVMb2NhdGlvbiA9IGdldFJlbGF0aXZlUGF0aHMob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cblx0XHRjb25zdCBwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyID0gW107XG5cblx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2gocGF0aEluTW9kZWwoXCJUX05FV19PQkpFQ1RcIiwgXCJzYXAuZmUuaTE4blwiKSk7XG5cdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKHBhdGhJbk1vZGVsKFwiVF9BTk5PVEFUSU9OX0hFTFBFUl9ERUZBVUxUX09CSkVDVF9QQUdFX0hFQURFUl9USVRMRV9OT19IRUFERVJfSU5GT1wiLCBcInNhcC5mZS5pMThuXCIpKTtcblxuXHRcdGlmIChcblx0XHRcdCEhKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Um9vdCB8fFxuXHRcdFx0ISEob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnROb2RlXG5cdFx0KSB7XG5cdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goRW50aXR5Lkhhc0RyYWZ0KTtcblx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChFbnRpdHkuSXNBY3RpdmUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goY29uc3RhbnQobnVsbCkpO1xuXHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKGNvbnN0YW50KG51bGwpKTtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKHRhcmdldERpc3BsYXlNb2RlKSB7XG5cdFx0XHRjYXNlIFwiVmFsdWVcIjpcblx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24pO1xuXHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goY29uc3RhbnQobnVsbCkpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGNvbW1vblRleHQsIHJlbGF0aXZlTG9jYXRpb24pIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+KTtcblx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKGNvbnN0YW50KG51bGwpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiVmFsdWVEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2gocHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbik7XG5cdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oY29tbW9uVGV4dCwgcmVsYXRpdmVMb2NhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmIChjb21tb25UZXh0Py5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudCkge1xuXHRcdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChcblx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjb21tb25UZXh0LCByZWxhdGl2ZUxvY2F0aW9uKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGlmIERlc2NyaXB0aW9uVmFsdWUgaXMgc2V0IGJ5IGRlZmF1bHQgYW5kIG5vdCBieSBUZXh0QXJyYW5nZW1lbnRcblx0XHRcdFx0XHQvLyB3ZSBzaG93IGRlc2NyaXB0aW9uIGluIE9iamVjdElkZW50aWZpZXIgVGl0bGUgYW5kIHZhbHVlIGluIE9iamVjdElkZW50aWZpZXIgVGV4dFxuXHRcdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChcblx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjb21tb25UZXh0LCByZWxhdGl2ZUxvY2F0aW9uKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Ly8gaWYgRGVzY3JpcHRpb25WYWx1ZSBpcyBzZXQgYnkgZGVmYXVsdCBhbmQgcHJvcGVydHkgaGFzIGEgc2VtYW50aWMgb2JqZWN0XG5cdFx0XHRcdFx0Ly8gd2Ugc2hvdyBkZXNjcmlwdGlvbiBhbmQgdmFsdWUgaW4gT2JqZWN0SWRlbnRpZmllciBUaXRsZVxuXHRcdFx0XHRcdGlmIChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKGNvbnN0YW50KG51bGwpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihmb3JtYXRSZXN1bHQocGFyYW1ldGVyc0ZvckZvcm1hdHRlciBhcyBhbnksIHZhbHVlRm9ybWF0dGVycy5mb3JtYXRPUFRpdGxlKSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0T2JqZWN0SWRlbnRpZmllclRleHQoXG5cdFx0ZmllbGRGb3JtYXRPcHRpb25zOiBGaWVsZEZvcm1hdE9wdGlvbnMsXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQpOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0XHRsZXQgcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4gPSBwYXRoSW5Nb2RlbChcblx0XHRcdGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aClcblx0XHQpO1xuXHRcdGNvbnN0IHRhcmdldERpc3BsYXlNb2RlID0gZmllbGRGb3JtYXRPcHRpb25zPy5kaXNwbGF5TW9kZTtcblx0XHRjb25zdCBvUHJvcGVydHlEZWZpbml0aW9uID1cblx0XHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnR5cGUgPT09IFwiUHJvcGVydHlQYXRoXCJcblx0XHRcdFx0PyAob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJHRhcmdldCBhcyBQcm9wZXJ0eSlcblx0XHRcdFx0OiAob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHkpO1xuXG5cdFx0Y29uc3QgY29tbW9uVGV4dCA9IG9Qcm9wZXJ0eURlZmluaXRpb24uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dDtcblx0XHRpZiAoY29tbW9uVGV4dCA9PT0gdW5kZWZpbmVkIHx8IGNvbW1vblRleHQ/LmFubm90YXRpb25zPy5VST8uVGV4dEFycmFuZ2VtZW50KSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uID0gZm9ybWF0V2l0aFR5cGVJbmZvcm1hdGlvbihvUHJvcGVydHlEZWZpbml0aW9uLCBwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uKTtcblxuXHRcdHN3aXRjaCAodGFyZ2V0RGlzcGxheU1vZGUpIHtcblx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdGNvbnN0IHJlbGF0aXZlTG9jYXRpb24gPSBnZXRSZWxhdGl2ZVBhdGhzKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHRcdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGNvbW1vblRleHQsIHJlbGF0aXZlTG9jYXRpb24pIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+KTtcblx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblZhbHVlXCI6XG5cdFx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihmb3JtYXRSZXN1bHQoW3Byb3BlcnR5QmluZGluZ0V4cHJlc3Npb25dLCB2YWx1ZUZvcm1hdHRlcnMuZm9ybWF0VG9LZWVwV2hpdGVzcGFjZSkpO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgc2V0VXBEYXRhUG9pbnRUeXBlKG9EYXRhRmllbGQ6IGFueSkge1xuXHRcdC8vIGRhdGEgcG9pbnQgYW5ub3RhdGlvbnMgbmVlZCBub3QgaGF2ZSAkVHlwZSBkZWZpbmVkLCBzbyBhZGQgaXQgaWYgbWlzc2luZ1xuXHRcdGlmIChvRGF0YUZpZWxkPy50ZXJtID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiKSB7XG5cdFx0XHRvRGF0YUZpZWxkLiRUeXBlID0gb0RhdGFGaWVsZC4kVHlwZSB8fCBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBzZXRVcFZpc2libGVQcm9wZXJ0aWVzKG9GaWVsZFByb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHQvLyB3ZSBkbyB0aGlzIGJlZm9yZSBlbmhhbmNpbmcgdGhlIGRhdGFNb2RlbFBhdGggc28gdGhhdCBpdCBzdGlsbCBwb2ludHMgYXQgdGhlIERhdGFGaWVsZFxuXHRcdG9GaWVsZFByb3BzLnZpc2libGUgPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VmlzaWJsZUV4cHJlc3Npb24ob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCwgb0ZpZWxkUHJvcHMuZm9ybWF0T3B0aW9ucyk7XG5cdFx0b0ZpZWxkUHJvcHMuZGlzcGxheVZpc2libGUgPSBvRmllbGRQcm9wcy5mb3JtYXRPcHRpb25zLmZpZWxkTW9kZSA9PT0gXCJub3dyYXBwZXJcIiA/IG9GaWVsZFByb3BzLnZpc2libGUgOiB1bmRlZmluZWQ7XG5cdH1cblxuXHRzdGF0aWMgZ2V0Q29udGVudElkKHNNYWNyb0lkOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gYCR7c01hY3JvSWR9LWNvbnRlbnRgO1xuXHR9XG5cblx0c3RhdGljIHNldFVwU2VtYW50aWNPYmplY3RzKG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IHZvaWQge1xuXHRcdGxldCBhU2VtT2JqRXhwclRvUmVzb2x2ZTogU2VtYW50aWNPYmplY3RDdXN0b21EYXRhW10gPSBbXTtcblx0XHRhU2VtT2JqRXhwclRvUmVzb2x2ZSA9IEZpZWxkVGVtcGxhdGluZy5nZXRTZW1hbnRpY09iamVjdEV4cHJlc3Npb25Ub1Jlc29sdmUob0RhdGFNb2RlbFBhdGg/LnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LkNvbW1vbik7XG5cblx0XHQvKipcblx0XHQgKiBJZiB0aGUgZmllbGQgYnVpbGRpbmcgYmxvY2sgaGFzIGEgYmluZGluZyBleHByZXNzaW9uIGluIHRoZSBjdXN0b20gc2VtYW50aWMgb2JqZWN0cyxcblx0XHQgKiBpdCBpcyB0aGVuIHVzZWQgYnkgdGhlIFF1aWNrVmlldyBGb3JtIEJCLlxuXHRcdCAqIFRoaXMgaXMgbmVlZGVkIHRvIHJlc29sdmUgdGhlIGxpbmsgYXQgcnVudGltZS4gVGhlIFF1aWNrVmlld0RlbGVnYXRlLmpzIHRoZW4gZ2V0cyB0aGUgcmVzb2x2ZWRcblx0XHQgKiBiaW5kaW5nIGV4cHJlc3Npb24gZnJvbSB0aGUgY3VzdG9tIGRhdGEuXG5cdFx0ICogQWxsIG90aGVyIHNlbWFudGljT2JqZWN0cyBhcmUgcHJvY2Vzc2VkIGluIHRoZSBRdWlja1ZpZXcgYnVpbGRpbmcgYmxvY2suXG5cdFx0ICovXG5cdFx0aWYgKCEhb1Byb3BzLnNlbWFudGljT2JqZWN0ICYmIHR5cGVvZiBvUHJvcHMuc2VtYW50aWNPYmplY3QgPT09IFwic3RyaW5nXCIgJiYgb1Byb3BzLnNlbWFudGljT2JqZWN0WzBdID09PSBcIntcIikge1xuXHRcdFx0YVNlbU9iakV4cHJUb1Jlc29sdmUucHVzaCh7XG5cdFx0XHRcdGtleTogb1Byb3BzLnNlbWFudGljT2JqZWN0LnN1YnN0cigxLCBvUHJvcHMuc2VtYW50aWNPYmplY3QubGVuZ3RoIC0gMiksXG5cdFx0XHRcdHZhbHVlOiBvUHJvcHMuc2VtYW50aWNPYmplY3Rcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRvUHJvcHMuc2VtYW50aWNPYmplY3RzID0gRmllbGRUZW1wbGF0aW5nLmdldFNlbWFudGljT2JqZWN0cyhhU2VtT2JqRXhwclRvUmVzb2x2ZSk7XG5cdFx0Ly8gVGhpcyBzZXRzIHVwIHRoZSBzZW1hbnRpYyBsaW5rcyBmb3VuZCBpbiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSwgaWYgdGhlcmUgaXMgbm8gc2VtYW50aWMgbGlua3MgZGVmaW5lIGJlZm9yZS5cblx0XHRpZiAoIW9Qcm9wcy5zZW1hbnRpY09iamVjdCAmJiBvRGF0YU1vZGVsUGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRvRGF0YU1vZGVsUGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChuYXZQcm9wZXJ0eSkge1xuXHRcdFx0XHRpZiAobmF2UHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRcdFx0b1Byb3BzLnNlbWFudGljT2JqZWN0ID0gbmF2UHJvcGVydHkuYW5ub3RhdGlvbnMuQ29tbW9uLlNlbWFudGljT2JqZWN0O1xuXHRcdFx0XHRcdG9Qcm9wcy5oYXNTZW1hbnRpY09iamVjdE9uTmF2aWdhdGlvbiA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBzZXRVcEVkaXRhYmxlUHJvcGVydGllcyhvUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb0RhdGFGaWVsZDogYW55LCBvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgb01ldGFNb2RlbDogYW55KTogdm9pZCB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5Rm9yRmllbGRDb250cm9sID0gb0RhdGFNb2RlbFBhdGg/LnRhcmdldE9iamVjdD8uVmFsdWVcblx0XHRcdD8gb0RhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlXG5cdFx0XHQ6IG9EYXRhTW9kZWxQYXRoPy50YXJnZXRPYmplY3Q7XG5cdFx0aWYgKG9Qcm9wcy5lZGl0TW9kZSAhPT0gdW5kZWZpbmVkICYmIG9Qcm9wcy5lZGl0TW9kZSAhPT0gbnVsbCkge1xuXHRcdFx0Ly8gRXZlbiBpZiBpdCBwcm92aWRlZCBhcyBhIHN0cmluZyBpdCdzIGEgdmFsaWQgcGFydCBvZiBhIGJpbmRpbmcgZXhwcmVzc2lvbiB0aGF0IGNhbiBiZSBsYXRlciBjb21iaW5lZCBpbnRvIHNvbWV0aGluZyBlbHNlLlxuXHRcdFx0b1Byb3BzLmVkaXRNb2RlQXNPYmplY3QgPSBvUHJvcHMuZWRpdE1vZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGJNZWFzdXJlUmVhZE9ubHkgPSBvUHJvcHMuZm9ybWF0T3B0aW9ucy5tZWFzdXJlRGlzcGxheU1vZGVcblx0XHRcdFx0PyBvUHJvcHMuZm9ybWF0T3B0aW9ucy5tZWFzdXJlRGlzcGxheU1vZGUgPT09IFwiUmVhZE9ubHlcIlxuXHRcdFx0XHQ6IGZhbHNlO1xuXG5cdFx0XHRvUHJvcHMuZWRpdE1vZGVBc09iamVjdCA9IFVJRm9ybWF0dGVycy5nZXRFZGl0TW9kZShcblx0XHRcdFx0b1Byb3BlcnR5Rm9yRmllbGRDb250cm9sLFxuXHRcdFx0XHRvRGF0YU1vZGVsUGF0aCxcblx0XHRcdFx0Yk1lYXN1cmVSZWFkT25seSxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0b0RhdGFGaWVsZFxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy5lZGl0TW9kZSA9IGNvbXBpbGVFeHByZXNzaW9uKG9Qcm9wcy5lZGl0TW9kZUFzT2JqZWN0KTtcblx0XHR9XG5cdFx0Y29uc3QgZWRpdGFibGVFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmdldEVkaXRhYmxlRXhwcmVzc2lvbkFzT2JqZWN0KG9Qcm9wZXJ0eUZvckZpZWxkQ29udHJvbCwgb0RhdGFGaWVsZCwgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdGNvbnN0IGFSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyhcblx0XHRcdG9Qcm9wcy5lbnRpdHlTZXQ/LmdldFBhdGgoKS5yZXBsYWNlQWxsKFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nL1wiLCBcIi9cIiksXG5cdFx0XHRvTWV0YU1vZGVsXG5cdFx0KTtcblx0XHRjb25zdCBhUmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9ucyA9IENvbW1vblV0aWxzLmdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnMoXG5cdFx0XHRvUHJvcHMuZW50aXR5U2V0Py5nZXRQYXRoKCkucmVwbGFjZUFsbChcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy9cIiwgXCIvXCIpLFxuXHRcdFx0b01ldGFNb2RlbFxuXHRcdCk7XG5cdFx0Y29uc3Qgb1JlcXVpcmVkUHJvcGVydGllcyA9IHtcblx0XHRcdHJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnM6IGFSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zLFxuXHRcdFx0cmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9uczogYVJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnNcblx0XHR9O1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChvTWV0YU1vZGVsKSkge1xuXHRcdFx0b1Byb3BzLmNvbGxhYm9yYXRpb25FbmFibGVkID0gdHJ1ZTtcblx0XHRcdC8vIEV4cHJlc3Npb25zIG5lZWRlZCBmb3IgQ29sbGFib3JhdGlvbiBWaXN1YWxpemF0aW9uXG5cdFx0XHRjb25zdCBjb2xsYWJvcmF0aW9uRXhwcmVzc2lvbiA9IFVJRm9ybWF0dGVycy5nZXRDb2xsYWJvcmF0aW9uRXhwcmVzc2lvbihcblx0XHRcdFx0b0RhdGFNb2RlbFBhdGgsXG5cdFx0XHRcdENvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzLmhhc0NvbGxhYm9yYXRpb25BY3Rpdml0eVxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy5jb2xsYWJvcmF0aW9uSGFzQWN0aXZpdHlFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oY29sbGFib3JhdGlvbkV4cHJlc3Npb24pO1xuXHRcdFx0b1Byb3BzLmNvbGxhYm9yYXRpb25Jbml0aWFsc0V4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0VUlGb3JtYXR0ZXJzLmdldENvbGxhYm9yYXRpb25FeHByZXNzaW9uKG9EYXRhTW9kZWxQYXRoLCBDb2xsYWJvcmF0aW9uRm9ybWF0dGVycy5nZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHlJbml0aWFscylcblx0XHRcdCk7XG5cdFx0XHRvUHJvcHMuY29sbGFib3JhdGlvbkNvbG9yRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRVSUZvcm1hdHRlcnMuZ2V0Q29sbGFib3JhdGlvbkV4cHJlc3Npb24ob0RhdGFNb2RlbFBhdGgsIENvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzLmdldENvbGxhYm9yYXRpb25BY3Rpdml0eUNvbG9yKVxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy5lZGl0YWJsZUV4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihhbmQoZWRpdGFibGVFeHByZXNzaW9uLCBub3QoY29sbGFib3JhdGlvbkV4cHJlc3Npb24pKSk7XG5cblx0XHRcdG9Qcm9wcy5lZGl0TW9kZSA9IGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShjb2xsYWJvcmF0aW9uRXhwcmVzc2lvbiwgY29uc3RhbnQoXCJSZWFkT25seVwiKSwgb1Byb3BzLmVkaXRNb2RlQXNPYmplY3QpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1Byb3BzLmVkaXRhYmxlRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKGVkaXRhYmxlRXhwcmVzc2lvbik7XG5cdFx0fVxuXHRcdG9Qcm9wcy5lbmFibGVkRXhwcmVzc2lvbiA9IFVJRm9ybWF0dGVycy5nZXRFbmFibGVkRXhwcmVzc2lvbihcblx0XHRcdG9Qcm9wZXJ0eUZvckZpZWxkQ29udHJvbCxcblx0XHRcdG9EYXRhRmllbGQsXG5cdFx0XHRmYWxzZSxcblx0XHRcdG9EYXRhTW9kZWxQYXRoXG5cdFx0KSBhcyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0XHRvUHJvcHMucmVxdWlyZWRFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmdldFJlcXVpcmVkRXhwcmVzc2lvbihcblx0XHRcdG9Qcm9wZXJ0eUZvckZpZWxkQ29udHJvbCxcblx0XHRcdG9EYXRhRmllbGQsXG5cdFx0XHRmYWxzZSxcblx0XHRcdGZhbHNlLFxuXHRcdFx0b1JlcXVpcmVkUHJvcGVydGllcyxcblx0XHRcdG9EYXRhTW9kZWxQYXRoXG5cdFx0KSBhcyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0fVxuXG5cdHN0YXRpYyBzZXRVcEZvcm1hdE9wdGlvbnMob1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLCBvQ29udHJvbENvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRjb25zdCBvT3ZlcnJpZGVQcm9wcyA9IEZpZWxkLmdldE92ZXJyaWRlcyhvQ29udHJvbENvbmZpZ3VyYXRpb24sIG9Qcm9wcy5kYXRhRmllbGQuZ2V0UGF0aCgpKTtcblxuXHRcdGlmICghb1Byb3BzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGUpIHtcblx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLmRpc3BsYXlNb2RlID0gVUlGb3JtYXR0ZXJzLmdldERpc3BsYXlNb2RlKG9EYXRhTW9kZWxQYXRoKTtcblx0XHR9XG5cdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMudGV4dExpbmVzRWRpdCA9XG5cdFx0XHRvT3ZlcnJpZGVQcm9wcy50ZXh0TGluZXNFZGl0IHx8XG5cdFx0XHQob092ZXJyaWRlUHJvcHMuZm9ybWF0T3B0aW9ucyAmJiBvT3ZlcnJpZGVQcm9wcy5mb3JtYXRPcHRpb25zLnRleHRMaW5lc0VkaXQpIHx8XG5cdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucy50ZXh0TGluZXNFZGl0IHx8XG5cdFx0XHQ0O1xuXHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLnRleHRNYXhMaW5lcyA9XG5cdFx0XHRvT3ZlcnJpZGVQcm9wcy50ZXh0TWF4TGluZXMgfHxcblx0XHRcdChvT3ZlcnJpZGVQcm9wcy5mb3JtYXRPcHRpb25zICYmIG9PdmVycmlkZVByb3BzLmZvcm1hdE9wdGlvbnMudGV4dE1heExpbmVzKSB8fFxuXHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMudGV4dE1heExpbmVzO1xuXG5cdFx0Ly8gUmV0cmlldmUgdGV4dCBmcm9tIHZhbHVlIGxpc3QgYXMgZmFsbGJhY2sgZmVhdHVyZSBmb3IgbWlzc2luZyB0ZXh0IGFubm90YXRpb24gb24gdGhlIHByb3BlcnR5XG5cdFx0aWYgKG1TZXR0aW5ncy5tb2RlbHMudmlld0RhdGE/LmdldFByb3BlcnR5KFwiL3JldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3RcIikpIHtcblx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QgPSBGaWVsZFRlbXBsYXRpbmcuaXNSZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0RW5hYmxlZChcblx0XHRcdFx0b0RhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0LFxuXHRcdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9uc1xuXHRcdFx0KTtcblx0XHRcdGlmIChvUHJvcHMuZm9ybWF0T3B0aW9ucy5yZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0KSB7XG5cdFx0XHRcdC8vIENvbnNpZGVyIFRleHRBcnJhbmdlbWVudCBhdCBFbnRpdHlUeXBlIG90aGVyd2lzZSBzZXQgZGVmYXVsdCBkaXNwbGF5IGZvcm1hdCAnRGVzY3JpcHRpb25WYWx1ZSdcblx0XHRcdFx0Y29uc3QgaGFzRW50aXR5VGV4dEFycmFuZ2VtZW50ID0gISFvRGF0YU1vZGVsUGF0aD8udGFyZ2V0RW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQ7XG5cdFx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLmRpc3BsYXlNb2RlID0gaGFzRW50aXR5VGV4dEFycmFuZ2VtZW50ID8gb1Byb3BzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGUgOiBcIkRlc2NyaXB0aW9uVmFsdWVcIjtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9Qcm9wcy5mb3JtYXRPcHRpb25zLmZpZWxkTW9kZSA9PT0gXCJub3dyYXBwZXJcIiAmJiBvUHJvcHMuZWRpdE1vZGUgPT09IFwiRGlzcGxheVwiKSB7XG5cdFx0XHRpZiAob1Byb3BzLl9mbGV4SWQpIHtcblx0XHRcdFx0b1Byb3BzLm5vV3JhcHBlcklkID0gb1Byb3BzLl9mbGV4SWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUHJvcHMubm9XcmFwcGVySWQgPSBvUHJvcHMuaWRQcmVmaXggPyBnZW5lcmF0ZShbb1Byb3BzLmlkUHJlZml4LCBcIkZpZWxkLWNvbnRlbnRcIl0pIDogdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBzZXRVcERpc3BsYXlTdHlsZShvUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb0RhdGFGaWVsZDogYW55LCBvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IHZvaWQge1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eTogUHJvcGVydHkgPSBvRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHk7XG5cdFx0aWYgKCFvRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QpIHtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIlRleHRcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKG9Qcm9wZXJ0eS50eXBlID09PSBcIkVkbS5TdHJlYW1cIikge1xuXHRcdFx0b1Byb3BzLmZpbGVTcmMgPSBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0RhdGFGaWVsZC5WYWx1ZSkpO1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiRmlsZVwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zPy5VST8uSXNJbWFnZVVSTCkge1xuXHRcdFx0b1Byb3BzLmF2YXRhclZpc2libGUgPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VmlzaWJsZUV4cHJlc3Npb24ob0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0b1Byb3BzLmF2YXRhclNyYyA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRGF0YUZpZWxkLlZhbHVlKSk7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJBdmF0YXJcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgaGFzUXVpY2tWaWV3RmFjZXRzID0gb1Byb3BlcnR5ID8gRmllbGRUZW1wbGF0aW5nLmlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMob0RhdGFNb2RlbFBhdGgsIG9Qcm9wZXJ0eSkgOiBmYWxzZTtcblxuXHRcdHN3aXRjaCAob0RhdGFGaWVsZC4kVHlwZSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJEYXRhUG9pbnRcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0XHRpZiAob0RhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlKSB7XG5cdFx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiRGF0YVBvaW50XCI7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9EYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RUeXBlXCIpIHtcblx0XHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJDb250YWN0XCI7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkJ1dHRvblwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdFx0RmllbGQuc2V0VXBOYXZpZ2F0aW9uQXZhaWxhYmxlKG9Qcm9wcywgb0RhdGFGaWVsZCk7XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkJ1dHRvblwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRcdG9Qcm9wcy50ZXh0ID0gRmllbGQuZ2V0VGV4dFdpdGhXaGl0ZVNwYWNlKG9Qcm9wcy5mb3JtYXRPcHRpb25zLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0XHQvLyBmYWxscyB0aHJvdWdoXG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiTGlua1wiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChpc1NlbWFudGljS2V5KG9Qcm9wZXJ0eSwgb0RhdGFNb2RlbFBhdGgpICYmIG9Qcm9wcy5mb3JtYXRPcHRpb25zLnNlbWFudGljS2V5U3R5bGUpIHtcblx0XHRcdG9Qcm9wcy5oYXNRdWlja1ZpZXdGYWNldHMgPSBoYXNRdWlja1ZpZXdGYWNldHM7XG5cdFx0XHRvUHJvcHMuaGFzU2l0dWF0aW9uc0luZGljYXRvciA9XG5cdFx0XHRcdFNpdHVhdGlvbnNJbmRpY2F0b3IuZ2V0U2l0dWF0aW9uc05hdmlnYXRpb25Qcm9wZXJ0eShvRGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlUeXBlKSAhPT0gdW5kZWZpbmVkO1xuXHRcdFx0RmllbGQuc2V0VXBPYmplY3RJZGVudGlmaWVyVGl0bGVBbmRUZXh0KG9Qcm9wcywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0aWYgKChvRGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnRSb290KSB7XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIlNlbWFudGljS2V5V2l0aERyYWZ0SW5kaWNhdG9yXCI7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBvUHJvcHMuZm9ybWF0T3B0aW9ucy5zZW1hbnRpY0tleVN0eWxlID09PSBcIk9iamVjdElkZW50aWZpZXJcIiA/IFwiT2JqZWN0SWRlbnRpZmllclwiIDogXCJMYWJlbFNlbWFudGljS2V5XCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChvRGF0YUZpZWxkLkNyaXRpY2FsaXR5KSB7XG5cdFx0XHRvUHJvcHMuaGFzUXVpY2tWaWV3RmFjZXRzID0gaGFzUXVpY2tWaWV3RmFjZXRzO1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiT2JqZWN0U3RhdHVzXCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSAmJiBTdHJpbmcob1Byb3BzLmZvcm1hdE9wdGlvbnMuaXNDdXJyZW5jeUFsaWduZWQpID09PSBcInRydWVcIikge1xuXHRcdFx0aWYgKG9Qcm9wcy5mb3JtYXRPcHRpb25zLm1lYXN1cmVEaXNwbGF5TW9kZSA9PT0gXCJIaWRkZW5cIikge1xuXHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJUZXh0XCI7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdG9Qcm9wcy52YWx1ZUFzU3RyaW5nQmluZGluZ0V4cHJlc3Npb24gPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VmFsdWVCaW5kaW5nKFxuXHRcdFx0XHRvRGF0YU1vZGVsUGF0aCxcblx0XHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy51bml0QmluZGluZ0V4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihVSUZvcm1hdHRlcnMuZ2V0QmluZGluZ0ZvclVuaXRPckN1cnJlbmN5KG9EYXRhTW9kZWxQYXRoKSk7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJBbW91bnRXaXRoQ3VycmVuY3lcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbXVuaWNhdGlvbj8uSXNFbWFpbEFkZHJlc3MgfHwgb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tdW5pY2F0aW9uPy5Jc1Bob25lTnVtYmVyKSB7XG5cdFx0XHRvUHJvcHMudGV4dCA9IEZpZWxkLmdldFRleHRXaXRoV2hpdGVTcGFjZShvUHJvcHMuZm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiTGlua1wiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zPy5VST8uTXVsdGlMaW5lVGV4dCkge1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiRXhwYW5kYWJsZVRleHRcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoaGFzUXVpY2tWaWV3RmFjZXRzKSB7XG5cdFx0XHRvUHJvcHMudGV4dCA9IEZpZWxkLmdldFRleHRXaXRoV2hpdGVTcGFjZShvUHJvcHMuZm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0b1Byb3BzLmhhc1F1aWNrVmlld0ZhY2V0cyA9IHRydWU7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rV2l0aFF1aWNrVmlld1wiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdG9Qcm9wcy5zZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0IShvUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tdW5pY2F0aW9uPy5Jc0VtYWlsQWRkcmVzcyB8fCBvUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tdW5pY2F0aW9uPy5Jc1Bob25lTnVtYmVyKVxuXHRcdCkge1xuXHRcdFx0b1Byb3BzLmhhc1F1aWNrVmlld0ZhY2V0cyA9IGhhc1F1aWNrVmlld0ZhY2V0cztcblx0XHRcdG9Qcm9wcy50ZXh0ID0gRmllbGQuZ2V0VGV4dFdpdGhXaGl0ZVNwYWNlKG9Qcm9wcy5mb3JtYXRPcHRpb25zLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rV2l0aFF1aWNrVmlld1wiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoRmllbGRUZW1wbGF0aW5nLmhhc1NlbWFudGljT2JqZWN0SW5OYXZpZ2F0aW9uT3JQcm9wZXJ0eShvRGF0YU1vZGVsUGF0aCkpIHtcblx0XHRcdG9Qcm9wcy5oYXNRdWlja1ZpZXdGYWNldHMgPSBoYXNRdWlja1ZpZXdGYWNldHM7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rV3JhcHBlclwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBfb1Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMgPSBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbjtcblx0XHRjb25zdCBfb1Byb3BlcnR5TmF2aWdhdGlvblByb3BlcnR5QW5ub3RhdGlvbnMgPSBvRGF0YU1vZGVsUGF0aD8ubmF2aWdhdGlvblByb3BlcnRpZXNbMF0/LmFubm90YXRpb25zPy5Db21tb247XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gX29Qcm9wZXJ0eUNvbW1vbkFubm90YXRpb25zKSB7XG5cdFx0XHRpZiAoa2V5LmluZGV4T2YoXCJTZW1hbnRpY09iamVjdFwiKSA9PT0gMCkge1xuXHRcdFx0XHRvUHJvcHMuaGFzUXVpY2tWaWV3RmFjZXRzID0gaGFzUXVpY2tWaWV3RmFjZXRzO1xuXHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rV3JhcHBlclwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAoY29uc3Qga2V5IGluIF9vUHJvcGVydHlOYXZpZ2F0aW9uUHJvcGVydHlBbm5vdGF0aW9ucykge1xuXHRcdFx0aWYgKGtleS5pbmRleE9mKFwiU2VtYW50aWNPYmplY3RcIikgPT09IDApIHtcblx0XHRcdFx0b1Byb3BzLmhhc1F1aWNrVmlld0ZhY2V0cyA9IGhhc1F1aWNrVmlld0ZhY2V0cztcblx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiTGlua1dyYXBwZXJcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsKSB7XG5cdFx0XHRvUHJvcHMudGV4dCA9IEZpZWxkLmdldFRleHRXaXRoV2hpdGVTcGFjZShvUHJvcHMuZm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiTGlua1wiO1xuXHRcdFx0b1Byb3BzLmljb25VcmwgPSBvRGF0YUZpZWxkLkljb25VcmwgPyBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0RhdGFGaWVsZC5JY29uVXJsKSkgOiB1bmRlZmluZWQ7XG5cdFx0XHRvUHJvcHMubGlua1VybCA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRGF0YUZpZWxkLlVybCkpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJUZXh0XCI7XG5cdH1cblxuXHRzdGF0aWMgc2V0VXBFZGl0U3R5bGUob1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9EYXRhRmllbGQ6IGFueSwgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiB2b2lkIHtcblx0XHRGaWVsZFRlbXBsYXRpbmcuc2V0RWRpdFN0eWxlUHJvcGVydGllcyhvUHJvcHMsIG9EYXRhRmllbGQsIG9EYXRhTW9kZWxQYXRoKTtcblx0fVxuXG5cdHN0YXRpYyBzZXRVcE9iamVjdElkZW50aWZpZXJUaXRsZUFuZFRleHQoX29Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0aWYgKF9vUHJvcHMuZm9ybWF0T3B0aW9ucz8uc2VtYW50aWNLZXlTdHlsZSA9PT0gXCJPYmplY3RJZGVudGlmaWVyXCIpIHtcblx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRpdGxlID0gRmllbGQuZ2V0T2JqZWN0SWRlbnRpZmllclRpdGxlKF9vUHJvcHMuZm9ybWF0T3B0aW9ucywgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0XHRpZiAoIW9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdCkge1xuXHRcdFx0XHRfb1Byb3BzLmlkZW50aWZpZXJUZXh0ID0gRmllbGQuZ2V0T2JqZWN0SWRlbnRpZmllclRleHQoX29Qcm9wcy5mb3JtYXRPcHRpb25zLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRleHQgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRpdGxlID0gdW5kZWZpbmVkO1xuXHRcdFx0X29Qcm9wcy5pZGVudGlmaWVyVGV4dCA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgZ2V0VGV4dFdpdGhXaGl0ZVNwYWNlKGZvcm1hdE9wdGlvbnM6IEZpZWxkRm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRjb25zdCB0ZXh0ID0gRmllbGRUZW1wbGF0aW5nLmdldFRleHRCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCBmb3JtYXRPcHRpb25zLCB0cnVlKTtcblx0XHRyZXR1cm4gKHRleHQgYXMgYW55KS5fdHlwZSA9PT0gXCJQYXRoSW5Nb2RlbFwiIHx8IHR5cGVvZiB0ZXh0ID09PSBcInN0cmluZ1wiXG5cdFx0XHQ/IGNvbXBpbGVFeHByZXNzaW9uKGZvcm1hdFJlc3VsdChbdGV4dF0sIFwiV1NSXCIpKVxuXHRcdFx0OiBjb21waWxlRXhwcmVzc2lvbih0ZXh0KTtcblx0fVxuXG5cdHN0YXRpYyBzZXRVcE5hdmlnYXRpb25BdmFpbGFibGUob1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9EYXRhRmllbGQ6IGFueSk6IHZvaWQge1xuXHRcdG9Qcm9wcy5uYXZpZ2F0aW9uQXZhaWxhYmxlID0gdHJ1ZTtcblx0XHRpZiAoXG5cdFx0XHRvRGF0YUZpZWxkPy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uICYmXG5cdFx0XHRvRGF0YUZpZWxkLk5hdmlnYXRpb25BdmFpbGFibGUgIT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0U3RyaW5nKG9Qcm9wcy5mb3JtYXRPcHRpb25zLmlnbm9yZU5hdmlnYXRpb25BdmFpbGFibGUpICE9PSBcInRydWVcIlxuXHRcdCkge1xuXHRcdFx0b1Byb3BzLm5hdmlnYXRpb25BdmFpbGFibGUgPSBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0RhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlKSk7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxGaWVsZD4sIGNvbnRyb2xDb25maWd1cmF0aW9uOiBhbnksIHNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHRjb25zdCBvRGF0YUZpZWxkQ29udmVydGVkID0gTWV0YU1vZGVsQ29udmVydGVyLmNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KHRoaXMuZGF0YUZpZWxkKTtcblx0XHRsZXQgb0RhdGFNb2RlbFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMuZGF0YUZpZWxkLCB0aGlzLmVudGl0eVNldCk7XG5cdFx0RmllbGQuc2V0VXBEYXRhUG9pbnRUeXBlKG9EYXRhRmllbGRDb252ZXJ0ZWQpO1xuXHRcdEZpZWxkLnNldFVwVmlzaWJsZVByb3BlcnRpZXModGhpcywgb0RhdGFNb2RlbFBhdGgpO1xuXG5cdFx0aWYgKHRoaXMuX2ZsZXhJZCkge1xuXHRcdFx0dGhpcy5fYXBpSWQgPSB0aGlzLl9mbGV4SWQ7XG5cdFx0XHR0aGlzLl9mbGV4SWQgPSBGaWVsZC5nZXRDb250ZW50SWQodGhpcy5fZmxleElkKTtcblx0XHRcdHRoaXMuX3ZoRmxleElkID0gYCR7dGhpcy5fZmxleElkfV8ke3RoaXMudmhJZFByZWZpeH1gO1xuXHRcdH1cblx0XHRjb25zdCB2YWx1ZURhdGFNb2RlbFBhdGggPSBGaWVsZFRlbXBsYXRpbmcuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aEZvclZhbHVlKG9EYXRhTW9kZWxQYXRoKTtcblx0XHRvRGF0YU1vZGVsUGF0aCA9IHZhbHVlRGF0YU1vZGVsUGF0aCB8fCBvRGF0YU1vZGVsUGF0aDtcblx0XHRGaWVsZC5zZXRVcFNlbWFudGljT2JqZWN0cyh0aGlzLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0dGhpcy5kYXRhU291cmNlUGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgob0RhdGFNb2RlbFBhdGgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBzZXR0aW5ncy5tb2RlbHMubWV0YU1vZGVsIHx8IHNldHRpbmdzLm1vZGVscy5lbnRpdHlTZXQ7XG5cdFx0dGhpcy5lbnRpdHlUeXBlID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgLyR7b0RhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWV9YCk7XG5cblx0XHRGaWVsZC5zZXRVcEVkaXRhYmxlUHJvcGVydGllcyh0aGlzLCBvRGF0YUZpZWxkQ29udmVydGVkLCBvRGF0YU1vZGVsUGF0aCwgb01ldGFNb2RlbCk7XG5cdFx0RmllbGQuc2V0VXBGb3JtYXRPcHRpb25zKHRoaXMsIG9EYXRhTW9kZWxQYXRoLCBjb250cm9sQ29uZmlndXJhdGlvbiwgc2V0dGluZ3MpO1xuXHRcdEZpZWxkLnNldFVwRGlzcGxheVN0eWxlKHRoaXMsIG9EYXRhRmllbGRDb252ZXJ0ZWQsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHRGaWVsZC5zZXRVcEVkaXRTdHlsZSh0aGlzLCBvRGF0YUZpZWxkQ29udmVydGVkLCBvRGF0YU1vZGVsUGF0aCk7XG5cblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGNvbXB1dGUgYmluZGluZ3MtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdFx0Y29uc3QgYURpc3BsYXlTdHlsZXNXaXRob3V0UHJvcFRleHQgPSBbXCJBdmF0YXJcIiwgXCJBbW91bnRXaXRoQ3VycmVuY3lcIl07XG5cdFx0aWYgKHRoaXMuZGlzcGxheVN0eWxlICYmIGFEaXNwbGF5U3R5bGVzV2l0aG91dFByb3BUZXh0LmluZGV4T2YodGhpcy5kaXNwbGF5U3R5bGUpID09PSAtMSAmJiBvRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QpIHtcblx0XHRcdHRoaXMudGV4dCA9IHRoaXMudGV4dCA/PyBGaWVsZFRlbXBsYXRpbmcuZ2V0VGV4dEJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIHRoaXMuZm9ybWF0T3B0aW9ucyk7XG5cdFx0XHRGaWVsZC5zZXRVcE9iamVjdElkZW50aWZpZXJUaXRsZUFuZFRleHQodGhpcywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRleHQgPSBcIlwiO1xuXHRcdH1cblxuXHRcdC8vVE9ETyB0aGlzIGlzIGZpeGVkIHR3aWNlXG5cdFx0Ly8gZGF0YSBwb2ludCBhbm5vdGF0aW9ucyBuZWVkIG5vdCBoYXZlICRUeXBlIGRlZmluZWQsIHNvIGFkZCBpdCBpZiBtaXNzaW5nXG5cdFx0aWYgKCh0aGlzLmRhdGFGaWVsZC5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKSBhcyB1bmtub3duIGFzIHN0cmluZyk/LmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikgPiAtMSkge1xuXHRcdFx0Y29uc3Qgb0RhdGFQb2ludCA9IHRoaXMuZGF0YUZpZWxkLmdldE9iamVjdCgpIGFzIERhdGFQb2ludFR5cGU7XG5cdFx0XHRvRGF0YVBvaW50LiRUeXBlID0gb0RhdGFQb2ludC4kVHlwZSB8fCBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlO1xuXHRcdFx0dGhpcy5kYXRhRmllbGQgPSBuZXcgVGVtcGxhdGVNb2RlbChvRGF0YVBvaW50LCB0aGlzLmRhdGFGaWVsZC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdFx0fVxuXG5cdFx0dGhpcy5lbXB0eUluZGljYXRvck1vZGUgPSB0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd0VtcHR5SW5kaWNhdG9yID8gXCJPblwiIDogdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmdW5jdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRpZiAodGhpcy5mb3JtYXRPcHRpb25zLmZpZWxkTW9kZSA9PT0gXCJub3dyYXBwZXJcIiAmJiB0aGlzLmVkaXRNb2RlID09PSBFZGl0TW9kZS5EaXNwbGF5KSB7XG5cdFx0XHRyZXR1cm4geG1sYDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuZmllbGQuRmllbGRDb250ZW50XCIgdHlwZT1cIlhNTFwiIC8+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IGlkO1xuXHRcdFx0aWYgKHRoaXMuX2FwaUlkKSB7XG5cdFx0XHRcdGlkID0gdGhpcy5fYXBpSWQ7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuaWRQcmVmaXgpIHtcblx0XHRcdFx0aWQgPSBnZW5lcmF0ZShbdGhpcy5pZFByZWZpeCwgXCJGaWVsZFwiXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZCA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMub25DaGFuZ2UgIT09IG51bGwgJiYgdGhpcy5vbkNoYW5nZSAhPT0gXCJudWxsXCIpIHtcblx0XHRcdFx0cmV0dXJuIHhtbGBcblx0XHRcdFx0XHQ8bWFjcm9GaWVsZDpGaWVsZEFQSVxuXHRcdFx0XHRcdFx0eG1sbnM6bWFjcm9GaWVsZD1cInNhcC5mZS5tYWNyb3MuZmllbGRcIlxuXHRcdFx0XHRcdFx0Y2hhbmdlPVwiJHt0aGlzLm9uQ2hhbmdlfVwiXG5cdFx0XHRcdFx0XHRpZD1cIiR7aWR9XCJcblx0XHRcdFx0XHRcdHJlcXVpcmVkPVwiJHt0aGlzLnJlcXVpcmVkRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRcdFx0ZWRpdGFibGU9XCIke3RoaXMuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0XHRcdFx0XHRjb2xsYWJvcmF0aW9uRW5hYmxlZD1cIiR7dGhpcy5jb2xsYWJvcmF0aW9uRW5hYmxlZH1cIlxuXHRcdFx0XHRcdFx0dmlzaWJsZT1cIiR7dGhpcy52aXNpYmxlfVwiXG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5maWVsZC5GaWVsZENvbnRlbnRcIiB0eXBlPVwiWE1MXCIgLz5cblx0XHRcdFx0XHQ8L21hY3JvRmllbGQ6RmllbGRBUEk+XG5cdFx0XHRcdGA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4geG1sYDxtYWNyb0ZpZWxkOkZpZWxkQVBJXG5cdFx0XHRcdFx0XHR4bWxuczptYWNyb0ZpZWxkPVwic2FwLmZlLm1hY3Jvcy5maWVsZFwiXG5cdFx0XHRcdFx0XHRpZD1cIiR7aWR9XCJcblx0XHRcdFx0XHRcdHJlcXVpcmVkPVwiJHt0aGlzLnJlcXVpcmVkRXhwcmVzc2lvbn1cIlxuXHRcdFx0XHRcdFx0ZWRpdGFibGU9XCIke3RoaXMuZWRpdGFibGVFeHByZXNzaW9ufVwiXG5cdFx0XHRcdFx0XHRjb2xsYWJvcmF0aW9uRW5hYmxlZD1cIiR7dGhpcy5jb2xsYWJvcmF0aW9uRW5hYmxlZH1cIlxuXHRcdFx0XHRcdFx0dmlzaWJsZT1cIiR7dGhpcy52aXNpYmxlfVwiXG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5maWVsZC5GaWVsZENvbnRlbnRcIiB0eXBlPVwiWE1MXCIgLz5cblx0XHRcdFx0XHQ8L21hY3JvRmllbGQ6RmllbGRBUEk+XG5cdFx0XHRcdFx0YDtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFtSXFCQSxLQUFLO0VBeEIxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWxCQSxPQW1CQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxPQUFPO0lBQ2JDLFNBQVMsRUFBRSx3QkFBd0I7SUFDbkNDLFVBQVUsRUFBRTtFQUNiLENBQUMsQ0FBQyxVQUVBQyxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFHREQs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QUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0E2UFIsQ0FBQyxDQUFDO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FNMUIsRUFBRTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==