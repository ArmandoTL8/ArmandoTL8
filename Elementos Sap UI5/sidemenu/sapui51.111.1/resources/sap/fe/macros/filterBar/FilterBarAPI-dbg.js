/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/filter/FilterUtils", "../MacroAPI"], function (merge, ClassSupport, FilterUtils, MacroAPI) {
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
   * Building block for creating a FilterBar based on the metadata provided by OData V4.
   * <br>
   * Usually, a SelectionFields annotation is expected.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:FilterBar id="MyFilterBar" metaPath="@com.sap.vocabularies.UI.v1.SelectionFields" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.FilterBar
   * @public
   */
  let FilterBarAPI = (_dec = defineUI5Class("sap.fe.macros.filterBar.FilterBarAPI"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string",
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.SelectionFields"],
    expectedTypes: ["EntitySet", "EntityType"]
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "boolean",
    defaultValue: true
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "boolean",
    defaultValue: false
  }), _dec8 = aggregation({
    type: "sap.fe.macros.FilterField",
    multiple: true
  }), _dec9 = event(), _dec10 = event(), _dec11 = event(), _dec12 = event(), _dec13 = event(), _dec14 = event(), _dec15 = xmlEventHandler(), _dec16 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(FilterBarAPI, _MacroAPI);
    function FilterBarAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showMessages", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showClearButton", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterFields", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalSearch", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterChanged", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterClear", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalFilterChanged", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor13, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FilterBarAPI.prototype;
    _proto.handleSearch = function handleSearch(oEvent) {
      const oFilterBar = oEvent.getSource();
      const oEventParameters = oEvent.getParameters();
      if (oFilterBar) {
        const oConditions = oFilterBar.getFilterConditions();
        const eventParameters = this._prepareEventParameters(oFilterBar);
        this.fireInternalSearch(merge({
          conditions: oConditions
        }, oEventParameters));
        this.fireSearch(eventParameters);
      }
    };
    _proto.handleFilterChanged = function handleFilterChanged(oEvent) {
      const oFilterBar = oEvent.getSource();
      const oEventParameters = oEvent.getParameters();
      if (oFilterBar) {
        const oConditions = oFilterBar.getFilterConditions();
        const eventParameters = this._prepareEventParameters(oFilterBar);
        this.fireInternalFilterChanged(merge({
          conditions: oConditions
        }, oEventParameters));
        this.fireFilterChanged(eventParameters);
      }
    };
    _proto._prepareEventParameters = function _prepareEventParameters(oFilterBar) {
      const {
        filters,
        search
      } = FilterUtils.getFilters(oFilterBar);
      return {
        filters,
        search
      };
    }

    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param sConditionPath The path to the property as a condition path
     * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @param vValues The values to be applied
     * @returns A promise for asynchronous handling
     * @public
     */;
    _proto.setFilterValues = function setFilterValues(sConditionPath, sOperator, vValues) {
      if (arguments.length === 2) {
        vValues = sOperator;
        return FilterUtils.setFilterValues(this.content, sConditionPath, vValues);
      }
      return FilterUtils.setFilterValues(this.content, sConditionPath, sOperator, vValues);
    }

    /**
     * Get the Active Filters Text Summary for the filter bar.
     *
     * @returns Active filters summary as text
     * @public
     */;
    _proto.getActiveFiltersText = function getActiveFiltersText() {
      var _oFilterBar$getAssign;
      const oFilterBar = this.content;
      return (oFilterBar === null || oFilterBar === void 0 ? void 0 : (_oFilterBar$getAssign = oFilterBar.getAssignedFiltersText()) === null || _oFilterBar$getAssign === void 0 ? void 0 : _oFilterBar$getAssign.filtersText) || "";
    }

    /**
     * Provides all the filters that are currently active
     * along with the search expression.
     *
     * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
     * @public
     */;
    _proto.getFilters = function getFilters() {
      return FilterUtils.getFilters(this.content);
    };
    return FilterBarAPI;
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
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "showMessages", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showClearButton", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "filterFields", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "internalSearch", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "afterClear", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "internalFilterChanged", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleSearch", [_dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "handleSearch"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFilterChanged", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFilterChanged"), _class2.prototype)), _class2)) || _class);
  return FilterBarAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJCYXJBUEkiLCJkZWZpbmVVSTVDbGFzcyIsInByb3BlcnR5IiwidHlwZSIsImV4cGVjdGVkQW5ub3RhdGlvbnMiLCJleHBlY3RlZFR5cGVzIiwiZGVmYXVsdFZhbHVlIiwiYWdncmVnYXRpb24iLCJtdWx0aXBsZSIsImV2ZW50IiwieG1sRXZlbnRIYW5kbGVyIiwiaGFuZGxlU2VhcmNoIiwib0V2ZW50Iiwib0ZpbHRlckJhciIsImdldFNvdXJjZSIsIm9FdmVudFBhcmFtZXRlcnMiLCJnZXRQYXJhbWV0ZXJzIiwib0NvbmRpdGlvbnMiLCJnZXRGaWx0ZXJDb25kaXRpb25zIiwiZXZlbnRQYXJhbWV0ZXJzIiwiX3ByZXBhcmVFdmVudFBhcmFtZXRlcnMiLCJmaXJlSW50ZXJuYWxTZWFyY2giLCJtZXJnZSIsImNvbmRpdGlvbnMiLCJmaXJlU2VhcmNoIiwiaGFuZGxlRmlsdGVyQ2hhbmdlZCIsImZpcmVJbnRlcm5hbEZpbHRlckNoYW5nZWQiLCJmaXJlRmlsdGVyQ2hhbmdlZCIsImZpbHRlcnMiLCJzZWFyY2giLCJGaWx0ZXJVdGlscyIsImdldEZpbHRlcnMiLCJzZXRGaWx0ZXJWYWx1ZXMiLCJzQ29uZGl0aW9uUGF0aCIsInNPcGVyYXRvciIsInZWYWx1ZXMiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJjb250ZW50IiwiZ2V0QWN0aXZlRmlsdGVyc1RleHQiLCJnZXRBc3NpZ25lZEZpbHRlcnNUZXh0IiwiZmlsdGVyc1RleHQiLCJNYWNyb0FQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IHsgYWdncmVnYXRpb24sIGRlZmluZVVJNUNsYXNzLCBldmVudCwgcHJvcGVydHksIHhtbEV2ZW50SGFuZGxlciB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgTWFjcm9BUEkgZnJvbSBcIi4uL01hY3JvQVBJXCI7XG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIGN1c3RvbSBmaWx0ZXIgdG8gYmUgdXNlZCBpbnNpZGUgdGhlIEZpbHRlckJhci5cbiAqXG4gKiBUaGUgdGVtcGxhdGUgZm9yIHRoZSBGaWx0ZXJGaWVsZCBoYXMgdG8gYmUgcHJvdmlkZWQgYXMgdGhlIGRlZmF1bHQgYWdncmVnYXRpb25cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5GaWx0ZXJGaWVsZFxuICogQHB1YmxpY1xuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgdHlwZSBGaWx0ZXJGaWVsZCA9IHtcblx0LyoqXG5cdCAqIFRoZSBwcm9wZXJ0eSBuYW1lIG9mIHRoZSBGaWx0ZXJGaWVsZFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRrZXk6IHN0cmluZztcblx0LyoqXG5cdCAqIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgZm9yIHRoaXMgRmlsdGVyRmllbGRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0bGFiZWw6IHN0cmluZztcblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byB0aGUga2V5IG9mIGFub3RoZXIgZmlsdGVyIGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSB0YWJsZSB0byBwcm9wZXJseSBwbGFjZSB0aGlzIG9uZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhbmNob3I/OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXJlIHRoaXMgZmlsdGVyIHNob3VsZCBiZSBwbGFjZWQgcmVsYXRpdmUgdG8gdGhlIGRlZmluZWQgYW5jaG9yXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgQmVmb3JlYCBhbmQgYEFmdGVyYFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRwbGFjZW1lbnQ/OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBJZiBzZXQsIHBvc3NpYmxlIGVycm9ycyB0aGF0IG9jY3VyIGR1cmluZyB0aGUgc2VhcmNoIHdpbGwgYmUgZGlzcGxheWVkIGluIGEgbWVzc2FnZSBib3guXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNob3dNZXNzYWdlcz86IGJvb2xlYW47XG5cblx0c2xvdE5hbWU/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIEZpbHRlckJhciBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiA8YnI+XG4gKiBVc3VhbGx5LCBhIFNlbGVjdGlvbkZpZWxkcyBhbm5vdGF0aW9uIGlzIGV4cGVjdGVkLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpGaWx0ZXJCYXIgaWQ9XCJNeUZpbHRlckJhclwiIG1ldGFQYXRoPVwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5GaWx0ZXJCYXJcbiAqIEBwdWJsaWNcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5maWx0ZXJCYXIuRmlsdGVyQmFyQVBJXCIpXG5jbGFzcyBGaWx0ZXJCYXJBUEkgZXh0ZW5kcyBNYWNyb0FQSSB7XG5cdC8qKlxuXHQgKiBUaGUgaWRlbnRpZmllciBvZiB0aGUgRmlsdGVyQmFyIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0aWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHJlbGF0aXZlIHBhdGggb2YgdGhlIHByb3BlcnR5IGluIHRoZSBtZXRhbW9kZWwsIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbnRleHRQYXRoLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uczogW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCJdLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIl1cblx0fSlcblx0bWV0YVBhdGghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIElmIHRydWUsIHRoZSBzZWFyY2ggaXMgdHJpZ2dlcmVkIGF1dG9tYXRpY2FsbHkgd2hlbiBhIGZpbHRlciB2YWx1ZSBpcyBjaGFuZ2VkLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRsaXZlTW9kZT86IGJvb2xlYW47XG5cdC8qKlxuXHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgRmlsdGVyQmFyIGJ1aWxkaW5nIGJsb2NrXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0dmlzaWJsZT86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIERpc3BsYXlzIHBvc3NpYmxlIGVycm9ycyBkdXJpbmcgdGhlIHNlYXJjaCBpbiBhIG1lc3NhZ2UgYm94XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0c2hvd01lc3NhZ2VzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogSGFuZGxlcyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgJ0NsZWFyJyBidXR0b24gb24gdGhlIEZpbHRlckJhci5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0c2hvd0NsZWFyQnV0dG9uPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQWdncmVnYXRlIGZpbHRlciBmaWVsZHMgb2YgdGhlIEZpbHRlckJhciBidWlsZGluZyBibG9ja1xuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5mZS5tYWNyb3MuRmlsdGVyRmllbGRcIiwgbXVsdGlwbGU6IHRydWUgfSlcblx0ZmlsdGVyRmllbGRzPzogRmlsdGVyRmllbGRbXTtcblxuXHQvKipcblx0ICogVGhpcyBldmVudCBpcyBmaXJlZCB3aGVuIHRoZSAnR28nIGJ1dHRvbiBpcyBwcmVzc2VkIG9yIGFmdGVyIGEgY29uZGl0aW9uIGNoYW5nZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0c2VhcmNoITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIFRoaXMgZXZlbnQgaXMgZmlyZWQgd2hlbiB0aGUgJ0dvJyBidXR0b24gaXMgcHJlc3NlZCBvciBhZnRlciBhIGNvbmRpdGlvbiBjaGFuZ2UuIFRoaXMgaXMgb25seSBpbnRlcm5hbGx5IHVzZWQgYnkgc2FwLmZlIChGaW9yaSBlbGVtZW50cykgYW5kXG5cdCAqIGV4cG9zZXMgcGFyYW1ldGVycyBmcm9tIGludGVybmFsIE1EQy1GaWx0ZXJCYXIgc2VhcmNoIGV2ZW50XG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRpbnRlcm5hbFNlYXJjaCE6IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBUaGlzIGV2ZW50IGlzIGZpcmVkIGFmdGVyIGVpdGhlciBhIGZpbHRlciB2YWx1ZSBvciB0aGUgdmlzaWJpbGl0eSBvZiBhIGZpbHRlciBpdGVtIGhhcyBiZWVuIGNoYW5nZWQuIFRoZSBldmVudCBjb250YWlucyBjb25kaXRpb25zIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGZpbHRlcnMuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBldmVudCgpXG5cdGZpbHRlckNoYW5nZWQhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogVGhpcyBldmVudCBpcyBmaXJlZCB3aGVuIHRoZSAnQ2xlYXInIGJ1dHRvbiBpcyBwcmVzc2VkLiBUaGlzIGlzIG9ubHkgcG9zc2libGUgd2hlbiB0aGUgJ0NsZWFyJyBidXR0b24gaXMgZW5hYmxlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0YWZ0ZXJDbGVhciE6IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBUaGlzIGV2ZW50IGlzIGZpcmVkIGFmdGVyIGVpdGhlciBhIGZpbHRlciB2YWx1ZSBvciB0aGUgdmlzaWJpbGl0eSBvZiBhIGZpbHRlciBpdGVtIGhhcyBiZWVuIGNoYW5nZWQuIFRoZSBldmVudCBjb250YWlucyBjb25kaXRpb25zIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGZpbHRlcnMuXG5cdCAqIFRoaXMgaXMgdXNlZCBpbnRlcm5hbGx5IG9ubHkgYnkgc2FwLmZlIChGaW9yaSBFbGVtZW50cykuIFRoaXMgZXhwb3NlcyBwYXJhbWV0ZXJzIGZyb20gdGhlIE1EQy1GaWx0ZXJCYXIgZmlsdGVyQ2hhbmdlZCBldmVudCB0aGF0IGlzIHVzZWQgYnkgc2FwLmZlIGluIHNvbWUgY2FzZXMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRpbnRlcm5hbEZpbHRlckNoYW5nZWQhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgdGhhdCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgRmlsdGVyQmFyIFN0YXRlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIFlvdSBjYW4gc2V0IHRoaXMgdG8gc3RvcmUgdGhlIHN0YXRlIG9mIHRoZSBmaWx0ZXIgYmFyIGluIHRoZSBhcHAgc3RhdGUuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRzdGF0ZUNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRoYW5kbGVTZWFyY2gob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgRmlsdGVyQmFyO1xuXHRcdGNvbnN0IG9FdmVudFBhcmFtZXRlcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVycygpO1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRjb25zdCBvQ29uZGl0aW9ucyA9IG9GaWx0ZXJCYXIuZ2V0RmlsdGVyQ29uZGl0aW9ucygpO1xuXHRcdFx0Y29uc3QgZXZlbnRQYXJhbWV0ZXJzOiBvYmplY3QgPSB0aGlzLl9wcmVwYXJlRXZlbnRQYXJhbWV0ZXJzKG9GaWx0ZXJCYXIpO1xuXHRcdFx0KHRoaXMgYXMgYW55KS5maXJlSW50ZXJuYWxTZWFyY2gobWVyZ2UoeyBjb25kaXRpb25zOiBvQ29uZGl0aW9ucyB9LCBvRXZlbnRQYXJhbWV0ZXJzKSk7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVTZWFyY2goZXZlbnRQYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0aGFuZGxlRmlsdGVyQ2hhbmdlZChvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBGaWx0ZXJCYXI7XG5cdFx0Y29uc3Qgb0V2ZW50UGFyYW1ldGVycyA9IG9FdmVudC5nZXRQYXJhbWV0ZXJzKCk7XG5cdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdGNvbnN0IG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRGaWx0ZXJDb25kaXRpb25zKCk7XG5cdFx0XHRjb25zdCBldmVudFBhcmFtZXRlcnM6IG9iamVjdCA9IHRoaXMuX3ByZXBhcmVFdmVudFBhcmFtZXRlcnMob0ZpbHRlckJhcik7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVJbnRlcm5hbEZpbHRlckNoYW5nZWQobWVyZ2UoeyBjb25kaXRpb25zOiBvQ29uZGl0aW9ucyB9LCBvRXZlbnRQYXJhbWV0ZXJzKSk7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVGaWx0ZXJDaGFuZ2VkKGV2ZW50UGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG5cblx0X3ByZXBhcmVFdmVudFBhcmFtZXRlcnMob0ZpbHRlckJhcjogRmlsdGVyQmFyKSB7XG5cdFx0Y29uc3QgeyBmaWx0ZXJzLCBzZWFyY2ggfSA9IEZpbHRlclV0aWxzLmdldEZpbHRlcnMob0ZpbHRlckJhcik7XG5cblx0XHRyZXR1cm4geyBmaWx0ZXJzLCBzZWFyY2ggfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGZpbHRlciB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eSBpbiB0aGUgZmlsdGVyIGJhci5cblx0ICogVGhlIGZpbHRlciB2YWx1ZXMgY2FuIGJlIGVpdGhlciBhIHNpbmdsZSB2YWx1ZSBvciBhbiBhcnJheSBvZiB2YWx1ZXMuXG5cdCAqIEVhY2ggZmlsdGVyIHZhbHVlIG11c3QgYmUgcmVwcmVzZW50ZWQgYXMgYSBwcmltaXRpdmUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQ29uZGl0aW9uUGF0aCBUaGUgcGF0aCB0byB0aGUgcHJvcGVydHkgYXMgYSBjb25kaXRpb24gcGF0aFxuXHQgKiBAcGFyYW0gW3NPcGVyYXRvcl0gVGhlIG9wZXJhdG9yIHRvIGJlIHVzZWQgKG9wdGlvbmFsKSAtIGlmIG5vdCBzZXQsIHRoZSBkZWZhdWx0IG9wZXJhdG9yIChFUSkgd2lsbCBiZSB1c2VkXG5cdCAqIEBwYXJhbSB2VmFsdWVzIFRoZSB2YWx1ZXMgdG8gYmUgYXBwbGllZFxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgZm9yIGFzeW5jaHJvbm91cyBoYW5kbGluZ1xuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRGaWx0ZXJWYWx1ZXMoXG5cdFx0c0NvbmRpdGlvblBhdGg6IHN0cmluZyxcblx0XHRzT3BlcmF0b3I6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHR2VmFsdWVzPzogdW5kZWZpbmVkIHwgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZ1tdIHwgbnVtYmVyW10gfCBib29sZWFuW11cblx0KSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcblx0XHRcdHZWYWx1ZXMgPSBzT3BlcmF0b3I7XG5cdFx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuc2V0RmlsdGVyVmFsdWVzKHRoaXMuY29udGVudCwgc0NvbmRpdGlvblBhdGgsIHZWYWx1ZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuc2V0RmlsdGVyVmFsdWVzKHRoaXMuY29udGVudCwgc0NvbmRpdGlvblBhdGgsIHNPcGVyYXRvciwgdlZhbHVlcyk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBBY3RpdmUgRmlsdGVycyBUZXh0IFN1bW1hcnkgZm9yIHRoZSBmaWx0ZXIgYmFyLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBY3RpdmUgZmlsdGVycyBzdW1tYXJ5IGFzIHRleHRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0QWN0aXZlRmlsdGVyc1RleHQoKSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuY29udGVudCBhcyBGaWx0ZXJCYXI7XG5cdFx0cmV0dXJuIG9GaWx0ZXJCYXI/LmdldEFzc2lnbmVkRmlsdGVyc1RleHQoKT8uZmlsdGVyc1RleHQgfHwgXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyBhbGwgdGhlIGZpbHRlcnMgdGhhdCBhcmUgY3VycmVudGx5IGFjdGl2ZVxuXHQgKiBhbG9uZyB3aXRoIHRoZSBzZWFyY2ggZXhwcmVzc2lvbi5cblx0ICpcblx0ICogQHJldHVybnMge3tmaWx0ZXJzOiBzYXAudWkubW9kZWwuRmlsdGVyW118dW5kZWZpbmVkLCBzZWFyY2g6IHN0cmluZ3x1bmRlZmluZWR9fSBBbiBhcnJheSBvZiBhY3RpdmUgZmlsdGVycyBhbmQgdGhlIHNlYXJjaCBleHByZXNzaW9uLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRGaWx0ZXJzKCkge1xuXHRcdHJldHVybiBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJzKHRoaXMuY29udGVudCBhcyBGaWx0ZXJCYXIpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlckJhckFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQXFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkEsSUFlTUEsWUFBWSxXQURqQkMsY0FBYyxDQUFDLHNDQUFzQyxDQUFDLFVBT3JEQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBUTVCRCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsbUJBQW1CLEVBQUUsQ0FBQyw0Q0FBNEMsQ0FBQztJQUNuRUMsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVk7RUFDMUMsQ0FBQyxDQUFDLFVBUURILFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFPbERKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFRakRKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFRakRKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFRbERDLFdBQVcsQ0FBQztJQUFFSixJQUFJLEVB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