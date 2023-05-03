/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/Manage", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/MessageHandler", "sap/fe/core/controllerextensions/PageReady", "sap/fe/core/controllerextensions/Paginator", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/PageController", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/Utils", "sap/fe/navigation/SelectionVariant", "sap/fe/templates/ObjectPage/ExtensionAPI", "sap/fe/templates/TableScroller", "sap/m/InstanceManager", "sap/m/Link", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/odata/v4/ODataListBinding", "./overrides/IntentBasedNavigation", "./overrides/InternalRouting", "./overrides/MessageHandler", "./overrides/Paginator", "./overrides/Share", "./overrides/ViewState"], function (Log, merge, ActionRuntime, CommonUtils, BusyLocker, ActivitySync, Manage, draft, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, MassEdit, MessageHandler, PageReady, Paginator, Placeholder, Share, ViewState, ClassSupport, ModelHelper, PageController, CommonHelper, DelegateUtil, TableUtils, SelectionVariant, ExtensionAPI, TableScroller, InstanceManager, Link, MessageBox, Core, OverrideExecution, ODataListBinding, IntentBasedNavigationOverride, InternalRoutingOverride, MessageHandlerOverride, PaginatorOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var showUserDetails = Manage.showUserDetails;
  var openManageDialog = Manage.openManageDialog;
  var isConnected = ActivitySync.isConnected;
  var disconnect = ActivitySync.disconnect;
  var connect = ActivitySync.connect;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ObjectPageController = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ObjectPageController"), _dec2 = usingExtension(Placeholder), _dec3 = usingExtension(Share.override(ShareOverrides)), _dec4 = usingExtension(InternalRouting.override(InternalRoutingOverride)), _dec5 = usingExtension(Paginator.override(PaginatorOverride)), _dec6 = usingExtension(MessageHandler.override(MessageHandlerOverride)), _dec7 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec8 = usingExtension(InternalIntentBasedNavigation.override({
    getNavigationMode: function () {
      const bIsStickyEditMode = this.getView().getController().getStickyEditMode && this.getView().getController().getStickyEditMode();
      return bIsStickyEditMode ? "explace" : undefined;
    }
  })), _dec9 = usingExtension(ViewState.override(ViewStateOverrides)), _dec10 = usingExtension(PageReady.override({
    isContextExpected: function () {
      return true;
    }
  })), _dec11 = usingExtension(MassEdit), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ObjectPageController, _PageController);
    function ObjectPageController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "placeholder", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_routing", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "paginator", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pageReady", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor10, _assertThisInitialized(_this));
      _this.handlers = {
        /**
         * Invokes the page primary action on press of Ctrl+Enter.
         *
         * @param oController The page controller
         * @param oView
         * @param oContext Context for which the action is called
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @param [mConditions] Contains the following attributes:
         * @param [mConditions.positiveActionVisible] The visibility of sematic positive action
         * @param [mConditions.positiveActionEnabled] The enablement of semantic positive action
         * @param [mConditions.editActionVisible] The Edit button visibility
         * @param [mConditions.editActionEnabled] The enablement of Edit button
         * @ui5-restricted
         * @final
         */
        onPrimaryAction(oController, oView, oContext, sActionName, mParameters, mConditions) {
          const iViewLevel = oController.getView().getViewData().viewLevel,
            oObjectPage = oController._getObjectPageLayoutControl();
          if (mConditions.positiveActionVisible) {
            if (mConditions.positiveActionEnabled) {
              oController.handlers.onCallAction(oView, sActionName, mParameters);
            }
          } else if (mConditions.editActionVisible) {
            if (mConditions.editActionEnabled) {
              oController._editDocument(oContext);
            }
          } else if (iViewLevel === 1 && oObjectPage.getModel("ui").getProperty("/isEditable")) {
            oController._saveDocument(oContext);
          } else if (oObjectPage.getModel("ui").getProperty("/isEditable")) {
            oController._applyDocument(oContext);
          }
        },
        onTableContextChange(oEvent) {
          const oSource = oEvent.getSource();
          let oTable;
          this._findTables().some(function (_oTable) {
            if (_oTable.getRowBinding() === oSource) {
              oTable = _oTable;
              return true;
            }
            return false;
          });
          const oCurrentActionPromise = this._editFlow.getCurrentActionPromise();
          if (oCurrentActionPromise) {
            let aTableContexts;
            if (oTable.getType().getMetadata().isA("sap.ui.mdc.table.GridTableType")) {
              aTableContexts = oSource.getContexts(0);
            } else {
              aTableContexts = oSource.getCurrentContexts();
            }
            //if contexts are not fully loaded the getcontexts function above will trigger a new change event call
            if (!aTableContexts[0]) {
              return;
            }
            oCurrentActionPromise.then(oActionResponse => {
              if (!oActionResponse || oActionResponse.controlId !== oTable.sId) {
                return;
              }
              const oActionData = oActionResponse.oData;
              const aKeys = oActionResponse.keys;
              let iNewItemp = -1;
              aTableContexts.find(function (oTableContext, i) {
                const oTableData = oTableContext.getObject();
                const bCompare = aKeys.every(function (sKey) {
                  return oTableData[sKey] === oActionData[sKey];
                });
                if (bCompare) {
                  iNewItemp = i;
                }
                return bCompare;
              });
              if (iNewItemp !== -1) {
                const aDialogs = InstanceManager.getOpenDialogs();
                const oDialog = aDialogs.length > 0 ? aDialogs.find(dialog => dialog.data("FullScreenDialog") !== true) : null;
                if (oDialog) {
                  // by design, a sap.m.dialog set the focus to the previous focused element when closing.
                  // we should wait for the dialog to be close before to focus another element
                  oDialog.attachEventOnce("afterClose", function () {
                    oTable.focusRow(iNewItemp, true);
                  });
                } else {
                  oTable.focusRow(iNewItemp, true);
                }
                this._editFlow.deleteCurrentActionPromise();
              }
            }).catch(function (err) {
              Log.error(`An error occurs while scrolling to the newly created Item: ${err}`);
            });
          }
          // fire ModelContextChange on the message button whenever the table context changes
          this.messageButton.fireModelContextChange();
        },
        /**
         * Invokes an action - bound/unbound and sets the page dirty.
         *
         * @param oView
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @returns The action promise
         * @ui5-restricted
         * @final
         */
        onCallAction(oView, sActionName, mParameters) {
          const oController = oView.getController();
          return oController.editFlow.invokeAction(sActionName, mParameters).then(oController._showMessagePopover.bind(oController, undefined)).catch(oController._showMessagePopover.bind(oController));
        },
        onDataPointTitlePressed(oController, oSource, oManifestOutbound, sControlConfig, sCollectionPath) {
          oManifestOutbound = typeof oManifestOutbound === "string" ? JSON.parse(oManifestOutbound) : oManifestOutbound;
          const oTargetInfo = oManifestOutbound[sControlConfig],
            aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oTargetInfo),
            oDataPointOrChartBindingContext = oSource.getBindingContext(),
            sMetaPath = oDataPointOrChartBindingContext.getModel().getMetaModel().getMetaPath(oDataPointOrChartBindingContext.getPath());
          let aNavigationData = oController._getChartContextData(oDataPointOrChartBindingContext, sCollectionPath);
          let additionalNavigationParameters;
          aNavigationData = aNavigationData.map(function (oNavigationData) {
            return {
              data: oNavigationData,
              metaPath: sMetaPath + (sCollectionPath ? `/${sCollectionPath}` : "")
            };
          });
          if (oTargetInfo && oTargetInfo.parameters) {
            const oParams = oTargetInfo.parameters && oController._intentBasedNavigation.getOutboundParams(oTargetInfo.parameters);
            if (Object.keys(oParams).length > 0) {
              additionalNavigationParameters = oParams;
            }
          }
          if (oTargetInfo && oTargetInfo.semanticObject && oTargetInfo.action) {
            oController._intentBasedNavigation.navigate(oTargetInfo.semanticObject, oTargetInfo.action, {
              navigationContexts: aNavigationData,
              semanticObjectMapping: aSemanticObjectMapping,
              additionalNavigationParameters: additionalNavigationParameters
            });
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onNavigateChange(oEvent) {
          //will be called always when we click on a section tab
          this.getExtensionAPI().updateAppState();
          this.bSectionNavigated = true;
          const oInternalModelContext = this.getView().getBindingContext("internal");
          const oObjectPage = this._getObjectPageLayoutControl();
          if (oObjectPage.getModel("ui").getProperty("/isEditable") && this.getView().getViewData().sectionLayout === "Tabs" && oInternalModelContext.getProperty("errorNavigationSectionFlag") === false) {
            const oSubSection = oEvent.getParameter("subSection");
            this._updateFocusInEditMode([oSubSection]);
          }
        },
        onVariantSelected: function () {
          this.getExtensionAPI().updateAppState();
        },
        onVariantSaved: function () {
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save
          setTimeout(() => {
            this.getExtensionAPI().updateAppState();
          }, 500);
        },
        navigateToSubSection: function (oController, vDetailConfig) {
          const oDetailConfig = typeof vDetailConfig === "string" ? JSON.parse(vDetailConfig) : vDetailConfig;
          const oObjectPage = oController.getView().byId("fe::ObjectPage");
          let oSection;
          let oSubSection;
          if (oDetailConfig.sectionId) {
            oSection = oController.getView().byId(oDetailConfig.sectionId);
            oSubSection = oDetailConfig.subSectionId ? oController.getView().byId(oDetailConfig.subSectionId) : oSection && oSection.getSubSections() && oSection.getSubSections()[0];
          } else if (oDetailConfig.subSectionId) {
            oSubSection = oController.getView().byId(oDetailConfig.subSectionId);
            oSection = oSubSection && oSubSection.getParent();
          }
          if (!oSection || !oSubSection || !oSection.getVisible() || !oSubSection.getVisible()) {
            oController.getView().getModel("sap.fe.i18n").getResourceBundle().then(function (oResourceBundle) {
              const sTitle = CommonUtils.getTranslatedText("C_ROUTING_NAVIGATION_DISABLED_TITLE", oResourceBundle, undefined, oController.getView().getViewData().entitySet);
              Log.error(sTitle);
              MessageBox.error(sTitle);
            }).catch(function (error) {
              Log.error(error);
            });
          } else {
            oObjectPage.scrollToSection(oSubSection.getId());
            // trigger iapp state change
            oObjectPage.fireNavigate({
              section: oSection,
              subSection: oSubSection
            });
          }
        },
        onStateChange() {
          this.getExtensionAPI().updateAppState();
        },
        closeOPMessageStrip: function () {
          this.getExtensionAPI().hideMessage();
        }
      };
      return _this;
    }
    var _proto = ObjectPageController.prototype;
    _proto.getExtensionAPI = function getExtensionAPI(sId) {
      if (sId) {
        // to allow local ID usage for custom pages we'll create/return own instances for custom sections
        this.mCustomSectionExtensionAPIs = this.mCustomSectionExtensionAPIs || {};
        if (!this.mCustomSectionExtensionAPIs[sId]) {
          this.mCustomSectionExtensionAPIs[sId] = new ExtensionAPI(this, sId);
        }
        return this.mCustomSectionExtensionAPIs[sId];
      } else {
        if (!this.extensionAPI) {
          this.extensionAPI = new ExtensionAPI(this);
        }
        return this.extensionAPI;
      }
    };
    _proto.onInit = function onInit() {
      _PageController.prototype.onInit.call(this);
      const oObjectPage = this._getObjectPageLayoutControl();

      // Setting defaults of internal model context
      const oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("externalNavigationContext", {
        page: true
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("relatedApps", {
        visibility: false,
        items: null
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("batchGroups", this._getBatchGroupsForView());
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      if (!this.getView().getViewData().useNewLazyLoading && oObjectPage.getEnableLazyLoading()) {
        //Attaching the event to make the subsection context binding active when it is visible.
        oObjectPage.attachEvent("subSectionEnteredViewPort", this._handleSubSectionEnteredViewPort.bind(this));
      }
      this.messageButton = this.getView().byId("fe::FooterBar::MessageButton");
      this.messageButton.oItemBinding.attachChange(this._fnShowOPMessage, this);
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("rootEditEnabled", true);
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("rootEditVisible", true);
    };
    _proto.onExit = function onExit() {
      if (this.mCustomSectionExtensionAPIs) {
        for (const sId of Object.keys(this.mCustomSectionExtensionAPIs)) {
          if (this.mCustomSectionExtensionAPIs[sId]) {
            this.mCustomSectionExtensionAPIs[sId].destroy();
          }
        }
        delete this.mCustomSectionExtensionAPIs;
      }
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
      const oMessagePopover = this.messageButton ? this.messageButton.oMessagePopover : null;
      if (oMessagePopover && oMessagePopover.isOpen()) {
        oMessagePopover.close();
      }
      //when exiting we set keepAlive context to false
      const oContext = this.getView().getBindingContext();
      if (oContext && oContext.isKeepAlive()) {
        oContext.setKeepAlive(false);
      }
      if (isConnected(this.getView())) {
        disconnect(this.getView()); // Cleanup collaboration connection when leaving the app
      }
    }

    /**
     * Method to show the message strip on the object page.
     *
     * @private
     */;
    _proto._fnShowOPMessage = function _fnShowOPMessage() {
      const extensionAPI = this.getExtensionAPI();
      const view = this.getView();
      const messages = this.messageButton.oMessagePopover.getItems().map(item => item.getBindingContext("message").getObject()).filter(message => {
        var _view$getBindingConte;
        return message.getTargets()[0] === ((_view$getBindingConte = view.getBindingContext()) === null || _view$getBindingConte === void 0 ? void 0 : _view$getBindingConte.getPath());
      });
      if (extensionAPI) {
        extensionAPI.showMessages(messages);
      }
    };
    _proto._getTableBinding = function _getTableBinding(oTable) {
      return oTable && oTable.getRowBinding();
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      var _this$oView$oViewData;
      PageController.prototype.onBeforeRendering.apply(this);
      // In the retrieveTextFromValueList scenario we need to ensure in case of reload/refresh that the meta model in the methode retrieveTextFromValueList of the FieldRuntime is available
      if ((_this$oView$oViewData = this.oView.oViewData) !== null && _this$oView$oViewData !== void 0 && _this$oView$oViewData.retrieveTextFromValueList && CommonHelper.getMetaModel() === undefined) {
        CommonHelper.setMetaModel(this.getAppComponent().getMetaModel());
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      this.getView().getModel("sap.fe.i18n").getResourceBundle().then(response => {
        this.oResourceBundle = response;
      }).catch(function (oError) {
        Log.error("Error while retrieving the resource bundle", oError);
      });
    };
    _proto._onBeforeBinding = function _onBeforeBinding(oContext, mParameters) {
      // TODO: we should check how this comes together with the transaction helper, same to the change in the afterBinding
      const aTables = this._findTables(),
        oObjectPage = this._getObjectPageLayoutControl(),
        oInternalModelContext = this.getView().getBindingContext("internal"),
        oInternalModel = this.getView().getModel("internal"),
        aBatchGroups = oInternalModelContext.getProperty("batchGroups"),
        iViewLevel = this.getView().getViewData().viewLevel;
      let oFastCreationRow;
      aBatchGroups.push("$auto");
      if (mParameters.bDraftNavigation !== true) {
        this._closeSideContent();
      }
      const opContext = oObjectPage.getBindingContext();
      if (opContext && opContext.hasPendingChanges() && !aBatchGroups.some(opContext.getModel().hasPendingChanges.bind(opContext.getModel()))) {
        /* 	In case there are pending changes for the creation row and no others we need to reset the changes
         						TODO: this is just a quick solution, this needs to be reworked
         				 	*/

        opContext.getBinding().resetChanges();
      }

      // For now we have to set the binding context to null for every fast creation row
      // TODO: Get rid of this coding or move it to another layer - to be discussed with MDC and model
      for (let i = 0; i < aTables.length; i++) {
        oFastCreationRow = aTables[i].getCreationRow();
        if (oFastCreationRow) {
          oFastCreationRow.setBindingContext(null);
        }
      }

      // Scroll to present Section so that bindings are enabled during navigation through paginator buttons, as there is no view rerendering/rebind
      const fnScrollToPresentSection = function () {
        if (!oObjectPage.isFirstRendering() && !mParameters.bPersistOPScroll) {
          oObjectPage.setSelectedSection(null);
        }
      };
      oObjectPage.attachEventOnce("modelContextChange", fnScrollToPresentSection);

      // if the structure of the ObjectPageLayout is changed then scroll to present Section
      // FIXME Is this really working as intended ? Initially this was onBeforeRendering, but never triggered onBeforeRendering because it was registered after it
      const oDelegateOnBefore = {
        onAfterRendering: fnScrollToPresentSection
      };
      oObjectPage.addEventDelegate(oDelegateOnBefore, this);
      this.pageReady.attachEventOnce("pageReady", function () {
        oObjectPage.removeEventDelegate(oDelegateOnBefore);
      });

      //Set the Binding for Paginators using ListBinding ID
      if (iViewLevel > 1) {
        let oBinding = mParameters && mParameters.listBinding;
        const oPaginatorCurrentContext = oInternalModel.getProperty("/paginatorCurrentContext");
        if (oPaginatorCurrentContext) {
          const oBindingToUse = oPaginatorCurrentContext.getBinding();
          this.paginator.initialize(oBindingToUse, oPaginatorCurrentContext);
          oInternalModel.setProperty("/paginatorCurrentContext", null);
        } else if (oBinding) {
          if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
            this.paginator.initialize(oBinding, oContext);
          } else {
            // if the binding type is not ODataListBinding because of a deeplink navigation or a refresh of the page
            // we need to create it
            const sBindingPath = oBinding.getPath();
            if (/\([^\)]*\)$/.test(sBindingPath)) {
              // The current binding path ends with (xxx), so we create the listBinding by removing (xxx)
              const sListBindingPath = sBindingPath.replace(/\([^\)]*\)$/, "");
              oBinding = new ODataListBinding(oBinding.oModel, sListBindingPath);
              const _setListBindingAsync = () => {
                if (oBinding.getContexts().length > 0) {
                  this.paginator.initialize(oBinding, oContext);
                  oBinding.detachEvent("change", _setListBindingAsync);
                }
              };
              oBinding.getContexts(0);
              oBinding.attachEvent("change", _setListBindingAsync);
            } else {
              // The current binding doesn't end with (xxx) --> the last segment is a 1-1 navigation, so we don't display the paginator
              this.paginator.initialize(undefined);
            }
          }
        }
      }
      if (!this.getView().getViewData().useNewLazyLoading && oObjectPage.getEnableLazyLoading()) {
        const aSections = oObjectPage.getSections();
        const bUseIconTabBar = oObjectPage.getUseIconTabBar();
        let iSkip = 2;
        const bIsInEditMode = oObjectPage.getModel("ui").getProperty("/isEditable");
        const bEditableHeader = this.getView().getViewData().editableHeaderContent;
        for (let iSection = 0; iSection < aSections.length; iSection++) {
          const oSection = aSections[iSection];
          const aSubSections = oSection.getSubSections();
          for (let iSubSection = 0; iSubSection < aSubSections.length; iSubSection++, iSkip--) {
            // In IconTabBar mode keep the second section bound if there is an editable header and we are switching to display mode
            if (iSkip < 1 || bUseIconTabBar && (iSection > 1 || iSection === 1 && !bEditableHeader && !bIsInEditMode)) {
              const oSubSection = aSubSections[iSubSection];
              if (oSubSection.data().isVisibilityDynamic !== "true") {
                oSubSection.setBindingContext(null);
              }
            }
          }
        }
      }
      if (this.placeholder.isPlaceholderEnabled() && mParameters.showPlaceholder) {
        const oView = this.getView();
        const oNavContainer = oView.getParent().oContainer.getParent();
        if (oNavContainer) {
          oNavContainer.showPlaceholder({});
        }
      }
    };
    _proto._getFirstClickableElement = function _getFirstClickableElement(oObjectPage) {
      let oFirstClickableElement;
      const aActions = oObjectPage.getHeaderTitle() && oObjectPage.getHeaderTitle().getActions();
      if (aActions && aActions.length) {
        oFirstClickableElement = aActions.find(function (oAction) {
          // Due to the left alignment of the Draft switch and the collaborative draft avatar controls
          // there is a ToolbarSpacer in the actions aggregation which we need to exclude here!
          // Due to the ACC report, we also need not to check for the InvisibleText elements
          if (oAction.isA("sap.fe.macros.ShareAPI")) {
            // since ShareAPI does not have a disable property
            // hence there is no need to check if it is disbaled or not
            return oAction.getVisible();
          } else if (!oAction.isA("sap.ui.core.InvisibleText") && !oAction.isA("sap.m.ToolbarSpacer")) {
            return oAction.getVisible() && oAction.getEnabled();
          }
        });
      }
      return oFirstClickableElement;
    };
    _proto._getFirstEmptyMandatoryFieldFromSubSection = function _getFirstEmptyMandatoryFieldFromSubSection(aSubSections) {
      if (aSubSections) {
        for (let subSection = 0; subSection < aSubSections.length; subSection++) {
          const aBlocks = aSubSections[subSection].getBlocks();
          if (aBlocks) {
            for (let block = 0; block < aBlocks.length; block++) {
              let aFormContainers;
              if (aBlocks[block].isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getFormContainers();
              } else if (aBlocks[block].getContent && aBlocks[block].getContent() && aBlocks[block].getContent().isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getContent().getFormContainers();
              }
              if (aFormContainers) {
                for (let formContainer = 0; formContainer < aFormContainers.length; formContainer++) {
                  const aFormElements = aFormContainers[formContainer].getFormElements();
                  if (aFormElements) {
                    for (let formElement = 0; formElement < aFormElements.length; formElement++) {
                      const aFields = aFormElements[formElement].getFields();

                      // The first field is not necessarily an InputBase (e.g. could be a Text)
                      // So we need to check whether it has a getRequired method
                      try {
                        if (aFields[0].getRequired && aFields[0].getRequired() && !aFields[0].getValue()) {
                          return aFields[0];
                        }
                      } catch (error) {
                        Log.debug(`Error when searching for mandaotry empty field: ${error}`);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return undefined;
    };
    _proto._updateFocusInEditMode = function _updateFocusInEditMode(aSubSections) {
      const oObjectPage = this._getObjectPageLayoutControl();
      const oMandatoryField = this._getFirstEmptyMandatoryFieldFromSubSection(aSubSections);
      let oFieldToFocus;
      if (oMandatoryField) {
        oFieldToFocus = oMandatoryField.content.getContentEdit()[0];
      } else {
        oFieldToFocus = oObjectPage._getFirstEditableInput() || this._getFirstClickableElement(oObjectPage);
      }
      if (oFieldToFocus) {
        setTimeout(function () {
          // We set the focus in a timeeout, otherwise the focus sometimes goes to the TabBar
          oFieldToFocus.focus();
        }, 0);
      }
    };
    _proto._handleSubSectionEnteredViewPort = function _handleSubSectionEnteredViewPort(oEvent) {
      const oSubSection = oEvent.getParameter("subSection");
      oSubSection.setBindingContext(undefined);
    };
    _proto._onBackNavigationInDraft = function _onBackNavigationInDraft(oContext) {
      this.messageHandler.removeTransitionMessages();
      if (this.getAppComponent().getRouterProxy().checkIfBackHasSameContext()) {
        // Back nav will keep the same context --> no need to display the dialog
        history.back();
      } else {
        draft.processDataLossOrDraftDiscardConfirmation(function () {
          history.back();
        }, Function.prototype, oContext, this, false, draft.NavigationType.BackNavigation);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto._onAfterBinding = function _onAfterBinding(oBindingContext, mParameters) {
      const oObjectPage = this._getObjectPageLayoutControl();
      const aTables = this._findTables();
      this._sideEffects.clearFieldGroupsValidity();

      // TODO: this is only a temp solution as long as the model fix the cache issue and we use this additional
      // binding with ownRequest
      oBindingContext = oObjectPage.getBindingContext();
      let aIBNActions = [];
      oObjectPage.getSections().forEach(function (oSection) {
        oSection.getSubSections().forEach(function (oSubSection) {
          aIBNActions = CommonUtils.getIBNActions(oSubSection, aIBNActions);
        });
      });

      // Assign internal binding contexts to oFormContainer:
      // 1. It is not possible to assign the internal binding context to the XML fragment
      // (FormContainer.fragment.xml) yet - it is used already for the data-structure.
      // 2. Another problem is, that FormContainers assigned to a 'MoreBlock' does not have an
      // internal model context at all.

      aTables.forEach(function (oTable) {
        const oInternalModelContext = oTable.getBindingContext("internal");
        oInternalModelContext.setProperty("creationRowFieldValidity", {});
        oInternalModelContext.setProperty("creationRowCustomValidity", {});
        aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
        // temporary workaround for BCP: 2080218004
        // Need to fix with BLI: FIORITECHP1-15274
        // only for edit mode, we clear the table cache
        // Workaround starts here!!
        const oTableRowBinding = oTable.getRowBinding();
        if (oTableRowBinding) {
          if (ModelHelper.isStickySessionSupported(oTableRowBinding.getModel().getMetaModel())) {
            // apply for both edit and display mode in sticky
            oTableRowBinding.removeCachesAndMessages("");
          }
        }
        // Workaround ends here!!

        // Update 'enabled' property of DataFieldForAction buttons on table toolbar
        // The same is also performed on Table selectionChange event
        const oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))),
          aSelectedContexts = oTable.getSelectedContexts();
        ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
        // Clear the selection in the table, need to be fixed and review with BLI: FIORITECHP1-24318
        oTable.clearSelection();
      });
      CommonUtils.getSemanticTargetsFromPageModel(this, "_pageModel");
      //Retrieve Object Page header actions from Object Page title control
      const oObjectPageTitle = oObjectPage.getHeaderTitle();
      let aIBNHeaderActions = [];
      aIBNHeaderActions = CommonUtils.getIBNActions(oObjectPageTitle, aIBNHeaderActions);
      aIBNActions = aIBNActions.concat(aIBNHeaderActions);
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
      let oModel, oFinalUIState;

      // TODO: this should be moved into an init event of the MDC tables (not yet existing) and should be part
      // of any controller extension
      /**
       * @param oTable
       * @param oListBinding
       */
      async function enableFastCreationRow(oTable, oListBinding) {
        const oFastCreationRow = oTable.getCreationRow();
        let oFastCreationListBinding, oFastCreationContext;
        if (oFastCreationRow) {
          try {
            await oFinalUIState;
            if (oFastCreationRow.getModel("ui").getProperty("/isEditable")) {
              oFastCreationListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
                $$updateGroupId: "doNotSubmit",
                $$groupId: "doNotSubmit"
              });
              // Workaround suggested by OData model v4 colleagues
              oFastCreationListBinding.refreshInternal = function () {
                /* do nothing */
              };
              oFastCreationContext = oFastCreationListBinding.create();
              oFastCreationRow.setBindingContext(oFastCreationContext);

              // this is needed to avoid console error
              try {
                await oFastCreationContext.created();
              } catch (e) {
                Log.trace("transient fast creation context deleted");
              }
            }
          } catch (oError) {
            Log.error("Error while computing the final UI state", oError);
          }
        }
      }

      // this should not be needed at the all
      /**
       * @param oTable
       */
      const handleTableModifications = oTable => {
        const oBinding = this._getTableBinding(oTable),
          fnHandleTablePatchEvents = function () {
            enableFastCreationRow(oTable, oBinding);
          };
        if (!oBinding) {
          Log.error(`Expected binding missing for table: ${oTable.getId()}`);
          return;
        }
        if (oBinding.oContext) {
          fnHandleTablePatchEvents();
        } else {
          const fnHandleChange = function () {
            if (oBinding.oContext) {
              fnHandleTablePatchEvents();
              oBinding.detachChange(fnHandleChange);
            }
          };
          oBinding.attachChange(fnHandleChange);
        }
      };
      if (oBindingContext) {
        oModel = oBindingContext.getModel();

        // Compute Edit Mode
        oFinalUIState = this._editFlow.computeEditMode(oBindingContext);
        if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel())) {
          oFinalUIState.then(() => {
            if (this.getView().getModel("ui").getProperty("/isEditable")) {
              connect(this.getView());
            } else if (isConnected(this.getView())) {
              disconnect(this.getView()); // Cleanup collaboration connection in case we switch to another element (e.g. in FCL)
            }
          }).catch(function (oError) {
            Log.error("Error while waiting for the final UI State", oError);
          });
        }
        // update related apps once Data is received in case of binding cache is not available
        // TODO: this is only a temp solution since we need to call _updateRelatedApps method only after data for Object Page is received (if there is no binding)
        if (oBindingContext.getBinding().oCache) {
          this._updateRelatedApps();
        } else {
          const fnUpdateRelatedApps = () => {
            this._updateRelatedApps();
            oBindingContext.getBinding().detachDataReceived(fnUpdateRelatedApps);
          };
          oBindingContext.getBinding().attachDataReceived(fnUpdateRelatedApps);
        }

        //Attach the patch sent and patch completed event to the object page binding so that we can react
        const oBinding = oBindingContext.getBinding && oBindingContext.getBinding() || oBindingContext;

        // Attach the event handler only once to the same binding
        if (this.currentBinding !== oBinding) {
          oBinding.attachEvent("patchSent", this.editFlow.handlePatchSent, this);
          this.currentBinding = oBinding;
        }
        aTables.forEach(function (oTable) {
          // access binding only after table is bound
          TableUtils.whenBound(oTable).then(handleTableModifications).catch(function (oError) {
            Log.error("Error while waiting for the table to be bound", oError);
          });
        });
        if (!this.getView().getViewData().useNewLazyLoading) {
          // should be called only after binding is ready hence calling it in onAfterBinding
          oObjectPage._triggerVisibleSubSectionsEvents();
        }

        //To Compute the Edit Binding of the subObject page using root object page, create a context for draft root and update the edit button in sub OP using the context
        ActionRuntime.updateEditButtonVisibilityAndEnablement(this.getView());
      }
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      const setFocus = () => {
        // Set the focus to the first action button, or to the first editable input if in editable mode
        const oObjectPage = this._getObjectPageLayoutControl();
        const isInDisplayMode = !oObjectPage.getModel("ui").getProperty("/isEditable");
        if (isInDisplayMode) {
          const oFirstClickableElement = this._getFirstClickableElement(oObjectPage);
          if (oFirstClickableElement) {
            oFirstClickableElement.focus();
          }
        } else {
          const oSelectedSection = Core.byId(oObjectPage.getSelectedSection());
          if (oSelectedSection) {
            this._updateFocusInEditMode(oSelectedSection.getSubSections());
          }
        }
      };
      // Apply app state only after the page is ready with the first section selected
      const oView = this.getView();
      const oInternalModelContext = oView.getBindingContext("internal");
      const oBindingContext = oView.getBindingContext();
      //Show popup while navigating back from object page in case of draft
      if (oBindingContext) {
        const bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (!bIsStickyMode) {
          const oAppComponent = CommonUtils.getAppComponent(oView);
          oAppComponent.getShellServices().setBackNavigation(() => this._onBackNavigationInDraft(oBindingContext));
        }
      }
      const viewId = this.getView().getId();
      this.getAppComponent().getAppStateHandler().applyAppState(viewId, this.getView()).then(() => {
        if (mParameters.forceFocus) {
          setFocus();
        }
      }).catch(function (Error) {
        Log.error("Error while setting the focus", Error);
      });
      oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      this._checkDataPointTitleForExternalNavigation();
    }

    /**
     * Get the status of edit mode for sticky session.
     *
     * @returns The status of edit mode for sticky session
     */;
    _proto.getStickyEditMode = function getStickyEditMode() {
      const oBindingContext = this.getView().getBindingContext && this.getView().getBindingContext();
      let bIsStickyEditMode = false;
      if (oBindingContext) {
        const bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (bIsStickyMode) {
          bIsStickyEditMode = this.getView().getModel("ui").getProperty("/isEditable");
        }
      }
      return bIsStickyEditMode;
    };
    _proto._getObjectPageLayoutControl = function _getObjectPageLayoutControl() {
      return this.byId("fe::ObjectPage");
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const oObjectPage = this._getObjectPageLayoutControl();
      const oObjectPageSubtitle = oObjectPage.getCustomData().find(function (oCustomData) {
        return oCustomData.getKey() === "ObjectPageSubtitle";
      });
      return {
        title: oObjectPage.data("ObjectPageTitle") || "",
        subtitle: oObjectPageSubtitle && oObjectPageSubtitle.getValue(),
        intent: "",
        icon: ""
      };
    };
    _proto._executeHeaderShortcut = function _executeHeaderShortcut(sId) {
      const sButtonId = `${this.getView().getId()}--${sId}`,
        oButton = this._getObjectPageLayoutControl().getHeaderTitle().getActions().find(function (oElement) {
          return oElement.getId() === sButtonId;
        });
      if (oButton) {
        CommonUtils.fireButtonPress(oButton);
      }
    };
    _proto._executeFooterShortcut = function _executeFooterShortcut(sId) {
      const sButtonId = `${this.getView().getId()}--${sId}`,
        oButton = this._getObjectPageLayoutControl().getFooter().getContent().find(function (oElement) {
          return oElement.getMetadata().getName() === "sap.m.Button" && oElement.getId() === sButtonId;
        });
      CommonUtils.fireButtonPress(oButton);
    };
    _proto._executeTabShortCut = function _executeTabShortCut(oExecution) {
      const oObjectPage = this._getObjectPageLayoutControl(),
        aSections = oObjectPage.getSections(),
        iSectionIndexMax = aSections.length - 1,
        sCommand = oExecution.oSource.getCommand();
      let newSection,
        iSelectedSectionIndex = oObjectPage.indexOfSection(this.byId(oObjectPage.getSelectedSection()));
      if (iSelectedSectionIndex !== -1 && iSectionIndexMax > 0) {
        if (sCommand === "NextTab") {
          if (iSelectedSectionIndex <= iSectionIndexMax - 1) {
            newSection = aSections[++iSelectedSectionIndex];
          }
        } else if (iSelectedSectionIndex !== 0) {
          // PreviousTab
          newSection = aSections[--iSelectedSectionIndex];
        }
        if (newSection) {
          oObjectPage.setSelectedSection(newSection);
          newSection.focus();
        }
      }
    };
    _proto._getFooterVisibility = function _getFooterVisibility() {
      const oInternalModelContext = this.getView().getBindingContext("internal");
      const sViewId = this.getView().getId();
      oInternalModelContext.setProperty("messageFooterContainsErrors", false);
      sap.ui.getCore().getMessageManager().getMessageModel().getData().forEach(function (oMessage) {
        if (oMessage.validation && oMessage.type === "Error" && oMessage.target.indexOf(sViewId) > -1) {
          oInternalModelContext.setProperty("messageFooterContainsErrors", true);
        }
      });
    };
    _proto._showMessagePopover = function _showMessagePopover(err, oRet) {
      if (err) {
        Log.error(err);
      }
      const rootViewController = this.getAppComponent().getRootViewController();
      const currentPageView = rootViewController.isFclEnabled() ? rootViewController.getRightmostView() : this.getAppComponent().getRootContainer().getCurrentPage();
      if (!currentPageView.isA("sap.m.MessagePage")) {
        const oMessageButton = this.messageButton,
          oMessagePopover = oMessageButton.oMessagePopover,
          oItemBinding = oMessagePopover.getBinding("items");
        if (oItemBinding.getLength() > 0 && !oMessagePopover.isOpen()) {
          oMessageButton.setVisible(true);
          // workaround to ensure that oMessageButton is rendered when openBy is called
          setTimeout(function () {
            oMessagePopover.openBy(oMessageButton);
          }, 0);
        }
      }
      return oRet;
    };
    _proto._editDocument = function _editDocument(oContext) {
      const oModel = this.getView().getModel("ui");
      BusyLocker.lock(oModel);
      return this.editFlow.editDocument.apply(this.editFlow, [oContext]).finally(function () {
        BusyLocker.unlock(oModel);
      });
    }

    /**
     * Gets the context of the DraftRoot path.
     * If a view has been created with the draft Root Path, this method returns its bindingContext.
     * Where no view is found a new created context is returned.
     * The new created context request the key of the entity in order to get the Etag of this entity.
     *
     * @function
     * @name getDraftRootPath
     * @returns Returns a Promise
     */;
    _proto.getDraftRootContext = async function getDraftRootContext() {
      const view = this.getView();
      const context = view.getBindingContext();
      if (context) {
        const draftRootContextPath = ModelHelper.getDraftRootPath(context);
        let simpleDraftRootContext;
        if (draftRootContextPath) {
          var _this$getAppComponent, _simpleDraftRootConte;
          // Check if a view matches with the draft root path
          const existingBindingContextOnPage = (_this$getAppComponent = this.getAppComponent().getRootViewController().getInstancedViews().find(pageView => {
            var _pageView$getBindingC;
            return ((_pageView$getBindingC = pageView.getBindingContext()) === null || _pageView$getBindingC === void 0 ? void 0 : _pageView$getBindingC.getPath()) === draftRootContextPath;
          })) === null || _this$getAppComponent === void 0 ? void 0 : _this$getAppComponent.getBindingContext();
          if (existingBindingContextOnPage) {
            return existingBindingContextOnPage;
          }
          const internalModel = view.getModel("internal");
          simpleDraftRootContext = internalModel.getProperty("/simpleDraftRootContext");
          if (((_simpleDraftRootConte = simpleDraftRootContext) === null || _simpleDraftRootConte === void 0 ? void 0 : _simpleDraftRootConte.getPath()) === draftRootContextPath) {
            return simpleDraftRootContext;
          }
          const model = context.getModel();
          simpleDraftRootContext = model.bindContext(draftRootContextPath).getBoundContext();
          await CommonUtils.waitForContextRequested(simpleDraftRootContext);
          // Store this new created context to use it on the next iterations
          internalModel.setProperty("/simpleDraftRootContext", simpleDraftRootContext);
          return simpleDraftRootContext;
        }
        return undefined;
      }
      return undefined;
    };
    _proto._validateDocument = async function _validateDocument() {
      const control = Core.byId(Core.getCurrentFocusedControlId());
      const context = control === null || control === void 0 ? void 0 : control.getBindingContext();
      if (context && !context.isTransient()) {
        // Wait for the pending changes before starting this validation
        await this._editFlow.syncTask();
        const appComponent = this.getAppComponent();
        const sideEffectsService = appComponent.getSideEffectsService();
        const entityType = sideEffectsService.getEntityTypeFromContext(context);
        const globalSideEffects = entityType ? sideEffectsService.getGlobalODataEntitySideEffects(entityType) : [];
        // If there is at least one global SideEffects for the related entity, execute it/them
        if (globalSideEffects.length) {
          return Promise.all(globalSideEffects.map(sideEffects => this._sideEffects.requestSideEffects(sideEffects, context)));
        } else {
          const draftRootContext = await this.getDraftRootContext();
          //Execute the draftValidation if there is no globalSideEffects (ignore ETags in collaboration draft)
          if (draftRootContext) {
            return draft.executeDraftValidation(draftRootContext, appComponent, isConnected(this.getView()));
          }
        }
      }
      return undefined;
    };
    _proto._saveDocument = async function _saveDocument(oContext) {
      const oModel = this.getView().getModel("ui"),
        aWaitCreateDocuments = [];
      // indicates if we are creating a new row in the OP
      let bExecuteSideEffectsOnError = false;
      BusyLocker.lock(oModel);
      this._findTables().forEach(oTable => {
        const oBinding = this._getTableBinding(oTable);
        const mParameters = {
          creationMode: oTable.data("creationMode"),
          creationRow: oTable.getCreationRow(),
          createAtEnd: oTable.data("createAtEnd") === "true"
        };
        const bCreateDocument = mParameters.creationRow && mParameters.creationRow.getBindingContext() && Object.keys(mParameters.creationRow.getBindingContext().getObject()).length > 1;
        if (bCreateDocument) {
          // the bSkipSideEffects is a parameter created when we click the save key. If we press this key
          // we don't execute the handleSideEffects funciton to avoid batch redundancy
          mParameters.bSkipSideEffects = true;
          bExecuteSideEffectsOnError = true;
          aWaitCreateDocuments.push(this.editFlow.createDocument(oBinding, mParameters).then(function () {
            return oBinding;
          }));
        }
      });
      try {
        const aBindings = await Promise.all(aWaitCreateDocuments);
        const mParameters = {
          bExecuteSideEffectsOnError: bExecuteSideEffectsOnError,
          bindings: aBindings
        };
        // We need to either reject or resolve a promise here and return it since this save
        // function is not only called when pressing the save button in the footer, but also
        // when the user selects create or save in a dataloss popup.
        // The logic of the dataloss popup needs to detect if the save had errors or not in order
        // to decide if the subsequent action - like a back navigation - has to be executed or not.
        try {
          await this.editFlow.saveDocument(oContext, mParameters);
        } catch (error) {
          // If the saveDocument in editFlow returns errors we need
          // to show the message popover here and ensure that the
          // dataloss logic does not perform the follow up function
          // like e.g. a back navigation hence we return a promise and reject it
          this._showMessagePopover(error);
          throw error;
        }
      } finally {
        if (BusyLocker.isLocked(oModel)) {
          BusyLocker.unlock(oModel);
        }
      }
    };
    _proto._manageCollaboration = function _manageCollaboration() {
      openManageDialog(this.getView());
    };
    _proto._showCollaborationUserDetails = function _showCollaborationUserDetails(event) {
      showUserDetails(event, this.getView());
    };
    _proto._cancelDocument = function _cancelDocument(oContext, mParameters) {
      mParameters.cancelButton = this.getView().byId(mParameters.cancelButton); //to get the reference of the cancel button from command execution
      return this.editFlow.cancelDocument(oContext, mParameters);
    };
    _proto._applyDocument = function _applyDocument(oContext) {
      return this.editFlow.applyDocument(oContext).catch(() => this._showMessagePopover());
    };
    _proto._updateRelatedApps = function _updateRelatedApps() {
      const oObjectPage = this._getObjectPageLayoutControl();
      if (CommonUtils.resolveStringtoBoolean(oObjectPage.data("showRelatedApps"))) {
        CommonUtils.updateRelatedAppsDetails(oObjectPage);
      }
    };
    _proto._findControlInSubSection = function _findControlInSubSection(aParentElement, aSubsection, aControls, bIsChart) {
      const aSubSectionTables = [];
      for (let element = 0; element < aParentElement.length; element++) {
        let oElement = aParentElement[element].getContent instanceof Function && aParentElement[element].getContent();
        if (bIsChart) {
          if (oElement && oElement.mAggregations && oElement.getAggregation("items")) {
            const aItems = oElement.getAggregation("items");
            aItems.forEach(function (oItem) {
              if (oItem.isA("sap.fe.macros.chart.ChartAPI")) {
                oElement = oItem;
              }
            });
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.layout.DynamicSideContent")) {
          oElement = oElement.getMainContent instanceof Function && oElement.getMainContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.table.TableAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Table")) {
          aControls.push(oElement);
          aSubSectionTables.push({
            table: oElement,
            gridTable: oElement.getType().isA("sap.ui.mdc.table.GridTableType")
          });
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.chart.ChartAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Chart")) {
          aControls.push(oElement);
        }
      }
      if (aSubSectionTables.length === 1 && aParentElement.length === 1 && aSubSectionTables[0].gridTable && !aSubsection.hasStyleClass("sapUxAPObjectPageSubSectionFitContainer")) {
        //In case there is only a single table in a section we fit that to the whole page so that the scrollbar comes only on table and not on page
        aSubsection.addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
      }
    };
    _proto._getAllSubSections = function _getAllSubSections() {
      const oObjectPage = this._getObjectPageLayoutControl();
      let aSubSections = [];
      oObjectPage.getSections().forEach(function (oSection) {
        aSubSections = aSubSections.concat(oSection.getSubSections());
      });
      return aSubSections;
    };
    _proto._getAllBlocks = function _getAllBlocks() {
      let aBlocks = [];
      this._getAllSubSections().forEach(function (oSubSection) {
        aBlocks = aBlocks.concat(oSubSection.getBlocks());
      });
      return aBlocks;
    };
    _proto._findTables = function _findTables() {
      const aSubSections = this._getAllSubSections();
      const aTables = [];
      for (let subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aTables);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aTables);
      }
      return aTables;
    };
    _proto._findCharts = function _findCharts() {
      const aSubSections = this._getAllSubSections();
      const aCharts = [];
      for (let subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aCharts, true);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aCharts, true);
      }
      return aCharts;
    };
    _proto._closeSideContent = function _closeSideContent() {
      this._getAllBlocks().forEach(function (oBlock) {
        const oContent = oBlock.getContent instanceof Function && oBlock.getContent();
        if (oContent && oContent.isA && oContent.isA("sap.ui.layout.DynamicSideContent")) {
          if (oContent.setShowSideContent instanceof Function) {
            oContent.setShowSideContent(false);
          }
        }
      });
    }

    /**
     * Chart Context is resolved for 1:n microcharts.
     *
     * @param oChartContext The Context of the MicroChart
     * @param sChartPath The collectionPath of the the chart
     * @returns Array of Attributes of the chart Context
     */;
    _proto._getChartContextData = function _getChartContextData(oChartContext, sChartPath) {
      const oContextData = oChartContext.getObject();
      let oChartContextData = [oContextData];
      if (oChartContext && sChartPath) {
        if (oContextData[sChartPath]) {
          oChartContextData = oContextData[sChartPath];
          delete oContextData[sChartPath];
          oChartContextData.push(oContextData);
        }
      }
      return oChartContextData;
    }

    /**
     * Scroll the tables to the row with the sPath
     *
     * @function
     * @name sap.fe.templates.ObjectPage.ObjectPageController.controller#_scrollTablesToRow
     * @param {string} sRowPath 'sPath of the table row'
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      if (this._findTables && this._findTables().length > 0) {
        const aTables = this._findTables();
        for (let i = 0; i < aTables.length; i++) {
          TableScroller.scrollTableToRow(aTables[i], sRowPath);
        }
      }
    }

    /**
     * Method to merge selected contexts and filters.
     *
     * @function
     * @name _mergeMultipleContexts
     * @param oPageContext Page context
     * @param aLineContext Selected Contexts
     * @param sChartPath Collection name of the chart
     * @returns Selection Variant Object
     */;
    _proto._mergeMultipleContexts = function _mergeMultipleContexts(oPageContext, aLineContext, sChartPath) {
      let aAttributes = [],
        aPageAttributes = [],
        oContext,
        sMetaPathLine,
        sPathLine;
      const sPagePath = oPageContext.getPath();
      const oMetaModel = oPageContext && oPageContext.getModel() && oPageContext.getModel().getMetaModel();
      const sMetaPathPage = oMetaModel && oMetaModel.getMetaPath(sPagePath).replace(/^\/*/, "");

      // Get single line context if necessary
      if (aLineContext && aLineContext.length) {
        oContext = aLineContext[0];
        sPathLine = oContext.getPath();
        sMetaPathLine = oMetaModel && oMetaModel.getMetaPath(sPathLine).replace(/^\/*/, "");
        aLineContext.forEach(oSingleContext => {
          if (sChartPath) {
            const oChartContextData = this._getChartContextData(oSingleContext, sChartPath);
            if (oChartContextData) {
              aAttributes = oChartContextData.map(function (oSubChartContextData) {
                return {
                  contextData: oSubChartContextData,
                  entitySet: `${sMetaPathPage}/${sChartPath}`
                };
              });
            }
          } else {
            aAttributes.push({
              contextData: oSingleContext.getObject(),
              entitySet: sMetaPathLine
            });
          }
        });
      }
      aPageAttributes.push({
        contextData: oPageContext.getObject(),
        entitySet: sMetaPathPage
      });
      // Adding Page Context to selection variant
      aPageAttributes = CommonUtils.removeSensitiveData(aPageAttributes, oMetaModel);
      const oPageLevelSV = CommonUtils.addPageContextToSelectionVariant(new SelectionVariant(), aPageAttributes, this.getView());
      aAttributes = CommonUtils.removeSensitiveData(aAttributes, oMetaModel);
      return {
        selectionVariant: oPageLevelSV,
        attributes: aAttributes
      };
    };
    _proto._getBatchGroupsForView = function _getBatchGroupsForView() {
      const oViewData = this.getView().getViewData(),
        oConfigurations = oViewData.controlConfiguration,
        aConfigurations = oConfigurations && Object.keys(oConfigurations),
        aBatchGroups = ["$auto.Heroes", "$auto.Decoration", "$auto.Workers"];
      if (aConfigurations && aConfigurations.length > 0) {
        aConfigurations.forEach(function (sKey) {
          const oConfiguration = oConfigurations[sKey];
          if (oConfiguration.requestGroupId === "LongRunners") {
            aBatchGroups.push("$auto.LongRunners");
          }
        });
      }
      return aBatchGroups;
    }

    /*
     * Reset Breadcrumb links
     *
     * @function
     * @param {sap.m.Breadcrumbs} [oSource] parent control
     * @description Used when context of the object page changes.
     *              This event callback is attached to modelContextChange
     *              event of the Breadcrumb control to catch context change.
     *              Then element binding and hrefs are updated for each link.
     *
     * @ui5-restricted
     * @experimental
     */;
    _proto._setBreadcrumbLinks = async function _setBreadcrumbLinks(oSource) {
      const oContext = oSource.getBindingContext(),
        oAppComponent = this.getAppComponent(),
        aPromises = [],
        aSkipParameterized = [],
        sNewPath = oContext === null || oContext === void 0 ? void 0 : oContext.getPath(),
        aPathParts = (sNewPath === null || sNewPath === void 0 ? void 0 : sNewPath.split("/")) ?? [],
        oMetaModel = oAppComponent && oAppComponent.getMetaModel();
      let sPath = "";
      try {
        aPathParts.shift();
        aPathParts.splice(-1, 1);
        aPathParts.forEach(function (sPathPart) {
          sPath += `/${sPathPart}`;
          const oRootViewController = oAppComponent.getRootViewController();
          const sParameterPath = oMetaModel.getMetaPath(sPath);
          const bResultContext = oMetaModel.getObject(`${sParameterPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
          if (bResultContext) {
            // We dont need to create a breadcrumb for Parameter path
            aSkipParameterized.push(1);
            return;
          } else {
            aSkipParameterized.push(0);
          }
          aPromises.push(oRootViewController.getTitleInfoFromPath(sPath));
        });
        const titleHierarchyInfos = await Promise.all(aPromises);
        let idx, hierarchyPosition, oLink;
        for (const titleHierarchyInfo of titleHierarchyInfos) {
          hierarchyPosition = titleHierarchyInfos.indexOf(titleHierarchyInfo);
          idx = hierarchyPosition - aSkipParameterized[hierarchyPosition];
          oLink = oSource.getLinks()[idx] ? oSource.getLinks()[idx] : new Link();
          //sCurrentEntity is a fallback value in case of empty title
          oLink.setText(titleHierarchyInfo.subtitle || titleHierarchyInfo.title);
          //We apply an additional encodeURI in case of special characters (ie "/") used in the url through the semantic keys
          oLink.setHref(encodeURI(titleHierarchyInfo.intent));
          if (!oSource.getLinks()[idx]) {
            oSource.addLink(oLink);
          }
        }
      } catch (error) {
        Log.error("Error while setting the breadcrumb links:" + error);
      }
    };
    _proto._checkDataPointTitleForExternalNavigation = function _checkDataPointTitleForExternalNavigation() {
      const oView = this.getView();
      const oInternalModelContext = oView.getBindingContext("internal");
      const oDataPoints = CommonUtils.getHeaderFacetItemConfigForExternalNavigation(oView.getViewData(), this.getAppComponent().getRoutingService().getOutbounds());
      const oShellServices = this.getAppComponent().getShellServices();
      const oPageContext = oView && oView.getBindingContext();
      oInternalModelContext.setProperty("isHeaderDPLinkVisible", {});
      if (oPageContext) {
        oPageContext.requestObject().then(function (oData) {
          fnGetLinks(oDataPoints, oData);
        }).catch(function (oError) {
          Log.error("Cannot retrieve the links from the shell service", oError);
        });
      }

      /**
       * @param oError
       */
      function fnOnError(oError) {
        Log.error(oError);
      }
      function fnSetLinkEnablement(id, aSupportedLinks) {
        const sLinkId = id;
        // process viable links from getLinks for all datapoints having outbound
        if (aSupportedLinks && aSupportedLinks.length === 1 && aSupportedLinks[0].supported) {
          oInternalModelContext.setProperty(`isHeaderDPLinkVisible/${sLinkId}`, true);
        }
      }

      /**
       * @param oSubDataPoints
       * @param oPageData
       */
      function fnGetLinks(oSubDataPoints, oPageData) {
        for (const sId in oSubDataPoints) {
          const oDataPoint = oSubDataPoints[sId];
          const oParams = {};
          const oLink = oView.byId(sId);
          if (!oLink) {
            // for data points configured in app descriptor but not annotated in the header
            continue;
          }
          const oLinkContext = oLink.getBindingContext();
          const oLinkData = oLinkContext && oLinkContext.getObject();
          let oMixedContext = merge({}, oPageData, oLinkData);
          // process semantic object mappings
          if (oDataPoint.semanticObjectMapping) {
            const aSemanticObjectMapping = oDataPoint.semanticObjectMapping;
            for (const item in aSemanticObjectMapping) {
              const oMapping = aSemanticObjectMapping[item];
              const sMainProperty = oMapping["LocalProperty"]["$PropertyPath"];
              const sMappedProperty = oMapping["SemanticObjectProperty"];
              if (sMainProperty !== sMappedProperty) {
                if (oMixedContext.hasOwnProperty(sMainProperty)) {
                  const oNewMapping = {};
                  oNewMapping[sMappedProperty] = oMixedContext[sMainProperty];
                  oMixedContext = merge({}, oMixedContext, oNewMapping);
                  delete oMixedContext[sMainProperty];
                }
              }
            }
          }
          if (oMixedContext) {
            for (const sKey in oMixedContext) {
              if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
                oParams[sKey] = oMixedContext[sKey];
              }
            }
          }
          // validate if a link must be rendered
          oShellServices.isNavigationSupported([{
            target: {
              semanticObject: oDataPoint.semanticObject,
              action: oDataPoint.action
            },
            params: oParams
          }]).then(aLinks => {
            return fnSetLinkEnablement(sId, aLinks);
          }).catch(fnOnError);
        }
      }
    };
    return ObjectPageController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "paginator", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "pageReady", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype)), _class2)) || _class);
  return ObjectPageController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3RQYWdlQ29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJQbGFjZWhvbGRlciIsIlNoYXJlIiwib3ZlcnJpZGUiLCJTaGFyZU92ZXJyaWRlcyIsIkludGVybmFsUm91dGluZyIsIkludGVybmFsUm91dGluZ092ZXJyaWRlIiwiUGFnaW5hdG9yIiwiUGFnaW5hdG9yT3ZlcnJpZGUiLCJNZXNzYWdlSGFuZGxlciIsIk1lc3NhZ2VIYW5kbGVyT3ZlcnJpZGUiLCJJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSIsIkludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiZ2V0TmF2aWdhdGlvbk1vZGUiLCJiSXNTdGlja3lFZGl0TW9kZSIsImdldFZpZXciLCJnZXRDb250cm9sbGVyIiwiZ2V0U3RpY2t5RWRpdE1vZGUiLCJ1bmRlZmluZWQiLCJWaWV3U3RhdGUiLCJWaWV3U3RhdGVPdmVycmlkZXMiLCJQYWdlUmVhZHkiLCJpc0NvbnRleHRFeHBlY3RlZCIsIk1hc3NFZGl0IiwicHVibGljRXh0ZW5zaW9uIiwiZmluYWxFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsImhhbmRsZXJzIiwib25QcmltYXJ5QWN0aW9uIiwib0NvbnRyb2xsZXIiLCJvVmlldyIsIm9Db250ZXh0Iiwic0FjdGlvbk5hbWUiLCJtUGFyYW1ldGVycyIsIm1Db25kaXRpb25zIiwiaVZpZXdMZXZlbCIsImdldFZpZXdEYXRhIiwidmlld0xldmVsIiwib09iamVjdFBhZ2UiLCJfZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2wiLCJwb3NpdGl2ZUFjdGlvblZpc2libGUiLCJwb3NpdGl2ZUFjdGlvbkVuYWJsZWQiLCJvbkNhbGxBY3Rpb24iLCJlZGl0QWN0aW9uVmlzaWJsZSIsImVkaXRBY3Rpb25FbmFibGVkIiwiX2VkaXREb2N1bWVudCIsImdldE1vZGVsIiwiZ2V0UHJvcGVydHkiLCJfc2F2ZURvY3VtZW50IiwiX2FwcGx5RG9jdW1lbnQiLCJvblRhYmxlQ29udGV4dENoYW5nZSIsIm9FdmVudCIsIm9Tb3VyY2UiLCJnZXRTb3VyY2UiLCJvVGFibGUiLCJfZmluZFRhYmxlcyIsInNvbWUiLCJfb1RhYmxlIiwiZ2V0Um93QmluZGluZyIsIm9DdXJyZW50QWN0aW9uUHJvbWlzZSIsIl9lZGl0RmxvdyIsImdldEN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiYVRhYmxlQ29udGV4dHMiLCJnZXRUeXBlIiwiZ2V0TWV0YWRhdGEiLCJpc0EiLCJnZXRDb250ZXh0cyIsImdldEN1cnJlbnRDb250ZXh0cyIsInRoZW4iLCJvQWN0aW9uUmVzcG9uc2UiLCJjb250cm9sSWQiLCJzSWQiLCJvQWN0aW9uRGF0YSIsIm9EYXRhIiwiYUtleXMiLCJrZXlzIiwiaU5ld0l0ZW1wIiwiZmluZCIsIm9UYWJsZUNvbnRleHQiLCJpIiwib1RhYmxlRGF0YSIsImdldE9iamVjdCIsImJDb21wYXJlIiwiZXZlcnkiLCJzS2V5IiwiYURpYWxvZ3MiLCJJbnN0YW5jZU1hbmFnZXIiLCJnZXRPcGVuRGlhbG9ncyIsIm9EaWFsb2ciLCJsZW5ndGgiLCJkaWFsb2ciLCJkYXRhIiwiYXR0YWNoRXZlbnRPbmNlIiwiZm9jdXNSb3ciLCJkZWxldGVDdXJyZW50QWN0aW9uUHJvbWlzZSIsImNhdGNoIiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJtZXNzYWdlQnV0dG9uIiwiZmlyZU1vZGVsQ29udGV4dENoYW5nZSIsImVkaXRGbG93IiwiaW52b2tlQWN0aW9uIiwiX3Nob3dNZXNzYWdlUG9wb3ZlciIsImJpbmQiLCJvbkRhdGFQb2ludFRpdGxlUHJlc3NlZCIsIm9NYW5pZmVzdE91dGJvdW5kIiwic0NvbnRyb2xDb25maWciLCJzQ29sbGVjdGlvblBhdGgiLCJKU09OIiwicGFyc2UiLCJvVGFyZ2V0SW5mbyIsImFTZW1hbnRpY09iamVjdE1hcHBpbmciLCJDb21tb25VdGlscyIsImdldFNlbWFudGljT2JqZWN0TWFwcGluZyIsIm9EYXRhUG9pbnRPckNoYXJ0QmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInNNZXRhUGF0aCIsImdldE1ldGFNb2RlbCIsImdldE1ldGFQYXRoIiwiZ2V0UGF0aCIsImFOYXZpZ2F0aW9uRGF0YSIsIl9nZXRDaGFydENvbnRleHREYXRhIiwiYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzIiwibWFwIiwib05hdmlnYXRpb25EYXRhIiwibWV0YVBhdGgiLCJwYXJhbWV0ZXJzIiwib1BhcmFtcyIsIl9pbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJnZXRPdXRib3VuZFBhcmFtcyIsIk9iamVjdCIsInNlbWFudGljT2JqZWN0IiwiYWN0aW9uIiwibmF2aWdhdGUiLCJuYXZpZ2F0aW9uQ29udGV4dHMiLCJzZW1hbnRpY09iamVjdE1hcHBpbmciLCJvbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQiLCJzT3V0Ym91bmRUYXJnZXQiLCJzQ3JlYXRlUGF0aCIsIm9uTmF2aWdhdGVDaGFuZ2UiLCJnZXRFeHRlbnNpb25BUEkiLCJ1cGRhdGVBcHBTdGF0ZSIsImJTZWN0aW9uTmF2aWdhdGVkIiwib0ludGVybmFsTW9kZWxDb250ZXh0Iiwic2VjdGlvbkxheW91dCIsIm9TdWJTZWN0aW9uIiwiZ2V0UGFyYW1ldGVyIiwiX3VwZGF0ZUZvY3VzSW5FZGl0TW9kZSIsIm9uVmFyaWFudFNlbGVjdGVkIiwib25WYXJpYW50U2F2ZWQiLCJzZXRUaW1lb3V0IiwibmF2aWdhdGVUb1N1YlNlY3Rpb24iLCJ2RGV0YWlsQ29uZmlnIiwib0RldGFpbENvbmZpZyIsImJ5SWQiLCJvU2VjdGlvbiIsInNlY3Rpb25JZCIsInN1YlNlY3Rpb25JZCIsImdldFN1YlNlY3Rpb25zIiwiZ2V0UGFyZW50IiwiZ2V0VmlzaWJsZSIsImdldFJlc291cmNlQnVuZGxlIiwib1Jlc291cmNlQnVuZGxlIiwic1RpdGxlIiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJlbnRpdHlTZXQiLCJNZXNzYWdlQm94Iiwic2Nyb2xsVG9TZWN0aW9uIiwiZ2V0SWQiLCJmaXJlTmF2aWdhdGUiLCJzZWN0aW9uIiwic3ViU2VjdGlvbiIsIm9uU3RhdGVDaGFuZ2UiLCJjbG9zZU9QTWVzc2FnZVN0cmlwIiwiaGlkZU1lc3NhZ2UiLCJtQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXMiLCJFeHRlbnNpb25BUEkiLCJleHRlbnNpb25BUEkiLCJvbkluaXQiLCJzZXRQcm9wZXJ0eSIsInBhZ2UiLCJ2aXNpYmlsaXR5IiwiaXRlbXMiLCJfZ2V0QmF0Y2hHcm91cHNGb3JWaWV3IiwidXNlTmV3TGF6eUxvYWRpbmciLCJnZXRFbmFibGVMYXp5TG9hZGluZyIsImF0dGFjaEV2ZW50IiwiX2hhbmRsZVN1YlNlY3Rpb25FbnRlcmVkVmlld1BvcnQiLCJvSXRlbUJpbmRpbmciLCJhdHRhY2hDaGFuZ2UiLCJfZm5TaG93T1BNZXNzYWdlIiwib25FeGl0IiwiZGVzdHJveSIsIm9NZXNzYWdlUG9wb3ZlciIsImlzT3BlbiIsImNsb3NlIiwiaXNLZWVwQWxpdmUiLCJzZXRLZWVwQWxpdmUiLCJpc0Nvbm5lY3RlZCIsImRpc2Nvbm5lY3QiLCJ2aWV3IiwibWVzc2FnZXMiLCJnZXRJdGVtcyIsIml0ZW0iLCJmaWx0ZXIiLCJtZXNzYWdlIiwiZ2V0VGFyZ2V0cyIsInNob3dNZXNzYWdlcyIsIl9nZXRUYWJsZUJpbmRpbmciLCJvbkJlZm9yZVJlbmRlcmluZyIsIlBhZ2VDb250cm9sbGVyIiwicHJvdG90eXBlIiwiYXBwbHkiLCJvVmlld0RhdGEiLCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IiwiQ29tbW9uSGVscGVyIiwic2V0TWV0YU1vZGVsIiwiZ2V0QXBwQ29tcG9uZW50Iiwib25BZnRlclJlbmRlcmluZyIsInJlc3BvbnNlIiwib0Vycm9yIiwiX29uQmVmb3JlQmluZGluZyIsImFUYWJsZXMiLCJvSW50ZXJuYWxNb2RlbCIsImFCYXRjaEdyb3VwcyIsIm9GYXN0Q3JlYXRpb25Sb3ciLCJwdXNoIiwiYkRyYWZ0TmF2aWdhdGlvbiIsIl9jbG9zZVNpZGVDb250ZW50Iiwib3BDb250ZXh0IiwiaGFzUGVuZGluZ0NoYW5nZXMiLCJnZXRCaW5kaW5nIiwicmVzZXRDaGFuZ2VzIiwiZ2V0Q3JlYXRpb25Sb3ciLCJzZXRCaW5kaW5nQ29udGV4dCIsImZuU2Nyb2xsVG9QcmVzZW50U2VjdGlvbiIsImlzRmlyc3RSZW5kZXJpbmciLCJiUGVyc2lzdE9QU2Nyb2xsIiwic2V0U2VsZWN0ZWRTZWN0aW9uIiwib0RlbGVnYXRlT25CZWZvcmUiLCJhZGRFdmVudERlbGVnYXRlIiwicGFnZVJlYWR5IiwicmVtb3ZlRXZlbnREZWxlZ2F0ZSIsIm9CaW5kaW5nIiwibGlzdEJpbmRpbmciLCJvUGFnaW5hdG9yQ3VycmVudENvbnRleHQiLCJvQmluZGluZ1RvVXNlIiwicGFnaW5hdG9yIiwiaW5pdGlhbGl6ZSIsInNCaW5kaW5nUGF0aCIsInRlc3QiLCJzTGlzdEJpbmRpbmdQYXRoIiwicmVwbGFjZSIsIk9EYXRhTGlzdEJpbmRpbmciLCJvTW9kZWwiLCJfc2V0TGlzdEJpbmRpbmdBc3luYyIsImRldGFjaEV2ZW50IiwiYVNlY3Rpb25zIiwiZ2V0U2VjdGlvbnMiLCJiVXNlSWNvblRhYkJhciIsImdldFVzZUljb25UYWJCYXIiLCJpU2tpcCIsImJJc0luRWRpdE1vZGUiLCJiRWRpdGFibGVIZWFkZXIiLCJlZGl0YWJsZUhlYWRlckNvbnRlbnQiLCJpU2VjdGlvbiIsImFTdWJTZWN0aW9ucyIsImlTdWJTZWN0aW9uIiwiaXNWaXNpYmlsaXR5RHluYW1pYyIsInBsYWNlaG9sZGVyIiwiaXNQbGFjZWhvbGRlckVuYWJsZWQiLCJzaG93UGxhY2Vob2xkZXIiLCJvTmF2Q29udGFpbmVyIiwib0NvbnRhaW5lciIsIl9nZXRGaXJzdENsaWNrYWJsZUVsZW1lbnQiLCJvRmlyc3RDbGlja2FibGVFbGVtZW50IiwiYUFjdGlvbnMiLCJnZXRIZWFkZXJUaXRsZSIsImdldEFjdGlvbnMiLCJvQWN0aW9uIiwiZ2V0RW5hYmxlZCIsIl9nZXRGaXJzdEVtcHR5TWFuZGF0b3J5RmllbGRGcm9tU3ViU2VjdGlvbiIsImFCbG9ja3MiLCJnZXRCbG9ja3MiLCJibG9jayIsImFGb3JtQ29udGFpbmVycyIsImdldEZvcm1Db250YWluZXJzIiwiZ2V0Q29udGVudCIsImZvcm1Db250YWluZXIiLCJhRm9ybUVsZW1lbnRzIiwiZ2V0Rm9ybUVsZW1lbnRzIiwiZm9ybUVsZW1lbnQiLCJhRmllbGRzIiwiZ2V0RmllbGRzIiwiZ2V0UmVxdWlyZWQiLCJnZXRWYWx1ZSIsImRlYnVnIiwib01hbmRhdG9yeUZpZWxkIiwib0ZpZWxkVG9Gb2N1cyIsImNvbnRlbnQiLCJnZXRDb250ZW50RWRpdCIsIl9nZXRGaXJzdEVkaXRhYmxlSW5wdXQiLCJmb2N1cyIsIl9vbkJhY2tOYXZpZ2F0aW9uSW5EcmFmdCIsIm1lc3NhZ2VIYW5kbGVyIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwiZ2V0Um91dGVyUHJveHkiLCJjaGVja0lmQmFja0hhc1NhbWVDb250ZXh0IiwiaGlzdG9yeSIsImJhY2siLCJkcmFmdCIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiRnVuY3Rpb24iLCJOYXZpZ2F0aW9uVHlwZSIsIkJhY2tOYXZpZ2F0aW9uIiwiX29uQWZ0ZXJCaW5kaW5nIiwib0JpbmRpbmdDb250ZXh0IiwiX3NpZGVFZmZlY3RzIiwiY2xlYXJGaWVsZEdyb3Vwc1ZhbGlkaXR5IiwiYUlCTkFjdGlvbnMiLCJmb3JFYWNoIiwiZ2V0SUJOQWN0aW9ucyIsIm9UYWJsZVJvd0JpbmRpbmciLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsInJlbW92ZUNhY2hlc0FuZE1lc3NhZ2VzIiwib0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsInBhcnNlQ3VzdG9tRGF0YSIsIkRlbGVnYXRlVXRpbCIsImdldEN1c3RvbURhdGEiLCJhU2VsZWN0ZWRDb250ZXh0cyIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJBY3Rpb25SdW50aW1lIiwic2V0QWN0aW9uRW5hYmxlbWVudCIsImNsZWFyU2VsZWN0aW9uIiwiZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbCIsIm9PYmplY3RQYWdlVGl0bGUiLCJhSUJOSGVhZGVyQWN0aW9ucyIsImNvbmNhdCIsInVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5Iiwib0ZpbmFsVUlTdGF0ZSIsImVuYWJsZUZhc3RDcmVhdGlvblJvdyIsIm9MaXN0QmluZGluZyIsIm9GYXN0Q3JlYXRpb25MaXN0QmluZGluZyIsIm9GYXN0Q3JlYXRpb25Db250ZXh0IiwiYmluZExpc3QiLCJnZXRDb250ZXh0IiwiJCR1cGRhdGVHcm91cElkIiwiJCRncm91cElkIiwicmVmcmVzaEludGVybmFsIiwiY3JlYXRlIiwiY3JlYXRlZCIsImUiLCJ0cmFjZSIsImhhbmRsZVRhYmxlTW9kaWZpY2F0aW9ucyIsImZuSGFuZGxlVGFibGVQYXRjaEV2ZW50cyIsImZuSGFuZGxlQ2hhbmdlIiwiZGV0YWNoQ2hhbmdlIiwiY29tcHV0ZUVkaXRNb2RlIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJjb25uZWN0Iiwib0NhY2hlIiwiX3VwZGF0ZVJlbGF0ZWRBcHBzIiwiZm5VcGRhdGVSZWxhdGVkQXBwcyIsImRldGFjaERhdGFSZWNlaXZlZCIsImF0dGFjaERhdGFSZWNlaXZlZCIsImN1cnJlbnRCaW5kaW5nIiwiaGFuZGxlUGF0Y2hTZW50IiwiVGFibGVVdGlscyIsIndoZW5Cb3VuZCIsIl90cmlnZ2VyVmlzaWJsZVN1YlNlY3Rpb25zRXZlbnRzIiwidXBkYXRlRWRpdEJ1dHRvblZpc2liaWxpdHlBbmRFbmFibGVtZW50Iiwib25QYWdlUmVhZHkiLCJzZXRGb2N1cyIsImlzSW5EaXNwbGF5TW9kZSIsIm9TZWxlY3RlZFNlY3Rpb24iLCJDb3JlIiwiZ2V0U2VsZWN0ZWRTZWN0aW9uIiwiYklzU3RpY2t5TW9kZSIsIm9BcHBDb21wb25lbnQiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0QmFja05hdmlnYXRpb24iLCJ2aWV3SWQiLCJnZXRBcHBTdGF0ZUhhbmRsZXIiLCJhcHBseUFwcFN0YXRlIiwiZm9yY2VGb2N1cyIsIkVycm9yIiwiX2NoZWNrRGF0YVBvaW50VGl0bGVGb3JFeHRlcm5hbE5hdmlnYXRpb24iLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJvT2JqZWN0UGFnZVN1YnRpdGxlIiwib0N1c3RvbURhdGEiLCJnZXRLZXkiLCJ0aXRsZSIsInN1YnRpdGxlIiwiaW50ZW50IiwiaWNvbiIsIl9leGVjdXRlSGVhZGVyU2hvcnRjdXQiLCJzQnV0dG9uSWQiLCJvQnV0dG9uIiwib0VsZW1lbnQiLCJmaXJlQnV0dG9uUHJlc3MiLCJfZXhlY3V0ZUZvb3RlclNob3J0Y3V0IiwiZ2V0Rm9vdGVyIiwiZ2V0TmFtZSIsIl9leGVjdXRlVGFiU2hvcnRDdXQiLCJvRXhlY3V0aW9uIiwiaVNlY3Rpb25JbmRleE1heCIsInNDb21tYW5kIiwiZ2V0Q29tbWFuZCIsIm5ld1NlY3Rpb24iLCJpU2VsZWN0ZWRTZWN0aW9uSW5kZXgiLCJpbmRleE9mU2VjdGlvbiIsIl9nZXRGb290ZXJWaXNpYmlsaXR5Iiwic1ZpZXdJZCIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImdldE1lc3NhZ2VNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsIm9NZXNzYWdlIiwidmFsaWRhdGlvbiIsInR5cGUiLCJ0YXJnZXQiLCJpbmRleE9mIiwib1JldCIsInJvb3RWaWV3Q29udHJvbGxlciIsImdldFJvb3RWaWV3Q29udHJvbGxlciIsImN1cnJlbnRQYWdlVmlldyIsImlzRmNsRW5hYmxlZCIsImdldFJpZ2h0bW9zdFZpZXciLCJnZXRSb290Q29udGFpbmVyIiwiZ2V0Q3VycmVudFBhZ2UiLCJvTWVzc2FnZUJ1dHRvbiIsImdldExlbmd0aCIsInNldFZpc2libGUiLCJvcGVuQnkiLCJCdXN5TG9ja2VyIiwibG9jayIsImVkaXREb2N1bWVudCIsImZpbmFsbHkiLCJ1bmxvY2siLCJnZXREcmFmdFJvb3RDb250ZXh0IiwiY29udGV4dCIsImRyYWZ0Um9vdENvbnRleHRQYXRoIiwiZ2V0RHJhZnRSb290UGF0aCIsInNpbXBsZURyYWZ0Um9vdENvbnRleHQiLCJleGlzdGluZ0JpbmRpbmdDb250ZXh0T25QYWdlIiwiZ2V0SW5zdGFuY2VkVmlld3MiLCJwYWdlVmlldyIsImludGVybmFsTW9kZWwiLCJtb2RlbCIsImJpbmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0Iiwid2FpdEZvckNvbnRleHRSZXF1ZXN0ZWQiLCJfdmFsaWRhdGVEb2N1bWVudCIsImNvbnRyb2wiLCJnZXRDdXJyZW50Rm9jdXNlZENvbnRyb2xJZCIsImlzVHJhbnNpZW50Iiwic3luY1Rhc2siLCJhcHBDb21wb25lbnQiLCJzaWRlRWZmZWN0c1NlcnZpY2UiLCJnZXRTaWRlRWZmZWN0c1NlcnZpY2UiLCJlbnRpdHlUeXBlIiwiZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0IiwiZ2xvYmFsU2lkZUVmZmVjdHMiLCJnZXRHbG9iYWxPRGF0YUVudGl0eVNpZGVFZmZlY3RzIiwiUHJvbWlzZSIsImFsbCIsInNpZGVFZmZlY3RzIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwiZHJhZnRSb290Q29udGV4dCIsImV4ZWN1dGVEcmFmdFZhbGlkYXRpb24iLCJhV2FpdENyZWF0ZURvY3VtZW50cyIsImJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIiwiY3JlYXRpb25Nb2RlIiwiY3JlYXRpb25Sb3ciLCJjcmVhdGVBdEVuZCIsImJDcmVhdGVEb2N1bWVudCIsImJTa2lwU2lkZUVmZmVjdHMiLCJjcmVhdGVEb2N1bWVudCIsImFCaW5kaW5ncyIsImJpbmRpbmdzIiwic2F2ZURvY3VtZW50IiwiaXNMb2NrZWQiLCJfbWFuYWdlQ29sbGFib3JhdGlvbiIsIm9wZW5NYW5hZ2VEaWFsb2ciLCJfc2hvd0NvbGxhYm9yYXRpb25Vc2VyRGV0YWlscyIsImV2ZW50Iiwic2hvd1VzZXJEZXRhaWxzIiwiX2NhbmNlbERvY3VtZW50IiwiY2FuY2VsQnV0dG9uIiwiY2FuY2VsRG9jdW1lbnQiLCJhcHBseURvY3VtZW50IiwicmVzb2x2ZVN0cmluZ3RvQm9vbGVhbiIsInVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlscyIsIl9maW5kQ29udHJvbEluU3ViU2VjdGlvbiIsImFQYXJlbnRFbGVtZW50IiwiYVN1YnNlY3Rpb24iLCJhQ29udHJvbHMiLCJiSXNDaGFydCIsImFTdWJTZWN0aW9uVGFibGVzIiwiZWxlbWVudCIsIm1BZ2dyZWdhdGlvbnMiLCJnZXRBZ2dyZWdhdGlvbiIsImFJdGVtcyIsIm9JdGVtIiwiZ2V0TWFpbkNvbnRlbnQiLCJ0YWJsZSIsImdyaWRUYWJsZSIsImhhc1N0eWxlQ2xhc3MiLCJhZGRTdHlsZUNsYXNzIiwiX2dldEFsbFN1YlNlY3Rpb25zIiwiX2dldEFsbEJsb2NrcyIsImdldE1vcmVCbG9ja3MiLCJfZmluZENoYXJ0cyIsImFDaGFydHMiLCJvQmxvY2siLCJvQ29udGVudCIsInNldFNob3dTaWRlQ29udGVudCIsIm9DaGFydENvbnRleHQiLCJzQ2hhcnRQYXRoIiwib0NvbnRleHREYXRhIiwib0NoYXJ0Q29udGV4dERhdGEiLCJfc2Nyb2xsVGFibGVzVG9Sb3ciLCJzUm93UGF0aCIsIlRhYmxlU2Nyb2xsZXIiLCJzY3JvbGxUYWJsZVRvUm93IiwiX21lcmdlTXVsdGlwbGVDb250ZXh0cyIsIm9QYWdlQ29udGV4dCIsImFMaW5lQ29udGV4dCIsImFBdHRyaWJ1dGVzIiwiYVBhZ2VBdHRyaWJ1dGVzIiwic01ldGFQYXRoTGluZSIsInNQYXRoTGluZSIsInNQYWdlUGF0aCIsIm9NZXRhTW9kZWwiLCJzTWV0YVBhdGhQYWdlIiwib1NpbmdsZUNvbnRleHQiLCJvU3ViQ2hhcnRDb250ZXh0RGF0YSIsImNvbnRleHREYXRhIiwicmVtb3ZlU2Vuc2l0aXZlRGF0YSIsIm9QYWdlTGV2ZWxTViIsImFkZFBhZ2VDb250ZXh0VG9TZWxlY3Rpb25WYXJpYW50IiwiU2VsZWN0aW9uVmFyaWFudCIsInNlbGVjdGlvblZhcmlhbnQiLCJhdHRyaWJ1dGVzIiwib0NvbmZpZ3VyYXRpb25zIiwiY29udHJvbENvbmZpZ3VyYXRpb24iLCJhQ29uZmlndXJhdGlvbnMiLCJvQ29uZmlndXJhdGlvbiIsInJlcXVlc3RHcm91cElkIiwiX3NldEJyZWFkY3J1bWJMaW5rcyIsImFQcm9taXNlcyIsImFTa2lwUGFyYW1ldGVyaXplZCIsInNOZXdQYXRoIiwiYVBhdGhQYXJ0cyIsInNwbGl0Iiwic1BhdGgiLCJzaGlmdCIsInNwbGljZSIsInNQYXRoUGFydCIsIm9Sb290Vmlld0NvbnRyb2xsZXIiLCJzUGFyYW1ldGVyUGF0aCIsImJSZXN1bHRDb250ZXh0IiwiZ2V0VGl0bGVJbmZvRnJvbVBhdGgiLCJ0aXRsZUhpZXJhcmNoeUluZm9zIiwiaWR4IiwiaGllcmFyY2h5UG9zaXRpb24iLCJvTGluayIsInRpdGxlSGllcmFyY2h5SW5mbyIsImdldExpbmtzIiwiTGluayIsInNldFRleHQiLCJzZXRIcmVmIiwiZW5jb2RlVVJJIiwiYWRkTGluayIsIm9EYXRhUG9pbnRzIiwiZ2V0SGVhZGVyRmFjZXRJdGVtQ29uZmlnRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uIiwiZ2V0Um91dGluZ1NlcnZpY2UiLCJnZXRPdXRib3VuZHMiLCJvU2hlbGxTZXJ2aWNlcyIsInJlcXVlc3RPYmplY3QiLCJmbkdldExpbmtzIiwiZm5PbkVycm9yIiwiZm5TZXRMaW5rRW5hYmxlbWVudCIsImlkIiwiYVN1cHBvcnRlZExpbmtzIiwic0xpbmtJZCIsInN1cHBvcnRlZCIsIm9TdWJEYXRhUG9pbnRzIiwib1BhZ2VEYXRhIiwib0RhdGFQb2ludCIsIm9MaW5rQ29udGV4dCIsIm9MaW5rRGF0YSIsIm9NaXhlZENvbnRleHQiLCJtZXJnZSIsIm9NYXBwaW5nIiwic01haW5Qcm9wZXJ0eSIsInNNYXBwZWRQcm9wZXJ0eSIsImhhc093blByb3BlcnR5Iiwib05ld01hcHBpbmciLCJpc05hdmlnYXRpb25TdXBwb3J0ZWQiLCJwYXJhbXMiLCJhTGlua3MiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk9iamVjdFBhZ2VDb250cm9sbGVyLmNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IG1lcmdlIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgQWN0aW9uUnVudGltZSBmcm9tIFwic2FwL2ZlL2NvcmUvQWN0aW9uUnVudGltZVwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCB7IGNvbm5lY3QsIGRpc2Nvbm5lY3QsIGlzQ29ubmVjdGVkIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlTeW5jXCI7XG5pbXBvcnQgeyBvcGVuTWFuYWdlRGlhbG9nLCBzaG93VXNlckRldGFpbHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9NYW5hZ2VcIjtcbmltcG9ydCBkcmFmdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCBJbnRlbnRCYXNlZE5hdmlnYXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVudEJhc2VkTmF2aWdhdGlvblwiO1xuaW1wb3J0IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvblwiO1xuaW1wb3J0IEludGVybmFsUm91dGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxSb3V0aW5nXCI7XG5pbXBvcnQgTWFzc0VkaXQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL01hc3NFZGl0XCI7XG5pbXBvcnQgTWVzc2FnZUhhbmRsZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUGFnZVJlYWR5IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9QYWdlUmVhZHlcIjtcbmltcG9ydCBQYWdpbmF0b3IgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BhZ2luYXRvclwiO1xuaW1wb3J0IFBsYWNlaG9sZGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9QbGFjZWhvbGRlclwiO1xuaW1wb3J0IFNoYXJlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaGFyZVwiO1xuaW1wb3J0IFZpZXdTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvVmlld1N0YXRlXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXh0ZW5zaWJsZSwgZmluYWxFeHRlbnNpb24sIHB1YmxpY0V4dGVuc2lvbiwgdXNpbmdFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBUYWJsZVV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1V0aWxzXCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IHR5cGUgeyBkZWZhdWx0IGFzIE9iamVjdFBhZ2VFeHRlbnNpb25BUEkgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9PYmplY3RQYWdlL0V4dGVuc2lvbkFQSVwiO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBFeHRlbnNpb25BUEkgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9PYmplY3RQYWdlL0V4dGVuc2lvbkFQSVwiO1xuaW1wb3J0IFRhYmxlU2Nyb2xsZXIgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvVGFibGVTY3JvbGxlclwiO1xuaW1wb3J0IEluc3RhbmNlTWFuYWdlciBmcm9tIFwic2FwL20vSW5zdGFuY2VNYW5hZ2VyXCI7XG5pbXBvcnQgTGluayBmcm9tIFwic2FwL20vTGlua1wiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCB0eXBlIFBvcG92ZXIgZnJvbSBcInNhcC9tL1BvcG92ZXJcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgQmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL0JpbmRpbmdcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhQ29udGV4dEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUNvbnRleHRCaW5kaW5nXCI7XG5pbXBvcnQgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvcmVzb3VyY2UvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHR5cGUgQnJlYWRDcnVtYnMgZnJvbSBcInNhcC91eGFwL0JyZWFkQ3J1bWJzXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlTGF5b3V0IGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlTGF5b3V0XCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlU2VjdGlvbiBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZVNlY3Rpb25cIjtcbmltcG9ydCB0eXBlIE9iamVjdFBhZ2VTdWJTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU3ViU2VjdGlvblwiO1xuaW1wb3J0IEludGVudEJhc2VkTmF2aWdhdGlvbk92ZXJyaWRlIGZyb20gXCIuL292ZXJyaWRlcy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbFJvdXRpbmdPdmVycmlkZSBmcm9tIFwiLi9vdmVycmlkZXMvSW50ZXJuYWxSb3V0aW5nXCI7XG5pbXBvcnQgTWVzc2FnZUhhbmRsZXJPdmVycmlkZSBmcm9tIFwiLi9vdmVycmlkZXMvTWVzc2FnZUhhbmRsZXJcIjtcbmltcG9ydCBQYWdpbmF0b3JPdmVycmlkZSBmcm9tIFwiLi9vdmVycmlkZXMvUGFnaW5hdG9yXCI7XG5pbXBvcnQgU2hhcmVPdmVycmlkZXMgZnJvbSBcIi4vb3ZlcnJpZGVzL1NoYXJlXCI7XG5pbXBvcnQgVmlld1N0YXRlT3ZlcnJpZGVzIGZyb20gXCIuL292ZXJyaWRlcy9WaWV3U3RhdGVcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLk9iamVjdFBhZ2VDb250cm9sbGVyXCIpXG5jbGFzcyBPYmplY3RQYWdlQ29udHJvbGxlciBleHRlbmRzIFBhZ2VDb250cm9sbGVyIHtcblx0b1ZpZXchOiBhbnk7XG5cdEB1c2luZ0V4dGVuc2lvbihQbGFjZWhvbGRlcilcblx0cGxhY2Vob2xkZXIhOiBQbGFjZWhvbGRlcjtcblx0QHVzaW5nRXh0ZW5zaW9uKFNoYXJlLm92ZXJyaWRlKFNoYXJlT3ZlcnJpZGVzKSlcblx0c2hhcmUhOiBTaGFyZTtcblx0QHVzaW5nRXh0ZW5zaW9uKEludGVybmFsUm91dGluZy5vdmVycmlkZShJbnRlcm5hbFJvdXRpbmdPdmVycmlkZSkpXG5cdF9yb3V0aW5nITogSW50ZXJuYWxSb3V0aW5nO1xuXHRAdXNpbmdFeHRlbnNpb24oUGFnaW5hdG9yLm92ZXJyaWRlKFBhZ2luYXRvck92ZXJyaWRlKSlcblx0cGFnaW5hdG9yITogUGFnaW5hdG9yO1xuXHRAdXNpbmdFeHRlbnNpb24oTWVzc2FnZUhhbmRsZXIub3ZlcnJpZGUoTWVzc2FnZUhhbmRsZXJPdmVycmlkZSkpXG5cdG1lc3NhZ2VIYW5kbGVyITogTWVzc2FnZUhhbmRsZXI7XG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlbnRCYXNlZE5hdmlnYXRpb24ub3ZlcnJpZGUoSW50ZW50QmFzZWROYXZpZ2F0aW9uT3ZlcnJpZGUpKVxuXHRpbnRlbnRCYXNlZE5hdmlnYXRpb24hOiBJbnRlbnRCYXNlZE5hdmlnYXRpb247XG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbi5vdmVycmlkZSh7XG5cdFx0XHRnZXROYXZpZ2F0aW9uTW9kZTogZnVuY3Rpb24gKHRoaXM6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IGJJc1N0aWNreUVkaXRNb2RlID1cblx0XHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIE9iamVjdFBhZ2VDb250cm9sbGVyKS5nZXRTdGlja3lFZGl0TW9kZSAmJlxuXHRcdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgT2JqZWN0UGFnZUNvbnRyb2xsZXIpLmdldFN0aWNreUVkaXRNb2RlKCk7XG5cdFx0XHRcdHJldHVybiBiSXNTdGlja3lFZGl0TW9kZSA/IFwiZXhwbGFjZVwiIDogdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0X2ludGVudEJhc2VkTmF2aWdhdGlvbiE6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXHRAdXNpbmdFeHRlbnNpb24oVmlld1N0YXRlLm92ZXJyaWRlKFZpZXdTdGF0ZU92ZXJyaWRlcykpXG5cdHZpZXdTdGF0ZSE6IFZpZXdTdGF0ZTtcblx0QHVzaW5nRXh0ZW5zaW9uKFxuXHRcdFBhZ2VSZWFkeS5vdmVycmlkZSh7XG5cdFx0XHRpc0NvbnRleHRFeHBlY3RlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KVxuXHQpXG5cdHBhZ2VSZWFkeSE6IFBhZ2VSZWFkeTtcblx0QHVzaW5nRXh0ZW5zaW9uKE1hc3NFZGl0KVxuXHRtYXNzRWRpdCE6IE1hc3NFZGl0O1xuXHRwcml2YXRlIG1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcz86IFJlY29yZDxzdHJpbmcsIE9iamVjdFBhZ2VFeHRlbnNpb25BUEk+O1xuXHRwcm90ZWN0ZWQgZXh0ZW5zaW9uQVBJPzogT2JqZWN0UGFnZUV4dGVuc2lvbkFQSTtcblx0cHJpdmF0ZSBvUmVzb3VyY2VCdW5kbGU/OiBSZXNvdXJjZUJ1bmRsZTtcblx0cHJpdmF0ZSBiU2VjdGlvbk5hdmlnYXRlZD86IGJvb2xlYW47XG5cdHByaXZhdGUgc3dpdGNoRHJhZnRBbmRBY3RpdmVQb3BPdmVyPzogUG9wb3Zlcjtcblx0cHJpdmF0ZSBjdXJyZW50QmluZGluZz86IEJpbmRpbmc7XG5cdHByaXZhdGUgbWVzc2FnZUJ1dHRvbjogYW55O1xuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRFeHRlbnNpb25BUEkoc0lkPzogc3RyaW5nKTogRXh0ZW5zaW9uQVBJIHtcblx0XHRpZiAoc0lkKSB7XG5cdFx0XHQvLyB0byBhbGxvdyBsb2NhbCBJRCB1c2FnZSBmb3IgY3VzdG9tIHBhZ2VzIHdlJ2xsIGNyZWF0ZS9yZXR1cm4gb3duIGluc3RhbmNlcyBmb3IgY3VzdG9tIHNlY3Rpb25zXG5cdFx0XHR0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcyA9IHRoaXMubUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzIHx8IHt9O1xuXG5cdFx0XHRpZiAoIXRoaXMubUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzW3NJZF0pIHtcblx0XHRcdFx0dGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXNbc0lkXSA9IG5ldyBFeHRlbnNpb25BUEkodGhpcywgc0lkKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJc1tzSWRdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIXRoaXMuZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHRcdHRoaXMuZXh0ZW5zaW9uQVBJID0gbmV3IEV4dGVuc2lvbkFQSSh0aGlzKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLmV4dGVuc2lvbkFQSTtcblx0XHR9XG5cdH1cblxuXHRvbkluaXQoKSB7XG5cdFx0c3VwZXIub25Jbml0KCk7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXG5cdFx0Ly8gU2V0dGluZyBkZWZhdWx0cyBvZiBpbnRlcm5hbCBtb2RlbCBjb250ZXh0XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwiZXh0ZXJuYWxOYXZpZ2F0aW9uQ29udGV4dFwiLCB7IHBhZ2U6IHRydWUgfSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcInJlbGF0ZWRBcHBzXCIsIHtcblx0XHRcdHZpc2liaWxpdHk6IGZhbHNlLFxuXHRcdFx0aXRlbXM6IG51bGxcblx0XHR9KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwiYmF0Y2hHcm91cHNcIiwgdGhpcy5fZ2V0QmF0Y2hHcm91cHNGb3JWaWV3KCkpO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dD8uc2V0UHJvcGVydHkoXCJlcnJvck5hdmlnYXRpb25TZWN0aW9uRmxhZ1wiLCBmYWxzZSk7XG5cdFx0aWYgKCEodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLnVzZU5ld0xhenlMb2FkaW5nICYmIChvT2JqZWN0UGFnZSBhcyBhbnkpLmdldEVuYWJsZUxhenlMb2FkaW5nKCkpIHtcblx0XHRcdC8vQXR0YWNoaW5nIHRoZSBldmVudCB0byBtYWtlIHRoZSBzdWJzZWN0aW9uIGNvbnRleHQgYmluZGluZyBhY3RpdmUgd2hlbiBpdCBpcyB2aXNpYmxlLlxuXHRcdFx0b09iamVjdFBhZ2UuYXR0YWNoRXZlbnQoXCJzdWJTZWN0aW9uRW50ZXJlZFZpZXdQb3J0XCIsIHRoaXMuX2hhbmRsZVN1YlNlY3Rpb25FbnRlcmVkVmlld1BvcnQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHRcdHRoaXMubWVzc2FnZUJ1dHRvbiA9IHRoaXMuZ2V0VmlldygpLmJ5SWQoXCJmZTo6Rm9vdGVyQmFyOjpNZXNzYWdlQnV0dG9uXCIpO1xuXHRcdHRoaXMubWVzc2FnZUJ1dHRvbi5vSXRlbUJpbmRpbmcuYXR0YWNoQ2hhbmdlKHRoaXMuX2ZuU2hvd09QTWVzc2FnZSwgdGhpcyk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcInJvb3RFZGl0RW5hYmxlZFwiLCB0cnVlKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwicm9vdEVkaXRWaXNpYmxlXCIsIHRydWUpO1xuXHR9XG5cblx0b25FeGl0KCkge1xuXHRcdGlmICh0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcykge1xuXHRcdFx0Zm9yIChjb25zdCBzSWQgb2YgT2JqZWN0LmtleXModGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXMpKSB7XG5cdFx0XHRcdGlmICh0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJc1tzSWRdKSB7XG5cdFx0XHRcdFx0dGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXNbc0lkXS5kZXN0cm95KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGRlbGV0ZSB0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcztcblx0XHR9XG5cdFx0aWYgKHRoaXMuZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHR0aGlzLmV4dGVuc2lvbkFQSS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSB0aGlzLmV4dGVuc2lvbkFQSTtcblxuXHRcdGNvbnN0IG9NZXNzYWdlUG9wb3ZlciA9IHRoaXMubWVzc2FnZUJ1dHRvbiA/IHRoaXMubWVzc2FnZUJ1dHRvbi5vTWVzc2FnZVBvcG92ZXIgOiBudWxsO1xuXHRcdGlmIChvTWVzc2FnZVBvcG92ZXIgJiYgb01lc3NhZ2VQb3BvdmVyLmlzT3BlbigpKSB7XG5cdFx0XHRvTWVzc2FnZVBvcG92ZXIuY2xvc2UoKTtcblx0XHR9XG5cdFx0Ly93aGVuIGV4aXRpbmcgd2Ugc2V0IGtlZXBBbGl2ZSBjb250ZXh0IHRvIGZhbHNlXG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0aWYgKG9Db250ZXh0ICYmIG9Db250ZXh0LmlzS2VlcEFsaXZlKCkpIHtcblx0XHRcdG9Db250ZXh0LnNldEtlZXBBbGl2ZShmYWxzZSk7XG5cdFx0fVxuXHRcdGlmIChpc0Nvbm5lY3RlZCh0aGlzLmdldFZpZXcoKSkpIHtcblx0XHRcdGRpc2Nvbm5lY3QodGhpcy5nZXRWaWV3KCkpOyAvLyBDbGVhbnVwIGNvbGxhYm9yYXRpb24gY29ubmVjdGlvbiB3aGVuIGxlYXZpbmcgdGhlIGFwcFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc2hvdyB0aGUgbWVzc2FnZSBzdHJpcCBvbiB0aGUgb2JqZWN0IHBhZ2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZm5TaG93T1BNZXNzYWdlKCkge1xuXHRcdGNvbnN0IGV4dGVuc2lvbkFQSSA9IHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCk7XG5cdFx0Y29uc3QgdmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlQnV0dG9uLm9NZXNzYWdlUG9wb3ZlclxuXHRcdFx0LmdldEl0ZW1zKClcblx0XHRcdC5tYXAoKGl0ZW06IGFueSkgPT4gaXRlbS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCkpXG5cdFx0XHQuZmlsdGVyKChtZXNzYWdlOiBNZXNzYWdlKSA9PiB7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmdldFRhcmdldHMoKVswXSA9PT0gdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCk7XG5cdFx0XHR9KTtcblxuXHRcdGlmIChleHRlbnNpb25BUEkpIHtcblx0XHRcdGV4dGVuc2lvbkFQSS5zaG93TWVzc2FnZXMobWVzc2FnZXMpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRUYWJsZUJpbmRpbmcob1RhYmxlOiBhbnkpIHtcblx0XHRyZXR1cm4gb1RhYmxlICYmIG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdH1cblxuXHRvbkJlZm9yZVJlbmRlcmluZygpIHtcblx0XHRQYWdlQ29udHJvbGxlci5wcm90b3R5cGUub25CZWZvcmVSZW5kZXJpbmcuYXBwbHkodGhpcyk7XG5cdFx0Ly8gSW4gdGhlIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Qgc2NlbmFyaW8gd2UgbmVlZCB0byBlbnN1cmUgaW4gY2FzZSBvZiByZWxvYWQvcmVmcmVzaCB0aGF0IHRoZSBtZXRhIG1vZGVsIGluIHRoZSBtZXRob2RlIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Qgb2YgdGhlIEZpZWxkUnVudGltZSBpcyBhdmFpbGFibGVcblx0XHRpZiAodGhpcy5vVmlldy5vVmlld0RhdGE/LnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QgJiYgQ29tbW9uSGVscGVyLmdldE1ldGFNb2RlbCgpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdENvbW1vbkhlbHBlci5zZXRNZXRhTW9kZWwodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0fVxuXHR9XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHQoKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKSBhcyBQcm9taXNlPFJlc291cmNlQnVuZGxlPilcblx0XHRcdC50aGVuKChyZXNwb25zZTogYW55KSA9PiB7XG5cdFx0XHRcdHRoaXMub1Jlc291cmNlQnVuZGxlID0gcmVzcG9uc2U7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSByZXNvdXJjZSBidW5kbGVcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0X29uQmVmb3JlQmluZGluZyhvQ29udGV4dDogYW55LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0Ly8gVE9ETzogd2Ugc2hvdWxkIGNoZWNrIGhvdyB0aGlzIGNvbWVzIHRvZ2V0aGVyIHdpdGggdGhlIHRyYW5zYWN0aW9uIGhlbHBlciwgc2FtZSB0byB0aGUgY2hhbmdlIGluIHRoZSBhZnRlckJpbmRpbmdcblx0XHRjb25zdCBhVGFibGVzID0gdGhpcy5fZmluZFRhYmxlcygpLFxuXHRcdFx0b09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpLFxuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdG9JbnRlcm5hbE1vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwsXG5cdFx0XHRhQmF0Y2hHcm91cHMgPSBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJiYXRjaEdyb3Vwc1wiKSxcblx0XHRcdGlWaWV3TGV2ZWwgPSAodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLnZpZXdMZXZlbDtcblx0XHRsZXQgb0Zhc3RDcmVhdGlvblJvdztcblx0XHRhQmF0Y2hHcm91cHMucHVzaChcIiRhdXRvXCIpO1xuXHRcdGlmIChtUGFyYW1ldGVycy5iRHJhZnROYXZpZ2F0aW9uICE9PSB0cnVlKSB7XG5cdFx0XHR0aGlzLl9jbG9zZVNpZGVDb250ZW50KCk7XG5cdFx0fVxuXHRcdGNvbnN0IG9wQ29udGV4dCA9IG9PYmplY3RQYWdlLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRpZiAoXG5cdFx0XHRvcENvbnRleHQgJiZcblx0XHRcdG9wQ29udGV4dC5oYXNQZW5kaW5nQ2hhbmdlcygpICYmXG5cdFx0XHQhYUJhdGNoR3JvdXBzLnNvbWUob3BDb250ZXh0LmdldE1vZGVsKCkuaGFzUGVuZGluZ0NoYW5nZXMuYmluZChvcENvbnRleHQuZ2V0TW9kZWwoKSkpXG5cdFx0KSB7XG5cdFx0XHQvKiBcdEluIGNhc2UgdGhlcmUgYXJlIHBlbmRpbmcgY2hhbmdlcyBmb3IgdGhlIGNyZWF0aW9uIHJvdyBhbmQgbm8gb3RoZXJzIHdlIG5lZWQgdG8gcmVzZXQgdGhlIGNoYW5nZXNcbiAgICBcdFx0XHRcdFx0XHRUT0RPOiB0aGlzIGlzIGp1c3QgYSBxdWljayBzb2x1dGlvbiwgdGhpcyBuZWVkcyB0byBiZSByZXdvcmtlZFxuICAgIFx0XHRcdFx0IFx0Ki9cblxuXHRcdFx0b3BDb250ZXh0LmdldEJpbmRpbmcoKS5yZXNldENoYW5nZXMoKTtcblx0XHR9XG5cblx0XHQvLyBGb3Igbm93IHdlIGhhdmUgdG8gc2V0IHRoZSBiaW5kaW5nIGNvbnRleHQgdG8gbnVsbCBmb3IgZXZlcnkgZmFzdCBjcmVhdGlvbiByb3dcblx0XHQvLyBUT0RPOiBHZXQgcmlkIG9mIHRoaXMgY29kaW5nIG9yIG1vdmUgaXQgdG8gYW5vdGhlciBsYXllciAtIHRvIGJlIGRpc2N1c3NlZCB3aXRoIE1EQyBhbmQgbW9kZWxcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFUYWJsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdG9GYXN0Q3JlYXRpb25Sb3cgPSBhVGFibGVzW2ldLmdldENyZWF0aW9uUm93KCk7XG5cdFx0XHRpZiAob0Zhc3RDcmVhdGlvblJvdykge1xuXHRcdFx0XHRvRmFzdENyZWF0aW9uUm93LnNldEJpbmRpbmdDb250ZXh0KG51bGwpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFNjcm9sbCB0byBwcmVzZW50IFNlY3Rpb24gc28gdGhhdCBiaW5kaW5ncyBhcmUgZW5hYmxlZCBkdXJpbmcgbmF2aWdhdGlvbiB0aHJvdWdoIHBhZ2luYXRvciBidXR0b25zLCBhcyB0aGVyZSBpcyBubyB2aWV3IHJlcmVuZGVyaW5nL3JlYmluZFxuXHRcdGNvbnN0IGZuU2Nyb2xsVG9QcmVzZW50U2VjdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICghKG9PYmplY3RQYWdlIGFzIGFueSkuaXNGaXJzdFJlbmRlcmluZygpICYmICFtUGFyYW1ldGVycy5iUGVyc2lzdE9QU2Nyb2xsKSB7XG5cdFx0XHRcdG9PYmplY3RQYWdlLnNldFNlbGVjdGVkU2VjdGlvbihudWxsIGFzIGFueSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRvT2JqZWN0UGFnZS5hdHRhY2hFdmVudE9uY2UoXCJtb2RlbENvbnRleHRDaGFuZ2VcIiwgZm5TY3JvbGxUb1ByZXNlbnRTZWN0aW9uKTtcblxuXHRcdC8vIGlmIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIE9iamVjdFBhZ2VMYXlvdXQgaXMgY2hhbmdlZCB0aGVuIHNjcm9sbCB0byBwcmVzZW50IFNlY3Rpb25cblx0XHQvLyBGSVhNRSBJcyB0aGlzIHJlYWxseSB3b3JraW5nIGFzIGludGVuZGVkID8gSW5pdGlhbGx5IHRoaXMgd2FzIG9uQmVmb3JlUmVuZGVyaW5nLCBidXQgbmV2ZXIgdHJpZ2dlcmVkIG9uQmVmb3JlUmVuZGVyaW5nIGJlY2F1c2UgaXQgd2FzIHJlZ2lzdGVyZWQgYWZ0ZXIgaXRcblx0XHRjb25zdCBvRGVsZWdhdGVPbkJlZm9yZSA9IHtcblx0XHRcdG9uQWZ0ZXJSZW5kZXJpbmc6IGZuU2Nyb2xsVG9QcmVzZW50U2VjdGlvblxuXHRcdH07XG5cdFx0b09iamVjdFBhZ2UuYWRkRXZlbnREZWxlZ2F0ZShvRGVsZWdhdGVPbkJlZm9yZSwgdGhpcyk7XG5cdFx0dGhpcy5wYWdlUmVhZHkuYXR0YWNoRXZlbnRPbmNlKFwicGFnZVJlYWR5XCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdG9PYmplY3RQYWdlLnJlbW92ZUV2ZW50RGVsZWdhdGUob0RlbGVnYXRlT25CZWZvcmUpO1xuXHRcdH0pO1xuXG5cdFx0Ly9TZXQgdGhlIEJpbmRpbmcgZm9yIFBhZ2luYXRvcnMgdXNpbmcgTGlzdEJpbmRpbmcgSURcblx0XHRpZiAoaVZpZXdMZXZlbCA+IDEpIHtcblx0XHRcdGxldCBvQmluZGluZyA9IG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmxpc3RCaW5kaW5nO1xuXHRcdFx0Y29uc3Qgb1BhZ2luYXRvckN1cnJlbnRDb250ZXh0ID0gb0ludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoXCIvcGFnaW5hdG9yQ3VycmVudENvbnRleHRcIik7XG5cdFx0XHRpZiAob1BhZ2luYXRvckN1cnJlbnRDb250ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IG9CaW5kaW5nVG9Vc2UgPSBvUGFnaW5hdG9yQ3VycmVudENvbnRleHQuZ2V0QmluZGluZygpO1xuXHRcdFx0XHR0aGlzLnBhZ2luYXRvci5pbml0aWFsaXplKG9CaW5kaW5nVG9Vc2UsIG9QYWdpbmF0b3JDdXJyZW50Q29udGV4dCk7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3BhZ2luYXRvckN1cnJlbnRDb250ZXh0XCIsIG51bGwpO1xuXHRcdFx0fSBlbHNlIGlmIChvQmluZGluZykge1xuXHRcdFx0XHRpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0XHR0aGlzLnBhZ2luYXRvci5pbml0aWFsaXplKG9CaW5kaW5nLCBvQ29udGV4dCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGhlIGJpbmRpbmcgdHlwZSBpcyBub3QgT0RhdGFMaXN0QmluZGluZyBiZWNhdXNlIG9mIGEgZGVlcGxpbmsgbmF2aWdhdGlvbiBvciBhIHJlZnJlc2ggb2YgdGhlIHBhZ2Vcblx0XHRcdFx0XHQvLyB3ZSBuZWVkIHRvIGNyZWF0ZSBpdFxuXHRcdFx0XHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IG9CaW5kaW5nLmdldFBhdGgoKTtcblx0XHRcdFx0XHRpZiAoL1xcKFteXFwpXSpcXCkkLy50ZXN0KHNCaW5kaW5nUGF0aCkpIHtcblx0XHRcdFx0XHRcdC8vIFRoZSBjdXJyZW50IGJpbmRpbmcgcGF0aCBlbmRzIHdpdGggKHh4eCksIHNvIHdlIGNyZWF0ZSB0aGUgbGlzdEJpbmRpbmcgYnkgcmVtb3ZpbmcgKHh4eClcblx0XHRcdFx0XHRcdGNvbnN0IHNMaXN0QmluZGluZ1BhdGggPSBzQmluZGluZ1BhdGgucmVwbGFjZSgvXFwoW15cXCldKlxcKSQvLCBcIlwiKTtcblx0XHRcdFx0XHRcdG9CaW5kaW5nID0gbmV3IChPRGF0YUxpc3RCaW5kaW5nIGFzIGFueSkob0JpbmRpbmcub01vZGVsLCBzTGlzdEJpbmRpbmdQYXRoKTtcblx0XHRcdFx0XHRcdGNvbnN0IF9zZXRMaXN0QmluZGluZ0FzeW5jID0gKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAob0JpbmRpbmcuZ2V0Q29udGV4dHMoKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5wYWdpbmF0b3IuaW5pdGlhbGl6ZShvQmluZGluZywgb0NvbnRleHQpO1xuXHRcdFx0XHRcdFx0XHRcdG9CaW5kaW5nLmRldGFjaEV2ZW50KFwiY2hhbmdlXCIsIF9zZXRMaXN0QmluZGluZ0FzeW5jKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0b0JpbmRpbmcuZ2V0Q29udGV4dHMoMCk7XG5cdFx0XHRcdFx0XHRvQmluZGluZy5hdHRhY2hFdmVudChcImNoYW5nZVwiLCBfc2V0TGlzdEJpbmRpbmdBc3luYyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIFRoZSBjdXJyZW50IGJpbmRpbmcgZG9lc24ndCBlbmQgd2l0aCAoeHh4KSAtLT4gdGhlIGxhc3Qgc2VnbWVudCBpcyBhIDEtMSBuYXZpZ2F0aW9uLCBzbyB3ZSBkb24ndCBkaXNwbGF5IHRoZSBwYWdpbmF0b3Jcblx0XHRcdFx0XHRcdHRoaXMucGFnaW5hdG9yLmluaXRpYWxpemUodW5kZWZpbmVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCEodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLnVzZU5ld0xhenlMb2FkaW5nICYmIG9PYmplY3RQYWdlLmdldEVuYWJsZUxhenlMb2FkaW5nKCkpIHtcblx0XHRcdGNvbnN0IGFTZWN0aW9ucyA9IG9PYmplY3RQYWdlLmdldFNlY3Rpb25zKCk7XG5cdFx0XHRjb25zdCBiVXNlSWNvblRhYkJhciA9IG9PYmplY3RQYWdlLmdldFVzZUljb25UYWJCYXIoKTtcblx0XHRcdGxldCBpU2tpcCA9IDI7XG5cdFx0XHRjb25zdCBiSXNJbkVkaXRNb2RlID0gb09iamVjdFBhZ2UuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpO1xuXHRcdFx0Y29uc3QgYkVkaXRhYmxlSGVhZGVyID0gKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5lZGl0YWJsZUhlYWRlckNvbnRlbnQ7XG5cdFx0XHRmb3IgKGxldCBpU2VjdGlvbiA9IDA7IGlTZWN0aW9uIDwgYVNlY3Rpb25zLmxlbmd0aDsgaVNlY3Rpb24rKykge1xuXHRcdFx0XHRjb25zdCBvU2VjdGlvbiA9IGFTZWN0aW9uc1tpU2VjdGlvbl07XG5cdFx0XHRcdGNvbnN0IGFTdWJTZWN0aW9ucyA9IG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKCk7XG5cdFx0XHRcdGZvciAobGV0IGlTdWJTZWN0aW9uID0gMDsgaVN1YlNlY3Rpb24gPCBhU3ViU2VjdGlvbnMubGVuZ3RoOyBpU3ViU2VjdGlvbisrLCBpU2tpcC0tKSB7XG5cdFx0XHRcdFx0Ly8gSW4gSWNvblRhYkJhciBtb2RlIGtlZXAgdGhlIHNlY29uZCBzZWN0aW9uIGJvdW5kIGlmIHRoZXJlIGlzIGFuIGVkaXRhYmxlIGhlYWRlciBhbmQgd2UgYXJlIHN3aXRjaGluZyB0byBkaXNwbGF5IG1vZGVcblx0XHRcdFx0XHRpZiAoaVNraXAgPCAxIHx8IChiVXNlSWNvblRhYkJhciAmJiAoaVNlY3Rpb24gPiAxIHx8IChpU2VjdGlvbiA9PT0gMSAmJiAhYkVkaXRhYmxlSGVhZGVyICYmICFiSXNJbkVkaXRNb2RlKSkpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvU3ViU2VjdGlvbiA9IGFTdWJTZWN0aW9uc1tpU3ViU2VjdGlvbl07XG5cdFx0XHRcdFx0XHRpZiAob1N1YlNlY3Rpb24uZGF0YSgpLmlzVmlzaWJpbGl0eUR5bmFtaWMgIT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRcdFx0XHRcdG9TdWJTZWN0aW9uLnNldEJpbmRpbmdDb250ZXh0KG51bGwgYXMgYW55KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5wbGFjZWhvbGRlci5pc1BsYWNlaG9sZGVyRW5hYmxlZCgpICYmIG1QYXJhbWV0ZXJzLnNob3dQbGFjZWhvbGRlcikge1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRcdGNvbnN0IG9OYXZDb250YWluZXIgPSAob1ZpZXcuZ2V0UGFyZW50KCkgYXMgYW55KS5vQ29udGFpbmVyLmdldFBhcmVudCgpO1xuXHRcdFx0aWYgKG9OYXZDb250YWluZXIpIHtcblx0XHRcdFx0b05hdkNvbnRhaW5lci5zaG93UGxhY2Vob2xkZXIoe30pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9nZXRGaXJzdENsaWNrYWJsZUVsZW1lbnQob09iamVjdFBhZ2U6IGFueSkge1xuXHRcdGxldCBvRmlyc3RDbGlja2FibGVFbGVtZW50O1xuXHRcdGNvbnN0IGFBY3Rpb25zID0gb09iamVjdFBhZ2UuZ2V0SGVhZGVyVGl0bGUoKSAmJiBvT2JqZWN0UGFnZS5nZXRIZWFkZXJUaXRsZSgpLmdldEFjdGlvbnMoKTtcblx0XHRpZiAoYUFjdGlvbnMgJiYgYUFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRvRmlyc3RDbGlja2FibGVFbGVtZW50ID0gYUFjdGlvbnMuZmluZChmdW5jdGlvbiAob0FjdGlvbjogYW55KSB7XG5cdFx0XHRcdC8vIER1ZSB0byB0aGUgbGVmdCBhbGlnbm1lbnQgb2YgdGhlIERyYWZ0IHN3aXRjaCBhbmQgdGhlIGNvbGxhYm9yYXRpdmUgZHJhZnQgYXZhdGFyIGNvbnRyb2xzXG5cdFx0XHRcdC8vIHRoZXJlIGlzIGEgVG9vbGJhclNwYWNlciBpbiB0aGUgYWN0aW9ucyBhZ2dyZWdhdGlvbiB3aGljaCB3ZSBuZWVkIHRvIGV4Y2x1ZGUgaGVyZSFcblx0XHRcdFx0Ly8gRHVlIHRvIHRoZSBBQ0MgcmVwb3J0LCB3ZSBhbHNvIG5lZWQgbm90IHRvIGNoZWNrIGZvciB0aGUgSW52aXNpYmxlVGV4dCBlbGVtZW50c1xuXHRcdFx0XHRpZiAob0FjdGlvbi5pc0EoXCJzYXAuZmUubWFjcm9zLlNoYXJlQVBJXCIpKSB7XG5cdFx0XHRcdFx0Ly8gc2luY2UgU2hhcmVBUEkgZG9lcyBub3QgaGF2ZSBhIGRpc2FibGUgcHJvcGVydHlcblx0XHRcdFx0XHQvLyBoZW5jZSB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGlmIGl0IGlzIGRpc2JhbGVkIG9yIG5vdFxuXHRcdFx0XHRcdHJldHVybiBvQWN0aW9uLmdldFZpc2libGUoKTtcblx0XHRcdFx0fSBlbHNlIGlmICghb0FjdGlvbi5pc0EoXCJzYXAudWkuY29yZS5JbnZpc2libGVUZXh0XCIpICYmICFvQWN0aW9uLmlzQShcInNhcC5tLlRvb2xiYXJTcGFjZXJcIikpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5nZXRWaXNpYmxlKCkgJiYgb0FjdGlvbi5nZXRFbmFibGVkKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb0ZpcnN0Q2xpY2thYmxlRWxlbWVudDtcblx0fVxuXG5cdF9nZXRGaXJzdEVtcHR5TWFuZGF0b3J5RmllbGRGcm9tU3ViU2VjdGlvbihhU3ViU2VjdGlvbnM6IGFueSkge1xuXHRcdGlmIChhU3ViU2VjdGlvbnMpIHtcblx0XHRcdGZvciAobGV0IHN1YlNlY3Rpb24gPSAwOyBzdWJTZWN0aW9uIDwgYVN1YlNlY3Rpb25zLmxlbmd0aDsgc3ViU2VjdGlvbisrKSB7XG5cdFx0XHRcdGNvbnN0IGFCbG9ja3MgPSBhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0uZ2V0QmxvY2tzKCk7XG5cblx0XHRcdFx0aWYgKGFCbG9ja3MpIHtcblx0XHRcdFx0XHRmb3IgKGxldCBibG9jayA9IDA7IGJsb2NrIDwgYUJsb2Nrcy5sZW5ndGg7IGJsb2NrKyspIHtcblx0XHRcdFx0XHRcdGxldCBhRm9ybUNvbnRhaW5lcnM7XG5cblx0XHRcdFx0XHRcdGlmIChhQmxvY2tzW2Jsb2NrXS5pc0EoXCJzYXAudWkubGF5b3V0LmZvcm0uRm9ybVwiKSkge1xuXHRcdFx0XHRcdFx0XHRhRm9ybUNvbnRhaW5lcnMgPSBhQmxvY2tzW2Jsb2NrXS5nZXRGb3JtQ29udGFpbmVycygpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0XHRcdFx0YUJsb2Nrc1tibG9ja10uZ2V0Q29udGVudCAmJlxuXHRcdFx0XHRcdFx0XHRhQmxvY2tzW2Jsb2NrXS5nZXRDb250ZW50KCkgJiZcblx0XHRcdFx0XHRcdFx0YUJsb2Nrc1tibG9ja10uZ2V0Q29udGVudCgpLmlzQShcInNhcC51aS5sYXlvdXQuZm9ybS5Gb3JtXCIpXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0YUZvcm1Db250YWluZXJzID0gYUJsb2Nrc1tibG9ja10uZ2V0Q29udGVudCgpLmdldEZvcm1Db250YWluZXJzKCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChhRm9ybUNvbnRhaW5lcnMpIHtcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgZm9ybUNvbnRhaW5lciA9IDA7IGZvcm1Db250YWluZXIgPCBhRm9ybUNvbnRhaW5lcnMubGVuZ3RoOyBmb3JtQ29udGFpbmVyKyspIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBhRm9ybUVsZW1lbnRzID0gYUZvcm1Db250YWluZXJzW2Zvcm1Db250YWluZXJdLmdldEZvcm1FbGVtZW50cygpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhRm9ybUVsZW1lbnRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBmb3JtRWxlbWVudCA9IDA7IGZvcm1FbGVtZW50IDwgYUZvcm1FbGVtZW50cy5sZW5ndGg7IGZvcm1FbGVtZW50KyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgYUZpZWxkcyA9IGFGb3JtRWxlbWVudHNbZm9ybUVsZW1lbnRdLmdldEZpZWxkcygpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFRoZSBmaXJzdCBmaWVsZCBpcyBub3QgbmVjZXNzYXJpbHkgYW4gSW5wdXRCYXNlIChlLmcuIGNvdWxkIGJlIGEgVGV4dClcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gU28gd2UgbmVlZCB0byBjaGVjayB3aGV0aGVyIGl0IGhhcyBhIGdldFJlcXVpcmVkIG1ldGhvZFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChhRmllbGRzWzBdLmdldFJlcXVpcmVkICYmIGFGaWVsZHNbMF0uZ2V0UmVxdWlyZWQoKSAmJiAhYUZpZWxkc1swXS5nZXRWYWx1ZSgpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYUZpZWxkc1swXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0TG9nLmRlYnVnKGBFcnJvciB3aGVuIHNlYXJjaGluZyBmb3IgbWFuZGFvdHJ5IGVtcHR5IGZpZWxkOiAke2Vycm9yfWApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRfdXBkYXRlRm9jdXNJbkVkaXRNb2RlKGFTdWJTZWN0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXG5cdFx0Y29uc3Qgb01hbmRhdG9yeUZpZWxkID0gdGhpcy5fZ2V0Rmlyc3RFbXB0eU1hbmRhdG9yeUZpZWxkRnJvbVN1YlNlY3Rpb24oYVN1YlNlY3Rpb25zKTtcblx0XHRsZXQgb0ZpZWxkVG9Gb2N1czogYW55O1xuXHRcdGlmIChvTWFuZGF0b3J5RmllbGQpIHtcblx0XHRcdG9GaWVsZFRvRm9jdXMgPSBvTWFuZGF0b3J5RmllbGQuY29udGVudC5nZXRDb250ZW50RWRpdCgpWzBdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRmllbGRUb0ZvY3VzID0gKG9PYmplY3RQYWdlIGFzIGFueSkuX2dldEZpcnN0RWRpdGFibGVJbnB1dCgpIHx8IHRoaXMuX2dldEZpcnN0Q2xpY2thYmxlRWxlbWVudChvT2JqZWN0UGFnZSk7XG5cdFx0fVxuXG5cdFx0aWYgKG9GaWVsZFRvRm9jdXMpIHtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvLyBXZSBzZXQgdGhlIGZvY3VzIGluIGEgdGltZWVvdXQsIG90aGVyd2lzZSB0aGUgZm9jdXMgc29tZXRpbWVzIGdvZXMgdG8gdGhlIFRhYkJhclxuXHRcdFx0XHRvRmllbGRUb0ZvY3VzLmZvY3VzKCk7XG5cdFx0XHR9LCAwKTtcblx0XHR9XG5cdH1cblxuXHRfaGFuZGxlU3ViU2VjdGlvbkVudGVyZWRWaWV3UG9ydChvRXZlbnQ6IGFueSkge1xuXHRcdGNvbnN0IG9TdWJTZWN0aW9uID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInN1YlNlY3Rpb25cIik7XG5cdFx0b1N1YlNlY3Rpb24uc2V0QmluZGluZ0NvbnRleHQodW5kZWZpbmVkKTtcblx0fVxuXG5cdF9vbkJhY2tOYXZpZ2F0aW9uSW5EcmFmdChvQ29udGV4dDogYW55KSB7XG5cdFx0dGhpcy5tZXNzYWdlSGFuZGxlci5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRpZiAodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb3V0ZXJQcm94eSgpLmNoZWNrSWZCYWNrSGFzU2FtZUNvbnRleHQoKSkge1xuXHRcdFx0Ly8gQmFjayBuYXYgd2lsbCBrZWVwIHRoZSBzYW1lIGNvbnRleHQgLS0+IG5vIG5lZWQgdG8gZGlzcGxheSB0aGUgZGlhbG9nXG5cdFx0XHRoaXN0b3J5LmJhY2soKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZHJhZnQucHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24oXG5cdFx0XHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRoaXN0b3J5LmJhY2soKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0RnVuY3Rpb24ucHJvdG90eXBlLFxuXHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGRyYWZ0Lk5hdmlnYXRpb25UeXBlLkJhY2tOYXZpZ2F0aW9uXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0X29uQWZ0ZXJCaW5kaW5nKG9CaW5kaW5nQ29udGV4dDogYW55LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9maW5kVGFibGVzKCk7XG5cblx0XHR0aGlzLl9zaWRlRWZmZWN0cy5jbGVhckZpZWxkR3JvdXBzVmFsaWRpdHkoKTtcblxuXHRcdC8vIFRPRE86IHRoaXMgaXMgb25seSBhIHRlbXAgc29sdXRpb24gYXMgbG9uZyBhcyB0aGUgbW9kZWwgZml4IHRoZSBjYWNoZSBpc3N1ZSBhbmQgd2UgdXNlIHRoaXMgYWRkaXRpb25hbFxuXHRcdC8vIGJpbmRpbmcgd2l0aCBvd25SZXF1ZXN0XG5cdFx0b0JpbmRpbmdDb250ZXh0ID0gb09iamVjdFBhZ2UuZ2V0QmluZGluZ0NvbnRleHQoKTtcblxuXHRcdGxldCBhSUJOQWN0aW9uczogYW55W10gPSBbXTtcblx0XHRvT2JqZWN0UGFnZS5nZXRTZWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24gKG9TZWN0aW9uOiBhbnkpIHtcblx0XHRcdG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKCkuZm9yRWFjaChmdW5jdGlvbiAob1N1YlNlY3Rpb246IGFueSkge1xuXHRcdFx0XHRhSUJOQWN0aW9ucyA9IENvbW1vblV0aWxzLmdldElCTkFjdGlvbnMob1N1YlNlY3Rpb24sIGFJQk5BY3Rpb25zKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQXNzaWduIGludGVybmFsIGJpbmRpbmcgY29udGV4dHMgdG8gb0Zvcm1Db250YWluZXI6XG5cdFx0Ly8gMS4gSXQgaXMgbm90IHBvc3NpYmxlIHRvIGFzc2lnbiB0aGUgaW50ZXJuYWwgYmluZGluZyBjb250ZXh0IHRvIHRoZSBYTUwgZnJhZ21lbnRcblx0XHQvLyAoRm9ybUNvbnRhaW5lci5mcmFnbWVudC54bWwpIHlldCAtIGl0IGlzIHVzZWQgYWxyZWFkeSBmb3IgdGhlIGRhdGEtc3RydWN0dXJlLlxuXHRcdC8vIDIuIEFub3RoZXIgcHJvYmxlbSBpcywgdGhhdCBGb3JtQ29udGFpbmVycyBhc3NpZ25lZCB0byBhICdNb3JlQmxvY2snIGRvZXMgbm90IGhhdmUgYW5cblx0XHQvLyBpbnRlcm5hbCBtb2RlbCBjb250ZXh0IGF0IGFsbC5cblxuXHRcdGFUYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dGaWVsZFZhbGlkaXR5XCIsIHt9KTtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNyZWF0aW9uUm93Q3VzdG9tVmFsaWRpdHlcIiwge30pO1xuXG5cdFx0XHRhSUJOQWN0aW9ucyA9IENvbW1vblV0aWxzLmdldElCTkFjdGlvbnMob1RhYmxlLCBhSUJOQWN0aW9ucyk7XG5cdFx0XHQvLyB0ZW1wb3Jhcnkgd29ya2Fyb3VuZCBmb3IgQkNQOiAyMDgwMjE4MDA0XG5cdFx0XHQvLyBOZWVkIHRvIGZpeCB3aXRoIEJMSTogRklPUklURUNIUDEtMTUyNzRcblx0XHRcdC8vIG9ubHkgZm9yIGVkaXQgbW9kZSwgd2UgY2xlYXIgdGhlIHRhYmxlIGNhY2hlXG5cdFx0XHQvLyBXb3JrYXJvdW5kIHN0YXJ0cyBoZXJlISFcblx0XHRcdGNvbnN0IG9UYWJsZVJvd0JpbmRpbmcgPSBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHRcdFx0aWYgKG9UYWJsZVJvd0JpbmRpbmcpIHtcblx0XHRcdFx0aWYgKE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvVGFibGVSb3dCaW5kaW5nLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkpKSB7XG5cdFx0XHRcdFx0Ly8gYXBwbHkgZm9yIGJvdGggZWRpdCBhbmQgZGlzcGxheSBtb2RlIGluIHN0aWNreVxuXHRcdFx0XHRcdG9UYWJsZVJvd0JpbmRpbmcucmVtb3ZlQ2FjaGVzQW5kTWVzc2FnZXMoXCJcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIFdvcmthcm91bmQgZW5kcyBoZXJlISFcblxuXHRcdFx0Ly8gVXBkYXRlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiBEYXRhRmllbGRGb3JBY3Rpb24gYnV0dG9ucyBvbiB0YWJsZSB0b29sYmFyXG5cdFx0XHQvLyBUaGUgc2FtZSBpcyBhbHNvIHBlcmZvcm1lZCBvbiBUYWJsZSBzZWxlY3Rpb25DaGFuZ2UgZXZlbnRcblx0XHRcdGNvbnN0IG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRcdENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcIm9wZXJhdGlvbkF2YWlsYWJsZU1hcFwiKSlcblx0XHRcdFx0KSxcblx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMgPSBvVGFibGUuZ2V0U2VsZWN0ZWRDb250ZXh0cygpO1xuXG5cdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnQob0ludGVybmFsTW9kZWxDb250ZXh0LCBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwLCBhU2VsZWN0ZWRDb250ZXh0cywgXCJ0YWJsZVwiKTtcblx0XHRcdC8vIENsZWFyIHRoZSBzZWxlY3Rpb24gaW4gdGhlIHRhYmxlLCBuZWVkIHRvIGJlIGZpeGVkIGFuZCByZXZpZXcgd2l0aCBCTEk6IEZJT1JJVEVDSFAxLTI0MzE4XG5cdFx0XHRvVGFibGUuY2xlYXJTZWxlY3Rpb24oKTtcblx0XHR9KTtcblx0XHRDb21tb25VdGlscy5nZXRTZW1hbnRpY1RhcmdldHNGcm9tUGFnZU1vZGVsKHRoaXMsIFwiX3BhZ2VNb2RlbFwiKTtcblx0XHQvL1JldHJpZXZlIE9iamVjdCBQYWdlIGhlYWRlciBhY3Rpb25zIGZyb20gT2JqZWN0IFBhZ2UgdGl0bGUgY29udHJvbFxuXHRcdGNvbnN0IG9PYmplY3RQYWdlVGl0bGUgPSBvT2JqZWN0UGFnZS5nZXRIZWFkZXJUaXRsZSgpIGFzIE9iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGU7XG5cdFx0bGV0IGFJQk5IZWFkZXJBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRcdGFJQk5IZWFkZXJBY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0SUJOQWN0aW9ucyhvT2JqZWN0UGFnZVRpdGxlLCBhSUJOSGVhZGVyQWN0aW9ucyk7XG5cdFx0YUlCTkFjdGlvbnMgPSBhSUJOQWN0aW9ucy5jb25jYXQoYUlCTkhlYWRlckFjdGlvbnMpO1xuXHRcdENvbW1vblV0aWxzLnVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5KGFJQk5BY3Rpb25zLCB0aGlzLmdldFZpZXcoKSk7XG5cblx0XHRsZXQgb01vZGVsOiBhbnksIG9GaW5hbFVJU3RhdGU6IGFueTtcblxuXHRcdC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIG1vdmVkIGludG8gYW4gaW5pdCBldmVudCBvZiB0aGUgTURDIHRhYmxlcyAobm90IHlldCBleGlzdGluZykgYW5kIHNob3VsZCBiZSBwYXJ0XG5cdFx0Ly8gb2YgYW55IGNvbnRyb2xsZXIgZXh0ZW5zaW9uXG5cdFx0LyoqXG5cdFx0ICogQHBhcmFtIG9UYWJsZVxuXHRcdCAqIEBwYXJhbSBvTGlzdEJpbmRpbmdcblx0XHQgKi9cblx0XHRhc3luYyBmdW5jdGlvbiBlbmFibGVGYXN0Q3JlYXRpb25Sb3cob1RhYmxlOiBhbnksIG9MaXN0QmluZGluZzogYW55KSB7XG5cdFx0XHRjb25zdCBvRmFzdENyZWF0aW9uUm93ID0gb1RhYmxlLmdldENyZWF0aW9uUm93KCk7XG5cdFx0XHRsZXQgb0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nLCBvRmFzdENyZWF0aW9uQ29udGV4dDtcblxuXHRcdFx0aWYgKG9GYXN0Q3JlYXRpb25Sb3cpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRhd2FpdCBvRmluYWxVSVN0YXRlO1xuXHRcdFx0XHRcdGlmIChvRmFzdENyZWF0aW9uUm93LmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0b0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nID0gb01vZGVsLmJpbmRMaXN0KG9MaXN0QmluZGluZy5nZXRQYXRoKCksIG9MaXN0QmluZGluZy5nZXRDb250ZXh0KCksIFtdLCBbXSwge1xuXHRcdFx0XHRcdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwiZG9Ob3RTdWJtaXRcIixcblx0XHRcdFx0XHRcdFx0JCRncm91cElkOiBcImRvTm90U3VibWl0XCJcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Ly8gV29ya2Fyb3VuZCBzdWdnZXN0ZWQgYnkgT0RhdGEgbW9kZWwgdjQgY29sbGVhZ3Vlc1xuXHRcdFx0XHRcdFx0b0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nLnJlZnJlc2hJbnRlcm5hbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0LyogZG8gbm90aGluZyAqL1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdG9GYXN0Q3JlYXRpb25Db250ZXh0ID0gb0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nLmNyZWF0ZSgpO1xuXHRcdFx0XHRcdFx0b0Zhc3RDcmVhdGlvblJvdy5zZXRCaW5kaW5nQ29udGV4dChvRmFzdENyZWF0aW9uQ29udGV4dCk7XG5cblx0XHRcdFx0XHRcdC8vIHRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIGNvbnNvbGUgZXJyb3Jcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IG9GYXN0Q3JlYXRpb25Db250ZXh0LmNyZWF0ZWQoKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdFx0TG9nLnRyYWNlKFwidHJhbnNpZW50IGZhc3QgY3JlYXRpb24gY29udGV4dCBkZWxldGVkXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBjb21wdXRpbmcgdGhlIGZpbmFsIFVJIHN0YXRlXCIsIG9FcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyB0aGlzIHNob3VsZCBub3QgYmUgbmVlZGVkIGF0IHRoZSBhbGxcblx0XHQvKipcblx0XHQgKiBAcGFyYW0gb1RhYmxlXG5cdFx0ICovXG5cdFx0Y29uc3QgaGFuZGxlVGFibGVNb2RpZmljYXRpb25zID0gKG9UYWJsZTogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvQmluZGluZyA9IHRoaXMuX2dldFRhYmxlQmluZGluZyhvVGFibGUpLFxuXHRcdFx0XHRmbkhhbmRsZVRhYmxlUGF0Y2hFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0ZW5hYmxlRmFzdENyZWF0aW9uUm93KG9UYWJsZSwgb0JpbmRpbmcpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRpZiAoIW9CaW5kaW5nKSB7XG5cdFx0XHRcdExvZy5lcnJvcihgRXhwZWN0ZWQgYmluZGluZyBtaXNzaW5nIGZvciB0YWJsZTogJHtvVGFibGUuZ2V0SWQoKX1gKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0JpbmRpbmcub0NvbnRleHQpIHtcblx0XHRcdFx0Zm5IYW5kbGVUYWJsZVBhdGNoRXZlbnRzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmbkhhbmRsZUNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAob0JpbmRpbmcub0NvbnRleHQpIHtcblx0XHRcdFx0XHRcdGZuSGFuZGxlVGFibGVQYXRjaEV2ZW50cygpO1xuXHRcdFx0XHRcdFx0b0JpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuSGFuZGxlQ2hhbmdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHRcdG9CaW5kaW5nLmF0dGFjaENoYW5nZShmbkhhbmRsZUNoYW5nZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChvQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdG9Nb2RlbCA9IG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpO1xuXG5cdFx0XHQvLyBDb21wdXRlIEVkaXQgTW9kZVxuXHRcdFx0b0ZpbmFsVUlTdGF0ZSA9IHRoaXMuX2VkaXRGbG93LmNvbXB1dGVFZGl0TW9kZShvQmluZGluZ0NvbnRleHQpO1xuXG5cdFx0XHRpZiAoTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQob01vZGVsLmdldE1ldGFNb2RlbCgpKSkge1xuXHRcdFx0XHRvRmluYWxVSVN0YXRlXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRjb25uZWN0KHRoaXMuZ2V0VmlldygpKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoaXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpKSB7XG5cdFx0XHRcdFx0XHRcdGRpc2Nvbm5lY3QodGhpcy5nZXRWaWV3KCkpOyAvLyBDbGVhbnVwIGNvbGxhYm9yYXRpb24gY29ubmVjdGlvbiBpbiBjYXNlIHdlIHN3aXRjaCB0byBhbm90aGVyIGVsZW1lbnQgKGUuZy4gaW4gRkNMKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgd2FpdGluZyBmb3IgdGhlIGZpbmFsIFVJIFN0YXRlXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyB1cGRhdGUgcmVsYXRlZCBhcHBzIG9uY2UgRGF0YSBpcyByZWNlaXZlZCBpbiBjYXNlIG9mIGJpbmRpbmcgY2FjaGUgaXMgbm90IGF2YWlsYWJsZVxuXHRcdFx0Ly8gVE9ETzogdGhpcyBpcyBvbmx5IGEgdGVtcCBzb2x1dGlvbiBzaW5jZSB3ZSBuZWVkIHRvIGNhbGwgX3VwZGF0ZVJlbGF0ZWRBcHBzIG1ldGhvZCBvbmx5IGFmdGVyIGRhdGEgZm9yIE9iamVjdCBQYWdlIGlzIHJlY2VpdmVkIChpZiB0aGVyZSBpcyBubyBiaW5kaW5nKVxuXHRcdFx0aWYgKG9CaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nKCkub0NhY2hlKSB7XG5cdFx0XHRcdHRoaXMuX3VwZGF0ZVJlbGF0ZWRBcHBzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmblVwZGF0ZVJlbGF0ZWRBcHBzID0gKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZVJlbGF0ZWRBcHBzKCk7XG5cdFx0XHRcdFx0b0JpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcoKS5kZXRhY2hEYXRhUmVjZWl2ZWQoZm5VcGRhdGVSZWxhdGVkQXBwcyk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdG9CaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nKCkuYXR0YWNoRGF0YVJlY2VpdmVkKGZuVXBkYXRlUmVsYXRlZEFwcHMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL0F0dGFjaCB0aGUgcGF0Y2ggc2VudCBhbmQgcGF0Y2ggY29tcGxldGVkIGV2ZW50IHRvIHRoZSBvYmplY3QgcGFnZSBiaW5kaW5nIHNvIHRoYXQgd2UgY2FuIHJlYWN0XG5cdFx0XHRjb25zdCBvQmluZGluZyA9IChvQmluZGluZ0NvbnRleHQuZ2V0QmluZGluZyAmJiBvQmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpKSB8fCBvQmluZGluZ0NvbnRleHQ7XG5cblx0XHRcdC8vIEF0dGFjaCB0aGUgZXZlbnQgaGFuZGxlciBvbmx5IG9uY2UgdG8gdGhlIHNhbWUgYmluZGluZ1xuXHRcdFx0aWYgKHRoaXMuY3VycmVudEJpbmRpbmcgIT09IG9CaW5kaW5nKSB7XG5cdFx0XHRcdG9CaW5kaW5nLmF0dGFjaEV2ZW50KFwicGF0Y2hTZW50XCIsIHRoaXMuZWRpdEZsb3cuaGFuZGxlUGF0Y2hTZW50LCB0aGlzKTtcblx0XHRcdFx0dGhpcy5jdXJyZW50QmluZGluZyA9IG9CaW5kaW5nO1xuXHRcdFx0fVxuXG5cdFx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRcdC8vIGFjY2VzcyBiaW5kaW5nIG9ubHkgYWZ0ZXIgdGFibGUgaXMgYm91bmRcblx0XHRcdFx0VGFibGVVdGlscy53aGVuQm91bmQob1RhYmxlKVxuXHRcdFx0XHRcdC50aGVuKGhhbmRsZVRhYmxlTW9kaWZpY2F0aW9ucylcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSB3YWl0aW5nIGZvciB0aGUgdGFibGUgdG8gYmUgYm91bmRcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoISh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkudXNlTmV3TGF6eUxvYWRpbmcpIHtcblx0XHRcdFx0Ly8gc2hvdWxkIGJlIGNhbGxlZCBvbmx5IGFmdGVyIGJpbmRpbmcgaXMgcmVhZHkgaGVuY2UgY2FsbGluZyBpdCBpbiBvbkFmdGVyQmluZGluZ1xuXHRcdFx0XHQob09iamVjdFBhZ2UgYXMgYW55KS5fdHJpZ2dlclZpc2libGVTdWJTZWN0aW9uc0V2ZW50cygpO1xuXHRcdFx0fVxuXG5cdFx0XHQvL1RvIENvbXB1dGUgdGhlIEVkaXQgQmluZGluZyBvZiB0aGUgc3ViT2JqZWN0IHBhZ2UgdXNpbmcgcm9vdCBvYmplY3QgcGFnZSwgY3JlYXRlIGEgY29udGV4dCBmb3IgZHJhZnQgcm9vdCBhbmQgdXBkYXRlIHRoZSBlZGl0IGJ1dHRvbiBpbiBzdWIgT1AgdXNpbmcgdGhlIGNvbnRleHRcblx0XHRcdEFjdGlvblJ1bnRpbWUudXBkYXRlRWRpdEJ1dHRvblZpc2liaWxpdHlBbmRFbmFibGVtZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUGFnZVJlYWR5KG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRjb25zdCBzZXRGb2N1cyA9ICgpID0+IHtcblx0XHRcdC8vIFNldCB0aGUgZm9jdXMgdG8gdGhlIGZpcnN0IGFjdGlvbiBidXR0b24sIG9yIHRvIHRoZSBmaXJzdCBlZGl0YWJsZSBpbnB1dCBpZiBpbiBlZGl0YWJsZSBtb2RlXG5cdFx0XHRjb25zdCBvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCk7XG5cdFx0XHRjb25zdCBpc0luRGlzcGxheU1vZGUgPSAhb09iamVjdFBhZ2UuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpO1xuXG5cdFx0XHRpZiAoaXNJbkRpc3BsYXlNb2RlKSB7XG5cdFx0XHRcdGNvbnN0IG9GaXJzdENsaWNrYWJsZUVsZW1lbnQgPSB0aGlzLl9nZXRGaXJzdENsaWNrYWJsZUVsZW1lbnQob09iamVjdFBhZ2UpO1xuXHRcdFx0XHRpZiAob0ZpcnN0Q2xpY2thYmxlRWxlbWVudCkge1xuXHRcdFx0XHRcdG9GaXJzdENsaWNrYWJsZUVsZW1lbnQuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb1NlbGVjdGVkU2VjdGlvbjogYW55ID0gQ29yZS5ieUlkKG9PYmplY3RQYWdlLmdldFNlbGVjdGVkU2VjdGlvbigpKTtcblx0XHRcdFx0aWYgKG9TZWxlY3RlZFNlY3Rpb24pIHtcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVGb2N1c0luRWRpdE1vZGUob1NlbGVjdGVkU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0Ly8gQXBwbHkgYXBwIHN0YXRlIG9ubHkgYWZ0ZXIgdGhlIHBhZ2UgaXMgcmVhZHkgd2l0aCB0aGUgZmlyc3Qgc2VjdGlvbiBzZWxlY3RlZFxuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdC8vU2hvdyBwb3B1cCB3aGlsZSBuYXZpZ2F0aW5nIGJhY2sgZnJvbSBvYmplY3QgcGFnZSBpbiBjYXNlIG9mIGRyYWZ0XG5cdFx0aWYgKG9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Y29uc3QgYklzU3RpY2t5TW9kZSA9IE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCgob0JpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbCkuZ2V0TWV0YU1vZGVsKCkpO1xuXHRcdFx0aWYgKCFiSXNTdGlja3lNb2RlKSB7XG5cdFx0XHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpO1xuXHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXRCYWNrTmF2aWdhdGlvbigoKSA9PiB0aGlzLl9vbkJhY2tOYXZpZ2F0aW9uSW5EcmFmdChvQmluZGluZ0NvbnRleHQpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qgdmlld0lkID0gdGhpcy5nZXRWaWV3KCkuZ2V0SWQoKTtcblx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpXG5cdFx0XHQuZ2V0QXBwU3RhdGVIYW5kbGVyKClcblx0XHRcdC5hcHBseUFwcFN0YXRlKHZpZXdJZCwgdGhpcy5nZXRWaWV3KCkpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGlmIChtUGFyYW1ldGVycy5mb3JjZUZvY3VzKSB7XG5cdFx0XHRcdFx0c2V0Rm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoRXJyb3IpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgc2V0dGluZyB0aGUgZm9jdXNcIiwgRXJyb3IpO1xuXHRcdFx0fSk7XG5cblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJlcnJvck5hdmlnYXRpb25TZWN0aW9uRmxhZ1wiLCBmYWxzZSk7XG5cdFx0dGhpcy5fY2hlY2tEYXRhUG9pbnRUaXRsZUZvckV4dGVybmFsTmF2aWdhdGlvbigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgc3RhdHVzIG9mIGVkaXQgbW9kZSBmb3Igc3RpY2t5IHNlc3Npb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBzdGF0dXMgb2YgZWRpdCBtb2RlIGZvciBzdGlja3kgc2Vzc2lvblxuXHQgKi9cblx0Z2V0U3RpY2t5RWRpdE1vZGUoKSB7XG5cdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQgJiYgKHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCk7XG5cdFx0bGV0IGJJc1N0aWNreUVkaXRNb2RlID0gZmFsc2U7XG5cdFx0aWYgKG9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Y29uc3QgYklzU3RpY2t5TW9kZSA9IE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvQmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0XHRpZiAoYklzU3RpY2t5TW9kZSkge1xuXHRcdFx0XHRiSXNTdGlja3lFZGl0TW9kZSA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGJJc1N0aWNreUVkaXRNb2RlO1xuXHR9XG5cblx0X2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkge1xuXHRcdHJldHVybiB0aGlzLmJ5SWQoXCJmZTo6T2JqZWN0UGFnZVwiKSBhcyBPYmplY3RQYWdlTGF5b3V0O1xuXHR9XG5cblx0X2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uKCkge1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRjb25zdCBvT2JqZWN0UGFnZVN1YnRpdGxlID0gb09iamVjdFBhZ2UuZ2V0Q3VzdG9tRGF0YSgpLmZpbmQoZnVuY3Rpb24gKG9DdXN0b21EYXRhOiBhbnkpIHtcblx0XHRcdHJldHVybiBvQ3VzdG9tRGF0YS5nZXRLZXkoKSA9PT0gXCJPYmplY3RQYWdlU3VidGl0bGVcIjtcblx0XHR9KTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGU6IG9PYmplY3RQYWdlLmRhdGEoXCJPYmplY3RQYWdlVGl0bGVcIikgfHwgXCJcIixcblx0XHRcdHN1YnRpdGxlOiBvT2JqZWN0UGFnZVN1YnRpdGxlICYmIG9PYmplY3RQYWdlU3VidGl0bGUuZ2V0VmFsdWUoKSxcblx0XHRcdGludGVudDogXCJcIixcblx0XHRcdGljb246IFwiXCJcblx0XHR9O1xuXHR9XG5cblx0X2V4ZWN1dGVIZWFkZXJTaG9ydGN1dChzSWQ6IGFueSkge1xuXHRcdGNvbnN0IHNCdXR0b25JZCA9IGAke3RoaXMuZ2V0VmlldygpLmdldElkKCl9LS0ke3NJZH1gLFxuXHRcdFx0b0J1dHRvbiA9ICh0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpLmdldEhlYWRlclRpdGxlKCkgYXMgT2JqZWN0UGFnZUR5bmFtaWNIZWFkZXJUaXRsZSlcblx0XHRcdFx0LmdldEFjdGlvbnMoKVxuXHRcdFx0XHQuZmluZChmdW5jdGlvbiAob0VsZW1lbnQ6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBvRWxlbWVudC5nZXRJZCgpID09PSBzQnV0dG9uSWQ7XG5cdFx0XHRcdH0pO1xuXHRcdGlmIChvQnV0dG9uKSB7XG5cdFx0XHRDb21tb25VdGlscy5maXJlQnV0dG9uUHJlc3Mob0J1dHRvbik7XG5cdFx0fVxuXHR9XG5cblx0X2V4ZWN1dGVGb290ZXJTaG9ydGN1dChzSWQ6IGFueSkge1xuXHRcdGNvbnN0IHNCdXR0b25JZCA9IGAke3RoaXMuZ2V0VmlldygpLmdldElkKCl9LS0ke3NJZH1gLFxuXHRcdFx0b0J1dHRvbiA9ICh0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpLmdldEZvb3RlcigpIGFzIGFueSkuZ2V0Q29udGVudCgpLmZpbmQoZnVuY3Rpb24gKG9FbGVtZW50OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9FbGVtZW50LmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpID09PSBcInNhcC5tLkJ1dHRvblwiICYmIG9FbGVtZW50LmdldElkKCkgPT09IHNCdXR0b25JZDtcblx0XHRcdH0pO1xuXHRcdENvbW1vblV0aWxzLmZpcmVCdXR0b25QcmVzcyhvQnV0dG9uKTtcblx0fVxuXG5cdF9leGVjdXRlVGFiU2hvcnRDdXQob0V4ZWN1dGlvbjogYW55KSB7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpLFxuXHRcdFx0YVNlY3Rpb25zID0gb09iamVjdFBhZ2UuZ2V0U2VjdGlvbnMoKSxcblx0XHRcdGlTZWN0aW9uSW5kZXhNYXggPSBhU2VjdGlvbnMubGVuZ3RoIC0gMSxcblx0XHRcdHNDb21tYW5kID0gb0V4ZWN1dGlvbi5vU291cmNlLmdldENvbW1hbmQoKTtcblx0XHRsZXQgbmV3U2VjdGlvbixcblx0XHRcdGlTZWxlY3RlZFNlY3Rpb25JbmRleCA9IG9PYmplY3RQYWdlLmluZGV4T2ZTZWN0aW9uKHRoaXMuYnlJZChvT2JqZWN0UGFnZS5nZXRTZWxlY3RlZFNlY3Rpb24oKSkgYXMgT2JqZWN0UGFnZVNlY3Rpb24pO1xuXHRcdGlmIChpU2VsZWN0ZWRTZWN0aW9uSW5kZXggIT09IC0xICYmIGlTZWN0aW9uSW5kZXhNYXggPiAwKSB7XG5cdFx0XHRpZiAoc0NvbW1hbmQgPT09IFwiTmV4dFRhYlwiKSB7XG5cdFx0XHRcdGlmIChpU2VsZWN0ZWRTZWN0aW9uSW5kZXggPD0gaVNlY3Rpb25JbmRleE1heCAtIDEpIHtcblx0XHRcdFx0XHRuZXdTZWN0aW9uID0gYVNlY3Rpb25zWysraVNlbGVjdGVkU2VjdGlvbkluZGV4XTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChpU2VsZWN0ZWRTZWN0aW9uSW5kZXggIT09IDApIHtcblx0XHRcdFx0Ly8gUHJldmlvdXNUYWJcblx0XHRcdFx0bmV3U2VjdGlvbiA9IGFTZWN0aW9uc1stLWlTZWxlY3RlZFNlY3Rpb25JbmRleF07XG5cdFx0XHR9XG5cblx0XHRcdGlmIChuZXdTZWN0aW9uKSB7XG5cdFx0XHRcdG9PYmplY3RQYWdlLnNldFNlbGVjdGVkU2VjdGlvbihuZXdTZWN0aW9uKTtcblx0XHRcdFx0bmV3U2VjdGlvbi5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9nZXRGb290ZXJWaXNpYmlsaXR5KCkge1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0Y29uc3Qgc1ZpZXdJZCA9IHRoaXMuZ2V0VmlldygpLmdldElkKCk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwibWVzc2FnZUZvb3RlckNvbnRhaW5zRXJyb3JzXCIsIGZhbHNlKTtcblx0XHRzYXAudWlcblx0XHRcdC5nZXRDb3JlKClcblx0XHRcdC5nZXRNZXNzYWdlTWFuYWdlcigpXG5cdFx0XHQuZ2V0TWVzc2FnZU1vZGVsKClcblx0XHRcdC5nZXREYXRhKClcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdGlmIChvTWVzc2FnZS52YWxpZGF0aW9uICYmIG9NZXNzYWdlLnR5cGUgPT09IFwiRXJyb3JcIiAmJiBvTWVzc2FnZS50YXJnZXQuaW5kZXhPZihzVmlld0lkKSA+IC0xKSB7XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwibWVzc2FnZUZvb3RlckNvbnRhaW5zRXJyb3JzXCIsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0fVxuXG5cdF9zaG93TWVzc2FnZVBvcG92ZXIoZXJyPzogYW55LCBvUmV0PzogYW55KSB7XG5cdFx0aWYgKGVycikge1xuXHRcdFx0TG9nLmVycm9yKGVycik7XG5cdFx0fVxuXHRcdGNvbnN0IHJvb3RWaWV3Q29udHJvbGxlciA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXHRcdGNvbnN0IGN1cnJlbnRQYWdlVmlldyA9IHJvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKVxuXHRcdFx0PyByb290Vmlld0NvbnRyb2xsZXIuZ2V0UmlnaHRtb3N0VmlldygpXG5cdFx0XHQ6ICh0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFJvb3RDb250YWluZXIoKSBhcyBhbnkpLmdldEN1cnJlbnRQYWdlKCk7XG5cdFx0aWYgKCFjdXJyZW50UGFnZVZpZXcuaXNBKFwic2FwLm0uTWVzc2FnZVBhZ2VcIikpIHtcblx0XHRcdGNvbnN0IG9NZXNzYWdlQnV0dG9uID0gdGhpcy5tZXNzYWdlQnV0dG9uLFxuXHRcdFx0XHRvTWVzc2FnZVBvcG92ZXIgPSBvTWVzc2FnZUJ1dHRvbi5vTWVzc2FnZVBvcG92ZXIsXG5cdFx0XHRcdG9JdGVtQmluZGluZyA9IG9NZXNzYWdlUG9wb3Zlci5nZXRCaW5kaW5nKFwiaXRlbXNcIik7XG5cblx0XHRcdGlmIChvSXRlbUJpbmRpbmcuZ2V0TGVuZ3RoKCkgPiAwICYmICFvTWVzc2FnZVBvcG92ZXIuaXNPcGVuKCkpIHtcblx0XHRcdFx0b01lc3NhZ2VCdXR0b24uc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdFx0Ly8gd29ya2Fyb3VuZCB0byBlbnN1cmUgdGhhdCBvTWVzc2FnZUJ1dHRvbiBpcyByZW5kZXJlZCB3aGVuIG9wZW5CeSBpcyBjYWxsZWRcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0b01lc3NhZ2VQb3BvdmVyLm9wZW5CeShvTWVzc2FnZUJ1dHRvbik7XG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1JldDtcblx0fVxuXG5cdF9lZGl0RG9jdW1lbnQob0NvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIik7XG5cdFx0QnVzeUxvY2tlci5sb2NrKG9Nb2RlbCk7XG5cdFx0cmV0dXJuIHRoaXMuZWRpdEZsb3cuZWRpdERvY3VtZW50LmFwcGx5KHRoaXMuZWRpdEZsb3csIFtvQ29udGV4dF0pLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0QnVzeUxvY2tlci51bmxvY2sob01vZGVsKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBjb250ZXh0IG9mIHRoZSBEcmFmdFJvb3QgcGF0aC5cblx0ICogSWYgYSB2aWV3IGhhcyBiZWVuIGNyZWF0ZWQgd2l0aCB0aGUgZHJhZnQgUm9vdCBQYXRoLCB0aGlzIG1ldGhvZCByZXR1cm5zIGl0cyBiaW5kaW5nQ29udGV4dC5cblx0ICogV2hlcmUgbm8gdmlldyBpcyBmb3VuZCBhIG5ldyBjcmVhdGVkIGNvbnRleHQgaXMgcmV0dXJuZWQuXG5cdCAqIFRoZSBuZXcgY3JlYXRlZCBjb250ZXh0IHJlcXVlc3QgdGhlIGtleSBvZiB0aGUgZW50aXR5IGluIG9yZGVyIHRvIGdldCB0aGUgRXRhZyBvZiB0aGlzIGVudGl0eS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldERyYWZ0Um9vdFBhdGhcblx0ICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2Vcblx0ICovXG5cdGFzeW5jIGdldERyYWZ0Um9vdENvbnRleHQoKTogUHJvbWlzZTxDb250ZXh0IHwgdW5kZWZpbmVkPiB7XG5cdFx0Y29uc3QgdmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdGNvbnN0IGNvbnRleHQgPSB2aWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0Y29uc3QgZHJhZnRSb290Q29udGV4dFBhdGggPSBNb2RlbEhlbHBlci5nZXREcmFmdFJvb3RQYXRoKGNvbnRleHQpO1xuXHRcdFx0bGV0IHNpbXBsZURyYWZ0Um9vdENvbnRleHQ6IENvbnRleHQ7XG5cdFx0XHRpZiAoZHJhZnRSb290Q29udGV4dFBhdGgpIHtcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgYSB2aWV3IG1hdGNoZXMgd2l0aCB0aGUgZHJhZnQgcm9vdCBwYXRoXG5cdFx0XHRcdGNvbnN0IGV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2UgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpXG5cdFx0XHRcdFx0LmdldFJvb3RWaWV3Q29udHJvbGxlcigpXG5cdFx0XHRcdFx0LmdldEluc3RhbmNlZFZpZXdzKClcblx0XHRcdFx0XHQuZmluZCgocGFnZVZpZXc6IFZpZXcpID0+IHBhZ2VWaWV3LmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKSA9PT0gZHJhZnRSb290Q29udGV4dFBhdGgpXG5cdFx0XHRcdFx0Py5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRcdGlmIChleGlzdGluZ0JpbmRpbmdDb250ZXh0T25QYWdlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGV4aXN0aW5nQmluZGluZ0NvbnRleHRPblBhZ2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdHNpbXBsZURyYWZ0Um9vdENvbnRleHQgPSBpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KFwiL3NpbXBsZURyYWZ0Um9vdENvbnRleHRcIik7XG5cdFx0XHRcdGlmIChzaW1wbGVEcmFmdFJvb3RDb250ZXh0Py5nZXRQYXRoKCkgPT09IGRyYWZ0Um9vdENvbnRleHRQYXRoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNpbXBsZURyYWZ0Um9vdENvbnRleHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgbW9kZWwgPSBjb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0XHRcdHNpbXBsZURyYWZ0Um9vdENvbnRleHQgPSBtb2RlbC5iaW5kQ29udGV4dChkcmFmdFJvb3RDb250ZXh0UGF0aCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdGF3YWl0IENvbW1vblV0aWxzLndhaXRGb3JDb250ZXh0UmVxdWVzdGVkKHNpbXBsZURyYWZ0Um9vdENvbnRleHQpO1xuXHRcdFx0XHQvLyBTdG9yZSB0aGlzIG5ldyBjcmVhdGVkIGNvbnRleHQgdG8gdXNlIGl0IG9uIHRoZSBuZXh0IGl0ZXJhdGlvbnNcblx0XHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9zaW1wbGVEcmFmdFJvb3RDb250ZXh0XCIsIHNpbXBsZURyYWZ0Um9vdENvbnRleHQpO1xuXHRcdFx0XHRyZXR1cm4gc2ltcGxlRHJhZnRSb290Q29udGV4dDtcblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRhc3luYyBfdmFsaWRhdGVEb2N1bWVudCgpOiBQcm9taXNlPHZvaWQgfCBhbnlbXSB8IE9EYXRhQ29udGV4dEJpbmRpbmc+IHtcblx0XHRjb25zdCBjb250cm9sID0gQ29yZS5ieUlkKENvcmUuZ2V0Q3VycmVudEZvY3VzZWRDb250cm9sSWQoKSk7XG5cdFx0Y29uc3QgY29udGV4dCA9IGNvbnRyb2w/LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRpZiAoY29udGV4dCAmJiAhY29udGV4dC5pc1RyYW5zaWVudCgpKSB7XG5cdFx0XHQvLyBXYWl0IGZvciB0aGUgcGVuZGluZyBjaGFuZ2VzIGJlZm9yZSBzdGFydGluZyB0aGlzIHZhbGlkYXRpb25cblx0XHRcdGF3YWl0IHRoaXMuX2VkaXRGbG93LnN5bmNUYXNrKCk7XG5cdFx0XHRjb25zdCBhcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNTZXJ2aWNlID0gYXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IHNpZGVFZmZlY3RzU2VydmljZS5nZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoY29udGV4dCk7XG5cdFx0XHRjb25zdCBnbG9iYWxTaWRlRWZmZWN0cyA9IGVudGl0eVR5cGUgPyBzaWRlRWZmZWN0c1NlcnZpY2UuZ2V0R2xvYmFsT0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlKSA6IFtdO1xuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIGdsb2JhbCBTaWRlRWZmZWN0cyBmb3IgdGhlIHJlbGF0ZWQgZW50aXR5LCBleGVjdXRlIGl0L3RoZW1cblx0XHRcdGlmIChnbG9iYWxTaWRlRWZmZWN0cy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKGdsb2JhbFNpZGVFZmZlY3RzLm1hcCgoc2lkZUVmZmVjdHMpID0+IHRoaXMuX3NpZGVFZmZlY3RzLnJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0cywgY29udGV4dCkpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGRyYWZ0Um9vdENvbnRleHQgPSBhd2FpdCB0aGlzLmdldERyYWZ0Um9vdENvbnRleHQoKTtcblx0XHRcdFx0Ly9FeGVjdXRlIHRoZSBkcmFmdFZhbGlkYXRpb24gaWYgdGhlcmUgaXMgbm8gZ2xvYmFsU2lkZUVmZmVjdHMgKGlnbm9yZSBFVGFncyBpbiBjb2xsYWJvcmF0aW9uIGRyYWZ0KVxuXHRcdFx0XHRpZiAoZHJhZnRSb290Q29udGV4dCkge1xuXHRcdFx0XHRcdHJldHVybiBkcmFmdC5leGVjdXRlRHJhZnRWYWxpZGF0aW9uKGRyYWZ0Um9vdENvbnRleHQsIGFwcENvbXBvbmVudCwgaXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0YXN5bmMgX3NhdmVEb2N1bWVudChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKSxcblx0XHRcdGFXYWl0Q3JlYXRlRG9jdW1lbnRzOiBhbnlbXSA9IFtdO1xuXHRcdC8vIGluZGljYXRlcyBpZiB3ZSBhcmUgY3JlYXRpbmcgYSBuZXcgcm93IGluIHRoZSBPUFxuXHRcdGxldCBiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciA9IGZhbHNlO1xuXHRcdEJ1c3lMb2NrZXIubG9jayhvTW9kZWwpO1xuXHRcdHRoaXMuX2ZpbmRUYWJsZXMoKS5mb3JFYWNoKChvVGFibGU6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgb0JpbmRpbmcgPSB0aGlzLl9nZXRUYWJsZUJpbmRpbmcob1RhYmxlKTtcblx0XHRcdGNvbnN0IG1QYXJhbWV0ZXJzOiBhbnkgPSB7XG5cdFx0XHRcdGNyZWF0aW9uTW9kZTogb1RhYmxlLmRhdGEoXCJjcmVhdGlvbk1vZGVcIiksXG5cdFx0XHRcdGNyZWF0aW9uUm93OiBvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKSxcblx0XHRcdFx0Y3JlYXRlQXRFbmQ6IG9UYWJsZS5kYXRhKFwiY3JlYXRlQXRFbmRcIikgPT09IFwidHJ1ZVwiXG5cdFx0XHR9O1xuXHRcdFx0Y29uc3QgYkNyZWF0ZURvY3VtZW50ID1cblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cgJiZcblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cuZ2V0QmluZGluZ0NvbnRleHQoKSAmJlxuXHRcdFx0XHRPYmplY3Qua2V5cyhtUGFyYW1ldGVycy5jcmVhdGlvblJvdy5nZXRCaW5kaW5nQ29udGV4dCgpLmdldE9iamVjdCgpKS5sZW5ndGggPiAxO1xuXHRcdFx0aWYgKGJDcmVhdGVEb2N1bWVudCkge1xuXHRcdFx0XHQvLyB0aGUgYlNraXBTaWRlRWZmZWN0cyBpcyBhIHBhcmFtZXRlciBjcmVhdGVkIHdoZW4gd2UgY2xpY2sgdGhlIHNhdmUga2V5LiBJZiB3ZSBwcmVzcyB0aGlzIGtleVxuXHRcdFx0XHQvLyB3ZSBkb24ndCBleGVjdXRlIHRoZSBoYW5kbGVTaWRlRWZmZWN0cyBmdW5jaXRvbiB0byBhdm9pZCBiYXRjaCByZWR1bmRhbmN5XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmJTa2lwU2lkZUVmZmVjdHMgPSB0cnVlO1xuXHRcdFx0XHRiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciA9IHRydWU7XG5cdFx0XHRcdGFXYWl0Q3JlYXRlRG9jdW1lbnRzLnB1c2goXG5cdFx0XHRcdFx0dGhpcy5lZGl0Rmxvdy5jcmVhdGVEb2N1bWVudChvQmluZGluZywgbVBhcmFtZXRlcnMpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9CaW5kaW5nO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgYUJpbmRpbmdzID0gYXdhaXQgUHJvbWlzZS5hbGwoYVdhaXRDcmVhdGVEb2N1bWVudHMpO1xuXHRcdFx0Y29uc3QgbVBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yOiBiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvcixcblx0XHRcdFx0YmluZGluZ3M6IGFCaW5kaW5nc1xuXHRcdFx0fTtcblx0XHRcdC8vIFdlIG5lZWQgdG8gZWl0aGVyIHJlamVjdCBvciByZXNvbHZlIGEgcHJvbWlzZSBoZXJlIGFuZCByZXR1cm4gaXQgc2luY2UgdGhpcyBzYXZlXG5cdFx0XHQvLyBmdW5jdGlvbiBpcyBub3Qgb25seSBjYWxsZWQgd2hlbiBwcmVzc2luZyB0aGUgc2F2ZSBidXR0b24gaW4gdGhlIGZvb3RlciwgYnV0IGFsc29cblx0XHRcdC8vIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBjcmVhdGUgb3Igc2F2ZSBpbiBhIGRhdGFsb3NzIHBvcHVwLlxuXHRcdFx0Ly8gVGhlIGxvZ2ljIG9mIHRoZSBkYXRhbG9zcyBwb3B1cCBuZWVkcyB0byBkZXRlY3QgaWYgdGhlIHNhdmUgaGFkIGVycm9ycyBvciBub3QgaW4gb3JkZXJcblx0XHRcdC8vIHRvIGRlY2lkZSBpZiB0aGUgc3Vic2VxdWVudCBhY3Rpb24gLSBsaWtlIGEgYmFjayBuYXZpZ2F0aW9uIC0gaGFzIHRvIGJlIGV4ZWN1dGVkIG9yIG5vdC5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuZWRpdEZsb3cuc2F2ZURvY3VtZW50KG9Db250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdC8vIElmIHRoZSBzYXZlRG9jdW1lbnQgaW4gZWRpdEZsb3cgcmV0dXJucyBlcnJvcnMgd2UgbmVlZFxuXHRcdFx0XHQvLyB0byBzaG93IHRoZSBtZXNzYWdlIHBvcG92ZXIgaGVyZSBhbmQgZW5zdXJlIHRoYXQgdGhlXG5cdFx0XHRcdC8vIGRhdGFsb3NzIGxvZ2ljIGRvZXMgbm90IHBlcmZvcm0gdGhlIGZvbGxvdyB1cCBmdW5jdGlvblxuXHRcdFx0XHQvLyBsaWtlIGUuZy4gYSBiYWNrIG5hdmlnYXRpb24gaGVuY2Ugd2UgcmV0dXJuIGEgcHJvbWlzZSBhbmQgcmVqZWN0IGl0XG5cdFx0XHRcdHRoaXMuX3Nob3dNZXNzYWdlUG9wb3ZlcihlcnJvcik7XG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvTW9kZWwpKSB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9Nb2RlbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X21hbmFnZUNvbGxhYm9yYXRpb24oKSB7XG5cdFx0b3Blbk1hbmFnZURpYWxvZyh0aGlzLmdldFZpZXcoKSk7XG5cdH1cblxuXHRfc2hvd0NvbGxhYm9yYXRpb25Vc2VyRGV0YWlscyhldmVudDogYW55KSB7XG5cdFx0c2hvd1VzZXJEZXRhaWxzKGV2ZW50LCB0aGlzLmdldFZpZXcoKSk7XG5cdH1cblxuXHRfY2FuY2VsRG9jdW1lbnQob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdG1QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbiA9IHRoaXMuZ2V0VmlldygpLmJ5SWQobVBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uKTsgLy90byBnZXQgdGhlIHJlZmVyZW5jZSBvZiB0aGUgY2FuY2VsIGJ1dHRvbiBmcm9tIGNvbW1hbmQgZXhlY3V0aW9uXG5cdFx0cmV0dXJuIHRoaXMuZWRpdEZsb3cuY2FuY2VsRG9jdW1lbnQob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0fVxuXG5cdF9hcHBseURvY3VtZW50KG9Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5lZGl0Rmxvdy5hcHBseURvY3VtZW50KG9Db250ZXh0KS5jYXRjaCgoKSA9PiB0aGlzLl9zaG93TWVzc2FnZVBvcG92ZXIoKSk7XG5cdH1cblxuXHRfdXBkYXRlUmVsYXRlZEFwcHMoKSB7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdGlmIChDb21tb25VdGlscy5yZXNvbHZlU3RyaW5ndG9Cb29sZWFuKG9PYmplY3RQYWdlLmRhdGEoXCJzaG93UmVsYXRlZEFwcHNcIikpKSB7XG5cdFx0XHRDb21tb25VdGlscy51cGRhdGVSZWxhdGVkQXBwc0RldGFpbHMob09iamVjdFBhZ2UpO1xuXHRcdH1cblx0fVxuXG5cdF9maW5kQ29udHJvbEluU3ViU2VjdGlvbihhUGFyZW50RWxlbWVudDogYW55LCBhU3Vic2VjdGlvbjogYW55LCBhQ29udHJvbHM6IGFueSwgYklzQ2hhcnQ/OiBib29sZWFuKSB7XG5cdFx0Y29uc3QgYVN1YlNlY3Rpb25UYWJsZXMgPSBbXTtcblx0XHRmb3IgKGxldCBlbGVtZW50ID0gMDsgZWxlbWVudCA8IGFQYXJlbnRFbGVtZW50Lmxlbmd0aDsgZWxlbWVudCsrKSB7XG5cdFx0XHRsZXQgb0VsZW1lbnQgPSBhUGFyZW50RWxlbWVudFtlbGVtZW50XS5nZXRDb250ZW50IGluc3RhbmNlb2YgRnVuY3Rpb24gJiYgYVBhcmVudEVsZW1lbnRbZWxlbWVudF0uZ2V0Q29udGVudCgpO1xuXHRcdFx0aWYgKGJJc0NoYXJ0KSB7XG5cdFx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5tQWdncmVnYXRpb25zICYmIG9FbGVtZW50LmdldEFnZ3JlZ2F0aW9uKFwiaXRlbXNcIikpIHtcblx0XHRcdFx0XHRjb25zdCBhSXRlbXMgPSBvRWxlbWVudC5nZXRBZ2dyZWdhdGlvbihcIml0ZW1zXCIpO1xuXHRcdFx0XHRcdGFJdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChvSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAob0l0ZW0uaXNBKFwic2FwLmZlLm1hY3Jvcy5jaGFydC5DaGFydEFQSVwiKSkge1xuXHRcdFx0XHRcdFx0XHRvRWxlbWVudCA9IG9JdGVtO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQuaXNBICYmIG9FbGVtZW50LmlzQShcInNhcC51aS5sYXlvdXQuRHluYW1pY1NpZGVDb250ZW50XCIpKSB7XG5cdFx0XHRcdG9FbGVtZW50ID0gb0VsZW1lbnQuZ2V0TWFpbkNvbnRlbnQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBvRWxlbWVudC5nZXRNYWluQ29udGVudCgpO1xuXHRcdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdG9FbGVtZW50ID0gb0VsZW1lbnRbMF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5pc0EgJiYgb0VsZW1lbnQuaXNBKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5UYWJsZUFQSVwiKSkge1xuXHRcdFx0XHRvRWxlbWVudCA9IG9FbGVtZW50LmdldENvbnRlbnQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBvRWxlbWVudC5nZXRDb250ZW50KCk7XG5cdFx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudFswXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50LmlzQSAmJiBvRWxlbWVudC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpKSB7XG5cdFx0XHRcdGFDb250cm9scy5wdXNoKG9FbGVtZW50KTtcblx0XHRcdFx0YVN1YlNlY3Rpb25UYWJsZXMucHVzaCh7XG5cdFx0XHRcdFx0dGFibGU6IG9FbGVtZW50LFxuXHRcdFx0XHRcdGdyaWRUYWJsZTogb0VsZW1lbnQuZ2V0VHlwZSgpLmlzQShcInNhcC51aS5tZGMudGFibGUuR3JpZFRhYmxlVHlwZVwiKVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50LmlzQSAmJiBvRWxlbWVudC5pc0EoXCJzYXAuZmUubWFjcm9zLmNoYXJ0LkNoYXJ0QVBJXCIpKSB7XG5cdFx0XHRcdG9FbGVtZW50ID0gb0VsZW1lbnQuZ2V0Q29udGVudCBpbnN0YW5jZW9mIEZ1bmN0aW9uICYmIG9FbGVtZW50LmdldENvbnRlbnQoKTtcblx0XHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRvRWxlbWVudCA9IG9FbGVtZW50WzBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQuaXNBICYmIG9FbGVtZW50LmlzQShcInNhcC51aS5tZGMuQ2hhcnRcIikpIHtcblx0XHRcdFx0YUNvbnRyb2xzLnB1c2gob0VsZW1lbnQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHRhU3ViU2VjdGlvblRhYmxlcy5sZW5ndGggPT09IDEgJiZcblx0XHRcdGFQYXJlbnRFbGVtZW50Lmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0YVN1YlNlY3Rpb25UYWJsZXNbMF0uZ3JpZFRhYmxlICYmXG5cdFx0XHQhYVN1YnNlY3Rpb24uaGFzU3R5bGVDbGFzcyhcInNhcFV4QVBPYmplY3RQYWdlU3ViU2VjdGlvbkZpdENvbnRhaW5lclwiKVxuXHRcdCkge1xuXHRcdFx0Ly9JbiBjYXNlIHRoZXJlIGlzIG9ubHkgYSBzaW5nbGUgdGFibGUgaW4gYSBzZWN0aW9uIHdlIGZpdCB0aGF0IHRvIHRoZSB3aG9sZSBwYWdlIHNvIHRoYXQgdGhlIHNjcm9sbGJhciBjb21lcyBvbmx5IG9uIHRhYmxlIGFuZCBub3Qgb24gcGFnZVxuXHRcdFx0YVN1YnNlY3Rpb24uYWRkU3R5bGVDbGFzcyhcInNhcFV4QVBPYmplY3RQYWdlU3ViU2VjdGlvbkZpdENvbnRhaW5lclwiKTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0QWxsU3ViU2VjdGlvbnMoKSB7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdGxldCBhU3ViU2VjdGlvbnM6IGFueVtdID0gW107XG5cdFx0b09iamVjdFBhZ2UuZ2V0U2VjdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvU2VjdGlvbjogYW55KSB7XG5cdFx0XHRhU3ViU2VjdGlvbnMgPSBhU3ViU2VjdGlvbnMuY29uY2F0KG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKCkpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBhU3ViU2VjdGlvbnM7XG5cdH1cblxuXHRfZ2V0QWxsQmxvY2tzKCkge1xuXHRcdGxldCBhQmxvY2tzOiBhbnlbXSA9IFtdO1xuXHRcdHRoaXMuX2dldEFsbFN1YlNlY3Rpb25zKCkuZm9yRWFjaChmdW5jdGlvbiAob1N1YlNlY3Rpb246IGFueSkge1xuXHRcdFx0YUJsb2NrcyA9IGFCbG9ja3MuY29uY2F0KG9TdWJTZWN0aW9uLmdldEJsb2NrcygpKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gYUJsb2Nrcztcblx0fVxuXG5cdF9maW5kVGFibGVzKCkge1xuXHRcdGNvbnN0IGFTdWJTZWN0aW9ucyA9IHRoaXMuX2dldEFsbFN1YlNlY3Rpb25zKCk7XG5cdFx0Y29uc3QgYVRhYmxlczogYW55W10gPSBbXTtcblx0XHRmb3IgKGxldCBzdWJTZWN0aW9uID0gMDsgc3ViU2VjdGlvbiA8IGFTdWJTZWN0aW9ucy5sZW5ndGg7IHN1YlNlY3Rpb24rKykge1xuXHRcdFx0dGhpcy5fZmluZENvbnRyb2xJblN1YlNlY3Rpb24oYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLmdldEJsb2NrcygpLCBhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0sIGFUYWJsZXMpO1xuXHRcdFx0dGhpcy5fZmluZENvbnRyb2xJblN1YlNlY3Rpb24oYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLmdldE1vcmVCbG9ja3MoKSwgYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLCBhVGFibGVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFUYWJsZXM7XG5cdH1cblxuXHRfZmluZENoYXJ0cygpIHtcblx0XHRjb25zdCBhU3ViU2VjdGlvbnMgPSB0aGlzLl9nZXRBbGxTdWJTZWN0aW9ucygpO1xuXHRcdGNvbnN0IGFDaGFydHM6IGFueVtdID0gW107XG5cdFx0Zm9yIChsZXQgc3ViU2VjdGlvbiA9IDA7IHN1YlNlY3Rpb24gPCBhU3ViU2VjdGlvbnMubGVuZ3RoOyBzdWJTZWN0aW9uKyspIHtcblx0XHRcdHRoaXMuX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uKGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXS5nZXRCbG9ja3MoKSwgYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLCBhQ2hhcnRzLCB0cnVlKTtcblx0XHRcdHRoaXMuX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uKGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXS5nZXRNb3JlQmxvY2tzKCksIGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXSwgYUNoYXJ0cywgdHJ1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiBhQ2hhcnRzO1xuXHR9XG5cblx0X2Nsb3NlU2lkZUNvbnRlbnQoKSB7XG5cdFx0dGhpcy5fZ2V0QWxsQmxvY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAob0Jsb2NrOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db250ZW50ID0gb0Jsb2NrLmdldENvbnRlbnQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBvQmxvY2suZ2V0Q29udGVudCgpO1xuXHRcdFx0aWYgKG9Db250ZW50ICYmIG9Db250ZW50LmlzQSAmJiBvQ29udGVudC5pc0EoXCJzYXAudWkubGF5b3V0LkR5bmFtaWNTaWRlQ29udGVudFwiKSkge1xuXHRcdFx0XHRpZiAob0NvbnRlbnQuc2V0U2hvd1NpZGVDb250ZW50IGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRvQ29udGVudC5zZXRTaG93U2lkZUNvbnRlbnQoZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhcnQgQ29udGV4dCBpcyByZXNvbHZlZCBmb3IgMTpuIG1pY3JvY2hhcnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NoYXJ0Q29udGV4dCBUaGUgQ29udGV4dCBvZiB0aGUgTWljcm9DaGFydFxuXHQgKiBAcGFyYW0gc0NoYXJ0UGF0aCBUaGUgY29sbGVjdGlvblBhdGggb2YgdGhlIHRoZSBjaGFydFxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBBdHRyaWJ1dGVzIG9mIHRoZSBjaGFydCBDb250ZXh0XG5cdCAqL1xuXHRfZ2V0Q2hhcnRDb250ZXh0RGF0YShvQ2hhcnRDb250ZXh0OiBhbnksIHNDaGFydFBhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IG9Db250ZXh0RGF0YSA9IG9DaGFydENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0bGV0IG9DaGFydENvbnRleHREYXRhID0gW29Db250ZXh0RGF0YV07XG5cdFx0aWYgKG9DaGFydENvbnRleHQgJiYgc0NoYXJ0UGF0aCkge1xuXHRcdFx0aWYgKG9Db250ZXh0RGF0YVtzQ2hhcnRQYXRoXSkge1xuXHRcdFx0XHRvQ2hhcnRDb250ZXh0RGF0YSA9IG9Db250ZXh0RGF0YVtzQ2hhcnRQYXRoXTtcblx0XHRcdFx0ZGVsZXRlIG9Db250ZXh0RGF0YVtzQ2hhcnRQYXRoXTtcblx0XHRcdFx0b0NoYXJ0Q29udGV4dERhdGEucHVzaChvQ29udGV4dERhdGEpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb0NoYXJ0Q29udGV4dERhdGE7XG5cdH1cblxuXHQvKipcblx0ICogU2Nyb2xsIHRoZSB0YWJsZXMgdG8gdGhlIHJvdyB3aXRoIHRoZSBzUGF0aFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLk9iamVjdFBhZ2VDb250cm9sbGVyLmNvbnRyb2xsZXIjX3Njcm9sbFRhYmxlc1RvUm93XG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzUm93UGF0aCAnc1BhdGggb2YgdGhlIHRhYmxlIHJvdydcblx0ICovXG5cblx0X3Njcm9sbFRhYmxlc1RvUm93KHNSb3dQYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAodGhpcy5fZmluZFRhYmxlcyAmJiB0aGlzLl9maW5kVGFibGVzKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3QgYVRhYmxlcyA9IHRoaXMuX2ZpbmRUYWJsZXMoKTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVRhYmxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRUYWJsZVNjcm9sbGVyLnNjcm9sbFRhYmxlVG9Sb3coYVRhYmxlc1tpXSwgc1Jvd1BhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gbWVyZ2Ugc2VsZWN0ZWQgY29udGV4dHMgYW5kIGZpbHRlcnMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfbWVyZ2VNdWx0aXBsZUNvbnRleHRzXG5cdCAqIEBwYXJhbSBvUGFnZUNvbnRleHQgUGFnZSBjb250ZXh0XG5cdCAqIEBwYXJhbSBhTGluZUNvbnRleHQgU2VsZWN0ZWQgQ29udGV4dHNcblx0ICogQHBhcmFtIHNDaGFydFBhdGggQ29sbGVjdGlvbiBuYW1lIG9mIHRoZSBjaGFydFxuXHQgKiBAcmV0dXJucyBTZWxlY3Rpb24gVmFyaWFudCBPYmplY3Rcblx0ICovXG5cdF9tZXJnZU11bHRpcGxlQ29udGV4dHMob1BhZ2VDb250ZXh0OiBDb250ZXh0LCBhTGluZUNvbnRleHQ6IGFueVtdLCBzQ2hhcnRQYXRoOiBzdHJpbmcpIHtcblx0XHRsZXQgYUF0dHJpYnV0ZXM6IGFueVtdID0gW10sXG5cdFx0XHRhUGFnZUF0dHJpYnV0ZXMgPSBbXSxcblx0XHRcdG9Db250ZXh0LFxuXHRcdFx0c01ldGFQYXRoTGluZTogc3RyaW5nLFxuXHRcdFx0c1BhdGhMaW5lO1xuXG5cdFx0Y29uc3Qgc1BhZ2VQYXRoID0gb1BhZ2VDb250ZXh0LmdldFBhdGgoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1BhZ2VDb250ZXh0ICYmIG9QYWdlQ29udGV4dC5nZXRNb2RlbCgpICYmIG9QYWdlQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IHNNZXRhUGF0aFBhZ2UgPSBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhZ2VQYXRoKS5yZXBsYWNlKC9eXFwvKi8sIFwiXCIpO1xuXG5cdFx0Ly8gR2V0IHNpbmdsZSBsaW5lIGNvbnRleHQgaWYgbmVjZXNzYXJ5XG5cdFx0aWYgKGFMaW5lQ29udGV4dCAmJiBhTGluZUNvbnRleHQubGVuZ3RoKSB7XG5cdFx0XHRvQ29udGV4dCA9IGFMaW5lQ29udGV4dFswXTtcblx0XHRcdHNQYXRoTGluZSA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRcdHNNZXRhUGF0aExpbmUgPSBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGhMaW5lKS5yZXBsYWNlKC9eXFwvKi8sIFwiXCIpO1xuXG5cdFx0XHRhTGluZUNvbnRleHQuZm9yRWFjaCgob1NpbmdsZUNvbnRleHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoc0NoYXJ0UGF0aCkge1xuXHRcdFx0XHRcdGNvbnN0IG9DaGFydENvbnRleHREYXRhID0gdGhpcy5fZ2V0Q2hhcnRDb250ZXh0RGF0YShvU2luZ2xlQ29udGV4dCwgc0NoYXJ0UGF0aCk7XG5cdFx0XHRcdFx0aWYgKG9DaGFydENvbnRleHREYXRhKSB7XG5cdFx0XHRcdFx0XHRhQXR0cmlidXRlcyA9IG9DaGFydENvbnRleHREYXRhLm1hcChmdW5jdGlvbiAob1N1YkNoYXJ0Q29udGV4dERhdGE6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHREYXRhOiBvU3ViQ2hhcnRDb250ZXh0RGF0YSxcblx0XHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IGAke3NNZXRhUGF0aFBhZ2V9LyR7c0NoYXJ0UGF0aH1gXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUF0dHJpYnV0ZXMucHVzaCh7XG5cdFx0XHRcdFx0XHRjb250ZXh0RGF0YTogb1NpbmdsZUNvbnRleHQuZ2V0T2JqZWN0KCksXG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IHNNZXRhUGF0aExpbmVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGFQYWdlQXR0cmlidXRlcy5wdXNoKHtcblx0XHRcdGNvbnRleHREYXRhOiBvUGFnZUNvbnRleHQuZ2V0T2JqZWN0KCksXG5cdFx0XHRlbnRpdHlTZXQ6IHNNZXRhUGF0aFBhZ2Vcblx0XHR9KTtcblx0XHQvLyBBZGRpbmcgUGFnZSBDb250ZXh0IHRvIHNlbGVjdGlvbiB2YXJpYW50XG5cdFx0YVBhZ2VBdHRyaWJ1dGVzID0gQ29tbW9uVXRpbHMucmVtb3ZlU2Vuc2l0aXZlRGF0YShhUGFnZUF0dHJpYnV0ZXMsIG9NZXRhTW9kZWwpO1xuXHRcdGNvbnN0IG9QYWdlTGV2ZWxTViA9IENvbW1vblV0aWxzLmFkZFBhZ2VDb250ZXh0VG9TZWxlY3Rpb25WYXJpYW50KG5ldyBTZWxlY3Rpb25WYXJpYW50KCksIGFQYWdlQXR0cmlidXRlcywgdGhpcy5nZXRWaWV3KCkpO1xuXHRcdGFBdHRyaWJ1dGVzID0gQ29tbW9uVXRpbHMucmVtb3ZlU2Vuc2l0aXZlRGF0YShhQXR0cmlidXRlcywgb01ldGFNb2RlbCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IG9QYWdlTGV2ZWxTVixcblx0XHRcdGF0dHJpYnV0ZXM6IGFBdHRyaWJ1dGVzXG5cdFx0fTtcblx0fVxuXG5cdF9nZXRCYXRjaEdyb3Vwc0ZvclZpZXcoKSB7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gdGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnksXG5cdFx0XHRvQ29uZmlndXJhdGlvbnMgPSBvVmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb24sXG5cdFx0XHRhQ29uZmlndXJhdGlvbnMgPSBvQ29uZmlndXJhdGlvbnMgJiYgT2JqZWN0LmtleXMob0NvbmZpZ3VyYXRpb25zKSxcblx0XHRcdGFCYXRjaEdyb3VwcyA9IFtcIiRhdXRvLkhlcm9lc1wiLCBcIiRhdXRvLkRlY29yYXRpb25cIiwgXCIkYXV0by5Xb3JrZXJzXCJdO1xuXG5cdFx0aWYgKGFDb25maWd1cmF0aW9ucyAmJiBhQ29uZmlndXJhdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdFx0YUNvbmZpZ3VyYXRpb25zLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvQ29uZmlndXJhdGlvbiA9IG9Db25maWd1cmF0aW9uc1tzS2V5XTtcblx0XHRcdFx0aWYgKG9Db25maWd1cmF0aW9uLnJlcXVlc3RHcm91cElkID09PSBcIkxvbmdSdW5uZXJzXCIpIHtcblx0XHRcdFx0XHRhQmF0Y2hHcm91cHMucHVzaChcIiRhdXRvLkxvbmdSdW5uZXJzXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFCYXRjaEdyb3Vwcztcblx0fVxuXG5cdC8qXG5cdCAqIFJlc2V0IEJyZWFkY3J1bWIgbGlua3Ncblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB7c2FwLm0uQnJlYWRjcnVtYnN9IFtvU291cmNlXSBwYXJlbnQgY29udHJvbFxuXHQgKiBAZGVzY3JpcHRpb24gVXNlZCB3aGVuIGNvbnRleHQgb2YgdGhlIG9iamVjdCBwYWdlIGNoYW5nZXMuXG5cdCAqICAgICAgICAgICAgICBUaGlzIGV2ZW50IGNhbGxiYWNrIGlzIGF0dGFjaGVkIHRvIG1vZGVsQ29udGV4dENoYW5nZVxuXHQgKiAgICAgICAgICAgICAgZXZlbnQgb2YgdGhlIEJyZWFkY3J1bWIgY29udHJvbCB0byBjYXRjaCBjb250ZXh0IGNoYW5nZS5cblx0ICogICAgICAgICAgICAgIFRoZW4gZWxlbWVudCBiaW5kaW5nIGFuZCBocmVmcyBhcmUgdXBkYXRlZCBmb3IgZWFjaCBsaW5rLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGV4cGVyaW1lbnRhbFxuXHQgKi9cblx0YXN5bmMgX3NldEJyZWFkY3J1bWJMaW5rcyhvU291cmNlOiBCcmVhZENydW1icykge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gb1NvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0b0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRhUHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdLFxuXHRcdFx0YVNraXBQYXJhbWV0ZXJpemVkOiBhbnlbXSA9IFtdLFxuXHRcdFx0c05ld1BhdGggPSBvQ29udGV4dD8uZ2V0UGF0aCgpLFxuXHRcdFx0YVBhdGhQYXJ0cyA9IHNOZXdQYXRoPy5zcGxpdChcIi9cIikgPz8gW10sXG5cdFx0XHRvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudCAmJiBvQXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpO1xuXHRcdGxldCBzUGF0aCA9IFwiXCI7XG5cdFx0dHJ5IHtcblx0XHRcdGFQYXRoUGFydHMuc2hpZnQoKTtcblx0XHRcdGFQYXRoUGFydHMuc3BsaWNlKC0xLCAxKTtcblx0XHRcdGFQYXRoUGFydHMuZm9yRWFjaChmdW5jdGlvbiAoc1BhdGhQYXJ0OiBhbnkpIHtcblx0XHRcdFx0c1BhdGggKz0gYC8ke3NQYXRoUGFydH1gO1xuXHRcdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gb0FwcENvbXBvbmVudC5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblx0XHRcdFx0Y29uc3Qgc1BhcmFtZXRlclBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0XHRcdFx0Y29uc3QgYlJlc3VsdENvbnRleHQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGFyYW1ldGVyUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCk7XG5cdFx0XHRcdGlmIChiUmVzdWx0Q29udGV4dCkge1xuXHRcdFx0XHRcdC8vIFdlIGRvbnQgbmVlZCB0byBjcmVhdGUgYSBicmVhZGNydW1iIGZvciBQYXJhbWV0ZXIgcGF0aFxuXHRcdFx0XHRcdGFTa2lwUGFyYW1ldGVyaXplZC5wdXNoKDEpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhU2tpcFBhcmFtZXRlcml6ZWQucHVzaCgwKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhUHJvbWlzZXMucHVzaChvUm9vdFZpZXdDb250cm9sbGVyLmdldFRpdGxlSW5mb0Zyb21QYXRoKHNQYXRoKSk7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IHRpdGxlSGllcmFyY2h5SW5mb3M6IGFueVtdID0gYXdhaXQgUHJvbWlzZS5hbGwoYVByb21pc2VzKTtcblx0XHRcdGxldCBpZHgsIGhpZXJhcmNoeVBvc2l0aW9uLCBvTGluaztcblx0XHRcdGZvciAoY29uc3QgdGl0bGVIaWVyYXJjaHlJbmZvIG9mIHRpdGxlSGllcmFyY2h5SW5mb3MpIHtcblx0XHRcdFx0aGllcmFyY2h5UG9zaXRpb24gPSB0aXRsZUhpZXJhcmNoeUluZm9zLmluZGV4T2YodGl0bGVIaWVyYXJjaHlJbmZvKTtcblx0XHRcdFx0aWR4ID0gaGllcmFyY2h5UG9zaXRpb24gLSBhU2tpcFBhcmFtZXRlcml6ZWRbaGllcmFyY2h5UG9zaXRpb25dO1xuXHRcdFx0XHRvTGluayA9IG9Tb3VyY2UuZ2V0TGlua3MoKVtpZHhdID8gb1NvdXJjZS5nZXRMaW5rcygpW2lkeF0gOiBuZXcgTGluaygpO1xuXHRcdFx0XHQvL3NDdXJyZW50RW50aXR5IGlzIGEgZmFsbGJhY2sgdmFsdWUgaW4gY2FzZSBvZiBlbXB0eSB0aXRsZVxuXHRcdFx0XHRvTGluay5zZXRUZXh0KHRpdGxlSGllcmFyY2h5SW5mby5zdWJ0aXRsZSB8fCB0aXRsZUhpZXJhcmNoeUluZm8udGl0bGUpO1xuXHRcdFx0XHQvL1dlIGFwcGx5IGFuIGFkZGl0aW9uYWwgZW5jb2RlVVJJIGluIGNhc2Ugb2Ygc3BlY2lhbCBjaGFyYWN0ZXJzIChpZSBcIi9cIikgdXNlZCBpbiB0aGUgdXJsIHRocm91Z2ggdGhlIHNlbWFudGljIGtleXNcblx0XHRcdFx0b0xpbmsuc2V0SHJlZihlbmNvZGVVUkkodGl0bGVIaWVyYXJjaHlJbmZvLmludGVudCkpO1xuXHRcdFx0XHRpZiAoIW9Tb3VyY2UuZ2V0TGlua3MoKVtpZHhdKSB7XG5cdFx0XHRcdFx0b1NvdXJjZS5hZGRMaW5rKG9MaW5rKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHNldHRpbmcgdGhlIGJyZWFkY3J1bWIgbGlua3M6XCIgKyBlcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0X2NoZWNrRGF0YVBvaW50VGl0bGVGb3JFeHRlcm5hbE5hdmlnYXRpb24oKSB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdGNvbnN0IG9EYXRhUG9pbnRzID0gQ29tbW9uVXRpbHMuZ2V0SGVhZGVyRmFjZXRJdGVtQ29uZmlnRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKFxuXHRcdFx0b1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcblx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGluZ1NlcnZpY2UoKS5nZXRPdXRib3VuZHMoKVxuXHRcdCk7XG5cdFx0Y29uc3Qgb1NoZWxsU2VydmljZXMgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRjb25zdCBvUGFnZUNvbnRleHQgPSBvVmlldyAmJiAob1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJpc0hlYWRlckRQTGlua1Zpc2libGVcIiwge30pO1xuXHRcdGlmIChvUGFnZUNvbnRleHQpIHtcblx0XHRcdG9QYWdlQ29udGV4dFxuXHRcdFx0XHQucmVxdWVzdE9iamVjdCgpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvRGF0YTogYW55KSB7XG5cdFx0XHRcdFx0Zm5HZXRMaW5rcyhvRGF0YVBvaW50cywgb0RhdGEpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IHJldHJpZXZlIHRoZSBsaW5rcyBmcm9tIHRoZSBzaGVsbCBzZXJ2aWNlXCIsIG9FcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBwYXJhbSBvRXJyb3Jcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBmbk9uRXJyb3Iob0Vycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihvRXJyb3IpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGZuU2V0TGlua0VuYWJsZW1lbnQoaWQ6IHN0cmluZywgYVN1cHBvcnRlZExpbmtzOiBhbnkpIHtcblx0XHRcdGNvbnN0IHNMaW5rSWQgPSBpZDtcblx0XHRcdC8vIHByb2Nlc3MgdmlhYmxlIGxpbmtzIGZyb20gZ2V0TGlua3MgZm9yIGFsbCBkYXRhcG9pbnRzIGhhdmluZyBvdXRib3VuZFxuXHRcdFx0aWYgKGFTdXBwb3J0ZWRMaW5rcyAmJiBhU3VwcG9ydGVkTGlua3MubGVuZ3RoID09PSAxICYmIGFTdXBwb3J0ZWRMaW5rc1swXS5zdXBwb3J0ZWQpIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KGBpc0hlYWRlckRQTGlua1Zpc2libGUvJHtzTGlua0lkfWAsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBwYXJhbSBvU3ViRGF0YVBvaW50c1xuXHRcdCAqIEBwYXJhbSBvUGFnZURhdGFcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBmbkdldExpbmtzKG9TdWJEYXRhUG9pbnRzOiBhbnksIG9QYWdlRGF0YTogYW55KSB7XG5cdFx0XHRmb3IgKGNvbnN0IHNJZCBpbiBvU3ViRGF0YVBvaW50cykge1xuXHRcdFx0XHRjb25zdCBvRGF0YVBvaW50ID0gb1N1YkRhdGFQb2ludHNbc0lkXTtcblx0XHRcdFx0Y29uc3Qgb1BhcmFtczogYW55ID0ge307XG5cdFx0XHRcdGNvbnN0IG9MaW5rID0gb1ZpZXcuYnlJZChzSWQpO1xuXHRcdFx0XHRpZiAoIW9MaW5rKSB7XG5cdFx0XHRcdFx0Ly8gZm9yIGRhdGEgcG9pbnRzIGNvbmZpZ3VyZWQgaW4gYXBwIGRlc2NyaXB0b3IgYnV0IG5vdCBhbm5vdGF0ZWQgaW4gdGhlIGhlYWRlclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IG9MaW5rQ29udGV4dCA9IG9MaW5rLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRcdGNvbnN0IG9MaW5rRGF0YTogYW55ID0gb0xpbmtDb250ZXh0ICYmIG9MaW5rQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0bGV0IG9NaXhlZENvbnRleHQ6IGFueSA9IG1lcmdlKHt9LCBvUGFnZURhdGEsIG9MaW5rRGF0YSk7XG5cdFx0XHRcdC8vIHByb2Nlc3Mgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdzXG5cdFx0XHRcdGlmIChvRGF0YVBvaW50LnNlbWFudGljT2JqZWN0TWFwcGluZykge1xuXHRcdFx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdE1hcHBpbmcgPSBvRGF0YVBvaW50LnNlbWFudGljT2JqZWN0TWFwcGluZztcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGl0ZW0gaW4gYVNlbWFudGljT2JqZWN0TWFwcGluZykge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb01hcHBpbmcgPSBhU2VtYW50aWNPYmplY3RNYXBwaW5nW2l0ZW1dO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc01haW5Qcm9wZXJ0eSA9IG9NYXBwaW5nW1wiTG9jYWxQcm9wZXJ0eVwiXVtcIiRQcm9wZXJ0eVBhdGhcIl07XG5cdFx0XHRcdFx0XHRjb25zdCBzTWFwcGVkUHJvcGVydHkgPSBvTWFwcGluZ1tcIlNlbWFudGljT2JqZWN0UHJvcGVydHlcIl07XG5cdFx0XHRcdFx0XHRpZiAoc01haW5Qcm9wZXJ0eSAhPT0gc01hcHBlZFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvTWl4ZWRDb250ZXh0Lmhhc093blByb3BlcnR5KHNNYWluUHJvcGVydHkpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb05ld01hcHBpbmc6IGFueSA9IHt9O1xuXHRcdFx0XHRcdFx0XHRcdG9OZXdNYXBwaW5nW3NNYXBwZWRQcm9wZXJ0eV0gPSBvTWl4ZWRDb250ZXh0W3NNYWluUHJvcGVydHldO1xuXHRcdFx0XHRcdFx0XHRcdG9NaXhlZENvbnRleHQgPSBtZXJnZSh7fSwgb01peGVkQ29udGV4dCwgb05ld01hcHBpbmcpO1xuXHRcdFx0XHRcdFx0XHRcdGRlbGV0ZSBvTWl4ZWRDb250ZXh0W3NNYWluUHJvcGVydHldO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9NaXhlZENvbnRleHQpIHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHNLZXkgaW4gb01peGVkQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0aWYgKHNLZXkuaW5kZXhPZihcIl9cIikgIT09IDAgJiYgc0tleS5pbmRleE9mKFwib2RhdGEuY29udGV4dFwiKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0b1BhcmFtc1tzS2V5XSA9IG9NaXhlZENvbnRleHRbc0tleV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHZhbGlkYXRlIGlmIGEgbGluayBtdXN0IGJlIHJlbmRlcmVkXG5cdFx0XHRcdG9TaGVsbFNlcnZpY2VzXG5cdFx0XHRcdFx0LmlzTmF2aWdhdGlvblN1cHBvcnRlZChbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvRGF0YVBvaW50LnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRcdGFjdGlvbjogb0RhdGFQb2ludC5hY3Rpb25cblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0cGFyYW1zOiBvUGFyYW1zXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XHQudGhlbigoYUxpbmtzKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZm5TZXRMaW5rRW5hYmxlbWVudChzSWQsIGFMaW5rcyk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZm5PbkVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRoYW5kbGVycyA9IHtcblx0XHQvKipcblx0XHQgKiBJbnZva2VzIHRoZSBwYWdlIHByaW1hcnkgYWN0aW9uIG9uIHByZXNzIG9mIEN0cmwrRW50ZXIuXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gb0NvbnRyb2xsZXIgVGhlIHBhZ2UgY29udHJvbGxlclxuXHRcdCAqIEBwYXJhbSBvVmlld1xuXHRcdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIGNhbGxlZFxuXHRcdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uIHRvIGJlIGNhbGxlZFxuXHRcdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0XHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmNvbnRleHRzXSBNYW5kYXRvcnkgZm9yIGEgYm91bmQgYWN0aW9uLCBlaXRoZXIgb25lIGNvbnRleHQgb3IgYW4gYXJyYXkgd2l0aCBjb250ZXh0cyBmb3Igd2hpY2ggdGhlIGFjdGlvbiBpcyBjYWxsZWRcblx0XHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm1vZGVsXSBNYW5kYXRvcnkgZm9yIGFuIHVuYm91bmQgYWN0aW9uOyBhbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbFxuXHRcdCAqIEBwYXJhbSBbbUNvbmRpdGlvbnNdIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0XHQgKiBAcGFyYW0gW21Db25kaXRpb25zLnBvc2l0aXZlQWN0aW9uVmlzaWJsZV0gVGhlIHZpc2liaWxpdHkgb2Ygc2VtYXRpYyBwb3NpdGl2ZSBhY3Rpb25cblx0XHQgKiBAcGFyYW0gW21Db25kaXRpb25zLnBvc2l0aXZlQWN0aW9uRW5hYmxlZF0gVGhlIGVuYWJsZW1lbnQgb2Ygc2VtYW50aWMgcG9zaXRpdmUgYWN0aW9uXG5cdFx0ICogQHBhcmFtIFttQ29uZGl0aW9ucy5lZGl0QWN0aW9uVmlzaWJsZV0gVGhlIEVkaXQgYnV0dG9uIHZpc2liaWxpdHlcblx0XHQgKiBAcGFyYW0gW21Db25kaXRpb25zLmVkaXRBY3Rpb25FbmFibGVkXSBUaGUgZW5hYmxlbWVudCBvZiBFZGl0IGJ1dHRvblxuXHRcdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHRcdCAqIEBmaW5hbFxuXHRcdCAqL1xuXHRcdG9uUHJpbWFyeUFjdGlvbihcblx0XHRcdG9Db250cm9sbGVyOiBPYmplY3RQYWdlQ29udHJvbGxlcixcblx0XHRcdG9WaWV3OiBWaWV3LFxuXHRcdFx0b0NvbnRleHQ6IENvbnRleHQsXG5cdFx0XHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRcdFx0bVBhcmFtZXRlcnM6IHVua25vd24sXG5cdFx0XHRtQ29uZGl0aW9uczoge1xuXHRcdFx0XHRwb3NpdGl2ZUFjdGlvblZpc2libGU6IGJvb2xlYW47XG5cdFx0XHRcdHBvc2l0aXZlQWN0aW9uRW5hYmxlZDogYm9vbGVhbjtcblx0XHRcdFx0ZWRpdEFjdGlvblZpc2libGU6IGJvb2xlYW47XG5cdFx0XHRcdGVkaXRBY3Rpb25FbmFibGVkOiBib29sZWFuO1xuXHRcdFx0fVxuXHRcdCkge1xuXHRcdFx0Y29uc3QgaVZpZXdMZXZlbCA9IChvQ29udHJvbGxlci5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLnZpZXdMZXZlbCxcblx0XHRcdFx0b09iamVjdFBhZ2UgPSBvQ29udHJvbGxlci5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRcdGlmIChtQ29uZGl0aW9ucy5wb3NpdGl2ZUFjdGlvblZpc2libGUpIHtcblx0XHRcdFx0aWYgKG1Db25kaXRpb25zLnBvc2l0aXZlQWN0aW9uRW5hYmxlZCkge1xuXHRcdFx0XHRcdG9Db250cm9sbGVyLmhhbmRsZXJzLm9uQ2FsbEFjdGlvbihvVmlldywgc0FjdGlvbk5hbWUsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChtQ29uZGl0aW9ucy5lZGl0QWN0aW9uVmlzaWJsZSkge1xuXHRcdFx0XHRpZiAobUNvbmRpdGlvbnMuZWRpdEFjdGlvbkVuYWJsZWQpIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5fZWRpdERvY3VtZW50KG9Db250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChpVmlld0xldmVsID09PSAxICYmIG9PYmplY3RQYWdlLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSkge1xuXHRcdFx0XHRvQ29udHJvbGxlci5fc2F2ZURvY3VtZW50KG9Db250ZXh0KTtcblx0XHRcdH0gZWxzZSBpZiAob09iamVjdFBhZ2UuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpKSB7XG5cdFx0XHRcdG9Db250cm9sbGVyLl9hcHBseURvY3VtZW50KG9Db250ZXh0KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b25UYWJsZUNvbnRleHRDaGFuZ2UodGhpczogT2JqZWN0UGFnZUNvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBvU291cmNlID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdFx0bGV0IG9UYWJsZTogYW55O1xuXHRcdFx0dGhpcy5fZmluZFRhYmxlcygpLnNvbWUoZnVuY3Rpb24gKF9vVGFibGU6IGFueSkge1xuXHRcdFx0XHRpZiAoX29UYWJsZS5nZXRSb3dCaW5kaW5nKCkgPT09IG9Tb3VyY2UpIHtcblx0XHRcdFx0XHRvVGFibGUgPSBfb1RhYmxlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0pO1xuXG5cdFx0XHRjb25zdCBvQ3VycmVudEFjdGlvblByb21pc2UgPSB0aGlzLl9lZGl0Rmxvdy5nZXRDdXJyZW50QWN0aW9uUHJvbWlzZSgpO1xuXHRcdFx0aWYgKG9DdXJyZW50QWN0aW9uUHJvbWlzZSkge1xuXHRcdFx0XHRsZXQgYVRhYmxlQ29udGV4dHM6IGFueTtcblx0XHRcdFx0aWYgKG9UYWJsZS5nZXRUeXBlKCkuZ2V0TWV0YWRhdGEoKS5pc0EoXCJzYXAudWkubWRjLnRhYmxlLkdyaWRUYWJsZVR5cGVcIikpIHtcblx0XHRcdFx0XHRhVGFibGVDb250ZXh0cyA9IG9Tb3VyY2UuZ2V0Q29udGV4dHMoMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YVRhYmxlQ29udGV4dHMgPSBvU291cmNlLmdldEN1cnJlbnRDb250ZXh0cygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vaWYgY29udGV4dHMgYXJlIG5vdCBmdWxseSBsb2FkZWQgdGhlIGdldGNvbnRleHRzIGZ1bmN0aW9uIGFib3ZlIHdpbGwgdHJpZ2dlciBhIG5ldyBjaGFuZ2UgZXZlbnQgY2FsbFxuXHRcdFx0XHRpZiAoIWFUYWJsZUNvbnRleHRzWzBdKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9DdXJyZW50QWN0aW9uUHJvbWlzZVxuXHRcdFx0XHRcdC50aGVuKChvQWN0aW9uUmVzcG9uc2U6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKCFvQWN0aW9uUmVzcG9uc2UgfHwgb0FjdGlvblJlc3BvbnNlLmNvbnRyb2xJZCAhPT0gb1RhYmxlLnNJZCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25zdCBvQWN0aW9uRGF0YSA9IG9BY3Rpb25SZXNwb25zZS5vRGF0YTtcblx0XHRcdFx0XHRcdGNvbnN0IGFLZXlzID0gb0FjdGlvblJlc3BvbnNlLmtleXM7XG5cdFx0XHRcdFx0XHRsZXQgaU5ld0l0ZW1wID0gLTE7XG5cdFx0XHRcdFx0XHRhVGFibGVDb250ZXh0cy5maW5kKGZ1bmN0aW9uIChvVGFibGVDb250ZXh0OiBhbnksIGk6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvVGFibGVEYXRhID0gb1RhYmxlQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYkNvbXBhcmUgPSBhS2V5cy5ldmVyeShmdW5jdGlvbiAoc0tleTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9UYWJsZURhdGFbc0tleV0gPT09IG9BY3Rpb25EYXRhW3NLZXldO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0aWYgKGJDb21wYXJlKSB7XG5cdFx0XHRcdFx0XHRcdFx0aU5ld0l0ZW1wID0gaTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYkNvbXBhcmU7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmIChpTmV3SXRlbXAgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFEaWFsb2dzID0gSW5zdGFuY2VNYW5hZ2VyLmdldE9wZW5EaWFsb2dzKCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9EaWFsb2cgPVxuXHRcdFx0XHRcdFx0XHRcdGFEaWFsb2dzLmxlbmd0aCA+IDAgPyBhRGlhbG9ncy5maW5kKChkaWFsb2cpID0+IGRpYWxvZy5kYXRhKFwiRnVsbFNjcmVlbkRpYWxvZ1wiKSAhPT0gdHJ1ZSkgOiBudWxsO1xuXHRcdFx0XHRcdFx0XHRpZiAob0RpYWxvZykge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGJ5IGRlc2lnbiwgYSBzYXAubS5kaWFsb2cgc2V0IHRoZSBmb2N1cyB0byB0aGUgcHJldmlvdXMgZm9jdXNlZCBlbGVtZW50IHdoZW4gY2xvc2luZy5cblx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBzaG91bGQgd2FpdCBmb3IgdGhlIGRpYWxvZyB0byBiZSBjbG9zZSBiZWZvcmUgdG8gZm9jdXMgYW5vdGhlciBlbGVtZW50XG5cdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5hdHRhY2hFdmVudE9uY2UoXCJhZnRlckNsb3NlXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9UYWJsZS5mb2N1c1JvdyhpTmV3SXRlbXAsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdG9UYWJsZS5mb2N1c1JvdyhpTmV3SXRlbXAsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHRoaXMuX2VkaXRGbG93LmRlbGV0ZUN1cnJlbnRBY3Rpb25Qcm9taXNlKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoYEFuIGVycm9yIG9jY3VycyB3aGlsZSBzY3JvbGxpbmcgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgSXRlbTogJHtlcnJ9YCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBmaXJlIE1vZGVsQ29udGV4dENoYW5nZSBvbiB0aGUgbWVzc2FnZSBidXR0b24gd2hlbmV2ZXIgdGhlIHRhYmxlIGNvbnRleHQgY2hhbmdlc1xuXHRcdFx0dGhpcy5tZXNzYWdlQnV0dG9uLmZpcmVNb2RlbENvbnRleHRDaGFuZ2UoKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogSW52b2tlcyBhbiBhY3Rpb24gLSBib3VuZC91bmJvdW5kIGFuZCBzZXRzIHRoZSBwYWdlIGRpcnR5LlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG9WaWV3XG5cdFx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdFx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gQ29udGFpbnMgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHRcdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY29udGV4dHNdIE1hbmRhdG9yeSBmb3IgYSBib3VuZCBhY3Rpb24sIGVpdGhlciBvbmUgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIGNhbGxlZFxuXHRcdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubW9kZWxdIE1hbmRhdG9yeSBmb3IgYW4gdW5ib3VuZCBhY3Rpb247IGFuIGluc3RhbmNlIG9mIGFuIE9EYXRhIFY0IG1vZGVsXG5cdFx0ICogQHJldHVybnMgVGhlIGFjdGlvbiBwcm9taXNlXG5cdFx0ICogQHVpNS1yZXN0cmljdGVkXG5cdFx0ICogQGZpbmFsXG5cdFx0ICovXG5cdFx0b25DYWxsQWN0aW9uKG9WaWV3OiBhbnksIHNBY3Rpb25OYW1lOiBzdHJpbmcsIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpO1xuXHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLmVkaXRGbG93XG5cdFx0XHRcdC5pbnZva2VBY3Rpb24oc0FjdGlvbk5hbWUsIG1QYXJhbWV0ZXJzKVxuXHRcdFx0XHQudGhlbihvQ29udHJvbGxlci5fc2hvd01lc3NhZ2VQb3BvdmVyLmJpbmQob0NvbnRyb2xsZXIsIHVuZGVmaW5lZCkpXG5cdFx0XHRcdC5jYXRjaChvQ29udHJvbGxlci5fc2hvd01lc3NhZ2VQb3BvdmVyLmJpbmQob0NvbnRyb2xsZXIpKTtcblx0XHR9LFxuXHRcdG9uRGF0YVBvaW50VGl0bGVQcmVzc2VkKG9Db250cm9sbGVyOiBhbnksIG9Tb3VyY2U6IGFueSwgb01hbmlmZXN0T3V0Ym91bmQ6IGFueSwgc0NvbnRyb2xDb25maWc6IGFueSwgc0NvbGxlY3Rpb25QYXRoOiBhbnkpIHtcblx0XHRcdG9NYW5pZmVzdE91dGJvdW5kID0gdHlwZW9mIG9NYW5pZmVzdE91dGJvdW5kID09PSBcInN0cmluZ1wiID8gSlNPTi5wYXJzZShvTWFuaWZlc3RPdXRib3VuZCkgOiBvTWFuaWZlc3RPdXRib3VuZDtcblx0XHRcdGNvbnN0IG9UYXJnZXRJbmZvID0gb01hbmlmZXN0T3V0Ym91bmRbc0NvbnRyb2xDb25maWddLFxuXHRcdFx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5nID0gQ29tbW9uVXRpbHMuZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nKG9UYXJnZXRJbmZvKSxcblx0XHRcdFx0b0RhdGFQb2ludE9yQ2hhcnRCaW5kaW5nQ29udGV4dCA9IG9Tb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdFx0c01ldGFQYXRoID0gb0RhdGFQb2ludE9yQ2hhcnRCaW5kaW5nQ29udGV4dFxuXHRcdFx0XHRcdC5nZXRNb2RlbCgpXG5cdFx0XHRcdFx0LmdldE1ldGFNb2RlbCgpXG5cdFx0XHRcdFx0LmdldE1ldGFQYXRoKG9EYXRhUG9pbnRPckNoYXJ0QmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdGxldCBhTmF2aWdhdGlvbkRhdGEgPSBvQ29udHJvbGxlci5fZ2V0Q2hhcnRDb250ZXh0RGF0YShvRGF0YVBvaW50T3JDaGFydEJpbmRpbmdDb250ZXh0LCBzQ29sbGVjdGlvblBhdGgpO1xuXHRcdFx0bGV0IGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycztcblxuXHRcdFx0YU5hdmlnYXRpb25EYXRhID0gYU5hdmlnYXRpb25EYXRhLm1hcChmdW5jdGlvbiAob05hdmlnYXRpb25EYXRhOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRkYXRhOiBvTmF2aWdhdGlvbkRhdGEsXG5cdFx0XHRcdFx0bWV0YVBhdGg6IHNNZXRhUGF0aCArIChzQ29sbGVjdGlvblBhdGggPyBgLyR7c0NvbGxlY3Rpb25QYXRofWAgOiBcIlwiKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAob1RhcmdldEluZm8gJiYgb1RhcmdldEluZm8ucGFyYW1ldGVycykge1xuXHRcdFx0XHRjb25zdCBvUGFyYW1zID0gb1RhcmdldEluZm8ucGFyYW1ldGVycyAmJiBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLmdldE91dGJvdW5kUGFyYW1zKG9UYXJnZXRJbmZvLnBhcmFtZXRlcnMpO1xuXHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob1BhcmFtcykubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycyA9IG9QYXJhbXM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChvVGFyZ2V0SW5mbyAmJiBvVGFyZ2V0SW5mby5zZW1hbnRpY09iamVjdCAmJiBvVGFyZ2V0SW5mby5hY3Rpb24pIHtcblx0XHRcdFx0b0NvbnRyb2xsZXIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZShvVGFyZ2V0SW5mby5zZW1hbnRpY09iamVjdCwgb1RhcmdldEluZm8uYWN0aW9uLCB7XG5cdFx0XHRcdFx0bmF2aWdhdGlvbkNvbnRleHRzOiBhTmF2aWdhdGlvbkRhdGEsXG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nOiBhU2VtYW50aWNPYmplY3RNYXBwaW5nLFxuXHRcdFx0XHRcdGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVyczogYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVHJpZ2dlcnMgYW4gb3V0Ym91bmQgbmF2aWdhdGlvbiB3aGVuIGEgdXNlciBjaG9vc2VzIHRoZSBjaGV2cm9uLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG9Db250cm9sbGVyXG5cdFx0ICogQHBhcmFtIHNPdXRib3VuZFRhcmdldCBOYW1lIG9mIHRoZSBvdXRib3VuZCB0YXJnZXQgKG5lZWRzIHRvIGJlIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0KVxuXHRcdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIGZvciB0aGUgdGFyZ2V0IGFwcFxuXHRcdCAqIEBwYXJhbSBzQ3JlYXRlUGF0aCBDcmVhdGUgcGF0aCB3aGVuIHRoZSBjaGV2cm9uIGlzIGNyZWF0ZWQuXG5cdFx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIHRoZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZCAoPz8/IG1heWJlIG9ubHkgb25jZSBmaW5pc2hlZD8pXG5cdFx0ICogQHVpNS1yZXN0cmljdGVkXG5cdFx0ICogQGZpbmFsXG5cdFx0ICovXG5cdFx0b25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyOiBPYmplY3RQYWdlQ29udHJvbGxlciwgc091dGJvdW5kVGFyZ2V0OiBzdHJpbmcsIG9Db250ZXh0OiBhbnksIHNDcmVhdGVQYXRoOiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLm9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZChvQ29udHJvbGxlciwgc091dGJvdW5kVGFyZ2V0LCBvQ29udGV4dCwgc0NyZWF0ZVBhdGgpO1xuXHRcdH0sXG5cblx0XHRvbk5hdmlnYXRlQ2hhbmdlKHRoaXM6IE9iamVjdFBhZ2VDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Ly93aWxsIGJlIGNhbGxlZCBhbHdheXMgd2hlbiB3ZSBjbGljayBvbiBhIHNlY3Rpb24gdGFiXG5cdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0XHR0aGlzLmJTZWN0aW9uTmF2aWdhdGVkID0gdHJ1ZTtcblxuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRcdGlmIChcblx0XHRcdFx0b09iamVjdFBhZ2UuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpICYmXG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuc2VjdGlvbkxheW91dCA9PT0gXCJUYWJzXCIgJiZcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiZXJyb3JOYXZpZ2F0aW9uU2VjdGlvbkZsYWdcIikgPT09IGZhbHNlXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3Qgb1N1YlNlY3Rpb24gPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwic3ViU2VjdGlvblwiKTtcblx0XHRcdFx0dGhpcy5fdXBkYXRlRm9jdXNJbkVkaXRNb2RlKFtvU3ViU2VjdGlvbl0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b25WYXJpYW50U2VsZWN0ZWQ6IGZ1bmN0aW9uICh0aGlzOiBPYmplY3RQYWdlQ29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdH0sXG5cdFx0b25WYXJpYW50U2F2ZWQ6IGZ1bmN0aW9uICh0aGlzOiBPYmplY3RQYWdlQ29udHJvbGxlcikge1xuXHRcdFx0Ly9UT0RPOiBTaG91bGQgcmVtb3ZlIHRoaXMgc2V0VGltZU91dCBvbmNlIFZhcmlhbnQgTWFuYWdlbWVudCBwcm92aWRlcyBhbiBhcGkgdG8gZmV0Y2ggdGhlIGN1cnJlbnQgdmFyaWFudCBrZXkgb24gc2F2ZVxuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHRcdH0sIDUwMCk7XG5cdFx0fSxcblx0XHRuYXZpZ2F0ZVRvU3ViU2VjdGlvbjogZnVuY3Rpb24gKG9Db250cm9sbGVyOiBPYmplY3RQYWdlQ29udHJvbGxlciwgdkRldGFpbENvbmZpZzogYW55KSB7XG5cdFx0XHRjb25zdCBvRGV0YWlsQ29uZmlnID0gdHlwZW9mIHZEZXRhaWxDb25maWcgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHZEZXRhaWxDb25maWcpIDogdkRldGFpbENvbmZpZztcblx0XHRcdGNvbnN0IG9PYmplY3RQYWdlID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmJ5SWQoXCJmZTo6T2JqZWN0UGFnZVwiKSBhcyBPYmplY3RQYWdlTGF5b3V0O1xuXHRcdFx0bGV0IG9TZWN0aW9uO1xuXHRcdFx0bGV0IG9TdWJTZWN0aW9uO1xuXHRcdFx0aWYgKG9EZXRhaWxDb25maWcuc2VjdGlvbklkKSB7XG5cdFx0XHRcdG9TZWN0aW9uID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmJ5SWQob0RldGFpbENvbmZpZy5zZWN0aW9uSWQpIGFzIE9iamVjdFBhZ2VTZWN0aW9uO1xuXHRcdFx0XHRvU3ViU2VjdGlvbiA9IChcblx0XHRcdFx0XHRvRGV0YWlsQ29uZmlnLnN1YlNlY3Rpb25JZFxuXHRcdFx0XHRcdFx0PyBvQ29udHJvbGxlci5nZXRWaWV3KCkuYnlJZChvRGV0YWlsQ29uZmlnLnN1YlNlY3Rpb25JZClcblx0XHRcdFx0XHRcdDogb1NlY3Rpb24gJiYgb1NlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKSAmJiBvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpWzBdXG5cdFx0XHRcdCkgYXMgT2JqZWN0UGFnZVN1YlNlY3Rpb247XG5cdFx0XHR9IGVsc2UgaWYgKG9EZXRhaWxDb25maWcuc3ViU2VjdGlvbklkKSB7XG5cdFx0XHRcdG9TdWJTZWN0aW9uID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmJ5SWQob0RldGFpbENvbmZpZy5zdWJTZWN0aW9uSWQpIGFzIE9iamVjdFBhZ2VTdWJTZWN0aW9uO1xuXHRcdFx0XHRvU2VjdGlvbiA9IG9TdWJTZWN0aW9uICYmIChvU3ViU2VjdGlvbi5nZXRQYXJlbnQoKSBhcyBPYmplY3RQYWdlU2VjdGlvbik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIW9TZWN0aW9uIHx8ICFvU3ViU2VjdGlvbiB8fCAhb1NlY3Rpb24uZ2V0VmlzaWJsZSgpIHx8ICFvU3ViU2VjdGlvbi5nZXRWaXNpYmxlKCkpIHtcblx0XHRcdFx0KChvQ29udHJvbGxlci5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJzYXAuZmUuaTE4blwiKSBhcyBSZXNvdXJjZU1vZGVsKS5nZXRSZXNvdXJjZUJ1bmRsZSgpIGFzIFByb21pc2U8UmVzb3VyY2VCdW5kbGU+KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvUmVzb3VyY2VCdW5kbGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHNUaXRsZSA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcIkNfUk9VVElOR19OQVZJR0FUSU9OX0RJU0FCTEVEX1RJVExFXCIsXG5cdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHQob0NvbnRyb2xsZXIuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5lbnRpdHlTZXRcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3Ioc1RpdGxlKTtcblx0XHRcdFx0XHRcdE1lc3NhZ2VCb3guZXJyb3Ioc1RpdGxlKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihlcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvT2JqZWN0UGFnZS5zY3JvbGxUb1NlY3Rpb24ob1N1YlNlY3Rpb24uZ2V0SWQoKSk7XG5cdFx0XHRcdC8vIHRyaWdnZXIgaWFwcCBzdGF0ZSBjaGFuZ2Vcblx0XHRcdFx0b09iamVjdFBhZ2UuZmlyZU5hdmlnYXRlKHtcblx0XHRcdFx0XHRzZWN0aW9uOiBvU2VjdGlvbixcblx0XHRcdFx0XHRzdWJTZWN0aW9uOiBvU3ViU2VjdGlvblxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b25TdGF0ZUNoYW5nZSh0aGlzOiBPYmplY3RQYWdlQ29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdH0sXG5cdFx0Y2xvc2VPUE1lc3NhZ2VTdHJpcDogZnVuY3Rpb24gKHRoaXM6IE9iamVjdFBhZ2VDb250cm9sbGVyKSB7XG5cdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLmhpZGVNZXNzYWdlKCk7XG5cdFx0fVxuXHR9O1xufVxuXG5leHBv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Q0FBQyxDQUFDO2tCQUMzQkEsV0FBVyxDQUFDRixlQUFlLENBQUMsR0FBR0osYUFBYSxDQUFDRyxhQUFhLENBQUM7a0JBQzNESCxhQUFhLEdBQUdDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRUQsYUFBYSxFQUFFTSxXQUFXLENBQUM7a0JBQ3JELE9BQU9OLGFBQWEsQ0FBQ0csYUFBYSxDQUFDO2dCQUNwQztjQUNEO1lBQ0Q7VUFDRDtVQUVBLElBQUlILGFBQWEsRUFBRTtZQUNsQixLQUFLLE1BQU1oZ0IsSUFBSSxJQUFJZ2dCLGFBQWEsRUFBRTtjQUNqQyxJQUFJaGdCLElBQUksQ0FBQ3FWLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUlyVixJQUFJLENBQUNxVixPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BFelMsT0FBTyxDQUFDNUMsSUFBSSxDQUFDLEdBQUdnZ0IsYUFBYSxDQUFDaGdCLElBQUksQ0FBQztjQUNwQztZQUNEO1VBQ0Q7VUFDQTtVQUNBa2YsY0FBYyxDQUNacUIscUJBQXFCLENBQUMsQ0FDdEI7WUFDQ25MLE1BQU0sRUFBRTtjQUNQcFMsY0FBYyxFQUFFNmMsVUFBVSxDQUFDN2MsY0FBYztjQUN6Q0MsTUFBTSxFQUFFNGMsVUFBVSxDQUFDNWM7WUFDcEIsQ0FBQztZQUNEdWQsTUFBTSxFQUFFNWQ7VUFDVCxDQUFDLENBQ0QsQ0FBQyxDQUNENUQsSUFBSSxDQUFFeWhCLE1BQU0sSUFBSztZQUNqQixPQUFPbkIsbUJBQW1CLENBQUNuZ0IsR0FBRyxFQUFFc2hCLE1BQU0sQ0FBQztVQUN4QyxDQUFDLENBQUMsQ0FDRDlmLEtBQUssQ0FBQzBlLFNBQVMsQ0FBQztRQUNuQjtNQUNEO0lBQ0QsQ0FBQztJQUFBO0VBQUEsRUFsdkNpQ3RYLGNBQWM7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsT0FtL0NsQ3hOLG9CQUFvQjtBQUFBIn0=