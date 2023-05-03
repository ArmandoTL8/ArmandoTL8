/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/macros/ResourceModel", "sap/m/TextArea", "sap/ui/core/library"], function (ClassSupport, ResourceModel, _TextArea, library) {
  "use strict";

  var _dec, _class;
  var _exports = {};
  var ValueState = library.ValueState;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let TextAreaEx = (
  /**
   * Extension of the TextArea control to add a check for the maximum length when setting the value.
   *
   * @extends sap.m.TextArea
   * @public
   */
  _dec = defineUI5Class("sap.fe.macros.field.TextAreaEx"), _dec(_class = /*#__PURE__*/function (_TextArea2) {
    _inheritsLoose(TextAreaEx, _TextArea2);
    function TextAreaEx() {
      return _TextArea2.apply(this, arguments) || this;
    }
    _exports = TextAreaEx;
    var _proto = TextAreaEx.prototype;
    /**
     * Fires live change event.
     *
     * @param {object} [parameters] Parameters to pass along with the event
     * @param parameters.value
     * @returns Reference to `this` in order to allow method chaining
     */
    _proto.fireLiveChange = function fireLiveChange(parameters) {
      _TextArea2.prototype.fireLiveChange.call(this, parameters);
      this._validateTextLength(parameters === null || parameters === void 0 ? void 0 : parameters.value);
      return this;
    }

    /**
     * Sets the value for the text area.
     *
     * @param {string} value New value for the property `value`
     * @returns Reference to `this` in order to allow method chaining
     * @private
     */;
    _proto.setValue = function setValue(value) {
      _TextArea2.prototype.setValue.call(this, value);
      this._validateTextLength(value);
      return this;
    }

    /**
     * Sets an error message for the value state if the maximum length is specified and the new value exceeds this maximum length.
     *
     * @param {string} [value] New value for property `value`
     * @private
     */;
    _proto._validateTextLength = function _validateTextLength(value) {
      const maxLength = this.getMaxLength();
      if (!maxLength || value === undefined) {
        return;
      }
      if (value.length > maxLength) {
        const valueStateText = ResourceModel.getText("M_FIELD_TEXTAREA_TEXT_TOO_LONG");
        this.setValueState(ValueState.Error);
        this.setValueStateText(valueStateText);
      } else {
        this.setValueState(ValueState.None);
      }
    };
    return TextAreaEx;
  }(_TextArea)) || _class);
  _exports = TextAreaEx;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0QXJlYUV4IiwiZGVmaW5lVUk1Q2xhc3MiLCJmaXJlTGl2ZUNoYW5nZSIsInBhcmFtZXRlcnMiLCJfdmFsaWRhdGVUZXh0TGVuZ3RoIiwidmFsdWUiLCJzZXRWYWx1ZSIsIm1heExlbmd0aCIsImdldE1heExlbmd0aCIsInVuZGVmaW5lZCIsImxlbmd0aCIsInZhbHVlU3RhdGVUZXh0IiwiUmVzb3VyY2VNb2RlbCIsImdldFRleHQiLCJzZXRWYWx1ZVN0YXRlIiwiVmFsdWVTdGF0ZSIsIkVycm9yIiwic2V0VmFsdWVTdGF0ZVRleHQiLCJOb25lIiwiX1RleHRBcmVhIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUZXh0QXJlYUV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgX1RleHRBcmVhIGZyb20gXCJzYXAvbS9UZXh0QXJlYVwiO1xuaW1wb3J0IHsgVmFsdWVTdGF0ZSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5cbi8qKlxuICogRXh0ZW5zaW9uIG9mIHRoZSBUZXh0QXJlYSBjb250cm9sIHRvIGFkZCBhIGNoZWNrIGZvciB0aGUgbWF4aW11bSBsZW5ndGggd2hlbiBzZXR0aW5nIHRoZSB2YWx1ZS5cbiAqXG4gKiBAZXh0ZW5kcyBzYXAubS5UZXh0QXJlYVxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLmZpZWxkLlRleHRBcmVhRXhcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHRBcmVhRXggZXh0ZW5kcyBfVGV4dEFyZWEge1xuXHQvKipcblx0ICogRmlyZXMgbGl2ZSBjaGFuZ2UgZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1ldGVyc10gUGFyYW1ldGVycyB0byBwYXNzIGFsb25nIHdpdGggdGhlIGV2ZW50XG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLnZhbHVlXG5cdCAqIEByZXR1cm5zIFJlZmVyZW5jZSB0byBgdGhpc2AgaW4gb3JkZXIgdG8gYWxsb3cgbWV0aG9kIGNoYWluaW5nXG5cdCAqL1xuXHRmaXJlTGl2ZUNoYW5nZShwYXJhbWV0ZXJzPzogeyB2YWx1ZT86IHN0cmluZyB9KTogdGhpcyB7XG5cdFx0c3VwZXIuZmlyZUxpdmVDaGFuZ2UocGFyYW1ldGVycyk7XG5cdFx0dGhpcy5fdmFsaWRhdGVUZXh0TGVuZ3RoKHBhcmFtZXRlcnM/LnZhbHVlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB2YWx1ZSBmb3IgdGhlIHRleHQgYXJlYS5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIE5ldyB2YWx1ZSBmb3IgdGhlIHByb3BlcnR5IGB2YWx1ZWBcblx0ICogQHJldHVybnMgUmVmZXJlbmNlIHRvIGB0aGlzYCBpbiBvcmRlciB0byBhbGxvdyBtZXRob2QgY2hhaW5pbmdcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHNldFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcblx0XHRzdXBlci5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0dGhpcy5fdmFsaWRhdGVUZXh0TGVuZ3RoKHZhbHVlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGFuIGVycm9yIG1lc3NhZ2UgZm9yIHRoZSB2YWx1ZSBzdGF0ZSBpZiB0aGUgbWF4aW11bSBsZW5ndGggaXMgc3BlY2lmaWVkIGFuZCB0aGUgbmV3IHZhbHVlIGV4Y2VlZHMgdGhpcyBtYXhpbXVtIGxlbmd0aC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IFt2YWx1ZV0gTmV3IHZhbHVlIGZvciBwcm9wZXJ0eSBgdmFsdWVgXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfdmFsaWRhdGVUZXh0TGVuZ3RoKHZhbHVlPzogc3RyaW5nKSB7XG5cdFx0Y29uc3QgbWF4TGVuZ3RoID0gdGhpcy5nZXRNYXhMZW5ndGgoKTtcblx0XHRpZiAoIW1heExlbmd0aCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmICh2YWx1ZS5sZW5ndGggPiBtYXhMZW5ndGgpIHtcblx0XHRcdGNvbnN0IHZhbHVlU3RhdGVUZXh0ID0gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9GSUVMRF9URVhUQVJFQV9URVhUX1RPT19MT05HXCIpO1xuXHRcdFx0dGhpcy5zZXRWYWx1ZVN0YXRlKFZhbHVlU3RhdGUuRXJyb3IpO1xuXHRcdFx0dGhpcy5zZXRWYWx1ZVN0YXRlVGV4dCh2YWx1ZVN0YXRlVGV4dCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0VmFsdWVTdGF0ZShWYWx1ZVN0YXRlLk5vbmUpO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O01BWXFCQSxVQUFVO0VBUC9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLE9BTUNDLGNBQWMsQ0FBQyxnQ0FBZ0MsQ0FBQztJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQUVoRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQU5DLE9BT0FDLGNBQWMsR0FBZCx3QkFBZUMsVUFBK0IsRUFBUTtNQUNyRCxxQkFBTUQsY0FBYyxZQUFDQyxVQUFVO01BQy9CLElBQUksQ0FBQ0MsbUJBQW1CLENBQUNELFVBQVUsYUFBVkEsVUFBVSx1QkFBVkEsVUFBVSxDQUFFRSxLQUFLLENBQUM7TUFDM0MsT0FBTyxJQUFJO0lBQ1o7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0FDLFFBQVEsR0FBUixrQkFBU0QsS0FBYSxFQUFFO01BQ3ZCLHFCQUFNQyxRQUFRLFlBQUNELEtBQUs7TUFDcEIsSUFBSSxDQUFDRCxtQkFBbUIsQ0FBQ0MsS0FBSyxDQUFDO01BQy9CLE9BQU8sSUFBSTtJQUNaOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQUQsbUJBQW1CLEdBQW5CLDZCQUFvQkMsS0FBYyxFQUFFO01BQ25DLE1BQU1FLFNBQVMsR0FBRyxJQUFJLENBQUNDLFlBQVksRUFBRTtNQUNyQyxJQUFJLENBQUNELFNBQVMsSUFBSUYsS0FBSyxLQUFLSSxTQUFTLEVBQUU7UUFDdEM7TUFDRDtNQUNBLElBQUlKLEtBQUssQ0FBQ0ssTUFBTSxHQUFHSCxTQUFTLEVBQUU7UUFDN0IsTUFBTUksY0FBYyxHQUFHQyxhQUFhLENBQUNDLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQztRQUM5RSxJQUFJLENBQUNDLGFBQWEsQ0FBQ0MsVUFBVSxDQUFDQyxLQUFLLENBQUM7UUFDcEMsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBQ04sY0FBYyxDQUFDO01BQ3ZDLENBQUMsTUFBTTtRQUNOLElBQUksQ0FBQ0csYUFBYSxDQUFDQyxVQUFVLENBQUNHLElBQUksQ0FBQztNQUNwQztJQUNELENBQUM7SUFBQTtFQUFBLEVBN0NzQ0MsU0FBUztFQUFBO0VBQUE7QUFBQSJ9