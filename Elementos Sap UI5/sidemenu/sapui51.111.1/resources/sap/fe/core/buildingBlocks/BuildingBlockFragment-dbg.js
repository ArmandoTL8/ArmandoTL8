/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/Fragment"], function (ClassSupport, Fragment) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let BuildingBlockFragment = (
  /**
   * Internal extension to the Fragment class in order to add some place to hold functions for runtime building blocks
   */
  _dec = defineUI5Class("sap.fe.core.buildingBlocks.BuildingBlockFragment"), _dec2 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_Fragment) {
    _inheritsLoose(BuildingBlockFragment, _Fragment);
    function BuildingBlockFragment() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Fragment.call(this, ...args) || this;
      _initializerDefineProperty(_this, "functionHolder", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = BuildingBlockFragment;
    return BuildingBlockFragment;
  }(Fragment), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "functionHolder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = BuildingBlockFragment;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdWlsZGluZ0Jsb2NrRnJhZ21lbnQiLCJkZWZpbmVVSTVDbGFzcyIsImV2ZW50IiwiRnJhZ21lbnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkJ1aWxkaW5nQmxvY2tGcmFnbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXZlbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcblxuLyoqXG4gKiBJbnRlcm5hbCBleHRlbnNpb24gdG8gdGhlIEZyYWdtZW50IGNsYXNzIGluIG9yZGVyIHRvIGFkZCBzb21lIHBsYWNlIHRvIGhvbGQgZnVuY3Rpb25zIGZvciBydW50aW1lIGJ1aWxkaW5nIGJsb2Nrc1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5idWlsZGluZ0Jsb2Nrcy5CdWlsZGluZ0Jsb2NrRnJhZ21lbnRcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1aWxkaW5nQmxvY2tGcmFnbWVudCBleHRlbmRzIEZyYWdtZW50IHtcblx0Lypcblx0ICogRXZlbnQgdG8gaG9sZCBhbmQgcmVzb2x2ZSBmdW5jdGlvbnMgZm9yIHJ1bnRpbWUgYnVpbGRpbmcgYmxvY2tzXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRmdW5jdGlvbkhvbGRlciE6IEZ1bmN0aW9uO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7OztNQU9xQkEscUJBQXFCO0VBSjFDO0FBQ0E7QUFDQTtFQUZBLE9BR0NDLGNBQWMsQ0FBQyxrREFBa0QsQ0FBQyxVQUtqRUMsS0FBSyxFQUFFO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUEsRUFKMENDLFFBQVE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=