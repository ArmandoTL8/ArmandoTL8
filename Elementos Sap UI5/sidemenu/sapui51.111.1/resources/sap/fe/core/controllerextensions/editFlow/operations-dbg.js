/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/FPMHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel", "../../operationsHelper"], function (Log, ActionRuntime, CommonUtils, BusyLocker, messageHandling, FPMHelper, StableIdHelper, FELibrary, Button, Dialog, MessageBox, Core, Fragment, library, Message, XMLPreprocessor, XMLTemplateProcessor, JSONModel, operationsHelper) {
  "use strict";

  var MessageType = library.MessageType;
  var generate = StableIdHelper.generate;
  const Constants = FELibrary.Constants,
    InvocationGrouping = FELibrary.InvocationGrouping;
  const Action = MessageBox.Action;

  /**
   * Calls a bound action for one or multiple contexts.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callBoundAction
   * @memberof sap.fe.core.actions.operations
   * @param sActionName The name of the action to be called
   * @param contexts Either one context or an array with contexts for which the action is to be be called
   * @param oModel OData Model
   * @param oAppComponent The AppComponent
   * @param [mParameters] Optional, can contain the following attributes:
   * @param [mParameters.parameterValues] A map of action parameter names and provided values
   * @param [mParameters.mBindingParameters] A map of binding parameters that would be part of $select and $expand coming from side effects for bound actions
   * @param [mParameters.additionalSideEffect] Array of property paths to be requested in addition to actual target properties of the side effect
   * @param [mParameters.showActionParameterDialog] If set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
   * @param [mParameters.label] A human-readable label for the action
   * @param [mParameters.invocationGrouping] Mode how actions are to be called: Changeset to put all action calls into one changeset, Isolated to put them into separate changesets, defaults to Isolated
   * @param [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
   * @param [mParameters.defaultParameters] Can contain default parameters from FLP user defaults
   * @param [mParameters.parentControl] If specified, the dialogs are added as dependent of the parent control
   * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
   * @param [strictHandlingUtilities] Optional, utility flags and messages for strictHandling
   * @returns Promise resolves with an array of response objects (TODO: to be changed)
   * @private
   * @ui5-restricted
   */
  function callBoundAction(sActionName, contexts, oModel, oAppComponent, mParameters, strictHandlingUtilities) {
    if (!strictHandlingUtilities) {
      strictHandlingUtilities = {
        is412Executed: false,
        strictHandlingTransitionFails: [],
        strictHandlingPromises: [],
        strictHandlingWarningMessages: [],
        delaySuccessMessages: [],
        processedMessageIds: []
      };
    }
    if (!contexts || contexts.length === 0) {
      //In Freestyle apps bound actions can have no context
      return Promise.reject("Bound actions always requires at least one context");
    }
    // this method either accepts single context or an array of contexts
    // TODO: Refactor to an unambiguos API
    const isCalledWithArray = Array.isArray(contexts);

    // in case of single context wrap into an array for called methods (esp. callAction)
    mParameters.aContexts = isCalledWithArray ? contexts : [contexts];
    const oMetaModel = oModel.getMetaModel(),
      // Analyzing metaModelPath for action only from first context seems weird, but probably works in all existing szenarios - if several contexts are passed, they probably
      // belong to the same metamodelpath. TODO: Check, whether this can be improved / szenarios with different metaModelPaths might exist
      sActionPath = `${oMetaModel.getMetaPath(mParameters.aContexts[0].getPath())}/${sActionName}`,
      oBoundAction = oMetaModel.createBindingContext(`${sActionPath}/@$ui5.overload/0`);
    mParameters.isCriticalAction = getIsActionCritical(oMetaModel, sActionPath, mParameters.aContexts, oBoundAction);

    // Promise returned by callAction currently is rejected in case of execution for multiple contexts partly failing. This should be changed (some failing contexts do not mean
    // that function did not fulfill its task), but as this is a bigger refactoring, for the time being we need to deal with that at the calling place (i.e. here)
    // => provide the same handler (mapping back from array to single result/error if needed) for resolved/rejected case
    const extractSingleResult = function (result) {
      // single action could be resolved or rejected
      if (result[0].status === "fulfilled") {
        return result[0].value;
      } else {
        // In case of dialog cancellation, no array is returned => throw the result.
        // Ideally, differentiating should not be needed here => TODO: Find better solution when separating dialog handling (single object with single result) from backend
        // execution (potentially multiple objects)
        throw result[0].reason || result;
      }
    };
    return callAction(sActionName, oModel, oBoundAction, oAppComponent, mParameters, strictHandlingUtilities).then(result => {
      if (isCalledWithArray) {
        return result;
      } else {
        return extractSingleResult(result);
      }
    }, result => {
      if (isCalledWithArray) {
        throw result;
      } else {
        return extractSingleResult(result);
      }
    });
  }
  /**
   * Calls an action import.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callActionImport
   * @memberof sap.fe.core.actions.operations
   * @param sActionName The name of the action import to be called
   * @param oModel An instance of an OData V4 model
   * @param oAppComponent The AppComponent
   * @param [mParameters] Optional, can contain the following attributes:
   * @param [mParameters.parameterValues] A map of action parameter names and provided values
   * @param [mParameters.label] A human-readable label for the action
   * @param [mParameters.showActionParameterDialog] If set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
   * @param [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
   * @param [mParameters.defaultParameters] Can contain default parameters from FLP user defaults
   * @param [strictHandlingUtilities] Optional, utility flags and messages for strictHandling
   * @returns Promise resolves with an array of response objects (TODO: to be changed)
   * @private
   * @ui5-restricted
   */
  function callActionImport(sActionName, oModel, oAppComponent, mParameters, strictHandlingUtilities) {
    if (!oModel) {
      return Promise.reject("Action expects a model/context for execution");
    }
    const oMetaModel = oModel.getMetaModel(),
      sActionPath = oModel.bindContext(`/${sActionName}`).getPath(),
      oActionImport = oMetaModel.createBindingContext(`/${oMetaModel.createBindingContext(sActionPath).getObject("$Action")}/0`);
    mParameters.isCriticalAction = getIsActionCritical(oMetaModel, `${sActionPath}/@$ui5.overload`);
    return callAction(sActionName, oModel, oActionImport, oAppComponent, mParameters, strictHandlingUtilities);
  }
  function callBoundFunction(sFunctionName, context, oModel) {
    if (!context) {
      return Promise.reject("Bound functions always requires a context");
    }
    const oMetaModel = oModel.getMetaModel(),
      sFunctionPath = `${oMetaModel.getMetaPath(context.getPath())}/${sFunctionName}`,
      oBoundFunction = oMetaModel.createBindingContext(sFunctionPath);
    return _executeFunction(sFunctionName, oModel, oBoundFunction, context);
  }
  /**
   * Calls a function import.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callFunctionImport
   * @memberof sap.fe.core.actions.operations
   * @param sFunctionName The name of the function to be called
   * @param oModel An instance of an OData v4 model
   * @returns Promise resolves
   * @private
   */
  function callFunctionImport(sFunctionName, oModel) {
    if (!sFunctionName) {
      return Promise.resolve();
    }
    const oMetaModel = oModel.getMetaModel(),
      sFunctionPath = oModel.bindContext(`/${sFunctionName}`).getPath(),
      oFunctionImport = oMetaModel.createBindingContext(`/${oMetaModel.createBindingContext(sFunctionPath).getObject("$Function")}/0`);
    return _executeFunction(sFunctionName, oModel, oFunctionImport);
  }
  function _executeFunction(sFunctionName, oModel, oFunction, context) {
    let sGroupId;
    if (!oFunction || !oFunction.getObject()) {
      return Promise.reject(new Error(`Function ${sFunctionName} not found`));
    }
    if (context) {
      oFunction = oModel.bindContext(`${sFunctionName}(...)`, context);
      sGroupId = "functionGroup";
    } else {
      oFunction = oModel.bindContext(`/${sFunctionName}(...)`);
      sGroupId = "functionImport";
    }
    const oFunctionPromise = oFunction.execute(sGroupId);
    oModel.submitBatch(sGroupId);
    return oFunctionPromise.then(function () {
      return oFunction.getBoundContext();
    });
  }
  function callAction(sActionName, oModel, oAction, oAppComponent, mParameters, strictHandlingUtilities) {
    return new Promise(async function (resolve, reject) {
      let mActionExecutionParameters = {};
      let fnDialog;
      let oActionPromise;
      //let failedActionPromise: any;
      const sActionLabel = mParameters.label;
      const bSkipParameterDialog = mParameters.skipParameterDialog;
      const aContexts = mParameters.aContexts;
      const bIsCreateAction = mParameters.bIsCreateAction;
      const bIsCriticalAction = mParameters.isCriticalAction;
      let oMetaModel;
      let sMetaPath;
      let sMessagesPath;
      let iMessageSideEffect;
      let bIsSameEntity;
      let oReturnType;
      let bValuesProvidedForAllParameters;
      const actionDefinition = oAction.getObject();
      if (!oAction || !oAction.getObject()) {
        return reject(new Error(`Action ${sActionName} not found`));
      }

      // Get the parameters of the action
      const aActionParameters = getActionParameters(oAction);

      // Check if the action has parameters and would need a parameter dialog
      // The parameter ResultIsActiveEntity is always hidden in the dialog! Hence if
      // this is the only parameter, this is treated as no parameter here because the
      // dialog would be empty!
      // FIXME: Should only ignore this if this is a 'create' action, otherwise it is just some normal parameter that happens to have this name
      const bActionNeedsParameterDialog = aActionParameters.length > 0 && !(aActionParameters.length === 1 && aActionParameters[0].$Name === "ResultIsActiveEntity");

      // Provided values for the action parameters from invokeAction call
      const aParameterValues = mParameters.parameterValues;

      // Determine startup parameters if provided
      const oComponentData = oAppComponent.getComponentData();
      const oStartupParameters = oComponentData && oComponentData.startupParameters || {};

      // In case an action parameter is needed, and we shall skip the dialog, check if values are provided for all parameters
      if (bActionNeedsParameterDialog && bSkipParameterDialog) {
        bValuesProvidedForAllParameters = _valuesProvidedForAllParameters(bIsCreateAction, aActionParameters, aParameterValues, oStartupParameters);
      }

      // Depending on the previously determined data, either set a dialog or leave it empty which
      // will lead to direct execution of the action without a dialog
      fnDialog = null;
      if (bActionNeedsParameterDialog) {
        if (!(bSkipParameterDialog && bValuesProvidedForAllParameters)) {
          fnDialog = showActionParameterDialog;
        }
      } else if (bIsCriticalAction) {
        fnDialog = confirmCriticalAction;
      }
      mActionExecutionParameters = {
        fnOnSubmitted: mParameters.onSubmitted,
        fnOnResponse: mParameters.onResponse,
        actionName: sActionName,
        model: oModel,
        aActionParameters: aActionParameters,
        bGetBoundContext: mParameters.bGetBoundContext,
        defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
        label: mParameters.label,
        selectedItems: mParameters.selectedItems
      };
      if (oAction.getObject("$IsBound")) {
        if (mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions) {
          oMetaModel = oModel.getMetaModel();
          sMetaPath = oMetaModel.getMetaPath(aContexts[0].getPath());
          sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
          if (sMessagesPath) {
            iMessageSideEffect = mParameters.additionalSideEffect.pathExpressions.findIndex(function (exp) {
              return typeof exp === "string" && exp === sMessagesPath;
            });

            // Add SAP_Messages by default if not annotated by side effects, action does not return a collection and
            // the return type is the same as the bound type
            oReturnType = oAction.getObject("$ReturnType");
            bIsSameEntity = oReturnType && !oReturnType.$isCollection && oAction.getModel().getObject(sMetaPath).$Type === oReturnType.$Type;
            if (iMessageSideEffect > -1 || bIsSameEntity) {
              // the message path is annotated as side effect. As there's no binding for it and the model does currently not allow
              // to add it at a later point of time we have to take care it's part of the $select of the POST, therefore moving it.
              mParameters.mBindingParameters = mParameters.mBindingParameters || {};
              if (oAction.getObject(`$ReturnType/$Type/${sMessagesPath}`) && (!mParameters.mBindingParameters.$select || mParameters.mBindingParameters.$select.split(",").indexOf(sMessagesPath) === -1)) {
                mParameters.mBindingParameters.$select = mParameters.mBindingParameters.$select ? `${mParameters.mBindingParameters.$select},${sMessagesPath}` : sMessagesPath;
                // Add side effects at entity level because $select stops these being returned by the action
                // Only if no other side effects were added for Messages
                if (iMessageSideEffect === -1) {
                  mParameters.additionalSideEffect.pathExpressions.push("*");
                }
                if (mParameters.additionalSideEffect.triggerActions.length === 0 && iMessageSideEffect > -1) {
                  // no trigger action therefore no need to request messages again
                  mParameters.additionalSideEffect.pathExpressions.splice(iMessageSideEffect, 1);
                }
              }
            }
          }
        }
        mActionExecutionParameters.aContexts = aContexts;
        mActionExecutionParameters.mBindingParameters = mParameters.mBindingParameters;
        mActionExecutionParameters.additionalSideEffect = mParameters.additionalSideEffect;
        mActionExecutionParameters.bGrouped = mParameters.invocationGrouping === InvocationGrouping.ChangeSet;
        mActionExecutionParameters.internalModelContext = mParameters.internalModelContext;
        mActionExecutionParameters.operationAvailableMap = mParameters.operationAvailableMap;
        mActionExecutionParameters.isCreateAction = bIsCreateAction;
        mActionExecutionParameters.bObjectPage = mParameters.bObjectPage;
        if (mParameters.controlId) {
          mActionExecutionParameters.control = mParameters.parentControl.byId(mParameters.controlId);
        } else {
          mActionExecutionParameters.control = mParameters.parentControl;
        }
      }
      if (bIsCreateAction) {
        mActionExecutionParameters.bIsCreateAction = bIsCreateAction;
      }
      //check for skipping static actions
      const isStatic = (actionDefinition.$Parameter || []).some(aParameter => {
        return (actionDefinition.$EntitySetPath && actionDefinition.$EntitySetPath === aParameter.$Name || actionDefinition.$IsBound) && aParameter.$isCollection;
      });
      mActionExecutionParameters.isStatic = isStatic;
      if (fnDialog) {
        oActionPromise = fnDialog(sActionName, oAppComponent, sActionLabel, mActionExecutionParameters, aActionParameters, aParameterValues, oAction, mParameters.parentControl, mParameters.entitySetName, mParameters.messageHandler, strictHandlingUtilities);
        return oActionPromise.then(function (oOperationResult) {
          afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
          resolve(oOperationResult);
        }).catch(function (oOperationResult) {
          reject(oOperationResult);
        });
      } else {
        // Take over all provided parameter values and call the action.
        // This shall only happen if values are provided for all the parameters, otherwise the parameter dialog shall be shown which is ensured earlier
        if (aParameterValues) {
          for (const i in mActionExecutionParameters.aActionParameters) {
            var _aParameterValues$fin;
            mActionExecutionParameters.aActionParameters[i].value = aParameterValues === null || aParameterValues === void 0 ? void 0 : (_aParameterValues$fin = aParameterValues.find(element => element.name === mActionExecutionParameters.aActionParameters[i].$Name)) === null || _aParameterValues$fin === void 0 ? void 0 : _aParameterValues$fin.value;
          }
        } else {
          for (const i in mActionExecutionParameters.aActionParameters) {
            var _oStartupParameters$m;
            mActionExecutionParameters.aActionParameters[i].value = (_oStartupParameters$m = oStartupParameters[mActionExecutionParameters.aActionParameters[i].$Name]) === null || _oStartupParameters$m === void 0 ? void 0 : _oStartupParameters$m[0];
          }
        }
        let oOperationResult;
        try {
          oOperationResult = await _executeAction(oAppComponent, mActionExecutionParameters, mParameters.parentControl, mParameters.messageHandler, strictHandlingUtilities);
          const messages = Core.getMessageManager().getMessageModel().getData();
          if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
            strictHandlingUtilities.delaySuccessMessages = strictHandlingUtilities.delaySuccessMessages.concat(messages);
          }
          afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
          resolve(oOperationResult);
        } catch {
          reject(oOperationResult);
        } finally {
          var _mParameters$messageH, _mActionExecutionPara;
          if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
            try {
              const strictHandlingFails = strictHandlingUtilities.strictHandlingTransitionFails;
              const aFailedContexts = [];
              strictHandlingFails.forEach(function (fail) {
                aFailedContexts.push(fail.oAction.getContext());
              });
              mActionExecutionParameters.aContexts = aFailedContexts;
              const oFailedOperationResult = await _executeAction(oAppComponent, mActionExecutionParameters, mParameters.parentControl, mParameters.messageHandler, strictHandlingUtilities);
              strictHandlingUtilities.strictHandlingTransitionFails = [];
              Core.getMessageManager().addMessages(strictHandlingUtilities.delaySuccessMessages);
              afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
              resolve(oFailedOperationResult);
            } catch (oFailedOperationResult) {
              reject(oFailedOperationResult);
            }
          }
          mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$messageH = mParameters.messageHandler) === null || _mParameters$messageH === void 0 ? void 0 : _mParameters$messageH.showMessageDialog({
            control: (_mActionExecutionPara = mActionExecutionParameters) === null || _mActionExecutionPara === void 0 ? void 0 : _mActionExecutionPara.control
          });
          if (strictHandlingUtilities) {
            strictHandlingUtilities = {
              is412Executed: false,
              strictHandlingTransitionFails: [],
              strictHandlingPromises: [],
              strictHandlingWarningMessages: [],
              delaySuccessMessages: [],
              processedMessageIds: []
            };
          }
        }
      }
    });
  }
  function confirmCriticalAction(sActionName, oAppComponent, sActionLabel, mParameters, aActionParameters, aParameterValues, oActionContext, oParentControl, entitySetName, messageHandler) {
    return new Promise((resolve, reject) => {
      let boundActionName = sActionName ? sActionName : null;
      boundActionName = boundActionName.indexOf(".") >= 0 ? boundActionName.split(".")[boundActionName.split(".").length - 1] : boundActionName;
      const suffixResourceKey = boundActionName && entitySetName ? `${entitySetName}|${boundActionName}` : "";
      const oResourceBundle = oParentControl.getController().oResourceBundle;
      const sConfirmationText = CommonUtils.getTranslatedText("C_OPERATIONS_ACTION_CONFIRM_MESSAGE", oResourceBundle, undefined, suffixResourceKey);
      MessageBox.confirm(sConfirmationText, {
        onClose: async function (sAction) {
          if (sAction === Action.OK) {
            try {
              const oOperation = await _executeAction(oAppComponent, mParameters, oParentControl, messageHandler);
              resolve(oOperation);
            } catch (oError) {
              try {
                await messageHandler.showMessageDialog();
                reject(oError);
              } catch (e) {
                reject(oError);
              }
            }
          } else {
            resolve();
          }
        }
      });
    });
  }
  async function executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, after412, strictHandlingUtilities) {
    var _mParameters$aContext;
    const aResult = await _executeAction(oAppComponent, mParameters, oParentControl, messageHandler, strictHandlingUtilities);
    // If some entries were successful, and others have failed, the overall process is still successful. However, this was treated as rejection
    // before, and this currently is still kept, as long as dialog handling is mixed with backend process handling.
    // TODO: Refactor to only reject in case of overall process error.
    // For the time being: map to old logic to reject if at least one entry has failed
    // This check is only done for bound actions => aContexts not empty
    if ((_mParameters$aContext = mParameters.aContexts) !== null && _mParameters$aContext !== void 0 && _mParameters$aContext.length) {
      if (aResult !== null && aResult !== void 0 && aResult.some(oSingleResult => oSingleResult.status === "rejected")) {
        throw aResult;
      }
    }
    const messages = Core.getMessageManager().getMessageModel().getData();
    if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
      if (!after412) {
        strictHandlingUtilities.delaySuccessMessages = strictHandlingUtilities.delaySuccessMessages.concat(messages);
      } else {
        Core.getMessageManager().addMessages(strictHandlingUtilities.delaySuccessMessages);
        if (messages.length) {
          // BOUND TRANSITION AS PART OF SAP_MESSAGE
          messageHandler.showMessageDialog({
            onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
              return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn);
            },
            control: mParameters.control
          });
        }
      }
    } else if (messages.length) {
      // BOUND TRANSITION AS PART OF SAP_MESSAGE
      messageHandler.showMessageDialog({
        isActionParameterDialogOpen: mParameters === null || mParameters === void 0 ? void 0 : mParameters.oDialog.isOpen(),
        onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
          return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn);
        },
        control: mParameters.control
      });
    }
    return aResult;
  }
  function afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition) {
    if (mActionExecutionParameters.internalModelContext && mActionExecutionParameters.operationAvailableMap && mActionExecutionParameters.aContexts && mActionExecutionParameters.aContexts.length && actionDefinition.$IsBound) {
      //check for skipping static actions
      const isStatic = mActionExecutionParameters.isStatic;
      if (!isStatic) {
        ActionRuntime.setActionEnablement(mActionExecutionParameters.internalModelContext, JSON.parse(mActionExecutionParameters.operationAvailableMap), mParameters.selectedItems, "table");
      } else if (mActionExecutionParameters.control) {
        const oControl = mActionExecutionParameters.control;
        if (oControl.isA("sap.ui.mdc.Table")) {
          const aSelectedContexts = oControl.getSelectedContexts();
          ActionRuntime.setActionEnablement(mActionExecutionParameters.internalModelContext, JSON.parse(mActionExecutionParameters.operationAvailableMap), aSelectedContexts, "table");
        }
      }
    }
  }
  function actionParameterShowMessageCallback(mParameters, aContexts, oDialog, messages, showMessageParametersIn) {
    let showMessageBox = showMessageParametersIn.showMessageBox,
      showMessageDialog = showMessageParametersIn.showMessageDialog;
    const oControl = mParameters.control;
    const unboundMessages = messages.filter(function (message) {
      return message.getTarget() === "";
    });
    const APDmessages = messages.filter(function (message) {
      return message.getTarget && message.getTarget().indexOf(mParameters.actionName) !== -1 && mParameters.aActionParameters.some(function (actionParam) {
        return message.getTarget().indexOf(actionParam.$Name) !== -1;
      });
    });
    APDmessages.forEach(function (APDMessage) {
      APDMessage.isAPDTarget = true;
    });
    const errorTargetsInAPD = APDmessages.length ? true : false;
    if (oDialog.isOpen() && aContexts.length !== 0 && !mParameters.isStatic) {
      if (!mParameters.bGrouped) {
        //isolated
        if (aContexts.length > 1 || !errorTargetsInAPD) {
          // does not matter if error is in APD or not, if there are multiple contexts selected or if the error is not the APD, we close it.
          // TODO: Dilaog handling should not be part of message handling. Refactor accordingly - dialog should not be needed inside this method - neither
          // to ask whether it's open, nor to close/destroy it!
          oDialog.close();
          oDialog.destroy();
        }
      } else if (!errorTargetsInAPD) {
        //changeset
        oDialog.close();
        oDialog.destroy();
      }
    }
    let filteredMessages = [];
    const bIsAPDOpen = oDialog.isOpen();
    if (messages.length === 1 && messages[0].getTarget && messages[0].getTarget() !== undefined && messages[0].getTarget() !== "") {
      if (oControl && oControl.getModel("ui").getProperty("/isEditable") === false || !oControl) {
        // OP edit or LR
        showMessageBox = !errorTargetsInAPD;
        showMessageDialog = false;
      } else if (oControl && oControl.getModel("ui").getProperty("/isEditable") === true) {
        showMessageBox = false;
        showMessageDialog = false;
      }
    } else if (oControl) {
      if (oControl.getModel("ui").getProperty("/isEditable") === false) {
        if (bIsAPDOpen && errorTargetsInAPD) {
          showMessageDialog = false;
        }
      } else if (oControl.getModel("ui").getProperty("/isEditable") === true) {
        if (!bIsAPDOpen && errorTargetsInAPD) {
          showMessageDialog = true;
          filteredMessages = unboundMessages.concat(APDmessages);
        } else if (!bIsAPDOpen && unboundMessages.length === 0) {
          // error targets in APD => there is atleast one bound message. If there are unbound messages, dialog must be shown.
          // for draft entity, we already closed the APD
          showMessageDialog = false;
        }
      }
    }
    return {
      showMessageBox: showMessageBox,
      showMessageDialog: showMessageDialog,
      filteredMessages: filteredMessages.length ? filteredMessages : messages,
      fnGetMessageSubtitle: oControl && oControl.isA("sap.ui.mdc.Table") && messageHandling.setMessageSubtitle.bind({}, oControl, aContexts)
    };
  }

  /*
   * Currently, this method is responsible for showing the dialog and executing the action. The promise returned is pending while waiting for user input, as well as while the
   * back-end request is running. The promise is rejected when the user cancels the dialog and also when the back-end request fails.
   * TODO: Refactoring: Separate dialog handling from backend processing. Dialog handling should return a Promise resolving to parameters to be provided to backend. If dialog is
   * cancelled, that promise can be rejected. Method responsible for backend processing need to deal with multiple contexts - i.e. it should either return an array of Promises or
   * a Promise resolving to an array. In the latter case, that Promise should be resolved also when some or even all contexts failed in backend - the overall process still was
   * successful.
   *
   */

  // this type is meant to describe the meta information for one ActionParameter (i.e. its object in metaModel)

  function showActionParameterDialog(sActionName, oAppComponent, sActionLabel, mParameters, aActionParameters, aParameterValues, oActionContext, oParentControl, entitySetName, messageHandler, strictHandlingUtilities) {
    const sPath = _getPath(oActionContext, sActionName),
      metaModel = oActionContext.getModel().oModel.getMetaModel(),
      entitySetContext = metaModel.createBindingContext(sPath),
      sActionNamePath = oActionContext.getObject("$IsBound") ? oActionContext.getPath().split("/@$ui5.overload/0")[0] : oActionContext.getPath().split("/0")[0],
      actionNameContext = metaModel.createBindingContext(sActionNamePath),
      bIsCreateAction = mParameters.isCreateAction,
      sFragmentName = "sap/fe/core/controls/ActionParameterDialog";
    return new Promise(async function (resolve, reject) {
      let actionParameterInfos; // to be filled after fragment (for action parameter dialog) is loaded. Actually only needed during dialog processing, i.e. could be moved into the controller and directly initialized there, but only after moving all handlers (esp. press handler for action button) to controller.

      const messageManager = Core.getMessageManager();

      // in case of missing mandaotory parameter, message currently differs per parameter, as it superfluously contains the label as parameter. Possiblky this could be removed in future, in that case, interface could be simplified to ActionParameterInfo[], string
      const _addMessageForActionParameter = messageParameters => {
        messageManager.addMessages(messageParameters.map(messageParameter => {
          const binding = messageParameter.actionParameterInfo.field.getBinding(messageParameter.actionParameterInfo.isMultiValue ? "items" : "value");
          return new Message({
            message: messageParameter.message,
            type: "Error",
            processor: binding === null || binding === void 0 ? void 0 : binding.getModel(),
            persistent: true,
            target: binding === null || binding === void 0 ? void 0 : binding.getResolvedPath()
          });
        }));
      };
      const _removeMessagesForActionParamter = parameter => {
        const allMessages = messageManager.getMessageModel().getData();
        const controlId = generate(["APD_", parameter.$Name]);
        // also remove messages assigned to inner controls, but avoid removing messages for different paramters (with name being substring of another parameter name)
        const relevantMessages = allMessages.filter(msg => msg.getControlIds().some(id => controlId.split("-").includes(id)));
        messageManager.removeMessages(relevantMessages);
      };
      const _validateProperties = async function (oResourceBundle) {
        const requiredParameterInfos = actionParameterInfos.filter(actionParameterInfo => actionParameterInfo.field.getRequired());
        await Promise.allSettled(requiredParameterInfos.map(actionParameterInfo => actionParameterInfo.validationPromise));
        /* Hint: The boolean false is a valid value */
        const emptyRequiredFields = requiredParameterInfos.filter(requiredParameterInfo => {
          if (requiredParameterInfo.isMultiValue) {
            return requiredParameterInfo.value === undefined || !requiredParameterInfo.value.length;
          } else {
            const fieldValue = requiredParameterInfo.field.getValue();
            return fieldValue === undefined || fieldValue === null || fieldValue === "";
          }
        });

        // message contains label per field for historical reason (originally, it was shown in additional popup, now it's directly added to the field)
        // if this was not the case (and hopefully, in future this might be subject to change), interface of _addMessageForActionParameter could be simplified to just pass emptyRequiredFields and a constant message here
        _addMessageForActionParameter(emptyRequiredFields.map(actionParameterInfo => {
          var _actionParameterInfo$;
          return {
            actionParameterInfo: actionParameterInfo,
            message: CommonUtils.getTranslatedText("C_OPERATIONS_ACTION_PARAMETER_DIALOG_MISSING_MANDATORY_MSG", oResourceBundle, [((_actionParameterInfo$ = actionParameterInfo.field.getParent()) === null || _actionParameterInfo$ === void 0 ? void 0 : _actionParameterInfo$.getAggregation("label")).getText()])
          };
        }));

        /* Check value state of all parameter */
        const firstInvalidActionParameter = actionParameterInfos.find(
        // unfortunately, _addMessageForActionParameter sets valueState only asynchroneously, thus checking emptyRequiredFields additionally
        actionParameterInfo => actionParameterInfo.field.getValueState() === "Error" || emptyRequiredFields.includes(actionParameterInfo));
        if (firstInvalidActionParameter) {
          firstInvalidActionParameter.field.focus();
          return false;
        } else {
          return true;
        }
      };
      const oController = {
        handleChange: async function (oEvent) {
          const field = oEvent.getSource();
          const actionParameterInfo = actionParameterInfos.find(actionParameterInfo => actionParameterInfo.field === field);
          // field value is being changed, thus existing messages related to that field are not valid anymore
          _removeMessagesForActionParamter(actionParameterInfo.parameter);
          // adapt info. Promise is resolved to value or rejected with exception containing message
          actionParameterInfo.validationPromise = oEvent.getParameter("promise");
          try {
            actionParameterInfo.value = await actionParameterInfo.validationPromise;
          } catch (error) {
            delete actionParameterInfo.value;
            _addMessageForActionParameter([{
              actionParameterInfo: actionParameterInfo,
              message: error.message
            }]);
          }
        }
      };
      const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
      const oParameterModel = new JSONModel({
        $displayMode: {}
      });
      try {
        const createdFragment = await XMLPreprocessor.process(oFragment, {
          name: sFragmentName
        }, {
          bindingContexts: {
            action: oActionContext,
            actionName: actionNameContext,
            entitySet: entitySetContext
          },
          models: {
            action: oActionContext.getModel(),
            actionName: actionNameContext.getModel(),
            entitySet: entitySetContext.getModel(),
            metaModel: entitySetContext.getModel()
          }
        });
        // TODO: move the dialog into the fragment and move the handlers to the oController
        const aContexts = mParameters.aContexts || [];
        const aFunctionParams = [];
        // eslint-disable-next-line prefer-const
        let oOperationBinding;
        await CommonUtils.setUserDefaults(oAppComponent, aActionParameters, oParameterModel, true);
        const oDialogContent = await Fragment.load({
          definition: createdFragment,
          controller: oController
        });
        actionParameterInfos = aActionParameters.map(actionParameter => {
          const field = Core.byId(generate(["APD_", actionParameter.$Name]));
          const isMultiValue = field.isA("sap.ui.mdc.MultiValueField");
          return {
            parameter: actionParameter,
            field: field,
            isMultiValue: isMultiValue
          };
        });
        const oResourceBundle = oParentControl.getController().oResourceBundle;
        let actionResult = {
          dialogCancelled: true,
          // to be set to false in case of successful action exection
          result: undefined
        };
        const oDialog = new Dialog(generate(["fe", "APD_", sActionName]), {
          title: sActionLabel || CommonUtils.getTranslatedText("C_OPERATIONS_ACTION_PARAMETER_DIALOG_TITLE", oResourceBundle),
          content: [oDialogContent],
          escapeHandler: function () {
            // escape handler is meant to possibly suppress or postpone closing the dialog on escape (by calling "reject" on the provided object, or "resolve" only when
            // done with all tasks to happen before dialog can be closed). It's not intended to explicetly close the dialog here (that happens automatically when no
            // escapeHandler is provided or the resolve-callback is called) or for own wrap up tasks (like removing validition messages - this should happen in the
            // afterClose).
            // TODO: Move wrap up tasks to afterClose, and remove this method completely. Take care to also adapt end button press handler accordingly.
            // Currently only still needed to differentiate closing dialog after successful execution (uses resolve) from user cancellation (using reject)
            oDialog.close();
            //		reject(Constants.CancelActionDialog);
          },

          beginButton: new Button(generate(["fe", "APD_", sActionName, "Action", "Ok"]), {
            text: bIsCreateAction ? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON", oResourceBundle) : _getActionParameterActionName(oResourceBundle, sActionLabel, sActionName, entitySetName),
            type: "Emphasized",
            press: async function () {
              try {
                if (!(await _validateProperties(oResourceBundle))) {
                  return;
                }
                BusyLocker.lock(oDialog);
                try {
                  // TODO: due to using the search and value helps on the action dialog transient messages could appear
                  // we need an UX design for those to show them to the user - for now remove them before continuing
                  messageHandler.removeTransitionMessages();
                  // move parameter values from Dialog (SimpleForm) to mParameters.actionParameters so that they are available in the operation bindings for all contexts
                  let vParameterValue;
                  const oParameterContext = oOperationBinding && oOperationBinding.getParameterContext();
                  for (const i in aActionParameters) {
                    if (aActionParameters[i].$isCollection) {
                      const aMVFContent = oDialog.getModel("mvfview").getProperty(`/${aActionParameters[i].$Name}`),
                        aKeyValues = [];
                      for (const j in aMVFContent) {
                        aKeyValues.push(aMVFContent[j].Key);
                      }
                      vParameterValue = aKeyValues;
                    } else {
                      vParameterValue = oParameterContext.getProperty(aActionParameters[i].$Name);
                    }
                    aActionParameters[i].value = vParameterValue; // writing the current value (ueser input!) into the metamodel => should be refactored to use ActionParameterInfos instead. Used in setActionParameterDefaultValue
                    vParameterValue = undefined;
                  }
                  mParameters.label = sActionLabel;
                  try {
                    const aResult = await executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, false, strictHandlingUtilities);
                    actionResult = {
                      dialogCancelled: false,
                      result: aResult
                    };
                    oDialog.close();
                    // resolve(aResult);
                  } catch (oError) {
                    const messages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
                    if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
                      strictHandlingUtilities.delaySuccessMessages = strictHandlingUtilities.delaySuccessMessages.concat(messages);
                    }
                    throw oError;
                  } finally {
                    if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
                      try {
                        const strictHandlingFails = strictHandlingUtilities.strictHandlingTransitionFails;
                        const aFailedContexts = [];
                        strictHandlingFails.forEach(function (fail) {
                          aFailedContexts.push(fail.oAction.getContext());
                        });
                        mParameters.aContexts = aFailedContexts;
                        const aResult = await executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, true, strictHandlingUtilities);
                        strictHandlingUtilities.strictHandlingTransitionFails = [];
                        actionResult = {
                          dialogCancelled: false,
                          result: aResult
                        };
                        // resolve(aResult);
                      } catch {
                        if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
                          Core.getMessageManager().addMessages(strictHandlingUtilities.delaySuccessMessages);
                        }
                        await messageHandler.showMessageDialog({
                          isActionParameterDialogOpen: oDialog.isOpen(),
                          onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                            return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn);
                          }
                        });
                      }
                    }
                    if (BusyLocker.isLocked(oDialog)) {
                      BusyLocker.unlock(oDialog);
                    }
                  }
                } catch (oError) {
                  let showMessageDialog = true;
                  await messageHandler.showMessages({
                    context: mParameters.aContexts[0],
                    isActionParameterDialogOpen: oDialog.isOpen(),
                    messagePageNavigationCallback: function () {
                      oDialog.close();
                    },
                    onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                      // Why is this implemented as callback? Apparently, all needed information is available beforehand
                      // TODO: refactor accordingly
                      const showMessageParameters = actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn);
                      showMessageDialog = showMessageParameters.showMessageDialog;
                      return showMessageParameters;
                    },
                    aSelectedContexts: mParameters.aContexts,
                    sActionName: sActionLabel,
                    control: mParameters.control
                  });

                  // In case of backend validation error(s?), message shall not be shown in message dialog but next to the field on parameter dialog, which should
                  // stay open in this case => in this case, we must not resolve or reject the promise controlling the parameter dialog.
                  // In all other cases (e.g. other backend errors or user cancellation), the promise controlling the parameter dialog needs to be rejected to allow
                  // callers to react. (Example: If creation in backend after navigation to transient context fails, back navigation needs to be triggered)
                  // TODO: Refactor to separate dialog handling from backend request istead of taking decision based on message handling
                  if (showMessageDialog) {
                    if (oDialog.isOpen()) {
                      // do nothing, do not reject promise here
                      // We do not close the APM dialog if user enters a wrong value in of the fields that results in an error from the backend.
                      // The user can close the message dialog and the APM dialog would still be open on which he could enter a new value and trigger the action again.
                      // Earlier we were rejecting the promise on error here, and the call stack was destroyed as the promise was rejected and returned to EditFlow invoke action.
                      // But since the APM dialog was still open, a new promise was resolved in case the user retried the action and the object was created, but the navigation to object page was not taking place.
                    } else {
                      reject(oError);
                    }
                  }
                }
              } finally {
                if (strictHandlingUtilities) {
                  strictHandlingUtilities = {
                    is412Executed: false,
                    strictHandlingTransitionFails: [],
                    strictHandlingPromises: [],
                    strictHandlingWarningMessages: [],
                    delaySuccessMessages: [],
                    processedMessageIds: []
                  };
                }
                if (BusyLocker.isLocked(oDialog)) {
                  BusyLocker.unlock(oDialog);
                }
              }
            }
          }),
          endButton: new Button(generate(["fe", "APD_", sActionName, "Action", "Cancel"]), {
            text: CommonUtils.getTranslatedText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL", oResourceBundle),
            press: function () {
              // TODO: cancel button should just close the dialog (similar to using escape). All wrap up tasks should be moved to afterClose.
              oDialog.close();
              // reject(Constants.CancelActionDialog);
            }
          }),

          // TODO: beforeOpen is just an event, i.e. not waiting for the Promise to be resolved. Check if tasks of this function need to be done before opening the dialog
          // - if yes, they need to be moved outside.
          // Assumption: Sometimes dialog can be seen without any fields for a short time - maybe this is caused by this asynchronity
          beforeOpen: async function (oEvent) {
            // clone event for actionWrapper as oEvent.oSource gets lost during processing of beforeOpen event handler
            const oCloneEvent = Object.assign({}, oEvent);
            messageHandler.removeTransitionMessages();
            const getDefaultValuesFunction = function () {
              const oMetaModel = oDialog.getModel().getMetaModel(),
                sActionPath = oActionContext.sPath && oActionContext.sPath.split("/@")[0],
                sDefaultValuesFunction = oMetaModel.getObject(`${sActionPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`);
              return sDefaultValuesFunction;
            };
            const fnSetDefaultsAndOpenDialog = async function (sBindingParameter) {
              const sBoundFunctionName = getDefaultValuesFunction();
              const prefillParameter = async function (sParamName, vParamDefaultValue) {
                // Case 1: There is a ParameterDefaultValue annotation
                if (vParamDefaultValue !== undefined) {
                  if (aContexts.length > 0 && vParamDefaultValue.$Path) {
                    try {
                      let vParamValue = await CommonUtils.requestSingletonProperty(vParamDefaultValue.$Path, oOperationBinding.getModel());
                      if (vParamValue === null) {
                        vParamValue = await oOperationBinding.getParameterContext().requestProperty(vParamDefaultValue.$Path);
                      }
                      if (aContexts.length > 1) {
                        // For multi select, need to loop over aContexts (as contexts cannot be retrieved via binding parameter of the operation binding)
                        let sPathForContext = vParamDefaultValue.$Path;
                        if (sPathForContext.indexOf(`${sBindingParameter}/`) === 0) {
                          sPathForContext = sPathForContext.replace(`${sBindingParameter}/`, "");
                        }
                        for (let i = 1; i < aContexts.length; i++) {
                          if (aContexts[i].getProperty(sPathForContext) !== vParamValue) {
                            // if the values from the contexts are not all the same, do not prefill
                            return {
                              paramName: sParamName,
                              value: undefined,
                              bNoPossibleValue: true
                            };
                          }
                        }
                      }
                      return {
                        paramName: sParamName,
                        value: vParamValue
                      };
                    } catch (oError) {
                      Log.error("Error while reading default action parameter", sParamName, mParameters.actionName);
                      return {
                        paramName: sParamName,
                        value: undefined,
                        bLatePropertyError: true
                      };
                    }
                  } else {
                    // Case 1.2: ParameterDefaultValue defines a fixed string value (i.e. vParamDefaultValue = 'someString')
                    return {
                      paramName: sParamName,
                      value: vParamDefaultValue
                    };
                  }
                } else if (oParameterModel && oParameterModel.oData[sParamName]) {
                  // Case 2: There is no ParameterDefaultValue annotation (=> look into the FLP User Defaults)

                  return {
                    paramName: sParamName,
                    value: oParameterModel.oData[sParamName]
                  };
                } else {
                  return {
                    paramName: sParamName,
                    value: undefined
                  };
                }
              };
              const getParameterDefaultValue = function (sParamName) {
                const oMetaModel = oDialog.getModel().getMetaModel(),
                  sActionParameterAnnotationPath = CommonUtils.getParameterPath(oActionContext.getPath(), sParamName) + "@",
                  oParameterAnnotations = oMetaModel.getObject(sActionParameterAnnotationPath),
                  oParameterDefaultValue = oParameterAnnotations && oParameterAnnotations["@com.sap.vocabularies.UI.v1.ParameterDefaultValue"]; // either { $Path: 'somePath' } or 'someString'
                return oParameterDefaultValue;
              };
              const aCurrentParamDefaultValue = [];
              let sParamName, vParameterDefaultValue;
              for (const i in aActionParameters) {
                sParamName = aActionParameters[i].$Name;
                vParameterDefaultValue = getParameterDefaultValue(sParamName);
                aCurrentParamDefaultValue.push(prefillParameter(sParamName, vParameterDefaultValue));
              }
              if (oActionContext.getObject("$IsBound") && aContexts.length > 0) {
                if (sBoundFunctionName && sBoundFunctionName.length > 0 && typeof sBoundFunctionName === "string") {
                  for (const i in aContexts) {
                    aFunctionParams.push(callBoundFunction(sBoundFunctionName, aContexts[i], mParameters.model));
                  }
                }
              }
              const aPrefillParamPromises = Promise.all(aCurrentParamDefaultValue);
              let aExecFunctionPromises = Promise.resolve([]);
              let oExecFunctionFromManifestPromise;
              if (aFunctionParams && aFunctionParams.length > 0) {
                aExecFunctionPromises = Promise.all(aFunctionParams);
              }
              if (mParameters.defaultValuesExtensionFunction) {
                const sModule = mParameters.defaultValuesExtensionFunction.substring(0, mParameters.defaultValuesExtensionFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
                  sFunctionName = mParameters.defaultValuesExtensionFunction.substring(mParameters.defaultValuesExtensionFunction.lastIndexOf(".") + 1, mParameters.defaultValuesExtensionFunction.length);
                oExecFunctionFromManifestPromise = FPMHelper.actionWrapper(oCloneEvent, sModule, sFunctionName, {
                  contexts: aContexts
                });
              }
              try {
                const aPromises = await Promise.all([aPrefillParamPromises, aExecFunctionPromises, oExecFunctionFromManifestPromise]);
                const currentParamDefaultValue = aPromises[0];
                const functionParams = aPromises[1];
                const oFunctionParamsFromManifest = aPromises[2];
                let sDialogParamName;

                // Fill the dialog with the earlier determined parameter values from the different sources
                for (const i in aActionParameters) {
                  var _aParameterValues$fin2;
                  sDialogParamName = aActionParameters[i].$Name;
                  // Parameter values provided in the call of invokeAction overrule other sources
                  const vParameterProvidedValue = aParameterValues === null || aParameterValues === void 0 ? void 0 : (_aParameterValues$fin2 = aParameterValues.find(element => element.name === aActionParameters[i].$Name)) === null || _aParameterValues$fin2 === void 0 ? void 0 : _aParameterValues$fin2.value;
                  if (vParameterProvidedValue) {
                    oOperationBinding.setParameter(aActionParameters[i].$Name, vParameterProvidedValue);
                  } else if (oFunctionParamsFromManifest && oFunctionParamsFromManifest.hasOwnProperty(sDialogParamName)) {
                    oOperationBinding.setParameter(aActionParameters[i].$Name, oFunctionParamsFromManifest[sDialogParamName]);
                  } else if (currentParamDefaultValue[i] && currentParamDefaultValue[i].value !== undefined) {
                    oOperationBinding.setParameter(aActionParameters[i].$Name, currentParamDefaultValue[i].value);
                    // if the default value had not been previously determined due to different contexts, we do nothing else
                  } else if (sBoundFunctionName && !currentParamDefaultValue[i].bNoPossibleValue) {
                    if (aContexts.length > 1) {
                      // we check if the function retrieves the same param value for all the contexts:
                      let j = 0;
                      while (j < aContexts.length - 1) {
                        if (functionParams[j] && functionParams[j + 1] && functionParams[j].getObject(sDialogParamName) === functionParams[j + 1].getObject(sDialogParamName)) {
                          j++;
                        } else {
                          break;
                        }
                      }
                      //param values are all the same:
                      if (j === aContexts.length - 1) {
                        oOperationBinding.setParameter(aActionParameters[i].$Name, functionParams[j].getObject(sDialogParamName));
                      }
                    } else if (functionParams[0] && functionParams[0].getObject(sDialogParamName)) {
                      //Only one context, then the default param values are to be verified from the function:

                      oOperationBinding.setParameter(aActionParameters[i].$Name, functionParams[0].getObject(sDialogParamName));
                    }
                  }
                }
                const bErrorFound = currentParamDefaultValue.some(function (oValue) {
                  if (oValue.bLatePropertyError) {
                    return oValue.bLatePropertyError;
                  }
                });
                // If at least one Default Property is a Late Property and an eTag error was raised.
                if (bErrorFound) {
                  const sText = CommonUtils.getTranslatedText("C_APP_COMPONENT_SAPFE_ETAG_LATE_PROPERTY", oResourceBundle);
                  MessageBox.warning(sText, {
                    contentWidth: "25em"
                  });
                }
              } catch (oError) {
                Log.error("Error while retrieving the parameter", oError);
              }
            };
            const fnAsyncBeforeOpen = async function () {
              if (oActionContext.getObject("$IsBound") && aContexts.length > 0) {
                const aParameters = oActionContext.getObject("$Parameter");
                const sBindingParameter = aParameters[0] && aParameters[0].$Name;
                try {
                  const oContextObject = await aContexts[0].requestObject();
                  if (oContextObject) {
                    oOperationBinding.setParameter(sBindingParameter, oContextObject);
                  }
                  await fnSetDefaultsAndOpenDialog(sBindingParameter);
                } catch (oError) {
                  Log.error("Error while retrieving the parameter", oError);
                }
              } else {
                await fnSetDefaultsAndOpenDialog();
              }
            };
            await fnAsyncBeforeOpen();

            // adding defaulted values only here after they are not set to the fields
            for (const actionParameterInfo of actionParameterInfos) {
              const value = actionParameterInfo.isMultiValue ? actionParameterInfo.field.getItems() : actionParameterInfo.field.getValue();
              actionParameterInfo.value = value;
              actionParameterInfo.validationPromise = Promise.resolve(value);
            }
          },
          afterClose: function () {
            // when the dialog is cancelled, messages need to be removed in case the same action should be executed again
            aActionParameters.forEach(_removeMessagesForActionParamter);
            oDialog.destroy();
            if (actionResult.dialogCancelled) {
              reject(Constants.CancelActionDialog);
            } else {
              resolve(actionResult.result);
            }
          }
        });
        mParameters.oDialog = oDialog;
        oDialog.setModel(oActionContext.getModel().oModel);
        oDialog.setModel(oParameterModel, "paramsModel");
        oDialog.bindElement({
          path: "/",
          model: "paramsModel"
        });

        // empty model to add elements dynamically depending on number of MVF fields defined on the dialog
        const oMVFModel = new JSONModel({});
        oDialog.setModel(oMVFModel, "mvfview");

        /* Event needed for removing messages of valid changed field */
        for (const actionParameterInfo of actionParameterInfos) {
          if (actionParameterInfo.isMultiValue) {
            var _actionParameterInfo$2, _actionParameterInfo$3;
            actionParameterInfo === null || actionParameterInfo === void 0 ? void 0 : (_actionParameterInfo$2 = actionParameterInfo.field) === null || _actionParameterInfo$2 === void 0 ? void 0 : (_actionParameterInfo$3 = _actionParameterInfo$2.getBinding("items")) === null || _actionParameterInfo$3 === void 0 ? void 0 : _actionParameterInfo$3.attachChange(() => {
              _removeMessagesForActionParamter(actionParameterInfo.parameter);
            });
          } else {
            var _actionParameterInfo$4, _actionParameterInfo$5;
            actionParameterInfo === null || actionParameterInfo === void 0 ? void 0 : (_actionParameterInfo$4 = actionParameterInfo.field) === null || _actionParameterInfo$4 === void 0 ? void 0 : (_actionParameterInfo$5 = _actionParameterInfo$4.getBinding("value")) === null || _actionParameterInfo$5 === void 0 ? void 0 : _actionParameterInfo$5.attachChange(() => {
              _removeMessagesForActionParamter(actionParameterInfo.parameter);
            });
          }
        }
        let sActionPath = `${sActionName}(...)`;
        if (!aContexts.length) {
          sActionPath = `/${sActionPath}`;
        }
        oDialog.bindElement({
          path: sActionPath
        });
        if (oParentControl) {
          // if there is a parent control specified add the dialog as dependent
          oParentControl.addDependent(oDialog);
        }
        if (aContexts.length > 0) {
          oDialog.setBindingContext(aContexts[0]); // use context of first selected line item
        }

        oOperationBinding = oDialog.getObjectBinding();
        oDialog.open();
      } catch (oError) {
        reject(oError);
      }
    });
  }
  function getActionParameters(oAction) {
    const aParameters = oAction.getObject("$Parameter") || [];
    if (aParameters && aParameters.length) {
      if (oAction.getObject("$IsBound")) {
        //in case of bound actions, ignore the first parameter and consider the rest
        return aParameters.slice(1, aParameters.length) || [];
      }
    }
    return aParameters;
  }
  function getIsActionCritical(oMetaModel, sPath, contexts, oBoundAction) {
    const vActionCritical = oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Common.v1.IsActionCritical`);
    let sCriticalPath = vActionCritical && vActionCritical.$Path;
    if (!sCriticalPath) {
      // the static value scenario for isActionCritical
      return !!vActionCritical;
    }
    const aBindingParams = oBoundAction && oBoundAction.getObject("$Parameter"),
      aPaths = sCriticalPath && sCriticalPath.split("/"),
      bCondition = aBindingParams && aBindingParams.length && typeof aBindingParams === "object" && sCriticalPath && contexts && contexts.length;
    if (bCondition) {
      //in case binding patameters are there in path need to remove eg: - _it/isVerified => need to remove _it and the path should be isVerified
      aBindingParams.filter(function (oParams) {
        const index = aPaths && aPaths.indexOf(oParams.$Name);
        if (index > -1) {
          aPaths.splice(index, 1);
        }
      });
      sCriticalPath = aPaths.join("/");
      return contexts[0].getObject(sCriticalPath);
    } else if (sCriticalPath) {
      //if scenario is path based return the path value
      return contexts[0].getObject(sCriticalPath);
    }
  }
  function _getActionParameterActionName(oResourceBundle, sActionLabel, sActionName, sEntitySetName) {
    let boundActionName = sActionName ? sActionName : null;
    const aActionName = boundActionName.split(".");
    boundActionName = boundActionName.indexOf(".") >= 0 ? aActionName[aActionName.length - 1] : boundActionName;
    const suffixResourceKey = boundActionName && sEntitySetName ? `${sEntitySetName}|${boundActionName}` : "";
    const sKey = "ACTION_PARAMETER_DIALOG_ACTION_NAME";
    const bResourceKeyExists = oResourceBundle && CommonUtils.checkIfResourceKeyExists(oResourceBundle.aCustomBundles, `${sKey}|${suffixResourceKey}`);
    if (sActionLabel) {
      if (bResourceKeyExists) {
        return CommonUtils.getTranslatedText(sKey, oResourceBundle, undefined, suffixResourceKey);
      } else if (oResourceBundle && CommonUtils.checkIfResourceKeyExists(oResourceBundle.aCustomBundles, `${sKey}|${sEntitySetName}`)) {
        return CommonUtils.getTranslatedText(sKey, oResourceBundle, undefined, `${sEntitySetName}`);
      } else if (oResourceBundle && CommonUtils.checkIfResourceKeyExists(oResourceBundle.aCustomBundles, `${sKey}`)) {
        return CommonUtils.getTranslatedText(sKey, oResourceBundle);
      } else {
        return sActionLabel;
      }
    } else {
      return CommonUtils.getTranslatedText("C_COMMON_DIALOG_OK", oResourceBundle);
    }
  }
  function handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle, strictHandlingUtilities) {
    let strictHandlingFails;
    const messages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
    const transitionMessages = messages.filter(function (message) {
      const isDuplicate = strictHandlingUtilities.processedMessageIds.find(function (id) {
        return message.id === id;
      });
      if (!isDuplicate) {
        strictHandlingUtilities.processedMessageIds.push(message.id);
        if (message.type === MessageType.Success) {
          strictHandlingUtilities.delaySuccessMessages.push(message);
        }
      }
      return message.persistent === true && message.type !== MessageType.Success && !isDuplicate;
    });
    if (transitionMessages.length) {
      if (mParameters.internalModelContext) {
        strictHandlingFails = strictHandlingUtilities.strictHandlingTransitionFails;
        strictHandlingFails.push({
          oAction: oAction,
          groupId: sGroupId
        });
        strictHandlingUtilities.strictHandlingTransitionFails = strictHandlingFails;
      }
    }
    if (current_context_index === iContextLength && strictHandlingUtilities && strictHandlingUtilities.strictHandlingWarningMessages.length) {
      operationsHelper.renderMessageView(mParameters, oResourceBundle, messageHandler, strictHandlingUtilities.strictHandlingWarningMessages, strictHandlingUtilities, true);
    }
  }
  function executeDependingOnSelectedContexts(oAction, mParameters, bGetBoundContext, sGroupId, oResourceBundle, messageHandler, iContextLength, current_context_index, strictHandlingUtilities) {
    let oActionPromise,
      bEnableStrictHandling = true;
    if (bGetBoundContext) {
      var _oProperty$;
      const sPath = oAction.getBoundContext().getPath();
      const sMetaPath = oAction.getModel().getMetaModel().getMetaPath(sPath);
      const oProperty = oAction.getModel().getMetaModel().getObject(sMetaPath);
      if (oProperty && ((_oProperty$ = oProperty[0]) === null || _oProperty$ === void 0 ? void 0 : _oProperty$.$kind) !== "Action") {
        //do not enable the strict handling if its not an action
        bEnableStrictHandling = false;
      }
    }
    if (!bEnableStrictHandling) {
      oActionPromise = bGetBoundContext ? oAction.execute(sGroupId).then(function () {
        return oAction.getBoundContext();
      }) : oAction.execute(sGroupId);
    } else {
      oActionPromise = bGetBoundContext ? oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, mParameters, oResourceBundle, current_context_index, oAction.getContext(), iContextLength, messageHandler, strictHandlingUtilities)).then(function () {
        if (strictHandlingUtilities) {
          handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle, strictHandlingUtilities);
        }
        return Promise.resolve(oAction.getBoundContext());
      }).catch(function () {
        if (strictHandlingUtilities) {
          handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle, strictHandlingUtilities);
        }
        return Promise.reject();
      }) : oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, mParameters, oResourceBundle, current_context_index, oAction.getContext(), iContextLength, messageHandler, strictHandlingUtilities)).then(function (result) {
        if (strictHandlingUtilities) {
          handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle, strictHandlingUtilities);
        }
        return Promise.resolve(result);
      }).catch(function () {
        if (strictHandlingUtilities) {
          handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle, strictHandlingUtilities);
        }
        return Promise.reject();
      });
    }
    return oActionPromise.catch(() => {
      throw Constants.ActionExecutionFailed;
    });
  }
  function _executeAction(oAppComponent, mParameters, oParentControl, messageHandler, strictHandlingUtilities) {
    const aContexts = mParameters.aContexts || [];
    const oModel = mParameters.model;
    const aActionParameters = mParameters.aActionParameters || [];
    const sActionName = mParameters.actionName;
    const fnOnSubmitted = mParameters.fnOnSubmitted;
    const fnOnResponse = mParameters.fnOnResponse;
    const oResourceBundle = oParentControl && oParentControl.isA("sap.ui.core.mvc.View") && oParentControl.getController().oResourceBundle;
    let oAction;
    function setActionParameterDefaultValue() {
      if (aActionParameters && aActionParameters.length) {
        for (let j = 0; j < aActionParameters.length; j++) {
          if (!aActionParameters[j].value) {
            switch (aActionParameters[j].$Type) {
              case "Edm.String":
                aActionParameters[j].value = "";
                break;
              case "Edm.Boolean":
                aActionParameters[j].value = false;
                break;
              case "Edm.Byte":
              case "Edm.Int16":
              case "Edm.Int32":
              case "Edm.Int64":
                aActionParameters[j].value = 0;
                break;
              // tbc
              default:
                break;
            }
          }
          oAction.setParameter(aActionParameters[j].$Name, aActionParameters[j].value);
        }
      }
    }
    if (aContexts.length) {
      // TODO: refactor to direct use of Promise.allSettled
      return new Promise(function (resolve) {
        const mBindingParameters = mParameters.mBindingParameters;
        const bGrouped = mParameters.bGrouped;
        const bGetBoundContext = mParameters.bGetBoundContext;
        const aActionPromises = [];
        let oActionPromise;
        let i;
        let sGroupId;
        const fnExecuteAction = function (actionContext, current_context_index, oSideEffect, iContextLength) {
          setActionParameterDefaultValue();
          // For invocation grouping "isolated" need batch group per action call
          sGroupId = !bGrouped ? `$auto.${current_context_index}` : actionContext.getUpdateGroupId();
          mParameters.requestSideEffects = fnRequestSideEffects.bind(operations, oAppComponent, oSideEffect, mParameters);
          oActionPromise = executeDependingOnSelectedContexts(actionContext, mParameters, bGetBoundContext, sGroupId, oResourceBundle, messageHandler, iContextLength, current_context_index, strictHandlingUtilities);
          aActionPromises.push(oActionPromise);
          fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId);
        };
        const fnExecuteSingleAction = function (actionContext, current_context_index, oSideEffect, iContextLength) {
          const aLocalPromise = [];
          setActionParameterDefaultValue();
          // For invocation grouping "isolated" need batch group per action call
          sGroupId = `apiMode${current_context_index}`;
          mParameters.requestSideEffects = fnRequestSideEffects.bind(operations, oAppComponent, oSideEffect, mParameters, sGroupId, aLocalPromise);
          oActionPromise = executeDependingOnSelectedContexts(actionContext, mParameters, bGetBoundContext, sGroupId, oResourceBundle, messageHandler, iContextLength, current_context_index, strictHandlingUtilities);
          aActionPromises.push(oActionPromise);
          aLocalPromise.push(oActionPromise);
          fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, aLocalPromise);
          oModel.submitBatch(sGroupId);
          return Promise.allSettled(aLocalPromise);
        };
        async function fnExecuteSequentially(contextsToExecute) {
          // One action and its side effects are completed before the next action is executed
          (fnOnSubmitted || function noop() {
            /**/
          })(aActionPromises);
          function processOneAction(context, actionIndex, iContextLength) {
            oAction = oModel.bindContext(`${sActionName}(...)`, context, mBindingParameters);
            return fnExecuteSingleAction(oAction, actionIndex, {
              context: context,
              pathExpressions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions,
              triggerActions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.triggerActions
            }, iContextLength);
          }

          // serialization: processOneAction to be called for each entry in contextsToExecute only after the promise returned from the one before has been resolved
          await contextsToExecute.reduce(async (promise, context, id) => {
            await promise;
            await processOneAction(context, id + 1, aContexts.length);
          }, Promise.resolve());
          fnHandleResults();
        }
        if (!bGrouped) {
          // For invocation grouping "isolated", ensure that each action and matching side effects
          // are processed before the next set is submitted. Workaround until JSON batch is available.
          // Allow also for List Report.
          fnExecuteSequentially(aContexts);
        } else {
          for (i = 0; i < aContexts.length; i++) {
            oAction = oModel.bindContext(`${sActionName}(...)`, aContexts[i], mBindingParameters);
            fnExecuteAction(oAction, aContexts.length <= 1 ? null : i, {
              context: aContexts[i],
              pathExpressions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions,
              triggerActions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.triggerActions
            }, aContexts.length);
          }
          (fnOnSubmitted || function noop() {
            /**/
          })(aActionPromises);
          fnHandleResults();
        }
        function fnHandleResults() {
          // Promise.allSettled will never be rejected. However, eslint requires either catch or return - thus we return the resulting Promise although no one will use it.
          return Promise.allSettled(aActionPromises).then(resolve);
        }
      }).finally(function () {
        (fnOnResponse || function noop() {
          /**/
        })();
      });
    } else {
      oAction = oModel.bindContext(`/${sActionName}(...)`);
      setActionParameterDefaultValue();
      const sGroupId = "actionImport";
      const oActionPromise = oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, {
        label: mParameters.label,
        model: oModel
      }, oResourceBundle, null, null, null, messageHandler, strictHandlingUtilities));
      oModel.submitBatch(sGroupId);
      // trigger onSubmitted "event"
      (fnOnSubmitted || function noop() {
        /**/
      })(oActionPromise);
      return oActionPromise.then(function (currentPromiseValue) {
        // Here we ensure that we return the response we got from an unbound action to the
        // caller BCP : 2270139279
        if (currentPromiseValue) {
          return currentPromiseValue;
        } else {
          var _oAction$getBoundCont, _oAction, _oAction$getBoundCont2;
          return (_oAction$getBoundCont = (_oAction = oAction).getBoundContext) === null || _oAction$getBoundCont === void 0 ? void 0 : (_oAction$getBoundCont2 = _oAction$getBoundCont.call(_oAction)) === null || _oAction$getBoundCont2 === void 0 ? void 0 : _oAction$getBoundCont2.getObject();
        }
      }).catch(function (oError) {
        Log.error("Error while executing action " + sActionName, oError);
        throw oError;
      }).finally(function () {
        (fnOnResponse || function noop() {
          /**/
        })();
      });
    }
  }
  function _getPath(oActionContext, sActionName) {
    let sPath = oActionContext.getPath();
    sPath = oActionContext.getObject("$IsBound") ? sPath.split("@$ui5.overload")[0] : sPath.split("/0")[0];
    return sPath.split(`/${sActionName}`)[0];
  }
  function _valuesProvidedForAllParameters(isCreateAction, actionParameters, parameterValues, startupParameters) {
    if (parameterValues) {
      // If showDialog is false but there are parameters from the invokeAction call, we need to check that values have been
      // provided for all of them
      for (const actionParameter of actionParameters) {
        if (actionParameter.$Name !== "ResultIsActiveEntity" && !(parameterValues !== null && parameterValues !== void 0 && parameterValues.find(element => element.name === actionParameter.$Name))) {
          // At least for one parameter no value has been provided, so we can't skip the dialog
          return false;
        }
      }
    } else if (isCreateAction && startupParameters) {
      // If parameters have been provided during application launch, we need to check if the set is complete
      // If not, the parameter dialog still needs to be shown.
      for (const actionParameter of actionParameters) {
        if (!startupParameters[actionParameter.$Name]) {
          // At least for one parameter no value has been provided, so we can't skip the dialog
          return false;
        }
      }
    }
    return true;
  }
  function fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, aLocalPromise) {
    const oSideEffectsService = oAppComponent.getSideEffectsService();
    let oLocalPromise;
    // trigger actions from side effects
    if (oSideEffect && oSideEffect.triggerActions && oSideEffect.triggerActions.length) {
      oSideEffect.triggerActions.forEach(function (sTriggerAction) {
        if (sTriggerAction) {
          oLocalPromise = oSideEffectsService.executeAction(sTriggerAction, oSideEffect.context, sGroupId);
          if (aLocalPromise) {
            aLocalPromise.push(oLocalPromise);
          }
        }
      });
    }
    // request side effects for this action
    // as we move the messages request to POST $select we need to be prepared for an empty array
    if (oSideEffect && oSideEffect.pathExpressions && oSideEffect.pathExpressions.length > 0) {
      oLocalPromise = oSideEffectsService.requestSideEffects(oSideEffect.pathExpressions, oSideEffect.context, sGroupId);
      if (aLocalPromise) {
        aLocalPromise.push(oLocalPromise);
      }
      oLocalPromise.then(function () {
        if (mParameters.operationAvailableMap && mParameters.internalModelContext) {
          ActionRuntime.setActionEnablement(mParameters.internalModelContext, JSON.parse(mParameters.operationAvailableMap), mParameters.selectedItems, "table");
        }
      }).catch(function (oError) {
        Log.error("Error while requesting side effects", oError);
      });
    }
  }

  /**
   * Static functions to call OData actions (bound/import) and functions (bound/import)
   *
   * @namespace
   * @alias sap.fe.core.actions.operations
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.56.0
   */
  const operations = {
    callBoundAction: callBoundAction,
    callActionImport: callActionImport,
    callBoundFunction: callBoundFunction,
    callFunctionImport: callFunctionImport,
    executeDependingOnSelectedContexts: executeDependingOnSelectedContexts,
    valuesProvidedForAllParameters: _valuesProvidedForAllParameters,
    getActionParameterActionName: _getActionParameterActionName,
    actionParameterShowMessageCallback: actionParameterShowMessageCallback,
    afterActionResolution: afterActionResolution
  };
  return operations;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25zdGFudHMiLCJGRUxpYnJhcnkiLCJJbnZvY2F0aW9uR3JvdXBpbmciLCJBY3Rpb24iLCJNZXNzYWdlQm94IiwiY2FsbEJvdW5kQWN0aW9uIiwic0FjdGlvbk5hbWUiLCJjb250ZXh0cyIsIm9Nb2RlbCIsIm9BcHBDb21wb25lbnQiLCJtUGFyYW1ldGVycyIsInN0cmljdEhhbmRsaW5nVXRpbGl0aWVzIiwiaXM0MTJFeGVjdXRlZCIsInN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzIiwic3RyaWN0SGFuZGxpbmdQcm9taXNlcyIsInN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzIiwiZGVsYXlTdWNjZXNzTWVzc2FnZXMiLCJwcm9jZXNzZWRNZXNzYWdlSWRzIiwibGVuZ3RoIiwiUHJvbWlzZSIsInJlamVjdCIsImlzQ2FsbGVkV2l0aEFycmF5IiwiQXJyYXkiLCJpc0FycmF5IiwiYUNvbnRleHRzIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInNBY3Rpb25QYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwib0JvdW5kQWN0aW9uIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJpc0NyaXRpY2FsQWN0aW9uIiwiZ2V0SXNBY3Rpb25Dcml0aWNhbCIsImV4dHJhY3RTaW5nbGVSZXN1bHQiLCJyZXN1bHQiLCJzdGF0dXMiLCJ2YWx1ZSIsInJlYXNvbiIsImNhbGxBY3Rpb24iLCJ0aGVuIiwiY2FsbEFjdGlvbkltcG9ydCIsImJpbmRDb250ZXh0Iiwib0FjdGlvbkltcG9ydCIsImdldE9iamVjdCIsImNhbGxCb3VuZEZ1bmN0aW9uIiwic0Z1bmN0aW9uTmFtZSIsImNvbnRleHQiLCJzRnVuY3Rpb25QYXRoIiwib0JvdW5kRnVuY3Rpb24iLCJfZXhlY3V0ZUZ1bmN0aW9uIiwiY2FsbEZ1bmN0aW9uSW1wb3J0IiwicmVzb2x2ZSIsIm9GdW5jdGlvbkltcG9ydCIsIm9GdW5jdGlvbiIsInNHcm91cElkIiwiRXJyb3IiLCJvRnVuY3Rpb25Qcm9taXNlIiwiZXhlY3V0ZSIsInN1Ym1pdEJhdGNoIiwiZ2V0Qm91bmRDb250ZXh0Iiwib0FjdGlvbiIsIm1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzIiwiZm5EaWFsb2ciLCJvQWN0aW9uUHJvbWlzZSIsInNBY3Rpb25MYWJlbCIsImxhYmVsIiwiYlNraXBQYXJhbWV0ZXJEaWFsb2ciLCJza2lwUGFyYW1ldGVyRGlhbG9nIiwiYklzQ3JlYXRlQWN0aW9uIiwiYklzQ3JpdGljYWxBY3Rpb24iLCJzTWV0YVBhdGgiLCJzTWVzc2FnZXNQYXRoIiwiaU1lc3NhZ2VTaWRlRWZmZWN0IiwiYklzU2FtZUVudGl0eSIsIm9SZXR1cm5UeXBlIiwiYlZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyIsImFjdGlvbkRlZmluaXRpb24iLCJhQWN0aW9uUGFyYW1ldGVycyIsImdldEFjdGlvblBhcmFtZXRlcnMiLCJiQWN0aW9uTmVlZHNQYXJhbWV0ZXJEaWFsb2ciLCIkTmFtZSIsImFQYXJhbWV0ZXJWYWx1ZXMiLCJwYXJhbWV0ZXJWYWx1ZXMiLCJvQ29tcG9uZW50RGF0YSIsImdldENvbXBvbmVudERhdGEiLCJvU3RhcnR1cFBhcmFtZXRlcnMiLCJzdGFydHVwUGFyYW1ldGVycyIsIl92YWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnMiLCJzaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nIiwiY29uZmlybUNyaXRpY2FsQWN0aW9uIiwiZm5PblN1Ym1pdHRlZCIsIm9uU3VibWl0dGVkIiwiZm5PblJlc3BvbnNlIiwib25SZXNwb25zZSIsImFjdGlvbk5hbWUiLCJtb2RlbCIsImJHZXRCb3VuZENvbnRleHQiLCJkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24iLCJzZWxlY3RlZEl0ZW1zIiwiYWRkaXRpb25hbFNpZGVFZmZlY3QiLCJwYXRoRXhwcmVzc2lvbnMiLCJmaW5kSW5kZXgiLCJleHAiLCIkaXNDb2xsZWN0aW9uIiwiZ2V0TW9kZWwiLCIkVHlwZSIsIm1CaW5kaW5nUGFyYW1ldGVycyIsIiRzZWxlY3QiLCJzcGxpdCIsImluZGV4T2YiLCJwdXNoIiwidHJpZ2dlckFjdGlvbnMiLCJzcGxpY2UiLCJiR3JvdXBlZCIsImludm9jYXRpb25Hcm91cGluZyIsIkNoYW5nZVNldCIsImludGVybmFsTW9kZWxDb250ZXh0Iiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiaXNDcmVhdGVBY3Rpb24iLCJiT2JqZWN0UGFnZSIsImNvbnRyb2xJZCIsImNvbnRyb2wiLCJwYXJlbnRDb250cm9sIiwiYnlJZCIsImlzU3RhdGljIiwiJFBhcmFtZXRlciIsInNvbWUiLCJhUGFyYW1ldGVyIiwiJEVudGl0eVNldFBhdGgiLCIkSXNCb3VuZCIsImVudGl0eVNldE5hbWUiLCJtZXNzYWdlSGFuZGxlciIsIm9PcGVyYXRpb25SZXN1bHQiLCJhZnRlckFjdGlvblJlc29sdXRpb24iLCJjYXRjaCIsImkiLCJmaW5kIiwiZWxlbWVudCIsIm5hbWUiLCJfZXhlY3V0ZUFjdGlvbiIsIm1lc3NhZ2VzIiwiQ29yZSIsImdldE1lc3NhZ2VNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsImNvbmNhdCIsInN0cmljdEhhbmRsaW5nRmFpbHMiLCJhRmFpbGVkQ29udGV4dHMiLCJmb3JFYWNoIiwiZmFpbCIsImdldENvbnRleHQiLCJvRmFpbGVkT3BlcmF0aW9uUmVzdWx0IiwiYWRkTWVzc2FnZXMiLCJzaG93TWVzc2FnZURpYWxvZyIsIm9BY3Rpb25Db250ZXh0Iiwib1BhcmVudENvbnRyb2wiLCJib3VuZEFjdGlvbk5hbWUiLCJzdWZmaXhSZXNvdXJjZUtleSIsIm9SZXNvdXJjZUJ1bmRsZSIsImdldENvbnRyb2xsZXIiLCJzQ29uZmlybWF0aW9uVGV4dCIsIkNvbW1vblV0aWxzIiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJ1bmRlZmluZWQiLCJjb25maXJtIiwib25DbG9zZSIsInNBY3Rpb24iLCJPSyIsIm9PcGVyYXRpb24iLCJvRXJyb3IiLCJlIiwiZXhlY3V0ZUFQTUFjdGlvbiIsIm9EaWFsb2ciLCJhZnRlcjQxMiIsImFSZXN1bHQiLCJvU2luZ2xlUmVzdWx0Iiwib25CZWZvcmVTaG93TWVzc2FnZSIsImFNZXNzYWdlcyIsInNob3dNZXNzYWdlUGFyYW1ldGVyc0luIiwiYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayIsImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3BlbiIsImlzT3BlbiIsIkFjdGlvblJ1bnRpbWUiLCJzZXRBY3Rpb25FbmFibGVtZW50IiwiSlNPTiIsInBhcnNlIiwib0NvbnRyb2wiLCJpc0EiLCJhU2VsZWN0ZWRDb250ZXh0cyIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJzaG93TWVzc2FnZUJveCIsInVuYm91bmRNZXNzYWdlcyIsImZpbHRlciIsIm1lc3NhZ2UiLCJnZXRUYXJnZXQiLCJBUERtZXNzYWdlcyIsImFjdGlvblBhcmFtIiwiQVBETWVzc2FnZSIsImlzQVBEVGFyZ2V0IiwiZXJyb3JUYXJnZXRzSW5BUEQiLCJjbG9zZSIsImRlc3Ryb3kiLCJmaWx0ZXJlZE1lc3NhZ2VzIiwiYklzQVBET3BlbiIsImdldFByb3BlcnR5IiwiZm5HZXRNZXNzYWdlU3VidGl0bGUiLCJtZXNzYWdlSGFuZGxpbmciLCJzZXRNZXNzYWdlU3VidGl0bGUiLCJiaW5kIiwic1BhdGgiLCJfZ2V0UGF0aCIsIm1ldGFNb2RlbCIsImVudGl0eVNldENvbnRleHQiLCJzQWN0aW9uTmFtZVBhdGgiLCJhY3Rpb25OYW1lQ29udGV4dCIsInNGcmFnbWVudE5hbWUiLCJhY3Rpb25QYXJhbWV0ZXJJbmZvcyIsIm1lc3NhZ2VNYW5hZ2VyIiwiX2FkZE1lc3NhZ2VGb3JBY3Rpb25QYXJhbWV0ZXIiLCJtZXNzYWdlUGFyYW1ldGVycyIsIm1hcCIsIm1lc3NhZ2VQYXJhbWV0ZXIiLCJiaW5kaW5nIiwiYWN0aW9uUGFyYW1ldGVySW5mbyIsImZpZWxkIiwiZ2V0QmluZGluZyIsImlzTXVsdGlWYWx1ZSIsIk1lc3NhZ2UiLCJ0eXBlIiwicHJvY2Vzc29yIiwicGVyc2lzdGVudCIsInRhcmdldCIsImdldFJlc29sdmVkUGF0aCIsIl9yZW1vdmVNZXNzYWdlc0ZvckFjdGlvblBhcmFtdGVyIiwicGFyYW1ldGVyIiwiYWxsTWVzc2FnZXMiLCJnZW5lcmF0ZSIsInJlbGV2YW50TWVzc2FnZXMiLCJtc2ciLCJnZXRDb250cm9sSWRzIiwiaWQiLCJpbmNsdWRlcyIsInJlbW92ZU1lc3NhZ2VzIiwiX3ZhbGlkYXRlUHJvcGVydGllcyIsInJlcXVpcmVkUGFyYW1ldGVySW5mb3MiLCJnZXRSZXF1aXJlZCIsImFsbFNldHRsZWQiLCJ2YWxpZGF0aW9uUHJvbWlzZSIsImVtcHR5UmVxdWlyZWRGaWVsZHMiLCJyZXF1aXJlZFBhcmFtZXRlckluZm8iLCJmaWVsZFZhbHVlIiwiZ2V0VmFsdWUiLCJnZXRQYXJlbnQiLCJnZXRBZ2dyZWdhdGlvbiIsImdldFRleHQiLCJmaXJzdEludmFsaWRBY3Rpb25QYXJhbWV0ZXIiLCJnZXRWYWx1ZVN0YXRlIiwiZm9jdXMiLCJvQ29udHJvbGxlciIsImhhbmRsZUNoYW5nZSIsIm9FdmVudCIsImdldFNvdXJjZSIsImdldFBhcmFtZXRlciIsImVycm9yIiwib0ZyYWdtZW50IiwiWE1MVGVtcGxhdGVQcm9jZXNzb3IiLCJsb2FkVGVtcGxhdGUiLCJvUGFyYW1ldGVyTW9kZWwiLCJKU09OTW9kZWwiLCIkZGlzcGxheU1vZGUiLCJjcmVhdGVkRnJhZ21lbnQiLCJYTUxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwiYmluZGluZ0NvbnRleHRzIiwiYWN0aW9uIiwiZW50aXR5U2V0IiwibW9kZWxzIiwiYUZ1bmN0aW9uUGFyYW1zIiwib09wZXJhdGlvbkJpbmRpbmciLCJzZXRVc2VyRGVmYXVsdHMiLCJvRGlhbG9nQ29udGVudCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwiYWN0aW9uUGFyYW1ldGVyIiwiYWN0aW9uUmVzdWx0IiwiZGlhbG9nQ2FuY2VsbGVkIiwiRGlhbG9nIiwidGl0bGUiLCJjb250ZW50IiwiZXNjYXBlSGFuZGxlciIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwidGV4dCIsIl9nZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lIiwicHJlc3MiLCJCdXN5TG9ja2VyIiwibG9jayIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsInZQYXJhbWV0ZXJWYWx1ZSIsIm9QYXJhbWV0ZXJDb250ZXh0IiwiZ2V0UGFyYW1ldGVyQ29udGV4dCIsImFNVkZDb250ZW50IiwiYUtleVZhbHVlcyIsImoiLCJLZXkiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJpc0xvY2tlZCIsInVubG9jayIsInNob3dNZXNzYWdlcyIsIm1lc3NhZ2VQYWdlTmF2aWdhdGlvbkNhbGxiYWNrIiwic2hvd01lc3NhZ2VQYXJhbWV0ZXJzIiwiZW5kQnV0dG9uIiwiYmVmb3JlT3BlbiIsIm9DbG9uZUV2ZW50IiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0RGVmYXVsdFZhbHVlc0Z1bmN0aW9uIiwic0RlZmF1bHRWYWx1ZXNGdW5jdGlvbiIsImZuU2V0RGVmYXVsdHNBbmRPcGVuRGlhbG9nIiwic0JpbmRpbmdQYXJhbWV0ZXIiLCJzQm91bmRGdW5jdGlvbk5hbWUiLCJwcmVmaWxsUGFyYW1ldGVyIiwic1BhcmFtTmFtZSIsInZQYXJhbURlZmF1bHRWYWx1ZSIsIiRQYXRoIiwidlBhcmFtVmFsdWUiLCJyZXF1ZXN0U2luZ2xldG9uUHJvcGVydHkiLCJyZXF1ZXN0UHJvcGVydHkiLCJzUGF0aEZvckNvbnRleHQiLCJyZXBsYWNlIiwicGFyYW1OYW1lIiwiYk5vUG9zc2libGVWYWx1ZSIsIkxvZyIsImJMYXRlUHJvcGVydHlFcnJvciIsIm9EYXRhIiwiZ2V0UGFyYW1ldGVyRGVmYXVsdFZhbHVlIiwic0FjdGlvblBhcmFtZXRlckFubm90YXRpb25QYXRoIiwiZ2V0UGFyYW1ldGVyUGF0aCIsIm9QYXJhbWV0ZXJBbm5vdGF0aW9ucyIsIm9QYXJhbWV0ZXJEZWZhdWx0VmFsdWUiLCJhQ3VycmVudFBhcmFtRGVmYXVsdFZhbHVlIiwidlBhcmFtZXRlckRlZmF1bHRWYWx1ZSIsImFQcmVmaWxsUGFyYW1Qcm9taXNlcyIsImFsbCIsImFFeGVjRnVuY3Rpb25Qcm9taXNlcyIsIm9FeGVjRnVuY3Rpb25Gcm9tTWFuaWZlc3RQcm9taXNlIiwic01vZHVsZSIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiRlBNSGVscGVyIiwiYWN0aW9uV3JhcHBlciIsImFQcm9taXNlcyIsImN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZSIsImZ1bmN0aW9uUGFyYW1zIiwib0Z1bmN0aW9uUGFyYW1zRnJvbU1hbmlmZXN0Iiwic0RpYWxvZ1BhcmFtTmFtZSIsInZQYXJhbWV0ZXJQcm92aWRlZFZhbHVlIiwic2V0UGFyYW1ldGVyIiwiaGFzT3duUHJvcGVydHkiLCJiRXJyb3JGb3VuZCIsIm9WYWx1ZSIsInNUZXh0Iiwid2FybmluZyIsImNvbnRlbnRXaWR0aCIsImZuQXN5bmNCZWZvcmVPcGVuIiwiYVBhcmFtZXRlcnMiLCJvQ29udGV4dE9iamVjdCIsInJlcXVlc3RPYmplY3QiLCJnZXRJdGVtcyIsImFmdGVyQ2xvc2UiLCJDYW5jZWxBY3Rpb25EaWFsb2ciLCJzZXRNb2RlbCIsImJpbmRFbGVtZW50IiwicGF0aCIsIm9NVkZNb2RlbCIsImF0dGFjaENoYW5nZSIsImFkZERlcGVuZGVudCIsInNldEJpbmRpbmdDb250ZXh0IiwiZ2V0T2JqZWN0QmluZGluZyIsIm9wZW4iLCJzbGljZSIsInZBY3Rpb25Dcml0aWNhbCIsInNDcml0aWNhbFBhdGgiLCJhQmluZGluZ1BhcmFtcyIsImFQYXRocyIsImJDb25kaXRpb24iLCJvUGFyYW1zIiwiaW5kZXgiLCJqb2luIiwic0VudGl0eVNldE5hbWUiLCJhQWN0aW9uTmFtZSIsInNLZXkiLCJiUmVzb3VyY2VLZXlFeGlzdHMiLCJjaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMiLCJhQ3VzdG9tQnVuZGxlcyIsImhhbmRsZTQxMkZhaWxlZFRyYW5zaXRpb25zIiwiY3VycmVudF9jb250ZXh0X2luZGV4IiwiaUNvbnRleHRMZW5ndGgiLCJ0cmFuc2l0aW9uTWVzc2FnZXMiLCJpc0R1cGxpY2F0ZSIsIk1lc3NhZ2VUeXBlIiwiU3VjY2VzcyIsImdyb3VwSWQiLCJvcGVyYXRpb25zSGVscGVyIiwicmVuZGVyTWVzc2FnZVZpZXciLCJleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzIiwiYkVuYWJsZVN0cmljdEhhbmRsaW5nIiwib1Byb3BlcnR5IiwiJGtpbmQiLCJmbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQiLCJvcGVyYXRpb25zIiwiQWN0aW9uRXhlY3V0aW9uRmFpbGVkIiwic2V0QWN0aW9uUGFyYW1ldGVyRGVmYXVsdFZhbHVlIiwiYUFjdGlvblByb21pc2VzIiwiZm5FeGVjdXRlQWN0aW9uIiwiYWN0aW9uQ29udGV4dCIsIm9TaWRlRWZmZWN0IiwiZ2V0VXBkYXRlR3JvdXBJZCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImZuUmVxdWVzdFNpZGVFZmZlY3RzIiwiZm5FeGVjdXRlU2luZ2xlQWN0aW9uIiwiYUxvY2FsUHJvbWlzZSIsImZuRXhlY3V0ZVNlcXVlbnRpYWxseSIsImNvbnRleHRzVG9FeGVjdXRlIiwibm9vcCIsInByb2Nlc3NPbmVBY3Rpb24iLCJhY3Rpb25JbmRleCIsInJlZHVjZSIsInByb21pc2UiLCJmbkhhbmRsZVJlc3VsdHMiLCJmaW5hbGx5IiwiY3VycmVudFByb21pc2VWYWx1ZSIsImFjdGlvblBhcmFtZXRlcnMiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwib0xvY2FsUHJvbWlzZSIsInNUcmlnZ2VyQWN0aW9uIiwiZXhlY3V0ZUFjdGlvbiIsInZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyIsImdldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIm9wZXJhdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IEFjdGlvblJ1bnRpbWUgZnJvbSBcInNhcC9mZS9jb3JlL0FjdGlvblJ1bnRpbWVcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9tZXNzYWdlSGFuZGxlci9tZXNzYWdlSGFuZGxpbmdcIjtcbmltcG9ydCBGUE1IZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRlBNSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgRkVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IHR5cGUgTGFiZWwgZnJvbSBcInNhcC9tL0xhYmVsXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IEZyYWdtZW50IGZyb20gXCJzYXAvdWkvY29yZS9GcmFnbWVudFwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBYTUxUZW1wbGF0ZVByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvWE1MVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB0eXBlIEZpZWxkIGZyb20gXCJzYXAvdWkvbWRjL0ZpZWxkXCI7XG5pbXBvcnQgdHlwZSBNdWx0aVZhbHVlRmllbGRJdGVtIGZyb20gXCJzYXAvdWkvbWRjL2ZpZWxkL011bHRpVmFsdWVGaWVsZEl0ZW1cIjtcbmltcG9ydCB0eXBlIE11bHRpVmFsdWVGaWVsZCBmcm9tIFwic2FwL3VpL21kYy9NdWx0aVZhbHVlRmllbGRcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwiLi4vLi4vQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgb3BlcmF0aW9uc0hlbHBlciwgeyB0eXBlIFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzIH0gZnJvbSBcIi4uLy4uL29wZXJhdGlvbnNIZWxwZXJcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VIYW5kbGVyIGZyb20gXCIuLi9NZXNzYWdlSGFuZGxlclwiO1xuXG5jb25zdCBDb25zdGFudHMgPSBGRUxpYnJhcnkuQ29uc3RhbnRzLFxuXHRJbnZvY2F0aW9uR3JvdXBpbmcgPSBGRUxpYnJhcnkuSW52b2NhdGlvbkdyb3VwaW5nO1xuY29uc3QgQWN0aW9uID0gKE1lc3NhZ2VCb3ggYXMgYW55KS5BY3Rpb247XG5cbi8qKlxuICogQ2FsbHMgYSBib3VuZCBhY3Rpb24gZm9yIG9uZSBvciBtdWx0aXBsZSBjb250ZXh0cy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9ucy5jYWxsQm91bmRBY3Rpb25cbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLm9wZXJhdGlvbnNcbiAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uIHRvIGJlIGNhbGxlZFxuICogQHBhcmFtIGNvbnRleHRzIEVpdGhlciBvbmUgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIHRvIGJlIGJlIGNhbGxlZFxuICogQHBhcmFtIG9Nb2RlbCBPRGF0YSBNb2RlbFxuICogQHBhcmFtIG9BcHBDb21wb25lbnQgVGhlIEFwcENvbXBvbmVudFxuICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwsIGNhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzXSBBIG1hcCBvZiBhY3Rpb24gcGFyYW1ldGVyIG5hbWVzIGFuZCBwcm92aWRlZCB2YWx1ZXNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzXSBBIG1hcCBvZiBiaW5kaW5nIHBhcmFtZXRlcnMgdGhhdCB3b3VsZCBiZSBwYXJ0IG9mICRzZWxlY3QgYW5kICRleHBhbmQgY29taW5nIGZyb20gc2lkZSBlZmZlY3RzIGZvciBib3VuZCBhY3Rpb25zXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0XSBBcnJheSBvZiBwcm9wZXJ0eSBwYXRocyB0byBiZSByZXF1ZXN0ZWQgaW4gYWRkaXRpb24gdG8gYWN0dWFsIHRhcmdldCBwcm9wZXJ0aWVzIG9mIHRoZSBzaWRlIGVmZmVjdFxuICogQHBhcmFtIFttUGFyYW1ldGVycy5zaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nXSBJZiBzZXQgYW5kIGlmIHBhcmFtZXRlcnMgZXhpc3QgdGhlIHVzZXIgcmV0cmlldmVzIGEgZGlhbG9nIHRvIGZpbGwgaW4gcGFyYW1ldGVycywgaWYgYWN0aW9uUGFyYW1ldGVycyBhcmUgcGFzc2VkIHRoZXkgYXJlIHNob3duIHRvIHRoZSB1c2VyXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmxhYmVsXSBBIGh1bWFuLXJlYWRhYmxlIGxhYmVsIGZvciB0aGUgYWN0aW9uXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmludm9jYXRpb25Hcm91cGluZ10gTW9kZSBob3cgYWN0aW9ucyBhcmUgdG8gYmUgY2FsbGVkOiBDaGFuZ2VzZXQgdG8gcHV0IGFsbCBhY3Rpb24gY2FsbHMgaW50byBvbmUgY2hhbmdlc2V0LCBJc29sYXRlZCB0byBwdXQgdGhlbSBpbnRvIHNlcGFyYXRlIGNoYW5nZXNldHMsIGRlZmF1bHRzIHRvIElzb2xhdGVkXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm9uU3VibWl0dGVkXSBGdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgb25jZSB0aGUgYWN0aW9ucyBhcmUgc3VibWl0dGVkIHdpdGggYW4gYXJyYXkgb2YgcHJvbWlzZXNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZGVmYXVsdFBhcmFtZXRlcnNdIENhbiBjb250YWluIGRlZmF1bHQgcGFyYW1ldGVycyBmcm9tIEZMUCB1c2VyIGRlZmF1bHRzXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2xdIElmIHNwZWNpZmllZCwgdGhlIGRpYWxvZ3MgYXJlIGFkZGVkIGFzIGRlcGVuZGVudCBvZiB0aGUgcGFyZW50IGNvbnRyb2xcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYkdldEJvdW5kQ29udGV4dF0gSWYgc3BlY2lmaWVkLCB0aGUgYWN0aW9uIHByb21pc2UgcmV0dXJucyB0aGUgYm91bmQgY29udGV4dFxuICogQHBhcmFtIFtzdHJpY3RIYW5kbGluZ1V0aWxpdGllc10gT3B0aW9uYWwsIHV0aWxpdHkgZmxhZ3MgYW5kIG1lc3NhZ2VzIGZvciBzdHJpY3RIYW5kbGluZ1xuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyB3aXRoIGFuIGFycmF5IG9mIHJlc3BvbnNlIG9iamVjdHMgKFRPRE86IHRvIGJlIGNoYW5nZWQpXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGNhbGxCb3VuZEFjdGlvbihcblx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0Y29udGV4dHM6IGFueSxcblx0b01vZGVsOiBhbnksXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGlmICghc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpIHtcblx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyA9IHtcblx0XHRcdGlzNDEyRXhlY3V0ZWQ6IGZhbHNlLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM6IFtdLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlczogW10sXG5cdFx0XHRzdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlczogW10sXG5cdFx0XHRkZWxheVN1Y2Nlc3NNZXNzYWdlczogW10sXG5cdFx0XHRwcm9jZXNzZWRNZXNzYWdlSWRzOiBbXVxuXHRcdH07XG5cdH1cblx0aWYgKCFjb250ZXh0cyB8fCBjb250ZXh0cy5sZW5ndGggPT09IDApIHtcblx0XHQvL0luIEZyZWVzdHlsZSBhcHBzIGJvdW5kIGFjdGlvbnMgY2FuIGhhdmUgbm8gY29udGV4dFxuXHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcIkJvdW5kIGFjdGlvbnMgYWx3YXlzIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBjb250ZXh0XCIpO1xuXHR9XG5cdC8vIHRoaXMgbWV0aG9kIGVpdGhlciBhY2NlcHRzIHNpbmdsZSBjb250ZXh0IG9yIGFuIGFycmF5IG9mIGNvbnRleHRzXG5cdC8vIFRPRE86IFJlZmFjdG9yIHRvIGFuIHVuYW1iaWd1b3MgQVBJXG5cdGNvbnN0IGlzQ2FsbGVkV2l0aEFycmF5ID0gQXJyYXkuaXNBcnJheShjb250ZXh0cyk7XG5cblx0Ly8gaW4gY2FzZSBvZiBzaW5nbGUgY29udGV4dCB3cmFwIGludG8gYW4gYXJyYXkgZm9yIGNhbGxlZCBtZXRob2RzIChlc3AuIGNhbGxBY3Rpb24pXG5cdG1QYXJhbWV0ZXJzLmFDb250ZXh0cyA9IGlzQ2FsbGVkV2l0aEFycmF5ID8gY29udGV4dHMgOiBbY29udGV4dHNdO1xuXG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0Ly8gQW5hbHl6aW5nIG1ldGFNb2RlbFBhdGggZm9yIGFjdGlvbiBvbmx5IGZyb20gZmlyc3QgY29udGV4dCBzZWVtcyB3ZWlyZCwgYnV0IHByb2JhYmx5IHdvcmtzIGluIGFsbCBleGlzdGluZyBzemVuYXJpb3MgLSBpZiBzZXZlcmFsIGNvbnRleHRzIGFyZSBwYXNzZWQsIHRoZXkgcHJvYmFibHlcblx0XHQvLyBiZWxvbmcgdG8gdGhlIHNhbWUgbWV0YW1vZGVscGF0aC4gVE9ETzogQ2hlY2ssIHdoZXRoZXIgdGhpcyBjYW4gYmUgaW1wcm92ZWQgLyBzemVuYXJpb3Mgd2l0aCBkaWZmZXJlbnQgbWV0YU1vZGVsUGF0aHMgbWlnaHQgZXhpc3Rcblx0XHRzQWN0aW9uUGF0aCA9IGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgobVBhcmFtZXRlcnMuYUNvbnRleHRzWzBdLmdldFBhdGgoKSl9LyR7c0FjdGlvbk5hbWV9YCxcblx0XHRvQm91bmRBY3Rpb24gPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NBY3Rpb25QYXRofS9AJHVpNS5vdmVybG9hZC8wYCk7XG5cdG1QYXJhbWV0ZXJzLmlzQ3JpdGljYWxBY3Rpb24gPSBnZXRJc0FjdGlvbkNyaXRpY2FsKG9NZXRhTW9kZWwsIHNBY3Rpb25QYXRoLCBtUGFyYW1ldGVycy5hQ29udGV4dHMsIG9Cb3VuZEFjdGlvbik7XG5cblx0Ly8gUHJvbWlzZSByZXR1cm5lZCBieSBjYWxsQWN0aW9uIGN1cnJlbnRseSBpcyByZWplY3RlZCBpbiBjYXNlIG9mIGV4ZWN1dGlvbiBmb3IgbXVsdGlwbGUgY29udGV4dHMgcGFydGx5IGZhaWxpbmcuIFRoaXMgc2hvdWxkIGJlIGNoYW5nZWQgKHNvbWUgZmFpbGluZyBjb250ZXh0cyBkbyBub3QgbWVhblxuXHQvLyB0aGF0IGZ1bmN0aW9uIGRpZCBub3QgZnVsZmlsbCBpdHMgdGFzayksIGJ1dCBhcyB0aGlzIGlzIGEgYmlnZ2VyIHJlZmFjdG9yaW5nLCBmb3IgdGhlIHRpbWUgYmVpbmcgd2UgbmVlZCB0byBkZWFsIHdpdGggdGhhdCBhdCB0aGUgY2FsbGluZyBwbGFjZSAoaS5lLiBoZXJlKVxuXHQvLyA9PiBwcm92aWRlIHRoZSBzYW1lIGhhbmRsZXIgKG1hcHBpbmcgYmFjayBmcm9tIGFycmF5IHRvIHNpbmdsZSByZXN1bHQvZXJyb3IgaWYgbmVlZGVkKSBmb3IgcmVzb2x2ZWQvcmVqZWN0ZWQgY2FzZVxuXHRjb25zdCBleHRyYWN0U2luZ2xlUmVzdWx0ID0gZnVuY3Rpb24gKHJlc3VsdDogYW55KSB7XG5cdFx0Ly8gc2luZ2xlIGFjdGlvbiBjb3VsZCBiZSByZXNvbHZlZCBvciByZWplY3RlZFxuXHRcdGlmIChyZXN1bHRbMF0uc3RhdHVzID09PSBcImZ1bGZpbGxlZFwiKSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0WzBdLnZhbHVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBJbiBjYXNlIG9mIGRpYWxvZyBjYW5jZWxsYXRpb24sIG5vIGFycmF5IGlzIHJldHVybmVkID0+IHRocm93IHRoZSByZXN1bHQuXG5cdFx0XHQvLyBJZGVhbGx5LCBkaWZmZXJlbnRpYXRpbmcgc2hvdWxkIG5vdCBiZSBuZWVkZWQgaGVyZSA9PiBUT0RPOiBGaW5kIGJldHRlciBzb2x1dGlvbiB3aGVuIHNlcGFyYXRpbmcgZGlhbG9nIGhhbmRsaW5nIChzaW5nbGUgb2JqZWN0IHdpdGggc2luZ2xlIHJlc3VsdCkgZnJvbSBiYWNrZW5kXG5cdFx0XHQvLyBleGVjdXRpb24gKHBvdGVudGlhbGx5IG11bHRpcGxlIG9iamVjdHMpXG5cdFx0XHR0aHJvdyByZXN1bHRbMF0ucmVhc29uIHx8IHJlc3VsdDtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIGNhbGxBY3Rpb24oc0FjdGlvbk5hbWUsIG9Nb2RlbCwgb0JvdW5kQWN0aW9uLCBvQXBwQ29tcG9uZW50LCBtUGFyYW1ldGVycywgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpLnRoZW4oXG5cdFx0KHJlc3VsdDogYW55KSA9PiB7XG5cdFx0XHRpZiAoaXNDYWxsZWRXaXRoQXJyYXkpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBleHRyYWN0U2luZ2xlUmVzdWx0KHJlc3VsdCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQocmVzdWx0OiBhbnkpID0+IHtcblx0XHRcdGlmIChpc0NhbGxlZFdpdGhBcnJheSkge1xuXHRcdFx0XHR0aHJvdyByZXN1bHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gZXh0cmFjdFNpbmdsZVJlc3VsdChyZXN1bHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0KTtcbn1cbi8qKlxuICogQ2FsbHMgYW4gYWN0aW9uIGltcG9ydC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9ucy5jYWxsQWN0aW9uSW1wb3J0XG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuYWN0aW9ucy5vcGVyYXRpb25zXG4gKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbiBpbXBvcnQgdG8gYmUgY2FsbGVkXG4gKiBAcGFyYW0gb01vZGVsIEFuIGluc3RhbmNlIG9mIGFuIE9EYXRhIFY0IG1vZGVsXG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBPcHRpb25hbCwgY2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuICogQHBhcmFtIFttUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXNdIEEgbWFwIG9mIGFjdGlvbiBwYXJhbWV0ZXIgbmFtZXMgYW5kIHByb3ZpZGVkIHZhbHVlc1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5sYWJlbF0gQSBodW1hbi1yZWFkYWJsZSBsYWJlbCBmb3IgdGhlIGFjdGlvblxuICogQHBhcmFtIFttUGFyYW1ldGVycy5zaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nXSBJZiBzZXQgYW5kIGlmIHBhcmFtZXRlcnMgZXhpc3QgdGhlIHVzZXIgcmV0cmlldmVzIGEgZGlhbG9nIHRvIGZpbGwgaW4gcGFyYW1ldGVycywgaWYgYWN0aW9uUGFyYW1ldGVycyBhcmUgcGFzc2VkIHRoZXkgYXJlIHNob3duIHRvIHRoZSB1c2VyXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm9uU3VibWl0dGVkXSBGdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgb25jZSB0aGUgYWN0aW9ucyBhcmUgc3VibWl0dGVkIHdpdGggYW4gYXJyYXkgb2YgcHJvbWlzZXNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZGVmYXVsdFBhcmFtZXRlcnNdIENhbiBjb250YWluIGRlZmF1bHQgcGFyYW1ldGVycyBmcm9tIEZMUCB1c2VyIGRlZmF1bHRzXG4gKiBAcGFyYW0gW3N0cmljdEhhbmRsaW5nVXRpbGl0aWVzXSBPcHRpb25hbCwgdXRpbGl0eSBmbGFncyBhbmQgbWVzc2FnZXMgZm9yIHN0cmljdEhhbmRsaW5nXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggYW4gYXJyYXkgb2YgcmVzcG9uc2Ugb2JqZWN0cyAoVE9ETzogdG8gYmUgY2hhbmdlZClcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gY2FsbEFjdGlvbkltcG9ydChcblx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0b01vZGVsOiBhbnksXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGlmICghb01vZGVsKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KFwiQWN0aW9uIGV4cGVjdHMgYSBtb2RlbC9jb250ZXh0IGZvciBleGVjdXRpb25cIik7XG5cdH1cblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRzQWN0aW9uUGF0aCA9IG9Nb2RlbC5iaW5kQ29udGV4dChgLyR7c0FjdGlvbk5hbWV9YCkuZ2V0UGF0aCgpLFxuXHRcdG9BY3Rpb25JbXBvcnQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAvJHtvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBY3Rpb25QYXRoKS5nZXRPYmplY3QoXCIkQWN0aW9uXCIpfS8wYCk7XG5cdG1QYXJhbWV0ZXJzLmlzQ3JpdGljYWxBY3Rpb24gPSBnZXRJc0FjdGlvbkNyaXRpY2FsKG9NZXRhTW9kZWwsIGAke3NBY3Rpb25QYXRofS9AJHVpNS5vdmVybG9hZGApO1xuXHRyZXR1cm4gY2FsbEFjdGlvbihzQWN0aW9uTmFtZSwgb01vZGVsLCBvQWN0aW9uSW1wb3J0LCBvQXBwQ29tcG9uZW50LCBtUGFyYW1ldGVycywgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpO1xufVxuZnVuY3Rpb24gY2FsbEJvdW5kRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZTogc3RyaW5nLCBjb250ZXh0OiBhbnksIG9Nb2RlbDogYW55KSB7XG5cdGlmICghY29udGV4dCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcIkJvdW5kIGZ1bmN0aW9ucyBhbHdheXMgcmVxdWlyZXMgYSBjb250ZXh0XCIpO1xuXHR9XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0c0Z1bmN0aW9uUGF0aCA9IGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoY29udGV4dC5nZXRQYXRoKCkpfS8ke3NGdW5jdGlvbk5hbWV9YCxcblx0XHRvQm91bmRGdW5jdGlvbiA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bmN0aW9uUGF0aCk7XG5cdHJldHVybiBfZXhlY3V0ZUZ1bmN0aW9uKHNGdW5jdGlvbk5hbWUsIG9Nb2RlbCwgb0JvdW5kRnVuY3Rpb24sIGNvbnRleHQpO1xufVxuLyoqXG4gKiBDYWxscyBhIGZ1bmN0aW9uIGltcG9ydC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9ucy5jYWxsRnVuY3Rpb25JbXBvcnRcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLm9wZXJhdGlvbnNcbiAqIEBwYXJhbSBzRnVuY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWRcbiAqIEBwYXJhbSBvTW9kZWwgQW4gaW5zdGFuY2Ugb2YgYW4gT0RhdGEgdjQgbW9kZWxcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXNcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNhbGxGdW5jdGlvbkltcG9ydChzRnVuY3Rpb25OYW1lOiBzdHJpbmcsIG9Nb2RlbDogYW55KSB7XG5cdGlmICghc0Z1bmN0aW9uTmFtZSkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdHNGdW5jdGlvblBhdGggPSBvTW9kZWwuYmluZENvbnRleHQoYC8ke3NGdW5jdGlvbk5hbWV9YCkuZ2V0UGF0aCgpLFxuXHRcdG9GdW5jdGlvbkltcG9ydCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke29NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bmN0aW9uUGF0aCkuZ2V0T2JqZWN0KFwiJEZ1bmN0aW9uXCIpfS8wYCk7XG5cdHJldHVybiBfZXhlY3V0ZUZ1bmN0aW9uKHNGdW5jdGlvbk5hbWUsIG9Nb2RlbCwgb0Z1bmN0aW9uSW1wb3J0KTtcbn1cbmZ1bmN0aW9uIF9leGVjdXRlRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZTogYW55LCBvTW9kZWw6IGFueSwgb0Z1bmN0aW9uOiBhbnksIGNvbnRleHQ/OiBhbnkpIHtcblx0bGV0IHNHcm91cElkO1xuXHRpZiAoIW9GdW5jdGlvbiB8fCAhb0Z1bmN0aW9uLmdldE9iamVjdCgpKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgRnVuY3Rpb24gJHtzRnVuY3Rpb25OYW1lfSBub3QgZm91bmRgKSk7XG5cdH1cblx0aWYgKGNvbnRleHQpIHtcblx0XHRvRnVuY3Rpb24gPSBvTW9kZWwuYmluZENvbnRleHQoYCR7c0Z1bmN0aW9uTmFtZX0oLi4uKWAsIGNvbnRleHQpO1xuXHRcdHNHcm91cElkID0gXCJmdW5jdGlvbkdyb3VwXCI7XG5cdH0gZWxzZSB7XG5cdFx0b0Z1bmN0aW9uID0gb01vZGVsLmJpbmRDb250ZXh0KGAvJHtzRnVuY3Rpb25OYW1lfSguLi4pYCk7XG5cdFx0c0dyb3VwSWQgPSBcImZ1bmN0aW9uSW1wb3J0XCI7XG5cdH1cblx0Y29uc3Qgb0Z1bmN0aW9uUHJvbWlzZSA9IG9GdW5jdGlvbi5leGVjdXRlKHNHcm91cElkKTtcblx0b01vZGVsLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0cmV0dXJuIG9GdW5jdGlvblByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG9GdW5jdGlvbi5nZXRCb3VuZENvbnRleHQoKTtcblx0fSk7XG59XG5mdW5jdGlvbiBjYWxsQWN0aW9uKFxuXHRzQWN0aW9uTmFtZTogYW55LFxuXHRvTW9kZWw6IGFueSxcblx0b0FjdGlvbjogYW55LFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzPzogU3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcbikge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQpIHtcblx0XHRsZXQgbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnM6IGFueSA9IHt9O1xuXHRcdGxldCBmbkRpYWxvZztcblx0XHRsZXQgb0FjdGlvblByb21pc2U7XG5cdFx0Ly9sZXQgZmFpbGVkQWN0aW9uUHJvbWlzZTogYW55O1xuXHRcdGNvbnN0IHNBY3Rpb25MYWJlbCA9IG1QYXJhbWV0ZXJzLmxhYmVsO1xuXHRcdGNvbnN0IGJTa2lwUGFyYW1ldGVyRGlhbG9nID0gbVBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZztcblx0XHRjb25zdCBhQ29udGV4dHMgPSBtUGFyYW1ldGVycy5hQ29udGV4dHM7XG5cdFx0Y29uc3QgYklzQ3JlYXRlQWN0aW9uID0gbVBhcmFtZXRlcnMuYklzQ3JlYXRlQWN0aW9uO1xuXHRcdGNvbnN0IGJJc0NyaXRpY2FsQWN0aW9uID0gbVBhcmFtZXRlcnMuaXNDcml0aWNhbEFjdGlvbjtcblx0XHRsZXQgb01ldGFNb2RlbDtcblx0XHRsZXQgc01ldGFQYXRoO1xuXHRcdGxldCBzTWVzc2FnZXNQYXRoOiBhbnk7XG5cdFx0bGV0IGlNZXNzYWdlU2lkZUVmZmVjdDtcblx0XHRsZXQgYklzU2FtZUVudGl0eTtcblx0XHRsZXQgb1JldHVyblR5cGU7XG5cdFx0bGV0IGJWYWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnM7XG5cdFx0Y29uc3QgYWN0aW9uRGVmaW5pdGlvbiA9IG9BY3Rpb24uZ2V0T2JqZWN0KCk7XG5cdFx0aWYgKCFvQWN0aW9uIHx8ICFvQWN0aW9uLmdldE9iamVjdCgpKSB7XG5cdFx0XHRyZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihgQWN0aW9uICR7c0FjdGlvbk5hbWV9IG5vdCBmb3VuZGApKTtcblx0XHR9XG5cblx0XHQvLyBHZXQgdGhlIHBhcmFtZXRlcnMgb2YgdGhlIGFjdGlvblxuXHRcdGNvbnN0IGFBY3Rpb25QYXJhbWV0ZXJzID0gZ2V0QWN0aW9uUGFyYW1ldGVycyhvQWN0aW9uKTtcblxuXHRcdC8vIENoZWNrIGlmIHRoZSBhY3Rpb24gaGFzIHBhcmFtZXRlcnMgYW5kIHdvdWxkIG5lZWQgYSBwYXJhbWV0ZXIgZGlhbG9nXG5cdFx0Ly8gVGhlIHBhcmFtZXRlciBSZXN1bHRJc0FjdGl2ZUVudGl0eSBpcyBhbHdheXMgaGlkZGVuIGluIHRoZSBkaWFsb2chIEhlbmNlIGlmXG5cdFx0Ly8gdGhpcyBpcyB0aGUgb25seSBwYXJhbWV0ZXIsIHRoaXMgaXMgdHJlYXRlZCBhcyBubyBwYXJhbWV0ZXIgaGVyZSBiZWNhdXNlIHRoZVxuXHRcdC8vIGRpYWxvZyB3b3VsZCBiZSBlbXB0eSFcblx0XHQvLyBGSVhNRTogU2hvdWxkIG9ubHkgaWdub3JlIHRoaXMgaWYgdGhpcyBpcyBhICdjcmVhdGUnIGFjdGlvbiwgb3RoZXJ3aXNlIGl0IGlzIGp1c3Qgc29tZSBub3JtYWwgcGFyYW1ldGVyIHRoYXQgaGFwcGVucyB0byBoYXZlIHRoaXMgbmFtZVxuXHRcdGNvbnN0IGJBY3Rpb25OZWVkc1BhcmFtZXRlckRpYWxvZyA9XG5cdFx0XHRhQWN0aW9uUGFyYW1ldGVycy5sZW5ndGggPiAwICYmICEoYUFjdGlvblBhcmFtZXRlcnMubGVuZ3RoID09PSAxICYmIGFBY3Rpb25QYXJhbWV0ZXJzWzBdLiROYW1lID09PSBcIlJlc3VsdElzQWN0aXZlRW50aXR5XCIpO1xuXG5cdFx0Ly8gUHJvdmlkZWQgdmFsdWVzIGZvciB0aGUgYWN0aW9uIHBhcmFtZXRlcnMgZnJvbSBpbnZva2VBY3Rpb24gY2FsbFxuXHRcdGNvbnN0IGFQYXJhbWV0ZXJWYWx1ZXMgPSBtUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXM7XG5cblx0XHQvLyBEZXRlcm1pbmUgc3RhcnR1cCBwYXJhbWV0ZXJzIGlmIHByb3ZpZGVkXG5cdFx0Y29uc3Qgb0NvbXBvbmVudERhdGEgPSBvQXBwQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKTtcblx0XHRjb25zdCBvU3RhcnR1cFBhcmFtZXRlcnMgPSAob0NvbXBvbmVudERhdGEgJiYgb0NvbXBvbmVudERhdGEuc3RhcnR1cFBhcmFtZXRlcnMpIHx8IHt9O1xuXG5cdFx0Ly8gSW4gY2FzZSBhbiBhY3Rpb24gcGFyYW1ldGVyIGlzIG5lZWRlZCwgYW5kIHdlIHNoYWxsIHNraXAgdGhlIGRpYWxvZywgY2hlY2sgaWYgdmFsdWVzIGFyZSBwcm92aWRlZCBmb3IgYWxsIHBhcmFtZXRlcnNcblx0XHRpZiAoYkFjdGlvbk5lZWRzUGFyYW1ldGVyRGlhbG9nICYmIGJTa2lwUGFyYW1ldGVyRGlhbG9nKSB7XG5cdFx0XHRiVmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzID0gX3ZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyhcblx0XHRcdFx0YklzQ3JlYXRlQWN0aW9uLFxuXHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0YVBhcmFtZXRlclZhbHVlcyxcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdC8vIERlcGVuZGluZyBvbiB0aGUgcHJldmlvdXNseSBkZXRlcm1pbmVkIGRhdGEsIGVpdGhlciBzZXQgYSBkaWFsb2cgb3IgbGVhdmUgaXQgZW1wdHkgd2hpY2hcblx0XHQvLyB3aWxsIGxlYWQgdG8gZGlyZWN0IGV4ZWN1dGlvbiBvZiB0aGUgYWN0aW9uIHdpdGhvdXQgYSBkaWFsb2dcblx0XHRmbkRpYWxvZyA9IG51bGw7XG5cdFx0aWYgKGJBY3Rpb25OZWVkc1BhcmFtZXRlckRpYWxvZykge1xuXHRcdFx0aWYgKCEoYlNraXBQYXJhbWV0ZXJEaWFsb2cgJiYgYlZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycykpIHtcblx0XHRcdFx0Zm5EaWFsb2cgPSBzaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoYklzQ3JpdGljYWxBY3Rpb24pIHtcblx0XHRcdGZuRGlhbG9nID0gY29uZmlybUNyaXRpY2FsQWN0aW9uO1xuXHRcdH1cblxuXHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzID0ge1xuXHRcdFx0Zm5PblN1Ym1pdHRlZDogbVBhcmFtZXRlcnMub25TdWJtaXR0ZWQsXG5cdFx0XHRmbk9uUmVzcG9uc2U6IG1QYXJhbWV0ZXJzLm9uUmVzcG9uc2UsXG5cdFx0XHRhY3Rpb25OYW1lOiBzQWN0aW9uTmFtZSxcblx0XHRcdG1vZGVsOiBvTW9kZWwsXG5cdFx0XHRhQWN0aW9uUGFyYW1ldGVyczogYUFjdGlvblBhcmFtZXRlcnMsXG5cdFx0XHRiR2V0Qm91bmRDb250ZXh0OiBtUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0LFxuXHRcdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24sXG5cdFx0XHRsYWJlbDogbVBhcmFtZXRlcnMubGFiZWwsXG5cdFx0XHRzZWxlY3RlZEl0ZW1zOiBtUGFyYW1ldGVycy5zZWxlY3RlZEl0ZW1zXG5cdFx0fTtcblx0XHRpZiAob0FjdGlvbi5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSkge1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ICYmIG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucykge1xuXHRcdFx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKGFDb250ZXh0c1swXS5nZXRQYXRoKCkpO1xuXHRcdFx0XHRzTWVzc2FnZXNQYXRoID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzLyRQYXRoYCk7XG5cblx0XHRcdFx0aWYgKHNNZXNzYWdlc1BhdGgpIHtcblx0XHRcdFx0XHRpTWVzc2FnZVNpZGVFZmZlY3QgPSBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMuZmluZEluZGV4KGZ1bmN0aW9uIChleHA6IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHR5cGVvZiBleHAgPT09IFwic3RyaW5nXCIgJiYgZXhwID09PSBzTWVzc2FnZXNQYXRoO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Ly8gQWRkIFNBUF9NZXNzYWdlcyBieSBkZWZhdWx0IGlmIG5vdCBhbm5vdGF0ZWQgYnkgc2lkZSBlZmZlY3RzLCBhY3Rpb24gZG9lcyBub3QgcmV0dXJuIGEgY29sbGVjdGlvbiBhbmRcblx0XHRcdFx0XHQvLyB0aGUgcmV0dXJuIHR5cGUgaXMgdGhlIHNhbWUgYXMgdGhlIGJvdW5kIHR5cGVcblx0XHRcdFx0XHRvUmV0dXJuVHlwZSA9IG9BY3Rpb24uZ2V0T2JqZWN0KFwiJFJldHVyblR5cGVcIik7XG5cdFx0XHRcdFx0YklzU2FtZUVudGl0eSA9XG5cdFx0XHRcdFx0XHRvUmV0dXJuVHlwZSAmJiAhb1JldHVyblR5cGUuJGlzQ29sbGVjdGlvbiAmJiBvQWN0aW9uLmdldE1vZGVsKCkuZ2V0T2JqZWN0KHNNZXRhUGF0aCkuJFR5cGUgPT09IG9SZXR1cm5UeXBlLiRUeXBlO1xuXG5cdFx0XHRcdFx0aWYgKGlNZXNzYWdlU2lkZUVmZmVjdCA+IC0xIHx8IGJJc1NhbWVFbnRpdHkpIHtcblx0XHRcdFx0XHRcdC8vIHRoZSBtZXNzYWdlIHBhdGggaXMgYW5ub3RhdGVkIGFzIHNpZGUgZWZmZWN0LiBBcyB0aGVyZSdzIG5vIGJpbmRpbmcgZm9yIGl0IGFuZCB0aGUgbW9kZWwgZG9lcyBjdXJyZW50bHkgbm90IGFsbG93XG5cdFx0XHRcdFx0XHQvLyB0byBhZGQgaXQgYXQgYSBsYXRlciBwb2ludCBvZiB0aW1lIHdlIGhhdmUgdG8gdGFrZSBjYXJlIGl0J3MgcGFydCBvZiB0aGUgJHNlbGVjdCBvZiB0aGUgUE9TVCwgdGhlcmVmb3JlIG1vdmluZyBpdC5cblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycyB8fCB7fTtcblxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRvQWN0aW9uLmdldE9iamVjdChgJFJldHVyblR5cGUvJFR5cGUvJHtzTWVzc2FnZXNQYXRofWApICYmXG5cdFx0XHRcdFx0XHRcdCghbVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzLiRzZWxlY3QgfHxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnMuJHNlbGVjdC5zcGxpdChcIixcIikuaW5kZXhPZihzTWVzc2FnZXNQYXRoKSA9PT0gLTEpXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzLiRzZWxlY3QgPSBtUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnMuJHNlbGVjdFxuXHRcdFx0XHRcdFx0XHRcdD8gYCR7bVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzLiRzZWxlY3R9LCR7c01lc3NhZ2VzUGF0aH1gXG5cdFx0XHRcdFx0XHRcdFx0OiBzTWVzc2FnZXNQYXRoO1xuXHRcdFx0XHRcdFx0XHQvLyBBZGQgc2lkZSBlZmZlY3RzIGF0IGVudGl0eSBsZXZlbCBiZWNhdXNlICRzZWxlY3Qgc3RvcHMgdGhlc2UgYmVpbmcgcmV0dXJuZWQgYnkgdGhlIGFjdGlvblxuXHRcdFx0XHRcdFx0XHQvLyBPbmx5IGlmIG5vIG90aGVyIHNpZGUgZWZmZWN0cyB3ZXJlIGFkZGVkIGZvciBNZXNzYWdlc1xuXHRcdFx0XHRcdFx0XHRpZiAoaU1lc3NhZ2VTaWRlRWZmZWN0ID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucy5wdXNoKFwiKlwiKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC50cmlnZ2VyQWN0aW9ucy5sZW5ndGggPT09IDAgJiYgaU1lc3NhZ2VTaWRlRWZmZWN0ID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBubyB0cmlnZ2VyIGFjdGlvbiB0aGVyZWZvcmUgbm8gbmVlZCB0byByZXF1ZXN0IG1lc3NhZ2VzIGFnYWluXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QucGF0aEV4cHJlc3Npb25zLnNwbGljZShpTWVzc2FnZVNpZGVFZmZlY3QsIDEpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFDb250ZXh0cyA9IGFDb250ZXh0cztcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycztcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ID0gbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3Q7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5iR3JvdXBlZCA9IG1QYXJhbWV0ZXJzLmludm9jYXRpb25Hcm91cGluZyA9PT0gSW52b2NhdGlvbkdyb3VwaW5nLkNoYW5nZVNldDtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ID0gbVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXAgPSBtUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXA7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pc0NyZWF0ZUFjdGlvbiA9IGJJc0NyZWF0ZUFjdGlvbjtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmJPYmplY3RQYWdlID0gbVBhcmFtZXRlcnMuYk9iamVjdFBhZ2U7XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuY29udHJvbElkKSB7XG5cdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmNvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLmJ5SWQobVBhcmFtZXRlcnMuY29udHJvbElkKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmNvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoYklzQ3JlYXRlQWN0aW9uKSB7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5iSXNDcmVhdGVBY3Rpb24gPSBiSXNDcmVhdGVBY3Rpb247XG5cdFx0fVxuXHRcdC8vY2hlY2sgZm9yIHNraXBwaW5nIHN0YXRpYyBhY3Rpb25zXG5cdFx0Y29uc3QgaXNTdGF0aWMgPSAoYWN0aW9uRGVmaW5pdGlvbi4kUGFyYW1ldGVyIHx8IFtdKS5zb21lKChhUGFyYW1ldGVyOiBhbnkpID0+IHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdCgoYWN0aW9uRGVmaW5pdGlvbi4kRW50aXR5U2V0UGF0aCAmJiBhY3Rpb25EZWZpbml0aW9uLiRFbnRpdHlTZXRQYXRoID09PSBhUGFyYW1ldGVyLiROYW1lKSB8fCBhY3Rpb25EZWZpbml0aW9uLiRJc0JvdW5kKSAmJlxuXHRcdFx0XHRhUGFyYW1ldGVyLiRpc0NvbGxlY3Rpb25cblx0XHRcdCk7XG5cdFx0fSk7XG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaXNTdGF0aWMgPSBpc1N0YXRpYztcblx0XHRpZiAoZm5EaWFsb2cpIHtcblx0XHRcdG9BY3Rpb25Qcm9taXNlID0gZm5EaWFsb2coXG5cdFx0XHRcdHNBY3Rpb25OYW1lLFxuXHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRzQWN0aW9uTGFiZWwsXG5cdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLFxuXHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0YVBhcmFtZXRlclZhbHVlcyxcblx0XHRcdFx0b0FjdGlvbixcblx0XHRcdFx0bVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCxcblx0XHRcdFx0bVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZSxcblx0XHRcdFx0bVBhcmFtZXRlcnMubWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIG9BY3Rpb25Qcm9taXNlXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvT3BlcmF0aW9uUmVzdWx0OiBhbnkpIHtcblx0XHRcdFx0XHRhZnRlckFjdGlvblJlc29sdXRpb24obVBhcmFtZXRlcnMsIG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLCBhY3Rpb25EZWZpbml0aW9uKTtcblx0XHRcdFx0XHRyZXNvbHZlKG9PcGVyYXRpb25SZXN1bHQpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9PcGVyYXRpb25SZXN1bHQ6IGFueSkge1xuXHRcdFx0XHRcdHJlamVjdChvT3BlcmF0aW9uUmVzdWx0KTtcblx0XHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFRha2Ugb3ZlciBhbGwgcHJvdmlkZWQgcGFyYW1ldGVyIHZhbHVlcyBhbmQgY2FsbCB0aGUgYWN0aW9uLlxuXHRcdFx0Ly8gVGhpcyBzaGFsbCBvbmx5IGhhcHBlbiBpZiB2YWx1ZXMgYXJlIHByb3ZpZGVkIGZvciBhbGwgdGhlIHBhcmFtZXRlcnMsIG90aGVyd2lzZSB0aGUgcGFyYW1ldGVyIGRpYWxvZyBzaGFsbCBiZSBzaG93biB3aGljaCBpcyBlbnN1cmVkIGVhcmxpZXJcblx0XHRcdGlmIChhUGFyYW1ldGVyVmFsdWVzKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgaSBpbiBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5hQWN0aW9uUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFBY3Rpb25QYXJhbWV0ZXJzW2ldLnZhbHVlID0gYVBhcmFtZXRlclZhbHVlcz8uZmluZChcblx0XHRcdFx0XHRcdChlbGVtZW50OiBhbnkpID0+IGVsZW1lbnQubmFtZSA9PT0gbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWVcblx0XHRcdFx0XHQpPy52YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm9yIChjb25zdCBpIGluIG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnNbaV0udmFsdWUgPVxuXHRcdFx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzW21BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lXT8uWzBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRsZXQgb09wZXJhdGlvblJlc3VsdDogYW55O1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0b09wZXJhdGlvblJlc3VsdCA9IGF3YWl0IF9leGVjdXRlQWN0aW9uKFxuXHRcdFx0XHRcdG9BcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5tZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGNvbnN0IG1lc3NhZ2VzID0gQ29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuaXM0MTJFeGVjdXRlZCAmJlxuXHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzLmxlbmd0aFxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyA9IHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmRlbGF5U3VjY2Vzc01lc3NhZ2VzLmNvbmNhdChtZXNzYWdlcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YWZ0ZXJBY3Rpb25SZXNvbHV0aW9uKG1QYXJhbWV0ZXJzLCBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycywgYWN0aW9uRGVmaW5pdGlvbik7XG5cdFx0XHRcdHJlc29sdmUob09wZXJhdGlvblJlc3VsdCk7XG5cdFx0XHR9IGNhdGNoIHtcblx0XHRcdFx0cmVqZWN0KG9PcGVyYXRpb25SZXN1bHQpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuaXM0MTJFeGVjdXRlZCAmJlxuXHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzLmxlbmd0aFxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc3RyaWN0SGFuZGxpbmdGYWlscyA9IHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzO1xuXHRcdFx0XHRcdFx0Y29uc3QgYUZhaWxlZENvbnRleHRzID0gW10gYXMgYW55O1xuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdGYWlscy5mb3JFYWNoKGZ1bmN0aW9uIChmYWlsOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0YUZhaWxlZENvbnRleHRzLnB1c2goZmFpbC5vQWN0aW9uLmdldENvbnRleHQoKSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFDb250ZXh0cyA9IGFGYWlsZWRDb250ZXh0cztcblx0XHRcdFx0XHRcdGNvbnN0IG9GYWlsZWRPcGVyYXRpb25SZXN1bHQgPSBhd2FpdCBfZXhlY3V0ZUFjdGlvbihcblx0XHRcdFx0XHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLm1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzID0gW107XG5cdFx0XHRcdFx0XHRDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuYWRkTWVzc2FnZXMoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuZGVsYXlTdWNjZXNzTWVzc2FnZXMpO1xuXHRcdFx0XHRcdFx0YWZ0ZXJBY3Rpb25SZXNvbHV0aW9uKG1QYXJhbWV0ZXJzLCBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycywgYWN0aW9uRGVmaW5pdGlvbik7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKG9GYWlsZWRPcGVyYXRpb25SZXN1bHQpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKG9GYWlsZWRPcGVyYXRpb25SZXN1bHQpIHtcblx0XHRcdFx0XHRcdHJlamVjdChvRmFpbGVkT3BlcmF0aW9uUmVzdWx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0bVBhcmFtZXRlcnM/Lm1lc3NhZ2VIYW5kbGVyPy5zaG93TWVzc2FnZURpYWxvZyh7IGNvbnRyb2w6IG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzPy5jb250cm9sIH0pO1xuXHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpIHtcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyA9IHtcblx0XHRcdFx0XHRcdGlzNDEyRXhlY3V0ZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM6IFtdLFxuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlczogW10sXG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlczogW10sXG5cdFx0XHRcdFx0XHRkZWxheVN1Y2Nlc3NNZXNzYWdlczogW10sXG5cdFx0XHRcdFx0XHRwcm9jZXNzZWRNZXNzYWdlSWRzOiBbXVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuZnVuY3Rpb24gY29uZmlybUNyaXRpY2FsQWN0aW9uKFxuXHRzQWN0aW9uTmFtZTogYW55LFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdHNBY3Rpb25MYWJlbDogYW55LFxuXHRtUGFyYW1ldGVyczogYW55LFxuXHRhQWN0aW9uUGFyYW1ldGVyczogYW55LFxuXHRhUGFyYW1ldGVyVmFsdWVzOiBhbnksXG5cdG9BY3Rpb25Db250ZXh0OiBhbnksXG5cdG9QYXJlbnRDb250cm9sOiBhbnksXG5cdGVudGl0eVNldE5hbWU6IGFueSxcblx0bWVzc2FnZUhhbmRsZXI6IGFueVxuKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0bGV0IGJvdW5kQWN0aW9uTmFtZSA9IHNBY3Rpb25OYW1lID8gc0FjdGlvbk5hbWUgOiBudWxsO1xuXHRcdGJvdW5kQWN0aW9uTmFtZSA9XG5cdFx0XHRib3VuZEFjdGlvbk5hbWUuaW5kZXhPZihcIi5cIikgPj0gMCA/IGJvdW5kQWN0aW9uTmFtZS5zcGxpdChcIi5cIilbYm91bmRBY3Rpb25OYW1lLnNwbGl0KFwiLlwiKS5sZW5ndGggLSAxXSA6IGJvdW5kQWN0aW9uTmFtZTtcblx0XHRjb25zdCBzdWZmaXhSZXNvdXJjZUtleSA9IGJvdW5kQWN0aW9uTmFtZSAmJiBlbnRpdHlTZXROYW1lID8gYCR7ZW50aXR5U2V0TmFtZX18JHtib3VuZEFjdGlvbk5hbWV9YCA6IFwiXCI7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gb1BhcmVudENvbnRyb2wuZ2V0Q29udHJvbGxlcigpLm9SZXNvdXJjZUJ1bmRsZTtcblx0XHRjb25zdCBzQ29uZmlybWF0aW9uVGV4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XCJDX09QRVJBVElPTlNfQUNUSU9OX0NPTkZJUk1fTUVTU0FHRVwiLFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0c3VmZml4UmVzb3VyY2VLZXlcblx0XHQpO1xuXG5cdFx0TWVzc2FnZUJveC5jb25maXJtKHNDb25maXJtYXRpb25UZXh0LCB7XG5cdFx0XHRvbkNsb3NlOiBhc3luYyBmdW5jdGlvbiAoc0FjdGlvbjogYW55KSB7XG5cdFx0XHRcdGlmIChzQWN0aW9uID09PSBBY3Rpb24uT0spIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb09wZXJhdGlvbiA9IGF3YWl0IF9leGVjdXRlQWN0aW9uKG9BcHBDb21wb25lbnQsIG1QYXJhbWV0ZXJzLCBvUGFyZW50Q29udHJvbCwgbWVzc2FnZUhhbmRsZXIpO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShvT3BlcmF0aW9uKTtcblx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KG9FcnJvcik7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChvRXJyb3IpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBUE1BY3Rpb24oXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0b1BhcmVudENvbnRyb2w6IGFueSxcblx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRhQ29udGV4dHM6IGFueSxcblx0b0RpYWxvZzogYW55LFxuXHRhZnRlcjQxMjogYm9vbGVhbixcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGNvbnN0IGFSZXN1bHQgPSBhd2FpdCBfZXhlY3V0ZUFjdGlvbihvQXBwQ29tcG9uZW50LCBtUGFyYW1ldGVycywgb1BhcmVudENvbnRyb2wsIG1lc3NhZ2VIYW5kbGVyLCBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyk7XG5cdC8vIElmIHNvbWUgZW50cmllcyB3ZXJlIHN1Y2Nlc3NmdWwsIGFuZCBvdGhlcnMgaGF2ZSBmYWlsZWQsIHRoZSBvdmVyYWxsIHByb2Nlc3MgaXMgc3RpbGwgc3VjY2Vzc2Z1bC4gSG93ZXZlciwgdGhpcyB3YXMgdHJlYXRlZCBhcyByZWplY3Rpb25cblx0Ly8gYmVmb3JlLCBhbmQgdGhpcyBjdXJyZW50bHkgaXMgc3RpbGwga2VwdCwgYXMgbG9uZyBhcyBkaWFsb2cgaGFuZGxpbmcgaXMgbWl4ZWQgd2l0aCBiYWNrZW5kIHByb2Nlc3MgaGFuZGxpbmcuXG5cdC8vIFRPRE86IFJlZmFjdG9yIHRvIG9ubHkgcmVqZWN0IGluIGNhc2Ugb2Ygb3ZlcmFsbCBwcm9jZXNzIGVycm9yLlxuXHQvLyBGb3IgdGhlIHRpbWUgYmVpbmc6IG1hcCB0byBvbGQgbG9naWMgdG8gcmVqZWN0IGlmIGF0IGxlYXN0IG9uZSBlbnRyeSBoYXMgZmFpbGVkXG5cdC8vIFRoaXMgY2hlY2sgaXMgb25seSBkb25lIGZvciBib3VuZCBhY3Rpb25zID0+IGFDb250ZXh0cyBub3QgZW1wdHlcblx0aWYgKG1QYXJhbWV0ZXJzLmFDb250ZXh0cz8ubGVuZ3RoKSB7XG5cdFx0aWYgKGFSZXN1bHQ/LnNvbWUoKG9TaW5nbGVSZXN1bHQ6IGFueSkgPT4gb1NpbmdsZVJlc3VsdC5zdGF0dXMgPT09IFwicmVqZWN0ZWRcIikpIHtcblx0XHRcdHRocm93IGFSZXN1bHQ7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgbWVzc2FnZXMgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiYgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuaXM0MTJFeGVjdXRlZCAmJiBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscy5sZW5ndGgpIHtcblx0XHRpZiAoIWFmdGVyNDEyKSB7XG5cdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyA9IHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmRlbGF5U3VjY2Vzc01lc3NhZ2VzLmNvbmNhdChtZXNzYWdlcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKS5hZGRNZXNzYWdlcyhzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyk7XG5cdFx0XHRpZiAobWVzc2FnZXMubGVuZ3RoKSB7XG5cdFx0XHRcdC8vIEJPVU5EIFRSQU5TSVRJT04gQVMgUEFSVCBPRiBTQVBfTUVTU0FHRVxuXHRcdFx0XHRtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZyh7XG5cdFx0XHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKGFNZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbjogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayhtUGFyYW1ldGVycywgYUNvbnRleHRzLCBvRGlhbG9nLCBhTWVzc2FnZXMsIHNob3dNZXNzYWdlUGFyYW1ldGVyc0luKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGNvbnRyb2w6IG1QYXJhbWV0ZXJzLmNvbnRyb2xcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xuXHRcdC8vIEJPVU5EIFRSQU5TSVRJT04gQVMgUEFSVCBPRiBTQVBfTUVTU0FHRVxuXHRcdG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKHtcblx0XHRcdGlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3BlbjogbVBhcmFtZXRlcnM/Lm9EaWFsb2cuaXNPcGVuKCksXG5cdFx0XHRvbkJlZm9yZVNob3dNZXNzYWdlOiBmdW5jdGlvbiAoYU1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyc0luOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIGFjdGlvblBhcmFtZXRlclNob3dNZXNzYWdlQ2FsbGJhY2sobVBhcmFtZXRlcnMsIGFDb250ZXh0cywgb0RpYWxvZywgYU1lc3NhZ2VzLCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbik7XG5cdFx0XHR9LFxuXHRcdFx0Y29udHJvbDogbVBhcmFtZXRlcnMuY29udHJvbFxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIGFSZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGFmdGVyQWN0aW9uUmVzb2x1dGlvbihtUGFyYW1ldGVyczogYW55LCBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVyczogYW55LCBhY3Rpb25EZWZpbml0aW9uOiBhbnkpIHtcblx0aWYgKFxuXHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzLmxlbmd0aCAmJlxuXHRcdGFjdGlvbkRlZmluaXRpb24uJElzQm91bmRcblx0KSB7XG5cdFx0Ly9jaGVjayBmb3Igc2tpcHBpbmcgc3RhdGljIGFjdGlvbnNcblx0XHRjb25zdCBpc1N0YXRpYyA9IG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmlzU3RhdGljO1xuXHRcdGlmICghaXNTdGF0aWMpIHtcblx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChcblx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRcdEpTT04ucGFyc2UobUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRcdFx0bVBhcmFtZXRlcnMuc2VsZWN0ZWRJdGVtcyxcblx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAobUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuY29udHJvbCkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5jb250cm9sO1xuXHRcdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0Y29uc3QgYVNlbGVjdGVkQ29udGV4dHMgPSBvQ29udHJvbC5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cdFx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRKU09OLnBhcnNlKG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCksXG5cdFx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFjdGlvblBhcmFtZXRlclNob3dNZXNzYWdlQ2FsbGJhY2soXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdGFDb250ZXh0czogYW55LFxuXHRvRGlhbG9nOiBhbnksXG5cdG1lc3NhZ2VzOiBhbnksXG5cdHNob3dNZXNzYWdlUGFyYW1ldGVyc0luOiB7IHNob3dNZXNzYWdlQm94OiBib29sZWFuOyBzaG93TWVzc2FnZURpYWxvZzogYm9vbGVhbiB9XG4pOiB7IGZuR2V0TWVzc2FnZVN1YnRpdGxlOiBGdW5jdGlvbiB8IHVuZGVmaW5lZDsgc2hvd01lc3NhZ2VCb3g6IGJvb2xlYW47IHNob3dNZXNzYWdlRGlhbG9nOiBib29sZWFuOyBmaWx0ZXJlZE1lc3NhZ2VzOiBhbnlbXSB9IHtcblx0bGV0IHNob3dNZXNzYWdlQm94ID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW4uc2hvd01lc3NhZ2VCb3gsXG5cdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbi5zaG93TWVzc2FnZURpYWxvZztcblx0Y29uc3Qgb0NvbnRyb2wgPSBtUGFyYW1ldGVycy5jb250cm9sO1xuXHRjb25zdCB1bmJvdW5kTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIoZnVuY3Rpb24gKG1lc3NhZ2U6IGFueSkge1xuXHRcdHJldHVybiBtZXNzYWdlLmdldFRhcmdldCgpID09PSBcIlwiO1xuXHR9KTtcblx0Y29uc3QgQVBEbWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIoZnVuY3Rpb24gKG1lc3NhZ2U6IGFueSkge1xuXHRcdHJldHVybiAoXG5cdFx0XHRtZXNzYWdlLmdldFRhcmdldCAmJlxuXHRcdFx0bWVzc2FnZS5nZXRUYXJnZXQoKS5pbmRleE9mKG1QYXJhbWV0ZXJzLmFjdGlvbk5hbWUpICE9PSAtMSAmJlxuXHRcdFx0bVBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnMuc29tZShmdW5jdGlvbiAoYWN0aW9uUGFyYW06IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5nZXRUYXJnZXQoKS5pbmRleE9mKGFjdGlvblBhcmFtLiROYW1lKSAhPT0gLTE7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH0pO1xuXHRBUERtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChBUERNZXNzYWdlOiBhbnkpIHtcblx0XHRBUERNZXNzYWdlLmlzQVBEVGFyZ2V0ID0gdHJ1ZTtcblx0fSk7XG5cblx0Y29uc3QgZXJyb3JUYXJnZXRzSW5BUEQgPSBBUERtZXNzYWdlcy5sZW5ndGggPyB0cnVlIDogZmFsc2U7XG5cdGlmIChvRGlhbG9nLmlzT3BlbigpICYmIGFDb250ZXh0cy5sZW5ndGggIT09IDAgJiYgIW1QYXJhbWV0ZXJzLmlzU3RhdGljKSB7XG5cdFx0aWYgKCFtUGFyYW1ldGVycy5iR3JvdXBlZCkge1xuXHRcdFx0Ly9pc29sYXRlZFxuXHRcdFx0aWYgKGFDb250ZXh0cy5sZW5ndGggPiAxIHx8ICFlcnJvclRhcmdldHNJbkFQRCkge1xuXHRcdFx0XHQvLyBkb2VzIG5vdCBtYXR0ZXIgaWYgZXJyb3IgaXMgaW4gQVBEIG9yIG5vdCwgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGNvbnRleHRzIHNlbGVjdGVkIG9yIGlmIHRoZSBlcnJvciBpcyBub3QgdGhlIEFQRCwgd2UgY2xvc2UgaXQuXG5cdFx0XHRcdC8vIFRPRE86IERpbGFvZyBoYW5kbGluZyBzaG91bGQgbm90IGJlIHBhcnQgb2YgbWVzc2FnZSBoYW5kbGluZy4gUmVmYWN0b3IgYWNjb3JkaW5nbHkgLSBkaWFsb2cgc2hvdWxkIG5vdCBiZSBuZWVkZWQgaW5zaWRlIHRoaXMgbWV0aG9kIC0gbmVpdGhlclxuXHRcdFx0XHQvLyB0byBhc2sgd2hldGhlciBpdCdzIG9wZW4sIG5vciB0byBjbG9zZS9kZXN0cm95IGl0IVxuXHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdG9EaWFsb2cuZGVzdHJveSgpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIWVycm9yVGFyZ2V0c0luQVBEKSB7XG5cdFx0XHQvL2NoYW5nZXNldFxuXHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0fVxuXHR9XG5cdGxldCBmaWx0ZXJlZE1lc3NhZ2VzOiBhbnlbXSA9IFtdO1xuXHRjb25zdCBiSXNBUERPcGVuID0gb0RpYWxvZy5pc09wZW4oKTtcblx0aWYgKG1lc3NhZ2VzLmxlbmd0aCA9PT0gMSAmJiBtZXNzYWdlc1swXS5nZXRUYXJnZXQgJiYgbWVzc2FnZXNbMF0uZ2V0VGFyZ2V0KCkgIT09IHVuZGVmaW5lZCAmJiBtZXNzYWdlc1swXS5nZXRUYXJnZXQoKSAhPT0gXCJcIikge1xuXHRcdGlmICgob0NvbnRyb2wgJiYgb0NvbnRyb2wuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpID09PSBmYWxzZSkgfHwgIW9Db250cm9sKSB7XG5cdFx0XHQvLyBPUCBlZGl0IG9yIExSXG5cdFx0XHRzaG93TWVzc2FnZUJveCA9ICFlcnJvclRhcmdldHNJbkFQRDtcblx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikgPT09IHRydWUpIHtcblx0XHRcdHNob3dNZXNzYWdlQm94ID0gZmFsc2U7XG5cdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IGZhbHNlO1xuXHRcdH1cblx0fSBlbHNlIGlmIChvQ29udHJvbCkge1xuXHRcdGlmIChvQ29udHJvbC5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikgPT09IGZhbHNlKSB7XG5cdFx0XHRpZiAoYklzQVBET3BlbiAmJiBlcnJvclRhcmdldHNJbkFQRCkge1xuXHRcdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2wuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpID09PSB0cnVlKSB7XG5cdFx0XHRpZiAoIWJJc0FQRE9wZW4gJiYgZXJyb3JUYXJnZXRzSW5BUEQpIHtcblx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSB0cnVlO1xuXHRcdFx0XHRmaWx0ZXJlZE1lc3NhZ2VzID0gdW5ib3VuZE1lc3NhZ2VzLmNvbmNhdChBUERtZXNzYWdlcyk7XG5cdFx0XHR9IGVsc2UgaWYgKCFiSXNBUERPcGVuICYmIHVuYm91bmRNZXNzYWdlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0Ly8gZXJyb3IgdGFyZ2V0cyBpbiBBUEQgPT4gdGhlcmUgaXMgYXRsZWFzdCBvbmUgYm91bmQgbWVzc2FnZS4gSWYgdGhlcmUgYXJlIHVuYm91bmQgbWVzc2FnZXMsIGRpYWxvZyBtdXN0IGJlIHNob3duLlxuXHRcdFx0XHQvLyBmb3IgZHJhZnQgZW50aXR5LCB3ZSBhbHJlYWR5IGNsb3NlZCB0aGUgQVBEXG5cdFx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRzaG93TWVzc2FnZUJveDogc2hvd01lc3NhZ2VCb3gsXG5cdFx0c2hvd01lc3NhZ2VEaWFsb2c6IHNob3dNZXNzYWdlRGlhbG9nLFxuXHRcdGZpbHRlcmVkTWVzc2FnZXM6IGZpbHRlcmVkTWVzc2FnZXMubGVuZ3RoID8gZmlsdGVyZWRNZXNzYWdlcyA6IG1lc3NhZ2VzLFxuXHRcdGZuR2V0TWVzc2FnZVN1YnRpdGxlOlxuXHRcdFx0b0NvbnRyb2wgJiYgb0NvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSAmJiBtZXNzYWdlSGFuZGxpbmcuc2V0TWVzc2FnZVN1YnRpdGxlLmJpbmQoe30sIG9Db250cm9sLCBhQ29udGV4dHMpXG5cdH07XG59XG5cbi8qXG4gKiBDdXJyZW50bHksIHRoaXMgbWV0aG9kIGlzIHJlc3BvbnNpYmxlIGZvciBzaG93aW5nIHRoZSBkaWFsb2cgYW5kIGV4ZWN1dGluZyB0aGUgYWN0aW9uLiBUaGUgcHJvbWlzZSByZXR1cm5lZCBpcyBwZW5kaW5nIHdoaWxlIHdhaXRpbmcgZm9yIHVzZXIgaW5wdXQsIGFzIHdlbGwgYXMgd2hpbGUgdGhlXG4gKiBiYWNrLWVuZCByZXF1ZXN0IGlzIHJ1bm5pbmcuIFRoZSBwcm9taXNlIGlzIHJlamVjdGVkIHdoZW4gdGhlIHVzZXIgY2FuY2VscyB0aGUgZGlhbG9nIGFuZCBhbHNvIHdoZW4gdGhlIGJhY2stZW5kIHJlcXVlc3QgZmFpbHMuXG4gKiBUT0RPOiBSZWZhY3RvcmluZzogU2VwYXJhdGUgZGlhbG9nIGhhbmRsaW5nIGZyb20gYmFja2VuZCBwcm9jZXNzaW5nLiBEaWFsb2cgaGFuZGxpbmcgc2hvdWxkIHJldHVybiBhIFByb21pc2UgcmVzb2x2aW5nIHRvIHBhcmFtZXRlcnMgdG8gYmUgcHJvdmlkZWQgdG8gYmFja2VuZC4gSWYgZGlhbG9nIGlzXG4gKiBjYW5jZWxsZWQsIHRoYXQgcHJvbWlzZSBjYW4gYmUgcmVqZWN0ZWQuIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgYmFja2VuZCBwcm9jZXNzaW5nIG5lZWQgdG8gZGVhbCB3aXRoIG11bHRpcGxlIGNvbnRleHRzIC0gaS5lLiBpdCBzaG91bGQgZWl0aGVyIHJldHVybiBhbiBhcnJheSBvZiBQcm9taXNlcyBvclxuICogYSBQcm9taXNlIHJlc29sdmluZyB0byBhbiBhcnJheS4gSW4gdGhlIGxhdHRlciBjYXNlLCB0aGF0IFByb21pc2Ugc2hvdWxkIGJlIHJlc29sdmVkIGFsc28gd2hlbiBzb21lIG9yIGV2ZW4gYWxsIGNvbnRleHRzIGZhaWxlZCBpbiBiYWNrZW5kIC0gdGhlIG92ZXJhbGwgcHJvY2VzcyBzdGlsbCB3YXNcbiAqIHN1Y2Nlc3NmdWwuXG4gKlxuICovXG5cbi8vIHRoaXMgdHlwZSBpcyBtZWFudCB0byBkZXNjcmliZSB0aGUgbWV0YSBpbmZvcm1hdGlvbiBmb3Igb25lIEFjdGlvblBhcmFtZXRlciAoaS5lLiBpdHMgb2JqZWN0IGluIG1ldGFNb2RlbClcbnR5cGUgQWN0aW9uUGFyYW1ldGVyID0ge1xuXHQkTmFtZTogc3RyaW5nO1xuXHQkaXNDb2xsZWN0aW9uOiBib29sZWFuO1xuXHQvLyBjdXJyZW50bHkgcnVudGltZSBpbmZvcm1hdGlvbiBpcyB3cml0dGVuIGludG8gdGhlIG1ldGFtb2RlbDpcblx0Ly8gLSBpbiB0aGUgcHJlc3MgaGFuZGxlciBvZiB0aGUgYWN0aW9uIGJ1dHRvbiBvbiB0aGUgcGFyYW1ldGVyIGRpYWxvZywgdGhlIHZhbHVlIG9mIGVhY2ggcGFyYW1ldGVyIGlzIGFkZGVkXG5cdC8vIC0gaW4gc2V0QWN0aW9uUGFyYW1ldGVyRGVmYXVsdFZhbHVlLCB0aGlzIGluZm9ybWF0aW9uIGlzIHVzZWQgYW5kIHRyYW5zZmVycmVkIHRvIHRoZSBjb250ZXh0IChpbiBPRGF0YU1vZGVsKSBjcmVhdGVkIGZvciB0aGUgYWN0aW9uIGV4ZWN1dGlvblxuXHQvLyB0aGlzIGlzIHF1aXRlIG9kZCwgYW5kIGl0IHdvdWxkIG1ha2UgbXVjaCBtb3JlIHNlbnNlIHRvIHRha2UgdGhlIHZhbHVlIGZyb20gYWN0aW9uUGFyYW1ldGVySW5mb3Ncblx0Ly8gLSBob3dldmVyLCBzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUgKG9yIHJhdGhlciB0aGUgc3Vycm91bmRpbmcgX2V4ZWN1dGVBY3Rpb24pIGlzIGFsc28gY2FsbGVkIGZyb20gb3RoZXIgcGxhY2VzXG5cdC8vID0+IGZvciB0aGUgdGltZSBiZWluZywgYWRkaW5nIHZhbHVlIGhlcmUgdG8gYXZvaWQgdHMgZXJyb3JzLCBzdWJqZWN0IHRvIHJlZmFjdG9yaW5nXG5cdC8vIGluIGNhc2Ugb2YgRmllbGQsIHRoZSB2YWx1ZSBpcyBzdHJpbmcsIGluIGNhc2Ugb2YgTXVsdGlWYWx1ZUZpZWxkLCBpdCdzIE11bHRpVmFsdWVGaWVsZEl0ZW1bXVxuXHR2YWx1ZTogc3RyaW5nIHwgTXVsdGlWYWx1ZUZpZWxkSXRlbVtdO1xufTtcblxuZnVuY3Rpb24gc2hvd0FjdGlvblBhcmFtZXRlckRpYWxvZyhcblx0c0FjdGlvbk5hbWU6IGFueSxcblx0b0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRzQWN0aW9uTGFiZWw6IGFueSxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0YUFjdGlvblBhcmFtZXRlcnM6IEFjdGlvblBhcmFtZXRlcltdLFxuXHRhUGFyYW1ldGVyVmFsdWVzOiBhbnksXG5cdG9BY3Rpb25Db250ZXh0OiBhbnksXG5cdG9QYXJlbnRDb250cm9sOiBhbnksXG5cdGVudGl0eVNldE5hbWU6IGFueSxcblx0bWVzc2FnZUhhbmRsZXI6IGFueSxcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGNvbnN0IHNQYXRoID0gX2dldFBhdGgob0FjdGlvbkNvbnRleHQsIHNBY3Rpb25OYW1lKSxcblx0XHRtZXRhTW9kZWwgPSBvQWN0aW9uQ29udGV4dC5nZXRNb2RlbCgpLm9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRlbnRpdHlTZXRDb250ZXh0ID0gbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNQYXRoKSxcblx0XHRzQWN0aW9uTmFtZVBhdGggPSBvQWN0aW9uQ29udGV4dC5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKVxuXHRcdFx0PyBvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCkuc3BsaXQoXCIvQCR1aTUub3ZlcmxvYWQvMFwiKVswXVxuXHRcdFx0OiBvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCkuc3BsaXQoXCIvMFwiKVswXSxcblx0XHRhY3Rpb25OYW1lQ29udGV4dCA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzQWN0aW9uTmFtZVBhdGgpLFxuXHRcdGJJc0NyZWF0ZUFjdGlvbiA9IG1QYXJhbWV0ZXJzLmlzQ3JlYXRlQWN0aW9uLFxuXHRcdHNGcmFnbWVudE5hbWUgPSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL0FjdGlvblBhcmFtZXRlckRpYWxvZ1wiO1xuXHRyZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdHR5cGUgQWN0aW9uUGFyYW1ldGVySW5mbyA9IHtcblx0XHRcdHBhcmFtZXRlcjogQWN0aW9uUGFyYW1ldGVyO1xuXHRcdFx0ZmllbGQ6IEZpZWxkIHwgTXVsdGlWYWx1ZUZpZWxkO1xuXHRcdFx0aXNNdWx0aVZhbHVlOiBib29sZWFuO1xuXHRcdFx0dmFsdWU/OiBzdHJpbmcgfCBNdWx0aVZhbHVlRmllbGRJdGVtW107XG5cdFx0XHR2YWxpZGF0aW9uUHJvbWlzZT86IFByb21pc2U8c3RyaW5nIHwgTXVsdGlWYWx1ZUZpZWxkSXRlbVtdPjtcblx0XHR9O1xuXHRcdGxldCBhY3Rpb25QYXJhbWV0ZXJJbmZvczogQWN0aW9uUGFyYW1ldGVySW5mb1tdOyAvLyB0byBiZSBmaWxsZWQgYWZ0ZXIgZnJhZ21lbnQgKGZvciBhY3Rpb24gcGFyYW1ldGVyIGRpYWxvZykgaXMgbG9hZGVkLiBBY3R1YWxseSBvbmx5IG5lZWRlZCBkdXJpbmcgZGlhbG9nIHByb2Nlc3NpbmcsIGkuZS4gY291bGQgYmUgbW92ZWQgaW50byB0aGUgY29udHJvbGxlciBhbmQgZGlyZWN0bHkgaW5pdGlhbGl6ZWQgdGhlcmUsIGJ1dCBvbmx5IGFmdGVyIG1vdmluZyBhbGwgaGFuZGxlcnMgKGVzcC4gcHJlc3MgaGFuZGxlciBmb3IgYWN0aW9uIGJ1dHRvbikgdG8gY29udHJvbGxlci5cblxuXHRcdGNvbnN0IG1lc3NhZ2VNYW5hZ2VyID0gQ29yZS5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXG5cdFx0Ly8gaW4gY2FzZSBvZiBtaXNzaW5nIG1hbmRhb3RvcnkgcGFyYW1ldGVyLCBtZXNzYWdlIGN1cnJlbnRseSBkaWZmZXJzIHBlciBwYXJhbWV0ZXIsIGFzIGl0IHN1cGVyZmx1b3VzbHkgY29udGFpbnMgdGhlIGxhYmVsIGFzIHBhcmFtZXRlci4gUG9zc2libGt5IHRoaXMgY291bGQgYmUgcmVtb3ZlZCBpbiBmdXR1cmUsIGluIHRoYXQgY2FzZSwgaW50ZXJmYWNlIGNvdWxkIGJlIHNpbXBsaWZpZWQgdG8gQWN0aW9uUGFyYW1ldGVySW5mb1tdLCBzdHJpbmdcblx0XHRjb25zdCBfYWRkTWVzc2FnZUZvckFjdGlvblBhcmFtZXRlciA9IChtZXNzYWdlUGFyYW1ldGVyczogeyBhY3Rpb25QYXJhbWV0ZXJJbmZvOiBBY3Rpb25QYXJhbWV0ZXJJbmZvOyBtZXNzYWdlOiBzdHJpbmcgfVtdKSA9PiB7XG5cdFx0XHRtZXNzYWdlTWFuYWdlci5hZGRNZXNzYWdlcyhcblx0XHRcdFx0bWVzc2FnZVBhcmFtZXRlcnMubWFwKChtZXNzYWdlUGFyYW1ldGVyKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYmluZGluZyA9IG1lc3NhZ2VQYXJhbWV0ZXIuYWN0aW9uUGFyYW1ldGVySW5mby5maWVsZC5nZXRCaW5kaW5nKFxuXHRcdFx0XHRcdFx0bWVzc2FnZVBhcmFtZXRlci5hY3Rpb25QYXJhbWV0ZXJJbmZvLmlzTXVsdGlWYWx1ZSA/IFwiaXRlbXNcIiA6IFwidmFsdWVcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBNZXNzYWdlKHtcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2VQYXJhbWV0ZXIubWVzc2FnZSxcblx0XHRcdFx0XHRcdHR5cGU6IFwiRXJyb3JcIixcblx0XHRcdFx0XHRcdHByb2Nlc3NvcjogYmluZGluZz8uZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdHBlcnNpc3RlbnQ6IHRydWUsXG5cdFx0XHRcdFx0XHR0YXJnZXQ6IGJpbmRpbmc/LmdldFJlc29sdmVkUGF0aCgpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdH07XG5cblx0XHRjb25zdCBfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlciA9IChwYXJhbWV0ZXI6IEFjdGlvblBhcmFtZXRlcikgPT4ge1xuXHRcdFx0Y29uc3QgYWxsTWVzc2FnZXMgPSBtZXNzYWdlTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0XHRjb25zdCBjb250cm9sSWQgPSBnZW5lcmF0ZShbXCJBUERfXCIsIHBhcmFtZXRlci4kTmFtZV0pO1xuXHRcdFx0Ly8gYWxzbyByZW1vdmUgbWVzc2FnZXMgYXNzaWduZWQgdG8gaW5uZXIgY29udHJvbHMsIGJ1dCBhdm9pZCByZW1vdmluZyBtZXNzYWdlcyBmb3IgZGlmZmVyZW50IHBhcmFtdGVycyAod2l0aCBuYW1lIGJlaW5nIHN1YnN0cmluZyBvZiBhbm90aGVyIHBhcmFtZXRlciBuYW1lKVxuXHRcdFx0Y29uc3QgcmVsZXZhbnRNZXNzYWdlcyA9IGFsbE1lc3NhZ2VzLmZpbHRlcigobXNnOiBNZXNzYWdlKSA9PlxuXHRcdFx0XHRtc2cuZ2V0Q29udHJvbElkcygpLnNvbWUoKGlkOiBzdHJpbmcpID0+IGNvbnRyb2xJZC5zcGxpdChcIi1cIikuaW5jbHVkZXMoaWQpKVxuXHRcdFx0KTtcblx0XHRcdG1lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKHJlbGV2YW50TWVzc2FnZXMpO1xuXHRcdH07XG5cblx0XHRjb25zdCBfdmFsaWRhdGVQcm9wZXJ0aWVzID0gYXN5bmMgZnVuY3Rpb24gKG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUpIHtcblx0XHRcdGNvbnN0IHJlcXVpcmVkUGFyYW1ldGVySW5mb3MgPSBhY3Rpb25QYXJhbWV0ZXJJbmZvcy5maWx0ZXIoKGFjdGlvblBhcmFtZXRlckluZm8pID0+IGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQuZ2V0UmVxdWlyZWQoKSk7XG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQocmVxdWlyZWRQYXJhbWV0ZXJJbmZvcy5tYXAoKGFjdGlvblBhcmFtZXRlckluZm8pID0+IGFjdGlvblBhcmFtZXRlckluZm8udmFsaWRhdGlvblByb21pc2UpKTtcblx0XHRcdC8qIEhpbnQ6IFRoZSBib29sZWFuIGZhbHNlIGlzIGEgdmFsaWQgdmFsdWUgKi9cblx0XHRcdGNvbnN0IGVtcHR5UmVxdWlyZWRGaWVsZHMgPSByZXF1aXJlZFBhcmFtZXRlckluZm9zLmZpbHRlcigocmVxdWlyZWRQYXJhbWV0ZXJJbmZvKSA9PiB7XG5cdFx0XHRcdGlmKHJlcXVpcmVkUGFyYW1ldGVySW5mby5pc011bHRpVmFsdWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVxdWlyZWRQYXJhbWV0ZXJJbmZvLnZhbHVlID09PSB1bmRlZmluZWQgfHwgIXJlcXVpcmVkUGFyYW1ldGVySW5mby52YWx1ZS5sZW5ndGhcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBmaWVsZFZhbHVlID0gKHJlcXVpcmVkUGFyYW1ldGVySW5mby5maWVsZCBhcyBGaWVsZCkuZ2V0VmFsdWUoKTtcblx0XHRcdFx0XHRyZXR1cm4gZmllbGRWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGZpZWxkVmFsdWUgPT09IG51bGwgfHwgZmllbGRWYWx1ZSA9PT0gXCJcIlxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gbWVzc2FnZSBjb250YWlucyBsYWJlbCBwZXIgZmllbGQgZm9yIGhpc3RvcmljYWwgcmVhc29uIChvcmlnaW5hbGx5LCBpdCB3YXMgc2hvd24gaW4gYWRkaXRpb25hbCBwb3B1cCwgbm93IGl0J3MgZGlyZWN0bHkgYWRkZWQgdG8gdGhlIGZpZWxkKVxuXHRcdFx0Ly8gaWYgdGhpcyB3YXMgbm90IHRoZSBjYXNlIChhbmQgaG9wZWZ1bGx5LCBpbiBmdXR1cmUgdGhpcyBtaWdodCBiZSBzdWJqZWN0IHRvIGNoYW5nZSksIGludGVyZmFjZSBvZiBfYWRkTWVzc2FnZUZvckFjdGlvblBhcmFtZXRlciBjb3VsZCBiZSBzaW1wbGlmaWVkIHRvIGp1c3QgcGFzcyBlbXB0eVJlcXVpcmVkRmllbGRzIGFuZCBhIGNvbnN0YW50IG1lc3NhZ2UgaGVyZVxuXHRcdFx0X2FkZE1lc3NhZ2VGb3JBY3Rpb25QYXJhbWV0ZXIoXG5cdFx0XHRcdGVtcHR5UmVxdWlyZWRGaWVsZHMubWFwKChhY3Rpb25QYXJhbWV0ZXJJbmZvKSA9PiAoe1xuXHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm86IGFjdGlvblBhcmFtZXRlckluZm8sXG5cdFx0XHRcdFx0bWVzc2FnZTogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX09QRVJBVElPTlNfQUNUSU9OX1BBUkFNRVRFUl9ESUFMT0dfTUlTU0lOR19NQU5EQVRPUllfTVNHXCIsIG9SZXNvdXJjZUJ1bmRsZSwgW1xuXHRcdFx0XHRcdFx0KGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQuZ2V0UGFyZW50KCk/LmdldEFnZ3JlZ2F0aW9uKFwibGFiZWxcIikgYXMgTGFiZWwpLmdldFRleHQoKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdH0pKVxuXHRcdFx0KTtcblxuXHRcdFx0LyogQ2hlY2sgdmFsdWUgc3RhdGUgb2YgYWxsIHBhcmFtZXRlciAqL1xuXHRcdFx0Y29uc3QgZmlyc3RJbnZhbGlkQWN0aW9uUGFyYW1ldGVyID0gYWN0aW9uUGFyYW1ldGVySW5mb3MuZmluZChcblx0XHRcdFx0Ly8gdW5mb3J0dW5hdGVseSwgX2FkZE1lc3NhZ2VGb3JBY3Rpb25QYXJhbWV0ZXIgc2V0cyB2YWx1ZVN0YXRlIG9ubHkgYXN5bmNocm9uZW91c2x5LCB0aHVzIGNoZWNraW5nIGVtcHR5UmVxdWlyZWRGaWVsZHMgYWRkaXRpb25hbGx5XG5cdFx0XHRcdChhY3Rpb25QYXJhbWV0ZXJJbmZvKSA9PlxuXHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQuZ2V0VmFsdWVTdGF0ZSgpID09PSBcIkVycm9yXCIgfHwgZW1wdHlSZXF1aXJlZEZpZWxkcy5pbmNsdWRlcyhhY3Rpb25QYXJhbWV0ZXJJbmZvKVxuXHRcdFx0KTtcblxuXHRcdFx0aWYgKGZpcnN0SW52YWxpZEFjdGlvblBhcmFtZXRlcikge1xuXHRcdFx0XHRmaXJzdEludmFsaWRBY3Rpb25QYXJhbWV0ZXIuZmllbGQuZm9jdXMoKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGNvbnN0IG9Db250cm9sbGVyID0ge1xuXHRcdFx0aGFuZGxlQ2hhbmdlOiBhc3luYyBmdW5jdGlvbiAob0V2ZW50OiBFdmVudCkge1xuXHRcdFx0XHRjb25zdCBmaWVsZCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRcdFx0Y29uc3QgYWN0aW9uUGFyYW1ldGVySW5mbyA9IGFjdGlvblBhcmFtZXRlckluZm9zLmZpbmQoXG5cdFx0XHRcdFx0KGFjdGlvblBhcmFtZXRlckluZm8pID0+IGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQgPT09IGZpZWxkXG5cdFx0XHRcdCkgYXMgQWN0aW9uUGFyYW1ldGVySW5mbztcblx0XHRcdFx0Ly8gZmllbGQgdmFsdWUgaXMgYmVpbmcgY2hhbmdlZCwgdGh1cyBleGlzdGluZyBtZXNzYWdlcyByZWxhdGVkIHRvIHRoYXQgZmllbGQgYXJlIG5vdCB2YWxpZCBhbnltb3JlXG5cdFx0XHRcdF9yZW1vdmVNZXNzYWdlc0ZvckFjdGlvblBhcmFtdGVyKGFjdGlvblBhcmFtZXRlckluZm8ucGFyYW1ldGVyKTtcblx0XHRcdFx0Ly8gYWRhcHQgaW5mby4gUHJvbWlzZSBpcyByZXNvbHZlZCB0byB2YWx1ZSBvciByZWplY3RlZCB3aXRoIGV4Y2VwdGlvbiBjb250YWluaW5nIG1lc3NhZ2Vcblx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mby52YWxpZGF0aW9uUHJvbWlzZSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJwcm9taXNlXCIpIGFzIFByb21pc2U8c3RyaW5nPjtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbHVlID0gYXdhaXQgYWN0aW9uUGFyYW1ldGVySW5mby52YWxpZGF0aW9uUHJvbWlzZTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRkZWxldGUgYWN0aW9uUGFyYW1ldGVySW5mby52YWx1ZTtcblx0XHRcdFx0XHRfYWRkTWVzc2FnZUZvckFjdGlvblBhcmFtZXRlcihbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm86IGFjdGlvblBhcmFtZXRlckluZm8sXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2U6IChlcnJvciBhcyB7IG1lc3NhZ2U6IHN0cmluZyB9KS5tZXNzYWdlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cdFx0Y29uc3Qgb1BhcmFtZXRlck1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHQkZGlzcGxheU1vZGU6IHt9XG5cdFx0fSk7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgY3JlYXRlZEZyYWdtZW50ID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdG9GcmFnbWVudCxcblx0XHRcdFx0eyBuYW1lOiBzRnJhZ21lbnROYW1lIH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdGFjdGlvbjogb0FjdGlvbkNvbnRleHQsXG5cdFx0XHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb25OYW1lQ29udGV4dCxcblx0XHRcdFx0XHRcdGVudGl0eVNldDogZW50aXR5U2V0Q29udGV4dFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb246IG9BY3Rpb25Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb25OYW1lQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBlbnRpdHlTZXRDb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IGVudGl0eVNldENvbnRleHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHRcdC8vIFRPRE86IG1vdmUgdGhlIGRpYWxvZyBpbnRvIHRoZSBmcmFnbWVudCBhbmQgbW92ZSB0aGUgaGFuZGxlcnMgdG8gdGhlIG9Db250cm9sbGVyXG5cdFx0XHRjb25zdCBhQ29udGV4dHM6IGFueVtdID0gbVBhcmFtZXRlcnMuYUNvbnRleHRzIHx8IFtdO1xuXHRcdFx0Y29uc3QgYUZ1bmN0aW9uUGFyYW1zOiBhbnlbXSA9IFtdO1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxuXHRcdFx0bGV0IG9PcGVyYXRpb25CaW5kaW5nOiBhbnk7XG5cdFx0XHRhd2FpdCBDb21tb25VdGlscy5zZXRVc2VyRGVmYXVsdHMob0FwcENvbXBvbmVudCwgYUFjdGlvblBhcmFtZXRlcnMsIG9QYXJhbWV0ZXJNb2RlbCwgdHJ1ZSk7XG5cdFx0XHRjb25zdCBvRGlhbG9nQ29udGVudCA9IChhd2FpdCBGcmFnbWVudC5sb2FkKHtcblx0XHRcdFx0ZGVmaW5pdGlvbjogY3JlYXRlZEZyYWdtZW50LFxuXHRcdFx0XHRjb250cm9sbGVyOiBvQ29udHJvbGxlclxuXHRcdFx0fSkpIGFzIENvbnRyb2w7XG5cblx0XHRcdGFjdGlvblBhcmFtZXRlckluZm9zID0gYUFjdGlvblBhcmFtZXRlcnMubWFwKChhY3Rpb25QYXJhbWV0ZXIpID0+IHtcblx0XHRcdFx0Y29uc3QgZmllbGQgPSBDb3JlLmJ5SWQoZ2VuZXJhdGUoW1wiQVBEX1wiLCBhY3Rpb25QYXJhbWV0ZXIuJE5hbWVdKSkgYXMgRmllbGQgfCBNdWx0aVZhbHVlRmllbGQ7XG5cdFx0XHRcdGNvbnN0IGlzTXVsdGlWYWx1ZSA9IGZpZWxkLmlzQShcInNhcC51aS5tZGMuTXVsdGlWYWx1ZUZpZWxkXCIpO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHBhcmFtZXRlcjogYWN0aW9uUGFyYW1ldGVyLFxuXHRcdFx0XHRcdGZpZWxkOiBmaWVsZCxcblx0XHRcdFx0XHRpc011bHRpVmFsdWU6IGlzTXVsdGlWYWx1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IG9QYXJlbnRDb250cm9sLmdldENvbnRyb2xsZXIoKS5vUmVzb3VyY2VCdW5kbGU7XG5cdFx0XHRsZXQgYWN0aW9uUmVzdWx0ID0ge1xuXHRcdFx0XHRkaWFsb2dDYW5jZWxsZWQ6IHRydWUsIC8vIHRvIGJlIHNldCB0byBmYWxzZSBpbiBjYXNlIG9mIHN1Y2Nlc3NmdWwgYWN0aW9uIGV4ZWN0aW9uXG5cdFx0XHRcdHJlc3VsdDogdW5kZWZpbmVkXG5cdFx0XHR9O1xuXHRcdFx0Y29uc3Qgb0RpYWxvZyA9IG5ldyBEaWFsb2coZ2VuZXJhdGUoW1wiZmVcIiwgXCJBUERfXCIsIHNBY3Rpb25OYW1lXSksIHtcblx0XHRcdFx0dGl0bGU6IHNBY3Rpb25MYWJlbCB8fCBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfT1BFUkFUSU9OU19BQ1RJT05fUEFSQU1FVEVSX0RJQUxPR19USVRMRVwiLCBvUmVzb3VyY2VCdW5kbGUpLFxuXHRcdFx0XHRjb250ZW50OiBbb0RpYWxvZ0NvbnRlbnRdLFxuXHRcdFx0XHRlc2NhcGVIYW5kbGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gZXNjYXBlIGhhbmRsZXIgaXMgbWVhbnQgdG8gcG9zc2libHkgc3VwcHJlc3Mgb3IgcG9zdHBvbmUgY2xvc2luZyB0aGUgZGlhbG9nIG9uIGVzY2FwZSAoYnkgY2FsbGluZyBcInJlamVjdFwiIG9uIHRoZSBwcm92aWRlZCBvYmplY3QsIG9yIFwicmVzb2x2ZVwiIG9ubHkgd2hlblxuXHRcdFx0XHRcdC8vIGRvbmUgd2l0aCBhbGwgdGFza3MgdG8gaGFwcGVuIGJlZm9yZSBkaWFsb2cgY2FuIGJlIGNsb3NlZCkuIEl0J3Mgbm90IGludGVuZGVkIHRvIGV4cGxpY2V0bHkgY2xvc2UgdGhlIGRpYWxvZyBoZXJlICh0aGF0IGhhcHBlbnMgYXV0b21hdGljYWxseSB3aGVuIG5vXG5cdFx0XHRcdFx0Ly8gZXNjYXBlSGFuZGxlciBpcyBwcm92aWRlZCBvciB0aGUgcmVzb2x2ZS1jYWxsYmFjayBpcyBjYWxsZWQpIG9yIGZvciBvd24gd3JhcCB1cCB0YXNrcyAobGlrZSByZW1vdmluZyB2YWxpZGl0aW9uIG1lc3NhZ2VzIC0gdGhpcyBzaG91bGQgaGFwcGVuIGluIHRoZVxuXHRcdFx0XHRcdC8vIGFmdGVyQ2xvc2UpLlxuXHRcdFx0XHRcdC8vIFRPRE86IE1vdmUgd3JhcCB1cCB0YXNrcyB0byBhZnRlckNsb3NlLCBhbmQgcmVtb3ZlIHRoaXMgbWV0aG9kIGNvbXBsZXRlbHkuIFRha2UgY2FyZSB0byBhbHNvIGFkYXB0IGVuZCBidXR0b24gcHJlc3MgaGFuZGxlciBhY2NvcmRpbmdseS5cblx0XHRcdFx0XHQvLyBDdXJyZW50bHkgb25seSBzdGlsbCBuZWVkZWQgdG8gZGlmZmVyZW50aWF0ZSBjbG9zaW5nIGRpYWxvZyBhZnRlciBzdWNjZXNzZnVsIGV4ZWN1dGlvbiAodXNlcyByZXNvbHZlKSBmcm9tIHVzZXIgY2FuY2VsbGF0aW9uICh1c2luZyByZWplY3QpXG5cdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdC8vXHRcdHJlamVjdChDb25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0YmVnaW5CdXR0b246IG5ldyBCdXR0b24oZ2VuZXJhdGUoW1wiZmVcIiwgXCJBUERfXCIsIHNBY3Rpb25OYW1lLCBcIkFjdGlvblwiLCBcIk9rXCJdKSwge1xuXHRcdFx0XHRcdHRleHQ6IGJJc0NyZWF0ZUFjdGlvblxuXHRcdFx0XHRcdFx0PyBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX1NBUEZFX0FDVElPTl9DUkVBVEVfQlVUVE9OXCIsIG9SZXNvdXJjZUJ1bmRsZSlcblx0XHRcdFx0XHRcdDogX2dldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWUob1Jlc291cmNlQnVuZGxlLCBzQWN0aW9uTGFiZWwsIHNBY3Rpb25OYW1lLCBlbnRpdHlTZXROYW1lKSxcblx0XHRcdFx0XHR0eXBlOiBcIkVtcGhhc2l6ZWRcIixcblx0XHRcdFx0XHRwcmVzczogYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0aWYgKCEoYXdhaXQgX3ZhbGlkYXRlUHJvcGVydGllcyhvUmVzb3VyY2VCdW5kbGUpKSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIubG9jayhvRGlhbG9nKTtcblxuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIFRPRE86IGR1ZSB0byB1c2luZyB0aGUgc2VhcmNoIGFuZCB2YWx1ZSBoZWxwcyBvbiB0aGUgYWN0aW9uIGRpYWxvZyB0cmFuc2llbnQgbWVzc2FnZXMgY291bGQgYXBwZWFyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gd2UgbmVlZCBhbiBVWCBkZXNpZ24gZm9yIHRob3NlIHRvIHNob3cgdGhlbSB0byB0aGUgdXNlciAtIGZvciBub3cgcmVtb3ZlIHRoZW0gYmVmb3JlIGNvbnRpbnVpbmdcblx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlci5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdFx0XHQvLyBtb3ZlIHBhcmFtZXRlciB2YWx1ZXMgZnJvbSBEaWFsb2cgKFNpbXBsZUZvcm0pIHRvIG1QYXJhbWV0ZXJzLmFjdGlvblBhcmFtZXRlcnMgc28gdGhhdCB0aGV5IGFyZSBhdmFpbGFibGUgaW4gdGhlIG9wZXJhdGlvbiBiaW5kaW5ncyBmb3IgYWxsIGNvbnRleHRzXG5cdFx0XHRcdFx0XHRcdFx0bGV0IHZQYXJhbWV0ZXJWYWx1ZTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvUGFyYW1ldGVyQ29udGV4dCA9IG9PcGVyYXRpb25CaW5kaW5nICYmIG9PcGVyYXRpb25CaW5kaW5nLmdldFBhcmFtZXRlckNvbnRleHQoKTtcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gYUFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChhQWN0aW9uUGFyYW1ldGVyc1tpXS4kaXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFNVkZDb250ZW50ID0gb0RpYWxvZy5nZXRNb2RlbChcIm12ZnZpZXdcIikuZ2V0UHJvcGVydHkoYC8ke2FBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lfWApLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFLZXlWYWx1ZXMgPSBbXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBqIGluIGFNVkZDb250ZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YUtleVZhbHVlcy5wdXNoKGFNVkZDb250ZW50W2pdLktleSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0dlBhcmFtZXRlclZhbHVlID0gYUtleVZhbHVlcztcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZQYXJhbWV0ZXJWYWx1ZSA9IG9QYXJhbWV0ZXJDb250ZXh0LmdldFByb3BlcnR5KGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2ldLnZhbHVlID0gdlBhcmFtZXRlclZhbHVlOyAvLyB3cml0aW5nIHRoZSBjdXJyZW50IHZhbHVlICh1ZXNlciBpbnB1dCEpIGludG8gdGhlIG1ldGFtb2RlbCA9PiBzaG91bGQgYmUgcmVmYWN0b3JlZCB0byB1c2UgQWN0aW9uUGFyYW1ldGVySW5mb3MgaW5zdGVhZC4gVXNlZCBpbiBzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWVcblx0XHRcdFx0XHRcdFx0XHRcdHZQYXJhbWV0ZXJWYWx1ZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubGFiZWwgPSBzQWN0aW9uTGFiZWw7XG5cdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFSZXN1bHQgPSBhd2FpdCBleGVjdXRlQVBNQWN0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0b1BhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9EaWFsb2csXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdGFjdGlvblJlc3VsdCA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGlhbG9nQ2FuY2VsbGVkOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0OiBhUmVzdWx0XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gcmVzb2x2ZShhUmVzdWx0KTtcblx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgbWVzc2FnZXMgPSBzYXAudWkuZ2V0Q29yZSgpLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmRlbGF5U3VjY2Vzc01lc3NhZ2VzID1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcy5jb25jYXQobWVzc2FnZXMpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgb0Vycm9yO1xuXHRcdFx0XHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmlzNDEyRXhlY3V0ZWQgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHMubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdHJpY3RIYW5kbGluZ0ZhaWxzID0gc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgYUZhaWxlZENvbnRleHRzID0gW10gYXMgYW55O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nRmFpbHMuZm9yRWFjaChmdW5jdGlvbiAoZmFpbDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhRmFpbGVkQ29udGV4dHMucHVzaChmYWlsLm9BY3Rpb24uZ2V0Q29udGV4dCgpKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5hQ29udGV4dHMgPSBhRmFpbGVkQ29udGV4dHM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgYVJlc3VsdCA9IGF3YWl0IGV4ZWN1dGVBUE1BY3Rpb24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFjdGlvblJlc3VsdCA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRpYWxvZ0NhbmNlbGxlZDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQ6IGFSZXN1bHRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIHJlc29sdmUoYVJlc3VsdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscy5sZW5ndGhcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKS5hZGRNZXNzYWdlcyhzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3Blbjogb0RpYWxvZy5pc09wZW4oKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9uQmVmb3JlU2hvd01lc3NhZ2U6IGZ1bmN0aW9uIChhTWVzc2FnZXM6IGFueSwgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW46IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayhcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKEJ1c3lMb2NrZXIuaXNMb2NrZWQob0RpYWxvZykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0RpYWxvZyk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdGxldCBzaG93TWVzc2FnZURpYWxvZyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHQ6IG1QYXJhbWV0ZXJzLmFDb250ZXh0c1swXSxcblx0XHRcdFx0XHRcdFx0XHRcdGlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3Blbjogb0RpYWxvZy5pc09wZW4oKSxcblx0XHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2VQYWdlTmF2aWdhdGlvbkNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRvbkJlZm9yZVNob3dNZXNzYWdlOiBmdW5jdGlvbiAoYU1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyc0luOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gV2h5IGlzIHRoaXMgaW1wbGVtZW50ZWQgYXMgY2FsbGJhY2s/IEFwcGFyZW50bHksIGFsbCBuZWVkZWQgaW5mb3JtYXRpb24gaXMgYXZhaWxhYmxlIGJlZm9yZWhhbmRcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gVE9ETzogcmVmYWN0b3IgYWNjb3JkaW5nbHlcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzID0gYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayhcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW5cblx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBzaG93TWVzc2FnZVBhcmFtZXRlcnMuc2hvd01lc3NhZ2VEaWFsb2c7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzaG93TWVzc2FnZVBhcmFtZXRlcnM7XG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHM6IG1QYXJhbWV0ZXJzLmFDb250ZXh0cyxcblx0XHRcdFx0XHRcdFx0XHRcdHNBY3Rpb25OYW1lOiBzQWN0aW9uTGFiZWwsXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250cm9sOiBtUGFyYW1ldGVycy5jb250cm9sXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBJbiBjYXNlIG9mIGJhY2tlbmQgdmFsaWRhdGlvbiBlcnJvcihzPyksIG1lc3NhZ2Ugc2hhbGwgbm90IGJlIHNob3duIGluIG1lc3NhZ2UgZGlhbG9nIGJ1dCBuZXh0IHRvIHRoZSBmaWVsZCBvbiBwYXJhbWV0ZXIgZGlhbG9nLCB3aGljaCBzaG91bGRcblx0XHRcdFx0XHRcdFx0XHQvLyBzdGF5IG9wZW4gaW4gdGhpcyBjYXNlID0+IGluIHRoaXMgY2FzZSwgd2UgbXVzdCBub3QgcmVzb2x2ZSBvciByZWplY3QgdGhlIHByb21pc2UgY29udHJvbGxpbmcgdGhlIHBhcmFtZXRlciBkaWFsb2cuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gSW4gYWxsIG90aGVyIGNhc2VzIChlLmcuIG90aGVyIGJhY2tlbmQgZXJyb3JzIG9yIHVzZXIgY2FuY2VsbGF0aW9uKSwgdGhlIHByb21pc2UgY29udHJvbGxpbmcgdGhlIHBhcmFtZXRlciBkaWFsb2cgbmVlZHMgdG8gYmUgcmVqZWN0ZWQgdG8gYWxsb3dcblx0XHRcdFx0XHRcdFx0XHQvLyBjYWxsZXJzIHRvIHJlYWN0LiAoRXhhbXBsZTogSWYgY3JlYXRpb24gaW4gYmFja2VuZCBhZnRlciBuYXZpZ2F0aW9uIHRvIHRyYW5zaWVudCBjb250ZXh0IGZhaWxzLCBiYWNrIG5hdmlnYXRpb24gbmVlZHMgdG8gYmUgdHJpZ2dlcmVkKVxuXHRcdFx0XHRcdFx0XHRcdC8vIFRPRE86IFJlZmFjdG9yIHRvIHNlcGFyYXRlIGRpYWxvZyBoYW5kbGluZyBmcm9tIGJhY2tlbmQgcmVxdWVzdCBpc3RlYWQgb2YgdGFraW5nIGRlY2lzaW9uIGJhc2VkIG9uIG1lc3NhZ2UgaGFuZGxpbmdcblx0XHRcdFx0XHRcdFx0XHRpZiAoc2hvd01lc3NhZ2VEaWFsb2cpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvRGlhbG9nLmlzT3BlbigpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGRvIG5vdGhpbmcsIGRvIG5vdCByZWplY3QgcHJvbWlzZSBoZXJlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFdlIGRvIG5vdCBjbG9zZSB0aGUgQVBNIGRpYWxvZyBpZiB1c2VyIGVudGVycyBhIHdyb25nIHZhbHVlIGluIG9mIHRoZSBmaWVsZHMgdGhhdCByZXN1bHRzIGluIGFuIGVycm9yIGZyb20gdGhlIGJhY2tlbmQuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFRoZSB1c2VyIGNhbiBjbG9zZSB0aGUgbWVzc2FnZSBkaWFsb2cgYW5kIHRoZSBBUE0gZGlhbG9nIHdvdWxkIHN0aWxsIGJlIG9wZW4gb24gd2hpY2ggaGUgY291bGQgZW50ZXIgYSBuZXcgdmFsdWUgYW5kIHRyaWdnZXIgdGhlIGFjdGlvbiBhZ2Fpbi5cblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gRWFybGllciB3ZSB3ZXJlIHJlamVjdGluZyB0aGUgcHJvbWlzZSBvbiBlcnJvciBoZXJlLCBhbmQgdGhlIGNhbGwgc3RhY2sgd2FzIGRlc3Ryb3llZCBhcyB0aGUgcHJvbWlzZSB3YXMgcmVqZWN0ZWQgYW5kIHJldHVybmVkIHRvIEVkaXRGbG93IGludm9rZSBhY3Rpb24uXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIEJ1dCBzaW5jZSB0aGUgQVBNIGRpYWxvZyB3YXMgc3RpbGwgb3BlbiwgYSBuZXcgcHJvbWlzZSB3YXMgcmVzb2x2ZWQgaW4gY2FzZSB0aGUgdXNlciByZXRyaWVkIHRoZSBhY3Rpb24gYW5kIHRoZSBvYmplY3Qgd2FzIGNyZWF0ZWQsIGJ1dCB0aGUgbmF2aWdhdGlvbiB0byBvYmplY3QgcGFnZSB3YXMgbm90IHRha2luZyBwbGFjZS5cblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlamVjdChvRXJyb3IpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpczQxMkV4ZWN1dGVkOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzOiBbXSxcblx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nUHJvbWlzZXM6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXM6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGVsYXlTdWNjZXNzTWVzc2FnZXM6IFtdLFxuXHRcdFx0XHRcdFx0XHRcdFx0cHJvY2Vzc2VkTWVzc2FnZUlkczogW11cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKG9EaWFsb2cpKSB7XG5cdFx0XHRcdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0RpYWxvZyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pLFxuXHRcdFx0XHRlbmRCdXR0b246IG5ldyBCdXR0b24oZ2VuZXJhdGUoW1wiZmVcIiwgXCJBUERfXCIsIHNBY3Rpb25OYW1lLCBcIkFjdGlvblwiLCBcIkNhbmNlbFwiXSksIHtcblx0XHRcdFx0XHR0ZXh0OiBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09NTU9OX0FDVElPTl9QQVJBTUVURVJfRElBTE9HX0NBTkNFTFwiLCBvUmVzb3VyY2VCdW5kbGUpLFxuXHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHQvLyBUT0RPOiBjYW5jZWwgYnV0dG9uIHNob3VsZCBqdXN0IGNsb3NlIHRoZSBkaWFsb2cgKHNpbWlsYXIgdG8gdXNpbmcgZXNjYXBlKS4gQWxsIHdyYXAgdXAgdGFza3Mgc2hvdWxkIGJlIG1vdmVkIHRvIGFmdGVyQ2xvc2UuXG5cdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHQvLyByZWplY3QoQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSxcblx0XHRcdFx0Ly8gVE9ETzogYmVmb3JlT3BlbiBpcyBqdXN0IGFuIGV2ZW50LCBpLmUuIG5vdCB3YWl0aW5nIGZvciB0aGUgUHJvbWlzZSB0byBiZSByZXNvbHZlZC4gQ2hlY2sgaWYgdGFza3Mgb2YgdGhpcyBmdW5jdGlvbiBuZWVkIHRvIGJlIGRvbmUgYmVmb3JlIG9wZW5pbmcgdGhlIGRpYWxvZ1xuXHRcdFx0XHQvLyAtIGlmIHllcywgdGhleSBuZWVkIHRvIGJlIG1vdmVkIG91dHNpZGUuXG5cdFx0XHRcdC8vIEFzc3VtcHRpb246IFNvbWV0aW1lcyBkaWFsb2cgY2FuIGJlIHNlZW4gd2l0aG91dCBhbnkgZmllbGRzIGZvciBhIHNob3J0IHRpbWUgLSBtYXliZSB0aGlzIGlzIGNhdXNlZCBieSB0aGlzIGFzeW5jaHJvbml0eVxuXHRcdFx0XHRiZWZvcmVPcGVuOiBhc3luYyBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0XHQvLyBjbG9uZSBldmVudCBmb3IgYWN0aW9uV3JhcHBlciBhcyBvRXZlbnQub1NvdXJjZSBnZXRzIGxvc3QgZHVyaW5nIHByb2Nlc3Npbmcgb2YgYmVmb3JlT3BlbiBldmVudCBoYW5kbGVyXG5cdFx0XHRcdFx0Y29uc3Qgb0Nsb25lRXZlbnQgPSBPYmplY3QuYXNzaWduKHt9LCBvRXZlbnQpO1xuXG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0Y29uc3QgZ2V0RGVmYXVsdFZhbHVlc0Z1bmN0aW9uID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9EaWFsb2cuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0c0FjdGlvblBhdGggPSBvQWN0aW9uQ29udGV4dC5zUGF0aCAmJiBvQWN0aW9uQ29udGV4dC5zUGF0aC5zcGxpdChcIi9AXCIpWzBdLFxuXHRcdFx0XHRcdFx0XHRzRGVmYXVsdFZhbHVlc0Z1bmN0aW9uID0gb01ldGFNb2RlbC5nZXRPYmplY3QoXG5cdFx0XHRcdFx0XHRcdFx0YCR7c0FjdGlvblBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EZWZhdWx0VmFsdWVzRnVuY3Rpb25gXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc0RlZmF1bHRWYWx1ZXNGdW5jdGlvbjtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGNvbnN0IGZuU2V0RGVmYXVsdHNBbmRPcGVuRGlhbG9nID0gYXN5bmMgZnVuY3Rpb24gKHNCaW5kaW5nUGFyYW1ldGVyPzogYW55KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzQm91bmRGdW5jdGlvbk5hbWUgPSBnZXREZWZhdWx0VmFsdWVzRnVuY3Rpb24oKTtcblx0XHRcdFx0XHRcdGNvbnN0IHByZWZpbGxQYXJhbWV0ZXIgPSBhc3luYyBmdW5jdGlvbiAoc1BhcmFtTmFtZTogYW55LCB2UGFyYW1EZWZhdWx0VmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHQvLyBDYXNlIDE6IFRoZXJlIGlzIGEgUGFyYW1ldGVyRGVmYXVsdFZhbHVlIGFubm90YXRpb25cblx0XHRcdFx0XHRcdFx0aWYgKHZQYXJhbURlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFDb250ZXh0cy5sZW5ndGggPiAwICYmIHZQYXJhbURlZmF1bHRWYWx1ZS4kUGF0aCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHZQYXJhbVZhbHVlID0gYXdhaXQgQ29tbW9uVXRpbHMucmVxdWVzdFNpbmdsZXRvblByb3BlcnR5KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZQYXJhbURlZmF1bHRWYWx1ZS4kUGF0aCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvT3BlcmF0aW9uQmluZGluZy5nZXRNb2RlbCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh2UGFyYW1WYWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZQYXJhbVZhbHVlID0gYXdhaXQgb09wZXJhdGlvbkJpbmRpbmdcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5nZXRQYXJhbWV0ZXJDb250ZXh0KClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5yZXF1ZXN0UHJvcGVydHkodlBhcmFtRGVmYXVsdFZhbHVlLiRQYXRoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYUNvbnRleHRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBGb3IgbXVsdGkgc2VsZWN0LCBuZWVkIHRvIGxvb3Agb3ZlciBhQ29udGV4dHMgKGFzIGNvbnRleHRzIGNhbm5vdCBiZSByZXRyaWV2ZWQgdmlhIGJpbmRpbmcgcGFyYW1ldGVyIG9mIHRoZSBvcGVyYXRpb24gYmluZGluZylcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgc1BhdGhGb3JDb250ZXh0ID0gdlBhcmFtRGVmYXVsdFZhbHVlLiRQYXRoO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChzUGF0aEZvckNvbnRleHQuaW5kZXhPZihgJHtzQmluZGluZ1BhcmFtZXRlcn0vYCkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNQYXRoRm9yQ29udGV4dCA9IHNQYXRoRm9yQ29udGV4dC5yZXBsYWNlKGAke3NCaW5kaW5nUGFyYW1ldGVyfS9gLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCBhQ29udGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChhQ29udGV4dHNbaV0uZ2V0UHJvcGVydHkoc1BhdGhGb3JDb250ZXh0KSAhPT0gdlBhcmFtVmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gaWYgdGhlIHZhbHVlcyBmcm9tIHRoZSBjb250ZXh0cyBhcmUgbm90IGFsbCB0aGUgc2FtZSwgZG8gbm90IHByZWZpbGxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwYXJhbU5hbWU6IHNQYXJhbU5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRiTm9Qb3NzaWJsZVZhbHVlOiB0cnVlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB7IHBhcmFtTmFtZTogc1BhcmFtTmFtZSwgdmFsdWU6IHZQYXJhbVZhbHVlIH07XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVhZGluZyBkZWZhdWx0IGFjdGlvbiBwYXJhbWV0ZXJcIiwgc1BhcmFtTmFtZSwgbVBhcmFtZXRlcnMuYWN0aW9uTmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1OYW1lOiBzUGFyYW1OYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YkxhdGVQcm9wZXJ0eUVycm9yOiB0cnVlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIENhc2UgMS4yOiBQYXJhbWV0ZXJEZWZhdWx0VmFsdWUgZGVmaW5lcyBhIGZpeGVkIHN0cmluZyB2YWx1ZSAoaS5lLiB2UGFyYW1EZWZhdWx0VmFsdWUgPSAnc29tZVN0cmluZycpXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4geyBwYXJhbU5hbWU6IHNQYXJhbU5hbWUsIHZhbHVlOiB2UGFyYW1EZWZhdWx0VmFsdWUgfTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAob1BhcmFtZXRlck1vZGVsICYmIChvUGFyYW1ldGVyTW9kZWwgYXMgYW55KS5vRGF0YVtzUGFyYW1OYW1lXSkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIENhc2UgMjogVGhlcmUgaXMgbm8gUGFyYW1ldGVyRGVmYXVsdFZhbHVlIGFubm90YXRpb24gKD0+IGxvb2sgaW50byB0aGUgRkxQIFVzZXIgRGVmYXVsdHMpXG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1OYW1lOiBzUGFyYW1OYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0dmFsdWU6IChvUGFyYW1ldGVyTW9kZWwgYXMgYW55KS5vRGF0YVtzUGFyYW1OYW1lXVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgcGFyYW1OYW1lOiBzUGFyYW1OYW1lLCB2YWx1ZTogdW5kZWZpbmVkIH07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGNvbnN0IGdldFBhcmFtZXRlckRlZmF1bHRWYWx1ZSA9IGZ1bmN0aW9uIChzUGFyYW1OYW1lOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9EaWFsb2cuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRzQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvblBhdGggPSBDb21tb25VdGlscy5nZXRQYXJhbWV0ZXJQYXRoKG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKSwgc1BhcmFtTmFtZSkgKyBcIkBcIixcblx0XHRcdFx0XHRcdFx0XHRvUGFyYW1ldGVyQW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvblBhdGgpLFxuXHRcdFx0XHRcdFx0XHRcdG9QYXJhbWV0ZXJEZWZhdWx0VmFsdWUgPVxuXHRcdFx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlckFubm90YXRpb25zICYmIG9QYXJhbWV0ZXJBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QYXJhbWV0ZXJEZWZhdWx0VmFsdWVcIl07IC8vIGVpdGhlciB7ICRQYXRoOiAnc29tZVBhdGgnIH0gb3IgJ3NvbWVTdHJpbmcnXG5cdFx0XHRcdFx0XHRcdHJldHVybiBvUGFyYW1ldGVyRGVmYXVsdFZhbHVlO1xuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0Y29uc3QgYUN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZSA9IFtdO1xuXHRcdFx0XHRcdFx0bGV0IHNQYXJhbU5hbWUsIHZQYXJhbWV0ZXJEZWZhdWx0VmFsdWU7XG5cdFx0XHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gYUFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRcdFx0c1BhcmFtTmFtZSA9IGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lO1xuXHRcdFx0XHRcdFx0XHR2UGFyYW1ldGVyRGVmYXVsdFZhbHVlID0gZ2V0UGFyYW1ldGVyRGVmYXVsdFZhbHVlKHNQYXJhbU5hbWUpO1xuXHRcdFx0XHRcdFx0XHRhQ3VycmVudFBhcmFtRGVmYXVsdFZhbHVlLnB1c2gocHJlZmlsbFBhcmFtZXRlcihzUGFyYW1OYW1lLCB2UGFyYW1ldGVyRGVmYXVsdFZhbHVlKSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChvQWN0aW9uQ29udGV4dC5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSAmJiBhQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoc0JvdW5kRnVuY3Rpb25OYW1lICYmIHNCb3VuZEZ1bmN0aW9uTmFtZS5sZW5ndGggPiAwICYmIHR5cGVvZiBzQm91bmRGdW5jdGlvbk5hbWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gYUNvbnRleHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRhRnVuY3Rpb25QYXJhbXMucHVzaChjYWxsQm91bmRGdW5jdGlvbihzQm91bmRGdW5jdGlvbk5hbWUsIGFDb250ZXh0c1tpXSwgbVBhcmFtZXRlcnMubW9kZWwpKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Y29uc3QgYVByZWZpbGxQYXJhbVByb21pc2VzID0gUHJvbWlzZS5hbGwoYUN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZSk7XG5cdFx0XHRcdFx0XHRsZXQgYUV4ZWNGdW5jdGlvblByb21pc2VzOiBQcm9taXNlPGFueVtdPiA9IFByb21pc2UucmVzb2x2ZShbXSk7XG5cdFx0XHRcdFx0XHRsZXQgb0V4ZWNGdW5jdGlvbkZyb21NYW5pZmVzdFByb21pc2U7XG5cdFx0XHRcdFx0XHRpZiAoYUZ1bmN0aW9uUGFyYW1zICYmIGFGdW5jdGlvblBhcmFtcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGFFeGVjRnVuY3Rpb25Qcm9taXNlcyA9IFByb21pc2UuYWxsKGFGdW5jdGlvblBhcmFtcyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNNb2R1bGUgPSBtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb25cblx0XHRcdFx0XHRcdFx0XHRcdC5zdWJzdHJpbmcoMCwgbVBhcmFtZXRlcnMuZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uLmxhc3RJbmRleE9mKFwiLlwiKSB8fCAtMSlcblx0XHRcdFx0XHRcdFx0XHRcdC5yZXBsYWNlKC9cXC4vZ2ksIFwiL1wiKSxcblx0XHRcdFx0XHRcdFx0XHRzRnVuY3Rpb25OYW1lID0gbVBhcmFtZXRlcnMuZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uLnN1YnN0cmluZyhcblx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbi5sYXN0SW5kZXhPZihcIi5cIikgKyAxLFxuXHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdG9FeGVjRnVuY3Rpb25Gcm9tTWFuaWZlc3RQcm9taXNlID0gRlBNSGVscGVyLmFjdGlvbldyYXBwZXIob0Nsb25lRXZlbnQsIHNNb2R1bGUsIHNGdW5jdGlvbk5hbWUsIHtcblx0XHRcdFx0XHRcdFx0XHRjb250ZXh0czogYUNvbnRleHRzXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhUHJvbWlzZXMgPSBhd2FpdCBQcm9taXNlLmFsbChbXG5cdFx0XHRcdFx0XHRcdFx0YVByZWZpbGxQYXJhbVByb21pc2VzLFxuXHRcdFx0XHRcdFx0XHRcdGFFeGVjRnVuY3Rpb25Qcm9taXNlcyxcblx0XHRcdFx0XHRcdFx0XHRvRXhlY0Z1bmN0aW9uRnJvbU1hbmlmZXN0UHJvbWlzZVxuXHRcdFx0XHRcdFx0XHRdKTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgY3VycmVudFBhcmFtRGVmYXVsdFZhbHVlOiBhbnkgPSBhUHJvbWlzZXNbMF07XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGZ1bmN0aW9uUGFyYW1zID0gYVByb21pc2VzWzFdO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvRnVuY3Rpb25QYXJhbXNGcm9tTWFuaWZlc3QgPSBhUHJvbWlzZXNbMl07XG5cdFx0XHRcdFx0XHRcdGxldCBzRGlhbG9nUGFyYW1OYW1lOiBzdHJpbmc7XG5cblx0XHRcdFx0XHRcdFx0Ly8gRmlsbCB0aGUgZGlhbG9nIHdpdGggdGhlIGVhcmxpZXIgZGV0ZXJtaW5lZCBwYXJhbWV0ZXIgdmFsdWVzIGZyb20gdGhlIGRpZmZlcmVudCBzb3VyY2VzXG5cdFx0XHRcdFx0XHRcdGZvciAoY29uc3QgaSBpbiBhQWN0aW9uUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdFx0XHRcdHNEaWFsb2dQYXJhbU5hbWUgPSBhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZTtcblx0XHRcdFx0XHRcdFx0XHQvLyBQYXJhbWV0ZXIgdmFsdWVzIHByb3ZpZGVkIGluIHRoZSBjYWxsIG9mIGludm9rZUFjdGlvbiBvdmVycnVsZSBvdGhlciBzb3VyY2VzXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgdlBhcmFtZXRlclByb3ZpZGVkVmFsdWUgPSBhUGFyYW1ldGVyVmFsdWVzPy5maW5kKFxuXHRcdFx0XHRcdFx0XHRcdFx0KGVsZW1lbnQ6IGFueSkgPT4gZWxlbWVudC5uYW1lID09PSBhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZVxuXHRcdFx0XHRcdFx0XHRcdCk/LnZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdGlmICh2UGFyYW1ldGVyUHJvdmlkZWRWYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuc2V0UGFyYW1ldGVyKGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lLCB2UGFyYW1ldGVyUHJvdmlkZWRWYWx1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChvRnVuY3Rpb25QYXJhbXNGcm9tTWFuaWZlc3QgJiYgb0Z1bmN0aW9uUGFyYW1zRnJvbU1hbmlmZXN0Lmhhc093blByb3BlcnR5KHNEaWFsb2dQYXJhbU5hbWUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvT3BlcmF0aW9uQmluZGluZy5zZXRQYXJhbWV0ZXIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvRnVuY3Rpb25QYXJhbXNGcm9tTWFuaWZlc3Rbc0RpYWxvZ1BhcmFtTmFtZV1cblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWVbaV0gJiYgY3VycmVudFBhcmFtRGVmYXVsdFZhbHVlW2ldLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25CaW5kaW5nLnNldFBhcmFtZXRlcihhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZSwgY3VycmVudFBhcmFtRGVmYXVsdFZhbHVlW2ldLnZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGlmIHRoZSBkZWZhdWx0IHZhbHVlIGhhZCBub3QgYmVlbiBwcmV2aW91c2x5IGRldGVybWluZWQgZHVlIHRvIGRpZmZlcmVudCBjb250ZXh0cywgd2UgZG8gbm90aGluZyBlbHNlXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChzQm91bmRGdW5jdGlvbk5hbWUgJiYgIWN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZVtpXS5iTm9Qb3NzaWJsZVZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoYUNvbnRleHRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gd2UgY2hlY2sgaWYgdGhlIGZ1bmN0aW9uIHJldHJpZXZlcyB0aGUgc2FtZSBwYXJhbSB2YWx1ZSBmb3IgYWxsIHRoZSBjb250ZXh0czpcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IGogPSAwO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR3aGlsZSAoaiA8IGFDb250ZXh0cy5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb25QYXJhbXNbal0gJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uUGFyYW1zW2ogKyAxXSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb25QYXJhbXNbal0uZ2V0T2JqZWN0KHNEaWFsb2dQYXJhbU5hbWUpID09PVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvblBhcmFtc1tqICsgMV0uZ2V0T2JqZWN0KHNEaWFsb2dQYXJhbU5hbWUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqKys7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL3BhcmFtIHZhbHVlcyBhcmUgYWxsIHRoZSBzYW1lOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoaiA9PT0gYUNvbnRleHRzLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvT3BlcmF0aW9uQmluZGluZy5zZXRQYXJhbWV0ZXIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uUGFyYW1zW2pdLmdldE9iamVjdChzRGlhbG9nUGFyYW1OYW1lKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZnVuY3Rpb25QYXJhbXNbMF0gJiYgZnVuY3Rpb25QYXJhbXNbMF0uZ2V0T2JqZWN0KHNEaWFsb2dQYXJhbU5hbWUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vT25seSBvbmUgY29udGV4dCwgdGhlbiB0aGUgZGVmYXVsdCBwYXJhbSB2YWx1ZXMgYXJlIHRvIGJlIHZlcmlmaWVkIGZyb20gdGhlIGZ1bmN0aW9uOlxuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25CaW5kaW5nLnNldFBhcmFtZXRlcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvblBhcmFtc1swXS5nZXRPYmplY3Qoc0RpYWxvZ1BhcmFtTmFtZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y29uc3QgYkVycm9yRm91bmQgPSBjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWUuc29tZShmdW5jdGlvbiAob1ZhbHVlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAob1ZhbHVlLmJMYXRlUHJvcGVydHlFcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9WYWx1ZS5iTGF0ZVByb3BlcnR5RXJyb3I7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0Ly8gSWYgYXQgbGVhc3Qgb25lIERlZmF1bHQgUHJvcGVydHkgaXMgYSBMYXRlIFByb3BlcnR5IGFuZCBhbiBlVGFnIGVycm9yIHdhcyByYWlzZWQuXG5cdFx0XHRcdFx0XHRcdGlmIChiRXJyb3JGb3VuZCkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNUZXh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0FQUF9DT01QT05FTlRfU0FQRkVfRVRBR19MQVRFX1BST1BFUlRZXCIsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdFx0XHRcdFx0XHRcdFx0TWVzc2FnZUJveC53YXJuaW5nKHNUZXh0LCB7IGNvbnRlbnRXaWR0aDogXCIyNWVtXCIgfSBhcyBhbnkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBwYXJhbWV0ZXJcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGNvbnN0IGZuQXN5bmNCZWZvcmVPcGVuID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKG9BY3Rpb25Db250ZXh0LmdldE9iamVjdChcIiRJc0JvdW5kXCIpICYmIGFDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gb0FjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KFwiJFBhcmFtZXRlclwiKTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXJhbWV0ZXIgPSBhUGFyYW1ldGVyc1swXSAmJiBhUGFyYW1ldGVyc1swXS4kTmFtZTtcblxuXHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9Db250ZXh0T2JqZWN0ID0gYXdhaXQgYUNvbnRleHRzWzBdLnJlcXVlc3RPYmplY3QoKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAob0NvbnRleHRPYmplY3QpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25CaW5kaW5nLnNldFBhcmFtZXRlcihzQmluZGluZ1BhcmFtZXRlciwgb0NvbnRleHRPYmplY3QpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBmblNldERlZmF1bHRzQW5kT3BlbkRpYWxvZyhzQmluZGluZ1BhcmFtZXRlcik7XG5cdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgcGFyYW1ldGVyXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IGZuU2V0RGVmYXVsdHNBbmRPcGVuRGlhbG9nKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGF3YWl0IGZuQXN5bmNCZWZvcmVPcGVuKCk7XG5cblx0XHRcdFx0XHQvLyBhZGRpbmcgZGVmYXVsdGVkIHZhbHVlcyBvbmx5IGhlcmUgYWZ0ZXIgdGhleSBhcmUgbm90IHNldCB0byB0aGUgZmllbGRzXG5cdFx0XHRcdFx0Zm9yIChjb25zdCBhY3Rpb25QYXJhbWV0ZXJJbmZvIG9mIGFjdGlvblBhcmFtZXRlckluZm9zKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IGFjdGlvblBhcmFtZXRlckluZm8uaXNNdWx0aVZhbHVlXG5cdFx0XHRcdFx0XHRcdD8gKGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQgYXMgTXVsdGlWYWx1ZUZpZWxkKS5nZXRJdGVtcygpXG5cdFx0XHRcdFx0XHRcdDogKGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQgYXMgRmllbGQpLmdldFZhbHVlKCk7XG5cdFx0XHRcdFx0XHRhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbHVlID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbGlkYXRpb25Qcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFmdGVyQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyB3aGVuIHRoZSBkaWFsb2cgaXMgY2FuY2VsbGVkLCBtZXNzYWdlcyBuZWVkIHRvIGJlIHJlbW92ZWQgaW4gY2FzZSB0aGUgc2FtZSBhY3Rpb24gc2hvdWxkIGJlIGV4ZWN1dGVkIGFnYWluXG5cdFx0XHRcdFx0YUFjdGlvblBhcmFtZXRlcnMuZm9yRWFjaChfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlcik7XG5cdFx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0aWYgKGFjdGlvblJlc3VsdC5kaWFsb2dDYW5jZWxsZWQpIHtcblx0XHRcdFx0XHRcdHJlamVjdChDb25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShhY3Rpb25SZXN1bHQucmVzdWx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0bVBhcmFtZXRlcnMub0RpYWxvZyA9IG9EaWFsb2c7XG5cdFx0XHRvRGlhbG9nLnNldE1vZGVsKG9BY3Rpb25Db250ZXh0LmdldE1vZGVsKCkub01vZGVsKTtcblx0XHRcdG9EaWFsb2cuc2V0TW9kZWwob1BhcmFtZXRlck1vZGVsLCBcInBhcmFtc01vZGVsXCIpO1xuXHRcdFx0b0RpYWxvZy5iaW5kRWxlbWVudCh7XG5cdFx0XHRcdHBhdGg6IFwiL1wiLFxuXHRcdFx0XHRtb2RlbDogXCJwYXJhbXNNb2RlbFwiXG5cdFx0XHR9KTtcblxuXG5cdFx0XHQvLyBlbXB0eSBtb2RlbCB0byBhZGQgZWxlbWVudHMgZHluYW1pY2FsbHkgZGVwZW5kaW5nIG9uIG51bWJlciBvZiBNVkYgZmllbGRzIGRlZmluZWQgb24gdGhlIGRpYWxvZ1xuXHRcdFx0Y29uc3Qgb01WRk1vZGVsID0gbmV3IEpTT05Nb2RlbCh7fSk7XG5cdFx0XHRvRGlhbG9nLnNldE1vZGVsKG9NVkZNb2RlbCwgXCJtdmZ2aWV3XCIpO1xuXG5cdFx0XHQvKiBFdmVudCBuZWVkZWQgZm9yIHJlbW92aW5nIG1lc3NhZ2VzIG9mIHZhbGlkIGNoYW5nZWQgZmllbGQgKi9cblx0XHRcdGZvciAoY29uc3QgYWN0aW9uUGFyYW1ldGVySW5mbyBvZiBhY3Rpb25QYXJhbWV0ZXJJbmZvcykge1xuXHRcdFx0XHRpZiAoYWN0aW9uUGFyYW1ldGVySW5mby5pc011bHRpVmFsdWUpIHtcblx0XHRcdFx0XHRhY3Rpb25QYXJhbWV0ZXJJbmZvPy5maWVsZD8uZ2V0QmluZGluZyhcIml0ZW1zXCIpPy5hdHRhY2hDaGFuZ2UoKCkgPT4ge1xuXHRcdFx0XHRcdFx0X3JlbW92ZU1lc3NhZ2VzRm9yQWN0aW9uUGFyYW10ZXIoYWN0aW9uUGFyYW1ldGVySW5mby5wYXJhbWV0ZXIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8/LmZpZWxkPy5nZXRCaW5kaW5nKFwidmFsdWVcIik/LmF0dGFjaENoYW5nZSgoKSA9PiB7XG5cdFx0XHRcdFx0XHRfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlcihhY3Rpb25QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IHNBY3Rpb25QYXRoID0gYCR7c0FjdGlvbk5hbWV9KC4uLilgO1xuXHRcdFx0aWYgKCFhQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHRcdHNBY3Rpb25QYXRoID0gYC8ke3NBY3Rpb25QYXRofWA7XG5cdFx0XHR9XG5cdFx0XHRvRGlhbG9nLmJpbmRFbGVtZW50KHtcblx0XHRcdFx0cGF0aDogc0FjdGlvblBhdGhcblx0XHRcdH0pO1xuXHRcdFx0aWYgKG9QYXJlbnRDb250cm9sKSB7XG5cdFx0XHRcdC8vIGlmIHRoZXJlIGlzIGEgcGFyZW50IGNvbnRyb2wgc3BlY2lmaWVkIGFkZCB0aGUgZGlhbG9nIGFzIGRlcGVuZGVudFxuXHRcdFx0XHRvUGFyZW50Q29udHJvbC5hZGREZXBlbmRlbnQob0RpYWxvZyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYUNvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0b0RpYWxvZy5zZXRCaW5kaW5nQ29udGV4dChhQ29udGV4dHNbMF0pOyAvLyB1c2UgY29udGV4dCBvZiBmaXJzdCBzZWxlY3RlZCBsaW5lIGl0ZW1cblx0XHRcdH1cblx0XHRcdG9PcGVyYXRpb25CaW5kaW5nID0gb0RpYWxvZy5nZXRPYmplY3RCaW5kaW5nKCk7XG5cdFx0XHRvRGlhbG9nLm9wZW4oKTtcblx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0cmVqZWN0KG9FcnJvcik7XG5cdFx0fVxuXHR9KTtcbn1cbmZ1bmN0aW9uIGdldEFjdGlvblBhcmFtZXRlcnMob0FjdGlvbjogYW55KSB7XG5cdGNvbnN0IGFQYXJhbWV0ZXJzID0gb0FjdGlvbi5nZXRPYmplY3QoXCIkUGFyYW1ldGVyXCIpIHx8IFtdO1xuXHRpZiAoYVBhcmFtZXRlcnMgJiYgYVBhcmFtZXRlcnMubGVuZ3RoKSB7XG5cdFx0aWYgKG9BY3Rpb24uZ2V0T2JqZWN0KFwiJElzQm91bmRcIikpIHtcblx0XHRcdC8vaW4gY2FzZSBvZiBib3VuZCBhY3Rpb25zLCBpZ25vcmUgdGhlIGZpcnN0IHBhcmFtZXRlciBhbmQgY29uc2lkZXIgdGhlIHJlc3Rcblx0XHRcdHJldHVybiBhUGFyYW1ldGVycy5zbGljZSgxLCBhUGFyYW1ldGVycy5sZW5ndGgpIHx8IFtdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gYVBhcmFtZXRlcnM7XG59XG5mdW5jdGlvbiBnZXRJc0FjdGlvbkNyaXRpY2FsKG9NZXRhTW9kZWw6IGFueSwgc1BhdGg6IGFueSwgY29udGV4dHM/OiBhbnksIG9Cb3VuZEFjdGlvbj86IGFueSkge1xuXHRjb25zdCB2QWN0aW9uQ3JpdGljYWwgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQWN0aW9uQ3JpdGljYWxgKTtcblx0bGV0IHNDcml0aWNhbFBhdGggPSB2QWN0aW9uQ3JpdGljYWwgJiYgdkFjdGlvbkNyaXRpY2FsLiRQYXRoO1xuXHRpZiAoIXNDcml0aWNhbFBhdGgpIHtcblx0XHQvLyB0aGUgc3RhdGljIHZhbHVlIHNjZW5hcmlvIGZvciBpc0FjdGlvbkNyaXRpY2FsXG5cdFx0cmV0dXJuICEhdkFjdGlvbkNyaXRpY2FsO1xuXHR9XG5cdGNvbnN0IGFCaW5kaW5nUGFyYW1zID0gb0JvdW5kQWN0aW9uICYmIG9Cb3VuZEFjdGlvbi5nZXRPYmplY3QoXCIkUGFyYW1ldGVyXCIpLFxuXHRcdGFQYXRocyA9IHNDcml0aWNhbFBhdGggJiYgc0NyaXRpY2FsUGF0aC5zcGxpdChcIi9cIiksXG5cdFx0YkNvbmRpdGlvbiA9XG5cdFx0XHRhQmluZGluZ1BhcmFtcyAmJiBhQmluZGluZ1BhcmFtcy5sZW5ndGggJiYgdHlwZW9mIGFCaW5kaW5nUGFyYW1zID09PSBcIm9iamVjdFwiICYmIHNDcml0aWNhbFBhdGggJiYgY29udGV4dHMgJiYgY29udGV4dHMubGVuZ3RoO1xuXHRpZiAoYkNvbmRpdGlvbikge1xuXHRcdC8vaW4gY2FzZSBiaW5kaW5nIHBhdGFtZXRlcnMgYXJlIHRoZXJlIGluIHBhdGggbmVlZCB0byByZW1vdmUgZWc6IC0gX2l0L2lzVmVyaWZpZWQgPT4gbmVlZCB0byByZW1vdmUgX2l0IGFuZCB0aGUgcGF0aCBzaG91bGQgYmUgaXNWZXJpZmllZFxuXHRcdGFCaW5kaW5nUGFyYW1zLmZpbHRlcihmdW5jdGlvbiAob1BhcmFtczogYW55KSB7XG5cdFx0XHRjb25zdCBpbmRleCA9IGFQYXRocyAmJiBhUGF0aHMuaW5kZXhPZihvUGFyYW1zLiROYW1lKTtcblx0XHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRcdGFQYXRocy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHNDcml0aWNhbFBhdGggPSBhUGF0aHMuam9pbihcIi9cIik7XG5cdFx0cmV0dXJuIGNvbnRleHRzWzBdLmdldE9iamVjdChzQ3JpdGljYWxQYXRoKTtcblx0fSBlbHNlIGlmIChzQ3JpdGljYWxQYXRoKSB7XG5cdFx0Ly9pZiBzY2VuYXJpbyBpcyBwYXRoIGJhc2VkIHJldHVybiB0aGUgcGF0aCB2YWx1ZVxuXHRcdHJldHVybiBjb250ZXh0c1swXS5nZXRPYmplY3Qoc0NyaXRpY2FsUGF0aCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gX2dldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWUob1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSwgc0FjdGlvbkxhYmVsOiBzdHJpbmcsIHNBY3Rpb25OYW1lOiBzdHJpbmcsIHNFbnRpdHlTZXROYW1lOiBzdHJpbmcpIHtcblx0bGV0IGJvdW5kQWN0aW9uTmFtZTogYW55ID0gc0FjdGlvbk5hbWUgPyBzQWN0aW9uTmFtZSA6IG51bGw7XG5cdGNvbnN0IGFBY3Rpb25OYW1lID0gYm91bmRBY3Rpb25OYW1lLnNwbGl0KFwiLlwiKTtcblx0Ym91bmRBY3Rpb25OYW1lID0gYm91bmRBY3Rpb25OYW1lLmluZGV4T2YoXCIuXCIpID49IDAgPyBhQWN0aW9uTmFtZVthQWN0aW9uTmFtZS5sZW5ndGggLSAxXSA6IGJvdW5kQWN0aW9uTmFtZTtcblx0Y29uc3Qgc3VmZml4UmVzb3VyY2VLZXkgPSBib3VuZEFjdGlvbk5hbWUgJiYgc0VudGl0eVNldE5hbWUgPyBgJHtzRW50aXR5U2V0TmFtZX18JHtib3VuZEFjdGlvbk5hbWV9YCA6IFwiXCI7XG5cdGNvbnN0IHNLZXkgPSBcIkFDVElPTl9QQVJBTUVURVJfRElBTE9HX0FDVElPTl9OQU1FXCI7XG5cdGNvbnN0IGJSZXNvdXJjZUtleUV4aXN0cyA9XG5cdFx0b1Jlc291cmNlQnVuZGxlICYmIENvbW1vblV0aWxzLmNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cygob1Jlc291cmNlQnVuZGxlIGFzIGFueSkuYUN1c3RvbUJ1bmRsZXMsIGAke3NLZXl9fCR7c3VmZml4UmVzb3VyY2VLZXl9YCk7XG5cdGlmIChzQWN0aW9uTGFiZWwpIHtcblx0XHRpZiAoYlJlc291cmNlS2V5RXhpc3RzKSB7XG5cdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoc0tleSwgb1Jlc291cmNlQnVuZGxlLCB1bmRlZmluZWQsIHN1ZmZpeFJlc291cmNlS2V5KTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlICYmXG5cdFx0XHRDb21tb25VdGlscy5jaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMoKG9SZXNvdXJjZUJ1bmRsZSBhcyBhbnkpLmFDdXN0b21CdW5kbGVzLCBgJHtzS2V5fXwke3NFbnRpdHlTZXROYW1lfWApXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoc0tleSwgb1Jlc291cmNlQnVuZGxlLCB1bmRlZmluZWQsIGAke3NFbnRpdHlTZXROYW1lfWApO1xuXHRcdH0gZWxzZSBpZiAob1Jlc291cmNlQnVuZGxlICYmIENvbW1vblV0aWxzLmNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cygob1Jlc291cmNlQnVuZGxlIGFzIGFueSkuYUN1c3RvbUJ1bmRsZXMsIGAke3NLZXl9YCkpIHtcblx0XHRcdHJldHVybiBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChzS2V5LCBvUmVzb3VyY2VCdW5kbGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gc0FjdGlvbkxhYmVsO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfT0tcIiwgb1Jlc291cmNlQnVuZGxlKTtcblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGU0MTJGYWlsZWRUcmFuc2l0aW9ucyhcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0b0FjdGlvbjogYW55LFxuXHRzR3JvdXBJZDogc3RyaW5nLFxuXHRjdXJyZW50X2NvbnRleHRfaW5kZXg6IG51bWJlciB8IG51bGwsXG5cdGlDb250ZXh0TGVuZ3RoOiBudW1iZXIgfCBudWxsLFxuXHRtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXIgfCB1bmRlZmluZWQsXG5cdG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUsXG5cdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzOiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGxldCBzdHJpY3RIYW5kbGluZ0ZhaWxzOiBhbnk7XG5cdGNvbnN0IG1lc3NhZ2VzID0gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0Y29uc3QgdHJhbnNpdGlvbk1lc3NhZ2VzID0gbWVzc2FnZXMuZmlsdGVyKGZ1bmN0aW9uIChtZXNzYWdlOiBhbnkpIHtcblx0XHRjb25zdCBpc0R1cGxpY2F0ZSA9IHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnByb2Nlc3NlZE1lc3NhZ2VJZHMuZmluZChmdW5jdGlvbiAoaWQ6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIG1lc3NhZ2UuaWQgPT09IGlkO1xuXHRcdH0pO1xuXHRcdGlmICghaXNEdXBsaWNhdGUpIHtcblx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnByb2Nlc3NlZE1lc3NhZ2VJZHMucHVzaChtZXNzYWdlLmlkKTtcblx0XHRcdGlmIChtZXNzYWdlLnR5cGUgPT09IE1lc3NhZ2VUeXBlLlN1Y2Nlc3MpIHtcblx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuZGVsYXlTdWNjZXNzTWVzc2FnZXMucHVzaChtZXNzYWdlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1lc3NhZ2UucGVyc2lzdGVudCA9PT0gdHJ1ZSAmJiBtZXNzYWdlLnR5cGUgIT09IE1lc3NhZ2VUeXBlLlN1Y2Nlc3MgJiYgIWlzRHVwbGljYXRlO1xuXHR9KTtcblx0aWYgKHRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRpZiAobVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdHN0cmljdEhhbmRsaW5nRmFpbHMgPSBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscztcblx0XHRcdHN0cmljdEhhbmRsaW5nRmFpbHMucHVzaCh7XG5cdFx0XHRcdG9BY3Rpb246IG9BY3Rpb24sXG5cdFx0XHRcdGdyb3VwSWQ6IHNHcm91cElkXG5cdFx0XHR9KTtcblx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzID0gc3RyaWN0SGFuZGxpbmdGYWlscztcblx0XHR9XG5cdH1cblxuXHRpZiAoXG5cdFx0Y3VycmVudF9jb250ZXh0X2luZGV4ID09PSBpQ29udGV4dExlbmd0aCAmJlxuXHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmXG5cdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXMubGVuZ3RoXG5cdCkge1xuXHRcdG9wZXJhdGlvbnNIZWxwZXIucmVuZGVyTWVzc2FnZVZpZXcoXG5cdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXMsXG5cdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyxcblx0XHRcdHRydWVcblx0XHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGV4ZWN1dGVEZXBlbmRpbmdPblNlbGVjdGVkQ29udGV4dHMoXG5cdG9BY3Rpb246IGFueSxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0YkdldEJvdW5kQ29udGV4dDogYm9vbGVhbixcblx0c0dyb3VwSWQ6IHN0cmluZyxcblx0b1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSxcblx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyIHwgdW5kZWZpbmVkLFxuXHRpQ29udGV4dExlbmd0aDogbnVtYmVyIHwgbnVsbCxcblx0Y3VycmVudF9jb250ZXh0X2luZGV4OiBudW1iZXIgfCBudWxsLFxuXHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcz86IFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG4pIHtcblx0bGV0IG9BY3Rpb25Qcm9taXNlLFxuXHRcdGJFbmFibGVTdHJpY3RIYW5kbGluZyA9IHRydWU7XG5cdGlmIChiR2V0Qm91bmRDb250ZXh0KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQWN0aW9uLmdldEJvdW5kQ29udGV4dCgpLmdldFBhdGgoKTtcblx0XHRjb25zdCBzTWV0YVBhdGggPSBvQWN0aW9uLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0TWV0YVBhdGgoc1BhdGgpO1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IG9BY3Rpb24uZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3Qoc01ldGFQYXRoKTtcblx0XHRpZiAob1Byb3BlcnR5ICYmIG9Qcm9wZXJ0eVswXT8uJGtpbmQgIT09IFwiQWN0aW9uXCIpIHtcblx0XHRcdC8vZG8gbm90IGVuYWJsZSB0aGUgc3RyaWN0IGhhbmRsaW5nIGlmIGl0cyBub3QgYW4gYWN0aW9uXG5cdFx0XHRiRW5hYmxlU3RyaWN0SGFuZGxpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRpZiAoIWJFbmFibGVTdHJpY3RIYW5kbGluZykge1xuXHRcdG9BY3Rpb25Qcm9taXNlID0gYkdldEJvdW5kQ29udGV4dFxuXHRcdFx0PyBvQWN0aW9uLmV4ZWN1dGUoc0dyb3VwSWQpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiBvQWN0aW9uLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0ICB9KVxuXHRcdFx0OiBvQWN0aW9uLmV4ZWN1dGUoc0dyb3VwSWQpO1xuXHR9IGVsc2Uge1xuXHRcdG9BY3Rpb25Qcm9taXNlID0gYkdldEJvdW5kQ29udGV4dFxuXHRcdFx0PyBvQWN0aW9uXG5cdFx0XHRcdFx0LmV4ZWN1dGUoXG5cdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdChvcGVyYXRpb25zSGVscGVyIGFzIGFueSkuZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkLmJpbmQoXG5cdFx0XHRcdFx0XHRcdG9wZXJhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRjdXJyZW50X2NvbnRleHRfaW5kZXgsXG5cdFx0XHRcdFx0XHRcdG9BY3Rpb24uZ2V0Q29udGV4dCgpLFxuXHRcdFx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmIChzdHJpY3RIYW5kbGluZ1V0aWxpdGllcykge1xuXHRcdFx0XHRcdFx0XHRoYW5kbGU0MTJGYWlsZWRUcmFuc2l0aW9ucyhcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRvQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRfY29udGV4dF9pbmRleCxcblx0XHRcdFx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUob0FjdGlvbi5nZXRCb3VuZENvbnRleHQoKSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzKSB7XG5cdFx0XHRcdFx0XHRcdGhhbmRsZTQxMkZhaWxlZFRyYW5zaXRpb25zKFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdG9BY3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdFx0Y3VycmVudF9jb250ZXh0X2luZGV4LFxuXHRcdFx0XHRcdFx0XHRcdGlDb250ZXh0TGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdDogb0FjdGlvblxuXHRcdFx0XHRcdC5leGVjdXRlKFxuXHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHQob3BlcmF0aW9uc0hlbHBlciBhcyBhbnkpLmZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZC5iaW5kKFxuXHRcdFx0XHRcdFx0XHRvcGVyYXRpb25zLFxuXHRcdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0Y3VycmVudF9jb250ZXh0X2luZGV4LFxuXHRcdFx0XHRcdFx0XHRvQWN0aW9uLmdldENvbnRleHQoKSxcblx0XHRcdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmVzdWx0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChzdHJpY3RIYW5kbGluZ1V0aWxpdGllcykge1xuXHRcdFx0XHRcdFx0XHRoYW5kbGU0MTJGYWlsZWRUcmFuc2l0aW9ucyhcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRvQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0XHRcdGN1cnJlbnRfY29udGV4dF9pbmRleCxcblx0XHRcdFx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpIHtcblx0XHRcdFx0XHRcdFx0aGFuZGxlNDEyRmFpbGVkVHJhbnNpdGlvbnMoXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdFx0b0FjdGlvbixcblx0XHRcdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50X2NvbnRleHRfaW5kZXgsXG5cdFx0XHRcdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoKTtcblx0XHRcdFx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBvQWN0aW9uUHJvbWlzZS5jYXRjaCgoKSA9PiB7XG5cdFx0dGhyb3cgQ29uc3RhbnRzLkFjdGlvbkV4ZWN1dGlvbkZhaWxlZDtcblx0fSk7XG59XG5mdW5jdGlvbiBfZXhlY3V0ZUFjdGlvbihcblx0b0FwcENvbXBvbmVudDogYW55LFxuXHRtUGFyYW1ldGVyczogYW55LFxuXHRvUGFyZW50Q29udHJvbD86IGFueSxcblx0bWVzc2FnZUhhbmRsZXI/OiBNZXNzYWdlSGFuZGxlcixcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGNvbnN0IGFDb250ZXh0cyA9IG1QYXJhbWV0ZXJzLmFDb250ZXh0cyB8fCBbXTtcblx0Y29uc3Qgb01vZGVsID0gbVBhcmFtZXRlcnMubW9kZWw7XG5cdGNvbnN0IGFBY3Rpb25QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnMgfHwgW107XG5cdGNvbnN0IHNBY3Rpb25OYW1lID0gbVBhcmFtZXRlcnMuYWN0aW9uTmFtZTtcblx0Y29uc3QgZm5PblN1Ym1pdHRlZCA9IG1QYXJhbWV0ZXJzLmZuT25TdWJtaXR0ZWQ7XG5cdGNvbnN0IGZuT25SZXNwb25zZSA9IG1QYXJhbWV0ZXJzLmZuT25SZXNwb25zZTtcblx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gb1BhcmVudENvbnRyb2wgJiYgb1BhcmVudENvbnRyb2wuaXNBKFwic2FwLnVpLmNvcmUubXZjLlZpZXdcIikgJiYgb1BhcmVudENvbnRyb2wuZ2V0Q29udHJvbGxlcigpLm9SZXNvdXJjZUJ1bmRsZTtcblx0bGV0IG9BY3Rpb246IGFueTtcblxuXHRmdW5jdGlvbiBzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUoKSB7XG5cdFx0aWYgKGFBY3Rpb25QYXJhbWV0ZXJzICYmIGFBY3Rpb25QYXJhbWV0ZXJzLmxlbmd0aCkge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhQWN0aW9uUGFyYW1ldGVycy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRpZiAoIWFBY3Rpb25QYXJhbWV0ZXJzW2pdLnZhbHVlKSB7XG5cdFx0XHRcdFx0c3dpdGNoIChhQWN0aW9uUGFyYW1ldGVyc1tqXS4kVHlwZSkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5TdHJpbmdcIjpcblx0XHRcdFx0XHRcdFx0YUFjdGlvblBhcmFtZXRlcnNbal0udmFsdWUgPSBcIlwiO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJFZG0uQm9vbGVhblwiOlxuXHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tqXS52YWx1ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJFZG0uQnl0ZVwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5JbnQxNlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5JbnQzMlwiOlxuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5JbnQ2NFwiOlxuXHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tqXS52YWx1ZSA9IDA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Ly8gdGJjXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0b0FjdGlvbi5zZXRQYXJhbWV0ZXIoYUFjdGlvblBhcmFtZXRlcnNbal0uJE5hbWUsIGFBY3Rpb25QYXJhbWV0ZXJzW2pdLnZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0aWYgKGFDb250ZXh0cy5sZW5ndGgpIHtcblx0XHQvLyBUT0RPOiByZWZhY3RvciB0byBkaXJlY3QgdXNlIG9mIFByb21pc2UuYWxsU2V0dGxlZFxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdGNvbnN0IG1CaW5kaW5nUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycztcblx0XHRcdGNvbnN0IGJHcm91cGVkID0gbVBhcmFtZXRlcnMuYkdyb3VwZWQ7XG5cdFx0XHRjb25zdCBiR2V0Qm91bmRDb250ZXh0ID0gbVBhcmFtZXRlcnMuYkdldEJvdW5kQ29udGV4dDtcblx0XHRcdGNvbnN0IGFBY3Rpb25Qcm9taXNlczogYW55W10gPSBbXTtcblx0XHRcdGxldCBvQWN0aW9uUHJvbWlzZTtcblx0XHRcdGxldCBpO1xuXHRcdFx0bGV0IHNHcm91cElkOiBzdHJpbmc7XG5cdFx0XHRjb25zdCBmbkV4ZWN1dGVBY3Rpb24gPSBmdW5jdGlvbiAoYWN0aW9uQ29udGV4dDogYW55LCBjdXJyZW50X2NvbnRleHRfaW5kZXg6IGFueSwgb1NpZGVFZmZlY3Q6IGFueSwgaUNvbnRleHRMZW5ndGg6IGFueSkge1xuXHRcdFx0XHRzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUoKTtcblx0XHRcdFx0Ly8gRm9yIGludm9jYXRpb24gZ3JvdXBpbmcgXCJpc29sYXRlZFwiIG5lZWQgYmF0Y2ggZ3JvdXAgcGVyIGFjdGlvbiBjYWxsXG5cdFx0XHRcdHNHcm91cElkID0gIWJHcm91cGVkID8gYCRhdXRvLiR7Y3VycmVudF9jb250ZXh0X2luZGV4fWAgOiBhY3Rpb25Db250ZXh0LmdldFVwZGF0ZUdyb3VwSWQoKTtcblx0XHRcdFx0bVBhcmFtZXRlcnMucmVxdWVzdFNpZGVFZmZlY3RzID0gZm5SZXF1ZXN0U2lkZUVmZmVjdHMuYmluZChvcGVyYXRpb25zLCBvQXBwQ29tcG9uZW50LCBvU2lkZUVmZmVjdCwgbVBhcmFtZXRlcnMpO1xuXHRcdFx0XHRvQWN0aW9uUHJvbWlzZSA9IGV4ZWN1dGVEZXBlbmRpbmdPblNlbGVjdGVkQ29udGV4dHMoXG5cdFx0XHRcdFx0YWN0aW9uQ29udGV4dCxcblx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRiR2V0Qm91bmRDb250ZXh0LFxuXHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRjdXJyZW50X2NvbnRleHRfaW5kZXgsXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0KTtcblx0XHRcdFx0YUFjdGlvblByb21pc2VzLnB1c2gob0FjdGlvblByb21pc2UpO1xuXHRcdFx0XHRmblJlcXVlc3RTaWRlRWZmZWN0cyhvQXBwQ29tcG9uZW50LCBvU2lkZUVmZmVjdCwgbVBhcmFtZXRlcnMsIHNHcm91cElkKTtcblx0XHRcdH07XG5cdFx0XHRjb25zdCBmbkV4ZWN1dGVTaW5nbGVBY3Rpb24gPSBmdW5jdGlvbiAoYWN0aW9uQ29udGV4dDogYW55LCBjdXJyZW50X2NvbnRleHRfaW5kZXg6IGFueSwgb1NpZGVFZmZlY3Q6IGFueSwgaUNvbnRleHRMZW5ndGg6IGFueSkge1xuXHRcdFx0XHRjb25zdCBhTG9jYWxQcm9taXNlOiBhbnkgPSBbXTtcblx0XHRcdFx0c2V0QWN0aW9uUGFyYW1ldGVyRGVmYXVsdFZhbHVlKCk7XG5cdFx0XHRcdC8vIEZvciBpbnZvY2F0aW9uIGdyb3VwaW5nIFwiaXNvbGF0ZWRcIiBuZWVkIGJhdGNoIGdyb3VwIHBlciBhY3Rpb24gY2FsbFxuXHRcdFx0XHRzR3JvdXBJZCA9IGBhcGlNb2RlJHtjdXJyZW50X2NvbnRleHRfaW5kZXh9YDtcblx0XHRcdFx0bVBhcmFtZXRlcnMucmVxdWVzdFNpZGVFZmZlY3RzID0gZm5SZXF1ZXN0U2lkZUVmZmVjdHMuYmluZChcblx0XHRcdFx0XHRvcGVyYXRpb25zLFxuXHRcdFx0XHRcdG9BcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0b1NpZGVFZmZlY3QsXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0YUxvY2FsUHJvbWlzZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRvQWN0aW9uUHJvbWlzZSA9IGV4ZWN1dGVEZXBlbmRpbmdPblNlbGVjdGVkQ29udGV4dHMoXG5cdFx0XHRcdFx0YWN0aW9uQ29udGV4dCxcblx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRiR2V0Qm91bmRDb250ZXh0LFxuXHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRjdXJyZW50X2NvbnRleHRfaW5kZXgsXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0KTtcblx0XHRcdFx0YUFjdGlvblByb21pc2VzLnB1c2gob0FjdGlvblByb21pc2UpO1xuXHRcdFx0XHRhTG9jYWxQcm9taXNlLnB1c2gob0FjdGlvblByb21pc2UpO1xuXHRcdFx0XHRmblJlcXVlc3RTaWRlRWZmZWN0cyhvQXBwQ29tcG9uZW50LCBvU2lkZUVmZmVjdCwgbVBhcmFtZXRlcnMsIHNHcm91cElkLCBhTG9jYWxQcm9taXNlKTtcblx0XHRcdFx0b01vZGVsLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsU2V0dGxlZChhTG9jYWxQcm9taXNlKTtcblx0XHRcdH07XG5cblx0XHRcdGFzeW5jIGZ1bmN0aW9uIGZuRXhlY3V0ZVNlcXVlbnRpYWxseShjb250ZXh0c1RvRXhlY3V0ZTogQ29udGV4dFtdKSB7XG5cdFx0XHRcdC8vIE9uZSBhY3Rpb24gYW5kIGl0cyBzaWRlIGVmZmVjdHMgYXJlIGNvbXBsZXRlZCBiZWZvcmUgdGhlIG5leHQgYWN0aW9uIGlzIGV4ZWN1dGVkXG5cdFx0XHRcdChcblx0XHRcdFx0XHRmbk9uU3VibWl0dGVkIHx8XG5cdFx0XHRcdFx0ZnVuY3Rpb24gbm9vcCgpIHtcblx0XHRcdFx0XHRcdC8qKi9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdCkoYUFjdGlvblByb21pc2VzKTtcblx0XHRcdFx0ZnVuY3Rpb24gcHJvY2Vzc09uZUFjdGlvbihjb250ZXh0OiBhbnksIGFjdGlvbkluZGV4OiBhbnksIGlDb250ZXh0TGVuZ3RoOiBhbnkpIHtcblx0XHRcdFx0XHRvQWN0aW9uID0gb01vZGVsLmJpbmRDb250ZXh0KGAke3NBY3Rpb25OYW1lfSguLi4pYCwgY29udGV4dCwgbUJpbmRpbmdQYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRyZXR1cm4gZm5FeGVjdXRlU2luZ2xlQWN0aW9uKFxuXHRcdFx0XHRcdFx0b0FjdGlvbixcblx0XHRcdFx0XHRcdGFjdGlvbkluZGV4LFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0OiBjb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRwYXRoRXhwcmVzc2lvbnM6IG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ICYmIG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucyxcblx0XHRcdFx0XHRcdFx0dHJpZ2dlckFjdGlvbnM6IG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ICYmIG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnRyaWdnZXJBY3Rpb25zXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0aUNvbnRleHRMZW5ndGhcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gc2VyaWFsaXphdGlvbjogcHJvY2Vzc09uZUFjdGlvbiB0byBiZSBjYWxsZWQgZm9yIGVhY2ggZW50cnkgaW4gY29udGV4dHNUb0V4ZWN1dGUgb25seSBhZnRlciB0aGUgcHJvbWlzZSByZXR1cm5lZCBmcm9tIHRoZSBvbmUgYmVmb3JlIGhhcyBiZWVuIHJlc29sdmVkXG5cdFx0XHRcdGF3YWl0IGNvbnRleHRzVG9FeGVjdXRlLnJlZHVjZShhc3luYyAocHJvbWlzZTogUHJvbWlzZTx2b2lkPiwgY29udGV4dDogQ29udGV4dCwgaWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHByb21pc2U7XG5cdFx0XHRcdFx0YXdhaXQgcHJvY2Vzc09uZUFjdGlvbihjb250ZXh0LCBpZCArIDEsIGFDb250ZXh0cy5sZW5ndGgpO1xuXHRcdFx0XHR9LCBQcm9taXNlLnJlc29sdmUoKSk7XG5cblx0XHRcdFx0Zm5IYW5kbGVSZXN1bHRzKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghYkdyb3VwZWQpIHtcblx0XHRcdFx0Ly8gRm9yIGludm9jYXRpb24gZ3JvdXBpbmcgXCJpc29sYXRlZFwiLCBlbnN1cmUgdGhhdCBlYWNoIGFjdGlvbiBhbmQgbWF0Y2hpbmcgc2lkZSBlZmZlY3RzXG5cdFx0XHRcdC8vIGFyZSBwcm9jZXNzZWQgYmVmb3JlIHRoZSBuZXh0IHNldCBpcyBzdWJtaXR0ZWQuIFdvcmthcm91bmQgdW50aWwgSlNPTiBiYXRjaCBpcyBhdmFpbGFibGUuXG5cdFx0XHRcdC8vIEFsbG93IGFsc28gZm9yIExpc3QgUmVwb3J0LlxuXHRcdFx0XHRmbkV4ZWN1dGVTZXF1ZW50aWFsbHkoYUNvbnRleHRzKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBhQ29udGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRvQWN0aW9uID0gb01vZGVsLmJpbmRDb250ZXh0KGAke3NBY3Rpb25OYW1lfSguLi4pYCwgYUNvbnRleHRzW2ldLCBtQmluZGluZ1BhcmFtZXRlcnMpO1xuXHRcdFx0XHRcdGZuRXhlY3V0ZUFjdGlvbihcblx0XHRcdFx0XHRcdG9BY3Rpb24sXG5cdFx0XHRcdFx0XHRhQ29udGV4dHMubGVuZ3RoIDw9IDEgPyBudWxsIDogaSxcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dDogYUNvbnRleHRzW2ldLFxuXHRcdFx0XHRcdFx0XHRwYXRoRXhwcmVzc2lvbnM6IG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ICYmIG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucyxcblx0XHRcdFx0XHRcdFx0dHJpZ2dlckFjdGlvbnM6IG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ICYmIG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnRyaWdnZXJBY3Rpb25zXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0YUNvbnRleHRzLmxlbmd0aFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0KFxuXHRcdFx0XHRcdGZuT25TdWJtaXR0ZWQgfHxcblx0XHRcdFx0XHRmdW5jdGlvbiBub29wKCkge1xuXHRcdFx0XHRcdFx0LyoqL1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KShhQWN0aW9uUHJvbWlzZXMpO1xuXHRcdFx0XHRmbkhhbmRsZVJlc3VsdHMoKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gZm5IYW5kbGVSZXN1bHRzKCkge1xuXHRcdFx0XHQvLyBQcm9taXNlLmFsbFNldHRsZWQgd2lsbCBuZXZlciBiZSByZWplY3RlZC4gSG93ZXZlciwgZXNsaW50IHJlcXVpcmVzIGVpdGhlciBjYXRjaCBvciByZXR1cm4gLSB0aHVzIHdlIHJldHVybiB0aGUgcmVzdWx0aW5nIFByb21pc2UgYWx0aG91Z2ggbm8gb25lIHdpbGwgdXNlIGl0LlxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGxTZXR0bGVkKGFBY3Rpb25Qcm9taXNlcykudGhlbihyZXNvbHZlKTtcblx0XHRcdH1cblx0XHR9KS5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRcdChcblx0XHRcdFx0Zm5PblJlc3BvbnNlIHx8XG5cdFx0XHRcdGZ1bmN0aW9uIG5vb3AoKSB7XG5cdFx0XHRcdFx0LyoqL1xuXHRcdFx0XHR9XG5cdFx0XHQpKCk7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0b0FjdGlvbiA9IG9Nb2RlbC5iaW5kQ29udGV4dChgLyR7c0FjdGlvbk5hbWV9KC4uLilgKTtcblx0XHRzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUoKTtcblx0XHRjb25zdCBzR3JvdXBJZCA9IFwiYWN0aW9uSW1wb3J0XCI7XG5cdFx0Y29uc3Qgb0FjdGlvblByb21pc2UgPSBvQWN0aW9uLmV4ZWN1dGUoXG5cdFx0XHRzR3JvdXBJZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdChvcGVyYXRpb25zSGVscGVyIGFzIGFueSkuZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkLmJpbmQoXG5cdFx0XHRcdG9wZXJhdGlvbnMsXG5cdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHR7IGxhYmVsOiBtUGFyYW1ldGVycy5sYWJlbCwgbW9kZWw6IG9Nb2RlbCB9LFxuXHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0KVxuXHRcdCk7XG5cdFx0b01vZGVsLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0XHQvLyB0cmlnZ2VyIG9uU3VibWl0dGVkIFwiZXZlbnRcIlxuXHRcdChcblx0XHRcdGZuT25TdWJtaXR0ZWQgfHxcblx0XHRcdGZ1bmN0aW9uIG5vb3AoKSB7XG5cdFx0XHRcdC8qKi9cblx0XHRcdH1cblx0XHQpKG9BY3Rpb25Qcm9taXNlKTtcblx0XHRyZXR1cm4gb0FjdGlvblByb21pc2Vcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChjdXJyZW50UHJvbWlzZVZhbHVlOiB1bmtub3duKSB7XG5cdFx0XHRcdC8vIEhlcmUgd2UgZW5zdXJlIHRoYXQgd2UgcmV0dXJuIHRoZSByZXNwb25zZSB3ZSBnb3QgZnJvbSBhbiB1bmJvdW5kIGFjdGlvbiB0byB0aGVcblx0XHRcdFx0Ly8gY2FsbGVyIEJDUCA6IDIyNzAxMzkyNzlcblx0XHRcdFx0aWYgKGN1cnJlbnRQcm9taXNlVmFsdWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gY3VycmVudFByb21pc2VWYWx1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5nZXRCb3VuZENvbnRleHQ/LigpPy5nZXRPYmplY3QoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZXhlY3V0aW5nIGFjdGlvbiBcIiArIHNBY3Rpb25OYW1lLCBvRXJyb3IpO1xuXHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQoXG5cdFx0XHRcdFx0Zm5PblJlc3BvbnNlIHx8XG5cdFx0XHRcdFx0ZnVuY3Rpb24gbm9vcCgpIHtcblx0XHRcdFx0XHRcdC8qKi9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdCkoKTtcblx0XHRcdH0pO1xuXHR9XG59XG5mdW5jdGlvbiBfZ2V0UGF0aChvQWN0aW9uQ29udGV4dDogYW55LCBzQWN0aW9uTmFtZTogYW55KSB7XG5cdGxldCBzUGF0aCA9IG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKTtcblx0c1BhdGggPSBvQWN0aW9uQ29udGV4dC5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSA/IHNQYXRoLnNwbGl0KFwiQCR1aTUub3ZlcmxvYWRcIilbMF0gOiBzUGF0aC5zcGxpdChcIi8wXCIpWzBdO1xuXHRyZXR1cm4gc1BhdGguc3BsaXQoYC8ke3NBY3Rpb25OYW1lfWApWzBdO1xufVxuXG5mdW5jdGlvbiBfdmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzKFxuXHRpc0NyZWF0ZUFjdGlvbjogYm9vbGVhbixcblx0YWN0aW9uUGFyYW1ldGVyczogUmVjb3JkPHN0cmluZywgYW55PltdLFxuXHRwYXJhbWV0ZXJWYWx1ZXM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+W10sXG5cdHN0YXJ0dXBQYXJhbWV0ZXJzPzogYW55XG4pOiBib29sZWFuIHtcblx0aWYgKHBhcmFtZXRlclZhbHVlcykge1xuXHRcdC8vIElmIHNob3dEaWFsb2cgaXMgZmFsc2UgYnV0IHRoZXJlIGFyZSBwYXJhbWV0ZXJzIGZyb20gdGhlIGludm9rZUFjdGlvbiBjYWxsLCB3ZSBuZWVkIHRvIGNoZWNrIHRoYXQgdmFsdWVzIGhhdmUgYmVlblxuXHRcdC8vIHByb3ZpZGVkIGZvciBhbGwgb2YgdGhlbVxuXHRcdGZvciAoY29uc3QgYWN0aW9uUGFyYW1ldGVyIG9mIGFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0YWN0aW9uUGFyYW1ldGVyLiROYW1lICE9PSBcIlJlc3VsdElzQWN0aXZlRW50aXR5XCIgJiZcblx0XHRcdFx0IXBhcmFtZXRlclZhbHVlcz8uZmluZCgoZWxlbWVudDogYW55KSA9PiBlbGVtZW50Lm5hbWUgPT09IGFjdGlvblBhcmFtZXRlci4kTmFtZSlcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBBdCBsZWFzdCBmb3Igb25lIHBhcmFtZXRlciBubyB2YWx1ZSBoYXMgYmVlbiBwcm92aWRlZCwgc28gd2UgY2FuJ3Qgc2tpcCB0aGUgZGlhbG9nXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAoaXNDcmVhdGVBY3Rpb24gJiYgc3RhcnR1cFBhcmFtZXRlcnMpIHtcblx0XHQvLyBJZiBwYXJhbWV0ZXJzIGhhdmUgYmVlbiBwcm92aWRlZCBkdXJpbmcgYXBwbGljYXRpb24gbGF1bmNoLCB3ZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBzZXQgaXMgY29tcGxldGVcblx0XHQvLyBJZiBub3QsIHRoZSBwYXJhbWV0ZXIgZGlhbG9nIHN0aWxsIG5lZWRzIHRvIGJlIHNob3duLlxuXHRcdGZvciAoY29uc3QgYWN0aW9uUGFyYW1ldGVyIG9mIGFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdGlmICghc3RhcnR1cFBhcmFtZXRlcnNbYWN0aW9uUGFyYW1ldGVyLiROYW1lXSkge1xuXHRcdFx0XHQvLyBBdCBsZWFzdCBmb3Igb25lIHBhcmFtZXRlciBubyB2YWx1ZSBoYXMgYmVlbiBwcm92aWRlZCwgc28gd2UgY2FuJ3Qgc2tpcCB0aGUgZGlhbG9nXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGZuUmVxdWVzdFNpZGVFZmZlY3RzKG9BcHBDb21wb25lbnQ6IGFueSwgb1NpZGVFZmZlY3Q6IGFueSwgbVBhcmFtZXRlcnM6IGFueSwgc0dyb3VwSWQ6IGFueSwgYUxvY2FsUHJvbWlzZT86IGFueSkge1xuXHRjb25zdCBvU2lkZUVmZmVjdHNTZXJ2aWNlID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0bGV0IG9Mb2NhbFByb21pc2U7XG5cdC8vIHRyaWdnZXIgYWN0aW9ucyBmcm9tIHNpZGUgZWZmZWN0c1xuXHRpZiAob1NpZGVFZmZlY3QgJiYgb1NpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnMgJiYgb1NpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0b1NpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoc1RyaWdnZXJBY3Rpb246IGFueSkge1xuXHRcdFx0aWYgKHNUcmlnZ2VyQWN0aW9uKSB7XG5cdFx0XHRcdG9Mb2NhbFByb21pc2UgPSBvU2lkZUVmZmVjdHNTZXJ2aWNlLmV4ZWN1dGVBY3Rpb24oc1RyaWdnZXJBY3Rpb24sIG9TaWRlRWZmZWN0LmNvbnRleHQsIHNHcm91cElkKTtcblx0XHRcdFx0aWYgKGFMb2NhbFByb21pc2UpIHtcblx0XHRcdFx0XHRhTG9jYWxQcm9taXNlLnB1c2gob0xvY2FsUHJvbWlzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHQvLyByZXF1ZXN0IHNpZGUgZWZmZWN0cyBmb3IgdGhpcyBhY3Rpb25cblx0Ly8gYXMgd2UgbW92ZSB0aGUgbWVzc2FnZXMgcmVxdWVzdCB0byBQT1NUICRzZWxlY3Qgd2UgbmVlZCB0byBiZSBwcmVwYXJlZCBmb3IgYW4gZW1wdHkgYXJyYXlcblx0aWYgKG9TaWRlRWZmZWN0ICYmIG9TaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucyAmJiBvU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMubGVuZ3RoID4gMCkge1xuXHRcdG9Mb2NhbFByb21pc2UgPSBvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhvU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMsIG9TaWRlRWZmZWN0LmNvbnRleHQsIHNHcm91cElkKTtcblx0XHRpZiAoYUxvY2FsUHJvbWlzZSkge1xuXHRcdFx0YUxvY2FsUHJvbWlzZS5wdXNoKG9Mb2NhbFByb21pc2UpO1xuXHRcdH1cblx0XHRvTG9jYWxQcm9taXNlXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmIChtUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXAgJiYgbVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnQoXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRcdEpTT04ucGFyc2UobVBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnNlbGVjdGVkSXRlbXMsXG5cdFx0XHRcdFx0XHRcInRhYmxlXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXF1ZXN0aW5nIHNpZGUgZWZmZWN0c1wiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBTdGF0aWMgZnVuY3Rpb25zIHRvIGNhbGwgT0RhdGEgYWN0aW9ucyAoYm91bmQvaW1wb3J0KSBhbmQgZnVuY3Rpb25zIChib3VuZC9pbXBvcnQpXG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9uc1xuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgZXhwZXJpbWVudGFsIHVzZSEgPGJyLz48Yj5UaGlzIGlzIG9ubHkgYSBQT0MgYW5kIG1heWJlIGRlbGV0ZWQ8L2I+XG4gKiBAc2luY2UgMS41Ni4wXG4gKi9cbmNvbnN0IG9wZXJhdGlvbnMgPSB7XG5cdGNhbGxCb3VuZEFjdGlvbjogY2FsbEJvdW5kQWN0aW9uLFxuXHRjYWxsQWN0aW9uSW1wb3J0OiBjYWxsQWN0aW9uSW1wb3J0LFxuXHRjYWxsQm91bmRGdW5jdGlvbjogY2FsbEJvdW5kRnVuY3Rpb24sXG5cdGNhbGxGdW5jdGlvbkltcG9ydDogY2FsbEZ1bmN0aW9uSW1wb3J0LFxuXHRleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzOiBleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzLFxuXHR2YWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnM6IF92YWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnMsXG5cdGdldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWU6IF9nZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lLFxuXHRhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrOiBhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrLFxuXHRhZnRlckFjdGlvblJlc29sdXRpb246IGFmdGVyQWN0aW9uUmVzb2x1dGlvblxufTtcblxuZXhwb3J0IGRlZmF1bHQgb3BlcmF0aW9ucztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBK0JBLE1BQU1BLFNBQVMsR0FBR0MsU0FBUyxDQUFDRCxTQUFTO0lB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