/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/mvc/Controller"], function (CommonUtils, ClassSupport, Controller) {
  "use strict";

  var _dec, _dec2, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * Internal base controller class for SAP Fiori elements application.
   *
   * If you want to extend a base controller for your custom page, please use for sap.fe.core.PageController.
   *
   * @hideconstructor
   * @public
   * @since 1.90.0
   */
  let BaseController = (_dec = defineUI5Class("sap.fe.core.BaseController"), _dec2 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_Controller) {
    _inheritsLoose(BaseController, _Controller);
    function BaseController() {
      return _Controller.apply(this, arguments) || this;
    }
    var _proto = BaseController.prototype;
    /**
     * Returns the current app component.
     *
     * @returns The app component or, if not found, null
     * @alias sap.fe.core.BaseController#getAppComponent
     * @public
     * @since 1.91.0
     */
    _proto.getAppComponent = function getAppComponent() {
      if (!this._oAppComponent) {
        this._oAppComponent = CommonUtils.getAppComponent(this.getView());
      }
      return this._oAppComponent;
    }

    /**
     * Convenience method provided by SAP Fiori elements to enable applications to include the view model by name into each controller.
     *
     * @public
     * @param sName The model name
     * @returns The model instance
     */;
    _proto.getModel = function getModel(sName) {
      return this.getView().getModel(sName);
    }

    /**
     * Convenience method for setting the view model in every controller of the application.
     *
     * @public
     * @param oModel The model instance
     * @param sName The model name
     * @returns The view instance
     */;
    _proto.setModel = function setModel(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    };
    _proto.getResourceBundle = function getResourceBundle(sI18nModelName) {
      if (!sI18nModelName) {
        sI18nModelName = "i18n";
      }
      return this.getAppComponent().getModel(sI18nModelName).getResourceBundle();
    };
    return BaseController;
  }(Controller), (_applyDecoratedDescriptor(_class2.prototype, "getAppComponent", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "getAppComponent"), _class2.prototype)), _class2)) || _class);
  return BaseController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNlQ29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwicHVibGljRXh0ZW5zaW9uIiwiZ2V0QXBwQ29tcG9uZW50IiwiX29BcHBDb21wb25lbnQiLCJDb21tb25VdGlscyIsImdldFZpZXciLCJnZXRNb2RlbCIsInNOYW1lIiwic2V0TW9kZWwiLCJvTW9kZWwiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsInNJMThuTW9kZWxOYW1lIiwiQ29udHJvbGxlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQmFzZUNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIFRlbXBsYXRlQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZUNvbXBvbmVudFwiO1xuaW1wb3J0IENvbnRyb2xsZXIgZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL3Jlc291cmNlL1Jlc291cmNlTW9kZWxcIjtcblxuLyoqXG4gKiBJbnRlcm5hbCBiYXNlIGNvbnRyb2xsZXIgY2xhc3MgZm9yIFNBUCBGaW9yaSBlbGVtZW50cyBhcHBsaWNhdGlvbi5cbiAqXG4gKiBJZiB5b3Ugd2FudCB0byBleHRlbmQgYSBiYXNlIGNvbnRyb2xsZXIgZm9yIHlvdXIgY3VzdG9tIHBhZ2UsIHBsZWFzZSB1c2UgZm9yIHNhcC5mZS5jb3JlLlBhZ2VDb250cm9sbGVyLlxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjkwLjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuQmFzZUNvbnRyb2xsZXJcIilcbmNsYXNzIEJhc2VDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlciB7XG5cdHByaXZhdGUgX29BcHBDb21wb25lbnQ/OiBBcHBDb21wb25lbnQ7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGFwcCBjb21wb25lbnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBhcHAgY29tcG9uZW50IG9yLCBpZiBub3QgZm91bmQsIG51bGxcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLkJhc2VDb250cm9sbGVyI2dldEFwcENvbXBvbmVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkxLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRnZXRBcHBDb21wb25lbnQoKTogQXBwQ29tcG9uZW50IHtcblx0XHRpZiAoIXRoaXMuX29BcHBDb21wb25lbnQpIHtcblx0XHRcdHRoaXMuX29BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5nZXRWaWV3KCkpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fb0FwcENvbXBvbmVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZW5pZW5jZSBtZXRob2QgcHJvdmlkZWQgYnkgU0FQIEZpb3JpIGVsZW1lbnRzIHRvIGVuYWJsZSBhcHBsaWNhdGlvbnMgdG8gaW5jbHVkZSB0aGUgdmlldyBtb2RlbCBieSBuYW1lIGludG8gZWFjaCBjb250cm9sbGVyLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSBzTmFtZSBUaGUgbW9kZWwgbmFtZVxuXHQgKiBAcmV0dXJucyBUaGUgbW9kZWwgaW5zdGFuY2Vcblx0ICovXG5cdGdldE1vZGVsKHNOYW1lPzogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKHNOYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZW5pZW5jZSBtZXRob2QgZm9yIHNldHRpbmcgdGhlIHZpZXcgbW9kZWwgaW4gZXZlcnkgY29udHJvbGxlciBvZiB0aGUgYXBwbGljYXRpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgbW9kZWwgaW5zdGFuY2Vcblx0ICogQHBhcmFtIHNOYW1lIFRoZSBtb2RlbCBuYW1lXG5cdCAqIEByZXR1cm5zIFRoZSB2aWV3IGluc3RhbmNlXG5cdCAqL1xuXHRzZXRNb2RlbChvTW9kZWw6IE1vZGVsLCBzTmFtZTogc3RyaW5nKTogVmlldyB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLnNldE1vZGVsKG9Nb2RlbCwgc05hbWUpO1xuXHR9XG5cblx0Z2V0UmVzb3VyY2VCdW5kbGUoc0kxOG5Nb2RlbE5hbWU6IHN0cmluZykge1xuXHRcdGlmICghc0kxOG5Nb2RlbE5hbWUpIHtcblx0XHRcdHNJMThuTW9kZWxOYW1lID0gXCJpMThuXCI7XG5cdFx0fVxuXHRcdHJldHVybiAodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNb2RlbChzSTE4bk1vZGVsTmFtZSkgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKTtcblx0fVxufVxuaW50ZXJmYWNlIEJhc2VDb250cm9sbGVyIHtcblx0Z2V0T3duZXJDb21wb25lbnQoKTogVGVtcGxhdGVDb21wb25lbnQ7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHZpZXcgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29udHJvbGxlci5cblx0ICpcblx0ICogQHJldHVybnMgVmlldyBjb25uZWN0ZWQgdG8gdGhpcyBjb250cm9sbGVyLlxuXHQgKi9cblx0Z2V0VmlldygpOiBWaWV3O1xufVxuZXhwb3J0IGRlZmF1bHQgQmFzZUNvbnRyb2xsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7RUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFSQSxJQVVNQSxjQUFjLFdBRG5CQyxjQUFjLENBQUMsNEJBQTRCLENBQUMsVUFXM0NDLGVBQWUsRUFBRTtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFSbEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQVBDLE9BU0FDLGVBQWUsR0FEZiwyQkFDZ0M7TUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQ0MsY0FBYyxFQUFFO1FBQ3pCLElBQUksQ0FBQ0EsY0FBYyxHQUFHQyxXQUFXLENBQUNGLGVBQWUsQ0FBQyxJQUFJLENBQUNHLE9BQU8sRUFBRSxDQUFDO01BQ2xFO01BQ0EsT0FBTyxJQUFJLENBQUNGLGNBQWM7SUFDM0I7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0FHLFFBQVEsR0FBUixrQkFBU0MsS0FBYyxFQUFFO01BQ3hCLE9BQU8sSUFBSSxDQUFDRixPQUFPLEVBQUUsQ0FBQ0MsUUFBUSxDQUFDQyxLQUFLLENBQUM7SUFDdEM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVBDO0lBQUEsT0FRQUMsUUFBUSxHQUFSLGtCQUFTQyxNQUFhLEVBQUVGLEtBQWEsRUFBUTtNQUM1QyxPQUFPLElBQUksQ0FBQ0YsT0FBTyxFQUFFLENBQUNHLFFBQVEsQ0FBQ0MsTUFBTSxFQUFFRixLQUFLLENBQUM7SUFDOUMsQ0FBQztJQUFBLE9BRURHLGlCQUFpQixHQUFqQiwyQkFBa0JDLGNBQXNCLEVBQUU7TUFDekMsSUFBSSxDQUFDQSxjQUFjLEVBQUU7UUFDcEJBLGNBQWMsR0FBRyxNQUFNO01BQ3hCO01BQ0EsT0FBUSxJQUFJLENBQUNULGVBQWUsRUFBRSxDQUFDSSxRQUFRLENBQUNLLGNBQWMsQ0FBQyxDQUFtQkQsaUJBQWlCLEVBQUU7SUFDOUYsQ0FBQztJQUFBO0VBQUEsRUE5QzJCRSxVQUFVO0VBQUEsT0EwRHhCYixjQUFjO0FBQUEifQ==