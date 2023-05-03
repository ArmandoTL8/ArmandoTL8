/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper"], function (BuildingBlock, BuildingBlockRuntime, MetaModelConverter, BindingToolkit, StableIdHelper, DataModelPathHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
  var _exports = {};
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var generate = StableIdHelper.generate;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
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
  let Contact = (_dec = defineBuildingBlock({
    /**
     * Name of the macro control.
     */
    name: "Contact",
    /**
     * Namespace of the macro control
     */
    namespace: "sap.fe.macros",
    /**
     * Location of the designtime info
     */
    designtime: "sap/fe/macros/Contact.designtime"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    $Type: ["com.sap.vocabularies.Communication.v1.ContactType"],
    required: true
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    $kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "boolean"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(Contact, _BuildingBlockBase);
    function Contact() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "idPrefix", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_flexId", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor6, _assertThisInitialized(_this));
      return _this;
    }
    _exports = Contact;
    var _proto = Contact.prototype;
    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */
    _proto.getTemplate = function getTemplate() {
      let id;
      if (this._flexId) {
        //in case a flex id is given, take this one
        id = this._flexId;
      } else {
        //alternatively check for idPrefix and generate an appropriate id
        id = this.idPrefix ? generate([this.idPrefix, "Field-content"]) : undefined;
      }
      const convertedContact = convertMetaModelContext(this.metaPath);
      const myDataModel = getInvolvedDataModelObjects(this.metaPath, this.contextPath);
      const value = getExpressionFromAnnotation(convertedContact.fn, getRelativePaths(myDataModel));
      const delegateConfiguration = {
        name: "sap/fe/macros/contact/ContactDelegate",
        payload: {
          contact: this.metaPath.getPath()
        }
      };
      return xml`<mdc:Field
		xmlns:mdc="sap.ui.mdc"
		delegate="{name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate'}"
		${this.attr("id", id)}
		editMode="Display"
		width="100%"
		${this.attr("visible", this.visible)}
		${this.attr("value", value)}
		${this.attr("ariaLabelledBy", this.ariaLabelledBy)}
	>
		<mdc:fieldInfo>
			<mdc:Link
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				enablePersonalization="false"
				${this.attr("delegate", JSON.stringify(delegateConfiguration))}
			/>
		</mdc:fieldInfo>
	</mdc:Field>
			`;
    };
    return Contact;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_flexId", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = Contact;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb250YWN0IiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJkZXNpZ250aW1lIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiJFR5cGUiLCJyZXF1aXJlZCIsIiRraW5kIiwiZ2V0VGVtcGxhdGUiLCJpZCIsIl9mbGV4SWQiLCJpZFByZWZpeCIsImdlbmVyYXRlIiwidW5kZWZpbmVkIiwiY29udmVydGVkQ29udGFjdCIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwibWV0YVBhdGgiLCJteURhdGFNb2RlbCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImNvbnRleHRQYXRoIiwidmFsdWUiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJmbiIsImdldFJlbGF0aXZlUGF0aHMiLCJkZWxlZ2F0ZUNvbmZpZ3VyYXRpb24iLCJwYXlsb2FkIiwiY29udGFjdCIsImdldFBhdGgiLCJ4bWwiLCJhdHRyIiwidmlzaWJsZSIsImFyaWFMYWJlbGxlZEJ5IiwiSlNPTiIsInN0cmluZ2lmeSIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb250YWN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGNsYXNzZGVzY1xuICogTWFjcm8gZm9yIGNyZWF0aW5nIGEgQ29udGFjdCBiYXNlZCBvbiBwcm92aWRlZCBPRGF0YSB2NCBtZXRhZGF0YS5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86Q29udGFjdFxuICogICBpZD1cInNvbWVJRFwiXG4gKiAgIGNvbnRhY3Q9XCJ7Y29udGFjdD59XCJcbiAqICAgY29udGV4dFBhdGg9XCJ7Y29udGV4dFBhdGg+fVwiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKiBAY2xhc3Mgc2FwLmZlLm1hY3Jvcy5Db250YWN0XG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tSdW50aW1lXCI7XG5pbXBvcnQgeyBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCwgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmVsYXRpdmVQYXRocyB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgVjRDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdC8qKlxuXHQgKiBOYW1lIG9mIHRoZSBtYWNybyBjb250cm9sLlxuXHQgKi9cblx0bmFtZTogXCJDb250YWN0XCIsXG5cdC8qKlxuXHQgKiBOYW1lc3BhY2Ugb2YgdGhlIG1hY3JvIGNvbnRyb2xcblx0ICovXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdC8qKlxuXHQgKiBMb2NhdGlvbiBvZiB0aGUgZGVzaWdudGltZSBpbmZvXG5cdCAqL1xuXHRkZXNpZ250aW1lOiBcInNhcC9mZS9tYWNyb3MvQ29udGFjdC5kZXNpZ250aW1lXCJcbn0pXG5cbi8qKlxuICogUHVibGljIGV4dGVybmFsIGZpZWxkIHJlcHJlc2VudGF0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRhY3QgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBQcmVmaXggYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgaWRQcmVmaXghOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBfZmxleElkITogc3RyaW5nOyAvL25lZWRzIHRvIGJlIGFkZGVkIGluIHYyLCB3YXMgdGhlcmUgXCJpbXBsaWNpdGx5XCIgaW4gdjFcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgQ29udGFjdFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0JFR5cGU6IFtcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFR5cGVcIl0sXG5cdFx0cmVxdWlyZWQ6IHRydWVcblx0fSlcblx0cHVibGljIG1ldGFQYXRoITogVjRDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdCRraW5kOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCJdXG5cdH0pXG5cdHB1YmxpYyBjb250ZXh0UGF0aCE6IFY0Q29udGV4dDtcblxuXHQvKipcblx0ICogUHJvcGVydHkgYWRkZWQgdG8gYXNzb2NpYXRlIHRoZSBsYWJlbCBhbmQgdGhlIGNvbnRhY3Rcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgYXJpYUxhYmVsbGVkQnkhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEJvb2xlYW4gdmlzaWJsZSBwcm9wZXJ0eVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRwdWJsaWMgdmlzaWJsZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmdW5jdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRsZXQgaWQ7XG5cdFx0aWYgKHRoaXMuX2ZsZXhJZCkge1xuXHRcdFx0Ly9pbiBjYXNlIGEgZmxleCBpZCBpcyBnaXZlbiwgdGFrZSB0aGlzIG9uZVxuXHRcdFx0aWQgPSB0aGlzLl9mbGV4SWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vYWx0ZXJuYXRpdmVseSBjaGVjayBmb3IgaWRQcmVmaXggYW5kIGdlbmVyYXRlIGFuIGFwcHJvcHJpYXRlIGlkXG5cdFx0XHRpZCA9IHRoaXMuaWRQcmVmaXggPyBnZW5lcmF0ZShbdGhpcy5pZFByZWZpeCwgXCJGaWVsZC1jb250ZW50XCJdKSA6IHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRjb25zdCBjb252ZXJ0ZWRDb250YWN0ID0gY29udmVydE1ldGFNb2RlbENvbnRleHQodGhpcy5tZXRhUGF0aCk7XG5cdFx0Y29uc3QgbXlEYXRhTW9kZWwgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5tZXRhUGF0aCwgdGhpcy5jb250ZXh0UGF0aCk7XG5cblx0XHRjb25zdCB2YWx1ZSA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjb252ZXJ0ZWRDb250YWN0LmZuLCBnZXRSZWxhdGl2ZVBhdGhzKG15RGF0YU1vZGVsKSk7XG5cdFx0Y29uc3QgZGVsZWdhdGVDb25maWd1cmF0aW9uID0ge1xuXHRcdFx0bmFtZTogXCJzYXAvZmUvbWFjcm9zL2NvbnRhY3QvQ29udGFjdERlbGVnYXRlXCIsXG5cdFx0XHRwYXlsb2FkOiB7XG5cdFx0XHRcdGNvbnRhY3Q6IHRoaXMubWV0YVBhdGguZ2V0UGF0aCgpXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiB4bWxgPG1kYzpGaWVsZFxuXHRcdHhtbG5zOm1kYz1cInNhcC51aS5tZGNcIlxuXHRcdGRlbGVnYXRlPVwie25hbWU6ICdzYXAvdWkvbWRjL29kYXRhL3Y0L0ZpZWxkQmFzZURlbGVnYXRlJ31cIlxuXHRcdCR7dGhpcy5hdHRyKFwiaWRcIiwgaWQpfVxuXHRcdGVkaXRNb2RlPVwiRGlzcGxheVwiXG5cdFx0d2lkdGg9XCIxMDAlXCJcblx0XHQke3RoaXMuYXR0cihcInZpc2libGVcIiwgdGhpcy52aXNpYmxlKX1cblx0XHQke3RoaXMuYXR0cihcInZhbHVlXCIsIHZhbHVlKX1cblx0XHQke3RoaXMuYXR0cihcImFyaWFMYWJlbGxlZEJ5XCIsIHRoaXMuYXJpYUxhYmVsbGVkQnkpfVxuXHQ+XG5cdFx0PG1kYzpmaWVsZEluZm8+XG5cdFx0XHQ8bWRjOkxpbmtcblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZpZWxkUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0XHRlbmFibGVQZXJzb25hbGl6YXRpb249XCJmYWxzZVwiXG5cdFx0XHRcdCR7dGhpcy5hdHRyKFwiZGVsZWdhdGVcIiwgSlNPTi5zdHJpbmdpZnkoZGVsZWdhdGVDb25maWd1cmF0aW9uKSl9XG5cdFx0XHQvPlxuXHRcdDwvbWRjOmZpZWxkSW5mbz5cblx0PC9tZGM6RmllbGQ+XG5cdFx0XHRgO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQTRDcUJBLE9BQU8sV0Fs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