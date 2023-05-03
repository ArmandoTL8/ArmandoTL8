/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/Feedback", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/fe/core/library", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/odata/v4/ODataListBinding", "../ActionRuntime"], function (Log, CommonUtils, BusyLocker, ActivitySync, CollaborationCommon, draft, Feedback, MetaModelConverter, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, FELibrary, Core, coreLibrary, Message, ControllerExtension, OverrideExecution, ODataListBinding, ActionRuntime) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var TriggerType = Feedback.TriggerType;
  var triggerConfiguredSurvey = Feedback.triggerConfiguredSurvey;
  var StandardActions = Feedback.StandardActions;
  var shareObject = CollaborationCommon.shareObject;
  var Activity = CollaborationCommon.Activity;
  var send = ActivitySync.send;
  var isConnected = ActivitySync.isConnected;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  const CreationMode = FELibrary.CreationMode,
    ProgrammingModel = FELibrary.ProgrammingModel,
    Constants = FELibrary.Constants,
    DraftStatus = FELibrary.DraftStatus,
    EditMode = FELibrary.EditMode,
    StartupMode = FELibrary.StartupMode,
    MessageType = coreLibrary.MessageType;

  /**
   * A controller extension offering hooks into the edit flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.90.0
   */
  let EditFlow = (_dec = defineUI5Class("sap.fe.core.controllerextensions.EditFlow"), _dec2 = publicExtension(), _dec3 = finalExtension(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = finalExtension(), _dec8 = publicExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = extensible(OverrideExecution.After), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec16 = publicExtension(), _dec17 = extensible(OverrideExecution.After), _dec18 = publicExtension(), _dec19 = extensible(OverrideExecution.After), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = finalExtension(), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = finalExtension(), _dec30 = publicExtension(), _dec31 = finalExtension(), _dec32 = publicExtension(), _dec33 = finalExtension(), _dec34 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(EditFlow, _ControllerExtension);
    function EditFlow() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = EditFlow.prototype;
    //////////////////////////////////////
    // Public methods
    //////////////////////////////////////
    _proto.getAppComponent = function getAppComponent() {
      return this.base.getAppComponent();
    }
    /**
     * Gets the InternalEditFlow extension.
     *
     * @returns The internalEditFlow controller extension
     */;
    _proto.getInternalEditFlow = function getInternalEditFlow() {
      return this.base.getView().getController()._editFlow;
    }

    /**
     * Creates a draft document for an existing active document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext Context of the active document
     * @returns Promise resolves once the editable document is available
     * @alias sap.fe.core.controllerextensions.EditFlow#editDocument
     * @public
     * @since 1.90.0
     */;
    _proto.editDocument = async function editDocument(oContext) {
      const bDraftNavigation = true;
      const transactionHelper = this._getTransactionHelper();
      const oRootViewController = this._getRootViewController();
      const model = oContext.getModel();
      let rightmostContext, siblingInfo;
      const oViewData = this.getView().getViewData();
      const sProgrammingModel = this._getProgrammingModel(oContext);
      let oRootContext = oContext;
      const oView = this.getView();
      try {
        if ((oViewData === null || oViewData === void 0 ? void 0 : oViewData.viewLevel) > 1) {
          if (sProgrammingModel === ProgrammingModel.Draft) {
            const draftRootPath = ModelHelper.getDraftRootPath(oContext);
            oRootContext = oView.getModel().bindContext(draftRootPath).getBoundContext();
            await oRootContext.requestObject(draftRootPath);
          } else if (sProgrammingModel === ProgrammingModel.Sticky) {
            const sStickyRootPath = ModelHelper.getStickyRootPath(oContext);
            oRootContext = oView.getModel().bindContext(sStickyRootPath).getBoundContext();
            await oRootContext.requestObject(sStickyRootPath);
          }
        }
        await this.base.editFlow.onBeforeEdit({
          context: oRootContext
        });
        const oNewDocumentContext = await transactionHelper.editDocument(oRootContext, this.getView(), this.getAppComponent(), this._getMessageHandler());
        this._setStickySessionInternalProperties(sProgrammingModel, model);
        if (oNewDocumentContext) {
          this._setEditMode(EditMode.Editable, false);
          this._setDocumentModified(false);
          this._getMessageHandler().showMessageDialog();
          if (oNewDocumentContext !== oRootContext) {
            let contextToNavigate = oNewDocumentContext;
            if (this._isFclEnabled()) {
              rightmostContext = oRootViewController.getRightmostContext();
              siblingInfo = await this._computeSiblingInformation(oRootContext, rightmostContext, sProgrammingModel, true);
              siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, oNewDocumentContext);
              this._updatePathsInHistory(siblingInfo.pathMapping);
              if (siblingInfo.targetContext.getPath() != oNewDocumentContext.getPath()) {
                contextToNavigate = siblingInfo.targetContext;
              }
            } else if ((oViewData === null || oViewData === void 0 ? void 0 : oViewData.viewLevel) > 1) {
              siblingInfo = await this._computeSiblingInformation(oRootContext, oContext, sProgrammingModel, true);
              contextToNavigate = this._getNavigationTargetForEdit(oContext, oNewDocumentContext, siblingInfo);
            }
            await this._handleNewContext(contextToNavigate, true, false, bDraftNavigation, true);
            if (sProgrammingModel === ProgrammingModel.Sticky) {
              // The stickyOn handler must be set after the navigation has been done,
              // as the URL may change in the case of FCL
              let stickyContext;
              if (this._isFclEnabled()) {
                // We need to use the kept-alive context used to bind the page
                stickyContext = oNewDocumentContext.getModel().getKeepAliveContext(oNewDocumentContext.getPath());
              } else {
                stickyContext = oNewDocumentContext;
              }
              this._handleStickyOn(stickyContext);
            } else if (ModelHelper.isCollaborationDraftSupported(model.getMetaModel())) {
              // according to UX in case of enabled collaboration draft we share the object immediately
              await shareObject(oNewDocumentContext);
            }
          }
        }
      } catch (oError) {
        Log.error("Error while editing the document", oError);
      }
    };
    _proto.deleteMultipleDocuments = function deleteMultipleDocuments(aContexts, mParameters) {
      if (mParameters) {
        mParameters.beforeDeleteCallBack = this.base.editFlow.onBeforeDelete;
      } else {
        mParameters = {
          beforeDeleteCallBack: this.base.editFlow.onBeforeDelete
        };
      }
      return this.getInternalEditFlow().deleteMultipleDocuments(aContexts, mParameters);
    }

    /**
     * Updates the draft status and displays the error messages if there are errors during an update.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param updatedContext Context of the updated field
     * @param updatePromise Promise to determine when the update operation is completed. The promise should be resolved when the update operation is completed, so the draft status can be updated.
     * @returns Promise resolves once draft status has been updated
     * @alias sap.fe.core.controllerextensions.EditFlow#updateDocument
     * @public
     * @since 1.90.0
     */;
    _proto.updateDocument = function updateDocument(updatedContext, updatePromise) {
      const originalBindingContext = this.getView().getBindingContext();
      const isDraft = this._getProgrammingModel(updatedContext) === ProgrammingModel.Draft;
      this._getMessageHandler().removeTransitionMessages();
      return this._syncTask(async () => {
        if (originalBindingContext) {
          this._setDocumentModified(true);
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          if (isDraft) {
            this._setDraftStatus(DraftStatus.Saving);
          }
        }
        try {
          await updatePromise;
          const currentBindingContext = this.getView().getBindingContext();
          if (!isDraft || !currentBindingContext || currentBindingContext !== originalBindingContext) {
            // If a navigation happened while oPromise was being resolved, the binding context of the page changed
            return;
          }

          // We're still on the same context
          const metaModel = currentBindingContext.getModel().getMetaModel();
          const entitySetName = metaModel.getMetaContext(currentBindingContext.getPath()).getObject("@sapui.name");
          const semanticKeys = SemanticKeyHelper.getSemanticKeys(metaModel, entitySetName);
          if (semanticKeys !== null && semanticKeys !== void 0 && semanticKeys.length) {
            const currentSemanticMapping = this._getSemanticMapping();
            const currentSemanticPath = currentSemanticMapping === null || currentSemanticMapping === void 0 ? void 0 : currentSemanticMapping.semanticPath,
              sChangedPath = SemanticKeyHelper.getSemanticPath(currentBindingContext, true);
            // currentSemanticPath could be null if we have navigated via deep link then there are no semanticMappings to calculate it from
            if (currentSemanticPath && currentSemanticPath !== sChangedPath) {
              await this._handleNewContext(currentBindingContext, true, false, true);
            }
          }
          this._setDraftStatus(DraftStatus.Saved);
        } catch (error) {
          Log.error("Error while updating the document", error);
          if (isDraft && originalBindingContext) {
            this._setDraftStatus(DraftStatus.Clear);
          }
        } finally {
          await this._getMessageHandler().showMessages();
        }
      });
    }

    // Internal only params ---
    // * @param {string} mParameters.creationMode The creation mode using one of the following:
    // *                    Sync - the creation is triggered and once the document is created, the navigation is done
    // *                    Async - the creation and the navigation to the instance are done in parallel
    // *                    Deferred - the creation is done on the target page
    // *                    CreationRow - The creation is done inline async so the user is not blocked
    // mParameters.creationRow Instance of the creation row - (TODO: get rid but use list bindings only)

    /**
     * Creates a new document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param vListBinding  ODataListBinding object or the binding path for a temporary list binding
     * @param mInParameters Contains the following attributes:
     * @param mInParameters.creationMode The creation mode using one of the following:
     *                    NewPage - the created document is shown in a new page, depending on whether metadata 'Sync', 'Async' or 'Deferred' is used
     *                    Inline - The creation is done inline (in a table)
     *                    External - The creation is done in a different application specified via the parameter 'outbound'
     * @param mInParameters.outbound The navigation target where the document is created in case of creationMode 'External'
     * @param mInParameters.createAtEnd Specifies if the new entry should be created at the top or bottom of a table in case of creationMode 'Inline'
     * @returns Promise resolves once the object has been created
     * @alias sap.fe.core.controllerextensions.EditFlow#createDocument
     * @public
     * @since 1.90.0
     */;
    _proto.createDocument = async function createDocument(vListBinding, mInParameters) {
      const transactionHelper = this._getTransactionHelper(),
        oLockObject = this._getGlobalUIModel();
      let oTable; //should be Table but there are missing methods into the def
      let mParameters = mInParameters;
      const bShouldBusyLock = !mParameters || mParameters.creationMode !== CreationMode.Inline && mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.External;
      let oExecCustomValidation = Promise.resolve([]);
      const oAppComponent = CommonUtils.getAppComponent(this.getView());
      oAppComponent.getRouterProxy().removeIAppStateKey();
      if (mParameters.creationMode === CreationMode.External) {
        // Create by navigating to an external target
        // TODO: Call appropriate function (currently using the same as for outbound chevron nav, and without any context - 3rd param)
        await this._syncTask();
        const oController = this.getView().getController();
        const sCreatePath = ModelHelper.getAbsoluteMetaPathForListBinding(this.getView(), vListBinding);
        oController.handlers.onChevronPressNavigateOutBound(oController, mParameters.outbound, undefined, sCreatePath);
        return;
      }
      if (mParameters.creationMode === CreationMode.CreationRow && mParameters.creationRow) {
        const oCreationRowObjects = mParameters.creationRow.getBindingContext().getObject();
        delete oCreationRowObjects["@$ui5.context.isTransient"];
        oTable = mParameters.creationRow.getParent();
        oExecCustomValidation = transactionHelper.validateDocument(oTable.getBindingContext(), {
          data: oCreationRowObjects,
          customValidationFunction: oTable.getCreationRow().data("customValidationFunction")
        }, this.base.getView());

        // disableAddRowButtonForEmptyData is set to false in manifest converter (Table.ts) if customValidationFunction exists
        if (oTable.getCreationRow().data("disableAddRowButtonForEmptyData") === "true") {
          const oInternalModelContext = oTable.getBindingContext("internal");
          oInternalModelContext.setProperty("creationRowFieldValidity", {});
        }
      }
      if (mParameters.creationMode === CreationMode.Inline && mParameters.tableId) {
        oTable = this.getView().byId(mParameters.tableId);
      }
      if (oTable && oTable.isA("sap.ui.mdc.Table")) {
        const fnFocusOrScroll = mParameters.creationMode === CreationMode.Inline ? oTable.focusRow.bind(oTable) : oTable.scrollToIndex.bind(oTable);
        oTable.getRowBinding().attachEventOnce("change", function () {
          fnFocusOrScroll(mParameters.createAtEnd ? oTable.getRowBinding().getLength() : 0, true);
        });
      }
      const handleSideEffects = async (oListBinding, oCreationPromise) => {
        try {
          const oNewContext = await oCreationPromise;
          // transient contexts are reliably removed once oNewContext.created() is resolved
          await oNewContext.created();
          const oBindingContext = this.getView().getBindingContext();
          // if there are transient contexts, we must avoid requesting side effects
          // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
          // if list binding is refreshed, transient contexts might be lost
          if (!CommonUtils.hasTransientContext(oListBinding)) {
            const appComponent = CommonUtils.getAppComponent(this.getView());
            appComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext);
          }
        } catch (oError) {
          Log.error("Error while creating the document", oError);
        }
      };

      /**
       * @param aValidationMessages Error messages from custom validation function
       */
      const createCustomValidationMessages = aValidationMessages => {
        var _oTable$getBindingCon;
        const sCustomValidationFunction = oTable && oTable.getCreationRow().data("customValidationFunction");
        const mCustomValidity = oTable && ((_oTable$getBindingCon = oTable.getBindingContext("internal")) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getProperty("creationRowCustomValidity"));
        const oMessageManager = Core.getMessageManager();
        const aCustomMessages = [];
        let oFieldControl;
        let sTarget;

        // Remove existing CustomValidation message
        oMessageManager.getMessageModel().getData().forEach(function (oMessage) {
          if (oMessage.code === sCustomValidationFunction) {
            oMessageManager.removeMessages(oMessage);
          }
        });
        aValidationMessages.forEach(oValidationMessage => {
          // Handle Bound CustomValidation message
          if (oValidationMessage.messageTarget) {
            var _oFieldControl$getBin;
            oFieldControl = Core.getControl(mCustomValidity[oValidationMessage.messageTarget].fieldId);
            sTarget = `${(_oFieldControl$getBin = oFieldControl.getBindingContext()) === null || _oFieldControl$getBin === void 0 ? void 0 : _oFieldControl$getBin.getPath()}/${oFieldControl.getBindingPath("value")}`;
            // Add validation message if still not exists
            if (oMessageManager.getMessageModel().getData().filter(function (oMessage) {
              return oMessage.target === sTarget;
            }).length === 0) {
              oMessageManager.addMessages(new Message({
                message: oValidationMessage.messageText,
                processor: this.getView().getModel(),
                type: MessageType.Error,
                code: sCustomValidationFunction,
                technical: false,
                persistent: false,
                target: sTarget
              }));
            }
            // Add controlId in order to get the focus handling of the error popover runable
            const aExistingValidationMessages = oMessageManager.getMessageModel().getData().filter(function (oMessage) {
              return oMessage.target === sTarget;
            });
            aExistingValidationMessages[0].addControlId(mCustomValidity[oValidationMessage.messageTarget].fieldId);

            // Handle Unbound CustomValidation message
          } else {
            aCustomMessages.push({
              code: sCustomValidationFunction,
              text: oValidationMessage.messageText,
              persistent: true,
              type: MessageType.Error
            });
          }
        });
        if (aCustomMessages.length > 0) {
          this._getMessageHandler().showMessageDialog({
            customMessages: aCustomMessages
          });
        }
      };
      const resolveCreationMode = (initialCreationMode, programmingModel, oListBinding, oMetaModel) => {
        if (initialCreationMode && initialCreationMode !== CreationMode.NewPage) {
          // use the passed creation mode
          return initialCreationMode;
        } else {
          // NewAction is not yet supported for NavigationProperty collection
          if (!oListBinding.isRelative()) {
            const sPath = oListBinding.getPath(),
              // if NewAction with parameters is present, then creation is 'Deferred'
              // in the absence of NewAction or NewAction with parameters, creation is async
              sNewAction = programmingModel === ProgrammingModel.Draft ? oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction`) : oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction`);
            if (sNewAction) {
              const aParameters = oMetaModel.getObject(`/${sNewAction}/@$ui5.overload/0/$Parameter`) || [];
              // binding parameter (eg: _it) is not considered
              if (aParameters.length > 1) {
                return CreationMode.Deferred;
              }
            }
          }
          const sMetaPath = oMetaModel.getMetaPath(oListBinding === null || oListBinding === void 0 ? void 0 : oListBinding.getHeaderContext().getPath());
          const aNonComputedVisibleKeyFields = CommonUtils.getNonComputedVisibleFields(oMetaModel, sMetaPath, this.getView());
          if (aNonComputedVisibleKeyFields.length > 0) {
            return CreationMode.Deferred;
          }
          return CreationMode.Async;
        }
      };
      if (bShouldBusyLock) {
        BusyLocker.lock(oLockObject);
      }
      try {
        const aValidationMessages = await this._syncTask(oExecCustomValidation);
        if (aValidationMessages.length > 0) {
          createCustomValidationMessages(aValidationMessages);
          Log.error("Custom Validation failed");
          // if custom validation fails, we leave the method immediately
          return;
        }
        let oListBinding;
        mParameters = mParameters || {};
        if (vListBinding && typeof vListBinding === "object") {
          // we already get a list binding use this one
          oListBinding = vListBinding;
        } else if (typeof vListBinding === "string") {
          oListBinding = new ODataListBinding(this.getView().getModel(), vListBinding);
          mParameters.creationMode = CreationMode.Sync;
          delete mParameters.createAtEnd;
        } else {
          throw new Error("Binding object or path expected");
        }
        const oModel = oListBinding.getModel();
        const sProgrammingModel = this._getProgrammingModel(oListBinding);
        const resolvedCreationMode = resolveCreationMode(mParameters.creationMode, sProgrammingModel, oListBinding, oModel.getMetaModel());
        let oCreation;
        let mArgs;
        const oCreationRow = mParameters.creationRow;
        let oCreationRowContext;
        let oPayload;
        let sMetaPath;
        const oMetaModel = oModel.getMetaModel();
        const oRoutingListener = this._getRoutingListener();
        if (resolvedCreationMode !== CreationMode.Deferred) {
          if (resolvedCreationMode === CreationMode.CreationRow) {
            oCreationRowContext = oCreationRow.getBindingContext();
            sMetaPath = oMetaModel.getMetaPath(oCreationRowContext.getPath());
            // prefill data from creation row
            oPayload = oCreationRowContext.getObject();
            mParameters.data = {};
            Object.keys(oPayload).forEach(function (sPropertyPath) {
              const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
              // ensure navigation properties are not part of the payload, deep create not supported
              if (oProperty && oProperty.$kind === "NavigationProperty") {
                return;
              }
              mParameters.data[sPropertyPath] = oPayload[sPropertyPath];
            });
            await this._checkForValidationErrors( /*oCreationRowContext*/);
          }
          if (resolvedCreationMode === CreationMode.CreationRow || resolvedCreationMode === CreationMode.Inline) {
            var _oTable, _oTable$getParent, _oTable$getParent$get;
            mParameters.keepTransientContextOnFailed = false; // currently not fully supported
            // busy handling shall be done locally only
            mParameters.busyMode = "Local";
            mParameters.busyId = (_oTable = oTable) === null || _oTable === void 0 ? void 0 : (_oTable$getParent = _oTable.getParent()) === null || _oTable$getParent === void 0 ? void 0 : (_oTable$getParent$get = _oTable$getParent.getTableDefinition()) === null || _oTable$getParent$get === void 0 ? void 0 : _oTable$getParent$get.annotation.id;

            // take care on message handling, draft indicator (in case of draft)
            // Attach the create sent and create completed event to the object page binding so that we can react
            this._handleCreateEvents(oListBinding);
          }
          if (!mParameters.parentControl) {
            mParameters.parentControl = this.getView();
          }
          mParameters.beforeCreateCallBack = this.base.editFlow.onBeforeCreate;

          // In case the application was called with preferredMode=autoCreateWith, we want to skip the
          // action parameter dialog
          mParameters.skipParameterDialog = oAppComponent.getStartupMode() === StartupMode.AutoCreate;
          oCreation = transactionHelper.createDocument(oListBinding, mParameters, this.getAppComponent(), this._getMessageHandler(), false, this.getView());
        }
        let oNavigation;
        switch (resolvedCreationMode) {
          case CreationMode.Deferred:
            oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
              bDeferredContext: true,
              editable: true,
              bForceFocus: true
            });
            break;
          case CreationMode.Async:
            oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
              asyncContext: oCreation,
              editable: true,
              bForceFocus: true
            });
            break;
          case CreationMode.Sync:
            mArgs = {
              editable: true,
              bForceFocus: true
            };
            if (sProgrammingModel == ProgrammingModel.Sticky || mParameters.createAction) {
              mArgs.transient = true;
            }
            oNavigation = oCreation.then(function (oNewDocumentContext) {
              if (!oNewDocumentContext) {
                const coreResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
                return oRoutingListener.navigateToMessagePage(coreResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"), {
                  title: coreResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
                  description: coreResourceBundle.getText("C_EDITFLOW_SAPFE_CREATION_FAILED_DESCRIPTION")
                });
              } else {
                // In case the Sync creation was triggered for a deferred creation, we don't navigate forward
                // as we're already on the corresponding ObjectPage
                return mParameters.bFromDeferred ? oRoutingListener.navigateToContext(oNewDocumentContext, mArgs) : oRoutingListener.navigateForwardToContext(oNewDocumentContext, mArgs);
              }
            });
            break;
          case CreationMode.Inline:
            handleSideEffects(oListBinding, oCreation);
            this._syncTask(oCreation);
            break;
          case CreationMode.CreationRow:
            // the creation row shall be cleared once the validation check was successful and
            // therefore the POST can be sent async to the backend
            try {
              const oCreationRowListBinding = oCreationRowContext.getBinding();
              if (!mParameters.bSkipSideEffects) {
                handleSideEffects(oListBinding, oCreation);
              }
              const oNewTransientContext = oCreationRowListBinding.create();
              oCreationRow.setBindingContext(oNewTransientContext);

              // this is needed to avoid console errors TO be checked with model colleagues
              oNewTransientContext.created().catch(function () {
                Log.trace("transient fast creation context deleted");
              });
              oNavigation = oCreationRowContext.delete("$direct");
            } catch (oError) {
              // Reset busy indicator after a validation error
              if (BusyLocker.isLocked(this.getView().getModel("ui"))) {
                BusyLocker.unlock(this.getView().getModel("ui"));
              }
              Log.error("CreationRow navigation error: ", oError);
            }
            break;
          default:
            oNavigation = Promise.reject(`Unhandled creationMode ${resolvedCreationMode}`);
            break;
        }
        if (oCreation) {
          try {
            const aParams = await Promise.all([oCreation, oNavigation]);
            this._setStickySessionInternalProperties(sProgrammingModel, oModel);
            this._setEditMode(EditMode.Editable); // The createMode flag will be set in InternalEditFlow#computeEditMode
            if (!oListBinding.isRelative() && sProgrammingModel === ProgrammingModel.Sticky) {
              var _entitySet$annotation, _entitySet$annotation2;
              // Workaround to tell the OP that we've created a new object from the LR
              const metaModel = oListBinding.getModel().getMetaModel();
              const metaContext = metaModel.bindContext(metaModel.getMetaPath(oListBinding.getPath()));
              const entitySet = getInvolvedDataModelObjects(metaContext).startingEntitySet;
              const newAction = entitySet === null || entitySet === void 0 ? void 0 : (_entitySet$annotation = entitySet.annotations.Session) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.StickySessionSupported) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.NewAction;
              this._getInternalModel().setProperty("/lastInvokedAction", newAction);
            }
            const oNewDocumentContext = aParams[0];
            if (oNewDocumentContext) {
              this._setDocumentModifiedOnCreate(oListBinding);
              if (!this._isFclEnabled()) {
                EditState.setEditStateDirty();
              }
              this._sendActivity(Activity.Create, oNewDocumentContext);
              if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel())) {
                // according to UX in case of enabled collaboration draft we share the object immediately
                await shareObject(oNewDocumentContext);
              }
            }
          } catch (error) {
            // TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
            if (error === Constants.CancelActionDialog || error === Constants.ActionExecutionFailed || error === Constants.CreationFailed) {
              // creation has been cancelled by user or failed in backend => in case we have navigated to transient context before, navigate back
              // the switch-statement above seems to indicate that this happens in creationModes deferred and async. But in fact, in these cases after the navigation from routeMatched in OP component
              // createDeferredContext is triggerd, which calls this method (createDocument) again - this time with creationMode sync. Therefore, also in that mode we need to trigger back navigation.
              // The other cases might still be needed in case the navigation fails.
              if (resolvedCreationMode === CreationMode.Sync || resolvedCreationMode === CreationMode.Deferred || resolvedCreationMode === CreationMode.Async) {
                oRoutingListener.navigateBackFromTransientState();
              }
            }
            throw error;
          }
        }
      } finally {
        if (bShouldBusyLock) {
          BusyLocker.unlock(oLockObject);
        }
      }
    }

    /**
     * This function can be used to intercept the 'Save' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Save' action.
     * If you reject the promise, the 'Save' action is stopped and the user stays in edit mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeSave
     * @param _mParameters.context Page context that is going to be saved.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Save' action is triggered. If rejected, the 'Save' action is not triggered and the user stays in edit mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeSave
     * @public
     * @since 1.90.0
     */;
    _proto.onBeforeSave = function onBeforeSave(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }
    /**
     * This function can be used to intercept the 'Create' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Create' action.
     * If you reject the promise, the 'Create' action is stopped.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeCreate
     * @param _mParameters.contextPath Path pointing to the context on which Create action is triggered
     * @param _mParameters.createParameters Array of values that are filled in the Action Parameter Dialog
     * @returns A promise to be returned by the overridden method. If resolved, the 'Create' action is triggered. If rejected, the 'Create' action is not triggered.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeCreate
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeCreate = function onBeforeCreate(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }
    /**
     * This function can be used to intercept the 'Edit' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Edit' action.
     * If you reject the promise, the 'Edit' action is stopped and the user stays in display mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeEdit
     * @param _mParameters.context Page context that is going to be edited.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Edit' action is triggered. If rejected, the 'Edit' action is not triggered and the user stays in display mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeEdit
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeEdit = function onBeforeEdit(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }
    /**
     * This function can be used to intercept the 'Discard' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Discard' action.
     * If you reject the promise, the 'Discard' action is stopped and the user stays in edit mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeDiscard
     * @param _mParameters.context Page context that is going to be discarded.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Discard' action is triggered. If rejected, the 'Discard' action is not triggered and the user stays in edit mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDiscard
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeDiscard = function onBeforeDiscard(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }
    /**
     * This function can be used to intercept the 'Delete' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Delete' action.
     * If you reject the promise, the 'Delete' action is stopped.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeDelete
     * @param _mParameters.contexts An array of contexts that are going to be deleted
     * @returns A promise to be returned by the overridden method. If resolved, the 'Delete' action is triggered. If rejected, the 'Delete' action is not triggered.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDelete
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeDelete = function onBeforeDelete(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    // Internal only params ---
    // @param {boolean} mParameters.bExecuteSideEffectsOnError Indicates whether SideEffects need to be ignored when user clicks on Save during an Inline creation
    // @param {object} mParameters.bindings List bindings of the tables in the view.
    // Both of the above parameters are for the same purpose. User can enter some information in the creation row(s) but does not 'Add row', instead clicks Save.
    // There can be more than one in the view.

    /**
     * Saves a new document after checking it.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the editable document
     * @param mParameters PRIVATE
     * @returns Promise resolves once save is complete
     * @alias sap.fe.core.controllerextensions.EditFlow#saveDocument
     * @public
     * @since 1.90.0
     */;
    _proto.saveDocument = async function saveDocument(oContext, mParameters) {
      mParameters = mParameters || {};
      const bExecuteSideEffectsOnError = mParameters.bExecuteSideEffectsOnError || undefined;
      const bDraftNavigation = true;
      const transactionHelper = this._getTransactionHelper();
      const oResourceBundle = this._getResourceBundle();
      const aBindings = mParameters.bindings;
      try {
        await this._syncTask();
        await this._submitOpenChanges(oContext);
        await this._checkForValidationErrors();
        await this.base.editFlow.onBeforeSave({
          context: oContext
        });
        const sProgrammingModel = this._getProgrammingModel(oContext);
        const oRootViewController = this._getRootViewController();
        let siblingInfo;
        if ((sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) && oRootViewController.isFclEnabled()) {
          // No need to try to get rightmost context in case of a new object
          siblingInfo = await this._computeSiblingInformation(oContext, oRootViewController.getRightmostContext(), sProgrammingModel, true);
        }
        const activeDocumentContext = await transactionHelper.saveDocument(oContext, this.getAppComponent(), oResourceBundle, bExecuteSideEffectsOnError, aBindings, this._getMessageHandler(), this._getCreationMode());
        this._removeStickySessionInternalProperties(sProgrammingModel);
        this._sendActivity(Activity.Activate, activeDocumentContext);
        this._triggerConfiguredSurvey(StandardActions.save, TriggerType.standardAction);
        this._setDocumentModified(false);
        this._setEditMode(EditMode.Display, false);
        this._getMessageHandler().showMessageDialog();
        if (activeDocumentContext !== oContext) {
          let contextToNavigate = activeDocumentContext;
          if (oRootViewController.isFclEnabled()) {
            siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, activeDocumentContext);
            this._updatePathsInHistory(siblingInfo.pathMapping);
            if (siblingInfo.targetContext.getPath() !== activeDocumentContext.getPath()) {
              contextToNavigate = siblingInfo.targetContext;
            }
          }
          await this._handleNewContext(contextToNavigate, false, false, bDraftNavigation, true);
        }
      } catch (oError) {
        if (!(oError && oError.canceled)) {
          Log.error("Error while saving the document", oError);
        }
        throw oError;
      }
    };
    _proto.toggleDraftActive = async function toggleDraftActive(oContext) {
      const oContextData = oContext.getObject();
      let bEditable;
      const bIsDraft = oContext && this._getProgrammingModel(oContext) === ProgrammingModel.Draft;

      //toggle between draft and active document is only available for edit drafts and active documents with draft)
      if (!bIsDraft || !(!oContextData.IsActiveEntity && oContextData.HasActiveEntity || oContextData.IsActiveEntity && oContextData.HasDraftEntity)) {
        return;
      }
      if (!oContextData.IsActiveEntity && oContextData.HasActiveEntity) {
        //start Point: edit draft
        bEditable = false;
      } else {
        // start point active document
        bEditable = true;
      }
      try {
        const oRootViewController = this._getRootViewController();
        const oRightmostContext = oRootViewController.isFclEnabled() ? oRootViewController.getRightmostContext() : oContext;
        const siblingInfo = await this._computeSiblingInformation(oContext, oRightmostContext, ProgrammingModel.Draft, false);
        if (siblingInfo) {
          this._setEditMode(bEditable ? EditMode.Editable : EditMode.Display, false); //switch to edit mode only if a draft is available

          if (oRootViewController.isFclEnabled()) {
            const lastSemanticMapping = this._getSemanticMapping();
            if ((lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.technicalPath) === oContext.getPath()) {
              const targetPath = siblingInfo.pathMapping[siblingInfo.pathMapping.length - 1].newPath;
              siblingInfo.pathMapping.push({
                oldPath: lastSemanticMapping.semanticPath,
                newPath: targetPath
              });
            }
            this._updatePathsInHistory(siblingInfo.pathMapping);
          }
          await this._handleNewContext(siblingInfo.targetContext, bEditable, true, true, true);
        } else {
          return Promise.reject("Error in EditFlow.toggleDraftActive - Cannot find sibling");
        }
      } catch (oError) {
        return Promise.reject(`Error in EditFlow.toggleDraftActive:${oError}`);
      }
    }

    // Internal only params ---
    // @param {sap.m.Button} mParameters.cancelButton - Currently this is passed as cancelButton internally (replaced by mParameters.control in the JSDoc below). Currently it is also mandatory.
    // Plan - This should not be mandatory. If not provided, we should have a default that can act as reference control for the discard popover OR we can show a dialog instead of a popover.

    /**
     * Discard the editable document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the editable document
     * @param mParameters Can contain the following attributes:
     * @param mParameters.control This is the control used to open the discard popover
     * @param mParameters.skipDiscardPopover Optional, supresses the discard popover and allows custom handling
     * @returns Promise resolves once editable document has been discarded
     * @alias sap.fe.core.controllerextensions.EditFlow#cancelDocument
     * @public
     * @since 1.90.0
     */;
    _proto.cancelDocument = async function cancelDocument(oContext, mParameters) {
      const transactionHelper = this._getTransactionHelper();
      const oResourceBundle = this._getResourceBundle();
      const mInParameters = mParameters;
      let siblingInfo;
      mInParameters.cancelButton = mParameters.control || mInParameters.cancelButton;
      mInParameters.beforeCancelCallBack = this.base.editFlow.onBeforeDiscard;
      try {
        await this._syncTask();
        const sProgrammingModel = this._getProgrammingModel(oContext);
        if ((sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) && this._isFclEnabled()) {
          const oRootViewController = this._getRootViewController();

          // No need to try to get rightmost context in case of a new object
          siblingInfo = await this._computeSiblingInformation(oContext, oRootViewController.getRightmostContext(), sProgrammingModel, true);
        }
        const cancelResult = await transactionHelper.cancelDocument(oContext, mInParameters, this.getAppComponent(), oResourceBundle, this._getMessageHandler(), this._getCreationMode(), this._isDocumentModified());
        const bDraftNavigation = true;
        this._removeStickySessionInternalProperties(sProgrammingModel);
        this._setEditMode(EditMode.Display, false);
        this._setDocumentModified(false);
        this._setDraftStatus(DraftStatus.Clear);
        // we force the edit state even for FCL because the draft discard might not be implemented
        // and we may just delete the draft
        EditState.setEditStateDirty();
        if (!cancelResult) {
          this._sendActivity(Activity.Discard, undefined);
          //in case of a new document, no activeContext is returned --> navigate back.
          if (!mInParameters.skipBackNavigation) {
            await this._getRoutingListener().navigateBackFromContext(oContext);
          }
        } else {
          const oActiveDocumentContext = cancelResult;
          this._sendActivity(Activity.Discard, oActiveDocumentContext);
          let contextToNavigate = oActiveDocumentContext;
          if (this._isFclEnabled()) {
            siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, oActiveDocumentContext);
            this._updatePathsInHistory(siblingInfo.pathMapping);
            if (siblingInfo.targetContext.getPath() !== oActiveDocumentContext.getPath()) {
              contextToNavigate = siblingInfo.targetContext;
            }
          }
          if (sProgrammingModel === ProgrammingModel.Draft) {
            // We need to load the semantic keys of the active context, as we need them
            // for the navigation
            await this._fetchSemanticKeyValues(oActiveDocumentContext);
            // We force the recreation of the context, so that it's created and bound in the same microtask,
            // so that all properties are loaded together by autoExpandSelect, so that when switching back to Edit mode
            // $$inheritExpandSelect takes all loaded properties into account (BCP 2070462265)
            if (!mInParameters.skipBindingToView) {
              await this._handleNewContext(contextToNavigate, false, true, bDraftNavigation, true);
            } else {
              return oActiveDocumentContext;
            }
          } else {
            //active context is returned in case of cancel of existing document
            await this._handleNewContext(contextToNavigate, false, false, bDraftNavigation, true);
          }
        }
      } catch (oError) {
        Log.error("Error while discarding the document", oError);
      }
    }

    /**
     * Checks if a context corresponds to a draft root.
     *
     * @param context The context to check
     * @returns True if the context points to a draft root
     * @private
     */;
    _proto.isDraftRoot = function isDraftRoot(context) {
      const metaModel = context.getModel().getMetaModel();
      const metaContext = metaModel.getMetaContext(context.getPath());
      return ModelHelper.isDraftRoot(getInvolvedDataModelObjects(metaContext).targetEntitySet);
    }

    // Internal only params ---
    // @param {string} mParameters.entitySetName Name of the EntitySet to which the object belongs

    /**
     * Deletes the document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the document
     * @param mInParameters Can contain the following attributes:
     * @param mInParameters.title Title of the object being deleted
     * @param mInParameters.description Description of the object being deleted
     * @returns Promise resolves once document has been deleted
     * @alias sap.fe.core.controllerextensions.EditFlow#deleteDocument
     * @public
     * @since 1.90.0
     */;
    _proto.deleteDocument = async function deleteDocument(oContext, mInParameters) {
      const oAppComponent = CommonUtils.getAppComponent(this.getView());
      let mParameters = mInParameters;
      if (!mParameters) {
        mParameters = {
          bFindActiveContexts: false
        };
      } else {
        mParameters.bFindActiveContexts = false;
      }
      mParameters.beforeDeleteCallBack = this.base.editFlow.onBeforeDelete;
      try {
        if (this._isFclEnabled() && this.isDraftRoot(oContext) && oContext.getIndex() === undefined && oContext.getProperty("IsActiveEntity") === true && oContext.getProperty("HasDraftEntity") === true) {
          // Deleting an active entity which has a draft that could potentially be displayed in the ListReport (FCL case)
          // --> need to remove the draft from the LR and replace it with the active version, so that the ListBinding is properly refreshed
          // The condition 'oContext.getIndex() === undefined' makes sure the active version isn't already displayed in the LR
          mParameters.beforeDeleteCallBack = async parameters => {
            await this.base.editFlow.onBeforeDelete(parameters);
            try {
              const model = oContext.getModel();
              const siblingContext = model.bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
              const draftPath = await siblingContext.requestCanonicalPath();
              const draftContextToRemove = model.getKeepAliveContext(draftPath);
              draftContextToRemove.replaceWith(oContext);
            } catch (error) {
              Log.error("Error while replacing the draft instance in the LR ODLB", error);
            }
          };
        }
        await this._deleteDocumentTransaction(oContext, mParameters);

        // Single objet deletion is triggered from an OP header button (not from a list)
        // --> Mark UI dirty and navigate back to dismiss the OP
        if (!this._isFclEnabled()) {
          EditState.setEditStateDirty();
        }
        this._sendActivity(Activity.Delete, oContext);

        // After delete is successfull, we need to detach the setBackNavigation Methods
        if (oAppComponent) {
          oAppComponent.getShellServices().setBackNavigation();
        }
        if ((oAppComponent === null || oAppComponent === void 0 ? void 0 : oAppComponent.getStartupMode()) === StartupMode.Deeplink && !this._isFclEnabled()) {
          // In case the app has been launched with semantic keys, deleting the object we've landed on shall navigate back
          // to the app we came from (except for FCL, where we navigate to LR as usual)
          oAppComponent.getRouterProxy().exitFromApp();
        } else {
          this._getRoutingListener().navigateBackFromContext(oContext);
        }
      } catch (error) {
        Log.error("Error while deleting the document", error);
      }
    }

    /**
     * Submit the current set of changes and navigate back.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the document
     * @returns Promise resolves once the changes have been saved
     * @alias sap.fe.core.controllerextensions.EditFlow#applyDocument
     * @public
     * @since 1.90.0
     */;
    _proto.applyDocument = async function applyDocument(oContext) {
      const oLockObject = this._getGlobalUIModel();
      BusyLocker.lock(oLockObject);
      try {
        await this._syncTask();
        await this._submitOpenChanges(oContext);
        await this._checkForValidationErrors();
        await this._getMessageHandler().showMessageDialog();
        await this._getRoutingListener().navigateBackFromContext(oContext);
      } finally {
        if (BusyLocker.isLocked(oLockObject)) {
          BusyLocker.unlock(oLockObject);
        }
      }
    }

    // Internal only params ---
    // @param {boolean} [mParameters.bStaticAction] Boolean value for static action, undefined for other actions
    // @param {boolean} [mParameters.isNavigable] Boolean value indicating whether navigation is required after the action has been executed
    // Currently the parameter isNavigable is used internally and should be changed to requiresNavigation as it is a more apt name for this param

    /**
     * Invokes an action (bound or unbound) and tracks the changes so that other pages can be refreshed and show the updated data upon navigation.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param sActionName The name of the action to be called
     * @param mInParameters Contains the following attributes:
     * @param mInParameters.parameterValues A map of action parameter names and provided values
     * @param mInParameters.parameterValues.name Name of the parameter
     * @param mInParameters.parameterValues.value Value of the parameter
     * @param mInParameters.skipParameterDialog Skips the action parameter dialog if values are provided for all of them in parameterValues
     * @param mInParameters.contexts For a bound action, a context or an array with contexts for which the action is to be called must be provided
     * @param mInParameters.model For an unbound action, an instance of an OData V4 model must be provided
     * @param mInParameters.requiresNavigation Boolean value indicating whether navigation is required after the action has been executed. Navigation takes place to the context returned by the action
     * @param mInParameters.label A human-readable label for the action. This is needed in case the action has a parameter and a parameter dialog is shown to the user. The label will be used for the title of the dialog and for the confirmation button
     * @param mInParameters.invocationGrouping Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
     * @param mExtraParams PRIVATE
     * @returns A promise which resolves once the action has been executed, providing the response
     * @alias sap.fe.core.controllerextensions.EditFlow#invokeAction
     * @public
     * @since 1.90.0
     * @final
     */;
    _proto.invokeAction = async function invokeAction(sActionName, mInParameters, mExtraParams) {
      var _model$getMetaModel;
      let oControl;
      const transactionHelper = this._getTransactionHelper();
      let aParts;
      let sOverloadEntityType;
      let oCurrentActionCallBacks;
      const oView = this.getView();
      let mParameters = mInParameters || {};
      // Due to a mistake the invokeAction in the extensionAPI had a different API than this one.
      // The one from the extensionAPI doesn't exist anymore as we expose the full edit flow now but
      // due to compatibility reasons we still need to support the old signature
      if (mParameters.isA && mParameters.isA("sap.ui.model.odata.v4.Context") || Array.isArray(mParameters) || mExtraParams !== undefined) {
        const contexts = mParameters;
        mParameters = mExtraParams || {};
        if (contexts) {
          mParameters.contexts = contexts;
        } else {
          mParameters.model = this.getView().getModel();
        }
      }
      mParameters.isNavigable = mParameters.requiresNavigation || mParameters.isNavigable;

      // Determine if the action is bound or unbound
      const model = this.getView().getModel();
      const actionMetaData = model === null || model === void 0 ? void 0 : (_model$getMetaModel = model.getMetaModel()) === null || _model$getMetaModel === void 0 ? void 0 : _model$getMetaModel.getObject("/" + sActionName.split("(")[0]);
      if (actionMetaData) {
        if (!Array.isArray(actionMetaData)) {
          mParameters.isBound = actionMetaData.$IsBound ? actionMetaData.$IsBound : false;
        } else if (actionMetaData[0].$kind === "Action" && actionMetaData[0].$IsBound === true) {
          mParameters.isBound = true;
        }
      } else {
        throw new Error("Error in EditFlow.invokeAction: The specified action could not be found");
      }
      if (!mParameters.parentControl) {
        mParameters.parentControl = this.getView();
      }
      if (mParameters.controlId) {
        oControl = this.getView().byId(mParameters.controlId);
        if (oControl) {
          // TODO: currently this selected contexts update is done within the operation, should be moved out
          mParameters.internalModelContext = oControl.getBindingContext("internal");
        }
      } else {
        mParameters.internalModelContext = oView.getBindingContext("internal");
      }
      if (sActionName && sActionName.indexOf("(") > -1) {
        // get entity type of action overload and remove it from the action path
        // Example sActionName = "<ActionName>(Collection(<OverloadEntityType>))"
        // sActionName = aParts[0] --> <ActionName>
        // sOverloadEntityType = aParts[2] --> <OverloadEntityType>
        aParts = sActionName.split("(");
        sActionName = aParts[0];
        sOverloadEntityType = aParts[aParts.length - 1].replaceAll(")", "");
      }
      if (mParameters.bStaticAction) {
        if (oControl.isTableBound()) {
          mParameters.contexts = oControl.getRowBinding().getHeaderContext();
        } else {
          const sBindingPath = oControl.data("rowsBindingInfo").path,
            oListBinding = new ODataListBinding(this.getView().getModel(), sBindingPath);
          mParameters.contexts = oListBinding.getHeaderContext();
        }
        if (sOverloadEntityType && oControl.getBindingContext()) {
          mParameters.contexts = this._getActionOverloadContextFromMetadataPath(oControl.getBindingContext(), oControl.getRowBinding(), sOverloadEntityType);
        }
        if (mParameters.enableAutoScroll) {
          oCurrentActionCallBacks = this._createActionPromise(sActionName, oControl.sId);
        }
      }
      mParameters.bGetBoundContext = this._getBoundContext(oView, mParameters);
      // Need to know that the action is called from ObjectPage for changeSet Isolated workaround
      mParameters.bObjectPage = oView.getViewData().converterType === "ObjectPage";
      try {
        await this._syncTask();
        const oResponse = await transactionHelper.callAction(sActionName, mParameters, this.getView(), this.getAppComponent(), this._getMessageHandler());
        if (mParameters.contexts && mParameters.isBound === true) {
          await this._refreshListIfRequired(this._getActionResponseDataAndKeys(sActionName, oResponse), mParameters.contexts[0]);
        }
        this._sendActivity(Activity.Action, mParameters.contexts, sActionName);
        this._triggerConfiguredSurvey(sActionName, TriggerType.action);
        if (oCurrentActionCallBacks) {
          oCurrentActionCallBacks.fResolver(oResponse);
        }
        /*
        		We set the (upper) pages to dirty after an execution of an action
        		TODO: get rid of this workaround
        		This workaround is only needed as long as the model does not support the synchronization.
        		Once this is supported we don't need to set the pages to dirty anymore as the context itself
        		is already refreshed (it's just not reflected in the object page)
        		we explicitly don't call this method from the list report but only call it from the object page
        		as if it is called in the list report it's not needed - as we anyway will remove this logic
        		we can live with this
        		we need a context to set the upper pages to dirty - if there are more than one we use the
        		first one as they are anyway siblings
        		*/
        if (mParameters.contexts) {
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          this._getInternalModel().setProperty("/lastInvokedAction", sActionName);
        }
        if (mParameters.isNavigable) {
          let vContext = oResponse;
          if (Array.isArray(vContext) && vContext.length === 1) {
            vContext = vContext[0].value;
          }
          if (vContext && !Array.isArray(vContext)) {
            const oMetaModel = oView.getModel().getMetaModel();
            const sContextMetaPath = oMetaModel.getMetaPath(vContext.getPath());
            const _fnValidContexts = (contexts, applicableContexts) => {
              return contexts.filter(element => {
                if (applicableContexts) {
                  return applicableContexts.indexOf(element) > -1;
                }
                return true;
              });
            };
            const oActionContext = Array.isArray(mParameters.contexts) ? _fnValidContexts(mParameters.contexts, mParameters.applicableContext)[0] : mParameters.contexts;
            const sActionContextMetaPath = oActionContext && oMetaModel.getMetaPath(oActionContext.getPath());
            if (sContextMetaPath != undefined && sContextMetaPath === sActionContextMetaPath) {
              if (oActionContext.getPath() !== vContext.getPath()) {
                this._getRoutingListener().navigateForwardToContext(vContext, {
                  checkNoHashChange: true,
                  noHistoryEntry: false
                });
              } else {
                Log.info("Navigation to the same context is not allowed");
              }
            }
          }
        }
        return oResponse;
      } catch (err) {
        if (oCurrentActionCallBacks) {
          oCurrentActionCallBacks.fRejector();
        }
        // FIXME: in most situations there is no handler for the rejected promises returnedq
        if (err === Constants.CancelActionDialog) {
          // This leads to console error. Actually the error is already handled (currently directly in press handler of end button in dialog), so it should not be forwarded
          // up to here. However, when dialog handling and backend execution are separated, information whether dialog was cancelled, or backend execution has failed needs
          // to be transported to the place responsible for connecting these two things.
          // TODO: remove special handling one dialog handling and backend execution are separated
          throw new Error("Dialog cancelled");
        } else if (!(err && (err.canceled || err.rejectedItems && err.rejectedItems[0].canceled))) {
          // TODO: analyze, whether this is of the same category as above
          throw new Error(`Error in EditFlow.invokeAction:${err}`);
        }
        // TODO: Any unexpected errors probably should not be ignored!
      }
    }

    /**
     * Secured execution of the given function. Ensures that the function is only executed when certain conditions are fulfilled.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param fnFunction The function to be executed. Should return a promise that is settled after completion of the execution. If nothing is returned, immediate completion is assumed.
     * @param mParameters Definitions of the preconditions to be checked before execution
     * @param mParameters.busy Defines the busy indicator
     * @param mParameters.busy.set Triggers a busy indicator when the function is executed.
     * @param mParameters.busy.check Executes function only if application isn't busy.
     * @param mParameters.updatesDocument This operation updates the current document without using the bound model and context. As a result, the draft status is updated if a draft document exists, and the user has to confirm the cancellation of the editing process.
     * @returns A promise that is rejected if the execution is prohibited and resolved by the promise returned by the fnFunction.
     * @alias sap.fe.core.controllerextensions.EditFlow#securedExecution
     * @public
     * @experimental As of version 1.90.0
     * @since 1.90.0
     */;
    _proto.securedExecution = function securedExecution(fnFunction, mParameters) {
      const bBusySet = mParameters && mParameters.busy && mParameters.busy.set !== undefined ? mParameters.busy.set : true,
        bBusyCheck = mParameters && mParameters.busy && mParameters.busy.check !== undefined ? mParameters.busy.check : true,
        bUpdatesDocument = mParameters && mParameters.updatesDocument || false,
        oLockObject = this._getGlobalUIModel(),
        oContext = this.base.getView().getBindingContext(),
        bIsDraft = oContext && this._getProgrammingModel(oContext) === ProgrammingModel.Draft;
      if (bBusyCheck && BusyLocker.isLocked(oLockObject)) {
        return Promise.reject("Application already busy therefore execution rejected");
      }

      // we have to set busy and draft indicator immediately also the function might be executed later in queue
      if (bBusySet) {
        BusyLocker.lock(oLockObject);
      }
      if (bUpdatesDocument && bIsDraft) {
        this._setDraftStatus(DraftStatus.Saving);
      }
      this._getMessageHandler().removeTransitionMessages();
      return this._syncTask(fnFunction).then(() => {
        if (bUpdatesDocument) {
          this._setDocumentModified(true);
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          if (bIsDraft) {
            this._setDraftStatus(DraftStatus.Saved);
          }
        }
      }).catch(oError => {
        if (bUpdatesDocument && bIsDraft) {
          this._setDraftStatus(DraftStatus.Clear);
        }
        return Promise.reject(oError);
      }).finally(() => {
        if (bBusySet) {
          BusyLocker.unlock(oLockObject);
        }
        this._getMessageHandler().showMessageDialog();
      });
    }

    /**
     * Handles the patchSent event: register document modification.
     *
     * @param oEvent The event sent by the binding
     */;
    _proto.handlePatchSent = function handlePatchSent(oEvent) {
      var _this$getView, _this$getView$getBind;
      // In collaborative draft, disable ETag check for PATCH requests
      const isInCollaborativeDraft = isConnected(this.getView());
      if (isInCollaborativeDraft) {
        oEvent.getSource().getModel().setIgnoreETag(true);
      }
      if (!((_this$getView = this.getView()) !== null && _this$getView !== void 0 && (_this$getView$getBind = _this$getView.getBindingContext("internal")) !== null && _this$getView$getBind !== void 0 && _this$getView$getBind.getProperty("skipPatchHandlers"))) {
        // Create a promise that will be resolved or rejected when the path is completed
        const oPatchPromise = new Promise((resolve, reject) => {
          oEvent.getSource().attachEventOnce("patchCompleted", patchCompletedEvent => {
            // Re-enable ETag checks
            if (isInCollaborativeDraft) {
              oEvent.getSource().getModel().setIgnoreETag(false);
            }
            if (oEvent.getSource().isA("sap.ui.model.odata.v4.ODataListBinding")) {
              var _this$getView2;
              ActionRuntime.setActionEnablementAfterPatch(this.getView(), oEvent.getSource(), (_this$getView2 = this.getView()) === null || _this$getView2 === void 0 ? void 0 : _this$getView2.getBindingContext("internal"));
            }
            const bSuccess = patchCompletedEvent.getParameter("success");
            if (bSuccess) {
              resolve();
            } else {
              reject();
            }
          });
        });
        this.updateDocument(oEvent.getSource(), oPatchPromise);
      }
    }

    /**
     * Handles the CreateActivate event.
     *
     * @param oEvent The event sent by the binding
     */;
    _proto.handleCreateActivate = async function handleCreateActivate(oEvent) {
      const oBinding = oEvent.getSource();
      const transactionHelper = this._getTransactionHelper();
      const bAtEnd = true;
      const bInactive = true;
      const oParams = {
        creationMode: CreationMode.Inline,
        createAtEnd: bAtEnd,
        inactive: bInactive,
        keepTransientContextOnFailed: false,
        // currently not fully supported
        busyMode: "None"
      };
      try {
        var _activatedContext$cre;
        // Send notification to other users only after the creation has been finalized
        const activatedContext = oEvent.getParameter("context");
        (_activatedContext$cre = activatedContext.created()) === null || _activatedContext$cre === void 0 ? void 0 : _activatedContext$cre.then(() => {
          this._sendActivity(Activity.Create, activatedContext);
        }).catch(() => {
          Log.warning(`Failed to activate context ${activatedContext.getPath()}`);
        });

        // Create a new inactive context (empty row in the table)
        const newInactiveContext = await transactionHelper.createDocument(oBinding, oParams, this.getAppComponent(), this._getMessageHandler(), false, this.getView());
        if (newInactiveContext) {
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
        }
      } catch (error) {
        Log.error("Failed to activate new row -", error);
      }
    }

    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////

    /*
    		 TO BE CHECKED / DISCUSSED
    		 _createMultipleDocuments and deleteMultiDocument - couldn't we combine them with create and delete document?
    		 _createActionPromise and deleteCurrentActionPromise -> next step
    			 */;
    _proto._setEditMode = function _setEditMode(sEditMode, bCreationMode) {
      this.getInternalEditFlow().setEditMode(sEditMode, bCreationMode);
    };
    _proto._getCreationMode = function _getCreationMode() {
      return this.getInternalEditFlow().getCreationMode();
    };
    _proto._isDocumentModified = function _isDocumentModified() {
      return this.getInternalEditFlow().isDocumentModified();
    };
    _proto._setDocumentModified = function _setDocumentModified(modified) {
      this.getInternalEditFlow().setDocumentModified(modified);
    };
    _proto._setDocumentModifiedOnCreate = function _setDocumentModifiedOnCreate(listBinding) {
      this.getInternalEditFlow().setDocumentModifiedOnCreate(listBinding);
    };
    _proto._setDraftStatus = function _setDraftStatus(sDraftState) {
      this.getInternalEditFlow().setDraftStatus(sDraftState);
    };
    _proto._getRoutingListener = function _getRoutingListener() {
      return this.getInternalEditFlow().getRoutingListener();
    };
    _proto._getGlobalUIModel = function _getGlobalUIModel() {
      return this.getInternalEditFlow().getGlobalUIModel();
    };
    _proto._syncTask = function _syncTask(vTask) {
      return this.getInternalEditFlow().syncTask(vTask);
    };
    _proto._getProgrammingModel = function _getProgrammingModel(oContext) {
      return this.getInternalEditFlow().getProgrammingModel(oContext);
    };
    _proto._deleteDocumentTransaction = function _deleteDocumentTransaction(oContext, mParameters) {
      return this.getInternalEditFlow().deleteDocumentTransaction(oContext, mParameters);
    };
    _proto._handleCreateEvents = function _handleCreateEvents(oBinding) {
      this.getInternalEditFlow().handleCreateEvents(oBinding);
    };
    _proto._getTransactionHelper = function _getTransactionHelper() {
      return this.getInternalEditFlow().getTransactionHelper();
    };
    _proto._getInternalModel = function _getInternalModel() {
      return this.getInternalEditFlow().getInternalModel();
    };
    _proto._getRootViewController = function _getRootViewController() {
      return this.getAppComponent().getRootViewController();
    };
    _proto._getResourceBundle = function _getResourceBundle() {
      return this.getView().getController().oResourceBundle;
    };
    _proto._getSemanticMapping = function _getSemanticMapping() {
      return this.getAppComponent().getRoutingService().getLastSemanticMapping();
    }

    /**
     * Creates a new promise to wait for an action to be executed
     *
     * @function
     * @name _createActionPromise
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns {Function} The resolver function which can be used to externally resolve the promise
     */;
    _proto._createActionPromise = function _createActionPromise(sActionName, sControlId) {
      return this.getInternalEditFlow().createActionPromise(sActionName, sControlId);
    };
    _proto._getCurrentActionPromise = function _getCurrentActionPromise() {
      return this.getInternalEditFlow().getCurrentActionPromise();
    };
    _proto._deleteCurrentActionPromise = function _deleteCurrentActionPromise() {
      return this.getInternalEditFlow().deleteCurrentActionPromise();
    };
    _proto._getMessageHandler = function _getMessageHandler() {
      return this.getInternalEditFlow().getMessageHandler();
    };
    _proto._sendActivity = function _sendActivity(action, relatedContexts, actionName) {
      const content = Array.isArray(relatedContexts) ? relatedContexts.map(context => context.getPath()) : relatedContexts === null || relatedContexts === void 0 ? void 0 : relatedContexts.getPath();
      send(this.getView(), action, content, actionName);
    };
    _proto._triggerConfiguredSurvey = function _triggerConfiguredSurvey(sActionName, triggerType) {
      triggerConfiguredSurvey(this.getView(), sActionName, triggerType);
    }

    /**
     * @function
     * @name _getActionResponseDataAndKeys
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param sActionName The name of the action that is executed
     * @param oResponse The bound action's response data or response context
     * @returns Object with data and names of the key fields of the response
     */;
    _proto._getActionResponseDataAndKeys = function _getActionResponseDataAndKeys(sActionName, oResponse) {
      return this.getInternalEditFlow().getActionResponseDataAndKeys(sActionName, oResponse);
    };
    _proto._submitOpenChanges = async function _submitOpenChanges(oContext) {
      const oModel = oContext.getModel(),
        oLockObject = this._getGlobalUIModel();
      try {
        // Submit any leftover changes that are not yet submitted
        // Currently we are using only 1 updateGroupId, hence submitting the batch directly here
        await oModel.submitBatch("$auto");

        // Wait for all currently running changes
        // For the time being we agreed with the v4 model team to use an internal method. We'll replace it once
        // a public or restricted method was provided
        await oModel.oRequestor.waitForRunningChangeRequests("$auto");

        // Check if all changes were submitted successfully
        if (oModel.hasPendingChanges("$auto")) {
          throw new Error("submit of open changes failed");
        }
      } finally {
        if (BusyLocker.isLocked(oLockObject)) {
          BusyLocker.unlock(oLockObject);
        }
      }
    };
    _proto._handleStickyOn = function _handleStickyOn(oContext) {
      return this.getInternalEditFlow().handleStickyOn(oContext);
    };
    _proto._handleStickyOff = function _handleStickyOff() {
      return this.getInternalEditFlow().handleStickyOff();
    };
    _proto._onBackNavigationInSession = function _onBackNavigationInSession() {
      return this.getInternalEditFlow().onBackNavigationInSession();
    };
    _proto._setStickySessionInternalProperties = function _setStickySessionInternalProperties(programmingModel, model) {
      if (programmingModel === ProgrammingModel.Sticky) {
        const internalModel = this._getInternalModel();
        internalModel.setProperty("/sessionOn", true);
        internalModel.setProperty("/stickySessionToken", model.getHttpHeaders(true)["SAP-ContextId"]);
      }
    };
    _proto._removeStickySessionInternalProperties = function _removeStickySessionInternalProperties(programmingModel) {
      if (programmingModel === ProgrammingModel.Sticky) {
        const internalModel = this._getInternalModel();
        internalModel.setProperty("/sessionOn", false);
        internalModel.setProperty("/stickySessionToken", undefined);
        this._handleStickyOff( /*oContext*/);
      }
    };
    _proto._handleNewContext = async function _handleNewContext(oContext, bEditable, bRecreateContext, bDraftNavigation) {
      let bForceFocus = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      if (!this._isFclEnabled()) {
        EditState.setEditStateDirty();
      }
      await this._getRoutingListener().navigateToContext(oContext, {
        checkNoHashChange: true,
        editable: bEditable,
        bPersistOPScroll: true,
        bRecreateContext: bRecreateContext,
        bDraftNavigation: bDraftNavigation,
        showPlaceholder: false,
        bForceFocus: bForceFocus,
        keepCurrentLayout: true
      });
    };
    _proto._getBoundContext = function _getBoundContext(view, params) {
      const viewLevel = view.getViewData().viewLevel;
      const bRefreshAfterAction = viewLevel > 1 || viewLevel === 1 && params.controlId;
      return !params.isNavigable || !!bRefreshAfterAction;
    }

    /**
     * Checks if there are validation (parse) errors for controls bound to a given context
     *
     * @function
     * @name _checkForValidationErrors
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns {Promise} Promise resolves if there are no validation errors, and rejects if there are validation errors
     */;
    _proto._checkForValidationErrors = function _checkForValidationErrors() {
      return this._syncTask().then(() => {
        const sViewId = this.base.getView().getId();
        const aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
        let oControl;
        let oMessage;
        if (!aMessages.length) {
          return Promise.resolve("No validation errors found");
        }
        for (let i = 0; i < aMessages.length; i++) {
          oMessage = aMessages[i];
          if (oMessage.validation) {
            oControl = Core.byId(oMessage.getControlId());
            while (oControl) {
              if (oControl.getId() === sViewId) {
                return Promise.reject("validation errors exist");
              }
              oControl = oControl.getParent();
            }
          }
        }
      });
    }

    /**
     * @function
     * @name _refreshListIfRequired
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oResponse The response of the bound action and the names of the key fields
     * @param oContext The bound context on which the action was executed
     * @returns Always resolves to param oResponse
     */;
    _proto._refreshListIfRequired = function _refreshListIfRequired(oResponse, oContext) {
      if (!oContext || !oResponse || !oResponse.oData) {
        return Promise.resolve();
      }
      const oBinding = oContext.getBinding();
      // refresh only lists
      if (oBinding && oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        const oContextData = oResponse.oData;
        const aKeys = oResponse.keys;
        const oCurrentData = oContext.getObject();
        let bReturnedContextIsSame = true;
        // ensure context is in the response
        if (Object.keys(oContextData).length) {
          // check if context in response is different than the bound context
          bReturnedContextIsSame = aKeys.every(function (sKey) {
            return oCurrentData[sKey] === oContextData[sKey];
          });
          if (!bReturnedContextIsSame) {
            return new Promise(resolve => {
              if (oBinding.isRoot()) {
                oBinding.attachEventOnce("dataReceived", function () {
                  resolve();
                });
                oBinding.refresh();
              } else {
                const oAppComponent = CommonUtils.getAppComponent(this.getView());
                oAppComponent.getSideEffectsService().requestSideEffects([{
                  $NavigationPropertyPath: oBinding.getPath()
                }], oBinding.getContext()).then(function () {
                  resolve();
                }, function () {
                  Log.error("Error while refreshing the table");
                  resolve();
                }).catch(function (e) {
                  Log.error("Error while refreshing the table", e);
                });
              }
            });
          }
        }
      }
      // resolve with oResponse to not disturb the promise chain afterwards
      return Promise.resolve();
    };
    _proto._fetchSemanticKeyValues = function _fetchSemanticKeyValues(oContext) {
      const oMetaModel = oContext.getModel().getMetaModel(),
        sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name"),
        aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName);
      if (aSemanticKeys && aSemanticKeys.length) {
        const aRequestPromises = aSemanticKeys.map(function (oKey) {
          return oContext.requestObject(oKey.$PropertyPath);
        });
        return Promise.all(aRequestPromises);
      } else {
        return Promise.resolve();
      }
    }

    /**
     * Provides the latest context in the metadata hierarchy from rootBinding to given context pointing to given entityType
     * if any such context exists. Otherwise, it returns the original context.
     * Note: It is only needed as work-around for incorrect modelling. Correct modelling would imply a DataFieldForAction in a LineItem
     * to point to an overload defined either on the corresponding EntityType or a collection of the same.
     *
     * @param rootContext The context to start searching from
     * @param listBinding The listBinding of the table
     * @param overloadEntityType The ActionOverload entity type to search for
     * @returns Returns the context of the ActionOverload entity
     */;
    _proto._getActionOverloadContextFromMetadataPath = function _getActionOverloadContextFromMetadataPath(rootContext, listBinding, overloadEntityType) {
      const model = rootContext.getModel();
      const metaModel = model.getMetaModel();
      let contextSegments = listBinding.getPath().split("/");
      let currentContext = rootContext;

      // We expect that the last segment of the listBinding is the ListBinding of the table. Remove this from contextSegments
      // because it is incorrect to execute bindContext on a list. We do not anyway need to search this context for the overload.
      contextSegments.pop();
      if (contextSegments.length === 0) {
        contextSegments = [""]; // Don't leave contextSegments undefined
      }

      if (contextSegments[0] !== "") {
        contextSegments.unshift(""); // to also get the root context, i.e. the bindingContext of the table
      }
      // load all the parent contexts into an array
      const parentContexts = contextSegments.map(pathSegment => {
        if (pathSegment !== "") {
          currentContext = model.bindContext(pathSegment, currentContext).getBoundContext();
        } else {
          // Creating a new context using bindContext(...).getBoundContext() does not work if the etag is needed. According to model colleagues,
          // we should always use an existing context if possible.
          // Currently, the only example we know about is using the rootContext - and in this case, we can obviously reuse that existing context.
          // If other examples should come up, the best possible work around would be to request some data to get an existing context. To keep the
          // request as small and fast as possible, we should request only the first key property. As this would introduce asynchronism, and anyway
          // the whole logic is only part of work-around for incorrect modelling, we wait until we have an example needing it before implementing this.
          currentContext = rootContext;
        }
        return currentContext;
      }).reverse();
      // search for context backwards
      const overloadContext = parentContexts.find(parentContext => metaModel.getMetaContext(parentContext.getPath()).getObject("$Type") === overloadEntityType);
      return overloadContext || listBinding.getHeaderContext();
    };
    _proto._createSiblingInfo = function _createSiblingInfo(currentContext, newContext) {
      return {
        targetContext: newContext,
        pathMapping: [{
          oldPath: currentContext.getPath(),
          newPath: newContext.getPath()
        }]
      };
    };
    _proto._updatePathsInHistory = function _updatePathsInHistory(mappings) {
      const oAppComponent = this.getAppComponent();
      oAppComponent.getRouterProxy().setPathMapping(mappings);

      // Also update the semantic mapping in the routing service
      const lastSemanticMapping = this._getSemanticMapping();
      if (mappings.length && (lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.technicalPath) === mappings[mappings.length - 1].oldPath) {
        lastSemanticMapping.technicalPath = mappings[mappings.length - 1].newPath;
      }
    };
    _proto._getNavigationTargetForEdit = function _getNavigationTargetForEdit(context, newDocumentContext, siblingInfo) {
      let contextToNavigate;
      siblingInfo = siblingInfo ?? this._createSiblingInfo(context, newDocumentContext);
      this._updatePathsInHistory(siblingInfo.pathMapping);
      if (siblingInfo.targetContext.getPath() != newDocumentContext.getPath()) {
        contextToNavigate = siblingInfo.targetContext;
      }
      return contextToNavigate;
    }
    /**
     * This method creates a sibling context for a subobject page, and calculates a sibling path
     * for all intermediate paths between the object page and the subobject page.
     *
     * @param rootCurrentContext The context for the root of the draft
     * @param rightmostCurrentContext The context of the subobject
     * @param sProgrammingModel The programming model
     * @param doNotComputeIfRoot If true, we don't compute siblingInfo if the root and the rightmost contexts are the same
     * @returns Returns the siblingInformation object
     */;
    _proto._computeSiblingInformation = async function _computeSiblingInformation(rootCurrentContext, rightmostCurrentContext, sProgrammingModel, doNotComputeIfRoot) {
      rightmostCurrentContext = rightmostCurrentContext ?? rootCurrentContext;
      if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
        // Wrong usage !!
        Log.error("Cannot compute rightmost sibling context");
        throw new Error("Cannot compute rightmost sibling context");
      }
      if (doNotComputeIfRoot && rightmostCurrentContext.getPath() === rootCurrentContext.getPath()) {
        return Promise.resolve(undefined);
      }
      const model = rootCurrentContext.getModel();
      if (sProgrammingModel === ProgrammingModel.Draft) {
        return draft.computeSiblingInformation(rootCurrentContext, rightmostCurrentContext);
      } else {
        // If not in draft mode, we just recreate a context from the path of the rightmost context
        // No path mapping is needed
        return {
          targetContext: model.bindContext(rightmostCurrentContext.getPath()).getBoundContext(),
          pathMapping: []
        };
      }
    };
    _proto._isFclEnabled = function _isFclEnabled() {
      return CommonUtils.getAppComponent(this.getView())._isFclEnabled();
    };
    return EditFlow;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "editDocument", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "editDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteMultipleDocuments", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteMultipleDocuments"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "updateDocument", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "updateDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createDocument", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "createDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeSave", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeSave"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeCreate", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeCreate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeEdit", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeEdit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeDiscard", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeDiscard"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeDelete", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeDelete"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "saveDocument", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "saveDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "toggleDraftActive", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "toggleDraftActive"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "cancelDocument", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "cancelDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteDocument", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyDocument", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "applyDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "invokeAction", [_dec30, _dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "invokeAction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "securedExecution", [_dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "securedExecution"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handlePatchSent", [_dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "handlePatchSent"), _class2.prototype)), _class2)) || _class);
  return EditFlow;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJQcm9ncmFtbWluZ01vZGVsIiwiQ29uc3RhbnRzIiwiRHJhZnRTdGF0dXMiLCJFZGl0TW9kZSIsIlN0YXJ0dXBNb2RlIiwiTWVzc2FnZVR5cGUiLCJjb3JlTGlicmFyeSIsIkVkaXRGbG93IiwiZGVmaW5lVUk1Q2xhc3MiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwiZ2V0QXBwQ29tcG9uZW50IiwiYmFzZSIsImdldEludGVybmFsRWRpdEZsb3ciLCJnZXRWaWV3IiwiZ2V0Q29udHJvbGxlciIsIl9lZGl0RmxvdyIsImVkaXREb2N1bWVudCIsIm9Db250ZXh0IiwiYkRyYWZ0TmF2aWdhdGlvbiIsInRyYW5zYWN0aW9uSGVscGVyIiwiX2dldFRyYW5zYWN0aW9uSGVscGVyIiwib1Jvb3RWaWV3Q29udHJvbGxlciIsIl9nZXRSb290Vmlld0NvbnRyb2xsZXIiLCJtb2RlbCIsImdldE1vZGVsIiwicmlnaHRtb3N0Q29udGV4dCIsInNpYmxpbmdJbmZvIiwib1ZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJzUHJvZ3JhbW1pbmdNb2RlbCIsIl9nZXRQcm9ncmFtbWluZ01vZGVsIiwib1Jvb3RDb250ZXh0Iiwib1ZpZXciLCJ2aWV3TGV2ZWwiLCJEcmFmdCIsImRyYWZ0Um9vdFBhdGgiLCJNb2RlbEhlbHBlciIsImdldERyYWZ0Um9vdFBhdGgiLCJiaW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsInJlcXVlc3RPYmplY3QiLCJTdGlja3kiLCJzU3RpY2t5Um9vdFBhdGgiLCJnZXRTdGlja3lSb290UGF0aCIsImVkaXRGbG93Iiwib25CZWZvcmVFZGl0IiwiY29udGV4dCIsIm9OZXdEb2N1bWVudENvbnRleHQiLCJfZ2V0TWVzc2FnZUhhbmRsZXIiLCJfc2V0U3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyIsIl9zZXRFZGl0TW9kZSIsIkVkaXRhYmxlIiwiX3NldERvY3VtZW50TW9kaWZpZWQiLCJzaG93TWVzc2FnZURpYWxvZyIsImNvbnRleHRUb05hdmlnYXRlIiwiX2lzRmNsRW5hYmxlZCIsImdldFJpZ2h0bW9zdENvbnRleHQiLCJfY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiIsIl9jcmVhdGVTaWJsaW5nSW5mbyIsIl91cGRhdGVQYXRoc0luSGlzdG9yeSIsInBhdGhNYXBwaW5nIiwidGFyZ2V0Q29udGV4dCIsImdldFBhdGgiLCJfZ2V0TmF2aWdhdGlvblRhcmdldEZvckVkaXQiLCJfaGFuZGxlTmV3Q29udGV4dCIsInN0aWNreUNvbnRleHQiLCJnZXRLZWVwQWxpdmVDb250ZXh0IiwiX2hhbmRsZVN0aWNreU9uIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJnZXRNZXRhTW9kZWwiLCJzaGFyZU9iamVjdCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwiZGVsZXRlTXVsdGlwbGVEb2N1bWVudHMiLCJhQ29udGV4dHMiLCJtUGFyYW1ldGVycyIsImJlZm9yZURlbGV0ZUNhbGxCYWNrIiwib25CZWZvcmVEZWxldGUiLCJ1cGRhdGVEb2N1bWVudCIsInVwZGF0ZWRDb250ZXh0IiwidXBkYXRlUHJvbWlzZSIsIm9yaWdpbmFsQmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImlzRHJhZnQiLCJyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMiLCJfc3luY1Rhc2siLCJFZGl0U3RhdGUiLCJzZXRFZGl0U3RhdGVEaXJ0eSIsIl9zZXREcmFmdFN0YXR1cyIsIlNhdmluZyIsImN1cnJlbnRCaW5kaW5nQ29udGV4dCIsIm1ldGFNb2RlbCIsImVudGl0eVNldE5hbWUiLCJnZXRNZXRhQ29udGV4dCIsImdldE9iamVjdCIsInNlbWFudGljS2V5cyIsIlNlbWFudGljS2V5SGVscGVyIiwiZ2V0U2VtYW50aWNLZXlzIiwibGVuZ3RoIiwiY3VycmVudFNlbWFudGljTWFwcGluZyIsIl9nZXRTZW1hbnRpY01hcHBpbmciLCJjdXJyZW50U2VtYW50aWNQYXRoIiwic2VtYW50aWNQYXRoIiwic0NoYW5nZWRQYXRoIiwiZ2V0U2VtYW50aWNQYXRoIiwiU2F2ZWQiLCJDbGVhciIsInNob3dNZXNzYWdlcyIsImNyZWF0ZURvY3VtZW50Iiwidkxpc3RCaW5kaW5nIiwibUluUGFyYW1ldGVycyIsIm9Mb2NrT2JqZWN0IiwiX2dldEdsb2JhbFVJTW9kZWwiLCJvVGFibGUiLCJiU2hvdWxkQnVzeUxvY2siLCJjcmVhdGlvbk1vZGUiLCJJbmxpbmUiLCJDcmVhdGlvblJvdyIsIkV4dGVybmFsIiwib0V4ZWNDdXN0b21WYWxpZGF0aW9uIiwiUHJvbWlzZSIsInJlc29sdmUiLCJvQXBwQ29tcG9uZW50IiwiQ29tbW9uVXRpbHMiLCJnZXRSb3V0ZXJQcm94eSIsInJlbW92ZUlBcHBTdGF0ZUtleSIsIm9Db250cm9sbGVyIiwic0NyZWF0ZVBhdGgiLCJnZXRBYnNvbHV0ZU1ldGFQYXRoRm9yTGlzdEJpbmRpbmciLCJoYW5kbGVycyIsIm9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZCIsIm91dGJvdW5kIiwidW5kZWZpbmVkIiwiY3JlYXRpb25Sb3ciLCJvQ3JlYXRpb25Sb3dPYmplY3RzIiwiZ2V0UGFyZW50IiwidmFsaWRhdGVEb2N1bWVudCIsImRhdGEiLCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJnZXRDcmVhdGlvblJvdyIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsInNldFByb3BlcnR5IiwidGFibGVJZCIsImJ5SWQiLCJpc0EiLCJmbkZvY3VzT3JTY3JvbGwiLCJmb2N1c1JvdyIsImJpbmQiLCJzY3JvbGxUb0luZGV4IiwiZ2V0Um93QmluZGluZyIsImF0dGFjaEV2ZW50T25jZSIsImNyZWF0ZUF0RW5kIiwiZ2V0TGVuZ3RoIiwiaGFuZGxlU2lkZUVmZmVjdHMiLCJvTGlzdEJpbmRpbmciLCJvQ3JlYXRpb25Qcm9taXNlIiwib05ld0NvbnRleHQiLCJjcmVhdGVkIiwib0JpbmRpbmdDb250ZXh0IiwiaGFzVHJhbnNpZW50Q29udGV4dCIsImFwcENvbXBvbmVudCIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eSIsImNyZWF0ZUN1c3RvbVZhbGlkYXRpb25NZXNzYWdlcyIsImFWYWxpZGF0aW9uTWVzc2FnZXMiLCJzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uIiwibUN1c3RvbVZhbGlkaXR5IiwiZ2V0UHJvcGVydHkiLCJvTWVzc2FnZU1hbmFnZXIiLCJDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJhQ3VzdG9tTWVzc2FnZXMiLCJvRmllbGRDb250cm9sIiwic1RhcmdldCIsImdldE1lc3NhZ2VNb2RlbCIsImdldERhdGEiLCJmb3JFYWNoIiwib01lc3NhZ2UiLCJjb2RlIiwicmVtb3ZlTWVzc2FnZXMiLCJvVmFsaWRhdGlvbk1lc3NhZ2UiLCJtZXNzYWdlVGFyZ2V0IiwiZ2V0Q29udHJvbCIsImZpZWxkSWQiLCJnZXRCaW5kaW5nUGF0aCIsImZpbHRlciIsInRhcmdldCIsImFkZE1lc3NhZ2VzIiwiTWVzc2FnZSIsIm1lc3NhZ2UiLCJtZXNzYWdlVGV4dCIsInByb2Nlc3NvciIsInR5cGUiLCJFcnJvciIsInRlY2huaWNhbCIsInBlcnNpc3RlbnQiLCJhRXhpc3RpbmdWYWxpZGF0aW9uTWVzc2FnZXMiLCJhZGRDb250cm9sSWQiLCJwdXNoIiwidGV4dCIsImN1c3RvbU1lc3NhZ2VzIiwicmVzb2x2ZUNyZWF0aW9uTW9kZSIsImluaXRpYWxDcmVhdGlvbk1vZGUiLCJwcm9ncmFtbWluZ01vZGVsIiwib01ldGFNb2RlbCIsIk5ld1BhZ2UiLCJpc1JlbGF0aXZlIiwic1BhdGgiLCJzTmV3QWN0aW9uIiwiYVBhcmFtZXRlcnMiLCJEZWZlcnJlZCIsInNNZXRhUGF0aCIsImdldE1ldGFQYXRoIiwiZ2V0SGVhZGVyQ29udGV4dCIsImFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMiLCJnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMiLCJBc3luYyIsIkJ1c3lMb2NrZXIiLCJsb2NrIiwiT0RhdGFMaXN0QmluZGluZyIsIlN5bmMiLCJvTW9kZWwiLCJyZXNvbHZlZENyZWF0aW9uTW9kZSIsIm9DcmVhdGlvbiIsIm1BcmdzIiwib0NyZWF0aW9uUm93Iiwib0NyZWF0aW9uUm93Q29udGV4dCIsIm9QYXlsb2FkIiwib1JvdXRpbmdMaXN0ZW5lciIsIl9nZXRSb3V0aW5nTGlzdGVuZXIiLCJPYmplY3QiLCJrZXlzIiwic1Byb3BlcnR5UGF0aCIsIm9Qcm9wZXJ0eSIsIiRraW5kIiwiX2NoZWNrRm9yVmFsaWRhdGlvbkVycm9ycyIsImtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQiLCJidXN5TW9kZSIsImJ1c3lJZCIsImdldFRhYmxlRGVmaW5pdGlvbiIsImFubm90YXRpb24iLCJpZCIsIl9oYW5kbGVDcmVhdGVFdmVudHMiLCJwYXJlbnRDb250cm9sIiwiYmVmb3JlQ3JlYXRlQ2FsbEJhY2siLCJvbkJlZm9yZUNyZWF0ZSIsInNraXBQYXJhbWV0ZXJEaWFsb2ciLCJnZXRTdGFydHVwTW9kZSIsIkF1dG9DcmVhdGUiLCJvTmF2aWdhdGlvbiIsIm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dCIsImJEZWZlcnJlZENvbnRleHQiLCJlZGl0YWJsZSIsImJGb3JjZUZvY3VzIiwiYXN5bmNDb250ZXh0IiwiY3JlYXRlQWN0aW9uIiwidHJhbnNpZW50IiwidGhlbiIsImNvcmVSZXNvdXJjZUJ1bmRsZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsIm5hdmlnYXRlVG9NZXNzYWdlUGFnZSIsImdldFRleHQiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiYkZyb21EZWZlcnJlZCIsIm5hdmlnYXRlVG9Db250ZXh0Iiwib0NyZWF0aW9uUm93TGlzdEJpbmRpbmciLCJnZXRCaW5kaW5nIiwiYlNraXBTaWRlRWZmZWN0cyIsIm9OZXdUcmFuc2llbnRDb250ZXh0IiwiY3JlYXRlIiwic2V0QmluZGluZ0NvbnRleHQiLCJjYXRjaCIsInRyYWNlIiwiZGVsZXRlIiwiaXNMb2NrZWQiLCJ1bmxvY2siLCJyZWplY3QiLCJhUGFyYW1zIiwiYWxsIiwibWV0YUNvbnRleHQiLCJlbnRpdHlTZXQiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJzdGFydGluZ0VudGl0eVNldCIsIm5ld0FjdGlvbiIsImFubm90YXRpb25zIiwiU2Vzc2lvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJOZXdBY3Rpb24iLCJfZ2V0SW50ZXJuYWxNb2RlbCIsIl9zZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUiLCJfc2VuZEFjdGl2aXR5IiwiQWN0aXZpdHkiLCJDcmVhdGUiLCJDYW5jZWxBY3Rpb25EaWFsb2ciLCJBY3Rpb25FeGVjdXRpb25GYWlsZWQiLCJDcmVhdGlvbkZhaWxlZCIsIm5hdmlnYXRlQmFja0Zyb21UcmFuc2llbnRTdGF0ZSIsIm9uQmVmb3JlU2F2ZSIsIl9tUGFyYW1ldGVycyIsIm9uQmVmb3JlRGlzY2FyZCIsInNhdmVEb2N1bWVudCIsImJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIiwib1Jlc291cmNlQnVuZGxlIiwiX2dldFJlc291cmNlQnVuZGxlIiwiYUJpbmRpbmdzIiwiYmluZGluZ3MiLCJfc3VibWl0T3BlbkNoYW5nZXMiLCJpc0ZjbEVuYWJsZWQiLCJhY3RpdmVEb2N1bWVudENvbnRleHQiLCJfZ2V0Q3JlYXRpb25Nb2RlIiwiX3JlbW92ZVN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMiLCJBY3RpdmF0ZSIsIl90cmlnZ2VyQ29uZmlndXJlZFN1cnZleSIsIlN0YW5kYXJkQWN0aW9ucyIsInNhdmUiLCJUcmlnZ2VyVHlwZSIsInN0YW5kYXJkQWN0aW9uIiwiRGlzcGxheSIsImNhbmNlbGVkIiwidG9nZ2xlRHJhZnRBY3RpdmUiLCJvQ29udGV4dERhdGEiLCJiRWRpdGFibGUiLCJiSXNEcmFmdCIsIklzQWN0aXZlRW50aXR5IiwiSGFzQWN0aXZlRW50aXR5IiwiSGFzRHJhZnRFbnRpdHkiLCJvUmlnaHRtb3N0Q29udGV4dCIsImxhc3RTZW1hbnRpY01hcHBpbmciLCJ0ZWNobmljYWxQYXRoIiwidGFyZ2V0UGF0aCIsIm5ld1BhdGgiLCJvbGRQYXRoIiwiY2FuY2VsRG9jdW1lbnQiLCJjYW5jZWxCdXR0b24iLCJjb250cm9sIiwiYmVmb3JlQ2FuY2VsQ2FsbEJhY2siLCJjYW5jZWxSZXN1bHQiLCJfaXNEb2N1bWVudE1vZGlmaWVkIiwiRGlzY2FyZCIsInNraXBCYWNrTmF2aWdhdGlvbiIsIm5hdmlnYXRlQmFja0Zyb21Db250ZXh0Iiwib0FjdGl2ZURvY3VtZW50Q29udGV4dCIsIl9mZXRjaFNlbWFudGljS2V5VmFsdWVzIiwic2tpcEJpbmRpbmdUb1ZpZXciLCJpc0RyYWZ0Um9vdCIsInRhcmdldEVudGl0eVNldCIsImRlbGV0ZURvY3VtZW50IiwiYkZpbmRBY3RpdmVDb250ZXh0cyIsImdldEluZGV4IiwicGFyYW1ldGVycyIsInNpYmxpbmdDb250ZXh0IiwiZHJhZnRQYXRoIiwicmVxdWVzdENhbm9uaWNhbFBhdGgiLCJkcmFmdENvbnRleHRUb1JlbW92ZSIsInJlcGxhY2VXaXRoIiwiX2RlbGV0ZURvY3VtZW50VHJhbnNhY3Rpb24iLCJEZWxldGUiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0QmFja05hdmlnYXRpb24iLCJEZWVwbGluayIsImV4aXRGcm9tQXBwIiwiYXBwbHlEb2N1bWVudCIsImludm9rZUFjdGlvbiIsInNBY3Rpb25OYW1lIiwibUV4dHJhUGFyYW1zIiwib0NvbnRyb2wiLCJhUGFydHMiLCJzT3ZlcmxvYWRFbnRpdHlUeXBlIiwib0N1cnJlbnRBY3Rpb25DYWxsQmFja3MiLCJBcnJheSIsImlzQXJyYXkiLCJjb250ZXh0cyIsImlzTmF2aWdhYmxlIiwicmVxdWlyZXNOYXZpZ2F0aW9uIiwiYWN0aW9uTWV0YURhdGEiLCJzcGxpdCIsImlzQm91bmQiLCIkSXNCb3VuZCIsImNvbnRyb2xJZCIsImludGVybmFsTW9kZWxDb250ZXh0IiwiaW5kZXhPZiIsInJlcGxhY2VBbGwiLCJiU3RhdGljQWN0aW9uIiwiaXNUYWJsZUJvdW5kIiwic0JpbmRpbmdQYXRoIiwicGF0aCIsIl9nZXRBY3Rpb25PdmVybG9hZENvbnRleHRGcm9tTWV0YWRhdGFQYXRoIiwiZW5hYmxlQXV0b1Njcm9sbCIsIl9jcmVhdGVBY3Rpb25Qcm9taXNlIiwic0lkIiwiYkdldEJvdW5kQ29udGV4dCIsIl9nZXRCb3VuZENvbnRleHQiLCJiT2JqZWN0UGFnZSIsImNvbnZlcnRlclR5cGUiLCJvUmVzcG9uc2UiLCJjYWxsQWN0aW9uIiwiX3JlZnJlc2hMaXN0SWZSZXF1aXJlZCIsIl9nZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzIiwiQWN0aW9uIiwiYWN0aW9uIiwiZlJlc29sdmVyIiwidkNvbnRleHQiLCJ2YWx1ZSIsInNDb250ZXh0TWV0YVBhdGgiLCJfZm5WYWxpZENvbnRleHRzIiwiYXBwbGljYWJsZUNvbnRleHRzIiwiZWxlbWVudCIsIm9BY3Rpb25Db250ZXh0IiwiYXBwbGljYWJsZUNvbnRleHQiLCJzQWN0aW9uQ29udGV4dE1ldGFQYXRoIiwiY2hlY2tOb0hhc2hDaGFuZ2UiLCJub0hpc3RvcnlFbnRyeSIsImluZm8iLCJlcnIiLCJmUmVqZWN0b3IiLCJyZWplY3RlZEl0ZW1zIiwic2VjdXJlZEV4ZWN1dGlvbiIsImZuRnVuY3Rpb24iLCJiQnVzeVNldCIsImJ1c3kiLCJzZXQiLCJiQnVzeUNoZWNrIiwiY2hlY2siLCJiVXBkYXRlc0RvY3VtZW50IiwidXBkYXRlc0RvY3VtZW50IiwiZmluYWxseSIsImhhbmRsZVBhdGNoU2VudCIsIm9FdmVudCIsImlzSW5Db2xsYWJvcmF0aXZlRHJhZnQiLCJpc0Nvbm5lY3RlZCIsImdldFNvdXJjZSIsInNldElnbm9yZUVUYWciLCJvUGF0Y2hQcm9taXNlIiwicGF0Y2hDb21wbGV0ZWRFdmVudCIsIkFjdGlvblJ1bnRpbWUiLCJzZXRBY3Rpb25FbmFibGVtZW50QWZ0ZXJQYXRjaCIsImJTdWNjZXNzIiwiZ2V0UGFyYW1ldGVyIiwiaGFuZGxlQ3JlYXRlQWN0aXZhdGUiLCJvQmluZGluZyIsImJBdEVuZCIsImJJbmFjdGl2ZSIsIm9QYXJhbXMiLCJpbmFjdGl2ZSIsImFjdGl2YXRlZENvbnRleHQiLCJ3YXJuaW5nIiwibmV3SW5hY3RpdmVDb250ZXh0Iiwic0VkaXRNb2RlIiwiYkNyZWF0aW9uTW9kZSIsInNldEVkaXRNb2RlIiwiZ2V0Q3JlYXRpb25Nb2RlIiwiaXNEb2N1bWVudE1vZGlmaWVkIiwibW9kaWZpZWQiLCJzZXREb2N1bWVudE1vZGlmaWVkIiwibGlzdEJpbmRpbmciLCJzZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUiLCJzRHJhZnRTdGF0ZSIsInNldERyYWZ0U3RhdHVzIiwiZ2V0Um91dGluZ0xpc3RlbmVyIiwiZ2V0R2xvYmFsVUlNb2RlbCIsInZUYXNrIiwic3luY1Rhc2siLCJnZXRQcm9ncmFtbWluZ01vZGVsIiwiZGVsZXRlRG9jdW1lbnRUcmFuc2FjdGlvbiIsImhhbmRsZUNyZWF0ZUV2ZW50cyIsImdldFRyYW5zYWN0aW9uSGVscGVyIiwiZ2V0SW50ZXJuYWxNb2RlbCIsImdldFJvb3RWaWV3Q29udHJvbGxlciIsImdldFJvdXRpbmdTZXJ2aWNlIiwiZ2V0TGFzdFNlbWFudGljTWFwcGluZyIsInNDb250cm9sSWQiLCJjcmVhdGVBY3Rpb25Qcm9taXNlIiwiX2dldEN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiZ2V0Q3VycmVudEFjdGlvblByb21pc2UiLCJfZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UiLCJkZWxldGVDdXJyZW50QWN0aW9uUHJvbWlzZSIsImdldE1lc3NhZ2VIYW5kbGVyIiwicmVsYXRlZENvbnRleHRzIiwiYWN0aW9uTmFtZSIsImNvbnRlbnQiLCJtYXAiLCJzZW5kIiwidHJpZ2dlclR5cGUiLCJ0cmlnZ2VyQ29uZmlndXJlZFN1cnZleSIsImdldEFjdGlvblJlc3BvbnNlRGF0YUFuZEtleXMiLCJzdWJtaXRCYXRjaCIsIm9SZXF1ZXN0b3IiLCJ3YWl0Rm9yUnVubmluZ0NoYW5nZVJlcXVlc3RzIiwiaGFzUGVuZGluZ0NoYW5nZXMiLCJoYW5kbGVTdGlja3lPbiIsIl9oYW5kbGVTdGlja3lPZmYiLCJoYW5kbGVTdGlja3lPZmYiLCJfb25CYWNrTmF2aWdhdGlvbkluU2Vzc2lvbiIsIm9uQmFja05hdmlnYXRpb25JblNlc3Npb24iLCJpbnRlcm5hbE1vZGVsIiwiZ2V0SHR0cEhlYWRlcnMiLCJiUmVjcmVhdGVDb250ZXh0IiwiYlBlcnNpc3RPUFNjcm9sbCIsInNob3dQbGFjZWhvbGRlciIsImtlZXBDdXJyZW50TGF5b3V0IiwidmlldyIsInBhcmFtcyIsImJSZWZyZXNoQWZ0ZXJBY3Rpb24iLCJzVmlld0lkIiwiZ2V0SWQiLCJhTWVzc2FnZXMiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJpIiwidmFsaWRhdGlvbiIsImdldENvbnRyb2xJZCIsIm9EYXRhIiwiYUtleXMiLCJvQ3VycmVudERhdGEiLCJiUmV0dXJuZWRDb250ZXh0SXNTYW1lIiwiZXZlcnkiLCJzS2V5IiwiaXNSb290IiwicmVmcmVzaCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiZ2V0Q29udGV4dCIsImUiLCJzRW50aXR5U2V0TmFtZSIsImFTZW1hbnRpY0tleXMiLCJhUmVxdWVzdFByb21pc2VzIiwib0tleSIsIiRQcm9wZXJ0eVBhdGgiLCJyb290Q29udGV4dCIsIm92ZXJsb2FkRW50aXR5VHlwZSIsImNvbnRleHRTZWdtZW50cyIsImN1cnJlbnRDb250ZXh0IiwicG9wIiwidW5zaGlmdCIsInBhcmVudENvbnRleHRzIiwicGF0aFNlZ21lbnQiLCJyZXZlcnNlIiwib3ZlcmxvYWRDb250ZXh0IiwiZmluZCIsInBhcmVudENvbnRleHQiLCJuZXdDb250ZXh0IiwibWFwcGluZ3MiLCJzZXRQYXRoTWFwcGluZyIsIm5ld0RvY3VtZW50Q29udGV4dCIsInJvb3RDdXJyZW50Q29udGV4dCIsInJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0IiwiZG9Ob3RDb21wdXRlSWZSb290Iiwic3RhcnRzV2l0aCIsImRyYWZ0IiwiY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkVkaXRGbG93LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5U2V0IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCB7IGlzQ29ubmVjdGVkLCBzZW5kIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlTeW5jXCI7XG5pbXBvcnQgeyBBY3Rpdml0eSwgc2hhcmVPYmplY3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IFNpYmxpbmdJbmZvcm1hdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IGRyYWZ0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IHsgU3RhbmRhcmRBY3Rpb25zLCB0cmlnZ2VyQ29uZmlndXJlZFN1cnZleSwgVHJpZ2dlclR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvRmVlZGJhY2tcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBFZGl0U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRWRpdFN0YXRlXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNlbWFudGljS2V5SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljS2V5SGVscGVyXCI7XG5pbXBvcnQgRkVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgU2VtYW50aWNNYXBwaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1JvdXRpbmdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IGNvcmVMaWJyYXJ5IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgQmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL0JpbmRpbmdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IE9EYXRhTGlzdEJpbmRpbmcgYXMgVjRMaXN0QmluZGluZyB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbmltcG9ydCBBY3Rpb25SdW50aW1lIGZyb20gXCIuLi9BY3Rpb25SdW50aW1lXCI7XG5pbXBvcnQgdHlwZSB7IEJhc2VNYW5pZmVzdFNldHRpbmdzIH0gZnJvbSBcIi4uL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHR5cGUgSW50ZXJuYWxFZGl0RmxvdyBmcm9tIFwiLi9JbnRlcm5hbEVkaXRGbG93XCI7XG5cbmNvbnN0IENyZWF0aW9uTW9kZSA9IEZFTGlicmFyeS5DcmVhdGlvbk1vZGUsXG5cdFByb2dyYW1taW5nTW9kZWwgPSBGRUxpYnJhcnkuUHJvZ3JhbW1pbmdNb2RlbCxcblx0Q29uc3RhbnRzID0gRkVMaWJyYXJ5LkNvbnN0YW50cyxcblx0RHJhZnRTdGF0dXMgPSBGRUxpYnJhcnkuRHJhZnRTdGF0dXMsXG5cdEVkaXRNb2RlID0gRkVMaWJyYXJ5LkVkaXRNb2RlLFxuXHRTdGFydHVwTW9kZSA9IEZFTGlicmFyeS5TdGFydHVwTW9kZSxcblx0TWVzc2FnZVR5cGUgPSBjb3JlTGlicmFyeS5NZXNzYWdlVHlwZTtcblxuLyoqXG4gKiBBIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIG9mZmVyaW5nIGhvb2tzIGludG8gdGhlIGVkaXQgZmxvdyBvZiB0aGUgYXBwbGljYXRpb25cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS45MC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XCIpXG5jbGFzcyBFZGl0RmxvdyBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRwcm90ZWN0ZWQgYmFzZSE6IFBhZ2VDb250cm9sbGVyO1xuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIFB1YmxpYyBtZXRob2RzXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblx0cHJpdmF0ZSBmbkRpcnR5U3RhdGVQcm92aWRlcj86IEZ1bmN0aW9uO1xuXHRwcml2YXRlIGZuSGFuZGxlU2Vzc2lvblRpbWVvdXQ/OiBGdW5jdGlvbjtcblx0cHJpdmF0ZSBtUGF0Y2hQcm9taXNlcz86IGFueTtcblx0cHJpdmF0ZSBfZm5TdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uPzogRnVuY3Rpb247XG5cblx0Z2V0QXBwQ29tcG9uZW50KCk6IEFwcENvbXBvbmVudCB7XG5cdFx0cmV0dXJuIHRoaXMuYmFzZS5nZXRBcHBDb21wb25lbnQoKTtcblx0fVxuXHQvKipcblx0ICogR2V0cyB0aGUgSW50ZXJuYWxFZGl0RmxvdyBleHRlbnNpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBpbnRlcm5hbEVkaXRGbG93IGNvbnRyb2xsZXIgZXh0ZW5zaW9uXG5cdCAqL1xuXHRwcml2YXRlIGdldEludGVybmFsRWRpdEZsb3coKTogSW50ZXJuYWxFZGl0RmxvdyB7XG5cdFx0cmV0dXJuICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2VkaXRGbG93O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBkcmFmdCBkb2N1bWVudCBmb3IgYW4gZXhpc3RpbmcgYWN0aXZlIGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGFjdGl2ZSBkb2N1bWVudFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIG9uY2UgdGhlIGVkaXRhYmxlIGRvY3VtZW50IGlzIGF2YWlsYWJsZVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjZWRpdERvY3VtZW50XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGVkaXREb2N1bWVudChvQ29udGV4dDogQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGJEcmFmdE5hdmlnYXRpb24gPSB0cnVlO1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5fZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKTtcblx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXHRcdGNvbnN0IG1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRsZXQgcmlnaHRtb3N0Q29udGV4dCwgc2libGluZ0luZm87XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gdGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBCYXNlTWFuaWZlc3RTZXR0aW5ncztcblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuX2dldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQpO1xuXHRcdGxldCBvUm9vdENvbnRleHQ6IENvbnRleHQgPSBvQ29udGV4dDtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoKG9WaWV3RGF0YT8udmlld0xldmVsIGFzIG51bWJlcikgPiAxKSB7XG5cdFx0XHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0XHRcdGNvbnN0IGRyYWZ0Um9vdFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCA9IE1vZGVsSGVscGVyLmdldERyYWZ0Um9vdFBhdGgob0NvbnRleHQpO1xuXHRcdFx0XHRcdG9Sb290Q29udGV4dCA9IG9WaWV3XG5cdFx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0LmJpbmRDb250ZXh0KGRyYWZ0Um9vdFBhdGggYXMgc3RyaW5nKVxuXHRcdFx0XHRcdFx0LmdldEJvdW5kQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRcdFx0YXdhaXQgb1Jvb3RDb250ZXh0LnJlcXVlc3RPYmplY3QoZHJhZnRSb290UGF0aCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1N0aWNreVJvb3RQYXRoID0gTW9kZWxIZWxwZXIuZ2V0U3RpY2t5Um9vdFBhdGgob0NvbnRleHQpO1xuXHRcdFx0XHRcdG9Sb290Q29udGV4dCA9IG9WaWV3XG5cdFx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0LmJpbmRDb250ZXh0KHNTdGlja3lSb290UGF0aCBhcyBzdHJpbmcpXG5cdFx0XHRcdFx0XHQuZ2V0Qm91bmRDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRcdFx0XHRhd2FpdCBvUm9vdENvbnRleHQucmVxdWVzdE9iamVjdChzU3RpY2t5Um9vdFBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRhd2FpdCB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVFZGl0KHsgY29udGV4dDogb1Jvb3RDb250ZXh0IH0pO1xuXHRcdFx0Y29uc3Qgb05ld0RvY3VtZW50Q29udGV4dCA9IGF3YWl0IHRyYW5zYWN0aW9uSGVscGVyLmVkaXREb2N1bWVudChcblx0XHRcdFx0b1Jvb3RDb250ZXh0LFxuXHRcdFx0XHR0aGlzLmdldFZpZXcoKSxcblx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKVxuXHRcdFx0KTtcblxuXHRcdFx0dGhpcy5fc2V0U3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyhzUHJvZ3JhbW1pbmdNb2RlbCwgbW9kZWwpO1xuXG5cdFx0XHRpZiAob05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHR0aGlzLl9zZXRFZGl0TW9kZShFZGl0TW9kZS5FZGl0YWJsZSwgZmFsc2UpO1xuXHRcdFx0XHR0aGlzLl9zZXREb2N1bWVudE1vZGlmaWVkKGZhbHNlKTtcblx0XHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZygpO1xuXG5cdFx0XHRcdGlmIChvTmV3RG9jdW1lbnRDb250ZXh0ICE9PSBvUm9vdENvbnRleHQpIHtcblx0XHRcdFx0XHRsZXQgY29udGV4dFRvTmF2aWdhdGU6IENvbnRleHQgfCB1bmRlZmluZWQgPSBvTmV3RG9jdW1lbnRDb250ZXh0O1xuXHRcdFx0XHRcdGlmICh0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdFx0cmlnaHRtb3N0Q29udGV4dCA9IG9Sb290Vmlld0NvbnRyb2xsZXIuZ2V0UmlnaHRtb3N0Q29udGV4dCgpO1xuXHRcdFx0XHRcdFx0c2libGluZ0luZm8gPSBhd2FpdCB0aGlzLl9jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKG9Sb290Q29udGV4dCwgcmlnaHRtb3N0Q29udGV4dCwgc1Byb2dyYW1taW5nTW9kZWwsIHRydWUpO1xuXHRcdFx0XHRcdFx0c2libGluZ0luZm8gPSBzaWJsaW5nSW5mbyA/PyB0aGlzLl9jcmVhdGVTaWJsaW5nSW5mbyhvQ29udGV4dCwgb05ld0RvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdFx0XHR0aGlzLl91cGRhdGVQYXRoc0luSGlzdG9yeShzaWJsaW5nSW5mby5wYXRoTWFwcGluZyk7XG5cdFx0XHRcdFx0XHRpZiAoc2libGluZ0luZm8udGFyZ2V0Q29udGV4dC5nZXRQYXRoKCkgIT0gb05ld0RvY3VtZW50Q29udGV4dC5nZXRQYXRoKCkpIHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dFRvTmF2aWdhdGUgPSBzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoKG9WaWV3RGF0YT8udmlld0xldmVsIGFzIG51bWJlcikgPiAxKSB7XG5cdFx0XHRcdFx0XHRzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24ob1Jvb3RDb250ZXh0LCBvQ29udGV4dCwgc1Byb2dyYW1taW5nTW9kZWwsIHRydWUpO1xuXHRcdFx0XHRcdFx0Y29udGV4dFRvTmF2aWdhdGUgPSB0aGlzLl9nZXROYXZpZ2F0aW9uVGFyZ2V0Rm9yRWRpdChvQ29udGV4dCwgb05ld0RvY3VtZW50Q29udGV4dCwgc2libGluZ0luZm8pIGFzIENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoY29udGV4dFRvTmF2aWdhdGUsIHRydWUsIGZhbHNlLCBiRHJhZnROYXZpZ2F0aW9uLCB0cnVlKTtcblx0XHRcdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRcdFx0XHQvLyBUaGUgc3RpY2t5T24gaGFuZGxlciBtdXN0IGJlIHNldCBhZnRlciB0aGUgbmF2aWdhdGlvbiBoYXMgYmVlbiBkb25lLFxuXHRcdFx0XHRcdFx0Ly8gYXMgdGhlIFVSTCBtYXkgY2hhbmdlIGluIHRoZSBjYXNlIG9mIEZDTFxuXHRcdFx0XHRcdFx0bGV0IHN0aWNreUNvbnRleHQ6IENvbnRleHQ7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gV2UgbmVlZCB0byB1c2UgdGhlIGtlcHQtYWxpdmUgY29udGV4dCB1c2VkIHRvIGJpbmQgdGhlIHBhZ2Vcblx0XHRcdFx0XHRcdFx0c3RpY2t5Q29udGV4dCA9IG9OZXdEb2N1bWVudENvbnRleHQuZ2V0TW9kZWwoKS5nZXRLZWVwQWxpdmVDb250ZXh0KG9OZXdEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHN0aWNreUNvbnRleHQgPSBvTmV3RG9jdW1lbnRDb250ZXh0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGhpcy5faGFuZGxlU3RpY2t5T24oc3RpY2t5Q29udGV4dCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChtb2RlbC5nZXRNZXRhTW9kZWwoKSkpIHtcblx0XHRcdFx0XHRcdC8vIGFjY29yZGluZyB0byBVWCBpbiBjYXNlIG9mIGVuYWJsZWQgY29sbGFib3JhdGlvbiBkcmFmdCB3ZSBzaGFyZSB0aGUgb2JqZWN0IGltbWVkaWF0ZWx5XG5cdFx0XHRcdFx0XHRhd2FpdCBzaGFyZU9iamVjdChvTmV3RG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGVkaXRpbmcgdGhlIGRvY3VtZW50XCIsIG9FcnJvciBhcyBhbnkpO1xuXHRcdH1cblx0fVxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0ZGVsZXRlTXVsdGlwbGVEb2N1bWVudHMoYUNvbnRleHRzOiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRpZiAobVBhcmFtZXRlcnMpIHtcblx0XHRcdG1QYXJhbWV0ZXJzLmJlZm9yZURlbGV0ZUNhbGxCYWNrID0gdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlRGVsZXRlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0YmVmb3JlRGVsZXRlQ2FsbEJhY2s6IHRoaXMuYmFzZS5lZGl0Rmxvdy5vbkJlZm9yZURlbGV0ZVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLmRlbGV0ZU11bHRpcGxlRG9jdW1lbnRzKGFDb250ZXh0cywgbVBhcmFtZXRlcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGRyYWZ0IHN0YXR1cyBhbmQgZGlzcGxheXMgdGhlIGVycm9yIG1lc3NhZ2VzIGlmIHRoZXJlIGFyZSBlcnJvcnMgZHVyaW5nIGFuIHVwZGF0ZS5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSB1cGRhdGVkQ29udGV4dCBDb250ZXh0IG9mIHRoZSB1cGRhdGVkIGZpZWxkXG5cdCAqIEBwYXJhbSB1cGRhdGVQcm9taXNlIFByb21pc2UgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIHVwZGF0ZSBvcGVyYXRpb24gaXMgY29tcGxldGVkLiBUaGUgcHJvbWlzZSBzaG91bGQgYmUgcmVzb2x2ZWQgd2hlbiB0aGUgdXBkYXRlIG9wZXJhdGlvbiBpcyBjb21wbGV0ZWQsIHNvIHRoZSBkcmFmdCBzdGF0dXMgY2FuIGJlIHVwZGF0ZWQuXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSBkcmFmdCBzdGF0dXMgaGFzIGJlZW4gdXBkYXRlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjdXBkYXRlRG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0dXBkYXRlRG9jdW1lbnQodXBkYXRlZENvbnRleHQ6IG9iamVjdCwgdXBkYXRlUHJvbWlzZTogUHJvbWlzZTxhbnk+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb3JpZ2luYWxCaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3QgaXNEcmFmdCA9IHRoaXMuX2dldFByb2dyYW1taW5nTW9kZWwodXBkYXRlZENvbnRleHQpID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0O1xuXG5cdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKS5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRyZXR1cm4gdGhpcy5fc3luY1Rhc2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0aWYgKG9yaWdpbmFsQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5fc2V0RG9jdW1lbnRNb2RpZmllZCh0cnVlKTtcblx0XHRcdFx0aWYgKCF0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGlzRHJhZnQpIHtcblx0XHRcdFx0XHR0aGlzLl9zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5TYXZpbmcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IHVwZGF0ZVByb21pc2U7XG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRCaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRcdGlmICghaXNEcmFmdCB8fCAhY3VycmVudEJpbmRpbmdDb250ZXh0IHx8IGN1cnJlbnRCaW5kaW5nQ29udGV4dCAhPT0gb3JpZ2luYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0XHRcdC8vIElmIGEgbmF2aWdhdGlvbiBoYXBwZW5lZCB3aGlsZSBvUHJvbWlzZSB3YXMgYmVpbmcgcmVzb2x2ZWQsIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2UgY2hhbmdlZFxuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdlJ3JlIHN0aWxsIG9uIHRoZSBzYW1lIGNvbnRleHRcblx0XHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gY3VycmVudEJpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVNldE5hbWUgPSBtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQoY3VycmVudEJpbmRpbmdDb250ZXh0LmdldFBhdGgoKSkuZ2V0T2JqZWN0KFwiQHNhcHVpLm5hbWVcIik7XG5cdFx0XHRcdGNvbnN0IHNlbWFudGljS2V5cyA9IFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljS2V5cyhtZXRhTW9kZWwsIGVudGl0eVNldE5hbWUpO1xuXHRcdFx0XHRpZiAoc2VtYW50aWNLZXlzPy5sZW5ndGgpIHtcblx0XHRcdFx0XHRjb25zdCBjdXJyZW50U2VtYW50aWNNYXBwaW5nID0gdGhpcy5fZ2V0U2VtYW50aWNNYXBwaW5nKCk7XG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudFNlbWFudGljUGF0aCA9IGN1cnJlbnRTZW1hbnRpY01hcHBpbmc/LnNlbWFudGljUGF0aCxcblx0XHRcdFx0XHRcdHNDaGFuZ2VkUGF0aCA9IFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljUGF0aChjdXJyZW50QmluZGluZ0NvbnRleHQsIHRydWUpO1xuXHRcdFx0XHRcdC8vIGN1cnJlbnRTZW1hbnRpY1BhdGggY291bGQgYmUgbnVsbCBpZiB3ZSBoYXZlIG5hdmlnYXRlZCB2aWEgZGVlcCBsaW5rIHRoZW4gdGhlcmUgYXJlIG5vIHNlbWFudGljTWFwcGluZ3MgdG8gY2FsY3VsYXRlIGl0IGZyb21cblx0XHRcdFx0XHRpZiAoY3VycmVudFNlbWFudGljUGF0aCAmJiBjdXJyZW50U2VtYW50aWNQYXRoICE9PSBzQ2hhbmdlZFBhdGgpIHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoY3VycmVudEJpbmRpbmdDb250ZXh0IGFzIENvbnRleHQsIHRydWUsIGZhbHNlLCB0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLl9zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5TYXZlZCk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHVwZGF0aW5nIHRoZSBkb2N1bWVudFwiLCBlcnJvcik7XG5cdFx0XHRcdGlmIChpc0RyYWZ0ICYmIG9yaWdpbmFsQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdFx0XHR0aGlzLl9zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBJbnRlcm5hbCBvbmx5IHBhcmFtcyAtLS1cblx0Ly8gKiBAcGFyYW0ge3N0cmluZ30gbVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlIFRoZSBjcmVhdGlvbiBtb2RlIHVzaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nOlxuXHQvLyAqICAgICAgICAgICAgICAgICAgICBTeW5jIC0gdGhlIGNyZWF0aW9uIGlzIHRyaWdnZXJlZCBhbmQgb25jZSB0aGUgZG9jdW1lbnQgaXMgY3JlYXRlZCwgdGhlIG5hdmlnYXRpb24gaXMgZG9uZVxuXHQvLyAqICAgICAgICAgICAgICAgICAgICBBc3luYyAtIHRoZSBjcmVhdGlvbiBhbmQgdGhlIG5hdmlnYXRpb24gdG8gdGhlIGluc3RhbmNlIGFyZSBkb25lIGluIHBhcmFsbGVsXG5cdC8vICogICAgICAgICAgICAgICAgICAgIERlZmVycmVkIC0gdGhlIGNyZWF0aW9uIGlzIGRvbmUgb24gdGhlIHRhcmdldCBwYWdlXG5cdC8vICogICAgICAgICAgICAgICAgICAgIENyZWF0aW9uUm93IC0gVGhlIGNyZWF0aW9uIGlzIGRvbmUgaW5saW5lIGFzeW5jIHNvIHRoZSB1c2VyIGlzIG5vdCBibG9ja2VkXG5cdC8vIG1QYXJhbWV0ZXJzLmNyZWF0aW9uUm93IEluc3RhbmNlIG9mIHRoZSBjcmVhdGlvbiByb3cgLSAoVE9ETzogZ2V0IHJpZCBidXQgdXNlIGxpc3QgYmluZGluZ3Mgb25seSlcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSB2TGlzdEJpbmRpbmcgIE9EYXRhTGlzdEJpbmRpbmcgb2JqZWN0IG9yIHRoZSBiaW5kaW5nIHBhdGggZm9yIGEgdGVtcG9yYXJ5IGxpc3QgYmluZGluZ1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycyBDb250YWlucyB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSBUaGUgY3JlYXRpb24gbW9kZSB1c2luZyBvbmUgb2YgdGhlIGZvbGxvd2luZzpcblx0ICogICAgICAgICAgICAgICAgICAgIE5ld1BhZ2UgLSB0aGUgY3JlYXRlZCBkb2N1bWVudCBpcyBzaG93biBpbiBhIG5ldyBwYWdlLCBkZXBlbmRpbmcgb24gd2hldGhlciBtZXRhZGF0YSAnU3luYycsICdBc3luYycgb3IgJ0RlZmVycmVkJyBpcyB1c2VkXG5cdCAqICAgICAgICAgICAgICAgICAgICBJbmxpbmUgLSBUaGUgY3JlYXRpb24gaXMgZG9uZSBpbmxpbmUgKGluIGEgdGFibGUpXG5cdCAqICAgICAgICAgICAgICAgICAgICBFeHRlcm5hbCAtIFRoZSBjcmVhdGlvbiBpcyBkb25lIGluIGEgZGlmZmVyZW50IGFwcGxpY2F0aW9uIHNwZWNpZmllZCB2aWEgdGhlIHBhcmFtZXRlciAnb3V0Ym91bmQnXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLm91dGJvdW5kIFRoZSBuYXZpZ2F0aW9uIHRhcmdldCB3aGVyZSB0aGUgZG9jdW1lbnQgaXMgY3JlYXRlZCBpbiBjYXNlIG9mIGNyZWF0aW9uTW9kZSAnRXh0ZXJuYWwnXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmNyZWF0ZUF0RW5kIFNwZWNpZmllcyBpZiB0aGUgbmV3IGVudHJ5IHNob3VsZCBiZSBjcmVhdGVkIGF0IHRoZSB0b3Agb3IgYm90dG9tIG9mIGEgdGFibGUgaW4gY2FzZSBvZiBjcmVhdGlvbk1vZGUgJ0lubGluZSdcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIHRoZSBvYmplY3QgaGFzIGJlZW4gY3JlYXRlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjY3JlYXRlRG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgY3JlYXRlRG9jdW1lbnQoXG5cdFx0dkxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nIHwgc3RyaW5nLFxuXHRcdG1JblBhcmFtZXRlcnM6IHtcblx0XHRcdGNyZWF0aW9uTW9kZTogc3RyaW5nO1xuXHRcdFx0b3V0Ym91bmQ/OiBzdHJpbmc7XG5cdFx0XHRjcmVhdGVBdEVuZD86IGJvb2xlYW47XG5cdFx0fVxuXHQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB0cmFuc2FjdGlvbkhlbHBlciA9IHRoaXMuX2dldFRyYW5zYWN0aW9uSGVscGVyKCksXG5cdFx0XHRvTG9ja09iamVjdCA9IHRoaXMuX2dldEdsb2JhbFVJTW9kZWwoKTtcblx0XHRsZXQgb1RhYmxlOiBhbnk7IC8vc2hvdWxkIGJlIFRhYmxlIGJ1dCB0aGVyZSBhcmUgbWlzc2luZyBtZXRob2RzIGludG8gdGhlIGRlZlxuXHRcdGxldCBtUGFyYW1ldGVyczogYW55ID0gbUluUGFyYW1ldGVycztcblx0XHRjb25zdCBiU2hvdWxkQnVzeUxvY2sgPVxuXHRcdFx0IW1QYXJhbWV0ZXJzIHx8XG5cdFx0XHQobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuSW5saW5lICYmXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93ICYmXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLkV4dGVybmFsKTtcblx0XHRsZXQgb0V4ZWNDdXN0b21WYWxpZGF0aW9uID0gUHJvbWlzZS5yZXNvbHZlKFtdKTtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkucmVtb3ZlSUFwcFN0YXRlS2V5KCk7XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuRXh0ZXJuYWwpIHtcblx0XHRcdC8vIENyZWF0ZSBieSBuYXZpZ2F0aW5nIHRvIGFuIGV4dGVybmFsIHRhcmdldFxuXHRcdFx0Ly8gVE9ETzogQ2FsbCBhcHByb3ByaWF0ZSBmdW5jdGlvbiAoY3VycmVudGx5IHVzaW5nIHRoZSBzYW1lIGFzIGZvciBvdXRib3VuZCBjaGV2cm9uIG5hdiwgYW5kIHdpdGhvdXQgYW55IGNvbnRleHQgLSAzcmQgcGFyYW0pXG5cdFx0XHRhd2FpdCB0aGlzLl9zeW5jVGFzaygpO1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSB0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCk7XG5cdFx0XHRjb25zdCBzQ3JlYXRlUGF0aCA9IE1vZGVsSGVscGVyLmdldEFic29sdXRlTWV0YVBhdGhGb3JMaXN0QmluZGluZyh0aGlzLmdldFZpZXcoKSwgdkxpc3RCaW5kaW5nKTtcblxuXHRcdFx0KG9Db250cm9sbGVyIGFzIGFueSkuaGFuZGxlcnMub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyLCBtUGFyYW1ldGVycy5vdXRib3VuZCwgdW5kZWZpbmVkLCBzQ3JlYXRlUGF0aCk7XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cgJiYgbVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cpIHtcblx0XHRcdGNvbnN0IG9DcmVhdGlvblJvd09iamVjdHMgPSBtUGFyYW1ldGVycy5jcmVhdGlvblJvdy5nZXRCaW5kaW5nQ29udGV4dCgpLmdldE9iamVjdCgpO1xuXHRcdFx0ZGVsZXRlIG9DcmVhdGlvblJvd09iamVjdHNbXCJAJHVpNS5jb250ZXh0LmlzVHJhbnNpZW50XCJdO1xuXHRcdFx0b1RhYmxlID0gbVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cuZ2V0UGFyZW50KCk7XG5cdFx0XHRvRXhlY0N1c3RvbVZhbGlkYXRpb24gPSB0cmFuc2FjdGlvbkhlbHBlci52YWxpZGF0ZURvY3VtZW50KFxuXHRcdFx0XHRvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGE6IG9DcmVhdGlvblJvd09iamVjdHMsXG5cdFx0XHRcdFx0Y3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uOiBvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKS5kYXRhKFwiY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXCIpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRoaXMuYmFzZS5nZXRWaWV3KClcblx0XHRcdCk7XG5cblx0XHRcdC8vIGRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEgaXMgc2V0IHRvIGZhbHNlIGluIG1hbmlmZXN0IGNvbnZlcnRlciAoVGFibGUudHMpIGlmIGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiBleGlzdHNcblx0XHRcdGlmIChvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKS5kYXRhKFwiZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YVwiKSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNyZWF0aW9uUm93RmllbGRWYWxpZGl0eVwiLCB7fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLklubGluZSAmJiBtUGFyYW1ldGVycy50YWJsZUlkKSB7XG5cdFx0XHRvVGFibGUgPSB0aGlzLmdldFZpZXcoKS5ieUlkKG1QYXJhbWV0ZXJzLnRhYmxlSWQpIGFzIFRhYmxlO1xuXHRcdH1cblxuXHRcdGlmIChvVGFibGUgJiYgb1RhYmxlLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdGNvbnN0IGZuRm9jdXNPclNjcm9sbCA9XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLklubGluZSA/IG9UYWJsZS5mb2N1c1Jvdy5iaW5kKG9UYWJsZSkgOiBvVGFibGUuc2Nyb2xsVG9JbmRleC5iaW5kKG9UYWJsZSk7XG5cdFx0XHRvVGFibGUuZ2V0Um93QmluZGluZygpLmF0dGFjaEV2ZW50T25jZShcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGZuRm9jdXNPclNjcm9sbChtUGFyYW1ldGVycy5jcmVhdGVBdEVuZCA/IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0TGVuZ3RoKCkgOiAwLCB0cnVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IGhhbmRsZVNpZGVFZmZlY3RzID0gYXN5bmMgKG9MaXN0QmluZGluZzogYW55LCBvQ3JlYXRpb25Qcm9taXNlOiBQcm9taXNlPENvbnRleHQ+KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvTmV3Q29udGV4dCA9IGF3YWl0IG9DcmVhdGlvblByb21pc2U7XG5cdFx0XHRcdC8vIHRyYW5zaWVudCBjb250ZXh0cyBhcmUgcmVsaWFibHkgcmVtb3ZlZCBvbmNlIG9OZXdDb250ZXh0LmNyZWF0ZWQoKSBpcyByZXNvbHZlZFxuXHRcdFx0XHRhd2FpdCBvTmV3Q29udGV4dC5jcmVhdGVkKCk7XG5cdFx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRcdFx0Ly8gaWYgdGhlcmUgYXJlIHRyYW5zaWVudCBjb250ZXh0cywgd2UgbXVzdCBhdm9pZCByZXF1ZXN0aW5nIHNpZGUgZWZmZWN0c1xuXHRcdFx0XHQvLyB0aGlzIGlzIGF2b2lkIGEgcG90ZW50aWFsIGxpc3QgcmVmcmVzaCwgdGhlcmUgY291bGQgYmUgYSBzaWRlIGVmZmVjdCB0aGF0IHJlZnJlc2hlcyB0aGUgbGlzdCBiaW5kaW5nXG5cdFx0XHRcdC8vIGlmIGxpc3QgYmluZGluZyBpcyByZWZyZXNoZWQsIHRyYW5zaWVudCBjb250ZXh0cyBtaWdodCBiZSBsb3N0XG5cdFx0XHRcdGlmICghQ29tbW9uVXRpbHMuaGFzVHJhbnNpZW50Q29udGV4dChvTGlzdEJpbmRpbmcpKSB7XG5cdFx0XHRcdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHRcdFx0XHRhcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCkucmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5KG9MaXN0QmluZGluZy5nZXRQYXRoKCksIG9CaW5kaW5nQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGNyZWF0aW5nIHRoZSBkb2N1bWVudFwiLCBvRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBAcGFyYW0gYVZhbGlkYXRpb25NZXNzYWdlcyBFcnJvciBtZXNzYWdlcyBmcm9tIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uXG5cdFx0ICovXG5cdFx0Y29uc3QgY3JlYXRlQ3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VzID0gKGFWYWxpZGF0aW9uTWVzc2FnZXM6IGFueVtdKSA9PiB7XG5cdFx0XHRjb25zdCBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uID0gb1RhYmxlICYmIG9UYWJsZS5nZXRDcmVhdGlvblJvdygpLmRhdGEoXCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb25cIik7XG5cdFx0XHRjb25zdCBtQ3VzdG9tVmFsaWRpdHkgPSBvVGFibGUgJiYgb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik/LmdldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dDdXN0b21WYWxpZGl0eVwiKTtcblx0XHRcdGNvbnN0IG9NZXNzYWdlTWFuYWdlciA9IENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0XHRcdGNvbnN0IGFDdXN0b21NZXNzYWdlczogYW55W10gPSBbXTtcblx0XHRcdGxldCBvRmllbGRDb250cm9sO1xuXHRcdFx0bGV0IHNUYXJnZXQ6IHN0cmluZztcblxuXHRcdFx0Ly8gUmVtb3ZlIGV4aXN0aW5nIEN1c3RvbVZhbGlkYXRpb24gbWVzc2FnZVxuXHRcdFx0b01lc3NhZ2VNYW5hZ2VyXG5cdFx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0XHQuZ2V0RGF0YSgpXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdFx0aWYgKG9NZXNzYWdlLmNvZGUgPT09IHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdG9NZXNzYWdlTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhvTWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0YVZhbGlkYXRpb25NZXNzYWdlcy5mb3JFYWNoKChvVmFsaWRhdGlvbk1lc3NhZ2U6IGFueSkgPT4ge1xuXHRcdFx0XHQvLyBIYW5kbGUgQm91bmQgQ3VzdG9tVmFsaWRhdGlvbiBtZXNzYWdlXG5cdFx0XHRcdGlmIChvVmFsaWRhdGlvbk1lc3NhZ2UubWVzc2FnZVRhcmdldCkge1xuXHRcdFx0XHRcdG9GaWVsZENvbnRyb2wgPSBDb3JlLmdldENvbnRyb2wobUN1c3RvbVZhbGlkaXR5W29WYWxpZGF0aW9uTWVzc2FnZS5tZXNzYWdlVGFyZ2V0XS5maWVsZElkKSBhcyBDb250cm9sO1xuXHRcdFx0XHRcdHNUYXJnZXQgPSBgJHtvRmllbGRDb250cm9sLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKX0vJHtvRmllbGRDb250cm9sLmdldEJpbmRpbmdQYXRoKFwidmFsdWVcIil9YDtcblx0XHRcdFx0XHQvLyBBZGQgdmFsaWRhdGlvbiBtZXNzYWdlIGlmIHN0aWxsIG5vdCBleGlzdHNcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRvTWVzc2FnZU1hbmFnZXJcblx0XHRcdFx0XHRcdFx0LmdldE1lc3NhZ2VNb2RlbCgpXG5cdFx0XHRcdFx0XHRcdC5nZXREYXRhKClcblx0XHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvTWVzc2FnZS50YXJnZXQgPT09IHNUYXJnZXQ7XG5cdFx0XHRcdFx0XHRcdH0pLmxlbmd0aCA9PT0gMFxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0b01lc3NhZ2VNYW5hZ2VyLmFkZE1lc3NhZ2VzKFxuXHRcdFx0XHRcdFx0XHRuZXcgTWVzc2FnZSh7XG5cdFx0XHRcdFx0XHRcdFx0bWVzc2FnZTogb1ZhbGlkYXRpb25NZXNzYWdlLm1lc3NhZ2VUZXh0LFxuXHRcdFx0XHRcdFx0XHRcdHByb2Nlc3NvcjogdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiBNZXNzYWdlVHlwZS5FcnJvcixcblx0XHRcdFx0XHRcdFx0XHRjb2RlOiBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdHRlY2huaWNhbDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0cGVyc2lzdGVudDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0dGFyZ2V0OiBzVGFyZ2V0XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBBZGQgY29udHJvbElkIGluIG9yZGVyIHRvIGdldCB0aGUgZm9jdXMgaGFuZGxpbmcgb2YgdGhlIGVycm9yIHBvcG92ZXIgcnVuYWJsZVxuXHRcdFx0XHRcdGNvbnN0IGFFeGlzdGluZ1ZhbGlkYXRpb25NZXNzYWdlcyA9IG9NZXNzYWdlTWFuYWdlclxuXHRcdFx0XHRcdFx0LmdldE1lc3NhZ2VNb2RlbCgpXG5cdFx0XHRcdFx0XHQuZ2V0RGF0YSgpXG5cdFx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBvTWVzc2FnZS50YXJnZXQgPT09IHNUYXJnZXQ7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRhRXhpc3RpbmdWYWxpZGF0aW9uTWVzc2FnZXNbMF0uYWRkQ29udHJvbElkKG1DdXN0b21WYWxpZGl0eVtvVmFsaWRhdGlvbk1lc3NhZ2UubWVzc2FnZVRhcmdldF0uZmllbGRJZCk7XG5cblx0XHRcdFx0XHQvLyBIYW5kbGUgVW5ib3VuZCBDdXN0b21WYWxpZGF0aW9uIG1lc3NhZ2Vcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhQ3VzdG9tTWVzc2FnZXMucHVzaCh7XG5cdFx0XHRcdFx0XHRjb2RlOiBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLFxuXHRcdFx0XHRcdFx0dGV4dDogb1ZhbGlkYXRpb25NZXNzYWdlLm1lc3NhZ2VUZXh0LFxuXHRcdFx0XHRcdFx0cGVyc2lzdGVudDogdHJ1ZSxcblx0XHRcdFx0XHRcdHR5cGU6IE1lc3NhZ2VUeXBlLkVycm9yXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoYUN1c3RvbU1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZyh7XG5cdFx0XHRcdFx0Y3VzdG9tTWVzc2FnZXM6IGFDdXN0b21NZXNzYWdlc1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3QgcmVzb2x2ZUNyZWF0aW9uTW9kZSA9IChcblx0XHRcdGluaXRpYWxDcmVhdGlvbk1vZGU6IHN0cmluZyxcblx0XHRcdHByb2dyYW1taW5nTW9kZWw6IHN0cmluZyxcblx0XHRcdG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsXG5cdFx0KTogc3RyaW5nID0+IHtcblx0XHRcdGlmIChpbml0aWFsQ3JlYXRpb25Nb2RlICYmIGluaXRpYWxDcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5OZXdQYWdlKSB7XG5cdFx0XHRcdC8vIHVzZSB0aGUgcGFzc2VkIGNyZWF0aW9uIG1vZGVcblx0XHRcdFx0cmV0dXJuIGluaXRpYWxDcmVhdGlvbk1vZGU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBOZXdBY3Rpb24gaXMgbm90IHlldCBzdXBwb3J0ZWQgZm9yIE5hdmlnYXRpb25Qcm9wZXJ0eSBjb2xsZWN0aW9uXG5cdFx0XHRcdGlmICghb0xpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKSkge1xuXHRcdFx0XHRcdGNvbnN0IHNQYXRoID0gb0xpc3RCaW5kaW5nLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdC8vIGlmIE5ld0FjdGlvbiB3aXRoIHBhcmFtZXRlcnMgaXMgcHJlc2VudCwgdGhlbiBjcmVhdGlvbiBpcyAnRGVmZXJyZWQnXG5cdFx0XHRcdFx0XHQvLyBpbiB0aGUgYWJzZW5jZSBvZiBOZXdBY3Rpb24gb3IgTmV3QWN0aW9uIHdpdGggcGFyYW1ldGVycywgY3JlYXRpb24gaXMgYXN5bmNcblx0XHRcdFx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRcdFx0XHRwcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0XG5cdFx0XHRcdFx0XHRcdFx0PyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdC9OZXdBY3Rpb25gKVxuXHRcdFx0XHRcdFx0XHRcdDogb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZC9OZXdBY3Rpb25gKTtcblx0XHRcdFx0XHRpZiAoc05ld0FjdGlvbikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c05ld0FjdGlvbn0vQCR1aTUub3ZlcmxvYWQvMC8kUGFyYW1ldGVyYCkgfHwgW107XG5cdFx0XHRcdFx0XHQvLyBiaW5kaW5nIHBhcmFtZXRlciAoZWc6IF9pdCkgaXMgbm90IGNvbnNpZGVyZWRcblx0XHRcdFx0XHRcdGlmIChhUGFyYW1ldGVycy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBDcmVhdGlvbk1vZGUuRGVmZXJyZWQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0xpc3RCaW5kaW5nPy5nZXRIZWFkZXJDb250ZXh0KCkhLmdldFBhdGgoKSk7XG5cdFx0XHRcdGNvbnN0IGFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMgPSBDb21tb25VdGlscy5nZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMob01ldGFNb2RlbCwgc01ldGFQYXRoLCB0aGlzLmdldFZpZXcoKSk7XG5cdFx0XHRcdGlmIChhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gQ3JlYXRpb25Nb2RlLkRlZmVycmVkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBDcmVhdGlvbk1vZGUuQXN5bmM7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChiU2hvdWxkQnVzeUxvY2spIHtcblx0XHRcdEJ1c3lMb2NrZXIubG9jayhvTG9ja09iamVjdCk7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBhVmFsaWRhdGlvbk1lc3NhZ2VzID0gYXdhaXQgdGhpcy5fc3luY1Rhc2sob0V4ZWNDdXN0b21WYWxpZGF0aW9uKTtcblx0XHRcdGlmIChhVmFsaWRhdGlvbk1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y3JlYXRlQ3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VzKGFWYWxpZGF0aW9uTWVzc2FnZXMpO1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJDdXN0b20gVmFsaWRhdGlvbiBmYWlsZWRcIik7XG5cdFx0XHRcdC8vIGlmIGN1c3RvbSB2YWxpZGF0aW9uIGZhaWxzLCB3ZSBsZWF2ZSB0aGUgbWV0aG9kIGltbWVkaWF0ZWx5XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IG9MaXN0QmluZGluZzogYW55O1xuXHRcdFx0bVBhcmFtZXRlcnMgPSBtUGFyYW1ldGVycyB8fCB7fTtcblxuXHRcdFx0aWYgKHZMaXN0QmluZGluZyAmJiB0eXBlb2Ygdkxpc3RCaW5kaW5nID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdC8vIHdlIGFscmVhZHkgZ2V0IGEgbGlzdCBiaW5kaW5nIHVzZSB0aGlzIG9uZVxuXHRcdFx0XHRvTGlzdEJpbmRpbmcgPSB2TGlzdEJpbmRpbmc7XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2TGlzdEJpbmRpbmcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0b0xpc3RCaW5kaW5nID0gbmV3IChPRGF0YUxpc3RCaW5kaW5nIGFzIGFueSkodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoKSwgdkxpc3RCaW5kaW5nKTtcblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID0gQ3JlYXRpb25Nb2RlLlN5bmM7XG5cdFx0XHRcdGRlbGV0ZSBtUGFyYW1ldGVycy5jcmVhdGVBdEVuZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkJpbmRpbmcgb2JqZWN0IG9yIHBhdGggZXhwZWN0ZWRcIik7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9Nb2RlbCA9IG9MaXN0QmluZGluZy5nZXRNb2RlbCgpO1xuXHRcdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWw6IHN0cmluZyA9IHRoaXMuX2dldFByb2dyYW1taW5nTW9kZWwob0xpc3RCaW5kaW5nKTtcblx0XHRcdGNvbnN0IHJlc29sdmVkQ3JlYXRpb25Nb2RlID0gcmVzb2x2ZUNyZWF0aW9uTW9kZShcblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlLFxuXHRcdFx0XHRzUHJvZ3JhbW1pbmdNb2RlbCxcblx0XHRcdFx0b0xpc3RCaW5kaW5nLFxuXHRcdFx0XHRvTW9kZWwuZ2V0TWV0YU1vZGVsKClcblx0XHRcdCk7XG5cblx0XHRcdGxldCBvQ3JlYXRpb246IGFueTtcblx0XHRcdGxldCBtQXJnczogYW55O1xuXHRcdFx0Y29uc3Qgb0NyZWF0aW9uUm93ID0gbVBhcmFtZXRlcnMuY3JlYXRpb25Sb3c7XG5cdFx0XHRsZXQgb0NyZWF0aW9uUm93Q29udGV4dDogYW55O1xuXHRcdFx0bGV0IG9QYXlsb2FkOiBhbnk7XG5cdFx0XHRsZXQgc01ldGFQYXRoOiBzdHJpbmc7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0Y29uc3Qgb1JvdXRpbmdMaXN0ZW5lciA9IHRoaXMuX2dldFJvdXRpbmdMaXN0ZW5lcigpO1xuXG5cdFx0XHRpZiAocmVzb2x2ZWRDcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5EZWZlcnJlZCkge1xuXHRcdFx0XHRpZiAocmVzb2x2ZWRDcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdykge1xuXHRcdFx0XHRcdG9DcmVhdGlvblJvd0NvbnRleHQgPSBvQ3JlYXRpb25Sb3cuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9DcmVhdGlvblJvd0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdFx0XHQvLyBwcmVmaWxsIGRhdGEgZnJvbSBjcmVhdGlvbiByb3dcblx0XHRcdFx0XHRvUGF5bG9hZCA9IG9DcmVhdGlvblJvd0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGF0YSA9IHt9O1xuXHRcdFx0XHRcdE9iamVjdC5rZXlzKG9QYXlsb2FkKS5mb3JFYWNoKGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vJHtzUHJvcGVydHlQYXRofWApO1xuXHRcdFx0XHRcdFx0Ly8gZW5zdXJlIG5hdmlnYXRpb24gcHJvcGVydGllcyBhcmUgbm90IHBhcnQgb2YgdGhlIHBheWxvYWQsIGRlZXAgY3JlYXRlIG5vdCBzdXBwb3J0ZWRcblx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHkgJiYgb1Byb3BlcnR5LiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRhdGFbc1Byb3BlcnR5UGF0aF0gPSBvUGF5bG9hZFtzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9jaGVja0ZvclZhbGlkYXRpb25FcnJvcnMoLypvQ3JlYXRpb25Sb3dDb250ZXh0Ki8pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZXNvbHZlZENyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93IHx8IHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuSW5saW5lKSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMua2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZCA9IGZhbHNlOyAvLyBjdXJyZW50bHkgbm90IGZ1bGx5IHN1cHBvcnRlZFxuXHRcdFx0XHRcdC8vIGJ1c3kgaGFuZGxpbmcgc2hhbGwgYmUgZG9uZSBsb2NhbGx5IG9ubHlcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5idXN5TW9kZSA9IFwiTG9jYWxcIjtcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5idXN5SWQgPSBvVGFibGU/LmdldFBhcmVudCgpPy5nZXRUYWJsZURlZmluaXRpb24oKT8uYW5ub3RhdGlvbi5pZDtcblxuXHRcdFx0XHRcdC8vIHRha2UgY2FyZSBvbiBtZXNzYWdlIGhhbmRsaW5nLCBkcmFmdCBpbmRpY2F0b3IgKGluIGNhc2Ugb2YgZHJhZnQpXG5cdFx0XHRcdFx0Ly8gQXR0YWNoIHRoZSBjcmVhdGUgc2VudCBhbmQgY3JlYXRlIGNvbXBsZXRlZCBldmVudCB0byB0aGUgb2JqZWN0IHBhZ2UgYmluZGluZyBzbyB0aGF0IHdlIGNhbiByZWFjdFxuXHRcdFx0XHRcdHRoaXMuX2hhbmRsZUNyZWF0ZUV2ZW50cyhvTGlzdEJpbmRpbmcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sKSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrID0gdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlQ3JlYXRlO1xuXG5cdFx0XHRcdC8vIEluIGNhc2UgdGhlIGFwcGxpY2F0aW9uIHdhcyBjYWxsZWQgd2l0aCBwcmVmZXJyZWRNb2RlPWF1dG9DcmVhdGVXaXRoLCB3ZSB3YW50IHRvIHNraXAgdGhlXG5cdFx0XHRcdC8vIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2cgPSBvQXBwQ29tcG9uZW50LmdldFN0YXJ0dXBNb2RlKCkgPT09IFN0YXJ0dXBNb2RlLkF1dG9DcmVhdGU7XG5cblx0XHRcdFx0b0NyZWF0aW9uID0gdHJhbnNhY3Rpb25IZWxwZXIuY3JlYXRlRG9jdW1lbnQoXG5cdFx0XHRcdFx0b0xpc3RCaW5kaW5nLFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKSxcblx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHR0aGlzLmdldFZpZXcoKVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgb05hdmlnYXRpb247XG5cdFx0XHRzd2l0Y2ggKHJlc29sdmVkQ3JlYXRpb25Nb2RlKSB7XG5cdFx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLkRlZmVycmVkOlxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob0xpc3RCaW5kaW5nLCB7XG5cdFx0XHRcdFx0XHRiRGVmZXJyZWRDb250ZXh0OiB0cnVlLFxuXHRcdFx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRiRm9yY2VGb2N1czogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5Bc3luYzpcblx0XHRcdFx0XHRvTmF2aWdhdGlvbiA9IG9Sb3V0aW5nTGlzdGVuZXIubmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KG9MaXN0QmluZGluZywge1xuXHRcdFx0XHRcdFx0YXN5bmNDb250ZXh0OiBvQ3JlYXRpb24sXG5cdFx0XHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdGJGb3JjZUZvY3VzOiB0cnVlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLlN5bmM6XG5cdFx0XHRcdFx0bUFyZ3MgPSB7XG5cdFx0XHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdGJGb3JjZUZvY3VzOiB0cnVlXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kgfHwgbVBhcmFtZXRlcnMuY3JlYXRlQWN0aW9uKSB7XG5cdFx0XHRcdFx0XHRtQXJncy50cmFuc2llbnQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvTmF2aWdhdGlvbiA9IG9DcmVhdGlvbi50aGVuKGZ1bmN0aW9uIChvTmV3RG9jdW1lbnRDb250ZXh0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICghb05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjb3JlUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZVRvTWVzc2FnZVBhZ2UoXG5cdFx0XHRcdFx0XHRcdFx0Y29yZVJlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9EQVRBX1JFQ0VJVkVEX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlOiBjb3JlUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IGNvcmVSZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19FRElURkxPV19TQVBGRV9DUkVBVElPTl9GQUlMRURfREVTQ1JJUFRJT05cIilcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBJbiBjYXNlIHRoZSBTeW5jIGNyZWF0aW9uIHdhcyB0cmlnZ2VyZWQgZm9yIGEgZGVmZXJyZWQgY3JlYXRpb24sIHdlIGRvbid0IG5hdmlnYXRlIGZvcndhcmRcblx0XHRcdFx0XHRcdFx0Ly8gYXMgd2UncmUgYWxyZWFkeSBvbiB0aGUgY29ycmVzcG9uZGluZyBPYmplY3RQYWdlXG5cdFx0XHRcdFx0XHRcdHJldHVybiBtUGFyYW1ldGVycy5iRnJvbURlZmVycmVkXG5cdFx0XHRcdFx0XHRcdFx0PyBvUm91dGluZ0xpc3RlbmVyLm5hdmlnYXRlVG9Db250ZXh0KG9OZXdEb2N1bWVudENvbnRleHQsIG1BcmdzKVxuXHRcdFx0XHRcdFx0XHRcdDogb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob05ld0RvY3VtZW50Q29udGV4dCwgbUFyZ3MpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5JbmxpbmU6XG5cdFx0XHRcdFx0aGFuZGxlU2lkZUVmZmVjdHMob0xpc3RCaW5kaW5nLCBvQ3JlYXRpb24pO1xuXHRcdFx0XHRcdHRoaXMuX3N5bmNUYXNrKG9DcmVhdGlvbik7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93OlxuXHRcdFx0XHRcdC8vIHRoZSBjcmVhdGlvbiByb3cgc2hhbGwgYmUgY2xlYXJlZCBvbmNlIHRoZSB2YWxpZGF0aW9uIGNoZWNrIHdhcyBzdWNjZXNzZnVsIGFuZFxuXHRcdFx0XHRcdC8vIHRoZXJlZm9yZSB0aGUgUE9TVCBjYW4gYmUgc2VudCBhc3luYyB0byB0aGUgYmFja2VuZFxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvQ3JlYXRpb25Sb3dMaXN0QmluZGluZyA9IG9DcmVhdGlvblJvd0NvbnRleHQuZ2V0QmluZGluZygpO1xuXG5cdFx0XHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLmJTa2lwU2lkZUVmZmVjdHMpIHtcblx0XHRcdFx0XHRcdFx0aGFuZGxlU2lkZUVmZmVjdHMob0xpc3RCaW5kaW5nLCBvQ3JlYXRpb24pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRjb25zdCBvTmV3VHJhbnNpZW50Q29udGV4dCA9IG9DcmVhdGlvblJvd0xpc3RCaW5kaW5nLmNyZWF0ZSgpO1xuXHRcdFx0XHRcdFx0b0NyZWF0aW9uUm93LnNldEJpbmRpbmdDb250ZXh0KG9OZXdUcmFuc2llbnRDb250ZXh0KTtcblxuXHRcdFx0XHRcdFx0Ly8gdGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgY29uc29sZSBlcnJvcnMgVE8gYmUgY2hlY2tlZCB3aXRoIG1vZGVsIGNvbGxlYWd1ZXNcblx0XHRcdFx0XHRcdG9OZXdUcmFuc2llbnRDb250ZXh0LmNyZWF0ZWQoKS5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdExvZy50cmFjZShcInRyYW5zaWVudCBmYXN0IGNyZWF0aW9uIGNvbnRleHQgZGVsZXRlZFwiKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0b05hdmlnYXRpb24gPSBvQ3JlYXRpb25Sb3dDb250ZXh0LmRlbGV0ZShcIiRkaXJlY3RcIik7XG5cdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdC8vIFJlc2V0IGJ1c3kgaW5kaWNhdG9yIGFmdGVyIGEgdmFsaWRhdGlvbiBlcnJvclxuXHRcdFx0XHRcdFx0aWYgKEJ1c3lMb2NrZXIuaXNMb2NrZWQodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKSkpIHtcblx0XHRcdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJDcmVhdGlvblJvdyBuYXZpZ2F0aW9uIGVycm9yOiBcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0b05hdmlnYXRpb24gPSBQcm9taXNlLnJlamVjdChgVW5oYW5kbGVkIGNyZWF0aW9uTW9kZSAke3Jlc29sdmVkQ3JlYXRpb25Nb2RlfWApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0NyZWF0aW9uKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgYVBhcmFtcyA9IGF3YWl0IFByb21pc2UuYWxsKFtvQ3JlYXRpb24sIG9OYXZpZ2F0aW9uXSk7XG5cdFx0XHRcdFx0dGhpcy5fc2V0U3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyhzUHJvZ3JhbW1pbmdNb2RlbCwgb01vZGVsKTtcblxuXHRcdFx0XHRcdHRoaXMuX3NldEVkaXRNb2RlKEVkaXRNb2RlLkVkaXRhYmxlKTsgLy8gVGhlIGNyZWF0ZU1vZGUgZmxhZyB3aWxsIGJlIHNldCBpbiBJbnRlcm5hbEVkaXRGbG93I2NvbXB1dGVFZGl0TW9kZVxuXHRcdFx0XHRcdGlmICghb0xpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKSAmJiBzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kpIHtcblx0XHRcdFx0XHRcdC8vIFdvcmthcm91bmQgdG8gdGVsbCB0aGUgT1AgdGhhdCB3ZSd2ZSBjcmVhdGVkIGEgbmV3IG9iamVjdCBmcm9tIHRoZSBMUlxuXHRcdFx0XHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gb0xpc3RCaW5kaW5nLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRcdFx0XHRjb25zdCBtZXRhQ29udGV4dCA9IG1ldGFNb2RlbC5iaW5kQ29udGV4dChtZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0xpc3RCaW5kaW5nLmdldFBhdGgoKSkpO1xuXHRcdFx0XHRcdFx0Y29uc3QgZW50aXR5U2V0ID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFDb250ZXh0KS5zdGFydGluZ0VudGl0eVNldCBhcyBFbnRpdHlTZXQ7XG5cdFx0XHRcdFx0XHRjb25zdCBuZXdBY3Rpb24gPSBlbnRpdHlTZXQ/LmFubm90YXRpb25zLlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQ/Lk5ld0FjdGlvbjtcblx0XHRcdFx0XHRcdHRoaXMuX2dldEludGVybmFsTW9kZWwoKS5zZXRQcm9wZXJ0eShcIi9sYXN0SW52b2tlZEFjdGlvblwiLCBuZXdBY3Rpb24pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBvTmV3RG9jdW1lbnRDb250ZXh0ID0gYVBhcmFtc1swXTtcblx0XHRcdFx0XHRpZiAob05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHRcdFx0dGhpcy5fc2V0RG9jdW1lbnRNb2RpZmllZE9uQ3JlYXRlKG9MaXN0QmluZGluZyk7XG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkNyZWF0ZSwgb05ld0RvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdFx0XHRpZiAoTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQob01vZGVsLmdldE1ldGFNb2RlbCgpKSkge1xuXHRcdFx0XHRcdFx0XHQvLyBhY2NvcmRpbmcgdG8gVVggaW4gY2FzZSBvZiBlbmFibGVkIGNvbGxhYm9yYXRpb24gZHJhZnQgd2Ugc2hhcmUgdGhlIG9iamVjdCBpbW1lZGlhdGVseVxuXHRcdFx0XHRcdFx0XHRhd2FpdCBzaGFyZU9iamVjdChvTmV3RG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdFx0Ly8gVE9ETzogY3VycmVudGx5LCB0aGUgb25seSBlcnJvcnMgaGFuZGxlZCBoZXJlIGFyZSByYWlzZWQgYXMgc3RyaW5nIC0gc2hvdWxkIGJlIGNoYW5nZWQgdG8gRXJyb3Igb2JqZWN0c1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGVycm9yID09PSBDb25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nIHx8XG5cdFx0XHRcdFx0XHRlcnJvciA9PT0gQ29uc3RhbnRzLkFjdGlvbkV4ZWN1dGlvbkZhaWxlZCB8fFxuXHRcdFx0XHRcdFx0ZXJyb3IgPT09IENvbnN0YW50cy5DcmVhdGlvbkZhaWxlZFxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0Ly8gY3JlYXRpb24gaGFzIGJlZW4gY2FuY2VsbGVkIGJ5IHVzZXIgb3IgZmFpbGVkIGluIGJhY2tlbmQgPT4gaW4gY2FzZSB3ZSBoYXZlIG5hdmlnYXRlZCB0byB0cmFuc2llbnQgY29udGV4dCBiZWZvcmUsIG5hdmlnYXRlIGJhY2tcblx0XHRcdFx0XHRcdC8vIHRoZSBzd2l0Y2gtc3RhdGVtZW50IGFib3ZlIHNlZW1zIHRvIGluZGljYXRlIHRoYXQgdGhpcyBoYXBwZW5zIGluIGNyZWF0aW9uTW9kZXMgZGVmZXJyZWQgYW5kIGFzeW5jLiBCdXQgaW4gZmFjdCwgaW4gdGhlc2UgY2FzZXMgYWZ0ZXIgdGhlIG5hdmlnYXRpb24gZnJvbSByb3V0ZU1hdGNoZWQgaW4gT1AgY29tcG9uZW50XG5cdFx0XHRcdFx0XHQvLyBjcmVhdGVEZWZlcnJlZENvbnRleHQgaXMgdHJpZ2dlcmQsIHdoaWNoIGNhbGxzIHRoaXMgbWV0aG9kIChjcmVhdGVEb2N1bWVudCkgYWdhaW4gLSB0aGlzIHRpbWUgd2l0aCBjcmVhdGlvbk1vZGUgc3luYy4gVGhlcmVmb3JlLCBhbHNvIGluIHRoYXQgbW9kZSB3ZSBuZWVkIHRvIHRyaWdnZXIgYmFjayBuYXZpZ2F0aW9uLlxuXHRcdFx0XHRcdFx0Ly8gVGhlIG90aGVyIGNhc2VzIG1pZ2h0IHN0aWxsIGJlIG5lZWRlZCBpbiBjYXNlIHRoZSBuYXZpZ2F0aW9uIGZhaWxzLlxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlZENyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLlN5bmMgfHxcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZWRDcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5EZWZlcnJlZCB8fFxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlZENyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkFzeW5jXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0b1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZUJhY2tGcm9tVHJhbnNpZW50U3RhdGUoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aWYgKGJTaG91bGRCdXN5TG9jaykge1xuXHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvTG9ja09iamVjdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnU2F2ZScgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ1NhdmUnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdTYXZlJyBhY3Rpb24gaXMgc3RvcHBlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZVNhdmVcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIHNhdmVkLlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdG8gYmUgcmV0dXJuZWQgYnkgdGhlIG92ZXJyaWRkZW4gbWV0aG9kLiBJZiByZXNvbHZlZCwgdGhlICdTYXZlJyBhY3Rpb24gaXMgdHJpZ2dlcmVkLiBJZiByZWplY3RlZCwgdGhlICdTYXZlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I29uQmVmb3JlU2F2ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25CZWZvcmVTYXZlKF9tUGFyYW1ldGVycz86IHsgY29udGV4dD86IENvbnRleHQgfSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnQ3JlYXRlJyBhY3Rpb24uIFlvdSBjYW4gZXhlY3V0ZSBjdXN0b20gY29kaW5nIGluIHRoaXMgZnVuY3Rpb24uXG5cdCAqIFRoZSBmcmFtZXdvcmsgd2FpdHMgZm9yIHRoZSByZXR1cm5lZCBwcm9taXNlIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nIHRoZSAnQ3JlYXRlJyBhY3Rpb24uXG5cdCAqIElmIHlvdSByZWplY3QgdGhlIHByb21pc2UsIHRoZSAnQ3JlYXRlJyBhY3Rpb24gaXMgc3RvcHBlZC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycyBPYmplY3QgY29udGFpbmluZyB0aGUgcGFyYW1ldGVycyBwYXNzZWQgdG8gb25CZWZvcmVDcmVhdGVcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0UGF0aCBQYXRoIHBvaW50aW5nIHRvIHRoZSBjb250ZXh0IG9uIHdoaWNoIENyZWF0ZSBhY3Rpb24gaXMgdHJpZ2dlcmVkXG5cdCAqIEBwYXJhbSBfbVBhcmFtZXRlcnMuY3JlYXRlUGFyYW1ldGVycyBBcnJheSBvZiB2YWx1ZXMgdGhhdCBhcmUgZmlsbGVkIGluIHRoZSBBY3Rpb24gUGFyYW1ldGVyIERpYWxvZ1xuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdG8gYmUgcmV0dXJuZWQgYnkgdGhlIG92ZXJyaWRkZW4gbWV0aG9kLiBJZiByZXNvbHZlZCwgdGhlICdDcmVhdGUnIGFjdGlvbiBpcyB0cmlnZ2VyZWQuIElmIHJlamVjdGVkLCB0aGUgJ0NyZWF0ZScgYWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQuXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjb25CZWZvcmVDcmVhdGVcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45OC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQmVmb3JlQ3JlYXRlKF9tUGFyYW1ldGVycz86IHsgY29udGV4dFBhdGg/OiBzdHJpbmc7IGNyZWF0ZVBhcmFtZXRlcnM/OiBhbnlbXSB9KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byBpbnRlcmNlcHQgdGhlICdFZGl0JyBhY3Rpb24uIFlvdSBjYW4gZXhlY3V0ZSBjdXN0b20gY29kaW5nIGluIHRoaXMgZnVuY3Rpb24uXG5cdCAqIFRoZSBmcmFtZXdvcmsgd2FpdHMgZm9yIHRoZSByZXR1cm5lZCBwcm9taXNlIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nIHRoZSAnRWRpdCcgYWN0aW9uLlxuXHQgKiBJZiB5b3UgcmVqZWN0IHRoZSBwcm9taXNlLCB0aGUgJ0VkaXQnIGFjdGlvbiBpcyBzdG9wcGVkIGFuZCB0aGUgdXNlciBzdGF5cyBpbiBkaXNwbGF5IG1vZGUuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBfbVBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBhcmFtZXRlcnMgcGFzc2VkIHRvIG9uQmVmb3JlRWRpdFxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzLmNvbnRleHQgUGFnZSBjb250ZXh0IHRoYXQgaXMgZ29pbmcgdG8gYmUgZWRpdGVkLlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdG8gYmUgcmV0dXJuZWQgYnkgdGhlIG92ZXJyaWRkZW4gbWV0aG9kLiBJZiByZXNvbHZlZCwgdGhlICdFZGl0JyBhY3Rpb24gaXMgdHJpZ2dlcmVkLiBJZiByZWplY3RlZCwgdGhlICdFZGl0JyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZGlzcGxheSBtb2RlLlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I29uQmVmb3JlRWRpdFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjk4LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25CZWZvcmVFZGl0KF9tUGFyYW1ldGVycz86IHsgY29udGV4dD86IENvbnRleHQgfSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnRGlzY2FyZCcgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ0Rpc2NhcmQnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdEaXNjYXJkJyBhY3Rpb24gaXMgc3RvcHBlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZURpc2NhcmRcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIGRpc2NhcmRlZC5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRvIGJlIHJldHVybmVkIGJ5IHRoZSBvdmVycmlkZGVuIG1ldGhvZC4gSWYgcmVzb2x2ZWQsIHRoZSAnRGlzY2FyZCcgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRGlzY2FyZCcgYWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQgYW5kIHRoZSB1c2VyIHN0YXlzIGluIGVkaXQgbW9kZS5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZURpc2NhcmRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45OC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQmVmb3JlRGlzY2FyZChfbVBhcmFtZXRlcnM/OiB7IGNvbnRleHQ/OiBDb250ZXh0IH0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIHRvIGludGVyY2VwdCB0aGUgJ0RlbGV0ZScgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ0RlbGV0ZScgYWN0aW9uLlxuXHQgKiBJZiB5b3UgcmVqZWN0IHRoZSBwcm9taXNlLCB0aGUgJ0RlbGV0ZScgYWN0aW9uIGlzIHN0b3BwZWQuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBfbVBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBhcmFtZXRlcnMgcGFzc2VkIHRvIG9uQmVmb3JlRGVsZXRlXG5cdCAqIEBwYXJhbSBfbVBhcmFtZXRlcnMuY29udGV4dHMgQW4gYXJyYXkgb2YgY29udGV4dHMgdGhhdCBhcmUgZ29pbmcgdG8gYmUgZGVsZXRlZFxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdG8gYmUgcmV0dXJuZWQgYnkgdGhlIG92ZXJyaWRkZW4gbWV0aG9kLiBJZiByZXNvbHZlZCwgdGhlICdEZWxldGUnIGFjdGlvbiBpcyB0cmlnZ2VyZWQuIElmIHJlamVjdGVkLCB0aGUgJ0RlbGV0ZScgYWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQuXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjb25CZWZvcmVEZWxldGVcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45OC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQmVmb3JlRGVsZXRlKF9tUGFyYW1ldGVycz86IHsgY29udGV4dHM/OiBDb250ZXh0W10gfSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHQvLyBJbnRlcm5hbCBvbmx5IHBhcmFtcyAtLS1cblx0Ly8gQHBhcmFtIHtib29sZWFufSBtUGFyYW1ldGVycy5iRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciBJbmRpY2F0ZXMgd2hldGhlciBTaWRlRWZmZWN0cyBuZWVkIHRvIGJlIGlnbm9yZWQgd2hlbiB1c2VyIGNsaWNrcyBvbiBTYXZlIGR1cmluZyBhbiBJbmxpbmUgY3JlYXRpb25cblx0Ly8gQHBhcmFtIHtvYmplY3R9IG1QYXJhbWV0ZXJzLmJpbmRpbmdzIExpc3QgYmluZGluZ3Mgb2YgdGhlIHRhYmxlcyBpbiB0aGUgdmlldy5cblx0Ly8gQm90aCBvZiB0aGUgYWJvdmUgcGFyYW1ldGVycyBhcmUgZm9yIHRoZSBzYW1lIHB1cnBvc2UuIFVzZXIgY2FuIGVudGVyIHNvbWUgaW5mb3JtYXRpb24gaW4gdGhlIGNyZWF0aW9uIHJvdyhzKSBidXQgZG9lcyBub3QgJ0FkZCByb3cnLCBpbnN0ZWFkIGNsaWNrcyBTYXZlLlxuXHQvLyBUaGVyZSBjYW4gYmUgbW9yZSB0aGFuIG9uZSBpbiB0aGUgdmlldy5cblxuXHQvKipcblx0ICogU2F2ZXMgYSBuZXcgZG9jdW1lbnQgYWZ0ZXIgY2hlY2tpbmcgaXQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgIENvbnRleHQgb2YgdGhlIGVkaXRhYmxlIGRvY3VtZW50XG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBQUklWQVRFXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSBzYXZlIGlzIGNvbXBsZXRlXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNzYXZlRG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgc2F2ZURvY3VtZW50KG9Db250ZXh0OiBDb250ZXh0LCBtUGFyYW1ldGVyczogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0bVBhcmFtZXRlcnMgPSBtUGFyYW1ldGVycyB8fCB7fTtcblx0XHRjb25zdCBiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciA9IG1QYXJhbWV0ZXJzLmJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIHx8IHVuZGVmaW5lZDtcblx0XHRjb25zdCBiRHJhZnROYXZpZ2F0aW9uID0gdHJ1ZTtcblx0XHRjb25zdCB0cmFuc2FjdGlvbkhlbHBlciA9IHRoaXMuX2dldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gdGhpcy5fZ2V0UmVzb3VyY2VCdW5kbGUoKTtcblx0XHRjb25zdCBhQmluZGluZ3MgPSBtUGFyYW1ldGVycy5iaW5kaW5ncztcblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9zeW5jVGFzaygpO1xuXHRcdFx0YXdhaXQgdGhpcy5fc3VibWl0T3BlbkNoYW5nZXMob0NvbnRleHQpO1xuXHRcdFx0YXdhaXQgdGhpcy5fY2hlY2tGb3JWYWxpZGF0aW9uRXJyb3JzKCk7XG5cdFx0XHRhd2FpdCB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVTYXZlKHsgY29udGV4dDogb0NvbnRleHQgfSk7XG5cblx0XHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5fZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCk7XG5cdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXHRcdFx0bGV0IHNpYmxpbmdJbmZvOiBTaWJsaW5nSW5mb3JtYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kgfHwgb0NvbnRleHQuZ2V0UHJvcGVydHkoXCJIYXNBY3RpdmVFbnRpdHlcIikpICYmXG5cdFx0XHRcdG9Sb290Vmlld0NvbnRyb2xsZXIuaXNGY2xFbmFibGVkKClcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBObyBuZWVkIHRvIHRyeSB0byBnZXQgcmlnaHRtb3N0IGNvbnRleHQgaW4gY2FzZSBvZiBhIG5ldyBvYmplY3Rcblx0XHRcdFx0c2libGluZ0luZm8gPSBhd2FpdCB0aGlzLl9jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKFxuXHRcdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRcdG9Sb290Vmlld0NvbnRyb2xsZXIuZ2V0UmlnaHRtb3N0Q29udGV4dCgpLFxuXHRcdFx0XHRcdHNQcm9ncmFtbWluZ01vZGVsLFxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgYWN0aXZlRG9jdW1lbnRDb250ZXh0ID0gYXdhaXQgdHJhbnNhY3Rpb25IZWxwZXIuc2F2ZURvY3VtZW50KFxuXHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvcixcblx0XHRcdFx0YUJpbmRpbmdzLFxuXHRcdFx0XHR0aGlzLl9nZXRNZXNzYWdlSGFuZGxlcigpLFxuXHRcdFx0XHR0aGlzLl9nZXRDcmVhdGlvbk1vZGUoKVxuXHRcdFx0KTtcblx0XHRcdHRoaXMuX3JlbW92ZVN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMoc1Byb2dyYW1taW5nTW9kZWwpO1xuXG5cdFx0XHR0aGlzLl9zZW5kQWN0aXZpdHkoQWN0aXZpdHkuQWN0aXZhdGUsIGFjdGl2ZURvY3VtZW50Q29udGV4dCk7XG5cdFx0XHR0aGlzLl90cmlnZ2VyQ29uZmlndXJlZFN1cnZleShTdGFuZGFyZEFjdGlvbnMuc2F2ZSwgVHJpZ2dlclR5cGUuc3RhbmRhcmRBY3Rpb24pO1xuXG5cdFx0XHR0aGlzLl9zZXREb2N1bWVudE1vZGlmaWVkKGZhbHNlKTtcblx0XHRcdHRoaXMuX3NldEVkaXRNb2RlKEVkaXRNb2RlLkRpc3BsYXksIGZhbHNlKTtcblx0XHRcdHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VEaWFsb2coKTtcblxuXHRcdFx0aWYgKGFjdGl2ZURvY3VtZW50Q29udGV4dCAhPT0gb0NvbnRleHQpIHtcblx0XHRcdFx0bGV0IGNvbnRleHRUb05hdmlnYXRlID0gYWN0aXZlRG9jdW1lbnRDb250ZXh0O1xuXHRcdFx0XHRpZiAob1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdHNpYmxpbmdJbmZvID0gc2libGluZ0luZm8gPz8gdGhpcy5fY3JlYXRlU2libGluZ0luZm8ob0NvbnRleHQsIGFjdGl2ZURvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdFx0XHRcdGlmIChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0LmdldFBhdGgoKSAhPT0gYWN0aXZlRG9jdW1lbnRDb250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0XHRcdFx0Y29udGV4dFRvTmF2aWdhdGUgPSBzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoY29udGV4dFRvTmF2aWdhdGUsIGZhbHNlLCBmYWxzZSwgYkRyYWZ0TmF2aWdhdGlvbiwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdGlmICghKG9FcnJvciAmJiBvRXJyb3IuY2FuY2VsZWQpKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHNhdmluZyB0aGUgZG9jdW1lbnRcIiwgb0Vycm9yKTtcblx0XHRcdH1cblx0XHRcdHRocm93IG9FcnJvcjtcblx0XHR9XG5cdH1cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIHRvZ2dsZURyYWZ0QWN0aXZlKG9Db250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb0NvbnRleHREYXRhID0gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0bGV0IGJFZGl0YWJsZTogYm9vbGVhbjtcblx0XHRjb25zdCBiSXNEcmFmdCA9IG9Db250ZXh0ICYmIHRoaXMuX2dldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQpID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0O1xuXG5cdFx0Ly90b2dnbGUgYmV0d2VlbiBkcmFmdCBhbmQgYWN0aXZlIGRvY3VtZW50IGlzIG9ubHkgYXZhaWxhYmxlIGZvciBlZGl0IGRyYWZ0cyBhbmQgYWN0aXZlIGRvY3VtZW50cyB3aXRoIGRyYWZ0KVxuXHRcdGlmIChcblx0XHRcdCFiSXNEcmFmdCB8fFxuXHRcdFx0IShcblx0XHRcdFx0KCFvQ29udGV4dERhdGEuSXNBY3RpdmVFbnRpdHkgJiYgb0NvbnRleHREYXRhLkhhc0FjdGl2ZUVudGl0eSkgfHxcblx0XHRcdFx0KG9Db250ZXh0RGF0YS5Jc0FjdGl2ZUVudGl0eSAmJiBvQ29udGV4dERhdGEuSGFzRHJhZnRFbnRpdHkpXG5cdFx0XHQpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCFvQ29udGV4dERhdGEuSXNBY3RpdmVFbnRpdHkgJiYgb0NvbnRleHREYXRhLkhhc0FjdGl2ZUVudGl0eSkge1xuXHRcdFx0Ly9zdGFydCBQb2ludDogZWRpdCBkcmFmdFxuXHRcdFx0YkVkaXRhYmxlID0gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHN0YXJ0IHBvaW50IGFjdGl2ZSBkb2N1bWVudFxuXHRcdFx0YkVkaXRhYmxlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb1Jvb3RWaWV3Q29udHJvbGxlciA9IHRoaXMuX2dldFJvb3RWaWV3Q29udHJvbGxlcigpIGFzIGFueTtcblx0XHRcdGNvbnN0IG9SaWdodG1vc3RDb250ZXh0ID0gb1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSA/IG9Sb290Vmlld0NvbnRyb2xsZXIuZ2V0UmlnaHRtb3N0Q29udGV4dCgpIDogb0NvbnRleHQ7XG5cdFx0XHRjb25zdCBzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24ob0NvbnRleHQsIG9SaWdodG1vc3RDb250ZXh0LCBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0LCBmYWxzZSk7XG5cdFx0XHRpZiAoc2libGluZ0luZm8pIHtcblx0XHRcdFx0dGhpcy5fc2V0RWRpdE1vZGUoYkVkaXRhYmxlID8gRWRpdE1vZGUuRWRpdGFibGUgOiBFZGl0TW9kZS5EaXNwbGF5LCBmYWxzZSk7IC8vc3dpdGNoIHRvIGVkaXQgbW9kZSBvbmx5IGlmIGEgZHJhZnQgaXMgYXZhaWxhYmxlXG5cblx0XHRcdFx0aWYgKG9Sb290Vmlld0NvbnRyb2xsZXIuaXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRjb25zdCBsYXN0U2VtYW50aWNNYXBwaW5nID0gdGhpcy5fZ2V0U2VtYW50aWNNYXBwaW5nKCk7XG5cdFx0XHRcdFx0aWYgKGxhc3RTZW1hbnRpY01hcHBpbmc/LnRlY2huaWNhbFBhdGggPT09IG9Db250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgdGFyZ2V0UGF0aCA9IHNpYmxpbmdJbmZvLnBhdGhNYXBwaW5nW3NpYmxpbmdJbmZvLnBhdGhNYXBwaW5nLmxlbmd0aCAtIDFdLm5ld1BhdGg7XG5cdFx0XHRcdFx0XHRzaWJsaW5nSW5mby5wYXRoTWFwcGluZy5wdXNoKHsgb2xkUGF0aDogbGFzdFNlbWFudGljTWFwcGluZy5zZW1hbnRpY1BhdGgsIG5ld1BhdGg6IHRhcmdldFBhdGggfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZVBhdGhzSW5IaXN0b3J5KHNpYmxpbmdJbmZvLnBhdGhNYXBwaW5nKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoc2libGluZ0luZm8udGFyZ2V0Q29udGV4dCwgYkVkaXRhYmxlLCB0cnVlLCB0cnVlLCB0cnVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcIkVycm9yIGluIEVkaXRGbG93LnRvZ2dsZURyYWZ0QWN0aXZlIC0gQ2Fubm90IGZpbmQgc2libGluZ1wiKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChgRXJyb3IgaW4gRWRpdEZsb3cudG9nZ2xlRHJhZnRBY3RpdmU6JHtvRXJyb3J9YCBhcyBhbnkpO1xuXHRcdH1cblx0fVxuXG5cdC8vIEludGVybmFsIG9ubHkgcGFyYW1zIC0tLVxuXHQvLyBAcGFyYW0ge3NhcC5tLkJ1dHRvbn0gbVBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uIC0gQ3VycmVudGx5IHRoaXMgaXMgcGFzc2VkIGFzIGNhbmNlbEJ1dHRvbiBpbnRlcm5hbGx5IChyZXBsYWNlZCBieSBtUGFyYW1ldGVycy5jb250cm9sIGluIHRoZSBKU0RvYyBiZWxvdykuIEN1cnJlbnRseSBpdCBpcyBhbHNvIG1hbmRhdG9yeS5cblx0Ly8gUGxhbiAtIFRoaXMgc2hvdWxkIG5vdCBiZSBtYW5kYXRvcnkuIElmIG5vdCBwcm92aWRlZCwgd2Ugc2hvdWxkIGhhdmUgYSBkZWZhdWx0IHRoYXQgY2FuIGFjdCBhcyByZWZlcmVuY2UgY29udHJvbCBmb3IgdGhlIGRpc2NhcmQgcG9wb3ZlciBPUiB3ZSBjYW4gc2hvdyBhIGRpYWxvZyBpbnN0ZWFkIG9mIGEgcG9wb3Zlci5cblxuXHQvKipcblx0ICogRGlzY2FyZCB0aGUgZWRpdGFibGUgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgIENvbnRleHQgb2YgdGhlIGVkaXRhYmxlIGRvY3VtZW50XG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBDYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5jb250cm9sIFRoaXMgaXMgdGhlIGNvbnRyb2wgdXNlZCB0byBvcGVuIHRoZSBkaXNjYXJkIHBvcG92ZXJcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLnNraXBEaXNjYXJkUG9wb3ZlciBPcHRpb25hbCwgc3VwcmVzc2VzIHRoZSBkaXNjYXJkIHBvcG92ZXIgYW5kIGFsbG93cyBjdXN0b20gaGFuZGxpbmdcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIGVkaXRhYmxlIGRvY3VtZW50IGhhcyBiZWVuIGRpc2NhcmRlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjY2FuY2VsRG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgY2FuY2VsRG9jdW1lbnQob0NvbnRleHQ6IENvbnRleHQsIG1QYXJhbWV0ZXJzOiB7IGNvbnRyb2w6IG9iamVjdDsgc2tpcERpc2NhcmRQb3BvdmVyPzogYm9vbGVhbiB9KTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCB0cmFuc2FjdGlvbkhlbHBlciA9IHRoaXMuX2dldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gdGhpcy5fZ2V0UmVzb3VyY2VCdW5kbGUoKTtcblx0XHRjb25zdCBtSW5QYXJhbWV0ZXJzOiBhbnkgPSBtUGFyYW1ldGVycztcblx0XHRsZXQgc2libGluZ0luZm86IFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZDtcblxuXHRcdG1JblBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uID0gbVBhcmFtZXRlcnMuY29udHJvbCB8fCBtSW5QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbjtcblx0XHRtSW5QYXJhbWV0ZXJzLmJlZm9yZUNhbmNlbENhbGxCYWNrID0gdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlRGlzY2FyZDtcblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9zeW5jVGFzaygpO1xuXHRcdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLl9nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblx0XHRcdGlmICgoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5IHx8IG9Db250ZXh0LmdldFByb3BlcnR5KFwiSGFzQWN0aXZlRW50aXR5XCIpKSAmJiB0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXG5cdFx0XHRcdC8vIE5vIG5lZWQgdG8gdHJ5IHRvIGdldCByaWdodG1vc3QgY29udGV4dCBpbiBjYXNlIG9mIGEgbmV3IG9iamVjdFxuXHRcdFx0XHRzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24oXG5cdFx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdFx0b1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0KCksXG5cdFx0XHRcdFx0c1Byb2dyYW1taW5nTW9kZWwsXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBjYW5jZWxSZXN1bHQgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5jYW5jZWxEb2N1bWVudChcblx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdG1JblBhcmFtZXRlcnMsXG5cdFx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKSxcblx0XHRcdFx0dGhpcy5fZ2V0Q3JlYXRpb25Nb2RlKCksXG5cdFx0XHRcdHRoaXMuX2lzRG9jdW1lbnRNb2RpZmllZCgpXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgYkRyYWZ0TmF2aWdhdGlvbiA9IHRydWU7XG5cdFx0XHR0aGlzLl9yZW1vdmVTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzKHNQcm9ncmFtbWluZ01vZGVsKTtcblxuXHRcdFx0dGhpcy5fc2V0RWRpdE1vZGUoRWRpdE1vZGUuRGlzcGxheSwgZmFsc2UpO1xuXHRcdFx0dGhpcy5fc2V0RG9jdW1lbnRNb2RpZmllZChmYWxzZSk7XG5cdFx0XHR0aGlzLl9zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHQvLyB3ZSBmb3JjZSB0aGUgZWRpdCBzdGF0ZSBldmVuIGZvciBGQ0wgYmVjYXVzZSB0aGUgZHJhZnQgZGlzY2FyZCBtaWdodCBub3QgYmUgaW1wbGVtZW50ZWRcblx0XHRcdC8vIGFuZCB3ZSBtYXkganVzdCBkZWxldGUgdGhlIGRyYWZ0XG5cdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblxuXHRcdFx0aWYgKCFjYW5jZWxSZXN1bHQpIHtcblx0XHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkRpc2NhcmQsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdC8vaW4gY2FzZSBvZiBhIG5ldyBkb2N1bWVudCwgbm8gYWN0aXZlQ29udGV4dCBpcyByZXR1cm5lZCAtLT4gbmF2aWdhdGUgYmFjay5cblx0XHRcdFx0aWYgKCFtSW5QYXJhbWV0ZXJzLnNraXBCYWNrTmF2aWdhdGlvbikge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMuX2dldFJvdXRpbmdMaXN0ZW5lcigpLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb0FjdGl2ZURvY3VtZW50Q29udGV4dCA9IGNhbmNlbFJlc3VsdCBhcyBDb250ZXh0O1xuXHRcdFx0XHR0aGlzLl9zZW5kQWN0aXZpdHkoQWN0aXZpdHkuRGlzY2FyZCwgb0FjdGl2ZURvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdGxldCBjb250ZXh0VG9OYXZpZ2F0ZSA9IG9BY3RpdmVEb2N1bWVudENvbnRleHQ7XG5cdFx0XHRcdGlmICh0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdHNpYmxpbmdJbmZvID0gc2libGluZ0luZm8gPz8gdGhpcy5fY3JlYXRlU2libGluZ0luZm8ob0NvbnRleHQsIG9BY3RpdmVEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZVBhdGhzSW5IaXN0b3J5KHNpYmxpbmdJbmZvLnBhdGhNYXBwaW5nKTtcblx0XHRcdFx0XHRpZiAoc2libGluZ0luZm8udGFyZ2V0Q29udGV4dC5nZXRQYXRoKCkgIT09IG9BY3RpdmVEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0VG9OYXZpZ2F0ZSA9IHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHRcdFx0Ly8gV2UgbmVlZCB0byBsb2FkIHRoZSBzZW1hbnRpYyBrZXlzIG9mIHRoZSBhY3RpdmUgY29udGV4dCwgYXMgd2UgbmVlZCB0aGVtXG5cdFx0XHRcdFx0Ly8gZm9yIHRoZSBuYXZpZ2F0aW9uXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5fZmV0Y2hTZW1hbnRpY0tleVZhbHVlcyhvQWN0aXZlRG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHQvLyBXZSBmb3JjZSB0aGUgcmVjcmVhdGlvbiBvZiB0aGUgY29udGV4dCwgc28gdGhhdCBpdCdzIGNyZWF0ZWQgYW5kIGJvdW5kIGluIHRoZSBzYW1lIG1pY3JvdGFzayxcblx0XHRcdFx0XHQvLyBzbyB0aGF0IGFsbCBwcm9wZXJ0aWVzIGFyZSBsb2FkZWQgdG9nZXRoZXIgYnkgYXV0b0V4cGFuZFNlbGVjdCwgc28gdGhhdCB3aGVuIHN3aXRjaGluZyBiYWNrIHRvIEVkaXQgbW9kZVxuXHRcdFx0XHRcdC8vICQkaW5oZXJpdEV4cGFuZFNlbGVjdCB0YWtlcyBhbGwgbG9hZGVkIHByb3BlcnRpZXMgaW50byBhY2NvdW50IChCQ1AgMjA3MDQ2MjI2NSlcblx0XHRcdFx0XHRpZiAoIW1JblBhcmFtZXRlcnMuc2tpcEJpbmRpbmdUb1ZpZXcpIHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoY29udGV4dFRvTmF2aWdhdGUsIGZhbHNlLCB0cnVlLCBiRHJhZnROYXZpZ2F0aW9uLCB0cnVlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9BY3RpdmVEb2N1bWVudENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vYWN0aXZlIGNvbnRleHQgaXMgcmV0dXJuZWQgaW4gY2FzZSBvZiBjYW5jZWwgb2YgZXhpc3RpbmcgZG9jdW1lbnRcblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVOZXdDb250ZXh0KGNvbnRleHRUb05hdmlnYXRlLCBmYWxzZSwgZmFsc2UsIGJEcmFmdE5hdmlnYXRpb24sIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBkaXNjYXJkaW5nIHRoZSBkb2N1bWVudFwiLCBvRXJyb3IgYXMgYW55KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgY29udGV4dCBjb3JyZXNwb25kcyB0byBhIGRyYWZ0IHJvb3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBjb250ZXh0IHRvIGNoZWNrXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGNvbnRleHQgcG9pbnRzIHRvIGEgZHJhZnQgcm9vdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJvdGVjdGVkIGlzRHJhZnRSb290KGNvbnRleHQ6IENvbnRleHQpOiBib29sZWFuIHtcblx0XHRjb25zdCBtZXRhTW9kZWwgPSBjb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3QgbWV0YUNvbnRleHQgPSBtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQoY29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdHJldHVybiBNb2RlbEhlbHBlci5pc0RyYWZ0Um9vdChnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMobWV0YUNvbnRleHQpLnRhcmdldEVudGl0eVNldCk7XG5cdH1cblxuXHQvLyBJbnRlcm5hbCBvbmx5IHBhcmFtcyAtLS1cblx0Ly8gQHBhcmFtIHtzdHJpbmd9IG1QYXJhbWV0ZXJzLmVudGl0eVNldE5hbWUgTmFtZSBvZiB0aGUgRW50aXR5U2V0IHRvIHdoaWNoIHRoZSBvYmplY3QgYmVsb25nc1xuXG5cdC8qKlxuXHQgKiBEZWxldGVzIHRoZSBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQ29udGV4dCAgQ29udGV4dCBvZiB0aGUgZG9jdW1lbnRcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMgQ2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy50aXRsZSBUaXRsZSBvZiB0aGUgb2JqZWN0IGJlaW5nIGRlbGV0ZWRcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuZGVzY3JpcHRpb24gRGVzY3JpcHRpb24gb2YgdGhlIG9iamVjdCBiZWluZyBkZWxldGVkXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSBkb2N1bWVudCBoYXMgYmVlbiBkZWxldGVkXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNkZWxldGVEb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBkZWxldGVEb2N1bWVudChvQ29udGV4dDogQ29udGV4dCwgbUluUGFyYW1ldGVyczogeyB0aXRsZTogc3RyaW5nOyBkZXNjcmlwdGlvbjogc3RyaW5nIH0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHRsZXQgbVBhcmFtZXRlcnM6IGFueSA9IG1JblBhcmFtZXRlcnM7XG5cdFx0aWYgKCFtUGFyYW1ldGVycykge1xuXHRcdFx0bVBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdGJGaW5kQWN0aXZlQ29udGV4dHM6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtUGFyYW1ldGVycy5iRmluZEFjdGl2ZUNvbnRleHRzID0gZmFsc2U7XG5cdFx0fVxuXHRcdG1QYXJhbWV0ZXJzLmJlZm9yZURlbGV0ZUNhbGxCYWNrID0gdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlRGVsZXRlO1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHRoaXMuX2lzRmNsRW5hYmxlZCgpICYmXG5cdFx0XHRcdHRoaXMuaXNEcmFmdFJvb3Qob0NvbnRleHQpICYmXG5cdFx0XHRcdG9Db250ZXh0LmdldEluZGV4KCkgPT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0XHRvQ29udGV4dC5nZXRQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpID09PSB0cnVlICYmXG5cdFx0XHRcdG9Db250ZXh0LmdldFByb3BlcnR5KFwiSGFzRHJhZnRFbnRpdHlcIikgPT09IHRydWVcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBEZWxldGluZyBhbiBhY3RpdmUgZW50aXR5IHdoaWNoIGhhcyBhIGRyYWZ0IHRoYXQgY291bGQgcG90ZW50aWFsbHkgYmUgZGlzcGxheWVkIGluIHRoZSBMaXN0UmVwb3J0IChGQ0wgY2FzZSlcblx0XHRcdFx0Ly8gLS0+IG5lZWQgdG8gcmVtb3ZlIHRoZSBkcmFmdCBmcm9tIHRoZSBMUiBhbmQgcmVwbGFjZSBpdCB3aXRoIHRoZSBhY3RpdmUgdmVyc2lvbiwgc28gdGhhdCB0aGUgTGlzdEJpbmRpbmcgaXMgcHJvcGVybHkgcmVmcmVzaGVkXG5cdFx0XHRcdC8vIFRoZSBjb25kaXRpb24gJ29Db250ZXh0LmdldEluZGV4KCkgPT09IHVuZGVmaW5lZCcgbWFrZXMgc3VyZSB0aGUgYWN0aXZlIHZlcnNpb24gaXNuJ3QgYWxyZWFkeSBkaXNwbGF5ZWQgaW4gdGhlIExSXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmJlZm9yZURlbGV0ZUNhbGxCYWNrID0gYXN5bmMgKHBhcmFtZXRlcnM/OiB7IGNvbnRleHRzPzogQ29udGV4dFtdIH0pID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVEZWxldGUocGFyYW1ldGVycyk7XG5cblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3QgbW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc2libGluZ0NvbnRleHQgPSBtb2RlbC5iaW5kQ29udGV4dChgJHtvQ29udGV4dC5nZXRQYXRoKCl9L1NpYmxpbmdFbnRpdHlgKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdFx0XHRcdGNvbnN0IGRyYWZ0UGF0aCA9IGF3YWl0IHNpYmxpbmdDb250ZXh0LnJlcXVlc3RDYW5vbmljYWxQYXRoKCk7XG5cdFx0XHRcdFx0XHRjb25zdCBkcmFmdENvbnRleHRUb1JlbW92ZSA9IG1vZGVsLmdldEtlZXBBbGl2ZUNvbnRleHQoZHJhZnRQYXRoKTtcblx0XHRcdFx0XHRcdGRyYWZ0Q29udGV4dFRvUmVtb3ZlLnJlcGxhY2VXaXRoKG9Db250ZXh0KTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVwbGFjaW5nIHRoZSBkcmFmdCBpbnN0YW5jZSBpbiB0aGUgTFIgT0RMQlwiLCBlcnJvciBhcyBhbnkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblx0XHRcdH1cblxuXHRcdFx0YXdhaXQgdGhpcy5fZGVsZXRlRG9jdW1lbnRUcmFuc2FjdGlvbihvQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXG5cdFx0XHQvLyBTaW5nbGUgb2JqZXQgZGVsZXRpb24gaXMgdHJpZ2dlcmVkIGZyb20gYW4gT1AgaGVhZGVyIGJ1dHRvbiAobm90IGZyb20gYSBsaXN0KVxuXHRcdFx0Ly8gLS0+IE1hcmsgVUkgZGlydHkgYW5kIG5hdmlnYXRlIGJhY2sgdG8gZGlzbWlzcyB0aGUgT1Bcblx0XHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9zZW5kQWN0aXZpdHkoQWN0aXZpdHkuRGVsZXRlLCBvQ29udGV4dCk7XG5cblx0XHRcdC8vIEFmdGVyIGRlbGV0ZSBpcyBzdWNjZXNzZnVsbCwgd2UgbmVlZCB0byBkZXRhY2ggdGhlIHNldEJhY2tOYXZpZ2F0aW9uIE1ldGhvZHNcblx0XHRcdGlmIChvQXBwQ29tcG9uZW50KSB7XG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvQXBwQ29tcG9uZW50Py5nZXRTdGFydHVwTW9kZSgpID09PSBTdGFydHVwTW9kZS5EZWVwbGluayAmJiAhdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0Ly8gSW4gY2FzZSB0aGUgYXBwIGhhcyBiZWVuIGxhdW5jaGVkIHdpdGggc2VtYW50aWMga2V5cywgZGVsZXRpbmcgdGhlIG9iamVjdCB3ZSd2ZSBsYW5kZWQgb24gc2hhbGwgbmF2aWdhdGUgYmFja1xuXHRcdFx0XHQvLyB0byB0aGUgYXBwIHdlIGNhbWUgZnJvbSAoZXhjZXB0IGZvciBGQ0wsIHdoZXJlIHdlIG5hdmlnYXRlIHRvIExSIGFzIHVzdWFsKVxuXHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuZXhpdEZyb21BcHAoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX2dldFJvdXRpbmdMaXN0ZW5lcigpLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0KTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGhlIGRvY3VtZW50XCIsIGVycm9yIGFzIGFueSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFN1Ym1pdCB0aGUgY3VycmVudCBzZXQgb2YgY2hhbmdlcyBhbmQgbmF2aWdhdGUgYmFjay5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQ29udGV4dCAgQ29udGV4dCBvZiB0aGUgZG9jdW1lbnRcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIHRoZSBjaGFuZ2VzIGhhdmUgYmVlbiBzYXZlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjYXBwbHlEb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBhcHBseURvY3VtZW50KG9Db250ZXh0OiBvYmplY3QpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvTG9ja09iamVjdCA9IHRoaXMuX2dldEdsb2JhbFVJTW9kZWwoKTtcblx0XHRCdXN5TG9ja2VyLmxvY2sob0xvY2tPYmplY3QpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuX3N5bmNUYXNrKCk7XG5cdFx0XHRhd2FpdCB0aGlzLl9zdWJtaXRPcGVuQ2hhbmdlcyhvQ29udGV4dCk7XG5cdFx0XHRhd2FpdCB0aGlzLl9jaGVja0ZvclZhbGlkYXRpb25FcnJvcnMoKTtcblx0XHRcdGF3YWl0IHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHRcdGF3YWl0IHRoaXMuX2dldFJvdXRpbmdMaXN0ZW5lcigpLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0KTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aWYgKEJ1c3lMb2NrZXIuaXNMb2NrZWQob0xvY2tPYmplY3QpKSB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBJbnRlcm5hbCBvbmx5IHBhcmFtcyAtLS1cblx0Ly8gQHBhcmFtIHtib29sZWFufSBbbVBhcmFtZXRlcnMuYlN0YXRpY0FjdGlvbl0gQm9vbGVhbiB2YWx1ZSBmb3Igc3RhdGljIGFjdGlvbiwgdW5kZWZpbmVkIGZvciBvdGhlciBhY3Rpb25zXG5cdC8vIEBwYXJhbSB7Ym9vbGVhbn0gW21QYXJhbWV0ZXJzLmlzTmF2aWdhYmxlXSBCb29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciBuYXZpZ2F0aW9uIGlzIHJlcXVpcmVkIGFmdGVyIHRoZSBhY3Rpb24gaGFzIGJlZW4gZXhlY3V0ZWRcblx0Ly8gQ3VycmVudGx5IHRoZSBwYXJhbWV0ZXIgaXNOYXZpZ2FibGUgaXMgdXNlZCBpbnRlcm5hbGx5IGFuZCBzaG91bGQgYmUgY2hhbmdlZCB0byByZXF1aXJlc05hdmlnYXRpb24gYXMgaXQgaXMgYSBtb3JlIGFwdCBuYW1lIGZvciB0aGlzIHBhcmFtXG5cblx0LyoqXG5cdCAqIEludm9rZXMgYW4gYWN0aW9uIChib3VuZCBvciB1bmJvdW5kKSBhbmQgdHJhY2tzIHRoZSBjaGFuZ2VzIHNvIHRoYXQgb3RoZXIgcGFnZXMgY2FuIGJlIHJlZnJlc2hlZCBhbmQgc2hvdyB0aGUgdXBkYXRlZCBkYXRhIHVwb24gbmF2aWdhdGlvbi5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uIHRvIGJlIGNhbGxlZFxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycyBDb250YWlucyB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnBhcmFtZXRlclZhbHVlcyBBIG1hcCBvZiBhY3Rpb24gcGFyYW1ldGVyIG5hbWVzIGFuZCBwcm92aWRlZCB2YWx1ZXNcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzLm5hbWUgTmFtZSBvZiB0aGUgcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnBhcmFtZXRlclZhbHVlcy52YWx1ZSBWYWx1ZSBvZiB0aGUgcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2cgU2tpcHMgdGhlIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nIGlmIHZhbHVlcyBhcmUgcHJvdmlkZWQgZm9yIGFsbCBvZiB0aGVtIGluIHBhcmFtZXRlclZhbHVlc1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5jb250ZXh0cyBGb3IgYSBib3VuZCBhY3Rpb24sIGEgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIHRvIGJlIGNhbGxlZCBtdXN0IGJlIHByb3ZpZGVkXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLm1vZGVsIEZvciBhbiB1bmJvdW5kIGFjdGlvbiwgYW4gaW5zdGFuY2Ugb2YgYW4gT0RhdGEgVjQgbW9kZWwgbXVzdCBiZSBwcm92aWRlZFxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5yZXF1aXJlc05hdmlnYXRpb24gQm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgbmF2aWdhdGlvbiBpcyByZXF1aXJlZCBhZnRlciB0aGUgYWN0aW9uIGhhcyBiZWVuIGV4ZWN1dGVkLiBOYXZpZ2F0aW9uIHRha2VzIHBsYWNlIHRvIHRoZSBjb250ZXh0IHJldHVybmVkIGJ5IHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMubGFiZWwgQSBodW1hbi1yZWFkYWJsZSBsYWJlbCBmb3IgdGhlIGFjdGlvbi4gVGhpcyBpcyBuZWVkZWQgaW4gY2FzZSB0aGUgYWN0aW9uIGhhcyBhIHBhcmFtZXRlciBhbmQgYSBwYXJhbWV0ZXIgZGlhbG9nIGlzIHNob3duIHRvIHRoZSB1c2VyLiBUaGUgbGFiZWwgd2lsbCBiZSB1c2VkIGZvciB0aGUgdGl0bGUgb2YgdGhlIGRpYWxvZyBhbmQgZm9yIHRoZSBjb25maXJtYXRpb24gYnV0dG9uXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmludm9jYXRpb25Hcm91cGluZyBNb2RlIGhvdyBhY3Rpb25zIGFyZSB0byBiZSBjYWxsZWQ6ICdDaGFuZ2VTZXQnIHRvIHB1dCBhbGwgYWN0aW9uIGNhbGxzIGludG8gb25lIGNoYW5nZXNldCwgJ0lzb2xhdGVkJyB0byBwdXQgdGhlbSBpbnRvIHNlcGFyYXRlIGNoYW5nZXNldHNcblx0ICogQHBhcmFtIG1FeHRyYVBhcmFtcyBQUklWQVRFXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyBvbmNlIHRoZSBhY3Rpb24gaGFzIGJlZW4gZXhlY3V0ZWQsIHByb3ZpZGluZyB0aGUgcmVzcG9uc2Vcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I2ludm9rZUFjdGlvblxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgaW52b2tlQWN0aW9uKFxuXHRcdHNBY3Rpb25OYW1lOiBzdHJpbmcsXG5cdFx0bUluUGFyYW1ldGVycz86IHtcblx0XHRcdHBhcmFtZXRlclZhbHVlcz86IHsgbmFtZTogc3RyaW5nOyB2YWx1ZTogYW55IH07XG5cdFx0XHRza2lwUGFyYW1ldGVyRGlhbG9nPzogYm9vbGVhbjtcblx0XHRcdGNvbnRleHRzPzogQ29udGV4dCB8IENvbnRleHRbXTtcblx0XHRcdG1vZGVsPzogT0RhdGFNb2RlbDtcblx0XHRcdHJlcXVpcmVzTmF2aWdhdGlvbj86IGJvb2xlYW47XG5cdFx0XHRsYWJlbD86IHN0cmluZztcblx0XHRcdGludm9jYXRpb25Hcm91cGluZz86IHN0cmluZztcblx0XHR9LFxuXHRcdG1FeHRyYVBhcmFtcz86IGFueVxuXHQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRsZXQgb0NvbnRyb2w6IGFueTtcblx0XHRjb25zdCB0cmFuc2FjdGlvbkhlbHBlciA9IHRoaXMuX2dldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cdFx0bGV0IGFQYXJ0cztcblx0XHRsZXQgc092ZXJsb2FkRW50aXR5VHlwZTtcblx0XHRsZXQgb0N1cnJlbnRBY3Rpb25DYWxsQmFja3M6IGFueTtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXG5cdFx0bGV0IG1QYXJhbWV0ZXJzOiBhbnkgPSBtSW5QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdC8vIER1ZSB0byBhIG1pc3Rha2UgdGhlIGludm9rZUFjdGlvbiBpbiB0aGUgZXh0ZW5zaW9uQVBJIGhhZCBhIGRpZmZlcmVudCBBUEkgdGhhbiB0aGlzIG9uZS5cblx0XHQvLyBUaGUgb25lIGZyb20gdGhlIGV4dGVuc2lvbkFQSSBkb2Vzbid0IGV4aXN0IGFueW1vcmUgYXMgd2UgZXhwb3NlIHRoZSBmdWxsIGVkaXQgZmxvdyBub3cgYnV0XG5cdFx0Ly8gZHVlIHRvIGNvbXBhdGliaWxpdHkgcmVhc29ucyB3ZSBzdGlsbCBuZWVkIHRvIHN1cHBvcnQgdGhlIG9sZCBzaWduYXR1cmVcblx0XHRpZiAoXG5cdFx0XHQobVBhcmFtZXRlcnMuaXNBICYmIG1QYXJhbWV0ZXJzLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0XCIpKSB8fFxuXHRcdFx0QXJyYXkuaXNBcnJheShtUGFyYW1ldGVycykgfHxcblx0XHRcdG1FeHRyYVBhcmFtcyAhPT0gdW5kZWZpbmVkXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBjb250ZXh0cyA9IG1QYXJhbWV0ZXJzO1xuXHRcdFx0bVBhcmFtZXRlcnMgPSBtRXh0cmFQYXJhbXMgfHwge307XG5cdFx0XHRpZiAoY29udGV4dHMpIHtcblx0XHRcdFx0bVBhcmFtZXRlcnMuY29udGV4dHMgPSBjb250ZXh0cztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLm1vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtUGFyYW1ldGVycy5pc05hdmlnYWJsZSA9IG1QYXJhbWV0ZXJzLnJlcXVpcmVzTmF2aWdhdGlvbiB8fCBtUGFyYW1ldGVycy5pc05hdmlnYWJsZTtcblxuXHRcdC8vIERldGVybWluZSBpZiB0aGUgYWN0aW9uIGlzIGJvdW5kIG9yIHVuYm91bmRcblx0XHRjb25zdCBtb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCk7XG5cdFx0Y29uc3QgYWN0aW9uTWV0YURhdGEgPSBtb2RlbD8uZ2V0TWV0YU1vZGVsKCk/LmdldE9iamVjdChcIi9cIiArIHNBY3Rpb25OYW1lLnNwbGl0KFwiKFwiKVswXSk7XG5cdFx0aWYgKGFjdGlvbk1ldGFEYXRhKSB7XG5cdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoYWN0aW9uTWV0YURhdGEpKSB7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmlzQm91bmQgPSBhY3Rpb25NZXRhRGF0YS4kSXNCb3VuZCA/IGFjdGlvbk1ldGFEYXRhLiRJc0JvdW5kIDogZmFsc2U7XG5cdFx0XHR9IGVsc2UgaWYgKGFjdGlvbk1ldGFEYXRhWzBdLiRraW5kID09PSBcIkFjdGlvblwiICYmIGFjdGlvbk1ldGFEYXRhWzBdLiRJc0JvdW5kID09PSB0cnVlKSB7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmlzQm91bmQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBpbiBFZGl0Rmxvdy5pbnZva2VBY3Rpb246IFRoZSBzcGVjaWZpZWQgYWN0aW9uIGNvdWxkIG5vdCBiZSBmb3VuZFwiKTtcblx0XHR9XG5cblx0XHRpZiAoIW1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wpIHtcblx0XHRcdG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wgPSB0aGlzLmdldFZpZXcoKTtcblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY29udHJvbElkKSB7XG5cdFx0XHRvQ29udHJvbCA9IHRoaXMuZ2V0VmlldygpLmJ5SWQobVBhcmFtZXRlcnMuY29udHJvbElkKTtcblx0XHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0XHQvLyBUT0RPOiBjdXJyZW50bHkgdGhpcyBzZWxlY3RlZCBjb250ZXh0cyB1cGRhdGUgaXMgZG9uZSB3aXRoaW4gdGhlIG9wZXJhdGlvbiwgc2hvdWxkIGJlIG1vdmVkIG91dFxuXHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9Db250cm9sLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHR9XG5cblx0XHRpZiAoc0FjdGlvbk5hbWUgJiYgc0FjdGlvbk5hbWUuaW5kZXhPZihcIihcIikgPiAtMSkge1xuXHRcdFx0Ly8gZ2V0IGVudGl0eSB0eXBlIG9mIGFjdGlvbiBvdmVybG9hZCBhbmQgcmVtb3ZlIGl0IGZyb20gdGhlIGFjdGlvbiBwYXRoXG5cdFx0XHQvLyBFeGFtcGxlIHNBY3Rpb25OYW1lID0gXCI8QWN0aW9uTmFtZT4oQ29sbGVjdGlvbig8T3ZlcmxvYWRFbnRpdHlUeXBlPikpXCJcblx0XHRcdC8vIHNBY3Rpb25OYW1lID0gYVBhcnRzWzBdIC0tPiA8QWN0aW9uTmFtZT5cblx0XHRcdC8vIHNPdmVybG9hZEVudGl0eVR5cGUgPSBhUGFydHNbMl0gLS0+IDxPdmVybG9hZEVudGl0eVR5cGU+XG5cdFx0XHRhUGFydHMgPSBzQWN0aW9uTmFtZS5zcGxpdChcIihcIik7XG5cdFx0XHRzQWN0aW9uTmFtZSA9IGFQYXJ0c1swXTtcblx0XHRcdHNPdmVybG9hZEVudGl0eVR5cGUgPSAoYVBhcnRzW2FQYXJ0cy5sZW5ndGggLSAxXSBhcyBhbnkpLnJlcGxhY2VBbGwoXCIpXCIsIFwiXCIpO1xuXHRcdH1cblxuXHRcdGlmIChtUGFyYW1ldGVycy5iU3RhdGljQWN0aW9uKSB7XG5cdFx0XHRpZiAob0NvbnRyb2wuaXNUYWJsZUJvdW5kKCkpIHtcblx0XHRcdFx0bVBhcmFtZXRlcnMuY29udGV4dHMgPSBvQ29udHJvbC5nZXRSb3dCaW5kaW5nKCkuZ2V0SGVhZGVyQ29udGV4dCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0NvbnRyb2wuZGF0YShcInJvd3NCaW5kaW5nSW5mb1wiKS5wYXRoLFxuXHRcdFx0XHRcdG9MaXN0QmluZGluZyA9IG5ldyAoT0RhdGFMaXN0QmluZGluZyBhcyBhbnkpKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCksIHNCaW5kaW5nUGF0aCk7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNvbnRleHRzID0gb0xpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHNPdmVybG9hZEVudGl0eVR5cGUgJiYgb0NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0XHRtUGFyYW1ldGVycy5jb250ZXh0cyA9IHRoaXMuX2dldEFjdGlvbk92ZXJsb2FkQ29udGV4dEZyb21NZXRhZGF0YVBhdGgoXG5cdFx0XHRcdFx0b0NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdFx0XHRvQ29udHJvbC5nZXRSb3dCaW5kaW5nKCksXG5cdFx0XHRcdFx0c092ZXJsb2FkRW50aXR5VHlwZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuZW5hYmxlQXV0b1Njcm9sbCkge1xuXHRcdFx0XHRvQ3VycmVudEFjdGlvbkNhbGxCYWNrcyA9IHRoaXMuX2NyZWF0ZUFjdGlvblByb21pc2Uoc0FjdGlvbk5hbWUsIG9Db250cm9sLnNJZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG1QYXJhbWV0ZXJzLmJHZXRCb3VuZENvbnRleHQgPSB0aGlzLl9nZXRCb3VuZENvbnRleHQob1ZpZXcsIG1QYXJhbWV0ZXJzKTtcblx0XHQvLyBOZWVkIHRvIGtub3cgdGhhdCB0aGUgYWN0aW9uIGlzIGNhbGxlZCBmcm9tIE9iamVjdFBhZ2UgZm9yIGNoYW5nZVNldCBJc29sYXRlZCB3b3JrYXJvdW5kXG5cdFx0bVBhcmFtZXRlcnMuYk9iamVjdFBhZ2UgPSAob1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmNvbnZlcnRlclR5cGUgPT09IFwiT2JqZWN0UGFnZVwiO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuX3N5bmNUYXNrKCk7XG5cdFx0XHRjb25zdCBvUmVzcG9uc2UgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5jYWxsQWN0aW9uKFxuXHRcdFx0XHRzQWN0aW9uTmFtZSxcblx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLFxuXHRcdFx0XHR0aGlzLl9nZXRNZXNzYWdlSGFuZGxlcigpXG5cdFx0XHQpO1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmNvbnRleHRzICYmIG1QYXJhbWV0ZXJzLmlzQm91bmQgPT09IHRydWUpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5fcmVmcmVzaExpc3RJZlJlcXVpcmVkKHRoaXMuX2dldEFjdGlvblJlc3BvbnNlRGF0YUFuZEtleXMoc0FjdGlvbk5hbWUsIG9SZXNwb25zZSksIG1QYXJhbWV0ZXJzLmNvbnRleHRzWzBdKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX3NlbmRBY3Rpdml0eShBY3Rpdml0eS5BY3Rpb24sIG1QYXJhbWV0ZXJzLmNvbnRleHRzLCBzQWN0aW9uTmFtZSk7XG5cdFx0XHR0aGlzLl90cmlnZ2VyQ29uZmlndXJlZFN1cnZleShzQWN0aW9uTmFtZSwgVHJpZ2dlclR5cGUuYWN0aW9uKTtcblxuXHRcdFx0aWYgKG9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzKSB7XG5cdFx0XHRcdG9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzLmZSZXNvbHZlcihvUmVzcG9uc2UpO1xuXHRcdFx0fVxuXHRcdFx0Lypcblx0XHRcdFx0XHRXZSBzZXQgdGhlICh1cHBlcikgcGFnZXMgdG8gZGlydHkgYWZ0ZXIgYW4gZXhlY3V0aW9uIG9mIGFuIGFjdGlvblxuXHRcdFx0XHRcdFRPRE86IGdldCByaWQgb2YgdGhpcyB3b3JrYXJvdW5kXG5cdFx0XHRcdFx0VGhpcyB3b3JrYXJvdW5kIGlzIG9ubHkgbmVlZGVkIGFzIGxvbmcgYXMgdGhlIG1vZGVsIGRvZXMgbm90IHN1cHBvcnQgdGhlIHN5bmNocm9uaXphdGlvbi5cblx0XHRcdFx0XHRPbmNlIHRoaXMgaXMgc3VwcG9ydGVkIHdlIGRvbid0IG5lZWQgdG8gc2V0IHRoZSBwYWdlcyB0byBkaXJ0eSBhbnltb3JlIGFzIHRoZSBjb250ZXh0IGl0c2VsZlxuXHRcdFx0XHRcdGlzIGFscmVhZHkgcmVmcmVzaGVkIChpdCdzIGp1c3Qgbm90IHJlZmxlY3RlZCBpbiB0aGUgb2JqZWN0IHBhZ2UpXG5cdFx0XHRcdFx0d2UgZXhwbGljaXRseSBkb24ndCBjYWxsIHRoaXMgbWV0aG9kIGZyb20gdGhlIGxpc3QgcmVwb3J0IGJ1dCBvbmx5IGNhbGwgaXQgZnJvbSB0aGUgb2JqZWN0IHBhZ2Vcblx0XHRcdFx0XHRhcyBpZiBpdCBpcyBjYWxsZWQgaW4gdGhlIGxpc3QgcmVwb3J0IGl0J3Mgbm90IG5lZWRlZCAtIGFzIHdlIGFueXdheSB3aWxsIHJlbW92ZSB0aGlzIGxvZ2ljXG5cdFx0XHRcdFx0d2UgY2FuIGxpdmUgd2l0aCB0aGlzXG5cdFx0XHRcdFx0d2UgbmVlZCBhIGNvbnRleHQgdG8gc2V0IHRoZSB1cHBlciBwYWdlcyB0byBkaXJ0eSAtIGlmIHRoZXJlIGFyZSBtb3JlIHRoYW4gb25lIHdlIHVzZSB0aGVcblx0XHRcdFx0XHRmaXJzdCBvbmUgYXMgdGhleSBhcmUgYW55d2F5IHNpYmxpbmdzXG5cdFx0XHRcdFx0Ki9cblx0XHRcdGlmIChtUGFyYW1ldGVycy5jb250ZXh0cykge1xuXHRcdFx0XHRpZiAoIXRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5fZ2V0SW50ZXJuYWxNb2RlbCgpLnNldFByb3BlcnR5KFwiL2xhc3RJbnZva2VkQWN0aW9uXCIsIHNBY3Rpb25OYW1lKTtcblx0XHRcdH1cblx0XHRcdGlmIChtUGFyYW1ldGVycy5pc05hdmlnYWJsZSkge1xuXHRcdFx0XHRsZXQgdkNvbnRleHQgPSBvUmVzcG9uc2U7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHZDb250ZXh0KSAmJiB2Q29udGV4dC5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHR2Q29udGV4dCA9IHZDb250ZXh0WzBdLnZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2Q29udGV4dCAmJiAhQXJyYXkuaXNBcnJheSh2Q29udGV4dCkpIHtcblx0XHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRcdFx0XHRjb25zdCBzQ29udGV4dE1ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aCh2Q29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0XHRcdGNvbnN0IF9mblZhbGlkQ29udGV4dHMgPSAoY29udGV4dHM6IGFueSwgYXBwbGljYWJsZUNvbnRleHRzOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBjb250ZXh0cy5maWx0ZXIoKGVsZW1lbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwbGljYWJsZUNvbnRleHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFwcGxpY2FibGVDb250ZXh0cy5pbmRleE9mKGVsZW1lbnQpID4gLTE7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGNvbnN0IG9BY3Rpb25Db250ZXh0ID0gQXJyYXkuaXNBcnJheShtUGFyYW1ldGVycy5jb250ZXh0cylcblx0XHRcdFx0XHRcdD8gX2ZuVmFsaWRDb250ZXh0cyhtUGFyYW1ldGVycy5jb250ZXh0cywgbVBhcmFtZXRlcnMuYXBwbGljYWJsZUNvbnRleHQpWzBdXG5cdFx0XHRcdFx0XHQ6IG1QYXJhbWV0ZXJzLmNvbnRleHRzO1xuXHRcdFx0XHRcdGNvbnN0IHNBY3Rpb25Db250ZXh0TWV0YVBhdGggPSBvQWN0aW9uQ29udGV4dCAmJiBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRcdFx0aWYgKHNDb250ZXh0TWV0YVBhdGggIT0gdW5kZWZpbmVkICYmIHNDb250ZXh0TWV0YVBhdGggPT09IHNBY3Rpb25Db250ZXh0TWV0YVBhdGgpIHtcblx0XHRcdFx0XHRcdGlmIChvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCkgIT09IHZDb250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLl9nZXRSb3V0aW5nTGlzdGVuZXIoKS5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQodkNvbnRleHQsIHtcblx0XHRcdFx0XHRcdFx0XHRjaGVja05vSGFzaENoYW5nZTogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRub0hpc3RvcnlFbnRyeTogZmFsc2Vcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRMb2cuaW5mbyhcIk5hdmlnYXRpb24gdG8gdGhlIHNhbWUgY29udGV4dCBpcyBub3QgYWxsb3dlZFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBvUmVzcG9uc2U7XG5cdFx0fSBjYXRjaCAoZXJyOiBhbnkpIHtcblx0XHRcdGlmIChvQ3VycmVudEFjdGlvbkNhbGxCYWNrcykge1xuXHRcdFx0XHRvQ3VycmVudEFjdGlvbkNhbGxCYWNrcy5mUmVqZWN0b3IoKTtcblx0XHRcdH1cblx0XHRcdC8vIEZJWE1FOiBpbiBtb3N0IHNpdHVhdGlvbnMgdGhlcmUgaXMgbm8gaGFuZGxlciBmb3IgdGhlIHJlamVjdGVkIHByb21pc2VzIHJldHVybmVkcVxuXHRcdFx0aWYgKGVyciA9PT0gQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZykge1xuXHRcdFx0XHQvLyBUaGlzIGxlYWRzIHRvIGNvbnNvbGUgZXJyb3IuIEFjdHVhbGx5IHRoZSBlcnJvciBpcyBhbHJlYWR5IGhhbmRsZWQgKGN1cnJlbnRseSBkaXJlY3RseSBpbiBwcmVzcyBoYW5kbGVyIG9mIGVuZCBidXR0b24gaW4gZGlhbG9nKSwgc28gaXQgc2hvdWxkIG5vdCBiZSBmb3J3YXJkZWRcblx0XHRcdFx0Ly8gdXAgdG8gaGVyZS4gSG93ZXZlciwgd2hlbiBkaWFsb2cgaGFuZGxpbmcgYW5kIGJhY2tlbmQgZXhlY3V0aW9uIGFyZSBzZXBhcmF0ZWQsIGluZm9ybWF0aW9uIHdoZXRoZXIgZGlhbG9nIHdhcyBjYW5jZWxsZWQsIG9yIGJhY2tlbmQgZXhlY3V0aW9uIGhhcyBmYWlsZWQgbmVlZHNcblx0XHRcdFx0Ly8gdG8gYmUgdHJhbnNwb3J0ZWQgdG8gdGhlIHBsYWNlIHJlc3BvbnNpYmxlIGZvciBjb25uZWN0aW5nIHRoZXNlIHR3byB0aGluZ3MuXG5cdFx0XHRcdC8vIFRPRE86IHJlbW92ZSBzcGVjaWFsIGhhbmRsaW5nIG9uZSBkaWFsb2cgaGFuZGxpbmcgYW5kIGJhY2tlbmQgZXhlY3V0aW9uIGFyZSBzZXBhcmF0ZWRcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRGlhbG9nIGNhbmNlbGxlZFwiKTtcblx0XHRcdH0gZWxzZSBpZiAoIShlcnIgJiYgKGVyci5jYW5jZWxlZCB8fCAoZXJyLnJlamVjdGVkSXRlbXMgJiYgZXJyLnJlamVjdGVkSXRlbXNbMF0uY2FuY2VsZWQpKSkpIHtcblx0XHRcdFx0Ly8gVE9ETzogYW5hbHl6ZSwgd2hldGhlciB0aGlzIGlzIG9mIHRoZSBzYW1lIGNhdGVnb3J5IGFzIGFib3ZlXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgRXJyb3IgaW4gRWRpdEZsb3cuaW52b2tlQWN0aW9uOiR7ZXJyfWApO1xuXHRcdFx0fVxuXHRcdFx0Ly8gVE9ETzogQW55IHVuZXhwZWN0ZWQgZXJyb3JzIHByb2JhYmx5IHNob3VsZCBub3QgYmUgaWdub3JlZCFcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2VjdXJlZCBleGVjdXRpb24gb2YgdGhlIGdpdmVuIGZ1bmN0aW9uLiBFbnN1cmVzIHRoYXQgdGhlIGZ1bmN0aW9uIGlzIG9ubHkgZXhlY3V0ZWQgd2hlbiBjZXJ0YWluIGNvbmRpdGlvbnMgYXJlIGZ1bGZpbGxlZC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBmbkZ1bmN0aW9uIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZC4gU2hvdWxkIHJldHVybiBhIHByb21pc2UgdGhhdCBpcyBzZXR0bGVkIGFmdGVyIGNvbXBsZXRpb24gb2YgdGhlIGV4ZWN1dGlvbi4gSWYgbm90aGluZyBpcyByZXR1cm5lZCwgaW1tZWRpYXRlIGNvbXBsZXRpb24gaXMgYXNzdW1lZC5cblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIERlZmluaXRpb25zIG9mIHRoZSBwcmVjb25kaXRpb25zIHRvIGJlIGNoZWNrZWQgYmVmb3JlIGV4ZWN1dGlvblxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMuYnVzeSBEZWZpbmVzIHRoZSBidXN5IGluZGljYXRvclxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMuYnVzeS5zZXQgVHJpZ2dlcnMgYSBidXN5IGluZGljYXRvciB3aGVuIHRoZSBmdW5jdGlvbiBpcyBleGVjdXRlZC5cblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLmJ1c3kuY2hlY2sgRXhlY3V0ZXMgZnVuY3Rpb24gb25seSBpZiBhcHBsaWNhdGlvbiBpc24ndCBidXN5LlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMudXBkYXRlc0RvY3VtZW50IFRoaXMgb3BlcmF0aW9uIHVwZGF0ZXMgdGhlIGN1cnJlbnQgZG9jdW1lbnQgd2l0aG91dCB1c2luZyB0aGUgYm91bmQgbW9kZWwgYW5kIGNvbnRleHQuIEFzIGEgcmVzdWx0LCB0aGUgZHJhZnQgc3RhdHVzIGlzIHVwZGF0ZWQgaWYgYSBkcmFmdCBkb2N1bWVudCBleGlzdHMsIGFuZCB0aGUgdXNlciBoYXMgdG8gY29uZmlybSB0aGUgY2FuY2VsbGF0aW9uIG9mIHRoZSBlZGl0aW5nIHByb2Nlc3MuXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IGlzIHJlamVjdGVkIGlmIHRoZSBleGVjdXRpb24gaXMgcHJvaGliaXRlZCBhbmQgcmVzb2x2ZWQgYnkgdGhlIHByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGZuRnVuY3Rpb24uXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNzZWN1cmVkRXhlY3V0aW9uXG5cdCAqIEBwdWJsaWNcblx0ICogQGV4cGVyaW1lbnRhbCBBcyBvZiB2ZXJzaW9uIDEuOTAuMFxuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0c2VjdXJlZEV4ZWN1dGlvbihcblx0XHRmbkZ1bmN0aW9uOiBGdW5jdGlvbixcblx0XHRtUGFyYW1ldGVycz86IHtcblx0XHRcdGJ1c3k/OiB7XG5cdFx0XHRcdHNldD86IGJvb2xlYW47XG5cdFx0XHRcdGNoZWNrPzogYm9vbGVhbjtcblx0XHRcdH07XG5cdFx0XHR1cGRhdGVzRG9jdW1lbnQ/OiBib29sZWFuO1xuXHRcdH1cblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgYkJ1c3lTZXQgPSBtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5idXN5ICYmIG1QYXJhbWV0ZXJzLmJ1c3kuc2V0ICE9PSB1bmRlZmluZWQgPyBtUGFyYW1ldGVycy5idXN5LnNldCA6IHRydWUsXG5cdFx0XHRiQnVzeUNoZWNrID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuYnVzeSAmJiBtUGFyYW1ldGVycy5idXN5LmNoZWNrICE9PSB1bmRlZmluZWQgPyBtUGFyYW1ldGVycy5idXN5LmNoZWNrIDogdHJ1ZSxcblx0XHRcdGJVcGRhdGVzRG9jdW1lbnQgPSAobVBhcmFtZXRlcnMgJiYgKG1QYXJhbWV0ZXJzIGFzIGFueSkudXBkYXRlc0RvY3VtZW50KSB8fCBmYWxzZSxcblx0XHRcdG9Mb2NrT2JqZWN0ID0gdGhpcy5fZ2V0R2xvYmFsVUlNb2RlbCgpLFxuXHRcdFx0b0NvbnRleHQgPSB0aGlzLmJhc2UuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRiSXNEcmFmdCA9IG9Db250ZXh0ICYmIHRoaXMuX2dldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQpID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0O1xuXG5cdFx0aWYgKGJCdXN5Q2hlY2sgJiYgQnVzeUxvY2tlci5pc0xvY2tlZChvTG9ja09iamVjdCkpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcIkFwcGxpY2F0aW9uIGFscmVhZHkgYnVzeSB0aGVyZWZvcmUgZXhlY3V0aW9uIHJlamVjdGVkXCIpO1xuXHRcdH1cblxuXHRcdC8vIHdlIGhhdmUgdG8gc2V0IGJ1c3kgYW5kIGRyYWZ0IGluZGljYXRvciBpbW1lZGlhdGVseSBhbHNvIHRoZSBmdW5jdGlvbiBtaWdodCBiZSBleGVjdXRlZCBsYXRlciBpbiBxdWV1ZVxuXHRcdGlmIChiQnVzeVNldCkge1xuXHRcdFx0QnVzeUxvY2tlci5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHR9XG5cdFx0aWYgKGJVcGRhdGVzRG9jdW1lbnQgJiYgYklzRHJhZnQpIHtcblx0XHRcdHRoaXMuX3NldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmluZyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKS5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblxuXHRcdHJldHVybiB0aGlzLl9zeW5jVGFzayhmbkZ1bmN0aW9uKVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRpZiAoYlVwZGF0ZXNEb2N1bWVudCkge1xuXHRcdFx0XHRcdHRoaXMuX3NldERvY3VtZW50TW9kaWZpZWQodHJ1ZSk7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChiSXNEcmFmdCkge1xuXHRcdFx0XHRcdFx0dGhpcy5fc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2ZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKGJVcGRhdGVzRG9jdW1lbnQgJiYgYklzRHJhZnQpIHtcblx0XHRcdFx0XHR0aGlzLl9zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG9FcnJvcik7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRpZiAoYkJ1c3lTZXQpIHtcblx0XHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvTG9ja09iamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyB0aGUgcGF0Y2hTZW50IGV2ZW50OiByZWdpc3RlciBkb2N1bWVudCBtb2RpZmljYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50IHNlbnQgYnkgdGhlIGJpbmRpbmdcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRoYW5kbGVQYXRjaFNlbnQob0V2ZW50OiBFdmVudCkge1xuXHRcdC8vIEluIGNvbGxhYm9yYXRpdmUgZHJhZnQsIGRpc2FibGUgRVRhZyBjaGVjayBmb3IgUEFUQ0ggcmVxdWVzdHNcblx0XHRjb25zdCBpc0luQ29sbGFib3JhdGl2ZURyYWZ0ID0gaXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpO1xuXHRcdGlmIChpc0luQ29sbGFib3JhdGl2ZURyYWZ0KSB7XG5cdFx0XHQoKG9FdmVudC5nZXRTb3VyY2UoKSBhcyBCaW5kaW5nKS5nZXRNb2RlbCgpIGFzIGFueSkuc2V0SWdub3JlRVRhZyh0cnVlKTtcblx0XHR9XG5cdFx0aWYgKCEodGhpcy5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpPy5nZXRQcm9wZXJ0eShcInNraXBQYXRjaEhhbmRsZXJzXCIpKSB7XG5cdFx0XHQvLyBDcmVhdGUgYSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvciByZWplY3RlZCB3aGVuIHRoZSBwYXRoIGlzIGNvbXBsZXRlZFxuXHRcdFx0Y29uc3Qgb1BhdGNoUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdFx0b0V2ZW50LmdldFNvdXJjZSgpLmF0dGFjaEV2ZW50T25jZShcInBhdGNoQ29tcGxldGVkXCIsIChwYXRjaENvbXBsZXRlZEV2ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHQvLyBSZS1lbmFibGUgRVRhZyBjaGVja3Ncblx0XHRcdFx0XHRpZiAoaXNJbkNvbGxhYm9yYXRpdmVEcmFmdCkge1xuXHRcdFx0XHRcdFx0KChvRXZlbnQuZ2V0U291cmNlKCkgYXMgQmluZGluZykuZ2V0TW9kZWwoKSBhcyBhbnkpLnNldElnbm9yZUVUYWcoZmFsc2UpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvRXZlbnQuZ2V0U291cmNlKCkuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudEFmdGVyUGF0Y2goXG5cdFx0XHRcdFx0XHRcdHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHRcdFx0XHRvRXZlbnQuZ2V0U291cmNlKCkgYXMgVjRMaXN0QmluZGluZyxcblx0XHRcdFx0XHRcdFx0dGhpcy5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHRcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGJTdWNjZXNzID0gcGF0Y2hDb21wbGV0ZWRFdmVudC5nZXRQYXJhbWV0ZXIoXCJzdWNjZXNzXCIpO1xuXHRcdFx0XHRcdGlmIChiU3VjY2Vzcykge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZWplY3QoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnVwZGF0ZURvY3VtZW50KG9FdmVudC5nZXRTb3VyY2UoKSwgb1BhdGNoUHJvbWlzZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIENyZWF0ZUFjdGl2YXRlIGV2ZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0V2ZW50IFRoZSBldmVudCBzZW50IGJ5IHRoZSBiaW5kaW5nXG5cdCAqL1xuXHRhc3luYyBoYW5kbGVDcmVhdGVBY3RpdmF0ZShvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0Y29uc3Qgb0JpbmRpbmcgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLl9nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IGJBdEVuZCA9IHRydWU7XG5cdFx0Y29uc3QgYkluYWN0aXZlID0gdHJ1ZTtcblx0XHRjb25zdCBvUGFyYW1zOiBhbnkgPSB7XG5cdFx0XHRjcmVhdGlvbk1vZGU6IENyZWF0aW9uTW9kZS5JbmxpbmUsXG5cdFx0XHRjcmVhdGVBdEVuZDogYkF0RW5kLFxuXHRcdFx0aW5hY3RpdmU6IGJJbmFjdGl2ZSxcblx0XHRcdGtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQ6IGZhbHNlLCAvLyBjdXJyZW50bHkgbm90IGZ1bGx5IHN1cHBvcnRlZFxuXHRcdFx0YnVzeU1vZGU6IFwiTm9uZVwiXG5cdFx0fTtcblx0XHR0cnkge1xuXHRcdFx0Ly8gU2VuZCBub3RpZmljYXRpb24gdG8gb3RoZXIgdXNlcnMgb25seSBhZnRlciB0aGUgY3JlYXRpb24gaGFzIGJlZW4gZmluYWxpemVkXG5cdFx0XHRjb25zdCBhY3RpdmF0ZWRDb250ZXh0ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImNvbnRleHRcIikgYXMgQ29udGV4dDtcblx0XHRcdGFjdGl2YXRlZENvbnRleHRcblx0XHRcdFx0LmNyZWF0ZWQoKVxuXHRcdFx0XHQ/LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX3NlbmRBY3Rpdml0eShBY3Rpdml0eS5DcmVhdGUsIGFjdGl2YXRlZENvbnRleHQpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goKCkgPT4ge1xuXHRcdFx0XHRcdExvZy53YXJuaW5nKGBGYWlsZWQgdG8gYWN0aXZhdGUgY29udGV4dCAke2FjdGl2YXRlZENvbnRleHQuZ2V0UGF0aCgpfWApO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0Ly8gQ3JlYXRlIGEgbmV3IGluYWN0aXZlIGNvbnRleHQgKGVtcHR5IHJvdyBpbiB0aGUgdGFibGUpXG5cdFx0XHRjb25zdCBuZXdJbmFjdGl2ZUNvbnRleHQgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5jcmVhdGVEb2N1bWVudChcblx0XHRcdFx0b0JpbmRpbmcgYXMgVjRMaXN0QmluZGluZyxcblx0XHRcdFx0b1BhcmFtcyxcblx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpXG5cdFx0XHQpO1xuXHRcdFx0aWYgKG5ld0luYWN0aXZlQ29udGV4dCkge1xuXHRcdFx0XHRpZiAoIXRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0TG9nLmVycm9yKFwiRmFpbGVkIHRvIGFjdGl2YXRlIG5ldyByb3cgLVwiLCBlcnJvciBhcyBhbnkpO1xuXHRcdH1cblx0fVxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIFByaXZhdGUgbWV0aG9kc1xuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdC8qXG5cdFx0XHQgVE8gQkUgQ0hFQ0tFRCAvIERJU0NVU1NFRFxuXHRcdFx0IF9jcmVhdGVNdWx0aXBsZURvY3VtZW50cyBhbmQgZGVsZXRlTXVsdGlEb2N1bWVudCAtIGNvdWxkbid0IHdlIGNvbWJpbmUgdGhlbSB3aXRoIGNyZWF0ZSBhbmQgZGVsZXRlIGRvY3VtZW50P1xuXHRcdFx0IF9jcmVhdGVBY3Rpb25Qcm9taXNlIGFuZCBkZWxldGVDdXJyZW50QWN0aW9uUHJvbWlzZSAtPiBuZXh0IHN0ZXBcblxuXHRcdFx0ICovXG5cblx0X3NldEVkaXRNb2RlKHNFZGl0TW9kZTogYW55LCBiQ3JlYXRpb25Nb2RlPzogYm9vbGVhbikge1xuXHRcdHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLnNldEVkaXRNb2RlKHNFZGl0TW9kZSwgYkNyZWF0aW9uTW9kZSk7XG5cdH1cblxuXHRfZ2V0Q3JlYXRpb25Nb2RlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5nZXRDcmVhdGlvbk1vZGUoKTtcblx0fVxuXG5cdF9pc0RvY3VtZW50TW9kaWZpZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLmlzRG9jdW1lbnRNb2RpZmllZCgpO1xuXHR9XG5cblx0X3NldERvY3VtZW50TW9kaWZpZWQobW9kaWZpZWQ6IGJvb2xlYW4pIHtcblx0XHR0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5zZXREb2N1bWVudE1vZGlmaWVkKG1vZGlmaWVkKTtcblx0fVxuXG5cdF9zZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUobGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcpIHtcblx0XHR0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5zZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUobGlzdEJpbmRpbmcpO1xuXHR9XG5cblx0X3NldERyYWZ0U3RhdHVzKHNEcmFmdFN0YXRlOiBhbnkpIHtcblx0XHR0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5zZXREcmFmdFN0YXR1cyhzRHJhZnRTdGF0ZSk7XG5cdH1cblxuXHRfZ2V0Um91dGluZ0xpc3RlbmVyKCkge1xuXHRcdHJldHVybiB0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5nZXRSb3V0aW5nTGlzdGVuZXIoKTtcblx0fVxuXG5cdF9nZXRHbG9iYWxVSU1vZGVsKCkge1xuXHRcdHJldHVybiB0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cdH1cblx0X3N5bmNUYXNrKHZUYXNrPzogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLnN5bmNUYXNrKHZUYXNrKTtcblx0fVxuXG5cdF9nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRJbnRlcm5hbEVkaXRGbG93KCkuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCk7XG5cdH1cblxuXHRfZGVsZXRlRG9jdW1lbnRUcmFuc2FjdGlvbihvQ29udGV4dDogYW55LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLmRlbGV0ZURvY3VtZW50VHJhbnNhY3Rpb24ob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0fVxuXG5cdF9oYW5kbGVDcmVhdGVFdmVudHMob0JpbmRpbmc6IGFueSkge1xuXHRcdHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLmhhbmRsZUNyZWF0ZUV2ZW50cyhvQmluZGluZyk7XG5cdH1cblxuXHRfZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLmdldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cdH1cblxuXHRfZ2V0SW50ZXJuYWxNb2RlbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRJbnRlcm5hbEVkaXRGbG93KCkuZ2V0SW50ZXJuYWxNb2RlbCgpO1xuXHR9XG5cblx0X2dldFJvb3RWaWV3Q29udHJvbGxlcigpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblx0fVxuXG5cdF9nZXRSZXNvdXJjZUJ1bmRsZSgpOiBSZXNvdXJjZUJ1bmRsZSB7XG5cdFx0cmV0dXJuICh0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgYW55KS5vUmVzb3VyY2VCdW5kbGUgYXMgUmVzb3VyY2VCdW5kbGU7XG5cdH1cblxuXHRfZ2V0U2VtYW50aWNNYXBwaW5nKCk6IFNlbWFudGljTWFwcGluZyB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGluZ1NlcnZpY2UoKS5nZXRMYXN0U2VtYW50aWNNYXBwaW5nKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBwcm9taXNlIHRvIHdhaXQgZm9yIGFuIGFjdGlvbiB0byBiZSBleGVjdXRlZFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2NyZWF0ZUFjdGlvblByb21pc2Vcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIHJlc29sdmVyIGZ1bmN0aW9uIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGV4dGVybmFsbHkgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuXHQgKi9cblxuXHRfY3JlYXRlQWN0aW9uUHJvbWlzZShzQWN0aW9uTmFtZTogYW55LCBzQ29udHJvbElkOiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRJbnRlcm5hbEVkaXRGbG93KCkuY3JlYXRlQWN0aW9uUHJvbWlzZShzQWN0aW9uTmFtZSwgc0NvbnRyb2xJZCk7XG5cdH1cblxuXHRfZ2V0Q3VycmVudEFjdGlvblByb21pc2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLmdldEN1cnJlbnRBY3Rpb25Qcm9taXNlKCk7XG5cdH1cblxuXHRfZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLmRlbGV0ZUN1cnJlbnRBY3Rpb25Qcm9taXNlKCk7XG5cdH1cblxuXHRfZ2V0TWVzc2FnZUhhbmRsZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0SW50ZXJuYWxFZGl0RmxvdygpLmdldE1lc3NhZ2VIYW5kbGVyKCk7XG5cdH1cblxuXHRfc2VuZEFjdGl2aXR5KGFjdGlvbjogQWN0aXZpdHksIHJlbGF0ZWRDb250ZXh0czogQ29udGV4dCB8IENvbnRleHRbXSB8IHVuZGVmaW5lZCwgYWN0aW9uTmFtZT86IHN0cmluZykge1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBBcnJheS5pc0FycmF5KHJlbGF0ZWRDb250ZXh0cykgPyByZWxhdGVkQ29udGV4dHMubWFwKChjb250ZXh0KSA9PiBjb250ZXh0LmdldFBhdGgoKSkgOiByZWxhdGVkQ29udGV4dHM/LmdldFBhdGgoKTtcblx0XHRzZW5kKHRoaXMuZ2V0VmlldygpLCBhY3Rpb24sIGNvbnRlbnQsIGFjdGlvbk5hbWUpO1xuXHR9XG5cblx0X3RyaWdnZXJDb25maWd1cmVkU3VydmV5KHNBY3Rpb25OYW1lOiBzdHJpbmcsIHRyaWdnZXJUeXBlOiBUcmlnZ2VyVHlwZSkge1xuXHRcdHRyaWdnZXJDb25maWd1cmVkU3VydmV5KHRoaXMuZ2V0VmlldygpLCBzQWN0aW9uTmFtZSwgdHJpZ2dlclR5cGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfZ2V0QWN0aW9uUmVzcG9uc2VEYXRhQW5kS2V5c1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdGhhdCBpcyBleGVjdXRlZFxuXHQgKiBAcGFyYW0gb1Jlc3BvbnNlIFRoZSBib3VuZCBhY3Rpb24ncyByZXNwb25zZSBkYXRhIG9yIHJlc3BvbnNlIGNvbnRleHRcblx0ICogQHJldHVybnMgT2JqZWN0IHdpdGggZGF0YSBhbmQgbmFtZXMgb2YgdGhlIGtleSBmaWVsZHMgb2YgdGhlIHJlc3BvbnNlXG5cdCAqL1xuXHRfZ2V0QWN0aW9uUmVzcG9uc2VEYXRhQW5kS2V5cyhzQWN0aW9uTmFtZTogc3RyaW5nLCBvUmVzcG9uc2U6IG9iamVjdCkge1xuXHRcdHJldHVybiB0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5nZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzKHNBY3Rpb25OYW1lLCBvUmVzcG9uc2UpO1xuXHR9XG5cblx0YXN5bmMgX3N1Ym1pdE9wZW5DaGFuZ2VzKG9Db250ZXh0OiBhbnkpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRvTG9ja09iamVjdCA9IHRoaXMuX2dldEdsb2JhbFVJTW9kZWwoKTtcblxuXHRcdHRyeSB7XG5cdFx0XHQvLyBTdWJtaXQgYW55IGxlZnRvdmVyIGNoYW5nZXMgdGhhdCBhcmUgbm90IHlldCBzdWJtaXR0ZWRcblx0XHRcdC8vIEN1cnJlbnRseSB3ZSBhcmUgdXNpbmcgb25seSAxIHVwZGF0ZUdyb3VwSWQsIGhlbmNlIHN1Ym1pdHRpbmcgdGhlIGJhdGNoIGRpcmVjdGx5IGhlcmVcblx0XHRcdGF3YWl0IG9Nb2RlbC5zdWJtaXRCYXRjaChcIiRhdXRvXCIpO1xuXG5cdFx0XHQvLyBXYWl0IGZvciBhbGwgY3VycmVudGx5IHJ1bm5pbmcgY2hhbmdlc1xuXHRcdFx0Ly8gRm9yIHRoZSB0aW1lIGJlaW5nIHdlIGFncmVlZCB3aXRoIHRoZSB2NCBtb2RlbCB0ZWFtIHRvIHVzZSBhbiBpbnRlcm5hbCBtZXRob2QuIFdlJ2xsIHJlcGxhY2UgaXQgb25jZVxuXHRcdFx0Ly8gYSBwdWJsaWMgb3IgcmVzdHJpY3RlZCBtZXRob2Qgd2FzIHByb3ZpZGVkXG5cdFx0XHRhd2FpdCBvTW9kZWwub1JlcXVlc3Rvci53YWl0Rm9yUnVubmluZ0NoYW5nZVJlcXVlc3RzKFwiJGF1dG9cIik7XG5cblx0XHRcdC8vIENoZWNrIGlmIGFsbCBjaGFuZ2VzIHdlcmUgc3VibWl0dGVkIHN1Y2Nlc3NmdWxseVxuXHRcdFx0aWYgKG9Nb2RlbC5oYXNQZW5kaW5nQ2hhbmdlcyhcIiRhdXRvXCIpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInN1Ym1pdCBvZiBvcGVuIGNoYW5nZXMgZmFpbGVkXCIpO1xuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvTG9ja09iamVjdCkpIHtcblx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0xvY2tPYmplY3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9oYW5kbGVTdGlja3lPbihvQ29udGV4dDogQ29udGV4dCkge1xuXHRcdHJldHVybiB0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5oYW5kbGVTdGlja3lPbihvQ29udGV4dCk7XG5cdH1cblxuXHRfaGFuZGxlU3RpY2t5T2ZmKCkge1xuXHRcdHJldHVybiB0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5oYW5kbGVTdGlja3lPZmYoKTtcblx0fVxuXG5cdF9vbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmdldEludGVybmFsRWRpdEZsb3coKS5vbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uKCk7XG5cdH1cblxuXHRfc2V0U3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyhwcm9ncmFtbWluZ01vZGVsOiBhbnksIG1vZGVsOiBPRGF0YU1vZGVsKSB7XG5cdFx0aWYgKHByb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRjb25zdCBpbnRlcm5hbE1vZGVsID0gdGhpcy5fZ2V0SW50ZXJuYWxNb2RlbCgpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9zZXNzaW9uT25cIiwgdHJ1ZSk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3N0aWNreVNlc3Npb25Ub2tlblwiLCAobW9kZWwuZ2V0SHR0cEhlYWRlcnModHJ1ZSkgYXMgYW55KVtcIlNBUC1Db250ZXh0SWRcIl0pO1xuXHRcdH1cblx0fVxuXG5cdF9yZW1vdmVTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzKHByb2dyYW1taW5nTW9kZWw6IGFueSkge1xuXHRcdGlmIChwcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSkge1xuXHRcdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IHRoaXMuX2dldEludGVybmFsTW9kZWwoKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvc2Vzc2lvbk9uXCIsIGZhbHNlKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvc3RpY2t5U2Vzc2lvblRva2VuXCIsIHVuZGVmaW5lZCk7XG5cdFx0XHR0aGlzLl9oYW5kbGVTdGlja3lPZmYoLypvQ29udGV4dCovKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBfaGFuZGxlTmV3Q29udGV4dChcblx0XHRvQ29udGV4dDogQ29udGV4dCxcblx0XHRiRWRpdGFibGU6IGJvb2xlYW4sXG5cdFx0YlJlY3JlYXRlQ29udGV4dDogYm9vbGVhbixcblx0XHRiRHJhZnROYXZpZ2F0aW9uOiBib29sZWFuLFxuXHRcdGJGb3JjZUZvY3VzID0gZmFsc2Vcblx0KSB7XG5cdFx0aWYgKCF0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgdGhpcy5fZ2V0Um91dGluZ0xpc3RlbmVyKCkubmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQsIHtcblx0XHRcdGNoZWNrTm9IYXNoQ2hhbmdlOiB0cnVlLFxuXHRcdFx0ZWRpdGFibGU6IGJFZGl0YWJsZSxcblx0XHRcdGJQZXJzaXN0T1BTY3JvbGw6IHRydWUsXG5cdFx0XHRiUmVjcmVhdGVDb250ZXh0OiBiUmVjcmVhdGVDb250ZXh0LFxuXHRcdFx0YkRyYWZ0TmF2aWdhdGlvbjogYkRyYWZ0TmF2aWdhdGlvbixcblx0XHRcdHNob3dQbGFjZWhvbGRlcjogZmFsc2UsXG5cdFx0XHRiRm9yY2VGb2N1czogYkZvcmNlRm9jdXMsXG5cdFx0XHRrZWVwQ3VycmVudExheW91dDogdHJ1ZVxuXHRcdH0pO1xuXHR9XG5cblx0X2dldEJvdW5kQ29udGV4dCh2aWV3OiBhbnksIHBhcmFtczogYW55KSB7XG5cdFx0Y29uc3Qgdmlld0xldmVsID0gdmlldy5nZXRWaWV3RGF0YSgpLnZpZXdMZXZlbDtcblx0XHRjb25zdCBiUmVmcmVzaEFmdGVyQWN0aW9uID0gdmlld0xldmVsID4gMSB8fCAodmlld0xldmVsID09PSAxICYmIHBhcmFtcy5jb250cm9sSWQpO1xuXHRcdHJldHVybiAhcGFyYW1zLmlzTmF2aWdhYmxlIHx8ICEhYlJlZnJlc2hBZnRlckFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlcmUgYXJlIHZhbGlkYXRpb24gKHBhcnNlKSBlcnJvcnMgZm9yIGNvbnRyb2xzIGJvdW5kIHRvIGEgZ2l2ZW4gY29udGV4dFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2NoZWNrRm9yVmFsaWRhdGlvbkVycm9yc1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgcmVzb2x2ZXMgaWYgdGhlcmUgYXJlIG5vIHZhbGlkYXRpb24gZXJyb3JzLCBhbmQgcmVqZWN0cyBpZiB0aGVyZSBhcmUgdmFsaWRhdGlvbiBlcnJvcnNcblx0ICovXG5cblx0X2NoZWNrRm9yVmFsaWRhdGlvbkVycm9ycygpIHtcblx0XHRyZXR1cm4gdGhpcy5fc3luY1Rhc2soKS50aGVuKCgpID0+IHtcblx0XHRcdGNvbnN0IHNWaWV3SWQgPSB0aGlzLmJhc2UuZ2V0VmlldygpLmdldElkKCk7XG5cdFx0XHRjb25zdCBhTWVzc2FnZXMgPSBzYXAudWkuZ2V0Q29yZSgpLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRcdFx0bGV0IG9Db250cm9sO1xuXHRcdFx0bGV0IG9NZXNzYWdlO1xuXG5cdFx0XHRpZiAoIWFNZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShcIk5vIHZhbGlkYXRpb24gZXJyb3JzIGZvdW5kXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFNZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRvTWVzc2FnZSA9IGFNZXNzYWdlc1tpXTtcblx0XHRcdFx0aWYgKG9NZXNzYWdlLnZhbGlkYXRpb24pIHtcblx0XHRcdFx0XHRvQ29udHJvbCA9IENvcmUuYnlJZChvTWVzc2FnZS5nZXRDb250cm9sSWQoKSk7XG5cdFx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0XHRpZiAob0NvbnRyb2wuZ2V0SWQoKSA9PT0gc1ZpZXdJZCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJ2YWxpZGF0aW9uIGVycm9ycyBleGlzdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9yZWZyZXNoTGlzdElmUmVxdWlyZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvUmVzcG9uc2UgVGhlIHJlc3BvbnNlIG9mIHRoZSBib3VuZCBhY3Rpb24gYW5kIHRoZSBuYW1lcyBvZiB0aGUga2V5IGZpZWxkc1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGJvdW5kIGNvbnRleHQgb24gd2hpY2ggdGhlIGFjdGlvbiB3YXMgZXhlY3V0ZWRcblx0ICogQHJldHVybnMgQWx3YXlzIHJlc29sdmVzIHRvIHBhcmFtIG9SZXNwb25zZVxuXHQgKi9cblx0X3JlZnJlc2hMaXN0SWZSZXF1aXJlZChvUmVzcG9uc2U6IGFueSwgb0NvbnRleHQ6IENvbnRleHQpIHtcblx0XHRpZiAoIW9Db250ZXh0IHx8ICFvUmVzcG9uc2UgfHwgIW9SZXNwb25zZS5vRGF0YSkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0XHRjb25zdCBvQmluZGluZyA9IG9Db250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHQvLyByZWZyZXNoIG9ubHkgbGlzdHNcblx0XHRpZiAob0JpbmRpbmcgJiYgb0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdGNvbnN0IG9Db250ZXh0RGF0YSA9IG9SZXNwb25zZS5vRGF0YTtcblx0XHRcdGNvbnN0IGFLZXlzID0gb1Jlc3BvbnNlLmtleXM7XG5cdFx0XHRjb25zdCBvQ3VycmVudERhdGEgPSBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdGxldCBiUmV0dXJuZWRDb250ZXh0SXNTYW1lID0gdHJ1ZTtcblx0XHRcdC8vIGVuc3VyZSBjb250ZXh0IGlzIGluIHRoZSByZXNwb25zZVxuXHRcdFx0aWYgKE9iamVjdC5rZXlzKG9Db250ZXh0RGF0YSkubGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGNoZWNrIGlmIGNvbnRleHQgaW4gcmVzcG9uc2UgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGJvdW5kIGNvbnRleHRcblx0XHRcdFx0YlJldHVybmVkQ29udGV4dElzU2FtZSA9IGFLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChzS2V5OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0N1cnJlbnREYXRhW3NLZXldID09PSBvQ29udGV4dERhdGFbc0tleV07XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoIWJSZXR1cm5lZENvbnRleHRJc1NhbWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcblx0XHRcdFx0XHRcdGlmICgob0JpbmRpbmcgYXMgYW55KS5pc1Jvb3QoKSkge1xuXHRcdFx0XHRcdFx0XHRvQmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdG9CaW5kaW5nLnJlZnJlc2goKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5nZXRWaWV3KCkpO1xuXHRcdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50XG5cdFx0XHRcdFx0XHRcdFx0LmdldFNpZGVFZmZlY3RzU2VydmljZSgpXG5cdFx0XHRcdFx0XHRcdFx0LnJlcXVlc3RTaWRlRWZmZWN0cyhbeyAkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogb0JpbmRpbmcuZ2V0UGF0aCgpIH1dLCBvQmluZGluZy5nZXRDb250ZXh0KCkgYXMgQ29udGV4dClcblx0XHRcdFx0XHRcdFx0XHQudGhlbihcblx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVmcmVzaGluZyB0aGUgdGFibGVcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlZnJlc2hpbmcgdGhlIHRhYmxlXCIsIGUpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIHJlc29sdmUgd2l0aCBvUmVzcG9uc2UgdG8gbm90IGRpc3R1cmIgdGhlIHByb21pc2UgY2hhaW4gYWZ0ZXJ3YXJkc1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdF9mZXRjaFNlbWFudGljS2V5VmFsdWVzKG9Db250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBhbnksXG5cdFx0XHRzRW50aXR5U2V0TmFtZSA9IG9NZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQob0NvbnRleHQuZ2V0UGF0aCgpKS5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKSxcblx0XHRcdGFTZW1hbnRpY0tleXMgPSBTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY0tleXMob01ldGFNb2RlbCwgc0VudGl0eVNldE5hbWUpO1xuXG5cdFx0aWYgKGFTZW1hbnRpY0tleXMgJiYgYVNlbWFudGljS2V5cy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGFSZXF1ZXN0UHJvbWlzZXMgPSBhU2VtYW50aWNLZXlzLm1hcChmdW5jdGlvbiAob0tleTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KG9LZXkuJFByb3BlcnR5UGF0aCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKGFSZXF1ZXN0UHJvbWlzZXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIHRoZSBsYXRlc3QgY29udGV4dCBpbiB0aGUgbWV0YWRhdGEgaGllcmFyY2h5IGZyb20gcm9vdEJpbmRpbmcgdG8gZ2l2ZW4gY29udGV4dCBwb2ludGluZyB0byBnaXZlbiBlbnRpdHlUeXBlXG5cdCAqIGlmIGFueSBzdWNoIGNvbnRleHQgZXhpc3RzLiBPdGhlcndpc2UsIGl0IHJldHVybnMgdGhlIG9yaWdpbmFsIGNvbnRleHQuXG5cdCAqIE5vdGU6IEl0IGlzIG9ubHkgbmVlZGVkIGFzIHdvcmstYXJvdW5kIGZvciBpbmNvcnJlY3QgbW9kZWxsaW5nLiBDb3JyZWN0IG1vZGVsbGluZyB3b3VsZCBpbXBseSBhIERhdGFGaWVsZEZvckFjdGlvbiBpbiBhIExpbmVJdGVtXG5cdCAqIHRvIHBvaW50IHRvIGFuIG92ZXJsb2FkIGRlZmluZWQgZWl0aGVyIG9uIHRoZSBjb3JyZXNwb25kaW5nIEVudGl0eVR5cGUgb3IgYSBjb2xsZWN0aW9uIG9mIHRoZSBzYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm9vdENvbnRleHQgVGhlIGNvbnRleHQgdG8gc3RhcnQgc2VhcmNoaW5nIGZyb21cblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIFRoZSBsaXN0QmluZGluZyBvZiB0aGUgdGFibGVcblx0ICogQHBhcmFtIG92ZXJsb2FkRW50aXR5VHlwZSBUaGUgQWN0aW9uT3ZlcmxvYWQgZW50aXR5IHR5cGUgdG8gc2VhcmNoIGZvclxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBjb250ZXh0IG9mIHRoZSBBY3Rpb25PdmVybG9hZCBlbnRpdHlcblx0ICovXG5cdF9nZXRBY3Rpb25PdmVybG9hZENvbnRleHRGcm9tTWV0YWRhdGFQYXRoKHJvb3RDb250ZXh0OiBDb250ZXh0LCBsaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZywgb3ZlcmxvYWRFbnRpdHlUeXBlOiBzdHJpbmcpOiBDb250ZXh0IHtcblx0XHRjb25zdCBtb2RlbDogT0RhdGFNb2RlbCA9IHJvb3RDb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3QgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGxldCBjb250ZXh0U2VnbWVudHM6IHN0cmluZ1tdID0gbGlzdEJpbmRpbmcuZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRsZXQgY3VycmVudENvbnRleHQ6IENvbnRleHQgPSByb290Q29udGV4dDtcblxuXHRcdC8vIFdlIGV4cGVjdCB0aGF0IHRoZSBsYXN0IHNlZ21lbnQgb2YgdGhlIGxpc3RCaW5kaW5nIGlzIHRoZSBMaXN0QmluZGluZyBvZiB0aGUgdGFibGUuIFJlbW92ZSB0aGlzIGZyb20gY29udGV4dFNlZ21lbnRzXG5cdFx0Ly8gYmVjYXVzZSBpdCBpcyBpbmNvcnJlY3QgdG8gZXhlY3V0ZSBiaW5kQ29udGV4dCBvbiBhIGxpc3QuIFdlIGRvIG5vdCBhbnl3YXkgbmVlZCB0byBzZWFyY2ggdGhpcyBjb250ZXh0IGZvciB0aGUgb3ZlcmxvYWQuXG5cdFx0Y29udGV4dFNlZ21lbnRzLnBvcCgpO1xuXHRcdGlmIChjb250ZXh0U2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRjb250ZXh0U2VnbWVudHMgPSBbXCJcIl07IC8vIERvbid0IGxlYXZlIGNvbnRleHRTZWdtZW50cyB1bmRlZmluZWRcblx0XHR9XG5cblx0XHRpZiAoY29udGV4dFNlZ21lbnRzWzBdICE9PSBcIlwiKSB7XG5cdFx0XHRjb250ZXh0U2VnbWVudHMudW5zaGlmdChcIlwiKTsgLy8gdG8gYWxzbyBnZXQgdGhlIHJvb3QgY29udGV4dCwgaS5lLiB0aGUgYmluZGluZ0NvbnRleHQgb2YgdGhlIHRhYmxlXG5cdFx0fVxuXHRcdC8vIGxvYWQgYWxsIHRoZSBwYXJlbnQgY29udGV4dHMgaW50byBhbiBhcnJheVxuXHRcdGNvbnN0IHBhcmVudENvbnRleHRzOiBDb250ZXh0W10gPSBjb250ZXh0U2VnbWVudHNcblx0XHRcdC5tYXAoKHBhdGhTZWdtZW50OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKHBhdGhTZWdtZW50ICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0Y3VycmVudENvbnRleHQgPSBtb2RlbC5iaW5kQ29udGV4dChwYXRoU2VnbWVudCwgY3VycmVudENvbnRleHQpLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIENyZWF0aW5nIGEgbmV3IGNvbnRleHQgdXNpbmcgYmluZENvbnRleHQoLi4uKS5nZXRCb3VuZENvbnRleHQoKSBkb2VzIG5vdCB3b3JrIGlmIHRoZSBldGFnIGlzIG5lZWRlZC4gQWNjb3JkaW5nIHRvIG1vZGVsIGNvbGxlYWd1ZXMsXG5cdFx0XHRcdFx0Ly8gd2Ugc2hvdWxkIGFsd2F5cyB1c2UgYW4gZXhpc3RpbmcgY29udGV4dCBpZiBwb3NzaWJsZS5cblx0XHRcdFx0XHQvLyBDdXJyZW50bHksIHRoZSBvbmx5IGV4YW1wbGUgd2Uga25vdyBhYm91dCBpcyB1c2luZyB0aGUgcm9vdENvbnRleHQgLSBhbmQgaW4gdGhpcyBjYXNlLCB3ZSBjYW4gb2J2aW91c2x5IHJldXNlIHRoYXQgZXhpc3RpbmcgY29udGV4dC5cblx0XHRcdFx0XHQvLyBJZiBvdGhlciBleGFtcGxlcyBzaG91bGQgY29tZSB1cCwgdGhlIGJlc3QgcG9zc2libGUgd29yayBhcm91bmQgd291bGQgYmUgdG8gcmVxdWVzdCBzb21lIGRhdGEgdG8gZ2V0IGFuIGV4aXN0aW5nIGNvbnRleHQuIFRvIGtlZXAgdGhlXG5cdFx0XHRcdFx0Ly8gcmVxdWVzdCBhcyBzbWFsbCBhbmQgZmFzdCBhcyBwb3NzaWJsZSwgd2Ugc2hvdWxkIHJlcXVlc3Qgb25seSB0aGUgZmlyc3Qga2V5IHByb3BlcnR5LiBBcyB0aGlzIHdvdWxkIGludHJvZHVjZSBhc3luY2hyb25pc20sIGFuZCBhbnl3YXlcblx0XHRcdFx0XHQvLyB0aGUgd2hvbGUgbG9naWMgaXMgb25seSBwYXJ0IG9mIHdvcmstYXJvdW5kIGZvciBpbmNvcnJlY3QgbW9kZWxsaW5nLCB3ZSB3YWl0IHVudGlsIHdlIGhhdmUgYW4gZXhhbXBsZSBuZWVkaW5nIGl0IGJlZm9yZSBpbXBsZW1lbnRpbmcgdGhpcy5cblx0XHRcdFx0XHRjdXJyZW50Q29udGV4dCA9IHJvb3RDb250ZXh0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjdXJyZW50Q29udGV4dDtcblx0XHRcdH0pXG5cdFx0XHQucmV2ZXJzZSgpO1xuXHRcdC8vIHNlYXJjaCBmb3IgY29udGV4dCBiYWNrd2FyZHNcblx0XHRjb25zdCBvdmVybG9hZENvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQgPSBwYXJlbnRDb250ZXh0cy5maW5kKFxuXHRcdFx0KHBhcmVudENvbnRleHQ6IENvbnRleHQpID0+XG5cdFx0XHRcdChtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQocGFyZW50Q29udGV4dC5nZXRQYXRoKCkpLmdldE9iamVjdChcIiRUeXBlXCIpIGFzIHVua25vd24gYXMgc3RyaW5nKSA9PT0gb3ZlcmxvYWRFbnRpdHlUeXBlXG5cdFx0KTtcblx0XHRyZXR1cm4gb3ZlcmxvYWRDb250ZXh0IHx8IGxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKSE7XG5cdH1cblxuXHRfY3JlYXRlU2libGluZ0luZm8oY3VycmVudENvbnRleHQ6IENvbnRleHQsIG5ld0NvbnRleHQ6IENvbnRleHQpOiBTaWJsaW5nSW5mb3JtYXRpb24ge1xuXHRcdHJldHVybiB7XG5cdFx0XHR0YXJnZXRDb250ZXh0OiBuZXdDb250ZXh0LFxuXHRcdFx0cGF0aE1hcHBpbmc6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG9sZFBhdGg6IGN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdFx0XHRuZXdQYXRoOiBuZXdDb250ZXh0LmdldFBhdGgoKVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fTtcblx0fVxuXG5cdF91cGRhdGVQYXRoc0luSGlzdG9yeShtYXBwaW5nczogeyBvbGRQYXRoOiBzdHJpbmc7IG5ld1BhdGg6IHN0cmluZyB9W10pIHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKTtcblx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuc2V0UGF0aE1hcHBpbmcobWFwcGluZ3MpO1xuXG5cdFx0Ly8gQWxzbyB1cGRhdGUgdGhlIHNlbWFudGljIG1hcHBpbmcgaW4gdGhlIHJvdXRpbmcgc2VydmljZVxuXHRcdGNvbnN0IGxhc3RTZW1hbnRpY01hcHBpbmcgPSB0aGlzLl9nZXRTZW1hbnRpY01hcHBpbmcoKTtcblx0XHRpZiAobWFwcGluZ3MubGVuZ3RoICYmIGxhc3RTZW1hbnRpY01hcHBpbmc/LnRlY2huaWNhbFBhdGggPT09IG1hcHBpbmdzW21hcHBpbmdzLmxlbmd0aCAtIDFdLm9sZFBhdGgpIHtcblx0XHRcdGxhc3RTZW1hbnRpY01hcHBpbmcudGVjaG5pY2FsUGF0aCA9IG1hcHBpbmdzW21hcHBpbmdzLmxlbmd0aCAtIDFdLm5ld1BhdGg7XG5cdFx0fVxuXHR9XG5cblx0X2dldE5hdmlnYXRpb25UYXJnZXRGb3JFZGl0KGNvbnRleHQ6IENvbnRleHQsIG5ld0RvY3VtZW50Q29udGV4dDogQ29udGV4dCwgc2libGluZ0luZm86IFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZCkge1xuXHRcdGxldCBjb250ZXh0VG9OYXZpZ2F0ZTogQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0XHRzaWJsaW5nSW5mbyA9IHNpYmxpbmdJbmZvID8/IHRoaXMuX2NyZWF0ZVNpYmxpbmdJbmZvKGNvbnRleHQsIG5ld0RvY3VtZW50Q29udGV4dCk7XG5cdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdGlmIChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0LmdldFBhdGgoKSAhPSBuZXdEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRjb250ZXh0VG9OYXZpZ2F0ZSA9IHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0fVxuXHRcdHJldHVybiBjb250ZXh0VG9OYXZpZ2F0ZTtcblx0fVxuXHQvKipcblx0ICogVGhpcyBtZXRob2QgY3JlYXRlcyBhIHNpYmxpbmcgY29udGV4dCBmb3IgYSBzdWJvYmplY3QgcGFnZSwgYW5kIGNhbGN1bGF0ZXMgYSBzaWJsaW5nIHBhdGhcblx0ICogZm9yIGFsbCBpbnRlcm1lZGlhdGUgcGF0aHMgYmV0d2VlbiB0aGUgb2JqZWN0IHBhZ2UgYW5kIHRoZSBzdWJvYmplY3QgcGFnZS5cblx0ICpcblx0ICogQHBhcmFtIHJvb3RDdXJyZW50Q29udGV4dCBUaGUgY29udGV4dCBmb3IgdGhlIHJvb3Qgb2YgdGhlIGRyYWZ0XG5cdCAqIEBwYXJhbSByaWdodG1vc3RDdXJyZW50Q29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgc3Vib2JqZWN0XG5cdCAqIEBwYXJhbSBzUHJvZ3JhbW1pbmdNb2RlbCBUaGUgcHJvZ3JhbW1pbmcgbW9kZWxcblx0ICogQHBhcmFtIGRvTm90Q29tcHV0ZUlmUm9vdCBJZiB0cnVlLCB3ZSBkb24ndCBjb21wdXRlIHNpYmxpbmdJbmZvIGlmIHRoZSByb290IGFuZCB0aGUgcmlnaHRtb3N0IGNvbnRleHRzIGFyZSB0aGUgc2FtZVxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBzaWJsaW5nSW5mb3JtYXRpb24gb2JqZWN0XG5cdCAqL1xuXHRhc3luYyBfY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihcblx0XHRyb290Q3VycmVudENvbnRleHQ6IENvbnRleHQsXG5cdFx0cmlnaHRtb3N0Q3VycmVudENvbnRleHQ6IENvbnRleHQgfCBudWxsIHwgdW5kZWZpbmVkLFxuXHRcdHNQcm9ncmFtbWluZ01vZGVsOiBzdHJpbmcsXG5cdFx0ZG9Ob3RDb21wdXRlSWZSb290OiBib29sZWFuXG5cdCk6IFByb21pc2U8U2libGluZ0luZm9ybWF0aW9uIHwgdW5kZWZpbmVkPiB7XG5cdFx0cmlnaHRtb3N0Q3VycmVudENvbnRleHQgPSByaWdodG1vc3RDdXJyZW50Q29udGV4dCA/PyByb290Q3VycmVudENvbnRleHQ7XG5cdFx0aWYgKCFyaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkuc3RhcnRzV2l0aChyb290Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpKSkge1xuXHRcdFx0Ly8gV3JvbmcgdXNhZ2UgISFcblx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCBjb21wdXRlIHJpZ2h0bW9zdCBzaWJsaW5nIGNvbnRleHRcIik7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY29tcHV0ZSByaWdodG1vc3Qgc2libGluZyBjb250ZXh0XCIpO1xuXHRcdH1cblx0XHRpZiAoZG9Ob3RDb21wdXRlSWZSb290ICYmIHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSA9PT0gcm9vdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1vZGVsID0gcm9vdEN1cnJlbnRDb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHRyZXR1cm4gZHJhZnQuY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihyb290Q3VycmVudENvbnRleHQsIHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gSWYgbm90IGluIGRyYWZ0IG1vZGUsIHdlIGp1c3QgcmVjcmVhdGUgYSBjb250ZXh0IGZyb20gdGhlIHBhdGggb2YgdGhlIHJpZ2h0bW9zdCBjb250ZXh0XG5cdFx0XHQvLyBObyBwYXRoIG1hcHBpbmcgaXMgbmVlZGVkXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0YXJnZXRDb250ZXh0OiBtb2RlbC5iaW5kQ29udGV4dChyaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkpLmdldEJvdW5kQ29udGV4dCgpLFxuXHRcdFx0XHRwYXRoTWFwcGluZzogW11cblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cdF9pc0ZjbEVuYWJsZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLmdldFZpZXcoKSkuX2lzRmNsRW5hYmxlZCgpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEVkaXRGbG93O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXNDQSxNQUFNQSxZQUFZLEdBQUdDLFNBQVMsQ0FBQ0QsWUFBWTtJQUMxQ0UsZ0JBQWdCLEdBQUdELFNBQVMsQ0FBQ0MsZ0JBQWdCO0lBQzdDQyxTQUFTLEdBQUdGLFNBQVMsQ0FBQ0UsU0FBUztJQUMvQkMsV0FBVyxHQUFHSCxTQUFTLENBQUNHLFdBQVc7SUFDbkNDLFFBQVEsR0FBR0osU0FBUyxDQUFDSSxRQUFRO0lBQzdCQyxXQUFXLEdBQUdMLFNBQVMsQ0FBQ0ssV0FBVztJQUNuQ0MsV0FBVyxHQUFHQyxXQUFXLENBQUNELFdBQVc7O0VBRXRDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkEsSUFRTUUsUUFBUSxXQURiQyxjQUFjLENBQUMsMkNBQTJDLENBQUMsVUFtQzFEQyxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQWdGaEJELGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBdUJoQkQsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUE2RWhCRCxlQUFl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