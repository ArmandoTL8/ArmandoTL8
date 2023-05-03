/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/ID", "sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/InvisibleMessage", "sap/ui/core/library", "sap/ui/core/message/Message"], function (Log, CommonUtils, ID, ExtensionAPI, ClassSupport, InvisibleMessage, library, Message) {
  "use strict";

  var _dec, _class;
  var MessageType = library.MessageType;
  var InvisibleMessageMode = library.InvisibleMessageMode;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var getSideContentLayoutID = ID.getSideContentLayoutID;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Extension API for object pages on SAP Fiori elements for OData V4.
   *
   * @alias sap.fe.templates.ObjectPage.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  let ObjectPageExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ObjectPageExtensionAPI, _ExtensionAPI);
    function ObjectPageExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ObjectPageExtensionAPI.prototype;
    /**
     * Refreshes either the whole object page or only parts of it.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#refresh
     * @param [vPath] Path or array of paths referring to entities or properties to be refreshed.
     * If omitted, the whole object page is refreshed. The path "" refreshes the entity assigned to the object page
     * without navigations
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh(vPath) {
      const oBindingContext = this._view.getBindingContext();
      if (!oBindingContext) {
        // nothing to be refreshed - do not block the app!
        return Promise.resolve();
      }
      const oAppComponent = CommonUtils.getAppComponent(this._view),
        oSideEffectsService = oAppComponent.getSideEffectsService(),
        oMetaModel = oBindingContext.getModel().getMetaModel(),
        oSideEffects = {
          TargetProperties: [],
          TargetEntities: []
        };
      let aPaths, sPath, sBaseEntitySet, sKind;
      if (vPath === undefined || vPath === null) {
        // we just add an empty path which should refresh the page with all dependent bindings
        oSideEffects.TargetEntities.push({
          $NavigationPropertyPath: ""
        });
      } else {
        aPaths = Array.isArray(vPath) ? vPath : [vPath];
        sBaseEntitySet = this._controller.getOwnerComponent().getEntitySet();
        for (let i = 0; i < aPaths.length; i++) {
          sPath = aPaths[i];
          if (sPath === "") {
            // an empty path shall refresh the entity without dependencies which means * for the model
            oSideEffects.TargetProperties.push({
              $PropertyPath: "*"
            });
          } else {
            sKind = oMetaModel.getObject(`/${sBaseEntitySet}/${sPath}/$kind`);
            if (sKind === "NavigationProperty") {
              oSideEffects.TargetEntities.push({
                $NavigationPropertyPath: sPath
              });
            } else if (sKind) {
              oSideEffects.TargetProperties.push({
                $PropertyPath: sPath
              });
            } else {
              return Promise.reject(`${sPath} is not a valid path to be refreshed`);
            }
          }
        }
      }
      return oSideEffectsService.requestSideEffects(oSideEffects.TargetEntities.concat(oSideEffects.TargetProperties), oBindingContext);
    }

    /**
     * Gets the list entries currently selected for the table.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getSelectedContexts
     * @param sTableId The ID identifying the table the selected context is requested for
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts(sTableId) {
      let oTable = this._view.byId(sTableId);
      if (oTable && oTable.isA("sap.fe.macros.table.TableAPI")) {
        oTable = oTable.getContent();
      }
      return oTable && oTable.isA("sap.ui.mdc.Table") && oTable.getSelectedContexts() || [];
    }

    /**
     * Displays or hides the side content of an object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showSideContent
     * @param sSubSectionKey Key of the side content fragment as defined in the manifest.json
     * @param [bShow] Optional Boolean flag to show or hide the side content
     * @public
     */;
    _proto.showSideContent = function showSideContent(sSubSectionKey, bShow) {
      const sBlockID = getSideContentLayoutID(sSubSectionKey),
        oBlock = this._view.byId(sBlockID),
        bBlockState = bShow === undefined ? !oBlock.getShowSideContent() : bShow;
      oBlock.setShowSideContent(bBlockState, false);
    }

    /**
     * Gets the bound context of the current object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getBindingContext
     * @returns Context bound to the object page
     * @public
     */;
    _proto.getBindingContext = function getBindingContext() {
      return this._view.getBindingContext();
    }

    /**
     * Build a message to be displayed below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#_buildOPMessage
     * @param {sap.ui.core.message.Message[]} messages Array of messages used to generated the message
     * @returns {Promise<Message>} Promise containing the generated message
     * @private
     */;
    _proto._buildOPMessage = async function _buildOPMessage(messages) {
      const view = this._view;
      const resourceBundle = await view.getModel("sap.fe.i18n").getResourceBundle();
      let message = null;
      switch (messages.length) {
        case 0:
          break;
        case 1:
          message = messages[0];
          break;
        default:
          const messageStats = {
            Error: {
              id: 2,
              count: 0
            },
            Warning: {
              id: 1,
              count: 0
            },
            Information: {
              id: 0,
              count: 0
            }
          };
          message = messages.reduce((acc, currentValue) => {
            const currentType = currentValue.getType();
            acc.setType(messageStats[currentType].id > messageStats[acc.getType()].id ? currentType : acc.getType());
            messageStats[currentType].count++;
            return acc;
          }, new Message({
            type: MessageType.Information
          }));
          if (messageStats.Error.count === 0 && messageStats.Warning.count === 0 && messageStats.Information.count > 0) {
            message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_INFORMATION"));
          } else if (messageStats.Error.count > 0 && messageStats.Warning.count > 0 || messageStats.Information.count > 0) {
            message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_ISSUE"));
          } else {
            message.setMessage(resourceBundle.getText(message.getType() === MessageType.Error ? "OBJECTPAGESTATE_ERROR" : "OBJECTPAGESTATE_WARNING"));
          }
      }
      return message;
    }

    /**
     * Displays the message strip between the title and the header of the ObjectPage.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showMessages
     * @param {sap.ui.core.message.Message} messages The message to be displayed
     * @public
     */;
    _proto.showMessages = async function showMessages(messages) {
      const view = this._view;
      const internalModelContext = view.getBindingContext("internal");
      try {
        const message = await this._buildOPMessage(messages);
        if (message) {
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", true);
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripText", message.getMessage());
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripType", message.getType());
          InvisibleMessage.getInstance().announce(message.getMessage(), InvisibleMessageMode.Assertive);
        } else {
          this.hideMessage();
        }
      } catch (err) {
        Log.error("Cannot display ObjectPage message");
      }
    }

    /**
     * Hides the message strip below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#hideMessage
     * @public
     */;
    _proto.hideMessage = function hideMessage() {
      const view = this._view;
      const internalModelContext = view.getBindingContext("internal");
      internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", false);
    };
    return ObjectPageExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ObjectPageExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3RQYWdlRXh0ZW5zaW9uQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJyZWZyZXNoIiwidlBhdGgiLCJvQmluZGluZ0NvbnRleHQiLCJfdmlldyIsImdldEJpbmRpbmdDb250ZXh0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJvQXBwQ29tcG9uZW50IiwiQ29tbW9uVXRpbHMiLCJnZXRBcHBDb21wb25lbnQiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib1NpZGVFZmZlY3RzIiwiVGFyZ2V0UHJvcGVydGllcyIsIlRhcmdldEVudGl0aWVzIiwiYVBhdGhzIiwic1BhdGgiLCJzQmFzZUVudGl0eVNldCIsInNLaW5kIiwidW5kZWZpbmVkIiwicHVzaCIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiQXJyYXkiLCJpc0FycmF5IiwiX2NvbnRyb2xsZXIiLCJnZXRPd25lckNvbXBvbmVudCIsImdldEVudGl0eVNldCIsImkiLCJsZW5ndGgiLCIkUHJvcGVydHlQYXRoIiwiZ2V0T2JqZWN0IiwicmVqZWN0IiwicmVxdWVzdFNpZGVFZmZlY3RzIiwiY29uY2F0IiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsInNUYWJsZUlkIiwib1RhYmxlIiwiYnlJZCIsImlzQSIsImdldENvbnRlbnQiLCJzaG93U2lkZUNvbnRlbnQiLCJzU3ViU2VjdGlvbktleSIsImJTaG93Iiwic0Jsb2NrSUQiLCJnZXRTaWRlQ29udGVudExheW91dElEIiwib0Jsb2NrIiwiYkJsb2NrU3RhdGUiLCJnZXRTaG93U2lkZUNvbnRlbnQiLCJzZXRTaG93U2lkZUNvbnRlbnQiLCJfYnVpbGRPUE1lc3NhZ2UiLCJtZXNzYWdlcyIsInZpZXciLCJyZXNvdXJjZUJ1bmRsZSIsImdldFJlc291cmNlQnVuZGxlIiwibWVzc2FnZSIsIm1lc3NhZ2VTdGF0cyIsIkVycm9yIiwiaWQiLCJjb3VudCIsIldhcm5pbmciLCJJbmZvcm1hdGlvbiIsInJlZHVjZSIsImFjYyIsImN1cnJlbnRWYWx1ZSIsImN1cnJlbnRUeXBlIiwiZ2V0VHlwZSIsInNldFR5cGUiLCJNZXNzYWdlIiwidHlwZSIsIk1lc3NhZ2VUeXBlIiwic2V0TWVzc2FnZSIsImdldFRleHQiLCJzaG93TWVzc2FnZXMiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsInNldFByb3BlcnR5IiwiZ2V0TWVzc2FnZSIsIkludmlzaWJsZU1lc3NhZ2UiLCJnZXRJbnN0YW5jZSIsImFubm91bmNlIiwiSW52aXNpYmxlTWVzc2FnZU1vZGUiLCJBc3NlcnRpdmUiLCJoaWRlTWVzc2FnZSIsImVyciIsIkxvZyIsImVycm9yIiwiRXh0ZW5zaW9uQVBJIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFeHRlbnNpb25BUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBnZXRTaWRlQ29udGVudExheW91dElEIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9JRFwiO1xuaW1wb3J0IEV4dGVuc2lvbkFQSSBmcm9tIFwic2FwL2ZlL2NvcmUvRXh0ZW5zaW9uQVBJXCI7XG5pbXBvcnQgdHlwZSB7IEVuaGFuY2VXaXRoVUk1IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgVGFibGVBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVBUElcIjtcbmltcG9ydCBJbnZpc2libGVNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9JbnZpc2libGVNZXNzYWdlXCI7XG5pbXBvcnQgeyBJbnZpc2libGVNZXNzYWdlTW9kZSwgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IHR5cGUgRHluYW1pY1NpZGVDb250ZW50IGZyb20gXCJzYXAvdWkvbGF5b3V0L0R5bmFtaWNTaWRlQ29udGVudFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvcmVzb3VyY2UvUmVzb3VyY2VNb2RlbFwiO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBBUEkgZm9yIG9iamVjdCBwYWdlcyBvbiBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIE9EYXRhIFY0LlxuICpcbiAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuRXh0ZW5zaW9uQVBJXG4gKiBAcHVibGljXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAZmluYWxcbiAqIEBzaW5jZSAxLjc5LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSVwiKVxuY2xhc3MgT2JqZWN0UGFnZUV4dGVuc2lvbkFQSSBleHRlbmRzIEV4dGVuc2lvbkFQSSB7XG5cdC8qKlxuXHQgKiBSZWZyZXNoZXMgZWl0aGVyIHRoZSB3aG9sZSBvYmplY3QgcGFnZSBvciBvbmx5IHBhcnRzIG9mIGl0LlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNyZWZyZXNoXG5cdCAqIEBwYXJhbSBbdlBhdGhdIFBhdGggb3IgYXJyYXkgb2YgcGF0aHMgcmVmZXJyaW5nIHRvIGVudGl0aWVzIG9yIHByb3BlcnRpZXMgdG8gYmUgcmVmcmVzaGVkLlxuXHQgKiBJZiBvbWl0dGVkLCB0aGUgd2hvbGUgb2JqZWN0IHBhZ2UgaXMgcmVmcmVzaGVkLiBUaGUgcGF0aCBcIlwiIHJlZnJlc2hlcyB0aGUgZW50aXR5IGFzc2lnbmVkIHRvIHRoZSBvYmplY3QgcGFnZVxuXHQgKiB3aXRob3V0IG5hdmlnYXRpb25zXG5cdCAqIEByZXR1cm5zIFJlc29sdmVkIG9uY2UgdGhlIGRhdGEgaXMgcmVmcmVzaGVkIG9yIHJlamVjdGVkIGlmIHRoZSByZXF1ZXN0IGZhaWxlZFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRyZWZyZXNoKHZQYXRoOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuX3ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdGlmICghb0JpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHQvLyBub3RoaW5nIHRvIGJlIHJlZnJlc2hlZCAtIGRvIG5vdCBibG9jayB0aGUgYXBwIVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuX3ZpZXcpLFxuXHRcdFx0b1NpZGVFZmZlY3RzU2VydmljZSA9IG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCksXG5cdFx0XHRvTWV0YU1vZGVsID0gb0JpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRvU2lkZUVmZmVjdHM6IGFueSA9IHtcblx0XHRcdFx0VGFyZ2V0UHJvcGVydGllczogW10sXG5cdFx0XHRcdFRhcmdldEVudGl0aWVzOiBbXVxuXHRcdFx0fTtcblx0XHRsZXQgYVBhdGhzLCBzUGF0aCwgc0Jhc2VFbnRpdHlTZXQsIHNLaW5kO1xuXG5cdFx0aWYgKHZQYXRoID09PSB1bmRlZmluZWQgfHwgdlBhdGggPT09IG51bGwpIHtcblx0XHRcdC8vIHdlIGp1c3QgYWRkIGFuIGVtcHR5IHBhdGggd2hpY2ggc2hvdWxkIHJlZnJlc2ggdGhlIHBhZ2Ugd2l0aCBhbGwgZGVwZW5kZW50IGJpbmRpbmdzXG5cdFx0XHRvU2lkZUVmZmVjdHMuVGFyZ2V0RW50aXRpZXMucHVzaCh7XG5cdFx0XHRcdCROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBcIlwiXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YVBhdGhzID0gQXJyYXkuaXNBcnJheSh2UGF0aCkgPyB2UGF0aCA6IFt2UGF0aF07XG5cdFx0XHRzQmFzZUVudGl0eVNldCA9ICh0aGlzLl9jb250cm9sbGVyLmdldE93bmVyQ29tcG9uZW50KCkgYXMgYW55KS5nZXRFbnRpdHlTZXQoKTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhUGF0aHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0c1BhdGggPSBhUGF0aHNbaV07XG5cdFx0XHRcdGlmIChzUGF0aCA9PT0gXCJcIikge1xuXHRcdFx0XHRcdC8vIGFuIGVtcHR5IHBhdGggc2hhbGwgcmVmcmVzaCB0aGUgZW50aXR5IHdpdGhvdXQgZGVwZW5kZW5jaWVzIHdoaWNoIG1lYW5zICogZm9yIHRoZSBtb2RlbFxuXHRcdFx0XHRcdG9TaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzLnB1c2goe1xuXHRcdFx0XHRcdFx0JFByb3BlcnR5UGF0aDogXCIqXCJcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzS2luZCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtzQmFzZUVudGl0eVNldH0vJHtzUGF0aH0vJGtpbmRgKTtcblxuXHRcdFx0XHRcdGlmIChzS2luZCA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdFx0b1NpZGVFZmZlY3RzLlRhcmdldEVudGl0aWVzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHQkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogc1BhdGhcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc0tpbmQpIHtcblx0XHRcdFx0XHRcdG9TaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHQkUHJvcGVydHlQYXRoOiBzUGF0aFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChgJHtzUGF0aH0gaXMgbm90IGEgdmFsaWQgcGF0aCB0byBiZSByZWZyZXNoZWRgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9TaWRlRWZmZWN0c1NlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKG9TaWRlRWZmZWN0cy5UYXJnZXRFbnRpdGllcy5jb25jYXQob1NpZGVFZmZlY3RzLlRhcmdldFByb3BlcnRpZXMpLCBvQmluZGluZ0NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGxpc3QgZW50cmllcyBjdXJyZW50bHkgc2VsZWN0ZWQgZm9yIHRoZSB0YWJsZS5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUEkjZ2V0U2VsZWN0ZWRDb250ZXh0c1xuXHQgKiBAcGFyYW0gc1RhYmxlSWQgVGhlIElEIGlkZW50aWZ5aW5nIHRoZSB0YWJsZSB0aGUgc2VsZWN0ZWQgY29udGV4dCBpcyByZXF1ZXN0ZWQgZm9yXG5cdCAqIEByZXR1cm5zIEFycmF5IGNvbnRhaW5pbmcgdGhlIHNlbGVjdGVkIGNvbnRleHRzXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldFNlbGVjdGVkQ29udGV4dHMoc1RhYmxlSWQ6IHN0cmluZykge1xuXHRcdGxldCBvVGFibGUgPSB0aGlzLl92aWV3LmJ5SWQoc1RhYmxlSWQpO1xuXHRcdGlmIChvVGFibGUgJiYgb1RhYmxlLmlzQShcInNhcC5mZS5tYWNyb3MudGFibGUuVGFibGVBUElcIikpIHtcblx0XHRcdG9UYWJsZSA9IChvVGFibGUgYXMgRW5oYW5jZVdpdGhVSTU8VGFibGVBUEk+KS5nZXRDb250ZW50KCk7XG5cdFx0fVxuXHRcdHJldHVybiAob1RhYmxlICYmIG9UYWJsZS5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpICYmIChvVGFibGUgYXMgYW55KS5nZXRTZWxlY3RlZENvbnRleHRzKCkpIHx8IFtdO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpc3BsYXlzIG9yIGhpZGVzIHRoZSBzaWRlIGNvbnRlbnQgb2YgYW4gb2JqZWN0IHBhZ2UuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuRXh0ZW5zaW9uQVBJI3Nob3dTaWRlQ29udGVudFxuXHQgKiBAcGFyYW0gc1N1YlNlY3Rpb25LZXkgS2V5IG9mIHRoZSBzaWRlIGNvbnRlbnQgZnJhZ21lbnQgYXMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QuanNvblxuXHQgKiBAcGFyYW0gW2JTaG93XSBPcHRpb25hbCBCb29sZWFuIGZsYWcgdG8gc2hvdyBvciBoaWRlIHRoZSBzaWRlIGNvbnRlbnRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2hvd1NpZGVDb250ZW50KHNTdWJTZWN0aW9uS2V5OiBzdHJpbmcsIGJTaG93OiBib29sZWFuIHwgdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3Qgc0Jsb2NrSUQgPSBnZXRTaWRlQ29udGVudExheW91dElEKHNTdWJTZWN0aW9uS2V5KSxcblx0XHRcdG9CbG9jayA9IHRoaXMuX3ZpZXcuYnlJZChzQmxvY2tJRCksXG5cdFx0XHRiQmxvY2tTdGF0ZSA9IGJTaG93ID09PSB1bmRlZmluZWQgPyAhKG9CbG9jayBhcyBEeW5hbWljU2lkZUNvbnRlbnQpLmdldFNob3dTaWRlQ29udGVudCgpIDogYlNob3c7XG5cdFx0KG9CbG9jayBhcyBEeW5hbWljU2lkZUNvbnRlbnQpLnNldFNob3dTaWRlQ29udGVudChiQmxvY2tTdGF0ZSwgZmFsc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGJvdW5kIGNvbnRleHQgb2YgdGhlIGN1cnJlbnQgb2JqZWN0IHBhZ2UuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuRXh0ZW5zaW9uQVBJI2dldEJpbmRpbmdDb250ZXh0XG5cdCAqIEByZXR1cm5zIENvbnRleHQgYm91bmQgdG8gdGhlIG9iamVjdCBwYWdlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldEJpbmRpbmdDb250ZXh0KCkge1xuXHRcdHJldHVybiB0aGlzLl92aWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdH1cblxuXHQvKipcblx0ICogQnVpbGQgYSBtZXNzYWdlIHRvIGJlIGRpc3BsYXllZCBiZWxvdyB0aGUgYW5jaG9yIGJhci5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUEkjX2J1aWxkT1BNZXNzYWdlXG5cdCAqIEBwYXJhbSB7c2FwLnVpLmNvcmUubWVzc2FnZS5NZXNzYWdlW119IG1lc3NhZ2VzIEFycmF5IG9mIG1lc3NhZ2VzIHVzZWQgdG8gZ2VuZXJhdGVkIHRoZSBtZXNzYWdlXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPE1lc3NhZ2U+fSBQcm9taXNlIGNvbnRhaW5pbmcgdGhlIGdlbmVyYXRlZCBtZXNzYWdlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRhc3luYyBfYnVpbGRPUE1lc3NhZ2UobWVzc2FnZXM6IE1lc3NhZ2VbXSk6IFByb21pc2U8TWVzc2FnZSB8IG51bGw+IHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5fdmlldztcblx0XHRjb25zdCByZXNvdXJjZUJ1bmRsZSA9IGF3YWl0ICh2aWV3LmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKTtcblx0XHRsZXQgbWVzc2FnZTogTWVzc2FnZSB8IG51bGwgPSBudWxsO1xuXHRcdHN3aXRjaCAobWVzc2FnZXMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRtZXNzYWdlID0gbWVzc2FnZXNbMF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29uc3QgbWVzc2FnZVN0YXRzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge1xuXHRcdFx0XHRcdEVycm9yOiB7IGlkOiAyLCBjb3VudDogMCB9LFxuXHRcdFx0XHRcdFdhcm5pbmc6IHsgaWQ6IDEsIGNvdW50OiAwIH0sXG5cdFx0XHRcdFx0SW5mb3JtYXRpb246IHsgaWQ6IDAsIGNvdW50OiAwIH1cblx0XHRcdFx0fTtcblx0XHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2VzLnJlZHVjZSgoYWNjLCBjdXJyZW50VmFsdWUpID0+IHtcblx0XHRcdFx0XHRjb25zdCBjdXJyZW50VHlwZSA9IGN1cnJlbnRWYWx1ZS5nZXRUeXBlKCk7XG5cdFx0XHRcdFx0YWNjLnNldFR5cGUobWVzc2FnZVN0YXRzW2N1cnJlbnRUeXBlXS5pZCA+IG1lc3NhZ2VTdGF0c1thY2MuZ2V0VHlwZSgpXS5pZCA/IGN1cnJlbnRUeXBlIDogYWNjLmdldFR5cGUoKSk7XG5cdFx0XHRcdFx0bWVzc2FnZVN0YXRzW2N1cnJlbnRUeXBlXS5jb3VudCsrO1xuXHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdH0sIG5ldyBNZXNzYWdlKHsgdHlwZTogTWVzc2FnZVR5cGUuSW5mb3JtYXRpb24gfSkpO1xuXG5cdFx0XHRcdGlmIChtZXNzYWdlU3RhdHMuRXJyb3IuY291bnQgPT09IDAgJiYgbWVzc2FnZVN0YXRzLldhcm5pbmcuY291bnQgPT09IDAgJiYgbWVzc2FnZVN0YXRzLkluZm9ybWF0aW9uLmNvdW50ID4gMCkge1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0TWVzc2FnZShyZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiT0JKRUNUUEFHRVNUQVRFX0lORk9STUFUSU9OXCIpKTtcblx0XHRcdFx0fSBlbHNlIGlmICgobWVzc2FnZVN0YXRzLkVycm9yLmNvdW50ID4gMCAmJiBtZXNzYWdlU3RhdHMuV2FybmluZy5jb3VudCA+IDApIHx8IG1lc3NhZ2VTdGF0cy5JbmZvcm1hdGlvbi5jb3VudCA+IDApIHtcblx0XHRcdFx0XHRtZXNzYWdlLnNldE1lc3NhZ2UocmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk9CSkVDVFBBR0VTVEFURV9JU1NVRVwiKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWVzc2FnZS5zZXRNZXNzYWdlKFxuXHRcdFx0XHRcdFx0cmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcblx0XHRcdFx0XHRcdFx0bWVzc2FnZS5nZXRUeXBlKCkgPT09IE1lc3NhZ2VUeXBlLkVycm9yID8gXCJPQkpFQ1RQQUdFU1RBVEVfRVJST1JcIiA6IFwiT0JKRUNUUEFHRVNUQVRFX1dBUk5JTkdcIlxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogRGlzcGxheXMgdGhlIG1lc3NhZ2Ugc3RyaXAgYmV0d2VlbiB0aGUgdGl0bGUgYW5kIHRoZSBoZWFkZXIgb2YgdGhlIE9iamVjdFBhZ2UuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuRXh0ZW5zaW9uQVBJI3Nob3dNZXNzYWdlc1xuXHQgKiBAcGFyYW0ge3NhcC51aS5jb3JlLm1lc3NhZ2UuTWVzc2FnZX0gbWVzc2FnZXMgVGhlIG1lc3NhZ2UgdG8gYmUgZGlzcGxheWVkXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cblx0YXN5bmMgc2hvd01lc3NhZ2VzKG1lc3NhZ2VzOiBNZXNzYWdlW10pIHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5fdmlldztcblx0XHRjb25zdCBpbnRlcm5hbE1vZGVsQ29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgbWVzc2FnZSA9IGF3YWl0IHRoaXMuX2J1aWxkT1BNZXNzYWdlKG1lc3NhZ2VzKTtcblx0XHRcdGlmIChtZXNzYWdlKSB7XG5cdFx0XHRcdChpbnRlcm5hbE1vZGVsQ29udGV4dCBhcyBhbnkpPy5zZXRQcm9wZXJ0eShcIk9QTWVzc2FnZVN0cmlwVmlzaWJpbGl0eVwiLCB0cnVlKTtcblx0XHRcdFx0KGludGVybmFsTW9kZWxDb250ZXh0IGFzIGFueSk/LnNldFByb3BlcnR5KFwiT1BNZXNzYWdlU3RyaXBUZXh0XCIsIG1lc3NhZ2UuZ2V0TWVzc2FnZSgpKTtcblx0XHRcdFx0KGludGVybmFsTW9kZWxDb250ZXh0IGFzIGFueSk/LnNldFByb3BlcnR5KFwiT1BNZXNzYWdlU3RyaXBUeXBlXCIsIG1lc3NhZ2UuZ2V0VHlwZSgpKTtcblx0XHRcdFx0SW52aXNpYmxlTWVzc2FnZS5nZXRJbnN0YW5jZSgpLmFubm91bmNlKG1lc3NhZ2UuZ2V0TWVzc2FnZSgpLCBJbnZpc2libGVNZXNzYWdlTW9kZS5Bc3NlcnRpdmUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5oaWRlTWVzc2FnZSgpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IGRpc3BsYXkgT2JqZWN0UGFnZSBtZXNzYWdlXCIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIaWRlcyB0aGUgbWVzc2FnZSBzdHJpcCBiZWxvdyB0aGUgYW5jaG9yIGJhci5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUEkjaGlkZU1lc3NhZ2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0aGlkZU1lc3NhZ2UoKSB7XG5cdFx0Y29uc3QgdmlldyA9IHRoaXMuX3ZpZXc7XG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbENvbnRleHQgPSB2aWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0KGludGVybmFsTW9kZWxDb250ZXh0IGFzIGFueSk/LnNldFByb3BlcnR5KFwiT1BNZXNzYWdlU3RyaXBWaXNpYmlsaXR5XCIsIGZhbHNlKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBPYmplY3RQYWdlRXh0ZW5zaW9uQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7OztFQWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVJBLElBVU1BLHNCQUFzQixXQUQzQkMsY0FBYyxDQUFDLDBDQUEwQyxDQUFDO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUUxRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQVRDLE9BVUFDLE9BQU8sR0FBUCxpQkFBUUMsS0FBb0MsRUFBRTtNQUM3QyxNQUFNQyxlQUFlLEdBQUcsSUFBSSxDQUFDQyxLQUFLLENBQUNDLGlCQUFpQixFQUFhO01BQ2pFLElBQUksQ0FBQ0YsZUFBZSxFQUFFO1FBQ3JCO1FBQ0EsT0FBT0csT0FBTyxDQUFDQyxPQUFPLEVBQUU7TUFDekI7TUFDQSxNQUFNQyxhQUFhLEdBQUdDLFdBQVcsQ0FBQ0MsZUFBZSxDQUFDLElBQUksQ0FBQ04sS0FBSyxDQUFDO1FBQzVETyxtQkFBbUIsR0FBR0gsYUFBYSxDQUFDSSxxQkFBcUIsRUFBRTtRQUMzREMsVUFBVSxHQUFHVixlQUFlLENBQUNXLFFBQVEsRUFBRSxDQUFDQyxZQUFZLEVBQUU7UUFDdERDLFlBQWlCLEdBQUc7VUFDbkJDLGdCQUFnQixFQUFFLEVBQUU7VUFDcEJDLGNBQWMsRUFBRTtRQUNqQixDQUFDO01BQ0YsSUFBSUMsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLGNBQWMsRUFBRUMsS0FBSztNQUV4QyxJQUFJcEIsS0FBSyxLQUFLcUIsU0FBUyxJQUFJckIsS0FBSyxLQUFLLElBQUksRUFBRTtRQUMxQztRQUNBYyxZQUFZLENBQUNFLGNBQWMsQ0FBQ00sSUFBSSxDQUFDO1VBQ2hDQyx1QkFBdUIsRUFBRTtRQUMxQixDQUFDLENBQUM7TUFDSCxDQUFDLE1BQU07UUFDTk4sTUFBTSxH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