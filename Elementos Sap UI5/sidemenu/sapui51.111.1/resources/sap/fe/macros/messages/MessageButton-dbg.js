/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/UriParameters", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/messages/MessagePopover", "sap/m/Button", "sap/m/ColumnListItem", "sap/m/Dialog", "sap/m/FormattedText", "sap/m/library", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/mvc/View", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"], function (Log, UriParameters, messageHandling, ClassSupport, MessagePopover, Button, ColumnListItem, Dialog, FormattedText, library, Core, coreLibrary, View, Filter, FilterOperator, Sorter) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var MessageType = coreLibrary.MessageType;
  var ButtonType = library.ButtonType;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MessageButton = (_dec = defineUI5Class("sap.fe.macros.messages.MessageButton"), _dec2 = aggregation({
    type: "sap.fe.macros.messages.MessageFilter",
    multiple: true,
    singularName: "customFilter"
  }), _dec3 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_Button) {
    _inheritsLoose(MessageButton, _Button);
    function MessageButton() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Button.call(this, ...args) || this;
      _initializerDefineProperty(_this, "customFilters", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageChange", _descriptor2, _assertThisInitialized(_this));
      _this.sGeneralGroupText = "";
      _this.sViewId = "";
      _this.sLastActionText = "";
      return _this;
    }
    var _proto = MessageButton.prototype;
    _proto.init = function init() {
      Button.prototype.init.apply(this);
      //press event handler attached to open the message popover
      this.attachPress(this.handleMessagePopoverPress, this);
      this.oMessagePopover = new MessagePopover();
      this.oItemBinding = this.oMessagePopover.getBinding("items");
      this.oItemBinding.attachChange(this._setMessageData, this);
      const messageButtonId = this.getId();
      if (messageButtonId) {
        this.oMessagePopover.addCustomData(new sap.ui.core.CustomData({
          key: "messageButtonId",
          value: messageButtonId
        })); // TODO check for custom data type
      }

      this.attachModelContextChange(this._applyFiltersAndSort.bind(this));
      this.oMessagePopover.attachActiveTitlePress(this._activeTitlePress.bind(this));
    }

    /**
     * The method that is called when a user clicks on the MessageButton control.
     *
     * @param oEvent Event object
     */;
    _proto.handleMessagePopoverPress = function handleMessagePopoverPress(oEvent) {
      this.oMessagePopover.toggle(oEvent.getSource());
    }

    /**
     * The method that groups the messages based on the section or subsection they belong to.
     * This method force the loading of contexts for all tables before to apply the grouping.
     *
     * @param oView Current view.
     * @returns Return promise.
     * @private
     */;
    _proto._applyGroupingAsync = async function _applyGroupingAsync(oView) {
      const aWaitForData = [];
      const oViewBindingContext = oView.getBindingContext();
      const _findTablesRelatedToMessages = view => {
        const oRes = [];
        const aMessages = this.oItemBinding.getContexts().map(function (oContext) {
          return oContext.getObject();
        });
        const oViewContext = view.getBindingContext();
        if (oViewContext) {
          const oObjectPage = view.getContent()[0];
          messageHandling.getVisibleSectionsFromObjectPageLayout(oObjectPage).forEach(function (oSection) {
            oSection.getSubSections().forEach(function (oSubSection) {
              oSubSection.findElements(true).forEach(function (oElem) {
                if (oElem.isA("sap.ui.mdc.Table")) {
                  for (let i = 0; i < aMessages.length; i++) {
                    const oRowBinding = oElem.getRowBinding();
                    if (oRowBinding) {
                      const sElemeBindingPath = `${oViewContext.getPath()}/${oElem.getRowBinding().getPath()}`;
                      if (aMessages[i].target.indexOf(sElemeBindingPath) === 0) {
                        oRes.push({
                          table: oElem,
                          subsection: oSubSection
                        });
                        break;
                      }
                    }
                  }
                }
              });
            });
          });
        }
        return oRes;
      };
      // Search for table related to Messages and initialize the binding context of the parent subsection to retrieve the data
      const oTables = _findTablesRelatedToMessages.bind(this)(oView);
      oTables.forEach(function (_oTable) {
        var _oMDCTable$getBinding;
        const oMDCTable = _oTable.table,
          oSubsection = _oTable.subsection;
        if (!oMDCTable.getBindingContext() || ((_oMDCTable$getBinding = oMDCTable.getBindingContext()) === null || _oMDCTable$getBinding === void 0 ? void 0 : _oMDCTable$getBinding.getPath()) !== (oViewBindingContext === null || oViewBindingContext === void 0 ? void 0 : oViewBindingContext.getPath())) {
          oSubsection.setBindingContext(oViewBindingContext);
          if (!oMDCTable.getRowBinding().isLengthFinal()) {
            aWaitForData.push(new Promise(function (resolve) {
              oMDCTable.getRowBinding().attachEventOnce("dataReceived", function () {
                resolve();
              });
            }));
          }
        }
      });
      const waitForGroupingApplied = new Promise(resolve => {
        setTimeout(async () => {
          this._applyGrouping();
          resolve();
        }, 0);
      });
      try {
        await Promise.all(aWaitForData);
        oView.getModel().checkMessages();
        await waitForGroupingApplied;
      } catch (err) {
        Log.error("Error while grouping the messages in the messagePopOver");
      }
    }

    /**
     * The method that groups the messages based on the section or subsection they belong to.
     *
     * @private
     */;
    _proto._applyGrouping = function _applyGrouping() {
      this.oObjectPageLayout = this._getObjectPageLayout(this, this.oObjectPageLayout);
      if (!this.oObjectPageLayout) {
        return;
      }
      const aMessages = this.oMessagePopover.getItems();
      const aSections = messageHandling.getVisibleSectionsFromObjectPageLayout(this.oObjectPageLayout);
      const bEnableBinding = this._checkControlIdInSections(aMessages, false);
      if (bEnableBinding) {
        this._fnEnableBindings(aSections);
      }
    }

    /**
     * The method retrieves the binding context for the refError object.
     * The refError contains a map to store the indexes of the rows with errors.
     *
     * @param oTable The table for which we want to get the refError Object.
     * @returns Context of the refError.
     * @private
     */;
    _proto._getTableRefErrorContext = function _getTableRefErrorContext(oTable) {
      const oModel = oTable.getModel("internal");
      //initialize the refError property if it doesn't exist
      if (!oTable.getBindingContext("internal").getProperty("refError")) {
        oModel.setProperty("refError", {}, oTable.getBindingContext("internal"));
      }
      const sRefErrorContextPath = oTable.getBindingContext("internal").getPath() + "/refError/" + oTable.getBindingContext().getPath().replace("/", "$") + "$" + oTable.getRowBinding().getPath().replace("/", "$");
      const oContext = oModel.getContext(sRefErrorContextPath);
      if (!oContext.getProperty("")) {
        oModel.setProperty("", {}, oContext);
      }
      return oContext;
    };
    _proto._updateInternalModel = function _updateInternalModel(oTableRowContext, iRowIndex, sTableTargetColProperty, oTable, oMessageObject, bIsCreationRow) {
      let oTemp;
      if (bIsCreationRow) {
        oTemp = {
          rowIndex: "CreationRow",
          targetColProperty: sTableTargetColProperty ? sTableTargetColProperty : ""
        };
      } else {
        oTemp = {
          rowIndex: oTableRowContext ? iRowIndex : "",
          targetColProperty: sTableTargetColProperty ? sTableTargetColProperty : ""
        };
      }
      const oModel = oTable.getModel("internal"),
        oContext = this._getTableRefErrorContext(oTable);
      //we first remove the entries with obsolete message ids from the internal model before inserting the new error info :
      const aValidMessageIds = sap.ui.getCore().getMessageManager().getMessageModel().getData().map(function (message) {
        return message.id;
      });
      let aObsoleteMessagelIds;
      if (oContext.getProperty()) {
        aObsoleteMessagelIds = Object.keys(oContext.getProperty()).filter(function (internalMessageId) {
          return aValidMessageIds.indexOf(internalMessageId) === -1;
        });
        aObsoleteMessagelIds.forEach(function (obsoleteId) {
          delete oContext.getProperty()[obsoleteId];
        });
      }
      oModel.setProperty(oMessageObject.getId(), Object.assign({}, oContext.getProperty(oMessageObject.getId()) ? oContext.getProperty(oMessageObject.getId()) : {}, oTemp), oContext);
    }

    /**
     * The method that sets groups for transient messages.
     *
     * @param {object} message The transient message for which we want to compute and set group.
     * @param {string} sActionName The action name.
     * @private
     */;
    _proto._setGroupLabelForTransientMsg = function _setGroupLabelForTransientMsg(message, sActionName) {
      this.sLastActionText = this.sLastActionText ? this.sLastActionText : Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_LAST_ACTION");
      message.setGroupName(`${this.sLastActionText}: ${sActionName}`);
    }

    /**
     * The method that groups messages and adds the subtitle.
     *
     * @param {object} message The message we use to compute the group and subtitle.
     * @param {object} section The section containing the controls.
     * @param {object} subSection The subsection containing the controls.
     * @param {object} aElements List of controls from a subsection related to a message.
     * @param {boolean} bMultipleSubSections True if there is more than 1 subsection in the section.
     * @param {string} sActionName The action name.
     * @returns {object} Return the control targeted by the message.
     * @private
     */;
    _proto._computeMessageGroupAndSubTitle = function _computeMessageGroupAndSubTitle(message, section, subSection, aElements, bMultipleSubSections, sActionName) {
      var _message$getBindingCo;
      this.oItemBinding.detachChange(this._setMessageData, this);
      const oMessageObject = (_message$getBindingCo = message.getBindingContext("message")) === null || _message$getBindingCo === void 0 ? void 0 : _message$getBindingCo.getObject();
      const setSectionNameInGroup = true;
      let oElement, oTable, oTargetTableInfo, l, iRowIndex, oTargetedControl, bIsCreationRow;
      const bIsBackendMessage = new RegExp("^/").test(oMessageObject === null || oMessageObject === void 0 ? void 0 : oMessageObject.getTargets()[0]),
        oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
      if (bIsBackendMessage) {
        for (l = 0; l < aElements.length; l++) {
          oElement = aElements[l];
          oTargetedControl = oElement;
          if (oElement.isA("sap.m.Table") || oElement.isA("sap.ui.table.Table")) {
            oTable = oElement.getParent();
            const oRowBinding = oTable.getRowBinding();
            const fnCallbackSetGroupName = (oMessageObj, actionName) => {
              this._setGroupLabelForTransientMsg(message, actionName);
            };
            if (oRowBinding && oRowBinding.isLengthFinal() && oTable.getBindingContext()) {
              const obj = messageHandling.getTableColumnDataAndSetSubtile(oMessageObject, oTable, oElement, oRowBinding, sActionName, setSectionNameInGroup, fnCallbackSetGroupName);
              oTargetTableInfo = obj.oTargetTableInfo;
              if (obj.subTitle) {
                message.setSubtitle(obj.subTitle);
              }
              message.setActiveTitle(!!oTargetTableInfo.oTableRowContext);
              if (oTargetTableInfo.oTableRowContext) {
                this._formatMessageDescription(message, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oResourceBundle, oTable);
              }
              iRowIndex = oTargetTableInfo.oTableRowContext && oTargetTableInfo.oTableRowContext.getIndex();
              this._updateInternalModel(oTargetTableInfo.oTableRowContext, iRowIndex, oTargetTableInfo.sTableTargetColProperty, oTable, oMessageObject);
            }
          } else {
            message.setActiveTitle(true);
            //check if the targeted control is a child of one of the other controls
            const bIsTargetedControlOrphan = messageHandling.bIsOrphanElement(oTargetedControl, aElements);
            if (bIsTargetedControlOrphan) {
              //set the subtitle
              message.setSubtitle("");
              break;
            }
          }
        }
      } else {
        //There is only one elt as this is a frontEnd message
        oTargetedControl = aElements[0];
        oTable = this._getMdcTable(oTargetedControl);
        if (oTable) {
          oTargetTableInfo = {};
          oTargetTableInfo.tableHeader = oTable.getHeader();
          const iTargetColumnIndex = this._getTableColumnIndex(oTargetedControl);
          oTargetTableInfo.sTableTargetColProperty = iTargetColumnIndex > -1 ? oTable.getColumns()[iTargetColumnIndex].getDataProperty() : undefined;
          oTargetTableInfo.sTableTargetColProperty = oTargetTableInfo.sTableTargetColProperty;
          oTargetTableInfo.sTableTargetColName = oTargetTableInfo.sTableTargetColProperty && iTargetColumnIndex > -1 ? oTable.getColumns()[iTargetColumnIndex].getHeader() : undefined;
          bIsCreationRow = this._getTableRow(oTargetedControl).isA("sap.ui.table.CreationRow");
          if (!bIsCreationRow) {
            iRowIndex = this._getTableRowIndex(oTargetedControl);
            oTargetTableInfo.oTableRowBindingContexts = oTable.getRowBinding().getCurrentContexts();
            oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts[iRowIndex];
          }
          const sMessageSubtitle = messageHandling.getMessageSubtitle(oMessageObject, oTargetTableInfo.oTableRowBindingContexts, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oResourceBundle, oTable, bIsCreationRow, iTargetColumnIndex === 0 && oTargetedControl.getValueState() === "Error" ? oTargetedControl : undefined);
          //set the subtitle
          if (sMessageSubtitle) {
            message.setSubtitle(sMessageSubtitle);
          }
          message.setActiveTitle(true);
          this._updateInternalModel(oTargetTableInfo.oTableRowContext, iRowIndex, oTargetTableInfo.sTableTargetColProperty, oTable, oMessageObject, bIsCreationRow);
        }
      }
      if (setSectionNameInGroup) {
        const sectionBasedGroupName = messageHandling.createSectionGroupName(section, subSection, bMultipleSubSections, oTargetTableInfo, oResourceBundle);
        message.setGroupName(sectionBasedGroupName);
        const sViewId = this._getViewId(this.getId());
        const oView = Core.byId(sViewId);
        const oMessageTargetProperty = oMessageObject.getTargets()[0] && oMessageObject.getTargets()[0].split("/").pop();
        const oUIModel = oView === null || oView === void 0 ? void 0 : oView.getModel("internal");
        if (oUIModel && oUIModel.getProperty("/messageTargetProperty") && oMessageTargetProperty && oMessageTargetProperty === oUIModel.getProperty("/messageTargetProperty")) {
          this.oMessagePopover.fireActiveTitlePress({
            item: message
          });
          oUIModel.setProperty("/messageTargetProperty", false);
        }
      }
      this.oItemBinding.attachChange(this._setMessageData, this);
      return oTargetedControl;
    };
    _proto._checkControlIdInSections = function _checkControlIdInSections(aMessages, bEnableBinding) {
      let section, aSubSections, message, i, j, k;
      this.sGeneralGroupText = this.sGeneralGroupText ? this.sGeneralGroupText : Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_GENERAL");
      //Get all sections from the object page layout
      const aVisibleSections = messageHandling.getVisibleSectionsFromObjectPageLayout(this.oObjectPageLayout);
      if (aVisibleSections) {
        var _oView$getBindingCont;
        const viewId = this._getViewId(this.getId());
        const oView = Core.byId(viewId);
        const sActionName = oView === null || oView === void 0 ? void 0 : (_oView$getBindingCont = oView.getBindingContext("internal")) === null || _oView$getBindingCont === void 0 ? void 0 : _oView$getBindingCont.getProperty("sActionName");
        if (sActionName) {
          (oView === null || oView === void 0 ? void 0 : oView.getBindingContext("internal")).setProperty("sActionName", null);
        }
        for (i = aMessages.length - 1; i >= 0; --i) {
          // Loop over all messages
          message = aMessages[i];
          let bIsGeneralGroupName = true;
          for (j = aVisibleSections.length - 1; j >= 0; --j) {
            // Loop over all visible sections
            section = aVisibleSections[j];
            aSubSections = section.getSubSections();
            for (k = aSubSections.length - 1; k >= 0; --k) {
              // Loop over all sub-sections
              const subSection = aSubSections[k];
              const oMessageObject = message.getBindingContext("message").getObject();
              const aControls = messageHandling.getControlFromMessageRelatingToSubSection(subSection, oMessageObject);
              if (aControls.length > 0) {
                const oTargetedControl = this._computeMessageGroupAndSubTitle(message, section, subSection, aControls, aSubSections.length > 1, sActionName);
                // if we found table that matches with the message, we don't stop the loop
                // in case we find an additional control (eg mdc field) that also match with the message
                if (oTargetedControl && !oTargetedControl.isA("sap.m.Table") && !oTargetedControl.isA("sap.ui.table.Table")) {
                  j = k = -1;
                }
                bIsGeneralGroupName = false;
              }
            }
          }
          if (bIsGeneralGroupName) {
            const oMessageObject = message.getBindingContext("message").getObject();
            message.setActiveTitle(false);
            if (oMessageObject.persistent && sActionName) {
              this._setGroupLabelForTransientMsg(message, sActionName);
            } else {
              message.setGroupName(this.sGeneralGroupText);
            }
          }
          if (!bEnableBinding && message.getGroupName() === this.sGeneralGroupText && this._findTargetForMessage(message)) {
            return true;
          }
        }
      }
    };
    _proto._findTargetForMessage = function _findTargetForMessage(message) {
      const messageObject = message.getBindingContext("message") && message.getBindingContext("message").getObject();
      if (messageObject && messageObject.target) {
        const oMetaModel = this.oObjectPageLayout && this.oObjectPageLayout.getModel() && this.oObjectPageLayout.getModel().getMetaModel(),
          contextPath = oMetaModel && oMetaModel.getMetaPath(messageObject.target),
          oContextPathMetadata = oMetaModel && oMetaModel.getObject(contextPath);
        if (oContextPathMetadata && oContextPathMetadata.$kind === "Property") {
          return true;
        }
      }
    };
    _proto._fnEnableBindings = function _fnEnableBindings(aSections) {
      if (UriParameters.fromQuery(window.location.search).get("sap-fe-xx-lazyloadingtest")) {
        return;
      }
      for (let iSection = 0; iSection < aSections.length; iSection++) {
        const oSection = aSections[iSection];
        let nonTableChartcontrolFound = false;
        const aSubSections = oSection.getSubSections();
        for (let iSubSection = 0; iSubSection < aSubSections.length; iSubSection++) {
          const oSubSection = aSubSections[iSubSection];
          const oAllBlocks = oSubSection.getBlocks();
          if (oAllBlocks) {
            for (let block = 0; block < oSubSection.getBlocks().length; block++) {
              var _oAllBlocks$block$get;
              if (oAllBlocks[block].getContent && !((_oAllBlocks$block$get = oAllBlocks[block].getContent()) !== null && _oAllBlocks$block$get !== void 0 && _oAllBlocks$block$get.isA("sap.fe.macros.table.TableAPI"))) {
                nonTableChartcontrolFound = true;
                break;
              }
            }
            if (nonTableChartcontrolFound) {
              oSubSection.setBindingContext(undefined);
            }
          }
          if (oSubSection.getBindingContext()) {
            this._findMessageGroupAfterRebinding();
            oSubSection.getBindingContext().getBinding().attachDataReceived(this._findMessageGroupAfterRebinding.bind(this));
          }
        }
      }
    };
    _proto._findMessageGroupAfterRebinding = function _findMessageGroupAfterRebinding() {
      const aMessages = this.oMessagePopover.getItems();
      this._checkControlIdInSections(aMessages, true);
    }

    /**
     * The method that retrieves the view ID (HTMLView/XMLView/JSONview/JSView/Templateview) of any control.
     *
     * @param sControlId ID of the control needed to retrieve the view ID
     * @returns The view ID of the control
     */;
    _proto._getViewId = function _getViewId(sControlId) {
      let sViewId,
        oControl = Core.byId(sControlId);
      while (oControl) {
        if (oControl instanceof View) {
          sViewId = oControl.getId();
          break;
        }
        oControl = oControl.getParent();
      }
      return sViewId;
    };
    _proto._setLongtextUrlDescription = function _setLongtextUrlDescription(sMessageDescriptionContent, oDiagnosisTitle) {
      this.oMessagePopover.setAsyncDescriptionHandler(function (config) {
        // This stores the old description
        const sOldDescription = sMessageDescriptionContent;
        // Here we can fetch the data and concatenate it to the old one
        // By default, the longtextUrl fetching will overwrite the description (with the default behaviour)
        // Here as we have overwritten the default async handler, which fetches and replaces the description of the item
        // we can manually modify it to include whatever needed.
        const sLongTextUrl = config.item.getLongtextUrl();
        if (sLongTextUrl) {
          jQuery.ajax({
            type: "GET",
            url: sLongTextUrl,
            success: function (data) {
              const sDiagnosisText = oDiagnosisTitle.getHtmlText() + data;
              config.item.setDescription(`${sOldDescription}${sDiagnosisText}`);
              config.promise.resolve();
            },
            error: function () {
              config.item.setDescription(sMessageDescriptionContent);
              const sError = `A request has failed for long text data. URL: ${sLongTextUrl}`;
              Log.error(sError);
              config.promise.reject(sError);
            }
          });
        }
      });
    };
    _proto._formatMessageDescription = function _formatMessageDescription(message, oTableRowContext, sTableTargetColName, oResourceBundle, oTable) {
      var _message$getBindingCo2;
      const sTableFirstColProperty = oTable.getParent().getIdentifierColumn();
      let sColumnInfo = "";
      const oMsgObj = (_message$getBindingCo2 = message.getBindingContext("message")) === null || _message$getBindingCo2 === void 0 ? void 0 : _message$getBindingCo2.getObject();
      const oColFromTableSettings = messageHandling.fetchColumnInfo(oMsgObj, oTable);
      if (sTableTargetColName) {
        // if column in present in table definition
        sColumnInfo = `${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")}: ${sTableTargetColName}`;
      } else if (oColFromTableSettings) {
        if (oColFromTableSettings.availability === "Hidden") {
          // if column in neither in table definition nor personalization
          if (message.getType() === "Error") {
            sColumnInfo = sTableFirstColProperty ? `${oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR")} ${oTableRowContext.getValue(sTableFirstColProperty)}` + "." : `${oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR")}` + ".";
          } else {
            sColumnInfo = sTableFirstColProperty ? `${oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC")} ${oTableRowContext.getValue(sTableFirstColProperty)}` + "." : `${oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC")}` + ".";
          }
        } else {
          // if column is not in table definition but in personalization
          //if no navigation to sub op then remove link to error field BCP : 2280168899
          if (!this._navigationConfigured(oTable)) {
            message.setActiveTitle(false);
          }
          sColumnInfo = `${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")}: ${oColFromTableSettings.label} (${oResourceBundle.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION")})`;
        }
      }
      const oFieldsAffectedTitle = new FormattedText({
        htmlText: `<html><body><strong>${oResourceBundle.getText("T_FIELDS_AFFECTED_TITLE")}</strong></body></html><br>`
      });
      let sFieldAffectedText;
      if (sTableFirstColProperty) {
        sFieldAffectedText = `${oFieldsAffectedTitle.getHtmlText()}<br>${oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTable.getHeader()}<br>${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${oTableRowContext.getValue(sTableFirstColProperty)}<br>${sColumnInfo}<br>`;
      } else if (sColumnInfo == "" || !sColumnInfo) {
        sFieldAffectedText = "";
      } else {
        sFieldAffectedText = `${oFieldsAffectedTitle.getHtmlText()}<br>${oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTable.getHeader()}<br>${sColumnInfo}<br>`;
      }
      const oDiagnosisTitle = new FormattedText({
        htmlText: `<html><body><strong>${oResourceBundle.getText("T_DIAGNOSIS_TITLE")}</strong></body></html><br>`
      });
      // get the UI messages from the message context to set it to Diagnosis section
      const sUIMessageDescription = message.getBindingContext("message").getObject().description;
      //set the description to null to reset it below
      message.setDescription(null);
      let sDiagnosisText = "";
      let sMessageDescriptionContent = "";
      if (message.getLongtextUrl()) {
        sMessageDescriptionContent = `${sFieldAffectedText}<br>`;
        this._setLongtextUrlDescription(sMessageDescriptionContent, oDiagnosisTitle);
      } else if (sUIMessageDescription) {
        sDiagnosisText = `${oDiagnosisTitle.getHtmlText()}<br>${sUIMessageDescription}`;
        sMessageDescriptionContent = `${sFieldAffectedText}<br>${sDiagnosisText}`;
        message.setDescription(sMessageDescriptionContent);
      } else {
        message.setDescription(sFieldAffectedText);
      }
    }

    /**
     * Method to set the button text, count and icon property based upon the message items
     * ButtonType:  Possible settings for warning and error messages are 'critical' and 'negative'.
     *
     *
     * @private
     */;
    _proto._setMessageData = function _setMessageData() {
      clearTimeout(this._setMessageDataTimeout);
      this._setMessageDataTimeout = setTimeout(async () => {
        const sIcon = "",
          oMessages = this.oMessagePopover.getItems(),
          oMessageCount = {
            Error: 0,
            Warning: 0,
            Success: 0,
            Information: 0
          },
          oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
          iMessageLength = oMessages.length;
        let sButtonType = ButtonType.Default,
          sMessageKey = "",
          sTooltipText = "",
          sMessageText = "";
        if (iMessageLength > 0) {
          for (let i = 0; i < iMessageLength; i++) {
            if (!oMessages[i].getType() || oMessages[i].getType() === "") {
              ++oMessageCount["Information"];
            } else {
              ++oMessageCount[oMessages[i].getType()];
            }
          }
          if (oMessageCount[MessageType.Error] > 0) {
            sButtonType = ButtonType.Negative;
          } else if (oMessageCount[MessageType.Warning] > 0) {
            sButtonType = ButtonType.Critical;
          } else if (oMessageCount[MessageType.Success] > 0) {
            sButtonType = ButtonType.Success;
          } else if (oMessageCount[MessageType.Information] > 0) {
            sButtonType = ButtonType.Neutral;
          }
          const totalNumberOfMessages = oMessageCount[MessageType.Error] + oMessageCount[MessageType.Warning] + oMessageCount[MessageType.Success] + oMessageCount[MessageType.Information];
          this.setText(totalNumberOfMessages.toString());
          if (oMessageCount.Error === 1) {
            sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERROR";
          } else if (oMessageCount.Error > 1) {
            sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_MULTIPLE_ERROR_TOOLTIP";
          } else if (!oMessageCount.Error && oMessageCount.Warning) {
            sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_WARNING_TOOLTIP";
          } else if (!oMessageCount.Error && !oMessageCount.Warning && oMessageCount.Information) {
            sMessageKey = "C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_INFO";
          } else if (!oMessageCount.Error && !oMessageCount.Warning && !oMessageCount.Information && oMessageCount.Success) {
            sMessageKey = "C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_SUCCESS";
          }
          if (sMessageKey) {
            sMessageText = oResourceBundle.getText(sMessageKey);
            sTooltipText = oMessageCount.Error ? `${oMessageCount.Error} ${sMessageText}` : sMessageText;
            this.setTooltip(sTooltipText);
          }
          this.setIcon(sIcon);
          this.setType(sButtonType);
          this.setVisible(true);
          const oView = Core.byId(this.sViewId);
          if (oView) {
            const oPageReady = oView.getController().pageReady;
            try {
              await oPageReady.waitPageReady();
              await this._applyGroupingAsync(oView);
            } catch (err) {
              Log.error("fail grouping messages");
            }
            this.fireMessageChange({
              iMessageLength: iMessageLength
            });
          }
          if (iMessageLength > 1) {
            this.oMessagePopover.navigateBack();
          }
        } else {
          this.setVisible(false);
          this.fireMessageChange({
            iMessageLength: iMessageLength
          });
        }
      }, 100);
    }

    /**
     * The method that is called when a user clicks on the title of the message.
     *
     * @function
     * @name _activeTitlePress
     * @private
     * @param oEvent Event object passed from the handler
     */;
    _proto._activeTitlePress = async function _activeTitlePress(oEvent) {
      const oInternalModelContext = this.getBindingContext("pageInternal");
      oInternalModelContext.setProperty("errorNavigationSectionFlag", true);
      const oItem = oEvent.getParameter("item"),
        oMessage = oItem.getBindingContext("message").getObject(),
        bIsBackendMessage = new RegExp("^/").test(oMessage.getTarget()),
        oView = Core.byId(this.sViewId);
      let oControl, sSectionTitle;
      const _defaultFocus = function (message, mdcTable) {
        const focusInfo = {
          preventScroll: true,
          targetInfo: message
        };
        mdcTable.focus(focusInfo);
      };

      //check if the pressed item is related to a table control
      if (oItem.getGroupName().indexOf("Table:") !== -1) {
        let oTargetMdcTable;
        if (bIsBackendMessage) {
          oTargetMdcTable = oMessage.controlIds.map(function (sControlId) {
            const control = Core.byId(sControlId);
            const oParentControl = control && control.getParent();
            return oParentControl && oParentControl.isA("sap.ui.mdc.Table") && oParentControl.getHeader() === oItem.getGroupName().split(", Table: ")[1] ? oParentControl : null;
          }).reduce(function (acc, val) {
            return val ? val : acc;
          });
          if (oTargetMdcTable) {
            sSectionTitle = oItem.getGroupName().split(", ")[0];
            try {
              await this._navigateFromMessageToSectionTableInIconTabBarMode(oTargetMdcTable, this.oObjectPageLayout, sSectionTitle);
              const oRefErrorContext = this._getTableRefErrorContext(oTargetMdcTable);
              const oRefError = oRefErrorContext.getProperty(oItem.getBindingContext("message").getObject().getId());
              const _setFocusOnTargetField = async (targetMdcTable, iRowIndex) => {
                const aTargetMdcTableRow = this._getMdcTableRows(targetMdcTable),
                  iFirstVisibleRow = this._getGridTable(targetMdcTable).getFirstVisibleRow();
                if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
                  const oTargetRow = aTargetMdcTableRow[iRowIndex - iFirstVisibleRow],
                    oTargetCell = this.getTargetCell(oTargetRow, oMessage);
                  if (oTargetCell) {
                    this.setFocusToControl(oTargetCell);
                    return undefined;
                  } else {
                    // control not found on table
                    const errorProperty = oMessage.getTarget().split("/").pop();
                    if (errorProperty) {
                      oView.getModel("internal").setProperty("/messageTargetProperty", errorProperty);
                    }
                    if (this._navigationConfigured(targetMdcTable)) {
                      return oView.getController()._routing.navigateForwardToContext(oTargetRow.getBindingContext());
                    } else {
                      return false;
                    }
                  }
                }
                return undefined;
              };
              if (oTargetMdcTable.data("tableType") === "GridTable" && oRefError.rowIndex !== "") {
                const iFirstVisibleRow = this._getGridTable(oTargetMdcTable).getFirstVisibleRow();
                try {
                  await oTargetMdcTable.scrollToIndex(oRefError.rowIndex);
                  const aTargetMdcTableRow = this._getMdcTableRows(oTargetMdcTable);
                  let iNewFirstVisibleRow, bScrollNeeded;
                  if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
                    iNewFirstVisibleRow = aTargetMdcTableRow[0].getParent().getFirstVisibleRow();
                    bScrollNeeded = iFirstVisibleRow - iNewFirstVisibleRow !== 0;
                  }
                  let oWaitControlIdAdded;
                  if (bScrollNeeded) {
                    //The scrollToIndex function does not wait for the UI update. As a workaround, pending a fix from MDC (BCP: 2170251631) we use the event "UIUpdated".
                    oWaitControlIdAdded = new Promise(function (resolve) {
                      Core.attachEvent("UIUpdated", resolve);
                    });
                  } else {
                    oWaitControlIdAdded = Promise.resolve();
                  }
                  await oWaitControlIdAdded;
                  setTimeout(async function () {
                    const focusOnTargetField = await _setFocusOnTargetField(oTargetMdcTable, oRefError.rowIndex);
                    if (focusOnTargetField === false) {
                      _defaultFocus(oMessage, oTargetMdcTable);
                    }
                  }, 0);
                } catch (err) {
                  Log.error("Error while focusing on error");
                }
              } else if (oTargetMdcTable.data("tableType") === "ResponsiveTable" && oRefError) {
                const focusOnMessageTargetControl = await this.focusOnMessageTargetControl(oView, oMessage, oTargetMdcTable, oRefError.rowIndex);
                if (focusOnMessageTargetControl === false) {
                  _defaultFocus(oMessage, oTargetMdcTable);
                }
              } else {
                this.focusOnMessageTargetControl(oView, oMessage);
              }
            } catch (err) {
              Log.error("Fail to navigate to Error control");
            }
          }
        } else {
          oControl = Core.byId(oMessage.controlIds[0]);
          //If the control underlying the frontEnd message is not within the current section, we first go into the target section:
          const oSelectedSection = Core.byId(this.oObjectPageLayout.getSelectedSection());
          if ((oSelectedSection === null || oSelectedSection === void 0 ? void 0 : oSelectedSection.findElements(true).indexOf(oControl)) === -1) {
            sSectionTitle = oItem.getGroupName().split(", ")[0];
            this._navigateFromMessageToSectionInIconTabBarMode(this.oObjectPageLayout, sSectionTitle);
          }
          this.setFocusToControl(oControl);
        }
      } else {
        // focus on control
        sSectionTitle = oItem.getGroupName().split(", ")[0];
        this._navigateFromMessageToSectionInIconTabBarMode(this.oObjectPageLayout, sSectionTitle);
        this.focusOnMessageTargetControl(oView, oMessage);
      }
    }

    /**
     * Retrieves a table cell targeted by a message.
     *
     * @param {object} targetRow A table row
     * @param {object} message Message targeting a cell
     * @returns {object} Returns the cell
     * @private
     */;
    _proto.getTargetCell = function getTargetCell(targetRow, message) {
      return message.getControlIds().length > 0 ? message.getControlIds().map(function (controlId) {
        const isControlInTable = targetRow.findElements(true, function (elem) {
          return elem.getId() === controlId;
        });
        return isControlInTable.length > 0 ? Core.byId(controlId) : null;
      }).reduce(function (acc, val) {
        return val ? val : acc;
      }) : null;
    }

    /**
     * Focus on the control targeted by a message.
     *
     * @param {object} view The current view
     * @param {object} message The message targeting the control on which we want to set the focus
     * @param {object} targetMdcTable The table targeted by the message (optional)
     * @param {number} rowIndex The row index of the table targeted by the message (optional)
     * @returns {Promise} Promise
     * @private
     */;
    _proto.focusOnMessageTargetControl = async function focusOnMessageTargetControl(view, message, targetMdcTable, rowIndex) {
      const aAllViewElements = view.findElements(true);
      const aErroneousControls = message.getControlIds().filter(function (sControlId) {
        return aAllViewElements.some(function (oElem) {
          return oElem.getId() === sControlId && oElem.getDomRef();
        });
      }).map(function (sControlId) {
        return Core.byId(sControlId);
      });
      const aNotTableErroneousControls = aErroneousControls.filter(function (oElem) {
        return !oElem.isA("sap.m.Table") && !oElem.isA("sap.ui.table.Table");
      });
      //The focus is set on Not Table control in priority
      if (aNotTableErroneousControls.length > 0) {
        this.setFocusToControl(aNotTableErroneousControls[0]);
        return undefined;
      } else if (aErroneousControls.length > 0) {
        const aTargetMdcTableRow = targetMdcTable ? targetMdcTable.findElements(true, function (oElem) {
          return oElem.isA(ColumnListItem.getMetadata().getName());
        }) : [];
        if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
          const oTargetRow = aTargetMdcTableRow[rowIndex];
          const oTargetCell = this.getTargetCell(oTargetRow, message);
          if (oTargetCell) {
            const oTargetField = oTargetCell.isA("sap.fe.macros.field.FieldAPI") ? oTargetCell.getContent().getContentEdit()[0] : oTargetCell.getItems()[0].getContent().getContentEdit()[0];
            this.setFocusToControl(oTargetField);
            return undefined;
          } else {
            const errorProperty = message.getTarget().split("/").pop();
            if (errorProperty) {
              view.getModel("internal").setProperty("/messageTargetProperty", errorProperty);
            }
            if (this._navigationConfigured(targetMdcTable)) {
              return view.getController()._routing.navigateForwardToContext(oTargetRow.getBindingContext());
            } else {
              return false;
            }
          }
        }
        return undefined;
      }
      return undefined;
    }

    /**
     *
     * @param obj The message object
     * @param aSections The array of sections in the object page
     * @returns The rank of the message
     */;
    _proto._getMessageRank = function _getMessageRank(obj, aSections) {
      if (aSections) {
        let section, aSubSections, subSection, j, k, aElements, aAllElements, sectionRank;
        for (j = aSections.length - 1; j >= 0; --j) {
          // Loop over all sections
          section = aSections[j];
          aSubSections = section.getSubSections();
          for (k = aSubSections.length - 1; k >= 0; --k) {
            // Loop over all sub-sections
            subSection = aSubSections[k];
            aAllElements = subSection.findElements(true); // Get all elements inside a sub-section
            //Try to find the control 1 inside the sub section
            aElements = aAllElements.filter(this._fnFilterUponId.bind(this, obj.getControlId()));
            sectionRank = j + 1;
            if (aElements.length > 0) {
              if (section.getVisible() && subSection.getVisible()) {
                if (!obj.hasOwnProperty("sectionName")) {
                  obj.sectionName = section.getTitle();
                }
                if (!obj.hasOwnProperty("subSectionName")) {
                  obj.subSectionName = subSection.getTitle();
                }
                return sectionRank * 10 + (k + 1);
              } else {
                // if section or subsection is invisible then group name would be Last Action
                // so ranking should be lower
                return 1;
              }
            }
          }
        }
        //if sub section title is Other messages, we return a high number(rank), which ensures
        //that messages belonging to this sub section always come later in messagePopover
        if (!obj.sectionName && !obj.subSectionName && obj.persistent) {
          return 1;
        }
        return 999;
      }
      return 999;
    }

    /**
     * Method to set the filters based upon the message items
     * The desired filter operation is:
     * ( filters provided by user && ( validation = true && Control should be present in view ) || messages for the current matching context ).
     *
     * @private
     */;
    _proto._applyFiltersAndSort = function _applyFiltersAndSort() {
      let oValidationFilters,
        oValidationAndContextFilter,
        oFilters,
        sPath,
        oSorter,
        oDialogFilter,
        objectPageLayoutSections = null;
      const aUserDefinedFilter = [];
      const filterOutMessagesInDialog = () => {
        const fnTest = aControlIds => {
          let index = Infinity,
            oControl = Core.byId(aControlIds[0]);
          const errorFieldControl = Core.byId(aControlIds[0]);
          while (oControl) {
            const fieldRankinDialog = oControl instanceof Dialog ? (errorFieldControl === null || errorFieldControl === void 0 ? void 0 : errorFieldControl.getParent()).findElements(true).indexOf(errorFieldControl) : Infinity;
            if (oControl instanceof Dialog) {
              if (index > fieldRankinDialog) {
                index = fieldRankinDialog;
                // Set the focus to the dialog's control
                this.setFocusToControl(errorFieldControl);
              }
              // messages for sap.m.Dialog should not appear in the message button
              return false;
            }
            oControl = oControl.getParent();
          }
          return true;
        };
        return new Filter({
          path: "controlIds",
          test: fnTest,
          caseSensitive: true
        });
      };
      //Filter function to verify if the control is part of the current view or not
      function getCheckControlInViewFilter() {
        const fnTest = function (aControlIds) {
          if (!aControlIds.length) {
            return false;
          }
          let oControl = Core.byId(aControlIds[0]);
          while (oControl) {
            if (oControl.getId() === sViewId) {
              return true;
            }
            if (oControl instanceof Dialog) {
              // messages for sap.m.Dialog should not appear in the message button
              return false;
            }
            oControl = oControl.getParent();
          }
          return false;
        };
        return new Filter({
          path: "controlIds",
          test: fnTest,
          caseSensitive: true
        });
      }
      if (!this.sViewId) {
        this.sViewId = this._getViewId(this.getId());
      }
      const sViewId = this.sViewId;
      //Add the filters provided by the user
      const aCustomFilters = this.getAggregation("customFilters");
      if (aCustomFilters) {
        aCustomFilters.forEach(function (filter) {
          aUserDefinedFilter.push(new Filter({
            path: filter.getProperty("path"),
            operator: filter.getProperty("operator"),
            value1: filter.getProperty("value1"),
            value2: filter.getProperty("value2")
          }));
        });
      }
      const oBindingContext = this.getBindingContext();
      if (!oBindingContext) {
        this.setVisible(false);
        return;
      } else {
        sPath = oBindingContext.getPath();
        //Filter for filtering out only validation messages which are currently present in the view
        oValidationFilters = new Filter({
          filters: [new Filter({
            path: "validation",
            operator: FilterOperator.EQ,
            value1: true
          }), getCheckControlInViewFilter()],
          and: true
        });
        //Filter for filtering out the bound messages i.e target starts with the context path
        oValidationAndContextFilter = new Filter({
          filters: [oValidationFilters, new Filter({
            path: "target",
            operator: FilterOperator.StartsWith,
            value1: sPath
          })],
          and: false
        });
        oDialogFilter = new Filter({
          filters: [filterOutMessagesInDialog()]
        });
      }
      const oValidationContextDialogFilters = new Filter({
        filters: [oValidationAndContextFilter, oDialogFilter],
        and: true
      });
      // and finally - if there any - add custom filter (via OR)
      if (aUserDefinedFilter.length > 0) {
        oFilters = new Filter({
          filters: [aUserDefinedFilter, oValidationContextDialogFilters],
          and: false
        });
      } else {
        oFilters = oValidationContextDialogFilters;
      }
      this.oItemBinding.filter(oFilters);
      this.oObjectPageLayout = this._getObjectPageLayout(this, this.oObjectPageLayout);
      // We support sorting only for ObjectPageLayout use-case.
      if (this.oObjectPageLayout) {
        oSorter = new Sorter("", null, null, (obj1, obj2) => {
          if (!objectPageLayoutSections) {
            objectPageLayoutSections = this.oObjectPageLayout && this.oObjectPageLayout.getSections();
          }
          const rankA = this._getMessageRank(obj1, objectPageLayoutSections);
          const rankB = this._getMessageRank(obj2, objectPageLayoutSections);
          if (rankA < rankB) {
            return -1;
          }
          if (rankA > rankB) {
            return 1;
          }
          return 0;
        });
        this.oItemBinding.sort(oSorter);
      }
    }

    /**
     *
     * @param sControlId
     * @param oItem
     * @returns True if the control ID matches the item ID
     */;
    _proto._fnFilterUponId = function _fnFilterUponId(sControlId, oItem) {
      return sControlId === oItem.getId();
    }

    /**
     * Retrieves the section based on section title and visibility.
     *
     * @param oObjectPage Object page.
     * @param sSectionTitle Section title.
     * @returns The section
     * @private
     */;
    _proto._getSectionBySectionTitle = function _getSectionBySectionTitle(oObjectPage, sSectionTitle) {
      let oSection;
      if (sSectionTitle) {
        const aSections = oObjectPage.getSections();
        for (let i = 0; i < aSections.length; i++) {
          if (aSections[i].getVisible() && aSections[i].getTitle() === sSectionTitle) {
            oSection = aSections[i];
            break;
          }
        }
      }
      return oSection;
    }

    /**
     * Navigates to the section if the object page uses an IconTabBar and if the current section is not the target of the navigation.
     *
     * @param oObjectPage Object page.
     * @param sSectionTitle Section title.
     * @private
     */;
    _proto._navigateFromMessageToSectionInIconTabBarMode = function _navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle) {
      const bUseIconTabBar = oObjectPage.getUseIconTabBar();
      if (bUseIconTabBar) {
        const oSection = this._getSectionBySectionTitle(oObjectPage, sSectionTitle);
        const sSelectedSectionId = oObjectPage.getSelectedSection();
        if (oSection && sSelectedSectionId !== oSection.getId()) {
          oObjectPage.setSelectedSection(oSection.getId());
        }
      }
    };
    _proto._navigateFromMessageToSectionTableInIconTabBarMode = async function _navigateFromMessageToSectionTableInIconTabBarMode(oTable, oObjectPage, sSectionTitle) {
      const oRowBinding = oTable.getRowBinding();
      const oTableContext = oTable.getBindingContext();
      const oOPContext = oObjectPage.getBindingContext();
      const bShouldWaitForTableRefresh = !(oTableContext === oOPContext);
      this._navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle);
      return new Promise(function (resolve) {
        if (bShouldWaitForTableRefresh) {
          oRowBinding.attachEventOnce("change", function () {
            resolve();
          });
        } else {
          resolve();
        }
      });
    }

    /**
     * Retrieves the MdcTable if it is found among any of the parent elements.
     *
     * @param oElement Control
     * @returns MDC table || undefined
     * @private
     */;
    _proto._getMdcTable = function _getMdcTable(oElement) {
      //check if the element has a table within any of its parents
      let oParentElement = oElement.getParent();
      while (oParentElement && !oParentElement.isA("sap.ui.mdc.Table")) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement && oParentElement.isA("sap.ui.mdc.Table") ? oParentElement : undefined;
    };
    _proto._getGridTable = function _getGridTable(oMdcTable) {
      return oMdcTable.findElements(true, function (oElem) {
        return oElem.isA("sap.ui.table.Table") && /** We check the element belongs to the MdcTable :*/
        oElem.getParent() === oMdcTable;
      })[0];
    }

    /**
     * Retrieves the table row (if available) containing the element.
     *
     * @param oElement Control
     * @returns Table row || undefined
     * @private
     */;
    _proto._getTableRow = function _getTableRow(oElement) {
      let oParentElement = oElement.getParent();
      while (oParentElement && !oParentElement.isA("sap.ui.table.Row") && !oParentElement.isA("sap.ui.table.CreationRow") && !oParentElement.isA(ColumnListItem.getMetadata().getName())) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement && (oParentElement.isA("sap.ui.table.Row") || oParentElement.isA("sap.ui.table.CreationRow") || oParentElement.isA(ColumnListItem.getMetadata().getName())) ? oParentElement : undefined;
    }

    /**
     * Retrieves the index of the table row containing the element.
     *
     * @param oElement Control
     * @returns Row index || undefined
     * @private
     */;
    _proto._getTableRowIndex = function _getTableRowIndex(oElement) {
      const oTableRow = this._getTableRow(oElement);
      let iRowIndex;
      if (oTableRow.isA("sap.ui.table.Row")) {
        iRowIndex = oTableRow.getIndex();
      } else {
        iRowIndex = oTableRow.getTable().getItems().findIndex(function (element) {
          return element.getId() === oTableRow.getId();
        });
      }
      return iRowIndex;
    }

    /**
     * Retrieves the index of the table column containing the element.
     *
     * @param oElement Control
     * @returns Column index || undefined
     * @private
     */;
    _proto._getTableColumnIndex = function _getTableColumnIndex(oElement) {
      const getTargetCellIndex = function (element, oTargetRow) {
        return oTargetRow.getCells().findIndex(function (oCell) {
          return oCell.getId() === element.getId();
        });
      };
      const getTargetColumnIndex = function (element, oTargetRow) {
        let oTargetElement = element.getParent(),
          iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
        while (oTargetElement && iTargetCellIndex < 0) {
          oTargetElement = oTargetElement.getParent();
          iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
        }
        return iTargetCellIndex;
      };
      const oTargetRow = this._getTableRow(oElement);
      let iTargetColumnIndex;
      iTargetColumnIndex = getTargetColumnIndex(oElement, oTargetRow);
      if (oTargetRow.isA("sap.ui.table.CreationRow")) {
        const sTargetCellId = oTargetRow.getCells()[iTargetColumnIndex].getId(),
          aTableColumns = oTargetRow.getTable().getColumns();
        iTargetColumnIndex = aTableColumns.findIndex(function (column) {
          if (column.getCreationTemplate()) {
            return sTargetCellId.search(column.getCreationTemplate().getId()) > -1 ? true : false;
          } else {
            return false;
          }
        });
      }
      return iTargetColumnIndex;
    };
    _proto._getMdcTableRows = function _getMdcTableRows(oMdcTable) {
      return oMdcTable.findElements(true, function (oElem) {
        return oElem.isA("sap.ui.table.Row") && /** We check the element belongs to the Mdc Table :*/
        oElem.getTable().getParent() === oMdcTable;
      });
    };
    _proto._getObjectPageLayout = function _getObjectPageLayout(oElement, oObjectPageLayout) {
      if (oObjectPageLayout) {
        return oObjectPageLayout;
      }
      oObjectPageLayout = oElement;
      //Iterate over parent till you have not reached the object page layout
      while (oObjectPageLayout && !oObjectPageLayout.isA("sap.uxap.ObjectPageLayout")) {
        oObjectPageLayout = oObjectPageLayout.getParent();
      }
      return oObjectPageLayout;
    }

    /**
     * The method that is called to check if a navigation is configured from the table to a sub object page.
     *
     * @private
     * @param table MdcTable
     * @returns Either true or false
     */;
    _proto._navigationConfigured = function _navigationConfigured(table) {
      // TODO: this logic would be moved to check the same at the template time to avoid the same check happening multiple times.
      const component = sap.ui.require("sap/ui/core/Component"),
        navObject = table && component.getOwnerComponentFor(table) && component.getOwnerComponentFor(table).getNavigation();
      let subOPConfigured = false,
        navConfigured = false;
      if (navObject && Object.keys(navObject).indexOf(table.getRowBinding().sPath) !== -1) {
        subOPConfigured = navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath] && navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath].detail && navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath].detail.route ? true : false;
      }
      navConfigured = subOPConfigured && (table === null || table === void 0 ? void 0 : table.getRowSettings().getRowActions()) && (table === null || table === void 0 ? void 0 : table.getRowSettings().getRowActions()[0].mProperties.type.indexOf("Navigation")) !== -1;
      return navConfigured;
    };
    _proto.setFocusToControl = function setFocusToControl(control) {
      const messagePopover = this.oMessagePopover;
      if (messagePopover && control && control.focus) {
        const fnFocus = () => {
          control.focus();
        };
        if (!messagePopover.isOpen()) {
          // when navigating to parent page to child page (on click of message), the child page might have a focus logic that might use a timeout.
          // we use the below timeouts to override this focus so that we focus on the target control of the message in the child page.
          setTimeout(fnFocus, 0);
        } else {
          const fnOnClose = () => {
            setTimeout(fnFocus, 0);
            messagePopover.detachEvent("afterClose", fnOnClose);
          };
          messagePopover.attachEvent("afterClose", fnOnClose);
          messagePopover.close();
        }
      } else {
        Log.warning("FE V4 : MessageButton : element doesn't have focus method for focusing.");
      }
    };
    return MessageButton;
  }(Button), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "customFilters", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "messageChange", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MessageButton;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlQnV0dG9uIiwiZGVmaW5lVUk1Q2xhc3MiLCJhZ2dyZWdhdGlvbiIsInR5cGUiLCJtdWx0aXBsZSIsInNpbmd1bGFyTmFtZSIsImV2ZW50Iiwic0dlbmVyYWxHcm91cFRleHQiLCJzVmlld0lkIiwic0xhc3RBY3Rpb25UZXh0IiwiaW5pdCIsIkJ1dHRvbiIsInByb3RvdHlwZSIsImFwcGx5IiwiYXR0YWNoUHJlc3MiLCJoYW5kbGVNZXNzYWdlUG9wb3ZlclByZXNzIiwib01lc3NhZ2VQb3BvdmVyIiwiTWVzc2FnZVBvcG92ZXIiLCJvSXRlbUJpbmRpbmciLCJnZXRCaW5kaW5nIiwiYXR0YWNoQ2hhbmdlIiwiX3NldE1lc3NhZ2VEYXRhIiwibWVzc2FnZUJ1dHRvbklkIiwiZ2V0SWQiLCJhZGRDdXN0b21EYXRhIiwic2FwIiwidWkiLCJjb3JlIiwiQ3VzdG9tRGF0YSIsImtleSIsInZhbHVlIiwiYXR0YWNoTW9kZWxDb250ZXh0Q2hhbmdlIiwiX2FwcGx5RmlsdGVyc0FuZFNvcnQiLCJiaW5kIiwiYXR0YWNoQWN0aXZlVGl0bGVQcmVzcyIsIl9hY3RpdmVUaXRsZVByZXNzIiwib0V2ZW50IiwidG9nZ2xlIiwiZ2V0U291cmNlIiwiX2FwcGx5R3JvdXBpbmdBc3luYyIsIm9WaWV3IiwiYVdhaXRGb3JEYXRhIiwib1ZpZXdCaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0IiwiX2ZpbmRUYWJsZXNSZWxhdGVkVG9NZXNzYWdlcyIsInZpZXciLCJvUmVzIiwiYU1lc3NhZ2VzIiwiZ2V0Q29udGV4dHMiLCJtYXAiLCJvQ29udGV4dCIsImdldE9iamVjdCIsIm9WaWV3Q29udGV4dCIsIm9PYmplY3RQYWdlIiwiZ2V0Q29udGVudCIsIm1lc3NhZ2VIYW5kbGluZyIsImdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0IiwiZm9yRWFjaCIsIm9TZWN0aW9uIiwiZ2V0U3ViU2VjdGlvbnMiLCJvU3ViU2VjdGlvbiIsImZpbmRFbGVtZW50cyIsIm9FbGVtIiwiaXNBIiwiaSIsImxlbmd0aCIsIm9Sb3dCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsInNFbGVtZUJpbmRpbmdQYXRoIiwiZ2V0UGF0aCIsInRhcmdldCIsImluZGV4T2YiLCJwdXNoIiwidGFibGUiLCJzdWJzZWN0aW9uIiwib1RhYmxlcyIsIl9vVGFibGUiLCJvTURDVGFibGUiLCJvU3Vic2VjdGlvbiIsInNldEJpbmRpbmdDb250ZXh0IiwiaXNMZW5ndGhGaW5hbCIsIlByb21pc2UiLCJyZXNvbHZlIiwiYXR0YWNoRXZlbnRPbmNlIiwid2FpdEZvckdyb3VwaW5nQXBwbGllZCIsInNldFRpbWVvdXQiLCJfYXBwbHlHcm91cGluZyIsImFsbCIsImdldE1vZGVsIiwiY2hlY2tNZXNzYWdlcyIsImVyciIsIkxvZyIsImVycm9yIiwib09iamVjdFBhZ2VMYXlvdXQiLCJfZ2V0T2JqZWN0UGFnZUxheW91dCIsImdldEl0ZW1zIiwiYVNlY3Rpb25zIiwiYkVuYWJsZUJpbmRpbmciLCJfY2hlY2tDb250cm9sSWRJblNlY3Rpb25zIiwiX2ZuRW5hYmxlQmluZGluZ3MiLCJfZ2V0VGFibGVSZWZFcnJvckNvbnRleHQiLCJvVGFibGUiLCJvTW9kZWwiLCJnZXRQcm9wZXJ0eSIsInNldFByb3BlcnR5Iiwic1JlZkVycm9yQ29udGV4dFBhdGgiLCJyZXBsYWNlIiwiZ2V0Q29udGV4dCIsIl91cGRhdGVJbnRlcm5hbE1vZGVsIiwib1RhYmxlUm93Q29udGV4dCIsImlSb3dJbmRleCIsInNUYWJsZVRhcmdldENvbFByb3BlcnR5Iiwib01lc3NhZ2VPYmplY3QiLCJiSXNDcmVhdGlvblJvdyIsIm9UZW1wIiwicm93SW5kZXgiLCJ0YXJnZXRDb2xQcm9wZXJ0eSIsImFWYWxpZE1lc3NhZ2VJZHMiLCJnZXRDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJnZXRNZXNzYWdlTW9kZWwiLCJnZXREYXRhIiwibWVzc2FnZSIsImlkIiwiYU9ic29sZXRlTWVzc2FnZWxJZHMiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwiaW50ZXJuYWxNZXNzYWdlSWQiLCJvYnNvbGV0ZUlkIiwiYXNzaWduIiwiX3NldEdyb3VwTGFiZWxGb3JUcmFuc2llbnRNc2ciLCJzQWN0aW9uTmFtZSIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJnZXRUZXh0Iiwic2V0R3JvdXBOYW1lIiwiX2NvbXB1dGVNZXNzYWdlR3JvdXBBbmRTdWJUaXRsZSIsInNlY3Rpb24iLCJzdWJTZWN0aW9uIiwiYUVsZW1lbnRzIiwiYk11bHRpcGxlU3ViU2VjdGlvbnMiLCJkZXRhY2hDaGFuZ2UiLCJzZXRTZWN0aW9uTmFtZUluR3JvdXAiLCJvRWxlbWVudCIsIm9UYXJnZXRUYWJsZUluZm8iLCJsIiwib1RhcmdldGVkQ29udHJvbCIsImJJc0JhY2tlbmRNZXNzYWdlIiwiUmVnRXhwIiwidGVzdCIsImdldFRhcmdldHMiLCJvUmVzb3VyY2VCdW5kbGUiLCJnZXRQYXJlbnQiLCJmbkNhbGxiYWNrU2V0R3JvdXBOYW1lIiwib01lc3NhZ2VPYmoiLCJhY3Rpb25OYW1lIiwib2JqIiwiZ2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZSIsInN1YlRpdGxlIiwic2V0U3VidGl0bGUiLCJzZXRBY3RpdmVUaXRsZSIsIl9mb3JtYXRNZXNzYWdlRGVzY3JpcHRpb24iLCJzVGFibGVUYXJnZXRDb2xOYW1lIiwiZ2V0SW5kZXgiLCJiSXNUYXJnZXRlZENvbnRyb2xPcnBoYW4iLCJiSXNPcnBoYW5FbGVtZW50IiwiX2dldE1kY1RhYmxlIiwidGFibGVIZWFkZXIiLCJnZXRIZWFkZXIiLCJpVGFyZ2V0Q29sdW1uSW5kZXgiLCJfZ2V0VGFibGVDb2x1bW5JbmRleCIsImdldENvbHVtbnMiLCJnZXREYXRhUHJvcGVydHkiLCJ1bmRlZmluZWQiLCJfZ2V0VGFibGVSb3ciLCJfZ2V0VGFibGVSb3dJbmRleCIsIm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyIsImdldEN1cnJlbnRDb250ZXh0cyIsInNNZXNzYWdlU3VidGl0bGUiLCJnZXRNZXNzYWdlU3VidGl0bGUiLCJnZXRWYWx1ZVN0YXRlIiwic2VjdGlvbkJhc2VkR3JvdXBOYW1lIiwiY3JlYXRlU2VjdGlvbkdyb3VwTmFtZSIsIl9nZXRWaWV3SWQiLCJieUlkIiwib01lc3NhZ2VUYXJnZXRQcm9wZXJ0eSIsInNwbGl0IiwicG9wIiwib1VJTW9kZWwiLCJmaXJlQWN0aXZlVGl0bGVQcmVzcyIsIml0ZW0iLCJhU3ViU2VjdGlvbnMiLCJqIiwiayIsImFWaXNpYmxlU2VjdGlvbnMiLCJ2aWV3SWQiLCJiSXNHZW5lcmFsR3JvdXBOYW1lIiwiYUNvbnRyb2xzIiwiZ2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb24iLCJwZXJzaXN0ZW50IiwiZ2V0R3JvdXBOYW1lIiwiX2ZpbmRUYXJnZXRGb3JNZXNzYWdlIiwibWVzc2FnZU9iamVjdCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJjb250ZXh0UGF0aCIsImdldE1ldGFQYXRoIiwib0NvbnRleHRQYXRoTWV0YWRhdGEiLCIka2luZCIsIlVyaVBhcmFtZXRlcnMiLCJmcm9tUXVlcnkiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInNlYXJjaCIsImdldCIsImlTZWN0aW9uIiwibm9uVGFibGVDaGFydGNvbnRyb2xGb3VuZCIsImlTdWJTZWN0aW9uIiwib0FsbEJsb2NrcyIsImdldEJsb2NrcyIsImJsb2NrIiwiX2ZpbmRNZXNzYWdlR3JvdXBBZnRlclJlYmluZGluZyIsImF0dGFjaERhdGFSZWNlaXZlZCIsInNDb250cm9sSWQiLCJvQ29udHJvbCIsIlZpZXciLCJfc2V0TG9uZ3RleHRVcmxEZXNjcmlwdGlvbiIsInNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50Iiwib0RpYWdub3Npc1RpdGxlIiwic2V0QXN5bmNEZXNjcmlwdGlvbkhhbmRsZXIiLCJjb25maWciLCJzT2xkRGVzY3JpcHRpb24iLCJzTG9uZ1RleHRVcmwiLCJnZXRMb25ndGV4dFVybCIsImpRdWVyeSIsImFqYXgiLCJ1cmwiLCJzdWNjZXNzIiwiZGF0YSIsInNEaWFnbm9zaXNUZXh0IiwiZ2V0SHRtbFRleHQiLCJzZXREZXNjcmlwdGlvbiIsInByb21pc2UiLCJzRXJyb3IiLCJyZWplY3QiLCJzVGFibGVGaXJzdENvbFByb3BlcnR5IiwiZ2V0SWRlbnRpZmllckNvbHVtbiIsInNDb2x1bW5JbmZvIiwib01zZ09iaiIsIm9Db2xGcm9tVGFibGVTZXR0aW5ncyIsImZldGNoQ29sdW1uSW5mbyIsImF2YWlsYWJpbGl0eSIsImdldFR5cGUiLCJnZXRWYWx1ZSIsIl9uYXZpZ2F0aW9uQ29uZmlndXJlZCIsImxhYmVsIiwib0ZpZWxkc0FmZmVjdGVkVGl0bGUiLCJGb3JtYXR0ZWRUZXh0IiwiaHRtbFRleHQiLCJzRmllbGRBZmZlY3RlZFRleHQiLCJzVUlNZXNzYWdlRGVzY3JpcHRpb24iLCJkZXNjcmlwdGlvbiIsImNsZWFyVGltZW91dCIsIl9zZXRNZXNzYWdlRGF0YVRpbWVvdXQiLCJzSWNvbiIsIm9NZXNzYWdlcyIsIm9NZXNzYWdlQ291bnQiLCJFcnJvciIsIldhcm5pbmciLCJTdWNjZXNzIiwiSW5mb3JtYXRpb24iLCJpTWVzc2FnZUxlbmd0aCIsInNCdXR0b25UeXBlIiwiQnV0dG9uVHlwZSIsIkRlZmF1bHQiLCJzTWVzc2FnZUtleSIsInNUb29sdGlwVGV4dCIsInNNZXNzYWdlVGV4dCIsIk1lc3NhZ2VUeXBlIiwiTmVnYXRpdmUiLCJDcml0aWNhbCIsIk5ldXRyYWwiLCJ0b3RhbE51bWJlck9mTWVzc2FnZXMiLCJzZXRUZXh0IiwidG9TdHJpbmciLCJzZXRUb29sdGlwIiwic2V0SWNvbiIsInNldFR5cGUiLCJzZXRWaXNpYmxlIiwib1BhZ2VSZWFkeSIsImdldENvbnRyb2xsZXIiLCJwYWdlUmVhZHkiLCJ3YWl0UGFnZVJlYWR5IiwiZmlyZU1lc3NhZ2VDaGFuZ2UiLCJuYXZpZ2F0ZUJhY2siLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJvSXRlbSIsImdldFBhcmFtZXRlciIsIm9NZXNzYWdlIiwiZ2V0VGFyZ2V0Iiwic1NlY3Rpb25UaXRsZSIsIl9kZWZhdWx0Rm9jdXMiLCJtZGNUYWJsZSIsImZvY3VzSW5mbyIsInByZXZlbnRTY3JvbGwiLCJ0YXJnZXRJbmZvIiwiZm9jdXMiLCJvVGFyZ2V0TWRjVGFibGUiLCJjb250cm9sSWRzIiwiY29udHJvbCIsIm9QYXJlbnRDb250cm9sIiwicmVkdWNlIiwiYWNjIiwidmFsIiwiX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25UYWJsZUluSWNvblRhYkJhck1vZGUiLCJvUmVmRXJyb3JDb250ZXh0Iiwib1JlZkVycm9yIiwiX3NldEZvY3VzT25UYXJnZXRGaWVsZCIsInRhcmdldE1kY1RhYmxlIiwiYVRhcmdldE1kY1RhYmxlUm93IiwiX2dldE1kY1RhYmxlUm93cyIsImlGaXJzdFZpc2libGVSb3ciLCJfZ2V0R3JpZFRhYmxlIiwiZ2V0Rmlyc3RWaXNpYmxlUm93Iiwib1RhcmdldFJvdyIsIm9UYXJnZXRDZWxsIiwiZ2V0VGFyZ2V0Q2VsbCIsInNldEZvY3VzVG9Db250cm9sIiwiZXJyb3JQcm9wZXJ0eSIsIl9yb3V0aW5nIiwibmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0Iiwic2Nyb2xsVG9JbmRleCIsImlOZXdGaXJzdFZpc2libGVSb3ciLCJiU2Nyb2xsTmVlZGVkIiwib1dhaXRDb250cm9sSWRBZGRlZCIsImF0dGFjaEV2ZW50IiwiZm9jdXNPblRhcmdldEZpZWxkIiwiZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sIiwib1NlbGVjdGVkU2VjdGlvbiIsImdldFNlbGVjdGVkU2VjdGlvbiIsIl9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZSIsInRhcmdldFJvdyIsImdldENvbnRyb2xJZHMiLCJjb250cm9sSWQiLCJpc0NvbnRyb2xJblRhYmxlIiwiZWxlbSIsImFBbGxWaWV3RWxlbWVudHMiLCJhRXJyb25lb3VzQ29udHJvbHMiLCJzb21lIiwiZ2V0RG9tUmVmIiwiYU5vdFRhYmxlRXJyb25lb3VzQ29udHJvbHMiLCJDb2x1bW5MaXN0SXRlbSIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsIm9UYXJnZXRGaWVsZCIsImdldENvbnRlbnRFZGl0IiwiX2dldE1lc3NhZ2VSYW5rIiwiYUFsbEVsZW1lbnRzIiwic2VjdGlvblJhbmsiLCJfZm5GaWx0ZXJVcG9uSWQiLCJnZXRDb250cm9sSWQiLCJnZXRWaXNpYmxlIiwiaGFzT3duUHJvcGVydHkiLCJzZWN0aW9uTmFtZSIsImdldFRpdGxlIiwic3ViU2VjdGlvbk5hbWUiLCJvVmFsaWRhdGlvbkZpbHRlcnMiLCJvVmFsaWRhdGlvbkFuZENvbnRleHRGaWx0ZXIiLCJvRmlsdGVycyIsInNQYXRoIiwib1NvcnRlciIsIm9EaWFsb2dGaWx0ZXIiLCJvYmplY3RQYWdlTGF5b3V0U2VjdGlvbnMiLCJhVXNlckRlZmluZWRGaWx0ZXIiLCJmaWx0ZXJPdXRNZXNzYWdlc0luRGlhbG9nIiwiZm5UZXN0IiwiYUNvbnRyb2xJZHMiLCJpbmRleCIsIkluZmluaXR5IiwiZXJyb3JGaWVsZENvbnRyb2wiLCJmaWVsZFJhbmtpbkRpYWxvZyIsIkRpYWxvZyIsIkZpbHRlciIsInBhdGgiLCJjYXNlU2Vuc2l0aXZlIiwiZ2V0Q2hlY2tDb250cm9sSW5WaWV3RmlsdGVyIiwiYUN1c3RvbUZpbHRlcnMiLCJnZXRBZ2dyZWdhdGlvbiIsIm9wZXJhdG9yIiwidmFsdWUxIiwidmFsdWUyIiwib0JpbmRpbmdDb250ZXh0IiwiZmlsdGVycyIsIkZpbHRlck9wZXJhdG9yIiwiRVEiLCJhbmQiLCJTdGFydHNXaXRoIiwib1ZhbGlkYXRpb25Db250ZXh0RGlhbG9nRmlsdGVycyIsIlNvcnRlciIsIm9iajEiLCJvYmoyIiwiZ2V0U2VjdGlvbnMiLCJyYW5rQSIsInJhbmtCIiwic29ydCIsIl9nZXRTZWN0aW9uQnlTZWN0aW9uVGl0bGUiLCJiVXNlSWNvblRhYkJhciIsImdldFVzZUljb25UYWJCYXIiLCJzU2VsZWN0ZWRTZWN0aW9uSWQiLCJzZXRTZWxlY3RlZFNlY3Rpb24iLCJvVGFibGVDb250ZXh0Iiwib09QQ29udGV4dCIsImJTaG91bGRXYWl0Rm9yVGFibGVSZWZyZXNoIiwib1BhcmVudEVsZW1lbnQiLCJvTWRjVGFibGUiLCJvVGFibGVSb3ciLCJnZXRUYWJsZSIsImZpbmRJbmRleCIsImVsZW1lbnQiLCJnZXRUYXJnZXRDZWxsSW5kZXgiLCJnZXRDZWxscyIsIm9DZWxsIiwiZ2V0VGFyZ2V0Q29sdW1uSW5kZXgiLCJvVGFyZ2V0RWxlbWVudCIsImlUYXJnZXRDZWxsSW5kZXgiLCJzVGFyZ2V0Q2VsbElkIiwiYVRhYmxlQ29sdW1ucyIsImNvbHVtbiIsImdldENyZWF0aW9uVGVtcGxhdGUiLCJjb21wb25lbnQiLCJyZXF1aXJlIiwibmF2T2JqZWN0IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJnZXROYXZpZ2F0aW9uIiwic3ViT1BDb25maWd1cmVkIiwibmF2Q29uZmlndXJlZCIsImRldGFpbCIsInJvdXRlIiwiZ2V0Um93U2V0dGluZ3MiLCJnZXRSb3dBY3Rpb25zIiwibVByb3BlcnRpZXMiLCJtZXNzYWdlUG9wb3ZlciIsImZuRm9jdXMiLCJpc09wZW4iLCJmbk9uQ2xvc2UiLCJkZXRhY2hFdmVudCIsImNsb3NlIiwid2FybmluZyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWVzc2FnZUJ1dHRvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IFVyaVBhcmFtZXRlcnMgZnJvbSBcInNhcC9iYXNlL3V0aWwvVXJpUGFyYW1ldGVyc1wiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VGaWx0ZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvbWVzc2FnZXMvTWVzc2FnZUZpbHRlclwiO1xuaW1wb3J0IE1lc3NhZ2VQb3BvdmVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL21lc3NhZ2VzL01lc3NhZ2VQb3BvdmVyXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBDb2x1bW5MaXN0SXRlbSBmcm9tIFwic2FwL20vQ29sdW1uTGlzdEl0ZW1cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IEZvcm1hdHRlZFRleHQgZnJvbSBcInNhcC9tL0Zvcm1hdHRlZFRleHRcIjtcbmltcG9ydCB7IEJ1dHRvblR5cGUgfSBmcm9tIFwic2FwL20vbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2VJdGVtIGZyb20gXCJzYXAvbS9NZXNzYWdlSXRlbVwiO1xuaW1wb3J0IHR5cGUgQ29yZUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBVSTVFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IFNvcnRlciBmcm9tIFwic2FwL3VpL21vZGVsL1NvcnRlclwiO1xuaW1wb3J0IENvbHVtbiBmcm9tIFwic2FwL3VpL3RhYmxlL0NvbHVtblwiO1xuaW1wb3J0IE9iamVjdFBhZ2VTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU2VjdGlvblwiO1xuaW1wb3J0IE9iamVjdFBhZ2VTdWJTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU3ViU2VjdGlvblwiO1xuXG50eXBlIE1lc3NhZ2VDb3VudCA9IHtcblx0RXJyb3I6IG51bWJlcjtcblx0V2FybmluZzogbnVtYmVyO1xuXHRTdWNjZXNzOiBudW1iZXI7XG5cdEluZm9ybWF0aW9uOiBudW1iZXI7XG59O1xuXG50eXBlIENvbHVtbkRhdGFXaXRoQXZhaWxhYmlsaXR5VHlwZSA9IENvbHVtbiAmIHtcblx0YXZhaWxhYmlsaXR5Pzogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZztcbn07XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MubWVzc2FnZXMuTWVzc2FnZUJ1dHRvblwiKVxuY2xhc3MgTWVzc2FnZUJ1dHRvbiBleHRlbmRzIEJ1dHRvbiB7XG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5tZXNzYWdlcy5NZXNzYWdlRmlsdGVyXCIsIG11bHRpcGxlOiB0cnVlLCBzaW5ndWxhck5hbWU6IFwiY3VzdG9tRmlsdGVyXCIgfSlcblx0Y3VzdG9tRmlsdGVycyE6IE1lc3NhZ2VGaWx0ZXI7XG5cblx0QGV2ZW50KClcblx0bWVzc2FnZUNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdHByaXZhdGUgb01lc3NhZ2VQb3BvdmVyOiBhbnk7XG5cdHByaXZhdGUgb0l0ZW1CaW5kaW5nOiBhbnk7XG5cdHByaXZhdGUgb09iamVjdFBhZ2VMYXlvdXQ6IGFueTtcblx0cHJpdmF0ZSBzR2VuZXJhbEdyb3VwVGV4dCA9IFwiXCI7XG5cdHByaXZhdGUgX3NldE1lc3NhZ2VEYXRhVGltZW91dDogYW55O1xuXHRwcml2YXRlIHNWaWV3SWQgPSBcIlwiO1xuXHRwcml2YXRlIHNMYXN0QWN0aW9uVGV4dCA9IFwiXCI7XG5cblx0aW5pdCgpIHtcblx0XHRCdXR0b24ucHJvdG90eXBlLmluaXQuYXBwbHkodGhpcyk7XG5cdFx0Ly9wcmVzcyBldmVudCBoYW5kbGVyIGF0dGFjaGVkIHRvIG9wZW4gdGhlIG1lc3NhZ2UgcG9wb3ZlclxuXHRcdHRoaXMuYXR0YWNoUHJlc3ModGhpcy5oYW5kbGVNZXNzYWdlUG9wb3ZlclByZXNzLCB0aGlzKTtcblx0XHR0aGlzLm9NZXNzYWdlUG9wb3ZlciA9IG5ldyBNZXNzYWdlUG9wb3ZlcigpO1xuXHRcdHRoaXMub0l0ZW1CaW5kaW5nID0gdGhpcy5vTWVzc2FnZVBvcG92ZXIuZ2V0QmluZGluZyhcIml0ZW1zXCIpO1xuXHRcdHRoaXMub0l0ZW1CaW5kaW5nLmF0dGFjaENoYW5nZSh0aGlzLl9zZXRNZXNzYWdlRGF0YSwgdGhpcyk7XG5cdFx0Y29uc3QgbWVzc2FnZUJ1dHRvbklkID0gdGhpcy5nZXRJZCgpO1xuXHRcdGlmIChtZXNzYWdlQnV0dG9uSWQpIHtcblx0XHRcdHRoaXMub01lc3NhZ2VQb3BvdmVyLmFkZEN1c3RvbURhdGEobmV3IChzYXAgYXMgYW55KS51aS5jb3JlLkN1c3RvbURhdGEoeyBrZXk6IFwibWVzc2FnZUJ1dHRvbklkXCIsIHZhbHVlOiBtZXNzYWdlQnV0dG9uSWQgfSkpOyAvLyBUT0RPIGNoZWNrIGZvciBjdXN0b20gZGF0YSB0eXBlXG5cdFx0fVxuXHRcdHRoaXMuYXR0YWNoTW9kZWxDb250ZXh0Q2hhbmdlKHRoaXMuX2FwcGx5RmlsdGVyc0FuZFNvcnQuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIuYXR0YWNoQWN0aXZlVGl0bGVQcmVzcyh0aGlzLl9hY3RpdmVUaXRsZVByZXNzLmJpbmQodGhpcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBpcyBjYWxsZWQgd2hlbiBhIHVzZXIgY2xpY2tzIG9uIHRoZSBNZXNzYWdlQnV0dG9uIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnQgRXZlbnQgb2JqZWN0XG5cdCAqL1xuXHRoYW5kbGVNZXNzYWdlUG9wb3ZlclByZXNzKG9FdmVudDogQ29yZUV2ZW50KSB7XG5cdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIudG9nZ2xlKG9FdmVudC5nZXRTb3VyY2UoKSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGdyb3VwcyB0aGUgbWVzc2FnZXMgYmFzZWQgb24gdGhlIHNlY3Rpb24gb3Igc3Vic2VjdGlvbiB0aGV5IGJlbG9uZyB0by5cblx0ICogVGhpcyBtZXRob2QgZm9yY2UgdGhlIGxvYWRpbmcgb2YgY29udGV4dHMgZm9yIGFsbCB0YWJsZXMgYmVmb3JlIHRvIGFwcGx5IHRoZSBncm91cGluZy5cblx0ICpcblx0ICogQHBhcmFtIG9WaWV3IEN1cnJlbnQgdmlldy5cblx0ICogQHJldHVybnMgUmV0dXJuIHByb21pc2UuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRhc3luYyBfYXBwbHlHcm91cGluZ0FzeW5jKG9WaWV3OiBWaWV3KSB7XG5cdFx0Y29uc3QgYVdhaXRGb3JEYXRhOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcblx0XHRjb25zdCBvVmlld0JpbmRpbmdDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRjb25zdCBfZmluZFRhYmxlc1JlbGF0ZWRUb01lc3NhZ2VzID0gKHZpZXc6IFZpZXcpID0+IHtcblx0XHRcdGNvbnN0IG9SZXM6IGFueVtdID0gW107XG5cdFx0XHRjb25zdCBhTWVzc2FnZXMgPSB0aGlzLm9JdGVtQmluZGluZy5nZXRDb250ZXh0cygpLm1hcChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG9WaWV3Q29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRcdGlmIChvVmlld0NvbnRleHQpIHtcblx0XHRcdFx0Y29uc3Qgb09iamVjdFBhZ2U6IENvbnRyb2wgPSB2aWV3LmdldENvbnRlbnQoKVswXTtcblx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLmdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0KG9PYmplY3RQYWdlKS5mb3JFYWNoKGZ1bmN0aW9uIChvU2VjdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0b1NlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvU3ViU2VjdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRvU3ViU2VjdGlvbi5maW5kRWxlbWVudHModHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VsZW0uaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYU1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBvUm93QmluZGluZyA9IG9FbGVtLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvUm93QmluZGluZykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzRWxlbWVCaW5kaW5nUGF0aCA9IGAke29WaWV3Q29udGV4dC5nZXRQYXRoKCl9LyR7b0VsZW0uZ2V0Um93QmluZGluZygpLmdldFBhdGgoKX1gO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYU1lc3NhZ2VzW2ldLnRhcmdldC5pbmRleE9mKHNFbGVtZUJpbmRpbmdQYXRoKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9SZXMucHVzaCh7IHRhYmxlOiBvRWxlbSwgc3Vic2VjdGlvbjogb1N1YlNlY3Rpb24gfSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvUmVzO1xuXHRcdH07XG5cdFx0Ly8gU2VhcmNoIGZvciB0YWJsZSByZWxhdGVkIHRvIE1lc3NhZ2VzIGFuZCBpbml0aWFsaXplIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhcmVudCBzdWJzZWN0aW9uIHRvIHJldHJpZXZlIHRoZSBkYXRhXG5cdFx0Y29uc3Qgb1RhYmxlcyA9IF9maW5kVGFibGVzUmVsYXRlZFRvTWVzc2FnZXMuYmluZCh0aGlzKShvVmlldyk7XG5cdFx0b1RhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChfb1RhYmxlKSB7XG5cdFx0XHRjb25zdCBvTURDVGFibGUgPSBfb1RhYmxlLnRhYmxlLFxuXHRcdFx0XHRvU3Vic2VjdGlvbiA9IF9vVGFibGUuc3Vic2VjdGlvbjtcblx0XHRcdGlmICghb01EQ1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCkgfHwgb01EQ1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKSAhPT0gb1ZpZXdCaW5kaW5nQ29udGV4dD8uZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdG9TdWJzZWN0aW9uLnNldEJpbmRpbmdDb250ZXh0KG9WaWV3QmluZGluZ0NvbnRleHQpO1xuXHRcdFx0XHRpZiAoIW9NRENUYWJsZS5nZXRSb3dCaW5kaW5nKCkuaXNMZW5ndGhGaW5hbCgpKSB7XG5cdFx0XHRcdFx0YVdhaXRGb3JEYXRhLnB1c2goXG5cdFx0XHRcdFx0XHRuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdFx0b01EQ1RhYmxlLmdldFJvd0JpbmRpbmcoKS5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCB3YWl0Rm9yR3JvdXBpbmdBcHBsaWVkID0gbmV3IFByb21pc2UoKHJlc29sdmU6IEZ1bmN0aW9uKSA9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0dGhpcy5fYXBwbHlHcm91cGluZygpO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9LCAwKTtcblx0XHR9KTtcblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoYVdhaXRGb3JEYXRhKTtcblx0XHRcdG9WaWV3LmdldE1vZGVsKCkuY2hlY2tNZXNzYWdlcygpO1xuXHRcdFx0YXdhaXQgd2FpdEZvckdyb3VwaW5nQXBwbGllZDtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGdyb3VwaW5nIHRoZSBtZXNzYWdlcyBpbiB0aGUgbWVzc2FnZVBvcE92ZXJcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBncm91cHMgdGhlIG1lc3NhZ2VzIGJhc2VkIG9uIHRoZSBzZWN0aW9uIG9yIHN1YnNlY3Rpb24gdGhleSBiZWxvbmcgdG8uXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfYXBwbHlHcm91cGluZygpIHtcblx0XHR0aGlzLm9PYmplY3RQYWdlTGF5b3V0ID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dCh0aGlzLCB0aGlzLm9PYmplY3RQYWdlTGF5b3V0KTtcblx0XHRpZiAoIXRoaXMub09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgYU1lc3NhZ2VzID0gdGhpcy5vTWVzc2FnZVBvcG92ZXIuZ2V0SXRlbXMoKTtcblx0XHRjb25zdCBhU2VjdGlvbnMgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VmlzaWJsZVNlY3Rpb25zRnJvbU9iamVjdFBhZ2VMYXlvdXQodGhpcy5vT2JqZWN0UGFnZUxheW91dCk7XG5cdFx0Y29uc3QgYkVuYWJsZUJpbmRpbmcgPSB0aGlzLl9jaGVja0NvbnRyb2xJZEluU2VjdGlvbnMoYU1lc3NhZ2VzLCBmYWxzZSk7XG5cdFx0aWYgKGJFbmFibGVCaW5kaW5nKSB7XG5cdFx0XHR0aGlzLl9mbkVuYWJsZUJpbmRpbmdzKGFTZWN0aW9ucyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgcmV0cmlldmVzIHRoZSBiaW5kaW5nIGNvbnRleHQgZm9yIHRoZSByZWZFcnJvciBvYmplY3QuXG5cdCAqIFRoZSByZWZFcnJvciBjb250YWlucyBhIG1hcCB0byBzdG9yZSB0aGUgaW5kZXhlcyBvZiB0aGUgcm93cyB3aXRoIGVycm9ycy5cblx0ICpcblx0ICogQHBhcmFtIG9UYWJsZSBUaGUgdGFibGUgZm9yIHdoaWNoIHdlIHdhbnQgdG8gZ2V0IHRoZSByZWZFcnJvciBPYmplY3QuXG5cdCAqIEByZXR1cm5zIENvbnRleHQgb2YgdGhlIHJlZkVycm9yLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldFRhYmxlUmVmRXJyb3JDb250ZXh0KG9UYWJsZTogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb1RhYmxlLmdldE1vZGVsKFwiaW50ZXJuYWxcIik7XG5cdFx0Ly9pbml0aWFsaXplIHRoZSByZWZFcnJvciBwcm9wZXJ0eSBpZiBpdCBkb2Vzbid0IGV4aXN0XG5cdFx0aWYgKCFvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKS5nZXRQcm9wZXJ0eShcInJlZkVycm9yXCIpKSB7XG5cdFx0XHRvTW9kZWwuc2V0UHJvcGVydHkoXCJyZWZFcnJvclwiLCB7fSwgb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikpO1xuXHRcdH1cblx0XHRjb25zdCBzUmVmRXJyb3JDb250ZXh0UGF0aCA9XG5cdFx0XHRvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKS5nZXRQYXRoKCkgK1xuXHRcdFx0XCIvcmVmRXJyb3IvXCIgK1xuXHRcdFx0b1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0UGF0aCgpLnJlcGxhY2UoXCIvXCIsIFwiJFwiKSArXG5cdFx0XHRcIiRcIiArXG5cdFx0XHRvVGFibGUuZ2V0Um93QmluZGluZygpLmdldFBhdGgoKS5yZXBsYWNlKFwiL1wiLCBcIiRcIik7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSBvTW9kZWwuZ2V0Q29udGV4dChzUmVmRXJyb3JDb250ZXh0UGF0aCk7XG5cdFx0aWYgKCFvQ29udGV4dC5nZXRQcm9wZXJ0eShcIlwiKSkge1xuXHRcdFx0b01vZGVsLnNldFByb3BlcnR5KFwiXCIsIHt9LCBvQ29udGV4dCk7XG5cdFx0fVxuXHRcdHJldHVybiBvQ29udGV4dDtcblx0fVxuXG5cdF91cGRhdGVJbnRlcm5hbE1vZGVsKFxuXHRcdG9UYWJsZVJvd0NvbnRleHQ6IGFueSxcblx0XHRpUm93SW5kZXg6IG51bWJlcixcblx0XHRzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTogc3RyaW5nLFxuXHRcdG9UYWJsZTogYW55LFxuXHRcdG9NZXNzYWdlT2JqZWN0OiBhbnksXG5cdFx0YklzQ3JlYXRpb25Sb3c/OiBib29sZWFuXG5cdCkge1xuXHRcdGxldCBvVGVtcDtcblx0XHRpZiAoYklzQ3JlYXRpb25Sb3cpIHtcblx0XHRcdG9UZW1wID0ge1xuXHRcdFx0XHRyb3dJbmRleDogXCJDcmVhdGlvblJvd1wiLFxuXHRcdFx0XHR0YXJnZXRDb2xQcm9wZXJ0eTogc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPyBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA6IFwiXCJcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9UZW1wID0ge1xuXHRcdFx0XHRyb3dJbmRleDogb1RhYmxlUm93Q29udGV4dCA/IGlSb3dJbmRleCA6IFwiXCIsXG5cdFx0XHRcdHRhcmdldENvbFByb3BlcnR5OiBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA/IHNUYWJsZVRhcmdldENvbFByb3BlcnR5IDogXCJcIlxuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y29uc3Qgb01vZGVsID0gb1RhYmxlLmdldE1vZGVsKFwiaW50ZXJuYWxcIiksXG5cdFx0XHRvQ29udGV4dCA9IHRoaXMuX2dldFRhYmxlUmVmRXJyb3JDb250ZXh0KG9UYWJsZSk7XG5cdFx0Ly93ZSBmaXJzdCByZW1vdmUgdGhlIGVudHJpZXMgd2l0aCBvYnNvbGV0ZSBtZXNzYWdlIGlkcyBmcm9tIHRoZSBpbnRlcm5hbCBtb2RlbCBiZWZvcmUgaW5zZXJ0aW5nIHRoZSBuZXcgZXJyb3IgaW5mbyA6XG5cdFx0Y29uc3QgYVZhbGlkTWVzc2FnZUlkcyA9IHNhcC51aVxuXHRcdFx0LmdldENvcmUoKVxuXHRcdFx0LmdldE1lc3NhZ2VNYW5hZ2VyKClcblx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0LmdldERhdGEoKVxuXHRcdFx0Lm1hcChmdW5jdGlvbiAobWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmlkO1xuXHRcdFx0fSk7XG5cdFx0bGV0IGFPYnNvbGV0ZU1lc3NhZ2VsSWRzO1xuXHRcdGlmIChvQ29udGV4dC5nZXRQcm9wZXJ0eSgpKSB7XG5cdFx0XHRhT2Jzb2xldGVNZXNzYWdlbElkcyA9IE9iamVjdC5rZXlzKG9Db250ZXh0LmdldFByb3BlcnR5KCkpLmZpbHRlcihmdW5jdGlvbiAoaW50ZXJuYWxNZXNzYWdlSWQpIHtcblx0XHRcdFx0cmV0dXJuIGFWYWxpZE1lc3NhZ2VJZHMuaW5kZXhPZihpbnRlcm5hbE1lc3NhZ2VJZCkgPT09IC0xO1xuXHRcdFx0fSk7XG5cdFx0XHRhT2Jzb2xldGVNZXNzYWdlbElkcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnNvbGV0ZUlkKSB7XG5cdFx0XHRcdGRlbGV0ZSBvQ29udGV4dC5nZXRQcm9wZXJ0eSgpW29ic29sZXRlSWRdO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShcblx0XHRcdG9NZXNzYWdlT2JqZWN0LmdldElkKCksXG5cdFx0XHRPYmplY3QuYXNzaWduKHt9LCBvQ29udGV4dC5nZXRQcm9wZXJ0eShvTWVzc2FnZU9iamVjdC5nZXRJZCgpKSA/IG9Db250ZXh0LmdldFByb3BlcnR5KG9NZXNzYWdlT2JqZWN0LmdldElkKCkpIDoge30sIG9UZW1wKSxcblx0XHRcdG9Db250ZXh0XG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgc2V0cyBncm91cHMgZm9yIHRyYW5zaWVudCBtZXNzYWdlcy5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IG1lc3NhZ2UgVGhlIHRyYW5zaWVudCBtZXNzYWdlIGZvciB3aGljaCB3ZSB3YW50IHRvIGNvbXB1dGUgYW5kIHNldCBncm91cC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHNBY3Rpb25OYW1lIFRoZSBhY3Rpb24gbmFtZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9zZXRHcm91cExhYmVsRm9yVHJhbnNpZW50TXNnKG1lc3NhZ2U6IGFueSwgc0FjdGlvbk5hbWU6IHN0cmluZykge1xuXHRcdHRoaXMuc0xhc3RBY3Rpb25UZXh0ID0gdGhpcy5zTGFzdEFjdGlvblRleHRcblx0XHRcdD8gdGhpcy5zTGFzdEFjdGlvblRleHRcblx0XHRcdDogQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKS5nZXRUZXh0KFwiVF9NRVNTQUdFX0JVVFRPTl9TQVBGRV9NRVNTQUdFX0dST1VQX0xBU1RfQUNUSU9OXCIpO1xuXG5cdFx0bWVzc2FnZS5zZXRHcm91cE5hbWUoYCR7dGhpcy5zTGFzdEFjdGlvblRleHR9OiAke3NBY3Rpb25OYW1lfWApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBncm91cHMgbWVzc2FnZXMgYW5kIGFkZHMgdGhlIHN1YnRpdGxlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gbWVzc2FnZSBUaGUgbWVzc2FnZSB3ZSB1c2UgdG8gY29tcHV0ZSB0aGUgZ3JvdXAgYW5kIHN1YnRpdGxlLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gc2VjdGlvbiBUaGUgc2VjdGlvbiBjb250YWluaW5nIHRoZSBjb250cm9scy5cblx0ICogQHBhcmFtIHtvYmplY3R9IHN1YlNlY3Rpb24gVGhlIHN1YnNlY3Rpb24gY29udGFpbmluZyB0aGUgY29udHJvbHMuXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhRWxlbWVudHMgTGlzdCBvZiBjb250cm9scyBmcm9tIGEgc3Vic2VjdGlvbiByZWxhdGVkIHRvIGEgbWVzc2FnZS5cblx0ICogQHBhcmFtIHtib29sZWFufSBiTXVsdGlwbGVTdWJTZWN0aW9ucyBUcnVlIGlmIHRoZXJlIGlzIG1vcmUgdGhhbiAxIHN1YnNlY3Rpb24gaW4gdGhlIHNlY3Rpb24uXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzQWN0aW9uTmFtZSBUaGUgYWN0aW9uIG5hbWUuXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IFJldHVybiB0aGUgY29udHJvbCB0YXJnZXRlZCBieSB0aGUgbWVzc2FnZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9jb21wdXRlTWVzc2FnZUdyb3VwQW5kU3ViVGl0bGUoXG5cdFx0bWVzc2FnZTogTWVzc2FnZUl0ZW0sXG5cdFx0c2VjdGlvbjogT2JqZWN0UGFnZVNlY3Rpb24sXG5cdFx0c3ViU2VjdGlvbjogT2JqZWN0UGFnZVN1YlNlY3Rpb24sXG5cdFx0YUVsZW1lbnRzOiBhbnlbXSxcblx0XHRiTXVsdGlwbGVTdWJTZWN0aW9uczogYm9vbGVhbixcblx0XHRzQWN0aW9uTmFtZTogc3RyaW5nXG5cdCkge1xuXHRcdHRoaXMub0l0ZW1CaW5kaW5nLmRldGFjaENoYW5nZSh0aGlzLl9zZXRNZXNzYWdlRGF0YSwgdGhpcyk7XG5cdFx0Y29uc3Qgb01lc3NhZ2VPYmplY3QgPSBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKT8uZ2V0T2JqZWN0KCkgYXMgTWVzc2FnZTtcblx0XHRjb25zdCBzZXRTZWN0aW9uTmFtZUluR3JvdXAgPSB0cnVlO1xuXHRcdGxldCBvRWxlbWVudCwgb1RhYmxlOiBhbnksIG9UYXJnZXRUYWJsZUluZm86IGFueSwgbCwgaVJvd0luZGV4LCBvVGFyZ2V0ZWRDb250cm9sLCBiSXNDcmVhdGlvblJvdztcblx0XHRjb25zdCBiSXNCYWNrZW5kTWVzc2FnZSA9IG5ldyBSZWdFeHAoXCJeL1wiKS50ZXN0KG9NZXNzYWdlT2JqZWN0Py5nZXRUYXJnZXRzKClbMF0pLFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSBhcyBhbnk7XG5cdFx0aWYgKGJJc0JhY2tlbmRNZXNzYWdlKSB7XG5cdFx0XHRmb3IgKGwgPSAwOyBsIDwgYUVsZW1lbnRzLmxlbmd0aDsgbCsrKSB7XG5cdFx0XHRcdG9FbGVtZW50ID0gYUVsZW1lbnRzW2xdO1xuXHRcdFx0XHRvVGFyZ2V0ZWRDb250cm9sID0gb0VsZW1lbnQ7XG5cdFx0XHRcdGlmIChvRWxlbWVudC5pc0EoXCJzYXAubS5UYWJsZVwiKSB8fCBvRWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikpIHtcblx0XHRcdFx0XHRvVGFibGUgPSBvRWxlbWVudC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRjb25zdCBvUm93QmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0XHRcdFx0Y29uc3QgZm5DYWxsYmFja1NldEdyb3VwTmFtZSA9IChvTWVzc2FnZU9iajogYW55LCBhY3Rpb25OYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuX3NldEdyb3VwTGFiZWxGb3JUcmFuc2llbnRNc2cobWVzc2FnZSwgYWN0aW9uTmFtZSk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpZiAob1Jvd0JpbmRpbmcgJiYgb1Jvd0JpbmRpbmcuaXNMZW5ndGhGaW5hbCgpICYmIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvYmogPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZShcblx0XHRcdFx0XHRcdFx0b01lc3NhZ2VPYmplY3QsXG5cdFx0XHRcdFx0XHRcdG9UYWJsZSxcblx0XHRcdFx0XHRcdFx0b0VsZW1lbnQsXG5cdFx0XHRcdFx0XHRcdG9Sb3dCaW5kaW5nLFxuXHRcdFx0XHRcdFx0XHRzQWN0aW9uTmFtZSxcblx0XHRcdFx0XHRcdFx0c2V0U2VjdGlvbk5hbWVJbkdyb3VwLFxuXHRcdFx0XHRcdFx0XHRmbkNhbGxiYWNrU2V0R3JvdXBOYW1lXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mbyA9IG9iai5vVGFyZ2V0VGFibGVJbmZvO1xuXHRcdFx0XHRcdFx0aWYgKG9iai5zdWJUaXRsZSkge1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlLnNldFN1YnRpdGxlKG9iai5zdWJUaXRsZSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG1lc3NhZ2Uuc2V0QWN0aXZlVGl0bGUoISFvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQpO1xuXG5cdFx0XHRcdFx0XHRpZiAob1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuX2Zvcm1hdE1lc3NhZ2VEZXNjcmlwdGlvbihcblx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCxcblx0XHRcdFx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbE5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdG9UYWJsZVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aVJvd0luZGV4ID0gb1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0ICYmIG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dC5nZXRJbmRleCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5fdXBkYXRlSW50ZXJuYWxNb2RlbChcblx0XHRcdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRpUm93SW5kZXgsXG5cdFx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdG9UYWJsZSxcblx0XHRcdFx0XHRcdFx0b01lc3NhZ2VPYmplY3Rcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0QWN0aXZlVGl0bGUodHJ1ZSk7XG5cdFx0XHRcdFx0Ly9jaGVjayBpZiB0aGUgdGFyZ2V0ZWQgY29udHJvbCBpcyBhIGNoaWxkIG9mIG9uZSBvZiB0aGUgb3RoZXIgY29udHJvbHNcblx0XHRcdFx0XHRjb25zdCBiSXNUYXJnZXRlZENvbnRyb2xPcnBoYW4gPSBtZXNzYWdlSGFuZGxpbmcuYklzT3JwaGFuRWxlbWVudChvVGFyZ2V0ZWRDb250cm9sLCBhRWxlbWVudHMpO1xuXHRcdFx0XHRcdGlmIChiSXNUYXJnZXRlZENvbnRyb2xPcnBoYW4pIHtcblx0XHRcdFx0XHRcdC8vc2V0IHRoZSBzdWJ0aXRsZVxuXHRcdFx0XHRcdFx0bWVzc2FnZS5zZXRTdWJ0aXRsZShcIlwiKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL1RoZXJlIGlzIG9ubHkgb25lIGVsdCBhcyB0aGlzIGlzIGEgZnJvbnRFbmQgbWVzc2FnZVxuXHRcdFx0b1RhcmdldGVkQ29udHJvbCA9IGFFbGVtZW50c1swXTtcblx0XHRcdG9UYWJsZSA9IHRoaXMuX2dldE1kY1RhYmxlKG9UYXJnZXRlZENvbnRyb2wpO1xuXHRcdFx0aWYgKG9UYWJsZSkge1xuXHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvID0ge307XG5cdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8udGFibGVIZWFkZXIgPSBvVGFibGUuZ2V0SGVhZGVyKCk7XG5cdFx0XHRcdGNvbnN0IGlUYXJnZXRDb2x1bW5JbmRleCA9IHRoaXMuX2dldFRhYmxlQ29sdW1uSW5kZXgob1RhcmdldGVkQ29udHJvbCk7XG5cdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPVxuXHRcdFx0XHRcdGlUYXJnZXRDb2x1bW5JbmRleCA+IC0xID8gb1RhYmxlLmdldENvbHVtbnMoKVtpVGFyZ2V0Q29sdW1uSW5kZXhdLmdldERhdGFQcm9wZXJ0eSgpIDogdW5kZWZpbmVkO1xuXHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5ID0gb1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTtcblx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lID1cblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5ICYmIGlUYXJnZXRDb2x1bW5JbmRleCA+IC0xXG5cdFx0XHRcdFx0XHQ/IG9UYWJsZS5nZXRDb2x1bW5zKClbaVRhcmdldENvbHVtbkluZGV4XS5nZXRIZWFkZXIoKVxuXHRcdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRcdGJJc0NyZWF0aW9uUm93ID0gdGhpcy5fZ2V0VGFibGVSb3cob1RhcmdldGVkQ29udHJvbCkuaXNBKFwic2FwLnVpLnRhYmxlLkNyZWF0aW9uUm93XCIpO1xuXHRcdFx0XHRpZiAoIWJJc0NyZWF0aW9uUm93KSB7XG5cdFx0XHRcdFx0aVJvd0luZGV4ID0gdGhpcy5fZ2V0VGFibGVSb3dJbmRleChvVGFyZ2V0ZWRDb250cm9sKTtcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0Q3VycmVudENvbnRleHRzKCk7XG5cdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0ID0gb1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dCaW5kaW5nQ29udGV4dHNbaVJvd0luZGV4XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBzTWVzc2FnZVN1YnRpdGxlID0gbWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VTdWJ0aXRsZShcblx0XHRcdFx0XHRvTWVzc2FnZU9iamVjdCxcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyxcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lLFxuXHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRvVGFibGUsXG5cdFx0XHRcdFx0YklzQ3JlYXRpb25Sb3csXG5cdFx0XHRcdFx0aVRhcmdldENvbHVtbkluZGV4ID09PSAwICYmIG9UYXJnZXRlZENvbnRyb2wuZ2V0VmFsdWVTdGF0ZSgpID09PSBcIkVycm9yXCIgPyBvVGFyZ2V0ZWRDb250cm9sIDogdW5kZWZpbmVkXG5cdFx0XHRcdCk7XG5cdFx0XHRcdC8vc2V0IHRoZSBzdWJ0aXRsZVxuXHRcdFx0XHRpZiAoc01lc3NhZ2VTdWJ0aXRsZSkge1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0U3VidGl0bGUoc01lc3NhZ2VTdWJ0aXRsZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRtZXNzYWdlLnNldEFjdGl2ZVRpdGxlKHRydWUpO1xuXG5cdFx0XHRcdHRoaXMuX3VwZGF0ZUludGVybmFsTW9kZWwoXG5cdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0LFxuXHRcdFx0XHRcdGlSb3dJbmRleCxcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5LFxuXHRcdFx0XHRcdG9UYWJsZSxcblx0XHRcdFx0XHRvTWVzc2FnZU9iamVjdCxcblx0XHRcdFx0XHRiSXNDcmVhdGlvblJvd1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChzZXRTZWN0aW9uTmFtZUluR3JvdXApIHtcblx0XHRcdGNvbnN0IHNlY3Rpb25CYXNlZEdyb3VwTmFtZSA9IG1lc3NhZ2VIYW5kbGluZy5jcmVhdGVTZWN0aW9uR3JvdXBOYW1lKFxuXHRcdFx0XHRzZWN0aW9uLFxuXHRcdFx0XHRzdWJTZWN0aW9uLFxuXHRcdFx0XHRiTXVsdGlwbGVTdWJTZWN0aW9ucyxcblx0XHRcdFx0b1RhcmdldFRhYmxlSW5mbyxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlXG5cdFx0XHQpO1xuXG5cdFx0XHRtZXNzYWdlLnNldEdyb3VwTmFtZShzZWN0aW9uQmFzZWRHcm91cE5hbWUpO1xuXHRcdFx0Y29uc3Qgc1ZpZXdJZCA9IHRoaXMuX2dldFZpZXdJZCh0aGlzLmdldElkKCkpO1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb3JlLmJ5SWQoc1ZpZXdJZCBhcyBzdHJpbmcpO1xuXHRcdFx0Y29uc3Qgb01lc3NhZ2VUYXJnZXRQcm9wZXJ0eSA9IG9NZXNzYWdlT2JqZWN0LmdldFRhcmdldHMoKVswXSAmJiBvTWVzc2FnZU9iamVjdC5nZXRUYXJnZXRzKClbMF0uc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdFx0Y29uc3Qgb1VJTW9kZWwgPSBvVmlldz8uZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9VSU1vZGVsICYmXG5cdFx0XHRcdG9VSU1vZGVsLmdldFByb3BlcnR5KFwiL21lc3NhZ2VUYXJnZXRQcm9wZXJ0eVwiKSAmJlxuXHRcdFx0XHRvTWVzc2FnZVRhcmdldFByb3BlcnR5ICYmXG5cdFx0XHRcdG9NZXNzYWdlVGFyZ2V0UHJvcGVydHkgPT09IG9VSU1vZGVsLmdldFByb3BlcnR5KFwiL21lc3NhZ2VUYXJnZXRQcm9wZXJ0eVwiKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRoaXMub01lc3NhZ2VQb3BvdmVyLmZpcmVBY3RpdmVUaXRsZVByZXNzKHsgaXRlbTogbWVzc2FnZSB9KTtcblx0XHRcdFx0b1VJTW9kZWwuc2V0UHJvcGVydHkoXCIvbWVzc2FnZVRhcmdldFByb3BlcnR5XCIsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5vSXRlbUJpbmRpbmcuYXR0YWNoQ2hhbmdlKHRoaXMuX3NldE1lc3NhZ2VEYXRhLCB0aGlzKTtcblx0XHRyZXR1cm4gb1RhcmdldGVkQ29udHJvbDtcblx0fVxuXG5cdF9jaGVja0NvbnRyb2xJZEluU2VjdGlvbnMoYU1lc3NhZ2VzOiBhbnlbXSwgYkVuYWJsZUJpbmRpbmc6IGJvb2xlYW4pIHtcblx0XHRsZXQgc2VjdGlvbiwgYVN1YlNlY3Rpb25zLCBtZXNzYWdlLCBpLCBqLCBrO1xuXG5cdFx0dGhpcy5zR2VuZXJhbEdyb3VwVGV4dCA9IHRoaXMuc0dlbmVyYWxHcm91cFRleHRcblx0XHRcdD8gdGhpcy5zR2VuZXJhbEdyb3VwVGV4dFxuXHRcdFx0OiBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJUX01FU1NBR0VfQlVUVE9OX1NBUEZFX01FU1NBR0VfR1JPVVBfR0VORVJBTFwiKTtcblx0XHQvL0dldCBhbGwgc2VjdGlvbnMgZnJvbSB0aGUgb2JqZWN0IHBhZ2UgbGF5b3V0XG5cdFx0Y29uc3QgYVZpc2libGVTZWN0aW9ucyA9IG1lc3NhZ2VIYW5kbGluZy5nZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dCh0aGlzLm9PYmplY3RQYWdlTGF5b3V0KTtcblx0XHRpZiAoYVZpc2libGVTZWN0aW9ucykge1xuXHRcdFx0Y29uc3Qgdmlld0lkID0gdGhpcy5fZ2V0Vmlld0lkKHRoaXMuZ2V0SWQoKSk7XG5cdFx0XHRjb25zdCBvVmlldyA9IENvcmUuYnlJZCh2aWV3SWQpO1xuXHRcdFx0Y29uc3Qgc0FjdGlvbk5hbWUgPSBvVmlldz8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKT8uZ2V0UHJvcGVydHkoXCJzQWN0aW9uTmFtZVwiKTtcblx0XHRcdGlmIChzQWN0aW9uTmFtZSkge1xuXHRcdFx0XHQob1ZpZXc/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgYW55KS5zZXRQcm9wZXJ0eShcInNBY3Rpb25OYW1lXCIsIG51bGwpO1xuXHRcdFx0fVxuXHRcdFx0Zm9yIChpID0gYU1lc3NhZ2VzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG5cdFx0XHRcdC8vIExvb3Agb3ZlciBhbGwgbWVzc2FnZXNcblx0XHRcdFx0bWVzc2FnZSA9IGFNZXNzYWdlc1tpXTtcblx0XHRcdFx0bGV0IGJJc0dlbmVyYWxHcm91cE5hbWUgPSB0cnVlO1xuXHRcdFx0XHRmb3IgKGogPSBhVmlzaWJsZVNlY3Rpb25zLmxlbmd0aCAtIDE7IGogPj0gMDsgLS1qKSB7XG5cdFx0XHRcdFx0Ly8gTG9vcCBvdmVyIGFsbCB2aXNpYmxlIHNlY3Rpb25zXG5cdFx0XHRcdFx0c2VjdGlvbiA9IGFWaXNpYmxlU2VjdGlvbnNbal07XG5cdFx0XHRcdFx0YVN1YlNlY3Rpb25zID0gc2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpO1xuXHRcdFx0XHRcdGZvciAoayA9IGFTdWJTZWN0aW9ucy5sZW5ndGggLSAxOyBrID49IDA7IC0taykge1xuXHRcdFx0XHRcdFx0Ly8gTG9vcCBvdmVyIGFsbCBzdWItc2VjdGlvbnNcblx0XHRcdFx0XHRcdGNvbnN0IHN1YlNlY3Rpb24gPSBhU3ViU2VjdGlvbnNba107XG5cdFx0XHRcdFx0XHRjb25zdCBvTWVzc2FnZU9iamVjdCA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpLmdldE9iamVjdCgpO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBhQ29udHJvbHMgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb24oc3ViU2VjdGlvbiwgb01lc3NhZ2VPYmplY3QpO1xuXHRcdFx0XHRcdFx0aWYgKGFDb250cm9scy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9UYXJnZXRlZENvbnRyb2wgPSB0aGlzLl9jb21wdXRlTWVzc2FnZUdyb3VwQW5kU3ViVGl0bGUoXG5cdFx0XHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0XHRzZWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdHN1YlNlY3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0YUNvbnRyb2xzLFxuXHRcdFx0XHRcdFx0XHRcdGFTdWJTZWN0aW9ucy5sZW5ndGggPiAxLFxuXHRcdFx0XHRcdFx0XHRcdHNBY3Rpb25OYW1lXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdC8vIGlmIHdlIGZvdW5kIHRhYmxlIHRoYXQgbWF0Y2hlcyB3aXRoIHRoZSBtZXNzYWdlLCB3ZSBkb24ndCBzdG9wIHRoZSBsb29wXG5cdFx0XHRcdFx0XHRcdC8vIGluIGNhc2Ugd2UgZmluZCBhbiBhZGRpdGlvbmFsIGNvbnRyb2wgKGVnIG1kYyBmaWVsZCkgdGhhdCBhbHNvIG1hdGNoIHdpdGggdGhlIG1lc3NhZ2Vcblx0XHRcdFx0XHRcdFx0aWYgKG9UYXJnZXRlZENvbnRyb2wgJiYgIW9UYXJnZXRlZENvbnRyb2wuaXNBKFwic2FwLm0uVGFibGVcIikgJiYgIW9UYXJnZXRlZENvbnRyb2wuaXNBKFwic2FwLnVpLnRhYmxlLlRhYmxlXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0aiA9IGsgPSAtMTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRiSXNHZW5lcmFsR3JvdXBOYW1lID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChiSXNHZW5lcmFsR3JvdXBOYW1lKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb01lc3NhZ2VPYmplY3QgPSBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKS5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRtZXNzYWdlLnNldEFjdGl2ZVRpdGxlKGZhbHNlKTtcblx0XHRcdFx0XHRpZiAob01lc3NhZ2VPYmplY3QucGVyc2lzdGVudCAmJiBzQWN0aW9uTmFtZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fc2V0R3JvdXBMYWJlbEZvclRyYW5zaWVudE1zZyhtZXNzYWdlLCBzQWN0aW9uTmFtZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG1lc3NhZ2Uuc2V0R3JvdXBOYW1lKHRoaXMuc0dlbmVyYWxHcm91cFRleHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIWJFbmFibGVCaW5kaW5nICYmIG1lc3NhZ2UuZ2V0R3JvdXBOYW1lKCkgPT09IHRoaXMuc0dlbmVyYWxHcm91cFRleHQgJiYgdGhpcy5fZmluZFRhcmdldEZvck1lc3NhZ2UobWVzc2FnZSkpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9maW5kVGFyZ2V0Rm9yTWVzc2FnZShtZXNzYWdlOiBhbnkpIHtcblx0XHRjb25zdCBtZXNzYWdlT2JqZWN0ID0gbWVzc2FnZS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikgJiYgbWVzc2FnZS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCk7XG5cdFx0aWYgKG1lc3NhZ2VPYmplY3QgJiYgbWVzc2FnZU9iamVjdC50YXJnZXQpIHtcblx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPVxuXHRcdFx0XHRcdHRoaXMub09iamVjdFBhZ2VMYXlvdXQgJiYgdGhpcy5vT2JqZWN0UGFnZUxheW91dC5nZXRNb2RlbCgpICYmIHRoaXMub09iamVjdFBhZ2VMYXlvdXQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0Y29udGV4dFBhdGggPSBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgobWVzc2FnZU9iamVjdC50YXJnZXQpLFxuXHRcdFx0XHRvQ29udGV4dFBhdGhNZXRhZGF0YSA9IG9NZXRhTW9kZWwgJiYgb01ldGFNb2RlbC5nZXRPYmplY3QoY29udGV4dFBhdGgpO1xuXHRcdFx0aWYgKG9Db250ZXh0UGF0aE1ldGFkYXRhICYmIG9Db250ZXh0UGF0aE1ldGFkYXRhLiRraW5kID09PSBcIlByb3BlcnR5XCIpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2ZuRW5hYmxlQmluZGluZ3MoYVNlY3Rpb25zOiBhbnlbXSkge1xuXHRcdGlmIChVcmlQYXJhbWV0ZXJzLmZyb21RdWVyeSh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoXCJzYXAtZmUteHgtbGF6eWxvYWRpbmd0ZXN0XCIpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGZvciAobGV0IGlTZWN0aW9uID0gMDsgaVNlY3Rpb24gPCBhU2VjdGlvbnMubGVuZ3RoOyBpU2VjdGlvbisrKSB7XG5cdFx0XHRjb25zdCBvU2VjdGlvbiA9IGFTZWN0aW9uc1tpU2VjdGlvbl07XG5cdFx0XHRsZXQgbm9uVGFibGVDaGFydGNvbnRyb2xGb3VuZCA9IGZhbHNlO1xuXHRcdFx0Y29uc3QgYVN1YlNlY3Rpb25zID0gb1NlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKTtcblx0XHRcdGZvciAobGV0IGlTdWJTZWN0aW9uID0gMDsgaVN1YlNlY3Rpb24gPCBhU3ViU2VjdGlvbnMubGVuZ3RoOyBpU3ViU2VjdGlvbisrKSB7XG5cdFx0XHRcdGNvbnN0IG9TdWJTZWN0aW9uID0gYVN1YlNlY3Rpb25zW2lTdWJTZWN0aW9uXTtcblx0XHRcdFx0Y29uc3Qgb0FsbEJsb2NrcyA9IG9TdWJTZWN0aW9uLmdldEJsb2NrcygpO1xuXHRcdFx0XHRpZiAob0FsbEJsb2Nrcykge1xuXHRcdFx0XHRcdGZvciAobGV0IGJsb2NrID0gMDsgYmxvY2sgPCBvU3ViU2VjdGlvbi5nZXRCbG9ja3MoKS5sZW5ndGg7IGJsb2NrKyspIHtcblx0XHRcdFx0XHRcdGlmIChvQWxsQmxvY2tzW2Jsb2NrXS5nZXRDb250ZW50ICYmICFvQWxsQmxvY2tzW2Jsb2NrXS5nZXRDb250ZW50KCk/LmlzQShcInNhcC5mZS5tYWNyb3MudGFibGUuVGFibGVBUElcIikpIHtcblx0XHRcdFx0XHRcdFx0bm9uVGFibGVDaGFydGNvbnRyb2xGb3VuZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAobm9uVGFibGVDaGFydGNvbnRyb2xGb3VuZCkge1xuXHRcdFx0XHRcdFx0b1N1YlNlY3Rpb24uc2V0QmluZGluZ0NvbnRleHQodW5kZWZpbmVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9TdWJTZWN0aW9uLmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdFx0XHR0aGlzLl9maW5kTWVzc2FnZUdyb3VwQWZ0ZXJSZWJpbmRpbmcoKTtcblx0XHRcdFx0XHRvU3ViU2VjdGlvbi5nZXRCaW5kaW5nQ29udGV4dCgpLmdldEJpbmRpbmcoKS5hdHRhY2hEYXRhUmVjZWl2ZWQodGhpcy5fZmluZE1lc3NhZ2VHcm91cEFmdGVyUmViaW5kaW5nLmJpbmQodGhpcykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2ZpbmRNZXNzYWdlR3JvdXBBZnRlclJlYmluZGluZygpIHtcblx0XHRjb25zdCBhTWVzc2FnZXMgPSB0aGlzLm9NZXNzYWdlUG9wb3Zlci5nZXRJdGVtcygpO1xuXHRcdHRoaXMuX2NoZWNrQ29udHJvbElkSW5TZWN0aW9ucyhhTWVzc2FnZXMsIHRydWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCByZXRyaWV2ZXMgdGhlIHZpZXcgSUQgKEhUTUxWaWV3L1hNTFZpZXcvSlNPTnZpZXcvSlNWaWV3L1RlbXBsYXRldmlldykgb2YgYW55IGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQ29udHJvbElkIElEIG9mIHRoZSBjb250cm9sIG5lZWRlZCB0byByZXRyaWV2ZSB0aGUgdmlldyBJRFxuXHQgKiBAcmV0dXJucyBUaGUgdmlldyBJRCBvZiB0aGUgY29udHJvbFxuXHQgKi9cblx0X2dldFZpZXdJZChzQ29udHJvbElkOiBzdHJpbmcpIHtcblx0XHRsZXQgc1ZpZXdJZCxcblx0XHRcdG9Db250cm9sID0gQ29yZS5ieUlkKHNDb250cm9sSWQpIGFzIGFueTtcblx0XHR3aGlsZSAob0NvbnRyb2wpIHtcblx0XHRcdGlmIChvQ29udHJvbCBpbnN0YW5jZW9mIFZpZXcpIHtcblx0XHRcdFx0c1ZpZXdJZCA9IG9Db250cm9sLmdldElkKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHR9XG5cdFx0cmV0dXJuIHNWaWV3SWQ7XG5cdH1cblxuXHRfc2V0TG9uZ3RleHRVcmxEZXNjcmlwdGlvbihzTWVzc2FnZURlc2NyaXB0aW9uQ29udGVudDogc3RyaW5nLCBvRGlhZ25vc2lzVGl0bGU6IGFueSkge1xuXHRcdHRoaXMub01lc3NhZ2VQb3BvdmVyLnNldEFzeW5jRGVzY3JpcHRpb25IYW5kbGVyKGZ1bmN0aW9uIChjb25maWc6IGFueSkge1xuXHRcdFx0Ly8gVGhpcyBzdG9yZXMgdGhlIG9sZCBkZXNjcmlwdGlvblxuXHRcdFx0Y29uc3Qgc09sZERlc2NyaXB0aW9uID0gc01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQ7XG5cdFx0XHQvLyBIZXJlIHdlIGNhbiBmZXRjaCB0aGUgZGF0YSBhbmQgY29uY2F0ZW5hdGUgaXQgdG8gdGhlIG9sZCBvbmVcblx0XHRcdC8vIEJ5IGRlZmF1bHQsIHRoZSBsb25ndGV4dFVybCBmZXRjaGluZyB3aWxsIG92ZXJ3cml0ZSB0aGUgZGVzY3JpcHRpb24gKHdpdGggdGhlIGRlZmF1bHQgYmVoYXZpb3VyKVxuXHRcdFx0Ly8gSGVyZSBhcyB3ZSBoYXZlIG92ZXJ3cml0dGVuIHRoZSBkZWZhdWx0IGFzeW5jIGhhbmRsZXIsIHdoaWNoIGZldGNoZXMgYW5kIHJlcGxhY2VzIHRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgaXRlbVxuXHRcdFx0Ly8gd2UgY2FuIG1hbnVhbGx5IG1vZGlmeSBpdCB0byBpbmNsdWRlIHdoYXRldmVyIG5lZWRlZC5cblx0XHRcdGNvbnN0IHNMb25nVGV4dFVybCA9IGNvbmZpZy5pdGVtLmdldExvbmd0ZXh0VXJsKCk7XG5cdFx0XHRpZiAoc0xvbmdUZXh0VXJsKSB7XG5cdFx0XHRcdGpRdWVyeS5hamF4KHtcblx0XHRcdFx0XHR0eXBlOiBcIkdFVFwiLFxuXHRcdFx0XHRcdHVybDogc0xvbmdUZXh0VXJsLFxuXHRcdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzRGlhZ25vc2lzVGV4dCA9IG9EaWFnbm9zaXNUaXRsZS5nZXRIdG1sVGV4dCgpICsgZGF0YTtcblx0XHRcdFx0XHRcdGNvbmZpZy5pdGVtLnNldERlc2NyaXB0aW9uKGAke3NPbGREZXNjcmlwdGlvbn0ke3NEaWFnbm9zaXNUZXh0fWApO1xuXHRcdFx0XHRcdFx0Y29uZmlnLnByb21pc2UucmVzb2x2ZSgpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGNvbmZpZy5pdGVtLnNldERlc2NyaXB0aW9uKHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50KTtcblx0XHRcdFx0XHRcdGNvbnN0IHNFcnJvciA9IGBBIHJlcXVlc3QgaGFzIGZhaWxlZCBmb3IgbG9uZyB0ZXh0IGRhdGEuIFVSTDogJHtzTG9uZ1RleHRVcmx9YDtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihzRXJyb3IpO1xuXHRcdFx0XHRcdFx0Y29uZmlnLnByb21pc2UucmVqZWN0KHNFcnJvcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdF9mb3JtYXRNZXNzYWdlRGVzY3JpcHRpb24oXG5cdFx0bWVzc2FnZTogYW55LFxuXHRcdG9UYWJsZVJvd0NvbnRleHQ6IGFueSxcblx0XHRzVGFibGVUYXJnZXRDb2xOYW1lOiBzdHJpbmcsXG5cdFx0b1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSxcblx0XHRvVGFibGU6IGFueVxuXHQpIHtcblx0XHRjb25zdCBzVGFibGVGaXJzdENvbFByb3BlcnR5ID0gb1RhYmxlLmdldFBhcmVudCgpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0XHRsZXQgc0NvbHVtbkluZm8gPSBcIlwiO1xuXHRcdGNvbnN0IG9Nc2dPYmogPSBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKT8uZ2V0T2JqZWN0KCk7XG5cdFx0Y29uc3Qgb0NvbEZyb21UYWJsZVNldHRpbmdzOiBDb2x1bW5EYXRhV2l0aEF2YWlsYWJpbGl0eVR5cGUgPSBtZXNzYWdlSGFuZGxpbmcuZmV0Y2hDb2x1bW5JbmZvKG9Nc2dPYmosIG9UYWJsZSk7XG5cdFx0aWYgKHNUYWJsZVRhcmdldENvbE5hbWUpIHtcblx0XHRcdC8vIGlmIGNvbHVtbiBpbiBwcmVzZW50IGluIHRhYmxlIGRlZmluaXRpb25cblx0XHRcdHNDb2x1bW5JbmZvID0gYCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX01FU1NBR0VfR1JPVVBfREVTQ1JJUFRJT05fVEFCTEVfQ09MVU1OXCIpfTogJHtzVGFibGVUYXJnZXRDb2xOYW1lfWA7XG5cdFx0fSBlbHNlIGlmIChvQ29sRnJvbVRhYmxlU2V0dGluZ3MpIHtcblx0XHRcdGlmIChvQ29sRnJvbVRhYmxlU2V0dGluZ3MuYXZhaWxhYmlsaXR5ID09PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRcdC8vIGlmIGNvbHVtbiBpbiBuZWl0aGVyIGluIHRhYmxlIGRlZmluaXRpb24gbm9yIHBlcnNvbmFsaXphdGlvblxuXHRcdFx0XHRpZiAobWVzc2FnZS5nZXRUeXBlKCkgPT09IFwiRXJyb3JcIikge1xuXHRcdFx0XHRcdHNDb2x1bW5JbmZvID0gc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0PyBgJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfQ09MVU1OX0FWQUlMQUJMRV9ESUFHTk9TSVNfTVNHREVTQ19FUlJPUlwiKX0gJHtvVGFibGVSb3dDb250ZXh0LmdldFZhbHVlKFxuXHRcdFx0XHRcdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdFx0XHRcdCAgKX1gICsgXCIuXCJcblx0XHRcdFx0XHRcdDogYCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX0NPTFVNTl9BVkFJTEFCTEVfRElBR05PU0lTX01TR0RFU0NfRVJST1JcIil9YCArIFwiLlwiO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNDb2x1bW5JbmZvID0gc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0PyBgJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfQ09MVU1OX0FWQUlMQUJMRV9ESUFHTk9TSVNfTVNHREVTQ1wiKX0gJHtvVGFibGVSb3dDb250ZXh0LmdldFZhbHVlKFxuXHRcdFx0XHRcdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdFx0XHRcdCAgKX1gICsgXCIuXCJcblx0XHRcdFx0XHRcdDogYCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX0NPTFVNTl9BVkFJTEFCTEVfRElBR05PU0lTX01TR0RFU0NcIil9YCArIFwiLlwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBpZiBjb2x1bW4gaXMgbm90IGluIHRhYmxlIGRlZmluaXRpb24gYnV0IGluIHBlcnNvbmFsaXphdGlvblxuXHRcdFx0XHQvL2lmIG5vIG5hdmlnYXRpb24gdG8gc3ViIG9wIHRoZW4gcmVtb3ZlIGxpbmsgdG8gZXJyb3IgZmllbGQgQkNQIDogMjI4MDE2ODg5OVxuXHRcdFx0XHRpZiAoIXRoaXMuX25hdmlnYXRpb25Db25maWd1cmVkKG9UYWJsZSkpIHtcblx0XHRcdFx0XHRtZXNzYWdlLnNldEFjdGl2ZVRpdGxlKGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzQ29sdW1uSW5mbyA9IGAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX0RFU0NSSVBUSU9OX1RBQkxFX0NPTFVNTlwiKX06ICR7XG5cdFx0XHRcdFx0b0NvbEZyb21UYWJsZVNldHRpbmdzLmxhYmVsXG5cdFx0XHRcdH0gKCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX0NPTFVNTl9JTkRJQ0FUT1JfSU5fVEFCTEVfREVGSU5JVElPTlwiKX0pYDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qgb0ZpZWxkc0FmZmVjdGVkVGl0bGUgPSBuZXcgRm9ybWF0dGVkVGV4dCh7XG5cdFx0XHRodG1sVGV4dDogYDxodG1sPjxib2R5PjxzdHJvbmc+JHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfRklFTERTX0FGRkVDVEVEX1RJVExFXCIpfTwvc3Ryb25nPjwvYm9keT48L2h0bWw+PGJyPmBcblx0XHR9KTtcblx0XHRsZXQgc0ZpZWxkQWZmZWN0ZWRUZXh0OiBTdHJpbmc7XG5cdFx0aWYgKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpIHtcblx0XHRcdHNGaWVsZEFmZmVjdGVkVGV4dCA9IGAke29GaWVsZHNBZmZlY3RlZFRpdGxlLmdldEh0bWxUZXh0KCl9PGJyPiR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXG5cdFx0XHRcdFwiVF9NRVNTQUdFX0dST1VQX1RJVExFX1RBQkxFX0RFTk9NSU5BVE9SXCJcblx0XHRcdCl9OiAke29UYWJsZS5nZXRIZWFkZXIoKX08YnI+JHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9ST1dcIil9OiAke29UYWJsZVJvd0NvbnRleHQuZ2V0VmFsdWUoXG5cdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdCl9PGJyPiR7c0NvbHVtbkluZm99PGJyPmA7XG5cdFx0fSBlbHNlIGlmIChzQ29sdW1uSW5mbyA9PSBcIlwiIHx8ICFzQ29sdW1uSW5mbykge1xuXHRcdFx0c0ZpZWxkQWZmZWN0ZWRUZXh0ID0gXCJcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0ZpZWxkQWZmZWN0ZWRUZXh0ID0gYCR7b0ZpZWxkc0FmZmVjdGVkVGl0bGUuZ2V0SHRtbFRleHQoKX08YnI+JHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcblx0XHRcdFx0XCJUX01FU1NBR0VfR1JPVVBfVElUTEVfVEFCTEVfREVOT01JTkFUT1JcIlxuXHRcdFx0KX06ICR7b1RhYmxlLmdldEhlYWRlcigpfTxicj4ke3NDb2x1bW5JbmZvfTxicj5gO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9EaWFnbm9zaXNUaXRsZSA9IG5ldyBGb3JtYXR0ZWRUZXh0KHtcblx0XHRcdGh0bWxUZXh0OiBgPGh0bWw+PGJvZHk+PHN0cm9uZz4ke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9ESUFHTk9TSVNfVElUTEVcIil9PC9zdHJvbmc+PC9ib2R5PjwvaHRtbD48YnI+YFxuXHRcdH0pO1xuXHRcdC8vIGdldCB0aGUgVUkgbWVzc2FnZXMgZnJvbSB0aGUgbWVzc2FnZSBjb250ZXh0IHRvIHNldCBpdCB0byBEaWFnbm9zaXMgc2VjdGlvblxuXHRcdGNvbnN0IHNVSU1lc3NhZ2VEZXNjcmlwdGlvbiA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpLmdldE9iamVjdCgpLmRlc2NyaXB0aW9uO1xuXHRcdC8vc2V0IHRoZSBkZXNjcmlwdGlvbiB0byBudWxsIHRvIHJlc2V0IGl0IGJlbG93XG5cdFx0bWVzc2FnZS5zZXREZXNjcmlwdGlvbihudWxsKTtcblx0XHRsZXQgc0RpYWdub3Npc1RleHQgPSBcIlwiO1xuXHRcdGxldCBzTWVzc2FnZURlc2NyaXB0aW9uQ29udGVudCA9IFwiXCI7XG5cdFx0aWYgKG1lc3NhZ2UuZ2V0TG9uZ3RleHRVcmwoKSkge1xuXHRcdFx0c01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQgPSBgJHtzRmllbGRBZmZlY3RlZFRleHR9PGJyPmA7XG5cdFx0XHR0aGlzLl9zZXRMb25ndGV4dFVybERlc2NyaXB0aW9uKHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50LCBvRGlhZ25vc2lzVGl0bGUpO1xuXHRcdH0gZWxzZSBpZiAoc1VJTWVzc2FnZURlc2NyaXB0aW9uKSB7XG5cdFx0XHRzRGlhZ25vc2lzVGV4dCA9IGAke29EaWFnbm9zaXNUaXRsZS5nZXRIdG1sVGV4dCgpfTxicj4ke3NVSU1lc3NhZ2VEZXNjcmlwdGlvbn1gO1xuXHRcdFx0c01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQgPSBgJHtzRmllbGRBZmZlY3RlZFRleHR9PGJyPiR7c0RpYWdub3Npc1RleHR9YDtcblx0XHRcdG1lc3NhZ2Uuc2V0RGVzY3JpcHRpb24oc01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtZXNzYWdlLnNldERlc2NyaXB0aW9uKHNGaWVsZEFmZmVjdGVkVGV4dCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBzZXQgdGhlIGJ1dHRvbiB0ZXh0LCBjb3VudCBhbmQgaWNvbiBwcm9wZXJ0eSBiYXNlZCB1cG9uIHRoZSBtZXNzYWdlIGl0ZW1zXG5cdCAqIEJ1dHRvblR5cGU6ICBQb3NzaWJsZSBzZXR0aW5ncyBmb3Igd2FybmluZyBhbmQgZXJyb3IgbWVzc2FnZXMgYXJlICdjcml0aWNhbCcgYW5kICduZWdhdGl2ZScuXG5cdCAqXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc2V0TWVzc2FnZURhdGEoKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX3NldE1lc3NhZ2VEYXRhVGltZW91dCk7XG5cblx0XHR0aGlzLl9zZXRNZXNzYWdlRGF0YVRpbWVvdXQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcblx0XHRcdGNvbnN0IHNJY29uID0gXCJcIixcblx0XHRcdFx0b01lc3NhZ2VzID0gdGhpcy5vTWVzc2FnZVBvcG92ZXIuZ2V0SXRlbXMoKSxcblx0XHRcdFx0b01lc3NhZ2VDb3VudDogTWVzc2FnZUNvdW50ID0geyBFcnJvcjogMCwgV2FybmluZzogMCwgU3VjY2VzczogMCwgSW5mb3JtYXRpb246IDAgfSxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSxcblx0XHRcdFx0aU1lc3NhZ2VMZW5ndGggPSBvTWVzc2FnZXMubGVuZ3RoO1xuXHRcdFx0bGV0IHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5EZWZhdWx0LFxuXHRcdFx0XHRzTWVzc2FnZUtleSA9IFwiXCIsXG5cdFx0XHRcdHNUb29sdGlwVGV4dCA9IFwiXCIsXG5cdFx0XHRcdHNNZXNzYWdlVGV4dCA9IFwiXCI7XG5cdFx0XHRpZiAoaU1lc3NhZ2VMZW5ndGggPiAwKSB7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaU1lc3NhZ2VMZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmICghb01lc3NhZ2VzW2ldLmdldFR5cGUoKSB8fCBvTWVzc2FnZXNbaV0uZ2V0VHlwZSgpID09PSBcIlwiKSB7XG5cdFx0XHRcdFx0XHQrK29NZXNzYWdlQ291bnRbXCJJbmZvcm1hdGlvblwiXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0KytvTWVzc2FnZUNvdW50W29NZXNzYWdlc1tpXS5nZXRUeXBlKCkgYXMga2V5b2YgTWVzc2FnZUNvdW50XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuRXJyb3JdID4gMCkge1xuXHRcdFx0XHRcdHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5OZWdhdGl2ZTtcblx0XHRcdFx0fSBlbHNlIGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLldhcm5pbmddID4gMCkge1xuXHRcdFx0XHRcdHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5Dcml0aWNhbDtcblx0XHRcdFx0fSBlbHNlIGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLlN1Y2Nlc3NdID4gMCkge1xuXHRcdFx0XHRcdHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5TdWNjZXNzO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuSW5mb3JtYXRpb25dID4gMCkge1xuXHRcdFx0XHRcdHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5OZXV0cmFsO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgdG90YWxOdW1iZXJPZk1lc3NhZ2VzID1cblx0XHRcdFx0XHRvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLkVycm9yXSArXG5cdFx0XHRcdFx0b01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5XYXJuaW5nXSArXG5cdFx0XHRcdFx0b01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5TdWNjZXNzXSArXG5cdFx0XHRcdFx0b01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5JbmZvcm1hdGlvbl07XG5cblx0XHRcdFx0dGhpcy5zZXRUZXh0KHRvdGFsTnVtYmVyT2ZNZXNzYWdlcy50b1N0cmluZygpKTtcblxuXHRcdFx0XHRpZiAob01lc3NhZ2VDb3VudC5FcnJvciA9PT0gMSkge1xuXHRcdFx0XHRcdHNNZXNzYWdlS2V5ID0gXCJDX0NPTU1PTl9TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX0VSUk9SXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudC5FcnJvciA+IDEpIHtcblx0XHRcdFx0XHRzTWVzc2FnZUtleSA9IFwiQ19DT01NT05fU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9NVUxUSVBMRV9FUlJPUl9UT09MVElQXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIW9NZXNzYWdlQ291bnQuRXJyb3IgJiYgb01lc3NhZ2VDb3VudC5XYXJuaW5nKSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VLZXkgPSBcIkNfQ09NTU9OX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfV0FSTklOR19UT09MVElQXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIW9NZXNzYWdlQ291bnQuRXJyb3IgJiYgIW9NZXNzYWdlQ291bnQuV2FybmluZyAmJiBvTWVzc2FnZUNvdW50LkluZm9ybWF0aW9uKSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VLZXkgPSBcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX0lORk9cIjtcblx0XHRcdFx0fSBlbHNlIGlmICghb01lc3NhZ2VDb3VudC5FcnJvciAmJiAhb01lc3NhZ2VDb3VudC5XYXJuaW5nICYmICFvTWVzc2FnZUNvdW50LkluZm9ybWF0aW9uICYmIG9NZXNzYWdlQ291bnQuU3VjY2Vzcykge1xuXHRcdFx0XHRcdHNNZXNzYWdlS2V5ID0gXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRV9TVUNDRVNTXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNNZXNzYWdlS2V5KSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VUZXh0ID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoc01lc3NhZ2VLZXkpO1xuXHRcdFx0XHRcdHNUb29sdGlwVGV4dCA9IG9NZXNzYWdlQ291bnQuRXJyb3IgPyBgJHtvTWVzc2FnZUNvdW50LkVycm9yfSAke3NNZXNzYWdlVGV4dH1gIDogc01lc3NhZ2VUZXh0O1xuXHRcdFx0XHRcdHRoaXMuc2V0VG9vbHRpcChzVG9vbHRpcFRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2V0SWNvbihzSWNvbik7XG5cdFx0XHRcdHRoaXMuc2V0VHlwZShzQnV0dG9uVHlwZSk7XG5cdFx0XHRcdHRoaXMuc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb3JlLmJ5SWQodGhpcy5zVmlld0lkKSBhcyBWaWV3O1xuXHRcdFx0XHRpZiAob1ZpZXcpIHtcblx0XHRcdFx0XHRjb25zdCBvUGFnZVJlYWR5ID0gKG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikucGFnZVJlYWR5O1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBvUGFnZVJlYWR5LndhaXRQYWdlUmVhZHkoKTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX2FwcGx5R3JvdXBpbmdBc3luYyhvVmlldyk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJmYWlsIGdyb3VwaW5nIG1lc3NhZ2VzXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVNZXNzYWdlQ2hhbmdlKHtcblx0XHRcdFx0XHRcdGlNZXNzYWdlTGVuZ3RoOiBpTWVzc2FnZUxlbmd0aFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChpTWVzc2FnZUxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHR0aGlzLm9NZXNzYWdlUG9wb3Zlci5uYXZpZ2F0ZUJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdFx0KHRoaXMgYXMgYW55KS5maXJlTWVzc2FnZUNoYW5nZSh7XG5cdFx0XHRcdFx0aU1lc3NhZ2VMZW5ndGg6IGlNZXNzYWdlTGVuZ3RoXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIDEwMCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB3aGVuIGEgdXNlciBjbGlja3Mgb24gdGhlIHRpdGxlIG9mIHRoZSBtZXNzYWdlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2FjdGl2ZVRpdGxlUHJlc3Ncblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIG9FdmVudCBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gdGhlIGhhbmRsZXJcblx0ICovXG5cdGFzeW5jIF9hY3RpdmVUaXRsZVByZXNzKG9FdmVudDogQ29yZUV2ZW50KSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRCaW5kaW5nQ29udGV4dChcInBhZ2VJbnRlcm5hbFwiKTtcblx0XHQob0ludGVybmFsTW9kZWxDb250ZXh0IGFzIGFueSkuc2V0UHJvcGVydHkoXCJlcnJvck5hdmlnYXRpb25TZWN0aW9uRmxhZ1wiLCB0cnVlKTtcblx0XHRjb25zdCBvSXRlbSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJpdGVtXCIpLFxuXHRcdFx0b01lc3NhZ2UgPSBvSXRlbS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCksXG5cdFx0XHRiSXNCYWNrZW5kTWVzc2FnZSA9IG5ldyBSZWdFeHAoXCJeL1wiKS50ZXN0KG9NZXNzYWdlLmdldFRhcmdldCgpKSxcblx0XHRcdG9WaWV3ID0gQ29yZS5ieUlkKHRoaXMuc1ZpZXdJZCkgYXMgVmlldztcblx0XHRsZXQgb0NvbnRyb2wsIHNTZWN0aW9uVGl0bGU7XG5cdFx0Y29uc3QgX2RlZmF1bHRGb2N1cyA9IGZ1bmN0aW9uIChtZXNzYWdlOiBhbnksIG1kY1RhYmxlOiBhbnkpIHtcblx0XHRcdGNvbnN0IGZvY3VzSW5mbyA9IHsgcHJldmVudFNjcm9sbDogdHJ1ZSwgdGFyZ2V0SW5mbzogbWVzc2FnZSB9O1xuXHRcdFx0bWRjVGFibGUuZm9jdXMoZm9jdXNJbmZvKTtcblx0XHR9O1xuXG5cdFx0Ly9jaGVjayBpZiB0aGUgcHJlc3NlZCBpdGVtIGlzIHJlbGF0ZWQgdG8gYSB0YWJsZSBjb250cm9sXG5cdFx0aWYgKG9JdGVtLmdldEdyb3VwTmFtZSgpLmluZGV4T2YoXCJUYWJsZTpcIikgIT09IC0xKSB7XG5cdFx0XHRsZXQgb1RhcmdldE1kY1RhYmxlOiBhbnk7XG5cdFx0XHRpZiAoYklzQmFja2VuZE1lc3NhZ2UpIHtcblx0XHRcdFx0b1RhcmdldE1kY1RhYmxlID0gb01lc3NhZ2UuY29udHJvbElkc1xuXHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHNDb250cm9sSWQ6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0Y29uc3QgY29udHJvbCA9IENvcmUuYnlJZChzQ29udHJvbElkKTtcblx0XHRcdFx0XHRcdGNvbnN0IG9QYXJlbnRDb250cm9sID0gY29udHJvbCAmJiAoY29udHJvbC5nZXRQYXJlbnQoKSBhcyBhbnkpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9QYXJlbnRDb250cm9sICYmXG5cdFx0XHRcdFx0XHRcdG9QYXJlbnRDb250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgJiZcblx0XHRcdFx0XHRcdFx0b1BhcmVudENvbnRyb2wuZ2V0SGVhZGVyKCkgPT09IG9JdGVtLmdldEdyb3VwTmFtZSgpLnNwbGl0KFwiLCBUYWJsZTogXCIpWzFdXG5cdFx0XHRcdFx0XHRcdD8gb1BhcmVudENvbnRyb2xcblx0XHRcdFx0XHRcdFx0OiBudWxsO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYWNjOiBhbnksIHZhbDogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsID8gdmFsIDogYWNjO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAob1RhcmdldE1kY1RhYmxlKSB7XG5cdFx0XHRcdFx0c1NlY3Rpb25UaXRsZSA9IG9JdGVtLmdldEdyb3VwTmFtZSgpLnNwbGl0KFwiLCBcIilbMF07XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25UYWJsZUluSWNvblRhYkJhck1vZGUoXG5cdFx0XHRcdFx0XHRcdG9UYXJnZXRNZGNUYWJsZSxcblx0XHRcdFx0XHRcdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCxcblx0XHRcdFx0XHRcdFx0c1NlY3Rpb25UaXRsZVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGNvbnN0IG9SZWZFcnJvckNvbnRleHQgPSB0aGlzLl9nZXRUYWJsZVJlZkVycm9yQ29udGV4dChvVGFyZ2V0TWRjVGFibGUpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1JlZkVycm9yID0gb1JlZkVycm9yQ29udGV4dC5nZXRQcm9wZXJ0eShvSXRlbS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCkuZ2V0SWQoKSk7XG5cdFx0XHRcdFx0XHRjb25zdCBfc2V0Rm9jdXNPblRhcmdldEZpZWxkID0gYXN5bmMgKHRhcmdldE1kY1RhYmxlOiBhbnksIGlSb3dJbmRleDogbnVtYmVyKTogUHJvbWlzZTxhbnk+ID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYVRhcmdldE1kY1RhYmxlUm93ID0gdGhpcy5fZ2V0TWRjVGFibGVSb3dzKHRhcmdldE1kY1RhYmxlKSxcblx0XHRcdFx0XHRcdFx0XHRpRmlyc3RWaXNpYmxlUm93ID0gdGhpcy5fZ2V0R3JpZFRhYmxlKHRhcmdldE1kY1RhYmxlKS5nZXRGaXJzdFZpc2libGVSb3coKTtcblx0XHRcdFx0XHRcdFx0aWYgKGFUYXJnZXRNZGNUYWJsZVJvdy5sZW5ndGggPiAwICYmIGFUYXJnZXRNZGNUYWJsZVJvd1swXSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9UYXJnZXRSb3cgPSBhVGFyZ2V0TWRjVGFibGVSb3dbaVJvd0luZGV4IC0gaUZpcnN0VmlzaWJsZVJvd10sXG5cdFx0XHRcdFx0XHRcdFx0XHRvVGFyZ2V0Q2VsbCA9IHRoaXMuZ2V0VGFyZ2V0Q2VsbChvVGFyZ2V0Um93LCBvTWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9UYXJnZXRDZWxsKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLnNldEZvY3VzVG9Db250cm9sKG9UYXJnZXRDZWxsKTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNvbnRyb2wgbm90IGZvdW5kIG9uIHRhYmxlXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBlcnJvclByb3BlcnR5ID0gb01lc3NhZ2UuZ2V0VGFyZ2V0KCkuc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGVycm9yUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0KG9WaWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsKS5zZXRQcm9wZXJ0eShcIi9tZXNzYWdlVGFyZ2V0UHJvcGVydHlcIiwgZXJyb3JQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5fbmF2aWdhdGlvbkNvbmZpZ3VyZWQodGFyZ2V0TWRjVGFibGUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiAob1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fcm91dGluZy5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1RhcmdldFJvdy5nZXRCaW5kaW5nQ29udGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0aWYgKG9UYXJnZXRNZGNUYWJsZS5kYXRhKFwidGFibGVUeXBlXCIpID09PSBcIkdyaWRUYWJsZVwiICYmIG9SZWZFcnJvci5yb3dJbmRleCAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBpRmlyc3RWaXNpYmxlUm93ID0gdGhpcy5fZ2V0R3JpZFRhYmxlKG9UYXJnZXRNZGNUYWJsZSkuZ2V0Rmlyc3RWaXNpYmxlUm93KCk7XG5cdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgb1RhcmdldE1kY1RhYmxlLnNjcm9sbFRvSW5kZXgob1JlZkVycm9yLnJvd0luZGV4KTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBhVGFyZ2V0TWRjVGFibGVSb3cgPSB0aGlzLl9nZXRNZGNUYWJsZVJvd3Mob1RhcmdldE1kY1RhYmxlKTtcblx0XHRcdFx0XHRcdFx0XHRsZXQgaU5ld0ZpcnN0VmlzaWJsZVJvdywgYlNjcm9sbE5lZWRlZDtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYVRhcmdldE1kY1RhYmxlUm93Lmxlbmd0aCA+IDAgJiYgYVRhcmdldE1kY1RhYmxlUm93WzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpTmV3Rmlyc3RWaXNpYmxlUm93ID0gYVRhcmdldE1kY1RhYmxlUm93WzBdLmdldFBhcmVudCgpLmdldEZpcnN0VmlzaWJsZVJvdygpO1xuXHRcdFx0XHRcdFx0XHRcdFx0YlNjcm9sbE5lZWRlZCA9IGlGaXJzdFZpc2libGVSb3cgLSBpTmV3Rmlyc3RWaXNpYmxlUm93ICE9PSAwO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRsZXQgb1dhaXRDb250cm9sSWRBZGRlZDogUHJvbWlzZTx2b2lkPjtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYlNjcm9sbE5lZWRlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly9UaGUgc2Nyb2xsVG9JbmRleCBmdW5jdGlvbiBkb2VzIG5vdCB3YWl0IGZvciB0aGUgVUkgdXBkYXRlLiBBcyBhIHdvcmthcm91bmQsIHBlbmRpbmcgYSBmaXggZnJvbSBNREMgKEJDUDogMjE3MDI1MTYzMSkgd2UgdXNlIHRoZSBldmVudCBcIlVJVXBkYXRlZFwiLlxuXHRcdFx0XHRcdFx0XHRcdFx0b1dhaXRDb250cm9sSWRBZGRlZCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdENvcmUuYXR0YWNoRXZlbnQoXCJVSVVwZGF0ZWRcIiwgcmVzb2x2ZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0b1dhaXRDb250cm9sSWRBZGRlZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBvV2FpdENvbnRyb2xJZEFkZGVkO1xuXHRcdFx0XHRcdFx0XHRcdHNldFRpbWVvdXQoYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZm9jdXNPblRhcmdldEZpZWxkID0gYXdhaXQgX3NldEZvY3VzT25UYXJnZXRGaWVsZChvVGFyZ2V0TWRjVGFibGUsIG9SZWZFcnJvci5yb3dJbmRleCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZm9jdXNPblRhcmdldEZpZWxkID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRfZGVmYXVsdEZvY3VzKG9NZXNzYWdlLCBvVGFyZ2V0TWRjVGFibGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBmb2N1c2luZyBvbiBlcnJvclwiKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChvVGFyZ2V0TWRjVGFibGUuZGF0YShcInRhYmxlVHlwZVwiKSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIiAmJiBvUmVmRXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sID0gYXdhaXQgdGhpcy5mb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2woXG5cdFx0XHRcdFx0XHRcdFx0b1ZpZXcsXG5cdFx0XHRcdFx0XHRcdFx0b01lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdFx0b1RhcmdldE1kY1RhYmxlLFxuXHRcdFx0XHRcdFx0XHRcdG9SZWZFcnJvci5yb3dJbmRleFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRpZiAoZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdFx0XHRcdF9kZWZhdWx0Rm9jdXMob01lc3NhZ2UsIG9UYXJnZXRNZGNUYWJsZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sKG9WaWV3LCBvTWVzc2FnZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJGYWlsIHRvIG5hdmlnYXRlIHRvIEVycm9yIGNvbnRyb2xcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvQ29udHJvbCA9IENvcmUuYnlJZChvTWVzc2FnZS5jb250cm9sSWRzWzBdKTtcblx0XHRcdFx0Ly9JZiB0aGUgY29udHJvbCB1bmRlcmx5aW5nIHRoZSBmcm9udEVuZCBtZXNzYWdlIGlzIG5vdCB3aXRoaW4gdGhlIGN1cnJlbnQgc2VjdGlvbiwgd2UgZmlyc3QgZ28gaW50byB0aGUgdGFyZ2V0IHNlY3Rpb246XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RlZFNlY3Rpb246IGFueSA9IENvcmUuYnlJZCh0aGlzLm9PYmplY3RQYWdlTGF5b3V0LmdldFNlbGVjdGVkU2VjdGlvbigpKTtcblx0XHRcdFx0aWYgKG9TZWxlY3RlZFNlY3Rpb24/LmZpbmRFbGVtZW50cyh0cnVlKS5pbmRleE9mKG9Db250cm9sKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRzU2VjdGlvblRpdGxlID0gb0l0ZW0uZ2V0R3JvdXBOYW1lKCkuc3BsaXQoXCIsIFwiKVswXTtcblx0XHRcdFx0XHR0aGlzLl9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZSh0aGlzLm9PYmplY3RQYWdlTGF5b3V0LCBzU2VjdGlvblRpdGxlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldEZvY3VzVG9Db250cm9sKG9Db250cm9sKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZm9jdXMgb24gY29udHJvbFxuXHRcdFx0c1NlY3Rpb25UaXRsZSA9IG9JdGVtLmdldEdyb3VwTmFtZSgpLnNwbGl0KFwiLCBcIilbMF07XG5cdFx0XHR0aGlzLl9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZSh0aGlzLm9PYmplY3RQYWdlTGF5b3V0LCBzU2VjdGlvblRpdGxlKTtcblx0XHRcdHRoaXMuZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sKG9WaWV3LCBvTWVzc2FnZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyBhIHRhYmxlIGNlbGwgdGFyZ2V0ZWQgYnkgYSBtZXNzYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0Um93IEEgdGFibGUgcm93XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBtZXNzYWdlIE1lc3NhZ2UgdGFyZ2V0aW5nIGEgY2VsbFxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSBSZXR1cm5zIHRoZSBjZWxsXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRnZXRUYXJnZXRDZWxsKHRhcmdldFJvdzogQ29sdW1uTGlzdEl0ZW0sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBVSTVFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0Q29udHJvbElkcygpLmxlbmd0aCA+IDBcblx0XHRcdD8gbWVzc2FnZVxuXHRcdFx0XHRcdC5nZXRDb250cm9sSWRzKClcblx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChjb250cm9sSWQ6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0Y29uc3QgaXNDb250cm9sSW5UYWJsZSA9ICh0YXJnZXRSb3cgYXMgYW55KS5maW5kRWxlbWVudHModHJ1ZSwgZnVuY3Rpb24gKGVsZW06IGFueSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZWxlbS5nZXRJZCgpID09PSBjb250cm9sSWQ7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHJldHVybiBpc0NvbnRyb2xJblRhYmxlLmxlbmd0aCA+IDAgPyBDb3JlLmJ5SWQoY29udHJvbElkKSA6IG51bGw7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhY2M6IGFueSwgdmFsOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiB2YWwgPyB2YWwgOiBhY2M7XG5cdFx0XHRcdFx0fSlcblx0XHRcdDogbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBGb2N1cyBvbiB0aGUgY29udHJvbCB0YXJnZXRlZCBieSBhIG1lc3NhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3IFRoZSBjdXJyZW50IHZpZXdcblx0ICogQHBhcmFtIHtvYmplY3R9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdGFyZ2V0aW5nIHRoZSBjb250cm9sIG9uIHdoaWNoIHdlIHdhbnQgdG8gc2V0IHRoZSBmb2N1c1xuXHQgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0TWRjVGFibGUgVGhlIHRhYmxlIHRhcmdldGVkIGJ5IHRoZSBtZXNzYWdlIChvcHRpb25hbClcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJvd0luZGV4IFRoZSByb3cgaW5kZXggb2YgdGhlIHRhYmxlIHRhcmdldGVkIGJ5IHRoZSBtZXNzYWdlIChvcHRpb25hbClcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFzeW5jIGZvY3VzT25NZXNzYWdlVGFyZ2V0Q29udHJvbCh2aWV3OiBWaWV3LCBtZXNzYWdlOiBNZXNzYWdlLCB0YXJnZXRNZGNUYWJsZT86IGFueSwgcm93SW5kZXg/OiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IGFBbGxWaWV3RWxlbWVudHMgPSB2aWV3LmZpbmRFbGVtZW50cyh0cnVlKTtcblx0XHRjb25zdCBhRXJyb25lb3VzQ29udHJvbHMgPSBtZXNzYWdlXG5cdFx0XHQuZ2V0Q29udHJvbElkcygpXG5cdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChzQ29udHJvbElkOiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIGFBbGxWaWV3RWxlbWVudHMuc29tZShmdW5jdGlvbiAob0VsZW0pIHtcblx0XHRcdFx0XHRyZXR1cm4gb0VsZW0uZ2V0SWQoKSA9PT0gc0NvbnRyb2xJZCAmJiBvRWxlbS5nZXREb21SZWYoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdFx0Lm1hcChmdW5jdGlvbiAoc0NvbnRyb2xJZDogc3RyaW5nKSB7XG5cdFx0XHRcdHJldHVybiBDb3JlLmJ5SWQoc0NvbnRyb2xJZCk7XG5cdFx0XHR9KTtcblx0XHRjb25zdCBhTm90VGFibGVFcnJvbmVvdXNDb250cm9scyA9IGFFcnJvbmVvdXNDb250cm9scy5maWx0ZXIoZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRcdHJldHVybiAhb0VsZW0uaXNBKFwic2FwLm0uVGFibGVcIikgJiYgIW9FbGVtLmlzQShcInNhcC51aS50YWJsZS5UYWJsZVwiKTtcblx0XHR9KTtcblx0XHQvL1RoZSBmb2N1cyBpcyBzZXQgb24gTm90IFRhYmxlIGNvbnRyb2wgaW4gcHJpb3JpdHlcblx0XHRpZiAoYU5vdFRhYmxlRXJyb25lb3VzQ29udHJvbHMubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5zZXRGb2N1c1RvQ29udHJvbChhTm90VGFibGVFcnJvbmVvdXNDb250cm9sc1swXSk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSBpZiAoYUVycm9uZW91c0NvbnRyb2xzLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IGFUYXJnZXRNZGNUYWJsZVJvdyA9IHRhcmdldE1kY1RhYmxlXG5cdFx0XHRcdD8gdGFyZ2V0TWRjVGFibGUuZmluZEVsZW1lbnRzKHRydWUsIGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0VsZW0uaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKTtcblx0XHRcdFx0ICB9KVxuXHRcdFx0XHQ6IFtdO1xuXHRcdFx0aWYgKGFUYXJnZXRNZGNUYWJsZVJvdy5sZW5ndGggPiAwICYmIGFUYXJnZXRNZGNUYWJsZVJvd1swXSkge1xuXHRcdFx0XHRjb25zdCBvVGFyZ2V0Um93ID0gYVRhcmdldE1kY1RhYmxlUm93W3Jvd0luZGV4IGFzIG51bWJlcl07XG5cdFx0XHRcdGNvbnN0IG9UYXJnZXRDZWxsID0gdGhpcy5nZXRUYXJnZXRDZWxsKG9UYXJnZXRSb3csIG1lc3NhZ2UpIGFzIGFueTtcblx0XHRcdFx0aWYgKG9UYXJnZXRDZWxsKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RhcmdldEZpZWxkID0gb1RhcmdldENlbGwuaXNBKFwic2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEFQSVwiKVxuXHRcdFx0XHRcdFx0PyBvVGFyZ2V0Q2VsbC5nZXRDb250ZW50KCkuZ2V0Q29udGVudEVkaXQoKVswXVxuXHRcdFx0XHRcdFx0OiBvVGFyZ2V0Q2VsbC5nZXRJdGVtcygpWzBdLmdldENvbnRlbnQoKS5nZXRDb250ZW50RWRpdCgpWzBdO1xuXHRcdFx0XHRcdHRoaXMuc2V0Rm9jdXNUb0NvbnRyb2wob1RhcmdldEZpZWxkKTtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGVycm9yUHJvcGVydHkgPSBtZXNzYWdlLmdldFRhcmdldCgpLnNwbGl0KFwiL1wiKS5wb3AoKTtcblx0XHRcdFx0XHRpZiAoZXJyb3JQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0KHZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwpLnNldFByb3BlcnR5KFwiL21lc3NhZ2VUYXJnZXRQcm9wZXJ0eVwiLCBlcnJvclByb3BlcnR5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRoaXMuX25hdmlnYXRpb25Db25maWd1cmVkKHRhcmdldE1kY1RhYmxlKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICh2aWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX3JvdXRpbmcubmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KG9UYXJnZXRSb3cuZ2V0QmluZGluZ0NvbnRleHQoKSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIG9iaiBUaGUgbWVzc2FnZSBvYmplY3Rcblx0ICogQHBhcmFtIGFTZWN0aW9ucyBUaGUgYXJyYXkgb2Ygc2VjdGlvbnMgaW4gdGhlIG9iamVjdCBwYWdlXG5cdCAqIEByZXR1cm5zIFRoZSByYW5rIG9mIHRoZSBtZXNzYWdlXG5cdCAqL1xuXHRfZ2V0TWVzc2FnZVJhbmsob2JqOiBhbnksIGFTZWN0aW9uczogYW55W10pIHtcblx0XHRpZiAoYVNlY3Rpb25zKSB7XG5cdFx0XHRsZXQgc2VjdGlvbiwgYVN1YlNlY3Rpb25zLCBzdWJTZWN0aW9uLCBqLCBrLCBhRWxlbWVudHMsIGFBbGxFbGVtZW50cywgc2VjdGlvblJhbms7XG5cdFx0XHRmb3IgKGogPSBhU2VjdGlvbnMubGVuZ3RoIC0gMTsgaiA+PSAwOyAtLWopIHtcblx0XHRcdFx0Ly8gTG9vcCBvdmVyIGFsbCBzZWN0aW9uc1xuXHRcdFx0XHRzZWN0aW9uID0gYVNlY3Rpb25zW2pdO1xuXHRcdFx0XHRhU3ViU2VjdGlvbnMgPSBzZWN0aW9uLmdldFN1YlNlY3Rpb25zKCk7XG5cdFx0XHRcdGZvciAoayA9IGFTdWJTZWN0aW9ucy5sZW5ndGggLSAxOyBrID49IDA7IC0taykge1xuXHRcdFx0XHRcdC8vIExvb3Agb3ZlciBhbGwgc3ViLXNlY3Rpb25zXG5cdFx0XHRcdFx0c3ViU2VjdGlvbiA9IGFTdWJTZWN0aW9uc1trXTtcblx0XHRcdFx0XHRhQWxsRWxlbWVudHMgPSBzdWJTZWN0aW9uLmZpbmRFbGVtZW50cyh0cnVlKTsgLy8gR2V0IGFsbCBlbGVtZW50cyBpbnNpZGUgYSBzdWItc2VjdGlvblxuXHRcdFx0XHRcdC8vVHJ5IHRvIGZpbmQgdGhlIGNvbnRyb2wgMSBpbnNpZGUgdGhlIHN1YiBzZWN0aW9uXG5cdFx0XHRcdFx0YUVsZW1lbnRzID0gYUFsbEVsZW1lbnRzLmZpbHRlcih0aGlzLl9mbkZpbHRlclVwb25JZC5iaW5kKHRoaXMsIG9iai5nZXRDb250cm9sSWQoKSkpO1xuXHRcdFx0XHRcdHNlY3Rpb25SYW5rID0gaiArIDE7XG5cdFx0XHRcdFx0aWYgKGFFbGVtZW50cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRpZiAoc2VjdGlvbi5nZXRWaXNpYmxlKCkgJiYgc3ViU2VjdGlvbi5nZXRWaXNpYmxlKCkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKCFvYmouaGFzT3duUHJvcGVydHkoXCJzZWN0aW9uTmFtZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRcdG9iai5zZWN0aW9uTmFtZSA9IHNlY3Rpb24uZ2V0VGl0bGUoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShcInN1YlNlY3Rpb25OYW1lXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0b2JqLnN1YlNlY3Rpb25OYW1lID0gc3ViU2VjdGlvbi5nZXRUaXRsZSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWN0aW9uUmFuayAqIDEwICsgKGsgKyAxKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIGlmIHNlY3Rpb24gb3Igc3Vic2VjdGlvbiBpcyBpbnZpc2libGUgdGhlbiBncm91cCBuYW1lIHdvdWxkIGJlIExhc3QgQWN0aW9uXG5cdFx0XHRcdFx0XHRcdC8vIHNvIHJhbmtpbmcgc2hvdWxkIGJlIGxvd2VyXG5cdFx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly9pZiBzdWIgc2VjdGlvbiB0aXRsZSBpcyBPdGhlciBtZXNzYWdlcywgd2UgcmV0dXJuIGEgaGlnaCBudW1iZXIocmFuayksIHdoaWNoIGVuc3VyZXNcblx0XHRcdC8vdGhhdCBtZXNzYWdlcyBiZWxvbmdpbmcgdG8gdGhpcyBzdWIgc2VjdGlvbiBhbHdheXMgY29tZSBsYXRlciBpbiBtZXNzYWdlUG9wb3ZlclxuXHRcdFx0aWYgKCFvYmouc2VjdGlvbk5hbWUgJiYgIW9iai5zdWJTZWN0aW9uTmFtZSAmJiBvYmoucGVyc2lzdGVudCkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiA5OTk7XG5cdFx0fVxuXHRcdHJldHVybiA5OTk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHNldCB0aGUgZmlsdGVycyBiYXNlZCB1cG9uIHRoZSBtZXNzYWdlIGl0ZW1zXG5cdCAqIFRoZSBkZXNpcmVkIGZpbHRlciBvcGVyYXRpb24gaXM6XG5cdCAqICggZmlsdGVycyBwcm92aWRlZCBieSB1c2VyICYmICggdmFsaWRhdGlvbiA9IHRydWUgJiYgQ29udHJvbCBzaG91bGQgYmUgcHJlc2VudCBpbiB2aWV3ICkgfHwgbWVzc2FnZXMgZm9yIHRoZSBjdXJyZW50IG1hdGNoaW5nIGNvbnRleHQgKS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9hcHBseUZpbHRlcnNBbmRTb3J0KCkge1xuXHRcdGxldCBvVmFsaWRhdGlvbkZpbHRlcnMsXG5cdFx0XHRvVmFsaWRhdGlvbkFuZENvbnRleHRGaWx0ZXIsXG5cdFx0XHRvRmlsdGVycyxcblx0XHRcdHNQYXRoLFxuXHRcdFx0b1NvcnRlcixcblx0XHRcdG9EaWFsb2dGaWx0ZXIsXG5cdFx0XHRvYmplY3RQYWdlTGF5b3V0U2VjdGlvbnM6IGFueSA9IG51bGw7XG5cdFx0Y29uc3QgYVVzZXJEZWZpbmVkRmlsdGVyOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IGZpbHRlck91dE1lc3NhZ2VzSW5EaWFsb2cgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBmblRlc3QgPSAoYUNvbnRyb2xJZHM6IHN0cmluZ1tdKSA9PiB7XG5cdFx0XHRcdGxldCBpbmRleCA9IEluZmluaXR5LFxuXHRcdFx0XHRcdG9Db250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKSBhcyBhbnk7XG5cdFx0XHRcdGNvbnN0IGVycm9yRmllbGRDb250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKTtcblx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmllbGRSYW5raW5EaWFsb2cgPVxuXHRcdFx0XHRcdFx0b0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2dcblx0XHRcdFx0XHRcdFx0PyAoZXJyb3JGaWVsZENvbnRyb2w/LmdldFBhcmVudCgpIGFzIGFueSkuZmluZEVsZW1lbnRzKHRydWUpLmluZGV4T2YoZXJyb3JGaWVsZENvbnRyb2wpXG5cdFx0XHRcdFx0XHRcdDogSW5maW5pdHk7XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sIGluc3RhbmNlb2YgRGlhbG9nKSB7XG5cdFx0XHRcdFx0XHRpZiAoaW5kZXggPiBmaWVsZFJhbmtpbkRpYWxvZykge1xuXHRcdFx0XHRcdFx0XHRpbmRleCA9IGZpZWxkUmFua2luRGlhbG9nO1xuXHRcdFx0XHRcdFx0XHQvLyBTZXQgdGhlIGZvY3VzIHRvIHRoZSBkaWFsb2cncyBjb250cm9sXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0Rm9jdXNUb0NvbnRyb2woZXJyb3JGaWVsZENvbnRyb2wpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gbWVzc2FnZXMgZm9yIHNhcC5tLkRpYWxvZyBzaG91bGQgbm90IGFwcGVhciBpbiB0aGUgbWVzc2FnZSBidXR0b25cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7XG5cdFx0XHRcdHBhdGg6IFwiY29udHJvbElkc1wiLFxuXHRcdFx0XHR0ZXN0OiBmblRlc3QsXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IHRydWVcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0Ly9GaWx0ZXIgZnVuY3Rpb24gdG8gdmVyaWZ5IGlmIHRoZSBjb250cm9sIGlzIHBhcnQgb2YgdGhlIGN1cnJlbnQgdmlldyBvciBub3Rcblx0XHRmdW5jdGlvbiBnZXRDaGVja0NvbnRyb2xJblZpZXdGaWx0ZXIoKSB7XG5cdFx0XHRjb25zdCBmblRlc3QgPSBmdW5jdGlvbiAoYUNvbnRyb2xJZHM6IHN0cmluZ1tdKSB7XG5cdFx0XHRcdGlmICghYUNvbnRyb2xJZHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBvQ29udHJvbDogYW55ID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKTtcblx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sLmdldElkKCkgPT09IHNWaWV3SWQpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAob0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2cpIHtcblx0XHRcdFx0XHRcdC8vIG1lc3NhZ2VzIGZvciBzYXAubS5EaWFsb2cgc2hvdWxkIG5vdCBhcHBlYXIgaW4gdGhlIG1lc3NhZ2UgYnV0dG9uXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0cGF0aDogXCJjb250cm9sSWRzXCIsXG5cdFx0XHRcdHRlc3Q6IGZuVGVzdCxcblx0XHRcdFx0Y2FzZVNlbnNpdGl2ZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmICghdGhpcy5zVmlld0lkKSB7XG5cdFx0XHR0aGlzLnNWaWV3SWQgPSB0aGlzLl9nZXRWaWV3SWQodGhpcy5nZXRJZCgpKSBhcyBzdHJpbmc7XG5cdFx0fVxuXHRcdGNvbnN0IHNWaWV3SWQgPSB0aGlzLnNWaWV3SWQ7XG5cdFx0Ly9BZGQgdGhlIGZpbHRlcnMgcHJvdmlkZWQgYnkgdGhlIHVzZXJcblx0XHRjb25zdCBhQ3VzdG9tRmlsdGVycyA9IHRoaXMuZ2V0QWdncmVnYXRpb24oXCJjdXN0b21GaWx0ZXJzXCIpIGFzIGFueTtcblx0XHRpZiAoYUN1c3RvbUZpbHRlcnMpIHtcblx0XHRcdGFDdXN0b21GaWx0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGZpbHRlcjogYW55KSB7XG5cdFx0XHRcdGFVc2VyRGVmaW5lZEZpbHRlci5wdXNoKFxuXHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogZmlsdGVyLmdldFByb3BlcnR5KFwicGF0aFwiKSxcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBmaWx0ZXIuZ2V0UHJvcGVydHkoXCJvcGVyYXRvclwiKSxcblx0XHRcdFx0XHRcdHZhbHVlMTogZmlsdGVyLmdldFByb3BlcnR5KFwidmFsdWUxXCIpLFxuXHRcdFx0XHRcdFx0dmFsdWUyOiBmaWx0ZXIuZ2V0UHJvcGVydHkoXCJ2YWx1ZTJcIilcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRpZiAoIW9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0dGhpcy5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdHJldHVybjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1BhdGggPSBvQmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0Ly9GaWx0ZXIgZm9yIGZpbHRlcmluZyBvdXQgb25seSB2YWxpZGF0aW9uIG1lc3NhZ2VzIHdoaWNoIGFyZSBjdXJyZW50bHkgcHJlc2VudCBpbiB0aGUgdmlld1xuXHRcdFx0b1ZhbGlkYXRpb25GaWx0ZXJzID0gbmV3IEZpbHRlcih7XG5cdFx0XHRcdGZpbHRlcnM6IFtcblx0XHRcdFx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRcdHBhdGg6IFwidmFsaWRhdGlvblwiLFxuXHRcdFx0XHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiB0cnVlXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0Z2V0Q2hlY2tDb250cm9sSW5WaWV3RmlsdGVyKClcblx0XHRcdFx0XSxcblx0XHRcdFx0YW5kOiB0cnVlXG5cdFx0XHR9KTtcblx0XHRcdC8vRmlsdGVyIGZvciBmaWx0ZXJpbmcgb3V0IHRoZSBib3VuZCBtZXNzYWdlcyBpLmUgdGFyZ2V0IHN0YXJ0cyB3aXRoIHRoZSBjb250ZXh0IHBhdGhcblx0XHRcdG9WYWxpZGF0aW9uQW5kQ29udGV4dEZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRmaWx0ZXJzOiBbXG5cdFx0XHRcdFx0b1ZhbGlkYXRpb25GaWx0ZXJzLFxuXHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogXCJ0YXJnZXRcIixcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5TdGFydHNXaXRoLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiBzUGF0aFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdFx0b0RpYWxvZ0ZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRmaWx0ZXJzOiBbZmlsdGVyT3V0TWVzc2FnZXNJbkRpYWxvZygpXVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9WYWxpZGF0aW9uQ29udGV4dERpYWxvZ0ZpbHRlcnMgPSBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IFtvVmFsaWRhdGlvbkFuZENvbnRleHRGaWx0ZXIsIG9EaWFsb2dGaWx0ZXJdLFxuXHRcdFx0YW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0Ly8gYW5kIGZpbmFsbHkgLSBpZiB0aGVyZSBhbnkgLSBhZGQgY3VzdG9tIGZpbHRlciAodmlhIE9SKVxuXHRcdGlmIChhVXNlckRlZmluZWRGaWx0ZXIubGVuZ3RoID4gMCkge1xuXHRcdFx0b0ZpbHRlcnMgPSBuZXcgKEZpbHRlciBhcyBhbnkpKHtcblx0XHRcdFx0ZmlsdGVyczogW2FVc2VyRGVmaW5lZEZpbHRlciwgb1ZhbGlkYXRpb25Db250ZXh0RGlhbG9nRmlsdGVyc10sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRmlsdGVycyA9IG9WYWxpZGF0aW9uQ29udGV4dERpYWxvZ0ZpbHRlcnM7XG5cdFx0fVxuXHRcdHRoaXMub0l0ZW1CaW5kaW5nLmZpbHRlcihvRmlsdGVycyk7XG5cdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXQodGhpcywgdGhpcy5vT2JqZWN0UGFnZUxheW91dCk7XG5cdFx0Ly8gV2Ugc3VwcG9ydCBzb3J0aW5nIG9ubHkgZm9yIE9iamVjdFBhZ2VMYXlvdXQgdXNlLWNhc2UuXG5cdFx0aWYgKHRoaXMub09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdG9Tb3J0ZXIgPSBuZXcgKFNvcnRlciBhcyBhbnkpKFwiXCIsIG51bGwsIG51bGwsIChvYmoxOiBhbnksIG9iajI6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoIW9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucykge1xuXHRcdFx0XHRcdG9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucyA9IHRoaXMub09iamVjdFBhZ2VMYXlvdXQgJiYgdGhpcy5vT2JqZWN0UGFnZUxheW91dC5nZXRTZWN0aW9ucygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHJhbmtBID0gdGhpcy5fZ2V0TWVzc2FnZVJhbmsob2JqMSwgb2JqZWN0UGFnZUxheW91dFNlY3Rpb25zKTtcblx0XHRcdFx0Y29uc3QgcmFua0IgPSB0aGlzLl9nZXRNZXNzYWdlUmFuayhvYmoyLCBvYmplY3RQYWdlTGF5b3V0U2VjdGlvbnMpO1xuXHRcdFx0XHRpZiAocmFua0EgPCByYW5rQikge1xuXHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmFua0EgPiByYW5rQikge1xuXHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLm9JdGVtQmluZGluZy5zb3J0KG9Tb3J0ZXIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NvbnRyb2xJZFxuXHQgKiBAcGFyYW0gb0l0ZW1cblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29udHJvbCBJRCBtYXRjaGVzIHRoZSBpdGVtIElEXG5cdCAqL1xuXHRfZm5GaWx0ZXJVcG9uSWQoc0NvbnRyb2xJZDogc3RyaW5nLCBvSXRlbTogYW55KSB7XG5cdFx0cmV0dXJuIHNDb250cm9sSWQgPT09IG9JdGVtLmdldElkKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBzZWN0aW9uIGJhc2VkIG9uIHNlY3Rpb24gdGl0bGUgYW5kIHZpc2liaWxpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvT2JqZWN0UGFnZSBPYmplY3QgcGFnZS5cblx0ICogQHBhcmFtIHNTZWN0aW9uVGl0bGUgU2VjdGlvbiB0aXRsZS5cblx0ICogQHJldHVybnMgVGhlIHNlY3Rpb25cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRTZWN0aW9uQnlTZWN0aW9uVGl0bGUob09iamVjdFBhZ2U6IGFueSwgc1NlY3Rpb25UaXRsZTogc3RyaW5nKSB7XG5cdFx0bGV0IG9TZWN0aW9uO1xuXHRcdGlmIChzU2VjdGlvblRpdGxlKSB7XG5cdFx0XHRjb25zdCBhU2VjdGlvbnMgPSBvT2JqZWN0UGFnZS5nZXRTZWN0aW9ucygpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhU2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGFTZWN0aW9uc1tpXS5nZXRWaXNpYmxlKCkgJiYgYVNlY3Rpb25zW2ldLmdldFRpdGxlKCkgPT09IHNTZWN0aW9uVGl0bGUpIHtcblx0XHRcdFx0XHRvU2VjdGlvbiA9IGFTZWN0aW9uc1tpXTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1NlY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIHRvIHRoZSBzZWN0aW9uIGlmIHRoZSBvYmplY3QgcGFnZSB1c2VzIGFuIEljb25UYWJCYXIgYW5kIGlmIHRoZSBjdXJyZW50IHNlY3Rpb24gaXMgbm90IHRoZSB0YXJnZXQgb2YgdGhlIG5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvT2JqZWN0UGFnZSBPYmplY3QgcGFnZS5cblx0ICogQHBhcmFtIHNTZWN0aW9uVGl0bGUgU2VjdGlvbiB0aXRsZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZShvT2JqZWN0UGFnZTogYW55LCBzU2VjdGlvblRpdGxlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBiVXNlSWNvblRhYkJhciA9IG9PYmplY3RQYWdlLmdldFVzZUljb25UYWJCYXIoKTtcblx0XHRpZiAoYlVzZUljb25UYWJCYXIpIHtcblx0XHRcdGNvbnN0IG9TZWN0aW9uID0gdGhpcy5fZ2V0U2VjdGlvbkJ5U2VjdGlvblRpdGxlKG9PYmplY3RQYWdlLCBzU2VjdGlvblRpdGxlKTtcblx0XHRcdGNvbnN0IHNTZWxlY3RlZFNlY3Rpb25JZCA9IG9PYmplY3RQYWdlLmdldFNlbGVjdGVkU2VjdGlvbigpO1xuXHRcdFx0aWYgKG9TZWN0aW9uICYmIHNTZWxlY3RlZFNlY3Rpb25JZCAhPT0gb1NlY3Rpb24uZ2V0SWQoKSkge1xuXHRcdFx0XHRvT2JqZWN0UGFnZS5zZXRTZWxlY3RlZFNlY3Rpb24ob1NlY3Rpb24uZ2V0SWQoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25UYWJsZUluSWNvblRhYkJhck1vZGUob1RhYmxlOiBhbnksIG9PYmplY3RQYWdlOiBhbnksIHNTZWN0aW9uVGl0bGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRjb25zdCBvVGFibGVDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb09QQ29udGV4dCA9IG9PYmplY3RQYWdlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3QgYlNob3VsZFdhaXRGb3JUYWJsZVJlZnJlc2ggPSAhKG9UYWJsZUNvbnRleHQgPT09IG9PUENvbnRleHQpO1xuXHRcdHRoaXMuX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25Jbkljb25UYWJCYXJNb2RlKG9PYmplY3RQYWdlLCBzU2VjdGlvblRpdGxlKTtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6IEZ1bmN0aW9uKSB7XG5cdFx0XHRpZiAoYlNob3VsZFdhaXRGb3JUYWJsZVJlZnJlc2gpIHtcblx0XHRcdFx0b1Jvd0JpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgTWRjVGFibGUgaWYgaXQgaXMgZm91bmQgYW1vbmcgYW55IG9mIHRoZSBwYXJlbnQgZWxlbWVudHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRWxlbWVudCBDb250cm9sXG5cdCAqIEByZXR1cm5zIE1EQyB0YWJsZSB8fCB1bmRlZmluZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRNZGNUYWJsZShvRWxlbWVudDogYW55KSB7XG5cdFx0Ly9jaGVjayBpZiB0aGUgZWxlbWVudCBoYXMgYSB0YWJsZSB3aXRoaW4gYW55IG9mIGl0cyBwYXJlbnRzXG5cdFx0bGV0IG9QYXJlbnRFbGVtZW50ID0gb0VsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0d2hpbGUgKG9QYXJlbnRFbGVtZW50ICYmICFvUGFyZW50RWxlbWVudC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpKSB7XG5cdFx0XHRvUGFyZW50RWxlbWVudCA9IG9QYXJlbnRFbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1BhcmVudEVsZW1lbnQgJiYgb1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSA/IG9QYXJlbnRFbGVtZW50IDogdW5kZWZpbmVkO1xuXHR9XG5cblx0X2dldEdyaWRUYWJsZShvTWRjVGFibGU6IGFueSkge1xuXHRcdHJldHVybiBvTWRjVGFibGUuZmluZEVsZW1lbnRzKHRydWUsIGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRvRWxlbS5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikgJiZcblx0XHRcdFx0LyoqIFdlIGNoZWNrIHRoZSBlbGVtZW50IGJlbG9uZ3MgdG8gdGhlIE1kY1RhYmxlIDoqL1xuXHRcdFx0XHRvRWxlbS5nZXRQYXJlbnQoKSA9PT0gb01kY1RhYmxlXG5cdFx0XHQpO1xuXHRcdH0pWzBdO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgdGFibGUgcm93IChpZiBhdmFpbGFibGUpIGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRWxlbWVudCBDb250cm9sXG5cdCAqIEByZXR1cm5zIFRhYmxlIHJvdyB8fCB1bmRlZmluZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRUYWJsZVJvdyhvRWxlbWVudDogYW55KSB7XG5cdFx0bGV0IG9QYXJlbnRFbGVtZW50ID0gb0VsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0d2hpbGUgKFxuXHRcdFx0b1BhcmVudEVsZW1lbnQgJiZcblx0XHRcdCFvUGFyZW50RWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpICYmXG5cdFx0XHQhb1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLkNyZWF0aW9uUm93XCIpICYmXG5cdFx0XHQhb1BhcmVudEVsZW1lbnQuaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKVxuXHRcdCkge1xuXHRcdFx0b1BhcmVudEVsZW1lbnQgPSBvUGFyZW50RWxlbWVudC5nZXRQYXJlbnQoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9QYXJlbnRFbGVtZW50ICYmXG5cdFx0XHQob1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLlJvd1wiKSB8fFxuXHRcdFx0XHRvUGFyZW50RWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuQ3JlYXRpb25Sb3dcIikgfHxcblx0XHRcdFx0b1BhcmVudEVsZW1lbnQuaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKSlcblx0XHRcdD8gb1BhcmVudEVsZW1lbnRcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgaW5kZXggb2YgdGhlIHRhYmxlIHJvdyBjb250YWluaW5nIHRoZSBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0VsZW1lbnQgQ29udHJvbFxuXHQgKiBAcmV0dXJucyBSb3cgaW5kZXggfHwgdW5kZWZpbmVkXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0VGFibGVSb3dJbmRleChvRWxlbWVudDogYW55KSB7XG5cdFx0Y29uc3Qgb1RhYmxlUm93ID0gdGhpcy5fZ2V0VGFibGVSb3cob0VsZW1lbnQpO1xuXHRcdGxldCBpUm93SW5kZXg7XG5cdFx0aWYgKG9UYWJsZVJvdy5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpKSB7XG5cdFx0XHRpUm93SW5kZXggPSBvVGFibGVSb3cuZ2V0SW5kZXgoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aVJvd0luZGV4ID0gb1RhYmxlUm93XG5cdFx0XHRcdC5nZXRUYWJsZSgpXG5cdFx0XHRcdC5nZXRJdGVtcygpXG5cdFx0XHRcdC5maW5kSW5kZXgoZnVuY3Rpb24gKGVsZW1lbnQ6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBlbGVtZW50LmdldElkKCkgPT09IG9UYWJsZVJvdy5nZXRJZCgpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGlSb3dJbmRleDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGluZGV4IG9mIHRoZSB0YWJsZSBjb2x1bW4gY29udGFpbmluZyB0aGUgZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIG9FbGVtZW50IENvbnRyb2xcblx0ICogQHJldHVybnMgQ29sdW1uIGluZGV4IHx8IHVuZGVmaW5lZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldFRhYmxlQ29sdW1uSW5kZXgob0VsZW1lbnQ6IGFueSkge1xuXHRcdGNvbnN0IGdldFRhcmdldENlbGxJbmRleCA9IGZ1bmN0aW9uIChlbGVtZW50OiBhbnksIG9UYXJnZXRSb3c6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9UYXJnZXRSb3cuZ2V0Q2VsbHMoKS5maW5kSW5kZXgoZnVuY3Rpb24gKG9DZWxsOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9DZWxsLmdldElkKCkgPT09IGVsZW1lbnQuZ2V0SWQoKTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0Y29uc3QgZ2V0VGFyZ2V0Q29sdW1uSW5kZXggPSBmdW5jdGlvbiAoZWxlbWVudDogYW55LCBvVGFyZ2V0Um93OiBhbnkpIHtcblx0XHRcdGxldCBvVGFyZ2V0RWxlbWVudCA9IGVsZW1lbnQuZ2V0UGFyZW50KCksXG5cdFx0XHRcdGlUYXJnZXRDZWxsSW5kZXggPSBnZXRUYXJnZXRDZWxsSW5kZXgob1RhcmdldEVsZW1lbnQsIG9UYXJnZXRSb3cpO1xuXHRcdFx0d2hpbGUgKG9UYXJnZXRFbGVtZW50ICYmIGlUYXJnZXRDZWxsSW5kZXggPCAwKSB7XG5cdFx0XHRcdG9UYXJnZXRFbGVtZW50ID0gb1RhcmdldEVsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdGlUYXJnZXRDZWxsSW5kZXggPSBnZXRUYXJnZXRDZWxsSW5kZXgob1RhcmdldEVsZW1lbnQsIG9UYXJnZXRSb3cpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGlUYXJnZXRDZWxsSW5kZXg7XG5cdFx0fTtcblx0XHRjb25zdCBvVGFyZ2V0Um93ID0gdGhpcy5fZ2V0VGFibGVSb3cob0VsZW1lbnQpO1xuXHRcdGxldCBpVGFyZ2V0Q29sdW1uSW5kZXg7XG5cdFx0aVRhcmdldENvbHVtbkluZGV4ID0gZ2V0VGFyZ2V0Q29sdW1uSW5kZXgob0VsZW1lbnQsIG9UYXJnZXRSb3cpO1xuXHRcdGlmIChvVGFyZ2V0Um93LmlzQShcInNhcC51aS50YWJsZS5DcmVhdGlvblJvd1wiKSkge1xuXHRcdFx0Y29uc3Qgc1RhcmdldENlbGxJZCA9IG9UYXJnZXRSb3cuZ2V0Q2VsbHMoKVtpVGFyZ2V0Q29sdW1uSW5kZXhdLmdldElkKCksXG5cdFx0XHRcdGFUYWJsZUNvbHVtbnMgPSBvVGFyZ2V0Um93LmdldFRhYmxlKCkuZ2V0Q29sdW1ucygpO1xuXHRcdFx0aVRhcmdldENvbHVtbkluZGV4ID0gYVRhYmxlQ29sdW1ucy5maW5kSW5kZXgoZnVuY3Rpb24gKGNvbHVtbjogYW55KSB7XG5cdFx0XHRcdGlmIChjb2x1bW4uZ2V0Q3JlYXRpb25UZW1wbGF0ZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNUYXJnZXRDZWxsSWQuc2VhcmNoKGNvbHVtbi5nZXRDcmVhdGlvblRlbXBsYXRlKCkuZ2V0SWQoKSkgPiAtMSA/IHRydWUgOiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gaVRhcmdldENvbHVtbkluZGV4O1xuXHR9XG5cblx0X2dldE1kY1RhYmxlUm93cyhvTWRjVGFibGU6IGFueSkge1xuXHRcdHJldHVybiBvTWRjVGFibGUuZmluZEVsZW1lbnRzKHRydWUsIGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRvRWxlbS5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpICYmXG5cdFx0XHRcdC8qKiBXZSBjaGVjayB0aGUgZWxlbWVudCBiZWxvbmdzIHRvIHRoZSBNZGMgVGFibGUgOiovXG5cdFx0XHRcdG9FbGVtLmdldFRhYmxlKCkuZ2V0UGFyZW50KCkgPT09IG9NZGNUYWJsZVxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXG5cdF9nZXRPYmplY3RQYWdlTGF5b3V0KG9FbGVtZW50OiBhbnksIG9PYmplY3RQYWdlTGF5b3V0OiBhbnkpIHtcblx0XHRpZiAob09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdHJldHVybiBvT2JqZWN0UGFnZUxheW91dDtcblx0XHR9XG5cdFx0b09iamVjdFBhZ2VMYXlvdXQgPSBvRWxlbWVudDtcblx0XHQvL0l0ZXJhdGUgb3ZlciBwYXJlbnQgdGlsbCB5b3UgaGF2ZSBub3QgcmVhY2hlZCB0aGUgb2JqZWN0IHBhZ2UgbGF5b3V0XG5cdFx0d2hpbGUgKG9PYmplY3RQYWdlTGF5b3V0ICYmICFvT2JqZWN0UGFnZUxheW91dC5pc0EoXCJzYXAudXhhcC5PYmplY3RQYWdlTGF5b3V0XCIpKSB7XG5cdFx0XHRvT2JqZWN0UGFnZUxheW91dCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb09iamVjdFBhZ2VMYXlvdXQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB0byBjaGVjayBpZiBhIG5hdmlnYXRpb24gaXMgY29uZmlndXJlZCBmcm9tIHRoZSB0YWJsZSB0byBhIHN1YiBvYmplY3QgcGFnZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHRhYmxlIE1kY1RhYmxlXG5cdCAqIEByZXR1cm5zIEVpdGhlciB0cnVlIG9yIGZhbHNlXG5cdCAqL1xuXHRfbmF2aWdhdGlvbkNvbmZpZ3VyZWQodGFibGU6IGFueSk6IGJvb2xlYW4ge1xuXHRcdC8vIFRPRE86IHRoaXMgbG9naWMgd291bGQgYmUgbW92ZWQgdG8gY2hlY2sgdGhlIHNhbWUgYXQgdGhlIHRlbXBsYXRlIHRpbWUgdG8gYXZvaWQgdGhlIHNhbWUgY2hlY2sgaGFwcGVuaW5nIG11bHRpcGxlIHRpbWVzLlxuXHRcdGNvbnN0IGNvbXBvbmVudCA9IHNhcC51aS5yZXF1aXJlKFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCIpLFxuXHRcdFx0bmF2T2JqZWN0ID0gdGFibGUgJiYgY29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRhYmxlKSAmJiBjb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IodGFibGUpLmdldE5hdmlnYXRpb24oKTtcblx0XHRsZXQgc3ViT1BDb25maWd1cmVkID0gZmFsc2UsXG5cdFx0XHRuYXZDb25maWd1cmVkID0gZmFsc2U7XG5cdFx0aWYgKG5hdk9iamVjdCAmJiBPYmplY3Qua2V5cyhuYXZPYmplY3QpLmluZGV4T2YodGFibGUuZ2V0Um93QmluZGluZygpLnNQYXRoKSAhPT0gLTEpIHtcblx0XHRcdHN1Yk9QQ29uZmlndXJlZCA9XG5cdFx0XHRcdG5hdk9iamVjdFt0YWJsZT8uZ2V0Um93QmluZGluZygpLnNQYXRoXSAmJlxuXHRcdFx0XHRuYXZPYmplY3RbdGFibGU/LmdldFJvd0JpbmRpbmcoKS5zUGF0aF0uZGV0YWlsICYmXG5cdFx0XHRcdG5hdk9iamVjdFt0YWJsZT8uZ2V0Um93QmluZGluZygpLnNQYXRoXS5kZXRhaWwucm91dGVcblx0XHRcdFx0XHQ/IHRydWVcblx0XHRcdFx0XHQ6IGZhbHNlO1xuXHRcdH1cblx0XHRuYXZDb25maWd1cmVkID1cblx0XHRcdHN1Yk9QQ29uZmlndXJlZCAmJlxuXHRcdFx0dGFibGU/LmdldFJvd1NldHRpbmdzKCkuZ2V0Um93QWN0aW9ucygpICYmXG5cdFx0XHR0YWJsZT8uZ2V0Um93U2V0dGluZ3MoKS5nZXRSb3dBY3Rpb25zKClbMF0ubVByb3BlcnRpZXMudHlwZS5pbmRleE9mKFwiTmF2aWdhdGlvblwiKSAhPT0gLTE7XG5cdFx0cmV0dXJuIG5hdkNvbmZpZ3VyZWQ7XG5cdH1cblxuXHRzZXRGb2N1c1RvQ29udHJvbChjb250cm9sPzogVUk1RWxlbWVudCkge1xuXHRcdGNvbnN0IG1lc3NhZ2VQb3BvdmVyID0gdGhpcy5vTWVzc2FnZVBvcG92ZXI7XG5cdFx0aWYgKG1lc3NhZ2VQb3BvdmVyICYmIGNvbnRyb2wgJiYgY29udHJvbC5mb2N1cykge1xuXHRcdFx0Y29uc3QgZm5Gb2N1cyA9ICgpID0+IHtcblx0XHRcdFx0Y29udHJvbC5mb2N1cygpO1xuXHRcdFx0fTtcblx0XHRcdGlmICghbWVzc2FnZVBvcG92ZXIuaXNPcGVuKCkpIHtcblx0XHRcdFx0Ly8gd2hlbiBuYXZpZ2F0aW5nIHRvIHBhcmVudCBwYWdlIHRvIGNoaWxkIHBhZ2UgKG9uIGNsaWNrIG9mIG1lc3NhZ2UpLCB0aGUgY2hpbGQgcGFnZSBtaWdodCBoYXZlIGEgZm9jdXMgbG9naWMgdGhhdCBtaWdodCB1c2UgYSB0aW1lb3V0LlxuXHRcdFx0XHQvLyB3ZSB1c2UgdGhlIGJlbG93IHRpbWVvdXRzIHRvIG92ZXJyaWRlIHRoaXMgZm9jdXMgc28gdGhhdCB3ZSBmb2N1cyBvbiB0aGUgdGFyZ2V0IGNvbnRyb2wgb2YgdGhlIG1lc3NhZ2UgaW4gdGhlIGNoaWxkIHBhZ2UuXG5cdFx0XHRcdHNldFRpbWVvdXQoZm5Gb2N1cywgMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmbk9uQ2xvc2UgPSAoKSA9PiB7XG5cdFx0XHRcdFx0c2V0VGltZW91dChmbkZvY3VzLCAwKTtcblx0XHRcdFx0XHRtZXNzYWdlUG9wb3Zlci5kZXRhY2hFdmVudChcImFmdGVyQ2xvc2VcIiwgZm5PbkNsb3NlKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0bWVzc2FnZVBvcG92ZXIuYXR0YWNoRXZlbnQoXCJhZnRlckNsb3NlXCIsIGZuT25DbG9zZSk7XG5cdFx0XHRcdG1lc3NhZ2VQb3BvdmVyLmNsb3NlKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdExvZy53YXJuaW5nKFwiRkUgVjQgOiBNZXNzYWdlQnV0dG9uIDogZWxlbWVudCBkb2Vzbid0IGhhdmUgZm9jdXMgbWV0aG9kIGZvciBmb2N1c2luZy5cIik7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VCdXR0b247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7TUEwQ01BLGFBQWEsV0FEbEJDLGNBQWMsQ0FBQyxzQ0FBc0MsQ0FBQyxVQUVyREMsV0FBVyxDQUFDO0lBQUVDLElBQUksRUFBRSxzQ0FBc0M7SUFBRUMsUUFBUSxFQUFFLElBQUk7SUFBRUMsWUFBWSxFQUFFO0VBQWUsQ0FBQyxDQUFDLFVBRzNHQyxLQUFLLEVBQUU7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQSxNQU1BQyxpQkFBaUIsR0FBRyxFQUFFO01BQUEsTUFFdEJD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