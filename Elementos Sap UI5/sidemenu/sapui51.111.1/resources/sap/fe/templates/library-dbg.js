/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/f/library", "sap/fe/core/library", "sap/fe/macros/library", "sap/fe/templates/ListReport/view/fragments/MultipleMode.fragment", "sap/fe/templates/ObjectPage/components/DraftHandlerButton", "sap/ui/core/Core", "sap/ui/core/library"], function (_library, _library2, _library3, MultipleMode, DraftHandlerButton, Core, _library4) {
  "use strict";

  var _exports = {};
  /**
   * Library providing the official templates supported by SAP Fiori elements.
   *
   * @namespace
   * @name sap.fe.templates
   * @public
   */
  const templatesNamespace = "sap.fe.templates";

  /**
   * @namespace
   * @name sap.fe.templates.ListReport
   * @public
   */
  _exports.templatesNamespace = templatesNamespace;
  const templatesLRNamespace = "sap.fe.templates.ListReport";

  /**
   * @namespace
   * @name sap.fe.templates.ObjectPage
   * @public
   */
  _exports.templatesLRNamespace = templatesLRNamespace;
  const templatesOPNamespace = "sap.fe.templates.ObjectPage";
  _exports.templatesOPNamespace = templatesOPNamespace;
  const thisLib = Core.initLibrary({
    name: "sap.fe.templates",
    dependencies: ["sap.ui.core", "sap.fe.core", "sap.fe.macros", "sap.f"],
    types: ["sap.fe.templates.ObjectPage.SectionLayout"],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.111.1",
    noLibraryCSS: true
  });
  if (!thisLib.ObjectPage) {
    thisLib.ObjectPage = {};
  }
  thisLib.ObjectPage.SectionLayout = {
    /**
     * All sections are shown in one page
     *
     * @public
     */
    Page: "Page",
    /**
     * All top-level sections are shown in an own tab
     *
     * @public
     */
    Tabs: "Tabs"
  };
  MultipleMode.register();
  DraftHandlerButton.register();
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0ZW1wbGF0ZXNOYW1lc3BhY2UiLCJ0ZW1wbGF0ZXNMUk5hbWVzcGFjZSIsInRlbXBsYXRlc09QTmFtZXNwYWNlIiwidGhpc0xpYiIsIkNvcmUiLCJpbml0TGlicmFyeSIsIm5hbWUiLCJkZXBlbmRlbmNpZXMiLCJ0eXBlcyIsImludGVyZmFjZXMiLCJjb250cm9scyIsImVsZW1lbnRzIiwidmVyc2lvbiIsIm5vTGlicmFyeUNTUyIsIk9iamVjdFBhZ2UiLCJTZWN0aW9uTGF5b3V0IiwiUGFnZSIsIlRhYnMiLCJNdWx0aXBsZU1vZGUiLCJyZWdpc3RlciIsIkRyYWZ0SGFuZGxlckJ1dHRvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsibGlicmFyeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJzYXAvZi9saWJyYXJ5XCI7XG5pbXBvcnQgXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgXCJzYXAvZmUvbWFjcm9zL2xpYnJhcnlcIjtcbmltcG9ydCBNdWx0aXBsZU1vZGUgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvTGlzdFJlcG9ydC92aWV3L2ZyYWdtZW50cy9NdWx0aXBsZU1vZGUuZnJhZ21lbnRcIjtcbmltcG9ydCBEcmFmdEhhbmRsZXJCdXR0b24gZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvT2JqZWN0UGFnZS9jb21wb25lbnRzL0RyYWZ0SGFuZGxlckJ1dHRvblwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbi8qKlxuICogTGlicmFyeSBwcm92aWRpbmcgdGhlIG9mZmljaWFsIHRlbXBsYXRlcyBzdXBwb3J0ZWQgYnkgU0FQIEZpb3JpIGVsZW1lbnRzLlxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXNcbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbXBsYXRlc05hbWVzcGFjZSA9IFwic2FwLmZlLnRlbXBsYXRlc1wiO1xuXG4vKipcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydFxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgdGVtcGxhdGVzTFJOYW1lc3BhY2UgPSBcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydFwiO1xuXG4vKipcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgdGVtcGxhdGVzT1BOYW1lc3BhY2UgPSBcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZVwiO1xuXG5jb25zdCB0aGlzTGliID0gQ29yZS5pbml0TGlicmFyeSh7XG5cdG5hbWU6IFwic2FwLmZlLnRlbXBsYXRlc1wiLFxuXHRkZXBlbmRlbmNpZXM6IFtcInNhcC51aS5jb3JlXCIsIFwic2FwLmZlLmNvcmVcIiwgXCJzYXAuZmUubWFjcm9zXCIsIFwic2FwLmZcIl0sXG5cdHR5cGVzOiBbXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuU2VjdGlvbkxheW91dFwiXSxcblx0aW50ZXJmYWNlczogW10sXG5cdGNvbnRyb2xzOiBbXSxcblx0ZWxlbWVudHM6IFtdLFxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdGVtcGxhdGUtY3VybHktaW4tc3RyaW5nXG5cdHZlcnNpb246IFwiJHt2ZXJzaW9ufVwiLFxuXHRub0xpYnJhcnlDU1M6IHRydWVcbn0pIGFzIGFueTtcblxuaWYgKCF0aGlzTGliLk9iamVjdFBhZ2UpIHtcblx0dGhpc0xpYi5PYmplY3RQYWdlID0ge307XG59XG50aGlzTGliLk9iamVjdFBhZ2UuU2VjdGlvbkxheW91dCA9IHtcblx0LyoqXG5cdCAqIEFsbCBzZWN0aW9ucyBhcmUgc2hvd24gaW4gb25lIHBhZ2Vcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0UGFnZTogXCJQYWdlXCIsXG5cblx0LyoqXG5cdCAqIEFsbCB0b3AtbGV2ZWwgc2VjdGlvbnMgYXJlIHNob3duIGluIGFuIG93biB0YWJcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0VGFiczogXCJUYWJzXCJcbn07XG5cbk11bHRpcGxlTW9kZS5yZWdpc3RlcigpO1xuRHJhZnRIYW5kbGVyQnV0dG9uLnJlZ2lzdGVyKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHRoaXNMaWI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxrQkFBa0IsR0FBRyxrQkFBa0I7O0VBRXBEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFKQTtFQUtPLE1BQU1DLG9CQUFvQixHQUFHLDZCQUE2Qjs7RUFFakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUpBO0VBS08sTUFBTUMsb0JBQW9CLEdBQUcsNkJBQTZCO0VBQUM7RUFFbEUsTUFBTUMsT0FBTyxHQUFHQyxJQUFJLENBQUNDLFdBQVcsQ0FBQztJQUNoQ0MsSUFBSSxFQUFFLGtCQUFrQjtJQUN4QkMsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsT0FBTyxDQUFDO0lBQ3RFQyxLQUFLLEVBQUUsQ0FBQywyQ0FBMkMsQ0FBQztJQUNwREMsVUFBVSxFQUFFLEVBQUU7SUFDZEMsUUFBUSxFQUFFLEVBQUU7SUFDWkMsUUFBUSxFQUFFLEVBQUU7SUFDWjtJQUNBQyxPQUFPLEVBQUUsWUFBWTtJQUNyQkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFRO0VBRVQsSUFBSSxDQUFDVixPQUFPLENBQUNXLFVBQVUsRUFBRTtJQUN4QlgsT0FBTyxDQUFDVyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0VBQ3hCO0VBQ0FYLE9BQU8sQ0FBQ1csVUFBVSxDQUFDQyxhQUFhLEdBQUc7SUFDbEM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxJQUFJLEVBQUUsTUFBTTtJQUVaO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsSUFBSSxFQUFFO0VBQ1AsQ0FBQztFQUVEQyxZQUFZLENBQUNDLFFBQVEsRUFBRTtFQUN2QkMsa0JBQWtCLENBQUNELFFBQVEsRUFBRTtFQUFDLE9BRWZoQixPQUFPO0FBQUEifQ==