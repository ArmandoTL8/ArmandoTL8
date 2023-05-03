/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime"], function (BuildingBlock, BuildingBlockRuntime) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;
  var _exports = {};
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockEvent = BuildingBlock.blockEvent;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ActionCommand = (
  /**
   * Content of an action command
   *
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "ActionCommand",
    namespace: "sap.fe.macros.internal"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "boolean"
  }), _dec5 = blockAttribute({
    type: "boolean"
  }), _dec6 = blockAttribute({
    type: "boolean"
  }), _dec7 = blockEvent(), _dec8 = blockEvent(), _dec9 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ActionCommand, _BuildingBlockBase);
    function ActionCommand() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "action", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isActionEnabled", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isIBNEnabled", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onExecuteAction", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onExecuteIBN", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onExecuteManifest", _descriptor8, _assertThisInitialized(_this));
      return _this;
    }
    _exports = ActionCommand;
    var _proto = ActionCommand.prototype;
    /**
     * The building block template function.
     *
     * @returns An XML-based string
     */
    _proto.getTemplate = function getTemplate() {
      let execute;
      let enabled;
      switch (this.action.type) {
        case "ForAction":
          execute = this.onExecuteAction;
          enabled = this.isActionEnabled !== undefined ? this.isActionEnabled : this.action.enabled;
          break;
        case "ForNavigation":
          execute = this.onExecuteIBN;
          enabled = this.isIBNEnabled !== undefined ? this.isIBNEnabled : this.action.enabled;
          break;
        default:
          execute = this.onExecuteManifest;
          enabled = this.action.enabled;
          break;
      }
      return xml`
		<control:CommandExecution
			xmlns:control="sap.fe.core.controls"
			core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
			execute="${execute}"
			enabled="${enabled}"
			visible="${this.visible !== undefined ? this.visible : this.action.visible}"
			command="${this.action.command}"
		/>`;
    };
    return ActionCommand;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "action", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "isActionEnabled", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "isIBNEnabled", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "onExecuteAction", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "onExecuteIBN", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "onExecuteManifest", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  _exports = ActionCommand;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBY3Rpb25Db21tYW5kIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImJsb2NrRXZlbnQiLCJnZXRUZW1wbGF0ZSIsImV4ZWN1dGUiLCJlbmFibGVkIiwiYWN0aW9uIiwib25FeGVjdXRlQWN0aW9uIiwiaXNBY3Rpb25FbmFibGVkIiwidW5kZWZpbmVkIiwib25FeGVjdXRlSUJOIiwiaXNJQk5FbmFibGVkIiwib25FeGVjdXRlTWFuaWZlc3QiLCJ4bWwiLCJ2aXNpYmxlIiwiY29tbWFuZCIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBY3Rpb25Db21tYW5kLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBibG9ja0V2ZW50LCBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCB0eXBlIHsgQ29udmVydGVyQWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuLyoqXG4gKiBDb250ZW50IG9mIGFuIGFjdGlvbiBjb21tYW5kXG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkFjdGlvbkNvbW1hbmRcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjdGlvbkNvbW1hbmQgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBpZCE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBhY3Rpb24hOiBDb252ZXJ0ZXJBY3Rpb247XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0cHVibGljIGlzQWN0aW9uRW5hYmxlZD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0cHVibGljIGlzSUJORW5hYmxlZD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0cHVibGljIHZpc2libGU/OiBib29sZWFuO1xuXG5cdEBibG9ja0V2ZW50KClcblx0b25FeGVjdXRlQWN0aW9uID0gXCJcIjtcblxuXHRAYmxvY2tFdmVudCgpXG5cdG9uRXhlY3V0ZUlCTiA9IFwiXCI7XG5cblx0QGJsb2NrRXZlbnQoKVxuXHRvbkV4ZWN1dGVNYW5pZmVzdCA9IFwiXCI7XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmdW5jdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZ1xuXHQgKi9cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0bGV0IGV4ZWN1dGU7XG5cdFx0bGV0IGVuYWJsZWQ7XG5cdFx0c3dpdGNoICh0aGlzLmFjdGlvbi50eXBlKSB7XG5cdFx0XHRjYXNlIFwiRm9yQWN0aW9uXCI6XG5cdFx0XHRcdGV4ZWN1dGUgPSB0aGlzLm9uRXhlY3V0ZUFjdGlvbjtcblx0XHRcdFx0ZW5hYmxlZCA9IHRoaXMuaXNBY3Rpb25FbmFibGVkICE9PSB1bmRlZmluZWQgPyB0aGlzLmlzQWN0aW9uRW5hYmxlZCA6IHRoaXMuYWN0aW9uLmVuYWJsZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkZvck5hdmlnYXRpb25cIjpcblx0XHRcdFx0ZXhlY3V0ZSA9IHRoaXMub25FeGVjdXRlSUJOO1xuXHRcdFx0XHRlbmFibGVkID0gdGhpcy5pc0lCTkVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IHRoaXMuaXNJQk5FbmFibGVkIDogdGhpcy5hY3Rpb24uZW5hYmxlZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRleGVjdXRlID0gdGhpcy5vbkV4ZWN1dGVNYW5pZmVzdDtcblx0XHRcdFx0ZW5hYmxlZCA9IHRoaXMuYWN0aW9uLmVuYWJsZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYFxuXHRcdDxjb250cm9sOkNvbW1hbmRFeGVjdXRpb25cblx0XHRcdHhtbG5zOmNvbnRyb2w9XCJzYXAuZmUuY29yZS5jb250cm9sc1wiXG5cdFx0XHRjb3JlOnJlcXVpcmU9XCJ7RlBNOiAnc2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXInfVwiXG5cdFx0XHRleGVjdXRlPVwiJHtleGVjdXRlfVwiXG5cdFx0XHRlbmFibGVkPVwiJHtlbmFibGVkfVwiXG5cdFx0XHR2aXNpYmxlPVwiJHt0aGlzLnZpc2libGUgIT09IHVuZGVmaW5lZCA/IHRoaXMudmlzaWJsZSA6IHRoaXMuYWN0aW9uLnZpc2libGV9XCJcblx0XHRcdGNvbW1hbmQ9XCIke3RoaXMuYWN0aW9uLmNvbW1hbmR9XCJcblx0XHQvPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFhcUJBLGFBQWE7RUFWbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsT0FNQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxlQUFlO0lBQ3JCQyxTQUFTLEVBQUU7RUFDWixDQUFDLENBQUMsVUFFQUMsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQUdsREYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxzQkFBc0I7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBR2hFRixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBR25DRCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBR25DRCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBR25DRSxVQUFVLEVBQUUsVUFHWkEsVUFBVSxFQUFFLFVBR1pBLFVBQVUsRUFBRTtJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBR2I7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUpDLE9BS0FDLFdBQVcsR0FBWCx1QkFBYztNQUNiLElBQUlDLE9BQU87TUFDWCxJQUFJQyxPQUFPO01BQ1gsUUFBUSxJQUFJLENBQUNDLE1BQU0sQ0FBQ04sSUFBSTtRQUN2QixLQUFLLFdBQVc7VUFDZkksT0FBTyxHQUFHLElBQUksQ0FBQ0csZUFBZTtVQUM5QkYsT0FBTyxHQUFHLElBQUksQ0FBQ0csZUFBZSxLQUFLQyxTQUFTLEdBQUcsSUFBSSxDQUFDRCxlQUFlLEdBQUcsSUFBSSxDQUFDRixNQUFNLENBQUNELE9BQU87VUFDekY7UUFDRCxLQUFLLGVBQWU7VUFDbkJELE9BQU8sR0FBRyxJQUFJLENBQUNNLFlBQVk7VUFDM0JMLE9BQU8sR0FBRyxJQUFJLENBQUNNLFlBQVksS0FBS0YsU0FBUyxHQUFHLElBQUksQ0FBQ0UsWUFBWSxHQUFHLElBQUksQ0FBQ0wsTUFBTSxDQUFDRCxPQUFPO1VBQ25GO1FBQ0Q7VUFDQ0QsT0FBTyxHQUFHLElBQUksQ0FBQ1EsaUJBQWlCO1VBQ2hDUCxPQUFPLEdBQUcsSUFBSSxDQUFDQyxNQUFNLENBQUNELE9BQU87VUFDN0I7TUFBTTtNQUVSLE9BQU9RLEdBQUk7QUFDYjtBQUNBO0FBQ0E7QUFDQSxjQUFjVCxPQUFRO0FBQ3RCLGNBQWNDLE9BQVE7QUFDdEIsY0FBYyxJQUFJLENBQUNTLE9BQU8sS0FBS0wsU0FBUyxHQUFHLElBQUksQ0FBQ0ssT0FBTyxHQUFHLElBQUksQ0FBQ1IsTUFBTSxDQUFDUSxPQUFRO0FBQzlFLGNBQWMsSUFBSSxDQUFDUixNQUFNLENBQUNTLE9BQVE7QUFDbEMsS0FBSztJQUNKLENBQUM7SUFBQTtFQUFBLEVBeER5Q0MsaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BaUJ6QyxFQUFFO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FHTCxFQUFFO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FHRyxFQUFFO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9