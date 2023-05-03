/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/chart/ChartRuntime", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/MacroAPI"], function (merge, ClassSupport, ChartRuntime, FilterUtils, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block used to create a chart based on the metadata provided by OData V4.
   * <br>
   * Usually, a contextPath and metaPath is expected.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Chart id="Mychart" contextPath="/RootEntity" metaPath="@com.sap.vocabularies.UI.v1.Chart" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Chart
   * @public
   */
  let ChartAPI = (_dec = defineUI5Class("sap.fe.macros.chart.ChartAPI"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string",
    required: true,
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"]
  }), _dec4 = property({
    type: "string",
    required: true,
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: []
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "string",
    defaultValue: "MULTIPLE"
  }), _dec8 = property({
    type: "string"
  }), _dec9 = property({
    type: "string"
  }), _dec10 = property({
    type: "boolean|string"
  }), _dec11 = aggregation({
    type: "sap.fe.macros.chart.Action"
  }), _dec12 = event(), _dec13 = event(), _dec14 = event(), _dec15 = xmlEventHandler(), _dec16 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(ChartAPI, _MacroAPI);
    function ChartAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalDataRequested", _descriptor13, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = ChartAPI.prototype;
    /**
     * Gets contexts from the chart that have been selected by the user.
     *
     * @returns Contexts of the rows selected by the user
     * @public
     */
    _proto.getSelectedContexts = function getSelectedContexts() {
      var _this$content, _this$content$getBind;
      return ((_this$content = this.content) === null || _this$content === void 0 ? void 0 : (_this$content$getBind = _this$content.getBindingContext("internal")) === null || _this$content$getBind === void 0 ? void 0 : _this$content$getBind.getProperty("selectedContexts")) || [];
    }

    /**
     * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and the Boolean flag that indicates whether data is selected or deselected.
     *
     * @public
     */;
    _proto.onAfterRendering = function onAfterRendering() {
      const view = this.getController().getView();
      const internalModelContext = view.getBindingContext("internal");
      const chart = this.getContent();
      const showMessageStrip = {};
      const sChartEntityPath = chart.data("entitySet"),
        sCacheKey = `${sChartEntityPath}Chart`,
        oBindingContext = view.getBindingContext();
      showMessageStrip[sCacheKey] = chart.data("draftSupported") === "true" && !!oBindingContext && !oBindingContext.getObject("IsActiveEntity");
      internalModelContext.setProperty("controls/showMessageStrip", showMessageStrip);
    };
    _proto.refreshNotApplicableFields = function refreshNotApplicableFields(oFilterControl) {
      const oChart = this.getContent();
      return FilterUtils.getNotApplicableFilters(oFilterControl, oChart);
    };
    _proto.handleSelectionChange = function handleSelectionChange(oEvent) {
      const aData = oEvent.getParameter("data");
      const bSelected = oEvent.getParameter("name") === "selectData";
      ChartRuntime.fnUpdateChart(oEvent);
      this.fireSelectionChange(merge({}, {
        data: aData,
        selected: bSelected
      }));
    };
    _proto.onInternalDataRequested = function onInternalDataRequested() {
      this.fireEvent("internalDataRequested");
    };
    return ChartAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "internalDataRequested", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleSelectionChange", [_dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "handleSelectionChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataRequested", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataRequested"), _class2.prototype)), _class2)) || _class);
  return ChartAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFydEFQSSIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwiZXhwZWN0ZWRBbm5vdGF0aW9ucyIsImRlZmF1bHRWYWx1ZSIsImFnZ3JlZ2F0aW9uIiwiZXZlbnQiLCJ4bWxFdmVudEhhbmRsZXIiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwiY29udGVudCIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0UHJvcGVydHkiLCJvbkFmdGVyUmVuZGVyaW5nIiwidmlldyIsImdldENvbnRyb2xsZXIiLCJnZXRWaWV3IiwiaW50ZXJuYWxNb2RlbENvbnRleHQiLCJjaGFydCIsImdldENvbnRlbnQiLCJzaG93TWVzc2FnZVN0cmlwIiwic0NoYXJ0RW50aXR5UGF0aCIsImRhdGEiLCJzQ2FjaGVLZXkiLCJvQmluZGluZ0NvbnRleHQiLCJnZXRPYmplY3QiLCJzZXRQcm9wZXJ0eSIsInJlZnJlc2hOb3RBcHBsaWNhYmxlRmllbGRzIiwib0ZpbHRlckNvbnRyb2wiLCJvQ2hhcnQiLCJGaWx0ZXJVdGlscyIsImdldE5vdEFwcGxpY2FibGVGaWx0ZXJzIiwiaGFuZGxlU2VsZWN0aW9uQ2hhbmdlIiwib0V2ZW50IiwiYURhdGEiLCJnZXRQYXJhbWV0ZXIiLCJiU2VsZWN0ZWQiLCJDaGFydFJ1bnRpbWUiLCJmblVwZGF0ZUNoYXJ0IiwiZmlyZVNlbGVjdGlvbkNoYW5nZSIsIm1lcmdlIiwic2VsZWN0ZWQiLCJvbkludGVybmFsRGF0YVJlcXVlc3RlZCIsImZpcmVFdmVudCIsIk1hY3JvQVBJIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDaGFydEFQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWVyZ2UgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIHByb3BlcnR5LCB4bWxFdmVudEhhbmRsZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDaGFydFJ1bnRpbWUgZnJvbSBcInNhcC9mZS9tYWNyb3MvY2hhcnQvQ2hhcnRSdW50aW1lXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgTWFjcm9BUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9BUElcIjtcbmltcG9ydCBVSTVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxuLyoqXG4gKiBEZWZpbml0aW9uIG9mIGEgY3VzdG9tIGFjdGlvbiB0byBiZSB1c2VkIGluc2lkZSB0aGUgY2hhcnQgdG9vbGJhclxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLmNoYXJ0LkFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgdHlwZSBBY3Rpb24gPSB7XG5cdC8qKlxuXHQgKiBVbmlxdWUgaWRlbnRpZmllciBvZiB0aGUgYWN0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGtleTogc3RyaW5nO1xuXHQvKipcblx0ICogVGhlIHRleHQgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBmb3IgdGhpcyBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0dGV4dDogc3RyaW5nO1xuXHQvKipcblx0ICogUmVmZXJlbmNlIHRvIHRoZSBrZXkgb2YgYW5vdGhlciBhY3Rpb24gYWxyZWFkeSBkaXNwbGF5ZWQgaW4gdGhlIHRvb2xiYXIgdG8gcHJvcGVybHkgcGxhY2UgdGhpcyBvbmVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YW5jaG9yPzogc3RyaW5nO1xuXHQvKipcblx0ICogRGVmaW5lcyB3aGVyZSB0aGlzIGFjdGlvbiBzaG91bGQgYmUgcGxhY2VkIHJlbGF0aXZlIHRvIHRoZSBkZWZpbmVkIGFuY2hvclxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYEJlZm9yZWAgYW5kIGBBZnRlcmBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cGxhY2VtZW50Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIGlmIHRoZSBhY3Rpb24gcmVxdWlyZXMgYSBzZWxlY3Rpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlcXVpcmVzU2VsZWN0aW9uPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgdXNlciBjaG9vc2VzIHRoZSBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cHJlc3M6IHN0cmluZztcblxuXHQvKipcblx0ICogRW5hYmxlcyBvciBkaXNhYmxlcyB0aGUgYWN0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGVuYWJsZWQ/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBEZWZpbml0aW9uIG9mIGEgY3VzdG9tIGFjdGlvbiBncm91cCB0byBiZSB1c2VkIGluc2lkZSB0aGUgY2hhcnQgdG9vbGJhclxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLmNoYXJ0LkFjdGlvbkdyb3VwXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGlvbkdyb3VwID0ge1xuXHQvKipcblx0ICogVW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGFjdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRrZXk6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyBuZXN0ZWQgYWN0aW9uc1xuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhY3Rpb25zOiBBY3Rpb25bXTtcblxuXHQvKipcblx0ICogVGhlIHRleHQgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBmb3IgdGhpcyBhY3Rpb24gZ3JvdXBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0dGV4dDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXJlIHRoaXMgYWN0aW9uIGdyb3VwIHNob3VsZCBiZSBwbGFjZWQgcmVsYXRpdmUgdG8gdGhlIGRlZmluZWQgYW5jaG9yXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgQmVmb3JlYCBhbmQgYEFmdGVyYFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRwbGFjZW1lbnQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byB0aGUga2V5IG9mIGFub3RoZXIgYWN0aW9uIG9yIGFjdGlvbiBncm91cCBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgdG9vbGJhciB0byBwcm9wZXJseSBwbGFjZSB0aGlzIG9uZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhbmNob3I/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIHVzZWQgdG8gY3JlYXRlIGEgY2hhcnQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogVXN1YWxseSwgYSBjb250ZXh0UGF0aCBhbmQgbWV0YVBhdGggaXMgZXhwZWN0ZWQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkNoYXJ0IGlkPVwiTXljaGFydFwiIGNvbnRleHRQYXRoPVwiL1Jvb3RFbnRpdHlcIiBtZXRhUGF0aD1cIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5DaGFydFxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLmNoYXJ0LkNoYXJ0QVBJXCIpXG5jbGFzcyBDaGFydEFQSSBleHRlbmRzIE1hY3JvQVBJIHtcblx0LyoqXG5cdCAqXG5cdCAqIElEIG9mIHRoZSBjaGFydFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBwcmVzZW50YXRpb24gKFVJLkNoYXJ0IHcgb3Igdy9vIHF1YWxpZmllcilcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl0sXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uczogW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIl1cblx0fSlcblx0bWV0YVBhdGghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGVudGl0eVNldCBvciBuYXZpZ2F0aW9uUHJvcGVydHlcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl0sXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uczogW11cblx0fSlcblx0Y29udGV4dFBhdGghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgaGVhZGVyIHRleHQgdGhhdCBpcyBzaG93biBpbiB0aGUgY2hhcnRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRoZWFkZXIhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIGlmIHRoZSBoZWFkZXIgdGV4dCBzaG91bGQgYmUgc2hvd24gb3Igbm90XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0aGVhZGVyVmlzaWJsZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgc2VsZWN0aW9uIG1vZGVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcIk1VTFRJUExFXCIgfSlcblx0c2VsZWN0aW9uTW9kZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogSWQgb2YgdGhlIEZpbHRlckJhciBidWlsZGluZyBibG9jayBhc3NvY2lhdGVkIHdpdGggdGhlIGNoYXJ0LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlckJhciE6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhpcyBpcyB0aGUgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHZhcmlhbnQgbWFuYWdlbWVudCBmb3IgY2hhcnRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR2YXJpYW50TWFuYWdlbWVudCE6IHN0cmluZztcblxuXHQvKipcblx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIHBlcnNvbmFsaXphdGlvbiBvZiB0aGUgTURDX0NoYXJ0XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhbnxzdHJpbmdcIiB9KVxuXHRwZXJzb25hbGl6YXRpb24hOiBib29sZWFuIHwgc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBBZ2dyZWdhdGUgYWN0aW9ucyBvZiB0aGUgY2hhcnQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5jaGFydC5BY3Rpb25cIiB9KVxuXHRhY3Rpb25zITogQWN0aW9uW107XG5cblx0LyoqXG5cdCAqIEdldHMgY29udGV4dHMgZnJvbSB0aGUgY2hhcnQgdGhhdCBoYXZlIGJlZW4gc2VsZWN0ZWQgYnkgdGhlIHVzZXIuXG5cdCAqXG5cdCAqIEByZXR1cm5zIENvbnRleHRzIG9mIHRoZSByb3dzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldFNlbGVjdGVkQ29udGV4dHMoKTogQ29udGV4dFtdIHtcblx0XHRyZXR1cm4gdGhpcy5jb250ZW50Py5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpPy5nZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIikgfHwgW107XG5cdH1cblxuXHQvKipcblx0ICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gY2hhcnQgc2VsZWN0aW9ucyBhcmUgY2hhbmdlZC4gVGhlIGV2ZW50IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBkYXRhIHNlbGVjdGVkL2Rlc2VsZWN0ZWQgYW5kIHRoZSBCb29sZWFuIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBkYXRhIGlzIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBldmVudCgpXG5cdHNlbGVjdGlvbkNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiB0aGUgY2hhcnQgc3RhdGUgY2hhbmdlcy5cblx0ICpcblx0ICogWW91IGNhbiBzZXQgdGhpcyBpbiBvcmRlciB0byBzdG9yZSB0aGUgY2hhcnQgc3RhdGUgaW4gdGhlIGlBcHBzdGF0ZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBldmVudCgpXG5cdHN0YXRlQ2hhbmdlITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIHRoZSBjaGFydCByZXF1ZXN0cyBkYXRhLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QGV2ZW50KClcblx0aW50ZXJuYWxEYXRhUmVxdWVzdGVkITogRnVuY3Rpb247XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5nZXRDb250cm9sbGVyKCkuZ2V0VmlldygpO1xuXHRcdGNvbnN0IGludGVybmFsTW9kZWxDb250ZXh0OiBhbnkgPSB2aWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0Y29uc3QgY2hhcnQgPSAodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKTtcblx0XHRjb25zdCBzaG93TWVzc2FnZVN0cmlwOiBhbnkgPSB7fTtcblx0XHRjb25zdCBzQ2hhcnRFbnRpdHlQYXRoID0gY2hhcnQuZGF0YShcImVudGl0eVNldFwiKSxcblx0XHRcdHNDYWNoZUtleSA9IGAke3NDaGFydEVudGl0eVBhdGh9Q2hhcnRgLFxuXHRcdFx0b0JpbmRpbmdDb250ZXh0ID0gdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdHNob3dNZXNzYWdlU3RyaXBbc0NhY2hlS2V5XSA9XG5cdFx0XHRjaGFydC5kYXRhKFwiZHJhZnRTdXBwb3J0ZWRcIikgPT09IFwidHJ1ZVwiICYmICEhb0JpbmRpbmdDb250ZXh0ICYmICFvQmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KFwiSXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0aW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJjb250cm9scy9zaG93TWVzc2FnZVN0cmlwXCIsIHNob3dNZXNzYWdlU3RyaXApO1xuXHR9XG5cblx0cmVmcmVzaE5vdEFwcGxpY2FibGVGaWVsZHMob0ZpbHRlckNvbnRyb2w6IENvbnRyb2wpOiBhbnlbXSB7XG5cdFx0Y29uc3Qgb0NoYXJ0ID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cdFx0cmV0dXJuIEZpbHRlclV0aWxzLmdldE5vdEFwcGxpY2FibGVGaWx0ZXJzKG9GaWx0ZXJDb250cm9sLCBvQ2hhcnQpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdGhhbmRsZVNlbGVjdGlvbkNoYW5nZShvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0Y29uc3QgYURhdGEgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiZGF0YVwiKTtcblx0XHRjb25zdCBiU2VsZWN0ZWQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwibmFtZVwiKSA9PT0gXCJzZWxlY3REYXRhXCI7XG5cdFx0Q2hhcnRSdW50aW1lLmZuVXBkYXRlQ2hhcnQob0V2ZW50KTtcblx0XHQodGhpcyBhcyBhbnkpLmZpcmVTZWxlY3Rpb25DaGFuZ2UobWVyZ2Uoe30sIHsgZGF0YTogYURhdGEsIHNlbGVjdGVkOiBiU2VsZWN0ZWQgfSkpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkKCkge1xuXHRcdCh0aGlzIGFzIGFueSkuZmlyZUV2ZW50KFwiaW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENoYXJ0QVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBOEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFiQSxJQWVNQSxRQUFRLFdBRGJDLGNBQWMsQ0FBQyw4QkFBOEIsQ0FBQyxVQVE3Q0MsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQVE1QkQsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxRQUFRO0lBQ2RDLFFBQVEsRUFBRSxJQUFJO0lBQ2RDLGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FB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