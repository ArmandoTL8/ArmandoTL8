/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/BaseController", "sap/fe/core/controllerextensions/EditFlow", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalEditFlow", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/MessageHandler", "sap/fe/core/controllerextensions/PageReady", "sap/fe/core/controllerextensions/Paginator", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Routing", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Component", "sap/ui/core/mvc/OverrideExecution"], function (BaseController, EditFlow, IntentBasedNavigation, InternalEditFlow, InternalIntentBasedNavigation, InternalRouting, MassEdit, MessageHandler, PageReady, Paginator, Placeholder, Routing, Share, SideEffects, ViewState, ExtensionAPI, ClassSupport, Component, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Base controller class for your custom page used inside an SAP Fiori elements application.
   *
   * This controller provides preconfigured extensions that will ensure you have the basic functionalities required to use the building blocks.
   *
   * @hideconstructor
   * @public
   * @since 1.88.0
   */
  let PageController = (_dec = defineUI5Class("sap.fe.core.PageController"), _dec2 = usingExtension(Routing), _dec3 = usingExtension(InternalRouting), _dec4 = usingExtension(EditFlow), _dec5 = usingExtension(InternalEditFlow), _dec6 = usingExtension(IntentBasedNavigation), _dec7 = usingExtension(InternalIntentBasedNavigation), _dec8 = usingExtension(PageReady), _dec9 = usingExtension(MessageHandler), _dec10 = usingExtension(Share), _dec11 = usingExtension(Paginator), _dec12 = usingExtension(ViewState), _dec13 = usingExtension(Placeholder), _dec14 = usingExtension(SideEffects), _dec15 = usingExtension(MassEdit), _dec16 = publicExtension(), _dec17 = publicExtension(), _dec18 = publicExtension(), _dec19 = publicExtension(), _dec20 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(PageController, _BaseController);
    function PageController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "routing", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_routing", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editFlow", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_editFlow", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pageReady", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "paginator", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "placeholder", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_sideEffects", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor14, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = PageController.prototype;
    /**
     * @private
     * @name sap.fe.core.PageController.getMetadata
     * @function
     */
    /**
     * @private
     * @name sap.fe.core.PageController.extend
     * @function
     */
    _proto.onInit = function onInit() {
      const oUIModel = this.getAppComponent().getModel("ui"),
        oInternalModel = this.getAppComponent().getModel("internal"),
        sPath = `/pages/${this.getView().getId()}`;
      oUIModel.setProperty(sPath, {
        controls: {}
      });
      oInternalModel.setProperty(sPath, {
        controls: {},
        collaboration: {}
      });
      this.getView().bindElement({
        path: sPath,
        model: "ui"
      });
      this.getView().bindElement({
        path: sPath,
        model: "internal"
      });

      // for the time being provide it also pageInternal as some macros access it - to be removed
      this.getView().bindElement({
        path: sPath,
        model: "pageInternal"
      });
      this.getView().setModel(oInternalModel, "pageInternal");

      // as the model propagation happens after init but we actually want to access the binding context in the
      // init phase already setting the model here
      this.getView().setModel(oUIModel, "ui");
      this.getView().setModel(oInternalModel, "internal");
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      if (this.placeholder.attachHideCallback) {
        this.placeholder.attachHideCallback();
      }
    }

    /**
     * Get the extension API for the current page.
     *
     * @public
     * @returns The extension API.
     */;
    _proto.getExtensionAPI = function getExtensionAPI() {
      if (!this.extensionAPI) {
        this.extensionAPI = new ExtensionAPI(this);
      }
      return this.extensionAPI;
    }
    // We specify the extensibility here the same way as it is done in the object page controller
    // since the specification here overrides it and if we do not specify anything here, the
    // behavior defaults to an execute instead!
    // TODO This may not be ideal, since it also influences the list report controller but currently it's the best solution.
    ;
    _proto.onPageReady = function onPageReady(_mParameters) {
      // Apply app state only after the page is ready with the first section selected
      this.getAppComponent().getAppStateHandler().applyAppState();
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      return {};
    };
    _proto._getPageModel = function _getPageModel() {
      const pageComponent = Component.getOwnerComponentFor(this.getView());
      return pageComponent === null || pageComponent === void 0 ? void 0 : pageComponent.getModel("_pageModel");
    };
    return PageController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "routing", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "editFlow", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "_editFlow", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "pageReady", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "paginator", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "_sideEffects", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeRendering", [_dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeRendering"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype)), _class2)) || _class);
  return PageController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdlQ29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJSb3V0aW5nIiwiSW50ZXJuYWxSb3V0aW5nIiwiRWRpdEZsb3ciLCJJbnRlcm5hbEVkaXRGbG93IiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJQYWdlUmVhZHkiLCJNZXNzYWdlSGFuZGxlciIsIlNoYXJlIiwiUGFnaW5hdG9yIiwiVmlld1N0YXRlIiwiUGxhY2Vob2xkZXIiLCJTaWRlRWZmZWN0cyIsIk1hc3NFZGl0IiwicHVibGljRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJvbkluaXQiLCJvVUlNb2RlbCIsImdldEFwcENvbXBvbmVudCIsImdldE1vZGVsIiwib0ludGVybmFsTW9kZWwiLCJzUGF0aCIsImdldFZpZXciLCJnZXRJZCIsInNldFByb3BlcnR5IiwiY29udHJvbHMiLCJjb2xsYWJvcmF0aW9uIiwiYmluZEVsZW1lbnQiLCJwYXRoIiwibW9kZWwiLCJzZXRNb2RlbCIsIm9uQmVmb3JlUmVuZGVyaW5nIiwicGxhY2Vob2xkZXIiLCJhdHRhY2hIaWRlQ2FsbGJhY2siLCJnZXRFeHRlbnNpb25BUEkiLCJleHRlbnNpb25BUEkiLCJFeHRlbnNpb25BUEkiLCJvblBhZ2VSZWFkeSIsIl9tUGFyYW1ldGVycyIsImdldEFwcFN0YXRlSGFuZGxlciIsImFwcGx5QXBwU3RhdGUiLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJfZ2V0UGFnZU1vZGVsIiwicGFnZUNvbXBvbmVudCIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiQmFzZUNvbnRyb2xsZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlBhZ2VDb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCYXNlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvQmFzZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBFZGl0RmxvdyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvRWRpdEZsb3dcIjtcbmltcG9ydCBJbnRlbnRCYXNlZE5hdmlnYXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVudEJhc2VkTmF2aWdhdGlvblwiO1xuaW1wb3J0IEludGVybmFsRWRpdEZsb3cgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsRWRpdEZsb3dcIjtcbmltcG9ydCBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbFJvdXRpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsUm91dGluZ1wiO1xuaW1wb3J0IE1hc3NFZGl0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NYXNzRWRpdFwiO1xuaW1wb3J0IE1lc3NhZ2VIYW5kbGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NZXNzYWdlSGFuZGxlclwiO1xuaW1wb3J0IFBhZ2VSZWFkeSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGFnZVJlYWR5XCI7XG5pbXBvcnQgUGFnaW5hdG9yIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9QYWdpbmF0b3JcIjtcbmltcG9ydCBQbGFjZWhvbGRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGxhY2Vob2xkZXJcIjtcbmltcG9ydCBSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9Sb3V0aW5nXCI7XG5pbXBvcnQgU2hhcmUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1NoYXJlXCI7XG5pbXBvcnQgU2lkZUVmZmVjdHMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1NpZGVFZmZlY3RzXCI7XG5pbXBvcnQgVmlld1N0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9WaWV3U3RhdGVcIjtcbmltcG9ydCBFeHRlbnNpb25BUEkgZnJvbSBcInNhcC9mZS9jb3JlL0V4dGVuc2lvbkFQSVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIHB1YmxpY0V4dGVuc2lvbiwgdXNpbmdFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5cbi8qKlxuICogQmFzZSBjb250cm9sbGVyIGNsYXNzIGZvciB5b3VyIGN1c3RvbSBwYWdlIHVzZWQgaW5zaWRlIGFuIFNBUCBGaW9yaSBlbGVtZW50cyBhcHBsaWNhdGlvbi5cbiAqXG4gKiBUaGlzIGNvbnRyb2xsZXIgcHJvdmlkZXMgcHJlY29uZmlndXJlZCBleHRlbnNpb25zIHRoYXQgd2lsbCBlbnN1cmUgeW91IGhhdmUgdGhlIGJhc2ljIGZ1bmN0aW9uYWxpdGllcyByZXF1aXJlZCB0byB1c2UgdGhlIGJ1aWxkaW5nIGJsb2Nrcy5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS44OC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLlBhZ2VDb250cm9sbGVyXCIpXG5jbGFzcyBQYWdlQ29udHJvbGxlciBleHRlbmRzIEJhc2VDb250cm9sbGVyIHtcblx0QHVzaW5nRXh0ZW5zaW9uKFJvdXRpbmcpXG5cdHJvdXRpbmchOiBSb3V0aW5nO1xuXHRAdXNpbmdFeHRlbnNpb24oSW50ZXJuYWxSb3V0aW5nKVxuXHRfcm91dGluZyE6IEludGVybmFsUm91dGluZztcblx0QHVzaW5nRXh0ZW5zaW9uKEVkaXRGbG93KVxuXHRlZGl0RmxvdyE6IEVkaXRGbG93O1xuXHRAdXNpbmdFeHRlbnNpb24oSW50ZXJuYWxFZGl0Rmxvdylcblx0X2VkaXRGbG93ITogSW50ZXJuYWxFZGl0Rmxvdztcblx0QHVzaW5nRXh0ZW5zaW9uKEludGVudEJhc2VkTmF2aWdhdGlvbilcblx0aW50ZW50QmFzZWROYXZpZ2F0aW9uITogSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXHRAdXNpbmdFeHRlbnNpb24oSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24pXG5cdF9pbnRlbnRCYXNlZE5hdmlnYXRpb24hOiBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbjtcblx0QHVzaW5nRXh0ZW5zaW9uKFBhZ2VSZWFkeSlcblx0cGFnZVJlYWR5ITogUGFnZVJlYWR5O1xuXHRAdXNpbmdFeHRlbnNpb24oTWVzc2FnZUhhbmRsZXIpXG5cdG1lc3NhZ2VIYW5kbGVyITogTWVzc2FnZUhhbmRsZXI7XG5cdEB1c2luZ0V4dGVuc2lvbihTaGFyZSlcblx0c2hhcmUhOiBTaGFyZTtcblx0QHVzaW5nRXh0ZW5zaW9uKFBhZ2luYXRvcilcblx0cGFnaW5hdG9yITogUGFnaW5hdG9yO1xuXHRAdXNpbmdFeHRlbnNpb24oVmlld1N0YXRlKVxuXHR2aWV3U3RhdGUhOiBWaWV3U3RhdGU7XG5cdEB1c2luZ0V4dGVuc2lvbihQbGFjZWhvbGRlcilcblx0cGxhY2Vob2xkZXIhOiBQbGFjZWhvbGRlcjtcblx0QHVzaW5nRXh0ZW5zaW9uKFNpZGVFZmZlY3RzKVxuXHRfc2lkZUVmZmVjdHMhOiBTaWRlRWZmZWN0cztcblx0QHVzaW5nRXh0ZW5zaW9uKE1hc3NFZGl0KVxuXHRtYXNzRWRpdCE6IE1hc3NFZGl0O1xuXHRleHRlbnNpb24hOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblx0Ly8gQFB1YmxpY1xuXHQvLyBnZXRWaWV3KCk6IHsgZ2V0Q29udHJvbGxlcigpOiBQYWdlQ29udHJvbGxlciB9ICYgVmlldyB7XG5cdC8vIFx0cmV0dXJuIHN1cGVyLmdldFZpZXcoKSBhcyBhbnk7XG5cdC8vIH1cblxuXHRwcm90ZWN0ZWQgZXh0ZW5zaW9uQVBJPzogRXh0ZW5zaW9uQVBJO1xuXHQvKipcblx0ICogQHByaXZhdGVcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuUGFnZUNvbnRyb2xsZXIuZ2V0TWV0YWRhdGFcblx0ICogQGZ1bmN0aW9uXG5cdCAqL1xuXHQvKipcblx0ICogQHByaXZhdGVcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuUGFnZUNvbnRyb2xsZXIuZXh0ZW5kXG5cdCAqIEBmdW5jdGlvblxuXHQgKi9cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0b25Jbml0KCkge1xuXHRcdGNvbnN0IG9VSU1vZGVsID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNb2RlbChcInVpXCIpIGFzIEpTT05Nb2RlbCxcblx0XHRcdG9JbnRlcm5hbE1vZGVsID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbCxcblx0XHRcdHNQYXRoID0gYC9wYWdlcy8ke3RoaXMuZ2V0VmlldygpLmdldElkKCl9YDtcblxuXHRcdG9VSU1vZGVsLnNldFByb3BlcnR5KHNQYXRoLCB7XG5cdFx0XHRjb250cm9sczoge31cblx0XHR9KTtcblx0XHRvSW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShzUGF0aCwge1xuXHRcdFx0Y29udHJvbHM6IHt9LFxuXHRcdFx0Y29sbGFib3JhdGlvbjoge31cblx0XHR9KTtcblx0XHR0aGlzLmdldFZpZXcoKS5iaW5kRWxlbWVudCh7XG5cdFx0XHRwYXRoOiBzUGF0aCxcblx0XHRcdG1vZGVsOiBcInVpXCJcblx0XHR9KTtcblx0XHR0aGlzLmdldFZpZXcoKS5iaW5kRWxlbWVudCh7XG5cdFx0XHRwYXRoOiBzUGF0aCxcblx0XHRcdG1vZGVsOiBcImludGVybmFsXCJcblx0XHR9KTtcblxuXHRcdC8vIGZvciB0aGUgdGltZSBiZWluZyBwcm92aWRlIGl0IGFsc28gcGFnZUludGVybmFsIGFzIHNvbWUgbWFjcm9zIGFjY2VzcyBpdCAtIHRvIGJlIHJlbW92ZWRcblx0XHR0aGlzLmdldFZpZXcoKS5iaW5kRWxlbWVudCh7XG5cdFx0XHRwYXRoOiBzUGF0aCxcblx0XHRcdG1vZGVsOiBcInBhZ2VJbnRlcm5hbFwiXG5cdFx0fSk7XG5cdFx0dGhpcy5nZXRWaWV3KCkuc2V0TW9kZWwob0ludGVybmFsTW9kZWwsIFwicGFnZUludGVybmFsXCIpO1xuXG5cdFx0Ly8gYXMgdGhlIG1vZGVsIHByb3BhZ2F0aW9uIGhhcHBlbnMgYWZ0ZXIgaW5pdCBidXQgd2UgYWN0dWFsbHkgd2FudCB0byBhY2Nlc3MgdGhlIGJpbmRpbmcgY29udGV4dCBpbiB0aGVcblx0XHQvLyBpbml0IHBoYXNlIGFscmVhZHkgc2V0dGluZyB0aGUgbW9kZWwgaGVyZVxuXHRcdHRoaXMuZ2V0VmlldygpLnNldE1vZGVsKG9VSU1vZGVsLCBcInVpXCIpO1xuXHRcdHRoaXMuZ2V0VmlldygpLnNldE1vZGVsKG9JbnRlcm5hbE1vZGVsLCBcImludGVybmFsXCIpO1xuXHR9XG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRvbkJlZm9yZVJlbmRlcmluZygpIHtcblx0XHRpZiAodGhpcy5wbGFjZWhvbGRlci5hdHRhY2hIaWRlQ2FsbGJhY2spIHtcblx0XHRcdHRoaXMucGxhY2Vob2xkZXIuYXR0YWNoSGlkZUNhbGxiYWNrKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgZXh0ZW5zaW9uIEFQSSBmb3IgdGhlIGN1cnJlbnQgcGFnZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyBUaGUgZXh0ZW5zaW9uIEFQSS5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRnZXRFeHRlbnNpb25BUEkoKTogRXh0ZW5zaW9uQVBJIHtcblx0XHRpZiAoIXRoaXMuZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHR0aGlzLmV4dGVuc2lvbkFQSSA9IG5ldyBFeHRlbnNpb25BUEkodGhpcyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmV4dGVuc2lvbkFQSTtcblx0fVxuXHQvLyBXZSBzcGVjaWZ5IHRoZSBleHRlbnNpYmlsaXR5IGhlcmUgdGhlIHNhbWUgd2F5IGFzIGl0IGlzIGRvbmUgaW4gdGhlIG9iamVjdCBwYWdlIGNvbnRyb2xsZXJcblx0Ly8gc2luY2UgdGhlIHNwZWNpZmljYXRpb24gaGVyZSBvdmVycmlkZXMgaXQgYW5kIGlmIHdlIGRvIG5vdCBzcGVjaWZ5IGFueXRoaW5nIGhlcmUsIHRoZVxuXHQvLyBiZWhhdmlvciBkZWZhdWx0cyB0byBhbiBleGVjdXRlIGluc3RlYWQhXG5cdC8vIFRPRE8gVGhpcyBtYXkgbm90IGJlIGlkZWFsLCBzaW5jZSBpdCBhbHNvIGluZmx1ZW5jZXMgdGhlIGxpc3QgcmVwb3J0IGNvbnRyb2xsZXIgYnV0IGN1cnJlbnRseSBpdCdzIHRoZSBiZXN0IHNvbHV0aW9uLlxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUGFnZVJlYWR5KF9tUGFyYW1ldGVyczogdW5rbm93bikge1xuXHRcdC8vIEFwcGx5IGFwcCBzdGF0ZSBvbmx5IGFmdGVyIHRoZSBwYWdlIGlzIHJlYWR5IHdpdGggdGhlIGZpcnN0IHNlY3Rpb24gc2VsZWN0ZWRcblx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldEFwcFN0YXRlSGFuZGxlcigpLmFwcGx5QXBwU3RhdGUoKTtcblx0fVxuXHRfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cdF9nZXRQYWdlTW9kZWwoKTogSlNPTk1vZGVsIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBwYWdlQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRoaXMuZ2V0VmlldygpKTtcblx0XHRyZXR1cm4gcGFnZUNvbXBvbmVudD8uZ2V0TW9kZWwoXCJfcGFnZU1vZGVsXCIpIGFzIEpTT05Nb2RlbDtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYWdlQ29udHJvbGxlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0VBcUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVJBLElBVU1BLGNBQWMsV0FEbkJDLGNBQWMsQ0FBQyw0QkFBNEIsQ0FBQyxVQUUzQ0MsY0FBYyxDQUFDQyxPQUFPLENBQUMsVUFFdkJELGNBQWMsQ0FBQ0UsZUFBZSxDQUFDLFVBRS9CRixjQUFjLENBQUNHLFFBQVEsQ0FBQyxVQUV4QkgsY0FBYyxDQUFDSSxnQkFBZ0IsQ0FBQyxVQUVoQ0osY0FBYyxDQUFDSyxxQkFBcUIsQ0FBQyxVQUVyQ0wsY0FBYyxDQUFDTSw2QkFBNkIsQ0FBQyxVQUU3Q04sY0FBYyxDQUFDTyxTQUFTLENBQUMsVUFFekJQLGNBQWMsQ0FBQ1EsY0FBYyxDQUFDLFdBRTlCUixjQUFjLENBQUNTLEtBQUssQ0FBQyxXQUVyQlQsY0FBYyxDQUFDVSxTQUFTLENBQUMsV0FFekJWLGNBQWMsQ0FBQ1csU0FBUyxDQUFDLFdBRXpCWCxjQUFjLENBQUNZLFdBQVcsQ0FBQyxXQUUzQlosY0FBYyxDQUFDYSxXQUFXLENBQUMsV0FFM0JiLGNBQWMsQ0FBQ2MsUUFBUSxDQUFDLFdBb0J4QkMsZUFBZSxFQUFFLFdBa0NqQkEsZUFBZSxFQUFFLFdBYWpCQSxlQUFlLEVBQUUsV0FXakJBLGVBQWUsRUFBRSxXQUNqQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBdEVwQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0M7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUpDLE9BT0FDLE1BQU0sR0FETixrQkFDUztNQUNSLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNDLGVBQWUsRUFBRSxDQUFDQyxRQUFRLENBQUMsSUFBSSxDQUFjO1FBQ2xFQyxjQUFjLEdBQUcsSUFBSSxDQUFDRixlQUFlLEVBQUUsQ0FBQ0MsUUFBUSxDQUFDLFVBQVUsQ0FBYztRQUN6RUUsS0FBSyxHQUFJLFVBQVMsSUFBSSxDQUFDQyxPQUFPLEVBQUUsQ0FBQ0MsS0FBSyxFQUFHLEVBQUM7TUFFM0NOLFFBQVEsQ0FBQ08sV0FBVyxDQUFDSCxLQUFLLEVBQUU7UUFDM0JJLFFBQVEsRUFBRSxDQUFDO01BQ1osQ0FBQyxDQUFDO01BQ0ZMLGNBQWMsQ0FBQ0ksV0FBVyxDQUFDSCxLQUFLLEVBQUU7UUFDakNJLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDWkMsYUFBYSxFQUFFLENBQUM7TUFDakIsQ0FBQyxDQUFDO01BQ0YsSUFBSSxDQUFDSixPQUFPLEVBQUUsQ0FBQ0ssV0FBVyxDQUFDO1FBQzFCQyxJQUFJLEVBQUVQLEtBQUs7UUFDWFEsS0FBSyxFQUFFO01BQ1IsQ0FBQyxDQUFDO01BQ0YsSUFBSSxDQUFDUCxPQUFPLEVBQUUsQ0FBQ0ssV0FBVyxDQUFDO1FBQzFCQyxJQUFJLEVBQUVQLEtBQUs7UUFDWFEsS0FBSyxFQUFFO01BQ1IsQ0FBQyxDQUFDOztNQUVGO01BQ0EsSUFBSSxDQUFDUCxPQUFPLEVBQUUsQ0FBQ0ssV0FBVyxDQUFDO1FBQzFCQyxJQUFJLEVBQUVQLEtBQUs7UUFDWFEsS0FBSyxFQUFFO01BQ1IsQ0FBQyxDQUFDO01BQ0YsSUFBSSxDQUFDUCxPQUFPLEVBQUUsQ0FBQ1EsUUFBUSxDQUFDVixjQUFjLEVBQUUsY0FBYyxDQUFDOztNQUV2RDtNQUNBO01BQ0EsSUFBSSxDQUFDRSxPQUFPLEVBQUUsQ0FBQ1EsUUFBUSxDQUFDYixRQUFRLEVBQUUsSUFBSSxDQUFDO01BQ3ZDLElBQUksQ0FBQ0ssT0FBTyxFQUFFLENBQUNRLFFBQVEsQ0FBQ1YsY0FBYyxFQUFFLFVBQVUsQ0FBQztJQUNwRCxDQUFDO0lBQUEsT0FFRFcsaUJBQWlCLEdBRGpCLDZCQUNvQjtNQUNuQixJQUFJLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxrQkFBa0IsRUFBRTtRQUN4QyxJQUFJLENBQUNELFdBQVcsQ0FBQ0Msa0JBQWtCLEVBQUU7TUFDdEM7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BT0FDLGVBQWUsR0FEZiwyQkFDZ0M7TUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQ0MsWUFBWSxFQUFFO1FBQ3ZCLElBQUksQ0FBQ0EsWUFBWSxHQUFHLElBQUlDLFlBQVksQ0FBQyxJQUFJLENBQUM7TUFDM0M7TUFDQSxPQUFPLElBQUksQ0FBQ0QsWUFBWTtJQUN6QjtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQUE7SUFBQSxPQUdBRSxXQUFXLEdBRlgscUJBRVlDLFlBQXFCLEVBQUU7TUFDbEM7TUFDQSxJQUFJLENBQUNwQixlQUFlLEVBQUUsQ0FBQ3FCLGtCQUFrQixFQUFFLENBQUNDLGFBQWEsRUFBRTtJQUM1RCxDQUFDO0lBQUEsT0FDREMsd0JBQXdCLEdBQXhCLG9DQUEyQjtNQUMxQixPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFBQSxPQUNEQyxhQUFhLEdBQWIseUJBQXVDO01BQ3RDLE1BQU1DLGFBQWEsR0FBR0MsU0FBUyxDQUFDQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUN2QixPQUFPLEVBQUUsQ0FBQztNQUNwRSxPQUFPcUIsYUFBYSxhQUFiQSxhQUFhLHVCQUFiQSxhQUFhLENBQUV4QixRQUFRLENBQUMsWUFBWSxDQUFDO0lBQzdDLENBQUM7SUFBQTtFQUFBLEVBckgyQjJCLGNBQWM7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9Bd0g1Qm5ELGNBQWM7QUFBQSJ9