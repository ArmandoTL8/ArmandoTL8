/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/m/IllustratedMessage", "sap/m/Page", "./RootViewBaseController"], function (Log, CommonUtils, ViewState, ClassSupport, KeepAliveHelper, IllustratedMessage, Page, BaseController) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Base controller class for your own root view with a sap.m.NavContainer control.
   *
   * By using or extending this controller you can use your own root view with the sap.fe.core.AppComponent and
   * you can make use of SAP Fiori elements pages and SAP Fiori elements building blocks.
   *
   * @hideconstructor
   * @public
   * @since 1.108.0
   */
  let NavContainerController = (_dec = defineUI5Class("sap.fe.core.rootView.NavContainer"), _dec2 = usingExtension(ViewState.override({
    applyInitialStateOnly: function () {
      return false;
    },
    adaptBindingRefreshControls: function (aControls) {
      const oView = this.getView(),
        oController = oView.getController();
      aControls.push(oController._getCurrentPage(oView));
    },
    adaptStateControls: function (aStateControls) {
      const oView = this.getView(),
        oController = oView.getController();
      aStateControls.push(oController._getCurrentPage(oView));
    },
    onRestore: function () {
      const oView = this.getView(),
        oController = oView.getController(),
        oNavContainer = oController.getAppContentContainer();
      const oInternalModel = oNavContainer.getModel("internal");
      const oPages = oInternalModel.getProperty("/pages");
      for (const sComponentId in oPages) {
        oInternalModel.setProperty(`/pages/${sComponentId}/restoreStatus`, "pending");
      }
      oController.onContainerReady();
    },
    onSuspend: function () {
      const oView = this.getView(),
        oNavController = oView.getController(),
        oNavContainer = oNavController.getAppContentContainer();
      const aPages = oNavContainer.getPages();
      aPages.forEach(function (oPage) {
        const oTargetView = CommonUtils.getTargetView(oPage);
        const oController = oTargetView && oTargetView.getController();
        if (oController && oController.viewState && oController.viewState.onSuspend) {
          oController.viewState.onSuspend();
        }
      });
    }
  })), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(NavContainerController, _BaseController);
    function NavContainerController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "viewState", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = NavContainerController.prototype;
    _proto.onContainerReady = function onContainerReady() {
      // Restore views if neccessary.
      const oView = this.getView(),
        oPagePromise = this._getCurrentPage(oView);
      return oPagePromise.then(function (oCurrentPage) {
        const oTargetView = CommonUtils.getTargetView(oCurrentPage);
        return KeepAliveHelper.restoreView(oTargetView);
      });
    };
    _proto._getCurrentPage = function _getCurrentPage(oView) {
      const oNavContainer = this.getAppContentContainer();
      return new Promise(function (resolve) {
        const oCurrentPage = oNavContainer.getCurrentPage();
        if (oCurrentPage && oCurrentPage.getController && oCurrentPage.getController().isPlaceholder && oCurrentPage.getController().isPlaceholder()) {
          oCurrentPage.getController().attachEventOnce("targetPageInsertedInContainer", function (oEvent) {
            const oTargetPage = oEvent.getParameter("targetpage");
            const oTargetView = CommonUtils.getTargetView(oTargetPage);
            resolve(oTargetView !== oView && oTargetView);
          });
        } else {
          const oTargetView = CommonUtils.getTargetView(oCurrentPage);
          resolve(oTargetView !== oView && oTargetView);
        }
      });
    }

    /**
     * @private
     * @name sap.fe.core.rootView.NavContainer.getMetadata
     * @function
     */;
    _proto._getNavContainer = function _getNavContainer() {
      return this.getView().getContent()[0];
    }

    /**
     * Gets the instanced views in the navContainer component.
     *
     * @returns {Array} Return the views.
     */;
    _proto.getInstancedViews = function getInstancedViews() {
      return this._getNavContainer().getPages().map(oPage => oPage.getComponentInstance().getRootControl());
    }

    /**
     * Check if the FCL component is enabled.
     *
     * @function
     * @name sap.fe.core.rootView.NavContainer.controller#isFclEnabled
     * @memberof sap.fe.core.rootView.NavContainer.controller
     * @returns `false` since we are not in FCL scenario
     * @ui5-restricted
     * @final
     */;
    _proto.isFclEnabled = function isFclEnabled() {
      return false;
    };
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      // Do nothing
    }

    /**
     * Method that creates a new Page to display the IllustratedMessage containing the current error.
     *
     * @param sErrorMessage
     * @param mParameters
     * @alias sap.fe.core.rootView.NavContainer.controller#displayErrorPage
     * @returns A promise that creates a Page to display the error
     * @public
     */;
    _proto.displayErrorPage = function displayErrorPage(sErrorMessage, mParameters) {
      return new Promise((resolve, reject) => {
        try {
          const oNavContainer = this._getNavContainer();
          if (!this.oPage) {
            this.oPage = new Page({
              showHeader: false
            });
            this.oIllustratedMessage = new IllustratedMessage({
              title: sErrorMessage,
              description: mParameters.description || "",
              illustrationType: `sapIllus-${mParameters.errorType}`
            });
            this.oPage.insertContent(this.oIllustratedMessage, 0);
            oNavContainer.addPage(this.oPage);
          }
          if (mParameters.handleShellBack) {
            const oErrorOriginPage = oNavContainer.getCurrentPage(),
              oAppComponent = CommonUtils.getAppComponent(oNavContainer.getCurrentPage());
            oAppComponent.getShellServices().setBackNavigation(function () {
              oNavContainer.to(oErrorOriginPage.getId());
              oAppComponent.getShellServices().setBackNavigation();
            });
          }
          oNavContainer.attachAfterNavigate(function () {
            resolve(true);
          });
          oNavContainer.to(this.oPage.getId());
        } catch (e) {
          reject(false);
          Log.info(e);
        }
      });
    };
    return NavContainerController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return NavContainerController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZDb250YWluZXJDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlZpZXdTdGF0ZSIsIm92ZXJyaWRlIiwiYXBwbHlJbml0aWFsU3RhdGVPbmx5IiwiYWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzIiwiYUNvbnRyb2xzIiwib1ZpZXciLCJnZXRWaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwicHVzaCIsIl9nZXRDdXJyZW50UGFnZSIsImFkYXB0U3RhdGVDb250cm9scyIsImFTdGF0ZUNvbnRyb2xzIiwib25SZXN0b3JlIiwib05hdkNvbnRhaW5lciIsImdldEFwcENvbnRlbnRDb250YWluZXIiLCJvSW50ZXJuYWxNb2RlbCIsImdldE1vZGVsIiwib1BhZ2VzIiwiZ2V0UHJvcGVydHkiLCJzQ29tcG9uZW50SWQiLCJzZXRQcm9wZXJ0eSIsIm9uQ29udGFpbmVyUmVhZHkiLCJvblN1c3BlbmQiLCJvTmF2Q29udHJvbGxlciIsImFQYWdlcyIsImdldFBhZ2VzIiwiZm9yRWFjaCIsIm9QYWdlIiwib1RhcmdldFZpZXciLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJ2aWV3U3RhdGUiLCJvUGFnZVByb21pc2UiLCJ0aGVuIiwib0N1cnJlbnRQYWdlIiwiS2VlcEFsaXZlSGVscGVyIiwicmVzdG9yZVZpZXciLCJQcm9taXNlIiwicmVzb2x2ZSIsImdldEN1cnJlbnRQYWdlIiwiaXNQbGFjZWhvbGRlciIsImF0dGFjaEV2ZW50T25jZSIsIm9FdmVudCIsIm9UYXJnZXRQYWdlIiwiZ2V0UGFyYW1ldGVyIiwiX2dldE5hdkNvbnRhaW5lciIsImdldENvbnRlbnQiLCJnZXRJbnN0YW5jZWRWaWV3cyIsIm1hcCIsImdldENvbXBvbmVudEluc3RhbmNlIiwiZ2V0Um9vdENvbnRyb2wiLCJpc0ZjbEVuYWJsZWQiLCJfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMiLCJkaXNwbGF5RXJyb3JQYWdlIiwic0Vycm9yTWVzc2FnZSIsIm1QYXJhbWV0ZXJzIiwicmVqZWN0IiwiUGFnZSIsInNob3dIZWFkZXIiLCJvSWxsdXN0cmF0ZWRNZXNzYWdlIiwiSWxsdXN0cmF0ZWRNZXNzYWdlIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImlsbHVzdHJhdGlvblR5cGUiLCJlcnJvclR5cGUiLCJpbnNlcnRDb250ZW50IiwiYWRkUGFnZSIsImhhbmRsZVNoZWxsQmFjayIsIm9FcnJvck9yaWdpblBhZ2UiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0U2hlbGxTZXJ2aWNlcyIsInNldEJhY2tOYXZpZ2F0aW9uIiwidG8iLCJnZXRJZCIsImF0dGFjaEFmdGVyTmF2aWdhdGUiLCJlIiwiTG9nIiwiaW5mbyIsIkJhc2VDb250cm9sbGVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJOYXZDb250YWluZXIuY29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHVzaW5nRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgSWxsdXN0cmF0ZWRNZXNzYWdlIGZyb20gXCJzYXAvbS9JbGx1c3RyYXRlZE1lc3NhZ2VcIjtcbmltcG9ydCB0eXBlIE5hdkNvbnRhaW5lciBmcm9tIFwic2FwL20vTmF2Q29udGFpbmVyXCI7XG5pbXBvcnQgUGFnZSBmcm9tIFwic2FwL20vUGFnZVwiO1xuaW1wb3J0IHR5cGUgQ29tcG9uZW50Q29udGFpbmVyIGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRDb250YWluZXJcIjtcbmltcG9ydCB0eXBlIFhNTFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9YTUxWaWV3XCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IEJhc2VDb250cm9sbGVyIGZyb20gXCIuL1Jvb3RWaWV3QmFzZUNvbnRyb2xsZXJcIjtcblxuLyoqXG4gKiBCYXNlIGNvbnRyb2xsZXIgY2xhc3MgZm9yIHlvdXIgb3duIHJvb3QgdmlldyB3aXRoIGEgc2FwLm0uTmF2Q29udGFpbmVyIGNvbnRyb2wuXG4gKlxuICogQnkgdXNpbmcgb3IgZXh0ZW5kaW5nIHRoaXMgY29udHJvbGxlciB5b3UgY2FuIHVzZSB5b3VyIG93biByb290IHZpZXcgd2l0aCB0aGUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50IGFuZFxuICogeW91IGNhbiBtYWtlIHVzZSBvZiBTQVAgRmlvcmkgZWxlbWVudHMgcGFnZXMgYW5kIFNBUCBGaW9yaSBlbGVtZW50cyBidWlsZGluZyBibG9ja3MuXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuMTA4LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUucm9vdFZpZXcuTmF2Q29udGFpbmVyXCIpXG5jbGFzcyBOYXZDb250YWluZXJDb250cm9sbGVyIGV4dGVuZHMgQmFzZUNvbnRyb2xsZXIge1xuXHRAdXNpbmdFeHRlbnNpb24oXG5cdFx0Vmlld1N0YXRlLm92ZXJyaWRlKHtcblx0XHRcdGFwcGx5SW5pdGlhbFN0YXRlT25seTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0YWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlLCBhQ29udHJvbHM6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIE5hdkNvbnRhaW5lckNvbnRyb2xsZXI7XG5cdFx0XHRcdGFDb250cm9scy5wdXNoKG9Db250cm9sbGVyLl9nZXRDdXJyZW50UGFnZShvVmlldykpO1xuXHRcdFx0fSxcblx0XHRcdGFkYXB0U3RhdGVDb250cm9sczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSwgYVN0YXRlQ29udHJvbHM6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIE5hdkNvbnRhaW5lckNvbnRyb2xsZXI7XG5cdFx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0NvbnRyb2xsZXIuX2dldEN1cnJlbnRQYWdlKG9WaWV3KSk7XG5cdFx0XHR9LFxuXHRcdFx0b25SZXN0b3JlOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlKSB7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTmF2Q29udGFpbmVyQ29udHJvbGxlcixcblx0XHRcdFx0XHRvTmF2Q29udGFpbmVyID0gb0NvbnRyb2xsZXIuZ2V0QXBwQ29udGVudENvbnRhaW5lcigpO1xuXHRcdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbCA9IG9OYXZDb250YWluZXIuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdGNvbnN0IG9QYWdlcyA9IG9JbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KFwiL3BhZ2VzXCIpO1xuXG5cdFx0XHRcdGZvciAoY29uc3Qgc0NvbXBvbmVudElkIGluIG9QYWdlcykge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KGAvcGFnZXMvJHtzQ29tcG9uZW50SWR9L3Jlc3RvcmVTdGF0dXNgLCBcInBlbmRpbmdcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0NvbnRyb2xsZXIub25Db250YWluZXJSZWFkeSgpO1xuXHRcdFx0fSxcblx0XHRcdG9uU3VzcGVuZDogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHRcdG9OYXZDb250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIE5hdkNvbnRhaW5lckNvbnRyb2xsZXIsXG5cdFx0XHRcdFx0b05hdkNvbnRhaW5lciA9IG9OYXZDb250cm9sbGVyLmdldEFwcENvbnRlbnRDb250YWluZXIoKSBhcyBOYXZDb250YWluZXI7XG5cdFx0XHRcdGNvbnN0IGFQYWdlcyA9IG9OYXZDb250YWluZXIuZ2V0UGFnZXMoKTtcblx0XHRcdFx0YVBhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG9QYWdlOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0VmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1BhZ2UpO1xuXG5cdFx0XHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVGFyZ2V0VmlldyAmJiAob1RhcmdldFZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKTtcblx0XHRcdFx0XHRpZiAob0NvbnRyb2xsZXIgJiYgb0NvbnRyb2xsZXIudmlld1N0YXRlICYmIG9Db250cm9sbGVyLnZpZXdTdGF0ZS5vblN1c3BlbmQpIHtcblx0XHRcdFx0XHRcdG9Db250cm9sbGVyLnZpZXdTdGF0ZS5vblN1c3BlbmQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0dmlld1N0YXRlITogVmlld1N0YXRlO1xuXHRvUGFnZT86IFBhZ2U7XG5cdG9JbGx1c3RyYXRlZE1lc3NhZ2U/OiBJbGx1c3RyYXRlZE1lc3NhZ2U7XG5cblx0b25Db250YWluZXJSZWFkeSgpIHtcblx0XHQvLyBSZXN0b3JlIHZpZXdzIGlmIG5lY2Nlc3NhcnkuXG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdG9QYWdlUHJvbWlzZSA9IHRoaXMuX2dldEN1cnJlbnRQYWdlKG9WaWV3KTtcblxuXHRcdHJldHVybiBvUGFnZVByb21pc2UudGhlbihmdW5jdGlvbiAob0N1cnJlbnRQYWdlOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9UYXJnZXRWaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvQ3VycmVudFBhZ2UpO1xuXHRcdFx0cmV0dXJuIEtlZXBBbGl2ZUhlbHBlci5yZXN0b3JlVmlldyhvVGFyZ2V0Vmlldyk7XG5cdFx0fSk7XG5cdH1cblxuXHRfZ2V0Q3VycmVudFBhZ2UodGhpczogTmF2Q29udGFpbmVyQ29udHJvbGxlciwgb1ZpZXc6IGFueSkge1xuXHRcdGNvbnN0IG9OYXZDb250YWluZXIgPSB0aGlzLmdldEFwcENvbnRlbnRDb250YWluZXIoKSBhcyBOYXZDb250YWluZXI7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Y29uc3Qgb0N1cnJlbnRQYWdlID0gb05hdkNvbnRhaW5lci5nZXRDdXJyZW50UGFnZSgpIGFzIGFueTtcblx0XHRcdGlmIChcblx0XHRcdFx0b0N1cnJlbnRQYWdlICYmXG5cdFx0XHRcdG9DdXJyZW50UGFnZS5nZXRDb250cm9sbGVyICYmXG5cdFx0XHRcdG9DdXJyZW50UGFnZS5nZXRDb250cm9sbGVyKCkuaXNQbGFjZWhvbGRlciAmJlxuXHRcdFx0XHRvQ3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlcigpLmlzUGxhY2Vob2xkZXIoKVxuXHRcdFx0KSB7XG5cdFx0XHRcdG9DdXJyZW50UGFnZS5nZXRDb250cm9sbGVyKCkuYXR0YWNoRXZlbnRPbmNlKFwidGFyZ2V0UGFnZUluc2VydGVkSW5Db250YWluZXJcIiwgZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RhcmdldFBhZ2UgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidGFyZ2V0cGFnZVwiKTtcblx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0VmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1RhcmdldFBhZ2UpO1xuXHRcdFx0XHRcdHJlc29sdmUob1RhcmdldFZpZXcgIT09IG9WaWV3ICYmIG9UYXJnZXRWaWV3KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBvVGFyZ2V0VmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob0N1cnJlbnRQYWdlKTtcblx0XHRcdFx0cmVzb2x2ZShvVGFyZ2V0VmlldyAhPT0gb1ZpZXcgJiYgb1RhcmdldFZpZXcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3Lk5hdkNvbnRhaW5lci5nZXRNZXRhZGF0YVxuXHQgKiBAZnVuY3Rpb25cblx0ICovXG5cblx0X2dldE5hdkNvbnRhaW5lcigpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udGVudCgpWzBdO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGluc3RhbmNlZCB2aWV3cyBpbiB0aGUgbmF2Q29udGFpbmVyIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm4gdGhlIHZpZXdzLlxuXHQgKi9cblx0Z2V0SW5zdGFuY2VkVmlld3MoKTogWE1MVmlld1tdIHtcblx0XHRyZXR1cm4gKCh0aGlzLl9nZXROYXZDb250YWluZXIoKSBhcyBOYXZDb250YWluZXIpLmdldFBhZ2VzKCkgYXMgQ29tcG9uZW50Q29udGFpbmVyW10pLm1hcCgob1BhZ2UpID0+XG5cdFx0XHQob1BhZ2UgYXMgYW55KS5nZXRDb21wb25lbnRJbnN0YW5jZSgpLmdldFJvb3RDb250cm9sKClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHRoZSBGQ0wgY29tcG9uZW50IGlzIGVuYWJsZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5OYXZDb250YWluZXIuY29udHJvbGxlciNpc0ZjbEVuYWJsZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3Lk5hdkNvbnRhaW5lci5jb250cm9sbGVyXG5cdCAqIEByZXR1cm5zIGBmYWxzZWAgc2luY2Ugd2UgYXJlIG5vdCBpbiBGQ0wgc2NlbmFyaW9cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0aXNGY2xFbmFibGVkKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdF9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcygpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRoYXQgY3JlYXRlcyBhIG5ldyBQYWdlIHRvIGRpc3BsYXkgdGhlIElsbHVzdHJhdGVkTWVzc2FnZSBjb250YWluaW5nIHRoZSBjdXJyZW50IGVycm9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0Vycm9yTWVzc2FnZVxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnNcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLnJvb3RWaWV3Lk5hdkNvbnRhaW5lci5jb250cm9sbGVyI2Rpc3BsYXlFcnJvclBhZ2Vcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgY3JlYXRlcyBhIFBhZ2UgdG8gZGlzcGxheSB0aGUgZXJyb3Jcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0ZGlzcGxheUVycm9yUGFnZShzRXJyb3JNZXNzYWdlOiBzdHJpbmcsIG1QYXJhbWV0ZXJzOiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IG9OYXZDb250YWluZXIgPSB0aGlzLl9nZXROYXZDb250YWluZXIoKSBhcyBOYXZDb250YWluZXI7XG5cblx0XHRcdFx0aWYgKCF0aGlzLm9QYWdlKSB7XG5cdFx0XHRcdFx0dGhpcy5vUGFnZSA9IG5ldyBQYWdlKHtcblx0XHRcdFx0XHRcdHNob3dIZWFkZXI6IGZhbHNlXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHR0aGlzLm9JbGx1c3RyYXRlZE1lc3NhZ2UgPSBuZXcgSWxsdXN0cmF0ZWRNZXNzYWdlKHtcblx0XHRcdFx0XHRcdHRpdGxlOiBzRXJyb3JNZXNzYWdlLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IG1QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uIHx8IFwiXCIsXG5cdFx0XHRcdFx0XHRpbGx1c3RyYXRpb25UeXBlOiBgc2FwSWxsdXMtJHttUGFyYW1ldGVycy5lcnJvclR5cGV9YFxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dGhpcy5vUGFnZS5pbnNlcnRDb250ZW50KHRoaXMub0lsbHVzdHJhdGVkTWVzc2FnZSwgMCk7XG5cdFx0XHRcdFx0b05hdkNvbnRhaW5lci5hZGRQYWdlKHRoaXMub1BhZ2UpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmhhbmRsZVNoZWxsQmFjaykge1xuXHRcdFx0XHRcdGNvbnN0IG9FcnJvck9yaWdpblBhZ2UgPSBvTmF2Q29udGFpbmVyLmdldEN1cnJlbnRQYWdlKCksXG5cdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9OYXZDb250YWluZXIuZ2V0Q3VycmVudFBhZ2UoKSk7XG5cdFx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0QmFja05hdmlnYXRpb24oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0KG9OYXZDb250YWluZXIgYXMgYW55KS50byhvRXJyb3JPcmlnaW5QYWdlLmdldElkKCkpO1xuXHRcdFx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0QmFja05hdmlnYXRpb24oKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvTmF2Q29udGFpbmVyLmF0dGFjaEFmdGVyTmF2aWdhdGUoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJlc29sdmUodHJ1ZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRvTmF2Q29udGFpbmVyLnRvKHRoaXMub1BhZ2UuZ2V0SWQoKSk7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdHJlamVjdChmYWxzZSk7XG5cdFx0XHRcdExvZy5pbmZvKGUgYXMgYW55KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBOYXZDb250YWluZXJDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0VBY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFUQSxJQVdNQSxzQkFBc0IsV0FEM0JDLGNBQWMsQ0FBQyxtQ0FBbUMsQ0FBQyxVQUVsREMsY0FBYyxDQUNkQyxTQUFTLENBQUNDLFFBQVEsQ0FBQztJQUNsQkMscUJBQXFCLEVBQUUsWUFBWTtNQUNsQyxPQUFPLEtBQUs7SUFDYixDQUFDO0lBQ0RDLDJCQUEyQixFQUFFLFVBQTJCQyxTQUFjLEVBQUU7TUFDdkUsTUFBTUMsS0FBSyxHQUFHLElBQUksQ0FBQ0MsT0FBTyxFQUFFO1FBQzNCQyxXQUFXLEdBQUdGLEtBQUssQ0FBQ0csYUFBYSxFQUE0QjtNQUM5REosU0FBUyxDQUFDSyxJQUFJLENBQUNGLFdBQVcsQ0FBQ0csZUFBZSxDQUFDTCxLQUFLLENB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