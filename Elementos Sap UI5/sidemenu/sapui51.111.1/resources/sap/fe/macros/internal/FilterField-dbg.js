/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/PropertyFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/filter/FilterFieldHelper", "sap/fe/macros/filter/FilterFieldTemplating", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper"], function (Log, BuildingBlock, BuildingBlockRuntime, MetaModelConverter, StableIdHelper, PropertyFormatters, CommonHelper, FieldHelper, FilterFieldHelper, FilterFieldTemplating, BindingToolkit, DataModelPathHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var getFilterFieldDisplayFormat = FilterFieldTemplating.getFilterFieldDisplayFormat;
  var getRelativePropertyPath = PropertyFormatters.getRelativePropertyPath;
  var generate = StableIdHelper.generate;
  var xml = BuildingBlockRuntime.xml;
  var SAP_UI_MODEL_CONTEXT = BuildingBlockRuntime.SAP_UI_MODEL_CONTEXT;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FilterField = (
  /**
   * Building block for creating a Filter Field based on the metadata provided by OData V4.
   * <br>
   * It is designed to work based on a property context(property) pointing to an entity type property
   * needed to be used as filterfield and entityType context(contextPath) to consider the relativity of
   * the propertyPath of the property wrt entityType.
   *
   * Usage example:
   * <pre>
   * &lt;macro:FilterField id="MyFilterField" property="CompanyName" /&gt;
   * </pre>
   *
   * @private
   */
  _dec = defineBuildingBlock({
    name: "FilterField",
    namespace: "sap.fe.macros.internal"
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec5 = blockAttribute({
    type: "string",
    defaultValue: "FilterField",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "string",
    defaultValue: "FilterFieldValueHelp",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "boolean",
    defaultValue: true,
    isPublic: true
  }), _dec8 = blockAttribute({
    type: "string",
    defaultValue: "",
    isPublic: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FilterField, _BuildingBlockBase);
    /**
     * Defines the metadata path to the property.
     */

    /**
     * Metadata path to the entitySet or navigationProperty
     */

    /**
     * Visual filter settings for filter field.
     */

    /**
     * A prefix that is added to the generated ID of the filter field.
     */

    /**
     * A prefix that is added to the generated ID of the value help used for the filter field.
     */

    /**
     * Specifies the Sematic Date Range option for the filter field.
     */

    /**
     * Settings from the manifest settings.
     */

    function FilterField(oProps, configuration, mSettings) {
      var _propertyConverted$an, _propertyConverted$an2, _propertyConverted$an3, _propertyConverted$an4;
      var _this;
      _this = _BuildingBlockBase.call(this, oProps, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "property", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visualFilter", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "idPrefix", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vhIdPrefix", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useSemanticDateRange", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "settings", _descriptor7, _assertThisInitialized(_this));
      const propertyConverted = MetaModelConverter.convertMetaModelContext(_this.property);
      const dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.property, _this.contextPath);

      // Property settings
      const propertyName = propertyConverted.name,
        fixedValues = !!((_propertyConverted$an = propertyConverted.annotations) !== null && _propertyConverted$an !== void 0 && (_propertyConverted$an2 = _propertyConverted$an.Common) !== null && _propertyConverted$an2 !== void 0 && _propertyConverted$an2.ValueListWithFixedValues);
      _this.controlId = _this.idPrefix && generate([_this.idPrefix, propertyName]);
      _this.sourcePath = getTargetObjectPath(dataModelPath);
      _this.dataType = FilterFieldHelper.getDataType(propertyConverted);
      const labelTerm = (propertyConverted === null || propertyConverted === void 0 ? void 0 : (_propertyConverted$an3 = propertyConverted.annotations) === null || _propertyConverted$an3 === void 0 ? void 0 : (_propertyConverted$an4 = _propertyConverted$an3.Common) === null || _propertyConverted$an4 === void 0 ? void 0 : _propertyConverted$an4.Label) || propertyName;
      const labelExpression = getExpressionFromAnnotation(labelTerm);
      _this.label = compileExpression(labelExpression) || propertyName;
      _this.conditionsBinding = FilterFieldHelper.getConditionsBinding(dataModelPath) || "";
      _this.placeholder = FilterFieldHelper.getPlaceholder(propertyConverted);
      // Visual Filter settings
      _this.vfEnabled = !!_this.visualFilter && !(_this.idPrefix && _this.idPrefix.indexOf("Adaptation") > -1);
      _this.vfId = _this.vfEnabled ? generate([_this.idPrefix, propertyName, "VisualFilter"]) : undefined;

      //-----------------------------------------------------------------------------------------------------//
      // TODO: need to change operations from MetaModel to Converters.
      // This mainly included changing changing getFilterRestrictions operations from metaModel to converters
      const propertyContext = _this.property,
        model = propertyContext.getModel(),
        vhPropertyPath = FieldHelper.valueHelpPropertyForFilterField(propertyContext),
        filterable = CommonHelper.isPropertyFilterable(propertyContext),
        propertyObject = propertyContext.getObject(),
        propertyInterface = {
          context: propertyContext
        };
      _this.display = getFilterFieldDisplayFormat(dataModelPath, propertyConverted, propertyInterface);
      _this.isFilterable = !(filterable === false || filterable === "false");
      _this.maxConditions = FilterFieldHelper.maxConditions(propertyObject, propertyInterface);
      _this.dataTypeConstraints = FilterFieldHelper.constraints(propertyObject, propertyInterface);
      _this.dataTypeFormatOptions = FilterFieldHelper.formatOptions(propertyObject, propertyInterface);
      _this.required = FilterFieldHelper.isRequiredInFilter(propertyObject, propertyInterface);
      _this.operators = FieldHelper.operators(propertyContext, propertyObject, _this.useSemanticDateRange, _this.settings || "", _this.contextPath.getPath());

      // Value Help settings
      // TODO: This needs to be updated when VH macro is converted to 2.0
      const vhProperty = model.createBindingContext(vhPropertyPath);
      const vhPropertyObject = vhProperty.getObject(),
        vhPropertyInterface = {
          context: vhProperty
        },
        relativeVhPropertyPath = getRelativePropertyPath(vhPropertyObject, vhPropertyInterface),
        relativePropertyPath = getRelativePropertyPath(propertyObject, propertyInterface);
      _this.fieldHelpProperty = FieldHelper.getFieldHelpPropertyForFilterField(propertyContext, propertyObject, propertyObject.$Type, _this.vhIdPrefix, relativePropertyPath, relativeVhPropertyPath, fixedValues, _this.useSemanticDateRange);

      //-----------------------------------------------------------------------------------------------------//
      return _this;
    }
    _exports = FilterField;
    var _proto = FilterField.prototype;
    _proto.getVisualFilterContent = function getVisualFilterContent() {
      var _visualFilterObject, _visualFilterObject$i;
      let visualFilterObject = this.visualFilter,
        vfXML = xml``;
      if (!this.vfEnabled || !visualFilterObject) {
        return vfXML;
      }
      if ((_visualFilterObject = visualFilterObject) !== null && _visualFilterObject !== void 0 && (_visualFilterObject$i = _visualFilterObject.isA) !== null && _visualFilterObject$i !== void 0 && _visualFilterObject$i.call(_visualFilterObject, SAP_UI_MODEL_CONTEXT)) {
        visualFilterObject = visualFilterObject.getObject();
      }
      const {
        contextPath,
        presentationAnnotation,
        outParameter,
        inParameters,
        valuelistProperty,
        selectionVariantAnnotation,
        multipleSelectionAllowed,
        required,
        requiredProperties = [],
        showOverlayInitially,
        renderLineChart
      } = visualFilterObject;
      vfXML = xml`
				<macro:VisualFilter
					id="${this.vfId}"
					contextPath="${contextPath}"
					metaPath="${presentationAnnotation}"
					outParameter="${outParameter}"
					inParameters="${inParameters}"
					valuelistProperty="${valuelistProperty}"
					selectionVariantAnnotation="${selectionVariantAnnotation}"
					multipleSelectionAllowed="${multipleSelectionAllowed}"
					required="${required}"
					requiredProperties="${CommonHelper.stringifyCustomData(requiredProperties)}"
					showOverlayInitially="${showOverlayInitially}"
					renderLineChart="${renderLineChart}"
					filterBarEntityType="${contextPath}"
				/>
			`;
      return vfXML;
    };
    _proto.getTemplate = async function getTemplate() {
      let xmlRet = ``;
      if (this.isFilterable) {
        let display;
        try {
          display = await this.display;
        } catch (err) {
          Log.error(`FE : FilterField BuildingBlock : Error fetching display property for ${this.sourcePath} : ${err}`);
        }
        xmlRet = xml`
				<mdc:FilterField
					xmlns:mdc="sap.ui.mdc"
					xmlns:macro="sap.fe.macros"
					xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
					xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					unittest:id="UnitTest::FilterField"
					customData:sourcePath="${this.sourcePath}"
					id="${this.controlId}"
					delegate="{name: 'sap/fe/macros/field/FieldBaseDelegate', payload:{isFilterField:true}}"
					label="${this.label}"
					dataType="${this.dataType}"
					display="${display}"
					maxConditions="${this.maxConditions}"
					fieldHelp="${this.fieldHelpProperty}"
					conditions="${this.conditionsBinding}"
					dataTypeConstraints="${this.dataTypeConstraints}"
					dataTypeFormatOptions="${this.dataTypeFormatOptions}"
					required="${this.required}"
					operators="${this.operators}"
					placeholder="${this.placeholder}"

				>
					${this.vfEnabled ? this.getVisualFilterContent() : xml``}
				</mdc:FilterField>
			`;
      }
      return xmlRet;
    };
    return FilterField;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "property", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "visualFilter", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "vhIdPrefix", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "useSemanticDateRange", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "settings", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FilterField;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJGaWVsZCIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJpc1B1YmxpYyIsImRlZmF1bHRWYWx1ZSIsIm9Qcm9wcyIsImNvbmZpZ3VyYXRpb24iLCJtU2V0dGluZ3MiLCJwcm9wZXJ0eUNvbnZlcnRlZCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwicHJvcGVydHkiLCJkYXRhTW9kZWxQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiY29udGV4dFBhdGgiLCJwcm9wZXJ0eU5hbWUiLCJmaXhlZFZhbHVlcyIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwiY29udHJvbElkIiwiaWRQcmVmaXgiLCJnZW5lcmF0ZSIsInNvdXJjZVBhdGgiLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwiZGF0YVR5cGUiLCJGaWx0ZXJGaWVsZEhlbHBlciIsImdldERhdGFUeXBlIiwibGFiZWxUZXJtIiwiTGFiZWwiLCJsYWJlbEV4cHJlc3Npb24iLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJsYWJlbCIsImNvbXBpbGVFeHByZXNzaW9uIiwiY29uZGl0aW9uc0JpbmRpbmciLCJnZXRDb25kaXRpb25zQmluZGluZyIsInBsYWNlaG9sZGVyIiwiZ2V0UGxhY2Vob2xkZXIiLCJ2ZkVuYWJsZWQiLCJ2aXN1YWxGaWx0ZXIiLCJpbmRleE9mIiwidmZJZCIsInVuZGVmaW5lZCIsInByb3BlcnR5Q29udGV4dCIsIm1vZGVsIiwiZ2V0TW9kZWwiLCJ2aFByb3BlcnR5UGF0aCIsIkZpZWxkSGVscGVyIiwidmFsdWVIZWxwUHJvcGVydHlGb3JGaWx0ZXJGaWVsZCIsImZpbHRlcmFibGUiLCJDb21tb25IZWxwZXIiLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsInByb3BlcnR5T2JqZWN0IiwiZ2V0T2JqZWN0IiwicHJvcGVydHlJbnRlcmZhY2UiLCJjb250ZXh0IiwiZGlzcGxheSIsImdldEZpbHRlckZpZWxkRGlzcGxheUZvcm1hdCIsImlzRmlsdGVyYWJsZSIsIm1heENvbmRpdGlvbnMiLCJkYXRhVHlwZUNvbnN0cmFpbnRzIiwiY29uc3RyYWludHMiLCJkYXRhVHlwZUZvcm1hdE9wdGlvbnMiLCJmb3JtYXRPcHRpb25zIiwiaXNSZXF1aXJlZEluRmlsdGVyIiwib3BlcmF0b3JzIiwidXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJzZXR0aW5ncyIsImdldFBhdGgiLCJ2aFByb3BlcnR5IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJ2aFByb3BlcnR5T2JqZWN0IiwidmhQcm9wZXJ0eUludGVyZmFjZSIsInJlbGF0aXZlVmhQcm9wZXJ0eVBhdGgiLCJnZXRSZWxhdGl2ZVByb3BlcnR5UGF0aCIsInJlbGF0aXZlUHJvcGVydHlQYXRoIiwiZmllbGRIZWxwUHJvcGVydHkiLCJnZXRGaWVsZEhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkIiwiJFR5cGUiLCJ2aElkUHJlZml4IiwiZ2V0VmlzdWFsRmlsdGVyQ29udGVudCIsInZpc3VhbEZpbHRlck9iamVjdCIsInZmWE1MIiwieG1sIiwiaXNBIiwiU0FQX1VJX01PREVMX0NPTlRFWFQiLCJwcmVzZW50YXRpb25Bbm5vdGF0aW9uIiwib3V0UGFyYW1ldGVyIiwiaW5QYXJhbWV0ZXJzIiwidmFsdWVsaXN0UHJvcGVydHkiLCJzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbiIsIm11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZCIsInJlcXVpcmVkUHJvcGVydGllcyIsInNob3dPdmVybGF5SW5pdGlhbGx5IiwicmVuZGVyTGluZUNoYXJ0Iiwic3RyaW5naWZ5Q3VzdG9tRGF0YSIsImdldFRlbXBsYXRlIiwieG1sUmV0IiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyRmllbGQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHsgU0FQX1VJX01PREVMX0NPTlRFWFQsIHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmVsYXRpdmVQcm9wZXJ0eVBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUZvcm1hdHRlcnNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRIZWxwZXJcIjtcbmltcG9ydCBGaWx0ZXJGaWVsZEhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyRmllbGRIZWxwZXJcIjtcbmltcG9ydCB7IGdldEZpbHRlckZpZWxkRGlzcGxheUZvcm1hdCB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJGaWVsZFRlbXBsYXRpbmdcIjtcblxuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBWaXN1YWxGaWx0ZXJzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9WaXN1YWxGaWx0ZXJzXCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBDb21wdXRlZEFubm90YXRpb25JbnRlcmZhY2UsIE1ldGFNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9NZXRhTW9kZWxcIjtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGaWx0ZXIgRmllbGQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogSXQgaXMgZGVzaWduZWQgdG8gd29yayBiYXNlZCBvbiBhIHByb3BlcnR5IGNvbnRleHQocHJvcGVydHkpIHBvaW50aW5nIHRvIGFuIGVudGl0eSB0eXBlIHByb3BlcnR5XG4gKiBuZWVkZWQgdG8gYmUgdXNlZCBhcyBmaWx0ZXJmaWVsZCBhbmQgZW50aXR5VHlwZSBjb250ZXh0KGNvbnRleHRQYXRoKSB0byBjb25zaWRlciB0aGUgcmVsYXRpdml0eSBvZlxuICogdGhlIHByb3BlcnR5UGF0aCBvZiB0aGUgcHJvcGVydHkgd3J0IGVudGl0eVR5cGUuXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86RmlsdGVyRmllbGQgaWQ9XCJNeUZpbHRlckZpZWxkXCIgcHJvcGVydHk9XCJDb21wYW55TmFtZVwiIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiRmlsdGVyRmllbGRcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpbHRlckZpZWxkIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgbWV0YWRhdGEgcGF0aCB0byB0aGUgcHJvcGVydHkuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRwcm9wZXJ0eSE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGVudGl0eVNldCBvciBuYXZpZ2F0aW9uUHJvcGVydHlcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHQvKipcblx0ICogVmlzdWFsIGZpbHRlciBzZXR0aW5ncyBmb3IgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0dmlzdWFsRmlsdGVyPzogVmlzdWFsRmlsdGVycztcblxuXHQvKipcblx0ICogQSBwcmVmaXggdGhhdCBpcyBhZGRlZCB0byB0aGUgZ2VuZXJhdGVkIElEIG9mIHRoZSBmaWx0ZXIgZmllbGQuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBcIkZpbHRlckZpZWxkXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0aWRQcmVmaXghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEEgcHJlZml4IHRoYXQgaXMgYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgdmFsdWUgaGVscCB1c2VkIGZvciB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGRlZmF1bHRWYWx1ZTogXCJGaWx0ZXJGaWVsZFZhbHVlSGVscFwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHZoSWRQcmVmaXghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgU2VtYXRpYyBEYXRlIFJhbmdlIG9wdGlvbiBmb3IgdGhlIGZpbHRlciBmaWVsZC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHVzZVNlbWFudGljRGF0ZVJhbmdlITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU2V0dGluZ3MgZnJvbSB0aGUgbWFuaWZlc3Qgc2V0dGluZ3MuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBcIlwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHNldHRpbmdzPzogc3RyaW5nO1xuXG5cdC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHQgKiAgICAgICAgICAgIElOVEVSTkFMIEFUVFJJQlVURVMgICAgICAgICAgICAgICpcblx0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblx0LyoqXG5cdCAqIENvbnRyb2wgSWQgZm9yIE1EQyBmaWx0ZXIgZmllbGQgdXNlZCBpbnNpZGUuXG5cdCAqL1xuXHRjb250cm9sSWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNvdXJjZSBhbm5vdGF0aW9uIHBhdGggb2YgdGhlIHByb3BlcnR5LlxuXHQgKi9cblx0c291cmNlUGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogTGFiZWwgZm9yIGZpbHRlcmZpZWxkLlxuXHQgKi9cblx0bGFiZWwhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERhdGEgVHlwZSBvZiB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0ZGF0YVR5cGUhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE1heGltdW0gY29uZGl0aW9ucyB0aGF0IGNhbiBiZSBhZGRlZCB0byB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0bWF4Q29uZGl0aW9ucyE6IG51bWJlcjtcblxuXHQvKipcblx0ICogRmllbGQgSGVscCBpZCBhcyBhc3NvY2lhdGlvbiBmb3IgdGhlIGZpbHRlciBmaWVsZC5cblx0ICovXG5cdGZpZWxkSGVscFByb3BlcnR5Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBCaW5kaW5nIHBhdGggZm9yIGNvbmRpdGlvbnMgYWRkZWQgdG8gZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0Y29uZGl0aW9uc0JpbmRpbmchOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERhdGF0eXBlIGNvbnN0cmFpbnRzIG9mIHRoZSBmaWx0ZXIgZmllbGQuXG5cdCAqL1xuXHRkYXRhVHlwZUNvbnN0cmFpbnRzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEYXRhdHlwZSBmb3JtYXQgb3B0aW9ucyBvZiB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0ZGF0YVR5cGVGb3JtYXRPcHRpb25zPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUbyBzcGVjaWZ5IGZpbHRlciBmaWVsZCBpcyBtYW5kYXRvcnkgZm9yIGZpbHRlcmluZy5cblx0ICovXG5cdHJlcXVpcmVkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBWYWxpZCBvcGVyYXRvcnMgZm9yIHRoZSBmaWx0ZXIgZmllbGQuXG5cdCAqL1xuXHRvcGVyYXRvcnM/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFZpc3VhbCBGaWx0ZXIgaWQgdG8gYmUgdXNlZC5cblx0ICovXG5cdHZmSWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFZpc3VhbCBGaWx0ZXIgaXMgZXhwZWN0ZWQuXG5cdCAqL1xuXHR2ZkVuYWJsZWQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBQcm9wZXJ0eSB1c2VkIGlzIGZpbHRlcmFibGVcblx0ICovXG5cdGlzRmlsdGVyYWJsZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IGZvciBwbGFjZWhvbGRlclxuXHQgKi9cblx0cGxhY2Vob2xkZXI/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IHRvIGhvbGQgcHJvbWlzZSBmb3IgZGlzcGxheVxuXHQgKi9cblx0ZGlzcGxheT86IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPjtcblxuXHRjb25zdHJ1Y3RvcihvUHJvcHM6IFByb3BlcnRpZXNPZjxGaWx0ZXJGaWVsZD4sIGNvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihvUHJvcHMsIGNvbmZpZ3VyYXRpb24sIG1TZXR0aW5ncyk7XG5cblx0XHRjb25zdCBwcm9wZXJ0eUNvbnZlcnRlZCA9IE1ldGFNb2RlbENvbnZlcnRlci5jb252ZXJ0TWV0YU1vZGVsQ29udGV4dCh0aGlzLnByb3BlcnR5KSBhcyBQcm9wZXJ0eTtcblx0XHRjb25zdCBkYXRhTW9kZWxQYXRoID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLnByb3BlcnR5LCB0aGlzLmNvbnRleHRQYXRoKTtcblxuXHRcdC8vIFByb3BlcnR5IHNldHRpbmdzXG5cdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gcHJvcGVydHlDb252ZXJ0ZWQubmFtZSxcblx0XHRcdGZpeGVkVmFsdWVzID0gISFwcm9wZXJ0eUNvbnZlcnRlZC5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXM7XG5cblx0XHR0aGlzLmNvbnRyb2xJZCA9IHRoaXMuaWRQcmVmaXggJiYgZ2VuZXJhdGUoW3RoaXMuaWRQcmVmaXgsIHByb3BlcnR5TmFtZV0pO1xuXHRcdHRoaXMuc291cmNlUGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsUGF0aCk7XG5cdFx0dGhpcy5kYXRhVHlwZSA9IEZpbHRlckZpZWxkSGVscGVyLmdldERhdGFUeXBlKHByb3BlcnR5Q29udmVydGVkKTtcblx0XHRjb25zdCBsYWJlbFRlcm0gPSBwcm9wZXJ0eUNvbnZlcnRlZD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWwgfHwgcHJvcGVydHlOYW1lO1xuXHRcdGNvbnN0IGxhYmVsRXhwcmVzc2lvbiA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihsYWJlbFRlcm0pO1xuXHRcdHRoaXMubGFiZWwgPSBjb21waWxlRXhwcmVzc2lvbihsYWJlbEV4cHJlc3Npb24pIHx8IHByb3BlcnR5TmFtZTtcblx0XHR0aGlzLmNvbmRpdGlvbnNCaW5kaW5nID0gRmlsdGVyRmllbGRIZWxwZXIuZ2V0Q29uZGl0aW9uc0JpbmRpbmcoZGF0YU1vZGVsUGF0aCkgfHwgXCJcIjtcblx0XHR0aGlzLnBsYWNlaG9sZGVyID0gRmlsdGVyRmllbGRIZWxwZXIuZ2V0UGxhY2Vob2xkZXIocHJvcGVydHlDb252ZXJ0ZWQpO1xuXHRcdC8vIFZpc3VhbCBGaWx0ZXIgc2V0dGluZ3Ncblx0XHR0aGlzLnZmRW5hYmxlZCA9ICEhdGhpcy52aXN1YWxGaWx0ZXIgJiYgISh0aGlzLmlkUHJlZml4ICYmIHRoaXMuaWRQcmVmaXguaW5kZXhPZihcIkFkYXB0YXRpb25cIikgPiAtMSk7XG5cdFx0dGhpcy52ZklkID0gdGhpcy52ZkVuYWJsZWQgPyBnZW5lcmF0ZShbdGhpcy5pZFByZWZpeCwgcHJvcGVydHlOYW1lLCBcIlZpc3VhbEZpbHRlclwiXSkgOiB1bmRlZmluZWQ7XG5cblx0XHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblx0XHQvLyBUT0RPOiBuZWVkIHRvIGNoYW5nZSBvcGVyYXRpb25zIGZyb20gTWV0YU1vZGVsIHRvIENvbnZlcnRlcnMuXG5cdFx0Ly8gVGhpcyBtYWlubHkgaW5jbHVkZWQgY2hhbmdpbmcgY2hhbmdpbmcgZ2V0RmlsdGVyUmVzdHJpY3Rpb25zIG9wZXJhdGlvbnMgZnJvbSBtZXRhTW9kZWwgdG8gY29udmVydGVyc1xuXHRcdGNvbnN0IHByb3BlcnR5Q29udGV4dCA9IHRoaXMucHJvcGVydHksXG5cdFx0XHRtb2RlbDogTWV0YU1vZGVsID0gcHJvcGVydHlDb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHR2aFByb3BlcnR5UGF0aDogc3RyaW5nID0gRmllbGRIZWxwZXIudmFsdWVIZWxwUHJvcGVydHlGb3JGaWx0ZXJGaWVsZChwcm9wZXJ0eUNvbnRleHQpLFxuXHRcdFx0ZmlsdGVyYWJsZSA9IENvbW1vbkhlbHBlci5pc1Byb3BlcnR5RmlsdGVyYWJsZShwcm9wZXJ0eUNvbnRleHQpLFxuXHRcdFx0cHJvcGVydHlPYmplY3QgPSBwcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KCksXG5cdFx0XHRwcm9wZXJ0eUludGVyZmFjZSA9IHsgY29udGV4dDogcHJvcGVydHlDb250ZXh0IH0gYXMgQ29tcHV0ZWRBbm5vdGF0aW9uSW50ZXJmYWNlO1xuXG5cdFx0dGhpcy5kaXNwbGF5ID0gZ2V0RmlsdGVyRmllbGREaXNwbGF5Rm9ybWF0KGRhdGFNb2RlbFBhdGgsIHByb3BlcnR5Q29udmVydGVkLCBwcm9wZXJ0eUludGVyZmFjZSk7XG5cdFx0dGhpcy5pc0ZpbHRlcmFibGUgPSAhKGZpbHRlcmFibGUgPT09IGZhbHNlIHx8IGZpbHRlcmFibGUgPT09IFwiZmFsc2VcIik7XG5cdFx0dGhpcy5tYXhDb25kaXRpb25zID0gRmlsdGVyRmllbGRIZWxwZXIubWF4Q29uZGl0aW9ucyhwcm9wZXJ0eU9iamVjdCwgcHJvcGVydHlJbnRlcmZhY2UpO1xuXHRcdHRoaXMuZGF0YVR5cGVDb25zdHJhaW50cyA9IEZpbHRlckZpZWxkSGVscGVyLmNvbnN0cmFpbnRzKHByb3BlcnR5T2JqZWN0LCBwcm9wZXJ0eUludGVyZmFjZSk7XG5cdFx0dGhpcy5kYXRhVHlwZUZvcm1hdE9wdGlvbnMgPSBGaWx0ZXJGaWVsZEhlbHBlci5mb3JtYXRPcHRpb25zKHByb3BlcnR5T2JqZWN0LCBwcm9wZXJ0eUludGVyZmFjZSk7XG5cdFx0dGhpcy5yZXF1aXJlZCA9IEZpbHRlckZpZWxkSGVscGVyLmlzUmVxdWlyZWRJbkZpbHRlcihwcm9wZXJ0eU9iamVjdCwgcHJvcGVydHlJbnRlcmZhY2UpO1xuXHRcdHRoaXMub3BlcmF0b3JzID0gRmllbGRIZWxwZXIub3BlcmF0b3JzKFxuXHRcdFx0cHJvcGVydHlDb250ZXh0LFxuXHRcdFx0cHJvcGVydHlPYmplY3QsXG5cdFx0XHR0aGlzLnVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0dGhpcy5zZXR0aW5ncyB8fCBcIlwiLFxuXHRcdFx0dGhpcy5jb250ZXh0UGF0aC5nZXRQYXRoKClcblx0XHQpO1xuXG5cdFx0Ly8gVmFsdWUgSGVscCBzZXR0aW5nc1xuXHRcdC8vIFRPRE86IFRoaXMgbmVlZHMgdG8gYmUgdXBkYXRlZCB3aGVuIFZIIG1hY3JvIGlzIGNvbnZlcnRlZCB0byAyLjBcblx0XHRjb25zdCB2aFByb3BlcnR5ID0gbW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQodmhQcm9wZXJ0eVBhdGgpIGFzIENvbnRleHQ7XG5cdFx0Y29uc3QgdmhQcm9wZXJ0eU9iamVjdCA9IHZoUHJvcGVydHkuZ2V0T2JqZWN0KCkgYXMgTWV0YU1vZGVsQ29udGV4dCxcblx0XHRcdHZoUHJvcGVydHlJbnRlcmZhY2UgPSB7IGNvbnRleHQ6IHZoUHJvcGVydHkgfSxcblx0XHRcdHJlbGF0aXZlVmhQcm9wZXJ0eVBhdGggPSBnZXRSZWxhdGl2ZVByb3BlcnR5UGF0aCh2aFByb3BlcnR5T2JqZWN0LCB2aFByb3BlcnR5SW50ZXJmYWNlKSxcblx0XHRcdHJlbGF0aXZlUHJvcGVydHlQYXRoID0gZ2V0UmVsYXRpdmVQcm9wZXJ0eVBhdGgocHJvcGVydHlPYmplY3QsIHByb3BlcnR5SW50ZXJmYWNlKTtcblx0XHR0aGlzLmZpZWxkSGVscFByb3BlcnR5ID0gRmllbGRIZWxwZXIuZ2V0RmllbGRIZWxwUHJvcGVydHlGb3JGaWx0ZXJGaWVsZChcblx0XHRcdHByb3BlcnR5Q29udGV4dCxcblx0XHRcdHByb3BlcnR5T2JqZWN0LFxuXHRcdFx0cHJvcGVydHlPYmplY3QuJFR5cGUsXG5cdFx0XHR0aGlzLnZoSWRQcmVmaXgsXG5cdFx0XHRyZWxhdGl2ZVByb3BlcnR5UGF0aCxcblx0XHRcdHJlbGF0aXZlVmhQcm9wZXJ0eVBhdGgsXG5cdFx0XHRmaXhlZFZhbHVlcyxcblx0XHRcdHRoaXMudXNlU2VtYW50aWNEYXRlUmFuZ2Vcblx0XHQpO1xuXG5cdFx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cdH1cblxuXHRnZXRWaXN1YWxGaWx0ZXJDb250ZW50KCkge1xuXHRcdGxldCB2aXN1YWxGaWx0ZXJPYmplY3QgPSB0aGlzLnZpc3VhbEZpbHRlcixcblx0XHRcdHZmWE1MID0geG1sYGA7XG5cdFx0aWYgKCF0aGlzLnZmRW5hYmxlZCB8fCAhdmlzdWFsRmlsdGVyT2JqZWN0KSB7XG5cdFx0XHRyZXR1cm4gdmZYTUw7XG5cdFx0fVxuXHRcdGlmICgodmlzdWFsRmlsdGVyT2JqZWN0IGFzIENvbnRleHQpPy5pc0E/LihTQVBfVUlfTU9ERUxfQ09OVEVYVCkpIHtcblx0XHRcdHZpc3VhbEZpbHRlck9iamVjdCA9ICh2aXN1YWxGaWx0ZXJPYmplY3QgYXMgQ29udGV4dCkuZ2V0T2JqZWN0KCkgYXMgVmlzdWFsRmlsdGVycztcblx0XHR9XG5cblx0XHRjb25zdCB7XG5cdFx0XHRjb250ZXh0UGF0aCxcblx0XHRcdHByZXNlbnRhdGlvbkFubm90YXRpb24sXG5cdFx0XHRvdXRQYXJhbWV0ZXIsXG5cdFx0XHRpblBhcmFtZXRlcnMsXG5cdFx0XHR2YWx1ZWxpc3RQcm9wZXJ0eSxcblx0XHRcdHNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0bXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkLFxuXHRcdFx0cmVxdWlyZWQsXG5cdFx0XHRyZXF1aXJlZFByb3BlcnRpZXMgPSBbXSxcblx0XHRcdHNob3dPdmVybGF5SW5pdGlhbGx5LFxuXHRcdFx0cmVuZGVyTGluZUNoYXJ0XG5cdFx0fSA9IHZpc3VhbEZpbHRlck9iamVjdDtcblx0XHR2ZlhNTCA9IHhtbGBcblx0XHRcdFx0PG1hY3JvOlZpc3VhbEZpbHRlclxuXHRcdFx0XHRcdGlkPVwiJHt0aGlzLnZmSWR9XCJcblx0XHRcdFx0XHRjb250ZXh0UGF0aD1cIiR7Y29udGV4dFBhdGh9XCJcblx0XHRcdFx0XHRtZXRhUGF0aD1cIiR7cHJlc2VudGF0aW9uQW5ub3RhdGlvbn1cIlxuXHRcdFx0XHRcdG91dFBhcmFtZXRlcj1cIiR7b3V0UGFyYW1ldGVyfVwiXG5cdFx0XHRcdFx0aW5QYXJhbWV0ZXJzPVwiJHtpblBhcmFtZXRlcnN9XCJcblx0XHRcdFx0XHR2YWx1ZWxpc3RQcm9wZXJ0eT1cIiR7dmFsdWVsaXN0UHJvcGVydHl9XCJcblx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbj1cIiR7c2VsZWN0aW9uVmFyaWFudEFubm90YXRpb259XCJcblx0XHRcdFx0XHRtdWx0aXBsZVNlbGVjdGlvbkFsbG93ZWQ9XCIke211bHRpcGxlU2VsZWN0aW9uQWxsb3dlZH1cIlxuXHRcdFx0XHRcdHJlcXVpcmVkPVwiJHtyZXF1aXJlZH1cIlxuXHRcdFx0XHRcdHJlcXVpcmVkUHJvcGVydGllcz1cIiR7Q29tbW9uSGVscGVyLnN0cmluZ2lmeUN1c3RvbURhdGEocmVxdWlyZWRQcm9wZXJ0aWVzKX1cIlxuXHRcdFx0XHRcdHNob3dPdmVybGF5SW5pdGlhbGx5PVwiJHtzaG93T3ZlcmxheUluaXRpYWxseX1cIlxuXHRcdFx0XHRcdHJlbmRlckxpbmVDaGFydD1cIiR7cmVuZGVyTGluZUNoYXJ0fVwiXG5cdFx0XHRcdFx0ZmlsdGVyQmFyRW50aXR5VHlwZT1cIiR7Y29udGV4dFBhdGh9XCJcblx0XHRcdFx0Lz5cblx0XHRcdGA7XG5cblx0XHRyZXR1cm4gdmZYTUw7XG5cdH1cblxuXHRhc3luYyBnZXRUZW1wbGF0ZSgpIHtcblx0XHRsZXQgeG1sUmV0ID0gYGA7XG5cdFx0aWYgKHRoaXMuaXNGaWx0ZXJhYmxlKSB7XG5cdFx0XHRsZXQgZGlzcGxheTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGRpc3BsYXkgPSBhd2FpdCB0aGlzLmRpc3BsYXk7XG5cdFx0XHR9IGNhdGNoIChlcnI6IHVua25vd24pIHtcblx0XHRcdFx0TG9nLmVycm9yKGBGRSA6IEZpbHRlckZpZWxkIEJ1aWxkaW5nQmxvY2sgOiBFcnJvciBmZXRjaGluZyBkaXNwbGF5IHByb3BlcnR5IGZvciAke3RoaXMuc291cmNlUGF0aH0gOiAke2Vycn1gKTtcblx0XHRcdH1cblxuXHRcdFx0eG1sUmV0ID0geG1sYFxuXHRcdFx0XHQ8bWRjOkZpbHRlckZpZWxkXG5cdFx0XHRcdFx0eG1sbnM6bWRjPVwic2FwLnVpLm1kY1wiXG5cdFx0XHRcdFx0eG1sbnM6bWFjcm89XCJzYXAuZmUubWFjcm9zXCJcblx0XHRcdFx0XHR4bWxuczp1bml0dGVzdD1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L3ByZXByb2Nlc3NvcmV4dGVuc2lvbi9zYXAuZmUudW5pdHRlc3RpbmcvMVwiXG5cdFx0XHRcdFx0eG1sbnM6Y3VzdG9tRGF0YT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIlxuXHRcdFx0XHRcdHVuaXR0ZXN0OmlkPVwiVW5pdFRlc3Q6OkZpbHRlckZpZWxkXCJcblx0XHRcdFx0XHRjdXN0b21EYXRhOnNvdXJjZVBhdGg9XCIke3RoaXMuc291cmNlUGF0aH1cIlxuXHRcdFx0XHRcdGlkPVwiJHt0aGlzLmNvbnRyb2xJZH1cIlxuXHRcdFx0XHRcdGRlbGVnYXRlPVwie25hbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkQmFzZURlbGVnYXRlJywgcGF5bG9hZDp7aXNGaWx0ZXJGaWVsZDp0cnVlfX1cIlxuXHRcdFx0XHRcdGxhYmVsPVwiJHt0aGlzLmxhYmVsfVwiXG5cdFx0XHRcdFx0ZGF0YVR5cGU9XCIke3RoaXMuZGF0YVR5cGV9XCJcblx0XHRcdFx0XHRkaXNwbGF5PVwiJHtkaXNwbGF5fVwiXG5cdFx0XHRcdFx0bWF4Q29uZGl0aW9ucz1cIiR7dGhpcy5tYXhDb25kaXRpb25zfVwiXG5cdFx0XHRcdFx0ZmllbGRIZWxwPVwiJHt0aGlzLmZpZWxkSGVscFByb3BlcnR5fVwiXG5cdFx0XHRcdFx0Y29uZGl0aW9ucz1cIiR7dGhpcy5jb25kaXRpb25zQmluZGluZ31cIlxuXHRcdFx0XHRcdGRhdGFUeXBlQ29uc3RyYWludHM9XCIke3RoaXMuZGF0YVR5cGVDb25zdHJhaW50c31cIlxuXHRcdFx0XHRcdGRhdGFUeXBlRm9ybWF0T3B0aW9ucz1cIiR7dGhpcy5kYXRhVHlwZUZvcm1hdE9wdGlvbnN9XCJcblx0XHRcdFx0XHRyZXF1aXJlZD1cIiR7dGhpcy5yZXF1aXJlZH1cIlxuXHRcdFx0XHRcdG9wZXJhdG9ycz1cIiR7dGhpcy5vcGVyYXRvcnN9XCJcblx0XHRcdFx0XHRwbGFjZWhvbGRlcj1cIiR7dGhpcy5wbGFjZWhvbGRlcn1cIlxuXG5cdFx0XHRcdD5cblx0XHRcdFx0XHQke3RoaXMudmZFbmFibGVkID8gdGhpcy5nZXRWaXN1YWxGaWx0ZXJDb250ZW50KCkgOiB4bWxgYH1cblx0XHRcdFx0PC9tZGM6RmlsdGVyRmllbGQ+XG5cdFx0XHRgO1xuXHRcdH1cblxuXHRcdHJldHVybiB4bWxSZXQ7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFzQ3FCQSxXQUFXO0VBbEJoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkEsT0FjQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxhQUFhO0lBQ25CQyxTQUFTLEVBQUU7RUFDWixDQUFDLENBQUMsVUFLQUMsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxzQkFBc0I7SUFDNUJDLFFBQVEsRUFBRSxJQUFJO0lBQ2RDLFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQU1ESCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBTURILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCRSxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREgsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxRQUFRO0lBQ2RHLFlBQVksRUFBRSxhQUFhO0lBQzNCRCxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREgsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxRQUFRO0lBQ2RHLFlBQVksRUFBRSxzQkFBc0I7SUFDcENELFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQU1ESCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLFNBQVM7SUFDZkcsWUFBWSxFQUFFLElBQUk7SUFDbEJELFFBQVEs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O0FBQ3hDLDRCQUE0QmhGLFdBQVk7QUFDeEM7QUFDQSxJQUFJO01BRUYsT0FBT29FLEtBQUs7SUFDYixDQUFDO0lBQUEsT0FFS2MsV0FBVyxHQUFqQiw2QkFBb0I7TUFDbkIsSUFBSUMsTUFBTSxHQUFJLEVBQUM7TUFDZixJQUFJLElBQUksQ0FBQ3ZDLFlBQVksRUFBRTtRQUN0QixJQUFJRixPQUFPO1FBQ1gsSUFBSTtVQUNIQSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUNBLE9BQU87UUFDN0IsQ0FBQyxDQUFDLE9BQU8wQyxHQUFZLEVBQUU7VUFDdEJDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFFLHdFQUF1RSxJQUFJLENBQUM3RSxVQUFXLE1BQUsyRSxHQUFJLEVBQUMsQ0FBQztRQUM5RztRQUVBRCxNQUFNLEdBQUdkLEdBQUk7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLElBQUksQ0FBQzVELFVBQVc7QUFDOUMsV0FBVyxJQUFJLENBQUNILFNBQVU7QUFDMUI7QUFDQSxjQUFjLElBQUksQ0FBQ1ksS0FBTTtBQUN6QixpQkFBaUIsSUFBSSxDQUFDUCxRQUFTO0FBQy9CLGdCQUFnQitCLE9BQVE7QUFDeEIsc0JBQXNCLElBQUksQ0FBQ0csYUFBYztBQUN6QyxrQkFBa0IsSUFBSSxDQUFDaUIsaUJBQWtCO0FBQ3pDLG1CQUFtQixJQUFJLENBQUMxQyxpQkFBa0I7QUFDMUMsNEJBQTRCLElBQUksQ0FBQzBCLG1CQUFvQjtBQUNyRCw4QkFBOEIsSUFBSSxDQUFDRSxxQkFBc0I7QUFDekQsaUJBQWlCLElBQUksQ0FBQzVELFFBQVM7QUFDL0Isa0JBQWtCLElBQUksQ0FBQytELFNBQVU7QUFDakMsb0JBQW9CLElBQUksQ0FBQzdCLFdBQVk7QUFDckM7QUFDQTtBQUNBLE9BQU8sSUFBSSxDQUFDRSxTQUFTLEdBQUcsSUFBSSxDQUFDMEMsc0JBQXNCLEVBQUUsR0FBR0csR0FBSSxFQUFFO0FBQzlEO0FBQ0EsSUFBSTtNQUNGO01BRUEsT0FBT2MsTUFBTTtJQUNkLENBQUM7SUFBQTtFQUFBLEVBaFR1Q0ksaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9