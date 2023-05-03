/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/filter/FilterUtils", "sap/fe/templates/ListReport/LRMessageStrip", "sap/ui/core/InvisibleMessage", "sap/ui/core/library"], function (ExtensionAPI, ClassSupport, ChartUtils, FilterUtils, $LRMessageStrip, InvisibleMessage, library) {
  "use strict";

  var _dec, _class;
  var InvisibleMessageMode = library.InvisibleMessageMode;
  var LRMessageStrip = $LRMessageStrip.LRMessageStrip;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Extension API for list reports in SAP Fiori elements for OData V4.
   *
   * @alias sap.fe.templates.ListReport.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  let ListReportExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ListReport.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ListReportExtensionAPI, _ExtensionAPI);
    function ListReportExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ListReportExtensionAPI.prototype;
    /**
     * Refreshes the List Report.
     * This method currently only supports triggering the search (by clicking on the GO button)
     * in the List Report Filter Bar. It can be used to request the initial load or to refresh the
     * currently shown data based on the filters entered by the user.
     * Please note: The Promise is resolved once the search is triggered and not once the data is returned.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#refresh
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh() {
      const oFilterBar = this._controller._getFilterBarControl();
      if (oFilterBar) {
        return oFilterBar.waitForInitialization().then(function () {
          oFilterBar.triggerSearch();
        });
      } else {
        // TODO: if there is no filter bar, make refresh work
        return Promise.resolve();
      }
    }

    /**
     * Gets the list entries currently selected for the displayed control.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getSelectedContexts
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts() {
      var _this$_controller$_ge, _this$_controller$_ge2;
      const oControl = this._controller._isMultiMode() && ((_this$_controller$_ge = this._controller._getMultiModeControl()) === null || _this$_controller$_ge === void 0 ? void 0 : (_this$_controller$_ge2 = _this$_controller$_ge.getSelectedInnerControl()) === null || _this$_controller$_ge2 === void 0 ? void 0 : _this$_controller$_ge2.content) || this._controller._getTable();
      if (oControl.isA("sap.ui.mdc.Chart")) {
        const aSelectedContexts = [];
        if (oControl && oControl.get_chart()) {
          const aSelectedDataPoints = ChartUtils.getChartSelectedData(oControl.get_chart());
          for (let i = 0; i < aSelectedDataPoints.length; i++) {
            aSelectedContexts.push(aSelectedDataPoints[i].context);
          }
        }
        return aSelectedContexts;
      } else {
        return oControl && oControl.getSelectedContexts() || [];
      }
    }

    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param sConditionPath The path to the property as a condition path
     * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @param vValues The values to be applied
     * @alias sap.fe.templates.ListReport.ExtensionAPI#setFilterValues
     * @returns A promise for asynchronous handling
     * @public
     */;
    _proto.setFilterValues = function setFilterValues(sConditionPath, sOperator, vValues) {
      // The List Report has two filter bars: The filter bar in the header and the filter bar in the "Adapt Filter" dialog;
      // when the dialog is opened, the user is working with that active control: Pass it to the setFilterValues method!
      const filterBar = this._controller._getAdaptationFilterBarControl() || this._controller._getFilterBarControl();
      if (arguments.length === 2) {
        vValues = sOperator;
        return FilterUtils.setFilterValues(filterBar, sConditionPath, vValues);
      }
      return FilterUtils.setFilterValues(filterBar, sConditionPath, sOperator, vValues);
    }

    /**
     * This method converts filter conditions to filters.
     *
     * @param mFilterConditions Map containing the filter conditions of the FilterBar.
     * @alias sap.fe.templates.ListReport.ExtensionAPI#createFiltersFromFilterConditions
     * @returns Object containing the converted FilterBar filters.
     * @public
     */;
    _proto.createFiltersFromFilterConditions = function createFiltersFromFilterConditions(mFilterConditions) {
      const oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilterInfo(oFilterBar, undefined, mFilterConditions);
    }
    /**
     * Provides all the model filters from the filter bar that are currently active
     * along with the search expression.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getFilters
     * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
     * @public
     */;
    _proto.getFilters = function getFilters() {
      const oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilters(oFilterBar);
    }

    /**
     * Provide an option for showing a custom message in the message strip above the list report table.
     *
     * @param {object} [message] Custom message along with the message type to be set on the table.
     * @param {string} message.message Message string to be displayed.
     * @param {sap.ui.core.MessageType} message.type Indicates the type of message.
     * @param {string[]|string} [tabKey] The tabKey identifying the table where the custom message is displayed. If tabKey is empty, the message is displayed in all tabs . If tabKey = ['1','2'], the message is displayed in tabs 1 and 2 only
     * @param {Function} [onClose] A function that is called when the user closes the message bar.
     * @public
     */;
    _proto.setCustomMessage = function setCustomMessage(message, tabKey, onClose) {
      if (!this.ListReportMessageStrip) {
        this.ListReportMessageStrip = new LRMessageStrip();
      }
      this.ListReportMessageStrip.showCustomMessage(message, this._controller, tabKey, onClose);
      if (message !== null && message !== void 0 && message.message) {
        InvisibleMessage.getInstance().announce(message.message, InvisibleMessageMode.Assertive);
      }
    };
    return ListReportExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ListReportExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaXN0UmVwb3J0RXh0ZW5zaW9uQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJyZWZyZXNoIiwib0ZpbHRlckJhciIsIl9jb250cm9sbGVyIiwiX2dldEZpbHRlckJhckNvbnRyb2wiLCJ3YWl0Rm9ySW5pdGlhbGl6YXRpb24iLCJ0aGVuIiwidHJpZ2dlclNlYXJjaCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsIm9Db250cm9sIiwiX2lzTXVsdGlNb2RlIiwiX2dldE11bHRpTW9kZUNvbnRyb2wiLCJnZXRTZWxlY3RlZElubmVyQ29udHJvbCIsImNvbnRlbnQiLCJfZ2V0VGFibGUiLCJpc0EiLCJhU2VsZWN0ZWRDb250ZXh0cyIsImdldF9jaGFydCIsImFTZWxlY3RlZERhdGFQb2ludHMiLCJDaGFydFV0aWxzIiwiZ2V0Q2hhcnRTZWxlY3RlZERhdGEiLCJpIiwibGVuZ3RoIiwicHVzaCIsImNvbnRleHQiLCJzZXRGaWx0ZXJWYWx1ZXMiLCJzQ29uZGl0aW9uUGF0aCIsInNPcGVyYXRvciIsInZWYWx1ZXMiLCJmaWx0ZXJCYXIiLCJfZ2V0QWRhcHRhdGlvbkZpbHRlckJhckNvbnRyb2wiLCJhcmd1bWVudHMiLCJGaWx0ZXJVdGlscyIsImNyZWF0ZUZpbHRlcnNGcm9tRmlsdGVyQ29uZGl0aW9ucyIsIm1GaWx0ZXJDb25kaXRpb25zIiwiZ2V0RmlsdGVySW5mbyIsInVuZGVmaW5lZCIsImdldEZpbHRlcnMiLCJzZXRDdXN0b21NZXNzYWdlIiwibWVzc2FnZSIsInRhYktleSIsIm9uQ2xvc2UiLCJMaXN0UmVwb3J0TWVzc2FnZVN0cmlwIiwiTFJNZXNzYWdlU3RyaXAiLCJzaG93Q3VzdG9tTWVzc2FnZSIsIkludmlzaWJsZU1lc3NhZ2UiLCJnZXRJbnN0YW5jZSIsImFubm91bmNlIiwiSW52aXNpYmxlTWVzc2FnZU1vZGUiLCJBc3NlcnRpdmUiLCJFeHRlbnNpb25BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkV4dGVuc2lvbkFQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXh0ZW5zaW9uQVBJIGZyb20gXCJzYXAvZmUvY29yZS9FeHRlbnNpb25BUElcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQ2hhcnRVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jaGFydC9DaGFydFV0aWxzXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgdHlwZSBMaXN0UmVwb3J0Q29udHJvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L0xpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IExSQ3VzdG9tTWVzc2FnZSwgTFJNZXNzYWdlU3RyaXAgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L0xSTWVzc2FnZVN0cmlwXCI7XG5pbXBvcnQgSW52aXNpYmxlTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvSW52aXNpYmxlTWVzc2FnZVwiO1xuaW1wb3J0IHsgSW52aXNpYmxlTWVzc2FnZU1vZGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBBUEkgZm9yIGxpc3QgcmVwb3J0cyBpbiBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIE9EYXRhIFY0LlxuICpcbiAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJXG4gKiBAcHVibGljXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAZmluYWxcbiAqIEBzaW5jZSAxLjc5LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSVwiKVxuY2xhc3MgTGlzdFJlcG9ydEV4dGVuc2lvbkFQSSBleHRlbmRzIEV4dGVuc2lvbkFQSSB7XG5cdHByb3RlY3RlZCBfY29udHJvbGxlciE6IExpc3RSZXBvcnRDb250cm9sbGVyO1xuXHRMaXN0UmVwb3J0TWVzc2FnZVN0cmlwITogTFJNZXNzYWdlU3RyaXA7XG5cdC8qKlxuXHQgKiBSZWZyZXNoZXMgdGhlIExpc3QgUmVwb3J0LlxuXHQgKiBUaGlzIG1ldGhvZCBjdXJyZW50bHkgb25seSBzdXBwb3J0cyB0cmlnZ2VyaW5nIHRoZSBzZWFyY2ggKGJ5IGNsaWNraW5nIG9uIHRoZSBHTyBidXR0b24pXG5cdCAqIGluIHRoZSBMaXN0IFJlcG9ydCBGaWx0ZXIgQmFyLiBJdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IHRoZSBpbml0aWFsIGxvYWQgb3IgdG8gcmVmcmVzaCB0aGVcblx0ICogY3VycmVudGx5IHNob3duIGRhdGEgYmFzZWQgb24gdGhlIGZpbHRlcnMgZW50ZXJlZCBieSB0aGUgdXNlci5cblx0ICogUGxlYXNlIG5vdGU6IFRoZSBQcm9taXNlIGlzIHJlc29sdmVkIG9uY2UgdGhlIHNlYXJjaCBpcyB0cmlnZ2VyZWQgYW5kIG5vdCBvbmNlIHRoZSBkYXRhIGlzIHJldHVybmVkLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSSNyZWZyZXNoXG5cdCAqIEByZXR1cm5zIFJlc29sdmVkIG9uY2UgdGhlIGRhdGEgaXMgcmVmcmVzaGVkIG9yIHJlamVjdGVkIGlmIHRoZSByZXF1ZXN0IGZhaWxlZFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRyZWZyZXNoKCkge1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLl9jb250cm9sbGVyLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkgYXMgYW55O1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRyZXR1cm4gb0ZpbHRlckJhci53YWl0Rm9ySW5pdGlhbGl6YXRpb24oKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0b0ZpbHRlckJhci50cmlnZ2VyU2VhcmNoKCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gVE9ETzogaWYgdGhlcmUgaXMgbm8gZmlsdGVyIGJhciwgbWFrZSByZWZyZXNoIHdvcmtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgbGlzdCBlbnRyaWVzIGN1cnJlbnRseSBzZWxlY3RlZCBmb3IgdGhlIGRpc3BsYXllZCBjb250cm9sLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSSNnZXRTZWxlY3RlZENvbnRleHRzXG5cdCAqIEByZXR1cm5zIEFycmF5IGNvbnRhaW5pbmcgdGhlIHNlbGVjdGVkIGNvbnRleHRzXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldFNlbGVjdGVkQ29udGV4dHMoKSB7XG5cdFx0Y29uc3Qgb0NvbnRyb2wgPSAoKHRoaXMuX2NvbnRyb2xsZXIuX2lzTXVsdGlNb2RlKCkgJiZcblx0XHRcdHRoaXMuX2NvbnRyb2xsZXIuX2dldE11bHRpTW9kZUNvbnRyb2woKT8uZ2V0U2VsZWN0ZWRJbm5lckNvbnRyb2woKT8uY29udGVudCkgfHxcblx0XHRcdHRoaXMuX2NvbnRyb2xsZXIuX2dldFRhYmxlKCkpIGFzIGFueTtcblx0XHRpZiAob0NvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5DaGFydFwiKSkge1xuXHRcdFx0Y29uc3QgYVNlbGVjdGVkQ29udGV4dHMgPSBbXTtcblx0XHRcdGlmIChvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRfY2hhcnQoKSkge1xuXHRcdFx0XHRjb25zdCBhU2VsZWN0ZWREYXRhUG9pbnRzID0gQ2hhcnRVdGlscy5nZXRDaGFydFNlbGVjdGVkRGF0YShvQ29udHJvbC5nZXRfY2hhcnQoKSk7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVNlbGVjdGVkRGF0YVBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGFTZWxlY3RlZENvbnRleHRzLnB1c2goYVNlbGVjdGVkRGF0YVBvaW50c1tpXS5jb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGFTZWxlY3RlZENvbnRleHRzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gKG9Db250cm9sICYmIG9Db250cm9sLmdldFNlbGVjdGVkQ29udGV4dHMoKSkgfHwgW107XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgZmlsdGVyIHZhbHVlcyBmb3IgdGhlIGdpdmVuIHByb3BlcnR5IGluIHRoZSBmaWx0ZXIgYmFyLlxuXHQgKiBUaGUgZmlsdGVyIHZhbHVlcyBjYW4gYmUgZWl0aGVyIGEgc2luZ2xlIHZhbHVlIG9yIGFuIGFycmF5IG9mIHZhbHVlcy5cblx0ICogRWFjaCBmaWx0ZXIgdmFsdWUgbXVzdCBiZSByZXByZXNlbnRlZCBhcyBhIHByaW1pdGl2ZSB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIHNDb25kaXRpb25QYXRoIFRoZSBwYXRoIHRvIHRoZSBwcm9wZXJ0eSBhcyBhIGNvbmRpdGlvbiBwYXRoXG5cdCAqIEBwYXJhbSBbc09wZXJhdG9yXSBUaGUgb3BlcmF0b3IgdG8gYmUgdXNlZCAob3B0aW9uYWwpIC0gaWYgbm90IHNldCwgdGhlIGRlZmF1bHQgb3BlcmF0b3IgKEVRKSB3aWxsIGJlIHVzZWRcblx0ICogQHBhcmFtIHZWYWx1ZXMgVGhlIHZhbHVlcyB0byBiZSBhcHBsaWVkXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJI3NldEZpbHRlclZhbHVlc1xuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgZm9yIGFzeW5jaHJvbm91cyBoYW5kbGluZ1xuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRGaWx0ZXJWYWx1ZXMoXG5cdFx0c0NvbmRpdGlvblBhdGg6IHN0cmluZyxcblx0XHRzT3BlcmF0b3I6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHR2VmFsdWVzPzogdW5kZWZpbmVkIHwgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZ1tdIHwgbnVtYmVyW10gfCBib29sZWFuW11cblx0KSB7XG5cdFx0Ly8gVGhlIExpc3QgUmVwb3J0IGhhcyB0d28gZmlsdGVyIGJhcnM6IFRoZSBmaWx0ZXIgYmFyIGluIHRoZSBoZWFkZXIgYW5kIHRoZSBmaWx0ZXIgYmFyIGluIHRoZSBcIkFkYXB0IEZpbHRlclwiIGRpYWxvZztcblx0XHQvLyB3aGVuIHRoZSBkaWFsb2cgaXMgb3BlbmVkLCB0aGUgdXNlciBpcyB3b3JraW5nIHdpdGggdGhhdCBhY3RpdmUgY29udHJvbDogUGFzcyBpdCB0byB0aGUgc2V0RmlsdGVyVmFsdWVzIG1ldGhvZCFcblx0XHRjb25zdCBmaWx0ZXJCYXIgPSB0aGlzLl9jb250cm9sbGVyLl9nZXRBZGFwdGF0aW9uRmlsdGVyQmFyQ29udHJvbCgpIHx8IHRoaXMuX2NvbnRyb2xsZXIuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuXHRcdFx0dlZhbHVlcyA9IHNPcGVyYXRvcjtcblx0XHRcdHJldHVybiBGaWx0ZXJVdGlscy5zZXRGaWx0ZXJWYWx1ZXMoZmlsdGVyQmFyLCBzQ29uZGl0aW9uUGF0aCwgdlZhbHVlcyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEZpbHRlclV0aWxzLnNldEZpbHRlclZhbHVlcyhmaWx0ZXJCYXIsIHNDb25kaXRpb25QYXRoLCBzT3BlcmF0b3IsIHZWYWx1ZXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgbWV0aG9kIGNvbnZlcnRzIGZpbHRlciBjb25kaXRpb25zIHRvIGZpbHRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBtRmlsdGVyQ29uZGl0aW9ucyBNYXAgY29udGFpbmluZyB0aGUgZmlsdGVyIGNvbmRpdGlvbnMgb2YgdGhlIEZpbHRlckJhci5cblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5FeHRlbnNpb25BUEkjY3JlYXRlRmlsdGVyc0Zyb21GaWx0ZXJDb25kaXRpb25zXG5cdCAqIEByZXR1cm5zIE9iamVjdCBjb250YWluaW5nIHRoZSBjb252ZXJ0ZWQgRmlsdGVyQmFyIGZpbHRlcnMuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGNyZWF0ZUZpbHRlcnNGcm9tRmlsdGVyQ29uZGl0aW9ucyhtRmlsdGVyQ29uZGl0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2NvbnRyb2xsZXIuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuZ2V0RmlsdGVySW5mbyhvRmlsdGVyQmFyLCB1bmRlZmluZWQsIG1GaWx0ZXJDb25kaXRpb25zKTtcblx0fVxuXHQvKipcblx0ICogUHJvdmlkZXMgYWxsIHRoZSBtb2RlbCBmaWx0ZXJzIGZyb20gdGhlIGZpbHRlciBiYXIgdGhhdCBhcmUgY3VycmVudGx5IGFjdGl2ZVxuXHQgKiBhbG9uZyB3aXRoIHRoZSBzZWFyY2ggZXhwcmVzc2lvbi5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5FeHRlbnNpb25BUEkjZ2V0RmlsdGVyc1xuXHQgKiBAcmV0dXJucyB7e2ZpbHRlcnM6IHNhcC51aS5tb2RlbC5GaWx0ZXJbXXx1bmRlZmluZWQsIHNlYXJjaDogc3RyaW5nfHVuZGVmaW5lZH19IEFuIGFycmF5IG9mIGFjdGl2ZSBmaWx0ZXJzIGFuZCB0aGUgc2VhcmNoIGV4cHJlc3Npb24uXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldEZpbHRlcnMoKSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2NvbnRyb2xsZXIuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuZ2V0RmlsdGVycyhvRmlsdGVyQmFyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm92aWRlIGFuIG9wdGlvbiBmb3Igc2hvd2luZyBhIGN1c3RvbSBtZXNzYWdlIGluIHRoZSBtZXNzYWdlIHN0cmlwIGFib3ZlIHRoZSBsaXN0IHJlcG9ydCB0YWJsZS5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IFttZXNzYWdlXSBDdXN0b20gbWVzc2FnZSBhbG9uZyB3aXRoIHRoZSBtZXNzYWdlIHR5cGUgdG8gYmUgc2V0IG9uIHRoZSB0YWJsZS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UubWVzc2FnZSBNZXNzYWdlIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQuXG5cdCAqIEBwYXJhbSB7c2FwLnVpLmNvcmUuTWVzc2FnZVR5cGV9IG1lc3NhZ2UudHlwZSBJbmRpY2F0ZXMgdGhlIHR5cGUgb2YgbWVzc2FnZS5cblx0ICogQHBhcmFtIHtzdHJpbmdbXXxzdHJpbmd9IFt0YWJLZXldIFRoZSB0YWJLZXkgaWRlbnRpZnlpbmcgdGhlIHRhYmxlIHdoZXJlIHRoZSBjdXN0b20gbWVzc2FnZSBpcyBkaXNwbGF5ZWQuIElmIHRhYktleSBpcyBlbXB0eSwgdGhlIG1lc3NhZ2UgaXMgZGlzcGxheWVkIGluIGFsbCB0YWJzIC4gSWYgdGFiS2V5ID0gWycxJywnMiddLCB0aGUgbWVzc2FnZSBpcyBkaXNwbGF5ZWQgaW4gdGFicyAxIGFuZCAyIG9ubHlcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW29uQ2xvc2VdIEEgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgdXNlciBjbG9zZXMgdGhlIG1lc3NhZ2UgYmFyLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRDdXN0b21NZXNzYWdlKG1lc3NhZ2U6IExSQ3VzdG9tTWVzc2FnZSB8IHVuZGVmaW5lZCwgdGFiS2V5Pzogc3RyaW5nW10gfCBzdHJpbmcgfCBudWxsLCBvbkNsb3NlPzogRnVuY3Rpb24pIHtcblx0XHRpZiAoIXRoaXMuTGlzdFJlcG9ydE1lc3NhZ2VTdHJpcCkge1xuXHRcdFx0dGhpcy5MaXN0UmVwb3J0TWVzc2FnZVN0cmlwID0gbmV3IExSTWVzc2FnZVN0cmlwKCk7XG5cdFx0fVxuXHRcdHRoaXMuTGlzdFJlcG9ydE1lc3NhZ2VTdHJpcC5zaG93Q3VzdG9tTWVzc2FnZShtZXNzYWdlLCB0aGlzLl9jb250cm9sbGVyLCB0YWJLZXksIG9uQ2xvc2UpO1xuXHRcdGlmIChtZXNzYWdlPy5tZXNzYWdlKSB7XG5cdFx0XHRJbnZpc2libGVNZXNzYWdlLmdldEluc3RhbmNlKCkuYW5ub3VuY2UobWVzc2FnZS5tZXNzYWdlLCBJbnZpc2libGVNZXNzYWdlTW9kZS5Bc3NlcnRpdmUpO1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaXN0UmVwb3J0RXh0ZW5zaW9uQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUkEsSUFVTUEsc0JBQXNCLFdBRDNCQyxjQUFjLENBQUMsMENBQTBDLENBQUM7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBSTFEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFWQyxPQVdBQyxPQUFPLEdBQVAsbUJBQVU7TUFDVCxNQUFNQyxVQUFVLEdBQUcsSUFBSSxDQUFDQyxXQUFXLENBQUNDLG9CQUFvQixFQUFTO01BQ2pFLElBQUlGLFVBQVUsRUFBRTtRQUNmLE9BQU9BLFVBQVUsQ0FBQ0cscUJBQXFCLEVBQUUsQ0FBQ0MsSUFBSSxDQUFDLFlBQVk7VUFDMURKLFVBQVUsQ0FBQ0ssYUFBYSxFQUFFO1FBQzNCLENBQUMsQ0FBQztNQUNILENBQUMsTUFBTTtRQUNOO1FBQ0EsT0FBT0MsT0FBTyxDQUFDQyxPQUFPLEVBQUU7TUFDekI7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FPQUMsbUJBQW1CLEdBQW5CLCtCQUFzQjtNQUFBO01BQ3JCLE1BQU1DLFFBQVEsR0FBSyxJQUFJLENBQUNSLFdBQVcsQ0FBQ1MsWUFBWSxFQUFFLDhCQUNqRCxJQUFJLENBQUNULFdBQVcsQ0FB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