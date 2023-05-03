/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/HBox", "sap/ui/core/StashedControlSupport"], function (ClassSupport, HBox, StashedControlSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let StashableHBox = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.controls.StashableHBox", {
    designtime: "sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime"
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_HBox) {
    _inheritsLoose(StashableHBox, _HBox);
    function StashableHBox() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _HBox.call(this, ...args) || this;
      _initializerDefineProperty(_this, "title", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fallbackTitle", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = StashableHBox.prototype;
    /*
     * Set title of visible Title/Link control and own title property.
     */
    _proto.setTitle = function setTitle(sTitle) {
      const oControl = this.getTitleControl();
      if (oControl) {
        oControl.setText(sTitle);
      }
      this.title = sTitle;
      return this;
    }

    /*
     * Return the title property.
     */;
    _proto.getTitle = function getTitle() {
      return this.title || this.fallbackTitle;
    }

    /*
     * In case of UI changes, Title/Link text needs to be set to new value after Header Facet control and inner controls are rendered.
     * Else: title property needs to be initialized.
     */;
    _proto.onAfterRendering = function onAfterRendering() {
      if (this.title) {
        this.setTitle(this.title);
      } else {
        const oControl = this.getTitleControl();
        if (oControl) {
          this.title = oControl.getText();
        }
      }
    }

    /*
     * Retrieves Title/Link control from items aggregation.
     */;
    _proto.getTitleControl = function getTitleControl() {
      let aItems = [],
        content,
        i;
      if (this.getItems && this.getItems()[0] && this.getItems()[0].getItems) {
        aItems = this.getItems()[0].getItems();
      } else if (this.getItems && this.getItems()[0] && this.getItems()[0].getMicroChartTitle) {
        aItems = this.getItems()[0].getMicroChartTitle();
      }
      for (i = 0; i < aItems.length; i++) {
        if (aItems[i].isA("sap.m.Title") || aItems[i].isA("sap.m.Link")) {
          if (aItems[i].isA("sap.m.Title")) {
            // If a title was found, check if there is a link in the content aggregation
            content = aItems[i].getContent();
            if (content && content.isA("sap.m.Link")) {
              return content;
            }
          }
          return aItems[i];
        }
      }
      return null;
    };
    return StashableHBox;
  }(HBox), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fallbackTitle", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  StashedControlSupport.mixInto(StashableHBox);
  return StashableHBox;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGFzaGFibGVIQm94IiwiZGVmaW5lVUk1Q2xhc3MiLCJkZXNpZ250aW1lIiwicHJvcGVydHkiLCJ0eXBlIiwic2V0VGl0bGUiLCJzVGl0bGUiLCJvQ29udHJvbCIsImdldFRpdGxlQ29udHJvbCIsInNldFRleHQiLCJ0aXRsZSIsImdldFRpdGxlIiwiZmFsbGJhY2tUaXRsZSIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJnZXRUZXh0IiwiYUl0ZW1zIiwiY29udGVudCIsImkiLCJnZXRJdGVtcyIsImdldE1pY3JvQ2hhcnRUaXRsZSIsImxlbmd0aCIsImlzQSIsImdldENvbnRlbnQiLCJIQm94IiwiU3Rhc2hlZENvbnRyb2xTdXBwb3J0IiwibWl4SW50byJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU3Rhc2hhYmxlSEJveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBIQm94IGZyb20gXCJzYXAvbS9IQm94XCI7XG5pbXBvcnQgU3Rhc2hlZENvbnRyb2xTdXBwb3J0IGZyb20gXCJzYXAvdWkvY29yZS9TdGFzaGVkQ29udHJvbFN1cHBvcnRcIjtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5jb250cm9scy5TdGFzaGFibGVIQm94XCIsIHtcblx0ZGVzaWdudGltZTogXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvZGVzaWdudGltZS9TdGFzaGFibGVIQm94LmRlc2lnbnRpbWVcIlxufSlcbmNsYXNzIFN0YXNoYWJsZUhCb3ggZXh0ZW5kcyBIQm94IHtcblx0Lypcblx0ICogVGl0bGUgb2YgdGhlIEhlYWRlciBGYWNldC4gTm90IHZpc2libGUgb24gdGhlIFVJLiBWaXNpYmxlIG9uIHRoZSBVSSBpcyB0aGUgVGl0bGUgb3IgTGluayBjb250cm9sIGluc2lkZSB0aGUgaXRlbXMgYWdncmVnYXRpb24gb2YgdGhlIEhlYWRlciBGYWNldC5cblx0ICogTXVzdCBhbHdheXMgYmUgaW4gc3luYyB3aXRoIHRoZSB2aXNpYmxlIFRpdGxlIG9yIExpbmsgY29udHJvbC5cblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dGl0bGUhOiBzdHJpbmc7XG5cdC8qXG5cdCAqIEZhbGxiYWNrIHRpdGxlIHRvIGJlIGRpc3BsYXllZCBpZiBubyB0aXRsZSBpcyBhdmFpbGFibGUgKG9ubHkgbmVlZGVkIGZvciBkaXNwbGF5aW5nIHN0YXNoZWQgaGVhZGVyIGZhY2V0cyBpbiBGbGV4IGRpYWxvZylcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZmFsbGJhY2tUaXRsZSE6IHN0cmluZztcblxuXHQvKlxuXHQgKiBTZXQgdGl0bGUgb2YgdmlzaWJsZSBUaXRsZS9MaW5rIGNvbnRyb2wgYW5kIG93biB0aXRsZSBwcm9wZXJ0eS5cblx0ICovXG5cdHNldFRpdGxlKHNUaXRsZTogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbnRyb2wgPSB0aGlzLmdldFRpdGxlQ29udHJvbCgpO1xuXHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0b0NvbnRyb2wuc2V0VGV4dChzVGl0bGUpO1xuXHRcdH1cblx0XHR0aGlzLnRpdGxlID0gc1RpdGxlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKlxuXHQgKiBSZXR1cm4gdGhlIHRpdGxlIHByb3BlcnR5LlxuXHQgKi9cblx0Z2V0VGl0bGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMudGl0bGUgfHwgdGhpcy5mYWxsYmFja1RpdGxlO1xuXHR9XG5cblx0Lypcblx0ICogSW4gY2FzZSBvZiBVSSBjaGFuZ2VzLCBUaXRsZS9MaW5rIHRleHQgbmVlZHMgdG8gYmUgc2V0IHRvIG5ldyB2YWx1ZSBhZnRlciBIZWFkZXIgRmFjZXQgY29udHJvbCBhbmQgaW5uZXIgY29udHJvbHMgYXJlIHJlbmRlcmVkLlxuXHQgKiBFbHNlOiB0aXRsZSBwcm9wZXJ0eSBuZWVkcyB0byBiZSBpbml0aWFsaXplZC5cblx0ICovXG5cdG9uQWZ0ZXJSZW5kZXJpbmcoKSB7XG5cdFx0aWYgKHRoaXMudGl0bGUpIHtcblx0XHRcdHRoaXMuc2V0VGl0bGUodGhpcy50aXRsZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG9Db250cm9sID0gdGhpcy5nZXRUaXRsZUNvbnRyb2woKTtcblx0XHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0XHR0aGlzLnRpdGxlID0gb0NvbnRyb2wuZ2V0VGV4dCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qXG5cdCAqIFJldHJpZXZlcyBUaXRsZS9MaW5rIGNvbnRyb2wgZnJvbSBpdGVtcyBhZ2dyZWdhdGlvbi5cblx0ICovXG5cdGdldFRpdGxlQ29udHJvbCgpIHtcblx0XHRsZXQgYUl0ZW1zID0gW10sXG5cdFx0XHRjb250ZW50LFxuXHRcdFx0aTtcblx0XHRpZiAodGhpcy5nZXRJdGVtcyAmJiB0aGlzLmdldEl0ZW1zKClbMF0gJiYgKHRoaXMuZ2V0SXRlbXMoKVswXSBhcyBhbnkpLmdldEl0ZW1zKSB7XG5cdFx0XHRhSXRlbXMgPSAodGhpcy5nZXRJdGVtcygpWzBdIGFzIGFueSkuZ2V0SXRlbXMoKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuZ2V0SXRlbXMgJiYgdGhpcy5nZXRJdGVtcygpWzBdICYmICh0aGlzLmdldEl0ZW1zKClbMF0gYXMgYW55KS5nZXRNaWNyb0NoYXJ0VGl0bGUpIHtcblx0XHRcdGFJdGVtcyA9ICh0aGlzLmdldEl0ZW1zKClbMF0gYXMgYW55KS5nZXRNaWNyb0NoYXJ0VGl0bGUoKTtcblx0XHR9XG5cdFx0Zm9yIChpID0gMDsgaSA8IGFJdGVtcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGFJdGVtc1tpXS5pc0EoXCJzYXAubS5UaXRsZVwiKSB8fCBhSXRlbXNbaV0uaXNBKFwic2FwLm0uTGlua1wiKSkge1xuXHRcdFx0XHRpZiAoYUl0ZW1zW2ldLmlzQShcInNhcC5tLlRpdGxlXCIpKSB7XG5cdFx0XHRcdFx0Ly8gSWYgYSB0aXRsZSB3YXMgZm91bmQsIGNoZWNrIGlmIHRoZXJlIGlzIGEgbGluayBpbiB0aGUgY29udGVudCBhZ2dyZWdhdGlvblxuXHRcdFx0XHRcdGNvbnRlbnQgPSBhSXRlbXNbaV0uZ2V0Q29udGVudCgpO1xuXHRcdFx0XHRcdGlmIChjb250ZW50ICYmIGNvbnRlbnQuaXNBKFwic2FwLm0uTGlua1wiKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBhSXRlbXNbaV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5TdGFzaGVkQ29udHJvbFN1cHBvcnQubWl4SW50byhTdGFzaGFibGVIQm94KTtcblxuZXhwb3J0IGRlZmF1bHQgU3Rhc2hhYmxlSEJveDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztNQU1NQSxhQUFhLFdBSGxCQyxjQUFjLENBQUMsb0RBQW9ELEVBQUU7SUFDckVDLFVBQVUsRUFBRTtFQUNiLENBQUMsQ0FBQyxVQU1BQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBSzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBRzdCO0FBQ0Q7QUFDQTtJQUZDLE9BR0FDLFFBQVEsR0FBUixrQkFBU0MsTUFBVyxFQUFFO01BQ3JCLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNDLGVBQWUsRUFBRTtNQUN2QyxJQUFJRCxRQUFRLEVBQUU7UUFDYkEsUUFBUSxDQUFDRSxPQUFPLENBQUNILE1BQU0sQ0FBQztNQUN6QjtNQUNBLElBQUksQ0FBQ0ksS0FBSyxHQUFHSixNQUFNO01BRW5CLE9BQU8sSUFB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