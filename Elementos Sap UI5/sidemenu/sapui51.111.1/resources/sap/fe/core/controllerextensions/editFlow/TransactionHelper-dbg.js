/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/editFlow/operations", "sap/fe/core/controllerextensions/editFlow/sticky", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/FPMHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/m/MessageToast", "sap/m/Popover", "sap/m/Text", "sap/m/VBox", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel", "../../helpers/ToES6Promise"], function (Log, CommonUtils, BusyLocker, draft, operations, sticky, messageHandling, deleteHelper, FPMHelper, ModelHelper, StableIdHelper, FELibrary, Button, Dialog, MessageBox, MessageToast, Popover, Text, VBox, Core, Fragment, coreLibrary, XMLPreprocessor, XMLTemplateProcessor, JSONModel, toES6Promise) {
  "use strict";

  var generate = StableIdHelper.generate;
  const CreationMode = FELibrary.CreationMode;
  const ProgrammingModel = FELibrary.ProgrammingModel;
  const ValueState = coreLibrary.ValueState;
  /* Make sure that the mParameters is not the oEvent */
  function getParameters(mParameters) {
    if (mParameters && mParameters.getMetadata && mParameters.getMetadata().getName() === "sap.ui.base.Event") {
      mParameters = {};
    }
    return mParameters || {};
  }
  let TransactionHelper = /*#__PURE__*/function () {
    function TransactionHelper() {}
    var _proto = TransactionHelper.prototype;
    _proto.busyLock = function busyLock(appComponent, busyPath) {
      BusyLocker.lock(appComponent.getModel("ui"), busyPath);
    };
    _proto.busyUnlock = function busyUnlock(appComponent, busyPath) {
      BusyLocker.unlock(appComponent.getModel("ui"), busyPath);
    };
    _proto.getProgrammingModel = function getProgrammingModel(source) {
      let path;
      if (source.isA("sap.ui.model.odata.v4.Context")) {
        path = source.getPath();
      } else {
        path = (source.isRelative() ? source.getResolvedPath() : source.getPath()) ?? "";
      }
      const metaModel = source.getModel().getMetaModel();
      if (ModelHelper.isDraftSupported(metaModel, path)) {
        return ProgrammingModel.Draft;
      } else if (ModelHelper.isStickySessionSupported(metaModel)) {
        return ProgrammingModel.Sticky;
      } else {
        return ProgrammingModel.NonDraft;
      }
    }

    /**
     * Validates a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the document to be validated
     * @param [mParameters] Can contain the following attributes:
     * @param [mParameters.data] A map of data that should be validated
     * @param [mParameters.customValidationFunction] A string representing the path to the validation function
     * @param oView Contains the object of the current view
     * @returns Promise resolves with result of the custom validation function
     * @ui5-restricted
     * @final
     */;
    _proto.validateDocument = function validateDocument(oContext, mParameters, oView) {
      const sCustomValidationFunction = mParameters && mParameters.customValidationFunction;
      if (sCustomValidationFunction) {
        const sModule = sCustomValidationFunction.substring(0, sCustomValidationFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
          sFunctionName = sCustomValidationFunction.substring(sCustomValidationFunction.lastIndexOf(".") + 1, sCustomValidationFunction.length),
          mData = mParameters.data;
        delete mData["@$ui5.context.isTransient"];
        return FPMHelper.validationWrapper(sModule, sFunctionName, mData, oView, oContext);
      }
      return Promise.resolve([]);
    }

    /**
     * Creates a new document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oMainListBinding OData V4 ListBinding object
     * @param [mInParameters] Optional, can contain the following attributes:
     * @param [mInParameters.data] A map of data that should be sent within the POST
     * @param [mInParameters.busyMode] Global (default), Local, None TODO: to be refactored
     * @param [mInParameters.busyId] ID of the local busy indicator
     * @param [mInParameters.keepTransientContextOnFailed] If set, the context stays in the list if the POST failed and POST will be repeated with the next change
     * @param [mInParameters.inactive] If set, the context is set as inactive for empty rows
     * @param [mInParameters.skipParameterDialog] Skips the action parameter dialog
     * @param appComponent The app component
     * @param messageHandler The message handler extension
     * @param fromCopyPaste True if the creation has been triggered by a paste action
     * @param currentView The current view
     * @returns Promise resolves with new binding context
     * @ui5-restricted
     * @final
     */;
    _proto.createDocument = async function createDocument(oMainListBinding, mInParameters, appComponent, messageHandler, fromCopyPaste, currentView) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const oModel = oMainListBinding.getModel(),
        oMetaModel = oModel.getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath()),
        sCreateHash = appComponent.getRouterProxy().getHash(),
        oComponentData = appComponent.getComponentData(),
        oStartupParameters = oComponentData && oComponentData.startupParameters || {},
        sNewAction = !oMainListBinding.isRelative() ? this._getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath) : undefined;
      const mBindingParameters = {
        $$patchWithoutSideEffects: true
      };
      const sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
      let sBusyPath = "/busy";
      let sFunctionName = oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) || oMetaModel.getObject(`${ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath))}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`);
      let bFunctionOnNavProp;
      let oNewDocumentContext;
      if (sFunctionName) {
        if (oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) && ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath)) !== sMetaPath) {
          bFunctionOnNavProp = true;
        } else {
          bFunctionOnNavProp = false;
        }
      }
      if (sMessagesPath) {
        mBindingParameters["$select"] = sMessagesPath;
      }
      const mParameters = getParameters(mInParameters);
      if (!oMainListBinding) {
        throw new Error("Binding required for new document creation");
      }
      const sProgrammingModel = this.getProgrammingModel(oMainListBinding);
      if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
        throw new Error("Create document only allowed for draft or sticky session supported services");
      }
      if (mParameters.busyMode === "Local") {
        sBusyPath = `/busyLocal/${mParameters.busyId}`;
      }
      mParameters.beforeCreateCallBack = fromCopyPaste ? null : mParameters.beforeCreateCallBack;
      this.busyLock(appComponent, sBusyPath);
      const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
      let oResult;
      try {
        if (sNewAction) {
          oResult = await this.callAction(sNewAction, {
            contexts: oMainListBinding.getHeaderContext(),
            showActionParameterDialog: true,
            label: this._getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore),
            bindingParameters: mBindingParameters,
            parentControl: mParameters.parentControl,
            bIsCreateAction: true,
            skipParameterDialog: mParameters.skipParameterDialog
          }, null, appComponent, messageHandler);
        } else {
          const bIsNewPageCreation = mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.Inline;
          const aNonComputedVisibleKeyFields = bIsNewPageCreation ? CommonUtils.getNonComputedVisibleFields(oMetaModel, sMetaPath, currentView) : [];
          sFunctionName = fromCopyPaste ? null : sFunctionName;
          let sFunctionPath, oFunctionContext;
          if (sFunctionName) {
            //bound to the source entity:
            if (bFunctionOnNavProp) {
              sFunctionPath = oMainListBinding.getContext() && `${oMetaModel.getMetaPath(oMainListBinding.getContext().getPath())}/${sFunctionName}`;
              oFunctionContext = oMainListBinding.getContext();
            } else {
              sFunctionPath = oMainListBinding.getHeaderContext() && `${oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath())}/${sFunctionName}`;
              oFunctionContext = oMainListBinding.getHeaderContext();
            }
          }
          const oFunction = sFunctionPath && oMetaModel.createBindingContext(sFunctionPath);
          try {
            let oData;
            try {
              const oContext = oFunction && oFunction.getObject() && oFunction.getObject()[0].$IsBound ? await operations.callBoundFunction(sFunctionName, oFunctionContext, oModel) : await operations.callFunctionImport(sFunctionName, oModel);
              if (oContext) {
                oData = oContext.getObject();
              }
            } catch (oError) {
              Log.error(`Error while executing the function ${sFunctionName}`, oError);
              throw oError;
            }
            mParameters.data = oData ? Object.assign({}, oData, mParameters.data) : mParameters.data;
            if (mParameters.data) {
              delete mParameters.data["@odata.context"];
            }
            if (aNonComputedVisibleKeyFields.length > 0) {
              oResult = await this._launchDialogWithKeyFields(oMainListBinding, aNonComputedVisibleKeyFields, oModel, mParameters, appComponent, messageHandler);
              oNewDocumentContext = oResult.newContext;
            } else {
              if (mParameters.beforeCreateCallBack) {
                await toES6Promise(mParameters.beforeCreateCallBack({
                  contextPath: oMainListBinding && oMainListBinding.getPath()
                }));
              }
              oNewDocumentContext = oMainListBinding.create(mParameters.data, true, mParameters.createAtEnd, mParameters.inactive);
              if (!mParameters.inactive) {
                oResult = await this.onAfterCreateCompletion(oMainListBinding, oNewDocumentContext, mParameters);
              }
            }
          } catch (oError) {
            Log.error("Error while creating the new document", oError);
            throw oError;
          }
        }
        oNewDocumentContext = oNewDocumentContext || oResult;
        await messageHandler.showMessageDialog({
          control: mParameters.parentControl
        });
        return oNewDocumentContext;
      } catch (error) {
        var _oNewDocumentContext;
        // TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
        await messageHandler.showMessageDialog({
          control: mParameters.parentControl
        });
        if ((error === FELibrary.Constants.ActionExecutionFailed || error === FELibrary.Constants.CancelActionDialog) && (_oNewDocumentContext = oNewDocumentContext) !== null && _oNewDocumentContext !== void 0 && _oNewDocumentContext.isTransient()) {
          // This is a workaround suggested by model as Context.delete results in an error
          // TODO: remove the $direct once model resolves this issue
          // this line shows the expected console error Uncaught (in promise) Error: Request canceled: POST Travel; group: submitLater
          oNewDocumentContext.delete("$direct");
        }
        throw error;
      } finally {
        this.busyUnlock(appComponent, sBusyPath);
      }
    };
    _proto._isDraftEnabled = function _isDraftEnabled(vContexts) {
      const contextForDraftModel = vContexts[0];
      const sProgrammingModel = this.getProgrammingModel(contextForDraftModel);
      return sProgrammingModel === ProgrammingModel.Draft;
    }
    /**
     * Delete one or multiple document(s).
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param contexts Contexts Either one context or an array with contexts to be deleted
     * @param mParameters Optional, can contain the following attributes:
     * @param mParameters.title Title of the object to be deleted
     * @param mParameters.description Description of the object to be deleted
     * @param mParameters.numberOfSelectedContexts Number of objects selected
     * @param mParameters.noDialog To disable the confirmation dialog
     * @param appComponent The appComponent
     * @param resourceBundle The bundle to load text resources
     * @param messageHandler The message handler extension
     * @returns A Promise resolved once the document are deleted
     */;
    _proto.deleteDocument = function deleteDocument(contexts, mParameters, appComponent, resourceBundle, messageHandler) {
      const resourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
      let aParams;
      this.busyLock(appComponent);
      const contextsToDelete = Array.isArray(contexts) ? [...contexts] : [contexts];
      return new Promise((resolve, reject) => {
        try {
          const draftEnabled = this._isDraftEnabled(mParameters.selectedContexts || contextsToDelete);
          const items = [];
          const options = [];
          if (mParameters) {
            if (!mParameters.numberOfSelectedContexts) {
              // non-Table
              if (draftEnabled) {
                // Check if 1 of the drafts is locked by another user
                const lockedContext = contextsToDelete.find(context => {
                  const contextData = context.getObject();
                  return contextData.IsActiveEntity === true && contextData.HasDraftEntity === true && contextData.DraftAdministrativeData && contextData.DraftAdministrativeData.InProcessByUser && !contextData.DraftAdministrativeData.DraftIsCreatedByMe;
                });
                if (lockedContext) {
                  // Show message box with the name of the locking user and return
                  const lockingUserName = lockedContext.getObject().DraftAdministrativeData.InProcessByUser;
                  MessageBox.show(CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", resourceBundle, [lockingUserName]), {
                    title: resourceBundleCore.getText("C_COMMON_DELETE"),
                    onClose: reject
                  });
                  return;
                }
              }
              mParameters = getParameters(mParameters);
              let nonTableTxt = "";
              if (mParameters.title) {
                if (mParameters.description) {
                  aParams = [mParameters.title + " ", mParameters.description];
                } else {
                  aParams = [mParameters.title, ""];
                }
                nonTableTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", resourceBundle, aParams, mParameters.entitySetName);
              } else {
                nonTableTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", resourceBundle, undefined, mParameters.entitySetName);
              }
              options.push({
                type: "deletableContexts",
                contexts: contextsToDelete,
                text: nonTableTxt,
                selected: true,
                control: "text"
              });
            } else {
              // Table
              let totalDeletable = contextsToDelete.length;
              if (draftEnabled) {
                totalDeletable += mParameters.draftsWithNonDeletableActive.length + mParameters.draftsWithDeletableActive.length + mParameters.unSavedContexts.length + mParameters.createModeContexts.length;
                deleteHelper.updateDraftOptionsForDeletableTexts(mParameters, contextsToDelete, totalDeletable, resourceBundle, items, options);
              }
              deleteHelper.updateOptionsForDeletableTexts(mParameters, contextsToDelete, resourceBundle, options);
            }
          }

          // Content of Delete Dialog
          deleteHelper.updateContentForDeleteDialog(options, items);
          const vBox = new VBox({
            items: items
          });
          const sTitle = resourceBundleCore.getText("C_COMMON_DELETE");
          const fnConfirm = async () => {
            this.busyLock(appComponent);
            try {
              await deleteHelper.deleteConfirmHandler(options, mParameters, messageHandler, resourceBundle, appComponent, draftEnabled);
              resolve();
            } catch (oError) {
              reject();
            } finally {
              this.busyUnlock(appComponent);
            }
          };
          let dialogConfirmed = false;
          const oDialog = new Dialog({
            title: sTitle,
            state: "Warning",
            content: [vBox],
            ariaLabelledBy: items,
            beginButton: new Button({
              text: resourceBundleCore.getText("C_COMMON_DELETE"),
              type: "Emphasized",
              press: function () {
                messageHandling.removeBoundTransitionMessages();
                dialogConfirmed = true;
                oDialog.close();
                fnConfirm();
              }
            }),
            endButton: new Button({
              text: CommonUtils.getTranslatedText("C_COMMON_DIALOG_CANCEL", resourceBundle),
              press: function () {
                oDialog.close();
              }
            }),
            afterClose: function () {
              oDialog.destroy();
              // if dialog is closed unconfirmed (e.g. via "Cancel" or Escape button), ensure to reject promise
              if (!dialogConfirmed) {
                reject();
              }
            }
          });
          if (mParameters.noDialog) {
            fnConfirm();
          } else {
            oDialog.addStyleClass("sapUiContentPadding");
            oDialog.open();
          }
        } finally {
          this.busyUnlock(appComponent);
        }
      });
    }
    /**
     * Edits a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the active document
     * @param oView Current view
     * @param appComponent The appComponent
     * @param messageHandler The message handler extension
     * @returns Promise resolves with the new draft context in case of draft programming model
     * @ui5-restricted
     * @final
     */;
    _proto.editDocument = async function editDocument(oContext, oView, appComponent, messageHandler) {
      const sProgrammingModel = this.getProgrammingModel(oContext);
      if (!oContext) {
        throw new Error("Binding context to active document is required");
      }
      if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
        throw new Error("Edit is only allowed for draft or sticky session supported services");
      }
      this.busyLock(appComponent);
      // before triggering the edit action we'll have to remove all bound transition messages
      messageHandler.removeTransitionMessages();
      try {
        const oNewContext = sProgrammingModel === ProgrammingModel.Draft ? await draft.createDraftFromActiveDocument(oContext, appComponent, {
          bPreserveChanges: true,
          oView: oView
        }) : await sticky.editDocumentInStickySession(oContext, appComponent);
        await messageHandler.showMessageDialog();
        return oNewContext;
      } catch (err) {
        await messageHandler.showMessages({
          concurrentEditFlag: true
        });
        throw err;
      } finally {
        this.busyUnlock(appComponent);
      }
    }
    /**
     * Cancel 'edit' mode of a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the document to be canceled or deleted
     * @param [mInParameters] Optional, can contain the following attributes:
     * @param mInParameters.cancelButton Cancel Button of the discard popover (mandatory for now)
     * @param mInParameters.skipDiscardPopover Optional, supresses the discard popover incase of draft applications while navigating out of OP
     * @param appComponent The appComponent
     * @param resourceBundle The bundle to load text resources
     * @param messageHandler The message handler extension
     * @param isNewObject True if we're trying to cancel a newly created object
     * @param isObjectModified True if the object has been modified by the user
     * @returns Promise resolves with ???
     * @ui5-restricted
     * @final
     */;
    _proto.cancelDocument = async function cancelDocument(oContext, mInParameters, appComponent, resourceBundle, messageHandler, isNewObject, isObjectModified) {
      //context must always be passed - mandatory parameter
      if (!oContext) {
        throw new Error("No context exists. Pass a meaningful context");
      }
      this.busyLock(appComponent);
      const mParameters = getParameters(mInParameters);
      const oModel = oContext.getModel();
      const sProgrammingModel = this.getProgrammingModel(oContext);
      if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
        throw new Error("Cancel document only allowed for draft or sticky session supported services");
      }
      try {
        let returnedValue = false;
        if (sProgrammingModel === ProgrammingModel.Draft && !isObjectModified) {
          const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();
          const draftAdminData = await draftDataContext.requestObject();
          if (draftAdminData) {
            isObjectModified = draftAdminData.CreationDateTime !== draftAdminData.LastChangeDateTime;
          }
        }
        if (!mParameters.skipDiscardPopover) {
          await this._confirmDiscard(mParameters.cancelButton, isObjectModified, resourceBundle);
        }
        if (oContext.isKeepAlive()) {
          oContext.setKeepAlive(false);
        }
        if (mParameters.beforeCancelCallBack) {
          await mParameters.beforeCancelCallBack({
            context: oContext
          });
        }
        if (sProgrammingModel === ProgrammingModel.Draft) {
          if (isNewObject) {
            if (oContext.hasPendingChanges()) {
              oContext.getBinding().resetChanges();
            }
            returnedValue = await draft.deleteDraft(oContext, appComponent);
          } else {
            const oSiblingContext = oModel.bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
            try {
              const sCanonicalPath = await oSiblingContext.requestCanonicalPath();
              if (oContext.hasPendingChanges()) {
                oContext.getBinding().resetChanges();
              }
              returnedValue = oModel.bindContext(sCanonicalPath).getBoundContext();
            } finally {
              await draft.deleteDraft(oContext, appComponent);
            }
          }
        } else {
          const discardedContext = await sticky.discardDocument(oContext);
          if (discardedContext) {
            if (discardedContext.hasPendingChanges()) {
              discardedContext.getBinding().resetChanges();
            }
            if (!isNewObject) {
              discardedContext.refresh();
              returnedValue = discardedContext;
            }
          }
        }

        // remove existing bound transition messages
        messageHandler.removeTransitionMessages();
        // show unbound messages
        await messageHandler.showMessages();
        return returnedValue;
      } catch (err) {
        await messageHandler.showMessages();
        throw err;
      } finally {
        this.busyUnlock(appComponent);
      }
    }

    /**
     * Saves the document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param context Context of the document to be saved
     * @param appComponent The appComponent
     * @param resourceBundle The bundle to load text resources
     * @param executeSideEffectsOnError True if we should execute side effects in case of an error
     * @param bindingsForSideEffects The listBindings to be used for executing side effects on error
     * @param messageHandler The message handler extension
     * @param isNewObject True if we're trying to cancel a newly created object
     * @returns Promise resolves with ???
     * @ui5-restricted
     * @final
     */;
    _proto.saveDocument = async function saveDocument(context, appComponent, resourceBundle, executeSideEffectsOnError, bindingsForSideEffects, messageHandler, isNewObject) {
      const sProgrammingModel = this.getProgrammingModel(context);
      if (sProgrammingModel !== ProgrammingModel.Sticky && sProgrammingModel !== ProgrammingModel.Draft) {
        throw new Error("Save is only allowed for draft or sticky session supported services");
      }
      // in case of saving / activating the bound transition messages shall be removed before the PATCH/POST
      // is sent to the backend
      messageHandler.removeTransitionMessages();
      try {
        this.busyLock(appComponent);
        const oActiveDocument = sProgrammingModel === ProgrammingModel.Draft ? await draft.activateDocument(context, appComponent, {}, messageHandler) : await sticky.activateDocument(context, appComponent);
        const messagesReceived = messageHandling.getMessages().concat(messageHandling.getMessages(true, true)); // get unbound and bound messages present in the model
        if (!(messagesReceived.length === 1 && messagesReceived[0].type === coreLibrary.MessageType.Success)) {
          // show our object creation toast only if it is not coming from backend
          MessageToast.show(isNewObject ? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_OBJECT_CREATED", resourceBundle) : CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_OBJECT_SAVED", resourceBundle));
        }
        return oActiveDocument;
      } catch (err) {
        if (executeSideEffectsOnError && (bindingsForSideEffects === null || bindingsForSideEffects === void 0 ? void 0 : bindingsForSideEffects.length) > 0) {
          /* The sideEffects are executed only for table items in transient state */
          bindingsForSideEffects.forEach(listBinding => {
            if (!CommonUtils.hasTransientContext(listBinding)) {
              appComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(listBinding.getPath(), context);
            }
          });
        }
        await messageHandler.showMessages();
        throw err;
      } finally {
        this.busyUnlock(appComponent);
      }
    }
    /**
     * Calls a bound or unbound action.
     *
     * @function
     * @static
     * @name sap.fe.core.TransactionHelper.callAction
     * @memberof sap.fe.core.TransactionHelper
     * @param sActionName The name of the action to be called
     * @param [mParameters] Contains the following attributes:
     * @param [mParameters.parameterValues] A map of action parameter names and provided values
     * @param [mParameters.skipParameterDialog] Skips the parameter dialog if values are provided for all of them
     * @param [mParameters.contexts] Mandatory for a bound action: Either one context or an array with contexts for which the action is to be called
     * @param [mParameters.model] Mandatory for an unbound action: An instance of an OData V4 model
     * @param [mParameters.invocationGrouping] Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
     * @param [mParameters.label] A human-readable label for the action
     * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
     * @param oView Contains the object of the current view
     * @param appComponent The appComponent
     * @param messageHandler The message handler extension
     * @returns Promise resolves with an array of response objects (TODO: to be changed)
     * @ui5-restricted
     * @final
     */;
    _proto.callAction = async function callAction(sActionName, mParameters, oView, appComponent, messageHandler) {
      mParameters = getParameters(mParameters);
      let oContext, oModel;
      const mBindingParameters = mParameters.bindingParameters;
      if (!sActionName) {
        throw new Error("Provide name of action to be executed");
      }
      // action imports are not directly obtained from the metaModel by it is present inside the entityContainer
      // and the acions it refers to present outside the entitycontainer, hence to obtain kind of the action
      // split() on its name was required
      const sName = sActionName.split("/")[1];
      sActionName = sName || sActionName;
      oContext = sName ? undefined : mParameters.contexts;
      //checking whether the context is an array with more than 0 length or not an array(create action)
      if (oContext && (Array.isArray(oContext) && oContext.length || !Array.isArray(oContext))) {
        oContext = Array.isArray(oContext) ? oContext[0] : oContext;
        oModel = oContext.getModel();
      }
      if (mParameters.model) {
        oModel = mParameters.model;
      }
      if (!oModel) {
        throw new Error("Pass a context for a bound action or pass the model for an unbound action");
      }
      // get the binding parameters $select and $expand for the side effect on this action
      // also gather additional property paths to be requested such as text associations
      const mSideEffectsParameters = appComponent.getSideEffectsService().getODataActionSideEffects(sActionName, oContext) || {};
      const displayUnapplicableContextsDialog = () => {
        if (!mParameters.notApplicableContext || mParameters.notApplicableContext.length === 0) {
          return Promise.resolve(mParameters.contexts);
        }
        return new Promise(async (resolve, reject) => {
          const fnOpenAndFillDialog = function (oDlg) {
            let oDialogContent;
            const nNotApplicable = mParameters.notApplicableContext.length,
              aNotApplicableItems = [];
            for (let i = 0; i < mParameters.notApplicableContext.length; i++) {
              oDialogContent = mParameters.notApplicableContext[i].getObject();
              aNotApplicableItems.push(oDialogContent);
            }
            const oNotApplicableItemsModel = new JSONModel(aNotApplicableItems);
            const oTotals = new JSONModel({
              total: nNotApplicable,
              label: mParameters.label
            });
            oDlg.setModel(oNotApplicableItemsModel, "notApplicable");
            oDlg.setModel(oTotals, "totals");
            oDlg.open();
          };
          // Show the contexts that are not applicable and will not therefore be processed
          const sFragmentName = "sap.fe.core.controls.ActionPartial";
          const oDialogFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
          const oMetaModel = oModel.getMetaModel();
          const sCanonicalPath = mParameters.contexts[0].getCanonicalPath();
          const sEntitySet = `${sCanonicalPath.substr(0, sCanonicalPath.indexOf("("))}/`;
          const oDialogLabelModel = new JSONModel({
            title: mParameters.label
          });
          try {
            const oFragment = await XMLPreprocessor.process(oDialogFragment, {
              name: sFragmentName
            }, {
              bindingContexts: {
                entityType: oMetaModel.createBindingContext(sEntitySet),
                label: oDialogLabelModel.createBindingContext("/")
              },
              models: {
                entityType: oMetaModel,
                metaModel: oMetaModel,
                label: oDialogLabelModel
              }
            });
            // eslint-disable-next-line prefer-const
            let oDialog;
            const oController = {
              onClose: function () {
                // User cancels action
                oDialog.close();
                resolve();
              },
              onContinue: function () {
                // Users continues the action with the bound contexts
                oDialog.close();
                resolve(mParameters.applicableContext);
              }
            };
            oDialog = await Fragment.load({
              definition: oFragment,
              controller: oController
            });
            oController.onClose = function () {
              // User cancels action
              oDialog.close();
              resolve();
            };
            oController.onContinue = function () {
              // Users continues the action with the bound contexts
              oDialog.close();
              resolve(mParameters.applicableContext);
            };
            mParameters.parentControl.addDependent(oDialog);
            fnOpenAndFillDialog(oDialog);
          } catch (oError) {
            reject(oError);
          }
        });
      };
      try {
        let oResult;
        if (oContext && oModel) {
          const contextToProcess = await displayUnapplicableContextsDialog();
          if (contextToProcess) {
            oResult = await operations.callBoundAction(sActionName, contextToProcess, oModel, appComponent, {
              parameterValues: mParameters.parameterValues,
              invocationGrouping: mParameters.invocationGrouping,
              label: mParameters.label,
              skipParameterDialog: mParameters.skipParameterDialog,
              mBindingParameters: mBindingParameters,
              entitySetName: mParameters.entitySetName,
              additionalSideEffect: mSideEffectsParameters,
              onSubmitted: () => {
                messageHandler.removeTransitionMessages();
                this.busyLock(appComponent);
              },
              onResponse: () => {
                this.busyUnlock(appComponent);
              },
              parentControl: mParameters.parentControl,
              controlId: mParameters.controlId,
              internalModelContext: mParameters.internalModelContext,
              operationAvailableMap: mParameters.operationAvailableMap,
              bIsCreateAction: mParameters.bIsCreateAction,
              bGetBoundContext: mParameters.bGetBoundContext,
              bObjectPage: mParameters.bObjectPage,
              messageHandler: messageHandler,
              defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
              selectedItems: mParameters.contexts
            });
          } else {
            oResult = null;
          }
        } else {
          oResult = await operations.callActionImport(sActionName, oModel, appComponent, {
            parameterValues: mParameters.parameterValues,
            label: mParameters.label,
            skipParameterDialog: mParameters.skipParameterDialog,
            bindingParameters: mBindingParameters,
            entitySetName: mParameters.entitySetName,
            onSubmitted: () => {
              this.busyLock(appComponent);
            },
            onResponse: () => {
              this.busyUnlock(appComponent);
            },
            parentControl: mParameters.parentControl,
            internalModelContext: mParameters.internalModelContext,
            operationAvailableMap: mParameters.operationAvailableMap,
            messageHandler: messageHandler,
            bObjectPage: mParameters.bObjectPage
          });
        }
        await this._handleActionResponse(messageHandler, mParameters, sActionName);
        return oResult;
      } catch (err) {
        await this._handleActionResponse(messageHandler, mParameters, sActionName);
        throw err;
      }
    }
    /**
     * Handles messages for action call.
     *
     * @function
     * @name sap.fe.core.TransactionHelper#_handleActionResponse
     * @memberof sap.fe.core.TransactionHelper
     * @param messageHandler The message handler extension
     * @param mParameters Parameters to be considered for the action.
     * @param sActionName The name of the action to be called
     * @returns Promise after message dialog is opened if required.
     * @ui5-restricted
     * @final
     */;
    _proto._handleActionResponse = function _handleActionResponse(messageHandler, mParameters, sActionName) {
      const aTransientMessages = messageHandling.getMessages(true, true);
      const actionName = mParameters.label ? mParameters.label : sActionName;
      if (aTransientMessages.length > 0 && mParameters && mParameters.internalModelContext) {
        mParameters.internalModelContext.setProperty("sActionName", mParameters.label ? mParameters.label : sActionName);
      }
      let control;
      if (mParameters.controlId) {
        control = mParameters.parentControl.byId(mParameters.controlId);
      } else {
        control = mParameters.parentControl;
      }
      return messageHandler.showMessages({
        sActionName: actionName,
        control: control
      });
    }

    /**
     * Handles validation errors for the 'Discard' action.
     *
     * @function
     * @name sap.fe.core.TransactionHelper#handleValidationError
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @ui5-restricted
     * @final
     */;
    _proto.handleValidationError = function handleValidationError() {
      const oMessageManager = Core.getMessageManager(),
        errorToRemove = oMessageManager.getMessageModel().getData().filter(function (error) {
          // only needs to handle validation messages, technical and persistent errors needs not to be checked here.
          if (error.validation) {
            return error;
          }
        });
      oMessageManager.removeMessages(errorToRemove);
    }

    /**
     * Creates a new Popover. Factory method to make unit tests easier.
     *
     * @param settings Initial parameters for the popover
     * @returns A new Popover
     */;
    _proto._createPopover = function _createPopover(settings) {
      return new Popover(settings);
    }

    /**
     * Shows a popover to confirm discard if needed.
     *
     * @static
     * @name sap.fe.core.TransactionHelper._showDiscardPopover
     * @memberof sap.fe.core.TransactionHelper
     * @param cancelButton The control which will open the popover
     * @param isModified True if the object has been modified and a confirmation popover must be shown
     * @param resourceBundle The bundle to load text resources
     * @returns Promise resolves if user confirms discard, rejects if otherwise, rejects if no control passed to open popover
     * @ui5-restricted
     * @final
     */;
    _proto._confirmDiscard = function _confirmDiscard(cancelButton, isModified, resourceBundle) {
      // If the data isn't modified, do not show any confirmation popover
      if (!isModified) {
        this.handleValidationError();
        return Promise.resolve();
      }
      cancelButton.setEnabled(false);
      return new Promise((resolve, reject) => {
        const confirmationPopover = this._createPopover({
          showHeader: false,
          placement: "Top"
        });
        confirmationPopover.addStyleClass("sapUiContentPadding");

        // Create the content of the popover
        const title = new Text({
          text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_MESSAGE", resourceBundle)
        });
        const confirmButton = new Button({
          text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON", resourceBundle),
          width: "100%",
          press: () => {
            this.handleValidationError();
            confirmationPopover.data("continueDiscard", true);
            confirmationPopover.close();
          },
          ariaLabelledBy: [title]
        });
        confirmationPopover.addContent(new VBox({
          items: [title, confirmButton]
        }));

        // Attach handler
        confirmationPopover.attachBeforeOpen(() => {
          confirmationPopover.setInitialFocus(confirmButton);
        });
        confirmationPopover.attachAfterClose(() => {
          cancelButton.setEnabled(true);
          if (confirmationPopover.data("continueDiscard")) {
            resolve();
          } else {
            reject();
          }
        });
        confirmationPopover.openBy(cancelButton, false);
      });
    };
    _proto._onFieldChange = function _onFieldChange(oEvent, oCreateButton, messageHandler, fnValidateRequiredProperties) {
      messageHandler.removeTransitionMessages();
      const oField = oEvent.getSource();
      const oFieldPromise = oEvent.getParameter("promise");
      if (oFieldPromise) {
        return oFieldPromise.then(function (value) {
          // Setting value of field as '' in case of value help and validating other fields
          oField.setValue(value);
          fnValidateRequiredProperties();
          return oField.getValue();
        }).catch(function (value) {
          if (value !== "") {
            //disabling the continue button in case of invalid value in field
            oCreateButton.setEnabled(false);
          } else {
            // validating all the fields in case of empty value in field
            oField.setValue(value);
            fnValidateRequiredProperties();
          }
        });
      }
    };
    _proto._launchDialogWithKeyFields = function _launchDialogWithKeyFields(oListBinding, mFields, oModel, mParameters, appComponent, messageHandler) {
      let oDialog;
      const oParentControl = mParameters.parentControl;

      // Crate a fake (transient) listBinding and context, just for the binding context of the dialog
      const oTransientListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
        $$updateGroupId: "submitLater"
      });
      oTransientListBinding.refreshInternal = function () {
        /* */
      };
      const oTransientContext = oTransientListBinding.create(mParameters.data, true);
      return new Promise(async (resolve, reject) => {
        const sFragmentName = "sap/fe/core/controls/NonComputedVisibleKeyFieldsDialog";
        const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
          oResourceBundle = oParentControl.getController().oResourceBundle,
          oMetaModel = oModel.getMetaModel(),
          aImmutableFields = [],
          sPath = oListBinding.isRelative() ? oListBinding.getResolvedPath() : oListBinding.getPath(),
          oEntitySetContext = oMetaModel.createBindingContext(sPath),
          sMetaPath = oMetaModel.getMetaPath(sPath);
        for (const i in mFields) {
          aImmutableFields.push(oMetaModel.createBindingContext(`${sMetaPath}/${mFields[i]}`));
        }
        const oImmutableCtxModel = new JSONModel(aImmutableFields);
        const oImmutableCtx = oImmutableCtxModel.createBindingContext("/");
        const aRequiredProperties = CommonUtils.getRequiredPropertiesFromInsertRestrictions(sMetaPath, oMetaModel);
        const oRequiredPropertyPathsCtxModel = new JSONModel(aRequiredProperties);
        const oRequiredPropertyPathsCtx = oRequiredPropertyPathsCtxModel.createBindingContext("/");
        const oNewFragment = await XMLPreprocessor.process(oFragment, {
          name: sFragmentName
        }, {
          bindingContexts: {
            entitySet: oEntitySetContext,
            fields: oImmutableCtx,
            requiredProperties: oRequiredPropertyPathsCtx
          },
          models: {
            entitySet: oEntitySetContext.getModel(),
            fields: oImmutableCtx.getModel(),
            metaModel: oMetaModel,
            requiredProperties: oRequiredPropertyPathsCtxModel
          }
        });
        let aFormElements = [];
        const mFieldValueMap = {};
        // eslint-disable-next-line prefer-const
        let oCreateButton;
        const validateRequiredProperties = async function () {
          let bEnabled = false;
          try {
            const aResults = await Promise.all(aFormElements.map(function (oFormElement) {
              return oFormElement.getFields()[0];
            }).filter(function (oField) {
              // The continue button should remain disabled in case of empty required fields.
              return oField.getRequired() || oField.getValueState() === ValueState.Error;
            }).map(async function (oField) {
              const sFieldId = oField.getId();
              if (sFieldId in mFieldValueMap) {
                try {
                  const vValue = await mFieldValueMap[sFieldId];
                  return oField.getValue() === "" ? undefined : vValue;
                } catch (err) {
                  return undefined;
                }
              }
              return oField.getValue() === "" ? undefined : oField.getValue();
            }));
            bEnabled = aResults.every(function (vValue) {
              if (Array.isArray(vValue)) {
                vValue = vValue[0];
              }
              return vValue !== undefined && vValue !== null && vValue !== "";
            });
          } catch (err) {
            bEnabled = false;
          }
          oCreateButton.setEnabled(bEnabled);
        };
        const oController = {
          /*
          					fired on focus out from field or on selecting a value from the valuehelp.
          					the create button is enabled when a value is added.
          					liveChange is not fired when value is added from valuehelp.
          					value validation is not done for create button enablement.
          				*/
          handleChange: oEvent => {
            const sFieldId = oEvent.getParameter("id");
            mFieldValueMap[sFieldId] = this._onFieldChange(oEvent, oCreateButton, messageHandler, validateRequiredProperties);
          },
          /*
          					fired on key press. the create button is enabled when a value is added.
          					liveChange is not fired when value is added from valuehelp.
          					value validation is not done for create button enablement.
          				*/
          handleLiveChange: oEvent => {
            const sFieldId = oEvent.getParameter("id");
            const vValue = oEvent.getParameter("value");
            mFieldValueMap[sFieldId] = vValue;
            validateRequiredProperties();
          }
        };
        const oDialogContent = await Fragment.load({
          definition: oNewFragment,
          controller: oController
        });
        let oResult;
        const closeDialog = function () {
          //rejected/resolved the promis returned by _launchDialogWithKeyFields
          //as soon as the dialog is closed. Without waiting for the dialog's
          //animation to finish
          if (oResult.error) {
            reject(oResult.error);
          } else {
            resolve(oResult.response);
          }
          oDialog.close();
        };
        oDialog = new Dialog(generate(["CreateDialog", sMetaPath]), {
          title: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE", oResourceBundle),
          content: [oDialogContent],
          beginButton: {
            text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON", oResourceBundle),
            type: "Emphasized",
            press: async oEvent => {
              const createButton = oEvent.getSource();
              createButton.setEnabled(false);
              BusyLocker.lock(oDialog);
              mParameters.bIsCreateDialog = true;
              try {
                const aValues = await Promise.all(Object.keys(mFieldValueMap).map(async function (sKey) {
                  const oValue = await mFieldValueMap[sKey];
                  const oDialogValue = {};
                  oDialogValue[sKey] = oValue;
                  return oDialogValue;
                }));
                if (mParameters.beforeCreateCallBack) {
                  await toES6Promise(mParameters.beforeCreateCallBack({
                    contextPath: oListBinding && oListBinding.getPath(),
                    createParameters: aValues
                  }));
                }
                const transientData = oTransientContext.getObject();
                const createData = {};
                Object.keys(transientData).forEach(function (sPropertyPath) {
                  const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
                  // ensure navigation properties are not part of the payload, deep create not supported
                  if (oProperty && oProperty.$kind === "NavigationProperty") {
                    return;
                  }
                  createData[sPropertyPath] = transientData[sPropertyPath];
                });
                const oNewDocumentContext = oListBinding.create(createData, true, mParameters.createAtEnd, mParameters.inactive);
                const oPromise = this.onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters);
                let oResponse = await oPromise;
                if (!oResponse || oResponse && oResponse.bKeepDialogOpen !== true) {
                  oResponse = oResponse ?? {};
                  oDialog.setBindingContext(null);
                  oResponse.newContext = oNewDocumentContext;
                  oResult = {
                    response: oResponse
                  };
                  closeDialog();
                }
              } catch (oError) {
                // in case of creation failed, dialog should stay open - to achieve the same, nothing has to be done (like in case of success with bKeepDialogOpen)
                if (oError !== FELibrary.Constants.CreationFailed) {
                  // other errors are not expected
                  oResult = {
                    error: oError
                  };
                  closeDialog();
                } else {
                  createButton.setEnabled(true);
                }
              } finally {
                BusyLocker.unlock(oDialog);
                messageHandler.showMessages();
              }
            }
          },
          endButton: {
            text: CommonUtils.getTranslatedText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL", oResourceBundle),
            press: function () {
              oResult = {
                error: FELibrary.Constants.CancelActionDialog
              };
              closeDialog();
            }
          },
          afterClose: function () {
            var _oDialog$getBindingCo;
            // show footer as per UX guidelines when dialog is not open
            (_oDialog$getBindingCo = oDialog.getBindingContext("internal")) === null || _oDialog$getBindingCo === void 0 ? void 0 : _oDialog$getBindingCo.setProperty("isCreateDialogOpen", false);
            oDialog.destroy();
            oTransientListBinding.destroy();
          }
        });
        aFormElements = oDialogContent === null || oDialogContent === void 0 ? void 0 : oDialogContent.getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");
        if (oParentControl && oParentControl.addDependent) {
          // if there is a parent control specified add the dialog as dependent
          oParentControl.addDependent(oDialog);
        }
        oCreateButton = oDialog.getBeginButton();
        oDialog.setBindingContext(oTransientContext);
        try {
          await CommonUtils.setUserDefaults(appComponent, aImmutableFields, oTransientContext, false, mParameters.createAction, mParameters.data);
          validateRequiredProperties();
          // footer must not be visible when the dialog is open as per UX guidelines
          oDialog.getBindingContext("internal").setProperty("isCreateDialogOpen", true);
          oDialog.open();
        } catch (oError) {
          await messageHandler.showMessages();
          throw oError;
        }
      });
    };
    _proto.onAfterCreateCompletion = function onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters) {
      let fnResolve;
      const oPromise = new Promise(resolve => {
        fnResolve = resolve;
      });
      const fnCreateCompleted = oEvent => {
        const oContext = oEvent.getParameter("context"),
          bSuccess = oEvent.getParameter("success");
        if (oContext === oNewDocumentContext) {
          oListBinding.detachCreateCompleted(fnCreateCompleted, this);
          fnResolve(bSuccess);
        }
      };
      const fnSafeContextCreated = () => {
        oNewDocumentContext.created().then(undefined, function () {
          Log.trace("transient creation context deleted");
        }).catch(function (contextError) {
          Log.trace("transient creation context deletion error", contextError);
        });
      };
      oListBinding.attachCreateCompleted(fnCreateCompleted, this);
      return oPromise.then(bSuccess => {
        if (!bSuccess) {
          if (!mParameters.keepTransientContextOnFailed) {
            // Cancel the pending POST and delete the context in the listBinding
            fnSafeContextCreated(); // To avoid a 'request cancelled' error in the console
            oListBinding.resetChanges();
            oListBinding.getModel().resetChanges(oListBinding.getUpdateGroupId());
            throw FELibrary.Constants.CreationFailed;
          }
          return {
            bKeepDialogOpen: true
          };
        } else {
          return oNewDocumentContext.created();
        }
      });
    }
    /**
     * Retrieves the name of the NewAction to be executed.
     *
     * @function
     * @static
     * @private
     * @name sap.fe.core.TransactionHelper._getNewAction
     * @memberof sap.fe.core.TransactionHelper
     * @param oStartupParameters Startup parameters of the application
     * @param sCreateHash Hash to be checked for action type
     * @param oMetaModel The MetaModel used to check for NewAction parameter
     * @param sMetaPath The MetaPath
     * @returns The name of the action
     * @ui5-restricted
     * @final
     */;
    _proto._getNewAction = function _getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath) {
      let sNewAction;
      if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=CREATEWITH") > -1) {
        const sPreferredMode = oStartupParameters.preferredMode[0];
        sNewAction = sPreferredMode.toUpperCase().indexOf("CREATEWITH:") > -1 ? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1) : undefined;
      } else if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=AUTOCREATEWITH") > -1) {
        const sPreferredMode = oStartupParameters.preferredMode[0];
        sNewAction = sPreferredMode.toUpperCase().indexOf("AUTOCREATEWITH:") > -1 ? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1) : undefined;
      } else {
        sNewAction = oMetaModel && oMetaModel.getObject !== undefined ? oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction`) || oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction`) : undefined;
      }
      return sNewAction;
    }
    /**
     * Retrieves the label for the title of a specific create action dialog, e.g. Create Sales Order from Quotation.
     *
     * The following priority is applied:
     * 1. label of line-item annotation.
     * 2. label annotated in the action.
     * 3. "Create" as a constant from i18n.
     *
     * @function
     * @static
     * @private
     * @name sap.fe.core.TransactionHelper._getSpecificCreateActionDialogLabel
     * @memberof sap.fe.core.TransactionHelper
     * @param oMetaModel The MetaModel used to check for the NewAction parameter
     * @param sMetaPath The MetaPath
     * @param sNewAction Contains the name of the action to be executed
     * @param oResourceBundleCore ResourceBundle to access the default Create label
     * @returns The label for the Create Action Dialog
     * @ui5-restricted
     * @final
     */;
    _proto._getSpecificCreateActionDialogLabel = function _getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore) {
      const fnGetLabelFromLineItemAnnotation = function () {
        if (oMetaModel && oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)) {
          const iLineItemIndex = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`).findIndex(function (oLineItem) {
            const aLineItemAction = oLineItem.Action ? oLineItem.Action.split("(") : undefined;
            return aLineItemAction ? aLineItemAction[0] === sNewAction : false;
          });
          return iLineItemIndex > -1 ? oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)[iLineItemIndex].Label : undefined;
        } else {
          return undefined;
        }
      };
      return fnGetLabelFromLineItemAnnotation() || oMetaModel && oMetaModel.getObject(`${sMetaPath}/${sNewAction}@com.sap.vocabularies.Common.v1.Label`) || oResourceBundleCore && oResourceBundleCore.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE");
    };
    return TransactionHelper;
  }();
  const singleton = new TransactionHelper();
  return singleton;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJQcm9ncmFtbWluZ01vZGVsIiwiVmFsdWVTdGF0ZSIsImNvcmVMaWJyYXJ5IiwiZ2V0UGFyYW1ldGVycyIsIm1QYXJhbWV0ZXJzIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwiVHJhbnNhY3Rpb25IZWxwZXIiLCJidXN5TG9jayIsImFwcENvbXBvbmVudCIsImJ1c3lQYXRoIiwiQnVzeUxvY2tlciIsImxvY2siLCJnZXRNb2RlbCIsImJ1c3lVbmxvY2siLCJ1bmxvY2siLCJnZXRQcm9ncmFtbWluZ01vZGVsIiwic291cmNlIiwicGF0aCIsImlzQSIsImdldFBhdGgiLCJpc1JlbGF0aXZlIiwiZ2V0UmVzb2x2ZWRQYXRoIiwibWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiTW9kZWxIZWxwZXIiLCJpc0RyYWZ0U3VwcG9ydGVkIiwiRHJhZnQiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJTdGlja3kiLCJOb25EcmFmdCIsInZhbGlkYXRlRG9jdW1lbnQiLCJvQ29udGV4dCIsIm9WaWV3Iiwic0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiIsImN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiIsInNNb2R1bGUiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsInJlcGxhY2UiLCJzRnVuY3Rpb25OYW1lIiwibGVuZ3RoIiwibURhdGEiLCJkYXRhIiwiRlBNSGVscGVyIiwidmFsaWRhdGlvbldyYXBwZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsImNyZWF0ZURvY3VtZW50Iiwib01haW5MaXN0QmluZGluZyIsIm1JblBhcmFtZXRlcnMiLCJtZXNzYWdlSGFuZGxlciIsImZyb21Db3B5UGFzdGUiLCJjdXJyZW50VmlldyIsIm9Nb2RlbCIsIm9NZXRhTW9kZWwiLCJzTWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldEhlYWRlckNvbnRleHQiLCJzQ3JlYXRlSGFzaCIsImdldFJvdXRlclByb3h5IiwiZ2V0SGFzaCIsIm9Db21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsIm9TdGFydHVwUGFyYW1ldGVycyIsInN0YXJ0dXBQYXJhbWV0ZXJzIiwic05ld0FjdGlvbiIsIl9nZXROZXdBY3Rpb24iLCJ1bmRlZmluZWQiLCJtQmluZGluZ1BhcmFtZXRlcnMiLCIkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzIiwic01lc3NhZ2VzUGF0aCIsImdldE9iamVjdCIsInNCdXN5UGF0aCIsImdldFRhcmdldEVudGl0eVNldCIsImdldENvbnRleHQiLCJiRnVuY3Rpb25Pbk5hdlByb3AiLCJvTmV3RG9jdW1lbnRDb250ZXh0IiwiRXJyb3IiLCJzUHJvZ3JhbW1pbmdNb2RlbCIsImJ1c3lNb2RlIiwiYnVzeUlkIiwiYmVmb3JlQ3JlYXRlQ2FsbEJhY2siLCJvUmVzb3VyY2VCdW5kbGVDb3JlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsIm9SZXN1bHQiLCJjYWxsQWN0aW9uIiwiY29udGV4dHMiLCJzaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nIiwibGFiZWwiLCJfZ2V0U3BlY2lmaWNDcmVhdGVBY3Rpb25EaWFsb2dMYWJlbCIsImJpbmRpbmdQYXJhbWV0ZXJzIiwicGFyZW50Q29udHJvbCIsImJJc0NyZWF0ZUFjdGlvbiIsInNraXBQYXJhbWV0ZXJEaWFsb2ciLCJiSXNOZXdQYWdlQ3JlYXRpb24iLCJjcmVhdGlvbk1vZGUiLCJDcmVhdGlvblJvdyIsIklubGluZSIsImFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMiLCJDb21tb25VdGlscyIsImdldE5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkcyIsInNGdW5jdGlvblBhdGgiLCJvRnVuY3Rpb25Db250ZXh0Iiwib0Z1bmN0aW9uIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJvRGF0YSIsIiRJc0JvdW5kIiwib3BlcmF0aW9ucyIsImNhbGxCb3VuZEZ1bmN0aW9uIiwiY2FsbEZ1bmN0aW9uSW1wb3J0Iiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJPYmplY3QiLCJhc3NpZ24iLCJfbGF1bmNoRGlhbG9nV2l0aEtleUZpZWxkcyIsIm5ld0NvbnRleHQiLCJ0b0VTNlByb21pc2UiLCJjb250ZXh0UGF0aCIsImNyZWF0ZSIsImNyZWF0ZUF0RW5kIiwiaW5hY3RpdmUiLCJvbkFmdGVyQ3JlYXRlQ29tcGxldGlvbiIsInNob3dNZXNzYWdlRGlhbG9nIiwiY29udHJvbCIsIkNvbnN0YW50cyIsIkFjdGlvbkV4ZWN1dGlvbkZhaWxlZCIsIkNhbmNlbEFjdGlvbkRpYWxvZyIsImlzVHJhbnNpZW50IiwiZGVsZXRlIiwiX2lzRHJhZnRFbmFibGVkIiwidkNvbnRleHRzIiwiY29udGV4dEZvckRyYWZ0TW9kZWwiLCJkZWxldGVEb2N1bWVudCIsInJlc291cmNlQnVuZGxlIiwicmVzb3VyY2VCdW5kbGVDb3JlIiwiYVBhcmFtcyIsImNvbnRleHRzVG9EZWxldGUiLCJBcnJheSIsImlzQXJyYXkiLCJyZWplY3QiLCJkcmFmdEVuYWJsZWQiLCJzZWxlY3RlZENvbnRleHRzIiwiaXRlbXMiLCJvcHRpb25zIiwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIiwibG9ja2VkQ29udGV4dCIsImZpbmQiLCJjb250ZXh0IiwiY29udGV4dERhdGEiLCJJc0FjdGl2ZUVudGl0eSIsIkhhc0RyYWZ0RW50aXR5IiwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEiLCJJblByb2Nlc3NCeVVzZXIiLCJEcmFmdElzQ3JlYXRlZEJ5TWUiLCJsb2NraW5nVXNlck5hbWUiLCJNZXNzYWdlQm94Iiwic2hvdyIsImdldFRyYW5zbGF0ZWRUZXh0IiwidGl0bGUiLCJnZXRUZXh0Iiwib25DbG9zZSIsIm5vblRhYmxlVHh0IiwiZGVzY3JpcHRpb24iLCJlbnRpdHlTZXROYW1lIiwicHVzaCIsInR5cGUiLCJ0ZXh0Iiwic2VsZWN0ZWQiLCJ0b3RhbERlbGV0YWJsZSIsImRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUiLCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlIiwidW5TYXZlZENvbnRleHRzIiwiY3JlYXRlTW9kZUNvbnRleHRzIiwiZGVsZXRlSGVscGVyIiwidXBkYXRlRHJhZnRPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMiLCJ1cGRhdGVPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMiLCJ1cGRhdGVDb250ZW50Rm9yRGVsZXRlRGlhbG9nIiwidkJveCIsIlZCb3giLCJzVGl0bGUiLCJmbkNvbmZpcm0iLCJkZWxldGVDb25maXJtSGFuZGxlciIsImRpYWxvZ0NvbmZpcm1lZCIsIm9EaWFsb2ciLCJEaWFsb2ciLCJzdGF0ZSIsImNvbnRlbnQiLCJhcmlhTGFiZWxsZWRCeSIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwicHJlc3MiLCJtZXNzYWdlSGFuZGxpbmciLCJyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyIsImNsb3NlIiwiZW5kQnV0dG9uIiwiYWZ0ZXJDbG9zZSIsImRlc3Ryb3kiLCJub0RpYWxvZyIsImFkZFN0eWxlQ2xhc3MiLCJvcGVuIiwiZWRpdERvY3VtZW50IiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwib05ld0NvbnRleHQiLCJkcmFmdCIsImNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50IiwiYlByZXNlcnZlQ2hhbmdlcyIsInN0aWNreSIsImVkaXREb2N1bWVudEluU3RpY2t5U2Vzc2lvbiIsImVyciIsInNob3dNZXNzYWdlcyIsImNvbmN1cnJlbnRFZGl0RmxhZyIsImNhbmNlbERvY3VtZW50IiwiaXNOZXdPYmplY3QiLCJpc09iamVjdE1vZGlmaWVkIiwicmV0dXJuZWRWYWx1ZSIsImRyYWZ0RGF0YUNvbnRleHQiLCJiaW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsImRyYWZ0QWRtaW5EYXRhIiwicmVxdWVzdE9iamVjdCIsIkNyZWF0aW9uRGF0ZVRpbWUiLCJMYXN0Q2hhbmdlRGF0ZVRpbWUiLCJza2lwRGlzY2FyZFBvcG92ZXIiLCJfY29uZmlybURpc2NhcmQiLCJjYW5jZWxCdXR0b24iLCJpc0tlZXBBbGl2ZSIsInNldEtlZXBBbGl2ZSIsImJlZm9yZUNhbmNlbENhbGxCYWNrIiwiaGFzUGVuZGluZ0NoYW5nZXMiLCJnZXRCaW5kaW5nIiwicmVzZXRDaGFuZ2VzIiwiZGVsZXRlRHJhZnQiLCJvU2libGluZ0NvbnRleHQiLCJzQ2Fub25pY2FsUGF0aCIsInJlcXVlc3RDYW5vbmljYWxQYXRoIiwiZGlzY2FyZGVkQ29udGV4dCIsImRpc2NhcmREb2N1bWVudCIsInJlZnJlc2giLCJzYXZlRG9jdW1lbnQiLCJleGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIiwiYmluZGluZ3NGb3JTaWRlRWZmZWN0cyIsIm9BY3RpdmVEb2N1bWVudCIsImFjdGl2YXRlRG9jdW1lbnQiLCJtZXNzYWdlc1JlY2VpdmVkIiwiZ2V0TWVzc2FnZXMiLCJjb25jYXQiLCJNZXNzYWdlVHlwZSIsIlN1Y2Nlc3MiLCJNZXNzYWdlVG9hc3QiLCJmb3JFYWNoIiwibGlzdEJpbmRpbmciLCJoYXNUcmFuc2llbnRDb250ZXh0IiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwicmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5Iiwic0FjdGlvbk5hbWUiLCJzTmFtZSIsInNwbGl0IiwibW9kZWwiLCJtU2lkZUVmZmVjdHNQYXJhbWV0ZXJzIiwiZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyIsImRpc3BsYXlVbmFwcGxpY2FibGVDb250ZXh0c0RpYWxvZyIsIm5vdEFwcGxpY2FibGVDb250ZXh0IiwiZm5PcGVuQW5kRmlsbERpYWxvZyIsIm9EbGciLCJvRGlhbG9nQ29udGVudCIsIm5Ob3RBcHBsaWNhYmxlIiwiYU5vdEFwcGxpY2FibGVJdGVtcyIsImkiLCJvTm90QXBwbGljYWJsZUl0ZW1zTW9kZWwiLCJKU09OTW9kZWwiLCJvVG90YWxzIiwidG90YWwiLCJzZXRNb2RlbCIsInNGcmFnbWVudE5hbWUiLCJvRGlhbG9nRnJhZ21lbnQiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsImdldENhbm9uaWNhbFBhdGgiLCJzRW50aXR5U2V0Iiwic3Vic3RyIiwiaW5kZXhPZiIsIm9EaWFsb2dMYWJlbE1vZGVsIiwib0ZyYWdtZW50IiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsIm5hbWUiLCJiaW5kaW5nQ29udGV4dHMiLCJlbnRpdHlUeXBlIiwibW9kZWxzIiwib0NvbnRyb2xsZXIiLCJvbkNvbnRpbnVlIiwiYXBwbGljYWJsZUNvbnRleHQiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiY29udHJvbGxlciIsImFkZERlcGVuZGVudCIsImNvbnRleHRUb1Byb2Nlc3MiLCJjYWxsQm91bmRBY3Rpb24iLCJwYXJhbWV0ZXJWYWx1ZXMiLCJpbnZvY2F0aW9uR3JvdXBpbmciLCJhZGRpdGlvbmFsU2lkZUVmZmVjdCIsIm9uU3VibWl0dGVkIiwib25SZXNwb25zZSIsImNvbnRyb2xJZCIsImludGVybmFsTW9kZWxDb250ZXh0Iiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiYkdldEJvdW5kQ29udGV4dCIsImJPYmplY3RQYWdlIiwiZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uIiwic2VsZWN0ZWRJdGVtcyIsImNhbGxBY3Rpb25JbXBvcnQiLCJfaGFuZGxlQWN0aW9uUmVzcG9uc2UiLCJhVHJhbnNpZW50TWVzc2FnZXMiLCJhY3Rpb25OYW1lIiwic2V0UHJvcGVydHkiLCJieUlkIiwiaGFuZGxlVmFsaWRhdGlvbkVycm9yIiwib01lc3NhZ2VNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJlcnJvclRvUmVtb3ZlIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsImZpbHRlciIsInZhbGlkYXRpb24iLCJyZW1vdmVNZXNzYWdlcyIsIl9jcmVhdGVQb3BvdmVyIiwic2V0dGluZ3MiLCJQb3BvdmVyIiwiaXNNb2RpZmllZCIsInNldEVuYWJsZWQiLCJjb25maXJtYXRpb25Qb3BvdmVyIiwic2hvd0hlYWRlciIsInBsYWNlbWVudCIsIlRleHQiLCJjb25maXJtQnV0dG9uIiwid2lkdGgiLCJhZGRDb250ZW50IiwiYXR0YWNoQmVmb3JlT3BlbiIsInNldEluaXRpYWxGb2N1cyIsImF0dGFjaEFmdGVyQ2xvc2UiLCJvcGVuQnkiLCJfb25GaWVsZENoYW5nZSIsIm9FdmVudCIsIm9DcmVhdGVCdXR0b24iLCJmblZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzIiwib0ZpZWxkIiwiZ2V0U291cmNlIiwib0ZpZWxkUHJvbWlzZSIsImdldFBhcmFtZXRlciIsInRoZW4iLCJ2YWx1ZSIsInNldFZhbHVlIiwiZ2V0VmFsdWUiLCJjYXRjaCIsIm9MaXN0QmluZGluZyIsIm1GaWVsZHMiLCJvUGFyZW50Q29udHJvbCIsIm9UcmFuc2llbnRMaXN0QmluZGluZyIsImJpbmRMaXN0IiwiJCR1cGRhdGVHcm91cElkIiwicmVmcmVzaEludGVybmFsIiwib1RyYW5zaWVudENvbnRleHQiLCJvUmVzb3VyY2VCdW5kbGUiLCJnZXRDb250cm9sbGVyIiwiYUltbXV0YWJsZUZpZWxkcyIsInNQYXRoIiwib0VudGl0eVNldENvbnRleHQiLCJvSW1tdXRhYmxlQ3R4TW9kZWwiLCJvSW1tdXRhYmxlQ3R4IiwiYVJlcXVpcmVkUHJvcGVydGllcyIsImdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMiLCJvUmVxdWlyZWRQcm9wZXJ0eVBhdGhzQ3R4TW9kZWwiLCJvUmVxdWlyZWRQcm9wZXJ0eVBhdGhzQ3R4Iiwib05ld0ZyYWdtZW50IiwiZW50aXR5U2V0IiwiZmllbGRzIiwicmVxdWlyZWRQcm9wZXJ0aWVzIiwiYUZvcm1FbGVtZW50cyIsIm1GaWVsZFZhbHVlTWFwIiwidmFsaWRhdGVSZXF1aXJlZFByb3BlcnRpZXMiLCJiRW5hYmxlZCIsImFSZXN1bHRzIiwiYWxsIiwibWFwIiwib0Zvcm1FbGVtZW50IiwiZ2V0RmllbGRzIiwiZ2V0UmVxdWlyZWQiLCJnZXRWYWx1ZVN0YXRlIiwic0ZpZWxkSWQiLCJnZXRJZCIsInZWYWx1ZSIsImV2ZXJ5IiwiaGFuZGxlQ2hhbmdlIiwiaGFuZGxlTGl2ZUNoYW5nZSIsImNsb3NlRGlhbG9nIiwicmVzcG9uc2UiLCJnZW5lcmF0ZSIsImNyZWF0ZUJ1dHRvbiIsImJJc0NyZWF0ZURpYWxvZyIsImFWYWx1ZXMiLCJrZXlzIiwic0tleSIsIm9WYWx1ZSIsIm9EaWFsb2dWYWx1ZSIsImNyZWF0ZVBhcmFtZXRlcnMiLCJ0cmFuc2llbnREYXRhIiwiY3JlYXRlRGF0YSIsInNQcm9wZXJ0eVBhdGgiLCJvUHJvcGVydHkiLCIka2luZCIsIm9Qcm9taXNlIiwib1Jlc3BvbnNlIiwiYktlZXBEaWFsb2dPcGVuIiwic2V0QmluZGluZ0NvbnRleHQiLCJDcmVhdGlvbkZhaWxlZCIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0QWdncmVnYXRpb24iLCJnZXRCZWdpbkJ1dHRvbiIsInNldFVzZXJEZWZhdWx0cyIsImNyZWF0ZUFjdGlvbiIsImZuUmVzb2x2ZSIsImZuQ3JlYXRlQ29tcGxldGVkIiwiYlN1Y2Nlc3MiLCJkZXRhY2hDcmVhdGVDb21wbGV0ZWQiLCJmblNhZmVDb250ZXh0Q3JlYXRlZCIsImNyZWF0ZWQiLCJ0cmFjZSIsImNvbnRleHRFcnJvciIsImF0dGFjaENyZWF0ZUNvbXBsZXRlZCIsImtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQiLCJnZXRVcGRhdGVHcm91cElkIiwicHJlZmVycmVkTW9kZSIsInRvVXBwZXJDYXNlIiwic1ByZWZlcnJlZE1vZGUiLCJmbkdldExhYmVsRnJvbUxpbmVJdGVtQW5ub3RhdGlvbiIsImlMaW5lSXRlbUluZGV4IiwiZmluZEluZGV4Iiwib0xpbmVJdGVtIiwiYUxpbmVJdGVtQWN0aW9uIiwiQWN0aW9uIiwiTGFiZWwiLCJzaW5nbGV0b24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRyYW5zYWN0aW9uSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQnVzeUxvY2tlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvQnVzeUxvY2tlclwiO1xuaW1wb3J0IGRyYWZ0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IG9wZXJhdGlvbnMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L29wZXJhdGlvbnNcIjtcbmltcG9ydCBzdGlja3kgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L3N0aWNreVwiO1xuaW1wb3J0IHR5cGUgTWVzc2FnZUhhbmRsZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9tZXNzYWdlSGFuZGxlci9tZXNzYWdlSGFuZGxpbmdcIjtcbmltcG9ydCBkZWxldGVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRGVsZXRlSGVscGVyXCI7XG5pbXBvcnQgRlBNSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0ZQTUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBGRUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IE1lc3NhZ2VUb2FzdCBmcm9tIFwic2FwL20vTWVzc2FnZVRvYXN0XCI7XG5pbXBvcnQgUG9wb3ZlciwgeyAkUG9wb3ZlclNldHRpbmdzIH0gZnJvbSBcInNhcC9tL1BvcG92ZXJcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgVkJveCBmcm9tIFwic2FwL20vVkJveFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBjb3JlTGlicmFyeSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSBCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvQmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFWNENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBPRGF0YUxpc3RCaW5kaW5nIH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuaW1wb3J0IHRvRVM2UHJvbWlzZSBmcm9tIFwiLi4vLi4vaGVscGVycy9Ub0VTNlByb21pc2VcIjtcblxuY29uc3QgQ3JlYXRpb25Nb2RlID0gRkVMaWJyYXJ5LkNyZWF0aW9uTW9kZTtcbmNvbnN0IFByb2dyYW1taW5nTW9kZWwgPSBGRUxpYnJhcnkuUHJvZ3JhbW1pbmdNb2RlbDtcbmNvbnN0IFZhbHVlU3RhdGUgPSBjb3JlTGlicmFyeS5WYWx1ZVN0YXRlO1xuLyogTWFrZSBzdXJlIHRoYXQgdGhlIG1QYXJhbWV0ZXJzIGlzIG5vdCB0aGUgb0V2ZW50ICovXG5mdW5jdGlvbiBnZXRQYXJhbWV0ZXJzKG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0aWYgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmdldE1ldGFkYXRhICYmIG1QYXJhbWV0ZXJzLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpID09PSBcInNhcC51aS5iYXNlLkV2ZW50XCIpIHtcblx0XHRtUGFyYW1ldGVycyA9IHt9O1xuXHR9XG5cdHJldHVybiBtUGFyYW1ldGVycyB8fCB7fTtcbn1cblxuY2xhc3MgVHJhbnNhY3Rpb25IZWxwZXIge1xuXHRidXN5TG9jayhhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgYnVzeVBhdGg/OiBzdHJpbmcpIHtcblx0XHRCdXN5TG9ja2VyLmxvY2soYXBwQ29tcG9uZW50LmdldE1vZGVsKFwidWlcIiksIGJ1c3lQYXRoKTtcblx0fVxuXG5cdGJ1c3lVbmxvY2soYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsIGJ1c3lQYXRoPzogc3RyaW5nKSB7XG5cdFx0QnVzeUxvY2tlci51bmxvY2soYXBwQ29tcG9uZW50LmdldE1vZGVsKFwidWlcIiksIGJ1c3lQYXRoKTtcblx0fVxuXG5cdGdldFByb2dyYW1taW5nTW9kZWwoc291cmNlOiBPRGF0YVY0Q29udGV4dCB8IEJpbmRpbmcpOiB0eXBlb2YgUHJvZ3JhbW1pbmdNb2RlbCB7XG5cdFx0bGV0IHBhdGg6IHN0cmluZztcblx0XHRpZiAoc291cmNlLmlzQTxPRGF0YVY0Q29udGV4dD4oXCJzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFwiKSkge1xuXHRcdFx0cGF0aCA9IHNvdXJjZS5nZXRQYXRoKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhdGggPSAoc291cmNlLmlzUmVsYXRpdmUoKSA/IHNvdXJjZS5nZXRSZXNvbHZlZFBhdGgoKSA6IHNvdXJjZS5nZXRQYXRoKCkpID8/IFwiXCI7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gc291cmNlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQobWV0YU1vZGVsLCBwYXRoKSkge1xuXHRcdFx0cmV0dXJuIFByb2dyYW1taW5nTW9kZWwuRHJhZnQ7XG5cdFx0fSBlbHNlIGlmIChNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQobWV0YU1vZGVsKSkge1xuXHRcdFx0cmV0dXJuIFByb2dyYW1taW5nTW9kZWwuU3RpY2t5O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvZ3JhbW1pbmdNb2RlbC5Ob25EcmFmdDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVmFsaWRhdGVzIGEgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBkb2N1bWVudCB0byBiZSB2YWxpZGF0ZWRcblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gQ2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmRhdGFdIEEgbWFwIG9mIGRhdGEgdGhhdCBzaG91bGQgYmUgdmFsaWRhdGVkXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXSBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHBhdGggdG8gdGhlIHZhbGlkYXRpb24gZnVuY3Rpb25cblx0ICogQHBhcmFtIG9WaWV3IENvbnRhaW5zIHRoZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgdmlld1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggcmVzdWx0IG9mIHRoZSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvblxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHR2YWxpZGF0ZURvY3VtZW50KG9Db250ZXh0OiBPRGF0YVY0Q29udGV4dCwgbVBhcmFtZXRlcnM6IGFueSwgb1ZpZXc6IFZpZXcpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24gPSBtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5jdXN0b21WYWxpZGF0aW9uRnVuY3Rpb247XG5cdFx0aWYgKHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24pIHtcblx0XHRcdGNvbnN0IHNNb2R1bGUgPSBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLnN1YnN0cmluZygwLCBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLmxhc3RJbmRleE9mKFwiLlwiKSB8fCAtMSkucmVwbGFjZSgvXFwuL2dpLCBcIi9cIiksXG5cdFx0XHRcdHNGdW5jdGlvbk5hbWUgPSBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLnN1YnN0cmluZyhcblx0XHRcdFx0XHRzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLmxhc3RJbmRleE9mKFwiLlwiKSArIDEsXG5cdFx0XHRcdFx0c0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbi5sZW5ndGhcblx0XHRcdFx0KSxcblx0XHRcdFx0bURhdGEgPSBtUGFyYW1ldGVycy5kYXRhO1xuXHRcdFx0ZGVsZXRlIG1EYXRhW1wiQCR1aTUuY29udGV4dC5pc1RyYW5zaWVudFwiXTtcblx0XHRcdHJldHVybiBGUE1IZWxwZXIudmFsaWRhdGlvbldyYXBwZXIoc01vZHVsZSwgc0Z1bmN0aW9uTmFtZSwgbURhdGEsIG9WaWV3LCBvQ29udGV4dCk7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBvTWFpbkxpc3RCaW5kaW5nIE9EYXRhIFY0IExpc3RCaW5kaW5nIG9iamVjdFxuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnNdIE9wdGlvbmFsLCBjYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVycy5kYXRhXSBBIG1hcCBvZiBkYXRhIHRoYXQgc2hvdWxkIGJlIHNlbnQgd2l0aGluIHRoZSBQT1NUXG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVycy5idXN5TW9kZV0gR2xvYmFsIChkZWZhdWx0KSwgTG9jYWwsIE5vbmUgVE9ETzogdG8gYmUgcmVmYWN0b3JlZFxuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnMuYnVzeUlkXSBJRCBvZiB0aGUgbG9jYWwgYnVzeSBpbmRpY2F0b3Jcblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzLmtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWRdIElmIHNldCwgdGhlIGNvbnRleHQgc3RheXMgaW4gdGhlIGxpc3QgaWYgdGhlIFBPU1QgZmFpbGVkIGFuZCBQT1NUIHdpbGwgYmUgcmVwZWF0ZWQgd2l0aCB0aGUgbmV4dCBjaGFuZ2Vcblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzLmluYWN0aXZlXSBJZiBzZXQsIHRoZSBjb250ZXh0IGlzIHNldCBhcyBpbmFjdGl2ZSBmb3IgZW1wdHkgcm93c1xuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZ10gU2tpcHMgdGhlIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nXG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgVGhlIGFwcCBjb21wb25lbnRcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXIgZXh0ZW5zaW9uXG5cdCAqIEBwYXJhbSBmcm9tQ29weVBhc3RlIFRydWUgaWYgdGhlIGNyZWF0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZCBieSBhIHBhc3RlIGFjdGlvblxuXHQgKiBAcGFyYW0gY3VycmVudFZpZXcgVGhlIGN1cnJlbnQgdmlld1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggbmV3IGJpbmRpbmcgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRhc3luYyBjcmVhdGVEb2N1bWVudChcblx0XHRvTWFpbkxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLFxuXHRcdG1JblBhcmFtZXRlcnM6XG5cdFx0XHR8IHtcblx0XHRcdFx0XHRkYXRhPzogYW55O1xuXHRcdFx0XHRcdGJ1c3lNb2RlPzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGJ1c3lJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQ/OiBib29sZWFuO1xuXHRcdFx0XHRcdGluYWN0aXZlPzogYm9vbGVhbjtcblx0XHRcdCAgfVxuXHRcdFx0fCB1bmRlZmluZWQsXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRcdGZyb21Db3B5UGFzdGU6IGJvb2xlYW4sXG5cdFx0Y3VycmVudFZpZXc/OiBWaWV3XG5cdCk6IFByb21pc2U8T0RhdGFWNENvbnRleHQ+IHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcblx0XHRjb25zdCBvTW9kZWwgPSBvTWFpbkxpc3RCaW5kaW5nLmdldE1vZGVsKCksXG5cdFx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvTWFpbkxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKSEuZ2V0UGF0aCgpKSxcblx0XHRcdHNDcmVhdGVIYXNoID0gYXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuZ2V0SGFzaCgpLFxuXHRcdFx0b0NvbXBvbmVudERhdGEgPSBhcHBDb21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpLFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzID0gKG9Db21wb25lbnREYXRhICYmIG9Db21wb25lbnREYXRhLnN0YXJ0dXBQYXJhbWV0ZXJzKSB8fCB7fSxcblx0XHRcdHNOZXdBY3Rpb24gPSAhb01haW5MaXN0QmluZGluZy5pc1JlbGF0aXZlKClcblx0XHRcdFx0PyB0aGlzLl9nZXROZXdBY3Rpb24ob1N0YXJ0dXBQYXJhbWV0ZXJzLCBzQ3JlYXRlSGFzaCwgb01ldGFNb2RlbCwgc01ldGFQYXRoKVxuXHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRjb25zdCBtQmluZGluZ1BhcmFtZXRlcnM6IGFueSA9IHsgJCRwYXRjaFdpdGhvdXRTaWRlRWZmZWN0czogdHJ1ZSB9O1xuXHRcdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblx0XHRsZXQgc0J1c3lQYXRoID0gXCIvYnVzeVwiO1xuXHRcdGxldCBzRnVuY3Rpb25OYW1lID1cblx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRlZmF1bHRWYWx1ZXNGdW5jdGlvbmApIHx8XG5cdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChcblx0XHRcdFx0YCR7TW9kZWxIZWxwZXIuZ2V0VGFyZ2V0RW50aXR5U2V0KG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzTWV0YVBhdGgpKX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRlZmF1bHRWYWx1ZXNGdW5jdGlvbmBcblx0XHRcdCk7XG5cdFx0bGV0IGJGdW5jdGlvbk9uTmF2UHJvcDtcblx0XHRsZXQgb05ld0RvY3VtZW50Q29udGV4dDogT0RhdGFWNENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdFx0aWYgKHNGdW5jdGlvbk5hbWUpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uYCkgJiZcblx0XHRcdFx0TW9kZWxIZWxwZXIuZ2V0VGFyZ2V0RW50aXR5U2V0KG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzTWV0YVBhdGgpKSAhPT0gc01ldGFQYXRoXG5cdFx0XHQpIHtcblx0XHRcdFx0YkZ1bmN0aW9uT25OYXZQcm9wID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJGdW5jdGlvbk9uTmF2UHJvcCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoc01lc3NhZ2VzUGF0aCkge1xuXHRcdFx0bUJpbmRpbmdQYXJhbWV0ZXJzW1wiJHNlbGVjdFwiXSA9IHNNZXNzYWdlc1BhdGg7XG5cdFx0fVxuXHRcdGNvbnN0IG1QYXJhbWV0ZXJzID0gZ2V0UGFyYW1ldGVycyhtSW5QYXJhbWV0ZXJzKTtcblx0XHRpZiAoIW9NYWluTGlzdEJpbmRpbmcpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkJpbmRpbmcgcmVxdWlyZWQgZm9yIG5ldyBkb2N1bWVudCBjcmVhdGlvblwiKTtcblx0XHR9XG5cdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwob01haW5MaXN0QmluZGluZyk7XG5cdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0ICYmIHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ3JlYXRlIGRvY3VtZW50IG9ubHkgYWxsb3dlZCBmb3IgZHJhZnQgb3Igc3RpY2t5IHNlc3Npb24gc3VwcG9ydGVkIHNlcnZpY2VzXCIpO1xuXHRcdH1cblx0XHRpZiAobVBhcmFtZXRlcnMuYnVzeU1vZGUgPT09IFwiTG9jYWxcIikge1xuXHRcdFx0c0J1c3lQYXRoID0gYC9idXN5TG9jYWwvJHttUGFyYW1ldGVycy5idXN5SWR9YDtcblx0XHR9XG5cdFx0bVBhcmFtZXRlcnMuYmVmb3JlQ3JlYXRlQ2FsbEJhY2sgPSBmcm9tQ29weVBhc3RlID8gbnVsbCA6IG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrO1xuXHRcdHRoaXMuYnVzeUxvY2soYXBwQ29tcG9uZW50LCBzQnVzeVBhdGgpO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZUNvcmUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdGxldCBvUmVzdWx0OiBhbnk7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKHNOZXdBY3Rpb24pIHtcblx0XHRcdFx0b1Jlc3VsdCA9IGF3YWl0IHRoaXMuY2FsbEFjdGlvbihcblx0XHRcdFx0XHRzTmV3QWN0aW9uLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnRleHRzOiBvTWFpbkxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKSxcblx0XHRcdFx0XHRcdHNob3dBY3Rpb25QYXJhbWV0ZXJEaWFsb2c6IHRydWUsXG5cdFx0XHRcdFx0XHRsYWJlbDogdGhpcy5fZ2V0U3BlY2lmaWNDcmVhdGVBY3Rpb25EaWFsb2dMYWJlbChvTWV0YU1vZGVsLCBzTWV0YVBhdGgsIHNOZXdBY3Rpb24sIG9SZXNvdXJjZUJ1bmRsZUNvcmUpLFxuXHRcdFx0XHRcdFx0YmluZGluZ1BhcmFtZXRlcnM6IG1CaW5kaW5nUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdHBhcmVudENvbnRyb2w6IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0XHRiSXNDcmVhdGVBY3Rpb246IHRydWUsXG5cdFx0XHRcdFx0XHRza2lwUGFyYW1ldGVyRGlhbG9nOiBtUGFyYW1ldGVycy5za2lwUGFyYW1ldGVyRGlhbG9nXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdGFwcENvbXBvbmVudCxcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlclxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgYklzTmV3UGFnZUNyZWF0aW9uID1cblx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdyAmJiBtUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5JbmxpbmU7XG5cdFx0XHRcdGNvbnN0IGFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMgPSBiSXNOZXdQYWdlQ3JlYXRpb25cblx0XHRcdFx0XHQ/IENvbW1vblV0aWxzLmdldE5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkcyhvTWV0YU1vZGVsLCBzTWV0YVBhdGgsIGN1cnJlbnRWaWV3KVxuXHRcdFx0XHRcdDogW107XG5cdFx0XHRcdHNGdW5jdGlvbk5hbWUgPSBmcm9tQ29weVBhc3RlID8gbnVsbCA6IHNGdW5jdGlvbk5hbWU7XG5cdFx0XHRcdGxldCBzRnVuY3Rpb25QYXRoLCBvRnVuY3Rpb25Db250ZXh0O1xuXHRcdFx0XHRpZiAoc0Z1bmN0aW9uTmFtZSkge1xuXHRcdFx0XHRcdC8vYm91bmQgdG8gdGhlIHNvdXJjZSBlbnRpdHk6XG5cdFx0XHRcdFx0aWYgKGJGdW5jdGlvbk9uTmF2UHJvcCkge1xuXHRcdFx0XHRcdFx0c0Z1bmN0aW9uUGF0aCA9XG5cdFx0XHRcdFx0XHRcdG9NYWluTGlzdEJpbmRpbmcuZ2V0Q29udGV4dCgpICYmXG5cdFx0XHRcdFx0XHRcdGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob01haW5MaXN0QmluZGluZy5nZXRDb250ZXh0KCkuZ2V0UGF0aCgpKX0vJHtzRnVuY3Rpb25OYW1lfWA7XG5cdFx0XHRcdFx0XHRvRnVuY3Rpb25Db250ZXh0ID0gb01haW5MaXN0QmluZGluZy5nZXRDb250ZXh0KCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNGdW5jdGlvblBhdGggPVxuXHRcdFx0XHRcdFx0XHRvTWFpbkxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKSAmJlxuXHRcdFx0XHRcdFx0XHRgJHtvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9NYWluTGlzdEJpbmRpbmcuZ2V0SGVhZGVyQ29udGV4dCgpIS5nZXRQYXRoKCkpfS8ke3NGdW5jdGlvbk5hbWV9YDtcblx0XHRcdFx0XHRcdG9GdW5jdGlvbkNvbnRleHQgPSBvTWFpbkxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3Qgb0Z1bmN0aW9uID0gc0Z1bmN0aW9uUGF0aCAmJiAob01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRnVuY3Rpb25QYXRoKSBhcyBhbnkpO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0bGV0IG9EYXRhOiBhbnk7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnN0IG9Db250ZXh0ID1cblx0XHRcdFx0XHRcdFx0b0Z1bmN0aW9uICYmIG9GdW5jdGlvbi5nZXRPYmplY3QoKSAmJiBvRnVuY3Rpb24uZ2V0T2JqZWN0KClbMF0uJElzQm91bmRcblx0XHRcdFx0XHRcdFx0XHQ/IGF3YWl0IG9wZXJhdGlvbnMuY2FsbEJvdW5kRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZSwgb0Z1bmN0aW9uQ29udGV4dCwgb01vZGVsKVxuXHRcdFx0XHRcdFx0XHRcdDogYXdhaXQgb3BlcmF0aW9ucy5jYWxsRnVuY3Rpb25JbXBvcnQoc0Z1bmN0aW9uTmFtZSwgb01vZGVsKTtcblx0XHRcdFx0XHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRvRGF0YSA9IG9Db250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoYEVycm9yIHdoaWxlIGV4ZWN1dGluZyB0aGUgZnVuY3Rpb24gJHtzRnVuY3Rpb25OYW1lfWAsIG9FcnJvcik7XG5cdFx0XHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRhdGEgPSBvRGF0YSA/IE9iamVjdC5hc3NpZ24oe30sIG9EYXRhLCBtUGFyYW1ldGVycy5kYXRhKSA6IG1QYXJhbWV0ZXJzLmRhdGE7XG5cdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmRhdGEpIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBtUGFyYW1ldGVycy5kYXRhW1wiQG9kYXRhLmNvbnRleHRcIl07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdG9SZXN1bHQgPSBhd2FpdCB0aGlzLl9sYXVuY2hEaWFsb2dXaXRoS2V5RmllbGRzKFxuXHRcdFx0XHRcdFx0XHRvTWFpbkxpc3RCaW5kaW5nLFxuXHRcdFx0XHRcdFx0XHRhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzLFxuXHRcdFx0XHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRhcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0b05ld0RvY3VtZW50Q29udGV4dCA9IG9SZXN1bHQubmV3Q29udGV4dDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrKSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHRvRVM2UHJvbWlzZShcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjayh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogb01haW5MaXN0QmluZGluZyAmJiBvTWFpbkxpc3RCaW5kaW5nLmdldFBhdGgoKVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG9OZXdEb2N1bWVudENvbnRleHQgPSBvTWFpbkxpc3RCaW5kaW5nLmNyZWF0ZShcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGF0YSxcblx0XHRcdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmluYWN0aXZlXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0aWYgKCFtUGFyYW1ldGVycy5pbmFjdGl2ZSkge1xuXHRcdFx0XHRcdFx0XHRvUmVzdWx0ID0gYXdhaXQgdGhpcy5vbkFmdGVyQ3JlYXRlQ29tcGxldGlvbihvTWFpbkxpc3RCaW5kaW5nLCBvTmV3RG9jdW1lbnRDb250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGNyZWF0aW5nIHRoZSBuZXcgZG9jdW1lbnRcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0b05ld0RvY3VtZW50Q29udGV4dCA9IG9OZXdEb2N1bWVudENvbnRleHQgfHwgb1Jlc3VsdDtcblxuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coeyBjb250cm9sOiBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sIH0pO1xuXHRcdFx0cmV0dXJuIG9OZXdEb2N1bWVudENvbnRleHQhO1xuXHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHQvLyBUT0RPOiBjdXJyZW50bHksIHRoZSBvbmx5IGVycm9ycyBoYW5kbGVkIGhlcmUgYXJlIHJhaXNlZCBhcyBzdHJpbmcgLSBzaG91bGQgYmUgY2hhbmdlZCB0byBFcnJvciBvYmplY3RzXG5cdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZyh7IGNvbnRyb2w6IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wgfSk7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChlcnJvciA9PT0gRkVMaWJyYXJ5LkNvbnN0YW50cy5BY3Rpb25FeGVjdXRpb25GYWlsZWQgfHwgZXJyb3IgPT09IEZFTGlicmFyeS5Db25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nKSAmJlxuXHRcdFx0XHRvTmV3RG9jdW1lbnRDb250ZXh0Py5pc1RyYW5zaWVudCgpXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gVGhpcyBpcyBhIHdvcmthcm91bmQgc3VnZ2VzdGVkIGJ5IG1vZGVsIGFzIENvbnRleHQuZGVsZXRlIHJlc3VsdHMgaW4gYW4gZXJyb3Jcblx0XHRcdFx0Ly8gVE9ETzogcmVtb3ZlIHRoZSAkZGlyZWN0IG9uY2UgbW9kZWwgcmVzb2x2ZXMgdGhpcyBpc3N1ZVxuXHRcdFx0XHQvLyB0aGlzIGxpbmUgc2hvd3MgdGhlIGV4cGVjdGVkIGNvbnNvbGUgZXJyb3IgVW5jYXVnaHQgKGluIHByb21pc2UpIEVycm9yOiBSZXF1ZXN0IGNhbmNlbGVkOiBQT1NUIFRyYXZlbDsgZ3JvdXA6IHN1Ym1pdExhdGVyXG5cdFx0XHRcdG9OZXdEb2N1bWVudENvbnRleHQuZGVsZXRlKFwiJGRpcmVjdFwiKTtcblx0XHRcdH1cblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLmJ1c3lVbmxvY2soYXBwQ29tcG9uZW50LCBzQnVzeVBhdGgpO1xuXHRcdH1cblx0fVxuXG5cdF9pc0RyYWZ0RW5hYmxlZCh2Q29udGV4dHM6IE9EYXRhVjRDb250ZXh0W10pIHtcblx0XHRjb25zdCBjb250ZXh0Rm9yRHJhZnRNb2RlbCA9IHZDb250ZXh0c1swXTtcblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChjb250ZXh0Rm9yRHJhZnRNb2RlbCk7XG5cdFx0cmV0dXJuIHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0O1xuXHR9XG5cdC8qKlxuXHQgKiBEZWxldGUgb25lIG9yIG11bHRpcGxlIGRvY3VtZW50KHMpLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAcGFyYW0gY29udGV4dHMgQ29udGV4dHMgRWl0aGVyIG9uZSBjb250ZXh0IG9yIGFuIGFycmF5IHdpdGggY29udGV4dHMgdG8gYmUgZGVsZXRlZFxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgT3B0aW9uYWwsIGNhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLnRpdGxlIFRpdGxlIG9mIHRoZSBvYmplY3QgdG8gYmUgZGVsZXRlZFxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMuZGVzY3JpcHRpb24gRGVzY3JpcHRpb24gb2YgdGhlIG9iamVjdCB0byBiZSBkZWxldGVkXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgTnVtYmVyIG9mIG9iamVjdHMgc2VsZWN0ZWRcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLm5vRGlhbG9nIFRvIGRpc2FibGUgdGhlIGNvbmZpcm1hdGlvbiBkaWFsb2dcblx0ICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgYXBwQ29tcG9uZW50XG5cdCAqIEBwYXJhbSByZXNvdXJjZUJ1bmRsZSBUaGUgYnVuZGxlIHRvIGxvYWQgdGV4dCByZXNvdXJjZXNcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXIgZXh0ZW5zaW9uXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSByZXNvbHZlZCBvbmNlIHRoZSBkb2N1bWVudCBhcmUgZGVsZXRlZFxuXHQgKi9cblx0ZGVsZXRlRG9jdW1lbnQoXG5cdFx0Y29udGV4dHM6IE9EYXRhVjRDb250ZXh0IHwgW09EYXRhVjRDb250ZXh0XSxcblx0XHRtUGFyYW1ldGVyczogYW55LFxuXHRcdGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRcdHJlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSxcblx0XHRtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXJcblx0KSB7XG5cdFx0Y29uc3QgcmVzb3VyY2VCdW5kbGVDb3JlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRsZXQgYVBhcmFtcztcblx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCk7XG5cblx0XHRjb25zdCBjb250ZXh0c1RvRGVsZXRlID0gQXJyYXkuaXNBcnJheShjb250ZXh0cykgPyBbLi4uY29udGV4dHNdIDogW2NvbnRleHRzXTtcblxuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBkcmFmdEVuYWJsZWQgPSB0aGlzLl9pc0RyYWZ0RW5hYmxlZChtUGFyYW1ldGVycy5zZWxlY3RlZENvbnRleHRzIHx8IGNvbnRleHRzVG9EZWxldGUpO1xuXHRcdFx0XHRjb25zdCBpdGVtczogYW55W10gPSBbXTtcblx0XHRcdFx0Y29uc3Qgb3B0aW9uczogYW55W10gPSBbXTtcblxuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cykge1xuXHRcdFx0XHRcdFx0Ly8gbm9uLVRhYmxlXG5cdFx0XHRcdFx0XHRpZiAoZHJhZnRFbmFibGVkKSB7XG5cdFx0XHRcdFx0XHRcdC8vIENoZWNrIGlmIDEgb2YgdGhlIGRyYWZ0cyBpcyBsb2NrZWQgYnkgYW5vdGhlciB1c2VyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGxvY2tlZENvbnRleHQgPSBjb250ZXh0c1RvRGVsZXRlLmZpbmQoKGNvbnRleHQpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBjb250ZXh0RGF0YSA9IGNvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHREYXRhLklzQWN0aXZlRW50aXR5ID09PSB0cnVlICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0RGF0YS5IYXNEcmFmdEVudGl0eSA9PT0gdHJ1ZSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dERhdGEuRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEgJiZcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHREYXRhLkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhLkluUHJvY2Vzc0J5VXNlciAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0IWNvbnRleHREYXRhLkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhLkRyYWZ0SXNDcmVhdGVkQnlNZVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRpZiAobG9ja2VkQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIFNob3cgbWVzc2FnZSBib3ggd2l0aCB0aGUgbmFtZSBvZiB0aGUgbG9ja2luZyB1c2VyIGFuZCByZXR1cm5cblx0XHRcdFx0XHRcdFx0XHRjb25zdCBsb2NraW5nVXNlck5hbWUgPSBsb2NrZWRDb250ZXh0LmdldE9iamVjdCgpLkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhLkluUHJvY2Vzc0J5VXNlcjtcblx0XHRcdFx0XHRcdFx0XHRNZXNzYWdlQm94LnNob3coXG5cdFx0XHRcdFx0XHRcdFx0XHRDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1NJTkdMRV9PQkpFQ1RfTE9DS0VEXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRbbG9ja2luZ1VzZXJOYW1lXVxuXHRcdFx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGl0bGU6IHJlc291cmNlQnVuZGxlQ29yZS5nZXRUZXh0KFwiQ19DT01NT05fREVMRVRFXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvbkNsb3NlOiByZWplY3Rcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMgPSBnZXRQYXJhbWV0ZXJzKG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRcdGxldCBub25UYWJsZVR4dCA9IFwiXCI7XG5cdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMudGl0bGUpIHtcblx0XHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdFx0YVBhcmFtcyA9IFttUGFyYW1ldGVycy50aXRsZSArIFwiIFwiLCBtUGFyYW1ldGVycy5kZXNjcmlwdGlvbl07XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0YVBhcmFtcyA9IFttUGFyYW1ldGVycy50aXRsZSwgXCJcIl07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0bm9uVGFibGVUeHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT1wiLFxuXHRcdFx0XHRcdFx0XHRcdHJlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdGFQYXJhbXMsXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0bm9uVGFibGVUeHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfU0lOR1VMQVJcIixcblx0XHRcdFx0XHRcdFx0XHRyZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b3B0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dHlwZTogXCJkZWxldGFibGVDb250ZXh0c1wiLFxuXHRcdFx0XHRcdFx0XHRjb250ZXh0czogY29udGV4dHNUb0RlbGV0ZSxcblx0XHRcdFx0XHRcdFx0dGV4dDogbm9uVGFibGVUeHQsXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRjb250cm9sOiBcInRleHRcIlxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIFRhYmxlXG5cdFx0XHRcdFx0XHRsZXQgdG90YWxEZWxldGFibGUgPSBjb250ZXh0c1RvRGVsZXRlLmxlbmd0aDtcblxuXHRcdFx0XHRcdFx0aWYgKGRyYWZ0RW5hYmxlZCkge1xuXHRcdFx0XHRcdFx0XHR0b3RhbERlbGV0YWJsZSArPVxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUubGVuZ3RoICtcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlLmxlbmd0aCArXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMudW5TYXZlZENvbnRleHRzLmxlbmd0aCArXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRlTW9kZUNvbnRleHRzLmxlbmd0aDtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlSGVscGVyLnVwZGF0ZURyYWZ0T3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzKFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHRzVG9EZWxldGUsXG5cdFx0XHRcdFx0XHRcdFx0dG90YWxEZWxldGFibGUsXG5cdFx0XHRcdFx0XHRcdFx0cmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0aXRlbXMsXG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1xuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRkZWxldGVIZWxwZXIudXBkYXRlT3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzKG1QYXJhbWV0ZXJzLCBjb250ZXh0c1RvRGVsZXRlLCByZXNvdXJjZUJ1bmRsZSwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ29udGVudCBvZiBEZWxldGUgRGlhbG9nXG5cdFx0XHRcdGRlbGV0ZUhlbHBlci51cGRhdGVDb250ZW50Rm9yRGVsZXRlRGlhbG9nKG9wdGlvbnMsIGl0ZW1zKTtcblx0XHRcdFx0Y29uc3QgdkJveCA9IG5ldyBWQm94KHsgaXRlbXM6IGl0ZW1zIH0pO1xuXHRcdFx0XHRjb25zdCBzVGl0bGUgPSByZXNvdXJjZUJ1bmRsZUNvcmUuZ2V0VGV4dChcIkNfQ09NTU9OX0RFTEVURVwiKTtcblxuXHRcdFx0XHRjb25zdCBmbkNvbmZpcm0gPSBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5idXN5TG9jayhhcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBkZWxldGVIZWxwZXIuZGVsZXRlQ29uZmlybUhhbmRsZXIoXG5cdFx0XHRcdFx0XHRcdG9wdGlvbnMsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdFx0cmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdGFwcENvbXBvbmVudCxcblx0XHRcdFx0XHRcdFx0ZHJhZnRFbmFibGVkXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRyZWplY3QoKTtcblx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0dGhpcy5idXN5VW5sb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGxldCBkaWFsb2dDb25maXJtZWQgPSBmYWxzZTtcblx0XHRcdFx0Y29uc3Qgb0RpYWxvZyA9IG5ldyBEaWFsb2coe1xuXHRcdFx0XHRcdHRpdGxlOiBzVGl0bGUsXG5cdFx0XHRcdFx0c3RhdGU6IFwiV2FybmluZ1wiLFxuXHRcdFx0XHRcdGNvbnRlbnQ6IFt2Qm94XSxcblx0XHRcdFx0XHRhcmlhTGFiZWxsZWRCeTogaXRlbXMsXG5cdFx0XHRcdFx0YmVnaW5CdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHRcdFx0dGV4dDogcmVzb3VyY2VCdW5kbGVDb3JlLmdldFRleHQoXCJDX0NPTU1PTl9ERUxFVEVcIiksXG5cdFx0XHRcdFx0XHR0eXBlOiBcIkVtcGhhc2l6ZWRcIixcblx0XHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdFx0XHRkaWFsb2dDb25maXJtZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRcdGZuQ29uZmlybSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdGVuZEJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdFx0XHR0ZXh0OiBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09NTU9OX0RJQUxPR19DQU5DRUxcIiwgcmVzb3VyY2VCdW5kbGUpLFxuXHRcdFx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdGFmdGVyQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9EaWFsb2cuZGVzdHJveSgpO1xuXHRcdFx0XHRcdFx0Ly8gaWYgZGlhbG9nIGlzIGNsb3NlZCB1bmNvbmZpcm1lZCAoZS5nLiB2aWEgXCJDYW5jZWxcIiBvciBFc2NhcGUgYnV0dG9uKSwgZW5zdXJlIHRvIHJlamVjdCBwcm9taXNlXG5cdFx0XHRcdFx0XHRpZiAoIWRpYWxvZ0NvbmZpcm1lZCkge1xuXHRcdFx0XHRcdFx0XHRyZWplY3QoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gYXMgYW55KTtcblx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLm5vRGlhbG9nKSB7XG5cdFx0XHRcdFx0Zm5Db25maXJtKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b0RpYWxvZy5hZGRTdHlsZUNsYXNzKFwic2FwVWlDb250ZW50UGFkZGluZ1wiKTtcblx0XHRcdFx0XHRvRGlhbG9nLm9wZW4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0dGhpcy5idXN5VW5sb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqIEVkaXRzIGEgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBhY3RpdmUgZG9jdW1lbnRcblx0ICogQHBhcmFtIG9WaWV3IEN1cnJlbnQgdmlld1xuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBhcHBDb21wb25lbnRcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXIgZXh0ZW5zaW9uXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCB0aGUgbmV3IGRyYWZ0IGNvbnRleHQgaW4gY2FzZSBvZiBkcmFmdCBwcm9ncmFtbWluZyBtb2RlbFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRhc3luYyBlZGl0RG9jdW1lbnQoXG5cdFx0b0NvbnRleHQ6IE9EYXRhVjRDb250ZXh0LFxuXHRcdG9WaWV3OiBWaWV3LFxuXHRcdGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRcdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlclxuXHQpOiBQcm9taXNlPE9EYXRhVjRDb250ZXh0IHwgdW5kZWZpbmVkPiB7XG5cdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQpO1xuXHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkJpbmRpbmcgY29udGV4dCB0byBhY3RpdmUgZG9jdW1lbnQgaXMgcmVxdWlyZWRcIik7XG5cdFx0fVxuXHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCAhPT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCAmJiBzUHJvZ3JhbW1pbmdNb2RlbCAhPT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVkaXQgaXMgb25seSBhbGxvd2VkIGZvciBkcmFmdCBvciBzdGlja3kgc2Vzc2lvbiBzdXBwb3J0ZWQgc2VydmljZXNcIik7XG5cdFx0fVxuXHRcdHRoaXMuYnVzeUxvY2soYXBwQ29tcG9uZW50KTtcblx0XHQvLyBiZWZvcmUgdHJpZ2dlcmluZyB0aGUgZWRpdCBhY3Rpb24gd2UnbGwgaGF2ZSB0byByZW1vdmUgYWxsIGJvdW5kIHRyYW5zaXRpb24gbWVzc2FnZXNcblx0XHRtZXNzYWdlSGFuZGxlci5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBvTmV3Q29udGV4dCA9XG5cdFx0XHRcdHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0XG5cdFx0XHRcdFx0PyBhd2FpdCBkcmFmdC5jcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudChvQ29udGV4dCwgYXBwQ29tcG9uZW50LCB7XG5cdFx0XHRcdFx0XHRcdGJQcmVzZXJ2ZUNoYW5nZXM6IHRydWUsXG5cdFx0XHRcdFx0XHRcdG9WaWV3OiBvVmlld1xuXHRcdFx0XHRcdCAgfSBhcyBhbnkpXG5cdFx0XHRcdFx0OiBhd2FpdCBzdGlja3kuZWRpdERvY3VtZW50SW5TdGlja3lTZXNzaW9uKG9Db250ZXh0LCBhcHBDb21wb25lbnQpO1xuXG5cdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdFx0cmV0dXJuIG9OZXdDb250ZXh0O1xuXHRcdH0gY2F0Y2ggKGVycjogYW55KSB7XG5cdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoeyBjb25jdXJyZW50RWRpdEZsYWc6IHRydWUgfSk7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMuYnVzeVVubG9jayhhcHBDb21wb25lbnQpO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogQ2FuY2VsICdlZGl0JyBtb2RlIG9mIGEgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBkb2N1bWVudCB0byBiZSBjYW5jZWxlZCBvciBkZWxldGVkXG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVyc10gT3B0aW9uYWwsIGNhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uIENhbmNlbCBCdXR0b24gb2YgdGhlIGRpc2NhcmQgcG9wb3ZlciAobWFuZGF0b3J5IGZvciBub3cpXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnNraXBEaXNjYXJkUG9wb3ZlciBPcHRpb25hbCwgc3VwcmVzc2VzIHRoZSBkaXNjYXJkIHBvcG92ZXIgaW5jYXNlIG9mIGRyYWZ0IGFwcGxpY2F0aW9ucyB3aGlsZSBuYXZpZ2F0aW5nIG91dCBvZiBPUFxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBhcHBDb21wb25lbnRcblx0ICogQHBhcmFtIHJlc291cmNlQnVuZGxlIFRoZSBidW5kbGUgdG8gbG9hZCB0ZXh0IHJlc291cmNlc1xuXHQgKiBAcGFyYW0gbWVzc2FnZUhhbmRsZXIgVGhlIG1lc3NhZ2UgaGFuZGxlciBleHRlbnNpb25cblx0ICogQHBhcmFtIGlzTmV3T2JqZWN0IFRydWUgaWYgd2UncmUgdHJ5aW5nIHRvIGNhbmNlbCBhIG5ld2x5IGNyZWF0ZWQgb2JqZWN0XG5cdCAqIEBwYXJhbSBpc09iamVjdE1vZGlmaWVkIFRydWUgaWYgdGhlIG9iamVjdCBoYXMgYmVlbiBtb2RpZmllZCBieSB0aGUgdXNlclxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggPz8/XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGFzeW5jIGNhbmNlbERvY3VtZW50KFxuXHRcdG9Db250ZXh0OiBPRGF0YVY0Q29udGV4dCxcblx0XHRtSW5QYXJhbWV0ZXJzOiB7IGNhbmNlbEJ1dHRvbjogQnV0dG9uOyBza2lwRGlzY2FyZFBvcG92ZXI6IGJvb2xlYW4gfSB8IHVuZGVmaW5lZCxcblx0XHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0XHRyZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRcdGlzTmV3T2JqZWN0OiBib29sZWFuLFxuXHRcdGlzT2JqZWN0TW9kaWZpZWQ6IGJvb2xlYW5cblx0KTogUHJvbWlzZTxPRGF0YVY0Q29udGV4dCB8IGJvb2xlYW4+IHtcblx0XHQvL2NvbnRleHQgbXVzdCBhbHdheXMgYmUgcGFzc2VkIC0gbWFuZGF0b3J5IHBhcmFtZXRlclxuXHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIGNvbnRleHQgZXhpc3RzLiBQYXNzIGEgbWVhbmluZ2Z1bCBjb250ZXh0XCIpO1xuXHRcdH1cblx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0Y29uc3QgbVBhcmFtZXRlcnMgPSBnZXRQYXJhbWV0ZXJzKG1JblBhcmFtZXRlcnMpO1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQpO1xuXG5cdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0ICYmIHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2FuY2VsIGRvY3VtZW50IG9ubHkgYWxsb3dlZCBmb3IgZHJhZnQgb3Igc3RpY2t5IHNlc3Npb24gc3VwcG9ydGVkIHNlcnZpY2VzXCIpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0bGV0IHJldHVybmVkVmFsdWU6IE9EYXRhVjRDb250ZXh0IHwgYm9vbGVhbiA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgJiYgIWlzT2JqZWN0TW9kaWZpZWQpIHtcblx0XHRcdFx0Y29uc3QgZHJhZnREYXRhQ29udGV4dCA9IG9Nb2RlbC5iaW5kQ29udGV4dChgJHtvQ29udGV4dC5nZXRQYXRoKCl9L0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhYCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdGNvbnN0IGRyYWZ0QWRtaW5EYXRhID0gYXdhaXQgZHJhZnREYXRhQ29udGV4dC5yZXF1ZXN0T2JqZWN0KCk7XG5cdFx0XHRcdGlmIChkcmFmdEFkbWluRGF0YSkge1xuXHRcdFx0XHRcdGlzT2JqZWN0TW9kaWZpZWQgPSBkcmFmdEFkbWluRGF0YS5DcmVhdGlvbkRhdGVUaW1lICE9PSBkcmFmdEFkbWluRGF0YS5MYXN0Q2hhbmdlRGF0ZVRpbWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICghbVBhcmFtZXRlcnMuc2tpcERpc2NhcmRQb3BvdmVyKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuX2NvbmZpcm1EaXNjYXJkKG1QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbiwgaXNPYmplY3RNb2RpZmllZCwgcmVzb3VyY2VCdW5kbGUpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9Db250ZXh0LmlzS2VlcEFsaXZlKCkpIHtcblx0XHRcdFx0b0NvbnRleHQuc2V0S2VlcEFsaXZlKGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdGlmIChtUGFyYW1ldGVycy5iZWZvcmVDYW5jZWxDYWxsQmFjaykge1xuXHRcdFx0XHRhd2FpdCBtUGFyYW1ldGVycy5iZWZvcmVDYW5jZWxDYWxsQmFjayh7IGNvbnRleHQ6IG9Db250ZXh0IH0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHRcdGlmIChpc05ld09iamVjdCkge1xuXHRcdFx0XHRcdGlmIChvQ29udGV4dC5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybmVkVmFsdWUgPSBhd2FpdCBkcmFmdC5kZWxldGVEcmFmdChvQ29udGV4dCwgYXBwQ29tcG9uZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBvU2libGluZ0NvbnRleHQgPSBvTW9kZWwuYmluZENvbnRleHQoYCR7b0NvbnRleHQuZ2V0UGF0aCgpfS9TaWJsaW5nRW50aXR5YCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnN0IHNDYW5vbmljYWxQYXRoID0gYXdhaXQgb1NpYmxpbmdDb250ZXh0LnJlcXVlc3RDYW5vbmljYWxQYXRoKCk7XG5cdFx0XHRcdFx0XHRpZiAob0NvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm5lZFZhbHVlID0gb01vZGVsLmJpbmRDb250ZXh0KHNDYW5vbmljYWxQYXRoKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0YXdhaXQgZHJhZnQuZGVsZXRlRHJhZnQob0NvbnRleHQsIGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBkaXNjYXJkZWRDb250ZXh0ID0gYXdhaXQgc3RpY2t5LmRpc2NhcmREb2N1bWVudChvQ29udGV4dCk7XG5cdFx0XHRcdGlmIChkaXNjYXJkZWRDb250ZXh0KSB7XG5cdFx0XHRcdFx0aWYgKGRpc2NhcmRlZENvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdFx0ZGlzY2FyZGVkQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghaXNOZXdPYmplY3QpIHtcblx0XHRcdFx0XHRcdGRpc2NhcmRlZENvbnRleHQucmVmcmVzaCgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuZWRWYWx1ZSA9IGRpc2NhcmRlZENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJlbW92ZSBleGlzdGluZyBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzXG5cdFx0XHRtZXNzYWdlSGFuZGxlci5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdC8vIHNob3cgdW5ib3VuZCBtZXNzYWdlc1xuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdFx0XHRyZXR1cm4gcmV0dXJuZWRWYWx1ZTtcblx0XHR9IGNhdGNoIChlcnI6IGFueSkge1xuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMuYnVzeVVubG9jayhhcHBDb21wb25lbnQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlcyB0aGUgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgb2YgdGhlIGRvY3VtZW50IHRvIGJlIHNhdmVkXG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgVGhlIGFwcENvbXBvbmVudFxuXHQgKiBAcGFyYW0gcmVzb3VyY2VCdW5kbGUgVGhlIGJ1bmRsZSB0byBsb2FkIHRleHQgcmVzb3VyY2VzXG5cdCAqIEBwYXJhbSBleGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIFRydWUgaWYgd2Ugc2hvdWxkIGV4ZWN1dGUgc2lkZSBlZmZlY3RzIGluIGNhc2Ugb2YgYW4gZXJyb3Jcblx0ICogQHBhcmFtIGJpbmRpbmdzRm9yU2lkZUVmZmVjdHMgVGhlIGxpc3RCaW5kaW5ncyB0byBiZSB1c2VkIGZvciBleGVjdXRpbmcgc2lkZSBlZmZlY3RzIG9uIGVycm9yXG5cdCAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlciBUaGUgbWVzc2FnZSBoYW5kbGVyIGV4dGVuc2lvblxuXHQgKiBAcGFyYW0gaXNOZXdPYmplY3QgVHJ1ZSBpZiB3ZSdyZSB0cnlpbmcgdG8gY2FuY2VsIGEgbmV3bHkgY3JlYXRlZCBvYmplY3Rcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyB3aXRoID8/P1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRhc3luYyBzYXZlRG9jdW1lbnQoXG5cdFx0Y29udGV4dDogT0RhdGFWNENvbnRleHQsXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdFx0cmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLFxuXHRcdGV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3I6IGJvb2xlYW4sXG5cdFx0YmluZGluZ3NGb3JTaWRlRWZmZWN0czogT0RhdGFMaXN0QmluZGluZ1tdLFxuXHRcdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlcixcblx0XHRpc05ld09iamVjdDogYm9vbGVhblxuXHQpOiBQcm9taXNlPE9EYXRhVjRDb250ZXh0PiB7XG5cdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwoY29udGV4dCk7XG5cdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSAmJiBzUHJvZ3JhbW1pbmdNb2RlbCAhPT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiU2F2ZSBpcyBvbmx5IGFsbG93ZWQgZm9yIGRyYWZ0IG9yIHN0aWNreSBzZXNzaW9uIHN1cHBvcnRlZCBzZXJ2aWNlc1wiKTtcblx0XHR9XG5cdFx0Ly8gaW4gY2FzZSBvZiBzYXZpbmcgLyBhY3RpdmF0aW5nIHRoZSBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIHNoYWxsIGJlIHJlbW92ZWQgYmVmb3JlIHRoZSBQQVRDSC9QT1NUXG5cdFx0Ly8gaXMgc2VudCB0byB0aGUgYmFja2VuZFxuXHRcdG1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMuYnVzeUxvY2soYXBwQ29tcG9uZW50KTtcblx0XHRcdGNvbnN0IG9BY3RpdmVEb2N1bWVudCA9XG5cdFx0XHRcdHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0XG5cdFx0XHRcdFx0PyBhd2FpdCBkcmFmdC5hY3RpdmF0ZURvY3VtZW50KGNvbnRleHQsIGFwcENvbXBvbmVudCwge30sIG1lc3NhZ2VIYW5kbGVyKVxuXHRcdFx0XHRcdDogYXdhaXQgc3RpY2t5LmFjdGl2YXRlRG9jdW1lbnQoY29udGV4dCwgYXBwQ29tcG9uZW50KTtcblxuXHRcdFx0Y29uc3QgbWVzc2FnZXNSZWNlaXZlZCA9IG1lc3NhZ2VIYW5kbGluZy5nZXRNZXNzYWdlcygpLmNvbmNhdChtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZXModHJ1ZSwgdHJ1ZSkpOyAvLyBnZXQgdW5ib3VuZCBhbmQgYm91bmQgbWVzc2FnZXMgcHJlc2VudCBpbiB0aGUgbW9kZWxcblx0XHRcdGlmICghKG1lc3NhZ2VzUmVjZWl2ZWQubGVuZ3RoID09PSAxICYmIG1lc3NhZ2VzUmVjZWl2ZWRbMF0udHlwZSA9PT0gY29yZUxpYnJhcnkuTWVzc2FnZVR5cGUuU3VjY2VzcykpIHtcblx0XHRcdFx0Ly8gc2hvdyBvdXIgb2JqZWN0IGNyZWF0aW9uIHRvYXN0IG9ubHkgaWYgaXQgaXMgbm90IGNvbWluZyBmcm9tIGJhY2tlbmRcblx0XHRcdFx0TWVzc2FnZVRvYXN0LnNob3coXG5cdFx0XHRcdFx0aXNOZXdPYmplY3Rcblx0XHRcdFx0XHRcdD8gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9PQkpFQ1RfQ1JFQVRFRFwiLCByZXNvdXJjZUJ1bmRsZSlcblx0XHRcdFx0XHRcdDogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9PQkpFQ1RfU0FWRURcIiwgcmVzb3VyY2VCdW5kbGUpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBvQWN0aXZlRG9jdW1lbnQ7XG5cdFx0fSBjYXRjaCAoZXJyOiBhbnkpIHtcblx0XHRcdGlmIChleGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yICYmIGJpbmRpbmdzRm9yU2lkZUVmZmVjdHM/Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0LyogVGhlIHNpZGVFZmZlY3RzIGFyZSBleGVjdXRlZCBvbmx5IGZvciB0YWJsZSBpdGVtcyBpbiB0cmFuc2llbnQgc3RhdGUgKi9cblx0XHRcdFx0YmluZGluZ3NGb3JTaWRlRWZmZWN0cy5mb3JFYWNoKChsaXN0QmluZGluZykgPT4ge1xuXHRcdFx0XHRcdGlmICghQ29tbW9uVXRpbHMuaGFzVHJhbnNpZW50Q29udGV4dChsaXN0QmluZGluZykpIHtcblx0XHRcdFx0XHRcdGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKS5yZXF1ZXN0U2lkZUVmZmVjdHNGb3JOYXZpZ2F0aW9uUHJvcGVydHkobGlzdEJpbmRpbmcuZ2V0UGF0aCgpLCBjb250ZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMuYnVzeVVubG9jayhhcHBDb21wb25lbnQpO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogQ2FsbHMgYSBib3VuZCBvciB1bmJvdW5kIGFjdGlvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBzdGF0aWNcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIuY2FsbEFjdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXNdIEEgbWFwIG9mIGFjdGlvbiBwYXJhbWV0ZXIgbmFtZXMgYW5kIHByb3ZpZGVkIHZhbHVlc1xuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2ddIFNraXBzIHRoZSBwYXJhbWV0ZXIgZGlhbG9nIGlmIHZhbHVlcyBhcmUgcHJvdmlkZWQgZm9yIGFsbCBvZiB0aGVtXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY29udGV4dHNdIE1hbmRhdG9yeSBmb3IgYSBib3VuZCBhY3Rpb246IEVpdGhlciBvbmUgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIHRvIGJlIGNhbGxlZFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm1vZGVsXSBNYW5kYXRvcnkgZm9yIGFuIHVuYm91bmQgYWN0aW9uOiBBbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmludm9jYXRpb25Hcm91cGluZ10gTW9kZSBob3cgYWN0aW9ucyBhcmUgdG8gYmUgY2FsbGVkOiAnQ2hhbmdlU2V0JyB0byBwdXQgYWxsIGFjdGlvbiBjYWxscyBpbnRvIG9uZSBjaGFuZ2VzZXQsICdJc29sYXRlZCcgdG8gcHV0IHRoZW0gaW50byBzZXBhcmF0ZSBjaGFuZ2VzZXRzXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubGFiZWxdIEEgaHVtYW4tcmVhZGFibGUgbGFiZWwgZm9yIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0XSBJZiBzcGVjaWZpZWQsIHRoZSBhY3Rpb24gcHJvbWlzZSByZXR1cm5zIHRoZSBib3VuZCBjb250ZXh0XG5cdCAqIEBwYXJhbSBvVmlldyBDb250YWlucyB0aGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHZpZXdcblx0ICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgYXBwQ29tcG9uZW50XG5cdCAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlciBUaGUgbWVzc2FnZSBoYW5kbGVyIGV4dGVuc2lvblxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggYW4gYXJyYXkgb2YgcmVzcG9uc2Ugb2JqZWN0cyAoVE9ETzogdG8gYmUgY2hhbmdlZClcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0YXN5bmMgY2FsbEFjdGlvbihcblx0XHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRcdG1QYXJhbWV0ZXJzOiBhbnksXG5cdFx0b1ZpZXc6IFZpZXcgfCBudWxsLFxuXHRcdGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRcdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlclxuXHQpOiBQcm9taXNlPGFueT4ge1xuXHRcdG1QYXJhbWV0ZXJzID0gZ2V0UGFyYW1ldGVycyhtUGFyYW1ldGVycyk7XG5cdFx0bGV0IG9Db250ZXh0LCBvTW9kZWw6IGFueTtcblx0XHRjb25zdCBtQmluZGluZ1BhcmFtZXRlcnMgPSBtUGFyYW1ldGVycy5iaW5kaW5nUGFyYW1ldGVycztcblx0XHRpZiAoIXNBY3Rpb25OYW1lKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQcm92aWRlIG5hbWUgb2YgYWN0aW9uIHRvIGJlIGV4ZWN1dGVkXCIpO1xuXHRcdH1cblx0XHQvLyBhY3Rpb24gaW1wb3J0cyBhcmUgbm90IGRpcmVjdGx5IG9idGFpbmVkIGZyb20gdGhlIG1ldGFNb2RlbCBieSBpdCBpcyBwcmVzZW50IGluc2lkZSB0aGUgZW50aXR5Q29udGFpbmVyXG5cdFx0Ly8gYW5kIHRoZSBhY2lvbnMgaXQgcmVmZXJzIHRvIHByZXNlbnQgb3V0c2lkZSB0aGUgZW50aXR5Y29udGFpbmVyLCBoZW5jZSB0byBvYnRhaW4ga2luZCBvZiB0aGUgYWN0aW9uXG5cdFx0Ly8gc3BsaXQoKSBvbiBpdHMgbmFtZSB3YXMgcmVxdWlyZWRcblx0XHRjb25zdCBzTmFtZSA9IHNBY3Rpb25OYW1lLnNwbGl0KFwiL1wiKVsxXTtcblx0XHRzQWN0aW9uTmFtZSA9IHNOYW1lIHx8IHNBY3Rpb25OYW1lO1xuXHRcdG9Db250ZXh0ID0gc05hbWUgPyB1bmRlZmluZWQgOiBtUGFyYW1ldGVycy5jb250ZXh0cztcblx0XHQvL2NoZWNraW5nIHdoZXRoZXIgdGhlIGNvbnRleHQgaXMgYW4gYXJyYXkgd2l0aCBtb3JlIHRoYW4gMCBsZW5ndGggb3Igbm90IGFuIGFycmF5KGNyZWF0ZSBhY3Rpb24pXG5cdFx0aWYgKG9Db250ZXh0ICYmICgoQXJyYXkuaXNBcnJheShvQ29udGV4dCkgJiYgb0NvbnRleHQubGVuZ3RoKSB8fCAhQXJyYXkuaXNBcnJheShvQ29udGV4dCkpKSB7XG5cdFx0XHRvQ29udGV4dCA9IEFycmF5LmlzQXJyYXkob0NvbnRleHQpID8gb0NvbnRleHRbMF0gOiBvQ29udGV4dDtcblx0XHRcdG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0fVxuXHRcdGlmIChtUGFyYW1ldGVycy5tb2RlbCkge1xuXHRcdFx0b01vZGVsID0gbVBhcmFtZXRlcnMubW9kZWw7XG5cdFx0fVxuXHRcdGlmICghb01vZGVsKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQYXNzIGEgY29udGV4dCBmb3IgYSBib3VuZCBhY3Rpb24gb3IgcGFzcyB0aGUgbW9kZWwgZm9yIGFuIHVuYm91bmQgYWN0aW9uXCIpO1xuXHRcdH1cblx0XHQvLyBnZXQgdGhlIGJpbmRpbmcgcGFyYW1ldGVycyAkc2VsZWN0IGFuZCAkZXhwYW5kIGZvciB0aGUgc2lkZSBlZmZlY3Qgb24gdGhpcyBhY3Rpb25cblx0XHQvLyBhbHNvIGdhdGhlciBhZGRpdGlvbmFsIHByb3BlcnR5IHBhdGhzIHRvIGJlIHJlcXVlc3RlZCBzdWNoIGFzIHRleHQgYXNzb2NpYXRpb25zXG5cdFx0Y29uc3QgbVNpZGVFZmZlY3RzUGFyYW1ldGVycyA9IGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKS5nZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzKHNBY3Rpb25OYW1lLCBvQ29udGV4dCkgfHwge307XG5cblx0XHRjb25zdCBkaXNwbGF5VW5hcHBsaWNhYmxlQ29udGV4dHNEaWFsb2cgPSAoKTogUHJvbWlzZTxPRGF0YVY0Q29udGV4dFtdIHwgdm9pZD4gPT4ge1xuXHRcdFx0aWYgKCFtUGFyYW1ldGVycy5ub3RBcHBsaWNhYmxlQ29udGV4dCB8fCBtUGFyYW1ldGVycy5ub3RBcHBsaWNhYmxlQ29udGV4dC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShtUGFyYW1ldGVycy5jb250ZXh0cyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGZuT3BlbkFuZEZpbGxEaWFsb2cgPSBmdW5jdGlvbiAob0RsZzogRGlhbG9nKSB7XG5cdFx0XHRcdFx0bGV0IG9EaWFsb2dDb250ZW50O1xuXHRcdFx0XHRcdGNvbnN0IG5Ob3RBcHBsaWNhYmxlID0gbVBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHQubGVuZ3RoLFxuXHRcdFx0XHRcdFx0YU5vdEFwcGxpY2FibGVJdGVtcyA9IFtdO1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbVBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdG9EaWFsb2dDb250ZW50ID0gbVBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHRbaV0uZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHRhTm90QXBwbGljYWJsZUl0ZW1zLnB1c2gob0RpYWxvZ0NvbnRlbnQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBvTm90QXBwbGljYWJsZUl0ZW1zTW9kZWwgPSBuZXcgSlNPTk1vZGVsKGFOb3RBcHBsaWNhYmxlSXRlbXMpO1xuXHRcdFx0XHRcdGNvbnN0IG9Ub3RhbHMgPSBuZXcgSlNPTk1vZGVsKHsgdG90YWw6IG5Ob3RBcHBsaWNhYmxlLCBsYWJlbDogbVBhcmFtZXRlcnMubGFiZWwgfSk7XG5cdFx0XHRcdFx0b0RsZy5zZXRNb2RlbChvTm90QXBwbGljYWJsZUl0ZW1zTW9kZWwsIFwibm90QXBwbGljYWJsZVwiKTtcblx0XHRcdFx0XHRvRGxnLnNldE1vZGVsKG9Ub3RhbHMsIFwidG90YWxzXCIpO1xuXHRcdFx0XHRcdG9EbGcub3BlbigpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHQvLyBTaG93IHRoZSBjb250ZXh0cyB0aGF0IGFyZSBub3QgYXBwbGljYWJsZSBhbmQgd2lsbCBub3QgdGhlcmVmb3JlIGJlIHByb2Nlc3NlZFxuXHRcdFx0XHRjb25zdCBzRnJhZ21lbnROYW1lID0gXCJzYXAuZmUuY29yZS5jb250cm9scy5BY3Rpb25QYXJ0aWFsXCI7XG5cdFx0XHRcdGNvbnN0IG9EaWFsb2dGcmFnbWVudCA9IFhNTFRlbXBsYXRlUHJvY2Vzc29yLmxvYWRUZW1wbGF0ZShzRnJhZ21lbnROYW1lLCBcImZyYWdtZW50XCIpO1xuXHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRjb25zdCBzQ2Fub25pY2FsUGF0aCA9IG1QYXJhbWV0ZXJzLmNvbnRleHRzWzBdLmdldENhbm9uaWNhbFBhdGgoKTtcblx0XHRcdFx0Y29uc3Qgc0VudGl0eVNldCA9IGAke3NDYW5vbmljYWxQYXRoLnN1YnN0cigwLCBzQ2Fub25pY2FsUGF0aC5pbmRleE9mKFwiKFwiKSl9L2A7XG5cdFx0XHRcdGNvbnN0IG9EaWFsb2dMYWJlbE1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdFx0dGl0bGU6IG1QYXJhbWV0ZXJzLmxhYmVsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0ZyYWdtZW50ID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdFx0XHRvRGlhbG9nRnJhZ21lbnQsXG5cdFx0XHRcdFx0XHR7IG5hbWU6IHNGcmFnbWVudE5hbWUgfSxcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0XHRcdFx0ZW50aXR5VHlwZTogb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRW50aXR5U2V0KSxcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogb0RpYWxvZ0xhYmVsTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0XHRcdGVudGl0eVR5cGU6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdFx0bWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBvRGlhbG9nTGFiZWxNb2RlbFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWNvbnN0XG5cdFx0XHRcdFx0bGV0IG9EaWFsb2c6IERpYWxvZztcblx0XHRcdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IHtcblx0XHRcdFx0XHRcdG9uQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0Ly8gVXNlciBjYW5jZWxzIGFjdGlvblxuXHRcdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRvbkNvbnRpbnVlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFVzZXJzIGNvbnRpbnVlcyB0aGUgYWN0aW9uIHdpdGggdGhlIGJvdW5kIGNvbnRleHRzXG5cdFx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShtUGFyYW1ldGVycy5hcHBsaWNhYmxlQ29udGV4dCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRvRGlhbG9nID0gKGF3YWl0IEZyYWdtZW50LmxvYWQoeyBkZWZpbml0aW9uOiBvRnJhZ21lbnQsIGNvbnRyb2xsZXI6IG9Db250cm9sbGVyIH0pKSBhcyBEaWFsb2c7XG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIub25DbG9zZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdC8vIFVzZXIgY2FuY2VscyBhY3Rpb25cblx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdG9Db250cm9sbGVyLm9uQ29udGludWUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHQvLyBVc2VycyBjb250aW51ZXMgdGhlIGFjdGlvbiB3aXRoIHRoZSBib3VuZCBjb250ZXh0c1xuXHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShtUGFyYW1ldGVycy5hcHBsaWNhYmxlQ29udGV4dCk7XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wuYWRkRGVwZW5kZW50KG9EaWFsb2cpO1xuXHRcdFx0XHRcdGZuT3BlbkFuZEZpbGxEaWFsb2cob0RpYWxvZyk7XG5cdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcikge1xuXHRcdFx0XHRcdHJlamVjdChvRXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0dHJ5IHtcblx0XHRcdGxldCBvUmVzdWx0OiBhbnk7XG5cdFx0XHRpZiAob0NvbnRleHQgJiYgb01vZGVsKSB7XG5cdFx0XHRcdGNvbnN0IGNvbnRleHRUb1Byb2Nlc3MgPSBhd2FpdCBkaXNwbGF5VW5hcHBsaWNhYmxlQ29udGV4dHNEaWFsb2coKTtcblx0XHRcdFx0aWYgKGNvbnRleHRUb1Byb2Nlc3MpIHtcblx0XHRcdFx0XHRvUmVzdWx0ID0gYXdhaXQgb3BlcmF0aW9ucy5jYWxsQm91bmRBY3Rpb24oc0FjdGlvbk5hbWUsIGNvbnRleHRUb1Byb2Nlc3MsIG9Nb2RlbCwgYXBwQ29tcG9uZW50LCB7XG5cdFx0XHRcdFx0XHRwYXJhbWV0ZXJWYWx1ZXM6IG1QYXJhbWV0ZXJzLnBhcmFtZXRlclZhbHVlcyxcblx0XHRcdFx0XHRcdGludm9jYXRpb25Hcm91cGluZzogbVBhcmFtZXRlcnMuaW52b2NhdGlvbkdyb3VwaW5nLFxuXHRcdFx0XHRcdFx0bGFiZWw6IG1QYXJhbWV0ZXJzLmxhYmVsLFxuXHRcdFx0XHRcdFx0c2tpcFBhcmFtZXRlckRpYWxvZzogbVBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZyxcblx0XHRcdFx0XHRcdG1CaW5kaW5nUGFyYW1ldGVyczogbUJpbmRpbmdQYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0ZW50aXR5U2V0TmFtZTogbVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZSxcblx0XHRcdFx0XHRcdGFkZGl0aW9uYWxTaWRlRWZmZWN0OiBtU2lkZUVmZmVjdHNQYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0b25TdWJtaXR0ZWQ6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuYnVzeUxvY2soYXBwQ29tcG9uZW50KTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRvblJlc3BvbnNlOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuYnVzeVVubG9jayhhcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHBhcmVudENvbnRyb2w6IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0XHRjb250cm9sSWQ6IG1QYXJhbWV0ZXJzLmNvbnRyb2xJZCxcblx0XHRcdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0OiBtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRcdG9wZXJhdGlvbkF2YWlsYWJsZU1hcDogbVBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwLFxuXHRcdFx0XHRcdFx0YklzQ3JlYXRlQWN0aW9uOiBtUGFyYW1ldGVycy5iSXNDcmVhdGVBY3Rpb24sXG5cdFx0XHRcdFx0XHRiR2V0Qm91bmRDb250ZXh0OiBtUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0LFxuXHRcdFx0XHRcdFx0Yk9iamVjdFBhZ2U6IG1QYXJhbWV0ZXJzLmJPYmplY3RQYWdlLFxuXHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXI6IG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24sXG5cdFx0XHRcdFx0XHRzZWxlY3RlZEl0ZW1zOiBtUGFyYW1ldGVycy5jb250ZXh0c1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9SZXN1bHQgPSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUmVzdWx0ID0gYXdhaXQgb3BlcmF0aW9ucy5jYWxsQWN0aW9uSW1wb3J0KHNBY3Rpb25OYW1lLCBvTW9kZWwsIGFwcENvbXBvbmVudCwge1xuXHRcdFx0XHRcdHBhcmFtZXRlclZhbHVlczogbVBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzLFxuXHRcdFx0XHRcdGxhYmVsOiBtUGFyYW1ldGVycy5sYWJlbCxcblx0XHRcdFx0XHRza2lwUGFyYW1ldGVyRGlhbG9nOiBtUGFyYW1ldGVycy5za2lwUGFyYW1ldGVyRGlhbG9nLFxuXHRcdFx0XHRcdGJpbmRpbmdQYXJhbWV0ZXJzOiBtQmluZGluZ1BhcmFtZXRlcnMsXG5cdFx0XHRcdFx0ZW50aXR5U2V0TmFtZTogbVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZSxcblx0XHRcdFx0XHRvblN1Ym1pdHRlZDogKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5idXN5TG9jayhhcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25SZXNwb25zZTogKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5idXN5VW5sb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwYXJlbnRDb250cm9sOiBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0OiBtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IG1QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCxcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcjogbWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0Yk9iamVjdFBhZ2U6IG1QYXJhbWV0ZXJzLmJPYmplY3RQYWdlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVBY3Rpb25SZXNwb25zZShtZXNzYWdlSGFuZGxlciwgbVBhcmFtZXRlcnMsIHNBY3Rpb25OYW1lKTtcblx0XHRcdHJldHVybiBvUmVzdWx0O1xuXHRcdH0gY2F0Y2ggKGVycjogYW55KSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVBY3Rpb25SZXNwb25zZShtZXNzYWdlSGFuZGxlciwgbVBhcmFtZXRlcnMsIHNBY3Rpb25OYW1lKTtcblx0XHRcdHRocm93IGVycjtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIEhhbmRsZXMgbWVzc2FnZXMgZm9yIGFjdGlvbiBjYWxsLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIjX2hhbmRsZUFjdGlvblJlc3BvbnNlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gbWVzc2FnZUhhbmRsZXIgVGhlIG1lc3NhZ2UgaGFuZGxlciBleHRlbnNpb25cblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIFBhcmFtZXRlcnMgdG8gYmUgY29uc2lkZXJlZCBmb3IgdGhlIGFjdGlvbi5cblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdCAqIEByZXR1cm5zIFByb21pc2UgYWZ0ZXIgbWVzc2FnZSBkaWFsb2cgaXMgb3BlbmVkIGlmIHJlcXVpcmVkLlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRfaGFuZGxlQWN0aW9uUmVzcG9uc2UobWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLCBtUGFyYW1ldGVyczogYW55LCBzQWN0aW9uTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgYVRyYW5zaWVudE1lc3NhZ2VzID0gbWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VzKHRydWUsIHRydWUpO1xuXHRcdGNvbnN0IGFjdGlvbk5hbWUgPSBtUGFyYW1ldGVycy5sYWJlbCA/IG1QYXJhbWV0ZXJzLmxhYmVsIDogc0FjdGlvbk5hbWU7XG5cdFx0aWYgKGFUcmFuc2llbnRNZXNzYWdlcy5sZW5ndGggPiAwICYmIG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0KSB7XG5cdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNBY3Rpb25OYW1lXCIsIG1QYXJhbWV0ZXJzLmxhYmVsID8gbVBhcmFtZXRlcnMubGFiZWwgOiBzQWN0aW9uTmFtZSk7XG5cdFx0fVxuXHRcdGxldCBjb250cm9sO1xuXHRcdGlmIChtUGFyYW1ldGVycy5jb250cm9sSWQpIHtcblx0XHRcdGNvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLmJ5SWQobVBhcmFtZXRlcnMuY29udHJvbElkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29udHJvbCA9IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2w7XG5cdFx0fVxuXHRcdHJldHVybiBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoeyBzQWN0aW9uTmFtZTogYWN0aW9uTmFtZSwgY29udHJvbDogY29udHJvbCB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHZhbGlkYXRpb24gZXJyb3JzIGZvciB0aGUgJ0Rpc2NhcmQnIGFjdGlvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyI2hhbmRsZVZhbGlkYXRpb25FcnJvclxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRoYW5kbGVWYWxpZGF0aW9uRXJyb3IoKSB7XG5cdFx0Y29uc3Qgb01lc3NhZ2VNYW5hZ2VyID0gQ29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLFxuXHRcdFx0ZXJyb3JUb1JlbW92ZSA9IG9NZXNzYWdlTWFuYWdlclxuXHRcdFx0XHQuZ2V0TWVzc2FnZU1vZGVsKClcblx0XHRcdFx0LmdldERhdGEoKVxuXHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0Ly8gb25seSBuZWVkcyB0byBoYW5kbGUgdmFsaWRhdGlvbiBtZXNzYWdlcywgdGVjaG5pY2FsIGFuZCBwZXJzaXN0ZW50IGVycm9ycyBuZWVkcyBub3QgdG8gYmUgY2hlY2tlZCBoZXJlLlxuXHRcdFx0XHRcdGlmIChlcnJvci52YWxpZGF0aW9uKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRvTWVzc2FnZU1hbmFnZXIucmVtb3ZlTWVzc2FnZXMoZXJyb3JUb1JlbW92ZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBQb3BvdmVyLiBGYWN0b3J5IG1ldGhvZCB0byBtYWtlIHVuaXQgdGVzdHMgZWFzaWVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gc2V0dGluZ3MgSW5pdGlhbCBwYXJhbWV0ZXJzIGZvciB0aGUgcG9wb3ZlclxuXHQgKiBAcmV0dXJucyBBIG5ldyBQb3BvdmVyXG5cdCAqL1xuXHRfY3JlYXRlUG9wb3ZlcihzZXR0aW5ncz86ICRQb3BvdmVyU2V0dGluZ3MpOiBQb3BvdmVyIHtcblx0XHRyZXR1cm4gbmV3IFBvcG92ZXIoc2V0dGluZ3MpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNob3dzIGEgcG9wb3ZlciB0byBjb25maXJtIGRpc2NhcmQgaWYgbmVlZGVkLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyLl9zaG93RGlzY2FyZFBvcG92ZXJcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBwYXJhbSBjYW5jZWxCdXR0b24gVGhlIGNvbnRyb2wgd2hpY2ggd2lsbCBvcGVuIHRoZSBwb3BvdmVyXG5cdCAqIEBwYXJhbSBpc01vZGlmaWVkIFRydWUgaWYgdGhlIG9iamVjdCBoYXMgYmVlbiBtb2RpZmllZCBhbmQgYSBjb25maXJtYXRpb24gcG9wb3ZlciBtdXN0IGJlIHNob3duXG5cdCAqIEBwYXJhbSByZXNvdXJjZUJ1bmRsZSBUaGUgYnVuZGxlIHRvIGxvYWQgdGV4dCByZXNvdXJjZXNcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBpZiB1c2VyIGNvbmZpcm1zIGRpc2NhcmQsIHJlamVjdHMgaWYgb3RoZXJ3aXNlLCByZWplY3RzIGlmIG5vIGNvbnRyb2wgcGFzc2VkIHRvIG9wZW4gcG9wb3ZlclxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRfY29uZmlybURpc2NhcmQoY2FuY2VsQnV0dG9uOiBCdXR0b24sIGlzTW9kaWZpZWQ6IGJvb2xlYW4sIHJlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIElmIHRoZSBkYXRhIGlzbid0IG1vZGlmaWVkLCBkbyBub3Qgc2hvdyBhbnkgY29uZmlybWF0aW9uIHBvcG92ZXJcblx0XHRpZiAoIWlzTW9kaWZpZWQpIHtcblx0XHRcdHRoaXMuaGFuZGxlVmFsaWRhdGlvbkVycm9yKCk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXG5cdFx0Y2FuY2VsQnV0dG9uLnNldEVuYWJsZWQoZmFsc2UpO1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRjb25zdCBjb25maXJtYXRpb25Qb3BvdmVyID0gdGhpcy5fY3JlYXRlUG9wb3Zlcih7XG5cdFx0XHRcdHNob3dIZWFkZXI6IGZhbHNlLFxuXHRcdFx0XHRwbGFjZW1lbnQ6IFwiVG9wXCJcblx0XHRcdH0pO1xuXHRcdFx0Y29uZmlybWF0aW9uUG9wb3Zlci5hZGRTdHlsZUNsYXNzKFwic2FwVWlDb250ZW50UGFkZGluZ1wiKTtcblxuXHRcdFx0Ly8gQ3JlYXRlIHRoZSBjb250ZW50IG9mIHRoZSBwb3BvdmVyXG5cdFx0XHRjb25zdCB0aXRsZSA9IG5ldyBUZXh0KHtcblx0XHRcdFx0dGV4dDogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9EUkFGVF9ESVNDQVJEX01FU1NBR0VcIiwgcmVzb3VyY2VCdW5kbGUpXG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGNvbmZpcm1CdXR0b24gPSBuZXcgQnV0dG9uKHtcblx0XHRcdFx0dGV4dDogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9EUkFGVF9ESVNDQVJEX0JVVFRPTlwiLCByZXNvdXJjZUJ1bmRsZSksXG5cdFx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRcdFx0cHJlc3M6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLmhhbmRsZVZhbGlkYXRpb25FcnJvcigpO1xuXHRcdFx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIuZGF0YShcImNvbnRpbnVlRGlzY2FyZFwiLCB0cnVlKTtcblx0XHRcdFx0XHRjb25maXJtYXRpb25Qb3BvdmVyLmNsb3NlKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFyaWFMYWJlbGxlZEJ5OiBbdGl0bGVdXG5cdFx0XHR9KTtcblx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIuYWRkQ29udGVudChuZXcgVkJveCh7IGl0ZW1zOiBbdGl0bGUsIGNvbmZpcm1CdXR0b25dIH0pKTtcblxuXHRcdFx0Ly8gQXR0YWNoIGhhbmRsZXJcblx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIuYXR0YWNoQmVmb3JlT3BlbigoKSA9PiB7XG5cdFx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIuc2V0SW5pdGlhbEZvY3VzKGNvbmZpcm1CdXR0b24pO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25maXJtYXRpb25Qb3BvdmVyLmF0dGFjaEFmdGVyQ2xvc2UoKCkgPT4ge1xuXHRcdFx0XHRjYW5jZWxCdXR0b24uc2V0RW5hYmxlZCh0cnVlKTtcblx0XHRcdFx0aWYgKGNvbmZpcm1hdGlvblBvcG92ZXIuZGF0YShcImNvbnRpbnVlRGlzY2FyZFwiKSkge1xuXHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZWplY3QoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIub3BlbkJ5KGNhbmNlbEJ1dHRvbiwgZmFsc2UpO1xuXHRcdH0pO1xuXHR9XG5cblx0X29uRmllbGRDaGFuZ2Uob0V2ZW50OiBhbnksIG9DcmVhdGVCdXR0b246IGFueSwgbWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLCBmblZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzOiBGdW5jdGlvbikge1xuXHRcdG1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdGNvbnN0IG9GaWVsZCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBvRmllbGRQcm9taXNlID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInByb21pc2VcIik7XG5cdFx0aWYgKG9GaWVsZFByb21pc2UpIHtcblx0XHRcdHJldHVybiBvRmllbGRQcm9taXNlXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uICh2YWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0Ly8gU2V0dGluZyB2YWx1ZSBvZiBmaWVsZCBhcyAnJyBpbiBjYXNlIG9mIHZhbHVlIGhlbHAgYW5kIHZhbGlkYXRpbmcgb3RoZXIgZmllbGRzXG5cdFx0XHRcdFx0b0ZpZWxkLnNldFZhbHVlKHZhbHVlKTtcblx0XHRcdFx0XHRmblZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzKCk7XG5cblx0XHRcdFx0XHRyZXR1cm4gb0ZpZWxkLmdldFZhbHVlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAodmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdGlmICh2YWx1ZSAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0Ly9kaXNhYmxpbmcgdGhlIGNvbnRpbnVlIGJ1dHRvbiBpbiBjYXNlIG9mIGludmFsaWQgdmFsdWUgaW4gZmllbGRcblx0XHRcdFx0XHRcdG9DcmVhdGVCdXR0b24uc2V0RW5hYmxlZChmYWxzZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIHZhbGlkYXRpbmcgYWxsIHRoZSBmaWVsZHMgaW4gY2FzZSBvZiBlbXB0eSB2YWx1ZSBpbiBmaWVsZFxuXHRcdFx0XHRcdFx0b0ZpZWxkLnNldFZhbHVlKHZhbHVlKTtcblx0XHRcdFx0XHRcdGZuVmFsaWRhdGVSZXF1aXJlZFByb3BlcnRpZXMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdF9sYXVuY2hEaWFsb2dXaXRoS2V5RmllbGRzKFxuXHRcdG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRtRmllbGRzOiBhbnksXG5cdFx0b01vZGVsOiBPRGF0YU1vZGVsLFxuXHRcdG1QYXJhbWV0ZXJzOiBhbnksXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyXG5cdCkge1xuXHRcdGxldCBvRGlhbG9nOiBEaWFsb2c7XG5cdFx0Y29uc3Qgb1BhcmVudENvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sO1xuXG5cdFx0Ly8gQ3JhdGUgYSBmYWtlICh0cmFuc2llbnQpIGxpc3RCaW5kaW5nIGFuZCBjb250ZXh0LCBqdXN0IGZvciB0aGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBkaWFsb2dcblx0XHRjb25zdCBvVHJhbnNpZW50TGlzdEJpbmRpbmcgPSBvTW9kZWwuYmluZExpc3Qob0xpc3RCaW5kaW5nLmdldFBhdGgoKSwgb0xpc3RCaW5kaW5nLmdldENvbnRleHQoKSwgW10sIFtdLCB7XG5cdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwic3VibWl0TGF0ZXJcIlxuXHRcdH0pIGFzIE9EYXRhTGlzdEJpbmRpbmc7XG5cdFx0b1RyYW5zaWVudExpc3RCaW5kaW5nLnJlZnJlc2hJbnRlcm5hbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdC8qICovXG5cdFx0fTtcblx0XHRjb25zdCBvVHJhbnNpZW50Q29udGV4dCA9IG9UcmFuc2llbnRMaXN0QmluZGluZy5jcmVhdGUobVBhcmFtZXRlcnMuZGF0YSwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Y29uc3Qgc0ZyYWdtZW50TmFtZSA9IFwic2FwL2ZlL2NvcmUvY29udHJvbHMvTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzRGlhbG9nXCI7XG5cdFx0XHRjb25zdCBvRnJhZ21lbnQgPSBYTUxUZW1wbGF0ZVByb2Nlc3Nvci5sb2FkVGVtcGxhdGUoc0ZyYWdtZW50TmFtZSwgXCJmcmFnbWVudFwiKSxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlID0gb1BhcmVudENvbnRyb2wuZ2V0Q29udHJvbGxlcigpLm9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0YUltbXV0YWJsZUZpZWxkczogYW55W10gPSBbXSxcblx0XHRcdFx0c1BhdGggPSAob0xpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKSA/IG9MaXN0QmluZGluZy5nZXRSZXNvbHZlZFBhdGgoKSA6IG9MaXN0QmluZGluZy5nZXRQYXRoKCkpIGFzIHN0cmluZyxcblx0XHRcdFx0b0VudGl0eVNldENvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNQYXRoKSBhcyBDb250ZXh0LFxuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0XHRcdGZvciAoY29uc3QgaSBpbiBtRmllbGRzKSB7XG5cdFx0XHRcdGFJbW11dGFibGVGaWVsZHMucHVzaChvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NNZXRhUGF0aH0vJHttRmllbGRzW2ldfWApKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IG9JbW11dGFibGVDdHhNb2RlbCA9IG5ldyBKU09OTW9kZWwoYUltbXV0YWJsZUZpZWxkcyk7XG5cdFx0XHRjb25zdCBvSW1tdXRhYmxlQ3R4ID0gb0ltbXV0YWJsZUN0eE1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSBhcyBDb250ZXh0O1xuXHRcdFx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllcyA9IENvbW1vblV0aWxzLmdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMoc01ldGFQYXRoLCBvTWV0YU1vZGVsKTtcblx0XHRcdGNvbnN0IG9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHhNb2RlbCA9IG5ldyBKU09OTW9kZWwoYVJlcXVpcmVkUHJvcGVydGllcyk7XG5cdFx0XHRjb25zdCBvUmVxdWlyZWRQcm9wZXJ0eVBhdGhzQ3R4ID0gb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eE1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSBhcyBDb250ZXh0O1xuXHRcdFx0Y29uc3Qgb05ld0ZyYWdtZW50ID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdG9GcmFnbWVudCxcblx0XHRcdFx0eyBuYW1lOiBzRnJhZ21lbnROYW1lIH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdGVudGl0eVNldDogb0VudGl0eVNldENvbnRleHQsXG5cdFx0XHRcdFx0XHRmaWVsZHM6IG9JbW11dGFibGVDdHgsXG5cdFx0XHRcdFx0XHRyZXF1aXJlZFByb3BlcnRpZXM6IG9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHhcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBvRW50aXR5U2V0Q29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcdFx0ZmllbGRzOiBvSW1tdXRhYmxlQ3R4LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRyZXF1aXJlZFByb3BlcnRpZXM6IG9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHhNb2RlbFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KTtcblxuXHRcdFx0bGV0IGFGb3JtRWxlbWVudHM6IGFueVtdID0gW107XG5cdFx0XHRjb25zdCBtRmllbGRWYWx1ZU1hcDogYW55ID0ge307XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWNvbnN0XG5cdFx0XHRsZXQgb0NyZWF0ZUJ1dHRvbjogQnV0dG9uO1xuXG5cdFx0XHRjb25zdCB2YWxpZGF0ZVJlcXVpcmVkUHJvcGVydGllcyA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0bGV0IGJFbmFibGVkID0gZmFsc2U7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgYVJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChcblx0XHRcdFx0XHRcdGFGb3JtRWxlbWVudHNcblx0XHRcdFx0XHRcdFx0Lm1hcChmdW5jdGlvbiAob0Zvcm1FbGVtZW50OiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb0Zvcm1FbGVtZW50LmdldEZpZWxkcygpWzBdO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvRmllbGQ6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIFRoZSBjb250aW51ZSBidXR0b24gc2hvdWxkIHJlbWFpbiBkaXNhYmxlZCBpbiBjYXNlIG9mIGVtcHR5IHJlcXVpcmVkIGZpZWxkcy5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb0ZpZWxkLmdldFJlcXVpcmVkKCkgfHwgb0ZpZWxkLmdldFZhbHVlU3RhdGUoKSA9PT0gVmFsdWVTdGF0ZS5FcnJvcjtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0Lm1hcChhc3luYyBmdW5jdGlvbiAob0ZpZWxkOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzRmllbGRJZCA9IG9GaWVsZC5nZXRJZCgpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzRmllbGRJZCBpbiBtRmllbGRWYWx1ZU1hcCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgdlZhbHVlID0gYXdhaXQgbUZpZWxkVmFsdWVNYXBbc0ZpZWxkSWRdO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb0ZpZWxkLmdldFZhbHVlKCkgPT09IFwiXCIgPyB1bmRlZmluZWQgOiB2VmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9GaWVsZC5nZXRWYWx1ZSgpID09PSBcIlwiID8gdW5kZWZpbmVkIDogb0ZpZWxkLmdldFZhbHVlKCk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRiRW5hYmxlZCA9IGFSZXN1bHRzLmV2ZXJ5KGZ1bmN0aW9uICh2VmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodlZhbHVlKSkge1xuXHRcdFx0XHRcdFx0XHR2VmFsdWUgPSB2VmFsdWVbMF07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gdlZhbHVlICE9PSB1bmRlZmluZWQgJiYgdlZhbHVlICE9PSBudWxsICYmIHZWYWx1ZSAhPT0gXCJcIjtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0YkVuYWJsZWQgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvQ3JlYXRlQnV0dG9uLnNldEVuYWJsZWQoYkVuYWJsZWQpO1xuXHRcdFx0fTtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0ge1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0XHRcdFx0ZmlyZWQgb24gZm9jdXMgb3V0IGZyb20gZmllbGQgb3Igb24gc2VsZWN0aW5nIGEgdmFsdWUgZnJvbSB0aGUgdmFsdWVoZWxwLlxuXHRcdFx0XHRcdFx0XHRcdFx0dGhlIGNyZWF0ZSBidXR0b24gaXMgZW5hYmxlZCB3aGVuIGEgdmFsdWUgaXMgYWRkZWQuXG5cdFx0XHRcdFx0XHRcdFx0XHRsaXZlQ2hhbmdlIGlzIG5vdCBmaXJlZCB3aGVuIHZhbHVlIGlzIGFkZGVkIGZyb20gdmFsdWVoZWxwLlxuXHRcdFx0XHRcdFx0XHRcdFx0dmFsdWUgdmFsaWRhdGlvbiBpcyBub3QgZG9uZSBmb3IgY3JlYXRlIGJ1dHRvbiBlbmFibGVtZW50LlxuXHRcdFx0XHRcdFx0XHRcdCovXG5cdFx0XHRcdGhhbmRsZUNoYW5nZTogKG9FdmVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgc0ZpZWxkSWQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiaWRcIik7XG5cdFx0XHRcdFx0bUZpZWxkVmFsdWVNYXBbc0ZpZWxkSWRdID0gdGhpcy5fb25GaWVsZENoYW5nZShvRXZlbnQsIG9DcmVhdGVCdXR0b24sIG1lc3NhZ2VIYW5kbGVyLCB2YWxpZGF0ZVJlcXVpcmVkUHJvcGVydGllcyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdFx0XHRmaXJlZCBvbiBrZXkgcHJlc3MuIHRoZSBjcmVhdGUgYnV0dG9uIGlzIGVuYWJsZWQgd2hlbiBhIHZhbHVlIGlzIGFkZGVkLlxuXHRcdFx0XHRcdFx0XHRcdFx0bGl2ZUNoYW5nZSBpcyBub3QgZmlyZWQgd2hlbiB2YWx1ZSBpcyBhZGRlZCBmcm9tIHZhbHVlaGVscC5cblx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlIHZhbGlkYXRpb24gaXMgbm90IGRvbmUgZm9yIGNyZWF0ZSBidXR0b24gZW5hYmxlbWVudC5cblx0XHRcdFx0XHRcdFx0XHQqL1xuXHRcdFx0XHRoYW5kbGVMaXZlQ2hhbmdlOiAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBzRmllbGRJZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJpZFwiKTtcblx0XHRcdFx0XHRjb25zdCB2VmFsdWUgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmFsdWVcIik7XG5cdFx0XHRcdFx0bUZpZWxkVmFsdWVNYXBbc0ZpZWxkSWRdID0gdlZhbHVlO1xuXHRcdFx0XHRcdHZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IG9EaWFsb2dDb250ZW50OiBhbnkgPSBhd2FpdCBGcmFnbWVudC5sb2FkKHtcblx0XHRcdFx0ZGVmaW5pdGlvbjogb05ld0ZyYWdtZW50LFxuXHRcdFx0XHRjb250cm9sbGVyOiBvQ29udHJvbGxlclxuXHRcdFx0fSk7XG5cdFx0XHRsZXQgb1Jlc3VsdDogYW55O1xuXHRcdFx0Y29uc3QgY2xvc2VEaWFsb2cgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vcmVqZWN0ZWQvcmVzb2x2ZWQgdGhlIHByb21pcyByZXR1cm5lZCBieSBfbGF1bmNoRGlhbG9nV2l0aEtleUZpZWxkc1xuXHRcdFx0XHQvL2FzIHNvb24gYXMgdGhlIGRpYWxvZyBpcyBjbG9zZWQuIFdpdGhvdXQgd2FpdGluZyBmb3IgdGhlIGRpYWxvZydzXG5cdFx0XHRcdC8vYW5pbWF0aW9uIHRvIGZpbmlzaFxuXHRcdFx0XHRpZiAob1Jlc3VsdC5lcnJvcikge1xuXHRcdFx0XHRcdHJlamVjdChvUmVzdWx0LmVycm9yKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXNvbHZlKG9SZXN1bHQucmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdH07XG5cblx0XHRcdG9EaWFsb2cgPSBuZXcgRGlhbG9nKGdlbmVyYXRlKFtcIkNyZWF0ZURpYWxvZ1wiLCBzTWV0YVBhdGhdKSwge1xuXHRcdFx0XHR0aXRsZTogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9TQVBGRV9BQ1RJT05fQ1JFQVRFXCIsIG9SZXNvdXJjZUJ1bmRsZSksXG5cdFx0XHRcdGNvbnRlbnQ6IFtvRGlhbG9nQ29udGVudF0sXG5cdFx0XHRcdGJlZ2luQnV0dG9uOiB7XG5cdFx0XHRcdFx0dGV4dDogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9TQVBGRV9BQ1RJT05fQ1JFQVRFX0JVVFRPTlwiLCBvUmVzb3VyY2VCdW5kbGUpLFxuXHRcdFx0XHRcdHR5cGU6IFwiRW1waGFzaXplZFwiLFxuXHRcdFx0XHRcdHByZXNzOiBhc3luYyAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IGNyZWF0ZUJ1dHRvbiA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRcdFx0XHRcdGNyZWF0ZUJ1dHRvbi5zZXRFbmFibGVkKGZhbHNlKTtcblx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIubG9jayhvRGlhbG9nKTtcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmJJc0NyZWF0ZURpYWxvZyA9IHRydWU7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhVmFsdWVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRcdFx0XHRcdFx0T2JqZWN0LmtleXMobUZpZWxkVmFsdWVNYXApLm1hcChhc3luYyBmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBvVmFsdWUgPSBhd2FpdCBtRmllbGRWYWx1ZU1hcFtzS2V5XTtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9EaWFsb2dWYWx1ZTogYW55ID0ge307XG5cdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nVmFsdWVbc0tleV0gPSBvVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb0RpYWxvZ1ZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRvRVM2UHJvbWlzZShcblx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9MaXN0QmluZGluZyAmJiBvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjcmVhdGVQYXJhbWV0ZXJzOiBhVmFsdWVzXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y29uc3QgdHJhbnNpZW50RGF0YSA9IG9UcmFuc2llbnRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjcmVhdGVEYXRhOiBhbnkgPSB7fTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmtleXModHJhbnNpZW50RGF0YSkuZm9yRWFjaChmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1Byb3BlcnR5ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS8ke3NQcm9wZXJ0eVBhdGh9YCk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gZW5zdXJlIG5hdmlnYXRpb24gcHJvcGVydGllcyBhcmUgbm90IHBhcnQgb2YgdGhlIHBheWxvYWQsIGRlZXAgY3JlYXRlIG5vdCBzdXBwb3J0ZWRcblx0XHRcdFx0XHRcdFx0XHRpZiAob1Byb3BlcnR5ICYmIG9Qcm9wZXJ0eS4ka2luZCA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRjcmVhdGVEYXRhW3NQcm9wZXJ0eVBhdGhdID0gdHJhbnNpZW50RGF0YVtzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9OZXdEb2N1bWVudENvbnRleHQgPSBvTGlzdEJpbmRpbmcuY3JlYXRlKFxuXHRcdFx0XHRcdFx0XHRcdGNyZWF0ZURhdGEsXG5cdFx0XHRcdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGVBdEVuZCxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbmFjdGl2ZVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9Qcm9taXNlID0gdGhpcy5vbkFmdGVyQ3JlYXRlQ29tcGxldGlvbihvTGlzdEJpbmRpbmcsIG9OZXdEb2N1bWVudENvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRcdFx0bGV0IG9SZXNwb25zZTogYW55ID0gYXdhaXQgb1Byb21pc2U7XG5cdFx0XHRcdFx0XHRcdGlmICghb1Jlc3BvbnNlIHx8IChvUmVzcG9uc2UgJiYgb1Jlc3BvbnNlLmJLZWVwRGlhbG9nT3BlbiAhPT0gdHJ1ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRvUmVzcG9uc2UgPSBvUmVzcG9uc2UgPz8ge307XG5cdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5zZXRCaW5kaW5nQ29udGV4dChudWxsIGFzIGFueSk7XG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3BvbnNlLm5ld0NvbnRleHQgPSBvTmV3RG9jdW1lbnRDb250ZXh0O1xuXHRcdFx0XHRcdFx0XHRcdG9SZXN1bHQgPSB7IHJlc3BvbnNlOiBvUmVzcG9uc2UgfTtcblx0XHRcdFx0XHRcdFx0XHRjbG9zZURpYWxvZygpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHQvLyBpbiBjYXNlIG9mIGNyZWF0aW9uIGZhaWxlZCwgZGlhbG9nIHNob3VsZCBzdGF5IG9wZW4gLSB0byBhY2hpZXZlIHRoZSBzYW1lLCBub3RoaW5nIGhhcyB0byBiZSBkb25lIChsaWtlIGluIGNhc2Ugb2Ygc3VjY2VzcyB3aXRoIGJLZWVwRGlhbG9nT3Blbilcblx0XHRcdFx0XHRcdFx0aWYgKG9FcnJvciAhPT0gRkVMaWJyYXJ5LkNvbnN0YW50cy5DcmVhdGlvbkZhaWxlZCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIG90aGVyIGVycm9ycyBhcmUgbm90IGV4cGVjdGVkXG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3VsdCA9IHsgZXJyb3I6IG9FcnJvciB9O1xuXHRcdFx0XHRcdFx0XHRcdGNsb3NlRGlhbG9nKCk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Y3JlYXRlQnV0dG9uLnNldEVuYWJsZWQodHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9EaWFsb2cpO1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVuZEJ1dHRvbjoge1xuXHRcdFx0XHRcdHRleHQ6IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19DT01NT05fQUNUSU9OX1BBUkFNRVRFUl9ESUFMT0dfQ0FOQ0VMXCIsIG9SZXNvdXJjZUJ1bmRsZSksXG5cdFx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9SZXN1bHQgPSB7IGVycm9yOiBGRUxpYnJhcnkuQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZyB9O1xuXHRcdFx0XHRcdFx0Y2xvc2VEaWFsb2coKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFmdGVyQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyBzaG93IGZvb3RlciBhcyBwZXIgVVggZ3VpZGVsaW5lcyB3aGVuIGRpYWxvZyBpcyBub3Qgb3BlblxuXHRcdFx0XHRcdChvRGlhbG9nLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpPy5zZXRQcm9wZXJ0eShcImlzQ3JlYXRlRGlhbG9nT3BlblwiLCBmYWxzZSk7XG5cdFx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0b1RyYW5zaWVudExpc3RCaW5kaW5nLmRlc3Ryb3koKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBhcyBhbnkpO1xuXHRcdFx0YUZvcm1FbGVtZW50cyA9IG9EaWFsb2dDb250ZW50Py5nZXRBZ2dyZWdhdGlvbihcImZvcm1cIikuZ2V0QWdncmVnYXRpb24oXCJmb3JtQ29udGFpbmVyc1wiKVswXS5nZXRBZ2dyZWdhdGlvbihcImZvcm1FbGVtZW50c1wiKTtcblx0XHRcdGlmIChvUGFyZW50Q29udHJvbCAmJiBvUGFyZW50Q29udHJvbC5hZGREZXBlbmRlbnQpIHtcblx0XHRcdFx0Ly8gaWYgdGhlcmUgaXMgYSBwYXJlbnQgY29udHJvbCBzcGVjaWZpZWQgYWRkIHRoZSBkaWFsb2cgYXMgZGVwZW5kZW50XG5cdFx0XHRcdG9QYXJlbnRDb250cm9sLmFkZERlcGVuZGVudChvRGlhbG9nKTtcblx0XHRcdH1cblx0XHRcdG9DcmVhdGVCdXR0b24gPSBvRGlhbG9nLmdldEJlZ2luQnV0dG9uKCk7XG5cdFx0XHRvRGlhbG9nLnNldEJpbmRpbmdDb250ZXh0KG9UcmFuc2llbnRDb250ZXh0KTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IENvbW1vblV0aWxzLnNldFVzZXJEZWZhdWx0cyhcblx0XHRcdFx0XHRhcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0YUltbXV0YWJsZUZpZWxkcyxcblx0XHRcdFx0XHRvVHJhbnNpZW50Q29udGV4dCxcblx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGVBY3Rpb24sXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGF0YVxuXHRcdFx0XHQpO1xuXHRcdFx0XHR2YWxpZGF0ZVJlcXVpcmVkUHJvcGVydGllcygpO1xuXHRcdFx0XHQvLyBmb290ZXIgbXVzdCBub3QgYmUgdmlzaWJsZSB3aGVuIHRoZSBkaWFsb2cgaXMgb3BlbiBhcyBwZXIgVVggZ3VpZGVsaW5lc1xuXHRcdFx0XHQob0RpYWxvZy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KS5zZXRQcm9wZXJ0eShcImlzQ3JlYXRlRGlhbG9nT3BlblwiLCB0cnVlKTtcblx0XHRcdFx0b0RpYWxvZy5vcGVuKCk7XG5cdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoKTtcblx0XHRcdFx0dGhyb3cgb0Vycm9yO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdG9uQWZ0ZXJDcmVhdGVDb21wbGV0aW9uKG9MaXN0QmluZGluZzogYW55LCBvTmV3RG9jdW1lbnRDb250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRsZXQgZm5SZXNvbHZlOiBGdW5jdGlvbjtcblx0XHRjb25zdCBvUHJvbWlzZSA9IG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRmblJlc29sdmUgPSByZXNvbHZlO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgZm5DcmVhdGVDb21wbGV0ZWQgPSAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IG9Db250ZXh0ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImNvbnRleHRcIiksXG5cdFx0XHRcdGJTdWNjZXNzID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInN1Y2Nlc3NcIik7XG5cdFx0XHRpZiAob0NvbnRleHQgPT09IG9OZXdEb2N1bWVudENvbnRleHQpIHtcblx0XHRcdFx0b0xpc3RCaW5kaW5nLmRldGFjaENyZWF0ZUNvbXBsZXRlZChmbkNyZWF0ZUNvbXBsZXRlZCwgdGhpcyk7XG5cdFx0XHRcdGZuUmVzb2x2ZShiU3VjY2Vzcyk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBmblNhZmVDb250ZXh0Q3JlYXRlZCA9ICgpID0+IHtcblx0XHRcdG9OZXdEb2N1bWVudENvbnRleHRcblx0XHRcdFx0LmNyZWF0ZWQoKVxuXHRcdFx0XHQudGhlbih1bmRlZmluZWQsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRMb2cudHJhY2UoXCJ0cmFuc2llbnQgY3JlYXRpb24gY29udGV4dCBkZWxldGVkXCIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGNvbnRleHRFcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLnRyYWNlKFwidHJhbnNpZW50IGNyZWF0aW9uIGNvbnRleHQgZGVsZXRpb24gZXJyb3JcIiwgY29udGV4dEVycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdG9MaXN0QmluZGluZy5hdHRhY2hDcmVhdGVDb21wbGV0ZWQoZm5DcmVhdGVDb21wbGV0ZWQsIHRoaXMpO1xuXG5cdFx0cmV0dXJuIG9Qcm9taXNlLnRoZW4oKGJTdWNjZXNzOiBib29sZWFuKSA9PiB7XG5cdFx0XHRpZiAoIWJTdWNjZXNzKSB7XG5cdFx0XHRcdGlmICghbVBhcmFtZXRlcnMua2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZCkge1xuXHRcdFx0XHRcdC8vIENhbmNlbCB0aGUgcGVuZGluZyBQT1NUIGFuZCBkZWxldGUgdGhlIGNvbnRleHQgaW4gdGhlIGxpc3RCaW5kaW5nXG5cdFx0XHRcdFx0Zm5TYWZlQ29udGV4dENyZWF0ZWQoKTsgLy8gVG8gYXZvaWQgYSAncmVxdWVzdCBjYW5jZWxsZWQnIGVycm9yIGluIHRoZSBjb25zb2xlXG5cdFx0XHRcdFx0b0xpc3RCaW5kaW5nLnJlc2V0Q2hhbmdlcygpO1xuXHRcdFx0XHRcdG9MaXN0QmluZGluZy5nZXRNb2RlbCgpLnJlc2V0Q2hhbmdlcyhvTGlzdEJpbmRpbmcuZ2V0VXBkYXRlR3JvdXBJZCgpKTtcblxuXHRcdFx0XHRcdHRocm93IEZFTGlicmFyeS5Db25zdGFudHMuQ3JlYXRpb25GYWlsZWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHsgYktlZXBEaWFsb2dPcGVuOiB0cnVlIH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gb05ld0RvY3VtZW50Q29udGV4dC5jcmVhdGVkKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgbmFtZSBvZiB0aGUgTmV3QWN0aW9uIHRvIGJlIGV4ZWN1dGVkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHN0YXRpY1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlci5fZ2V0TmV3QWN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFN0YXJ0dXAgcGFyYW1ldGVycyBvZiB0aGUgYXBwbGljYXRpb25cblx0ICogQHBhcmFtIHNDcmVhdGVIYXNoIEhhc2ggdG8gYmUgY2hlY2tlZCBmb3IgYWN0aW9uIHR5cGVcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE1ldGFNb2RlbCB1c2VkIHRvIGNoZWNrIGZvciBOZXdBY3Rpb24gcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGggVGhlIE1ldGFQYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0X2dldE5ld0FjdGlvbihvU3RhcnR1cFBhcmFtZXRlcnM6IGFueSwgc0NyZWF0ZUhhc2g6IHN0cmluZywgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHNNZXRhUGF0aDogc3RyaW5nKSB7XG5cdFx0bGV0IHNOZXdBY3Rpb247XG5cblx0XHRpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzICYmIG9TdGFydHVwUGFyYW1ldGVycy5wcmVmZXJyZWRNb2RlICYmIHNDcmVhdGVIYXNoLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihcIkktQUNUSU9OPUNSRUFURVdJVEhcIikgPiAtMSkge1xuXHRcdFx0Y29uc3Qgc1ByZWZlcnJlZE1vZGUgPSBvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXTtcblx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRzUHJlZmVycmVkTW9kZS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJDUkVBVEVXSVRIOlwiKSA+IC0xXG5cdFx0XHRcdFx0PyBzUHJlZmVycmVkTW9kZS5zdWJzdHIoc1ByZWZlcnJlZE1vZGUubGFzdEluZGV4T2YoXCI6XCIpICsgMSlcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzICYmXG5cdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZSAmJlxuXHRcdFx0c0NyZWF0ZUhhc2gudG9VcHBlckNhc2UoKS5pbmRleE9mKFwiSS1BQ1RJT049QVVUT0NSRUFURVdJVEhcIikgPiAtMVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgc1ByZWZlcnJlZE1vZGUgPSBvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXTtcblx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRzUHJlZmVycmVkTW9kZS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJBVVRPQ1JFQVRFV0lUSDpcIikgPiAtMVxuXHRcdFx0XHRcdD8gc1ByZWZlcnJlZE1vZGUuc3Vic3RyKHNQcmVmZXJyZWRNb2RlLmxhc3RJbmRleE9mKFwiOlwiKSArIDEpXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0ICE9PSB1bmRlZmluZWRcblx0XHRcdFx0XHQ/IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkL05ld0FjdGlvbmApIHx8XG5cdFx0XHRcdFx0ICBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvTmV3QWN0aW9uYClcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIHNOZXdBY3Rpb247XG5cdH1cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgbGFiZWwgZm9yIHRoZSB0aXRsZSBvZiBhIHNwZWNpZmljIGNyZWF0ZSBhY3Rpb24gZGlhbG9nLCBlLmcuIENyZWF0ZSBTYWxlcyBPcmRlciBmcm9tIFF1b3RhdGlvbi5cblx0ICpcblx0ICogVGhlIGZvbGxvd2luZyBwcmlvcml0eSBpcyBhcHBsaWVkOlxuXHQgKiAxLiBsYWJlbCBvZiBsaW5lLWl0ZW0gYW5ub3RhdGlvbi5cblx0ICogMi4gbGFiZWwgYW5ub3RhdGVkIGluIHRoZSBhY3Rpb24uXG5cdCAqIDMuIFwiQ3JlYXRlXCIgYXMgYSBjb25zdGFudCBmcm9tIGkxOG4uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAc3RhdGljXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyLl9nZXRTcGVjaWZpY0NyZWF0ZUFjdGlvbkRpYWxvZ0xhYmVsXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgTWV0YU1vZGVsIHVzZWQgdG8gY2hlY2sgZm9yIHRoZSBOZXdBY3Rpb24gcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGggVGhlIE1ldGFQYXRoXG5cdCAqIEBwYXJhbSBzTmV3QWN0aW9uIENvbnRhaW5zIHRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgZXhlY3V0ZWRcblx0ICogQHBhcmFtIG9SZXNvdXJjZUJ1bmRsZUNvcmUgUmVzb3VyY2VCdW5kbGUgdG8gYWNjZXNzIHRoZSBkZWZhdWx0IENyZWF0ZSBsYWJlbFxuXHQgKiBAcmV0dXJucyBUaGUgbGFiZWwgZm9yIHRoZSBDcmVhdGUgQWN0aW9uIERpYWxvZ1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRfZ2V0U3BlY2lmaWNDcmVhdGVBY3Rpb25EaWFsb2dMYWJlbChcblx0XHRvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0XHRzTWV0YVBhdGg6IHN0cmluZyxcblx0XHRzTmV3QWN0aW9uOiBzdHJpbmcsXG5cdFx0b1Jlc291cmNlQnVuZGxlQ29yZTogUmVzb3VyY2VCdW5kbGVcblx0KSB7XG5cdFx0Y29uc3QgZm5HZXRMYWJlbEZyb21MaW5lSXRlbUFubm90YXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAob01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbWApKSB7XG5cdFx0XHRcdGNvbnN0IGlMaW5lSXRlbUluZGV4ID0gb01ldGFNb2RlbFxuXHRcdFx0XHRcdC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTGluZUl0ZW1gKVxuXHRcdFx0XHRcdC5maW5kSW5kZXgoZnVuY3Rpb24gKG9MaW5lSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhTGluZUl0ZW1BY3Rpb24gPSBvTGluZUl0ZW0uQWN0aW9uID8gb0xpbmVJdGVtLkFjdGlvbi5zcGxpdChcIihcIikgOiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYUxpbmVJdGVtQWN0aW9uID8gYUxpbmVJdGVtQWN0aW9uWzBdID09PSBzTmV3QWN0aW9uIDogZmFsc2U7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBpTGluZUl0ZW1JbmRleCA+IC0xXG5cdFx0XHRcdFx0PyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbWApW2lMaW5lSXRlbUluZGV4XS5MYWJlbFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdGZuR2V0TGFiZWxGcm9tTGluZUl0ZW1Bbm5vdGF0aW9uKCkgfHxcblx0XHRcdChvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vJHtzTmV3QWN0aW9ufUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxgKSkgfHxcblx0XHRcdChvUmVzb3VyY2VCdW5kbGVDb3JlICYmIG9SZXNvdXJjZUJ1bmRsZUNvcmUuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX1NBUEZFX0FDVElPTl9DUkVBVEVcIikpXG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBzaW5nbGV0b24gPSBuZXcgVHJh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