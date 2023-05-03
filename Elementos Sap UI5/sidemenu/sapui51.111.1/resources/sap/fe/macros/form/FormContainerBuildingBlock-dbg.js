/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/converters/controls/Common/Form", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/templating/DataModelPathHelper"], function (BuildingBlock, Form, MetaModelConverter, DataModelPathHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var _exports = {};
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var createFormDefinition = Form.createFormDefinition;
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
  let FormContainerBuildingBlock = (
  /**
   * @classdesc
   * Building block for creating a FormContainer based on the provided OData V4 metadata.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:FormContainer
   *   id="SomeId"
   *   entitySet="{entitySet>}"
   *   dataFieldCollection ="{dataFieldCollection>}"
   *   title="someTitle"
   *   navigationPath="{ToSupplier}"
   *   visible=true
   *   onChange=".handlers.onFieldValueChange"
   * /&gt;
   * </pre>
   * @class sap.fe.macros.FormContainer
   * @hideconstructor
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "FormContainer",
    namespace: "sap.fe.macros",
    fragment: "sap.fe.macros.form.FormContainer"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true,
    $kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec6 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec7 = blockAttribute({
    type: "boolean"
  }), _dec8 = blockAttribute({
    type: "string"
  }), _dec9 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true,
    defaultValue: "Auto"
  }), _dec10 = blockAttribute({
    type: "string"
  }), _dec11 = blockAttribute({
    type: "string"
  }), _dec12 = blockAttribute({
    type: "string",
    defaultValue: "sap/fe/macros/form/FormContainer.designtime"
  }), _dec13 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec14 = blockAggregation({
    type: "sap.fe.macros.form.FormElement"
  }), _dec15 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormContainerBuildingBlock, _BuildingBlockBase);
    /**
     * Metadata path to the dataFieldCollection
     */

    /**
     * Control whether the form is in displayMode or not
     */

    /**
     * Title of the form container
     */

    /**
     * Defines the "aria-level" of the form title, titles of internally used form containers are nested subsequently
     */

    /**
     * Binding the form container using a navigation path
     */

    /**
     * Binding the visibility of the form container using an expression binding or Boolean
     */

    /**
     * Flex designtime settings to be applied
     */

    // Just proxied down to the Field may need to see if needed or not

    function FormContainerBuildingBlock(oProps, externalConfiguration, mSettings) {
      var _this;
      _this = _BuildingBlockBase.call(this, oProps) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataFieldCollection", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "displayMode", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "titleLevel", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPath", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "designtimeSettings", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formElements", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor14, _assertThisInitialized(_this));
      _this.entitySet = oProps.contextPath;
      if (_this.formElements && Object.keys(_this.formElements).length > 0) {
        const oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
        const mExtraSettings = {};
        let oFacetDefinition = oContextObjectPath.targetObject;
        // Wrap the facet in a fake Facet annotation
        oFacetDefinition = {
          $Type: "com.sap.vocabularies.UI.v1.ReferenceFacet",
          Label: oFacetDefinition.Label,
          Target: {
            $target: oFacetDefinition,
            fullyQualifiedName: oFacetDefinition.fullyQualifiedName,
            path: "",
            term: "",
            type: "AnnotationPath",
            value: getContextRelativeTargetObjectPath(oContextObjectPath)
          },
          annotations: {},
          fullyQualifiedName: oFacetDefinition.fullyQualifiedName
        };
        mExtraSettings[oFacetDefinition.Target.value] = {
          fields: _this.formElements
        };
        const oConverterContext = _this.getConverterContext(oContextObjectPath, /*this.contextPath*/undefined, mSettings, mExtraSettings);
        const oFormDefinition = createFormDefinition(oFacetDefinition, "true", oConverterContext);
        _this.dataFieldCollection = oFormDefinition.formContainers[0].formElements;
      }
      return _this;
    }
    _exports = FormContainerBuildingBlock;
    return FormContainerBuildingBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "dataFieldCollection", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "displayMode", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "titleLevel", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "navigationPath", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "designtimeSettings", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "formElements", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FormContainerBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtQ29udGFpbmVyQnVpbGRpbmdCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImlzUHVibGljIiwiJGtpbmQiLCJkZWZhdWx0VmFsdWUiLCJibG9ja0FnZ3JlZ2F0aW9uIiwiYmxvY2tFdmVudCIsIm9Qcm9wcyIsImV4dGVybmFsQ29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsImVudGl0eVNldCIsImNvbnRleHRQYXRoIiwiZm9ybUVsZW1lbnRzIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsIm9Db250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm1ldGFQYXRoIiwibUV4dHJhU2V0dGluZ3MiLCJvRmFjZXREZWZpbml0aW9uIiwidGFyZ2V0T2JqZWN0IiwiJFR5cGUiLCJMYWJlbCIsIlRhcmdldCIsIiR0YXJnZXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJwYXRoIiwidGVybSIsInZhbHVlIiwiZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCIsImFubm90YXRpb25zIiwiZmllbGRzIiwib0NvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0IiwidW5kZWZpbmVkIiwib0Zvcm1EZWZpbml0aW9uIiwiY3JlYXRlRm9ybURlZmluaXRpb24iLCJkYXRhRmllbGRDb2xsZWN0aW9uIiwiZm9ybUNvbnRhaW5lcnMiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRm9ybUNvbnRhaW5lckJ1aWxkaW5nQmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0YmxvY2tBZ2dyZWdhdGlvbixcblx0YmxvY2tBdHRyaWJ1dGUsXG5cdGJsb2NrRXZlbnQsXG5cdEJ1aWxkaW5nQmxvY2tCYXNlLFxuXHRkZWZpbmVCdWlsZGluZ0Jsb2NrXG59IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgeyBjcmVhdGVGb3JtRGVmaW5pdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9Gb3JtXCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZU9iamVjdCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxuLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGb3JtQ29udGFpbmVyIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBPRGF0YSBWNCBtZXRhZGF0YS5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86Rm9ybUNvbnRhaW5lclxuICogICBpZD1cIlNvbWVJZFwiXG4gKiAgIGVudGl0eVNldD1cIntlbnRpdHlTZXQ+fVwiXG4gKiAgIGRhdGFGaWVsZENvbGxlY3Rpb24gPVwie2RhdGFGaWVsZENvbGxlY3Rpb24+fVwiXG4gKiAgIHRpdGxlPVwic29tZVRpdGxlXCJcbiAqICAgbmF2aWdhdGlvblBhdGg9XCJ7VG9TdXBwbGllcn1cIlxuICogICB2aXNpYmxlPXRydWVcbiAqICAgb25DaGFuZ2U9XCIuaGFuZGxlcnMub25GaWVsZFZhbHVlQ2hhbmdlXCJcbiAqIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLkZvcm1Db250YWluZXJcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHsgbmFtZTogXCJGb3JtQ29udGFpbmVyXCIsIG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsIGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MuZm9ybS5Gb3JtQ29udGFpbmVyXCIgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcm1Db250YWluZXJCdWlsZGluZ0Jsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdCRraW5kOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0fSlcblx0ZW50aXR5U2V0ITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRtZXRhUGF0aCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGRhdGFGaWVsZENvbGxlY3Rpb25cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdGRhdGFGaWVsZENvbGxlY3Rpb24/OiBhbnk7XG5cblx0LyoqXG5cdCAqIENvbnRyb2wgd2hldGhlciB0aGUgZm9ybSBpcyBpbiBkaXNwbGF5TW9kZSBvciBub3Rcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0ZGlzcGxheU1vZGU6IGJvb2xlYW4gPSBmYWxzZTtcblx0LyoqXG5cdCAqIFRpdGxlIG9mIHRoZSBmb3JtIGNvbnRhaW5lclxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR0aXRsZT86IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIFwiYXJpYS1sZXZlbFwiIG9mIHRoZSBmb3JtIHRpdGxlLCB0aXRsZXMgb2YgaW50ZXJuYWxseSB1c2VkIGZvcm0gY29udGFpbmVycyBhcmUgbmVzdGVkIHN1YnNlcXVlbnRseVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkuY29yZS5UaXRsZUxldmVsXCIsIGlzUHVibGljOiB0cnVlLCBkZWZhdWx0VmFsdWU6IFwiQXV0b1wiIH0pXG5cdHRpdGxlTGV2ZWw/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEJpbmRpbmcgdGhlIGZvcm0gY29udGFpbmVyIHVzaW5nIGEgbmF2aWdhdGlvbiBwYXRoXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG5hdmlnYXRpb25QYXRoPzogc3RyaW5nO1xuXHQvKipcblx0ICogQmluZGluZyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZm9ybSBjb250YWluZXIgdXNpbmcgYW4gZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dmlzaWJsZT86IHN0cmluZztcblx0LyoqXG5cdCAqIEZsZXggZGVzaWdudGltZSBzZXR0aW5ncyB0byBiZSBhcHBsaWVkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0VmFsdWU6IFwic2FwL2ZlL21hY3Jvcy9mb3JtL0Zvcm1Db250YWluZXIuZGVzaWdudGltZVwiIH0pXG5cdGRlc2lnbnRpbWVTZXR0aW5ncyE6IHN0cmluZztcblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiIH0pXG5cdGFjdGlvbnMhOiBhbnlbXTtcblxuXHRAYmxvY2tBZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5mb3JtLkZvcm1FbGVtZW50XCIgfSlcblx0Zm9ybUVsZW1lbnRzOiBSZWNvcmQ8c3RyaW5nLCBDb25maWd1cmFibGVPYmplY3Q+ID0ge307XG5cblx0Ly8gSnVzdCBwcm94aWVkIGRvd24gdG8gdGhlIEZpZWxkIG1heSBuZWVkIHRvIHNlZSBpZiBuZWVkZWQgb3Igbm90XG5cdEBibG9ja0V2ZW50KClcblx0b25DaGFuZ2UhOiBGdW5jdGlvbjtcblxuXHRkZWZpbml0aW9uOiBhbnk7XG5cdGNvbnN0cnVjdG9yKG9Qcm9wczogUHJvcGVydGllc09mPEZvcm1Db250YWluZXJCdWlsZGluZ0Jsb2NrPiwgZXh0ZXJuYWxDb25maWd1cmF0aW9uOiBhbnksIG1TZXR0aW5nczogYW55KSB7XG5cdFx0c3VwZXIob1Byb3BzKTtcblx0XHR0aGlzLmVudGl0eVNldCA9IG9Qcm9wcy5jb250ZXh0UGF0aCE7XG5cdFx0aWYgKHRoaXMuZm9ybUVsZW1lbnRzICYmIE9iamVjdC5rZXlzKHRoaXMuZm9ybUVsZW1lbnRzKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5tZXRhUGF0aCwgdGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0XHRjb25zdCBtRXh0cmFTZXR0aW5nczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXHRcdFx0bGV0IG9GYWNldERlZmluaXRpb24gPSBvQ29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdFx0Ly8gV3JhcCB0aGUgZmFjZXQgaW4gYSBmYWtlIEZhY2V0IGFubm90YXRpb25cblx0XHRcdG9GYWNldERlZmluaXRpb24gPSB7XG5cdFx0XHRcdCRUeXBlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlZmVyZW5jZUZhY2V0XCIsXG5cdFx0XHRcdExhYmVsOiBvRmFjZXREZWZpbml0aW9uLkxhYmVsLFxuXHRcdFx0XHRUYXJnZXQ6IHtcblx0XHRcdFx0XHQkdGFyZ2V0OiBvRmFjZXREZWZpbml0aW9uLFxuXHRcdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogb0ZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRcdFx0cGF0aDogXCJcIixcblx0XHRcdFx0XHR0ZXJtOiBcIlwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiQW5ub3RhdGlvblBhdGhcIixcblx0XHRcdFx0XHR2YWx1ZTogZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvQ29udGV4dE9iamVjdFBhdGgpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFubm90YXRpb25zOiB7fSxcblx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBvRmFjZXREZWZpbml0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0fTtcblx0XHRcdG1FeHRyYVNldHRpbmdzW29GYWNldERlZmluaXRpb24uVGFyZ2V0LnZhbHVlXSA9IHsgZmllbGRzOiB0aGlzLmZvcm1FbGVtZW50cyB9O1xuXHRcdFx0Y29uc3Qgb0NvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQoXG5cdFx0XHRcdG9Db250ZXh0T2JqZWN0UGF0aCxcblx0XHRcdFx0Lyp0aGlzLmNvbnRleHRQYXRoKi8gdW5kZWZpbmVkLFxuXHRcdFx0XHRtU2V0dGluZ3MsXG5cdFx0XHRcdG1FeHRyYVNldHRpbmdzXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3Qgb0Zvcm1EZWZpbml0aW9uID0gY3JlYXRlRm9ybURlZmluaXRpb24ob0ZhY2V0RGVmaW5pdGlvbiwgXCJ0cnVlXCIsIG9Db252ZXJ0ZXJDb250ZXh0KTtcblxuXHRcdFx0dGhpcy5kYXRhRmllbGRDb2xsZWN0aW9uID0gb0Zvcm1EZWZpbml0aW9uLmZvcm1Db250YWluZXJzWzBdLmZvcm1FbGVtZW50cztcblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFxQ3FCQSwwQkFBMEI7RUF2Qi9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBckJBLE9Bc0JDQyxtQkFBbUIsQ0FBQztJQUFFQyxJQUFJLEVBQUUsZUFBZTtJQUFFQyxTQUFTLEVBQUUsZUFBZTtJQUFFQyxRQUFRLEVBQUU7RUFBbUMsQ0FBQyxDQUFDLFVBRXZIQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBR2xDRCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFLElBQUk7SUFDZEMsS0FBSyxFQUFFLENBQUMsV0FBVyxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxXQUFXO0VBQ3JFLENBQUMsQ0FBQyxVQUVESixjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCRSxRQUFRLEVBQUUsSUFBSTtJQUNkRCxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREYsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQU1ERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBS0RELGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFLbENELGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsd0JBQXdCO0lBQUVFLFFBQVEsRUFBRSxJQUFJO0lBQUVFLFlBQVksRUFBRTtFQUFPLENBQUMsQ0FBQyxXQU14RkwsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxXQUtsQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxXQUtsQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVJLFlBQVksRUFBRTtFQUE4QyxDQUFDLENBQUMsV0FFL0ZMLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBdUIsQ0FBQyxDQUFDLFdBR2hESyxnQkFBZ0IsQ0FBQztJQUFFTCxJQUFJLEVBQUU7RUFBaUMsQ0FBQyxDQUFDLFdBSTVETSxVQUFVLEVBQUU7SUFBQTtJQWhEYjtBQUNEO0FBQ0E7O0lBTUM7QUFDRDtBQUNBOztJQUtDO0FBQ0Q7QUFDQTs7SUFHQztBQUNEO0FBQ0E7O0lBSUM7QUFDRDtBQUNBOztJQUdDO0FBQ0Q7QUFDQTs7SUFHQztBQUNEO0FBQ0E7O0lBU0M7O0lBS0Esb0NBQVlDLE1BQWdELEVBQUVDLHFCQUEwQixFQUFFQyxTQUFjLEVBQUU7TUFBQTtNQUN6RyxzQ0FBTUYsTUFBTSxDQUFDO01BQUM7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUNkLE1BQUtHLFNBQVMsR0FBR0gsTUFBTSxDQUFDSSxXQUFZO01BQ3BDLElBQUksTUFBS0MsWUFBWSxJQUFJQyxNQUFNLENBQUNDLElBQUksQ0FBQyxNQUFLRixZQUFZLENBQUMsQ0FBQ0csTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNuRSxNQUFNQyxrQkFBa0IsR0FBR0MsMkJBQTJCLENBQUMsTUFBS0MsUUFBUSxFQUFFLE1BQUtQLFdBQVcsQ0FBQztRQUN2RixNQUFNUSxjQUFtQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxJQUFJQyxnQkFBZ0IsR0FBR0osa0JBQWtCLENBQUNLLFlBQVk7UUFDdEQ7UUFDQUQsZ0JBQWdCLEdBQUc7VUFDbEJFLEtBQUssRUFBRSwyQ0FBMkM7VUFDbERDLEtBQUssRUFBRUgsZ0JBQWdCLENBQUNHLEtBQUs7VUFDN0JDLE1BQU0sRUFBRTtZQUNQQyxPQUFPLEVBQUVMLGdCQUFnQjtZQUN6Qk0sa0JBQWtCLEVBQUVOLGdCQUFnQixDQUFDTSxrQkFBa0I7WUFDdkRDLElBQUksRUFBRSxFQUFFO1lBQ1JDLElBQUksRUFBRSxFQUFFO1lBQ1I1QixJQUFJLEVBQUUsZ0JBQWdCO1lBQ3RCNkIsS0FBSyxFQUFFQyxrQ0FBa0MsQ0FBQ2Qsa0JBQWtCO1VBQzdELENBQUM7VUFDRGUsV0FBVyxFQUFFLENBQUMsQ0FBQztVQUNmTCxrQkFBa0IsRUFBRU4sZ0JBQWdCLENBQUNNO1FBQ3RDLENBQUM7UUFDRFAsY0FBYyxDQUFDQyxnQkFBZ0IsQ0FBQ0ksTUFBTSxDQUFDSyxLQUFLLENBQUMsR0FBRztVQUFFRyxNQUFNLEVBQUUsTUFBS3BCO1FBQWEsQ0FBQztRQUM3RSxNQUFNcUIsaUJBQWlCLEdBQUcsTUFBS0MsbUJBQW1CLENBQ2pEbEIsa0JBQWtCLEVBQ2xCLG9CQUFxQm1CLFNBQVMsRUFDOUIxQixTQUFTLEVBQ1RVLGNBQWMsQ0FDZDtRQUNELE1BQU1pQixlQUFlLEdBQUdDLG9CQUFvQixDQUFDakIsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFYSxpQkFBaUIsQ0FBQztRQUV6RixNQUFLSyxtQkFBbUIsR0FBR0YsZUFBZSxDQUFDRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMzQixZQUFZO01BQzFFO01BQUM7SUFDRjtJQUFDO0lBQUE7RUFBQSxFQTVHc0Q0QixpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FxQ2pELEtBQUs7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQStCdUIsQ0FBQyxDQUFDO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==