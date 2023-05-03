/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/Control"], function (ClassSupport, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FieldWrapper = (_dec = defineUI5Class("sap.fe.core.controls.FieldWrapper"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "sap.ui.core.TextAlign"
  }), _dec4 = property({
    type: "sap.ui.core.CSSSize",
    defaultValue: null
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec6 = property({
    type: "string",
    defaultValue: "Display"
  }), _dec7 = property({
    type: "boolean",
    defaultValue: false
  }), _dec8 = association({
    type: "sap.ui.core.Control",
    multiple: true,
    singularName: "ariaLabelledBy"
  }), _dec9 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec10 = aggregation({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(FieldWrapper, _Control);
    function FieldWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "textAlign", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formDoNotAdjustWidth", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editMode", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "required", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentDisplay", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentEdit", _descriptor9, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FieldWrapper.prototype;
    _proto.enhanceAccessibilityState = function enhanceAccessibilityState(oElement, mAriaProps) {
      const oParent = this.getParent();
      if (oParent && oParent.enhanceAccessibilityState) {
        // use FieldWrapper as control, but aria properties of rendered inner control.
        oParent.enhanceAccessibilityState(this, mAriaProps);
      }
      return mAriaProps;
    };
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      let oContent;
      if (this.editMode === "Display") {
        oContent = this.contentDisplay;
      } else {
        oContent = this.contentEdit.length ? this.contentEdit[0] : null;
      }
      return oContent && oContent.getAccessibilityInfo ? oContent.getAccessibilityInfo() : {};
    }

    /**
     * Returns the DOMNode ID to be used for the "labelFor" attribute.
     *
     * We forward the call of this method to the content control.
     *
     * @returns ID to be used for the <code>labelFor</code>
     */;
    _proto.getIdForLabel = function getIdForLabel() {
      var _oContent;
      let oContent;
      if (this.editMode === "Display") {
        oContent = this.contentDisplay;
      } else {
        oContent = this.contentEdit.length ? this.contentEdit[0] : null;
      }
      return (_oContent = oContent) === null || _oContent === void 0 ? void 0 : _oContent.getIdForLabel();
    };
    _proto._setAriaLabelledBy = function _setAriaLabelledBy(oContent) {
      if (oContent && oContent.addAriaLabelledBy) {
        const aAriaLabelledBy = this.ariaLabelledBy;
        for (let i = 0; i < aAriaLabelledBy.length; i++) {
          const sId = aAriaLabelledBy[i];
          const aAriaLabelledBys = oContent.getAriaLabelledBy() || [];
          if (aAriaLabelledBys.indexOf(sId) === -1) {
            oContent.addAriaLabelledBy(sId);
          }
        }
      }
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      // before calling the renderer of the FieldWrapper parent control may have set ariaLabelledBy
      // we ensure it is passed to its inner controls
      this._setAriaLabelledBy(this.contentDisplay);
      const aContentEdit = this.contentEdit;
      for (let i = 0; i < aContentEdit.length; i++) {
        this._setAriaLabelledBy(aContentEdit[i]);
      }
    };
    FieldWrapper.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.style("text-align", oControl.textAlign);
      if (oControl.editMode === "Display") {
        oRm.style("width", oControl.width);
        oRm.openEnd();
        oRm.renderControl(oControl.contentDisplay); // render the child Control for display
      } else {
        const aContentEdit = oControl.contentEdit;

        // if (aContentEdit.length > 1) {
        // 	oRm.class("sapUiMdcFieldBaseMoreFields");
        // }
        oRm.style("width", oControl.width);
        oRm.openEnd();
        for (let i = 0; i < aContentEdit.length; i++) {
          const oContent = aContentEdit[i]; // render the child Control  for edit
          oRm.renderControl(oContent);
        }
      }
      oRm.close("div"); // end of the complete Control
    };
    return FieldWrapper;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "textAlign", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "formDoNotAdjustWidth", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "editMode", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "required", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "contentDisplay", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "contentEdit", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FieldWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWVsZFdyYXBwZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzaW5ndWxhck5hbWUiLCJhZ2dyZWdhdGlvbiIsImlzRGVmYXVsdCIsImVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUiLCJvRWxlbWVudCIsIm1BcmlhUHJvcHMiLCJvUGFyZW50IiwiZ2V0UGFyZW50IiwiZ2V0QWNjZXNzaWJpbGl0eUluZm8iLCJvQ29udGVudCIsImVkaXRNb2RlIiwiY29udGVudERpc3BsYXkiLCJjb250ZW50RWRpdCIsImxlbmd0aCIsImdldElkRm9yTGFiZWwiLCJfc2V0QXJpYUxhYmVsbGVkQnkiLCJhZGRBcmlhTGFiZWxsZWRCeSIsImFBcmlhTGFiZWxsZWRCeSIsImFyaWFMYWJlbGxlZEJ5IiwiaSIsInNJZCIsImFBcmlhTGFiZWxsZWRCeXMiLCJnZXRBcmlhTGFiZWxsZWRCeSIsImluZGV4T2YiLCJvbkJlZm9yZVJlbmRlcmluZyIsImFDb250ZW50RWRpdCIsInJlbmRlciIsIm9SbSIsIm9Db250cm9sIiwib3BlblN0YXJ0Iiwic3R5bGUiLCJ0ZXh0QWxpZ24iLCJ3aWR0aCIsIm9wZW5FbmQiLCJyZW5kZXJDb250cm9sIiwiY2xvc2UiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWVsZFdyYXBwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYWdncmVnYXRpb24sIGFzc29jaWF0aW9uLCBkZWZpbmVVSTVDbGFzcywgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIHsgQ1NTU2l6ZSwgSUZvcm1Db250ZW50LCBUZXh0QWxpZ24gfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgUmVuZGVyTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvUmVuZGVyTWFuYWdlclwiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9scy5GaWVsZFdyYXBwZXJcIilcbmNsYXNzIEZpZWxkV3JhcHBlciBleHRlbmRzIENvbnRyb2wgaW1wbGVtZW50cyBJRm9ybUNvbnRlbnQge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUZvcm1Db250ZW50XCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX2NvcmVfSUZvcm1Db250ZW50OiBib29sZWFuID0gdHJ1ZTtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInNhcC51aS5jb3JlLlRleHRBbGlnblwiIH0pXG5cdHRleHRBbGlnbiE6IFRleHRBbGlnbjtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInNhcC51aS5jb3JlLkNTU1NpemVcIiwgZGVmYXVsdFZhbHVlOiBudWxsIH0pXG5cdHdpZHRoITogQ1NTU2l6ZTtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRmb3JtRG9Ob3RBZGp1c3RXaWR0aCE6IGJvb2xlYW47XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcIkRpc3BsYXlcIiB9KVxuXHRlZGl0TW9kZSE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRyZXF1aXJlZCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFzc29jaWF0aW9uIHRvIGNvbnRyb2xzIC8gSURzIHRoYXQgbGFiZWwgdGhpcyBjb250cm9sIChzZWUgV0FJLUFSSUEgYXR0cmlidXRlIGFyaWEtbGFiZWxsZWRieSkuXG5cdCAqL1xuXHRAYXNzb2NpYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IHRydWUsIHNpbmd1bGFyTmFtZTogXCJhcmlhTGFiZWxsZWRCeVwiIH0pXG5cdGFyaWFMYWJlbGxlZEJ5ITogQ29udHJvbFtdO1xuXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLCBtdWx0aXBsZTogZmFsc2UsIGlzRGVmYXVsdDogdHJ1ZSB9KVxuXHRjb250ZW50RGlzcGxheSE6IENvbnRyb2w7XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiB0cnVlIH0pXG5cdGNvbnRlbnRFZGl0ITogQ29udHJvbFtdO1xuXG5cdGVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUob0VsZW1lbnQ6IGFueSwgbUFyaWFQcm9wczogYW55KSB7XG5cdFx0Y29uc3Qgb1BhcmVudCA9IHRoaXMuZ2V0UGFyZW50KCkgYXMgYW55O1xuXG5cdFx0aWYgKG9QYXJlbnQgJiYgb1BhcmVudC5lbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlKSB7XG5cdFx0XHQvLyB1c2UgRmllbGRXcmFwcGVyIGFzIGNvbnRyb2wsIGJ1dCBhcmlhIHByb3BlcnRpZXMgb2YgcmVuZGVyZWQgaW5uZXIgY29udHJvbC5cblx0XHRcdG9QYXJlbnQuZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZSh0aGlzLCBtQXJpYVByb3BzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbUFyaWFQcm9wcztcblx0fVxuXHRnZXRBY2Nlc3NpYmlsaXR5SW5mbygpIHtcblx0XHRsZXQgb0NvbnRlbnQ7XG5cdFx0aWYgKHRoaXMuZWRpdE1vZGUgPT09IFwiRGlzcGxheVwiKSB7XG5cdFx0XHRvQ29udGVudCA9IHRoaXMuY29udGVudERpc3BsYXk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9Db250ZW50ID0gdGhpcy5jb250ZW50RWRpdC5sZW5ndGggPyB0aGlzLmNvbnRlbnRFZGl0WzBdIDogbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIG9Db250ZW50ICYmIG9Db250ZW50LmdldEFjY2Vzc2liaWxpdHlJbmZvID8gb0NvbnRlbnQuZ2V0QWNjZXNzaWJpbGl0eUluZm8oKSA6IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIERPTU5vZGUgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIFwibGFiZWxGb3JcIiBhdHRyaWJ1dGUuXG5cdCAqXG5cdCAqIFdlIGZvcndhcmQgdGhlIGNhbGwgb2YgdGhpcyBtZXRob2QgdG8gdGhlIGNvbnRlbnQgY29udHJvbC5cblx0ICpcblx0ICogQHJldHVybnMgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIDxjb2RlPmxhYmVsRm9yPC9jb2RlPlxuXHQgKi9cblx0Z2V0SWRGb3JMYWJlbCgpOiBzdHJpbmcge1xuXHRcdGxldCBvQ29udGVudDtcblx0XHRpZiAodGhpcy5lZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIpIHtcblx0XHRcdG9Db250ZW50ID0gdGhpcy5jb250ZW50RGlzcGxheTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b0NvbnRlbnQgPSB0aGlzLmNvbnRlbnRFZGl0Lmxlbmd0aCA/IHRoaXMuY29udGVudEVkaXRbMF0gOiBudWxsO1xuXHRcdH1cblx0XHRyZXR1cm4gKG9Db250ZW50IGFzIENvbnRyb2wpPy5nZXRJZEZvckxhYmVsKCk7XG5cdH1cblxuXHRfc2V0QXJpYUxhYmVsbGVkQnkob0NvbnRlbnQ6IGFueSkge1xuXHRcdGlmIChvQ29udGVudCAmJiBvQ29udGVudC5hZGRBcmlhTGFiZWxsZWRCeSkge1xuXHRcdFx0Y29uc3QgYUFyaWFMYWJlbGxlZEJ5ID0gdGhpcy5hcmlhTGFiZWxsZWRCeTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQXJpYUxhYmVsbGVkQnkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3Qgc0lkID0gYUFyaWFMYWJlbGxlZEJ5W2ldO1xuXHRcdFx0XHRjb25zdCBhQXJpYUxhYmVsbGVkQnlzID0gb0NvbnRlbnQuZ2V0QXJpYUxhYmVsbGVkQnkoKSB8fCBbXTtcblx0XHRcdFx0aWYgKGFBcmlhTGFiZWxsZWRCeXMuaW5kZXhPZihzSWQpID09PSAtMSkge1xuXHRcdFx0XHRcdG9Db250ZW50LmFkZEFyaWFMYWJlbGxlZEJ5KHNJZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0Ly8gYmVmb3JlIGNhbGxpbmcgdGhlIHJlbmRlcmVyIG9mIHRoZSBGaWVsZFdyYXBwZXIgcGFyZW50IGNvbnRyb2wgbWF5IGhhdmUgc2V0IGFyaWFMYWJlbGxlZEJ5XG5cdFx0Ly8gd2UgZW5zdXJlIGl0IGlzIHBhc3NlZCB0byBpdHMgaW5uZXIgY29udHJvbHNcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLmNvbnRlbnREaXNwbGF5KTtcblx0XHRjb25zdCBhQ29udGVudEVkaXQgPSB0aGlzLmNvbnRlbnRFZGl0O1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUNvbnRlbnRFZGl0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeShhQ29udGVudEVkaXRbaV0pO1xuXHRcdH1cblx0fVxuXHRzdGF0aWMgcmVuZGVyKG9SbTogUmVuZGVyTWFuYWdlciwgb0NvbnRyb2w6IEZpZWxkV3JhcHBlcikge1xuXHRcdG9SbS5vcGVuU3RhcnQoXCJkaXZcIiwgb0NvbnRyb2wpO1xuXHRcdG9SbS5zdHlsZShcInRleHQtYWxpZ25cIiwgb0NvbnRyb2wudGV4dEFsaWduKTtcblx0XHRpZiAob0NvbnRyb2wuZWRpdE1vZGUgPT09IFwiRGlzcGxheVwiKSB7XG5cdFx0XHRvUm0uc3R5bGUoXCJ3aWR0aFwiLCBvQ29udHJvbC53aWR0aCk7XG5cdFx0XHRvUm0ub3BlbkVuZCgpO1xuXHRcdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRyb2wuY29udGVudERpc3BsYXkpOyAvLyByZW5kZXIgdGhlIGNoaWxkIENvbnRyb2wgZm9yIGRpc3BsYXlcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgYUNvbnRlbnRFZGl0ID0gb0NvbnRyb2wuY29udGVudEVkaXQ7XG5cblx0XHRcdC8vIGlmIChhQ29udGVudEVkaXQubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gXHRvUm0uY2xhc3MoXCJzYXBVaU1kY0ZpZWxkQmFzZU1vcmVGaWVsZHNcIik7XG5cdFx0XHQvLyB9XG5cdFx0XHRvUm0uc3R5bGUoXCJ3aWR0aFwiLCBvQ29udHJvbC53aWR0aCk7XG5cdFx0XHRvUm0ub3BlbkVuZCgpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQ29udGVudEVkaXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3Qgb0NvbnRlbnQgPSBhQ29udGVudEVkaXRbaV07IC8vIHJlbmRlciB0aGUgY2hpbGQgQ29udHJvbCAgZm9yIGVkaXRcblx0XHRcdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRlbnQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRvUm0uY2xvc2UoXCJkaXZcIik7IC8vIGVuZCBvZiB0aGUgY29tcGxldGUgQ29udHJvbFxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpZWxkV3JhcHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztNQU1NQSxZQUFZLFdBRGpCQyxjQUFjLENBQUMsbUNBQW1DLENBQUMsVUFFbERDLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDLFVBRzlDQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQXdCLENBQUMsQ0FBQyxVQUczQ0QsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxxQkFBcUI7SUFBRUMsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBRzdERixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUMsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBR2xERixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsWUFBWSxFQUFFO0VBQVUsQ0FBQyxD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