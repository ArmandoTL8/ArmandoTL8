/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/ui/model/json/JSONModel"], function (Log, ObjectPath, JSONModel) {
  "use strict";

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Special JSONModel that is used to store the attribute model for the building block.
   * It has specific handling for undefinedValue mapping
   */
  let AttributeModel = /*#__PURE__*/function (_JSONModel) {
    _inheritsLoose(AttributeModel, _JSONModel);
    function AttributeModel(oNode, oProps, buildingBlockDefinition) {
      var _this;
      _this = _JSONModel.call(this) || this;
      _this.oNode = oNode;
      _this.oProps = oProps;
      _this.buildingBlockDefinition = buildingBlockDefinition;
      _this.$$valueAsPromise = true;
      return _this;
    }
    var _proto = AttributeModel.prototype;
    _proto._getObject = function _getObject(sPath, oContext) {
      if (sPath === undefined || sPath === "") {
        if (oContext !== undefined && oContext.getPath() !== "/") {
          return this._getObject(oContext.getPath(sPath));
        }
        return this.oProps;
      }
      if (sPath === "/undefinedValue" || sPath === "undefinedValue") {
        return undefined;
      }
      // just return the attribute - we can't validate them, and we don't support aggregations for now
      const oValue = ObjectPath.get(sPath.replace(/\//g, "."), this.oProps);
      if (oValue !== undefined) {
        return oValue;
      }
      // Deal with undefined properties
      if (this.oProps.hasOwnProperty(sPath)) {
        return this.oProps[sPath];
      }
      if (sPath.indexOf(":") === -1 && sPath.indexOf("/") === -1) {
        // Gloves are off, if you have this error you forgot to define your property on your metadata but are still using it in the underlying code
        Log.error(`Missing property ${sPath} on building block metadata ${this.buildingBlockDefinition.name}`);
        //throw new Error(`Missing property ${sPath} on macro metadata ${this.buildingBlockDefinition.name}`);
      }

      return this.oNode.getAttribute(sPath);
    };
    return AttributeModel;
  }(JSONModel);
  return AttributeModel;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdHRyaWJ1dGVNb2RlbCIsIm9Ob2RlIiwib1Byb3BzIiwiYnVpbGRpbmdCbG9ja0RlZmluaXRpb24iLCIkJHZhbHVlQXNQcm9taXNlIiwiX2dldE9iamVjdCIsInNQYXRoIiwib0NvbnRleHQiLCJ1bmRlZmluZWQiLCJnZXRQYXRoIiwib1ZhbHVlIiwiT2JqZWN0UGF0aCIsImdldCIsInJlcGxhY2UiLCJoYXNPd25Qcm9wZXJ0eSIsImluZGV4T2YiLCJMb2ciLCJlcnJvciIsIm5hbWUiLCJnZXRBdHRyaWJ1dGUiLCJKU09OTW9kZWwiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkF0dHJpYnV0ZU1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IE9iamVjdFBhdGggZnJvbSBcInNhcC9iYXNlL3V0aWwvT2JqZWN0UGF0aFwiO1xuaW1wb3J0IHR5cGUgeyBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5cbi8qKlxuICogU3BlY2lhbCBKU09OTW9kZWwgdGhhdCBpcyB1c2VkIHRvIHN0b3JlIHRoZSBhdHRyaWJ1dGUgbW9kZWwgZm9yIHRoZSBidWlsZGluZyBibG9jay5cbiAqIEl0IGhhcyBzcGVjaWZpYyBoYW5kbGluZyBmb3IgdW5kZWZpbmVkVmFsdWUgbWFwcGluZ1xuICovXG5jbGFzcyBBdHRyaWJ1dGVNb2RlbCBleHRlbmRzIEpTT05Nb2RlbCB7XG5cdHB1YmxpYyAkJHZhbHVlQXNQcm9taXNlOiBib29sZWFuO1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IG9Ob2RlOiBFbGVtZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgb1Byb3BzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uOiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblxuXHQpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuJCR2YWx1ZUFzUHJvbWlzZSA9IHRydWU7XG5cdH1cblx0X2dldE9iamVjdChzUGF0aDogc3RyaW5nLCBvQ29udGV4dD86IENvbnRleHQpOiB1bmtub3duIHtcblx0XHRpZiAoc1BhdGggPT09IHVuZGVmaW5lZCB8fCBzUGF0aCA9PT0gXCJcIikge1xuXHRcdFx0aWYgKG9Db250ZXh0ICE9PSB1bmRlZmluZWQgJiYgb0NvbnRleHQuZ2V0UGF0aCgpICE9PSBcIi9cIikge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fZ2V0T2JqZWN0KG9Db250ZXh0LmdldFBhdGgoc1BhdGgpKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLm9Qcm9wcztcblx0XHR9XG5cdFx0aWYgKHNQYXRoID09PSBcIi91bmRlZmluZWRWYWx1ZVwiIHx8IHNQYXRoID09PSBcInVuZGVmaW5lZFZhbHVlXCIpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdC8vIGp1c3QgcmV0dXJuIHRoZSBhdHRyaWJ1dGUgLSB3ZSBjYW4ndCB2YWxpZGF0ZSB0aGVtLCBhbmQgd2UgZG9uJ3Qgc3VwcG9ydCBhZ2dyZWdhdGlvbnMgZm9yIG5vd1xuXHRcdGNvbnN0IG9WYWx1ZSA9IE9iamVjdFBhdGguZ2V0KHNQYXRoLnJlcGxhY2UoL1xcLy9nLCBcIi5cIiksIHRoaXMub1Byb3BzKTtcblx0XHRpZiAob1ZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBvVmFsdWU7XG5cdFx0fVxuXHRcdC8vIERlYWwgd2l0aCB1bmRlZmluZWQgcHJvcGVydGllc1xuXHRcdGlmICh0aGlzLm9Qcm9wcy5oYXNPd25Qcm9wZXJ0eShzUGF0aCkpIHtcblx0XHRcdHJldHVybiB0aGlzLm9Qcm9wc1tzUGF0aF07XG5cdFx0fVxuXHRcdGlmIChzUGF0aC5pbmRleE9mKFwiOlwiKSA9PT0gLTEgJiYgc1BhdGguaW5kZXhPZihcIi9cIikgPT09IC0xKSB7XG5cdFx0XHQvLyBHbG92ZXMgYXJlIG9mZiwgaWYgeW91IGhhdmUgdGhpcyBlcnJvciB5b3UgZm9yZ290IHRvIGRlZmluZSB5b3VyIHByb3BlcnR5IG9uIHlvdXIgbWV0YWRhdGEgYnV0IGFyZSBzdGlsbCB1c2luZyBpdCBpbiB0aGUgdW5kZXJseWluZyBjb2RlXG5cdFx0XHRMb2cuZXJyb3IoYE1pc3NpbmcgcHJvcGVydHkgJHtzUGF0aH0gb24gYnVpbGRpbmcgYmxvY2sgbWV0YWRhdGEgJHt0aGlzLmJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWV9YCk7XG5cdFx0XHQvL3Rocm93IG5ldyBFcnJvcihgTWlzc2luZyBwcm9wZXJ0eSAke3NQYXRofSBvbiBtYWNybyBtZXRhZGF0YSAke3RoaXMuYnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZX1gKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMub05vZGUuZ2V0QXR0cmlidXRlKHNQYXRoKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBBdHRyaWJ1dGVNb2RlbDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBTUE7QUFDQTtBQUNBO0FBQ0E7RUFIQSxJQUlNQSxjQUFjO0lBQUE7SUFFbkIsd0JBQ2tCQyxLQUFjLEVBQ2RDLE1BQStCLEVBQy9CQyx1QkFBZ0QsRUFDaEU7TUFBQTtNQUNELDZCQUFPO01BQUMsTUFKU0YsS0FBYyxHQUFkQSxLQUFjO01BQUEsTUFDZEMsTUFBK0IsR0FBL0JBLE1BQStCO01BQUEsTUFDL0JDLHVCQUFnRCxHQUFoREEsdUJBQWdEO01BR2pFLE1BQUtDLGdCQUFnQixHQUFHLElBQUk7TUFBQztJQUM5QjtJQUFDO0lBQUEsT0FDREMsVUFBVSxHQUFWLG9CQUFXQyxLQUFhLEVBQUVDLFFBQWtCLEVBQVc7TUFDdEQsSUFBSUQsS0FBSyxLQUFLRSxTQUFTLElBQUlGLEtBQUssS0FBSyxFQUFFLEVBQUU7UUFDeEMsSUFBSUMsUUFBUSxLQUFLQyxTQUFTLElBQUlELFFBQVEsQ0FBQ0UsT0FBTyxFQUFFLEtBQUssR0FBRyxFQUFFO1VBQ3pELE9BQU8sSUFBSSxDQUFDSixVQUFVLENBQUNFLFFBQVEsQ0FBQ0UsT0FBTyxDQUFDSCxLQUFLLENBQUMsQ0FBQztRQUNoRDtRQUNBLE9BQU8sSUFBSSxDQUFDSixNQUFNO01BQ25CO01BQ0EsSUFBSUksS0FBSyxLQUFLLGlCQUFpQixJQUFJQSxLQUFLLEtBQUssZ0JBQWdCLEVBQUU7UUFDOUQsT0FBT0UsU0FBUztNQUNqQjtNQUNBO01BQ0EsTUFBTUUsTUFBTSxHQUFHQyxVQUFVLENBQUNDLEdBQUcsQ0FBQ04sS0FBSyxDQUFDTyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQ1gsTUFBTSxDQUFDO01BQ3JFLElBQUlRLE1BQU0sS0FBS0YsU0FBUyxFQUFFO1FBQ3pCLE9BQU9FLE1BQU07TUFDZDtNQUNBO01BQ0EsSUFBSSxJQUFJLENBQUNSLE1BQU0sQ0FBQ1ksY0FBYyxDQUFDUixLQUFLLENBQUMsRUFBRTtRQUN0QyxPQUFPLElBQUksQ0FBQ0osTUFBTSxDQUFDSSxLQUFLLENBQUM7TUFDMUI7TUFDQSxJQUFJQSxLQUFLLENBQUNTLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSVQsS0FBSyxDQUFDUyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDM0Q7UUFDQUMsR0FBRyxDQUFDQyxLQUFLLENBQUUsb0JBQW1CWCxLQUFNLCtCQUE4QixJQUFJLENBQUNILHVCQUF1QixDQUFDZSxJQUFLLEVBQUMsQ0FBQztRQUN0RztNQUNEOztNQUNBLE9BQU8sSUFBSSxDQUFDakIsS0FBSyxDQUFDa0IsWUFBWSxDQUFDYixLQUFLLENBQUM7SUFDdEMsQ0FBQztJQUFBO0VBQUEsRUFuQzJCYyxTQUFTO0VBQUEsT0FzQ3ZCcEIsY0FBYztBQUFBIn0=