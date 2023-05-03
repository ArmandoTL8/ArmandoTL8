/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (Log, Service, ServiceFactory) {
  "use strict";

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Mock implementation of the ShellService for OpenFE
   *
   * @implements {IShellServices}
   * @private
   */
  let ShellServiceMock = /*#__PURE__*/function (_Service) {
    _inheritsLoose(ShellServiceMock, _Service);
    function ShellServiceMock() {
      return _Service.apply(this, arguments) || this;
    }
    var _proto = ShellServiceMock.prototype;
    _proto.init = function init() {
      this.initPromise = Promise.resolve(this);
      this.instanceType = "mock";
    };
    _proto.getLinks = function getLinks( /*oArgs: object*/
    ) {
      return Promise.resolve([]);
    };
    _proto.getLinksWithCache = function getLinksWithCache( /*oArgs: object*/
    ) {
      return Promise.resolve([]);
    };
    _proto.toExternal = function toExternal( /*oNavArgumentsArr: Array<object>, oComponent: object*/
    ) {
      /* Do Nothing */
    };
    _proto.getStartupAppState = function getStartupAppState( /*oArgs: object*/
    ) {
      return Promise.resolve(undefined);
    };
    _proto.backToPreviousApp = function backToPreviousApp() {
      /* Do Nothing */
    };
    _proto.hrefForExternal = function hrefForExternal( /*oArgs?: object, oComponent?: object, bAsync?: boolean*/
    ) {
      return "";
    };
    _proto.hrefForExternalAsync = function hrefForExternalAsync( /*oArgs?: object, oComponent?: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.getAppState = function getAppState( /*oComponent: object, sAppStateKey: string*/
    ) {
      return Promise.resolve({});
    };
    _proto.createEmptyAppState = function createEmptyAppState( /*oComponent: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.createEmptyAppStateAsync = function createEmptyAppStateAsync( /*oComponent: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.isNavigationSupported = function isNavigationSupported( /*oNavArgumentsArr: Array<object>, oComponent: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.isInitialNavigation = function isInitialNavigation() {
      return false;
    };
    _proto.isInitialNavigationAsync = function isInitialNavigationAsync() {
      return Promise.resolve({});
    };
    _proto.expandCompactHash = function expandCompactHash( /*sHashFragment: string*/
    ) {
      return Promise.resolve({});
    };
    _proto.parseShellHash = function parseShellHash( /*sHash: string*/
    ) {
      return {};
    };
    _proto.splitHash = function splitHash( /*sHash: string*/
    ) {
      return Promise.resolve({});
    };
    _proto.constructShellHash = function constructShellHash( /*oNewShellHash: object*/
    ) {
      return "";
    };
    _proto.setDirtyFlag = function setDirtyFlag( /*bDirty: boolean*/
    ) {
      /* Do Nothing */
    };
    _proto.registerDirtyStateProvider = function registerDirtyStateProvider( /*fnDirtyStateProvider: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.deregisterDirtyStateProvider = function deregisterDirtyStateProvider( /*fnDirtyStateProvider: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.createRenderer = function createRenderer() {
      return {};
    };
    _proto.getUser = function getUser() {
      return {};
    };
    _proto.hasUShell = function hasUShell() {
      return false;
    };
    _proto.registerNavigationFilter = function registerNavigationFilter( /*fnNavFilter: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.unregisterNavigationFilter = function unregisterNavigationFilter( /*fnNavFilter: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.setBackNavigation = function setBackNavigation( /*fnCallBack?: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.setHierarchy = function setHierarchy( /*aHierarchyLevels: Array<object>*/
    ) {
      /* Do Nothing */
    };
    _proto.setTitle = function setTitle( /*sTitle: string*/
    ) {
      /* Do Nothing */
    };
    _proto.getContentDensity = function getContentDensity() {
      // in case there is no shell we probably need to look at the classes being defined on the body
      if (document.body.classList.contains("sapUiSizeCozy")) {
        return "cozy";
      } else if (document.body.classList.contains("sapUiSizeCompact")) {
        return "compact";
      } else {
        return "";
      }
    };
    _proto.getPrimaryIntent = function getPrimaryIntent( /*sSemanticObject: string, mParameters?: object*/
    ) {
      return Promise.resolve();
    };
    _proto.waitForPluginsLoad = function waitForPluginsLoad() {
      return Promise.resolve(true);
    };
    return ShellServiceMock;
  }(Service);
  /**
   * @typedef ShellServicesSettings
   * @private
   */
  /**
   * Wrap a JQuery Promise within a native {Promise}.
   *
   * @template {object} T
   * @param jqueryPromise The original jquery promise
   * @returns A native promise wrapping the same object
   * @private
   */
  function wrapJQueryPromise(jqueryPromise) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line promise/catch-or-return
      jqueryPromise.done(resolve).fail(reject);
    });
  }

  /**
   * Base implementation of the ShellServices
   *
   * @implements {IShellServices}
   * @private
   */
  let ShellServices = /*#__PURE__*/function (_Service2) {
    _inheritsLoose(ShellServices, _Service2);
    function ShellServices() {
      return _Service2.apply(this, arguments) || this;
    }
    var _proto2 = ShellServices.prototype;
    // !: means that we know it will be assigned before usage
    _proto2.init = function init() {
      const oContext = this.getContext();
      const oComponent = oContext.scopeObject;
      this.oShellContainer = oContext.settings.shellContainer;
      this.instanceType = "real";
      this.linksCache = {};
      this.fnFindSemanticObjectsInCache = function (oArgs) {
        const _oArgs = oArgs;
        const aCachedSemanticObjects = [];
        const aNonCachedSemanticObjects = [];
        for (let i = 0; i < _oArgs.length; i++) {
          if (!!_oArgs[i][0] && !!_oArgs[i][0].semanticObject) {
            if (this.linksCache[_oArgs[i][0].semanticObject]) {
              aCachedSemanticObjects.push(this.linksCache[_oArgs[i][0].semanticObject].links);
              Object.defineProperty(oArgs[i][0], "links", {
                value: this.linksCache[_oArgs[i][0].semanticObject].links
              });
            } else {
              aNonCachedSemanticObjects.push(_oArgs[i]);
            }
          }
        }
        return {
          oldArgs: oArgs,
          newArgs: aNonCachedSemanticObjects,
          cachedLinks: aCachedSemanticObjects
        };
      };
      this.initPromise = new Promise((resolve, reject) => {
        this.resolveFn = resolve;
        this.rejectFn = reject;
      });
      const oCrossAppNavServicePromise = this.oShellContainer.getServiceAsync("CrossApplicationNavigation");
      const oUrlParsingServicePromise = this.oShellContainer.getServiceAsync("URLParsing");
      const oShellNavigationServicePromise = this.oShellContainer.getServiceAsync("ShellNavigation");
      const oShellPluginManagerPromise = this.oShellContainer.getServiceAsync("PluginManager");
      const oShellUIServicePromise = oComponent.getService("ShellUIService");
      Promise.all([oCrossAppNavServicePromise, oUrlParsingServicePromise, oShellNavigationServicePromise, oShellUIServicePromise, oShellPluginManagerPromise]).then(_ref => {
        let [oCrossAppNavService, oUrlParsingService, oShellNavigation, oShellUIService, oShellPluginManager] = _ref;
        this.crossAppNavService = oCrossAppNavService;
        this.urlParsingService = oUrlParsingService;
        this.shellNavigation = oShellNavigation;
        this.shellUIService = oShellUIService;
        this.shellPluginManager = oShellPluginManager;
        this.resolveFn();
      }).catch(this.rejectFn);
    }

    /**
     * Retrieves the target links configured for a given semantic object & action
     * Will retrieve the CrossApplicationNavigation
     * service reference call the getLinks method. In case service is not available or any exception
     * method throws exception error in console.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getLinks arguments
     * @returns Promise which will be resolved to target links array
     */;
    _proto2.getLinks = function getLinks(oArgs) {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line promise/catch-or-return
        this.crossAppNavService.getLinks(oArgs).fail(oError => {
          reject(new Error(`${oError} sap.fe.core.services.ShellServicesFactory.getLinks`));
        }).then(resolve);
      });
    }

    /**
     * Retrieves the target links configured for a given semantic object & action in cache
     * Will retrieve the CrossApplicationNavigation
     * service reference call the getLinks method. In case service is not available or any exception
     * method throws exception error in console.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getLinks arguments
     * @returns Promise which will be resolved to target links array
     */;
    _proto2.getLinksWithCache = function getLinksWithCache(oArgs) {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line promise/catch-or-return
        if (oArgs.length === 0) {
          resolve([]);
        } else {
          const oCacheResults = this.fnFindSemanticObjectsInCache(oArgs);
          if (oCacheResults.newArgs.length === 0) {
            resolve(oCacheResults.cachedLinks);
          } else {
            // eslint-disable-next-line promise/catch-or-return
            this.crossAppNavService.getLinks(oCacheResults.newArgs).fail(oError => {
              reject(new Error(`${oError} sap.fe.core.services.ShellServicesFactory.getLinksWithCache`));
            }).then(aLinks => {
              if (aLinks.length !== 0) {
                const oSemanticObjectsLinks = {};
                for (let i = 0; i < aLinks.length; i++) {
                  if (aLinks[i].length > 0 && oCacheResults.newArgs[i][0].links === undefined) {
                    oSemanticObjectsLinks[oCacheResults.newArgs[i][0].semanticObject] = {
                      links: aLinks[i]
                    };
                    this.linksCache = Object.assign(this.linksCache, oSemanticObjectsLinks);
                  }
                }
              }
              if (oCacheResults.cachedLinks.length === 0) {
                resolve(aLinks);
              } else {
                const aMergedLinks = [];
                let j = 0;
                for (let k = 0; k < oCacheResults.oldArgs.length; k++) {
                  if (j < aLinks.length) {
                    if (aLinks[j].length > 0 && oCacheResults.oldArgs[k][0].semanticObject === oCacheResults.newArgs[j][0].semanticObject) {
                      aMergedLinks.push(aLinks[j]);
                      j++;
                    } else {
                      aMergedLinks.push(oCacheResults.oldArgs[k][0].links);
                    }
                  } else {
                    aMergedLinks.push(oCacheResults.oldArgs[k][0].links);
                  }
                }
                resolve(aMergedLinks);
              }
            });
          }
        }
      });
    }

    /**
     * Will retrieve the ShellContainer.
     *
     * @private
     * @ui5-restricted
     * sap.ushell.container
     * @returns Object with predefined shellContainer methods
     */;
    _proto2.getShellContainer = function getShellContainer() {
      return this.oShellContainer;
    }

    /**
     * Will call toExternal method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oNavArgumentsArr And
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>toExternal arguments
     */;
    _proto2.toExternal = function toExternal(oNavArgumentsArr, oComponent) {
      this.crossAppNavService.toExternal(oNavArgumentsArr, oComponent);
    }

    /**
     * Retrieves the target startupAppState
     * Will check the existance of the ShellContainer and retrieve the CrossApplicationNavigation
     * service reference call the getStartupAppState method. In case service is not available or any exception
     * method throws exception error in console.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getStartupAppState arguments
     * @returns Promise which will be resolved to Object
     */;
    _proto2.getStartupAppState = function getStartupAppState(oArgs) {
      return new Promise((resolve, reject) => {
        // JQuery Promise behaves differently
        // eslint-disable-next-line promise/catch-or-return
        this.crossAppNavService.getStartupAppState(oArgs).fail(oError => {
          reject(new Error(`${oError} sap.fe.core.services.ShellServicesFactory.getStartupAppState`));
        }).then(startupAppState => resolve(startupAppState));
      });
    }

    /**
     * Will call backToPreviousApp method of CrossApplicationNavigation service.
     *
     * @returns Something that indicate we've navigated
     * @private
     * @ui5-restricted
     */;
    _proto2.backToPreviousApp = function backToPreviousApp() {
      return this.crossAppNavService.backToPreviousApp();
    }

    /**
     * Will call hrefForExternal method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * @param oComponent The appComponent
     * @param bAsync Whether this call should be async or not
     * sap.ushell.services.CrossApplicationNavigation=>hrefForExternal arguments
     * @returns Promise which will be resolved to string
     */;
    _proto2.hrefForExternal = function hrefForExternal(oArgs, oComponent, bAsync) {
      return this.crossAppNavService.hrefForExternal(oArgs, oComponent, !!bAsync);
    }

    /**
     * Will call hrefForExternal method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * @param oComponent The appComponent
     * sap.ushell.services.CrossApplicationNavigation=>hrefForExternalAsync arguments
     * @returns Promise which will be resolved to string
     */;
    _proto2.hrefForExternalAsync = function hrefForExternalAsync(oArgs, oComponent) {
      return this.crossAppNavService.hrefForExternalAsync(oArgs, oComponent);
    }

    /**
     * Will call getAppState method of CrossApplicationNavigation service with oComponent and oAppStateKey.
     *
     * @private
     * @ui5-restricted
     * @param oComponent
     * @param sAppStateKey Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getAppState arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.getAppState = function getAppState(oComponent, sAppStateKey) {
      return wrapJQueryPromise(this.crossAppNavService.getAppState(oComponent, sAppStateKey));
    }

    /**
     * Will call createEmptyAppState method of CrossApplicationNavigation service with oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>createEmptyAppState arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.createEmptyAppState = function createEmptyAppState(oComponent) {
      return this.crossAppNavService.createEmptyAppState(oComponent);
    }

    /**
     * Will call createEmptyAppStateAsync method of CrossApplicationNavigation service with oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>createEmptyAppStateAsync arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.createEmptyAppStateAsync = function createEmptyAppStateAsync(oComponent) {
      return this.crossAppNavService.createEmptyAppStateAsync(oComponent);
    }

    /**
     * Will call isNavigationSupported method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oNavArgumentsArr
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>isNavigationSupported arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.isNavigationSupported = function isNavigationSupported(oNavArgumentsArr, oComponent) {
      return wrapJQueryPromise(this.crossAppNavService.isNavigationSupported(oNavArgumentsArr, oComponent));
    }

    /**
     * Will call isInitialNavigation method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @returns Promise which will be resolved to boolean
     */;
    _proto2.isInitialNavigation = function isInitialNavigation() {
      return this.crossAppNavService.isInitialNavigation();
    }

    /**
     * Will call isInitialNavigationAsync method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @returns Promise which will be resolved to boolean
     */;
    _proto2.isInitialNavigationAsync = function isInitialNavigationAsync() {
      return this.crossAppNavService.isInitialNavigationAsync();
    }

    /**
     * Will call expandCompactHash method of CrossApplicationNavigation service.
     *
     * @param sHashFragment An (internal format) shell hash
     * @returns A promise the success handler of the resolve promise get an expanded shell hash as first argument
     * @private
     * @ui5-restricted
     */;
    _proto2.expandCompactHash = function expandCompactHash(sHashFragment) {
      return this.crossAppNavService.expandCompactHash(sHashFragment);
    }

    /**
     * Will call parseShellHash method of URLParsing service with given sHash.
     *
     * @private
     * @ui5-restricted
     * @param sHash Check the definition of
     * sap.ushell.services.URLParsing=>parseShellHash arguments
     * @returns The parsed url
     */;
    _proto2.parseShellHash = function parseShellHash(sHash) {
      return this.urlParsingService.parseShellHash(sHash);
    }

    /**
     * Will call splitHash method of URLParsing service with given sHash.
     *
     * @private
     * @ui5-restricted
     * @param sHash Check the definition of
     * sap.ushell.services.URLParsing=>splitHash arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.splitHash = function splitHash(sHash) {
      return this.urlParsingService.splitHash(sHash);
    }

    /**
     * Will call constructShellHash method of URLParsing service with given sHash.
     *
     * @private
     * @ui5-restricted
     * @param oNewShellHash Check the definition of
     * sap.ushell.services.URLParsing=>constructShellHash arguments
     * @returns Shell Hash string
     */;
    _proto2.constructShellHash = function constructShellHash(oNewShellHash) {
      return this.urlParsingService.constructShellHash(oNewShellHash);
    }

    /**
     * Will call setDirtyFlag method with given dirty state.
     *
     * @private
     * @ui5-restricted
     * @param bDirty Check the definition of sap.ushell.Container.setDirtyFlag arguments
     */;
    _proto2.setDirtyFlag = function setDirtyFlag(bDirty) {
      this.oShellContainer.setDirtyFlag(bDirty);
    }

    /**
     * Will call registerDirtyStateProvider method with given dirty state provider callback method.
     *
     * @private
     * @ui5-restricted
     * @param fnDirtyStateProvider Check the definition of sap.ushell.Container.registerDirtyStateProvider arguments
     */;
    _proto2.registerDirtyStateProvider = function registerDirtyStateProvider(fnDirtyStateProvider) {
      this.oShellContainer.registerDirtyStateProvider(fnDirtyStateProvider);
    }

    /**
     * Will call deregisterDirtyStateProvider method with given dirty state provider callback method.
     *
     * @private
     * @ui5-restricted
     * @param fnDirtyStateProvider Check the definition of sap.ushell.Container.deregisterDirtyStateProvider arguments
     */;
    _proto2.deregisterDirtyStateProvider = function deregisterDirtyStateProvider(fnDirtyStateProvider) {
      this.oShellContainer.deregisterDirtyStateProvider(fnDirtyStateProvider);
    }

    /**
     * Will call createRenderer method of ushell container.
     *
     * @private
     * @ui5-restricted
     * @returns Returns renderer object
     */;
    _proto2.createRenderer = function createRenderer() {
      return this.oShellContainer.createRenderer();
    }

    /**
     * Will call getUser method of ushell container.
     *
     * @private
     * @ui5-restricted
     * @returns Returns User object
     */;
    _proto2.getUser = function getUser() {
      return this.oShellContainer.getUser();
    }

    /**
     * Will check if ushell container is available or not.
     *
     * @private
     * @ui5-restricted
     * @returns Returns true
     */;
    _proto2.hasUShell = function hasUShell() {
      return true;
    }

    /**
     * Will call registerNavigationFilter method of shellNavigation.
     *
     * @param fnNavFilter The filter function to register
     * @private
     * @ui5-restricted
     */;
    _proto2.registerNavigationFilter = function registerNavigationFilter(fnNavFilter) {
      this.shellNavigation.registerNavigationFilter(fnNavFilter);
    }

    /**
     * Will call unregisterNavigationFilter method of shellNavigation.
     *
     * @param fnNavFilter The filter function to unregister
     * @private
     * @ui5-restricted
     */;
    _proto2.unregisterNavigationFilter = function unregisterNavigationFilter(fnNavFilter) {
      this.shellNavigation.unregisterNavigationFilter(fnNavFilter);
    }

    /**
     * Will call setBackNavigation method of ShellUIService
     * that displays the back button in the shell header.
     *
     * @param [fnCallBack] A callback function called when the button is clicked in the UI.
     * @private
     * @ui5-restricted
     */;
    _proto2.setBackNavigation = function setBackNavigation(fnCallBack) {
      this.shellUIService.setBackNavigation(fnCallBack);
    }

    /**
     * Will call setHierarchy method of ShellUIService
     * that displays the given hierarchy in the shell header.
     *
     * @param [aHierarchyLevels] An array representing hierarchies of the currently displayed app.
     * @private
     * @ui5-restricted
     */;
    _proto2.setHierarchy = function setHierarchy(aHierarchyLevels) {
      this.shellUIService.setHierarchy(aHierarchyLevels);
    }

    /**
     * Will call setTitle method of ShellUIService
     * that displays the given title in the shell header.
     *
     * @param [sTitle] The new title. The default title is set if this argument is not given.
     * @private
     * @ui5-restricted
     */;
    _proto2.setTitle = function setTitle(sTitle) {
      this.shellUIService.setTitle(sTitle);
    }

    /**
     * Retrieves the currently defined content density.
     *
     * @returns The content density value
     */;
    _proto2.getContentDensity = function getContentDensity() {
      return this.oShellContainer.getUser().getContentDensity();
    }

    /**
     * For a given semantic object, this method considers all actions associated with the semantic object and
     * returns the one tagged as a "primaryAction". If no inbound tagged as "primaryAction" exists, then it returns
     * the intent of the first inbound (after sorting has been applied) matching the action "displayFactSheet".
     *
     * @private
     * @ui5-restricted
     * @param sSemanticObject Semantic object.
     * @param mParameters See #CrossApplicationNavigation#getLinks for description.
     * @returns Promise which will be resolved with an object containing the intent if it exists.
     */;
    _proto2.getPrimaryIntent = function getPrimaryIntent(sSemanticObject, mParameters) {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line promise/catch-or-return
        this.crossAppNavService.getPrimaryIntent(sSemanticObject, mParameters).fail(oError => {
          reject(new Error(`${oError} sap.fe.core.services.ShellServicesFactory.getPrimaryIntent`));
        }).then(resolve);
      });
    }

    /**
     * Wait for the render extensions plugin to be loaded.
     * If true is returned by the promise we were able to wait for it, otherwise we couldn't and cannot rely on it.
     */;
    _proto2.waitForPluginsLoad = function waitForPluginsLoad() {
      return new Promise(resolve => {
        var _this$shellPluginMana;
        if (!((_this$shellPluginMana = this.shellPluginManager) !== null && _this$shellPluginMana !== void 0 && _this$shellPluginMana.getPluginLoadingPromise)) {
          resolve(false);
        } else {
          // eslint-disable-next-line promise/catch-or-return
          this.shellPluginManager.getPluginLoadingPromise("RendererExtensions").fail(oError => {
            Log.error(oError, "sap.fe.core.services.ShellServicesFactory.waitForPluginsLoad");
            resolve(false);
          }).then(() => resolve(true));
        }
      });
    };
    return ShellServices;
  }(Service);
  /**
   * Service Factory for the ShellServices
   *
   * @private
   */
  let ShellServicesFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(ShellServicesFactory, _ServiceFactory);
    function ShellServicesFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto3 = ShellServicesFactory.prototype;
    /**
     * Creates either a standard or a mock Shell service depending on the configuration.
     *
     * @param oServiceContext The shellservice context
     * @returns A promise for a shell service implementation
     * @see ServiceFactory#createInstance
     */
    _proto3.createInstance = function createInstance(oServiceContext) {
      oServiceContext.settings.shellContainer = sap.ushell && sap.ushell.Container;
      const oShellService = oServiceContext.settings.shellContainer ? new ShellServices(oServiceContext) : new ShellServiceMock(oServiceContext);
      return oShellService.initPromise.then(() => {
        // Enrich the appComponent with this method
        oServiceContext.scopeObject.getShellServices = () => oShellService;
        return oShellService;
      });
    };
    return ShellServicesFactory;
  }(ServiceFactory);
  return ShellServicesFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGVsbFNlcnZpY2VNb2NrIiwiaW5pdCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbnN0YW5jZVR5cGUiLCJnZXRMaW5rcyIsImdldExpbmtzV2l0aENhY2hlIiwidG9FeHRlcm5hbCIsImdldFN0YXJ0dXBBcHBTdGF0ZSIsInVuZGVmaW5lZCIsImJhY2tUb1ByZXZpb3VzQXBwIiwiaHJlZkZvckV4dGVybmFsIiwiaHJlZkZvckV4dGVybmFsQXN5bmMiLCJnZXRBcHBTdGF0ZSIsImNyZWF0ZUVtcHR5QXBwU3RhdGUiLCJjcmVhdGVFbXB0eUFwcFN0YXRlQXN5bmMiLCJpc05hdmlnYXRpb25TdXBwb3J0ZWQiLCJpc0luaXRpYWxOYXZpZ2F0aW9uIiwiaXNJbml0aWFsTmF2aWdhdGlvbkFzeW5jIiwiZXhwYW5kQ29tcGFjdEhhc2giLCJwYXJzZVNoZWxsSGFzaCIsInNwbGl0SGFzaCIsImNvbnN0cnVjdFNoZWxsSGFzaCIsInNldERpcnR5RmxhZyIsInJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIiwiZGVyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciIsImNyZWF0ZVJlbmRlcmVyIiwiZ2V0VXNlciIsImhhc1VTaGVsbCIsInJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlciIsInVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyIiwic2V0QmFja05hdmlnYXRpb24iLCJzZXRIaWVyYXJjaHkiLCJzZXRUaXRsZSIsImdldENvbnRlbnREZW5zaXR5IiwiZG9jdW1lbnQiLCJib2R5IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJnZXRQcmltYXJ5SW50ZW50Iiwid2FpdEZvclBsdWdpbnNMb2FkIiwiU2VydmljZSIsIndyYXBKUXVlcnlQcm9taXNlIiwianF1ZXJ5UHJvbWlzZSIsInJlamVjdCIsImRvbmUiLCJmYWlsIiwiU2hlbGxTZXJ2aWNlcyIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsIm9Db21wb25lbnQiLCJzY29wZU9iamVjdCIsIm9TaGVsbENvbnRhaW5lciIsInNldHRpbmdzIiwic2hlbGxDb250YWluZXIiLCJsaW5rc0NhY2hlIiwiZm5GaW5kU2VtYW50aWNPYmplY3RzSW5DYWNoZSIsIm9BcmdzIiwiX29BcmdzIiwiYUNhY2hlZFNlbWFudGljT2JqZWN0cyIsImFOb25DYWNoZWRTZW1hbnRpY09iamVjdHMiLCJpIiwibGVuZ3RoIiwic2VtYW50aWNPYmplY3QiLCJwdXNoIiwibGlua3MiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwib2xkQXJncyIsIm5ld0FyZ3MiLCJjYWNoZWRMaW5rcyIsInJlc29sdmVGbiIsInJlamVjdEZuIiwib0Nyb3NzQXBwTmF2U2VydmljZVByb21pc2UiLCJnZXRTZXJ2aWNlQXN5bmMiLCJvVXJsUGFyc2luZ1NlcnZpY2VQcm9taXNlIiwib1NoZWxsTmF2aWdhdGlvblNlcnZpY2VQcm9taXNlIiwib1NoZWxsUGx1Z2luTWFuYWdlclByb21pc2UiLCJvU2hlbGxVSVNlcnZpY2VQcm9taXNlIiwiZ2V0U2VydmljZSIsImFsbCIsInRoZW4iLCJvQ3Jvc3NBcHBOYXZTZXJ2aWNlIiwib1VybFBhcnNpbmdTZXJ2aWNlIiwib1NoZWxsTmF2aWdhdGlvbiIsIm9TaGVsbFVJU2VydmljZSIsIm9TaGVsbFBsdWdpbk1hbmFnZXIiLCJjcm9zc0FwcE5hdlNlcnZpY2UiLCJ1cmxQYXJzaW5nU2VydmljZSIsInNoZWxsTmF2aWdhdGlvbiIsInNoZWxsVUlTZXJ2aWNlIiwic2hlbGxQbHVnaW5NYW5hZ2VyIiwiY2F0Y2giLCJvRXJyb3IiLCJFcnJvciIsIm9DYWNoZVJlc3VsdHMiLCJhTGlua3MiLCJvU2VtYW50aWNPYmplY3RzTGlua3MiLCJhc3NpZ24iLCJhTWVyZ2VkTGlua3MiLCJqIiwiayIsImdldFNoZWxsQ29udGFpbmVyIiwib05hdkFyZ3VtZW50c0FyciIsInN0YXJ0dXBBcHBTdGF0ZSIsImJBc3luYyIsInNBcHBTdGF0ZUtleSIsInNIYXNoRnJhZ21lbnQiLCJzSGFzaCIsIm9OZXdTaGVsbEhhc2giLCJiRGlydHkiLCJmbkRpcnR5U3RhdGVQcm92aWRlciIsImZuTmF2RmlsdGVyIiwiZm5DYWxsQmFjayIsImFIaWVyYXJjaHlMZXZlbHMiLCJzVGl0bGUiLCJzU2VtYW50aWNPYmplY3QiLCJtUGFyYW1ldGVycyIsImdldFBsdWdpbkxvYWRpbmdQcm9taXNlIiwiTG9nIiwiZXJyb3IiLCJTaGVsbFNlcnZpY2VzRmFjdG9yeSIsImNyZWF0ZUluc3RhbmNlIiwib1NlcnZpY2VDb250ZXh0Iiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwib1NoZWxsU2VydmljZSIsImdldFNoZWxsU2VydmljZXMiLCJTZXJ2aWNlRmFjdG9yeSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2hlbGxTZXJ2aWNlc0ZhY3RvcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBDb250YWluZXIgZnJvbSBcInNhcC91c2hlbGwvc2VydmljZXMvQ29udGFpbmVyXCI7XG5pbXBvcnQgdHlwZSBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBmcm9tIFwic2FwL3VzaGVsbC9zZXJ2aWNlcy9Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiO1xuaW1wb3J0IHR5cGUgU2hlbGxOYXZpZ2F0aW9uIGZyb20gXCJzYXAvdXNoZWxsL3NlcnZpY2VzL1NoZWxsTmF2aWdhdGlvblwiO1xuaW1wb3J0IHR5cGUgVVJMUGFyc2luZyBmcm9tIFwic2FwL3VzaGVsbC9zZXJ2aWNlcy9VUkxQYXJzaW5nXCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZpY2VDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG5leHBvcnQgdHlwZSBTdGFydHVwQXBwU3RhdGUgPSB7XG5cdGdldERhdGEoKToge1xuXHRcdHNlbGVjdGlvblZhcmlhbnQ/OiB7XG5cdFx0XHRTZWxlY3RPcHRpb25zPzoge1xuXHRcdFx0XHRQcm9wZXJ0eU5hbWU6IHN0cmluZztcblx0XHRcdFx0UmFuZ2VzOiB7XG5cdFx0XHRcdFx0T3B0aW9uOiBzdHJpbmc7XG5cdFx0XHRcdFx0U2lnbjogc3RyaW5nO1xuXHRcdFx0XHRcdExvdzogc3RyaW5nO1xuXHRcdFx0XHR9W107XG5cdFx0XHR9W107XG5cdFx0fTtcblx0fTtcbn07XG4vKipcbiAqIEBpbnRlcmZhY2UgSVNoZWxsU2VydmljZXNcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSVNoZWxsU2VydmljZXMge1xuXHRpbml0UHJvbWlzZTogUHJvbWlzZTxJU2hlbGxTZXJ2aWNlcz47XG5cdGluc3RhbmNlVHlwZTogc3RyaW5nO1xuXHRjcm9zc0FwcE5hdlNlcnZpY2U/OiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbjtcblx0Z2V0TGlua3Mob0FyZ3M6IG9iamVjdCk6IFByb21pc2U8YW55PjtcblxuXHRnZXRMaW5rc1dpdGhDYWNoZShvQXJnczogb2JqZWN0KTogUHJvbWlzZTxhbnlbXT47XG5cblx0dG9FeHRlcm5hbChvTmF2QXJndW1lbnRzQXJyOiBBcnJheTxvYmplY3Q+LCBvQ29tcG9uZW50OiBvYmplY3QpOiB2b2lkO1xuXG5cdGdldFN0YXJ0dXBBcHBTdGF0ZShvQXJnczogb2JqZWN0KTogUHJvbWlzZTx1bmRlZmluZWQgfCBTdGFydHVwQXBwU3RhdGU+O1xuXG5cdGJhY2tUb1ByZXZpb3VzQXBwKCk6IHZvaWQ7XG5cblx0aHJlZkZvckV4dGVybmFsKG9BcmdzPzogb2JqZWN0LCBvQ29tcG9uZW50Pzogb2JqZWN0LCBiQXN5bmM/OiBib29sZWFuKTogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+O1xuXG5cdGhyZWZGb3JFeHRlcm5hbEFzeW5jKG9BcmdzPzogb2JqZWN0LCBvQ29tcG9uZW50Pzogb2JqZWN0KTogUHJvbWlzZTxhbnk+O1xuXG5cdGdldEFwcFN0YXRlKG9Db21wb25lbnQ6IENvbXBvbmVudCwgc0FwcFN0YXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPGFueT47XG5cblx0Y3JlYXRlRW1wdHlBcHBTdGF0ZShvQ29tcG9uZW50OiBDb21wb25lbnQpOiBvYmplY3Q7XG5cblx0Y3JlYXRlRW1wdHlBcHBTdGF0ZShvQ29tcG9uZW50OiBDb21wb25lbnQpOiBQcm9taXNlPGFueT47XG5cblx0aXNOYXZpZ2F0aW9uU3VwcG9ydGVkKG9OYXZBcmd1bWVudHNBcnI6IEFycmF5PG9iamVjdD4sIG9Db21wb25lbnQ/OiBvYmplY3QpOiBQcm9taXNlPGFueT47XG5cblx0aXNJbml0aWFsTmF2aWdhdGlvbigpOiBib29sZWFuO1xuXG5cdGlzSW5pdGlhbE5hdmlnYXRpb25Bc3luYygpOiBQcm9taXNlPGFueT47XG5cblx0ZXhwYW5kQ29tcGFjdEhhc2goc0hhc2hGcmFnbWVudDogc3RyaW5nKTogYW55O1xuXG5cdHBhcnNlU2hlbGxIYXNoKHNIYXNoOiBzdHJpbmcpOiBhbnk7XG5cblx0c3BsaXRIYXNoKHNIYXNoOiBzdHJpbmcpOiBvYmplY3Q7XG5cblx0Y29uc3RydWN0U2hlbGxIYXNoKG9OZXdTaGVsbEhhc2g6IG9iamVjdCk6IHN0cmluZztcblxuXHRzZXREaXJ0eUZsYWcoYkRpcnR5OiBib29sZWFuKTogdm9pZDtcblxuXHRyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlcihmbkRpcnR5U3RhdGVQcm92aWRlcjogRnVuY3Rpb24pOiB2b2lkO1xuXG5cdGRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoZm5EaXJ0eVN0YXRlUHJvdmlkZXI6IEZ1bmN0aW9uKTogdm9pZDtcblxuXHRjcmVhdGVSZW5kZXJlcigpOiBvYmplY3Q7XG5cblx0Z2V0VXNlcigpOiBhbnk7XG5cblx0aGFzVVNoZWxsKCk6IGJvb2xlYW47XG5cblx0cmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyOiBGdW5jdGlvbik6IHZvaWQ7XG5cblx0dW5yZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoZm5OYXZGaWx0ZXI6IEZ1bmN0aW9uKTogdm9pZDtcblxuXHRzZXRCYWNrTmF2aWdhdGlvbihmbkNhbGxCYWNrPzogRnVuY3Rpb24pOiB2b2lkO1xuXG5cdHNldEhpZXJhcmNoeShhSGllcmFyY2h5TGV2ZWxzOiBBcnJheTxvYmplY3Q+KTogdm9pZDtcblxuXHRzZXRUaXRsZShzVGl0bGU6IHN0cmluZyk6IHZvaWQ7XG5cblx0Z2V0Q29udGVudERlbnNpdHkoKTogc3RyaW5nO1xuXG5cdGdldFByaW1hcnlJbnRlbnQoc1NlbWFudGljT2JqZWN0OiBzdHJpbmcsIG1QYXJhbWV0ZXJzPzogb2JqZWN0KTogUHJvbWlzZTxhbnk+O1xuXG5cdHdhaXRGb3JQbHVnaW5zTG9hZCgpOiBQcm9taXNlPGJvb2xlYW4+O1xufVxuXG4vKipcbiAqIE1vY2sgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNoZWxsU2VydmljZSBmb3IgT3BlbkZFXG4gKlxuICogQGltcGxlbWVudHMge0lTaGVsbFNlcnZpY2VzfVxuICogQHByaXZhdGVcbiAqL1xuY2xhc3MgU2hlbGxTZXJ2aWNlTW9jayBleHRlbmRzIFNlcnZpY2U8U2hlbGxTZXJ2aWNlc1NldHRpbmdzPiBpbXBsZW1lbnRzIElTaGVsbFNlcnZpY2VzIHtcblx0aW5pdFByb21pc2UhOiBQcm9taXNlPGFueT47XG5cdGluc3RhbmNlVHlwZSE6IHN0cmluZztcblxuXHRpbml0KCkge1xuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodGhpcyk7XG5cdFx0dGhpcy5pbnN0YW5jZVR5cGUgPSBcIm1vY2tcIjtcblx0fVxuXG5cdGdldExpbmtzKC8qb0FyZ3M6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG5cdH1cblxuXHRnZXRMaW5rc1dpdGhDYWNoZSgvKm9BcmdzOiBvYmplY3QqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9XG5cblx0dG9FeHRlcm5hbCgvKm9OYXZBcmd1bWVudHNBcnI6IEFycmF5PG9iamVjdD4sIG9Db21wb25lbnQ6IG9iamVjdCovKSB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0Z2V0U3RhcnR1cEFwcFN0YXRlKC8qb0FyZ3M6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuXHR9XG5cblx0YmFja1RvUHJldmlvdXNBcHAoKSB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0aHJlZkZvckV4dGVybmFsKC8qb0FyZ3M/OiBvYmplY3QsIG9Db21wb25lbnQ/OiBvYmplY3QsIGJBc3luYz86IGJvb2xlYW4qLykge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0aHJlZkZvckV4dGVybmFsQXN5bmMoLypvQXJncz86IG9iamVjdCwgb0NvbXBvbmVudD86IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRnZXRBcHBTdGF0ZSgvKm9Db21wb25lbnQ6IG9iamVjdCwgc0FwcFN0YXRlS2V5OiBzdHJpbmcqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0Y3JlYXRlRW1wdHlBcHBTdGF0ZSgvKm9Db21wb25lbnQ6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRjcmVhdGVFbXB0eUFwcFN0YXRlQXN5bmMoLypvQ29tcG9uZW50OiBvYmplY3QqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0aXNOYXZpZ2F0aW9uU3VwcG9ydGVkKC8qb05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0Ki8pIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcblx0fVxuXG5cdGlzSW5pdGlhbE5hdmlnYXRpb24oKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0aXNJbml0aWFsTmF2aWdhdGlvbkFzeW5jKCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0ZXhwYW5kQ29tcGFjdEhhc2goLypzSGFzaEZyYWdtZW50OiBzdHJpbmcqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0cGFyc2VTaGVsbEhhc2goLypzSGFzaDogc3RyaW5nKi8pIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHRzcGxpdEhhc2goLypzSGFzaDogc3RyaW5nKi8pIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcblx0fVxuXG5cdGNvbnN0cnVjdFNoZWxsSGFzaCgvKm9OZXdTaGVsbEhhc2g6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHRzZXREaXJ0eUZsYWcoLypiRGlydHk6IGJvb2xlYW4qLykge1xuXHRcdC8qIERvIE5vdGhpbmcgKi9cblx0fVxuXG5cdHJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKC8qZm5EaXJ0eVN0YXRlUHJvdmlkZXI6IEZ1bmN0aW9uKi8pIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKC8qZm5EaXJ0eVN0YXRlUHJvdmlkZXI6IEZ1bmN0aW9uKi8pIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRjcmVhdGVSZW5kZXJlcigpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHRnZXRVc2VyKCkge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdGhhc1VTaGVsbCgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRyZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoLypmbk5hdkZpbHRlcjogRnVuY3Rpb24qLyk6IHZvaWQge1xuXHRcdC8qIERvIE5vdGhpbmcgKi9cblx0fVxuXG5cdHVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKC8qZm5OYXZGaWx0ZXI6IEZ1bmN0aW9uKi8pOiB2b2lkIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRzZXRCYWNrTmF2aWdhdGlvbigvKmZuQ2FsbEJhY2s/OiBGdW5jdGlvbiovKTogdm9pZCB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0c2V0SGllcmFyY2h5KC8qYUhpZXJhcmNoeUxldmVsczogQXJyYXk8b2JqZWN0PiovKTogdm9pZCB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0c2V0VGl0bGUoLypzVGl0bGU6IHN0cmluZyovKTogdm9pZCB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0Z2V0Q29udGVudERlbnNpdHkoKTogc3RyaW5nIHtcblx0XHQvLyBpbiBjYXNlIHRoZXJlIGlzIG5vIHNoZWxsIHdlIHByb2JhYmx5IG5lZWQgdG8gbG9vayBhdCB0aGUgY2xhc3NlcyBiZWluZyBkZWZpbmVkIG9uIHRoZSBib2R5XG5cdFx0aWYgKGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKFwic2FwVWlTaXplQ296eVwiKSkge1xuXHRcdFx0cmV0dXJuIFwiY296eVwiO1xuXHRcdH0gZWxzZSBpZiAoZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoXCJzYXBVaVNpemVDb21wYWN0XCIpKSB7XG5cdFx0XHRyZXR1cm4gXCJjb21wYWN0XCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0fVxuXG5cdGdldFByaW1hcnlJbnRlbnQoLypzU2VtYW50aWNPYmplY3Q6IHN0cmluZywgbVBhcmFtZXRlcnM/OiBvYmplY3QqLyk6IFByb21pc2U8YW55PiB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0d2FpdEZvclBsdWdpbnNMb2FkKCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdH1cbn1cblxuLyoqXG4gKiBAdHlwZWRlZiBTaGVsbFNlcnZpY2VzU2V0dGluZ3NcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCB0eXBlIFNoZWxsU2VydmljZXNTZXR0aW5ncyA9IHtcblx0c2hlbGxDb250YWluZXI/OiBDb250YWluZXI7XG59O1xuXG4vKipcbiAqIFdyYXAgYSBKUXVlcnkgUHJvbWlzZSB3aXRoaW4gYSBuYXRpdmUge1Byb21pc2V9LlxuICpcbiAqIEB0ZW1wbGF0ZSB7b2JqZWN0fSBUXG4gKiBAcGFyYW0ganF1ZXJ5UHJvbWlzZSBUaGUgb3JpZ2luYWwganF1ZXJ5IHByb21pc2VcbiAqIEByZXR1cm5zIEEgbmF0aXZlIHByb21pc2Ugd3JhcHBpbmcgdGhlIHNhbWUgb2JqZWN0XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiB3cmFwSlF1ZXJ5UHJvbWlzZTxUPihqcXVlcnlQcm9taXNlOiBqUXVlcnkuUHJvbWlzZSk6IFByb21pc2U8VD4ge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcm9taXNlL2NhdGNoLW9yLXJldHVyblxuXHRcdGpxdWVyeVByb21pc2UuZG9uZShyZXNvbHZlIGFzIGFueSkuZmFpbChyZWplY3QpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBCYXNlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBTaGVsbFNlcnZpY2VzXG4gKlxuICogQGltcGxlbWVudHMge0lTaGVsbFNlcnZpY2VzfVxuICogQHByaXZhdGVcbiAqL1xuY2xhc3MgU2hlbGxTZXJ2aWNlcyBleHRlbmRzIFNlcnZpY2U8UmVxdWlyZWQ8U2hlbGxTZXJ2aWNlc1NldHRpbmdzPj4gaW1wbGVtZW50cyBJU2hlbGxTZXJ2aWNlcyB7XG5cdHJlc29sdmVGbjogYW55O1xuXHRyZWplY3RGbjogYW55O1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55Pjtcblx0Ly8gITogbWVhbnMgdGhhdCB3ZSBrbm93IGl0IHdpbGwgYmUgYXNzaWduZWQgYmVmb3JlIHVzYWdlXG5cdGNyb3NzQXBwTmF2U2VydmljZSE6IENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uO1xuXHR1cmxQYXJzaW5nU2VydmljZSE6IFVSTFBhcnNpbmc7XG5cdHNoZWxsTmF2aWdhdGlvbiE6IFNoZWxsTmF2aWdhdGlvbjtcblx0c2hlbGxQbHVnaW5NYW5hZ2VyIToge1xuXHRcdGdldFBsdWdpbkxvYWRpbmdQcm9taXNlKGNhdGVnb3J5OiBzdHJpbmcpOiBqUXVlcnkuUHJvbWlzZTtcblx0fTtcblx0b1NoZWxsQ29udGFpbmVyITogQ29udGFpbmVyO1xuXHRzaGVsbFVJU2VydmljZSE6IGFueTtcblx0aW5zdGFuY2VUeXBlITogc3RyaW5nO1xuXHRsaW5rc0NhY2hlITogYW55O1xuXHRmbkZpbmRTZW1hbnRpY09iamVjdHNJbkNhY2hlOiBhbnk7XG5cblx0aW5pdCgpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29udGV4dC5zY29wZU9iamVjdCBhcyBhbnk7XG5cdFx0dGhpcy5vU2hlbGxDb250YWluZXIgPSBvQ29udGV4dC5zZXR0aW5ncy5zaGVsbENvbnRhaW5lcjtcblx0XHR0aGlzLmluc3RhbmNlVHlwZSA9IFwicmVhbFwiO1xuXHRcdHRoaXMubGlua3NDYWNoZSA9IHt9O1xuXHRcdHRoaXMuZm5GaW5kU2VtYW50aWNPYmplY3RzSW5DYWNoZSA9IGZ1bmN0aW9uIChvQXJnczogYW55KTogb2JqZWN0IHtcblx0XHRcdGNvbnN0IF9vQXJnczogYW55ID0gb0FyZ3M7XG5cdFx0XHRjb25zdCBhQ2FjaGVkU2VtYW50aWNPYmplY3RzID0gW107XG5cdFx0XHRjb25zdCBhTm9uQ2FjaGVkU2VtYW50aWNPYmplY3RzID0gW107XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IF9vQXJncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoISFfb0FyZ3NbaV1bMF0gJiYgISFfb0FyZ3NbaV1bMF0uc2VtYW50aWNPYmplY3QpIHtcblx0XHRcdFx0XHRpZiAodGhpcy5saW5rc0NhY2hlW19vQXJnc1tpXVswXS5zZW1hbnRpY09iamVjdF0pIHtcblx0XHRcdFx0XHRcdGFDYWNoZWRTZW1hbnRpY09iamVjdHMucHVzaCh0aGlzLmxpbmtzQ2FjaGVbX29BcmdzW2ldWzBdLnNlbWFudGljT2JqZWN0XS5saW5rcyk7XG5cdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkob0FyZ3NbaV1bMF0sIFwibGlua3NcIiwge1xuXHRcdFx0XHRcdFx0XHR2YWx1ZTogdGhpcy5saW5rc0NhY2hlW19vQXJnc1tpXVswXS5zZW1hbnRpY09iamVjdF0ubGlua3Ncblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRhTm9uQ2FjaGVkU2VtYW50aWNPYmplY3RzLnB1c2goX29BcmdzW2ldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB7IG9sZEFyZ3M6IG9BcmdzLCBuZXdBcmdzOiBhTm9uQ2FjaGVkU2VtYW50aWNPYmplY3RzLCBjYWNoZWRMaW5rczogYUNhY2hlZFNlbWFudGljT2JqZWN0cyB9O1xuXHRcdH07XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHRoaXMucmVzb2x2ZUZuID0gcmVzb2x2ZTtcblx0XHRcdHRoaXMucmVqZWN0Rm4gPSByZWplY3Q7XG5cdFx0fSk7XG5cdFx0Y29uc3Qgb0Nyb3NzQXBwTmF2U2VydmljZVByb21pc2UgPSB0aGlzLm9TaGVsbENvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoXCJDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiKTtcblx0XHRjb25zdCBvVXJsUGFyc2luZ1NlcnZpY2VQcm9taXNlID0gdGhpcy5vU2hlbGxDb250YWluZXIuZ2V0U2VydmljZUFzeW5jKFwiVVJMUGFyc2luZ1wiKTtcblx0XHRjb25zdCBvU2hlbGxOYXZpZ2F0aW9uU2VydmljZVByb21pc2UgPSB0aGlzLm9TaGVsbENvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoXCJTaGVsbE5hdmlnYXRpb25cIik7XG5cdFx0Y29uc3Qgb1NoZWxsUGx1Z2luTWFuYWdlclByb21pc2UgPSB0aGlzLm9TaGVsbENvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoXCJQbHVnaW5NYW5hZ2VyXCIpO1xuXHRcdGNvbnN0IG9TaGVsbFVJU2VydmljZVByb21pc2UgPSBvQ29tcG9uZW50LmdldFNlcnZpY2UoXCJTaGVsbFVJU2VydmljZVwiKTtcblx0XHRQcm9taXNlLmFsbChbXG5cdFx0XHRvQ3Jvc3NBcHBOYXZTZXJ2aWNlUHJvbWlzZSxcblx0XHRcdG9VcmxQYXJzaW5nU2VydmljZVByb21pc2UsXG5cdFx0XHRvU2hlbGxOYXZpZ2F0aW9uU2VydmljZVByb21pc2UsXG5cdFx0XHRvU2hlbGxVSVNlcnZpY2VQcm9taXNlLFxuXHRcdFx0b1NoZWxsUGx1Z2luTWFuYWdlclByb21pc2Vcblx0XHRdKVxuXHRcdFx0LnRoZW4oKFtvQ3Jvc3NBcHBOYXZTZXJ2aWNlLCBvVXJsUGFyc2luZ1NlcnZpY2UsIG9TaGVsbE5hdmlnYXRpb24sIG9TaGVsbFVJU2VydmljZSwgb1NoZWxsUGx1Z2luTWFuYWdlcl0pID0+IHtcblx0XHRcdFx0dGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UgPSBvQ3Jvc3NBcHBOYXZTZXJ2aWNlO1xuXHRcdFx0XHR0aGlzLnVybFBhcnNpbmdTZXJ2aWNlID0gb1VybFBhcnNpbmdTZXJ2aWNlO1xuXHRcdFx0XHR0aGlzLnNoZWxsTmF2aWdhdGlvbiA9IG9TaGVsbE5hdmlnYXRpb247XG5cdFx0XHRcdHRoaXMuc2hlbGxVSVNlcnZpY2UgPSBvU2hlbGxVSVNlcnZpY2U7XG5cdFx0XHRcdHRoaXMuc2hlbGxQbHVnaW5NYW5hZ2VyID0gb1NoZWxsUGx1Z2luTWFuYWdlcjtcblx0XHRcdFx0dGhpcy5yZXNvbHZlRm4oKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2godGhpcy5yZWplY3RGbik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB0YXJnZXQgbGlua3MgY29uZmlndXJlZCBmb3IgYSBnaXZlbiBzZW1hbnRpYyBvYmplY3QgJiBhY3Rpb25cblx0ICogV2lsbCByZXRyaWV2ZSB0aGUgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cblx0ICogc2VydmljZSByZWZlcmVuY2UgY2FsbCB0aGUgZ2V0TGlua3MgbWV0aG9kLiBJbiBjYXNlIHNlcnZpY2UgaXMgbm90IGF2YWlsYWJsZSBvciBhbnkgZXhjZXB0aW9uXG5cdCAqIG1ldGhvZCB0aHJvd3MgZXhjZXB0aW9uIGVycm9yIGluIGNvbnNvbGUuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0FyZ3MgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Z2V0TGlua3MgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byB0YXJnZXQgbGlua3MgYXJyYXlcblx0ICovXG5cdGdldExpbmtzKG9BcmdzOiBvYmplY3QpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHR0aGlzLmNyb3NzQXBwTmF2U2VydmljZVxuXHRcdFx0XHQuZ2V0TGlua3Mob0FyZ3MpXG5cdFx0XHRcdC5mYWlsKChvRXJyb3I6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoYCR7b0Vycm9yfSBzYXAuZmUuY29yZS5zZXJ2aWNlcy5TaGVsbFNlcnZpY2VzRmFjdG9yeS5nZXRMaW5rc2ApKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4ocmVzb2x2ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB0YXJnZXQgbGlua3MgY29uZmlndXJlZCBmb3IgYSBnaXZlbiBzZW1hbnRpYyBvYmplY3QgJiBhY3Rpb24gaW4gY2FjaGVcblx0ICogV2lsbCByZXRyaWV2ZSB0aGUgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cblx0ICogc2VydmljZSByZWZlcmVuY2UgY2FsbCB0aGUgZ2V0TGlua3MgbWV0aG9kLiBJbiBjYXNlIHNlcnZpY2UgaXMgbm90IGF2YWlsYWJsZSBvciBhbnkgZXhjZXB0aW9uXG5cdCAqIG1ldGhvZCB0aHJvd3MgZXhjZXB0aW9uIGVycm9yIGluIGNvbnNvbGUuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0FyZ3MgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Z2V0TGlua3MgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byB0YXJnZXQgbGlua3MgYXJyYXlcblx0ICovXG5cdGdldExpbmtzV2l0aENhY2hlKG9BcmdzOiBvYmplY3QpOiBQcm9taXNlPGFueVtdPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcm9taXNlL2NhdGNoLW9yLXJldHVyblxuXHRcdFx0aWYgKChvQXJncyBhcyBPYmplY3RbXSkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJlc29sdmUoW10pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb0NhY2hlUmVzdWx0cyA9IHRoaXMuZm5GaW5kU2VtYW50aWNPYmplY3RzSW5DYWNoZShvQXJncyk7XG5cblx0XHRcdFx0aWYgKG9DYWNoZVJlc3VsdHMubmV3QXJncy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRyZXNvbHZlKG9DYWNoZVJlc3VsdHMuY2FjaGVkTGlua3MpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcm9taXNlL2NhdGNoLW9yLXJldHVyblxuXHRcdFx0XHRcdHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlXG5cdFx0XHRcdFx0XHQuZ2V0TGlua3Mob0NhY2hlUmVzdWx0cy5uZXdBcmdzKVxuXHRcdFx0XHRcdFx0LmZhaWwoKG9FcnJvcjogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoYCR7b0Vycm9yfSBzYXAuZmUuY29yZS5zZXJ2aWNlcy5TaGVsbFNlcnZpY2VzRmFjdG9yeS5nZXRMaW5rc1dpdGhDYWNoZWApKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGhlbigoYUxpbmtzOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0aWYgKGFMaW5rcy5sZW5ndGggIT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvU2VtYW50aWNPYmplY3RzTGlua3M6IGFueSA9IHt9O1xuXG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTGlua3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChhTGlua3NbaV0ubGVuZ3RoID4gMCAmJiBvQ2FjaGVSZXN1bHRzLm5ld0FyZ3NbaV1bMF0ubGlua3MgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RzTGlua3Nbb0NhY2hlUmVzdWx0cy5uZXdBcmdzW2ldWzBdLnNlbWFudGljT2JqZWN0XSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsaW5rczogYUxpbmtzW2ldXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMubGlua3NDYWNoZSA9IE9iamVjdC5hc3NpZ24odGhpcy5saW5rc0NhY2hlLCBvU2VtYW50aWNPYmplY3RzTGlua3MpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChvQ2FjaGVSZXN1bHRzLmNhY2hlZExpbmtzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoYUxpbmtzKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBhTWVyZ2VkTGlua3MgPSBbXTtcblx0XHRcdFx0XHRcdFx0XHRsZXQgaiA9IDA7XG5cblx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBrID0gMDsgayA8IG9DYWNoZVJlc3VsdHMub2xkQXJncy5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGogPCBhTGlua3MubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhTGlua3Nbal0ubGVuZ3RoID4gMCAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9DYWNoZVJlc3VsdHMub2xkQXJnc1trXVswXS5zZW1hbnRpY09iamVjdCA9PT0gb0NhY2hlUmVzdWx0cy5uZXdBcmdzW2pdWzBdLnNlbWFudGljT2JqZWN0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFNZXJnZWRMaW5rcy5wdXNoKGFMaW5rc1tqXSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aisrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFNZXJnZWRMaW5rcy5wdXNoKG9DYWNoZVJlc3VsdHMub2xkQXJnc1trXVswXS5saW5rcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFNZXJnZWRMaW5rcy5wdXNoKG9DYWNoZVJlc3VsdHMub2xkQXJnc1trXVswXS5saW5rcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoYU1lcmdlZExpbmtzKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIHJldHJpZXZlIHRoZSBTaGVsbENvbnRhaW5lci5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIHNhcC51c2hlbGwuY29udGFpbmVyXG5cdCAqIEByZXR1cm5zIE9iamVjdCB3aXRoIHByZWRlZmluZWQgc2hlbGxDb250YWluZXIgbWV0aG9kc1xuXHQgKi9cblx0Z2V0U2hlbGxDb250YWluZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMub1NoZWxsQ29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCB0b0V4dGVybmFsIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlIHdpdGggTmF2aWdhdGlvbiBBcmd1bWVudHMgYW5kIG9Db21wb25lbnQuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb05hdkFyZ3VtZW50c0FyciBBbmRcblx0ICogQHBhcmFtIG9Db21wb25lbnQgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+dG9FeHRlcm5hbCBhcmd1bWVudHNcblx0ICovXG5cdHRvRXh0ZXJuYWwob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KTogdm9pZCB7XG5cdFx0dGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UudG9FeHRlcm5hbChvTmF2QXJndW1lbnRzQXJyLCBvQ29tcG9uZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHRhcmdldCBzdGFydHVwQXBwU3RhdGVcblx0ICogV2lsbCBjaGVjayB0aGUgZXhpc3RhbmNlIG9mIHRoZSBTaGVsbENvbnRhaW5lciBhbmQgcmV0cmlldmUgdGhlIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uXG5cdCAqIHNlcnZpY2UgcmVmZXJlbmNlIGNhbGwgdGhlIGdldFN0YXJ0dXBBcHBTdGF0ZSBtZXRob2QuIEluIGNhc2Ugc2VydmljZSBpcyBub3QgYXZhaWxhYmxlIG9yIGFueSBleGNlcHRpb25cblx0ICogbWV0aG9kIHRocm93cyBleGNlcHRpb24gZXJyb3IgaW4gY29uc29sZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvQXJncyBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5nZXRTdGFydHVwQXBwU3RhdGUgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBPYmplY3Rcblx0ICovXG5cdGdldFN0YXJ0dXBBcHBTdGF0ZShvQXJnczogQ29tcG9uZW50KTogUHJvbWlzZTx1bmRlZmluZWQgfCBTdGFydHVwQXBwU3RhdGU+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly8gSlF1ZXJ5IFByb21pc2UgYmVoYXZlcyBkaWZmZXJlbnRseVxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHQodGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UgYXMgYW55KVxuXHRcdFx0XHQuZ2V0U3RhcnR1cEFwcFN0YXRlKG9BcmdzKVxuXHRcdFx0XHQuZmFpbCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0XHRyZWplY3QobmV3IEVycm9yKGAke29FcnJvcn0gc2FwLmZlLmNvcmUuc2VydmljZXMuU2hlbGxTZXJ2aWNlc0ZhY3RvcnkuZ2V0U3RhcnR1cEFwcFN0YXRlYCkpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigoc3RhcnR1cEFwcFN0YXRlOiB1bmRlZmluZWQgfCBTdGFydHVwQXBwU3RhdGUpID0+IHJlc29sdmUoc3RhcnR1cEFwcFN0YXRlKSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGJhY2tUb1ByZXZpb3VzQXBwIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBTb21ldGhpbmcgdGhhdCBpbmRpY2F0ZSB3ZSd2ZSBuYXZpZ2F0ZWRcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRiYWNrVG9QcmV2aW91c0FwcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UuYmFja1RvUHJldmlvdXNBcHAoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgaHJlZkZvckV4dGVybmFsIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9BcmdzIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIEBwYXJhbSBvQ29tcG9uZW50IFRoZSBhcHBDb21wb25lbnRcblx0ICogQHBhcmFtIGJBc3luYyBXaGV0aGVyIHRoaXMgY2FsbCBzaG91bGQgYmUgYXN5bmMgb3Igbm90XG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb249PmhyZWZGb3JFeHRlcm5hbCBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIHN0cmluZ1xuXHQgKi9cblx0aHJlZkZvckV4dGVybmFsKG9BcmdzOiBvYmplY3QsIG9Db21wb25lbnQ/OiBvYmplY3QsIGJBc3luYz86IGJvb2xlYW4pIHtcblx0XHRyZXR1cm4gdGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UuaHJlZkZvckV4dGVybmFsKG9BcmdzLCBvQ29tcG9uZW50IGFzIG9iamVjdCwgISFiQXN5bmMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBocmVmRm9yRXh0ZXJuYWwgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0FyZ3MgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogQHBhcmFtIG9Db21wb25lbnQgVGhlIGFwcENvbXBvbmVudFxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5ocmVmRm9yRXh0ZXJuYWxBc3luYyBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIHN0cmluZ1xuXHQgKi9cblx0aHJlZkZvckV4dGVybmFsQXN5bmMob0FyZ3M6IG9iamVjdCwgb0NvbXBvbmVudD86IG9iamVjdCkge1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQXBwTmF2U2VydmljZS5ocmVmRm9yRXh0ZXJuYWxBc3luYyhvQXJncywgb0NvbXBvbmVudCBhcyBvYmplY3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBnZXRBcHBTdGF0ZSBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZSB3aXRoIG9Db21wb25lbnQgYW5kIG9BcHBTdGF0ZUtleS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvQ29tcG9uZW50XG5cdCAqIEBwYXJhbSBzQXBwU3RhdGVLZXkgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Z2V0QXBwU3RhdGUgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBvYmplY3Rcblx0ICovXG5cdGdldEFwcFN0YXRlKG9Db21wb25lbnQ6IENvbXBvbmVudCwgc0FwcFN0YXRlS2V5OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gd3JhcEpRdWVyeVByb21pc2UoKHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlIGFzIGFueSkuZ2V0QXBwU3RhdGUob0NvbXBvbmVudCwgc0FwcFN0YXRlS2V5KSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGNyZWF0ZUVtcHR5QXBwU3RhdGUgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2Ugd2l0aCBvQ29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9Db21wb25lbnQgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Y3JlYXRlRW1wdHlBcHBTdGF0ZSBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIG9iamVjdFxuXHQgKi9cblx0Y3JlYXRlRW1wdHlBcHBTdGF0ZShvQ29tcG9uZW50OiBDb21wb25lbnQpIHtcblx0XHRyZXR1cm4gKHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlIGFzIGFueSkuY3JlYXRlRW1wdHlBcHBTdGF0ZShvQ29tcG9uZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgY3JlYXRlRW1wdHlBcHBTdGF0ZUFzeW5jIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlIHdpdGggb0NvbXBvbmVudC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvQ29tcG9uZW50IENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb249PmNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYyBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIG9iamVjdFxuXHQgKi9cblx0Y3JlYXRlRW1wdHlBcHBTdGF0ZUFzeW5jKG9Db21wb25lbnQ6IENvbXBvbmVudCkge1xuXHRcdHJldHVybiAodGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UgYXMgYW55KS5jcmVhdGVFbXB0eUFwcFN0YXRlQXN5bmMob0NvbXBvbmVudCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGlzTmF2aWdhdGlvblN1cHBvcnRlZCBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZSB3aXRoIE5hdmlnYXRpb24gQXJndW1lbnRzIGFuZCBvQ29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9OYXZBcmd1bWVudHNBcnJcblx0ICogQHBhcmFtIG9Db21wb25lbnQgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+aXNOYXZpZ2F0aW9uU3VwcG9ydGVkIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqL1xuXHRpc05hdmlnYXRpb25TdXBwb3J0ZWQob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIHdyYXBKUXVlcnlQcm9taXNlKHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmlzTmF2aWdhdGlvblN1cHBvcnRlZChvTmF2QXJndW1lbnRzQXJyLCBvQ29tcG9uZW50KSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGlzSW5pdGlhbE5hdmlnYXRpb24gbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gYm9vbGVhblxuXHQgKi9cblx0aXNJbml0aWFsTmF2aWdhdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UuaXNJbml0aWFsTmF2aWdhdGlvbigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBpc0luaXRpYWxOYXZpZ2F0aW9uQXN5bmMgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gYm9vbGVhblxuXHQgKi9cblx0aXNJbml0aWFsTmF2aWdhdGlvbkFzeW5jKCkge1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQXBwTmF2U2VydmljZS5pc0luaXRpYWxOYXZpZ2F0aW9uQXN5bmMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgZXhwYW5kQ29tcGFjdEhhc2ggbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBzSGFzaEZyYWdtZW50IEFuIChpbnRlcm5hbCBmb3JtYXQpIHNoZWxsIGhhc2hcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoZSBzdWNjZXNzIGhhbmRsZXIgb2YgdGhlIHJlc29sdmUgcHJvbWlzZSBnZXQgYW4gZXhwYW5kZWQgc2hlbGwgaGFzaCBhcyBmaXJzdCBhcmd1bWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGV4cGFuZENvbXBhY3RIYXNoKHNIYXNoRnJhZ21lbnQ6IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQXBwTmF2U2VydmljZS5leHBhbmRDb21wYWN0SGFzaChzSGFzaEZyYWdtZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgcGFyc2VTaGVsbEhhc2ggbWV0aG9kIG9mIFVSTFBhcnNpbmcgc2VydmljZSB3aXRoIGdpdmVuIHNIYXNoLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNIYXNoIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuVVJMUGFyc2luZz0+cGFyc2VTaGVsbEhhc2ggYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFRoZSBwYXJzZWQgdXJsXG5cdCAqL1xuXHRwYXJzZVNoZWxsSGFzaChzSGFzaDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMudXJsUGFyc2luZ1NlcnZpY2UucGFyc2VTaGVsbEhhc2goc0hhc2gpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBzcGxpdEhhc2ggbWV0aG9kIG9mIFVSTFBhcnNpbmcgc2VydmljZSB3aXRoIGdpdmVuIHNIYXNoLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNIYXNoIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuVVJMUGFyc2luZz0+c3BsaXRIYXNoIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqL1xuXHRzcGxpdEhhc2goc0hhc2g6IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLnVybFBhcnNpbmdTZXJ2aWNlLnNwbGl0SGFzaChzSGFzaCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGNvbnN0cnVjdFNoZWxsSGFzaCBtZXRob2Qgb2YgVVJMUGFyc2luZyBzZXJ2aWNlIHdpdGggZ2l2ZW4gc0hhc2guXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb05ld1NoZWxsSGFzaCBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLlVSTFBhcnNpbmc9PmNvbnN0cnVjdFNoZWxsSGFzaCBhcmd1bWVudHNcblx0ICogQHJldHVybnMgU2hlbGwgSGFzaCBzdHJpbmdcblx0ICovXG5cdGNvbnN0cnVjdFNoZWxsSGFzaChvTmV3U2hlbGxIYXNoOiBvYmplY3QpIHtcblx0XHRyZXR1cm4gdGhpcy51cmxQYXJzaW5nU2VydmljZS5jb25zdHJ1Y3RTaGVsbEhhc2gob05ld1NoZWxsSGFzaCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHNldERpcnR5RmxhZyBtZXRob2Qgd2l0aCBnaXZlbiBkaXJ0eSBzdGF0ZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBiRGlydHkgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Ygc2FwLnVzaGVsbC5Db250YWluZXIuc2V0RGlydHlGbGFnIGFyZ3VtZW50c1xuXHQgKi9cblx0c2V0RGlydHlGbGFnKGJEaXJ0eTogYm9vbGVhbikge1xuXHRcdHRoaXMub1NoZWxsQ29udGFpbmVyLnNldERpcnR5RmxhZyhiRGlydHkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCByZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciBtZXRob2Qgd2l0aCBnaXZlbiBkaXJ0eSBzdGF0ZSBwcm92aWRlciBjYWxsYmFjayBtZXRob2QuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gZm5EaXJ0eVN0YXRlUHJvdmlkZXIgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Ygc2FwLnVzaGVsbC5Db250YWluZXIucmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIgYXJndW1lbnRzXG5cdCAqL1xuXHRyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlcihmbkRpcnR5U3RhdGVQcm92aWRlcjogRnVuY3Rpb24pIHtcblx0XHR0aGlzLm9TaGVsbENvbnRhaW5lci5yZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlcihmbkRpcnR5U3RhdGVQcm92aWRlcik7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIgbWV0aG9kIHdpdGggZ2l2ZW4gZGlydHkgc3RhdGUgcHJvdmlkZXIgY2FsbGJhY2sgbWV0aG9kLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIGZuRGlydHlTdGF0ZVByb3ZpZGVyIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mIHNhcC51c2hlbGwuQ29udGFpbmVyLmRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIgYXJndW1lbnRzXG5cdCAqL1xuXHRkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyOiBGdW5jdGlvbikge1xuXHRcdHRoaXMub1NoZWxsQ29udGFpbmVyLmRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoZm5EaXJ0eVN0YXRlUHJvdmlkZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBjcmVhdGVSZW5kZXJlciBtZXRob2Qgb2YgdXNoZWxsIGNvbnRhaW5lci5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgcmVuZGVyZXIgb2JqZWN0XG5cdCAqL1xuXHRjcmVhdGVSZW5kZXJlcigpIHtcblx0XHRyZXR1cm4gdGhpcy5vU2hlbGxDb250YWluZXIuY3JlYXRlUmVuZGVyZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgZ2V0VXNlciBtZXRob2Qgb2YgdXNoZWxsIGNvbnRhaW5lci5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgVXNlciBvYmplY3Rcblx0ICovXG5cdGdldFVzZXIoKSB7XG5cdFx0cmV0dXJuICh0aGlzLm9TaGVsbENvbnRhaW5lciBhcyBhbnkpLmdldFVzZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNoZWNrIGlmIHVzaGVsbCBjb250YWluZXIgaXMgYXZhaWxhYmxlIG9yIG5vdC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZVxuXHQgKi9cblx0aGFzVVNoZWxsKCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCByZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIgbWV0aG9kIG9mIHNoZWxsTmF2aWdhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIGZuTmF2RmlsdGVyIFRoZSBmaWx0ZXIgZnVuY3Rpb24gdG8gcmVnaXN0ZXJcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRyZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoZm5OYXZGaWx0ZXI6IEZ1bmN0aW9uKSB7XG5cdFx0KHRoaXMuc2hlbGxOYXZpZ2F0aW9uIGFzIGFueSkucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgdW5yZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIgbWV0aG9kIG9mIHNoZWxsTmF2aWdhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIGZuTmF2RmlsdGVyIFRoZSBmaWx0ZXIgZnVuY3Rpb24gdG8gdW5yZWdpc3RlclxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdHVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyOiBGdW5jdGlvbikge1xuXHRcdCh0aGlzLnNoZWxsTmF2aWdhdGlvbiBhcyBhbnkpLnVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgc2V0QmFja05hdmlnYXRpb24gbWV0aG9kIG9mIFNoZWxsVUlTZXJ2aWNlXG5cdCAqIHRoYXQgZGlzcGxheXMgdGhlIGJhY2sgYnV0dG9uIGluIHRoZSBzaGVsbCBoZWFkZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBbZm5DYWxsQmFja10gQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWQgaW4gdGhlIFVJLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdHNldEJhY2tOYXZpZ2F0aW9uKGZuQ2FsbEJhY2s/OiBGdW5jdGlvbik6IHZvaWQge1xuXHRcdHRoaXMuc2hlbGxVSVNlcnZpY2Uuc2V0QmFja05hdmlnYXRpb24oZm5DYWxsQmFjayk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHNldEhpZXJhcmNoeSBtZXRob2Qgb2YgU2hlbGxVSVNlcnZpY2Vcblx0ICogdGhhdCBkaXNwbGF5cyB0aGUgZ2l2ZW4gaGllcmFyY2h5IGluIHRoZSBzaGVsbCBoZWFkZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBbYUhpZXJhcmNoeUxldmVsc10gQW4gYXJyYXkgcmVwcmVzZW50aW5nIGhpZXJhcmNoaWVzIG9mIHRoZSBjdXJyZW50bHkgZGlzcGxheWVkIGFwcC5cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRzZXRIaWVyYXJjaHkoYUhpZXJhcmNoeUxldmVsczogQXJyYXk8b2JqZWN0Pik6IHZvaWQge1xuXHRcdHRoaXMuc2hlbGxVSVNlcnZpY2Uuc2V0SGllcmFyY2h5KGFIaWVyYXJjaHlMZXZlbHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBzZXRUaXRsZSBtZXRob2Qgb2YgU2hlbGxVSVNlcnZpY2Vcblx0ICogdGhhdCBkaXNwbGF5cyB0aGUgZ2l2ZW4gdGl0bGUgaW4gdGhlIHNoZWxsIGhlYWRlci5cblx0ICpcblx0ICogQHBhcmFtIFtzVGl0bGVdIFRoZSBuZXcgdGl0bGUuIFRoZSBkZWZhdWx0IHRpdGxlIGlzIHNldCBpZiB0aGlzIGFyZ3VtZW50IGlzIG5vdCBnaXZlbi5cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRzZXRUaXRsZShzVGl0bGU6IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMuc2hlbGxVSVNlcnZpY2Uuc2V0VGl0bGUoc1RpdGxlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnRseSBkZWZpbmVkIGNvbnRlbnQgZGVuc2l0eS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRlbnQgZGVuc2l0eSB2YWx1ZVxuXHQgKi9cblx0Z2V0Q29udGVudERlbnNpdHkoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gKHRoaXMub1NoZWxsQ29udGFpbmVyIGFzIGFueSkuZ2V0VXNlcigpLmdldENvbnRlbnREZW5zaXR5KCk7XG5cdH1cblxuXHQvKipcblx0ICogRm9yIGEgZ2l2ZW4gc2VtYW50aWMgb2JqZWN0LCB0aGlzIG1ldGhvZCBjb25zaWRlcnMgYWxsIGFjdGlvbnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBzZW1hbnRpYyBvYmplY3QgYW5kXG5cdCAqIHJldHVybnMgdGhlIG9uZSB0YWdnZWQgYXMgYSBcInByaW1hcnlBY3Rpb25cIi4gSWYgbm8gaW5ib3VuZCB0YWdnZWQgYXMgXCJwcmltYXJ5QWN0aW9uXCIgZXhpc3RzLCB0aGVuIGl0IHJldHVybnNcblx0ICogdGhlIGludGVudCBvZiB0aGUgZmlyc3QgaW5ib3VuZCAoYWZ0ZXIgc29ydGluZyBoYXMgYmVlbiBhcHBsaWVkKSBtYXRjaGluZyB0aGUgYWN0aW9uIFwiZGlzcGxheUZhY3RTaGVldFwiLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNTZW1hbnRpY09iamVjdCBTZW1hbnRpYyBvYmplY3QuXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBTZWUgI0Nyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uI2dldExpbmtzIGZvciBkZXNjcmlwdGlvbi5cblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHdpdGggYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGludGVudCBpZiBpdCBleGlzdHMuXG5cdCAqL1xuXHRnZXRQcmltYXJ5SW50ZW50KHNTZW1hbnRpY09iamVjdDogc3RyaW5nLCBtUGFyYW1ldGVycz86IG9iamVjdCk6IFByb21pc2U8YW55PiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcm9taXNlL2NhdGNoLW9yLXJldHVyblxuXHRcdFx0dGhpcy5jcm9zc0FwcE5hdlNlcnZpY2Vcblx0XHRcdFx0LmdldFByaW1hcnlJbnRlbnQoc1NlbWFudGljT2JqZWN0LCBtUGFyYW1ldGVycylcblx0XHRcdFx0LmZhaWwoKG9FcnJvcjogYW55KSA9PiB7XG5cdFx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihgJHtvRXJyb3J9IHNhcC5mZS5jb3JlLnNlcnZpY2VzLlNoZWxsU2VydmljZXNGYWN0b3J5LmdldFByaW1hcnlJbnRlbnRgKSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKHJlc29sdmUpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdhaXQgZm9yIHRoZSByZW5kZXIgZXh0ZW5zaW9ucyBwbHVnaW4gdG8gYmUgbG9hZGVkLlxuXHQgKiBJZiB0cnVlIGlzIHJldHVybmVkIGJ5IHRoZSBwcm9taXNlIHdlIHdlcmUgYWJsZSB0byB3YWl0IGZvciBpdCwgb3RoZXJ3aXNlIHdlIGNvdWxkbid0IGFuZCBjYW5ub3QgcmVseSBvbiBpdC5cblx0ICovXG5cdHdhaXRGb3JQbHVnaW5zTG9hZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGlmICghdGhpcy5zaGVsbFBsdWdpbk1hbmFnZXI/LmdldFBsdWdpbkxvYWRpbmdQcm9taXNlKSB7XG5cdFx0XHRcdHJlc29sdmUoZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHRcdHRoaXMuc2hlbGxQbHVnaW5NYW5hZ2VyXG5cdFx0XHRcdFx0LmdldFBsdWdpbkxvYWRpbmdQcm9taXNlKFwiUmVuZGVyZXJFeHRlbnNpb25zXCIpXG5cdFx0XHRcdFx0LmZhaWwoKG9FcnJvcjogdW5rbm93bikgPT4ge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKG9FcnJvciBhcyBzdHJpbmcsIFwic2FwLmZlLmNvcmUuc2VydmljZXMuU2hlbGxTZXJ2aWNlc0ZhY3Rvcnkud2FpdEZvclBsdWdpbnNMb2FkXCIpO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShmYWxzZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbigoKSA9PiByZXNvbHZlKHRydWUpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG4vKipcbiAqIFNlcnZpY2UgRmFjdG9yeSBmb3IgdGhlIFNoZWxsU2VydmljZXNcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5jbGFzcyBTaGVsbFNlcnZpY2VzRmFjdG9yeSBleHRlbmRzIFNlcnZpY2VGYWN0b3J5PFNoZWxsU2VydmljZXNTZXR0aW5ncz4ge1xuXHQvKipcblx0ICogQ3JlYXRlcyBlaXRoZXIgYSBzdGFuZGFyZCBvciBhIG1vY2sgU2hlbGwgc2VydmljZSBkZXBlbmRpbmcgb24gdGhlIGNvbmZpZ3VyYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvU2VydmljZUNvbnRleHQgVGhlIHNoZWxsc2VydmljZSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgYSBzaGVsbCBzZXJ2aWNlIGltcGxlbWVudGF0aW9uXG5cdCAqIEBzZWUgU2VydmljZUZhY3RvcnkjY3JlYXRlSW5zdGFuY2Vcblx0ICovXG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8U2hlbGxTZXJ2aWNlc1NldHRpbmdzPik6IFByb21pc2U8SVNoZWxsU2VydmljZXM+IHtcblx0XHRvU2VydmljZUNvbnRleHQuc2V0dGluZ3Muc2hlbGxDb250YWluZXIgPSBzYXAudXNoZWxsICYmIChzYXAudXNoZWxsLkNvbnRhaW5lciBhcyBDb250YWluZXIpO1xuXHRcdGNvbnN0IG9TaGVsbFNlcnZpY2UgPSBvU2VydmljZUNvbnRleHQuc2V0dGluZ3Muc2hlbGxDb250YWluZXJcblx0XHRcdD8gbmV3IFNoZWxsU2VydmljZXMob1NlcnZpY2VDb250ZXh0IGFzIFNlcnZpY2VDb250ZXh0PFJlcXVpcmVkPFNoZWxsU2VydmljZXNTZXR0aW5ncz4+KVxuXHRcdFx0OiBuZXcgU2hlbGxTZXJ2aWNlTW9jayhvU2VydmljZUNvbnRleHQpO1xuXHRcdHJldHVybiBvU2hlbGxTZXJ2aWNlLmluaXRQcm9taXNlLnRoZW4oKCkgPT4ge1xuXHRcdFx0Ly8gRW5yaWNoIHRoZSBhcHBDb21wb25lbnQgd2l0aCB0aGlzIG1ldGhvZFxuXHRcdFx0KG9TZXJ2aWNlQ29udGV4dC5zY29wZU9iamVjdCBhcyBhbnkpLmdldFNoZWxsU2VydmljZXMgPSAoKSA9PiBvU2hlbGxTZXJ2aWNlO1xuXHRcdFx0cmV0dXJuIG9TaGVsbFNlcnZpY2U7XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2hlbGxTZXJ2aWNlc0ZhY3Rvcnk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQStGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQSxJQU1NQSxnQkFBZ0I7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEsT0FJckJDLElBQUksR0FBSixnQkFBTztNQUNOLElBQUksQ0FBQ0MsV0FBVyxHQUFHQyxPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7TUFDeEMsSUFBSSxDQUFDQyxZQUFZLEdBQUcsTUFBTTtJQUMzQixDQUFDO0lBQUEsT0FFREMsUUFBUSxHQUFSLG1CQUFTO0lBQUEsRUFBbUI7TUFDM0IsT0FBT0gsT0FBTyxDQUFDQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFBQSxPQUVERyxpQkFBaUIsR0FBakIsNEJBQWtCO0lBQUEsRUFBbUI7TUFDcEMsT0FBT0osT0FBTyxDQUFDQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFBQSxPQUVESSxVQUFVLEdBQVYscUJBQVc7SUFBQSxFQUF5RDtNQUNuRTtJQUFBLENBQ0E7SUFBQSxPQUVEQyxrQkFBa0IsR0FBbEIsNkJBQW1CO0lBQUEsRUFBbUI7TUFDckMsT0FBT04sT0FBTyxDQUFDQyxPQUFPLENBQUNNLFNBQVMsQ0FBQztJQUNsQyxDQUFDO0lBQUEsT0FFREMsaUJBQWlCLEdBQWpCLDZCQUFvQjtNQUNuQjtJQUFBLENBQ0E7SUFBQSxPQUVEQyxlQUFlLEdBQWYsMEJBQWdCO0lBQUEsRUFBMkQ7TUFDMUUsT0FBTyxFQUFFO0lBQ1YsQ0FBQztJQUFBLE9BRURDLG9CQUFvQixHQUFwQiwrQkFBcUI7SUFBQSxFQUF5QztNQUM3RCxPQUFPVixPQUFPLENBQUNDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQUEsT0FFRFUsV0FBVyxHQUFY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