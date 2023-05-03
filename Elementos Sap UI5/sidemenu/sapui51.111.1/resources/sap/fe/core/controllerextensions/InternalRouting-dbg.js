/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/routing/NavigationReason", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, CommonUtils, BusyLocker, ActivitySync, draft, NavigationReason, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, Component, Core, ControllerExtension, OverrideExecution, Filter, FilterOperator) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var isConnected = ActivitySync.isConnected;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
   *
   * @namespace
   * @alias sap.fe.core.controllerextensions.InternalRouting
   * @private
   * @since 1.74.0
   */
  let InternalRouting = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalRouting"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = extensible(OverrideExecution.After), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = extensible(OverrideExecution.After), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = publicExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = finalExtension(), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = publicExtension(), _dec28 = finalExtension(), _dec29 = publicExtension(), _dec30 = extensible(OverrideExecution.Before), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalRouting, _ControllerExtension);
    function InternalRouting() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalRouting.prototype;
    _proto.onExit = function onExit() {
      if (this._oRoutingService) {
        this._oRoutingService.detachRouteMatched(this._fnRouteMatchedBound);
      }
    };
    _proto.onInit = function onInit() {
      this._oView = this.base.getView();
      this._oAppComponent = CommonUtils.getAppComponent(this._oView);
      this._oPageComponent = Component.getOwnerComponentFor(this._oView);
      this._oRouter = this._oAppComponent.getRouter();
      this._oRouterProxy = this._oAppComponent.getRouterProxy();
      if (!this._oAppComponent || !this._oPageComponent) {
        throw new Error("Failed to initialize controler extension 'sap.fe.core.controllerextesions.InternalRouting");
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (this._oAppComponent === this._oPageComponent) {
        // The view isn't hosted in a dedicated UIComponent, but directly in the app
        // --> just keep the view
        this._oPageComponent = null;
      }
      this._oAppComponent.getService("routingService").then(oRoutingService => {
        this._oRoutingService = oRoutingService;
        this._fnRouteMatchedBound = this._onRouteMatched.bind(this);
        this._oRoutingService.attachRouteMatched(this._fnRouteMatchedBound);
        this._oTargetInformation = oRoutingService.getTargetInformationFor(this._oPageComponent || this._oView);
      }).catch(function () {
        throw new Error("This controller extension cannot work without a 'routingService' on the main AppComponent");
      });
    }

    /**
     * Triggered every time this controller is a navigation target.
     */;
    _proto.onRouteMatched = function onRouteMatched() {
      /**/
    };
    _proto.onRouteMatchedFinished = function onRouteMatchedFinished() {
      /**/
    };
    _proto.onBeforeBinding = function onBeforeBinding(oBindingContext, mParameters) {
      const oRouting = this.base.getView().getController().routing;
      if (oRouting && oRouting.onBeforeBinding) {
        oRouting.onBeforeBinding(oBindingContext, mParameters);
      }
    };
    _proto.onAfterBinding = function onAfterBinding(oBindingContext, mParameters) {
      this._oAppComponent.getRootViewController().onContextBoundToView(oBindingContext);
      const oRouting = this.base.getView().getController().routing;
      if (oRouting && oRouting.onAfterBinding) {
        oRouting.onAfterBinding(oBindingContext, mParameters);
      }
    }

    ///////////////////////////////////////////////////////////
    // Methods triggering a navigation after a user action
    // (e.g. click on a table row, button, etc...)
    ///////////////////////////////////////////////////////////

    /**
     * Navigates to the specified navigation target.
     *
     * @param oContext Context instance
     * @param sNavigationTargetName Name of the navigation target
     * @param bPreserveHistory True to force the new URL to be added at the end of the browser history (no replace)
     * @ui5-restricted
     */;
    _proto.navigateToTarget = function navigateToTarget(oContext, sNavigationTargetName, bPreserveHistory) {
      const oNavigationConfiguration = this._oPageComponent && this._oPageComponent.getNavigationConfiguration && this._oPageComponent.getNavigationConfiguration(sNavigationTargetName);
      if (oNavigationConfiguration) {
        const oDetailRoute = oNavigationConfiguration.detail;
        const sRouteName = oDetailRoute.route;
        const mParameterMapping = oDetailRoute.parameters;
        this._oRoutingService.navigateTo(oContext, sRouteName, mParameterMapping, bPreserveHistory);
      } else {
        this._oRoutingService.navigateTo(oContext, null, null, bPreserveHistory);
      }
      this._oView.getViewData();
    }

    /**
     * Navigates to the specified navigation target route.
     *
     * @param sTargetRouteName Name of the target route
     * @param [oParameters] Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @ui5-restricted
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oParameters) {
      return this._oRoutingService.navigateToRoute(sTargetRouteName, oParameters);
    }

    /**
     * Navigates to a specific context.
     *
     * @param oContext The context to be navigated to
     * @param [mParameters] Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateToContext = function navigateToContext(oContext, mParameters) {
      const oContextInfo = {};
      mParameters = mParameters || {};
      if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        if (mParameters.asyncContext) {
          // the context is either created async (Promise)
          // We need to activate the routeMatchSynchro on the RouterProxy to avoid that
          // the subsequent call to navigateToContext conflicts with the current one
          this._oRouterProxy.activateRouteMatchSynchronization();
          mParameters.asyncContext.then(asyncContext => {
            // once the context is returned we navigate into it
            this.navigateToContext(asyncContext, {
              checkNoHashChange: mParameters.checkNoHashChange,
              editable: mParameters.editable,
              bPersistOPScroll: mParameters.bPersistOPScroll,
              updateFCLLevel: mParameters.updateFCLLevel,
              bForceFocus: mParameters.bForceFocus
            });
          }).catch(function (oError) {
            Log.error("Error with the async context", oError);
          });
        } else if (!mParameters.bDeferredContext) {
          // Navigate to a list binding not yet supported
          throw "navigation to a list binding is not yet supported";
        }
      }
      if (mParameters.callExtension) {
        const oInternalModel = this._oView.getModel("internal");
        oInternalModel.setProperty("/paginatorCurrentContext", null);
        oContextInfo.sourceBindingContext = oContext.getObject();
        oContextInfo.bindingContext = oContext;
        if (mParameters.oEvent) {
          oContextInfo.oEvent = mParameters.oEvent;
        }
        // Storing the selected context to use it in internal route navigation if neccessary.
        const bOverrideNav = this.base.getView().getController().routing.onBeforeNavigation(oContextInfo);
        if (bOverrideNav) {
          oInternalModel.setProperty("/paginatorCurrentContext", oContext);
          return Promise.resolve(true);
        }
      }
      mParameters.FCLLevel = this._getFCLLevel();
      return this._oRoutingService.navigateToContext(oContext, mParameters, this._oView.getViewData(), this._oTargetInformation);
    }

    /**
     * Navigates backwards from a context.
     *
     * @param oContext Context to be navigated from
     * @param [mParameters] Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateBackFromContext = function navigateBackFromContext(oContext, mParameters) {
      mParameters = mParameters || {};
      mParameters.updateFCLLevel = -1;
      return this.navigateToContext(oContext, mParameters);
    }

    /**
     * Navigates forwards to a context.
     *
     * @param oContext Context to be navigated to
     * @param mParameters Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateForwardToContext = function navigateForwardToContext(oContext, mParameters) {
      var _this$_oView$getBindi;
      if (((_this$_oView$getBindi = this._oView.getBindingContext("internal")) === null || _this$_oView$getBindi === void 0 ? void 0 : _this$_oView$getBindi.getProperty("messageFooterContainsErrors")) === true) {
        return Promise.resolve(true);
      }
      mParameters = mParameters || {};
      mParameters.updateFCLLevel = 1;
      return this.navigateToContext(oContext, mParameters);
    }

    /**
     * Navigates back in history if the current hash corresponds to a transient state.
     */;
    _proto.navigateBackFromTransientState = function navigateBackFromTransientState() {
      const sHash = this._oRouterProxy.getHash();

      // if triggered while navigating to (...), we need to navigate back
      if (sHash.indexOf("(...)") !== -1) {
        this._oRouterProxy.navBack();
      }
    };
    _proto.navigateToMessagePage = function navigateToMessagePage(sErrorMessage, mParameters) {
      mParameters = mParameters || {};
      if (this._oRouterProxy.getHash().indexOf("i-action=create") > -1 || this._oRouterProxy.getHash().indexOf("i-action=autoCreate") > -1) {
        return this._oRouterProxy.navToHash(this._oRoutingService.getDefaultCreateHash());
      } else {
        mParameters.FCLLevel = this._getFCLLevel();
        return this._oAppComponent.getRootViewController().displayErrorPage(sErrorMessage, mParameters);
      }
    }

    /**
     * Checks if one of the current views on the screen is bound to a given context.
     *
     * @param oContext
     * @returns `true` if the state is impacted by the context
     * @ui5-restricted
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(oContext) {
      return this._oRoutingService.isCurrentStateImpactedBy(oContext);
    };
    _proto._isViewPartOfRoute = function _isViewPartOfRoute(routeInformation) {
      const aTargets = routeInformation === null || routeInformation === void 0 ? void 0 : routeInformation.targets;
      if (!aTargets || aTargets.indexOf(this._oTargetInformation.targetName) === -1) {
        // If the target for this view has a view level greater than the route level, it means this view comes "after" the route
        // in terms of navigation.
        // In such case, we remove its binding context, to avoid this view to have data if we navigate to it later on
        if ((this._oTargetInformation.viewLevel ?? 0) >= ((routeInformation === null || routeInformation === void 0 ? void 0 : routeInformation.routeLevel) ?? 0)) {
          this._setBindingContext(null); // This also call setKeepAlive(false) on the current context
        }

        return false;
      }
      return true;
    };
    _proto._buildBindingPath = function _buildBindingPath(routeArguments, bindingPattern, navigationParameters) {
      let path = bindingPattern.replace(":?query:", "");
      let deferred = false;
      for (const sKey in routeArguments) {
        const sValue = routeArguments[sKey];
        if (sValue === "..." && bindingPattern.indexOf(`{${sKey}}`) >= 0) {
          deferred = true;
          // Sometimes in preferredMode = create, the edit button is shown in background when the
          // action parameter dialog shows up, setting bTargetEditable passes editable as true
          // to onBeforeBinding in _bindTargetPage function
          navigationParameters.bTargetEditable = true;
        }
        path = path.replace(`{${sKey}}`, sValue);
      }
      if (routeArguments["?query"] && routeArguments["?query"].hasOwnProperty("i-action")) {
        navigationParameters.bActionCreate = true;
      }

      // the binding path is always absolute
      if (path && path[0] !== "/") {
        path = `/${path}`;
      }
      return {
        path,
        deferred
      };
    }

    ///////////////////////////////////////////////////////////
    // Methods to bind the page when a route is matched
    ///////////////////////////////////////////////////////////

    /**
     * Called when a route is matched.
     * Builds the binding context from the navigation parameters, and bind the page accordingly.
     *
     * @param oEvent
     * @ui5-restricted
     */;
    _proto._onRouteMatched = function _onRouteMatched(oEvent) {
      // Check if the target for this view is part of the event targets (i.e. is a target for the current route).
      // If not, we don't need to bind it --> return
      if (!this._isViewPartOfRoute(oEvent.getParameter("routeInformation"))) {
        return;
      }

      // Retrieve the binding context pattern
      let bindingPattern;
      if (this._oPageComponent && this._oPageComponent.getBindingContextPattern) {
        bindingPattern = this._oPageComponent.getBindingContextPattern();
      }
      bindingPattern = bindingPattern || this._oTargetInformation.contextPattern;
      if (bindingPattern === null || bindingPattern === undefined) {
        // Don't do this if we already got sTarget == '', which is a valid target pattern
        bindingPattern = oEvent.getParameter("routePattern");
      }

      // Replace the parameters by their values in the binding context pattern
      const mArguments = oEvent.getParameters().arguments;
      const oNavigationParameters = oEvent.getParameter("navigationInfo");
      const {
        path,
        deferred
      } = this._buildBindingPath(mArguments, bindingPattern, oNavigationParameters);
      this.onRouteMatched();
      const oModel = this._oView.getModel();
      let oOut;
      if (deferred) {
        oOut = this._bindDeferred(path, oNavigationParameters);
      } else {
        oOut = this._bindPage(path, oModel, oNavigationParameters);
      }
      // eslint-disable-next-line promise/catch-or-return
      oOut.finally(() => {
        this.onRouteMatchedFinished();
      });
      this._oAppComponent.getRootViewController().updateUIStateForView(this._oView, this._getFCLLevel());
    }

    /**
     * Deferred binding (during object creation).
     *
     * @param sTargetPath The path to the deffered context
     * @param oNavigationParameters Navigation parameters
     * @returns A Promise
     * @ui5-restricted
     */;
    _proto._bindDeferred = function _bindDeferred(sTargetPath, oNavigationParameters) {
      this.onBeforeBinding(null, {
        editable: oNavigationParameters.bTargetEditable
      });
      if (oNavigationParameters.bDeferredContext || !oNavigationParameters.oAsyncContext) {
        // either the context shall be created in the target page (deferred Context) or it shall
        // be created async but the user refreshed the page / bookmarked this URL
        // TODO: currently the target component creates this document but we shall move this to
        // a central place
        if (this._oPageComponent && this._oPageComponent.createDeferredContext) {
          this._oPageComponent.createDeferredContext(sTargetPath, oNavigationParameters.useContext, oNavigationParameters.bActionCreate);
        }
      }
      const currentBindingContext = this._getBindingContext();
      if (currentBindingContext !== null && currentBindingContext !== void 0 && currentBindingContext.hasPendingChanges()) {
        // For now remove the pending changes to avoid the model raises errors and the object page is at least bound
        // Ideally the user should be asked for
        currentBindingContext.getBinding().resetChanges();
      }

      // remove the context to avoid showing old data
      this._setBindingContext(null);
      this.onAfterBinding(null);
      return Promise.resolve();
    }

    /**
     * Sets the binding context of the page from a path.
     *
     * @param sTargetPath The path to the context
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @returns A Promise resolved once the binding has been set on the page
     * @ui5-restricted
     */;
    _proto._bindPage = function _bindPage(sTargetPath, oModel, oNavigationParameters) {
      if (sTargetPath === "") {
        return Promise.resolve(this._bindPageToContext(null, oModel, oNavigationParameters));
      } else {
        return this._resolveSemanticPath(sTargetPath, oModel).then(sTechnicalPath => {
          this._bindPageToPath(sTechnicalPath, oModel, oNavigationParameters);
        }).catch(oError => {
          // Error handling for erroneous metadata request
          const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
          this.navigateToMessagePage(oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"), {
            title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
            description: oError.message
          });
        });
      }
    }

    /**
     * Creates the filter to retrieve a context corresponding to a semantic path.
     *
     * @param sSemanticPath The semantic path
     * @param aSemanticKeys The semantic keys for the path
     * @param oMetaModel The instance of the meta model
     * @returns The filter
     * @ui5-restricted
     */;
    _proto._createFilterFromSemanticPath = function _createFilterFromSemanticPath(sSemanticPath, aSemanticKeys, oMetaModel) {
      const fnUnquoteAndDecode = function (sValue) {
        if (sValue.indexOf("'") === 0 && sValue.lastIndexOf("'") === sValue.length - 1) {
          // Remove the quotes from the value and decode special chars
          sValue = decodeURIComponent(sValue.substring(1, sValue.length - 1));
        }
        return sValue;
      };
      const aKeyValues = sSemanticPath.substring(sSemanticPath.indexOf("(") + 1, sSemanticPath.length - 1).split(",");
      let aFilters;
      if (aSemanticKeys.length != aKeyValues.length) {
        return null;
      }
      const bFilteringCaseSensitive = ModelHelper.isFilteringCaseSensitive(oMetaModel);
      if (aSemanticKeys.length === 1) {
        // Take the first key value
        const sKeyValue = fnUnquoteAndDecode(aKeyValues[0]);
        aFilters = [new Filter({
          path: aSemanticKeys[0].$PropertyPath,
          operator: FilterOperator.EQ,
          value1: sKeyValue,
          caseSensitive: bFilteringCaseSensitive
        })];
      } else {
        const mKeyValues = {};
        // Create a map of all key values
        aKeyValues.forEach(function (sKeyAssignment) {
          const aParts = sKeyAssignment.split("="),
            sKeyValue = fnUnquoteAndDecode(aParts[1]);
          mKeyValues[aParts[0]] = sKeyValue;
        });
        let bFailed = false;
        aFilters = aSemanticKeys.map(function (oSemanticKey) {
          const sKey = oSemanticKey.$PropertyPath,
            sValue = mKeyValues[sKey];
          if (sValue !== undefined) {
            return new Filter({
              path: sKey,
              operator: FilterOperator.EQ,
              value1: sValue,
              caseSensitive: bFilteringCaseSensitive
            });
          } else {
            bFailed = true;
            return new Filter({
              path: "XX"
            }); // will be ignore anyway since we return after
          }
        });

        if (bFailed) {
          return null;
        }
      }

      // Add a draft filter to make sure we take the draft entity if there is one
      // Or the active entity otherwise
      const oDraftFilter = new Filter({
        filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
        and: false
      });
      aFilters.push(oDraftFilter);
      return new Filter(aFilters, true);
    }

    /**
     * Converts a path with semantic keys to a path with technical keys.
     *
     * @param sSemanticPath The path with semantic keys
     * @param oModel The model for the path
     * @param aSemanticKeys The semantic keys for the path
     * @returns A Promise containing the path with technical keys if sSemanticPath could be interpreted as a semantic path, null otherwise
     * @ui5-restricted
     */;
    _proto._getTechnicalPathFromSemanticPath = function _getTechnicalPathFromSemanticPath(sSemanticPath, oModel, aSemanticKeys) {
      var _sEntitySetPath;
      const oMetaModel = oModel.getMetaModel();
      let sEntitySetPath = oMetaModel.getMetaContext(sSemanticPath).getPath();
      if (!aSemanticKeys || aSemanticKeys.length === 0) {
        // No semantic keys
        return Promise.resolve(null);
      }

      // Create a set of filters corresponding to all keys
      const oFilter = this._createFilterFromSemanticPath(sSemanticPath, aSemanticKeys, oMetaModel);
      if (oFilter === null) {
        // Couldn't interpret the path as a semantic one
        return Promise.resolve(null);
      }

      // Load the corresponding object
      if (!((_sEntitySetPath = sEntitySetPath) !== null && _sEntitySetPath !== void 0 && _sEntitySetPath.startsWith("/"))) {
        sEntitySetPath = `/${sEntitySetPath}`;
      }
      const oListBinding = oModel.bindList(sEntitySetPath, undefined, undefined, oFilter, {
        $$groupId: "$auto.Heroes"
      });
      return oListBinding.requestContexts(0, 2).then(function (oContexts) {
        if (oContexts && oContexts.length) {
          return oContexts[0].getPath();
        } else {
          // No data could be loaded
          return null;
        }
      });
    }

    /**
     * Checks if a path is eligible for semantic bookmarking.
     *
     * @param sPath The path to test
     * @param oMetaModel The associated metadata model
     * @returns `true` if the path is eligible
     * @ui5-restricted
     */;
    _proto._checkPathForSemanticBookmarking = function _checkPathForSemanticBookmarking(sPath, oMetaModel) {
      // Only path on root objects allow semantic bookmarking, i.e. sPath = xxx(yyy)
      const aMatches = /^[\/]?(\w+)\([^\/]+\)$/.exec(sPath);
      if (!aMatches) {
        return false;
      }
      // Get the entitySet name
      const sEntitySetPath = `/${aMatches[1]}`;
      // Check the entity set supports draft (otherwise we don't support semantic bookmarking)
      const oDraftRoot = oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
      const oDraftNode = oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftNode`);
      return oDraftRoot || oDraftNode ? true : false;
    }

    /**
     * Builds a path with semantic keys from a path with technical keys.
     *
     * @param sPathToResolve The path to be transformed
     * @param oModel The OData model
     * @returns String promise for the new path. If sPathToResolved couldn't be interpreted as a semantic path, it is returned as is.
     * @ui5-restricted
     */;
    _proto._resolveSemanticPath = function _resolveSemanticPath(sPathToResolve, oModel) {
      const oMetaModel = oModel.getMetaModel();
      const oLastSemanticMapping = this._oRoutingService.getLastSemanticMapping();
      let sCurrentHashNoParams = this._oRouter.getHashChanger().getHash().split("?")[0];
      if (sCurrentHashNoParams && sCurrentHashNoParams.lastIndexOf("/") === sCurrentHashNoParams.length - 1) {
        // Remove trailing '/'
        sCurrentHashNoParams = sCurrentHashNoParams.substring(0, sCurrentHashNoParams.length - 1);
      }
      let sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
      if (sRootEntityName.indexOf("/") === 0) {
        sRootEntityName = sRootEntityName.substring(1);
      }
      const bAllowSemanticBookmark = this._checkPathForSemanticBookmarking(sCurrentHashNoParams, oMetaModel),
        aSemanticKeys = bAllowSemanticBookmark && SemanticKeyHelper.getSemanticKeys(oMetaModel, sRootEntityName);
      if (!aSemanticKeys) {
        // No semantic keys available --> use the path as is
        return Promise.resolve(sPathToResolve);
      } else if (oLastSemanticMapping && oLastSemanticMapping.semanticPath === sPathToResolve) {
        // This semantic path has been resolved previously
        return Promise.resolve(oLastSemanticMapping.technicalPath);
      } else {
        // We need resolve the semantic path to get the technical keys
        return this._getTechnicalPathFromSemanticPath(sCurrentHashNoParams, oModel, aSemanticKeys).then(sTechnicalPath => {
          if (sTechnicalPath && sTechnicalPath !== sPathToResolve) {
            // The semantic path was resolved (otherwise keep the original value for target)
            this._oRoutingService.setLastSemanticMapping({
              technicalPath: sTechnicalPath,
              semanticPath: sPathToResolve
            });
            return sTechnicalPath;
          } else {
            return sPathToResolve;
          }
        });
      }
    }

    /**
     * Sets the binding context of the page from a path.
     *
     * @param sTargetPath The path to build the context. Needs to contain technical keys only.
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @ui5-restricted
     */;
    _proto._bindPageToPath = function _bindPageToPath(sTargetPath, oModel, oNavigationParameters) {
      const oCurrentContext = this._getBindingContext(),
        sCurrentPath = oCurrentContext && oCurrentContext.getPath(),
        oUseContext = oNavigationParameters.useContext;

      // We set the binding context only if it's different from the current one
      // or if we have a context already selected
      if (oUseContext && oUseContext.getPath() === sTargetPath) {
        if (oUseContext !== oCurrentContext) {
          // We already have the context to be used, and it's not the current one
          const oRootViewController = this._oAppComponent.getRootViewController();

          // In case of FCL, if we're reusing a context from a table (through navigation), we refresh it to avoid outdated data
          // We don't wait for the refresh to be completed (requestRefresh), so that the corresponding query goes into the same
          // batch as the ones from controls in the page.
          if (oRootViewController.isFclEnabled() && oNavigationParameters.reason === NavigationReason.RowPress) {
            const metaModel = oUseContext.getModel().getMetaModel();
            if (!oUseContext.getBinding().hasPendingChanges()) {
              oUseContext.refresh();
            } else if (isConnected(this.getView()) || ModelHelper.isDraftSupported(metaModel, oUseContext.getPath()) && ModelHelper.isCollaborationDraftSupported(metaModel)) {
              // If there are pending changes but we're in collaboration draft, we force the refresh (discarding pending changes) as we need to have the latest version.
              // When navigating from LR to OP, the view is not connected yet --> check if we're in draft with collaboration from the metamodel
              oUseContext.getBinding().resetChanges();
              oUseContext.refresh();
            }
          }
          this._bindPageToContext(oUseContext, oModel, oNavigationParameters);
        }
      } else if (sCurrentPath !== sTargetPath) {
        // We need to create a new context for its path
        this._bindPageToContext(this._createContext(sTargetPath, oModel), oModel, oNavigationParameters);
      } else if (oNavigationParameters.reason !== NavigationReason.AppStateChanged && EditState.isEditStateDirty()) {
        this._refreshBindingContext(oCurrentContext);
      }
    }

    /**
     * Binds the page to a context.
     *
     * @param oContext Context to be bound
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @ui5-restricted
     */;
    _proto._bindPageToContext = function _bindPageToContext(oContext, oModel, oNavigationParameters) {
      if (!oContext) {
        this.onBeforeBinding(null);
        this.onAfterBinding(null);
        return;
      }
      const oParentListBinding = oContext.getBinding();
      const oRootViewController = this._oAppComponent.getRootViewController();
      if (oRootViewController.isFclEnabled()) {
        if (!oParentListBinding || !oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          // if the parentBinding is not a listBinding, we create a new context
          oContext = this._createContext(oContext.getPath(), oModel);
        }
        try {
          this._setKeepAlive(oContext, true, () => {
            if (oRootViewController.isContextUsedInPages(oContext)) {
              this.navigateBackFromContext(oContext);
            }
          }, true // Load messages, otherwise they don't get refreshed later, e.g. for side effects
          );
        } catch (oError) {
          // setKeepAlive throws an exception if the parent listbinding doesn't have $$ownRequest=true
          // This case for custom fragments is supported, but an error is logged to make the lack of synchronization apparent
          Log.error(`View for ${oContext.getPath()} won't be synchronized. Parent listBinding must have binding parameter $$ownRequest=true`);
        }
      } else if (!oParentListBinding || oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        // We need to recreate the context otherwise we get errors
        oContext = this._createContext(oContext.getPath(), oModel);
      }

      // Set the binding context with the proper before/after callbacks
      this.onBeforeBinding(oContext, {
        editable: oNavigationParameters.bTargetEditable,
        listBinding: oParentListBinding,
        bPersistOPScroll: oNavigationParameters.bPersistOPScroll,
        bDraftNavigation: oNavigationParameters.bDraftNavigation,
        showPlaceholder: oNavigationParameters.bShowPlaceholder
      });
      this._setBindingContext(oContext);
      this.onAfterBinding(oContext);
    }

    /**
     * Creates a context from a path.
     *
     * @param sPath The path
     * @param oModel The OData model
     * @returns The created context
     * @ui5-restricted
     */;
    _proto._createContext = function _createContext(sPath, oModel) {
      const oPageComponent = this._oPageComponent,
        sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet(),
        sContextPath = oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath() || sEntitySet && `/${sEntitySet}`,
        oMetaModel = oModel.getMetaModel(),
        mParameters = {
          $$groupId: "$auto.Heroes",
          $$updateGroupId: "$auto",
          $$patchWithoutSideEffects: true
        };
      // In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
      const oDraftRoot = oMetaModel.getObject(`${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
      const oDraftNode = oMetaModel.getObject(`${sContextPath}@com.sap.vocabularies.Common.v1.DraftNode`);
      const oRootViewController = this._oAppComponent.getRootViewController();
      if (oRootViewController.isFclEnabled()) {
        const oContext = this._getKeepAliveContext(oModel, sPath, false, mParameters);
        if (!oContext) {
          throw new Error(`Cannot create keepAlive context ${sPath}`);
        } else if (oDraftRoot || oDraftNode) {
          if (oContext.getProperty("IsActiveEntity") === undefined) {
            oContext.requestProperty(["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]);
            if (oDraftRoot) {
              oContext.requestObject("DraftAdministrativeData");
            }
          } else {
            // when switching between draft and edit we need to ensure those properties are requested again even if they are in the binding's cache
            // otherwise when you edit and go to the saved version you have no way of switching back to the edit version
            oContext.requestSideEffects(oDraftRoot ? ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity", "DraftAdministrativeData"] : ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]);
          }
        }
        return oContext;
      } else {
        if (sEntitySet) {
          const sMessagesPath = oMetaModel.getObject(`${sContextPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
          if (sMessagesPath) {
            mParameters.$select = sMessagesPath;
          }
        }

        // In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
        if (oDraftRoot || oDraftNode) {
          if (mParameters.$select === undefined) {
            mParameters.$select = "HasActiveEntity,HasDraftEntity,IsActiveEntity";
          } else {
            mParameters.$select += ",HasActiveEntity,HasDraftEntity,IsActiveEntity";
          }
        }
        if (this._oView.getBindingContext()) {
          var _this$_oView$getBindi2;
          const oPreviousBinding = (_this$_oView$getBindi2 = this._oView.getBindingContext()) === null || _this$_oView$getBindi2 === void 0 ? void 0 : _this$_oView$getBindi2.getBinding();
          oPreviousBinding === null || oPreviousBinding === void 0 ? void 0 : oPreviousBinding.resetChanges().then(() => {
            oPreviousBinding.destroy();
          }).catch(oError => {
            Log.error("Error while reseting the changes to the binding", oError);
          });
        }
        const oHiddenBinding = oModel.bindContext(sPath, undefined, mParameters);
        oHiddenBinding.attachEventOnce("dataRequested", () => {
          BusyLocker.lock(this._oView);
        });
        oHiddenBinding.attachEventOnce("dataReceived", this.onDataReceived.bind(this));
        return oHiddenBinding.getBoundContext();
      }
    };
    _proto.onDataReceived = async function onDataReceived(oEvent) {
      const sErrorDescription = oEvent && oEvent.getParameter("error");
      if (BusyLocker.isLocked(this._oView)) {
        BusyLocker.unlock(this._oView);
      }
      if (sErrorDescription) {
        // TODO: in case of 404 the text shall be different
        try {
          const oResourceBundle = await Core.getLibraryResourceBundle("sap.fe.core", true);
          const messageHandler = this.base.messageHandler;
          let mParams = {};
          if (sErrorDescription.status === 503) {
            mParams = {
              isInitialLoad503Error: true,
              shellBack: true
            };
          } else if (sErrorDescription.status === 400) {
            mParams = {
              title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
              description: oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR_DESCRIPTION"),
              isDataReceivedError: true,
              shellBack: true
            };
          } else {
            mParams = {
              title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
              description: sErrorDescription,
              isDataReceivedError: true,
              shellBack: true
            };
          }
          await messageHandler.showMessages(mParams);
        } catch (oError) {
          Log.error("Error while getting the core resource bundle", oError);
        }
      }
    }

    /**
     * Requests side effects on a binding context to "refresh" it.
     * TODO: get rid of this once provided by the model
     * a refresh on the binding context does not work in case a creation row with a transient context is
     * used. also a requestSideEffects with an empty path would fail due to the transient context
     * therefore we get all dependent bindings (via private model method) to determine all paths and then
     * request them.
     *
     * @param oBindingContext Context to be refreshed
     * @ui5-restricted
     */;
    _proto._refreshBindingContext = function _refreshBindingContext(oBindingContext) {
      const oPageComponent = this._oPageComponent;
      const oSideEffectsService = this._oAppComponent.getSideEffectsService();
      const sRootContextPath = oBindingContext.getPath();
      const sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet();
      const sContextPath = oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath() || sEntitySet && `/${sEntitySet}`;
      const oMetaModel = this._oView.getModel().getMetaModel();
      let sMessagesPath;
      const aNavigationPropertyPaths = [];
      const aPropertyPaths = [];
      const oSideEffects = {
        TargetProperties: [],
        TargetEntities: []
      };
      function getBindingPaths(oBinding) {
        let aDependentBindings;
        const sRelativePath = (oBinding.getContext() && oBinding.getContext().getPath() || "").replace(sRootContextPath, ""); // If no context, this is an absolute binding so no relative path
        const sPath = (sRelativePath ? `${sRelativePath.slice(1)}/` : sRelativePath) + oBinding.getPath();
        if (oBinding.isA("sap.ui.model.odata.v4.ODataContextBinding")) {
          // if (sPath === "") {
          // now get the dependent bindings
          aDependentBindings = oBinding.getDependentBindings();
          if (aDependentBindings) {
            // ask the dependent bindings (and only those with the specified groupId
            //if (aDependentBindings.length > 0) {
            for (let i = 0; i < aDependentBindings.length; i++) {
              getBindingPaths(aDependentBindings[i]);
            }
          } else if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
            aNavigationPropertyPaths.push(sPath);
          }
        } else if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
            aNavigationPropertyPaths.push(sPath);
          }
        } else if (oBinding.isA("sap.ui.model.odata.v4.ODataPropertyBinding")) {
          if (aPropertyPaths.indexOf(sPath) === -1) {
            aPropertyPaths.push(sPath);
          }
        }
      }
      if (sContextPath) {
        sMessagesPath = oMetaModel.getObject(`${sContextPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
      }

      // binding of the context must have $$PatchWithoutSideEffects true, this bound context may be needed to be fetched from the dependent binding
      getBindingPaths(oBindingContext.getBinding());
      let i;
      for (i = 0; i < aNavigationPropertyPaths.length; i++) {
        oSideEffects.TargetEntities.push({
          $NavigationPropertyPath: aNavigationPropertyPaths[i]
        });
      }
      oSideEffects.TargetProperties = aPropertyPaths;
      if (sMessagesPath) {
        oSideEffects.TargetProperties.push(sMessagesPath);
      }
      //all this logic to be replaced with a SideEffects request for an empty path (refresh everything), after testing transient contexts
      oSideEffects.TargetProperties = oSideEffects.TargetProperties.map(sTargetProperty => {
        if (sTargetProperty) {
          const index = sTargetProperty.indexOf("/");
          if (index > 0) {
            // only request the navigation path and not the property paths further
            return sTargetProperty.slice(0, index);
          }
          return sTargetProperty;
        }
      });
      // OData model will take care of duplicates
      oSideEffectsService.requestSideEffects(oSideEffects.TargetEntities.concat(oSideEffects.TargetProperties), oBindingContext);
    }

    /**
     * Gets the binding context of the page or the component.
     *
     * @returns The binding context
     * @ui5-restricted
     */;
    _proto._getBindingContext = function _getBindingContext() {
      if (this._oPageComponent) {
        return this._oPageComponent.getBindingContext();
      } else {
        return this._oView.getBindingContext();
      }
    }

    /**
     * Sets the binding context of the page or the component.
     *
     * @param oContext The binding context
     * @ui5-restricted
     */;
    _proto._setBindingContext = function _setBindingContext(oContext) {
      var _oPreviousContext;
      let oPreviousContext, oTargetControl;
      if (this._oPageComponent) {
        oPreviousContext = this._oPageComponent.getBindingContext();
        oTargetControl = this._oPageComponent;
      } else {
        oPreviousContext = this._oView.getBindingContext();
        oTargetControl = this._oView;
      }
      oTargetControl.setBindingContext(oContext);
      if ((_oPreviousContext = oPreviousContext) !== null && _oPreviousContext !== void 0 && _oPreviousContext.isKeepAlive() && oPreviousContext !== oContext) {
        this._setKeepAlive(oPreviousContext, false);
      }
    }

    /**
     * Gets the flexible column layout (FCL) level corresponding to the view (-1 if the app is not FCL).
     *
     * @returns The level
     * @ui5-restricted
     */;
    _proto._getFCLLevel = function _getFCLLevel() {
      return this._oTargetInformation.FCLLevel;
    };
    _proto._setKeepAlive = function _setKeepAlive(oContext, bKeepAlive, fnBeforeDestroy, bRequestMessages) {
      if (oContext.getPath().endsWith(")")) {
        // We keep the context alive only if they're part of a collection, i.e. if the path ends with a ')'
        const oMetaModel = oContext.getModel().getMetaModel();
        const sMetaPath = oMetaModel.getMetaPath(oContext.getPath());
        const sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
        oContext.setKeepAlive(bKeepAlive, fnBeforeDestroy, !!sMessagesPath && bRequestMessages);
      }
    };
    _proto._getKeepAliveContext = function _getKeepAliveContext(oModel, path, bRequestMessages, parameters) {
      // Get the path for the context that is really kept alive (part of a collection)
      // i.e. remove all segments not ending with a ')'
      const keptAliveSegments = path.split("/");
      const additionnalSegments = [];
      while (keptAliveSegments.length && !keptAliveSegments[keptAliveSegments.length - 1].endsWith(")")) {
        additionnalSegments.push(keptAliveSegments.pop());
      }
      if (keptAliveSegments.length === 0) {
        return undefined;
      }
      const keptAlivePath = keptAliveSegments.join("/");
      const oKeepAliveContext = oModel.getKeepAliveContext(keptAlivePath, bRequestMessages, parameters);
      if (additionnalSegments.length === 0) {
        return oKeepAliveContext;
      } else {
        additionnalSegments.reverse();
        const additionnalPath = additionnalSegments.join("/");
        return oModel.bindContext(additionnalPath, oKeepAliveContext).getBoundContext();
      }
    }

    /**
     * Switches between column and full-screen mode when FCL is used.
     *
     * @ui5-restricted
     */;
    _proto.switchFullScreen = function switchFullScreen() {
      const oSource = this.base.getView();
      const oFCLHelperModel = oSource.getModel("fclhelper"),
        bIsFullScreen = oFCLHelperModel.getProperty("/actionButtonsInfo/isFullScreen"),
        sNextLayout = oFCLHelperModel.getProperty(bIsFullScreen ? "/actionButtonsInfo/exitFullScreen" : "/actionButtonsInfo/fullScreen"),
        oRootViewController = this._oAppComponent.getRootViewController();
      const oContext = oRootViewController.getRightmostContext ? oRootViewController.getRightmostContext() : oSource.getBindingContext();
      this.base._routing.navigateToContext(oContext, {
        sLayout: sNextLayout
      }).catch(function () {
        Log.warning("cannot switch between column and fullscreen");
      });
    }

    /**
     * Closes the column for the current view in a FCL.
     *
     * @ui5-restricted
     */;
    _proto.closeColumn = function closeColumn() {
      const oViewData = this._oView.getViewData();
      const oContext = this._oView.getBindingContext();
      const oMetaModel = oContext.getModel().getMetaModel();
      const navigationParameters = {
        noPreservationCache: true,
        sLayout: this._oView.getModel("fclhelper").getProperty("/actionButtonsInfo/closeColumn")
      };
      if ((oViewData === null || oViewData === void 0 ? void 0 : oViewData.viewLevel) === 1 && ModelHelper.isDraftSupported(oMetaModel, oContext.getPath())) {
        draft.processDataLossOrDraftDiscardConfirmation(() => {
          this.navigateBackFromContext(oContext, navigationParameters);
        }, Function.prototype, oContext, this._oView.getController(), false, draft.NavigationType.BackNavigation);
      } else {
        this.navigateBackFromContext(oContext, navigationParameters);
      }
    };
    return InternalRouting;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatched", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatched"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatchedFinished", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatchedFinished"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeBinding", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterBinding", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToTarget", [_dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToTarget"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToRoute", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToRoute"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToContext", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateBackFromContext", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateBackFromContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateForwardToContext", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateForwardToContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateBackFromTransientState", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateBackFromTransientState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToMessagePage", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToMessagePage"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isCurrentStateImpactedBy", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "isCurrentStateImpactedBy"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onDataReceived", [_dec26], Object.getOwnPropertyDescriptor(_class2.prototype, "onDataReceived"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "switchFullScreen", [_dec27, _dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "switchFullScreen"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "closeColumn", [_dec29, _dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "closeColumn"), _class2.prototype)), _class2)) || _class);
  return InternalRouting;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcm5hbFJvdXRpbmciLCJkZWZpbmVVSTVDbGFzcyIsIm1ldGhvZE92ZXJyaWRlIiwicHVibGljRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJmaW5hbEV4dGVuc2lvbiIsIkJlZm9yZSIsIm9uRXhpdCIsIl9vUm91dGluZ1NlcnZpY2UiLCJkZXRhY2hSb3V0ZU1hdGNoZWQiLCJfZm5Sb3V0ZU1hdGNoZWRCb3VuZCIsIm9uSW5pdCIsIl9vVmlldyIsImJhc2UiLCJnZXRWaWV3IiwiX29BcHBDb21wb25lbnQiLCJDb21tb25VdGlscyIsImdldEFwcENvbXBvbmVudCIsIl9vUGFnZUNvbXBvbmVudCIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiX29Sb3V0ZXIiLCJnZXRSb3V0ZXIiLCJfb1JvdXRlclByb3h5IiwiZ2V0Um91dGVyUHJveHkiLCJFcnJvciIsImdldFNlcnZpY2UiLCJ0aGVuIiwib1JvdXRpbmdTZXJ2aWNlIiwiX29uUm91dGVNYXRjaGVkIiwiYmluZCIsImF0dGFjaFJvdXRlTWF0Y2hlZCIsIl9vVGFyZ2V0SW5mb3JtYXRpb24iLCJnZXRUYXJnZXRJbmZvcm1hdGlvbkZvciIsImNhdGNoIiwib25Sb3V0ZU1hdGNoZWQiLCJvblJvdXRlTWF0Y2hlZEZpbmlzaGVkIiwib25CZWZvcmVCaW5kaW5nIiwib0JpbmRpbmdDb250ZXh0IiwibVBhcmFtZXRlcnMiLCJvUm91dGluZyIsImdldENvbnRyb2xsZXIiLCJyb3V0aW5nIiwib25BZnRlckJpbmRpbmciLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJvbkNvbnRleHRCb3VuZFRvVmlldyIsIm5hdmlnYXRlVG9UYXJnZXQiLCJvQ29udGV4dCIsInNOYXZpZ2F0aW9uVGFyZ2V0TmFtZSIsImJQcmVzZXJ2ZUhpc3RvcnkiLCJvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24iLCJnZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiIsIm9EZXRhaWxSb3V0ZSIsImRldGFpbCIsInNSb3V0ZU5hbWUiLCJyb3V0ZSIsIm1QYXJhbWV0ZXJNYXBwaW5nIiwicGFyYW1ldGVycyIsIm5hdmlnYXRlVG8iLCJnZXRWaWV3RGF0YSIsIm5hdmlnYXRlVG9Sb3V0ZSIsInNUYXJnZXRSb3V0ZU5hbWUiLCJvUGFyYW1ldGVycyIsIm5hdmlnYXRlVG9Db250ZXh0Iiwib0NvbnRleHRJbmZvIiwiaXNBIiwiYXN5bmNDb250ZXh0IiwiYWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uIiwiY2hlY2tOb0hhc2hDaGFuZ2UiLCJlZGl0YWJsZSIsImJQZXJzaXN0T1BTY3JvbGwiLCJ1cGRhdGVGQ0xMZXZlbCIsImJGb3JjZUZvY3VzIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJiRGVmZXJyZWRDb250ZXh0IiwiY2FsbEV4dGVuc2lvbiIsIm9JbnRlcm5hbE1vZGVsIiwiZ2V0TW9kZWwiLCJzZXRQcm9wZXJ0eSIsInNvdXJjZUJpbmRpbmdDb250ZXh0IiwiZ2V0T2JqZWN0IiwiYmluZGluZ0NvbnRleHQiLCJvRXZlbnQiLCJiT3ZlcnJpZGVOYXYiLCJvbkJlZm9yZU5hdmlnYXRpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsIkZDTExldmVsIiwiX2dldEZDTExldmVsIiwibmF2aWdhdGVCYWNrRnJvbUNvbnRleHQiLCJuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldFByb3BlcnR5IiwibmF2aWdhdGVCYWNrRnJvbVRyYW5zaWVudFN0YXRlIiwic0hhc2giLCJnZXRIYXNoIiwiaW5kZXhPZiIsIm5hdkJhY2siLCJuYXZpZ2F0ZVRvTWVzc2FnZVBhZ2UiLCJzRXJyb3JNZXNzYWdlIiwibmF2VG9IYXNoIiwiZ2V0RGVmYXVsdENyZWF0ZUhhc2giLCJkaXNwbGF5RXJyb3JQYWdlIiwiaXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5IiwiX2lzVmlld1BhcnRPZlJvdXRlIiwicm91dGVJbmZvcm1hdGlvbiIsImFUYXJnZXRzIiwidGFyZ2V0cyIsInRhcmdldE5hbWUiLCJ2aWV3TGV2ZWwiLCJyb3V0ZUxldmVsIiwiX3NldEJpbmRpbmdDb250ZXh0IiwiX2J1aWxkQmluZGluZ1BhdGgiLCJyb3V0ZUFyZ3VtZW50cyIsImJpbmRpbmdQYXR0ZXJuIiwibmF2aWdhdGlvblBhcmFtZXRlcnMiLCJwYXRoIiwicmVwbGFjZSIsImRlZmVycmVkIiwic0tleSIsInNWYWx1ZSIsImJUYXJnZXRFZGl0YWJsZSIsImhhc093blByb3BlcnR5IiwiYkFjdGlvbkNyZWF0ZSIsImdldFBhcmFtZXRlciIsImdldEJpbmRpbmdDb250ZXh0UGF0dGVybiIsImNvbnRleHRQYXR0ZXJuIiwidW5kZWZpbmVkIiwibUFyZ3VtZW50cyIsImdldFBhcmFtZXRlcnMiLCJhcmd1bWVudHMiLCJvTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJvTW9kZWwiLCJvT3V0IiwiX2JpbmREZWZlcnJlZCIsIl9iaW5kUGFnZSIsImZpbmFsbHkiLCJ1cGRhdGVVSVN0YXRlRm9yVmlldyIsInNUYXJnZXRQYXRoIiwib0FzeW5jQ29udGV4dCIsImNyZWF0ZURlZmVycmVkQ29udGV4dCIsInVzZUNvbnRleHQiLCJjdXJyZW50QmluZGluZ0NvbnRleHQiLCJfZ2V0QmluZGluZ0NvbnRleHQiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImdldEJpbmRpbmciLCJyZXNldENoYW5nZXMiLCJfYmluZFBhZ2VUb0NvbnRleHQiLCJfcmVzb2x2ZVNlbWFudGljUGF0aCIsInNUZWNobmljYWxQYXRoIiwiX2JpbmRQYWdlVG9QYXRoIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImdldFRleHQiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsIl9jcmVhdGVGaWx0ZXJGcm9tU2VtYW50aWNQYXRoIiwic1NlbWFudGljUGF0aCIsImFTZW1hbnRpY0tleXMiLCJvTWV0YU1vZGVsIiwiZm5VbnF1b3RlQW5kRGVjb2RlIiwibGFzdEluZGV4T2YiLCJsZW5ndGgiLCJkZWNvZGVVUklDb21wb25lbnQiLCJzdWJzdHJpbmciLCJhS2V5VmFsdWVzIiwic3BsaXQiLCJhRmlsdGVycyIsImJGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIiwiTW9kZWxIZWxwZXIiLCJpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUiLCJzS2V5VmFsdWUiLCJGaWx0ZXIiLCIkUHJvcGVydHlQYXRoIiwib3BlcmF0b3IiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwidmFsdWUxIiwiY2FzZVNlbnNpdGl2ZSIsIm1LZXlWYWx1ZXMiLCJmb3JFYWNoIiwic0tleUFzc2lnbm1lbnQiLCJhUGFydHMiLCJiRmFpbGVkIiwibWFwIiwib1NlbWFudGljS2V5Iiwib0RyYWZ0RmlsdGVyIiwiZmlsdGVycyIsImFuZCIsInB1c2giLCJfZ2V0VGVjaG5pY2FsUGF0aEZyb21TZW1hbnRpY1BhdGgiLCJnZXRNZXRhTW9kZWwiLCJzRW50aXR5U2V0UGF0aCIsImdldE1ldGFDb250ZXh0IiwiZ2V0UGF0aCIsIm9GaWx0ZXIiLCJzdGFydHNXaXRoIiwib0xpc3RCaW5kaW5nIiwiYmluZExpc3QiLCIkJGdyb3VwSWQiLCJyZXF1ZXN0Q29udGV4dHMiLCJvQ29udGV4dHMiLCJfY2hlY2tQYXRoRm9yU2VtYW50aWNCb29rbWFya2luZyIsInNQYXRoIiwiYU1hdGNoZXMiLCJleGVjIiwib0RyYWZ0Um9vdCIsIm9EcmFmdE5vZGUiLCJzUGF0aFRvUmVzb2x2ZSIsIm9MYXN0U2VtYW50aWNNYXBwaW5nIiwiZ2V0TGFzdFNlbWFudGljTWFwcGluZyIsInNDdXJyZW50SGFzaE5vUGFyYW1zIiwiZ2V0SGFzaENoYW5nZXIiLCJzUm9vdEVudGl0eU5hbWUiLCJzdWJzdHIiLCJiQWxsb3dTZW1hbnRpY0Jvb2ttYXJrIiwiU2VtYW50aWNLZXlIZWxwZXIiLCJnZXRTZW1hbnRpY0tleXMiLCJzZW1hbnRpY1BhdGgiLCJ0ZWNobmljYWxQYXRoIiwic2V0TGFzdFNlbWFudGljTWFwcGluZyIsIm9DdXJyZW50Q29udGV4dCIsInNDdXJyZW50UGF0aCIsIm9Vc2VDb250ZXh0Iiwib1Jvb3RWaWV3Q29udHJvbGxlciIsImlzRmNsRW5hYmxlZCIsInJlYXNvbiIsIk5hdmlnYXRpb25SZWFzb24iLCJSb3dQcmVzcyIsIm1ldGFNb2RlbCIsInJlZnJlc2giLCJpc0Nvbm5lY3RlZCIsImlzRHJhZnRTdXBwb3J0ZWQiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsIl9jcmVhdGVDb250ZXh0IiwiQXBwU3RhdGVDaGFuZ2VkIiwiRWRpdFN0YXRlIiwiaXNFZGl0U3RhdGVEaXJ0eSIsIl9yZWZyZXNoQmluZGluZ0NvbnRleHQiLCJvUGFyZW50TGlzdEJpbmRpbmciLCJfc2V0S2VlcEFsaXZlIiwiaXNDb250ZXh0VXNlZEluUGFnZXMiLCJsaXN0QmluZGluZyIsImJEcmFmdE5hdmlnYXRpb24iLCJzaG93UGxhY2Vob2xkZXIiLCJiU2hvd1BsYWNlaG9sZGVyIiwib1BhZ2VDb21wb25lbnQiLCJzRW50aXR5U2V0IiwiZ2V0RW50aXR5U2V0Iiwic0NvbnRleHRQYXRoIiwiZ2V0Q29udGV4dFBhdGgiLCIkJHVwZGF0ZUdyb3VwSWQiLCIkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzIiwiX2dldEtlZXBBbGl2ZUNvbnRleHQiLCJyZXF1ZXN0UHJvcGVydHkiLCJyZXF1ZXN0T2JqZWN0IiwicmVxdWVzdFNpZGVFZmZlY3RzIiwic01lc3NhZ2VzUGF0aCIsIiRzZWxlY3QiLCJvUHJldmlvdXNCaW5kaW5nIiwiZGVzdHJveSIsIm9IaWRkZW5CaW5kaW5nIiwiYmluZENvbnRleHQiLCJhdHRhY2hFdmVudE9uY2UiLCJCdXN5TG9ja2VyIiwibG9jayIsIm9uRGF0YVJlY2VpdmVkIiwiZ2V0Qm91bmRDb250ZXh0Iiwic0Vycm9yRGVzY3JpcHRpb24iLCJpc0xvY2tlZCIsInVubG9jayIsIm1lc3NhZ2VIYW5kbGVyIiwibVBhcmFtcyIsInN0YXR1cyIsImlzSW5pdGlhbExvYWQ1MDNFcnJvciIsInNoZWxsQmFjayIsImlzRGF0YVJlY2VpdmVkRXJyb3IiLCJzaG93TWVzc2FnZXMiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwic1Jvb3RDb250ZXh0UGF0aCIsImFOYXZpZ2F0aW9uUHJvcGVydHlQYXRocyIsImFQcm9wZXJ0eVBhdGhzIiwib1NpZGVFZmZlY3RzIiwiVGFyZ2V0UHJvcGVydGllcyIsIlRhcmdldEVudGl0aWVzIiwiZ2V0QmluZGluZ1BhdGhzIiwib0JpbmRpbmciLCJhRGVwZW5kZW50QmluZGluZ3MiLCJzUmVsYXRpdmVQYXRoIiwiZ2V0Q29udGV4dCIsInNsaWNlIiwiZ2V0RGVwZW5kZW50QmluZGluZ3MiLCJpIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJzVGFyZ2V0UHJvcGVydHkiLCJpbmRleCIsImNvbmNhdCIsIm9QcmV2aW91c0NvbnRleHQiLCJvVGFyZ2V0Q29udHJvbCIsInNldEJpbmRpbmdDb250ZXh0IiwiaXNLZWVwQWxpdmUiLCJiS2VlcEFsaXZlIiwiZm5CZWZvcmVEZXN0cm95IiwiYlJlcXVlc3RNZXNzYWdlcyIsImVuZHNXaXRoIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJzZXRLZWVwQWxpdmUiLCJrZXB0QWxpdmVTZWdtZW50cyIsImFkZGl0aW9ubmFsU2VnbWVudHMiLCJwb3AiLCJrZXB0QWxpdmVQYXRoIiwiam9pbiIsIm9LZWVwQWxpdmVDb250ZXh0IiwiZ2V0S2VlcEFsaXZlQ29udGV4dCIsInJldmVyc2UiLCJhZGRpdGlvbm5hbFBhdGgiLCJzd2l0Y2hGdWxsU2NyZWVuIiwib1NvdXJjZSIsIm9GQ0xIZWxwZXJNb2RlbCIsImJJc0Z1bGxTY3JlZW4iLCJzTmV4dExheW91dCIsImdldFJpZ2h0bW9zdENvbnRleHQiLCJfcm91dGluZyIsInNMYXlvdXQiLCJ3YXJuaW5nIiwiY2xvc2VDb2x1bW4iLCJvVmlld0RhdGEiLCJub1ByZXNlcnZhdGlvbkNhY2hlIiwiZHJhZnQiLCJwcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbiIsIkZ1bmN0aW9uIiwicHJvdG90eXBlIiwiTmF2aWdhdGlvblR5cGUiLCJCYWNrTmF2aWdhdGlvbiIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkludGVybmFsUm91dGluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQnVzeUxvY2tlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvQnVzeUxvY2tlclwiO1xuaW1wb3J0IHsgaXNDb25uZWN0ZWQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9BY3Rpdml0eVN5bmNcIjtcbmltcG9ydCBkcmFmdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCBOYXZpZ2F0aW9uUmVhc29uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9yb3V0aW5nL05hdmlnYXRpb25SZWFzb25cIjtcbmltcG9ydCB0eXBlIFJvdXRlclByb3h5IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9yb3V0aW5nL1JvdXRlclByb3h5XCI7XG5pbXBvcnQgdHlwZSB7IEVuaGFuY2VXaXRoVUk1IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXh0ZW5zaWJsZSwgZmluYWxFeHRlbnNpb24sIG1ldGhvZE92ZXJyaWRlLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBFZGl0U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRWRpdFN0YXRlXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBTZW1hbnRpY0tleUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TZW1hbnRpY0tleUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSB7IFJvdXRpbmdTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1JvdXRpbmdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgVGVtcGxhdGVDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgdHlwZSBSb3V0ZXIgZnJvbSBcInNhcC91aS9jb3JlL3JvdXRpbmcvUm91dGVyXCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgRmlsdGVyT3BlcmF0b3IgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJPcGVyYXRvclwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcblxuLyoqXG4gKiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLkNvbnRyb2xsZXJFeHRlbnNpb24gQ29udHJvbGxlciBleHRlbnNpb259XG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsUm91dGluZ1xuICogQHByaXZhdGVcbiAqIEBzaW5jZSAxLjc0LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuSW50ZXJuYWxSb3V0aW5nXCIpXG5jbGFzcyBJbnRlcm5hbFJvdXRpbmcgZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJpdmF0ZSBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdHByaXZhdGUgX29WaWV3ITogVmlldztcblx0cHJpdmF0ZSBfb0FwcENvbXBvbmVudCE6IEFwcENvbXBvbmVudDtcblx0cHJpdmF0ZSBfb1BhZ2VDb21wb25lbnQhOiBFbmhhbmNlV2l0aFVJNTxUZW1wbGF0ZUNvbXBvbmVudD4gfCBudWxsO1xuXHRwcml2YXRlIF9vUm91dGVyITogUm91dGVyO1xuXHRwcml2YXRlIF9vUm91dGluZ1NlcnZpY2UhOiBSb3V0aW5nU2VydmljZTtcblx0cHJpdmF0ZSBfb1JvdXRlclByb3h5ITogUm91dGVyUHJveHk7XG5cdHByaXZhdGUgX2ZuUm91dGVNYXRjaGVkQm91bmQhOiBGdW5jdGlvbjtcblx0cHJvdGVjdGVkIF9vVGFyZ2V0SW5mb3JtYXRpb246IGFueTtcblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRvbkV4aXQoKSB7XG5cdFx0aWYgKHRoaXMuX29Sb3V0aW5nU2VydmljZSkge1xuXHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlLmRldGFjaFJvdXRlTWF0Y2hlZCh0aGlzLl9mblJvdXRlTWF0Y2hlZEJvdW5kKTtcblx0XHR9XG5cdH1cblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRvbkluaXQoKSB7XG5cdFx0dGhpcy5fb1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHRcdHRoaXMuX29BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5fb1ZpZXcpO1xuXHRcdHRoaXMuX29QYWdlQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRoaXMuX29WaWV3KSBhcyBFbmhhbmNlV2l0aFVJNTxUZW1wbGF0ZUNvbXBvbmVudD47XG5cdFx0dGhpcy5fb1JvdXRlciA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0Um91dGVyKCk7XG5cdFx0dGhpcy5fb1JvdXRlclByb3h5ID0gKHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb3V0ZXJQcm94eSgpO1xuXG5cdFx0aWYgKCF0aGlzLl9vQXBwQ29tcG9uZW50IHx8ICF0aGlzLl9vUGFnZUNvbXBvbmVudCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGluaXRpYWxpemUgY29udHJvbGVyIGV4dGVuc2lvbiAnc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVzaW9ucy5JbnRlcm5hbFJvdXRpbmdcIik7XG5cdFx0fVxuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRpZiAodGhpcy5fb0FwcENvbXBvbmVudCA9PT0gdGhpcy5fb1BhZ2VDb21wb25lbnQpIHtcblx0XHRcdC8vIFRoZSB2aWV3IGlzbid0IGhvc3RlZCBpbiBhIGRlZGljYXRlZCBVSUNvbXBvbmVudCwgYnV0IGRpcmVjdGx5IGluIHRoZSBhcHBcblx0XHRcdC8vIC0tPiBqdXN0IGtlZXAgdGhlIHZpZXdcblx0XHRcdHRoaXMuX29QYWdlQ29tcG9uZW50ID0gbnVsbDtcblx0XHR9XG5cblx0XHR0aGlzLl9vQXBwQ29tcG9uZW50XG5cdFx0XHQuZ2V0U2VydmljZShcInJvdXRpbmdTZXJ2aWNlXCIpXG5cdFx0XHQudGhlbigob1JvdXRpbmdTZXJ2aWNlOiBSb3V0aW5nU2VydmljZSkgPT4ge1xuXHRcdFx0XHR0aGlzLl9vUm91dGluZ1NlcnZpY2UgPSBvUm91dGluZ1NlcnZpY2U7XG5cdFx0XHRcdHRoaXMuX2ZuUm91dGVNYXRjaGVkQm91bmQgPSB0aGlzLl9vblJvdXRlTWF0Y2hlZC5iaW5kKHRoaXMpO1xuXHRcdFx0XHR0aGlzLl9vUm91dGluZ1NlcnZpY2UuYXR0YWNoUm91dGVNYXRjaGVkKHRoaXMuX2ZuUm91dGVNYXRjaGVkQm91bmQpO1xuXHRcdFx0XHR0aGlzLl9vVGFyZ2V0SW5mb3JtYXRpb24gPSBvUm91dGluZ1NlcnZpY2UuZ2V0VGFyZ2V0SW5mb3JtYXRpb25Gb3IodGhpcy5fb1BhZ2VDb21wb25lbnQgfHwgdGhpcy5fb1ZpZXcpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlRoaXMgY29udHJvbGxlciBleHRlbnNpb24gY2Fubm90IHdvcmsgd2l0aG91dCBhICdyb3V0aW5nU2VydmljZScgb24gdGhlIG1haW4gQXBwQ29tcG9uZW50XCIpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcmVkIGV2ZXJ5IHRpbWUgdGhpcyBjb250cm9sbGVyIGlzIGEgbmF2aWdhdGlvbiB0YXJnZXQuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUm91dGVNYXRjaGVkKCkge1xuXHRcdC8qKi9cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25Sb3V0ZU1hdGNoZWRGaW5pc2hlZCgpIHtcblx0XHQvKiovXG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQmVmb3JlQmluZGluZyhvQmluZGluZ0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM/OiBhbnkpIHtcblx0XHRjb25zdCBvUm91dGluZyA9ICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLnJvdXRpbmc7XG5cdFx0aWYgKG9Sb3V0aW5nICYmIG9Sb3V0aW5nLm9uQmVmb3JlQmluZGluZykge1xuXHRcdFx0b1JvdXRpbmcub25CZWZvcmVCaW5kaW5nKG9CaW5kaW5nQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25BZnRlckJpbmRpbmcob0JpbmRpbmdDb250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzPzogYW55KSB7XG5cdFx0KHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS5vbkNvbnRleHRCb3VuZFRvVmlldyhvQmluZGluZ0NvbnRleHQpO1xuXHRcdGNvbnN0IG9Sb3V0aW5nID0gKHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkucm91dGluZztcblx0XHRpZiAob1JvdXRpbmcgJiYgb1JvdXRpbmcub25BZnRlckJpbmRpbmcpIHtcblx0XHRcdG9Sb3V0aW5nLm9uQWZ0ZXJCaW5kaW5nKG9CaW5kaW5nQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIE1ldGhvZHMgdHJpZ2dlcmluZyBhIG5hdmlnYXRpb24gYWZ0ZXIgYSB1c2VyIGFjdGlvblxuXHQvLyAoZS5nLiBjbGljayBvbiBhIHRhYmxlIHJvdywgYnV0dG9uLCBldGMuLi4pXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byB0aGUgc3BlY2lmaWVkIG5hdmlnYXRpb24gdGFyZ2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gc05hdmlnYXRpb25UYXJnZXROYW1lIE5hbWUgb2YgdGhlIG5hdmlnYXRpb24gdGFyZ2V0XG5cdCAqIEBwYXJhbSBiUHJlc2VydmVIaXN0b3J5IFRydWUgdG8gZm9yY2UgdGhlIG5ldyBVUkwgdG8gYmUgYWRkZWQgYXQgdGhlIGVuZCBvZiB0aGUgYnJvd3NlciBoaXN0b3J5IChubyByZXBsYWNlKVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZVRvVGFyZ2V0KG9Db250ZXh0OiBhbnksIHNOYXZpZ2F0aW9uVGFyZ2V0TmFtZTogc3RyaW5nLCBiUHJlc2VydmVIaXN0b3J5PzogYm9vbGVhbikge1xuXHRcdGNvbnN0IG9OYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiA9XG5cdFx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudCAmJlxuXHRcdFx0dGhpcy5fb1BhZ2VDb21wb25lbnQuZ2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24gJiZcblx0XHRcdHRoaXMuX29QYWdlQ29tcG9uZW50LmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKHNOYXZpZ2F0aW9uVGFyZ2V0TmFtZSk7XG5cdFx0aWYgKG9OYXZpZ2F0aW9uQ29uZmlndXJhdGlvbikge1xuXHRcdFx0Y29uc3Qgb0RldGFpbFJvdXRlID0gb05hdmlnYXRpb25Db25maWd1cmF0aW9uLmRldGFpbDtcblx0XHRcdGNvbnN0IHNSb3V0ZU5hbWUgPSBvRGV0YWlsUm91dGUucm91dGU7XG5cdFx0XHRjb25zdCBtUGFyYW1ldGVyTWFwcGluZyA9IG9EZXRhaWxSb3V0ZS5wYXJhbWV0ZXJzO1xuXHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlLm5hdmlnYXRlVG8ob0NvbnRleHQsIHNSb3V0ZU5hbWUsIG1QYXJhbWV0ZXJNYXBwaW5nLCBiUHJlc2VydmVIaXN0b3J5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlLm5hdmlnYXRlVG8ob0NvbnRleHQsIG51bGwsIG51bGwsIGJQcmVzZXJ2ZUhpc3RvcnkpO1xuXHRcdH1cblx0XHR0aGlzLl9vVmlldy5nZXRWaWV3RGF0YSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byB0aGUgc3BlY2lmaWVkIG5hdmlnYXRpb24gdGFyZ2V0IHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1RhcmdldFJvdXRlTmFtZSBOYW1lIG9mIHRoZSB0YXJnZXQgcm91dGVcblx0ICogQHBhcmFtIFtvUGFyYW1ldGVyc10gUGFyYW1ldGVycyB0byBiZSB1c2VkIHdpdGggcm91dGUgdG8gY3JlYXRlIHRoZSB0YXJnZXQgaGFzaFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVUb1JvdXRlKHNUYXJnZXRSb3V0ZU5hbWU6IHN0cmluZywgb1BhcmFtZXRlcnM/OiBvYmplY3QpIHtcblx0XHRyZXR1cm4gdGhpcy5fb1JvdXRpbmdTZXJ2aWNlLm5hdmlnYXRlVG9Sb3V0ZShzVGFyZ2V0Um91dGVOYW1lLCBvUGFyYW1ldGVycyk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIHRvIGEgc3BlY2lmaWMgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBPcHRpb25hbCBuYXZpZ2F0aW9uIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlZCB3aGVuIHRoZSBuYXZpZ2F0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZVRvQ29udGV4dChvQ29udGV4dDogYW55LCBtUGFyYW1ldGVycz86IGFueSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IG9Db250ZXh0SW5mbzogYW55ID0ge307XG5cdFx0bVBhcmFtZXRlcnMgPSBtUGFyYW1ldGVycyB8fCB7fTtcblxuXHRcdGlmIChvQ29udGV4dC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmFzeW5jQ29udGV4dCkge1xuXHRcdFx0XHQvLyB0aGUgY29udGV4dCBpcyBlaXRoZXIgY3JlYXRlZCBhc3luYyAoUHJvbWlzZSlcblx0XHRcdFx0Ly8gV2UgbmVlZCB0byBhY3RpdmF0ZSB0aGUgcm91dGVNYXRjaFN5bmNocm8gb24gdGhlIFJvdXRlclByb3h5IHRvIGF2b2lkIHRoYXRcblx0XHRcdFx0Ly8gdGhlIHN1YnNlcXVlbnQgY2FsbCB0byBuYXZpZ2F0ZVRvQ29udGV4dCBjb25mbGljdHMgd2l0aCB0aGUgY3VycmVudCBvbmVcblx0XHRcdFx0dGhpcy5fb1JvdXRlclByb3h5LmFjdGl2YXRlUm91dGVNYXRjaFN5bmNocm9uaXphdGlvbigpO1xuXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmFzeW5jQ29udGV4dFxuXHRcdFx0XHRcdC50aGVuKChhc3luY0NvbnRleHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gb25jZSB0aGUgY29udGV4dCBpcyByZXR1cm5lZCB3ZSBuYXZpZ2F0ZSBpbnRvIGl0XG5cdFx0XHRcdFx0XHR0aGlzLm5hdmlnYXRlVG9Db250ZXh0KGFzeW5jQ29udGV4dCwge1xuXHRcdFx0XHRcdFx0XHRjaGVja05vSGFzaENoYW5nZTogbVBhcmFtZXRlcnMuY2hlY2tOb0hhc2hDaGFuZ2UsXG5cdFx0XHRcdFx0XHRcdGVkaXRhYmxlOiBtUGFyYW1ldGVycy5lZGl0YWJsZSxcblx0XHRcdFx0XHRcdFx0YlBlcnNpc3RPUFNjcm9sbDogbVBhcmFtZXRlcnMuYlBlcnNpc3RPUFNjcm9sbCxcblx0XHRcdFx0XHRcdFx0dXBkYXRlRkNMTGV2ZWw6IG1QYXJhbWV0ZXJzLnVwZGF0ZUZDTExldmVsLFxuXHRcdFx0XHRcdFx0XHRiRm9yY2VGb2N1czogbVBhcmFtZXRlcnMuYkZvcmNlRm9jdXNcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2l0aCB0aGUgYXN5bmMgY29udGV4dFwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIGlmICghbVBhcmFtZXRlcnMuYkRlZmVycmVkQ29udGV4dCkge1xuXHRcdFx0XHQvLyBOYXZpZ2F0ZSB0byBhIGxpc3QgYmluZGluZyBub3QgeWV0IHN1cHBvcnRlZFxuXHRcdFx0XHR0aHJvdyBcIm5hdmlnYXRpb24gdG8gYSBsaXN0IGJpbmRpbmcgaXMgbm90IHlldCBzdXBwb3J0ZWRcIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY2FsbEV4dGVuc2lvbikge1xuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3BhZ2luYXRvckN1cnJlbnRDb250ZXh0XCIsIG51bGwpO1xuXG5cdFx0XHRvQ29udGV4dEluZm8uc291cmNlQmluZGluZ0NvbnRleHQgPSBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdG9Db250ZXh0SW5mby5iaW5kaW5nQ29udGV4dCA9IG9Db250ZXh0O1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLm9FdmVudCkge1xuXHRcdFx0XHRvQ29udGV4dEluZm8ub0V2ZW50ID0gbVBhcmFtZXRlcnMub0V2ZW50O1xuXHRcdFx0fVxuXHRcdFx0Ly8gU3RvcmluZyB0aGUgc2VsZWN0ZWQgY29udGV4dCB0byB1c2UgaXQgaW4gaW50ZXJuYWwgcm91dGUgbmF2aWdhdGlvbiBpZiBuZWNjZXNzYXJ5LlxuXHRcdFx0Y29uc3QgYk92ZXJyaWRlTmF2ID0gKHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkucm91dGluZy5vbkJlZm9yZU5hdmlnYXRpb24ob0NvbnRleHRJbmZvKTtcblx0XHRcdGlmIChiT3ZlcnJpZGVOYXYpIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvcGFnaW5hdG9yQ3VycmVudENvbnRleHRcIiwgb0NvbnRleHQpO1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRtUGFyYW1ldGVycy5GQ0xMZXZlbCA9IHRoaXMuX2dldEZDTExldmVsKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5fb1JvdXRpbmdTZXJ2aWNlLm5hdmlnYXRlVG9Db250ZXh0KG9Db250ZXh0LCBtUGFyYW1ldGVycywgdGhpcy5fb1ZpZXcuZ2V0Vmlld0RhdGEoKSwgdGhpcy5fb1RhcmdldEluZm9ybWF0aW9uKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgYmFja3dhcmRzIGZyb20gYSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCB0byBiZSBuYXZpZ2F0ZWQgZnJvbVxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBPcHRpb25hbCBuYXZpZ2F0aW9uIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlZCB3aGVuIHRoZSBuYXZpZ2F0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dChvQ29udGV4dDogYW55LCBtUGFyYW1ldGVycz86IGFueSkge1xuXHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cdFx0bVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWwgPSAtMTtcblxuXHRcdHJldHVybiB0aGlzLm5hdmlnYXRlVG9Db250ZXh0KG9Db250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIGZvcndhcmRzIHRvIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgbmF2aWdhdGVkIHRvXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBPcHRpb25hbCBuYXZpZ2F0aW9uIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlZCB3aGVuIHRoZSBuYXZpZ2F0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRpZiAodGhpcy5fb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKT8uZ2V0UHJvcGVydHkoXCJtZXNzYWdlRm9vdGVyQ29udGFpbnNFcnJvcnNcIikgPT09IHRydWUpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0fVxuXHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cdFx0bVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWwgPSAxO1xuXG5cdFx0cmV0dXJuIHRoaXMubmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgYmFjayBpbiBoaXN0b3J5IGlmIHRoZSBjdXJyZW50IGhhc2ggY29ycmVzcG9uZHMgdG8gYSB0cmFuc2llbnQgc3RhdGUuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVCYWNrRnJvbVRyYW5zaWVudFN0YXRlKCkge1xuXHRcdGNvbnN0IHNIYXNoID0gdGhpcy5fb1JvdXRlclByb3h5LmdldEhhc2goKTtcblxuXHRcdC8vIGlmIHRyaWdnZXJlZCB3aGlsZSBuYXZpZ2F0aW5nIHRvICguLi4pLCB3ZSBuZWVkIHRvIG5hdmlnYXRlIGJhY2tcblx0XHRpZiAoc0hhc2guaW5kZXhPZihcIiguLi4pXCIpICE9PSAtMSkge1xuXHRcdFx0dGhpcy5fb1JvdXRlclByb3h5Lm5hdkJhY2soKTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVUb01lc3NhZ2VQYWdlKHNFcnJvck1lc3NhZ2U6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5fb1JvdXRlclByb3h5LmdldEhhc2goKS5pbmRleE9mKFwiaS1hY3Rpb249Y3JlYXRlXCIpID4gLTEgfHxcblx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5nZXRIYXNoKCkuaW5kZXhPZihcImktYWN0aW9uPWF1dG9DcmVhdGVcIikgPiAtMVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX29Sb3V0ZXJQcm94eS5uYXZUb0hhc2godGhpcy5fb1JvdXRpbmdTZXJ2aWNlLmdldERlZmF1bHRDcmVhdGVIYXNoKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtUGFyYW1ldGVycy5GQ0xMZXZlbCA9IHRoaXMuX2dldEZDTExldmVsKCk7XG5cblx0XHRcdHJldHVybiAodGhpcy5fb0FwcENvbXBvbmVudCBhcyBhbnkpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpLmRpc3BsYXlFcnJvclBhZ2Uoc0Vycm9yTWVzc2FnZSwgbVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgb25lIG9mIHRoZSBjdXJyZW50IHZpZXdzIG9uIHRoZSBzY3JlZW4gaXMgYm91bmQgdG8gYSBnaXZlbiBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHRcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBzdGF0ZSBpcyBpbXBhY3RlZCBieSB0aGUgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRpc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkob0NvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9vUm91dGluZ1NlcnZpY2UuaXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KG9Db250ZXh0KTtcblx0fVxuXG5cdF9pc1ZpZXdQYXJ0T2ZSb3V0ZShyb3V0ZUluZm9ybWF0aW9uOiBhbnkpOiBib29sZWFuIHtcblx0XHRjb25zdCBhVGFyZ2V0cyA9IHJvdXRlSW5mb3JtYXRpb24/LnRhcmdldHM7XG5cdFx0aWYgKCFhVGFyZ2V0cyB8fCBhVGFyZ2V0cy5pbmRleE9mKHRoaXMuX29UYXJnZXRJbmZvcm1hdGlvbi50YXJnZXROYW1lKSA9PT0gLTEpIHtcblx0XHRcdC8vIElmIHRoZSB0YXJnZXQgZm9yIHRoaXMgdmlldyBoYXMgYSB2aWV3IGxldmVsIGdyZWF0ZXIgdGhhbiB0aGUgcm91dGUgbGV2ZWwsIGl0IG1lYW5zIHRoaXMgdmlldyBjb21lcyBcImFmdGVyXCIgdGhlIHJvdXRlXG5cdFx0XHQvLyBpbiB0ZXJtcyBvZiBuYXZpZ2F0aW9uLlxuXHRcdFx0Ly8gSW4gc3VjaCBjYXNlLCB3ZSByZW1vdmUgaXRzIGJpbmRpbmcgY29udGV4dCwgdG8gYXZvaWQgdGhpcyB2aWV3IHRvIGhhdmUgZGF0YSBpZiB3ZSBuYXZpZ2F0ZSB0byBpdCBsYXRlciBvblxuXHRcdFx0aWYgKCh0aGlzLl9vVGFyZ2V0SW5mb3JtYXRpb24udmlld0xldmVsID8/IDApID49IChyb3V0ZUluZm9ybWF0aW9uPy5yb3V0ZUxldmVsID8/IDApKSB7XG5cdFx0XHRcdHRoaXMuX3NldEJpbmRpbmdDb250ZXh0KG51bGwpOyAvLyBUaGlzIGFsc28gY2FsbCBzZXRLZWVwQWxpdmUoZmFsc2UpIG9uIHRoZSBjdXJyZW50IGNvbnRleHRcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdF9idWlsZEJpbmRpbmdQYXRoKHJvdXRlQXJndW1lbnRzOiBhbnksIGJpbmRpbmdQYXR0ZXJuOiBzdHJpbmcsIG5hdmlnYXRpb25QYXJhbWV0ZXJzOiBhbnkpOiB7IHBhdGg6IHN0cmluZzsgZGVmZXJyZWQ6IGJvb2xlYW4gfSB7XG5cdFx0bGV0IHBhdGggPSBiaW5kaW5nUGF0dGVybi5yZXBsYWNlKFwiOj9xdWVyeTpcIiwgXCJcIik7XG5cdFx0bGV0IGRlZmVycmVkID0gZmFsc2U7XG5cblx0XHRmb3IgKGNvbnN0IHNLZXkgaW4gcm91dGVBcmd1bWVudHMpIHtcblx0XHRcdGNvbnN0IHNWYWx1ZSA9IHJvdXRlQXJndW1lbnRzW3NLZXldO1xuXHRcdFx0aWYgKHNWYWx1ZSA9PT0gXCIuLi5cIiAmJiBiaW5kaW5nUGF0dGVybi5pbmRleE9mKGB7JHtzS2V5fX1gKSA+PSAwKSB7XG5cdFx0XHRcdGRlZmVycmVkID0gdHJ1ZTtcblx0XHRcdFx0Ly8gU29tZXRpbWVzIGluIHByZWZlcnJlZE1vZGUgPSBjcmVhdGUsIHRoZSBlZGl0IGJ1dHRvbiBpcyBzaG93biBpbiBiYWNrZ3JvdW5kIHdoZW4gdGhlXG5cdFx0XHRcdC8vIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nIHNob3dzIHVwLCBzZXR0aW5nIGJUYXJnZXRFZGl0YWJsZSBwYXNzZXMgZWRpdGFibGUgYXMgdHJ1ZVxuXHRcdFx0XHQvLyB0byBvbkJlZm9yZUJpbmRpbmcgaW4gX2JpbmRUYXJnZXRQYWdlIGZ1bmN0aW9uXG5cdFx0XHRcdG5hdmlnYXRpb25QYXJhbWV0ZXJzLmJUYXJnZXRFZGl0YWJsZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKGB7JHtzS2V5fX1gLCBzVmFsdWUpO1xuXHRcdH1cblx0XHRpZiAocm91dGVBcmd1bWVudHNbXCI/cXVlcnlcIl0gJiYgcm91dGVBcmd1bWVudHNbXCI/cXVlcnlcIl0uaGFzT3duUHJvcGVydHkoXCJpLWFjdGlvblwiKSkge1xuXHRcdFx0bmF2aWdhdGlvblBhcmFtZXRlcnMuYkFjdGlvbkNyZWF0ZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gdGhlIGJpbmRpbmcgcGF0aCBpcyBhbHdheXMgYWJzb2x1dGVcblx0XHRpZiAocGF0aCAmJiBwYXRoWzBdICE9PSBcIi9cIikge1xuXHRcdFx0cGF0aCA9IGAvJHtwYXRofWA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgcGF0aCwgZGVmZXJyZWQgfTtcblx0fVxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIE1ldGhvZHMgdG8gYmluZCB0aGUgcGFnZSB3aGVuIGEgcm91dGUgaXMgbWF0Y2hlZFxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiBhIHJvdXRlIGlzIG1hdGNoZWQuXG5cdCAqIEJ1aWxkcyB0aGUgYmluZGluZyBjb250ZXh0IGZyb20gdGhlIG5hdmlnYXRpb24gcGFyYW1ldGVycywgYW5kIGJpbmQgdGhlIHBhZ2UgYWNjb3JkaW5nbHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfb25Sb3V0ZU1hdGNoZWQob0V2ZW50OiBFdmVudCkge1xuXHRcdC8vIENoZWNrIGlmIHRoZSB0YXJnZXQgZm9yIHRoaXMgdmlldyBpcyBwYXJ0IG9mIHRoZSBldmVudCB0YXJnZXRzIChpLmUuIGlzIGEgdGFyZ2V0IGZvciB0aGUgY3VycmVudCByb3V0ZSkuXG5cdFx0Ly8gSWYgbm90LCB3ZSBkb24ndCBuZWVkIHRvIGJpbmQgaXQgLS0+IHJldHVyblxuXHRcdGlmICghdGhpcy5faXNWaWV3UGFydE9mUm91dGUob0V2ZW50LmdldFBhcmFtZXRlcihcInJvdXRlSW5mb3JtYXRpb25cIikpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gUmV0cmlldmUgdGhlIGJpbmRpbmcgY29udGV4dCBwYXR0ZXJuXG5cdFx0bGV0IGJpbmRpbmdQYXR0ZXJuO1xuXHRcdGlmICh0aGlzLl9vUGFnZUNvbXBvbmVudCAmJiB0aGlzLl9vUGFnZUNvbXBvbmVudC5nZXRCaW5kaW5nQ29udGV4dFBhdHRlcm4pIHtcblx0XHRcdGJpbmRpbmdQYXR0ZXJuID0gdGhpcy5fb1BhZ2VDb21wb25lbnQuZ2V0QmluZGluZ0NvbnRleHRQYXR0ZXJuKCk7XG5cdFx0fVxuXHRcdGJpbmRpbmdQYXR0ZXJuID0gYmluZGluZ1BhdHRlcm4gfHwgdGhpcy5fb1RhcmdldEluZm9ybWF0aW9uLmNvbnRleHRQYXR0ZXJuO1xuXG5cdFx0aWYgKGJpbmRpbmdQYXR0ZXJuID09PSBudWxsIHx8IGJpbmRpbmdQYXR0ZXJuID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIERvbid0IGRvIHRoaXMgaWYgd2UgYWxyZWFkeSBnb3Qgc1RhcmdldCA9PSAnJywgd2hpY2ggaXMgYSB2YWxpZCB0YXJnZXQgcGF0dGVyblxuXHRcdFx0YmluZGluZ1BhdHRlcm4gPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicm91dGVQYXR0ZXJuXCIpO1xuXHRcdH1cblxuXHRcdC8vIFJlcGxhY2UgdGhlIHBhcmFtZXRlcnMgYnkgdGhlaXIgdmFsdWVzIGluIHRoZSBiaW5kaW5nIGNvbnRleHQgcGF0dGVyblxuXHRcdGNvbnN0IG1Bcmd1bWVudHMgPSAob0V2ZW50LmdldFBhcmFtZXRlcnMoKSBhcyBhbnkpLmFyZ3VtZW50cztcblx0XHRjb25zdCBvTmF2aWdhdGlvblBhcmFtZXRlcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwibmF2aWdhdGlvbkluZm9cIik7XG5cdFx0Y29uc3QgeyBwYXRoLCBkZWZlcnJlZCB9ID0gdGhpcy5fYnVpbGRCaW5kaW5nUGF0aChtQXJndW1lbnRzLCBiaW5kaW5nUGF0dGVybiwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblxuXHRcdHRoaXMub25Sb3V0ZU1hdGNoZWQoKTtcblxuXHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX29WaWV3LmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbDtcblx0XHRsZXQgb091dDtcblx0XHRpZiAoZGVmZXJyZWQpIHtcblx0XHRcdG9PdXQgPSB0aGlzLl9iaW5kRGVmZXJyZWQocGF0aCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b091dCA9IHRoaXMuX2JpbmRQYWdlKHBhdGgsIG9Nb2RlbCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0b091dC5maW5hbGx5KCgpID0+IHtcblx0XHRcdHRoaXMub25Sb3V0ZU1hdGNoZWRGaW5pc2hlZCgpO1xuXHRcdH0pO1xuXG5cdFx0KHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS51cGRhdGVVSVN0YXRlRm9yVmlldyh0aGlzLl9vVmlldywgdGhpcy5fZ2V0RkNMTGV2ZWwoKSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVmZXJyZWQgYmluZGluZyAoZHVyaW5nIG9iamVjdCBjcmVhdGlvbikuXG5cdCAqXG5cdCAqIEBwYXJhbSBzVGFyZ2V0UGF0aCBUaGUgcGF0aCB0byB0aGUgZGVmZmVyZWQgY29udGV4dFxuXHQgKiBAcGFyYW0gb05hdmlnYXRpb25QYXJhbWV0ZXJzIE5hdmlnYXRpb24gcGFyYW1ldGVyc1xuXHQgKiBAcmV0dXJucyBBIFByb21pc2Vcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfYmluZERlZmVycmVkKHNUYXJnZXRQYXRoOiBzdHJpbmcsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyczogYW55KSB7XG5cdFx0dGhpcy5vbkJlZm9yZUJpbmRpbmcobnVsbCwgeyBlZGl0YWJsZTogb05hdmlnYXRpb25QYXJhbWV0ZXJzLmJUYXJnZXRFZGl0YWJsZSB9KTtcblxuXHRcdGlmIChvTmF2aWdhdGlvblBhcmFtZXRlcnMuYkRlZmVycmVkQ29udGV4dCB8fCAhb05hdmlnYXRpb25QYXJhbWV0ZXJzLm9Bc3luY0NvbnRleHQpIHtcblx0XHRcdC8vIGVpdGhlciB0aGUgY29udGV4dCBzaGFsbCBiZSBjcmVhdGVkIGluIHRoZSB0YXJnZXQgcGFnZSAoZGVmZXJyZWQgQ29udGV4dCkgb3IgaXQgc2hhbGxcblx0XHRcdC8vIGJlIGNyZWF0ZWQgYXN5bmMgYnV0IHRoZSB1c2VyIHJlZnJlc2hlZCB0aGUgcGFnZSAvIGJvb2ttYXJrZWQgdGhpcyBVUkxcblx0XHRcdC8vIFRPRE86IGN1cnJlbnRseSB0aGUgdGFyZ2V0IGNvbXBvbmVudCBjcmVhdGVzIHRoaXMgZG9jdW1lbnQgYnV0IHdlIHNoYWxsIG1vdmUgdGhpcyB0b1xuXHRcdFx0Ly8gYSBjZW50cmFsIHBsYWNlXG5cdFx0XHRpZiAodGhpcy5fb1BhZ2VDb21wb25lbnQgJiYgdGhpcy5fb1BhZ2VDb21wb25lbnQuY3JlYXRlRGVmZXJyZWRDb250ZXh0KSB7XG5cdFx0XHRcdHRoaXMuX29QYWdlQ29tcG9uZW50LmNyZWF0ZURlZmVycmVkQ29udGV4dChcblx0XHRcdFx0XHRzVGFyZ2V0UGF0aCxcblx0XHRcdFx0XHRvTmF2aWdhdGlvblBhcmFtZXRlcnMudXNlQ29udGV4dCxcblx0XHRcdFx0XHRvTmF2aWdhdGlvblBhcmFtZXRlcnMuYkFjdGlvbkNyZWF0ZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IGN1cnJlbnRCaW5kaW5nQ29udGV4dCA9IHRoaXMuX2dldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0aWYgKGN1cnJlbnRCaW5kaW5nQ29udGV4dD8uaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0Ly8gRm9yIG5vdyByZW1vdmUgdGhlIHBlbmRpbmcgY2hhbmdlcyB0byBhdm9pZCB0aGUgbW9kZWwgcmFpc2VzIGVycm9ycyBhbmQgdGhlIG9iamVjdCBwYWdlIGlzIGF0IGxlYXN0IGJvdW5kXG5cdFx0XHQvLyBJZGVhbGx5IHRoZSB1c2VyIHNob3VsZCBiZSBhc2tlZCBmb3Jcblx0XHRcdGN1cnJlbnRCaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlIHRoZSBjb250ZXh0IHRvIGF2b2lkIHNob3dpbmcgb2xkIGRhdGFcblx0XHR0aGlzLl9zZXRCaW5kaW5nQ29udGV4dChudWxsKTtcblxuXHRcdHRoaXMub25BZnRlckJpbmRpbmcobnVsbCk7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGJpbmRpbmcgY29udGV4dCBvZiB0aGUgcGFnZSBmcm9tIGEgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIHNUYXJnZXRQYXRoIFRoZSBwYXRoIHRvIHRoZSBjb250ZXh0XG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIE9EYXRhIG1vZGVsXG5cdCAqIEBwYXJhbSBvTmF2aWdhdGlvblBhcmFtZXRlcnMgTmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSByZXNvbHZlZCBvbmNlIHRoZSBiaW5kaW5nIGhhcyBiZWVuIHNldCBvbiB0aGUgcGFnZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9iaW5kUGFnZShzVGFyZ2V0UGF0aDogc3RyaW5nLCBvTW9kZWw6IE9EYXRhTW9kZWwsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyczogb2JqZWN0KSB7XG5cdFx0aWYgKHNUYXJnZXRQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JpbmRQYWdlVG9Db250ZXh0KG51bGwsIG9Nb2RlbCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9yZXNvbHZlU2VtYW50aWNQYXRoKHNUYXJnZXRQYXRoLCBvTW9kZWwpXG5cdFx0XHRcdC50aGVuKChzVGVjaG5pY2FsUGF0aDogYW55KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fYmluZFBhZ2VUb1BhdGgoc1RlY2huaWNhbFBhdGgsIG9Nb2RlbCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKChvRXJyb3I6IGFueSkgPT4ge1xuXHRcdFx0XHRcdC8vIEVycm9yIGhhbmRsaW5nIGZvciBlcnJvbmVvdXMgbWV0YWRhdGEgcmVxdWVzdFxuXHRcdFx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cblx0XHRcdFx0XHR0aGlzLm5hdmlnYXRlVG9NZXNzYWdlUGFnZShvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0RBVEFfUkVDRUlWRURfRVJST1JcIiksIHtcblx0XHRcdFx0XHRcdHRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IG9FcnJvci5tZXNzYWdlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSBmaWx0ZXIgdG8gcmV0cmlldmUgYSBjb250ZXh0IGNvcnJlc3BvbmRpbmcgdG8gYSBzZW1hbnRpYyBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljUGF0aCBUaGUgc2VtYW50aWMgcGF0aFxuXHQgKiBAcGFyYW0gYVNlbWFudGljS2V5cyBUaGUgc2VtYW50aWMga2V5cyBmb3IgdGhlIHBhdGhcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIGluc3RhbmNlIG9mIHRoZSBtZXRhIG1vZGVsXG5cdCAqIEByZXR1cm5zIFRoZSBmaWx0ZXJcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfY3JlYXRlRmlsdGVyRnJvbVNlbWFudGljUGF0aChzU2VtYW50aWNQYXRoOiBzdHJpbmcsIGFTZW1hbnRpY0tleXM6IGFueVtdLCBvTWV0YU1vZGVsOiBvYmplY3QpIHtcblx0XHRjb25zdCBmblVucXVvdGVBbmREZWNvZGUgPSBmdW5jdGlvbiAoc1ZhbHVlOiBhbnkpIHtcblx0XHRcdGlmIChzVmFsdWUuaW5kZXhPZihcIidcIikgPT09IDAgJiYgc1ZhbHVlLmxhc3RJbmRleE9mKFwiJ1wiKSA9PT0gc1ZhbHVlLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0Ly8gUmVtb3ZlIHRoZSBxdW90ZXMgZnJvbSB0aGUgdmFsdWUgYW5kIGRlY29kZSBzcGVjaWFsIGNoYXJzXG5cdFx0XHRcdHNWYWx1ZSA9IGRlY29kZVVSSUNvbXBvbmVudChzVmFsdWUuc3Vic3RyaW5nKDEsIHNWYWx1ZS5sZW5ndGggLSAxKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc1ZhbHVlO1xuXHRcdH07XG5cdFx0Y29uc3QgYUtleVZhbHVlcyA9IHNTZW1hbnRpY1BhdGguc3Vic3RyaW5nKHNTZW1hbnRpY1BhdGguaW5kZXhPZihcIihcIikgKyAxLCBzU2VtYW50aWNQYXRoLmxlbmd0aCAtIDEpLnNwbGl0KFwiLFwiKTtcblx0XHRsZXQgYUZpbHRlcnM6IEZpbHRlcltdO1xuXG5cdFx0aWYgKGFTZW1hbnRpY0tleXMubGVuZ3RoICE9IGFLZXlWYWx1ZXMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRjb25zdCBiRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSA9IE1vZGVsSGVscGVyLmlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZShvTWV0YU1vZGVsKTtcblxuXHRcdGlmIChhU2VtYW50aWNLZXlzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0Ly8gVGFrZSB0aGUgZmlyc3Qga2V5IHZhbHVlXG5cdFx0XHRjb25zdCBzS2V5VmFsdWUgPSBmblVucXVvdGVBbmREZWNvZGUoYUtleVZhbHVlc1swXSk7XG5cdFx0XHRhRmlsdGVycyA9IFtcblx0XHRcdFx0bmV3IEZpbHRlcih7XG5cdFx0XHRcdFx0cGF0aDogYVNlbWFudGljS2V5c1swXS4kUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSxcblx0XHRcdFx0XHR2YWx1ZTE6IHNLZXlWYWx1ZSxcblx0XHRcdFx0XHRjYXNlU2Vuc2l0aXZlOiBiRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZVxuXHRcdFx0XHR9KVxuXHRcdFx0XTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgbUtleVZhbHVlczogYW55ID0ge307XG5cdFx0XHQvLyBDcmVhdGUgYSBtYXAgb2YgYWxsIGtleSB2YWx1ZXNcblx0XHRcdGFLZXlWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoc0tleUFzc2lnbm1lbnQ6IHN0cmluZykge1xuXHRcdFx0XHRjb25zdCBhUGFydHMgPSBzS2V5QXNzaWdubWVudC5zcGxpdChcIj1cIiksXG5cdFx0XHRcdFx0c0tleVZhbHVlID0gZm5VbnF1b3RlQW5kRGVjb2RlKGFQYXJ0c1sxXSk7XG5cblx0XHRcdFx0bUtleVZhbHVlc1thUGFydHNbMF1dID0gc0tleVZhbHVlO1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBiRmFpbGVkID0gZmFsc2U7XG5cdFx0XHRhRmlsdGVycyA9IGFTZW1hbnRpY0tleXMubWFwKGZ1bmN0aW9uIChvU2VtYW50aWNLZXk6IGFueSkge1xuXHRcdFx0XHRjb25zdCBzS2V5ID0gb1NlbWFudGljS2V5LiRQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0c1ZhbHVlID0gbUtleVZhbHVlc1tzS2V5XTtcblxuXHRcdFx0XHRpZiAoc1ZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7XG5cdFx0XHRcdFx0XHRwYXRoOiBzS2V5LFxuXHRcdFx0XHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiBzVmFsdWUsXG5cdFx0XHRcdFx0XHRjYXNlU2Vuc2l0aXZlOiBiRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGJGYWlsZWQgPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRcdHBhdGg6IFwiWFhcIlxuXHRcdFx0XHRcdH0pOyAvLyB3aWxsIGJlIGlnbm9yZSBhbnl3YXkgc2luY2Ugd2UgcmV0dXJuIGFmdGVyXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoYkZhaWxlZCkge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBBZGQgYSBkcmFmdCBmaWx0ZXIgdG8gbWFrZSBzdXJlIHdlIHRha2UgdGhlIGRyYWZ0IGVudGl0eSBpZiB0aGVyZSBpcyBvbmVcblx0XHQvLyBPciB0aGUgYWN0aXZlIGVudGl0eSBvdGhlcndpc2Vcblx0XHRjb25zdCBvRHJhZnRGaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IFtuZXcgRmlsdGVyKFwiSXNBY3RpdmVFbnRpdHlcIiwgXCJFUVwiLCBmYWxzZSksIG5ldyBGaWx0ZXIoXCJTaWJsaW5nRW50aXR5L0lzQWN0aXZlRW50aXR5XCIsIFwiRVFcIiwgbnVsbCldLFxuXHRcdFx0YW5kOiBmYWxzZVxuXHRcdH0pO1xuXHRcdGFGaWx0ZXJzLnB1c2gob0RyYWZ0RmlsdGVyKTtcblxuXHRcdHJldHVybiBuZXcgRmlsdGVyKGFGaWx0ZXJzLCB0cnVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHBhdGggd2l0aCBzZW1hbnRpYyBrZXlzIHRvIGEgcGF0aCB3aXRoIHRlY2huaWNhbCBrZXlzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljUGF0aCBUaGUgcGF0aCB3aXRoIHNlbWFudGljIGtleXNcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgbW9kZWwgZm9yIHRoZSBwYXRoXG5cdCAqIEBwYXJhbSBhU2VtYW50aWNLZXlzIFRoZSBzZW1hbnRpYyBrZXlzIGZvciB0aGUgcGF0aFxuXHQgKiBAcmV0dXJucyBBIFByb21pc2UgY29udGFpbmluZyB0aGUgcGF0aCB3aXRoIHRlY2huaWNhbCBrZXlzIGlmIHNTZW1hbnRpY1BhdGggY291bGQgYmUgaW50ZXJwcmV0ZWQgYXMgYSBzZW1hbnRpYyBwYXRoLCBudWxsIG90aGVyd2lzZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9nZXRUZWNobmljYWxQYXRoRnJvbVNlbWFudGljUGF0aChzU2VtYW50aWNQYXRoOiBzdHJpbmcsIG9Nb2RlbDogYW55LCBhU2VtYW50aWNLZXlzOiBhbnlbXSkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0bGV0IHNFbnRpdHlTZXRQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChzU2VtYW50aWNQYXRoKS5nZXRQYXRoKCk7XG5cblx0XHRpZiAoIWFTZW1hbnRpY0tleXMgfHwgYVNlbWFudGljS2V5cy5sZW5ndGggPT09IDApIHtcblx0XHRcdC8vIE5vIHNlbWFudGljIGtleXNcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXG5cdFx0Ly8gQ3JlYXRlIGEgc2V0IG9mIGZpbHRlcnMgY29ycmVzcG9uZGluZyB0byBhbGwga2V5c1xuXHRcdGNvbnN0IG9GaWx0ZXIgPSB0aGlzLl9jcmVhdGVGaWx0ZXJGcm9tU2VtYW50aWNQYXRoKHNTZW1hbnRpY1BhdGgsIGFTZW1hbnRpY0tleXMsIG9NZXRhTW9kZWwpO1xuXHRcdGlmIChvRmlsdGVyID09PSBudWxsKSB7XG5cdFx0XHQvLyBDb3VsZG4ndCBpbnRlcnByZXQgdGhlIHBhdGggYXMgYSBzZW1hbnRpYyBvbmVcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXG5cdFx0Ly8gTG9hZCB0aGUgY29ycmVzcG9uZGluZyBvYmplY3Rcblx0XHRpZiAoIXNFbnRpdHlTZXRQYXRoPy5zdGFydHNXaXRoKFwiL1wiKSkge1xuXHRcdFx0c0VudGl0eVNldFBhdGggPSBgLyR7c0VudGl0eVNldFBhdGh9YDtcblx0XHR9XG5cdFx0Y29uc3Qgb0xpc3RCaW5kaW5nID0gb01vZGVsLmJpbmRMaXN0KHNFbnRpdHlTZXRQYXRoLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgb0ZpbHRlciwge1xuXHRcdFx0JCRncm91cElkOiBcIiRhdXRvLkhlcm9lc1wiXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gb0xpc3RCaW5kaW5nLnJlcXVlc3RDb250ZXh0cygwLCAyKS50aGVuKGZ1bmN0aW9uIChvQ29udGV4dHM6IGFueSkge1xuXHRcdFx0aWYgKG9Db250ZXh0cyAmJiBvQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiBvQ29udGV4dHNbMF0uZ2V0UGF0aCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gZGF0YSBjb3VsZCBiZSBsb2FkZWRcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgcGF0aCBpcyBlbGlnaWJsZSBmb3Igc2VtYW50aWMgYm9va21hcmtpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUGF0aCBUaGUgcGF0aCB0byB0ZXN0XG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBhc3NvY2lhdGVkIG1ldGFkYXRhIG1vZGVsXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgcGF0aCBpcyBlbGlnaWJsZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9jaGVja1BhdGhGb3JTZW1hbnRpY0Jvb2ttYXJraW5nKHNQYXRoOiBzdHJpbmcsIG9NZXRhTW9kZWw6IGFueSkge1xuXHRcdC8vIE9ubHkgcGF0aCBvbiByb290IG9iamVjdHMgYWxsb3cgc2VtYW50aWMgYm9va21hcmtpbmcsIGkuZS4gc1BhdGggPSB4eHgoeXl5KVxuXHRcdGNvbnN0IGFNYXRjaGVzID0gL15bXFwvXT8oXFx3KylcXChbXlxcL10rXFwpJC8uZXhlYyhzUGF0aCk7XG5cdFx0aWYgKCFhTWF0Y2hlcykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHQvLyBHZXQgdGhlIGVudGl0eVNldCBuYW1lXG5cdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBgLyR7YU1hdGNoZXNbMV19YDtcblx0XHQvLyBDaGVjayB0aGUgZW50aXR5IHNldCBzdXBwb3J0cyBkcmFmdCAob3RoZXJ3aXNlIHdlIGRvbid0IHN1cHBvcnQgc2VtYW50aWMgYm9va21hcmtpbmcpXG5cdFx0Y29uc3Qgb0RyYWZ0Um9vdCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YCk7XG5cdFx0Y29uc3Qgb0RyYWZ0Tm9kZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnROb2RlYCk7XG5cdFx0cmV0dXJuIG9EcmFmdFJvb3QgfHwgb0RyYWZ0Tm9kZSA/IHRydWUgOiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZHMgYSBwYXRoIHdpdGggc2VtYW50aWMga2V5cyBmcm9tIGEgcGF0aCB3aXRoIHRlY2huaWNhbCBrZXlzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGhUb1Jlc29sdmUgVGhlIHBhdGggdG8gYmUgdHJhbnNmb3JtZWRcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHJldHVybnMgU3RyaW5nIHByb21pc2UgZm9yIHRoZSBuZXcgcGF0aC4gSWYgc1BhdGhUb1Jlc29sdmVkIGNvdWxkbid0IGJlIGludGVycHJldGVkIGFzIGEgc2VtYW50aWMgcGF0aCwgaXQgaXMgcmV0dXJuZWQgYXMgaXMuXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X3Jlc29sdmVTZW1hbnRpY1BhdGgoc1BhdGhUb1Jlc29sdmU6IHN0cmluZywgb01vZGVsOiBhbnkpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgb0xhc3RTZW1hbnRpY01hcHBpbmcgPSB0aGlzLl9vUm91dGluZ1NlcnZpY2UuZ2V0TGFzdFNlbWFudGljTWFwcGluZygpO1xuXHRcdGxldCBzQ3VycmVudEhhc2hOb1BhcmFtcyA9IHRoaXMuX29Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5nZXRIYXNoKCkuc3BsaXQoXCI/XCIpWzBdO1xuXG5cdFx0aWYgKHNDdXJyZW50SGFzaE5vUGFyYW1zICYmIHNDdXJyZW50SGFzaE5vUGFyYW1zLmxhc3RJbmRleE9mKFwiL1wiKSA9PT0gc0N1cnJlbnRIYXNoTm9QYXJhbXMubGVuZ3RoIC0gMSkge1xuXHRcdFx0Ly8gUmVtb3ZlIHRyYWlsaW5nICcvJ1xuXHRcdFx0c0N1cnJlbnRIYXNoTm9QYXJhbXMgPSBzQ3VycmVudEhhc2hOb1BhcmFtcy5zdWJzdHJpbmcoMCwgc0N1cnJlbnRIYXNoTm9QYXJhbXMubGVuZ3RoIC0gMSk7XG5cdFx0fVxuXG5cdFx0bGV0IHNSb290RW50aXR5TmFtZSA9IHNDdXJyZW50SGFzaE5vUGFyYW1zICYmIHNDdXJyZW50SGFzaE5vUGFyYW1zLnN1YnN0cigwLCBzQ3VycmVudEhhc2hOb1BhcmFtcy5pbmRleE9mKFwiKFwiKSk7XG5cdFx0aWYgKHNSb290RW50aXR5TmFtZS5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0c1Jvb3RFbnRpdHlOYW1lID0gc1Jvb3RFbnRpdHlOYW1lLnN1YnN0cmluZygxKTtcblx0XHR9XG5cdFx0Y29uc3QgYkFsbG93U2VtYW50aWNCb29rbWFyayA9IHRoaXMuX2NoZWNrUGF0aEZvclNlbWFudGljQm9va21hcmtpbmcoc0N1cnJlbnRIYXNoTm9QYXJhbXMsIG9NZXRhTW9kZWwpLFxuXHRcdFx0YVNlbWFudGljS2V5cyA9IGJBbGxvd1NlbWFudGljQm9va21hcmsgJiYgU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNLZXlzKG9NZXRhTW9kZWwsIHNSb290RW50aXR5TmFtZSk7XG5cdFx0aWYgKCFhU2VtYW50aWNLZXlzKSB7XG5cdFx0XHQvLyBObyBzZW1hbnRpYyBrZXlzIGF2YWlsYWJsZSAtLT4gdXNlIHRoZSBwYXRoIGFzIGlzXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNQYXRoVG9SZXNvbHZlKTtcblx0XHR9IGVsc2UgaWYgKG9MYXN0U2VtYW50aWNNYXBwaW5nICYmIG9MYXN0U2VtYW50aWNNYXBwaW5nLnNlbWFudGljUGF0aCA9PT0gc1BhdGhUb1Jlc29sdmUpIHtcblx0XHRcdC8vIFRoaXMgc2VtYW50aWMgcGF0aCBoYXMgYmVlbiByZXNvbHZlZCBwcmV2aW91c2x5XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9MYXN0U2VtYW50aWNNYXBwaW5nLnRlY2huaWNhbFBhdGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBXZSBuZWVkIHJlc29sdmUgdGhlIHNlbWFudGljIHBhdGggdG8gZ2V0IHRoZSB0ZWNobmljYWwga2V5c1xuXHRcdFx0cmV0dXJuIHRoaXMuX2dldFRlY2huaWNhbFBhdGhGcm9tU2VtYW50aWNQYXRoKHNDdXJyZW50SGFzaE5vUGFyYW1zLCBvTW9kZWwsIGFTZW1hbnRpY0tleXMpLnRoZW4oKHNUZWNobmljYWxQYXRoOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKHNUZWNobmljYWxQYXRoICYmIHNUZWNobmljYWxQYXRoICE9PSBzUGF0aFRvUmVzb2x2ZSkge1xuXHRcdFx0XHRcdC8vIFRoZSBzZW1hbnRpYyBwYXRoIHdhcyByZXNvbHZlZCAob3RoZXJ3aXNlIGtlZXAgdGhlIG9yaWdpbmFsIHZhbHVlIGZvciB0YXJnZXQpXG5cdFx0XHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlLnNldExhc3RTZW1hbnRpY01hcHBpbmcoe1xuXHRcdFx0XHRcdFx0dGVjaG5pY2FsUGF0aDogc1RlY2huaWNhbFBhdGgsXG5cdFx0XHRcdFx0XHRzZW1hbnRpY1BhdGg6IHNQYXRoVG9SZXNvbHZlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuIHNUZWNobmljYWxQYXRoO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBzUGF0aFRvUmVzb2x2ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGJpbmRpbmcgY29udGV4dCBvZiB0aGUgcGFnZSBmcm9tIGEgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIHNUYXJnZXRQYXRoIFRoZSBwYXRoIHRvIGJ1aWxkIHRoZSBjb250ZXh0LiBOZWVkcyB0byBjb250YWluIHRlY2huaWNhbCBrZXlzIG9ubHkuXG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIE9EYXRhIG1vZGVsXG5cdCAqIEBwYXJhbSBvTmF2aWdhdGlvblBhcmFtZXRlcnMgTmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2JpbmRQYWdlVG9QYXRoKHNUYXJnZXRQYXRoOiBzdHJpbmcsIG9Nb2RlbDogYW55LCBvTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IG9DdXJyZW50Q29udGV4dCA9IHRoaXMuX2dldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRzQ3VycmVudFBhdGggPSBvQ3VycmVudENvbnRleHQgJiYgb0N1cnJlbnRDb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdG9Vc2VDb250ZXh0ID0gb05hdmlnYXRpb25QYXJhbWV0ZXJzLnVzZUNvbnRleHQgYXMgQ29udGV4dCB8IHVuZGVmaW5lZCB8IG51bGw7XG5cblx0XHQvLyBXZSBzZXQgdGhlIGJpbmRpbmcgY29udGV4dCBvbmx5IGlmIGl0J3MgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgb25lXG5cdFx0Ly8gb3IgaWYgd2UgaGF2ZSBhIGNvbnRleHQgYWxyZWFkeSBzZWxlY3RlZFxuXHRcdGlmIChvVXNlQ29udGV4dCAmJiBvVXNlQ29udGV4dC5nZXRQYXRoKCkgPT09IHNUYXJnZXRQYXRoKSB7XG5cdFx0XHRpZiAob1VzZUNvbnRleHQgIT09IG9DdXJyZW50Q29udGV4dCkge1xuXHRcdFx0XHQvLyBXZSBhbHJlYWR5IGhhdmUgdGhlIGNvbnRleHQgdG8gYmUgdXNlZCwgYW5kIGl0J3Mgbm90IHRoZSBjdXJyZW50IG9uZVxuXHRcdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fb0FwcENvbXBvbmVudC5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblxuXHRcdFx0XHQvLyBJbiBjYXNlIG9mIEZDTCwgaWYgd2UncmUgcmV1c2luZyBhIGNvbnRleHQgZnJvbSBhIHRhYmxlICh0aHJvdWdoIG5hdmlnYXRpb24pLCB3ZSByZWZyZXNoIGl0IHRvIGF2b2lkIG91dGRhdGVkIGRhdGFcblx0XHRcdFx0Ly8gV2UgZG9uJ3Qgd2FpdCBmb3IgdGhlIHJlZnJlc2ggdG8gYmUgY29tcGxldGVkIChyZXF1ZXN0UmVmcmVzaCksIHNvIHRoYXQgdGhlIGNvcnJlc3BvbmRpbmcgcXVlcnkgZ29lcyBpbnRvIHRoZSBzYW1lXG5cdFx0XHRcdC8vIGJhdGNoIGFzIHRoZSBvbmVzIGZyb20gY29udHJvbHMgaW4gdGhlIHBhZ2UuXG5cdFx0XHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpICYmIG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWFzb24gPT09IE5hdmlnYXRpb25SZWFzb24uUm93UHJlc3MpIHtcblx0XHRcdFx0XHRjb25zdCBtZXRhTW9kZWwgPSBvVXNlQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRcdGlmICghb1VzZUNvbnRleHQuZ2V0QmluZGluZygpLmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0XHRcdG9Vc2VDb250ZXh0LnJlZnJlc2goKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0aXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpIHx8XG5cdFx0XHRcdFx0XHQoTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChtZXRhTW9kZWwsIG9Vc2VDb250ZXh0LmdldFBhdGgoKSkgJiZcblx0XHRcdFx0XHRcdFx0TW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQobWV0YU1vZGVsKSlcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdC8vIElmIHRoZXJlIGFyZSBwZW5kaW5nIGNoYW5nZXMgYnV0IHdlJ3JlIGluIGNvbGxhYm9yYXRpb24gZHJhZnQsIHdlIGZvcmNlIHRoZSByZWZyZXNoIChkaXNjYXJkaW5nIHBlbmRpbmcgY2hhbmdlcykgYXMgd2UgbmVlZCB0byBoYXZlIHRoZSBsYXRlc3QgdmVyc2lvbi5cblx0XHRcdFx0XHRcdC8vIFdoZW4gbmF2aWdhdGluZyBmcm9tIExSIHRvIE9QLCB0aGUgdmlldyBpcyBub3QgY29ubmVjdGVkIHlldCAtLT4gY2hlY2sgaWYgd2UncmUgaW4gZHJhZnQgd2l0aCBjb2xsYWJvcmF0aW9uIGZyb20gdGhlIG1ldGFtb2RlbFxuXHRcdFx0XHRcdFx0b1VzZUNvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdFx0XHRcdFx0b1VzZUNvbnRleHQucmVmcmVzaCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl9iaW5kUGFnZVRvQ29udGV4dChvVXNlQ29udGV4dCwgb01vZGVsLCBvTmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoc0N1cnJlbnRQYXRoICE9PSBzVGFyZ2V0UGF0aCkge1xuXHRcdFx0Ly8gV2UgbmVlZCB0byBjcmVhdGUgYSBuZXcgY29udGV4dCBmb3IgaXRzIHBhdGhcblx0XHRcdHRoaXMuX2JpbmRQYWdlVG9Db250ZXh0KHRoaXMuX2NyZWF0ZUNvbnRleHQoc1RhcmdldFBhdGgsIG9Nb2RlbCksIG9Nb2RlbCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHR9IGVsc2UgaWYgKG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWFzb24gIT09IE5hdmlnYXRpb25SZWFzb24uQXBwU3RhdGVDaGFuZ2VkICYmIEVkaXRTdGF0ZS5pc0VkaXRTdGF0ZURpcnR5KCkpIHtcblx0XHRcdHRoaXMuX3JlZnJlc2hCaW5kaW5nQ29udGV4dChvQ3VycmVudENvbnRleHQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBCaW5kcyB0aGUgcGFnZSB0byBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IHRvIGJlIGJvdW5kXG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIE9EYXRhIG1vZGVsXG5cdCAqIEBwYXJhbSBvTmF2aWdhdGlvblBhcmFtZXRlcnMgTmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2JpbmRQYWdlVG9Db250ZXh0KG9Db250ZXh0OiBDb250ZXh0IHwgbnVsbCwgb01vZGVsOiBPRGF0YU1vZGVsLCBvTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdHRoaXMub25CZWZvcmVCaW5kaW5nKG51bGwpO1xuXHRcdFx0dGhpcy5vbkFmdGVyQmluZGluZyhudWxsKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBvUGFyZW50TGlzdEJpbmRpbmcgPSBvQ29udGV4dC5nZXRCaW5kaW5nKCk7XG5cdFx0Y29uc3Qgb1Jvb3RWaWV3Q29udHJvbGxlciA9ICh0aGlzLl9vQXBwQ29tcG9uZW50IGFzIGFueSkuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCk7XG5cdFx0aWYgKG9Sb290Vmlld0NvbnRyb2xsZXIuaXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdGlmICghb1BhcmVudExpc3RCaW5kaW5nIHx8ICFvUGFyZW50TGlzdEJpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0Ly8gaWYgdGhlIHBhcmVudEJpbmRpbmcgaXMgbm90IGEgbGlzdEJpbmRpbmcsIHdlIGNyZWF0ZSBhIG5ldyBjb250ZXh0XG5cdFx0XHRcdG9Db250ZXh0ID0gdGhpcy5fY3JlYXRlQ29udGV4dChvQ29udGV4dC5nZXRQYXRoKCksIG9Nb2RlbCk7XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHRoaXMuX3NldEtlZXBBbGl2ZShcblx0XHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzQ29udGV4dFVzZWRJblBhZ2VzKG9Db250ZXh0KSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHRydWUgLy8gTG9hZCBtZXNzYWdlcywgb3RoZXJ3aXNlIHRoZXkgZG9uJ3QgZ2V0IHJlZnJlc2hlZCBsYXRlciwgZS5nLiBmb3Igc2lkZSBlZmZlY3RzXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdFx0Ly8gc2V0S2VlcEFsaXZlIHRocm93cyBhbiBleGNlcHRpb24gaWYgdGhlIHBhcmVudCBsaXN0YmluZGluZyBkb2Vzbid0IGhhdmUgJCRvd25SZXF1ZXN0PXRydWVcblx0XHRcdFx0Ly8gVGhpcyBjYXNlIGZvciBjdXN0b20gZnJhZ21lbnRzIGlzIHN1cHBvcnRlZCwgYnV0IGFuIGVycm9yIGlzIGxvZ2dlZCB0byBtYWtlIHRoZSBsYWNrIG9mIHN5bmNocm9uaXphdGlvbiBhcHBhcmVudFxuXHRcdFx0XHRMb2cuZXJyb3IoXG5cdFx0XHRcdFx0YFZpZXcgZm9yICR7b0NvbnRleHQuZ2V0UGF0aCgpfSB3b24ndCBiZSBzeW5jaHJvbml6ZWQuIFBhcmVudCBsaXN0QmluZGluZyBtdXN0IGhhdmUgYmluZGluZyBwYXJhbWV0ZXIgJCRvd25SZXF1ZXN0PXRydWVgXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghb1BhcmVudExpc3RCaW5kaW5nIHx8IG9QYXJlbnRMaXN0QmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0Ly8gV2UgbmVlZCB0byByZWNyZWF0ZSB0aGUgY29udGV4dCBvdGhlcndpc2Ugd2UgZ2V0IGVycm9yc1xuXHRcdFx0b0NvbnRleHQgPSB0aGlzLl9jcmVhdGVDb250ZXh0KG9Db250ZXh0LmdldFBhdGgoKSwgb01vZGVsKTtcblx0XHR9XG5cblx0XHQvLyBTZXQgdGhlIGJpbmRpbmcgY29udGV4dCB3aXRoIHRoZSBwcm9wZXIgYmVmb3JlL2FmdGVyIGNhbGxiYWNrc1xuXHRcdHRoaXMub25CZWZvcmVCaW5kaW5nKG9Db250ZXh0LCB7XG5cdFx0XHRlZGl0YWJsZTogb05hdmlnYXRpb25QYXJhbWV0ZXJzLmJUYXJnZXRFZGl0YWJsZSxcblx0XHRcdGxpc3RCaW5kaW5nOiBvUGFyZW50TGlzdEJpbmRpbmcsXG5cdFx0XHRiUGVyc2lzdE9QU2Nyb2xsOiBvTmF2aWdhdGlvblBhcmFtZXRlcnMuYlBlcnNpc3RPUFNjcm9sbCxcblx0XHRcdGJEcmFmdE5hdmlnYXRpb246IG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5iRHJhZnROYXZpZ2F0aW9uLFxuXHRcdFx0c2hvd1BsYWNlaG9sZGVyOiBvTmF2aWdhdGlvblBhcmFtZXRlcnMuYlNob3dQbGFjZWhvbGRlclxuXHRcdH0pO1xuXG5cdFx0dGhpcy5fc2V0QmluZGluZ0NvbnRleHQob0NvbnRleHQpO1xuXHRcdHRoaXMub25BZnRlckJpbmRpbmcob0NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBjb250ZXh0IGZyb20gYSBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGhcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHJldHVybnMgVGhlIGNyZWF0ZWQgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9jcmVhdGVDb250ZXh0KHNQYXRoOiBzdHJpbmcsIG9Nb2RlbDogT0RhdGFNb2RlbCkge1xuXHRcdGNvbnN0IG9QYWdlQ29tcG9uZW50ID0gdGhpcy5fb1BhZ2VDb21wb25lbnQsXG5cdFx0XHRzRW50aXR5U2V0ID0gb1BhZ2VDb21wb25lbnQgJiYgb1BhZ2VDb21wb25lbnQuZ2V0RW50aXR5U2V0ICYmIG9QYWdlQ29tcG9uZW50LmdldEVudGl0eVNldCgpLFxuXHRcdFx0c0NvbnRleHRQYXRoID1cblx0XHRcdFx0KG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoKCkpIHx8IChzRW50aXR5U2V0ICYmIGAvJHtzRW50aXR5U2V0fWApLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdG1QYXJhbWV0ZXJzOiBhbnkgPSB7XG5cdFx0XHRcdCQkZ3JvdXBJZDogXCIkYXV0by5IZXJvZXNcIixcblx0XHRcdFx0JCR1cGRhdGVHcm91cElkOiBcIiRhdXRvXCIsXG5cdFx0XHRcdCQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHM6IHRydWVcblx0XHRcdH07XG5cdFx0Ly8gSW4gY2FzZSBvZiBkcmFmdDogJHNlbGVjdCB0aGUgc3RhdGUgZmxhZ3MgKEhhc0FjdGl2ZUVudGl0eSwgSGFzRHJhZnRFbnRpdHksIGFuZCBJc0FjdGl2ZUVudGl0eSlcblx0XHRjb25zdCBvRHJhZnRSb290ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YCk7XG5cdFx0Y29uc3Qgb0RyYWZ0Tm9kZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZWApO1xuXHRcdGNvbnN0IG9Sb290Vmlld0NvbnRyb2xsZXIgPSAodGhpcy5fb0FwcENvbXBvbmVudCBhcyBhbnkpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpO1xuXHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuX2dldEtlZXBBbGl2ZUNvbnRleHQob01vZGVsLCBzUGF0aCwgZmFsc2UsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY3JlYXRlIGtlZXBBbGl2ZSBjb250ZXh0ICR7c1BhdGh9YCk7XG5cdFx0XHR9IGVsc2UgaWYgKG9EcmFmdFJvb3QgfHwgb0RyYWZ0Tm9kZSkge1xuXHRcdFx0XHRpZiAob0NvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0b0NvbnRleHQucmVxdWVzdFByb3BlcnR5KFtcIkhhc0FjdGl2ZUVudGl0eVwiLCBcIkhhc0RyYWZ0RW50aXR5XCIsIFwiSXNBY3RpdmVFbnRpdHlcIl0pO1xuXHRcdFx0XHRcdGlmIChvRHJhZnRSb290KSB7XG5cdFx0XHRcdFx0XHRvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gZHJhZnQgYW5kIGVkaXQgd2UgbmVlZCB0byBlbnN1cmUgdGhvc2UgcHJvcGVydGllcyBhcmUgcmVxdWVzdGVkIGFnYWluIGV2ZW4gaWYgdGhleSBhcmUgaW4gdGhlIGJpbmRpbmcncyBjYWNoZVxuXHRcdFx0XHRcdC8vIG90aGVyd2lzZSB3aGVuIHlvdSBlZGl0IGFuZCBnbyB0byB0aGUgc2F2ZWQgdmVyc2lvbiB5b3UgaGF2ZSBubyB3YXkgb2Ygc3dpdGNoaW5nIGJhY2sgdG8gdGhlIGVkaXQgdmVyc2lvblxuXHRcdFx0XHRcdG9Db250ZXh0LnJlcXVlc3RTaWRlRWZmZWN0cyhcblx0XHRcdFx0XHRcdG9EcmFmdFJvb3Rcblx0XHRcdFx0XHRcdFx0PyBbXCJIYXNBY3RpdmVFbnRpdHlcIiwgXCJIYXNEcmFmdEVudGl0eVwiLCBcIklzQWN0aXZlRW50aXR5XCIsIFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFcIl1cblx0XHRcdFx0XHRcdFx0OiBbXCJIYXNBY3RpdmVFbnRpdHlcIiwgXCJIYXNEcmFmdEVudGl0eVwiLCBcIklzQWN0aXZlRW50aXR5XCJdXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gb0NvbnRleHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChzRW50aXR5U2V0KSB7XG5cdFx0XHRcdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblx0XHRcdFx0aWYgKHNNZXNzYWdlc1BhdGgpIHtcblx0XHRcdFx0XHRtUGFyYW1ldGVycy4kc2VsZWN0ID0gc01lc3NhZ2VzUGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbiBjYXNlIG9mIGRyYWZ0OiAkc2VsZWN0IHRoZSBzdGF0ZSBmbGFncyAoSGFzQWN0aXZlRW50aXR5LCBIYXNEcmFmdEVudGl0eSwgYW5kIElzQWN0aXZlRW50aXR5KVxuXHRcdFx0aWYgKG9EcmFmdFJvb3QgfHwgb0RyYWZ0Tm9kZSkge1xuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuJHNlbGVjdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuJHNlbGVjdCA9IFwiSGFzQWN0aXZlRW50aXR5LEhhc0RyYWZ0RW50aXR5LElzQWN0aXZlRW50aXR5XCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuJHNlbGVjdCArPSBcIixIYXNBY3RpdmVFbnRpdHksSGFzRHJhZnRFbnRpdHksSXNBY3RpdmVFbnRpdHlcIjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuX29WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdFx0Y29uc3Qgb1ByZXZpb3VzQmluZGluZyA9ICh0aGlzLl9vVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIGFueSk/LmdldEJpbmRpbmcoKTtcblx0XHRcdFx0b1ByZXZpb3VzQmluZGluZ1xuXHRcdFx0XHRcdD8ucmVzZXRDaGFuZ2VzKClcblx0XHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRvUHJldmlvdXNCaW5kaW5nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlc2V0aW5nIHRoZSBjaGFuZ2VzIHRvIHRoZSBiaW5kaW5nXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9IaWRkZW5CaW5kaW5nID0gb01vZGVsLmJpbmRDb250ZXh0KHNQYXRoLCB1bmRlZmluZWQsIG1QYXJhbWV0ZXJzKTtcblxuXHRcdFx0b0hpZGRlbkJpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlcXVlc3RlZFwiLCAoKSA9PiB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIubG9jayh0aGlzLl9vVmlldyk7XG5cdFx0XHR9KTtcblx0XHRcdG9IaWRkZW5CaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZWNlaXZlZFwiLCB0aGlzLm9uRGF0YVJlY2VpdmVkLmJpbmQodGhpcykpO1xuXHRcdFx0cmV0dXJuIG9IaWRkZW5CaW5kaW5nLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdH1cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRhc3luYyBvbkRhdGFSZWNlaXZlZChvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0Y29uc3Qgc0Vycm9yRGVzY3JpcHRpb24gPSBvRXZlbnQgJiYgb0V2ZW50LmdldFBhcmFtZXRlcihcImVycm9yXCIpO1xuXHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKHRoaXMuX29WaWV3KSkge1xuXHRcdFx0QnVzeUxvY2tlci51bmxvY2sodGhpcy5fb1ZpZXcpO1xuXHRcdH1cblxuXHRcdGlmIChzRXJyb3JEZXNjcmlwdGlvbikge1xuXHRcdFx0Ly8gVE9ETzogaW4gY2FzZSBvZiA0MDQgdGhlIHRleHQgc2hhbGwgYmUgZGlmZmVyZW50XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBhd2FpdCBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIsIHRydWUpO1xuXHRcdFx0XHRjb25zdCBtZXNzYWdlSGFuZGxlciA9IHRoaXMuYmFzZS5tZXNzYWdlSGFuZGxlcjtcblx0XHRcdFx0bGV0IG1QYXJhbXMgPSB7fTtcblx0XHRcdFx0aWYgKHNFcnJvckRlc2NyaXB0aW9uLnN0YXR1cyA9PT0gNTAzKSB7XG5cdFx0XHRcdFx0bVBhcmFtcyA9IHtcblx0XHRcdFx0XHRcdGlzSW5pdGlhbExvYWQ1MDNFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNoZWxsQmFjazogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSBpZiAoc0Vycm9yRGVzY3JpcHRpb24uc3RhdHVzID09PSA0MDApIHtcblx0XHRcdFx0XHRtUGFyYW1zID0ge1xuXHRcdFx0XHRcdFx0dGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfRVJST1JcIiksXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9EQVRBX1JFQ0VJVkVEX0VSUk9SX0RFU0NSSVBUSU9OXCIpLFxuXHRcdFx0XHRcdFx0aXNEYXRhUmVjZWl2ZWRFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNoZWxsQmFjazogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bVBhcmFtcyA9IHtcblx0XHRcdFx0XHRcdHRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHNFcnJvckRlc2NyaXB0aW9uLFxuXHRcdFx0XHRcdFx0aXNEYXRhUmVjZWl2ZWRFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNoZWxsQmFjazogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKG1QYXJhbXMpO1xuXHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZ2V0dGluZyB0aGUgY29yZSByZXNvdXJjZSBidW5kbGVcIiwgb0Vycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgc2lkZSBlZmZlY3RzIG9uIGEgYmluZGluZyBjb250ZXh0IHRvIFwicmVmcmVzaFwiIGl0LlxuXHQgKiBUT0RPOiBnZXQgcmlkIG9mIHRoaXMgb25jZSBwcm92aWRlZCBieSB0aGUgbW9kZWxcblx0ICogYSByZWZyZXNoIG9uIHRoZSBiaW5kaW5nIGNvbnRleHQgZG9lcyBub3Qgd29yayBpbiBjYXNlIGEgY3JlYXRpb24gcm93IHdpdGggYSB0cmFuc2llbnQgY29udGV4dCBpc1xuXHQgKiB1c2VkLiBhbHNvIGEgcmVxdWVzdFNpZGVFZmZlY3RzIHdpdGggYW4gZW1wdHkgcGF0aCB3b3VsZCBmYWlsIGR1ZSB0byB0aGUgdHJhbnNpZW50IGNvbnRleHRcblx0ICogdGhlcmVmb3JlIHdlIGdldCBhbGwgZGVwZW5kZW50IGJpbmRpbmdzICh2aWEgcHJpdmF0ZSBtb2RlbCBtZXRob2QpIHRvIGRldGVybWluZSBhbGwgcGF0aHMgYW5kIHRoZW5cblx0ICogcmVxdWVzdCB0aGVtLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0JpbmRpbmdDb250ZXh0IENvbnRleHQgdG8gYmUgcmVmcmVzaGVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X3JlZnJlc2hCaW5kaW5nQ29udGV4dChvQmluZGluZ0NvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IG9QYWdlQ29tcG9uZW50ID0gdGhpcy5fb1BhZ2VDb21wb25lbnQ7XG5cdFx0Y29uc3Qgb1NpZGVFZmZlY3RzU2VydmljZSA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0Y29uc3Qgc1Jvb3RDb250ZXh0UGF0aCA9IG9CaW5kaW5nQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc0VudGl0eVNldCA9IG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldEVudGl0eVNldCAmJiBvUGFnZUNvbXBvbmVudC5nZXRFbnRpdHlTZXQoKTtcblx0XHRjb25zdCBzQ29udGV4dFBhdGggPVxuXHRcdFx0KG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoKCkpIHx8IChzRW50aXR5U2V0ICYmIGAvJHtzRW50aXR5U2V0fWApO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdGxldCBzTWVzc2FnZXNQYXRoO1xuXHRcdGNvbnN0IGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRoczogYW55W10gPSBbXTtcblx0XHRjb25zdCBhUHJvcGVydHlQYXRoczogYW55W10gPSBbXTtcblx0XHRjb25zdCBvU2lkZUVmZmVjdHM6IGFueSA9IHtcblx0XHRcdFRhcmdldFByb3BlcnRpZXM6IFtdLFxuXHRcdFx0VGFyZ2V0RW50aXRpZXM6IFtdXG5cdFx0fTtcblxuXHRcdGZ1bmN0aW9uIGdldEJpbmRpbmdQYXRocyhvQmluZGluZzogYW55KSB7XG5cdFx0XHRsZXQgYURlcGVuZGVudEJpbmRpbmdzO1xuXHRcdFx0Y29uc3Qgc1JlbGF0aXZlUGF0aCA9ICgob0JpbmRpbmcuZ2V0Q29udGV4dCgpICYmIG9CaW5kaW5nLmdldENvbnRleHQoKS5nZXRQYXRoKCkpIHx8IFwiXCIpLnJlcGxhY2Uoc1Jvb3RDb250ZXh0UGF0aCwgXCJcIik7IC8vIElmIG5vIGNvbnRleHQsIHRoaXMgaXMgYW4gYWJzb2x1dGUgYmluZGluZyBzbyBubyByZWxhdGl2ZSBwYXRoXG5cdFx0XHRjb25zdCBzUGF0aCA9IChzUmVsYXRpdmVQYXRoID8gYCR7c1JlbGF0aXZlUGF0aC5zbGljZSgxKX0vYCA6IHNSZWxhdGl2ZVBhdGgpICsgb0JpbmRpbmcuZ2V0UGF0aCgpO1xuXG5cdFx0XHRpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhQ29udGV4dEJpbmRpbmdcIikpIHtcblx0XHRcdFx0Ly8gaWYgKHNQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRcdC8vIG5vdyBnZXQgdGhlIGRlcGVuZGVudCBiaW5kaW5nc1xuXHRcdFx0XHRhRGVwZW5kZW50QmluZGluZ3MgPSBvQmluZGluZy5nZXREZXBlbmRlbnRCaW5kaW5ncygpO1xuXHRcdFx0XHRpZiAoYURlcGVuZGVudEJpbmRpbmdzKSB7XG5cdFx0XHRcdFx0Ly8gYXNrIHRoZSBkZXBlbmRlbnQgYmluZGluZ3MgKGFuZCBvbmx5IHRob3NlIHdpdGggdGhlIHNwZWNpZmllZCBncm91cElkXG5cdFx0XHRcdFx0Ly9pZiAoYURlcGVuZGVudEJpbmRpbmdzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFEZXBlbmRlbnRCaW5kaW5ncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Z2V0QmluZGluZ1BhdGhzKGFEZXBlbmRlbnRCaW5kaW5nc1tpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRocy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMucHVzaChzUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0aWYgKGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRocy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMucHVzaChzUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhUHJvcGVydHlCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdGlmIChhUHJvcGVydHlQYXRocy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhUHJvcGVydHlQYXRocy5wdXNoKHNQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChzQ29udGV4dFBhdGgpIHtcblx0XHRcdHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblx0XHR9XG5cblx0XHQvLyBiaW5kaW5nIG9mIHRoZSBjb250ZXh0IG11c3QgaGF2ZSAkJFBhdGNoV2l0aG91dFNpZGVFZmZlY3RzIHRydWUsIHRoaXMgYm91bmQgY29udGV4dCBtYXkgYmUgbmVlZGVkIHRvIGJlIGZldGNoZWQgZnJvbSB0aGUgZGVwZW5kZW50IGJpbmRpbmdcblx0XHRnZXRCaW5kaW5nUGF0aHMob0JpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcoKSk7XG5cblx0XHRsZXQgaTtcblx0XHRmb3IgKGkgPSAwOyBpIDwgYU5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRvU2lkZUVmZmVjdHMuVGFyZ2V0RW50aXRpZXMucHVzaCh7XG5cdFx0XHRcdCROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBhTmF2aWdhdGlvblByb3BlcnR5UGF0aHNbaV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRvU2lkZUVmZmVjdHMuVGFyZ2V0UHJvcGVydGllcyA9IGFQcm9wZXJ0eVBhdGhzO1xuXHRcdGlmIChzTWVzc2FnZXNQYXRoKSB7XG5cdFx0XHRvU2lkZUVmZmVjdHMuVGFyZ2V0UHJvcGVydGllcy5wdXNoKHNNZXNzYWdlc1BhdGgpO1xuXHRcdH1cblx0XHQvL2FsbCB0aGlzIGxvZ2ljIHRvIGJlIHJlcGxhY2VkIHdpdGggYSBTaWRlRWZmZWN0cyByZXF1ZXN0IGZvciBhbiBlbXB0eSBwYXRoIChyZWZyZXNoIGV2ZXJ5dGhpbmcpLCBhZnRlciB0ZXN0aW5nIHRyYW5zaWVudCBjb250ZXh0c1xuXHRcdG9TaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzID0gb1NpZGVFZmZlY3RzLlRhcmdldFByb3BlcnRpZXMubWFwKChzVGFyZ2V0UHJvcGVydHk6IFN0cmluZykgPT4ge1xuXHRcdFx0aWYgKHNUYXJnZXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRjb25zdCBpbmRleCA9IHNUYXJnZXRQcm9wZXJ0eS5pbmRleE9mKFwiL1wiKTtcblx0XHRcdFx0aWYgKGluZGV4ID4gMCkge1xuXHRcdFx0XHRcdC8vIG9ubHkgcmVxdWVzdCB0aGUgbmF2aWdhdGlvbiBwYXRoIGFuZCBub3QgdGhlIHByb3BlcnR5IHBhdGhzIGZ1cnRoZXJcblx0XHRcdFx0XHRyZXR1cm4gc1RhcmdldFByb3BlcnR5LnNsaWNlKDAsIGluZGV4KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gc1RhcmdldFByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdC8vIE9EYXRhIG1vZGVsIHdpbGwgdGFrZSBjYXJlIG9mIGR1cGxpY2F0ZXNcblx0XHRvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhvU2lkZUVmZmVjdHMuVGFyZ2V0RW50aXRpZXMuY29uY2F0KG9TaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzKSwgb0JpbmRpbmdDb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2Ugb3IgdGhlIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9nZXRCaW5kaW5nQ29udGV4dCgpOiBDb250ZXh0IHwgbnVsbCB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKHRoaXMuX29QYWdlQ29tcG9uZW50KSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fb1BhZ2VDb21wb25lbnQuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2Ugb3IgdGhlIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBiaW5kaW5nIGNvbnRleHRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfc2V0QmluZGluZ0NvbnRleHQob0NvbnRleHQ6IGFueSkge1xuXHRcdGxldCBvUHJldmlvdXNDb250ZXh0LCBvVGFyZ2V0Q29udHJvbDtcblx0XHRpZiAodGhpcy5fb1BhZ2VDb21wb25lbnQpIHtcblx0XHRcdG9QcmV2aW91c0NvbnRleHQgPSB0aGlzLl9vUGFnZUNvbXBvbmVudC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRvVGFyZ2V0Q29udHJvbCA9IHRoaXMuX29QYWdlQ29tcG9uZW50O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJldmlvdXNDb250ZXh0ID0gdGhpcy5fb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdFx0b1RhcmdldENvbnRyb2wgPSB0aGlzLl9vVmlldztcblx0XHR9XG5cblx0XHRvVGFyZ2V0Q29udHJvbC5zZXRCaW5kaW5nQ29udGV4dChvQ29udGV4dCk7XG5cblx0XHRpZiAob1ByZXZpb3VzQ29udGV4dD8uaXNLZWVwQWxpdmUoKSAmJiBvUHJldmlvdXNDb250ZXh0ICE9PSBvQ29udGV4dCkge1xuXHRcdFx0dGhpcy5fc2V0S2VlcEFsaXZlKG9QcmV2aW91c0NvbnRleHQsIGZhbHNlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgZmxleGlibGUgY29sdW1uIGxheW91dCAoRkNMKSBsZXZlbCBjb3JyZXNwb25kaW5nIHRvIHRoZSB2aWV3ICgtMSBpZiB0aGUgYXBwIGlzIG5vdCBGQ0wpLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgbGV2ZWxcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfZ2V0RkNMTGV2ZWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX29UYXJnZXRJbmZvcm1hdGlvbi5GQ0xMZXZlbDtcblx0fVxuXG5cdF9zZXRLZWVwQWxpdmUob0NvbnRleHQ6IENvbnRleHQsIGJLZWVwQWxpdmU6IGJvb2xlYW4sIGZuQmVmb3JlRGVzdHJveT86IEZ1bmN0aW9uLCBiUmVxdWVzdE1lc3NhZ2VzPzogYm9vbGVhbikge1xuXHRcdGlmIChvQ29udGV4dC5nZXRQYXRoKCkuZW5kc1dpdGgoXCIpXCIpKSB7XG5cdFx0XHQvLyBXZSBrZWVwIHRoZSBjb250ZXh0IGFsaXZlIG9ubHkgaWYgdGhleSdyZSBwYXJ0IG9mIGEgY29sbGVjdGlvbiwgaS5lLiBpZiB0aGUgcGF0aCBlbmRzIHdpdGggYSAnKSdcblx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0Y29uc3Qgc01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0Y29uc3Qgc01lc3NhZ2VzUGF0aCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NZXNzYWdlcy8kUGF0aGApO1xuXHRcdFx0b0NvbnRleHQuc2V0S2VlcEFsaXZlKGJLZWVwQWxpdmUsIGZuQmVmb3JlRGVzdHJveSwgISFzTWVzc2FnZXNQYXRoICYmIGJSZXF1ZXN0TWVzc2FnZXMpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRLZWVwQWxpdmVDb250ZXh0KG9Nb2RlbDogT0RhdGFNb2RlbCwgcGF0aDogc3RyaW5nLCBiUmVxdWVzdE1lc3NhZ2VzPzogYm9vbGVhbiwgcGFyYW1ldGVycz86IGFueSk6IENvbnRleHQgfCB1bmRlZmluZWQge1xuXHRcdC8vIEdldCB0aGUgcGF0aCBmb3IgdGhlIGNvbnRleHQgdGhhdCBpcyByZWFsbHkga2VwdCBhbGl2ZSAocGFydCBvZiBhIGNvbGxlY3Rpb24pXG5cdFx0Ly8gaS5lLiByZW1vdmUgYWxsIHNlZ21lbnRzIG5vdCBlbmRpbmcgd2l0aCBhICcpJ1xuXHRcdGNvbnN0IGtlcHRBbGl2ZVNlZ21lbnRzID0gcGF0aC5zcGxpdChcIi9cIik7XG5cdFx0Y29uc3QgYWRkaXRpb25uYWxTZWdtZW50czogc3RyaW5nW10gPSBbXTtcblx0XHR3aGlsZSAoa2VwdEFsaXZlU2VnbWVudHMubGVuZ3RoICYmICFrZXB0QWxpdmVTZWdtZW50c1trZXB0QWxpdmVTZWdtZW50cy5sZW5ndGggLSAxXS5lbmRzV2l0aChcIilcIikpIHtcblx0XHRcdGFkZGl0aW9ubmFsU2VnbWVudHMucHVzaChrZXB0QWxpdmVTZWdtZW50cy5wb3AoKSEpO1xuXHRcdH1cblxuXHRcdGlmIChrZXB0QWxpdmVTZWdtZW50cy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Y29uc3Qga2VwdEFsaXZlUGF0aCA9IGtlcHRBbGl2ZVNlZ21lbnRzLmpvaW4oXCIvXCIpO1xuXHRcdGNvbnN0IG9LZWVwQWxpdmVDb250ZXh0ID0gb01vZGVsLmdldEtlZXBBbGl2ZUNvbnRleHQoa2VwdEFsaXZlUGF0aCwgYlJlcXVlc3RNZXNzYWdlcywgcGFyYW1ldGVycyk7XG5cblx0XHRpZiAoYWRkaXRpb25uYWxTZWdtZW50cy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBvS2VlcEFsaXZlQ29udGV4dDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YWRkaXRpb25uYWxTZWdtZW50cy5yZXZlcnNlKCk7XG5cdFx0XHRjb25zdCBhZGRpdGlvbm5hbFBhdGggPSBhZGRpdGlvbm5hbFNlZ21lbnRzLmpvaW4oXCIvXCIpO1xuXHRcdFx0cmV0dXJuIG9Nb2RlbC5iaW5kQ29udGV4dChhZGRpdGlvbm5hbFBhdGgsIG9LZWVwQWxpdmVDb250ZXh0KS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU3dpdGNoZXMgYmV0d2VlbiBjb2x1bW4gYW5kIGZ1bGwtc2NyZWVuIG1vZGUgd2hlbiBGQ0wgaXMgdXNlZC5cblx0ICpcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRzd2l0Y2hGdWxsU2NyZWVuKCkge1xuXHRcdGNvbnN0IG9Tb3VyY2UgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHRcdGNvbnN0IG9GQ0xIZWxwZXJNb2RlbCA9IG9Tb3VyY2UuZ2V0TW9kZWwoXCJmY2xoZWxwZXJcIiksXG5cdFx0XHRiSXNGdWxsU2NyZWVuID0gb0ZDTEhlbHBlck1vZGVsLmdldFByb3BlcnR5KFwiL2FjdGlvbkJ1dHRvbnNJbmZvL2lzRnVsbFNjcmVlblwiKSxcblx0XHRcdHNOZXh0TGF5b3V0ID0gb0ZDTEhlbHBlck1vZGVsLmdldFByb3BlcnR5KFxuXHRcdFx0XHRiSXNGdWxsU2NyZWVuID8gXCIvYWN0aW9uQnV0dG9uc0luZm8vZXhpdEZ1bGxTY3JlZW5cIiA6IFwiL2FjdGlvbkJ1dHRvbnNJbmZvL2Z1bGxTY3JlZW5cIlxuXHRcdFx0KSxcblx0XHRcdG9Sb290Vmlld0NvbnRyb2xsZXIgPSAodGhpcy5fb0FwcENvbXBvbmVudCBhcyBhbnkpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpO1xuXG5cdFx0Y29uc3Qgb0NvbnRleHQgPSBvUm9vdFZpZXdDb250cm9sbGVyLmdldFJpZ2h0bW9zdENvbnRleHQgPyBvUm9vdFZpZXdDb250cm9sbGVyLmdldFJpZ2h0bW9zdENvbnRleHQoKSA6IG9Tb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKTtcblxuXHRcdHRoaXMuYmFzZS5fcm91dGluZy5uYXZpZ2F0ZVRvQ29udGV4dChvQ29udGV4dCwgeyBzTGF5b3V0OiBzTmV4dExheW91dCB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRMb2cud2FybmluZyhcImNhbm5vdCBzd2l0Y2ggYmV0d2VlbiBjb2x1bW4gYW5kIGZ1bGxzY3JlZW5cIik7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2xvc2VzIHRoZSBjb2x1bW4gZm9yIHRoZSBjdXJyZW50IHZpZXcgaW4gYSBGQ0wuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkJlZm9yZSlcblx0Y2xvc2VDb2x1bW4oKSB7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gdGhpcy5fb1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnk7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLl9vVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3QgbmF2aWdhdGlvblBhcmFtZXRlcnMgPSB7XG5cdFx0XHRub1ByZXNlcnZhdGlvbkNhY2hlOiB0cnVlLFxuXHRcdFx0c0xheW91dDogdGhpcy5fb1ZpZXcuZ2V0TW9kZWwoXCJmY2xoZWxwZXJcIikuZ2V0UHJvcGVydHkoXCIvYWN0aW9uQnV0dG9uc0luZm8vY2xvc2VDb2x1bW5cIilcblx0XHR9O1xuXG5cdFx0aWYgKG9WaWV3RGF0YT8udmlld0xldmVsID09PSAxICYmIE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob01ldGFNb2RlbCwgb0NvbnRleHQuZ2V0UGF0aCgpKSkge1xuXHRcdFx0ZHJhZnQucHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24oXG5cdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0LCBuYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZSxcblx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdHRoaXMuX29WaWV3LmdldENvbnRyb2xsZXIoKSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGRyYWZ0Lk5hdmlnYXRpb25UeXBlLkJhY2tOYXZpZ2F0aW9uXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0LCBuYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEludGVybmFsUm91dGluZztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7RUE4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVBBLElBU01BLGVBQWUsV0FEcEJDLGNBQWMsQ0FBQyxrREFBa0QsQ0FBQyxVQVlqRUMsY0FBYyxFQUFFLFVBT2hCQSxjQUFjLEVBQUUsVUFvQ2hCQyxlQUFlLEVBQUUsVUFDakJDLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLEtBQUssQ0FBQyxVQUtuQ0gsZUFBZSxFQUFFLFVBQ2pCQyxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLLENBQUMsVUFLbkNILGVBQWUsRUFBRSxVQUNqQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFdBUW5DSCxlQUFlLEVBQUUsV0FDakJDLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLEtBQUssQ0FBQyxXQXNCbkNILGVBQWUsRUFBRSxXQXlCakJBLGVBQWUsRUFBRSxXQWFqQkEsZUFBZSxFQUFFLFdBQ2pCSSxjQUFjLEVBQUUs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