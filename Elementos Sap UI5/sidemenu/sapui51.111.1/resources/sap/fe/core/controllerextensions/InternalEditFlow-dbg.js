/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/sticky", "sap/fe/core/controllerextensions/editFlow/TransactionHelper", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/Text", "sap/ui/core/mvc/ControllerExtension"], function (Log, CommonUtils, BusyLocker, ActivitySync, CollaborationCommon, sticky, TransactionHelper, ClassSupport, EditState, FELibrary, Button, Dialog, Text, ControllerExtension) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var Activity = CollaborationCommon.Activity;
  var send = ActivitySync.send;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  const ProgrammingModel = FELibrary.ProgrammingModel,
    DraftStatus = FELibrary.DraftStatus,
    EditMode = FELibrary.EditMode,
    CreationMode = FELibrary.CreationMode;
  let InternalEditFlow = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalEditFlow"), _dec2 = publicExtension(), _dec3 = finalExtension(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = finalExtension(), _dec8 = publicExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = finalExtension(), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = finalExtension(), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = finalExtension(), _dec30 = publicExtension(), _dec31 = finalExtension(), _dec32 = publicExtension(), _dec33 = finalExtension(), _dec34 = publicExtension(), _dec35 = finalExtension(), _dec36 = publicExtension(), _dec37 = finalExtension(), _dec38 = publicExtension(), _dec39 = finalExtension(), _dec40 = publicExtension(), _dec41 = finalExtension(), _dec42 = publicExtension(), _dec43 = finalExtension(), _dec44 = publicExtension(), _dec45 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalEditFlow, _ControllerExtension);
    function InternalEditFlow() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalEditFlow.prototype;
    _proto.getAppComponent = function getAppComponent() {
      return this.base.getAppComponent();
    }

    /**
     * Sets that the current page contains a newly created object.
     *
     * @param bCreationMode True if the object is new
     */;
    _proto.setCreationMode = function setCreationMode(bCreationMode) {
      const uiModelContext = this.base.getView().getBindingContext("ui");
      this.getGlobalUIModel().setProperty("createMode", bCreationMode, uiModelContext, true);
    }

    /**
     * Indicates whether the current page contains a newly created object or not.
     *
     * @returns True if the object is new
     */;
    _proto.getCreationMode = function getCreationMode() {
      const uiModelContext = this.base.getView().getBindingContext("ui");
      return !!this.getGlobalUIModel().getProperty("createMode", uiModelContext);
    }

    /**
     * Indicates whether the object being edited (or one of its sub-objects) has been modified or not.
     *
     * @returns True if the object has been modified
     */;
    _proto.isDocumentModified = function isDocumentModified() {
      return !!this.getGlobalUIModel().getProperty("/isDocumentModified");
    }

    /**
     * Sets that the object being edited (or one of its sub-objects) has been modified.
     *
     * @param modified True if the object has been modified
     */;
    _proto.setDocumentModified = function setDocumentModified(modified) {
      this.getGlobalUIModel().setProperty("/isDocumentModified", modified);
    }

    /**
     * Sets that the object being edited has been modified by creating a sub-object.
     *
     * @param listBinding The list binding on which the object has been created
     */;
    _proto.setDocumentModifiedOnCreate = function setDocumentModifiedOnCreate(listBinding) {
      // Set the modified flag only on relative listBindings, i.e. when creating a sub-object
      // If the listBinding is not relative, then it's a creation from the ListReport, and by default a newly created root object isn't considered as modified
      if (listBinding.isRelative()) {
        this.setDocumentModified(true);
      }
    };
    _proto.createMultipleDocuments = function createMultipleDocuments(oListBinding, aData, bCreateAtEnd, bFromCopyPaste, beforeCreateCallBack) {
      let bInactive = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      const transactionHelper = this.getTransactionHelper(),
        oLockObject = this.getGlobalUIModel();
      BusyLocker.lock(oLockObject);
      let aFinalContexts = [];
      return this.syncTask().then(() => {
        return beforeCreateCallBack ? beforeCreateCallBack({
          contextPath: oListBinding && oListBinding.getPath()
        }) : Promise.resolve();
      }).then(() => {
        const oModel = oListBinding.getModel(),
          oMetaModel = oModel.getMetaModel();
        let sMetaPath;
        if (oListBinding.getContext()) {
          sMetaPath = oMetaModel.getMetaPath(`${oListBinding.getContext().getPath()}/${oListBinding.getPath()}`);
        } else {
          sMetaPath = oMetaModel.getMetaPath(oListBinding.getPath());
        }
        this.handleCreateEvents(oListBinding);

        // Iterate on all items and store the corresponding creation promise
        const aCreationPromises = aData.map(mPropertyValues => {
          const mParameters = {
            data: {}
          };
          mParameters.keepTransientContextOnFailed = false; // currently not fully supported
          mParameters.busyMode = "None";
          mParameters.creationMode = CreationMode.CreationRow;
          mParameters.parentControl = this.getView();
          mParameters.createAtEnd = bCreateAtEnd;
          mParameters.inactive = bInactive;

          // Remove navigation properties as we don't support deep create
          for (const sPropertyPath in mPropertyValues) {
            const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
            if (oProperty && oProperty.$kind !== "NavigationProperty" && mPropertyValues[sPropertyPath]) {
              mParameters.data[sPropertyPath] = mPropertyValues[sPropertyPath];
            }
          }
          return transactionHelper.createDocument(oListBinding, mParameters, this.getAppComponent(), this.getMessageHandler(), bFromCopyPaste, this.getView());
        });
        return Promise.all(aCreationPromises);
      }).then(aContexts => {
        if (!bInactive) {
          this.setDocumentModifiedOnCreate(oListBinding);
        }
        // transient contexts are reliably removed once oNewContext.created() is resolved
        aFinalContexts = aContexts;
        return Promise.all(aContexts.map(function (oNewContext) {
          if (!oNewContext.bInactive) {
            return oNewContext.created();
          }
        }));
      }).then(() => {
        const oBindingContext = this.getView().getBindingContext();

        // if there are transient contexts, we must avoid requesting side effects
        // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
        // if list binding is refreshed, transient contexts might be lost
        if (!CommonUtils.hasTransientContext(oListBinding)) {
          this.getAppComponent().getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext);
        }
      }).catch(function (err) {
        Log.error("Error while creating multiple documents.");
        return Promise.reject(err);
      }).finally(function () {
        BusyLocker.unlock(oLockObject);
      }).then(() => {
        return aFinalContexts;
      });
    };
    _proto.deleteMultipleDocuments = function deleteMultipleDocuments(aContexts, mParameters) {
      const oLockObject = this.getGlobalUIModel();
      const oControl = this.getView().byId(mParameters.controlId);
      if (!oControl) {
        throw new Error("parameter controlId missing or incorrect");
      } else {
        mParameters.parentControl = oControl;
      }
      const oListBinding = oControl.getBinding("items") || oControl.getRowBinding();
      mParameters.bFindActiveContexts = true;
      BusyLocker.lock(oLockObject);
      return this.deleteDocumentTransaction(aContexts, mParameters).then(() => {
        let oResult;

        // Multiple object deletion is triggered from a list
        // First clear the selection in the table as it's not valid any more
        if (oControl.isA("sap.ui.mdc.Table")) {
          oControl.clearSelection();
        }

        // Then refresh the list-binding (LR), or require side-effects (OP)
        const oBindingContext = this.getView().getBindingContext();
        if (oListBinding.isRoot()) {
          // keep promise chain pending until refresh of listbinding is completed
          oResult = new Promise(resolve => {
            oListBinding.attachEventOnce("dataReceived", function () {
              resolve();
            });
          });
          oListBinding.refresh();
        } else if (oBindingContext) {
          // if there are transient contexts, we must avoid requesting side effects
          // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
          // if list binding is refreshed, transient contexts might be lost
          if (!CommonUtils.hasTransientContext(oListBinding)) {
            this.getAppComponent().getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext);
          }
        }

        // deleting at least one object should also set the UI to dirty
        if (!this.getAppComponent()._isFclEnabled()) {
          EditState.setEditStateDirty();
        }
        send(this.getView(), Activity.Delete, aContexts.map(context => context.getPath()));
        return oResult;
      }).catch(function (oError) {
        Log.error("Error while deleting the document(s)", oError);
      }).finally(function () {
        BusyLocker.unlock(oLockObject);
      });
    }

    /**
     * Decides if a document is to be shown in display or edit mode.
     *
     * @function
     * @name _computeEditMode
     * @memberof sap.fe.core.controllerextensions.InternalEditFlow
     * @param {sap.ui.model.odata.v4.Context} oContext The context to be displayed or edited
     * @returns {Promise} Promise resolves once the edit mode is computed
     */;
    _proto.computeEditMode = async function computeEditMode(oContext) {
      const sProgrammingModel = this.getProgrammingModel(oContext);
      if (sProgrammingModel === ProgrammingModel.Draft) {
        try {
          this.setDraftStatus(DraftStatus.Clear);
          this._setEditablePending(true);
          const bIsActiveEntity = await oContext.requestObject("IsActiveEntity");
          if (bIsActiveEntity === false) {
            // in case the document is draft set it in edit mode
            this.setEditMode(EditMode.Editable);
            const bHasActiveEntity = await oContext.requestObject("HasActiveEntity");
            this.setEditMode(undefined, !bHasActiveEntity);
          } else {
            // active document, stay on display mode
            this.setEditMode(EditMode.Display, false);
          }
          this._setEditablePending(false);
        } catch (oError) {
          Log.error("Error while determining the editMode for draft", oError);
          throw oError;
        }
      } else if (sProgrammingModel === ProgrammingModel.Sticky) {
        const lastInvokedActionName = this.getInternalModel().getProperty("/lastInvokedAction");
        if (lastInvokedActionName && this._hasNewActionForSticky(oContext, this.getView(), lastInvokedActionName)) {
          this.setEditMode(EditMode.Editable, true);
          if (!this.getAppComponent()._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          this.handleStickyOn(oContext);
          this.getInternalModel().setProperty("/lastInvokedAction", undefined);
        }
      }
    }

    /**
     * Sets the edit mode.
     *
     * @param sEditMode The edit mode
     * @param bCreationMode True if the object has been newly created
     */;
    _proto.setEditMode = function setEditMode(sEditMode, bCreationMode) {
      // at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
      // rely on the global UI model to exist
      const oGlobalModel = this.getGlobalUIModel();
      if (sEditMode) {
        oGlobalModel.setProperty("/isEditable", sEditMode === "Editable", undefined, true);
      }
      if (bCreationMode !== undefined) {
        // Since setCreationMode is public in EditFlow and can be overriden, make sure to call it via the controller
        // to ensure any overrides are taken into account
        this.setCreationMode(bCreationMode);
      }
    };
    _proto._setEditablePending = function _setEditablePending(pending) {
      const globalModel = this.getGlobalUIModel();
      globalModel.setProperty("/isEditablePending", pending, undefined, true);
    };
    _proto.setDraftStatus = function setDraftStatus(sDraftState) {
      // at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
      // rely on the global UI model to exist
      this.base.getView().getModel("ui").setProperty("/draftStatus", sDraftState, undefined, true);
    };
    _proto.getRoutingListener = function getRoutingListener() {
      // at this point of time it's not meant to release the edit flow for FPM custom pages and the routing
      // listener is not yet public therefore keep the logic here for now

      if (this.base._routing) {
        return this.base._routing;
      } else {
        throw new Error("Edit Flow works only with a given routing listener");
      }
    };
    _proto.getGlobalUIModel = function getGlobalUIModel() {
      // at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
      // rely on the global UI model to exist
      return this.base.getView().getModel("ui");
    }

    /**
     * Performs a task in sync with other tasks created via this function.
     * Returns the promise chain of the task.
     *
     * @function
     * @name sap.fe.core.controllerextensions.EditFlow#syncTask
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @static
     * @param [vTask] Optional, a promise or function to be executed synchronously
     * @returns Promise resolves once the task is completed
     * @ui5-restricted
     * @final
     */;
    _proto.syncTask = function syncTask(vTask) {
      let fnNewTask;
      if (vTask instanceof Promise) {
        fnNewTask = function () {
          return vTask;
        };
      } else if (typeof vTask === "function") {
        fnNewTask = vTask;
      }
      this._pTasks = this._pTasks || Promise.resolve();
      if (fnNewTask) {
        this._pTasks = this._pTasks.then(fnNewTask).catch(function () {
          return Promise.resolve();
        });
      }
      return this._pTasks;
    };
    _proto.getProgrammingModel = function getProgrammingModel(oContext) {
      return this.getTransactionHelper().getProgrammingModel(oContext);
    };
    _proto.deleteDocumentTransaction = async function deleteDocumentTransaction(oContext, mParameters) {
      var _sap$ui$getCore$byId;
      const oResourceBundle = this.getView().getController().oResourceBundle,
        transactionHelper = this.getTransactionHelper();
      mParameters = mParameters || {};

      // TODO: this setting and removing of contexts shouldn't be in the transaction helper at all
      // for the time being I kept it and provide the internal model context to not break something
      mParameters.internalModelContext = mParameters.controlId ? (_sap$ui$getCore$byId = sap.ui.getCore().byId(mParameters.controlId)) === null || _sap$ui$getCore$byId === void 0 ? void 0 : _sap$ui$getCore$byId.getBindingContext("internal") : null;
      await this.syncTask();
      await transactionHelper.deleteDocument(oContext, mParameters, this.getAppComponent(), oResourceBundle, this.getMessageHandler());
      const internalModel = this.getInternalModel();
      internalModel.setProperty("/sessionOn", false);
      internalModel.setProperty("/stickySessionToken", undefined);
    }

    /**
     * Handles the create event: shows messages and in case of a draft, updates the draft indicator.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oBinding OData list binding object
     */;
    _proto.handleCreateEvents = function handleCreateEvents(oBinding) {
      this.setDraftStatus(DraftStatus.Clear);
      oBinding = oBinding.getBinding && oBinding.getBinding() || oBinding;
      const sProgrammingModel = this.getProgrammingModel(oBinding);
      oBinding.attachEvent("createSent", () => {
        if (sProgrammingModel === ProgrammingModel.Draft) {
          this.setDraftStatus(DraftStatus.Saving);
        }
      });
      oBinding.attachEvent("createCompleted", oEvent => {
        const bSuccess = oEvent.getParameter("success");
        if (sProgrammingModel === ProgrammingModel.Draft) {
          this.setDraftStatus(bSuccess ? DraftStatus.Saved : DraftStatus.Clear);
        }
        this.getMessageHandler().showMessageDialog();
      });
    };
    _proto.getTransactionHelper = function getTransactionHelper() {
      return TransactionHelper;
    };
    _proto.getInternalModel = function getInternalModel() {
      return this.base.getView().getModel("internal");
    }

    /**
     * Creates a new promise to wait for an action to be executed
     *
     * @function
     * @name _createActionPromise
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns {Function} The resolver function which can be used to externally resolve the promise
     */;
    _proto.createActionPromise = function createActionPromise(sActionName, sControlId) {
      let fResolver, fRejector;
      this.oActionPromise = new Promise((resolve, reject) => {
        fResolver = resolve;
        fRejector = reject;
      }).then(oResponse => {
        return Object.assign({
          controlId: sControlId
        }, this.getActionResponseDataAndKeys(sActionName, oResponse));
      });
      return {
        fResolver: fResolver,
        fRejector: fRejector
      };
    }

    /**
     * Gets the getCurrentActionPromise object.
     *
     * @function
     * @name _getCurrentActionPromise
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns Returns the promise
     */;
    _proto.getCurrentActionPromise = function getCurrentActionPromise() {
      return this.oActionPromise;
    };
    _proto.deleteCurrentActionPromise = function deleteCurrentActionPromise() {
      this.oActionPromise = undefined;
    }

    /**
     * @function
     * @name getActionResponseDataAndKeys
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param sActionName The name of the action that is executed
     * @param oResponse The bound action's response data or response context
     * @returns Object with data and names of the key fields of the response
     */;
    _proto.getActionResponseDataAndKeys = function getActionResponseDataAndKeys(sActionName, oResponse) {
      if (Array.isArray(oResponse)) {
        if (oResponse.length === 1) {
          oResponse = oResponse[0].value;
        } else {
          return null;
        }
      }
      if (!oResponse) {
        return null;
      }
      const oView = this.getView(),
        oMetaModel = oView.getModel().getMetaModel().getData(),
        sActionReturnType = oMetaModel && oMetaModel[sActionName] && oMetaModel[sActionName][0] && oMetaModel[sActionName][0].$ReturnType ? oMetaModel[sActionName][0].$ReturnType.$Type : null,
        aKey = sActionReturnType && oMetaModel[sActionReturnType] ? oMetaModel[sActionReturnType].$Key : null;
      return {
        oData: oResponse.getObject(),
        keys: aKey
      };
    };
    _proto.getMessageHandler = function getMessageHandler() {
      // at this point of time it's not meant to release the edit flow for FPM custom pages therefore keep
      // the logic here for now

      if (this.base.messageHandler) {
        return this.base.messageHandler;
      } else {
        throw new Error("Edit Flow works only with a given message handler");
      }
    };
    _proto.handleStickyOn = function handleStickyOn(oContext) {
      const oAppComponent = this.getAppComponent();
      try {
        if (oAppComponent === undefined || oContext === undefined) {
          throw new Error("undefined AppComponent or Context for function handleStickyOn");
        }
        if (!oAppComponent.getRouterProxy().hasNavigationGuard()) {
          const sHashTracker = oAppComponent.getRouterProxy().getHash(),
            oInternalModel = this.getInternalModel();

          // Set a guard in the RouterProxy
          // A timeout is necessary, as with deferred creation the hashChanger is not updated yet with
          // the new hash, and the guard cannot be found in the managed history of the router proxy
          setTimeout(function () {
            oAppComponent.getRouterProxy().setNavigationGuard(oContext.getPath().substring(1));
          }, 0);

          // Setting back navigation on shell service, to get the dicard message box in case of sticky
          oAppComponent.getShellServices().setBackNavigation(this.onBackNavigationInSession.bind(this));
          this.fnDirtyStateProvider = this._registerDirtyStateProvider(oAppComponent, oInternalModel, sHashTracker);
          oAppComponent.getShellServices().registerDirtyStateProvider(this.fnDirtyStateProvider);

          // handle session timeout
          const i18nModel = this.getView().getModel("sap.fe.i18n");
          this.fnHandleSessionTimeout = this._attachSessionTimeout(oContext, i18nModel);
          this.getView().getModel().attachSessionTimeout(this.fnHandleSessionTimeout);
          this.fnStickyDiscardAfterNavigation = this._attachRouteMatched(this, oContext, oAppComponent);
          oAppComponent.getRoutingService().attachRouteMatched(this.fnStickyDiscardAfterNavigation);
        }
      } catch (error) {
        Log.info(error);
        return undefined;
      }
      return true;
    };
    _proto.handleStickyOff = function handleStickyOff() {
      const oAppComponent = this.getAppComponent();
      try {
        if (oAppComponent === undefined) {
          throw new Error("undefined AppComponent for function handleStickyOff");
        }
        if (oAppComponent && oAppComponent.getRouterProxy) {
          // If we have exited from the app, CommonUtils.getAppComponent doesn't return a
          // sap.fe.core.AppComponent, hence the 'if' above
          oAppComponent.getRouterProxy().discardNavigationGuard();
        }
        if (this.fnDirtyStateProvider) {
          oAppComponent.getShellServices().deregisterDirtyStateProvider(this.fnDirtyStateProvider);
          this.fnDirtyStateProvider = undefined;
        }
        if (this.getView().getModel() && this.fnHandleSessionTimeout) {
          this.getView().getModel().detachSessionTimeout(this.fnHandleSessionTimeout);
        }
        oAppComponent.getRoutingService().detachRouteMatched(this.fnStickyDiscardAfterNavigation);
        this.fnStickyDiscardAfterNavigation = undefined;
        this.setEditMode(EditMode.Display, false);
        if (oAppComponent) {
          // If we have exited from the app, CommonUtils.getAppComponent doesn't return a
          // sap.fe.core.AppComponent, hence the 'if' above
          oAppComponent.getShellServices().setBackNavigation();
        }
      } catch (error) {
        Log.info(error);
        return undefined;
      }
      return true;
    }

    /**
     * @description Method to display a 'discard' popover when exiting a sticky session.
     * @function
     * @name onBackNavigationInSession
     * @memberof sap.fe.core.controllerextensions.InternalEditFlow
     */;
    _proto.onBackNavigationInSession = function onBackNavigationInSession() {
      const oView = this.getView(),
        oAppComponent = this.getAppComponent(),
        oRouterProxy = oAppComponent.getRouterProxy();
      if (oRouterProxy.checkIfBackIsOutOfGuard()) {
        const oBindingContext = oView && oView.getBindingContext();
        sticky.processDataLossConfirmation(async () => {
          await this.discardStickySession(oBindingContext);
          history.back();
        }, oView, this.getProgrammingModel(oBindingContext));
        return;
      }
      history.back();
    };
    _proto.discardStickySession = async function discardStickySession(oContext) {
      const discardedContext = await sticky.discardDocument(oContext);
      if (discardedContext !== null && discardedContext !== void 0 && discardedContext.hasPendingChanges()) {
        discardedContext.getBinding().resetChanges();
      }
      discardedContext === null || discardedContext === void 0 ? void 0 : discardedContext.refresh();
      this.handleStickyOff();
    };
    _proto._hasNewActionForSticky = function _hasNewActionForSticky(oContext, oView, sCustomAction) {
      try {
        if (oContext === undefined || oView === undefined) {
          throw new Error("Invalid input parameters for function _hasNewActionForSticky");
        }
        const oMetaModel = oView.getModel().getMetaModel(),
          sMetaPath = oContext.getPath().substring(0, oContext.getPath().indexOf("(")),
          oStickySession = oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported`);
        if (oStickySession && oStickySession.NewAction && oStickySession.NewAction === sCustomAction) {
          return true;
        } else if (oStickySession && oStickySession.AdditionalNewActions) {
          return sCustomAction === oStickySession.AdditionalNewActions.find(function (sAdditionalAction) {
            return sAdditionalAction === sCustomAction;
          }) ? true : false;
        } else {
          return false;
        }
      } catch (error) {
        Log.info(error);
        return undefined;
      }
    };
    _proto._registerDirtyStateProvider = function _registerDirtyStateProvider(oAppComponent, oInternalModel, sHashTracker) {
      return function fnDirtyStateProvider(oNavigationContext) {
        try {
          if (oNavigationContext === undefined) {
            throw new Error("Invalid input parameters for function fnDirtyStateProvider");
          }
          const sTargetHash = oNavigationContext.innerAppRoute,
            oRouterProxy = oAppComponent.getRouterProxy();
          let sLclHashTracker = "";
          let bDirty;
          const bSessionON = oInternalModel.getProperty("/sessionOn");
          if (!bSessionON) {
            // If the sticky session was terminated before hand.
            // Eexample in case of navigating away from application using IBN.
            return undefined;
          }
          if (!oRouterProxy.isNavigationFinalized()) {
            // If navigation is currently happening in RouterProxy, it's a transient state
            // (not dirty)
            bDirty = false;
            sLclHashTracker = sTargetHash;
          } else if (sHashTracker === sTargetHash) {
            // the hash didn't change so either the user attempts to refresh or to leave the app
            bDirty = true;
          } else if (oRouterProxy.checkHashWithGuard(sTargetHash) || oRouterProxy.isGuardCrossAllowedByUser()) {
            // the user attempts to navigate within the root object
            // or crossing the guard has already been allowed by the RouterProxy
            sLclHashTracker = sTargetHash;
            bDirty = false;
          } else {
            // the user attempts to navigate within the app, for example back to the list report
            bDirty = true;
          }
          if (bDirty) {
            // the FLP doesn't call the dirty state provider anymore once it's dirty, as they can't
            // change this due to compatibility reasons we set it back to not-dirty
            setTimeout(function () {
              oAppComponent.getShellServices().setDirtyFlag(false);
            }, 0);
          } else {
            sHashTracker = sLclHashTracker;
          }
          return bDirty;
        } catch (error) {
          Log.info(error);
          return undefined;
        }
      };
    };
    _proto._attachSessionTimeout = function _attachSessionTimeout(oContext, i18nModel) {
      return () => {
        try {
          if (oContext === undefined) {
            throw new Error("Context missing for function fnHandleSessionTimeout");
          }
          // remove transient messages since we will showing our own message
          this.getMessageHandler().removeTransitionMessages();
          const oDialog = new Dialog({
            title: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_TITLE}",
            state: "Warning",
            content: new Text({
              text: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_MESSAGE}"
            }),
            beginButton: new Button({
              text: "{sap.fe.i18n>C_COMMON_DIALOG_OK}",
              type: "Emphasized",
              press: () => {
                // remove sticky handling after navigation since session has already been terminated
                this.handleStickyOff();
                this.getRoutingListener().navigateBackFromContext(oContext);
              }
            }),
            afterClose: function () {
              oDialog.destroy();
            }
          });
          oDialog.addStyleClass("sapUiContentPadding");
          oDialog.setModel(i18nModel, "sap.fe.i18n");
          this.getView().addDependent(oDialog);
          oDialog.open();
        } catch (error) {
          Log.info(error);
          return undefined;
        }
        return true;
      };
    };
    _proto._attachRouteMatched = function _attachRouteMatched(oFnContext, oContext, oAppComponent) {
      return function fnStickyDiscardAfterNavigation() {
        const sCurrentHash = oAppComponent.getRouterProxy().getHash();
        // either current hash is empty so the user left the app or he navigated away from the object
        if (!sCurrentHash || !oAppComponent.getRouterProxy().checkHashWithGuard(sCurrentHash)) {
          oFnContext.discardStickySession(oContext);
          setTimeout(() => {
            //clear the session context to ensure the LR refreshes the list without a session
            oContext.getModel().clearSessionContext();
          }, 0);
        }
      };
    };
    _proto._scrollAndFocusOnInactiveRow = function _scrollAndFocusOnInactiveRow(table) {
      const rowBinding = table.getRowBinding();
      const activeRowIndex = rowBinding.getCount() || 0;
      if (table.data("tableType") !== "ResponsiveTable") {
        if (activeRowIndex > 0) {
          table.scrollToIndex(activeRowIndex - 1);
        }
        table.focusRow(activeRowIndex, true);
      } else {
        /* In a responsive table, the empty rows appear at the beginning of the table. But when we create more, they appear below the new line.
         * So we check the first inactive row first, then we set the focus on it when we press the button.
         * This doesn't impact the GridTable because they appear at the end, and we already focus the before-the-last row (because 2 empty rows exist)
         */
        const allRowContexts = rowBinding.getContexts();
        if (!(allRowContexts !== null && allRowContexts !== void 0 && allRowContexts.length)) {
          table.focusRow(activeRowIndex, true);
          return;
        }
        let focusRow = activeRowIndex,
          index = 0;
        for (const singleContext of allRowContexts) {
          if (singleContext.isInactive() && index < focusRow) {
            focusRow = index;
          }
          index++;
        }
        if (focusRow > 0) {
          table.scrollToIndex(focusRow);
        }
        table.focusRow(focusRow, true);
      }
    };
    _proto.createEmptyRowsAndFocus = async function createEmptyRowsAndFocus(table) {
      var _tableAPI$tableDefini, _tableAPI$tableDefini2, _table$getBindingCont;
      const tableAPI = table.getParent();
      if (tableAPI !== null && tableAPI !== void 0 && (_tableAPI$tableDefini = tableAPI.tableDefinition) !== null && _tableAPI$tableDefini !== void 0 && (_tableAPI$tableDefini2 = _tableAPI$tableDefini.control) !== null && _tableAPI$tableDefini2 !== void 0 && _tableAPI$tableDefini2.inlineCreationRowsHiddenInEditMode && !((_table$getBindingCont = table.getBindingContext("ui")) !== null && _table$getBindingCont !== void 0 && _table$getBindingCont.getProperty("createMode"))) {
        // With the parameter, we don't have empty rows in Edit mode, so we need to create them before setting the focus on them
        await tableAPI.setUpEmptyRows(table, true);
      }
      this._scrollAndFocusOnInactiveRow(table);
    };
    return InternalEditFlow;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "createMultipleDocuments", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "createMultipleDocuments"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteMultipleDocuments", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteMultipleDocuments"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "computeEditMode", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "computeEditMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setEditMode", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "setEditMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setDraftStatus", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "setDraftStatus"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getRoutingListener", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getRoutingListener"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getGlobalUIModel", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "getGlobalUIModel"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "syncTask", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "syncTask"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getProgrammingModel", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "getProgrammingModel"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteDocumentTransaction", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteDocumentTransaction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleCreateEvents", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "handleCreateEvents"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getTransactionHelper", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "getTransactionHelper"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getInternalModel", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "getInternalModel"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createActionPromise", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "createActionPromise"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getCurrentActionPromise", [_dec30, _dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "getCurrentActionPromise"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteCurrentActionPromise", [_dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteCurrentActionPromise"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getActionResponseDataAndKeys", [_dec34, _dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "getActionResponseDataAndKeys"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getMessageHandler", [_dec36, _dec37], Object.getOwnPropertyDescriptor(_class2.prototype, "getMessageHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleStickyOn", [_dec38, _dec39], Object.getOwnPropertyDescriptor(_class2.prototype, "handleStickyOn"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleStickyOff", [_dec40, _dec41], Object.getOwnPropertyDescriptor(_class2.prototype, "handleStickyOff"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBackNavigationInSession", [_dec42, _dec43], Object.getOwnPropertyDescriptor(_class2.prototype, "onBackNavigationInSession"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "discardStickySession", [_dec44, _dec45], Object.getOwnPropertyDescriptor(_class2.prototype, "discardStickySession"), _class2.prototype)), _class2)) || _class);
  return InternalEditFlow;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9ncmFtbWluZ01vZGVsIiwiRkVMaWJyYXJ5IiwiRHJhZnRTdGF0dXMiLCJFZGl0TW9kZSIsIkNyZWF0aW9uTW9kZSIsIkludGVybmFsRWRpdEZsb3ciLCJkZWZpbmVVSTVDbGFzcyIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwiZ2V0QXBwQ29tcG9uZW50IiwiYmFzZSIsInNldENyZWF0aW9uTW9kZSIsImJDcmVhdGlvbk1vZGUiLCJ1aU1vZGVsQ29udGV4dCIsImdldFZpZXciLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldEdsb2JhbFVJTW9kZWwiLCJzZXRQcm9wZXJ0eSIsImdldENyZWF0aW9uTW9kZSIsImdldFByb3BlcnR5IiwiaXNEb2N1bWVudE1vZGlmaWVkIiwic2V0RG9jdW1lbnRNb2RpZmllZCIsIm1vZGlmaWVkIiwic2V0RG9jdW1lbnRNb2RpZmllZE9uQ3JlYXRlIiwibGlzdEJpbmRpbmciLCJpc1JlbGF0aXZlIiwiY3JlYXRlTXVsdGlwbGVEb2N1bWVudHMiLCJvTGlzdEJpbmRpbmciLCJhRGF0YSIsImJDcmVhdGVBdEVuZCIsImJGcm9tQ29weVBhc3RlIiwiYmVmb3JlQ3JlYXRlQ2FsbEJhY2siLCJiSW5hY3RpdmUiLCJ0cmFuc2FjdGlvbkhlbHBlciIsImdldFRyYW5zYWN0aW9uSGVscGVyIiwib0xvY2tPYmplY3QiLCJCdXN5TG9ja2VyIiwibG9jayIsImFGaW5hbENvbnRleHRzIiwic3luY1Rhc2siLCJ0aGVuIiwiY29udGV4dFBhdGgiLCJnZXRQYXRoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJvTW9kZWwiLCJnZXRNb2RlbCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJzTWV0YVBhdGgiLCJnZXRDb250ZXh0IiwiZ2V0TWV0YVBhdGgiLCJoYW5kbGVDcmVhdGVFdmVudHMiLCJhQ3JlYXRpb25Qcm9taXNlcyIsIm1hcCIsIm1Qcm9wZXJ0eVZhbHVlcyIsIm1QYXJhbWV0ZXJzIiwiZGF0YSIsImtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQiLCJidXN5TW9kZSIsImNyZWF0aW9uTW9kZSIsIkNyZWF0aW9uUm93IiwicGFyZW50Q29udHJvbCIsImNyZWF0ZUF0RW5kIiwiaW5hY3RpdmUiLCJzUHJvcGVydHlQYXRoIiwib1Byb3BlcnR5IiwiZ2V0T2JqZWN0IiwiJGtpbmQiLCJjcmVhdGVEb2N1bWVudCIsImdldE1lc3NhZ2VIYW5kbGVyIiwiYWxsIiwiYUNvbnRleHRzIiwib05ld0NvbnRleHQiLCJjcmVhdGVkIiwib0JpbmRpbmdDb250ZXh0IiwiQ29tbW9uVXRpbHMiLCJoYXNUcmFuc2llbnRDb250ZXh0IiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwicmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5IiwiY2F0Y2giLCJlcnIiLCJMb2ciLCJlcnJvciIsInJlamVjdCIsImZpbmFsbHkiLCJ1bmxvY2siLCJkZWxldGVNdWx0aXBsZURvY3VtZW50cyIsIm9Db250cm9sIiwiYnlJZCIsImNvbnRyb2xJZCIsIkVycm9yIiwiZ2V0QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJiRmluZEFjdGl2ZUNvbnRleHRzIiwiZGVsZXRlRG9jdW1lbnRUcmFuc2FjdGlvbiIsIm9SZXN1bHQiLCJpc0EiLCJjbGVhclNlbGVjdGlvbiIsImlzUm9vdCIsImF0dGFjaEV2ZW50T25jZSIsInJlZnJlc2giLCJfaXNGY2xFbmFibGVkIiwiRWRpdFN0YXRlIiwic2V0RWRpdFN0YXRlRGlydHkiLCJzZW5kIiwiQWN0aXZpdHkiLCJEZWxldGUiLCJjb250ZXh0Iiwib0Vycm9yIiwiY29tcHV0ZUVkaXRNb2RlIiwib0NvbnRleHQiLCJzUHJvZ3JhbW1pbmdNb2RlbCIsImdldFByb2dyYW1taW5nTW9kZWwiLCJEcmFmdCIsInNldERyYWZ0U3RhdHVzIiwiQ2xlYXIiLCJfc2V0RWRpdGFibGVQZW5kaW5nIiwiYklzQWN0aXZlRW50aXR5IiwicmVxdWVzdE9iamVjdCIsInNldEVkaXRNb2RlIiwiRWRpdGFibGUiLCJiSGFzQWN0aXZlRW50aXR5IiwidW5kZWZpbmVkIiwiRGlzcGxheSIsIlN0aWNreSIsImxhc3RJbnZva2VkQWN0aW9uTmFtZSIsImdldEludGVybmFsTW9kZWwiLCJfaGFzTmV3QWN0aW9uRm9yU3RpY2t5IiwiaGFuZGxlU3RpY2t5T24iLCJzRWRpdE1vZGUiLCJvR2xvYmFsTW9kZWwiLCJwZW5kaW5nIiwiZ2xvYmFsTW9kZWwiLCJzRHJhZnRTdGF0ZSIsImdldFJvdXRpbmdMaXN0ZW5lciIsIl9yb3V0aW5nIiwidlRhc2siLCJmbk5ld1Rhc2siLCJfcFRhc2tzIiwib1Jlc291cmNlQnVuZGxlIiwiZ2V0Q29udHJvbGxlciIsImludGVybmFsTW9kZWxDb250ZXh0Iiwic2FwIiwidWkiLCJnZXRDb3JlIiwiZGVsZXRlRG9jdW1lbnQiLCJpbnRlcm5hbE1vZGVsIiwib0JpbmRpbmciLCJhdHRhY2hFdmVudCIsIlNhdmluZyIsIm9FdmVudCIsImJTdWNjZXNzIiwiZ2V0UGFyYW1ldGVyIiwiU2F2ZWQiLCJzaG93TWVzc2FnZURpYWxvZyIsIlRyYW5zYWN0aW9uSGVscGVyIiwiY3JlYXRlQWN0aW9uUHJvbWlzZSIsInNBY3Rpb25OYW1lIiwic0NvbnRyb2xJZCIsImZSZXNvbHZlciIsImZSZWplY3RvciIsIm9BY3Rpb25Qcm9taXNlIiwib1Jlc3BvbnNlIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0QWN0aW9uUmVzcG9uc2VEYXRhQW5kS2V5cyIsImdldEN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJ2YWx1ZSIsIm9WaWV3IiwiZ2V0RGF0YSIsInNBY3Rpb25SZXR1cm5UeXBlIiwiJFJldHVyblR5cGUiLCIkVHlwZSIsImFLZXkiLCIkS2V5Iiwib0RhdGEiLCJrZXlzIiwibWVzc2FnZUhhbmRsZXIiLCJvQXBwQ29tcG9uZW50IiwiZ2V0Um91dGVyUHJveHkiLCJoYXNOYXZpZ2F0aW9uR3VhcmQiLCJzSGFzaFRyYWNrZXIiLCJnZXRIYXNoIiwib0ludGVybmFsTW9kZWwiLCJzZXRUaW1lb3V0Iiwic2V0TmF2aWdhdGlvbkd1YXJkIiwic3Vic3RyaW5nIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsInNldEJhY2tOYXZpZ2F0aW9uIiwib25CYWNrTmF2aWdhdGlvbkluU2Vzc2lvbiIsImJpbmQiLCJmbkRpcnR5U3RhdGVQcm92aWRlciIsIl9yZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciIsInJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIiwiaTE4bk1vZGVsIiwiZm5IYW5kbGVTZXNzaW9uVGltZW91dCIsIl9hdHRhY2hTZXNzaW9uVGltZW91dCIsImF0dGFjaFNlc3Npb25UaW1lb3V0IiwiZm5TdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uIiwiX2F0dGFjaFJvdXRlTWF0Y2hlZCIsImdldFJvdXRpbmdTZXJ2aWNlIiwiYXR0YWNoUm91dGVNYXRjaGVkIiwiaW5mbyIsImhhbmRsZVN0aWNreU9mZiIsImRpc2NhcmROYXZpZ2F0aW9uR3VhcmQiLCJkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIiwiZGV0YWNoU2Vzc2lvblRpbWVvdXQiLCJkZXRhY2hSb3V0ZU1hdGNoZWQiLCJvUm91dGVyUHJveHkiLCJjaGVja0lmQmFja0lzT3V0T2ZHdWFyZCIsInN0aWNreSIsInByb2Nlc3NEYXRhTG9zc0NvbmZpcm1hdGlvbiIsImRpc2NhcmRTdGlja3lTZXNzaW9uIiwiaGlzdG9yeSIsImJhY2siLCJkaXNjYXJkZWRDb250ZXh0IiwiZGlzY2FyZERvY3VtZW50IiwiaGFzUGVuZGluZ0NoYW5nZXMiLCJyZXNldENoYW5nZXMiLCJzQ3VzdG9tQWN0aW9uIiwiaW5kZXhPZiIsIm9TdGlja3lTZXNzaW9uIiwiTmV3QWN0aW9uIiwiQWRkaXRpb25hbE5ld0FjdGlvbnMiLCJmaW5kIiwic0FkZGl0aW9uYWxBY3Rpb24iLCJvTmF2aWdhdGlvbkNvbnRleHQiLCJzVGFyZ2V0SGFzaCIsImlubmVyQXBwUm91dGUiLCJzTGNsSGFzaFRyYWNrZXIiLCJiRGlydHkiLCJiU2Vzc2lvbk9OIiwiaXNOYXZpZ2F0aW9uRmluYWxpemVkIiwiY2hlY2tIYXNoV2l0aEd1YXJkIiwiaXNHdWFyZENyb3NzQWxsb3dlZEJ5VXNlciIsInNldERpcnR5RmxhZyIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsIm9EaWFsb2ciLCJEaWFsb2ciLCJ0aXRsZSIsInN0YXRlIiwiY29udGVudCIsIlRleHQiLCJ0ZXh0IiwiYmVnaW5CdXR0b24iLCJCdXR0b24iLCJ0eXBlIiwicHJlc3MiLCJuYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dCIsImFmdGVyQ2xvc2UiLCJkZXN0cm95IiwiYWRkU3R5bGVDbGFzcyIsInNldE1vZGVsIiwiYWRkRGVwZW5kZW50Iiwib3BlbiIsIm9GbkNvbnRleHQiLCJzQ3VycmVudEhhc2giLCJjbGVhclNlc3Npb25Db250ZXh0IiwiX3Njcm9sbEFuZEZvY3VzT25JbmFjdGl2ZVJvdyIsInRhYmxlIiwicm93QmluZGluZyIsImFjdGl2ZVJvd0luZGV4IiwiZ2V0Q291bnQiLCJzY3JvbGxUb0luZGV4IiwiZm9jdXNSb3ciLCJhbGxSb3dDb250ZXh0cyIsImdldENvbnRleHRzIiwiaW5kZXgiLCJzaW5nbGVDb250ZXh0IiwiaXNJbmFjdGl2ZSIsImNyZWF0ZUVtcHR5Um93c0FuZEZvY3VzIiwidGFibGVBUEkiLCJnZXRQYXJlbnQiLCJ0YWJsZURlZmluaXRpb24iLCJjb250cm9sIiwiaW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZSIsInNldFVwRW1wdHlSb3dzIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSW50ZXJuYWxFZGl0Rmxvdy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQnVzeUxvY2tlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvQnVzeUxvY2tlclwiO1xuaW1wb3J0IHsgc2VuZCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0FjdGl2aXR5U3luY1wiO1xuaW1wb3J0IHsgQWN0aXZpdHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uQ29tbW9uXCI7XG5pbXBvcnQgc3RpY2t5IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9zdGlja3lcIjtcbmltcG9ydCBUcmFuc2FjdGlvbkhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvVHJhbnNhY3Rpb25IZWxwZXJcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBmaW5hbEV4dGVuc2lvbiwgcHVibGljRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgRWRpdFN0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0VkaXRTdGF0ZVwiO1xuaW1wb3J0IEZFTGlicmFyeSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgVGFibGVBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVBUElcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL01vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbmNvbnN0IFByb2dyYW1taW5nTW9kZWwgPSBGRUxpYnJhcnkuUHJvZ3JhbW1pbmdNb2RlbCxcblx0RHJhZnRTdGF0dXMgPSBGRUxpYnJhcnkuRHJhZnRTdGF0dXMsXG5cdEVkaXRNb2RlID0gRkVMaWJyYXJ5LkVkaXRNb2RlLFxuXHRDcmVhdGlvbk1vZGUgPSBGRUxpYnJhcnkuQ3JlYXRpb25Nb2RlO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5JbnRlcm5hbEVkaXRGbG93XCIpXG5jbGFzcyBJbnRlcm5hbEVkaXRGbG93IGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdHByaXZhdGUgX3BUYXNrczogYW55O1xuXHRwcml2YXRlIG9BY3Rpb25Qcm9taXNlPzogUHJvbWlzZTxhbnk+O1xuXHRwcml2YXRlIGZuRGlydHlTdGF0ZVByb3ZpZGVyPzogRnVuY3Rpb247XG5cdHByaXZhdGUgZm5IYW5kbGVTZXNzaW9uVGltZW91dD86IEZ1bmN0aW9uO1xuXHRwcml2YXRlIGZuU3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbj86IEZ1bmN0aW9uO1xuXG5cdGdldEFwcENvbXBvbmVudCgpOiBBcHBDb21wb25lbnQge1xuXHRcdHJldHVybiB0aGlzLmJhc2UuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGF0IHRoZSBjdXJyZW50IHBhZ2UgY29udGFpbnMgYSBuZXdseSBjcmVhdGVkIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIGJDcmVhdGlvbk1vZGUgVHJ1ZSBpZiB0aGUgb2JqZWN0IGlzIG5ld1xuXHQgKi9cblx0c2V0Q3JlYXRpb25Nb2RlKGJDcmVhdGlvbk1vZGU6IGJvb2xlYW4pIHtcblx0XHRjb25zdCB1aU1vZGVsQ29udGV4dCA9IHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJ1aVwiKSBhcyBDb250ZXh0O1xuXHRcdHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpLnNldFByb3BlcnR5KFwiY3JlYXRlTW9kZVwiLCBiQ3JlYXRpb25Nb2RlLCB1aU1vZGVsQ29udGV4dCwgdHJ1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGN1cnJlbnQgcGFnZSBjb250YWlucyBhIG5ld2x5IGNyZWF0ZWQgb2JqZWN0IG9yIG5vdC5cblx0ICpcblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgb2JqZWN0IGlzIG5ld1xuXHQgKi9cblx0Z2V0Q3JlYXRpb25Nb2RlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHVpTW9kZWxDb250ZXh0ID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcInVpXCIpIGFzIENvbnRleHQ7XG5cdFx0cmV0dXJuICEhdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCkuZ2V0UHJvcGVydHkoXCJjcmVhdGVNb2RlXCIsIHVpTW9kZWxDb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgb2JqZWN0IGJlaW5nIGVkaXRlZCAob3Igb25lIG9mIGl0cyBzdWItb2JqZWN0cykgaGFzIGJlZW4gbW9kaWZpZWQgb3Igbm90LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBvYmplY3QgaGFzIGJlZW4gbW9kaWZpZWRcblx0ICovXG5cdGlzRG9jdW1lbnRNb2RpZmllZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gISF0aGlzLmdldEdsb2JhbFVJTW9kZWwoKS5nZXRQcm9wZXJ0eShcIi9pc0RvY3VtZW50TW9kaWZpZWRcIik7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGF0IHRoZSBvYmplY3QgYmVpbmcgZWRpdGVkIChvciBvbmUgb2YgaXRzIHN1Yi1vYmplY3RzKSBoYXMgYmVlbiBtb2RpZmllZC5cblx0ICpcblx0ICogQHBhcmFtIG1vZGlmaWVkIFRydWUgaWYgdGhlIG9iamVjdCBoYXMgYmVlbiBtb2RpZmllZFxuXHQgKi9cblx0c2V0RG9jdW1lbnRNb2RpZmllZChtb2RpZmllZDogYm9vbGVhbikge1xuXHRcdHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpLnNldFByb3BlcnR5KFwiL2lzRG9jdW1lbnRNb2RpZmllZFwiLCBtb2RpZmllZCk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGF0IHRoZSBvYmplY3QgYmVpbmcgZWRpdGVkIGhhcyBiZWVuIG1vZGlmaWVkIGJ5IGNyZWF0aW5nIGEgc3ViLW9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIFRoZSBsaXN0IGJpbmRpbmcgb24gd2hpY2ggdGhlIG9iamVjdCBoYXMgYmVlbiBjcmVhdGVkXG5cdCAqL1xuXHRzZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUobGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcpIHtcblx0XHQvLyBTZXQgdGhlIG1vZGlmaWVkIGZsYWcgb25seSBvbiByZWxhdGl2ZSBsaXN0QmluZGluZ3MsIGkuZS4gd2hlbiBjcmVhdGluZyBhIHN1Yi1vYmplY3Rcblx0XHQvLyBJZiB0aGUgbGlzdEJpbmRpbmcgaXMgbm90IHJlbGF0aXZlLCB0aGVuIGl0J3MgYSBjcmVhdGlvbiBmcm9tIHRoZSBMaXN0UmVwb3J0LCBhbmQgYnkgZGVmYXVsdCBhIG5ld2x5IGNyZWF0ZWQgcm9vdCBvYmplY3QgaXNuJ3QgY29uc2lkZXJlZCBhcyBtb2RpZmllZFxuXHRcdGlmIChsaXN0QmluZGluZy5pc1JlbGF0aXZlKCkpIHtcblx0XHRcdHRoaXMuc2V0RG9jdW1lbnRNb2RpZmllZCh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Y3JlYXRlTXVsdGlwbGVEb2N1bWVudHMoXG5cdFx0b0xpc3RCaW5kaW5nOiBhbnksXG5cdFx0YURhdGE6IGFueSxcblx0XHRiQ3JlYXRlQXRFbmQ6IGFueSxcblx0XHRiRnJvbUNvcHlQYXN0ZTogYm9vbGVhbixcblx0XHRiZWZvcmVDcmVhdGVDYWxsQmFjazogYW55LFxuXHRcdGJJbmFjdGl2ZSA9IGZhbHNlXG5cdCkge1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpLFxuXHRcdFx0b0xvY2tPYmplY3QgPSB0aGlzLmdldEdsb2JhbFVJTW9kZWwoKTtcblxuXHRcdEJ1c3lMb2NrZXIubG9jayhvTG9ja09iamVjdCk7XG5cdFx0bGV0IGFGaW5hbENvbnRleHRzOiBhbnlbXSA9IFtdO1xuXHRcdHJldHVybiB0aGlzLnN5bmNUYXNrKClcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0cmV0dXJuIGJlZm9yZUNyZWF0ZUNhbGxCYWNrXG5cdFx0XHRcdFx0PyBiZWZvcmVDcmVhdGVDYWxsQmFjayh7IGNvbnRleHRQYXRoOiBvTGlzdEJpbmRpbmcgJiYgb0xpc3RCaW5kaW5nLmdldFBhdGgoKSB9KVxuXHRcdFx0XHRcdDogUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBvTW9kZWwgPSBvTGlzdEJpbmRpbmcuZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRsZXQgc01ldGFQYXRoOiBzdHJpbmc7XG5cblx0XHRcdFx0aWYgKG9MaXN0QmluZGluZy5nZXRDb250ZXh0KCkpIHtcblx0XHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKGAke29MaXN0QmluZGluZy5nZXRDb250ZXh0KCkuZ2V0UGF0aCgpfS8ke29MaXN0QmluZGluZy5nZXRQYXRoKCl9YCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuaGFuZGxlQ3JlYXRlRXZlbnRzKG9MaXN0QmluZGluZyk7XG5cblx0XHRcdFx0Ly8gSXRlcmF0ZSBvbiBhbGwgaXRlbXMgYW5kIHN0b3JlIHRoZSBjb3JyZXNwb25kaW5nIGNyZWF0aW9uIHByb21pc2Vcblx0XHRcdFx0Y29uc3QgYUNyZWF0aW9uUHJvbWlzZXMgPSBhRGF0YS5tYXAoKG1Qcm9wZXJ0eVZhbHVlczogYW55KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgbVBhcmFtZXRlcnM6IGFueSA9IHsgZGF0YToge30gfTtcblxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQgPSBmYWxzZTsgLy8gY3VycmVudGx5IG5vdCBmdWxseSBzdXBwb3J0ZWRcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5idXN5TW9kZSA9IFwiTm9uZVwiO1xuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdztcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQgPSBiQ3JlYXRlQXRFbmQ7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW5hY3RpdmUgPSBiSW5hY3RpdmU7XG5cblx0XHRcdFx0XHQvLyBSZW1vdmUgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIGFzIHdlIGRvbid0IHN1cHBvcnQgZGVlcCBjcmVhdGVcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHNQcm9wZXJ0eVBhdGggaW4gbVByb3BlcnR5VmFsdWVzKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvUHJvcGVydHkgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9LyR7c1Byb3BlcnR5UGF0aH1gKTtcblx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHkgJiYgb1Byb3BlcnR5LiRraW5kICE9PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIG1Qcm9wZXJ0eVZhbHVlc1tzUHJvcGVydHlQYXRoXSkge1xuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kYXRhW3NQcm9wZXJ0eVBhdGhdID0gbVByb3BlcnR5VmFsdWVzW3NQcm9wZXJ0eVBhdGhdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiB0cmFuc2FjdGlvbkhlbHBlci5jcmVhdGVEb2N1bWVudChcblx0XHRcdFx0XHRcdG9MaXN0QmluZGluZyxcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdFx0XHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKSxcblx0XHRcdFx0XHRcdGJGcm9tQ29weVBhc3RlLFxuXHRcdFx0XHRcdFx0dGhpcy5nZXRWaWV3KClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYUNyZWF0aW9uUHJvbWlzZXMpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKChhQ29udGV4dHM6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoIWJJbmFjdGl2ZSkge1xuXHRcdFx0XHRcdHRoaXMuc2V0RG9jdW1lbnRNb2RpZmllZE9uQ3JlYXRlKG9MaXN0QmluZGluZyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gdHJhbnNpZW50IGNvbnRleHRzIGFyZSByZWxpYWJseSByZW1vdmVkIG9uY2Ugb05ld0NvbnRleHQuY3JlYXRlZCgpIGlzIHJlc29sdmVkXG5cdFx0XHRcdGFGaW5hbENvbnRleHRzID0gYUNvbnRleHRzO1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoXG5cdFx0XHRcdFx0YUNvbnRleHRzLm1hcChmdW5jdGlvbiAob05ld0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKCFvTmV3Q29udGV4dC5iSW5hY3RpdmUpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9OZXdDb250ZXh0LmNyZWF0ZWQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKTtcblxuXHRcdFx0XHQvLyBpZiB0aGVyZSBhcmUgdHJhbnNpZW50IGNvbnRleHRzLCB3ZSBtdXN0IGF2b2lkIHJlcXVlc3Rpbmcgc2lkZSBlZmZlY3RzXG5cdFx0XHRcdC8vIHRoaXMgaXMgYXZvaWQgYSBwb3RlbnRpYWwgbGlzdCByZWZyZXNoLCB0aGVyZSBjb3VsZCBiZSBhIHNpZGUgZWZmZWN0IHRoYXQgcmVmcmVzaGVzIHRoZSBsaXN0IGJpbmRpbmdcblx0XHRcdFx0Ly8gaWYgbGlzdCBiaW5kaW5nIGlzIHJlZnJlc2hlZCwgdHJhbnNpZW50IGNvbnRleHRzIG1pZ2h0IGJlIGxvc3Rcblx0XHRcdFx0aWYgKCFDb21tb25VdGlscy5oYXNUcmFuc2llbnRDb250ZXh0KG9MaXN0QmluZGluZykpIHtcblx0XHRcdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpXG5cdFx0XHRcdFx0XHQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKClcblx0XHRcdFx0XHRcdC5yZXF1ZXN0U2lkZUVmZmVjdHNGb3JOYXZpZ2F0aW9uUHJvcGVydHkob0xpc3RCaW5kaW5nLmdldFBhdGgoKSwgb0JpbmRpbmdDb250ZXh0IGFzIENvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnI6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBjcmVhdGluZyBtdWx0aXBsZSBkb2N1bWVudHMuXCIpO1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBhRmluYWxDb250ZXh0cztcblx0XHRcdH0pO1xuXHR9XG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRkZWxldGVNdWx0aXBsZURvY3VtZW50cyhhQ29udGV4dHM6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IG9Mb2NrT2JqZWN0ID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cdFx0Y29uc3Qgb0NvbnRyb2wgPSB0aGlzLmdldFZpZXcoKS5ieUlkKG1QYXJhbWV0ZXJzLmNvbnRyb2xJZCk7XG5cdFx0aWYgKCFvQ29udHJvbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwicGFyYW1ldGVyIGNvbnRyb2xJZCBtaXNzaW5nIG9yIGluY29ycmVjdFwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCA9IG9Db250cm9sO1xuXHRcdH1cblx0XHRjb25zdCBvTGlzdEJpbmRpbmcgPSAob0NvbnRyb2wuZ2V0QmluZGluZyhcIml0ZW1zXCIpIHx8IChvQ29udHJvbCBhcyBUYWJsZSkuZ2V0Um93QmluZGluZygpKSBhcyBPRGF0YUxpc3RCaW5kaW5nO1xuXHRcdG1QYXJhbWV0ZXJzLmJGaW5kQWN0aXZlQ29udGV4dHMgPSB0cnVlO1xuXHRcdEJ1c3lMb2NrZXIubG9jayhvTG9ja09iamVjdCk7XG5cblx0XHRyZXR1cm4gdGhpcy5kZWxldGVEb2N1bWVudFRyYW5zYWN0aW9uKGFDb250ZXh0cywgbVBhcmFtZXRlcnMpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGxldCBvUmVzdWx0O1xuXG5cdFx0XHRcdC8vIE11bHRpcGxlIG9iamVjdCBkZWxldGlvbiBpcyB0cmlnZ2VyZWQgZnJvbSBhIGxpc3Rcblx0XHRcdFx0Ly8gRmlyc3QgY2xlYXIgdGhlIHNlbGVjdGlvbiBpbiB0aGUgdGFibGUgYXMgaXQncyBub3QgdmFsaWQgYW55IG1vcmVcblx0XHRcdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0XHQob0NvbnRyb2wgYXMgYW55KS5jbGVhclNlbGVjdGlvbigpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlbiByZWZyZXNoIHRoZSBsaXN0LWJpbmRpbmcgKExSKSwgb3IgcmVxdWlyZSBzaWRlLWVmZmVjdHMgKE9QKVxuXHRcdFx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0XHRpZiAoKG9MaXN0QmluZGluZyBhcyBhbnkpLmlzUm9vdCgpKSB7XG5cdFx0XHRcdFx0Ly8ga2VlcCBwcm9taXNlIGNoYWluIHBlbmRpbmcgdW50aWwgcmVmcmVzaCBvZiBsaXN0YmluZGluZyBpcyBjb21wbGV0ZWRcblx0XHRcdFx0XHRvUmVzdWx0ID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcblx0XHRcdFx0XHRcdG9MaXN0QmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvTGlzdEJpbmRpbmcucmVmcmVzaCgpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0XHRcdC8vIGlmIHRoZXJlIGFyZSB0cmFuc2llbnQgY29udGV4dHMsIHdlIG11c3QgYXZvaWQgcmVxdWVzdGluZyBzaWRlIGVmZmVjdHNcblx0XHRcdFx0XHQvLyB0aGlzIGlzIGF2b2lkIGEgcG90ZW50aWFsIGxpc3QgcmVmcmVzaCwgdGhlcmUgY291bGQgYmUgYSBzaWRlIGVmZmVjdCB0aGF0IHJlZnJlc2hlcyB0aGUgbGlzdCBiaW5kaW5nXG5cdFx0XHRcdFx0Ly8gaWYgbGlzdCBiaW5kaW5nIGlzIHJlZnJlc2hlZCwgdHJhbnNpZW50IGNvbnRleHRzIG1pZ2h0IGJlIGxvc3Rcblx0XHRcdFx0XHRpZiAoIUNvbW1vblV0aWxzLmhhc1RyYW5zaWVudENvbnRleHQob0xpc3RCaW5kaW5nKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKVxuXHRcdFx0XHRcdFx0XHQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKClcblx0XHRcdFx0XHRcdFx0LnJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eShvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpLCBvQmluZGluZ0NvbnRleHQgYXMgQ29udGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gZGVsZXRpbmcgYXQgbGVhc3Qgb25lIG9iamVjdCBzaG91bGQgYWxzbyBzZXQgdGhlIFVJIHRvIGRpcnR5XG5cdFx0XHRcdGlmICghdGhpcy5nZXRBcHBDb21wb25lbnQoKS5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHNlbmQoXG5cdFx0XHRcdFx0dGhpcy5nZXRWaWV3KCksXG5cdFx0XHRcdFx0QWN0aXZpdHkuRGVsZXRlLFxuXHRcdFx0XHRcdGFDb250ZXh0cy5tYXAoKGNvbnRleHQ6IENvbnRleHQpID0+IGNvbnRleHQuZ2V0UGF0aCgpKVxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdHJldHVybiBvUmVzdWx0O1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGhlIGRvY3VtZW50KHMpXCIsIG9FcnJvcik7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvTG9ja09iamVjdCk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWNpZGVzIGlmIGEgZG9jdW1lbnQgaXMgdG8gYmUgc2hvd24gaW4gZGlzcGxheSBvciBlZGl0IG1vZGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfY29tcHV0ZUVkaXRNb2RlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5JbnRlcm5hbEVkaXRGbG93XG5cdCAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9IG9Db250ZXh0IFRoZSBjb250ZXh0IHRvIGJlIGRpc3BsYXllZCBvciBlZGl0ZWRcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgcmVzb2x2ZXMgb25jZSB0aGUgZWRpdCBtb2RlIGlzIGNvbXB1dGVkXG5cdCAqL1xuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBjb21wdXRlRWRpdE1vZGUob0NvbnRleHQ6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblxuXHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHRcdHRoaXMuX3NldEVkaXRhYmxlUGVuZGluZyh0cnVlKTtcblx0XHRcdFx0Y29uc3QgYklzQWN0aXZlRW50aXR5ID0gYXdhaXQgb0NvbnRleHQucmVxdWVzdE9iamVjdChcIklzQWN0aXZlRW50aXR5XCIpO1xuXHRcdFx0XHRpZiAoYklzQWN0aXZlRW50aXR5ID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdC8vIGluIGNhc2UgdGhlIGRvY3VtZW50IGlzIGRyYWZ0IHNldCBpdCBpbiBlZGl0IG1vZGVcblx0XHRcdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkVkaXRhYmxlKTtcblx0XHRcdFx0XHRjb25zdCBiSGFzQWN0aXZlRW50aXR5ID0gYXdhaXQgb0NvbnRleHQucmVxdWVzdE9iamVjdChcIkhhc0FjdGl2ZUVudGl0eVwiKTtcblx0XHRcdFx0XHR0aGlzLnNldEVkaXRNb2RlKHVuZGVmaW5lZCwgIWJIYXNBY3RpdmVFbnRpdHkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGFjdGl2ZSBkb2N1bWVudCwgc3RheSBvbiBkaXNwbGF5IG1vZGVcblx0XHRcdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkRpc3BsYXksIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl9zZXRFZGl0YWJsZVBlbmRpbmcoZmFsc2UpO1xuXHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZGV0ZXJtaW5pbmcgdGhlIGVkaXRNb2RlIGZvciBkcmFmdFwiLCBvRXJyb3IpO1xuXHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kpIHtcblx0XHRcdGNvbnN0IGxhc3RJbnZva2VkQWN0aW9uTmFtZSA9IHRoaXMuZ2V0SW50ZXJuYWxNb2RlbCgpLmdldFByb3BlcnR5KFwiL2xhc3RJbnZva2VkQWN0aW9uXCIpO1xuXHRcdFx0aWYgKGxhc3RJbnZva2VkQWN0aW9uTmFtZSAmJiB0aGlzLl9oYXNOZXdBY3Rpb25Gb3JTdGlja3kob0NvbnRleHQsIHRoaXMuZ2V0VmlldygpLCBsYXN0SW52b2tlZEFjdGlvbk5hbWUpKSB7XG5cdFx0XHRcdHRoaXMuc2V0RWRpdE1vZGUoRWRpdE1vZGUuRWRpdGFibGUsIHRydWUpO1xuXHRcdFx0XHRpZiAoIXRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5oYW5kbGVTdGlja3lPbihvQ29udGV4dCk7XG5cdFx0XHRcdHRoaXMuZ2V0SW50ZXJuYWxNb2RlbCgpLnNldFByb3BlcnR5KFwiL2xhc3RJbnZva2VkQWN0aW9uXCIsIHVuZGVmaW5lZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGVkaXQgbW9kZS5cblx0ICpcblx0ICogQHBhcmFtIHNFZGl0TW9kZSBUaGUgZWRpdCBtb2RlXG5cdCAqIEBwYXJhbSBiQ3JlYXRpb25Nb2RlIFRydWUgaWYgdGhlIG9iamVjdCBoYXMgYmVlbiBuZXdseSBjcmVhdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0c2V0RWRpdE1vZGUoc0VkaXRNb2RlPzogc3RyaW5nLCBiQ3JlYXRpb25Nb2RlPzogYm9vbGVhbikge1xuXHRcdC8vIGF0IHRoaXMgcG9pbnQgb2YgdGltZSBpdCdzIG5vdCBtZWFudCB0byByZWxlYXNlIHRoZSBlZGl0IGZsb3cgZm9yIGZyZWVzdHlsZSB1c2FnZSB0aGVyZWZvcmUgd2UgY2FuXG5cdFx0Ly8gcmVseSBvbiB0aGUgZ2xvYmFsIFVJIG1vZGVsIHRvIGV4aXN0XG5cdFx0Y29uc3Qgb0dsb2JhbE1vZGVsID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cblx0XHRpZiAoc0VkaXRNb2RlKSB7XG5cdFx0XHRvR2xvYmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiLCBzRWRpdE1vZGUgPT09IFwiRWRpdGFibGVcIiwgdW5kZWZpbmVkLCB0cnVlKTtcblx0XHR9XG5cblx0XHRpZiAoYkNyZWF0aW9uTW9kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBTaW5jZSBzZXRDcmVhdGlvbk1vZGUgaXMgcHVibGljIGluIEVkaXRGbG93IGFuZCBjYW4gYmUgb3ZlcnJpZGVuLCBtYWtlIHN1cmUgdG8gY2FsbCBpdCB2aWEgdGhlIGNvbnRyb2xsZXJcblx0XHRcdC8vIHRvIGVuc3VyZSBhbnkgb3ZlcnJpZGVzIGFyZSB0YWtlbiBpbnRvIGFjY291bnRcblx0XHRcdHRoaXMuc2V0Q3JlYXRpb25Nb2RlKGJDcmVhdGlvbk1vZGUpO1xuXHRcdH1cblx0fVxuXG5cdF9zZXRFZGl0YWJsZVBlbmRpbmcocGVuZGluZzogYm9vbGVhbikge1xuXHRcdGNvbnN0IGdsb2JhbE1vZGVsID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cdFx0Z2xvYmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVBlbmRpbmdcIiwgcGVuZGluZywgdW5kZWZpbmVkLCB0cnVlKTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRzZXREcmFmdFN0YXR1cyhzRHJhZnRTdGF0ZTogYW55KSB7XG5cdFx0Ly8gYXQgdGhpcyBwb2ludCBvZiB0aW1lIGl0J3Mgbm90IG1lYW50IHRvIHJlbGVhc2UgdGhlIGVkaXQgZmxvdyBmb3IgZnJlZXN0eWxlIHVzYWdlIHRoZXJlZm9yZSB3ZSBjYW5cblx0XHQvLyByZWx5IG9uIHRoZSBnbG9iYWwgVUkgbW9kZWwgdG8gZXhpc3Rcblx0XHQodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRNb2RlbChcInVpXCIpIGFzIEpTT05Nb2RlbCkuc2V0UHJvcGVydHkoXCIvZHJhZnRTdGF0dXNcIiwgc0RyYWZ0U3RhdGUsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0Um91dGluZ0xpc3RlbmVyKCkge1xuXHRcdC8vIGF0IHRoaXMgcG9pbnQgb2YgdGltZSBpdCdzIG5vdCBtZWFudCB0byByZWxlYXNlIHRoZSBlZGl0IGZsb3cgZm9yIEZQTSBjdXN0b20gcGFnZXMgYW5kIHRoZSByb3V0aW5nXG5cdFx0Ly8gbGlzdGVuZXIgaXMgbm90IHlldCBwdWJsaWMgdGhlcmVmb3JlIGtlZXAgdGhlIGxvZ2ljIGhlcmUgZm9yIG5vd1xuXG5cdFx0aWYgKHRoaXMuYmFzZS5fcm91dGluZykge1xuXHRcdFx0cmV0dXJuIHRoaXMuYmFzZS5fcm91dGluZztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRWRpdCBGbG93IHdvcmtzIG9ubHkgd2l0aCBhIGdpdmVuIHJvdXRpbmcgbGlzdGVuZXJcIik7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldEdsb2JhbFVJTW9kZWwoKTogSlNPTk1vZGVsIHtcblx0XHQvLyBhdCB0aGlzIHBvaW50IG9mIHRpbWUgaXQncyBub3QgbWVhbnQgdG8gcmVsZWFzZSB0aGUgZWRpdCBmbG93IGZvciBmcmVlc3R5bGUgdXNhZ2UgdGhlcmVmb3JlIHdlIGNhblxuXHRcdC8vIHJlbHkgb24gdGhlIGdsb2JhbCBVSSBtb2RlbCB0byBleGlzdFxuXHRcdHJldHVybiB0aGlzLmJhc2UuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikgYXMgSlNPTk1vZGVsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBlcmZvcm1zIGEgdGFzayBpbiBzeW5jIHdpdGggb3RoZXIgdGFza3MgY3JlYXRlZCB2aWEgdGhpcyBmdW5jdGlvbi5cblx0ICogUmV0dXJucyB0aGUgcHJvbWlzZSBjaGFpbiBvZiB0aGUgdGFzay5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I3N5bmNUYXNrXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBbdlRhc2tdIE9wdGlvbmFsLCBhIHByb21pc2Ugb3IgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgc3luY2hyb25vdXNseVxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIG9uY2UgdGhlIHRhc2sgaXMgY29tcGxldGVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRzeW5jVGFzayh2VGFzaz86IEZ1bmN0aW9uIHwgUHJvbWlzZTxhbnk+KSB7XG5cdFx0bGV0IGZuTmV3VGFzaztcblx0XHRpZiAodlRhc2sgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG5cdFx0XHRmbk5ld1Rhc2sgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiB2VGFzaztcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgdlRhc2sgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0Zm5OZXdUYXNrID0gdlRhc2s7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcFRhc2tzID0gdGhpcy5fcFRhc2tzIHx8IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdGlmIChmbk5ld1Rhc2spIHtcblx0XHRcdHRoaXMuX3BUYXNrcyA9IHRoaXMuX3BUYXNrcy50aGVuKGZuTmV3VGFzaykuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fcFRhc2tzO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQ/OiBhbnkpOiB0eXBlb2YgUHJvZ3JhbW1pbmdNb2RlbCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKS5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBkZWxldGVEb2N1bWVudFRyYW5zYWN0aW9uKG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSAodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkub1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0dHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLmdldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXG5cdFx0Ly8gVE9ETzogdGhpcyBzZXR0aW5nIGFuZCByZW1vdmluZyBvZiBjb250ZXh0cyBzaG91bGRuJ3QgYmUgaW4gdGhlIHRyYW5zYWN0aW9uIGhlbHBlciBhdCBhbGxcblx0XHQvLyBmb3IgdGhlIHRpbWUgYmVpbmcgSSBrZXB0IGl0IGFuZCBwcm92aWRlIHRoZSBpbnRlcm5hbCBtb2RlbCBjb250ZXh0IHRvIG5vdCBicmVhayBzb21ldGhpbmdcblx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCA9IG1QYXJhbWV0ZXJzLmNvbnRyb2xJZFxuXHRcdFx0PyBzYXAudWkuZ2V0Q29yZSgpLmJ5SWQobVBhcmFtZXRlcnMuY29udHJvbElkKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKVxuXHRcdFx0OiBudWxsO1xuXG5cdFx0YXdhaXQgdGhpcy5zeW5jVGFzaygpO1xuXHRcdGF3YWl0IHRyYW5zYWN0aW9uSGVscGVyLmRlbGV0ZURvY3VtZW50KG9Db250ZXh0LCBtUGFyYW1ldGVycywgdGhpcy5nZXRBcHBDb21wb25lbnQoKSwgb1Jlc291cmNlQnVuZGxlLCB0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkpO1xuXHRcdGNvbnN0IGludGVybmFsTW9kZWwgPSB0aGlzLmdldEludGVybmFsTW9kZWwoKTtcblx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3Nlc3Npb25PblwiLCBmYWxzZSk7XG5cdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9zdGlja3lTZXNzaW9uVG9rZW5cIiwgdW5kZWZpbmVkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHRoZSBjcmVhdGUgZXZlbnQ6IHNob3dzIG1lc3NhZ2VzIGFuZCBpbiBjYXNlIG9mIGEgZHJhZnQsIHVwZGF0ZXMgdGhlIGRyYWZ0IGluZGljYXRvci5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQmluZGluZyBPRGF0YSBsaXN0IGJpbmRpbmcgb2JqZWN0XG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0aGFuZGxlQ3JlYXRlRXZlbnRzKG9CaW5kaW5nOiBhbnkpIHtcblx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLkNsZWFyKTtcblxuXHRcdG9CaW5kaW5nID0gKG9CaW5kaW5nLmdldEJpbmRpbmcgJiYgb0JpbmRpbmcuZ2V0QmluZGluZygpKSB8fCBvQmluZGluZztcblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQmluZGluZyk7XG5cblx0XHRvQmluZGluZy5hdHRhY2hFdmVudChcImNyZWF0ZVNlbnRcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2aW5nKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRvQmluZGluZy5hdHRhY2hFdmVudChcImNyZWF0ZUNvbXBsZXRlZFwiLCAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IGJTdWNjZXNzID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInN1Y2Nlc3NcIik7XG5cdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQpIHtcblx0XHRcdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhiU3VjY2VzcyA/IERyYWZ0U3RhdHVzLlNhdmVkIDogRHJhZnRTdGF0dXMuQ2xlYXIpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLnNob3dNZXNzYWdlRGlhbG9nKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0VHJhbnNhY3Rpb25IZWxwZXIoKSB7XG5cdFx0cmV0dXJuIFRyYW5zYWN0aW9uSGVscGVyO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldEludGVybmFsTW9kZWwoKTogSlNPTk1vZGVsIHtcblx0XHRyZXR1cm4gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IHByb21pc2UgdG8gd2FpdCBmb3IgYW4gYWN0aW9uIHRvIGJlIGV4ZWN1dGVkXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfY3JlYXRlQWN0aW9uUHJvbWlzZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgcmVzb2x2ZXIgZnVuY3Rpb24gd2hpY2ggY2FuIGJlIHVzZWQgdG8gZXh0ZXJuYWxseSByZXNvbHZlIHRoZSBwcm9taXNlXG5cdCAqL1xuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRjcmVhdGVBY3Rpb25Qcm9taXNlKHNBY3Rpb25OYW1lOiBhbnksIHNDb250cm9sSWQ6IGFueSkge1xuXHRcdGxldCBmUmVzb2x2ZXIsIGZSZWplY3Rvcjtcblx0XHR0aGlzLm9BY3Rpb25Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0ZlJlc29sdmVyID0gcmVzb2x2ZTtcblx0XHRcdGZSZWplY3RvciA9IHJlamVjdDtcblx0XHR9KS50aGVuKChvUmVzcG9uc2U6IGFueSkgPT4ge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oeyBjb250cm9sSWQ6IHNDb250cm9sSWQgfSwgdGhpcy5nZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzKHNBY3Rpb25OYW1lLCBvUmVzcG9uc2UpKTtcblx0XHR9KTtcblx0XHRyZXR1cm4geyBmUmVzb2x2ZXI6IGZSZXNvbHZlciwgZlJlamVjdG9yOiBmUmVqZWN0b3IgfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBnZXRDdXJyZW50QWN0aW9uUHJvbWlzZSBvYmplY3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfZ2V0Q3VycmVudEFjdGlvblByb21pc2Vcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEByZXR1cm5zIFJldHVybnMgdGhlIHByb21pc2Vcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRDdXJyZW50QWN0aW9uUHJvbWlzZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5vQWN0aW9uUHJvbWlzZTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRkZWxldGVDdXJyZW50QWN0aW9uUHJvbWlzZSgpIHtcblx0XHR0aGlzLm9BY3Rpb25Qcm9taXNlID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbiB0aGF0IGlzIGV4ZWN1dGVkXG5cdCAqIEBwYXJhbSBvUmVzcG9uc2UgVGhlIGJvdW5kIGFjdGlvbidzIHJlc3BvbnNlIGRhdGEgb3IgcmVzcG9uc2UgY29udGV4dFxuXHQgKiBAcmV0dXJucyBPYmplY3Qgd2l0aCBkYXRhIGFuZCBuYW1lcyBvZiB0aGUga2V5IGZpZWxkcyBvZiB0aGUgcmVzcG9uc2Vcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzKHNBY3Rpb25OYW1lOiBzdHJpbmcsIG9SZXNwb25zZTogYW55KSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkob1Jlc3BvbnNlKSkge1xuXHRcdFx0aWYgKG9SZXNwb25zZS5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0b1Jlc3BvbnNlID0gb1Jlc3BvbnNlWzBdLnZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghb1Jlc3BvbnNlKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSAob1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBhbnkpLmdldERhdGEoKSxcblx0XHRcdHNBY3Rpb25SZXR1cm5UeXBlID1cblx0XHRcdFx0b01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsW3NBY3Rpb25OYW1lXSAmJiBvTWV0YU1vZGVsW3NBY3Rpb25OYW1lXVswXSAmJiBvTWV0YU1vZGVsW3NBY3Rpb25OYW1lXVswXS4kUmV0dXJuVHlwZVxuXHRcdFx0XHRcdD8gb01ldGFNb2RlbFtzQWN0aW9uTmFtZV1bMF0uJFJldHVyblR5cGUuJFR5cGVcblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRhS2V5ID0gc0FjdGlvblJldHVyblR5cGUgJiYgb01ldGFNb2RlbFtzQWN0aW9uUmV0dXJuVHlwZV0gPyBvTWV0YU1vZGVsW3NBY3Rpb25SZXR1cm5UeXBlXS4kS2V5IDogbnVsbDtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRvRGF0YTogb1Jlc3BvbnNlLmdldE9iamVjdCgpLFxuXHRcdFx0a2V5czogYUtleVxuXHRcdH07XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0TWVzc2FnZUhhbmRsZXIoKSB7XG5cdFx0Ly8gYXQgdGhpcyBwb2ludCBvZiB0aW1lIGl0J3Mgbm90IG1lYW50IHRvIHJlbGVhc2UgdGhlIGVkaXQgZmxvdyBmb3IgRlBNIGN1c3RvbSBwYWdlcyB0aGVyZWZvcmUga2VlcFxuXHRcdC8vIHRoZSBsb2dpYyBoZXJlIGZvciBub3dcblxuXHRcdGlmICh0aGlzLmJhc2UubWVzc2FnZUhhbmRsZXIpIHtcblx0XHRcdHJldHVybiB0aGlzLmJhc2UubWVzc2FnZUhhbmRsZXI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVkaXQgRmxvdyB3b3JrcyBvbmx5IHdpdGggYSBnaXZlbiBtZXNzYWdlIGhhbmRsZXJcIik7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGhhbmRsZVN0aWNreU9uKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKG9BcHBDb21wb25lbnQgPT09IHVuZGVmaW5lZCB8fCBvQ29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBBcHBDb21wb25lbnQgb3IgQ29udGV4dCBmb3IgZnVuY3Rpb24gaGFuZGxlU3RpY2t5T25cIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghb0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmhhc05hdmlnYXRpb25HdWFyZCgpKSB7XG5cdFx0XHRcdGNvbnN0IHNIYXNoVHJhY2tlciA9IG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5nZXRIYXNoKCksXG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWwgPSB0aGlzLmdldEludGVybmFsTW9kZWwoKTtcblxuXHRcdFx0XHQvLyBTZXQgYSBndWFyZCBpbiB0aGUgUm91dGVyUHJveHlcblx0XHRcdFx0Ly8gQSB0aW1lb3V0IGlzIG5lY2Vzc2FyeSwgYXMgd2l0aCBkZWZlcnJlZCBjcmVhdGlvbiB0aGUgaGFzaENoYW5nZXIgaXMgbm90IHVwZGF0ZWQgeWV0IHdpdGhcblx0XHRcdFx0Ly8gdGhlIG5ldyBoYXNoLCBhbmQgdGhlIGd1YXJkIGNhbm5vdCBiZSBmb3VuZCBpbiB0aGUgbWFuYWdlZCBoaXN0b3J5IG9mIHRoZSByb3V0ZXIgcHJveHlcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLnNldE5hdmlnYXRpb25HdWFyZChvQ29udGV4dC5nZXRQYXRoKCkuc3Vic3RyaW5nKDEpKTtcblx0XHRcdFx0fSwgMCk7XG5cblx0XHRcdFx0Ly8gU2V0dGluZyBiYWNrIG5hdmlnYXRpb24gb24gc2hlbGwgc2VydmljZSwgdG8gZ2V0IHRoZSBkaWNhcmQgbWVzc2FnZSBib3ggaW4gY2FzZSBvZiBzdGlja3lcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0QmFja05hdmlnYXRpb24odGhpcy5vbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uLmJpbmQodGhpcykpO1xuXG5cdFx0XHRcdHRoaXMuZm5EaXJ0eVN0YXRlUHJvdmlkZXIgPSB0aGlzLl9yZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlcihvQXBwQ29tcG9uZW50LCBvSW50ZXJuYWxNb2RlbCwgc0hhc2hUcmFja2VyKTtcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkucmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIodGhpcy5mbkRpcnR5U3RhdGVQcm92aWRlcik7XG5cblx0XHRcdFx0Ly8gaGFuZGxlIHNlc3Npb24gdGltZW91dFxuXHRcdFx0XHRjb25zdCBpMThuTW9kZWwgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcInNhcC5mZS5pMThuXCIpO1xuXHRcdFx0XHR0aGlzLmZuSGFuZGxlU2Vzc2lvblRpbWVvdXQgPSB0aGlzLl9hdHRhY2hTZXNzaW9uVGltZW91dChvQ29udGV4dCwgaTE4bk1vZGVsKTtcblx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCkgYXMgYW55KS5hdHRhY2hTZXNzaW9uVGltZW91dCh0aGlzLmZuSGFuZGxlU2Vzc2lvblRpbWVvdXQpO1xuXG5cdFx0XHRcdHRoaXMuZm5TdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uID0gdGhpcy5fYXR0YWNoUm91dGVNYXRjaGVkKHRoaXMsIG9Db250ZXh0LCBvQXBwQ29tcG9uZW50KTtcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRSb3V0aW5nU2VydmljZSgpLmF0dGFjaFJvdXRlTWF0Y2hlZCh0aGlzLmZuU3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbik7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdExvZy5pbmZvKGVycm9yIGFzIGFueSk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRoYW5kbGVTdGlja3lPZmYoKSB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0dHJ5IHtcblx0XHRcdGlmIChvQXBwQ29tcG9uZW50ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidW5kZWZpbmVkIEFwcENvbXBvbmVudCBmb3IgZnVuY3Rpb24gaGFuZGxlU3RpY2t5T2ZmXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0FwcENvbXBvbmVudCAmJiBvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KSB7XG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgZXhpdGVkIGZyb20gdGhlIGFwcCwgQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50IGRvZXNuJ3QgcmV0dXJuIGFcblx0XHRcdFx0Ly8gc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50LCBoZW5jZSB0aGUgJ2lmJyBhYm92ZVxuXHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuZGlzY2FyZE5hdmlnYXRpb25HdWFyZCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5mbkRpcnR5U3RhdGVQcm92aWRlcikge1xuXHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5kZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKHRoaXMuZm5EaXJ0eVN0YXRlUHJvdmlkZXIpO1xuXHRcdFx0XHR0aGlzLmZuRGlydHlTdGF0ZVByb3ZpZGVyID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoKSAmJiB0aGlzLmZuSGFuZGxlU2Vzc2lvblRpbWVvdXQpIHtcblx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCkgYXMgYW55KS5kZXRhY2hTZXNzaW9uVGltZW91dCh0aGlzLmZuSGFuZGxlU2Vzc2lvblRpbWVvdXQpO1xuXHRcdFx0fVxuXG5cdFx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRpbmdTZXJ2aWNlKCkuZGV0YWNoUm91dGVNYXRjaGVkKHRoaXMuZm5TdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uKTtcblx0XHRcdHRoaXMuZm5TdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uID0gdW5kZWZpbmVkO1xuXG5cdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkRpc3BsYXksIGZhbHNlKTtcblxuXHRcdFx0aWYgKG9BcHBDb21wb25lbnQpIHtcblx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBleGl0ZWQgZnJvbSB0aGUgYXBwLCBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQgZG9lc24ndCByZXR1cm4gYVxuXHRcdFx0XHQvLyBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQsIGhlbmNlIHRoZSAnaWYnIGFib3ZlXG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdExvZy5pbmZvKGVycm9yIGFzIGFueSk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAZGVzY3JpcHRpb24gTWV0aG9kIHRvIGRpc3BsYXkgYSAnZGlzY2FyZCcgcG9wb3ZlciB3aGVuIGV4aXRpbmcgYSBzdGlja3kgc2Vzc2lvbi5cblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIG9uQmFja05hdmlnYXRpb25JblNlc3Npb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsRWRpdEZsb3dcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRvbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uKCkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdG9Sb3V0ZXJQcm94eSA9IG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKTtcblxuXHRcdGlmIChvUm91dGVyUHJveHkuY2hlY2tJZkJhY2tJc091dE9mR3VhcmQoKSkge1xuXHRcdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gb1ZpZXcgJiYgb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKTtcblxuXHRcdFx0c3RpY2t5LnByb2Nlc3NEYXRhTG9zc0NvbmZpcm1hdGlvbihcblx0XHRcdFx0YXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMuZGlzY2FyZFN0aWNreVNlc3Npb24ob0JpbmRpbmdDb250ZXh0KTtcblx0XHRcdFx0XHRoaXN0b3J5LmJhY2soKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0b1ZpZXcsXG5cdFx0XHRcdHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQmluZGluZ0NvbnRleHQpXG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGhpc3RvcnkuYmFjaygpO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGRpc2NhcmRTdGlja3lTZXNzaW9uKG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBkaXNjYXJkZWRDb250ZXh0ID0gYXdhaXQgc3RpY2t5LmRpc2NhcmREb2N1bWVudChvQ29udGV4dCk7XG5cdFx0aWYgKGRpc2NhcmRlZENvbnRleHQ/Lmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdGRpc2NhcmRlZENvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdH1cblx0XHRkaXNjYXJkZWRDb250ZXh0Py5yZWZyZXNoKCk7XG5cdFx0dGhpcy5oYW5kbGVTdGlja3lPZmYoKTtcblx0fVxuXG5cdF9oYXNOZXdBY3Rpb25Gb3JTdGlja3kob0NvbnRleHQ6IGFueSwgb1ZpZXc6IFZpZXcsIHNDdXN0b21BY3Rpb246IHN0cmluZykge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAob0NvbnRleHQgPT09IHVuZGVmaW5lZCB8fCBvVmlldyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5wdXQgcGFyYW1ldGVycyBmb3IgZnVuY3Rpb24gX2hhc05ld0FjdGlvbkZvclN0aWNreVwiKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRcdHNNZXRhUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKS5zdWJzdHJpbmcoMCwgb0NvbnRleHQuZ2V0UGF0aCgpLmluZGV4T2YoXCIoXCIpKSxcblx0XHRcdFx0b1N0aWNreVNlc3Npb24gPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZGApO1xuXG5cdFx0XHRpZiAob1N0aWNreVNlc3Npb24gJiYgb1N0aWNreVNlc3Npb24uTmV3QWN0aW9uICYmIG9TdGlja3lTZXNzaW9uLk5ld0FjdGlvbiA9PT0gc0N1c3RvbUFjdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAob1N0aWNreVNlc3Npb24gJiYgb1N0aWNreVNlc3Npb24uQWRkaXRpb25hbE5ld0FjdGlvbnMpIHtcblx0XHRcdFx0cmV0dXJuIHNDdXN0b21BY3Rpb24gPT09XG5cdFx0XHRcdFx0b1N0aWNreVNlc3Npb24uQWRkaXRpb25hbE5ld0FjdGlvbnMuZmluZChmdW5jdGlvbiAoc0FkZGl0aW9uYWxBY3Rpb246IHN0cmluZykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNBZGRpdGlvbmFsQWN0aW9uID09PSBzQ3VzdG9tQWN0aW9uO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0PyB0cnVlXG5cdFx0XHRcdFx0OiBmYWxzZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0TG9nLmluZm8oZXJyb3IgYXMgYW55KTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0X3JlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgb0ludGVybmFsTW9kZWw6IEpTT05Nb2RlbCwgc0hhc2hUcmFja2VyOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZm5EaXJ0eVN0YXRlUHJvdmlkZXIob05hdmlnYXRpb25Db250ZXh0OiBhbnkpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChvTmF2aWdhdGlvbkNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5wdXQgcGFyYW1ldGVycyBmb3IgZnVuY3Rpb24gZm5EaXJ0eVN0YXRlUHJvdmlkZXJcIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBzVGFyZ2V0SGFzaCA9IG9OYXZpZ2F0aW9uQ29udGV4dC5pbm5lckFwcFJvdXRlLFxuXHRcdFx0XHRcdG9Sb3V0ZXJQcm94eSA9IG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKTtcblx0XHRcdFx0bGV0IHNMY2xIYXNoVHJhY2tlciA9IFwiXCI7XG5cdFx0XHRcdGxldCBiRGlydHk6IGJvb2xlYW47XG5cdFx0XHRcdGNvbnN0IGJTZXNzaW9uT04gPSBvSW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShcIi9zZXNzaW9uT25cIik7XG5cblx0XHRcdFx0aWYgKCFiU2Vzc2lvbk9OKSB7XG5cdFx0XHRcdFx0Ly8gSWYgdGhlIHN0aWNreSBzZXNzaW9uIHdhcyB0ZXJtaW5hdGVkIGJlZm9yZSBoYW5kLlxuXHRcdFx0XHRcdC8vIEVleGFtcGxlIGluIGNhc2Ugb2YgbmF2aWdhdGluZyBhd2F5IGZyb20gYXBwbGljYXRpb24gdXNpbmcgSUJOLlxuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIW9Sb3V0ZXJQcm94eS5pc05hdmlnYXRpb25GaW5hbGl6ZWQoKSkge1xuXHRcdFx0XHRcdC8vIElmIG5hdmlnYXRpb24gaXMgY3VycmVudGx5IGhhcHBlbmluZyBpbiBSb3V0ZXJQcm94eSwgaXQncyBhIHRyYW5zaWVudCBzdGF0ZVxuXHRcdFx0XHRcdC8vIChub3QgZGlydHkpXG5cdFx0XHRcdFx0YkRpcnR5ID0gZmFsc2U7XG5cdFx0XHRcdFx0c0xjbEhhc2hUcmFja2VyID0gc1RhcmdldEhhc2g7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc0hhc2hUcmFja2VyID09PSBzVGFyZ2V0SGFzaCkge1xuXHRcdFx0XHRcdC8vIHRoZSBoYXNoIGRpZG4ndCBjaGFuZ2Ugc28gZWl0aGVyIHRoZSB1c2VyIGF0dGVtcHRzIHRvIHJlZnJlc2ggb3IgdG8gbGVhdmUgdGhlIGFwcFxuXHRcdFx0XHRcdGJEaXJ0eSA9IHRydWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAob1JvdXRlclByb3h5LmNoZWNrSGFzaFdpdGhHdWFyZChzVGFyZ2V0SGFzaCkgfHwgb1JvdXRlclByb3h5LmlzR3VhcmRDcm9zc0FsbG93ZWRCeVVzZXIoKSkge1xuXHRcdFx0XHRcdC8vIHRoZSB1c2VyIGF0dGVtcHRzIHRvIG5hdmlnYXRlIHdpdGhpbiB0aGUgcm9vdCBvYmplY3Rcblx0XHRcdFx0XHQvLyBvciBjcm9zc2luZyB0aGUgZ3VhcmQgaGFzIGFscmVhZHkgYmVlbiBhbGxvd2VkIGJ5IHRoZSBSb3V0ZXJQcm94eVxuXHRcdFx0XHRcdHNMY2xIYXNoVHJhY2tlciA9IHNUYXJnZXRIYXNoO1xuXHRcdFx0XHRcdGJEaXJ0eSA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHRoZSB1c2VyIGF0dGVtcHRzIHRvIG5hdmlnYXRlIHdpdGhpbiB0aGUgYXBwLCBmb3IgZXhhbXBsZSBiYWNrIHRvIHRoZSBsaXN0IHJlcG9ydFxuXHRcdFx0XHRcdGJEaXJ0eSA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYkRpcnR5KSB7XG5cdFx0XHRcdFx0Ly8gdGhlIEZMUCBkb2Vzbid0IGNhbGwgdGhlIGRpcnR5IHN0YXRlIHByb3ZpZGVyIGFueW1vcmUgb25jZSBpdCdzIGRpcnR5LCBhcyB0aGV5IGNhbid0XG5cdFx0XHRcdFx0Ly8gY2hhbmdlIHRoaXMgZHVlIHRvIGNvbXBhdGliaWxpdHkgcmVhc29ucyB3ZSBzZXQgaXQgYmFjayB0byBub3QtZGlydHlcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldERpcnR5RmxhZyhmYWxzZSk7XG5cdFx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c0hhc2hUcmFja2VyID0gc0xjbEhhc2hUcmFja2VyO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGJEaXJ0eTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdExvZy5pbmZvKGVycm9yIGFzIGFueSk7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdF9hdHRhY2hTZXNzaW9uVGltZW91dChvQ29udGV4dDogYW55LCBpMThuTW9kZWw6IE1vZGVsKSB7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChvQ29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ29udGV4dCBtaXNzaW5nIGZvciBmdW5jdGlvbiBmbkhhbmRsZVNlc3Npb25UaW1lb3V0XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHJlbW92ZSB0cmFuc2llbnQgbWVzc2FnZXMgc2luY2Ugd2Ugd2lsbCBzaG93aW5nIG91ciBvd24gbWVzc2FnZVxuXHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cblx0XHRcdFx0Y29uc3Qgb0RpYWxvZyA9IG5ldyBEaWFsb2coe1xuXHRcdFx0XHRcdHRpdGxlOiBcIntzYXAuZmUuaTE4bj5DX0VESVRGTE9XX09CSkVDVF9QQUdFX1NFU1NJT05fRVhQSVJFRF9ESUFMT0dfVElUTEV9XCIsXG5cdFx0XHRcdFx0c3RhdGU6IFwiV2FybmluZ1wiLFxuXHRcdFx0XHRcdGNvbnRlbnQ6IG5ldyBUZXh0KHsgdGV4dDogXCJ7c2FwLmZlLmkxOG4+Q19FRElURkxPV19PQkpFQ1RfUEFHRV9TRVNTSU9OX0VYUElSRURfRElBTE9HX01FU1NBR0V9XCIgfSksXG5cdFx0XHRcdFx0YmVnaW5CdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHRcdFx0dGV4dDogXCJ7c2FwLmZlLmkxOG4+Q19DT01NT05fRElBTE9HX09LfVwiLFxuXHRcdFx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdFx0XHRwcmVzczogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHQvLyByZW1vdmUgc3RpY2t5IGhhbmRsaW5nIGFmdGVyIG5hdmlnYXRpb24gc2luY2Ugc2Vzc2lvbiBoYXMgYWxyZWFkeSBiZWVuIHRlcm1pbmF0ZWRcblx0XHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVTdGlja3lPZmYoKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5nZXRSb3V0aW5nTGlzdGVuZXIoKS5uYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dChvQ29udGV4dCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0b0RpYWxvZy5hZGRTdHlsZUNsYXNzKFwic2FwVWlDb250ZW50UGFkZGluZ1wiKTtcblx0XHRcdFx0b0RpYWxvZy5zZXRNb2RlbChpMThuTW9kZWwsIFwic2FwLmZlLmkxOG5cIik7XG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpLmFkZERlcGVuZGVudChvRGlhbG9nKTtcblx0XHRcdFx0b0RpYWxvZy5vcGVuKCk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRMb2cuaW5mbyhlcnJvciBhcyBhbnkpO1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0fVxuXG5cdF9hdHRhY2hSb3V0ZU1hdGNoZWQob0ZuQ29udGV4dDogYW55LCBvQ29udGV4dDogYW55LCBvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZm5TdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uKCkge1xuXHRcdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gb0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmdldEhhc2goKTtcblx0XHRcdC8vIGVpdGhlciBjdXJyZW50IGhhc2ggaXMgZW1wdHkgc28gdGhlIHVzZXIgbGVmdCB0aGUgYXBwIG9yIGhlIG5hdmlnYXRlZCBhd2F5IGZyb20gdGhlIG9iamVjdFxuXHRcdFx0aWYgKCFzQ3VycmVudEhhc2ggfHwgIW9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5jaGVja0hhc2hXaXRoR3VhcmQoc0N1cnJlbnRIYXNoKSkge1xuXHRcdFx0XHRvRm5Db250ZXh0LmRpc2NhcmRTdGlja3lTZXNzaW9uKG9Db250ZXh0KTtcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0Ly9jbGVhciB0aGUgc2Vzc2lvbiBjb250ZXh0IHRvIGVuc3VyZSB0aGUgTFIgcmVmcmVzaGVzIHRoZSBsaXN0IHdpdGhvdXQgYSBzZXNzaW9uXG5cdFx0XHRcdFx0b0NvbnRleHQuZ2V0TW9kZWwoKS5jbGVhclNlc3Npb25Db250ZXh0KCk7XG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblx0X3Njcm9sbEFuZEZvY3VzT25JbmFjdGl2ZVJvdyh0YWJsZTogVGFibGUpIHtcblx0XHRjb25zdCByb3dCaW5kaW5nID0gdGFibGUuZ2V0Um93QmluZGluZygpIGFzIE9EYXRhTGlzdEJpbmRpbmc7XG5cdFx0Y29uc3QgYWN0aXZlUm93SW5kZXg6IG51bWJlciA9IHJvd0JpbmRpbmcuZ2V0Q291bnQoKSB8fCAwO1xuXHRcdGlmICh0YWJsZS5kYXRhKFwidGFibGVUeXBlXCIpICE9PSBcIlJlc3BvbnNpdmVUYWJsZVwiKSB7XG5cdFx0XHRpZiAoYWN0aXZlUm93SW5kZXggPiAwKSB7XG5cdFx0XHRcdHRhYmxlLnNjcm9sbFRvSW5kZXgoYWN0aXZlUm93SW5kZXggLSAxKTtcblx0XHRcdH1cblx0XHRcdHRhYmxlLmZvY3VzUm93KGFjdGl2ZVJvd0luZGV4LCB0cnVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0LyogSW4gYSByZXNwb25zaXZlIHRhYmxlLCB0aGUgZW1wdHkgcm93cyBhcHBlYXIgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgdGFibGUuIEJ1dCB3aGVuIHdlIGNyZWF0ZSBtb3JlLCB0aGV5IGFwcGVhciBiZWxvdyB0aGUgbmV3IGxpbmUuXG5cdFx0XHQgKiBTbyB3ZSBjaGVjayB0aGUgZmlyc3QgaW5hY3RpdmUgcm93IGZpcnN0LCB0aGVuIHdlIHNldCB0aGUgZm9jdXMgb24gaXQgd2hlbiB3ZSBwcmVzcyB0aGUgYnV0dG9uLlxuXHRcdFx0ICogVGhpcyBkb2Vzbid0IGltcGFjdCB0aGUgR3JpZFRhYmxlIGJlY2F1c2UgdGhleSBhcHBlYXIgYXQgdGhlIGVuZCwgYW5kIHdlIGFscmVhZHkgZm9jdXMgdGhlIGJlZm9yZS10aGUtbGFzdCByb3cgKGJlY2F1c2UgMiBlbXB0eSByb3dzIGV4aXN0KVxuXHRcdFx0ICovXG5cdFx0XHRjb25zdCBhbGxSb3dDb250ZXh0cyA9IHJvd0JpbmRpbmcuZ2V0Q29udGV4dHMoKTtcblx0XHRcdGlmICghYWxsUm93Q29udGV4dHM/Lmxlbmd0aCkge1xuXHRcdFx0XHR0YWJsZS5mb2N1c1JvdyhhY3RpdmVSb3dJbmRleCwgdHJ1ZSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGxldCBmb2N1c1JvdyA9IGFjdGl2ZVJvd0luZGV4LFxuXHRcdFx0XHRpbmRleCA9IDA7XG5cdFx0XHRmb3IgKGNvbnN0IHNpbmdsZUNvbnRleHQgb2YgYWxsUm93Q29udGV4dHMpIHtcblx0XHRcdFx0aWYgKHNpbmdsZUNvbnRleHQuaXNJbmFjdGl2ZSgpICYmIGluZGV4IDwgZm9jdXNSb3cpIHtcblx0XHRcdFx0XHRmb2N1c1JvdyA9IGluZGV4O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGluZGV4Kys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZm9jdXNSb3cgPiAwKSB7XG5cdFx0XHRcdHRhYmxlLnNjcm9sbFRvSW5kZXgoZm9jdXNSb3cpO1xuXHRcdFx0fVxuXHRcdFx0dGFibGUuZm9jdXNSb3coZm9jdXNSb3csIHRydWUpO1xuXHRcdH1cblx0fVxuXHRhc3luYyBjcmVhdGVFbXB0eVJvd3NBbmRGb2N1cyh0YWJsZTogVGFibGUpIHtcblx0XHRjb25zdCB0YWJsZUFQSSA9IHRhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJO1xuXHRcdGlmIChcblx0XHRcdHRhYmxlQVBJPy50YWJsZURlZmluaXRpb24/LmNvbnRyb2w/LmlubGluZUNyZWF0aW9uUm93c0hpZGRlbkluRWRpdE1vZGUgJiZcblx0XHRcdCF0YWJsZS5nZXRCaW5kaW5nQ29udGV4dChcInVpXCIpPy5nZXRQcm9wZXJ0eShcImNyZWF0ZU1vZGVcIilcblx0XHQpIHtcblx0XHRcdC8vIFdpdGggdGhlIHBhcmFtZXRlciwgd2UgZG9uJ3QgaGF2ZSBlbXB0eSByb3dzIGluIEVkaXQgbW9kZSwgc28gd2UgbmVlZCB0byBjcmVhdGUgdGhlbSBiZWZvcmUgc2V0dGluZyB0aGUgZm9jdXMgb24gdGhlbVxuXHRcdFx0YXdhaXQgdGFibGVBUEkuc2V0VXBFbXB0eVJvd3ModGFibGUsIHRydWUpO1xuXHRcdH1cblx0XHR0aGlzLl9zY3JvbGxBbmRGb2N1c09uSW5hY3RpdmVSb3codGFibGUpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEludGVybmFsRWRpdEZsb3c7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUF5QkEsTUFBTUEsZ0JBQWdCLEdBQUdDLFNBQVMsQ0FBQ0QsZ0JBQWdCO0lBQ2xERSxXQUFXLEdBQUdELFNBQVMsQ0FBQ0MsV0FBVztJQUNuQ0MsUUFBUSxHQUFHRixTQUFTLENBQUNFLFFBQVE7SUFDN0JDLFlBQVksR0FBR0gsU0FBUyxDQUFDRyxZQUFZO0VBQUMsSUFHakNDLGdCQUFnQixXQURyQkMsY0FBYyxDQUFDLG1EQUFtRCxDQUFDLFVBZ0VsRUMsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUFxR2hCRCxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQTJFaEJELGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBMENoQkQsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsV0FzQmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQU9oQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0FZaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBb0JoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0FxQmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQUto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