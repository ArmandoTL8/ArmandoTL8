/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/UIComponent", "sap/ui/mdc/p13n/StateUtil"], function (CommonUtils, ClassSupport, UIComponent, StateUtil) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let TemplateComponent = (_dec = defineUI5Class("sap.fe.core.TemplateComponent"), _dec2 = implementInterface("sap.ui.core.IAsyncContentCreation"), _dec3 = property({
    type: "string",
    defaultValue: null
  }), _dec4 = property({
    type: "string",
    defaultValue: null
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "object"
  }), _dec7 = property({
    type: "string[]"
  }), _dec8 = property({
    type: "object"
  }), _dec9 = property({
    type: "object"
  }), _dec10 = property({
    type: "boolean"
  }), _dec11 = property({
    type: "object"
  }), _dec12 = property({
    type: "string"
  }), _dec13 = event(), _dec14 = event(), _dec15 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_UIComponent) {
    _inheritsLoose(TemplateComponent, _UIComponent);
    function TemplateComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _UIComponent.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IAsyncContentCreation", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "bindingContextPattern", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigation", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enhanceI18n", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "controlConfiguration", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "allowDeepLinking", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "refreshStrategyOnAppRestore", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewType", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "containerDefined", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "heroesBatchReceived", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "workersBatchReceived", _descriptor14, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = TemplateComponent.prototype;
    _proto.setContainer = function setContainer(oContainer) {
      _UIComponent.prototype.setContainer.call(this, oContainer);
      this.fireEvent("containerDefined", {
        container: oContainer
      });
      return this;
    };
    _proto.init = function init() {
      this.oAppComponent = CommonUtils.getAppComponent(this);
      _UIComponent.prototype.init.call(this);
      const oStateChangeHandler = function (oEvent) {
        const oControl = oEvent.getParameter("control");
        if (oControl.isA("sap.ui.mdc.Table") || oControl.isA("sap.ui.mdc.FilterBar") || oControl.isA("sap.ui.mdc.Chart")) {
          const oMacroAPI = oControl.getParent();
          if (oMacroAPI !== null && oMacroAPI !== void 0 && oMacroAPI.fireStateChange) {
            oMacroAPI.fireStateChange();
          }
        }
      };
      StateUtil.detachStateChange(oStateChangeHandler);
      StateUtil.attachStateChange(oStateChangeHandler);
    }

    // This method is called by UI5 core to access to the component containing the customizing configuration.
    // as controller extensions are defined in the manifest for the app component and not for the
    // template component we return the app component.
    ;
    _proto.getExtensionComponent = function getExtensionComponent() {
      return this.oAppComponent;
    };
    _proto.getRootController = function getRootController() {
      const rootControl = this.getRootControl();
      let rootController;
      if (rootControl && rootControl.getController) {
        rootController = rootControl.getController();
      }
      return rootController;
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      const rootController = this.getRootController();
      if (rootController && rootController.onPageReady) {
        rootController.onPageReady(mParameters);
      }
    };
    _proto.getNavigationConfiguration = function getNavigationConfiguration(sTargetPath) {
      const mNavigation = this.navigation;
      return mNavigation[sTargetPath];
    };
    _proto.getViewData = function getViewData() {
      const mProperties = this.getMetadata().getAllProperties();
      const oViewData = Object.keys(mProperties).reduce((mViewData, sPropertyName) => {
        mViewData[sPropertyName] = mProperties[sPropertyName].get(this);
        return mViewData;
      }, {});

      // Access the internal _isFclEnabled which will be there
      oViewData.fclEnabled = this.oAppComponent._isFclEnabled();
      return oViewData;
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const rootControl = this.getRootControl();
      if (rootControl && rootControl.getController() && rootControl.getController()._getPageTitleInformation) {
        return rootControl.getController()._getPageTitleInformation();
      } else {
        return {};
      }
    };
    _proto.getExtensionAPI = function getExtensionAPI() {
      return this.getRootControl().getController().getExtensionAPI();
    };
    return TemplateComponent;
  }(UIComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IAsyncContentCreation", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return null;
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return null;
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "bindingContextPattern", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "navigation", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "enhanceI18n", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "controlConfiguration", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "allowDeepLinking", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "refreshStrategyOnAppRestore", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "viewType", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "XML";
    }
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "containerDefined", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "heroesBatchReceived", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "workersBatchReceived", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return TemplateComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZUNvbXBvbmVudCIsImRlZmluZVVJNUNsYXNzIiwiaW1wbGVtZW50SW50ZXJmYWNlIiwicHJvcGVydHkiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiZXZlbnQiLCJzZXRDb250YWluZXIiLCJvQ29udGFpbmVyIiwiZmlyZUV2ZW50IiwiY29udGFpbmVyIiwiaW5pdCIsIm9BcHBDb21wb25lbnQiLCJDb21tb25VdGlscyIsImdldEFwcENvbXBvbmVudCIsIm9TdGF0ZUNoYW5nZUhhbmRsZXIiLCJvRXZlbnQiLCJvQ29udHJvbCIsImdldFBhcmFtZXRlciIsImlzQSIsIm9NYWNyb0FQSSIsImdldFBhcmVudCIsImZpcmVTdGF0ZUNoYW5nZSIsIlN0YXRlVXRpbCIsImRldGFjaFN0YXRlQ2hhbmdlIiwiYXR0YWNoU3RhdGVDaGFuZ2UiLCJnZXRFeHRlbnNpb25Db21wb25lbnQiLCJnZXRSb290Q29udHJvbGxlciIsInJvb3RDb250cm9sIiwiZ2V0Um9vdENvbnRyb2wiLCJyb290Q29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJvblBhZ2VSZWFkeSIsIm1QYXJhbWV0ZXJzIiwiZ2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24iLCJzVGFyZ2V0UGF0aCIsIm1OYXZpZ2F0aW9uIiwibmF2aWdhdGlvbiIsImdldFZpZXdEYXRhIiwibVByb3BlcnRpZXMiLCJnZXRNZXRhZGF0YSIsImdldEFsbFByb3BlcnRpZXMiLCJvVmlld0RhdGEiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlIiwibVZpZXdEYXRhIiwic1Byb3BlcnR5TmFtZSIsImdldCIsImZjbEVuYWJsZWQiLCJfaXNGY2xFbmFibGVkIiwiX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uIiwiZ2V0RXh0ZW5zaW9uQVBJIiwiVUlDb21wb25lbnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRlbXBsYXRlQ29tcG9uZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBldmVudCwgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbXBvbmVudENvbnRhaW5lciBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50Q29udGFpbmVyXCI7XG5pbXBvcnQgdHlwZSB7IElBc3luY0NvbnRlbnRDcmVhdGlvbiB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IFVJQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9VSUNvbXBvbmVudFwiO1xuaW1wb3J0IFN0YXRlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9wMTNuL1N0YXRlVXRpbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcblxudHlwZSBOYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiA9IHtcblx0ZGV0YWlsOiB7XG5cdFx0cm91dGU6IHN0cmluZztcblx0XHRwYXJhbWV0ZXJzOiB1bmtub3duO1xuXHR9O1xufTtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuVGVtcGxhdGVDb21wb25lbnRcIilcbmNsYXNzIFRlbXBsYXRlQ29tcG9uZW50IGV4dGVuZHMgVUlDb21wb25lbnQgaW1wbGVtZW50cyBJQXN5bmNDb250ZW50Q3JlYXRpb24ge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUFzeW5jQ29udGVudENyZWF0aW9uXCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX2NvcmVfSUFzeW5jQ29udGVudENyZWF0aW9uID0gdHJ1ZTtcblxuXHQvKipcblx0ICogTmFtZSBvZiB0aGUgT0RhdGEgZW50aXR5IHNldFxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBudWxsIH0pXG5cdGVudGl0eVNldDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cblx0LyoqXG5cdCAqIENvbnRleHQgUGF0aCBmb3IgcmVuZGVyaW5nIHRoZSB0ZW1wbGF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBudWxsIH0pXG5cdGNvbnRleHRQYXRoOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuXHQvKipcblx0ICogVGhlIHBhdHRlcm4gZm9yIHRoZSBiaW5kaW5nIGNvbnRleHQgdG8gYmUgY3JlYXRlIGJhc2VkIG9uIHRoZSBwYXJhbWV0ZXJzIGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICogSWYgbm90IHByb3ZpZGVkIHdlJ2xsIGRlZmF1bHQgdG8gd2hhdCB3YXMgcGFzc2VkIGluIHRoZSBVUkxcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0YmluZGluZ0NvbnRleHRQYXR0ZXJuITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBNYXAgb2YgdXNlZCBPRGF0YSBuYXZpZ2F0aW9ucyBhbmQgaXRzIHJvdXRpbmcgdGFyZ2V0c1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJvYmplY3RcIiB9KVxuXHRuYXZpZ2F0aW9uITogUmVjb3JkPHN0cmluZywgTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24+O1xuXG5cdC8qKlxuXHQgKiBFbmhhbmNlIHRoZSBpMThuIGJ1bmRsZSB1c2VkIGZvciB0aGlzIHBhZ2Ugd2l0aCBvbmUgb3IgbW9yZSBhcHAgc3BlY2lmaWMgaTE4biByZXNvdXJjZSBidW5kbGVzIG9yIHJlc291cmNlIG1vZGVsc1xuXHQgKiBvciBhIGNvbWJpbmF0aW9uIG9mIGJvdGguIFRoZSBsYXN0IHJlc291cmNlIGJ1bmRsZS9tb2RlbCBpcyBnaXZlbiBoaWdoZXN0IHByaW9yaXR5XG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1tdXCIgfSlcblx0ZW5oYW5jZUkxOG4hOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogRGVmaW5lIGNvbnRyb2wgcmVsYXRlZCBjb25maWd1cmF0aW9uIHNldHRpbmdzXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdGNvbnRyb2xDb25maWd1cmF0aW9uPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cblx0LyoqXG5cdCAqIEFkanVzdHMgdGhlIHRlbXBsYXRlIGNvbnRlbnRcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwib2JqZWN0XCIgfSlcblx0Y29udGVudD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB5b3UgY2FuIHJlYWNoIHRoaXMgcGFnZSBkaXJlY3RseSB0aHJvdWdoIHNlbWFudGljIGJvb2ttYXJrc1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0YWxsb3dEZWVwTGlua2luZyE6IGJvb2xlYW47XG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBjb250ZXh0IHBhdGggb24gdGhlIGNvbXBvbmVudCB0aGF0IGlzIHJlZnJlc2hlZCB3aGVuIHRoZSBhcHAgaXMgcmVzdG9yZWQgdXNpbmcga2VlcCBhbGl2ZSBtb2RlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdHJlZnJlc2hTdHJhdGVneU9uQXBwUmVzdG9yZTogdW5rbm93bjtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZpZXdUeXBlID0gXCJYTUxcIjtcblxuXHRAZXZlbnQoKVxuXHRjb250YWluZXJEZWZpbmVkITogRnVuY3Rpb247XG5cblx0QGV2ZW50KClcblx0aGVyb2VzQmF0Y2hSZWNlaXZlZCE6IEZ1bmN0aW9uO1xuXG5cdEBldmVudCgpXG5cdHdvcmtlcnNCYXRjaFJlY2VpdmVkITogRnVuY3Rpb247XG5cblx0cHJvdGVjdGVkIG9BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cblx0c2V0Q29udGFpbmVyKG9Db250YWluZXI6IENvbXBvbmVudENvbnRhaW5lcik6IHRoaXMge1xuXHRcdHN1cGVyLnNldENvbnRhaW5lcihvQ29udGFpbmVyKTtcblx0XHR0aGlzLmZpcmVFdmVudChcImNvbnRhaW5lckRlZmluZWRcIiwgeyBjb250YWluZXI6IG9Db250YWluZXIgfSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRpbml0KCkge1xuXHRcdHRoaXMub0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzKTtcblx0XHRzdXBlci5pbml0KCk7XG5cdFx0Y29uc3Qgb1N0YXRlQ2hhbmdlSGFuZGxlciA9IGZ1bmN0aW9uIChvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0XHRjb25zdCBvQ29udHJvbCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJjb250cm9sXCIpO1xuXHRcdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgfHwgb0NvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5GaWx0ZXJCYXJcIikgfHwgb0NvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5DaGFydFwiKSkge1xuXHRcdFx0XHRjb25zdCBvTWFjcm9BUEkgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0aWYgKG9NYWNyb0FQST8uZmlyZVN0YXRlQ2hhbmdlKSB7XG5cdFx0XHRcdFx0b01hY3JvQVBJLmZpcmVTdGF0ZUNoYW5nZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRTdGF0ZVV0aWwuZGV0YWNoU3RhdGVDaGFuZ2Uob1N0YXRlQ2hhbmdlSGFuZGxlcik7XG5cdFx0U3RhdGVVdGlsLmF0dGFjaFN0YXRlQ2hhbmdlKG9TdGF0ZUNoYW5nZUhhbmRsZXIpO1xuXHR9XG5cblx0Ly8gVGhpcyBtZXRob2QgaXMgY2FsbGVkIGJ5IFVJNSBjb3JlIHRvIGFjY2VzcyB0byB0aGUgY29tcG9uZW50IGNvbnRhaW5pbmcgdGhlIGN1c3RvbWl6aW5nIGNvbmZpZ3VyYXRpb24uXG5cdC8vIGFzIGNvbnRyb2xsZXIgZXh0ZW5zaW9ucyBhcmUgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QgZm9yIHRoZSBhcHAgY29tcG9uZW50IGFuZCBub3QgZm9yIHRoZVxuXHQvLyB0ZW1wbGF0ZSBjb21wb25lbnQgd2UgcmV0dXJuIHRoZSBhcHAgY29tcG9uZW50LlxuXHRnZXRFeHRlbnNpb25Db21wb25lbnQoKTogQXBwQ29tcG9uZW50IHtcblx0XHRyZXR1cm4gdGhpcy5vQXBwQ29tcG9uZW50O1xuXHR9XG5cblx0Z2V0Um9vdENvbnRyb2xsZXIoKTogUGFnZUNvbnRyb2xsZXIgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IHJvb3RDb250cm9sOiBWaWV3ID0gdGhpcy5nZXRSb290Q29udHJvbCgpO1xuXHRcdGxldCByb290Q29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIgfCB1bmRlZmluZWQ7XG5cdFx0aWYgKHJvb3RDb250cm9sICYmIHJvb3RDb250cm9sLmdldENvbnRyb2xsZXIpIHtcblx0XHRcdHJvb3RDb250cm9sbGVyID0gcm9vdENvbnRyb2wuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyO1xuXHRcdH1cblx0XHRyZXR1cm4gcm9vdENvbnRyb2xsZXI7XG5cdH1cblxuXHRvblBhZ2VSZWFkeShtUGFyYW1ldGVyczogdW5rbm93bikge1xuXHRcdGNvbnN0IHJvb3RDb250cm9sbGVyID0gdGhpcy5nZXRSb290Q29udHJvbGxlcigpO1xuXHRcdGlmIChyb290Q29udHJvbGxlciAmJiByb290Q29udHJvbGxlci5vblBhZ2VSZWFkeSkge1xuXHRcdFx0cm9vdENvbnRyb2xsZXIub25QYWdlUmVhZHkobVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdGdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKHNUYXJnZXRQYXRoOiBzdHJpbmcpOiBOYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiB7XG5cdFx0Y29uc3QgbU5hdmlnYXRpb24gPSB0aGlzLm5hdmlnYXRpb247XG5cdFx0cmV0dXJuIG1OYXZpZ2F0aW9uW3NUYXJnZXRQYXRoXTtcblx0fVxuXG5cdGdldFZpZXdEYXRhKCkge1xuXHRcdGNvbnN0IG1Qcm9wZXJ0aWVzID0gdGhpcy5nZXRNZXRhZGF0YSgpLmdldEFsbFByb3BlcnRpZXMoKTtcblx0XHRjb25zdCBvVmlld0RhdGEgPSBPYmplY3Qua2V5cyhtUHJvcGVydGllcykucmVkdWNlKChtVmlld0RhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBzUHJvcGVydHlOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdG1WaWV3RGF0YVtzUHJvcGVydHlOYW1lXSA9IG1Qcm9wZXJ0aWVzW3NQcm9wZXJ0eU5hbWVdLmdldCEodGhpcyk7XG5cdFx0XHRyZXR1cm4gbVZpZXdEYXRhO1xuXHRcdH0sIHt9KTtcblxuXHRcdC8vIEFjY2VzcyB0aGUgaW50ZXJuYWwgX2lzRmNsRW5hYmxlZCB3aGljaCB3aWxsIGJlIHRoZXJlXG5cdFx0b1ZpZXdEYXRhLmZjbEVuYWJsZWQgPSB0aGlzLm9BcHBDb21wb25lbnQuX2lzRmNsRW5hYmxlZCgpO1xuXG5cdFx0cmV0dXJuIG9WaWV3RGF0YTtcblx0fVxuXG5cdF9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbigpIHtcblx0XHRjb25zdCByb290Q29udHJvbCA9IHRoaXMuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRpZiAocm9vdENvbnRyb2wgJiYgcm9vdENvbnRyb2wuZ2V0Q29udHJvbGxlcigpICYmIHJvb3RDb250cm9sLmdldENvbnRyb2xsZXIoKS5fZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24pIHtcblx0XHRcdHJldHVybiByb290Q29udHJvbC5nZXRDb250cm9sbGVyKCkuX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cdH1cblxuXHRnZXRFeHRlbnNpb25BUEkoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0Um9vdENvbnRyb2woKS5nZXRDb250cm9sbGVyKCkuZ2V0RXh0ZW5zaW9uQVBJKCk7XG5cdH1cbn1cbmludGVyZmFjZSBUZW1wbGF0ZUNvbXBvbmVudCB7XG5cdC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIGlkZWFsbHkgYmUgaGFuZGxlZCBieSB0aGUgZWRpdGZsb3cvcm91dGluZyB3aXRob3V0IHRoZSBuZWVkIHRvIGhhdmUgdGhpcyBtZXRob2QgaW4gdGhlIG9iamVjdCBwYWdlIC0gZm9yIG5vdyBrZWVwIGl0IGhlcmVcblx0Y3JlYXRlRGVmZXJyZWRDb250ZXh0PyhzUGF0aDogc3RyaW5nLCBvTGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcsIGJBY3Rpb25DcmVhdGU6IGJvb2xlYW4pOiB2b2lkO1xuXHRnZXRSb290Q29udHJvbCgpOiB7IGdldENvbnRyb2xsZXIoKTogUGFnZUNvbnRyb2xsZXIgfSAmIFZpZXc7XG5cdGV4dGVuZFBhZ2VEZWZpbml0aW9uPyhwYWdlRGVmaW5pdGlvbjoge30sIGNvbnZlcnRlckNvbnRleHQ/OiBDb252ZXJ0ZXJDb250ZXh0KToge307XG59XG5leHBvcnQgZGVmYXVsdCBUZW1wbGF0ZUNvbXBvbmVudDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O01BcUJNQSxpQkFBaUIs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