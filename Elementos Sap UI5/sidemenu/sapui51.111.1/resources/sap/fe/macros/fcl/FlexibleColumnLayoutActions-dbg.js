/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime"], function (BuildingBlock, BuildingBlockRuntime) {
  "use strict";

  var _dec, _class;
  var _exports = {};
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let FlexibleColumnLayoutActions = (_dec = defineBuildingBlock({
    name: "FlexibleColumnLayoutActions",
    namespace: "sap.fe.macros.fcl",
    publicNamespace: "sap.fe.macros"
  }), _dec(_class = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FlexibleColumnLayoutActions, _BuildingBlockBase);
    function FlexibleColumnLayoutActions() {
      return _BuildingBlockBase.apply(this, arguments) || this;
    }
    _exports = FlexibleColumnLayoutActions;
    var _proto = FlexibleColumnLayoutActions.prototype;
    _proto.getTemplate = function getTemplate() {
      return xml`
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::FullScreen"
                type="Transparent"
                icon="{fclhelper>/actionButtonsInfo/switchIcon}"
                visible="{fclhelper>/actionButtonsInfo/switchVisible}"
                press="._routing.switchFullScreen()"
            />
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::Close"
                type="Transparent"
                icon="sap-icon://decline"
                tooltip="{sap.fe.i18n>C_COMMON_SAPFE_CLOSE}"
                visible="{fclhelper>/actionButtonsInfo/closeVisible}"
                press="._routing.closeColumn()"
            />`;
    };
    return FlexibleColumnLayoutActions;
  }(BuildingBlockBase)) || _class);
  _exports = FlexibleColumnLayoutActions;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGbGV4aWJsZUNvbHVtbkxheW91dEFjdGlvbnMiLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImdldFRlbXBsYXRlIiwieG1sIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZsZXhpYmxlQ29sdW1uTGF5b3V0QWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soeyBuYW1lOiBcIkZsZXhpYmxlQ29sdW1uTGF5b3V0QWN0aW9uc1wiLCBuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5mY2xcIiwgcHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIiB9KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmxleGlibGVDb2x1bW5MYXlvdXRBY3Rpb25zIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRyZXR1cm4geG1sYFxuICAgICAgICAgICAgPG06T3ZlcmZsb3dUb29sYmFyQnV0dG9uXG4gICAgICAgICAgICAgICAgaWQ9XCJmZTo6RkNMU3RhbmRhcmRBY3Rpb246OkZ1bGxTY3JlZW5cIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJUcmFuc3BhcmVudFwiXG4gICAgICAgICAgICAgICAgaWNvbj1cIntmY2xoZWxwZXI+L2FjdGlvbkJ1dHRvbnNJbmZvL3N3aXRjaEljb259XCJcbiAgICAgICAgICAgICAgICB2aXNpYmxlPVwie2ZjbGhlbHBlcj4vYWN0aW9uQnV0dG9uc0luZm8vc3dpdGNoVmlzaWJsZX1cIlxuICAgICAgICAgICAgICAgIHByZXNzPVwiLl9yb3V0aW5nLnN3aXRjaEZ1bGxTY3JlZW4oKVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPG06T3ZlcmZsb3dUb29sYmFyQnV0dG9uXG4gICAgICAgICAgICAgICAgaWQ9XCJmZTo6RkNMU3RhbmRhcmRBY3Rpb246OkNsb3NlXCJcbiAgICAgICAgICAgICAgICB0eXBlPVwiVHJhbnNwYXJlbnRcIlxuICAgICAgICAgICAgICAgIGljb249XCJzYXAtaWNvbjovL2RlY2xpbmVcIlxuICAgICAgICAgICAgICAgIHRvb2x0aXA9XCJ7c2FwLmZlLmkxOG4+Q19DT01NT05fU0FQRkVfQ0xPU0V9XCJcbiAgICAgICAgICAgICAgICB2aXNpYmxlPVwie2ZjbGhlbHBlcj4vYWN0aW9uQnV0dG9uc0luZm8vY2xvc2VWaXNpYmxlfVwiXG4gICAgICAgICAgICAgICAgcHJlc3M9XCIuX3JvdXRpbmcuY2xvc2VDb2x1bW4oKVwiXG4gICAgICAgICAgICAvPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7TUFJcUJBLDJCQUEyQixXQUQvQ0MsbUJBQW1CLENBQUM7SUFBRUMsSUFBSSxFQUFFLDZCQUE2QjtJQUFFQyxTQUFTLEVBQUUsbUJBQW1CO0lBQUVDLGVBQWUsRUFBRTtFQUFnQixDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBQUE7SUFBQSxPQUU5SEMsV0FBVyxHQUFYLHVCQUFjO01BQ2IsT0FBT0MsR0FBSTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0lBQ2QsQ0FBQztJQUFBO0VBQUEsRUFsQnVEQyxpQkFBaUI7RUFBQTtFQUFBO0FBQUEifQ==