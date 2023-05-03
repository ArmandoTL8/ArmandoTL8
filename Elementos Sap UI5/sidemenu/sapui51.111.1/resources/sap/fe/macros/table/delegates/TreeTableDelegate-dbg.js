/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/table/delegates/TableDelegate"], function (TableDelegate) {
  "use strict";

  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * This class is experimental and not intended for productive usage, since the API/behavior has not been finalized.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69
   * @alias sap.fe.macros.TableDelegate
   */
  const TreeTableDelegate = Object.assign({}, TableDelegate, {
    _internalUpdateBindingInfo: function (table, bindingInfo) {
      TableDelegate._internalUpdateBindingInfo.apply(this, [table, bindingInfo]);
      const payload = table.getPayload();
      bindingInfo.parameters.$$aggregation = {
        hierarchyQualifier: payload === null || payload === void 0 ? void 0 : payload.hierarchyQualifier
      };
      if (payload !== null && payload !== void 0 && payload.initialExpansionLevel) {
        bindingInfo.parameters.$$aggregation.expandTo = payload.initialExpansionLevel;
      }
    }
  });
  return TreeTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUcmVlVGFibGVEZWxlZ2F0ZSIsIk9iamVjdCIsImFzc2lnbiIsIlRhYmxlRGVsZWdhdGUiLCJfaW50ZXJuYWxVcGRhdGVCaW5kaW5nSW5mbyIsInRhYmxlIiwiYmluZGluZ0luZm8iLCJhcHBseSIsInBheWxvYWQiLCJnZXRQYXlsb2FkIiwicGFyYW1ldGVycyIsIiQkYWdncmVnYXRpb24iLCJoaWVyYXJjaHlRdWFsaWZpZXIiLCJpbml0aWFsRXhwYW5zaW9uTGV2ZWwiLCJleHBhbmRUbyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVHJlZVRhYmxlRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRhYmxlRGVsZWdhdGUgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvZGVsZWdhdGVzL1RhYmxlRGVsZWdhdGVcIjtcblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIHNhcC51aS5tZGMuVGFibGUuXG4gKiA8aDM+PGI+Tm90ZTo8L2I+PC9oMz5cbiAqIFRoaXMgY2xhc3MgaXMgZXhwZXJpbWVudGFsIGFuZCBub3QgaW50ZW5kZWQgZm9yIHByb2R1Y3RpdmUgdXNhZ2UsIHNpbmNlIHRoZSBBUEkvYmVoYXZpb3IgaGFzIG5vdCBiZWVuIGZpbmFsaXplZC5cbiAqXG4gKiBAYXV0aG9yIFNBUCBTRVxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqIEBzaW5jZSAxLjY5XG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5UYWJsZURlbGVnYXRlXG4gKi9cbmNvbnN0IFRyZWVUYWJsZURlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgVGFibGVEZWxlZ2F0ZSwge1xuXHRfaW50ZXJuYWxVcGRhdGVCaW5kaW5nSW5mbzogZnVuY3Rpb24gKHRhYmxlOiBhbnksIGJpbmRpbmdJbmZvOiBhbnkpIHtcblx0XHRUYWJsZURlbGVnYXRlLl9pbnRlcm5hbFVwZGF0ZUJpbmRpbmdJbmZvLmFwcGx5KHRoaXMsIFt0YWJsZSwgYmluZGluZ0luZm9dKTtcblxuXHRcdGNvbnN0IHBheWxvYWQgPSB0YWJsZS5nZXRQYXlsb2FkKCk7XG5cdFx0YmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGFnZ3JlZ2F0aW9uID0ge1xuXHRcdFx0aGllcmFyY2h5UXVhbGlmaWVyOiBwYXlsb2FkPy5oaWVyYXJjaHlRdWFsaWZpZXJcblx0XHR9O1xuXG5cdFx0aWYgKHBheWxvYWQ/LmluaXRpYWxFeHBhbnNpb25MZXZlbCkge1xuXHRcdFx0YmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGFnZ3JlZ2F0aW9uLmV4cGFuZFRvID0gcGF5bG9hZC5pbml0aWFsRXhwYW5zaW9uTGV2ZWw7XG5cdFx0fVxuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgVHJlZVRhYmxlRGVsZWdhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUEsaUJBQWlCLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFQyxhQUFhLEVBQUU7SUFDMURDLDBCQUEwQixFQUFFLFVBQVVDLEtBQVUsRUFBRUMsV0FBZ0IsRUFBRTtNQUNuRUgsYUFBYSxDQUFDQywwQkFBMEIsQ0FBQ0csS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDRixLQUFLLEVBQUVDLFdBQVcsQ0FBQyxDQUFDO01BRTFFLE1BQU1FLE9BQU8sR0FBR0gsS0FBSyxDQUFDSSxVQUFVLEVBQUU7TUFDbENILFdBQVcsQ0FBQ0ksVUFBVSxDQUFDQyxhQUFhLEdBQUc7UUFDdENDLGtCQUFrQixFQUFFSixPQUFPLGFBQVBBLE9BQU8sdUJBQVBBLE9BQU8sQ0FBRUk7TUFDOUIsQ0FBQztNQUVELElBQUlKLE9BQU8sYUFBUEEsT0FBTyxlQUFQQSxPQUFPLENBQUVLLHFCQUFxQixFQUFFO1FBQ25DUCxXQUFXLENBQUNJLFVBQVUsQ0FBQ0MsYUFBYSxDQUFDRyxRQUFRLEdBQUdOLE9BQU8sQ0FBQ0sscUJBQXFCO01BQzlFO0lBQ0Q7RUFDRCxDQUFDLENBQUM7RUFBQyxPQUVZYixpQkFBaUI7QUFBQSJ9