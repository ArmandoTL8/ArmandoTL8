sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/comment", "./v4/comment"], function (_exports, _Theme, _comment, _comment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _comment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _comment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _comment.pathData : _comment2.pathData;
  _exports.pathData = pathData;
  var _default = "comment";
  _exports.default = _default;
});