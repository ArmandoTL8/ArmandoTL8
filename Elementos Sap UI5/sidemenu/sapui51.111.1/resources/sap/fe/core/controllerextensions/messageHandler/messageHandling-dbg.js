/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Bar", "sap/m/Button", "sap/m/Dialog", "sap/m/FormattedText", "sap/m/MessageBox", "sap/m/MessageItem", "sap/m/MessageToast", "sap/m/MessageView", "sap/m/Text", "sap/ui/core/Core", "sap/ui/core/format/DateFormat", "sap/ui/core/IconPool", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/ui/model/Sorter", "../../CommonUtils"], function (Bar, Button, Dialog, FormattedText, MessageBox, MessageItem, MessageToast, MessageView, Text, Core, DateFormat, IconPool, CoreLib, Message, Filter, FilterOperator, JSONModel, Sorter, CommonUtils) {
  "use strict";

  const MessageType = CoreLib.MessageType;
  let aMessageList = [];
  let aMessageDataList = [];
  let aResolveFunctions = [];
  let oDialog;
  let oBackButton;
  let oMessageView;
  function fnFormatTechnicalDetails() {
    let sPreviousGroupName;

    // Insert technical detail if it exists
    function insertDetail(oProperty) {
      return oProperty.property ? "( ${" + oProperty.property + '} ? ("<p>' + oProperty.property.substr(Math.max(oProperty.property.lastIndexOf("/"), oProperty.property.lastIndexOf(".")) + 1) + ' : " + ' + "${" + oProperty.property + '} + "</p>") : "" )' : "";
    }
    // Insert groupname if it exists
    function insertGroupName(oProperty) {
      let sHTML = "";
      if (oProperty.groupName && oProperty.property && oProperty.groupName !== sPreviousGroupName) {
        sHTML += "( ${" + oProperty.property + '} ? "<br><h3>' + oProperty.groupName + '</h3>" : "" ) + ';
        sPreviousGroupName = oProperty.groupName;
      }
      return sHTML;
    }

    // List of technical details to be shown
    function getPaths() {
      const sTD = "technicalDetails"; // name of property in message model data for technical details
      return [{
        groupName: "",
        property: `${sTD}/status`
      }, {
        groupName: "",
        property: `${sTD}/statusText`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ComponentId`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ServiceId`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ServiceRepository`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ServiceVersion`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ErrorResolution/Analysis`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ErrorResolution/Note`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ErrorResolution/DetailedNote`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ExceptionCategory`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.TimeStamp`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.TransactionId`
      }, {
        groupName: "Messages",
        property: `${sTD}/error/code`
      }, {
        groupName: "Messages",
        property: `${sTD}/error/message`
      }];
    }
    let sHTML = "Object.keys(" + "${technicalDetails}" + ').length > 0 ? "<h2>Technical Details</h2>" : "" ';
    getPaths().forEach(function (oProperty) {
      sHTML = `${sHTML + insertGroupName(oProperty)}${insertDetail(oProperty)} + `;
    });
    return sHTML;
  }
  function fnFormatDescription() {
    return "(${" + 'description} ? ("<h2>Description</h2>" + ${' + 'description}) : "")';
  }
  /**
   * Calculates the highest priority message type(Error/Warning/Success/Information) from the available messages.
   *
   * @function
   * @name sap.fe.core.actions.messageHandling.fnGetHighestMessagePriority
   * @memberof sap.fe.core.actions.messageHandling
   * @param [aMessages] Messages list
   * @returns Highest priority message from the available messages
   * @private
   * @ui5-restricted
   */
  function fnGetHighestMessagePriority(aMessages) {
    let sMessagePriority = MessageType.None;
    const iLength = aMessages.length;
    const oMessageCount = {
      Error: 0,
      Warning: 0,
      Success: 0,
      Information: 0
    };
    for (let i = 0; i < iLength; i++) {
      ++oMessageCount[aMessages[i].getType()];
    }
    if (oMessageCount[MessageType.Error] > 0) {
      sMessagePriority = MessageType.Error;
    } else if (oMessageCount[MessageType.Warning] > 0) {
      sMessagePriority = MessageType.Warning;
    } else if (oMessageCount[MessageType.Success] > 0) {
      sMessagePriority = MessageType.Success;
    } else if (oMessageCount[MessageType.Information] > 0) {
      sMessagePriority = MessageType.Information;
    }
    return sMessagePriority;
  }
  // function which modify e-Tag messages only.
  // returns : true, if any e-Tag message is modified, otherwise false.
  function fnModifyETagMessagesOnly(oMessageManager, oResourceBundle, concurrentEditFlag) {
    const aMessages = oMessageManager.getMessageModel().getObject("/");
    let bMessagesModified = false;
    let sEtagMessage = "";
    aMessages.forEach(function (oMessage, i) {
      const oTechnicalDetails = oMessage.getTechnicalDetails && oMessage.getTechnicalDetails();
      if (oTechnicalDetails && oTechnicalDetails.httpStatus === 412) {
        if (oTechnicalDetails.isConcurrentModification && concurrentEditFlag) {
          sEtagMessage = sEtagMessage || oResourceBundle.getText("C_APP_COMPONENT_SAPFE_ETAG_TECHNICAL_ISSUES_CONCURRENT_MODIFICATION");
        } else {
          sEtagMessage = sEtagMessage || oResourceBundle.getText("C_APP_COMPONENT_SAPFE_ETAG_TECHNICAL_ISSUES");
        }
        oMessageManager.removeMessages(aMessages[i]);
        oMessage.setMessage(sEtagMessage);
        oMessage.target = "";
        oMessageManager.addMessages(oMessage);
        bMessagesModified = true;
      }
    });
    return bMessagesModified;
  }
  // Dialog close Handling
  function dialogCloseHandler() {
    oDialog.close();
    oBackButton.setVisible(false);
    aMessageList = [];
    const oMessageDialogModel = oMessageView.getModel();
    if (oMessageDialogModel) {
      oMessageDialogModel.setData({});
    }
    removeUnboundTransitionMessages();
  }
  function getRetryAfterMessage(oMessage, bMessageDialog) {
    const dNow = new Date();
    const oTechnicalDetails = oMessage.getTechnicalDetails();
    const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    let sRetryAfterMessage;
    if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503 && oTechnicalDetails.retryAfter) {
      const dRetryAfter = oTechnicalDetails.retryAfter;
      let oDateFormat;
      if (dNow.getFullYear() !== dRetryAfter.getFullYear()) {
        //different years
        oDateFormat = DateFormat.getDateTimeInstance({
          pattern: "MMMM dd, yyyy 'at' hh:mm a"
        });
        sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR", [oDateFormat.format(dRetryAfter)]);
      } else if (dNow.getFullYear() == dRetryAfter.getFullYear()) {
        //same year
        if (bMessageDialog) {
          //less than 2 min
          sRetryAfterMessage = `${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE")} ${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_DESC")}`;
        } else if (dNow.getMonth() !== dRetryAfter.getMonth() || dNow.getDate() !== dRetryAfter.getDate()) {
          oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "MMMM dd 'at' hh:mm a"
          }); //different months or different days of same month
          sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR", [oDateFormat.format(dRetryAfter)]);
        } else {
          //same day
          oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "hh:mm a"
          });
          sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR_DAY", [oDateFormat.format(dRetryAfter)]);
        }
      }
    }
    if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503 && !oTechnicalDetails.retryAfter) {
      sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR_NO_RETRY_AFTER");
    }
    return sRetryAfterMessage;
  }
  function prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow, multi412) {
    let oMessageTemplate;
    if (!bStrictHandlingFlow) {
      oMessageTemplate = new MessageItem(undefined, {
        counter: {
          path: "counter"
        },
        title: "{message}",
        subtitle: "{additionalText}",
        longtextUrl: "{descriptionUrl}",
        type: {
          path: "type"
        },
        groupName: "{headerName}",
        description: "{= ${" + "description} || ${technicalDetails} ? " + '"<html><body>" + ' + fnFormatDescription() + " + " + fnFormatTechnicalDetails() + '"</body></html>"' + ' : "" }',
        markupDescription: true
      });
    } else if (multi412) {
      oMessageTemplate = new MessageItem(undefined, {
        counter: {
          path: "counter"
        },
        title: "{message}",
        subtitle: "{additionalText}",
        longtextUrl: "{descriptionUrl}",
        type: {
          path: "type"
        },
        description: "{description}",
        markupDescription: true
      });
    } else {
      oMessageTemplate = new MessageItem({
        title: "{message}",
        type: {
          path: "type"
        },
        longtextUrl: "{descriptionUrl}"
      });
    }
    oMessageView = new MessageView({
      showDetailsPageHeader: false,
      itemSelect: function () {
        oBackButton.setVisible(true);
      },
      items: {
        path: "/",
        template: oMessageTemplate
      }
    });
    oMessageView.setGroupItems(true);
    oBackButton = oBackButton || new Button({
      icon: IconPool.getIconURI("nav-back"),
      visible: false,
      press: function () {
        oMessageView.navigateBack();
        this.setVisible(false);
      }
    });
    // Update proper ETag Mismatch error
    oMessageView.setModel(oMessageDialogModel);
    return {
      oMessageView,
      oBackButton
    };
  }
  function showUnboundMessages(aCustomMessages, oContext, bShowBoundTransition, concurrentEditFlag, control, sActionName, bOnlyForTest, onBeforeShowMessage, viewType) {
    let aTransitionMessages = this.getMessages();
    const oMessageManager = Core.getMessageManager();
    let sHighestPriority;
    let sHighestPriorityText;
    const aFilters = [new Filter({
      path: "persistent",
      operator: FilterOperator.NE,
      value1: false
    })];
    let showMessageDialog = false,
      showMessageBox = false;
    if (bShowBoundTransition) {
      aTransitionMessages = aTransitionMessages.concat(getMessages(true, true));
      // we only want to show bound transition messages not bound state messages hence add a filter for the same
      aFilters.push(new Filter({
        path: "persistent",
        operator: FilterOperator.EQ,
        value1: true
      }));
      const fnCheckControlIdInDialog = function (aControlIds) {
        let index = Infinity,
          oControl = Core.byId(aControlIds[0]);
        const errorFieldControl = Core.byId(aControlIds[0]);
        while (oControl) {
          const fieldRankinDialog = oControl instanceof Dialog ? errorFieldControl.getParent().findElements(true).indexOf(errorFieldControl) : Infinity;
          if (oControl instanceof Dialog) {
            if (index > fieldRankinDialog) {
              index = fieldRankinDialog;
              // Set the focus to the dialog's control
              errorFieldControl.focus();
            }
            // messages with target inside sap.m.Dialog should not bring up the message dialog
            return false;
          }
          oControl = oControl.getParent();
        }
        return true;
      };
      aFilters.push(new Filter({
        path: "controlIds",
        test: fnCheckControlIdInDialog,
        caseSensitive: true
      }));
    } else {
      // only unbound messages have to be shown so add filter accordingly
      aFilters.push(new Filter({
        path: "target",
        operator: FilterOperator.EQ,
        value1: ""
      }));
    }
    if (aCustomMessages && aCustomMessages.length) {
      aCustomMessages.forEach(function (oMessage) {
        const messageCode = oMessage.code ? oMessage.code : "";
        oMessageManager.addMessages(new Message({
          message: oMessage.text,
          type: oMessage.type,
          target: "",
          persistent: true,
          code: messageCode
        }));
        //The target and persistent properties of the message are hardcoded as "" and true because the function deals with only unbound messages.
      });
    }

    const oMessageDialogModel = oMessageView && oMessageView.getModel() || new JSONModel();
    const bHasEtagMessage = this.modifyETagMessagesOnly(oMessageManager, Core.getLibraryResourceBundle("sap.fe.core"), concurrentEditFlag);
    if (aTransitionMessages.length === 1 && aTransitionMessages[0].getCode() === "503") {
      showMessageBox = true;
    } else if (aTransitionMessages.length !== 0) {
      showMessageDialog = true;
    }
    let showMessageParameters;
    let aModelDataArray = [];
    if (showMessageDialog || !showMessageBox && !onBeforeShowMessage) {
      const oListBinding = oMessageManager.getMessageModel().bindList("/", undefined, undefined, aFilters),
        aCurrentContexts = oListBinding.getCurrentContexts();
      if (aCurrentContexts && aCurrentContexts.length > 0) {
        showMessageDialog = true;
        // Don't show dialog incase there are no errors to show

        // if false, show messages in dialog
        // As fitering has already happened here hence
        // using the message model again for the message dialog view and then filtering on that binding again is unnecessary.
        // So we create new json model to use for the message dialog view.
        const aMessages = [];
        aCurrentContexts.forEach(function (currentContext) {
          const oMessage = currentContext.getObject();
          aMessages.push(oMessage);
          aMessageDataList = aMessages;
        });
        let existingMessages = [];
        if (Array.isArray(oMessageDialogModel.getData())) {
          existingMessages = oMessageDialogModel.getData();
        }
        const oUniqueObj = {};
        aModelDataArray = aMessageDataList.concat(existingMessages).filter(function (obj) {
          // remove entries having duplicate message ids
          return !oUniqueObj[obj.id] && (oUniqueObj[obj.id] = true);
        });
        oMessageDialogModel.setData(aModelDataArray);
      }
    }
    if (onBeforeShowMessage) {
      showMessageParameters = {
        showMessageBox,
        showMessageDialog
      };
      showMessageParameters = onBeforeShowMessage(aTransitionMessages, showMessageParameters);
      showMessageBox = showMessageParameters.showMessageBox;
      showMessageDialog = showMessageParameters.showMessageDialog;
      if (showMessageDialog) {
        aModelDataArray = showMessageParameters.filteredMessages ? showMessageParameters.filteredMessages : aModelDataArray;
      }
    }
    if (aTransitionMessages.length === 0 && !aCustomMessages && !bHasEtagMessage) {
      // Don't show the popup if there are no transient messages
      return Promise.resolve(true);
    } else if (aTransitionMessages.length === 1 && aTransitionMessages[0].getType() === MessageType.Success && !aCustomMessages) {
      return new Promise(resolve => {
        MessageToast.show(aTransitionMessages[0].message);
        if (oMessageDialogModel) {
          oMessageDialogModel.setData({});
        }
        oMessageManager.removeMessages(aTransitionMessages);
        resolve();
      });
    } else if (showMessageDialog) {
      messageHandling.updateMessageObjectGroupName(aModelDataArray, control, sActionName, viewType);
      oMessageDialogModel.setData(aModelDataArray); // set the messages here so that if any of them are filtered for APD, they are filtered here as well.
      aResolveFunctions = aResolveFunctions || [];
      return new Promise(function (resolve, reject) {
        aResolveFunctions.push(resolve);
        Core.getLibraryResourceBundle("sap.fe.core", true).then(function (oResourceBundle) {
          const bStrictHandlingFlow = false;
          if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
            oMessageDialogModel.getData().forEach(function (oMessage) {
              showMessageParameters.fnGetMessageSubtitle(oMessage);
            });
          }
          const oMessageObject = prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow);
          const oSorter = new Sorter("", undefined, undefined, (obj1, obj2) => {
            const rankA = getMessageRank(obj1);
            const rankB = getMessageRank(obj2);
            if (rankA < rankB) {
              return -1;
            }
            if (rankA > rankB) {
              return 1;
            }
            return 0;
          });
          oMessageObject.oMessageView.getBinding("items").sort(oSorter);
          oDialog = oDialog && oDialog.isOpen() ? oDialog : new Dialog({
            resizable: true,
            endButton: new Button({
              press: function () {
                dialogCloseHandler();
                // also remove bound transition messages if we were showing them
                oMessageManager.removeMessages(aModelDataArray);
              },
              text: oResourceBundle.getText("C_COMMON_SAPFE_CLOSE")
            }),
            customHeader: new Bar({
              contentMiddle: [new Text({
                text: oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE")
              })],
              contentLeft: [oBackButton]
            }),
            contentWidth: "37.5em",
            contentHeight: "21.5em",
            verticalScrolling: false,
            afterClose: function () {
              for (let i = 0; i < aResolveFunctions.length; i++) {
                aResolveFunctions[i].call();
              }
              aResolveFunctions = [];
            }
          });
          oDialog.removeAllContent();
          oDialog.addContent(oMessageObject.oMessageView);
          if (bHasEtagMessage) {
            sap.ui.require(["sap/m/ButtonType"], function (ButtonType) {
              oDialog.setBeginButton(new Button({
                press: function () {
                  dialogCloseHandler();
                  if (oContext.hasPendingChanges()) {
                    oContext.getBinding().resetChanges();
                  }
                  oContext.refresh();
                },
                text: oResourceBundle.getText("C_COMMON_SAPFE_REFRESH"),
                type: ButtonType.Emphasized
              }));
            });
          } else {
            oDialog.destroyBeginButton();
          }
          sHighestPriority = fnGetHighestMessagePriority(oMessageView.getItems());
          sHighestPriorityText = getTranslatedTextForMessageDialog(sHighestPriority);
          oDialog.setState(sHighestPriority);
          oDialog.getCustomHeader().getContentMiddle()[0].setText(sHighestPriorityText);
          oMessageView.navigateBack();
          oDialog.open();
          if (bOnlyForTest) {
            resolve(oDialog);
          }
        }).catch(reject);
      });
    } else if (showMessageBox) {
      return new Promise(function (resolve) {
        const oMessage = aTransitionMessages[0];
        if (oMessage.technicalDetails && aMessageList.indexOf(oMessage.technicalDetails.originalMessage.message) === -1) {
          aMessageList.push(oMessage.technicalDetails.originalMessage.message);
          let formattedTextString = "<html><body>";
          const retryAfterMessage = getRetryAfterMessage(oMessage, true);
          if (retryAfterMessage) {
            formattedTextString = `<h6>${retryAfterMessage}</h6><br>`;
          }
          if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
            showMessageParameters.fnGetMessageSubtitle(oMessage);
          }
          if (oMessage.getCode() !== "503" && oMessage.getAdditionalText() !== undefined) {
            formattedTextString = `${formattedTextString + oMessage.getAdditionalText()}: ${oMessage.getMessage()}</html></body>`;
          } else {
            formattedTextString = `${formattedTextString + oMessage.getMessage()}</html></body>`;
          }
          const formattedText = new FormattedText({
            htmlText: formattedTextString
          });
          MessageBox.error(formattedText, {
            onClose: function () {
              aMessageList = [];
              if (bShowBoundTransition) {
                removeBoundTransitionMessages();
              }
              removeUnboundTransitionMessages();
              resolve(true);
            }
          });
        }
      });
    } else {
      return Promise.resolve(true);
    }
  }

  /**
   * This function sets the group name for all messages in a dialog.
   *
   * @param aModelDataArray Messages array
   * @param control
   * @param sActionName
   * @param viewType
   */
  function updateMessageObjectGroupName(aModelDataArray, control, sActionName, viewType) {
    aModelDataArray.forEach(aModelData => {
      var _aModelData$target;
      aModelData["headerName"] = "";
      if (!((_aModelData$target = aModelData.target) !== null && _aModelData$target !== void 0 && _aModelData$target.length)) {
        // unbound transiiton messages
        aModelData["headerName"] = "General";
      } else if (aModelData.target.length) {
        // LR flow
        if (viewType === "ListReport") {
          messageHandling.setGroupNameLRTable(control, aModelData, sActionName);
        } else if (viewType === "ObjectPage") {
          // OP Display mode
          messageHandling.setGroupNameOPDisplayMode(aModelData, sActionName, control);
        } else {
          aModelData["headerName"] = messageHandling.getLastActionTextAndActionName(sActionName);
        }
      }
    });
  }

  /**
   * This function will set the group name of Message Object for LR table.
   *
   * @param oElem
   * @param aModelData
   * @param sActionName
   */
  function setGroupNameLRTable(oElem, aModelData, sActionName) {
    const oRowBinding = oElem && oElem.getRowBinding();
    if (oRowBinding) {
      var _aModelData$target2;
      const sElemeBindingPath = `${oElem.getRowBinding().getPath()}`;
      if (((_aModelData$target2 = aModelData.target) === null || _aModelData$target2 === void 0 ? void 0 : _aModelData$target2.indexOf(sElemeBindingPath)) === 0) {
        const allRowContexts = oElem.getRowBinding().getContexts();
        allRowContexts.forEach(rowContext => {
          var _aModelData$target3;
          if ((_aModelData$target3 = aModelData.target) !== null && _aModelData$target3 !== void 0 && _aModelData$target3.includes(rowContext.getPath())) {
            const contextPath = `${rowContext.getPath()}/`;
            const identifierColumn = oElem.getParent().getIdentifierColumn();
            const rowIdentifier = identifierColumn && rowContext.getObject()[identifierColumn];
            const columnPropertyName = messageHandling.getTableColProperty(oElem, aModelData, contextPath);
            const {
              sTableTargetColName
            } = messageHandling.getTableColInfo(oElem, columnPropertyName);

            // if target has some column name and column is visible in UI
            if (columnPropertyName && sTableTargetColName) {
              // header will be row Identifier, if found from above code otherwise it should be table name
              aModelData["headerName"] = rowIdentifier ? ` ${rowIdentifier}` : oElem.getHeader();
            } else {
              // if column data not found (may be the column is hidden), add grouping as Last Action
              aModelData["headerName"] = messageHandling.getLastActionTextAndActionName(sActionName);
            }
          }
        });
      }
    }
  }

  /**
   * This function will set the group name of Message Object in OP Display mode.
   *
   * @param aModelData Message Object
   * @param sActionName  Action name
   * @param control
   */
  function setGroupNameOPDisplayMode(aModelData, sActionName, control) {
    const oViewContext = control === null || control === void 0 ? void 0 : control.getBindingContext();
    const opLayout = (control === null || control === void 0 ? void 0 : control.getContent) && (control === null || control === void 0 ? void 0 : control.getContent()[0]);
    let bIsGeneralGroupName = true;
    if (opLayout) {
      messageHandling.getVisibleSectionsFromObjectPageLayout(opLayout).forEach(function (oSection) {
        const subSections = oSection.getSubSections();
        subSections.forEach(function (oSubSection) {
          oSubSection.findElements(true).forEach(function (oElem) {
            if (oElem.isA("sap.ui.mdc.Table")) {
              const oRowBinding = oElem.getRowBinding(),
                setSectionNameInGroup = true;
              let childTableElement;
              oElem.findElements(true).forEach(oElement => {
                if (oElement.isA("sap.m.Table") || oElement.isA("sap.ui.table.Table")) {
                  childTableElement = oElement;
                }
              });
              if (oRowBinding) {
                var _oElem$getRowBinding, _aModelData$target4;
                const sElemeBindingPath = `${oViewContext === null || oViewContext === void 0 ? void 0 : oViewContext.getPath()}/${(_oElem$getRowBinding = oElem.getRowBinding()) === null || _oElem$getRowBinding === void 0 ? void 0 : _oElem$getRowBinding.getPath()}`;
                if (((_aModelData$target4 = aModelData.target) === null || _aModelData$target4 === void 0 ? void 0 : _aModelData$target4.indexOf(sElemeBindingPath)) === 0) {
                  const obj = messageHandling.getTableColumnDataAndSetSubtile(aModelData, oElem, childTableElement, oRowBinding, sActionName, setSectionNameInGroup, fnCallbackSetGroupName);
                  const {
                    oTargetTableInfo
                  } = obj;
                  if (setSectionNameInGroup) {
                    const identifierColumn = oElem.getParent().getIdentifierColumn();
                    if (identifierColumn) {
                      const allRowContexts = oElem.getRowBinding().getContexts();
                      allRowContexts.forEach(rowContext => {
                        var _aModelData$target5;
                        if ((_aModelData$target5 = aModelData.target) !== null && _aModelData$target5 !== void 0 && _aModelData$target5.includes(rowContext.getPath())) {
                          const rowIdentifier = identifierColumn ? rowContext.getObject()[identifierColumn] : undefined;
                          aModelData["additionalText"] = `${rowIdentifier}, ${oTargetTableInfo.sTableTargetColName}`;
                        }
                      });
                    } else {
                      aModelData["additionalText"] = `${oTargetTableInfo.sTableTargetColName}`;
                    }
                    let headerName = oElem.getHeaderVisible() && oTargetTableInfo.tableHeader;
                    if (!headerName) {
                      headerName = oSubSection.getTitle();
                    } else {
                      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
                      headerName = `${oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${headerName}`;
                    }
                    aModelData["headerName"] = headerName;
                    bIsGeneralGroupName = false;
                  }
                }
              }
            }
          });
        });
      });
    }
    if (bIsGeneralGroupName) {
      var _aModelData$target6;
      const sElemeBindingPath = `${oViewContext === null || oViewContext === void 0 ? void 0 : oViewContext.getPath()}`;
      if (((_aModelData$target6 = aModelData.target) === null || _aModelData$target6 === void 0 ? void 0 : _aModelData$target6.indexOf(sElemeBindingPath)) === 0) {
        // check if OP context path is part of target, set Last Action as group name
        const headerName = messageHandling.getLastActionTextAndActionName(sActionName);
        aModelData["headerName"] = headerName;
      } else {
        aModelData["headerName"] = "General";
      }
    }
  }
  function getLastActionTextAndActionName(sActionName) {
    const sLastActionText = Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_LAST_ACTION");
    return sActionName ? `${sLastActionText}: ${sActionName}` : "";
  }

  /**
   * This function will give rank based on Message Group/Header name, which will be used for Sorting messages in Message dialog
   * Last Action should be shown at top, next Row Id and last General.
   *
   * @param obj
   * @returns Rank of message
   */
  function getMessageRank(obj) {
    var _obj$headerName, _obj$headerName2;
    if ((_obj$headerName = obj.headerName) !== null && _obj$headerName !== void 0 && _obj$headerName.toString().includes("Last Action")) {
      return 1;
    } else if ((_obj$headerName2 = obj.headerName) !== null && _obj$headerName2 !== void 0 && _obj$headerName2.toString().includes("General")) {
      return 3;
    } else {
      return 2;
    }
  }

  /**
   * This function will set the group name which can either General or Last Action.
   *
   * @param aMessage
   * @param sActionName
   * @param bIsGeneralGroupName
   */
  const fnCallbackSetGroupName = (aMessage, sActionName, bIsGeneralGroupName) => {
    if (bIsGeneralGroupName) {
      const sGeneralGroupText = Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_GENERAL");
      aMessage["headerName"] = sGeneralGroupText;
    } else {
      aMessage["headerName"] = messageHandling.getLastActionTextAndActionName(sActionName);
    }
  };

  /**
   * This function will get the table row/column info and set subtitle.
   *
   * @param aMessage
   * @param oTable
   * @param oElement
   * @param oRowBinding
   * @param sActionName
   * @param setSectionNameInGroup
   * @param fnSetGroupName
   * @returns Table info and Subtitle.
   */
  function getTableColumnDataAndSetSubtile(aMessage, oTable, oElement, oRowBinding, sActionName, setSectionNameInGroup, fnSetGroupName) {
    const oTargetTableInfo = messageHandling.getTableAndTargetInfo(oTable, aMessage, oElement, oRowBinding);
    const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    oTargetTableInfo.tableHeader = oTable.getHeader();
    let sControlId, bIsCreationRow;
    if (!oTargetTableInfo.oTableRowContext) {
      sControlId = aMessage.getControlIds().find(function (sId) {
        return messageHandling.isControlInTable(oTable, sId);
      });
    }
    if (sControlId) {
      const oControl = Core.byId(sControlId);
      bIsCreationRow = messageHandling.isControlPartOfCreationRow(oControl);
    }
    if (!oTargetTableInfo.sTableTargetColName) {
      // if the column is not present on UI or the target does not have a table field in it, use Last Action for grouping
      if (aMessage.persistent && sActionName) {
        fnSetGroupName(aMessage, sActionName);
        setSectionNameInGroup = false;
      }
    }
    const subTitle = messageHandling.getMessageSubtitle(aMessage, oTargetTableInfo.oTableRowBindingContexts, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oResourceBundle, oTable, bIsCreationRow);
    return {
      oTargetTableInfo,
      subTitle
    };
  }

  /**
   * This function will create the subtitle based on Table Row/Column data.
   *
   * @param message
   * @param oTableRowBindingContexts
   * @param oTableRowContext
   * @param sTableTargetColName
   * @param oResourceBundle
   * @param oTable
   * @param bIsCreationRow
   * @param oTargetedControl
   * @returns Message subtitle.
   */
  function getMessageSubtitle(message, oTableRowBindingContexts, oTableRowContext, sTableTargetColName, oResourceBundle, oTable, bIsCreationRow, oTargetedControl) {
    let sMessageSubtitle;
    let sRowSubtitleValue;
    const sTableFirstColProperty = oTable.getParent().getIdentifierColumn();
    const oColFromTableSettings = messageHandling.fetchColumnInfo(message, oTable);
    if (bIsCreationRow) {
      sMessageSubtitle = CommonUtils.getTranslatedText("T_MESSAGE_ITEM_SUBTITLE", oResourceBundle, [oResourceBundle.getText("T_MESSAGE_ITEM_SUBTITLE_CREATION_ROW_INDICATOR"), sTableTargetColName ? sTableTargetColName : oColFromTableSettings.label]);
    } else {
      const oTableFirstColBindingContextTextAnnotation = messageHandling.getTableFirstColBindingContextForTextAnnotation(oTable, oTableRowContext, sTableFirstColProperty);
      const sTableFirstColTextAnnotationPath = oTableFirstColBindingContextTextAnnotation ? oTableFirstColBindingContextTextAnnotation.getObject("$Path") : undefined;
      const sTableFirstColTextArrangement = sTableFirstColTextAnnotationPath && oTableFirstColBindingContextTextAnnotation ? oTableFirstColBindingContextTextAnnotation.getObject("@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember") : undefined;
      if (oTableRowBindingContexts.length > 0) {
        // set Row subtitle text
        if (oTargetedControl) {
          // The UI error is on the first column, we then get the control input as the row indicator:
          sRowSubtitleValue = oTargetedControl.getValue();
        } else if (oTableRowContext && sTableFirstColProperty) {
          sRowSubtitleValue = messageHandling.getTableFirstColValue(sTableFirstColProperty, oTableRowContext, sTableFirstColTextAnnotationPath, sTableFirstColTextArrangement);
        } else {
          sRowSubtitleValue = undefined;
        }
        // set the message subtitle
        const oColumnInfo = messageHandling.determineColumnInfo(oColFromTableSettings, oResourceBundle);
        if (sRowSubtitleValue && sTableTargetColName) {
          sMessageSubtitle = CommonUtils.getTranslatedText("T_MESSAGE_ITEM_SUBTITLE", oResourceBundle, [sRowSubtitleValue, sTableTargetColName]);
        } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Hidden") {
          sMessageSubtitle = `${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${sRowSubtitleValue}, ${oColumnInfo.sColumnValue}`;
        } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Unknown") {
          sMessageSubtitle = CommonUtils.getTranslatedText("T_MESSAGE_ITEM_SUBTITLE", oResourceBundle, [sRowSubtitleValue, oColumnInfo.sColumnValue]);
        } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "undefined") {
          sMessageSubtitle = `${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${sRowSubtitleValue}`;
        } else if (!sRowSubtitleValue && sTableTargetColName) {
          sMessageSubtitle = oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN") + ": " + sTableTargetColName;
        } else if (!sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Hidden") {
          sMessageSubtitle = oColumnInfo.sColumnValue;
        } else {
          sMessageSubtitle = null;
        }
      } else {
        sMessageSubtitle = null;
      }
    }
    return sMessageSubtitle;
  }

  /**
   * This function will get the first column for text Annotation, this is needed to set subtitle of Message.
   *
   * @param oTable
   * @param oTableRowContext
   * @param sTableFirstColProperty
   * @returns Binding context.
   */
  function getTableFirstColBindingContextForTextAnnotation(oTable, oTableRowContext, sTableFirstColProperty) {
    let oBindingContext;
    if (oTableRowContext && sTableFirstColProperty) {
      const oModel = oTable === null || oTable === void 0 ? void 0 : oTable.getModel();
      const oMetaModel = oModel === null || oModel === void 0 ? void 0 : oModel.getMetaModel();
      const sMetaPath = oMetaModel === null || oMetaModel === void 0 ? void 0 : oMetaModel.getMetaPath(oTableRowContext.getPath());
      if (oMetaModel !== null && oMetaModel !== void 0 && oMetaModel.getObject(`${sMetaPath}/${sTableFirstColProperty}@com.sap.vocabularies.Common.v1.Text/$Path`)) {
        oBindingContext = oMetaModel.createBindingContext(`${sMetaPath}/${sTableFirstColProperty}@com.sap.vocabularies.Common.v1.Text`);
      }
    }
    return oBindingContext;
  }

  /**
   * This function will get the value of first Column of Table, with its text Arrangement.
   *
   * @param sTableFirstColProperty
   * @param oTableRowContext
   * @param sTextAnnotationPath
   * @param sTextArrangement
   * @returns Column Value.
   */
  function getTableFirstColValue(sTableFirstColProperty, oTableRowContext, sTextAnnotationPath, sTextArrangement) {
    const sCodeValue = oTableRowContext.getValue(sTableFirstColProperty);
    let sTextValue;
    let sComputedValue = sCodeValue;
    if (sTextAnnotationPath) {
      if (sTableFirstColProperty.lastIndexOf("/") > 0) {
        // the target property is replaced with the text annotation path
        sTableFirstColProperty = sTableFirstColProperty.slice(0, sTableFirstColProperty.lastIndexOf("/") + 1);
        sTableFirstColProperty = sTableFirstColProperty.concat(sTextAnnotationPath);
      } else {
        sTableFirstColProperty = sTextAnnotationPath;
      }
      sTextValue = oTableRowContext.getValue(sTableFirstColProperty);
      if (sTextValue) {
        if (sTextArrangement) {
          const sEnumNumber = sTextArrangement.slice(sTextArrangement.indexOf("/") + 1);
          switch (sEnumNumber) {
            case "TextOnly":
              sComputedValue = sTextValue;
              break;
            case "TextFirst":
              sComputedValue = `${sTextValue} (${sCodeValue})`;
              break;
            case "TextLast":
              sComputedValue = `${sCodeValue} (${sTextValue})`;
              break;
            case "TextSeparate":
              sComputedValue = sCodeValue;
              break;
            default:
          }
        } else {
          sComputedValue = `${sTextValue} (${sCodeValue})`;
        }
      }
    }
    return sComputedValue;
  }

  /**
   * The method that is called to retrieve the column info from the associated message of the message popover.
   *
   * @private
   * @param oMessage Message object
   * @param oTable MdcTable
   * @returns Returns the column info.
   */
  function fetchColumnInfo(oMessage, oTable) {
    const sColNameFromMessageObj = oMessage === null || oMessage === void 0 ? void 0 : oMessage.getTargets()[0].split("/").pop();
    return oTable.getParent().getTableDefinition().columns.find(function (oColumn) {
      return oColumn.key.split("::").pop() === sColNameFromMessageObj;
    });
  }

  /**
   * This function get the Column data depending on its availability in Table, this is needed for setting subtitle of Message.
   *
   * @param oColFromTableSettings
   * @param oResourceBundle
   * @returns Column data.
   */
  function determineColumnInfo(oColFromTableSettings, oResourceBundle) {
    const oColumnInfo = {
      sColumnIndicator: String,
      sColumnValue: String
    };
    if (oColFromTableSettings) {
      // if column is neither in table definition nor personalization, show only row subtitle text
      if (oColFromTableSettings.availability === "Hidden") {
        oColumnInfo.sColumnValue = undefined;
        oColumnInfo.sColumnIndicator = "undefined";
      } else {
        //if column is in table personalization but not in table definition, show Column (Hidden) : <colName>
        oColumnInfo.sColumnValue = `${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")} (${oResourceBundle.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION")}): ${oColFromTableSettings.label}`;
        oColumnInfo.sColumnIndicator = "Hidden";
      }
    } else {
      oColumnInfo.sColumnValue = oResourceBundle.getText("T_MESSAGE_ITEM_SUBTITLE_INDICATOR_UNKNOWN");
      oColumnInfo.sColumnIndicator = "Unknown";
    }
    return oColumnInfo;
  }

  /**
   * This function check if a given control id is a part of Table.
   *
   * @param oTable
   * @param sControlId
   * @returns True if control is part of table.
   */
  function isControlInTable(oTable, sControlId) {
    const oControl = Core.byId(sControlId);
    if (oControl && !oControl.isA("sap.ui.table.Table") && !oControl.isA("sap.m.Table")) {
      return oTable.findElements(true, function (oElem) {
        return oElem.getId() === oControl;
      });
    }
    return false;
  }
  function isControlPartOfCreationRow(oControl) {
    let oParentControl = oControl === null || oControl === void 0 ? void 0 : oControl.getParent();
    while (oParentControl && !((_oParentControl = oParentControl) !== null && _oParentControl !== void 0 && _oParentControl.isA("sap.ui.table.Row")) && !((_oParentControl2 = oParentControl) !== null && _oParentControl2 !== void 0 && _oParentControl2.isA("sap.ui.table.CreationRow")) && !((_oParentControl3 = oParentControl) !== null && _oParentControl3 !== void 0 && _oParentControl3.isA("sap.m.ColumnListItem"))) {
      var _oParentControl, _oParentControl2, _oParentControl3;
      oParentControl = oParentControl.getParent();
    }
    return !!oParentControl && oParentControl.isA("sap.ui.table.CreationRow");
  }
  function getTranslatedTextForMessageDialog(sHighestPriority) {
    const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    switch (sHighestPriority) {
      case "Error":
        return oResourceBundle.getText("C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERROR");
      case "Information":
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_INFO");
      case "Success":
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_SUCCESS");
      case "Warning":
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNING");
      default:
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE");
    }
  }
  function removeUnboundTransitionMessages() {
    removeTransitionMessages(false);
  }
  function removeBoundTransitionMessages(sPathToBeRemoved) {
    removeTransitionMessages(true, sPathToBeRemoved);
  }
  function getMessagesFromMessageModel(oMessageModel, sPathToBeRemoved) {
    if (sPathToBeRemoved === undefined) {
      return oMessageModel.getObject("/");
    }
    const listBinding = oMessageModel.bindList("/");
    listBinding.filter(new Filter({
      path: "target",
      operator: FilterOperator.StartsWith,
      value1: sPathToBeRemoved
    }));
    return listBinding.getCurrentContexts().map(function (oContext) {
      return oContext.getObject();
    });
  }
  function getMessages() {
    let bBoundMessages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    let bTransitionOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let sPathToBeRemoved = arguments.length > 2 ? arguments[2] : undefined;
    let i;
    const oMessageManager = Core.getMessageManager(),
      oMessageModel = oMessageManager.getMessageModel(),
      oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
      aTransitionMessages = [];
    let aMessages = [];
    if (bBoundMessages && bTransitionOnly && sPathToBeRemoved) {
      aMessages = getMessagesFromMessageModel(oMessageModel, sPathToBeRemoved);
    } else {
      aMessages = oMessageModel.getObject("/");
    }
    for (i = 0; i < aMessages.length; i++) {
      if ((!bTransitionOnly || aMessages[i].persistent) && (bBoundMessages && aMessages[i].target !== "" || !bBoundMessages && (!aMessages[i].target || aMessages[i].target === ""))) {
        aTransitionMessages.push(aMessages[i]);
      }
    }
    for (i = 0; i < aTransitionMessages.length; i++) {
      if (aTransitionMessages[i].code === "503" && aTransitionMessages[i].message !== "" && aTransitionMessages[i].message.indexOf(oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")) === -1) {
        aTransitionMessages[i].message = `\n${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")}${aTransitionMessages[i].message}`;
      }
    }
    //Filtering messages again here to avoid showing pure technical messages raised by the model
    const backendMessages = [];
    for (i = 0; i < aTransitionMessages.length; i++) {
      if (aTransitionMessages[i].technicalDetails && (aTransitionMessages[i].technicalDetails.originalMessage !== undefined && aTransitionMessages[i].technicalDetails.originalMessage !== null || aTransitionMessages[i].technicalDetails.httpStatus !== undefined && aTransitionMessages[i].technicalDetails.httpStatus !== null) || aTransitionMessages[i].code) {
        backendMessages.push(aTransitionMessages[i]);
      }
    }
    return backendMessages;
  }
  function removeTransitionMessages(bBoundMessages, sPathToBeRemoved) {
    const aMessagesToBeDeleted = getMessages(bBoundMessages, true, sPathToBeRemoved);
    if (aMessagesToBeDeleted.length > 0) {
      Core.getMessageManager().removeMessages(aMessagesToBeDeleted);
    }
  }
  //TODO: This must be moved out of message handling
  function setMessageSubtitle(oTable, aContexts, message) {
    const subtitleColumn = oTable.getParent().getIdentifierColumn();
    const errorContext = aContexts.find(function (oContext) {
      return message.getTargets()[0].indexOf(oContext.getPath()) !== -1;
    });
    message.additionalText = errorContext ? errorContext.getObject()[subtitleColumn] : undefined;
  }

  /**
   * The method retrieves the visible sections from an object page.
   *
   * @param oObjectPageLayout The objectPageLayout object for which we want to retrieve the visible sections.
   * @returns Array of visible sections.
   * @private
   */
  function getVisibleSectionsFromObjectPageLayout(oObjectPageLayout) {
    return oObjectPageLayout.getSections().filter(function (oSection) {
      return oSection.getVisible();
    });
  }

  /**
   * This function checks if control ids from message are a part of a given subsection.
   *
   * @param subSection
   * @param oMessageObject
   * @returns SubSection matching control ids.
   */
  function getControlFromMessageRelatingToSubSection(subSection, oMessageObject) {
    return subSection.findElements(true, oElem => {
      return fnFilterUponIds(oMessageObject.getControlIds(), oElem);
    }).sort(function (a, b) {
      // controls are sorted in order to have the table on top of the array
      // it will help to compute the subtitle of the message based on the type of related controls
      if (a.isA("sap.ui.mdc.Table") && !b.isA("sap.ui.mdc.Table")) {
        return -1;
      }
      return 1;
    });
  }
  function getTableColProperty(oTable, oMessageObject, oContextPath) {
    //this function escapes a string to use it as a regex
    const fnRegExpescape = function (s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    };
    // based on the target path of the message we retrieve the property name.
    // to achieve it we remove the bindingContext path and the row binding path from the target
    if (!oContextPath) {
      var _oTable$getBindingCon;
      oContextPath = new RegExp(`${fnRegExpescape(`${(_oTable$getBindingCon = oTable.getBindingContext()) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getPath()}/${oTable.getRowBinding().getPath()}`)}\\(.*\\)/`);
    }
    return oMessageObject.getTargets()[0].replace(oContextPath, "");
  }

  /**
   * This function gives the column information if it matches with the property name from target of message.
   *
   * @param oTable
   * @param sTableTargetColProperty
   * @returns Column name and property.
   */
  function getTableColInfo(oTable, sTableTargetColProperty) {
    let sTableTargetColName;
    let oTableTargetCol = oTable.getColumns().find(function (column) {
      return column.getDataProperty() == sTableTargetColProperty;
    });
    if (!oTableTargetCol) {
      /* If the target column is not found, we check for a custom column */
      const oCustomColumn = oTable.getControlDelegate().getColumnsFor(oTable).find(function (oColumn) {
        if (!!oColumn.template && oColumn.propertyInfos) {
          return oColumn.propertyInfos[0] === sTableTargetColProperty || oColumn.propertyInfos[0].replace("Property::", "") === sTableTargetColProperty;
        } else {
          return false;
        }
      });
      if (oCustomColumn) {
        var _oTableTargetCol;
        oTableTargetCol = oCustomColumn;
        sTableTargetColProperty = (_oTableTargetCol = oTableTargetCol) === null || _oTableTargetCol === void 0 ? void 0 : _oTableTargetCol.name;
        sTableTargetColName = oTable.getColumns().find(function (oColumn) {
          return sTableTargetColProperty === oColumn.getDataProperty();
        }).getHeader();
      } else {
        /* If the target column is not found, we check for a field group */
        const aColumns = oTable.getControlDelegate().getColumnsFor(oTable);
        oTableTargetCol = aColumns.find(function (oColumn) {
          if (oColumn.key.indexOf("::FieldGroup::") !== -1) {
            var _oColumn$propertyInfo;
            return (_oColumn$propertyInfo = oColumn.propertyInfos) === null || _oColumn$propertyInfo === void 0 ? void 0 : _oColumn$propertyInfo.find(function () {
              return aColumns.find(function (tableColumn) {
                return tableColumn.relativePath === sTableTargetColProperty;
              });
            });
          }
        });
        /* check if the column with the field group is visible in the table: */
        let bIsTableTargetColVisible = false;
        if (oTableTargetCol && oTableTargetCol.label) {
          bIsTableTargetColVisible = oTable.getColumns().some(function (column) {
            return column.getHeader() === oTableTargetCol.label;
          });
        }
        sTableTargetColName = bIsTableTargetColVisible && oTableTargetCol.label;
        sTableTargetColProperty = bIsTableTargetColVisible && oTableTargetCol.key;
      }
    } else {
      sTableTargetColName = oTableTargetCol && oTableTargetCol.getHeader();
    }
    return {
      sTableTargetColName: sTableTargetColName,
      sTableTargetColProperty: sTableTargetColProperty
    };
  }

  /**
   * This function gives Table and column info if any of it matches the target from Message.
   *
   * @param oTable
   * @param oMessageObject
   * @param oElement
   * @param oRowBinding
   * @returns Table info matching the message target.
   */
  function getTableAndTargetInfo(oTable, oMessageObject, oElement, oRowBinding) {
    const oTargetTableInfo = {};
    oTargetTableInfo.sTableTargetColProperty = getTableColProperty(oTable, oMessageObject);
    const oTableColInfo = getTableColInfo(oTable, oTargetTableInfo.sTableTargetColProperty);
    oTargetTableInfo.oTableRowBindingContexts = oElement.isA("sap.ui.table.Table") ? oRowBinding.getContexts() : oRowBinding.getCurrentContexts();
    oTargetTableInfo.sTableTargetColName = oTableColInfo.sTableTargetColName;
    oTargetTableInfo.sTableTargetColProperty = oTableColInfo.sTableTargetColProperty;
    oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts.find(function (rowContext) {
      return rowContext && oMessageObject.getTargets()[0].indexOf(rowContext.getPath()) === 0;
    });
    return oTargetTableInfo;
  }

  /**
   *
   * @param aControlIds
   * @param oItem
   * @returns True if the item matches one of the controls
   */
  function fnFilterUponIds(aControlIds, oItem) {
    return aControlIds.some(function (sControlId) {
      if (sControlId === oItem.getId()) {
        return true;
      }
      return false;
    });
  }

  /**
   * This function gives the group name having section and subsection data.
   *
   * @param section
   * @param subSection
   * @param bMultipleSubSections
   * @param oTargetTableInfo
   * @param oResourceBundle
   * @returns Group name.
   */
  function createSectionGroupName(section, subSection, bMultipleSubSections, oTargetTableInfo, oResourceBundle) {
    return section.getTitle() + (subSection.getTitle() && bMultipleSubSections ? `, ${subSection.getTitle()}` : "") + (oTargetTableInfo ? `, ${oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTargetTableInfo.tableHeader}` : "");
  }
  function bIsOrphanElement(oElement, aElements) {
    return !aElements.some(function (oElem) {
      let oParentElement = oElement.getParent();
      while (oParentElement && oParentElement !== oElem) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement ? true : false;
    });
  }

  /**
   * Static functions for Fiori Message Handling
   *
   * @namespace
   * @alias sap.fe.core.actions.messageHandling
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.56.0
   */
  const messageHandling = {
    getMessages: getMessages,
    showUnboundMessages: showUnboundMessages,
    removeUnboundTransitionMessages: removeUnboundTransitionMessages,
    removeBoundTransitionMessages: removeBoundTransitionMessages,
    modifyETagMessagesOnly: fnModifyETagMessagesOnly,
    getRetryAfterMessage: getRetryAfterMessage,
    prepareMessageViewForDialog: prepareMessageViewForDialog,
    setMessageSubtitle: setMessageSubtitle,
    getVisibleSectionsFromObjectPageLayout: getVisibleSectionsFromObjectPageLayout,
    getControlFromMessageRelatingToSubSection: getControlFromMessageRelatingToSubSection,
    fnFilterUponIds: fnFilterUponIds,
    getTableAndTargetInfo: getTableAndTargetInfo,
    createSectionGroupName: createSectionGroupName,
    bIsOrphanElement: bIsOrphanElement,
    getLastActionTextAndActionName: getLastActionTextAndActionName,
    getTableColumnDataAndSetSubtile: getTableColumnDataAndSetSubtile,
    getTableColInfo: getTableColInfo,
    getTableColProperty: getTableColProperty,
    getMessageSubtitle: getMessageSubtitle,
    determineColumnInfo: determineColumnInfo,
    fetchColumnInfo: fetchColumnInfo,
    getTableFirstColBindingContextForTextAnnotation: getTableFirstColBindingContextForTextAnnotation,
    getMessageRank: getMessageRank,
    fnCallbackSetGroupName: fnCallbackSetGroupName,
    getTableFirstColValue: getTableFirstColValue,
    setGroupNameOPDisplayMode: setGroupNameOPDisplayMode,
    updateMessageObjectGroupName: updateMessageObjectGroupName,
    setGroupNameLRTable: setGroupNameLRTable,
    isControlInTable: isControlInTable,
    isControlPartOfCreationRow: isControlPartOfCreationRow
  };
  return messageHandling;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlVHlwZSIsIkNvcmVMaWIiLCJhTWVzc2FnZUxpc3QiLCJhTWVzc2FnZURhdGFMaXN0IiwiYVJlc29sdmVGdW5jdGlvbnMiLCJvRGlhbG9nIiwib0JhY2tCdXR0b24iLCJvTWVzc2FnZVZpZXciLCJmbkZvcm1hdFRlY2huaWNhbERldGFpbHMiLCJzUHJldmlvdXNHcm91cE5hbWUiLCJpbnNlcnREZXRhaWwiLCJvUHJvcGVydHkiLCJwcm9wZXJ0eSIsInN1YnN0ciIsIk1hdGgiLCJtYXgiLCJsYXN0SW5kZXhPZiIsImluc2VydEdyb3VwTmFtZSIsInNIVE1MIiwiZ3JvdXBOYW1lIiwiZ2V0UGF0aHMiLCJzVEQiLCJmb3JFYWNoIiwiZm5Gb3JtYXREZXNjcmlwdGlvbiIsImZuR2V0SGlnaGVzdE1lc3NhZ2VQcmlvcml0eSIsImFNZXNzYWdlcyIsInNNZXNzYWdlUHJpb3JpdHkiLCJOb25lIiwiaUxlbmd0aCIsImxlbmd0aCIsIm9NZXNzYWdlQ291bnQiLCJFcnJvciIsIldhcm5pbmciLCJTdWNjZXNzIiwiSW5mb3JtYXRpb24iLCJpIiwiZ2V0VHlwZSIsImZuTW9kaWZ5RVRhZ01lc3NhZ2VzT25seSIsIm9NZXNzYWdlTWFuYWdlciIsIm9SZXNvdXJjZUJ1bmRsZSIsImNvbmN1cnJlbnRFZGl0RmxhZyIsImdldE1lc3NhZ2VNb2RlbCIsImdldE9iamVjdCIsImJNZXNzYWdlc01vZGlmaWVkIiwic0V0YWdNZXNzYWdlIiwib01lc3NhZ2UiLCJvVGVjaG5pY2FsRGV0YWlscyIsImdldFRlY2huaWNhbERldGFpbHMiLCJodHRwU3RhdHVzIiwiaXNDb25jdXJyZW50TW9kaWZpY2F0aW9uIiwiZ2V0VGV4dCIsInJlbW92ZU1lc3NhZ2VzIiwic2V0TWVzc2FnZSIsInRhcmdldCIsImFkZE1lc3NhZ2VzIiwiZGlhbG9nQ2xvc2VIYW5kbGVyIiwiY2xvc2UiLCJzZXRWaXNpYmxlIiwib01lc3NhZ2VEaWFsb2dNb2RlbCIsImdldE1vZGVsIiwic2V0RGF0YSIsInJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJnZXRSZXRyeUFmdGVyTWVzc2FnZSIsImJNZXNzYWdlRGlhbG9nIiwiZE5vdyIsIkRhdGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwic1JldHJ5QWZ0ZXJNZXNzYWdlIiwicmV0cnlBZnRlciIsImRSZXRyeUFmdGVyIiwib0RhdGVGb3JtYXQiLCJnZXRGdWxsWWVhciIsIkRhdGVGb3JtYXQiLCJnZXREYXRlVGltZUluc3RhbmNlIiwicGF0dGVybiIsImZvcm1hdCIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsInByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyIsImJTdHJpY3RIYW5kbGluZ0Zsb3ciLCJtdWx0aTQxMiIsIm9NZXNzYWdlVGVtcGxhdGUiLCJNZXNzYWdlSXRlbSIsInVuZGVmaW5lZCIsImNvdW50ZXIiLCJwYXRoIiwidGl0bGUiLCJzdWJ0aXRsZSIsImxvbmd0ZXh0VXJsIiwidHlwZSIsImRlc2NyaXB0aW9uIiwibWFya3VwRGVzY3JpcHRpb24iLCJNZXNzYWdlVmlldyIsInNob3dEZXRhaWxzUGFnZUhlYWRlciIsIml0ZW1TZWxlY3QiLCJpdGVtcyIsInRlbXBsYXRlIiwic2V0R3JvdXBJdGVtcyIsIkJ1dHRvbiIsImljb24iLCJJY29uUG9vbCIsImdldEljb25VUkkiLCJ2aXNpYmxlIiwicHJlc3MiLCJuYXZpZ2F0ZUJhY2siLCJzZXRNb2RlbCIsInNob3dVbmJvdW5kTWVzc2FnZXMiLCJhQ3VzdG9tTWVzc2FnZXMiLCJvQ29udGV4dCIsImJTaG93Qm91bmRUcmFuc2l0aW9uIiwiY29udHJvbCIsInNBY3Rpb25OYW1lIiwiYk9ubHlGb3JUZXN0Iiwib25CZWZvcmVTaG93TWVzc2FnZSIsInZpZXdUeXBlIiwiYVRyYW5zaXRpb25NZXNzYWdlcyIsImdldE1lc3NhZ2VzIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJzSGlnaGVzdFByaW9yaXR5Iiwic0hpZ2hlc3RQcmlvcml0eVRleHQiLCJhRmlsdGVycyIsIkZpbHRlciIsIm9wZXJhdG9yIiwiRmlsdGVyT3BlcmF0b3IiLCJORSIsInZhbHVlMSIsInNob3dNZXNzYWdlRGlhbG9nIiwic2hvd01lc3NhZ2VCb3giLCJjb25jYXQiLCJwdXNoIiwiRVEiLCJmbkNoZWNrQ29udHJvbElkSW5EaWFsb2ciLCJhQ29udHJvbElkcyIsImluZGV4IiwiSW5maW5pdHkiLCJvQ29udHJvbCIsImJ5SWQiLCJlcnJvckZpZWxkQ29udHJvbCIsImZpZWxkUmFua2luRGlhbG9nIiwiRGlhbG9nIiwiZ2V0UGFyZW50IiwiZmluZEVsZW1lbnRzIiwiaW5kZXhPZiIsImZvY3VzIiwidGVzdCIsImNhc2VTZW5zaXRpdmUiLCJtZXNzYWdlQ29kZSIsImNvZGUiLCJNZXNzYWdlIiwibWVzc2FnZSIsInRleHQiLCJwZXJzaXN0ZW50IiwiSlNPTk1vZGVsIiwiYkhhc0V0YWdNZXNzYWdlIiwibW9kaWZ5RVRhZ01lc3NhZ2VzT25seSIsImdldENvZGUiLCJzaG93TWVzc2FnZVBhcmFtZXRlcnMiLCJhTW9kZWxEYXRhQXJyYXkiLCJvTGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsImFDdXJyZW50Q29udGV4dHMiLCJnZXRDdXJyZW50Q29udGV4dHMiLCJjdXJyZW50Q29udGV4dCIsImV4aXN0aW5nTWVzc2FnZXMiLCJBcnJheSIsImlzQXJyYXkiLCJnZXREYXRhIiwib1VuaXF1ZU9iaiIsImZpbHRlciIsIm9iaiIsImlkIiwiZmlsdGVyZWRNZXNzYWdlcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiTWVzc2FnZVRvYXN0Iiwic2hvdyIsIm1lc3NhZ2VIYW5kbGluZyIsInVwZGF0ZU1lc3NhZ2VPYmplY3RHcm91cE5hbWUiLCJyZWplY3QiLCJ0aGVuIiwiZm5HZXRNZXNzYWdlU3VidGl0bGUiLCJvTWVzc2FnZU9iamVjdCIsIm9Tb3J0ZXIiLCJTb3J0ZXIiLCJvYmoxIiwib2JqMiIsInJhbmtBIiwiZ2V0TWVzc2FnZVJhbmsiLCJyYW5rQiIsImdldEJpbmRpbmciLCJzb3J0IiwiaXNPcGVuIiwicmVzaXphYmxlIiwiZW5kQnV0dG9uIiwiY3VzdG9tSGVhZGVyIiwiQmFyIiwiY29udGVudE1pZGRsZSIsIlRleHQiLCJjb250ZW50TGVmdCIsImNvbnRlbnRXaWR0aCIsImNvbnRlbnRIZWlnaHQiLCJ2ZXJ0aWNhbFNjcm9sbGluZyIsImFmdGVyQ2xvc2UiLCJjYWxsIiwicmVtb3ZlQWxsQ29udGVudCIsImFkZENvbnRlbnQiLCJzYXAiLCJ1aSIsInJlcXVpcmUiLCJCdXR0b25UeXBlIiwic2V0QmVnaW5CdXR0b24iLCJoYXNQZW5kaW5nQ2hhbmdlcyIsInJlc2V0Q2hhbmdlcyIsInJlZnJlc2giLCJFbXBoYXNpemVkIiwiZGVzdHJveUJlZ2luQnV0dG9uIiwiZ2V0SXRlbXMiLCJnZXRUcmFuc2xhdGVkVGV4dEZvck1lc3NhZ2VEaWFsb2ciLCJzZXRTdGF0ZSIsImdldEN1c3RvbUhlYWRlciIsImdldENvbnRlbnRNaWRkbGUiLCJzZXRUZXh0Iiwib3BlbiIsImNhdGNoIiwidGVjaG5pY2FsRGV0YWlscyIsIm9yaWdpbmFsTWVzc2FnZSIsImZvcm1hdHRlZFRleHRTdHJpbmciLCJyZXRyeUFmdGVyTWVzc2FnZSIsImdldEFkZGl0aW9uYWxUZXh0IiwiZ2V0TWVzc2FnZSIsImZvcm1hdHRlZFRleHQiLCJGb3JtYXR0ZWRUZXh0IiwiaHRtbFRleHQiLCJNZXNzYWdlQm94IiwiZXJyb3IiLCJvbkNsb3NlIiwicmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJhTW9kZWxEYXRhIiwic2V0R3JvdXBOYW1lTFJUYWJsZSIsInNldEdyb3VwTmFtZU9QRGlzcGxheU1vZGUiLCJnZXRMYXN0QWN0aW9uVGV4dEFuZEFjdGlvbk5hbWUiLCJvRWxlbSIsIm9Sb3dCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsInNFbGVtZUJpbmRpbmdQYXRoIiwiZ2V0UGF0aCIsImFsbFJvd0NvbnRleHRzIiwiZ2V0Q29udGV4dHMiLCJyb3dDb250ZXh0IiwiaW5jbHVkZXMiLCJjb250ZXh0UGF0aCIsImlkZW50aWZpZXJDb2x1bW4iLCJnZXRJZGVudGlmaWVyQ29sdW1uIiwicm93SWRlbnRpZmllciIsImNvbHVtblByb3BlcnR5TmFtZSIsImdldFRhYmxlQ29sUHJvcGVydHkiLCJzVGFibGVUYXJnZXRDb2xOYW1lIiwiZ2V0VGFibGVDb2xJbmZvIiwiZ2V0SGVhZGVyIiwib1ZpZXdDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJvcExheW91dCIsImdldENvbnRlbnQiLCJiSXNHZW5lcmFsR3JvdXBOYW1lIiwiZ2V0VmlzaWJsZVNlY3Rpb25zRnJvbU9iamVjdFBhZ2VMYXlvdXQiLCJvU2VjdGlvbiIsInN1YlNlY3Rpb25zIiwiZ2V0U3ViU2VjdGlvbnMiLCJvU3ViU2VjdGlvbiIsImlzQSIsInNldFNlY3Rpb25OYW1lSW5Hcm91cCIsImNoaWxkVGFibGVFbGVtZW50Iiwib0VsZW1lbnQiLCJnZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlIiwiZm5DYWxsYmFja1NldEdyb3VwTmFtZSIsIm9UYXJnZXRUYWJsZUluZm8iLCJoZWFkZXJOYW1lIiwiZ2V0SGVhZGVyVmlzaWJsZSIsInRhYmxlSGVhZGVyIiwiZ2V0VGl0bGUiLCJzTGFzdEFjdGlvblRleHQiLCJ0b1N0cmluZyIsImFNZXNzYWdlIiwic0dlbmVyYWxHcm91cFRleHQiLCJvVGFibGUiLCJmblNldEdyb3VwTmFtZSIsImdldFRhYmxlQW5kVGFyZ2V0SW5mbyIsInNDb250cm9sSWQiLCJiSXNDcmVhdGlvblJvdyIsIm9UYWJsZVJvd0NvbnRleHQiLCJnZXRDb250cm9sSWRzIiwiZmluZCIsInNJZCIsImlzQ29udHJvbEluVGFibGUiLCJpc0NvbnRyb2xQYXJ0T2ZDcmVhdGlvblJvdyIsInN1YlRpdGxlIiwiZ2V0TWVzc2FnZVN1YnRpdGxlIiwib1RhYmxlUm93QmluZGluZ0NvbnRleHRzIiwib1RhcmdldGVkQ29udHJvbCIsInNNZXNzYWdlU3VidGl0bGUiLCJzUm93U3VidGl0bGVWYWx1ZSIsInNUYWJsZUZpcnN0Q29sUHJvcGVydHkiLCJvQ29sRnJvbVRhYmxlU2V0dGluZ3MiLCJmZXRjaENvbHVtbkluZm8iLCJDb21tb25VdGlscyIsImdldFRyYW5zbGF0ZWRUZXh0IiwibGFiZWwiLCJvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb24iLCJnZXRUYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRGb3JUZXh0QW5ub3RhdGlvbiIsInNUYWJsZUZpcnN0Q29sVGV4dEFubm90YXRpb25QYXRoIiwic1RhYmxlRmlyc3RDb2xUZXh0QXJyYW5nZW1lbnQiLCJnZXRWYWx1ZSIsImdldFRhYmxlRmlyc3RDb2xWYWx1ZSIsIm9Db2x1bW5JbmZvIiwiZGV0ZXJtaW5lQ29sdW1uSW5mbyIsInNDb2x1bW5JbmRpY2F0b3IiLCJzQ29sdW1uVmFsdWUiLCJvQmluZGluZ0NvbnRleHQiLCJvTW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsInNUZXh0QW5ub3RhdGlvblBhdGgiLCJzVGV4dEFycmFuZ2VtZW50Iiwic0NvZGVWYWx1ZSIsInNUZXh0VmFsdWUiLCJzQ29tcHV0ZWRWYWx1ZSIsInNsaWNlIiwic0VudW1OdW1iZXIiLCJzQ29sTmFtZUZyb21NZXNzYWdlT2JqIiwiZ2V0VGFyZ2V0cyIsInNwbGl0IiwicG9wIiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiY29sdW1ucyIsIm9Db2x1bW4iLCJrZXkiLCJTdHJpbmciLCJhdmFpbGFiaWxpdHkiLCJnZXRJZCIsIm9QYXJlbnRDb250cm9sIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwic1BhdGhUb0JlUmVtb3ZlZCIsImdldE1lc3NhZ2VzRnJvbU1lc3NhZ2VNb2RlbCIsIm9NZXNzYWdlTW9kZWwiLCJsaXN0QmluZGluZyIsIlN0YXJ0c1dpdGgiLCJtYXAiLCJiQm91bmRNZXNzYWdlcyIsImJUcmFuc2l0aW9uT25seSIsImJhY2tlbmRNZXNzYWdlcyIsImFNZXNzYWdlc1RvQmVEZWxldGVkIiwic2V0TWVzc2FnZVN1YnRpdGxlIiwiYUNvbnRleHRzIiwic3VidGl0bGVDb2x1bW4iLCJlcnJvckNvbnRleHQiLCJhZGRpdGlvbmFsVGV4dCIsIm9PYmplY3RQYWdlTGF5b3V0IiwiZ2V0U2VjdGlvbnMiLCJnZXRWaXNpYmxlIiwiZ2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb24iLCJzdWJTZWN0aW9uIiwiZm5GaWx0ZXJVcG9uSWRzIiwiYSIsImIiLCJvQ29udGV4dFBhdGgiLCJmblJlZ0V4cGVzY2FwZSIsInMiLCJyZXBsYWNlIiwiUmVnRXhwIiwic1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkiLCJvVGFibGVUYXJnZXRDb2wiLCJnZXRDb2x1bW5zIiwiY29sdW1uIiwiZ2V0RGF0YVByb3BlcnR5Iiwib0N1c3RvbUNvbHVtbiIsImdldENvbnRyb2xEZWxlZ2F0ZSIsImdldENvbHVtbnNGb3IiLCJwcm9wZXJ0eUluZm9zIiwibmFtZSIsImFDb2x1bW5zIiwidGFibGVDb2x1bW4iLCJyZWxhdGl2ZVBhdGgiLCJiSXNUYWJsZVRhcmdldENvbFZpc2libGUiLCJzb21lIiwib1RhYmxlQ29sSW5mbyIsIm9JdGVtIiwiY3JlYXRlU2VjdGlvbkdyb3VwTmFtZSIsInNlY3Rpb24iLCJiTXVsdGlwbGVTdWJTZWN0aW9ucyIsImJJc09ycGhhbkVsZW1lbnQiLCJhRWxlbWVudHMiLCJvUGFyZW50RWxlbWVudCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsibWVzc2FnZUhhbmRsaW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IEJhciBmcm9tIFwic2FwL20vQmFyXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IEZvcm1hdHRlZFRleHQgZnJvbSBcInNhcC9tL0Zvcm1hdHRlZFRleHRcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgTWVzc2FnZUl0ZW0gZnJvbSBcInNhcC9tL01lc3NhZ2VJdGVtXCI7XG5pbXBvcnQgTWVzc2FnZVRvYXN0IGZyb20gXCJzYXAvbS9NZXNzYWdlVG9hc3RcIjtcbmltcG9ydCBNZXNzYWdlVmlldyBmcm9tIFwic2FwL20vTWVzc2FnZVZpZXdcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IFVJNUVsZW1lbnQgZnJvbSBcInNhcC91aS9jb3JlL0VsZW1lbnRcIjtcbmltcG9ydCBEYXRlRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvRGF0ZUZvcm1hdFwiO1xuaW1wb3J0IEljb25Qb29sIGZyb20gXCJzYXAvdWkvY29yZS9JY29uUG9vbFwiO1xuaW1wb3J0IENvcmVMaWIgZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgQmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL0JpbmRpbmdcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgU29ydGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvU29ydGVyXCI7XG5pbXBvcnQgQ29sdW1uIGZyb20gXCJzYXAvdWkvdGFibGUvQ29sdW1uXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlTGF5b3V0IGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlTGF5b3V0XCI7XG5pbXBvcnQgT2JqZWN0UGFnZVNlY3Rpb24gZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VTZWN0aW9uXCI7XG5pbXBvcnQgT2JqZWN0UGFnZVN1YlNlY3Rpb24gZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VTdWJTZWN0aW9uXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcIi4uLy4uL0NvbW1vblV0aWxzXCI7XG5cbmNvbnN0IE1lc3NhZ2VUeXBlID0gQ29yZUxpYi5NZXNzYWdlVHlwZTtcbmxldCBhTWVzc2FnZUxpc3Q6IGFueVtdID0gW107XG5sZXQgYU1lc3NhZ2VEYXRhTGlzdDogYW55W10gPSBbXTtcbmxldCBhUmVzb2x2ZUZ1bmN0aW9uczogYW55W10gPSBbXTtcbmxldCBvRGlhbG9nOiBEaWFsb2c7XG5sZXQgb0JhY2tCdXR0b246IEJ1dHRvbjtcbmxldCBvTWVzc2FnZVZpZXc6IE1lc3NhZ2VWaWV3O1xuXG5leHBvcnQgdHlwZSBNZXNzYWdlV2l0aEhlYWRlciA9IE1lc3NhZ2UgJiB7XG5cdGhlYWRlck5hbWU/OiBzdHJpbmc7XG5cdHRhcmdldD86IHN0cmluZztcblx0YWRkaXRpb25hbFRleHQ/OiBzdHJpbmc7XG59O1xuXG50eXBlIFRhcmdldFRhYmxlSW5mb1R5cGUgPSB7XG5cdG9UYWJsZVJvd0JpbmRpbmdDb250ZXh0czogQ29udGV4dFtdO1xuXHRvVGFibGVSb3dDb250ZXh0OiBDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHRzVGFibGVUYXJnZXRDb2xOYW1lOiBzdHJpbmcgfCBib29sZWFuO1xuXHRzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTogc3RyaW5nO1xuXHR0YWJsZUhlYWRlcjogc3RyaW5nO1xufTtcblxudHlwZSBDb2xJbmZvQW5kU3VidGl0bGVUeXBlID0ge1xuXHRvVGFyZ2V0VGFibGVJbmZvOiBUYXJnZXRUYWJsZUluZm9UeXBlO1xuXHRzdWJUaXRsZT86IHN0cmluZyB8IG51bGw7XG59O1xuXG50eXBlIENvbHVtbkluZm9UeXBlID0ge1xuXHRzQ29sdW1uVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c0NvbHVtbkluZGljYXRvcjogc3RyaW5nO1xufTtcblxudHlwZSBDb2x1bW5XaXRoTGFiZWxUeXBlID0gQ29sdW1uICYge1xuXHRsYWJlbD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIG1lc3NhZ2VIYW5kbGluZ1R5cGUgPSB7XG5cdGdldE1lc3NhZ2VzOiAoYkJvdW5kTWVzc2FnZXM/OiBhbnksIGJUcmFuc2l0aW9uT25seT86IGFueSkgPT4gYW55W107XG5cdHNob3dVbmJvdW5kTWVzc2FnZXM6IChcblx0XHRhQ3VzdG9tTWVzc2FnZXM/OiBhbnlbXSxcblx0XHRvQ29udGV4dD86IGFueSxcblx0XHRiU2hvd0JvdW5kVHJhbnNpdGlvbj86IGJvb2xlYW4sXG5cdFx0Y29uY3VycmVudEVkaXRGbGFnPzogYm9vbGVhbixcblx0XHRvQ29udHJvbD86IENvbnRyb2wsXG5cdFx0c0FjdGlvbk5hbWU/OiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0Yk9ubHlGb3JUZXN0PzogYm9vbGVhbixcblx0XHRvbkJlZm9yZVNob3dNZXNzYWdlPzogKG1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyczogYW55KSA9PiBhbnksXG5cdFx0dmlld1R5cGU/OiBzdHJpbmdcblx0KSA9PiBQcm9taXNlPGFueT47XG5cdHJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXM6ICgpID0+IHZvaWQ7XG5cdG1vZGlmeUVUYWdNZXNzYWdlc09ubHk6IChvTWVzc2FnZU1hbmFnZXI6IGFueSwgb1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSwgY29uY3VycmVudEVkaXRGbGFnOiBib29sZWFuIHwgdW5kZWZpbmVkKSA9PiBib29sZWFuO1xuXHRyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlczogKHNQYXRoVG9CZVJlbW92ZWQ/OiBzdHJpbmcpID0+IHZvaWQ7XG5cdGdldFJldHJ5QWZ0ZXJNZXNzYWdlOiAob01lc3NhZ2U6IGFueSwgYk1lc3NhZ2VEaWFsb2c/OiBhbnkpID0+IGFueTtcblx0cHJlcGFyZU1lc3NhZ2VWaWV3Rm9yRGlhbG9nOiAob01lc3NhZ2VEaWFsb2dNb2RlbDogSlNPTk1vZGVsLCBiU3RyaWN0SGFuZGxpbmdGbG93OiBib29sZWFuLCBpc011bHRpNDEyPzogYm9vbGVhbikgPT4gYW55O1xuXHRzZXRNZXNzYWdlU3VidGl0bGU6IChvVGFibGU6IFRhYmxlLCBhQ29udGV4dHM6IENvbnRleHRbXSwgbWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIpID0+IHZvaWQ7XG5cdGdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0OiAob09iamVjdFBhZ2VMYXlvdXQ6IENvbnRyb2wpID0+IGFueTtcblx0Z2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb246IChzdWJTZWN0aW9uOiBPYmplY3RQYWdlU3ViU2VjdGlvbiwgb01lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VXaXRoSGVhZGVyKSA9PiBVSTVFbGVtZW50W107XG5cdGZuRmlsdGVyVXBvbklkczogKGFDb250cm9sSWRzOiBzdHJpbmdbXSwgb0l0ZW06IFVJNUVsZW1lbnQpID0+IGJvb2xlYW47XG5cdGdldFRhYmxlQW5kVGFyZ2V0SW5mbzogKFxuXHRcdG9UYWJsZTogVGFibGUsXG5cdFx0b01lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VXaXRoSGVhZGVyLFxuXHRcdG9FbGVtZW50OiBVSTVFbGVtZW50IHwgdW5kZWZpbmVkLFxuXHRcdG9Sb3dCaW5kaW5nOiBCaW5kaW5nXG5cdCkgPT4gVGFyZ2V0VGFibGVJbmZvVHlwZTtcblx0Y3JlYXRlU2VjdGlvbkdyb3VwTmFtZTogKFxuXHRcdHNlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uLFxuXHRcdHN1YlNlY3Rpb246IE9iamVjdFBhZ2VTdWJTZWN0aW9uLFxuXHRcdGJNdWx0aXBsZVN1YlNlY3Rpb25zOiBib29sZWFuLFxuXHRcdG9UYXJnZXRUYWJsZUluZm86IFRhcmdldFRhYmxlSW5mb1R5cGUsXG5cdFx0b1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZVxuXHQpID0+IHN0cmluZztcblx0YklzT3JwaGFuRWxlbWVudDogKG9FbGVtZW50OiBVSTVFbGVtZW50LCBhRWxlbWVudHM6IFVJNUVsZW1lbnRbXSkgPT4gYm9vbGVhbjtcblx0Z2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lOiAoc0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCkgPT4gc3RyaW5nO1xuXHRnZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlOiAoXG5cdFx0YU1lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyLFxuXHRcdG9UYWJsZTogVGFibGUsXG5cdFx0b0VsZW1lbnQ6IFVJNUVsZW1lbnQgfCB1bmRlZmluZWQsXG5cdFx0b1Jvd0JpbmRpbmc6IEJpbmRpbmcsXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHRzZXRTZWN0aW9uTmFtZUluR3JvdXA6IEJvb2xlYW4sXG5cdFx0Zm5DYWxsYmFja1NldEdyb3VwTmFtZTogYW55XG5cdCkgPT4gQ29sSW5mb0FuZFN1YnRpdGxlVHlwZTtcblx0Z2V0VGFibGVDb2xJbmZvOiAob1RhYmxlOiBDb250cm9sLCBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTogc3RyaW5nKSA9PiBhbnk7XG5cdGdldFRhYmxlQ29sUHJvcGVydHk6IChvVGFibGU6IENvbnRyb2wsIG9NZXNzYWdlT2JqZWN0OiBNZXNzYWdlV2l0aEhlYWRlciwgb0NvbnRleHRQYXRoPzogYW55KSA9PiBhbnk7XG5cdGdldE1lc3NhZ2VTdWJ0aXRsZTogKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyLFxuXHRcdG9UYWJsZVJvd0JpbmRpbmdDb250ZXh0czogQ29udGV4dFtdLFxuXHRcdG9UYWJsZVJvd0NvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQsXG5cdFx0c1RhYmxlVGFyZ2V0Q29sTmFtZTogc3RyaW5nIHwgYm9vbGVhbixcblx0XHRvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLFxuXHRcdG9UYWJsZTogVGFibGUsXG5cdFx0YklzQ3JlYXRpb25Sb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQsXG5cdFx0b1RhcmdldGVkQ29udHJvbD86IENvbnRyb2xcblx0KSA9PiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXHRkZXRlcm1pbmVDb2x1bW5JbmZvOiAob0NvbEZyb21UYWJsZVNldHRpbmdzOiBhbnksIG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUpID0+IENvbHVtbkluZm9UeXBlO1xuXHRmZXRjaENvbHVtbkluZm86IChvTWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsIG9UYWJsZTogVGFibGUpID0+IENvbHVtbjtcblx0Z2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb246IChcblx0XHRvVGFibGU6IFRhYmxlLFxuXHRcdG9UYWJsZVJvd0NvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQsXG5cdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eTogc3RyaW5nXG5cdCkgPT4gQ29udGV4dCB8IG51bGwgfCB1bmRlZmluZWQ7XG5cdGdldE1lc3NhZ2VSYW5rOiAob2JqOiBNZXNzYWdlV2l0aEhlYWRlcikgPT4gbnVtYmVyO1xuXHRmbkNhbGxiYWNrU2V0R3JvdXBOYW1lOiAoYU1lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyLCBzQWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBiSXNHZW5lcmFsR3JvdXBOYW1lPzogQm9vbGVhbikgPT4gYW55O1xuXHRnZXRUYWJsZUZpcnN0Q29sVmFsdWU6IChcblx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5OiBzdHJpbmcsXG5cdFx0b1RhYmxlUm93Q29udGV4dDogQ29udGV4dCxcblx0XHRzVGV4dEFubm90YXRpb25QYXRoOiBzdHJpbmcsXG5cdFx0c1RleHRBcnJhbmdlbWVudDogc3RyaW5nXG5cdCkgPT4gc3RyaW5nO1xuXHRzZXRHcm91cE5hbWVPUERpc3BsYXlNb2RlOiAoYU1vZGVsRGF0YTogTWVzc2FnZVdpdGhIZWFkZXIsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsIGNvbnRyb2w6IGFueSkgPT4gdm9pZDtcblx0dXBkYXRlTWVzc2FnZU9iamVjdEdyb3VwTmFtZTogKFxuXHRcdGFNb2RlbERhdGFBcnJheTogTWVzc2FnZVdpdGhIZWFkZXJbXSxcblx0XHRjb250cm9sOiBDb250cm9sIHwgdW5kZWZpbmVkLFxuXHRcdHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0dmlld1R5cGU6IHN0cmluZyB8IHVuZGVmaW5lZFxuXHQpID0+IHZvaWQ7XG5cdHNldEdyb3VwTmFtZUxSVGFibGU6IChjb250cm9sOiBDb250cm9sIHwgdW5kZWZpbmVkLCBhTW9kZWxEYXRhOiBNZXNzYWdlV2l0aEhlYWRlciwgc0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCkgPT4gdm9pZDtcblx0aXNDb250cm9sSW5UYWJsZTogKG9UYWJsZTogVGFibGUsIHNDb250cm9sSWQ6IHN0cmluZykgPT4gVUk1RWxlbWVudFtdIHwgYm9vbGVhbjtcblx0aXNDb250cm9sUGFydE9mQ3JlYXRpb25Sb3c6IChvQ29udHJvbDogVUk1RWxlbWVudCB8IHVuZGVmaW5lZCkgPT4gYm9vbGVhbjtcbn07XG5cbmZ1bmN0aW9uIGZuRm9ybWF0VGVjaG5pY2FsRGV0YWlscygpIHtcblx0bGV0IHNQcmV2aW91c0dyb3VwTmFtZTogc3RyaW5nO1xuXG5cdC8vIEluc2VydCB0ZWNobmljYWwgZGV0YWlsIGlmIGl0IGV4aXN0c1xuXHRmdW5jdGlvbiBpbnNlcnREZXRhaWwob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRyZXR1cm4gb1Byb3BlcnR5LnByb3BlcnR5XG5cdFx0XHQ/IFwiKCAke1wiICtcblx0XHRcdFx0XHRvUHJvcGVydHkucHJvcGVydHkgK1xuXHRcdFx0XHRcdCd9ID8gKFwiPHA+JyArXG5cdFx0XHRcdFx0b1Byb3BlcnR5LnByb3BlcnR5LnN1YnN0cihNYXRoLm1heChvUHJvcGVydHkucHJvcGVydHkubGFzdEluZGV4T2YoXCIvXCIpLCBvUHJvcGVydHkucHJvcGVydHkubGFzdEluZGV4T2YoXCIuXCIpKSArIDEpICtcblx0XHRcdFx0XHQnIDogXCIgKyAnICtcblx0XHRcdFx0XHRcIiR7XCIgK1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eS5wcm9wZXJ0eSArXG5cdFx0XHRcdFx0J30gKyBcIjwvcD5cIikgOiBcIlwiICknXG5cdFx0XHQ6IFwiXCI7XG5cdH1cblx0Ly8gSW5zZXJ0IGdyb3VwbmFtZSBpZiBpdCBleGlzdHNcblx0ZnVuY3Rpb24gaW5zZXJ0R3JvdXBOYW1lKG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0bGV0IHNIVE1MID0gXCJcIjtcblx0XHRpZiAob1Byb3BlcnR5Lmdyb3VwTmFtZSAmJiBvUHJvcGVydHkucHJvcGVydHkgJiYgb1Byb3BlcnR5Lmdyb3VwTmFtZSAhPT0gc1ByZXZpb3VzR3JvdXBOYW1lKSB7XG5cdFx0XHRzSFRNTCArPSBcIiggJHtcIiArIG9Qcm9wZXJ0eS5wcm9wZXJ0eSArICd9ID8gXCI8YnI+PGgzPicgKyBvUHJvcGVydHkuZ3JvdXBOYW1lICsgJzwvaDM+XCIgOiBcIlwiICkgKyAnO1xuXHRcdFx0c1ByZXZpb3VzR3JvdXBOYW1lID0gb1Byb3BlcnR5Lmdyb3VwTmFtZTtcblx0XHR9XG5cdFx0cmV0dXJuIHNIVE1MO1xuXHR9XG5cblx0Ly8gTGlzdCBvZiB0ZWNobmljYWwgZGV0YWlscyB0byBiZSBzaG93blxuXHRmdW5jdGlvbiBnZXRQYXRocygpIHtcblx0XHRjb25zdCBzVEQgPSBcInRlY2huaWNhbERldGFpbHNcIjsgLy8gbmFtZSBvZiBwcm9wZXJ0eSBpbiBtZXNzYWdlIG1vZGVsIGRhdGEgZm9yIHRlY2huaWNhbCBkZXRhaWxzXG5cdFx0cmV0dXJuIFtcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIlwiLCBwcm9wZXJ0eTogYCR7c1REfS9zdGF0dXNgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJcIiwgcHJvcGVydHk6IGAke3NURH0vc3RhdHVzVGV4dGAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkFwcGxpY2F0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5BcHBsaWNhdGlvbi9Db21wb25lbnRJZGAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkFwcGxpY2F0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5BcHBsaWNhdGlvbi9TZXJ2aWNlSWRgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJBcHBsaWNhdGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uQXBwbGljYXRpb24vU2VydmljZVJlcG9zaXRvcnlgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJBcHBsaWNhdGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uQXBwbGljYXRpb24vU2VydmljZVZlcnNpb25gIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJFcnJvclJlc29sdXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkVycm9yUmVzb2x1dGlvbi9BbmFseXNpc2AgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkVycm9yUmVzb2x1dGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uRXJyb3JSZXNvbHV0aW9uL05vdGVgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJFcnJvclJlc29sdXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkVycm9yUmVzb2x1dGlvbi9EZXRhaWxlZE5vdGVgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJFcnJvclJlc29sdXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkV4Y2VwdGlvbkNhdGVnb3J5YCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiRXJyb3JSZXNvbHV0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5UaW1lU3RhbXBgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJFcnJvclJlc29sdXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLlRyYW5zYWN0aW9uSWRgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJNZXNzYWdlc1wiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9jb2RlYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiTWVzc2FnZXNcIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvbWVzc2FnZWAgfVxuXHRcdF07XG5cdH1cblxuXHRsZXQgc0hUTUwgPSBcIk9iamVjdC5rZXlzKFwiICsgXCIke3RlY2huaWNhbERldGFpbHN9XCIgKyAnKS5sZW5ndGggPiAwID8gXCI8aDI+VGVjaG5pY2FsIERldGFpbHM8L2gyPlwiIDogXCJcIiAnO1xuXHRnZXRQYXRocygpLmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wZXJ0eTogeyBncm91cE5hbWU6IHN0cmluZzsgcHJvcGVydHk6IHN0cmluZyB9KSB7XG5cdFx0c0hUTUwgPSBgJHtzSFRNTCArIGluc2VydEdyb3VwTmFtZShvUHJvcGVydHkpfSR7aW5zZXJ0RGV0YWlsKG9Qcm9wZXJ0eSl9ICsgYDtcblx0fSk7XG5cdHJldHVybiBzSFRNTDtcbn1cbmZ1bmN0aW9uIGZuRm9ybWF0RGVzY3JpcHRpb24oKSB7XG5cdHJldHVybiBcIigke1wiICsgJ2Rlc2NyaXB0aW9ufSA/IChcIjxoMj5EZXNjcmlwdGlvbjwvaDI+XCIgKyAkeycgKyAnZGVzY3JpcHRpb259KSA6IFwiXCIpJztcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaGlnaGVzdCBwcmlvcml0eSBtZXNzYWdlIHR5cGUoRXJyb3IvV2FybmluZy9TdWNjZXNzL0luZm9ybWF0aW9uKSBmcm9tIHRoZSBhdmFpbGFibGUgbWVzc2FnZXMuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLm1lc3NhZ2VIYW5kbGluZy5mbkdldEhpZ2hlc3RNZXNzYWdlUHJpb3JpdHlcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLm1lc3NhZ2VIYW5kbGluZ1xuICogQHBhcmFtIFthTWVzc2FnZXNdIE1lc3NhZ2VzIGxpc3RcbiAqIEByZXR1cm5zIEhpZ2hlc3QgcHJpb3JpdHkgbWVzc2FnZSBmcm9tIHRoZSBhdmFpbGFibGUgbWVzc2FnZXNcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gZm5HZXRIaWdoZXN0TWVzc2FnZVByaW9yaXR5KGFNZXNzYWdlczogYW55W10pIHtcblx0bGV0IHNNZXNzYWdlUHJpb3JpdHkgPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHRjb25zdCBpTGVuZ3RoID0gYU1lc3NhZ2VzLmxlbmd0aDtcblx0Y29uc3Qgb01lc3NhZ2VDb3VudDogYW55ID0geyBFcnJvcjogMCwgV2FybmluZzogMCwgU3VjY2VzczogMCwgSW5mb3JtYXRpb246IDAgfTtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGlMZW5ndGg7IGkrKykge1xuXHRcdCsrb01lc3NhZ2VDb3VudFthTWVzc2FnZXNbaV0uZ2V0VHlwZSgpXTtcblx0fVxuXHRpZiAob01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5FcnJvcl0gPiAwKSB7XG5cdFx0c01lc3NhZ2VQcmlvcml0eSA9IE1lc3NhZ2VUeXBlLkVycm9yO1xuXHR9IGVsc2UgaWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuV2FybmluZ10gPiAwKSB7XG5cdFx0c01lc3NhZ2VQcmlvcml0eSA9IE1lc3NhZ2VUeXBlLldhcm5pbmc7XG5cdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5TdWNjZXNzXSA+IDApIHtcblx0XHRzTWVzc2FnZVByaW9yaXR5ID0gTWVzc2FnZVR5cGUuU3VjY2Vzcztcblx0fSBlbHNlIGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLkluZm9ybWF0aW9uXSA+IDApIHtcblx0XHRzTWVzc2FnZVByaW9yaXR5ID0gTWVzc2FnZVR5cGUuSW5mb3JtYXRpb247XG5cdH1cblx0cmV0dXJuIHNNZXNzYWdlUHJpb3JpdHk7XG59XG4vLyBmdW5jdGlvbiB3aGljaCBtb2RpZnkgZS1UYWcgbWVzc2FnZXMgb25seS5cbi8vIHJldHVybnMgOiB0cnVlLCBpZiBhbnkgZS1UYWcgbWVzc2FnZSBpcyBtb2RpZmllZCwgb3RoZXJ3aXNlIGZhbHNlLlxuZnVuY3Rpb24gZm5Nb2RpZnlFVGFnTWVzc2FnZXNPbmx5KG9NZXNzYWdlTWFuYWdlcjogYW55LCBvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLCBjb25jdXJyZW50RWRpdEZsYWc6IGJvb2xlYW4gfCB1bmRlZmluZWQpIHtcblx0Y29uc3QgYU1lc3NhZ2VzID0gb01lc3NhZ2VNYW5hZ2VyLmdldE1lc3NhZ2VNb2RlbCgpLmdldE9iamVjdChcIi9cIik7XG5cdGxldCBiTWVzc2FnZXNNb2RpZmllZCA9IGZhbHNlO1xuXHRsZXQgc0V0YWdNZXNzYWdlID0gXCJcIjtcblx0YU1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG9NZXNzYWdlOiBhbnksIGk6IGFueSkge1xuXHRcdGNvbnN0IG9UZWNobmljYWxEZXRhaWxzID0gb01lc3NhZ2UuZ2V0VGVjaG5pY2FsRGV0YWlscyAmJiBvTWVzc2FnZS5nZXRUZWNobmljYWxEZXRhaWxzKCk7XG5cdFx0aWYgKG9UZWNobmljYWxEZXRhaWxzICYmIG9UZWNobmljYWxEZXRhaWxzLmh0dHBTdGF0dXMgPT09IDQxMikge1xuXHRcdFx0aWYgKG9UZWNobmljYWxEZXRhaWxzLmlzQ29uY3VycmVudE1vZGlmaWNhdGlvbiAmJiBjb25jdXJyZW50RWRpdEZsYWcpIHtcblx0XHRcdFx0c0V0YWdNZXNzYWdlID1cblx0XHRcdFx0XHRzRXRhZ01lc3NhZ2UgfHwgb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0FQUF9DT01QT05FTlRfU0FQRkVfRVRBR19URUNITklDQUxfSVNTVUVTX0NPTkNVUlJFTlRfTU9ESUZJQ0FUSU9OXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c0V0YWdNZXNzYWdlID0gc0V0YWdNZXNzYWdlIHx8IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19BUFBfQ09NUE9ORU5UX1NBUEZFX0VUQUdfVEVDSE5JQ0FMX0lTU1VFU1wiKTtcblx0XHRcdH1cblx0XHRcdG9NZXNzYWdlTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhhTWVzc2FnZXNbaV0pO1xuXHRcdFx0b01lc3NhZ2Uuc2V0TWVzc2FnZShzRXRhZ01lc3NhZ2UpO1xuXHRcdFx0b01lc3NhZ2UudGFyZ2V0ID0gXCJcIjtcblx0XHRcdG9NZXNzYWdlTWFuYWdlci5hZGRNZXNzYWdlcyhvTWVzc2FnZSk7XG5cdFx0XHRiTWVzc2FnZXNNb2RpZmllZCA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIGJNZXNzYWdlc01vZGlmaWVkO1xufVxuLy8gRGlhbG9nIGNsb3NlIEhhbmRsaW5nXG5mdW5jdGlvbiBkaWFsb2dDbG9zZUhhbmRsZXIoKSB7XG5cdG9EaWFsb2cuY2xvc2UoKTtcblx0b0JhY2tCdXR0b24uc2V0VmlzaWJsZShmYWxzZSk7XG5cdGFNZXNzYWdlTGlzdCA9IFtdO1xuXHRjb25zdCBvTWVzc2FnZURpYWxvZ01vZGVsOiBhbnkgPSBvTWVzc2FnZVZpZXcuZ2V0TW9kZWwoKTtcblx0aWYgKG9NZXNzYWdlRGlhbG9nTW9kZWwpIHtcblx0XHRvTWVzc2FnZURpYWxvZ01vZGVsLnNldERhdGEoe30pO1xuXHR9XG5cdHJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcbn1cbmZ1bmN0aW9uIGdldFJldHJ5QWZ0ZXJNZXNzYWdlKG9NZXNzYWdlOiBhbnksIGJNZXNzYWdlRGlhbG9nPzogYW55KSB7XG5cdGNvbnN0IGROb3cgPSBuZXcgRGF0ZSgpO1xuXHRjb25zdCBvVGVjaG5pY2FsRGV0YWlscyA9IG9NZXNzYWdlLmdldFRlY2huaWNhbERldGFpbHMoKTtcblx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0bGV0IHNSZXRyeUFmdGVyTWVzc2FnZTtcblx0aWYgKG9UZWNobmljYWxEZXRhaWxzICYmIG9UZWNobmljYWxEZXRhaWxzLmh0dHBTdGF0dXMgPT09IDUwMyAmJiBvVGVjaG5pY2FsRGV0YWlscy5yZXRyeUFmdGVyKSB7XG5cdFx0Y29uc3QgZFJldHJ5QWZ0ZXIgPSBvVGVjaG5pY2FsRGV0YWlscy5yZXRyeUFmdGVyO1xuXHRcdGxldCBvRGF0ZUZvcm1hdDtcblx0XHRpZiAoZE5vdy5nZXRGdWxsWWVhcigpICE9PSBkUmV0cnlBZnRlci5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHQvL2RpZmZlcmVudCB5ZWFyc1xuXHRcdFx0b0RhdGVGb3JtYXQgPSBEYXRlRm9ybWF0LmdldERhdGVUaW1lSW5zdGFuY2Uoe1xuXHRcdFx0XHRwYXR0ZXJuOiBcIk1NTU0gZGQsIHl5eXkgJ2F0JyBoaDptbSBhXCJcblx0XHRcdH0pO1xuXHRcdFx0c1JldHJ5QWZ0ZXJNZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0VSUk9SXCIsIFtvRGF0ZUZvcm1hdC5mb3JtYXQoZFJldHJ5QWZ0ZXIpXSk7XG5cdFx0fSBlbHNlIGlmIChkTm93LmdldEZ1bGxZZWFyKCkgPT0gZFJldHJ5QWZ0ZXIuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0Ly9zYW1lIHllYXJcblx0XHRcdGlmIChiTWVzc2FnZURpYWxvZykge1xuXHRcdFx0XHQvL2xlc3MgdGhhbiAyIG1pblxuXHRcdFx0XHRzUmV0cnlBZnRlck1lc3NhZ2UgPSBgJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfVElUTEVcIil9ICR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXG5cdFx0XHRcdFx0XCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0RFU0NcIlxuXHRcdFx0XHQpfWA7XG5cdFx0XHR9IGVsc2UgaWYgKGROb3cuZ2V0TW9udGgoKSAhPT0gZFJldHJ5QWZ0ZXIuZ2V0TW9udGgoKSB8fCBkTm93LmdldERhdGUoKSAhPT0gZFJldHJ5QWZ0ZXIuZ2V0RGF0ZSgpKSB7XG5cdFx0XHRcdG9EYXRlRm9ybWF0ID0gRGF0ZUZvcm1hdC5nZXREYXRlVGltZUluc3RhbmNlKHtcblx0XHRcdFx0XHRwYXR0ZXJuOiBcIk1NTU0gZGQgJ2F0JyBoaDptbSBhXCJcblx0XHRcdFx0fSk7IC8vZGlmZmVyZW50IG1vbnRocyBvciBkaWZmZXJlbnQgZGF5cyBvZiBzYW1lIG1vbnRoXG5cdFx0XHRcdHNSZXRyeUFmdGVyTWVzc2FnZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19FUlJPUlwiLCBbb0RhdGVGb3JtYXQuZm9ybWF0KGRSZXRyeUFmdGVyKV0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9zYW1lIGRheVxuXHRcdFx0XHRvRGF0ZUZvcm1hdCA9IERhdGVGb3JtYXQuZ2V0RGF0ZVRpbWVJbnN0YW5jZSh7XG5cdFx0XHRcdFx0cGF0dGVybjogXCJoaDptbSBhXCJcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHNSZXRyeUFmdGVyTWVzc2FnZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19FUlJPUl9EQVlcIiwgW29EYXRlRm9ybWF0LmZvcm1hdChkUmV0cnlBZnRlcildKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRpZiAob1RlY2huaWNhbERldGFpbHMgJiYgb1RlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyA9PT0gNTAzICYmICFvVGVjaG5pY2FsRGV0YWlscy5yZXRyeUFmdGVyKSB7XG5cdFx0c1JldHJ5QWZ0ZXJNZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0VSUk9SX05PX1JFVFJZX0FGVEVSXCIpO1xuXHR9XG5cdHJldHVybiBzUmV0cnlBZnRlck1lc3NhZ2U7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyhvTWVzc2FnZURpYWxvZ01vZGVsOiBKU09OTW9kZWwsIGJTdHJpY3RIYW5kbGluZ0Zsb3c6IGJvb2xlYW4sIG11bHRpNDEyPzogYm9vbGVhbikge1xuXHRsZXQgb01lc3NhZ2VUZW1wbGF0ZTogTWVzc2FnZUl0ZW07XG5cdGlmICghYlN0cmljdEhhbmRsaW5nRmxvdykge1xuXHRcdG9NZXNzYWdlVGVtcGxhdGUgPSBuZXcgTWVzc2FnZUl0ZW0odW5kZWZpbmVkLCB7XG5cdFx0XHRjb3VudGVyOiB7IHBhdGg6IFwiY291bnRlclwiIH0sXG5cdFx0XHR0aXRsZTogXCJ7bWVzc2FnZX1cIixcblx0XHRcdHN1YnRpdGxlOiBcInthZGRpdGlvbmFsVGV4dH1cIixcblx0XHRcdGxvbmd0ZXh0VXJsOiBcIntkZXNjcmlwdGlvblVybH1cIixcblx0XHRcdHR5cGU6IHsgcGF0aDogXCJ0eXBlXCIgfSxcblx0XHRcdGdyb3VwTmFtZTogXCJ7aGVhZGVyTmFtZX1cIixcblx0XHRcdGRlc2NyaXB0aW9uOlxuXHRcdFx0XHRcIns9ICR7XCIgK1xuXHRcdFx0XHRcImRlc2NyaXB0aW9ufSB8fCAke3RlY2huaWNhbERldGFpbHN9ID8gXCIgK1xuXHRcdFx0XHQnXCI8aHRtbD48Ym9keT5cIiArICcgK1xuXHRcdFx0XHRmbkZvcm1hdERlc2NyaXB0aW9uKCkgK1xuXHRcdFx0XHRcIiArIFwiICtcblx0XHRcdFx0Zm5Gb3JtYXRUZWNobmljYWxEZXRhaWxzKCkgK1xuXHRcdFx0XHQnXCI8L2JvZHk+PC9odG1sPlwiJyArXG5cdFx0XHRcdCcgOiBcIlwiIH0nLFxuXHRcdFx0bWFya3VwRGVzY3JpcHRpb246IHRydWVcblx0XHR9KTtcblx0fSBlbHNlIGlmIChtdWx0aTQxMikge1xuXHRcdG9NZXNzYWdlVGVtcGxhdGUgPSBuZXcgTWVzc2FnZUl0ZW0odW5kZWZpbmVkLCB7XG5cdFx0XHRjb3VudGVyOiB7IHBhdGg6IFwiY291bnRlclwiIH0sXG5cdFx0XHR0aXRsZTogXCJ7bWVzc2FnZX1cIixcblx0XHRcdHN1YnRpdGxlOiBcInthZGRpdGlvbmFsVGV4dH1cIixcblx0XHRcdGxvbmd0ZXh0VXJsOiBcIntkZXNjcmlwdGlvblVybH1cIixcblx0XHRcdHR5cGU6IHsgcGF0aDogXCJ0eXBlXCIgfSxcblx0XHRcdGRlc2NyaXB0aW9uOiBcIntkZXNjcmlwdGlvbn1cIixcblx0XHRcdG1hcmt1cERlc2NyaXB0aW9uOiB0cnVlXG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0b01lc3NhZ2VUZW1wbGF0ZSA9IG5ldyBNZXNzYWdlSXRlbSh7XG5cdFx0XHR0aXRsZTogXCJ7bWVzc2FnZX1cIixcblx0XHRcdHR5cGU6IHsgcGF0aDogXCJ0eXBlXCIgfSxcblx0XHRcdGxvbmd0ZXh0VXJsOiBcIntkZXNjcmlwdGlvblVybH1cIlxuXHRcdH0pO1xuXHR9XG5cdG9NZXNzYWdlVmlldyA9IG5ldyBNZXNzYWdlVmlldyh7XG5cdFx0c2hvd0RldGFpbHNQYWdlSGVhZGVyOiBmYWxzZSxcblx0XHRpdGVtU2VsZWN0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRvQmFja0J1dHRvbi5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdH0sXG5cdFx0aXRlbXM6IHtcblx0XHRcdHBhdGg6IFwiL1wiLFxuXHRcdFx0dGVtcGxhdGU6IG9NZXNzYWdlVGVtcGxhdGVcblx0XHR9XG5cdH0pO1xuXHRvTWVzc2FnZVZpZXcuc2V0R3JvdXBJdGVtcyh0cnVlKTtcblx0b0JhY2tCdXR0b24gPVxuXHRcdG9CYWNrQnV0dG9uIHx8XG5cdFx0bmV3IEJ1dHRvbih7XG5cdFx0XHRpY29uOiBJY29uUG9vbC5nZXRJY29uVVJJKFwibmF2LWJhY2tcIiksXG5cdFx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRcdHByZXNzOiBmdW5jdGlvbiAodGhpczogQnV0dG9uKSB7XG5cdFx0XHRcdG9NZXNzYWdlVmlldy5uYXZpZ2F0ZUJhY2soKTtcblx0XHRcdFx0dGhpcy5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdH1cblx0XHR9KTtcblx0Ly8gVXBkYXRlIHByb3BlciBFVGFnIE1pc21hdGNoIGVycm9yXG5cdG9NZXNzYWdlVmlldy5zZXRNb2RlbChvTWVzc2FnZURpYWxvZ01vZGVsKTtcblx0cmV0dXJuIHtcblx0XHRvTWVzc2FnZVZpZXcsXG5cdFx0b0JhY2tCdXR0b25cblx0fTtcbn1cblxuZnVuY3Rpb24gc2hvd1VuYm91bmRNZXNzYWdlcyhcblx0dGhpczogbWVzc2FnZUhhbmRsaW5nVHlwZSxcblx0YUN1c3RvbU1lc3NhZ2VzPzogYW55W10sXG5cdG9Db250ZXh0PzogYW55LFxuXHRiU2hvd0JvdW5kVHJhbnNpdGlvbj86IGJvb2xlYW4sXG5cdGNvbmN1cnJlbnRFZGl0RmxhZz86IGJvb2xlYW4sXG5cdGNvbnRyb2w/OiBDb250cm9sLFxuXHRzQWN0aW9uTmFtZT86IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0Yk9ubHlGb3JUZXN0PzogYm9vbGVhbixcblx0b25CZWZvcmVTaG93TWVzc2FnZT86IChtZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnM6IGFueSkgPT4gYW55LFxuXHR2aWV3VHlwZT86IHN0cmluZ1xuKTogUHJvbWlzZTxhbnk+IHtcblx0bGV0IGFUcmFuc2l0aW9uTWVzc2FnZXMgPSB0aGlzLmdldE1lc3NhZ2VzKCk7XG5cdGNvbnN0IG9NZXNzYWdlTWFuYWdlciA9IENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0bGV0IHNIaWdoZXN0UHJpb3JpdHk7XG5cdGxldCBzSGlnaGVzdFByaW9yaXR5VGV4dDtcblx0Y29uc3QgYUZpbHRlcnMgPSBbbmV3IEZpbHRlcih7IHBhdGg6IFwicGVyc2lzdGVudFwiLCBvcGVyYXRvcjogRmlsdGVyT3BlcmF0b3IuTkUsIHZhbHVlMTogZmFsc2UgfSldO1xuXHRsZXQgc2hvd01lc3NhZ2VEaWFsb2c6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSBmYWxzZSxcblx0XHRzaG93TWVzc2FnZUJveDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IGZhbHNlO1xuXG5cdGlmIChiU2hvd0JvdW5kVHJhbnNpdGlvbikge1xuXHRcdGFUcmFuc2l0aW9uTWVzc2FnZXMgPSBhVHJhbnNpdGlvbk1lc3NhZ2VzLmNvbmNhdChnZXRNZXNzYWdlcyh0cnVlLCB0cnVlKSk7XG5cdFx0Ly8gd2Ugb25seSB3YW50IHRvIHNob3cgYm91bmQgdHJhbnNpdGlvbiBtZXNzYWdlcyBub3QgYm91bmQgc3RhdGUgbWVzc2FnZXMgaGVuY2UgYWRkIGEgZmlsdGVyIGZvciB0aGUgc2FtZVxuXHRcdGFGaWx0ZXJzLnB1c2gobmV3IEZpbHRlcih7IHBhdGg6IFwicGVyc2lzdGVudFwiLCBvcGVyYXRvcjogRmlsdGVyT3BlcmF0b3IuRVEsIHZhbHVlMTogdHJ1ZSB9KSk7XG5cdFx0Y29uc3QgZm5DaGVja0NvbnRyb2xJZEluRGlhbG9nID0gZnVuY3Rpb24gKGFDb250cm9sSWRzOiBhbnkpIHtcblx0XHRcdGxldCBpbmRleCA9IEluZmluaXR5LFxuXHRcdFx0XHRvQ29udHJvbCA9IENvcmUuYnlJZChhQ29udHJvbElkc1swXSkgYXMgTWFuYWdlZE9iamVjdCB8IG51bGw7XG5cdFx0XHRjb25zdCBlcnJvckZpZWxkQ29udHJvbCA9IENvcmUuYnlJZChhQ29udHJvbElkc1swXSkgYXMgQ29udHJvbDtcblx0XHRcdHdoaWxlIChvQ29udHJvbCkge1xuXHRcdFx0XHRjb25zdCBmaWVsZFJhbmtpbkRpYWxvZyA9XG5cdFx0XHRcdFx0b0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2dcblx0XHRcdFx0XHRcdD8gKGVycm9yRmllbGRDb250cm9sLmdldFBhcmVudCgpIGFzIGFueSkuZmluZEVsZW1lbnRzKHRydWUpLmluZGV4T2YoZXJyb3JGaWVsZENvbnRyb2wpXG5cdFx0XHRcdFx0XHQ6IEluZmluaXR5O1xuXHRcdFx0XHRpZiAob0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2cpIHtcblx0XHRcdFx0XHRpZiAoaW5kZXggPiBmaWVsZFJhbmtpbkRpYWxvZykge1xuXHRcdFx0XHRcdFx0aW5kZXggPSBmaWVsZFJhbmtpbkRpYWxvZztcblx0XHRcdFx0XHRcdC8vIFNldCB0aGUgZm9jdXMgdG8gdGhlIGRpYWxvZydzIGNvbnRyb2xcblx0XHRcdFx0XHRcdGVycm9yRmllbGRDb250cm9sLmZvY3VzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIG1lc3NhZ2VzIHdpdGggdGFyZ2V0IGluc2lkZSBzYXAubS5EaWFsb2cgc2hvdWxkIG5vdCBicmluZyB1cCB0aGUgbWVzc2FnZSBkaWFsb2dcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdFx0YUZpbHRlcnMucHVzaChcblx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRwYXRoOiBcImNvbnRyb2xJZHNcIixcblx0XHRcdFx0dGVzdDogZm5DaGVja0NvbnRyb2xJZEluRGlhbG9nLFxuXHRcdFx0XHRjYXNlU2Vuc2l0aXZlOiB0cnVlXG5cdFx0XHR9KVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gb25seSB1bmJvdW5kIG1lc3NhZ2VzIGhhdmUgdG8gYmUgc2hvd24gc28gYWRkIGZpbHRlciBhY2NvcmRpbmdseVxuXHRcdGFGaWx0ZXJzLnB1c2gobmV3IEZpbHRlcih7IHBhdGg6IFwidGFyZ2V0XCIsIG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSwgdmFsdWUxOiBcIlwiIH0pKTtcblx0fVxuXHRpZiAoYUN1c3RvbU1lc3NhZ2VzICYmIGFDdXN0b21NZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRhQ3VzdG9tTWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0Y29uc3QgbWVzc2FnZUNvZGUgPSBvTWVzc2FnZS5jb2RlID8gb01lc3NhZ2UuY29kZSA6IFwiXCI7XG5cdFx0XHRvTWVzc2FnZU1hbmFnZXIuYWRkTWVzc2FnZXMoXG5cdFx0XHRcdG5ldyBNZXNzYWdlKHtcblx0XHRcdFx0XHRtZXNzYWdlOiBvTWVzc2FnZS50ZXh0LFxuXHRcdFx0XHRcdHR5cGU6IG9NZXNzYWdlLnR5cGUsXG5cdFx0XHRcdFx0dGFyZ2V0OiBcIlwiLFxuXHRcdFx0XHRcdHBlcnNpc3RlbnQ6IHRydWUsXG5cdFx0XHRcdFx0Y29kZTogbWVzc2FnZUNvZGVcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0XHQvL1RoZSB0YXJnZXQgYW5kIHBlcnNpc3RlbnQgcHJvcGVydGllcyBvZiB0aGUgbWVzc2FnZSBhcmUgaGFyZGNvZGVkIGFzIFwiXCIgYW5kIHRydWUgYmVjYXVzZSB0aGUgZnVuY3Rpb24gZGVhbHMgd2l0aCBvbmx5IHVuYm91bmQgbWVzc2FnZXMuXG5cdFx0fSk7XG5cdH1cblx0Y29uc3Qgb01lc3NhZ2VEaWFsb2dNb2RlbCA9IChvTWVzc2FnZVZpZXcgJiYgKG9NZXNzYWdlVmlldy5nZXRNb2RlbCgpIGFzIEpTT05Nb2RlbCkpIHx8IG5ldyBKU09OTW9kZWwoKTtcblx0Y29uc3QgYkhhc0V0YWdNZXNzYWdlID0gdGhpcy5tb2RpZnlFVGFnTWVzc2FnZXNPbmx5KG9NZXNzYWdlTWFuYWdlciwgQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSwgY29uY3VycmVudEVkaXRGbGFnKTtcblxuXHRpZiAoYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggPT09IDEgJiYgYVRyYW5zaXRpb25NZXNzYWdlc1swXS5nZXRDb2RlKCkgPT09IFwiNTAzXCIpIHtcblx0XHRzaG93TWVzc2FnZUJveCA9IHRydWU7XG5cdH0gZWxzZSBpZiAoYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggIT09IDApIHtcblx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHRydWU7XG5cdH1cblx0bGV0IHNob3dNZXNzYWdlUGFyYW1ldGVyczogYW55O1xuXHRsZXQgYU1vZGVsRGF0YUFycmF5OiBNZXNzYWdlV2l0aEhlYWRlcltdID0gW107XG5cdGlmIChzaG93TWVzc2FnZURpYWxvZyB8fCAoIXNob3dNZXNzYWdlQm94ICYmICFvbkJlZm9yZVNob3dNZXNzYWdlKSkge1xuXHRcdGNvbnN0IG9MaXN0QmluZGluZyA9IG9NZXNzYWdlTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5iaW5kTGlzdChcIi9cIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGFGaWx0ZXJzKSxcblx0XHRcdGFDdXJyZW50Q29udGV4dHMgPSBvTGlzdEJpbmRpbmcuZ2V0Q3VycmVudENvbnRleHRzKCk7XG5cdFx0aWYgKGFDdXJyZW50Q29udGV4dHMgJiYgYUN1cnJlbnRDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHRydWU7XG5cdFx0XHQvLyBEb24ndCBzaG93IGRpYWxvZyBpbmNhc2UgdGhlcmUgYXJlIG5vIGVycm9ycyB0byBzaG93XG5cblx0XHRcdC8vIGlmIGZhbHNlLCBzaG93IG1lc3NhZ2VzIGluIGRpYWxvZ1xuXHRcdFx0Ly8gQXMgZml0ZXJpbmcgaGFzIGFscmVhZHkgaGFwcGVuZWQgaGVyZSBoZW5jZVxuXHRcdFx0Ly8gdXNpbmcgdGhlIG1lc3NhZ2UgbW9kZWwgYWdhaW4gZm9yIHRoZSBtZXNzYWdlIGRpYWxvZyB2aWV3IGFuZCB0aGVuIGZpbHRlcmluZyBvbiB0aGF0IGJpbmRpbmcgYWdhaW4gaXMgdW5uZWNlc3NhcnkuXG5cdFx0XHQvLyBTbyB3ZSBjcmVhdGUgbmV3IGpzb24gbW9kZWwgdG8gdXNlIGZvciB0aGUgbWVzc2FnZSBkaWFsb2cgdmlldy5cblx0XHRcdGNvbnN0IGFNZXNzYWdlczogYW55W10gPSBbXTtcblx0XHRcdGFDdXJyZW50Q29udGV4dHMuZm9yRWFjaChmdW5jdGlvbiAoY3VycmVudENvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvTWVzc2FnZSA9IGN1cnJlbnRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRhTWVzc2FnZXMucHVzaChvTWVzc2FnZSk7XG5cdFx0XHRcdGFNZXNzYWdlRGF0YUxpc3QgPSBhTWVzc2FnZXM7XG5cdFx0XHR9KTtcblx0XHRcdGxldCBleGlzdGluZ01lc3NhZ2VzOiBhbnlbXSA9IFtdO1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkob01lc3NhZ2VEaWFsb2dNb2RlbC5nZXREYXRhKCkpKSB7XG5cdFx0XHRcdGV4aXN0aW5nTWVzc2FnZXMgPSBvTWVzc2FnZURpYWxvZ01vZGVsLmdldERhdGEoKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IG9VbmlxdWVPYmo6IGFueSA9IHt9O1xuXG5cdFx0XHRhTW9kZWxEYXRhQXJyYXkgPSBhTWVzc2FnZURhdGFMaXN0LmNvbmNhdChleGlzdGluZ01lc3NhZ2VzKS5maWx0ZXIoZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0XHQvLyByZW1vdmUgZW50cmllcyBoYXZpbmcgZHVwbGljYXRlIG1lc3NhZ2UgaWRzXG5cdFx0XHRcdHJldHVybiAhb1VuaXF1ZU9ialtvYmouaWRdICYmIChvVW5pcXVlT2JqW29iai5pZF0gPSB0cnVlKTtcblx0XHRcdH0pO1xuXHRcdFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5zZXREYXRhKGFNb2RlbERhdGFBcnJheSk7XG5cdFx0fVxuXHR9XG5cdGlmIChvbkJlZm9yZVNob3dNZXNzYWdlKSB7XG5cdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzID0geyBzaG93TWVzc2FnZUJveCwgc2hvd01lc3NhZ2VEaWFsb2cgfTtcblx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnMgPSBvbkJlZm9yZVNob3dNZXNzYWdlKGFUcmFuc2l0aW9uTWVzc2FnZXMsIHNob3dNZXNzYWdlUGFyYW1ldGVycyk7XG5cdFx0c2hvd01lc3NhZ2VCb3ggPSBzaG93TWVzc2FnZVBhcmFtZXRlcnMuc2hvd01lc3NhZ2VCb3g7XG5cdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBzaG93TWVzc2FnZVBhcmFtZXRlcnMuc2hvd01lc3NhZ2VEaWFsb2c7XG5cdFx0aWYgKHNob3dNZXNzYWdlRGlhbG9nKSB7XG5cdFx0XHRhTW9kZWxEYXRhQXJyYXkgPSBzaG93TWVzc2FnZVBhcmFtZXRlcnMuZmlsdGVyZWRNZXNzYWdlcyA/IHNob3dNZXNzYWdlUGFyYW1ldGVycy5maWx0ZXJlZE1lc3NhZ2VzIDogYU1vZGVsRGF0YUFycmF5O1xuXHRcdH1cblx0fVxuXHRpZiAoYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggPT09IDAgJiYgIWFDdXN0b21NZXNzYWdlcyAmJiAhYkhhc0V0YWdNZXNzYWdlKSB7XG5cdFx0Ly8gRG9uJ3Qgc2hvdyB0aGUgcG9wdXAgaWYgdGhlcmUgYXJlIG5vIHRyYW5zaWVudCBtZXNzYWdlc1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdH0gZWxzZSBpZiAoYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggPT09IDEgJiYgYVRyYW5zaXRpb25NZXNzYWdlc1swXS5nZXRUeXBlKCkgPT09IE1lc3NhZ2VUeXBlLlN1Y2Nlc3MgJiYgIWFDdXN0b21NZXNzYWdlcykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuXHRcdFx0TWVzc2FnZVRvYXN0LnNob3coYVRyYW5zaXRpb25NZXNzYWdlc1swXS5tZXNzYWdlKTtcblx0XHRcdGlmIChvTWVzc2FnZURpYWxvZ01vZGVsKSB7XG5cdFx0XHRcdG9NZXNzYWdlRGlhbG9nTW9kZWwuc2V0RGF0YSh7fSk7XG5cdFx0XHR9XG5cdFx0XHRvTWVzc2FnZU1hbmFnZXIucmVtb3ZlTWVzc2FnZXMoYVRyYW5zaXRpb25NZXNzYWdlcyk7XG5cdFx0XHRyZXNvbHZlKCk7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoc2hvd01lc3NhZ2VEaWFsb2cpIHtcblx0XHRtZXNzYWdlSGFuZGxpbmcudXBkYXRlTWVzc2FnZU9iamVjdEdyb3VwTmFtZShhTW9kZWxEYXRhQXJyYXksIGNvbnRyb2wsIHNBY3Rpb25OYW1lLCB2aWV3VHlwZSk7XG5cdFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5zZXREYXRhKGFNb2RlbERhdGFBcnJheSk7IC8vIHNldCB0aGUgbWVzc2FnZXMgaGVyZSBzbyB0aGF0IGlmIGFueSBvZiB0aGVtIGFyZSBmaWx0ZXJlZCBmb3IgQVBELCB0aGV5IGFyZSBmaWx0ZXJlZCBoZXJlIGFzIHdlbGwuXG5cdFx0YVJlc29sdmVGdW5jdGlvbnMgPSBhUmVzb2x2ZUZ1bmN0aW9ucyB8fCBbXTtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdGFSZXNvbHZlRnVuY3Rpb25zLnB1c2gocmVzb2x2ZSk7XG5cdFx0XHRDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIsIHRydWUpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgYlN0cmljdEhhbmRsaW5nRmxvdyA9IGZhbHNlO1xuXHRcdFx0XHRcdGlmIChzaG93TWVzc2FnZVBhcmFtZXRlcnMgJiYgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLmZuR2V0TWVzc2FnZVN1YnRpdGxlKSB7XG5cdFx0XHRcdFx0XHRvTWVzc2FnZURpYWxvZ01vZGVsLmdldERhdGEoKS5mb3JFYWNoKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycy5mbkdldE1lc3NhZ2VTdWJ0aXRsZShvTWVzc2FnZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBvTWVzc2FnZU9iamVjdCA9IHByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyhvTWVzc2FnZURpYWxvZ01vZGVsLCBiU3RyaWN0SGFuZGxpbmdGbG93KTtcblx0XHRcdFx0XHRjb25zdCBvU29ydGVyID0gbmV3IFNvcnRlcihcIlwiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgKG9iajE6IGFueSwgb2JqMjogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCByYW5rQSA9IGdldE1lc3NhZ2VSYW5rKG9iajEpO1xuXHRcdFx0XHRcdFx0Y29uc3QgcmFua0IgPSBnZXRNZXNzYWdlUmFuayhvYmoyKTtcblxuXHRcdFx0XHRcdFx0aWYgKHJhbmtBIDwgcmFua0IpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKHJhbmtBID4gcmFua0IpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdChvTWVzc2FnZU9iamVjdC5vTWVzc2FnZVZpZXcuZ2V0QmluZGluZyhcIml0ZW1zXCIpIGFzIE9EYXRhTGlzdEJpbmRpbmcpLnNvcnQob1NvcnRlcik7XG5cblx0XHRcdFx0XHRvRGlhbG9nID1cblx0XHRcdFx0XHRcdG9EaWFsb2cgJiYgb0RpYWxvZy5pc09wZW4oKVxuXHRcdFx0XHRcdFx0XHQ/IG9EaWFsb2dcblx0XHRcdFx0XHRcdFx0OiBuZXcgRGlhbG9nKHtcblx0XHRcdFx0XHRcdFx0XHRcdHJlc2l6YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRcdGVuZEJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGlhbG9nQ2xvc2VIYW5kbGVyKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gYWxzbyByZW1vdmUgYm91bmQgdHJhbnNpdGlvbiBtZXNzYWdlcyBpZiB3ZSB3ZXJlIHNob3dpbmcgdGhlbVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9NZXNzYWdlTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhhTW9kZWxEYXRhQXJyYXkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0NMT1NFXCIpXG5cdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdGN1c3RvbUhlYWRlcjogbmV3IEJhcih7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRlbnRNaWRkbGU6IFtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRuZXcgVGV4dCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFXCIpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGVudExlZnQ6IFtvQmFja0J1dHRvbl1cblx0XHRcdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGVudFdpZHRoOiBcIjM3LjVlbVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGVudEhlaWdodDogXCIyMS41ZW1cIixcblx0XHRcdFx0XHRcdFx0XHRcdHZlcnRpY2FsU2Nyb2xsaW5nOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRcdGFmdGVyQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhUmVzb2x2ZUZ1bmN0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFSZXNvbHZlRnVuY3Rpb25zW2ldLmNhbGwoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhUmVzb2x2ZUZ1bmN0aW9ucyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQgIH0pO1xuXHRcdFx0XHRcdG9EaWFsb2cucmVtb3ZlQWxsQ29udGVudCgpO1xuXHRcdFx0XHRcdG9EaWFsb2cuYWRkQ29udGVudChvTWVzc2FnZU9iamVjdC5vTWVzc2FnZVZpZXcpO1xuXG5cdFx0XHRcdFx0aWYgKGJIYXNFdGFnTWVzc2FnZSkge1xuXHRcdFx0XHRcdFx0c2FwLnVpLnJlcXVpcmUoW1wic2FwL20vQnV0dG9uVHlwZVwiXSwgZnVuY3Rpb24gKEJ1dHRvblR5cGU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRvRGlhbG9nLnNldEJlZ2luQnV0dG9uKFxuXHRcdFx0XHRcdFx0XHRcdG5ldyBCdXR0b24oe1xuXHRcdFx0XHRcdFx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGlhbG9nQ2xvc2VIYW5kbGVyKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChvQ29udGV4dC5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0LnJlZnJlc2goKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX1JFRlJFU0hcIiksXG5cdFx0XHRcdFx0XHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLkVtcGhhc2l6ZWRcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9EaWFsb2cuZGVzdHJveUJlZ2luQnV0dG9uKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNIaWdoZXN0UHJpb3JpdHkgPSBmbkdldEhpZ2hlc3RNZXNzYWdlUHJpb3JpdHkob01lc3NhZ2VWaWV3LmdldEl0ZW1zKCkpO1xuXHRcdFx0XHRcdHNIaWdoZXN0UHJpb3JpdHlUZXh0ID0gZ2V0VHJhbnNsYXRlZFRleHRGb3JNZXNzYWdlRGlhbG9nKHNIaWdoZXN0UHJpb3JpdHkpO1xuXHRcdFx0XHRcdG9EaWFsb2cuc2V0U3RhdGUoc0hpZ2hlc3RQcmlvcml0eSk7XG5cdFx0XHRcdFx0KG9EaWFsb2cuZ2V0Q3VzdG9tSGVhZGVyKCkgYXMgYW55KS5nZXRDb250ZW50TWlkZGxlKClbMF0uc2V0VGV4dChzSGlnaGVzdFByaW9yaXR5VGV4dCk7XG5cdFx0XHRcdFx0b01lc3NhZ2VWaWV3Lm5hdmlnYXRlQmFjaygpO1xuXHRcdFx0XHRcdG9EaWFsb2cub3BlbigpO1xuXHRcdFx0XHRcdGlmIChiT25seUZvclRlc3QpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUob0RpYWxvZyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2gocmVqZWN0KTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChzaG93TWVzc2FnZUJveCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdFx0Y29uc3Qgb01lc3NhZ2UgPSBhVHJhbnNpdGlvbk1lc3NhZ2VzWzBdO1xuXHRcdFx0aWYgKG9NZXNzYWdlLnRlY2huaWNhbERldGFpbHMgJiYgYU1lc3NhZ2VMaXN0LmluZGV4T2Yob01lc3NhZ2UudGVjaG5pY2FsRGV0YWlscy5vcmlnaW5hbE1lc3NhZ2UubWVzc2FnZSkgPT09IC0xKSB7XG5cdFx0XHRcdGFNZXNzYWdlTGlzdC5wdXNoKG9NZXNzYWdlLnRlY2huaWNhbERldGFpbHMub3JpZ2luYWxNZXNzYWdlLm1lc3NhZ2UpO1xuXHRcdFx0XHRsZXQgZm9ybWF0dGVkVGV4dFN0cmluZyA9IFwiPGh0bWw+PGJvZHk+XCI7XG5cdFx0XHRcdGNvbnN0IHJldHJ5QWZ0ZXJNZXNzYWdlID0gZ2V0UmV0cnlBZnRlck1lc3NhZ2Uob01lc3NhZ2UsIHRydWUpO1xuXHRcdFx0XHRpZiAocmV0cnlBZnRlck1lc3NhZ2UpIHtcblx0XHRcdFx0XHRmb3JtYXR0ZWRUZXh0U3RyaW5nID0gYDxoNj4ke3JldHJ5QWZ0ZXJNZXNzYWdlfTwvaDY+PGJyPmA7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNob3dNZXNzYWdlUGFyYW1ldGVycyAmJiBzaG93TWVzc2FnZVBhcmFtZXRlcnMuZm5HZXRNZXNzYWdlU3VidGl0bGUpIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnMuZm5HZXRNZXNzYWdlU3VidGl0bGUob01lc3NhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvTWVzc2FnZS5nZXRDb2RlKCkgIT09IFwiNTAzXCIgJiYgb01lc3NhZ2UuZ2V0QWRkaXRpb25hbFRleHQoKSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Zm9ybWF0dGVkVGV4dFN0cmluZyA9IGAke2Zvcm1hdHRlZFRleHRTdHJpbmcgKyBvTWVzc2FnZS5nZXRBZGRpdGlvbmFsVGV4dCgpfTogJHtvTWVzc2FnZS5nZXRNZXNzYWdlKCl9PC9odG1sPjwvYm9keT5gO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvcm1hdHRlZFRleHRTdHJpbmcgPSBgJHtmb3JtYXR0ZWRUZXh0U3RyaW5nICsgb01lc3NhZ2UuZ2V0TWVzc2FnZSgpfTwvaHRtbD48L2JvZHk+YDtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBmb3JtYXR0ZWRUZXh0OiBhbnkgPSBuZXcgRm9ybWF0dGVkVGV4dCh7XG5cdFx0XHRcdFx0aHRtbFRleHQ6IGZvcm1hdHRlZFRleHRTdHJpbmdcblx0XHRcdFx0fSk7XG5cdFx0XHRcdE1lc3NhZ2VCb3guZXJyb3IoZm9ybWF0dGVkVGV4dCwge1xuXHRcdFx0XHRcdG9uQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGFNZXNzYWdlTGlzdCA9IFtdO1xuXHRcdFx0XHRcdFx0aWYgKGJTaG93Qm91bmRUcmFuc2l0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdHJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0fVxufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gc2V0cyB0aGUgZ3JvdXAgbmFtZSBmb3IgYWxsIG1lc3NhZ2VzIGluIGEgZGlhbG9nLlxuICpcbiAqIEBwYXJhbSBhTW9kZWxEYXRhQXJyYXkgTWVzc2FnZXMgYXJyYXlcbiAqIEBwYXJhbSBjb250cm9sXG4gKiBAcGFyYW0gc0FjdGlvbk5hbWVcbiAqIEBwYXJhbSB2aWV3VHlwZVxuICovXG5mdW5jdGlvbiB1cGRhdGVNZXNzYWdlT2JqZWN0R3JvdXBOYW1lKFxuXHRhTW9kZWxEYXRhQXJyYXk6IE1lc3NhZ2VXaXRoSGVhZGVyW10sXG5cdGNvbnRyb2w6IENvbnRyb2wgfCB1bmRlZmluZWQsXG5cdHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdHZpZXdUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWRcbikge1xuXHRhTW9kZWxEYXRhQXJyYXkuZm9yRWFjaCgoYU1vZGVsRGF0YTogTWVzc2FnZVdpdGhIZWFkZXIpID0+IHtcblx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IFwiXCI7XG5cdFx0aWYgKCFhTW9kZWxEYXRhLnRhcmdldD8ubGVuZ3RoKSB7XG5cdFx0XHQvLyB1bmJvdW5kIHRyYW5zaWl0b24gbWVzc2FnZXNcblx0XHRcdGFNb2RlbERhdGFbXCJoZWFkZXJOYW1lXCJdID0gXCJHZW5lcmFsXCI7XG5cdFx0fSBlbHNlIGlmIChhTW9kZWxEYXRhLnRhcmdldC5sZW5ndGgpIHtcblx0XHRcdC8vIExSIGZsb3dcblx0XHRcdGlmICh2aWV3VHlwZSA9PT0gXCJMaXN0UmVwb3J0XCIpIHtcblx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnNldEdyb3VwTmFtZUxSVGFibGUoY29udHJvbCwgYU1vZGVsRGF0YSwgc0FjdGlvbk5hbWUpO1xuXHRcdFx0fSBlbHNlIGlmICh2aWV3VHlwZSA9PT0gXCJPYmplY3RQYWdlXCIpIHtcblx0XHRcdFx0Ly8gT1AgRGlzcGxheSBtb2RlXG5cdFx0XHRcdG1lc3NhZ2VIYW5kbGluZy5zZXRHcm91cE5hbWVPUERpc3BsYXlNb2RlKGFNb2RlbERhdGEsIHNBY3Rpb25OYW1lLCBjb250cm9sKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFNb2RlbERhdGFbXCJoZWFkZXJOYW1lXCJdID0gbWVzc2FnZUhhbmRsaW5nLmdldExhc3RBY3Rpb25UZXh0QW5kQWN0aW9uTmFtZShzQWN0aW9uTmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgc2V0IHRoZSBncm91cCBuYW1lIG9mIE1lc3NhZ2UgT2JqZWN0IGZvciBMUiB0YWJsZS5cbiAqXG4gKiBAcGFyYW0gb0VsZW1cbiAqIEBwYXJhbSBhTW9kZWxEYXRhXG4gKiBAcGFyYW0gc0FjdGlvbk5hbWVcbiAqL1xuZnVuY3Rpb24gc2V0R3JvdXBOYW1lTFJUYWJsZShvRWxlbTogQ29udHJvbCB8IHVuZGVmaW5lZCwgYU1vZGVsRGF0YTogTWVzc2FnZVdpdGhIZWFkZXIsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSBvRWxlbSAmJiAob0VsZW0gYXMgVGFibGUpLmdldFJvd0JpbmRpbmcoKTtcblx0aWYgKG9Sb3dCaW5kaW5nKSB7XG5cdFx0Y29uc3Qgc0VsZW1lQmluZGluZ1BhdGggPSBgJHsob0VsZW0gYXMgVGFibGUpLmdldFJvd0JpbmRpbmcoKS5nZXRQYXRoKCl9YDtcblx0XHRpZiAoYU1vZGVsRGF0YS50YXJnZXQ/LmluZGV4T2Yoc0VsZW1lQmluZGluZ1BhdGgpID09PSAwKSB7XG5cdFx0XHRjb25zdCBhbGxSb3dDb250ZXh0cyA9ICgob0VsZW0gYXMgVGFibGUpLmdldFJvd0JpbmRpbmcoKSBhcyBPRGF0YUxpc3RCaW5kaW5nKS5nZXRDb250ZXh0cygpO1xuXHRcdFx0YWxsUm93Q29udGV4dHMuZm9yRWFjaCgocm93Q29udGV4dDogQ29udGV4dCkgPT4ge1xuXHRcdFx0XHRpZiAoYU1vZGVsRGF0YS50YXJnZXQ/LmluY2x1ZGVzKHJvd0NvbnRleHQuZ2V0UGF0aCgpKSkge1xuXHRcdFx0XHRcdGNvbnN0IGNvbnRleHRQYXRoID0gYCR7cm93Q29udGV4dC5nZXRQYXRoKCl9L2A7XG5cdFx0XHRcdFx0Y29uc3QgaWRlbnRpZmllckNvbHVtbiA9IChvRWxlbS5nZXRQYXJlbnQoKSBhcyBhbnkpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0XHRcdFx0XHRjb25zdCByb3dJZGVudGlmaWVyID0gaWRlbnRpZmllckNvbHVtbiAmJiByb3dDb250ZXh0LmdldE9iamVjdCgpW2lkZW50aWZpZXJDb2x1bW5dO1xuXHRcdFx0XHRcdGNvbnN0IGNvbHVtblByb3BlcnR5TmFtZSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRUYWJsZUNvbFByb3BlcnR5KG9FbGVtLCBhTW9kZWxEYXRhLCBjb250ZXh0UGF0aCk7XG5cdFx0XHRcdFx0Y29uc3QgeyBzVGFibGVUYXJnZXRDb2xOYW1lIH0gPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VGFibGVDb2xJbmZvKG9FbGVtLCBjb2x1bW5Qcm9wZXJ0eU5hbWUpO1xuXG5cdFx0XHRcdFx0Ly8gaWYgdGFyZ2V0IGhhcyBzb21lIGNvbHVtbiBuYW1lIGFuZCBjb2x1bW4gaXMgdmlzaWJsZSBpbiBVSVxuXHRcdFx0XHRcdGlmIChjb2x1bW5Qcm9wZXJ0eU5hbWUgJiYgc1RhYmxlVGFyZ2V0Q29sTmFtZSkge1xuXHRcdFx0XHRcdFx0Ly8gaGVhZGVyIHdpbGwgYmUgcm93IElkZW50aWZpZXIsIGlmIGZvdW5kIGZyb20gYWJvdmUgY29kZSBvdGhlcndpc2UgaXQgc2hvdWxkIGJlIHRhYmxlIG5hbWVcblx0XHRcdFx0XHRcdGFNb2RlbERhdGFbXCJoZWFkZXJOYW1lXCJdID0gcm93SWRlbnRpZmllciA/IGAgJHtyb3dJZGVudGlmaWVyfWAgOiAob0VsZW0gYXMgVGFibGUpLmdldEhlYWRlcigpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBpZiBjb2x1bW4gZGF0YSBub3QgZm91bmQgKG1heSBiZSB0aGUgY29sdW1uIGlzIGhpZGRlbiksIGFkZCBncm91cGluZyBhcyBMYXN0IEFjdGlvblxuXHRcdFx0XHRcdFx0YU1vZGVsRGF0YVtcImhlYWRlck5hbWVcIl0gPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lKHNBY3Rpb25OYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBzZXQgdGhlIGdyb3VwIG5hbWUgb2YgTWVzc2FnZSBPYmplY3QgaW4gT1AgRGlzcGxheSBtb2RlLlxuICpcbiAqIEBwYXJhbSBhTW9kZWxEYXRhIE1lc3NhZ2UgT2JqZWN0XG4gKiBAcGFyYW0gc0FjdGlvbk5hbWUgIEFjdGlvbiBuYW1lXG4gKiBAcGFyYW0gY29udHJvbFxuICovXG5mdW5jdGlvbiBzZXRHcm91cE5hbWVPUERpc3BsYXlNb2RlKGFNb2RlbERhdGE6IE1lc3NhZ2VXaXRoSGVhZGVyLCBzQWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBjb250cm9sOiBhbnkpIHtcblx0Y29uc3Qgb1ZpZXdDb250ZXh0ID0gY29udHJvbD8uZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0Y29uc3Qgb3BMYXlvdXQ6IENvbnRyb2wgPSBjb250cm9sPy5nZXRDb250ZW50ICYmIGNvbnRyb2w/LmdldENvbnRlbnQoKVswXTtcblx0bGV0IGJJc0dlbmVyYWxHcm91cE5hbWUgPSB0cnVlO1xuXHRpZiAob3BMYXlvdXQpIHtcblx0XHRtZXNzYWdlSGFuZGxpbmcuZ2V0VmlzaWJsZVNlY3Rpb25zRnJvbU9iamVjdFBhZ2VMYXlvdXQob3BMYXlvdXQpLmZvckVhY2goZnVuY3Rpb24gKG9TZWN0aW9uOiBPYmplY3RQYWdlU2VjdGlvbikge1xuXHRcdFx0Y29uc3Qgc3ViU2VjdGlvbnMgPSBvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpO1xuXHRcdFx0c3ViU2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob1N1YlNlY3Rpb246IE9iamVjdFBhZ2VTdWJTZWN0aW9uKSB7XG5cdFx0XHRcdG9TdWJTZWN0aW9uLmZpbmRFbGVtZW50cyh0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRcdFx0aWYgKG9FbGVtLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0gb0VsZW0uZ2V0Um93QmluZGluZygpLFxuXHRcdFx0XHRcdFx0XHRzZXRTZWN0aW9uTmFtZUluR3JvdXAgPSB0cnVlO1xuXHRcdFx0XHRcdFx0bGV0IGNoaWxkVGFibGVFbGVtZW50OiBVSTVFbGVtZW50IHwgdW5kZWZpbmVkO1xuXG5cdFx0XHRcdFx0XHRvRWxlbS5maW5kRWxlbWVudHModHJ1ZSkuZm9yRWFjaCgob0VsZW1lbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VsZW1lbnQuaXNBKFwic2FwLm0uVGFibGVcIikgfHwgb0VsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLlRhYmxlXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2hpbGRUYWJsZUVsZW1lbnQgPSBvRWxlbWVudDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRpZiAob1Jvd0JpbmRpbmcpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc0VsZW1lQmluZGluZ1BhdGggPSBgJHtvVmlld0NvbnRleHQ/LmdldFBhdGgoKX0vJHtvRWxlbS5nZXRSb3dCaW5kaW5nKCk/LmdldFBhdGgoKX1gO1xuXHRcdFx0XHRcdFx0XHRpZiAoYU1vZGVsRGF0YS50YXJnZXQ/LmluZGV4T2Yoc0VsZW1lQmluZGluZ1BhdGgpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb2JqID0gbWVzc2FnZUhhbmRsaW5nLmdldFRhYmxlQ29sdW1uRGF0YUFuZFNldFN1YnRpbGUoXG5cdFx0XHRcdFx0XHRcdFx0XHRhTW9kZWxEYXRhLFxuXHRcdFx0XHRcdFx0XHRcdFx0b0VsZW0sXG5cdFx0XHRcdFx0XHRcdFx0XHRjaGlsZFRhYmxlRWxlbWVudCxcblx0XHRcdFx0XHRcdFx0XHRcdG9Sb3dCaW5kaW5nLFxuXHRcdFx0XHRcdFx0XHRcdFx0c0FjdGlvbk5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRzZXRTZWN0aW9uTmFtZUluR3JvdXAsXG5cdFx0XHRcdFx0XHRcdFx0XHRmbkNhbGxiYWNrU2V0R3JvdXBOYW1lXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCB7IG9UYXJnZXRUYWJsZUluZm8gfSA9IG9iajtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChzZXRTZWN0aW9uTmFtZUluR3JvdXApIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGlkZW50aWZpZXJDb2x1bW4gPSBvRWxlbS5nZXRQYXJlbnQoKS5nZXRJZGVudGlmaWVyQ29sdW1uKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoaWRlbnRpZmllckNvbHVtbikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBhbGxSb3dDb250ZXh0cyA9IG9FbGVtLmdldFJvd0JpbmRpbmcoKS5nZXRDb250ZXh0cygpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhbGxSb3dDb250ZXh0cy5mb3JFYWNoKChyb3dDb250ZXh0OiBDb250ZXh0KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGFNb2RlbERhdGEudGFyZ2V0Py5pbmNsdWRlcyhyb3dDb250ZXh0LmdldFBhdGgoKSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHJvd0lkZW50aWZpZXIgPSBpZGVudGlmaWVyQ29sdW1uXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdD8gcm93Q29udGV4dC5nZXRPYmplY3QoKVtpZGVudGlmaWVyQ29sdW1uXVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFNb2RlbERhdGFbXCJhZGRpdGlvbmFsVGV4dFwiXSA9IGAke3Jvd0lkZW50aWZpZXJ9LCAke29UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZX1gO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhTW9kZWxEYXRhW1wiYWRkaXRpb25hbFRleHRcIl0gPSBgJHtvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbE5hbWV9YDtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IGhlYWRlck5hbWUgPSBvRWxlbS5nZXRIZWFkZXJWaXNpYmxlKCkgJiYgb1RhcmdldFRhYmxlSW5mby50YWJsZUhlYWRlcjtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICghaGVhZGVyTmFtZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRoZWFkZXJOYW1lID0gb1N1YlNlY3Rpb24uZ2V0VGl0bGUoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGhlYWRlck5hbWUgPSBgJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9USVRMRV9UQUJMRV9ERU5PTUlOQVRPUlwiKX06ICR7aGVhZGVyTmFtZX1gO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0YU1vZGVsRGF0YVtcImhlYWRlck5hbWVcIl0gPSBoZWFkZXJOYW1lO1xuXHRcdFx0XHRcdFx0XHRcdFx0YklzR2VuZXJhbEdyb3VwTmFtZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdGlmIChiSXNHZW5lcmFsR3JvdXBOYW1lKSB7XG5cdFx0Y29uc3Qgc0VsZW1lQmluZGluZ1BhdGggPSBgJHtvVmlld0NvbnRleHQ/LmdldFBhdGgoKX1gO1xuXHRcdGlmIChhTW9kZWxEYXRhLnRhcmdldD8uaW5kZXhPZihzRWxlbWVCaW5kaW5nUGF0aCkgPT09IDApIHtcblx0XHRcdC8vIGNoZWNrIGlmIE9QIGNvbnRleHQgcGF0aCBpcyBwYXJ0IG9mIHRhcmdldCwgc2V0IExhc3QgQWN0aW9uIGFzIGdyb3VwIG5hbWVcblx0XHRcdGNvbnN0IGhlYWRlck5hbWUgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lKHNBY3Rpb25OYW1lKTtcblx0XHRcdGFNb2RlbERhdGFbXCJoZWFkZXJOYW1lXCJdID0gaGVhZGVyTmFtZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YU1vZGVsRGF0YVtcImhlYWRlck5hbWVcIl0gPSBcIkdlbmVyYWxcIjtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lKHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcge1xuXHRjb25zdCBzTGFzdEFjdGlvblRleHQgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJUX01FU1NBR0VfQlVUVE9OX1NBUEZFX01FU1NBR0VfR1JPVVBfTEFTVF9BQ1RJT05cIik7XG5cdHJldHVybiBzQWN0aW9uTmFtZSA/IGAke3NMYXN0QWN0aW9uVGV4dH06ICR7c0FjdGlvbk5hbWV9YCA6IFwiXCI7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGdpdmUgcmFuayBiYXNlZCBvbiBNZXNzYWdlIEdyb3VwL0hlYWRlciBuYW1lLCB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIFNvcnRpbmcgbWVzc2FnZXMgaW4gTWVzc2FnZSBkaWFsb2dcbiAqIExhc3QgQWN0aW9uIHNob3VsZCBiZSBzaG93biBhdCB0b3AsIG5leHQgUm93IElkIGFuZCBsYXN0IEdlbmVyYWwuXG4gKlxuICogQHBhcmFtIG9ialxuICogQHJldHVybnMgUmFuayBvZiBtZXNzYWdlXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VSYW5rKG9iajogTWVzc2FnZVdpdGhIZWFkZXIpOiBudW1iZXIge1xuXHRpZiAob2JqLmhlYWRlck5hbWU/LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJMYXN0IEFjdGlvblwiKSkge1xuXHRcdHJldHVybiAxO1xuXHR9IGVsc2UgaWYgKG9iai5oZWFkZXJOYW1lPy50b1N0cmluZygpLmluY2x1ZGVzKFwiR2VuZXJhbFwiKSkge1xuXHRcdHJldHVybiAzO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiAyO1xuXHR9XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIHNldCB0aGUgZ3JvdXAgbmFtZSB3aGljaCBjYW4gZWl0aGVyIEdlbmVyYWwgb3IgTGFzdCBBY3Rpb24uXG4gKlxuICogQHBhcmFtIGFNZXNzYWdlXG4gKiBAcGFyYW0gc0FjdGlvbk5hbWVcbiAqIEBwYXJhbSBiSXNHZW5lcmFsR3JvdXBOYW1lXG4gKi9cbmNvbnN0IGZuQ2FsbGJhY2tTZXRHcm91cE5hbWUgPSAoYU1lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyLCBzQWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBiSXNHZW5lcmFsR3JvdXBOYW1lPzogQm9vbGVhbikgPT4ge1xuXHRpZiAoYklzR2VuZXJhbEdyb3VwTmFtZSkge1xuXHRcdGNvbnN0IHNHZW5lcmFsR3JvdXBUZXh0ID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKS5nZXRUZXh0KFwiVF9NRVNTQUdFX0JVVFRPTl9TQVBGRV9NRVNTQUdFX0dST1VQX0dFTkVSQUxcIik7XG5cdFx0YU1lc3NhZ2VbXCJoZWFkZXJOYW1lXCJdID0gc0dlbmVyYWxHcm91cFRleHQ7XG5cdH0gZWxzZSB7XG5cdFx0YU1lc3NhZ2VbXCJoZWFkZXJOYW1lXCJdID0gbWVzc2FnZUhhbmRsaW5nLmdldExhc3RBY3Rpb25UZXh0QW5kQWN0aW9uTmFtZShzQWN0aW9uTmFtZSk7XG5cdH1cbn07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGdldCB0aGUgdGFibGUgcm93L2NvbHVtbiBpbmZvIGFuZCBzZXQgc3VidGl0bGUuXG4gKlxuICogQHBhcmFtIGFNZXNzYWdlXG4gKiBAcGFyYW0gb1RhYmxlXG4gKiBAcGFyYW0gb0VsZW1lbnRcbiAqIEBwYXJhbSBvUm93QmluZGluZ1xuICogQHBhcmFtIHNBY3Rpb25OYW1lXG4gKiBAcGFyYW0gc2V0U2VjdGlvbk5hbWVJbkdyb3VwXG4gKiBAcGFyYW0gZm5TZXRHcm91cE5hbWVcbiAqIEByZXR1cm5zIFRhYmxlIGluZm8gYW5kIFN1YnRpdGxlLlxuICovXG5mdW5jdGlvbiBnZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlKFxuXHRhTWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsXG5cdG9UYWJsZTogVGFibGUsXG5cdG9FbGVtZW50OiBVSTVFbGVtZW50IHwgdW5kZWZpbmVkLFxuXHRvUm93QmluZGluZzogQmluZGluZyxcblx0c0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0c2V0U2VjdGlvbk5hbWVJbkdyb3VwOiBCb29sZWFuLFxuXHRmblNldEdyb3VwTmFtZTogYW55XG4pIHtcblx0Y29uc3Qgb1RhcmdldFRhYmxlSW5mbyA9IG1lc3NhZ2VIYW5kbGluZy5nZXRUYWJsZUFuZFRhcmdldEluZm8ob1RhYmxlLCBhTWVzc2FnZSwgb0VsZW1lbnQsIG9Sb3dCaW5kaW5nKTtcblx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSBhcyBhbnk7XG5cdG9UYXJnZXRUYWJsZUluZm8udGFibGVIZWFkZXIgPSBvVGFibGUuZ2V0SGVhZGVyKCk7XG5cblx0bGV0IHNDb250cm9sSWQsIGJJc0NyZWF0aW9uUm93O1xuXHRpZiAoIW9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCkge1xuXHRcdHNDb250cm9sSWQgPSBhTWVzc2FnZS5nZXRDb250cm9sSWRzKCkuZmluZChmdW5jdGlvbiAoc0lkOiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiBtZXNzYWdlSGFuZGxpbmcuaXNDb250cm9sSW5UYWJsZShvVGFibGUsIHNJZCk7XG5cdFx0fSk7XG5cdH1cblxuXHRpZiAoc0NvbnRyb2xJZCkge1xuXHRcdGNvbnN0IG9Db250cm9sID0gQ29yZS5ieUlkKHNDb250cm9sSWQpO1xuXHRcdGJJc0NyZWF0aW9uUm93ID0gbWVzc2FnZUhhbmRsaW5nLmlzQ29udHJvbFBhcnRPZkNyZWF0aW9uUm93KG9Db250cm9sKTtcblx0fVxuXG5cdGlmICghb1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lKSB7XG5cdFx0Ly8gaWYgdGhlIGNvbHVtbiBpcyBub3QgcHJlc2VudCBvbiBVSSBvciB0aGUgdGFyZ2V0IGRvZXMgbm90IGhhdmUgYSB0YWJsZSBmaWVsZCBpbiBpdCwgdXNlIExhc3QgQWN0aW9uIGZvciBncm91cGluZ1xuXHRcdGlmICgoYU1lc3NhZ2UgYXMgYW55KS5wZXJzaXN0ZW50ICYmIHNBY3Rpb25OYW1lKSB7XG5cdFx0XHRmblNldEdyb3VwTmFtZShhTWVzc2FnZSwgc0FjdGlvbk5hbWUpO1xuXHRcdFx0c2V0U2VjdGlvbk5hbWVJbkdyb3VwID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3Qgc3ViVGl0bGUgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZVN1YnRpdGxlKFxuXHRcdGFNZXNzYWdlLFxuXHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93QmluZGluZ0NvbnRleHRzLFxuXHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCxcblx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbE5hbWUsXG5cdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdG9UYWJsZSxcblx0XHRiSXNDcmVhdGlvblJvd1xuXHQpO1xuXG5cdHJldHVybiB7IG9UYXJnZXRUYWJsZUluZm8sIHN1YlRpdGxlIH07XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSB0aGUgc3VidGl0bGUgYmFzZWQgb24gVGFibGUgUm93L0NvbHVtbiBkYXRhLlxuICpcbiAqIEBwYXJhbSBtZXNzYWdlXG4gKiBAcGFyYW0gb1RhYmxlUm93QmluZGluZ0NvbnRleHRzXG4gKiBAcGFyYW0gb1RhYmxlUm93Q29udGV4dFxuICogQHBhcmFtIHNUYWJsZVRhcmdldENvbE5hbWVcbiAqIEBwYXJhbSBvUmVzb3VyY2VCdW5kbGVcbiAqIEBwYXJhbSBvVGFibGVcbiAqIEBwYXJhbSBiSXNDcmVhdGlvblJvd1xuICogQHBhcmFtIG9UYXJnZXRlZENvbnRyb2xcbiAqIEByZXR1cm5zIE1lc3NhZ2Ugc3VidGl0bGUuXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VTdWJ0aXRsZShcblx0bWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsXG5cdG9UYWJsZVJvd0JpbmRpbmdDb250ZXh0czogQ29udGV4dFtdLFxuXHRvVGFibGVSb3dDb250ZXh0OiBDb250ZXh0IHwgdW5kZWZpbmVkLFxuXHRzVGFibGVUYXJnZXRDb2xOYW1lOiBzdHJpbmcgfCBib29sZWFuLFxuXHRvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLFxuXHRvVGFibGU6IFRhYmxlLFxuXHRiSXNDcmVhdGlvblJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCxcblx0b1RhcmdldGVkQ29udHJvbD86IENvbnRyb2xcbik6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQge1xuXHRsZXQgc01lc3NhZ2VTdWJ0aXRsZTtcblx0bGV0IHNSb3dTdWJ0aXRsZVZhbHVlO1xuXHRjb25zdCBzVGFibGVGaXJzdENvbFByb3BlcnR5ID0gKG9UYWJsZSBhcyBhbnkpLmdldFBhcmVudCgpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0Y29uc3Qgb0NvbEZyb21UYWJsZVNldHRpbmdzID0gbWVzc2FnZUhhbmRsaW5nLmZldGNoQ29sdW1uSW5mbyhtZXNzYWdlLCBvVGFibGUpO1xuXHRpZiAoYklzQ3JlYXRpb25Sb3cpIHtcblx0XHRzTWVzc2FnZVN1YnRpdGxlID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJUX01FU1NBR0VfSVRFTV9TVUJUSVRMRVwiLCBvUmVzb3VyY2VCdW5kbGUsIFtcblx0XHRcdG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9NRVNTQUdFX0lURU1fU1VCVElUTEVfQ1JFQVRJT05fUk9XX0lORElDQVRPUlwiKSxcblx0XHRcdHNUYWJsZVRhcmdldENvbE5hbWUgPyBzVGFibGVUYXJnZXRDb2xOYW1lIDogKG9Db2xGcm9tVGFibGVTZXR0aW5ncyBhcyBDb2x1bW5XaXRoTGFiZWxUeXBlKS5sYWJlbFxuXHRcdF0pO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IG9UYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRUZXh0QW5ub3RhdGlvbiA9IG1lc3NhZ2VIYW5kbGluZy5nZXRUYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRGb3JUZXh0QW5ub3RhdGlvbihcblx0XHRcdG9UYWJsZSxcblx0XHRcdG9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5XG5cdFx0KTtcblx0XHRjb25zdCBzVGFibGVGaXJzdENvbFRleHRBbm5vdGF0aW9uUGF0aCA9IG9UYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRUZXh0QW5ub3RhdGlvblxuXHRcdFx0PyBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb24uZ2V0T2JqZWN0KFwiJFBhdGhcIilcblx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHNUYWJsZUZpcnN0Q29sVGV4dEFycmFuZ2VtZW50ID1cblx0XHRcdHNUYWJsZUZpcnN0Q29sVGV4dEFubm90YXRpb25QYXRoICYmIG9UYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRUZXh0QW5ub3RhdGlvblxuXHRcdFx0XHQ/IG9UYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRUZXh0QW5ub3RhdGlvbi5nZXRPYmplY3QoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50LyRFbnVtTWVtYmVyXCIpXG5cdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGlmIChvVGFibGVSb3dCaW5kaW5nQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0Ly8gc2V0IFJvdyBzdWJ0aXRsZSB0ZXh0XG5cdFx0XHRpZiAob1RhcmdldGVkQ29udHJvbCkge1xuXHRcdFx0XHQvLyBUaGUgVUkgZXJyb3IgaXMgb24gdGhlIGZpcnN0IGNvbHVtbiwgd2UgdGhlbiBnZXQgdGhlIGNvbnRyb2wgaW5wdXQgYXMgdGhlIHJvdyBpbmRpY2F0b3I6XG5cdFx0XHRcdHNSb3dTdWJ0aXRsZVZhbHVlID0gKG9UYXJnZXRlZENvbnRyb2wgYXMgYW55KS5nZXRWYWx1ZSgpO1xuXHRcdFx0fSBlbHNlIGlmIChvVGFibGVSb3dDb250ZXh0ICYmIHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpIHtcblx0XHRcdFx0c1Jvd1N1YnRpdGxlVmFsdWUgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VGFibGVGaXJzdENvbFZhbHVlKFxuXHRcdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHksXG5cdFx0XHRcdFx0b1RhYmxlUm93Q29udGV4dCxcblx0XHRcdFx0XHRzVGFibGVGaXJzdENvbFRleHRBbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0XHRzVGFibGVGaXJzdENvbFRleHRBcnJhbmdlbWVudFxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c1Jvd1N1YnRpdGxlVmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHQvLyBzZXQgdGhlIG1lc3NhZ2Ugc3VidGl0bGVcblx0XHRcdGNvbnN0IG9Db2x1bW5JbmZvOiBDb2x1bW5JbmZvVHlwZSA9IG1lc3NhZ2VIYW5kbGluZy5kZXRlcm1pbmVDb2x1bW5JbmZvKG9Db2xGcm9tVGFibGVTZXR0aW5ncywgb1Jlc291cmNlQnVuZGxlKTtcblx0XHRcdGlmIChzUm93U3VidGl0bGVWYWx1ZSAmJiBzVGFibGVUYXJnZXRDb2xOYW1lKSB7XG5cdFx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfTUVTU0FHRV9JVEVNX1NVQlRJVExFXCIsIG9SZXNvdXJjZUJ1bmRsZSwgW1xuXHRcdFx0XHRcdHNSb3dTdWJ0aXRsZVZhbHVlLFxuXHRcdFx0XHRcdHNUYWJsZVRhcmdldENvbE5hbWVcblx0XHRcdFx0XSk7XG5cdFx0XHR9IGVsc2UgaWYgKHNSb3dTdWJ0aXRsZVZhbHVlICYmIG9Db2x1bW5JbmZvLnNDb2x1bW5JbmRpY2F0b3IgPT09IFwiSGlkZGVuXCIpIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IGAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX0RFU0NSSVBUSU9OX1RBQkxFX1JPV1wiKX06ICR7c1Jvd1N1YnRpdGxlVmFsdWV9LCAke1xuXHRcdFx0XHRcdG9Db2x1bW5JbmZvLnNDb2x1bW5WYWx1ZVxuXHRcdFx0XHR9YDtcblx0XHRcdH0gZWxzZSBpZiAoc1Jvd1N1YnRpdGxlVmFsdWUgJiYgb0NvbHVtbkluZm8uc0NvbHVtbkluZGljYXRvciA9PT0gXCJVbmtub3duXCIpIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiVF9NRVNTQUdFX0lURU1fU1VCVElUTEVcIiwgb1Jlc291cmNlQnVuZGxlLCBbXG5cdFx0XHRcdFx0c1Jvd1N1YnRpdGxlVmFsdWUsXG5cdFx0XHRcdFx0b0NvbHVtbkluZm8uc0NvbHVtblZhbHVlXG5cdFx0XHRcdF0pO1xuXHRcdFx0fSBlbHNlIGlmIChzUm93U3VidGl0bGVWYWx1ZSAmJiBvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBgJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9ST1dcIil9OiAke3NSb3dTdWJ0aXRsZVZhbHVlfWA7XG5cdFx0XHR9IGVsc2UgaWYgKCFzUm93U3VidGl0bGVWYWx1ZSAmJiBzVGFibGVUYXJnZXRDb2xOYW1lKSB7XG5cdFx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9DT0xVTU5cIikgKyBcIjogXCIgKyBzVGFibGVUYXJnZXRDb2xOYW1lO1xuXHRcdFx0fSBlbHNlIGlmICghc1Jvd1N1YnRpdGxlVmFsdWUgJiYgb0NvbHVtbkluZm8uc0NvbHVtbkluZGljYXRvciA9PT0gXCJIaWRkZW5cIikge1xuXHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gb0NvbHVtbkluZm8uc0NvbHVtblZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBudWxsO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzTWVzc2FnZVN1YnRpdGxlO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBnZXQgdGhlIGZpcnN0IGNvbHVtbiBmb3IgdGV4dCBBbm5vdGF0aW9uLCB0aGlzIGlzIG5lZWRlZCB0byBzZXQgc3VidGl0bGUgb2YgTWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlXG4gKiBAcGFyYW0gb1RhYmxlUm93Q29udGV4dFxuICogQHBhcmFtIHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcbiAqIEByZXR1cm5zIEJpbmRpbmcgY29udGV4dC5cbiAqL1xuZnVuY3Rpb24gZ2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb24oXG5cdG9UYWJsZTogVGFibGUsXG5cdG9UYWJsZVJvd0NvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQsXG5cdHNUYWJsZUZpcnN0Q29sUHJvcGVydHk6IHN0cmluZ1xuKTogQ29udGV4dCB8IG51bGwgfCB1bmRlZmluZWQge1xuXHRsZXQgb0JpbmRpbmdDb250ZXh0O1xuXHRpZiAob1RhYmxlUm93Q29udGV4dCAmJiBzVGFibGVGaXJzdENvbFByb3BlcnR5KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb1RhYmxlPy5nZXRNb2RlbCgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWw/LmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IHNNZXRhUGF0aCA9IChvTWV0YU1vZGVsIGFzIGFueSk/LmdldE1ldGFQYXRoKG9UYWJsZVJvd0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRpZiAob01ldGFNb2RlbD8uZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vJHtzVGFibGVGaXJzdENvbFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dC8kUGF0aGApKSB7XG5cdFx0XHRvQmluZGluZ0NvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NNZXRhUGF0aH0vJHtzVGFibGVGaXJzdENvbFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dGApO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb0JpbmRpbmdDb250ZXh0O1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBnZXQgdGhlIHZhbHVlIG9mIGZpcnN0IENvbHVtbiBvZiBUYWJsZSwgd2l0aCBpdHMgdGV4dCBBcnJhbmdlbWVudC5cbiAqXG4gKiBAcGFyYW0gc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuICogQHBhcmFtIG9UYWJsZVJvd0NvbnRleHRcbiAqIEBwYXJhbSBzVGV4dEFubm90YXRpb25QYXRoXG4gKiBAcGFyYW0gc1RleHRBcnJhbmdlbWVudFxuICogQHJldHVybnMgQ29sdW1uIFZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRUYWJsZUZpcnN0Q29sVmFsdWUoXG5cdHNUYWJsZUZpcnN0Q29sUHJvcGVydHk6IHN0cmluZyxcblx0b1RhYmxlUm93Q29udGV4dDogQ29udGV4dCxcblx0c1RleHRBbm5vdGF0aW9uUGF0aDogc3RyaW5nLFxuXHRzVGV4dEFycmFuZ2VtZW50OiBzdHJpbmdcbik6IHN0cmluZyB7XG5cdGNvbnN0IHNDb2RlVmFsdWUgPSAob1RhYmxlUm93Q29udGV4dCBhcyBhbnkpLmdldFZhbHVlKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpO1xuXHRsZXQgc1RleHRWYWx1ZTtcblx0bGV0IHNDb21wdXRlZFZhbHVlID0gc0NvZGVWYWx1ZTtcblx0aWYgKHNUZXh0QW5ub3RhdGlvblBhdGgpIHtcblx0XHRpZiAoc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eS5sYXN0SW5kZXhPZihcIi9cIikgPiAwKSB7XG5cdFx0XHQvLyB0aGUgdGFyZ2V0IHByb3BlcnR5IGlzIHJlcGxhY2VkIHdpdGggdGhlIHRleHQgYW5ub3RhdGlvbiBwYXRoXG5cdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5ID0gc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eS5zbGljZSgwLCBzVGFibGVGaXJzdENvbFByb3BlcnR5Lmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuXHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IHNUYWJsZUZpcnN0Q29sUHJvcGVydHkuY29uY2F0KHNUZXh0QW5ub3RhdGlvblBhdGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5ID0gc1RleHRBbm5vdGF0aW9uUGF0aDtcblx0XHR9XG5cdFx0c1RleHRWYWx1ZSA9IChvVGFibGVSb3dDb250ZXh0IGFzIGFueSkuZ2V0VmFsdWUoc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSk7XG5cdFx0aWYgKHNUZXh0VmFsdWUpIHtcblx0XHRcdGlmIChzVGV4dEFycmFuZ2VtZW50KSB7XG5cdFx0XHRcdGNvbnN0IHNFbnVtTnVtYmVyID0gc1RleHRBcnJhbmdlbWVudC5zbGljZShzVGV4dEFycmFuZ2VtZW50LmluZGV4T2YoXCIvXCIpICsgMSk7XG5cdFx0XHRcdHN3aXRjaCAoc0VudW1OdW1iZXIpIHtcblx0XHRcdFx0XHRjYXNlIFwiVGV4dE9ubHlcIjpcblx0XHRcdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gc1RleHRWYWx1ZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJUZXh0Rmlyc3RcIjpcblx0XHRcdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gYCR7c1RleHRWYWx1ZX0gKCR7c0NvZGVWYWx1ZX0pYDtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJUZXh0TGFzdFwiOlxuXHRcdFx0XHRcdFx0c0NvbXB1dGVkVmFsdWUgPSBgJHtzQ29kZVZhbHVlfSAoJHtzVGV4dFZhbHVlfSlgO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIlRleHRTZXBhcmF0ZVwiOlxuXHRcdFx0XHRcdFx0c0NvbXB1dGVkVmFsdWUgPSBzQ29kZVZhbHVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c0NvbXB1dGVkVmFsdWUgPSBgJHtzVGV4dFZhbHVlfSAoJHtzQ29kZVZhbHVlfSlgO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc0NvbXB1dGVkVmFsdWU7XG59XG5cbi8qKlxuICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB0byByZXRyaWV2ZSB0aGUgY29sdW1uIGluZm8gZnJvbSB0aGUgYXNzb2NpYXRlZCBtZXNzYWdlIG9mIHRoZSBtZXNzYWdlIHBvcG92ZXIuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvTWVzc2FnZSBNZXNzYWdlIG9iamVjdFxuICogQHBhcmFtIG9UYWJsZSBNZGNUYWJsZVxuICogQHJldHVybnMgUmV0dXJucyB0aGUgY29sdW1uIGluZm8uXG4gKi9cbmZ1bmN0aW9uIGZldGNoQ29sdW1uSW5mbyhvTWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsIG9UYWJsZTogVGFibGUpOiBDb2x1bW4ge1xuXHRjb25zdCBzQ29sTmFtZUZyb21NZXNzYWdlT2JqID0gb01lc3NhZ2U/LmdldFRhcmdldHMoKVswXS5zcGxpdChcIi9cIikucG9wKCk7XG5cdHJldHVybiAob1RhYmxlIGFzIGFueSlcblx0XHQuZ2V0UGFyZW50KClcblx0XHQuZ2V0VGFibGVEZWZpbml0aW9uKClcblx0XHQuY29sdW1ucy5maW5kKGZ1bmN0aW9uIChvQ29sdW1uOiBhbnkpIHtcblx0XHRcdHJldHVybiBvQ29sdW1uLmtleS5zcGxpdChcIjo6XCIpLnBvcCgpID09PSBzQ29sTmFtZUZyb21NZXNzYWdlT2JqO1xuXHRcdH0pO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gZ2V0IHRoZSBDb2x1bW4gZGF0YSBkZXBlbmRpbmcgb24gaXRzIGF2YWlsYWJpbGl0eSBpbiBUYWJsZSwgdGhpcyBpcyBuZWVkZWQgZm9yIHNldHRpbmcgc3VidGl0bGUgb2YgTWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0gb0NvbEZyb21UYWJsZVNldHRpbmdzXG4gKiBAcGFyYW0gb1Jlc291cmNlQnVuZGxlXG4gKiBAcmV0dXJucyBDb2x1bW4gZGF0YS5cbiAqL1xuZnVuY3Rpb24gZGV0ZXJtaW5lQ29sdW1uSW5mbyhvQ29sRnJvbVRhYmxlU2V0dGluZ3M6IGFueSwgb1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSk6IENvbHVtbkluZm9UeXBlIHtcblx0Y29uc3Qgb0NvbHVtbkluZm86IGFueSA9IHsgc0NvbHVtbkluZGljYXRvcjogU3RyaW5nLCBzQ29sdW1uVmFsdWU6IFN0cmluZyB9O1xuXHRpZiAob0NvbEZyb21UYWJsZVNldHRpbmdzKSB7XG5cdFx0Ly8gaWYgY29sdW1uIGlzIG5laXRoZXIgaW4gdGFibGUgZGVmaW5pdGlvbiBub3IgcGVyc29uYWxpemF0aW9uLCBzaG93IG9ubHkgcm93IHN1YnRpdGxlIHRleHRcblx0XHRpZiAob0NvbEZyb21UYWJsZVNldHRpbmdzLmF2YWlsYWJpbGl0eSA9PT0gXCJIaWRkZW5cIikge1xuXHRcdFx0b0NvbHVtbkluZm8uc0NvbHVtblZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdFx0b0NvbHVtbkluZm8uc0NvbHVtbkluZGljYXRvciA9IFwidW5kZWZpbmVkXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vaWYgY29sdW1uIGlzIGluIHRhYmxlIHBlcnNvbmFsaXphdGlvbiBidXQgbm90IGluIHRhYmxlIGRlZmluaXRpb24sIHNob3cgQ29sdW1uIChIaWRkZW4pIDogPGNvbE5hbWU+XG5cdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uVmFsdWUgPSBgJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9DT0xVTU5cIil9ICgke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFxuXHRcdFx0XHRcIlRfQ09MVU1OX0lORElDQVRPUl9JTl9UQUJMRV9ERUZJTklUSU9OXCJcblx0XHRcdCl9KTogJHtvQ29sRnJvbVRhYmxlU2V0dGluZ3MubGFiZWx9YDtcblx0XHRcdG9Db2x1bW5JbmZvLnNDb2x1bW5JbmRpY2F0b3IgPSBcIkhpZGRlblwiO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRvQ29sdW1uSW5mby5zQ29sdW1uVmFsdWUgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9JVEVNX1NVQlRJVExFX0lORElDQVRPUl9VTktOT1dOXCIpO1xuXHRcdG9Db2x1bW5JbmZvLnNDb2x1bW5JbmRpY2F0b3IgPSBcIlVua25vd25cIjtcblx0fVxuXHRyZXR1cm4gb0NvbHVtbkluZm87XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBjaGVjayBpZiBhIGdpdmVuIGNvbnRyb2wgaWQgaXMgYSBwYXJ0IG9mIFRhYmxlLlxuICpcbiAqIEBwYXJhbSBvVGFibGVcbiAqIEBwYXJhbSBzQ29udHJvbElkXG4gKiBAcmV0dXJucyBUcnVlIGlmIGNvbnRyb2wgaXMgcGFydCBvZiB0YWJsZS5cbiAqL1xuZnVuY3Rpb24gaXNDb250cm9sSW5UYWJsZShvVGFibGU6IFRhYmxlLCBzQ29udHJvbElkOiBzdHJpbmcpOiBVSTVFbGVtZW50W10gfCBib29sZWFuIHtcblx0Y29uc3Qgb0NvbnRyb2w6IGFueSA9IENvcmUuYnlJZChzQ29udHJvbElkKTtcblx0aWYgKG9Db250cm9sICYmICFvQ29udHJvbC5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikgJiYgIW9Db250cm9sLmlzQShcInNhcC5tLlRhYmxlXCIpKSB7XG5cdFx0cmV0dXJuIG9UYWJsZS5maW5kRWxlbWVudHModHJ1ZSwgZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRcdHJldHVybiBvRWxlbS5nZXRJZCgpID09PSBvQ29udHJvbDtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzQ29udHJvbFBhcnRPZkNyZWF0aW9uUm93KG9Db250cm9sOiBVSTVFbGVtZW50IHwgdW5kZWZpbmVkKSB7XG5cdGxldCBvUGFyZW50Q29udHJvbCA9IG9Db250cm9sPy5nZXRQYXJlbnQoKTtcblx0d2hpbGUgKFxuXHRcdG9QYXJlbnRDb250cm9sICYmXG5cdFx0IW9QYXJlbnRDb250cm9sPy5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpICYmXG5cdFx0IW9QYXJlbnRDb250cm9sPy5pc0EoXCJzYXAudWkudGFibGUuQ3JlYXRpb25Sb3dcIikgJiZcblx0XHQhb1BhcmVudENvbnRyb2w/LmlzQShcInNhcC5tLkNvbHVtbkxpc3RJdGVtXCIpXG5cdCkge1xuXHRcdG9QYXJlbnRDb250cm9sID0gb1BhcmVudENvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdH1cblxuXHRyZXR1cm4gISFvUGFyZW50Q29udHJvbCAmJiBvUGFyZW50Q29udHJvbC5pc0EoXCJzYXAudWkudGFibGUuQ3JlYXRpb25Sb3dcIik7XG59XG5cbmZ1bmN0aW9uIGdldFRyYW5zbGF0ZWRUZXh0Rm9yTWVzc2FnZURpYWxvZyhzSGlnaGVzdFByaW9yaXR5OiBhbnkpIHtcblx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0c3dpdGNoIChzSGlnaGVzdFByaW9yaXR5KSB7XG5cdFx0Y2FzZSBcIkVycm9yXCI6XG5cdFx0XHRyZXR1cm4gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX0VSUk9SXCIpO1xuXHRcdGNhc2UgXCJJbmZvcm1hdGlvblwiOlxuXHRcdFx0cmV0dXJuIG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfSU5GT1wiKTtcblx0XHRjYXNlIFwiU3VjY2Vzc1wiOlxuXHRcdFx0cmV0dXJuIG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfU1VDQ0VTU1wiKTtcblx0XHRjYXNlIFwiV2FybmluZ1wiOlxuXHRcdFx0cmV0dXJuIG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfV0FSTklOR1wiKTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVcIik7XG5cdH1cbn1cbmZ1bmN0aW9uIHJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKSB7XG5cdHJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyhmYWxzZSk7XG59XG5mdW5jdGlvbiByZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyhzUGF0aFRvQmVSZW1vdmVkPzogc3RyaW5nKSB7XG5cdHJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyh0cnVlLCBzUGF0aFRvQmVSZW1vdmVkKTtcbn1cblxuZnVuY3Rpb24gZ2V0TWVzc2FnZXNGcm9tTWVzc2FnZU1vZGVsKG9NZXNzYWdlTW9kZWw6IGFueSwgc1BhdGhUb0JlUmVtb3ZlZD86IHN0cmluZykge1xuXHRpZiAoc1BhdGhUb0JlUmVtb3ZlZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIG9NZXNzYWdlTW9kZWwuZ2V0T2JqZWN0KFwiL1wiKTtcblx0fVxuXHRjb25zdCBsaXN0QmluZGluZyA9IG9NZXNzYWdlTW9kZWwuYmluZExpc3QoXCIvXCIpO1xuXG5cdGxpc3RCaW5kaW5nLmZpbHRlcihcblx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdHBhdGg6IFwidGFyZ2V0XCIsXG5cdFx0XHRvcGVyYXRvcjogRmlsdGVyT3BlcmF0b3IuU3RhcnRzV2l0aCxcblx0XHRcdHZhbHVlMTogc1BhdGhUb0JlUmVtb3ZlZFxuXHRcdH0pXG5cdCk7XG5cblx0cmV0dXJuIGxpc3RCaW5kaW5nLmdldEN1cnJlbnRDb250ZXh0cygpLm1hcChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0fSk7XG59XG5mdW5jdGlvbiBnZXRNZXNzYWdlcyhiQm91bmRNZXNzYWdlczogYm9vbGVhbiA9IGZhbHNlLCBiVHJhbnNpdGlvbk9ubHk6IGJvb2xlYW4gPSBmYWxzZSwgc1BhdGhUb0JlUmVtb3ZlZD86IHN0cmluZykge1xuXHRsZXQgaTtcblx0Y29uc3Qgb01lc3NhZ2VNYW5hZ2VyID0gQ29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLFxuXHRcdG9NZXNzYWdlTW9kZWwgPSBvTWVzc2FnZU1hbmFnZXIuZ2V0TWVzc2FnZU1vZGVsKCksXG5cdFx0b1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSxcblx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzID0gW107XG5cdGxldCBhTWVzc2FnZXM6IGFueVtdID0gW107XG5cdGlmIChiQm91bmRNZXNzYWdlcyAmJiBiVHJhbnNpdGlvbk9ubHkgJiYgc1BhdGhUb0JlUmVtb3ZlZCkge1xuXHRcdGFNZXNzYWdlcyA9IGdldE1lc3NhZ2VzRnJvbU1lc3NhZ2VNb2RlbChvTWVzc2FnZU1vZGVsLCBzUGF0aFRvQmVSZW1vdmVkKTtcblx0fSBlbHNlIHtcblx0XHRhTWVzc2FnZXMgPSBvTWVzc2FnZU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdH1cblx0Zm9yIChpID0gMDsgaSA8IGFNZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChcblx0XHRcdCghYlRyYW5zaXRpb25Pbmx5IHx8IGFNZXNzYWdlc1tpXS5wZXJzaXN0ZW50KSAmJlxuXHRcdFx0KChiQm91bmRNZXNzYWdlcyAmJiBhTWVzc2FnZXNbaV0udGFyZ2V0ICE9PSBcIlwiKSB8fCAoIWJCb3VuZE1lc3NhZ2VzICYmICghYU1lc3NhZ2VzW2ldLnRhcmdldCB8fCBhTWVzc2FnZXNbaV0udGFyZ2V0ID09PSBcIlwiKSkpXG5cdFx0KSB7XG5cdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzLnB1c2goYU1lc3NhZ2VzW2ldKTtcblx0XHR9XG5cdH1cblxuXHRmb3IgKGkgPSAwOyBpIDwgYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChcblx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0uY29kZSA9PT0gXCI1MDNcIiAmJlxuXHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS5tZXNzYWdlICE9PSBcIlwiICYmXG5cdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLm1lc3NhZ2UuaW5kZXhPZihvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfQkFDS0VORF9QUkVGSVhcIikpID09PSAtMVxuXHRcdCkge1xuXHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS5tZXNzYWdlID0gYFxcbiR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0JBQ0tFTkRfUFJFRklYXCIpfSR7XG5cdFx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0ubWVzc2FnZVxuXHRcdFx0fWA7XG5cdFx0fVxuXHR9XG5cdC8vRmlsdGVyaW5nIG1lc3NhZ2VzIGFnYWluIGhlcmUgdG8gYXZvaWQgc2hvd2luZyBwdXJlIHRlY2huaWNhbCBtZXNzYWdlcyByYWlzZWQgYnkgdGhlIG1vZGVsXG5cdGNvbnN0IGJhY2tlbmRNZXNzYWdlczogYW55ID0gW107XG5cdGZvciAoaSA9IDA7IGkgPCBhVHJhbnNpdGlvbk1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKFxuXHRcdFx0KGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0udGVjaG5pY2FsRGV0YWlscyAmJlxuXHRcdFx0XHQoKGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0udGVjaG5pY2FsRGV0YWlscy5vcmlnaW5hbE1lc3NhZ2UgIT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0udGVjaG5pY2FsRGV0YWlscy5vcmlnaW5hbE1lc3NhZ2UgIT09IG51bGwpIHx8XG5cdFx0XHRcdFx0KGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0udGVjaG5pY2FsRGV0YWlscy5odHRwU3RhdHVzICE9PSB1bmRlZmluZWQgJiZcblx0XHRcdFx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0udGVjaG5pY2FsRGV0YWlscy5odHRwU3RhdHVzICE9PSBudWxsKSkpIHx8XG5cdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLmNvZGVcblx0XHQpIHtcblx0XHRcdGJhY2tlbmRNZXNzYWdlcy5wdXNoKGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gYmFja2VuZE1lc3NhZ2VzO1xufVxuZnVuY3Rpb24gcmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKGJCb3VuZE1lc3NhZ2VzOiBhbnksIHNQYXRoVG9CZVJlbW92ZWQ/OiBzdHJpbmcpIHtcblx0Y29uc3QgYU1lc3NhZ2VzVG9CZURlbGV0ZWQgPSBnZXRNZXNzYWdlcyhiQm91bmRNZXNzYWdlcywgdHJ1ZSwgc1BhdGhUb0JlUmVtb3ZlZCk7XG5cblx0aWYgKGFNZXNzYWdlc1RvQmVEZWxldGVkLmxlbmd0aCA+IDApIHtcblx0XHRDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkucmVtb3ZlTWVzc2FnZXMoYU1lc3NhZ2VzVG9CZURlbGV0ZWQpO1xuXHR9XG59XG4vL1RPRE86IFRoaXMgbXVzdCBiZSBtb3ZlZCBvdXQgb2YgbWVzc2FnZSBoYW5kbGluZ1xuZnVuY3Rpb24gc2V0TWVzc2FnZVN1YnRpdGxlKG9UYWJsZTogVGFibGUsIGFDb250ZXh0czogQ29udGV4dFtdLCBtZXNzYWdlOiBNZXNzYWdlV2l0aEhlYWRlcikge1xuXHRjb25zdCBzdWJ0aXRsZUNvbHVtbiA9IChvVGFibGUuZ2V0UGFyZW50KCkgYXMgYW55KS5nZXRJZGVudGlmaWVyQ29sdW1uKCk7XG5cdGNvbnN0IGVycm9yQ29udGV4dCA9IGFDb250ZXh0cy5maW5kKGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0VGFyZ2V0cygpWzBdLmluZGV4T2Yob0NvbnRleHQuZ2V0UGF0aCgpKSAhPT0gLTE7XG5cdH0pO1xuXHRtZXNzYWdlLmFkZGl0aW9uYWxUZXh0ID0gZXJyb3JDb250ZXh0ID8gZXJyb3JDb250ZXh0LmdldE9iamVjdCgpW3N1YnRpdGxlQ29sdW1uXSA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBUaGUgbWV0aG9kIHJldHJpZXZlcyB0aGUgdmlzaWJsZSBzZWN0aW9ucyBmcm9tIGFuIG9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBvT2JqZWN0UGFnZUxheW91dCBUaGUgb2JqZWN0UGFnZUxheW91dCBvYmplY3QgZm9yIHdoaWNoIHdlIHdhbnQgdG8gcmV0cmlldmUgdGhlIHZpc2libGUgc2VjdGlvbnMuXG4gKiBAcmV0dXJucyBBcnJheSBvZiB2aXNpYmxlIHNlY3Rpb25zLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZ2V0VmlzaWJsZVNlY3Rpb25zRnJvbU9iamVjdFBhZ2VMYXlvdXQob09iamVjdFBhZ2VMYXlvdXQ6IENvbnRyb2wgfCBPYmplY3RQYWdlTGF5b3V0KSB7XG5cdHJldHVybiAob09iamVjdFBhZ2VMYXlvdXQgYXMgT2JqZWN0UGFnZUxheW91dCkuZ2V0U2VjdGlvbnMoKS5maWx0ZXIoZnVuY3Rpb24gKG9TZWN0aW9uOiBPYmplY3RQYWdlU2VjdGlvbikge1xuXHRcdHJldHVybiBvU2VjdGlvbi5nZXRWaXNpYmxlKCk7XG5cdH0pO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGlmIGNvbnRyb2wgaWRzIGZyb20gbWVzc2FnZSBhcmUgYSBwYXJ0IG9mIGEgZ2l2ZW4gc3Vic2VjdGlvbi5cbiAqXG4gKiBAcGFyYW0gc3ViU2VjdGlvblxuICogQHBhcmFtIG9NZXNzYWdlT2JqZWN0XG4gKiBAcmV0dXJucyBTdWJTZWN0aW9uIG1hdGNoaW5nIGNvbnRyb2wgaWRzLlxuICovXG5mdW5jdGlvbiBnZXRDb250cm9sRnJvbU1lc3NhZ2VSZWxhdGluZ1RvU3ViU2VjdGlvbihzdWJTZWN0aW9uOiBPYmplY3RQYWdlU3ViU2VjdGlvbiwgb01lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VXaXRoSGVhZGVyKTogVUk1RWxlbWVudFtdIHtcblx0cmV0dXJuIHN1YlNlY3Rpb25cblx0XHQuZmluZEVsZW1lbnRzKHRydWUsIChvRWxlbTogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gZm5GaWx0ZXJVcG9uSWRzKG9NZXNzYWdlT2JqZWN0LmdldENvbnRyb2xJZHMoKSwgb0VsZW0pO1xuXHRcdH0pXG5cdFx0LnNvcnQoZnVuY3Rpb24gKGE6IGFueSwgYjogYW55KSB7XG5cdFx0XHQvLyBjb250cm9scyBhcmUgc29ydGVkIGluIG9yZGVyIHRvIGhhdmUgdGhlIHRhYmxlIG9uIHRvcCBvZiB0aGUgYXJyYXlcblx0XHRcdC8vIGl0IHdpbGwgaGVscCB0byBjb21wdXRlIHRoZSBzdWJ0aXRsZSBvZiB0aGUgbWVzc2FnZSBiYXNlZCBvbiB0aGUgdHlwZSBvZiByZWxhdGVkIGNvbnRyb2xzXG5cdFx0XHRpZiAoYS5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpICYmICFiLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldFRhYmxlQ29sUHJvcGVydHkob1RhYmxlOiBDb250cm9sLCBvTWVzc2FnZU9iamVjdDogTWVzc2FnZVdpdGhIZWFkZXIsIG9Db250ZXh0UGF0aD86IGFueSkge1xuXHQvL3RoaXMgZnVuY3Rpb24gZXNjYXBlcyBhIHN0cmluZyB0byB1c2UgaXQgYXMgYSByZWdleFxuXHRjb25zdCBmblJlZ0V4cGVzY2FwZSA9IGZ1bmN0aW9uIChzOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gcy5yZXBsYWNlKC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csIFwiXFxcXCQmXCIpO1xuXHR9O1xuXHQvLyBiYXNlZCBvbiB0aGUgdGFyZ2V0IHBhdGggb2YgdGhlIG1lc3NhZ2Ugd2UgcmV0cmlldmUgdGhlIHByb3BlcnR5IG5hbWUuXG5cdC8vIHRvIGFjaGlldmUgaXQgd2UgcmVtb3ZlIHRoZSBiaW5kaW5nQ29udGV4dCBwYXRoIGFuZCB0aGUgcm93IGJpbmRpbmcgcGF0aCBmcm9tIHRoZSB0YXJnZXRcblx0aWYgKCFvQ29udGV4dFBhdGgpIHtcblx0XHRvQ29udGV4dFBhdGggPSBuZXcgUmVnRXhwKFxuXHRcdFx0YCR7Zm5SZWdFeHBlc2NhcGUoYCR7b1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKX0vJHsob1RhYmxlIGFzIFRhYmxlKS5nZXRSb3dCaW5kaW5nKCkuZ2V0UGF0aCgpfWApfVxcXFwoLipcXFxcKS9gXG5cdFx0KTtcblx0fVxuXHRyZXR1cm4gb01lc3NhZ2VPYmplY3QuZ2V0VGFyZ2V0cygpWzBdLnJlcGxhY2Uob0NvbnRleHRQYXRoLCBcIlwiKTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGdpdmVzIHRoZSBjb2x1bW4gaW5mb3JtYXRpb24gaWYgaXQgbWF0Y2hlcyB3aXRoIHRoZSBwcm9wZXJ0eSBuYW1lIGZyb20gdGFyZ2V0IG9mIG1lc3NhZ2UuXG4gKlxuICogQHBhcmFtIG9UYWJsZVxuICogQHBhcmFtIHNUYWJsZVRhcmdldENvbFByb3BlcnR5XG4gKiBAcmV0dXJucyBDb2x1bW4gbmFtZSBhbmQgcHJvcGVydHkuXG4gKi9cbmZ1bmN0aW9uIGdldFRhYmxlQ29sSW5mbyhvVGFibGU6IENvbnRyb2wsIHNUYWJsZVRhcmdldENvbFByb3BlcnR5OiBzdHJpbmcpIHtcblx0bGV0IHNUYWJsZVRhcmdldENvbE5hbWU6IHN0cmluZztcblx0bGV0IG9UYWJsZVRhcmdldENvbCA9IChvVGFibGUgYXMgVGFibGUpLmdldENvbHVtbnMoKS5maW5kKGZ1bmN0aW9uIChjb2x1bW46IGFueSkge1xuXHRcdHJldHVybiBjb2x1bW4uZ2V0RGF0YVByb3BlcnR5KCkgPT0gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk7XG5cdH0pO1xuXHRpZiAoIW9UYWJsZVRhcmdldENvbCkge1xuXHRcdC8qIElmIHRoZSB0YXJnZXQgY29sdW1uIGlzIG5vdCBmb3VuZCwgd2UgY2hlY2sgZm9yIGEgY3VzdG9tIGNvbHVtbiAqL1xuXHRcdGNvbnN0IG9DdXN0b21Db2x1bW4gPSAob1RhYmxlIGFzIFRhYmxlKVxuXHRcdFx0LmdldENvbnRyb2xEZWxlZ2F0ZSgpXG5cdFx0XHQuZ2V0Q29sdW1uc0ZvcihvVGFibGUpXG5cdFx0XHQuZmluZChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRcdGlmICghIW9Db2x1bW4udGVtcGxhdGUgJiYgb0NvbHVtbi5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdG9Db2x1bW4ucHJvcGVydHlJbmZvc1swXSA9PT0gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgfHxcblx0XHRcdFx0XHRcdG9Db2x1bW4ucHJvcGVydHlJbmZvc1swXS5yZXBsYWNlKFwiUHJvcGVydHk6OlwiLCBcIlwiKSA9PT0gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0aWYgKG9DdXN0b21Db2x1bW4pIHtcblx0XHRcdG9UYWJsZVRhcmdldENvbCA9IG9DdXN0b21Db2x1bW47XG5cdFx0XHRzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA9IChvVGFibGVUYXJnZXRDb2wgYXMgYW55KT8ubmFtZTtcblxuXHRcdFx0c1RhYmxlVGFyZ2V0Q29sTmFtZSA9IChvVGFibGUgYXMgYW55KVxuXHRcdFx0XHQuZ2V0Q29sdW1ucygpXG5cdFx0XHRcdC5maW5kKGZ1bmN0aW9uIChvQ29sdW1uOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPT09IG9Db2x1bW4uZ2V0RGF0YVByb3BlcnR5KCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5nZXRIZWFkZXIoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0LyogSWYgdGhlIHRhcmdldCBjb2x1bW4gaXMgbm90IGZvdW5kLCB3ZSBjaGVjayBmb3IgYSBmaWVsZCBncm91cCAqL1xuXHRcdFx0Y29uc3QgYUNvbHVtbnMgPSAob1RhYmxlIGFzIFRhYmxlKS5nZXRDb250cm9sRGVsZWdhdGUoKS5nZXRDb2x1bW5zRm9yKG9UYWJsZSk7XG5cdFx0XHRvVGFibGVUYXJnZXRDb2wgPSBhQ29sdW1ucy5maW5kKGZ1bmN0aW9uIChvQ29sdW1uOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9Db2x1bW4ua2V5LmluZGV4T2YoXCI6OkZpZWxkR3JvdXA6OlwiKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0NvbHVtbi5wcm9wZXJ0eUluZm9zPy5maW5kKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBhQ29sdW1ucy5maW5kKGZ1bmN0aW9uICh0YWJsZUNvbHVtbjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB0YWJsZUNvbHVtbi5yZWxhdGl2ZVBhdGggPT09IHNUYWJsZVRhcmdldENvbFByb3BlcnR5O1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0LyogY2hlY2sgaWYgdGhlIGNvbHVtbiB3aXRoIHRoZSBmaWVsZCBncm91cCBpcyB2aXNpYmxlIGluIHRoZSB0YWJsZTogKi9cblx0XHRcdGxldCBiSXNUYWJsZVRhcmdldENvbFZpc2libGUgPSBmYWxzZTtcblx0XHRcdGlmIChvVGFibGVUYXJnZXRDb2wgJiYgKG9UYWJsZVRhcmdldENvbCBhcyBhbnkpLmxhYmVsKSB7XG5cdFx0XHRcdGJJc1RhYmxlVGFyZ2V0Q29sVmlzaWJsZSA9IChvVGFibGUgYXMgVGFibGUpLmdldENvbHVtbnMoKS5zb21lKGZ1bmN0aW9uIChjb2x1bW46IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBjb2x1bW4uZ2V0SGVhZGVyKCkgPT09IChvVGFibGVUYXJnZXRDb2wgYXMgYW55KS5sYWJlbDtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRzVGFibGVUYXJnZXRDb2xOYW1lID0gYklzVGFibGVUYXJnZXRDb2xWaXNpYmxlICYmIChvVGFibGVUYXJnZXRDb2wgYXMgYW55KS5sYWJlbDtcblx0XHRcdHNUYWJsZVRhcmdldENvbFByb3BlcnR5ID0gYklzVGFibGVUYXJnZXRDb2xWaXNpYmxlICYmIChvVGFibGVUYXJnZXRDb2wgYXMgYW55KS5rZXk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHNUYWJsZVRhcmdldENvbE5hbWUgPSBvVGFibGVUYXJnZXRDb2wgJiYgb1RhYmxlVGFyZ2V0Q29sLmdldEhlYWRlcigpO1xuXHR9XG5cdHJldHVybiB7IHNUYWJsZVRhcmdldENvbE5hbWU6IHNUYWJsZVRhcmdldENvbE5hbWUsIHNUYWJsZVRhcmdldENvbFByb3BlcnR5OiBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSB9O1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gZ2l2ZXMgVGFibGUgYW5kIGNvbHVtbiBpbmZvIGlmIGFueSBvZiBpdCBtYXRjaGVzIHRoZSB0YXJnZXQgZnJvbSBNZXNzYWdlLlxuICpcbiAqIEBwYXJhbSBvVGFibGVcbiAqIEBwYXJhbSBvTWVzc2FnZU9iamVjdFxuICogQHBhcmFtIG9FbGVtZW50XG4gKiBAcGFyYW0gb1Jvd0JpbmRpbmdcbiAqIEByZXR1cm5zIFRhYmxlIGluZm8gbWF0Y2hpbmcgdGhlIG1lc3NhZ2UgdGFyZ2V0LlxuICovXG5mdW5jdGlvbiBnZXRUYWJsZUFuZFRhcmdldEluZm8ob1RhYmxlOiBUYWJsZSwgb01lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VXaXRoSGVhZGVyLCBvRWxlbWVudDogYW55LCBvUm93QmluZGluZzogQmluZGluZyk6IFRhcmdldFRhYmxlSW5mb1R5cGUge1xuXHRjb25zdCBvVGFyZ2V0VGFibGVJbmZvOiBhbnkgPSB7fTtcblx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA9IGdldFRhYmxlQ29sUHJvcGVydHkob1RhYmxlLCBvTWVzc2FnZU9iamVjdCk7XG5cdGNvbnN0IG9UYWJsZUNvbEluZm8gPSBnZXRUYWJsZUNvbEluZm8ob1RhYmxlLCBvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5KTtcblx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dCaW5kaW5nQ29udGV4dHMgPSBvRWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIilcblx0XHQ/IChvUm93QmluZGluZyBhcyBPRGF0YUxpc3RCaW5kaW5nKS5nZXRDb250ZXh0cygpXG5cdFx0OiAob1Jvd0JpbmRpbmcgYXMgT0RhdGFMaXN0QmluZGluZykuZ2V0Q3VycmVudENvbnRleHRzKCk7XG5cdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZSA9IG9UYWJsZUNvbEluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZTtcblx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA9IG9UYWJsZUNvbEluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk7XG5cdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCA9IG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93QmluZGluZ0NvbnRleHRzLmZpbmQoZnVuY3Rpb24gKHJvd0NvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiByb3dDb250ZXh0ICYmIG9NZXNzYWdlT2JqZWN0LmdldFRhcmdldHMoKVswXS5pbmRleE9mKHJvd0NvbnRleHQuZ2V0UGF0aCgpKSA9PT0gMDtcblx0fSk7XG5cdHJldHVybiBvVGFyZ2V0VGFibGVJbmZvO1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gYUNvbnRyb2xJZHNcbiAqIEBwYXJhbSBvSXRlbVxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgaXRlbSBtYXRjaGVzIG9uZSBvZiB0aGUgY29udHJvbHNcbiAqL1xuZnVuY3Rpb24gZm5GaWx0ZXJVcG9uSWRzKGFDb250cm9sSWRzOiBzdHJpbmdbXSwgb0l0ZW06IFVJNUVsZW1lbnQpOiBib29sZWFuIHtcblx0cmV0dXJuIGFDb250cm9sSWRzLnNvbWUoZnVuY3Rpb24gKHNDb250cm9sSWQpIHtcblx0XHRpZiAoc0NvbnRyb2xJZCA9PT0gb0l0ZW0uZ2V0SWQoKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBnaXZlcyB0aGUgZ3JvdXAgbmFtZSBoYXZpbmcgc2VjdGlvbiBhbmQgc3Vic2VjdGlvbiBkYXRhLlxuICpcbiAqIEBwYXJhbSBzZWN0aW9uXG4gKiBAcGFyYW0gc3ViU2VjdGlvblxuICogQHBhcmFtIGJNdWx0aXBsZVN1YlNlY3Rpb25zXG4gKiBAcGFyYW0gb1RhcmdldFRhYmxlSW5mb1xuICogQHBhcmFtIG9SZXNvdXJjZUJ1bmRsZVxuICogQHJldHVybnMgR3JvdXAgbmFtZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2VjdGlvbkdyb3VwTmFtZShcblx0c2VjdGlvbjogT2JqZWN0UGFnZVNlY3Rpb24sXG5cdHN1YlNlY3Rpb246IE9iamVjdFBhZ2VTdWJTZWN0aW9uLFxuXHRiTXVsdGlwbGVTdWJTZWN0aW9uczogYm9vbGVhbixcblx0b1RhcmdldFRhYmxlSW5mbzogVGFyZ2V0VGFibGVJbmZvVHlwZSxcblx0b1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZVxuKTogc3RyaW5nIHtcblx0cmV0dXJuIChcblx0XHRzZWN0aW9uLmdldFRpdGxlKCkgK1xuXHRcdChzdWJTZWN0aW9uLmdldFRpdGxlKCkgJiYgYk11bHRpcGxlU3ViU2VjdGlvbnMgPyBgLCAke3N1YlNlY3Rpb24uZ2V0VGl0bGUoKX1gIDogXCJcIikgK1xuXHRcdChvVGFyZ2V0VGFibGVJbmZvID8gYCwgJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9USVRMRV9UQUJMRV9ERU5PTUlOQVRPUlwiKX06ICR7b1RhcmdldFRhYmxlSW5mby50YWJsZUhlYWRlcn1gIDogXCJcIilcblx0KTtcbn1cblxuZnVuY3Rpb24gYklzT3JwaGFuRWxlbWVudChvRWxlbWVudDogVUk1RWxlbWVudCwgYUVsZW1lbnRzOiBVSTVFbGVtZW50W10pOiBib29sZWFuIHtcblx0cmV0dXJuICFhRWxlbWVudHMuc29tZShmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdGxldCBvUGFyZW50RWxlbWVudCA9IG9FbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdHdoaWxlIChvUGFyZW50RWxlbWVudCAmJiBvUGFyZW50RWxlbWVudCAhPT0gb0VsZW0pIHtcblx0XHRcdG9QYXJlbnRFbGVtZW50ID0gb1BhcmVudEVsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0fVxuXHRcdHJldHVybiBvUGFyZW50RWxlbWVudCA/IHRydWUgOiBmYWxzZTtcblx0fSk7XG59XG5cbi8qKlxuICogU3RhdGljIGZ1bmN0aW9ucyBmb3IgRmlvcmkgTWVzc2FnZSBIYW5kbGluZ1xuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5hY3Rpb25zLm1lc3NhZ2VIYW5kbGluZ1xuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgZXhwZXJpbWVudGFsIHVzZSEgPGJyLz48Yj5UaGlzIGlzIG9ubHkgYSBQT0MgYW5kIG1heWJlIGRlbGV0ZWQ8L2I+XG4gKiBAc2luY2UgMS41Ni4wXG4gKi9cbmNvbnN0IG1lc3NhZ2VIYW5kbGluZzogbWVzc2FnZUhhbmRsaW5nVHlwZSA9IHtcblx0Z2V0TWVzc2FnZXM6IGdldE1lc3NhZ2VzLFxuXHRzaG93VW5ib3VuZE1lc3NhZ2VzOiBzaG93VW5ib3VuZE1lc3NhZ2VzLFxuXHRyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzOiByZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzLFxuXHRyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlczogcmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMsXG5cdG1vZGlmeUVUYWdNZXNzYWdlc09ubHk6IGZuTW9kaWZ5RVRhZ01lc3NhZ2VzT25seSxcblx0Z2V0UmV0cnlBZnRlck1lc3NhZ2U6IGdldFJldHJ5QWZ0ZXJNZXNzYWdlLFxuXHRwcmVwYXJlTWVzc2FnZVZpZXdGb3JEaWFsb2c6IHByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyxcblx0c2V0TWVzc2FnZVN1YnRpdGxlOiBzZXRNZXNzYWdlU3VidGl0bGUsXG5cdGdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0OiBnZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dCxcblx0Z2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb246IGdldENvbnRyb2xGcm9tTWVzc2FnZVJlbGF0aW5nVG9TdWJTZWN0aW9uLFxuXHRmbkZpbHRlclVwb25JZHM6IGZuRmlsdGVyVXBvbklkcyxcblx0Z2V0VGFibGVBbmRUYXJnZXRJbmZvOiBnZXRUYWJsZUFuZFRhcmdldEluZm8sXG5cdGNyZWF0ZVNlY3Rpb25Hcm91cE5hbWU6IGNyZWF0ZVNlY3Rpb25Hcm91cE5hbWUsXG5cdGJJc09ycGhhbkVsZW1lbnQ6IGJJc09ycGhhbkVsZW1lbnQsXG5cdGdldExhc3RBY3Rpb25UZXh0QW5kQWN0aW9uTmFtZTogZ2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lLFxuXHRnZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlOiBnZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlLFxuXHRnZXRUYWJsZUNvbEluZm86IGdldFRhYmxlQ29sSW5mbyxcblx0Z2V0VGFibGVDb2xQcm9wZXJ0eTogZ2V0VGFibGVDb2xQcm9wZXJ0eSxcblx0Z2V0TWVzc2FnZVN1YnRpdGxlOiBnZXRNZXNzYWdlU3VidGl0bGUsXG5cdGRldGVybWluZUNvbHVtbkluZm86IGRldGVybWluZUNvbHVtbkluZm8sXG5cdGZldGNoQ29sdW1uSW5mbzogZmV0Y2hDb2x1bW5JbmZvLFxuXHRnZXRUYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRGb3JUZXh0QW5ub3RhdGlvbjogZ2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb24sXG5cdGdldE1lc3NhZ2VSYW5rOiBnZXRNZXNzYWdlUmFuayxcblx0Zm5DYWxsYmFja1NldEdyb3VwTmFtZTogZm5DYWxsYmFja1NldEdyb3VwTmFtZSxcblx0Z2V0VGFibGVGaXJzdENvbFZhbHVlOiBnZXRUYWJsZUZpcnN0Q29sVmFsdWUsXG5cdHNldEdyb3VwTmFtZU9QRGlzcGxheU1vZGU6IHNldEdyb3VwTmFtZU9QRGlzcGxheU1vZGUsXG5cdHVwZGF0ZU1lc3NhZ2VPYmplY3RHcm91cE5hbWU6IHVwZGF0ZU1lc3NhZ2VPYmplY3RHcm91cE5hbWUsXG5cdHNldEdyb3VwTmFtZUxSVGFibGU6IHNldEdyb3VwTmFtZUxSVGFibGUsXG5cdGlzQ29udHJvbEluVGFibGU6IGlzQ29udHJvbEluVGFibGUsXG5cdGlzQ29udHJvbFBhcnRPZkNyZWF0aW9uUm93OiBpc0NvbnRyb2xQYXJ0T2ZDcmVhdGlvblJvd1xufTtcblxuZXhwb3J0IGRlZmF1bHQgbWVzc2FnZUhhbmRsaW5nO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBZ0NBLE1BQU1BLFdBQVcsR0FBR0MsT0FBTyxDQUFDRCxXQUFXO0VBQ3ZDLElBQUlF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