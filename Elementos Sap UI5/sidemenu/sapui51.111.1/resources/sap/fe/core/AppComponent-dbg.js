/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/AppStateHandler", "sap/fe/core/controllerextensions/routing/RouterProxy", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/library", "sap/fe/core/manifestMerger/ChangePageConfiguration", "sap/fe/core/support/Diagnostics", "sap/ui/core/Core", "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "./converters/MetaModelConverter", "./helpers/SemanticDateOperators"], function (Log, AppStateHandler, RouterProxy, ClassSupport, ModelHelper, library, ChangePageConfiguration, Diagnostics, Core, UIComponent, JSONModel, MetaModelConverter, SemanticDateOperators) {
  "use strict";

  var _dec, _class, _class2;
  var deleteModelCacheData = MetaModelConverter.deleteModelCacheData;
  var changeConfiguration = ChangePageConfiguration.changeConfiguration;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  const StartupMode = library.StartupMode;
  const NAVCONF = {
    FCL: {
      VIEWNAME: "sap.fe.core.rootView.Fcl",
      VIEWNAME_COMPATIBILITY: "sap.fe.templates.RootContainer.view.Fcl",
      ROUTERCLASS: "sap.f.routing.Router"
    },
    NAVCONTAINER: {
      VIEWNAME: "sap.fe.core.rootView.NavContainer",
      VIEWNAME_COMPATIBILITY: "sap.fe.templates.RootContainer.view.NavContainer",
      ROUTERCLASS: "sap.m.routing.Router"
    }
  };
  /**
   * Main class for components used for an application in SAP Fiori elements.
   *
   * Application developers using the templates and building blocks provided by SAP Fiori elements should create their apps by extending this component.
   * This ensures that all the necessary services that you need for the building blocks and templates to work properly are started.
   *
   * When you use sap.fe.core.AppComponent as the base component, you also need to use a rootView. SAP Fiori elements provides two options: <br/>
   *  - sap.fe.core.rootView.NavContainer when using sap.m.routing.Router <br/>
   *  - sap.fe.core.rootView.Fcl when using sap.f.routing.Router (FCL use case) <br/>
   *
   * @hideconstructor
   * @public
   * @name sap.fe.core.AppComponent
   */
  let AppComponent = (_dec = defineUI5Class("sap.fe.core.AppComponent", {
    interfaces: ["sap.ui.core.IAsyncContentCreation"],
    config: {
      fullWidth: true
    },
    manifest: {
      "sap.ui5": {
        services: {
          resourceModel: {
            factoryName: "sap.fe.core.services.ResourceModelService",
            startup: "waitFor",
            settings: {
              bundles: ["sap.fe.core.messagebundle"],
              modelName: "sap.fe.i18n"
            }
          },
          routingService: {
            factoryName: "sap.fe.core.services.RoutingService",
            startup: "waitFor"
          },
          shellServices: {
            factoryName: "sap.fe.core.services.ShellServices",
            startup: "waitFor"
          },
          ShellUIService: {
            factoryName: "sap.ushell.ui5service.ShellUIService"
          },
          navigationService: {
            factoryName: "sap.fe.core.services.NavigationService",
            startup: "waitFor"
          },
          environmentCapabilities: {
            factoryName: "sap.fe.core.services.EnvironmentService",
            startup: "waitFor"
          },
          sideEffectsService: {
            factoryName: "sap.fe.core.services.SideEffectsService",
            startup: "waitFor"
          },
          asyncComponentService: {
            factoryName: "sap.fe.core.services.AsyncComponentService",
            startup: "waitFor"
          }
        },
        rootView: {
          viewName: NAVCONF.NAVCONTAINER.VIEWNAME,
          type: "XML",
          async: true,
          id: "appRootView"
        },
        routing: {
          config: {
            controlId: "appContent",
            routerClass: NAVCONF.NAVCONTAINER.ROUTERCLASS,
            viewType: "XML",
            controlAggregation: "pages",
            async: true,
            containerOptions: {
              propagateModel: true
            }
          }
        }
      }
    },
    designtime: "sap/fe/core/designtime/AppComponent.designtime",
    library: "sap.fe.core"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_UIComponent) {
    _inheritsLoose(AppComponent, _UIComponent);
    function AppComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _UIComponent.call(this, ...args) || this;
      _this.startupMode = StartupMode.Normal;
      return _this;
    }
    var _proto = AppComponent.prototype;
    /**
     * @private
     * @name sap.fe.core.AppComponent.getMetadata
     * @function
     */
    _proto._isFclEnabled = function _isFclEnabled() {
      var _oManifestUI5$routing, _oManifestUI5$routing2;
      const oManifestUI5 = this.getManifestEntry("sap.ui5");
      return (oManifestUI5 === null || oManifestUI5 === void 0 ? void 0 : (_oManifestUI5$routing = oManifestUI5.routing) === null || _oManifestUI5$routing === void 0 ? void 0 : (_oManifestUI5$routing2 = _oManifestUI5$routing.config) === null || _oManifestUI5$routing2 === void 0 ? void 0 : _oManifestUI5$routing2.routerClass) === NAVCONF.FCL.ROUTERCLASS;
    }

    /**
     * Provides a hook to initialize feature toggles.
     *
     * This hook is being called by the SAP Fiori elements AppComponent at the time feature toggles can be initialized.
     * To change page configuration use the {@link sap.fe.core.AppComponent#changePageConfiguration} method.
     *
     * @function
     * @name sap.fe.core.AppComponent#initializeFeatureToggles
     * @memberof sap.fe.core.AppComponent
     * @public
     */;
    _proto.initializeFeatureToggles = function initializeFeatureToggles() {
      // this method can be overridden by applications
    }

    /**
     * Changes the page configuration of SAP Fiori elements.
     *
     * This method enables you to change the page configuration of SAP Fiori elements.
     *
     * @function
     * @name sap.fe.core.AppComponent#changePageConfiguration
     * @memberof sap.fe.core.AppComponent
     * @param pageId The ID of the page for which the configuration is to be changed.
     * @param path The path in the page settings for which the configuration is to be changed.
     * @param value The new value of the configuration. This could be a plain value like a string, or a Boolean, or a structured object.
     * @public
     */;
    _proto.changePageConfiguration = function changePageConfiguration(pageId, path, value) {
      changeConfiguration(this.getManifest(), pageId, path, value);
    }

    /**
     * Get a reference to the RouterProxy.
     *
     * @function
     * @name sap.fe.core.AppComponent#getRouterProxy
     * @memberof sap.fe.core.AppComponent
     * @returns A Reference to the RouterProxy
     * @ui5-restricted
     * @final
     */;
    _proto.getRouterProxy = function getRouterProxy() {
      return this._oRouterProxy;
    }

    /**
     * Get a reference to the AppStateHandler.
     *
     * @function
     * @name sap.fe.core.AppComponent#getAppStateHandler
     * @memberof sap.fe.core.AppComponent
     * @returns A reference to the AppStateHandler
     * @ui5-restricted
     * @final
     */;
    _proto.getAppStateHandler = function getAppStateHandler() {
      return this._oAppStateHandler;
    }

    /**
     * Get a reference to the nav/FCL Controller.
     *
     * @function
     * @name sap.fe.core.AppComponent#getRootViewController
     * @memberof sap.fe.core.AppComponent
     * @returns  A reference to the FCL Controller
     * @ui5-restricted
     * @final
     */;
    _proto.getRootViewController = function getRootViewController() {
      return this.getRootControl().getController();
    }

    /**
     * Get the NavContainer control or the FCL control.
     *
     * @function
     * @name sap.fe.core.AppComponent#getRootContainer
     * @memberof sap.fe.core.AppComponent
     * @returns  A reference to NavContainer control or the FCL control
     * @ui5-restricted
     * @final
     */;
    _proto.getRootContainer = function getRootContainer() {
      return this.getRootControl().getContent()[0];
    }

    /**
     * Get the startup mode of the app.
     *
     * @returns The startup mode
     * @private
     */;
    _proto.getStartupMode = function getStartupMode() {
      return this.startupMode;
    }

    /**
     * Set the startup mode for the app to 'Create'.
     *
     * @private
     */;
    _proto.setStartupModeCreate = function setStartupModeCreate() {
      this.startupMode = StartupMode.Create;
    }

    /**
     * Set the startup mode for the app to 'AutoCreate'.
     *
     * @private
     */;
    _proto.setStartupModeAutoCreate = function setStartupModeAutoCreate() {
      this.startupMode = StartupMode.AutoCreate;
    }

    /**
     * Set the startup mode for the app to 'Deeplink'.
     *
     * @private
     */;
    _proto.setStartupModeDeeplink = function setStartupModeDeeplink() {
      this.startupMode = StartupMode.Deeplink;
    };
    _proto.init = function init() {
      var _oModel$isA, _oManifestUI5$rootVie;
      this.initializeFeatureToggles();
      const uiModel = new JSONModel({
        editMode: library.EditMode.Display,
        isEditable: false,
        draftStatus: library.DraftStatus.Clear,
        busy: false,
        busyLocal: {},
        pages: {}
      });
      const oInternalModel = new JSONModel({
        pages: {}
      });
      // set the binding OneWay for uiModel to prevent changes if controller extensions modify a bound property of a control
      uiModel.setDefaultBindingMode("OneWay");
      // for internal model binding needs to be two way
      ModelHelper.enhanceUiJSONModel(uiModel, library);
      ModelHelper.enhanceInternalJSONModel(oInternalModel);
      this.setModel(uiModel, "ui");
      this.setModel(oInternalModel, "internal");
      this.bInitializeRouting = this.bInitializeRouting !== undefined ? this.bInitializeRouting : true;
      this._oRouterProxy = new RouterProxy();
      this._oAppStateHandler = new AppStateHandler(this);
      this._oDiagnostics = new Diagnostics();
      const oModel = this.getModel();
      if (oModel !== null && oModel !== void 0 && (_oModel$isA = oModel.isA) !== null && _oModel$isA !== void 0 && _oModel$isA.call(oModel, "sap.ui.model.odata.v4.ODataModel")) {
        this.entityContainer = oModel.getMetaModel().requestObject("/$EntityContainer/");
      } else {
        // not an OData v4 service
        this.entityContainer = Promise.resolve();
      }
      const oManifestUI5 = this.getManifest()["sap.ui5"];
      if (oManifestUI5 !== null && oManifestUI5 !== void 0 && (_oManifestUI5$rootVie = oManifestUI5.rootView) !== null && _oManifestUI5$rootVie !== void 0 && _oManifestUI5$rootVie.viewName) {
        var _oManifestUI5$routing3, _oManifestUI5$routing4, _oManifestUI5$routing5, _oManifestUI5$routing6, _oManifestUI5$rootVie2, _oManifestUI5$rootVie3;
        // The application specified an own root view in the manifest

        // Root View was moved from sap.fe.templates to sap.fe.core - keep it compatible
        if (oManifestUI5.rootView.viewName === NAVCONF.FCL.VIEWNAME_COMPATIBILITY) {
          oManifestUI5.rootView.viewName = NAVCONF.FCL.VIEWNAME;
        } else if (oManifestUI5.rootView.viewName === NAVCONF.NAVCONTAINER.VIEWNAME_COMPATIBILITY) {
          oManifestUI5.rootView.viewName = NAVCONF.NAVCONTAINER.VIEWNAME;
        }
        if (oManifestUI5.rootView.viewName === NAVCONF.FCL.VIEWNAME && ((_oManifestUI5$routing3 = oManifestUI5.routing) === null || _oManifestUI5$routing3 === void 0 ? void 0 : (_oManifestUI5$routing4 = _oManifestUI5$routing3.config) === null || _oManifestUI5$routing4 === void 0 ? void 0 : _oManifestUI5$routing4.routerClass) === NAVCONF.FCL.ROUTERCLASS) {
          Log.info(`Rootcontainer: "${NAVCONF.FCL.VIEWNAME}" - Routerclass: "${NAVCONF.FCL.ROUTERCLASS}"`);
        } else if (oManifestUI5.rootView.viewName === NAVCONF.NAVCONTAINER.VIEWNAME && ((_oManifestUI5$routing5 = oManifestUI5.routing) === null || _oManifestUI5$routing5 === void 0 ? void 0 : (_oManifestUI5$routing6 = _oManifestUI5$routing5.config) === null || _oManifestUI5$routing6 === void 0 ? void 0 : _oManifestUI5$routing6.routerClass) === NAVCONF.NAVCONTAINER.ROUTERCLASS) {
          Log.info(`Rootcontainer: "${NAVCONF.NAVCONTAINER.VIEWNAME}" - Routerclass: "${NAVCONF.NAVCONTAINER.ROUTERCLASS}"`);
        } else if (((_oManifestUI5$rootVie2 = oManifestUI5.rootView) === null || _oManifestUI5$rootVie2 === void 0 ? void 0 : (_oManifestUI5$rootVie3 = _oManifestUI5$rootVie2.viewName) === null || _oManifestUI5$rootVie3 === void 0 ? void 0 : _oManifestUI5$rootVie3.indexOf("sap.fe.core.rootView")) !== -1) {
          var _oManifestUI5$routing7, _oManifestUI5$routing8;
          throw Error(`\nWrong configuration for the couple (rootView/routerClass) in manifest file.\n` + `Current values are :(${oManifestUI5.rootView.viewName}/${(_oManifestUI5$routing7 = oManifestUI5.routing) === null || _oManifestUI5$routing7 === void 0 ? void 0 : (_oManifestUI5$routing8 = _oManifestUI5$routing7.config) === null || _oManifestUI5$routing8 === void 0 ? void 0 : _oManifestUI5$routing8.routerClass})\n` + `Expected values are \n` + `\t - (${NAVCONF.NAVCONTAINER.VIEWNAME}/${NAVCONF.NAVCONTAINER.ROUTERCLASS})\n` + `\t - (${NAVCONF.FCL.VIEWNAME}/${NAVCONF.FCL.ROUTERCLASS})`);
        } else {
          Log.info(`Rootcontainer: "${oManifestUI5.rootView.viewName}" - Routerclass: "${NAVCONF.NAVCONTAINER.ROUTERCLASS}"`);
        }
      }

      // Adding Semantic Date Operators
      // Commenting since it is not needed for SingleRange
      SemanticDateOperators.addSemanticDateOperators();

      // the init function configures the routing according to the settings above
      // it will call the createContent function to instantiate the RootView and add it to the UIComponent aggregations

      _UIComponent.prototype.init.call(this);
      AppComponent.instanceMap[this.getId()] = this;
    };
    _proto.onServicesStarted = function onServicesStarted() {
      //router must be started once the rootcontainer is initialized
      //starting of the router
      const finalizedRoutingInitialization = () => {
        this.entityContainer.then(() => {
          if (this.getRootViewController().attachRouteMatchers) {
            this.getRootViewController().attachRouteMatchers();
          }
          this.getRouter().initialize();
          this.getRouterProxy().init(this, this._isFclEnabled());
        }).catch(error => {
          const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
          this.getRootViewController().displayErrorPage(oResourceBundle.getText("C_APP_COMPONENT_SAPFE_APPSTART_TECHNICAL_ISSUES"), {
            title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
            description: error.message,
            FCLLevel: 0
          });
        });
      };
      if (this.bInitializeRouting) {
        return this.getRoutingService().initializeRouting().then(() => {
          if (this.getRootViewController()) {
            return finalizedRoutingInitialization();
          } else {
            this.getRootControl().attachAfterInit(function () {
              finalizedRoutingInitialization();
            });
          }
        }).catch(function (err) {
          Log.error(`cannot cannot initialize routing: ${err}`);
        });
      }
    };
    _proto.exit = function exit() {
      this._oAppStateHandler.destroy();
      this._oRouterProxy.destroy();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete this._oAppStateHandler;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete this._oRouterProxy;
      deleteModelCacheData(this.getMetaModel());
      this.getModel("ui").destroy();
    };
    _proto.getMetaModel = function getMetaModel() {
      return this.getModel().getMetaModel();
    };
    _proto.getDiagnostics = function getDiagnostics() {
      return this._oDiagnostics;
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      var _this$getRoutingServi;
      // LEAKS, with workaround for some Flex / MDC issue
      try {
        // 	// This one is only a leak if you don't go back to the same component in the long run
        //delete sap.ui.fl.FlexControllerFactory._componentInstantiationPromises[this.getId()];

        delete AppComponent.instanceMap[this.getId()];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete window._routing;
      } catch (e) {
        Log.info(e);
      }

      //WORKAROUND for sticky discard request : due to async callback, request triggered by the exitApplication will be send after the UIComponent.prototype.destroy
      //so we need to copy the Requestor headers as it will be destroy

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const oMainModel = this.oModels[undefined];
      let oHeaders;
      if (oMainModel.oRequestor) {
        oHeaders = jQuery.extend({}, oMainModel.oRequestor.mHeaders);
      }

      // As we need to cleanup the application / handle the dirty object we need to call our cleanup before the models are destroyed
      (_this$getRoutingServi = this.getRoutingService()) === null || _this$getRoutingServi === void 0 ? void 0 : _this$getRoutingServi.beforeExit();
      _UIComponent.prototype.destroy.call(this, bSuppressInvalidate);
      if (oHeaders && oMainModel.oRequestor) {
        oMainModel.oRequestor.mHeaders = oHeaders;
      }
    };
    _proto.getRoutingService = function getRoutingService() {
      return {}; // overriden at runtime
    };
    _proto.getShellServices = function getShellServices() {
      return {}; // overriden at runtime
    };
    _proto.getNavigationService = function getNavigationService() {
      return {}; // overriden at runtime
    };
    _proto.getSideEffectsService = function getSideEffectsService() {
      return {};
    };
    _proto.getEnvironmentCapabilities = function getEnvironmentCapabilities() {
      return {};
    };
    _proto.getStartupParameters = async function getStartupParameters() {
      const oComponentData = this.getComponentData();
      return Promise.resolve(oComponentData && oComponentData.startupParameters || {});
    };
    _proto.restore = function restore() {
      // called by FLP when app sap-keep-alive is enabled and app is restored
      this.getRootViewController().viewState.onRestore();
    };
    _proto.suspend = function suspend() {
      // called by FLP when app sap-keep-alive is enabled and app is suspended
      this.getRootViewController().viewState.onSuspend();
    };
    return AppComponent;
  }(UIComponent), _class2.instanceMap = {}, _class2)) || _class);
  return AppComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGFydHVwTW9kZSIsImxpYnJhcnkiLCJOQVZDT05GIiwiRkNMIiwiVklFV05BTUUiLCJWSUVXTkFNRV9DT01QQVRJQklMSVRZIiwiUk9VVEVSQ0xBU1MiLCJOQVZDT05UQUlORVIiLCJBcHBDb21wb25lbnQiLCJkZWZpbmVVSTVDbGFzcyIsImludGVyZmFjZXMiLCJjb25maWciLCJmdWxsV2lkdGgiLCJtYW5pZmVzdCIsInNlcnZpY2VzIiwicmVzb3VyY2VNb2RlbCIsImZhY3RvcnlOYW1lIiwic3RhcnR1cCIsInNldHRpbmdzIiwiYnVuZGxlcyIsIm1vZGVsTmFtZSIsInJvdXRpbmdTZXJ2aWNlIiwic2hlbGxTZXJ2aWNlcyIsIlNoZWxsVUlTZXJ2aWNlIiwibmF2aWdhdGlvblNlcnZpY2UiLCJlbnZpcm9ubWVudENhcGFiaWxpdGllcyIsInNpZGVFZmZlY3RzU2VydmljZSIsImFzeW5jQ29tcG9uZW50U2VydmljZSIsInJvb3RWaWV3Iiwidmlld05hbWUiLCJ0eXBlIiwiYXN5bmMiLCJpZCIsInJvdXRpbmciLCJjb250cm9sSWQiLCJyb3V0ZXJDbGFzcyIsInZpZXdUeXBlIiwiY29udHJvbEFnZ3JlZ2F0aW9uIiwiY29udGFpbmVyT3B0aW9ucyIsInByb3BhZ2F0ZU1vZGVsIiwiZGVzaWdudGltZSIsInN0YXJ0dXBNb2RlIiwiTm9ybWFsIiwiX2lzRmNsRW5hYmxlZCIsIm9NYW5pZmVzdFVJNSIsImdldE1hbmlmZXN0RW50cnkiLCJpbml0aWFsaXplRmVhdHVyZVRvZ2dsZXMiLCJjaGFuZ2VQYWdlQ29uZmlndXJhdGlvbiIsInBhZ2VJZCIsInBhdGgiLCJ2YWx1ZSIsImNoYW5nZUNvbmZpZ3VyYXRpb24iLCJnZXRNYW5pZmVzdCIsImdldFJvdXRlclByb3h5IiwiX29Sb3V0ZXJQcm94eSIsImdldEFwcFN0YXRlSGFuZGxlciIsIl9vQXBwU3RhdGVIYW5kbGVyIiwiZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwiZ2V0Um9vdENvbnRyb2wiLCJnZXRDb250cm9sbGVyIiwiZ2V0Um9vdENvbnRhaW5lciIsImdldENvbnRlbnQiLCJnZXRTdGFydHVwTW9kZSIsInNldFN0YXJ0dXBNb2RlQ3JlYXRlIiwiQ3JlYXRlIiwic2V0U3RhcnR1cE1vZGVBdXRvQ3JlYXRlIiwiQXV0b0NyZWF0ZSIsInNldFN0YXJ0dXBNb2RlRGVlcGxpbmsiLCJEZWVwbGluayIsImluaXQiLCJ1aU1vZGVsIiwiSlNPTk1vZGVsIiwiZWRpdE1vZGUiLCJFZGl0TW9kZSIsIkRpc3BsYXkiLCJpc0VkaXRhYmxlIiwiZHJhZnRTdGF0dXMiLCJEcmFmdFN0YXR1cyIsIkNsZWFyIiwiYnVzeSIsImJ1c3lMb2NhbCIsInBhZ2VzIiwib0ludGVybmFsTW9kZWwiLCJzZXREZWZhdWx0QmluZGluZ01vZGUiLCJNb2RlbEhlbHBlciIsImVuaGFuY2VVaUpTT05Nb2RlbCIsImVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbCIsInNldE1vZGVsIiwiYkluaXRpYWxpemVSb3V0aW5nIiwidW5kZWZpbmVkIiwiUm91dGVyUHJveHkiLCJBcHBTdGF0ZUhhbmRsZXIiLCJfb0RpYWdub3N0aWNzIiwiRGlhZ25vc3RpY3MiLCJvTW9kZWwiLCJnZXRNb2RlbCIsImlzQSIsImVudGl0eUNvbnRhaW5lciIsImdldE1ldGFNb2RlbCIsInJlcXVlc3RPYmplY3QiLCJQcm9taXNlIiwicmVzb2x2ZSIsIkxvZyIsImluZm8iLCJpbmRleE9mIiwiRXJyb3IiLCJTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJhZGRTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJpbnN0YW5jZU1hcCIsImdldElkIiwib25TZXJ2aWNlc1N0YXJ0ZWQiLCJmaW5hbGl6ZWRSb3V0aW5nSW5pdGlhbGl6YXRpb24iLCJ0aGVuIiwiYXR0YWNoUm91dGVNYXRjaGVycyIsImdldFJvdXRlciIsImluaXRpYWxpemUiLCJjYXRjaCIsImVycm9yIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImRpc3BsYXlFcnJvclBhZ2UiLCJnZXRUZXh0IiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm1lc3NhZ2UiLCJGQ0xMZXZlbCIsImdldFJvdXRpbmdTZXJ2aWNlIiwiaW5pdGlhbGl6ZVJvdXRpbmciLCJhdHRhY2hBZnRlckluaXQiLCJlcnIiLCJleGl0IiwiZGVzdHJveSIsImRlbGV0ZU1vZGVsQ2FjaGVEYXRhIiwiZ2V0RGlhZ25vc3RpY3MiLCJiU3VwcHJlc3NJbnZhbGlkYXRlIiwid2luZG93IiwiX3JvdXRpbmciLCJlIiwib01haW5Nb2RlbCIsIm9Nb2RlbHMiLCJvSGVhZGVycyIsIm9SZXF1ZXN0b3IiLCJqUXVlcnkiLCJleHRlbmQiLCJtSGVhZGVycyIsImJlZm9yZUV4aXQiLCJnZXRTaGVsbFNlcnZpY2VzIiwiZ2V0TmF2aWdhdGlvblNlcnZpY2UiLCJnZXRTaWRlRWZmZWN0c1NlcnZpY2UiLCJnZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcyIsImdldFN0YXJ0dXBQYXJhbWV0ZXJzIiwib0NvbXBvbmVudERhdGEiLCJnZXRDb21wb25lbnREYXRhIiwic3RhcnR1cFBhcmFtZXRlcnMiLCJyZXN0b3JlIiwidmlld1N0YXRlIiwib25SZXN0b3JlIiwic3VzcGVuZCIsIm9uU3VzcGVuZCIsIlVJQ29tcG9uZW50Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBcHBDb21wb25lbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBGbGV4aWJsZUNvbHVtbkxheW91dCBmcm9tIFwic2FwL2YvRmxleGlibGVDb2x1bW5MYXlvdXRcIjtcbmltcG9ydCBBcHBTdGF0ZUhhbmRsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0FwcFN0YXRlSGFuZGxlclwiO1xuaW1wb3J0IFJvdXRlclByb3h5IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9yb3V0aW5nL1JvdXRlclByb3h5XCI7XG5pbXBvcnQgdHlwZSB7IENvbnRlbnREZW5zaXRpZXNUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IGxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB7IGNoYW5nZUNvbmZpZ3VyYXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvbWFuaWZlc3RNZXJnZXIvQ2hhbmdlUGFnZUNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB0eXBlIFJvb3RWaWV3QmFzZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL3Jvb3RWaWV3L1Jvb3RWaWV3QmFzZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL0Vudmlyb25tZW50U2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIHsgTmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvTmF2aWdhdGlvblNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSB7IFJvdXRpbmdTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1JvdXRpbmdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgeyBJU2hlbGxTZXJ2aWNlcyB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaGVsbFNlcnZpY2VzRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgeyBTaWRlRWZmZWN0c1NlcnZpY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IERpYWdub3N0aWNzIGZyb20gXCJzYXAvZmUvY29yZS9zdXBwb3J0L0RpYWdub3N0aWNzXCI7XG5pbXBvcnQgdHlwZSBOYXZDb250YWluZXIgZnJvbSBcInNhcC9tL05hdkNvbnRhaW5lclwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgVUlDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL1VJQ29tcG9uZW50XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgeyBkZWxldGVNb2RlbENhY2hlRGF0YSB9IGZyb20gXCIuL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgU2VtYW50aWNEYXRlT3BlcmF0b3JzIGZyb20gXCIuL2hlbHBlcnMvU2VtYW50aWNEYXRlT3BlcmF0b3JzXCI7XG5cbmNvbnN0IFN0YXJ0dXBNb2RlID0gbGlicmFyeS5TdGFydHVwTW9kZTtcblxuY29uc3QgTkFWQ09ORiA9IHtcblx0RkNMOiB7XG5cdFx0VklFV05BTUU6IFwic2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsXCIsXG5cdFx0VklFV05BTUVfQ09NUEFUSUJJTElUWTogXCJzYXAuZmUudGVtcGxhdGVzLlJvb3RDb250YWluZXIudmlldy5GY2xcIixcblx0XHRST1VURVJDTEFTUzogXCJzYXAuZi5yb3V0aW5nLlJvdXRlclwiXG5cdH0sXG5cdE5BVkNPTlRBSU5FUjoge1xuXHRcdFZJRVdOQU1FOiBcInNhcC5mZS5jb3JlLnJvb3RWaWV3Lk5hdkNvbnRhaW5lclwiLFxuXHRcdFZJRVdOQU1FX0NPTVBBVElCSUxJVFk6IFwic2FwLmZlLnRlbXBsYXRlcy5Sb290Q29udGFpbmVyLnZpZXcuTmF2Q29udGFpbmVyXCIsXG5cdFx0Uk9VVEVSQ0xBU1M6IFwic2FwLm0ucm91dGluZy5Sb3V0ZXJcIlxuXHR9XG59O1xuXG5leHBvcnQgdHlwZSBNYW5pZmVzdENvbnRlbnRBcHAgPSB7XG5cdGNyb3NzTmF2aWdhdGlvbj86IHtcblx0XHRvdXRib3VuZHM/OiBSZWNvcmQ8XG5cdFx0XHRzdHJpbmcsXG5cdFx0XHR7XG5cdFx0XHRcdHNlbWFudGljT2JqZWN0OiBzdHJpbmc7XG5cdFx0XHRcdGFjdGlvbjogc3RyaW5nO1xuXHRcdFx0XHRwYXJhbWV0ZXJzOiBzdHJpbmc7XG5cdFx0XHR9XG5cdFx0Pjtcblx0fTtcblx0dGl0bGU/OiBzdHJpbmc7XG5cdHN1YlRpdGxlPzogc3RyaW5nO1xuXHRpY29uPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgTWFuaWZlc3RDb250ZW50VUk1ID0ge1xuXHRjb250ZW50RGVuc2l0aWVzPzogQ29udGVudERlbnNpdGllc1R5cGU7XG5cdHBhZ2VSZWFkeVRpbWVvdXQ/OiBudW1iZXI7XG5cdHJvb3RWaWV3Pzoge1xuXHRcdHZpZXdOYW1lOiBzdHJpbmc7XG5cdH07XG5cdHJvdXRpbmc/OiB7XG5cdFx0Y29uZmlnPzoge1xuXHRcdFx0cm91dGVyQ2xhc3M6IHN0cmluZztcblx0XHRcdGNvbnRyb2xJZD86IHN0cmluZztcblx0XHR9O1xuXHRcdHJvdXRlczoge1xuXHRcdFx0cGF0dGVybjogc3RyaW5nO1xuXHRcdFx0bmFtZTogc3RyaW5nO1xuXHRcdFx0dGFyZ2V0OiBzdHJpbmc7XG5cdFx0fVtdO1xuXHRcdHRhcmdldHM/OiBSZWNvcmQ8XG5cdFx0XHRzdHJpbmcsXG5cdFx0XHR7XG5cdFx0XHRcdGlkOiBzdHJpbmc7XG5cdFx0XHRcdG5hbWU6IHN0cmluZztcblx0XHRcdFx0b3B0aW9ucz86IHtcblx0XHRcdFx0XHRzZXR0aW5ncz86IG9iamVjdDtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHQ+O1xuXHR9O1xuXHRtb2RlbHM6IFJlY29yZDxcblx0XHRzdHJpbmcsXG5cdFx0e1xuXHRcdFx0dHlwZT86IHN0cmluZztcblx0XHRcdGRhdGFTb3VyY2U/OiBzdHJpbmc7XG5cdFx0XHRzZXR0aW5ncz86IG9iamVjdDtcblx0XHR9XG5cdD47XG59O1xuXG5leHBvcnQgdHlwZSBNYW5pZmVzdENvbnRlbnQgPSB7XG5cdFwic2FwLmFwcFwiPzogTWFuaWZlc3RDb250ZW50QXBwO1xuXHRcInNhcC51aTVcIj86IE1hbmlmZXN0Q29udGVudFVJNTtcblx0XCJzYXAuZmVcIj86IHtcblx0XHRmb3JtPzoge1xuXHRcdFx0cmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdD86IGJvb2xlYW47XG5cdFx0fTtcblx0fTtcbn07XG5leHBvcnQgdHlwZSBDb21wb25lbnREYXRhID0ge1xuXHRzdGFydHVwUGFyYW1ldGVycz86IHtcblx0XHRwcmVmZXJyZWRNb2RlPzogc3RyaW5nW107XG5cdH0gJiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duW10+O1xufTtcbi8qKlxuICogTWFpbiBjbGFzcyBmb3IgY29tcG9uZW50cyB1c2VkIGZvciBhbiBhcHBsaWNhdGlvbiBpbiBTQVAgRmlvcmkgZWxlbWVudHMuXG4gKlxuICogQXBwbGljYXRpb24gZGV2ZWxvcGVycyB1c2luZyB0aGUgdGVtcGxhdGVzIGFuZCBidWlsZGluZyBibG9ja3MgcHJvdmlkZWQgYnkgU0FQIEZpb3JpIGVsZW1lbnRzIHNob3VsZCBjcmVhdGUgdGhlaXIgYXBwcyBieSBleHRlbmRpbmcgdGhpcyBjb21wb25lbnQuXG4gKiBUaGlzIGVuc3VyZXMgdGhhdCBhbGwgdGhlIG5lY2Vzc2FyeSBzZXJ2aWNlcyB0aGF0IHlvdSBuZWVkIGZvciB0aGUgYnVpbGRpbmcgYmxvY2tzIGFuZCB0ZW1wbGF0ZXMgdG8gd29yayBwcm9wZXJseSBhcmUgc3RhcnRlZC5cbiAqXG4gKiBXaGVuIHlvdSB1c2Ugc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50IGFzIHRoZSBiYXNlIGNvbXBvbmVudCwgeW91IGFsc28gbmVlZCB0byB1c2UgYSByb290Vmlldy4gU0FQIEZpb3JpIGVsZW1lbnRzIHByb3ZpZGVzIHR3byBvcHRpb25zOiA8YnIvPlxuICogIC0gc2FwLmZlLmNvcmUucm9vdFZpZXcuTmF2Q29udGFpbmVyIHdoZW4gdXNpbmcgc2FwLm0ucm91dGluZy5Sb3V0ZXIgPGJyLz5cbiAqICAtIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbCB3aGVuIHVzaW5nIHNhcC5mLnJvdXRpbmcuUm91dGVyIChGQ0wgdXNlIGNhc2UpIDxici8+XG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFwiLCB7XG5cdGludGVyZmFjZXM6IFtcInNhcC51aS5jb3JlLklBc3luY0NvbnRlbnRDcmVhdGlvblwiXSxcblx0Y29uZmlnOiB7XG5cdFx0ZnVsbFdpZHRoOiB0cnVlXG5cdH0sXG5cdG1hbmlmZXN0OiB7XG5cdFx0XCJzYXAudWk1XCI6IHtcblx0XHRcdHNlcnZpY2VzOiB7XG5cdFx0XHRcdHJlc291cmNlTW9kZWw6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5SZXNvdXJjZU1vZGVsU2VydmljZVwiLFxuXHRcdFx0XHRcdHN0YXJ0dXA6IFwid2FpdEZvclwiLFxuXHRcdFx0XHRcdHNldHRpbmdzOiB7XG5cdFx0XHRcdFx0XHRidW5kbGVzOiBbXCJzYXAuZmUuY29yZS5tZXNzYWdlYnVuZGxlXCJdLFxuXHRcdFx0XHRcdFx0bW9kZWxOYW1lOiBcInNhcC5mZS5pMThuXCJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJvdXRpbmdTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuUm91dGluZ1NlcnZpY2VcIixcblx0XHRcdFx0XHRzdGFydHVwOiBcIndhaXRGb3JcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzaGVsbFNlcnZpY2VzOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuU2hlbGxTZXJ2aWNlc1wiLFxuXHRcdFx0XHRcdHN0YXJ0dXA6IFwid2FpdEZvclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFNoZWxsVUlTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLnVzaGVsbC51aTVzZXJ2aWNlLlNoZWxsVUlTZXJ2aWNlXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0bmF2aWdhdGlvblNlcnZpY2U6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5OYXZpZ2F0aW9uU2VydmljZVwiLFxuXHRcdFx0XHRcdHN0YXJ0dXA6IFwid2FpdEZvclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVudmlyb25tZW50Q2FwYWJpbGl0aWVzOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuRW52aXJvbm1lbnRTZXJ2aWNlXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0c2lkZUVmZmVjdHNTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuU2lkZUVmZmVjdHNTZXJ2aWNlXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0YXN5bmNDb21wb25lbnRTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuQXN5bmNDb21wb25lbnRTZXJ2aWNlXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCJcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHJvb3RWaWV3OiB7XG5cdFx0XHRcdHZpZXdOYW1lOiBOQVZDT05GLk5BVkNPTlRBSU5FUi5WSUVXTkFNRSxcblx0XHRcdFx0dHlwZTogXCJYTUxcIixcblx0XHRcdFx0YXN5bmM6IHRydWUsXG5cdFx0XHRcdGlkOiBcImFwcFJvb3RWaWV3XCJcblx0XHRcdH0sXG5cdFx0XHRyb3V0aW5nOiB7XG5cdFx0XHRcdGNvbmZpZzoge1xuXHRcdFx0XHRcdGNvbnRyb2xJZDogXCJhcHBDb250ZW50XCIsXG5cdFx0XHRcdFx0cm91dGVyQ2xhc3M6IE5BVkNPTkYuTkFWQ09OVEFJTkVSLlJPVVRFUkNMQVNTLFxuXHRcdFx0XHRcdHZpZXdUeXBlOiBcIlhNTFwiLFxuXHRcdFx0XHRcdGNvbnRyb2xBZ2dyZWdhdGlvbjogXCJwYWdlc1wiLFxuXHRcdFx0XHRcdGFzeW5jOiB0cnVlLFxuXHRcdFx0XHRcdGNvbnRhaW5lck9wdGlvbnM6IHtcblx0XHRcdFx0XHRcdHByb3BhZ2F0ZU1vZGVsOiB0cnVlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRkZXNpZ250aW1lOiBcInNhcC9mZS9jb3JlL2Rlc2lnbnRpbWUvQXBwQ29tcG9uZW50LmRlc2lnbnRpbWVcIixcblxuXHRsaWJyYXJ5OiBcInNhcC5mZS5jb3JlXCJcbn0pXG5jbGFzcyBBcHBDb21wb25lbnQgZXh0ZW5kcyBVSUNvbXBvbmVudCB7XG5cdHN0YXRpYyBpbnN0YW5jZU1hcDogUmVjb3JkPHN0cmluZywgQXBwQ29tcG9uZW50PiA9IHt9O1xuXHRwcml2YXRlIF9vUm91dGVyUHJveHkhOiBSb3V0ZXJQcm94eTtcblx0cHJpdmF0ZSBfb0FwcFN0YXRlSGFuZGxlciE6IEFwcFN0YXRlSGFuZGxlcjtcblx0cHJpdmF0ZSBiSW5pdGlhbGl6ZVJvdXRpbmc/OiBib29sZWFuO1xuXHRwcml2YXRlIF9vRGlhZ25vc3RpY3MhOiBEaWFnbm9zdGljcztcblx0cHJpdmF0ZSBlbnRpdHlDb250YWluZXIhOiBQcm9taXNlPHZvaWQ+O1xuXHRwcml2YXRlIHN0YXJ0dXBNb2RlOiBzdHJpbmcgPSBTdGFydHVwTW9kZS5Ob3JtYWw7XG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudC5nZXRNZXRhZGF0YVxuXHQgKiBAZnVuY3Rpb25cblx0ICovXG5cblx0X2lzRmNsRW5hYmxlZCgpIHtcblx0XHRjb25zdCBvTWFuaWZlc3RVSTUgPSB0aGlzLmdldE1hbmlmZXN0RW50cnkoXCJzYXAudWk1XCIpO1xuXHRcdHJldHVybiBvTWFuaWZlc3RVSTU/LnJvdXRpbmc/LmNvbmZpZz8ucm91dGVyQ2xhc3MgPT09IE5BVkNPTkYuRkNMLlJPVVRFUkNMQVNTO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIGEgaG9vayB0byBpbml0aWFsaXplIGZlYXR1cmUgdG9nZ2xlcy5cblx0ICpcblx0ICogVGhpcyBob29rIGlzIGJlaW5nIGNhbGxlZCBieSB0aGUgU0FQIEZpb3JpIGVsZW1lbnRzIEFwcENvbXBvbmVudCBhdCB0aGUgdGltZSBmZWF0dXJlIHRvZ2dsZXMgY2FuIGJlIGluaXRpYWxpemVkLlxuXHQgKiBUbyBjaGFuZ2UgcGFnZSBjb25maWd1cmF0aW9uIHVzZSB0aGUge0BsaW5rIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudCNjaGFuZ2VQYWdlQ29uZmlndXJhdGlvbn0gbWV0aG9kLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2luaXRpYWxpemVGZWF0dXJlVG9nZ2xlc1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGluaXRpYWxpemVGZWF0dXJlVG9nZ2xlcygpOiB2b2lkIHtcblx0XHQvLyB0aGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBieSBhcHBsaWNhdGlvbnNcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBwYWdlIGNvbmZpZ3VyYXRpb24gb2YgU0FQIEZpb3JpIGVsZW1lbnRzLlxuXHQgKlxuXHQgKiBUaGlzIG1ldGhvZCBlbmFibGVzIHlvdSB0byBjaGFuZ2UgdGhlIHBhZ2UgY29uZmlndXJhdGlvbiBvZiBTQVAgRmlvcmkgZWxlbWVudHMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQjY2hhbmdlUGFnZUNvbmZpZ3VyYXRpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFxuXHQgKiBAcGFyYW0gcGFnZUlkIFRoZSBJRCBvZiB0aGUgcGFnZSBmb3Igd2hpY2ggdGhlIGNvbmZpZ3VyYXRpb24gaXMgdG8gYmUgY2hhbmdlZC5cblx0ICogQHBhcmFtIHBhdGggVGhlIHBhdGggaW4gdGhlIHBhZ2Ugc2V0dGluZ3MgZm9yIHdoaWNoIHRoZSBjb25maWd1cmF0aW9uIGlzIHRvIGJlIGNoYW5nZWQuXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBjb25maWd1cmF0aW9uLiBUaGlzIGNvdWxkIGJlIGEgcGxhaW4gdmFsdWUgbGlrZSBhIHN0cmluZywgb3IgYSBCb29sZWFuLCBvciBhIHN0cnVjdHVyZWQgb2JqZWN0LlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRjaGFuZ2VQYWdlQ29uZmlndXJhdGlvbihwYWdlSWQ6IHN0cmluZywgcGF0aDogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuXHRcdGNoYW5nZUNvbmZpZ3VyYXRpb24odGhpcy5nZXRNYW5pZmVzdCgpLCBwYWdlSWQsIHBhdGgsIHZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIFJvdXRlclByb3h5LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2dldFJvdXRlclByb3h5XG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5BcHBDb21wb25lbnRcblx0ICogQHJldHVybnMgQSBSZWZlcmVuY2UgdG8gdGhlIFJvdXRlclByb3h5XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGdldFJvdXRlclByb3h5KCk6IFJvdXRlclByb3h5IHtcblx0XHRyZXR1cm4gdGhpcy5fb1JvdXRlclByb3h5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgQXBwU3RhdGVIYW5kbGVyLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2dldEFwcFN0YXRlSGFuZGxlclxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XG5cdCAqIEByZXR1cm5zIEEgcmVmZXJlbmNlIHRvIHRoZSBBcHBTdGF0ZUhhbmRsZXJcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0Z2V0QXBwU3RhdGVIYW5kbGVyKCkge1xuXHRcdHJldHVybiB0aGlzLl9vQXBwU3RhdGVIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgbmF2L0ZDTCBDb250cm9sbGVyLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2dldFJvb3RWaWV3Q29udHJvbGxlclxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XG5cdCAqIEByZXR1cm5zICBBIHJlZmVyZW5jZSB0byB0aGUgRkNMIENvbnRyb2xsZXJcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0Z2V0Um9vdFZpZXdDb250cm9sbGVyKCk6IFJvb3RWaWV3QmFzZUNvbnRyb2xsZXIge1xuXHRcdHJldHVybiB0aGlzLmdldFJvb3RDb250cm9sKCkuZ2V0Q29udHJvbGxlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgTmF2Q29udGFpbmVyIGNvbnRyb2wgb3IgdGhlIEZDTCBjb250cm9sLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2dldFJvb3RDb250YWluZXJcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFxuXHQgKiBAcmV0dXJucyAgQSByZWZlcmVuY2UgdG8gTmF2Q29udGFpbmVyIGNvbnRyb2wgb3IgdGhlIEZDTCBjb250cm9sXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGdldFJvb3RDb250YWluZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0Um9vdENvbnRyb2woKS5nZXRDb250ZW50KClbMF0gYXMgTmF2Q29udGFpbmVyIHwgRmxleGlibGVDb2x1bW5MYXlvdXQ7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBzdGFydHVwIG1vZGUgb2YgdGhlIGFwcC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHN0YXJ0dXAgbW9kZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0U3RhcnR1cE1vZGUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5zdGFydHVwTW9kZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIHN0YXJ0dXAgbW9kZSBmb3IgdGhlIGFwcCB0byAnQ3JlYXRlJy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHNldFN0YXJ0dXBNb2RlQ3JlYXRlKCkge1xuXHRcdHRoaXMuc3RhcnR1cE1vZGUgPSBTdGFydHVwTW9kZS5DcmVhdGU7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBzdGFydHVwIG1vZGUgZm9yIHRoZSBhcHAgdG8gJ0F1dG9DcmVhdGUnLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0c2V0U3RhcnR1cE1vZGVBdXRvQ3JlYXRlKCkge1xuXHRcdHRoaXMuc3RhcnR1cE1vZGUgPSBTdGFydHVwTW9kZS5BdXRvQ3JlYXRlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgc3RhcnR1cCBtb2RlIGZvciB0aGUgYXBwIHRvICdEZWVwbGluaycuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRzZXRTdGFydHVwTW9kZURlZXBsaW5rKCkge1xuXHRcdHRoaXMuc3RhcnR1cE1vZGUgPSBTdGFydHVwTW9kZS5EZWVwbGluaztcblx0fVxuXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplRmVhdHVyZVRvZ2dsZXMoKTtcblxuXHRcdGNvbnN0IHVpTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdGVkaXRNb2RlOiBsaWJyYXJ5LkVkaXRNb2RlLkRpc3BsYXksXG5cdFx0XHRpc0VkaXRhYmxlOiBmYWxzZSxcblx0XHRcdGRyYWZ0U3RhdHVzOiBsaWJyYXJ5LkRyYWZ0U3RhdHVzLkNsZWFyLFxuXHRcdFx0YnVzeTogZmFsc2UsXG5cdFx0XHRidXN5TG9jYWw6IHt9LFxuXHRcdFx0cGFnZXM6IHt9XG5cdFx0fSk7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdHBhZ2VzOiB7fVxuXHRcdH0pO1xuXHRcdC8vIHNldCB0aGUgYmluZGluZyBPbmVXYXkgZm9yIHVpTW9kZWwgdG8gcHJldmVudCBjaGFuZ2VzIGlmIGNvbnRyb2xsZXIgZXh0ZW5zaW9ucyBtb2RpZnkgYSBib3VuZCBwcm9wZXJ0eSBvZiBhIGNvbnRyb2xcblx0XHR1aU1vZGVsLnNldERlZmF1bHRCaW5kaW5nTW9kZShcIk9uZVdheVwiKTtcblx0XHQvLyBmb3IgaW50ZXJuYWwgbW9kZWwgYmluZGluZyBuZWVkcyB0byBiZSB0d28gd2F5XG5cdFx0TW9kZWxIZWxwZXIuZW5oYW5jZVVpSlNPTk1vZGVsKHVpTW9kZWwsIGxpYnJhcnkpO1xuXHRcdE1vZGVsSGVscGVyLmVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbChvSW50ZXJuYWxNb2RlbCk7XG5cblx0XHR0aGlzLnNldE1vZGVsKHVpTW9kZWwsIFwidWlcIik7XG5cdFx0dGhpcy5zZXRNb2RlbChvSW50ZXJuYWxNb2RlbCwgXCJpbnRlcm5hbFwiKTtcblxuXHRcdHRoaXMuYkluaXRpYWxpemVSb3V0aW5nID0gdGhpcy5iSW5pdGlhbGl6ZVJvdXRpbmcgIT09IHVuZGVmaW5lZCA/IHRoaXMuYkluaXRpYWxpemVSb3V0aW5nIDogdHJ1ZTtcblx0XHR0aGlzLl9vUm91dGVyUHJveHkgPSBuZXcgUm91dGVyUHJveHkoKTtcblx0XHR0aGlzLl9vQXBwU3RhdGVIYW5kbGVyID0gbmV3IEFwcFN0YXRlSGFuZGxlcih0aGlzKTtcblx0XHR0aGlzLl9vRGlhZ25vc3RpY3MgPSBuZXcgRGlhZ25vc3RpY3MoKTtcblxuXHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsO1xuXHRcdGlmIChvTW9kZWw/LmlzQT8uKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTW9kZWxcIikpIHtcblx0XHRcdHRoaXMuZW50aXR5Q29udGFpbmVyID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLnJlcXVlc3RPYmplY3QoXCIvJEVudGl0eUNvbnRhaW5lci9cIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG5vdCBhbiBPRGF0YSB2NCBzZXJ2aWNlXG5cdFx0XHR0aGlzLmVudGl0eUNvbnRhaW5lciA9IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9NYW5pZmVzdFVJNSA9IHRoaXMuZ2V0TWFuaWZlc3QoKVtcInNhcC51aTVcIl07XG5cdFx0aWYgKG9NYW5pZmVzdFVJNT8ucm9vdFZpZXc/LnZpZXdOYW1lKSB7XG5cdFx0XHQvLyBUaGUgYXBwbGljYXRpb24gc3BlY2lmaWVkIGFuIG93biByb290IHZpZXcgaW4gdGhlIG1hbmlmZXN0XG5cblx0XHRcdC8vIFJvb3QgVmlldyB3YXMgbW92ZWQgZnJvbSBzYXAuZmUudGVtcGxhdGVzIHRvIHNhcC5mZS5jb3JlIC0ga2VlcCBpdCBjb21wYXRpYmxlXG5cdFx0XHRpZiAob01hbmlmZXN0VUk1LnJvb3RWaWV3LnZpZXdOYW1lID09PSBOQVZDT05GLkZDTC5WSUVXTkFNRV9DT01QQVRJQklMSVRZKSB7XG5cdFx0XHRcdG9NYW5pZmVzdFVJNS5yb290Vmlldy52aWV3TmFtZSA9IE5BVkNPTkYuRkNMLlZJRVdOQU1FO1xuXHRcdFx0fSBlbHNlIGlmIChvTWFuaWZlc3RVSTUucm9vdFZpZXcudmlld05hbWUgPT09IE5BVkNPTkYuTkFWQ09OVEFJTkVSLlZJRVdOQU1FX0NPTVBBVElCSUxJVFkpIHtcblx0XHRcdFx0b01hbmlmZXN0VUk1LnJvb3RWaWV3LnZpZXdOYW1lID0gTkFWQ09ORi5OQVZDT05UQUlORVIuVklFV05BTUU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChcblx0XHRcdFx0b01hbmlmZXN0VUk1LnJvb3RWaWV3LnZpZXdOYW1lID09PSBOQVZDT05GLkZDTC5WSUVXTkFNRSAmJlxuXHRcdFx0XHRvTWFuaWZlc3RVSTUucm91dGluZz8uY29uZmlnPy5yb3V0ZXJDbGFzcyA9PT0gTkFWQ09ORi5GQ0wuUk9VVEVSQ0xBU1Ncblx0XHRcdCkge1xuXHRcdFx0XHRMb2cuaW5mbyhgUm9vdGNvbnRhaW5lcjogXCIke05BVkNPTkYuRkNMLlZJRVdOQU1FfVwiIC0gUm91dGVyY2xhc3M6IFwiJHtOQVZDT05GLkZDTC5ST1VURVJDTEFTU31cImApO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0b01hbmlmZXN0VUk1LnJvb3RWaWV3LnZpZXdOYW1lID09PSBOQVZDT05GLk5BVkNPTlRBSU5FUi5WSUVXTkFNRSAmJlxuXHRcdFx0XHRvTWFuaWZlc3RVSTUucm91dGluZz8uY29uZmlnPy5yb3V0ZXJDbGFzcyA9PT0gTkFWQ09ORi5OQVZDT05UQUlORVIuUk9VVEVSQ0xBU1Ncblx0XHRcdCkge1xuXHRcdFx0XHRMb2cuaW5mbyhgUm9vdGNvbnRhaW5lcjogXCIke05BVkNPTkYuTkFWQ09OVEFJTkVSLlZJRVdOQU1FfVwiIC0gUm91dGVyY2xhc3M6IFwiJHtOQVZDT05GLk5BVkNPTlRBSU5FUi5ST1VURVJDTEFTU31cImApO1xuXHRcdFx0fSBlbHNlIGlmIChvTWFuaWZlc3RVSTUucm9vdFZpZXc/LnZpZXdOYW1lPy5pbmRleE9mKFwic2FwLmZlLmNvcmUucm9vdFZpZXdcIikgIT09IC0xKSB7XG5cdFx0XHRcdHRocm93IEVycm9yKFxuXHRcdFx0XHRcdGBcXG5Xcm9uZyBjb25maWd1cmF0aW9uIGZvciB0aGUgY291cGxlIChyb290Vmlldy9yb3V0ZXJDbGFzcykgaW4gbWFuaWZlc3QgZmlsZS5cXG5gICtcblx0XHRcdFx0XHRcdGBDdXJyZW50IHZhbHVlcyBhcmUgOigke29NYW5pZmVzdFVJNS5yb290Vmlldy52aWV3TmFtZX0vJHtvTWFuaWZlc3RVSTUucm91dGluZz8uY29uZmlnPy5yb3V0ZXJDbGFzc30pXFxuYCArXG5cdFx0XHRcdFx0XHRgRXhwZWN0ZWQgdmFsdWVzIGFyZSBcXG5gICtcblx0XHRcdFx0XHRcdGBcXHQgLSAoJHtOQVZDT05GLk5BVkNPTlRBSU5FUi5WSUVXTkFNRX0vJHtOQVZDT05GLk5BVkNPTlRBSU5FUi5ST1VURVJDTEFTU30pXFxuYCArXG5cdFx0XHRcdFx0XHRgXFx0IC0gKCR7TkFWQ09ORi5GQ0wuVklFV05BTUV9LyR7TkFWQ09ORi5GQ0wuUk9VVEVSQ0xBU1N9KWBcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy5pbmZvKGBSb290Y29udGFpbmVyOiBcIiR7b01hbmlmZXN0VUk1LnJvb3RWaWV3LnZpZXdOYW1lfVwiIC0gUm91dGVyY2xhc3M6IFwiJHtOQVZDT05GLk5BVkNPTlRBSU5FUi5ST1VURVJDTEFTU31cImApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEFkZGluZyBTZW1hbnRpYyBEYXRlIE9wZXJhdG9yc1xuXHRcdC8vIENvbW1lbnRpbmcgc2luY2UgaXQgaXMgbm90IG5lZWRlZCBmb3IgU2luZ2xlUmFuZ2Vcblx0XHRTZW1hbnRpY0RhdGVPcGVyYXRvcnMuYWRkU2VtYW50aWNEYXRlT3BlcmF0b3JzKCk7XG5cblx0XHQvLyB0aGUgaW5pdCBmdW5jdGlvbiBjb25maWd1cmVzIHRoZSByb3V0aW5nIGFjY29yZGluZyB0byB0aGUgc2V0dGluZ3MgYWJvdmVcblx0XHQvLyBpdCB3aWxsIGNhbGwgdGhlIGNyZWF0ZUNvbnRlbnQgZnVuY3Rpb24gdG8gaW5zdGFudGlhdGUgdGhlIFJvb3RWaWV3IGFuZCBhZGQgaXQgdG8gdGhlIFVJQ29tcG9uZW50IGFnZ3JlZ2F0aW9uc1xuXG5cdFx0c3VwZXIuaW5pdCgpO1xuXHRcdEFwcENvbXBvbmVudC5pbnN0YW5jZU1hcFt0aGlzLmdldElkKCldID0gdGhpcztcblx0fVxuXHRvblNlcnZpY2VzU3RhcnRlZCgpIHtcblx0XHQvL3JvdXRlciBtdXN0IGJlIHN0YXJ0ZWQgb25jZSB0aGUgcm9vdGNvbnRhaW5lciBpcyBpbml0aWFsaXplZFxuXHRcdC8vc3RhcnRpbmcgb2YgdGhlIHJvdXRlclxuXHRcdGNvbnN0IGZpbmFsaXplZFJvdXRpbmdJbml0aWFsaXphdGlvbiA9ICgpID0+IHtcblx0XHRcdHRoaXMuZW50aXR5Q29udGFpbmVyXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS5hdHRhY2hSb3V0ZU1hdGNoZXJzKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmdldFJvb3RWaWV3Q29udHJvbGxlcigpLmF0dGFjaFJvdXRlTWF0Y2hlcnMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5nZXRSb3V0ZXIoKS5pbml0aWFsaXplKCk7XG5cdFx0XHRcdFx0dGhpcy5nZXRSb3V0ZXJQcm94eSgpLmluaXQodGhpcywgdGhpcy5faXNGY2xFbmFibGVkKCkpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goKGVycm9yOiBFcnJvcikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cblx0XHRcdFx0XHR0aGlzLmdldFJvb3RWaWV3Q29udHJvbGxlcigpLmRpc3BsYXlFcnJvclBhZ2UoXG5cdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQVBQX0NPTVBPTkVOVF9TQVBGRV9BUFBTVEFSVF9URUNITklDQUxfSVNTVUVTXCIpLFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0aXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUlwiKSxcblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IGVycm9yLm1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdEZDTExldmVsOiAwXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGlmICh0aGlzLmJJbml0aWFsaXplUm91dGluZykge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0Um91dGluZ1NlcnZpY2UoKVxuXHRcdFx0XHQuaW5pdGlhbGl6ZVJvdXRpbmcoKVxuXHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmaW5hbGl6ZWRSb3V0aW5nSW5pdGlhbGl6YXRpb24oKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5nZXRSb290Q29udHJvbCgpLmF0dGFjaEFmdGVySW5pdChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdGZpbmFsaXplZFJvdXRpbmdJbml0aWFsaXphdGlvbigpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycjogRXJyb3IpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoYGNhbm5vdCBjYW5ub3QgaW5pdGlhbGl6ZSByb3V0aW5nOiAke2Vycn1gKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdGV4aXQoKSB7XG5cdFx0dGhpcy5fb0FwcFN0YXRlSGFuZGxlci5kZXN0cm95KCk7XG5cdFx0dGhpcy5fb1JvdXRlclByb3h5LmRlc3Ryb3koKTtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGRlbGV0ZSB0aGlzLl9vQXBwU3RhdGVIYW5kbGVyO1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0ZGVsZXRlIHRoaXMuX29Sb3V0ZXJQcm94eTtcblx0XHRkZWxldGVNb2RlbENhY2hlRGF0YSh0aGlzLmdldE1ldGFNb2RlbCgpKTtcblx0XHR0aGlzLmdldE1vZGVsKFwidWlcIikuZGVzdHJveSgpO1xuXHR9XG5cdGdldE1ldGFNb2RlbCgpOiBPRGF0YU1ldGFNb2RlbCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0fVxuXHRnZXREaWFnbm9zdGljcygpIHtcblx0XHRyZXR1cm4gdGhpcy5fb0RpYWdub3N0aWNzO1xuXHR9XG5cdGRlc3Ryb3koYlN1cHByZXNzSW52YWxpZGF0ZT86IGJvb2xlYW4pIHtcblx0XHQvLyBMRUFLUywgd2l0aCB3b3JrYXJvdW5kIGZvciBzb21lIEZsZXggLyBNREMgaXNzdWVcblx0XHR0cnkge1xuXHRcdFx0Ly8gXHQvLyBUaGlzIG9uZSBpcyBvbmx5IGEgbGVhayBpZiB5b3UgZG9uJ3QgZ28gYmFjayB0byB0aGUgc2FtZSBjb21wb25lbnQgaW4gdGhlIGxvbmcgcnVuXG5cdFx0XHQvL2RlbGV0ZSBzYXAudWkuZmwuRmxleENvbnRyb2xsZXJGYWN0b3J5Ll9jb21wb25lbnRJbnN0YW50aWF0aW9uUHJvbWlzZXNbdGhpcy5nZXRJZCgpXTtcblxuXHRcdFx0ZGVsZXRlIEFwcENvbXBvbmVudC5pbnN0YW5jZU1hcFt0aGlzLmdldElkKCldO1xuXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRkZWxldGUgKHdpbmRvdyBhcyB1bmtub3duKS5fcm91dGluZztcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRMb2cuaW5mbyhlIGFzIHN0cmluZyk7XG5cdFx0fVxuXG5cdFx0Ly9XT1JLQVJPVU5EIGZvciBzdGlja3kgZGlzY2FyZCByZXF1ZXN0IDogZHVlIHRvIGFzeW5jIGNhbGxiYWNrLCByZXF1ZXN0IHRyaWdnZXJlZCBieSB0aGUgZXhpdEFwcGxpY2F0aW9uIHdpbGwgYmUgc2VuZCBhZnRlciB0aGUgVUlDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3lcblx0XHQvL3NvIHdlIG5lZWQgdG8gY29weSB0aGUgUmVxdWVzdG9yIGhlYWRlcnMgYXMgaXQgd2lsbCBiZSBkZXN0cm95XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNvbnN0IG9NYWluTW9kZWwgPSB0aGlzLm9Nb2RlbHNbdW5kZWZpbmVkXTtcblx0XHRsZXQgb0hlYWRlcnM7XG5cdFx0aWYgKG9NYWluTW9kZWwub1JlcXVlc3Rvcikge1xuXHRcdFx0b0hlYWRlcnMgPSBqUXVlcnkuZXh0ZW5kKHt9LCBvTWFpbk1vZGVsLm9SZXF1ZXN0b3IubUhlYWRlcnMpO1xuXHRcdH1cblxuXHRcdC8vIEFzIHdlIG5lZWQgdG8gY2xlYW51cCB0aGUgYXBwbGljYXRpb24gLyBoYW5kbGUgdGhlIGRpcnR5IG9iamVjdCB3ZSBuZWVkIHRvIGNhbGwgb3VyIGNsZWFudXAgYmVmb3JlIHRoZSBtb2RlbHMgYXJlIGRlc3Ryb3llZFxuXHRcdHRoaXMuZ2V0Um91dGluZ1NlcnZpY2UoKT8uYmVmb3JlRXhpdCgpO1xuXHRcdHN1cGVyLmRlc3Ryb3koYlN1cHByZXNzSW52YWxpZGF0ZSk7XG5cdFx0aWYgKG9IZWFkZXJzICYmIG9NYWluTW9kZWwub1JlcXVlc3Rvcikge1xuXHRcdFx0b01haW5Nb2RlbC5vUmVxdWVzdG9yLm1IZWFkZXJzID0gb0hlYWRlcnM7XG5cdFx0fVxuXHR9XG5cdGdldFJvdXRpbmdTZXJ2aWNlKCk6IFJvdXRpbmdTZXJ2aWNlIHtcblx0XHRyZXR1cm4ge30gYXMgUm91dGluZ1NlcnZpY2U7IC8vIG92ZXJyaWRlbiBhdCBydW50aW1lXG5cdH1cblx0Z2V0U2hlbGxTZXJ2aWNlcygpOiBJU2hlbGxTZXJ2aWNlcyB7XG5cdFx0cmV0dXJuIHt9IGFzIElTaGVsbFNlcnZpY2VzOyAvLyBvdmVycmlkZW4gYXQgcnVudGltZVxuXHR9XG5cdGdldE5hdmlnYXRpb25TZXJ2aWNlKCk6IE5hdmlnYXRpb25TZXJ2aWNlIHtcblx0XHRyZXR1cm4ge30gYXMgTmF2aWdhdGlvblNlcnZpY2U7IC8vIG92ZXJyaWRlbiBhdCBydW50aW1lXG5cdH1cblx0Z2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk6IFNpZGVFZmZlY3RzU2VydmljZSB7XG5cdFx0cmV0dXJuIHt9IGFzIFNpZGVFZmZlY3RzU2VydmljZTtcblx0fVxuXHRnZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpOiBFbnZpcm9ubWVudENhcGFiaWxpdGllc1NlcnZpY2Uge1xuXHRcdHJldHVybiB7fSBhcyBFbnZpcm9ubWVudENhcGFiaWxpdGllc1NlcnZpY2U7XG5cdH1cblxuXHRhc3luYyBnZXRTdGFydHVwUGFyYW1ldGVycygpIHtcblx0XHRjb25zdCBvQ29tcG9uZW50RGF0YSA9IHRoaXMuZ2V0Q29tcG9uZW50RGF0YSgpO1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKG9Db21wb25lbnREYXRhICYmIG9Db21wb25lbnREYXRhLnN0YXJ0dXBQYXJhbWV0ZXJzKSB8fCB7fSk7XG5cdH1cblx0cmVzdG9yZSgpIHtcblx0XHQvLyBjYWxsZWQgYnkgRkxQIHdoZW4gYXBwIHNhcC1rZWVwLWFsaXZlIGlzIGVuYWJsZWQgYW5kIGFwcCBpcyByZXN0b3JlZFxuXHRcdHRoaXMuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkudmlld1N0YXRlLm9uUmVzdG9yZSgpO1xuXHR9XG5cdHN1c3BlbmQoKSB7XG5cdFx0Ly8gY2FsbGVkIGJ5IEZMUCB3aGVuIGFwcCBzYXAta2VlcC1hbGl2ZSBpcyBlbmFibGVkIGFuZCBhcHAgaXMgc3VzcGVuZGVkXG5cdFx0dGhpcy5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS52aWV3U3RhdGUub25TdXNwZW5kKCk7XG5cdH1cbn1cblxuaW50ZXJmYWNlIEFwcENvbXBvbmVudCBleHRlbmRzIFVJQ29tcG9uZW50IHtcblx0Z2V0TWFuaWZlc3QoKTogTWFuaWZlc3RDb250ZW50O1xuXHRnZXRNYW5pZmVzdEVudHJ5KGVudHJ5OiBcInNhcC5hcHBcIik6IE1hbmlmZXN0Q29udGVudEFwcDtcblx0Z2V0TWFuaWZlc3RFbnRyeShlbnRyeTogXCJzYXAudWk1XCIpOiBNYW5pZmVzdENvbnRlbnRVSTU7XG5cdGdldENvbXBvbmVudERhdGEoKTogQ29tcG9uZW50RGF0YTtcblx0Z2V0Um9vdENvbnRyb2woKToge1xuXHRcdGdldENvbnRyb2xsZXIoKTogUm9vdFZpZXdCYXNlQ29udHJvbGxlcjtcblx0fSAmIFZpZXc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcENvbXBvbmVudDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7OztFQTBCQSxNQUFNQSxXQUFXLEdBQUdDLE9BQU8sQ0FBQ0QsV0FBVztFQUV2QyxNQUFNRSxPQUFPLEdBQUc7SUFDZkMsR0FBRyxFQUFFO01BQ0pDLFFBQVEsRUFBRSwwQkFBMEI7TUFDcENDLHNCQUFzQixFQUFFLHlDQUF5QztNQUNqRUMsV0FBVyxFQUFFO0lBQ2QsQ0FBQztJQUNEQyxZQUFZLEVBQUU7TUFDYkgsUUFBUSxFQUFFLG1DQUFtQztNQUM3Q0Msc0JBQXNCLEVBQUUsa0RBQWtEO01BQzFF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