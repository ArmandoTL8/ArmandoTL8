/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution"], function (CommonUtils, messageHandling, ClassSupport, Core, ControllerExtension, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * A controller extension offering message handling.
   *
   * @hideconstructor
   * @public
   * @experimental As of version 1.90.0
   * @since 1.90.0
   */
  let MessageHandler = (_dec = defineUI5Class("sap.fe.core.controllerextensions.MessageHandler"), _dec2 = privateExtension(), _dec3 = extensible(OverrideExecution.Instead), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(MessageHandler, _ControllerExtension);
    function MessageHandler() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = MessageHandler.prototype;
    /**
     * Determines whether or not bound messages are shown in the message dialog.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.Instead}.
     *
     * If the bound messages are shown to the user with a different control like the (TODO:Link) MessageButton
     * this method has to be overridden.
     *
     * @returns Determines whether or not bound messages are shown in the message dialog.
     * @private
     */
    _proto.getShowBoundMessagesInMessageDialog = function getShowBoundMessagesInMessageDialog() {
      return true;
    }

    /**
     * Shows a message dialog with transition messages if there are any.
     * The message dialog is shown as a modal dialog. Once the user confirms the dialog, all transition messages
     * are removed from the message model. If there is more than one message, a list of messages is shown. The user
     * can filter on message types and can display details as well as the long text. If there is one message,
     * the dialog immediately shows the details of the message. If there is just one success message, a message
     * toast is shown instead.
     *
     * @param mParameters PRIVATE
     * @returns A promise that is resolved once the user closes the dialog. If there are no messages
     * to be shown, the promise is resolved immediately
     * @alias sap.fe.core.controllerextensions.MessageHandler#showMessageDialog
     * @public
     * @experimental As of version 1.90.0
     * @since 1.90.0
     */;
    _proto.showMessageDialog = function showMessageDialog(mParameters) {
      const customMessages = mParameters && mParameters.customMessages ? mParameters.customMessages : undefined,
        oOPInternalBindingContext = this.base.getView().getBindingContext("internal");
      const viewType = this.base.getView().getViewData().converterType;
      // set isActionParameterDialog open so that it can be used in the controller extension to decide whether message dialog should open or not
      if (mParameters && mParameters.isActionParameterDialogOpen && oOPInternalBindingContext) {
        oOPInternalBindingContext.setProperty("isActionParameterDialogOpen", true);
      }
      const bShowBoundMessages = this.getShowBoundMessagesInMessageDialog();
      const oBindingContext = mParameters && mParameters.context ? mParameters.context : this.getView().getBindingContext();
      //const bEtagMessage = mParameters && mParameters.bHasEtagMessage;
      // reset  isActionParameterDialogOpen
      // cannot do this operations.js since it is not aware of the view
      if (oOPInternalBindingContext) {
        oOPInternalBindingContext.setProperty("isActionParameterDialogOpen", false);
      }
      return new Promise(function (resolve, reject) {
        // we have to set a timeout to be able to access the most recent messages
        setTimeout(function () {
          // TODO: great API - will be changed later
          messageHandling.showUnboundMessages(customMessages, oBindingContext, bShowBoundMessages, mParameters === null || mParameters === void 0 ? void 0 : mParameters.concurrentEditFlag, mParameters === null || mParameters === void 0 ? void 0 : mParameters.control, mParameters === null || mParameters === void 0 ? void 0 : mParameters.sActionName, undefined, mParameters === null || mParameters === void 0 ? void 0 : mParameters.onBeforeShowMessage, viewType).then(resolve).catch(reject);
        }, 0);
      });
    }

    /**
     * You can remove the existing transition message from the message model with this method.
     * With every user interaction that causes server communication (like clicking on an action, changing data),
     * this method removes the existing transition messages from the message model.
     *
     * @param [keepBoundMessage] Checks if the bound transition messages are not to be removed
     * @param keepUnboundMessage
     * @param sPathToBeRemoved
     * @alias sap.fe.core.controllerextensions.MessageHandler#removesTransitionMessages
     * @private
     */;
    _proto.removeTransitionMessages = function removeTransitionMessages(keepBoundMessage, keepUnboundMessage, sPathToBeRemoved) {
      if (!keepBoundMessage) {
        messageHandling.removeBoundTransitionMessages(sPathToBeRemoved);
      }
      if (!keepUnboundMessage) {
        messageHandling.removeUnboundTransitionMessages();
      }
    }

    /**
     * Method that returns all the parameters needed to handle the navigation to the error page.
     *
     * @param mParameters
     * @returns The parameters necessary for the navigation to the error page
     * @alias sap.fe.core.controllerextensions.MessageHandler#_checkNavigationToErrorPage
     * @private
     */;
    _proto._checkNavigationToErrorPage = function _checkNavigationToErrorPage(mParameters) {
      const aUnboundMessages = messageHandling.getMessages();
      const bShowBoundTransitionMessages = this.getShowBoundMessagesInMessageDialog();
      const aBoundTransitionMessages = bShowBoundTransitionMessages ? messageHandling.getMessages(true, true) : [];
      const aCustomMessages = mParameters && mParameters.customMessages ? mParameters.customMessages : [];
      const bIsStickyEditMode = CommonUtils.isStickyEditMode(this.base.getView());
      let mMessagePageParameters;

      // TODO: Stick mode check is okay as long as the controller extension is used with sap.fe.core and sap.fe.core.AppComponent.
      // It might be better to provide an extension to the consumer of the controller extension to provide this value.

      // The message page can only show 1 message today, so we navigate to it when :
      // 1. There are no bound transition messages to show,
      // 2. There are no custom messages to show, &
      // 3. There is exactly 1 unbound message in the message model with statusCode=503 and retry-After available
      // 4. retryAfter is greater than 120 seconds
      //
      // In Addition, navigating away from a sticky session will destroy the session so we do not navigate to message page for now.
      // TODO: check if navigation should be done in sticky edit mode.
      if (mParameters && mParameters.isDataReceivedError) {
        mMessagePageParameters = {
          title: mParameters.title,
          description: mParameters.description,
          navigateBackToOrigin: true,
          errorType: "PageNotFound"
        };
      } else if (!bIsStickyEditMode && !aBoundTransitionMessages.length && !aCustomMessages.length && (aUnboundMessages.length === 1 || mParameters && mParameters.isInitialLoad503Error)) {
        const oMessage = aUnboundMessages[0],
          oTechnicalDetails = oMessage.getTechnicalDetails();
        let sRetryAfterMessage;
        if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503) {
          if (oTechnicalDetails.retryAfter) {
            const iSecondsBeforeRetry = this._getSecondsBeforeRetryAfter(oTechnicalDetails.retryAfter);
            if (iSecondsBeforeRetry > 120) {
              // TODO: For now let's keep getRetryAfterMessage in messageHandling because it is needed also by the dialog.
              // We can plan to move this and the dialog logic both to messageHandler controller extension if required.
              sRetryAfterMessage = messageHandling.getRetryAfterMessage(oMessage);
              mMessagePageParameters = {
                description: sRetryAfterMessage ? `${sRetryAfterMessage} ${oMessage.getMessage()}` : oMessage.getMessage(),
                navigateBackToOrigin: true,
                errorType: "UnableToLoad"
              };
            }
          } else {
            sRetryAfterMessage = messageHandling.getRetryAfterMessage(oMessage);
            mMessagePageParameters = {
              description: sRetryAfterMessage ? `${sRetryAfterMessage} ${oMessage.getMessage()}` : oMessage.getMessage(),
              navigateBackToOrigin: true,
              errorType: "UnableToLoad"
            };
          }
        }
      }
      return mMessagePageParameters;
    };
    _proto._getSecondsBeforeRetryAfter = function _getSecondsBeforeRetryAfter(dRetryAfter) {
      const dCurrentDateTime = new Date(),
        iCurrentDateTimeInMilliSeconds = dCurrentDateTime.getTime(),
        iRetryAfterDateTimeInMilliSeconds = dRetryAfter.getTime(),
        iSecondsBeforeRetry = (iRetryAfterDateTimeInMilliSeconds - iCurrentDateTimeInMilliSeconds) / 1000;
      return iSecondsBeforeRetry;
    }
    /**
     * Shows a message page or a message dialog based on the messages in the message dialog.
     *
     * @param [mParameters]
     * @returns A promise that is resolved once the user closes the message dialog or when navigation to the message page is complete. If there are no messages
     * to be shown, the promise is resolved immediately
     * @private
     */;
    _proto.showMessages = async function showMessages(mParameters) {
      const oAppComponent = CommonUtils.getAppComponent(this.getView());
      let mMessagePageParameters;
      if (!oAppComponent._isFclEnabled()) {
        mMessagePageParameters = this._checkNavigationToErrorPage(mParameters);
      }
      if (mMessagePageParameters) {
        // navigate to message page.
        // handler before page navigation is triggered, for example to close the action parameter dialog
        if (mParameters && mParameters.messagePageNavigationCallback) {
          mParameters.messagePageNavigationCallback();
        }
        mMessagePageParameters.handleShellBack = !(mParameters && mParameters.shellBack);
        // TODO: Use Illustrated message instead of normal message page
        // TODO: Return value needs to provided but since this function is private for now hence we can skip this.
        this.removeTransitionMessages();
        const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
        if (this.base._routing) {
          return new Promise((resolve, reject) => {
            // we have to set a timeout to be able to access the most recent messages
            setTimeout(() => {
              // TODO: great API - will be changed later
              this.base._routing.navigateToMessagePage(mParameters && mParameters.isDataReceivedError ? oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR") : oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE"), mMessagePageParameters).then(resolve).catch(reject);
            }, 0);
          });
        }
      } else {
        // navigate to message dialog
        return this.showMessageDialog(mParameters);
      }
    };
    return MessageHandler;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "getShowBoundMessagesInMessageDialog", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "getShowBoundMessagesInMessageDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "showMessageDialog", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "showMessageDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeTransitionMessages", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "removeTransitionMessages"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "showMessages", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "showMessages"), _class2.prototype)), _class2)) || _class);
  return MessageHandler;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlSGFuZGxlciIsImRlZmluZVVJNUNsYXNzIiwicHJpdmF0ZUV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImdldFNob3dCb3VuZE1lc3NhZ2VzSW5NZXNzYWdlRGlhbG9nIiwic2hvd01lc3NhZ2VEaWFsb2ciLCJtUGFyYW1ldGVycyIsImN1c3RvbU1lc3NhZ2VzIiwidW5kZWZpbmVkIiwib09QSW50ZXJuYWxCaW5kaW5nQ29udGV4dCIsImJhc2UiLCJnZXRWaWV3IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJ2aWV3VHlwZSIsImdldFZpZXdEYXRhIiwiY29udmVydGVyVHlwZSIsImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3BlbiIsInNldFByb3BlcnR5IiwiYlNob3dCb3VuZE1lc3NhZ2VzIiwib0JpbmRpbmdDb250ZXh0IiwiY29udGV4dCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic2V0VGltZW91dCIsIm1lc3NhZ2VIYW5kbGluZyIsInNob3dVbmJvdW5kTWVzc2FnZXMiLCJjb25jdXJyZW50RWRpdEZsYWciLCJjb250cm9sIiwic0FjdGlvbk5hbWUiLCJvbkJlZm9yZVNob3dNZXNzYWdlIiwidGhlbiIsImNhdGNoIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwia2VlcEJvdW5kTWVzc2FnZSIsImtlZXBVbmJvdW5kTWVzc2FnZSIsInNQYXRoVG9CZVJlbW92ZWQiLCJyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyIsInJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJfY2hlY2tOYXZpZ2F0aW9uVG9FcnJvclBhZ2UiLCJhVW5ib3VuZE1lc3NhZ2VzIiwiZ2V0TWVzc2FnZXMiLCJiU2hvd0JvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwiYUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwiYUN1c3RvbU1lc3NhZ2VzIiwiYklzU3RpY2t5RWRpdE1vZGUiLCJDb21tb25VdGlscyIsImlzU3RpY2t5RWRpdE1vZGUiLCJtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzIiwiaXNEYXRhUmVjZWl2ZWRFcnJvciIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJuYXZpZ2F0ZUJhY2tUb09yaWdpbiIsImVycm9yVHlwZSIsImxlbmd0aCIsImlzSW5pdGlhbExvYWQ1MDNFcnJvciIsIm9NZXNzYWdlIiwib1RlY2huaWNhbERldGFpbHMiLCJnZXRUZWNobmljYWxEZXRhaWxzIiwic1JldHJ5QWZ0ZXJNZXNzYWdlIiwiaHR0cFN0YXR1cyIsInJldHJ5QWZ0ZXIiLCJpU2Vjb25kc0JlZm9yZVJldHJ5IiwiX2dldFNlY29uZHNCZWZvcmVSZXRyeUFmdGVyIiwiZ2V0UmV0cnlBZnRlck1lc3NhZ2UiLCJnZXRNZXNzYWdlIiwiZFJldHJ5QWZ0ZXIiLCJkQ3VycmVudERhdGVUaW1lIiwiRGF0ZSIsImlDdXJyZW50RGF0ZVRpbWVJbk1pbGxpU2Vjb25kcyIsImdldFRpbWUiLCJpUmV0cnlBZnRlckRhdGVUaW1lSW5NaWxsaVNlY29uZHMiLCJzaG93TWVzc2FnZXMiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50IiwiX2lzRmNsRW5hYmxlZCIsIm1lc3NhZ2VQYWdlTmF2aWdhdGlvbkNhbGxiYWNrIiwiaGFuZGxlU2hlbGxCYWNrIiwic2hlbGxCYWNrIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsIl9yb3V0aW5nIiwibmF2aWdhdGVUb01lc3NhZ2VQYWdlIiwiZ2V0VGV4dCIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1lc3NhZ2VIYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBtZXNzYWdlSGFuZGxpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBwcml2YXRlRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuXG50eXBlIE9iamVjdFdpdGhDb252ZXJ0ZXJUeXBlID0gb2JqZWN0ICYge1xuXHRjb252ZXJ0ZXJUeXBlOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgbWVzc2FnZSBoYW5kbGluZy5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAZXhwZXJpbWVudGFsIEFzIG9mIHZlcnNpb24gMS45MC4wXG4gKiBAc2luY2UgMS45MC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLk1lc3NhZ2VIYW5kbGVyXCIpXG5jbGFzcyBNZXNzYWdlSGFuZGxlciBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRwcm90ZWN0ZWQgYmFzZSE6IFBhZ2VDb250cm9sbGVyO1xuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCBib3VuZCBtZXNzYWdlcyBhcmUgc2hvd24gaW4gdGhlIG1lc3NhZ2UgZGlhbG9nLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uSW5zdGVhZH0uXG5cdCAqXG5cdCAqIElmIHRoZSBib3VuZCBtZXNzYWdlcyBhcmUgc2hvd24gdG8gdGhlIHVzZXIgd2l0aCBhIGRpZmZlcmVudCBjb250cm9sIGxpa2UgdGhlIChUT0RPOkxpbmspIE1lc3NhZ2VCdXR0b25cblx0ICogdGhpcyBtZXRob2QgaGFzIHRvIGJlIG92ZXJyaWRkZW4uXG5cdCAqXG5cdCAqIEByZXR1cm5zIERldGVybWluZXMgd2hldGhlciBvciBub3QgYm91bmQgbWVzc2FnZXMgYXJlIHNob3duIGluIHRoZSBtZXNzYWdlIGRpYWxvZy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uSW5zdGVhZClcblx0Z2V0U2hvd0JvdW5kTWVzc2FnZXNJbk1lc3NhZ2VEaWFsb2coKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogU2hvd3MgYSBtZXNzYWdlIGRpYWxvZyB3aXRoIHRyYW5zaXRpb24gbWVzc2FnZXMgaWYgdGhlcmUgYXJlIGFueS5cblx0ICogVGhlIG1lc3NhZ2UgZGlhbG9nIGlzIHNob3duIGFzIGEgbW9kYWwgZGlhbG9nLiBPbmNlIHRoZSB1c2VyIGNvbmZpcm1zIHRoZSBkaWFsb2csIGFsbCB0cmFuc2l0aW9uIG1lc3NhZ2VzXG5cdCAqIGFyZSByZW1vdmVkIGZyb20gdGhlIG1lc3NhZ2UgbW9kZWwuIElmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgbWVzc2FnZSwgYSBsaXN0IG9mIG1lc3NhZ2VzIGlzIHNob3duLiBUaGUgdXNlclxuXHQgKiBjYW4gZmlsdGVyIG9uIG1lc3NhZ2UgdHlwZXMgYW5kIGNhbiBkaXNwbGF5IGRldGFpbHMgYXMgd2VsbCBhcyB0aGUgbG9uZyB0ZXh0LiBJZiB0aGVyZSBpcyBvbmUgbWVzc2FnZSxcblx0ICogdGhlIGRpYWxvZyBpbW1lZGlhdGVseSBzaG93cyB0aGUgZGV0YWlscyBvZiB0aGUgbWVzc2FnZS4gSWYgdGhlcmUgaXMganVzdCBvbmUgc3VjY2VzcyBtZXNzYWdlLCBhIG1lc3NhZ2Vcblx0ICogdG9hc3QgaXMgc2hvd24gaW5zdGVhZC5cblx0ICpcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIFBSSVZBVEVcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgb25jZSB0aGUgdXNlciBjbG9zZXMgdGhlIGRpYWxvZy4gSWYgdGhlcmUgYXJlIG5vIG1lc3NhZ2VzXG5cdCAqIHRvIGJlIHNob3duLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCBpbW1lZGlhdGVseVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuTWVzc2FnZUhhbmRsZXIjc2hvd01lc3NhZ2VEaWFsb2dcblx0ICogQHB1YmxpY1xuXHQgKiBAZXhwZXJpbWVudGFsIEFzIG9mIHZlcnNpb24gMS45MC4wXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRzaG93TWVzc2FnZURpYWxvZyhtUGFyYW1ldGVycz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGN1c3RvbU1lc3NhZ2VzID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuY3VzdG9tTWVzc2FnZXMgPyBtUGFyYW1ldGVycy5jdXN0b21NZXNzYWdlcyA6IHVuZGVmaW5lZCxcblx0XHRcdG9PUEludGVybmFsQmluZGluZ0NvbnRleHQgPSB0aGlzLmJhc2UuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0Y29uc3Qgdmlld1R5cGUgPSAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIE9iamVjdFdpdGhDb252ZXJ0ZXJUeXBlKS5jb252ZXJ0ZXJUeXBlO1xuXHRcdC8vIHNldCBpc0FjdGlvblBhcmFtZXRlckRpYWxvZyBvcGVuIHNvIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIHRvIGRlY2lkZSB3aGV0aGVyIG1lc3NhZ2UgZGlhbG9nIHNob3VsZCBvcGVuIG9yIG5vdFxuXHRcdGlmIChtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5pc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW4gJiYgb09QSW50ZXJuYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0b09QSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5zZXRQcm9wZXJ0eShcImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3BlblwiLCB0cnVlKTtcblx0XHR9XG5cdFx0Y29uc3QgYlNob3dCb3VuZE1lc3NhZ2VzID0gdGhpcy5nZXRTaG93Qm91bmRNZXNzYWdlc0luTWVzc2FnZURpYWxvZygpO1xuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmNvbnRleHQgPyBtUGFyYW1ldGVycy5jb250ZXh0IDogdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHQvL2NvbnN0IGJFdGFnTWVzc2FnZSA9IG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmJIYXNFdGFnTWVzc2FnZTtcblx0XHQvLyByZXNldCAgaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2dPcGVuXG5cdFx0Ly8gY2Fubm90IGRvIHRoaXMgb3BlcmF0aW9ucy5qcyBzaW5jZSBpdCBpcyBub3QgYXdhcmUgb2YgdGhlIHZpZXdcblx0XHRpZiAob09QSW50ZXJuYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0b09QSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5zZXRQcm9wZXJ0eShcImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3BlblwiLCBmYWxzZSk7XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Ly8gd2UgaGF2ZSB0byBzZXQgYSB0aW1lb3V0IHRvIGJlIGFibGUgdG8gYWNjZXNzIHRoZSBtb3N0IHJlY2VudCBtZXNzYWdlc1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIFRPRE86IGdyZWF0IEFQSSAtIHdpbGwgYmUgY2hhbmdlZCBsYXRlclxuXHRcdFx0XHRtZXNzYWdlSGFuZGxpbmdcblx0XHRcdFx0XHQuc2hvd1VuYm91bmRNZXNzYWdlcyhcblx0XHRcdFx0XHRcdGN1c3RvbU1lc3NhZ2VzLFxuXHRcdFx0XHRcdFx0b0JpbmRpbmdDb250ZXh0LFxuXHRcdFx0XHRcdFx0YlNob3dCb3VuZE1lc3NhZ2VzLFxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnM/LmNvbmN1cnJlbnRFZGl0RmxhZyxcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzPy5jb250cm9sLFxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnM/LnNBY3Rpb25OYW1lLFxuXHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnM/Lm9uQmVmb3JlU2hvd01lc3NhZ2UsXG5cdFx0XHRcdFx0XHR2aWV3VHlwZVxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHQudGhlbihyZXNvbHZlKVxuXHRcdFx0XHRcdC5jYXRjaChyZWplY3QpO1xuXHRcdFx0fSwgMCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogWW91IGNhbiByZW1vdmUgdGhlIGV4aXN0aW5nIHRyYW5zaXRpb24gbWVzc2FnZSBmcm9tIHRoZSBtZXNzYWdlIG1vZGVsIHdpdGggdGhpcyBtZXRob2QuXG5cdCAqIFdpdGggZXZlcnkgdXNlciBpbnRlcmFjdGlvbiB0aGF0IGNhdXNlcyBzZXJ2ZXIgY29tbXVuaWNhdGlvbiAobGlrZSBjbGlja2luZyBvbiBhbiBhY3Rpb24sIGNoYW5naW5nIGRhdGEpLFxuXHQgKiB0aGlzIG1ldGhvZCByZW1vdmVzIHRoZSBleGlzdGluZyB0cmFuc2l0aW9uIG1lc3NhZ2VzIGZyb20gdGhlIG1lc3NhZ2UgbW9kZWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBba2VlcEJvdW5kTWVzc2FnZV0gQ2hlY2tzIGlmIHRoZSBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIGFyZSBub3QgdG8gYmUgcmVtb3ZlZFxuXHQgKiBAcGFyYW0ga2VlcFVuYm91bmRNZXNzYWdlXG5cdCAqIEBwYXJhbSBzUGF0aFRvQmVSZW1vdmVkXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5NZXNzYWdlSGFuZGxlciNyZW1vdmVzVHJhbnNpdGlvbk1lc3NhZ2VzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0cmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKGtlZXBCb3VuZE1lc3NhZ2U/OiBib29sZWFuLCBrZWVwVW5ib3VuZE1lc3NhZ2U/OiBib29sZWFuLCBzUGF0aFRvQmVSZW1vdmVkPzogc3RyaW5nKSB7XG5cdFx0aWYgKCFrZWVwQm91bmRNZXNzYWdlKSB7XG5cdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoc1BhdGhUb0JlUmVtb3ZlZCk7XG5cdFx0fVxuXHRcdGlmICgha2VlcFVuYm91bmRNZXNzYWdlKSB7XG5cdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdGhhdCByZXR1cm5zIGFsbCB0aGUgcGFyYW1ldGVycyBuZWVkZWQgdG8gaGFuZGxlIHRoZSBuYXZpZ2F0aW9uIHRvIHRoZSBlcnJvciBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgVGhlIHBhcmFtZXRlcnMgbmVjZXNzYXJ5IGZvciB0aGUgbmF2aWdhdGlvbiB0byB0aGUgZXJyb3IgcGFnZVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuTWVzc2FnZUhhbmRsZXIjX2NoZWNrTmF2aWdhdGlvblRvRXJyb3JQYWdlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfY2hlY2tOYXZpZ2F0aW9uVG9FcnJvclBhZ2UobVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IGFVbmJvdW5kTWVzc2FnZXMgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZXMoKTtcblx0XHRjb25zdCBiU2hvd0JvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzID0gdGhpcy5nZXRTaG93Qm91bmRNZXNzYWdlc0luTWVzc2FnZURpYWxvZygpO1xuXHRcdGNvbnN0IGFCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyA9IGJTaG93Qm91bmRUcmFuc2l0aW9uTWVzc2FnZXMgPyBtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZXModHJ1ZSwgdHJ1ZSkgOiBbXTtcblx0XHRjb25zdCBhQ3VzdG9tTWVzc2FnZXMgPSBtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5jdXN0b21NZXNzYWdlcyA/IG1QYXJhbWV0ZXJzLmN1c3RvbU1lc3NhZ2VzIDogW107XG5cdFx0Y29uc3QgYklzU3RpY2t5RWRpdE1vZGUgPSBDb21tb25VdGlscy5pc1N0aWNreUVkaXRNb2RlKHRoaXMuYmFzZS5nZXRWaWV3KCkpO1xuXHRcdGxldCBtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzO1xuXG5cdFx0Ly8gVE9ETzogU3RpY2sgbW9kZSBjaGVjayBpcyBva2F5IGFzIGxvbmcgYXMgdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGlzIHVzZWQgd2l0aCBzYXAuZmUuY29yZSBhbmQgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50LlxuXHRcdC8vIEl0IG1pZ2h0IGJlIGJldHRlciB0byBwcm92aWRlIGFuIGV4dGVuc2lvbiB0byB0aGUgY29uc3VtZXIgb2YgdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIHRvIHByb3ZpZGUgdGhpcyB2YWx1ZS5cblxuXHRcdC8vIFRoZSBtZXNzYWdlIHBhZ2UgY2FuIG9ubHkgc2hvdyAxIG1lc3NhZ2UgdG9kYXksIHNvIHdlIG5hdmlnYXRlIHRvIGl0IHdoZW4gOlxuXHRcdC8vIDEuIFRoZXJlIGFyZSBubyBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIHRvIHNob3csXG5cdFx0Ly8gMi4gVGhlcmUgYXJlIG5vIGN1c3RvbSBtZXNzYWdlcyB0byBzaG93LCAmXG5cdFx0Ly8gMy4gVGhlcmUgaXMgZXhhY3RseSAxIHVuYm91bmQgbWVzc2FnZSBpbiB0aGUgbWVzc2FnZSBtb2RlbCB3aXRoIHN0YXR1c0NvZGU9NTAzIGFuZCByZXRyeS1BZnRlciBhdmFpbGFibGVcblx0XHQvLyA0LiByZXRyeUFmdGVyIGlzIGdyZWF0ZXIgdGhhbiAxMjAgc2Vjb25kc1xuXHRcdC8vXG5cdFx0Ly8gSW4gQWRkaXRpb24sIG5hdmlnYXRpbmcgYXdheSBmcm9tIGEgc3RpY2t5IHNlc3Npb24gd2lsbCBkZXN0cm95IHRoZSBzZXNzaW9uIHNvIHdlIGRvIG5vdCBuYXZpZ2F0ZSB0byBtZXNzYWdlIHBhZ2UgZm9yIG5vdy5cblx0XHQvLyBUT0RPOiBjaGVjayBpZiBuYXZpZ2F0aW9uIHNob3VsZCBiZSBkb25lIGluIHN0aWNreSBlZGl0IG1vZGUuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmlzRGF0YVJlY2VpdmVkRXJyb3IpIHtcblx0XHRcdG1NZXNzYWdlUGFnZVBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdHRpdGxlOiBtUGFyYW1ldGVycy50aXRsZSxcblx0XHRcdFx0ZGVzY3JpcHRpb246IG1QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uLFxuXHRcdFx0XHRuYXZpZ2F0ZUJhY2tUb09yaWdpbjogdHJ1ZSxcblx0XHRcdFx0ZXJyb3JUeXBlOiBcIlBhZ2VOb3RGb3VuZFwiXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHQhYklzU3RpY2t5RWRpdE1vZGUgJiZcblx0XHRcdCFhQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoICYmXG5cdFx0XHQhYUN1c3RvbU1lc3NhZ2VzLmxlbmd0aCAmJlxuXHRcdFx0KGFVbmJvdW5kTWVzc2FnZXMubGVuZ3RoID09PSAxIHx8IChtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5pc0luaXRpYWxMb2FkNTAzRXJyb3IpKVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgb01lc3NhZ2UgPSBhVW5ib3VuZE1lc3NhZ2VzWzBdLFxuXHRcdFx0XHRvVGVjaG5pY2FsRGV0YWlscyA9IG9NZXNzYWdlLmdldFRlY2huaWNhbERldGFpbHMoKTtcblx0XHRcdGxldCBzUmV0cnlBZnRlck1lc3NhZ2U7XG5cdFx0XHRpZiAob1RlY2huaWNhbERldGFpbHMgJiYgb1RlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyA9PT0gNTAzKSB7XG5cdFx0XHRcdGlmIChvVGVjaG5pY2FsRGV0YWlscy5yZXRyeUFmdGVyKSB7XG5cdFx0XHRcdFx0Y29uc3QgaVNlY29uZHNCZWZvcmVSZXRyeSA9IHRoaXMuX2dldFNlY29uZHNCZWZvcmVSZXRyeUFmdGVyKG9UZWNobmljYWxEZXRhaWxzLnJldHJ5QWZ0ZXIpO1xuXHRcdFx0XHRcdGlmIChpU2Vjb25kc0JlZm9yZVJldHJ5ID4gMTIwKSB7XG5cdFx0XHRcdFx0XHQvLyBUT0RPOiBGb3Igbm93IGxldCdzIGtlZXAgZ2V0UmV0cnlBZnRlck1lc3NhZ2UgaW4gbWVzc2FnZUhhbmRsaW5nIGJlY2F1c2UgaXQgaXMgbmVlZGVkIGFsc28gYnkgdGhlIGRpYWxvZy5cblx0XHRcdFx0XHRcdC8vIFdlIGNhbiBwbGFuIHRvIG1vdmUgdGhpcyBhbmQgdGhlIGRpYWxvZyBsb2dpYyBib3RoIHRvIG1lc3NhZ2VIYW5kbGVyIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGlmIHJlcXVpcmVkLlxuXHRcdFx0XHRcdFx0c1JldHJ5QWZ0ZXJNZXNzYWdlID0gbWVzc2FnZUhhbmRsaW5nLmdldFJldHJ5QWZ0ZXJNZXNzYWdlKG9NZXNzYWdlKTtcblx0XHRcdFx0XHRcdG1NZXNzYWdlUGFnZVBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzUmV0cnlBZnRlck1lc3NhZ2UgPyBgJHtzUmV0cnlBZnRlck1lc3NhZ2V9ICR7b01lc3NhZ2UuZ2V0TWVzc2FnZSgpfWAgOiBvTWVzc2FnZS5nZXRNZXNzYWdlKCksXG5cdFx0XHRcdFx0XHRcdG5hdmlnYXRlQmFja1RvT3JpZ2luOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRlcnJvclR5cGU6IFwiVW5hYmxlVG9Mb2FkXCJcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNSZXRyeUFmdGVyTWVzc2FnZSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRSZXRyeUFmdGVyTWVzc2FnZShvTWVzc2FnZSk7XG5cdFx0XHRcdFx0bU1lc3NhZ2VQYWdlUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzUmV0cnlBZnRlck1lc3NhZ2UgPyBgJHtzUmV0cnlBZnRlck1lc3NhZ2V9ICR7b01lc3NhZ2UuZ2V0TWVzc2FnZSgpfWAgOiBvTWVzc2FnZS5nZXRNZXNzYWdlKCksXG5cdFx0XHRcdFx0XHRuYXZpZ2F0ZUJhY2tUb09yaWdpbjogdHJ1ZSxcblx0XHRcdFx0XHRcdGVycm9yVHlwZTogXCJVbmFibGVUb0xvYWRcIlxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1NZXNzYWdlUGFnZVBhcmFtZXRlcnM7XG5cdH1cblxuXHRfZ2V0U2Vjb25kc0JlZm9yZVJldHJ5QWZ0ZXIoZFJldHJ5QWZ0ZXI6IGFueSkge1xuXHRcdGNvbnN0IGRDdXJyZW50RGF0ZVRpbWUgPSBuZXcgRGF0ZSgpLFxuXHRcdFx0aUN1cnJlbnREYXRlVGltZUluTWlsbGlTZWNvbmRzID0gZEN1cnJlbnREYXRlVGltZS5nZXRUaW1lKCksXG5cdFx0XHRpUmV0cnlBZnRlckRhdGVUaW1lSW5NaWxsaVNlY29uZHMgPSBkUmV0cnlBZnRlci5nZXRUaW1lKCksXG5cdFx0XHRpU2Vjb25kc0JlZm9yZVJldHJ5ID0gKGlSZXRyeUFmdGVyRGF0ZVRpbWVJbk1pbGxpU2Vjb25kcyAtIGlDdXJyZW50RGF0ZVRpbWVJbk1pbGxpU2Vjb25kcykgLyAxMDAwO1xuXHRcdHJldHVybiBpU2Vjb25kc0JlZm9yZVJldHJ5O1xuXHR9XG5cdC8qKlxuXHQgKiBTaG93cyBhIG1lc3NhZ2UgcGFnZSBvciBhIG1lc3NhZ2UgZGlhbG9nIGJhc2VkIG9uIHRoZSBtZXNzYWdlcyBpbiB0aGUgbWVzc2FnZSBkaWFsb2cuXG5cdCAqXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIG9uY2UgdGhlIHVzZXIgY2xvc2VzIHRoZSBtZXNzYWdlIGRpYWxvZyBvciB3aGVuIG5hdmlnYXRpb24gdG8gdGhlIG1lc3NhZ2UgcGFnZSBpcyBjb21wbGV0ZS4gSWYgdGhlcmUgYXJlIG5vIG1lc3NhZ2VzXG5cdCAqIHRvIGJlIHNob3duLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCBpbW1lZGlhdGVseVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIHNob3dNZXNzYWdlcyhtUGFyYW1ldGVycz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5nZXRWaWV3KCkpO1xuXHRcdGxldCBtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzOiBhbnk7XG5cdFx0aWYgKCFvQXBwQ29tcG9uZW50Ll9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0bU1lc3NhZ2VQYWdlUGFyYW1ldGVycyA9IHRoaXMuX2NoZWNrTmF2aWdhdGlvblRvRXJyb3JQYWdlKG1QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdFx0aWYgKG1NZXNzYWdlUGFnZVBhcmFtZXRlcnMpIHtcblx0XHRcdC8vIG5hdmlnYXRlIHRvIG1lc3NhZ2UgcGFnZS5cblx0XHRcdC8vIGhhbmRsZXIgYmVmb3JlIHBhZ2UgbmF2aWdhdGlvbiBpcyB0cmlnZ2VyZWQsIGZvciBleGFtcGxlIHRvIGNsb3NlIHRoZSBhY3Rpb24gcGFyYW1ldGVyIGRpYWxvZ1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLm1lc3NhZ2VQYWdlTmF2aWdhdGlvbkNhbGxiYWNrKSB7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLm1lc3NhZ2VQYWdlTmF2aWdhdGlvbkNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cblx0XHRcdG1NZXNzYWdlUGFnZVBhcmFtZXRlcnMuaGFuZGxlU2hlbGxCYWNrID0gIShtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5zaGVsbEJhY2spO1xuXHRcdFx0Ly8gVE9ETzogVXNlIElsbHVzdHJhdGVkIG1lc3NhZ2UgaW5zdGVhZCBvZiBub3JtYWwgbWVzc2FnZSBwYWdlXG5cdFx0XHQvLyBUT0RPOiBSZXR1cm4gdmFsdWUgbmVlZHMgdG8gcHJvdmlkZWQgYnV0IHNpbmNlIHRoaXMgZnVuY3Rpb24gaXMgcHJpdmF0ZSBmb3Igbm93IGhlbmNlIHdlIGNhbiBza2lwIHRoaXMuXG5cdFx0XHR0aGlzLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRcdGlmICh0aGlzLmJhc2UuX3JvdXRpbmcpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlOiBhbnksIHJlamVjdDogYW55KSA9PiB7XG5cdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byBzZXQgYSB0aW1lb3V0IHRvIGJlIGFibGUgdG8gYWNjZXNzIHRoZSBtb3N0IHJlY2VudCBtZXNzYWdlc1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gVE9ETzogZ3JlYXQgQVBJIC0gd2lsbCBiZSBjaGFuZ2VkIGxhdGVyXG5cdFx0XHRcdFx0XHR0aGlzLmJhc2UuX3JvdXRpbmdcblx0XHRcdFx0XHRcdFx0Lm5hdmlnYXRlVG9NZXNzYWdlUGFnZShcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5pc0RhdGFSZWNlaXZlZEVycm9yXG5cdFx0XHRcdFx0XHRcdFx0XHQ/IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfREFUQV9SRUNFSVZFRF9FUlJPUlwiKVxuXHRcdFx0XHRcdFx0XHRcdFx0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfVElUTEVcIiksXG5cdFx0XHRcdFx0XHRcdFx0bU1lc3NhZ2VQYWdlUGFyYW1ldGVyc1xuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC50aGVuKHJlc29sdmUpXG5cdFx0XHRcdFx0XHRcdC5jYXRjaChyZWplY3QpO1xuXHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gbmF2aWdhdGUgdG8gbWVzc2FnZSBkaWFsb2dcblx0XHRcdHJldHVybiB0aGlzLnNob3dNZXNzYWdlRGlhbG9nKG1QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VIYW5kbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0VBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVBBLElBU01BLGNBQWMsV0FEbkJDLGNBQWMsQ0FBQyxpREFBaUQsQ0FBQyxVQWVoRUMsZ0JBQWdCLEVBQUUsVUFDbEJDLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLE9BQU8sQ0FBQyxVQXFCckNDLGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBa0RoQkQsZUFBZSxFQUFFLFVBOEZqQkEsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUU7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBcExqQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFYQyxPQWNBQyxtQ0FBbUMsR0FGbkMsK0NBRXNDO01BQ3JDLE9BQU8sSUFBSTtJQUNaOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BZkM7SUFBQSxPQWtCQUMsaUJBQWlCLEdBRmpCLDJCQUVrQkMsV0FBaUIsRUFBaUI7TUFDbkQsTUFBTUMsY0FBYyxHQUFHRCxXQUFXLElBQUlBLFdBQVcsQ0FBQ0MsY0FBYyxHQUFHRCxXQUFXLENBQUNDLGNBQWMsR0FBR0MsU0FBUztRQUN4R0MseUJBQXlCLEdBQUcsSUFBSSxDQUFDQyxJQUFJLENBQUNDLE9BQU8sRUFBRSxDQUFDQyxpQkFBaUIsQ0FBQyxVQUFVLENBQXlCO01BQ3RHLE1BQU1DLFFBQVEsR0FBSSxJQUFJLENBQUNILElBQUksQ0FBQ0MsT0FBTyxFQUFFLENBQUNHLFdBQVcsRUFBRSxDQUE2QkMsYUFBYTtNQUM3RjtNQUNBLElBQUlULFdBQVcsSUFBSUEsV0FBVyxDQUFDVSwyQkFBMkIsSUFBSVAseUJBQXlCLEVBQUU7UUFDeEZBLHlCQUF5QixDQUFDUSxXQUFXLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDO01BQzNFO01BQ0EsTUFBTUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDZCxtQ0FBbUMsRUFBRTtNQUNyRSxNQUFNZSxlQUFlLEdBQUdiLFdBQVcsSUFBSUEsV0FBVyxDQUFDYyxPQUFPLEdBQUdkLFdBQVcsQ0FBQ2MsT0FBTyxHQUFHLElBQUksQ0FBQ1QsT0FBTyxFQUFFLENBQUNDLGlCQUFpQixFQUFFO01BQ3JIO01BQ0E7TUFDQTtNQUNBLElBQUlILHlCQUF5QixFQUFFO1FBQzlCQSx5QkFBeUIsQ0FBQ1EsV0FBVyxDQUFDLDZCQUE2QixFQUFFLEtBQUssQ0FBQztNQUM1RTtNQUNBLE9BQU8sSUFBSUksT0FBTyxDQUFDLFVBQVVDLE9BQTZCLEVBQUVDLE1BQThCLEVBQUU7UUFDM0Y7UUFDQUMsVUFBVSxDQUFDLFlBQVk7VUFDdEI7VUFDQUMsZUFBZSxDQUNiQyxtQkFBbUIsQ0FDbkJuQixjQUFjLEVBQ2RZLGVBQWUsRUFDZkQsa0JBQWtCLEVBQ2xCWixXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRXFCLGtCQUFrQixFQUMvQnJCLFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFc0IsT0FBTyxFQUNwQnRCLFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFdUIsV0FBVyxFQUN4QnJCLFNBQVMsRUFDVEYsV0FBVyxhQUFYQSxXQUFXLHVCQUFYQSxXQUFXLENBQUV3QixtQkFBbUIsRUFDaENqQixRQUFRLENBQ1IsQ0FDQWtCLElBQUksQ0FBQ1QsT0FBTyxDQUFDLENBQ2JVLEtBQUssQ0FBQ1QsTUFBTSxDQUFDO1FBQ2hCLENBQUMsRUFBRSxDQUFDLENBQUM7TUFDTixDQUFDLENBQUM7SUFDSDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BVkM7SUFBQSxPQVlBVSx3QkFBd0IsR0FEeEIsa0NBQ3lCQyxnQkFBMEIsRUFBRUMsa0JBQTRCLEVBQUVDLGdCQUF5QixFQUFFO01BQzdHLElBQUksQ0FBQ0YsZ0JBQWdCLEVBQUU7UUFDdEJULGVBQWUsQ0FBQ1ksNkJBQTZCLENBQUNELGdCQUFnQixDQUFDO01BQ2hFO01BQ0EsSUFBSSxDQUFDRCxrQkFBa0IsRUFBRTtRQUN4QlYsZUFBZSxDQUFDYSwrQkFBK0IsRUFBRTtNQUNsRDtJQUNEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQUFBLE9BUUFDLDJCQUEyQixHQUEzQixxQ0FBNEJqQyxXQUFnQixFQUFFO01BQzdDLE1BQU1rQyxnQkFBZ0IsR0FBR2YsZUFBZSxDQUFDZ0IsV0FBVyxFQUFFO01BQ3RELE1BQU1DLDRCQUE0QixHQUFHLElBQUksQ0FBQ3RDLG1DQUFtQyxFQUFFO01BQy9FLE1BQU11Qyx3QkFBd0IsR0FBR0QsNEJBQTRCLEdBQUdqQixlQUFlLENBQUNnQixXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7TUFDNUcsTUFBTUcsZUFBZSxHQUFHdEMsV0FBVyxJQUFJQSxXQUFXLENBQUNDLGNBQWMsR0FBR0QsV0FBVyxDQUFDQyxjQUFjLEdBQUcsRUFBRTtNQUNuRyxNQUFNc0MsaUJBQWlCLEdBQUdDLFdBQVcsQ0FBQ0MsZ0JBQWdCLENBQUMsSUFBSSxDQUFDckMsSUFBSSxDQUFDQyxPQUFPLEVBQUUsQ0FBQztNQUMzRSxJQUFJcUMsc0JBQXNCOztNQUUxQjtNQUNBOztNQUVBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQSxJQUFJMUMsV0FBVyxJQUFJQSxXQUFXLENBQUMyQyxtQkFBbUIsRUFBRTtRQUNuREQsc0JBQXNCLEdBQUc7VUFDeEJFLEtBQUssRUFBRTVDLFdBQVcsQ0FBQzRDLEtBQUs7VUFDeEJDLFdBQVcsRUFBRTdDLFdBQVcsQ0FBQzZDLFdBQVc7VUFDcENDLG9CQUFvQixFQUFFLElBQUk7VUFDMUJDLFNBQVMsRUFBRTtRQUNaLENBQUM7TUFDRixDQUFDLE1BQU0sSUFDTixDQUFDUixpQkFBaUIsSUFDbEIsQ0FBQ0Ysd0JBQXdCLENBQUNXLE1BQU0sSUFDaEMsQ0FBQ1YsZUFBZSxDQUFDVSxNQUFNLEtBQ3RCZCxnQkFBZ0IsQ0FBQ2MsTUFBTSxLQUFLLENBQUMsSUFBS2hELFdBQVcsSUFBSUEsV0FBVyxDQUFDaUQscUJBQXNCLENBQUMsRUFDcEY7UUFDRCxNQUFNQyxRQUFRLEdBQUdoQixnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7VUFDbkNpQixpQkFBaUIsR0FBR0QsUUFBUSxDQUFDRSxtQkFBbUIsRUFBRTtRQUNuRCxJQUFJQyxrQkFBa0I7UUFDdEIsSUFBSUYsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDRyxVQUFVLEtBQUssR0FBRyxFQUFFO1VBQzlELElBQUlILGlCQUFpQixDQUFDSSxVQUFVLEVBQUU7WUFDakMsTUFBTUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDQywyQkFBMkIsQ0FBQ04saUJBQWlCLENBQUNJLFVBQVUsQ0FBQztZQUMxRixJQUFJQyxtQkFBbUIsR0FBRyxHQUFHLEVBQUU7Y0FDOUI7Y0FDQTtjQUNBSCxrQkFBa0IsR0FBR2xDLGVBQWUsQ0FBQ3VDLG9CQUFvQixDQUFDUixRQUFRLENBQUM7Y0FDbkVSLHNCQUFzQixHQUFHO2dCQUN4QkcsV0FBVyxFQUFFUSxrQkFBa0IsR0FBSSxHQUFFQSxrQkFBbUIsSUFBR0gsUUFBUSxDQUFDUyxVQUFVLEVBQUcsRUFBQyxHQUFHVCxRQUFRLENBQUNTLFVBQVUsRUFBRTtnQkFDMUdiLG9CQUFvQixFQUFFLElBQUk7Z0JBQzFCQyxTQUFTLEVBQUU7Y0FDWixDQUFDO1lBQ0Y7VUFDRCxDQUFDLE1BQU07WUFDTk0sa0JBQWtCLEdBQUdsQyxlQUFlLENBQUN1QyxvQkFBb0IsQ0FBQ1IsUUFBUSxDQUFDO1lBQ25FUixzQkFBc0IsR0FBRztjQUN4QkcsV0FBVyxFQUFFUSxrQkFBa0IsR0FBSSxHQUFFQSxrQkFBbUIsSUFBR0gsUUFBUSxDQUFDUyxVQUFVLEVBQUcsRUFBQyxHQUFHVCxRQUFRLENBQUNTLFVBQVUsRUFBRTtjQUMxR2Isb0JBQW9CLEVBQUUsSUFBSTtjQUMxQkMsU0FBUyxFQUFFO1lBQ1osQ0FBQztVQUNGO1FBQ0Q7TUFDRDtNQUNBLE9BQU9MLHNCQUFzQjtJQUM5QixDQUFDO0lBQUEsT0FFRGUsMkJBQTJCLEdBQTNCLHFDQUE0QkcsV0FBZ0IsRUFBRTtNQUM3QyxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJQyxJQUFJLEVBQUU7UUFDbENDLDhCQUE4QixHQUFHRixnQkFBZ0IsQ0FBQ0csT0FBTyxFQUFFO1FBQzNEQyxpQ0FBaUMsR0FBR0wsV0FBVyxDQUFDSSxPQUFPLEVBQUU7UUFDekRSLG1CQUFtQixHQUFHLENBQUNTLGlDQUFpQyxHQUFHRiw4QkFBOEIsSUFBSSxJQUFJO01BQ2xHLE9BQU9QLG1CQUFtQjtJQUMzQjtJQUNBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQUFBLE9BVU1VLFlBQVksR0FGbEIsNEJBRW1CbEUsV0FBaUIsRUFBaUI7TUFDcEQsTUFBTW1FLGFBQWEsR0FBRzNCLFdBQVcsQ0FBQzRCLGVBQWUsQ0FBQyxJQUFJLENBQUMvRCxPQUFPLEVBQUUsQ0FBQztNQUNqRSxJQUFJcUMsc0JBQTJCO01BQy9CLElBQUksQ0FBQ3lCLGFBQWEsQ0FBQ0UsYUFBYSxFQUFFLEVBQUU7UUFDbkMzQixzQkFBc0IsR0FBRyxJQUFJLENBQUNULDJCQUEyQixDQUFDakMsV0FBVyxDQUFDO01BQ3ZFO01BQ0EsSUFBSTBDLHNCQUFzQixFQUFFO1FBQzNCO1FBQ0E7UUFDQSxJQUFJMUMsV0FBVyxJQUFJQSxXQUFXLENBQUNzRSw2QkFBNkIsRUFBRTtVQUM3RHRFLFdBQVcsQ0FBQ3NFLDZCQUE2QixFQUFFO1FBQzVDO1FBRUE1QixzQkFBc0IsQ0FBQzZCLGVBQWUsR0FBRyxFQUFFdkUsV0FBVyxJQUFJQSxXQUFXLENBQUN3RSxTQUFTLENBQUM7UUFDaEY7UUFDQTtRQUNBLElBQUksQ0FBQzdDLHdCQUF3QixFQUFFO1FBQy9CLE1BQU04QyxlQUFlLEdBQUdDLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxDQUFDO1FBQ3BFLElBQUksSUFBSSxDQUFDdkUsSUFBSSxDQUFDd0UsUUFBUSxFQUFFO1VBQ3ZCLE9BQU8sSUFBSTdELE9BQU8sQ0FBQyxDQUFDQyxPQUFZLEVBQUVDLE1BQVcsS0FBSztZQUNqRDtZQUNBQyxVQUFVLENBQUMsTUFBTTtjQUNoQjtjQUNBLElBQUksQ0FBQ2QsSUFBSSxDQUFDd0UsUUFBUSxDQUNoQkMscUJBQXFCLENBQ3JCN0UsV0FBVyxJQUFJQSxXQUFXLENBQUMyQyxtQkFBbUIsR0FDM0M4QixlQUFlLENBQUNLLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxHQUM3REwsZUFBZSxDQUFDSyxPQUFPLENBQUMsb0NBQW9DLENBQUMsRUFDaEVwQyxzQkFBc0IsQ0FDdEIsQ0FDQWpCLElBQUksQ0FBQ1QsT0FBTyxDQUFDLENBQ2JVLEtBQUssQ0FBQ1QsTUFBTSxDQUFDO1lBQ2hCLENBQUMsRUFBRSxDQUFDLENBQUM7VUFDTixDQUFDLENBQUM7UUFDSDtNQUNELENBQUMsTUFBTTtRQUNOO1FBQ0EsT0FBTyxJQUFJLENBQUNsQixpQkFBaUIsQ0FBQ0MsV0FBVyxDQUFDO01BQzNDO0lBQ0QsQ0FBQztJQUFBO0VBQUEsRUE5TjJCK0UsbUJBQW1CO0VBQUEsT0FnT2pDekYsY0FBYztBQUFBIn0=