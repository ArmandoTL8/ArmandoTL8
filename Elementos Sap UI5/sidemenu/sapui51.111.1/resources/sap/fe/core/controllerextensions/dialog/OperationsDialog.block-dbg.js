/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/helpers/ClassSupport", "sap/m/Bar", "sap/m/Button", "sap/m/Dialog", "sap/m/Title", "sap/fe/core/jsx-runtime/jsx"], function (BuildingBlock, ClassSupport, Bar, Button, Dialog, Title, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
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
  let OperationsDialog = (
  /**
   * Known limitations for the first tryout as mentioned in git 5806442
   *  - functional block dependency
   * 	- questionable parameters will be refactored
   */
  _dec = defineBuildingBlock({
    name: "OperationsDialog",
    namespace: "sap.fe.core.controllerextensions",
    isRuntime: true
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "string",
    defaultValue: "Dialog Standard Title"
  }), _dec4 = blockAttribute({
    type: "object",
    defaultValue: ""
  }), _dec5 = defineReference(), _dec6 = blockAttribute({
    type: "boolean"
  }), _dec7 = blockAttribute({
    type: "function"
  }), _dec8 = blockAttribute({
    type: "object"
  }), _dec9 = blockAttribute({
    type: "string"
  }), _dec10 = blockAttribute({
    type: "string"
  }), _dec11 = blockAttribute({
    type: "string"
  }), _dec12 = blockAttribute({
    type: "object"
  }), _dec13 = blockAttribute({
    type: "object"
  }), _dec14 = blockAttribute({
    type: "object"
  }), _dec15 = blockAttribute({
    type: "object"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(OperationsDialog, _BuildingBlockBase);
    function OperationsDialog(props) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageObject", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "operationsDialog", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isMultiContext412", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "resolve", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "model", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "groupId", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actionName", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "cancelButtonTxt", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "strictHandlingPromises", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "strictHandlingUtilities", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageDialogModel", _descriptor14, _assertThisInitialized(_this));
      return _this;
    }

    /*
     * The 'id' property of the dialog
     */
    _exports = OperationsDialog;
    var _proto = OperationsDialog.prototype;
    _proto.open = function open() {
      var _this$operationsDialo;
      this.getContent();
      (_this$operationsDialo = this.operationsDialog.current) === null || _this$operationsDialo === void 0 ? void 0 : _this$operationsDialo.open();
    };
    _proto.getBeginButton = function getBeginButton() {
      return new Button({
        press: () => {
          if (!(this.isMultiContext412 ?? false)) {
            var _this$resolve;
            (_this$resolve = this.resolve) === null || _this$resolve === void 0 ? void 0 : _this$resolve.call(this, true);
            this.model.submitBatch(this.groupId);
          } else {
            var _this$strictHandlingU;
            this.strictHandlingPromises.forEach(strictHandlingPromise => {
              strictHandlingPromise.resolve(true);
              this.model.submitBatch(strictHandlingPromise.groupId);
              if (strictHandlingPromise.requestSideEffects) {
                strictHandlingPromise.requestSideEffects();
              }
            });
            const strictHandlingFails = (_this$strictHandlingU = this.strictHandlingUtilities) === null || _this$strictHandlingU === void 0 ? void 0 : _this$strictHandlingU.strictHandlingTransitionFails;
            if (strictHandlingFails && strictHandlingFails.length > 0) {
              var _this$messageHandler;
              (_this$messageHandler = this.messageHandler) === null || _this$messageHandler === void 0 ? void 0 : _this$messageHandler.removeTransitionMessages();
            }
            if (this.strictHandlingUtilities) {
              this.strictHandlingUtilities.strictHandlingWarningMessages = [];
            }
          }
          if (this.strictHandlingUtilities) {
            this.strictHandlingUtilities.is412Executed = true;
          }
          this.messageDialogModel.setData({});
          this.close();
        },
        type: "Emphasized",
        text: this.actionName
      });
    };
    _proto.close = function close() {
      var _this$operationsDialo2;
      (_this$operationsDialo2 = this.operationsDialog.current) === null || _this$operationsDialo2 === void 0 ? void 0 : _this$operationsDialo2.close();
    };
    _proto.getEndButton = function getEndButton() {
      return new Button({
        press: () => {
          if (this.strictHandlingUtilities) {
            this.strictHandlingUtilities.strictHandlingWarningMessages = [];
            this.strictHandlingUtilities.is412Executed = false;
          }
          if (!(this.isMultiContext412 ?? false)) {
            this.resolve(false);
          } else {
            this.strictHandlingPromises.forEach(function (strictHandlingPromise) {
              strictHandlingPromise.resolve(false);
            });
          }
          this.messageDialogModel.setData({});
          this.close();
        },
        text: this.cancelButtonTxt
      });
    }

    /**
     * The building block render function.
     *
     * @returns An XML-based string with the definition of the field control
     */;
    _proto.getContent = function getContent() {
      return _jsx(Dialog, {
        id: this.id,
        ref: this.operationsDialog,
        resizable: true,
        content: this.messageObject.oMessageView,
        state: "Warning",
        customHeader: new Bar({
          contentLeft: [this.messageObject.oBackButton],
          contentMiddle: [new Title({
            text: "Warning"
          })]
        }),
        contentHeight: "50%",
        contentWidth: "50%",
        verticalScrolling: false,
        beginButton: this.getBeginButton(),
        endButton: this.getEndButton()
      });
    };
    return OperationsDialog;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "messageObject", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "operationsDialog", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "isMultiContext412", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "resolve", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "model", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "groupId", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "actionName", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "cancelButtonTxt", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "strictHandlingPromises", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "strictHandlingUtilities", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "messageDialogModel", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = OperationsDialog;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPcGVyYXRpb25zRGlhbG9nIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJpc1J1bnRpbWUiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJpc1B1YmxpYyIsInJlcXVpcmVkIiwiZGVmYXVsdFZhbHVlIiwiZGVmaW5lUmVmZXJlbmNlIiwicHJvcHMiLCJvcGVuIiwiZ2V0Q29udGVudCIsIm9wZXJhdGlvbnNEaWFsb2ciLCJjdXJyZW50IiwiZ2V0QmVnaW5CdXR0b24iLCJCdXR0b24iLCJwcmVzcyIsImlzTXVsdGlDb250ZXh0NDEyIiwicmVzb2x2ZSIsIm1vZGVsIiwic3VibWl0QmF0Y2giLCJncm91cElkIiwic3RyaWN0SGFuZGxpbmdQcm9taXNlcyIsImZvckVhY2giLCJzdHJpY3RIYW5kbGluZ1Byb21pc2UiLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJzdHJpY3RIYW5kbGluZ0ZhaWxzIiwic3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMiLCJzdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscyIsImxlbmd0aCIsIm1lc3NhZ2VIYW5kbGVyIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwic3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXMiLCJpczQxMkV4ZWN1dGVkIiwibWVzc2FnZURpYWxvZ01vZGVsIiwic2V0RGF0YSIsImNsb3NlIiwidGV4dCIsImFjdGlvbk5hbWUiLCJnZXRFbmRCdXR0b24iLCJjYW5jZWxCdXR0b25UeHQiLCJpZCIsIm1lc3NhZ2VPYmplY3QiLCJvTWVzc2FnZVZpZXciLCJCYXIiLCJjb250ZW50TGVmdCIsIm9CYWNrQnV0dG9uIiwiY29udGVudE1pZGRsZSIsIlRpdGxlIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk9wZXJhdGlvbnNEaWFsb2cuYmxvY2sudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZGVmaW5lUmVmZXJlbmNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSB7IFJlZiB9IGZyb20gXCJzYXAvZmUvY29yZS9qc3gtcnVudGltZS9qc3hcIjtcbmltcG9ydCBCYXIgZnJvbSBcInNhcC9tL0JhclwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBUaXRsZSBmcm9tIFwic2FwL20vVGl0bGVcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBNZXNzYWdlSGFuZGxlciBmcm9tIFwiLi4vTWVzc2FnZUhhbmRsZXJcIjtcblxudHlwZSBTdHJpY3RIYW5kbGluZ1Byb21pc2UgPSB7XG5cdC8vVE9ETzogbW92ZSB0byBzb21ld2hlcmUgZWxzZVxuXHRyZXNvbHZlOiBGdW5jdGlvbjtcblx0Z3JvdXBJZDogc3RyaW5nO1xuXHRyZXF1ZXN0U2lkZUVmZmVjdHM/OiBGdW5jdGlvbjtcbn07XG5cbmV4cG9ydCB0eXBlIFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzID0ge1xuXHQvL1RPRE86IG1vdmUgdG8gc29tZXdoZXJlIGVsc2Vcblx0aXM0MTJFeGVjdXRlZDogYm9vbGVhbjtcblx0c3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM6IE9iamVjdFtdO1xuXHRzdHJpY3RIYW5kbGluZ1Byb21pc2VzOiBTdHJpY3RIYW5kbGluZ1Byb21pc2VbXTtcblx0c3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXM6IE1lc3NhZ2VbXTtcblx0ZGVsYXlTdWNjZXNzTWVzc2FnZXM6IE1lc3NhZ2VbXTtcblx0cHJvY2Vzc2VkTWVzc2FnZUlkczogc3RyaW5nW107XG59O1xuXG4vKipcbiAqIEtub3duIGxpbWl0YXRpb25zIGZvciB0aGUgZmlyc3QgdHJ5b3V0IGFzIG1lbnRpb25lZCBpbiBnaXQgNTgwNjQ0MlxuICogIC0gZnVuY3Rpb25hbCBibG9jayBkZXBlbmRlbmN5XG4gKiBcdC0gcXVlc3Rpb25hYmxlIHBhcmFtZXRlcnMgd2lsbCBiZSByZWZhY3RvcmVkXG4gKi9cblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIk9wZXJhdGlvbnNEaWFsb2dcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zXCIsXG5cdGlzUnVudGltZTogdHJ1ZVxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9wZXJhdGlvbnNEaWFsb2cgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8T3BlcmF0aW9uc0RpYWxvZz4pIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdH1cblxuXHQvKlxuXHQgKiBUaGUgJ2lkJyBwcm9wZXJ0eSBvZiB0aGUgZGlhbG9nXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSwgcmVxdWlyZWQ6IHRydWUgfSlcblx0cHVibGljIGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgJ3RpdGxlJyBwcm9wZXJ0eSBvZiB0aGUgRGlhbG9nO1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcIkRpYWxvZyBTdGFuZGFyZCBUaXRsZVwiIH0pXG5cdHB1YmxpYyB0aXRsZT86IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIG1lc3NhZ2Ugb2JqZWN0IHRoYXQgaXMgcHJvdmlkZWQgdG8gdGhpcyBkaWFsb2dcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwib2JqZWN0XCIsIGRlZmF1bHRWYWx1ZTogXCJcIiB9KSAvL1RPRE86IGNyZWF0ZSB0aGUgdHlwZVxuXHRwdWJsaWMgbWVzc2FnZU9iamVjdD86IGFueTtcblxuXHRAZGVmaW5lUmVmZXJlbmNlKClcblx0b3BlcmF0aW9uc0RpYWxvZyE6IFJlZjxEaWFsb2c+O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHB1YmxpYyBpc011bHRpQ29udGV4dDQxMj86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJmdW5jdGlvblwiIH0pXG5cdHB1YmxpYyByZXNvbHZlPzogRnVuY3Rpb247XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJvYmplY3RcIiB9KVxuXHRwdWJsaWMgbW9kZWwhOiBPRGF0YU1vZGVsO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0cHVibGljIGdyb3VwSWQhOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRwdWJsaWMgYWN0aW9uTmFtZSE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHB1YmxpYyBjYW5jZWxCdXR0b25UeHQhOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJvYmplY3RcIiB9KVxuXHRwdWJsaWMgc3RyaWN0SGFuZGxpbmdQcm9taXNlcyE6IFN0cmljdEhhbmRsaW5nUHJvbWlzZVtdO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwib2JqZWN0XCIgfSlcblx0cHVibGljIHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzPzogU3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJvYmplY3RcIiB9KVxuXHRwdWJsaWMgbWVzc2FnZUhhbmRsZXI/OiBNZXNzYWdlSGFuZGxlcjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdHB1YmxpYyBtZXNzYWdlRGlhbG9nTW9kZWwhOiBKU09OTW9kZWw7XG5cblx0cHVibGljIG9wZW4oKSB7XG5cdFx0dGhpcy5nZXRDb250ZW50KCk7XG5cdFx0dGhpcy5vcGVyYXRpb25zRGlhbG9nLmN1cnJlbnQ/Lm9wZW4oKTtcblx0fVxuXG5cdHByaXZhdGUgZ2V0QmVnaW5CdXR0b24oKSB7XG5cdFx0cmV0dXJuIG5ldyBCdXR0b24oe1xuXHRcdFx0cHJlc3M6ICgpID0+IHtcblx0XHRcdFx0aWYgKCEodGhpcy5pc011bHRpQ29udGV4dDQxMiA/PyBmYWxzZSkpIHtcblx0XHRcdFx0XHR0aGlzLnJlc29sdmU/Lih0cnVlKTtcblx0XHRcdFx0XHR0aGlzLm1vZGVsLnN1Ym1pdEJhdGNoKHRoaXMuZ3JvdXBJZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5zdHJpY3RIYW5kbGluZ1Byb21pc2VzLmZvckVhY2goKHN0cmljdEhhbmRsaW5nUHJvbWlzZTogU3RyaWN0SGFuZGxpbmdQcm9taXNlKSA9PiB7XG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1Byb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0XHRcdFx0XHRcdHRoaXMubW9kZWwuc3VibWl0QmF0Y2goc3RyaWN0SGFuZGxpbmdQcm9taXNlLmdyb3VwSWQpO1xuXHRcdFx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nUHJvbWlzZS5yZXF1ZXN0U2lkZUVmZmVjdHMpIHtcblx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlLnJlcXVlc3RTaWRlRWZmZWN0cygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGNvbnN0IHN0cmljdEhhbmRsaW5nRmFpbHMgPSB0aGlzLnN0cmljdEhhbmRsaW5nVXRpbGl0aWVzPy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscztcblx0XHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdGYWlscyAmJiBzdHJpY3RIYW5kbGluZ0ZhaWxzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdHRoaXMubWVzc2FnZUhhbmRsZXI/LnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGhpcy5zdHJpY3RIYW5kbGluZ1V0aWxpdGllcykge1xuXHRcdFx0XHRcdFx0dGhpcy5zdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlcyA9IFtdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5zdHJpY3RIYW5kbGluZ1V0aWxpdGllcykge1xuXHRcdFx0XHRcdHRoaXMuc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuaXM0MTJFeGVjdXRlZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5tZXNzYWdlRGlhbG9nTW9kZWwuc2V0RGF0YSh7fSk7XG5cdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdH0sXG5cdFx0XHR0eXBlOiBcIkVtcGhhc2l6ZWRcIixcblx0XHRcdHRleHQ6IHRoaXMuYWN0aW9uTmFtZVxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBjbG9zZSgpIHtcblx0XHR0aGlzLm9wZXJhdGlvbnNEaWFsb2cuY3VycmVudD8uY2xvc2UoKTtcblx0fVxuXG5cdHByaXZhdGUgZ2V0RW5kQnV0dG9uKCkge1xuXHRcdHJldHVybiBuZXcgQnV0dG9uKHtcblx0XHRcdHByZXNzOiAoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLnN0cmljdEhhbmRsaW5nVXRpbGl0aWVzKSB7XG5cdFx0XHRcdFx0dGhpcy5zdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlcyA9IFtdO1xuXHRcdFx0XHRcdHRoaXMuc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuaXM0MTJFeGVjdXRlZCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghKHRoaXMuaXNNdWx0aUNvbnRleHQ0MTIgPz8gZmFsc2UpKSB7XG5cdFx0XHRcdFx0dGhpcy5yZXNvbHZlIShmYWxzZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5zdHJpY3RIYW5kbGluZ1Byb21pc2VzLmZvckVhY2goZnVuY3Rpb24gKHN0cmljdEhhbmRsaW5nUHJvbWlzZTogU3RyaWN0SGFuZGxpbmdQcm9taXNlKSB7XG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1Byb21pc2UucmVzb2x2ZShmYWxzZSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5tZXNzYWdlRGlhbG9nTW9kZWwuc2V0RGF0YSh7fSk7XG5cdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdH0sXG5cdFx0XHR0ZXh0OiB0aGlzLmNhbmNlbEJ1dHRvblR4dFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayByZW5kZXIgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0Q29udGVudCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PERpYWxvZ1xuXHRcdFx0XHRpZD17dGhpcy5pZH1cblx0XHRcdFx0cmVmPXt0aGlzLm9wZXJhdGlvbnNEaWFsb2d9XG5cdFx0XHRcdHJlc2l6YWJsZT17dHJ1ZX1cblx0XHRcdFx0Y29udGVudD17dGhpcy5tZXNzYWdlT2JqZWN0Lm9NZXNzYWdlVmlld31cblx0XHRcdFx0c3RhdGU9e1wiV2FybmluZ1wifVxuXHRcdFx0XHRjdXN0b21IZWFkZXI9e1xuXHRcdFx0XHRcdG5ldyBCYXIoe1xuXHRcdFx0XHRcdFx0Y29udGVudExlZnQ6IFt0aGlzLm1lc3NhZ2VPYmplY3Qub0JhY2tCdXR0b25dLFxuXHRcdFx0XHRcdFx0Y29udGVudE1pZGRsZTogW25ldyBUaXRsZSh7IHRleHQ6IFwiV2FybmluZ1wiIH0pXVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdFx0Y29udGVudEhlaWdodD17XCI1MCVcIn1cblx0XHRcdFx0Y29udGVudFdpZHRoPXtcIjUwJVwifVxuXHRcdFx0XHR2ZXJ0aWNhbFNjcm9sbGluZz17ZmFsc2V9XG5cdFx0XHRcdGJlZ2luQnV0dG9uPXt0aGlzLmdldEJlZ2luQnV0dG9uKCl9XG5cdFx0XHRcdGVuZEJ1dHRvbj17dGhpcy5nZXRFbmRCdXR0b24oKX1cblx0XHRcdD48L0RpYWxvZz5cblx0XHQpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7TUF5Q3FCQSxnQkFBZ0I7RUFYckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUpBLE9BTUNDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsa0JBQWtCO0lBQ3hCQyxTQUFTLEVBQUUsa0NBQWtDO0lBQzdDQyxTQUFTLEVBQUU7RUFDWixDQUFDLENBQUMsVUFTQUMsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRSxJQUFJO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQU1sRUgsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVHLFlBQVksRUFBRTtFQUF3QixDQUFDLENBQUMsVUFNekVKLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFRyxZQUFZLEVBQUU7RUFBRyxDQUFDLENBQUMsVUFHcERDLGVBQWUsRUFB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