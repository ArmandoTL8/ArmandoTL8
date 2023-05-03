/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/message/Message", "../MacroAPI"], function (ClassSupport, Message, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Returns the first visible control in the FieldWrapper.
   *
   * @param oControl FieldWrapper
   * @returns The first visible control
   */
  function getControlInFieldWrapper(oControl) {
    if (oControl.isA("sap.fe.core.controls.FieldWrapper")) {
      const oFieldWrapper = oControl;
      const aControls = oFieldWrapper.getEditMode() === "Display" ? [oFieldWrapper.getContentDisplay()] : oFieldWrapper.getContentEdit();
      if (aControls.length >= 1) {
        return aControls.length ? aControls[0] : undefined;
      }
    } else {
      return oControl;
    }
    return undefined;
  }

  /**
   * Building block for creating a field based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField or DataPoint annotation is expected, but the field can also be used to display a property from the entity type.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Field id="MyField" metaPath="MyProperty" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Field
   * @public
   */
  let FieldAPI = (_dec = defineUI5Class("sap.fe.macros.field.FieldAPI"), _dec2 = property({
    type: "boolean"
  }), _dec3 = property({
    type: "boolean"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string",
    expectedAnnotations: [],
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty", "Property"]
  }), _dec6 = event(), _dec7 = association({
    type: "sap.ui.core.Control",
    multiple: true,
    singularName: "ariaLabelledBy"
  }), _dec8 = property({
    type: "boolean"
  }), _dec9 = property({
    type: "sap.fe.macros.FieldFormatOptions"
  }), _dec10 = property({
    type: "string"
  }), _dec11 = property({
    type: "boolean"
  }), _dec12 = property({
    type: "boolean"
  }), _dec13 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(FieldAPI, _MacroAPI);
    function FieldAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "editable", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "change", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "required", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationEnabled", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor11, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FieldAPI.prototype;
    _proto.handleChange = function handleChange(oEvent) {
      this.fireChange({
        value: this.getValue(),
        isValid: oEvent.getParameter("valid")
      });
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      const oContent = this.content;
      if (oContent && oContent.isA(["sap.m.Button"]) && oContent.addAriaLabelledBy) {
        const aAriaLabelledBy = this.getAriaLabelledBy();
        for (let i = 0; i < aAriaLabelledBy.length; i++) {
          const sId = aAriaLabelledBy[i];
          const aAriaLabelledBys = oContent.getAriaLabelledBy() || [];
          if (aAriaLabelledBys.indexOf(sId) === -1) {
            oContent.addAriaLabelledBy(sId);
          }
        }
      }
    };
    _proto.enhanceAccessibilityState = function enhanceAccessibilityState(_oElement, mAriaProps) {
      const oParent = this.getParent();
      if (oParent && oParent.enhanceAccessibilityState) {
        // use FieldWrapper as control, but aria properties of rendered inner control.
        oParent.enhanceAccessibilityState(this, mAriaProps);
      }
      return mAriaProps;
    };
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      const oContent = this.content;
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
      const oContent = this.content;
      return oContent.getIdForLabel();
    }
    /**
     * Retrieves the current value of the field.
     *
     * @public
     * @returns The current value of the field
     */;
    _proto.getValue = function getValue() {
      var _oControl, _oControl2, _oControl3, _oControl4;
      let oControl = getControlInFieldWrapper(this.content);
      if (this.collaborationEnabled && (_oControl = oControl) !== null && _oControl !== void 0 && _oControl.isA("sap.m.HBox")) {
        oControl = oControl.getItems()[0];
      }
      if ((_oControl2 = oControl) !== null && _oControl2 !== void 0 && _oControl2.isA("sap.m.CheckBox")) {
        return oControl.getSelected();
      } else if ((_oControl3 = oControl) !== null && _oControl3 !== void 0 && _oControl3.isA("sap.m.InputBase")) {
        return oControl.getValue();
      } else if ((_oControl4 = oControl) !== null && _oControl4 !== void 0 && _oControl4.isA("sap.ui.mdc.Field")) {
        return oControl.getValue(); // FieldWrapper
      } else {
        throw "getting value not yet implemented for this field type";
      }
    }

    /**
     * Adds a message to the field.
     *
     * @param [parameters] The parameters to create message
     * @param parameters.type Type of the message
     * @param parameters.message Message text
     * @param parameters.description Message description
     * @param parameters.persistent True if the message is persistent
     * @returns The id of the message
     * @public
     */;
    _proto.addMessage = function addMessage(parameters) {
      const msgManager = this.getMessageManager();
      const oControl = getControlInFieldWrapper(this.content);
      let path; //target for oMessage
      if (oControl !== null && oControl !== void 0 && oControl.isA("sap.m.CheckBox")) {
        var _getBinding;
        path = (_getBinding = oControl.getBinding("selected")) === null || _getBinding === void 0 ? void 0 : _getBinding.getResolvedPath();
      } else if (oControl !== null && oControl !== void 0 && oControl.isA("sap.m.InputBase")) {
        var _getBinding2;
        path = (_getBinding2 = oControl.getBinding("value")) === null || _getBinding2 === void 0 ? void 0 : _getBinding2.getResolvedPath();
      } else if (oControl !== null && oControl !== void 0 && oControl.isA("sap.ui.mdc.Field")) {
        path = oControl.getBinding("value").getResolvedPath();
      }
      const oMessage = new Message({
        target: path,
        type: parameters.type,
        message: parameters.message,
        processor: oControl === null || oControl === void 0 ? void 0 : oControl.getModel(),
        description: parameters.description,
        persistent: parameters.persistent
      });
      msgManager.addMessages(oMessage);
      return oMessage.getId();
    }

    /**
     * Removes a message from the field.
     *
     * @param id The id of the message
     * @public
     */;
    _proto.removeMessage = function removeMessage(id) {
      const msgManager = this.getMessageManager();
      const arr = msgManager.getMessageModel().getData();
      const result = arr.find(e => e.id === id);
      if (result) {
        msgManager.removeMessages(result);
      }
    };
    _proto.getMessageManager = function getMessageManager() {
      return sap.ui.getCore().getMessageManager();
    };
    return FieldAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "editable", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "change", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "required", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "collaborationEnabled", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleChange", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "handleChange"), _class2.prototype)), _class2)) || _class);
  return FieldAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDb250cm9sSW5GaWVsZFdyYXBwZXIiLCJvQ29udHJvbCIsImlzQSIsIm9GaWVsZFdyYXBwZXIiLCJhQ29udHJvbHMiLCJnZXRFZGl0TW9kZSIsImdldENvbnRlbnREaXNwbGF5IiwiZ2V0Q29udGVudEVkaXQiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJGaWVsZEFQSSIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiZXhwZWN0ZWRBbm5vdGF0aW9ucyIsImV4cGVjdGVkVHlwZXMiLCJldmVudCIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzaW5ndWxhck5hbWUiLCJ4bWxFdmVudEhhbmRsZXIiLCJoYW5kbGVDaGFuZ2UiLCJvRXZlbnQiLCJmaXJlQ2hhbmdlIiwidmFsdWUiLCJnZXRWYWx1ZSIsImlzVmFsaWQiLCJnZXRQYXJhbWV0ZXIiLCJvbkJlZm9yZVJlbmRlcmluZyIsIm9Db250ZW50IiwiY29udGVudCIsImFkZEFyaWFMYWJlbGxlZEJ5IiwiYUFyaWFMYWJlbGxlZEJ5IiwiZ2V0QXJpYUxhYmVsbGVkQnkiLCJpIiwic0lkIiwiYUFyaWFMYWJlbGxlZEJ5cyIsImluZGV4T2YiLCJlbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlIiwiX29FbGVtZW50IiwibUFyaWFQcm9wcyIsIm9QYXJlbnQiLCJnZXRQYXJlbnQiLCJnZXRBY2Nlc3NpYmlsaXR5SW5mbyIsImdldElkRm9yTGFiZWwiLCJjb2xsYWJvcmF0aW9uRW5hYmxlZCIsImdldEl0ZW1zIiwiZ2V0U2VsZWN0ZWQiLCJhZGRNZXNzYWdlIiwicGFyYW1ldGVycyIsIm1zZ01hbmFnZXIiLCJnZXRNZXNzYWdlTWFuYWdlciIsInBhdGgiLCJnZXRCaW5kaW5nIiwiZ2V0UmVzb2x2ZWRQYXRoIiwib01lc3NhZ2UiLCJNZXNzYWdlIiwidGFyZ2V0IiwibWVzc2FnZSIsInByb2Nlc3NvciIsImdldE1vZGVsIiwiZGVzY3JpcHRpb24iLCJwZXJzaXN0ZW50IiwiYWRkTWVzc2FnZXMiLCJnZXRJZCIsInJlbW92ZU1lc3NhZ2UiLCJpZCIsImFyciIsImdldE1lc3NhZ2VNb2RlbCIsImdldERhdGEiLCJyZXN1bHQiLCJmaW5kIiwiZSIsInJlbW92ZU1lc3NhZ2VzIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiTWFjcm9BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIEZpZWxkV3JhcHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbHMvRmllbGRXcmFwcGVyXCI7XG5pbXBvcnQgdHlwZSB7IEVuaGFuY2VXaXRoVUk1IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBhc3NvY2lhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBwcm9wZXJ0eSwgeG1sRXZlbnRIYW5kbGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IHR5cGUgQ2hlY2tCb3ggZnJvbSBcInNhcC9tL0NoZWNrQm94XCI7XG5pbXBvcnQgdHlwZSBIQm94IGZyb20gXCJzYXAvbS9IQm94XCI7XG5pbXBvcnQgdHlwZSBJbnB1dEJhc2UgZnJvbSBcInNhcC9tL0lucHV0QmFzZVwiO1xuaW1wb3J0IHR5cGUgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCBNYWNyb0FQSSBmcm9tIFwiLi4vTWFjcm9BUElcIjtcblxuLyoqXG4gKiBBZGRpdGlvbmFsIGZvcm1hdCBvcHRpb25zIGZvciB0aGUgZmllbGQuXG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRmllbGRGb3JtYXRPcHRpb25zXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIEZpZWxkRm9ybWF0T3B0aW9ucyA9IHtcblx0LyoqXG5cdCAqICBEZWZpbmVzIGhvdyB0aGUgZmllbGQgdmFsdWUgYW5kIGFzc29jaWF0ZWQgdGV4dCB3aWxsIGJlIGRpc3BsYXllZCB0b2dldGhlci48YnIvPlxuXHQgKlxuXHQgKiAgQWxsb3dlZCB2YWx1ZXMgYXJlIFwiVmFsdWVcIiwgXCJEZXNjcmlwdGlvblwiLCBcIlZhbHVlRGVzY3JpcHRpb25cIiBhbmQgXCJEZXNjcmlwdGlvblZhbHVlXCJcblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdGRpc3BsYXlNb2RlOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGlmIGFuZCBob3cgdGhlIGZpZWxkIG1lYXN1cmUgd2lsbCBiZSBkaXNwbGF5ZWQuPGJyLz5cblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIFwiSGlkZGVuXCIgYW5kIFwiUmVhZE9ubHlcIlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0bWVhc3VyZURpc3BsYXlNb2RlOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBNYXhpbXVtIG51bWJlciBvZiBsaW5lcyBmb3IgbXVsdGlsaW5lIHRleHRzIGluIGVkaXQgbW9kZS48YnIvPlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0dGV4dExpbmVzRWRpdDogbnVtYmVyO1xuXHQvKipcblx0ICogTWF4aW11bSBudW1iZXIgb2YgbGluZXMgdGhhdCBtdWx0aWxpbmUgdGV4dHMgaW4gZWRpdCBtb2RlIGNhbiBncm93IHRvLjxici8+XG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHR0ZXh0TWF4TGluZXM6IG51bWJlcjtcblx0LyoqXG5cdCAqIE1heGltdW0gbnVtYmVyIG9mIGNoYXJhY3RlcnMgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSB0ZXh0IGZpZWxkIHRoYXQgYXJlIHNob3duIGluaXRpYWxseS48YnIvPlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0dGV4dE1heENoYXJhY3RlcnNEaXNwbGF5OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGhvdyB0aGUgZnVsbCB0ZXh0IHdpbGwgYmUgZGlzcGxheWVkLjxici8+XG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBcIkluUGxhY2VcIiBhbmQgXCJQb3BvdmVyXCJcblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXk6IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGNoYXJhY3RlcnMgZm9yIHRoZSBtdWx0aWxpbmUgdGV4dCB2YWx1ZS48YnIvPlxuXHQgKlxuXHQgKiBJZiBhIG11bHRpbGluZSB0ZXh0IGV4Y2VlZHMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGFsbG93ZWQgY2hhcmFjdGVycywgdGhlIGNvdW50ZXIgYmVsb3cgdGhlIGlucHV0IGZpZWxkIGRpc3BsYXlzIHRoZSBleGFjdCBudW1iZXIuXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHR0ZXh0TWF4TGVuZ3RoOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGlmIHRoZSBkYXRlIHBhcnQgb2YgYSBkYXRlIHRpbWUgd2l0aCB0aW1lem9uZSBmaWVsZCBzaG91bGQgYmUgc2hvd24uIDxici8+XG5cdCAqXG5cdCAqIFRoZSBkYXRlVGltZU9mZnNldCBmaWVsZCBtdXN0IGhhdmUgYSB0aW1lem9uZSBhbm5vdGF0aW9uLlxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgXCJ0cnVlXCIgYW5kIFwiZmFsc2VcIi4gVGhlIGRlZmF1bHQgdmFsdWUgaXMgXCJ0cnVlXCIuXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRzaG93RGF0ZTogc3RyaW5nO1xuXHQvKipcblx0ICogRGVmaW5lcyBpZiB0aGUgdGltZSBwYXJ0IG9mIGEgZGF0ZSB0aW1lIHdpdGggdGltZXpvbmUgZmllbGQgc2hvdWxkIGJlIHNob3duLiA8YnIvPlxuXHQgKlxuXHQgKiBUaGUgZGF0ZVRpbWVPZmZzZXQgZmllbGQgbXVzdCBoYXZlIGEgdGltZXpvbmUgYW5ub3RhdGlvbi5cblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIFwidHJ1ZVwiIGFuZCBcImZhbHNlXCIuIFRoZSBkZWZhdWx0IHZhbHVlIGlzIFwidHJ1ZVwiLlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0c2hvd1RpbWU6IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgaWYgdGhlIHRpbWV6b25lIHBhcnQgb2YgYSBkYXRlIHRpbWUgd2l0aCB0aW1lem9uZSBmaWVsZCBzaG91bGQgYmUgc2hvd24uIDxici8+XG5cdCAqXG5cdCAqIFRoZSBkYXRlVGltZU9mZnNldCBmaWVsZCBtdXN0IGhhdmUgYSB0aW1lem9uZSBhbm5vdGF0aW9uLlxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgXCJ0cnVlXCIgYW5kIFwiZmFsc2VcIi4gVGhlIGRlZmF1bHQgdmFsdWUgaXMgXCJ0cnVlXCIuXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRzaG93VGltZXpvbmU6IHN0cmluZztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgdmlzaWJsZSBjb250cm9sIGluIHRoZSBGaWVsZFdyYXBwZXIuXG4gKlxuICogQHBhcmFtIG9Db250cm9sIEZpZWxkV3JhcHBlclxuICogQHJldHVybnMgVGhlIGZpcnN0IHZpc2libGUgY29udHJvbFxuICovXG5mdW5jdGlvbiBnZXRDb250cm9sSW5GaWVsZFdyYXBwZXIob0NvbnRyb2w6IENvbnRyb2wpOiBDb250cm9sIHwgdW5kZWZpbmVkIHtcblx0aWYgKG9Db250cm9sLmlzQShcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpZWxkV3JhcHBlclwiKSkge1xuXHRcdGNvbnN0IG9GaWVsZFdyYXBwZXIgPSBvQ29udHJvbCBhcyBFbmhhbmNlV2l0aFVJNTxGaWVsZFdyYXBwZXI+O1xuXHRcdGNvbnN0IGFDb250cm9scyA9IG9GaWVsZFdyYXBwZXIuZ2V0RWRpdE1vZGUoKSA9PT0gXCJEaXNwbGF5XCIgPyBbb0ZpZWxkV3JhcHBlci5nZXRDb250ZW50RGlzcGxheSgpXSA6IG9GaWVsZFdyYXBwZXIuZ2V0Q29udGVudEVkaXQoKTtcblx0XHRpZiAoYUNvbnRyb2xzLmxlbmd0aCA+PSAxKSB7XG5cdFx0XHRyZXR1cm4gYUNvbnRyb2xzLmxlbmd0aCA/IGFDb250cm9sc1swXSA6IHVuZGVmaW5lZDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIG9Db250cm9sO1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgZmllbGQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogVXN1YWxseSwgYSBEYXRhRmllbGQgb3IgRGF0YVBvaW50IGFubm90YXRpb24gaXMgZXhwZWN0ZWQsIGJ1dCB0aGUgZmllbGQgY2FuIGFsc28gYmUgdXNlZCB0byBkaXNwbGF5IGEgcHJvcGVydHkgZnJvbSB0aGUgZW50aXR5IHR5cGUuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZpZWxkIGlkPVwiTXlGaWVsZFwiIG1ldGFQYXRoPVwiTXlQcm9wZXJ0eVwiIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5GaWVsZFxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkQVBJXCIpXG5jbGFzcyBGaWVsZEFQSSBleHRlbmRzIE1hY3JvQVBJIHtcblx0LyoqXG5cdCAqIEFuIGV4cHJlc3Npb24gdGhhdCBhbGxvd3MgeW91IHRvIGNvbnRyb2wgdGhlIGVkaXRhYmxlIHN0YXRlIG9mIHRoZSBmaWVsZC5cblx0ICpcblx0ICogSWYgeW91IGRvIG5vdCBzZXQgYW55IGV4cHJlc3Npb24sIFNBUCBGaW9yaSBlbGVtZW50cyBob29rcyBpbnRvIHRoZSBzdGFuZGFyZCBsaWZlY3ljbGUgdG8gZGV0ZXJtaW5lIGlmIHRoZSBwYWdlIGlzIGN1cnJlbnRseSBlZGl0YWJsZS5cblx0ICogUGxlYXNlIG5vdGUgdGhhdCB5b3UgY2Fubm90IHNldCBhIGZpZWxkIHRvIGVkaXRhYmxlIGlmIGl0IGhhcyBiZWVuIGRlZmluZWQgaW4gdGhlIGFubm90YXRpb24gYXMgbm90IGVkaXRhYmxlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAZGVwcmVjYXRlZFxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0ZWRpdGFibGUhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBBbiBleHByZXNzaW9uIHRoYXQgYWxsb3dzIHlvdSB0byBjb250cm9sIHRoZSByZWFkLW9ubHkgc3RhdGUgb2YgdGhlIGZpZWxkLlxuXHQgKlxuXHQgKiBJZiB5b3UgZG8gbm90IHNldCBhbnkgZXhwcmVzc2lvbiwgU0FQIEZpb3JpIGVsZW1lbnRzIGhvb2tzIGludG8gdGhlIHN0YW5kYXJkIGxpZmVjeWNsZSB0byBkZXRlcm1pbmUgdGhlIGN1cnJlbnQgc3RhdGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHJlYWRPbmx5ITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIGlkZW50aWZpZXIgb2YgdGhlIEZpZWxkIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0aWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHJlbGF0aXZlIHBhdGggb2YgdGhlIHByb3BlcnR5IGluIHRoZSBtZXRhbW9kZWwsIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbnRleHRQYXRoLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uczogW10sXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiRW50aXR5VHlwZVwiLCBcIlNpbmdsZXRvblwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLCBcIlByb3BlcnR5XCJdXG5cdH0pXG5cdG1ldGFQYXRoITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBBbiBldmVudCBjb250YWluaW5nIGRldGFpbHMgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHZhbHVlIG9mIHRoZSBmaWVsZCBpcyBjaGFuZ2VkLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRjaGFuZ2UhOiBGdW5jdGlvbjtcblxuXHRAYXNzb2NpYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IHRydWUsIHNpbmd1bGFyTmFtZTogXCJhcmlhTGFiZWxsZWRCeVwiIH0pXG5cdGFyaWFMYWJlbGxlZEJ5ITogQ29udHJvbDtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRyZXF1aXJlZCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEEgc2V0IG9mIG9wdGlvbnMgdGhhdCBjYW4gYmUgY29uZmlndXJlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLkZpZWxkRm9ybWF0T3B0aW9uc1wiIH0pXG5cdGZvcm1hdE9wdGlvbnMhOiBGaWVsZEZvcm1hdE9wdGlvbnM7XG5cblx0LyoqXG5cdCAqIE9wdGlvbiB0byBhZGQgc2VtYW50aWMgb2JqZWN0cyB0byBhIGZpZWxkLlxuXHQgKiBWYWxpZCBvcHRpb25zIGFyZSBlaXRoZXIgYSBzaW5nbGUgc2VtYW50aWMgb2JqZWN0LCBhIHN0cmluZ2lmaWVkIGFycmF5IG9mIHNlbWFudGljIG9iamVjdHNcblx0ICogb3IgYSBzaW5nbGUgYmluZGluZyBleHByZXNzaW9uIHJldHVybmluZyBlaXRoZXIgYSBzaW5nbGUgc2VtYW50aWMgb2JqZWN0IG9yIGFuIGFycmF5IG9mIHNlbWFudGljIG9iamVjdHNcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRzZW1hbnRpY09iamVjdCE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRjb2xsYWJvcmF0aW9uRW5hYmxlZCE6IGJvb2xlYW47XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0dmlzaWJsZSE6IGJvb2xlYW47XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdGhhbmRsZUNoYW5nZShvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0KHRoaXMgYXMgYW55KS5maXJlQ2hhbmdlKHsgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSwgaXNWYWxpZDogb0V2ZW50LmdldFBhcmFtZXRlcihcInZhbGlkXCIpIH0pO1xuXHR9XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0Y29uc3Qgb0NvbnRlbnQgPSB0aGlzLmNvbnRlbnQ7XG5cdFx0aWYgKG9Db250ZW50ICYmIG9Db250ZW50LmlzQTxCdXR0b24+KFtcInNhcC5tLkJ1dHRvblwiXSkgJiYgb0NvbnRlbnQuYWRkQXJpYUxhYmVsbGVkQnkpIHtcblx0XHRcdGNvbnN0IGFBcmlhTGFiZWxsZWRCeSA9ICh0aGlzIGFzIGFueSkuZ2V0QXJpYUxhYmVsbGVkQnkoKTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQXJpYUxhYmVsbGVkQnkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3Qgc0lkID0gYUFyaWFMYWJlbGxlZEJ5W2ldO1xuXHRcdFx0XHRjb25zdCBhQXJpYUxhYmVsbGVkQnlzID0gb0NvbnRlbnQuZ2V0QXJpYUxhYmVsbGVkQnkoKSB8fCBbXTtcblx0XHRcdFx0aWYgKGFBcmlhTGFiZWxsZWRCeXMuaW5kZXhPZihzSWQpID09PSAtMSkge1xuXHRcdFx0XHRcdG9Db250ZW50LmFkZEFyaWFMYWJlbGxlZEJ5KHNJZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRlbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlKF9vRWxlbWVudDogb2JqZWN0LCBtQXJpYVByb3BzOiBvYmplY3QpOiBvYmplY3Qge1xuXHRcdGNvbnN0IG9QYXJlbnQgPSB0aGlzLmdldFBhcmVudCgpO1xuXG5cdFx0aWYgKG9QYXJlbnQgJiYgKG9QYXJlbnQgYXMgYW55KS5lbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlKSB7XG5cdFx0XHQvLyB1c2UgRmllbGRXcmFwcGVyIGFzIGNvbnRyb2wsIGJ1dCBhcmlhIHByb3BlcnRpZXMgb2YgcmVuZGVyZWQgaW5uZXIgY29udHJvbC5cblx0XHRcdChvUGFyZW50IGFzIGFueSkuZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZSh0aGlzLCBtQXJpYVByb3BzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbUFyaWFQcm9wcztcblx0fVxuXHRnZXRBY2Nlc3NpYmlsaXR5SW5mbygpOiBPYmplY3Qge1xuXHRcdGNvbnN0IG9Db250ZW50ID0gdGhpcy5jb250ZW50O1xuXHRcdHJldHVybiBvQ29udGVudCAmJiBvQ29udGVudC5nZXRBY2Nlc3NpYmlsaXR5SW5mbyA/IG9Db250ZW50LmdldEFjY2Vzc2liaWxpdHlJbmZvKCkgOiB7fTtcblx0fVxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgRE9NTm9kZSBJRCB0byBiZSB1c2VkIGZvciB0aGUgXCJsYWJlbEZvclwiIGF0dHJpYnV0ZS5cblx0ICpcblx0ICogV2UgZm9yd2FyZCB0aGUgY2FsbCBvZiB0aGlzIG1ldGhvZCB0byB0aGUgY29udGVudCBjb250cm9sLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBJRCB0byBiZSB1c2VkIGZvciB0aGUgPGNvZGU+bGFiZWxGb3I8L2NvZGU+XG5cdCAqL1xuXHRnZXRJZEZvckxhYmVsKCk6IHN0cmluZyB7XG5cdFx0Y29uc3Qgb0NvbnRlbnQgPSB0aGlzLmNvbnRlbnQ7XG5cdFx0cmV0dXJuIG9Db250ZW50LmdldElkRm9yTGFiZWwoKTtcblx0fVxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBmaWVsZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgZmllbGRcblx0ICovXG5cdGdldFZhbHVlKCk6IGJvb2xlYW4gfCBzdHJpbmcge1xuXHRcdGxldCBvQ29udHJvbCA9IGdldENvbnRyb2xJbkZpZWxkV3JhcHBlcih0aGlzLmNvbnRlbnQpO1xuXHRcdGlmICh0aGlzLmNvbGxhYm9yYXRpb25FbmFibGVkICYmIG9Db250cm9sPy5pc0EoXCJzYXAubS5IQm94XCIpKSB7XG5cdFx0XHRvQ29udHJvbCA9IChvQ29udHJvbCBhcyBIQm94KS5nZXRJdGVtcygpWzBdO1xuXHRcdH1cblx0XHRpZiAob0NvbnRyb2w/LmlzQShcInNhcC5tLkNoZWNrQm94XCIpKSB7XG5cdFx0XHRyZXR1cm4gKG9Db250cm9sIGFzIENoZWNrQm94KS5nZXRTZWxlY3RlZCgpO1xuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2w/LmlzQShcInNhcC5tLklucHV0QmFzZVwiKSkge1xuXHRcdFx0cmV0dXJuIChvQ29udHJvbCBhcyBJbnB1dEJhc2UpLmdldFZhbHVlKCk7XG5cdFx0fSBlbHNlIGlmIChvQ29udHJvbD8uaXNBKFwic2FwLnVpLm1kYy5GaWVsZFwiKSkge1xuXHRcdFx0cmV0dXJuIChvQ29udHJvbCBhcyBhbnkpLmdldFZhbHVlKCk7IC8vIEZpZWxkV3JhcHBlclxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBcImdldHRpbmcgdmFsdWUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgdGhpcyBmaWVsZCB0eXBlXCI7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBtZXNzYWdlIHRvIHRoZSBmaWVsZC5cblx0ICpcblx0ICogQHBhcmFtIFtwYXJhbWV0ZXJzXSBUaGUgcGFyYW1ldGVycyB0byBjcmVhdGUgbWVzc2FnZVxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy50eXBlIFR5cGUgb2YgdGhlIG1lc3NhZ2Vcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMubWVzc2FnZSBNZXNzYWdlIHRleHRcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMuZGVzY3JpcHRpb24gTWVzc2FnZSBkZXNjcmlwdGlvblxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy5wZXJzaXN0ZW50IFRydWUgaWYgdGhlIG1lc3NhZ2UgaXMgcGVyc2lzdGVudFxuXHQgKiBAcmV0dXJucyBUaGUgaWQgb2YgdGhlIG1lc3NhZ2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YWRkTWVzc2FnZShwYXJhbWV0ZXJzOiB7IHR5cGU/OiBNZXNzYWdlVHlwZTsgbWVzc2FnZT86IHN0cmluZzsgZGVzY3JpcHRpb24/OiBzdHJpbmc7IHBlcnNpc3RlbnQ/OiBib29sZWFuIH0pIHtcblx0XHRjb25zdCBtc2dNYW5hZ2VyID0gdGhpcy5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHRcdGNvbnN0IG9Db250cm9sID0gZ2V0Q29udHJvbEluRmllbGRXcmFwcGVyKHRoaXMuY29udGVudCk7XG5cblx0XHRsZXQgcGF0aDsgLy90YXJnZXQgZm9yIG9NZXNzYWdlXG5cdFx0aWYgKG9Db250cm9sPy5pc0EoXCJzYXAubS5DaGVja0JveFwiKSkge1xuXHRcdFx0cGF0aCA9IChvQ29udHJvbCBhcyBDaGVja0JveCkuZ2V0QmluZGluZyhcInNlbGVjdGVkXCIpPy5nZXRSZXNvbHZlZFBhdGgoKTtcblx0XHR9IGVsc2UgaWYgKG9Db250cm9sPy5pc0EoXCJzYXAubS5JbnB1dEJhc2VcIikpIHtcblx0XHRcdHBhdGggPSAob0NvbnRyb2wgYXMgSW5wdXRCYXNlKS5nZXRCaW5kaW5nKFwidmFsdWVcIik/LmdldFJlc29sdmVkUGF0aCgpO1xuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2w/LmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdHBhdGggPSAob0NvbnRyb2wgYXMgYW55KS5nZXRCaW5kaW5nKFwidmFsdWVcIikuZ2V0UmVzb2x2ZWRQYXRoKCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb01lc3NhZ2UgPSBuZXcgTWVzc2FnZSh7XG5cdFx0XHR0YXJnZXQ6IHBhdGgsXG5cdFx0XHR0eXBlOiBwYXJhbWV0ZXJzLnR5cGUsXG5cdFx0XHRtZXNzYWdlOiBwYXJhbWV0ZXJzLm1lc3NhZ2UsXG5cdFx0XHRwcm9jZXNzb3I6IG9Db250cm9sPy5nZXRNb2RlbCgpLFxuXHRcdFx0ZGVzY3JpcHRpb246IHBhcmFtZXRlcnMuZGVzY3JpcHRpb24sXG5cdFx0XHRwZXJzaXN0ZW50OiBwYXJhbWV0ZXJzLnBlcnNpc3RlbnRcblx0XHR9KTtcblxuXHRcdG1zZ01hbmFnZXIuYWRkTWVzc2FnZXMob01lc3NhZ2UpO1xuXHRcdHJldHVybiBvTWVzc2FnZS5nZXRJZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBtZXNzYWdlIGZyb20gdGhlIGZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGlkIG9mIHRoZSBtZXNzYWdlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlbW92ZU1lc3NhZ2UoaWQ6IHN0cmluZykge1xuXHRcdGNvbnN0IG1zZ01hbmFnZXIgPSB0aGlzLmdldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cdFx0Y29uc3QgYXJyID0gbXNnTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0Y29uc3QgcmVzdWx0ID0gYXJyLmZpbmQoKGU6IGFueSkgPT4gZS5pZCA9PT0gaWQpO1xuXHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdG1zZ01hbmFnZXIucmVtb3ZlTWVzc2FnZXMocmVzdWx0KTtcblx0XHR9XG5cdH1cblxuXHRnZXRNZXNzYWdlTWFuYWdlcigpIHtcblx0XHRyZXR1cm4gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpZWxkQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBc0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNBLHdCQUF3QixDQUFDQyxRQUFpQixFQUF1QjtJQUN6RSxJQUFJQSxRQUFRLENBQUNDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxFQUFFO01BQ3RELE1BQU1DLGFBQWEsR0FBR0YsUUFBd0M7TUFDOUQsTUFBTUcsU0FBUyxHQUFHRCxhQUFhLENBQUNFLFdBQVcsRUFBRSxLQUFLLFNBQVMsR0FBRyxDQUFDRixhQUFhLENBQUNHLGlCQUFpQixFQUFFLENBQUMsR0FBR0gsYUFBYSxDQUFDSSxjQUFjLEVBQUU7TUFDbEksSUFBSUgsU0FBUyxDQUFDSSxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQzFCLE9BQU9KLFNBQVMsQ0FBQ0ksTUFBTSxHQUFHSixTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUdLLFNBQVM7TUFDbkQ7SUFDRCxDQUFDLE1BQU07TUFDTixPQUFPUixRQUFRO0lBQ2hCO0lBQ0EsT0FBT1EsU0FBUztFQUNqQjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkEsSUFlTUMsUUFBUSxXQURiQyxjQUFjLENBQUMsOEJBQThCLENBQUMsVUFXN0NDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVSxDQUFDLENBQUMsVUFVN0JELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVSxDQUFDLENBQUMsVUFRN0JELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFRNUJELFFBQVEsQ0FBQztJQUNUQyxJQUFJ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