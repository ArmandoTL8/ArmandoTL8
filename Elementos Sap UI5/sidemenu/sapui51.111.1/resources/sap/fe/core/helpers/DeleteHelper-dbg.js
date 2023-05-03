/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/editFlow/draft", "sap/m/CheckBox", "sap/m/MessageToast", "sap/m/Text"], function (CommonUtils, draft, CheckBox, MessageToast, Text) {
  "use strict";

  var _exports = {};
  let DeleteOptionTypes;
  (function (DeleteOptionTypes) {
    DeleteOptionTypes["deletableContexts"] = "deletableContexts";
    DeleteOptionTypes["draftsWithDeletableActive"] = "draftsWithDeletableActive";
    DeleteOptionTypes["createModeContexts"] = "createModeContexts";
    DeleteOptionTypes["unSavedContexts"] = "unSavedContexts";
    DeleteOptionTypes["draftsWithNonDeletableActive"] = "draftsWithNonDeletableActive";
  })(DeleteOptionTypes || (DeleteOptionTypes = {}));
  _exports.DeleteOptionTypes = DeleteOptionTypes;
  let DeleteDialogContentControl;
  (function (DeleteDialogContentControl) {
    DeleteDialogContentControl["CHECKBOX"] = "checkBox";
    DeleteDialogContentControl["TEXT"] = "text";
  })(DeleteDialogContentControl || (DeleteDialogContentControl = {}));
  _exports.DeleteDialogContentControl = DeleteDialogContentControl;
  function getUpdatedSelections(internalModelContext, type, selectedContexts, contextsToRemove) {
    contextsToRemove.forEach(context => {
      const idx = selectedContexts.indexOf(context);
      if (idx !== -1) {
        selectedContexts.splice(idx, 1);
      }
    });
    internalModelContext.setProperty(type, []);
    return [...selectedContexts];
  }
  function clearSelectedContextsForOption(internalModelContext, option) {
    let selectedContexts = internalModelContext.getProperty("selectedContexts") || [];
    if (option.type === DeleteOptionTypes.deletableContexts) {
      selectedContexts = getUpdatedSelections(internalModelContext, DeleteOptionTypes.deletableContexts, selectedContexts, internalModelContext.getProperty(DeleteOptionTypes.deletableContexts) || []);
      selectedContexts = getUpdatedSelections(internalModelContext, DeleteOptionTypes.createModeContexts, selectedContexts, internalModelContext.getProperty(DeleteOptionTypes.createModeContexts) || []);
      const draftSiblingPairs = internalModelContext.getProperty(DeleteOptionTypes.draftsWithDeletableActive) || [];
      const drafts = draftSiblingPairs.map(contextPair => {
        return contextPair.draft;
      });
      selectedContexts = getUpdatedSelections(internalModelContext, DeleteOptionTypes.draftsWithDeletableActive, selectedContexts, drafts);
    } else {
      const contextsToRemove = internalModelContext.getProperty(option.type) || [];
      selectedContexts = getUpdatedSelections(internalModelContext, option.type, selectedContexts, contextsToRemove);
    }
    internalModelContext.setProperty("selectedContexts", selectedContexts);
    internalModelContext.setProperty("numberOfSelectedContexts", selectedContexts.length);
  }
  function afterDeleteProcess(parameters, options, contexts, oResourceBundle) {
    const {
      internalModelContext,
      entitySetName
    } = parameters;
    if (internalModelContext) {
      if (internalModelContext.getProperty("deleteEnabled") != undefined) {
        options.forEach(option => {
          // if an option is selected, then it is deleted. So, we need to remove them from selected contexts.
          if (option.selected) {
            clearSelectedContextsForOption(internalModelContext, option);
          }
        });
      }
      // if atleast one of the options is not selected, then the delete button needs to be enabled.
      internalModelContext.setProperty("deleteEnabled", options.some(option => !option.selected));
    }
    if (contexts.length === 1) {
      MessageToast.show(CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DELETE_TOAST_SINGULAR", oResourceBundle, undefined, entitySetName));
    } else {
      MessageToast.show(CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DELETE_TOAST_PLURAL", oResourceBundle, undefined, entitySetName));
    }
  }
  function getLockedContextUser(lockedContext) {
    const draftAdminData = lockedContext.getObject()["DraftAdministrativeData"];
    return draftAdminData && draftAdminData["InProcessByUser"] || "";
  }
  function getLockedObjectsText(oResourceBundle, numberOfSelectedContexts, lockedContexts) {
    let retTxt = "";
    if (numberOfSelectedContexts === 1 && lockedContexts.length === 1) {
      //only one unsaved object
      const lockedUser = getLockedContextUser(lockedContexts[0]);
      retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", oResourceBundle, [lockedUser]);
    } else if (lockedContexts.length == 1) {
      const lockedUser = getLockedContextUser(lockedContexts[0]);
      retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_LOCKED", oResourceBundle, [numberOfSelectedContexts, lockedUser]);
    } else if (lockedContexts.length > 1) {
      retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED", oResourceBundle, [lockedContexts.length, numberOfSelectedContexts]);
    }
    return retTxt;
  }
  function getNonDeletableActivesOfDraftsText(oResourceBundle, numberOfDrafts, totalDeletable) {
    let retTxt = "";
    if (totalDeletable === numberOfDrafts) {
      if (numberOfDrafts === 1) {
        retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFT_OF_NON_DELETABLE_ACTIVE", oResourceBundle);
      } else {
        retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFTS_OF_NON_DELETABLE_ACTIVE", oResourceBundle);
      }
    } else if (numberOfDrafts === 1) {
      retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFT_OF_NON_DELETABLE_ACTIVE", oResourceBundle);
    } else {
      retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFTS_OF_NON_DELETABLE_ACTIVE", oResourceBundle);
    }
    return retTxt;
  }
  function getUnSavedContextUser(unSavedContext) {
    const draftAdminData = unSavedContext.getObject()["DraftAdministrativeData"];
    let sLastChangedByUser = "";
    if (draftAdminData) {
      sLastChangedByUser = draftAdminData["LastChangedByUserDescription"] || draftAdminData["LastChangedByUser"] || "";
    }
    return sLastChangedByUser;
  }
  function getUnsavedContextsText(oResourceBundle, numberOfSelectedContexts, unSavedContexts, totalDeletable) {
    let infoTxt = "",
      optionTxt = "",
      optionWithoutTxt = false;
    if (numberOfSelectedContexts === 1 && unSavedContexts.length === 1) {
      //only one unsaved object are selected
      const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
      infoTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES", oResourceBundle, [lastChangedByUser]);
      optionWithoutTxt = true;
    } else if (numberOfSelectedContexts === unSavedContexts.length) {
      //only multiple unsaved objects are selected
      infoTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES_MULTIPLE_OBJECTS", oResourceBundle);
      optionWithoutTxt = true;
    } else if (totalDeletable === unSavedContexts.length) {
      // non-deletable/locked exists, all deletable are unsaved by others
      if (unSavedContexts.length === 1) {
        const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
        infoTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_SINGULAR", oResourceBundle, [lastChangedByUser]);
      } else {
        infoTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_PLURAL", oResourceBundle);
      }
      optionWithoutTxt = true;
    } else if (totalDeletable > unSavedContexts.length) {
      // non-deletable/locked exists, deletable include unsaved and other types.
      if (unSavedContexts.length === 1) {
        const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
        optionTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_SINGULAR", oResourceBundle, [lastChangedByUser]);
      } else {
        optionTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_PLURAL", oResourceBundle);
      }
    }
    return {
      infoTxt,
      optionTxt,
      optionWithoutTxt
    };
  }
  function getNonDeletableText(mParameters, totalNumDeletableContexts, oResourceBundle) {
    const {
      numberOfSelectedContexts,
      lockedContexts,
      draftsWithNonDeletableActive
    } = mParameters;
    const nonDeletableContexts = numberOfSelectedContexts - (lockedContexts.length + totalNumDeletableContexts - draftsWithNonDeletableActive.length);
    let retTxt = "";
    if (nonDeletableContexts > 0 && (totalNumDeletableContexts === 0 || draftsWithNonDeletableActive.length === totalNumDeletableContexts)) {
      // 1. None of the ccontexts are deletable
      // 2. Only drafts of non deletable contexts exist.
      if (lockedContexts.length > 0) {
        // Locked contexts exist
        if (nonDeletableContexts === 1) {
          retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_SINGULAR", oResourceBundle, undefined);
        } else {
          retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_PLURAL", oResourceBundle, undefined);
        }
      } else if (nonDeletableContexts === 1) {
        // Only pure non-deletable contexts exist single
        retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_AND_ONE_OBJECT_NON_DELETABLE", oResourceBundle, undefined);
      } else {
        // Only pure non-deletable contexts exist multiple
        retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_MULTIPLE_AND_ALL_OBJECT_NON_DELETABLE", oResourceBundle, undefined);
      }
    } else if (nonDeletableContexts === 1) {
      // deletable and non-deletable exists together, single
      retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_NON_DELETABLE", oResourceBundle, [numberOfSelectedContexts]);
    } else if (nonDeletableContexts > 1) {
      // deletable and non-deletable exists together, multiple
      retTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_NON_DELETABLE", oResourceBundle, [nonDeletableContexts, numberOfSelectedContexts]);
    }
    return retTxt;
  }
  function getConfirmedDeletableContext(contexts, options) {
    return options.reduce((result, option) => {
      return option.selected ? result.concat(option.contexts) : result;
    }, contexts);
  }
  function updateDraftOptionsForDeletableTexts(mParameters, vContexts, totalDeletable, oResourceBundle, items, options) {
    const {
      numberOfSelectedContexts,
      draftsWithDeletableActive,
      unSavedContexts,
      createModeContexts,
      lockedContexts,
      draftsWithNonDeletableActive
    } = mParameters;
    let nonDeletableContextText = "",
      lockedContextsTxt = "";

    // drafts with active
    if (draftsWithDeletableActive.length > 0) {
      draftsWithDeletableActive.forEach(deletableDraftInfo => {
        vContexts.push(deletableDraftInfo.siblingInfo.targetContext);
      });
    }

    // create mode drafts
    if (createModeContexts.length > 0) {
      // create mode drafts
      createModeContexts.forEach(context => vContexts.push(context));
    }

    // items locked msg
    if (lockedContexts.length > 0) {
      lockedContextsTxt = deleteHelper.getLockedObjectsText(oResourceBundle, numberOfSelectedContexts, lockedContexts) || "";
      items.push(new Text({
        text: lockedContextsTxt
      }));
    }

    // non deletable msg
    if (numberOfSelectedContexts != totalDeletable - draftsWithNonDeletableActive.length + lockedContexts.length) {
      nonDeletableContextText = deleteHelper.getNonDeletableText(mParameters, totalDeletable, oResourceBundle);
      items.push(new Text({
        text: nonDeletableContextText
      }));
    }

    // option: unsaved changes by others
    if (unSavedContexts.length > 0) {
      const unsavedChangesTxts = deleteHelper.getUnsavedContextsText(oResourceBundle, numberOfSelectedContexts, unSavedContexts, totalDeletable) || {};
      if (unsavedChangesTxts.infoTxt) {
        items.push(new Text({
          text: unsavedChangesTxts.infoTxt
        }));
      }
      if (unsavedChangesTxts.optionTxt || unsavedChangesTxts.optionWithoutTxt) {
        options.push({
          type: DeleteOptionTypes.unSavedContexts,
          contexts: unSavedContexts,
          text: unsavedChangesTxts.optionTxt,
          selected: true,
          control: DeleteDialogContentControl.CHECKBOX
        });
      }
    }

    // option: drafts with active not deletable
    if (draftsWithNonDeletableActive.length > 0) {
      const nonDeletableActivesOfDraftsText = deleteHelper.getNonDeletableActivesOfDraftsText(oResourceBundle, draftsWithNonDeletableActive.length, totalDeletable) || "";
      if (nonDeletableActivesOfDraftsText) {
        options.push({
          type: DeleteOptionTypes.draftsWithNonDeletableActive,
          contexts: draftsWithNonDeletableActive,
          text: nonDeletableActivesOfDraftsText,
          selected: true,
          control: totalDeletable > 0 ? DeleteDialogContentControl.CHECKBOX : DeleteDialogContentControl.TEXT
        });
      }
    }
  }
  function updateContentForDeleteDialog(options, items) {
    if (options.length === 1) {
      // Single option doesn't need checkBox
      const option = options[0];
      if (option.text) {
        items.push(new Text({
          text: option.text
        }));
      }
    } else if (options.length > 1) {
      // Multiple Options

      // Texts
      options.forEach(option => {
        if (option.control === "text" && option.text) {
          items.push(new Text({
            text: option.text
          }));
        }
      });
      // CheckBoxs
      options.forEach(option => {
        if (option.control === "checkBox" && option.text) {
          items.push(new CheckBox({
            text: option.text,
            selected: true,
            select: function (oEvent) {
              const checkBox = oEvent.getSource();
              const selected = checkBox.getSelected();
              option.selected = selected;
            }
          }));
        }
      });
    }
  }
  function updateOptionsForDeletableTexts(mParameters, directDeletableContexts, oResourceBundle, options) {
    const {
      numberOfSelectedContexts,
      entitySetName,
      parentControl,
      description,
      lockedContexts,
      draftsWithNonDeletableActive,
      unSavedContexts
    } = mParameters;
    const totalDeletable = directDeletableContexts.length + draftsWithNonDeletableActive.length + unSavedContexts.length;
    const nonDeletableContexts = numberOfSelectedContexts - (lockedContexts.length + totalDeletable - draftsWithNonDeletableActive.length);
    if (numberOfSelectedContexts === 1 && numberOfSelectedContexts === directDeletableContexts.length) {
      // single deletable context
      const oLineContextData = directDeletableContexts[0].getObject();
      const oTable = parentControl;
      const sKey = oTable && oTable.getParent().getIdentifierColumn();
      let txt;
      let aParams = [];
      if (sKey) {
        const sKeyValue = sKey ? oLineContextData[sKey] : undefined;
        const sDescription = description && description.path ? oLineContextData[description.path] : undefined;
        if (sKeyValue) {
          if (sDescription && description && sKey !== description.path) {
            aParams = [sKeyValue + " ", sDescription];
          } else {
            aParams = [sKeyValue, ""];
          }
          txt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", oResourceBundle, aParams, entitySetName);
        } else if (sKeyValue) {
          aParams = [sKeyValue, ""];
          txt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", oResourceBundle, aParams, entitySetName);
        } else {
          txt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", oResourceBundle, undefined, entitySetName);
        }
      } else {
        txt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", oResourceBundle, undefined, entitySetName);
      }
      options.push({
        type: DeleteOptionTypes.deletableContexts,
        contexts: directDeletableContexts,
        text: txt,
        selected: true,
        control: DeleteDialogContentControl.TEXT
      });
    } else if (unSavedContexts.length !== totalDeletable && numberOfSelectedContexts > 0 && (directDeletableContexts.length > 0 || unSavedContexts.length > 0 && draftsWithNonDeletableActive.length > 0)) {
      if (numberOfSelectedContexts > directDeletableContexts.length && nonDeletableContexts + lockedContexts.length > 0) {
        // other types exists with pure deletable ones
        let deletableOptionTxt = "";
        if (totalDeletable === 1) {
          deletableOptionTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR_NON_DELETABLE", oResourceBundle, undefined, entitySetName);
        } else {
          deletableOptionTxt = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL_NON_DELETABLE", oResourceBundle, undefined, entitySetName);
        }
        options.unshift({
          type: DeleteOptionTypes.deletableContexts,
          contexts: directDeletableContexts,
          text: deletableOptionTxt,
          selected: true,
          control: DeleteDialogContentControl.TEXT
        });
      } else {
        // only deletable
        const allDeletableTxt = totalDeletable === 1 ? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", oResourceBundle, undefined, entitySetName) : CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL", oResourceBundle, undefined, entitySetName);
        options.push({
          type: DeleteOptionTypes.deletableContexts,
          contexts: directDeletableContexts,
          text: allDeletableTxt,
          selected: true,
          control: DeleteDialogContentControl.TEXT
        });
      }
    }
  }
  async function deleteConfirmHandler(options, mParameters, messageHandler, oResourceBundle, appComponent, draftEnabled) {
    try {
      const contexts = deleteHelper.getConfirmedDeletableContext([], options);
      const {
        beforeDeleteCallBack,
        parentControl
      } = mParameters;
      if (beforeDeleteCallBack) {
        await beforeDeleteCallBack({
          contexts: contexts
        });
      }
      if (contexts && contexts.length) {
        try {
          await Promise.all(contexts.map(function (context) {
            if (draftEnabled && !context.getProperty("IsActiveEntity")) {
              //delete the draft
              const enableStrictHandling = contexts.length === 1 ? true : false;
              return draft.deleteDraft(context, appComponent, enableStrictHandling);
            }
            return context.delete();
          }));
          deleteHelper.afterDeleteProcess(mParameters, options, contexts, oResourceBundle);
        } catch (error) {
          await messageHandler.showMessageDialog({
            control: parentControl
          });
          // re-throw error to enforce rejecting the general promise
          throw error;
        }
      }
    } catch (oError) {
      await messageHandler.showMessages();
      // re-throw error to enforce rejecting the general promise
      throw oError;
    }
  }

  // Table Runtime Helpers:

  /* refreshes data in internal model relevant for enablement of delete button according to selected contexts
  relevant data are: deletableContexts, draftsWithDeletableActive, draftsWithNonDeletableActive, createModeContexts, unSavedContexts, deleteEnabled
  not relevant: lockedContexts
  */
  async function updateDeleteInfoForSelectedContexts(internalModelContext, selectedContexts) {
    const contextInfos = selectedContexts.map(context => {
      // assuming metaContext is the same for all contexts, still not relying on this assumption
      const metaContext = context.getModel().getMetaModel().getMetaContext(context.getCanonicalPath());
      const deletablePath = metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable/$Path");
      const staticDeletable = !deletablePath && metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable") !== false;
      // default values according to non-draft case (sticky behaves the same as non-draft from UI point of view regarding deletion)
      const info = {
        context: context,
        isDraftRoot: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftRoot"),
        isDraftNode: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftNode"),
        isActive: true,
        hasActive: false,
        hasDraft: false,
        locked: false,
        deletable: deletablePath ? context.getProperty(deletablePath) : staticDeletable,
        siblingPromise: Promise.resolve(undefined),
        siblingInfo: undefined,
        siblingDeletable: false
      };
      if (info.isDraftRoot) {
        var _context$getObject;
        info.locked = !!((_context$getObject = context.getObject("DraftAdministrativeData")) !== null && _context$getObject !== void 0 && _context$getObject.InProcessByUser);
        info.hasDraft = context.getProperty("HasDraftEntity");
      }
      if (info.isDraftRoot || info.isDraftNode) {
        info.isActive = context.getProperty("IsActiveEntity");
        info.hasActive = context.getProperty("HasActiveEntity");
        if (!info.isActive && info.hasActive) {
          // get sibling contexts
          // draft.computeSiblingInformation expects draft root as first parameter - if we are on a subnode, this is not given
          // - done wrong also above, but seems not to break anything
          // - why is draft.computeSiblingInformation not able to calculate draft root on its own?!
          // - and why is it not able to deal with contexts not draft enabled (of course they never have a sibling - could just return undefined)
          info.siblingPromise = draft.computeSiblingInformation(context, context).then(async siblingInformation => {
            // For draftWithDeletableActive bucket, currently also siblingInformation is put into internalModel and used
            // from there in case of deletion. Therefore, sibling needs to be retrieved in case of staticDeletable.
            // Possible improvement: Only read siblingInfo here if needed for determination of delete button enablement,
            // in other cases, read it only if deletion really happens.
            info.siblingInfo = siblingInformation;
            if (deletablePath) {
              var _siblingInformation$t;
              info.siblingDeletable = await (siblingInformation === null || siblingInformation === void 0 ? void 0 : (_siblingInformation$t = siblingInformation.targetContext) === null || _siblingInformation$t === void 0 ? void 0 : _siblingInformation$t.requestProperty(deletablePath));
            } else {
              info.siblingDeletable = staticDeletable;
            }
          });
        }
      }
      return info;
    });
    // wait for all siblingPromises. If no sibling exists, promise is resolved to undefined (but it's still a promise)
    await Promise.all(contextInfos.map(info => info.siblingPromise));
    const buckets = [{
      key: "draftsWithDeletableActive",
      // only for draft root: In that case, the delete request needs to be sent for the active (i.e. the sibling),
      // while in draft node, the delete request needs to be send for the draft itself
      value: contextInfos.filter(info => info.isDraftRoot && !info.isActive && info.hasActive && info.siblingDeletable)
    }, {
      key: "draftsWithNonDeletableActive",
      value: contextInfos.filter(info => !info.isActive && info.hasActive && !info.siblingDeletable)
    }, {
      key: "lockedContexts",
      value: contextInfos.filter(info => info.isDraftRoot && info.isActive && info.hasDraft && info.locked)
    }, {
      key: "unSavedContexts",
      value: contextInfos.filter(info => info.isDraftRoot && info.isActive && info.hasDraft && !info.locked)
    },
    // non-draft/sticky and deletable
    // active draft root without any draft and deletable
    // created draft root (regardless of deletable)
    // draft node without active (regardless whether root is create or edit, and regardless of deletable)
    // draft node with deletable active
    {
      key: "deletableContexts",
      value: contextInfos.filter(info => !info.isDraftRoot && !info.isDraftNode && info.deletable || info.isDraftRoot && info.isActive && !info.hasDraft && info.deletable || info.isDraftRoot && !info.isActive && !info.hasActive || info.isDraftNode && !info.isActive && !info.hasActive || info.isDraftNode && !info.isActive && info.hasActive && info.siblingDeletable)
    }];
    for (const {
      key,
      value
    } of buckets) {
      internalModelContext.setProperty(key,
      // Currently, bucket draftsWithDeletableActive has a different structure (containing also sibling information, which is used
      // in case of deletion). Possible improvement: Read sibling information only when needed, and build all buckets with same
      // structure. However, in that case siblingInformation might need to be read twice (if already needed for button enablement),
      // thus a buffer probably would make sense.
      value.map(info => key === "draftsWithDeletableActive" ? {
        draft: info.context,
        siblingInfo: info.siblingInfo
      } : info.context));
    }
  }
  const deleteHelper = {
    getNonDeletableText,
    deleteConfirmHandler,
    updateOptionsForDeletableTexts,
    updateContentForDeleteDialog,
    updateDraftOptionsForDeletableTexts,
    getConfirmedDeletableContext,
    getLockedObjectsText,
    getUnsavedContextsText,
    getNonDeletableActivesOfDraftsText,
    afterDeleteProcess,
    updateDeleteInfoForSelectedContexts
  };
  return deleteHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWxldGVPcHRpb25UeXBlcyIsIkRlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sIiwiZ2V0VXBkYXRlZFNlbGVjdGlvbnMiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsInR5cGUiLCJzZWxlY3RlZENvbnRleHRzIiwiY29udGV4dHNUb1JlbW92ZSIsImZvckVhY2giLCJjb250ZXh0IiwiaWR4IiwiaW5kZXhPZiIsInNwbGljZSIsInNldFByb3BlcnR5IiwiY2xlYXJTZWxlY3RlZENvbnRleHRzRm9yT3B0aW9uIiwib3B0aW9uIiwiZ2V0UHJvcGVydHkiLCJkZWxldGFibGVDb250ZXh0cyIsImNyZWF0ZU1vZGVDb250ZXh0cyIsImRyYWZ0U2libGluZ1BhaXJzIiwiZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSIsImRyYWZ0cyIsIm1hcCIsImNvbnRleHRQYWlyIiwiZHJhZnQiLCJsZW5ndGgiLCJhZnRlckRlbGV0ZVByb2Nlc3MiLCJwYXJhbWV0ZXJzIiwib3B0aW9ucyIsImNvbnRleHRzIiwib1Jlc291cmNlQnVuZGxlIiwiZW50aXR5U2V0TmFtZSIsInVuZGVmaW5lZCIsInNlbGVjdGVkIiwic29tZSIsIk1lc3NhZ2VUb2FzdCIsInNob3ciLCJDb21tb25VdGlscyIsImdldFRyYW5zbGF0ZWRUZXh0IiwiZ2V0TG9ja2VkQ29udGV4dFVzZXIiLCJsb2NrZWRDb250ZXh0IiwiZHJhZnRBZG1pbkRhdGEiLCJnZXRPYmplY3QiLCJnZXRMb2NrZWRPYmplY3RzVGV4dCIsIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyIsImxvY2tlZENvbnRleHRzIiwicmV0VHh0IiwibG9ja2VkVXNlciIsImdldE5vbkRlbGV0YWJsZUFjdGl2ZXNPZkRyYWZ0c1RleHQiLCJudW1iZXJPZkRyYWZ0cyIsInRvdGFsRGVsZXRhYmxlIiwiZ2V0VW5TYXZlZENvbnRleHRVc2VyIiwidW5TYXZlZENvbnRleHQiLCJzTGFzdENoYW5nZWRCeVVzZXIiLCJnZXRVbnNhdmVkQ29udGV4dHNUZXh0IiwidW5TYXZlZENvbnRleHRzIiwiaW5mb1R4dCIsIm9wdGlvblR4dCIsIm9wdGlvbldpdGhvdXRUeHQiLCJsYXN0Q2hhbmdlZEJ5VXNlciIsImdldE5vbkRlbGV0YWJsZVRleHQiLCJtUGFyYW1ldGVycyIsInRvdGFsTnVtRGVsZXRhYmxlQ29udGV4dHMiLCJkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlIiwibm9uRGVsZXRhYmxlQ29udGV4dHMiLCJnZXRDb25maXJtZWREZWxldGFibGVDb250ZXh0IiwicmVkdWNlIiwicmVzdWx0IiwiY29uY2F0IiwidXBkYXRlRHJhZnRPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMiLCJ2Q29udGV4dHMiLCJpdGVtcyIsIm5vbkRlbGV0YWJsZUNvbnRleHRUZXh0IiwibG9ja2VkQ29udGV4dHNUeHQiLCJkZWxldGFibGVEcmFmdEluZm8iLCJwdXNoIiwic2libGluZ0luZm8iLCJ0YXJnZXRDb250ZXh0IiwiZGVsZXRlSGVscGVyIiwiVGV4dCIsInRleHQiLCJ1bnNhdmVkQ2hhbmdlc1R4dHMiLCJjb250cm9sIiwiQ0hFQ0tCT1giLCJub25EZWxldGFibGVBY3RpdmVzT2ZEcmFmdHNUZXh0IiwiVEVYVCIsInVwZGF0ZUNvbnRlbnRGb3JEZWxldGVEaWFsb2ciLCJDaGVja0JveCIsInNlbGVjdCIsIm9FdmVudCIsImNoZWNrQm94IiwiZ2V0U291cmNlIiwiZ2V0U2VsZWN0ZWQiLCJ1cGRhdGVPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMiLCJkaXJlY3REZWxldGFibGVDb250ZXh0cyIsInBhcmVudENvbnRyb2wiLCJkZXNjcmlwdGlvbiIsIm9MaW5lQ29udGV4dERhdGEiLCJvVGFibGUiLCJzS2V5IiwiZ2V0UGFyZW50IiwiZ2V0SWRlbnRpZmllckNvbHVtbiIsInR4dCIsImFQYXJhbXMiLCJzS2V5VmFsdWUiLCJzRGVzY3JpcHRpb24iLCJwYXRoIiwiZGVsZXRhYmxlT3B0aW9uVHh0IiwidW5zaGlmdCIsImFsbERlbGV0YWJsZVR4dCIsImRlbGV0ZUNvbmZpcm1IYW5kbGVyIiwibWVzc2FnZUhhbmRsZXIiLCJhcHBDb21wb25lbnQiLCJkcmFmdEVuYWJsZWQiLCJiZWZvcmVEZWxldGVDYWxsQmFjayIsIlByb21pc2UiLCJhbGwiLCJlbmFibGVTdHJpY3RIYW5kbGluZyIsImRlbGV0ZURyYWZ0IiwiZGVsZXRlIiwiZXJyb3IiLCJzaG93TWVzc2FnZURpYWxvZyIsIm9FcnJvciIsInNob3dNZXNzYWdlcyIsInVwZGF0ZURlbGV0ZUluZm9Gb3JTZWxlY3RlZENvbnRleHRzIiwiY29udGV4dEluZm9zIiwibWV0YUNvbnRleHQiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsImdldE1ldGFDb250ZXh0IiwiZ2V0Q2Fub25pY2FsUGF0aCIsImRlbGV0YWJsZVBhdGgiLCJzdGF0aWNEZWxldGFibGUiLCJpbmZvIiwiaXNEcmFmdFJvb3QiLCJpc0RyYWZ0Tm9kZSIsImlzQWN0aXZlIiwiaGFzQWN0aXZlIiwiaGFzRHJhZnQiLCJsb2NrZWQiLCJkZWxldGFibGUiLCJzaWJsaW5nUHJvbWlzZSIsInJlc29sdmUiLCJzaWJsaW5nRGVsZXRhYmxlIiwiSW5Qcm9jZXNzQnlVc2VyIiwiY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiIsInRoZW4iLCJzaWJsaW5nSW5mb3JtYXRpb24iLCJyZXF1ZXN0UHJvcGVydHkiLCJidWNrZXRzIiwia2V5IiwidmFsdWUiLCJmaWx0ZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRlbGV0ZUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuXG5pbXBvcnQgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBkcmFmdCwgeyBTaWJsaW5nSW5mb3JtYXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VIYW5kbGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NZXNzYWdlSGFuZGxlclwiO1xuXG5pbXBvcnQgQ2hlY2tCb3ggZnJvbSBcInNhcC9tL0NoZWNrQm94XCI7XG5pbXBvcnQgTWVzc2FnZVRvYXN0IGZyb20gXCJzYXAvbS9NZXNzYWdlVG9hc3RcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5cbmltcG9ydCBUYWJsZUFQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUFQSVwiO1xuaW1wb3J0IEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbmltcG9ydCB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcIi4vTW9kZWxIZWxwZXJcIjtcblxuZXhwb3J0IGVudW0gRGVsZXRlT3B0aW9uVHlwZXMge1xuXHRkZWxldGFibGVDb250ZXh0cyA9IFwiZGVsZXRhYmxlQ29udGV4dHNcIixcblx0ZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSA9IFwiZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZVwiLFxuXHRjcmVhdGVNb2RlQ29udGV4dHMgPSBcImNyZWF0ZU1vZGVDb250ZXh0c1wiLFxuXHR1blNhdmVkQ29udGV4dHMgPSBcInVuU2F2ZWRDb250ZXh0c1wiLFxuXHRkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlID0gXCJkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlXCJcbn1cblxuZXhwb3J0IGVudW0gRGVsZXRlRGlhbG9nQ29udGVudENvbnRyb2wge1xuXHRDSEVDS0JPWCA9IFwiY2hlY2tCb3hcIixcblx0VEVYVCA9IFwidGV4dFwiXG59XG5cbmV4cG9ydCB0eXBlIERyYWZ0U2libGluZ1BhaXIgPSB7XG5cdGRyYWZ0OiBWNENvbnRleHQ7XG5cdHNpYmxpbmdJbmZvOiBTaWJsaW5nSW5mb3JtYXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBEZWxldGVPcHRpb24gPSB7XG5cdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzO1xuXHRjb250ZXh0czogVjRDb250ZXh0W107XG5cdHNlbGVjdGVkOiBib29sZWFuO1xuXHR0ZXh0Pzogc3RyaW5nO1xuXHRjb250cm9sPzogRGVsZXRlRGlhbG9nQ29udGVudENvbnRyb2w7XG59O1xuXG5leHBvcnQgdHlwZSBNb2RlbE9iamVjdFByb3BlcnRpZXMgPSB7XG5cdGRlbGV0YWJsZUNvbnRleHRzOiBWNENvbnRleHRbXTtcblx0dW5TYXZlZENvbnRleHRzOiBWNENvbnRleHRbXTtcblx0Y3JlYXRlTW9kZUNvbnRleHRzOiBWNENvbnRleHRbXTtcblx0ZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZTogVjRDb250ZXh0W107XG5cdGxvY2tlZENvbnRleHRzOiBWNENvbnRleHRbXTtcblx0ZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZTogRHJhZnRTaWJsaW5nUGFpcltdO1xuXHRkZWxldGVFbmFibGVkOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFUeXBlID0ge1xuXHREcmFmdFVVSUQ6IHN0cmluZztcblx0SW5Qcm9jZXNzQnlVc2VyPzogc3RyaW5nO1xuXHRJblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbj86IHN0cmluZztcblx0Q3JlYXRlZEJ5VXNlckRlc2NyaXB0aW9uPzogc3RyaW5nO1xuXHRDcmVhdGVkQnlVc2VyPzogc3RyaW5nO1xuXHRMYXN0Q2hhbmdlZEJ5VXNlckRlc2NyaXB0aW9uPzogc3RyaW5nO1xuXHRMYXN0Q2hhbmdlZEJ5VXNlcj86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIERlbGV0ZVBhcmFtZXRlcnMgPSB7XG5cdGludGVybmFsTW9kZWxDb250ZXh0OiBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzOiBudW1iZXI7XG5cdGVudGl0eVNldE5hbWU6IHN0cmluZztcblx0cGFyZW50Q29udHJvbDogQ29udHJvbDtcblx0ZGVzY3JpcHRpb246IHsgcGF0aDogc3RyaW5nIH07XG5cdGJlZm9yZURlbGV0ZUNhbGxCYWNrOiBGdW5jdGlvbjtcblx0ZGVsZXRhYmxlQ29udGV4dHM6IFY0Q29udGV4dFtdO1xuXHR1blNhdmVkQ29udGV4dHM6IFY0Q29udGV4dFtdO1xuXHRjcmVhdGVNb2RlQ29udGV4dHM6IFY0Q29udGV4dFtdO1xuXHRkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlOiBWNENvbnRleHRbXTtcblx0bG9ja2VkQ29udGV4dHM6IFY0Q29udGV4dFtdO1xuXHRkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlOiBEcmFmdFNpYmxpbmdQYWlyW107XG59O1xuXG5leHBvcnQgdHlwZSBEZWxldGVUZXh0SW5mbyA9IHtcblx0aW5mb1R4dD86IHN0cmluZztcblx0b3B0aW9uVHh0Pzogc3RyaW5nO1xuXHRvcHRpb25XaXRob3V0VHh0PzogYm9vbGVhbjtcbn07XG5cbmZ1bmN0aW9uIGdldFVwZGF0ZWRTZWxlY3Rpb25zKFxuXHRpbnRlcm5hbE1vZGVsQ29udGV4dDogSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLFxuXHRzZWxlY3RlZENvbnRleHRzOiBWNENvbnRleHRbXSxcblx0Y29udGV4dHNUb1JlbW92ZTogVjRDb250ZXh0W11cbik6IFY0Q29udGV4dFtdIHtcblx0Y29udGV4dHNUb1JlbW92ZS5mb3JFYWNoKChjb250ZXh0OiBWNENvbnRleHQpID0+IHtcblx0XHRjb25zdCBpZHggPSBzZWxlY3RlZENvbnRleHRzLmluZGV4T2YoY29udGV4dCk7XG5cdFx0aWYgKGlkeCAhPT0gLTEpIHtcblx0XHRcdHNlbGVjdGVkQ29udGV4dHMuc3BsaWNlKGlkeCwgMSk7XG5cdFx0fVxuXHR9KTtcblx0aW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkodHlwZSwgW10pO1xuXG5cdHJldHVybiBbLi4uc2VsZWN0ZWRDb250ZXh0c107XG59XG5cbmZ1bmN0aW9uIGNsZWFyU2VsZWN0ZWRDb250ZXh0c0Zvck9wdGlvbihpbnRlcm5hbE1vZGVsQ29udGV4dDogSW50ZXJuYWxNb2RlbENvbnRleHQsIG9wdGlvbjogRGVsZXRlT3B0aW9uKSB7XG5cdGxldCBzZWxlY3RlZENvbnRleHRzID0gKGludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwic2VsZWN0ZWRDb250ZXh0c1wiKSBhcyBWNENvbnRleHRbXSkgfHwgW107XG5cblx0aWYgKG9wdGlvbi50eXBlID09PSBEZWxldGVPcHRpb25UeXBlcy5kZWxldGFibGVDb250ZXh0cykge1xuXHRcdHNlbGVjdGVkQ29udGV4dHMgPSBnZXRVcGRhdGVkU2VsZWN0aW9ucyhcblx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0RGVsZXRlT3B0aW9uVHlwZXMuZGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHRzZWxlY3RlZENvbnRleHRzLFxuXHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoRGVsZXRlT3B0aW9uVHlwZXMuZGVsZXRhYmxlQ29udGV4dHMpIHx8IFtdXG5cdFx0KTtcblx0XHRzZWxlY3RlZENvbnRleHRzID0gZ2V0VXBkYXRlZFNlbGVjdGlvbnMoXG5cdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdERlbGV0ZU9wdGlvblR5cGVzLmNyZWF0ZU1vZGVDb250ZXh0cyxcblx0XHRcdHNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShEZWxldGVPcHRpb25UeXBlcy5jcmVhdGVNb2RlQ29udGV4dHMpIHx8IFtdXG5cdFx0KTtcblxuXHRcdGNvbnN0IGRyYWZ0U2libGluZ1BhaXJzID0gaW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoRGVsZXRlT3B0aW9uVHlwZXMuZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSkgfHwgW107XG5cdFx0Y29uc3QgZHJhZnRzID0gZHJhZnRTaWJsaW5nUGFpcnMubWFwKChjb250ZXh0UGFpcjogRHJhZnRTaWJsaW5nUGFpcikgPT4ge1xuXHRcdFx0cmV0dXJuIGNvbnRleHRQYWlyLmRyYWZ0O1xuXHRcdH0pO1xuXHRcdHNlbGVjdGVkQ29udGV4dHMgPSBnZXRVcGRhdGVkU2VsZWN0aW9ucyhcblx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0RGVsZXRlT3B0aW9uVHlwZXMuZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSxcblx0XHRcdHNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRkcmFmdHNcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGNvbnRleHRzVG9SZW1vdmUgPSBpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShvcHRpb24udHlwZSkgfHwgW107XG5cdFx0c2VsZWN0ZWRDb250ZXh0cyA9IGdldFVwZGF0ZWRTZWxlY3Rpb25zKGludGVybmFsTW9kZWxDb250ZXh0LCBvcHRpb24udHlwZSwgc2VsZWN0ZWRDb250ZXh0cywgY29udGV4dHNUb1JlbW92ZSk7XG5cdH1cblx0aW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzZWxlY3RlZENvbnRleHRzXCIsIHNlbGVjdGVkQ29udGV4dHMpO1xuXHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1wiLCBzZWxlY3RlZENvbnRleHRzLmxlbmd0aCk7XG59XG5cbmZ1bmN0aW9uIGFmdGVyRGVsZXRlUHJvY2VzcyhwYXJhbWV0ZXJzOiBEZWxldGVQYXJhbWV0ZXJzLCBvcHRpb25zOiBEZWxldGVPcHRpb25bXSwgY29udGV4dHM6IFY0Q29udGV4dFtdLCBvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlKSB7XG5cdGNvbnN0IHsgaW50ZXJuYWxNb2RlbENvbnRleHQsIGVudGl0eVNldE5hbWUgfSA9IHBhcmFtZXRlcnM7XG5cdGlmIChpbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdGlmIChpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcImRlbGV0ZUVuYWJsZWRcIikgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvcHRpb25zLmZvckVhY2goKG9wdGlvbikgPT4ge1xuXHRcdFx0XHQvLyBpZiBhbiBvcHRpb24gaXMgc2VsZWN0ZWQsIHRoZW4gaXQgaXMgZGVsZXRlZC4gU28sIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZW0gZnJvbSBzZWxlY3RlZCBjb250ZXh0cy5cblx0XHRcdFx0aWYgKG9wdGlvbi5zZWxlY3RlZCkge1xuXHRcdFx0XHRcdGNsZWFyU2VsZWN0ZWRDb250ZXh0c0Zvck9wdGlvbihpbnRlcm5hbE1vZGVsQ29udGV4dCwgb3B0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdC8vIGlmIGF0bGVhc3Qgb25lIG9mIHRoZSBvcHRpb25zIGlzIG5vdCBzZWxlY3RlZCwgdGhlbiB0aGUgZGVsZXRlIGJ1dHRvbiBuZWVkcyB0byBiZSBlbmFibGVkLlxuXHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFxuXHRcdFx0XCJkZWxldGVFbmFibGVkXCIsXG5cdFx0XHRvcHRpb25zLnNvbWUoKG9wdGlvbikgPT4gIW9wdGlvbi5zZWxlY3RlZClcblx0XHQpO1xuXHR9XG5cblx0aWYgKGNvbnRleHRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdE1lc3NhZ2VUb2FzdC5zaG93KFxuXHRcdFx0Q29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9ERUxFVEVfVE9BU1RfU0lOR1VMQVJcIiwgb1Jlc291cmNlQnVuZGxlLCB1bmRlZmluZWQsIGVudGl0eVNldE5hbWUpXG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHRNZXNzYWdlVG9hc3Quc2hvdyhcblx0XHRcdENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfREVMRVRFX1RPQVNUX1BMVVJBTFwiLCBvUmVzb3VyY2VCdW5kbGUsIHVuZGVmaW5lZCwgZW50aXR5U2V0TmFtZSlcblx0XHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldExvY2tlZENvbnRleHRVc2VyKGxvY2tlZENvbnRleHQ6IFY0Q29udGV4dCk6IHN0cmluZyB7XG5cdGNvbnN0IGRyYWZ0QWRtaW5EYXRhID0gbG9ja2VkQ29udGV4dC5nZXRPYmplY3QoKVtcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCJdIGFzIERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhVHlwZTtcblx0cmV0dXJuIChkcmFmdEFkbWluRGF0YSAmJiBkcmFmdEFkbWluRGF0YVtcIkluUHJvY2Vzc0J5VXNlclwiXSkgfHwgXCJcIjtcbn1cblxuZnVuY3Rpb24gZ2V0TG9ja2VkT2JqZWN0c1RleHQob1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSwgbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzOiBudW1iZXIsIGxvY2tlZENvbnRleHRzOiBWNENvbnRleHRbXSk6IHN0cmluZyB7XG5cdGxldCByZXRUeHQgPSBcIlwiO1xuXG5cdGlmIChudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPT09IDEgJiYgbG9ja2VkQ29udGV4dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0Ly9vbmx5IG9uZSB1bnNhdmVkIG9iamVjdFxuXHRcdGNvbnN0IGxvY2tlZFVzZXIgPSBnZXRMb2NrZWRDb250ZXh0VXNlcihsb2NrZWRDb250ZXh0c1swXSk7XG5cdFx0cmV0VHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1NJTkdMRV9PQkpFQ1RfTE9DS0VEXCIsIG9SZXNvdXJjZUJ1bmRsZSwgW1xuXHRcdFx0bG9ja2VkVXNlclxuXHRcdF0pO1xuXHR9IGVsc2UgaWYgKGxvY2tlZENvbnRleHRzLmxlbmd0aCA9PSAxKSB7XG5cdFx0Y29uc3QgbG9ja2VkVXNlciA9IGdldExvY2tlZENvbnRleHRVc2VyKGxvY2tlZENvbnRleHRzWzBdKTtcblx0XHRyZXRUeHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RJTkZPX0FORF9PTkVfT0JKRUNUX0xPQ0tFRFwiLFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0W251bWJlck9mU2VsZWN0ZWRDb250ZXh0cywgbG9ja2VkVXNlcl1cblx0XHQpO1xuXHR9IGVsc2UgaWYgKGxvY2tlZENvbnRleHRzLmxlbmd0aCA+IDEpIHtcblx0XHRyZXRUeHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RJTkZPX0FORF9GRVdfT0JKRUNUU19MT0NLRURcIixcblx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFtsb2NrZWRDb250ZXh0cy5sZW5ndGgsIG51bWJlck9mU2VsZWN0ZWRDb250ZXh0c11cblx0XHQpO1xuXHR9XG5cblx0cmV0dXJuIHJldFR4dDtcbn1cblxuZnVuY3Rpb24gZ2V0Tm9uRGVsZXRhYmxlQWN0aXZlc09mRHJhZnRzVGV4dChvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLCBudW1iZXJPZkRyYWZ0czogbnVtYmVyLCB0b3RhbERlbGV0YWJsZTogbnVtYmVyKTogc3RyaW5nIHtcblx0bGV0IHJldFR4dCA9IFwiXCI7XG5cblx0aWYgKHRvdGFsRGVsZXRhYmxlID09PSBudW1iZXJPZkRyYWZ0cykge1xuXHRcdGlmIChudW1iZXJPZkRyYWZ0cyA9PT0gMSkge1xuXHRcdFx0cmV0VHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfT05MWV9EUkFGVF9PRl9OT05fREVMRVRBQkxFX0FDVElWRVwiLFxuXHRcdFx0XHRvUmVzb3VyY2VCdW5kbGVcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldFR4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX09OTFlfRFJBRlRTX09GX05PTl9ERUxFVEFCTEVfQUNUSVZFXCIsXG5cdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZVxuXHRcdFx0KTtcblx0XHR9XG5cdH0gZWxzZSBpZiAobnVtYmVyT2ZEcmFmdHMgPT09IDEpIHtcblx0XHRyZXRUeHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX0RSQUZUX09GX05PTl9ERUxFVEFCTEVfQUNUSVZFXCIsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0VHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9EUkFGVFNfT0ZfTk9OX0RFTEVUQUJMRV9BQ1RJVkVcIiwgb1Jlc291cmNlQnVuZGxlKTtcblx0fVxuXG5cdHJldHVybiByZXRUeHQ7XG59XG5cbmZ1bmN0aW9uIGdldFVuU2F2ZWRDb250ZXh0VXNlcih1blNhdmVkQ29udGV4dDogVjRDb250ZXh0KTogc3RyaW5nIHtcblx0Y29uc3QgZHJhZnRBZG1pbkRhdGEgPSB1blNhdmVkQ29udGV4dC5nZXRPYmplY3QoKVtcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCJdIGFzIERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhVHlwZTtcblx0bGV0IHNMYXN0Q2hhbmdlZEJ5VXNlciA9IFwiXCI7XG5cdGlmIChkcmFmdEFkbWluRGF0YSkge1xuXHRcdHNMYXN0Q2hhbmdlZEJ5VXNlciA9IGRyYWZ0QWRtaW5EYXRhW1wiTGFzdENoYW5nZWRCeVVzZXJEZXNjcmlwdGlvblwiXSB8fCBkcmFmdEFkbWluRGF0YVtcIkxhc3RDaGFuZ2VkQnlVc2VyXCJdIHx8IFwiXCI7XG5cdH1cblxuXHRyZXR1cm4gc0xhc3RDaGFuZ2VkQnlVc2VyO1xufVxuXG5mdW5jdGlvbiBnZXRVbnNhdmVkQ29udGV4dHNUZXh0KFxuXHRvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLFxuXHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHM6IG51bWJlcixcblx0dW5TYXZlZENvbnRleHRzOiBWNENvbnRleHRbXSxcblx0dG90YWxEZWxldGFibGU6IG51bWJlclxuKTogRGVsZXRlVGV4dEluZm8ge1xuXHRsZXQgaW5mb1R4dCA9IFwiXCIsXG5cdFx0b3B0aW9uVHh0ID0gXCJcIixcblx0XHRvcHRpb25XaXRob3V0VHh0ID0gZmFsc2U7XG5cdGlmIChudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPT09IDEgJiYgdW5TYXZlZENvbnRleHRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdC8vb25seSBvbmUgdW5zYXZlZCBvYmplY3QgYXJlIHNlbGVjdGVkXG5cdFx0Y29uc3QgbGFzdENoYW5nZWRCeVVzZXIgPSBnZXRVblNhdmVkQ29udGV4dFVzZXIodW5TYXZlZENvbnRleHRzWzBdKTtcblx0XHRpbmZvVHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1VOU0FWRURfQ0hBTkdFU1wiLCBvUmVzb3VyY2VCdW5kbGUsIFtcblx0XHRcdGxhc3RDaGFuZ2VkQnlVc2VyXG5cdFx0XSk7XG5cdFx0b3B0aW9uV2l0aG91dFR4dCA9IHRydWU7XG5cdH0gZWxzZSBpZiAobnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID09PSB1blNhdmVkQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0Ly9vbmx5IG11bHRpcGxlIHVuc2F2ZWQgb2JqZWN0cyBhcmUgc2VsZWN0ZWRcblx0XHRpbmZvVHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfVU5TQVZFRF9DSEFOR0VTX01VTFRJUExFX09CSkVDVFNcIixcblx0XHRcdG9SZXNvdXJjZUJ1bmRsZVxuXHRcdCk7XG5cdFx0b3B0aW9uV2l0aG91dFR4dCA9IHRydWU7XG5cdH0gZWxzZSBpZiAodG90YWxEZWxldGFibGUgPT09IHVuU2F2ZWRDb250ZXh0cy5sZW5ndGgpIHtcblx0XHQvLyBub24tZGVsZXRhYmxlL2xvY2tlZCBleGlzdHMsIGFsbCBkZWxldGFibGUgYXJlIHVuc2F2ZWQgYnkgb3RoZXJzXG5cdFx0aWYgKHVuU2F2ZWRDb250ZXh0cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGNvbnN0IGxhc3RDaGFuZ2VkQnlVc2VyID0gZ2V0VW5TYXZlZENvbnRleHRVc2VyKHVuU2F2ZWRDb250ZXh0c1swXSk7XG5cdFx0XHRpbmZvVHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9VTlNBVkVEX0FORF9GRVdfT0JKRUNUU19MT0NLRURfU0lOR1VMQVJcIixcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRbbGFzdENoYW5nZWRCeVVzZXJdXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpbmZvVHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9VTlNBVkVEX0FORF9GRVdfT0JKRUNUU19MT0NLRURfUExVUkFMXCIsXG5cdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0b3B0aW9uV2l0aG91dFR4dCA9IHRydWU7XG5cdH0gZWxzZSBpZiAodG90YWxEZWxldGFibGUgPiB1blNhdmVkQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0Ly8gbm9uLWRlbGV0YWJsZS9sb2NrZWQgZXhpc3RzLCBkZWxldGFibGUgaW5jbHVkZSB1bnNhdmVkIGFuZCBvdGhlciB0eXBlcy5cblx0XHRpZiAodW5TYXZlZENvbnRleHRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0Y29uc3QgbGFzdENoYW5nZWRCeVVzZXIgPSBnZXRVblNhdmVkQ29udGV4dFVzZXIodW5TYXZlZENvbnRleHRzWzBdKTtcblx0XHRcdG9wdGlvblR4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT19BTkRfRkVXX09CSkVDVFNfVU5TQVZFRF9TSU5HVUxBUlwiLFxuXHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFtsYXN0Q2hhbmdlZEJ5VXNlcl1cblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9wdGlvblR4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT19BTkRfRkVXX09CSkVDVFNfVU5TQVZFRF9QTFVSQUxcIixcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7IGluZm9UeHQsIG9wdGlvblR4dCwgb3B0aW9uV2l0aG91dFR4dCB9O1xufVxuXG5mdW5jdGlvbiBnZXROb25EZWxldGFibGVUZXh0KG1QYXJhbWV0ZXJzOiBEZWxldGVQYXJhbWV0ZXJzLCB0b3RhbE51bURlbGV0YWJsZUNvbnRleHRzOiBudW1iZXIsIG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUpOiBzdHJpbmcge1xuXHRjb25zdCB7IG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cywgbG9ja2VkQ29udGV4dHMsIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUgfSA9IG1QYXJhbWV0ZXJzO1xuXHRjb25zdCBub25EZWxldGFibGVDb250ZXh0cyA9XG5cdFx0bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIC0gKGxvY2tlZENvbnRleHRzLmxlbmd0aCArIHRvdGFsTnVtRGVsZXRhYmxlQ29udGV4dHMgLSBkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLmxlbmd0aCk7XG5cdGxldCByZXRUeHQgPSBcIlwiO1xuXG5cdGlmIChcblx0XHRub25EZWxldGFibGVDb250ZXh0cyA+IDAgJiZcblx0XHQodG90YWxOdW1EZWxldGFibGVDb250ZXh0cyA9PT0gMCB8fCBkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLmxlbmd0aCA9PT0gdG90YWxOdW1EZWxldGFibGVDb250ZXh0cylcblx0KSB7XG5cdFx0Ly8gMS4gTm9uZSBvZiB0aGUgY2NvbnRleHRzIGFyZSBkZWxldGFibGVcblx0XHQvLyAyLiBPbmx5IGRyYWZ0cyBvZiBub24gZGVsZXRhYmxlIGNvbnRleHRzIGV4aXN0LlxuXHRcdGlmIChsb2NrZWRDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHQvLyBMb2NrZWQgY29udGV4dHMgZXhpc3Rcblx0XHRcdGlmIChub25EZWxldGFibGVDb250ZXh0cyA9PT0gMSkge1xuXHRcdFx0XHRyZXRUeHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfQUxMX1JFTUFJTklOR19OT05fREVMRVRBQkxFX1NJTkdVTEFSXCIsXG5cdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdHVuZGVmaW5lZFxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0VHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX0FMTF9SRU1BSU5JTkdfTk9OX0RFTEVUQUJMRV9QTFVSQUxcIixcblx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0dW5kZWZpbmVkXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChub25EZWxldGFibGVDb250ZXh0cyA9PT0gMSkge1xuXHRcdFx0Ly8gT25seSBwdXJlIG5vbi1kZWxldGFibGUgY29udGV4dHMgZXhpc3Qgc2luZ2xlXG5cdFx0XHRyZXRUeHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1NJTkdMRV9BTkRfT05FX09CSkVDVF9OT05fREVMRVRBQkxFXCIsXG5cdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0dW5kZWZpbmVkXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPbmx5IHB1cmUgbm9uLWRlbGV0YWJsZSBjb250ZXh0cyBleGlzdCBtdWx0aXBsZVxuXHRcdFx0cmV0VHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9NVUxUSVBMRV9BTkRfQUxMX09CSkVDVF9OT05fREVMRVRBQkxFXCIsXG5cdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0dW5kZWZpbmVkXG5cdFx0XHQpO1xuXHRcdH1cblx0fSBlbHNlIGlmIChub25EZWxldGFibGVDb250ZXh0cyA9PT0gMSkge1xuXHRcdC8vIGRlbGV0YWJsZSBhbmQgbm9uLWRlbGV0YWJsZSBleGlzdHMgdG9nZXRoZXIsIHNpbmdsZVxuXHRcdHJldFR4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX09ORV9PQkpFQ1RfTk9OX0RFTEVUQUJMRVwiLFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0W251bWJlck9mU2VsZWN0ZWRDb250ZXh0c11cblx0XHQpO1xuXHR9IGVsc2UgaWYgKG5vbkRlbGV0YWJsZUNvbnRleHRzID4gMSkge1xuXHRcdC8vIGRlbGV0YWJsZSBhbmQgbm9uLWRlbGV0YWJsZSBleGlzdHMgdG9nZXRoZXIsIG11bHRpcGxlXG5cdFx0cmV0VHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT19BTkRfRkVXX09CSkVDVFNfTk9OX0RFTEVUQUJMRVwiLFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0W25vbkRlbGV0YWJsZUNvbnRleHRzLCBudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNdXG5cdFx0KTtcblx0fVxuXG5cdHJldHVybiByZXRUeHQ7XG59XG5cbmZ1bmN0aW9uIGdldENvbmZpcm1lZERlbGV0YWJsZUNvbnRleHQoY29udGV4dHM6IFY0Q29udGV4dFtdLCBvcHRpb25zOiBEZWxldGVPcHRpb25bXSk6IFY0Q29udGV4dFtdIHtcblx0cmV0dXJuIG9wdGlvbnMucmVkdWNlKChyZXN1bHQsIG9wdGlvbikgPT4ge1xuXHRcdHJldHVybiBvcHRpb24uc2VsZWN0ZWQgPyByZXN1bHQuY29uY2F0KG9wdGlvbi5jb250ZXh0cykgOiByZXN1bHQ7XG5cdH0sIGNvbnRleHRzKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlRHJhZnRPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMoXG5cdG1QYXJhbWV0ZXJzOiBEZWxldGVQYXJhbWV0ZXJzLFxuXHR2Q29udGV4dHM6IFY0Q29udGV4dFtdLFxuXHR0b3RhbERlbGV0YWJsZTogbnVtYmVyLFxuXHRvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLFxuXHRpdGVtczogQ29udHJvbFtdLFxuXHRvcHRpb25zOiBEZWxldGVPcHRpb25bXVxuKSB7XG5cdGNvbnN0IHtcblx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMsXG5cdFx0ZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSxcblx0XHR1blNhdmVkQ29udGV4dHMsXG5cdFx0Y3JlYXRlTW9kZUNvbnRleHRzLFxuXHRcdGxvY2tlZENvbnRleHRzLFxuXHRcdGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmVcblx0fSA9IG1QYXJhbWV0ZXJzO1xuXHRsZXQgbm9uRGVsZXRhYmxlQ29udGV4dFRleHQgPSBcIlwiLFxuXHRcdGxvY2tlZENvbnRleHRzVHh0ID0gXCJcIjtcblxuXHQvLyBkcmFmdHMgd2l0aCBhY3RpdmVcblx0aWYgKGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUubGVuZ3RoID4gMCkge1xuXHRcdGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUuZm9yRWFjaCgoZGVsZXRhYmxlRHJhZnRJbmZvOiBEcmFmdFNpYmxpbmdQYWlyKSA9PiB7XG5cdFx0XHR2Q29udGV4dHMucHVzaChkZWxldGFibGVEcmFmdEluZm8uc2libGluZ0luZm8udGFyZ2V0Q29udGV4dCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBjcmVhdGUgbW9kZSBkcmFmdHNcblx0aWYgKGNyZWF0ZU1vZGVDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0Ly8gY3JlYXRlIG1vZGUgZHJhZnRzXG5cdFx0Y3JlYXRlTW9kZUNvbnRleHRzLmZvckVhY2goKGNvbnRleHQpID0+IHZDb250ZXh0cy5wdXNoKGNvbnRleHQpKTtcblx0fVxuXG5cdC8vIGl0ZW1zIGxvY2tlZCBtc2dcblx0aWYgKGxvY2tlZENvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRsb2NrZWRDb250ZXh0c1R4dCA9IGRlbGV0ZUhlbHBlci5nZXRMb2NrZWRPYmplY3RzVGV4dChvUmVzb3VyY2VCdW5kbGUsIG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cywgbG9ja2VkQ29udGV4dHMpIHx8IFwiXCI7XG5cdFx0aXRlbXMucHVzaChuZXcgVGV4dCh7IHRleHQ6IGxvY2tlZENvbnRleHRzVHh0IH0pKTtcblx0fVxuXG5cdC8vIG5vbiBkZWxldGFibGUgbXNnXG5cdGlmIChudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgIT0gdG90YWxEZWxldGFibGUgLSBkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLmxlbmd0aCArIGxvY2tlZENvbnRleHRzLmxlbmd0aCkge1xuXHRcdG5vbkRlbGV0YWJsZUNvbnRleHRUZXh0ID0gZGVsZXRlSGVscGVyLmdldE5vbkRlbGV0YWJsZVRleHQobVBhcmFtZXRlcnMsIHRvdGFsRGVsZXRhYmxlLCBvUmVzb3VyY2VCdW5kbGUpO1xuXHRcdGl0ZW1zLnB1c2gobmV3IFRleHQoeyB0ZXh0OiBub25EZWxldGFibGVDb250ZXh0VGV4dCB9KSk7XG5cdH1cblxuXHQvLyBvcHRpb246IHVuc2F2ZWQgY2hhbmdlcyBieSBvdGhlcnNcblx0aWYgKHVuU2F2ZWRDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3QgdW5zYXZlZENoYW5nZXNUeHRzID1cblx0XHRcdGRlbGV0ZUhlbHBlci5nZXRVbnNhdmVkQ29udGV4dHNUZXh0KG9SZXNvdXJjZUJ1bmRsZSwgbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzLCB1blNhdmVkQ29udGV4dHMsIHRvdGFsRGVsZXRhYmxlKSB8fCB7fTtcblx0XHRpZiAodW5zYXZlZENoYW5nZXNUeHRzLmluZm9UeHQpIHtcblx0XHRcdGl0ZW1zLnB1c2gobmV3IFRleHQoeyB0ZXh0OiB1bnNhdmVkQ2hhbmdlc1R4dHMuaW5mb1R4dCB9KSk7XG5cdFx0fVxuXHRcdGlmICh1bnNhdmVkQ2hhbmdlc1R4dHMub3B0aW9uVHh0IHx8IHVuc2F2ZWRDaGFuZ2VzVHh0cy5vcHRpb25XaXRob3V0VHh0KSB7XG5cdFx0XHRvcHRpb25zLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBEZWxldGVPcHRpb25UeXBlcy51blNhdmVkQ29udGV4dHMsXG5cdFx0XHRcdGNvbnRleHRzOiB1blNhdmVkQ29udGV4dHMsXG5cdFx0XHRcdHRleHQ6IHVuc2F2ZWRDaGFuZ2VzVHh0cy5vcHRpb25UeHQsXG5cdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHRjb250cm9sOiBEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbC5DSEVDS0JPWFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gb3B0aW9uOiBkcmFmdHMgd2l0aCBhY3RpdmUgbm90IGRlbGV0YWJsZVxuXHRpZiAoZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3Qgbm9uRGVsZXRhYmxlQWN0aXZlc09mRHJhZnRzVGV4dCA9XG5cdFx0XHRkZWxldGVIZWxwZXIuZ2V0Tm9uRGVsZXRhYmxlQWN0aXZlc09mRHJhZnRzVGV4dChvUmVzb3VyY2VCdW5kbGUsIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUubGVuZ3RoLCB0b3RhbERlbGV0YWJsZSkgfHwgXCJcIjtcblx0XHRpZiAobm9uRGVsZXRhYmxlQWN0aXZlc09mRHJhZnRzVGV4dCkge1xuXHRcdFx0b3B0aW9ucy5wdXNoKHtcblx0XHRcdFx0dHlwZTogRGVsZXRlT3B0aW9uVHlwZXMuZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSxcblx0XHRcdFx0Y29udGV4dHM6IGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUsXG5cdFx0XHRcdHRleHQ6IG5vbkRlbGV0YWJsZUFjdGl2ZXNPZkRyYWZ0c1RleHQsXG5cdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHRjb250cm9sOiB0b3RhbERlbGV0YWJsZSA+IDAgPyBEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbC5DSEVDS0JPWCA6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLlRFWFRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVDb250ZW50Rm9yRGVsZXRlRGlhbG9nKG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdLCBpdGVtczogQ29udHJvbFtdKSB7XG5cdGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdC8vIFNpbmdsZSBvcHRpb24gZG9lc24ndCBuZWVkIGNoZWNrQm94XG5cdFx0Y29uc3Qgb3B0aW9uID0gb3B0aW9uc1swXTtcblx0XHRpZiAob3B0aW9uLnRleHQpIHtcblx0XHRcdGl0ZW1zLnB1c2gobmV3IFRleHQoeyB0ZXh0OiBvcHRpb24udGV4dCB9KSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG9wdGlvbnMubGVuZ3RoID4gMSkge1xuXHRcdC8vIE11bHRpcGxlIE9wdGlvbnNcblxuXHRcdC8vIFRleHRzXG5cdFx0b3B0aW9ucy5mb3JFYWNoKChvcHRpb246IERlbGV0ZU9wdGlvbikgPT4ge1xuXHRcdFx0aWYgKG9wdGlvbi5jb250cm9sID09PSBcInRleHRcIiAmJiBvcHRpb24udGV4dCkge1xuXHRcdFx0XHRpdGVtcy5wdXNoKG5ldyBUZXh0KHsgdGV4dDogb3B0aW9uLnRleHQgfSkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdC8vIENoZWNrQm94c1xuXHRcdG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uOiBEZWxldGVPcHRpb24pID0+IHtcblx0XHRcdGlmIChvcHRpb24uY29udHJvbCA9PT0gXCJjaGVja0JveFwiICYmIG9wdGlvbi50ZXh0KSB7XG5cdFx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdFx0bmV3IENoZWNrQm94KHtcblx0XHRcdFx0XHRcdHRleHQ6IG9wdGlvbi50ZXh0LFxuXHRcdFx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0XHRzZWxlY3Q6IGZ1bmN0aW9uIChvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGNoZWNrQm94ID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIENoZWNrQm94O1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzZWxlY3RlZCA9IGNoZWNrQm94LmdldFNlbGVjdGVkKCk7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbi5zZWxlY3RlZCA9IHNlbGVjdGVkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlT3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzKFxuXHRtUGFyYW1ldGVyczogRGVsZXRlUGFyYW1ldGVycyxcblx0ZGlyZWN0RGVsZXRhYmxlQ29udGV4dHM6IFY0Q29udGV4dFtdLFxuXHRvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLFxuXHRvcHRpb25zOiBEZWxldGVPcHRpb25bXVxuKSB7XG5cdGNvbnN0IHtcblx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMsXG5cdFx0ZW50aXR5U2V0TmFtZSxcblx0XHRwYXJlbnRDb250cm9sLFxuXHRcdGRlc2NyaXB0aW9uLFxuXHRcdGxvY2tlZENvbnRleHRzLFxuXHRcdGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUsXG5cdFx0dW5TYXZlZENvbnRleHRzXG5cdH0gPSBtUGFyYW1ldGVycztcblx0Y29uc3QgdG90YWxEZWxldGFibGUgPSBkaXJlY3REZWxldGFibGVDb250ZXh0cy5sZW5ndGggKyBkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLmxlbmd0aCArIHVuU2F2ZWRDb250ZXh0cy5sZW5ndGg7XG5cdGNvbnN0IG5vbkRlbGV0YWJsZUNvbnRleHRzID0gbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIC0gKGxvY2tlZENvbnRleHRzLmxlbmd0aCArIHRvdGFsRGVsZXRhYmxlIC0gZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGgpO1xuXG5cdGlmIChudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPT09IDEgJiYgbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID09PSBkaXJlY3REZWxldGFibGVDb250ZXh0cy5sZW5ndGgpIHtcblx0XHQvLyBzaW5nbGUgZGVsZXRhYmxlIGNvbnRleHRcblx0XHRjb25zdCBvTGluZUNvbnRleHREYXRhID0gZGlyZWN0RGVsZXRhYmxlQ29udGV4dHNbMF0uZ2V0T2JqZWN0KCk7XG5cdFx0Y29uc3Qgb1RhYmxlID0gcGFyZW50Q29udHJvbCBhcyBUYWJsZTtcblx0XHRjb25zdCBzS2V5ID0gb1RhYmxlICYmIChvVGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEkpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0XHRsZXQgdHh0O1xuXHRcdGxldCBhUGFyYW1zID0gW107XG5cdFx0aWYgKHNLZXkpIHtcblx0XHRcdGNvbnN0IHNLZXlWYWx1ZSA9IHNLZXkgPyBvTGluZUNvbnRleHREYXRhW3NLZXldIDogdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3Qgc0Rlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24gJiYgZGVzY3JpcHRpb24ucGF0aCA/IG9MaW5lQ29udGV4dERhdGFbZGVzY3JpcHRpb24ucGF0aF0gOiB1bmRlZmluZWQ7XG5cdFx0XHRpZiAoc0tleVZhbHVlKSB7XG5cdFx0XHRcdGlmIChzRGVzY3JpcHRpb24gJiYgZGVzY3JpcHRpb24gJiYgc0tleSAhPT0gZGVzY3JpcHRpb24ucGF0aCkge1xuXHRcdFx0XHRcdGFQYXJhbXMgPSBbc0tleVZhbHVlICsgXCIgXCIsIHNEZXNjcmlwdGlvbl07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YVBhcmFtcyA9IFtzS2V5VmFsdWUsIFwiXCJdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHR4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RJTkZPXCIsXG5cdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdGFQYXJhbXMsXG5cdFx0XHRcdFx0ZW50aXR5U2V0TmFtZVxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIGlmIChzS2V5VmFsdWUpIHtcblx0XHRcdFx0YVBhcmFtcyA9IFtzS2V5VmFsdWUsIFwiXCJdO1xuXHRcdFx0XHR0eHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT1wiLFxuXHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRhUGFyYW1zLFxuXHRcdFx0XHRcdGVudGl0eVNldE5hbWVcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHR4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RUSVRMRV9TSU5HVUxBUlwiLFxuXHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0ZW50aXR5U2V0TmFtZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0eHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVFRJVExFX1NJTkdVTEFSXCIsXG5cdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRlbnRpdHlTZXROYW1lXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRvcHRpb25zLnB1c2goe1xuXHRcdFx0dHlwZTogRGVsZXRlT3B0aW9uVHlwZXMuZGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHRjb250ZXh0czogZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHR0ZXh0OiB0eHQsXG5cdFx0XHRzZWxlY3RlZDogdHJ1ZSxcblx0XHRcdGNvbnRyb2w6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLlRFWFRcblx0XHR9KTtcblx0fSBlbHNlIGlmIChcblx0XHR1blNhdmVkQ29udGV4dHMubGVuZ3RoICE9PSB0b3RhbERlbGV0YWJsZSAmJlxuXHRcdG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA+IDAgJiZcblx0XHQoZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMubGVuZ3RoID4gMCB8fCAodW5TYXZlZENvbnRleHRzLmxlbmd0aCA+IDAgJiYgZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGggPiAwKSlcblx0KSB7XG5cdFx0aWYgKG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA+IGRpcmVjdERlbGV0YWJsZUNvbnRleHRzLmxlbmd0aCAmJiBub25EZWxldGFibGVDb250ZXh0cyArIGxvY2tlZENvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIG90aGVyIHR5cGVzIGV4aXN0cyB3aXRoIHB1cmUgZGVsZXRhYmxlIG9uZXNcblx0XHRcdGxldCBkZWxldGFibGVPcHRpb25UeHQgPSBcIlwiO1xuXHRcdFx0aWYgKHRvdGFsRGVsZXRhYmxlID09PSAxKSB7XG5cdFx0XHRcdGRlbGV0YWJsZU9wdGlvblR4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RUSVRMRV9TSU5HVUxBUl9OT05fREVMRVRBQkxFXCIsXG5cdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRlbnRpdHlTZXROYW1lXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkZWxldGFibGVPcHRpb25UeHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfUExVUkFMX05PTl9ERUxFVEFCTEVcIixcblx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdGVudGl0eVNldE5hbWVcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdG9wdGlvbnMudW5zaGlmdCh7XG5cdFx0XHRcdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLmRlbGV0YWJsZUNvbnRleHRzLFxuXHRcdFx0XHRjb250ZXh0czogZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHRcdHRleHQ6IGRlbGV0YWJsZU9wdGlvblR4dCxcblx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdGNvbnRyb2w6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLlRFWFRcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBvbmx5IGRlbGV0YWJsZVxuXHRcdFx0Y29uc3QgYWxsRGVsZXRhYmxlVHh0ID1cblx0XHRcdFx0dG90YWxEZWxldGFibGUgPT09IDFcblx0XHRcdFx0XHQ/IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfU0lOR1VMQVJcIixcblx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdGVudGl0eVNldE5hbWVcblx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHQ6IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfUExVUkFMXCIsXG5cdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRlbnRpdHlTZXROYW1lXG5cdFx0XHRcdFx0ICApO1xuXHRcdFx0b3B0aW9ucy5wdXNoKHtcblx0XHRcdFx0dHlwZTogRGVsZXRlT3B0aW9uVHlwZXMuZGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHRcdGNvbnRleHRzOiBkaXJlY3REZWxldGFibGVDb250ZXh0cyxcblx0XHRcdFx0dGV4dDogYWxsRGVsZXRhYmxlVHh0LFxuXHRcdFx0XHRzZWxlY3RlZDogdHJ1ZSxcblx0XHRcdFx0Y29udHJvbDogRGVsZXRlRGlhbG9nQ29udGVudENvbnRyb2wuVEVYVFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUNvbmZpcm1IYW5kbGVyKFxuXHRvcHRpb25zOiBEZWxldGVPcHRpb25bXSxcblx0bVBhcmFtZXRlcnM6IERlbGV0ZVBhcmFtZXRlcnMsXG5cdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlcixcblx0b1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSxcblx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdGRyYWZ0RW5hYmxlZDogYm9vbGVhblxuKSB7XG5cdHRyeSB7XG5cdFx0Y29uc3QgY29udGV4dHMgPSBkZWxldGVIZWxwZXIuZ2V0Q29uZmlybWVkRGVsZXRhYmxlQ29udGV4dChbXSwgb3B0aW9ucyk7XG5cdFx0Y29uc3QgeyBiZWZvcmVEZWxldGVDYWxsQmFjaywgcGFyZW50Q29udHJvbCB9ID0gbVBhcmFtZXRlcnM7XG5cdFx0aWYgKGJlZm9yZURlbGV0ZUNhbGxCYWNrKSB7XG5cdFx0XHRhd2FpdCBiZWZvcmVEZWxldGVDYWxsQmFjayh7IGNvbnRleHRzOiBjb250ZXh0cyB9KTtcblx0XHR9XG5cblx0XHRpZiAoY29udGV4dHMgJiYgY29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCBQcm9taXNlLmFsbChcblx0XHRcdFx0XHRjb250ZXh0cy5tYXAoZnVuY3Rpb24gKGNvbnRleHQ6IFY0Q29udGV4dCkge1xuXHRcdFx0XHRcdFx0aWYgKGRyYWZ0RW5hYmxlZCAmJiAhY29udGV4dC5nZXRQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpKSB7XG5cdFx0XHRcdFx0XHRcdC8vZGVsZXRlIHRoZSBkcmFmdFxuXHRcdFx0XHRcdFx0XHRjb25zdCBlbmFibGVTdHJpY3RIYW5kbGluZyA9IGNvbnRleHRzLmxlbmd0aCA9PT0gMSA/IHRydWUgOiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGRyYWZ0LmRlbGV0ZURyYWZ0KGNvbnRleHQsIGFwcENvbXBvbmVudCwgZW5hYmxlU3RyaWN0SGFuZGxpbmcpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRleHQuZGVsZXRlKCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblx0XHRcdFx0ZGVsZXRlSGVscGVyLmFmdGVyRGVsZXRlUHJvY2VzcyhtUGFyYW1ldGVycywgb3B0aW9ucywgY29udGV4dHMsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZyh7IGNvbnRyb2w6IHBhcmVudENvbnRyb2wgfSk7XG5cdFx0XHRcdC8vIHJlLXRocm93IGVycm9yIHRvIGVuZm9yY2UgcmVqZWN0aW5nIHRoZSBnZW5lcmFsIHByb21pc2Vcblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoKTtcblx0XHQvLyByZS10aHJvdyBlcnJvciB0byBlbmZvcmNlIHJlamVjdGluZyB0aGUgZ2VuZXJhbCBwcm9taXNlXG5cdFx0dGhyb3cgb0Vycm9yO1xuXHR9XG59XG5cbi8vIFRhYmxlIFJ1bnRpbWUgSGVscGVyczpcblxuLyogcmVmcmVzaGVzIGRhdGEgaW4gaW50ZXJuYWwgbW9kZWwgcmVsZXZhbnQgZm9yIGVuYWJsZW1lbnQgb2YgZGVsZXRlIGJ1dHRvbiBhY2NvcmRpbmcgdG8gc2VsZWN0ZWQgY29udGV4dHNcbnJlbGV2YW50IGRhdGEgYXJlOiBkZWxldGFibGVDb250ZXh0cywgZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSwgZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSwgY3JlYXRlTW9kZUNvbnRleHRzLCB1blNhdmVkQ29udGV4dHMsIGRlbGV0ZUVuYWJsZWRcbm5vdCByZWxldmFudDogbG9ja2VkQ29udGV4dHNcbiovXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVEZWxldGVJbmZvRm9yU2VsZWN0ZWRDb250ZXh0cyhpbnRlcm5hbE1vZGVsQ29udGV4dDogSW50ZXJuYWxNb2RlbENvbnRleHQsIHNlbGVjdGVkQ29udGV4dHM6IENvbnRleHRbXSkge1xuXHR0eXBlIGNvbnRleHRJbmZvID0ge1xuXHRcdGNvbnRleHQ6IENvbnRleHQ7XG5cdFx0c2libGluZ1Byb21pc2U6IFByb21pc2U8U2libGluZ0luZm9ybWF0aW9uIHwgdW5kZWZpbmVkIHwgdm9pZD47XG5cdFx0c2libGluZ0luZm86IFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRpc0RyYWZ0Um9vdDogYm9vbGVhbjtcblx0XHRpc0RyYWZ0Tm9kZTogYm9vbGVhbjtcblx0XHRpc0FjdGl2ZTogYm9vbGVhbjtcblx0XHRoYXNBY3RpdmU6IGJvb2xlYW47XG5cdFx0aGFzRHJhZnQ6IGJvb2xlYW47XG5cdFx0bG9ja2VkOiBib29sZWFuO1xuXHRcdGRlbGV0YWJsZTogYm9vbGVhbjtcblx0XHRzaWJsaW5nRGVsZXRhYmxlOiBib29sZWFuO1xuXHR9O1xuXHRjb25zdCBjb250ZXh0SW5mb3MgPSBzZWxlY3RlZENvbnRleHRzLm1hcCgoY29udGV4dCkgPT4ge1xuXHRcdC8vIGFzc3VtaW5nIG1ldGFDb250ZXh0IGlzIHRoZSBzYW1lIGZvciBhbGwgY29udGV4dHMsIHN0aWxsIG5vdCByZWx5aW5nIG9uIHRoaXMgYXNzdW1wdGlvblxuXHRcdGNvbnN0IG1ldGFDb250ZXh0ID0gY29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE1ldGFDb250ZXh0KGNvbnRleHQuZ2V0Q2Fub25pY2FsUGF0aCgpKTtcblx0XHRjb25zdCBkZWxldGFibGVQYXRoID0gbWV0YUNvbnRleHQuZ2V0UHJvcGVydHkoXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWxldGVSZXN0cmljdGlvbnMvRGVsZXRhYmxlLyRQYXRoXCIpO1xuXHRcdGNvbnN0IHN0YXRpY0RlbGV0YWJsZSA9XG5cdFx0XHQhZGVsZXRhYmxlUGF0aCAmJiBtZXRhQ29udGV4dC5nZXRQcm9wZXJ0eShcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlbGV0ZVJlc3RyaWN0aW9ucy9EZWxldGFibGVcIikgIT09IGZhbHNlO1xuXHRcdC8vIGRlZmF1bHQgdmFsdWVzIGFjY29yZGluZyB0byBub24tZHJhZnQgY2FzZSAoc3RpY2t5IGJlaGF2ZXMgdGhlIHNhbWUgYXMgbm9uLWRyYWZ0IGZyb20gVUkgcG9pbnQgb2YgdmlldyByZWdhcmRpbmcgZGVsZXRpb24pXG5cdFx0Y29uc3QgaW5mbzogY29udGV4dEluZm8gPSB7XG5cdFx0XHRjb250ZXh0OiBjb250ZXh0LFxuXHRcdFx0aXNEcmFmdFJvb3Q6ICEhbWV0YUNvbnRleHQuZ2V0UHJvcGVydHkoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiKSxcblx0XHRcdGlzRHJhZnROb2RlOiAhIW1ldGFDb250ZXh0LmdldFByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVcIiksXG5cdFx0XHRpc0FjdGl2ZTogdHJ1ZSxcblx0XHRcdGhhc0FjdGl2ZTogZmFsc2UsXG5cdFx0XHRoYXNEcmFmdDogZmFsc2UsXG5cdFx0XHRsb2NrZWQ6IGZhbHNlLFxuXHRcdFx0ZGVsZXRhYmxlOiBkZWxldGFibGVQYXRoID8gY29udGV4dC5nZXRQcm9wZXJ0eShkZWxldGFibGVQYXRoKSA6IHN0YXRpY0RlbGV0YWJsZSxcblx0XHRcdHNpYmxpbmdQcm9taXNlOiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKSxcblx0XHRcdHNpYmxpbmdJbmZvOiB1bmRlZmluZWQsXG5cdFx0XHRzaWJsaW5nRGVsZXRhYmxlOiBmYWxzZVxuXHRcdH07XG5cblx0XHRpZiAoaW5mby5pc0RyYWZ0Um9vdCkge1xuXHRcdFx0aW5mby5sb2NrZWQgPSAhIWNvbnRleHQuZ2V0T2JqZWN0KFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFcIik/LkluUHJvY2Vzc0J5VXNlcjtcblx0XHRcdGluZm8uaGFzRHJhZnQgPSBjb250ZXh0LmdldFByb3BlcnR5KFwiSGFzRHJhZnRFbnRpdHlcIik7XG5cdFx0fVxuXHRcdGlmIChpbmZvLmlzRHJhZnRSb290IHx8IGluZm8uaXNEcmFmdE5vZGUpIHtcblx0XHRcdGluZm8uaXNBY3RpdmUgPSBjb250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0XHRpbmZvLmhhc0FjdGl2ZSA9IGNvbnRleHQuZ2V0UHJvcGVydHkoXCJIYXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0XHRpZiAoIWluZm8uaXNBY3RpdmUgJiYgaW5mby5oYXNBY3RpdmUpIHtcblx0XHRcdFx0Ly8gZ2V0IHNpYmxpbmcgY29udGV4dHNcblx0XHRcdFx0Ly8gZHJhZnQuY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiBleHBlY3RzIGRyYWZ0IHJvb3QgYXMgZmlyc3QgcGFyYW1ldGVyIC0gaWYgd2UgYXJlIG9uIGEgc3Vibm9kZSwgdGhpcyBpcyBub3QgZ2l2ZW5cblx0XHRcdFx0Ly8gLSBkb25lIHdyb25nIGFsc28gYWJvdmUsIGJ1dCBzZWVtcyBub3QgdG8gYnJlYWsgYW55dGhpbmdcblx0XHRcdFx0Ly8gLSB3aHkgaXMgZHJhZnQuY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiBub3QgYWJsZSB0byBjYWxjdWxhdGUgZHJhZnQgcm9vdCBvbiBpdHMgb3duPyFcblx0XHRcdFx0Ly8gLSBhbmQgd2h5IGlzIGl0IG5vdCBhYmxlIHRvIGRlYWwgd2l0aCBjb250ZXh0cyBub3QgZHJhZnQgZW5hYmxlZCAob2YgY291cnNlIHRoZXkgbmV2ZXIgaGF2ZSBhIHNpYmxpbmcgLSBjb3VsZCBqdXN0IHJldHVybiB1bmRlZmluZWQpXG5cdFx0XHRcdGluZm8uc2libGluZ1Byb21pc2UgPSBkcmFmdC5jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKGNvbnRleHQsIGNvbnRleHQpLnRoZW4oYXN5bmMgKHNpYmxpbmdJbmZvcm1hdGlvbikgPT4ge1xuXHRcdFx0XHRcdC8vIEZvciBkcmFmdFdpdGhEZWxldGFibGVBY3RpdmUgYnVja2V0LCBjdXJyZW50bHkgYWxzbyBzaWJsaW5nSW5mb3JtYXRpb24gaXMgcHV0IGludG8gaW50ZXJuYWxNb2RlbCBhbmQgdXNlZFxuXHRcdFx0XHRcdC8vIGZyb20gdGhlcmUgaW4gY2FzZSBvZiBkZWxldGlvbi4gVGhlcmVmb3JlLCBzaWJsaW5nIG5lZWRzIHRvIGJlIHJldHJpZXZlZCBpbiBjYXNlIG9mIHN0YXRpY0RlbGV0YWJsZS5cblx0XHRcdFx0XHQvLyBQb3NzaWJsZSBpbXByb3ZlbWVudDogT25seSByZWFkIHNpYmxpbmdJbmZvIGhlcmUgaWYgbmVlZGVkIGZvciBkZXRlcm1pbmF0aW9uIG9mIGRlbGV0ZSBidXR0b24gZW5hYmxlbWVudCxcblx0XHRcdFx0XHQvLyBpbiBvdGhlciBjYXNlcywgcmVhZCBpdCBvbmx5IGlmIGRlbGV0aW9uIHJlYWxseSBoYXBwZW5zLlxuXHRcdFx0XHRcdGluZm8uc2libGluZ0luZm8gPSBzaWJsaW5nSW5mb3JtYXRpb247XG5cdFx0XHRcdFx0aWYgKGRlbGV0YWJsZVBhdGgpIHtcblx0XHRcdFx0XHRcdGluZm8uc2libGluZ0RlbGV0YWJsZSA9IGF3YWl0IHNpYmxpbmdJbmZvcm1hdGlvbj8udGFyZ2V0Q29udGV4dD8ucmVxdWVzdFByb3BlcnR5KGRlbGV0YWJsZVBhdGgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpbmZvLnNpYmxpbmdEZWxldGFibGUgPSBzdGF0aWNEZWxldGFibGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGluZm87XG5cdH0pO1xuXHQvLyB3YWl0IGZvciBhbGwgc2libGluZ1Byb21pc2VzLiBJZiBubyBzaWJsaW5nIGV4aXN0cywgcHJvbWlzZSBpcyByZXNvbHZlZCB0byB1bmRlZmluZWQgKGJ1dCBpdCdzIHN0aWxsIGEgcHJvbWlzZSlcblx0YXdhaXQgUHJvbWlzZS5hbGwoY29udGV4dEluZm9zLm1hcCgoaW5mbykgPT4gaW5mby5zaWJsaW5nUHJvbWlzZSkpO1xuXG5cdGNvbnN0IGJ1Y2tldHMgPSBbXG5cdFx0e1xuXHRcdFx0a2V5OiBcImRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmVcIixcblx0XHRcdC8vIG9ubHkgZm9yIGRyYWZ0IHJvb3Q6IEluIHRoYXQgY2FzZSwgdGhlIGRlbGV0ZSByZXF1ZXN0IG5lZWRzIHRvIGJlIHNlbnQgZm9yIHRoZSBhY3RpdmUgKGkuZS4gdGhlIHNpYmxpbmcpLFxuXHRcdFx0Ly8gd2hpbGUgaW4gZHJhZnQgbm9kZSwgdGhlIGRlbGV0ZSByZXF1ZXN0IG5lZWRzIHRvIGJlIHNlbmQgZm9yIHRoZSBkcmFmdCBpdHNlbGZcblx0XHRcdHZhbHVlOiBjb250ZXh0SW5mb3MuZmlsdGVyKChpbmZvKSA9PiBpbmZvLmlzRHJhZnRSb290ICYmICFpbmZvLmlzQWN0aXZlICYmIGluZm8uaGFzQWN0aXZlICYmIGluZm8uc2libGluZ0RlbGV0YWJsZSlcblx0XHR9LFxuXHRcdHtcblx0XHRcdGtleTogXCJkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlXCIsXG5cdFx0XHR2YWx1ZTogY29udGV4dEluZm9zLmZpbHRlcigoaW5mbykgPT4gIWluZm8uaXNBY3RpdmUgJiYgaW5mby5oYXNBY3RpdmUgJiYgIWluZm8uc2libGluZ0RlbGV0YWJsZSlcblx0XHR9LFxuXHRcdHsga2V5OiBcImxvY2tlZENvbnRleHRzXCIsIHZhbHVlOiBjb250ZXh0SW5mb3MuZmlsdGVyKChpbmZvKSA9PiBpbmZvLmlzRHJhZnRSb290ICYmIGluZm8uaXNBY3RpdmUgJiYgaW5mby5oYXNEcmFmdCAmJiBpbmZvLmxvY2tlZCkgfSxcblx0XHR7XG5cdFx0XHRrZXk6IFwidW5TYXZlZENvbnRleHRzXCIsXG5cdFx0XHR2YWx1ZTogY29udGV4dEluZm9zLmZpbHRlcigoaW5mbykgPT4gaW5mby5pc0RyYWZ0Um9vdCAmJiBpbmZvLmlzQWN0aXZlICYmIGluZm8uaGFzRHJhZnQgJiYgIWluZm8ubG9ja2VkKVxuXHRcdH0sXG5cdFx0Ly8gbm9uLWRyYWZ0L3N0aWNreSBhbmQgZGVsZXRhYmxlXG5cdFx0Ly8gYWN0aXZlIGRyYWZ0IHJvb3Qgd2l0aG91dCBhbnkgZHJhZnQgYW5kIGRlbGV0YWJsZVxuXHRcdC8vIGNyZWF0ZWQgZHJhZnQgcm9vdCAocmVnYXJkbGVzcyBvZiBkZWxldGFibGUpXG5cdFx0Ly8gZHJhZnQgbm9kZSB3aXRob3V0IGFjdGl2ZSAocmVnYXJkbGVzcyB3aGV0aGVyIHJvb3QgaXMgY3JlYXRlIG9yIGVkaXQsIGFuZCByZWdhcmRsZXNzIG9mIGRlbGV0YWJsZSlcblx0XHQvLyBkcmFmdCBub2RlIHdpdGggZGVsZXRhYmxlIGFjdGl2ZVxuXHRcdHtcblx0XHRcdGtleTogXCJkZWxldGFibGVDb250ZXh0c1wiLFxuXHRcdFx0dmFsdWU6IGNvbnRleHRJbmZvcy5maWx0ZXIoXG5cdFx0XHRcdChpbmZvKSA9PlxuXHRcdFx0XHRcdCghaW5mby5pc0RyYWZ0Um9vdCAmJiAhaW5mby5pc0RyYWZ0Tm9kZSAmJiBpbmZvLmRlbGV0YWJsZSkgfHxcblx0XHRcdFx0XHQoaW5mby5pc0RyYWZ0Um9vdCAmJiBpbmZvLmlzQWN0aXZlICYmICFpbmZvLmhhc0RyYWZ0ICYmIGluZm8uZGVsZXRhYmxlKSB8fFxuXHRcdFx0XHRcdChpbmZvLmlzRHJhZnRSb290ICYmICFpbmZvLmlzQWN0aXZlICYmICFpbmZvLmhhc0FjdGl2ZSkgfHxcblx0XHRcdFx0XHQoaW5mby5pc0RyYWZ0Tm9kZSAmJiAhaW5mby5pc0FjdGl2ZSAmJiAhaW5mby5oYXNBY3RpdmUpIHx8XG5cdFx0XHRcdFx0KGluZm8uaXNEcmFmdE5vZGUgJiYgIWluZm8uaXNBY3RpdmUgJiYgaW5mby5oYXNBY3RpdmUgJiYgaW5mby5zaWJsaW5nRGVsZXRhYmxlKVxuXHRcdFx0KVxuXHRcdH1cblx0XTtcblxuXHRmb3IgKGNvbnN0IHsga2V5LCB2YWx1ZSB9IG9mIGJ1Y2tldHMpIHtcblx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcblx0XHRcdGtleSxcblx0XHRcdC8vIEN1cnJlbnRseSwgYnVja2V0IGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUgaGFzIGEgZGlmZmVyZW50IHN0cnVjdHVyZSAoY29udGFpbmluZyBhbHNvIHNpYmxpbmcgaW5mb3JtYXRpb24sIHdoaWNoIGlzIHVzZWRcblx0XHRcdC8vIGluIGNhc2Ugb2YgZGVsZXRpb24pLiBQb3NzaWJsZSBpbXByb3ZlbWVudDogUmVhZCBzaWJsaW5nIGluZm9ybWF0aW9uIG9ubHkgd2hlbiBuZWVkZWQsIGFuZCBidWlsZCBhbGwgYnVja2V0cyB3aXRoIHNhbWVcblx0XHRcdC8vIHN0cnVjdHVyZS4gSG93ZXZlciwgaW4gdGhhdCBjYXNlIHNpYmxpbmdJbmZvcm1hdGlvbiBtaWdodCBuZWVkIHRvIGJlIHJlYWQgdHdpY2UgKGlmIGFscmVhZHkgbmVlZGVkIGZvciBidXR0b24gZW5hYmxlbWVudCksXG5cdFx0XHQvLyB0aHVzIGEgYnVmZmVyIHByb2JhYmx5IHdvdWxkIG1ha2Ugc2Vuc2UuXG5cdFx0XHR2YWx1ZS5tYXAoKGluZm8pID0+XG5cdFx0XHRcdGtleSA9PT0gXCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlXCIgPyB7IGRyYWZ0OiBpbmZvLmNvbnRleHQsIHNpYmxpbmdJbmZvOiBpbmZvLnNpYmxpbmdJbmZvIH0gOiBpbmZvLmNvbnRleHRcblx0XHRcdClcblx0XHQpO1xuXHR9XG59XG5cbmNvbnN0IGRlbGV0ZUhlbHBlciA9IHtcblx0Z2V0Tm9uRGVsZXRhYmxlVGV4dCxcblx0ZGVsZXRlQ29uZmlybUhhbmRsZXIsXG5cdHVwZGF0ZU9wdGlvbnNGb3JEZWxldGFibGVUZXh0cyxcblx0dXBkYXRlQ29udGVudEZvckRlbGV0ZURpYWxvZyxcblx0dXBkYXRlRHJhZnRPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMsXG5cdGdldENvbmZpcm1lZERlbGV0YWJsZUNvbnRleHQsXG5cdGdldExvY2tlZE9iamVjdHNUZXh0LFxuXHRnZXRVbnNhdmVkQ29udGV4dHNUZXh0LFxuXHRnZXROb25EZWxldGFibGVBY3RpdmVzT2ZEcmFmdHNUZXh0LFxuXHRhZnRlckRlbGV0ZVByb2Nlc3MsXG5cblx0dXBkYXRlRGVsZXRlSW5mb0ZvclNlbGVjdGVkQ29udGV4dHNcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRlbGV0ZUhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7TUFtQllBLGlCQUFpQjtFQUFBLFdBQWpCQSxpQkFBaUI7SUFBakJBLGlCQUFpQjtJQUFqQkEsaUJBQWlCO0lBQWpCQSxpQkFBaUI7SUFBakJBLGlCQUFpQjtJQUFqQkEsaUJBQWlCO0VBQUEsR0FBakJBLGlCQUFpQixLQUFqQkEsaUJBQWlCO0VBQUE7RUFBQSxJQVFqQkMsMEJBQTBCO0VBQUEsV0FBMUJBLDBCQUEwQjtJQUExQkEsMEJBQTBCO0lBQTFCQSwwQkFBMEI7RUFBQSxHQUExQkEsMEJBQTBCLEtBQTFCQSwwQkFBMEI7RUFBQTtFQTJEdEMsU0FBU0Msb0JBQW9CLENBQzVCQyxvQkFBMEMsRUFDMUNDLElBQXVCLEVBQ3ZCQyxnQkFBNkIsRUFDN0JDLGdCQUE2QixFQUNmO0lBQ2RBLGdCQUFnQixDQUFDQyxPQUFPLENBQUVDLE9BQWtCLElBQUs7TUFDaEQsTUFBTUMsR0FBRyxHQUFHSixnQkFBZ0IsQ0FBQ0ssT0FBTyxDQUFDRixPQUFPLENBQUM7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