/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/controls/Common/Form", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ID", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/form/FormHelper", "sap/ui/model/odata/v4/AnnotationHelper"], function (BuildingBlock, BuildingBlockRuntime, Form, BindingHelper, ID, MetaModelConverter, BindingToolkit, DataModelPathHelper, FormHelper, AnnotationHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13;
  var _exports = {};
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getFormContainerID = ID.getFormContainerID;
  var UI = BindingHelper.UI;
  var createFormDefinition = Form.createFormDefinition;
  var xml = BuildingBlockRuntime.xml;
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
  let FormBuildingBlock = (
  /**
   * Building block for creating a Form based on the metadata provided by OData V4.
   * <br>
   * It is designed to work based on a FieldGroup annotation but can also work if you provide a ReferenceFacet or a CollectionFacet
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Form id="MyForm" metaPath="@com.sap.vocabularies.UI.v1.FieldGroup#GeneralInformation" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Form
   */
  _dec = defineBuildingBlock({
    name: "Form",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true,
    $kind: ["EntitySet", "NavigationProperty", "EntityType"]
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec6 = blockAttribute({
    type: "boolean"
  }), _dec7 = blockAttribute({
    type: "boolean",
    defaultValue: true
  }), _dec8 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true,
    defaultValue: "Auto"
  }), _dec10 = blockAttribute({
    type: "string"
  }), _dec11 = blockAttribute({
    type: "string",
    defaultValue: "true"
  }), _dec12 = blockEvent(), _dec13 = blockAggregation({
    type: "sap.fe.macros.form.FormElement",
    isPublic: true,
    slot: "formElements",
    isDefault: true
  }), _dec14 = blockAttribute({
    type: "object",
    isPublic: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormBuildingBlock, _BuildingBlockBase);
    /**
     * The manifest defined form containers to be shown in the action area of the table
     */

    /**
     * Control the rendering of the form container labels
     */

    /**
     * Toggle Preview: Part of Preview / Preview via 'Show More' Button
     */

    // Other public properties or overrides

    /**
     * Defines the "aria-level" of the form title, titles of internally used form containers are nested subsequently
     */

    /**
     * 	If set to false, the Form is not rendered.
     */

    // Independent from the form title, can be a bit confusing in standalone usage at is not showing anything by default

    // Just proxied down to the Field may need to see if needed or not

    /**
     * Defines the layout to be used within the form.
     * It defaults to the ColumnLayout, but you can also use a ResponsiveGridLayout.
     * All the properties of the ResponsiveGridLayout can be added to the configuration.
     */

    function FormBuildingBlock(oProps, configuration, mSettings) {
      var _this;
      _this = _BuildingBlockBase.call(this, oProps, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formContainers", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useFormContainerLabels", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "partOfPreview", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "titleLevel", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "displayMode", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isVisible", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formElements", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "layout", _descriptor13, _assertThisInitialized(_this));
      if (_this.metaPath && _this.contextPath && (_this.formContainers === undefined || _this.formContainers === null)) {
        const oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
        const mExtraSettings = {};
        let oFacetDefinition = oContextObjectPath.targetObject;
        let hasFieldGroup = false;
        if (oFacetDefinition && oFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.FieldGroupType") {
          // Wrap the facet in a fake Facet annotation
          hasFieldGroup = true;
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
        }
        const oConverterContext = _this.getConverterContext(oContextObjectPath, /*this.contextPath*/undefined, mSettings, mExtraSettings);
        const oFormDefinition = createFormDefinition(oFacetDefinition, _this.isVisible, oConverterContext);
        if (hasFieldGroup) {
          oFormDefinition.formContainers[0].annotationPath = _this.metaPath.getPath();
        }
        _this.formContainers = oFormDefinition.formContainers;
        _this.useFormContainerLabels = oFormDefinition.useFormContainerLabels;
        _this.facetType = oFacetDefinition && oFacetDefinition.$Type;
      } else {
        var _this$metaPath$getObj;
        _this.facetType = (_this$metaPath$getObj = _this.metaPath.getObject()) === null || _this$metaPath$getObj === void 0 ? void 0 : _this$metaPath$getObj.$Type;
      }
      if (!_this.isPublic) {
        _this._apiId = _this.createId("Form");
        _this._contentId = _this.id;
      } else {
        _this._apiId = _this.id;
        _this._contentId = `${_this.id}-content`;
      }
      // if displayMode === true -> _editable = false
      // if displayMode === false -> _editable = true
      //  => if displayMode === {myBindingValue} -> _editable = {myBindingValue} === true ? true : false
      // if DisplayMode === undefined -> _editable = {ui>/isEditable}
      if (_this.displayMode !== undefined) {
        _this._editable = compileExpression(ifElse(equal(resolveBindingString(_this.displayMode, "boolean"), false), true, false));
      } else {
        _this._editable = compileExpression(UI.IsEditable);
      }
      return _this;
    }
    _exports = FormBuildingBlock;
    var _proto = FormBuildingBlock.prototype;
    _proto.getDataFieldCollection = function getDataFieldCollection(formContainer, facetContext) {
      const facet = getInvolvedDataModelObjects(facetContext).targetObject;
      let navigationPath;
      let idPart;
      if (facet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        navigationPath = AnnotationHelper.getNavigationPath(facet.Target.value);
        idPart = facet;
      } else {
        const contextPathPath = this.contextPath.getPath();
        let facetPath = facetContext.getPath();
        if (facetPath.startsWith(contextPathPath)) {
          facetPath = facetPath.substring(contextPathPath.length);
        }
        navigationPath = AnnotationHelper.getNavigationPath(facetPath);
        idPart = facetPath;
      }
      const titleLevel = FormHelper.getFormContainerTitleLevel(this.title, this.titleLevel);
      const title = this.useFormContainerLabels && facet ? AnnotationHelper.label(facet, {
        context: facetContext
      }) : "";
      const id = this.id ? getFormContainerID(idPart) : undefined;
      return xml`
					<macro:FormContainer
					xmlns:macro="sap.fe.macros"
					${this.attr("id", id)}
					title="${title}"
					titleLevel="${titleLevel}"
					contextPath="${navigationPath ? formContainer.entitySet : this.contextPath}"
					metaPath="${facetContext}"
					dataFieldCollection="${formContainer.formElements}"
					navigationPath="${navigationPath}"
					visible="${formContainer.isVisible}"
					displayMode="${this.displayMode}"
					onChange="${this.onChange}"
					actions="${formContainer.actions}"
				>
				<macro:formElements>
					<slot name="formElements" />
				</macro:formElements>
			</macro:FormContainer>`;
    };
    _proto.getFormContainers = function getFormContainers() {
      if (this.formContainers.length === 0) {
        return "";
      }
      if (this.facetType.indexOf("com.sap.vocabularies.UI.v1.CollectionFacet") >= 0) {
        return this.formContainers.map((formContainer, formContainerIdx) => {
          if (formContainer.isVisible) {
            const facetContext = this.contextPath.getModel().createBindingContext(formContainer.annotationPath, this.contextPath);
            const facet = facetContext.getObject();
            if (facet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && FormHelper.isReferenceFacetPartOfPreview(facet, this.partOfPreview)) {
              if (facet.Target.$AnnotationPath.$Type === "com.sap.vocabularies.Communication.v1.AddressType") {
                return xml`<template:with path="formContainers>${formContainerIdx}" var="formContainer">
											<template:with path="formContainers>${formContainerIdx}/annotationPath" var="facet">
												<core:Fragment fragmentName="sap.fe.macros.form.AddressSection" type="XML" />
											</template:with>
										</template:with>`;
              }
              return this.getDataFieldCollection(formContainer, facetContext);
            }
          }
          return "";
        });
      } else if (this.facetType === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        return this.formContainers.map(formContainer => {
          if (formContainer.isVisible) {
            const facetContext = this.contextPath.getModel().createBindingContext(formContainer.annotationPath, this.contextPath);
            return this.getDataFieldCollection(formContainer, facetContext);
          } else {
            return "";
          }
        });
      }
      return xml``;
    }

    /**
     * Create the proper layout information based on the `layout` property defined externally.
     *
     * @returns The layout information for the xml.
     */;
    _proto.getLayoutInformation = function getLayoutInformation() {
      switch (this.layout.type) {
        case "ResponsiveGridLayout":
          return xml`<f:ResponsiveGridLayout adjustLabelSpan="${this.layout.adjustLabelSpan}"
													breakpointL="${this.layout.breakpointL}"
													breakpointM="${this.layout.breakpointM}"
													breakpointXL="${this.layout.breakpointXL}"
													columnsL="${this.layout.columnsL}"
													columnsM="${this.layout.columnsM}"
													columnsXL="${this.layout.columnsXL}"
													emptySpanL="${this.layout.emptySpanL}"
													emptySpanM="${this.layout.emptySpanM}"
													emptySpanS="${this.layout.emptySpanS}"
													emptySpanXL="${this.layout.emptySpanXL}"
													labelSpanL="${this.layout.labelSpanL}"
													labelSpanM="${this.layout.labelSpanM}"
													labelSpanS="${this.layout.labelSpanS}"
													labelSpanXL="${this.layout.labelSpanXL}"
													singleContainerFullSize="${this.layout.singleContainerFullSize}" />`;
        case "ColumnLayout":
        default:
          return xml`<f:ColumnLayout
								columnsM="${this.layout.columnsM}"
								columnsL="${this.layout.columnsL}"
								columnsXL="${this.layout.columnsXL}"
								labelCellsLarge="${this.layout.labelCellsLarge}"
								emptyCellsLarge="${this.layout.emptyCellsLarge}" />`;
      }
    };
    _proto.getTemplate = function getTemplate() {
      const onChangeStr = this.onChange && this.onChange.replace("{", "\\{").replace("}", "\\}") || "";
      const metaPathPath = this.metaPath.getPath();
      const contextPathPath = this.contextPath.getPath();
      if (!this.isVisible) {
        return xml``;
      } else {
        return xml`<macro:FormAPI xmlns:macro="sap.fe.macros.form"
					xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					xmlns:f="sap.ui.layout.form"
					xmlns:fl="sap.ui.fl"
					id="${this._apiId}"
					metaPath="${metaPathPath}"
					contextPath="${contextPathPath}">
				<f:Form
					fl:delegate='{
						"name": "sap/fe/macros/form/FormDelegate",
						"delegateType": "complete"
					}'
					id="${this._contentId}"
					editable="${this._editable}"
					macrodata:entitySet="{contextPath>@sapui.name}"
					visible="${this.isVisible}"
					class="sapUxAPObjectPageSubSectionAlignContent"
					macrodata:navigationPath="${contextPathPath}"
					macrodata:onChange="${onChangeStr}"
				>
					${this.addConditionally(this.title !== undefined, xml`<f:title>
							<core:Title level="${this.titleLevel}" text="${this.title}" />
						</f:title>`)}
					<f:layout>
					${this.getLayoutInformation()}

					</f:layout>
					<f:formContainers>
						${this.getFormContainers()}
					</f:formContainers>
				</f:Form>
			</macro:FormAPI>`;
      }
    };
    return FormBuildingBlock;
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
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "formContainers", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "useFormContainerLabels", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "partOfPreview", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
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
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "displayMode", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "isVisible", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "formElements", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "layout", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {
        type: "ColumnLayout",
        columnsM: 2,
        columnsXL: 6,
        columnsL: 3,
        labelCellsLarge: 12
      };
    }
  })), _class2)) || _class);
  _exports = FormBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtQnVpbGRpbmdCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJyZXF1aXJlZCIsIiRraW5kIiwiZGVmYXVsdFZhbHVlIiwiYmxvY2tFdmVudCIsImJsb2NrQWdncmVnYXRpb24iLCJzbG90IiwiaXNEZWZhdWx0Iiwib1Byb3BzIiwiY29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsIm1ldGFQYXRoIiwiY29udGV4dFBhdGgiLCJmb3JtQ29udGFpbmVycyIsInVuZGVmaW5lZCIsIm9Db250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm1FeHRyYVNldHRpbmdzIiwib0ZhY2V0RGVmaW5pdGlvbiIsInRhcmdldE9iamVjdCIsImhhc0ZpZWxkR3JvdXAiLCIkVHlwZSIsIkxhYmVsIiwiVGFyZ2V0IiwiJHRhcmdldCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInBhdGgiLCJ0ZXJtIiwidmFsdWUiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwiYW5ub3RhdGlvbnMiLCJmaWVsZHMiLCJmb3JtRWxlbWVudHMiLCJvQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJvRm9ybURlZmluaXRpb24iLCJjcmVhdGVGb3JtRGVmaW5pdGlvbiIsImlzVmlzaWJsZSIsImFubm90YXRpb25QYXRoIiwiZ2V0UGF0aCIsInVzZUZvcm1Db250YWluZXJMYWJlbHMiLCJmYWNldFR5cGUiLCJnZXRPYmplY3QiLCJfYXBpSWQiLCJjcmVhdGVJZCIsIl9jb250ZW50SWQiLCJpZCIsImRpc3BsYXlNb2RlIiwiX2VkaXRhYmxlIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJlcXVhbCIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiVUkiLCJJc0VkaXRhYmxlIiwiZ2V0RGF0YUZpZWxkQ29sbGVjdGlvbiIsImZvcm1Db250YWluZXIiLCJmYWNldENvbnRleHQiLCJmYWNldCIsIm5hdmlnYXRpb25QYXRoIiwiaWRQYXJ0IiwiQW5ub3RhdGlvbkhlbHBlciIsImdldE5hdmlnYXRpb25QYXRoIiwiY29udGV4dFBhdGhQYXRoIiwiZmFjZXRQYXRoIiwic3RhcnRzV2l0aCIsInN1YnN0cmluZyIsImxlbmd0aCIsInRpdGxlTGV2ZWwiLCJGb3JtSGVscGVyIiwiZ2V0Rm9ybUNvbnRhaW5lclRpdGxlTGV2ZWwiLCJ0aXRsZSIsImxhYmVsIiwiY29udGV4dCIsImdldEZvcm1Db250YWluZXJJRCIsInhtbCIsImF0dHIiLCJlbnRpdHlTZXQiLCJvbkNoYW5nZSIsImFjdGlvbnMiLCJnZXRGb3JtQ29udGFpbmVycyIsImluZGV4T2YiLCJtYXAiLCJmb3JtQ29udGFpbmVySWR4IiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImlzUmVmZXJlbmNlRmFjZXRQYXJ0T2ZQcmV2aWV3IiwicGFydE9mUHJldmlldyIsIiRBbm5vdGF0aW9uUGF0aCIsImdldExheW91dEluZm9ybWF0aW9uIiwibGF5b3V0IiwiYWRqdXN0TGFiZWxTcGFuIiwiYnJlYWtwb2ludEwiLCJicmVha3BvaW50TSIsImJyZWFrcG9pbnRYTCIsImNvbHVtbnNMIiwiY29sdW1uc00iLCJjb2x1bW5zWEwiLCJlbXB0eVNwYW5MIiwiZW1wdHlTcGFuTSIsImVtcHR5U3BhblMiLCJlbXB0eVNwYW5YTCIsImxhYmVsU3BhbkwiLCJsYWJlbFNwYW5NIiwibGFiZWxTcGFuUyIsImxhYmVsU3BhblhMIiwic2luZ2xlQ29udGFpbmVyRnVsbFNpemUiLCJsYWJlbENlbGxzTGFyZ2UiLCJlbXB0eUNlbGxzTGFyZ2UiLCJnZXRUZW1wbGF0ZSIsIm9uQ2hhbmdlU3RyIiwicmVwbGFjZSIsIm1ldGFQYXRoUGF0aCIsImFkZENvbmRpdGlvbmFsbHkiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRm9ybUJ1aWxkaW5nQmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbXVuaWNhdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBGYWNldFR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQge1xuXHRibG9ja0FnZ3JlZ2F0aW9uLFxuXHRibG9ja0F0dHJpYnV0ZSxcblx0YmxvY2tFdmVudCxcblx0QnVpbGRpbmdCbG9ja0Jhc2UsXG5cdGRlZmluZUJ1aWxkaW5nQmxvY2tcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuaW1wb3J0IHR5cGUgeyBGb3JtQ29udGFpbmVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0Zvcm1cIjtcbmltcG9ydCB7IGNyZWF0ZUZvcm1EZWZpbml0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0Zvcm1cIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRGb3JtQ29udGFpbmVySUQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGVxdWFsLCBpZkVsc2UsIHJlc29sdmVCaW5kaW5nU3RyaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IEZvcm1IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZm9ybS9Gb3JtSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFRpdGxlTGV2ZWwgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgeyAkQ29sdW1uTGF5b3V0U2V0dGluZ3MgfSBmcm9tIFwic2FwL3VpL2xheW91dC9mb3JtL0NvbHVtbkxheW91dFwiO1xuaW1wb3J0IHR5cGUgeyAkUmVzcG9uc2l2ZUdyaWRMYXlvdXRTZXR0aW5ncyB9IGZyb20gXCJzYXAvdWkvbGF5b3V0L2Zvcm0vUmVzcG9uc2l2ZUdyaWRMYXlvdXRcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgQW5ub3RhdGlvbkhlbHBlciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0Fubm90YXRpb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgVjRDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG50eXBlIENvbHVtbkxheW91dCA9ICRDb2x1bW5MYXlvdXRTZXR0aW5ncyAmIHtcblx0dHlwZTogXCJDb2x1bW5MYXlvdXRcIjtcbn07XG50eXBlIFJlc3BvbnNpdmVHcmlkTGF5b3V0ID0gJFJlc3BvbnNpdmVHcmlkTGF5b3V0U2V0dGluZ3MgJiB7XG5cdHR5cGU6IFwiUmVzcG9uc2l2ZUdyaWRMYXlvdXRcIjtcbn07XG50eXBlIEZvcm1MYXlvdXRJbmZvcm1hdGlvbiA9IENvbHVtbkxheW91dCB8IFJlc3BvbnNpdmVHcmlkTGF5b3V0O1xuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIEZvcm0gYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogSXQgaXMgZGVzaWduZWQgdG8gd29yayBiYXNlZCBvbiBhIEZpZWxkR3JvdXAgYW5ub3RhdGlvbiBidXQgY2FuIGFsc28gd29yayBpZiB5b3UgcHJvdmlkZSBhIFJlZmVyZW5jZUZhY2V0IG9yIGEgQ29sbGVjdGlvbkZhY2V0XG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZvcm0gaWQ9XCJNeUZvcm1cIiBtZXRhUGF0aD1cIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwI0dlbmVyYWxJbmZvcm1hdGlvblwiIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5Gb3JtXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJGb3JtXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdHB1YmxpY05hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGb3JtQnVpbGRpbmdCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdCRraW5kOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogVjRDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdHJlcXVpcmVkOiB0cnVlXG5cdH0pXG5cdG1ldGFQYXRoITogVjRDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBUaGUgbWFuaWZlc3QgZGVmaW5lZCBmb3JtIGNvbnRhaW5lcnMgdG8gYmUgc2hvd24gaW4gdGhlIGFjdGlvbiBhcmVhIG9mIHRoZSB0YWJsZVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiIH0pXG5cdGZvcm1Db250YWluZXJzPzogRm9ybUNvbnRhaW5lcltdO1xuXG5cdC8qKlxuXHQgKiBDb250cm9sIHRoZSByZW5kZXJpbmcgb2YgdGhlIGZvcm0gY29udGFpbmVyIGxhYmVsc1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0dXNlRm9ybUNvbnRhaW5lckxhYmVscyE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRvZ2dsZSBQcmV2aWV3OiBQYXJ0IG9mIFByZXZpZXcgLyBQcmV2aWV3IHZpYSAnU2hvdyBNb3JlJyBCdXR0b25cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0cGFydE9mUHJldmlldyE6IGJvb2xlYW47XG5cblx0Ly8gT3RoZXIgcHVibGljIHByb3BlcnRpZXMgb3Igb3ZlcnJpZGVzXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHRpdGxlPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBcImFyaWEtbGV2ZWxcIiBvZiB0aGUgZm9ybSB0aXRsZSwgdGl0bGVzIG9mIGludGVybmFsbHkgdXNlZCBmb3JtIGNvbnRhaW5lcnMgYXJlIG5lc3RlZCBzdWJzZXF1ZW50bHlcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLmNvcmUuVGl0bGVMZXZlbFwiLCBpc1B1YmxpYzogdHJ1ZSwgZGVmYXVsdFZhbHVlOiBcIkF1dG9cIiB9KVxuXHR0aXRsZUxldmVsPzogVGl0bGVMZXZlbDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGRpc3BsYXlNb2RlITogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyoqXG5cdCAqIFx0SWYgc2V0IHRvIGZhbHNlLCB0aGUgRm9ybSBpcyBub3QgcmVuZGVyZWQuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0VmFsdWU6IFwidHJ1ZVwiIH0pXG5cdGlzVmlzaWJsZSE6IHN0cmluZztcblx0Ly8gSW5kZXBlbmRlbnQgZnJvbSB0aGUgZm9ybSB0aXRsZSwgY2FuIGJlIGEgYml0IGNvbmZ1c2luZyBpbiBzdGFuZGFsb25lIHVzYWdlIGF0IGlzIG5vdCBzaG93aW5nIGFueXRoaW5nIGJ5IGRlZmF1bHRcblxuXHQvLyBKdXN0IHByb3hpZWQgZG93biB0byB0aGUgRmllbGQgbWF5IG5lZWQgdG8gc2VlIGlmIG5lZWRlZCBvciBub3Rcblx0QGJsb2NrRXZlbnQoKVxuXHRvbkNoYW5nZTogc3RyaW5nID0gXCJcIjtcblxuXHRAYmxvY2tBZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5mb3JtLkZvcm1FbGVtZW50XCIsIGlzUHVibGljOiB0cnVlLCBzbG90OiBcImZvcm1FbGVtZW50c1wiLCBpc0RlZmF1bHQ6IHRydWUgfSlcblx0Zm9ybUVsZW1lbnRzOiBhbnk7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIGxheW91dCB0byBiZSB1c2VkIHdpdGhpbiB0aGUgZm9ybS5cblx0ICogSXQgZGVmYXVsdHMgdG8gdGhlIENvbHVtbkxheW91dCwgYnV0IHlvdSBjYW4gYWxzbyB1c2UgYSBSZXNwb25zaXZlR3JpZExheW91dC5cblx0ICogQWxsIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBSZXNwb25zaXZlR3JpZExheW91dCBjYW4gYmUgYWRkZWQgdG8gdGhlIGNvbmZpZ3VyYXRpb24uXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcIm9iamVjdFwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRsYXlvdXQ6IEZvcm1MYXlvdXRJbmZvcm1hdGlvbiA9IHsgdHlwZTogXCJDb2x1bW5MYXlvdXRcIiwgY29sdW1uc006IDIsIGNvbHVtbnNYTDogNiwgY29sdW1uc0w6IDMsIGxhYmVsQ2VsbHNMYXJnZTogMTIgfTtcblxuXHQvLyBVc2VmdWwgZm9yIG91ciBkeW5hbWljIHRoaW5nIGJ1dCBhbHNvIGRlcGVuZHMgb24gdGhlIG1ldGFkYXRhIC0+IG1ha2Ugc3VyZSB0aGlzIGlzIHRha2VuIGludG8gYWNjb3VudFxuXHRfZWRpdGFibGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdF9hcGlJZDogc3RyaW5nO1xuXHRfY29udGVudElkOiBzdHJpbmc7XG5cdGZhY2V0VHlwZTogc3RyaW5nO1xuXHRjb25zdHJ1Y3RvcihvUHJvcHM6IFByb3BlcnRpZXNPZjxGb3JtQnVpbGRpbmdCbG9jaz4sIGNvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihvUHJvcHMsIGNvbmZpZ3VyYXRpb24sIG1TZXR0aW5ncyk7XG5cdFx0aWYgKHRoaXMubWV0YVBhdGggJiYgdGhpcy5jb250ZXh0UGF0aCAmJiAodGhpcy5mb3JtQ29udGFpbmVycyA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuZm9ybUNvbnRhaW5lcnMgPT09IG51bGwpKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5tZXRhUGF0aCwgdGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0XHRjb25zdCBtRXh0cmFTZXR0aW5nczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXHRcdFx0bGV0IG9GYWNldERlZmluaXRpb24gPSBvQ29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdFx0bGV0IGhhc0ZpZWxkR3JvdXAgPSBmYWxzZTtcblx0XHRcdGlmIChvRmFjZXREZWZpbml0aW9uICYmIG9GYWNldERlZmluaXRpb24uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlKSB7XG5cdFx0XHRcdC8vIFdyYXAgdGhlIGZhY2V0IGluIGEgZmFrZSBGYWNldCBhbm5vdGF0aW9uXG5cdFx0XHRcdGhhc0ZpZWxkR3JvdXAgPSB0cnVlO1xuXHRcdFx0XHRvRmFjZXREZWZpbml0aW9uID0ge1xuXHRcdFx0XHRcdCRUeXBlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlZmVyZW5jZUZhY2V0XCIsXG5cdFx0XHRcdFx0TGFiZWw6IG9GYWNldERlZmluaXRpb24uTGFiZWwsXG5cdFx0XHRcdFx0VGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHQkdGFyZ2V0OiBvRmFjZXREZWZpbml0aW9uLFxuXHRcdFx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBvRmFjZXREZWZpbml0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0XHRcdHBhdGg6IFwiXCIsXG5cdFx0XHRcdFx0XHR0ZXJtOiBcIlwiLFxuXHRcdFx0XHRcdFx0dHlwZTogXCJBbm5vdGF0aW9uUGF0aFwiLFxuXHRcdFx0XHRcdFx0dmFsdWU6IGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob0NvbnRleHRPYmplY3RQYXRoKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0YW5ub3RhdGlvbnM6IHt9LFxuXHRcdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogb0ZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWVcblx0XHRcdFx0fTtcblx0XHRcdFx0bUV4dHJhU2V0dGluZ3Nbb0ZhY2V0RGVmaW5pdGlvbi5UYXJnZXQudmFsdWVdID0geyBmaWVsZHM6IHRoaXMuZm9ybUVsZW1lbnRzIH07XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9Db252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5nZXRDb252ZXJ0ZXJDb250ZXh0KFxuXHRcdFx0XHRvQ29udGV4dE9iamVjdFBhdGgsXG5cdFx0XHRcdC8qdGhpcy5jb250ZXh0UGF0aCovIHVuZGVmaW5lZCxcblx0XHRcdFx0bVNldHRpbmdzLFxuXHRcdFx0XHRtRXh0cmFTZXR0aW5nc1xuXHRcdFx0KTtcblx0XHRcdGNvbnN0IG9Gb3JtRGVmaW5pdGlvbiA9IGNyZWF0ZUZvcm1EZWZpbml0aW9uKG9GYWNldERlZmluaXRpb24sIHRoaXMuaXNWaXNpYmxlLCBvQ29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRpZiAoaGFzRmllbGRHcm91cCkge1xuXHRcdFx0XHRvRm9ybURlZmluaXRpb24uZm9ybUNvbnRhaW5lcnNbMF0uYW5ub3RhdGlvblBhdGggPSB0aGlzLm1ldGFQYXRoLmdldFBhdGgoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZm9ybUNvbnRhaW5lcnMgPSBvRm9ybURlZmluaXRpb24uZm9ybUNvbnRhaW5lcnM7XG5cdFx0XHR0aGlzLnVzZUZvcm1Db250YWluZXJMYWJlbHMgPSBvRm9ybURlZmluaXRpb24udXNlRm9ybUNvbnRhaW5lckxhYmVscztcblx0XHRcdHRoaXMuZmFjZXRUeXBlID0gb0ZhY2V0RGVmaW5pdGlvbiAmJiBvRmFjZXREZWZpbml0aW9uLiRUeXBlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmZhY2V0VHlwZSA9IHRoaXMubWV0YVBhdGguZ2V0T2JqZWN0KCk/LiRUeXBlO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5pc1B1YmxpYykge1xuXHRcdFx0dGhpcy5fYXBpSWQgPSB0aGlzLmNyZWF0ZUlkKFwiRm9ybVwiKSE7XG5cdFx0XHR0aGlzLl9jb250ZW50SWQgPSB0aGlzLmlkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9hcGlJZCA9IHRoaXMuaWQ7XG5cdFx0XHR0aGlzLl9jb250ZW50SWQgPSBgJHt0aGlzLmlkfS1jb250ZW50YDtcblx0XHR9XG5cdFx0Ly8gaWYgZGlzcGxheU1vZGUgPT09IHRydWUgLT4gX2VkaXRhYmxlID0gZmFsc2Vcblx0XHQvLyBpZiBkaXNwbGF5TW9kZSA9PT0gZmFsc2UgLT4gX2VkaXRhYmxlID0gdHJ1ZVxuXHRcdC8vICA9PiBpZiBkaXNwbGF5TW9kZSA9PT0ge215QmluZGluZ1ZhbHVlfSAtPiBfZWRpdGFibGUgPSB7bXlCaW5kaW5nVmFsdWV9ID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlXG5cdFx0Ly8gaWYgRGlzcGxheU1vZGUgPT09IHVuZGVmaW5lZCAtPiBfZWRpdGFibGUgPSB7dWk+L2lzRWRpdGFibGV9XG5cdFx0aWYgKHRoaXMuZGlzcGxheU1vZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fZWRpdGFibGUgPSBjb21waWxlRXhwcmVzc2lvbihpZkVsc2UoZXF1YWwocmVzb2x2ZUJpbmRpbmdTdHJpbmcodGhpcy5kaXNwbGF5TW9kZSwgXCJib29sZWFuXCIpLCBmYWxzZSksIHRydWUsIGZhbHNlKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2VkaXRhYmxlID0gY29tcGlsZUV4cHJlc3Npb24oVUkuSXNFZGl0YWJsZSk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0RGF0YUZpZWxkQ29sbGVjdGlvbihmb3JtQ29udGFpbmVyOiBGb3JtQ29udGFpbmVyLCBmYWNldENvbnRleHQ6IENvbnRleHQpIHtcblx0XHRjb25zdCBmYWNldCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhmYWNldENvbnRleHQpLnRhcmdldE9iamVjdCBhcyBGYWNldFR5cGVzO1xuXHRcdGxldCBuYXZpZ2F0aW9uUGF0aDtcblx0XHRsZXQgaWRQYXJ0O1xuXHRcdGlmIChmYWNldC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQpIHtcblx0XHRcdG5hdmlnYXRpb25QYXRoID0gQW5ub3RhdGlvbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChmYWNldC5UYXJnZXQudmFsdWUpO1xuXHRcdFx0aWRQYXJ0ID0gZmFjZXQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXRoUGF0aCA9IHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpO1xuXHRcdFx0bGV0IGZhY2V0UGF0aCA9IGZhY2V0Q29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRpZiAoZmFjZXRQYXRoLnN0YXJ0c1dpdGgoY29udGV4dFBhdGhQYXRoKSkge1xuXHRcdFx0XHRmYWNldFBhdGggPSBmYWNldFBhdGguc3Vic3RyaW5nKGNvbnRleHRQYXRoUGF0aC5sZW5ndGgpO1xuXHRcdFx0fVxuXHRcdFx0bmF2aWdhdGlvblBhdGggPSBBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKGZhY2V0UGF0aCk7XG5cdFx0XHRpZFBhcnQgPSBmYWNldFBhdGg7XG5cdFx0fVxuXHRcdGNvbnN0IHRpdGxlTGV2ZWwgPSBGb3JtSGVscGVyLmdldEZvcm1Db250YWluZXJUaXRsZUxldmVsKHRoaXMudGl0bGUsIHRoaXMudGl0bGVMZXZlbCk7XG5cdFx0Y29uc3QgdGl0bGUgPSB0aGlzLnVzZUZvcm1Db250YWluZXJMYWJlbHMgJiYgZmFjZXQgPyAoQW5ub3RhdGlvbkhlbHBlci5sYWJlbChmYWNldCwgeyBjb250ZXh0OiBmYWNldENvbnRleHQgfSkgYXMgc3RyaW5nKSA6IFwiXCI7XG5cdFx0Y29uc3QgaWQgPSB0aGlzLmlkID8gZ2V0Rm9ybUNvbnRhaW5lcklEKGlkUGFydCkgOiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0XHRcdDxtYWNybzpGb3JtQ29udGFpbmVyXG5cdFx0XHRcdFx0eG1sbnM6bWFjcm89XCJzYXAuZmUubWFjcm9zXCJcblx0XHRcdFx0XHQke3RoaXMuYXR0cihcImlkXCIsIGlkKX1cblx0XHRcdFx0XHR0aXRsZT1cIiR7dGl0bGV9XCJcblx0XHRcdFx0XHR0aXRsZUxldmVsPVwiJHt0aXRsZUxldmVsfVwiXG5cdFx0XHRcdFx0Y29udGV4dFBhdGg9XCIke25hdmlnYXRpb25QYXRoID8gZm9ybUNvbnRhaW5lci5lbnRpdHlTZXQgOiB0aGlzLmNvbnRleHRQYXRofVwiXG5cdFx0XHRcdFx0bWV0YVBhdGg9XCIke2ZhY2V0Q29udGV4dH1cIlxuXHRcdFx0XHRcdGRhdGFGaWVsZENvbGxlY3Rpb249XCIke2Zvcm1Db250YWluZXIuZm9ybUVsZW1lbnRzfVwiXG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGg9XCIke25hdmlnYXRpb25QYXRofVwiXG5cdFx0XHRcdFx0dmlzaWJsZT1cIiR7Zm9ybUNvbnRhaW5lci5pc1Zpc2libGV9XCJcblx0XHRcdFx0XHRkaXNwbGF5TW9kZT1cIiR7dGhpcy5kaXNwbGF5TW9kZX1cIlxuXHRcdFx0XHRcdG9uQ2hhbmdlPVwiJHt0aGlzLm9uQ2hhbmdlfVwiXG5cdFx0XHRcdFx0YWN0aW9ucz1cIiR7Zm9ybUNvbnRhaW5lci5hY3Rpb25zfVwiXG5cdFx0XHRcdD5cblx0XHRcdFx0PG1hY3JvOmZvcm1FbGVtZW50cz5cblx0XHRcdFx0XHQ8c2xvdCBuYW1lPVwiZm9ybUVsZW1lbnRzXCIgLz5cblx0XHRcdFx0PC9tYWNybzpmb3JtRWxlbWVudHM+XG5cdFx0XHQ8L21hY3JvOkZvcm1Db250YWluZXI+YDtcblx0fVxuXG5cdGdldEZvcm1Db250YWluZXJzKCkge1xuXHRcdGlmICh0aGlzLmZvcm1Db250YWluZXJzIS5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0XHRpZiAodGhpcy5mYWNldFR5cGUuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNvbGxlY3Rpb25GYWNldFwiKSA+PSAwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5mb3JtQ29udGFpbmVycyEubWFwKChmb3JtQ29udGFpbmVyLCBmb3JtQ29udGFpbmVySWR4KSA9PiB7XG5cdFx0XHRcdGlmIChmb3JtQ29udGFpbmVyLmlzVmlzaWJsZSkge1xuXHRcdFx0XHRcdGNvbnN0IGZhY2V0Q29udGV4dCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChmb3JtQ29udGFpbmVyLmFubm90YXRpb25QYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRcdFx0XHRjb25zdCBmYWNldCA9IGZhY2V0Q29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRmYWNldC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQgJiZcblx0XHRcdFx0XHRcdEZvcm1IZWxwZXIuaXNSZWZlcmVuY2VGYWNldFBhcnRPZlByZXZpZXcoZmFjZXQsIHRoaXMucGFydE9mUHJldmlldylcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdGlmIChmYWNldC5UYXJnZXQuJEFubm90YXRpb25QYXRoLiRUeXBlID09PSBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzLkFkZHJlc3NUeXBlKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB4bWxgPHRlbXBsYXRlOndpdGggcGF0aD1cImZvcm1Db250YWluZXJzPiR7Zm9ybUNvbnRhaW5lcklkeH1cIiB2YXI9XCJmb3JtQ29udGFpbmVyXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHRlbXBsYXRlOndpdGggcGF0aD1cImZvcm1Db250YWluZXJzPiR7Zm9ybUNvbnRhaW5lcklkeH0vYW5ub3RhdGlvblBhdGhcIiB2YXI9XCJmYWNldFwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5mb3JtLkFkZHJlc3NTZWN0aW9uXCIgdHlwZT1cIlhNTFwiIC8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC90ZW1wbGF0ZTp3aXRoPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3RlbXBsYXRlOndpdGg+YDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmdldERhdGFGaWVsZENvbGxlY3Rpb24oZm9ybUNvbnRhaW5lciwgZmFjZXRDb250ZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuZmFjZXRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlZmVyZW5jZUZhY2V0XCIpIHtcblx0XHRcdHJldHVybiB0aGlzLmZvcm1Db250YWluZXJzIS5tYXAoKGZvcm1Db250YWluZXIpID0+IHtcblx0XHRcdFx0aWYgKGZvcm1Db250YWluZXIuaXNWaXNpYmxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmFjZXRDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGZvcm1Db250YWluZXIuYW5ub3RhdGlvblBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmdldERhdGFGaWVsZENvbGxlY3Rpb24oZm9ybUNvbnRhaW5lciwgZmFjZXRDb250ZXh0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gXCJcIjtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIHByb3BlciBsYXlvdXQgaW5mb3JtYXRpb24gYmFzZWQgb24gdGhlIGBsYXlvdXRgIHByb3BlcnR5IGRlZmluZWQgZXh0ZXJuYWxseS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGxheW91dCBpbmZvcm1hdGlvbiBmb3IgdGhlIHhtbC5cblx0ICovXG5cdGdldExheW91dEluZm9ybWF0aW9uKCkge1xuXHRcdHN3aXRjaCAodGhpcy5sYXlvdXQudHlwZSkge1xuXHRcdFx0Y2FzZSBcIlJlc3BvbnNpdmVHcmlkTGF5b3V0XCI6XG5cdFx0XHRcdHJldHVybiB4bWxgPGY6UmVzcG9uc2l2ZUdyaWRMYXlvdXQgYWRqdXN0TGFiZWxTcGFuPVwiJHt0aGlzLmxheW91dC5hZGp1c3RMYWJlbFNwYW59XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWtwb2ludEw9XCIke3RoaXMubGF5b3V0LmJyZWFrcG9pbnRMfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrcG9pbnRNPVwiJHt0aGlzLmxheW91dC5icmVha3BvaW50TX1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVha3BvaW50WEw9XCIke3RoaXMubGF5b3V0LmJyZWFrcG9pbnRYTH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb2x1bW5zTD1cIiR7dGhpcy5sYXlvdXQuY29sdW1uc0x9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29sdW1uc009XCIke3RoaXMubGF5b3V0LmNvbHVtbnNNfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNYTD1cIiR7dGhpcy5sYXlvdXQuY29sdW1uc1hMfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVtcHR5U3Bhbkw9XCIke3RoaXMubGF5b3V0LmVtcHR5U3Bhbkx9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZW1wdHlTcGFuTT1cIiR7dGhpcy5sYXlvdXQuZW1wdHlTcGFuTX1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbXB0eVNwYW5TPVwiJHt0aGlzLmxheW91dC5lbXB0eVNwYW5TfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVtcHR5U3BhblhMPVwiJHt0aGlzLmxheW91dC5lbXB0eVNwYW5YTH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYWJlbFNwYW5MPVwiJHt0aGlzLmxheW91dC5sYWJlbFNwYW5MfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsU3Bhbk09XCIke3RoaXMubGF5b3V0LmxhYmVsU3Bhbk19XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWxTcGFuUz1cIiR7dGhpcy5sYXlvdXQubGFiZWxTcGFuU31cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYWJlbFNwYW5YTD1cIiR7dGhpcy5sYXlvdXQubGFiZWxTcGFuWEx9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2luZ2xlQ29udGFpbmVyRnVsbFNpemU9XCIke3RoaXMubGF5b3V0LnNpbmdsZUNvbnRhaW5lckZ1bGxTaXplfVwiIC8+YDtcblx0XHRcdGNhc2UgXCJDb2x1bW5MYXlvdXRcIjpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB4bWxgPGY6Q29sdW1uTGF5b3V0XG5cdFx0XHRcdFx0XHRcdFx0Y29sdW1uc009XCIke3RoaXMubGF5b3V0LmNvbHVtbnNNfVwiXG5cdFx0XHRcdFx0XHRcdFx0Y29sdW1uc0w9XCIke3RoaXMubGF5b3V0LmNvbHVtbnNMfVwiXG5cdFx0XHRcdFx0XHRcdFx0Y29sdW1uc1hMPVwiJHt0aGlzLmxheW91dC5jb2x1bW5zWEx9XCJcblx0XHRcdFx0XHRcdFx0XHRsYWJlbENlbGxzTGFyZ2U9XCIke3RoaXMubGF5b3V0LmxhYmVsQ2VsbHNMYXJnZX1cIlxuXHRcdFx0XHRcdFx0XHRcdGVtcHR5Q2VsbHNMYXJnZT1cIiR7dGhpcy5sYXlvdXQuZW1wdHlDZWxsc0xhcmdlfVwiIC8+YDtcblx0XHR9XG5cdH1cblxuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBvbkNoYW5nZVN0ciA9ICh0aGlzLm9uQ2hhbmdlICYmIHRoaXMub25DaGFuZ2UucmVwbGFjZShcIntcIiwgXCJcXFxce1wiKS5yZXBsYWNlKFwifVwiLCBcIlxcXFx9XCIpKSB8fCBcIlwiO1xuXHRcdGNvbnN0IG1ldGFQYXRoUGF0aCA9IHRoaXMubWV0YVBhdGguZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGNvbnRleHRQYXRoUGF0aCA9IHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpO1xuXHRcdGlmICghdGhpcy5pc1Zpc2libGUpIHtcblx0XHRcdHJldHVybiB4bWxgYDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGA8bWFjcm86Rm9ybUFQSSB4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3MuZm9ybVwiXG5cdFx0XHRcdFx0eG1sbnM6bWFjcm9kYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0XHRcdFx0eG1sbnM6Zj1cInNhcC51aS5sYXlvdXQuZm9ybVwiXG5cdFx0XHRcdFx0eG1sbnM6Zmw9XCJzYXAudWkuZmxcIlxuXHRcdFx0XHRcdGlkPVwiJHt0aGlzLl9hcGlJZH1cIlxuXHRcdFx0XHRcdG1ldGFQYXRoPVwiJHttZXRhUGF0aFBhdGh9XCJcblx0XHRcdFx0XHRjb250ZXh0UGF0aD1cIiR7Y29udGV4dFBhdGhQYXRofVwiPlxuXHRcdFx0XHQ8ZjpGb3JtXG5cdFx0XHRcdFx0Zmw6ZGVsZWdhdGU9J3tcblx0XHRcdFx0XHRcdFwibmFtZVwiOiBcInNhcC9mZS9tYWNyb3MvZm9ybS9Gb3JtRGVsZWdhdGVcIixcblx0XHRcdFx0XHRcdFwiZGVsZWdhdGVUeXBlXCI6IFwiY29tcGxldGVcIlxuXHRcdFx0XHRcdH0nXG5cdFx0XHRcdFx0aWQ9XCIke3RoaXMuX2NvbnRlbnRJZH1cIlxuXHRcdFx0XHRcdGVkaXRhYmxlPVwiJHt0aGlzLl9lZGl0YWJsZX1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTplbnRpdHlTZXQ9XCJ7Y29udGV4dFBhdGg+QHNhcHVpLm5hbWV9XCJcblx0XHRcdFx0XHR2aXNpYmxlPVwiJHt0aGlzLmlzVmlzaWJsZX1cIlxuXHRcdFx0XHRcdGNsYXNzPVwic2FwVXhBUE9iamVjdFBhZ2VTdWJTZWN0aW9uQWxpZ25Db250ZW50XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6bmF2aWdhdGlvblBhdGg9XCIke2NvbnRleHRQYXRoUGF0aH1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTpvbkNoYW5nZT1cIiR7b25DaGFuZ2VTdHJ9XCJcblx0XHRcdFx0PlxuXHRcdFx0XHRcdCR7dGhpcy5hZGRDb25kaXRpb25hbGx5KFxuXHRcdFx0XHRcdFx0dGhpcy50aXRsZSAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0eG1sYDxmOnRpdGxlPlxuXHRcdFx0XHRcdFx0XHQ8Y29yZTpUaXRsZSBsZXZlbD1cIiR7dGhpcy50aXRsZUxldmVsfVwiIHRleHQ9XCIke3RoaXMudGl0bGV9XCIgLz5cblx0XHRcdFx0XHRcdDwvZjp0aXRsZT5gXG5cdFx0XHRcdFx0KX1cblx0XHRcdFx0XHQ8ZjpsYXlvdXQ+XG5cdFx0XHRcdFx0JHt0aGlzLmdldExheW91dEluZm9ybWF0aW9uKCl9XG5cblx0XHRcdFx0XHQ8L2Y6bGF5b3V0PlxuXHRcdFx0XHRcdDxmOmZvcm1Db250YWluZXJzPlxuXHRcdFx0XHRcdFx0JHt0aGlzLmdldEZvcm1Db250YWluZXJzKCl9XG5cdFx0XHRcdFx0PC9mOmZvcm1Db250YWluZXJzPlxuXHRcdFx0XHQ8L2Y6Rm9ybT5cblx0XHRcdDwvbWFjcm86Rm9ybUFQST5gO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFzRHFCQSxpQkFBaUI7RUFsQnRDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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