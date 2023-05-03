/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/formatters/KPIFormatter", "sap/fe/core/helpers/BindingToolkit"], function (BuildingBlock, BuildingBlockRuntime, kpiFormatters, BindingToolkit) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var _exports = {};
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var formatResult = BindingToolkit.formatResult;
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
  let KPITag = (
  /**
   * A building block used to display a KPI in the Analytical List Page
   *
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "KPITag",
    namespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "string",
    required: true
  }), _dec5 = blockAttribute({
    type: "boolean",
    required: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(KPITag, _BuildingBlockBase);
    function KPITag() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "kpiModelName", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hasUnit", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    _exports = KPITag;
    var _proto = KPITag.prototype;
    /**
     * Creates a binding expression for a specific property in the KPI model.
     *
     * @param propertyName The property to bind to in the KPI model
     * @returns A binding expression
     */
    _proto.getKpiPropertyExpression = function getKpiPropertyExpression(propertyName) {
      return pathInModel(`/${this.id}/manifest/sap.card/data/json/${propertyName}`, this.kpiModelName);
    }

    /**
     * Creates binding expressions for the KPITag's text and tooltip.
     *
     * @returns Object containing the binding expressions for the text and the tooltip
     */;
    _proto.getBindingExpressions = function getBindingExpressions() {
      const kpiTitle = this.metaPath.getProperty("Title");
      if (!kpiTitle) {
        return {
          text: undefined,
          tooltip: undefined
        };
      }
      const titleExpression = resolveBindingString(kpiTitle);
      return {
        text: formatResult([titleExpression], kpiFormatters.labelFormat),
        tooltip: formatResult([titleExpression, this.getKpiPropertyExpression("mainValueUnscaled"), this.getKpiPropertyExpression("mainUnit"), this.getKpiPropertyExpression("mainCriticality"), String(this.hasUnit)], kpiFormatters.tooltipFormat)
      };
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string
     */;
    _proto.getTemplate = function getTemplate() {
      const {
        text,
        tooltip
      } = this.getBindingExpressions();
      return xml`<m:GenericTag
			id="kpiTag-${this.id}"
			text="${text}"
			design="StatusIconHidden"
			status="${this.getKpiPropertyExpression("mainCriticality")}"
			class="sapUiTinyMarginBegin"
			tooltip="${tooltip}"
			press=".kpiManagement.onKPIPressed(\${$source>},'${this.id}')"
		>
			<m:ObjectNumber
				state="${this.getKpiPropertyExpression("mainCriticality")}"
				emphasized="false"
				number="${this.getKpiPropertyExpression("mainValue")}"
				unit="${this.getKpiPropertyExpression("mainUnit")}"

			/>
		</m:GenericTag>`;
    };
    return KPITag;
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
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "kpiModelName", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "hasUnit", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = KPITag;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLUElUYWciLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsInJlcXVpcmVkIiwiZ2V0S3BpUHJvcGVydHlFeHByZXNzaW9uIiwicHJvcGVydHlOYW1lIiwicGF0aEluTW9kZWwiLCJpZCIsImtwaU1vZGVsTmFtZSIsImdldEJpbmRpbmdFeHByZXNzaW9ucyIsImtwaVRpdGxlIiwibWV0YVBhdGgiLCJnZXRQcm9wZXJ0eSIsInRleHQiLCJ1bmRlZmluZWQiLCJ0b29sdGlwIiwidGl0bGVFeHByZXNzaW9uIiwicmVzb2x2ZUJpbmRpbmdTdHJpbmciLCJmb3JtYXRSZXN1bHQiLCJrcGlGb3JtYXR0ZXJzIiwibGFiZWxGb3JtYXQiLCJTdHJpbmciLCJoYXNVbml0IiwidG9vbHRpcEZvcm1hdCIsImdldFRlbXBsYXRlIiwieG1sIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIktQSVRhZy5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tSdW50aW1lXCI7XG5pbXBvcnQga3BpRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9LUElGb3JtYXR0ZXJcIjtcbmltcG9ydCB7IGZvcm1hdFJlc3VsdCwgcGF0aEluTW9kZWwsIHJlc29sdmVCaW5kaW5nU3RyaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbi8qKlxuICogQSBidWlsZGluZyBibG9jayB1c2VkIHRvIGRpc3BsYXkgYSBLUEkgaW4gdGhlIEFuYWx5dGljYWwgTGlzdCBQYWdlXG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIktQSVRhZ1wiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1BJVGFnIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogVGhlIElEIG9mIHRoZSBLUElcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogUGF0aCB0byB0aGUgRGF0YVBvaW50IGFubm90YXRpb24gb2YgdGhlIEtQSVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRwdWJsaWMgbWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBUaGUgbmFtZSBvZiB0aGUgcnVudGltZSBtb2RlbCB0byBnZXQgS1BJIHByb3BlcnRpZXMgZnJvbVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0cHVibGljIGtwaU1vZGVsTmFtZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogU2hhbGwgYmUgdHJ1ZSBpZiB0aGUgS1BJIHZhbHVlIGhhcyBhbiBhc3NvY2lhdGVkIGN1cnJlbmN5IG9yIHVuaXQgb2YgbWVhc3VyZVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIHJlcXVpcmVkOiBmYWxzZSB9KVxuXHRwdWJsaWMgaGFzVW5pdD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIGEgc3BlY2lmaWMgcHJvcGVydHkgaW4gdGhlIEtQSSBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBUaGUgcHJvcGVydHkgdG8gYmluZCB0byBpbiB0aGUgS1BJIG1vZGVsXG5cdCAqIEByZXR1cm5zIEEgYmluZGluZyBleHByZXNzaW9uXG5cdCAqL1xuXHRnZXRLcGlQcm9wZXJ0eUV4cHJlc3Npb24ocHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gcGF0aEluTW9kZWwoYC8ke3RoaXMuaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi8ke3Byb3BlcnR5TmFtZX1gLCB0aGlzLmtwaU1vZGVsTmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBiaW5kaW5nIGV4cHJlc3Npb25zIGZvciB0aGUgS1BJVGFnJ3MgdGV4dCBhbmQgdG9vbHRpcC5cblx0ICpcblx0ICogQHJldHVybnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSB0ZXh0IGFuZCB0aGUgdG9vbHRpcFxuXHQgKi9cblx0Z2V0QmluZGluZ0V4cHJlc3Npb25zKCkge1xuXHRcdGNvbnN0IGtwaVRpdGxlID0gdGhpcy5tZXRhUGF0aC5nZXRQcm9wZXJ0eShcIlRpdGxlXCIpO1xuXG5cdFx0aWYgKCFrcGlUaXRsZSkge1xuXHRcdFx0cmV0dXJuIHsgdGV4dDogdW5kZWZpbmVkLCB0b29sdGlwOiB1bmRlZmluZWQgfTtcblx0XHR9XG5cblx0XHRjb25zdCB0aXRsZUV4cHJlc3Npb24gPSByZXNvbHZlQmluZGluZ1N0cmluZzxzdHJpbmc+KGtwaVRpdGxlKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGV4dDogZm9ybWF0UmVzdWx0KFt0aXRsZUV4cHJlc3Npb25dLCBrcGlGb3JtYXR0ZXJzLmxhYmVsRm9ybWF0KSxcblx0XHRcdHRvb2x0aXA6IGZvcm1hdFJlc3VsdChcblx0XHRcdFx0W1xuXHRcdFx0XHRcdHRpdGxlRXhwcmVzc2lvbixcblx0XHRcdFx0XHR0aGlzLmdldEtwaVByb3BlcnR5RXhwcmVzc2lvbihcIm1haW5WYWx1ZVVuc2NhbGVkXCIpLFxuXHRcdFx0XHRcdHRoaXMuZ2V0S3BpUHJvcGVydHlFeHByZXNzaW9uKFwibWFpblVuaXRcIiksXG5cdFx0XHRcdFx0dGhpcy5nZXRLcGlQcm9wZXJ0eUV4cHJlc3Npb24oXCJtYWluQ3JpdGljYWxpdHlcIiksXG5cdFx0XHRcdFx0U3RyaW5nKHRoaXMuaGFzVW5pdClcblx0XHRcdFx0XSxcblx0XHRcdFx0a3BpRm9ybWF0dGVycy50b29sdGlwRm9ybWF0XG5cdFx0XHQpXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmdcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IHsgdGV4dCwgdG9vbHRpcCB9ID0gdGhpcy5nZXRCaW5kaW5nRXhwcmVzc2lvbnMoKTtcblxuXHRcdHJldHVybiB4bWxgPG06R2VuZXJpY1RhZ1xuXHRcdFx0aWQ9XCJrcGlUYWctJHt0aGlzLmlkfVwiXG5cdFx0XHR0ZXh0PVwiJHt0ZXh0fVwiXG5cdFx0XHRkZXNpZ249XCJTdGF0dXNJY29uSGlkZGVuXCJcblx0XHRcdHN0YXR1cz1cIiR7dGhpcy5nZXRLcGlQcm9wZXJ0eUV4cHJlc3Npb24oXCJtYWluQ3JpdGljYWxpdHlcIil9XCJcblx0XHRcdGNsYXNzPVwic2FwVWlUaW55TWFyZ2luQmVnaW5cIlxuXHRcdFx0dG9vbHRpcD1cIiR7dG9vbHRpcH1cIlxuXHRcdFx0cHJlc3M9XCIua3BpTWFuYWdlbWVudC5vbktQSVByZXNzZWQoXFwkeyRzb3VyY2U+fSwnJHt0aGlzLmlkfScpXCJcblx0XHQ+XG5cdFx0XHQ8bTpPYmplY3ROdW1iZXJcblx0XHRcdFx0c3RhdGU9XCIke3RoaXMuZ2V0S3BpUHJvcGVydHlFeHByZXNzaW9uKFwibWFpbkNyaXRpY2FsaXR5XCIpfVwiXG5cdFx0XHRcdGVtcGhhc2l6ZWQ9XCJmYWxzZVwiXG5cdFx0XHRcdG51bWJlcj1cIiR7dGhpcy5nZXRLcGlQcm9wZXJ0eUV4cHJlc3Npb24oXCJtYWluVmFsdWVcIil9XCJcblx0XHRcdFx0dW5pdD1cIiR7dGhpcy5nZXRLcGlQcm9wZXJ0eUV4cHJlc3Npb24oXCJtYWluVW5pdFwiKX1cIlxuXG5cdFx0XHQvPlxuXHRcdDwvbTpHZW5lcmljVGFnPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQWdCcUJBLE1BQU07RUFWM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsT0FNQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxRQUFRO0lBQ2RDLFNBQVMsRUFBRTtFQUNaLENBQUMsQ0FBQyxVQUtBQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBTWxERixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLHNCQUFzQjtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFNaEVGLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFNbERGLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFQyxRQUFRLEVBQUU7RUFBTSxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUE7SUFHckQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBTEMsT0FNQUMsd0JBQXdCLEdBQXhCLGtDQUF5QkMsWUFBb0IsRUFBRTtNQUM5QyxPQUFPQyxXQUFXLENBQUUsSUFBRyxJQUFJLENBQUNDLEVBQUcsZ0NBQStCRixZQUFhLEVBQUMsRUFBRSxJQUFJLENBQUNHLFlBQVksQ0FBQztJQUNqRzs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUtBQyxxQkFBcUIsR0FBckIsaUNBQXdCO01BQ3ZCLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNDLFFBQVEsQ0FBQ0MsV0FBVyxDQUFDLE9BQU8sQ0FBQztNQUVuRCxJQUFJLENBQUNGLFFBQVEsRUFBRTtRQUNkLE9BQU87VUFBRUcsSUFBSSxFQUFFQyxTQUFTO1VBQUVDLE9BQU8sRUFBRUQ7UUFBVSxDQUFDO01BQy9DO01BRUEsTUFBTUUsZUFBZSxHQUFHQyxvQkFBb0IsQ0FBU1AsUUFBUSxDQUFDO01BQzlELE9BQU87UUFDTkcsSUFBSSxFQUFFSyxZQUFZLENBQUMsQ0FBQ0YsZUFBZSxDQUFDLEVBQUVHLGFBQWEsQ0FBQ0MsV0FBVyxDQUFDO1FBQ2hFTCxPQUFPLEVBQUVHLFlBQVksQ0FDcEIsQ0FDQ0YsZUFBZSxFQUNmLElBQUksQ0FBQ1osd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsRUFDbEQsSUFBSSxDQUFDQSx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsRUFDekMsSUFBSSxDQUFDQSx3QkFBd0IsQ0FBQyxpQkFBaUIsQ0FBQyxFQUNoRGlCLE1BQU0sQ0FBQyxJQUFJLENBQUNDLE9BQU8sQ0FBQyxDQUNwQixFQUNESCxhQUFhLENBQUNJLGFBQWE7TUFFN0IsQ0FBQztJQUNGOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS0FDLFdBQVcsR0FBWCx1QkFBYztNQUNiLE1BQU07UUFBRVgsSUFBSTtRQUFFRTtNQUFRLENBQUMsR0FBRyxJQUFJLENBQUNOLHFCQUFxQixFQUFFO01BRXRELE9BQU9nQixHQUFJO0FBQ2IsZ0JBQWdCLElBQUksQ0FBQ2xCLEVBQUc7QUFDeEIsV0FBV00sSUFBSztBQUNoQjtBQUNBLGFBQWEsSUFBSSxDQUFDVCx3QkFBd0IsQ0FBQyxpQkFBaUIsQ0FBRTtBQUM5RDtBQUNBLGNBQWNXLE9BQVE7QUFDdEIsc0RBQXNELElBQUksQ0FBQ1IsRUFBRztBQUM5RDtBQUNBO0FBQ0EsYUFBYSxJQUFJLENBQUNILHdCQUF3QixDQUFDLGlCQUFpQixDQUFFO0FBQzlEO0FBQ0EsY0FBYyxJQUFJLENBQUNBLHdCQUF3QixDQUFDLFdBQVcsQ0FBRTtBQUN6RCxZQUFZLElBQUksQ0FBQ0Esd0JBQXdCLENBQUMsVUFBVSxDQUFFO0FBQ3REO0FBQ0E7QUFDQSxrQkFBa0I7SUFDakIsQ0FBQztJQUFBO0VBQUEsRUF4RmtDc0IsaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9