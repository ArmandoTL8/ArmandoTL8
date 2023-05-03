/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/routing/NavigationReason", "sap/fe/core/helpers/AppStartupHelper", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/suite/ui/commons/collaboration/CollaborationHelper", "sap/ui/base/BindingParser", "sap/ui/base/EventProvider", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/model/odata/v4/ODataUtils"], function (Log, BusyLocker, messageHandling, Placeholder, NavigationReason, AppStartupHelper, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, CollaborationHelper, BindingParser, EventProvider, Service, ServiceFactory, ODataUtils) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RoutingServiceEventing = (_dec = defineUI5Class("sap.fe.core.services.RoutingServiceEventing"), _dec2 = event(), _dec3 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_EventProvider) {
    _inheritsLoose(RoutingServiceEventing, _EventProvider);
    function RoutingServiceEventing() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _EventProvider.call(this, ...args) || this;
      _initializerDefineProperty(_this, "routeMatched", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterRouteMatched", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    return RoutingServiceEventing;
  }(EventProvider), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "routeMatched", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "afterRouteMatched", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  let RoutingService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(RoutingService, _Service);
    function RoutingService() {
      var _this2;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      _this2 = _Service.call(this, ...args) || this;
      _this2.navigationInfoQueue = [];
      return _this2;
    }
    _exports.RoutingService = RoutingService;
    var _proto = RoutingService.prototype;
    _proto.init = function init() {
      const oContext = this.getContext();
      if (oContext.scopeType === "component") {
        var _oAppConfig$crossNavi;
        this.oAppComponent = oContext.scopeObject;
        this.oModel = this.oAppComponent.getModel();
        this.oMetaModel = this.oModel.getMetaModel();
        this.oRouter = this.oAppComponent.getRouter();
        this.oRouterProxy = this.oAppComponent.getRouterProxy();
        this.eventProvider = new RoutingServiceEventing();
        const oRoutingConfig = this.oAppComponent.getManifestEntry("sap.ui5").routing;
        this._parseRoutingConfiguration(oRoutingConfig);
        const oAppConfig = this.oAppComponent.getManifestEntry("sap.app");
        this.outbounds = (_oAppConfig$crossNavi = oAppConfig.crossNavigation) === null || _oAppConfig$crossNavi === void 0 ? void 0 : _oAppConfig$crossNavi.outbounds;
      }
      this.initPromise = Promise.resolve(this);
    };
    _proto.beforeExit = function beforeExit() {
      this.oRouter.detachRouteMatched(this._fnOnRouteMatched, this);
      this.eventProvider.fireEvent("routeMatched", {});
    };
    _proto.exit = function exit() {
      this.eventProvider.destroy();
    }

    /**
     * Parse a manifest routing configuration for internal usage.
     *
     * @param oRoutingConfig The routing configuration from the manifest
     * @private
     */;
    _proto._parseRoutingConfiguration = function _parseRoutingConfiguration(oRoutingConfig) {
      var _oRoutingConfig$confi;
      const isFCL = (oRoutingConfig === null || oRoutingConfig === void 0 ? void 0 : (_oRoutingConfig$confi = oRoutingConfig.config) === null || _oRoutingConfig$confi === void 0 ? void 0 : _oRoutingConfig$confi.routerClass) === "sap.f.routing.Router";

      // Information of targets
      this._mTargets = {};
      Object.keys(oRoutingConfig.targets).forEach(sTargetName => {
        this._mTargets[sTargetName] = Object.assign({
          targetName: sTargetName
        }, oRoutingConfig.targets[sTargetName]);

        // View level for FCL cases is calculated from the target pattern
        if (this._mTargets[sTargetName].contextPattern !== undefined) {
          this._mTargets[sTargetName].viewLevel = this._getViewLevelFromPattern(this._mTargets[sTargetName].contextPattern, 0);
        }
      });

      // Information of routes
      this._mRoutes = {};
      for (const sRouteKey in oRoutingConfig.routes) {
        const oRouteManifestInfo = oRoutingConfig.routes[sRouteKey],
          aRouteTargets = Array.isArray(oRouteManifestInfo.target) ? oRouteManifestInfo.target : [oRouteManifestInfo.target],
          sRouteName = Array.isArray(oRoutingConfig.routes) ? oRouteManifestInfo.name : sRouteKey,
          sRoutePattern = oRouteManifestInfo.pattern;

        // Check route pattern: all patterns need to end with ':?query:', that we use for parameters
        if (sRoutePattern.length < 8 || sRoutePattern.indexOf(":?query:") !== sRoutePattern.length - 8) {
          Log.warning(`Pattern for route ${sRouteName} doesn't end with ':?query:' : ${sRoutePattern}`);
        }
        const iRouteLevel = this._getViewLevelFromPattern(sRoutePattern, 0);
        this._mRoutes[sRouteName] = {
          name: sRouteName,
          pattern: sRoutePattern,
          targets: aRouteTargets,
          routeLevel: iRouteLevel
        };

        // Add the parent targets in the list of targets for the route
        for (let i = 0; i < aRouteTargets.length; i++) {
          const sParentTargetName = this._mTargets[aRouteTargets[i]].parent;
          if (sParentTargetName) {
            aRouteTargets.push(sParentTargetName);
          }
        }
        if (!isFCL) {
          // View level for non-FCL cases is calculated from the route pattern
          if (this._mTargets[aRouteTargets[0]].viewLevel === undefined || this._mTargets[aRouteTargets[0]].viewLevel < iRouteLevel) {
            // There are cases when different routes point to the same target. We take the
            // largest viewLevel in that case.
            this._mTargets[aRouteTargets[0]].viewLevel = iRouteLevel;
          }

          // FCL level for non-FCL cases is equal to -1
          this._mTargets[aRouteTargets[0]].FCLLevel = -1;
        } else if (aRouteTargets.length === 1 && this._mTargets[aRouteTargets[0]].controlAggregation !== "beginColumnPages") {
          // We're in the case where there's only 1 target for the route, and it's not in the first column
          // --> this is a fullscreen column after all columns in the FCL have been used
          this._mTargets[aRouteTargets[0]].FCLLevel = 3;
        } else {
          // Other FCL cases
          aRouteTargets.forEach(sTargetName => {
            switch (this._mTargets[sTargetName].controlAggregation) {
              case "beginColumnPages":
                this._mTargets[sTargetName].FCLLevel = 0;
                break;
              case "midColumnPages":
                this._mTargets[sTargetName].FCLLevel = 1;
                break;
              default:
                this._mTargets[sTargetName].FCLLevel = 2;
            }
          });
        }
      }

      // Propagate viewLevel, contextPattern, FCLLevel and controlAggregation to parent targets
      Object.keys(this._mTargets).forEach(sTargetName => {
        while (this._mTargets[sTargetName].parent) {
          const sParentTargetName = this._mTargets[sTargetName].parent;
          this._mTargets[sParentTargetName].viewLevel = this._mTargets[sParentTargetName].viewLevel || this._mTargets[sTargetName].viewLevel;
          this._mTargets[sParentTargetName].contextPattern = this._mTargets[sParentTargetName].contextPattern || this._mTargets[sTargetName].contextPattern;
          this._mTargets[sParentTargetName].FCLLevel = this._mTargets[sParentTargetName].FCLLevel || this._mTargets[sTargetName].FCLLevel;
          this._mTargets[sParentTargetName].controlAggregation = this._mTargets[sParentTargetName].controlAggregation || this._mTargets[sTargetName].controlAggregation;
          sTargetName = sParentTargetName;
        }
      });

      // Determine the root entity for the app
      const aLevel0RouteNames = [];
      const aLevel1RouteNames = [];
      let sDefaultRouteName;
      for (const sName in this._mRoutes) {
        const iLevel = this._mRoutes[sName].routeLevel;
        if (iLevel === 0) {
          aLevel0RouteNames.push(sName);
        } else if (iLevel === 1) {
          aLevel1RouteNames.push(sName);
        }
      }
      if (aLevel0RouteNames.length === 1) {
        sDefaultRouteName = aLevel0RouteNames[0];
      } else if (aLevel1RouteNames.length === 1) {
        sDefaultRouteName = aLevel1RouteNames[0];
      }
      if (sDefaultRouteName) {
        const sDefaultTargetName = this._mRoutes[sDefaultRouteName].targets.slice(-1)[0];
        this.sContextPath = "";
        if (this._mTargets[sDefaultTargetName].options && this._mTargets[sDefaultTargetName].options.settings) {
          const oSettings = this._mTargets[sDefaultTargetName].options.settings;
          this.sContextPath = oSettings.contextPath || `/${oSettings.entitySet}`;
        }
        if (!this.sContextPath) {
          Log.warning(`Cannot determine default contextPath: contextPath or entitySet missing in default target: ${sDefaultTargetName}`);
        }
      } else {
        Log.warning("Cannot determine default contextPath: no default route found.");
      }

      // We need to establish the correct path to the different pages, including the navigation properties
      Object.keys(this._mTargets).map(sTargetKey => {
        return this._mTargets[sTargetKey];
      }).sort((a, b) => {
        return a.viewLevel < b.viewLevel ? -1 : 1;
      }).forEach(target => {
        // After sorting the targets per level we can then go through their navigation object and update the paths accordingly.
        if (target.options) {
          const settings = target.options.settings;
          const sContextPath = settings.contextPath || (settings.entitySet ? `/${settings.entitySet}` : "");
          if (!settings.fullContextPath && sContextPath) {
            settings.fullContextPath = `${sContextPath}/`;
          }
          Object.keys(settings.navigation || {}).forEach(sNavName => {
            // Check if it's a navigation property
            const targetRoute = this._mRoutes[settings.navigation[sNavName].detail.route];
            if (targetRoute && targetRoute.targets) {
              targetRoute.targets.forEach(sTargetName => {
                if (this._mTargets[sTargetName].options && this._mTargets[sTargetName].options.settings && !this._mTargets[sTargetName].options.settings.fullContextPath) {
                  if (target.viewLevel === 0) {
                    this._mTargets[sTargetName].options.settings.fullContextPath = `${(sNavName.startsWith("/") ? "" : "/") + sNavName}/`;
                  } else {
                    this._mTargets[sTargetName].options.settings.fullContextPath = `${settings.fullContextPath + sNavName}/`;
                  }
                }
              });
            }
          });
        }
      });
    }

    /**
     * Calculates a view level from a pattern by counting the number of segments.
     *
     * @param sPattern The pattern
     * @param viewLevel The current level of view
     * @returns The level
     */;
    _proto._getViewLevelFromPattern = function _getViewLevelFromPattern(sPattern, viewLevel) {
      sPattern = sPattern.replace(":?query:", "");
      const regex = new RegExp("/[^/]*$");
      if (sPattern && sPattern[0] !== "/" && sPattern[0] !== "?") {
        sPattern = `/${sPattern}`;
      }
      if (sPattern.length) {
        sPattern = sPattern.replace(regex, "");
        if (this.oRouter.match(sPattern) || sPattern === "") {
          return this._getViewLevelFromPattern(sPattern, ++viewLevel);
        } else {
          return this._getViewLevelFromPattern(sPattern, viewLevel);
        }
      } else {
        return viewLevel;
      }
    };
    _proto._getRouteInformation = function _getRouteInformation(sRouteName) {
      return this._mRoutes[sRouteName];
    };
    _proto._getTargetInformation = function _getTargetInformation(sTargetName) {
      return this._mTargets[sTargetName];
    };
    _proto._getComponentId = function _getComponentId(sOwnerId, sComponentId) {
      if (sComponentId.indexOf(`${sOwnerId}---`) === 0) {
        return sComponentId.substr(sOwnerId.length + 3);
      }
      return sComponentId;
    }

    /**
     * Get target information for a given component.
     *
     * @param oComponentInstance Instance of the component
     * @returns The configuration for the target
     */;
    _proto.getTargetInformationFor = function getTargetInformationFor(oComponentInstance) {
      const sTargetComponentId = this._getComponentId(oComponentInstance._sOwnerId, oComponentInstance.getId());
      let sCorrectTargetName = null;
      Object.keys(this._mTargets).forEach(sTargetName => {
        if (this._mTargets[sTargetName].id === sTargetComponentId || this._mTargets[sTargetName].viewId === sTargetComponentId) {
          sCorrectTargetName = sTargetName;
        }
      });
      return this._getTargetInformation(sCorrectTargetName);
    };
    _proto.getLastSemanticMapping = function getLastSemanticMapping() {
      return this.oLastSemanticMapping;
    };
    _proto.setLastSemanticMapping = function setLastSemanticMapping(oMapping) {
      this.oLastSemanticMapping = oMapping;
    };
    _proto.navigateTo = function navigateTo(oContext, sRouteName, mParameterMapping, bPreserveHistory) {
      let sTargetURLPromise, bIsStickyMode;
      if (oContext.getModel() && oContext.getModel().getMetaModel && oContext.getModel().getMetaModel()) {
        bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
      }
      if (!mParameterMapping) {
        // if there is no parameter mapping define this mean we rely entirely on the binding context path
        sTargetURLPromise = Promise.resolve(SemanticKeyHelper.getSemanticPath(oContext));
      } else {
        sTargetURLPromise = this.prepareParameters(mParameterMapping, sRouteName, oContext).then(mParameters => {
          return this.oRouter.getURL(sRouteName, mParameters);
        });
      }
      return sTargetURLPromise.then(sTargetURL => {
        this.oRouterProxy.navToHash(sTargetURL, bPreserveHistory, false, false, !bIsStickyMode);
      });
    }

    /**
     * Method to return a map of routing target parameters where the binding syntax is resolved to the current model.
     *
     * @param mParameters Parameters map in the format [k: string] : ComplexBindingSyntax
     * @param sTargetRoute Name of the target route
     * @param oContext The instance of the binding context
     * @returns A promise which resolves to the routing target parameters
     */;
    _proto.prepareParameters = function prepareParameters(mParameters, sTargetRoute, oContext) {
      let oParametersPromise;
      try {
        const sContextPath = oContext.getPath();
        const oMetaModel = oContext.getModel().getMetaModel();
        const aContextPathParts = sContextPath.split("/");
        const aAllResolvedParameterPromises = Object.keys(mParameters).map(sParameterKey => {
          const sParameterMappingExpression = mParameters[sParameterKey];
          // We assume the defined parameters will be compatible with a binding expression
          const oParsedExpression = BindingParser.complexParser(sParameterMappingExpression);
          const aParts = oParsedExpression.parts || [oParsedExpression];
          const aResolvedParameterPromises = aParts.map(function (oPathPart) {
            const aRelativeParts = oPathPart.path.split("../");
            // We go up the current context path as many times as necessary
            const aLocalParts = aContextPathParts.slice(0, aContextPathParts.length - aRelativeParts.length + 1);
            aLocalParts.push(aRelativeParts[aRelativeParts.length - 1]);
            const sPropertyPath = aLocalParts.join("/");
            const oMetaContext = oMetaModel.getMetaContext(sPropertyPath);
            return oContext.requestProperty(sPropertyPath).then(function (oValue) {
              const oPropertyInfo = oMetaContext.getObject();
              const sEdmType = oPropertyInfo.$Type;
              return ODataUtils.formatLiteral(oValue, sEdmType);
            });
          });
          return Promise.all(aResolvedParameterPromises).then(aResolvedParameters => {
            const value = oParsedExpression.formatter ? oParsedExpression.formatter.apply(this, aResolvedParameters) : aResolvedParameters.join("");
            return {
              key: sParameterKey,
              value: value
            };
          });
        });
        oParametersPromise = Promise.all(aAllResolvedParameterPromises).then(function (aAllResolvedParameters) {
          const oParameters = {};
          aAllResolvedParameters.forEach(function (oResolvedParameter) {
            oParameters[oResolvedParameter.key] = oResolvedParameter.value;
          });
          return oParameters;
        });
      } catch (oError) {
        Log.error(`Could not parse the parameters for the navigation to route ${sTargetRoute}`);
        oParametersPromise = Promise.resolve(undefined);
      }
      return oParametersPromise;
    };
    _proto._fireRouteMatchEvents = function _fireRouteMatchEvents(mParameters) {
      this.eventProvider.fireEvent("routeMatched", mParameters);
      this.eventProvider.fireEvent("afterRouteMatched", mParameters);
      EditState.cleanProcessedEditState(); // Reset UI state when all bindings have been refreshed
    }

    /**
     * Navigates to a context.
     *
     * @param oContext The Context to be navigated to
     * @param [mParameters] Optional, map containing the following attributes:
     * @param [mParameters.checkNoHashChange] Navigate to the context without changing the URL
     * @param [mParameters.asyncContext] The context is created async, navigate to (...) and
     *                    wait for Promise to be resolved and then navigate into the context
     * @param [mParameters.bDeferredContext] The context shall be created deferred at the target page
     * @param [mParameters.editable] The target page shall be immediately in the edit mode to avoid flickering
     * @param [mParameters.bPersistOPScroll] The bPersistOPScroll will be used for scrolling to first tab
     * @param [mParameters.updateFCLLevel] `+1` if we add a column in FCL, `-1` to remove a column, 0 to stay on the same column
     * @param [mParameters.noPreservationCache] Do navigation without taking into account the preserved cache mechanism
     * @param [mParameters.bRecreateContext] Force re-creation of the context instead of using the one passed as parameter
     * @param [mParameters.bForceFocus] Forces focus selection after navigation
     * @param [oViewData] View data
     * @param [oCurrentTargetInfo] The target information from which the navigation is triggered
     * @returns Promise which is resolved once the navigation is triggered
     * @ui5-restricted
     * @final
     */;
    _proto.navigateToContext = function navigateToContext(oContext, mParameters, oViewData, oCurrentTargetInfo) {
      let sTargetRoute = "",
        oRouteParametersPromise,
        bIsStickyMode = false;
      if (oContext.getModel() && oContext.getModel().getMetaModel) {
        bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
      }
      // Manage parameter mapping
      if (mParameters && mParameters.targetPath && oViewData && oViewData.navigation) {
        const oRouteDetail = oViewData.navigation[mParameters.targetPath].detail;
        sTargetRoute = oRouteDetail.route;
        if (oRouteDetail.parameters) {
          oRouteParametersPromise = this.prepareParameters(oRouteDetail.parameters, sTargetRoute, oContext);
        }
      }
      let sTargetPath = this._getPathFromContext(oContext, mParameters);
      // If the path is empty, we're supposed to navigate to the first page of the app
      // Check if we need to exit from the app instead
      if (sTargetPath.length === 0 && this.bExitOnNavigateBackToRoot) {
        this.oRouterProxy.exitFromApp();
        return Promise.resolve(true);
      }

      // If the context is deferred or async, we add (...) to the path
      if (mParameters !== null && mParameters !== void 0 && mParameters.asyncContext || mParameters !== null && mParameters !== void 0 && mParameters.bDeferredContext) {
        sTargetPath += "(...)";
      }

      // Add layout parameter if needed
      const sLayout = this._calculateLayout(sTargetPath, mParameters);
      if (sLayout) {
        sTargetPath += `?layout=${sLayout}`;
      }

      // Navigation parameters for later usage
      const oNavigationInfo = {
        oAsyncContext: mParameters === null || mParameters === void 0 ? void 0 : mParameters.asyncContext,
        bDeferredContext: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bDeferredContext,
        bTargetEditable: mParameters === null || mParameters === void 0 ? void 0 : mParameters.editable,
        bPersistOPScroll: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bPersistOPScroll,
        useContext: (mParameters === null || mParameters === void 0 ? void 0 : mParameters.updateFCLLevel) === -1 || mParameters !== null && mParameters !== void 0 && mParameters.bRecreateContext ? undefined : oContext,
        bDraftNavigation: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bDraftNavigation,
        bShowPlaceholder: (mParameters === null || mParameters === void 0 ? void 0 : mParameters.showPlaceholder) !== undefined ? mParameters === null || mParameters === void 0 ? void 0 : mParameters.showPlaceholder : true,
        reason: mParameters === null || mParameters === void 0 ? void 0 : mParameters.reason
      };
      if (mParameters !== null && mParameters !== void 0 && mParameters.checkNoHashChange) {
        // Check if the new hash is different from the current one
        const sCurrentHashNoAppState = this.oRouterProxy.getHash().replace(/[&?]{1}sap-iapp-state=[A-Z0-9]+/, "");
        if (sTargetPath === sCurrentHashNoAppState) {
          // The hash doesn't change, but we fire the routeMatch event to trigger page refresh / binding
          const mEventParameters = this.oRouter.getRouteInfoByHash(this.oRouterProxy.getHash());
          if (mEventParameters) {
            mEventParameters.navigationInfo = oNavigationInfo;
            mEventParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
            mEventParameters.routePattern = this.sCurrentRoutePattern;
            mEventParameters.views = this.aCurrentViews;
          }
          this.oRouterProxy.setFocusForced(!!mParameters.bForceFocus);
          this._fireRouteMatchEvents(mEventParameters);
          return Promise.resolve(true);
        }
      }
      if (mParameters !== null && mParameters !== void 0 && mParameters.transient && mParameters.editable == true && sTargetPath.indexOf("(...)") === -1) {
        if (sTargetPath.indexOf("?") > -1) {
          sTargetPath += "&i-action=create";
        } else {
          sTargetPath += "?i-action=create";
        }
      }

      // Clear unbound messages upon navigating from LR to OP
      // This is to ensure stale error messages from LR are not shown to the user after navigation to OP.
      if (oCurrentTargetInfo && oCurrentTargetInfo.name === "sap.fe.templates.ListReport") {
        const oRouteInfo = this.oRouter.getRouteInfoByHash(sTargetPath);
        if (oRouteInfo) {
          const oRoute = this._getRouteInformation(oRouteInfo.name);
          if (oRoute && oRoute.targets && oRoute.targets.length > 0) {
            const sLastTargetName = oRoute.targets[oRoute.targets.length - 1];
            const oTarget = this._getTargetInformation(sLastTargetName);
            if (oTarget && oTarget.name === "sap.fe.templates.ObjectPage") {
              messageHandling.removeUnboundTransitionMessages();
            }
          }
        }
      }

      // Add the navigation parameters in the queue
      this.navigationInfoQueue.push(oNavigationInfo);
      if (sTargetRoute && oRouteParametersPromise) {
        return oRouteParametersPromise.then(oRouteParameters => {
          oRouteParameters.bIsStickyMode = bIsStickyMode;
          this.oRouter.navTo(sTargetRoute, oRouteParameters);
          return Promise.resolve(true);
        });
      }
      return this.oRouterProxy.navToHash(sTargetPath, false, mParameters === null || mParameters === void 0 ? void 0 : mParameters.noPreservationCache, mParameters === null || mParameters === void 0 ? void 0 : mParameters.bForceFocus, !bIsStickyMode).then(bNavigated => {
        if (!bNavigated) {
          // The navigation did not happen --> remove the navigation parameters from the queue as they shouldn't be used
          this.navigationInfoQueue.pop();
        }
        return bNavigated;
      });
    }

    /**
     * Navigates to a route.
     *
     * @function
     * @name sap.fe.core.controllerextensions.Routing#navigateToRoute
     * @memberof sap.fe.core.controllerextensions.Routing
     * @static
     * @param sTargetRouteName Name of the target route
     * @param [oRouteParameters] Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @ui5-restricted
     * @final
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oRouteParameters) {
      const sTargetURL = this.oRouter.getURL(sTargetRouteName, oRouteParameters);
      return this.oRouterProxy.navToHash(sTargetURL, undefined, undefined, undefined, !oRouteParameters.bIsStickyMode);
    }

    /**
     * Checks if one of the current views on the screen is bound to a given context.
     *
     * @param oContext The context
     * @returns `true` or `false` if the current state is impacted or not
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(oContext) {
      const sPath = oContext.getPath();

      // First, check with the technical path. We have to try it, because for level > 1, we
      // uses technical keys even if Semantic keys are enabled
      if (this.oRouterProxy.isCurrentStateImpactedBy(sPath)) {
        return true;
      } else if (/^[^\(\)]+\([^\(\)]+\)$/.test(sPath)) {
        // If the current path can be semantic (i.e. is like xxx(yyy))
        // check with the semantic path if we can find it
        let sSemanticPath;
        if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
          // We have already resolved this semantic path
          sSemanticPath = this.oLastSemanticMapping.semanticPath;
        } else {
          sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext);
        }
        return sSemanticPath != sPath ? this.oRouterProxy.isCurrentStateImpactedBy(sSemanticPath) : false;
      } else {
        return false;
      }
    };
    _proto._findPathToNavigate = function _findPathToNavigate(sPath) {
      const regex = new RegExp("/[^/]*$");
      sPath = sPath.replace(regex, "");
      if (this.oRouter.match(sPath) || sPath === "") {
        return sPath;
      } else {
        return this._findPathToNavigate(sPath);
      }
    };
    _proto._checkIfContextSupportsSemanticPath = function _checkIfContextSupportsSemanticPath(oContext) {
      const sPath = oContext.getPath();

      // First, check if this is a level-1 object (path = /aaa(bbb))
      if (!/^\/[^\(]+\([^\)]+\)$/.test(sPath)) {
        return false;
      }

      // Then check if the entity has semantic keys
      const oMetaModel = oContext.getModel().getMetaModel();
      const sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name");
      if (!SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName)) {
        return false;
      }

      // Then check the entity is draft-enabled
      return ModelHelper.isDraftSupported(oMetaModel, sPath);
    };
    _proto._getPathFromContext = function _getPathFromContext(oContext, mParameters) {
      let sPath;
      if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding") && oContext.isRelative()) {
        sPath = oContext.getHeaderContext().getPath();
      } else {
        sPath = oContext.getPath();
      }
      if (mParameters.updateFCLLevel === -1) {
        // When navigating back from a context, we need to remove the last component of the path
        sPath = this._findPathToNavigate(sPath);

        // Check if we're navigating back to a semantic path that was previously resolved
        if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
          sPath = this.oLastSemanticMapping.semanticPath;
        }
      } else if (this._checkIfContextSupportsSemanticPath(oContext)) {
        // We check if we have to use a semantic path
        const sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext, true);
        if (!sSemanticPath) {
          // We were not able to build the semantic path --> Use the technical path and
          // clear the previous mapping, otherwise the old mapping is used in EditFlow#updateDocument
          // and it leads to unwanted page reloads
          this.setLastSemanticMapping(undefined);
        } else if (sSemanticPath !== sPath) {
          // Store the mapping technical <-> semantic path to avoid recalculating it later
          // and use the semantic path instead of the technical one
          this.setLastSemanticMapping({
            technicalPath: sPath,
            semanticPath: sSemanticPath
          });
          sPath = sSemanticPath;
        }
      }

      // remove extra '/' at the beginning of path
      if (sPath[0] === "/") {
        sPath = sPath.substring(1);
      }
      return sPath;
    };
    _proto._calculateLayout = function _calculateLayout(sPath, mParameters) {
      let FCLLevel = mParameters.FCLLevel;
      if (mParameters.updateFCLLevel) {
        FCLLevel += mParameters.updateFCLLevel;
        if (FCLLevel < 0) {
          FCLLevel = 0;
        }
      }
      return this.oAppComponent.getRootViewController().calculateLayout(FCLLevel, sPath, mParameters.sLayout, mParameters.keepCurrentLayout);
    }

    /**
     * Event handler before a route is matched.
     * Displays a busy indicator.
     *
     */;
    _proto._beforeRouteMatched = function _beforeRouteMatched( /*oEvent: Event*/
    ) {
      const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (!bPlaceholderEnabled) {
        const oRootView = this.oAppComponent.getRootControl();
        BusyLocker.lock(oRootView);
      }
    }

    /**
     * Event handler when a route is matched.
     * Hides the busy indicator and fires its own 'routematched' event.
     *
     * @param oEvent The event
     */;
    _proto._onRouteMatched = function _onRouteMatched(oEvent) {
      const oAppStateHandler = this.oAppComponent.getAppStateHandler(),
        oRootView = this.oAppComponent.getRootControl();
      const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (BusyLocker.isLocked(oRootView) && !bPlaceholderEnabled) {
        BusyLocker.unlock(oRootView);
      }
      const mParameters = oEvent.getParameters();
      if (this.navigationInfoQueue.length) {
        mParameters.navigationInfo = this.navigationInfoQueue[0];
        this.navigationInfoQueue = this.navigationInfoQueue.slice(1);
      } else {
        mParameters.navigationInfo = {};
      }
      if (oAppStateHandler.checkIfRouteChangedByIApp()) {
        mParameters.navigationInfo.reason = NavigationReason.AppStateChanged;
        oAppStateHandler.resetRouteChangedByIApp();
      }
      this.sCurrentRouteName = oEvent.getParameter("name");
      this.sCurrentRoutePattern = mParameters.config.pattern;
      this.aCurrentViews = oEvent.getParameter("views");
      mParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
      mParameters.routePattern = this.sCurrentRoutePattern;
      this._fireRouteMatchEvents(mParameters);

      // Check if current hash has been set by the routerProxy.navToHash function
      // If not, rebuild history properly (both in the browser and the RouterProxy)
      if (!history.state || history.state.feLevel === undefined) {
        this.oRouterProxy.restoreHistory().then(() => {
          this.oRouterProxy.resolveRouteMatch();
        }).catch(function (oError) {
          Log.error("Error while restoring history", oError);
        });
      } else {
        this.oRouterProxy.resolveRouteMatch();
      }
    };
    _proto.attachRouteMatched = function attachRouteMatched(oData, fnFunction, oListener) {
      this.eventProvider.attachEvent("routeMatched", oData, fnFunction, oListener);
    };
    _proto.detachRouteMatched = function detachRouteMatched(fnFunction, oListener) {
      this.eventProvider.detachEvent("routeMatched", fnFunction, oListener);
    };
    _proto.attachAfterRouteMatched = function attachAfterRouteMatched(oData, fnFunction, oListener) {
      this.eventProvider.attachEvent("afterRouteMatched", oData, fnFunction, oListener);
    };
    _proto.detachAfterRouteMatched = function detachAfterRouteMatched(fnFunction, oListener) {
      this.eventProvider.detachEvent("afterRouteMatched", fnFunction, oListener);
    };
    _proto.getRouteFromHash = function getRouteFromHash(oRouter, oAppComponent) {
      const sHash = oRouter.getHashChanger().hash;
      const oRouteInfo = oRouter.getRouteInfoByHash(sHash);
      return oAppComponent.getMetadata().getManifestEntry("/sap.ui5/routing/routes").filter(function (oRoute) {
        return oRoute.name === oRouteInfo.name;
      })[0];
    };
    _proto.getTargetsFromRoute = function getTargetsFromRoute(oRoute) {
      const oTarget = oRoute.target;
      if (typeof oTarget === "string") {
        return [this._mTargets[oTarget]];
      } else {
        const aTarget = [];
        oTarget.forEach(sTarget => {
          aTarget.push(this._mTargets[sTarget]);
        });
        return aTarget;
      }
    };
    _proto.initializeRouting = async function initializeRouting() {
      // Attach router handlers
      await CollaborationHelper.processAndExpandHash();
      this._fnOnRouteMatched = this._onRouteMatched.bind(this);
      this.oRouter.attachRouteMatched(this._fnOnRouteMatched, this);
      const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (!bPlaceholderEnabled) {
        this.oRouter.attachBeforeRouteMatched(this._beforeRouteMatched.bind(this));
      }
      // Reset internal state
      this.navigationInfoQueue = [];
      EditState.resetEditState();
      this.bExitOnNavigateBackToRoot = !this.oRouter.match("");
      const bIsIappState = this.oRouter.getHashChanger().getHash().indexOf("sap-iapp-state") !== -1;
      try {
        const oStartupParameters = await this.oAppComponent.getStartupParameters();
        const bHasStartUpParameters = oStartupParameters !== undefined && Object.keys(oStartupParameters).length !== 0;
        const sHash = this.oRouter.getHashChanger().getHash();
        // Manage startup parameters (in case of no iapp-state)
        if (!bIsIappState && bHasStartUpParameters && !sHash) {
          if (oStartupParameters.preferredMode && oStartupParameters.preferredMode[0].toUpperCase().indexOf("CREATE") !== -1) {
            // Create mode
            // This check will catch multiple modes like create, createWith and autoCreateWith which all need
            // to be handled like create startup!
            await this._manageCreateStartup(oStartupParameters);
          } else {
            // Deep link
            await this._manageDeepLinkStartup(oStartupParameters);
          }
        }
      } catch (oError) {
        Log.error("Error during routing initialization", oError);
      }
    };
    _proto.getDefaultCreateHash = function getDefaultCreateHash(oStartupParameters) {
      return AppStartupHelper.getDefaultCreateHash(oStartupParameters, this.getContextPath(), this.oRouter);
    };
    _proto._manageCreateStartup = function _manageCreateStartup(oStartupParameters) {
      return AppStartupHelper.getCreateStartupHash(oStartupParameters, this.getContextPath(), this.oRouter, this.oMetaModel).then(sNewHash => {
        if (sNewHash) {
          this.oRouter.getHashChanger().replaceHash(sNewHash);
          if (oStartupParameters !== null && oStartupParameters !== void 0 && oStartupParameters.preferredMode && oStartupParameters.preferredMode[0].toUpperCase().indexOf("AUTOCREATE") !== -1) {
            this.oAppComponent.setStartupModeAutoCreate();
          } else {
            this.oAppComponent.setStartupModeCreate();
          }
          this.bExitOnNavigateBackToRoot = true;
        }
      });
    };
    _proto._manageDeepLinkStartup = function _manageDeepLinkStartup(oStartupParameters) {
      return AppStartupHelper.getDeepLinkStartupHash(this.oAppComponent.getManifest()["sap.ui5"].routing, oStartupParameters, this.oModel).then(oDeepLink => {
        let sHash;
        if (oDeepLink.context) {
          const sTechnicalPath = oDeepLink.context.getPath();
          const sSemanticPath = this._checkIfContextSupportsSemanticPath(oDeepLink.context) ? SemanticKeyHelper.getSemanticPath(oDeepLink.context) : sTechnicalPath;
          if (sSemanticPath !== sTechnicalPath) {
            // Store the mapping technical <-> semantic path to avoid recalculating it later
            // and use the semantic path instead of the technical one
            this.setLastSemanticMapping({
              technicalPath: sTechnicalPath,
              semanticPath: sSemanticPath
            });
          }
          sHash = sSemanticPath.substring(1); // To remove the leading '/'
        } else if (oDeepLink.hash) {
          sHash = oDeepLink.hash;
        }
        if (sHash) {
          //Replace the hash with newly created hash
          this.oRouter.getHashChanger().replaceHash(sHash);
          this.oAppComponent.setStartupModeDeeplink();
        }
      });
    };
    _proto.getOutbounds = function getOutbounds() {
      return this.outbounds;
    }

    /**
     * Gets the name of the Draft root entity set or the sticky-enabled entity set.
     *
     * @returns The name of the root EntitySet
     * @ui5-restricted
     */;
    _proto.getContextPath = function getContextPath() {
      return this.sContextPath;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return RoutingService;
  }(Service);
  _exports.RoutingService = RoutingService;
  let RoutingServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(RoutingServiceFactory, _ServiceFactory);
    function RoutingServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto2 = RoutingServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const oRoutingService = new RoutingService(oServiceContext);
      return oRoutingService.initPromise;
    };
    return RoutingServiceFactory;
  }(ServiceFactory);
  return RoutingServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb3V0aW5nU2VydmljZUV2ZW50aW5nIiwiZGVmaW5lVUk1Q2xhc3MiLCJldmVudCIsIkV2ZW50UHJvdmlkZXIiLCJSb3V0aW5nU2VydmljZSIsIm5hdmlnYXRpb25JbmZvUXVldWUiLCJpbml0Iiwib0NvbnRleHQiLCJnZXRDb250ZXh0Iiwic2NvcGVUeXBlIiwib0FwcENvbXBvbmVudCIsInNjb3BlT2JqZWN0Iiwib01vZGVsIiwiZ2V0TW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib1JvdXRlciIsImdldFJvdXRlciIsIm9Sb3V0ZXJQcm94eSIsImdldFJvdXRlclByb3h5IiwiZXZlbnRQcm92aWRlciIsIm9Sb3V0aW5nQ29uZmlnIiwiZ2V0TWFuaWZlc3RFbnRyeSIsInJvdXRpbmciLCJfcGFyc2VSb3V0aW5nQ29uZmlndXJhdGlvbiIsIm9BcHBDb25maWciLCJvdXRib3VuZHMiLCJjcm9zc05hdmlnYXRpb24iLCJpbml0UHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiYmVmb3JlRXhpdCIsImRldGFjaFJvdXRlTWF0Y2hlZCIsIl9mbk9uUm91dGVNYXRjaGVkIiwiZmlyZUV2ZW50IiwiZXhpdCIsImRlc3Ryb3kiLCJpc0ZDTCIsImNvbmZpZyIsInJvdXRlckNsYXNzIiwiX21UYXJnZXRzIiwiT2JqZWN0Iiwia2V5cyIsInRhcmdldHMiLCJmb3JFYWNoIiwic1RhcmdldE5hbWUiLCJhc3NpZ24iLCJ0YXJnZXROYW1lIiwiY29udGV4dFBhdHRlcm4iLCJ1bmRlZmluZWQiLCJ2aWV3TGV2ZWwiLCJfZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4iLCJfbVJvdXRlcyIsInNSb3V0ZUtleSIsInJvdXRlcyIsIm9Sb3V0ZU1hbmlmZXN0SW5mbyIsImFSb3V0ZVRhcmdldHMiLCJBcnJheSIsImlzQXJyYXkiLCJ0YXJnZXQiLCJzUm91dGVOYW1lIiwibmFtZSIsInNSb3V0ZVBhdHRlcm4iLCJwYXR0ZXJuIiwibGVuZ3RoIiwiaW5kZXhPZiIsIkxvZyIsIndhcm5pbmciLCJpUm91dGVMZXZlbCIsInJvdXRlTGV2ZWwiLCJpIiwic1BhcmVudFRhcmdldE5hbWUiLCJwYXJlbnQiLCJwdXNoIiwiRkNMTGV2ZWwiLCJjb250cm9sQWdncmVnYXRpb24iLCJhTGV2ZWwwUm91dGVOYW1lcyIsImFMZXZlbDFSb3V0ZU5hbWVzIiwic0RlZmF1bHRSb3V0ZU5hbWUiLCJzTmFtZSIsImlMZXZlbCIsInNEZWZhdWx0VGFyZ2V0TmFtZSIsInNsaWNlIiwic0NvbnRleHRQYXRoIiwib3B0aW9ucyIsInNldHRpbmdzIiwib1NldHRpbmdzIiwiY29udGV4dFBhdGgiLCJlbnRpdHlTZXQiLCJtYXAiLCJzVGFyZ2V0S2V5Iiwic29ydCIsImEiLCJiIiwiZnVsbENvbnRleHRQYXRoIiwibmF2aWdhdGlvbiIsInNOYXZOYW1lIiwidGFyZ2V0Um91dGUiLCJkZXRhaWwiLCJyb3V0ZSIsInN0YXJ0c1dpdGgiLCJzUGF0dGVybiIsInJlcGxhY2UiLCJyZWdleCIsIlJlZ0V4cCIsIm1hdGNoIiwiX2dldFJvdXRlSW5mb3JtYXRpb24iLCJfZ2V0VGFyZ2V0SW5mb3JtYXRpb24iLCJfZ2V0Q29tcG9uZW50SWQiLCJzT3duZXJJZCIsInNDb21wb25lbnRJZCIsInN1YnN0ciIsImdldFRhcmdldEluZm9ybWF0aW9uRm9yIiwib0NvbXBvbmVudEluc3RhbmNlIiwic1RhcmdldENvbXBvbmVudElkIiwiX3NPd25lcklkIiwiZ2V0SWQiLCJzQ29ycmVjdFRhcmdldE5hbWUiLCJpZCIsInZpZXdJZCIsImdldExhc3RTZW1hbnRpY01hcHBpbmciLCJvTGFzdFNlbWFudGljTWFwcGluZyIsInNldExhc3RTZW1hbnRpY01hcHBpbmciLCJvTWFwcGluZyIsIm5hdmlnYXRlVG8iLCJtUGFyYW1ldGVyTWFwcGluZyIsImJQcmVzZXJ2ZUhpc3RvcnkiLCJzVGFyZ2V0VVJMUHJvbWlzZSIsImJJc1N0aWNreU1vZGUiLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIlNlbWFudGljS2V5SGVscGVyIiwiZ2V0U2VtYW50aWNQYXRoIiwicHJlcGFyZVBhcmFtZXRlcnMiLCJ0aGVuIiwibVBhcmFtZXRlcnMiLCJnZXRVUkwiLCJzVGFyZ2V0VVJMIiwibmF2VG9IYXNoIiwic1RhcmdldFJvdXRlIiwib1BhcmFtZXRlcnNQcm9taXNlIiwiZ2V0UGF0aCIsImFDb250ZXh0UGF0aFBhcnRzIiwic3BsaXQiLCJhQWxsUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcyIsInNQYXJhbWV0ZXJLZXkiLCJzUGFyYW1ldGVyTWFwcGluZ0V4cHJlc3Npb24iLCJvUGFyc2VkRXhwcmVzc2lvbiIsIkJpbmRpbmdQYXJzZXIiLCJjb21wbGV4UGFyc2VyIiwiYVBhcnRzIiwicGFydHMiLCJhUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcyIsIm9QYXRoUGFydCIsImFSZWxhdGl2ZVBhcnRzIiwicGF0aCIsImFMb2NhbFBhcnRzIiwic1Byb3BlcnR5UGF0aCIsImpvaW4iLCJvTWV0YUNvbnRleHQiLCJnZXRNZXRhQ29udGV4dCIsInJlcXVlc3RQcm9wZXJ0eSIsIm9WYWx1ZSIsIm9Qcm9wZXJ0eUluZm8iLCJnZXRPYmplY3QiLCJzRWRtVHlwZSIsIiRUeXBlIiwiT0RhdGFVdGlscyIsImZvcm1hdExpdGVyYWwiLCJhbGwiLCJhUmVzb2x2ZWRQYXJhbWV0ZXJzIiwidmFsdWUiLCJmb3JtYXR0ZXIiLCJhcHBseSIsImtleSIsImFBbGxSZXNvbHZlZFBhcmFtZXRlcnMiLCJvUGFyYW1ldGVycyIsIm9SZXNvbHZlZFBhcmFtZXRlciIsIm9FcnJvciIsImVycm9yIiwiX2ZpcmVSb3V0ZU1hdGNoRXZlbnRzIiwiRWRpdFN0YXRlIiwiY2xlYW5Qcm9jZXNzZWRFZGl0U3RhdGUiLCJuYXZpZ2F0ZVRvQ29udGV4dCIsIm9WaWV3RGF0YSIsIm9DdXJyZW50VGFyZ2V0SW5mbyIsIm9Sb3V0ZVBhcmFtZXRlcnNQcm9taXNlIiwidGFyZ2V0UGF0aCIsIm9Sb3V0ZURldGFpbCIsInBhcmFtZXRlcnMiLCJzVGFyZ2V0UGF0aCIsIl9nZXRQYXRoRnJvbUNvbnRleHQiLCJiRXhpdE9uTmF2aWdhdGVCYWNrVG9Sb290IiwiZXhpdEZyb21BcHAiLCJhc3luY0NvbnRleHQiLCJiRGVmZXJyZWRDb250ZXh0Iiwic0xheW91dCIsIl9jYWxjdWxhdGVMYXlvdXQiLCJvTmF2aWdhdGlvbkluZm8iLCJvQXN5bmNDb250ZXh0IiwiYlRhcmdldEVkaXRhYmxlIiwiZWRpdGFibGUiLCJiUGVyc2lzdE9QU2Nyb2xsIiwidXNlQ29udGV4dCIsInVwZGF0ZUZDTExldmVsIiwiYlJlY3JlYXRlQ29udGV4dCIsImJEcmFmdE5hdmlnYXRpb24iLCJiU2hvd1BsYWNlaG9sZGVyIiwic2hvd1BsYWNlaG9sZGVyIiwicmVhc29uIiwiY2hlY2tOb0hhc2hDaGFuZ2UiLCJzQ3VycmVudEhhc2hOb0FwcFN0YXRlIiwiZ2V0SGFzaCIsIm1FdmVudFBhcmFtZXRlcnMiLCJnZXRSb3V0ZUluZm9CeUhhc2giLCJuYXZpZ2F0aW9uSW5mbyIsInJvdXRlSW5mb3JtYXRpb24iLCJzQ3VycmVudFJvdXRlTmFtZSIsInJvdXRlUGF0dGVybiIsInNDdXJyZW50Um91dGVQYXR0ZXJuIiwidmlld3MiLCJhQ3VycmVudFZpZXdzIiwic2V0Rm9jdXNGb3JjZWQiLCJiRm9yY2VGb2N1cyIsInRyYW5zaWVudCIsIm9Sb3V0ZUluZm8iLCJvUm91dGUiLCJzTGFzdFRhcmdldE5hbWUiLCJvVGFyZ2V0IiwibWVzc2FnZUhhbmRsaW5nIiwicmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcyIsIm9Sb3V0ZVBhcmFtZXRlcnMiLCJuYXZUbyIsIm5vUHJlc2VydmF0aW9uQ2FjaGUiLCJiTmF2aWdhdGVkIiwicG9wIiwibmF2aWdhdGVUb1JvdXRlIiwic1RhcmdldFJvdXRlTmFtZSIsImlzQ3VycmVudFN0YXRlSW1wYWN0ZWRCeSIsInNQYXRoIiwidGVzdCIsInNTZW1hbnRpY1BhdGgiLCJ0ZWNobmljYWxQYXRoIiwic2VtYW50aWNQYXRoIiwiX2ZpbmRQYXRoVG9OYXZpZ2F0ZSIsIl9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoIiwic0VudGl0eVNldE5hbWUiLCJnZXRTZW1hbnRpY0tleXMiLCJpc0RyYWZ0U3VwcG9ydGVkIiwiaXNBIiwiaXNSZWxhdGl2ZSIsImdldEhlYWRlckNvbnRleHQiLCJzdWJzdHJpbmciLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJjYWxjdWxhdGVMYXlvdXQiLCJrZWVwQ3VycmVudExheW91dCIsIl9iZWZvcmVSb3V0ZU1hdGNoZWQiLCJiUGxhY2Vob2xkZXJFbmFibGVkIiwiUGxhY2Vob2xkZXIiLCJpc1BsYWNlaG9sZGVyRW5hYmxlZCIsIm9Sb290VmlldyIsImdldFJvb3RDb250cm9sIiwiQnVzeUxvY2tlciIsImxvY2siLCJfb25Sb3V0ZU1hdGNoZWQiLCJvRXZlbnQiLCJvQXBwU3RhdGVIYW5kbGVyIiwiZ2V0QXBwU3RhdGVIYW5kbGVyIiwiaXNMb2NrZWQiLCJ1bmxvY2siLCJnZXRQYXJhbWV0ZXJzIiwiY2hlY2tJZlJvdXRlQ2hhbmdlZEJ5SUFwcCIsIk5hdmlnYXRpb25SZWFzb24iLCJBcHBTdGF0ZUNoYW5nZWQiLCJyZXNldFJvdXRlQ2hhbmdlZEJ5SUFwcCIsImdldFBhcmFtZXRlciIsImhpc3RvcnkiLCJzdGF0ZSIsImZlTGV2ZWwiLCJyZXN0b3JlSGlzdG9yeSIsInJlc29sdmVSb3V0ZU1hdGNoIiwiY2F0Y2giLCJhdHRhY2hSb3V0ZU1hdGNoZWQiLCJvRGF0YSIsImZuRnVuY3Rpb24iLCJvTGlzdGVuZXIiLCJhdHRhY2hFdmVudCIsImRldGFjaEV2ZW50IiwiYXR0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQiLCJkZXRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsImdldFJvdXRlRnJvbUhhc2giLCJzSGFzaCIsImdldEhhc2hDaGFuZ2VyIiwiaGFzaCIsImdldE1ldGFkYXRhIiwiZmlsdGVyIiwiZ2V0VGFyZ2V0c0Zyb21Sb3V0ZSIsImFUYXJnZXQiLCJzVGFyZ2V0IiwiaW5pdGlhbGl6ZVJvdXRpbmciLCJDb2xsYWJvcmF0aW9uSGVscGVyIiwicHJvY2Vzc0FuZEV4cGFuZEhhc2giLCJiaW5kIiwiYXR0YWNoQmVmb3JlUm91dGVNYXRjaGVkIiwicmVzZXRFZGl0U3RhdGUiLCJiSXNJYXBwU3RhdGUiLCJvU3RhcnR1cFBhcmFtZXRlcnMiLCJnZXRTdGFydHVwUGFyYW1ldGVycyIsImJIYXNTdGFydFVwUGFyYW1ldGVycyIsInByZWZlcnJlZE1vZGUiLCJ0b1VwcGVyQ2FzZSIsIl9tYW5hZ2VDcmVhdGVTdGFydHVwIiwiX21hbmFnZURlZXBMaW5rU3RhcnR1cCIsImdldERlZmF1bHRDcmVhdGVIYXNoIiwiQXBwU3RhcnR1cEhlbHBlciIsImdldENvbnRleHRQYXRoIiwiZ2V0Q3JlYXRlU3RhcnR1cEhhc2giLCJzTmV3SGFzaCIsInJlcGxhY2VIYXNoIiwic2V0U3RhcnR1cE1vZGVBdXRvQ3JlYXRlIiwic2V0U3RhcnR1cE1vZGVDcmVhdGUiLCJnZXREZWVwTGlua1N0YXJ0dXBIYXNoIiwiZ2V0TWFuaWZlc3QiLCJvRGVlcExpbmsiLCJjb250ZXh0Iiwic1RlY2huaWNhbFBhdGgiLCJzZXRTdGFydHVwTW9kZURlZXBsaW5rIiwiZ2V0T3V0Ym91bmRzIiwiZ2V0SW50ZXJmYWNlIiwiU2VydmljZSIsIlJvdXRpbmdTZXJ2aWNlRmFjdG9yeSIsImNyZWF0ZUluc3RhbmNlIiwib1NlcnZpY2VDb250ZXh0Iiwib1JvdXRpbmdTZXJ2aWNlIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlJvdXRpbmdTZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQnVzeUxvY2tlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvQnVzeUxvY2tlclwiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BsYWNlaG9sZGVyXCI7XG5pbXBvcnQgTmF2aWdhdGlvblJlYXNvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvcm91dGluZy9OYXZpZ2F0aW9uUmVhc29uXCI7XG5pbXBvcnQgdHlwZSBSb3V0ZXJQcm94eSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvcm91dGluZy9Sb3V0ZXJQcm94eVwiO1xuaW1wb3J0IEFwcFN0YXJ0dXBIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQXBwU3RhcnR1cEhlbHBlclwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgRWRpdFN0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0VkaXRTdGF0ZVwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2VtYW50aWNLZXlIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2VtYW50aWNLZXlIZWxwZXJcIjtcbmltcG9ydCBDb2xsYWJvcmF0aW9uSGVscGVyIGZyb20gXCJzYXAvc3VpdGUvdWkvY29tbW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25IZWxwZXJcIjtcbmltcG9ydCBCaW5kaW5nUGFyc2VyIGZyb20gXCJzYXAvdWkvYmFzZS9CaW5kaW5nUGFyc2VyXCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBFdmVudFByb3ZpZGVyIGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFByb3ZpZGVyXCI7XG5pbXBvcnQgdHlwZSBSb3V0ZXIgZnJvbSBcInNhcC91aS9jb3JlL3JvdXRpbmcvUm91dGVyXCI7XG5pbXBvcnQgU2VydmljZSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlXCI7XG5pbXBvcnQgU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IE9EYXRhVXRpbHMgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YVV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZpY2VDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG50eXBlIFJvdXRpbmdTZXJ2aWNlU2V0dGluZ3MgPSB7fTtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLnNlcnZpY2VzLlJvdXRpbmdTZXJ2aWNlRXZlbnRpbmdcIilcbmNsYXNzIFJvdXRpbmdTZXJ2aWNlRXZlbnRpbmcgZXh0ZW5kcyBFdmVudFByb3ZpZGVyIHtcblx0QGV2ZW50KClcblx0cm91dGVNYXRjaGVkITogRnVuY3Rpb247XG5cdEBldmVudCgpXG5cdGFmdGVyUm91dGVNYXRjaGVkITogRnVuY3Rpb247XG59XG5cbmV4cG9ydCB0eXBlIFNlbWFudGljTWFwcGluZyA9IHtcblx0c2VtYW50aWNQYXRoOiBzdHJpbmc7XG5cdHRlY2huaWNhbFBhdGg6IHN0cmluZztcbn07XG5leHBvcnQgY2xhc3MgUm91dGluZ1NlcnZpY2UgZXh0ZW5kcyBTZXJ2aWNlPFJvdXRpbmdTZXJ2aWNlU2V0dGluZ3M+IHtcblx0b0FwcENvbXBvbmVudCE6IEFwcENvbXBvbmVudDtcblx0b01vZGVsITogT0RhdGFNb2RlbDtcblx0b01ldGFNb2RlbCE6IE9EYXRhTWV0YU1vZGVsO1xuXHRvUm91dGVyITogUm91dGVyO1xuXHRvUm91dGVyUHJveHkhOiBSb3V0ZXJQcm94eTtcblx0ZXZlbnRQcm92aWRlciE6IEV2ZW50UHJvdmlkZXI7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXHRvdXRib3VuZHM6IGFueTtcblx0X21UYXJnZXRzOiBhbnk7XG5cdF9tUm91dGVzOiBhbnk7XG5cdG9MYXN0U2VtYW50aWNNYXBwaW5nPzogU2VtYW50aWNNYXBwaW5nO1xuXHRiRXhpdE9uTmF2aWdhdGVCYWNrVG9Sb290PzogYm9vbGVhbjtcblx0c0N1cnJlbnRSb3V0ZU5hbWU/OiBzdHJpbmc7XG5cdHNDdXJyZW50Um91dGVQYXR0ZXJuPzogc3RyaW5nO1xuXHRhQ3VycmVudFZpZXdzPzogYW55W107XG5cdG5hdmlnYXRpb25JbmZvUXVldWU6IGFueVtdID0gW107XG5cdHNDb250ZXh0UGF0aCE6IHN0cmluZztcblx0X2ZuT25Sb3V0ZU1hdGNoZWQhOiBGdW5jdGlvbjtcblx0aW5pdCgpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGlmIChvQ29udGV4dC5zY29wZVR5cGUgPT09IFwiY29tcG9uZW50XCIpIHtcblx0XHRcdHRoaXMub0FwcENvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdFx0dGhpcy5vTW9kZWwgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsO1xuXHRcdFx0dGhpcy5vTWV0YU1vZGVsID0gdGhpcy5vTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHR0aGlzLm9Sb3V0ZXIgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um91dGVyKCk7XG5cdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eSA9IHRoaXMub0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpO1xuXHRcdFx0dGhpcy5ldmVudFByb3ZpZGVyID0gbmV3IChSb3V0aW5nU2VydmljZUV2ZW50aW5nIGFzIGFueSkoKTtcblxuXHRcdFx0Y29uc3Qgb1JvdXRpbmdDb25maWcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcInNhcC51aTVcIikucm91dGluZztcblx0XHRcdHRoaXMuX3BhcnNlUm91dGluZ0NvbmZpZ3VyYXRpb24ob1JvdXRpbmdDb25maWcpO1xuXG5cdFx0XHRjb25zdCBvQXBwQ29uZmlnID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0RW50cnkoXCJzYXAuYXBwXCIpO1xuXHRcdFx0dGhpcy5vdXRib3VuZHMgPSBvQXBwQ29uZmlnLmNyb3NzTmF2aWdhdGlvbj8ub3V0Ym91bmRzO1xuXHRcdH1cblxuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodGhpcyk7XG5cdH1cblx0YmVmb3JlRXhpdCgpIHtcblx0XHR0aGlzLm9Sb3V0ZXIuZGV0YWNoUm91dGVNYXRjaGVkKHRoaXMuX2ZuT25Sb3V0ZU1hdGNoZWQsIHRoaXMpO1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5maXJlRXZlbnQoXCJyb3V0ZU1hdGNoZWRcIiwge30pO1xuXHR9XG5cdGV4aXQoKSB7XG5cdFx0dGhpcy5ldmVudFByb3ZpZGVyLmRlc3Ryb3koKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBhIG1hbmlmZXN0IHJvdXRpbmcgY29uZmlndXJhdGlvbiBmb3IgaW50ZXJuYWwgdXNhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBvUm91dGluZ0NvbmZpZyBUaGUgcm91dGluZyBjb25maWd1cmF0aW9uIGZyb20gdGhlIG1hbmlmZXN0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfcGFyc2VSb3V0aW5nQ29uZmlndXJhdGlvbihvUm91dGluZ0NvbmZpZzogYW55KSB7XG5cdFx0Y29uc3QgaXNGQ0wgPSBvUm91dGluZ0NvbmZpZz8uY29uZmlnPy5yb3V0ZXJDbGFzcyA9PT0gXCJzYXAuZi5yb3V0aW5nLlJvdXRlclwiO1xuXG5cdFx0Ly8gSW5mb3JtYXRpb24gb2YgdGFyZ2V0c1xuXHRcdHRoaXMuX21UYXJnZXRzID0ge307XG5cdFx0T2JqZWN0LmtleXMob1JvdXRpbmdDb25maWcudGFyZ2V0cykuZm9yRWFjaCgoc1RhcmdldE5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdID0gT2JqZWN0LmFzc2lnbih7IHRhcmdldE5hbWU6IHNUYXJnZXROYW1lIH0sIG9Sb3V0aW5nQ29uZmlnLnRhcmdldHNbc1RhcmdldE5hbWVdKTtcblxuXHRcdFx0Ly8gVmlldyBsZXZlbCBmb3IgRkNMIGNhc2VzIGlzIGNhbGN1bGF0ZWQgZnJvbSB0aGUgdGFyZ2V0IHBhdHRlcm5cblx0XHRcdGlmICh0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uY29udGV4dFBhdHRlcm4gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0udmlld0xldmVsID0gdGhpcy5fZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4odGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLmNvbnRleHRQYXR0ZXJuLCAwKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIEluZm9ybWF0aW9uIG9mIHJvdXRlc1xuXHRcdHRoaXMuX21Sb3V0ZXMgPSB7fTtcblx0XHRmb3IgKGNvbnN0IHNSb3V0ZUtleSBpbiBvUm91dGluZ0NvbmZpZy5yb3V0ZXMpIHtcblx0XHRcdGNvbnN0IG9Sb3V0ZU1hbmlmZXN0SW5mbyA9IG9Sb3V0aW5nQ29uZmlnLnJvdXRlc1tzUm91dGVLZXldLFxuXHRcdFx0XHRhUm91dGVUYXJnZXRzID0gQXJyYXkuaXNBcnJheShvUm91dGVNYW5pZmVzdEluZm8udGFyZ2V0KSA/IG9Sb3V0ZU1hbmlmZXN0SW5mby50YXJnZXQgOiBbb1JvdXRlTWFuaWZlc3RJbmZvLnRhcmdldF0sXG5cdFx0XHRcdHNSb3V0ZU5hbWUgPSBBcnJheS5pc0FycmF5KG9Sb3V0aW5nQ29uZmlnLnJvdXRlcykgPyBvUm91dGVNYW5pZmVzdEluZm8ubmFtZSA6IHNSb3V0ZUtleSxcblx0XHRcdFx0c1JvdXRlUGF0dGVybiA9IG9Sb3V0ZU1hbmlmZXN0SW5mby5wYXR0ZXJuO1xuXG5cdFx0XHQvLyBDaGVjayByb3V0ZSBwYXR0ZXJuOiBhbGwgcGF0dGVybnMgbmVlZCB0byBlbmQgd2l0aCAnOj9xdWVyeTonLCB0aGF0IHdlIHVzZSBmb3IgcGFyYW1ldGVyc1xuXHRcdFx0aWYgKHNSb3V0ZVBhdHRlcm4ubGVuZ3RoIDwgOCB8fCBzUm91dGVQYXR0ZXJuLmluZGV4T2YoXCI6P3F1ZXJ5OlwiKSAhPT0gc1JvdXRlUGF0dGVybi5sZW5ndGggLSA4KSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKGBQYXR0ZXJuIGZvciByb3V0ZSAke3NSb3V0ZU5hbWV9IGRvZXNuJ3QgZW5kIHdpdGggJzo/cXVlcnk6JyA6ICR7c1JvdXRlUGF0dGVybn1gKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGlSb3V0ZUxldmVsID0gdGhpcy5fZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4oc1JvdXRlUGF0dGVybiwgMCk7XG5cdFx0XHR0aGlzLl9tUm91dGVzW3NSb3V0ZU5hbWVdID0ge1xuXHRcdFx0XHRuYW1lOiBzUm91dGVOYW1lLFxuXHRcdFx0XHRwYXR0ZXJuOiBzUm91dGVQYXR0ZXJuLFxuXHRcdFx0XHR0YXJnZXRzOiBhUm91dGVUYXJnZXRzLFxuXHRcdFx0XHRyb3V0ZUxldmVsOiBpUm91dGVMZXZlbFxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gQWRkIHRoZSBwYXJlbnQgdGFyZ2V0cyBpbiB0aGUgbGlzdCBvZiB0YXJnZXRzIGZvciB0aGUgcm91dGVcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVJvdXRlVGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBzUGFyZW50VGFyZ2V0TmFtZSA9IHRoaXMuX21UYXJnZXRzW2FSb3V0ZVRhcmdldHNbaV1dLnBhcmVudDtcblx0XHRcdFx0aWYgKHNQYXJlbnRUYXJnZXROYW1lKSB7XG5cdFx0XHRcdFx0YVJvdXRlVGFyZ2V0cy5wdXNoKHNQYXJlbnRUYXJnZXROYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWlzRkNMKSB7XG5cdFx0XHRcdC8vIFZpZXcgbGV2ZWwgZm9yIG5vbi1GQ0wgY2FzZXMgaXMgY2FsY3VsYXRlZCBmcm9tIHRoZSByb3V0ZSBwYXR0ZXJuXG5cdFx0XHRcdGlmICh0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS52aWV3TGV2ZWwgPT09IHVuZGVmaW5lZCB8fCB0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS52aWV3TGV2ZWwgPCBpUm91dGVMZXZlbCkge1xuXHRcdFx0XHRcdC8vIFRoZXJlIGFyZSBjYXNlcyB3aGVuIGRpZmZlcmVudCByb3V0ZXMgcG9pbnQgdG8gdGhlIHNhbWUgdGFyZ2V0LiBXZSB0YWtlIHRoZVxuXHRcdFx0XHRcdC8vIGxhcmdlc3Qgdmlld0xldmVsIGluIHRoYXQgY2FzZS5cblx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS52aWV3TGV2ZWwgPSBpUm91dGVMZXZlbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIEZDTCBsZXZlbCBmb3Igbm9uLUZDTCBjYXNlcyBpcyBlcXVhbCB0byAtMVxuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS5GQ0xMZXZlbCA9IC0xO1xuXHRcdFx0fSBlbHNlIGlmIChhUm91dGVUYXJnZXRzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS5jb250cm9sQWdncmVnYXRpb24gIT09IFwiYmVnaW5Db2x1bW5QYWdlc1wiKSB7XG5cdFx0XHRcdC8vIFdlJ3JlIGluIHRoZSBjYXNlIHdoZXJlIHRoZXJlJ3Mgb25seSAxIHRhcmdldCBmb3IgdGhlIHJvdXRlLCBhbmQgaXQncyBub3QgaW4gdGhlIGZpcnN0IGNvbHVtblxuXHRcdFx0XHQvLyAtLT4gdGhpcyBpcyBhIGZ1bGxzY3JlZW4gY29sdW1uIGFmdGVyIGFsbCBjb2x1bW5zIGluIHRoZSBGQ0wgaGF2ZSBiZWVuIHVzZWRcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbYVJvdXRlVGFyZ2V0c1swXV0uRkNMTGV2ZWwgPSAzO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gT3RoZXIgRkNMIGNhc2VzXG5cdFx0XHRcdGFSb3V0ZVRhcmdldHMuZm9yRWFjaCgoc1RhcmdldE5hbWU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHN3aXRjaCAodGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLmNvbnRyb2xBZ2dyZWdhdGlvbikge1xuXHRcdFx0XHRcdFx0Y2FzZSBcImJlZ2luQ29sdW1uUGFnZXNcIjpcblx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLkZDTExldmVsID0gMDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdGNhc2UgXCJtaWRDb2x1bW5QYWdlc1wiOlxuXHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uRkNMTGV2ZWwgPSAxO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLkZDTExldmVsID0gMjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFByb3BhZ2F0ZSB2aWV3TGV2ZWwsIGNvbnRleHRQYXR0ZXJuLCBGQ0xMZXZlbCBhbmQgY29udHJvbEFnZ3JlZ2F0aW9uIHRvIHBhcmVudCB0YXJnZXRzXG5cdFx0T2JqZWN0LmtleXModGhpcy5fbVRhcmdldHMpLmZvckVhY2goKHNUYXJnZXROYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdHdoaWxlICh0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ucGFyZW50KSB7XG5cdFx0XHRcdGNvbnN0IHNQYXJlbnRUYXJnZXROYW1lID0gdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLnBhcmVudDtcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLnZpZXdMZXZlbCA9XG5cdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLnZpZXdMZXZlbCB8fCB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0udmlld0xldmVsO1xuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzUGFyZW50VGFyZ2V0TmFtZV0uY29udGV4dFBhdHRlcm4gPVxuXHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS5jb250ZXh0UGF0dGVybiB8fCB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uY29udGV4dFBhdHRlcm47XG5cdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS5GQ0xMZXZlbCA9XG5cdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLkZDTExldmVsIHx8IHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5GQ0xMZXZlbDtcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLmNvbnRyb2xBZ2dyZWdhdGlvbiA9XG5cdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLmNvbnRyb2xBZ2dyZWdhdGlvbiB8fCB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uY29udHJvbEFnZ3JlZ2F0aW9uO1xuXHRcdFx0XHRzVGFyZ2V0TmFtZSA9IHNQYXJlbnRUYXJnZXROYW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gRGV0ZXJtaW5lIHRoZSByb290IGVudGl0eSBmb3IgdGhlIGFwcFxuXHRcdGNvbnN0IGFMZXZlbDBSb3V0ZU5hbWVzID0gW107XG5cdFx0Y29uc3QgYUxldmVsMVJvdXRlTmFtZXMgPSBbXTtcblx0XHRsZXQgc0RlZmF1bHRSb3V0ZU5hbWU7XG5cblx0XHRmb3IgKGNvbnN0IHNOYW1lIGluIHRoaXMuX21Sb3V0ZXMpIHtcblx0XHRcdGNvbnN0IGlMZXZlbCA9IHRoaXMuX21Sb3V0ZXNbc05hbWVdLnJvdXRlTGV2ZWw7XG5cdFx0XHRpZiAoaUxldmVsID09PSAwKSB7XG5cdFx0XHRcdGFMZXZlbDBSb3V0ZU5hbWVzLnB1c2goc05hbWUpO1xuXHRcdFx0fSBlbHNlIGlmIChpTGV2ZWwgPT09IDEpIHtcblx0XHRcdFx0YUxldmVsMVJvdXRlTmFtZXMucHVzaChzTmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGFMZXZlbDBSb3V0ZU5hbWVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0c0RlZmF1bHRSb3V0ZU5hbWUgPSBhTGV2ZWwwUm91dGVOYW1lc1swXTtcblx0XHR9IGVsc2UgaWYgKGFMZXZlbDFSb3V0ZU5hbWVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0c0RlZmF1bHRSb3V0ZU5hbWUgPSBhTGV2ZWwxUm91dGVOYW1lc1swXTtcblx0XHR9XG5cblx0XHRpZiAoc0RlZmF1bHRSb3V0ZU5hbWUpIHtcblx0XHRcdGNvbnN0IHNEZWZhdWx0VGFyZ2V0TmFtZSA9IHRoaXMuX21Sb3V0ZXNbc0RlZmF1bHRSb3V0ZU5hbWVdLnRhcmdldHMuc2xpY2UoLTEpWzBdO1xuXHRcdFx0dGhpcy5zQ29udGV4dFBhdGggPSBcIlwiO1xuXHRcdFx0aWYgKHRoaXMuX21UYXJnZXRzW3NEZWZhdWx0VGFyZ2V0TmFtZV0ub3B0aW9ucyAmJiB0aGlzLl9tVGFyZ2V0c1tzRGVmYXVsdFRhcmdldE5hbWVdLm9wdGlvbnMuc2V0dGluZ3MpIHtcblx0XHRcdFx0Y29uc3Qgb1NldHRpbmdzID0gdGhpcy5fbVRhcmdldHNbc0RlZmF1bHRUYXJnZXROYW1lXS5vcHRpb25zLnNldHRpbmdzO1xuXHRcdFx0XHR0aGlzLnNDb250ZXh0UGF0aCA9IG9TZXR0aW5ncy5jb250ZXh0UGF0aCB8fCBgLyR7b1NldHRpbmdzLmVudGl0eVNldH1gO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCF0aGlzLnNDb250ZXh0UGF0aCkge1xuXHRcdFx0XHRMb2cud2FybmluZyhcblx0XHRcdFx0XHRgQ2Fubm90IGRldGVybWluZSBkZWZhdWx0IGNvbnRleHRQYXRoOiBjb250ZXh0UGF0aCBvciBlbnRpdHlTZXQgbWlzc2luZyBpbiBkZWZhdWx0IHRhcmdldDogJHtzRGVmYXVsdFRhcmdldE5hbWV9YFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cud2FybmluZyhcIkNhbm5vdCBkZXRlcm1pbmUgZGVmYXVsdCBjb250ZXh0UGF0aDogbm8gZGVmYXVsdCByb3V0ZSBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0Ly8gV2UgbmVlZCB0byBlc3RhYmxpc2ggdGhlIGNvcnJlY3QgcGF0aCB0byB0aGUgZGlmZmVyZW50IHBhZ2VzLCBpbmNsdWRpbmcgdGhlIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRcdE9iamVjdC5rZXlzKHRoaXMuX21UYXJnZXRzKVxuXHRcdFx0Lm1hcCgoc1RhcmdldEtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0S2V5XTtcblx0XHRcdH0pXG5cdFx0XHQuc29ydCgoYTogYW55LCBiOiBhbnkpID0+IHtcblx0XHRcdFx0cmV0dXJuIGEudmlld0xldmVsIDwgYi52aWV3TGV2ZWwgPyAtMSA6IDE7XG5cdFx0XHR9KVxuXHRcdFx0LmZvckVhY2goKHRhcmdldDogYW55KSA9PiB7XG5cdFx0XHRcdC8vIEFmdGVyIHNvcnRpbmcgdGhlIHRhcmdldHMgcGVyIGxldmVsIHdlIGNhbiB0aGVuIGdvIHRocm91Z2ggdGhlaXIgbmF2aWdhdGlvbiBvYmplY3QgYW5kIHVwZGF0ZSB0aGUgcGF0aHMgYWNjb3JkaW5nbHkuXG5cdFx0XHRcdGlmICh0YXJnZXQub3B0aW9ucykge1xuXHRcdFx0XHRcdGNvbnN0IHNldHRpbmdzID0gdGFyZ2V0Lm9wdGlvbnMuc2V0dGluZ3M7XG5cdFx0XHRcdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gc2V0dGluZ3MuY29udGV4dFBhdGggfHwgKHNldHRpbmdzLmVudGl0eVNldCA/IGAvJHtzZXR0aW5ncy5lbnRpdHlTZXR9YCA6IFwiXCIpO1xuXHRcdFx0XHRcdGlmICghc2V0dGluZ3MuZnVsbENvbnRleHRQYXRoICYmIHNDb250ZXh0UGF0aCkge1xuXHRcdFx0XHRcdFx0c2V0dGluZ3MuZnVsbENvbnRleHRQYXRoID0gYCR7c0NvbnRleHRQYXRofS9gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRPYmplY3Qua2V5cyhzZXR0aW5ncy5uYXZpZ2F0aW9uIHx8IHt9KS5mb3JFYWNoKChzTmF2TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0XHQvLyBDaGVjayBpZiBpdCdzIGEgbmF2aWdhdGlvbiBwcm9wZXJ0eVxuXHRcdFx0XHRcdFx0Y29uc3QgdGFyZ2V0Um91dGUgPSB0aGlzLl9tUm91dGVzW3NldHRpbmdzLm5hdmlnYXRpb25bc05hdk5hbWVdLmRldGFpbC5yb3V0ZV07XG5cdFx0XHRcdFx0XHRpZiAodGFyZ2V0Um91dGUgJiYgdGFyZ2V0Um91dGUudGFyZ2V0cykge1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRSb3V0ZS50YXJnZXRzLmZvckVhY2goKHNUYXJnZXROYW1lOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ub3B0aW9ucyAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLm9wdGlvbnMuc2V0dGluZ3MgJiZcblx0XHRcdFx0XHRcdFx0XHRcdCF0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ub3B0aW9ucy5zZXR0aW5ncy5mdWxsQ29udGV4dFBhdGhcblx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0YXJnZXQudmlld0xldmVsID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5vcHRpb25zLnNldHRpbmdzLmZ1bGxDb250ZXh0UGF0aCA9IGAke1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdChzTmF2TmFtZS5zdGFydHNXaXRoKFwiL1wiKSA/IFwiXCIgOiBcIi9cIikgKyBzTmF2TmFtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9L2A7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ub3B0aW9ucy5zZXR0aW5ncy5mdWxsQ29udGV4dFBhdGggPSBgJHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzZXR0aW5ncy5mdWxsQ29udGV4dFBhdGggKyBzTmF2TmFtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9L2A7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyBhIHZpZXcgbGV2ZWwgZnJvbSBhIHBhdHRlcm4gYnkgY291bnRpbmcgdGhlIG51bWJlciBvZiBzZWdtZW50cy5cblx0ICpcblx0ICogQHBhcmFtIHNQYXR0ZXJuIFRoZSBwYXR0ZXJuXG5cdCAqIEBwYXJhbSB2aWV3TGV2ZWwgVGhlIGN1cnJlbnQgbGV2ZWwgb2Ygdmlld1xuXHQgKiBAcmV0dXJucyBUaGUgbGV2ZWxcblx0ICovXG5cdF9nZXRWaWV3TGV2ZWxGcm9tUGF0dGVybihzUGF0dGVybjogc3RyaW5nLCB2aWV3TGV2ZWw6IG51bWJlcik6IG51bWJlciB7XG5cdFx0c1BhdHRlcm4gPSBzUGF0dGVybi5yZXBsYWNlKFwiOj9xdWVyeTpcIiwgXCJcIik7XG5cdFx0Y29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKFwiL1teL10qJFwiKTtcblx0XHRpZiAoc1BhdHRlcm4gJiYgc1BhdHRlcm5bMF0gIT09IFwiL1wiICYmIHNQYXR0ZXJuWzBdICE9PSBcIj9cIikge1xuXHRcdFx0c1BhdHRlcm4gPSBgLyR7c1BhdHRlcm59YDtcblx0XHR9XG5cdFx0aWYgKHNQYXR0ZXJuLmxlbmd0aCkge1xuXHRcdFx0c1BhdHRlcm4gPSBzUGF0dGVybi5yZXBsYWNlKHJlZ2V4LCBcIlwiKTtcblx0XHRcdGlmICh0aGlzLm9Sb3V0ZXIubWF0Y2goc1BhdHRlcm4pIHx8IHNQYXR0ZXJuID09PSBcIlwiKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9nZXRWaWV3TGV2ZWxGcm9tUGF0dGVybihzUGF0dGVybiwgKyt2aWV3TGV2ZWwpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldFZpZXdMZXZlbEZyb21QYXR0ZXJuKHNQYXR0ZXJuLCB2aWV3TGV2ZWwpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdmlld0xldmVsO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRSb3V0ZUluZm9ybWF0aW9uKHNSb3V0ZU5hbWU6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9tUm91dGVzW3NSb3V0ZU5hbWVdO1xuXHR9XG5cblx0X2dldFRhcmdldEluZm9ybWF0aW9uKHNUYXJnZXROYW1lOiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdO1xuXHR9XG5cblx0X2dldENvbXBvbmVudElkKHNPd25lcklkOiBhbnksIHNDb21wb25lbnRJZDogYW55KSB7XG5cdFx0aWYgKHNDb21wb25lbnRJZC5pbmRleE9mKGAke3NPd25lcklkfS0tLWApID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gc0NvbXBvbmVudElkLnN1YnN0cihzT3duZXJJZC5sZW5ndGggKyAzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHNDb21wb25lbnRJZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGFyZ2V0IGluZm9ybWF0aW9uIGZvciBhIGdpdmVuIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHBhcmFtIG9Db21wb25lbnRJbnN0YW5jZSBJbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50XG5cdCAqIEByZXR1cm5zIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgdGFyZ2V0XG5cdCAqL1xuXHRnZXRUYXJnZXRJbmZvcm1hdGlvbkZvcihvQ29tcG9uZW50SW5zdGFuY2U6IGFueSkge1xuXHRcdGNvbnN0IHNUYXJnZXRDb21wb25lbnRJZCA9IHRoaXMuX2dldENvbXBvbmVudElkKG9Db21wb25lbnRJbnN0YW5jZS5fc093bmVySWQsIG9Db21wb25lbnRJbnN0YW5jZS5nZXRJZCgpKTtcblx0XHRsZXQgc0NvcnJlY3RUYXJnZXROYW1lID0gbnVsbDtcblx0XHRPYmplY3Qua2V5cyh0aGlzLl9tVGFyZ2V0cykuZm9yRWFjaCgoc1RhcmdldE5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5pZCA9PT0gc1RhcmdldENvbXBvbmVudElkIHx8IHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS52aWV3SWQgPT09IHNUYXJnZXRDb21wb25lbnRJZCkge1xuXHRcdFx0XHRzQ29ycmVjdFRhcmdldE5hbWUgPSBzVGFyZ2V0TmFtZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0VGFyZ2V0SW5mb3JtYXRpb24oc0NvcnJlY3RUYXJnZXROYW1lKTtcblx0fVxuXG5cdGdldExhc3RTZW1hbnRpY01hcHBpbmcoKTogU2VtYW50aWNNYXBwaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZztcblx0fVxuXG5cdHNldExhc3RTZW1hbnRpY01hcHBpbmcob01hcHBpbmc/OiBTZW1hbnRpY01hcHBpbmcpIHtcblx0XHR0aGlzLm9MYXN0U2VtYW50aWNNYXBwaW5nID0gb01hcHBpbmc7XG5cdH1cblxuXHRuYXZpZ2F0ZVRvKG9Db250ZXh0OiBhbnksIHNSb3V0ZU5hbWU6IGFueSwgbVBhcmFtZXRlck1hcHBpbmc6IGFueSwgYlByZXNlcnZlSGlzdG9yeTogYW55KSB7XG5cdFx0bGV0IHNUYXJnZXRVUkxQcm9taXNlLCBiSXNTdGlja3lNb2RlOiBib29sZWFuO1xuXHRcdGlmIChvQ29udGV4dC5nZXRNb2RlbCgpICYmIG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsICYmIG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkpIHtcblx0XHRcdGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQob0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0fVxuXHRcdGlmICghbVBhcmFtZXRlck1hcHBpbmcpIHtcblx0XHRcdC8vIGlmIHRoZXJlIGlzIG5vIHBhcmFtZXRlciBtYXBwaW5nIGRlZmluZSB0aGlzIG1lYW4gd2UgcmVseSBlbnRpcmVseSBvbiB0aGUgYmluZGluZyBjb250ZXh0IHBhdGhcblx0XHRcdHNUYXJnZXRVUkxQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljUGF0aChvQ29udGV4dCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzVGFyZ2V0VVJMUHJvbWlzZSA9IHRoaXMucHJlcGFyZVBhcmFtZXRlcnMobVBhcmFtZXRlck1hcHBpbmcsIHNSb3V0ZU5hbWUsIG9Db250ZXh0KS50aGVuKChtUGFyYW1ldGVyczogYW55KSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLm9Sb3V0ZXIuZ2V0VVJMKHNSb3V0ZU5hbWUsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gc1RhcmdldFVSTFByb21pc2UudGhlbigoc1RhcmdldFVSTDogYW55KSA9PiB7XG5cdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eS5uYXZUb0hhc2goc1RhcmdldFVSTCwgYlByZXNlcnZlSGlzdG9yeSwgZmFsc2UsIGZhbHNlLCAhYklzU3RpY2t5TW9kZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHJldHVybiBhIG1hcCBvZiByb3V0aW5nIHRhcmdldCBwYXJhbWV0ZXJzIHdoZXJlIHRoZSBiaW5kaW5nIHN5bnRheCBpcyByZXNvbHZlZCB0byB0aGUgY3VycmVudCBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIFBhcmFtZXRlcnMgbWFwIGluIHRoZSBmb3JtYXQgW2s6IHN0cmluZ10gOiBDb21wbGV4QmluZGluZ1N5bnRheFxuXHQgKiBAcGFyYW0gc1RhcmdldFJvdXRlIE5hbWUgb2YgdGhlIHRhcmdldCByb3V0ZVxuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBiaW5kaW5nIGNvbnRleHRcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHRvIHRoZSByb3V0aW5nIHRhcmdldCBwYXJhbWV0ZXJzXG5cdCAqL1xuXHRwcmVwYXJlUGFyYW1ldGVycyhtUGFyYW1ldGVyczogYW55LCBzVGFyZ2V0Um91dGU6IHN0cmluZywgb0NvbnRleHQ6IENvbnRleHQpIHtcblx0XHRsZXQgb1BhcmFtZXRlcnNQcm9taXNlO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRjb25zdCBhQ29udGV4dFBhdGhQYXJ0cyA9IHNDb250ZXh0UGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRjb25zdCBhQWxsUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcyA9IE9iamVjdC5rZXlzKG1QYXJhbWV0ZXJzKS5tYXAoKHNQYXJhbWV0ZXJLZXk6IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBzUGFyYW1ldGVyTWFwcGluZ0V4cHJlc3Npb24gPSBtUGFyYW1ldGVyc1tzUGFyYW1ldGVyS2V5XTtcblx0XHRcdFx0Ly8gV2UgYXNzdW1lIHRoZSBkZWZpbmVkIHBhcmFtZXRlcnMgd2lsbCBiZSBjb21wYXRpYmxlIHdpdGggYSBiaW5kaW5nIGV4cHJlc3Npb25cblx0XHRcdFx0Y29uc3Qgb1BhcnNlZEV4cHJlc3Npb24gPSBCaW5kaW5nUGFyc2VyLmNvbXBsZXhQYXJzZXIoc1BhcmFtZXRlck1hcHBpbmdFeHByZXNzaW9uKTtcblx0XHRcdFx0Y29uc3QgYVBhcnRzID0gb1BhcnNlZEV4cHJlc3Npb24ucGFydHMgfHwgW29QYXJzZWRFeHByZXNzaW9uXTtcblx0XHRcdFx0Y29uc3QgYVJlc29sdmVkUGFyYW1ldGVyUHJvbWlzZXMgPSBhUGFydHMubWFwKGZ1bmN0aW9uIChvUGF0aFBhcnQ6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IGFSZWxhdGl2ZVBhcnRzID0gb1BhdGhQYXJ0LnBhdGguc3BsaXQoXCIuLi9cIik7XG5cdFx0XHRcdFx0Ly8gV2UgZ28gdXAgdGhlIGN1cnJlbnQgY29udGV4dCBwYXRoIGFzIG1hbnkgdGltZXMgYXMgbmVjZXNzYXJ5XG5cdFx0XHRcdFx0Y29uc3QgYUxvY2FsUGFydHMgPSBhQ29udGV4dFBhdGhQYXJ0cy5zbGljZSgwLCBhQ29udGV4dFBhdGhQYXJ0cy5sZW5ndGggLSBhUmVsYXRpdmVQYXJ0cy5sZW5ndGggKyAxKTtcblx0XHRcdFx0XHRhTG9jYWxQYXJ0cy5wdXNoKGFSZWxhdGl2ZVBhcnRzW2FSZWxhdGl2ZVBhcnRzLmxlbmd0aCAtIDFdKTtcblxuXHRcdFx0XHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBhTG9jYWxQYXJ0cy5qb2luKFwiL1wiKTtcblx0XHRcdFx0XHRjb25zdCBvTWV0YUNvbnRleHQgPSAob01ldGFNb2RlbCBhcyBhbnkpLmdldE1ldGFDb250ZXh0KHNQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRcdHJldHVybiBvQ29udGV4dC5yZXF1ZXN0UHJvcGVydHkoc1Byb3BlcnR5UGF0aCkudGhlbihmdW5jdGlvbiAob1ZhbHVlOiBhbnkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9Qcm9wZXJ0eUluZm8gPSBvTWV0YUNvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHRjb25zdCBzRWRtVHlwZSA9IG9Qcm9wZXJ0eUluZm8uJFR5cGU7XG5cdFx0XHRcdFx0XHRyZXR1cm4gT0RhdGFVdGlscy5mb3JtYXRMaXRlcmFsKG9WYWx1ZSwgc0VkbVR5cGUpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYVJlc29sdmVkUGFyYW1ldGVyUHJvbWlzZXMpLnRoZW4oKGFSZXNvbHZlZFBhcmFtZXRlcnM6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gb1BhcnNlZEV4cHJlc3Npb24uZm9ybWF0dGVyXG5cdFx0XHRcdFx0XHQ/IG9QYXJzZWRFeHByZXNzaW9uLmZvcm1hdHRlci5hcHBseSh0aGlzLCBhUmVzb2x2ZWRQYXJhbWV0ZXJzKVxuXHRcdFx0XHRcdFx0OiBhUmVzb2x2ZWRQYXJhbWV0ZXJzLmpvaW4oXCJcIik7XG5cdFx0XHRcdFx0cmV0dXJuIHsga2V5OiBzUGFyYW1ldGVyS2V5LCB2YWx1ZTogdmFsdWUgfTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0b1BhcmFtZXRlcnNQcm9taXNlID0gUHJvbWlzZS5hbGwoYUFsbFJlc29sdmVkUGFyYW1ldGVyUHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKFxuXHRcdFx0XHRhQWxsUmVzb2x2ZWRQYXJhbWV0ZXJzOiB7IGtleTogYW55OyB2YWx1ZTogYW55IH1bXVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IG9QYXJhbWV0ZXJzOiBhbnkgPSB7fTtcblx0XHRcdFx0YUFsbFJlc29sdmVkUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChvUmVzb2x2ZWRQYXJhbWV0ZXI6IHsga2V5OiBhbnk7IHZhbHVlOiBhbnkgfSkge1xuXHRcdFx0XHRcdG9QYXJhbWV0ZXJzW29SZXNvbHZlZFBhcmFtZXRlci5rZXldID0gb1Jlc29sdmVkUGFyYW1ldGVyLnZhbHVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIG9QYXJhbWV0ZXJzO1xuXHRcdFx0fSk7XG5cdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHRMb2cuZXJyb3IoYENvdWxkIG5vdCBwYXJzZSB0aGUgcGFyYW1ldGVycyBmb3IgdGhlIG5hdmlnYXRpb24gdG8gcm91dGUgJHtzVGFyZ2V0Um91dGV9YCk7XG5cdFx0XHRvUGFyYW1ldGVyc1Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9QYXJhbWV0ZXJzUHJvbWlzZTtcblx0fVxuXG5cdF9maXJlUm91dGVNYXRjaEV2ZW50cyhtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0dGhpcy5ldmVudFByb3ZpZGVyLmZpcmVFdmVudChcInJvdXRlTWF0Y2hlZFwiLCBtUGFyYW1ldGVycyk7XG5cdFx0dGhpcy5ldmVudFByb3ZpZGVyLmZpcmVFdmVudChcImFmdGVyUm91dGVNYXRjaGVkXCIsIG1QYXJhbWV0ZXJzKTtcblxuXHRcdEVkaXRTdGF0ZS5jbGVhblByb2Nlc3NlZEVkaXRTdGF0ZSgpOyAvLyBSZXNldCBVSSBzdGF0ZSB3aGVuIGFsbCBiaW5kaW5ncyBoYXZlIGJlZW4gcmVmcmVzaGVkXG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIHRvIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBDb250ZXh0IHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBPcHRpb25hbCwgbWFwIGNvbnRhaW5pbmcgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmNoZWNrTm9IYXNoQ2hhbmdlXSBOYXZpZ2F0ZSB0byB0aGUgY29udGV4dCB3aXRob3V0IGNoYW5naW5nIHRoZSBVUkxcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5hc3luY0NvbnRleHRdIFRoZSBjb250ZXh0IGlzIGNyZWF0ZWQgYXN5bmMsIG5hdmlnYXRlIHRvICguLi4pIGFuZFxuXHQgKiAgICAgICAgICAgICAgICAgICAgd2FpdCBmb3IgUHJvbWlzZSB0byBiZSByZXNvbHZlZCBhbmQgdGhlbiBuYXZpZ2F0ZSBpbnRvIHRoZSBjb250ZXh0XG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYkRlZmVycmVkQ29udGV4dF0gVGhlIGNvbnRleHQgc2hhbGwgYmUgY3JlYXRlZCBkZWZlcnJlZCBhdCB0aGUgdGFyZ2V0IHBhZ2Vcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5lZGl0YWJsZV0gVGhlIHRhcmdldCBwYWdlIHNoYWxsIGJlIGltbWVkaWF0ZWx5IGluIHRoZSBlZGl0IG1vZGUgdG8gYXZvaWQgZmxpY2tlcmluZ1xuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmJQZXJzaXN0T1BTY3JvbGxdIFRoZSBiUGVyc2lzdE9QU2Nyb2xsIHdpbGwgYmUgdXNlZCBmb3Igc2Nyb2xsaW5nIHRvIGZpcnN0IHRhYlxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnVwZGF0ZUZDTExldmVsXSBgKzFgIGlmIHdlIGFkZCBhIGNvbHVtbiBpbiBGQ0wsIGAtMWAgdG8gcmVtb3ZlIGEgY29sdW1uLCAwIHRvIHN0YXkgb24gdGhlIHNhbWUgY29sdW1uXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubm9QcmVzZXJ2YXRpb25DYWNoZV0gRG8gbmF2aWdhdGlvbiB3aXRob3V0IHRha2luZyBpbnRvIGFjY291bnQgdGhlIHByZXNlcnZlZCBjYWNoZSBtZWNoYW5pc21cblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5iUmVjcmVhdGVDb250ZXh0XSBGb3JjZSByZS1jcmVhdGlvbiBvZiB0aGUgY29udGV4dCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBvbmUgcGFzc2VkIGFzIHBhcmFtZXRlclxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmJGb3JjZUZvY3VzXSBGb3JjZXMgZm9jdXMgc2VsZWN0aW9uIGFmdGVyIG5hdmlnYXRpb25cblx0ICogQHBhcmFtIFtvVmlld0RhdGFdIFZpZXcgZGF0YVxuXHQgKiBAcGFyYW0gW29DdXJyZW50VGFyZ2V0SW5mb10gVGhlIHRhcmdldCBpbmZvcm1hdGlvbiBmcm9tIHdoaWNoIHRoZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIG9uY2UgdGhlIG5hdmlnYXRpb24gaXMgdHJpZ2dlcmVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdG5hdmlnYXRlVG9Db250ZXh0KFxuXHRcdG9Db250ZXh0OiBhbnksXG5cdFx0bVBhcmFtZXRlcnM6XG5cdFx0XHR8IHtcblx0XHRcdFx0XHRjaGVja05vSGFzaENoYW5nZT86IGJvb2xlYW47XG5cdFx0XHRcdFx0YXN5bmNDb250ZXh0PzogUHJvbWlzZTxhbnk+O1xuXHRcdFx0XHRcdGJEZWZlcnJlZENvbnRleHQ/OiBib29sZWFuO1xuXHRcdFx0XHRcdGVkaXRhYmxlPzogYm9vbGVhbjtcblx0XHRcdFx0XHR0cmFuc2llbnQ/OiBib29sZWFuO1xuXHRcdFx0XHRcdGJQZXJzaXN0T1BTY3JvbGw/OiBib29sZWFuO1xuXHRcdFx0XHRcdHVwZGF0ZUZDTExldmVsPzogbnVtYmVyO1xuXHRcdFx0XHRcdG5vUHJlc2VydmF0aW9uQ2FjaGU/OiBib29sZWFuO1xuXHRcdFx0XHRcdGJSZWNyZWF0ZUNvbnRleHQ/OiBib29sZWFuO1xuXHRcdFx0XHRcdGJGb3JjZUZvY3VzPzogYm9vbGVhbjtcblx0XHRcdFx0XHR0YXJnZXRQYXRoPzogc3RyaW5nO1xuXHRcdFx0XHRcdHNob3dQbGFjZWhvbGRlcj86IGJvb2xlYW47XG5cdFx0XHRcdFx0YkRyYWZ0TmF2aWdhdGlvbj86IGJvb2xlYW47XG5cdFx0XHRcdFx0cmVhc29uPzogTmF2aWdhdGlvblJlYXNvbjtcblx0XHRcdCAgfVxuXHRcdFx0fCB1bmRlZmluZWQsXG5cdFx0b1ZpZXdEYXRhOiBhbnkgfCB1bmRlZmluZWQsXG5cdFx0b0N1cnJlbnRUYXJnZXRJbmZvOiBhbnkgfCB1bmRlZmluZWRcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0bGV0IHNUYXJnZXRSb3V0ZTogc3RyaW5nID0gXCJcIixcblx0XHRcdG9Sb3V0ZVBhcmFtZXRlcnNQcm9taXNlLFxuXHRcdFx0YklzU3RpY2t5TW9kZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdFx0aWYgKG9Db250ZXh0LmdldE1vZGVsKCkgJiYgb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwpIHtcblx0XHRcdGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQob0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0fVxuXHRcdC8vIE1hbmFnZSBwYXJhbWV0ZXIgbWFwcGluZ1xuXHRcdGlmIChtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy50YXJnZXRQYXRoICYmIG9WaWV3RGF0YSAmJiBvVmlld0RhdGEubmF2aWdhdGlvbikge1xuXHRcdFx0Y29uc3Qgb1JvdXRlRGV0YWlsID0gb1ZpZXdEYXRhLm5hdmlnYXRpb25bbVBhcmFtZXRlcnMudGFyZ2V0UGF0aF0uZGV0YWlsO1xuXHRcdFx0c1RhcmdldFJvdXRlID0gb1JvdXRlRGV0YWlsLnJvdXRlO1xuXG5cdFx0XHRpZiAob1JvdXRlRGV0YWlsLnBhcmFtZXRlcnMpIHtcblx0XHRcdFx0b1JvdXRlUGFyYW1ldGVyc1Byb21pc2UgPSB0aGlzLnByZXBhcmVQYXJhbWV0ZXJzKG9Sb3V0ZURldGFpbC5wYXJhbWV0ZXJzLCBzVGFyZ2V0Um91dGUsIG9Db250ZXh0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgc1RhcmdldFBhdGggPSB0aGlzLl9nZXRQYXRoRnJvbUNvbnRleHQob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHQvLyBJZiB0aGUgcGF0aCBpcyBlbXB0eSwgd2UncmUgc3VwcG9zZWQgdG8gbmF2aWdhdGUgdG8gdGhlIGZpcnN0IHBhZ2Ugb2YgdGhlIGFwcFxuXHRcdC8vIENoZWNrIGlmIHdlIG5lZWQgdG8gZXhpdCBmcm9tIHRoZSBhcHAgaW5zdGVhZFxuXHRcdGlmIChzVGFyZ2V0UGF0aC5sZW5ndGggPT09IDAgJiYgdGhpcy5iRXhpdE9uTmF2aWdhdGVCYWNrVG9Sb290KSB7XG5cdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eS5leGl0RnJvbUFwcCgpO1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgY29udGV4dCBpcyBkZWZlcnJlZCBvciBhc3luYywgd2UgYWRkICguLi4pIHRvIHRoZSBwYXRoXG5cdFx0aWYgKG1QYXJhbWV0ZXJzPy5hc3luY0NvbnRleHQgfHwgbVBhcmFtZXRlcnM/LmJEZWZlcnJlZENvbnRleHQpIHtcblx0XHRcdHNUYXJnZXRQYXRoICs9IFwiKC4uLilcIjtcblx0XHR9XG5cblx0XHQvLyBBZGQgbGF5b3V0IHBhcmFtZXRlciBpZiBuZWVkZWRcblx0XHRjb25zdCBzTGF5b3V0ID0gdGhpcy5fY2FsY3VsYXRlTGF5b3V0KHNUYXJnZXRQYXRoLCBtUGFyYW1ldGVycyk7XG5cdFx0aWYgKHNMYXlvdXQpIHtcblx0XHRcdHNUYXJnZXRQYXRoICs9IGA/bGF5b3V0PSR7c0xheW91dH1gO1xuXHRcdH1cblxuXHRcdC8vIE5hdmlnYXRpb24gcGFyYW1ldGVycyBmb3IgbGF0ZXIgdXNhZ2Vcblx0XHRjb25zdCBvTmF2aWdhdGlvbkluZm8gPSB7XG5cdFx0XHRvQXN5bmNDb250ZXh0OiBtUGFyYW1ldGVycz8uYXN5bmNDb250ZXh0LFxuXHRcdFx0YkRlZmVycmVkQ29udGV4dDogbVBhcmFtZXRlcnM/LmJEZWZlcnJlZENvbnRleHQsXG5cdFx0XHRiVGFyZ2V0RWRpdGFibGU6IG1QYXJhbWV0ZXJzPy5lZGl0YWJsZSxcblx0XHRcdGJQZXJzaXN0T1BTY3JvbGw6IG1QYXJhbWV0ZXJzPy5iUGVyc2lzdE9QU2Nyb2xsLFxuXHRcdFx0dXNlQ29udGV4dDogbVBhcmFtZXRlcnM/LnVwZGF0ZUZDTExldmVsID09PSAtMSB8fCBtUGFyYW1ldGVycz8uYlJlY3JlYXRlQ29udGV4dCA/IHVuZGVmaW5lZCA6IG9Db250ZXh0LFxuXHRcdFx0YkRyYWZ0TmF2aWdhdGlvbjogbVBhcmFtZXRlcnM/LmJEcmFmdE5hdmlnYXRpb24sXG5cdFx0XHRiU2hvd1BsYWNlaG9sZGVyOiBtUGFyYW1ldGVycz8uc2hvd1BsYWNlaG9sZGVyICE9PSB1bmRlZmluZWQgPyBtUGFyYW1ldGVycz8uc2hvd1BsYWNlaG9sZGVyIDogdHJ1ZSxcblx0XHRcdHJlYXNvbjogbVBhcmFtZXRlcnM/LnJlYXNvblxuXHRcdH07XG5cblx0XHRpZiAobVBhcmFtZXRlcnM/LmNoZWNrTm9IYXNoQ2hhbmdlKSB7XG5cdFx0XHQvLyBDaGVjayBpZiB0aGUgbmV3IGhhc2ggaXMgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgb25lXG5cdFx0XHRjb25zdCBzQ3VycmVudEhhc2hOb0FwcFN0YXRlID0gdGhpcy5vUm91dGVyUHJveHkuZ2V0SGFzaCgpLnJlcGxhY2UoL1smP117MX1zYXAtaWFwcC1zdGF0ZT1bQS1aMC05XSsvLCBcIlwiKTtcblx0XHRcdGlmIChzVGFyZ2V0UGF0aCA9PT0gc0N1cnJlbnRIYXNoTm9BcHBTdGF0ZSkge1xuXHRcdFx0XHQvLyBUaGUgaGFzaCBkb2Vzbid0IGNoYW5nZSwgYnV0IHdlIGZpcmUgdGhlIHJvdXRlTWF0Y2ggZXZlbnQgdG8gdHJpZ2dlciBwYWdlIHJlZnJlc2ggLyBiaW5kaW5nXG5cdFx0XHRcdGNvbnN0IG1FdmVudFBhcmFtZXRlcnM6IGFueSA9IHRoaXMub1JvdXRlci5nZXRSb3V0ZUluZm9CeUhhc2godGhpcy5vUm91dGVyUHJveHkuZ2V0SGFzaCgpKTtcblx0XHRcdFx0aWYgKG1FdmVudFBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRtRXZlbnRQYXJhbWV0ZXJzLm5hdmlnYXRpb25JbmZvID0gb05hdmlnYXRpb25JbmZvO1xuXHRcdFx0XHRcdG1FdmVudFBhcmFtZXRlcnMucm91dGVJbmZvcm1hdGlvbiA9IHRoaXMuX2dldFJvdXRlSW5mb3JtYXRpb24odGhpcy5zQ3VycmVudFJvdXRlTmFtZSk7XG5cdFx0XHRcdFx0bUV2ZW50UGFyYW1ldGVycy5yb3V0ZVBhdHRlcm4gPSB0aGlzLnNDdXJyZW50Um91dGVQYXR0ZXJuO1xuXHRcdFx0XHRcdG1FdmVudFBhcmFtZXRlcnMudmlld3MgPSB0aGlzLmFDdXJyZW50Vmlld3M7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eS5zZXRGb2N1c0ZvcmNlZCghIW1QYXJhbWV0ZXJzLmJGb3JjZUZvY3VzKTtcblxuXHRcdFx0XHR0aGlzLl9maXJlUm91dGVNYXRjaEV2ZW50cyhtRXZlbnRQYXJhbWV0ZXJzKTtcblxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChtUGFyYW1ldGVycz8udHJhbnNpZW50ICYmIG1QYXJhbWV0ZXJzLmVkaXRhYmxlID09IHRydWUgJiYgc1RhcmdldFBhdGguaW5kZXhPZihcIiguLi4pXCIpID09PSAtMSkge1xuXHRcdFx0aWYgKHNUYXJnZXRQYXRoLmluZGV4T2YoXCI/XCIpID4gLTEpIHtcblx0XHRcdFx0c1RhcmdldFBhdGggKz0gXCImaS1hY3Rpb249Y3JlYXRlXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzVGFyZ2V0UGF0aCArPSBcIj9pLWFjdGlvbj1jcmVhdGVcIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBDbGVhciB1bmJvdW5kIG1lc3NhZ2VzIHVwb24gbmF2aWdhdGluZyBmcm9tIExSIHRvIE9QXG5cdFx0Ly8gVGhpcyBpcyB0byBlbnN1cmUgc3RhbGUgZXJyb3IgbWVzc2FnZXMgZnJvbSBMUiBhcmUgbm90IHNob3duIHRvIHRoZSB1c2VyIGFmdGVyIG5hdmlnYXRpb24gdG8gT1AuXG5cdFx0aWYgKG9DdXJyZW50VGFyZ2V0SW5mbyAmJiBvQ3VycmVudFRhcmdldEluZm8ubmFtZSA9PT0gXCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnRcIikge1xuXHRcdFx0Y29uc3Qgb1JvdXRlSW5mbyA9IHRoaXMub1JvdXRlci5nZXRSb3V0ZUluZm9CeUhhc2goc1RhcmdldFBhdGgpO1xuXHRcdFx0aWYgKG9Sb3V0ZUluZm8pIHtcblx0XHRcdFx0Y29uc3Qgb1JvdXRlID0gdGhpcy5fZ2V0Um91dGVJbmZvcm1hdGlvbihvUm91dGVJbmZvLm5hbWUpO1xuXHRcdFx0XHRpZiAob1JvdXRlICYmIG9Sb3V0ZS50YXJnZXRzICYmIG9Sb3V0ZS50YXJnZXRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb25zdCBzTGFzdFRhcmdldE5hbWUgPSBvUm91dGUudGFyZ2V0c1tvUm91dGUudGFyZ2V0cy5sZW5ndGggLSAxXTtcblx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0ID0gdGhpcy5fZ2V0VGFyZ2V0SW5mb3JtYXRpb24oc0xhc3RUYXJnZXROYW1lKTtcblx0XHRcdFx0XHRpZiAob1RhcmdldCAmJiBvVGFyZ2V0Lm5hbWUgPT09IFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlXCIpIHtcblx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQWRkIHRoZSBuYXZpZ2F0aW9uIHBhcmFtZXRlcnMgaW4gdGhlIHF1ZXVlXG5cdFx0dGhpcy5uYXZpZ2F0aW9uSW5mb1F1ZXVlLnB1c2gob05hdmlnYXRpb25JbmZvKTtcblxuXHRcdGlmIChzVGFyZ2V0Um91dGUgJiYgb1JvdXRlUGFyYW1ldGVyc1Byb21pc2UpIHtcblx0XHRcdHJldHVybiBvUm91dGVQYXJhbWV0ZXJzUHJvbWlzZS50aGVuKChvUm91dGVQYXJhbWV0ZXJzOiBhbnkpID0+IHtcblx0XHRcdFx0b1JvdXRlUGFyYW1ldGVycy5iSXNTdGlja3lNb2RlID0gYklzU3RpY2t5TW9kZTtcblx0XHRcdFx0dGhpcy5vUm91dGVyLm5hdlRvKHNUYXJnZXRSb3V0ZSwgb1JvdXRlUGFyYW1ldGVycyk7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMub1JvdXRlclByb3h5XG5cdFx0XHQubmF2VG9IYXNoKHNUYXJnZXRQYXRoLCBmYWxzZSwgbVBhcmFtZXRlcnM/Lm5vUHJlc2VydmF0aW9uQ2FjaGUsIG1QYXJhbWV0ZXJzPy5iRm9yY2VGb2N1cywgIWJJc1N0aWNreU1vZGUpXG5cdFx0XHQudGhlbigoYk5hdmlnYXRlZDogYW55KSA9PiB7XG5cdFx0XHRcdGlmICghYk5hdmlnYXRlZCkge1xuXHRcdFx0XHRcdC8vIFRoZSBuYXZpZ2F0aW9uIGRpZCBub3QgaGFwcGVuIC0tPiByZW1vdmUgdGhlIG5hdmlnYXRpb24gcGFyYW1ldGVycyBmcm9tIHRoZSBxdWV1ZSBhcyB0aGV5IHNob3VsZG4ndCBiZSB1c2VkXG5cdFx0XHRcdFx0dGhpcy5uYXZpZ2F0aW9uSW5mb1F1ZXVlLnBvcCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBiTmF2aWdhdGVkO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIHRvIGEgcm91dGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5Sb3V0aW5nI25hdmlnYXRlVG9Sb3V0ZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUm91dGluZ1xuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBzVGFyZ2V0Um91dGVOYW1lIE5hbWUgb2YgdGhlIHRhcmdldCByb3V0ZVxuXHQgKiBAcGFyYW0gW29Sb3V0ZVBhcmFtZXRlcnNdIFBhcmFtZXRlcnMgdG8gYmUgdXNlZCB3aXRoIHJvdXRlIHRvIGNyZWF0ZSB0aGUgdGFyZ2V0IGhhc2hcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZmluYWxpemVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdG5hdmlnYXRlVG9Sb3V0ZShzVGFyZ2V0Um91dGVOYW1lOiBzdHJpbmcsIG9Sb3V0ZVBhcmFtZXRlcnM/OiBhbnkpIHtcblx0XHRjb25zdCBzVGFyZ2V0VVJMID0gdGhpcy5vUm91dGVyLmdldFVSTChzVGFyZ2V0Um91dGVOYW1lLCBvUm91dGVQYXJhbWV0ZXJzKTtcblx0XHRyZXR1cm4gdGhpcy5vUm91dGVyUHJveHkubmF2VG9IYXNoKHNUYXJnZXRVUkwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsICFvUm91dGVQYXJhbWV0ZXJzLmJJc1N0aWNreU1vZGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBvbmUgb2YgdGhlIGN1cnJlbnQgdmlld3Mgb24gdGhlIHNjcmVlbiBpcyBib3VuZCB0byBhIGdpdmVuIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgb3IgYGZhbHNlYCBpZiB0aGUgY3VycmVudCBzdGF0ZSBpcyBpbXBhY3RlZCBvciBub3Rcblx0ICovXG5cdGlzQ3VycmVudFN0YXRlSW1wYWN0ZWRCeShvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cblx0XHQvLyBGaXJzdCwgY2hlY2sgd2l0aCB0aGUgdGVjaG5pY2FsIHBhdGguIFdlIGhhdmUgdG8gdHJ5IGl0LCBiZWNhdXNlIGZvciBsZXZlbCA+IDEsIHdlXG5cdFx0Ly8gdXNlcyB0ZWNobmljYWwga2V5cyBldmVuIGlmIFNlbWFudGljIGtleXMgYXJlIGVuYWJsZWRcblx0XHRpZiAodGhpcy5vUm91dGVyUHJveHkuaXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KHNQYXRoKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIGlmICgvXlteXFwoXFwpXStcXChbXlxcKFxcKV0rXFwpJC8udGVzdChzUGF0aCkpIHtcblx0XHRcdC8vIElmIHRoZSBjdXJyZW50IHBhdGggY2FuIGJlIHNlbWFudGljIChpLmUuIGlzIGxpa2UgeHh4KHl5eSkpXG5cdFx0XHQvLyBjaGVjayB3aXRoIHRoZSBzZW1hbnRpYyBwYXRoIGlmIHdlIGNhbiBmaW5kIGl0XG5cdFx0XHRsZXQgc1NlbWFudGljUGF0aDtcblx0XHRcdGlmICh0aGlzLm9MYXN0U2VtYW50aWNNYXBwaW5nICYmIHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmcudGVjaG5pY2FsUGF0aCA9PT0gc1BhdGgpIHtcblx0XHRcdFx0Ly8gV2UgaGF2ZSBhbHJlYWR5IHJlc29sdmVkIHRoaXMgc2VtYW50aWMgcGF0aFxuXHRcdFx0XHRzU2VtYW50aWNQYXRoID0gdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZy5zZW1hbnRpY1BhdGg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzU2VtYW50aWNQYXRoID0gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNQYXRoKG9Db250ZXh0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHNTZW1hbnRpY1BhdGggIT0gc1BhdGggPyB0aGlzLm9Sb3V0ZXJQcm94eS5pc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkoc1NlbWFudGljUGF0aCkgOiBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdF9maW5kUGF0aFRvTmF2aWdhdGUoc1BhdGg6IGFueSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKFwiL1teL10qJFwiKTtcblx0XHRzUGF0aCA9IHNQYXRoLnJlcGxhY2UocmVnZXgsIFwiXCIpO1xuXHRcdGlmICh0aGlzLm9Sb3V0ZXIubWF0Y2goc1BhdGgpIHx8IHNQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gc1BhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9maW5kUGF0aFRvTmF2aWdhdGUoc1BhdGgpO1xuXHRcdH1cblx0fVxuXG5cdF9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cblx0XHQvLyBGaXJzdCwgY2hlY2sgaWYgdGhpcyBpcyBhIGxldmVsLTEgb2JqZWN0IChwYXRoID0gL2FhYShiYmIpKVxuXHRcdGlmICghL15cXC9bXlxcKF0rXFwoW15cXCldK1xcKSQvLnRlc3Qoc1BhdGgpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlbiBjaGVjayBpZiB0aGUgZW50aXR5IGhhcyBzZW1hbnRpYyBrZXlzXG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgc0VudGl0eVNldE5hbWUgPSBvTWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KG9Db250ZXh0LmdldFBhdGgoKSkuZ2V0T2JqZWN0KFwiQHNhcHVpLm5hbWVcIikgYXMgc3RyaW5nO1xuXHRcdGlmICghU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNLZXlzKG9NZXRhTW9kZWwsIHNFbnRpdHlTZXROYW1lKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIFRoZW4gY2hlY2sgdGhlIGVudGl0eSBpcyBkcmFmdC1lbmFibGVkXG5cdFx0cmV0dXJuIE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob01ldGFNb2RlbCwgc1BhdGgpO1xuXHR9XG5cblx0X2dldFBhdGhGcm9tQ29udGV4dChvQ29udGV4dDogYW55LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0bGV0IHNQYXRoO1xuXG5cdFx0aWYgKG9Db250ZXh0LmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpICYmIG9Db250ZXh0LmlzUmVsYXRpdmUoKSkge1xuXHRcdFx0c1BhdGggPSBvQ29udGV4dC5nZXRIZWFkZXJDb250ZXh0KCkuZ2V0UGF0aCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWwgPT09IC0xKSB7XG5cdFx0XHQvLyBXaGVuIG5hdmlnYXRpbmcgYmFjayBmcm9tIGEgY29udGV4dCwgd2UgbmVlZCB0byByZW1vdmUgdGhlIGxhc3QgY29tcG9uZW50IG9mIHRoZSBwYXRoXG5cdFx0XHRzUGF0aCA9IHRoaXMuX2ZpbmRQYXRoVG9OYXZpZ2F0ZShzUGF0aCk7XG5cblx0XHRcdC8vIENoZWNrIGlmIHdlJ3JlIG5hdmlnYXRpbmcgYmFjayB0byBhIHNlbWFudGljIHBhdGggdGhhdCB3YXMgcHJldmlvdXNseSByZXNvbHZlZFxuXHRcdFx0aWYgKHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmcgJiYgdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZy50ZWNobmljYWxQYXRoID09PSBzUGF0aCkge1xuXHRcdFx0XHRzUGF0aCA9IHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmcuc2VtYW50aWNQYXRoO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGhpcy5fY2hlY2tJZkNvbnRleHRTdXBwb3J0c1NlbWFudGljUGF0aChvQ29udGV4dCkpIHtcblx0XHRcdC8vIFdlIGNoZWNrIGlmIHdlIGhhdmUgdG8gdXNlIGEgc2VtYW50aWMgcGF0aFxuXHRcdFx0Y29uc3Qgc1NlbWFudGljUGF0aCA9IFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljUGF0aChvQ29udGV4dCwgdHJ1ZSk7XG5cblx0XHRcdGlmICghc1NlbWFudGljUGF0aCkge1xuXHRcdFx0XHQvLyBXZSB3ZXJlIG5vdCBhYmxlIHRvIGJ1aWxkIHRoZSBzZW1hbnRpYyBwYXRoIC0tPiBVc2UgdGhlIHRlY2huaWNhbCBwYXRoIGFuZFxuXHRcdFx0XHQvLyBjbGVhciB0aGUgcHJldmlvdXMgbWFwcGluZywgb3RoZXJ3aXNlIHRoZSBvbGQgbWFwcGluZyBpcyB1c2VkIGluIEVkaXRGbG93I3VwZGF0ZURvY3VtZW50XG5cdFx0XHRcdC8vIGFuZCBpdCBsZWFkcyB0byB1bndhbnRlZCBwYWdlIHJlbG9hZHNcblx0XHRcdFx0dGhpcy5zZXRMYXN0U2VtYW50aWNNYXBwaW5nKHVuZGVmaW5lZCk7XG5cdFx0XHR9IGVsc2UgaWYgKHNTZW1hbnRpY1BhdGggIT09IHNQYXRoKSB7XG5cdFx0XHRcdC8vIFN0b3JlIHRoZSBtYXBwaW5nIHRlY2huaWNhbCA8LT4gc2VtYW50aWMgcGF0aCB0byBhdm9pZCByZWNhbGN1bGF0aW5nIGl0IGxhdGVyXG5cdFx0XHRcdC8vIGFuZCB1c2UgdGhlIHNlbWFudGljIHBhdGggaW5zdGVhZCBvZiB0aGUgdGVjaG5pY2FsIG9uZVxuXHRcdFx0XHR0aGlzLnNldExhc3RTZW1hbnRpY01hcHBpbmcoeyB0ZWNobmljYWxQYXRoOiBzUGF0aCwgc2VtYW50aWNQYXRoOiBzU2VtYW50aWNQYXRoIH0pO1xuXHRcdFx0XHRzUGF0aCA9IHNTZW1hbnRpY1BhdGg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlIGV4dHJhICcvJyBhdCB0aGUgYmVnaW5uaW5nIG9mIHBhdGhcblx0XHRpZiAoc1BhdGhbMF0gPT09IFwiL1wiKSB7XG5cdFx0XHRzUGF0aCA9IHNQYXRoLnN1YnN0cmluZygxKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc1BhdGg7XG5cdH1cblxuXHRfY2FsY3VsYXRlTGF5b3V0KHNQYXRoOiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRsZXQgRkNMTGV2ZWwgPSBtUGFyYW1ldGVycy5GQ0xMZXZlbDtcblx0XHRpZiAobVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWwpIHtcblx0XHRcdEZDTExldmVsICs9IG1QYXJhbWV0ZXJzLnVwZGF0ZUZDTExldmVsO1xuXHRcdFx0aWYgKEZDTExldmVsIDwgMCkge1xuXHRcdFx0XHRGQ0xMZXZlbCA9IDA7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuICh0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55KS5jYWxjdWxhdGVMYXlvdXQoXG5cdFx0XHRGQ0xMZXZlbCxcblx0XHRcdHNQYXRoLFxuXHRcdFx0bVBhcmFtZXRlcnMuc0xheW91dCxcblx0XHRcdG1QYXJhbWV0ZXJzLmtlZXBDdXJyZW50TGF5b3V0XG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIGJlZm9yZSBhIHJvdXRlIGlzIG1hdGNoZWQuXG5cdCAqIERpc3BsYXlzIGEgYnVzeSBpbmRpY2F0b3IuXG5cdCAqXG5cdCAqL1xuXHRfYmVmb3JlUm91dGVNYXRjaGVkKC8qb0V2ZW50OiBFdmVudCovKSB7XG5cdFx0Y29uc3QgYlBsYWNlaG9sZGVyRW5hYmxlZCA9IG5ldyBQbGFjZWhvbGRlcigpLmlzUGxhY2Vob2xkZXJFbmFibGVkKCk7XG5cdFx0aWYgKCFiUGxhY2Vob2xkZXJFbmFibGVkKSB7XG5cdFx0XHRjb25zdCBvUm9vdFZpZXcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRcdEJ1c3lMb2NrZXIubG9jayhvUm9vdFZpZXcpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIHdoZW4gYSByb3V0ZSBpcyBtYXRjaGVkLlxuXHQgKiBIaWRlcyB0aGUgYnVzeSBpbmRpY2F0b3IgYW5kIGZpcmVzIGl0cyBvd24gJ3JvdXRlbWF0Y2hlZCcgZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50XG5cdCAqL1xuXHRfb25Sb3V0ZU1hdGNoZWQob0V2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IG9BcHBTdGF0ZUhhbmRsZXIgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0QXBwU3RhdGVIYW5kbGVyKCksXG5cdFx0XHRvUm9vdFZpZXcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRjb25zdCBiUGxhY2Vob2xkZXJFbmFibGVkID0gbmV3IFBsYWNlaG9sZGVyKCkuaXNQbGFjZWhvbGRlckVuYWJsZWQoKTtcblx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvUm9vdFZpZXcpICYmICFiUGxhY2Vob2xkZXJFbmFibGVkKSB7XG5cdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvUm9vdFZpZXcpO1xuXHRcdH1cblx0XHRjb25zdCBtUGFyYW1ldGVyczogYW55ID0gb0V2ZW50LmdldFBhcmFtZXRlcnMoKTtcblx0XHRpZiAodGhpcy5uYXZpZ2F0aW9uSW5mb1F1ZXVlLmxlbmd0aCkge1xuXHRcdFx0bVBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8gPSB0aGlzLm5hdmlnYXRpb25JbmZvUXVldWVbMF07XG5cdFx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUgPSB0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUuc2xpY2UoMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzLm5hdmlnYXRpb25JbmZvID0ge307XG5cdFx0fVxuXHRcdGlmIChvQXBwU3RhdGVIYW5kbGVyLmNoZWNrSWZSb3V0ZUNoYW5nZWRCeUlBcHAoKSkge1xuXHRcdFx0bVBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8ucmVhc29uID0gTmF2aWdhdGlvblJlYXNvbi5BcHBTdGF0ZUNoYW5nZWQ7XG5cdFx0XHRvQXBwU3RhdGVIYW5kbGVyLnJlc2V0Um91dGVDaGFuZ2VkQnlJQXBwKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zQ3VycmVudFJvdXRlTmFtZSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJuYW1lXCIpO1xuXHRcdHRoaXMuc0N1cnJlbnRSb3V0ZVBhdHRlcm4gPSBtUGFyYW1ldGVycy5jb25maWcucGF0dGVybjtcblx0XHR0aGlzLmFDdXJyZW50Vmlld3MgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmlld3NcIik7XG5cblx0XHRtUGFyYW1ldGVycy5yb3V0ZUluZm9ybWF0aW9uID0gdGhpcy5fZ2V0Um91dGVJbmZvcm1hdGlvbih0aGlzLnNDdXJyZW50Um91dGVOYW1lKTtcblx0XHRtUGFyYW1ldGVycy5yb3V0ZVBhdHRlcm4gPSB0aGlzLnNDdXJyZW50Um91dGVQYXR0ZXJuO1xuXG5cdFx0dGhpcy5fZmlyZVJvdXRlTWF0Y2hFdmVudHMobVBhcmFtZXRlcnMpO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgY3VycmVudCBoYXNoIGhhcyBiZWVuIHNldCBieSB0aGUgcm91dGVyUHJveHkubmF2VG9IYXNoIGZ1bmN0aW9uXG5cdFx0Ly8gSWYgbm90LCByZWJ1aWxkIGhpc3RvcnkgcHJvcGVybHkgKGJvdGggaW4gdGhlIGJyb3dzZXIgYW5kIHRoZSBSb3V0ZXJQcm94eSlcblx0XHRpZiAoIWhpc3Rvcnkuc3RhdGUgfHwgaGlzdG9yeS5zdGF0ZS5mZUxldmVsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMub1JvdXRlclByb3h5XG5cdFx0XHRcdC5yZXN0b3JlSGlzdG9yeSgpXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eS5yZXNvbHZlUm91dGVNYXRjaCgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVzdG9yaW5nIGhpc3RvcnlcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMub1JvdXRlclByb3h5LnJlc29sdmVSb3V0ZU1hdGNoKCk7XG5cdFx0fVxuXHR9XG5cblx0YXR0YWNoUm91dGVNYXRjaGVkKG9EYXRhOiBhbnksIGZuRnVuY3Rpb24/OiBhbnksIG9MaXN0ZW5lcj86IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5hdHRhY2hFdmVudChcInJvdXRlTWF0Y2hlZFwiLCBvRGF0YSwgZm5GdW5jdGlvbiwgb0xpc3RlbmVyKTtcblx0fVxuXHRkZXRhY2hSb3V0ZU1hdGNoZWQoZm5GdW5jdGlvbjogYW55LCBvTGlzdGVuZXI/OiBhbnkpIHtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuZGV0YWNoRXZlbnQoXCJyb3V0ZU1hdGNoZWRcIiwgZm5GdW5jdGlvbiwgb0xpc3RlbmVyKTtcblx0fVxuXHRhdHRhY2hBZnRlclJvdXRlTWF0Y2hlZChvRGF0YTogYW55LCBmbkZ1bmN0aW9uOiBhbnksIG9MaXN0ZW5lcj86IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5hdHRhY2hFdmVudChcImFmdGVyUm91dGVNYXRjaGVkXCIsIG9EYXRhLCBmbkZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cdGRldGFjaEFmdGVyUm91dGVNYXRjaGVkKGZuRnVuY3Rpb246IGFueSwgb0xpc3RlbmVyOiBhbnkpIHtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuZGV0YWNoRXZlbnQoXCJhZnRlclJvdXRlTWF0Y2hlZFwiLCBmbkZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cblx0Z2V0Um91dGVGcm9tSGFzaChvUm91dGVyOiBhbnksIG9BcHBDb21wb25lbnQ6IGFueSkge1xuXHRcdGNvbnN0IHNIYXNoID0gb1JvdXRlci5nZXRIYXNoQ2hhbmdlcigpLmhhc2g7XG5cdFx0Y29uc3Qgb1JvdXRlSW5mbyA9IG9Sb3V0ZXIuZ2V0Um91dGVJbmZvQnlIYXNoKHNIYXNoKTtcblx0XHRyZXR1cm4gb0FwcENvbXBvbmVudFxuXHRcdFx0LmdldE1ldGFkYXRhKClcblx0XHRcdC5nZXRNYW5pZmVzdEVudHJ5KFwiL3NhcC51aTUvcm91dGluZy9yb3V0ZXNcIilcblx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9Sb3V0ZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvUm91dGUubmFtZSA9PT0gb1JvdXRlSW5mby5uYW1lO1xuXHRcdFx0fSlbMF07XG5cdH1cblx0Z2V0VGFyZ2V0c0Zyb21Sb3V0ZShvUm91dGU6IGFueSkge1xuXHRcdGNvbnN0IG9UYXJnZXQgPSBvUm91dGUudGFyZ2V0O1xuXHRcdGlmICh0eXBlb2Ygb1RhcmdldCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cmV0dXJuIFt0aGlzLl9tVGFyZ2V0c1tvVGFyZ2V0XV07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGFUYXJnZXQ6IGFueVtdID0gW107XG5cdFx0XHRvVGFyZ2V0LmZvckVhY2goKHNUYXJnZXQ6IGFueSkgPT4ge1xuXHRcdFx0XHRhVGFyZ2V0LnB1c2godGhpcy5fbVRhcmdldHNbc1RhcmdldF0pO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gYVRhcmdldDtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBpbml0aWFsaXplUm91dGluZygpIHtcblx0XHQvLyBBdHRhY2ggcm91dGVyIGhhbmRsZXJzXG5cdFx0YXdhaXQgQ29sbGFib3JhdGlvbkhlbHBlci5wcm9jZXNzQW5kRXhwYW5kSGFzaCgpO1xuXHRcdHRoaXMuX2ZuT25Sb3V0ZU1hdGNoZWQgPSB0aGlzLl9vblJvdXRlTWF0Y2hlZC5iaW5kKHRoaXMpO1xuXHRcdHRoaXMub1JvdXRlci5hdHRhY2hSb3V0ZU1hdGNoZWQodGhpcy5fZm5PblJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0Y29uc3QgYlBsYWNlaG9sZGVyRW5hYmxlZCA9IG5ldyBQbGFjZWhvbGRlcigpLmlzUGxhY2Vob2xkZXJFbmFibGVkKCk7XG5cdFx0aWYgKCFiUGxhY2Vob2xkZXJFbmFibGVkKSB7XG5cdFx0XHR0aGlzLm9Sb3V0ZXIuYXR0YWNoQmVmb3JlUm91dGVNYXRjaGVkKHRoaXMuX2JlZm9yZVJvdXRlTWF0Y2hlZC5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdFx0Ly8gUmVzZXQgaW50ZXJuYWwgc3RhdGVcblx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUgPSBbXTtcblx0XHRFZGl0U3RhdGUucmVzZXRFZGl0U3RhdGUoKTtcblx0XHR0aGlzLmJFeGl0T25OYXZpZ2F0ZUJhY2tUb1Jvb3QgPSAhdGhpcy5vUm91dGVyLm1hdGNoKFwiXCIpO1xuXG5cdFx0Y29uc3QgYklzSWFwcFN0YXRlID0gdGhpcy5vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkuZ2V0SGFzaCgpLmluZGV4T2YoXCJzYXAtaWFwcC1zdGF0ZVwiKSAhPT0gLTE7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG9TdGFydHVwUGFyYW1ldGVycyA9IGF3YWl0IHRoaXMub0FwcENvbXBvbmVudC5nZXRTdGFydHVwUGFyYW1ldGVycygpO1xuXHRcdFx0Y29uc3QgYkhhc1N0YXJ0VXBQYXJhbWV0ZXJzID0gb1N0YXJ0dXBQYXJhbWV0ZXJzICE9PSB1bmRlZmluZWQgJiYgT2JqZWN0LmtleXMob1N0YXJ0dXBQYXJhbWV0ZXJzKS5sZW5ndGggIT09IDA7XG5cdFx0XHRjb25zdCBzSGFzaCA9IHRoaXMub1JvdXRlci5nZXRIYXNoQ2hhbmdlcigpLmdldEhhc2goKTtcblx0XHRcdC8vIE1hbmFnZSBzdGFydHVwIHBhcmFtZXRlcnMgKGluIGNhc2Ugb2Ygbm8gaWFwcC1zdGF0ZSlcblx0XHRcdGlmICghYklzSWFwcFN0YXRlICYmIGJIYXNTdGFydFVwUGFyYW1ldGVycyAmJiAhc0hhc2gpIHtcblx0XHRcdFx0aWYgKG9TdGFydHVwUGFyYW1ldGVycy5wcmVmZXJyZWRNb2RlICYmIG9TdGFydHVwUGFyYW1ldGVycy5wcmVmZXJyZWRNb2RlWzBdLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihcIkNSRUFURVwiKSAhPT0gLTEpIHtcblx0XHRcdFx0XHQvLyBDcmVhdGUgbW9kZVxuXHRcdFx0XHRcdC8vIFRoaXMgY2hlY2sgd2lsbCBjYXRjaCBtdWx0aXBsZSBtb2RlcyBsaWtlIGNyZWF0ZSwgY3JlYXRlV2l0aCBhbmQgYXV0b0NyZWF0ZVdpdGggd2hpY2ggYWxsIG5lZWRcblx0XHRcdFx0XHQvLyB0byBiZSBoYW5kbGVkIGxpa2UgY3JlYXRlIHN0YXJ0dXAhXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5fbWFuYWdlQ3JlYXRlU3RhcnR1cChvU3RhcnR1cFBhcmFtZXRlcnMpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIERlZXAgbGlua1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMuX21hbmFnZURlZXBMaW5rU3RhcnR1cChvU3RhcnR1cFBhcmFtZXRlcnMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAob0Vycm9yOiB1bmtub3duKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciBkdXJpbmcgcm91dGluZyBpbml0aWFsaXphdGlvblwiLCBvRXJyb3IgYXMgc3RyaW5nKTtcblx0XHR9XG5cdH1cblxuXHRnZXREZWZhdWx0Q3JlYXRlSGFzaChvU3RhcnR1cFBhcmFtZXRlcnM/OiBhbnkpIHtcblx0XHRyZXR1cm4gQXBwU3RhcnR1cEhlbHBlci5nZXREZWZhdWx0Q3JlYXRlSGFzaChvU3RhcnR1cFBhcmFtZXRlcnMsIHRoaXMuZ2V0Q29udGV4dFBhdGgoKSwgdGhpcy5vUm91dGVyKTtcblx0fVxuXG5cdF9tYW5hZ2VDcmVhdGVTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVyczogYW55KSB7XG5cdFx0cmV0dXJuIEFwcFN0YXJ0dXBIZWxwZXIuZ2V0Q3JlYXRlU3RhcnR1cEhhc2gob1N0YXJ0dXBQYXJhbWV0ZXJzLCB0aGlzLmdldENvbnRleHRQYXRoKCksIHRoaXMub1JvdXRlciwgdGhpcy5vTWV0YU1vZGVsKS50aGVuKFxuXHRcdFx0KHNOZXdIYXNoOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKHNOZXdIYXNoKSB7XG5cdFx0XHRcdFx0KHRoaXMub1JvdXRlci5nZXRIYXNoQ2hhbmdlcigpLnJlcGxhY2VIYXNoIGFzIGFueSkoc05ld0hhc2gpO1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVycz8ucHJlZmVycmVkTW9kZSAmJlxuXHRcdFx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGVbMF0udG9VcHBlckNhc2UoKS5pbmRleE9mKFwiQVVUT0NSRUFURVwiKSAhPT0gLTFcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdHRoaXMub0FwcENvbXBvbmVudC5zZXRTdGFydHVwTW9kZUF1dG9DcmVhdGUoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5vQXBwQ29tcG9uZW50LnNldFN0YXJ0dXBNb2RlQ3JlYXRlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuYkV4aXRPbk5hdmlnYXRlQmFja1RvUm9vdCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHQpO1xuXHR9XG5cblx0X21hbmFnZURlZXBMaW5rU3RhcnR1cChvU3RhcnR1cFBhcmFtZXRlcnM6IGFueSkge1xuXHRcdHJldHVybiBBcHBTdGFydHVwSGVscGVyLmdldERlZXBMaW5rU3RhcnR1cEhhc2goXG5cdFx0XHQodGhpcy5vQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0KCkgYXMgYW55KVtcInNhcC51aTVcIl0ucm91dGluZyxcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyxcblx0XHRcdHRoaXMub01vZGVsXG5cdFx0KS50aGVuKChvRGVlcExpbms6IGFueSkgPT4ge1xuXHRcdFx0bGV0IHNIYXNoO1xuXHRcdFx0aWYgKG9EZWVwTGluay5jb250ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IHNUZWNobmljYWxQYXRoID0gb0RlZXBMaW5rLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0XHRjb25zdCBzU2VtYW50aWNQYXRoID0gdGhpcy5fY2hlY2tJZkNvbnRleHRTdXBwb3J0c1NlbWFudGljUGF0aChvRGVlcExpbmsuY29udGV4dClcblx0XHRcdFx0XHQ/IFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljUGF0aChvRGVlcExpbmsuY29udGV4dClcblx0XHRcdFx0XHQ6IHNUZWNobmljYWxQYXRoO1xuXG5cdFx0XHRcdGlmIChzU2VtYW50aWNQYXRoICE9PSBzVGVjaG5pY2FsUGF0aCkge1xuXHRcdFx0XHRcdC8vIFN0b3JlIHRoZSBtYXBwaW5nIHRlY2huaWNhbCA8LT4gc2VtYW50aWMgcGF0aCB0byBhdm9pZCByZWNhbGN1bGF0aW5nIGl0IGxhdGVyXG5cdFx0XHRcdFx0Ly8gYW5kIHVzZSB0aGUgc2VtYW50aWMgcGF0aCBpbnN0ZWFkIG9mIHRoZSB0ZWNobmljYWwgb25lXG5cdFx0XHRcdFx0dGhpcy5zZXRMYXN0U2VtYW50aWNNYXBwaW5nKHsgdGVjaG5pY2FsUGF0aDogc1RlY2huaWNhbFBhdGgsIHNlbWFudGljUGF0aDogc1NlbWFudGljUGF0aCB9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHNIYXNoID0gc1NlbWFudGljUGF0aC5zdWJzdHJpbmcoMSk7IC8vIFRvIHJlbW92ZSB0aGUgbGVhZGluZyAnLydcblx0XHRcdH0gZWxzZSBpZiAob0RlZXBMaW5rLmhhc2gpIHtcblx0XHRcdFx0c0hhc2ggPSBvRGVlcExpbmsuaGFzaDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHNIYXNoKSB7XG5cdFx0XHRcdC8vUmVwbGFjZSB0aGUgaGFzaCB3aXRoIG5ld2x5IGNyZWF0ZWQgaGFzaFxuXHRcdFx0XHQodGhpcy5vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkucmVwbGFjZUhhc2ggYXMgYW55KShzSGFzaCk7XG5cdFx0XHRcdHRoaXMub0FwcENvbXBvbmVudC5zZXRTdGFydHVwTW9kZURlZXBsaW5rKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRPdXRib3VuZHMoKSB7XG5cdFx0cmV0dXJuIHRoaXMub3V0Ym91bmRzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIG5hbWUgb2YgdGhlIERyYWZ0IHJvb3QgZW50aXR5IHNldCBvciB0aGUgc3RpY2t5LWVuYWJsZWQgZW50aXR5IHNldC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIG5hbWUgb2YgdGhlIHJvb3QgRW50aXR5U2V0XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0Q29udGV4dFBhdGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc0NvbnRleHRQYXRoO1xuXHR9XG5cdGdldEludGVyZmFjZSgpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cbmNsYXNzIFJvdXRpbmdTZXJ2aWNlRmFjdG9yeSBleHRlbmRzIFNlcnZpY2VGYWN0b3J5PFJvdXRpbmdTZXJ2aWNlU2V0dGluZ3M+IHtcblx0Y3JlYXRlSW5zdGFuY2Uob1NlcnZpY2VDb250ZXh0OiBTZXJ2aWNlQ29udGV4dDxSb3V0aW5nU2VydmljZVNldHRpbmdzPikge1xuXHRcdGNvbnN0IG9Sb3V0aW5nU2VydmljZSA9IG5ldyBSb3V0aW5nU2VydmljZShvU2VydmljZUNvbnRleHQpO1xuXHRcdHJldHVybiBvUm91dGluZ1NlcnZpY2UuaW5pdFByb21pc2U7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGluZ1NlcnZpY2VGYWN0b3J5O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7OztNQTJCTUEsc0JBQXNCLFdBRDNCQyxjQUFjLENBQUMsNkNBQTZDLENBQUMsVUFFNURDLEtBQUssRUFBRSxVQUVQQSxLQUFLLEVBQUU7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7RUFBQSxFQUg0QkMsYUFBYTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsSUFXckNDLGNBQWM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBLE9BZ0IxQkMsbUJBQW1CLEdBQVUsRUFBRTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUEsT0FHL0JDLElBQUksR0FBSixnQkFBTztNQUNOLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNDLFVBQVUsRUFBRTtNQUNsQyxJQUFJRCxRQUFRLENBQUNFLFNBQVMsS0FBSyxXQUFXLEVBQUU7UUFBQTtRQUN2QyxJQUFJLENBQUNDLGFBQWEsR0FBR0gsUUFBUSxD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