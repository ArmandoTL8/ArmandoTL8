/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/BaseController", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/table/TableSizeHelper", "sap/ui/base/BindingParser", "sap/ui/core/routing/HashChanger", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper", "sap/ui/thirdparty/URI"], function (Log, BaseController, CommonUtils, Placeholder, ViewState, ClassSupport, TableSizeHelper, BindingParser, HashChanger, JSONModel, AnnotationHelper, URI) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RootViewBaseController = (_dec = defineUI5Class("sap.fe.core.rootView.RootViewBaseController"), _dec2 = usingExtension(Placeholder), _dec3 = usingExtension(ViewState), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(RootViewBaseController, _BaseController);
    function RootViewBaseController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "oPlaceholder", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor2, _assertThisInitialized(_this));
      _this.bIsComputingTitleHierachy = false;
      return _this;
    }
    var _proto = RootViewBaseController.prototype;
    _proto.onInit = function onInit() {
      TableSizeHelper.init();
      this._aHelperModels = [];
    };
    _proto.getPlaceholder = function getPlaceholder() {
      return this.oPlaceholder;
    };
    _proto.attachRouteMatchers = function attachRouteMatchers() {
      this.oPlaceholder.attachRouteMatchers();
      this.getAppComponent().getRoutingService().attachAfterRouteMatched(this._onAfterRouteMatched, this);
    };
    _proto.onExit = function onExit() {
      this.getAppComponent().getRoutingService().detachAfterRouteMatched(this._onAfterRouteMatched, this);
      this.oRouter = undefined;
      TableSizeHelper.exit();

      // Destroy all JSON models created dynamically for the views
      this._aHelperModels.forEach(function (oModel) {
        oModel.destroy();
      });
    }
    /**
     * Convenience method for getting the resource bundle.
     *
     * @public
     * @returns The resourceModel of the component
     */;
    _proto.getResourceBundle = function getResourceBundle() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    };
    _proto.getRouter = function getRouter() {
      if (!this.oRouter) {
        this.oRouter = this.getAppComponent().getRouter();
      }
      return this.oRouter;
    };
    _proto._createHelperModel = function _createHelperModel() {
      // We keep a reference on the models created dynamically, as they don't get destroyed
      // automatically when the view is destroyed.
      // This is done during onExit
      const oModel = new JSONModel();
      this._aHelperModels.push(oModel);
      return oModel;
    }

    /**
     * Function waiting for the Right most view to be ready.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param oEvent Reference an Event parameter coming from routeMatched event
     * @returns A promise indicating when the right most view is ready
     */;
    _proto.waitForRightMostViewReady = function waitForRightMostViewReady(oEvent) {
      return new Promise(function (resolve) {
        const aContainers = oEvent.getParameter("views"),
          // There can also be reuse components in the view, remove them before processing.
          aFEContainers = [];
        aContainers.forEach(function (oContainer) {
          let oView = oContainer;
          if (oContainer && oContainer.getComponentInstance) {
            const oComponentInstance = oContainer.getComponentInstance();
            oView = oComponentInstance.getRootControl();
          }
          if (oView && oView.getController() && oView.getController().pageReady) {
            aFEContainers.push(oView);
          }
        });
        const oRightMostFEView = aFEContainers[aFEContainers.length - 1];
        if (oRightMostFEView && oRightMostFEView.getController().pageReady.isPageReady()) {
          resolve(oRightMostFEView);
        } else if (oRightMostFEView) {
          oRightMostFEView.getController().pageReady.attachEventOnce("pageReady", function () {
            resolve(oRightMostFEView);
          });
        }
      });
    }

    /**
     * Callback when the navigation is done.
     *  - update the shell title.
     *  - update table scroll.
     *  - call onPageReady on the rightMostView.
     *
     * @param oEvent
     * @name sap.fe.core.rootView.BaseController#_onAfterRouteMatched
     * @memberof sap.fe.core.rootView.BaseController
     */;
    _proto._onAfterRouteMatched = function _onAfterRouteMatched(oEvent) {
      if (!this._oRouteMatchedPromise) {
        this._oRouteMatchedPromise = this.waitForRightMostViewReady(oEvent).then(oView => {
          // The autoFocus is initially disabled on the navContainer or the FCL, so that the focus stays on the Shell menu
          // even if the app takes a long time to launch
          // The first time the view is displayed, we need to enable the autofocus so that it's managed properly during navigation
          const oRootControl = this.getView().getContent()[0];
          if (oRootControl && oRootControl.getAutoFocus && !oRootControl.getAutoFocus()) {
            oRootControl.setProperty("autoFocus", true, true); // Do not mark the container as invalid, otherwise it's re-rendered
          }

          const oAppComponent = this.getAppComponent();
          this._scrollTablesToLastNavigatedItems();
          if (oAppComponent.getEnvironmentCapabilities().getCapabilities().UShell) {
            this._computeTitleHierarchy(oView);
          }
          const bForceFocus = oAppComponent.getRouterProxy().isFocusForced();
          oAppComponent.getRouterProxy().setFocusForced(false); // reset
          if (oView.getController() && oView.getController().onPageReady && oView.getParent().onPageReady) {
            oView.getParent().onPageReady({
              forceFocus: bForceFocus
            });
          }
          if (this.onContainerReady) {
            this.onContainerReady();
          }
        }).catch(function (oError) {
          Log.error("An error occurs while computing the title hierarchy and calling focus method", oError);
        }).finally(() => {
          this._oRouteMatchedPromise = null;
        });
      }
    }

    /**
     * This function returns the TitleHierarchy cache ( or initializes it if undefined).
     *
     * @name sap.fe.core.rootView.BaseController#_getTitleHierarchyCache
     * @memberof sap.fe.core.rootView.BaseController
     * @returns  The TitleHierarchy cache
     */;
    _proto._getTitleHierarchyCache = function _getTitleHierarchyCache() {
      if (!this.oTitleHierarchyCache) {
        this.oTitleHierarchyCache = {};
      }
      return this.oTitleHierarchyCache;
    }

    /**
     * This function returns a titleInfo object.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param title The application's title
     * @param subtitle The application's subTitle
     * @param sIntent The intent path to be redirected to
     * @param icon The application's icon
     * @returns The title information
     */;
    _proto._computeTitleInfo = function _computeTitleInfo(title, subtitle, sIntent) {
      let icon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
      const aParts = sIntent.split("/");
      sIntent = URI.decode(sIntent);
      if (aParts[aParts.length - 1].indexOf("?") === -1) {
        sIntent += "?restoreHistory=true";
      } else {
        sIntent += "&restoreHistory=true";
      }
      return {
        title: title,
        subtitle: subtitle,
        intent: sIntent,
        icon: icon
      };
    };
    _proto._formatTitle = function _formatTitle(displayMode, titleValue, titleDescription) {
      let formattedTitle = "";
      switch (displayMode) {
        case "Value":
          formattedTitle = `${titleValue}`;
          break;
        case "ValueDescription":
          formattedTitle = `${titleValue} (${titleDescription})`;
          break;
        case "DescriptionValue":
          formattedTitle = `${titleDescription} (${titleValue})`;
          break;
        case "Description":
          formattedTitle = `${titleDescription}`;
          break;
        default:
      }
      return formattedTitle;
    }

    /**
     * Fetches the value of the HeaderInfo title for a given path.
     *
     * @param sPath The path to the entity
     * @returns A promise containing the formatted title, or an empty string if no HeaderInfo title annotation is available
     */;
    _proto._fetchTitleValue = async function _fetchTitleValue(sPath) {
      const oAppComponent = this.getAppComponent(),
        oModel = this.getView().getModel(),
        oMetaModel = oAppComponent.getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(sPath),
        oBindingViewContext = oModel.createBindingContext(sPath),
        sValueExpression = AnnotationHelper.format(oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value`), {
          context: oMetaModel.createBindingContext("/")
        });
      if (!sValueExpression) {
        return Promise.resolve("");
      }
      const sTextExpression = AnnotationHelper.format(oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@com.sap.vocabularies.Common.v1.Text`), {
          context: oMetaModel.createBindingContext("/")
        }),
        oPropertyContext = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@`),
        aPromises = [],
        oValueExpression = BindingParser.complexParser(sValueExpression),
        oPromiseForDisplayMode = new Promise(function (resolve) {
          const displayMode = CommonUtils.computeDisplayMode(oPropertyContext);
          resolve(displayMode);
        });
      aPromises.push(oPromiseForDisplayMode);
      const sValuePath = oValueExpression.parts ? oValueExpression.parts[0].path : oValueExpression.path,
        fnValueFormatter = oValueExpression.formatter,
        oValueBinding = oModel.bindProperty(sValuePath, oBindingViewContext);
      oValueBinding.initialize();
      const oPromiseForTitleValue = new Promise(function (resolve) {
        const fnChange = function (oEvent) {
          const sTargetValue = fnValueFormatter ? fnValueFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();
          oValueBinding.detachChange(fnChange);
          resolve(sTargetValue);
        };
        oValueBinding.attachChange(fnChange);
      });
      aPromises.push(oPromiseForTitleValue);
      if (sTextExpression) {
        const oTextExpression = BindingParser.complexParser(sTextExpression);
        let sTextPath = oTextExpression.parts ? oTextExpression.parts[0].path : oTextExpression.path;
        sTextPath = sValuePath.lastIndexOf("/") > -1 ? `${sValuePath.slice(0, sValuePath.lastIndexOf("/"))}/${sTextPath}` : sTextPath;
        const fnTextFormatter = oTextExpression.formatter,
          oTextBinding = oModel.bindProperty(sTextPath, oBindingViewContext);
        oTextBinding.initialize();
        const oPromiseForTitleText = new Promise(function (resolve) {
          const fnChange = function (oEvent) {
            const sTargetText = fnTextFormatter ? fnTextFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();
            oTextBinding.detachChange(fnChange);
            resolve(sTargetText);
          };
          oTextBinding.attachChange(fnChange);
        });
        aPromises.push(oPromiseForTitleText);
      }
      try {
        const titleInfo = await Promise.all(aPromises);
        let formattedTitle = "";
        if (typeof titleInfo !== "string") {
          formattedTitle = this._formatTitle(titleInfo[0], titleInfo[1], titleInfo[2]);
        }
        return formattedTitle;
      } catch (error) {
        Log.error("Error while fetching the title from the header info :" + error);
      }
      return "";
    };
    _proto._getAppSpecificHash = function _getAppSpecificHash() {
      // HashChanged isShellNavigationHashChanger
      const hashChanger = HashChanger.getInstance();
      return "hrefForAppSpecificHash" in hashChanger ? hashChanger.hrefForAppSpecificHash("") : "#/";
    };
    _proto._getHash = function _getHash() {
      return HashChanger.getInstance().getHash();
    }

    /**
     * This function returns titleInformation from a path.
     * It updates the cache to store title information if necessary
     *
     * @name sap.fe.core.rootView.BaseController#getTitleInfoFromPath
     * @memberof sap.fe.core.rootView.BaseController
     * @param {*} sPath path of the context to retrieve title information from MetaModel
     * @returns {Promise}  oTitleinformation returned as promise
     */;
    _proto.getTitleInfoFromPath = function getTitleInfoFromPath(sPath) {
      const oTitleHierarchyCache = this._getTitleHierarchyCache();
      if (oTitleHierarchyCache[sPath]) {
        // The title info is already stored in the cache
        return Promise.resolve(oTitleHierarchyCache[sPath]);
      }
      const oMetaModel = this.getAppComponent().getMetaModel();
      const sEntityPath = oMetaModel.getMetaPath(sPath);
      const sTypeName = oMetaModel.getObject(`${sEntityPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/TypeName`);
      const sAppSpecificHash = this._getAppSpecificHash();
      const sIntent = sAppSpecificHash + sPath.slice(1);
      return this._fetchTitleValue(sPath).then(sTitle => {
        const oTitleInfo = this._computeTitleInfo(sTypeName, sTitle, sIntent);
        oTitleHierarchyCache[sPath] = oTitleInfo;
        return oTitleInfo;
      });
    }
    /**
     * Ensure that the ushell service receives all elements
     * (title, subtitle, intent, icon) as strings.
     *
     * Annotation HeaderInfo allows for binding of title and description
     * (which are used here as title and subtitle) to any element in the entity
     * (being possibly types like boolean, timestamp, double, etc.)
     *
     * Creates a new hierarchy and converts non-string types to string.
     *
     * @param aHierarchy Shell title hierarchy
     * @returns Copy of shell title hierarchy containing all elements as strings
     */;
    _proto._ensureHierarchyElementsAreStrings = function _ensureHierarchyElementsAreStrings(aHierarchy) {
      const aHierarchyShell = [];
      for (const level in aHierarchy) {
        const oHierarchy = aHierarchy[level];
        const oShellHierarchy = {};
        for (const key in oHierarchy) {
          oShellHierarchy[key] = typeof oHierarchy[key] !== "string" ? String(oHierarchy[key]) : oHierarchy[key];
        }
        aHierarchyShell.push(oShellHierarchy);
      }
      return aHierarchyShell;
    };
    _proto._getTargetTypeFromHash = function _getTargetTypeFromHash(sHash) {
      var _oAppComponent$getMan;
      const oAppComponent = this.getAppComponent();
      let sTargetType = "";
      const aRoutes = ((_oAppComponent$getMan = oAppComponent.getManifestEntry("sap.ui5").routing) === null || _oAppComponent$getMan === void 0 ? void 0 : _oAppComponent$getMan.routes) ?? [];
      for (const route of aRoutes) {
        const oRoute = oAppComponent.getRouter().getRoute(route.name);
        if (oRoute !== null && oRoute !== void 0 && oRoute.match(sHash)) {
          const sTarget = Array.isArray(route.target) ? route.target[0] : route.target;
          sTargetType = oAppComponent.getRouter().getTarget(sTarget)._oOptions.name;
          break;
        }
      }
      return sTargetType;
    }

    /**
     * This function updates the shell title after each navigation.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param oView The current view
     * @returns A Promise that is resolved when the menu is filled properly
     */;
    _proto._computeTitleHierarchy = function _computeTitleHierarchy(oView) {
      const oAppComponent = this.getAppComponent(),
        oContext = oView.getBindingContext(),
        oCurrentPage = oView.getParent(),
        aTitleInformationPromises = [],
        sAppSpecificHash = this._getAppSpecificHash(),
        manifestAppSettings = oAppComponent.getManifestEntry("sap.app"),
        sAppTitle = manifestAppSettings.title || "",
        sAppSubTitle = manifestAppSettings.subTitle || "",
        appIcon = manifestAppSettings.icon || "";
      let oPageTitleInformation, sNewPath;
      if (oCurrentPage && oCurrentPage._getPageTitleInformation) {
        if (oContext) {
          // If the first page of the application is a LR, use the title and subtitle from the manifest
          if (this._getTargetTypeFromHash("") === "sap.fe.templates.ListReport") {
            aTitleInformationPromises.push(Promise.resolve(this._computeTitleInfo(sAppTitle, sAppSubTitle, sAppSpecificHash, appIcon)));
          }

          // Then manage other pages
          sNewPath = oContext.getPath();
          const aPathParts = sNewPath.split("/");
          let sPath = "";
          aPathParts.shift(); // Remove the first segment (empty string) as it has been managed above
          aPathParts.pop(); // Remove the last segment as it corresponds to the current page and shouldn't appear in the menu

          aPathParts.forEach(sPathPart => {
            sPath += `/${sPathPart}`;
            const oMetaModel = oAppComponent.getMetaModel(),
              sParameterPath = oMetaModel.getMetaPath(sPath),
              bIsParameterized = oMetaModel.getObject(`${sParameterPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
            if (!bIsParameterized) {
              aTitleInformationPromises.push(this.getTitleInfoFromPath(sPath));
            }
          });
        }

        // Current page
        oPageTitleInformation = oCurrentPage._getPageTitleInformation();
        oPageTitleInformation = this._computeTitleInfo(oPageTitleInformation.title, oPageTitleInformation.subtitle, sAppSpecificHash + this._getHash());
        if (oContext) {
          this._getTitleHierarchyCache()[sNewPath] = oPageTitleInformation;
        } else {
          this._getTitleHierarchyCache()[sAppSpecificHash] = oPageTitleInformation;
        }
      } else {
        aTitleInformationPromises.push(Promise.reject("Title information missing in HeaderInfo"));
      }
      return Promise.all(aTitleInformationPromises).then(aTitleInfoHierarchy => {
        // workaround for shell which is expecting all elements being of type string
        const aTitleInfoHierarchyShell = this._ensureHierarchyElementsAreStrings(aTitleInfoHierarchy),
          sTitle = oPageTitleInformation.title;
        aTitleInfoHierarchyShell.reverse();
        oAppComponent.getShellServices().setHierarchy(aTitleInfoHierarchyShell);
        this._setShellMenuTitle(oAppComponent, sTitle, sAppTitle);
      }).catch(function (sErrorMessage) {
        Log.error(sErrorMessage);
      }).finally(() => {
        this.bIsComputingTitleHierachy = false;
      }).catch(function (sErrorMessage) {
        Log.error(sErrorMessage);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.calculateLayout = function calculateLayout(iNextFCLLevel, sHash, sProposedLayout) {
      let keepCurrentLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      return null;
    }

    /**
     * Callback after a view has been bound to a context.
     *
     * @param oContext The context that has been bound to a view
     */;
    _proto.onContextBoundToView = function onContextBoundToView(oContext) {
      if (oContext) {
        const sDeepestPath = this.getView().getModel("internal").getProperty("/deepestPath"),
          sViewContextPath = oContext.getPath();
        if (!sDeepestPath || sDeepestPath.indexOf(sViewContextPath) !== 0) {
          // There was no previous value for the deepest reached path, or the path
          // for the view isn't a subpath of the previous deepest path --> update
          this.getView().getModel("internal").setProperty("/deepestPath", sViewContextPath, undefined, true);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.displayErrorPage = function displayErrorPage(sErrorMessage, mParameters) {
      // To be overridden
      return Promise.resolve(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.updateUIStateForView = function updateUIStateForView(oView, FCLLevel) {
      // To be overriden
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.getInstancedViews = function getInstancedViews() {
      return [];
      // To be overriden
    };
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      // To be overriden
    };
    _proto.isFclEnabled = function isFclEnabled() {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto._setShellMenuTitle = function _setShellMenuTitle(oAppComponent, sTitle, sAppTitle) {
      // To be overriden by FclController
      oAppComponent.getShellServices().setTitle(sTitle);
    };
    _proto.getAppContentContainer = function getAppContentContainer() {
      var _oAppComponent$getMan2, _oAppComponent$getMan3;
      const oAppComponent = this.getAppComponent();
      const appContentId = ((_oAppComponent$getMan2 = oAppComponent.getManifestEntry("sap.ui5").routing) === null || _oAppComponent$getMan2 === void 0 ? void 0 : (_oAppComponent$getMan3 = _oAppComponent$getMan2.config) === null || _oAppComponent$getMan3 === void 0 ? void 0 : _oAppComponent$getMan3.controlId) ?? "appContent";
      return this.getView().byId(appContentId);
    };
    return RootViewBaseController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "oPlaceholder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return RootViewBaseController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb290Vmlld0Jhc2VDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlBsYWNlaG9sZGVyIiwiVmlld1N0YXRlIiwiYklzQ29tcHV0aW5nVGl0bGVIaWVyYWNoeSIsIm9uSW5pdCIsIlRhYmxlU2l6ZUhlbHBlciIsImluaXQiLCJfYUhlbHBlck1vZGVscyIsImdldFBsYWNlaG9sZGVyIiwib1BsYWNlaG9sZGVyIiwiYXR0YWNoUm91dGVNYXRjaGVycyIsImdldEFwcENvbXBvbmVudCIsImdldFJvdXRpbmdTZXJ2aWNlIiwiYXR0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQiLCJfb25BZnRlclJvdXRlTWF0Y2hlZCIsIm9uRXhpdCIsImRldGFjaEFmdGVyUm91dGVNYXRjaGVkIiwib1JvdXRlciIsInVuZGVmaW5lZCIsImV4aXQiLCJmb3JFYWNoIiwib01vZGVsIiwiZGVzdHJveSIsImdldFJlc291cmNlQnVuZGxlIiwiZ2V0T3duZXJDb21wb25lbnQiLCJnZXRNb2RlbCIsImdldFJvdXRlciIsIl9jcmVhdGVIZWxwZXJNb2RlbCIsIkpTT05Nb2RlbCIsInB1c2giLCJ3YWl0Rm9yUmlnaHRNb3N0Vmlld1JlYWR5Iiwib0V2ZW50IiwiUHJvbWlzZSIsInJlc29sdmUiLCJhQ29udGFpbmVycyIsImdldFBhcmFtZXRlciIsImFGRUNvbnRhaW5lcnMiLCJvQ29udGFpbmVyIiwib1ZpZXciLCJnZXRDb21wb25lbnRJbnN0YW5jZSIsIm9Db21wb25lbnRJbnN0YW5jZSIsImdldFJvb3RDb250cm9sIiwiZ2V0Q29udHJvbGxlciIsInBhZ2VSZWFkeSIsIm9SaWdodE1vc3RGRVZpZXciLCJsZW5ndGgiLCJpc1BhZ2VSZWFkeSIsImF0dGFjaEV2ZW50T25jZSIsIl9vUm91dGVNYXRjaGVkUHJvbWlzZSIsInRoZW4iLCJvUm9vdENvbnRyb2wiLCJnZXRWaWV3IiwiZ2V0Q29udGVudCIsImdldEF1dG9Gb2N1cyIsInNldFByb3BlcnR5Iiwib0FwcENvbXBvbmVudCIsIl9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcyIsImdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiZ2V0Q2FwYWJpbGl0aWVzIiwiVVNoZWxsIiwiX2NvbXB1dGVUaXRsZUhpZXJhcmNoeSIsImJGb3JjZUZvY3VzIiwiZ2V0Um91dGVyUHJveHkiLCJpc0ZvY3VzRm9yY2VkIiwic2V0Rm9jdXNGb3JjZWQiLCJvblBhZ2VSZWFkeSIsImdldFBhcmVudCIsImZvcmNlRm9jdXMiLCJvbkNvbnRhaW5lclJlYWR5IiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImZpbmFsbHkiLCJfZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZSIsIm9UaXRsZUhpZXJhcmNoeUNhY2hlIiwiX2NvbXB1dGVUaXRsZUluZm8iLCJ0aXRsZSIsInN1YnRpdGxlIiwic0ludGVudCIsImljb24iLCJhUGFydHMiLCJzcGxpdCIsIlVSSSIsImRlY29kZSIsImluZGV4T2YiLCJpbnRlbnQiLCJfZm9ybWF0VGl0bGUiLCJkaXNwbGF5TW9kZSIsInRpdGxlVmFsdWUiLCJ0aXRsZURlc2NyaXB0aW9uIiwiZm9ybWF0dGVkVGl0bGUiLCJfZmV0Y2hUaXRsZVZhbHVlIiwic1BhdGgiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJvQmluZGluZ1ZpZXdDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJzVmFsdWVFeHByZXNzaW9uIiwiQW5ub3RhdGlvbkhlbHBlciIsImZvcm1hdCIsImdldE9iamVjdCIsImNvbnRleHQiLCJzVGV4dEV4cHJlc3Npb24iLCJvUHJvcGVydHlDb250ZXh0IiwiYVByb21pc2VzIiwib1ZhbHVlRXhwcmVzc2lvbiIsIkJpbmRpbmdQYXJzZXIiLCJjb21wbGV4UGFyc2VyIiwib1Byb21pc2VGb3JEaXNwbGF5TW9kZSIsIkNvbW1vblV0aWxzIiwiY29tcHV0ZURpc3BsYXlNb2RlIiwic1ZhbHVlUGF0aCIsInBhcnRzIiwicGF0aCIsImZuVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXR0ZXIiLCJvVmFsdWVCaW5kaW5nIiwiYmluZFByb3BlcnR5IiwiaW5pdGlhbGl6ZSIsIm9Qcm9taXNlRm9yVGl0bGVWYWx1ZSIsImZuQ2hhbmdlIiwic1RhcmdldFZhbHVlIiwiZ2V0U291cmNlIiwiZ2V0VmFsdWUiLCJkZXRhY2hDaGFuZ2UiLCJhdHRhY2hDaGFuZ2UiLCJvVGV4dEV4cHJlc3Npb24iLCJzVGV4dFBhdGgiLCJsYXN0SW5kZXhPZiIsInNsaWNlIiwiZm5UZXh0Rm9ybWF0dGVyIiwib1RleHRCaW5kaW5nIiwib1Byb21pc2VGb3JUaXRsZVRleHQiLCJzVGFyZ2V0VGV4dCIsInRpdGxlSW5mbyIsImFsbCIsIl9nZXRBcHBTcGVjaWZpY0hhc2giLCJoYXNoQ2hhbmdlciIsIkhhc2hDaGFuZ2VyIiwiZ2V0SW5zdGFuY2UiLCJocmVmRm9yQXBwU3BlY2lmaWNIYXNoIiwiX2dldEhhc2giLCJnZXRIYXNoIiwiZ2V0VGl0bGVJbmZvRnJvbVBhdGgiLCJzRW50aXR5UGF0aCIsInNUeXBlTmFtZSIsInNBcHBTcGVjaWZpY0hhc2giLCJzVGl0bGUiLCJvVGl0bGVJbmZvIiwiX2Vuc3VyZUhpZXJhcmNoeUVsZW1lbnRzQXJlU3RyaW5ncyIsImFIaWVyYXJjaHkiLCJhSGllcmFyY2h5U2hlbGwiLCJsZXZlbCIsIm9IaWVyYXJjaHkiLCJvU2hlbGxIaWVyYXJjaHkiLCJrZXkiLCJTdHJpbmciLCJfZ2V0VGFyZ2V0VHlwZUZyb21IYXNoIiwic0hhc2giLCJzVGFyZ2V0VHlwZSIsImFSb3V0ZXMiLCJnZXRNYW5pZmVzdEVudHJ5Iiwicm91dGluZyIsInJvdXRlcyIsInJvdXRlIiwib1JvdXRlIiwiZ2V0Um91dGUiLCJuYW1lIiwibWF0Y2giLCJzVGFyZ2V0IiwiQXJyYXkiLCJpc0FycmF5IiwidGFyZ2V0IiwiZ2V0VGFyZ2V0IiwiX29PcHRpb25zIiwib0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9DdXJyZW50UGFnZSIsImFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMiLCJtYW5pZmVzdEFwcFNldHRpbmdzIiwic0FwcFRpdGxlIiwic0FwcFN1YlRpdGxlIiwic3ViVGl0bGUiLCJhcHBJY29uIiwib1BhZ2VUaXRsZUluZm9ybWF0aW9uIiwic05ld1BhdGgiLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJnZXRQYXRoIiwiYVBhdGhQYXJ0cyIsInNoaWZ0IiwicG9wIiwic1BhdGhQYXJ0Iiwic1BhcmFtZXRlclBhdGgiLCJiSXNQYXJhbWV0ZXJpemVkIiwicmVqZWN0IiwiYVRpdGxlSW5mb0hpZXJhcmNoeSIsImFUaXRsZUluZm9IaWVyYXJjaHlTaGVsbCIsInJldmVyc2UiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0SGllcmFyY2h5IiwiX3NldFNoZWxsTWVudVRpdGxlIiwic0Vycm9yTWVzc2FnZSIsImNhbGN1bGF0ZUxheW91dCIsImlOZXh0RkNMTGV2ZWwiLCJzUHJvcG9zZWRMYXlvdXQiLCJrZWVwQ3VycmVudExheW91dCIsIm9uQ29udGV4dEJvdW5kVG9WaWV3Iiwic0RlZXBlc3RQYXRoIiwiZ2V0UHJvcGVydHkiLCJzVmlld0NvbnRleHRQYXRoIiwiZGlzcGxheUVycm9yUGFnZSIsIm1QYXJhbWV0ZXJzIiwidXBkYXRlVUlTdGF0ZUZvclZpZXciLCJGQ0xMZXZlbCIsImdldEluc3RhbmNlZFZpZXdzIiwiaXNGY2xFbmFibGVkIiwic2V0VGl0bGUiLCJnZXRBcHBDb250ZW50Q29udGFpbmVyIiwiYXBwQ29udGVudElkIiwiY29uZmlnIiwiY29udHJvbElkIiwiYnlJZCIsIkJhc2VDb250cm9sbGVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJSb290Vmlld0Jhc2VDb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgRmxleGlibGVDb2x1bW5MYXlvdXQgZnJvbSBcInNhcC9mL0ZsZXhpYmxlQ29sdW1uTGF5b3V0XCI7XG5pbXBvcnQgQmFzZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BsYWNlaG9sZGVyXCI7XG5pbXBvcnQgVmlld1N0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9WaWV3U3RhdGVcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCB1c2luZ0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgRmNsQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvcm9vdFZpZXcvRmNsLmNvbnRyb2xsZXJcIjtcbmltcG9ydCBUYWJsZVNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVTaXplSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBOYXZDb250YWluZXIgZnJvbSBcInNhcC9tL05hdkNvbnRhaW5lclwiO1xuaW1wb3J0IEJpbmRpbmdQYXJzZXIgZnJvbSBcInNhcC91aS9iYXNlL0JpbmRpbmdQYXJzZXJcIjtcbmltcG9ydCB0eXBlIFhNTFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9YTUxWaWV3XCI7XG5pbXBvcnQgSGFzaENoYW5nZXIgZnJvbSBcInNhcC91aS9jb3JlL3JvdXRpbmcvSGFzaENoYW5nZXJcIjtcbmltcG9ydCB0eXBlIFJvdXRlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9Sb3V0ZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBBbm5vdGF0aW9uSGVscGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQW5ub3RhdGlvbkhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL3Jlc291cmNlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBVUkkgZnJvbSBcInNhcC91aS90aGlyZHBhcnR5L1VSSVwiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCIuLi9BcHBDb21wb25lbnRcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUucm9vdFZpZXcuUm9vdFZpZXdCYXNlQ29udHJvbGxlclwiKVxuY2xhc3MgUm9vdFZpZXdCYXNlQ29udHJvbGxlciBleHRlbmRzIEJhc2VDb250cm9sbGVyIHtcblx0QHVzaW5nRXh0ZW5zaW9uKFBsYWNlaG9sZGVyKVxuXHRvUGxhY2Vob2xkZXIhOiBQbGFjZWhvbGRlcjtcblxuXHRAdXNpbmdFeHRlbnNpb24oVmlld1N0YXRlKVxuXHR2aWV3U3RhdGUhOiBWaWV3U3RhdGU7XG5cdHByaXZhdGUgX2FIZWxwZXJNb2RlbHMhOiBhbnlbXTtcblx0cHJpdmF0ZSBvUm91dGVyPzogUm91dGVyO1xuXHRwcml2YXRlIF9vUm91dGVNYXRjaGVkUHJvbWlzZTogYW55O1xuXHRwcml2YXRlIG9UaXRsZUhpZXJhcmNoeUNhY2hlOiBhbnk7XG5cdHByaXZhdGUgYklzQ29tcHV0aW5nVGl0bGVIaWVyYWNoeSA9IGZhbHNlO1xuXG5cdG9uSW5pdCgpIHtcblx0XHRUYWJsZVNpemVIZWxwZXIuaW5pdCgpO1xuXG5cdFx0dGhpcy5fYUhlbHBlck1vZGVscyA9IFtdO1xuXHR9XG5cblx0Z2V0UGxhY2Vob2xkZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMub1BsYWNlaG9sZGVyO1xuXHR9XG5cdGF0dGFjaFJvdXRlTWF0Y2hlcnMoKSB7XG5cdFx0dGhpcy5vUGxhY2Vob2xkZXIuYXR0YWNoUm91dGVNYXRjaGVycygpO1xuXHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGluZ1NlcnZpY2UoKS5hdHRhY2hBZnRlclJvdXRlTWF0Y2hlZCh0aGlzLl9vbkFmdGVyUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0fVxuXHRvbkV4aXQoKSB7XG5cdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb3V0aW5nU2VydmljZSgpLmRldGFjaEFmdGVyUm91dGVNYXRjaGVkKHRoaXMuX29uQWZ0ZXJSb3V0ZU1hdGNoZWQsIHRoaXMpO1xuXHRcdHRoaXMub1JvdXRlciA9IHVuZGVmaW5lZDtcblxuXHRcdFRhYmxlU2l6ZUhlbHBlci5leGl0KCk7XG5cblx0XHQvLyBEZXN0cm95IGFsbCBKU09OIG1vZGVscyBjcmVhdGVkIGR5bmFtaWNhbGx5IGZvciB0aGUgdmlld3Ncblx0XHR0aGlzLl9hSGVscGVyTW9kZWxzLmZvckVhY2goZnVuY3Rpb24gKG9Nb2RlbDogYW55KSB7XG5cdFx0XHRvTW9kZWwuZGVzdHJveSgpO1xuXHRcdH0pO1xuXHR9XG5cdC8qKlxuXHQgKiBDb252ZW5pZW5jZSBtZXRob2QgZm9yIGdldHRpbmcgdGhlIHJlc291cmNlIGJ1bmRsZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyBUaGUgcmVzb3VyY2VNb2RlbCBvZiB0aGUgY29tcG9uZW50XG5cdCAqL1xuXHRnZXRSZXNvdXJjZUJ1bmRsZSgpIHtcblx0XHRyZXR1cm4gKHRoaXMuZ2V0T3duZXJDb21wb25lbnQoKS5nZXRNb2RlbChcImkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKTtcblx0fVxuXHRnZXRSb3V0ZXIoKSB7XG5cdFx0aWYgKCF0aGlzLm9Sb3V0ZXIpIHtcblx0XHRcdHRoaXMub1JvdXRlciA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGVyKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMub1JvdXRlcjtcblx0fVxuXG5cdF9jcmVhdGVIZWxwZXJNb2RlbCgpIHtcblx0XHQvLyBXZSBrZWVwIGEgcmVmZXJlbmNlIG9uIHRoZSBtb2RlbHMgY3JlYXRlZCBkeW5hbWljYWxseSwgYXMgdGhleSBkb24ndCBnZXQgZGVzdHJveWVkXG5cdFx0Ly8gYXV0b21hdGljYWxseSB3aGVuIHRoZSB2aWV3IGlzIGRlc3Ryb3llZC5cblx0XHQvLyBUaGlzIGlzIGRvbmUgZHVyaW5nIG9uRXhpdFxuXHRcdGNvbnN0IG9Nb2RlbCA9IG5ldyBKU09OTW9kZWwoKTtcblx0XHR0aGlzLl9hSGVscGVyTW9kZWxzLnB1c2gob01vZGVsKTtcblxuXHRcdHJldHVybiBvTW9kZWw7XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gd2FpdGluZyBmb3IgdGhlIFJpZ2h0IG1vc3QgdmlldyB0byBiZSByZWFkeS5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkJhc2VDb250cm9sbGVyXG5cdCAqIEBwYXJhbSBvRXZlbnQgUmVmZXJlbmNlIGFuIEV2ZW50IHBhcmFtZXRlciBjb21pbmcgZnJvbSByb3V0ZU1hdGNoZWQgZXZlbnRcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGluZGljYXRpbmcgd2hlbiB0aGUgcmlnaHQgbW9zdCB2aWV3IGlzIHJlYWR5XG5cdCAqL1xuXHR3YWl0Rm9yUmlnaHRNb3N0Vmlld1JlYWR5KG9FdmVudDogYW55KSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Y29uc3QgYUNvbnRhaW5lcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmlld3NcIiksXG5cdFx0XHRcdC8vIFRoZXJlIGNhbiBhbHNvIGJlIHJldXNlIGNvbXBvbmVudHMgaW4gdGhlIHZpZXcsIHJlbW92ZSB0aGVtIGJlZm9yZSBwcm9jZXNzaW5nLlxuXHRcdFx0XHRhRkVDb250YWluZXJzOiBhbnlbXSA9IFtdO1xuXHRcdFx0YUNvbnRhaW5lcnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbnRhaW5lcjogYW55KSB7XG5cdFx0XHRcdGxldCBvVmlldyA9IG9Db250YWluZXI7XG5cdFx0XHRcdGlmIChvQ29udGFpbmVyICYmIG9Db250YWluZXIuZ2V0Q29tcG9uZW50SW5zdGFuY2UpIHtcblx0XHRcdFx0XHRjb25zdCBvQ29tcG9uZW50SW5zdGFuY2UgPSBvQ29udGFpbmVyLmdldENvbXBvbmVudEluc3RhbmNlKCk7XG5cdFx0XHRcdFx0b1ZpZXcgPSBvQ29tcG9uZW50SW5zdGFuY2UuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1ZpZXcgJiYgb1ZpZXcuZ2V0Q29udHJvbGxlcigpICYmIG9WaWV3LmdldENvbnRyb2xsZXIoKS5wYWdlUmVhZHkpIHtcblx0XHRcdFx0XHRhRkVDb250YWluZXJzLnB1c2gob1ZpZXcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG9SaWdodE1vc3RGRVZpZXcgPSBhRkVDb250YWluZXJzW2FGRUNvbnRhaW5lcnMubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAob1JpZ2h0TW9zdEZFVmlldyAmJiBvUmlnaHRNb3N0RkVWaWV3LmdldENvbnRyb2xsZXIoKS5wYWdlUmVhZHkuaXNQYWdlUmVhZHkoKSkge1xuXHRcdFx0XHRyZXNvbHZlKG9SaWdodE1vc3RGRVZpZXcpO1xuXHRcdFx0fSBlbHNlIGlmIChvUmlnaHRNb3N0RkVWaWV3KSB7XG5cdFx0XHRcdG9SaWdodE1vc3RGRVZpZXcuZ2V0Q29udHJvbGxlcigpLnBhZ2VSZWFkeS5hdHRhY2hFdmVudE9uY2UoXCJwYWdlUmVhZHlcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJlc29sdmUob1JpZ2h0TW9zdEZFVmlldyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZG9uZS5cblx0ICogIC0gdXBkYXRlIHRoZSBzaGVsbCB0aXRsZS5cblx0ICogIC0gdXBkYXRlIHRhYmxlIHNjcm9sbC5cblx0ICogIC0gY2FsbCBvblBhZ2VSZWFkeSBvbiB0aGUgcmlnaHRNb3N0Vmlldy5cblx0ICpcblx0ICogQHBhcmFtIG9FdmVudFxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlciNfb25BZnRlclJvdXRlTWF0Y2hlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXJcblx0ICovXG5cdF9vbkFmdGVyUm91dGVNYXRjaGVkKG9FdmVudDogYW55KSB7XG5cdFx0aWYgKCF0aGlzLl9vUm91dGVNYXRjaGVkUHJvbWlzZSkge1xuXHRcdFx0dGhpcy5fb1JvdXRlTWF0Y2hlZFByb21pc2UgPSB0aGlzLndhaXRGb3JSaWdodE1vc3RWaWV3UmVhZHkob0V2ZW50KVxuXHRcdFx0XHQudGhlbigob1ZpZXc6IGFueSkgPT4ge1xuXHRcdFx0XHRcdC8vIFRoZSBhdXRvRm9jdXMgaXMgaW5pdGlhbGx5IGRpc2FibGVkIG9uIHRoZSBuYXZDb250YWluZXIgb3IgdGhlIEZDTCwgc28gdGhhdCB0aGUgZm9jdXMgc3RheXMgb24gdGhlIFNoZWxsIG1lbnVcblx0XHRcdFx0XHQvLyBldmVuIGlmIHRoZSBhcHAgdGFrZXMgYSBsb25nIHRpbWUgdG8gbGF1bmNoXG5cdFx0XHRcdFx0Ly8gVGhlIGZpcnN0IHRpbWUgdGhlIHZpZXcgaXMgZGlzcGxheWVkLCB3ZSBuZWVkIHRvIGVuYWJsZSB0aGUgYXV0b2ZvY3VzIHNvIHRoYXQgaXQncyBtYW5hZ2VkIHByb3Blcmx5IGR1cmluZyBuYXZpZ2F0aW9uXG5cdFx0XHRcdFx0Y29uc3Qgb1Jvb3RDb250cm9sID0gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udGVudCgpWzBdIGFzIGFueTtcblx0XHRcdFx0XHRpZiAob1Jvb3RDb250cm9sICYmIG9Sb290Q29udHJvbC5nZXRBdXRvRm9jdXMgJiYgIW9Sb290Q29udHJvbC5nZXRBdXRvRm9jdXMoKSkge1xuXHRcdFx0XHRcdFx0b1Jvb3RDb250cm9sLnNldFByb3BlcnR5KFwiYXV0b0ZvY3VzXCIsIHRydWUsIHRydWUpOyAvLyBEbyBub3QgbWFyayB0aGUgY29udGFpbmVyIGFzIGludmFsaWQsIG90aGVyd2lzZSBpdCdzIHJlLXJlbmRlcmVkXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0XHRcdFx0dGhpcy5fc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMoKTtcblx0XHRcdFx0XHRpZiAob0FwcENvbXBvbmVudC5nZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpLmdldENhcGFiaWxpdGllcygpLlVTaGVsbCkge1xuXHRcdFx0XHRcdFx0dGhpcy5fY29tcHV0ZVRpdGxlSGllcmFyY2h5KG9WaWV3KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgYkZvcmNlRm9jdXMgPSBvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuaXNGb2N1c0ZvcmNlZCgpO1xuXHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5zZXRGb2N1c0ZvcmNlZChmYWxzZSk7IC8vIHJlc2V0XG5cdFx0XHRcdFx0aWYgKG9WaWV3LmdldENvbnRyb2xsZXIoKSAmJiBvVmlldy5nZXRDb250cm9sbGVyKCkub25QYWdlUmVhZHkgJiYgb1ZpZXcuZ2V0UGFyZW50KCkub25QYWdlUmVhZHkpIHtcblx0XHRcdFx0XHRcdG9WaWV3LmdldFBhcmVudCgpLm9uUGFnZVJlYWR5KHsgZm9yY2VGb2N1czogYkZvcmNlRm9jdXMgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0aGlzLm9uQ29udGFpbmVyUmVhZHkpIHtcblx0XHRcdFx0XHRcdHRoaXMub25Db250YWluZXJSZWFkeSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIkFuIGVycm9yIG9jY3VycyB3aGlsZSBjb21wdXRpbmcgdGhlIHRpdGxlIGhpZXJhcmNoeSBhbmQgY2FsbGluZyBmb2N1cyBtZXRob2RcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX29Sb3V0ZU1hdGNoZWRQcm9taXNlID0gbnVsbDtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgVGl0bGVIaWVyYXJjaHkgY2FjaGUgKCBvciBpbml0aWFsaXplcyBpdCBpZiB1bmRlZmluZWQpLlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlciNfZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXJcblx0ICogQHJldHVybnMgIFRoZSBUaXRsZUhpZXJhcmNoeSBjYWNoZVxuXHQgKi9cblx0X2dldFRpdGxlSGllcmFyY2h5Q2FjaGUoKSB7XG5cdFx0aWYgKCF0aGlzLm9UaXRsZUhpZXJhcmNoeUNhY2hlKSB7XG5cdFx0XHR0aGlzLm9UaXRsZUhpZXJhcmNoeUNhY2hlID0ge307XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLm9UaXRsZUhpZXJhcmNoeUNhY2hlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHRpdGxlSW5mbyBvYmplY3QuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gdGl0bGUgVGhlIGFwcGxpY2F0aW9uJ3MgdGl0bGVcblx0ICogQHBhcmFtIHN1YnRpdGxlIFRoZSBhcHBsaWNhdGlvbidzIHN1YlRpdGxlXG5cdCAqIEBwYXJhbSBzSW50ZW50IFRoZSBpbnRlbnQgcGF0aCB0byBiZSByZWRpcmVjdGVkIHRvXG5cdCAqIEBwYXJhbSBpY29uIFRoZSBhcHBsaWNhdGlvbidzIGljb25cblx0ICogQHJldHVybnMgVGhlIHRpdGxlIGluZm9ybWF0aW9uXG5cdCAqL1xuXHRfY29tcHV0ZVRpdGxlSW5mbyh0aXRsZTogYW55LCBzdWJ0aXRsZTogYW55LCBzSW50ZW50OiBhbnksIGljb24gPSBcIlwiKSB7XG5cdFx0Y29uc3QgYVBhcnRzID0gc0ludGVudC5zcGxpdChcIi9cIik7XG5cdFx0c0ludGVudCA9IFVSSS5kZWNvZGUoc0ludGVudCk7XG5cdFx0aWYgKGFQYXJ0c1thUGFydHMubGVuZ3RoIC0gMV0uaW5kZXhPZihcIj9cIikgPT09IC0xKSB7XG5cdFx0XHRzSW50ZW50ICs9IFwiP3Jlc3RvcmVIaXN0b3J5PXRydWVcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0ludGVudCArPSBcIiZyZXN0b3JlSGlzdG9yeT10cnVlXCI7XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRzdWJ0aXRsZTogc3VidGl0bGUsXG5cdFx0XHRpbnRlbnQ6IHNJbnRlbnQsXG5cdFx0XHRpY29uOiBpY29uXG5cdFx0fTtcblx0fVxuXHRfZm9ybWF0VGl0bGUoZGlzcGxheU1vZGU6IHN0cmluZywgdGl0bGVWYWx1ZTogc3RyaW5nLCB0aXRsZURlc2NyaXB0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGxldCBmb3JtYXR0ZWRUaXRsZSA9IFwiXCI7XG5cdFx0c3dpdGNoIChkaXNwbGF5TW9kZSkge1xuXHRcdFx0Y2FzZSBcIlZhbHVlXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVWYWx1ZX1gO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVWYWx1ZX0gKCR7dGl0bGVEZXNjcmlwdGlvbn0pYDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRmb3JtYXR0ZWRUaXRsZSA9IGAke3RpdGxlRGVzY3JpcHRpb259ICgke3RpdGxlVmFsdWV9KWA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVEZXNjcmlwdGlvbn1gO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0fVxuXHRcdHJldHVybiBmb3JtYXR0ZWRUaXRsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGZXRjaGVzIHRoZSB2YWx1ZSBvZiB0aGUgSGVhZGVySW5mbyB0aXRsZSBmb3IgYSBnaXZlbiBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGggdG8gdGhlIGVudGl0eVxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgY29udGFpbmluZyB0aGUgZm9ybWF0dGVkIHRpdGxlLCBvciBhbiBlbXB0eSBzdHJpbmcgaWYgbm8gSGVhZGVySW5mbyB0aXRsZSBhbm5vdGF0aW9uIGlzIGF2YWlsYWJsZVxuXHQgKi9cblx0YXN5bmMgX2ZldGNoVGl0bGVWYWx1ZShzUGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRvTW9kZWwgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbCgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9BcHBDb21wb25lbnQuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKSxcblx0XHRcdG9CaW5kaW5nVmlld0NvbnRleHQgPSBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpLFxuXHRcdFx0c1ZhbHVlRXhwcmVzc2lvbiA9IEFubm90YXRpb25IZWxwZXIuZm9ybWF0KFxuXHRcdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvL1RpdGxlL1ZhbHVlYCksXG5cdFx0XHRcdHsgY29udGV4dDogb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgYXMgQ29udGV4dCB9XG5cdFx0XHQpO1xuXHRcdGlmICghc1ZhbHVlRXhwcmVzc2lvbikge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShcIlwiKTtcblx0XHR9XG5cdFx0Y29uc3Qgc1RleHRFeHByZXNzaW9uID0gQW5ub3RhdGlvbkhlbHBlci5mb3JtYXQoXG5cdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm8vVGl0bGUvVmFsdWUvJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgXG5cdFx0XHRcdCksXG5cdFx0XHRcdHsgY29udGV4dDogb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgYXMgQ29udGV4dCB9XG5cdFx0XHQpLFxuXHRcdFx0b1Byb3BlcnR5Q29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm8vVGl0bGUvVmFsdWUvJFBhdGhAYCksXG5cdFx0XHRhUHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdLFxuXHRcdFx0b1ZhbHVlRXhwcmVzc2lvbiA9IEJpbmRpbmdQYXJzZXIuY29tcGxleFBhcnNlcihzVmFsdWVFeHByZXNzaW9uKSxcblx0XHRcdG9Qcm9taXNlRm9yRGlzcGxheU1vZGUgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdFx0Y29uc3QgZGlzcGxheU1vZGUgPSBDb21tb25VdGlscy5jb21wdXRlRGlzcGxheU1vZGUob1Byb3BlcnR5Q29udGV4dCk7XG5cdFx0XHRcdHJlc29sdmUoZGlzcGxheU1vZGUpO1xuXHRcdFx0fSk7XG5cdFx0YVByb21pc2VzLnB1c2gob1Byb21pc2VGb3JEaXNwbGF5TW9kZSk7XG5cdFx0Y29uc3Qgc1ZhbHVlUGF0aCA9IG9WYWx1ZUV4cHJlc3Npb24ucGFydHMgPyBvVmFsdWVFeHByZXNzaW9uLnBhcnRzWzBdLnBhdGggOiBvVmFsdWVFeHByZXNzaW9uLnBhdGgsXG5cdFx0XHRmblZhbHVlRm9ybWF0dGVyID0gb1ZhbHVlRXhwcmVzc2lvbi5mb3JtYXR0ZXIsXG5cdFx0XHRvVmFsdWVCaW5kaW5nID0gb01vZGVsLmJpbmRQcm9wZXJ0eShzVmFsdWVQYXRoLCBvQmluZGluZ1ZpZXdDb250ZXh0KTtcblx0XHRvVmFsdWVCaW5kaW5nLmluaXRpYWxpemUoKTtcblx0XHRjb25zdCBvUHJvbWlzZUZvclRpdGxlVmFsdWUgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdGNvbnN0IGZuQ2hhbmdlID0gZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdGNvbnN0IHNUYXJnZXRWYWx1ZSA9IGZuVmFsdWVGb3JtYXR0ZXIgPyBmblZhbHVlRm9ybWF0dGVyKG9FdmVudC5nZXRTb3VyY2UoKS5nZXRWYWx1ZSgpKSA6IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRWYWx1ZSgpO1xuXG5cdFx0XHRcdG9WYWx1ZUJpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHRcdFx0cmVzb2x2ZShzVGFyZ2V0VmFsdWUpO1xuXHRcdFx0fTtcblx0XHRcdG9WYWx1ZUJpbmRpbmcuYXR0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHR9KTtcblx0XHRhUHJvbWlzZXMucHVzaChvUHJvbWlzZUZvclRpdGxlVmFsdWUpO1xuXG5cdFx0aWYgKHNUZXh0RXhwcmVzc2lvbikge1xuXHRcdFx0Y29uc3Qgb1RleHRFeHByZXNzaW9uID0gQmluZGluZ1BhcnNlci5jb21wbGV4UGFyc2VyKHNUZXh0RXhwcmVzc2lvbik7XG5cdFx0XHRsZXQgc1RleHRQYXRoID0gb1RleHRFeHByZXNzaW9uLnBhcnRzID8gb1RleHRFeHByZXNzaW9uLnBhcnRzWzBdLnBhdGggOiBvVGV4dEV4cHJlc3Npb24ucGF0aDtcblx0XHRcdHNUZXh0UGF0aCA9IHNWYWx1ZVBhdGgubGFzdEluZGV4T2YoXCIvXCIpID4gLTEgPyBgJHtzVmFsdWVQYXRoLnNsaWNlKDAsIHNWYWx1ZVBhdGgubGFzdEluZGV4T2YoXCIvXCIpKX0vJHtzVGV4dFBhdGh9YCA6IHNUZXh0UGF0aDtcblxuXHRcdFx0Y29uc3QgZm5UZXh0Rm9ybWF0dGVyID0gb1RleHRFeHByZXNzaW9uLmZvcm1hdHRlcixcblx0XHRcdFx0b1RleHRCaW5kaW5nID0gb01vZGVsLmJpbmRQcm9wZXJ0eShzVGV4dFBhdGgsIG9CaW5kaW5nVmlld0NvbnRleHQpO1xuXHRcdFx0b1RleHRCaW5kaW5nLmluaXRpYWxpemUoKTtcblx0XHRcdGNvbnN0IG9Qcm9taXNlRm9yVGl0bGVUZXh0ID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6IChkZXNjcmlwdGlvbjogYW55KSA9PiB2b2lkKSB7XG5cdFx0XHRcdGNvbnN0IGZuQ2hhbmdlID0gZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1RhcmdldFRleHQgPSBmblRleHRGb3JtYXR0ZXIgPyBmblRleHRGb3JtYXR0ZXIob0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCkpIDogb0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCk7XG5cblx0XHRcdFx0XHRvVGV4dEJpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHRcdFx0XHRyZXNvbHZlKHNUYXJnZXRUZXh0KTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRvVGV4dEJpbmRpbmcuYXR0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHRcdH0pO1xuXHRcdFx0YVByb21pc2VzLnB1c2gob1Byb21pc2VGb3JUaXRsZVRleHQpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgdGl0bGVJbmZvOiBhbnlbXSA9IGF3YWl0IFByb21pc2UuYWxsKGFQcm9taXNlcyk7XG5cdFx0XHRsZXQgZm9ybWF0dGVkVGl0bGUgPSBcIlwiO1xuXHRcdFx0aWYgKHR5cGVvZiB0aXRsZUluZm8gIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0Zm9ybWF0dGVkVGl0bGUgPSB0aGlzLl9mb3JtYXRUaXRsZSh0aXRsZUluZm9bMF0sIHRpdGxlSW5mb1sxXSwgdGl0bGVJbmZvWzJdKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmb3JtYXR0ZWRUaXRsZTtcblx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBmZXRjaGluZyB0aGUgdGl0bGUgZnJvbSB0aGUgaGVhZGVyIGluZm8gOlwiICsgZXJyb3IpO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdF9nZXRBcHBTcGVjaWZpY0hhc2goKSB7XG5cdFx0Ly8gSGFzaENoYW5nZWQgaXNTaGVsbE5hdmlnYXRpb25IYXNoQ2hhbmdlclxuXHRcdGNvbnN0IGhhc2hDaGFuZ2VyID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBIYXNoQ2hhbmdlciB8IChIYXNoQ2hhbmdlciAmIHsgaHJlZkZvckFwcFNwZWNpZmljSGFzaDogRnVuY3Rpb24gfSk7XG5cdFx0cmV0dXJuIFwiaHJlZkZvckFwcFNwZWNpZmljSGFzaFwiIGluIGhhc2hDaGFuZ2VyID8gaGFzaENoYW5nZXIuaHJlZkZvckFwcFNwZWNpZmljSGFzaChcIlwiKSA6IFwiIy9cIjtcblx0fVxuXG5cdF9nZXRIYXNoKCkge1xuXHRcdHJldHVybiBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGl0bGVJbmZvcm1hdGlvbiBmcm9tIGEgcGF0aC5cblx0ICogSXQgdXBkYXRlcyB0aGUgY2FjaGUgdG8gc3RvcmUgdGl0bGUgaW5mb3JtYXRpb24gaWYgbmVjZXNzYXJ5XG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkJhc2VDb250cm9sbGVyI2dldFRpdGxlSW5mb0Zyb21QYXRoXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlclxuXHQgKiBAcGFyYW0geyp9IHNQYXRoIHBhdGggb2YgdGhlIGNvbnRleHQgdG8gcmV0cmlldmUgdGl0bGUgaW5mb3JtYXRpb24gZnJvbSBNZXRhTW9kZWxcblx0ICogQHJldHVybnMge1Byb21pc2V9ICBvVGl0bGVpbmZvcm1hdGlvbiByZXR1cm5lZCBhcyBwcm9taXNlXG5cdCAqL1xuXG5cdGdldFRpdGxlSW5mb0Zyb21QYXRoKHNQYXRoOiBhbnkpIHtcblx0XHRjb25zdCBvVGl0bGVIaWVyYXJjaHlDYWNoZSA9IHRoaXMuX2dldFRpdGxlSGllcmFyY2h5Q2FjaGUoKTtcblxuXHRcdGlmIChvVGl0bGVIaWVyYXJjaHlDYWNoZVtzUGF0aF0pIHtcblx0XHRcdC8vIFRoZSB0aXRsZSBpbmZvIGlzIGFscmVhZHkgc3RvcmVkIGluIHRoZSBjYWNoZVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShvVGl0bGVIaWVyYXJjaHlDYWNoZVtzUGF0aF0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IHNFbnRpdHlQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChzUGF0aCk7XG5cdFx0Y29uc3Qgc1R5cGVOYW1lID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvL1R5cGVOYW1lYCk7XG5cdFx0Y29uc3Qgc0FwcFNwZWNpZmljSGFzaCA9IHRoaXMuX2dldEFwcFNwZWNpZmljSGFzaCgpO1xuXHRcdGNvbnN0IHNJbnRlbnQgPSBzQXBwU3BlY2lmaWNIYXNoICsgc1BhdGguc2xpY2UoMSk7XG5cdFx0cmV0dXJuIHRoaXMuX2ZldGNoVGl0bGVWYWx1ZShzUGF0aCkudGhlbigoc1RpdGxlOiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IG9UaXRsZUluZm8gPSB0aGlzLl9jb21wdXRlVGl0bGVJbmZvKHNUeXBlTmFtZSwgc1RpdGxlLCBzSW50ZW50KTtcblx0XHRcdG9UaXRsZUhpZXJhcmNoeUNhY2hlW3NQYXRoXSA9IG9UaXRsZUluZm87XG5cdFx0XHRyZXR1cm4gb1RpdGxlSW5mbztcblx0XHR9KTtcblx0fVxuXHQvKipcblx0ICogRW5zdXJlIHRoYXQgdGhlIHVzaGVsbCBzZXJ2aWNlIHJlY2VpdmVzIGFsbCBlbGVtZW50c1xuXHQgKiAodGl0bGUsIHN1YnRpdGxlLCBpbnRlbnQsIGljb24pIGFzIHN0cmluZ3MuXG5cdCAqXG5cdCAqIEFubm90YXRpb24gSGVhZGVySW5mbyBhbGxvd3MgZm9yIGJpbmRpbmcgb2YgdGl0bGUgYW5kIGRlc2NyaXB0aW9uXG5cdCAqICh3aGljaCBhcmUgdXNlZCBoZXJlIGFzIHRpdGxlIGFuZCBzdWJ0aXRsZSkgdG8gYW55IGVsZW1lbnQgaW4gdGhlIGVudGl0eVxuXHQgKiAoYmVpbmcgcG9zc2libHkgdHlwZXMgbGlrZSBib29sZWFuLCB0aW1lc3RhbXAsIGRvdWJsZSwgZXRjLilcblx0ICpcblx0ICogQ3JlYXRlcyBhIG5ldyBoaWVyYXJjaHkgYW5kIGNvbnZlcnRzIG5vbi1zdHJpbmcgdHlwZXMgdG8gc3RyaW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gYUhpZXJhcmNoeSBTaGVsbCB0aXRsZSBoaWVyYXJjaHlcblx0ICogQHJldHVybnMgQ29weSBvZiBzaGVsbCB0aXRsZSBoaWVyYXJjaHkgY29udGFpbmluZyBhbGwgZWxlbWVudHMgYXMgc3RyaW5nc1xuXHQgKi9cblx0X2Vuc3VyZUhpZXJhcmNoeUVsZW1lbnRzQXJlU3RyaW5ncyhhSGllcmFyY2h5OiBhbnkpIHtcblx0XHRjb25zdCBhSGllcmFyY2h5U2hlbGwgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGxldmVsIGluIGFIaWVyYXJjaHkpIHtcblx0XHRcdGNvbnN0IG9IaWVyYXJjaHkgPSBhSGllcmFyY2h5W2xldmVsXTtcblx0XHRcdGNvbnN0IG9TaGVsbEhpZXJhcmNoeTogYW55ID0ge307XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBvSGllcmFyY2h5KSB7XG5cdFx0XHRcdG9TaGVsbEhpZXJhcmNoeVtrZXldID0gdHlwZW9mIG9IaWVyYXJjaHlba2V5XSAhPT0gXCJzdHJpbmdcIiA/IFN0cmluZyhvSGllcmFyY2h5W2tleV0pIDogb0hpZXJhcmNoeVtrZXldO1xuXHRcdFx0fVxuXHRcdFx0YUhpZXJhcmNoeVNoZWxsLnB1c2gob1NoZWxsSGllcmFyY2h5KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFIaWVyYXJjaHlTaGVsbDtcblx0fVxuXG5cdF9nZXRUYXJnZXRUeXBlRnJvbUhhc2goc0hhc2g6IGFueSkge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdGxldCBzVGFyZ2V0VHlwZSA9IFwiXCI7XG5cblx0XHRjb25zdCBhUm91dGVzID0gb0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLnVpNVwiKS5yb3V0aW5nPy5yb3V0ZXMgPz8gW107XG5cdFx0Zm9yIChjb25zdCByb3V0ZSBvZiBhUm91dGVzKSB7XG5cdFx0XHRjb25zdCBvUm91dGUgPSBvQXBwQ29tcG9uZW50LmdldFJvdXRlcigpLmdldFJvdXRlKHJvdXRlLm5hbWUpO1xuXHRcdFx0aWYgKG9Sb3V0ZT8ubWF0Y2goc0hhc2gpKSB7XG5cdFx0XHRcdGNvbnN0IHNUYXJnZXQgPSBBcnJheS5pc0FycmF5KHJvdXRlLnRhcmdldCkgPyByb3V0ZS50YXJnZXRbMF0gOiByb3V0ZS50YXJnZXQ7XG5cdFx0XHRcdHNUYXJnZXRUeXBlID0gKG9BcHBDb21wb25lbnQuZ2V0Um91dGVyKCkuZ2V0VGFyZ2V0KHNUYXJnZXQpIGFzIGFueSkuX29PcHRpb25zLm5hbWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBzVGFyZ2V0VHlwZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHVwZGF0ZXMgdGhlIHNoZWxsIHRpdGxlIGFmdGVyIGVhY2ggbmF2aWdhdGlvbi5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkJhc2VDb250cm9sbGVyXG5cdCAqIEBwYXJhbSBvVmlldyBUaGUgY3VycmVudCB2aWV3XG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIG1lbnUgaXMgZmlsbGVkIHByb3Blcmx5XG5cdCAqL1xuXHRfY29tcHV0ZVRpdGxlSGllcmFyY2h5KG9WaWV3OiBhbnkpIHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdG9Db250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdG9DdXJyZW50UGFnZSA9IG9WaWV3LmdldFBhcmVudCgpLFxuXHRcdFx0YVRpdGxlSW5mb3JtYXRpb25Qcm9taXNlcyA9IFtdLFxuXHRcdFx0c0FwcFNwZWNpZmljSGFzaCA9IHRoaXMuX2dldEFwcFNwZWNpZmljSGFzaCgpLFxuXHRcdFx0bWFuaWZlc3RBcHBTZXR0aW5ncyA9IG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcInNhcC5hcHBcIiksXG5cdFx0XHRzQXBwVGl0bGUgPSBtYW5pZmVzdEFwcFNldHRpbmdzLnRpdGxlIHx8IFwiXCIsXG5cdFx0XHRzQXBwU3ViVGl0bGUgPSBtYW5pZmVzdEFwcFNldHRpbmdzLnN1YlRpdGxlIHx8IFwiXCIsXG5cdFx0XHRhcHBJY29uID0gbWFuaWZlc3RBcHBTZXR0aW5ncy5pY29uIHx8IFwiXCI7XG5cdFx0bGV0IG9QYWdlVGl0bGVJbmZvcm1hdGlvbjogYW55LCBzTmV3UGF0aDtcblxuXHRcdGlmIChvQ3VycmVudFBhZ2UgJiYgb0N1cnJlbnRQYWdlLl9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbikge1xuXHRcdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRcdC8vIElmIHRoZSBmaXJzdCBwYWdlIG9mIHRoZSBhcHBsaWNhdGlvbiBpcyBhIExSLCB1c2UgdGhlIHRpdGxlIGFuZCBzdWJ0aXRsZSBmcm9tIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHRpZiAodGhpcy5fZ2V0VGFyZ2V0VHlwZUZyb21IYXNoKFwiXCIpID09PSBcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydFwiKSB7XG5cdFx0XHRcdFx0YVRpdGxlSW5mb3JtYXRpb25Qcm9taXNlcy5wdXNoKFxuXHRcdFx0XHRcdFx0UHJvbWlzZS5yZXNvbHZlKHRoaXMuX2NvbXB1dGVUaXRsZUluZm8oc0FwcFRpdGxlLCBzQXBwU3ViVGl0bGUsIHNBcHBTcGVjaWZpY0hhc2gsIGFwcEljb24pKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBUaGVuIG1hbmFnZSBvdGhlciBwYWdlc1xuXHRcdFx0XHRzTmV3UGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRcdFx0Y29uc3QgYVBhdGhQYXJ0cyA9IHNOZXdQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0bGV0IHNQYXRoID0gXCJcIjtcblxuXHRcdFx0XHRhUGF0aFBhcnRzLnNoaWZ0KCk7IC8vIFJlbW92ZSB0aGUgZmlyc3Qgc2VnbWVudCAoZW1wdHkgc3RyaW5nKSBhcyBpdCBoYXMgYmVlbiBtYW5hZ2VkIGFib3ZlXG5cdFx0XHRcdGFQYXRoUGFydHMucG9wKCk7IC8vIFJlbW92ZSB0aGUgbGFzdCBzZWdtZW50IGFzIGl0IGNvcnJlc3BvbmRzIHRvIHRoZSBjdXJyZW50IHBhZ2UgYW5kIHNob3VsZG4ndCBhcHBlYXIgaW4gdGhlIG1lbnVcblxuXHRcdFx0XHRhUGF0aFBhcnRzLmZvckVhY2goKHNQYXRoUGFydDogYW55KSA9PiB7XG5cdFx0XHRcdFx0c1BhdGggKz0gYC8ke3NQYXRoUGFydH1gO1xuXHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRcdFx0c1BhcmFtZXRlclBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKSxcblx0XHRcdFx0XHRcdGJJc1BhcmFtZXRlcml6ZWQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGFyYW1ldGVyUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCk7XG5cdFx0XHRcdFx0aWYgKCFiSXNQYXJhbWV0ZXJpemVkKSB7XG5cdFx0XHRcdFx0XHRhVGl0bGVJbmZvcm1hdGlvblByb21pc2VzLnB1c2godGhpcy5nZXRUaXRsZUluZm9Gcm9tUGF0aChzUGF0aCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEN1cnJlbnQgcGFnZVxuXHRcdFx0b1BhZ2VUaXRsZUluZm9ybWF0aW9uID0gb0N1cnJlbnRQYWdlLl9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbigpO1xuXHRcdFx0b1BhZ2VUaXRsZUluZm9ybWF0aW9uID0gdGhpcy5fY29tcHV0ZVRpdGxlSW5mbyhcblx0XHRcdFx0b1BhZ2VUaXRsZUluZm9ybWF0aW9uLnRpdGxlLFxuXHRcdFx0XHRvUGFnZVRpdGxlSW5mb3JtYXRpb24uc3VidGl0bGUsXG5cdFx0XHRcdHNBcHBTcGVjaWZpY0hhc2ggKyB0aGlzLl9nZXRIYXNoKClcblx0XHRcdCk7XG5cblx0XHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0XHR0aGlzLl9nZXRUaXRsZUhpZXJhcmNoeUNhY2hlKClbc05ld1BhdGhdID0gb1BhZ2VUaXRsZUluZm9ybWF0aW9uO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZSgpW3NBcHBTcGVjaWZpY0hhc2hdID0gb1BhZ2VUaXRsZUluZm9ybWF0aW9uO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRhVGl0bGVJbmZvcm1hdGlvblByb21pc2VzLnB1c2goUHJvbWlzZS5yZWplY3QoXCJUaXRsZSBpbmZvcm1hdGlvbiBtaXNzaW5nIGluIEhlYWRlckluZm9cIikpO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYVRpdGxlSW5mb3JtYXRpb25Qcm9taXNlcylcblx0XHRcdC50aGVuKChhVGl0bGVJbmZvSGllcmFyY2h5OiBhbnlbXSkgPT4ge1xuXHRcdFx0XHQvLyB3b3JrYXJvdW5kIGZvciBzaGVsbCB3aGljaCBpcyBleHBlY3RpbmcgYWxsIGVsZW1lbnRzIGJlaW5nIG9mIHR5cGUgc3RyaW5nXG5cdFx0XHRcdGNvbnN0IGFUaXRsZUluZm9IaWVyYXJjaHlTaGVsbCA9IHRoaXMuX2Vuc3VyZUhpZXJhcmNoeUVsZW1lbnRzQXJlU3RyaW5ncyhhVGl0bGVJbmZvSGllcmFyY2h5KSxcblx0XHRcdFx0XHRzVGl0bGUgPSBvUGFnZVRpdGxlSW5mb3JtYXRpb24udGl0bGU7XG5cdFx0XHRcdGFUaXRsZUluZm9IaWVyYXJjaHlTaGVsbC5yZXZlcnNlKCk7XG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEhpZXJhcmNoeShhVGl0bGVJbmZvSGllcmFyY2h5U2hlbGwpO1xuXG5cdFx0XHRcdHRoaXMuX3NldFNoZWxsTWVudVRpdGxlKG9BcHBDb21wb25lbnQsIHNUaXRsZSwgc0FwcFRpdGxlKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKHNFcnJvck1lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3Ioc0Vycm9yTWVzc2FnZSk7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmJJc0NvbXB1dGluZ1RpdGxlSGllcmFjaHkgPSBmYWxzZTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKHNFcnJvck1lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3Ioc0Vycm9yTWVzc2FnZSk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0Y2FsY3VsYXRlTGF5b3V0KGlOZXh0RkNMTGV2ZWw6IG51bWJlciwgc0hhc2g6IHN0cmluZywgc1Byb3Bvc2VkTGF5b3V0OiBzdHJpbmcgfCB1bmRlZmluZWQsIGtlZXBDdXJyZW50TGF5b3V0ID0gZmFsc2UpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBhZnRlciBhIHZpZXcgaGFzIGJlZW4gYm91bmQgdG8gYSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgdGhhdCBoYXMgYmVlbiBib3VuZCB0byBhIHZpZXdcblx0ICovXG5cdG9uQ29udGV4dEJvdW5kVG9WaWV3KG9Db250ZXh0OiBhbnkpIHtcblx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdGNvbnN0IHNEZWVwZXN0UGF0aCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwiaW50ZXJuYWxcIikuZ2V0UHJvcGVydHkoXCIvZGVlcGVzdFBhdGhcIiksXG5cdFx0XHRcdHNWaWV3Q29udGV4dFBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cblx0XHRcdGlmICghc0RlZXBlc3RQYXRoIHx8IHNEZWVwZXN0UGF0aC5pbmRleE9mKHNWaWV3Q29udGV4dFBhdGgpICE9PSAwKSB7XG5cdFx0XHRcdC8vIFRoZXJlIHdhcyBubyBwcmV2aW91cyB2YWx1ZSBmb3IgdGhlIGRlZXBlc3QgcmVhY2hlZCBwYXRoLCBvciB0aGUgcGF0aFxuXHRcdFx0XHQvLyBmb3IgdGhlIHZpZXcgaXNuJ3QgYSBzdWJwYXRoIG9mIHRoZSBwcmV2aW91cyBkZWVwZXN0IHBhdGggLS0+IHVwZGF0ZVxuXHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwpLnNldFByb3BlcnR5KFwiL2RlZXBlc3RQYXRoXCIsIHNWaWV3Q29udGV4dFBhdGgsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRkaXNwbGF5RXJyb3JQYWdlKHNFcnJvck1lc3NhZ2U6IGFueSwgbVBhcmFtZXRlcnM6IGFueSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRkZW5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHR9XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHR1cGRhdGVVSVN0YXRlRm9yVmlldyhvVmlldzogYW55LCBGQ0xMZXZlbDogYW55KSB7XG5cdFx0Ly8gVG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGdldEluc3RhbmNlZFZpZXdzKCk6IFhNTFZpZXdbXSB7XG5cdFx0cmV0dXJuIFtdO1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRlblxuXHR9XG5cdF9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcygpOiB2b2lkIHtcblx0XHQvLyBUbyBiZSBvdmVycmlkZW5cblx0fVxuXHRpc0ZjbEVuYWJsZWQoKTogdGhpcyBpcyBGY2xDb250cm9sbGVyIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdF9zZXRTaGVsbE1lbnVUaXRsZShvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsIHNUaXRsZTogc3RyaW5nLCBzQXBwVGl0bGU6IHN0cmluZyk6IHZvaWQge1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRlbiBieSBGY2xDb250cm9sbGVyXG5cdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0VGl0bGUoc1RpdGxlKTtcblx0fVxuXG5cdGdldEFwcENvbnRlbnRDb250YWluZXIoKTogTmF2Q29udGFpbmVyIHwgRmxleGlibGVDb2x1bW5MYXlvdXQge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdGNvbnN0IGFwcENvbnRlbnRJZCA9IG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcInNhcC51aTVcIikucm91dGluZz8uY29uZmlnPy5jb250cm9sSWQgPz8gXCJhcHBDb250ZW50XCI7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmJ5SWQoYXBwQ29udGVudElkKSBhcyBOYXZDb250YWluZXIgfCBGbGV4aWJsZUNvbHVtbkxheW91dDtcblx0fVxufVxuaW50ZXJmYWNlIFJvb3RWaWV3QmFzZUNvbnRyb2xsZXIge1xuXHRvbkNvbnRhaW5lclJlYWR5PygpOiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBSb290Vmlld0Jhc2VDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O01Bc0JNQSxzQkFBc0IsV0FEM0JDLGNBQWMsQ0FBQyw2Q0FBNkMsQ0FBQyxVQUU1REMsY0FBYyxDQUFDQyxXQUFXLENBQUMsVUFHM0JELGNBQWMsQ0FBQ0UsU0FBUyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUEsTUFNbEJDLHlCQUF5QixHQUFHLEtBQUs7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQUV6Q0MsTUFBTSxHQUFOLGtCQUFTO01BQ1JDLGVBQWUsQ0FBQ0MsSUFBSSxFQUFFO01BRXRCLElBQUksQ0FBQ0MsY0FBYyxHQUFHLEVBQUU7SUFDekIsQ0FBQztJQUFBLE9BRURDLGNBQWMsR0FBZCwwQkFBaUI7TUFD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