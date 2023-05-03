/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyFormatters", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/valuehelp/ValueHelpTemplating"], function (BuildingBlock, BuildingBlockRuntime, BindingHelper, MetaModelConverter, BindingToolkit, ID, DataModelPathHelper, PropertyFormatters, UIFormatters, FieldHelper, FieldTemplating, ValueHelpTemplating) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var getVisibleExpression = FieldTemplating.getVisibleExpression;
  var getValueBinding = FieldTemplating.getValueBinding;
  var getDisplayMode = UIFormatters.getDisplayMode;
  var isPathInsertable = DataModelPathHelper.isPathInsertable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
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
  let MultiValueField = (
  /**
   * Building block for creating a MultiValueField based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField annotation is expected
   *
   * Usage example:
   * <pre>
   * <internalMacro:MultiValueField
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
    name: "MultiValueField",
    namespace: "sap.fe.macros.internal"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string",
    defaultValue: "FieldValueHelp"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    $kind: ["Property"]
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    $kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "object",
    validate: function (formatOptionsInput) {
      if (formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      return formatOptionsInput;
    }
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(MultiValueField, _BuildingBlockBase);
    /**
     * Prefix added to the generated ID of the field
     */
    /**
     * Prefix added to the generated ID of the value help used for the field
     */
    /**
     * Metadata path to the MultiValueField.
     * This property is usually a metadataContext pointing to a DataField having a Value that uses a 1:n navigation
     */
    /**
     * Mandatory context to the MultiValueField
     */
    /**
     * Property added to associate the label with the MultiValueField
     */
    /**
     * The format options
     */
    /**
     * Function to get the correct settings for the multi input.
     *
     * @param propertyDataModelObjectPath The corresponding datamodelobjectpath.
     * @param formatOptions The format options to calculate the result
     * @returns MultiInputSettings
     */
    MultiValueField._getMultiInputSettings = function _getMultiInputSettings(propertyDataModelObjectPath, formatOptions) {
      var _propertyDefinition$a;
      const {
        collectionPath,
        itemDataModelObjectPath
      } = MultiValueField._getPathStructure(propertyDataModelObjectPath);
      const collectionBindingDisplay = `{path:'${collectionPath}', templateShareable: false}`;
      const collectionBindingEdit = `{path:'${collectionPath}', parameters: {$$ownRequest : true}, templateShareable: false}`;
      const propertyDefinition = propertyDataModelObjectPath.targetObject.type === "PropertyPath" ? propertyDataModelObjectPath.targetObject.$target : propertyDataModelObjectPath.targetObject;
      const commonText = (_propertyDefinition$a = propertyDefinition.annotations.Common) === null || _propertyDefinition$a === void 0 ? void 0 : _propertyDefinition$a.Text;
      const relativeLocation = getRelativePaths(propertyDataModelObjectPath);
      const textExpression = commonText ? compileExpression(getExpressionFromAnnotation(commonText, relativeLocation)) : getValueBinding(itemDataModelObjectPath, formatOptions, true);
      return {
        text: textExpression,
        collectionBindingDisplay: collectionBindingDisplay,
        collectionBindingEdit: collectionBindingEdit,
        key: getValueBinding(itemDataModelObjectPath, formatOptions, true)
      };
    }

    // Process the dataModelPath to find the collection and the relative DataModelPath for the item.
    ;
    MultiValueField._getPathStructure = function _getPathStructure(dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2;
      let firstCollectionPath = "";
      const currentEntitySet = (_dataModelObjectPath$ = dataModelObjectPath.contextLocation) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.targetEntitySet ? dataModelObjectPath.contextLocation.targetEntitySet : dataModelObjectPath.startingEntitySet;
      const navigatedPaths = [];
      const contextNavsForItem = ((_dataModelObjectPath$2 = dataModelObjectPath.contextLocation) === null || _dataModelObjectPath$2 === void 0 ? void 0 : _dataModelObjectPath$2.navigationProperties) || [];
      for (const navProp of dataModelObjectPath.navigationProperties) {
        if (!dataModelObjectPath.contextLocation || !dataModelObjectPath.contextLocation.navigationProperties.some(contextNavProp => contextNavProp.fullyQualifiedName === navProp.fullyQualifiedName)) {
          // in case of relative entitySetPath we don't consider navigationPath that are already in the context
          navigatedPaths.push(navProp.name);
          contextNavsForItem.push(navProp);
        }
        if (currentEntitySet.navigationPropertyBinding.hasOwnProperty(navProp.name)) {
          if (navProp._type === "NavigationProperty" && navProp.isCollection) {
            break;
          }
        }
      }
      firstCollectionPath = `${navigatedPaths.join("/")}`;
      const itemDataModelObjectPath = Object.assign({}, dataModelObjectPath);
      if (itemDataModelObjectPath.contextLocation) {
        itemDataModelObjectPath.contextLocation.navigationProperties = contextNavsForItem;
      }
      return {
        collectionPath: firstCollectionPath,
        itemDataModelObjectPath: itemDataModelObjectPath
      };
    };
    function MultiValueField(props) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "idPrefix", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vhIdPrefix", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "key", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor7, _assertThisInitialized(_this));
      let dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.metaPath, props.contextPath);
      const dataFieldConverted = MetaModelConverter.convertMetaModelContext(_this.metaPath);
      const extraPath = dataFieldConverted.Value.path;
      _this.visible = getVisibleExpression(dataModelPath, props.formatOptions);
      if (extraPath && extraPath.length > 0) {
        dataModelPath = enhanceDataModelPath(dataModelPath, extraPath);
      }
      const insertable = isPathInsertable(dataModelPath);
      const deleteNavigationRestriction = isPathDeletable(dataModelPath, {
        ignoreTargetCollection: true,
        authorizeUnresolvable: true
      });
      const deletePath = isPathDeletable(dataModelPath);
      // deletable:
      //		if restrictions come from Navigation we apply it
      //		otherwise we apply restrictions defined on target collection only if it's a constant
      //      otherwise it's true!
      const deletable = ifElse(deleteNavigationRestriction._type === "Unresolvable", or(not(isConstant(deletePath)), deletePath), deletePath);
      _this.editMode = _this.formatOptions.displayOnly === "true" ? "Display" : compileExpression(ifElse(and(insertable, deletable, UI.IsEditable), constant("Editable"), constant("Display")));
      _this.displayMode = getDisplayMode(dataModelPath);
      const multiInputSettings = MultiValueField._getMultiInputSettings(dataModelPath, _this.formatOptions);
      _this.text = multiInputSettings.text;
      _this.collection = _this.editMode === "Display" ? multiInputSettings.collectionBindingDisplay : multiInputSettings.collectionBindingEdit;
      _this.key = multiInputSettings.key;
      return _this;
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */
    _exports = MultiValueField;
    var _proto = MultiValueField.prototype;
    _proto.getTemplate = function getTemplate() {
      //prepare settings for further processing
      const internalDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(this.metaPath, this.contextPath);
      const internalDataPointConverted = MetaModelConverter.convertMetaModelContext(this.metaPath);
      const enhancedDataModelPath = enhanceDataModelPath(internalDataModelPath, internalDataPointConverted.Value.path);
      //calculate the id settings for this block
      const id = this.idPrefix ? ID.generate([this.idPrefix, "MultiValueField"]) : undefined;
      //create a new binding context for the value help
      const valueHelpProperty = FieldHelper.valueHelpProperty(this.metaPath);
      const valueHelpPropertyContext = this.metaPath.getModel().createBindingContext(valueHelpProperty, this.metaPath);
      //calculate fieldHelp
      const fieldHelp = ValueHelpTemplating.generateID(undefined, this.vhIdPrefix, PropertyFormatters.getRelativePropertyPath(valueHelpPropertyContext, {
        context: this.contextPath
      }), getContextRelativeTargetObjectPath(enhancedDataModelPath));
      //compute the correct label
      const label = FieldHelper.computeLabelText(internalDataModelPath.targetObject.Value, {
        context: this.metaPath
      });
      return xml`
		<mdc:MultiValueField
				xmlns:mdc="sap.ui.mdc"
				delegate="{name: 'sap/fe/macros/multiValueField/MultiValueFieldDelegate'}"
				id="${id}"
				items="${this.collection}"
				display="${this.displayMode}"
				width="100%"
				editMode="${this.editMode}"
				fieldHelp="${fieldHelp}"
				ariaLabelledBy = "${this.ariaLabelledBy}"
				showEmptyIndicator = "${this.formatOptions.showEmptyIndicator}"
				label = "${label}"
		>
		<mdcField:MultiValueFieldItem xmlns:mdcField="sap.ui.mdc.field" key="${this.key}" description="${this.text}" />
		</mdc:MultiValueField>
			`;
    };
    return MultiValueField;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "vhIdPrefix", [_dec3], {
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
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "key", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = MultiValueField;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aVZhbHVlRmllbGQiLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsInJlcXVpcmVkIiwiJGtpbmQiLCJ2YWxpZGF0ZSIsImZvcm1hdE9wdGlvbnNJbnB1dCIsImRpc3BsYXlNb2RlIiwiaW5jbHVkZXMiLCJFcnJvciIsIl9nZXRNdWx0aUlucHV0U2V0dGluZ3MiLCJwcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgiLCJmb3JtYXRPcHRpb25zIiwiY29sbGVjdGlvblBhdGgiLCJpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aCIsIl9nZXRQYXRoU3RydWN0dXJlIiwiY29sbGVjdGlvbkJpbmRpbmdEaXNwbGF5IiwiY29sbGVjdGlvbkJpbmRpbmdFZGl0IiwicHJvcGVydHlEZWZpbml0aW9uIiwidGFyZ2V0T2JqZWN0IiwiJHRhcmdldCIsImNvbW1vblRleHQiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlRleHQiLCJyZWxhdGl2ZUxvY2F0aW9uIiwiZ2V0UmVsYXRpdmVQYXRocyIsInRleHRFeHByZXNzaW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJnZXRWYWx1ZUJpbmRpbmciLCJ0ZXh0Iiwia2V5IiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsImZpcnN0Q29sbGVjdGlvblBhdGgiLCJjdXJyZW50RW50aXR5U2V0IiwiY29udGV4dExvY2F0aW9uIiwidGFyZ2V0RW50aXR5U2V0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJuYXZpZ2F0ZWRQYXRocyIsImNvbnRleHROYXZzRm9ySXRlbSIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibmF2UHJvcCIsInNvbWUiLCJjb250ZXh0TmF2UHJvcCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInB1c2giLCJuYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nIiwiaGFzT3duUHJvcGVydHkiLCJfdHlwZSIsImlzQ29sbGVjdGlvbiIsImpvaW4iLCJPYmplY3QiLCJhc3NpZ24iLCJwcm9wcyIsImRhdGFNb2RlbFBhdGgiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJtZXRhUGF0aCIsImNvbnRleHRQYXRoIiwiZGF0YUZpZWxkQ29udmVydGVkIiwiY29udmVydE1ldGFNb2RlbENvbnRleHQiLCJleHRyYVBhdGgiLCJWYWx1ZSIsInBhdGgiLCJ2aXNpYmxlIiwiZ2V0VmlzaWJsZUV4cHJlc3Npb24iLCJsZW5ndGgiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsImluc2VydGFibGUiLCJpc1BhdGhJbnNlcnRhYmxlIiwiZGVsZXRlTmF2aWdhdGlvblJlc3RyaWN0aW9uIiwiaXNQYXRoRGVsZXRhYmxlIiwiaWdub3JlVGFyZ2V0Q29sbGVjdGlvbiIsImF1dGhvcml6ZVVucmVzb2x2YWJsZSIsImRlbGV0ZVBhdGgiLCJkZWxldGFibGUiLCJpZkVsc2UiLCJvciIsIm5vdCIsImlzQ29uc3RhbnQiLCJlZGl0TW9kZSIsImRpc3BsYXlPbmx5IiwiYW5kIiwiVUkiLCJJc0VkaXRhYmxlIiwiY29uc3RhbnQiLCJnZXREaXNwbGF5TW9kZSIsIm11bHRpSW5wdXRTZXR0aW5ncyIsImNvbGxlY3Rpb24iLCJnZXRUZW1wbGF0ZSIsImludGVybmFsRGF0YU1vZGVsUGF0aCIsImludGVybmFsRGF0YVBvaW50Q29udmVydGVkIiwiZW5oYW5jZWREYXRhTW9kZWxQYXRoIiwiaWQiLCJpZFByZWZpeCIsIklEIiwiZ2VuZXJhdGUiLCJ1bmRlZmluZWQiLCJ2YWx1ZUhlbHBQcm9wZXJ0eSIsIkZpZWxkSGVscGVyIiwidmFsdWVIZWxwUHJvcGVydHlDb250ZXh0IiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImZpZWxkSGVscCIsIlZhbHVlSGVscFRlbXBsYXRpbmciLCJnZW5lcmF0ZUlEIiwidmhJZFByZWZpeCIsIlByb3BlcnR5Rm9ybWF0dGVycyIsImdldFJlbGF0aXZlUHJvcGVydHlQYXRoIiwiY29udGV4dCIsImdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJsYWJlbCIsImNvbXB1dGVMYWJlbFRleHQiLCJ4bWwiLCJhcmlhTGFiZWxsZWRCeSIsInNob3dFbXB0eUluZGljYXRvciIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNdWx0aVZhbHVlRmllbGQuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eSwgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRpc0NvbnN0YW50LFxuXHRub3QsXG5cdG9yXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0ICogYXMgSUQgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGVuaGFuY2VEYXRhTW9kZWxQYXRoLFxuXHRnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoLFxuXHRnZXRSZWxhdGl2ZVBhdGhzLFxuXHRpc1BhdGhEZWxldGFibGUsXG5cdGlzUGF0aEluc2VydGFibGVcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0ICogYXMgUHJvcGVydHlGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5Rm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBEaXNwbGF5TW9kZSwgTWV0YU1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBGaWVsZEhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0VmFsdWVCaW5kaW5nLCBnZXRWaXNpYmxlRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0ICogYXMgVmFsdWVIZWxwVGVtcGxhdGluZyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVIZWxwVGVtcGxhdGluZ1wiO1xuaW1wb3J0IHR5cGUgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IHR5cGUgeyBWNENvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5cbnR5cGUgTXVsdGlJbnB1dFNldHRpbmdzID0ge1xuXHR0ZXh0OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRjb2xsZWN0aW9uQmluZGluZ0Rpc3BsYXk6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRjb2xsZWN0aW9uQmluZGluZ0VkaXQ6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRrZXk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG59O1xuXG50eXBlIE11bHRpVmFsdWVGaWVsZEZvcm1hdE9wdGlvbnMgPSBQYXJ0aWFsPHtcblx0c2hvd0VtcHR5SW5kaWNhdG9yPzogYm9vbGVhbjtcblx0ZGlzcGxheU9ubHk/OiBib29sZWFuIHwgc3RyaW5nO1xuXHRkaXNwbGF5TW9kZT86IHN0cmluZztcblx0bWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nO1xuXHRpc0FuYWx5dGljcz86IGJvb2xlYW47XG59PjtcblxudHlwZSBNdWx0aVZhbHVlRmllbGRQYXRoU3RydWN0dXJlID0ge1xuXHRjb2xsZWN0aW9uUGF0aDogc3RyaW5nO1xuXHRpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aDtcbn07XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgTXVsdGlWYWx1ZUZpZWxkIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgRGF0YUZpZWxkIGFubm90YXRpb24gaXMgZXhwZWN0ZWRcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqIDxpbnRlcm5hbE1hY3JvOk11bHRpVmFsdWVGaWVsZFxuICogICBpZFByZWZpeD1cIlNvbWVQcmVmaXhcIlxuICogICBjb250ZXh0UGF0aD1cIntlbnRpdHlTZXQ+fVwiXG4gKiAgIG1ldGFQYXRoPVwie2RhdGFGaWVsZD59XCJcbiAqIC8+XG4gKiA8L3ByZT5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNpbmNlIDEuOTQuMFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiTXVsdGlWYWx1ZUZpZWxkXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNdWx0aVZhbHVlRmllbGQgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBQcmVmaXggYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgaWRQcmVmaXg/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFByZWZpeCBhZGRlZCB0byB0aGUgZ2VuZXJhdGVkIElEIG9mIHRoZSB2YWx1ZSBoZWxwIHVzZWQgZm9yIHRoZSBmaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGRlZmF1bHRWYWx1ZTogXCJGaWVsZFZhbHVlSGVscFwiXG5cdH0pXG5cdHB1YmxpYyB2aElkUHJlZml4ITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBNdWx0aVZhbHVlRmllbGQuXG5cdCAqIFRoaXMgcHJvcGVydHkgaXMgdXN1YWxseSBhIG1ldGFkYXRhQ29udGV4dCBwb2ludGluZyB0byBhIERhdGFGaWVsZCBoYXZpbmcgYSBWYWx1ZSB0aGF0IHVzZXMgYSAxOm4gbmF2aWdhdGlvblxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0JGtpbmQ6IFtcIlByb3BlcnR5XCJdXG5cdH0pXG5cdHB1YmxpYyBtZXRhUGF0aCE6IFY0Q29udGV4dDtcblxuXHQvKipcblx0ICogTWFuZGF0b3J5IGNvbnRleHQgdG8gdGhlIE11bHRpVmFsdWVGaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0JGtpbmQ6IFtcIkVudGl0eVNldFwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIl1cblx0fSlcblx0cHVibGljIGNvbnRleHRQYXRoITogVjRDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBQcm9wZXJ0eSBhZGRlZCB0byBhc3NvY2lhdGUgdGhlIGxhYmVsIHdpdGggdGhlIE11bHRpVmFsdWVGaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBhcmlhTGFiZWxsZWRCeT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHJpdmF0ZSBrZXk/OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdHByaXZhdGUgdGV4dD86IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyoqXG5cdCAqIEVkaXQgTW9kZSBvZiB0aGUgZmllbGQuXG5cdCAqIElmIHRoZSBlZGl0TW9kZSBpcyB1bmRlZmluZWQgdGhlbiB3ZSBjb21wdXRlIGl0IGJhc2VkIG9uIHRoZSBtZXRhZGF0YVxuXHQgKiBPdGhlcndpc2Ugd2UgdXNlIHRoZSB2YWx1ZSBwcm92aWRlZCBoZXJlLlxuXHQgKi9cblx0cHJpdmF0ZSBlZGl0TW9kZSE6IEVkaXRNb2RlIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyoqXG5cdCAqIFRoZSBkaXNwbGF5IG1vZGUgYWRkZWQgdG8gdGhlIGNvbGxlY3Rpb24gZmllbGRcblx0ICovXG5cdHByaXZhdGUgZGlzcGxheU1vZGUhOiBEaXNwbGF5TW9kZTtcblxuXHQvKipcblx0ICogVGhlIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHRoYXQgaXMgY2FsY3VsYXRlZCBpbnRlcm5hbGx5XG5cdCAqL1xuXHRwcml2YXRlIGNvbGxlY3Rpb24hOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHQvKipcblx0ICogVGhlIGZvcm1hdCBvcHRpb25zXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwib2JqZWN0XCIsXG5cdFx0dmFsaWRhdGU6IGZ1bmN0aW9uIChmb3JtYXRPcHRpb25zSW5wdXQ6IE11bHRpVmFsdWVGaWVsZEZvcm1hdE9wdGlvbnMpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0Zm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlICYmXG5cdFx0XHRcdCFbXCJWYWx1ZVwiLCBcIkRlc2NyaXB0aW9uXCIsIFwiVmFsdWVEZXNjcmlwdGlvblwiLCBcIkRlc2NyaXB0aW9uVmFsdWVcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5kaXNwbGF5TW9kZX0gZm9yIGRpc3BsYXlNb2RlIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9uc0lucHV0O1xuXHRcdH1cblx0fSlcblx0cHVibGljIGZvcm1hdE9wdGlvbnMhOiBNdWx0aVZhbHVlRmllbGRGb3JtYXRPcHRpb25zO1xuXG5cdHByaXZhdGUgdmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRvIGdldCB0aGUgY29ycmVjdCBzZXR0aW5ncyBmb3IgdGhlIG11bHRpIGlucHV0LlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoIFRoZSBjb3JyZXNwb25kaW5nIGRhdGFtb2RlbG9iamVjdHBhdGguXG5cdCAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIFRoZSBmb3JtYXQgb3B0aW9ucyB0byBjYWxjdWxhdGUgdGhlIHJlc3VsdFxuXHQgKiBAcmV0dXJucyBNdWx0aUlucHV0U2V0dGluZ3Ncblx0ICovXG5cdHByaXZhdGUgc3RhdGljIF9nZXRNdWx0aUlucHV0U2V0dGluZ3MoXG5cdFx0cHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdGZvcm1hdE9wdGlvbnM6IE11bHRpVmFsdWVGaWVsZEZvcm1hdE9wdGlvbnNcblx0KTogTXVsdGlJbnB1dFNldHRpbmdzIHtcblx0XHRjb25zdCB7IGNvbGxlY3Rpb25QYXRoLCBpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aCB9ID0gTXVsdGlWYWx1ZUZpZWxkLl9nZXRQYXRoU3RydWN0dXJlKHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0Y29uc3QgY29sbGVjdGlvbkJpbmRpbmdEaXNwbGF5ID0gYHtwYXRoOicke2NvbGxlY3Rpb25QYXRofScsIHRlbXBsYXRlU2hhcmVhYmxlOiBmYWxzZX1gO1xuXHRcdGNvbnN0IGNvbGxlY3Rpb25CaW5kaW5nRWRpdCA9IGB7cGF0aDonJHtjb2xsZWN0aW9uUGF0aH0nLCBwYXJhbWV0ZXJzOiB7JCRvd25SZXF1ZXN0IDogdHJ1ZX0sIHRlbXBsYXRlU2hhcmVhYmxlOiBmYWxzZX1gO1xuXG5cdFx0Y29uc3QgcHJvcGVydHlEZWZpbml0aW9uID1cblx0XHRcdHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudHlwZSA9PT0gXCJQcm9wZXJ0eVBhdGhcIlxuXHRcdFx0XHQ/IChwcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LiR0YXJnZXQgYXMgUHJvcGVydHkpXG5cdFx0XHRcdDogKHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHkpO1xuXHRcdGNvbnN0IGNvbW1vblRleHQgPSBwcm9wZXJ0eURlZmluaXRpb24uYW5ub3RhdGlvbnMuQ29tbW9uPy5UZXh0O1xuXHRcdGNvbnN0IHJlbGF0aXZlTG9jYXRpb24gPSBnZXRSZWxhdGl2ZVBhdGhzKHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cblx0XHRjb25zdCB0ZXh0RXhwcmVzc2lvbiA9IGNvbW1vblRleHRcblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0XHRcdFx0Y29tbW9uVGV4dCBhcyB1bmtub3duIGFzIFByb3BlcnR5QW5ub3RhdGlvblZhbHVlPFByb3BlcnR5Pixcblx0XHRcdFx0XHRcdHJlbGF0aXZlTG9jYXRpb25cblx0XHRcdFx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+XG5cdFx0XHQgIClcblx0XHRcdDogZ2V0VmFsdWVCaW5kaW5nKGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoLCBmb3JtYXRPcHRpb25zLCB0cnVlKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGV4dDogdGV4dEV4cHJlc3Npb24sXG5cdFx0XHRjb2xsZWN0aW9uQmluZGluZ0Rpc3BsYXk6IGNvbGxlY3Rpb25CaW5kaW5nRGlzcGxheSxcblx0XHRcdGNvbGxlY3Rpb25CaW5kaW5nRWRpdDogY29sbGVjdGlvbkJpbmRpbmdFZGl0LFxuXHRcdFx0a2V5OiBnZXRWYWx1ZUJpbmRpbmcoaXRlbURhdGFNb2RlbE9iamVjdFBhdGgsIGZvcm1hdE9wdGlvbnMsIHRydWUpXG5cdFx0fTtcblx0fVxuXG5cdC8vIFByb2Nlc3MgdGhlIGRhdGFNb2RlbFBhdGggdG8gZmluZCB0aGUgY29sbGVjdGlvbiBhbmQgdGhlIHJlbGF0aXZlIERhdGFNb2RlbFBhdGggZm9yIHRoZSBpdGVtLlxuXHRwcml2YXRlIHN0YXRpYyBfZ2V0UGF0aFN0cnVjdHVyZShkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogTXVsdGlWYWx1ZUZpZWxkUGF0aFN0cnVjdHVyZSB7XG5cdFx0bGV0IGZpcnN0Q29sbGVjdGlvblBhdGggPSBcIlwiO1xuXHRcdGNvbnN0IGN1cnJlbnRFbnRpdHlTZXQgPSBkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbj8udGFyZ2V0RW50aXR5U2V0XG5cdFx0XHQ/IGRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uLnRhcmdldEVudGl0eVNldFxuXHRcdFx0OiBkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0O1xuXHRcdGNvbnN0IG5hdmlnYXRlZFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGNvbnN0IGNvbnRleHROYXZzRm9ySXRlbSA9IGRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uPy5uYXZpZ2F0aW9uUHJvcGVydGllcyB8fCBbXTtcblx0XHRmb3IgKGNvbnN0IG5hdlByb3Agb2YgZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQhZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24gfHxcblx0XHRcdFx0IWRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLnNvbWUoXG5cdFx0XHRcdFx0KGNvbnRleHROYXZQcm9wKSA9PiBjb250ZXh0TmF2UHJvcC5mdWxseVF1YWxpZmllZE5hbWUgPT09IG5hdlByb3AuZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0XHRcdClcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBpbiBjYXNlIG9mIHJlbGF0aXZlIGVudGl0eVNldFBhdGggd2UgZG9uJ3QgY29uc2lkZXIgbmF2aWdhdGlvblBhdGggdGhhdCBhcmUgYWxyZWFkeSBpbiB0aGUgY29udGV4dFxuXHRcdFx0XHRuYXZpZ2F0ZWRQYXRocy5wdXNoKG5hdlByb3AubmFtZSk7XG5cdFx0XHRcdGNvbnRleHROYXZzRm9ySXRlbS5wdXNoKG5hdlByb3ApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGN1cnJlbnRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZy5oYXNPd25Qcm9wZXJ0eShuYXZQcm9wLm5hbWUpKSB7XG5cdFx0XHRcdGlmIChuYXZQcm9wLl90eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIG5hdlByb3AuaXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Zmlyc3RDb2xsZWN0aW9uUGF0aCA9IGAke25hdmlnYXRlZFBhdGhzLmpvaW4oXCIvXCIpfWA7XG5cdFx0Y29uc3QgaXRlbURhdGFNb2RlbE9iamVjdFBhdGggPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRpZiAoaXRlbURhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uKSB7XG5cdFx0XHRpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24ubmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb250ZXh0TmF2c0Zvckl0ZW07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgY29sbGVjdGlvblBhdGg6IGZpcnN0Q29sbGVjdGlvblBhdGgsIGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoOiBpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aCB9O1xuXHR9XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxNdWx0aVZhbHVlRmllbGQ+KSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXHRcdGxldCBkYXRhTW9kZWxQYXRoID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCBwcm9wcy5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3QgZGF0YUZpZWxkQ29udmVydGVkID0gTWV0YU1vZGVsQ29udmVydGVyLmNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KHRoaXMubWV0YVBhdGgpO1xuXHRcdGNvbnN0IGV4dHJhUGF0aCA9IGRhdGFGaWVsZENvbnZlcnRlZC5WYWx1ZS5wYXRoO1xuXG5cdFx0dGhpcy52aXNpYmxlID0gZ2V0VmlzaWJsZUV4cHJlc3Npb24oZGF0YU1vZGVsUGF0aCwgcHJvcHMuZm9ybWF0T3B0aW9ucyk7XG5cdFx0aWYgKGV4dHJhUGF0aCAmJiBleHRyYVBhdGgubGVuZ3RoID4gMCkge1xuXHRcdFx0ZGF0YU1vZGVsUGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGRhdGFNb2RlbFBhdGgsIGV4dHJhUGF0aCk7XG5cdFx0fVxuXHRcdGNvbnN0IGluc2VydGFibGUgPSBpc1BhdGhJbnNlcnRhYmxlKGRhdGFNb2RlbFBhdGgpO1xuXHRcdGNvbnN0IGRlbGV0ZU5hdmlnYXRpb25SZXN0cmljdGlvbiA9IGlzUGF0aERlbGV0YWJsZShkYXRhTW9kZWxQYXRoLCB7XG5cdFx0XHRpZ25vcmVUYXJnZXRDb2xsZWN0aW9uOiB0cnVlLFxuXHRcdFx0YXV0aG9yaXplVW5yZXNvbHZhYmxlOiB0cnVlXG5cdFx0fSk7XG5cdFx0Y29uc3QgZGVsZXRlUGF0aCA9IGlzUGF0aERlbGV0YWJsZShkYXRhTW9kZWxQYXRoKTtcblx0XHQvLyBkZWxldGFibGU6XG5cdFx0Ly9cdFx0aWYgcmVzdHJpY3Rpb25zIGNvbWUgZnJvbSBOYXZpZ2F0aW9uIHdlIGFwcGx5IGl0XG5cdFx0Ly9cdFx0b3RoZXJ3aXNlIHdlIGFwcGx5IHJlc3RyaWN0aW9ucyBkZWZpbmVkIG9uIHRhcmdldCBjb2xsZWN0aW9uIG9ubHkgaWYgaXQncyBhIGNvbnN0YW50XG5cdFx0Ly8gICAgICBvdGhlcndpc2UgaXQncyB0cnVlIVxuXHRcdGNvbnN0IGRlbGV0YWJsZSA9IGlmRWxzZShcblx0XHRcdGRlbGV0ZU5hdmlnYXRpb25SZXN0cmljdGlvbi5fdHlwZSA9PT0gXCJVbnJlc29sdmFibGVcIixcblx0XHRcdG9yKG5vdChpc0NvbnN0YW50KGRlbGV0ZVBhdGgpKSwgZGVsZXRlUGF0aCksXG5cdFx0XHRkZWxldGVQYXRoXG5cdFx0KTtcblx0XHR0aGlzLmVkaXRNb2RlID1cblx0XHRcdHRoaXMuZm9ybWF0T3B0aW9ucy5kaXNwbGF5T25seSA9PT0gXCJ0cnVlXCJcblx0XHRcdFx0PyBcIkRpc3BsYXlcIlxuXHRcdFx0XHQ6IGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShhbmQoaW5zZXJ0YWJsZSwgZGVsZXRhYmxlLCBVSS5Jc0VkaXRhYmxlKSwgY29uc3RhbnQoXCJFZGl0YWJsZVwiKSwgY29uc3RhbnQoXCJEaXNwbGF5XCIpKSk7XG5cdFx0dGhpcy5kaXNwbGF5TW9kZSA9IGdldERpc3BsYXlNb2RlKGRhdGFNb2RlbFBhdGgpO1xuXG5cdFx0Y29uc3QgbXVsdGlJbnB1dFNldHRpbmdzID0gTXVsdGlWYWx1ZUZpZWxkLl9nZXRNdWx0aUlucHV0U2V0dGluZ3MoZGF0YU1vZGVsUGF0aCwgdGhpcy5mb3JtYXRPcHRpb25zKTtcblx0XHR0aGlzLnRleHQgPSBtdWx0aUlucHV0U2V0dGluZ3MudGV4dDtcblx0XHR0aGlzLmNvbGxlY3Rpb24gPVxuXHRcdFx0dGhpcy5lZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIgPyBtdWx0aUlucHV0U2V0dGluZ3MuY29sbGVjdGlvbkJpbmRpbmdEaXNwbGF5IDogbXVsdGlJbnB1dFNldHRpbmdzLmNvbGxlY3Rpb25CaW5kaW5nRWRpdDtcblx0XHR0aGlzLmtleSA9IG11bHRpSW5wdXRTZXR0aW5ncy5rZXk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHRlbXBsYXRlIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdC8vcHJlcGFyZSBzZXR0aW5ncyBmb3IgZnVydGhlciBwcm9jZXNzaW5nXG5cdFx0Y29uc3QgaW50ZXJuYWxEYXRhTW9kZWxQYXRoID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBpbnRlcm5hbERhdGFQb2ludENvbnZlcnRlZCA9IE1ldGFNb2RlbENvbnZlcnRlci5jb252ZXJ0TWV0YU1vZGVsQ29udGV4dCh0aGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCBlbmhhbmNlZERhdGFNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChpbnRlcm5hbERhdGFNb2RlbFBhdGgsIGludGVybmFsRGF0YVBvaW50Q29udmVydGVkLlZhbHVlLnBhdGgpO1xuXHRcdC8vY2FsY3VsYXRlIHRoZSBpZCBzZXR0aW5ncyBmb3IgdGhpcyBibG9ja1xuXHRcdGNvbnN0IGlkID0gdGhpcy5pZFByZWZpeCA/IElELmdlbmVyYXRlKFt0aGlzLmlkUHJlZml4LCBcIk11bHRpVmFsdWVGaWVsZFwiXSkgOiB1bmRlZmluZWQ7XG5cdFx0Ly9jcmVhdGUgYSBuZXcgYmluZGluZyBjb250ZXh0IGZvciB0aGUgdmFsdWUgaGVscFxuXHRcdGNvbnN0IHZhbHVlSGVscFByb3BlcnR5ID0gRmllbGRIZWxwZXIudmFsdWVIZWxwUHJvcGVydHkodGhpcy5tZXRhUGF0aCk7XG5cdFx0Y29uc3QgdmFsdWVIZWxwUHJvcGVydHlDb250ZXh0ID0gdGhpcy5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHZhbHVlSGVscFByb3BlcnR5LCB0aGlzLm1ldGFQYXRoKTtcblx0XHQvL2NhbGN1bGF0ZSBmaWVsZEhlbHBcblx0XHRjb25zdCBmaWVsZEhlbHAgPSBWYWx1ZUhlbHBUZW1wbGF0aW5nLmdlbmVyYXRlSUQoXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHR0aGlzLnZoSWRQcmVmaXgsXG5cdFx0XHRQcm9wZXJ0eUZvcm1hdHRlcnMuZ2V0UmVsYXRpdmVQcm9wZXJ0eVBhdGgodmFsdWVIZWxwUHJvcGVydHlDb250ZXh0IGFzIHVua25vd24gYXMgTWV0YU1vZGVsQ29udGV4dCwge1xuXHRcdFx0XHRjb250ZXh0OiB0aGlzLmNvbnRleHRQYXRoXG5cdFx0XHR9KSxcblx0XHRcdGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgoZW5oYW5jZWREYXRhTW9kZWxQYXRoKSFcblx0XHQpO1xuXHRcdC8vY29tcHV0ZSB0aGUgY29ycmVjdCBsYWJlbFxuXHRcdGNvbnN0IGxhYmVsID0gRmllbGRIZWxwZXIuY29tcHV0ZUxhYmVsVGV4dChpbnRlcm5hbERhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlLCB7IGNvbnRleHQ6IHRoaXMubWV0YVBhdGggfSk7XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdDxtZGM6TXVsdGlWYWx1ZUZpZWxkXG5cdFx0XHRcdHhtbG5zOm1kYz1cInNhcC51aS5tZGNcIlxuXHRcdFx0XHRkZWxlZ2F0ZT1cIntuYW1lOiAnc2FwL2ZlL21hY3Jvcy9tdWx0aVZhbHVlRmllbGQvTXVsdGlWYWx1ZUZpZWxkRGVsZWdhdGUnfVwiXG5cdFx0XHRcdGlkPVwiJHtpZH1cIlxuXHRcdFx0XHRpdGVtcz1cIiR7dGhpcy5jb2xsZWN0aW9ufVwiXG5cdFx0XHRcdGRpc3BsYXk9XCIke3RoaXMuZGlzcGxheU1vZGV9XCJcblx0XHRcdFx0d2lkdGg9XCIxMDAlXCJcblx0XHRcdFx0ZWRpdE1vZGU9XCIke3RoaXMuZWRpdE1vZGV9XCJcblx0XHRcdFx0ZmllbGRIZWxwPVwiJHtmaWVsZEhlbHB9XCJcblx0XHRcdFx0YXJpYUxhYmVsbGVkQnkgPSBcIiR7dGhpcy5hcmlhTGFiZWxsZWRCeX1cIlxuXHRcdFx0XHRzaG93RW1wdHlJbmRpY2F0b3IgPSBcIiR7dGhpcy5mb3JtYXRPcHRpb25zLnNob3dFbXB0eUluZGljYXRvcn1cIlxuXHRcdFx0XHRsYWJlbCA9IFwiJHtsYWJlbH1cIlxuXHRcdD5cblx0XHQ8bWRjRmllbGQ6TXVsdGlWYWx1ZUZpZWxkSXRlbSB4bWxuczptZGNGaWVsZD1cInNhcC51aS5tZGMuZmllbGRcIiBrZXk9XCIke3RoaXMua2V5fVwiIGRlc2NyaXB0aW9uPVwiJHt0aGlzLnRleHR9XCIgLz5cblx0XHQ8L21kYzpNdWx0aVZhbHVlRmllbGQ+XG5cdFx0XHRgO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQThFcUJBLGVBQWU7RUF2QnBDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBbEJBLE9BbUJDQyxtQkFBbUIsQ0FBQztJQUNwQkMsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QkMsU0FBUyxFQUFFO0VBQ1osQ0FBQyxDQUFDLFVBS0FDLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFNREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBQyxVQU9ERixjQUFjLENBQUM7SUFDZkMsSUFB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UztNQUN0RjtNQUNBLE1BQU1DLGlCQUFpQixHQUFHQyxXQUFXLENBQUNELGlCQUFpQixDQUFDLElBQUksQ0FBQ3pDLFFBQVEsQ0FBQztNQUN0RSxNQUFNMkMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDM0MsUUFBUSxDQUFDNEMsUUFBUSxFQUFFLENBQUNDLG9CQUFvQixDQUFDSixpQkFBaUIsRUFBRSxJQUFJLENBQUN6QyxRQUFRLENBQUM7TUFDaEg7TUFDQSxNQUFNOEMsU0FBUyxHQUFHQyxtQkFBbUIsQ0FBQ0MsVUFBVSxDQUMvQ1IsU0FBUyxFQUNULElBQUksQ0FBQ1MsVUFBVSxFQUNmQyxrQkFBa0IsQ0FBQ0MsdUJBQXVCLENBQUNSLHdCQUF3QixFQUFpQztRQUNuR1MsT0FBTyxFQUFFLElBQUksQ0FBQ25EO01BQ2YsQ0FBQyxDQUFDLEVBQ0ZvRCxrQ0FBa0MsQ0FBQ2xCLHFCQUFxQixDQUFDLENBQ3pEO01BQ0Q7TUFDQSxNQUFNbUIsS0FBSyxHQUFHWixXQUFXLENBQUNhLGdCQUFnQixDQUFDdEIscUJBQXFCLENBQUN4RSxZQUFZLENBQUM0QyxLQUFLLEVBQUU7UUFBRStDLE9BQU8sRUFBRSxJQUFJLENBQUNwRDtNQUFTLENBQUMsQ0FBQztNQUVoSCxPQUFPd0QsR0FBSTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFVBQVVwQixFQUFHO0FBQ2IsYUFBYSxJQUFJLENBQUNMLFVBQVc7QUFDN0IsZUFBZSxJQUFJLENBQUNsRixXQUFZO0FBQ2hDO0FBQ0EsZ0JBQWdCLElBQUksQ0FBQzBFLFFBQVM7QUFDOUIsaUJBQWlCdUIsU0FBVTtBQUMzQix3QkFBd0IsSUFBSSxDQUFDVyxjQUFlO0FBQzVDLDRCQUE0QixJQUFJLENBQUN2RyxhQUFhLENBQUN3RyxrQkFBbUI7QUFDbEUsZUFBZUosS0FBTTtBQUNyQjtBQUNBLHlFQUF5RSxJQUFJLENBQUNoRixHQUFJLGtCQUFpQixJQUFJLENBQUNELElBQUs7QUFDN0c7QUFDQSxJQUFJO0lBQ0gsQ0FBQztJQUFBO0VBQUEsRUFwUDJDc0YsaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9