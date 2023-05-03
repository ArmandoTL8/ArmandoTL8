/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ClassSupport", "sap/fe/templates/ObjectPage/ObjectPageTemplating", "sap/m/Button", "sap/m/ResponsivePopover", "sap/m/SelectList", "sap/ui/core/InvisibleText", "sap/ui/core/Item", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/jsxs", "sap/fe/core/jsx-runtime/Fragment"], function (BuildingBlock, CommonUtils, BindingHelper, BindingToolkit, ClassSupport, ObjectPageTemplating, Button, ResponsivePopover, SelectList, InvisibleText, Item, _jsx, _jsxs, _Fragment) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var _exports = {};
  var getSwitchDraftAndActiveVisibility = ObjectPageTemplating.getSwitchDraftAndActiveVisibility;
  var defineReference = ClassSupport.defineReference;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let DraftHandlerButton = (_dec = defineBuildingBlock({
    name: "DraftHandlerButton",
    namespace: "sap.fe.templates.ObjectPage.components",
    isRuntime: true
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec4 = defineReference(), _dec5 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(DraftHandlerButton, _BuildingBlockBase);
    function DraftHandlerButton(oProps) {
      var _this;
      _this = _BuildingBlockBase.call(this, oProps) || this;
      _this.SWITCH_TO_DRAFT_KEY = "switchToDraft";
      _this.SWITCH_TO_ACTIVE_KEY = "switchToActive";
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "switchToActiveRef", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "switchToDraftRef", _descriptor4, _assertThisInitialized(_this));
      _this.initialSelectedKey = _this.SWITCH_TO_ACTIVE_KEY;
      _this.handleSelectedItemChange = event => {
        const selectedItemKey = event.getParameter("item").getProperty("key");
        if (selectedItemKey !== _this.initialSelectedKey) {
          _this._containingView.getController().editFlow.toggleDraftActive(_this._containingView.getBindingContext());
        }
        if (_this.popover) {
          _this.popover.close();
          _this.popover.destroy();
          delete _this.popover;
        }
      };
      _this.openSwitchActivePopover = event => {
        const sourceControl = event.getSource();
        const containingView = CommonUtils.getTargetView(sourceControl);
        const context = containingView.getBindingContext();
        const isActiveEntity = context.getObject().IsActiveEntity;
        _this.initialSelectedKey = isActiveEntity ? _this.SWITCH_TO_ACTIVE_KEY : _this.SWITCH_TO_DRAFT_KEY;
        _this.popover = _this.createPopover();
        _this._containingView = containingView;
        containingView.addDependent(_this.popover);
        _this.popover.openBy(sourceControl);
        _this.popover.attachEventOnce("afterOpen", () => {
          if (isActiveEntity) {
            var _this$switchToDraftRe;
            (_this$switchToDraftRe = _this.switchToDraftRef.current) === null || _this$switchToDraftRe === void 0 ? void 0 : _this$switchToDraftRe.focus();
          } else {
            var _this$switchToActiveR;
            (_this$switchToActiveR = _this.switchToActiveRef.current) === null || _this$switchToActiveR === void 0 ? void 0 : _this$switchToActiveR.focus();
          }
        });
        return _this.popover;
      };
      return _this;
    }
    _exports = DraftHandlerButton;
    var _proto = DraftHandlerButton.prototype;
    _proto.createPopover = function createPopover() {
      return _jsx(ResponsivePopover, {
        showHeader: false,
        contentWidth: "15.625rem",
        verticalScrolling: false,
        class: "sapUiNoContentPadding",
        placement: "Bottom",
        children: _jsxs(SelectList, {
          selectedKey: this.initialSelectedKey,
          itemPress: this.handleSelectedItemChange,
          children: [_jsx(Item, {
            text: "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_DRAFT_MIT}",
            ref: this.switchToDraftRef
          }, this.SWITCH_TO_DRAFT_KEY), _jsx(Item, {
            text: "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_SAVED_VERSION_MIT}",
            ref: this.switchToActiveRef
          }, this.SWITCH_TO_ACTIVE_KEY)]
        })
      });
    };
    _proto.getContent = function getContent() {
      const textValue = ifElse(and(not(UI.IsEditable), not(UI.IsCreateMode), Entity.HasDraft), pathInModel("C_COMMON_OBJECT_PAGE_SAVED_VERSION_BUT", "sap.fe.i18n"), pathInModel("C_COMMON_OBJECT_PAGE_DRAFT_BUT", "sap.fe.i18n"));
      const visible = getSwitchDraftAndActiveVisibility(this.contextPath.getObject("@"));
      return _jsxs(_Fragment, {
        children: [_jsx(Button, {
          id: "fe::StandardAction::SwitchDraftAndActiveObject",
          text: textValue,
          visible: visible,
          icon: "sap-icon://navigation-down-arrow",
          iconFirst: false,
          type: "Transparent",
          press: this.openSwitchActivePopover,
          ariaDescribedBy: ["fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"]
        }), _jsx(InvisibleText, {
          text: "{sap.fe.i18n>T_HEADER_DATAPOINT_TITLE_DRAFT_SWITCHER_ARIA_BUTTON}",
          id: "fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"
        })]
      });
    };
    return DraftHandlerButton;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "switchToActiveRef", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "switchToDraftRef", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DraftHandlerButton;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFmdEhhbmRsZXJCdXR0b24iLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImlzUnVudGltZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsImRlZmluZVJlZmVyZW5jZSIsIm9Qcm9wcyIsIlNXSVRDSF9UT19EUkFGVF9LRVkiLCJTV0lUQ0hfVE9fQUNUSVZFX0tFWSIsImluaXRpYWxTZWxlY3RlZEtleSIsImhhbmRsZVNlbGVjdGVkSXRlbUNoYW5nZSIsImV2ZW50Iiwic2VsZWN0ZWRJdGVtS2V5IiwiZ2V0UGFyYW1ldGVyIiwiZ2V0UHJvcGVydHkiLCJfY29udGFpbmluZ1ZpZXciLCJnZXRDb250cm9sbGVyIiwiZWRpdEZsb3ciLCJ0b2dnbGVEcmFmdEFjdGl2ZSIsImdldEJpbmRpbmdDb250ZXh0IiwicG9wb3ZlciIsImNsb3NlIiwiZGVzdHJveSIsIm9wZW5Td2l0Y2hBY3RpdmVQb3BvdmVyIiwic291cmNlQ29udHJvbCIsImdldFNvdXJjZSIsImNvbnRhaW5pbmdWaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiY29udGV4dCIsImlzQWN0aXZlRW50aXR5IiwiZ2V0T2JqZWN0IiwiSXNBY3RpdmVFbnRpdHkiLCJjcmVhdGVQb3BvdmVyIiwiYWRkRGVwZW5kZW50Iiwib3BlbkJ5IiwiYXR0YWNoRXZlbnRPbmNlIiwic3dpdGNoVG9EcmFmdFJlZiIsImN1cnJlbnQiLCJmb2N1cyIsInN3aXRjaFRvQWN0aXZlUmVmIiwiZ2V0Q29udGVudCIsInRleHRWYWx1ZSIsImlmRWxzZSIsImFuZCIsIm5vdCIsIlVJIiwiSXNFZGl0YWJsZSIsIklzQ3JlYXRlTW9kZSIsIkVudGl0eSIsIkhhc0RyYWZ0IiwicGF0aEluTW9kZWwiLCJ2aXNpYmxlIiwiZ2V0U3dpdGNoRHJhZnRBbmRBY3RpdmVWaXNpYmlsaXR5IiwiY29udGV4dFBhdGgiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRHJhZnRIYW5kbGVyQnV0dG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgRW50aXR5LCBVSSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHsgYW5kLCBpZkVsc2UsIG5vdCwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgZGVmaW5lUmVmZXJlbmNlLCBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IFJlZiB9IGZyb20gXCJzYXAvZmUvY29yZS9qc3gtcnVudGltZS9qc3hcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IGdldFN3aXRjaERyYWZ0QW5kQWN0aXZlVmlzaWJpbGl0eSB9IGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvT2JqZWN0UGFnZVRlbXBsYXRpbmdcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IFJlc3BvbnNpdmVQb3BvdmVyIGZyb20gXCJzYXAvbS9SZXNwb25zaXZlUG9wb3ZlclwiO1xuaW1wb3J0IFNlbGVjdExpc3QgZnJvbSBcInNhcC9tL1NlbGVjdExpc3RcIjtcbmltcG9ydCBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgSW52aXNpYmxlVGV4dCBmcm9tIFwic2FwL3VpL2NvcmUvSW52aXNpYmxlVGV4dFwiO1xuaW1wb3J0IEl0ZW0gZnJvbSBcInNhcC91aS9jb3JlL0l0ZW1cIjtcbmltcG9ydCBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soeyBuYW1lOiBcIkRyYWZ0SGFuZGxlckJ1dHRvblwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLmNvbXBvbmVudHNcIiwgaXNSdW50aW1lOiB0cnVlIH0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcmFmdEhhbmRsZXJCdXR0b24gZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdHByaXZhdGUgX2NvbnRhaW5pbmdWaWV3ITogVmlldztcblx0cHJpdmF0ZSBwb3BvdmVyPzogUmVzcG9uc2l2ZVBvcG92ZXI7XG5cblx0cHJpdmF0ZSByZWFkb25seSBTV0lUQ0hfVE9fRFJBRlRfS0VZID0gXCJzd2l0Y2hUb0RyYWZ0XCI7XG5cdHByaXZhdGUgcmVhZG9ubHkgU1dJVENIX1RPX0FDVElWRV9LRVkgPSBcInN3aXRjaFRvQWN0aXZlXCI7XG5cblx0Y29uc3RydWN0b3Iob1Byb3BzOiBQcm9wZXJ0aWVzT2Y8RHJhZnRIYW5kbGVyQnV0dG9uPikge1xuXHRcdHN1cGVyKG9Qcm9wcyk7XG5cdH1cblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHB1YmxpYyBpZCE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIgfSlcblx0cHVibGljIGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHRAZGVmaW5lUmVmZXJlbmNlKClcblx0cHVibGljIHN3aXRjaFRvQWN0aXZlUmVmITogUmVmPEl0ZW0+O1xuXHRAZGVmaW5lUmVmZXJlbmNlKClcblx0cHVibGljIHN3aXRjaFRvRHJhZnRSZWYhOiBSZWY8SXRlbT47XG5cblx0cHJpdmF0ZSBpbml0aWFsU2VsZWN0ZWRLZXk6IHN0cmluZyA9IHRoaXMuU1dJVENIX1RPX0FDVElWRV9LRVk7XG5cblx0aGFuZGxlU2VsZWN0ZWRJdGVtQ2hhbmdlID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuXHRcdGNvbnN0IHNlbGVjdGVkSXRlbUtleSA9IGV2ZW50LmdldFBhcmFtZXRlcihcIml0ZW1cIikuZ2V0UHJvcGVydHkoXCJrZXlcIik7XG5cdFx0aWYgKHNlbGVjdGVkSXRlbUtleSAhPT0gdGhpcy5pbml0aWFsU2VsZWN0ZWRLZXkpIHtcblx0XHRcdCh0aGlzLl9jb250YWluaW5nVmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLmVkaXRGbG93LnRvZ2dsZURyYWZ0QWN0aXZlKFxuXHRcdFx0XHR0aGlzLl9jb250YWluaW5nVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIFY0Q29udGV4dFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0aWYgKHRoaXMucG9wb3Zlcikge1xuXHRcdFx0dGhpcy5wb3BvdmVyLmNsb3NlKCk7XG5cdFx0XHR0aGlzLnBvcG92ZXIuZGVzdHJveSgpO1xuXHRcdFx0ZGVsZXRlIHRoaXMucG9wb3Zlcjtcblx0XHR9XG5cdH07XG5cblx0b3BlblN3aXRjaEFjdGl2ZVBvcG92ZXIgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG5cdFx0Y29uc3Qgc291cmNlQ29udHJvbCA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2w7XG5cdFx0Y29uc3QgY29udGFpbmluZ1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHNvdXJjZUNvbnRyb2wpO1xuXG5cdFx0Y29uc3QgY29udGV4dDogVjRDb250ZXh0ID0gY29udGFpbmluZ1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBWNENvbnRleHQ7XG5cdFx0Y29uc3QgaXNBY3RpdmVFbnRpdHkgPSBjb250ZXh0LmdldE9iamVjdCgpLklzQWN0aXZlRW50aXR5O1xuXHRcdHRoaXMuaW5pdGlhbFNlbGVjdGVkS2V5ID0gaXNBY3RpdmVFbnRpdHkgPyB0aGlzLlNXSVRDSF9UT19BQ1RJVkVfS0VZIDogdGhpcy5TV0lUQ0hfVE9fRFJBRlRfS0VZO1xuXHRcdHRoaXMucG9wb3ZlciA9IHRoaXMuY3JlYXRlUG9wb3ZlcigpO1xuXG5cdFx0dGhpcy5fY29udGFpbmluZ1ZpZXcgPSBjb250YWluaW5nVmlldztcblx0XHRjb250YWluaW5nVmlldy5hZGREZXBlbmRlbnQodGhpcy5wb3BvdmVyKTtcblx0XHR0aGlzLnBvcG92ZXIub3BlbkJ5KHNvdXJjZUNvbnRyb2wpO1xuXHRcdHRoaXMucG9wb3Zlci5hdHRhY2hFdmVudE9uY2UoXCJhZnRlck9wZW5cIiwgKCkgPT4ge1xuXHRcdFx0aWYgKGlzQWN0aXZlRW50aXR5KSB7XG5cdFx0XHRcdHRoaXMuc3dpdGNoVG9EcmFmdFJlZi5jdXJyZW50Py5mb2N1cygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zd2l0Y2hUb0FjdGl2ZVJlZi5jdXJyZW50Py5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB0aGlzLnBvcG92ZXI7XG5cdH07XG5cblx0Y3JlYXRlUG9wb3ZlcigpOiBSZXNwb25zaXZlUG9wb3ZlciB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxSZXNwb25zaXZlUG9wb3ZlclxuXHRcdFx0XHRzaG93SGVhZGVyPXtmYWxzZX1cblx0XHRcdFx0Y29udGVudFdpZHRoPXtcIjE1LjYyNXJlbVwifVxuXHRcdFx0XHR2ZXJ0aWNhbFNjcm9sbGluZz17ZmFsc2V9XG5cdFx0XHRcdGNsYXNzPXtcInNhcFVpTm9Db250ZW50UGFkZGluZ1wifVxuXHRcdFx0XHRwbGFjZW1lbnQ9e1wiQm90dG9tXCJ9XG5cdFx0XHQ+XG5cdFx0XHRcdDxTZWxlY3RMaXN0IHNlbGVjdGVkS2V5PXt0aGlzLmluaXRpYWxTZWxlY3RlZEtleX0gaXRlbVByZXNzPXt0aGlzLmhhbmRsZVNlbGVjdGVkSXRlbUNoYW5nZX0+XG5cdFx0XHRcdFx0PEl0ZW1cblx0XHRcdFx0XHRcdHRleHQ9e1wie3NhcC5mZS5pMThuPkNfQ09NTU9OX09CSkVDVF9QQUdFX0RJU1BMQVlfRFJBRlRfTUlUfVwifVxuXHRcdFx0XHRcdFx0a2V5PXt0aGlzLlNXSVRDSF9UT19EUkFGVF9LRVl9XG5cdFx0XHRcdFx0XHRyZWY9e3RoaXMuc3dpdGNoVG9EcmFmdFJlZn1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDxJdGVtXG5cdFx0XHRcdFx0XHR0ZXh0PXtcIntzYXAuZmUuaTE4bj5DX0NPTU1PTl9PQkpFQ1RfUEFHRV9ESVNQTEFZX1NBVkVEX1ZFUlNJT05fTUlUfVwifVxuXHRcdFx0XHRcdFx0a2V5PXt0aGlzLlNXSVRDSF9UT19BQ1RJVkVfS0VZfVxuXHRcdFx0XHRcdFx0cmVmPXt0aGlzLnN3aXRjaFRvQWN0aXZlUmVmfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvU2VsZWN0TGlzdD5cblx0XHRcdDwvUmVzcG9uc2l2ZVBvcG92ZXI+XG5cdFx0KTtcblx0fVxuXG5cdGdldENvbnRlbnQoKSB7XG5cdFx0Y29uc3QgdGV4dFZhbHVlID0gaWZFbHNlKFxuXHRcdFx0YW5kKG5vdChVSS5Jc0VkaXRhYmxlKSwgbm90KFVJLklzQ3JlYXRlTW9kZSksIEVudGl0eS5IYXNEcmFmdCksXG5cdFx0XHRwYXRoSW5Nb2RlbChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX1NBVkVEX1ZFUlNJT05fQlVUXCIsIFwic2FwLmZlLmkxOG5cIiksXG5cdFx0XHRwYXRoSW5Nb2RlbChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0RSQUZUX0JVVFwiLCBcInNhcC5mZS5pMThuXCIpXG5cdFx0KTtcblx0XHRjb25zdCB2aXNpYmxlID0gZ2V0U3dpdGNoRHJhZnRBbmRBY3RpdmVWaXNpYmlsaXR5KHRoaXMuY29udGV4dFBhdGguZ2V0T2JqZWN0KFwiQFwiKSk7XG5cdFx0cmV0dXJuIChcblx0XHRcdDw+XG5cdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRpZD1cImZlOjpTdGFuZGFyZEFjdGlvbjo6U3dpdGNoRHJhZnRBbmRBY3RpdmVPYmplY3RcIlxuXHRcdFx0XHRcdHRleHQ9e3RleHRWYWx1ZX1cblx0XHRcdFx0XHR2aXNpYmxlPXt2aXNpYmxlfVxuXHRcdFx0XHRcdGljb249XCJzYXAtaWNvbjovL25hdmlnYXRpb24tZG93bi1hcnJvd1wiXG5cdFx0XHRcdFx0aWNvbkZpcnN0PXtmYWxzZX1cblx0XHRcdFx0XHR0eXBlPVwiVHJhbnNwYXJlbnRcIlxuXHRcdFx0XHRcdHByZXNzPXt0aGlzLm9wZW5Td2l0Y2hBY3RpdmVQb3BvdmVyfVxuXHRcdFx0XHRcdGFyaWFEZXNjcmliZWRCeT17W1wiZmU6OlN0YW5kYXJkQWN0aW9uOjpTd2l0Y2hEcmFmdEFuZEFjdGl2ZU9iamVjdDo6QXJpYVRleHREcmFmdFN3aXRjaGVyXCJdfVxuXHRcdFx0XHQ+PC9CdXR0b24+XG5cdFx0XHRcdDxJbnZpc2libGVUZXh0XG5cdFx0XHRcdFx0dGV4dD1cIntzYXAuZmUuaTE4bj5UX0hFQURFUl9EQVRBUE9JTlRfVElUTEVfRFJBRlRfU1dJVENIRVJfQVJJQV9CVVRUT059XCJcblx0XHRcdFx0XHRpZD1cImZlOjpTdGFuZGFyZEFjdGlvbjo6U3dpdGNoRHJhZnRBbmRBY3RpdmVPYmplY3Q6OkFyaWFUZXh0RHJhZnRTd2l0Y2hlclwiXG5cdFx0XHRcdC8+XG5cdFx0XHQ8Lz5cblx0XHQpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01Bb0JxQkEsa0JBQWtCLFdBRHRDQyxtQkFBbUIsQ0FBQztJQUFFQyxJQUFJLEVBQUUsb0JBQW9CO0lBQUVDLFNBQVMsRUFBRSx3Q0FBd0M7SUFBRUMsU0FBUyxFQUFFO0VBQUssQ0FBQyxDQUFD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