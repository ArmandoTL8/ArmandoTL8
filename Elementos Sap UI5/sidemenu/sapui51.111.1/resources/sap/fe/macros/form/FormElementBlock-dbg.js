/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/MetaModelConverter"], function (BuildingBlock, BuildingBlockRuntime, MetaModelConverter) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  var blockAggregation = BuildingBlock.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FormElementBlock = (
  /**
   * Building block used to create a form element based on the metadata provided by OData V4.
   *
   * @public
   * @since 1.90.0
   */
  _dec = defineBuildingBlock({
    name: "FormElement",
    namespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "boolean"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAggregation({
    type: "sap.ui.core.Control",
    slot: "fields",
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormElementBlock, _BuildingBlockBase);
    /**
     * The identifier of the FormElement building block.
     *
     * @public
     */

    /**
     * Defines the path of the context used in the current page or block.
     * This setting is defined by the framework.
     *
     * @public
     */

    /**
     * Defines the relative path of the property in the metamodel, based on the current contextPath.
     *
     * @public
     */

    /**
     * Label shown for the field. If not set, the label from the annotations will be shown.
     *
     * @public
     */

    /**
     * If set to false, the FormElement is not rendered.
     *
     * @public
     */

    /**
     * Optional aggregation of controls that should be displayed inside the FormElement.
     * If not set, a default Field building block will be rendered
     *
     * @public
     */

    function FormElementBlock(oProps, configuration, mSettings) {
      var _this;
      _this = _BuildingBlockBase.call(this, oProps, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "label", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "key", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fields", _descriptor7, _assertThisInitialized(_this));
      const oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      if (_this.label === undefined) {
        var _annotations$Common, _annotations$Common$L;
        _this.label = ((_annotations$Common = oContextObjectPath.targetObject.annotations.Common) === null || _annotations$Common === void 0 ? void 0 : (_annotations$Common$L = _annotations$Common.Label) === null || _annotations$Common$L === void 0 ? void 0 : _annotations$Common$L.toString()) ?? "";
      }
      return _this;
    }
    _exports = FormElementBlock;
    var _proto = FormElementBlock.prototype;
    _proto.getFields = function getFields() {
      if (this.fields) {
        return xml`<slot name="fields" />`;
      } else {
        return xml`<macros:Field
						metaPath="${this.metaPath}"
						contextPath="${this.contextPath}"
						id="${this.createId("FormElementField")}" />`;
      }
    };
    _proto.getTemplate = function getTemplate() {
      return xml`<f:FormElement xmlns:f="sap.ui.layout.form" id="${this.id}"
			key="${this.key}"
			label="${this.label}"
			visible="${this.visible}">
			<f:fields>
				${this.getFields()}
			</f:fields>
		</f:FormElement>`;
    };
    return FormElementBlock;
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "label", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "key", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "fields", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FormElementBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtRWxlbWVudEJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImJsb2NrQWdncmVnYXRpb24iLCJzbG90IiwiaXNEZWZhdWx0Iiwib1Byb3BzIiwiY29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsIm9Db250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm1ldGFQYXRoIiwiY29udGV4dFBhdGgiLCJsYWJlbCIsInVuZGVmaW5lZCIsInRhcmdldE9iamVjdCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiTGFiZWwiLCJ0b1N0cmluZyIsImdldEZpZWxkcyIsImZpZWxkcyIsInhtbCIsImNyZWF0ZUlkIiwiZ2V0VGVtcGxhdGUiLCJpZCIsImtleSIsInZpc2libGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRm9ybUVsZW1lbnRCbG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFNlcnZpY2VPYmplY3QgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IGJsb2NrQWdncmVnYXRpb24sIGJsb2NrQXR0cmlidXRlLCBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgYSBmb3JtIGVsZW1lbnQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICpcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjkwLjBcbiAqL1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiRm9ybUVsZW1lbnRcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcm1FbGVtZW50QmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBUaGUgaWRlbnRpZmllciBvZiB0aGUgRm9ybUVsZW1lbnQgYnVpbGRpbmcgYmxvY2suXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBwYXRoIG9mIHRoZSBjb250ZXh0IHVzZWQgaW4gdGhlIGN1cnJlbnQgcGFnZSBvciBibG9jay5cblx0ICogVGhpcyBzZXR0aW5nIGlzIGRlZmluZWQgYnkgdGhlIGZyYW1ld29yay5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWVcblx0fSlcblx0Y29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbWV0YW1vZGVsLCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZXh0UGF0aC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWVcblx0fSlcblx0bWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBMYWJlbCBzaG93biBmb3IgdGhlIGZpZWxkLiBJZiBub3Qgc2V0LCB0aGUgbGFiZWwgZnJvbSB0aGUgYW5ub3RhdGlvbnMgd2lsbCBiZSBzaG93bi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRsYWJlbCE6IHN0cmluZztcblxuXHQvKipcblx0ICogSWYgc2V0IHRvIGZhbHNlLCB0aGUgRm9ybUVsZW1lbnQgaXMgbm90IHJlbmRlcmVkLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHR2aXNpYmxlPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGtleT86IHN0cmluZztcblxuXHQvKipcblx0ICogT3B0aW9uYWwgYWdncmVnYXRpb24gb2YgY29udHJvbHMgdGhhdCBzaG91bGQgYmUgZGlzcGxheWVkIGluc2lkZSB0aGUgRm9ybUVsZW1lbnQuXG5cdCAqIElmIG5vdCBzZXQsIGEgZGVmYXVsdCBGaWVsZCBidWlsZGluZyBibG9jayB3aWxsIGJlIHJlbmRlcmVkXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBibG9ja0FnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIHNsb3Q6IFwiZmllbGRzXCIsIGlzRGVmYXVsdDogdHJ1ZSB9KVxuXHRmaWVsZHM/OiBDb250cm9sW107XG5cblx0Y29uc3RydWN0b3Iob1Byb3BzOiBQcm9wZXJ0aWVzT2Y8Rm9ybUVsZW1lbnRCbG9jaz4sIGNvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihvUHJvcHMsIGNvbmZpZ3VyYXRpb24sIG1TZXR0aW5ncyk7XG5cdFx0Y29uc3Qgb0NvbnRleHRPYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMubWV0YVBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdGlmICh0aGlzLmxhYmVsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMubGFiZWwgPSAob0NvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBTZXJ2aWNlT2JqZWN0KS5hbm5vdGF0aW9ucy5Db21tb24/LkxhYmVsPy50b1N0cmluZygpID8/IFwiXCI7XG5cdFx0fVxuXHR9XG5cblx0Z2V0RmllbGRzKCkge1xuXHRcdGlmICh0aGlzLmZpZWxkcykge1xuXHRcdFx0cmV0dXJuIHhtbGA8c2xvdCBuYW1lPVwiZmllbGRzXCIgLz5gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4geG1sYDxtYWNyb3M6RmllbGRcblx0XHRcdFx0XHRcdG1ldGFQYXRoPVwiJHt0aGlzLm1ldGFQYXRofVwiXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aD1cIiR7dGhpcy5jb250ZXh0UGF0aH1cIlxuXHRcdFx0XHRcdFx0aWQ9XCIke3RoaXMuY3JlYXRlSWQoXCJGb3JtRWxlbWVudEZpZWxkXCIpfVwiIC8+YDtcblx0XHR9XG5cdH1cblxuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4geG1sYDxmOkZvcm1FbGVtZW50IHhtbG5zOmY9XCJzYXAudWkubGF5b3V0LmZvcm1cIiBpZD1cIiR7dGhpcy5pZH1cIlxuXHRcdFx0a2V5PVwiJHt0aGlzLmtleX1cIlxuXHRcdFx0bGFiZWw9XCIke3RoaXMubGFiZWx9XCJcblx0XHRcdHZpc2libGU9XCIke3RoaXMudmlzaWJsZX1cIj5cblx0XHRcdDxmOmZpZWxkcz5cblx0XHRcdFx0JHt0aGlzLmdldEZpZWxkcygpfVxuXHRcdFx0PC9mOmZpZWxkcz5cblx0XHQ8L2Y6Rm9ybUVsZW1lbnQ+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFtQnFCQSxnQkFBZ0I7RUFYckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsT0FPQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxhQUFhO0lBQ25CQyxTQUFTLEVBQUU7RUFDWixDQUFDLENBQUMsVUFPQUMsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQVNsREYsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxzQkFBc0I7SUFDNUJDLFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQVFERixjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBUURGLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFRbENELGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVSxDQUFDLENBQUMsVUFHbkNELGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFTbENFLGdCQUFnQixDQUFDO0lBQUVGLElBQUksRUFBRSxxQkFBcUI7SUFBRUcsSUFBSSxFQUFFLFFBQVE7SUFBRUMsU0FBUyxFQUFFO0VBQUssQ0FBQyxDQUFDO0lBQUE7SUF4RG5GO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0lBSUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztJQU9DO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0lBT0M7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7SUFJQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztJQU9DO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7SUFJQywwQkFBWUMsTUFBc0MsRUFBRUMsYUFBa0IsRUFBRUMsU0FBYyxFQUFFO01BQUE7TUFDdkYsc0NBQU1GLE1BQU0sRUFBRUMsYUFBYSxFQUFFQyxTQUFTLENBQUM7TUFBQztNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUN4QyxNQUFNQyxrQkFBa0IsR0FBR0MsMkJBQTJCLENBQUMsTUFBS0MsUUFBUSxFQUFFLE1BQUtDLFdBQVcsQ0FBQztNQUN2RixJQUFJLE1BQUtDLEtBQUssS0FBS0MsU0FBUyxFQUFFO1FBQUE7UUFDN0IsTUFBS0QsS0FBSyxHQUFHLHdCQUFDSixrQkFBa0IsQ0FBQ00sWUFBWSxDQUFtQkMsV0FBVyxDQUFDQyxNQUFNLGlGQUFyRSxvQkFBdUVDLEtBQUssMERBQTVFLHNCQUE4RUMsUUFBUSxFQUFFLEtBQUksRUFBRTtNQUM1RztNQUFDO0lBQ0Y7SUFBQztJQUFBO0lBQUEsT0FFREMsU0FBUyxHQUFULHFCQUFZO01BQ1gsSUFBSSxJQUFJLENBQUNDLE1BQU0sRUFBRTtRQUNoQixPQUFPQyxHQUFJLHdCQUF1QjtNQUNuQyxDQUFDLE1BQU07UUFDTixPQUFPQSxHQUFJO0FBQ2Qsa0JBQWtCLElBQUksQ0FBQ1gsUUFBUztBQUNoQyxxQkFBcUIsSUFBSSxDQUFDQyxXQUFZO0FBQ3RDLFlBQVksSUFBSSxDQUFDVyxRQUFRLENBQUMsa0JBQWtCLENBQUUsTUFBSztNQUNqRDtJQUNELENBQUM7SUFBQSxPQUVEQyxXQUFXLEdBQVgsdUJBQWM7TUFDYixPQUFPRixHQUFJLG1EQUFrRCxJQUFJLENBQUNHLEVBQUc7QUFDdkUsVUFBVSxJQUFJLENBQUNDLEdBQUk7QUFDbkIsWUFBWSxJQUFJLENBQUNiLEtBQU07QUFDdkIsY0FBYyxJQUFJLENBQUNjLE9BQVE7QUFDM0I7QUFDQSxNQUFNLElBQUksQ0FBQ1AsU0FBUyxFQUFHO0FBQ3ZCO0FBQ0EsbUJBQW1CO0lBQ2xCLENBQUM7SUFBQTtFQUFBLEVBeEY0Q1EsaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9