/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/controls/filterbar/FilterContainer", "sap/fe/core/controls/filterbar/VisualFilterContainer", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Core", "sap/ui/mdc/FilterBar", "sap/ui/mdc/filterbar/aligned/FilterItemLayout"], function (FilterContainer, VisualFilterContainer, ClassSupport, Core, MdcFilterBar, FilterItemLayout) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FilterBar = (_dec = defineUI5Class("sap.fe.core.controls.FilterBar"), _dec2 = property({
    type: "string",
    defaultValue: "compact"
  }), _dec3 = association({
    type: "sap.m.SegmentedButton",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_MdcFilterBar) {
    _inheritsLoose(FilterBar, _MdcFilterBar);
    function FilterBar() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MdcFilterBar.call(this, ...args) || this;
      _initializerDefineProperty(_this, "initialLayout", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "toggleControl", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FilterBar.prototype;
    _proto.setToggleControl = function setToggleControl(vToggle) {
      if (typeof vToggle === "string") {
        this._oSegmentedButton = Core.byId(vToggle);
      } else {
        this._oSegmentedButton = vToggle;
      }
      if (this.toggleControl && this._oSegmentedButton) {
        this._oSegmentedButton.detachEvent("select", this._toggleLayout.bind(this));
      }
      if (this._oSegmentedButton) {
        this._oSegmentedButton.attachEvent("select", this._toggleLayout.bind(this));
      }
      this.setAssociation("toggleControl", vToggle, true);
    };
    _proto._toggleLayout = function _toggleLayout() {
      // Since primary layout is always compact
      // hence set the secondary layout as visual filter only for the first time only
      if (!this._oSecondaryFilterBarLayout) {
        this._oSecondaryFilterBarLayout = new VisualFilterContainer();
      }

      // do not show Adapt Filters Button for visual layout
      if (this._oSecondaryFilterBarLayout.isA("sap.fe.core.controls.filterbar.VisualFilterContainer")) {
        this.setShowAdaptFiltersButton(false);
      } else {
        this.setShowAdaptFiltersButton(true);
      }

      // get all filter fields and button of the current layout
      const oCurrentFilterBarLayout = this._oFilterBarLayout;
      const oFilterItems = this.getFilterItems();
      const aFilterFields = oCurrentFilterBarLayout.getAllFilterFields();
      const aSortedFilterFields = this.getSortedFilterFields(oFilterItems, aFilterFields);
      const aButtons = oCurrentFilterBarLayout.getAllButtons();
      const aVisualFilterFields = oCurrentFilterBarLayout.getAllVisualFilterFields && oCurrentFilterBarLayout.getAllVisualFilterFields();
      if (this._oSecondaryFilterBarLayout.isA("sap.fe.core.controls.filterbar.VisualFilterContainer")) {
        this._oSecondaryFilterBarLayout.setAllFilterFields(aSortedFilterFields, aVisualFilterFields);
      }
      // use secondary filter bar layout as new layout
      this._oFilterBarLayout = this._oSecondaryFilterBarLayout;

      // insert all filter fields from current layout to new layout
      aFilterFields.forEach((oFilterField, iIndex) => {
        oCurrentFilterBarLayout.removeFilterField(oFilterField);
        this._oFilterBarLayout.insertFilterField(oFilterField, iIndex);
      });
      // insert all buttons from the current layout to the new layout
      aButtons.forEach(oButton => {
        oCurrentFilterBarLayout.removeButton(oButton);
        this._oFilterBarLayout.addButton(oButton);
      });

      // set the current filter bar layout to the secondary one
      this._oSecondaryFilterBarLayout = oCurrentFilterBarLayout;

      // update the layout aggregation of the filter bar and rerender the same.
      this.setAggregation("layout", this._oFilterBarLayout, true);
      this._oFilterBarLayout.rerender();
    };
    _proto.getSortedFilterFields = function getSortedFilterFields(aFilterItems, aFilterFields) {
      const aFilterIds = [];
      aFilterItems.forEach(function (oFilterItem) {
        aFilterIds.push(oFilterItem.getId());
      });
      aFilterFields.sort(function (aFirstItem, aSecondItem) {
        let sFirstItemVFId, sSecondItemVFId;
        aFirstItem.getContent().forEach(function (oInnerControl) {
          if (oInnerControl.isA("sap.ui.mdc.FilterField")) {
            sFirstItemVFId = oInnerControl.getId();
          }
        });
        aSecondItem.getContent().forEach(function (oInnerControl) {
          if (oInnerControl.isA("sap.ui.mdc.FilterField")) {
            sSecondItemVFId = oInnerControl.getId();
          }
        });
        return aFilterIds.indexOf(sFirstItemVFId) - aFilterIds.indexOf(sSecondItemVFId);
      });
      return aFilterFields;
    };
    _proto._createInnerLayout = function _createInnerLayout() {
      this._oFilterBarLayout = new FilterContainer();
      this._cLayoutItem = FilterItemLayout;
      this._oFilterBarLayout.getInner().addStyleClass("sapUiMdcFilterBarBaseAFLayout");
      this._addButtons();

      // TODO: Check with MDC if there is a better way to load visual filter on the basis of control property
      // _createInnerLayout is called on Init by the filter bar base.
      // This mean that we do not have access to the control properties yet
      // and hence we cannot decide on the basis of control properties whether initial layout should be compact or visual
      // As a result we have to do this workaround to always load the compact layout by default
      // And toogle the same in case the initialLayout was supposed to be visual filters.
      const oInnerLayout = this._oFilterBarLayout.getInner();
      const oFilterContainerInnerLayoutEventDelegate = {
        onBeforeRendering: () => {
          if (this.initialLayout === "visual") {
            this._toggleLayout();
          }
          oInnerLayout.removeEventDelegate(oFilterContainerInnerLayoutEventDelegate);
        }
      };
      oInnerLayout.addEventDelegate(oFilterContainerInnerLayoutEventDelegate);
      this.setAggregation("layout", this._oFilterBarLayout, true);
    };
    _proto.exit = function exit() {
      _MdcFilterBar.prototype.exit.call(this);
      // Sometimes upon external navigation this._SegmentedButton is already destroyed
      // so check if it exists and then only remove stuff
      if (this._oSegmentedButton) {
        this._oSegmentedButton.detachEvent("select", this._toggleLayout);
        delete this._oSegmentedButton;
      }
    };
    _proto.getSegmentedButton = function getSegmentedButton() {
      return this._oSegmentedButton;
    };
    return FilterBar;
  }(MdcFilterBar), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "initialLayout", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "toggleControl", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FilterBar;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJCYXIiLCJkZWZpbmVVSTVDbGFzcyIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzZXRUb2dnbGVDb250cm9sIiwidlRvZ2dsZSIsIl9vU2VnbWVudGVkQnV0dG9uIiwiQ29yZSIsImJ5SWQiLCJ0b2dnbGVDb250cm9sIiwiZGV0YWNoRXZlbnQiLCJfdG9nZ2xlTGF5b3V0IiwiYmluZCIsImF0dGFjaEV2ZW50Iiwic2V0QXNzb2NpYXRpb24iLCJfb1NlY29uZGFyeUZpbHRlckJhckxheW91dCIsIlZpc3VhbEZpbHRlckNvbnRhaW5lciIsImlzQSIsInNldFNob3dBZGFwdEZpbHRlcnNCdXR0b24iLCJvQ3VycmVudEZpbHRlckJhckxheW91dCIsIl9vRmlsdGVyQmFyTGF5b3V0Iiwib0ZpbHRlckl0ZW1zIiwiZ2V0RmlsdGVySXRlbXMiLCJhRmlsdGVyRmllbGRzIiwiZ2V0QWxsRmlsdGVyRmllbGRzIiwiYVNvcnRlZEZpbHRlckZpZWxkcyIsImdldFNvcnRlZEZpbHRlckZpZWxkcyIsImFCdXR0b25zIiwiZ2V0QWxsQnV0dG9ucyIsImFWaXN1YWxGaWx0ZXJGaWVsZHMiLCJnZXRBbGxWaXN1YWxGaWx0ZXJGaWVsZHMiLCJzZXRBbGxGaWx0ZXJGaWVsZHMiLCJmb3JFYWNoIiwib0ZpbHRlckZpZWxkIiwiaUluZGV4IiwicmVtb3ZlRmlsdGVyRmllbGQiLCJpbnNlcnRGaWx0ZXJGaWVsZCIsIm9CdXR0b24iLCJyZW1vdmVCdXR0b24iLCJhZGRCdXR0b24iLCJzZXRBZ2dyZWdhdGlvbiIsInJlcmVuZGVyIiwiYUZpbHRlckl0ZW1zIiwiYUZpbHRlcklkcyIsIm9GaWx0ZXJJdGVtIiwicHVzaCIsImdldElkIiwic29ydCIsImFGaXJzdEl0ZW0iLCJhU2Vjb25kSXRlbSIsInNGaXJzdEl0ZW1WRklkIiwic1NlY29uZEl0ZW1WRklkIiwiZ2V0Q29udGVudCIsIm9Jbm5lckNvbnRyb2wiLCJpbmRleE9mIiwiX2NyZWF0ZUlubmVyTGF5b3V0IiwiRmlsdGVyQ29udGFpbmVyIiwiX2NMYXlvdXRJdGVtIiwiRmlsdGVySXRlbUxheW91dCIsImdldElubmVyIiwiYWRkU3R5bGVDbGFzcyIsIl9hZGRCdXR0b25zIiwib0lubmVyTGF5b3V0Iiwib0ZpbHRlckNvbnRhaW5lcklubmVyTGF5b3V0RXZlbnREZWxlZ2F0ZSIsIm9uQmVmb3JlUmVuZGVyaW5nIiwiaW5pdGlhbExheW91dCIsInJlbW92ZUV2ZW50RGVsZWdhdGUiLCJhZGRFdmVudERlbGVnYXRlIiwiZXhpdCIsImdldFNlZ21lbnRlZEJ1dHRvbiIsIk1kY0ZpbHRlckJhciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBGaWx0ZXJDb250YWluZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL2ZpbHRlcmJhci9GaWx0ZXJDb250YWluZXJcIjtcbmltcG9ydCBWaXN1YWxGaWx0ZXJDb250YWluZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL2ZpbHRlcmJhci9WaXN1YWxGaWx0ZXJDb250YWluZXJcIjtcbmltcG9ydCB7IGFzc29jaWF0aW9uLCBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIFNlZ21lbnRlZEJ1dHRvbiBmcm9tIFwic2FwL20vU2VnbWVudGVkQnV0dG9uXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IE1kY0ZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCBGaWx0ZXJJdGVtTGF5b3V0IGZyb20gXCJzYXAvdWkvbWRjL2ZpbHRlcmJhci9hbGlnbmVkL0ZpbHRlckl0ZW1MYXlvdXRcIjtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbHRlckJhclwiKVxuY2xhc3MgRmlsdGVyQmFyIGV4dGVuZHMgTWRjRmlsdGVyQmFyIHtcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcImNvbXBhY3RcIiB9KVxuXHRpbml0aWFsTGF5b3V0ITogc3RyaW5nO1xuXHQvKipcblx0ICogQ29udHJvbCB3aGljaCBhbGxvd3MgZm9yIHN3aXRjaGluZyBiZXR3ZWVuIHZpc3VhbCBhbmQgbm9ybWFsIGZpbHRlciBsYXlvdXRzXG5cdCAqL1xuXHRAYXNzb2NpYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLm0uU2VnbWVudGVkQnV0dG9uXCIsXG5cdFx0bXVsdGlwbGU6IGZhbHNlXG5cdH0pXG5cdHRvZ2dsZUNvbnRyb2whOiBTZWdtZW50ZWRCdXR0b247XG5cdHByaXZhdGUgX29TZWdtZW50ZWRCdXR0b24/OiBTZWdtZW50ZWRCdXR0b247XG5cdHByaXZhdGUgX29TZWNvbmRhcnlGaWx0ZXJCYXJMYXlvdXQ6IGFueTtcblx0cHJpdmF0ZSBfb0ZpbHRlckJhckxheW91dDogYW55O1xuXHRwcml2YXRlIF9jTGF5b3V0SXRlbTogYW55O1xuXG5cdHNldFRvZ2dsZUNvbnRyb2wodlRvZ2dsZTogc3RyaW5nIHwgU2VnbWVudGVkQnV0dG9uKSB7XG5cdFx0aWYgKHR5cGVvZiB2VG9nZ2xlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aGlzLl9vU2VnbWVudGVkQnV0dG9uID0gQ29yZS5ieUlkKHZUb2dnbGUpIGFzIFNlZ21lbnRlZEJ1dHRvbjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fb1NlZ21lbnRlZEJ1dHRvbiA9IHZUb2dnbGU7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMudG9nZ2xlQ29udHJvbCAmJiB0aGlzLl9vU2VnbWVudGVkQnV0dG9uKSB7XG5cdFx0XHR0aGlzLl9vU2VnbWVudGVkQnV0dG9uLmRldGFjaEV2ZW50KFwic2VsZWN0XCIsIHRoaXMuX3RvZ2dsZUxheW91dC5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuX29TZWdtZW50ZWRCdXR0b24pIHtcblx0XHRcdHRoaXMuX29TZWdtZW50ZWRCdXR0b24uYXR0YWNoRXZlbnQoXCJzZWxlY3RcIiwgdGhpcy5fdG9nZ2xlTGF5b3V0LmJpbmQodGhpcykpO1xuXHRcdH1cblx0XHR0aGlzLnNldEFzc29jaWF0aW9uKFwidG9nZ2xlQ29udHJvbFwiLCB2VG9nZ2xlLCB0cnVlKTtcblx0fVxuXG5cdF90b2dnbGVMYXlvdXQoKSB7XG5cdFx0Ly8gU2luY2UgcHJpbWFyeSBsYXlvdXQgaXMgYWx3YXlzIGNvbXBhY3Rcblx0XHQvLyBoZW5jZSBzZXQgdGhlIHNlY29uZGFyeSBsYXlvdXQgYXMgdmlzdWFsIGZpbHRlciBvbmx5IGZvciB0aGUgZmlyc3QgdGltZSBvbmx5XG5cdFx0aWYgKCF0aGlzLl9vU2Vjb25kYXJ5RmlsdGVyQmFyTGF5b3V0KSB7XG5cdFx0XHR0aGlzLl9vU2Vjb25kYXJ5RmlsdGVyQmFyTGF5b3V0ID0gbmV3IFZpc3VhbEZpbHRlckNvbnRhaW5lcigpO1xuXHRcdH1cblxuXHRcdC8vIGRvIG5vdCBzaG93IEFkYXB0IEZpbHRlcnMgQnV0dG9uIGZvciB2aXN1YWwgbGF5b3V0XG5cdFx0aWYgKHRoaXMuX29TZWNvbmRhcnlGaWx0ZXJCYXJMYXlvdXQuaXNBKFwic2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLlZpc3VhbEZpbHRlckNvbnRhaW5lclwiKSkge1xuXHRcdFx0dGhpcy5zZXRTaG93QWRhcHRGaWx0ZXJzQnV0dG9uKGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZXRTaG93QWRhcHRGaWx0ZXJzQnV0dG9uKHRydWUpO1xuXHRcdH1cblxuXHRcdC8vIGdldCBhbGwgZmlsdGVyIGZpZWxkcyBhbmQgYnV0dG9uIG9mIHRoZSBjdXJyZW50IGxheW91dFxuXHRcdGNvbnN0IG9DdXJyZW50RmlsdGVyQmFyTGF5b3V0ID0gdGhpcy5fb0ZpbHRlckJhckxheW91dDtcblx0XHRjb25zdCBvRmlsdGVySXRlbXMgPSB0aGlzLmdldEZpbHRlckl0ZW1zKCk7XG5cdFx0Y29uc3QgYUZpbHRlckZpZWxkcyA9IG9DdXJyZW50RmlsdGVyQmFyTGF5b3V0LmdldEFsbEZpbHRlckZpZWxkcygpO1xuXHRcdGNvbnN0IGFTb3J0ZWRGaWx0ZXJGaWVsZHMgPSB0aGlzLmdldFNvcnRlZEZpbHRlckZpZWxkcyhvRmlsdGVySXRlbXMsIGFGaWx0ZXJGaWVsZHMpO1xuXHRcdGNvbnN0IGFCdXR0b25zID0gb0N1cnJlbnRGaWx0ZXJCYXJMYXlvdXQuZ2V0QWxsQnV0dG9ucygpO1xuXHRcdGNvbnN0IGFWaXN1YWxGaWx0ZXJGaWVsZHMgPSBvQ3VycmVudEZpbHRlckJhckxheW91dC5nZXRBbGxWaXN1YWxGaWx0ZXJGaWVsZHMgJiYgb0N1cnJlbnRGaWx0ZXJCYXJMYXlvdXQuZ2V0QWxsVmlzdWFsRmlsdGVyRmllbGRzKCk7XG5cdFx0aWYgKHRoaXMuX29TZWNvbmRhcnlGaWx0ZXJCYXJMYXlvdXQuaXNBKFwic2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLlZpc3VhbEZpbHRlckNvbnRhaW5lclwiKSkge1xuXHRcdFx0dGhpcy5fb1NlY29uZGFyeUZpbHRlckJhckxheW91dC5zZXRBbGxGaWx0ZXJGaWVsZHMoYVNvcnRlZEZpbHRlckZpZWxkcywgYVZpc3VhbEZpbHRlckZpZWxkcyk7XG5cdFx0fVxuXHRcdC8vIHVzZSBzZWNvbmRhcnkgZmlsdGVyIGJhciBsYXlvdXQgYXMgbmV3IGxheW91dFxuXHRcdHRoaXMuX29GaWx0ZXJCYXJMYXlvdXQgPSB0aGlzLl9vU2Vjb25kYXJ5RmlsdGVyQmFyTGF5b3V0O1xuXG5cdFx0Ly8gaW5zZXJ0IGFsbCBmaWx0ZXIgZmllbGRzIGZyb20gY3VycmVudCBsYXlvdXQgdG8gbmV3IGxheW91dFxuXHRcdGFGaWx0ZXJGaWVsZHMuZm9yRWFjaCgob0ZpbHRlckZpZWxkOiBhbnksIGlJbmRleDogYW55KSA9PiB7XG5cdFx0XHRvQ3VycmVudEZpbHRlckJhckxheW91dC5yZW1vdmVGaWx0ZXJGaWVsZChvRmlsdGVyRmllbGQpO1xuXHRcdFx0dGhpcy5fb0ZpbHRlckJhckxheW91dC5pbnNlcnRGaWx0ZXJGaWVsZChvRmlsdGVyRmllbGQsIGlJbmRleCk7XG5cdFx0fSk7XG5cdFx0Ly8gaW5zZXJ0IGFsbCBidXR0b25zIGZyb20gdGhlIGN1cnJlbnQgbGF5b3V0IHRvIHRoZSBuZXcgbGF5b3V0XG5cdFx0YUJ1dHRvbnMuZm9yRWFjaCgob0J1dHRvbjogYW55KSA9PiB7XG5cdFx0XHRvQ3VycmVudEZpbHRlckJhckxheW91dC5yZW1vdmVCdXR0b24ob0J1dHRvbik7XG5cdFx0XHR0aGlzLl9vRmlsdGVyQmFyTGF5b3V0LmFkZEJ1dHRvbihvQnV0dG9uKTtcblx0XHR9KTtcblxuXHRcdC8vIHNldCB0aGUgY3VycmVudCBmaWx0ZXIgYmFyIGxheW91dCB0byB0aGUgc2Vjb25kYXJ5IG9uZVxuXHRcdHRoaXMuX29TZWNvbmRhcnlGaWx0ZXJCYXJMYXlvdXQgPSBvQ3VycmVudEZpbHRlckJhckxheW91dDtcblxuXHRcdC8vIHVwZGF0ZSB0aGUgbGF5b3V0IGFnZ3JlZ2F0aW9uIG9mIHRoZSBmaWx0ZXIgYmFyIGFuZCByZXJlbmRlciB0aGUgc2FtZS5cblx0XHR0aGlzLnNldEFnZ3JlZ2F0aW9uKFwibGF5b3V0XCIsIHRoaXMuX29GaWx0ZXJCYXJMYXlvdXQsIHRydWUpO1xuXHRcdHRoaXMuX29GaWx0ZXJCYXJMYXlvdXQucmVyZW5kZXIoKTtcblx0fVxuXG5cdGdldFNvcnRlZEZpbHRlckZpZWxkcyhhRmlsdGVySXRlbXM6IGFueSwgYUZpbHRlckZpZWxkczogYW55KSB7XG5cdFx0Y29uc3QgYUZpbHRlcklkczogYW55W10gPSBbXTtcblx0XHRhRmlsdGVySXRlbXMuZm9yRWFjaChmdW5jdGlvbiAob0ZpbHRlckl0ZW06IGFueSkge1xuXHRcdFx0YUZpbHRlcklkcy5wdXNoKG9GaWx0ZXJJdGVtLmdldElkKCkpO1xuXHRcdH0pO1xuXHRcdGFGaWx0ZXJGaWVsZHMuc29ydChmdW5jdGlvbiAoYUZpcnN0SXRlbTogYW55LCBhU2Vjb25kSXRlbTogYW55KSB7XG5cdFx0XHRsZXQgc0ZpcnN0SXRlbVZGSWQsIHNTZWNvbmRJdGVtVkZJZDtcblx0XHRcdGFGaXJzdEl0ZW0uZ2V0Q29udGVudCgpLmZvckVhY2goZnVuY3Rpb24gKG9Jbm5lckNvbnRyb2w6IGFueSkge1xuXHRcdFx0XHRpZiAob0lubmVyQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpKSB7XG5cdFx0XHRcdFx0c0ZpcnN0SXRlbVZGSWQgPSBvSW5uZXJDb250cm9sLmdldElkKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0YVNlY29uZEl0ZW0uZ2V0Q29udGVudCgpLmZvckVhY2goZnVuY3Rpb24gKG9Jbm5lckNvbnRyb2w6IGFueSkge1xuXHRcdFx0XHRpZiAob0lubmVyQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpKSB7XG5cdFx0XHRcdFx0c1NlY29uZEl0ZW1WRklkID0gb0lubmVyQ29udHJvbC5nZXRJZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhRmlsdGVySWRzLmluZGV4T2Yoc0ZpcnN0SXRlbVZGSWQpIC0gYUZpbHRlcklkcy5pbmRleE9mKHNTZWNvbmRJdGVtVkZJZCk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFGaWx0ZXJGaWVsZHM7XG5cdH1cblxuXHRfY3JlYXRlSW5uZXJMYXlvdXQoKSB7XG5cdFx0dGhpcy5fb0ZpbHRlckJhckxheW91dCA9IG5ldyBGaWx0ZXJDb250YWluZXIoKTtcblx0XHR0aGlzLl9jTGF5b3V0SXRlbSA9IEZpbHRlckl0ZW1MYXlvdXQ7XG5cdFx0dGhpcy5fb0ZpbHRlckJhckxheW91dC5nZXRJbm5lcigpLmFkZFN0eWxlQ2xhc3MoXCJzYXBVaU1kY0ZpbHRlckJhckJhc2VBRkxheW91dFwiKTtcblx0XHR0aGlzLl9hZGRCdXR0b25zKCk7XG5cblx0XHQvLyBUT0RPOiBDaGVjayB3aXRoIE1EQyBpZiB0aGVyZSBpcyBhIGJldHRlciB3YXkgdG8gbG9hZCB2aXN1YWwgZmlsdGVyIG9uIHRoZSBiYXNpcyBvZiBjb250cm9sIHByb3BlcnR5XG5cdFx0Ly8gX2NyZWF0ZUlubmVyTGF5b3V0IGlzIGNhbGxlZCBvbiBJbml0IGJ5IHRoZSBmaWx0ZXIgYmFyIGJhc2UuXG5cdFx0Ly8gVGhpcyBtZWFuIHRoYXQgd2UgZG8gbm90IGhhdmUgYWNjZXNzIHRvIHRoZSBjb250cm9sIHByb3BlcnRpZXMgeWV0XG5cdFx0Ly8gYW5kIGhlbmNlIHdlIGNhbm5vdCBkZWNpZGUgb24gdGhlIGJhc2lzIG9mIGNvbnRyb2wgcHJvcGVydGllcyB3aGV0aGVyIGluaXRpYWwgbGF5b3V0IHNob3VsZCBiZSBjb21wYWN0IG9yIHZpc3VhbFxuXHRcdC8vIEFzIGEgcmVzdWx0IHdlIGhhdmUgdG8gZG8gdGhpcyB3b3JrYXJvdW5kIHRvIGFsd2F5cyBsb2FkIHRoZSBjb21wYWN0IGxheW91dCBieSBkZWZhdWx0XG5cdFx0Ly8gQW5kIHRvb2dsZSB0aGUgc2FtZSBpbiBjYXNlIHRoZSBpbml0aWFsTGF5b3V0IHdhcyBzdXBwb3NlZCB0byBiZSB2aXN1YWwgZmlsdGVycy5cblx0XHRjb25zdCBvSW5uZXJMYXlvdXQgPSB0aGlzLl9vRmlsdGVyQmFyTGF5b3V0LmdldElubmVyKCk7XG5cdFx0Y29uc3Qgb0ZpbHRlckNvbnRhaW5lcklubmVyTGF5b3V0RXZlbnREZWxlZ2F0ZSA9IHtcblx0XHRcdG9uQmVmb3JlUmVuZGVyaW5nOiAoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLmluaXRpYWxMYXlvdXQgPT09IFwidmlzdWFsXCIpIHtcblx0XHRcdFx0XHR0aGlzLl90b2dnbGVMYXlvdXQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvSW5uZXJMYXlvdXQucmVtb3ZlRXZlbnREZWxlZ2F0ZShvRmlsdGVyQ29udGFpbmVySW5uZXJMYXlvdXRFdmVudERlbGVnYXRlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdG9Jbm5lckxheW91dC5hZGRFdmVudERlbGVnYXRlKG9GaWx0ZXJDb250YWluZXJJbm5lckxheW91dEV2ZW50RGVsZWdhdGUpO1xuXG5cdFx0dGhpcy5zZXRBZ2dyZWdhdGlvbihcImxheW91dFwiLCB0aGlzLl9vRmlsdGVyQmFyTGF5b3V0LCB0cnVlKTtcblx0fVxuXG5cdGV4aXQoKSB7XG5cdFx0c3VwZXIuZXhpdCgpO1xuXHRcdC8vIFNvbWV0aW1lcyB1cG9uIGV4dGVybmFsIG5hdmlnYXRpb24gdGhpcy5fU2VnbWVudGVkQnV0dG9uIGlzIGFscmVhZHkgZGVzdHJveWVkXG5cdFx0Ly8gc28gY2hlY2sgaWYgaXQgZXhpc3RzIGFuZCB0aGVuIG9ubHkgcmVtb3ZlIHN0dWZmXG5cdFx0aWYgKHRoaXMuX29TZWdtZW50ZWRCdXR0b24pIHtcblx0XHRcdHRoaXMuX29TZWdtZW50ZWRCdXR0b24uZGV0YWNoRXZlbnQoXCJzZWxlY3RcIiwgdGhpcy5fdG9nZ2xlTGF5b3V0KTtcblx0XHRcdGRlbGV0ZSB0aGlzLl9vU2VnbWVudGVkQnV0dG9uO1xuXHRcdH1cblx0fVxuXG5cdGdldFNlZ21lbnRlZEJ1dHRvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fb1NlZ21lbnRlZEJ1dHRvbjtcblx0fVxufVxuaW50ZXJmYWNlIEZpbHRlckJhciB7XG5cdF9hZGRCdXR0b25zKCk6IGFueTtcbn1cbmV4cG9ydCBkZWZhdWx0IEZpbHRlckJhcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7TUFRTUEsU0FBUyxXQURkQyxjQUFjLENBQUMsZ0NBQWdDLENBQUMsVUFFL0NDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxZQUFZLEVBQUU7RUFBVSxDQUFDLENBQUMsVUFLckRDLFdBQVcsQ0FBQztJQUNaRixJQUFJLEVBQUUsdUJBQXVCO0lBQzdCRyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQU9GQyxnQkFBZ0Is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