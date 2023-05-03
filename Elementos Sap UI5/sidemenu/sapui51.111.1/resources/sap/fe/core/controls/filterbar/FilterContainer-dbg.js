/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/mdc/filterbar/aligned/FilterContainer"], function (ClassSupport, MdcFilterContainer) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Constructor for a new FE filter container.
   *
   * @extends sap.ui.mdc.filterbar.aligned.FilterContainer
   * @class
   * @private
   * @alias sap.fe.core.controls.filterbar.FilterContainer
   */
  let FilterContainer = (_dec = defineUI5Class("sap.fe.core.controls.filterbar.FilterContainer"), _dec(_class = /*#__PURE__*/function (_MdcFilterContainer) {
    _inheritsLoose(FilterContainer, _MdcFilterContainer);
    function FilterContainer() {
      return _MdcFilterContainer.apply(this, arguments) || this;
    }
    var _proto = FilterContainer.prototype;
    _proto.init = function init() {
      this.aAllFilterFields = [];
      this.aAllVisualFilters = {};
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _MdcFilterContainer.prototype.init.call(this, ...args);
    };
    _proto.exit = function exit() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      // destroy layout
      _MdcFilterContainer.prototype.exit.call(this, ...args);
      // destroy all filter fields which are not in the layout
      this.aAllFilterFields.forEach(function (oFilterField) {
        oFilterField.destroy();
      });
      Object.keys(this.aAllVisualFilters).forEach(sKey => {
        this.aAllVisualFilters[sKey].destroy();
      });
    };
    _proto.insertFilterField = function insertFilterField(oControl, iIndex) {
      const oFilterItemLayoutEventDelegate = {
        onBeforeRendering: function () {
          // For compact filters the item layout needs to render both label and filter field.
          // hence use the original getContent of the FilterItemLayout
          if (oControl._fnGetContentCopy) {
            oControl.getContent = oControl._fnGetContentCopy;
          }
          oControl.removeEventDelegate(oFilterItemLayoutEventDelegate);
        }
      };
      oControl.addEventDelegate(oFilterItemLayoutEventDelegate);

      // In this layout there is no need to render visual filter
      // hence find the filter field from the layout and remove it's content aggregation
      oControl.getContent().forEach(oInnerControl => {
        const oContent = oInnerControl.getContent && oInnerControl.getContent();
        if (oInnerControl.isA("sap.ui.mdc.FilterField") && oContent && oContent.isA("sap.fe.core.controls.filterbar.VisualFilter")) {
          // store the visual filter for later use.
          const oVFId = oInnerControl.getId();
          this.aAllVisualFilters[oVFId] = oContent;
          // remove the content aggregation to render internal content of the field
          oInnerControl.setContent(null);
        }
      });

      // store filter fields to refer to when switching between layout
      this.aAllFilterFields.push(oControl);
      _MdcFilterContainer.prototype.insertFilterField.call(this, oControl, iIndex);
    };
    _proto.removeFilterField = function removeFilterField(oControl) {
      const oFilterFieldIndex = this.aAllFilterFields.findIndex(function (oFilterField) {
        return oFilterField.getId() === oControl.getId();
      });

      // Setting VF content for Fillterfield before removing
      oControl.getContent().forEach(oInnerControl => {
        if (oInnerControl.isA("sap.ui.mdc.FilterField") && !oInnerControl.getContent()) {
          const oVFId = oInnerControl.getId();
          if (this.aAllVisualFilters[oVFId]) {
            oInnerControl.setContent(this.aAllVisualFilters[oVFId]);
          }
        }
      });
      this.aAllFilterFields.splice(oFilterFieldIndex, 1);
      _MdcFilterContainer.prototype.removeFilterField.call(this, oControl);
    };
    _proto.removeAllFilterFields = function removeAllFilterFields() {
      this.aAllFilterFields = [];
      this.aAllVisualFilters = {};
      this.oLayout.removeAllContent();
    };
    _proto.getAllButtons = function getAllButtons() {
      return this.oLayout.getEndContent();
    };
    _proto.removeButton = function removeButton(oControl) {
      this.oLayout.removeEndContent(oControl);
    };
    _proto.getAllFilterFields = function getAllFilterFields() {
      return this.aAllFilterFields.slice();
    };
    _proto.getAllVisualFilterFields = function getAllVisualFilterFields() {
      return this.aAllVisualFilters;
    };
    _proto.setAllFilterFields = function setAllFilterFields(aFilterFields) {
      this.aAllFilterFields = aFilterFields;
    };
    return FilterContainer;
  }(MdcFilterContainer)) || _class);
  return FilterContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJDb250YWluZXIiLCJkZWZpbmVVSTVDbGFzcyIsImluaXQiLCJhQWxsRmlsdGVyRmllbGRzIiwiYUFsbFZpc3VhbEZpbHRlcnMiLCJhcmdzIiwiZXhpdCIsImZvckVhY2giLCJvRmlsdGVyRmllbGQiLCJkZXN0cm95IiwiT2JqZWN0Iiwia2V5cyIsInNLZXkiLCJpbnNlcnRGaWx0ZXJGaWVsZCIsIm9Db250cm9sIiwiaUluZGV4Iiwib0ZpbHRlckl0ZW1MYXlvdXRFdmVudERlbGVnYXRlIiwib25CZWZvcmVSZW5kZXJpbmciLCJfZm5HZXRDb250ZW50Q29weSIsImdldENvbnRlbnQiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsIm9Jbm5lckNvbnRyb2wiLCJvQ29udGVudCIsImlzQSIsIm9WRklkIiwiZ2V0SWQiLCJzZXRDb250ZW50IiwicHVzaCIsInJlbW92ZUZpbHRlckZpZWxkIiwib0ZpbHRlckZpZWxkSW5kZXgiLCJmaW5kSW5kZXgiLCJzcGxpY2UiLCJyZW1vdmVBbGxGaWx0ZXJGaWVsZHMiLCJvTGF5b3V0IiwicmVtb3ZlQWxsQ29udGVudCIsImdldEFsbEJ1dHRvbnMiLCJnZXRFbmRDb250ZW50IiwicmVtb3ZlQnV0dG9uIiwicmVtb3ZlRW5kQ29udGVudCIsImdldEFsbEZpbHRlckZpZWxkcyIsInNsaWNlIiwiZ2V0QWxsVmlzdWFsRmlsdGVyRmllbGRzIiwic2V0QWxsRmlsdGVyRmllbGRzIiwiYUZpbHRlckZpZWxkcyIsIk1kY0ZpbHRlckNvbnRhaW5lciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQ29udGFpbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTWRjRmlsdGVyQ29udGFpbmVyIGZyb20gXCJzYXAvdWkvbWRjL2ZpbHRlcmJhci9hbGlnbmVkL0ZpbHRlckNvbnRhaW5lclwiO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIGZvciBhIG5ldyBGRSBmaWx0ZXIgY29udGFpbmVyLlxuICpcbiAqIEBleHRlbmRzIHNhcC51aS5tZGMuZmlsdGVyYmFyLmFsaWduZWQuRmlsdGVyQ29udGFpbmVyXG4gKiBAY2xhc3NcbiAqIEBwcml2YXRlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLkZpbHRlckNvbnRhaW5lclxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9scy5maWx0ZXJiYXIuRmlsdGVyQ29udGFpbmVyXCIpXG5jbGFzcyBGaWx0ZXJDb250YWluZXIgZXh0ZW5kcyBNZGNGaWx0ZXJDb250YWluZXIge1xuXHRpbml0KC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzID0gW107XG5cdFx0dGhpcy5hQWxsVmlzdWFsRmlsdGVycyA9IHt9O1xuXHRcdHN1cGVyLmluaXQoLi4uYXJncyk7XG5cdH1cblxuXHRleGl0KC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0Ly8gZGVzdHJveSBsYXlvdXRcblx0XHRzdXBlci5leGl0KC4uLmFyZ3MpO1xuXHRcdC8vIGRlc3Ryb3kgYWxsIGZpbHRlciBmaWVsZHMgd2hpY2ggYXJlIG5vdCBpbiB0aGUgbGF5b3V0XG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9GaWx0ZXJGaWVsZDogYW55KSB7XG5cdFx0XHRvRmlsdGVyRmllbGQuZGVzdHJveSgpO1xuXHRcdH0pO1xuXHRcdE9iamVjdC5rZXlzKHRoaXMuYUFsbFZpc3VhbEZpbHRlcnMpLmZvckVhY2goKHNLZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0dGhpcy5hQWxsVmlzdWFsRmlsdGVyc1tzS2V5XS5kZXN0cm95KCk7XG5cdFx0fSk7XG5cdH1cblxuXHRpbnNlcnRGaWx0ZXJGaWVsZChvQ29udHJvbDogYW55LCBpSW5kZXg6IG51bWJlcikge1xuXHRcdGNvbnN0IG9GaWx0ZXJJdGVtTGF5b3V0RXZlbnREZWxlZ2F0ZSA9IHtcblx0XHRcdG9uQmVmb3JlUmVuZGVyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIEZvciBjb21wYWN0IGZpbHRlcnMgdGhlIGl0ZW0gbGF5b3V0IG5lZWRzIHRvIHJlbmRlciBib3RoIGxhYmVsIGFuZCBmaWx0ZXIgZmllbGQuXG5cdFx0XHRcdC8vIGhlbmNlIHVzZSB0aGUgb3JpZ2luYWwgZ2V0Q29udGVudCBvZiB0aGUgRmlsdGVySXRlbUxheW91dFxuXHRcdFx0XHRpZiAob0NvbnRyb2wuX2ZuR2V0Q29udGVudENvcHkpIHtcblx0XHRcdFx0XHRvQ29udHJvbC5nZXRDb250ZW50ID0gb0NvbnRyb2wuX2ZuR2V0Q29udGVudENvcHk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0NvbnRyb2wucmVtb3ZlRXZlbnREZWxlZ2F0ZShvRmlsdGVySXRlbUxheW91dEV2ZW50RGVsZWdhdGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0b0NvbnRyb2wuYWRkRXZlbnREZWxlZ2F0ZShvRmlsdGVySXRlbUxheW91dEV2ZW50RGVsZWdhdGUpO1xuXG5cdFx0Ly8gSW4gdGhpcyBsYXlvdXQgdGhlcmUgaXMgbm8gbmVlZCB0byByZW5kZXIgdmlzdWFsIGZpbHRlclxuXHRcdC8vIGhlbmNlIGZpbmQgdGhlIGZpbHRlciBmaWVsZCBmcm9tIHRoZSBsYXlvdXQgYW5kIHJlbW92ZSBpdCdzIGNvbnRlbnQgYWdncmVnYXRpb25cblx0XHRvQ29udHJvbC5nZXRDb250ZW50KCkuZm9yRWFjaCgob0lubmVyQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvQ29udGVudCA9IG9Jbm5lckNvbnRyb2wuZ2V0Q29udGVudCAmJiBvSW5uZXJDb250cm9sLmdldENvbnRlbnQoKTtcblx0XHRcdGlmIChvSW5uZXJDb250cm9sLmlzQShcInNhcC51aS5tZGMuRmlsdGVyRmllbGRcIikgJiYgb0NvbnRlbnQgJiYgb0NvbnRlbnQuaXNBKFwic2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLlZpc3VhbEZpbHRlclwiKSkge1xuXHRcdFx0XHQvLyBzdG9yZSB0aGUgdmlzdWFsIGZpbHRlciBmb3IgbGF0ZXIgdXNlLlxuXHRcdFx0XHRjb25zdCBvVkZJZCA9IG9Jbm5lckNvbnRyb2wuZ2V0SWQoKTtcblx0XHRcdFx0dGhpcy5hQWxsVmlzdWFsRmlsdGVyc1tvVkZJZF0gPSBvQ29udGVudDtcblx0XHRcdFx0Ly8gcmVtb3ZlIHRoZSBjb250ZW50IGFnZ3JlZ2F0aW9uIHRvIHJlbmRlciBpbnRlcm5hbCBjb250ZW50IG9mIHRoZSBmaWVsZFxuXHRcdFx0XHRvSW5uZXJDb250cm9sLnNldENvbnRlbnQobnVsbCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBzdG9yZSBmaWx0ZXIgZmllbGRzIHRvIHJlZmVyIHRvIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gbGF5b3V0XG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzLnB1c2gob0NvbnRyb2wpO1xuXHRcdHN1cGVyLmluc2VydEZpbHRlckZpZWxkKG9Db250cm9sLCBpSW5kZXgpO1xuXHR9XG5cdHJlbW92ZUZpbHRlckZpZWxkKG9Db250cm9sOiBhbnkpIHtcblx0XHRjb25zdCBvRmlsdGVyRmllbGRJbmRleCA9IHRoaXMuYUFsbEZpbHRlckZpZWxkcy5maW5kSW5kZXgoZnVuY3Rpb24gKG9GaWx0ZXJGaWVsZDogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0ZpbHRlckZpZWxkLmdldElkKCkgPT09IG9Db250cm9sLmdldElkKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBTZXR0aW5nIFZGIGNvbnRlbnQgZm9yIEZpbGx0ZXJmaWVsZCBiZWZvcmUgcmVtb3Zpbmdcblx0XHRvQ29udHJvbC5nZXRDb250ZW50KCkuZm9yRWFjaCgob0lubmVyQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRpZiAob0lubmVyQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpICYmICFvSW5uZXJDb250cm9sLmdldENvbnRlbnQoKSkge1xuXHRcdFx0XHRjb25zdCBvVkZJZCA9IG9Jbm5lckNvbnRyb2wuZ2V0SWQoKTtcblx0XHRcdFx0aWYgKHRoaXMuYUFsbFZpc3VhbEZpbHRlcnNbb1ZGSWRdKSB7XG5cdFx0XHRcdFx0b0lubmVyQ29udHJvbC5zZXRDb250ZW50KHRoaXMuYUFsbFZpc3VhbEZpbHRlcnNbb1ZGSWRdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzLnNwbGljZShvRmlsdGVyRmllbGRJbmRleCwgMSk7XG5cblx0XHRzdXBlci5yZW1vdmVGaWx0ZXJGaWVsZChvQ29udHJvbCk7XG5cdH1cblx0cmVtb3ZlQWxsRmlsdGVyRmllbGRzKCkge1xuXHRcdHRoaXMuYUFsbEZpbHRlckZpZWxkcyA9IFtdO1xuXHRcdHRoaXMuYUFsbFZpc3VhbEZpbHRlcnMgPSB7fTtcblx0XHR0aGlzLm9MYXlvdXQucmVtb3ZlQWxsQ29udGVudCgpO1xuXHR9XG5cdGdldEFsbEJ1dHRvbnMoKSB7XG5cdFx0cmV0dXJuIHRoaXMub0xheW91dC5nZXRFbmRDb250ZW50KCk7XG5cdH1cblx0cmVtb3ZlQnV0dG9uKG9Db250cm9sOiBhbnkpIHtcblx0XHR0aGlzLm9MYXlvdXQucmVtb3ZlRW5kQ29udGVudChvQ29udHJvbCk7XG5cdH1cblx0Z2V0QWxsRmlsdGVyRmllbGRzKCkge1xuXHRcdHJldHVybiB0aGlzLmFBbGxGaWx0ZXJGaWVsZHMuc2xpY2UoKTtcblx0fVxuXHRnZXRBbGxWaXN1YWxGaWx0ZXJGaWVsZHMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuYUFsbFZpc3VhbEZpbHRlcnM7XG5cdH1cblx0c2V0QWxsRmlsdGVyRmllbGRzKGFGaWx0ZXJGaWVsZHM6IGFueSkge1xuXHRcdHRoaXMuYUFsbEZpbHRlckZpZWxkcyA9IGFGaWx0ZXJGaWVsZHM7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IEZpbHRlckNvbnRhaW5lcjtcbiJdLCJtYXBwaW5ncyI6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