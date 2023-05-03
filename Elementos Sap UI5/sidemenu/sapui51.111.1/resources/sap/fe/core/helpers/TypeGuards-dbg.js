/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  function isContext(potentialContext) {
    var _isA, _ref;
    return potentialContext === null || potentialContext === void 0 ? void 0 : (_isA = (_ref = potentialContext).isA) === null || _isA === void 0 ? void 0 : _isA.call(_ref, "sap.ui.model.Context");
  }
  _exports.isContext = isContext;
  function isFunctionArray(potentialFunctionArray) {
    return Array.isArray(potentialFunctionArray) && potentialFunctionArray.length > 0 && potentialFunctionArray.every(item => typeof item === "function");
  }
  _exports.isFunctionArray = isFunctionArray;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0NvbnRleHQiLCJwb3RlbnRpYWxDb250ZXh0IiwiaXNBIiwiaXNGdW5jdGlvbkFycmF5IiwicG90ZW50aWFsRnVuY3Rpb25BcnJheSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsImV2ZXJ5IiwiaXRlbSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVHlwZUd1YXJkcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29udGV4dChwb3RlbnRpYWxDb250ZXh0OiBDb250ZXh0IHwgdW5rbm93biB8IHVuZGVmaW5lZCk6IHBvdGVudGlhbENvbnRleHQgaXMgQ29udGV4dCB7XG5cdHJldHVybiAocG90ZW50aWFsQ29udGV4dCBhcyBDb250ZXh0KT8uaXNBPy48Q29udGV4dD4oXCJzYXAudWkubW9kZWwuQ29udGV4dFwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb25BcnJheShwb3RlbnRpYWxGdW5jdGlvbkFycmF5OiBGdW5jdGlvbltdIHwgdW5rbm93bik6IHBvdGVudGlhbEZ1bmN0aW9uQXJyYXkgaXMgRnVuY3Rpb25bXSB7XG5cdHJldHVybiAoXG5cdFx0QXJyYXkuaXNBcnJheShwb3RlbnRpYWxGdW5jdGlvbkFycmF5KSAmJlxuXHRcdHBvdGVudGlhbEZ1bmN0aW9uQXJyYXkubGVuZ3RoID4gMCAmJlxuXHRcdHBvdGVudGlhbEZ1bmN0aW9uQXJyYXkuZXZlcnkoKGl0ZW0pID0+IHR5cGVvZiBpdGVtID09PSBcImZ1bmN0aW9uXCIpXG5cdCk7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBRU8sU0FBU0EsU0FBUyxDQUFDQyxnQkFBK0MsRUFBK0I7SUFBQTtJQUN2RyxPQUFRQSxnQkFBZ0IsYUFBaEJBLGdCQUFnQiwrQkFBakIsUUFBQ0EsZ0JBQWdCLEVBQWNDLEdBQUcseUNBQWxDLGdCQUE4QyxzQkFBc0IsQ0FBQztFQUM3RTtFQUFDO0VBRU0sU0FBU0MsZUFBZSxDQUFDQyxzQkFBNEMsRUFBd0M7SUFDbkgsT0FDQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNGLHNCQUFzQixDQUFDLElBQ3JDQSxzQkFBc0IsQ0FBQ0csTUFBTSxHQUFHLENBQUMsSUFDakNILHNCQUFzQixDQUFDSSxLQUFLLENBQUVDLElBQUksSUFBSyxPQUFPQSxJQUFJLEtBQUssVUFBVSxDQUFDO0VBRXBFO0VBQUM7RUFBQTtBQUFBIn0=