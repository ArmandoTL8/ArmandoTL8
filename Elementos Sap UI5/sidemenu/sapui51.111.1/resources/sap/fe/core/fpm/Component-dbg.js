/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/core/TemplateComponent"], function (ClassSupport, TemplateComponent) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Component that can be used as a wrapper component for custom pages.
   *
   * The component can be used in case you want to use SAP Fiori elements Building Blocks or XML template
   * constructions. You can either extend the component and set the viewName and contextPath within your code
   * or you can use it to wrap your custom XML view directly the manifest when you define your custom page
   * under sapui5/routing/targets:
   *
   * <pre>
   * "myCustomPage": {
   *	"type": "Component",
   *	"id": "myCustomPage",
   *	"name": "sap.fe.core.fpm",
   *	"title": "My Custom Page",
   *	"options": {
   *		"settings": {
   *			"viewName": "myNamespace.myView",
   *			"contextPath": "/MyEntitySet"
   *			}
   *		}
   *	}
   * </pre>
   *
   * @name sap.fe.core.fpm.Component
   * @public
   * @experimental As of version 1.92.0
   * @since 1.92.0
   */
  let FPMComponent = (_dec = defineUI5Class("sap.fe.core.fpm.Component", {
    manifest: "json"
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_TemplateComponent) {
    _inheritsLoose(FPMComponent, _TemplateComponent);
    /**
     * Name of the XML view which is used for this page. The XML view can contain SAP Fiori elements Building Blocks and XML template constructions.
     *
     * @public
     */

    function FPMComponent(mSettings) {
      var _this;
      if (mSettings.viewType === "JSX") {
        mSettings._mdxViewName = mSettings.viewName;
        mSettings.viewName = "module:sap/fe/core/jsx-runtime/ViewLoader";
      }
      _this = _TemplateComponent.call(this, mSettings) || this;
      _initializerDefineProperty(_this, "viewName", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "controllerName", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_mdxViewName", _descriptor3, _assertThisInitialized(_this));
      return _this;
    }
    return FPMComponent;
  }(TemplateComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewName", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "controllerName", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "_mdxViewName", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  return FPMComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGUE1Db21wb25lbnQiLCJkZWZpbmVVSTVDbGFzcyIsIm1hbmlmZXN0IiwicHJvcGVydHkiLCJ0eXBlIiwibVNldHRpbmdzIiwidmlld1R5cGUiLCJfbWR4Vmlld05hbWUiLCJ2aWV3TmFtZSIsIlRlbXBsYXRlQ29tcG9uZW50Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb21wb25lbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IFRlbXBsYXRlQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZUNvbXBvbmVudFwiO1xuXG4vKipcbiAqIENvbXBvbmVudCB0aGF0IGNhbiBiZSB1c2VkIGFzIGEgd3JhcHBlciBjb21wb25lbnQgZm9yIGN1c3RvbSBwYWdlcy5cbiAqXG4gKiBUaGUgY29tcG9uZW50IGNhbiBiZSB1c2VkIGluIGNhc2UgeW91IHdhbnQgdG8gdXNlIFNBUCBGaW9yaSBlbGVtZW50cyBCdWlsZGluZyBCbG9ja3Mgb3IgWE1MIHRlbXBsYXRlXG4gKiBjb25zdHJ1Y3Rpb25zLiBZb3UgY2FuIGVpdGhlciBleHRlbmQgdGhlIGNvbXBvbmVudCBhbmQgc2V0IHRoZSB2aWV3TmFtZSBhbmQgY29udGV4dFBhdGggd2l0aGluIHlvdXIgY29kZVxuICogb3IgeW91IGNhbiB1c2UgaXQgdG8gd3JhcCB5b3VyIGN1c3RvbSBYTUwgdmlldyBkaXJlY3RseSB0aGUgbWFuaWZlc3Qgd2hlbiB5b3UgZGVmaW5lIHlvdXIgY3VzdG9tIHBhZ2VcbiAqIHVuZGVyIHNhcHVpNS9yb3V0aW5nL3RhcmdldHM6XG4gKlxuICogPHByZT5cbiAqIFwibXlDdXN0b21QYWdlXCI6IHtcbiAqXHRcInR5cGVcIjogXCJDb21wb25lbnRcIixcbiAqXHRcImlkXCI6IFwibXlDdXN0b21QYWdlXCIsXG4gKlx0XCJuYW1lXCI6IFwic2FwLmZlLmNvcmUuZnBtXCIsXG4gKlx0XCJ0aXRsZVwiOiBcIk15IEN1c3RvbSBQYWdlXCIsXG4gKlx0XCJvcHRpb25zXCI6IHtcbiAqXHRcdFwic2V0dGluZ3NcIjoge1xuICpcdFx0XHRcInZpZXdOYW1lXCI6IFwibXlOYW1lc3BhY2UubXlWaWV3XCIsXG4gKlx0XHRcdFwiY29udGV4dFBhdGhcIjogXCIvTXlFbnRpdHlTZXRcIlxuICpcdFx0XHR9XG4gKlx0XHR9XG4gKlx0fVxuICogPC9wcmU+XG4gKlxuICogQG5hbWUgc2FwLmZlLmNvcmUuZnBtLkNvbXBvbmVudFxuICogQHB1YmxpY1xuICogQGV4cGVyaW1lbnRhbCBBcyBvZiB2ZXJzaW9uIDEuOTIuMFxuICogQHNpbmNlIDEuOTIuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5mcG0uQ29tcG9uZW50XCIsIHsgbWFuaWZlc3Q6IFwianNvblwiIH0pXG5jbGFzcyBGUE1Db21wb25lbnQgZXh0ZW5kcyBUZW1wbGF0ZUNvbXBvbmVudCB7XG5cdC8qKlxuXHQgKiBOYW1lIG9mIHRoZSBYTUwgdmlldyB3aGljaCBpcyB1c2VkIGZvciB0aGlzIHBhZ2UuIFRoZSBYTUwgdmlldyBjYW4gY29udGFpbiBTQVAgRmlvcmkgZWxlbWVudHMgQnVpbGRpbmcgQmxvY2tzIGFuZCBYTUwgdGVtcGxhdGUgY29uc3RydWN0aW9ucy5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR2aWV3TmFtZSE6IHN0cmluZztcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjb250cm9sbGVyTmFtZT86IHN0cmluZztcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdF9tZHhWaWV3TmFtZSA9IFwiXCI7XG5cblx0Y29uc3RydWN0b3IobVNldHRpbmdzOiBQcm9wZXJ0aWVzT2Y8RlBNQ29tcG9uZW50Pikge1xuXHRcdGlmIChtU2V0dGluZ3Mudmlld1R5cGUgPT09IFwiSlNYXCIpIHtcblx0XHRcdG1TZXR0aW5ncy5fbWR4Vmlld05hbWUgPSBtU2V0dGluZ3Mudmlld05hbWU7XG5cdFx0XHRtU2V0dGluZ3Mudmlld05hbWUgPSBcIm1vZHVsZTpzYXAvZmUvY29yZS9qc3gtcnVudGltZS9WaWV3TG9hZGVyXCI7XG5cdFx0fVxuXHRcdHN1cGVyKG1TZXR0aW5ncyBhcyBhbnkpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZQTUNvbXBvbmVudDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBM0JBLElBNkJNQSxZQUFZLFdBRGpCQyxjQUFjLENBQUMsMkJBQTJCLEVBQUU7SUFBRUMsUUFBUSxFQUFFO0VBQU8sQ0FBQyxDQUFDLFVBT2hFQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDO0lBQUE7SUFWN0I7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7SUFTQyxzQkFBWUMsU0FBcUMsRUFBRTtNQUFBO01BQ2xELElBQUlBLFNBQVMsQ0FBQ0MsUUFBUSxLQUFLLEtBQUssRUFBRTtRQUNqQ0QsU0FBUyxDQUFDRSxZQUFZLEdBQUdGLFNBQVMsQ0FBQ0csUUFBUTtRQUMzQ0gsU0FBUyxDQUFDRyxRQUFRLEdBQUcsMkNBQTJDO01BQ2pFO01BQ0Esc0NBQU1ILFNBQVMsQ0FBUTtNQUFDO01BQUE7TUFBQTtNQUFBO0lBQ3pCO0lBQUM7RUFBQSxFQXBCeUJJLGlCQUFpQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQVk1QixFQUFFO0lBQUE7RUFBQTtFQUFBLE9BV0hULFlBQVk7QUFBQSJ9