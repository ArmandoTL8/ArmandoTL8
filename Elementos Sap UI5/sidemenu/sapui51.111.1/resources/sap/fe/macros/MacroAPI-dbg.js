/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge", "sap/base/util/uid", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/ConverterContext", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Component", "sap/ui/core/Control", "sap/ui/core/util/XMLPreprocessor"], function (merge, uid, BuildingBlockRuntime, ConverterContext, ClassSupport, Component, Control, XMLPreprocessor) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _class3;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  var registerBuildingBlock = BuildingBlockRuntime.registerBuildingBlock;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const MacroAPIFQN = "sap.fe.macros.MacroAPI";

  /**
   * Base API control for building blocks.
   *
   * @hideconstructor
   * @name sap.fe.macros.MacroAPI
   * @public
   */
  let MacroAPI = (_dec = defineUI5Class(MacroAPIFQN), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(MacroAPI, _Control);
    function MacroAPI(mSettings) {
      var _this;
      for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        others[_key - 1] = arguments[_key];
      }
      _this = _Control.call(this, mSettings, ...others) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor4, _assertThisInitialized(_this));
      _this.parentContextToBind = {};
      MacroAPI.registerInstance(_assertThisInitialized(_this));
      return _this;
    }
    var _proto = MacroAPI.prototype;
    _proto.init = function init() {
      _Control.prototype.init.call(this);
      if (!this.getModel("_pageModel")) {
        var _Component$getOwnerCo;
        const oPageModel = (_Component$getOwnerCo = Component.getOwnerComponentFor(this)) === null || _Component$getOwnerCo === void 0 ? void 0 : _Component$getOwnerCo.getModel("_pageModel");
        if (oPageModel) {
          this.setModel(oPageModel, "_pageModel");
        }
      }
    };
    MacroAPI.registerInstance = function registerInstance(_instance) {
      if (!this.instanceMap.get(_instance.constructor)) {
        this.instanceMap.set(_instance.constructor, []);
      }
      this.instanceMap.get(_instance.constructor).push(_instance);
    }
    /**
     * Defines the path of the context used in the current page or block.
     * This setting is defined by the framework.
     *
     * @public
     */;
    MacroAPI.render = function render(oRm, oControl) {
      oRm.renderControl(oControl.content);
    };
    _proto.rerender = function rerender() {
      this.content.rerender();
    };
    _proto.getDomRef = function getDomRef() {
      const oContent = this.content;
      return oContent ? oContent.getDomRef() : _Control.prototype.getDomRef.call(this);
    };
    _proto.getController = function getController() {
      return this.getModel("$view").getObject().getController();
    };
    MacroAPI.getAPI = function getAPI(oEvent) {
      let oSource = oEvent.getSource();
      if (this.isDependentBound) {
        while (oSource && !oSource.isA(MacroAPIFQN) && oSource.getParent) {
          const oDependents = oSource.getDependents();
          const hasCorrectDependent = oDependents.find(oDependent => oDependent.isA(MacroAPIFQN));
          if (hasCorrectDependent) {
            oSource = hasCorrectDependent;
          } else {
            oSource = oSource.getParent();
          }
        }
      } else {
        while (oSource && !oSource.isA(MacroAPIFQN) && oSource.getParent) {
          oSource = oSource.getParent();
        }
      }
      if (!oSource || !oSource.isA(MacroAPIFQN)) {
        const oSourceMap = this.instanceMap.get(this);
        oSource = oSourceMap === null || oSourceMap === void 0 ? void 0 : oSourceMap[oSourceMap.length - 1];
      }
      return oSource && oSource.isA(MacroAPIFQN) && oSource;
    };
    MacroAPI.setDefaultValue = function setDefaultValue(oProps, sPropName, oOverrideValue) {
      if (oProps[sPropName] === undefined) {
        oProps[sPropName] = oOverrideValue;
      }
    }

    /**
     * Retrieve a Converter Context.
     *
     * @param oDataModelPath
     * @param contextPath
     * @param mSettings
     * @returns A Converter Context
     */;
    MacroAPI.register = function register() {
      registerBuildingBlock(this);
    };
    MacroAPI.unregister = function unregister() {
      XMLPreprocessor.plugIn(null, this.namespace, this.macroName);
    };
    /**
     * Keep track of a binding context that should be assigned to the parent of that control.
     *
     * @param modelName The model name that the context will relate to
     * @param path The path of the binding context
     */
    _proto.setParentBindingContext = function setParentBindingContext(modelName, path) {
      this.parentContextToBind[modelName] = path;
    };
    _proto.setParent = function setParent() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _Control.prototype.setParent.call(this, ...args);
      Object.keys(this.parentContextToBind).forEach(modelName => {
        this.getParent().bindObject({
          path: this.parentContextToBind[modelName],
          model: modelName,
          events: {
            change: function () {
              const oBoundContext = this.getBoundContext();
              if (oBoundContext && !oBoundContext.getObject()) {
                oBoundContext.setProperty("", {});
              }
            }
          }
        });
      });
    };
    return MacroAPI;
  }(Control), _class3.namespace = "sap.fe.macros", _class3.macroName = "Macro", _class3.fragment = "sap.fe.macros.Macro", _class3.hasValidation = true, _class3.instanceMap = new WeakMap(), _class3.isDependentBound = false, _class3.getConverterContext = function (oDataModelPath, contextPath, mSettings) {
    const oAppComponent = mSettings.appComponent;
    const viewData = mSettings.models.viewData && mSettings.models.viewData.getData();
    return ConverterContext.createConverterContextForMacro(oDataModelPath.startingEntitySet.name, mSettings.models.metaModel, oAppComponent && oAppComponent.getDiagnostics(), merge, oDataModelPath.contextLocation, viewData);
  }, _class3.createBindingContext = function (oData, mSettings) {
    const sContextPath = `/uid--${uid()}`;
    mSettings.models.converterContext.setProperty(sContextPath, oData);
    return mSettings.models.converterContext.createBindingContext(sContextPath);
  }, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MacroAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYWNyb0FQSUZRTiIsIk1hY3JvQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJpbXBsZW1lbnRJbnRlcmZhY2UiLCJwcm9wZXJ0eSIsInR5cGUiLCJhZ2dyZWdhdGlvbiIsIm11bHRpcGxlIiwiaXNEZWZhdWx0IiwibVNldHRpbmdzIiwib3RoZXJzIiwicGFyZW50Q29udGV4dFRvQmluZCIsInJlZ2lzdGVySW5zdGFuY2UiLCJpbml0IiwiZ2V0TW9kZWwiLCJvUGFnZU1vZGVsIiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJzZXRNb2RlbCIsIl9pbnN0YW5jZSIsImluc3RhbmNlTWFwIiwiZ2V0IiwiY29uc3RydWN0b3IiLCJzZXQiLCJwdXNoIiwicmVuZGVyIiwib1JtIiwib0NvbnRyb2wiLCJyZW5kZXJDb250cm9sIiwiY29udGVudCIsInJlcmVuZGVyIiwiZ2V0RG9tUmVmIiwib0NvbnRlbnQiLCJnZXRDb250cm9sbGVyIiwiZ2V0T2JqZWN0IiwiZ2V0QVBJIiwib0V2ZW50Iiwib1NvdXJjZSIsImdldFNvdXJjZSIsImlzRGVwZW5kZW50Qm91bmQiLCJpc0EiLCJnZXRQYXJlbnQiLCJvRGVwZW5kZW50cyIsImdldERlcGVuZGVudHMiLCJoYXNDb3JyZWN0RGVwZW5kZW50IiwiZmluZCIsIm9EZXBlbmRlbnQiLCJvU291cmNlTWFwIiwibGVuZ3RoIiwic2V0RGVmYXVsdFZhbHVlIiwib1Byb3BzIiwic1Byb3BOYW1lIiwib092ZXJyaWRlVmFsdWUiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciIsInJlZ2lzdGVyQnVpbGRpbmdCbG9jayIsInVucmVnaXN0ZXIiLCJYTUxQcmVwcm9jZXNzb3IiLCJwbHVnSW4iLCJuYW1lc3BhY2UiLCJtYWNyb05hbWUiLCJzZXRQYXJlbnRCaW5kaW5nQ29udGV4dCIsIm1vZGVsTmFtZSIsInBhdGgiLCJzZXRQYXJlbnQiLCJhcmdzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJiaW5kT2JqZWN0IiwibW9kZWwiLCJldmVudHMiLCJjaGFuZ2UiLCJvQm91bmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJDb250cm9sIiwiZnJhZ21lbnQiLCJoYXNWYWxpZGF0aW9uIiwiV2Vha01hcCIsImdldENvbnZlcnRlckNvbnRleHQiLCJvRGF0YU1vZGVsUGF0aCIsImNvbnRleHRQYXRoIiwib0FwcENvbXBvbmVudCIsImFwcENvbXBvbmVudCIsInZpZXdEYXRhIiwibW9kZWxzIiwiZ2V0RGF0YSIsIkNvbnZlcnRlckNvbnRleHQiLCJjcmVhdGVDb252ZXJ0ZXJDb250ZXh0Rm9yTWFjcm8iLCJzdGFydGluZ0VudGl0eVNldCIsIm5hbWUiLCJtZXRhTW9kZWwiLCJnZXREaWFnbm9zdGljcyIsIm1lcmdlIiwiY29udGV4dExvY2F0aW9uIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJvRGF0YSIsInNDb250ZXh0UGF0aCIsInVpZCIsImNvbnZlcnRlckNvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1hY3JvQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IHVpZCBmcm9tIFwic2FwL2Jhc2UvdXRpbC91aWRcIjtcbmltcG9ydCB7IHJlZ2lzdGVyQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuaW1wb3J0IENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcywgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBVSTVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBVSTVFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgdHlwZSB7IElGb3JtQ29udGVudCB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IHR5cGUgQ2xpZW50Q29udGV4dEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9DbGllbnRDb250ZXh0QmluZGluZ1wiO1xuXG5jb25zdCBNYWNyb0FQSUZRTiA9IFwic2FwLmZlLm1hY3Jvcy5NYWNyb0FQSVwiO1xuXG4vKipcbiAqIEJhc2UgQVBJIGNvbnRyb2wgZm9yIGJ1aWxkaW5nIGJsb2Nrcy5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAbmFtZSBzYXAuZmUubWFjcm9zLk1hY3JvQVBJXG4gKiBAcHVibGljXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhNYWNyb0FQSUZRTilcbmNsYXNzIE1hY3JvQVBJIGV4dGVuZHMgQ29udHJvbCBpbXBsZW1lbnRzIElGb3JtQ29udGVudCB7XG5cdEBpbXBsZW1lbnRJbnRlcmZhY2UoXCJzYXAudWkuY29yZS5JRm9ybUNvbnRlbnRcIilcblx0X19pbXBsZW1lbnRzX19zYXBfdWlfY29yZV9JRm9ybUNvbnRlbnQ6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdHN0YXRpYyBuYW1lc3BhY2U6IHN0cmluZyA9IFwic2FwLmZlLm1hY3Jvc1wiO1xuXHRzdGF0aWMgbWFjcm9OYW1lOiBzdHJpbmcgPSBcIk1hY3JvXCI7XG5cdHN0YXRpYyBmcmFnbWVudDogc3RyaW5nID0gXCJzYXAuZmUubWFjcm9zLk1hY3JvXCI7XG5cdHN0YXRpYyBoYXNWYWxpZGF0aW9uOiBib29sZWFuID0gdHJ1ZTtcblx0c3RhdGljIGluc3RhbmNlTWFwOiBXZWFrTWFwPG9iamVjdCwgb2JqZWN0W10+ID0gbmV3IFdlYWtNYXA8b2JqZWN0LCBvYmplY3RbXT4oKTtcblx0cHJvdGVjdGVkIHN0YXRpYyBpc0RlcGVuZGVudEJvdW5kID0gZmFsc2U7XG5cblx0Y29uc3RydWN0b3IobVNldHRpbmdzPzogUHJvcGVydGllc09mPE1hY3JvQVBJPiwgLi4ub3RoZXJzOiBhbnlbXSkge1xuXHRcdHN1cGVyKG1TZXR0aW5ncyBhcyBhbnksIC4uLm90aGVycyk7XG5cdFx0TWFjcm9BUEkucmVnaXN0ZXJJbnN0YW5jZSh0aGlzKTtcblx0fVxuXG5cdGluaXQoKSB7XG5cdFx0c3VwZXIuaW5pdCgpO1xuXHRcdGlmICghdGhpcy5nZXRNb2RlbChcIl9wYWdlTW9kZWxcIikpIHtcblx0XHRcdGNvbnN0IG9QYWdlTW9kZWwgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IodGhpcyk/LmdldE1vZGVsKFwiX3BhZ2VNb2RlbFwiKTtcblx0XHRcdGlmIChvUGFnZU1vZGVsKSB7XG5cdFx0XHRcdHRoaXMuc2V0TW9kZWwob1BhZ2VNb2RlbCwgXCJfcGFnZU1vZGVsXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyByZWdpc3Rlckluc3RhbmNlKF9pbnN0YW5jZTogYW55KSB7XG5cdFx0aWYgKCF0aGlzLmluc3RhbmNlTWFwLmdldChfaW5zdGFuY2UuY29uc3RydWN0b3IpKSB7XG5cdFx0XHR0aGlzLmluc3RhbmNlTWFwLnNldChfaW5zdGFuY2UuY29uc3RydWN0b3IsIFtdKTtcblx0XHR9XG5cdFx0KHRoaXMuaW5zdGFuY2VNYXAuZ2V0KF9pbnN0YW5jZS5jb25zdHJ1Y3RvcikgYXMgb2JqZWN0W10pLnB1c2goX2luc3RhbmNlKTtcblx0fVxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcGF0aCBvZiB0aGUgY29udGV4dCB1c2VkIGluIHRoZSBjdXJyZW50IHBhZ2Ugb3IgYmxvY2suXG5cdCAqIFRoaXMgc2V0dGluZyBpcyBkZWZpbmVkIGJ5IHRoZSBmcmFtZXdvcmsuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0Y29udGV4dFBhdGghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHJlbGF0aXZlIHBhdGggb2YgdGhlIHByb3BlcnR5IGluIHRoZSBtZXRhbW9kZWwsIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbnRleHRQYXRoLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG1ldGFQYXRoITogc3RyaW5nO1xuXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLCBtdWx0aXBsZTogZmFsc2UsIGlzRGVmYXVsdDogdHJ1ZSB9KVxuXHRjb250ZW50ITogQ29udHJvbDtcblxuXHRzdGF0aWMgcmVuZGVyKG9SbTogUmVuZGVyTWFuYWdlciwgb0NvbnRyb2w6IE1hY3JvQVBJKSB7XG5cdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRyb2wuY29udGVudCk7XG5cdH1cblxuXHRyZXJlbmRlcigpIHtcblx0XHR0aGlzLmNvbnRlbnQucmVyZW5kZXIoKTtcblx0fVxuXG5cdGdldERvbVJlZigpIHtcblx0XHRjb25zdCBvQ29udGVudCA9IHRoaXMuY29udGVudDtcblx0XHRyZXR1cm4gb0NvbnRlbnQgPyBvQ29udGVudC5nZXREb21SZWYoKSA6IHN1cGVyLmdldERvbVJlZigpO1xuXHR9XG5cdGdldENvbnRyb2xsZXIoKTogYW55IHtcblx0XHRyZXR1cm4gKHRoaXMuZ2V0TW9kZWwoXCIkdmlld1wiKSBhcyBhbnkpLmdldE9iamVjdCgpLmdldENvbnRyb2xsZXIoKTtcblx0fVxuXG5cdHN0YXRpYyBnZXRBUEkob0V2ZW50OiBVSTVFdmVudCk6IE1hY3JvQVBJIHwgZmFsc2Uge1xuXHRcdGxldCBvU291cmNlID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIE1hbmFnZWRPYmplY3QgfCBudWxsO1xuXHRcdGlmICh0aGlzLmlzRGVwZW5kZW50Qm91bmQpIHtcblx0XHRcdHdoaWxlIChvU291cmNlICYmICFvU291cmNlLmlzQTxNYWNyb0FQST4oTWFjcm9BUElGUU4pICYmIG9Tb3VyY2UuZ2V0UGFyZW50KSB7XG5cdFx0XHRcdGNvbnN0IG9EZXBlbmRlbnRzID0gKG9Tb3VyY2UgYXMgQ29udHJvbCkuZ2V0RGVwZW5kZW50cygpO1xuXHRcdFx0XHRjb25zdCBoYXNDb3JyZWN0RGVwZW5kZW50ID0gb0RlcGVuZGVudHMuZmluZCgob0RlcGVuZGVudDogVUk1RWxlbWVudCkgPT4gb0RlcGVuZGVudC5pc0EoTWFjcm9BUElGUU4pKTtcblx0XHRcdFx0aWYgKGhhc0NvcnJlY3REZXBlbmRlbnQpIHtcblx0XHRcdFx0XHRvU291cmNlID0gaGFzQ29ycmVjdERlcGVuZGVudCBhcyBNYWNyb0FQSTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvU291cmNlID0gb1NvdXJjZS5nZXRQYXJlbnQoKSBhcyBNYWNyb0FQSTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aGlsZSAob1NvdXJjZSAmJiAhb1NvdXJjZS5pc0E8TWFjcm9BUEk+KE1hY3JvQVBJRlFOKSAmJiBvU291cmNlLmdldFBhcmVudCkge1xuXHRcdFx0XHRvU291cmNlID0gb1NvdXJjZS5nZXRQYXJlbnQoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIW9Tb3VyY2UgfHwgIW9Tb3VyY2UuaXNBPE1hY3JvQVBJPihNYWNyb0FQSUZRTikpIHtcblx0XHRcdGNvbnN0IG9Tb3VyY2VNYXAgPSB0aGlzLmluc3RhbmNlTWFwLmdldCh0aGlzKSBhcyBNYWNyb0FQSVtdO1xuXHRcdFx0b1NvdXJjZSA9IG9Tb3VyY2VNYXA/LltvU291cmNlTWFwLmxlbmd0aCAtIDFdO1xuXHRcdH1cblx0XHRyZXR1cm4gb1NvdXJjZSAmJiBvU291cmNlLmlzQTxNYWNyb0FQST4oTWFjcm9BUElGUU4pICYmIG9Tb3VyY2U7XG5cdH1cblxuXHRzdGF0aWMgc2V0RGVmYXVsdFZhbHVlKG9Qcm9wczogYW55LCBzUHJvcE5hbWU6IHN0cmluZywgb092ZXJyaWRlVmFsdWU6IGFueSkge1xuXHRcdGlmIChvUHJvcHNbc1Byb3BOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvUHJvcHNbc1Byb3BOYW1lXSA9IG9PdmVycmlkZVZhbHVlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSBhIENvbnZlcnRlciBDb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGFNb2RlbFBhdGhcblx0ICogQHBhcmFtIGNvbnRleHRQYXRoXG5cdCAqIEBwYXJhbSBtU2V0dGluZ3Ncblx0ICogQHJldHVybnMgQSBDb252ZXJ0ZXIgQ29udGV4dFxuXHQgKi9cblx0c3RhdGljIGdldENvbnZlcnRlckNvbnRleHQgPSBmdW5jdGlvbiAob0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIGNvbnRleHRQYXRoOiBzdHJpbmcsIG1TZXR0aW5nczogYW55KSB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IG1TZXR0aW5ncy5hcHBDb21wb25lbnQ7XG5cdFx0Y29uc3Qgdmlld0RhdGEgPSBtU2V0dGluZ3MubW9kZWxzLnZpZXdEYXRhICYmIG1TZXR0aW5ncy5tb2RlbHMudmlld0RhdGEuZ2V0RGF0YSgpO1xuXHRcdHJldHVybiBDb252ZXJ0ZXJDb250ZXh0LmNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyhcblx0XHRcdG9EYXRhTW9kZWxQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWUsXG5cdFx0XHRtU2V0dGluZ3MubW9kZWxzLm1ldGFNb2RlbCxcblx0XHRcdG9BcHBDb21wb25lbnQgJiYgb0FwcENvbXBvbmVudC5nZXREaWFnbm9zdGljcygpLFxuXHRcdFx0bWVyZ2UsXG5cdFx0XHRvRGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24sXG5cdFx0XHR2aWV3RGF0YVxuXHRcdCk7XG5cdH07XG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBCaW5kaW5nIENvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRGF0YVxuXHQgKiBAcGFyYW0gbVNldHRpbmdzXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGNvbnRleHRcblx0ICovXG5cdHN0YXRpYyBjcmVhdGVCaW5kaW5nQ29udGV4dCA9IGZ1bmN0aW9uIChvRGF0YTogb2JqZWN0LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IGAvdWlkLS0ke3VpZCgpfWA7XG5cdFx0bVNldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0LnNldFByb3BlcnR5KHNDb250ZXh0UGF0aCwgb0RhdGEpO1xuXHRcdHJldHVybiBtU2V0dGluZ3MubW9kZWxzLmNvbnZlcnRlckNvbnRleHQuY3JlYXRlQmluZGluZ0NvbnRleHQoc0NvbnRleHRQYXRoKTtcblx0fTtcblx0c3RhdGljIHJlZ2lzdGVyKCkge1xuXHRcdHJlZ2lzdGVyQnVpbGRpbmdCbG9jayh0aGlzIGFzIGFueSk7XG5cdH1cblx0c3RhdGljIHVucmVnaXN0ZXIoKSB7XG5cdFx0KFhNTFByZXByb2Nlc3NvciBhcyBhbnkpLnBsdWdJbihudWxsLCB0aGlzLm5hbWVzcGFjZSwgdGhpcy5tYWNyb05hbWUpO1xuXHR9XG5cblx0cGFyZW50Q29udGV4dFRvQmluZDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG5cdC8qKlxuXHQgKiBLZWVwIHRyYWNrIG9mIGEgYmluZGluZyBjb250ZXh0IHRoYXQgc2hvdWxkIGJlIGFzc2lnbmVkIHRvIHRoZSBwYXJlbnQgb2YgdGhhdCBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gbW9kZWxOYW1lIFRoZSBtb2RlbCBuYW1lIHRoYXQgdGhlIGNvbnRleHQgd2lsbCByZWxhdGUgdG9cblx0ICogQHBhcmFtIHBhdGggVGhlIHBhdGggb2YgdGhlIGJpbmRpbmcgY29udGV4dFxuXHQgKi9cblx0c2V0UGFyZW50QmluZGluZ0NvbnRleHQobW9kZWxOYW1lOiBzdHJpbmcsIHBhdGg6IHN0cmluZykge1xuXHRcdHRoaXMucGFyZW50Q29udGV4dFRvQmluZFttb2RlbE5hbWVdID0gcGF0aDtcblx0fVxuXG5cdHNldFBhcmVudCguLi5hcmdzOiBhbnlbXSkge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0c3VwZXIuc2V0UGFyZW50KC4uLmFyZ3MpO1xuXHRcdE9iamVjdC5rZXlzKHRoaXMucGFyZW50Q29udGV4dFRvQmluZCkuZm9yRWFjaCgobW9kZWxOYW1lKSA9PiB7XG5cdFx0XHR0aGlzLmdldFBhcmVudCgpIS5iaW5kT2JqZWN0KHtcblx0XHRcdFx0cGF0aDogdGhpcy5wYXJlbnRDb250ZXh0VG9CaW5kW21vZGVsTmFtZV0sXG5cdFx0XHRcdG1vZGVsOiBtb2RlbE5hbWUsXG5cdFx0XHRcdGV2ZW50czoge1xuXHRcdFx0XHRcdGNoYW5nZTogZnVuY3Rpb24gKHRoaXM6IENsaWVudENvbnRleHRCaW5kaW5nKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvQm91bmRDb250ZXh0ID0gdGhpcy5nZXRCb3VuZENvbnRleHQoKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdFx0XHRcdGlmIChvQm91bmRDb250ZXh0ICYmICFvQm91bmRDb250ZXh0LmdldE9iamVjdCgpKSB7XG5cdFx0XHRcdFx0XHRcdG9Cb3VuZENvbnRleHQuc2V0UHJvcGVydHkoXCJcIiwge30pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFjcm9BUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUFrQkEsTUFBTUEsV0FBVyxHQUFHLHdCQUF3Qjs7RUFFNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQSxJQVFNQyxRQUFRLFdBRGJDLGNBQWMsQ0FBQ0YsV0FBVyxDQUFDLFVBRTFCRyxrQkFBa0IsQ0FBQywwQkFBMEIsQ0FBQyxVQXFDOUNDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFRNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFHNUJDLFdBQVcsQ0FBQztJQUFFRCxJQUFJLEVBQUUscUJBQXFCO0lBQUVFLFFBQVEsRUFBRSxLQUFLO0lBQUVDLFNBQVMsRUFBRTtFQUFLLENBQUMsQ0FBQztJQUFBO0lBdEMvRSxrQkFBWUMsU0FBa0MsRUFBb0I7TUFBQTtNQUFBLGtDQUFmQyxNQUFNO1FBQU5BLE1BQU07TUFBQTtNQUN4RCw0QkFBTUQsU0FBUyxFQUFTLEdBQUdDLE1BQU0sQ0FBQztNQUFDO01BQUE7TUFBQTtNQUFBO01BQUEsTUE4SHBDQyxtQkFBbUIsR0FBMkIsQ0FBQyxDQUFDO01BN0gvQ1YsUUFBUSxDQUFDVyxnQkFBZ0IsK0JBQU07TUFBQztJQUNqQztJQUFDO0lB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