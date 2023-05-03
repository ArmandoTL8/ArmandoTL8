/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/Page", "sap/ui/base/ManagedObject", "sap/ui/core/mvc/View", "sap/fe/core/jsx-runtime/jsx"], function (ClassSupport, Page, ManagedObject, View, _jsx) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ViewLoader = (_dec = defineUI5Class("sap.fe.core.jsx-runtime.MDXViewLoader"), _dec2 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_View) {
    _inheritsLoose(ViewLoader, _View);
    function ViewLoader() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _View.call(this, ...args) || this;
      _initializerDefineProperty(_this, "viewName", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = ViewLoader;
    var _proto = ViewLoader.prototype;
    _proto.loadDependency = function loadDependency(name) {
      return new Promise(resolve => {
        sap.ui.require([name], async MDXContent => {
          resolve(MDXContent);
        });
      });
    };
    _proto.getControllerName = function getControllerName() {
      const viewData = this.getViewData();
      return viewData.controllerName;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ;
    _proto.createContent = async function createContent(oController) {
      const viewData = this.getViewData();
      const MDXContent = viewData.viewContent || (await this.loadDependency(viewData._mdxViewName));
      ViewLoader.preprocessorData = this.mPreprocessors.xml;
      ViewLoader.controller = oController;
      const mdxContent = ManagedObject.runWithPreprocessors(() => {
        return MDXContent();
      }, {
        id: sId => {
          return this.createId(sId);
        }
      });
      return _jsx(Page, {
        class: "sapUiContentPadding",
        children: {
          content: mdxContent
        }
      });
    };
    return ViewLoader;
  }(View), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewName", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ViewLoader;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaWV3TG9hZGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJwcm9wZXJ0eSIsInR5cGUiLCJsb2FkRGVwZW5kZW5jeSIsIm5hbWUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNhcCIsInVpIiwicmVxdWlyZSIsIk1EWENvbnRlbnQiLCJnZXRDb250cm9sbGVyTmFtZSIsInZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJjb250cm9sbGVyTmFtZSIsImNyZWF0ZUNvbnRlbnQiLCJvQ29udHJvbGxlciIsInZpZXdDb250ZW50IiwiX21keFZpZXdOYW1lIiwicHJlcHJvY2Vzc29yRGF0YSIsIm1QcmVwcm9jZXNzb3JzIiwieG1sIiwiY29udHJvbGxlciIsIm1keENvbnRlbnQiLCJNYW5hZ2VkT2JqZWN0IiwicnVuV2l0aFByZXByb2Nlc3NvcnMiLCJpZCIsInNJZCIsImNyZWF0ZUlkIiwiY29udGVudCIsIlZpZXciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZpZXdMb2FkZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IFBhZ2UgZnJvbSBcInNhcC9tL1BhZ2VcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5cbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5cbmltcG9ydCBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHsgTWFuYWdlZE9iamVjdEV4IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5qc3gtcnVudGltZS5NRFhWaWV3TG9hZGVyXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3TG9hZGVyIGV4dGVuZHMgVmlldyB7XG5cdHN0YXRpYyBwcmVwcm9jZXNzb3JEYXRhOiBhbnk7XG5cdHN0YXRpYyBjb250cm9sbGVyOiBhbnk7XG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dmlld05hbWUhOiBzdHJpbmc7XG5cblx0bG9hZERlcGVuZGVuY3kobmFtZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHNhcC51aS5yZXF1aXJlKFtuYW1lXSwgYXN5bmMgKE1EWENvbnRlbnQ6IEZ1bmN0aW9uKSA9PiB7XG5cdFx0XHRcdHJlc29sdmUoTURYQ29udGVudCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXHRnZXRDb250cm9sbGVyTmFtZSgpIHtcblx0XHRjb25zdCB2aWV3RGF0YSA9IHRoaXMuZ2V0Vmlld0RhdGEoKSBhcyBhbnk7XG5cdFx0cmV0dXJuIHZpZXdEYXRhLmNvbnRyb2xsZXJOYW1lO1xuXHR9XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0Ly8gQHRzLWlnbm9yZVxuXHRhc3luYyBjcmVhdGVDb250ZW50KG9Db250cm9sbGVyOiBhbnkpOiBQcm9taXNlPENvbnRyb2w+IHtcblx0XHRjb25zdCB2aWV3RGF0YSA9IHRoaXMuZ2V0Vmlld0RhdGEoKSBhcyBhbnk7XG5cdFx0Y29uc3QgTURYQ29udGVudCA9IHZpZXdEYXRhLnZpZXdDb250ZW50IHx8IChhd2FpdCB0aGlzLmxvYWREZXBlbmRlbmN5KHZpZXdEYXRhLl9tZHhWaWV3TmFtZSkpO1xuXHRcdFZpZXdMb2FkZXIucHJlcHJvY2Vzc29yRGF0YSA9ICh0aGlzIGFzIGFueSkubVByZXByb2Nlc3NvcnMueG1sO1xuXHRcdFZpZXdMb2FkZXIuY29udHJvbGxlciA9IG9Db250cm9sbGVyO1xuXHRcdGNvbnN0IG1keENvbnRlbnQgPSAoTWFuYWdlZE9iamVjdCBhcyB1bmtub3duIGFzIE1hbmFnZWRPYmplY3RFeCkucnVuV2l0aFByZXByb2Nlc3NvcnMoXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBNRFhDb250ZW50KCk7XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRpZDogKHNJZDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlSWQoc0lkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdFx0cmV0dXJuIDxQYWdlIGNsYXNzPXtcInNhcFVpQ29udGVudFBhZGRpbmdcIn0+e3sgY29udGVudDogbWR4Q29udGVudCB9fTwvUGFnZT47XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7TUFVcUJBLFVBQVUsV0FEOUJDLGNBQWMsQ0FBQyx1Q0FBdUMsQ0FBQyxVQUl0REMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQztJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBLE9BRzdCQyxjQUFjLEdBQWQsd0JBQWVDLElBQVksRUFBZ0I7TUFDMUMsT0FBTyxJQUFJQyxPQUFPLENBQUVDLE9BQU8sSUFBSztRQUMvQkMsR0FBRyxDQUFDQyxFQUFFLENBQUNDLE9BQU8sQ0FBQyxDQUFDTCxJQUFJLENBQUMsRUFBRSxNQUFPTSxVQUFvQixJQUFLO1VBQ3RESixPQUFPLENBQUNJLFVBQVUsQ0FBQztRQUNwQixDQUFDLENBQUM7TUFDSCxDQUFDLENBQUM7SUFDSCxDQUFDO0lBQUEsT0FDREMsaUJBQWlCLEdBQWpCLDZCQUFvQjtNQUNuQixNQUFNQyxRQUFRLEdBQUcsSUFBSSxDQUFDQyxXQUFXLEVBQVM7TUFDMUMsT0FBT0QsUUFBUSxDQUFDRSxjQUFjO0lBQy9CO0lBQ0E7SUFDQTtJQUFBO0lBQUEsT0FDTUMsYUFBYSxHQUFuQiw2QkFBb0JDLFdBQWdCLEVBQW9CO01BQ3ZELE1BQU1KLFFBQVEsR0FBRyxJQUFJLENBQUNDLFdBQVcsRUFBUztNQUMxQyxNQUFNSCxVQUFVLEdBQUdFLFFBQVEsQ0FBQ0ssV0FBVyxLQUFLLE1BQU0sSUFBSSxDQUFDZCxjQUFjLENBQUNTLFFBQVEsQ0FBQ00sWUFBWSxDQUFDLENBQUM7TUFDN0ZuQixVQUFVLENBQUNvQixnQkFBZ0IsR0FBSSxJQUFJLENBQVNDLGNBQWMsQ0FBQ0MsR0FBRztNQUM5RHRCLFVBQVUsQ0FBQ3VCLFVBQVUsR0FBR04sV0FBVztNQUNuQyxNQUFNTyxVQUFVLEdBQUlDLGFBQWEsQ0FBZ0NDLG9CQUFvQixDQUNwRixNQUFNO1FBQ0wsT0FBT2YsVUFBVSxFQUFFO01BQ3BCLENBQUMsRUFDRDtRQUNDZ0IsRUFBRSxFQUFHQyxHQUFXLElBQUs7VUFDcEIsT0FBTyxJQUFJLENBQUNDLFFBQVEsQ0FBQ0QsR0FBRyxDQUFDO1FBQzFCO01BQ0QsQ0FBQyxDQUNEO01BQ0QsT0FBTyxLQUFDLElBQUk7UUFBQyxLQUFLLEVBQUUscUJBQXNCO1FBQUEsVUFBRTtVQUFFRSxPQUFPLEVBQUVOO1FBQVc7TUFBQyxFQUFRO0lBQzVFLENBQUM7SUFBQTtFQUFBLEVBbkNzQ08sSUFBSTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==