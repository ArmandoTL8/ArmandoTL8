/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/model/odata/type/DateTimeWithTimezone"], function (ClassSupport, _DateTimeWithTimezone) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let DateTimeWithTimezone = (_dec = defineUI5Class("sap.fe.core.type.DateTimeWithTimezone"), _dec(_class = /*#__PURE__*/function (_DateTimeWithTimezone2) {
    _inheritsLoose(DateTimeWithTimezone, _DateTimeWithTimezone2);
    function DateTimeWithTimezone(oFormatOptions, oConstraints) {
      var _this;
      _this = _DateTimeWithTimezone2.call(this, oFormatOptions, oConstraints) || this;
      _this.bShowTimezoneForEmptyValues = (oFormatOptions === null || oFormatOptions === void 0 ? void 0 : oFormatOptions.showTimezoneForEmptyValues) ?? true;
      return _this;
    }
    var _proto = DateTimeWithTimezone.prototype;
    _proto.formatValue = function formatValue(aValues, sTargetType) {
      const oTimestamp = aValues && aValues[0];
      if (oTimestamp === undefined ||
      // data is not yet available
      // if time zone is not shown falsy timestamps cannot be formatted -> return null
      !oTimestamp && !this.bShowTimezoneForEmptyValues) {
        return null;
      }
      return _DateTimeWithTimezone2.prototype.formatValue.call(this, aValues, sTargetType);
    };
    return DateTimeWithTimezone;
  }(_DateTimeWithTimezone)) || _class);
  return DateTimeWithTimezone;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEYXRlVGltZVdpdGhUaW1lem9uZSIsImRlZmluZVVJNUNsYXNzIiwib0Zvcm1hdE9wdGlvbnMiLCJvQ29uc3RyYWludHMiLCJiU2hvd1RpbWV6b25lRm9yRW1wdHlWYWx1ZXMiLCJzaG93VGltZXpvbmVGb3JFbXB0eVZhbHVlcyIsImZvcm1hdFZhbHVlIiwiYVZhbHVlcyIsInNUYXJnZXRUeXBlIiwib1RpbWVzdGFtcCIsInVuZGVmaW5lZCIsIl9EYXRlVGltZVdpdGhUaW1lem9uZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGF0ZVRpbWVXaXRoVGltZXpvbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBfRGF0ZVRpbWVXaXRoVGltZXpvbmUgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS90eXBlL0RhdGVUaW1lV2l0aFRpbWV6b25lXCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLnR5cGUuRGF0ZVRpbWVXaXRoVGltZXpvbmVcIilcbmNsYXNzIERhdGVUaW1lV2l0aFRpbWV6b25lIGV4dGVuZHMgX0RhdGVUaW1lV2l0aFRpbWV6b25lIHtcblx0cHJpdmF0ZSBiU2hvd1RpbWV6b25lRm9yRW1wdHlWYWx1ZXM6IGJvb2xlYW47XG5cdGNvbnN0cnVjdG9yKG9Gb3JtYXRPcHRpb25zPzogYW55LCBvQ29uc3RyYWludHM/OiBhbnkpIHtcblx0XHRzdXBlcihvRm9ybWF0T3B0aW9ucywgb0NvbnN0cmFpbnRzKTtcblx0XHR0aGlzLmJTaG93VGltZXpvbmVGb3JFbXB0eVZhbHVlcyA9IG9Gb3JtYXRPcHRpb25zPy5zaG93VGltZXpvbmVGb3JFbXB0eVZhbHVlcyA/PyB0cnVlO1xuXHR9XG5cdGZvcm1hdFZhbHVlKGFWYWx1ZXM6IGFueVtdLCBzVGFyZ2V0VHlwZTogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb1RpbWVzdGFtcCA9IGFWYWx1ZXMgJiYgYVZhbHVlc1swXTtcblx0XHRpZiAoXG5cdFx0XHRvVGltZXN0YW1wID09PSB1bmRlZmluZWQgfHwgLy8gZGF0YSBpcyBub3QgeWV0IGF2YWlsYWJsZVxuXHRcdFx0Ly8gaWYgdGltZSB6b25lIGlzIG5vdCBzaG93biBmYWxzeSB0aW1lc3RhbXBzIGNhbm5vdCBiZSBmb3JtYXR0ZWQgLT4gcmV0dXJuIG51bGxcblx0XHRcdCghb1RpbWVzdGFtcCAmJiAhdGhpcy5iU2hvd1RpbWV6b25lRm9yRW1wdHlWYWx1ZXMpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIHN1cGVyLmZvcm1hdFZhbHVlKGFWYWx1ZXMsIHNUYXJnZXRUeXBlKTtcblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgRGF0ZVRpbWVXaXRoVGltZXpvbmU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O01BSU1BLG9CQUFvQixXQUR6QkMsY0FBYyxDQUFDLHVDQUF1QyxDQUFDO0lBQUE7SUFHdkQsOEJBQVlDLGNBQW9CLEVBQUVDLFlBQWtCLEVBQUU7TUFBQTtNQUNyRCwwQ0FBTUQsY0FBYyxFQUFFQyxZQUFZLENBQUM7TUFDbkMsTUFBS0MsMkJBQTJCLEdBQUcsQ0FBQUYsY0FBYyxhQUFkQSxjQUFjLHVCQUFkQSxjQUFjLENBQUVHLDBCQUEwQixLQUFJLElBQUk7TUFBQztJQUN2RjtJQUFDO0lBQUEsT0FDREMsV0FBVyxHQUFYLHFCQUFZQyxPQUFjLEVBQUVDLFdBQW1CLEVBQUU7TUFDaEQsTUFBTUMsVUFBVSxHQUFHRixPQUFPLElBQUlBLE9BQU8sQ0FBQyxDQUFDLENBQUM7TUFDeEMsSUFDQ0UsVUFBVSxLQUFLQyxTQUFTO01BQUk7TUFDNUI7TUFDQyxDQUFDRCxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUNMLDJCQUE0QixFQUNqRDtRQUNELE9BQU8sSUFBSTtNQUNaO01BQ0Esd0NBQWFFLFdBQVcsWUFBQ0MsT0FBTyxFQUFFQyxXQUFXO0lBQzlDLENBQUM7SUFBQTtFQUFBLEVBaEJpQ0cscUJBQXFCO0VBQUEsT0FrQnpDWCxvQkFBb0I7QUFBQSJ9