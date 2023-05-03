/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/field/FieldHelper"], function (BuildingBlock, BuildingBlockRuntime, BindingToolkit, FieldHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;
  var _exports = {};
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
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
  let Field = (
  /**
   * Public external field representation
   */
  _dec = defineBuildingBlock({
    name: "Field",
    namespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec5 = blockAttribute({
    type: "boolean",
    required: false
  }), _dec6 = blockAttribute({
    type: "string",
    required: false
  }), _dec7 = blockAttribute({
    type: "string",
    required: false
  }), _dec8 = blockAttribute({
    type: "object",
    validate: function (formatOptionsInput) {
      if (formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      if (formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput.measureDisplayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
      }
      if (formatOptionsInput.textExpandBehaviorDisplay && !["InPlace", "Popover"].includes(formatOptionsInput.textExpandBehaviorDisplay)) {
        throw new Error(`Allowed value ${formatOptionsInput.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`);
      }
      return formatOptionsInput;
    }
  }), _dec9 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(Field, _BuildingBlockBase);
    /**
     * The 'id' property
     */

    /**
     * The meta path provided for the field
     */

    /**
     * The context path provided for the field
     */

    /**
     * The readOnly flag
     */

    /**
     * The semantic object associated to the field
     */

    /**
     * The edit mode expression for the field
     */

    /**
     * The object with the formatting options
     */

    /**
     * The generic change event
     */

    function Field(props) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editModeExpression", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "change", _descriptor8, _assertThisInitialized(_this));
      if (_this.readOnly !== undefined) {
        _this.editModeExpression = compileExpression(ifElse(equal(resolveBindingString(_this.readOnly, "boolean"), true), "Display", "Editable"));
      }
      return _this;
    }

    /**
     * Sets the internal formatOptions for the building block.
     *
     * @returns A string with the internal formatOptions for the building block
     */
    _exports = Field;
    var _proto = Field.prototype;
    _proto.getFormatOptions = function getFormatOptions() {
      return xml`
		<internalMacro:formatOptions
			textAlignMode="Form"
			showEmptyIndicator="true"
			displayMode="${this.formatOptions.displayMode}"
			measureDisplayMode="${this.formatOptions.measureDisplayMode}"
			textLinesEdit="${this.formatOptions.textLinesEdit}"
			textMaxLines="${this.formatOptions.textMaxLines}"
			textMaxCharactersDisplay="${this.formatOptions.textMaxCharactersDisplay}"
			textExpandBehaviorDisplay="${this.formatOptions.textExpandBehaviorDisplay}"
			textMaxLength="${this.formatOptions.textMaxLength}"
			>
			${this.writeDateFormatOptions()}
		</internalMacro:formatOptions>
			`;
    };
    _proto.writeDateFormatOptions = function writeDateFormatOptions() {
      if (this.formatOptions.showTime || this.formatOptions.showDate || this.formatOptions.showTimezone) {
        return xml`<internalMacro:dateFormatOptions showTime="${this.formatOptions.showTime}" 
				showDate="${this.formatOptions.showDate}" 
				showTimezone="${this.formatOptions.showTimezone}" 
				/>`;
      }
      return "";
    }

    /**
     * The function calculates the corresponding ValueHelp field in case it´s
     * defined for the specific control.
     *
     * @returns An XML-based string with a possible ValueHelp control.
     */;
    _proto.getPossibleValueHelpTemplate = function getPossibleValueHelpTemplate() {
      const vhp = FieldHelper.valueHelpProperty(this.metaPath);
      const vhpCtx = this.metaPath.getModel().createBindingContext(vhp, this.metaPath);
      const hasValueHelpAnnotations = FieldHelper.hasValueHelpAnnotation(vhpCtx.getObject("@"));
      if (hasValueHelpAnnotations) {
        // depending on whether this one has a value help annotation included, add the dependent
        return xml`
			<internalMacro:dependents>
				<macros:ValueHelp _flexId="${this.id}-content_FieldValueHelp" property="${vhpCtx}" contextPath="${this.contextPath}" />
			</internalMacro:dependents>`;
      }
      return "";
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */;
    _proto.getTemplate = function getTemplate() {
      const contextPathPath = this.contextPath.getPath();
      const metaPathPath = this.metaPath.getPath();
      return xml`
		<internalMacro:Field
			xmlns:internalMacro="sap.fe.macros.internal"
			entitySet="${contextPathPath}"
			dataField="${metaPathPath}"
			editMode="${this.editModeExpression}"
			onChange="${this.change}"
			_flexId="${this.id}"
			semanticObject="${this.semanticObject}"
		>
			${this.getFormatOptions()}
			${this.getPossibleValueHelpTemplate()}
		</internalMacro:Field>`;
    };
    return Field;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "editModeExpression", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "change", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  _exports = Field;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWVsZCIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJyZXF1aXJlZCIsInZhbGlkYXRlIiwiZm9ybWF0T3B0aW9uc0lucHV0IiwiZGlzcGxheU1vZGUiLCJpbmNsdWRlcyIsIkVycm9yIiwibWVhc3VyZURpc3BsYXlNb2RlIiwidGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheSIsImJsb2NrRXZlbnQiLCJwcm9wcyIsInJlYWRPbmx5IiwidW5kZWZpbmVkIiwiZWRpdE1vZGVFeHByZXNzaW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJlcXVhbCIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiZ2V0Rm9ybWF0T3B0aW9ucyIsInhtbCIsImZvcm1hdE9wdGlvbnMiLCJ0ZXh0TGluZXNFZGl0IiwidGV4dE1heExpbmVzIiwidGV4dE1heENoYXJhY3RlcnNEaXNwbGF5IiwidGV4dE1heExlbmd0aCIsIndyaXRlRGF0ZUZvcm1hdE9wdGlvbnMiLCJzaG93VGltZSIsInNob3dEYXRlIiwic2hvd1RpbWV6b25lIiwiZ2V0UG9zc2libGVWYWx1ZUhlbHBUZW1wbGF0ZSIsInZocCIsIkZpZWxkSGVscGVyIiwidmFsdWVIZWxwUHJvcGVydHkiLCJtZXRhUGF0aCIsInZocEN0eCIsImdldE1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJoYXNWYWx1ZUhlbHBBbm5vdGF0aW9ucyIsImhhc1ZhbHVlSGVscEFubm90YXRpb24iLCJnZXRPYmplY3QiLCJpZCIsImNvbnRleHRQYXRoIiwiZ2V0VGVtcGxhdGUiLCJjb250ZXh0UGF0aFBhdGgiLCJnZXRQYXRoIiwibWV0YVBhdGhQYXRoIiwiY2hhbmdlIiwic2VtYW50aWNPYmplY3QiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUHVibGljRmllbGQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGJsb2NrRXZlbnQsIEJ1aWxkaW5nQmxvY2tCYXNlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGVxdWFsLCBpZkVsc2UsIHJlc29sdmVCaW5kaW5nU3RyaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgVjRDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG50eXBlIEZpZWxkRm9ybWF0T3B0aW9ucyA9IHtcblx0ZGlzcGxheU1vZGU/OiBzdHJpbmc7XG5cdG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZztcblx0dGV4dExpbmVzRWRpdD86IG51bWJlcjtcblx0dGV4dE1heExpbmVzPzogbnVtYmVyO1xuXHR0ZXh0TWF4Q2hhcmFjdGVyc0Rpc3BsYXk/OiBudW1iZXI7XG5cdHRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXk/OiBzdHJpbmc7XG5cdHRleHRNYXhMZW5ndGg/OiBudW1iZXI7XG5cdHNob3dEYXRlPzogYm9vbGVhbjtcblx0c2hvd1RpbWU/OiBib29sZWFuO1xuXHRzaG93VGltZXpvbmU/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBQdWJsaWMgZXh0ZXJuYWwgZmllbGQgcmVwcmVzZW50YXRpb25cbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkZpZWxkXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWVsZCBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0LyoqXG5cdCAqIFRoZSAnaWQnIHByb3BlcnR5XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSwgcmVxdWlyZWQ6IHRydWUgfSlcblx0cHVibGljIGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgbWV0YSBwYXRoIHByb3ZpZGVkIGZvciB0aGUgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlXG5cdH0pXG5cdHB1YmxpYyBtZXRhUGF0aCE6IFY0Q29udGV4dDtcblxuXHQvKipcblx0ICogVGhlIGNvbnRleHQgcGF0aCBwcm92aWRlZCBmb3IgdGhlIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRwdWJsaWMgY29udGV4dFBhdGghOiBWNENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIFRoZSByZWFkT25seSBmbGFnXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiwgcmVxdWlyZWQ6IGZhbHNlIH0pXG5cdHB1YmxpYyByZWFkT25seT86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBzZW1hbnRpYyBvYmplY3QgYXNzb2NpYXRlZCB0byB0aGUgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRyZXF1aXJlZDogZmFsc2Vcblx0fSlcblx0cHVibGljIHNlbWFudGljT2JqZWN0Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgZWRpdCBtb2RlIGV4cHJlc3Npb24gZm9yIHRoZSBmaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiBmYWxzZVxuXHR9KVxuXHRwdWJsaWMgZWRpdE1vZGVFeHByZXNzaW9uPztcblxuXHQvKipcblx0ICogVGhlIG9iamVjdCB3aXRoIHRoZSBmb3JtYXR0aW5nIG9wdGlvbnNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJvYmplY3RcIixcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKGZvcm1hdE9wdGlvbnNJbnB1dDogRmllbGRGb3JtYXRPcHRpb25zKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnNJbnB1dC5kaXNwbGF5TW9kZSAmJlxuXHRcdFx0XHQhW1wiVmFsdWVcIiwgXCJEZXNjcmlwdGlvblwiLCBcIlZhbHVlRGVzY3JpcHRpb25cIiwgXCJEZXNjcmlwdGlvblZhbHVlXCJdLmluY2x1ZGVzKGZvcm1hdE9wdGlvbnNJbnB1dC5kaXNwbGF5TW9kZSlcblx0XHRcdCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQuZGlzcGxheU1vZGV9IGZvciBkaXNwbGF5TW9kZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0Lm1lYXN1cmVEaXNwbGF5TW9kZSAmJiAhW1wiSGlkZGVuXCIsIFwiUmVhZE9ubHlcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0Lm1lYXN1cmVEaXNwbGF5TW9kZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0Lm1lYXN1cmVEaXNwbGF5TW9kZX0gZm9yIG1lYXN1cmVEaXNwbGF5TW9kZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnNJbnB1dC50ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5ICYmXG5cdFx0XHRcdCFbXCJJblBsYWNlXCIsIFwiUG9wb3ZlclwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQudGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheSlcblx0XHRcdCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0YEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQudGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheX0gZm9yIHRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXkgZG9lcyBub3QgbWF0Y2hgXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zSW5wdXQ7XG5cdFx0fVxuXHR9KVxuXHRwdWJsaWMgZm9ybWF0T3B0aW9uczogRmllbGRGb3JtYXRPcHRpb25zID0ge307XG5cblx0LyoqXG5cdCAqIFRoZSBnZW5lcmljIGNoYW5nZSBldmVudFxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRjaGFuZ2UgPSBcIlwiO1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8RmllbGQ+KSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXG5cdFx0aWYgKHRoaXMucmVhZE9ubHkgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5lZGl0TW9kZUV4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0aWZFbHNlKGVxdWFsKHJlc29sdmVCaW5kaW5nU3RyaW5nKHRoaXMucmVhZE9ubHksIFwiYm9vbGVhblwiKSwgdHJ1ZSksIFwiRGlzcGxheVwiLCBcIkVkaXRhYmxlXCIpXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBpbnRlcm5hbCBmb3JtYXRPcHRpb25zIGZvciB0aGUgYnVpbGRpbmcgYmxvY2suXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgc3RyaW5nIHdpdGggdGhlIGludGVybmFsIGZvcm1hdE9wdGlvbnMgZm9yIHRoZSBidWlsZGluZyBibG9ja1xuXHQgKi9cblx0Z2V0Rm9ybWF0T3B0aW9ucygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB4bWxgXG5cdFx0PGludGVybmFsTWFjcm86Zm9ybWF0T3B0aW9uc1xuXHRcdFx0dGV4dEFsaWduTW9kZT1cIkZvcm1cIlxuXHRcdFx0c2hvd0VtcHR5SW5kaWNhdG9yPVwidHJ1ZVwiXG5cdFx0XHRkaXNwbGF5TW9kZT1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLmRpc3BsYXlNb2RlfVwiXG5cdFx0XHRtZWFzdXJlRGlzcGxheU1vZGU9XCIke3RoaXMuZm9ybWF0T3B0aW9ucy5tZWFzdXJlRGlzcGxheU1vZGV9XCJcblx0XHRcdHRleHRMaW5lc0VkaXQ9XCIke3RoaXMuZm9ybWF0T3B0aW9ucy50ZXh0TGluZXNFZGl0fVwiXG5cdFx0XHR0ZXh0TWF4TGluZXM9XCIke3RoaXMuZm9ybWF0T3B0aW9ucy50ZXh0TWF4TGluZXN9XCJcblx0XHRcdHRleHRNYXhDaGFyYWN0ZXJzRGlzcGxheT1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLnRleHRNYXhDaGFyYWN0ZXJzRGlzcGxheX1cIlxuXHRcdFx0dGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheT1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLnRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXl9XCJcblx0XHRcdHRleHRNYXhMZW5ndGg9XCIke3RoaXMuZm9ybWF0T3B0aW9ucy50ZXh0TWF4TGVuZ3RofVwiXG5cdFx0XHQ+XG5cdFx0XHQke3RoaXMud3JpdGVEYXRlRm9ybWF0T3B0aW9ucygpfVxuXHRcdDwvaW50ZXJuYWxNYWNybzpmb3JtYXRPcHRpb25zPlxuXHRcdFx0YDtcblx0fVxuXG5cdHdyaXRlRGF0ZUZvcm1hdE9wdGlvbnMoKTogc3RyaW5nIHtcblx0XHRpZiAodGhpcy5mb3JtYXRPcHRpb25zLnNob3dUaW1lIHx8IHRoaXMuZm9ybWF0T3B0aW9ucy5zaG93RGF0ZSB8fCB0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd1RpbWV6b25lKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxpbnRlcm5hbE1hY3JvOmRhdGVGb3JtYXRPcHRpb25zIHNob3dUaW1lPVwiJHt0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd1RpbWV9XCIgXG5cdFx0XHRcdHNob3dEYXRlPVwiJHt0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd0RhdGV9XCIgXG5cdFx0XHRcdHNob3dUaW1lem9uZT1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLnNob3dUaW1lem9uZX1cIiBcblx0XHRcdFx0Lz5gO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZnVuY3Rpb24gY2FsY3VsYXRlcyB0aGUgY29ycmVzcG9uZGluZyBWYWx1ZUhlbHAgZmllbGQgaW4gY2FzZSBpdMK0c1xuXHQgKiBkZWZpbmVkIGZvciB0aGUgc3BlY2lmaWMgY29udHJvbC5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIGEgcG9zc2libGUgVmFsdWVIZWxwIGNvbnRyb2wuXG5cdCAqL1xuXHRnZXRQb3NzaWJsZVZhbHVlSGVscFRlbXBsYXRlKCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgdmhwID0gRmllbGRIZWxwZXIudmFsdWVIZWxwUHJvcGVydHkodGhpcy5tZXRhUGF0aCk7XG5cdFx0Y29uc3QgdmhwQ3R4ID0gdGhpcy5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHZocCwgdGhpcy5tZXRhUGF0aCk7XG5cdFx0Y29uc3QgaGFzVmFsdWVIZWxwQW5ub3RhdGlvbnMgPSBGaWVsZEhlbHBlci5oYXNWYWx1ZUhlbHBBbm5vdGF0aW9uKHZocEN0eC5nZXRPYmplY3QoXCJAXCIpKTtcblx0XHRpZiAoaGFzVmFsdWVIZWxwQW5ub3RhdGlvbnMpIHtcblx0XHRcdC8vIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoaXMgb25lIGhhcyBhIHZhbHVlIGhlbHAgYW5ub3RhdGlvbiBpbmNsdWRlZCwgYWRkIHRoZSBkZXBlbmRlbnRcblx0XHRcdHJldHVybiB4bWxgXG5cdFx0XHQ8aW50ZXJuYWxNYWNybzpkZXBlbmRlbnRzPlxuXHRcdFx0XHQ8bWFjcm9zOlZhbHVlSGVscCBfZmxleElkPVwiJHt0aGlzLmlkfS1jb250ZW50X0ZpZWxkVmFsdWVIZWxwXCIgcHJvcGVydHk9XCIke3ZocEN0eH1cIiBjb250ZXh0UGF0aD1cIiR7dGhpcy5jb250ZXh0UGF0aH1cIiAvPlxuXHRcdFx0PC9pbnRlcm5hbE1hY3JvOmRlcGVuZGVudHM+YDtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHRlbXBsYXRlIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IGNvbnRleHRQYXRoUGF0aCA9IHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IG1ldGFQYXRoUGF0aCA9IHRoaXMubWV0YVBhdGguZ2V0UGF0aCgpO1xuXHRcdHJldHVybiB4bWxgXG5cdFx0PGludGVybmFsTWFjcm86RmllbGRcblx0XHRcdHhtbG5zOmludGVybmFsTWFjcm89XCJzYXAuZmUubWFjcm9zLmludGVybmFsXCJcblx0XHRcdGVudGl0eVNldD1cIiR7Y29udGV4dFBhdGhQYXRofVwiXG5cdFx0XHRkYXRhRmllbGQ9XCIke21ldGFQYXRoUGF0aH1cIlxuXHRcdFx0ZWRpdE1vZGU9XCIke3RoaXMuZWRpdE1vZGVFeHByZXNzaW9ufVwiXG5cdFx0XHRvbkNoYW5nZT1cIiR7dGhpcy5jaGFuZ2V9XCJcblx0XHRcdF9mbGV4SWQ9XCIke3RoaXMuaWR9XCJcblx0XHRcdHNlbWFudGljT2JqZWN0PVwiJHt0aGlzLnNlbWFudGljT2JqZWN0fVwiXG5cdFx0PlxuXHRcdFx0JHt0aGlzLmdldEZvcm1hdE9wdGlvbnMoKX1cblx0XHRcdCR7dGhpcy5nZXRQb3NzaWJsZVZhbHVlSGVscFRlbXBsYXRlKCl9XG5cdFx0PC9pbnRlcm5hbE1hY3JvOkZpZWxkPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BMkJxQkEsS0FBSztFQVAxQjtBQUNBO0FBQ0E7RUFGQSxPQUdDQyxtQkFBbUIsQ0FBQztJQUNwQkMsSUFBSSxFQUFFLE9BQU87SUFDYkMsU0FBUyxFQUFFO0VBQ1osQ0FBQyxDQUFDLFVBS0FDLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxRQUFRLEVBQUUsSUFBSTtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFNbEVILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCRSxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREgsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxzQkFBc0I7SUFDNUJFLFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQU1ESCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUUsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBTXBESCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLFFBQVE7SUFDZEUsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBTURILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsUUFBUTtJQUNkRSxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREgsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxRQUFRO0lBQ2RHLFFBQVEsRUFBRSxVQUFVQyxrQkFBc0MsRUFBRTtNQUMzRCxJQUNDQSxrQkFBa0IsQ0FBQ0MsV0FBVyxJQUM5QixDQUFDLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQyxD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R0FBRyxHQUFHQyxXQUFXLENBQUNDLGlCQUFpQixDQUFDLElBQUksQ0FBQ0MsUUFBUSxDQUFDO01BQ3hELE1BQU1DLE1BQU0sR0FBRyxJQUFJLENBQUNELFFBQVEsQ0FBQ0UsUUFBUSxFQUFFLENBQUNDLG9CQUFvQixDQUFDTixHQUFHLEVBQUUsSUFBSSxDQUFDRyxRQUFRLENBQUM7TUFDaEYsTUFBTUksdUJBQXVCLEdBQUdOLFdBQVcsQ0FBQ08sc0JBQXNCLENBQUNKLE1BQU0sQ0FBQ0ssU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQ3pGLElBQUlGLHVCQUF1QixFQUFFO1FBQzVCO1FBQ0EsT0FBT2xCLEdBQUk7QUFDZDtBQUNBLGlDQUFpQyxJQUFJLENBQUNxQixFQUFHLHNDQUFxQ04sTUFBTyxrQkFBaUIsSUFBSSxDQUFDTyxXQUFZO0FBQ3ZILCtCQUErQjtNQUM3QjtNQUNBLE9BQU8sRUFBRTtJQUNWOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS0FDLFdBQVcsR0FBWCx1QkFBYztNQUNiLE1BQU1DLGVBQWUsR0FBRyxJQUFJLENBQUNGLFdBQVcsQ0FBQ0csT0FBTyxFQUFFO01BQ2xELE1BQU1DLFlBQVksR0FBRyxJQUFJLENBQUNaLFFBQVEsQ0FBQ1csT0FBTyxFQUFFO01BQzVDLE9BQU96QixHQUFJO0FBQ2I7QUFDQTtBQUNBLGdCQUFnQndCLGVBQWdCO0FBQ2hDLGdCQUFnQkUsWUFBYTtBQUM3QixlQUFlLElBQUksQ0FBQ2hDLGtCQUFtQjtBQUN2QyxlQUFlLElBQUksQ0FBQ2lDLE1BQU87QUFDM0IsY0FBYyxJQUFJLENBQUNOLEVBQUc7QUFDdEIscUJBQXFCLElBQUksQ0FBQ08sY0FBZTtBQUN6QztBQUNBLEtBQUssSUFBSSxDQUFDN0IsZ0JBQWdCLEVBQUc7QUFDN0IsS0FBSyxJQUFJLENBQUNXLDRCQUE0QixFQUFHO0FBQ3pDLHlCQUF5QjtJQUN4QixDQUFDO0lBQUE7RUFBQSxFQTFLaUNtQixpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BOEVSLENBQUMsQ0FBQztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BTXBDLEVBQUU7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=