/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/uxap/BlockBase", "sap/uxap/library"], function (ClassSupport, BlockBase, uxapLib) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const BlockBaseFormAdjustment = uxapLib.BlockBaseFormAdjustment;
  let SubSectionBlock = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.controls.SubSectionBlock"), _dec2 = property({
    type: "sap.uxap.BlockBaseColumnLayout",
    group: "Behavior",
    defaultValue: 4
  }), _dec3 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BlockBase) {
    _inheritsLoose(SubSectionBlock, _BlockBase);
    function SubSectionBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "columnLayout", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = SubSectionBlock.prototype;
    _proto.init = function init() {
      _BlockBase.prototype.init.call(this);
      this._bConnected = true;
    };
    _proto._applyFormAdjustment = function _applyFormAdjustment() {
      const sFormAdjustment = this.getFormAdjustment(),
        oView = this._getSelectedViewContent(),
        oParent = this._oParentObjectPageSubSection;
      let oFormAdjustmentFields;
      if (sFormAdjustment !== BlockBaseFormAdjustment.None && oView && oParent) {
        oFormAdjustmentFields = this._computeFormAdjustmentFields(sFormAdjustment, oParent._oLayoutConfig);
        this._adjustForm(oView, oFormAdjustmentFields);
      }
    };
    _proto.setMode = function setMode(sMode) {
      this.setProperty("mode", sMode);
      // OPTIONAL: this.internalModel.setProperty("/mode", sMode);
    };
    _proto.connectToModels = function connectToModels() {
      // View is already connected to the UI5 model tree, hence no extra logic required here
    }
    /// SubSectionBlock use aggregation instead of a view, i.e. return that as the view content
    ;
    _proto._getSelectedViewContent = function _getSelectedViewContent() {
      return this.getAggregation("content");
    };
    return SubSectionBlock;
  }(BlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "columnLayout", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return SubSectionBlock;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCbG9ja0Jhc2VGb3JtQWRqdXN0bWVudCIsInV4YXBMaWIiLCJTdWJTZWN0aW9uQmxvY2siLCJkZWZpbmVVSTVDbGFzcyIsInByb3BlcnR5IiwidHlwZSIsImdyb3VwIiwiZGVmYXVsdFZhbHVlIiwiYWdncmVnYXRpb24iLCJtdWx0aXBsZSIsImluaXQiLCJfYkNvbm5lY3RlZCIsIl9hcHBseUZvcm1BZGp1c3RtZW50Iiwic0Zvcm1BZGp1c3RtZW50IiwiZ2V0Rm9ybUFkanVzdG1lbnQiLCJvVmlldyIsIl9nZXRTZWxlY3RlZFZpZXdDb250ZW50Iiwib1BhcmVudCIsIl9vUGFyZW50T2JqZWN0UGFnZVN1YlNlY3Rpb24iLCJvRm9ybUFkanVzdG1lbnRGaWVsZHMiLCJOb25lIiwiX2NvbXB1dGVGb3JtQWRqdXN0bWVudEZpZWxkcyIsIl9vTGF5b3V0Q29uZmlnIiwiX2FkanVzdEZvcm0iLCJzZXRNb2RlIiwic01vZGUiLCJzZXRQcm9wZXJ0eSIsImNvbm5lY3RUb01vZGVscyIsImdldEFnZ3JlZ2F0aW9uIiwiQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTdWJTZWN0aW9uQmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYWdncmVnYXRpb24sIGRlZmluZVVJNUNsYXNzLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IEJsb2NrQmFzZSBmcm9tIFwic2FwL3V4YXAvQmxvY2tCYXNlXCI7XG5pbXBvcnQgdHlwZSB7IEJsb2NrQmFzZUNvbHVtbkxheW91dCB9IGZyb20gXCJzYXAvdXhhcC9saWJyYXJ5XCI7XG5pbXBvcnQgdXhhcExpYiBmcm9tIFwic2FwL3V4YXAvbGlicmFyeVwiO1xuY29uc3QgQmxvY2tCYXNlRm9ybUFkanVzdG1lbnQgPSB1eGFwTGliLkJsb2NrQmFzZUZvcm1BZGp1c3RtZW50O1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLmNvbnRyb2xzLlN1YlNlY3Rpb25CbG9ja1wiKVxuY2xhc3MgU3ViU2VjdGlvbkJsb2NrIGV4dGVuZHMgQmxvY2tCYXNlIHtcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAudXhhcC5CbG9ja0Jhc2VDb2x1bW5MYXlvdXRcIiwgZ3JvdXA6IFwiQmVoYXZpb3JcIiwgZGVmYXVsdFZhbHVlOiA0IH0pXG5cdGNvbHVtbkxheW91dCE6IEJsb2NrQmFzZUNvbHVtbkxheW91dDtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IGZhbHNlIH0pXG5cdGNvbnRlbnQhOiBDb250cm9sO1xuXHRwcml2YXRlIF9vUGFyZW50T2JqZWN0UGFnZVN1YlNlY3Rpb24hOiBhbnk7XG5cdGluaXQoKSB7XG5cdFx0c3VwZXIuaW5pdCgpO1xuXHRcdCh0aGlzIGFzIGFueSkuX2JDb25uZWN0ZWQgPSB0cnVlO1xuXHR9XG5cdF9hcHBseUZvcm1BZGp1c3RtZW50KCkge1xuXHRcdGNvbnN0IHNGb3JtQWRqdXN0bWVudCA9IHRoaXMuZ2V0Rm9ybUFkanVzdG1lbnQoKSxcblx0XHRcdG9WaWV3ID0gdGhpcy5fZ2V0U2VsZWN0ZWRWaWV3Q29udGVudCgpLFxuXHRcdFx0b1BhcmVudCA9IHRoaXMuX29QYXJlbnRPYmplY3RQYWdlU3ViU2VjdGlvbjtcblx0XHRsZXQgb0Zvcm1BZGp1c3RtZW50RmllbGRzO1xuXG5cdFx0aWYgKHNGb3JtQWRqdXN0bWVudCAhPT0gQmxvY2tCYXNlRm9ybUFkanVzdG1lbnQuTm9uZSAmJiBvVmlldyAmJiBvUGFyZW50KSB7XG5cdFx0XHRvRm9ybUFkanVzdG1lbnRGaWVsZHMgPSB0aGlzLl9jb21wdXRlRm9ybUFkanVzdG1lbnRGaWVsZHMoc0Zvcm1BZGp1c3RtZW50LCBvUGFyZW50Ll9vTGF5b3V0Q29uZmlnKTtcblxuXHRcdFx0dGhpcy5fYWRqdXN0Rm9ybShvVmlldywgb0Zvcm1BZGp1c3RtZW50RmllbGRzKTtcblx0XHR9XG5cdH1cblx0c2V0TW9kZShzTW9kZTogYW55KSB7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcIm1vZGVcIiwgc01vZGUpO1xuXHRcdC8vIE9QVElPTkFMOiB0aGlzLmludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvbW9kZVwiLCBzTW9kZSk7XG5cdH1cblxuXHRjb25uZWN0VG9Nb2RlbHMoKSB7XG5cdFx0Ly8gVmlldyBpcyBhbHJlYWR5IGNvbm5lY3RlZCB0byB0aGUgVUk1IG1vZGVsIHRyZWUsIGhlbmNlIG5vIGV4dHJhIGxvZ2ljIHJlcXVpcmVkIGhlcmVcblx0fVxuXHQvLy8gU3ViU2VjdGlvbkJsb2NrIHVzZSBhZ2dyZWdhdGlvbiBpbnN0ZWFkIG9mIGEgdmlldywgaS5lLiByZXR1cm4gdGhhdCBhcyB0aGUgdmlldyBjb250ZW50XG5cdF9nZXRTZWxlY3RlZFZpZXdDb250ZW50KCkge1xuXHRcdHJldHVybiB0aGlzLmdldEFnZ3JlZ2F0aW9uKFwiY29udGVudFwiKTtcblx0fVxufVxuXG5pbnRlcmZhY2UgU3ViU2VjdGlvbkJsb2NrIHtcblx0X2FkanVzdEZvcm0odmlldzogYW55LCBmb3JtRmllbGRzOiBhbnkpOiB2b2lkO1xuXHRfY29tcHV0ZUZvcm1BZGp1c3RtZW50RmllbGRzKHNGb3JtQWRqdXN0bWVudDogYW55LCBfb0xheW91dENvbmZpZzogYW55KTogYW55O1xufVxuXG5leHBvcnQgZGVmYXVsdCBTdWJTZWN0aW9uQmxvY2s7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBS0EsTUFBTUEsdUJBQXVCLEdBQUdDLE9BQU8sQ0FBQ0QsdUJBQXVCO0VBQUMsSUFFMURFLGVBQWUsV0FEcEJDLGNBQWMsQ0FBQyxzREFBc0QsQ0FBQyxVQUVyRUMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxnQ0FBZ0M7SUFBRUMsS0FBSyxFQUFFLFVBQVU7SUFBRUMsWUFBWSxFQUFFO0VBQUUsQ0FBQyxDQUFDLFVBR3hGQyxXQUFXLENBQUM7SUFBRUgsSUFBSSxFQUFFLHFCQUFxQjtJQUFFSSxRQUFRLEVBQUU7RUFBTSxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQUc5REMsSUFBSSxHQUFKLGdCQUFPO01BQ04scUJBQU1BLElBQUk7TUFDVCxJQUFJLENBQVNDLFdBQVcsR0FBRyxJQUFJO0lBQ2pDLENBQUM7SUFBQSxPQUNEQyxvQkFBb0IsR0FBcEIsZ0NBQXVCO01BQ3RCLE1BQU1DLGVBQWUsR0FBRyxJQUFJLENBQUNDLGlCQUFpQixFQUFFO1FBQy9DQyxLQUFLLEdBQUcsSUFBSSxDQUFDQyx1QkFBdUIsRUFBRTtRQUN0Q0MsT0FBTyxHQUFHLElBQUksQ0FBQ0MsNEJBQTRCO01BQzVDLElBQUlDLHFCQUFxQjtNQUV6QixJQUFJTixlQUFlLEtBQUtiLHVCQUF1QixDQUFDb0IsSUFBSSxJQUFJTCxLQUFLLElBQUlFLE9BQU8sRUFBRTtRQUN6RUUscUJBQXFCLEdBQUcsSUFBSSxDQUFDRSw0QkFBNEIsQ0FBQ1IsZUFBZSxFQUFFSSxPQUFPLENBQUNLLGNBQWMsQ0FBQztRQUVsRyxJQUFJLENBQUNDLFdBQVcsQ0FBQ1IsS0FBSyxFQUFFSSxxQkFBcUIsQ0FBQztNQUMvQztJQUNELENBQUM7SUFBQSxPQUNESyxPQUFPLEdBQVAsaUJBQVFDLEtBQVUsRUFBRTtNQUNuQixJQUFJLENBQUNDLFdBQVcsQ0FBQyxNQUFNLEVBQUVELEtBQUssQ0FBQztNQUMvQjtJQUNELENBQUM7SUFBQSxPQUVERSxlQUFlLEdBQWYsMkJBQWtCO01BQ2pCO0lBQUE7SUFFRDtJQUFBO0lBQUEsT0FDQVgsdUJBQXVCLEdBQXZCLG1DQUEwQjtNQUN6QixPQUFPLElBQUksQ0FBQ1ksY0FBYyxDQUFDLFNBQVMsQ0FBQztJQUN0QyxDQUFDO0lBQUE7RUFBQSxFQWxDNEJDLFNBQVM7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9BMEN4QjNCLGVBQWU7QUFBQSJ9