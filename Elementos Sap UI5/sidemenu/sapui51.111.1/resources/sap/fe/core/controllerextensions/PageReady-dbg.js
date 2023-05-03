/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/pageReady/DataQueryWatcher", "sap/fe/core/services/TemplatedViewServiceFactory", "sap/ui/base/EventProvider", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "../CommonUtils", "../helpers/ClassSupport"], function (Log, DataQueryWatcher, TemplatedViewServiceFactory, EventProvider, Component, Core, ControllerExtension, OverrideExecution, CommonUtils, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  let PageReadyControllerExtension = (_dec = defineUI5Class("sap.fe.core.controllerextensions.PageReady"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = methodOverride("_routing"), _dec7 = methodOverride("_routing"), _dec8 = methodOverride("_routing"), _dec9 = publicExtension(), _dec10 = finalExtension(), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = publicExtension(), _dec14 = finalExtension(), _dec15 = publicExtension(), _dec16 = finalExtension(), _dec17 = publicExtension(), _dec18 = finalExtension(), _dec19 = privateExtension(), _dec20 = extensible(OverrideExecution.Instead), _dec21 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(PageReadyControllerExtension, _ControllerExtension);
    function PageReadyControllerExtension() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ControllerExtension.call(this, ...args) || this;
      _this.pageReadyTimeoutDefault = 7000;
      return _this;
    }
    var _proto = PageReadyControllerExtension.prototype;
    _proto.onInit = function onInit() {
      var _manifestContent$sap, _this$pageComponent, _rootControlControlle;
      this._nbWaits = 0;
      this._oEventProvider = this._oEventProvider ? this._oEventProvider : new EventProvider();
      this.view = this.getView();
      this.appComponent = CommonUtils.getAppComponent(this.view);
      this.pageComponent = Component.getOwnerComponentFor(this.view);
      const manifestContent = this.appComponent.getManifest();
      this.pageReadyTimeout = ((_manifestContent$sap = manifestContent["sap.ui5"]) === null || _manifestContent$sap === void 0 ? void 0 : _manifestContent$sap.pageReadyTimeout) ?? this.pageReadyTimeoutDefault;
      if ((_this$pageComponent = this.pageComponent) !== null && _this$pageComponent !== void 0 && _this$pageComponent.attachContainerDefined) {
        this.pageComponent.attachContainerDefined(oEvent => this.registerContainer(oEvent.getParameter("container")));
      } else {
        this.registerContainer(this.view);
      }
      const rootControlController = this.appComponent.getRootControl().getController();
      const placeholder = rootControlController === null || rootControlController === void 0 ? void 0 : (_rootControlControlle = rootControlController.getPlaceholder) === null || _rootControlControlle === void 0 ? void 0 : _rootControlControlle.call(rootControlController);
      if (placeholder !== null && placeholder !== void 0 && placeholder.isPlaceholderDebugEnabled()) {
        this.attachEvent("pageReady", null, () => {
          placeholder.getPlaceholderDebugStats().iPageReadyEventTimestamp = Date.now();
        }, this);
        this.attachEvent("heroesBatchReceived", null, () => {
          placeholder.getPlaceholderDebugStats().iHeroesBatchReceivedEventTimestamp = Date.now();
        }, this);
      }
      this.queryWatcher = new DataQueryWatcher(this._oEventProvider, this.checkPageReadyDebounced.bind(this));
    };
    _proto.onExit = function onExit() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete this._oAppComponent;
      if (this._oContainer) {
        this._oContainer.removeEventDelegate(this._fnContainerDelegate);
      }
    };
    _proto.waitFor = function waitFor(oPromise) {
      this._nbWaits++;
      oPromise.finally(() => {
        setTimeout(() => {
          this._nbWaits--;
        }, 0);
      }).catch(null);
    };
    _proto.onRouteMatched = function onRouteMatched() {
      this._bIsPageReady = false;
    };
    _proto.onRouteMatchedFinished = async function onRouteMatchedFinished() {
      await this.onAfterBindingPromise;
      this.checkPageReadyDebounced();
    };
    _proto.registerAggregatedControls = function registerAggregatedControls(mainBindingContext) {
      if (mainBindingContext) {
        const mainObjectBinding = mainBindingContext.getBinding();
        this.queryWatcher.registerBinding(mainObjectBinding);
      }
      const aPromises = [];
      const aControls = this.getView().findAggregatedObjects(true);
      aControls.forEach(oElement => {
        const oObjectBinding = oElement.getObjectBinding();
        if (oObjectBinding) {
          // Register on all object binding (mostly used on object pages)
          this.queryWatcher.registerBinding(oObjectBinding);
        } else {
          const aBindingKeys = Object.keys(oElement.mBindingInfos);
          aBindingKeys.forEach(sPropertyName => {
            const oListBinding = oElement.mBindingInfos[sPropertyName].binding;
            if (oListBinding && oListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
              this.queryWatcher.registerBinding(oListBinding);
            }
          });
        }
        // This is dirty but MDCTables and MDCCharts have a weird loading lifecycle
        if (oElement.isA("sap.ui.mdc.Table") || oElement.isA("sap.ui.mdc.Chart")) {
          this.bTablesChartsLoaded = false;
          aPromises.push(this.queryWatcher.registerTableOrChart(oElement));
        } else if (oElement.isA("sap.fe.core.controls.FilterBar")) {
          this.queryWatcher.registerFilterBar(oElement);
        }
      });
      return aPromises;
    };
    _proto.onAfterBinding = function onAfterBinding(oBindingContext) {
      // In case the page is rebind we need to clear the timer (eg: in FCL, the user can select 2 items successively in the list report)
      if (this.pageReadyTimeoutTimer) {
        clearTimeout(this.pageReadyTimeoutTimer);
      }
      this.pageReadyTimeoutTimer = setTimeout(() => {
        Log.error(`The PageReady Event was not fired within the ${this.pageReadyTimeout} ms timeout . It has been forced. Please contact your application developer for further analysis`);
        this._oEventProvider.fireEvent("pageReady");
      }, this.pageReadyTimeout);
      if (this._bAfterBindingAlreadyApplied) {
        return;
      }
      this._bAfterBindingAlreadyApplied = true;
      if (this.isContextExpected() && oBindingContext === undefined) {
        // Force to mention we are expecting data
        this.bHasContext = false;
        return;
      } else {
        this.bHasContext = true;
      }
      this.attachEventOnce("pageReady", null, () => {
        clearTimeout(this.pageReadyTimeoutTimer);
        this.pageReadyTimeoutTimer = undefined;
        this._bAfterBindingAlreadyApplied = false;
        this.queryWatcher.reset();
      }, null);
      this.onAfterBindingPromise = new Promise(async resolve => {
        const aTableChartInitializedPromises = this.registerAggregatedControls(oBindingContext);
        if (aTableChartInitializedPromises.length > 0) {
          await Promise.all(aTableChartInitializedPromises);
          this.bTablesChartsLoaded = true;
          this.checkPageReadyDebounced();
          resolve();
        } else {
          this.checkPageReadyDebounced();
          resolve();
        }
      });
    };
    _proto.isPageReady = function isPageReady() {
      return this._bIsPageReady;
    };
    _proto.waitPageReady = function waitPageReady() {
      return new Promise(resolve => {
        if (this.isPageReady()) {
          resolve();
        } else {
          this.attachEventOnce("pageReady", null, () => {
            resolve();
          }, this);
        }
      });
    };
    _proto.attachEventOnce = function attachEventOnce(sEventId, oData, fnFunction, oListener) {
      // eslint-disable-next-line prefer-rest-params
      return this._oEventProvider.attachEventOnce(sEventId, oData, fnFunction, oListener);
    };
    _proto.attachEvent = function attachEvent(sEventId, oData, fnFunction, oListener) {
      // eslint-disable-next-line prefer-rest-params
      return this._oEventProvider.attachEvent(sEventId, oData, fnFunction, oListener);
    };
    _proto.detachEvent = function detachEvent(sEventId, fnFunction) {
      // eslint-disable-next-line prefer-rest-params
      return this._oEventProvider.detachEvent(sEventId, fnFunction);
    };
    _proto.registerContainer = function registerContainer(oContainer) {
      this._oContainer = oContainer;
      this._fnContainerDelegate = {
        onBeforeShow: () => {
          this.bShown = false;
          this._bIsPageReady = false;
        },
        onBeforeHide: () => {
          this.bShown = false;
          this._bIsPageReady = false;
        },
        onAfterShow: () => {
          var _this$onAfterBindingP;
          this.bShown = true;
          (_this$onAfterBindingP = this.onAfterBindingPromise) === null || _this$onAfterBindingP === void 0 ? void 0 : _this$onAfterBindingP.then(() => {
            this._checkPageReady(true);
          });
        }
      };
      this._oContainer.addEventDelegate(this._fnContainerDelegate, this);
    };
    _proto.isContextExpected = function isContextExpected() {
      return false;
    };
    _proto.checkPageReadyDebounced = function checkPageReadyDebounced() {
      if (this.pageReadyTimer) {
        clearTimeout(this.pageReadyTimer);
      }
      this.pageReadyTimer = setTimeout(() => {
        this._checkPageReady();
      }, 200);
    };
    _proto._checkPageReady = function _checkPageReady() {
      let bFromNav = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      const fnUIUpdated = () => {
        // Wait until the UI is no longer dirty
        if (!Core.getUIDirty()) {
          Core.detachEvent("UIUpdated", fnUIUpdated);
          this._bWaitingForRefresh = false;
          setTimeout(() => {
            this._checkPageReady();
          }, 20);
        }
      };

      // In case UIUpdate does not get called, check if UI is not dirty and then call _checkPageReady
      const checkUIUpdated = () => {
        if (Core.getUIDirty()) {
          setTimeout(checkUIUpdated, 500);
        } else if (this._bWaitingForRefresh) {
          this._bWaitingForRefresh = false;
          Core.detachEvent("UIUpdated", fnUIUpdated);
          this._checkPageReady();
        }
      };
      if (this.bShown && this.queryWatcher.isDataReceived() !== false && this.bTablesChartsLoaded !== false && (!this.isContextExpected() || this.bHasContext) // Either no context is expected or there is one
      ) {
        if (this.queryWatcher.isDataReceived() === true && !bFromNav && !this._bWaitingForRefresh && Core.getUIDirty()) {
          // If we requested data we get notified as soon as the data arrived, so before the next rendering tick
          this.queryWatcher.resetDataReceived();
          this._bWaitingForRefresh = true;
          Core.attachEvent("UIUpdated", fnUIUpdated);
          setTimeout(checkUIUpdated, 500);
        } else if (!this._bWaitingForRefresh && Core.getUIDirty() || this._nbWaits !== 0 || TemplatedViewServiceFactory.getNumberOfViewsInCreationState() > 0 || this.queryWatcher.isSearchPending()) {
          this._bWaitingForRefresh = true;
          Core.attachEvent("UIUpdated", fnUIUpdated);
          setTimeout(checkUIUpdated, 500);
        } else if (!this._bWaitingForRefresh) {
          // In the case we're not waiting for any data (navigating back to a page we already have loaded)
          // just wait for a frame to fire the event.
          this._bIsPageReady = true;
          this._oEventProvider.fireEvent("pageReady");
        }
      }
    };
    return PageReadyControllerExtension;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "waitFor", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "waitFor"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatched", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatched"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatchedFinished", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatchedFinished"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterBinding", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isPageReady", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "isPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "waitPageReady", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "waitPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "attachEventOnce", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "attachEventOnce"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "attachEvent", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "attachEvent"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "detachEvent", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "detachEvent"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isContextExpected", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "isContextExpected"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "checkPageReadyDebounced", [_dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "checkPageReadyDebounced"), _class2.prototype)), _class2)) || _class);
  return PageReadyControllerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdlUmVhZHlDb250cm9sbGVyRXh0ZW5zaW9uIiwiZGVmaW5lVUk1Q2xhc3MiLCJtZXRob2RPdmVycmlkZSIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwicHJpdmF0ZUV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwYWdlUmVhZHlUaW1lb3V0RGVmYXVsdCIsIm9uSW5pdCIsIl9uYldhaXRzIiwiX29FdmVudFByb3ZpZGVyIiwiRXZlbnRQcm92aWRlciIsInZpZXciLCJnZXRWaWV3IiwiYXBwQ29tcG9uZW50IiwiQ29tbW9uVXRpbHMiLCJnZXRBcHBDb21wb25lbnQiLCJwYWdlQ29tcG9uZW50IiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJtYW5pZmVzdENvbnRlbnQiLCJnZXRNYW5pZmVzdCIsInBhZ2VSZWFkeVRpbWVvdXQiLCJhdHRhY2hDb250YWluZXJEZWZpbmVkIiwib0V2ZW50IiwicmVnaXN0ZXJDb250YWluZXIiLCJnZXRQYXJhbWV0ZXIiLCJyb290Q29udHJvbENvbnRyb2xsZXIiLCJnZXRSb290Q29udHJvbCIsImdldENvbnRyb2xsZXIiLCJwbGFjZWhvbGRlciIsImdldFBsYWNlaG9sZGVyIiwiaXNQbGFjZWhvbGRlckRlYnVnRW5hYmxlZCIsImF0dGFjaEV2ZW50IiwiZ2V0UGxhY2Vob2xkZXJEZWJ1Z1N0YXRzIiwiaVBhZ2VSZWFkeUV2ZW50VGltZXN0YW1wIiwiRGF0ZSIsIm5vdyIsImlIZXJvZXNCYXRjaFJlY2VpdmVkRXZlbnRUaW1lc3RhbXAiLCJxdWVyeVdhdGNoZXIiLCJEYXRhUXVlcnlXYXRjaGVyIiwiY2hlY2tQYWdlUmVhZHlEZWJvdW5jZWQiLCJiaW5kIiwib25FeGl0IiwiX29BcHBDb21wb25lbnQiLCJfb0NvbnRhaW5lciIsInJlbW92ZUV2ZW50RGVsZWdhdGUiLCJfZm5Db250YWluZXJEZWxlZ2F0ZSIsIndhaXRGb3IiLCJvUHJvbWlzZSIsImZpbmFsbHkiLCJzZXRUaW1lb3V0IiwiY2F0Y2giLCJvblJvdXRlTWF0Y2hlZCIsIl9iSXNQYWdlUmVhZHkiLCJvblJvdXRlTWF0Y2hlZEZpbmlzaGVkIiwib25BZnRlckJpbmRpbmdQcm9taXNlIiwicmVnaXN0ZXJBZ2dyZWdhdGVkQ29udHJvbHMiLCJtYWluQmluZGluZ0NvbnRleHQiLCJtYWluT2JqZWN0QmluZGluZyIsImdldEJpbmRpbmciLCJyZWdpc3RlckJpbmRpbmciLCJhUHJvbWlzZXMiLCJhQ29udHJvbHMiLCJmaW5kQWdncmVnYXRlZE9iamVjdHMiLCJmb3JFYWNoIiwib0VsZW1lbnQiLCJvT2JqZWN0QmluZGluZyIsImdldE9iamVjdEJpbmRpbmciLCJhQmluZGluZ0tleXMiLCJPYmplY3QiLCJrZXlzIiwibUJpbmRpbmdJbmZvcyIsInNQcm9wZXJ0eU5hbWUiLCJvTGlzdEJpbmRpbmciLCJiaW5kaW5nIiwiaXNBIiwiYlRhYmxlc0NoYXJ0c0xvYWRlZCIsInB1c2giLCJyZWdpc3RlclRhYmxlT3JDaGFydCIsInJlZ2lzdGVyRmlsdGVyQmFyIiwib25BZnRlckJpbmRpbmciLCJvQmluZGluZ0NvbnRleHQiLCJwYWdlUmVhZHlUaW1lb3V0VGltZXIiLCJjbGVhclRpbWVvdXQiLCJMb2ciLCJlcnJvciIsImZpcmVFdmVudCIsIl9iQWZ0ZXJCaW5kaW5nQWxyZWFkeUFwcGxpZWQiLCJpc0NvbnRleHRFeHBlY3RlZCIsInVuZGVmaW5lZCIsImJIYXNDb250ZXh0IiwiYXR0YWNoRXZlbnRPbmNlIiwicmVzZXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImFUYWJsZUNoYXJ0SW5pdGlhbGl6ZWRQcm9taXNlcyIsImxlbmd0aCIsImFsbCIsImlzUGFnZVJlYWR5Iiwid2FpdFBhZ2VSZWFkeSIsInNFdmVudElkIiwib0RhdGEiLCJmbkZ1bmN0aW9uIiwib0xpc3RlbmVyIiwiZGV0YWNoRXZlbnQiLCJvQ29udGFpbmVyIiwib25CZWZvcmVTaG93IiwiYlNob3duIiwib25CZWZvcmVIaWRlIiwib25BZnRlclNob3ciLCJ0aGVuIiwiX2NoZWNrUGFnZVJlYWR5IiwiYWRkRXZlbnREZWxlZ2F0ZSIsInBhZ2VSZWFkeVRpbWVyIiwiYkZyb21OYXYiLCJmblVJVXBkYXRlZCIsIkNvcmUiLCJnZXRVSURpcnR5IiwiX2JXYWl0aW5nRm9yUmVmcmVzaCIsImNoZWNrVUlVcGRhdGVkIiwiaXNEYXRhUmVjZWl2ZWQiLCJyZXNldERhdGFSZWNlaXZlZCIsIlRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeSIsImdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUiLCJpc1NlYXJjaFBlbmRpbmciLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQYWdlUmVhZHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHsgTWFuaWZlc3RDb250ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IERhdGFRdWVyeVdhdGNoZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3BhZ2VSZWFkeS9EYXRhUXVlcnlXYXRjaGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1RlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgRXZlbnRQcm92aWRlciBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRQcm92aWRlclwiO1xuaW1wb3J0IHR5cGUgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcIi4uL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXh0ZW5zaWJsZSwgZmluYWxFeHRlbnNpb24sIG1ldGhvZE92ZXJyaWRlLCBwcml2YXRlRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwiLi4vaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUGFnZVJlYWR5XCIpXG5jbGFzcyBQYWdlUmVhZHlDb250cm9sbGVyRXh0ZW5zaW9uIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdHByaXZhdGUgX29FdmVudFByb3ZpZGVyITogRXZlbnRQcm92aWRlcjtcblx0cHJpdmF0ZSB2aWV3ITogVmlldztcblx0cHJpdmF0ZSBhcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cdHByaXZhdGUgcGFnZUNvbXBvbmVudCE6IENvbXBvbmVudDtcblx0cHJpdmF0ZSBfb0NvbnRhaW5lciE6IGFueTtcblx0cHJpdmF0ZSBfYkFmdGVyQmluZGluZ0FscmVhZHlBcHBsaWVkITogYm9vbGVhbjtcblx0cHJpdmF0ZSBfZm5Db250YWluZXJEZWxlZ2F0ZTogYW55O1xuXHRwcml2YXRlIF9uYldhaXRzITogbnVtYmVyO1xuXHRwcml2YXRlIF9iSXNQYWdlUmVhZHkhOiBib29sZWFuO1xuXHRwcml2YXRlIF9iV2FpdGluZ0ZvclJlZnJlc2ghOiBib29sZWFuO1xuXHRwcml2YXRlIGJTaG93biE6IGJvb2xlYW47XG5cdHByaXZhdGUgYkhhc0NvbnRleHQhOiBib29sZWFuO1xuXHRwcml2YXRlIGJUYWJsZXNDaGFydHNMb2FkZWQ/OiBib29sZWFuO1xuXHRwcml2YXRlIHBhZ2VSZWFkeVRpbWVyOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdHByaXZhdGUgcXVlcnlXYXRjaGVyITogRGF0YVF1ZXJ5V2F0Y2hlcjtcblx0cHJpdmF0ZSBvbkFmdGVyQmluZGluZ1Byb21pc2UhOiBQcm9taXNlPHZvaWQ+O1xuXHRwcml2YXRlIHBhZ2VSZWFkeVRpbWVvdXREZWZhdWx0ID0gNzAwMDtcblx0cHJpdmF0ZSBwYWdlUmVhZHlUaW1lb3V0VGltZXI/OiBudW1iZXI7XG5cdHByaXZhdGUgcGFnZVJlYWR5VGltZW91dD86IG51bWJlcjtcblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRwdWJsaWMgb25Jbml0KCkge1xuXHRcdHRoaXMuX25iV2FpdHMgPSAwO1xuXHRcdHRoaXMuX29FdmVudFByb3ZpZGVyID0gdGhpcy5fb0V2ZW50UHJvdmlkZXIgPyB0aGlzLl9vRXZlbnRQcm92aWRlciA6IG5ldyBFdmVudFByb3ZpZGVyKCk7XG5cdFx0dGhpcy52aWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cblx0XHR0aGlzLmFwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLnZpZXcpO1xuXHRcdHRoaXMucGFnZUNvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcih0aGlzLnZpZXcpIGFzIENvbXBvbmVudDtcblx0XHRjb25zdCBtYW5pZmVzdENvbnRlbnQ6IE1hbmlmZXN0Q29udGVudCA9IHRoaXMuYXBwQ29tcG9uZW50LmdldE1hbmlmZXN0KCk7XG5cdFx0dGhpcy5wYWdlUmVhZHlUaW1lb3V0ID0gbWFuaWZlc3RDb250ZW50W1wic2FwLnVpNVwiXT8ucGFnZVJlYWR5VGltZW91dCA/PyB0aGlzLnBhZ2VSZWFkeVRpbWVvdXREZWZhdWx0O1xuXG5cdFx0aWYgKHRoaXMucGFnZUNvbXBvbmVudD8uYXR0YWNoQ29udGFpbmVyRGVmaW5lZCkge1xuXHRcdFx0dGhpcy5wYWdlQ29tcG9uZW50LmF0dGFjaENvbnRhaW5lckRlZmluZWQoKG9FdmVudDogRXZlbnQpID0+IHRoaXMucmVnaXN0ZXJDb250YWluZXIob0V2ZW50LmdldFBhcmFtZXRlcihcImNvbnRhaW5lclwiKSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyQ29udGFpbmVyKHRoaXMudmlldyBhcyBNYW5hZ2VkT2JqZWN0KTtcblx0XHR9XG5cblx0XHRjb25zdCByb290Q29udHJvbENvbnRyb2xsZXIgPSAodGhpcy5hcHBDb21wb25lbnQuZ2V0Um9vdENvbnRyb2woKSBhcyBWaWV3KS5nZXRDb250cm9sbGVyKCkgYXMgYW55O1xuXHRcdGNvbnN0IHBsYWNlaG9sZGVyID0gcm9vdENvbnRyb2xDb250cm9sbGVyPy5nZXRQbGFjZWhvbGRlcj8uKCk7XG5cdFx0aWYgKHBsYWNlaG9sZGVyPy5pc1BsYWNlaG9sZGVyRGVidWdFbmFibGVkKCkpIHtcblx0XHRcdHRoaXMuYXR0YWNoRXZlbnQoXG5cdFx0XHRcdFwicGFnZVJlYWR5XCIsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRwbGFjZWhvbGRlci5nZXRQbGFjZWhvbGRlckRlYnVnU3RhdHMoKS5pUGFnZVJlYWR5RXZlbnRUaW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0aGlzXG5cdFx0XHQpO1xuXHRcdFx0dGhpcy5hdHRhY2hFdmVudChcblx0XHRcdFx0XCJoZXJvZXNCYXRjaFJlY2VpdmVkXCIsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRwbGFjZWhvbGRlci5nZXRQbGFjZWhvbGRlckRlYnVnU3RhdHMoKS5pSGVyb2VzQmF0Y2hSZWNlaXZlZEV2ZW50VGltZXN0YW1wID0gRGF0ZS5ub3coKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dGhpc1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHR0aGlzLnF1ZXJ5V2F0Y2hlciA9IG5ldyBEYXRhUXVlcnlXYXRjaGVyKHRoaXMuX29FdmVudFByb3ZpZGVyLCB0aGlzLmNoZWNrUGFnZVJlYWR5RGVib3VuY2VkLmJpbmQodGhpcykpO1xuXHR9XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0cHVibGljIG9uRXhpdCgpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGRlbGV0ZSB0aGlzLl9vQXBwQ29tcG9uZW50O1xuXHRcdGlmICh0aGlzLl9vQ29udGFpbmVyKSB7XG5cdFx0XHR0aGlzLl9vQ29udGFpbmVyLnJlbW92ZUV2ZW50RGVsZWdhdGUodGhpcy5fZm5Db250YWluZXJEZWxlZ2F0ZSk7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHB1YmxpYyB3YWl0Rm9yKG9Qcm9taXNlOiBhbnkpIHtcblx0XHR0aGlzLl9uYldhaXRzKys7XG5cdFx0b1Byb21pc2Vcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fbmJXYWl0cy0tO1xuXHRcdFx0XHR9LCAwKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2gobnVsbCk7XG5cdH1cblx0QG1ldGhvZE92ZXJyaWRlKFwiX3JvdXRpbmdcIilcblx0b25Sb3V0ZU1hdGNoZWQoKSB7XG5cdFx0dGhpcy5fYklzUGFnZVJlYWR5ID0gZmFsc2U7XG5cdH1cblx0QG1ldGhvZE92ZXJyaWRlKFwiX3JvdXRpbmdcIilcblx0YXN5bmMgb25Sb3V0ZU1hdGNoZWRGaW5pc2hlZCgpIHtcblx0XHRhd2FpdCB0aGlzLm9uQWZ0ZXJCaW5kaW5nUHJvbWlzZTtcblx0XHR0aGlzLmNoZWNrUGFnZVJlYWR5RGVib3VuY2VkKCk7XG5cdH1cblxuXHRwdWJsaWMgcmVnaXN0ZXJBZ2dyZWdhdGVkQ29udHJvbHMobWFpbkJpbmRpbmdDb250ZXh0PzogQ29udGV4dCk6IFByb21pc2U8dm9pZD5bXSB7XG5cdFx0aWYgKG1haW5CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Y29uc3QgbWFpbk9iamVjdEJpbmRpbmcgPSBtYWluQmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpO1xuXHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIucmVnaXN0ZXJCaW5kaW5nKG1haW5PYmplY3RCaW5kaW5nKTtcblx0XHR9XG5cblx0XHRjb25zdCBhUHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXHRcdGNvbnN0IGFDb250cm9scyA9IHRoaXMuZ2V0VmlldygpLmZpbmRBZ2dyZWdhdGVkT2JqZWN0cyh0cnVlKTtcblxuXHRcdGFDb250cm9scy5mb3JFYWNoKChvRWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvT2JqZWN0QmluZGluZyA9IG9FbGVtZW50LmdldE9iamVjdEJpbmRpbmcoKTtcblx0XHRcdGlmIChvT2JqZWN0QmluZGluZykge1xuXHRcdFx0XHQvLyBSZWdpc3RlciBvbiBhbGwgb2JqZWN0IGJpbmRpbmcgKG1vc3RseSB1c2VkIG9uIG9iamVjdCBwYWdlcylcblx0XHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIucmVnaXN0ZXJCaW5kaW5nKG9PYmplY3RCaW5kaW5nKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGFCaW5kaW5nS2V5cyA9IE9iamVjdC5rZXlzKG9FbGVtZW50Lm1CaW5kaW5nSW5mb3MpO1xuXHRcdFx0XHRhQmluZGluZ0tleXMuZm9yRWFjaCgoc1Byb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG9MaXN0QmluZGluZyA9IG9FbGVtZW50Lm1CaW5kaW5nSW5mb3Nbc1Byb3BlcnR5TmFtZV0uYmluZGluZztcblxuXHRcdFx0XHRcdGlmIChvTGlzdEJpbmRpbmcgJiYgb0xpc3RCaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnF1ZXJ5V2F0Y2hlci5yZWdpc3RlckJpbmRpbmcob0xpc3RCaW5kaW5nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Ly8gVGhpcyBpcyBkaXJ0eSBidXQgTURDVGFibGVzIGFuZCBNRENDaGFydHMgaGF2ZSBhIHdlaXJkIGxvYWRpbmcgbGlmZWN5Y2xlXG5cdFx0XHRpZiAob0VsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSB8fCBvRWxlbWVudC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRcdHRoaXMuYlRhYmxlc0NoYXJ0c0xvYWRlZCA9IGZhbHNlO1xuXHRcdFx0XHRhUHJvbWlzZXMucHVzaCh0aGlzLnF1ZXJ5V2F0Y2hlci5yZWdpc3RlclRhYmxlT3JDaGFydChvRWxlbWVudCkpO1xuXHRcdFx0fSBlbHNlIGlmIChvRWxlbWVudC5pc0EoXCJzYXAuZmUuY29yZS5jb250cm9scy5GaWx0ZXJCYXJcIikpIHtcblx0XHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIucmVnaXN0ZXJGaWx0ZXJCYXIob0VsZW1lbnQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGFQcm9taXNlcztcblx0fVxuXG5cdEBtZXRob2RPdmVycmlkZShcIl9yb3V0aW5nXCIpXG5cdG9uQWZ0ZXJCaW5kaW5nKG9CaW5kaW5nQ29udGV4dD86IENvbnRleHQpIHtcblx0XHQvLyBJbiBjYXNlIHRoZSBwYWdlIGlzIHJlYmluZCB3ZSBuZWVkIHRvIGNsZWFyIHRoZSB0aW1lciAoZWc6IGluIEZDTCwgdGhlIHVzZXIgY2FuIHNlbGVjdCAyIGl0ZW1zIHN1Y2Nlc3NpdmVseSBpbiB0aGUgbGlzdCByZXBvcnQpXG5cdFx0aWYgKHRoaXMucGFnZVJlYWR5VGltZW91dFRpbWVyKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5wYWdlUmVhZHlUaW1lb3V0VGltZXIpO1xuXHRcdH1cblx0XHR0aGlzLnBhZ2VSZWFkeVRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0TG9nLmVycm9yKFxuXHRcdFx0XHRgVGhlIFBhZ2VSZWFkeSBFdmVudCB3YXMgbm90IGZpcmVkIHdpdGhpbiB0aGUgJHt0aGlzLnBhZ2VSZWFkeVRpbWVvdXR9IG1zIHRpbWVvdXQgLiBJdCBoYXMgYmVlbiBmb3JjZWQuIFBsZWFzZSBjb250YWN0IHlvdXIgYXBwbGljYXRpb24gZGV2ZWxvcGVyIGZvciBmdXJ0aGVyIGFuYWx5c2lzYFxuXHRcdFx0KTtcblx0XHRcdHRoaXMuX29FdmVudFByb3ZpZGVyLmZpcmVFdmVudChcInBhZ2VSZWFkeVwiKTtcblx0XHR9LCB0aGlzLnBhZ2VSZWFkeVRpbWVvdXQpO1xuXG5cdFx0aWYgKHRoaXMuX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCA9IHRydWU7XG5cdFx0aWYgKHRoaXMuaXNDb250ZXh0RXhwZWN0ZWQoKSAmJiBvQmluZGluZ0NvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gRm9yY2UgdG8gbWVudGlvbiB3ZSBhcmUgZXhwZWN0aW5nIGRhdGFcblx0XHRcdHRoaXMuYkhhc0NvbnRleHQgPSBmYWxzZTtcblx0XHRcdHJldHVybjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5iSGFzQ29udGV4dCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5hdHRhY2hFdmVudE9uY2UoXG5cdFx0XHRcInBhZ2VSZWFkeVwiLFxuXHRcdFx0bnVsbCxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMucGFnZVJlYWR5VGltZW91dFRpbWVyKTtcblx0XHRcdFx0dGhpcy5wYWdlUmVhZHlUaW1lb3V0VGltZXIgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdHRoaXMuX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLnF1ZXJ5V2F0Y2hlci5yZXNldCgpO1xuXHRcdFx0fSxcblx0XHRcdG51bGxcblx0XHQpO1xuXG5cdFx0dGhpcy5vbkFmdGVyQmluZGluZ1Byb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuXHRcdFx0Y29uc3QgYVRhYmxlQ2hhcnRJbml0aWFsaXplZFByb21pc2VzID0gdGhpcy5yZWdpc3RlckFnZ3JlZ2F0ZWRDb250cm9scyhvQmluZGluZ0NvbnRleHQpO1xuXG5cdFx0XHRpZiAoYVRhYmxlQ2hhcnRJbml0aWFsaXplZFByb21pc2VzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoYVRhYmxlQ2hhcnRJbml0aWFsaXplZFByb21pc2VzKTtcblx0XHRcdFx0dGhpcy5iVGFibGVzQ2hhcnRzTG9hZGVkID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5jaGVja1BhZ2VSZWFkeURlYm91bmNlZCgpO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmNoZWNrUGFnZVJlYWR5RGVib3VuY2VkKCk7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgaXNQYWdlUmVhZHkoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2JJc1BhZ2VSZWFkeTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgd2FpdFBhZ2VSZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGlmICh0aGlzLmlzUGFnZVJlYWR5KCkpIHtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5hdHRhY2hFdmVudE9uY2UoXG5cdFx0XHRcdFx0XCJwYWdlUmVhZHlcIixcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHRoaXNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgYXR0YWNoRXZlbnRPbmNlKHNFdmVudElkOiBzdHJpbmcsIG9EYXRhOiBhbnksIGZuRnVuY3Rpb24/OiBGdW5jdGlvbiwgb0xpc3RlbmVyPzogYW55KSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuXHRcdHJldHVybiB0aGlzLl9vRXZlbnRQcm92aWRlci5hdHRhY2hFdmVudE9uY2Uoc0V2ZW50SWQsIG9EYXRhLCBmbkZ1bmN0aW9uIGFzIEZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgYXR0YWNoRXZlbnQoc0V2ZW50SWQ6IHN0cmluZywgb0RhdGE6IGFueSwgZm5GdW5jdGlvbjogRnVuY3Rpb24sIG9MaXN0ZW5lcjogYW55KSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuXHRcdHJldHVybiB0aGlzLl9vRXZlbnRQcm92aWRlci5hdHRhY2hFdmVudChzRXZlbnRJZCwgb0RhdGEsIGZuRnVuY3Rpb24sIG9MaXN0ZW5lcik7XG5cdH1cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHB1YmxpYyBkZXRhY2hFdmVudChzRXZlbnRJZDogc3RyaW5nLCBmbkZ1bmN0aW9uOiBGdW5jdGlvbikge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcblx0XHRyZXR1cm4gdGhpcy5fb0V2ZW50UHJvdmlkZXIuZGV0YWNoRXZlbnQoc0V2ZW50SWQsIGZuRnVuY3Rpb24pO1xuXHR9XG5cdHByaXZhdGUgcmVnaXN0ZXJDb250YWluZXIob0NvbnRhaW5lcjogTWFuYWdlZE9iamVjdCkge1xuXHRcdHRoaXMuX29Db250YWluZXIgPSBvQ29udGFpbmVyO1xuXHRcdHRoaXMuX2ZuQ29udGFpbmVyRGVsZWdhdGUgPSB7XG5cdFx0XHRvbkJlZm9yZVNob3c6ICgpID0+IHtcblx0XHRcdFx0dGhpcy5iU2hvd24gPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5fYklzUGFnZVJlYWR5ID0gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0b25CZWZvcmVIaWRlOiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYlNob3duID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuX2JJc1BhZ2VSZWFkeSA9IGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdG9uQWZ0ZXJTaG93OiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYlNob3duID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5vbkFmdGVyQmluZGluZ1Byb21pc2U/LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2NoZWNrUGFnZVJlYWR5KHRydWUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuX29Db250YWluZXIuYWRkRXZlbnREZWxlZ2F0ZSh0aGlzLl9mbkNvbnRhaW5lckRlbGVnYXRlLCB0aGlzKTtcblx0fVxuXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uSW5zdGVhZClcblx0cHVibGljIGlzQ29udGV4dEV4cGVjdGVkKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRwdWJsaWMgY2hlY2tQYWdlUmVhZHlEZWJvdW5jZWQoKSB7XG5cdFx0aWYgKHRoaXMucGFnZVJlYWR5VGltZXIpIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnBhZ2VSZWFkeVRpbWVyKTtcblx0XHR9XG5cdFx0dGhpcy5wYWdlUmVhZHlUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGhpcy5fY2hlY2tQYWdlUmVhZHkoKTtcblx0XHR9LCAyMDApIGFzIHVua25vd24gYXMgbnVtYmVyO1xuXHR9XG5cblx0cHVibGljIF9jaGVja1BhZ2VSZWFkeShiRnJvbU5hdjogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0Y29uc3QgZm5VSVVwZGF0ZWQgPSAoKSA9PiB7XG5cdFx0XHQvLyBXYWl0IHVudGlsIHRoZSBVSSBpcyBubyBsb25nZXIgZGlydHlcblx0XHRcdGlmICghQ29yZS5nZXRVSURpcnR5KCkpIHtcblx0XHRcdFx0Q29yZS5kZXRhY2hFdmVudChcIlVJVXBkYXRlZFwiLCBmblVJVXBkYXRlZCk7XG5cdFx0XHRcdHRoaXMuX2JXYWl0aW5nRm9yUmVmcmVzaCA9IGZhbHNlO1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9jaGVja1BhZ2VSZWFkeSgpO1xuXHRcdFx0XHR9LCAyMCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIEluIGNhc2UgVUlVcGRhdGUgZG9lcyBub3QgZ2V0IGNhbGxlZCwgY2hlY2sgaWYgVUkgaXMgbm90IGRpcnR5IGFuZCB0aGVuIGNhbGwgX2NoZWNrUGFnZVJlYWR5XG5cdFx0Y29uc3QgY2hlY2tVSVVwZGF0ZWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAoQ29yZS5nZXRVSURpcnR5KCkpIHtcblx0XHRcdFx0c2V0VGltZW91dChjaGVja1VJVXBkYXRlZCwgNTAwKTtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5fYldhaXRpbmdGb3JSZWZyZXNoKSB7XG5cdFx0XHRcdHRoaXMuX2JXYWl0aW5nRm9yUmVmcmVzaCA9IGZhbHNlO1xuXHRcdFx0XHRDb3JlLmRldGFjaEV2ZW50KFwiVUlVcGRhdGVkXCIsIGZuVUlVcGRhdGVkKTtcblx0XHRcdFx0dGhpcy5fY2hlY2tQYWdlUmVhZHkoKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5iU2hvd24gJiZcblx0XHRcdHRoaXMucXVlcnlXYXRjaGVyLmlzRGF0YVJlY2VpdmVkKCkgIT09IGZhbHNlICYmXG5cdFx0XHR0aGlzLmJUYWJsZXNDaGFydHNMb2FkZWQgIT09IGZhbHNlICYmXG5cdFx0XHQoIXRoaXMuaXNDb250ZXh0RXhwZWN0ZWQoKSB8fCB0aGlzLmJIYXNDb250ZXh0KSAvLyBFaXRoZXIgbm8gY29udGV4dCBpcyBleHBlY3RlZCBvciB0aGVyZSBpcyBvbmVcblx0XHQpIHtcblx0XHRcdGlmICh0aGlzLnF1ZXJ5V2F0Y2hlci5pc0RhdGFSZWNlaXZlZCgpID09PSB0cnVlICYmICFiRnJvbU5hdiAmJiAhdGhpcy5fYldhaXRpbmdGb3JSZWZyZXNoICYmIENvcmUuZ2V0VUlEaXJ0eSgpKSB7XG5cdFx0XHRcdC8vIElmIHdlIHJlcXVlc3RlZCBkYXRhIHdlIGdldCBub3RpZmllZCBhcyBzb29uIGFzIHRoZSBkYXRhIGFycml2ZWQsIHNvIGJlZm9yZSB0aGUgbmV4dCByZW5kZXJpbmcgdGlja1xuXHRcdFx0XHR0aGlzLnF1ZXJ5V2F0Y2hlci5yZXNldERhdGFSZWNlaXZlZCgpO1xuXHRcdFx0XHR0aGlzLl9iV2FpdGluZ0ZvclJlZnJlc2ggPSB0cnVlO1xuXHRcdFx0XHRDb3JlLmF0dGFjaEV2ZW50KFwiVUlVcGRhdGVkXCIsIGZuVUlVcGRhdGVkKTtcblx0XHRcdFx0c2V0VGltZW91dChjaGVja1VJVXBkYXRlZCwgNTAwKTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdCghdGhpcy5fYldhaXRpbmdGb3JSZWZyZXNoICYmIENvcmUuZ2V0VUlEaXJ0eSgpKSB8fFxuXHRcdFx0XHR0aGlzLl9uYldhaXRzICE9PSAwIHx8XG5cdFx0XHRcdFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeS5nZXROdW1iZXJPZlZpZXdzSW5DcmVhdGlvblN0YXRlKCkgPiAwIHx8XG5cdFx0XHRcdHRoaXMucXVlcnlXYXRjaGVyLmlzU2VhcmNoUGVuZGluZygpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy5fYldhaXRpbmdGb3JSZWZyZXNoID0gdHJ1ZTtcblx0XHRcdFx0Q29yZS5hdHRhY2hFdmVudChcIlVJVXBkYXRlZFwiLCBmblVJVXBkYXRlZCk7XG5cdFx0XHRcdHNldFRpbWVvdXQoY2hlY2tVSVVwZGF0ZWQsIDUwMCk7XG5cdFx0XHR9IGVsc2UgaWYgKCF0aGlzLl9iV2FpdGluZ0ZvclJlZnJlc2gpIHtcblx0XHRcdFx0Ly8gSW4gdGhlIGNhc2Ugd2UncmUgbm90IHdhaXRpbmcgZm9yIGFueSBkYXRhIChuYXZpZ2F0aW5nIGJhY2sgdG8gYSBwYWdlIHdlIGFscmVhZHkgaGF2ZSBsb2FkZWQpXG5cdFx0XHRcdC8vIGp1c3Qgd2FpdCBmb3IgYSBmcmFtZSB0byBmaXJlIHRoZSBldmVudC5cblx0XHRcdFx0dGhpcy5fYklzUGFnZVJlYWR5ID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5fb0V2ZW50UHJvdmlkZXIuZmlyZUV2ZW50KFwicGFnZVJlYWR5XCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYWdlUmVhZHlDb250cm9sbGVyRXh0ZW5zaW9uO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7OztNQW1CTUEsNEJBQTRCLFdBRGpDQyxjQUFjLENBQUMsNENBQTRDLENBQUMsVUF1QjNEQyxjQUFjLEVBQUUs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