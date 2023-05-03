/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/extend", "sap/base/util/ObjectPath", "sap/fe/core/helpers/ClassSupport", "sap/m/library", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/core/routing/HashChanger", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel"], function (Log, extend, ObjectPath, ClassSupport, library, Core, Fragment, ControllerExtension, OverrideExecution, HashChanger, XMLPreprocessor, XMLTemplateProcessor, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  let oLastFocusedControl;

  /**
   * A controller extension offering hooks into the routing flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.86.0
   */
  let ShareUtils = (_dec = defineUI5Class("sap.fe.core.controllerextensions.Share"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = finalExtension(), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(ShareUtils, _ControllerExtension);
    function ShareUtils() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = ShareUtils.prototype;
    _proto.onInit = function onInit() {
      const collaborationInfoModel = new JSONModel({
        url: "",
        appTitle: "",
        subTitle: "",
        minifyUrlForChat: true
      });
      this.base.getView().setModel(collaborationInfoModel, "collaborationInfo");
    };
    _proto.onExit = function onExit() {
      var _this$base, _this$base$getView;
      const collaborationInfoModel = (_this$base = this.base) === null || _this$base === void 0 ? void 0 : (_this$base$getView = _this$base.getView()) === null || _this$base$getView === void 0 ? void 0 : _this$base$getView.getModel("collaborationInfo");
      if (collaborationInfoModel) {
        collaborationInfoModel.destroy();
      }
    }
    /**
     * Opens the share sheet.
     *
     * @function
     * @param oControl The control to which the ActionSheet is opened.
     * @alias sap.fe.core.controllerextensions.Share#openShareSheet
     * @public
     * @since 1.93.0
     */;
    _proto.openShareSheet = function openShareSheet(oControl) {
      this._openShareSheetImpl(oControl);
    }
    /**
     * Adapts the metadata used while sharing the page URL via 'Send Email', 'Share in SAP Jam', and 'Save as Tile'.
     *
     * @function
     * @param oShareMetadata Object containing the share metadata.
     * @param oShareMetadata.url Default URL that will be used via 'Send Email', 'Share in SAP Jam', and 'Save as Tile'
     * @param oShareMetadata.title Default title that will be used as 'email subject' in 'Send Email', 'share text' in 'Share in SAP Jam' and 'title' in 'Save as Tile'
     * @param oShareMetadata.email Email-specific metadata.
     * @param oShareMetadata.email.url URL that will be used specifically for 'Send Email'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.email.title Title that will be used as "email subject" in 'Send Email'. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.jam SAP Jam-specific metadata.
     * @param oShareMetadata.jam.url URL that will be used specifically for 'Share in SAP Jam'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.jam.title Title that will be used as 'share text' in 'Share in SAP Jam'. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.tile Save as Tile-specific metadata.
     * @param oShareMetadata.tile.url URL that will be used specifically for 'Save as Tile'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.tile.title Title to be used for the tile. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.tile.subtitle Subtitle to be used for the tile.
     * @param oShareMetadata.tile.icon Icon to be used for the tile.
     * @param oShareMetadata.tile.queryUrl Query URL of an OData service from which data for a dynamic tile is read.
     * @returns Share Metadata or a Promise resolving the Share Metadata
     * @alias sap.fe.core.controllerextensions.Share#adaptShareMetadata
     * @public
     * @since 1.93.0
     */;
    _proto.adaptShareMetadata = function adaptShareMetadata(oShareMetadata) {
      return oShareMetadata;
    };
    _proto._openShareSheetImpl = async function _openShareSheetImpl(by) {
      let oShareActionSheet;
      const sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "",
        oShareMetadata = {
          url: window.location.origin + window.location.pathname + window.location.search + (sHash ? sBasePath + sHash : window.location.hash),
          title: document.title,
          email: {
            url: "",
            title: ""
          },
          jam: {
            url: "",
            title: ""
          },
          tile: {
            url: "",
            title: "",
            subtitle: "",
            icon: "",
            queryUrl: ""
          }
        };
      oLastFocusedControl = by;
      const setShareEmailData = function (shareActionSheet, oModelData) {
        const oShareMailModel = shareActionSheet.getModel("shareData");
        const oNewMailData = extend(oShareMailModel.getData(), oModelData);
        oShareMailModel.setData(oNewMailData);
      };
      try {
        const oModelData = await Promise.resolve(this.adaptShareMetadata(oShareMetadata));
        const fragmentController = {
          shareEmailPressed: function () {
            const oMailModel = oShareActionSheet.getModel("shareData");
            const oMailData = oMailModel.getData();
            const oResource = Core.getLibraryResourceBundle("sap.fe.core");
            const sEmailSubject = oMailData.email.title ? oMailData.email.title : oResource.getText("T_SHARE_UTIL_HELPER_SAPFE_EMAIL_SUBJECT", [oMailData.title]);
            library.URLHelper.triggerEmail(undefined, sEmailSubject, oMailData.email.url ? oMailData.email.url : oMailData.url);
          },
          shareMSTeamsPressed: function () {
            const msTeamsModel = oShareActionSheet.getModel("shareData");
            const msTeamsData = msTeamsModel.getData();
            const message = msTeamsData.email.title ? msTeamsData.email.title : msTeamsData.title;
            const url = msTeamsData.email.url ? msTeamsData.email.url : msTeamsData.url;
            const newWindowOpen = window.open("", "ms-teams-share-popup", "width=700,height=600");
            newWindowOpen.opener = null;
            newWindowOpen.location = `https://teams.microsoft.com/share?msgText=${encodeURIComponent(message)}&href=${encodeURIComponent(url)}`;
          },
          onSaveTilePress: function () {
            // TODO it seems that the press event is executed before the dialog is available - adding a timeout is a cheap workaround
            setTimeout(function () {
              var _Core$byId;
              (_Core$byId = Core.byId("bookmarkDialog")) === null || _Core$byId === void 0 ? void 0 : _Core$byId.attachAfterClose(function () {
                oLastFocusedControl.focus();
              });
            }, 0);
          },
          shareJamPressed: () => {
            this._doOpenJamShareDialog(oModelData.jam.title ? oModelData.jam.title : oModelData.title, oModelData.jam.url ? oModelData.jam.url : oModelData.url);
          }
        };
        fragmentController.onCancelPressed = function () {
          oShareActionSheet.close();
        };
        fragmentController.setShareSheet = function (oShareSheet) {
          by.shareSheet = oShareSheet;
        };
        const oThis = new JSONModel({});
        const oPreprocessorSettings = {
          bindingContexts: {
            this: oThis.createBindingContext("/")
          },
          models: {
            this: oThis
          }
        };
        const oTileData = {
          title: oModelData.tile.title ? oModelData.tile.title : oModelData.title,
          subtitle: oModelData.tile.subtitle,
          icon: oModelData.tile.icon,
          url: oModelData.tile.url ? oModelData.tile.url : oModelData.url.substring(oModelData.url.indexOf("#")),
          queryUrl: oModelData.tile.queryUrl
        };
        if (by.shareSheet) {
          oShareActionSheet = by.shareSheet;
          const oShareModel = oShareActionSheet.getModel("share");
          this._setStaticShareData(oShareModel);
          const oNewData = extend(oShareModel.getData(), oTileData);
          oShareModel.setData(oNewData);
          setShareEmailData(oShareActionSheet, oModelData);
          oShareActionSheet.openBy(by);
        } else {
          const sFragmentName = "sap.fe.macros.share.ShareSheet";
          const oPopoverFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
          try {
            const oFragment = await Promise.resolve(XMLPreprocessor.process(oPopoverFragment, {
              name: sFragmentName
            }, oPreprocessorSettings));
            oShareActionSheet = await Fragment.load({
              definition: oFragment,
              controller: fragmentController
            });
            oShareActionSheet.setModel(new JSONModel(oTileData || {}), "share");
            const oShareModel = oShareActionSheet.getModel("share");
            this._setStaticShareData(oShareModel);
            const oNewData = extend(oShareModel.getData(), oTileData);
            oShareModel.setData(oNewData);
            oShareActionSheet.setModel(new JSONModel(oModelData || {}), "shareData");
            setShareEmailData(oShareActionSheet, oModelData);
            by.addDependent(oShareActionSheet);
            oShareActionSheet.openBy(by);
            fragmentController.setShareSheet(oShareActionSheet);
          } catch (oError) {
            Log.error("Error while opening the share fragment", oError);
          }
        }
      } catch (oError) {
        Log.error("Error while fetching the share model data", oError);
      }
    };
    _proto._setStaticShareData = function _setStaticShareData(shareModel) {
      const oResource = Core.getLibraryResourceBundle("sap.fe.core");
      shareModel.setProperty("/jamButtonText", oResource.getText("T_COMMON_SAPFE_SHARE_JAM"));
      shareModel.setProperty("/emailButtonText", oResource.getText("T_SEMANTIC_CONTROL_SEND_EMAIL"));
      shareModel.setProperty("/msTeamsShareButtonText", oResource.getText("T_COMMON_SAPFE_SHARE_MSTEAMS"));
      // Share to Microsoft Teams is feature which for now only gets enabled for selected customers.
      // The switch "sapHorizonEnabled" and check for it was aligned with the Fiori launchpad team.
      if (ObjectPath.get("sap-ushell-config.renderers.fiori2.componentData.config.sapHorizonEnabled") === true) {
        shareModel.setProperty("/msTeamsVisible", true);
      } else {
        shareModel.setProperty("/msTeamsVisible", false);
      }
      const fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
      shareModel.setProperty("/jamVisible", !!fnGetUser && fnGetUser().isJamActive());
      shareModel.setProperty("/saveAsTileVisible", !!(sap && sap.ushell && sap.ushell.Container));
    }
    //the actual opening of the JAM share dialog
    ;
    _proto._doOpenJamShareDialog = function _doOpenJamShareDialog(text, sUrl) {
      const oShareDialog = Core.createComponent({
        name: "sap.collaboration.components.fiori.sharing.dialog",
        settings: {
          object: {
            id: sUrl,
            share: text
          }
        }
      });
      oShareDialog.open();
    }
    /**
     * Triggers the email flow.
     *
     * @returns {void}
     * @private
     */;
    _proto._triggerEmail = async function _triggerEmail() {
      const shareMetadata = await this._adaptShareMetadata();
      const oResource = Core.getLibraryResourceBundle("sap.fe.core");
      const sEmailSubject = shareMetadata.email.title ? shareMetadata.email.title : oResource.getText("T_SHARE_UTIL_HELPER_SAPFE_EMAIL_SUBJECT", [shareMetadata.title]);
      library.URLHelper.triggerEmail(undefined, sEmailSubject, shareMetadata.email.url ? shareMetadata.email.url : shareMetadata.url);
    }
    /**
     * Triggers the share to jam flow.
     *
     * @returns {void}
     * @private
     */;
    _proto._triggerShareToJam = async function _triggerShareToJam() {
      const shareMetadata = await this._adaptShareMetadata();
      this._doOpenJamShareDialog(shareMetadata.jam.title ? shareMetadata.jam.title : shareMetadata.title, shareMetadata.jam.url ? shareMetadata.jam.url : window.location.origin + window.location.pathname + shareMetadata.url);
    }
    /**
     * Triggers the save as tile flow.
     *
     * @param [source]
     * @returns {void}
     * @private
     */;
    _proto._saveAsTile = async function _saveAsTile(source) {
      const shareMetadata = await this._adaptShareMetadata(),
        internalAddBookmarkButton = source.getDependents()[0],
        sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
      shareMetadata.url = sHash ? sBasePath + sHash : window.location.hash;

      // set AddBookmarkButton properties
      internalAddBookmarkButton.setTitle(shareMetadata.tile.title ? shareMetadata.tile.title : shareMetadata.title);
      internalAddBookmarkButton.setSubtitle(shareMetadata.tile.subtitle);
      internalAddBookmarkButton.setTileIcon(shareMetadata.tile.icon);
      internalAddBookmarkButton.setCustomUrl(shareMetadata.tile.url ? shareMetadata.tile.url : shareMetadata.url);
      internalAddBookmarkButton.setServiceUrl(shareMetadata.tile.queryUrl);

      // addBookmarkButton fire press
      internalAddBookmarkButton.firePress();
    }
    /**
     * Call the adaptShareMetadata extension.
     *
     * @returns {object} Share Metadata
     * @private
     */;
    _proto._adaptShareMetadata = function _adaptShareMetadata() {
      const sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "",
        oShareMetadata = {
          url: window.location.origin + window.location.pathname + window.location.search + (sHash ? sBasePath + sHash : window.location.hash),
          title: document.title,
          email: {
            url: "",
            title: ""
          },
          jam: {
            url: "",
            title: ""
          },
          tile: {
            url: "",
            title: "",
            subtitle: "",
            icon: "",
            queryUrl: ""
          }
        };
      return this.adaptShareMetadata(oShareMetadata);
    };
    return ShareUtils;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "openShareSheet", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "openShareSheet"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptShareMetadata", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptShareMetadata"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_triggerEmail", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "_triggerEmail"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_triggerShareToJam", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "_triggerShareToJam"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_saveAsTile", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "_saveAsTile"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_adaptShareMetadata", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "_adaptShareMetadata"), _class2.prototype)), _class2)) || _class);
  return ShareUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvTGFzdEZvY3VzZWRDb250cm9sIiwiU2hhcmVVdGlscyIsImRlZmluZVVJNUNsYXNzIiwibWV0aG9kT3ZlcnJpZGUiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwib25Jbml0IiwiY29sbGFib3JhdGlvbkluZm9Nb2RlbCIsIkpTT05Nb2RlbCIsInVybCIsImFwcFRpdGxlIiwic3ViVGl0bGUiLCJtaW5pZnlVcmxGb3JDaGF0IiwiYmFzZSIsImdldFZpZXciLCJzZXRNb2RlbCIsIm9uRXhpdCIsImdldE1vZGVsIiwiZGVzdHJveSIsIm9wZW5TaGFyZVNoZWV0Iiwib0NvbnRyb2wiLCJfb3BlblNoYXJlU2hlZXRJbXBsIiwiYWRhcHRTaGFyZU1ldGFkYXRhIiwib1NoYXJlTWV0YWRhdGEiLCJieSIsIm9TaGFyZUFjdGlvblNoZWV0Iiwic0hhc2giLCJIYXNoQ2hhbmdlciIsImdldEluc3RhbmNlIiwiZ2V0SGFzaCIsInNCYXNlUGF0aCIsImhyZWZGb3JBcHBTcGVjaWZpY0hhc2giLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm9yaWdpbiIsInBhdGhuYW1lIiwic2VhcmNoIiwiaGFzaCIsInRpdGxlIiwiZG9jdW1lbnQiLCJlbWFpbCIsImphbSIsInRpbGUiLCJzdWJ0aXRsZSIsImljb24iLCJxdWVyeVVybCIsInNldFNoYXJlRW1haWxEYXRhIiwic2hhcmVBY3Rpb25TaGVldCIsIm9Nb2RlbERhdGEiLCJvU2hhcmVNYWlsTW9kZWwiLCJvTmV3TWFpbERhdGEiLCJleHRlbmQiLCJnZXREYXRhIiwic2V0RGF0YSIsIlByb21pc2UiLCJyZXNvbHZlIiwiZnJhZ21lbnRDb250cm9sbGVyIiwic2hhcmVFbWFpbFByZXNzZWQiLCJvTWFpbE1vZGVsIiwib01haWxEYXRhIiwib1Jlc291cmNlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInNFbWFpbFN1YmplY3QiLCJnZXRUZXh0IiwibGlicmFyeSIsIlVSTEhlbHBlciIsInRyaWdnZXJFbWFpbCIsInVuZGVmaW5lZCIsInNoYXJlTVNUZWFtc1ByZXNzZWQiLCJtc1RlYW1zTW9kZWwiLCJtc1RlYW1zRGF0YSIsIm1lc3NhZ2UiLCJuZXdXaW5kb3dPcGVuIiwib3BlbiIsIm9wZW5lciIsImVuY29kZVVSSUNvbXBvbmVudCIsIm9uU2F2ZVRpbGVQcmVzcyIsInNldFRpbWVvdXQiLCJieUlkIiwiYXR0YWNoQWZ0ZXJDbG9zZSIsImZvY3VzIiwic2hhcmVKYW1QcmVzc2VkIiwiX2RvT3BlbkphbVNoYXJlRGlhbG9nIiwib25DYW5jZWxQcmVzc2VkIiwiY2xvc2UiLCJzZXRTaGFyZVNoZWV0Iiwib1NoYXJlU2hlZXQiLCJzaGFyZVNoZWV0Iiwib1RoaXMiLCJvUHJlcHJvY2Vzc29yU2V0dGluZ3MiLCJiaW5kaW5nQ29udGV4dHMiLCJ0aGlzIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJtb2RlbHMiLCJvVGlsZURhdGEiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwib1NoYXJlTW9kZWwiLCJfc2V0U3RhdGljU2hhcmVEYXRhIiwib05ld0RhdGEiLCJvcGVuQnkiLCJzRnJhZ21lbnROYW1lIiwib1BvcG92ZXJGcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwib0ZyYWdtZW50IiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsIm5hbWUiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiY29udHJvbGxlciIsImFkZERlcGVuZGVudCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwic2hhcmVNb2RlbCIsInNldFByb3BlcnR5IiwiT2JqZWN0UGF0aCIsImdldCIsImZuR2V0VXNlciIsImlzSmFtQWN0aXZlIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwidGV4dCIsInNVcmwiLCJvU2hhcmVEaWFsb2ciLCJjcmVhdGVDb21wb25lbnQiLCJzZXR0aW5ncyIsIm9iamVjdCIsImlkIiwic2hhcmUiLCJfdHJpZ2dlckVtYWlsIiwic2hhcmVNZXRhZGF0YSIsIl9hZGFwdFNoYXJlTWV0YWRhdGEiLCJfdHJpZ2dlclNoYXJlVG9KYW0iLCJfc2F2ZUFzVGlsZSIsInNvdXJjZSIsImludGVybmFsQWRkQm9va21hcmtCdXR0b24iLCJnZXREZXBlbmRlbnRzIiwic2V0VGl0bGUiLCJzZXRTdWJ0aXRsZSIsInNldFRpbGVJY29uIiwic2V0Q3VzdG9tVXJsIiwic2V0U2VydmljZVVybCIsImZpcmVQcmVzcyIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNoYXJlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGV4dGVuZCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9leHRlbmRcIjtcbmltcG9ydCBPYmplY3RQYXRoIGZyb20gXCJzYXAvYmFzZS91dGlsL09iamVjdFBhdGhcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBmaW5hbEV4dGVuc2lvbiwgbWV0aG9kT3ZlcnJpZGUsIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgQWN0aW9uU2hlZXQgZnJvbSBcInNhcC9tL0FjdGlvblNoZWV0XCI7XG5pbXBvcnQgdHlwZSBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IGxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgSGFzaENoYW5nZXIgZnJvbSBcInNhcC91aS9jb3JlL3JvdXRpbmcvSGFzaENoYW5nZXJcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCIuLi9QYWdlQ29udHJvbGxlclwiO1xuXG5sZXQgb0xhc3RGb2N1c2VkQ29udHJvbDogQ29udHJvbDtcblxuLyoqXG4gKiBBIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIG9mZmVyaW5nIGhvb2tzIGludG8gdGhlIHJvdXRpbmcgZmxvdyBvZiB0aGUgYXBwbGljYXRpb25cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS44Ni4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlNoYXJlXCIpXG5jbGFzcyBTaGFyZVV0aWxzIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdG9uSW5pdCgpOiB2b2lkIHtcblx0XHRjb25zdCBjb2xsYWJvcmF0aW9uSW5mb01vZGVsOiBKU09OTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdHVybDogXCJcIixcblx0XHRcdGFwcFRpdGxlOiBcIlwiLFxuXHRcdFx0c3ViVGl0bGU6IFwiXCIsXG5cdFx0XHRtaW5pZnlVcmxGb3JDaGF0OiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5iYXNlLmdldFZpZXcoKS5zZXRNb2RlbChjb2xsYWJvcmF0aW9uSW5mb01vZGVsLCBcImNvbGxhYm9yYXRpb25JbmZvXCIpO1xuXHR9XG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdG9uRXhpdCgpOiB2b2lkIHtcblx0XHRjb25zdCBjb2xsYWJvcmF0aW9uSW5mb01vZGVsOiBKU09OTW9kZWwgPSB0aGlzLmJhc2U/LmdldFZpZXcoKT8uZ2V0TW9kZWwoXCJjb2xsYWJvcmF0aW9uSW5mb1wiKSBhcyBKU09OTW9kZWw7XG5cdFx0aWYgKGNvbGxhYm9yYXRpb25JbmZvTW9kZWwpIHtcblx0XHRcdGNvbGxhYm9yYXRpb25JbmZvTW9kZWwuZGVzdHJveSgpO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogT3BlbnMgdGhlIHNoYXJlIHNoZWV0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIHRvIHdoaWNoIHRoZSBBY3Rpb25TaGVldCBpcyBvcGVuZWQuXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5TaGFyZSNvcGVuU2hhcmVTaGVldFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkzLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRvcGVuU2hhcmVTaGVldChvQ29udHJvbDogb2JqZWN0KSB7XG5cdFx0dGhpcy5fb3BlblNoYXJlU2hlZXRJbXBsKG9Db250cm9sKTtcblx0fVxuXHQvKipcblx0ICogQWRhcHRzIHRoZSBtZXRhZGF0YSB1c2VkIHdoaWxlIHNoYXJpbmcgdGhlIHBhZ2UgVVJMIHZpYSAnU2VuZCBFbWFpbCcsICdTaGFyZSBpbiBTQVAgSmFtJywgYW5kICdTYXZlIGFzIFRpbGUnLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBzaGFyZSBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnVybCBEZWZhdWx0IFVSTCB0aGF0IHdpbGwgYmUgdXNlZCB2aWEgJ1NlbmQgRW1haWwnLCAnU2hhcmUgaW4gU0FQIEphbScsIGFuZCAnU2F2ZSBhcyBUaWxlJ1xuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEudGl0bGUgRGVmYXVsdCB0aXRsZSB0aGF0IHdpbGwgYmUgdXNlZCBhcyAnZW1haWwgc3ViamVjdCcgaW4gJ1NlbmQgRW1haWwnLCAnc2hhcmUgdGV4dCcgaW4gJ1NoYXJlIGluIFNBUCBKYW0nIGFuZCAndGl0bGUnIGluICdTYXZlIGFzIFRpbGUnXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS5lbWFpbCBFbWFpbC1zcGVjaWZpYyBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmVtYWlsLnVybCBVUkwgdGhhdCB3aWxsIGJlIHVzZWQgc3BlY2lmaWNhbGx5IGZvciAnU2VuZCBFbWFpbCcuIFRoaXMgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIG9TaGFyZU1ldGFkYXRhLnVybC5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmVtYWlsLnRpdGxlIFRpdGxlIHRoYXQgd2lsbCBiZSB1c2VkIGFzIFwiZW1haWwgc3ViamVjdFwiIGluICdTZW5kIEVtYWlsJy4gVGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb1NoYXJlTWV0YWRhdGEudGl0bGUuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS5qYW0gU0FQIEphbS1zcGVjaWZpYyBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmphbS51cmwgVVJMIHRoYXQgd2lsbCBiZSB1c2VkIHNwZWNpZmljYWxseSBmb3IgJ1NoYXJlIGluIFNBUCBKYW0nLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS51cmwuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS5qYW0udGl0bGUgVGl0bGUgdGhhdCB3aWxsIGJlIHVzZWQgYXMgJ3NoYXJlIHRleHQnIGluICdTaGFyZSBpbiBTQVAgSmFtJy4gVGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb1NoYXJlTWV0YWRhdGEudGl0bGUuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aWxlIFNhdmUgYXMgVGlsZS1zcGVjaWZpYyBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUudXJsIFVSTCB0aGF0IHdpbGwgYmUgdXNlZCBzcGVjaWZpY2FsbHkgZm9yICdTYXZlIGFzIFRpbGUnLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS51cmwuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aWxlLnRpdGxlIFRpdGxlIHRvIGJlIHVzZWQgZm9yIHRoZSB0aWxlLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS50aXRsZS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUuc3VidGl0bGUgU3VidGl0bGUgdG8gYmUgdXNlZCBmb3IgdGhlIHRpbGUuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aWxlLmljb24gSWNvbiB0byBiZSB1c2VkIGZvciB0aGUgdGlsZS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUucXVlcnlVcmwgUXVlcnkgVVJMIG9mIGFuIE9EYXRhIHNlcnZpY2UgZnJvbSB3aGljaCBkYXRhIGZvciBhIGR5bmFtaWMgdGlsZSBpcyByZWFkLlxuXHQgKiBAcmV0dXJucyBTaGFyZSBNZXRhZGF0YSBvciBhIFByb21pc2UgcmVzb2x2aW5nIHRoZSBTaGFyZSBNZXRhZGF0YVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuU2hhcmUjYWRhcHRTaGFyZU1ldGFkYXRhXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTMuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRhZGFwdFNoYXJlTWV0YWRhdGEob1NoYXJlTWV0YWRhdGE6IHtcblx0XHR1cmw6IHN0cmluZztcblx0XHR0aXRsZTogc3RyaW5nO1xuXHRcdGVtYWlsPzogeyB1cmw6IHN0cmluZzsgdGl0bGU6IHN0cmluZyB9O1xuXHRcdGphbT86IHsgdXJsOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmcgfTtcblx0XHR0aWxlPzogeyB1cmw6IHN0cmluZzsgdGl0bGU6IHN0cmluZzsgc3VidGl0bGU6IHN0cmluZzsgaWNvbjogc3RyaW5nOyBxdWVyeVVybDogc3RyaW5nIH07XG5cdH0pOiBvYmplY3QgfCBQcm9taXNlPG9iamVjdD4ge1xuXHRcdHJldHVybiBvU2hhcmVNZXRhZGF0YTtcblx0fVxuXHRhc3luYyBfb3BlblNoYXJlU2hlZXRJbXBsKGJ5OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRsZXQgb1NoYXJlQWN0aW9uU2hlZXQ6IEFjdGlvblNoZWV0O1xuXHRcdGNvbnN0IHNIYXNoID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKS5nZXRIYXNoKCksXG5cdFx0XHRzQmFzZVBhdGggPSAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2hcblx0XHRcdFx0PyAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2goXCJcIilcblx0XHRcdFx0OiBcIlwiLFxuXHRcdFx0b1NoYXJlTWV0YWRhdGEgPSB7XG5cdFx0XHRcdHVybDpcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24ub3JpZ2luICtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgK1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggK1xuXHRcdFx0XHRcdChzSGFzaCA/IHNCYXNlUGF0aCArIHNIYXNoIDogd2luZG93LmxvY2F0aW9uLmhhc2gpLFxuXHRcdFx0XHR0aXRsZTogZG9jdW1lbnQudGl0bGUsXG5cdFx0XHRcdGVtYWlsOiB7XG5cdFx0XHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0XHRcdHRpdGxlOiBcIlwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGphbToge1xuXHRcdFx0XHRcdHVybDogXCJcIixcblx0XHRcdFx0XHR0aXRsZTogXCJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0aWxlOiB7XG5cdFx0XHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0XHRcdHRpdGxlOiBcIlwiLFxuXHRcdFx0XHRcdHN1YnRpdGxlOiBcIlwiLFxuXHRcdFx0XHRcdGljb246IFwiXCIsXG5cdFx0XHRcdFx0cXVlcnlVcmw6IFwiXCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRvTGFzdEZvY3VzZWRDb250cm9sID0gYnk7XG5cblx0XHRjb25zdCBzZXRTaGFyZUVtYWlsRGF0YSA9IGZ1bmN0aW9uIChzaGFyZUFjdGlvblNoZWV0OiBhbnksIG9Nb2RlbERhdGE6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1NoYXJlTWFpbE1vZGVsID0gc2hhcmVBY3Rpb25TaGVldC5nZXRNb2RlbChcInNoYXJlRGF0YVwiKTtcblx0XHRcdGNvbnN0IG9OZXdNYWlsRGF0YSA9IGV4dGVuZChvU2hhcmVNYWlsTW9kZWwuZ2V0RGF0YSgpLCBvTW9kZWxEYXRhKTtcblx0XHRcdG9TaGFyZU1haWxNb2RlbC5zZXREYXRhKG9OZXdNYWlsRGF0YSk7XG5cdFx0fTtcblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBvTW9kZWxEYXRhOiBhbnkgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUodGhpcy5hZGFwdFNoYXJlTWV0YWRhdGEob1NoYXJlTWV0YWRhdGEpKTtcblx0XHRcdGNvbnN0IGZyYWdtZW50Q29udHJvbGxlcjogYW55ID0ge1xuXHRcdFx0XHRzaGFyZUVtYWlsUHJlc3NlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNvbnN0IG9NYWlsTW9kZWwgPSBvU2hhcmVBY3Rpb25TaGVldC5nZXRNb2RlbChcInNoYXJlRGF0YVwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdFx0Y29uc3Qgb01haWxEYXRhID0gb01haWxNb2RlbC5nZXREYXRhKCk7XG5cdFx0XHRcdFx0Y29uc3Qgb1Jlc291cmNlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRcdFx0XHRjb25zdCBzRW1haWxTdWJqZWN0ID0gb01haWxEYXRhLmVtYWlsLnRpdGxlXG5cdFx0XHRcdFx0XHQ/IG9NYWlsRGF0YS5lbWFpbC50aXRsZVxuXHRcdFx0XHRcdFx0OiBvUmVzb3VyY2UuZ2V0VGV4dChcIlRfU0hBUkVfVVRJTF9IRUxQRVJfU0FQRkVfRU1BSUxfU1VCSkVDVFwiLCBbb01haWxEYXRhLnRpdGxlXSk7XG5cdFx0XHRcdFx0bGlicmFyeS5VUkxIZWxwZXIudHJpZ2dlckVtYWlsKHVuZGVmaW5lZCwgc0VtYWlsU3ViamVjdCwgb01haWxEYXRhLmVtYWlsLnVybCA/IG9NYWlsRGF0YS5lbWFpbC51cmwgOiBvTWFpbERhdGEudXJsKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2hhcmVNU1RlYW1zUHJlc3NlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNvbnN0IG1zVGVhbXNNb2RlbCA9IG9TaGFyZUFjdGlvblNoZWV0LmdldE1vZGVsKFwic2hhcmVEYXRhXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0XHRjb25zdCBtc1RlYW1zRGF0YSA9IG1zVGVhbXNNb2RlbC5nZXREYXRhKCk7XG5cdFx0XHRcdFx0Y29uc3QgbWVzc2FnZSA9IG1zVGVhbXNEYXRhLmVtYWlsLnRpdGxlID8gbXNUZWFtc0RhdGEuZW1haWwudGl0bGUgOiBtc1RlYW1zRGF0YS50aXRsZTtcblx0XHRcdFx0XHRjb25zdCB1cmwgPSBtc1RlYW1zRGF0YS5lbWFpbC51cmwgPyBtc1RlYW1zRGF0YS5lbWFpbC51cmwgOiBtc1RlYW1zRGF0YS51cmw7XG5cdFx0XHRcdFx0Y29uc3QgbmV3V2luZG93T3BlbiA9IHdpbmRvdy5vcGVuKFwiXCIsIFwibXMtdGVhbXMtc2hhcmUtcG9wdXBcIiwgXCJ3aWR0aD03MDAsaGVpZ2h0PTYwMFwiKTtcblx0XHRcdFx0XHRuZXdXaW5kb3dPcGVuIS5vcGVuZXIgPSBudWxsO1xuXHRcdFx0XHRcdG5ld1dpbmRvd09wZW4hLmxvY2F0aW9uID0gYGh0dHBzOi8vdGVhbXMubWljcm9zb2Z0LmNvbS9zaGFyZT9tc2dUZXh0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuXHRcdFx0XHRcdFx0bWVzc2FnZVxuXHRcdFx0XHRcdCl9JmhyZWY9JHtlbmNvZGVVUklDb21wb25lbnQodXJsKX1gO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvblNhdmVUaWxlUHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyBUT0RPIGl0IHNlZW1zIHRoYXQgdGhlIHByZXNzIGV2ZW50IGlzIGV4ZWN1dGVkIGJlZm9yZSB0aGUgZGlhbG9nIGlzIGF2YWlsYWJsZSAtIGFkZGluZyBhIHRpbWVvdXQgaXMgYSBjaGVhcCB3b3JrYXJvdW5kXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHQoQ29yZS5ieUlkKFwiYm9va21hcmtEaWFsb2dcIikgYXMgRGlhbG9nKT8uYXR0YWNoQWZ0ZXJDbG9zZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdG9MYXN0Rm9jdXNlZENvbnRyb2wuZm9jdXMoKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzaGFyZUphbVByZXNzZWQ6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9kb09wZW5KYW1TaGFyZURpYWxvZyhcblx0XHRcdFx0XHRcdG9Nb2RlbERhdGEuamFtLnRpdGxlID8gb01vZGVsRGF0YS5qYW0udGl0bGUgOiBvTW9kZWxEYXRhLnRpdGxlLFxuXHRcdFx0XHRcdFx0b01vZGVsRGF0YS5qYW0udXJsID8gb01vZGVsRGF0YS5qYW0udXJsIDogb01vZGVsRGF0YS51cmxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRmcmFnbWVudENvbnRyb2xsZXIub25DYW5jZWxQcmVzc2VkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRvU2hhcmVBY3Rpb25TaGVldC5jbG9zZSgpO1xuXHRcdFx0fTtcblxuXHRcdFx0ZnJhZ21lbnRDb250cm9sbGVyLnNldFNoYXJlU2hlZXQgPSBmdW5jdGlvbiAob1NoYXJlU2hlZXQ6IGFueSkge1xuXHRcdFx0XHRieS5zaGFyZVNoZWV0ID0gb1NoYXJlU2hlZXQ7XG5cdFx0XHR9O1xuXG5cdFx0XHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe30pO1xuXHRcdFx0Y29uc3Qgb1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHR0aGlzOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdFx0fSxcblx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0dGhpczogb1RoaXNcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IG9UaWxlRGF0YSA9IHtcblx0XHRcdFx0dGl0bGU6IG9Nb2RlbERhdGEudGlsZS50aXRsZSA/IG9Nb2RlbERhdGEudGlsZS50aXRsZSA6IG9Nb2RlbERhdGEudGl0bGUsXG5cdFx0XHRcdHN1YnRpdGxlOiBvTW9kZWxEYXRhLnRpbGUuc3VidGl0bGUsXG5cdFx0XHRcdGljb246IG9Nb2RlbERhdGEudGlsZS5pY29uLFxuXHRcdFx0XHR1cmw6IG9Nb2RlbERhdGEudGlsZS51cmwgPyBvTW9kZWxEYXRhLnRpbGUudXJsIDogb01vZGVsRGF0YS51cmwuc3Vic3RyaW5nKG9Nb2RlbERhdGEudXJsLmluZGV4T2YoXCIjXCIpKSxcblx0XHRcdFx0cXVlcnlVcmw6IG9Nb2RlbERhdGEudGlsZS5xdWVyeVVybFxuXHRcdFx0fTtcblx0XHRcdGlmIChieS5zaGFyZVNoZWV0KSB7XG5cdFx0XHRcdG9TaGFyZUFjdGlvblNoZWV0ID0gYnkuc2hhcmVTaGVldDtcblxuXHRcdFx0XHRjb25zdCBvU2hhcmVNb2RlbCA9IG9TaGFyZUFjdGlvblNoZWV0LmdldE1vZGVsKFwic2hhcmVcIikgYXMgSlNPTk1vZGVsO1xuXHRcdFx0XHR0aGlzLl9zZXRTdGF0aWNTaGFyZURhdGEob1NoYXJlTW9kZWwpO1xuXHRcdFx0XHRjb25zdCBvTmV3RGF0YSA9IGV4dGVuZChvU2hhcmVNb2RlbC5nZXREYXRhKCksIG9UaWxlRGF0YSk7XG5cdFx0XHRcdG9TaGFyZU1vZGVsLnNldERhdGEob05ld0RhdGEpO1xuXHRcdFx0XHRzZXRTaGFyZUVtYWlsRGF0YShvU2hhcmVBY3Rpb25TaGVldCwgb01vZGVsRGF0YSk7XG5cdFx0XHRcdG9TaGFyZUFjdGlvblNoZWV0Lm9wZW5CeShieSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzRnJhZ21lbnROYW1lID0gXCJzYXAuZmUubWFjcm9zLnNoYXJlLlNoYXJlU2hlZXRcIjtcblx0XHRcdFx0Y29uc3Qgb1BvcG92ZXJGcmFnbWVudCA9IFhNTFRlbXBsYXRlUHJvY2Vzc29yLmxvYWRUZW1wbGF0ZShzRnJhZ21lbnROYW1lLCBcImZyYWdtZW50XCIpO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0ZyYWdtZW50ID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKFxuXHRcdFx0XHRcdFx0WE1MUHJlcHJvY2Vzc29yLnByb2Nlc3Mob1BvcG92ZXJGcmFnbWVudCwgeyBuYW1lOiBzRnJhZ21lbnROYW1lIH0sIG9QcmVwcm9jZXNzb3JTZXR0aW5ncylcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdG9TaGFyZUFjdGlvblNoZWV0ID0gKGF3YWl0IEZyYWdtZW50LmxvYWQoe1xuXHRcdFx0XHRcdFx0ZGVmaW5pdGlvbjogb0ZyYWdtZW50LFxuXHRcdFx0XHRcdFx0Y29udHJvbGxlcjogZnJhZ21lbnRDb250cm9sbGVyXG5cdFx0XHRcdFx0fSkpIGFzIGFueTtcblxuXHRcdFx0XHRcdG9TaGFyZUFjdGlvblNoZWV0LnNldE1vZGVsKG5ldyBKU09OTW9kZWwob1RpbGVEYXRhIHx8IHt9KSwgXCJzaGFyZVwiKTtcblx0XHRcdFx0XHRjb25zdCBvU2hhcmVNb2RlbCA9IG9TaGFyZUFjdGlvblNoZWV0LmdldE1vZGVsKFwic2hhcmVcIikgYXMgSlNPTk1vZGVsO1xuXHRcdFx0XHRcdHRoaXMuX3NldFN0YXRpY1NoYXJlRGF0YShvU2hhcmVNb2RlbCk7XG5cdFx0XHRcdFx0Y29uc3Qgb05ld0RhdGEgPSBleHRlbmQob1NoYXJlTW9kZWwuZ2V0RGF0YSgpLCBvVGlsZURhdGEpO1xuXHRcdFx0XHRcdG9TaGFyZU1vZGVsLnNldERhdGEob05ld0RhdGEpO1xuXG5cdFx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQuc2V0TW9kZWwobmV3IEpTT05Nb2RlbChvTW9kZWxEYXRhIHx8IHt9KSwgXCJzaGFyZURhdGFcIik7XG5cdFx0XHRcdFx0c2V0U2hhcmVFbWFpbERhdGEob1NoYXJlQWN0aW9uU2hlZXQsIG9Nb2RlbERhdGEpO1xuXG5cdFx0XHRcdFx0YnkuYWRkRGVwZW5kZW50KG9TaGFyZUFjdGlvblNoZWV0KTtcblx0XHRcdFx0XHRvU2hhcmVBY3Rpb25TaGVldC5vcGVuQnkoYnkpO1xuXHRcdFx0XHRcdGZyYWdtZW50Q29udHJvbGxlci5zZXRTaGFyZVNoZWV0KG9TaGFyZUFjdGlvblNoZWV0KTtcblx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBvcGVuaW5nIHRoZSBzaGFyZSBmcmFnbWVudFwiLCBvRXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGZldGNoaW5nIHRoZSBzaGFyZSBtb2RlbCBkYXRhXCIsIG9FcnJvcik7XG5cdFx0fVxuXHR9XG5cdF9zZXRTdGF0aWNTaGFyZURhdGEoc2hhcmVNb2RlbDogYW55KSB7XG5cdFx0Y29uc3Qgb1Jlc291cmNlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL2phbUJ1dHRvblRleHRcIiwgb1Jlc291cmNlLmdldFRleHQoXCJUX0NPTU1PTl9TQVBGRV9TSEFSRV9KQU1cIikpO1xuXHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvZW1haWxCdXR0b25UZXh0XCIsIG9SZXNvdXJjZS5nZXRUZXh0KFwiVF9TRU1BTlRJQ19DT05UUk9MX1NFTkRfRU1BSUxcIikpO1xuXHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvbXNUZWFtc1NoYXJlQnV0dG9uVGV4dFwiLCBvUmVzb3VyY2UuZ2V0VGV4dChcIlRfQ09NTU9OX1NBUEZFX1NIQVJFX01TVEVBTVNcIikpO1xuXHRcdC8vIFNoYXJlIHRvIE1pY3Jvc29mdCBUZWFtcyBpcyBmZWF0dXJlIHdoaWNoIGZvciBub3cgb25seSBnZXRzIGVuYWJsZWQgZm9yIHNlbGVjdGVkIGN1c3RvbWVycy5cblx0XHQvLyBUaGUgc3dpdGNoIFwic2FwSG9yaXpvbkVuYWJsZWRcIiBhbmQgY2hlY2sgZm9yIGl0IHdhcyBhbGlnbmVkIHdpdGggdGhlIEZpb3JpIGxhdW5jaHBhZCB0ZWFtLlxuXHRcdGlmIChPYmplY3RQYXRoLmdldChcInNhcC11c2hlbGwtY29uZmlnLnJlbmRlcmVycy5maW9yaTIuY29tcG9uZW50RGF0YS5jb25maWcuc2FwSG9yaXpvbkVuYWJsZWRcIikgPT09IHRydWUpIHtcblx0XHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvbXNUZWFtc1Zpc2libGVcIiwgdHJ1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvbXNUZWFtc1Zpc2libGVcIiwgZmFsc2UpO1xuXHRcdH1cblx0XHRjb25zdCBmbkdldFVzZXIgPSBPYmplY3RQYXRoLmdldChcInNhcC51c2hlbGwuQ29udGFpbmVyLmdldFVzZXJcIik7XG5cdFx0c2hhcmVNb2RlbC5zZXRQcm9wZXJ0eShcIi9qYW1WaXNpYmxlXCIsICEhZm5HZXRVc2VyICYmIGZuR2V0VXNlcigpLmlzSmFtQWN0aXZlKCkpO1xuXHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvc2F2ZUFzVGlsZVZpc2libGVcIiwgISEoc2FwICYmIHNhcC51c2hlbGwgJiYgc2FwLnVzaGVsbC5Db250YWluZXIpKTtcblx0fVxuXHQvL3RoZSBhY3R1YWwgb3BlbmluZyBvZiB0aGUgSkFNIHNoYXJlIGRpYWxvZ1xuXHRfZG9PcGVuSmFtU2hhcmVEaWFsb2codGV4dDogYW55LCBzVXJsPzogYW55KSB7XG5cdFx0Y29uc3Qgb1NoYXJlRGlhbG9nID0gQ29yZS5jcmVhdGVDb21wb25lbnQoe1xuXHRcdFx0bmFtZTogXCJzYXAuY29sbGFib3JhdGlvbi5jb21wb25lbnRzLmZpb3JpLnNoYXJpbmcuZGlhbG9nXCIsXG5cdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRvYmplY3Q6IHtcblx0XHRcdFx0XHRpZDogc1VybCxcblx0XHRcdFx0XHRzaGFyZTogdGV4dFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0KG9TaGFyZURpYWxvZyBhcyBhbnkpLm9wZW4oKTtcblx0fVxuXHQvKipcblx0ICogVHJpZ2dlcnMgdGhlIGVtYWlsIGZsb3cuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIF90cmlnZ2VyRW1haWwoKSB7XG5cdFx0Y29uc3Qgc2hhcmVNZXRhZGF0YTogYW55ID0gYXdhaXQgdGhpcy5fYWRhcHRTaGFyZU1ldGFkYXRhKCk7XG5cdFx0Y29uc3Qgb1Jlc291cmNlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRjb25zdCBzRW1haWxTdWJqZWN0ID0gc2hhcmVNZXRhZGF0YS5lbWFpbC50aXRsZVxuXHRcdFx0PyBzaGFyZU1ldGFkYXRhLmVtYWlsLnRpdGxlXG5cdFx0XHQ6IG9SZXNvdXJjZS5nZXRUZXh0KFwiVF9TSEFSRV9VVElMX0hFTFBFUl9TQVBGRV9FTUFJTF9TVUJKRUNUXCIsIFtzaGFyZU1ldGFkYXRhLnRpdGxlXSk7XG5cdFx0bGlicmFyeS5VUkxIZWxwZXIudHJpZ2dlckVtYWlsKHVuZGVmaW5lZCwgc0VtYWlsU3ViamVjdCwgc2hhcmVNZXRhZGF0YS5lbWFpbC51cmwgPyBzaGFyZU1ldGFkYXRhLmVtYWlsLnVybCA6IHNoYXJlTWV0YWRhdGEudXJsKTtcblx0fVxuXHQvKipcblx0ICogVHJpZ2dlcnMgdGhlIHNoYXJlIHRvIGphbSBmbG93LlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBfdHJpZ2dlclNoYXJlVG9KYW0oKSB7XG5cdFx0Y29uc3Qgc2hhcmVNZXRhZGF0YTogYW55ID0gYXdhaXQgdGhpcy5fYWRhcHRTaGFyZU1ldGFkYXRhKCk7XG5cdFx0dGhpcy5fZG9PcGVuSmFtU2hhcmVEaWFsb2coXG5cdFx0XHRzaGFyZU1ldGFkYXRhLmphbS50aXRsZSA/IHNoYXJlTWV0YWRhdGEuamFtLnRpdGxlIDogc2hhcmVNZXRhZGF0YS50aXRsZSxcblx0XHRcdHNoYXJlTWV0YWRhdGEuamFtLnVybCA/IHNoYXJlTWV0YWRhdGEuamFtLnVybCA6IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBzaGFyZU1ldGFkYXRhLnVybFxuXHRcdCk7XG5cdH1cblx0LyoqXG5cdCAqIFRyaWdnZXJzIHRoZSBzYXZlIGFzIHRpbGUgZmxvdy5cblx0ICpcblx0ICogQHBhcmFtIFtzb3VyY2VdXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIF9zYXZlQXNUaWxlKHNvdXJjZTogYW55KSB7XG5cdFx0Y29uc3Qgc2hhcmVNZXRhZGF0YTogYW55ID0gYXdhaXQgdGhpcy5fYWRhcHRTaGFyZU1ldGFkYXRhKCksXG5cdFx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uID0gc291cmNlLmdldERlcGVuZGVudHMoKVswXSxcblx0XHRcdHNIYXNoID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKS5nZXRIYXNoKCksXG5cdFx0XHRzQmFzZVBhdGggPSAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2hcblx0XHRcdFx0PyAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2goXCJcIilcblx0XHRcdFx0OiBcIlwiO1xuXHRcdHNoYXJlTWV0YWRhdGEudXJsID0gc0hhc2ggPyBzQmFzZVBhdGggKyBzSGFzaCA6IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXG5cdFx0Ly8gc2V0IEFkZEJvb2ttYXJrQnV0dG9uIHByb3BlcnRpZXNcblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLnNldFRpdGxlKHNoYXJlTWV0YWRhdGEudGlsZS50aXRsZSA/IHNoYXJlTWV0YWRhdGEudGlsZS50aXRsZSA6IHNoYXJlTWV0YWRhdGEudGl0bGUpO1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0U3VidGl0bGUoc2hhcmVNZXRhZGF0YS50aWxlLnN1YnRpdGxlKTtcblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLnNldFRpbGVJY29uKHNoYXJlTWV0YWRhdGEudGlsZS5pY29uKTtcblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLnNldEN1c3RvbVVybChzaGFyZU1ldGFkYXRhLnRpbGUudXJsID8gc2hhcmVNZXRhZGF0YS50aWxlLnVybCA6IHNoYXJlTWV0YWRhdGEudXJsKTtcblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLnNldFNlcnZpY2VVcmwoc2hhcmVNZXRhZGF0YS50aWxlLnF1ZXJ5VXJsKTtcblxuXHRcdC8vIGFkZEJvb2ttYXJrQnV0dG9uIGZpcmUgcHJlc3Ncblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLmZpcmVQcmVzcygpO1xuXHR9XG5cdC8qKlxuXHQgKiBDYWxsIHRoZSBhZGFwdFNoYXJlTWV0YWRhdGEgZXh0ZW5zaW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSBTaGFyZSBNZXRhZGF0YVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdF9hZGFwdFNoYXJlTWV0YWRhdGEoKSB7XG5cdFx0Y29uc3Qgc0hhc2ggPSBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKSxcblx0XHRcdHNCYXNlUGF0aCA9IChIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpIGFzIGFueSkuaHJlZkZvckFwcFNwZWNpZmljSGFzaFxuXHRcdFx0XHQ/IChIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpIGFzIGFueSkuaHJlZkZvckFwcFNwZWNpZmljSGFzaChcIlwiKVxuXHRcdFx0XHQ6IFwiXCIsXG5cdFx0XHRvU2hhcmVNZXRhZGF0YSA9IHtcblx0XHRcdFx0dXJsOlxuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gK1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArXG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnNlYXJjaCArXG5cdFx0XHRcdFx0KHNIYXNoID8gc0Jhc2VQYXRoICsgc0hhc2ggOiB3aW5kb3cubG9jYXRpb24uaGFzaCksXG5cdFx0XHRcdHRpdGxlOiBkb2N1bWVudC50aXRsZSxcblx0XHRcdFx0ZW1haWw6IHtcblx0XHRcdFx0XHR1cmw6IFwiXCIsXG5cdFx0XHRcdFx0dGl0bGU6IFwiXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0amFtOiB7XG5cdFx0XHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0XHRcdHRpdGxlOiBcIlwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRpbGU6IHtcblx0XHRcdFx0XHR1cmw6IFwiXCIsXG5cdFx0XHRcdFx0dGl0bGU6IFwiXCIsXG5cdFx0XHRcdFx0c3VidGl0bGU6IFwiXCIsXG5cdFx0XHRcdFx0aWNvbjogXCJcIixcblx0XHRcdFx0XHRxdWVyeVVybDogXCJcIlxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdHJldHVybiB0aGlzLmFkYXB0U2hhcmVNZXRhZGF0YShvU2hhcmVNZXRhZGF0YSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2hhcmVVdGlscztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQWtCQSxJQUFJQSxtQkFBNEI7O0VBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkEsSUFRTUMsVUFBVSxXQURmQyxjQUFjLENBQUMsd0NBQXdDLENBQUMsVUFHdkRDLGNBQWMsRUFBRSxVQVVoQkEsY0FBYyxFQUFFLFVBZ0JoQkMsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUE0QmhCRCxlQUFlLEVBQUUsVUFDakJFLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLEtBQUssQ0FBQyxVQTJMbkNKLGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFdBZWhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQWVoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0EwQmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRTtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQTlTakJJLE1BQU0sR0FETixrQkFDZTtNQUNkLE1BQU1DLHNCQUFpQyxHQUFHLElBQUlDLFNBQVMsQ0FBQztRQUN2REMsR0FBRyxFQUFFLEVBQUU7UUFD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