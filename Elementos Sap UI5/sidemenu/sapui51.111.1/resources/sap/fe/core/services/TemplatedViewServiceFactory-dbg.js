/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/UriParameters", "sap/fe/core/helpers/LoaderUtils", "sap/fe/core/TemplateModel", "sap/ui/core/Component", "sap/ui/core/mvc/View", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/core/service/ServiceFactoryRegistry", "sap/ui/Device", "sap/ui/model/base/ManagedObjectModel", "sap/ui/model/json/JSONModel", "sap/ui/VersionInfo", "../helpers/DynamicAnnotationPathHelper"], function (Log, UriParameters, LoaderUtils, TemplateModel, Component, View, Service, ServiceFactory, ServiceFactoryRegistry, Device, ManagedObjectModel, JSONModel, VersionInfo, DynamicAnnotationPathHelper) {
  "use strict";

  var resolveDynamicExpression = DynamicAnnotationPathHelper.resolveDynamicExpression;
  var requireDependencies = LoaderUtils.requireDependencies;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let TemplatedViewService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(TemplatedViewService, _Service);
    function TemplatedViewService() {
      return _Service.apply(this, arguments) || this;
    }
    var _proto = TemplatedViewService.prototype;
    _proto.init = function init() {
      const aServiceDependencies = [];
      const oContext = this.getContext();
      const oComponent = oContext.scopeObject;
      const oAppComponent = Component.getOwnerComponentFor(oComponent);
      const oMetaModel = oAppComponent.getMetaModel();
      const sStableId = `${oAppComponent.getMetadata().getComponentName()}::${oAppComponent.getLocalId(oComponent.getId())}`;
      const aEnhanceI18n = oComponent.getEnhanceI18n() || [];
      let sAppNamespace;
      this.oFactory = oContext.factory;
      if (aEnhanceI18n) {
        sAppNamespace = oAppComponent.getMetadata().getComponentName();
        for (let i = 0; i < aEnhanceI18n.length; i++) {
          // In order to support text-verticalization applications can also passs a resource model defined in the manifest
          // UI5 takes care of text-verticalization for resource models defined in the manifest
          // Hence check if the given key is a resource model defined in the manifest
          // if so this model should be used to enhance the sap.fe resource model so pass it as it is
          const oResourceModel = oAppComponent.getModel(aEnhanceI18n[i]);
          if (oResourceModel && oResourceModel.isA("sap.ui.model.resource.ResourceModel")) {
            aEnhanceI18n[i] = oResourceModel;
          } else {
            aEnhanceI18n[i] = `${sAppNamespace}.${aEnhanceI18n[i].replace(".properties", "")}`;
          }
        }
      }
      const sCacheIdentifier = `${oAppComponent.getMetadata().getName()}_${sStableId}_${sap.ui.getCore().getConfiguration().getLanguageTag()}`;
      aServiceDependencies.push(ServiceFactoryRegistry.get("sap.fe.core.services.ResourceModelService").createInstance({
        scopeType: "component",
        scopeObject: oComponent,
        settings: {
          bundles: ["sap.fe.core.messagebundle", "sap.fe.macros.messagebundle", "sap.fe.templates.messagebundle"],
          enhanceI18n: aEnhanceI18n,
          modelName: "sap.fe.i18n"
        }
      }).then(oResourceModelService => {
        this.oResourceModelService = oResourceModelService;
        return oResourceModelService.getResourceModel();
      }));
      aServiceDependencies.push(ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").createInstance({
        settings: {
          metaModel: oMetaModel,
          appComponent: oAppComponent,
          component: oComponent
        }
      }).then(oCacheHandlerService => {
        this.oCacheHandlerService = oCacheHandlerService;
        return oCacheHandlerService.validateCacheKey(sCacheIdentifier, oComponent);
      }));
      aServiceDependencies.push(VersionInfo.load().then(function (oInfo) {
        let sTimestamp = "";
        if (!oInfo.libraries) {
          sTimestamp = sap.ui.buildinfo.buildtime;
        } else {
          oInfo.libraries.forEach(function (oLibrary) {
            sTimestamp += oLibrary.buildTimestamp;
          });
        }
        return sTimestamp;
      }).catch(function () {
        return "<NOVALUE>";
      }));
      this.initPromise = Promise.all(aServiceDependencies).then(async aDependenciesResult => {
        const oResourceModel = aDependenciesResult[0];
        const sCacheKey = aDependenciesResult[1];
        const oSideEffectsServices = oAppComponent.getSideEffectsService();
        oSideEffectsServices.initializeSideEffects(oAppComponent.getEnvironmentCapabilities().getCapabilities());
        const [TemplateConverter, MetaModelConverter] = await requireDependencies(["sap/fe/core/converters/TemplateConverter", "sap/fe/core/converters/MetaModelConverter"]);
        return this.createView(oResourceModel, sStableId, sCacheKey, TemplateConverter, MetaModelConverter);
      }).then(function (sCacheKey) {
        const oCacheHandlerService = ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").getInstance(oMetaModel);
        oCacheHandlerService.invalidateIfNeeded(sCacheKey, sCacheIdentifier, oComponent);
      });
    }

    /**
     * Refresh the current view using the same configuration as before.
     *
     * @param oComponent
     * @returns A promise indicating when the view is refreshed
     * @private
     */;
    _proto.refreshView = function refreshView(oComponent) {
      const oRootView = oComponent.getRootControl();
      if (oRootView) {
        oRootView.destroy();
      } else if (this.oView) {
        this.oView.destroy();
      }
      return this.createView(this.resourceModel, this.stableId, "", this.TemplateConverter, this.MetaModelConverter).then(function () {
        oComponent.oContainer.invalidate();
      }).catch(function (oError) {
        oComponent.oContainer.invalidate();
        Log.error(oError);
      });
    };
    _proto.createView = async function createView(oResourceModel, sStableId, sCacheKey, TemplateConverter, MetaModelConverter) {
      this.resourceModel = oResourceModel;
      this.stableId = sStableId;
      this.TemplateConverter = TemplateConverter;
      this.MetaModelConverter = MetaModelConverter;
      const oContext = this.getContext();
      const mServiceSettings = oContext.settings;
      const sConverterType = mServiceSettings.converterType;
      const oComponent = oContext.scopeObject;
      const oAppComponent = Component.getOwnerComponentFor(oComponent);
      const sFullContextPath = oAppComponent.getRoutingService().getTargetInformationFor(oComponent).options.settings.fullContextPath;
      const oMetaModel = oAppComponent.getMetaModel();
      const oManifestContent = oAppComponent.getManifest();
      const oDeviceModel = new JSONModel(Device).setDefaultBindingMode("OneWay");
      const oManifestModel = new JSONModel(oManifestContent);
      const bError = false;
      let oPageModel, oViewDataModel, oViewSettings, mViewData;
      // Load the index for the additional building blocks which is responsible for initializing them
      function getViewSettings() {
        const aSplitPath = sFullContextPath.split("/");
        const sEntitySetPath = aSplitPath.reduce(function (sPathSoFar, sNextPathPart) {
          if (sNextPathPart === "") {
            return sPathSoFar;
          }
          if (sPathSoFar === "") {
            sPathSoFar = `/${sNextPathPart}`;
          } else {
            const oTarget = oMetaModel.getObject(`${sPathSoFar}/$NavigationPropertyBinding/${sNextPathPart}`);
            if (oTarget && Object.keys(oTarget).length > 0) {
              sPathSoFar += "/$NavigationPropertyBinding";
            }
            sPathSoFar += `/${sNextPathPart}`;
          }
          return sPathSoFar;
        }, "");
        let viewType = mServiceSettings.viewType || oComponent.getViewType() || "XML";
        if (viewType !== "XML") {
          viewType = undefined;
        }
        return {
          type: viewType,
          preprocessors: {
            xml: {
              bindingContexts: {
                entitySet: sEntitySetPath ? oMetaModel.createBindingContext(sEntitySetPath) : null,
                fullContextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
                contextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
                converterContext: oPageModel.createBindingContext("/", undefined, {
                  noResolve: true
                }),
                viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
              },
              models: {
                entitySet: oMetaModel,
                fullContextPath: oMetaModel,
                contextPath: oMetaModel,
                "sap.fe.i18n": oResourceModel,
                metaModel: oMetaModel,
                device: oDeviceModel,
                manifest: oManifestModel,
                converterContext: oPageModel,
                viewData: oViewDataModel
              },
              appComponent: oAppComponent
            }
          },
          id: sStableId,
          viewName: mServiceSettings.viewName || oComponent.getViewName(),
          viewData: mViewData,
          cache: {
            keys: [sCacheKey],
            additionalData: {
              // We store the page model data in the `additionalData` of the view cache, this way it is always in sync
              getAdditionalCacheData: () => {
                return oPageModel.getData();
              },
              setAdditionalCacheData: value => {
                oPageModel.setData(value);
              }
            }
          },
          models: {
            "sap.fe.i18n": oResourceModel
          },
          height: "100%"
        };
      }
      const createErrorPage = reason => {
        // just replace the view name and add an additional model containing the reason, but
        // keep the other settings
        Log.error(reason.message, reason);
        oViewSettings.viewName = mServiceSettings.errorViewName || "sap.fe.core.services.view.TemplatingErrorPage";
        oViewSettings.preprocessors.xml.models["error"] = new JSONModel(reason);
        return oComponent.runAsOwner(() => {
          return View.create(oViewSettings).then(oView => {
            this.oView = oView;
            this.oView.setModel(new ManagedObjectModel(this.oView), "$view");
            oComponent.setAggregation("rootControl", this.oView);
            return sCacheKey;
          });
        });
      };
      try {
        var _oManifestContent$sap;
        const oRoutingService = await oAppComponent.getService("routingService");
        // Retrieve the viewLevel for the component
        const oTargetInfo = oRoutingService.getTargetInformationFor(oComponent);
        const mOutbounds = oManifestContent["sap.app"] && oManifestContent["sap.app"].crossNavigation && oManifestContent["sap.app"].crossNavigation.outbounds || {};
        const mNavigation = oComponent.getNavigation() || {};
        Object.keys(mNavigation).forEach(function (navigationObjectKey) {
          const navigationObject = mNavigation[navigationObjectKey];
          let outboundConfig;
          if (navigationObject.detail && navigationObject.detail.outbound && mOutbounds[navigationObject.detail.outbound]) {
            outboundConfig = mOutbounds[navigationObject.detail.outbound];
            navigationObject.detail.outboundDetail = {
              semanticObject: outboundConfig.semanticObject,
              action: outboundConfig.action,
              parameters: outboundConfig.parameters
            };
          }
          if (navigationObject.create && navigationObject.create.outbound && mOutbounds[navigationObject.create.outbound]) {
            outboundConfig = mOutbounds[navigationObject.create.outbound];
            navigationObject.create.outboundDetail = {
              semanticObject: outboundConfig.semanticObject,
              action: outboundConfig.action,
              parameters: outboundConfig.parameters
            };
          }
        });
        mViewData = {
          navigation: mNavigation,
          viewLevel: oTargetInfo.viewLevel,
          stableId: sStableId,
          contentDensities: (_oManifestContent$sap = oManifestContent["sap.ui5"]) === null || _oManifestContent$sap === void 0 ? void 0 : _oManifestContent$sap.contentDensities,
          resourceBundle: oResourceModel.__bundle,
          fullContextPath: sFullContextPath,
          isDesktop: Device.system.desktop,
          isPhone: Device.system.phone
        };
        if (oComponent.getViewData) {
          Object.assign(mViewData, oComponent.getViewData());
        }
        const oShellServices = oAppComponent.getShellServices();
        mViewData.converterType = sConverterType;
        mViewData.shellContentDensity = oShellServices.getContentDensity();
        mViewData.useNewLazyLoading = UriParameters.fromQuery(window.location.search).get("sap-fe-xx-lazyloadingtest") === "true";
        mViewData.retrieveTextFromValueList = oManifestContent["sap.fe"] && oManifestContent["sap.fe"].form ? oManifestContent["sap.fe"].form.retrieveTextFromValueList : undefined;
        oViewDataModel = new JSONModel(mViewData);
        if (mViewData.controlConfiguration) {
          for (const sAnnotationPath in mViewData.controlConfiguration) {
            if (sAnnotationPath.indexOf("[") !== -1) {
              const sTargetAnnotationPath = resolveDynamicExpression(sAnnotationPath, oMetaModel);
              mViewData.controlConfiguration[sTargetAnnotationPath] = mViewData.controlConfiguration[sAnnotationPath];
            }
          }
        }
        MetaModelConverter.convertTypes(oMetaModel, oAppComponent.getEnvironmentCapabilities().getCapabilities());
        oPageModel = new TemplateModel(() => {
          try {
            const oDiagnostics = oAppComponent.getDiagnostics();
            const iIssueCount = oDiagnostics.getIssues().length;
            const oConverterPageModel = TemplateConverter.convertPage(sConverterType, oMetaModel, mViewData, oDiagnostics, sFullContextPath, oAppComponent.getEnvironmentCapabilities().getCapabilities(), oComponent);
            const aIssues = oDiagnostics.getIssues();
            const aAddedIssues = aIssues.slice(iIssueCount);
            if (aAddedIssues.length > 0) {
              Log.warning("Some issues have been detected in your project, please check the UI5 support assistant rule for sap.fe.core");
            }
            return oConverterPageModel;
          } catch (error) {
            Log.error(error, error);
            return {};
          }
        }, oMetaModel);
        if (!bError) {
          oViewSettings = getViewSettings();
          // Setting the pageModel on the component for potential reuse
          oComponent.setModel(oPageModel, "_pageModel");
          return oComponent.runAsOwner(() => {
            return View.create(oViewSettings).catch(createErrorPage).then(oView => {
              this.oView = oView;
              this.oView.setModel(new ManagedObjectModel(this.oView), "$view");
              this.oView.setModel(oViewDataModel, "viewData");
              oComponent.setAggregation("rootControl", this.oView);
              return sCacheKey;
            }).catch(e => Log.error(e.message, e));
          });
        }
      } catch (error) {
        Log.error(error.message, error);
        throw new Error(`Error while creating view : ${error}`);
      }
    };
    _proto.getView = function getView() {
      return this.oView;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    _proto.exit = function exit() {
      // Deregister global instance
      if (this.oResourceModelService) {
        this.oResourceModelService.destroy();
      }
      if (this.oCacheHandlerService) {
        this.oCacheHandlerService.destroy();
      }
      this.oFactory.removeGlobalInstance();
    };
    return TemplatedViewService;
  }(Service);
  let TemplatedViewServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(TemplatedViewServiceFactory, _ServiceFactory);
    function TemplatedViewServiceFactory() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ServiceFactory.call(this, ...args) || this;
      _this._oInstanceRegistry = {};
      return _this;
    }
    var _proto2 = TemplatedViewServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      TemplatedViewServiceFactory.iCreatingViews++;
      const oTemplatedViewService = new TemplatedViewService(Object.assign({
        factory: this
      }, oServiceContext));
      return oTemplatedViewService.initPromise.then(function () {
        TemplatedViewServiceFactory.iCreatingViews--;
        return oTemplatedViewService;
      });
    };
    _proto2.removeGlobalInstance = function removeGlobalInstance() {
      this._oInstanceRegistry = {};
    };
    TemplatedViewServiceFactory.getNumberOfViewsInCreationState = function getNumberOfViewsInCreationState() {
      return TemplatedViewServiceFactory.iCreatingViews;
    };
    return TemplatedViewServiceFactory;
  }(ServiceFactory);
  return TemplatedViewServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZWRWaWV3U2VydmljZSIsImluaXQiLCJhU2VydmljZURlcGVuZGVuY2llcyIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsIm9Db21wb25lbnQiLCJzY29wZU9iamVjdCIsIm9BcHBDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJzU3RhYmxlSWQiLCJnZXRNZXRhZGF0YSIsImdldENvbXBvbmVudE5hbWUiLCJnZXRMb2NhbElkIiwiZ2V0SWQiLCJhRW5oYW5jZUkxOG4iLCJnZXRFbmhhbmNlSTE4biIsInNBcHBOYW1lc3BhY2UiLCJvRmFjdG9yeSIsImZhY3RvcnkiLCJpIiwibGVuZ3RoIiwib1Jlc291cmNlTW9kZWwiLCJnZXRNb2RlbCIsImlzQSIsInJlcGxhY2UiLCJzQ2FjaGVJZGVudGlmaWVyIiwiZ2V0TmFtZSIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImdldENvbmZpZ3VyYXRpb24iLCJnZXRMYW5ndWFnZVRhZyIsInB1c2giLCJTZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5IiwiZ2V0IiwiY3JlYXRlSW5zdGFuY2UiLCJzY29wZVR5cGUiLCJzZXR0aW5ncyIsImJ1bmRsZXMiLCJlbmhhbmNlSTE4biIsIm1vZGVsTmFtZSIsInRoZW4iLCJvUmVzb3VyY2VNb2RlbFNlcnZpY2UiLCJnZXRSZXNvdXJjZU1vZGVsIiwibWV0YU1vZGVsIiwiYXBwQ29tcG9uZW50IiwiY29tcG9uZW50Iiwib0NhY2hlSGFuZGxlclNlcnZpY2UiLCJ2YWxpZGF0ZUNhY2hlS2V5IiwiVmVyc2lvbkluZm8iLCJsb2FkIiwib0luZm8iLCJzVGltZXN0YW1wIiwibGlicmFyaWVzIiwiYnVpbGRpbmZvIiwiYnVpbGR0aW1lIiwiZm9yRWFjaCIsIm9MaWJyYXJ5IiwiYnVpbGRUaW1lc3RhbXAiLCJjYXRjaCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsImFsbCIsImFEZXBlbmRlbmNpZXNSZXN1bHQiLCJzQ2FjaGVLZXkiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlcyIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsImluaXRpYWxpemVTaWRlRWZmZWN0cyIsImdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiZ2V0Q2FwYWJpbGl0aWVzIiwiVGVtcGxhdGVDb252ZXJ0ZXIiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJyZXF1aXJlRGVwZW5kZW5jaWVzIiwiY3JlYXRlVmlldyIsImdldEluc3RhbmNlIiwiaW52YWxpZGF0ZUlmTmVlZGVkIiwicmVmcmVzaFZpZXciLCJvUm9vdFZpZXciLCJnZXRSb290Q29udHJvbCIsImRlc3Ryb3kiLCJvVmlldyIsInJlc291cmNlTW9kZWwiLCJzdGFibGVJZCIsIm9Db250YWluZXIiLCJpbnZhbGlkYXRlIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJtU2VydmljZVNldHRpbmdzIiwic0NvbnZlcnRlclR5cGUiLCJjb252ZXJ0ZXJUeXBlIiwic0Z1bGxDb250ZXh0UGF0aCIsImdldFJvdXRpbmdTZXJ2aWNlIiwiZ2V0VGFyZ2V0SW5mb3JtYXRpb25Gb3IiLCJvcHRpb25zIiwiZnVsbENvbnRleHRQYXRoIiwib01hbmlmZXN0Q29udGVudCIsImdldE1hbmlmZXN0Iiwib0RldmljZU1vZGVsIiwiSlNPTk1vZGVsIiwiRGV2aWNlIiwic2V0RGVmYXVsdEJpbmRpbmdNb2RlIiwib01hbmlmZXN0TW9kZWwiLCJiRXJyb3IiLCJvUGFnZU1vZGVsIiwib1ZpZXdEYXRhTW9kZWwiLCJvVmlld1NldHRpbmdzIiwibVZpZXdEYXRhIiwiZ2V0Vmlld1NldHRpbmdzIiwiYVNwbGl0UGF0aCIsInNwbGl0Iiwic0VudGl0eVNldFBhdGgiLCJyZWR1Y2UiLCJzUGF0aFNvRmFyIiwic05leHRQYXRoUGFydCIsIm9UYXJnZXQiLCJnZXRPYmplY3QiLCJPYmplY3QiLCJrZXlzIiwidmlld1R5cGUiLCJnZXRWaWV3VHlwZSIsInVuZGVmaW5lZCIsInR5cGUiLCJwcmVwcm9jZXNzb3JzIiwieG1sIiwiYmluZGluZ0NvbnRleHRzIiwiZW50aXR5U2V0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJjb250ZXh0UGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJub1Jlc29sdmUiLCJ2aWV3RGF0YSIsIm1vZGVscyIsImRldmljZSIsIm1hbmlmZXN0IiwiaWQiLCJ2aWV3TmFtZSIsImdldFZpZXdOYW1lIiwiY2FjaGUiLCJhZGRpdGlvbmFsRGF0YSIsImdldEFkZGl0aW9uYWxDYWNoZURhdGEiLCJnZXREYXRhIiwic2V0QWRkaXRpb25hbENhY2hlRGF0YSIsInZhbHVlIiwic2V0RGF0YSIsImhlaWdodCIsImNyZWF0ZUVycm9yUGFnZSIsInJlYXNvbiIsIm1lc3NhZ2UiLCJlcnJvclZpZXdOYW1lIiwicnVuQXNPd25lciIsIlZpZXciLCJjcmVhdGUiLCJzZXRNb2RlbCIsIk1hbmFnZWRPYmplY3RNb2RlbCIsInNldEFnZ3JlZ2F0aW9uIiwib1JvdXRpbmdTZXJ2aWNlIiwiZ2V0U2VydmljZSIsIm9UYXJnZXRJbmZvIiwibU91dGJvdW5kcyIsImNyb3NzTmF2aWdhdGlvbiIsIm91dGJvdW5kcyIsIm1OYXZpZ2F0aW9uIiwiZ2V0TmF2aWdhdGlvbiIsIm5hdmlnYXRpb25PYmplY3RLZXkiLCJuYXZpZ2F0aW9uT2JqZWN0Iiwib3V0Ym91bmRDb25maWciLCJkZXRhaWwiLCJvdXRib3VuZCIsIm91dGJvdW5kRGV0YWlsIiwic2VtYW50aWNPYmplY3QiLCJhY3Rpb24iLCJwYXJhbWV0ZXJzIiwibmF2aWdhdGlvbiIsInZpZXdMZXZlbCIsImNvbnRlbnREZW5zaXRpZXMiLCJyZXNvdXJjZUJ1bmRsZSIsIl9fYnVuZGxlIiwiaXNEZXNrdG9wIiwic3lzdGVtIiwiZGVza3RvcCIsImlzUGhvbmUiLCJwaG9uZSIsImdldFZpZXdEYXRhIiwiYXNzaWduIiwib1NoZWxsU2VydmljZXMiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2hlbGxDb250ZW50RGVuc2l0eSIsImdldENvbnRlbnREZW5zaXR5IiwidXNlTmV3TGF6eUxvYWRpbmciLCJVcmlQYXJhbWV0ZXJzIiwiZnJvbVF1ZXJ5Iiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IiwiZm9ybSIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwic0Fubm90YXRpb25QYXRoIiwiaW5kZXhPZiIsInNUYXJnZXRBbm5vdGF0aW9uUGF0aCIsInJlc29sdmVEeW5hbWljRXhwcmVzc2lvbiIsImNvbnZlcnRUeXBlcyIsIlRlbXBsYXRlTW9kZWwiLCJvRGlhZ25vc3RpY3MiLCJnZXREaWFnbm9zdGljcyIsImlJc3N1ZUNvdW50IiwiZ2V0SXNzdWVzIiwib0NvbnZlcnRlclBhZ2VNb2RlbCIsImNvbnZlcnRQYWdlIiwiYUlzc3VlcyIsImFBZGRlZElzc3VlcyIsInNsaWNlIiwid2FybmluZyIsImUiLCJFcnJvciIsImdldFZpZXciLCJnZXRJbnRlcmZhY2UiLCJleGl0IiwicmVtb3ZlR2xvYmFsSW5zdGFuY2UiLCJTZXJ2aWNlIiwiVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5IiwiX29JbnN0YW5jZVJlZ2lzdHJ5Iiwib1NlcnZpY2VDb250ZXh0IiwiaUNyZWF0aW5nVmlld3MiLCJvVGVtcGxhdGVkVmlld1NlcnZpY2UiLCJnZXROdW1iZXJPZlZpZXdzSW5DcmVhdGlvblN0YXRlIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgVXJpUGFyYW1ldGVycyBmcm9tIFwic2FwL2Jhc2UvdXRpbC9VcmlQYXJhbWV0ZXJzXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgeyBNYW5pZmVzdENvbnRlbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSB7IENvbnRlbnREZW5zaXRpZXNUeXBlLCBDb250cm9sQ29uZmlndXJhdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IHJlcXVpcmVEZXBlbmRlbmNpZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Mb2FkZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBDYWNoZUhhbmRsZXJTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL0NhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgVGVtcGxhdGVNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVNb2RlbFwiO1xuaW1wb3J0IHR5cGUgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgU2VydmljZUZhY3RvcnlSZWdpc3RyeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5XCI7XG5pbXBvcnQgRGV2aWNlIGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvYmFzZS9NYW5hZ2VkT2JqZWN0TW9kZWxcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9Nb2RlbFwiO1xuaW1wb3J0IFZlcnNpb25JbmZvIGZyb20gXCJzYXAvdWkvVmVyc2lvbkluZm9cIjtcbmltcG9ydCB0eXBlIHsgU2VydmljZUNvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgeyByZXNvbHZlRHluYW1pY0V4cHJlc3Npb24gfSBmcm9tIFwiLi4vaGVscGVycy9EeW5hbWljQW5ub3RhdGlvblBhdGhIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgUmVzb3VyY2VNb2RlbFNlcnZpY2UgfSBmcm9tIFwiLi9SZXNvdXJjZU1vZGVsU2VydmljZUZhY3RvcnlcIjtcblxudHlwZSBUZW1wbGF0ZWRWaWV3U2VydmljZVNldHRpbmdzID0ge307XG5leHBvcnQgdHlwZSBWaWV3RGF0YSA9IHtcblx0bmF2aWdhdGlvbjogb2JqZWN0O1xuXHR2aWV3TGV2ZWw6IG51bWJlcjtcblx0c3RhYmxlSWQ6IHN0cmluZztcblx0Y29udGVudERlbnNpdGllcz86IENvbnRlbnREZW5zaXRpZXNUeXBlO1xuXHRyZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGU7XG5cdGZ1bGxDb250ZXh0UGF0aDogc3RyaW5nO1xuXHRpc0Rlc2t0b3A6IGJvb2xlYW47XG5cdGlzUGhvbmU6IGJvb2xlYW47XG5cdGNvbnZlcnRlclR5cGU/OiBzdHJpbmc7XG5cdHNoZWxsQ29udGVudERlbnNpdHk/OiBzdHJpbmc7XG5cdHVzZU5ld0xhenlMb2FkaW5nPzogYm9vbGVhbjtcblx0cmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdD86IGJvb2xlYW47XG5cdGNvbnRyb2xDb25maWd1cmF0aW9uPzogQ29udHJvbENvbmZpZ3VyYXRpb247XG59O1xuXG5jbGFzcyBUZW1wbGF0ZWRWaWV3U2VydmljZSBleHRlbmRzIFNlcnZpY2U8VGVtcGxhdGVkVmlld1NlcnZpY2VTZXR0aW5ncz4ge1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55Pjtcblx0b1ZpZXchOiBWaWV3O1xuXHRvUmVzb3VyY2VNb2RlbFNlcnZpY2UhOiBSZXNvdXJjZU1vZGVsU2VydmljZTtcblx0b0NhY2hlSGFuZGxlclNlcnZpY2UhOiBDYWNoZUhhbmRsZXJTZXJ2aWNlO1xuXHRvRmFjdG9yeSE6IFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeTtcblx0cmVzb3VyY2VNb2RlbCE6IHR5cGVvZiBSZXNvdXJjZU1vZGVsO1xuXHRzdGFibGVJZCE6IHN0cmluZztcblx0VGVtcGxhdGVDb252ZXJ0ZXI6IGFueTtcblx0TWV0YU1vZGVsQ29udmVydGVyOiBhbnk7XG5cblx0aW5pdCgpIHtcblx0XHRjb25zdCBhU2VydmljZURlcGVuZGVuY2llcyA9IFtdO1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob0NvbXBvbmVudCkgYXMgQXBwQ29tcG9uZW50O1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IHNTdGFibGVJZCA9IGAke29BcHBDb21wb25lbnQuZ2V0TWV0YWRhdGEoKS5nZXRDb21wb25lbnROYW1lKCl9Ojoke29BcHBDb21wb25lbnQuZ2V0TG9jYWxJZChvQ29tcG9uZW50LmdldElkKCkpfWA7XG5cdFx0Y29uc3QgYUVuaGFuY2VJMThuID0gb0NvbXBvbmVudC5nZXRFbmhhbmNlSTE4bigpIHx8IFtdO1xuXHRcdGxldCBzQXBwTmFtZXNwYWNlO1xuXHRcdHRoaXMub0ZhY3RvcnkgPSBvQ29udGV4dC5mYWN0b3J5O1xuXHRcdGlmIChhRW5oYW5jZUkxOG4pIHtcblx0XHRcdHNBcHBOYW1lc3BhY2UgPSBvQXBwQ29tcG9uZW50LmdldE1ldGFkYXRhKCkuZ2V0Q29tcG9uZW50TmFtZSgpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhRW5oYW5jZUkxOG4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gSW4gb3JkZXIgdG8gc3VwcG9ydCB0ZXh0LXZlcnRpY2FsaXphdGlvbiBhcHBsaWNhdGlvbnMgY2FuIGFsc28gcGFzc3MgYSByZXNvdXJjZSBtb2RlbCBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHQvLyBVSTUgdGFrZXMgY2FyZSBvZiB0ZXh0LXZlcnRpY2FsaXphdGlvbiBmb3IgcmVzb3VyY2UgbW9kZWxzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG5cdFx0XHRcdC8vIEhlbmNlIGNoZWNrIGlmIHRoZSBnaXZlbiBrZXkgaXMgYSByZXNvdXJjZSBtb2RlbCBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHQvLyBpZiBzbyB0aGlzIG1vZGVsIHNob3VsZCBiZSB1c2VkIHRvIGVuaGFuY2UgdGhlIHNhcC5mZSByZXNvdXJjZSBtb2RlbCBzbyBwYXNzIGl0IGFzIGl0IGlzXG5cdFx0XHRcdGNvbnN0IG9SZXNvdXJjZU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNb2RlbChhRW5oYW5jZUkxOG5baV0pO1xuXHRcdFx0XHRpZiAob1Jlc291cmNlTW9kZWwgJiYgb1Jlc291cmNlTW9kZWwuaXNBKFwic2FwLnVpLm1vZGVsLnJlc291cmNlLlJlc291cmNlTW9kZWxcIikpIHtcblx0XHRcdFx0XHRhRW5oYW5jZUkxOG5baV0gPSBvUmVzb3VyY2VNb2RlbDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhRW5oYW5jZUkxOG5baV0gPSBgJHtzQXBwTmFtZXNwYWNlfS4ke2FFbmhhbmNlSTE4bltpXS5yZXBsYWNlKFwiLnByb3BlcnRpZXNcIiwgXCJcIil9YDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHNDYWNoZUlkZW50aWZpZXIgPSBgJHtvQXBwQ29tcG9uZW50LmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpfV8ke3NTdGFibGVJZH1fJHtzYXAudWlcblx0XHRcdC5nZXRDb3JlKClcblx0XHRcdC5nZXRDb25maWd1cmF0aW9uKClcblx0XHRcdC5nZXRMYW5ndWFnZVRhZygpfWA7XG5cdFx0YVNlcnZpY2VEZXBlbmRlbmNpZXMucHVzaChcblx0XHRcdFNlcnZpY2VGYWN0b3J5UmVnaXN0cnkuZ2V0KFwic2FwLmZlLmNvcmUuc2VydmljZXMuUmVzb3VyY2VNb2RlbFNlcnZpY2VcIilcblx0XHRcdFx0LmNyZWF0ZUluc3RhbmNlKHtcblx0XHRcdFx0XHRzY29wZVR5cGU6IFwiY29tcG9uZW50XCIsXG5cdFx0XHRcdFx0c2NvcGVPYmplY3Q6IG9Db21wb25lbnQsXG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcblx0XHRcdFx0XHRcdGJ1bmRsZXM6IFtcInNhcC5mZS5jb3JlLm1lc3NhZ2VidW5kbGVcIiwgXCJzYXAuZmUubWFjcm9zLm1lc3NhZ2VidW5kbGVcIiwgXCJzYXAuZmUudGVtcGxhdGVzLm1lc3NhZ2VidW5kbGVcIl0sXG5cdFx0XHRcdFx0XHRlbmhhbmNlSTE4bjogYUVuaGFuY2VJMThuLFxuXHRcdFx0XHRcdFx0bW9kZWxOYW1lOiBcInNhcC5mZS5pMThuXCJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKChvUmVzb3VyY2VNb2RlbFNlcnZpY2U6IFJlc291cmNlTW9kZWxTZXJ2aWNlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5vUmVzb3VyY2VNb2RlbFNlcnZpY2UgPSBvUmVzb3VyY2VNb2RlbFNlcnZpY2U7XG5cdFx0XHRcdFx0cmV0dXJuIG9SZXNvdXJjZU1vZGVsU2VydmljZS5nZXRSZXNvdXJjZU1vZGVsKCk7XG5cdFx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdGFTZXJ2aWNlRGVwZW5kZW5jaWVzLnB1c2goXG5cdFx0XHRTZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LmdldChcInNhcC5mZS5jb3JlLnNlcnZpY2VzLkNhY2hlSGFuZGxlclNlcnZpY2VcIilcblx0XHRcdFx0LmNyZWF0ZUluc3RhbmNlKHtcblx0XHRcdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRcdFx0bWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0YXBwQ29tcG9uZW50OiBvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0Y29tcG9uZW50OiBvQ29tcG9uZW50XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigob0NhY2hlSGFuZGxlclNlcnZpY2U6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMub0NhY2hlSGFuZGxlclNlcnZpY2UgPSBvQ2FjaGVIYW5kbGVyU2VydmljZTtcblx0XHRcdFx0XHRyZXR1cm4gb0NhY2hlSGFuZGxlclNlcnZpY2UudmFsaWRhdGVDYWNoZUtleShzQ2FjaGVJZGVudGlmaWVyLCBvQ29tcG9uZW50KTtcblx0XHRcdFx0fSlcblx0XHQpO1xuXHRcdGFTZXJ2aWNlRGVwZW5kZW5jaWVzLnB1c2goXG5cdFx0XHQoVmVyc2lvbkluZm8gYXMgYW55KVxuXHRcdFx0XHQubG9hZCgpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvSW5mbzogYW55KSB7XG5cdFx0XHRcdFx0bGV0IHNUaW1lc3RhbXAgPSBcIlwiO1xuXHRcdFx0XHRcdGlmICghb0luZm8ubGlicmFyaWVzKSB7XG5cdFx0XHRcdFx0XHRzVGltZXN0YW1wID0gKHNhcC51aSBhcyBhbnkpLmJ1aWxkaW5mby5idWlsZHRpbWU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9JbmZvLmxpYnJhcmllcy5mb3JFYWNoKGZ1bmN0aW9uIChvTGlicmFyeTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHNUaW1lc3RhbXAgKz0gb0xpYnJhcnkuYnVpbGRUaW1lc3RhbXA7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHNUaW1lc3RhbXA7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFwiPE5PVkFMVUU+XCI7XG5cdFx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBQcm9taXNlLmFsbChhU2VydmljZURlcGVuZGVuY2llcylcblx0XHRcdC50aGVuKGFzeW5jIChhRGVwZW5kZW5jaWVzUmVzdWx0OiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvUmVzb3VyY2VNb2RlbCA9IGFEZXBlbmRlbmNpZXNSZXN1bHRbMF07XG5cdFx0XHRcdGNvbnN0IHNDYWNoZUtleSA9IGFEZXBlbmRlbmNpZXNSZXN1bHRbMV07XG5cdFx0XHRcdGNvbnN0IG9TaWRlRWZmZWN0c1NlcnZpY2VzID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0XHRcdFx0b1NpZGVFZmZlY3RzU2VydmljZXMuaW5pdGlhbGl6ZVNpZGVFZmZlY3RzKG9BcHBDb21wb25lbnQuZ2V0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMoKS5nZXRDYXBhYmlsaXRpZXMoKSk7XG5cblx0XHRcdFx0Y29uc3QgW1RlbXBsYXRlQ29udmVydGVyLCBNZXRhTW9kZWxDb252ZXJ0ZXJdID0gYXdhaXQgcmVxdWlyZURlcGVuZGVuY2llcyhbXG5cdFx0XHRcdFx0XCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL1RlbXBsYXRlQ29udmVydGVyXCIsXG5cdFx0XHRcdFx0XCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiXG5cdFx0XHRcdF0pO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVWaWV3KG9SZXNvdXJjZU1vZGVsLCBzU3RhYmxlSWQsIHNDYWNoZUtleSwgVGVtcGxhdGVDb252ZXJ0ZXIsIE1ldGFNb2RlbENvbnZlcnRlcik7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHNDYWNoZUtleTogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9DYWNoZUhhbmRsZXJTZXJ2aWNlID0gU2VydmljZUZhY3RvcnlSZWdpc3RyeS5nZXQoXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5DYWNoZUhhbmRsZXJTZXJ2aWNlXCIpLmdldEluc3RhbmNlKG9NZXRhTW9kZWwpO1xuXHRcdFx0XHRvQ2FjaGVIYW5kbGVyU2VydmljZS5pbnZhbGlkYXRlSWZOZWVkZWQoc0NhY2hlS2V5LCBzQ2FjaGVJZGVudGlmaWVyLCBvQ29tcG9uZW50KTtcblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZnJlc2ggdGhlIGN1cnJlbnQgdmlldyB1c2luZyB0aGUgc2FtZSBjb25maWd1cmF0aW9uIGFzIGJlZm9yZS5cblx0ICpcblx0ICogQHBhcmFtIG9Db21wb25lbnRcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGluZGljYXRpbmcgd2hlbiB0aGUgdmlldyBpcyByZWZyZXNoZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHJlZnJlc2hWaWV3KG9Db21wb25lbnQ6IGFueSkge1xuXHRcdGNvbnN0IG9Sb290VmlldyA9IG9Db21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRpZiAob1Jvb3RWaWV3KSB7XG5cdFx0XHRvUm9vdFZpZXcuZGVzdHJveSgpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5vVmlldykge1xuXHRcdFx0dGhpcy5vVmlldy5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmNyZWF0ZVZpZXcodGhpcy5yZXNvdXJjZU1vZGVsLCB0aGlzLnN0YWJsZUlkLCBcIlwiLCB0aGlzLlRlbXBsYXRlQ29udmVydGVyLCB0aGlzLk1ldGFNb2RlbENvbnZlcnRlcilcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0b0NvbXBvbmVudC5vQ29udGFpbmVyLmludmFsaWRhdGUoKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdG9Db21wb25lbnQub0NvbnRhaW5lci5pbnZhbGlkYXRlKCk7XG5cdFx0XHRcdExvZy5lcnJvcihvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cblx0YXN5bmMgY3JlYXRlVmlldyhcblx0XHRvUmVzb3VyY2VNb2RlbDogYW55LFxuXHRcdHNTdGFibGVJZDogYW55LFxuXHRcdHNDYWNoZUtleTogYW55LFxuXHRcdFRlbXBsYXRlQ29udmVydGVyOiBhbnksXG5cdFx0TWV0YU1vZGVsQ29udmVydGVyOiBhbnlcblx0KTogUHJvbWlzZTxhbnkgfCB2b2lkPiB7XG5cdFx0dGhpcy5yZXNvdXJjZU1vZGVsID0gb1Jlc291cmNlTW9kZWw7XG5cdFx0dGhpcy5zdGFibGVJZCA9IHNTdGFibGVJZDtcblx0XHR0aGlzLlRlbXBsYXRlQ29udmVydGVyID0gVGVtcGxhdGVDb252ZXJ0ZXI7XG5cdFx0dGhpcy5NZXRhTW9kZWxDb252ZXJ0ZXIgPSBNZXRhTW9kZWxDb252ZXJ0ZXI7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLmdldENvbnRleHQoKTtcblx0XHRjb25zdCBtU2VydmljZVNldHRpbmdzID0gb0NvbnRleHQuc2V0dGluZ3M7XG5cdFx0Y29uc3Qgc0NvbnZlcnRlclR5cGUgPSBtU2VydmljZVNldHRpbmdzLmNvbnZlcnRlclR5cGU7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcihvQ29tcG9uZW50KSBhcyBBcHBDb21wb25lbnQ7XG5cdFx0Y29uc3Qgc0Z1bGxDb250ZXh0UGF0aCA9IG9BcHBDb21wb25lbnQuZ2V0Um91dGluZ1NlcnZpY2UoKS5nZXRUYXJnZXRJbmZvcm1hdGlvbkZvcihvQ29tcG9uZW50KS5vcHRpb25zLnNldHRpbmdzLmZ1bGxDb250ZXh0UGF0aDtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBvTWFuaWZlc3RDb250ZW50OiBNYW5pZmVzdENvbnRlbnQgPSBvQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0KCk7XG5cdFx0Y29uc3Qgb0RldmljZU1vZGVsID0gbmV3IEpTT05Nb2RlbChEZXZpY2UpLnNldERlZmF1bHRCaW5kaW5nTW9kZShcIk9uZVdheVwiKTtcblx0XHRjb25zdCBvTWFuaWZlc3RNb2RlbCA9IG5ldyBKU09OTW9kZWwob01hbmlmZXN0Q29udGVudCk7XG5cdFx0Y29uc3QgYkVycm9yID0gZmFsc2U7XG5cdFx0bGV0IG9QYWdlTW9kZWw6IFRlbXBsYXRlTW9kZWwsIG9WaWV3RGF0YU1vZGVsOiBNb2RlbCwgb1ZpZXdTZXR0aW5nczogYW55LCBtVmlld0RhdGE6IFZpZXdEYXRhO1xuXHRcdC8vIExvYWQgdGhlIGluZGV4IGZvciB0aGUgYWRkaXRpb25hbCBidWlsZGluZyBibG9ja3Mgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yIGluaXRpYWxpemluZyB0aGVtXG5cdFx0ZnVuY3Rpb24gZ2V0Vmlld1NldHRpbmdzKCkge1xuXHRcdFx0Y29uc3QgYVNwbGl0UGF0aCA9IHNGdWxsQ29udGV4dFBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBhU3BsaXRQYXRoLnJlZHVjZShmdW5jdGlvbiAoc1BhdGhTb0ZhcjogYW55LCBzTmV4dFBhdGhQYXJ0OiBhbnkpIHtcblx0XHRcdFx0aWYgKHNOZXh0UGF0aFBhcnQgPT09IFwiXCIpIHtcblx0XHRcdFx0XHRyZXR1cm4gc1BhdGhTb0Zhcjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc1BhdGhTb0ZhciA9PT0gXCJcIikge1xuXHRcdFx0XHRcdHNQYXRoU29GYXIgPSBgLyR7c05leHRQYXRoUGFydH1gO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IG9UYXJnZXQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aFNvRmFyfS8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy8ke3NOZXh0UGF0aFBhcnR9YCk7XG5cdFx0XHRcdFx0aWYgKG9UYXJnZXQgJiYgT2JqZWN0LmtleXMob1RhcmdldCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0c1BhdGhTb0ZhciArPSBcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzUGF0aFNvRmFyICs9IGAvJHtzTmV4dFBhdGhQYXJ0fWA7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHNQYXRoU29GYXI7XG5cdFx0XHR9LCBcIlwiKTtcblx0XHRcdGxldCB2aWV3VHlwZSA9IG1TZXJ2aWNlU2V0dGluZ3Mudmlld1R5cGUgfHwgb0NvbXBvbmVudC5nZXRWaWV3VHlwZSgpIHx8IFwiWE1MXCI7XG5cdFx0XHRpZiAodmlld1R5cGUgIT09IFwiWE1MXCIpIHtcblx0XHRcdFx0dmlld1R5cGUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiB2aWV3VHlwZSxcblx0XHRcdFx0cHJlcHJvY2Vzc29yczoge1xuXHRcdFx0XHRcdHhtbDoge1xuXHRcdFx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0XHRcdGVudGl0eVNldDogc0VudGl0eVNldFBhdGggPyBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNFbnRpdHlTZXRQYXRoKSA6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGZ1bGxDb250ZXh0UGF0aDogc0Z1bGxDb250ZXh0UGF0aCA/IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bGxDb250ZXh0UGF0aCkgOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogc0Z1bGxDb250ZXh0UGF0aCA/IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bGxDb250ZXh0UGF0aCkgOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBvUGFnZU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiLCB1bmRlZmluZWQsIHsgbm9SZXNvbHZlOiB0cnVlIH0pLFxuXHRcdFx0XHRcdFx0XHR2aWV3RGF0YTogbVZpZXdEYXRhID8gb1ZpZXdEYXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpIDogbnVsbFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGZ1bGxDb250ZXh0UGF0aDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdFwic2FwLmZlLmkxOG5cIjogb1Jlc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0ZGV2aWNlOiBvRGV2aWNlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG1hbmlmZXN0OiBvTWFuaWZlc3RNb2RlbCxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogb1BhZ2VNb2RlbCxcblx0XHRcdFx0XHRcdFx0dmlld0RhdGE6IG9WaWV3RGF0YU1vZGVsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0YXBwQ29tcG9uZW50OiBvQXBwQ29tcG9uZW50XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpZDogc1N0YWJsZUlkLFxuXHRcdFx0XHR2aWV3TmFtZTogbVNlcnZpY2VTZXR0aW5ncy52aWV3TmFtZSB8fCBvQ29tcG9uZW50LmdldFZpZXdOYW1lKCksXG5cdFx0XHRcdHZpZXdEYXRhOiBtVmlld0RhdGEsXG5cdFx0XHRcdGNhY2hlOiB7XG5cdFx0XHRcdFx0a2V5czogW3NDYWNoZUtleV0sXG5cdFx0XHRcdFx0YWRkaXRpb25hbERhdGE6IHtcblx0XHRcdFx0XHRcdC8vIFdlIHN0b3JlIHRoZSBwYWdlIG1vZGVsIGRhdGEgaW4gdGhlIGBhZGRpdGlvbmFsRGF0YWAgb2YgdGhlIHZpZXcgY2FjaGUsIHRoaXMgd2F5IGl0IGlzIGFsd2F5cyBpbiBzeW5jXG5cdFx0XHRcdFx0XHRnZXRBZGRpdGlvbmFsQ2FjaGVEYXRhOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAob1BhZ2VNb2RlbCBhcyB1bmtub3duIGFzIEpTT05Nb2RlbCkuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHNldEFkZGl0aW9uYWxDYWNoZURhdGE6ICh2YWx1ZTogb2JqZWN0KSA9PiB7XG5cdFx0XHRcdFx0XHRcdChvUGFnZU1vZGVsIGFzIHVua25vd24gYXMgSlNPTk1vZGVsKS5zZXREYXRhKHZhbHVlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFwic2FwLmZlLmkxOG5cIjogb1Jlc291cmNlTW9kZWxcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVpZ2h0OiBcIjEwMCVcIlxuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y29uc3QgY3JlYXRlRXJyb3JQYWdlID0gKHJlYXNvbjogYW55KSA9PiB7XG5cdFx0XHQvLyBqdXN0IHJlcGxhY2UgdGhlIHZpZXcgbmFtZSBhbmQgYWRkIGFuIGFkZGl0aW9uYWwgbW9kZWwgY29udGFpbmluZyB0aGUgcmVhc29uLCBidXRcblx0XHRcdC8vIGtlZXAgdGhlIG90aGVyIHNldHRpbmdzXG5cdFx0XHRMb2cuZXJyb3IocmVhc29uLm1lc3NhZ2UsIHJlYXNvbik7XG5cdFx0XHRvVmlld1NldHRpbmdzLnZpZXdOYW1lID0gbVNlcnZpY2VTZXR0aW5ncy5lcnJvclZpZXdOYW1lIHx8IFwic2FwLmZlLmNvcmUuc2VydmljZXMudmlldy5UZW1wbGF0aW5nRXJyb3JQYWdlXCI7XG5cdFx0XHRvVmlld1NldHRpbmdzLnByZXByb2Nlc3NvcnMueG1sLm1vZGVsc1tcImVycm9yXCJdID0gbmV3IEpTT05Nb2RlbChyZWFzb24pO1xuXG5cdFx0XHRyZXR1cm4gb0NvbXBvbmVudC5ydW5Bc093bmVyKCgpID0+IHtcblx0XHRcdFx0cmV0dXJuIFZpZXcuY3JlYXRlKG9WaWV3U2V0dGluZ3MpLnRoZW4oKG9WaWV3OiBhbnkpID0+IHtcblx0XHRcdFx0XHR0aGlzLm9WaWV3ID0gb1ZpZXc7XG5cdFx0XHRcdFx0dGhpcy5vVmlldy5zZXRNb2RlbChuZXcgTWFuYWdlZE9iamVjdE1vZGVsKHRoaXMub1ZpZXcpLCBcIiR2aWV3XCIpO1xuXHRcdFx0XHRcdG9Db21wb25lbnQuc2V0QWdncmVnYXRpb24oXCJyb290Q29udHJvbFwiLCB0aGlzLm9WaWV3KTtcblx0XHRcdFx0XHRyZXR1cm4gc0NhY2hlS2V5O1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb1JvdXRpbmdTZXJ2aWNlID0gYXdhaXQgb0FwcENvbXBvbmVudC5nZXRTZXJ2aWNlKFwicm91dGluZ1NlcnZpY2VcIik7XG5cdFx0XHQvLyBSZXRyaWV2ZSB0aGUgdmlld0xldmVsIGZvciB0aGUgY29tcG9uZW50XG5cdFx0XHRjb25zdCBvVGFyZ2V0SW5mbyA9IG9Sb3V0aW5nU2VydmljZS5nZXRUYXJnZXRJbmZvcm1hdGlvbkZvcihvQ29tcG9uZW50KTtcblx0XHRcdGNvbnN0IG1PdXRib3VuZHMgPVxuXHRcdFx0XHQob01hbmlmZXN0Q29udGVudFtcInNhcC5hcHBcIl0gJiZcblx0XHRcdFx0XHRvTWFuaWZlc3RDb250ZW50W1wic2FwLmFwcFwiXS5jcm9zc05hdmlnYXRpb24gJiZcblx0XHRcdFx0XHRvTWFuaWZlc3RDb250ZW50W1wic2FwLmFwcFwiXS5jcm9zc05hdmlnYXRpb24ub3V0Ym91bmRzKSB8fFxuXHRcdFx0XHR7fTtcblx0XHRcdGNvbnN0IG1OYXZpZ2F0aW9uID0gb0NvbXBvbmVudC5nZXROYXZpZ2F0aW9uKCkgfHwge307XG5cdFx0XHRPYmplY3Qua2V5cyhtTmF2aWdhdGlvbikuZm9yRWFjaChmdW5jdGlvbiAobmF2aWdhdGlvbk9iamVjdEtleTogc3RyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IG5hdmlnYXRpb25PYmplY3QgPSBtTmF2aWdhdGlvbltuYXZpZ2F0aW9uT2JqZWN0S2V5XTtcblx0XHRcdFx0bGV0IG91dGJvdW5kQ29uZmlnO1xuXHRcdFx0XHRpZiAobmF2aWdhdGlvbk9iamVjdC5kZXRhaWwgJiYgbmF2aWdhdGlvbk9iamVjdC5kZXRhaWwub3V0Ym91bmQgJiYgbU91dGJvdW5kc1tuYXZpZ2F0aW9uT2JqZWN0LmRldGFpbC5vdXRib3VuZF0pIHtcblx0XHRcdFx0XHRvdXRib3VuZENvbmZpZyA9IG1PdXRib3VuZHNbbmF2aWdhdGlvbk9iamVjdC5kZXRhaWwub3V0Ym91bmRdO1xuXHRcdFx0XHRcdG5hdmlnYXRpb25PYmplY3QuZGV0YWlsLm91dGJvdW5kRGV0YWlsID0ge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG91dGJvdW5kQ29uZmlnLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBvdXRib3VuZENvbmZpZy5hY3Rpb24sXG5cdFx0XHRcdFx0XHRwYXJhbWV0ZXJzOiBvdXRib3VuZENvbmZpZy5wYXJhbWV0ZXJzXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobmF2aWdhdGlvbk9iamVjdC5jcmVhdGUgJiYgbmF2aWdhdGlvbk9iamVjdC5jcmVhdGUub3V0Ym91bmQgJiYgbU91dGJvdW5kc1tuYXZpZ2F0aW9uT2JqZWN0LmNyZWF0ZS5vdXRib3VuZF0pIHtcblx0XHRcdFx0XHRvdXRib3VuZENvbmZpZyA9IG1PdXRib3VuZHNbbmF2aWdhdGlvbk9iamVjdC5jcmVhdGUub3V0Ym91bmRdO1xuXHRcdFx0XHRcdG5hdmlnYXRpb25PYmplY3QuY3JlYXRlLm91dGJvdW5kRGV0YWlsID0ge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG91dGJvdW5kQ29uZmlnLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBvdXRib3VuZENvbmZpZy5hY3Rpb24sXG5cdFx0XHRcdFx0XHRwYXJhbWV0ZXJzOiBvdXRib3VuZENvbmZpZy5wYXJhbWV0ZXJzXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRtVmlld0RhdGEgPSB7XG5cdFx0XHRcdG5hdmlnYXRpb246IG1OYXZpZ2F0aW9uLFxuXHRcdFx0XHR2aWV3TGV2ZWw6IG9UYXJnZXRJbmZvLnZpZXdMZXZlbCxcblx0XHRcdFx0c3RhYmxlSWQ6IHNTdGFibGVJZCxcblx0XHRcdFx0Y29udGVudERlbnNpdGllczogb01hbmlmZXN0Q29udGVudFtcInNhcC51aTVcIl0/LmNvbnRlbnREZW5zaXRpZXMsXG5cdFx0XHRcdHJlc291cmNlQnVuZGxlOiBvUmVzb3VyY2VNb2RlbC5fX2J1bmRsZSxcblx0XHRcdFx0ZnVsbENvbnRleHRQYXRoOiBzRnVsbENvbnRleHRQYXRoLFxuXHRcdFx0XHRpc0Rlc2t0b3A6IChEZXZpY2UgYXMgYW55KS5zeXN0ZW0uZGVza3RvcCxcblx0XHRcdFx0aXNQaG9uZTogKERldmljZSBhcyBhbnkpLnN5c3RlbS5waG9uZVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKG9Db21wb25lbnQuZ2V0Vmlld0RhdGEpIHtcblx0XHRcdFx0T2JqZWN0LmFzc2lnbihtVmlld0RhdGEsIG9Db21wb25lbnQuZ2V0Vmlld0RhdGEoKSk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VzID0gb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0XHRtVmlld0RhdGEuY29udmVydGVyVHlwZSA9IHNDb252ZXJ0ZXJUeXBlO1xuXHRcdFx0bVZpZXdEYXRhLnNoZWxsQ29udGVudERlbnNpdHkgPSBvU2hlbGxTZXJ2aWNlcy5nZXRDb250ZW50RGVuc2l0eSgpO1xuXHRcdFx0bVZpZXdEYXRhLnVzZU5ld0xhenlMb2FkaW5nID0gVXJpUGFyYW1ldGVycy5mcm9tUXVlcnkod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwic2FwLWZlLXh4LWxhenlsb2FkaW5ndGVzdFwiKSA9PT0gXCJ0cnVlXCI7XG5cdFx0XHRtVmlld0RhdGEucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCA9XG5cdFx0XHRcdG9NYW5pZmVzdENvbnRlbnRbXCJzYXAuZmVcIl0gJiYgb01hbmlmZXN0Q29udGVudFtcInNhcC5mZVwiXS5mb3JtXG5cdFx0XHRcdFx0PyBvTWFuaWZlc3RDb250ZW50W1wic2FwLmZlXCJdLmZvcm0ucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0b1ZpZXdEYXRhTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG1WaWV3RGF0YSk7XG5cdFx0XHRpZiAobVZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uKSB7XG5cdFx0XHRcdGZvciAoY29uc3Qgc0Fubm90YXRpb25QYXRoIGluIG1WaWV3RGF0YS5jb250cm9sQ29uZmlndXJhdGlvbikge1xuXHRcdFx0XHRcdGlmIChzQW5ub3RhdGlvblBhdGguaW5kZXhPZihcIltcIikgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzVGFyZ2V0QW5ub3RhdGlvblBhdGggPSByZXNvbHZlRHluYW1pY0V4cHJlc3Npb24oc0Fubm90YXRpb25QYXRoLCBvTWV0YU1vZGVsKTtcblx0XHRcdFx0XHRcdG1WaWV3RGF0YS5jb250cm9sQ29uZmlndXJhdGlvbltzVGFyZ2V0QW5ub3RhdGlvblBhdGhdID0gbVZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uW3NBbm5vdGF0aW9uUGF0aF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRNZXRhTW9kZWxDb252ZXJ0ZXIuY29udmVydFR5cGVzKG9NZXRhTW9kZWwsIG9BcHBDb21wb25lbnQuZ2V0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMoKS5nZXRDYXBhYmlsaXRpZXMoKSk7XG5cdFx0XHRvUGFnZU1vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwoKCkgPT4ge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IG9EaWFnbm9zdGljcyA9IG9BcHBDb21wb25lbnQuZ2V0RGlhZ25vc3RpY3MoKTtcblx0XHRcdFx0XHRjb25zdCBpSXNzdWVDb3VudCA9IG9EaWFnbm9zdGljcy5nZXRJc3N1ZXMoKS5sZW5ndGg7XG5cdFx0XHRcdFx0Y29uc3Qgb0NvbnZlcnRlclBhZ2VNb2RlbCA9IFRlbXBsYXRlQ29udmVydGVyLmNvbnZlcnRQYWdlKFxuXHRcdFx0XHRcdFx0c0NvbnZlcnRlclR5cGUsXG5cdFx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0bVZpZXdEYXRhLFxuXHRcdFx0XHRcdFx0b0RpYWdub3N0aWNzLFxuXHRcdFx0XHRcdFx0c0Z1bGxDb250ZXh0UGF0aCxcblx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMoKS5nZXRDYXBhYmlsaXRpZXMoKSxcblx0XHRcdFx0XHRcdG9Db21wb25lbnRcblx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0Y29uc3QgYUlzc3VlcyA9IG9EaWFnbm9zdGljcy5nZXRJc3N1ZXMoKTtcblx0XHRcdFx0XHRjb25zdCBhQWRkZWRJc3N1ZXMgPSBhSXNzdWVzLnNsaWNlKGlJc3N1ZUNvdW50KTtcblx0XHRcdFx0XHRpZiAoYUFkZGVkSXNzdWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcdFx0XHRcIlNvbWUgaXNzdWVzIGhhdmUgYmVlbiBkZXRlY3RlZCBpbiB5b3VyIHByb2plY3QsIHBsZWFzZSBjaGVjayB0aGUgVUk1IHN1cHBvcnQgYXNzaXN0YW50IHJ1bGUgZm9yIHNhcC5mZS5jb3JlXCJcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBvQ29udmVydGVyUGFnZU1vZGVsO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBhbnksIGVycm9yIGFzIGFueSk7XG5cdFx0XHRcdFx0cmV0dXJuIHt9O1xuXHRcdFx0XHR9XG5cdFx0XHR9LCBvTWV0YU1vZGVsKTtcblxuXHRcdFx0aWYgKCFiRXJyb3IpIHtcblx0XHRcdFx0b1ZpZXdTZXR0aW5ncyA9IGdldFZpZXdTZXR0aW5ncygpO1xuXHRcdFx0XHQvLyBTZXR0aW5nIHRoZSBwYWdlTW9kZWwgb24gdGhlIGNvbXBvbmVudCBmb3IgcG90ZW50aWFsIHJldXNlXG5cdFx0XHRcdG9Db21wb25lbnQuc2V0TW9kZWwob1BhZ2VNb2RlbCwgXCJfcGFnZU1vZGVsXCIpO1xuXHRcdFx0XHRyZXR1cm4gb0NvbXBvbmVudC5ydW5Bc093bmVyKCgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gVmlldy5jcmVhdGUob1ZpZXdTZXR0aW5ncylcblx0XHRcdFx0XHRcdC5jYXRjaChjcmVhdGVFcnJvclBhZ2UpXG5cdFx0XHRcdFx0XHQudGhlbigob1ZpZXc6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHR0aGlzLm9WaWV3ID0gb1ZpZXc7XG5cdFx0XHRcdFx0XHRcdHRoaXMub1ZpZXcuc2V0TW9kZWwobmV3IE1hbmFnZWRPYmplY3RNb2RlbCh0aGlzLm9WaWV3KSwgXCIkdmlld1wiKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5vVmlldy5zZXRNb2RlbChvVmlld0RhdGFNb2RlbCwgXCJ2aWV3RGF0YVwiKTtcblx0XHRcdFx0XHRcdFx0b0NvbXBvbmVudC5zZXRBZ2dyZWdhdGlvbihcInJvb3RDb250cm9sXCIsIHRoaXMub1ZpZXcpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gc0NhY2hlS2V5O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC5jYXRjaCgoZSkgPT4gTG9nLmVycm9yKGUubWVzc2FnZSwgZSkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoZXJyb3IubWVzc2FnZSwgZXJyb3IpO1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBFcnJvciB3aGlsZSBjcmVhdGluZyB2aWV3IDogJHtlcnJvcn1gKTtcblx0XHR9XG5cdH1cblx0Z2V0VmlldygpIHtcblx0XHRyZXR1cm4gdGhpcy5vVmlldztcblx0fVxuXHRnZXRJbnRlcmZhY2UoKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRleGl0KCkge1xuXHRcdC8vIERlcmVnaXN0ZXIgZ2xvYmFsIGluc3RhbmNlXG5cdFx0aWYgKHRoaXMub1Jlc291cmNlTW9kZWxTZXJ2aWNlKSB7XG5cdFx0XHR0aGlzLm9SZXNvdXJjZU1vZGVsU2VydmljZS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLm9DYWNoZUhhbmRsZXJTZXJ2aWNlKSB7XG5cdFx0XHR0aGlzLm9DYWNoZUhhbmRsZXJTZXJ2aWNlLmRlc3Ryb3koKTtcblx0XHR9XG5cdFx0dGhpcy5vRmFjdG9yeS5yZW1vdmVHbG9iYWxJbnN0YW5jZSgpO1xuXHR9XG59XG5jbGFzcyBUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkgZXh0ZW5kcyBTZXJ2aWNlRmFjdG9yeTxUZW1wbGF0ZWRWaWV3U2VydmljZVNldHRpbmdzPiB7XG5cdF9vSW5zdGFuY2VSZWdpc3RyeTogUmVjb3JkPHN0cmluZywgVGVtcGxhdGVkVmlld1NlcnZpY2U+ID0ge307XG5cdHN0YXRpYyBpQ3JlYXRpbmdWaWV3czogMDtcblx0Y3JlYXRlSW5zdGFuY2Uob1NlcnZpY2VDb250ZXh0OiBTZXJ2aWNlQ29udGV4dDxUZW1wbGF0ZWRWaWV3U2VydmljZVNldHRpbmdzPikge1xuXHRcdFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeS5pQ3JlYXRpbmdWaWV3cysrO1xuXG5cdFx0Y29uc3Qgb1RlbXBsYXRlZFZpZXdTZXJ2aWNlID0gbmV3IFRlbXBsYXRlZFZpZXdTZXJ2aWNlKE9iamVjdC5hc3NpZ24oeyBmYWN0b3J5OiB0aGlzIH0sIG9TZXJ2aWNlQ29udGV4dCkpO1xuXHRcdHJldHVybiBvVGVtcGxhdGVkVmlld1NlcnZpY2UuaW5pdFByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkuaUNyZWF0aW5nVmlld3MtLTtcblx0XHRcdHJldHVybiBvVGVtcGxhdGVkVmlld1NlcnZpY2U7XG5cdFx0fSk7XG5cdH1cblx0cmVtb3ZlR2xvYmFsSW5zdGFuY2UoKSB7XG5cdFx0dGhpcy5fb0luc3RhbmNlUmVnaXN0cnkgPSB7fTtcblx0fVxuXHRzdGF0aWMgZ2V0TnVtYmVyT2ZWaWV3c0luQ3JlYXRpb25TdGF0ZSgpIHtcblx0XHRyZXR1cm4gVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5LmlDcmVhdGluZ1ZpZXdzO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7TUF5Q01BLG9CQUFvQjtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQVd6QkMsSUFBSSxHQUFKLGdCQUFPO01BQ04sTUFBTUMsb0JBQW9CLEdBQUcsRUFBRTtNQUMvQixNQUFNQyxRQUFRLEdBQUcsSUFBSSxDQUFDQyxVQUFVLEVBQUU7TUFDbEMsTUFBTUMsVUFBVSxHQUFHRixRQUFRLENBQUNHLFdBQVc7TUFDdkMsTUFBTUMsYUFBYSxHQUFHQyxTQUFTLENBQUNDLG9CQUFvQixDQUFDSixVQUFVLENBQWlCO01BQ2hGLE1BQU1LLFVBQVUsR0FBR0gsYUFBYSxDQUFDSSxZQUFZLEVBQUU7TUFDL0MsTUFBTUMsU0FBUyxHQUFJLEdBQUVMLGFBQWEsQ0FBQ00sV0FBVyxFQUFFLENBQUNDLGdCQUFnQixFQUFHLEtBQUlQLGFBQWEsQ0FBQ1EsVUFBVSxDQUFDVixVQUFVLENBQUNXLEtBQUssRUFBRSxDQUFFLEVBQUM7TUFDdEgsTUFBTUMsWUFBWSxHQUFHWixVQUFVLENBQUNhLGNBQWMsRUFBRSxJQUFJLEVBQUU7TUFDdEQsSUFBSUMsYUFBYTtNQUNqQixJQUFJLENBQUNDLFFBQVEsR0FBR2pCLFFBQVEsQ0FBQ2tCLE9BQU87TUFDaEMsSUFBSUosWUFBWSxFQUFFO1FBQ2pCRSxhQUFhLEdBQUdaLGFB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