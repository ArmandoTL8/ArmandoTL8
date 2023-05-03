/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime"], function (BuildingBlock, BuildingBlockRuntime) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var _exports = {};
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CustomFragment = (
  /**
   * Content of a custom fragment
   *
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "CustomFragment",
    namespace: "sap.fe.macros.fpm"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: false
  }), _dec4 = blockAttribute({
    type: "string",
    required: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(CustomFragment, _BuildingBlockBase);
    function CustomFragment() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fragmentName", _descriptor3, _assertThisInitialized(_this));
      return _this;
    }
    _exports = CustomFragment;
    var _proto = CustomFragment.prototype;
    /**
     * The building block template function.
     *
     * @returns An XML-based string
     */
    _proto.getTemplate = function getTemplate() {
      const fragmentInstanceName = this.fragmentName + "-JS".replace(/\//g, ".");
      return xml`<core:Fragment
			xmlns:compo="http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1"
			fragmentName="${fragmentInstanceName}"
			id="${this.id}"
			type="CUSTOM"
		>
			<compo:fragmentContent>
				<core:FragmentDefinition>
					<core:Fragment fragmentName="${this.fragmentName}" type="XML" />
				</core:FragmentDefinition>
			</compo:fragmentContent>
		</core:Fragment>`;
    };
    return CustomFragment;
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
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "fragmentName", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = CustomFragment;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21GcmFnbWVudCIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJnZXRUZW1wbGF0ZSIsImZyYWdtZW50SW5zdGFuY2VOYW1lIiwiZnJhZ21lbnROYW1lIiwicmVwbGFjZSIsInhtbCIsImlkIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkN1c3RvbUZyYWdtZW50LmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCB7IFY0Q29udGV4dCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi8uLi8uLi90eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxuLyoqXG4gKiBDb250ZW50IG9mIGEgY3VzdG9tIGZyYWdtZW50XG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkN1c3RvbUZyYWdtZW50XCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmZwbVwiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VzdG9tRnJhZ21lbnQgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgY3VzdG9tIGZyYWdtZW50XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRwdWJsaWMgaWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIENvbnRleHQgUGF0aFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLCByZXF1aXJlZDogZmFsc2UgfSlcblx0cHVibGljIGNvbnRleHRQYXRoITogVjRDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiAgTmFtZSBvZiB0aGUgY3VzdG9tIGZyYWdtZW50XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRwdWJsaWMgZnJhZ21lbnROYW1lITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmdcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IGZyYWdtZW50SW5zdGFuY2VOYW1lID0gdGhpcy5mcmFnbWVudE5hbWUgKyBcIi1KU1wiLnJlcGxhY2UoL1xcLy9nLCBcIi5cIik7XG5cblx0XHRyZXR1cm4geG1sYDxjb3JlOkZyYWdtZW50XG5cdFx0XHR4bWxuczpjb21wbz1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS54bWxjb21wb3NpdGUvMVwiXG5cdFx0XHRmcmFnbWVudE5hbWU9XCIke2ZyYWdtZW50SW5zdGFuY2VOYW1lfVwiXG5cdFx0XHRpZD1cIiR7dGhpcy5pZH1cIlxuXHRcdFx0dHlwZT1cIkNVU1RPTVwiXG5cdFx0PlxuXHRcdFx0PGNvbXBvOmZyYWdtZW50Q29udGVudD5cblx0XHRcdFx0PGNvcmU6RnJhZ21lbnREZWZpbml0aW9uPlxuXHRcdFx0XHRcdDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cIiR7dGhpcy5mcmFnbWVudE5hbWV9XCIgdHlwZT1cIlhNTFwiIC8+XG5cdFx0XHRcdDwvY29yZTpGcmFnbWVudERlZmluaXRpb24+XG5cdFx0XHQ8L2NvbXBvOmZyYWdtZW50Q29udGVudD5cblx0XHQ8L2NvcmU6RnJhZ21lbnQ+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O01BY3FCQSxjQUFjO0VBVm5DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLE9BTUNDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsZ0JBQWdCO0lBQ3RCQyxTQUFTLEVBQUU7RUFDWixDQUFDLENBQUMsVUFLQUMsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQU1sREYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxzQkFBc0I7SUFBRUMsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBTWpFRixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQUduRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBSkMsT0FLQUMsV0FBVyxHQUFYLHVCQUFjO01BQ2IsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDQyxZQUFZLEdBQUcsS0FBSyxDQUFDQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztNQUUxRSxPQUFPQyxHQUFJO0FBQ2I7QUFDQSxtQkFBbUJILG9CQUFxQjtBQUN4QyxTQUFTLElBQUksQ0FBQ0ksRUFBRztBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxJQUFJLENBQUNILFlBQWE7QUFDdEQ7QUFDQTtBQUNBLG1CQUFtQjtJQUNsQixDQUFDO0lBQUE7RUFBQSxFQXZDMENJLGlCQUFpQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9