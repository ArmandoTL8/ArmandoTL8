/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime"], function (BuildingBlock, BuildingBlockRuntime) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MultipleMode = (_dec = defineBuildingBlock({
    name: "MultipleMode",
    namespace: "sap.fe.templates.ListReport.view.fragments",
    isOpen: true
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(MultipleMode, _BuildingBlockBase);
    function MultipleMode() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "converterContext", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = MultipleMode;
    var _proto = MultipleMode.prototype;
    _proto.getInnerControlsAPI = function getInnerControlsAPI() {
      var _this$converterContex;
      return ((_this$converterContex = this.converterContext) === null || _this$converterContex === void 0 ? void 0 : _this$converterContex.views.reduce((innerControls, view) => {
        const innerControlId = view.tableControlId || view.chartControlId;
        if (innerControlId) {
          innerControls.push(`${innerControlId}::${view.tableControlId ? "Table" : "Chart"}`);
        }
        return innerControls;
      }, []).join(",")) || "";
    };
    _proto.getTemplate = function getTemplate() {
      var _this$converterContex2, _this$converterContex3, _this$converterContex4;
      return xml`
			<fe:MultipleModeControl
				xmlns="sap.m"
				xmlns:fe="sap.fe.templates.ListReport.controls"
				xmlns:core="sap.ui.core"
				xmlns:macro="sap.fe.macros"
				innerControls="${this.getInnerControlsAPI()}"
				filterControl="${this.converterContext.filterBarId}"
				showCounts="${(_this$converterContex2 = this.converterContext.multiViewsControl) === null || _this$converterContex2 === void 0 ? void 0 : _this$converterContex2.showTabCounts}"
				freezeContent="${!!this.converterContext.filterBarId}"
				id="${(_this$converterContex3 = this.converterContext.multiViewsControl) === null || _this$converterContex3 === void 0 ? void 0 : _this$converterContex3.id}::Control"
			>
				<IconTabBar
				core:require="{
					MULTICONTROL: 'sap/fe/templates/ListReport/controls/MultipleModeControl'
				}"
					expandable="false"
					headerMode="Inline"
					id="${(_this$converterContex4 = this.converterContext.multiViewsControl) === null || _this$converterContex4 === void 0 ? void 0 : _this$converterContex4.id}"
					stretchContentHeight="true"
					select="MULTICONTROL.handleTabChange($event)"
				>
					<items>
					${this.converterContext.views.map((view, viewIdx) => {
        return `<template:with path="converterContext>views/${viewIdx}/" var="view"
										template:require="{
											ID: 'sap/fe/core/helpers/StableIdHelper'
										}"
										xmlns:core="sap.ui.core"
										xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">
								<template:with path="view>presentation" var="presentationContext">
								<IconTabFilter
									text="${view.title}"
									key="{= ID.generate([\${view>tableControlId} || \${view>customTabId} || \${view>chartControlId}])}"
									visible="{view>visible}"
								>
									<content>
										<template:if test="{= \${view>type} === 'Custom'}">
											<template:then>
												<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CustomView" type="XML" />
											</template:then>
											<template:else>
												<MessageStrip
													text="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/title} ) }' }"
													type="Information"
													showIcon="true"
													showCloseButton="true"
													class="sapUiTinyMargin"
													visible="{= '{= (\${tabsInternal>/' + (\${view>tableControlId} || \${view>chartControlId}) + '/notApplicable/fields} || []).length>0 }' }"
												>
												</MessageStrip>
												<core:Fragment fragmentName="sap.fe.templates.ListReport.view.fragments.CollectionVisualization" type="XML" />
											</template:else>
										</template:if>
									</content>
								</IconTabFilter>
							</template:with></template:with>`;
      }).join("")}
					</items>
				</IconTabBar>
			</fe:MultipleModeControl>`;
    };
    return MultipleMode;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "converterContext", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = MultipleMode;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aXBsZU1vZGUiLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImlzT3BlbiIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsImdldElubmVyQ29udHJvbHNBUEkiLCJjb252ZXJ0ZXJDb250ZXh0Iiwidmlld3MiLCJyZWR1Y2UiLCJpbm5lckNvbnRyb2xzIiwidmlldyIsImlubmVyQ29udHJvbElkIiwidGFibGVDb250cm9sSWQiLCJjaGFydENvbnRyb2xJZCIsInB1c2giLCJqb2luIiwiZ2V0VGVtcGxhdGUiLCJ4bWwiLCJmaWx0ZXJCYXJJZCIsIm11bHRpVmlld3NDb250cm9sIiwic2hvd1RhYkNvdW50cyIsImlkIiwibWFwIiwidmlld0lkeCIsInRpdGxlIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk11bHRpcGxlTW9kZS5mcmFnbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tSdW50aW1lXCI7XG5pbXBvcnQgdHlwZSB7XG5cdExpc3RSZXBvcnREZWZpbml0aW9uLFxuXHRTaW5nbGVDaGFydFZpZXdEZWZpbml0aW9uLFxuXHRTaW5nbGVUYWJsZVZpZXdEZWZpbml0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL3RlbXBsYXRlcy9MaXN0UmVwb3J0Q29udmVydGVyXCI7XG5cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHsgbmFtZTogXCJNdWx0aXBsZU1vZGVcIiwgbmFtZXNwYWNlOiBcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC52aWV3LmZyYWdtZW50c1wiLCBpc09wZW46IHRydWUgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE11bHRpcGxlTW9kZSBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiIH0pXG5cdGNvbnZlcnRlckNvbnRleHQhOiBMaXN0UmVwb3J0RGVmaW5pdGlvbjtcblxuXHRnZXRJbm5lckNvbnRyb2xzQVBJKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0aGlzLmNvbnZlcnRlckNvbnRleHQ/LnZpZXdzXG5cdFx0XHRcdC5yZWR1Y2UoKGlubmVyQ29udHJvbHM6IHN0cmluZ1tdLCB2aWV3KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgaW5uZXJDb250cm9sSWQgPVxuXHRcdFx0XHRcdFx0KHZpZXcgYXMgU2luZ2xlVGFibGVWaWV3RGVmaW5pdGlvbikudGFibGVDb250cm9sSWQgfHwgKHZpZXcgYXMgU2luZ2xlQ2hhcnRWaWV3RGVmaW5pdGlvbikuY2hhcnRDb250cm9sSWQ7XG5cdFx0XHRcdFx0aWYgKGlubmVyQ29udHJvbElkKSB7XG5cdFx0XHRcdFx0XHRpbm5lckNvbnRyb2xzLnB1c2goYCR7aW5uZXJDb250cm9sSWR9Ojokeyh2aWV3IGFzIFNpbmdsZVRhYmxlVmlld0RlZmluaXRpb24pLnRhYmxlQ29udHJvbElkID8gXCJUYWJsZVwiIDogXCJDaGFydFwifWApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gaW5uZXJDb250cm9scztcblx0XHRcdFx0fSwgW10pXG5cdFx0XHRcdC5qb2luKFwiLFwiKSB8fCBcIlwiXG5cdFx0KTtcblx0fVxuXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiB4bWxgXG5cdFx0XHQ8ZmU6TXVsdGlwbGVNb2RlQ29udHJvbFxuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0eG1sbnM6ZmU9XCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuY29udHJvbHNcIlxuXHRcdFx0XHR4bWxuczpjb3JlPVwic2FwLnVpLmNvcmVcIlxuXHRcdFx0XHR4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3NcIlxuXHRcdFx0XHRpbm5lckNvbnRyb2xzPVwiJHt0aGlzLmdldElubmVyQ29udHJvbHNBUEkoKX1cIlxuXHRcdFx0XHRmaWx0ZXJDb250cm9sPVwiJHt0aGlzLmNvbnZlcnRlckNvbnRleHQuZmlsdGVyQmFySWR9XCJcblx0XHRcdFx0c2hvd0NvdW50cz1cIiR7dGhpcy5jb252ZXJ0ZXJDb250ZXh0Lm11bHRpVmlld3NDb250cm9sPy5zaG93VGFiQ291bnRzfVwiXG5cdFx0XHRcdGZyZWV6ZUNvbnRlbnQ9XCIkeyEhdGhpcy5jb252ZXJ0ZXJDb250ZXh0LmZpbHRlckJhcklkfVwiXG5cdFx0XHRcdGlkPVwiJHt0aGlzLmNvbnZlcnRlckNvbnRleHQubXVsdGlWaWV3c0NvbnRyb2w/LmlkfTo6Q29udHJvbFwiXG5cdFx0XHQ+XG5cdFx0XHRcdDxJY29uVGFiQmFyXG5cdFx0XHRcdGNvcmU6cmVxdWlyZT1cIntcblx0XHRcdFx0XHRNVUxUSUNPTlRST0w6ICdzYXAvZmUvdGVtcGxhdGVzL0xpc3RSZXBvcnQvY29udHJvbHMvTXVsdGlwbGVNb2RlQ29udHJvbCdcblx0XHRcdFx0fVwiXG5cdFx0XHRcdFx0ZXhwYW5kYWJsZT1cImZhbHNlXCJcblx0XHRcdFx0XHRoZWFkZXJNb2RlPVwiSW5saW5lXCJcblx0XHRcdFx0XHRpZD1cIiR7dGhpcy5jb252ZXJ0ZXJDb250ZXh0Lm11bHRpVmlld3NDb250cm9sPy5pZH1cIlxuXHRcdFx0XHRcdHN0cmV0Y2hDb250ZW50SGVpZ2h0PVwidHJ1ZVwiXG5cdFx0XHRcdFx0c2VsZWN0PVwiTVVMVElDT05UUk9MLmhhbmRsZVRhYkNoYW5nZSgkZXZlbnQpXCJcblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxpdGVtcz5cblx0XHRcdFx0XHQke3RoaXMuY29udmVydGVyQ29udGV4dC52aWV3c1xuXHRcdFx0XHRcdFx0Lm1hcCgodmlldywgdmlld0lkeCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYDx0ZW1wbGF0ZTp3aXRoIHBhdGg9XCJjb252ZXJ0ZXJDb250ZXh0PnZpZXdzLyR7dmlld0lkeH0vXCIgdmFyPVwidmlld1wiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRlbXBsYXRlOnJlcXVpcmU9XCJ7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0SUQ6ICdzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyJ1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0eG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0eG1sbnM6dGVtcGxhdGU9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUudGVtcGxhdGUvMVwiPlxuXHRcdFx0XHRcdFx0XHRcdDx0ZW1wbGF0ZTp3aXRoIHBhdGg9XCJ2aWV3PnByZXNlbnRhdGlvblwiIHZhcj1cInByZXNlbnRhdGlvbkNvbnRleHRcIj5cblx0XHRcdFx0XHRcdFx0XHQ8SWNvblRhYkZpbHRlclxuXHRcdFx0XHRcdFx0XHRcdFx0dGV4dD1cIiR7dmlldy50aXRsZX1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0a2V5PVwiez0gSUQuZ2VuZXJhdGUoW1xcJHt2aWV3PnRhYmxlQ29udHJvbElkfSB8fCBcXCR7dmlldz5jdXN0b21UYWJJZH0gfHwgXFwke3ZpZXc+Y2hhcnRDb250cm9sSWR9XSl9XCJcblx0XHRcdFx0XHRcdFx0XHRcdHZpc2libGU9XCJ7dmlldz52aXNpYmxlfVwiXG5cdFx0XHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHRcdFx0PGNvbnRlbnQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDx0ZW1wbGF0ZTppZiB0ZXN0PVwiez0gXFwke3ZpZXc+dHlwZX0gPT09ICdDdXN0b20nfVwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDx0ZW1wbGF0ZTp0aGVuPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LnZpZXcuZnJhZ21lbnRzLkN1c3RvbVZpZXdcIiB0eXBlPVwiWE1MXCIgLz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3RlbXBsYXRlOnRoZW4+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHRlbXBsYXRlOmVsc2U+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8TWVzc2FnZVN0cmlwXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRleHQ9XCJ7PSAnez0gKFxcJHt0YWJzSW50ZXJuYWw+LycgKyAoXFwke3ZpZXc+dGFibGVDb250cm9sSWR9IHx8IFxcJHt2aWV3PmNoYXJ0Q29udHJvbElkfSkgKyAnL25vdEFwcGxpY2FibGUvdGl0bGV9ICkgfScgfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHR5cGU9XCJJbmZvcm1hdGlvblwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNob3dJY29uPVwidHJ1ZVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNob3dDbG9zZUJ1dHRvbj1cInRydWVcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjbGFzcz1cInNhcFVpVGlueU1hcmdpblwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZpc2libGU9XCJ7PSAnez0gKFxcJHt0YWJzSW50ZXJuYWw+LycgKyAoXFwke3ZpZXc+dGFibGVDb250cm9sSWR9IHx8IFxcJHt2aWV3PmNoYXJ0Q29udHJvbElkfSkgKyAnL25vdEFwcGxpY2FibGUvZmllbGRzfSB8fCBbXSkubGVuZ3RoPjAgfScgfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L01lc3NhZ2VTdHJpcD5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC52aWV3LmZyYWdtZW50cy5Db2xsZWN0aW9uVmlzdWFsaXphdGlvblwiIHR5cGU9XCJYTUxcIiAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvdGVtcGxhdGU6ZWxzZT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PC90ZW1wbGF0ZTppZj5cblx0XHRcdFx0XHRcdFx0XHRcdDwvY29udGVudD5cblx0XHRcdFx0XHRcdFx0XHQ8L0ljb25UYWJGaWx0ZXI+XG5cdFx0XHRcdFx0XHRcdDwvdGVtcGxhdGU6d2l0aD48L3RlbXBsYXRlOndpdGg+YDtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuam9pbihcIlwiKX1cblx0XHRcdFx0XHQ8L2l0ZW1zPlxuXHRcdFx0XHQ8L0ljb25UYWJCYXI+XG5cdFx0XHQ8L2ZlOk11bHRpcGxlTW9kZUNvbnRyb2w+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O01BU3FCQSxZQUFZLFdBRGhDQyxtQkFBbUIsQ0FBQztJQUFFQyxJQUFJLEVBQUUsY0FBYztJQUFFQyxTQUFTLEVBQUUsNENBQTRDO0lBQUVDLE1BQU0sRUFBRTtFQUFLLENBQUMsQ0FBQyxVQUVuSEMsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUF1QixDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUE7SUFBQSxPQUdqREMsbUJBQW1CLEdBQW5CLCtCQUFzQjtNQUFBO01BQ3JCLE9BQ0MsOEJBQUksQ0FBQ0MsZ0JBQWdCLDBEQUFyQixzQkFBdUJDLEtBQUssQ0FDMUJDLE1BQU0sQ0FBQyxDQUFDQyxhQUF1QixFQUFFQyxJQUFJLEtBQUs7UUFDMUMsTUFBTUMsY0FBYyxHQUNsQkQsSUFBSSxDQUErQkUsY0FBYyxJQUFLRixJQUFJLENBQStCRyxjQUFjO1FBQ3pHLElBQUlGLGNBQWMsRUFBRTtVQUNuQkYsYUFBYSxDQUFDSyxJQUFJLENBQUUsR0FBRUgsY0FBZSxLQUFLRCxJQUFJLENBQStCRSxjQUFjLEdBQUcsT0FBTyxHQUFHLE9BQVEsRUFBQyxDQUFDO1FBQ25IO1FBQ0EsT0FBT0gsYUFBYTtNQUNyQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ0xNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSSxFQUFFO0lBRW5CLENBQUM7SUFBQSxPQUVEQyxXQUFXLEdBQVgsdUJBQWM7TUFBQTtNQUNiLE9BQU9DLEdBQUk7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLElBQUksQ0FBQ1osbUJBQW1CLEVBQUc7QUFDaEQscUJBQXFCLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUNZLFdBQVk7QUFDdkQsa0JBQWdCLDBCQUFFLElBQUksQ0FBQ1osZ0JBQWdCLENBQUNhLGlCQUFpQiwyREFBdkMsdUJBQXlDQyxhQUFjO0FBQ3pFLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDZCxnQkFBZ0IsQ0FBQ1ksV0FBWTtBQUN6RCxVQUFRLDBCQUFFLElBQUksQ0FBQ1osZ0JBQWdCLENBQUNhLGlCQUFpQiwyREFBdkMsdUJBQXlDRSxFQUFHO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBUywwQkFBRSxJQUFJLENBQUNmLGdCQUFnQixDQUFDYSxpQkFBaUIsMkRBQXZDLHVCQUF5Q0UsRUFBRztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSSxDQUFDZixnQkFBZ0IsQ0FBQ0MsS0FBSyxDQUMzQmUsR0FBRyxDQUFDLENBQUNaLElBQUksRUFBRWEsT0FBTyxLQUFLO1FBQ3ZCLE9BQVEsK0NBQThDQSxPQUFRO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCYixJQUFJLENBQUNjLEtBQU07QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztNQUNsQyxDQUFDLENBQUMsQ0FDRFQsSUFBSSxDQUFDLEVBQUUsQ0FBRTtBQUNoQjtBQUNBO0FBQ0EsNkJBQTZCO0lBQzVCLENBQUM7SUFBQTtFQUFBLEVBbkZ3Q1UsaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9