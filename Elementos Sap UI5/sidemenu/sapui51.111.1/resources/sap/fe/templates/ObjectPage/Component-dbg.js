/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/library", "sap/fe/core/TemplateComponent", "sap/fe/templates/library", "sap/fe/templates/ObjectPage/ExtendPageDefinition", "sap/ui/model/odata/v4/ODataListBinding"], function (Log, CommonUtils, ClassSupport, CoreLibrary, TemplateComponent, templateLib, ExtendPageDefinition, ODataListBinding) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var extendObjectPageDefinition = ExtendPageDefinition.extendObjectPageDefinition;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const VariantManagement = CoreLibrary.VariantManagement,
    CreationMode = CoreLibrary.CreationMode;
  const SectionLayout = templateLib.ObjectPage.SectionLayout;
  let ObjectPageComponent = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.Component", {
    library: "sap.fe.templates",
    manifest: "json"
  }), _dec2 = property({
    type: "sap.fe.core.VariantManagement",
    defaultValue: VariantManagement.Control
  }), _dec3 = property({
    type: "sap.fe.templates.ObjectPage.SectionLayout",
    defaultValue: SectionLayout.Page
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "object"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "boolean",
    defaultValue: true
  }), _dec8 = property({
    type: "object"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_TemplateComponent) {
    _inheritsLoose(ObjectPageComponent, _TemplateComponent);
    function ObjectPageComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _TemplateComponent.call(this, ...args) || this;
      _initializerDefineProperty(_this, "variantManagement", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "sectionLayout", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showRelatedApps", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "additionalSemanticObjects", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editableHeaderContent", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showBreadCrumbs", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "inboundParameters", _descriptor7, _assertThisInitialized(_this));
      _this.DeferredContextCreated = false;
      return _this;
    }
    var _proto = ObjectPageComponent.prototype;
    _proto.isContextExpected = function isContextExpected() {
      return true;
    };
    _proto.extendPageDefinition = function extendPageDefinition(pageDefinition, converterContext) {
      return extendObjectPageDefinition(pageDefinition, converterContext);
    }

    // TODO: this should be ideally be handled by the editflow/routing without the need to have this method in the
    // object page - for now keep it here
    ;
    _proto.createDeferredContext = function createDeferredContext(sPath, oListBinding, bActionCreate) {
      if (!this.DeferredContextCreated) {
        this.DeferredContextCreated = true;
        const oParameters = {
          $$groupId: "$auto.Heroes",
          $$updateGroupId: "$auto"
        };
        // In fullscreen mode, we recreate the list binding, as we don't want to have synchronization between views
        // (it causes errors, e.g. pending changes due to creationRow)
        if (!oListBinding || oListBinding.isRelative() === false && !this.oAppComponent.getRootViewController().isFclEnabled()) {
          oListBinding = new ODataListBinding(this.getModel(), sPath.replace("(...)", ""), undefined, undefined, undefined, oParameters);
        }
        const oStartUpParams = this.oAppComponent && this.oAppComponent.getComponentData() && this.oAppComponent.getComponentData().startupParameters,
          oInboundParameters = this.getViewData().inboundParameters;
        let createParams;
        if (oStartUpParams && oStartUpParams.preferredMode && oStartUpParams.preferredMode[0].indexOf("create") !== -1) {
          createParams = CommonUtils.getAdditionalParamsForCreate(oStartUpParams, oInboundParameters);
        }

        // for now wait until the view and the controller is created
        this.getRootControl().getController().editFlow.createDocument(oListBinding, {
          creationMode: CreationMode.Sync,
          createAction: bActionCreate,
          data: createParams,
          bFromDeferred: true
        }).finally(() => {
          this.DeferredContextCreated = false;
        }).catch(function () {
          // Do Nothing ?
        });
      }
    };
    _proto.setVariantManagement = function setVariantManagement(sVariantManagement) {
      if (sVariantManagement === VariantManagement.Page) {
        Log.error("ObjectPage does not support Page-level variant management yet");
        sVariantManagement = VariantManagement.None;
      }
      this.setProperty("variantManagement", sVariantManagement);
    };
    return ObjectPageComponent;
  }(TemplateComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "sectionLayout", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "showRelatedApps", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "additionalSemanticObjects", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "editableHeaderContent", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showBreadCrumbs", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "inboundParameters", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ObjectPageComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYXJpYW50TWFuYWdlbWVudCIsIkNvcmVMaWJyYXJ5IiwiQ3JlYXRpb25Nb2RlIiwiU2VjdGlvbkxheW91dCIsInRlbXBsYXRlTGliIiwiT2JqZWN0UGFnZSIsIk9iamVjdFBhZ2VDb21wb25lbnQiLCJkZWZpbmVVSTVDbGFzcyIsImxpYnJhcnkiLCJtYW5pZmVzdCIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsIkNvbnRyb2wiLCJQYWdlIiwiRGVmZXJyZWRDb250ZXh0Q3JlYXRlZCIsImlzQ29udGV4dEV4cGVjdGVkIiwiZXh0ZW5kUGFnZURlZmluaXRpb24iLCJwYWdlRGVmaW5pdGlvbiIsImNvbnZlcnRlckNvbnRleHQiLCJleHRlbmRPYmplY3RQYWdlRGVmaW5pdGlvbiIsImNyZWF0ZURlZmVycmVkQ29udGV4dCIsInNQYXRoIiwib0xpc3RCaW5kaW5nIiwiYkFjdGlvbkNyZWF0ZSIsIm9QYXJhbWV0ZXJzIiwiJCRncm91cElkIiwiJCR1cGRhdGVHcm91cElkIiwiaXNSZWxhdGl2ZSIsIm9BcHBDb21wb25lbnQiLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJpc0ZjbEVuYWJsZWQiLCJPRGF0YUxpc3RCaW5kaW5nIiwiZ2V0TW9kZWwiLCJyZXBsYWNlIiwidW5kZWZpbmVkIiwib1N0YXJ0VXBQYXJhbXMiLCJnZXRDb21wb25lbnREYXRhIiwic3RhcnR1cFBhcmFtZXRlcnMiLCJvSW5ib3VuZFBhcmFtZXRlcnMiLCJnZXRWaWV3RGF0YSIsImluYm91bmRQYXJhbWV0ZXJzIiwiY3JlYXRlUGFyYW1zIiwicHJlZmVycmVkTW9kZSIsImluZGV4T2YiLCJDb21tb25VdGlscyIsImdldEFkZGl0aW9uYWxQYXJhbXNGb3JDcmVhdGUiLCJnZXRSb290Q29udHJvbCIsImdldENvbnRyb2xsZXIiLCJlZGl0RmxvdyIsImNyZWF0ZURvY3VtZW50IiwiY3JlYXRpb25Nb2RlIiwiU3luYyIsImNyZWF0ZUFjdGlvbiIsImRhdGEiLCJiRnJvbURlZmVycmVkIiwiZmluYWxseSIsImNhdGNoIiwic2V0VmFyaWFudE1hbmFnZW1lbnQiLCJzVmFyaWFudE1hbmFnZW1lbnQiLCJMb2ciLCJlcnJvciIsIk5vbmUiLCJzZXRQcm9wZXJ0eSIsIlRlbXBsYXRlQ29tcG9uZW50Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb21wb25lbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMsIHsgSW5ib3VuZFBhcmFtZXRlciB9IGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgT2JqZWN0UGFnZURlZmluaXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy90ZW1wbGF0ZXMvT2JqZWN0UGFnZUNvbnZlcnRlclwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQ29yZUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBUZW1wbGF0ZUNvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVDb21wb25lbnRcIjtcbmltcG9ydCB0ZW1wbGF0ZUxpYiBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9saWJyYXJ5XCI7XG5pbXBvcnQgeyBleHRlbmRPYmplY3RQYWdlRGVmaW5pdGlvbiwgRmluYWxQYWdlRGVmaW5pdGlvbiB9IGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvRXh0ZW5kUGFnZURlZmluaXRpb25cIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuXG5jb25zdCBWYXJpYW50TWFuYWdlbWVudCA9IENvcmVMaWJyYXJ5LlZhcmlhbnRNYW5hZ2VtZW50LFxuXHRDcmVhdGlvbk1vZGUgPSBDb3JlTGlicmFyeS5DcmVhdGlvbk1vZGU7XG5jb25zdCBTZWN0aW9uTGF5b3V0ID0gdGVtcGxhdGVMaWIuT2JqZWN0UGFnZS5TZWN0aW9uTGF5b3V0O1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkNvbXBvbmVudFwiLCB7IGxpYnJhcnk6IFwic2FwLmZlLnRlbXBsYXRlc1wiLCBtYW5pZmVzdDogXCJqc29uXCIgfSlcbmNsYXNzIE9iamVjdFBhZ2VDb21wb25lbnQgZXh0ZW5kcyBUZW1wbGF0ZUNvbXBvbmVudCB7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGlmIGFuZCBvbiB3aGljaCBsZXZlbCB2YXJpYW50cyBjYW4gYmUgY29uZmlndXJlZDpcblx0ICogXHRcdE5vbmU6IG5vIHZhcmlhbnQgY29uZmlndXJhdGlvbiBhdCBhbGxcblx0ICogXHRcdFBhZ2U6IG9uZSB2YXJpYW50IGNvbmZpZ3VyYXRpb24gZm9yIHRoZSB3aG9sZSBwYWdlXG5cdCAqIFx0XHRDb250cm9sOiB2YXJpYW50IGNvbmZpZ3VyYXRpb24gb24gY29udHJvbCBsZXZlbFxuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInNhcC5mZS5jb3JlLlZhcmlhbnRNYW5hZ2VtZW50XCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBWYXJpYW50TWFuYWdlbWVudC5Db250cm9sXG5cdH0pXG5cdHZhcmlhbnRNYW5hZ2VtZW50OiB0eXBlb2YgVmFyaWFudE1hbmFnZW1lbnQ7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGhvdyB0aGUgc2VjdGlvbnMgYXJlIHJlbmRlcmVkXG5cdCAqIFx0XHRQYWdlOiBhbGwgc2VjdGlvbnMgYXJlIHNob3duIG9uIG9uZSBwYWdlXG5cdCAqIFx0XHRUYWJzOiBlYWNoIHRvcC1sZXZlbCBzZWN0aW9uIGlzIHNob3duIGluIGFuIG93biB0YWJcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuU2VjdGlvbkxheW91dFwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogU2VjdGlvbkxheW91dC5QYWdlXG5cdH0pXG5cdHNlY3Rpb25MYXlvdXQ6IHR5cGVvZiBTZWN0aW9uTGF5b3V0O1xuXHQvKipcblx0ICogRW5hYmxlcyB0aGUgcmVsYXRlZCBhcHBzIGZlYXR1cmVzXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0fSlcblx0c2hvd1JlbGF0ZWRBcHBzITogYm9vbGVhbjtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdGFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHM6IGFueTtcblx0LyoqXG5cdCAqIEVuYWJsZXMgdGhlIGVkaXRhYmxlIG9iamVjdCBwYWdlIGhlYWRlclxuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0fSlcblx0ZWRpdGFibGVIZWFkZXJDb250ZW50ITogYm9vbGVhbjtcblx0LyoqXG5cdCAqIEVuYWJsZXMgdGhlIEJyZWFkQ3J1bWJzIGZlYXR1cmVzXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogdHJ1ZVxuXHR9KVxuXHRzaG93QnJlYWRDcnVtYnMhOiBib29sZWFuO1xuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcHJvcGVydGllcyB3aGljaCBjYW4gYmUgdXNlZCBmb3IgaW5ib3VuZCBOYXZpZ2F0aW9uXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwib2JqZWN0XCJcblx0fSlcblx0aW5ib3VuZFBhcmFtZXRlcnM6IGFueTtcblx0cHJpdmF0ZSBEZWZlcnJlZENvbnRleHRDcmVhdGVkOiBCb29sZWFuID0gZmFsc2U7XG5cblx0aXNDb250ZXh0RXhwZWN0ZWQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRleHRlbmRQYWdlRGVmaW5pdGlvbihwYWdlRGVmaW5pdGlvbjogT2JqZWN0UGFnZURlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBGaW5hbFBhZ2VEZWZpbml0aW9uIHtcblx0XHRyZXR1cm4gZXh0ZW5kT2JqZWN0UGFnZURlZmluaXRpb24ocGFnZURlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpO1xuXHR9XG5cblx0Ly8gVE9ETzogdGhpcyBzaG91bGQgYmUgaWRlYWxseSBiZSBoYW5kbGVkIGJ5IHRoZSBlZGl0Zmxvdy9yb3V0aW5nIHdpdGhvdXQgdGhlIG5lZWQgdG8gaGF2ZSB0aGlzIG1ldGhvZCBpbiB0aGVcblx0Ly8gb2JqZWN0IHBhZ2UgLSBmb3Igbm93IGtlZXAgaXQgaGVyZVxuXHRjcmVhdGVEZWZlcnJlZENvbnRleHQoc1BhdGg6IGFueSwgb0xpc3RCaW5kaW5nOiBhbnksIGJBY3Rpb25DcmVhdGU6IGFueSkge1xuXHRcdGlmICghdGhpcy5EZWZlcnJlZENvbnRleHRDcmVhdGVkKSB7XG5cdFx0XHR0aGlzLkRlZmVycmVkQ29udGV4dENyZWF0ZWQgPSB0cnVlO1xuXHRcdFx0Y29uc3Qgb1BhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdCQkZ3JvdXBJZDogXCIkYXV0by5IZXJvZXNcIixcblx0XHRcdFx0JCR1cGRhdGVHcm91cElkOiBcIiRhdXRvXCJcblx0XHRcdH07XG5cdFx0XHQvLyBJbiBmdWxsc2NyZWVuIG1vZGUsIHdlIHJlY3JlYXRlIHRoZSBsaXN0IGJpbmRpbmcsIGFzIHdlIGRvbid0IHdhbnQgdG8gaGF2ZSBzeW5jaHJvbml6YXRpb24gYmV0d2VlbiB2aWV3c1xuXHRcdFx0Ly8gKGl0IGNhdXNlcyBlcnJvcnMsIGUuZy4gcGVuZGluZyBjaGFuZ2VzIGR1ZSB0byBjcmVhdGlvblJvdylcblx0XHRcdGlmIChcblx0XHRcdFx0IW9MaXN0QmluZGluZyB8fFxuXHRcdFx0XHQob0xpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKSA9PT0gZmFsc2UgJiYgISh0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55KS5pc0ZjbEVuYWJsZWQoKSlcblx0XHRcdCkge1xuXHRcdFx0XHRvTGlzdEJpbmRpbmcgPSBuZXcgKE9EYXRhTGlzdEJpbmRpbmcgYXMgYW55KShcblx0XHRcdFx0XHR0aGlzLmdldE1vZGVsKCksXG5cdFx0XHRcdFx0c1BhdGgucmVwbGFjZShcIiguLi4pXCIsIFwiXCIpLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdG9QYXJhbWV0ZXJzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBvU3RhcnRVcFBhcmFtcyA9XG5cdFx0XHRcdFx0dGhpcy5vQXBwQ29tcG9uZW50ICYmIHRoaXMub0FwcENvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCkgJiYgdGhpcy5vQXBwQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKS5zdGFydHVwUGFyYW1ldGVycyxcblx0XHRcdFx0b0luYm91bmRQYXJhbWV0ZXJzID0gdGhpcy5nZXRWaWV3RGF0YSgpLmluYm91bmRQYXJhbWV0ZXJzIGFzIFJlY29yZDxzdHJpbmcsIEluYm91bmRQYXJhbWV0ZXI+IHwgdW5kZWZpbmVkO1xuXHRcdFx0bGV0IGNyZWF0ZVBhcmFtcztcblx0XHRcdGlmIChvU3RhcnRVcFBhcmFtcyAmJiBvU3RhcnRVcFBhcmFtcy5wcmVmZXJyZWRNb2RlICYmIG9TdGFydFVwUGFyYW1zLnByZWZlcnJlZE1vZGVbMF0uaW5kZXhPZihcImNyZWF0ZVwiKSAhPT0gLTEpIHtcblx0XHRcdFx0Y3JlYXRlUGFyYW1zID0gQ29tbW9uVXRpbHMuZ2V0QWRkaXRpb25hbFBhcmFtc0ZvckNyZWF0ZShvU3RhcnRVcFBhcmFtcywgb0luYm91bmRQYXJhbWV0ZXJzKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZm9yIG5vdyB3YWl0IHVudGlsIHRoZSB2aWV3IGFuZCB0aGUgY29udHJvbGxlciBpcyBjcmVhdGVkXG5cdFx0XHQodGhpcy5nZXRSb290Q29udHJvbCgpIGFzIGFueSlcblx0XHRcdFx0LmdldENvbnRyb2xsZXIoKVxuXHRcdFx0XHQuZWRpdEZsb3cuY3JlYXRlRG9jdW1lbnQob0xpc3RCaW5kaW5nLCB7XG5cdFx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBDcmVhdGlvbk1vZGUuU3luYyxcblx0XHRcdFx0XHRjcmVhdGVBY3Rpb246IGJBY3Rpb25DcmVhdGUsXG5cdFx0XHRcdFx0ZGF0YTogY3JlYXRlUGFyYW1zLFxuXHRcdFx0XHRcdGJGcm9tRGVmZXJyZWQ6IHRydWVcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuRGVmZXJyZWRDb250ZXh0Q3JlYXRlZCA9IGZhbHNlO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIERvIE5vdGhpbmcgP1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRzZXRWYXJpYW50TWFuYWdlbWVudChzVmFyaWFudE1hbmFnZW1lbnQ6IGFueSkge1xuXHRcdGlmIChzVmFyaWFudE1hbmFnZW1lbnQgPT09IFZhcmlhbnRNYW5hZ2VtZW50LlBhZ2UpIHtcblx0XHRcdExvZy5lcnJvcihcIk9iamVjdFBhZ2UgZG9lcyBub3Qgc3VwcG9ydCBQYWdlLWxldmVsIHZhcmlhbnQgbWFuYWdlbWVudCB5ZXRcIik7XG5cdFx0XHRzVmFyaWFudE1hbmFnZW1lbnQgPSBWYXJpYW50TWFuYWdlbWVudC5Ob25lO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJ2YXJpYW50TWFuYWdlbWVudFwiLCBzVmFyaWFudE1hbmFnZW1lbnQpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9iamVjdFBhZ2VDb21wb25lbnQ7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBV0EsTUFBTUEsaUJBQWlCLEdBQUdDLFdBQVcsQ0FBQ0QsaUJBQWlCO0lBQ3RERSxZQUFZLEdBQUdELFdBQVcsQ0FBQ0MsWUFBWTtFQUN4QyxNQUFNQyxhQUFhLEdBQUdDLFdBQVcsQ0FBQ0MsVUFBVSxDQUFDRixhQUFhO0VBQUMsSUFFckRHLG1CQUFtQixXQUR4QkMsY0FBYyxDQUFDLHVDQUF1QyxFQUFFO0lBQUVDLE9BQU8sRUFBRSxrQkFBa0I7SUFBRUMsUUFBUSxFQUFFO0VBQU8sQ0FBQyxDQUFDLFVBUXpHQyxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLCtCQUErQjtJQUNyQ0MsWUFBWSxFQUFFWixpQkFBaUIsQ0FBQ2E7RUFDakMsQ0FBQyxDQUFDLFVBT0RILFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsMkNBQTJDO0lBQ2pEQyxZQUFZLEVBQUVULGFBQWEsQ0FBQ1c7RUFDN0IsQ0FBQyxDQUFDLFVBS0RKLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUU7RUFDZixDQUFDLENBQUMsVUFHREYsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQUs1QkQsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxTQUFTO0lBQ2ZDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBQyxVQUtERixRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFNBQVM7SUFDZkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBS0RGLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUEsTUFFTUksc0JBQXNCLEdBQVksS0FBSztNQUFBO0lBQUE7SUFBQTtJQUFBLE9BRS9DQyxpQkFBaUIsR0FBakIsNkJBQW9CO01BQ25CLE9BQU8sSUFBSTtJQUNaLENBQUM7SUFBQSxPQUVEQyxvQkFBb0IsR0FBcEIsOEJBQXFCQyxjQUFvQyxFQUFFQyxnQkFBa0MsRUFBdUI7TUFDbkgsT0FBT0MsMEJBQTBCLENBQUNGLGNBQWMsRUFBRUMsZ0JBQWdCLENBQUM7SUFDcEU7O0lBRUE7SUFDQTtJQUFBO0lBQUEsT0FDQUUscUJBQXFCLEdBQXJCLCtCQUFzQkMsS0FBVSxFQUFFQyxZQUFpQixFQUFFQyxhQUFrQixFQUFFO01BQ3hFLElBQUksQ0FBQyxJQUFJLENBQUNULHNCQUFzQixFQUFFO1FBQ2pDLElBQUksQ0FBQ0Esc0JBQXNCLEdBQUcsSUFBSTtRQUNsQyxNQUFNVSxXQUFXLEdBQUc7VUFDbkJDLFNBQVMsRUFBRSxjQUFjO1VBQ3pCQyxlQUFlLEVBQUU7UUFDbEIsQ0FBQztRQUNEO1FBQ0E7UUFDQSxJQUNDLENBQUNKLFlBQVksSUFDWkEsWUFBWSxDQUFDSyxVQUFVLEVBQUUsS0FBSyxLQUFLLElBQUksQ0FBRSxJQUFJLENBQUNDLGFBQWEsQ0FBQ0MscUJBQXFCLEVBQUUsQ0FBU0MsWUFBWSxFQUFHLEVBQzNHO1VBQ0RSLFlBQVksR0FBRyxJQUFLUyxnQkFBZ0IsQ0FDbkMsSUFBSSxDQUFDQyxRQUFRLEVBQUUsRUFDZlgsS0FBSyxDQUFDWSxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUMxQkMsU0FBUyxFQUNUQSxTQUFTLEVBQ1RBLFNBQVMsRUFDVFYsV0FBVyxDQUNYO1FBQ0Y7UUFDQSxNQUFNVyxjQUFjLEdBQ2xCLElBQUksQ0FBQ1AsYUFBYSxJQUFJLElBQUksQ0FBQ0EsYUFBYSxDQUFDUSxnQkFBZ0IsRUFBRSxJQUFJLElBQUksQ0FBQ1IsYUFBYSxDQUFDUSxnQkFBZ0IsRUFBRSxDQUFDQyxpQkFBaUI7VUFDdkhDLGtCQUFrQixHQUFHLElBQUksQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLGlCQUFpRTtRQUMxRyxJQUFJQyxZQUFZO1FBQ2hCLElBQUlOLGNBQWMsSUFBSUEsY0FBYyxDQUFDTyxhQUFhLElBQUlQLGNBQWMsQ0FBQ08sYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7VUFDL0dGLFlBQVksR0FBR0csV0FBVyxDQUFDQyw0QkFBNEIsQ0FBQ1YsY0FBYyxFQUFFRyxrQkFBa0IsQ0FBQztRQUM1Rjs7UUFFQTtRQUNDLElBQUksQ0FBQ1EsY0FBYyxFQUFFLENBQ3BCQyxhQUFhLEVBQUUsQ0FDZkMsUUFBUSxDQUFDQyxjQUFjLENBQUMzQixZQUFZLEVBQUU7VUFDdEM0QixZQUFZLEVBQUVqRCxZQUFZLENBQUNrRCxJQUFJO1VBQy9CQyxZQUFZLEVBQUU3QixhQUFhO1VBQzNCOEIsSUFBSSxFQUFFWixZQUFZO1VBQ2xCYSxhQUFhLEVBQUU7UUFDaEIsQ0FBQyxDQUFDLENBQ0RDLE9BQU8sQ0FBQyxNQUFNO1VBQ2QsSUFBSSxDQUFDekMsc0JBQXNCLEdBQUcsS0FBSztRQUNwQyxDQUFDLENBQUMsQ0FDRDBDLEtBQUssQ0FBQyxZQUFZO1VBQ2xCO1FBQUEsQ0FDQSxDQUFDO01BQ0o7SUFDRCxDQUFDO0lBQUEsT0FFREMsb0JBQW9CLEdBQXBCLDhCQUFxQkMsa0JBQXVCLEVBQUU7TUFDN0MsSUFBSUEsa0JBQWtCLEtBQUszRCxpQkFBaUIsQ0FBQ2MsSUFBSSxFQUFFO1FBQ2xEOEMsR0FBRyxDQUFDQyxLQUFLLENBQUMsK0RBQStELENBQUM7UUFDMUVGLGtCQUFrQixHQUFHM0QsaUJBQWlCLENBQUM4RCxJQUFJO01BQzVDO01BRUEsSUFBSSxDQUFDQyxXQUFXLENBQUMsbUJBQW1CLEVBQUVKLGtCQUFrQixDQUFDO0lBQzFELENBQUM7SUFBQTtFQUFBLEVBM0hnQ0ssaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9BOEhwQzFELG1CQUFtQjtBQUFBIn0=