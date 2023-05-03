/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/Control"], function (ClassSupport, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
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
  let ConditionalWrapper = (_dec = defineUI5Class("sap.fe.core.controls.ConditionalWrapper"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "sap.ui.core.CSSSize",
    defaultValue: null
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec6 = association({
    type: "sap.ui.core.Control",
    multiple: true,
    singularName: "ariaLabelledBy"
  }), _dec7 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec8 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(ConditionalWrapper, _Control);
    function ConditionalWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formDoNotAdjustWidth", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "condition", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentTrue", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentFalse", _descriptor7, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = ConditionalWrapper.prototype;
    _proto.enhanceAccessibilityState = function enhanceAccessibilityState(oElement, mAriaProps) {
      const oParent = this.getParent();
      if (oParent && oParent.enhanceAccessibilityState) {
        oParent.enhanceAccessibilityState(this, mAriaProps);
      }
      return mAriaProps;
    }
    /**
     * This function provides the current accessibility state of the control.
     *
     * @returns The accessibility info of the wrapped control
     */;
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      var _content;
      let content;
      if (this.condition) {
        content = this.contentTrue;
      } else {
        content = this.contentFalse;
      }
      return (_content = content) !== null && _content !== void 0 && _content.getAccessibilityInfo ? content.getAccessibilityInfo() : {};
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
      // before calling the renderer of the ConditionalWrapper parent control may have set ariaLabelledBy
      // we ensure it is passed to its inner controls
      this._setAriaLabelledBy(this.contentTrue);
      this._setAriaLabelledBy(this.contentFalse);
    };
    ConditionalWrapper.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.style("width", oControl.width);
      oRm.style("display", "inline-block");
      oRm.openEnd();
      if (oControl.condition) {
        oRm.renderControl(oControl.contentTrue);
      } else {
        oRm.renderControl(oControl.contentFalse);
      }
      oRm.close("div"); // end of the complete Control
    };
    return ConditionalWrapper;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "formDoNotAdjustWidth", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "condition", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "contentTrue", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "contentFalse", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ConditionalWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25kaXRpb25hbFdyYXBwZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzaW5ndWxhck5hbWUiLCJhZ2dyZWdhdGlvbiIsImlzRGVmYXVsdCIsImVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUiLCJvRWxlbWVudCIsIm1BcmlhUHJvcHMiLCJvUGFyZW50IiwiZ2V0UGFyZW50IiwiZ2V0QWNjZXNzaWJpbGl0eUluZm8iLCJjb250ZW50IiwiY29uZGl0aW9uIiwiY29udGVudFRydWUiLCJjb250ZW50RmFsc2UiLCJfc2V0QXJpYUxhYmVsbGVkQnkiLCJvQ29udGVudCIsImFkZEFyaWFMYWJlbGxlZEJ5IiwiYUFyaWFMYWJlbGxlZEJ5IiwiYXJpYUxhYmVsbGVkQnkiLCJpIiwibGVuZ3RoIiwic0lkIiwiYUFyaWFMYWJlbGxlZEJ5cyIsImdldEFyaWFMYWJlbGxlZEJ5IiwiaW5kZXhPZiIsIm9uQmVmb3JlUmVuZGVyaW5nIiwicmVuZGVyIiwib1JtIiwib0NvbnRyb2wiLCJvcGVuU3RhcnQiLCJzdHlsZSIsIndpZHRoIiwib3BlbkVuZCIsInJlbmRlckNvbnRyb2wiLCJjbG9zZSIsIkNvbnRyb2wiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbmRpdGlvbmFsV3JhcHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhZ2dyZWdhdGlvbiwgYXNzb2NpYXRpb24sIGRlZmluZVVJNUNsYXNzLCBFbmhhbmNlV2l0aFVJNSwgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIHsgQ1NTU2l6ZSwgSUZvcm1Db250ZW50IH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFJlbmRlck1hbmFnZXIgZnJvbSBcInNhcC91aS9jb3JlL1JlbmRlck1hbmFnZXJcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbHMuQ29uZGl0aW9uYWxXcmFwcGVyXCIpXG5jbGFzcyBDb25kaXRpb25hbFdyYXBwZXIgZXh0ZW5kcyBDb250cm9sIGltcGxlbWVudHMgSUZvcm1Db250ZW50IHtcblx0QGltcGxlbWVudEludGVyZmFjZShcInNhcC51aS5jb3JlLklGb3JtQ29udGVudFwiKVxuXHRfX2ltcGxlbWVudHNfX3NhcF91aV9jb3JlX0lGb3JtQ29udGVudDogYm9vbGVhbiA9IHRydWU7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAudWkuY29yZS5DU1NTaXplXCIsIGRlZmF1bHRWYWx1ZTogbnVsbCB9KVxuXHR3aWR0aCE6IENTU1NpemU7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0Zm9ybURvTm90QWRqdXN0V2lkdGghOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGNvbmRpdGlvbiE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFzc29jaWF0aW9uIHRvIGNvbnRyb2xzIC8gSURzIHRoYXQgbGFiZWwgdGhpcyBjb250cm9sIChzZWUgV0FJLUFSSUEgYXR0cmlidXRlIGFyaWEtbGFiZWxsZWRieSkuXG5cdCAqL1xuXHRAYXNzb2NpYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IHRydWUsIHNpbmd1bGFyTmFtZTogXCJhcmlhTGFiZWxsZWRCeVwiIH0pXG5cdGFyaWFMYWJlbGxlZEJ5ITogQ29udHJvbFtdO1xuXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLCBtdWx0aXBsZTogZmFsc2UsIGlzRGVmYXVsdDogdHJ1ZSB9KVxuXHRjb250ZW50VHJ1ZSE6IENvbnRyb2w7XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiBmYWxzZSB9KVxuXHRjb250ZW50RmFsc2UhOiBDb250cm9sO1xuXG5cdGVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUob0VsZW1lbnQ6IGFueSwgbUFyaWFQcm9wczogYW55KSB7XG5cdFx0Y29uc3Qgb1BhcmVudCA9IHRoaXMuZ2V0UGFyZW50KCkgYXMgYW55O1xuXG5cdFx0aWYgKG9QYXJlbnQgJiYgb1BhcmVudC5lbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlKSB7XG5cdFx0XHRvUGFyZW50LmVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUodGhpcywgbUFyaWFQcm9wcyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1BcmlhUHJvcHM7XG5cdH1cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcHJvdmlkZXMgdGhlIGN1cnJlbnQgYWNjZXNzaWJpbGl0eSBzdGF0ZSBvZiB0aGUgY29udHJvbC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGFjY2Vzc2liaWxpdHkgaW5mbyBvZiB0aGUgd3JhcHBlZCBjb250cm9sXG5cdCAqL1xuXHRnZXRBY2Nlc3NpYmlsaXR5SW5mbygpIHtcblx0XHRsZXQgY29udGVudDtcblx0XHRpZiAodGhpcy5jb25kaXRpb24pIHtcblx0XHRcdGNvbnRlbnQgPSB0aGlzLmNvbnRlbnRUcnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb250ZW50ID0gdGhpcy5jb250ZW50RmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiBjb250ZW50Py5nZXRBY2Nlc3NpYmlsaXR5SW5mbyA/IGNvbnRlbnQuZ2V0QWNjZXNzaWJpbGl0eUluZm8oKSA6IHt9O1xuXHR9XG5cdF9zZXRBcmlhTGFiZWxsZWRCeShvQ29udGVudDogYW55KSB7XG5cdFx0aWYgKG9Db250ZW50ICYmIG9Db250ZW50LmFkZEFyaWFMYWJlbGxlZEJ5KSB7XG5cdFx0XHRjb25zdCBhQXJpYUxhYmVsbGVkQnkgPSB0aGlzLmFyaWFMYWJlbGxlZEJ5O1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFBcmlhTGFiZWxsZWRCeS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBzSWQgPSBhQXJpYUxhYmVsbGVkQnlbaV07XG5cdFx0XHRcdGNvbnN0IGFBcmlhTGFiZWxsZWRCeXMgPSBvQ29udGVudC5nZXRBcmlhTGFiZWxsZWRCeSgpIHx8IFtdO1xuXHRcdFx0XHRpZiAoYUFyaWFMYWJlbGxlZEJ5cy5pbmRleE9mKHNJZCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0b0NvbnRlbnQuYWRkQXJpYUxhYmVsbGVkQnkoc0lkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRvbkJlZm9yZVJlbmRlcmluZygpIHtcblx0XHQvLyBiZWZvcmUgY2FsbGluZyB0aGUgcmVuZGVyZXIgb2YgdGhlIENvbmRpdGlvbmFsV3JhcHBlciBwYXJlbnQgY29udHJvbCBtYXkgaGF2ZSBzZXQgYXJpYUxhYmVsbGVkQnlcblx0XHQvLyB3ZSBlbnN1cmUgaXQgaXMgcGFzc2VkIHRvIGl0cyBpbm5lciBjb250cm9sc1xuXHRcdHRoaXMuX3NldEFyaWFMYWJlbGxlZEJ5KHRoaXMuY29udGVudFRydWUpO1xuXHRcdHRoaXMuX3NldEFyaWFMYWJlbGxlZEJ5KHRoaXMuY29udGVudEZhbHNlKTtcblx0fVxuXHRzdGF0aWMgcmVuZGVyKG9SbTogUmVuZGVyTWFuYWdlciwgb0NvbnRyb2w6IENvbmRpdGlvbmFsV3JhcHBlcikge1xuXHRcdG9SbS5vcGVuU3RhcnQoXCJkaXZcIiwgb0NvbnRyb2wpO1xuXHRcdG9SbS5zdHlsZShcIndpZHRoXCIsIG9Db250cm9sLndpZHRoKTtcblx0XHRvUm0uc3R5bGUoXCJkaXNwbGF5XCIsIFwiaW5saW5lLWJsb2NrXCIpO1xuXHRcdG9SbS5vcGVuRW5kKCk7XG5cdFx0aWYgKG9Db250cm9sLmNvbmRpdGlvbikge1xuXHRcdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRyb2wuY29udGVudFRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUm0ucmVuZGVyQ29udHJvbChvQ29udHJvbC5jb250ZW50RmFsc2UpO1xuXHRcdH1cblx0XHRvUm0uY2xvc2UoXCJkaXZcIik7IC8vIGVuZCBvZiB0aGUgY29tcGxldGUgQ29udHJvbFxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbmRpdGlvbmFsV3JhcHBlciBhcyB1bmtub3duIGFzIEVuaGFuY2VXaXRoVUk1PENvbmRpdGlvbmFsV3JhcHBlcj47XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7TUFNTUEsa0JBQWtCLFdBRHZCQyxjQUFjLENBQUMseUNBQXlDLENBQUMsVUFFeERDLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDLFVBRzlDQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLHFCQUFxQjtJQUFFQyxZQUFZLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHN0RGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFQyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFHbERGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFQyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFNbERDLFdBQVcsQ0FBQztJQUFFRixJQUFJLEVBQUUscUJBQXFCO0lBQUVHLFFBQVEsRUFBRSxJQUFJO0lBQUVDLFlBQVksRUFBRTtFQUFpQixDQUFDLENBQUMsVUFHNUZDLFdBQVcsQ0FBQztJQUFFTCxJQUFJLEVBQUUscUJBQXFCO0lBQUVHLFFBQVEsRUFBRSxLQUFLO0lBQUVHLFNBQVMsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQUc5RUQsV0FBVyxDQUFDO0lBQUVMLElBQUksRUFBRSxxQkFBcUI7SUFBRUcsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFB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