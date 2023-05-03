/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controls/FieldWrapper", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldAPI", "sap/fe/macros/ResourceModel", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/IconPool", "sap/ui/model/Filter", "sap/ui/unified/FileUploaderParameter", "sap/ui/util/openWindow"], function (Log, CommonUtils, CollaborationActivitySync, CollaborationCommon, draft, FieldWrapper, KeepAliveHelper, ModelHelper, CommonHelper, FieldAPI, ResourceModel, MessageBox, Core, IconPool, Filter, FileUploaderParameter, openWindow) {
  "use strict";

  var Activity = CollaborationCommon.Activity;
  /**
   * Gets the binding used for collaboration notifications.
   *
   * @param field
   * @returns The binding
   */
  function getCollaborationBinding(field) {
    let binding = field.getBindingContext().getBinding();
    if (!binding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
      const oView = CommonUtils.getTargetView(field);
      binding = oView.getBindingContext().getBinding();
    }
    return binding;
  }

  /**
   * Static class used by "sap.ui.mdc.Field" during runtime
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const FieldRuntime = {
    resetChangesHandler: undefined,
    uploadPromises: undefined,
    /**
     * Triggers an internal navigation on the link pertaining to DataFieldWithNavigationPath.
     *
     * @param oSource Source of the press event
     * @param oController Instance of the controller
     * @param sNavPath The navigation path
     */
    onDataFieldWithNavigationPath: function (oSource, oController, sNavPath) {
      if (oController._routing) {
        let oBindingContext = oSource.getBindingContext();
        const oView = CommonUtils.getTargetView(oSource),
          oMetaModel = oBindingContext.getModel().getMetaModel(),
          fnNavigate = function (oContext) {
            if (oContext) {
              oBindingContext = oContext;
            }
            oController._routing.navigateToTarget(oBindingContext, sNavPath, true);
          };
        // Show draft loss confirmation dialog in case of Object page
        if (oView.getViewData().converterType === "ObjectPage" && !ModelHelper.isStickySessionSupported(oMetaModel)) {
          draft.processDataLossOrDraftDiscardConfirmation(fnNavigate, Function.prototype, oBindingContext, oView.getController(), true, draft.NavigationType.ForwardNavigation);
        } else {
          fnNavigate();
        }
      } else {
        Log.error("FieldRuntime: No routing listener controller extension found. Internal navigation aborted.", "sap.fe.macros.field.FieldRuntime", "onDataFieldWithNavigationPath");
      }
    },
    isDraftIndicatorVisible: function (sPropertyPath, sSemanticKeyHasDraftIndicator, HasDraftEntity, IsActiveEntity, hideDraftInfo) {
      if (IsActiveEntity !== undefined && HasDraftEntity !== undefined && (!IsActiveEntity || HasDraftEntity) && !hideDraftInfo) {
        return sPropertyPath === sSemanticKeyHasDraftIndicator;
      } else {
        return false;
      }
    },
    hasTargets: function (bSemanticObjectHasTargets) {
      return bSemanticObjectHasTargets ? bSemanticObjectHasTargets : false;
    },
    getStateDependingOnSemanticObjectTargets: function (bSemanticObjectHasTargets) {
      return bSemanticObjectHasTargets ? "Information" : "None";
    },
    /**
     * Handler for the validateFieldGroup event.
     *
     * @function
     * @name onValidateFieldGroup
     * @param oController The controller of the page containing the field
     * @param oEvent The event object passed by the validateFieldGroup event
     */
    onValidateFieldGroup: function (oController, oEvent) {
      const oFEController = FieldRuntime._getExtensionController(oController);
      oFEController._sideEffects.handleFieldGroupChange(oEvent);
    },
    /**
     * Handler for the change event.
     * Store field group IDs of this field for requesting side effects when required.
     * We store them here to ensure a change in the value of the field has taken place.
     *
     * @function
     * @name handleChange
     * @param oController The controller of the page containing the field
     * @param oEvent The event object passed by the change event
     */
    handleChange: function (oController, oEvent) {
      const oSourceField = oEvent.getSource(),
        bIsTransient = oSourceField && oSourceField.getBindingContext().isTransient(),
        pValueResolved = oEvent.getParameter("promise") || Promise.resolve(),
        oSource = oEvent.getSource(),
        bValid = oEvent.getParameter("valid"),
        fieldValidity = this.getFieldStateOnChange(oEvent).state["validity"];

      // TODO: currently we have undefined and true... and our creation row implementation relies on this.
      // I would move this logic to this place as it's hard to understand for field consumer

      pValueResolved.then(function () {
        // The event is gone. For now we'll just recreate it again
        oEvent.oSource = oSource;
        oEvent.mParameters = {
          valid: bValid
        };
        FieldAPI.handleChange(oEvent, oController);
      }).catch(function /*oError: any*/
      () {
        // The event is gone. For now we'll just recreate it again
        oEvent.oSource = oSource;
        oEvent.mParameters = {
          valid: false
        };

        // as the UI might need to react on. We could provide a parameter to inform if validation
        // was successful?
        FieldAPI.handleChange(oEvent, oController);
      });

      // Use the FE Controller instead of the extensionAPI to access internal FE controllers
      const oFEController = FieldRuntime._getExtensionController(oController);
      oFEController._editFlow.syncTask(pValueResolved);

      // if the context is transient, it means the request would fail anyway as the record does not exist in reality
      // TODO: should the request be made in future if the context is transient?
      if (bIsTransient) {
        return;
      }

      // SIDE EFFECTS
      oFEController._sideEffects.handleFieldChange(oEvent, fieldValidity, pValueResolved);

      // Collaboration Draft Activity Sync
      const oField = oEvent.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled && fieldValidity) {
        var _ref, _oField$getBindingInf;
        /* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
        		unit or currency only the amount is considered) */
        const binding = getCollaborationBinding(oField);
        const data = [...((_ref = oField.getBindingInfo("value") || oField.getBindingInfo("selected")) === null || _ref === void 0 ? void 0 : _ref.parts), ...(((_oField$getBindingInf = oField.getBindingInfo("additionalValue")) === null || _oField$getBindingInf === void 0 ? void 0 : _oField$getBindingInf.parts) || [])].map(function (part) {
          if (part) {
            var _oField$getBindingCon;
            return `${(_oField$getBindingCon = oField.getBindingContext()) === null || _oField$getBindingCon === void 0 ? void 0 : _oField$getBindingCon.getPath()}/${part.path}`;
          }
        });
        if (binding.hasPendingChanges()) {
          // The value has been changed by the user --> wait until it's sent to the server before sending a notification to other users
          binding.attachEventOnce("patchCompleted", function () {
            CollaborationActivitySync.send(oField, Activity.Change, data);
          });
        } else {
          // No changes --> send a Undo notification
          CollaborationActivitySync.send(oField, Activity.Undo, data);
        }
      }
    },
    handleLiveChange: function (event) {
      // Collaboration Draft Activity Sync
      const field = event.getSource();
      if (CollaborationActivitySync.isConnected(field)) {
        /* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
        		unit or currency only the amount is considered) */
        const bindingPath = field.getBindingInfo("value").parts[0].path;
        const fullPath = `${field.getBindingContext().getPath()}/${bindingPath}`;
        CollaborationActivitySync.send(field, Activity.LiveChange, fullPath);

        // If the user reverted the change no change event is sent therefore we have to handle it here
        if (!this.resetChangesHandler) {
          this.resetChangesHandler = () => {
            // We need to wait a little bit for the focus to be updated
            setTimeout(() => {
              if (field.isA("sap.ui.mdc.Field")) {
                const focusedControl = Core.byId(Core.getCurrentFocusedControlId());
                if ((focusedControl === null || focusedControl === void 0 ? void 0 : focusedControl.getParent()) === field) {
                  // We're still un the same MDC Field --> do nothing
                  return;
                }
              }
              field.detachBrowserEvent("focusout", this.resetChangesHandler);
              delete this.resetChangesHandler;
              CollaborationActivitySync.send(field, Activity.Undo, fullPath);
            }, 100);
          };
          field.attachBrowserEvent("focusout", this.resetChangesHandler);
        }
      }
    },
    handleOpenPicker: function (oEvent) {
      // Collaboration Draft Activity Sync
      const oField = oEvent.getSource();
      const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        const sBindingPath = oField.getBindingInfo("value").parts[0].path;
        const sFullPath = `${oField.getBindingContext().getPath()}/${sBindingPath}`;
        CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);
      }
    },
    handleClosePicker: function (oEvent) {
      // Collaboration Draft Activity Sync
      const oField = oEvent.getSource();
      const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        const binding = getCollaborationBinding(oField);
        if (!binding.hasPendingChanges()) {
          // If there are no pending changes, the picker was closed without changing the value --> send a UNDO notification
          // In case there were changes, notifications are managed in handleChange
          const sBindingPath = oField.getBindingInfo("value").parts[0].path;
          const sFullPath = `${oField.getBindingContext().getPath()}/${sBindingPath}`;
          CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
        }
      }
    },
    _sendCollaborationMessageForFileUploader(fileUploader, activity) {
      const isCollaborationEnabled = CollaborationActivitySync.isConnected(fileUploader);
      if (isCollaborationEnabled) {
        var _fileUploader$getPare, _fileUploader$getBind;
        const bindingPath = (_fileUploader$getPare = fileUploader.getParent()) === null || _fileUploader$getPare === void 0 ? void 0 : _fileUploader$getPare.getProperty("propertyPath");
        const fullPath = `${(_fileUploader$getBind = fileUploader.getBindingContext()) === null || _fileUploader$getBind === void 0 ? void 0 : _fileUploader$getBind.getPath()}/${bindingPath}`;
        CollaborationActivitySync.send(fileUploader, activity, fullPath);
      }
    },
    handleOpenUploader: function (event) {
      // Collaboration Draft Activity Sync
      const fileUploader = event.getSource();
      FieldRuntime._sendCollaborationMessageForFileUploader(fileUploader, Activity.LiveChange);
    },
    handleCloseUploader: function (event) {
      // Collaboration Draft Activity Sync
      const fileUploader = event.getSource();
      FieldRuntime._sendCollaborationMessageForFileUploader(fileUploader, Activity.Undo);
    },
    /**
     * Gets the field value and validity on a change event.
     *
     * @function
     * @name fieldValidityOnChange
     * @param oEvent The event object passed by the change event
     * @returns Field value and validity
     */
    getFieldStateOnChange: function (oEvent) {
      let oSourceField = oEvent.getSource(),
        mFieldState = {};
      const _isBindingStateMessages = function (oBinding) {
        return oBinding && oBinding.getDataState() ? oBinding.getDataState().getInvalidValue() === undefined : true;
      };
      if (oSourceField.isA("sap.fe.macros.field.FieldAPI")) {
        oSourceField = oSourceField.getContent();
      }
      if (oSourceField.isA(FieldWrapper.getMetadata().getName()) && oSourceField.getEditMode() === "Editable") {
        oSourceField = oSourceField.getContentEdit()[0];
      }
      if (oSourceField.isA("sap.ui.mdc.Field")) {
        let bIsValid = oEvent.getParameter("valid") || oEvent.getParameter("isValid");
        if (bIsValid === undefined) {
          if (oSourceField.getMaxConditions() === 1) {
            const oValueBindingInfo = oSourceField.getBindingInfo("value");
            bIsValid = _isBindingStateMessages(oValueBindingInfo && oValueBindingInfo.binding);
          }
          if (oSourceField.getValue() === "" && !oSourceField.getProperty("required")) {
            bIsValid = true;
          }
        }
        mFieldState = {
          fieldValue: oSourceField.getValue(),
          validity: !!bIsValid
        };
      } else {
        // oSourceField extends from a FileUploader || Input || is a CheckBox
        const oBinding = oSourceField.getBinding("uploadUrl") || oSourceField.getBinding("value") || oSourceField.getBinding("selected");
        mFieldState = {
          fieldValue: oBinding && oBinding.getValue(),
          validity: _isBindingStateMessages(oBinding)
        };
      }
      return {
        field: oSourceField,
        state: mFieldState
      };
    },
    _fnFixHashQueryString: function (sCurrentHash) {
      if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
        // sCurrentHash can contain query string, cut it off!
        sCurrentHash = sCurrentHash.split("?")[0];
      }
      return sCurrentHash;
    },
    _fnGetLinkInformation: function (_oSource, _oLink, _sPropertyPath, _sValue, fnSetActive) {
      const oModel = _oLink && _oLink.getModel();
      const oMetaModel = oModel && oModel.getMetaModel();
      const sSemanticObjectName = _sValue || _oSource && _oSource.getValue();
      const oView = _oLink && CommonUtils.getTargetView(_oLink);
      const oInternalModelContext = oView && oView.getBindingContext("internal");
      const oAppComponent = oView && CommonUtils.getAppComponent(oView);
      const oShellServiceHelper = oAppComponent && oAppComponent.getShellServices();
      const pGetLinksPromise = oShellServiceHelper && oShellServiceHelper.getLinksWithCache([[{
        semanticObject: sSemanticObjectName
      }]]);
      const aSemanticObjectUnavailableActions = oMetaModel && oMetaModel.getObject(`${_sPropertyPath}@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions`);
      return {
        SemanticObjectName: sSemanticObjectName,
        SemanticObjectFullPath: _sPropertyPath,
        //sSemanticObjectFullPath,
        MetaModel: oMetaModel,
        InternalModelContext: oInternalModelContext,
        ShellServiceHelper: oShellServiceHelper,
        GetLinksPromise: pGetLinksPromise,
        SemanticObjectUnavailableActions: aSemanticObjectUnavailableActions,
        fnSetActive: fnSetActive
      };
    },
    _fnQuickViewHasNewCondition: function (oSemanticObjectPayload, _oLinkInfo) {
      if (oSemanticObjectPayload && oSemanticObjectPayload.path && oSemanticObjectPayload.path === _oLinkInfo.SemanticObjectFullPath) {
        // Got the resolved Semantic Object!
        const bResultingNewConditionForConditionalWrapper = oSemanticObjectPayload[!_oLinkInfo.SemanticObjectUnavailableActions ? "HasTargetsNotFiltered" : "HasTargets"];
        _oLinkInfo.fnSetActive(!!bResultingNewConditionForConditionalWrapper);
        return true;
      } else {
        return false;
      }
    },
    _fnQuickViewSetNewConditionForConditionalWrapper: function (_oLinkInfo, _oFinalSemanticObjects) {
      if (_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]) {
        let sTmpPath, oSemanticObjectPayload;
        const aSemanticObjectPaths = Object.keys(_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]);
        for (const iPathsCount in aSemanticObjectPaths) {
          sTmpPath = aSemanticObjectPaths[iPathsCount];
          oSemanticObjectPayload = _oFinalSemanticObjects[_oLinkInfo.SemanticObjectName] && _oFinalSemanticObjects[_oLinkInfo.SemanticObjectName][sTmpPath];
          if (FieldRuntime._fnQuickViewHasNewCondition(oSemanticObjectPayload, _oLinkInfo)) {
            break;
          }
        }
      }
    },
    _fnUpdateSemanticObjectsTargetModel: function (oEvent, sValue, oControl, _sPropertyPath) {
      const oSource = oEvent && oEvent.getSource();
      let fnSetActive;
      if (oControl.isA("sap.m.ObjectStatus")) {
        fnSetActive = bActive => oControl.setActive(bActive);
      }
      if (oControl.isA("sap.m.ObjectIdentifier")) {
        fnSetActive = bActive => oControl.setTitleActive(bActive);
      }
      const oConditionalWrapper = oControl && oControl.getParent();
      if (oConditionalWrapper && oConditionalWrapper.isA("sap.fe.core.controls.ConditionalWrapper")) {
        fnSetActive = bActive => oConditionalWrapper.setCondition(bActive);
      }
      if (fnSetActive !== undefined) {
        const oLinkInfo = FieldRuntime._fnGetLinkInformation(oSource, oControl, _sPropertyPath, sValue, fnSetActive);
        oLinkInfo.fnSetActive = fnSetActive;
        const sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getHash());
        CommonUtils.updateSemanticTargets([oLinkInfo.GetLinksPromise], [{
          semanticObject: oLinkInfo.SemanticObjectName,
          path: oLinkInfo.SemanticObjectFullPath
        }], oLinkInfo.InternalModelContext, sCurrentHash).then(function (oFinalSemanticObjects) {
          if (oFinalSemanticObjects) {
            FieldRuntime._fnQuickViewSetNewConditionForConditionalWrapper(oLinkInfo, oFinalSemanticObjects);
          }
        }).catch(function (oError) {
          Log.error("Cannot update Semantic Targets model", oError);
        });
      }
    },
    _checkControlHasModelAndBindingContext(_control) {
      if (!_control.getModel() || !_control.getBindingContext()) {
        return false;
      } else {
        return true;
      }
    },
    _checkCustomDataValueBeforeUpdatingSemanticObjectModel(_control, propertyPath, aCustomData) {
      let sSemanticObjectPathValue;
      let oValueBinding;
      const _fnCustomDataValueIsString = function (semanticObjectPathValue) {
        return !(semanticObjectPathValue !== null && typeof semanticObjectPathValue === "object");
      };
      // remove technical custom datas set by UI5
      aCustomData = aCustomData.filter(customData => customData.getKey() !== "sap-ui-custom-settings");
      for (const index in aCustomData) {
        sSemanticObjectPathValue = aCustomData[index].getValue();
        if (!sSemanticObjectPathValue && _fnCustomDataValueIsString(sSemanticObjectPathValue)) {
          oValueBinding = aCustomData[index].getBinding("value");
          if (oValueBinding) {
            oValueBinding.attachEventOnce("change", function (_oChangeEvent) {
              FieldRuntime._fnUpdateSemanticObjectsTargetModel(_oChangeEvent, null, _control, propertyPath);
            });
          }
        } else if (_fnCustomDataValueIsString(sSemanticObjectPathValue)) {
          FieldRuntime._fnUpdateSemanticObjectsTargetModel(null, sSemanticObjectPathValue, _control, propertyPath);
        }
      }
    },
    LinkModelContextChange: function (oEvent, sProperty, sPathToProperty) {
      const control = oEvent.getSource();
      if (FieldRuntime._checkControlHasModelAndBindingContext(control)) {
        const sPropertyPath = `${sPathToProperty}/${sProperty}`;
        const mdcLink = control.getDependents().length ? control.getDependents()[0] : undefined;
        const aCustomData = mdcLink === null || mdcLink === void 0 ? void 0 : mdcLink.getCustomData();
        if (aCustomData && aCustomData.length > 0) {
          FieldRuntime._checkCustomDataValueBeforeUpdatingSemanticObjectModel(control, sPropertyPath, aCustomData);
        }
      }
    },
    openExternalLink: function (event) {
      const source = event.getSource();
      if (source.data("url") && source.getProperty("text") !== "") {
        openWindow(source.data("url"));
      }
    },
    pressLink: async function (oEvent) {
      const oSource = oEvent.getSource();
      const oLink = oSource.isA("sap.m.ObjectIdentifier") ? oSource.findElements(false, elem => {
        return elem.isA("sap.m.Link");
      })[0] : oSource;
      async function openLink(mdcLink) {
        try {
          const sHref = await mdcLink.getTriggerHref();
          if (!sHref) {
            try {
              await mdcLink.open(oLink);
            } catch (oError) {
              Log.error("Cannot retrieve the QuickView Popover dialog", oError);
            }
          } else {
            const oView = CommonUtils.getTargetView(oLink);
            const oAppComponent = CommonUtils.getAppComponent(oView);
            const oShellServiceHelper = oAppComponent.getShellServices();
            const oShellHash = oShellServiceHelper.parseShellHash(sHref);
            const oNavArgs = {
              target: {
                semanticObject: oShellHash.semanticObject,
                action: oShellHash.action
              },
              params: oShellHash.params
            };
            KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oShellHash);
            if (CommonUtils.isStickyEditMode(oLink) !== true) {
              //URL params and xappState has been generated earlier hence using toExternal
              oShellServiceHelper.toExternal(oNavArgs, oAppComponent);
            } else {
              try {
                const sNewHref = await oShellServiceHelper.hrefForExternalAsync(oNavArgs, oAppComponent);
                openWindow(sNewHref);
              } catch (oError) {
                Log.error(`Error while retireving hrefForExternal : ${oError}`);
              }
            }
          }
        } catch (oError) {
          Log.error("Error triggering link Href", oError);
        }
      }
      if (oSource.getDependents() && oSource.getDependents().length > 0 && oLink.getProperty("text") !== "") {
        const oFieldInfo = oSource.getDependents()[0];
        if (oFieldInfo && oFieldInfo.isA("sap.ui.mdc.Link")) {
          await openLink(oFieldInfo);
        }
      }
      return oLink;
    },
    uploadStream: function (controller, event) {
      const fileUploader = event.getSource(),
        FEController = FieldRuntime._getExtensionController(controller),
        fileWrapper = fileUploader.getParent(),
        uploadUrl = fileWrapper.getUploadUrl();
      if (uploadUrl !== "") {
        var _fileUploader$getMode, _fileUploader$getBind2;
        fileWrapper.setUIBusy(true);

        // use uploadUrl from FileWrapper which returns a canonical URL
        fileUploader.setUploadUrl(uploadUrl);
        fileUploader.removeAllHeaderParameters();
        const token = (_fileUploader$getMode = fileUploader.getModel()) === null || _fileUploader$getMode === void 0 ? void 0 : _fileUploader$getMode.getHttpHeaders()["X-CSRF-Token"];
        if (token) {
          const headerParameterCSRFToken = new FileUploaderParameter();
          headerParameterCSRFToken.setName("x-csrf-token");
          headerParameterCSRFToken.setValue(token);
          fileUploader.addHeaderParameter(headerParameterCSRFToken);
        }
        const eTag = (_fileUploader$getBind2 = fileUploader.getBindingContext()) === null || _fileUploader$getBind2 === void 0 ? void 0 : _fileUploader$getBind2.getProperty("@odata.etag");
        if (eTag) {
          const headerParameterETag = new FileUploaderParameter();
          headerParameterETag.setName("If-Match");
          // Ignore ETag in collaboration draft
          headerParameterETag.setValue(CollaborationActivitySync.isConnected(fileUploader) ? "*" : eTag);
          fileUploader.addHeaderParameter(headerParameterETag);
        }
        const headerParameterAccept = new FileUploaderParameter();
        headerParameterAccept.setName("Accept");
        headerParameterAccept.setValue("application/json");
        fileUploader.addHeaderParameter(headerParameterAccept);

        // synchronize upload with other requests
        const uploadPromise = new Promise((resolve, reject) => {
          this.uploadPromises = this.uploadPromises || {};
          this.uploadPromises[fileUploader.getId()] = {
            resolve: resolve,
            reject: reject
          };
          fileUploader.upload();
        });
        FEController._editFlow.syncTask(uploadPromise);
      } else {
        MessageBox.error(ResourceModel.getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT"));
      }
    },
    handleUploadComplete: function (event, propertyFileName, propertyPath, controller) {
      const status = event.getParameter("status"),
        fileUploader = event.getSource(),
        fileWrapper = fileUploader.getParent();
      fileWrapper.setUIBusy(false);
      const context = fileUploader.getBindingContext();
      if (status === 0 || status >= 400) {
        this._displayMessageForFailedUpload(event);
        this.uploadPromises[fileUploader.getId()].reject();
      } else {
        const newETag = event.getParameter("headers").etag;
        if (newETag) {
          // set new etag for filename update, but without sending patch request
          context === null || context === void 0 ? void 0 : context.setProperty("@odata.etag", newETag, null);
        }

        // set filename for link text
        if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
          context === null || context === void 0 ? void 0 : context.setProperty(propertyFileName.path, fileUploader.getValue());
        }

        // invalidate the property that not gets updated otherwise
        context === null || context === void 0 ? void 0 : context.setProperty(propertyPath, null, null);
        context === null || context === void 0 ? void 0 : context.setProperty(propertyPath, undefined, null);
        this._callSideEffectsForStream(event, fileWrapper, controller);
        this.uploadPromises[fileUploader.getId()].resolve();
      }
      delete this.uploadPromises[fileUploader.getId()];

      // Collaboration Draft Activity Sync
      const isCollaborationEnabled = CollaborationActivitySync.isConnected(fileUploader);
      if (!isCollaborationEnabled || !context) {
        return;
      }
      const notificationData = [`${context.getPath()}/${propertyPath}`];
      if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
        notificationData.push(`${context.getPath()}/${propertyFileName.path}`);
      }
      let binding = context.getBinding();
      if (!binding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        const oView = CommonUtils.getTargetView(fileUploader);
        binding = oView.getBindingContext().getBinding();
      }
      if (binding.hasPendingChanges()) {
        binding.attachEventOnce("patchCompleted", () => {
          CollaborationActivitySync.send(fileWrapper, Activity.Change, notificationData);
        });
      } else {
        CollaborationActivitySync.send(fileWrapper, Activity.Change, notificationData);
      }
    },
    _displayMessageForFailedUpload: function (oEvent) {
      // handling of backend errors
      const sError = oEvent.getParameter("responseRaw") || oEvent.getParameter("response");
      let sMessageText, oError;
      try {
        oError = sError && JSON.parse(sError);
        sMessageText = oError.error && oError.error.message;
      } catch (e) {
        sMessageText = sError || ResourceModel.getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT");
      }
      MessageBox.error(sMessageText);
    },
    removeStream: function (event, propertyFileName, propertyPath, controller) {
      const deleteButton = event.getSource();
      const fileWrapper = deleteButton.getParent();
      const context = fileWrapper.getBindingContext();

      // streams are removed by assigning the null value
      context.setProperty(propertyPath, null);
      // When setting the property to null, the uploadUrl (@@MODEL.format) is set to "" by the model
      //	with that another upload is not possible before refreshing the page
      // (refreshing the page would recreate the URL)
      //	This is the workaround:
      //	We set the property to undefined only on the frontend which will recreate the uploadUrl
      context.setProperty(propertyPath, undefined, null);
      this._callSideEffectsForStream(event, fileWrapper, controller);

      // Collaboration Draft Activity Sync
      const bCollaborationEnabled = CollaborationActivitySync.isConnected(deleteButton);
      if (bCollaborationEnabled) {
        let binding = context.getBinding();
        if (!binding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          const oView = CommonUtils.getTargetView(deleteButton);
          binding = oView.getBindingContext().getBinding();
        }
        const data = [`${context.getPath()}/${propertyPath}`];
        if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
          data.push(`${context.getPath()}/${propertyFileName.path}`);
        }
        CollaborationActivitySync.send(deleteButton, Activity.LiveChange, data);
        binding.attachEventOnce("patchCompleted", function () {
          CollaborationActivitySync.send(deleteButton, Activity.Change, data);
        });
      }
    },
    _callSideEffectsForStream: function (oEvent, oControl, oController) {
      const oFEController = FieldRuntime._getExtensionController(oController);
      if (oControl && oControl.getBindingContext().isTransient()) {
        return;
      }
      if (oControl) {
        oEvent.oSource = oControl;
      }
      oFEController._sideEffects.handleFieldChange(oEvent, this.getFieldStateOnChange(oEvent).state["validity"]);
    },
    getIconForMimeType: function (sMimeType) {
      return IconPool.getIconForMimeType(sMimeType);
    },
    /**
     * Method to retrieve text from value list for DataField.
     *
     * @function
     * @name retrieveTextFromValueList
     * @param sPropertyValue The property value of the datafield
     * @param sPropertyFullPath The property full path's
     * @param sDisplayFormat The display format for the datafield
     * @returns The formatted value in corresponding display format.
     */
    retrieveTextFromValueList: function (sPropertyValue, sPropertyFullPath, sDisplayFormat) {
      let sTextProperty;
      let oMetaModel;
      let sPropertyName;
      if (sPropertyValue) {
        oMetaModel = CommonHelper.getMetaModel();
        sPropertyName = oMetaModel.getObject(`${sPropertyFullPath}@sapui.name`);
        return oMetaModel.requestValueListInfo(sPropertyFullPath, true).then(function (mValueListInfo) {
          // take the "" one if exists, otherwise take the first one in the object TODO: to be discussed
          const oValueListInfo = mValueListInfo[mValueListInfo[""] ? "" : Object.keys(mValueListInfo)[0]];
          const oValueListModel = oValueListInfo.$model;
          const oMetaModelValueList = oValueListModel.getMetaModel();
          const oParamWithKey = oValueListInfo.Parameters.find(function (oParameter) {
            return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
          });
          if (oParamWithKey && !oParamWithKey.ValueListProperty) {
            return Promise.reject(`Inconsistent value help annotation for ${sPropertyName}`);
          }
          const oTextAnnotation = oMetaModelValueList.getObject(`/${oValueListInfo.CollectionPath}/${oParamWithKey.ValueListProperty}@com.sap.vocabularies.Common.v1.Text`);
          if (oTextAnnotation && oTextAnnotation.$Path) {
            sTextProperty = oTextAnnotation.$Path;
            const oFilter = new Filter({
              path: oParamWithKey.ValueListProperty,
              operator: "EQ",
              value1: sPropertyValue
            });
            const oListBinding = oValueListModel.bindList(`/${oValueListInfo.CollectionPath}`, undefined, undefined, oFilter, {
              $select: sTextProperty
            });
            return oListBinding.requestContexts(0, 2);
          } else {
            sDisplayFormat = "Value";
            return sPropertyValue;
          }
        }).then(function (aContexts) {
          var _aContexts$;
          const sDescription = sTextProperty ? (_aContexts$ = aContexts[0]) === null || _aContexts$ === void 0 ? void 0 : _aContexts$.getObject()[sTextProperty] : "";
          switch (sDisplayFormat) {
            case "Description":
              return sDescription;
            case "DescriptionValue":
              return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [sDescription, sPropertyValue]);
            case "ValueDescription":
              return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [sPropertyValue, sDescription]);
            default:
              return sPropertyValue;
          }
        }).catch(function (oError) {
          const sMsg = oError.status && oError.status === 404 ? `Metadata not found (${oError.status}) for value help of property ${sPropertyFullPath}` : oError.message;
          Log.error(sMsg);
        });
      }
      return sPropertyValue;
    },
    handleTypeMissmatch: function (oEvent) {
      MessageBox.error(ResourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE"), {
        details: `<p><strong>${ResourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_SELECTED")}</strong></p>${oEvent.getParameters().mimeType}<br><br>` + `<p><strong>${ResourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_ALLOWED")}</strong></p>${oEvent.getSource().getMimeType().toString().replaceAll(",", ", ")}`,
        contentWidth: "150px"
      });
    },
    handleFileSizeExceed: function (oEvent) {
      MessageBox.error(ResourceModel.getText("M_FIELD_FILEUPLOADER_FILE_TOO_BIG", oEvent.getSource().getMaximumFileSize().toFixed(3)), {
        contentWidth: "150px"
      });
    },
    _getExtensionController: function (oController) {
      return oController.isA("sap.fe.core.ExtensionAPI") ? oController._controller : oController;
    }
  };

  /**
   * @global
   */
  return FieldRuntime;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDb2xsYWJvcmF0aW9uQmluZGluZyIsImZpZWxkIiwiYmluZGluZyIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZyIsImlzQSIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiRmllbGRSdW50aW1lIiwicmVzZXRDaGFuZ2VzSGFuZGxlciIsInVuZGVmaW5lZCIsInVwbG9hZFByb21pc2VzIiwib25EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGgiLCJvU291cmNlIiwib0NvbnRyb2xsZXIiLCJzTmF2UGF0aCIsIl9yb3V0aW5nIiwib0JpbmRpbmdDb250ZXh0Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiZm5OYXZpZ2F0ZSIsIm9Db250ZXh0IiwibmF2aWdhdGVUb1RhcmdldCIsImdldFZpZXdEYXRhIiwiY29udmVydGVyVHlwZSIsIk1vZGVsSGVscGVyIiwiaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiZHJhZnQiLCJwcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbiIsIkZ1bmN0aW9uIiwicHJvdG90eXBlIiwiZ2V0Q29udHJvbGxlciIsIk5hdmlnYXRpb25UeXBlIiwiRm9yd2FyZE5hdmlnYXRpb24iLCJMb2ciLCJlcnJvciIsImlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlIiwic1Byb3BlcnR5UGF0aCIsInNTZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yIiwiSGFzRHJhZnRFbnRpdHkiLCJJc0FjdGl2ZUVudGl0eSIsImhpZGVEcmFmdEluZm8iLCJoYXNUYXJnZXRzIiwiYlNlbWFudGljT2JqZWN0SGFzVGFyZ2V0cyIsImdldFN0YXRlRGVwZW5kaW5nT25TZW1hbnRpY09iamVjdFRhcmdldHMiLCJvblZhbGlkYXRlRmllbGRHcm91cCIsIm9FdmVudCIsIm9GRUNvbnRyb2xsZXIiLCJfZ2V0RXh0ZW5zaW9uQ29udHJvbGxlciIsIl9zaWRlRWZmZWN0cyIsImhhbmRsZUZpZWxkR3JvdXBDaGFuZ2UiLCJoYW5kbGVDaGFuZ2UiLCJvU291cmNlRmllbGQiLCJnZXRTb3VyY2UiLCJiSXNUcmFuc2llbnQiLCJpc1RyYW5zaWVudCIsInBWYWx1ZVJlc29sdmVkIiwiZ2V0UGFyYW1ldGVyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJiVmFsaWQiLCJmaWVsZFZhbGlkaXR5IiwiZ2V0RmllbGRTdGF0ZU9uQ2hhbmdlIiwic3RhdGUiLCJ0aGVuIiwibVBhcmFtZXRlcnMiLCJ2YWxpZCIsIkZpZWxkQVBJIiwiY2F0Y2giLCJfZWRpdEZsb3ciLCJzeW5jVGFzayIsImhhbmRsZUZpZWxkQ2hhbmdlIiwib0ZpZWxkIiwiYkNvbGxhYm9yYXRpb25FbmFibGVkIiwiQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYyIsImlzQ29ubmVjdGVkIiwiZGF0YSIsImdldEJpbmRpbmdJbmZvIiwicGFydHMiLCJtYXAiLCJwYXJ0IiwiZ2V0UGF0aCIsInBhdGgiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImF0dGFjaEV2ZW50T25jZSIsInNlbmQiLCJBY3Rpdml0eSIsIkNoYW5nZSIsIlVuZG8iLCJoYW5kbGVMaXZlQ2hhbmdlIiwiZXZlbnQiLCJiaW5kaW5nUGF0aCIsImZ1bGxQYXRoIiwiTGl2ZUNoYW5nZSIsInNldFRpbWVvdXQiLCJmb2N1c2VkQ29udHJvbCIsIkNvcmUiLCJieUlkIiwiZ2V0Q3VycmVudEZvY3VzZWRDb250cm9sSWQiLCJnZXRQYXJlbnQiLCJkZXRhY2hCcm93c2VyRXZlbnQiLCJhdHRhY2hCcm93c2VyRXZlbnQiLCJoYW5kbGVPcGVuUGlja2VyIiwic0JpbmRpbmdQYXRoIiwic0Z1bGxQYXRoIiwiaGFuZGxlQ2xvc2VQaWNrZXIiLCJfc2VuZENvbGxhYm9yYXRpb25NZXNzYWdlRm9yRmlsZVVwbG9hZGVyIiwiZmlsZVVwbG9hZGVyIiwiYWN0aXZpdHkiLCJpc0NvbGxhYm9yYXRpb25FbmFibGVkIiwiZ2V0UHJvcGVydHkiLCJoYW5kbGVPcGVuVXBsb2FkZXIiLCJoYW5kbGVDbG9zZVVwbG9hZGVyIiwibUZpZWxkU3RhdGUiLCJfaXNCaW5kaW5nU3RhdGVNZXNzYWdlcyIsIm9CaW5kaW5nIiwiZ2V0RGF0YVN0YXRlIiwiZ2V0SW52YWxpZFZhbHVlIiwiZ2V0Q29udGVudCIsIkZpZWxkV3JhcHBlciIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsImdldEVkaXRNb2RlIiwiZ2V0Q29udGVudEVkaXQiLCJiSXNWYWxpZCIsImdldE1heENvbmRpdGlvbnMiLCJvVmFsdWVCaW5kaW5nSW5mbyIsImdldFZhbHVlIiwiZmllbGRWYWx1ZSIsInZhbGlkaXR5IiwiX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nIiwic0N1cnJlbnRIYXNoIiwiaW5kZXhPZiIsInNwbGl0IiwiX2ZuR2V0TGlua0luZm9ybWF0aW9uIiwiX29Tb3VyY2UiLCJfb0xpbmsiLCJfc1Byb3BlcnR5UGF0aCIsIl9zVmFsdWUiLCJmblNldEFjdGl2ZSIsIm9Nb2RlbCIsInNTZW1hbnRpY09iamVjdE5hbWUiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50Iiwib1NoZWxsU2VydmljZUhlbHBlciIsImdldFNoZWxsU2VydmljZXMiLCJwR2V0TGlua3NQcm9taXNlIiwiZ2V0TGlua3NXaXRoQ2FjaGUiLCJzZW1hbnRpY09iamVjdCIsImFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsImdldE9iamVjdCIsIlNlbWFudGljT2JqZWN0TmFtZSIsIlNlbWFudGljT2JqZWN0RnVsbFBhdGgiLCJNZXRhTW9kZWwiLCJJbnRlcm5hbE1vZGVsQ29udGV4dCIsIlNoZWxsU2VydmljZUhlbHBlciIsIkdldExpbmtzUHJvbWlzZSIsIlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiX2ZuUXVpY2tWaWV3SGFzTmV3Q29uZGl0aW9uIiwib1NlbWFudGljT2JqZWN0UGF5bG9hZCIsIl9vTGlua0luZm8iLCJiUmVzdWx0aW5nTmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyIiwiX2ZuUXVpY2tWaWV3U2V0TmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyIiwiX29GaW5hbFNlbWFudGljT2JqZWN0cyIsInNUbXBQYXRoIiwiYVNlbWFudGljT2JqZWN0UGF0aHMiLCJPYmplY3QiLCJrZXlzIiwiaVBhdGhzQ291bnQiLCJfZm5VcGRhdGVTZW1hbnRpY09iamVjdHNUYXJnZXRNb2RlbCIsInNWYWx1ZSIsIm9Db250cm9sIiwiYkFjdGl2ZSIsInNldEFjdGl2ZSIsInNldFRpdGxlQWN0aXZlIiwib0NvbmRpdGlvbmFsV3JhcHBlciIsInNldENvbmRpdGlvbiIsIm9MaW5rSW5mbyIsImdldEhhc2giLCJ1cGRhdGVTZW1hbnRpY1RhcmdldHMiLCJvRmluYWxTZW1hbnRpY09iamVjdHMiLCJvRXJyb3IiLCJfY2hlY2tDb250cm9sSGFzTW9kZWxBbmRCaW5kaW5nQ29udGV4dCIsIl9jb250cm9sIiwiX2NoZWNrQ3VzdG9tRGF0YVZhbHVlQmVmb3JlVXBkYXRpbmdTZW1hbnRpY09iamVjdE1vZGVsIiwicHJvcGVydHlQYXRoIiwiYUN1c3RvbURhdGEiLCJzU2VtYW50aWNPYmplY3RQYXRoVmFsdWUiLCJvVmFsdWVCaW5kaW5nIiwiX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmciLCJzZW1hbnRpY09iamVjdFBhdGhWYWx1ZSIsImZpbHRlciIsImN1c3RvbURhdGEiLCJnZXRLZXkiLCJpbmRleCIsIl9vQ2hhbmdlRXZlbnQiLCJMaW5rTW9kZWxDb250ZXh0Q2hhbmdlIiwic1Byb3BlcnR5Iiwic1BhdGhUb1Byb3BlcnR5IiwiY29udHJvbCIsIm1kY0xpbmsiLCJnZXREZXBlbmRlbnRzIiwibGVuZ3RoIiwiZ2V0Q3VzdG9tRGF0YSIsIm9wZW5FeHRlcm5hbExpbmsiLCJzb3VyY2UiLCJvcGVuV2luZG93IiwicHJlc3NMaW5rIiwib0xpbmsiLCJmaW5kRWxlbWVudHMiLCJlbGVtIiwib3BlbkxpbmsiLCJzSHJlZiIsImdldFRyaWdnZXJIcmVmIiwib3BlbiIsIm9TaGVsbEhhc2giLCJwYXJzZVNoZWxsSGFzaCIsIm9OYXZBcmdzIiwidGFyZ2V0IiwiYWN0aW9uIiwicGFyYW1zIiwiS2VlcEFsaXZlSGVscGVyIiwic3RvcmVDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9ySGFzaCIsImlzU3RpY2t5RWRpdE1vZGUiLCJ0b0V4dGVybmFsIiwic05ld0hyZWYiLCJocmVmRm9yRXh0ZXJuYWxBc3luYyIsIm9GaWVsZEluZm8iLCJ1cGxvYWRTdHJlYW0iLCJjb250cm9sbGVyIiwiRkVDb250cm9sbGVyIiwiZmlsZVdyYXBwZXIiLCJ1cGxvYWRVcmwiLCJnZXRVcGxvYWRVcmwiLCJzZXRVSUJ1c3kiLCJzZXRVcGxvYWRVcmwiLCJyZW1vdmVBbGxIZWFkZXJQYXJhbWV0ZXJzIiwidG9rZW4iLCJnZXRIdHRwSGVhZGVycyIsImhlYWRlclBhcmFtZXRlckNTUkZUb2tlbiIsIkZpbGVVcGxvYWRlclBhcmFtZXRlciIsInNldE5hbWUiLCJzZXRWYWx1ZSIsImFkZEhlYWRlclBhcmFtZXRlciIsImVUYWciLCJoZWFkZXJQYXJhbWV0ZXJFVGFnIiwiaGVhZGVyUGFyYW1ldGVyQWNjZXB0IiwidXBsb2FkUHJvbWlzZSIsInJlamVjdCIsImdldElkIiwidXBsb2FkIiwiTWVzc2FnZUJveCIsIlJlc291cmNlTW9kZWwiLCJnZXRUZXh0IiwiaGFuZGxlVXBsb2FkQ29tcGxldGUiLCJwcm9wZXJ0eUZpbGVOYW1lIiwic3RhdHVzIiwiY29udGV4dCIsIl9kaXNwbGF5TWVzc2FnZUZvckZhaWxlZFVwbG9hZCIsIm5ld0VUYWciLCJldGFnIiwic2V0UHJvcGVydHkiLCJfY2FsbFNpZGVFZmZlY3RzRm9yU3RyZWFtIiwibm90aWZpY2F0aW9uRGF0YSIsInB1c2giLCJzRXJyb3IiLCJzTWVzc2FnZVRleHQiLCJKU09OIiwicGFyc2UiLCJtZXNzYWdlIiwiZSIsInJlbW92ZVN0cmVhbSIsImRlbGV0ZUJ1dHRvbiIsImdldEljb25Gb3JNaW1lVHlwZSIsInNNaW1lVHlwZSIsIkljb25Qb29sIiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsInNQcm9wZXJ0eVZhbHVlIiwic1Byb3BlcnR5RnVsbFBhdGgiLCJzRGlzcGxheUZvcm1hdCIsInNUZXh0UHJvcGVydHkiLCJzUHJvcGVydHlOYW1lIiwiQ29tbW9uSGVscGVyIiwicmVxdWVzdFZhbHVlTGlzdEluZm8iLCJtVmFsdWVMaXN0SW5mbyIsIm9WYWx1ZUxpc3RJbmZvIiwib1ZhbHVlTGlzdE1vZGVsIiwiJG1vZGVsIiwib01ldGFNb2RlbFZhbHVlTGlzdCIsIm9QYXJhbVdpdGhLZXkiLCJQYXJhbWV0ZXJzIiwiZmluZCIsIm9QYXJhbWV0ZXIiLCJMb2NhbERhdGFQcm9wZXJ0eSIsIiRQcm9wZXJ0eVBhdGgiLCJWYWx1ZUxpc3RQcm9wZXJ0eSIsIm9UZXh0QW5ub3RhdGlvbiIsIkNvbGxlY3Rpb25QYXRoIiwiJFBhdGgiLCJvRmlsdGVyIiwiRmlsdGVyIiwib3BlcmF0b3IiLCJ2YWx1ZTEiLCJvTGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsIiRzZWxlY3QiLCJyZXF1ZXN0Q29udGV4dHMiLCJhQ29udGV4dHMiLCJzRGVzY3JpcHRpb24iLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJzTXNnIiwiaGFuZGxlVHlwZU1pc3NtYXRjaCIsImRldGFpbHMiLCJnZXRQYXJhbWV0ZXJzIiwibWltZVR5cGUiLCJnZXRNaW1lVHlwZSIsInRvU3RyaW5nIiwicmVwbGFjZUFsbCIsImNvbnRlbnRXaWR0aCIsImhhbmRsZUZpbGVTaXplRXhjZWVkIiwiZ2V0TWF4aW11bUZpbGVTaXplIiwidG9GaXhlZCIsIl9jb250cm9sbGVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWVsZFJ1bnRpbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9BY3Rpdml0eVN5bmNcIjtcbmltcG9ydCB7IEFjdGl2aXR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQ29sbGFib3JhdGlvbkNvbW1vblwiO1xuaW1wb3J0IGRyYWZ0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IEZpZWxkV3JhcHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbHMvRmllbGRXcmFwcGVyXCI7XG5pbXBvcnQgdHlwZSBGaWxlV3JhcHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbHMvRmlsZVdyYXBwZXJcIjtcbmltcG9ydCB0eXBlIHsgRW5oYW5jZVdpdGhVSTUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBLZWVwQWxpdmVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvS2VlcEFsaXZlSGVscGVyXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBGaWVsZEFQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZEFQSVwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHR5cGUgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBDdXN0b21EYXRhIGZyb20gXCJzYXAvdWkvY29yZS9DdXN0b21EYXRhXCI7XG5pbXBvcnQgSWNvblBvb2wgZnJvbSBcInNhcC91aS9jb3JlL0ljb25Qb29sXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sbGVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlclwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhQ29udGV4dEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUNvbnRleHRCaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgRmlsZVVwbG9hZGVyIGZyb20gXCJzYXAvdWkvdW5pZmllZC9GaWxlVXBsb2FkZXJcIjtcbmltcG9ydCBGaWxlVXBsb2FkZXJQYXJhbWV0ZXIgZnJvbSBcInNhcC91aS91bmlmaWVkL0ZpbGVVcGxvYWRlclBhcmFtZXRlclwiO1xuaW1wb3J0IG9wZW5XaW5kb3cgZnJvbSBcInNhcC91aS91dGlsL29wZW5XaW5kb3dcIjtcbmltcG9ydCB0eXBlIHsgVjRDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgdXNlZCBmb3IgY29sbGFib3JhdGlvbiBub3RpZmljYXRpb25zLlxuICpcbiAqIEBwYXJhbSBmaWVsZFxuICogQHJldHVybnMgVGhlIGJpbmRpbmdcbiAqL1xuZnVuY3Rpb24gZ2V0Q29sbGFib3JhdGlvbkJpbmRpbmcoZmllbGQ6IENvbnRyb2wpOiBPRGF0YUxpc3RCaW5kaW5nIHwgT0RhdGFDb250ZXh0QmluZGluZyB7XG5cdGxldCBiaW5kaW5nID0gKGZpZWxkLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCkuZ2V0QmluZGluZygpO1xuXG5cdGlmICghYmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhmaWVsZCk7XG5cdFx0YmluZGluZyA9IChvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIFY0Q29udGV4dCkuZ2V0QmluZGluZygpO1xuXHR9XG5cblx0cmV0dXJuIGJpbmRpbmc7XG59XG5cbi8qKlxuICogU3RhdGljIGNsYXNzIHVzZWQgYnkgXCJzYXAudWkubWRjLkZpZWxkXCIgZHVyaW5nIHJ1bnRpbWVcbiAqXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbCBUaGlzIG1vZHVsZSBpcyBvbmx5IGZvciBpbnRlcm5hbC9leHBlcmltZW50YWwgdXNlIVxuICovXG5jb25zdCBGaWVsZFJ1bnRpbWUgPSB7XG5cdHJlc2V0Q2hhbmdlc0hhbmRsZXI6IHVuZGVmaW5lZCBhcyBhbnksXG5cdHVwbG9hZFByb21pc2VzOiB1bmRlZmluZWQgYXMgYW55LFxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VycyBhbiBpbnRlcm5hbCBuYXZpZ2F0aW9uIG9uIHRoZSBsaW5rIHBlcnRhaW5pbmcgdG8gRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NvdXJjZSBTb3VyY2Ugb2YgdGhlIHByZXNzIGV2ZW50XG5cdCAqIEBwYXJhbSBvQ29udHJvbGxlciBJbnN0YW5jZSBvZiB0aGUgY29udHJvbGxlclxuXHQgKiBAcGFyYW0gc05hdlBhdGggVGhlIG5hdmlnYXRpb24gcGF0aFxuXHQgKi9cblx0b25EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6IGZ1bmN0aW9uIChvU291cmNlOiBDb250cm9sLCBvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIHNOYXZQYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAob0NvbnRyb2xsZXIuX3JvdXRpbmcpIHtcblx0XHRcdGxldCBvQmluZGluZ0NvbnRleHQgPSBvU291cmNlLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvU291cmNlKSxcblx0XHRcdFx0b01ldGFNb2RlbCA9IG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRmbk5hdmlnYXRlID0gZnVuY3Rpb24gKG9Db250ZXh0PzogYW55KSB7XG5cdFx0XHRcdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQgPSBvQ29udGV4dDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIuX3JvdXRpbmcubmF2aWdhdGVUb1RhcmdldChvQmluZGluZ0NvbnRleHQsIHNOYXZQYXRoLCB0cnVlKTtcblx0XHRcdFx0fTtcblx0XHRcdC8vIFNob3cgZHJhZnQgbG9zcyBjb25maXJtYXRpb24gZGlhbG9nIGluIGNhc2Ugb2YgT2JqZWN0IHBhZ2Vcblx0XHRcdGlmICgob1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmNvbnZlcnRlclR5cGUgPT09IFwiT2JqZWN0UGFnZVwiICYmICFNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQob01ldGFNb2RlbCkpIHtcblx0XHRcdFx0ZHJhZnQucHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24oXG5cdFx0XHRcdFx0Zm5OYXZpZ2F0ZSxcblx0XHRcdFx0XHRGdW5jdGlvbi5wcm90b3R5cGUsXG5cdFx0XHRcdFx0b0JpbmRpbmdDb250ZXh0LFxuXHRcdFx0XHRcdG9WaWV3LmdldENvbnRyb2xsZXIoKSxcblx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdGRyYWZ0Lk5hdmlnYXRpb25UeXBlLkZvcndhcmROYXZpZ2F0aW9uXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmbk5hdmlnYXRlKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdExvZy5lcnJvcihcblx0XHRcdFx0XCJGaWVsZFJ1bnRpbWU6IE5vIHJvdXRpbmcgbGlzdGVuZXIgY29udHJvbGxlciBleHRlbnNpb24gZm91bmQuIEludGVybmFsIG5hdmlnYXRpb24gYWJvcnRlZC5cIixcblx0XHRcdFx0XCJzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkUnVudGltZVwiLFxuXHRcdFx0XHRcIm9uRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXCJcblx0XHRcdCk7XG5cdFx0fVxuXHR9LFxuXHRpc0RyYWZ0SW5kaWNhdG9yVmlzaWJsZTogZnVuY3Rpb24gKFxuXHRcdHNQcm9wZXJ0eVBhdGg6IGFueSxcblx0XHRzU2VtYW50aWNLZXlIYXNEcmFmdEluZGljYXRvcjogYW55LFxuXHRcdEhhc0RyYWZ0RW50aXR5OiBhbnksXG5cdFx0SXNBY3RpdmVFbnRpdHk6IGFueSxcblx0XHRoaWRlRHJhZnRJbmZvOiBhbnlcblx0KSB7XG5cdFx0aWYgKElzQWN0aXZlRW50aXR5ICE9PSB1bmRlZmluZWQgJiYgSGFzRHJhZnRFbnRpdHkgIT09IHVuZGVmaW5lZCAmJiAoIUlzQWN0aXZlRW50aXR5IHx8IEhhc0RyYWZ0RW50aXR5KSAmJiAhaGlkZURyYWZ0SW5mbykge1xuXHRcdFx0cmV0dXJuIHNQcm9wZXJ0eVBhdGggPT09IHNTZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXHRoYXNUYXJnZXRzOiBmdW5jdGlvbiAoYlNlbWFudGljT2JqZWN0SGFzVGFyZ2V0czogYW55IC8qc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlOiBhbnkqLykge1xuXHRcdHJldHVybiBiU2VtYW50aWNPYmplY3RIYXNUYXJnZXRzID8gYlNlbWFudGljT2JqZWN0SGFzVGFyZ2V0cyA6IGZhbHNlO1xuXHR9LFxuXHRnZXRTdGF0ZURlcGVuZGluZ09uU2VtYW50aWNPYmplY3RUYXJnZXRzOiBmdW5jdGlvbiAoYlNlbWFudGljT2JqZWN0SGFzVGFyZ2V0czogYW55IC8qc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlOiBhbnkqLykge1xuXHRcdHJldHVybiBiU2VtYW50aWNPYmplY3RIYXNUYXJnZXRzID8gXCJJbmZvcm1hdGlvblwiIDogXCJOb25lXCI7XG5cdH0sXG5cdC8qKlxuXHQgKiBIYW5kbGVyIGZvciB0aGUgdmFsaWRhdGVGaWVsZEdyb3VwIGV2ZW50LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgb25WYWxpZGF0ZUZpZWxkR3JvdXBcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSBjb250cm9sbGVyIG9mIHRoZSBwYWdlIGNvbnRhaW5pbmcgdGhlIGZpZWxkXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50IG9iamVjdCBwYXNzZWQgYnkgdGhlIHZhbGlkYXRlRmllbGRHcm91cCBldmVudFxuXHQgKi9cblx0b25WYWxpZGF0ZUZpZWxkR3JvdXA6IGZ1bmN0aW9uIChvQ29udHJvbGxlcjogb2JqZWN0LCBvRXZlbnQ6IG9iamVjdCkge1xuXHRcdGNvbnN0IG9GRUNvbnRyb2xsZXIgPSBGaWVsZFJ1bnRpbWUuX2dldEV4dGVuc2lvbkNvbnRyb2xsZXIob0NvbnRyb2xsZXIpO1xuXHRcdG9GRUNvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmhhbmRsZUZpZWxkR3JvdXBDaGFuZ2Uob0V2ZW50KTtcblx0fSxcblx0LyoqXG5cdCAqIEhhbmRsZXIgZm9yIHRoZSBjaGFuZ2UgZXZlbnQuXG5cdCAqIFN0b3JlIGZpZWxkIGdyb3VwIElEcyBvZiB0aGlzIGZpZWxkIGZvciByZXF1ZXN0aW5nIHNpZGUgZWZmZWN0cyB3aGVuIHJlcXVpcmVkLlxuXHQgKiBXZSBzdG9yZSB0aGVtIGhlcmUgdG8gZW5zdXJlIGEgY2hhbmdlIGluIHRoZSB2YWx1ZSBvZiB0aGUgZmllbGQgaGFzIHRha2VuIHBsYWNlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaGFuZGxlQ2hhbmdlXG5cdCAqIEBwYXJhbSBvQ29udHJvbGxlciBUaGUgY29udHJvbGxlciBvZiB0aGUgcGFnZSBjb250YWluaW5nIHRoZSBmaWVsZFxuXHQgKiBAcGFyYW0gb0V2ZW50IFRoZSBldmVudCBvYmplY3QgcGFzc2VkIGJ5IHRoZSBjaGFuZ2UgZXZlbnRcblx0ICovXG5cdGhhbmRsZUNoYW5nZTogZnVuY3Rpb24gKG9Db250cm9sbGVyOiBvYmplY3QsIG9FdmVudDogRXZlbnQpIHtcblx0XHRjb25zdCBvU291cmNlRmllbGQgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgQ29udHJvbCxcblx0XHRcdGJJc1RyYW5zaWVudCA9IG9Tb3VyY2VGaWVsZCAmJiAob1NvdXJjZUZpZWxkLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgYW55KS5pc1RyYW5zaWVudCgpLFxuXHRcdFx0cFZhbHVlUmVzb2x2ZWQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicHJvbWlzZVwiKSB8fCBQcm9taXNlLnJlc29sdmUoKSxcblx0XHRcdG9Tb3VyY2UgPSBvRXZlbnQuZ2V0U291cmNlKCksXG5cdFx0XHRiVmFsaWQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmFsaWRcIiksXG5cdFx0XHRmaWVsZFZhbGlkaXR5ID0gdGhpcy5nZXRGaWVsZFN0YXRlT25DaGFuZ2Uob0V2ZW50KS5zdGF0ZVtcInZhbGlkaXR5XCJdO1xuXG5cdFx0Ly8gVE9ETzogY3VycmVudGx5IHdlIGhhdmUgdW5kZWZpbmVkIGFuZCB0cnVlLi4uIGFuZCBvdXIgY3JlYXRpb24gcm93IGltcGxlbWVudGF0aW9uIHJlbGllcyBvbiB0aGlzLlxuXHRcdC8vIEkgd291bGQgbW92ZSB0aGlzIGxvZ2ljIHRvIHRoaXMgcGxhY2UgYXMgaXQncyBoYXJkIHRvIHVuZGVyc3RhbmQgZm9yIGZpZWxkIGNvbnN1bWVyXG5cblx0XHRwVmFsdWVSZXNvbHZlZFxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvLyBUaGUgZXZlbnQgaXMgZ29uZS4gRm9yIG5vdyB3ZSdsbCBqdXN0IHJlY3JlYXRlIGl0IGFnYWluXG5cdFx0XHRcdChvRXZlbnQgYXMgYW55KS5vU291cmNlID0gb1NvdXJjZTtcblx0XHRcdFx0KG9FdmVudCBhcyBhbnkpLm1QYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHRcdHZhbGlkOiBiVmFsaWRcblx0XHRcdFx0fTtcblx0XHRcdFx0KEZpZWxkQVBJIGFzIGFueSkuaGFuZGxlQ2hhbmdlKG9FdmVudCwgb0NvbnRyb2xsZXIpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoLypvRXJyb3I6IGFueSovKSB7XG5cdFx0XHRcdC8vIFRoZSBldmVudCBpcyBnb25lLiBGb3Igbm93IHdlJ2xsIGp1c3QgcmVjcmVhdGUgaXQgYWdhaW5cblx0XHRcdFx0KG9FdmVudCBhcyBhbnkpLm9Tb3VyY2UgPSBvU291cmNlO1xuXHRcdFx0XHQob0V2ZW50IGFzIGFueSkubVBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdFx0dmFsaWQ6IGZhbHNlXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Ly8gYXMgdGhlIFVJIG1pZ2h0IG5lZWQgdG8gcmVhY3Qgb24uIFdlIGNvdWxkIHByb3ZpZGUgYSBwYXJhbWV0ZXIgdG8gaW5mb3JtIGlmIHZhbGlkYXRpb25cblx0XHRcdFx0Ly8gd2FzIHN1Y2Nlc3NmdWw/XG5cdFx0XHRcdChGaWVsZEFQSSBhcyBhbnkpLmhhbmRsZUNoYW5nZShvRXZlbnQsIG9Db250cm9sbGVyKTtcblx0XHRcdH0pO1xuXG5cdFx0Ly8gVXNlIHRoZSBGRSBDb250cm9sbGVyIGluc3RlYWQgb2YgdGhlIGV4dGVuc2lvbkFQSSB0byBhY2Nlc3MgaW50ZXJuYWwgRkUgY29udHJvbGxlcnNcblx0XHRjb25zdCBvRkVDb250cm9sbGVyID0gRmllbGRSdW50aW1lLl9nZXRFeHRlbnNpb25Db250cm9sbGVyKG9Db250cm9sbGVyKTtcblxuXHRcdG9GRUNvbnRyb2xsZXIuX2VkaXRGbG93LnN5bmNUYXNrKHBWYWx1ZVJlc29sdmVkKTtcblxuXHRcdC8vIGlmIHRoZSBjb250ZXh0IGlzIHRyYW5zaWVudCwgaXQgbWVhbnMgdGhlIHJlcXVlc3Qgd291bGQgZmFpbCBhbnl3YXkgYXMgdGhlIHJlY29yZCBkb2VzIG5vdCBleGlzdCBpbiByZWFsaXR5XG5cdFx0Ly8gVE9ETzogc2hvdWxkIHRoZSByZXF1ZXN0IGJlIG1hZGUgaW4gZnV0dXJlIGlmIHRoZSBjb250ZXh0IGlzIHRyYW5zaWVudD9cblx0XHRpZiAoYklzVHJhbnNpZW50KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gU0lERSBFRkZFQ1RTXG5cdFx0b0ZFQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuaGFuZGxlRmllbGRDaGFuZ2Uob0V2ZW50LCBmaWVsZFZhbGlkaXR5LCBwVmFsdWVSZXNvbHZlZCk7XG5cblx0XHQvLyBDb2xsYWJvcmF0aW9uIERyYWZ0IEFjdGl2aXR5IFN5bmNcblx0XHRjb25zdCBvRmllbGQgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgQ29udHJvbCxcblx0XHRcdGJDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQob0ZpZWxkKTtcblxuXHRcdGlmIChiQ29sbGFib3JhdGlvbkVuYWJsZWQgJiYgZmllbGRWYWxpZGl0eSkge1xuXHRcdFx0LyogVE9ETzogZm9yIG5vdyB3ZSB1c2UgYWx3YXlzIHRoZSBmaXJzdCBiaW5kaW5nIHBhcnQgKHNvIGluIGNhc2Ugb2YgY29tcG9zaXRlIGJpbmRpbmdzIGxpa2UgYW1vdW50IGFuZFxuXHRcdFx0XHRcdHVuaXQgb3IgY3VycmVuY3kgb25seSB0aGUgYW1vdW50IGlzIGNvbnNpZGVyZWQpICovXG5cdFx0XHRjb25zdCBiaW5kaW5nID0gZ2V0Q29sbGFib3JhdGlvbkJpbmRpbmcob0ZpZWxkKTtcblxuXHRcdFx0Y29uc3QgZGF0YSA9IFtcblx0XHRcdFx0Li4uKChvRmllbGQuZ2V0QmluZGluZ0luZm8oXCJ2YWx1ZVwiKSB8fCBvRmllbGQuZ2V0QmluZGluZ0luZm8oXCJzZWxlY3RlZFwiKSkgYXMgYW55KT8ucGFydHMsXG5cdFx0XHRcdC4uLigob0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwiYWRkaXRpb25hbFZhbHVlXCIpIGFzIGFueSk/LnBhcnRzIHx8IFtdKVxuXHRcdFx0XS5tYXAoZnVuY3Rpb24gKHBhcnQ6IGFueSkge1xuXHRcdFx0XHRpZiAocGFydCkge1xuXHRcdFx0XHRcdHJldHVybiBgJHtvRmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpfS8ke3BhcnQucGF0aH1gO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSBhcyBbXTtcblxuXHRcdFx0aWYgKGJpbmRpbmcuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHQvLyBUaGUgdmFsdWUgaGFzIGJlZW4gY2hhbmdlZCBieSB0aGUgdXNlciAtLT4gd2FpdCB1bnRpbCBpdCdzIHNlbnQgdG8gdGhlIHNlcnZlciBiZWZvcmUgc2VuZGluZyBhIG5vdGlmaWNhdGlvbiB0byBvdGhlciB1c2Vyc1xuXHRcdFx0XHRiaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcInBhdGNoQ29tcGxldGVkXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQob0ZpZWxkLCBBY3Rpdml0eS5DaGFuZ2UsIGRhdGEpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE5vIGNoYW5nZXMgLS0+IHNlbmQgYSBVbmRvIG5vdGlmaWNhdGlvblxuXHRcdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQob0ZpZWxkLCBBY3Rpdml0eS5VbmRvLCBkYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlTGl2ZUNoYW5nZTogZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcblx0XHQvLyBDb2xsYWJvcmF0aW9uIERyYWZ0IEFjdGl2aXR5IFN5bmNcblx0XHRjb25zdCBmaWVsZCA9IGV2ZW50LmdldFNvdXJjZSgpO1xuXG5cdFx0aWYgKENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQoZmllbGQpKSB7XG5cdFx0XHQvKiBUT0RPOiBmb3Igbm93IHdlIHVzZSBhbHdheXMgdGhlIGZpcnN0IGJpbmRpbmcgcGFydCAoc28gaW4gY2FzZSBvZiBjb21wb3NpdGUgYmluZGluZ3MgbGlrZSBhbW91bnQgYW5kXG5cdFx0XHRcdFx0dW5pdCBvciBjdXJyZW5jeSBvbmx5IHRoZSBhbW91bnQgaXMgY29uc2lkZXJlZCkgKi9cblx0XHRcdGNvbnN0IGJpbmRpbmdQYXRoID0gZmllbGQuZ2V0QmluZGluZ0luZm8oXCJ2YWx1ZVwiKS5wYXJ0c1swXS5wYXRoO1xuXHRcdFx0Y29uc3QgZnVsbFBhdGggPSBgJHtmaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtiaW5kaW5nUGF0aH1gO1xuXHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKGZpZWxkLCBBY3Rpdml0eS5MaXZlQ2hhbmdlLCBmdWxsUGF0aCk7XG5cblx0XHRcdC8vIElmIHRoZSB1c2VyIHJldmVydGVkIHRoZSBjaGFuZ2Ugbm8gY2hhbmdlIGV2ZW50IGlzIHNlbnQgdGhlcmVmb3JlIHdlIGhhdmUgdG8gaGFuZGxlIGl0IGhlcmVcblx0XHRcdGlmICghdGhpcy5yZXNldENoYW5nZXNIYW5kbGVyKSB7XG5cdFx0XHRcdHRoaXMucmVzZXRDaGFuZ2VzSGFuZGxlciA9ICgpID0+IHtcblx0XHRcdFx0XHQvLyBXZSBuZWVkIHRvIHdhaXQgYSBsaXR0bGUgYml0IGZvciB0aGUgZm9jdXMgdG8gYmUgdXBkYXRlZFxuXHRcdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGZpZWxkLmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZm9jdXNlZENvbnRyb2wgPSBDb3JlLmJ5SWQoQ29yZS5nZXRDdXJyZW50Rm9jdXNlZENvbnRyb2xJZCgpKTtcblx0XHRcdFx0XHRcdFx0aWYgKGZvY3VzZWRDb250cm9sPy5nZXRQYXJlbnQoKSA9PT0gZmllbGQpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBXZSdyZSBzdGlsbCB1biB0aGUgc2FtZSBNREMgRmllbGQgLS0+IGRvIG5vdGhpbmdcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZmllbGQuZGV0YWNoQnJvd3NlckV2ZW50KFwiZm9jdXNvdXRcIiwgdGhpcy5yZXNldENoYW5nZXNIYW5kbGVyKTtcblx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXI7XG5cdFx0XHRcdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQoZmllbGQsIEFjdGl2aXR5LlVuZG8sIGZ1bGxQYXRoKTtcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRmaWVsZC5hdHRhY2hCcm93c2VyRXZlbnQoXCJmb2N1c291dFwiLCB0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVPcGVuUGlja2VyOiBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHQvLyBDb2xsYWJvcmF0aW9uIERyYWZ0IEFjdGl2aXR5IFN5bmNcblx0XHRjb25zdCBvRmllbGQgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0Y29uc3QgYkNvbGxhYm9yYXRpb25FbmFibGVkID0gQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5pc0Nvbm5lY3RlZChvRmllbGQpO1xuXG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwidmFsdWVcIikucGFydHNbMF0ucGF0aDtcblx0XHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtzQmluZGluZ1BhdGh9YDtcblx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChvRmllbGQsIEFjdGl2aXR5LkxpdmVDaGFuZ2UsIHNGdWxsUGF0aCk7XG5cdFx0fVxuXHR9LFxuXHRoYW5kbGVDbG9zZVBpY2tlcjogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IGJDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQob0ZpZWxkKTtcblxuXHRcdGlmIChiQ29sbGFib3JhdGlvbkVuYWJsZWQpIHtcblx0XHRcdGNvbnN0IGJpbmRpbmcgPSBnZXRDb2xsYWJvcmF0aW9uQmluZGluZyhvRmllbGQpO1xuXHRcdFx0aWYgKCFiaW5kaW5nLmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgYXJlIG5vIHBlbmRpbmcgY2hhbmdlcywgdGhlIHBpY2tlciB3YXMgY2xvc2VkIHdpdGhvdXQgY2hhbmdpbmcgdGhlIHZhbHVlIC0tPiBzZW5kIGEgVU5ETyBub3RpZmljYXRpb25cblx0XHRcdFx0Ly8gSW4gY2FzZSB0aGVyZSB3ZXJlIGNoYW5nZXMsIG5vdGlmaWNhdGlvbnMgYXJlIG1hbmFnZWQgaW4gaGFuZGxlQ2hhbmdlXG5cdFx0XHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IG9GaWVsZC5nZXRCaW5kaW5nSW5mbyhcInZhbHVlXCIpLnBhcnRzWzBdLnBhdGg7XG5cdFx0XHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtzQmluZGluZ1BhdGh9YDtcblx0XHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKG9GaWVsZCwgQWN0aXZpdHkuVW5kbywgc0Z1bGxQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X3NlbmRDb2xsYWJvcmF0aW9uTWVzc2FnZUZvckZpbGVVcGxvYWRlcihmaWxlVXBsb2FkZXI6IEZpbGVVcGxvYWRlciwgYWN0aXZpdHk6IEFjdGl2aXR5KSB7XG5cdFx0Y29uc3QgaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQoZmlsZVVwbG9hZGVyKTtcblxuXHRcdGlmIChpc0NvbGxhYm9yYXRpb25FbmFibGVkKSB7XG5cdFx0XHRjb25zdCBiaW5kaW5nUGF0aCA9IGZpbGVVcGxvYWRlci5nZXRQYXJlbnQoKT8uZ2V0UHJvcGVydHkoXCJwcm9wZXJ0eVBhdGhcIik7XG5cdFx0XHRjb25zdCBmdWxsUGF0aCA9IGAke2ZpbGVVcGxvYWRlci5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCl9LyR7YmluZGluZ1BhdGh9YDtcblx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChmaWxlVXBsb2FkZXIsIGFjdGl2aXR5LCBmdWxsUGF0aCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZU9wZW5VcGxvYWRlcjogZnVuY3Rpb24gKGV2ZW50OiBFdmVudCkge1xuXHRcdC8vIENvbGxhYm9yYXRpb24gRHJhZnQgQWN0aXZpdHkgU3luY1xuXHRcdGNvbnN0IGZpbGVVcGxvYWRlciA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIEZpbGVVcGxvYWRlcjtcblx0XHRGaWVsZFJ1bnRpbWUuX3NlbmRDb2xsYWJvcmF0aW9uTWVzc2FnZUZvckZpbGVVcGxvYWRlcihmaWxlVXBsb2FkZXIsIEFjdGl2aXR5LkxpdmVDaGFuZ2UpO1xuXHR9LFxuXHRoYW5kbGVDbG9zZVVwbG9hZGVyOiBmdW5jdGlvbiAoZXZlbnQ6IEV2ZW50KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3QgZmlsZVVwbG9hZGVyID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgRmlsZVVwbG9hZGVyO1xuXHRcdEZpZWxkUnVudGltZS5fc2VuZENvbGxhYm9yYXRpb25NZXNzYWdlRm9yRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRlciwgQWN0aXZpdHkuVW5kbyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGZpZWxkIHZhbHVlIGFuZCB2YWxpZGl0eSBvbiBhIGNoYW5nZSBldmVudC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGZpZWxkVmFsaWRpdHlPbkNoYW5nZVxuXHQgKiBAcGFyYW0gb0V2ZW50IFRoZSBldmVudCBvYmplY3QgcGFzc2VkIGJ5IHRoZSBjaGFuZ2UgZXZlbnRcblx0ICogQHJldHVybnMgRmllbGQgdmFsdWUgYW5kIHZhbGlkaXR5XG5cdCAqL1xuXHRnZXRGaWVsZFN0YXRlT25DaGFuZ2U6IGZ1bmN0aW9uIChvRXZlbnQ6IEV2ZW50KTogYW55IHtcblx0XHRsZXQgb1NvdXJjZUZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIGFueSxcblx0XHRcdG1GaWVsZFN0YXRlID0ge307XG5cdFx0Y29uc3QgX2lzQmluZGluZ1N0YXRlTWVzc2FnZXMgPSBmdW5jdGlvbiAob0JpbmRpbmc6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9CaW5kaW5nICYmIG9CaW5kaW5nLmdldERhdGFTdGF0ZSgpID8gb0JpbmRpbmcuZ2V0RGF0YVN0YXRlKCkuZ2V0SW52YWxpZFZhbHVlKCkgPT09IHVuZGVmaW5lZCA6IHRydWU7XG5cdFx0fTtcblx0XHRpZiAob1NvdXJjZUZpZWxkLmlzQShcInNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRBUElcIikpIHtcblx0XHRcdG9Tb3VyY2VGaWVsZCA9IChvU291cmNlRmllbGQgYXMgRW5oYW5jZVdpdGhVSTU8RmllbGRBUEk+KS5nZXRDb250ZW50KCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9Tb3VyY2VGaWVsZC5pc0EoRmllbGRXcmFwcGVyLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKSAmJiBvU291cmNlRmllbGQuZ2V0RWRpdE1vZGUoKSA9PT0gXCJFZGl0YWJsZVwiKSB7XG5cdFx0XHRvU291cmNlRmllbGQgPSBvU291cmNlRmllbGQuZ2V0Q29udGVudEVkaXQoKVswXTtcblx0XHR9XG5cblx0XHRpZiAob1NvdXJjZUZpZWxkLmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdGxldCBiSXNWYWxpZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWxpZFwiKSB8fCBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiaXNWYWxpZFwiKTtcblx0XHRcdGlmIChiSXNWYWxpZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlmIChvU291cmNlRmllbGQuZ2V0TWF4Q29uZGl0aW9ucygpID09PSAxKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1ZhbHVlQmluZGluZ0luZm8gPSBvU291cmNlRmllbGQuZ2V0QmluZGluZ0luZm8oXCJ2YWx1ZVwiKTtcblx0XHRcdFx0XHRiSXNWYWxpZCA9IF9pc0JpbmRpbmdTdGF0ZU1lc3NhZ2VzKG9WYWx1ZUJpbmRpbmdJbmZvICYmIG9WYWx1ZUJpbmRpbmdJbmZvLmJpbmRpbmcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvU291cmNlRmllbGQuZ2V0VmFsdWUoKSA9PT0gXCJcIiAmJiAhb1NvdXJjZUZpZWxkLmdldFByb3BlcnR5KFwicmVxdWlyZWRcIikpIHtcblx0XHRcdFx0XHRiSXNWYWxpZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1GaWVsZFN0YXRlID0ge1xuXHRcdFx0XHRmaWVsZFZhbHVlOiBvU291cmNlRmllbGQuZ2V0VmFsdWUoKSxcblx0XHRcdFx0dmFsaWRpdHk6ICEhYklzVmFsaWRcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG9Tb3VyY2VGaWVsZCBleHRlbmRzIGZyb20gYSBGaWxlVXBsb2FkZXIgfHwgSW5wdXQgfHwgaXMgYSBDaGVja0JveFxuXHRcdFx0Y29uc3Qgb0JpbmRpbmcgPVxuXHRcdFx0XHRvU291cmNlRmllbGQuZ2V0QmluZGluZyhcInVwbG9hZFVybFwiKSB8fCBvU291cmNlRmllbGQuZ2V0QmluZGluZyhcInZhbHVlXCIpIHx8IG9Tb3VyY2VGaWVsZC5nZXRCaW5kaW5nKFwic2VsZWN0ZWRcIik7XG5cdFx0XHRtRmllbGRTdGF0ZSA9IHtcblx0XHRcdFx0ZmllbGRWYWx1ZTogb0JpbmRpbmcgJiYgb0JpbmRpbmcuZ2V0VmFsdWUoKSxcblx0XHRcdFx0dmFsaWRpdHk6IF9pc0JpbmRpbmdTdGF0ZU1lc3NhZ2VzKG9CaW5kaW5nKVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGZpZWxkOiBvU291cmNlRmllbGQsXG5cdFx0XHRzdGF0ZTogbUZpZWxkU3RhdGVcblx0XHR9O1xuXHR9LFxuXHRfZm5GaXhIYXNoUXVlcnlTdHJpbmc6IGZ1bmN0aW9uIChzQ3VycmVudEhhc2g6IGFueSkge1xuXHRcdGlmIChzQ3VycmVudEhhc2ggJiYgc0N1cnJlbnRIYXNoLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuXHRcdFx0Ly8gc0N1cnJlbnRIYXNoIGNhbiBjb250YWluIHF1ZXJ5IHN0cmluZywgY3V0IGl0IG9mZiFcblx0XHRcdHNDdXJyZW50SGFzaCA9IHNDdXJyZW50SGFzaC5zcGxpdChcIj9cIilbMF07XG5cdFx0fVxuXHRcdHJldHVybiBzQ3VycmVudEhhc2g7XG5cdH0sXG5cdF9mbkdldExpbmtJbmZvcm1hdGlvbjogZnVuY3Rpb24gKF9vU291cmNlOiBhbnksIF9vTGluazogYW55LCBfc1Byb3BlcnR5UGF0aDogYW55LCBfc1ZhbHVlOiBhbnksIGZuU2V0QWN0aXZlOiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBfb0xpbmsgJiYgX29MaW5rLmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbCAmJiBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0TmFtZSA9IF9zVmFsdWUgfHwgKF9vU291cmNlICYmIF9vU291cmNlLmdldFZhbHVlKCkpO1xuXHRcdGNvbnN0IG9WaWV3ID0gX29MaW5rICYmIENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoX29MaW5rKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldyAmJiBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBvVmlldyAmJiBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpO1xuXHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VIZWxwZXIgPSBvQXBwQ29tcG9uZW50ICYmIG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdGNvbnN0IHBHZXRMaW5rc1Byb21pc2UgPSBvU2hlbGxTZXJ2aWNlSGVscGVyICYmIG9TaGVsbFNlcnZpY2VIZWxwZXIuZ2V0TGlua3NXaXRoQ2FjaGUoW1t7IHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3ROYW1lIH1dXSk7XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID1cblx0XHRcdG9NZXRhTW9kZWwgJiYgb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7X3NQcm9wZXJ0eVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc2ApO1xuXHRcdHJldHVybiB7XG5cdFx0XHRTZW1hbnRpY09iamVjdE5hbWU6IHNTZW1hbnRpY09iamVjdE5hbWUsXG5cdFx0XHRTZW1hbnRpY09iamVjdEZ1bGxQYXRoOiBfc1Byb3BlcnR5UGF0aCwgLy9zU2VtYW50aWNPYmplY3RGdWxsUGF0aCxcblx0XHRcdE1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdEludGVybmFsTW9kZWxDb250ZXh0OiBvSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRTaGVsbFNlcnZpY2VIZWxwZXI6IG9TaGVsbFNlcnZpY2VIZWxwZXIsXG5cdFx0XHRHZXRMaW5rc1Byb21pc2U6IHBHZXRMaW5rc1Byb21pc2UsXG5cdFx0XHRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLFxuXHRcdFx0Zm5TZXRBY3RpdmU6IGZuU2V0QWN0aXZlXG5cdFx0fTtcblx0fSxcblx0X2ZuUXVpY2tWaWV3SGFzTmV3Q29uZGl0aW9uOiBmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0UGF5bG9hZDogYW55LCBfb0xpbmtJbmZvOiBhbnkpIHtcblx0XHRpZiAob1NlbWFudGljT2JqZWN0UGF5bG9hZCAmJiBvU2VtYW50aWNPYmplY3RQYXlsb2FkLnBhdGggJiYgb1NlbWFudGljT2JqZWN0UGF5bG9hZC5wYXRoID09PSBfb0xpbmtJbmZvLlNlbWFudGljT2JqZWN0RnVsbFBhdGgpIHtcblx0XHRcdC8vIEdvdCB0aGUgcmVzb2x2ZWQgU2VtYW50aWMgT2JqZWN0IVxuXHRcdFx0Y29uc3QgYlJlc3VsdGluZ05ld0NvbmRpdGlvbkZvckNvbmRpdGlvbmFsV3JhcHBlciA9XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdFBheWxvYWRbIV9vTGlua0luZm8uU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPyBcIkhhc1RhcmdldHNOb3RGaWx0ZXJlZFwiIDogXCJIYXNUYXJnZXRzXCJdO1xuXHRcdFx0X29MaW5rSW5mby5mblNldEFjdGl2ZSghIWJSZXN1bHRpbmdOZXdDb25kaXRpb25Gb3JDb25kaXRpb25hbFdyYXBwZXIpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdF9mblF1aWNrVmlld1NldE5ld0NvbmRpdGlvbkZvckNvbmRpdGlvbmFsV3JhcHBlcjogZnVuY3Rpb24gKF9vTGlua0luZm86IGFueSwgX29GaW5hbFNlbWFudGljT2JqZWN0czogYW55KSB7XG5cdFx0aWYgKF9vRmluYWxTZW1hbnRpY09iamVjdHNbX29MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWVdKSB7XG5cdFx0XHRsZXQgc1RtcFBhdGgsIG9TZW1hbnRpY09iamVjdFBheWxvYWQ7XG5cdFx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RQYXRocyA9IE9iamVjdC5rZXlzKF9vRmluYWxTZW1hbnRpY09iamVjdHNbX29MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWVdKTtcblx0XHRcdGZvciAoY29uc3QgaVBhdGhzQ291bnQgaW4gYVNlbWFudGljT2JqZWN0UGF0aHMpIHtcblx0XHRcdFx0c1RtcFBhdGggPSBhU2VtYW50aWNPYmplY3RQYXRoc1tpUGF0aHNDb3VudF07XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdFBheWxvYWQgPVxuXHRcdFx0XHRcdF9vRmluYWxTZW1hbnRpY09iamVjdHNbX29MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWVdICYmXG5cdFx0XHRcdFx0X29GaW5hbFNlbWFudGljT2JqZWN0c1tfb0xpbmtJbmZvLlNlbWFudGljT2JqZWN0TmFtZV1bc1RtcFBhdGhdO1xuXHRcdFx0XHRpZiAoRmllbGRSdW50aW1lLl9mblF1aWNrVmlld0hhc05ld0NvbmRpdGlvbihvU2VtYW50aWNPYmplY3RQYXlsb2FkLCBfb0xpbmtJbmZvKSkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRfZm5VcGRhdGVTZW1hbnRpY09iamVjdHNUYXJnZXRNb2RlbDogZnVuY3Rpb24gKG9FdmVudDogYW55LCBzVmFsdWU6IGFueSwgb0NvbnRyb2w6IGFueSwgX3NQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdGNvbnN0IG9Tb3VyY2UgPSBvRXZlbnQgJiYgb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGxldCBmblNldEFjdGl2ZTtcblx0XHRpZiAob0NvbnRyb2wuaXNBKFwic2FwLm0uT2JqZWN0U3RhdHVzXCIpKSB7XG5cdFx0XHRmblNldEFjdGl2ZSA9IChiQWN0aXZlOiBib29sZWFuKSA9PiBvQ29udHJvbC5zZXRBY3RpdmUoYkFjdGl2ZSk7XG5cdFx0fVxuXHRcdGlmIChvQ29udHJvbC5pc0EoXCJzYXAubS5PYmplY3RJZGVudGlmaWVyXCIpKSB7XG5cdFx0XHRmblNldEFjdGl2ZSA9IChiQWN0aXZlOiBib29sZWFuKSA9PiBvQ29udHJvbC5zZXRUaXRsZUFjdGl2ZShiQWN0aXZlKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0NvbmRpdGlvbmFsV3JhcHBlciA9IG9Db250cm9sICYmIG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdGlmIChvQ29uZGl0aW9uYWxXcmFwcGVyICYmIG9Db25kaXRpb25hbFdyYXBwZXIuaXNBKFwic2FwLmZlLmNvcmUuY29udHJvbHMuQ29uZGl0aW9uYWxXcmFwcGVyXCIpKSB7XG5cdFx0XHRmblNldEFjdGl2ZSA9IChiQWN0aXZlOiBib29sZWFuKSA9PiBvQ29uZGl0aW9uYWxXcmFwcGVyLnNldENvbmRpdGlvbihiQWN0aXZlKTtcblx0XHR9XG5cdFx0aWYgKGZuU2V0QWN0aXZlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IG9MaW5rSW5mbyA9IEZpZWxkUnVudGltZS5fZm5HZXRMaW5rSW5mb3JtYXRpb24ob1NvdXJjZSwgb0NvbnRyb2wsIF9zUHJvcGVydHlQYXRoLCBzVmFsdWUsIGZuU2V0QWN0aXZlKTtcblx0XHRcdG9MaW5rSW5mby5mblNldEFjdGl2ZSA9IGZuU2V0QWN0aXZlO1xuXHRcdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gRmllbGRSdW50aW1lLl9mbkZpeEhhc2hRdWVyeVN0cmluZyhDb21tb25VdGlscy5nZXRIYXNoKCkpO1xuXHRcdFx0Q29tbW9uVXRpbHMudXBkYXRlU2VtYW50aWNUYXJnZXRzKFxuXHRcdFx0XHRbb0xpbmtJbmZvLkdldExpbmtzUHJvbWlzZV0sXG5cdFx0XHRcdFt7IHNlbWFudGljT2JqZWN0OiBvTGlua0luZm8uU2VtYW50aWNPYmplY3ROYW1lLCBwYXRoOiBvTGlua0luZm8uU2VtYW50aWNPYmplY3RGdWxsUGF0aCB9XSxcblx0XHRcdFx0b0xpbmtJbmZvLkludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRzQ3VycmVudEhhc2hcblx0XHRcdClcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9GaW5hbFNlbWFudGljT2JqZWN0czogYW55KSB7XG5cdFx0XHRcdFx0aWYgKG9GaW5hbFNlbWFudGljT2JqZWN0cykge1xuXHRcdFx0XHRcdFx0RmllbGRSdW50aW1lLl9mblF1aWNrVmlld1NldE5ld0NvbmRpdGlvbkZvckNvbmRpdGlvbmFsV3JhcHBlcihvTGlua0luZm8sIG9GaW5hbFNlbWFudGljT2JqZWN0cyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IHVwZGF0ZSBTZW1hbnRpYyBUYXJnZXRzIG1vZGVsXCIsIG9FcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0X2NoZWNrQ29udHJvbEhhc01vZGVsQW5kQmluZGluZ0NvbnRleHQoX2NvbnRyb2w6IENvbnRyb2wpIHtcblx0XHRpZiAoIV9jb250cm9sLmdldE1vZGVsKCkgfHwgIV9jb250cm9sLmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXHRfY2hlY2tDdXN0b21EYXRhVmFsdWVCZWZvcmVVcGRhdGluZ1NlbWFudGljT2JqZWN0TW9kZWwoX2NvbnRyb2w6IENvbnRyb2wsIHByb3BlcnR5UGF0aDogc3RyaW5nLCBhQ3VzdG9tRGF0YTogQ3VzdG9tRGF0YVtdKTogdm9pZCB7XG5cdFx0bGV0IHNTZW1hbnRpY09iamVjdFBhdGhWYWx1ZTogYW55O1xuXHRcdGxldCBvVmFsdWVCaW5kaW5nO1xuXHRcdGNvbnN0IF9mbkN1c3RvbURhdGFWYWx1ZUlzU3RyaW5nID0gZnVuY3Rpb24gKHNlbWFudGljT2JqZWN0UGF0aFZhbHVlOiBhbnkpIHtcblx0XHRcdHJldHVybiAhKHNlbWFudGljT2JqZWN0UGF0aFZhbHVlICE9PSBudWxsICYmIHR5cGVvZiBzZW1hbnRpY09iamVjdFBhdGhWYWx1ZSA9PT0gXCJvYmplY3RcIik7XG5cdFx0fTtcblx0XHQvLyByZW1vdmUgdGVjaG5pY2FsIGN1c3RvbSBkYXRhcyBzZXQgYnkgVUk1XG5cdFx0YUN1c3RvbURhdGEgPSBhQ3VzdG9tRGF0YS5maWx0ZXIoKGN1c3RvbURhdGEpID0+IGN1c3RvbURhdGEuZ2V0S2V5KCkgIT09IFwic2FwLXVpLWN1c3RvbS1zZXR0aW5nc1wiKTtcblx0XHRmb3IgKGNvbnN0IGluZGV4IGluIGFDdXN0b21EYXRhKSB7XG5cdFx0XHRzU2VtYW50aWNPYmplY3RQYXRoVmFsdWUgPSBhQ3VzdG9tRGF0YVtpbmRleF0uZ2V0VmFsdWUoKTtcblx0XHRcdGlmICghc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlICYmIF9mbkN1c3RvbURhdGFWYWx1ZUlzU3RyaW5nKHNTZW1hbnRpY09iamVjdFBhdGhWYWx1ZSkpIHtcblx0XHRcdFx0b1ZhbHVlQmluZGluZyA9IGFDdXN0b21EYXRhW2luZGV4XS5nZXRCaW5kaW5nKFwidmFsdWVcIik7XG5cdFx0XHRcdGlmIChvVmFsdWVCaW5kaW5nKSB7XG5cdFx0XHRcdFx0b1ZhbHVlQmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKF9vQ2hhbmdlRXZlbnQ6IGFueSkge1xuXHRcdFx0XHRcdFx0RmllbGRSdW50aW1lLl9mblVwZGF0ZVNlbWFudGljT2JqZWN0c1RhcmdldE1vZGVsKF9vQ2hhbmdlRXZlbnQsIG51bGwsIF9jb250cm9sLCBwcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKF9mbkN1c3RvbURhdGFWYWx1ZUlzU3RyaW5nKHNTZW1hbnRpY09iamVjdFBhdGhWYWx1ZSkpIHtcblx0XHRcdFx0RmllbGRSdW50aW1lLl9mblVwZGF0ZVNlbWFudGljT2JqZWN0c1RhcmdldE1vZGVsKG51bGwsIHNTZW1hbnRpY09iamVjdFBhdGhWYWx1ZSwgX2NvbnRyb2wsIHByb3BlcnR5UGF0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRMaW5rTW9kZWxDb250ZXh0Q2hhbmdlOiBmdW5jdGlvbiAob0V2ZW50OiBhbnksIHNQcm9wZXJ0eTogYW55LCBzUGF0aFRvUHJvcGVydHk6IGFueSk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbnRyb2wgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0aWYgKEZpZWxkUnVudGltZS5fY2hlY2tDb250cm9sSGFzTW9kZWxBbmRCaW5kaW5nQ29udGV4dChjb250cm9sKSkge1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IGAke3NQYXRoVG9Qcm9wZXJ0eX0vJHtzUHJvcGVydHl9YDtcblx0XHRcdGNvbnN0IG1kY0xpbmsgPSBjb250cm9sLmdldERlcGVuZGVudHMoKS5sZW5ndGggPyBjb250cm9sLmdldERlcGVuZGVudHMoKVswXSA6IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IGFDdXN0b21EYXRhID0gbWRjTGluaz8uZ2V0Q3VzdG9tRGF0YSgpO1xuXHRcdFx0aWYgKGFDdXN0b21EYXRhICYmIGFDdXN0b21EYXRhLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0RmllbGRSdW50aW1lLl9jaGVja0N1c3RvbURhdGFWYWx1ZUJlZm9yZVVwZGF0aW5nU2VtYW50aWNPYmplY3RNb2RlbChjb250cm9sLCBzUHJvcGVydHlQYXRoLCBhQ3VzdG9tRGF0YSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRvcGVuRXh0ZXJuYWxMaW5rOiBmdW5jdGlvbiAoZXZlbnQ6IEV2ZW50KSB7XG5cdFx0Y29uc3Qgc291cmNlID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgYW55O1xuXHRcdGlmIChzb3VyY2UuZGF0YShcInVybFwiKSAmJiBzb3VyY2UuZ2V0UHJvcGVydHkoXCJ0ZXh0XCIpICE9PSBcIlwiKSB7XG5cdFx0XHRvcGVuV2luZG93KHNvdXJjZS5kYXRhKFwidXJsXCIpKTtcblx0XHR9XG5cdH0sXG5cdHByZXNzTGluazogYXN5bmMgZnVuY3Rpb24gKG9FdmVudDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb1NvdXJjZSA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBvTGluayA9IG9Tb3VyY2UuaXNBKFwic2FwLm0uT2JqZWN0SWRlbnRpZmllclwiKVxuXHRcdFx0PyBvU291cmNlLmZpbmRFbGVtZW50cyhmYWxzZSwgKGVsZW06IEV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGVsZW0uaXNBKFwic2FwLm0uTGlua1wiKTtcblx0XHRcdCAgfSlbMF1cblx0XHRcdDogb1NvdXJjZTtcblxuXHRcdGFzeW5jIGZ1bmN0aW9uIG9wZW5MaW5rKG1kY0xpbms6IGFueSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgc0hyZWYgPSBhd2FpdCBtZGNMaW5rLmdldFRyaWdnZXJIcmVmKCk7XG5cdFx0XHRcdGlmICghc0hyZWYpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0YXdhaXQgbWRjTGluay5vcGVuKG9MaW5rKTtcblx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IHJldHJpZXZlIHRoZSBRdWlja1ZpZXcgUG9wb3ZlciBkaWFsb2dcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9MaW5rKTtcblx0XHRcdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9WaWV3KTtcblx0XHRcdFx0XHRjb25zdCBvU2hlbGxTZXJ2aWNlSGVscGVyID0gb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0XHRcdFx0Y29uc3Qgb1NoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VIZWxwZXIucGFyc2VTaGVsbEhhc2goc0hyZWYpO1xuXHRcdFx0XHRcdGNvbnN0IG9OYXZBcmdzID0ge1xuXHRcdFx0XHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRhY3Rpb246IG9TaGVsbEhhc2guYWN0aW9uXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0cGFyYW1zOiBvU2hlbGxIYXNoLnBhcmFtc1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRLZWVwQWxpdmVIZWxwZXIuc3RvcmVDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9ySGFzaChvVmlldywgb1NoZWxsSGFzaCk7XG5cblx0XHRcdFx0XHRpZiAoQ29tbW9uVXRpbHMuaXNTdGlja3lFZGl0TW9kZShvTGluaykgIT09IHRydWUpIHtcblx0XHRcdFx0XHRcdC8vVVJMIHBhcmFtcyBhbmQgeGFwcFN0YXRlIGhhcyBiZWVuIGdlbmVyYXRlZCBlYXJsaWVyIGhlbmNlIHVzaW5nIHRvRXh0ZXJuYWxcblx0XHRcdFx0XHRcdG9TaGVsbFNlcnZpY2VIZWxwZXIudG9FeHRlcm5hbChvTmF2QXJncyBhcyBhbnksIG9BcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzTmV3SHJlZiA9IGF3YWl0IG9TaGVsbFNlcnZpY2VIZWxwZXIuaHJlZkZvckV4dGVybmFsQXN5bmMob05hdkFyZ3MsIG9BcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdFx0XHRvcGVuV2luZG93KHNOZXdIcmVmKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdExvZy5lcnJvcihgRXJyb3Igd2hpbGUgcmV0aXJldmluZyBocmVmRm9yRXh0ZXJuYWwgOiAke29FcnJvcn1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHRyaWdnZXJpbmcgbGluayBIcmVmXCIsIG9FcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG9Tb3VyY2UuZ2V0RGVwZW5kZW50cygpICYmIG9Tb3VyY2UuZ2V0RGVwZW5kZW50cygpLmxlbmd0aCA+IDAgJiYgb0xpbmsuZ2V0UHJvcGVydHkoXCJ0ZXh0XCIpICE9PSBcIlwiKSB7XG5cdFx0XHRjb25zdCBvRmllbGRJbmZvID0gb1NvdXJjZS5nZXREZXBlbmRlbnRzKClbMF07XG5cdFx0XHRpZiAob0ZpZWxkSW5mbyAmJiBvRmllbGRJbmZvLmlzQShcInNhcC51aS5tZGMuTGlua1wiKSkge1xuXHRcdFx0XHRhd2FpdCBvcGVuTGluayhvRmllbGRJbmZvKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9MaW5rO1xuXHR9LFxuXHR1cGxvYWRTdHJlYW06IGZ1bmN0aW9uIChjb250cm9sbGVyOiBDb250cm9sbGVyLCBldmVudDogRXZlbnQpIHtcblx0XHRjb25zdCBmaWxlVXBsb2FkZXIgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBGaWxlVXBsb2FkZXIsXG5cdFx0XHRGRUNvbnRyb2xsZXIgPSBGaWVsZFJ1bnRpbWUuX2dldEV4dGVuc2lvbkNvbnRyb2xsZXIoY29udHJvbGxlciksXG5cdFx0XHRmaWxlV3JhcHBlciA9IGZpbGVVcGxvYWRlci5nZXRQYXJlbnQoKSBhcyB1bmtub3duIGFzIEZpbGVXcmFwcGVyLFxuXHRcdFx0dXBsb2FkVXJsID0gZmlsZVdyYXBwZXIuZ2V0VXBsb2FkVXJsKCk7XG5cblx0XHRpZiAodXBsb2FkVXJsICE9PSBcIlwiKSB7XG5cdFx0XHRmaWxlV3JhcHBlci5zZXRVSUJ1c3kodHJ1ZSk7XG5cblx0XHRcdC8vIHVzZSB1cGxvYWRVcmwgZnJvbSBGaWxlV3JhcHBlciB3aGljaCByZXR1cm5zIGEgY2Fub25pY2FsIFVSTFxuXHRcdFx0ZmlsZVVwbG9hZGVyLnNldFVwbG9hZFVybCh1cGxvYWRVcmwpO1xuXG5cdFx0XHRmaWxlVXBsb2FkZXIucmVtb3ZlQWxsSGVhZGVyUGFyYW1ldGVycygpO1xuXHRcdFx0Y29uc3QgdG9rZW4gPSAoZmlsZVVwbG9hZGVyLmdldE1vZGVsKCkgYXMgYW55KT8uZ2V0SHR0cEhlYWRlcnMoKVtcIlgtQ1NSRi1Ub2tlblwiXTtcblx0XHRcdGlmICh0b2tlbikge1xuXHRcdFx0XHRjb25zdCBoZWFkZXJQYXJhbWV0ZXJDU1JGVG9rZW4gPSBuZXcgRmlsZVVwbG9hZGVyUGFyYW1ldGVyKCk7XG5cdFx0XHRcdGhlYWRlclBhcmFtZXRlckNTUkZUb2tlbi5zZXROYW1lKFwieC1jc3JmLXRva2VuXCIpO1xuXHRcdFx0XHRoZWFkZXJQYXJhbWV0ZXJDU1JGVG9rZW4uc2V0VmFsdWUodG9rZW4pO1xuXHRcdFx0XHRmaWxlVXBsb2FkZXIuYWRkSGVhZGVyUGFyYW1ldGVyKGhlYWRlclBhcmFtZXRlckNTUkZUb2tlbik7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBlVGFnID0gKGZpbGVVcGxvYWRlci5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQgfCBudWxsKT8uZ2V0UHJvcGVydHkoXCJAb2RhdGEuZXRhZ1wiKTtcblx0XHRcdGlmIChlVGFnKSB7XG5cdFx0XHRcdGNvbnN0IGhlYWRlclBhcmFtZXRlckVUYWcgPSBuZXcgRmlsZVVwbG9hZGVyUGFyYW1ldGVyKCk7XG5cdFx0XHRcdGhlYWRlclBhcmFtZXRlckVUYWcuc2V0TmFtZShcIklmLU1hdGNoXCIpO1xuXHRcdFx0XHQvLyBJZ25vcmUgRVRhZyBpbiBjb2xsYWJvcmF0aW9uIGRyYWZ0XG5cdFx0XHRcdGhlYWRlclBhcmFtZXRlckVUYWcuc2V0VmFsdWUoQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5pc0Nvbm5lY3RlZChmaWxlVXBsb2FkZXIpID8gXCIqXCIgOiBlVGFnKTtcblx0XHRcdFx0ZmlsZVVwbG9hZGVyLmFkZEhlYWRlclBhcmFtZXRlcihoZWFkZXJQYXJhbWV0ZXJFVGFnKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGhlYWRlclBhcmFtZXRlckFjY2VwdCA9IG5ldyBGaWxlVXBsb2FkZXJQYXJhbWV0ZXIoKTtcblx0XHRcdGhlYWRlclBhcmFtZXRlckFjY2VwdC5zZXROYW1lKFwiQWNjZXB0XCIpO1xuXHRcdFx0aGVhZGVyUGFyYW1ldGVyQWNjZXB0LnNldFZhbHVlKFwiYXBwbGljYXRpb24vanNvblwiKTtcblx0XHRcdGZpbGVVcGxvYWRlci5hZGRIZWFkZXJQYXJhbWV0ZXIoaGVhZGVyUGFyYW1ldGVyQWNjZXB0KTtcblxuXHRcdFx0Ly8gc3luY2hyb25pemUgdXBsb2FkIHdpdGggb3RoZXIgcmVxdWVzdHNcblx0XHRcdGNvbnN0IHVwbG9hZFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55LCByZWplY3Q6IGFueSkgPT4ge1xuXHRcdFx0XHR0aGlzLnVwbG9hZFByb21pc2VzID0gdGhpcy51cGxvYWRQcm9taXNlcyB8fCB7fTtcblx0XHRcdFx0dGhpcy51cGxvYWRQcm9taXNlc1tmaWxlVXBsb2FkZXIuZ2V0SWQoKV0gPSB7XG5cdFx0XHRcdFx0cmVzb2x2ZTogcmVzb2x2ZSxcblx0XHRcdFx0XHRyZWplY3Q6IHJlamVjdFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRmaWxlVXBsb2FkZXIudXBsb2FkKCk7XG5cdFx0XHR9KTtcblx0XHRcdEZFQ29udHJvbGxlci5fZWRpdEZsb3cuc3luY1Rhc2sodXBsb2FkUHJvbWlzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE1lc3NhZ2VCb3guZXJyb3IoUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9GSUVMRF9GSUxFVVBMT0FERVJfQUJPUlRFRF9URVhUXCIpKTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlVXBsb2FkQ29tcGxldGU6IGZ1bmN0aW9uIChcblx0XHRldmVudDogRXZlbnQsXG5cdFx0cHJvcGVydHlGaWxlTmFtZTogeyBwYXRoOiBzdHJpbmcgfSB8IHVuZGVmaW5lZCxcblx0XHRwcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0XHRjb250cm9sbGVyOiBDb250cm9sbGVyXG5cdCkge1xuXHRcdGNvbnN0IHN0YXR1cyA9IGV2ZW50LmdldFBhcmFtZXRlcihcInN0YXR1c1wiKSxcblx0XHRcdGZpbGVVcGxvYWRlciA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIEZpbGVVcGxvYWRlcixcblx0XHRcdGZpbGVXcmFwcGVyID0gZmlsZVVwbG9hZGVyLmdldFBhcmVudCgpIGFzIHVua25vd24gYXMgRmlsZVdyYXBwZXI7XG5cblx0XHRmaWxlV3JhcHBlci5zZXRVSUJ1c3koZmFsc2UpO1xuXG5cdFx0Y29uc3QgY29udGV4dCA9IGZpbGVVcGxvYWRlci5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQgfCBudWxsO1xuXHRcdGlmIChzdGF0dXMgPT09IDAgfHwgc3RhdHVzID49IDQwMCkge1xuXHRcdFx0dGhpcy5fZGlzcGxheU1lc3NhZ2VGb3JGYWlsZWRVcGxvYWQoZXZlbnQpO1xuXHRcdFx0dGhpcy51cGxvYWRQcm9taXNlc1tmaWxlVXBsb2FkZXIuZ2V0SWQoKV0ucmVqZWN0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG5ld0VUYWcgPSBldmVudC5nZXRQYXJhbWV0ZXIoXCJoZWFkZXJzXCIpLmV0YWc7XG5cblx0XHRcdGlmIChuZXdFVGFnKSB7XG5cdFx0XHRcdC8vIHNldCBuZXcgZXRhZyBmb3IgZmlsZW5hbWUgdXBkYXRlLCBidXQgd2l0aG91dCBzZW5kaW5nIHBhdGNoIHJlcXVlc3Rcblx0XHRcdFx0Y29udGV4dD8uc2V0UHJvcGVydHkoXCJAb2RhdGEuZXRhZ1wiLCBuZXdFVGFnLCBudWxsIGFzIGFueSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHNldCBmaWxlbmFtZSBmb3IgbGluayB0ZXh0XG5cdFx0XHRpZiAocHJvcGVydHlGaWxlTmFtZT8ucGF0aCkge1xuXHRcdFx0XHRjb250ZXh0Py5zZXRQcm9wZXJ0eShwcm9wZXJ0eUZpbGVOYW1lLnBhdGgsIGZpbGVVcGxvYWRlci5nZXRWYWx1ZSgpKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaW52YWxpZGF0ZSB0aGUgcHJvcGVydHkgdGhhdCBub3QgZ2V0cyB1cGRhdGVkIG90aGVyd2lzZVxuXHRcdFx0Y29udGV4dD8uc2V0UHJvcGVydHkocHJvcGVydHlQYXRoLCBudWxsLCBudWxsIGFzIGFueSk7XG5cdFx0XHRjb250ZXh0Py5zZXRQcm9wZXJ0eShwcm9wZXJ0eVBhdGgsIHVuZGVmaW5lZCwgbnVsbCBhcyBhbnkpO1xuXG5cdFx0XHR0aGlzLl9jYWxsU2lkZUVmZmVjdHNGb3JTdHJlYW0oZXZlbnQsIGZpbGVXcmFwcGVyLCBjb250cm9sbGVyKTtcblxuXHRcdFx0dGhpcy51cGxvYWRQcm9taXNlc1tmaWxlVXBsb2FkZXIuZ2V0SWQoKV0ucmVzb2x2ZSgpO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzLnVwbG9hZFByb21pc2VzW2ZpbGVVcGxvYWRlci5nZXRJZCgpXTtcblxuXHRcdC8vIENvbGxhYm9yYXRpb24gRHJhZnQgQWN0aXZpdHkgU3luY1xuXHRcdGNvbnN0IGlzQ29sbGFib3JhdGlvbkVuYWJsZWQgPSBDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKGZpbGVVcGxvYWRlcik7XG5cdFx0aWYgKCFpc0NvbGxhYm9yYXRpb25FbmFibGVkIHx8ICFjb250ZXh0KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IFtgJHtjb250ZXh0LmdldFBhdGgoKX0vJHtwcm9wZXJ0eVBhdGh9YF07XG5cdFx0aWYgKHByb3BlcnR5RmlsZU5hbWU/LnBhdGgpIHtcblx0XHRcdG5vdGlmaWNhdGlvbkRhdGEucHVzaChgJHtjb250ZXh0LmdldFBhdGgoKX0vJHtwcm9wZXJ0eUZpbGVOYW1lLnBhdGh9YCk7XG5cdFx0fVxuXG5cdFx0bGV0IGJpbmRpbmcgPSBjb250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHRpZiAoIWJpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhmaWxlVXBsb2FkZXIpO1xuXHRcdFx0YmluZGluZyA9IChvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIFY0Q29udGV4dCkuZ2V0QmluZGluZygpO1xuXHRcdH1cblx0XHRpZiAoYmluZGluZy5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRiaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcInBhdGNoQ29tcGxldGVkXCIsICgpID0+IHtcblx0XHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKGZpbGVXcmFwcGVyLCBBY3Rpdml0eS5DaGFuZ2UsIG5vdGlmaWNhdGlvbkRhdGEpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChmaWxlV3JhcHBlciwgQWN0aXZpdHkuQ2hhbmdlLCBub3RpZmljYXRpb25EYXRhKTtcblx0XHR9XG5cdH0sXG5cblx0X2Rpc3BsYXlNZXNzYWdlRm9yRmFpbGVkVXBsb2FkOiBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHQvLyBoYW5kbGluZyBvZiBiYWNrZW5kIGVycm9yc1xuXHRcdGNvbnN0IHNFcnJvciA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJyZXNwb25zZVJhd1wiKSB8fCBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicmVzcG9uc2VcIik7XG5cdFx0bGV0IHNNZXNzYWdlVGV4dCwgb0Vycm9yO1xuXHRcdHRyeSB7XG5cdFx0XHRvRXJyb3IgPSBzRXJyb3IgJiYgSlNPTi5wYXJzZShzRXJyb3IpO1xuXHRcdFx0c01lc3NhZ2VUZXh0ID0gb0Vycm9yLmVycm9yICYmIG9FcnJvci5lcnJvci5tZXNzYWdlO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHNNZXNzYWdlVGV4dCA9IHNFcnJvciB8fCBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9BQk9SVEVEX1RFWFRcIik7XG5cdFx0fVxuXHRcdE1lc3NhZ2VCb3guZXJyb3Ioc01lc3NhZ2VUZXh0KTtcblx0fSxcblxuXHRyZW1vdmVTdHJlYW06IGZ1bmN0aW9uIChldmVudDogRXZlbnQsIHByb3BlcnR5RmlsZU5hbWU6IHsgcGF0aDogc3RyaW5nIH0gfCB1bmRlZmluZWQsIHByb3BlcnR5UGF0aDogc3RyaW5nLCBjb250cm9sbGVyOiBDb250cm9sbGVyKSB7XG5cdFx0Y29uc3QgZGVsZXRlQnV0dG9uID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgQnV0dG9uO1xuXHRcdGNvbnN0IGZpbGVXcmFwcGVyID0gZGVsZXRlQnV0dG9uLmdldFBhcmVudCgpIGFzIHVua25vd24gYXMgRmlsZVdyYXBwZXI7XG5cdFx0Y29uc3QgY29udGV4dCA9IGZpbGVXcmFwcGVyLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblxuXHRcdC8vIHN0cmVhbXMgYXJlIHJlbW92ZWQgYnkgYXNzaWduaW5nIHRoZSBudWxsIHZhbHVlXG5cdFx0Y29udGV4dC5zZXRQcm9wZXJ0eShwcm9wZXJ0eVBhdGgsIG51bGwpO1xuXHRcdC8vIFdoZW4gc2V0dGluZyB0aGUgcHJvcGVydHkgdG8gbnVsbCwgdGhlIHVwbG9hZFVybCAoQEBNT0RFTC5mb3JtYXQpIGlzIHNldCB0byBcIlwiIGJ5IHRoZSBtb2RlbFxuXHRcdC8vXHR3aXRoIHRoYXQgYW5vdGhlciB1cGxvYWQgaXMgbm90IHBvc3NpYmxlIGJlZm9yZSByZWZyZXNoaW5nIHRoZSBwYWdlXG5cdFx0Ly8gKHJlZnJlc2hpbmcgdGhlIHBhZ2Ugd291bGQgcmVjcmVhdGUgdGhlIFVSTClcblx0XHQvL1x0VGhpcyBpcyB0aGUgd29ya2Fyb3VuZDpcblx0XHQvL1x0V2Ugc2V0IHRoZSBwcm9wZXJ0eSB0byB1bmRlZmluZWQgb25seSBvbiB0aGUgZnJvbnRlbmQgd2hpY2ggd2lsbCByZWNyZWF0ZSB0aGUgdXBsb2FkVXJsXG5cdFx0Y29udGV4dC5zZXRQcm9wZXJ0eShwcm9wZXJ0eVBhdGgsIHVuZGVmaW5lZCwgbnVsbCBhcyBhbnkpO1xuXG5cdFx0dGhpcy5fY2FsbFNpZGVFZmZlY3RzRm9yU3RyZWFtKGV2ZW50LCBmaWxlV3JhcHBlciwgY29udHJvbGxlcik7XG5cblx0XHQvLyBDb2xsYWJvcmF0aW9uIERyYWZ0IEFjdGl2aXR5IFN5bmNcblx0XHRjb25zdCBiQ29sbGFib3JhdGlvbkVuYWJsZWQgPSBDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKGRlbGV0ZUJ1dHRvbik7XG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0bGV0IGJpbmRpbmcgPSBjb250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHRcdGlmICghYmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoZGVsZXRlQnV0dG9uKTtcblx0XHRcdFx0YmluZGluZyA9IChvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIFY0Q29udGV4dCkuZ2V0QmluZGluZygpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBkYXRhID0gW2Ake2NvbnRleHQuZ2V0UGF0aCgpfS8ke3Byb3BlcnR5UGF0aH1gXTtcblx0XHRcdGlmIChwcm9wZXJ0eUZpbGVOYW1lPy5wYXRoKSB7XG5cdFx0XHRcdGRhdGEucHVzaChgJHtjb250ZXh0LmdldFBhdGgoKX0vJHtwcm9wZXJ0eUZpbGVOYW1lLnBhdGh9YCk7XG5cdFx0XHR9XG5cdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQoZGVsZXRlQnV0dG9uLCBBY3Rpdml0eS5MaXZlQ2hhbmdlLCBkYXRhKTtcblxuXHRcdFx0YmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJwYXRjaENvbXBsZXRlZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChkZWxldGVCdXR0b24sIEFjdGl2aXR5LkNoYW5nZSwgZGF0YSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0X2NhbGxTaWRlRWZmZWN0c0ZvclN0cmVhbTogZnVuY3Rpb24gKG9FdmVudDogYW55LCBvQ29udHJvbDogYW55LCBvQ29udHJvbGxlcjogYW55KSB7XG5cdFx0Y29uc3Qgb0ZFQ29udHJvbGxlciA9IEZpZWxkUnVudGltZS5fZ2V0RXh0ZW5zaW9uQ29udHJvbGxlcihvQ29udHJvbGxlcik7XG5cdFx0aWYgKG9Db250cm9sICYmIG9Db250cm9sLmdldEJpbmRpbmdDb250ZXh0KCkuaXNUcmFuc2llbnQoKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob0NvbnRyb2wpIHtcblx0XHRcdG9FdmVudC5vU291cmNlID0gb0NvbnRyb2w7XG5cdFx0fVxuXHRcdG9GRUNvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmhhbmRsZUZpZWxkQ2hhbmdlKG9FdmVudCwgdGhpcy5nZXRGaWVsZFN0YXRlT25DaGFuZ2Uob0V2ZW50KS5zdGF0ZVtcInZhbGlkaXR5XCJdKTtcblx0fSxcblxuXHRnZXRJY29uRm9yTWltZVR5cGU6IGZ1bmN0aW9uIChzTWltZVR5cGU6IGFueSkge1xuXHRcdHJldHVybiBJY29uUG9vbC5nZXRJY29uRm9yTWltZVR5cGUoc01pbWVUeXBlKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHJldHJpZXZlIHRleHQgZnJvbSB2YWx1ZSBsaXN0IGZvciBEYXRhRmllbGQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSByZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0XG5cdCAqIEBwYXJhbSBzUHJvcGVydHlWYWx1ZSBUaGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGRhdGFmaWVsZFxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5RnVsbFBhdGggVGhlIHByb3BlcnR5IGZ1bGwgcGF0aCdzXG5cdCAqIEBwYXJhbSBzRGlzcGxheUZvcm1hdCBUaGUgZGlzcGxheSBmb3JtYXQgZm9yIHRoZSBkYXRhZmllbGRcblx0ICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCB2YWx1ZSBpbiBjb3JyZXNwb25kaW5nIGRpc3BsYXkgZm9ybWF0LlxuXHQgKi9cblx0cmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdDogZnVuY3Rpb24gKHNQcm9wZXJ0eVZhbHVlOiBzdHJpbmcsIHNQcm9wZXJ0eUZ1bGxQYXRoOiBzdHJpbmcsIHNEaXNwbGF5Rm9ybWF0OiBzdHJpbmcpIHtcblx0XHRsZXQgc1RleHRQcm9wZXJ0eTogc3RyaW5nO1xuXHRcdGxldCBvTWV0YU1vZGVsO1xuXHRcdGxldCBzUHJvcGVydHlOYW1lOiBzdHJpbmc7XG5cdFx0aWYgKHNQcm9wZXJ0eVZhbHVlKSB7XG5cdFx0XHRvTWV0YU1vZGVsID0gQ29tbW9uSGVscGVyLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0c1Byb3BlcnR5TmFtZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQcm9wZXJ0eUZ1bGxQYXRofUBzYXB1aS5uYW1lYCk7XG5cdFx0XHRyZXR1cm4gb01ldGFNb2RlbFxuXHRcdFx0XHQucmVxdWVzdFZhbHVlTGlzdEluZm8oc1Byb3BlcnR5RnVsbFBhdGgsIHRydWUpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChtVmFsdWVMaXN0SW5mbzogYW55KSB7XG5cdFx0XHRcdFx0Ly8gdGFrZSB0aGUgXCJcIiBvbmUgaWYgZXhpc3RzLCBvdGhlcndpc2UgdGFrZSB0aGUgZmlyc3Qgb25lIGluIHRoZSBvYmplY3QgVE9ETzogdG8gYmUgZGlzY3Vzc2VkXG5cdFx0XHRcdFx0Y29uc3Qgb1ZhbHVlTGlzdEluZm8gPSBtVmFsdWVMaXN0SW5mb1ttVmFsdWVMaXN0SW5mb1tcIlwiXSA/IFwiXCIgOiBPYmplY3Qua2V5cyhtVmFsdWVMaXN0SW5mbylbMF1dO1xuXHRcdFx0XHRcdGNvbnN0IG9WYWx1ZUxpc3RNb2RlbCA9IG9WYWx1ZUxpc3RJbmZvLiRtb2RlbDtcblx0XHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsVmFsdWVMaXN0ID0gb1ZhbHVlTGlzdE1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRcdGNvbnN0IG9QYXJhbVdpdGhLZXkgPSBvVmFsdWVMaXN0SW5mby5QYXJhbWV0ZXJzLmZpbmQoZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9QYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkgJiYgb1BhcmFtZXRlci5Mb2NhbERhdGFQcm9wZXJ0eS4kUHJvcGVydHlQYXRoID09PSBzUHJvcGVydHlOYW1lO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGlmIChvUGFyYW1XaXRoS2V5ICYmICFvUGFyYW1XaXRoS2V5LlZhbHVlTGlzdFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoYEluY29uc2lzdGVudCB2YWx1ZSBoZWxwIGFubm90YXRpb24gZm9yICR7c1Byb3BlcnR5TmFtZX1gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb01ldGFNb2RlbFZhbHVlTGlzdC5nZXRPYmplY3QoXG5cdFx0XHRcdFx0XHRgLyR7b1ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9LyR7b1BhcmFtV2l0aEtleS5WYWx1ZUxpc3RQcm9wZXJ0eX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgXG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdGlmIChvVGV4dEFubm90YXRpb24gJiYgb1RleHRBbm5vdGF0aW9uLiRQYXRoKSB7XG5cdFx0XHRcdFx0XHRzVGV4dFByb3BlcnR5ID0gb1RleHRBbm5vdGF0aW9uLiRQYXRoO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0ZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0XHRwYXRoOiBvUGFyYW1XaXRoS2V5LlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRvcGVyYXRvcjogXCJFUVwiLFxuXHRcdFx0XHRcdFx0XHR2YWx1ZTE6IHNQcm9wZXJ0eVZhbHVlXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvbnN0IG9MaXN0QmluZGluZyA9IG9WYWx1ZUxpc3RNb2RlbC5iaW5kTGlzdChgLyR7b1ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9YCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG9GaWx0ZXIsIHtcblx0XHRcdFx0XHRcdFx0JHNlbGVjdDogc1RleHRQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0xpc3RCaW5kaW5nLnJlcXVlc3RDb250ZXh0cygwLCAyKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0Rpc3BsYXlGb3JtYXQgPSBcIlZhbHVlXCI7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1Byb3BlcnR5VmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAoYUNvbnRleHRzOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzRGVzY3JpcHRpb24gPSBzVGV4dFByb3BlcnR5ID8gYUNvbnRleHRzWzBdPy5nZXRPYmplY3QoKVtzVGV4dFByb3BlcnR5XSA6IFwiXCI7XG5cdFx0XHRcdFx0c3dpdGNoIChzRGlzcGxheUZvcm1hdCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzRGVzY3JpcHRpb247XG5cdFx0XHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKS5nZXRUZXh0KFwiQ19GT1JNQVRfRk9SX1RFWFRfQVJSQU5HRU1FTlRcIiwgW1xuXHRcdFx0XHRcdFx0XHRcdHNEZXNjcmlwdGlvbixcblx0XHRcdFx0XHRcdFx0XHRzUHJvcGVydHlWYWx1ZVxuXHRcdFx0XHRcdFx0XHRdKTtcblx0XHRcdFx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJDX0ZPUk1BVF9GT1JfVEVYVF9BUlJBTkdFTUVOVFwiLCBbXG5cdFx0XHRcdFx0XHRcdFx0c1Byb3BlcnR5VmFsdWUsXG5cdFx0XHRcdFx0XHRcdFx0c0Rlc2NyaXB0aW9uXG5cdFx0XHRcdFx0XHRcdF0pO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNQcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IHNNc2cgPVxuXHRcdFx0XHRcdFx0b0Vycm9yLnN0YXR1cyAmJiBvRXJyb3Iuc3RhdHVzID09PSA0MDRcblx0XHRcdFx0XHRcdFx0PyBgTWV0YWRhdGEgbm90IGZvdW5kICgke29FcnJvci5zdGF0dXN9KSBmb3IgdmFsdWUgaGVscCBvZiBwcm9wZXJ0eSAke3NQcm9wZXJ0eUZ1bGxQYXRofWBcblx0XHRcdFx0XHRcdFx0OiBvRXJyb3IubWVzc2FnZTtcblx0XHRcdFx0XHRMb2cuZXJyb3Ioc01zZyk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gc1Byb3BlcnR5VmFsdWU7XG5cdH0sXG5cblx0aGFuZGxlVHlwZU1pc3NtYXRjaDogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0TWVzc2FnZUJveC5lcnJvcihSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9XUk9OR19NSU1FVFlQRVwiKSwge1xuXHRcdFx0ZGV0YWlsczpcblx0XHRcdFx0YDxwPjxzdHJvbmc+JHtSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9XUk9OR19NSU1FVFlQRV9ERVRBSUxTX1NFTEVDVEVEXCIpfTwvc3Ryb25nPjwvcD4ke1xuXHRcdFx0XHRcdG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkubWltZVR5cGVcblx0XHRcdFx0fTxicj48YnI+YCArXG5cdFx0XHRcdGA8cD48c3Ryb25nPiR7UmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9GSUVMRF9GSUxFVVBMT0FERVJfV1JPTkdfTUlNRVRZUEVfREVUQUlMU19BTExPV0VEXCIpfTwvc3Ryb25nPjwvcD4ke29FdmVudFxuXHRcdFx0XHRcdC5nZXRTb3VyY2UoKVxuXHRcdFx0XHRcdC5nZXRNaW1lVHlwZSgpXG5cdFx0XHRcdFx0LnRvU3RyaW5nKClcblx0XHRcdFx0XHQucmVwbGFjZUFsbChcIixcIiwgXCIsIFwiKX1gLFxuXHRcdFx0Y29udGVudFdpZHRoOiBcIjE1MHB4XCJcblx0XHR9IGFzIGFueSk7XG5cdH0sXG5cblx0aGFuZGxlRmlsZVNpemVFeGNlZWQ6IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSAvKmlGaWxlU2l6ZTogYW55Ki8pIHtcblx0XHRNZXNzYWdlQm94LmVycm9yKFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fRklFTERfRklMRVVQTE9BREVSX0ZJTEVfVE9PX0JJR1wiLCBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0TWF4aW11bUZpbGVTaXplKCkudG9GaXhlZCgzKSksIHtcblx0XHRcdGNvbnRlbnRXaWR0aDogXCIxNTBweFwiXG5cdFx0fSBhcyBhbnkpO1xuXHR9LFxuXG5cdF9nZXRFeHRlbnNpb25Db250cm9sbGVyOiBmdW5jdGlvbiAob0NvbnRyb2xsZXI6IGFueSkge1xuXHRcdHJldHVybiBvQ29udHJvbGxlci5pc0EoXCJzYXAuZmUuY29yZS5FeHRlbnNpb25BUElcIikgPyBvQ29udHJvbGxlci5fY29udHJvbGxlciA6IG9Db250cm9sbGVyO1xuXHR9XG59O1xuXG4vKipcbiAqIEBnbG9iYWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgRmllbGRSdW50aW1lO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQStCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQSx1QkFBdUIsQ0FBQ0MsS0FBYyxFQUEwQztJQUN4RixJQUFJQyxPQUFPLEdBQUlELEtBQUssQ0FBQ0UsaUJBQWlCLEVBQUUsQ0FBYUMsVUFBVSxFQUFFO0lBRWpFLElBQUksQ0FBQ0YsT0FBTyxDQUFDRyxHQUFHLENBQUMsd0NBQXdDLENBQUMsRUFBRTtNQUMzRCxNQUFNQyxLQUFLLEdBQUdDLFdBQVcsQ0FBQ0MsYUFBYSxDQUFDUCxLQUFLLENBQUM7TUFDOUNDLE9BQU8sR0FBSUksS0FBSyxDQUFDSCxpQkFBaUIsRUFBRSxDQUFlQyxVQUFVLEVBQUU7SUFDaEU7SUFFQSxPQUFPRixPQUFPO0VBQ2Y7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTU8sWUFBWSxHQUFHO0lBQ3BCQyxtQkFBbUIsRUFBRUMsU0FBZ0I7SUFDckNDLGNBQWMsRUFBRUQsU0FBZ0I7SUFFaEM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0UsNkJBQTZCLEVBQUUsVUFBVUMsT0FBZ0IsRUFBRUMsV0FBMkIsRUFBRUMsUUFBZ0IsRUFBRTtNQUN6RyxJQUFJRCxXQUFXLENBQUNFLFFBQVEsRUFBRTtRQUN6QixJQUFJQyxlQUFlLEdBQUdKLE9BQU8sQ0FBQ1gsaUJBQWlCLEVBQWE7UUFDNUQsTUFBTUcsS0FBSyxHQUFHQyxXQUFXLENBQUNDLGFBQWEsQ0FBQ00sT0FBTyxDQUFDO1VBQy9DSyxVQUFVLEdBQUdELGVBQWUsQ0FB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