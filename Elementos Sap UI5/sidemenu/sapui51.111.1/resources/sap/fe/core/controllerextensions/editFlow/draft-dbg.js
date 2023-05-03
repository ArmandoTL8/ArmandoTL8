/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/m/Text", "sap/ui/core/Core", "../../operationsHelper", "./draftDataLossPopup"], function (Log, CommonUtils, messageHandling, Button, Dialog, MessageBox, Text, Core, operationsHelper, draftDataLossPopup) {
  "use strict";

  /**
   * Interface for callbacks used in the functions
   *
   *
   * @author SAP SE
   * @since 1.54.0
   * @interface
   * @name sap.fe.core.actions.draft.ICallback
   * @private
   */

  /**
   * Callback to approve or reject the creation of a draft
   *
   * @name sap.fe.core.actions.draft.ICallback.beforeCreateDraftFromActiveDocument
   * @function
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
   * @returns {(boolean|Promise)} Approval of draft creation [true|false] or Promise that resolves with the boolean value
   * @private
   */

  /**
   * Callback after a draft was successully created
   *
   * @name sap.fe.core.actions.draft.ICallback.afterCreateDraftFromActiveDocument
   * @function
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the new draft
   * @param {sap.ui.model.odata.v4.Context} oActiveDocumentContext Context of the active document for the new draft
   * @returns {sap.ui.model.odata.v4.Context} oActiveDocumentContext
   * @private
   */

  /**
   * Callback to approve or reject overwriting an unsaved draft of another user
   *
   * @name sap.fe.core.actions.draft.ICallback.whenDecisionToOverwriteDocumentIsRequired
   * @function
   * @public
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
   * @returns {(boolean|Promise)} Approval to overwrite unsaved draft [true|false] or Promise that resolves with the boolean value
   * @ui5-restricted
   */
  /* Constants for draft operations */
  const draftOperations = {
    EDIT: "EditAction",
    ACTIVATION: "ActivationAction",
    DISCARD: "DiscardAction",
    PREPARE: "PreparationAction"
  };

  /**
   * Static functions for the draft programming model
   *
   * @namespace
   * @alias sap.fe.core.actions.draft
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.54.0
   */

  /**
   * Determines the action name for a draft operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation name
   * @returns The name of the draft operation
   */
  function getActionName(oContext, sOperation) {
    const oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/${sOperation}`);
  }
  /**
   * Creates an operation context binding for the given context and operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation (action or function import)
   * @param oOptions Options to create the operation context
   * @returns The context binding of the bound operation
   */
  function createOperation(oContext, sOperation, oOptions) {
    const sOperationName = getActionName(oContext, sOperation);
    return oContext.getModel().bindContext(`${sOperationName}(...)`, oContext, oOptions);
  }
  /**
   * Determines the return type for a draft operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation name
   * @returns The return type of the draft operation
   */
  function getReturnType(oContext, sOperation) {
    const oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/${sOperation}/$ReturnType`);
  }
  /**
   * Check if optional draft prepare action exists.
   *
   * @param oContext The context that should be bound to the operation
   * @returns True if a a prepare action exists
   */
  function hasPrepareAction(oContext) {
    return !!getActionName(oContext, draftOperations.PREPARE);
  }
  /**
   * Creates a new draft from an active document.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param bPreserveChanges If true - existing changes from another user that are not locked are preserved and an error is sent from the backend, otherwise false - existing changes from another user that are not locked are overwritten</li>
   * @param oView If true - existing changes from another
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  async function executeDraftEditAction(oContext, bPreserveChanges, oView) {
    if (oContext.getProperty("IsActiveEntity")) {
      const oOptions = {
        $$inheritExpandSelect: true
      };
      const oOperation = createOperation(oContext, draftOperations.EDIT, oOptions);
      oOperation.setParameter("PreserveChanges", bPreserveChanges);
      const sGroupId = "direct";
      const oResourceBundle = await oView.getModel("sap.fe.i18n").getResourceBundle();
      const sActionName = CommonUtils.getTranslatedText("C_COMMON_OBJECT_PAGE_EDIT", oResourceBundle);
      //If the context is coming from a list binding we pass the flag true to replace the context by the active one
      const oEditPromise = oOperation.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
        label: sActionName,
        model: oContext.getModel()
      }, oResourceBundle, null, null, null, undefined, undefined), oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding"));
      oOperation.getModel().submitBatch(sGroupId);
      return await oEditPromise;
    } else {
      throw new Error("You cannot edit this draft document");
    }
  }

  /**
   * Executes the validation of the draft. The PrepareAction is triggered if the messages are annotated and entitySet gets a PreparationAction annotated.
   * If the operation succeeds and operation doesn't get a return type (RAP system) the messages are requested.
   *
   * @function
   * @param context Context for which the PrepareAction should be performed
   * @param appComponent The AppComponent
   * @param ignoreETag If set to true, ETags are ignored when executing the action
   * @returns Resolve function returns
   *  - the context of the operation if the action has been successfully executed
   *  - void if the action has failed
   *  - undefined if the action has not been triggered since the prerequisites are not met
   * @private
   * @ui5-restricted
   */
  async function executeDraftValidation(context, appComponent, ignoreETag) {
    if (draft.getMessagesPath(context) && draft.hasPrepareAction(context)) {
      try {
        const operation = await draft.executeDraftPreparationAction(context, context.getUpdateGroupId(), true, ignoreETag);
        // if there is no returned operation by executeDraftPreparationAction -> the action has failed
        if (operation && !getReturnType(context, draftOperations.PREPARE)) {
          requestMessages(context, appComponent.getSideEffectsService());
        }
        return operation;
      } catch (error) {
        Log.error("Error while requesting messages", error);
      }
    }
    return undefined;
  }

  /**
   * Activates a draft document. The draft will replace the sibling entity and will be deleted by the back end.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param oAppComponent The AppComponent
   * @param [sGroupId] The optional batch group in which the operation is to be executed
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  async function executeDraftActivationAction(oContext, oAppComponent, sGroupId) {
    const bHasPrepareAction = hasPrepareAction(oContext);

    // According to the draft spec if the service contains a prepare action and we trigger both prepare and
    // activate in one $batch the activate action is called with iF-Match=*
    const bIgnoreEtag = bHasPrepareAction;
    if (!oContext.getProperty("IsActiveEntity")) {
      const oOperation = createOperation(oContext, draftOperations.ACTIVATION, {
        $$inheritExpandSelect: true
      });
      const oResourceBundle = await oAppComponent.getModel("sap.fe.i18n").getResourceBundle();
      const sActionName = CommonUtils.getTranslatedText("C_OP_OBJECT_PAGE_SAVE", oResourceBundle);
      try {
        return await oOperation.execute(sGroupId, bIgnoreEtag, sGroupId ? operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
          label: sActionName,
          model: oContext.getModel()
        }, oResourceBundle, null, null, null, undefined, undefined) : undefined, oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding"));
      } catch (e) {
        if (bHasPrepareAction) {
          const actionName = getActionName(oContext, draftOperations.PREPARE),
            oSideEffectsService = oAppComponent.getSideEffectsService(),
            oBindingParameters = oSideEffectsService.getODataActionSideEffects(actionName, oContext),
            aTargetPaths = oBindingParameters && oBindingParameters.pathExpressions;
          if (aTargetPaths && aTargetPaths.length > 0) {
            try {
              await oSideEffectsService.requestSideEffects(aTargetPaths, oContext);
            } catch (oError) {
              Log.error("Error while requesting side effects", oError);
            }
          } else {
            try {
              await requestMessages(oContext, oSideEffectsService);
            } catch (oError) {
              Log.error("Error while requesting messages", oError);
            }
          }
        }
        throw e;
      }
    } else {
      throw new Error("The activation action cannot be executed on an active document");
    }
  }

  /**
   * Gets the supported message property path on the PrepareAction for a context.
   *
   * @function
   * @param oContext Context to be checked
   * @returns Path to the message
   * @private
   * @ui5-restricted
   */
  function getMessagePathForPrepare(oContext) {
    const oMetaModel = oContext.getModel().getMetaModel();
    const sContextPath = oMetaModel.getMetaPath(oContext.getPath());
    const oReturnType = getReturnType(oContext, draftOperations.PREPARE);
    // If there is no return parameter, it is not possible to request Messages.
    // RAP draft prepare has no return parameter
    return !!oReturnType ? oMetaModel.getObject(`${sContextPath}/@${"com.sap.vocabularies.Common.v1.Messages"}/$Path`) : null;
  }

  /**
   * Execute a preparation action.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param groupId The optional batch group in which we want to execute the operation
   * @param bMessages If set to true, the PREPARE action retrieves SAP_Messages
   * @param ignoreETag If set to true, ETag information is ignored when the action is executed
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  function executeDraftPreparationAction(oContext, groupId, bMessages, ignoreETag) {
    if (!oContext.getProperty("IsActiveEntity")) {
      const sMessagesPath = bMessages ? getMessagePathForPrepare(oContext) : null;
      const oOperation = createOperation(oContext, draftOperations.PREPARE, sMessagesPath ? {
        $select: sMessagesPath
      } : null);

      // TODO: side effects qualifier shall be even deprecated to be checked
      oOperation.setParameter("SideEffectsQualifier", "");
      const sGroupId = groupId || oOperation.getGroupId();
      return oOperation.execute(sGroupId, ignoreETag).then(function () {
        return oOperation;
      }).catch(function (oError) {
        Log.error("Error while executing the operation", oError);
      });
    } else {
      throw new Error("The preparation action cannot be executed on an active document");
    }
  }
  /**
   * Determines the message path for a context.
   *
   * @function
   * @param oContext Context for which the path shall be determined
   * @returns Message path, empty if not annotated
   * @private
   * @ui5-restricted
   */
  function getMessagesPath(oContext) {
    const oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
  }
  /**
   * Requests the messages if annotated for a given context.
   *
   * @function
   * @param oContext Context for which the messages shall be requested
   * @param oSideEffectsService Service for the SideEffects on SAP Fiori elements
   * @returns Promise which is resolved once messages were requested
   * @private
   * @ui5-restricted
   */
  function requestMessages(oContext, oSideEffectsService) {
    const sMessagesPath = draft.getMessagesPath(oContext);
    if (sMessagesPath) {
      return oSideEffectsService.requestSideEffects([{
        $PropertyPath: sMessagesPath
      }], oContext);
    }
    return Promise.resolve();
  }
  /**
   * Executes discard of a draft function using HTTP Post.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param oAppComponent App Component
   * @param bEnableStrictHandling
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  async function executeDraftDiscardAction(oContext, oAppComponent, bEnableStrictHandling) {
    if (!oContext.getProperty("IsActiveEntity")) {
      const oDiscardOperation = draft.createOperation(oContext, draftOperations.DISCARD);
      const oResourceBundle = oAppComponent && (await oAppComponent.getModel("sap.fe.i18n").getResourceBundle()) || null;
      const sGroupId = "direct";
      const sActionName = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON", oResourceBundle);
      // as the discard action doesnt' send the active version in the response we do not use the replace in cache
      const oDiscardPromise = !bEnableStrictHandling ? oDiscardOperation.execute(sGroupId) : oDiscardOperation.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
        label: sActionName,
        model: oContext.getModel()
      }, oResourceBundle, null, null, null, undefined, undefined), false);
      oContext.getModel().submitBatch(sGroupId);
      return oDiscardPromise;
    } else {
      throw new Error("The discard action cannot be executed on an active document");
    }
  }

  /**
   * This method creates a sibling context for a subobject page and calculates a sibling path for all intermediate paths
   * between the object page and the subobject page.
   *
   * @param rootCurrentContext The context for the root of the draft
   * @param rightmostCurrentContext The context of the subobject page
   * @returns The siblingInformation object
   */
  async function computeSiblingInformation(rootCurrentContext, rightmostCurrentContext) {
    if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
      // Wrong usage !!
      Log.error("Cannot compute rightmost sibling context");
      throw new Error("Cannot compute rightmost sibling context");
    }
    const model = rootCurrentContext.getModel();
    try {
      // //////////////////////////////////////////////////////////////////
      // 1. Find all segments between the root object and the sub-object
      // Example: for root = /Param(aa)/Entity(bb) and rightMost = /Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)
      // ---> ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]

      // Find all segments in the rightmost path
      const additionalPath = rightmostCurrentContext.getPath().replace(rootCurrentContext.getPath(), "");
      const segments = additionalPath ? additionalPath.substring(1).split("/") : [];
      // First segment is always the full path of the root object, which can contain '/' in case of a parametrized entity
      segments.unshift(rootCurrentContext.getPath().substring(1));

      // //////////////////////////////////////////////////////////////////
      // 2. Request canonical paths of the sibling entity for each segment
      // Example: for ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]
      // --> request canonical paths for "Param(aa)/Entity(bb)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)/SiblingEntity"
      const oldPaths = [];
      const newPaths = [];
      let currentPath = "";
      const canonicalPathPromises = segments.map(segment => {
        currentPath += `/${segment}`;
        oldPaths.unshift(currentPath);
        if (currentPath.endsWith(")")) {
          const siblingContext = model.bindContext(`${currentPath}/SiblingEntity`).getBoundContext();
          return siblingContext.requestCanonicalPath();
        } else {
          return Promise.resolve(undefined); // 1-1 relation
        }
      });

      // //////////////////////////////////////////////////////////////////
      // 3. Reconstruct the full paths from canonical paths (for path mapping)
      // Example: for canonical paths "/Param(aa)/Entity(bb-sibling)", "/Entity2(cc-sibling)", "/Entity3(dd-sibling)"
      // --> ["Param(aa)/Entity(bb-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)/_SubNav(dd-sibling)"]
      const canonicalPaths = await Promise.all(canonicalPathPromises);
      let siblingPath = "";
      canonicalPaths.forEach((canonicalPath, index) => {
        if (index !== 0) {
          if (segments[index].endsWith(")")) {
            const navigation = segments[index].replace(/\(.*$/, ""); // Keep only navigation name from the segment, i.e. aaa(xxx) --> aaa
            const keys = canonicalPath.replace(/.*\(/, "("); // Keep only the keys from the canonical path, i.e. aaa(xxx) --> (xxx)
            siblingPath += `/${navigation}${keys}`;
          } else {
            siblingPath += `/${segments[index]}`; // 1-1 relation
          }
        } else {
          siblingPath = canonicalPath; // To manage parametrized entities
        }

        newPaths.unshift(siblingPath);
      });
      return {
        targetContext: model.bindContext(siblingPath).getBoundContext(),
        // Create the rightmost sibling context from its path
        pathMapping: oldPaths.map((oldPath, index) => {
          return {
            oldPath,
            newPath: newPaths[index]
          };
        })
      };
    } catch (error) {
      // A canonical path couldn't be resolved (because a sibling doesn't exist)
      return undefined;
    }
  }

  /**
   * Creates a draft document from an existing document.
   *
   * The function supports several hooks as there is a certain coreography defined.
   *
   * @function
   * @name sap.fe.core.actions.draft#createDraftFromActiveDocument
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the active document for the new draft
   * @param oAppComponent The AppComponent
   * @param mParameters The parameters
   * @param [mParameters.oView] The view
   * @param [mParameters.bPreserveChanges] Preserve changes of an existing draft of another user
   * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
   * @private
   * @ui5-restricted
   */
  async function createDraftFromActiveDocument(oContext, oAppComponent, mParameters) {
    const mParam = mParameters || {},
      bRunPreserveChangesFlow = typeof mParam.bPreserveChanges === "undefined" || typeof mParam.bPreserveChanges === "boolean" && mParam.bPreserveChanges; //default true

    /**
     * Overwrite the existing change.
     *
     * @returns Resolves with result of {@link sap.fe.core.actions#executeDraftEditAction}
     */
    async function overwriteChange() {
      //Overwrite existing changes
      const oModel = oContext.getModel();
      const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();
      const oResourceBundle = await mParameters.oView.getModel("sap.fe.i18n").getResourceBundle();
      const draftAdminData = await draftDataContext.requestObject();
      if (draftAdminData) {
        // remove all unbound transition messages as we show a special dialog
        messageHandling.removeUnboundTransitionMessages();
        let sInfo = draftAdminData.InProcessByUserDescription || draftAdminData.InProcessByUser;
        const sEntitySet = mParameters.oView.getViewData().entitySet;
        if (sInfo) {
          const sLockedByUserMsg = CommonUtils.getTranslatedText("C_DRAFT_OBJECT_PAGE_DRAFT_LOCKED_BY_USER", oResourceBundle, sInfo, sEntitySet);
          MessageBox.error(sLockedByUserMsg);
          throw new Error(sLockedByUserMsg);
        } else {
          sInfo = draftAdminData.CreatedByUserDescription || draftAdminData.CreatedByUser;
          const sUnsavedChangesMsg = CommonUtils.getTranslatedText("C_DRAFT_OBJECT_PAGE_DRAFT_UNSAVED_CHANGES", oResourceBundle, sInfo, sEntitySet);
          await draft.showEditConfirmationMessageBox(sUnsavedChangesMsg, oContext);
          return draft.executeDraftEditAction(oContext, false, mParameters.oView);
        }
      }
      throw new Error(`Draft creation aborted for document: ${oContext.getPath()}`);
    }
    if (!oContext) {
      throw new Error("Binding context to active document is required");
    }
    try {
      let oDraftContext;
      try {
        oDraftContext = await draft.executeDraftEditAction(oContext, bRunPreserveChangesFlow, mParameters.oView);
      } catch (oResponse) {
        if (oResponse.status === 409 || oResponse.status === 412 || oResponse.status === 423) {
          messageHandling.removeBoundTransitionMessages();
          messageHandling.removeUnboundTransitionMessages();
          const siblingInfo = await draft.computeSiblingInformation(oContext, oContext);
          if (siblingInfo !== null && siblingInfo !== void 0 && siblingInfo.targetContext) {
            //there is a context authorized to be edited by the current user
            await CommonUtils.waitForContextRequested(siblingInfo.targetContext);
            return siblingInfo.targetContext;
          } else {
            //there is no draft owned by the current user
            oDraftContext = await overwriteChange();
          }
        } else if (!(oResponse && oResponse.canceled)) {
          throw new Error(oResponse);
        }
      }
      if (oDraftContext) {
        var _oSideEffects$trigger;
        const sEditActionName = draft.getActionName(oDraftContext, draftOperations.EDIT);
        const oSideEffects = oAppComponent.getSideEffectsService().getODataActionSideEffects(sEditActionName, oDraftContext);
        if (oSideEffects !== null && oSideEffects !== void 0 && (_oSideEffects$trigger = oSideEffects.triggerActions) !== null && _oSideEffects$trigger !== void 0 && _oSideEffects$trigger.length) {
          await oAppComponent.getSideEffectsService().requestSideEffectsForODataAction(oSideEffects, oDraftContext);
          return oDraftContext;
        } else {
          return oDraftContext;
        }
      } else {
        return undefined;
      }
    } catch (exc) {
      throw exc;
    }
  }
  /**
   * Creates an active document from a draft document.
   *
   * The function supports several hooks as there is a certain choreography defined.
   *
   * @function
   * @name sap.fe.core.actions.draft#activateDocument
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the active document for the new draft
   * @param oAppComponent The AppComponent
   * @param mParameters The parameters
   * @param [mParameters.fnBeforeActivateDocument] Callback that allows a veto before the 'Create' request is executed
   * @param [mParameters.fnAfterActivateDocument] Callback for postprocessing after document was activated.
   * @param messageHandler The message handler
   * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
   * @private
   * @ui5-restricted
   */
  async function activateDocument(oContext, oAppComponent, mParameters, messageHandler) {
    const mParam = mParameters || {};
    if (!oContext) {
      throw new Error("Binding context to draft document is required");
    }
    const bExecute = mParam.fnBeforeActivateDocument ? await mParam.fnBeforeActivateDocument(oContext) : true;
    if (!bExecute) {
      throw new Error(`Activation of the document was aborted by extension for document: ${oContext.getPath()}`);
    }
    let oActiveDocumentContext;
    if (!hasPrepareAction(oContext)) {
      oActiveDocumentContext = await executeDraftActivationAction(oContext, oAppComponent);
    } else {
      /* activation requires preparation */
      const sBatchGroup = "draft";
      // we use the same batchGroup to force prepare and activate in a same batch but with different changeset
      let oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, false);
      oContext.getModel().submitBatch(sBatchGroup);
      const oActivatePromise = draft.executeDraftActivationAction(oContext, oAppComponent, sBatchGroup);
      try {
        const values = await Promise.all([oPreparePromise, oActivatePromise]);
        oActiveDocumentContext = values[1];
      } catch (err) {
        // BCP 2270084075
        // if the Activation fails, then the messages are retrieved from PREPARATION action
        const sMessagesPath = getMessagePathForPrepare(oContext);
        if (sMessagesPath) {
          oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, true);
          oContext.getModel().submitBatch(sBatchGroup);
          await oPreparePromise;
          const data = await oContext.requestObject();
          if (data[sMessagesPath].length > 0) {
            //if messages are available from the PREPARATION action, then previous transition messages are removed
            messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeTransitionMessages(false, false, oContext.getPath());
          }
        }
        throw err;
      }
    }
    return mParam.fnAfterActivateDocument ? mParam.fnAfterActivateDocument(oContext, oActiveDocumentContext) : oActiveDocumentContext;
  }

  /**
   * Display the confirmation dialog box after pressing the edit button of an object page with unsaved changes.
   *
   *
   * @function
   * @name sap.fe.core.actions.draft#showEditConfirmationMessageBox
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param sUnsavedChangesMsg Dialog box message informing the user that if he starts editing, the previous unsaved changes will be lost
   * @param oContext Context of the active document for the new draft
   * @returns Promise resolves
   * @private
   * @ui5-restricted
   */
  function showEditConfirmationMessageBox(sUnsavedChangesMsg, oContext) {
    const localI18nRef = Core.getLibraryResourceBundle("sap.fe.core");
    return new Promise(function (resolve, reject) {
      const oDialog = new Dialog({
        title: localI18nRef.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNING"),
        state: "Warning",
        content: new Text({
          text: sUnsavedChangesMsg
        }),
        beginButton: new Button({
          text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_EDIT"),
          type: "Emphasized",
          press: function () {
            oDialog.close();
            resolve(true);
          }
        }),
        endButton: new Button({
          text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_CANCEL"),
          press: function () {
            oDialog.close();
            reject(`Draft creation aborted for document: ${oContext.getPath()}`);
          }
        }),
        afterClose: function () {
          oDialog.destroy();
        }
      });
      oDialog.addStyleClass("sapUiContentPadding");
      oDialog.open();
    });
  }

  /**
   * HTTP POST call when DraftAction is present for Draft Delete; HTTP DELETE call when there is no DraftAction
   * and Active Instance always uses DELETE.
   *
   * @function
   * @name sap.fe.core.actions.draft#deleteDraft
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the document to be discarded
   * @param oAppComponent Context of the document to be discarded
   * @param bEnableStrictHandling
   * @private
   * @returns A Promise resolved when the context is deleted
   * @ui5-restricted
   */
  function deleteDraft(oContext, oAppComponent, bEnableStrictHandling) {
    const sDiscardAction = getActionName(oContext, draftOperations.DISCARD),
      bIsActiveEntity = oContext.getObject().IsActiveEntity;
    if (bIsActiveEntity || !bIsActiveEntity && !sDiscardAction) {
      //Use Delete in case of active entity and no discard action available for draft
      if (oContext.hasPendingChanges()) {
        return oContext.getBinding().resetChanges().then(function () {
          return oContext.delete();
        }).catch(function (error) {
          return Promise.reject(error);
        });
      } else {
        return oContext.delete();
      }
    } else {
      //Use Discard Post Action if it is a draft entity and discard action exists
      return executeDraftDiscardAction(oContext, oAppComponent, bEnableStrictHandling);
    }
  }
  const draft = {
    createDraftFromActiveDocument: createDraftFromActiveDocument,
    activateDocument: activateDocument,
    deleteDraft: deleteDraft,
    executeDraftEditAction: executeDraftEditAction,
    executeDraftValidation: executeDraftValidation,
    executeDraftPreparationAction: executeDraftPreparationAction,
    executeDraftActivationAction: executeDraftActivationAction,
    hasPrepareAction: hasPrepareAction,
    getMessagesPath: getMessagesPath,
    computeSiblingInformation: computeSiblingInformation,
    processDataLossOrDraftDiscardConfirmation: draftDataLossPopup.processDataLossOrDraftDiscardConfirmation,
    silentlyKeepDraftOnForwardNavigation: draftDataLossPopup.silentlyKeepDraftOnForwardNavigation,
    createOperation: createOperation,
    executeDraftDiscardAction: executeDraftDiscardAction,
    NavigationType: draftDataLossPopup.NavigationType,
    getActionName: getActionName,
    showEditConfirmationMessageBox: showEditConfirmationMessageBox
  };
  return draft;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkcmFmdE9wZXJhdGlvbnMiLCJFRElUIiwiQUNUSVZBVElPTiIsIkRJU0NBUkQiLCJQUkVQQVJFIiwiZ2V0QWN0aW9uTmFtZSIsIm9Db250ZXh0Iiwic09wZXJhdGlvbiIsIm9Nb2RlbCIsImdldE1vZGVsIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInNFbnRpdHlTZXRQYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwiZ2V0T2JqZWN0IiwiY3JlYXRlT3BlcmF0aW9uIiwib09wdGlvbnMiLCJzT3BlcmF0aW9uTmFtZSIsImJpbmRDb250ZXh0IiwiZ2V0UmV0dXJuVHlwZSIsImhhc1ByZXBhcmVBY3Rpb24iLCJleGVjdXRlRHJhZnRFZGl0QWN0aW9uIiwiYlByZXNlcnZlQ2hhbmdlcyIsIm9WaWV3IiwiZ2V0UHJvcGVydHkiLCIkJGluaGVyaXRFeHBhbmRTZWxlY3QiLCJvT3BlcmF0aW9uIiwic2V0UGFyYW1ldGVyIiwic0dyb3VwSWQiLCJvUmVzb3VyY2VCdW5kbGUiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsInNBY3Rpb25OYW1lIiwiQ29tbW9uVXRpbHMiLCJnZXRUcmFuc2xhdGVkVGV4dCIsIm9FZGl0UHJvbWlzZSIsImV4ZWN1dGUiLCJ1bmRlZmluZWQiLCJvcGVyYXRpb25zSGVscGVyIiwiZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkIiwiYmluZCIsImRyYWZ0IiwibGFiZWwiLCJtb2RlbCIsImdldEJpbmRpbmciLCJpc0EiLCJzdWJtaXRCYXRjaCIsIkVycm9yIiwiZXhlY3V0ZURyYWZ0VmFsaWRhdGlvbiIsImNvbnRleHQiLCJhcHBDb21wb25lbnQiLCJpZ25vcmVFVGFnIiwiZ2V0TWVzc2FnZXNQYXRoIiwib3BlcmF0aW9uIiwiZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24iLCJnZXRVcGRhdGVHcm91cElkIiwicmVxdWVzdE1lc3NhZ2VzIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZXJyb3IiLCJMb2ciLCJleGVjdXRlRHJhZnRBY3RpdmF0aW9uQWN0aW9uIiwib0FwcENvbXBvbmVudCIsImJIYXNQcmVwYXJlQWN0aW9uIiwiYklnbm9yZUV0YWciLCJlIiwiYWN0aW9uTmFtZSIsIm9TaWRlRWZmZWN0c1NlcnZpY2UiLCJvQmluZGluZ1BhcmFtZXRlcnMiLCJnZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzIiwiYVRhcmdldFBhdGhzIiwicGF0aEV4cHJlc3Npb25zIiwibGVuZ3RoIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwib0Vycm9yIiwiZ2V0TWVzc2FnZVBhdGhGb3JQcmVwYXJlIiwic0NvbnRleHRQYXRoIiwib1JldHVyblR5cGUiLCJncm91cElkIiwiYk1lc3NhZ2VzIiwic01lc3NhZ2VzUGF0aCIsIiRzZWxlY3QiLCJnZXRHcm91cElkIiwidGhlbiIsImNhdGNoIiwiJFByb3BlcnR5UGF0aCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZXhlY3V0ZURyYWZ0RGlzY2FyZEFjdGlvbiIsImJFbmFibGVTdHJpY3RIYW5kbGluZyIsIm9EaXNjYXJkT3BlcmF0aW9uIiwib0Rpc2NhcmRQcm9taXNlIiwiY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiIsInJvb3RDdXJyZW50Q29udGV4dCIsInJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0Iiwic3RhcnRzV2l0aCIsImFkZGl0aW9uYWxQYXRoIiwicmVwbGFjZSIsInNlZ21lbnRzIiwic3Vic3RyaW5nIiwic3BsaXQiLCJ1bnNoaWZ0Iiwib2xkUGF0aHMiLCJuZXdQYXRocyIsImN1cnJlbnRQYXRoIiwiY2Fub25pY2FsUGF0aFByb21pc2VzIiwibWFwIiwic2VnbWVudCIsImVuZHNXaXRoIiwic2libGluZ0NvbnRleHQiLCJnZXRCb3VuZENvbnRleHQiLCJyZXF1ZXN0Q2Fub25pY2FsUGF0aCIsImNhbm9uaWNhbFBhdGhzIiwiYWxsIiwic2libGluZ1BhdGgiLCJmb3JFYWNoIiwiY2Fub25pY2FsUGF0aCIsImluZGV4IiwibmF2aWdhdGlvbiIsImtleXMiLCJ0YXJnZXRDb250ZXh0IiwicGF0aE1hcHBpbmciLCJvbGRQYXRoIiwibmV3UGF0aCIsImNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50IiwibVBhcmFtZXRlcnMiLCJtUGFyYW0iLCJiUnVuUHJlc2VydmVDaGFuZ2VzRmxvdyIsIm92ZXJ3cml0ZUNoYW5nZSIsImRyYWZ0RGF0YUNvbnRleHQiLCJkcmFmdEFkbWluRGF0YSIsInJlcXVlc3RPYmplY3QiLCJtZXNzYWdlSGFuZGxpbmciLCJyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwic0luZm8iLCJJblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbiIsIkluUHJvY2Vzc0J5VXNlciIsInNFbnRpdHlTZXQiLCJnZXRWaWV3RGF0YSIsImVudGl0eVNldCIsInNMb2NrZWRCeVVzZXJNc2ciLCJNZXNzYWdlQm94IiwiQ3JlYXRlZEJ5VXNlckRlc2NyaXB0aW9uIiwiQ3JlYXRlZEJ5VXNlciIsInNVbnNhdmVkQ2hhbmdlc01zZyIsInNob3dFZGl0Q29uZmlybWF0aW9uTWVzc2FnZUJveCIsIm9EcmFmdENvbnRleHQiLCJvUmVzcG9uc2UiLCJzdGF0dXMiLCJyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyIsInNpYmxpbmdJbmZvIiwid2FpdEZvckNvbnRleHRSZXF1ZXN0ZWQiLCJjYW5jZWxlZCIsInNFZGl0QWN0aW9uTmFtZSIsIm9TaWRlRWZmZWN0cyIsInRyaWdnZXJBY3Rpb25zIiwicmVxdWVzdFNpZGVFZmZlY3RzRm9yT0RhdGFBY3Rpb24iLCJleGMiLCJhY3RpdmF0ZURvY3VtZW50IiwibWVzc2FnZUhhbmRsZXIiLCJiRXhlY3V0ZSIsImZuQmVmb3JlQWN0aXZhdGVEb2N1bWVudCIsIm9BY3RpdmVEb2N1bWVudENvbnRleHQiLCJzQmF0Y2hHcm91cCIsIm9QcmVwYXJlUHJvbWlzZSIsIm9BY3RpdmF0ZVByb21pc2UiLCJ2YWx1ZXMiLCJlcnIiLCJkYXRhIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwiZm5BZnRlckFjdGl2YXRlRG9jdW1lbnQiLCJsb2NhbEkxOG5SZWYiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwicmVqZWN0Iiwib0RpYWxvZyIsIkRpYWxvZyIsInRpdGxlIiwiZ2V0VGV4dCIsInN0YXRlIiwiY29udGVudCIsIlRleHQiLCJ0ZXh0IiwiYmVnaW5CdXR0b24iLCJCdXR0b24iLCJ0eXBlIiwicHJlc3MiLCJjbG9zZSIsImVuZEJ1dHRvbiIsImFmdGVyQ2xvc2UiLCJkZXN0cm95IiwiYWRkU3R5bGVDbGFzcyIsIm9wZW4iLCJkZWxldGVEcmFmdCIsInNEaXNjYXJkQWN0aW9uIiwiYklzQWN0aXZlRW50aXR5IiwiSXNBY3RpdmVFbnRpdHkiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsInJlc2V0Q2hhbmdlcyIsImRlbGV0ZSIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiZHJhZnREYXRhTG9zc1BvcHVwIiwic2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uIiwiTmF2aWdhdGlvblR5cGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbImRyYWZ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgdHlwZSB7IFNpZGVFZmZlY3RzU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhQ29udGV4dEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUNvbnRleHRCaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvcmVzb3VyY2UvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBWNENvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgb3BlcmF0aW9uc0hlbHBlciBmcm9tIFwiLi4vLi4vb3BlcmF0aW9uc0hlbHBlclwiO1xuaW1wb3J0IHR5cGUgTWVzc2FnZUhhbmRsZXIgZnJvbSBcIi4uL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgZHJhZnREYXRhTG9zc1BvcHVwIGZyb20gXCIuL2RyYWZ0RGF0YUxvc3NQb3B1cFwiO1xuXG5leHBvcnQgdHlwZSBTaWJsaW5nSW5mb3JtYXRpb24gPSB7XG5cdHRhcmdldENvbnRleHQ6IENvbnRleHQ7XG5cdHBhdGhNYXBwaW5nOiB7IG9sZFBhdGg6IHN0cmluZzsgbmV3UGF0aDogc3RyaW5nIH1bXTtcbn07XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciBjYWxsYmFja3MgdXNlZCBpbiB0aGUgZnVuY3Rpb25zXG4gKlxuICpcbiAqIEBhdXRob3IgU0FQIFNFXG4gKiBAc2luY2UgMS41NC4wXG4gKiBAaW50ZXJmYWNlXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0LklDYWxsYmFja1xuICogQHByaXZhdGVcbiAqL1xuXG4vKipcbiAqIENhbGxiYWNrIHRvIGFwcHJvdmUgb3IgcmVqZWN0IHRoZSBjcmVhdGlvbiBvZiBhIGRyYWZ0XG4gKlxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdC5JQ2FsbGJhY2suYmVmb3JlQ3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnRcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQGFic3RyYWN0XG4gKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBhY3RpdmUgZG9jdW1lbnQgZm9yIHRoZSBuZXcgZHJhZnRcbiAqIEByZXR1cm5zIHsoYm9vbGVhbnxQcm9taXNlKX0gQXBwcm92YWwgb2YgZHJhZnQgY3JlYXRpb24gW3RydWV8ZmFsc2VdIG9yIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBib29sZWFuIHZhbHVlXG4gKiBAcHJpdmF0ZVxuICovXG5cbi8qKlxuICogQ2FsbGJhY2sgYWZ0ZXIgYSBkcmFmdCB3YXMgc3VjY2Vzc3VsbHkgY3JlYXRlZFxuICpcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQuSUNhbGxiYWNrLmFmdGVyQ3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnRcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQGFic3RyYWN0XG4gKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBuZXcgZHJhZnRcbiAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9IG9BY3RpdmVEb2N1bWVudENvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcmV0dXJucyB7c2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9IG9BY3RpdmVEb2N1bWVudENvbnRleHRcbiAqIEBwcml2YXRlXG4gKi9cblxuLyoqXG4gKiBDYWxsYmFjayB0byBhcHByb3ZlIG9yIHJlamVjdCBvdmVyd3JpdGluZyBhbiB1bnNhdmVkIGRyYWZ0IG9mIGFub3RoZXIgdXNlclxuICpcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQuSUNhbGxiYWNrLndoZW5EZWNpc2lvblRvT3ZlcndyaXRlRG9jdW1lbnRJc1JlcXVpcmVkXG4gKiBAZnVuY3Rpb25cbiAqIEBwdWJsaWNcbiAqIEBzdGF0aWNcbiAqIEBhYnN0cmFjdFxuICogQHBhcmFtIHtzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcmV0dXJucyB7KGJvb2xlYW58UHJvbWlzZSl9IEFwcHJvdmFsIHRvIG92ZXJ3cml0ZSB1bnNhdmVkIGRyYWZ0IFt0cnVlfGZhbHNlXSBvciBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgYm9vbGVhbiB2YWx1ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbi8qIENvbnN0YW50cyBmb3IgZHJhZnQgb3BlcmF0aW9ucyAqL1xuY29uc3QgZHJhZnRPcGVyYXRpb25zID0ge1xuXHRFRElUOiBcIkVkaXRBY3Rpb25cIixcblx0QUNUSVZBVElPTjogXCJBY3RpdmF0aW9uQWN0aW9uXCIsXG5cdERJU0NBUkQ6IFwiRGlzY2FyZEFjdGlvblwiLFxuXHRQUkVQQVJFOiBcIlByZXBhcmF0aW9uQWN0aW9uXCJcbn07XG5cbi8qKlxuICogU3RhdGljIGZ1bmN0aW9ucyBmb3IgdGhlIGRyYWZ0IHByb2dyYW1taW5nIG1vZGVsXG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnRcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGV4cGVyaW1lbnRhbCB1c2UhIDxici8+PGI+VGhpcyBpcyBvbmx5IGEgUE9DIGFuZCBtYXliZSBkZWxldGVkPC9iPlxuICogQHNpbmNlIDEuNTQuMFxuICovXG5cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgYWN0aW9uIG5hbWUgZm9yIGEgZHJhZnQgb3BlcmF0aW9uLlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IHNob3VsZCBiZSBib3VuZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcGFyYW0gc09wZXJhdGlvbiBUaGUgb3BlcmF0aW9uIG5hbWVcbiAqIEByZXR1cm5zIFRoZSBuYW1lIG9mIHRoZSBkcmFmdCBvcGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0QWN0aW9uTmFtZShvQ29udGV4dDogQ29udGV4dCwgc09wZXJhdGlvbjogc3RyaW5nKSB7XG5cdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRzRW50aXR5U2V0UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblxuXHRyZXR1cm4gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvJHtzT3BlcmF0aW9ufWApO1xufVxuLyoqXG4gKiBDcmVhdGVzIGFuIG9wZXJhdGlvbiBjb250ZXh0IGJpbmRpbmcgZm9yIHRoZSBnaXZlbiBjb250ZXh0IGFuZCBvcGVyYXRpb24uXG4gKlxuICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgc2hvdWxkIGJlIGJvdW5kIHRvIHRoZSBvcGVyYXRpb25cbiAqIEBwYXJhbSBzT3BlcmF0aW9uIFRoZSBvcGVyYXRpb24gKGFjdGlvbiBvciBmdW5jdGlvbiBpbXBvcnQpXG4gKiBAcGFyYW0gb09wdGlvbnMgT3B0aW9ucyB0byBjcmVhdGUgdGhlIG9wZXJhdGlvbiBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY29udGV4dCBiaW5kaW5nIG9mIHRoZSBib3VuZCBvcGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gY3JlYXRlT3BlcmF0aW9uKG9Db250ZXh0OiBDb250ZXh0LCBzT3BlcmF0aW9uOiBzdHJpbmcsIG9PcHRpb25zPzogYW55KSB7XG5cdGNvbnN0IHNPcGVyYXRpb25OYW1lID0gZ2V0QWN0aW9uTmFtZShvQ29udGV4dCwgc09wZXJhdGlvbik7XG5cblx0cmV0dXJuIG9Db250ZXh0LmdldE1vZGVsKCkuYmluZENvbnRleHQoYCR7c09wZXJhdGlvbk5hbWV9KC4uLilgLCBvQ29udGV4dCwgb09wdGlvbnMpO1xufVxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSByZXR1cm4gdHlwZSBmb3IgYSBkcmFmdCBvcGVyYXRpb24uXG4gKlxuICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgc2hvdWxkIGJlIGJvdW5kIHRvIHRoZSBvcGVyYXRpb25cbiAqIEBwYXJhbSBzT3BlcmF0aW9uIFRoZSBvcGVyYXRpb24gbmFtZVxuICogQHJldHVybnMgVGhlIHJldHVybiB0eXBlIG9mIHRoZSBkcmFmdCBvcGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0UmV0dXJuVHlwZShvQ29udGV4dDogQ29udGV4dCwgc09wZXJhdGlvbjogc3RyaW5nKSB7XG5cdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRzRW50aXR5U2V0UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblxuXHRyZXR1cm4gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvJHtzT3BlcmF0aW9ufS8kUmV0dXJuVHlwZWApO1xufVxuLyoqXG4gKiBDaGVjayBpZiBvcHRpb25hbCBkcmFmdCBwcmVwYXJlIGFjdGlvbiBleGlzdHMuXG4gKlxuICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgc2hvdWxkIGJlIGJvdW5kIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIFRydWUgaWYgYSBhIHByZXBhcmUgYWN0aW9uIGV4aXN0c1xuICovXG5mdW5jdGlvbiBoYXNQcmVwYXJlQWN0aW9uKG9Db250ZXh0OiBDb250ZXh0KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIWdldEFjdGlvbk5hbWUob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5QUkVQQVJFKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBkcmFmdCBmcm9tIGFuIGFjdGl2ZSBkb2N1bWVudC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBiUHJlc2VydmVDaGFuZ2VzIElmIHRydWUgLSBleGlzdGluZyBjaGFuZ2VzIGZyb20gYW5vdGhlciB1c2VyIHRoYXQgYXJlIG5vdCBsb2NrZWQgYXJlIHByZXNlcnZlZCBhbmQgYW4gZXJyb3IgaXMgc2VudCBmcm9tIHRoZSBiYWNrZW5kLCBvdGhlcndpc2UgZmFsc2UgLSBleGlzdGluZyBjaGFuZ2VzIGZyb20gYW5vdGhlciB1c2VyIHRoYXQgYXJlIG5vdCBsb2NrZWQgYXJlIG92ZXJ3cml0dGVuPC9saT5cbiAqIEBwYXJhbSBvVmlldyBJZiB0cnVlIC0gZXhpc3RpbmcgY2hhbmdlcyBmcm9tIGFub3RoZXJcbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJucyB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVEcmFmdEVkaXRBY3Rpb24ob0NvbnRleHQ6IENvbnRleHQsIGJQcmVzZXJ2ZUNoYW5nZXM6IGJvb2xlYW4sIG9WaWV3OiBhbnkpOiBQcm9taXNlPENvbnRleHQ+IHtcblx0aWYgKG9Db250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikpIHtcblx0XHRjb25zdCBvT3B0aW9ucyA9IHsgJCRpbmhlcml0RXhwYW5kU2VsZWN0OiB0cnVlIH07XG5cdFx0Y29uc3Qgb09wZXJhdGlvbiA9IGNyZWF0ZU9wZXJhdGlvbihvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLkVESVQsIG9PcHRpb25zKTtcblx0XHRvT3BlcmF0aW9uLnNldFBhcmFtZXRlcihcIlByZXNlcnZlQ2hhbmdlc1wiLCBiUHJlc2VydmVDaGFuZ2VzKTtcblx0XHRjb25zdCBzR3JvdXBJZCA9IFwiZGlyZWN0XCI7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gYXdhaXQgKChvVmlldy5nZXRNb2RlbChcInNhcC5mZS5pMThuXCIpIGFzIFJlc291cmNlTW9kZWwpLmdldFJlc291cmNlQnVuZGxlKCkgYXMgUHJvbWlzZTxSZXNvdXJjZUJ1bmRsZT4pO1xuXHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0NPTU1PTl9PQkpFQ1RfUEFHRV9FRElUXCIsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdFx0Ly9JZiB0aGUgY29udGV4dCBpcyBjb21pbmcgZnJvbSBhIGxpc3QgYmluZGluZyB3ZSBwYXNzIHRoZSBmbGFnIHRydWUgdG8gcmVwbGFjZSB0aGUgY29udGV4dCBieSB0aGUgYWN0aXZlIG9uZVxuXHRcdGNvbnN0IG9FZGl0UHJvbWlzZSA9IG9PcGVyYXRpb24uZXhlY3V0ZShcblx0XHRcdHNHcm91cElkLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0KG9wZXJhdGlvbnNIZWxwZXIgYXMgYW55KS5mbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQuYmluZChcblx0XHRcdFx0ZHJhZnQsXG5cdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHR7IGxhYmVsOiBzQWN0aW9uTmFtZSwgbW9kZWw6IG9Db250ZXh0LmdldE1vZGVsKCkgfSxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdHVuZGVmaW5lZFxuXHRcdFx0KSxcblx0XHRcdG9Db250ZXh0LmdldEJpbmRpbmcoKS5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKVxuXHRcdCk7XG5cdFx0b09wZXJhdGlvbi5nZXRNb2RlbCgpLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0XHRyZXR1cm4gYXdhaXQgb0VkaXRQcm9taXNlO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIllvdSBjYW5ub3QgZWRpdCB0aGlzIGRyYWZ0IGRvY3VtZW50XCIpO1xuXHR9XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgdGhlIHZhbGlkYXRpb24gb2YgdGhlIGRyYWZ0LiBUaGUgUHJlcGFyZUFjdGlvbiBpcyB0cmlnZ2VyZWQgaWYgdGhlIG1lc3NhZ2VzIGFyZSBhbm5vdGF0ZWQgYW5kIGVudGl0eVNldCBnZXRzIGEgUHJlcGFyYXRpb25BY3Rpb24gYW5ub3RhdGVkLlxuICogSWYgdGhlIG9wZXJhdGlvbiBzdWNjZWVkcyBhbmQgb3BlcmF0aW9uIGRvZXNuJ3QgZ2V0IGEgcmV0dXJuIHR5cGUgKFJBUCBzeXN0ZW0pIHRoZSBtZXNzYWdlcyBhcmUgcmVxdWVzdGVkLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIFByZXBhcmVBY3Rpb24gc2hvdWxkIGJlIHBlcmZvcm1lZFxuICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gaWdub3JlRVRhZyBJZiBzZXQgdG8gdHJ1ZSwgRVRhZ3MgYXJlIGlnbm9yZWQgd2hlbiBleGVjdXRpbmcgdGhlIGFjdGlvblxuICogQHJldHVybnMgUmVzb2x2ZSBmdW5jdGlvbiByZXR1cm5zXG4gKiAgLSB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uIGlmIHRoZSBhY3Rpb24gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVkXG4gKiAgLSB2b2lkIGlmIHRoZSBhY3Rpb24gaGFzIGZhaWxlZFxuICogIC0gdW5kZWZpbmVkIGlmIHRoZSBhY3Rpb24gaGFzIG5vdCBiZWVuIHRyaWdnZXJlZCBzaW5jZSB0aGUgcHJlcmVxdWlzaXRlcyBhcmUgbm90IG1ldFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlRHJhZnRWYWxpZGF0aW9uKFxuXHRjb250ZXh0OiBDb250ZXh0LFxuXHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0aWdub3JlRVRhZzogYm9vbGVhblxuKTogUHJvbWlzZTxPRGF0YUNvbnRleHRCaW5kaW5nIHwgdm9pZCB8IHVuZGVmaW5lZD4ge1xuXHRpZiAoZHJhZnQuZ2V0TWVzc2FnZXNQYXRoKGNvbnRleHQpICYmIGRyYWZ0Lmhhc1ByZXBhcmVBY3Rpb24oY29udGV4dCkpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb3BlcmF0aW9uID0gYXdhaXQgZHJhZnQuZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24oY29udGV4dCwgY29udGV4dC5nZXRVcGRhdGVHcm91cElkKCksIHRydWUsIGlnbm9yZUVUYWcpO1xuXHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gcmV0dXJuZWQgb3BlcmF0aW9uIGJ5IGV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uIC0+IHRoZSBhY3Rpb24gaGFzIGZhaWxlZFxuXHRcdFx0aWYgKG9wZXJhdGlvbiAmJiAhZ2V0UmV0dXJuVHlwZShjb250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuUFJFUEFSRSkpIHtcblx0XHRcdFx0cmVxdWVzdE1lc3NhZ2VzKGNvbnRleHQsIGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3BlcmF0aW9uO1xuXHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlcXVlc3RpbmcgbWVzc2FnZXNcIiwgZXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQWN0aXZhdGVzIGEgZHJhZnQgZG9jdW1lbnQuIFRoZSBkcmFmdCB3aWxsIHJlcGxhY2UgdGhlIHNpYmxpbmcgZW50aXR5IGFuZCB3aWxsIGJlIGRlbGV0ZWQgYnkgdGhlIGJhY2sgZW5kLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBhY3Rpb24gc2hvdWxkIGJlIHBlcmZvcm1lZFxuICogQHBhcmFtIG9BcHBDb21wb25lbnQgVGhlIEFwcENvbXBvbmVudFxuICogQHBhcmFtIFtzR3JvdXBJZF0gVGhlIG9wdGlvbmFsIGJhdGNoIGdyb3VwIGluIHdoaWNoIHRoZSBvcGVyYXRpb24gaXMgdG8gYmUgZXhlY3V0ZWRcbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJucyB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVEcmFmdEFjdGl2YXRpb25BY3Rpb24ob0NvbnRleHQ6IENvbnRleHQsIG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgc0dyb3VwSWQ/OiBzdHJpbmcpOiBQcm9taXNlPENvbnRleHQ+IHtcblx0Y29uc3QgYkhhc1ByZXBhcmVBY3Rpb24gPSBoYXNQcmVwYXJlQWN0aW9uKG9Db250ZXh0KTtcblxuXHQvLyBBY2NvcmRpbmcgdG8gdGhlIGRyYWZ0IHNwZWMgaWYgdGhlIHNlcnZpY2UgY29udGFpbnMgYSBwcmVwYXJlIGFjdGlvbiBhbmQgd2UgdHJpZ2dlciBib3RoIHByZXBhcmUgYW5kXG5cdC8vIGFjdGl2YXRlIGluIG9uZSAkYmF0Y2ggdGhlIGFjdGl2YXRlIGFjdGlvbiBpcyBjYWxsZWQgd2l0aCBpRi1NYXRjaD0qXG5cdGNvbnN0IGJJZ25vcmVFdGFnID0gYkhhc1ByZXBhcmVBY3Rpb247XG5cblx0aWYgKCFvQ29udGV4dC5nZXRQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpKSB7XG5cdFx0Y29uc3Qgb09wZXJhdGlvbiA9IGNyZWF0ZU9wZXJhdGlvbihvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLkFDVElWQVRJT04sIHsgJCRpbmhlcml0RXhwYW5kU2VsZWN0OiB0cnVlIH0pO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IGF3YWl0ICgob0FwcENvbXBvbmVudC5nZXRNb2RlbChcInNhcC5mZS5pMThuXCIpIGFzIFJlc291cmNlTW9kZWwpLmdldFJlc291cmNlQnVuZGxlKCkgYXMgYW55KTtcblx0XHRjb25zdCBzQWN0aW9uTmFtZSA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19PUF9PQkpFQ1RfUEFHRV9TQVZFXCIsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBhd2FpdCBvT3BlcmF0aW9uLmV4ZWN1dGUoXG5cdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRiSWdub3JlRXRhZyxcblx0XHRcdFx0c0dyb3VwSWRcblx0XHRcdFx0XHQ/IChvcGVyYXRpb25zSGVscGVyIGFzIGFueSkuZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkLmJpbmQoXG5cdFx0XHRcdFx0XHRcdGRyYWZ0LFxuXHRcdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0eyBsYWJlbDogc0FjdGlvbk5hbWUsIG1vZGVsOiBvQ29udGV4dC5nZXRNb2RlbCgpIH0sXG5cdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHR1bmRlZmluZWRcblx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZCxcblx0XHRcdFx0b0NvbnRleHQuZ2V0QmluZGluZygpLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpXG5cdFx0XHQpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmIChiSGFzUHJlcGFyZUFjdGlvbikge1xuXHRcdFx0XHRjb25zdCBhY3Rpb25OYW1lID0gZ2V0QWN0aW9uTmFtZShvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLlBSRVBBUkUpLFxuXHRcdFx0XHRcdG9TaWRlRWZmZWN0c1NlcnZpY2UgPSBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpLFxuXHRcdFx0XHRcdG9CaW5kaW5nUGFyYW1ldGVycyA9IG9TaWRlRWZmZWN0c1NlcnZpY2UuZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyhhY3Rpb25OYW1lLCBvQ29udGV4dCksXG5cdFx0XHRcdFx0YVRhcmdldFBhdGhzID0gb0JpbmRpbmdQYXJhbWV0ZXJzICYmIG9CaW5kaW5nUGFyYW1ldGVycy5wYXRoRXhwcmVzc2lvbnM7XG5cdFx0XHRcdGlmIChhVGFyZ2V0UGF0aHMgJiYgYVRhcmdldFBhdGhzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0YXdhaXQgb1NpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHMoYVRhcmdldFBhdGhzLCBvQ29udGV4dCk7XG5cdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlcXVlc3Rpbmcgc2lkZSBlZmZlY3RzXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCByZXF1ZXN0TWVzc2FnZXMob0NvbnRleHQsIG9TaWRlRWZmZWN0c1NlcnZpY2UpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXF1ZXN0aW5nIG1lc3NhZ2VzXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBlO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYWN0aXZhdGlvbiBhY3Rpb24gY2Fubm90IGJlIGV4ZWN1dGVkIG9uIGFuIGFjdGl2ZSBkb2N1bWVudFwiKTtcblx0fVxufVxuXG4vKipcbiAqIEdldHMgdGhlIHN1cHBvcnRlZCBtZXNzYWdlIHByb3BlcnR5IHBhdGggb24gdGhlIFByZXBhcmVBY3Rpb24gZm9yIGEgY29udGV4dC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIFBhdGggdG8gdGhlIG1lc3NhZ2VcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gZ2V0TWVzc2FnZVBhdGhGb3JQcmVwYXJlKG9Db250ZXh0OiBDb250ZXh0KTogc3RyaW5nIHwgbnVsbCB7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRjb25zdCBzQ29udGV4dFBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9Db250ZXh0LmdldFBhdGgoKSk7XG5cdGNvbnN0IG9SZXR1cm5UeXBlID0gZ2V0UmV0dXJuVHlwZShvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLlBSRVBBUkUpO1xuXHQvLyBJZiB0aGVyZSBpcyBubyByZXR1cm4gcGFyYW1ldGVyLCBpdCBpcyBub3QgcG9zc2libGUgdG8gcmVxdWVzdCBNZXNzYWdlcy5cblx0Ly8gUkFQIGRyYWZ0IHByZXBhcmUgaGFzIG5vIHJldHVybiBwYXJhbWV0ZXJcblx0cmV0dXJuICEhb1JldHVyblR5cGUgPyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L0Ake0NvbW1vbkFubm90YXRpb25UZXJtcy5NZXNzYWdlc30vJFBhdGhgKSA6IG51bGw7XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIHByZXBhcmF0aW9uIGFjdGlvbi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBncm91cElkIFRoZSBvcHRpb25hbCBiYXRjaCBncm91cCBpbiB3aGljaCB3ZSB3YW50IHRvIGV4ZWN1dGUgdGhlIG9wZXJhdGlvblxuICogQHBhcmFtIGJNZXNzYWdlcyBJZiBzZXQgdG8gdHJ1ZSwgdGhlIFBSRVBBUkUgYWN0aW9uIHJldHJpZXZlcyBTQVBfTWVzc2FnZXNcbiAqIEBwYXJhbSBpZ25vcmVFVGFnIElmIHNldCB0byB0cnVlLCBFVGFnIGluZm9ybWF0aW9uIGlzIGlnbm9yZWQgd2hlbiB0aGUgYWN0aW9uIGlzIGV4ZWN1dGVkXG4gKiBAcmV0dXJucyBSZXNvbHZlIGZ1bmN0aW9uIHJldHVybnMgdGhlIGNvbnRleHQgb2YgdGhlIG9wZXJhdGlvblxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBleGVjdXRlRHJhZnRQcmVwYXJhdGlvbkFjdGlvbihvQ29udGV4dDogQ29udGV4dCwgZ3JvdXBJZD86IHN0cmluZywgYk1lc3NhZ2VzPzogYm9vbGVhbiwgaWdub3JlRVRhZz86IGJvb2xlYW4pIHtcblx0aWYgKCFvQ29udGV4dC5nZXRQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpKSB7XG5cdFx0Y29uc3Qgc01lc3NhZ2VzUGF0aCA9IGJNZXNzYWdlcyA/IGdldE1lc3NhZ2VQYXRoRm9yUHJlcGFyZShvQ29udGV4dCkgOiBudWxsO1xuXHRcdGNvbnN0IG9PcGVyYXRpb24gPSBjcmVhdGVPcGVyYXRpb24ob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5QUkVQQVJFLCBzTWVzc2FnZXNQYXRoID8geyAkc2VsZWN0OiBzTWVzc2FnZXNQYXRoIH0gOiBudWxsKTtcblxuXHRcdC8vIFRPRE86IHNpZGUgZWZmZWN0cyBxdWFsaWZpZXIgc2hhbGwgYmUgZXZlbiBkZXByZWNhdGVkIHRvIGJlIGNoZWNrZWRcblx0XHRvT3BlcmF0aW9uLnNldFBhcmFtZXRlcihcIlNpZGVFZmZlY3RzUXVhbGlmaWVyXCIsIFwiXCIpO1xuXG5cdFx0Y29uc3Qgc0dyb3VwSWQgPSBncm91cElkIHx8IG9PcGVyYXRpb24uZ2V0R3JvdXBJZCgpO1xuXHRcdHJldHVybiBvT3BlcmF0aW9uXG5cdFx0XHQuZXhlY3V0ZShzR3JvdXBJZCwgaWdub3JlRVRhZylcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIG9PcGVyYXRpb247XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBleGVjdXRpbmcgdGhlIG9wZXJhdGlvblwiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiVGhlIHByZXBhcmF0aW9uIGFjdGlvbiBjYW5ub3QgYmUgZXhlY3V0ZWQgb24gYW4gYWN0aXZlIGRvY3VtZW50XCIpO1xuXHR9XG59XG4vKipcbiAqIERldGVybWluZXMgdGhlIG1lc3NhZ2UgcGF0aCBmb3IgYSBjb250ZXh0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBwYXRoIHNoYWxsIGJlIGRldGVybWluZWRcbiAqIEByZXR1cm5zIE1lc3NhZ2UgcGF0aCwgZW1wdHkgaWYgbm90IGFubm90YXRlZFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBnZXRNZXNzYWdlc1BhdGgob0NvbnRleHQ6IENvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0c0VudGl0eVNldFBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9Db250ZXh0LmdldFBhdGgoKSk7XG5cdHJldHVybiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NZXNzYWdlcy8kUGF0aGApO1xufVxuLyoqXG4gKiBSZXF1ZXN0cyB0aGUgbWVzc2FnZXMgaWYgYW5ub3RhdGVkIGZvciBhIGdpdmVuIGNvbnRleHQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIG1lc3NhZ2VzIHNoYWxsIGJlIHJlcXVlc3RlZFxuICogQHBhcmFtIG9TaWRlRWZmZWN0c1NlcnZpY2UgU2VydmljZSBmb3IgdGhlIFNpZGVFZmZlY3RzIG9uIFNBUCBGaW9yaSBlbGVtZW50c1xuICogQHJldHVybnMgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIG1lc3NhZ2VzIHdlcmUgcmVxdWVzdGVkXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIHJlcXVlc3RNZXNzYWdlcyhvQ29udGV4dDogQ29udGV4dCwgb1NpZGVFZmZlY3RzU2VydmljZTogU2lkZUVmZmVjdHNTZXJ2aWNlKSB7XG5cdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBkcmFmdC5nZXRNZXNzYWdlc1BhdGgob0NvbnRleHQpO1xuXHRpZiAoc01lc3NhZ2VzUGF0aCkge1xuXHRcdHJldHVybiBvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhbeyAkUHJvcGVydHlQYXRoOiBzTWVzc2FnZXNQYXRoIH1dIGFzIGFueSwgb0NvbnRleHQpO1xuXHR9XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbn1cbi8qKlxuICogRXhlY3V0ZXMgZGlzY2FyZCBvZiBhIGRyYWZ0IGZ1bmN0aW9uIHVzaW5nIEhUVFAgUG9zdC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IEFwcCBDb21wb25lbnRcbiAqIEBwYXJhbSBiRW5hYmxlU3RyaWN0SGFuZGxpbmdcbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJucyB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVEcmFmdERpc2NhcmRBY3Rpb24ob0NvbnRleHQ6IENvbnRleHQsIG9BcHBDb21wb25lbnQ/OiBhbnksIGJFbmFibGVTdHJpY3RIYW5kbGluZz86IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0aWYgKCFvQ29udGV4dC5nZXRQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpKSB7XG5cdFx0Y29uc3Qgb0Rpc2NhcmRPcGVyYXRpb24gPSBkcmFmdC5jcmVhdGVPcGVyYXRpb24ob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5ESVNDQVJEKTtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPVxuXHRcdFx0KG9BcHBDb21wb25lbnQgJiZcblx0XHRcdFx0KGF3YWl0ICgob0FwcENvbXBvbmVudC5nZXRNb2RlbChcInNhcC5mZS5pMThuXCIpIGFzIFJlc291cmNlTW9kZWwpLmdldFJlc291cmNlQnVuZGxlKCkgYXMgUHJvbWlzZTxSZXNvdXJjZUJ1bmRsZT4pKSkgfHxcblx0XHRcdG51bGw7XG5cdFx0Y29uc3Qgc0dyb3VwSWQgPSBcImRpcmVjdFwiO1xuXHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9EUkFGVF9ESVNDQVJEX0JVVFRPTlwiLCBvUmVzb3VyY2VCdW5kbGUpO1xuXHRcdC8vIGFzIHRoZSBkaXNjYXJkIGFjdGlvbiBkb2VzbnQnIHNlbmQgdGhlIGFjdGl2ZSB2ZXJzaW9uIGluIHRoZSByZXNwb25zZSB3ZSBkbyBub3QgdXNlIHRoZSByZXBsYWNlIGluIGNhY2hlXG5cdFx0Y29uc3Qgb0Rpc2NhcmRQcm9taXNlID0gIWJFbmFibGVTdHJpY3RIYW5kbGluZ1xuXHRcdFx0PyBvRGlzY2FyZE9wZXJhdGlvbi5leGVjdXRlKHNHcm91cElkKVxuXHRcdFx0OiBvRGlzY2FyZE9wZXJhdGlvbi5leGVjdXRlKFxuXHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHQob3BlcmF0aW9uc0hlbHBlciBhcyBhbnkpLmZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZC5iaW5kKFxuXHRcdFx0XHRcdFx0ZHJhZnQsXG5cdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdHsgbGFiZWw6IHNBY3Rpb25OYW1lLCBtb2RlbDogb0NvbnRleHQuZ2V0TW9kZWwoKSB9LFxuXHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0dW5kZWZpbmVkXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRmYWxzZVxuXHRcdFx0ICApO1xuXHRcdG9Db250ZXh0LmdldE1vZGVsKCkuc3VibWl0QmF0Y2goc0dyb3VwSWQpO1xuXHRcdHJldHVybiBvRGlzY2FyZFByb21pc2U7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiVGhlIGRpc2NhcmQgYWN0aW9uIGNhbm5vdCBiZSBleGVjdXRlZCBvbiBhbiBhY3RpdmUgZG9jdW1lbnRcIik7XG5cdH1cbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgc2libGluZyBjb250ZXh0IGZvciBhIHN1Ym9iamVjdCBwYWdlIGFuZCBjYWxjdWxhdGVzIGEgc2libGluZyBwYXRoIGZvciBhbGwgaW50ZXJtZWRpYXRlIHBhdGhzXG4gKiBiZXR3ZWVuIHRoZSBvYmplY3QgcGFnZSBhbmQgdGhlIHN1Ym9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSByb290Q3VycmVudENvbnRleHQgVGhlIGNvbnRleHQgZm9yIHRoZSByb290IG9mIHRoZSBkcmFmdFxuICogQHBhcmFtIHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBzdWJvYmplY3QgcGFnZVxuICogQHJldHVybnMgVGhlIHNpYmxpbmdJbmZvcm1hdGlvbiBvYmplY3RcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihcblx0cm9vdEN1cnJlbnRDb250ZXh0OiBDb250ZXh0LFxuXHRyaWdodG1vc3RDdXJyZW50Q29udGV4dDogQ29udGV4dFxuKTogUHJvbWlzZTxTaWJsaW5nSW5mb3JtYXRpb24gfCB1bmRlZmluZWQ+IHtcblx0aWYgKCFyaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkuc3RhcnRzV2l0aChyb290Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpKSkge1xuXHRcdC8vIFdyb25nIHVzYWdlICEhXG5cdFx0TG9nLmVycm9yKFwiQ2Fubm90IGNvbXB1dGUgcmlnaHRtb3N0IHNpYmxpbmcgY29udGV4dFwiKTtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY29tcHV0ZSByaWdodG1vc3Qgc2libGluZyBjb250ZXh0XCIpO1xuXHR9XG5cblx0Y29uc3QgbW9kZWwgPSByb290Q3VycmVudENvbnRleHQuZ2V0TW9kZWwoKTtcblx0dHJ5IHtcblx0XHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyAxLiBGaW5kIGFsbCBzZWdtZW50cyBiZXR3ZWVuIHRoZSByb290IG9iamVjdCBhbmQgdGhlIHN1Yi1vYmplY3Rcblx0XHQvLyBFeGFtcGxlOiBmb3Igcm9vdCA9IC9QYXJhbShhYSkvRW50aXR5KGJiKSBhbmQgcmlnaHRNb3N0ID0gL1BhcmFtKGFhKS9FbnRpdHkoYmIpL19OYXYoY2MpL19TdWJOYXYoZGQpXG5cdFx0Ly8gLS0tPiBbXCJQYXJhbShhYSkvRW50aXR5KGJiKVwiLCBcIl9OYXYoY2MpXCIsIFwiX1N1Yk5hdihkZClcIl1cblxuXHRcdC8vIEZpbmQgYWxsIHNlZ21lbnRzIGluIHRoZSByaWdodG1vc3QgcGF0aFxuXHRcdGNvbnN0IGFkZGl0aW9uYWxQYXRoID0gcmlnaHRtb3N0Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpLnJlcGxhY2Uocm9vdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSwgXCJcIik7XG5cdFx0Y29uc3Qgc2VnbWVudHMgPSBhZGRpdGlvbmFsUGF0aCA/IGFkZGl0aW9uYWxQYXRoLnN1YnN0cmluZygxKS5zcGxpdChcIi9cIikgOiBbXTtcblx0XHQvLyBGaXJzdCBzZWdtZW50IGlzIGFsd2F5cyB0aGUgZnVsbCBwYXRoIG9mIHRoZSByb290IG9iamVjdCwgd2hpY2ggY2FuIGNvbnRhaW4gJy8nIGluIGNhc2Ugb2YgYSBwYXJhbWV0cml6ZWQgZW50aXR5XG5cdFx0c2VnbWVudHMudW5zaGlmdChyb290Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpLnN1YnN0cmluZygxKSk7XG5cblx0XHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyAyLiBSZXF1ZXN0IGNhbm9uaWNhbCBwYXRocyBvZiB0aGUgc2libGluZyBlbnRpdHkgZm9yIGVhY2ggc2VnbWVudFxuXHRcdC8vIEV4YW1wbGU6IGZvciBbXCJQYXJhbShhYSkvRW50aXR5KGJiKVwiLCBcIl9OYXYoY2MpXCIsIFwiX1N1Yk5hdihkZClcIl1cblx0XHQvLyAtLT4gcmVxdWVzdCBjYW5vbmljYWwgcGF0aHMgZm9yIFwiUGFyYW0oYWEpL0VudGl0eShiYikvU2libGluZ0VudGl0eVwiLCBcIlBhcmFtKGFhKS9FbnRpdHkoYmIpL19OYXYoY2MpL1NpYmxpbmdFbnRpdHlcIiwgXCJQYXJhbShhYSkvRW50aXR5KGJiKS9fTmF2KGNjKS9fU3ViTmF2KGRkKS9TaWJsaW5nRW50aXR5XCJcblx0XHRjb25zdCBvbGRQYXRoczogc3RyaW5nW10gPSBbXTtcblx0XHRjb25zdCBuZXdQYXRoczogc3RyaW5nW10gPSBbXTtcblx0XHRsZXQgY3VycmVudFBhdGggPSBcIlwiO1xuXHRcdGNvbnN0IGNhbm9uaWNhbFBhdGhQcm9taXNlcyA9IHNlZ21lbnRzLm1hcCgoc2VnbWVudCkgPT4ge1xuXHRcdFx0Y3VycmVudFBhdGggKz0gYC8ke3NlZ21lbnR9YDtcblx0XHRcdG9sZFBhdGhzLnVuc2hpZnQoY3VycmVudFBhdGgpO1xuXHRcdFx0aWYgKGN1cnJlbnRQYXRoLmVuZHNXaXRoKFwiKVwiKSkge1xuXHRcdFx0XHRjb25zdCBzaWJsaW5nQ29udGV4dCA9IG1vZGVsLmJpbmRDb250ZXh0KGAke2N1cnJlbnRQYXRofS9TaWJsaW5nRW50aXR5YCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdHJldHVybiBzaWJsaW5nQ29udGV4dC5yZXF1ZXN0Q2Fub25pY2FsUGF0aCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpOyAvLyAxLTEgcmVsYXRpb25cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIDMuIFJlY29uc3RydWN0IHRoZSBmdWxsIHBhdGhzIGZyb20gY2Fub25pY2FsIHBhdGhzIChmb3IgcGF0aCBtYXBwaW5nKVxuXHRcdC8vIEV4YW1wbGU6IGZvciBjYW5vbmljYWwgcGF0aHMgXCIvUGFyYW0oYWEpL0VudGl0eShiYi1zaWJsaW5nKVwiLCBcIi9FbnRpdHkyKGNjLXNpYmxpbmcpXCIsIFwiL0VudGl0eTMoZGQtc2libGluZylcIlxuXHRcdC8vIC0tPiBbXCJQYXJhbShhYSkvRW50aXR5KGJiLXNpYmxpbmcpXCIsIFwiUGFyYW0oYWEpL0VudGl0eShiYi1zaWJsaW5nKS9fTmF2KGNjLXNpYmxpbmcpXCIsIFwiUGFyYW0oYWEpL0VudGl0eShiYi1zaWJsaW5nKS9fTmF2KGNjLXNpYmxpbmcpL19TdWJOYXYoZGQtc2libGluZylcIl1cblx0XHRjb25zdCBjYW5vbmljYWxQYXRocyA9IChhd2FpdCBQcm9taXNlLmFsbChjYW5vbmljYWxQYXRoUHJvbWlzZXMpKSBhcyBzdHJpbmdbXTtcblx0XHRsZXQgc2libGluZ1BhdGggPSBcIlwiO1xuXHRcdGNhbm9uaWNhbFBhdGhzLmZvckVhY2goKGNhbm9uaWNhbFBhdGgsIGluZGV4KSA9PiB7XG5cdFx0XHRpZiAoaW5kZXggIT09IDApIHtcblx0XHRcdFx0aWYgKHNlZ21lbnRzW2luZGV4XS5lbmRzV2l0aChcIilcIikpIHtcblx0XHRcdFx0XHRjb25zdCBuYXZpZ2F0aW9uID0gc2VnbWVudHNbaW5kZXhdLnJlcGxhY2UoL1xcKC4qJC8sIFwiXCIpOyAvLyBLZWVwIG9ubHkgbmF2aWdhdGlvbiBuYW1lIGZyb20gdGhlIHNlZ21lbnQsIGkuZS4gYWFhKHh4eCkgLS0+IGFhYVxuXHRcdFx0XHRcdGNvbnN0IGtleXMgPSBjYW5vbmljYWxQYXRoLnJlcGxhY2UoLy4qXFwoLywgXCIoXCIpOyAvLyBLZWVwIG9ubHkgdGhlIGtleXMgZnJvbSB0aGUgY2Fub25pY2FsIHBhdGgsIGkuZS4gYWFhKHh4eCkgLS0+ICh4eHgpXG5cdFx0XHRcdFx0c2libGluZ1BhdGggKz0gYC8ke25hdmlnYXRpb259JHtrZXlzfWA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2libGluZ1BhdGggKz0gYC8ke3NlZ21lbnRzW2luZGV4XX1gOyAvLyAxLTEgcmVsYXRpb25cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2libGluZ1BhdGggPSBjYW5vbmljYWxQYXRoOyAvLyBUbyBtYW5hZ2UgcGFyYW1ldHJpemVkIGVudGl0aWVzXG5cdFx0XHR9XG5cdFx0XHRuZXdQYXRocy51bnNoaWZ0KHNpYmxpbmdQYXRoKTtcblx0XHR9KTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0YXJnZXRDb250ZXh0OiBtb2RlbC5iaW5kQ29udGV4dChzaWJsaW5nUGF0aCkuZ2V0Qm91bmRDb250ZXh0KCksIC8vIENyZWF0ZSB0aGUgcmlnaHRtb3N0IHNpYmxpbmcgY29udGV4dCBmcm9tIGl0cyBwYXRoXG5cdFx0XHRwYXRoTWFwcGluZzogb2xkUGF0aHMubWFwKChvbGRQYXRoLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG9sZFBhdGgsXG5cdFx0XHRcdFx0bmV3UGF0aDogbmV3UGF0aHNbaW5kZXhdXG5cdFx0XHRcdH07XG5cdFx0XHR9KVxuXHRcdH07XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0Ly8gQSBjYW5vbmljYWwgcGF0aCBjb3VsZG4ndCBiZSByZXNvbHZlZCAoYmVjYXVzZSBhIHNpYmxpbmcgZG9lc24ndCBleGlzdClcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRyYWZ0IGRvY3VtZW50IGZyb20gYW4gZXhpc3RpbmcgZG9jdW1lbnQuXG4gKlxuICogVGhlIGZ1bmN0aW9uIHN1cHBvcnRzIHNldmVyYWwgaG9va3MgYXMgdGhlcmUgaXMgYSBjZXJ0YWluIGNvcmVvZ3JhcGh5IGRlZmluZWQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0I2NyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50XG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdFxuICogQHN0YXRpY1xuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGFjdGl2ZSBkb2N1bWVudCBmb3IgdGhlIG5ldyBkcmFmdFxuICogQHBhcmFtIG9BcHBDb21wb25lbnQgVGhlIEFwcENvbXBvbmVudFxuICogQHBhcmFtIG1QYXJhbWV0ZXJzIFRoZSBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm9WaWV3XSBUaGUgdmlld1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5iUHJlc2VydmVDaGFuZ2VzXSBQcmVzZXJ2ZSBjaGFuZ2VzIG9mIGFuIGV4aXN0aW5nIGRyYWZ0IG9mIGFub3RoZXIgdXNlclxuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyB3aXRoIHRoZSB7QGxpbmsgc2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHQgY29udGV4dH0gb2YgdGhlIG5ldyBkcmFmdCBkb2N1bWVudFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudChcblx0b0NvbnRleHQ6IGFueSxcblx0b0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRtUGFyYW1ldGVyczoge1xuXHRcdG9WaWV3OiBWaWV3O1xuXHRcdGJQcmVzZXJ2ZUNoYW5nZXM/OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHR9XG4pOiBQcm9taXNlPENvbnRleHQgfCB1bmRlZmluZWQ+IHtcblx0Y29uc3QgbVBhcmFtID0gbVBhcmFtZXRlcnMgfHwge30sXG5cdFx0YlJ1blByZXNlcnZlQ2hhbmdlc0Zsb3cgPVxuXHRcdFx0dHlwZW9mIG1QYXJhbS5iUHJlc2VydmVDaGFuZ2VzID09PSBcInVuZGVmaW5lZFwiIHx8ICh0eXBlb2YgbVBhcmFtLmJQcmVzZXJ2ZUNoYW5nZXMgPT09IFwiYm9vbGVhblwiICYmIG1QYXJhbS5iUHJlc2VydmVDaGFuZ2VzKTsgLy9kZWZhdWx0IHRydWVcblxuXHQvKipcblx0ICogT3ZlcndyaXRlIHRoZSBleGlzdGluZyBjaGFuZ2UuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFJlc29sdmVzIHdpdGggcmVzdWx0IG9mIHtAbGluayBzYXAuZmUuY29yZS5hY3Rpb25zI2V4ZWN1dGVEcmFmdEVkaXRBY3Rpb259XG5cdCAqL1xuXHRhc3luYyBmdW5jdGlvbiBvdmVyd3JpdGVDaGFuZ2UoKSB7XG5cdFx0Ly9PdmVyd3JpdGUgZXhpc3RpbmcgY2hhbmdlc1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3QgZHJhZnREYXRhQ29udGV4dCA9IG9Nb2RlbC5iaW5kQ29udGV4dChgJHtvQ29udGV4dC5nZXRQYXRoKCl9L0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhYCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBhd2FpdCAobVBhcmFtZXRlcnMub1ZpZXcuZ2V0TW9kZWwoXCJzYXAuZmUuaTE4blwiKSBhcyBSZXNvdXJjZU1vZGVsKS5nZXRSZXNvdXJjZUJ1bmRsZSgpO1xuXHRcdGNvbnN0IGRyYWZ0QWRtaW5EYXRhID0gYXdhaXQgZHJhZnREYXRhQ29udGV4dC5yZXF1ZXN0T2JqZWN0KCk7XG5cdFx0aWYgKGRyYWZ0QWRtaW5EYXRhKSB7XG5cdFx0XHQvLyByZW1vdmUgYWxsIHVuYm91bmQgdHJhbnNpdGlvbiBtZXNzYWdlcyBhcyB3ZSBzaG93IGEgc3BlY2lhbCBkaWFsb2dcblx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRsZXQgc0luZm8gPSBkcmFmdEFkbWluRGF0YS5JblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbiB8fCBkcmFmdEFkbWluRGF0YS5JblByb2Nlc3NCeVVzZXI7XG5cdFx0XHRjb25zdCBzRW50aXR5U2V0ID0gKG1QYXJhbWV0ZXJzLm9WaWV3LmdldFZpZXdEYXRhKCkgYXMgYW55KS5lbnRpdHlTZXQ7XG5cdFx0XHRpZiAoc0luZm8pIHtcblx0XHRcdFx0Y29uc3Qgc0xvY2tlZEJ5VXNlck1zZyA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFwiQ19EUkFGVF9PQkpFQ1RfUEFHRV9EUkFGVF9MT0NLRURfQllfVVNFUlwiLFxuXHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRzSW5mbyxcblx0XHRcdFx0XHRzRW50aXR5U2V0XG5cdFx0XHRcdCk7XG5cdFx0XHRcdE1lc3NhZ2VCb3guZXJyb3Ioc0xvY2tlZEJ5VXNlck1zZyk7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihzTG9ja2VkQnlVc2VyTXNnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNJbmZvID0gZHJhZnRBZG1pbkRhdGEuQ3JlYXRlZEJ5VXNlckRlc2NyaXB0aW9uIHx8IGRyYWZ0QWRtaW5EYXRhLkNyZWF0ZWRCeVVzZXI7XG5cdFx0XHRcdGNvbnN0IHNVbnNhdmVkQ2hhbmdlc01zZyA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFwiQ19EUkFGVF9PQkpFQ1RfUEFHRV9EUkFGVF9VTlNBVkVEX0NIQU5HRVNcIixcblx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0c0luZm8sXG5cdFx0XHRcdFx0c0VudGl0eVNldFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRhd2FpdCBkcmFmdC5zaG93RWRpdENvbmZpcm1hdGlvbk1lc3NhZ2VCb3goc1Vuc2F2ZWRDaGFuZ2VzTXNnLCBvQ29udGV4dCk7XG5cdFx0XHRcdHJldHVybiBkcmFmdC5leGVjdXRlRHJhZnRFZGl0QWN0aW9uKG9Db250ZXh0LCBmYWxzZSwgbVBhcmFtZXRlcnMub1ZpZXcpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aHJvdyBuZXcgRXJyb3IoYERyYWZ0IGNyZWF0aW9uIGFib3J0ZWQgZm9yIGRvY3VtZW50OiAke29Db250ZXh0LmdldFBhdGgoKX1gKTtcblx0fVxuXG5cdGlmICghb0NvbnRleHQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIGNvbnRleHQgdG8gYWN0aXZlIGRvY3VtZW50IGlzIHJlcXVpcmVkXCIpO1xuXHR9XG5cdHRyeSB7XG5cdFx0bGV0IG9EcmFmdENvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdFx0dHJ5IHtcblx0XHRcdG9EcmFmdENvbnRleHQgPSBhd2FpdCBkcmFmdC5leGVjdXRlRHJhZnRFZGl0QWN0aW9uKG9Db250ZXh0LCBiUnVuUHJlc2VydmVDaGFuZ2VzRmxvdywgbVBhcmFtZXRlcnMub1ZpZXcpO1xuXHRcdH0gY2F0Y2ggKG9SZXNwb25zZTogYW55KSB7XG5cdFx0XHRpZiAob1Jlc3BvbnNlLnN0YXR1cyA9PT0gNDA5IHx8IG9SZXNwb25zZS5zdGF0dXMgPT09IDQxMiB8fCBvUmVzcG9uc2Uuc3RhdHVzID09PSA0MjMpIHtcblx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdGNvbnN0IHNpYmxpbmdJbmZvID0gYXdhaXQgZHJhZnQuY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihvQ29udGV4dCwgb0NvbnRleHQpO1xuXHRcdFx0XHRpZiAoc2libGluZ0luZm8/LnRhcmdldENvbnRleHQpIHtcblx0XHRcdFx0XHQvL3RoZXJlIGlzIGEgY29udGV4dCBhdXRob3JpemVkIHRvIGJlIGVkaXRlZCBieSB0aGUgY3VycmVudCB1c2VyXG5cdFx0XHRcdFx0YXdhaXQgQ29tbW9uVXRpbHMud2FpdEZvckNvbnRleHRSZXF1ZXN0ZWQoc2libGluZ0luZm8udGFyZ2V0Q29udGV4dCk7XG5cdFx0XHRcdFx0cmV0dXJuIHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly90aGVyZSBpcyBubyBkcmFmdCBvd25lZCBieSB0aGUgY3VycmVudCB1c2VyXG5cdFx0XHRcdFx0b0RyYWZ0Q29udGV4dCA9IGF3YWl0IG92ZXJ3cml0ZUNoYW5nZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKCEob1Jlc3BvbnNlICYmIG9SZXNwb25zZS5jYW5jZWxlZCkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKG9SZXNwb25zZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG9EcmFmdENvbnRleHQpIHtcblx0XHRcdGNvbnN0IHNFZGl0QWN0aW9uTmFtZSA9IGRyYWZ0LmdldEFjdGlvbk5hbWUob0RyYWZ0Q29udGV4dCwgZHJhZnRPcGVyYXRpb25zLkVESVQpO1xuXHRcdFx0Y29uc3Qgb1NpZGVFZmZlY3RzID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKS5nZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzKHNFZGl0QWN0aW9uTmFtZSwgb0RyYWZ0Q29udGV4dCk7XG5cdFx0XHRpZiAob1NpZGVFZmZlY3RzPy50cmlnZ2VyQWN0aW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRcdGF3YWl0IG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCkucmVxdWVzdFNpZGVFZmZlY3RzRm9yT0RhdGFBY3Rpb24ob1NpZGVFZmZlY3RzLCBvRHJhZnRDb250ZXh0KTtcblx0XHRcdFx0cmV0dXJuIG9EcmFmdENvbnRleHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gb0RyYWZ0Q29udGV4dDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0gY2F0Y2ggKGV4YzogYW55KSB7XG5cdFx0dGhyb3cgZXhjO1xuXHR9XG59XG4vKipcbiAqIENyZWF0ZXMgYW4gYWN0aXZlIGRvY3VtZW50IGZyb20gYSBkcmFmdCBkb2N1bWVudC5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gc3VwcG9ydHMgc2V2ZXJhbCBob29rcyBhcyB0aGVyZSBpcyBhIGNlcnRhaW4gY2hvcmVvZ3JhcGh5IGRlZmluZWQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0I2FjdGl2YXRlRG9jdW1lbnRcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0XG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gbVBhcmFtZXRlcnMgVGhlIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZm5CZWZvcmVBY3RpdmF0ZURvY3VtZW50XSBDYWxsYmFjayB0aGF0IGFsbG93cyBhIHZldG8gYmVmb3JlIHRoZSAnQ3JlYXRlJyByZXF1ZXN0IGlzIGV4ZWN1dGVkXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmZuQWZ0ZXJBY3RpdmF0ZURvY3VtZW50XSBDYWxsYmFjayBmb3IgcG9zdHByb2Nlc3NpbmcgYWZ0ZXIgZG9jdW1lbnQgd2FzIGFjdGl2YXRlZC5cbiAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlciBUaGUgbWVzc2FnZSBoYW5kbGVyXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggdGhlIHtAbGluayBzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dCBjb250ZXh0fSBvZiB0aGUgbmV3IGRyYWZ0IGRvY3VtZW50XG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGFjdGl2YXRlRG9jdW1lbnQoXG5cdG9Db250ZXh0OiBDb250ZXh0LFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdG1QYXJhbWV0ZXJzOiB7IGZuQmVmb3JlQWN0aXZhdGVEb2N1bWVudD86IGFueTsgZm5BZnRlckFjdGl2YXRlRG9jdW1lbnQ/OiBhbnkgfSxcblx0bWVzc2FnZUhhbmRsZXI/OiBNZXNzYWdlSGFuZGxlclxuKSB7XG5cdGNvbnN0IG1QYXJhbSA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRpZiAoIW9Db250ZXh0KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQmluZGluZyBjb250ZXh0IHRvIGRyYWZ0IGRvY3VtZW50IGlzIHJlcXVpcmVkXCIpO1xuXHR9XG5cblx0Y29uc3QgYkV4ZWN1dGUgPSBtUGFyYW0uZm5CZWZvcmVBY3RpdmF0ZURvY3VtZW50ID8gYXdhaXQgbVBhcmFtLmZuQmVmb3JlQWN0aXZhdGVEb2N1bWVudChvQ29udGV4dCkgOiB0cnVlO1xuXHRpZiAoIWJFeGVjdXRlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBBY3RpdmF0aW9uIG9mIHRoZSBkb2N1bWVudCB3YXMgYWJvcnRlZCBieSBleHRlbnNpb24gZm9yIGRvY3VtZW50OiAke29Db250ZXh0LmdldFBhdGgoKX1gKTtcblx0fVxuXG5cdGxldCBvQWN0aXZlRG9jdW1lbnRDb250ZXh0OiBhbnk7XG5cdGlmICghaGFzUHJlcGFyZUFjdGlvbihvQ29udGV4dCkpIHtcblx0XHRvQWN0aXZlRG9jdW1lbnRDb250ZXh0ID0gYXdhaXQgZXhlY3V0ZURyYWZ0QWN0aXZhdGlvbkFjdGlvbihvQ29udGV4dCwgb0FwcENvbXBvbmVudCk7XG5cdH0gZWxzZSB7XG5cdFx0LyogYWN0aXZhdGlvbiByZXF1aXJlcyBwcmVwYXJhdGlvbiAqL1xuXHRcdGNvbnN0IHNCYXRjaEdyb3VwID0gXCJkcmFmdFwiO1xuXHRcdC8vIHdlIHVzZSB0aGUgc2FtZSBiYXRjaEdyb3VwIHRvIGZvcmNlIHByZXBhcmUgYW5kIGFjdGl2YXRlIGluIGEgc2FtZSBiYXRjaCBidXQgd2l0aCBkaWZmZXJlbnQgY2hhbmdlc2V0XG5cdFx0bGV0IG9QcmVwYXJlUHJvbWlzZSA9IGRyYWZ0LmV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uKG9Db250ZXh0LCBzQmF0Y2hHcm91cCwgZmFsc2UpO1xuXHRcdG9Db250ZXh0LmdldE1vZGVsKCkuc3VibWl0QmF0Y2goc0JhdGNoR3JvdXApO1xuXHRcdGNvbnN0IG9BY3RpdmF0ZVByb21pc2UgPSBkcmFmdC5leGVjdXRlRHJhZnRBY3RpdmF0aW9uQWN0aW9uKG9Db250ZXh0LCBvQXBwQ29tcG9uZW50LCBzQmF0Y2hHcm91cCk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHZhbHVlcyA9IGF3YWl0IFByb21pc2UuYWxsKFtvUHJlcGFyZVByb21pc2UsIG9BY3RpdmF0ZVByb21pc2VdKTtcblx0XHRcdG9BY3RpdmVEb2N1bWVudENvbnRleHQgPSB2YWx1ZXNbMV07XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHQvLyBCQ1AgMjI3MDA4NDA3NVxuXHRcdFx0Ly8gaWYgdGhlIEFjdGl2YXRpb24gZmFpbHMsIHRoZW4gdGhlIG1lc3NhZ2VzIGFyZSByZXRyaWV2ZWQgZnJvbSBQUkVQQVJBVElPTiBhY3Rpb25cblx0XHRcdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBnZXRNZXNzYWdlUGF0aEZvclByZXBhcmUob0NvbnRleHQpO1xuXHRcdFx0aWYgKHNNZXNzYWdlc1BhdGgpIHtcblx0XHRcdFx0b1ByZXBhcmVQcm9taXNlID0gZHJhZnQuZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24ob0NvbnRleHQsIHNCYXRjaEdyb3VwLCB0cnVlKTtcblx0XHRcdFx0b0NvbnRleHQuZ2V0TW9kZWwoKS5zdWJtaXRCYXRjaChzQmF0Y2hHcm91cCk7XG5cdFx0XHRcdGF3YWl0IG9QcmVwYXJlUHJvbWlzZTtcblx0XHRcdFx0Y29uc3QgZGF0YSA9IGF3YWl0IG9Db250ZXh0LnJlcXVlc3RPYmplY3QoKTtcblx0XHRcdFx0aWYgKGRhdGFbc01lc3NhZ2VzUGF0aF0ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdC8vaWYgbWVzc2FnZXMgYXJlIGF2YWlsYWJsZSBmcm9tIHRoZSBQUkVQQVJBVElPTiBhY3Rpb24sIHRoZW4gcHJldmlvdXMgdHJhbnNpdGlvbiBtZXNzYWdlcyBhcmUgcmVtb3ZlZFxuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyPy5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoZmFsc2UsIGZhbHNlLCBvQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBtUGFyYW0uZm5BZnRlckFjdGl2YXRlRG9jdW1lbnQgPyBtUGFyYW0uZm5BZnRlckFjdGl2YXRlRG9jdW1lbnQob0NvbnRleHQsIG9BY3RpdmVEb2N1bWVudENvbnRleHQpIDogb0FjdGl2ZURvY3VtZW50Q29udGV4dDtcbn1cblxuLyoqXG4gKiBEaXNwbGF5IHRoZSBjb25maXJtYXRpb24gZGlhbG9nIGJveCBhZnRlciBwcmVzc2luZyB0aGUgZWRpdCBidXR0b24gb2YgYW4gb2JqZWN0IHBhZ2Ugd2l0aCB1bnNhdmVkIGNoYW5nZXMuXG4gKlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdCNzaG93RWRpdENvbmZpcm1hdGlvbk1lc3NhZ2VCb3hcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0XG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gc1Vuc2F2ZWRDaGFuZ2VzTXNnIERpYWxvZyBib3ggbWVzc2FnZSBpbmZvcm1pbmcgdGhlIHVzZXIgdGhhdCBpZiBoZSBzdGFydHMgZWRpdGluZywgdGhlIHByZXZpb3VzIHVuc2F2ZWQgY2hhbmdlcyB3aWxsIGJlIGxvc3RcbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBhY3RpdmUgZG9jdW1lbnQgZm9yIHRoZSBuZXcgZHJhZnRcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXNcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gc2hvd0VkaXRDb25maXJtYXRpb25NZXNzYWdlQm94KHNVbnNhdmVkQ2hhbmdlc01zZzogc3RyaW5nLCBvQ29udGV4dDogVjRDb250ZXh0KSB7XG5cdGNvbnN0IGxvY2FsSTE4blJlZiA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkge1xuXHRcdGNvbnN0IG9EaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdHRpdGxlOiBsb2NhbEkxOG5SZWYuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX1dBUk5JTkdcIiksXG5cdFx0XHRzdGF0ZTogXCJXYXJuaW5nXCIsXG5cdFx0XHRjb250ZW50OiBuZXcgVGV4dCh7XG5cdFx0XHRcdHRleHQ6IHNVbnNhdmVkQ2hhbmdlc01zZ1xuXHRcdFx0fSksXG5cdFx0XHRiZWdpbkJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdHRleHQ6IGxvY2FsSTE4blJlZi5nZXRUZXh0KFwiQ19DT01NT05fT0JKRUNUX1BBR0VfRURJVFwiKSxcblx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdHJlc29sdmUodHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLFxuXHRcdFx0ZW5kQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0dGV4dDogbG9jYWxJMThuUmVmLmdldFRleHQoXCJDX0NPTU1PTl9PQkpFQ1RfUEFHRV9DQU5DRUxcIiksXG5cdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdHJlamVjdChgRHJhZnQgY3JlYXRpb24gYWJvcnRlZCBmb3IgZG9jdW1lbnQ6ICR7b0NvbnRleHQuZ2V0UGF0aCgpfWApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSxcblx0XHRcdGFmdGVyQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0b0RpYWxvZy5hZGRTdHlsZUNsYXNzKFwic2FwVWlDb250ZW50UGFkZGluZ1wiKTtcblx0XHRvRGlhbG9nLm9wZW4oKTtcblx0fSk7XG59XG5cbi8qKlxuICogSFRUUCBQT1NUIGNhbGwgd2hlbiBEcmFmdEFjdGlvbiBpcyBwcmVzZW50IGZvciBEcmFmdCBEZWxldGU7IEhUVFAgREVMRVRFIGNhbGwgd2hlbiB0aGVyZSBpcyBubyBEcmFmdEFjdGlvblxuICogYW5kIEFjdGl2ZSBJbnN0YW5jZSBhbHdheXMgdXNlcyBERUxFVEUuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0I2RlbGV0ZURyYWZ0XG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdFxuICogQHN0YXRpY1xuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGRvY3VtZW50IHRvIGJlIGRpc2NhcmRlZFxuICogQHBhcmFtIG9BcHBDb21wb25lbnQgQ29udGV4dCBvZiB0aGUgZG9jdW1lbnQgdG8gYmUgZGlzY2FyZGVkXG4gKiBAcGFyYW0gYkVuYWJsZVN0cmljdEhhbmRsaW5nXG4gKiBAcHJpdmF0ZVxuICogQHJldHVybnMgQSBQcm9taXNlIHJlc29sdmVkIHdoZW4gdGhlIGNvbnRleHQgaXMgZGVsZXRlZFxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZURyYWZ0KG9Db250ZXh0OiBWNENvbnRleHQsIG9BcHBDb21wb25lbnQ/OiBBcHBDb21wb25lbnQsIGJFbmFibGVTdHJpY3RIYW5kbGluZz86IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0Y29uc3Qgc0Rpc2NhcmRBY3Rpb24gPSBnZXRBY3Rpb25OYW1lKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuRElTQ0FSRCksXG5cdFx0YklzQWN0aXZlRW50aXR5ID0gb0NvbnRleHQuZ2V0T2JqZWN0KCkuSXNBY3RpdmVFbnRpdHk7XG5cblx0aWYgKGJJc0FjdGl2ZUVudGl0eSB8fCAoIWJJc0FjdGl2ZUVudGl0eSAmJiAhc0Rpc2NhcmRBY3Rpb24pKSB7XG5cdFx0Ly9Vc2UgRGVsZXRlIGluIGNhc2Ugb2YgYWN0aXZlIGVudGl0eSBhbmQgbm8gZGlzY2FyZCBhY3Rpb24gYXZhaWxhYmxlIGZvciBkcmFmdFxuXHRcdGlmIChvQ29udGV4dC5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRyZXR1cm4gb0NvbnRleHRcblx0XHRcdFx0LmdldEJpbmRpbmcoKVxuXHRcdFx0XHQucmVzZXRDaGFuZ2VzKClcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiBvQ29udGV4dC5kZWxldGUoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBvQ29udGV4dC5kZWxldGUoKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly9Vc2UgRGlzY2FyZCBQb3N0IEFjdGlvbiBpZiBpdCBpcyBhIGRyYWZ0IGVudGl0eSBhbmQgZGlzY2FyZCBhY3Rpb24gZXhpc3RzXG5cdFx0cmV0dXJuIGV4ZWN1dGVEcmFmdERpc2NhcmRBY3Rpb24ob0NvbnRleHQsIG9BcHBDb21wb25lbnQsIGJFbmFibGVTdHJpY3RIYW5kbGluZyk7XG5cdH1cbn1cblxuY29uc3QgZHJhZnQgPSB7XG5cdGNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50OiBjcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudCxcblx0YWN0aXZhdGVEb2N1bWVudDogYWN0aXZhdGVEb2N1bWVudCxcblx0ZGVsZXRlRHJhZnQ6IGRlbGV0ZURyYWZ0LFxuXHRleGVjdXRlRHJhZnRFZGl0QWN0aW9uOiBleGVjdXRlRHJhZnRFZGl0QWN0aW9uLFxuXHRleGVjdXRlRHJhZnRWYWxpZGF0aW9uOiBleGVjdXRlRHJhZnRWYWxpZGF0aW9uLFxuXHRleGVjdXRlRHJhZnRQcmVwYXJhdGlvbkFjdGlvbjogZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24sXG5cdGV4ZWN1dGVEcmFmdEFjdGl2YXRpb25BY3Rpb246IGV4ZWN1dGVEcmFmdEFjdGl2YXRpb25BY3Rpb24sXG5cdGhhc1ByZXBhcmVBY3Rpb246IGhhc1ByZXBhcmVBY3Rpb24sXG5cdGdldE1lc3NhZ2VzUGF0aDogZ2V0TWVzc2FnZXNQYXRoLFxuXHRjb21wdXRlU2libGluZ0luZm9ybWF0aW9uOiBjb21wdXRlU2libGluZ0luZm9ybWF0aW9uLFxuXHRwcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbjogZHJhZnREYXRhTG9zc1BvcHVwLnByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uLFxuXHRzaWxlbnRseUtlZXBEcmFmdE9uRm9yd2FyZE5hdmlnYXRpb246IGRyYWZ0RGF0YUxvc3NQb3B1cC5zaWxlbnRseUtlZXBEcmFmdE9uRm9yd2FyZE5hdmlnYXRpb24sXG5cdGNyZWF0ZU9wZXJhdGlvbjogY3JlYXRlT3BlcmF0aW9uLFxuXHRleGVjdXRlRHJhZnREaXNjYXJkQWN0aW9uOiBleGVjdXRlRHJhZnREaXNjYXJkQWN0aW9uLFxuXHROYXZpZ2F0aW9uVHlwZTogZHJhZnREYXRhTG9zc1BvcHVwLk5hdmlnYXRpb25UeXBlLFxuXHRnZXRBY3Rpb25OYW1lOiBnZXRBY3Rpb25OYW1lLFxuXHRzaG93RWRpdENvbmZpcm1hdGlvbk1lc3NhZ2VCb3g6IHNob3dFZGl0Q29uZmlybWF0aW9uTWVzc2FnZUJveFxufTtcblxuZXhwb3J0IGRlZmF1bHQgZHJhZnQ7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUEwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0E7RUFDQSxNQUFNQSxlQUFlLEdBQUc7SUFDdkJDLElBQUksRUFBRSxZQUFZO0lBQ2xCQyxVQUFVLEVBQUUsa0JBQWtCO0lBQzlCQyxPQUFPLEVBQUUsZUFBZTtJQUN4QkMsT0FBTyxFQUFFO0VBQ1YsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQyxhQUFhLENBQUNDLFFBQWlCLEVBQUVDLFVBQWtCLEVBQUU7SUFDN0QsTUFBTUMsTUFBTSxHQUFHRixRQUFRLENBQUNHLFFBQVEsRUFBRTtNQUNqQ0MsVUFBVSxHQUFHRixNQUFNLENBQUNHLFlBQVksRUFBRTtNQUNsQ0MsY0FBYyxHQUFHRixVQUFVLENBQUNHLFdBQVcsQ0FBQ1AsUUFBUSxDQUFDUSxPQUFPLEVBQUUsQ0FBQztJQUU1RCxPQUFPSixVQUFVLENBQUNLLFNBQVMsQ0FBRSxHQUFFSCxjQUFlLDZDQUE0Q0wsVUFBVyxFQUFDLENBQUM7RUFDeEc7RUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0Es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