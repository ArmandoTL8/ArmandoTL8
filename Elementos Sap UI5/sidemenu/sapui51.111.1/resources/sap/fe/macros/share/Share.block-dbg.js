/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/controls/CommandExecution", "sap/fe/core/helpers/ClassSupport", "sap/m/Menu", "sap/m/MenuButton", "sap/m/MenuItem", "sap/suite/ui/commons/collaboration/CollaborationHelper", "sap/suite/ui/commons/collaboration/ServiceContainer", "sap/ui/core/Core", "sap/ui/core/CustomData", "sap/ui/performance/trace/FESRHelper", "sap/ushell/ui/footerbar/AddBookmarkButton", "./ShareAPI", "sap/fe/core/jsx-runtime/jsx"], function (Log, BuildingBlock, CommonUtils, CommandExecution, ClassSupport, Menu, MenuButton, MenuItem, CollaborationHelper, ServiceContainer, Core, CustomData, FESRHelper, AddBookmarkButton, ShareAPI, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var _exports = {};
  var defineReference = ClassSupport.defineReference;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ShareBuildingBlock = (
  /**
   * @classdesc
   * Building block used to create the ‘Share’ functionality.
   * <br>
   * Please note that the 'Share in SAP Jam' option is only available on platforms that are integrated with SAP Jam.
   * <br>
   * If you are consuming this macro in an environment where the SAP Fiori launchpad is not available, then the 'Save as Tile' option is not visible.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Share
   * 	id="someID"
   *	visible="true"
   * /&gt;
   * </pre>
   * @class sap.fe.macros.Share
   * @hideconstructor
   * @since 1.93.0
   */
  _dec = defineBuildingBlock({
    name: "Share",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    isRuntime: true
  }), _dec2 = blockAttribute({
    type: "string",
    required: true,
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "boolean",
    defaultValue: true,
    isPublic: true,
    bindable: true
  }), _dec4 = defineReference(), _dec5 = defineReference(), _dec6 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ShareBuildingBlock, _BuildingBlockBase);
    function ShareBuildingBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menuButton", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menu", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "saveAsTileMenuItem", _descriptor5, _assertThisInitialized(_this));
      return _this;
    }
    _exports = ShareBuildingBlock;
    var _proto = ShareBuildingBlock.prototype;
    /**
     * Retrieves the share option from the shell configuration asynchronously and prepare the content of the menu button.
     * Options order are:
     * - Send as Email
     * - Share as Jam (if available)
     * - Teams options (if available)
     * - Save as tile.
     *
     * @param view The view this building block is used in
     * @param appComponent The AppComponent instance
     */
    _proto._initializeMenuItems = async function _initializeMenuItems(view, appComponent) {
      const isTeamsModeActive = await CollaborationHelper.isTeamsModeActive();
      if (isTeamsModeActive) {
        var _this$menuButton$curr, _this$menuButton$curr2;
        //need to clear the visible property bindings otherwise when the binding value changes then it will set back the visible to the resolved value
        (_this$menuButton$curr = this.menuButton.current) === null || _this$menuButton$curr === void 0 ? void 0 : _this$menuButton$curr.unbindProperty("visible", true);
        (_this$menuButton$curr2 = this.menuButton.current) === null || _this$menuButton$curr2 === void 0 ? void 0 : _this$menuButton$curr2.setVisible(false);
        return;
      }
      const controller = view.getController();
      const coreResource = Core.getLibraryResourceBundle("sap.fe.core");
      const shellServices = appComponent.getShellServices();
      const isPluginInfoStable = await shellServices.waitForPluginsLoad();
      if (!isPluginInfoStable) {
        var _this$menuButton$curr3;
        // In case the plugin info is not yet available we need to do this computation again on the next button click
        const internalButton = (_this$menuButton$curr3 = this.menuButton.current) === null || _this$menuButton$curr3 === void 0 ? void 0 : _this$menuButton$curr3.getAggregation("_control");
        internalButton === null || internalButton === void 0 ? void 0 : internalButton.attachEventOnce("press", {}, () => this._initializeMenuItems, this);
      }
      if (this.menu.current) {
        this.menu.current.addItem(_jsx(MenuItem, {
          text: coreResource.getText("T_SEMANTIC_CONTROL_SEND_EMAIL"),
          icon: "sap-icon://email",
          press: () => controller.share._triggerEmail()
        }));
        this._addShellBasedMenuItems(controller, shellServices, coreResource);
      }
    };
    _proto._addShellBasedMenuItems = async function _addShellBasedMenuItems(controller, shellServices, coreResource) {
      var _shellServices$getUse, _shellServices$getUse2;
      const hasUshell = shellServices.hasUShell();
      const hasJam = !!((_shellServices$getUse = (_shellServices$getUse2 = shellServices.getUser()).isJamActive) !== null && _shellServices$getUse !== void 0 && _shellServices$getUse.call(_shellServices$getUse2));
      const collaborationTeamsHelper = await ServiceContainer.getServiceAsync();
      const shareCollaborationOptions = collaborationTeamsHelper.getOptions();
      if (hasUshell) {
        if (hasJam) {
          var _this$menu, _this$menu$current;
          this === null || this === void 0 ? void 0 : (_this$menu = this.menu) === null || _this$menu === void 0 ? void 0 : (_this$menu$current = _this$menu.current) === null || _this$menu$current === void 0 ? void 0 : _this$menu$current.addItem(_jsx(MenuItem, {
            text: coreResource.getText("T_COMMON_SAPFE_SHARE_JAM"),
            icon: "sap-icon://share-2",
            press: () => controller.share._triggerShareToJam()
          }));
        }
        // prepare teams menu items
        for (const collaborationOption of shareCollaborationOptions) {
          var _collaborationOption$, _this$menu2, _this$menu2$current;
          const menuItemSettings = {
            text: collaborationOption.text,
            icon: collaborationOption.icon,
            items: []
          };
          if (collaborationOption !== null && collaborationOption !== void 0 && collaborationOption.subOptions && (collaborationOption === null || collaborationOption === void 0 ? void 0 : (_collaborationOption$ = collaborationOption.subOptions) === null || _collaborationOption$ === void 0 ? void 0 : _collaborationOption$.length) > 0) {
            menuItemSettings.items = [];
            collaborationOption.subOptions.forEach(subOption => {
              const subMenuItem = new MenuItem({
                text: subOption.text,
                icon: subOption.icon,
                press: this.collaborationMenuItemPress,
                customData: new CustomData({
                  key: "collaborationData",
                  value: subOption
                })
              });
              if (subOption.fesrStepName) {
                FESRHelper.setSemanticStepname(subMenuItem, "press", subOption.fesrStepName);
              }
              menuItemSettings.items.push(subMenuItem);
            });
          } else {
            // if there are no sub option then the main option should be clickable
            // so add a press handler.
            menuItemSettings.press = this.collaborationMenuItemPress;
            menuItemSettings["customData"] = new CustomData({
              key: "collaborationData",
              value: collaborationOption
            });
          }
          const menuItem = new MenuItem(menuItemSettings);
          if (menuItemSettings.press && collaborationOption.fesrStepName) {
            FESRHelper.setSemanticStepname(menuItem, "press", collaborationOption.fesrStepName);
          }
          this === null || this === void 0 ? void 0 : (_this$menu2 = this.menu) === null || _this$menu2 === void 0 ? void 0 : (_this$menu2$current = _this$menu2.current) === null || _this$menu2$current === void 0 ? void 0 : _this$menu2$current.addItem(menuItem);
        }
        // set save as tile
        // for now we need to create addBookmarkButton to use the save as tile feature.
        // In the future save as tile should be available as an API or a MenuItem so that it can be added to the Menu button.
        // This needs to be discussed with AddBookmarkButton team.
        const addBookmarkButton = new AddBookmarkButton();
        if (addBookmarkButton.getEnabled()) {
          var _this$menu3, _this$menu3$current;
          this === null || this === void 0 ? void 0 : (_this$menu3 = this.menu) === null || _this$menu3 === void 0 ? void 0 : (_this$menu3$current = _this$menu3.current) === null || _this$menu3$current === void 0 ? void 0 : _this$menu3$current.addItem(_jsx(MenuItem, {
            ref: this.saveAsTileMenuItem,
            text: addBookmarkButton.getText(),
            icon: addBookmarkButton.getIcon(),
            press: () => controller.share._saveAsTile(this.saveAsTileMenuItem.current),
            children: {
              dependents: [addBookmarkButton]
            }
          }));
        } else {
          addBookmarkButton.destroy();
        }
      }
    };
    _proto.collaborationMenuItemPress = async function collaborationMenuItemPress(event) {
      const clickedMenuItem = event.getSource();
      const collaborationTeamsHelper = await ServiceContainer.getServiceAsync();
      const view = CommonUtils.getTargetView(clickedMenuItem);
      const controller = view.getController();
      // call adapt share metadata so that the collaboration info model is updated with the required info
      await controller.share._adaptShareMetadata();
      const collaborationInfo = view.getModel("collaborationInfo").getData();
      collaborationTeamsHelper.share(clickedMenuItem.data("collaborationData"), collaborationInfo);
    };
    _proto.getContent = function getContent(view, appComponent) {
      // Ctrl+Shift+S is needed for the time being but this needs to be removed after backlog from menu button
      const menuButton = _jsx(ShareAPI, {
        id: this.id,
        children: _jsx(MenuButton, {
          ref: this.menuButton,
          icon: "sap-icon://action",
          visible: this.visible,
          tooltip: "{sap.fe.i18n>M_COMMON_SAPFE_ACTION_SHARE} (Ctrl+Shift+S)",
          children: _jsx(Menu, {
            ref: this.menu
          })
        })
      });
      view.addDependent(_jsx(CommandExecution, {
        visible: this.visible,
        enabled: this.visible,
        command: "Share",
        execute: () => {
          var _this$menuButton$curr4;
          return (_this$menuButton$curr4 = this.menuButton.current) === null || _this$menuButton$curr4 === void 0 ? void 0 : _this$menuButton$curr4.getMenu().openBy(this.menuButton.current, true);
        }
      }));
      // The initialization is asynchronous, so we just trigger it and hope for the best :D
      this.isInitialized = this._initializeMenuItems(view, appComponent).catch(error => {
        Log.error(error);
      });
      return menuButton;
    };
    return ShareBuildingBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "menuButton", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "menu", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "saveAsTileMenuItem", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ShareBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFyZUJ1aWxkaW5nQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImlzUnVudGltZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsInJlcXVpcmVkIiwiaXNQdWJsaWMiLCJkZWZhdWx0VmFsdWUiLCJiaW5kYWJsZSIsImRlZmluZVJlZmVyZW5jZSIsIl9pbml0aWFsaXplTWVudUl0ZW1zIiwidmlldyIsImFwcENvbXBvbmVudCIsImlzVGVhbXNNb2RlQWN0aXZlIiwiQ29sbGFib3JhdGlvbkhlbHBlciIsIm1lbnVCdXR0b24iLCJjdXJyZW50IiwidW5iaW5kUHJvcGVydHkiLCJzZXRWaXNpYmxlIiwiY29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJjb3JlUmVzb3VyY2UiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwic2hlbGxTZXJ2aWNlcyIsImdldFNoZWxsU2VydmljZXMiLCJpc1BsdWdpbkluZm9TdGFibGUiLCJ3YWl0Rm9yUGx1Z2luc0xvYWQiLCJpbnRlcm5hbEJ1dHRvbiIsImdldEFnZ3JlZ2F0aW9uIiwiYXR0YWNoRXZlbnRPbmNlIiwibWVudSIsImFkZEl0ZW0iLCJnZXRUZXh0Iiwic2hhcmUiLCJfdHJpZ2dlckVtYWlsIiwiX2FkZFNoZWxsQmFzZWRNZW51SXRlbXMiLCJoYXNVc2hlbGwiLCJoYXNVU2hlbGwiLCJoYXNKYW0iLCJnZXRVc2VyIiwiaXNKYW1BY3RpdmUiLCJjb2xsYWJvcmF0aW9uVGVhbXNIZWxwZXIiLCJTZXJ2aWNlQ29udGFpbmVyIiwiZ2V0U2VydmljZUFzeW5jIiwic2hhcmVDb2xsYWJvcmF0aW9uT3B0aW9ucyIsImdldE9wdGlvbnMiLCJfdHJpZ2dlclNoYXJlVG9KYW0iLCJjb2xsYWJvcmF0aW9uT3B0aW9uIiwibWVudUl0ZW1TZXR0aW5ncyIsInRleHQiLCJpY29uIiwiaXRlbXMiLCJzdWJPcHRpb25zIiwibGVuZ3RoIiwiZm9yRWFjaCIsInN1Yk9wdGlvbiIsInN1Yk1lbnVJdGVtIiwiTWVudUl0ZW0iLCJwcmVzcyIsImNvbGxhYm9yYXRpb25NZW51SXRlbVByZXNzIiwiY3VzdG9tRGF0YSIsIkN1c3RvbURhdGEiLCJrZXkiLCJ2YWx1ZSIsImZlc3JTdGVwTmFtZSIsIkZFU1JIZWxwZXIiLCJzZXRTZW1hbnRpY1N0ZXBuYW1lIiwicHVzaCIsIm1lbnVJdGVtIiwiYWRkQm9va21hcmtCdXR0b24iLCJBZGRCb29rbWFya0J1dHRvbiIsImdldEVuYWJsZWQiLCJzYXZlQXNUaWxlTWVudUl0ZW0iLCJnZXRJY29uIiwiX3NhdmVBc1RpbGUiLCJkZXBlbmRlbnRzIiwiZGVzdHJveSIsImV2ZW50IiwiY2xpY2tlZE1lbnVJdGVtIiwiZ2V0U291cmNlIiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiX2FkYXB0U2hhcmVNZXRhZGF0YSIsImNvbGxhYm9yYXRpb25JbmZvIiwiZ2V0TW9kZWwiLCJnZXREYXRhIiwiZGF0YSIsImdldENvbnRlbnQiLCJpZCIsInZpc2libGUiLCJhZGREZXBlbmRlbnQiLCJnZXRNZW51Iiwib3BlbkJ5IiwiaXNJbml0aWFsaXplZCIsImNhdGNoIiwiZXJyb3IiLCJMb2ciLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2hhcmUuYmxvY2sudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jaywgUnVudGltZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IENvbW1hbmRFeGVjdXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL0NvbW1hbmRFeGVjdXRpb25cIjtcbmltcG9ydCB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBkZWZpbmVSZWZlcmVuY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IFJlZiB9IGZyb20gXCJzYXAvZmUvY29yZS9qc3gtcnVudGltZS9qc3hcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgSVNoZWxsU2VydmljZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2hlbGxTZXJ2aWNlc0ZhY3RvcnlcIjtcbmltcG9ydCBNZW51IGZyb20gXCJzYXAvbS9NZW51XCI7XG5pbXBvcnQgTWVudUJ1dHRvbiBmcm9tIFwic2FwL20vTWVudUJ1dHRvblwiO1xuaW1wb3J0IE1lbnVJdGVtLCB7ICRNZW51SXRlbVNldHRpbmdzIH0gZnJvbSBcInNhcC9tL01lbnVJdGVtXCI7XG5pbXBvcnQgQ29sbGFib3JhdGlvbkhlbHBlciBmcm9tIFwic2FwL3N1aXRlL3VpL2NvbW1vbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uSGVscGVyXCI7XG5pbXBvcnQgU2VydmljZUNvbnRhaW5lciBmcm9tIFwic2FwL3N1aXRlL3VpL2NvbW1vbnMvY29sbGFib3JhdGlvbi9TZXJ2aWNlQ29udGFpbmVyXCI7XG5pbXBvcnQgVGVhbXNIZWxwZXJTZXJ2aWNlLCB7IENvbGxhYm9yYXRpb25PcHRpb25zIH0gZnJvbSBcInNhcC9zdWl0ZS91aS9jb21tb25zL2NvbGxhYm9yYXRpb24vVGVhbXNIZWxwZXJTZXJ2aWNlXCI7XG5pbXBvcnQgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBDdXN0b21EYXRhIGZyb20gXCJzYXAvdWkvY29yZS9DdXN0b21EYXRhXCI7XG5pbXBvcnQgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IEZFU1JIZWxwZXIgZnJvbSBcInNhcC91aS9wZXJmb3JtYW5jZS90cmFjZS9GRVNSSGVscGVyXCI7XG5pbXBvcnQgQWRkQm9va21hcmtCdXR0b24gZnJvbSBcInNhcC91c2hlbGwvdWkvZm9vdGVyYmFyL0FkZEJvb2ttYXJrQnV0dG9uXCI7XG5pbXBvcnQgU2hhcmVBUEkgZnJvbSBcIi4vU2hhcmVBUElcIjtcblxuLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBCdWlsZGluZyBibG9jayB1c2VkIHRvIGNyZWF0ZSB0aGUg4oCYU2hhcmXigJkgZnVuY3Rpb25hbGl0eS5cbiAqIDxicj5cbiAqIFBsZWFzZSBub3RlIHRoYXQgdGhlICdTaGFyZSBpbiBTQVAgSmFtJyBvcHRpb24gaXMgb25seSBhdmFpbGFibGUgb24gcGxhdGZvcm1zIHRoYXQgYXJlIGludGVncmF0ZWQgd2l0aCBTQVAgSmFtLlxuICogPGJyPlxuICogSWYgeW91IGFyZSBjb25zdW1pbmcgdGhpcyBtYWNybyBpbiBhbiBlbnZpcm9ubWVudCB3aGVyZSB0aGUgU0FQIEZpb3JpIGxhdW5jaHBhZCBpcyBub3QgYXZhaWxhYmxlLCB0aGVuIHRoZSAnU2F2ZSBhcyBUaWxlJyBvcHRpb24gaXMgbm90IHZpc2libGUuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOlNoYXJlXG4gKiBcdGlkPVwic29tZUlEXCJcbiAqXHR2aXNpYmxlPVwidHJ1ZVwiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKiBAY2xhc3Mgc2FwLmZlLm1hY3Jvcy5TaGFyZVxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHNpbmNlIDEuOTMuMFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiU2hhcmVcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0cHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0aXNSdW50aW1lOiB0cnVlXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcmVCdWlsZGluZ0Jsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2UgaW1wbGVtZW50cyBSdW50aW1lQnVpbGRpbmdCbG9jayB7XG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRpZCE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogdHJ1ZSxcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRiaW5kYWJsZTogdHJ1ZVxuXHR9KVxuXHR2aXNpYmxlITogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXG5cdEBkZWZpbmVSZWZlcmVuY2UoKVxuXHRtZW51QnV0dG9uITogUmVmPE1lbnVCdXR0b24+O1xuXG5cdEBkZWZpbmVSZWZlcmVuY2UoKVxuXHRtZW51ITogUmVmPE1lbnU+O1xuXG5cdEBkZWZpbmVSZWZlcmVuY2UoKVxuXHRzYXZlQXNUaWxlTWVudUl0ZW0hOiBSZWY8TWVudUl0ZW0+O1xuXG5cdHB1YmxpYyBpc0luaXRpYWxpemVkPzogUHJvbWlzZTx2b2lkPjtcblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBzaGFyZSBvcHRpb24gZnJvbSB0aGUgc2hlbGwgY29uZmlndXJhdGlvbiBhc3luY2hyb25vdXNseSBhbmQgcHJlcGFyZSB0aGUgY29udGVudCBvZiB0aGUgbWVudSBidXR0b24uXG5cdCAqIE9wdGlvbnMgb3JkZXIgYXJlOlxuXHQgKiAtIFNlbmQgYXMgRW1haWxcblx0ICogLSBTaGFyZSBhcyBKYW0gKGlmIGF2YWlsYWJsZSlcblx0ICogLSBUZWFtcyBvcHRpb25zIChpZiBhdmFpbGFibGUpXG5cdCAqIC0gU2F2ZSBhcyB0aWxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmlldyBUaGUgdmlldyB0aGlzIGJ1aWxkaW5nIGJsb2NrIGlzIHVzZWQgaW5cblx0ICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50IGluc3RhbmNlXG5cdCAqL1xuXHRhc3luYyBfaW5pdGlhbGl6ZU1lbnVJdGVtcyh2aWV3OiBWaWV3LCBhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCkge1xuXHRcdGNvbnN0IGlzVGVhbXNNb2RlQWN0aXZlID0gYXdhaXQgQ29sbGFib3JhdGlvbkhlbHBlci5pc1RlYW1zTW9kZUFjdGl2ZSgpO1xuXHRcdGlmIChpc1RlYW1zTW9kZUFjdGl2ZSkge1xuXHRcdFx0Ly9uZWVkIHRvIGNsZWFyIHRoZSB2aXNpYmxlIHByb3BlcnR5IGJpbmRpbmdzIG90aGVyd2lzZSB3aGVuIHRoZSBiaW5kaW5nIHZhbHVlIGNoYW5nZXMgdGhlbiBpdCB3aWxsIHNldCBiYWNrIHRoZSB2aXNpYmxlIHRvIHRoZSByZXNvbHZlZCB2YWx1ZVxuXHRcdFx0dGhpcy5tZW51QnV0dG9uLmN1cnJlbnQ/LnVuYmluZFByb3BlcnR5KFwidmlzaWJsZVwiLCB0cnVlKTtcblx0XHRcdHRoaXMubWVudUJ1dHRvbi5jdXJyZW50Py5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgY29udHJvbGxlciA9IHZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyO1xuXHRcdGNvbnN0IGNvcmVSZXNvdXJjZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0Y29uc3Qgc2hlbGxTZXJ2aWNlcyA9IGFwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0Y29uc3QgaXNQbHVnaW5JbmZvU3RhYmxlID0gYXdhaXQgc2hlbGxTZXJ2aWNlcy53YWl0Rm9yUGx1Z2luc0xvYWQoKTtcblx0XHRpZiAoIWlzUGx1Z2luSW5mb1N0YWJsZSkge1xuXHRcdFx0Ly8gSW4gY2FzZSB0aGUgcGx1Z2luIGluZm8gaXMgbm90IHlldCBhdmFpbGFibGUgd2UgbmVlZCB0byBkbyB0aGlzIGNvbXB1dGF0aW9uIGFnYWluIG9uIHRoZSBuZXh0IGJ1dHRvbiBjbGlja1xuXHRcdFx0Y29uc3QgaW50ZXJuYWxCdXR0b24gPSB0aGlzLm1lbnVCdXR0b24uY3VycmVudD8uZ2V0QWdncmVnYXRpb24oXCJfY29udHJvbFwiKSBhcyBNYW5hZ2VkT2JqZWN0O1xuXHRcdFx0aW50ZXJuYWxCdXR0b24/LmF0dGFjaEV2ZW50T25jZShcInByZXNzXCIsIHt9LCAoKSA9PiB0aGlzLl9pbml0aWFsaXplTWVudUl0ZW1zLCB0aGlzKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMubWVudS5jdXJyZW50KSB7XG5cdFx0XHR0aGlzLm1lbnUuY3VycmVudC5hZGRJdGVtKFxuXHRcdFx0XHQ8TWVudUl0ZW1cblx0XHRcdFx0XHR0ZXh0PXtjb3JlUmVzb3VyY2UuZ2V0VGV4dChcIlRfU0VNQU5USUNfQ09OVFJPTF9TRU5EX0VNQUlMXCIpfVxuXHRcdFx0XHRcdGljb249e1wic2FwLWljb246Ly9lbWFpbFwifVxuXHRcdFx0XHRcdHByZXNzPXsoKSA9PiBjb250cm9sbGVyLnNoYXJlLl90cmlnZ2VyRW1haWwoKX1cblx0XHRcdFx0Lz5cblx0XHRcdCk7XG5cdFx0XHR0aGlzLl9hZGRTaGVsbEJhc2VkTWVudUl0ZW1zKGNvbnRyb2xsZXIsIHNoZWxsU2VydmljZXMsIGNvcmVSZXNvdXJjZSk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgX2FkZFNoZWxsQmFzZWRNZW51SXRlbXMoY29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIHNoZWxsU2VydmljZXM6IElTaGVsbFNlcnZpY2VzLCBjb3JlUmVzb3VyY2U6IFJlc291cmNlQnVuZGxlKSB7XG5cdFx0Y29uc3QgaGFzVXNoZWxsID0gc2hlbGxTZXJ2aWNlcy5oYXNVU2hlbGwoKTtcblx0XHRjb25zdCBoYXNKYW0gPSAhIXNoZWxsU2VydmljZXMuZ2V0VXNlcigpLmlzSmFtQWN0aXZlPy4oKTtcblxuXHRcdGNvbnN0IGNvbGxhYm9yYXRpb25UZWFtc0hlbHBlcjogVGVhbXNIZWxwZXJTZXJ2aWNlID0gYXdhaXQgU2VydmljZUNvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoKTtcblx0XHRjb25zdCBzaGFyZUNvbGxhYm9yYXRpb25PcHRpb25zOiBDb2xsYWJvcmF0aW9uT3B0aW9uc1tdID0gY29sbGFib3JhdGlvblRlYW1zSGVscGVyLmdldE9wdGlvbnMoKTtcblx0XHRpZiAoaGFzVXNoZWxsKSB7XG5cdFx0XHRpZiAoaGFzSmFtKSB7XG5cdFx0XHRcdHRoaXM/Lm1lbnU/LmN1cnJlbnQ/LmFkZEl0ZW0oXG5cdFx0XHRcdFx0PE1lbnVJdGVtXG5cdFx0XHRcdFx0XHR0ZXh0PXtjb3JlUmVzb3VyY2UuZ2V0VGV4dChcIlRfQ09NTU9OX1NBUEZFX1NIQVJFX0pBTVwiKX1cblx0XHRcdFx0XHRcdGljb249e1wic2FwLWljb246Ly9zaGFyZS0yXCJ9XG5cdFx0XHRcdFx0XHRwcmVzcz17KCkgPT4gY29udHJvbGxlci5zaGFyZS5fdHJpZ2dlclNoYXJlVG9KYW0oKX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gcHJlcGFyZSB0ZWFtcyBtZW51IGl0ZW1zXG5cdFx0XHRmb3IgKGNvbnN0IGNvbGxhYm9yYXRpb25PcHRpb24gb2Ygc2hhcmVDb2xsYWJvcmF0aW9uT3B0aW9ucykge1xuXHRcdFx0XHRjb25zdCBtZW51SXRlbVNldHRpbmdzOiAkTWVudUl0ZW1TZXR0aW5ncyA9IHtcblx0XHRcdFx0XHR0ZXh0OiBjb2xsYWJvcmF0aW9uT3B0aW9uLnRleHQsXG5cdFx0XHRcdFx0aWNvbjogY29sbGFib3JhdGlvbk9wdGlvbi5pY29uLFxuXHRcdFx0XHRcdGl0ZW1zOiBbXVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmIChjb2xsYWJvcmF0aW9uT3B0aW9uPy5zdWJPcHRpb25zICYmIGNvbGxhYm9yYXRpb25PcHRpb24/LnN1Yk9wdGlvbnM/Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRtZW51SXRlbVNldHRpbmdzLml0ZW1zID0gW107XG5cdFx0XHRcdFx0Y29sbGFib3JhdGlvbk9wdGlvbi5zdWJPcHRpb25zLmZvckVhY2goKHN1Yk9wdGlvbjogQ29sbGFib3JhdGlvbk9wdGlvbnMpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHN1Yk1lbnVJdGVtID0gbmV3IE1lbnVJdGVtKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogc3ViT3B0aW9uLnRleHQsXG5cdFx0XHRcdFx0XHRcdGljb246IHN1Yk9wdGlvbi5pY29uLFxuXHRcdFx0XHRcdFx0XHRwcmVzczogdGhpcy5jb2xsYWJvcmF0aW9uTWVudUl0ZW1QcmVzcyxcblx0XHRcdFx0XHRcdFx0Y3VzdG9tRGF0YTogbmV3IEN1c3RvbURhdGEoe1xuXHRcdFx0XHRcdFx0XHRcdGtleTogXCJjb2xsYWJvcmF0aW9uRGF0YVwiLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiBzdWJPcHRpb25cblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0aWYgKHN1Yk9wdGlvbi5mZXNyU3RlcE5hbWUpIHtcblx0XHRcdFx0XHRcdFx0RkVTUkhlbHBlci5zZXRTZW1hbnRpY1N0ZXBuYW1lKHN1Yk1lbnVJdGVtLCBcInByZXNzXCIsIHN1Yk9wdGlvbi5mZXNyU3RlcE5hbWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0KG1lbnVJdGVtU2V0dGluZ3MuaXRlbXMgYXMgTWVudUl0ZW1bXSkucHVzaChzdWJNZW51SXRlbSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGhlcmUgYXJlIG5vIHN1YiBvcHRpb24gdGhlbiB0aGUgbWFpbiBvcHRpb24gc2hvdWxkIGJlIGNsaWNrYWJsZVxuXHRcdFx0XHRcdC8vIHNvIGFkZCBhIHByZXNzIGhhbmRsZXIuXG5cdFx0XHRcdFx0bWVudUl0ZW1TZXR0aW5ncy5wcmVzcyA9IHRoaXMuY29sbGFib3JhdGlvbk1lbnVJdGVtUHJlc3M7XG5cdFx0XHRcdFx0bWVudUl0ZW1TZXR0aW5nc1tcImN1c3RvbURhdGFcIl0gPSBuZXcgQ3VzdG9tRGF0YSh7XG5cdFx0XHRcdFx0XHRrZXk6IFwiY29sbGFib3JhdGlvbkRhdGFcIixcblx0XHRcdFx0XHRcdHZhbHVlOiBjb2xsYWJvcmF0aW9uT3B0aW9uXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgbWVudUl0ZW0gPSBuZXcgTWVudUl0ZW0obWVudUl0ZW1TZXR0aW5ncyk7XG5cdFx0XHRcdGlmIChtZW51SXRlbVNldHRpbmdzLnByZXNzICYmIGNvbGxhYm9yYXRpb25PcHRpb24uZmVzclN0ZXBOYW1lKSB7XG5cdFx0XHRcdFx0RkVTUkhlbHBlci5zZXRTZW1hbnRpY1N0ZXBuYW1lKG1lbnVJdGVtLCBcInByZXNzXCIsIGNvbGxhYm9yYXRpb25PcHRpb24uZmVzclN0ZXBOYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzPy5tZW51Py5jdXJyZW50Py5hZGRJdGVtKG1lbnVJdGVtKTtcblx0XHRcdH1cblx0XHRcdC8vIHNldCBzYXZlIGFzIHRpbGVcblx0XHRcdC8vIGZvciBub3cgd2UgbmVlZCB0byBjcmVhdGUgYWRkQm9va21hcmtCdXR0b24gdG8gdXNlIHRoZSBzYXZlIGFzIHRpbGUgZmVhdHVyZS5cblx0XHRcdC8vIEluIHRoZSBmdXR1cmUgc2F2ZSBhcyB0aWxlIHNob3VsZCBiZSBhdmFpbGFibGUgYXMgYW4gQVBJIG9yIGEgTWVudUl0ZW0gc28gdGhhdCBpdCBjYW4gYmUgYWRkZWQgdG8gdGhlIE1lbnUgYnV0dG9uLlxuXHRcdFx0Ly8gVGhpcyBuZWVkcyB0byBiZSBkaXNjdXNzZWQgd2l0aCBBZGRCb29rbWFya0J1dHRvbiB0ZWFtLlxuXHRcdFx0Y29uc3QgYWRkQm9va21hcmtCdXR0b24gPSBuZXcgQWRkQm9va21hcmtCdXR0b24oKTtcblx0XHRcdGlmIChhZGRCb29rbWFya0J1dHRvbi5nZXRFbmFibGVkKCkpIHtcblx0XHRcdFx0dGhpcz8ubWVudT8uY3VycmVudD8uYWRkSXRlbShcblx0XHRcdFx0XHQ8TWVudUl0ZW1cblx0XHRcdFx0XHRcdHJlZj17dGhpcy5zYXZlQXNUaWxlTWVudUl0ZW19XG5cdFx0XHRcdFx0XHR0ZXh0PXthZGRCb29rbWFya0J1dHRvbi5nZXRUZXh0KCl9XG5cdFx0XHRcdFx0XHRpY29uPXthZGRCb29rbWFya0J1dHRvbi5nZXRJY29uKCl9XG5cdFx0XHRcdFx0XHRwcmVzcz17KCkgPT4gY29udHJvbGxlci5zaGFyZS5fc2F2ZUFzVGlsZSh0aGlzLnNhdmVBc1RpbGVNZW51SXRlbS5jdXJyZW50KX1cblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHR7eyBkZXBlbmRlbnRzOiBbYWRkQm9va21hcmtCdXR0b25dIH19XG5cdFx0XHRcdFx0PC9NZW51SXRlbT5cblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFkZEJvb2ttYXJrQnV0dG9uLmRlc3Ryb3koKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRhc3luYyBjb2xsYWJvcmF0aW9uTWVudUl0ZW1QcmVzcyhldmVudDogVUk1RXZlbnQpIHtcblx0XHRjb25zdCBjbGlja2VkTWVudUl0ZW0gPSBldmVudC5nZXRTb3VyY2UoKSBhcyBNZW51SXRlbTtcblx0XHRjb25zdCBjb2xsYWJvcmF0aW9uVGVhbXNIZWxwZXI6IFRlYW1zSGVscGVyU2VydmljZSA9IGF3YWl0IFNlcnZpY2VDb250YWluZXIuZ2V0U2VydmljZUFzeW5jKCk7XG5cdFx0Y29uc3QgdmlldzogVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoY2xpY2tlZE1lbnVJdGVtKTtcblx0XHRjb25zdCBjb250cm9sbGVyOiBQYWdlQ29udHJvbGxlciA9IHZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyO1xuXHRcdC8vIGNhbGwgYWRhcHQgc2hhcmUgbWV0YWRhdGEgc28gdGhhdCB0aGUgY29sbGFib3JhdGlvbiBpbmZvIG1vZGVsIGlzIHVwZGF0ZWQgd2l0aCB0aGUgcmVxdWlyZWQgaW5mb1xuXHRcdGF3YWl0IGNvbnRyb2xsZXIuc2hhcmUuX2FkYXB0U2hhcmVNZXRhZGF0YSgpO1xuXHRcdGNvbnN0IGNvbGxhYm9yYXRpb25JbmZvID0gKHZpZXcuZ2V0TW9kZWwoXCJjb2xsYWJvcmF0aW9uSW5mb1wiKSBhcyBKU09OTW9kZWwpLmdldERhdGEoKTtcblx0XHRjb2xsYWJvcmF0aW9uVGVhbXNIZWxwZXIuc2hhcmUoY2xpY2tlZE1lbnVJdGVtLmRhdGEoXCJjb2xsYWJvcmF0aW9uRGF0YVwiKSwgY29sbGFib3JhdGlvbkluZm8pO1xuXHR9XG5cblx0Z2V0Q29udGVudCh2aWV3OiBWaWV3LCBhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCkge1xuXHRcdC8vIEN0cmwrU2hpZnQrUyBpcyBuZWVkZWQgZm9yIHRoZSB0aW1lIGJlaW5nIGJ1dCB0aGlzIG5lZWRzIHRvIGJlIHJlbW92ZWQgYWZ0ZXIgYmFja2xvZyBmcm9tIG1lbnUgYnV0dG9uXG5cdFx0Y29uc3QgbWVudUJ1dHRvbiA9IChcblx0XHRcdDxTaGFyZUFQSSBpZD17dGhpcy5pZH0+XG5cdFx0XHRcdDxNZW51QnV0dG9uXG5cdFx0XHRcdFx0cmVmPXt0aGlzLm1lbnVCdXR0b259XG5cdFx0XHRcdFx0aWNvbj17XCJzYXAtaWNvbjovL2FjdGlvblwifVxuXHRcdFx0XHRcdHZpc2libGU9e3RoaXMudmlzaWJsZSBhcyBhbnl9XG5cdFx0XHRcdFx0dG9vbHRpcD17XCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fU0FQRkVfQUNUSU9OX1NIQVJFfSAoQ3RybCtTaGlmdCtTKVwifVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PE1lbnUgcmVmPXt0aGlzLm1lbnV9PjwvTWVudT5cblx0XHRcdFx0PC9NZW51QnV0dG9uPlxuXHRcdFx0PC9TaGFyZUFQST5cblx0XHQpO1xuXHRcdHZpZXcuYWRkRGVwZW5kZW50KFxuXHRcdFx0PENvbW1hbmRFeGVjdXRpb25cblx0XHRcdFx0dmlzaWJsZT17dGhpcy52aXNpYmxlfVxuXHRcdFx0XHRlbmFibGVkPXt0aGlzLnZpc2libGV9XG5cdFx0XHRcdGNvbW1hbmQ9XCJTaGFyZVwiXG5cdFx0XHRcdGV4ZWN1dGU9eygpID0+IHRoaXMubWVudUJ1dHRvbi5jdXJyZW50Py5nZXRNZW51KCkub3BlbkJ5KHRoaXMubWVudUJ1dHRvbi5jdXJyZW50LCB0cnVlKX1cblx0XHRcdC8+XG5cdFx0KTtcblx0XHQvLyBUaGUgaW5pdGlhbGl6YXRpb24gaXMgYXN5bmNocm9ub3VzLCBzbyB3ZSBqdXN0IHRyaWdnZXIgaXQgYW5kIGhvcGUgZm9yIHRoZSBiZXN0IDpEXG5cdFx0dGhpcy5pc0luaXRpYWxpemVkID0gdGhpcy5faW5pdGlhbGl6ZU1lbnVJdGVtcyh2aWV3LCBhcHBDb21wb25lbnQpLmNhdGNoKChlcnJvcikgPT4ge1xuXHRcdFx0TG9nLmVycm9yKGVycm9yIGFzIHN0cmluZyk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG1lbnVCdXR0b247XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztNQXFEcUJBLGtCQUFrQjtFQTFCdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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