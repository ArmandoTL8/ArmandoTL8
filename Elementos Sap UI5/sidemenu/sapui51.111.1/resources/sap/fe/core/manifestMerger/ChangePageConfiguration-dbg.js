/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath"], function (Log, ObjectPath) {
  "use strict";

  var _exports = {};
  /**
   * Apply change method.
   *
   * This method is being called by the FLEX framework in case a manifest change with the change type
   * 'appdescr_fe_changePageConfiguration' was created for the current application. This method is not meant to be
   * called by anyone else but the FLEX framework.
   *
   * @function
   * @name sap.fe.core.manifestMerger#applyChange
   * @param manifest The original manifest.
   * @param change The change content.
   * @returns The changed or unchanged manifest.
   * @private
   */
  function applyChange(manifest, change) {
    const changeContent = change.getContent();
    const pageId = changeContent === null || changeContent === void 0 ? void 0 : changeContent.page;
    const propertyChange = changeContent === null || changeContent === void 0 ? void 0 : changeContent.entityPropertyChange;

    // return unmodified manifest in case change not valid
    if ((propertyChange === null || propertyChange === void 0 ? void 0 : propertyChange.operation) !== "UPSERT" || !(propertyChange !== null && propertyChange !== void 0 && propertyChange.propertyPath) || (propertyChange === null || propertyChange === void 0 ? void 0 : propertyChange.propertyValue) === undefined || propertyChange !== null && propertyChange !== void 0 && propertyChange.propertyPath.startsWith("/")) {
      Log.error("Change content is not a valid");
      return manifest;
    }
    return changeConfiguration(manifest, pageId, propertyChange.propertyPath, propertyChange.propertyValue);
  }

  /**
   * Changes the page configuration of SAP Fiori elements.
   *
   * This method enables you to change the page configuration of SAP Fiori elements.
   *
   * @function
   * @name sap.fe.core.manifestMerger#changeConfiguration
   * @param manifest The original manifest.
   * @param pageId The ID of the page for which the configuration is to be changed.
   * @param path The path in the page settings for which the configuration is to be changed.
   * @param value The new value of the configuration. This could be a plain value like a string, or a Boolean, or a structured object.
   * @returns The changed or unchanged manifest.
   * @private
   */
  _exports.applyChange = applyChange;
  function changeConfiguration(manifest, pageId, path, value) {
    const pageSettings = getPageSettings(manifest, pageId);
    if (pageSettings) {
      let propertyPath = path.split("/");
      if (propertyPath[0] === "controlConfiguration") {
        let annotationPath = "";
        // the annotation path in the control configuration has to stay together. For now rely on the fact the @ is in the last part
        for (let i = 1; i < propertyPath.length; i++) {
          annotationPath += (i > 1 ? "/" : "") + propertyPath[i];
          if (annotationPath.indexOf("@") > -1) {
            propertyPath = ["controlConfiguration", annotationPath].concat(propertyPath.slice(i + 1));
            break;
          }
        }
      }
      ObjectPath.set(propertyPath, value, pageSettings);
    } else {
      Log.error(`No Fiori elements page with ID ${pageId} found in routing targets.`);
    }
    return manifest;
  }

  /**
   * Search the page settings in the manifest for a given page ID.
   *
   * @function
   * @name sap.fe.core.manifestMerger#getPageSettings
   * @param manifest The manifest where the search is carried out to find the page settings.
   * @param pageId The ID of the page.
   * @returns The page settings for the page ID or undefined if not found.
   * @private
   */
  _exports.changeConfiguration = changeConfiguration;
  function getPageSettings(manifest, pageId) {
    var _manifest$sapUi, _manifest$sapUi$routi;
    let pageSettings;
    const targets = ((_manifest$sapUi = manifest["sap.ui5"]) === null || _manifest$sapUi === void 0 ? void 0 : (_manifest$sapUi$routi = _manifest$sapUi.routing) === null || _manifest$sapUi$routi === void 0 ? void 0 : _manifest$sapUi$routi.targets) ?? {};
    for (const p in targets) {
      if (targets[p].id === pageId && targets[p].name.startsWith("sap.fe.templates.")) {
        var _targets$p$options;
        pageSettings = ((_targets$p$options = targets[p].options) === null || _targets$p$options === void 0 ? void 0 : _targets$p$options.settings) ?? {};
        break;
      }
    }
    return pageSettings;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcHBseUNoYW5nZSIsIm1hbmlmZXN0IiwiY2hhbmdlIiwiY2hhbmdlQ29udGVudCIsImdldENvbnRlbnQiLCJwYWdlSWQiLCJwYWdlIiwicHJvcGVydHlDaGFuZ2UiLCJlbnRpdHlQcm9wZXJ0eUNoYW5nZSIsIm9wZXJhdGlvbiIsInByb3BlcnR5UGF0aCIsInByb3BlcnR5VmFsdWUiLCJ1bmRlZmluZWQiLCJzdGFydHNXaXRoIiwiTG9nIiwiZXJyb3IiLCJjaGFuZ2VDb25maWd1cmF0aW9uIiwicGF0aCIsInZhbHVlIiwicGFnZVNldHRpbmdzIiwiZ2V0UGFnZVNldHRpbmdzIiwic3BsaXQiLCJhbm5vdGF0aW9uUGF0aCIsImkiLCJsZW5ndGgiLCJpbmRleE9mIiwiY29uY2F0Iiwic2xpY2UiLCJPYmplY3RQYXRoIiwic2V0IiwidGFyZ2V0cyIsInJvdXRpbmciLCJwIiwiaWQiLCJuYW1lIiwib3B0aW9ucyIsInNldHRpbmdzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDaGFuZ2VQYWdlQ29uZmlndXJhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBPYmplY3RQYXRoIGZyb20gXCJzYXAvYmFzZS91dGlsL09iamVjdFBhdGhcIjtcbmltcG9ydCB7IE1hbmlmZXN0Q29udGVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcblxuZXhwb3J0IHR5cGUgQ2hhbmdlID0ge1xuXHRnZXRDb250ZW50KCk6IENoYW5nZUNvbnRlbnQ7XG59O1xuXG50eXBlIENoYW5nZUNvbnRlbnQgPSB7XG5cdHBhZ2U6IHN0cmluZzsgLy8gSUQgb2YgdGhlIHBhZ2UgdG8gYmUgY2hhbmdlZFxuXHRlbnRpdHlQcm9wZXJ0eUNoYW5nZTogRW50aXR5UHJvcGVydHlDaGFuZ2U7XG59O1xuXG50eXBlIEVudGl0eVByb3BlcnR5Q2hhbmdlID0ge1xuXHRwcm9wZXJ0eVBhdGg6IHN0cmluZzsgLy8gcGF0aCB0byB0aGUgcHJvcGVydHkgdG8gYmUgY2hhbmdlZFxuXHRvcGVyYXRpb246IHN0cmluZzsgLy8gb25seSBVUFNFUlQgc3VwcG9ydGVkXG5cdHByb3BlcnR5VmFsdWU6IHN0cmluZyB8IE9iamVjdDsgLy93aGF0IHRvIGJlIGNoYW5nZWRcbn07XG5cbi8qKlxuICogQXBwbHkgY2hhbmdlIG1ldGhvZC5cbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBiZWluZyBjYWxsZWQgYnkgdGhlIEZMRVggZnJhbWV3b3JrIGluIGNhc2UgYSBtYW5pZmVzdCBjaGFuZ2Ugd2l0aCB0aGUgY2hhbmdlIHR5cGVcbiAqICdhcHBkZXNjcl9mZV9jaGFuZ2VQYWdlQ29uZmlndXJhdGlvbicgd2FzIGNyZWF0ZWQgZm9yIHRoZSBjdXJyZW50IGFwcGxpY2F0aW9uLiBUaGlzIG1ldGhvZCBpcyBub3QgbWVhbnQgdG8gYmVcbiAqIGNhbGxlZCBieSBhbnlvbmUgZWxzZSBidXQgdGhlIEZMRVggZnJhbWV3b3JrLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUubWFuaWZlc3RNZXJnZXIjYXBwbHlDaGFuZ2VcbiAqIEBwYXJhbSBtYW5pZmVzdCBUaGUgb3JpZ2luYWwgbWFuaWZlc3QuXG4gKiBAcGFyYW0gY2hhbmdlIFRoZSBjaGFuZ2UgY29udGVudC5cbiAqIEByZXR1cm5zIFRoZSBjaGFuZ2VkIG9yIHVuY2hhbmdlZCBtYW5pZmVzdC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUNoYW5nZShtYW5pZmVzdDogTWFuaWZlc3RDb250ZW50LCBjaGFuZ2U6IENoYW5nZSk6IG9iamVjdCB7XG5cdGNvbnN0IGNoYW5nZUNvbnRlbnQgPSBjaGFuZ2UuZ2V0Q29udGVudCgpO1xuXHRjb25zdCBwYWdlSWQgPSBjaGFuZ2VDb250ZW50Py5wYWdlO1xuXHRjb25zdCBwcm9wZXJ0eUNoYW5nZSA9IGNoYW5nZUNvbnRlbnQ/LmVudGl0eVByb3BlcnR5Q2hhbmdlO1xuXG5cdC8vIHJldHVybiB1bm1vZGlmaWVkIG1hbmlmZXN0IGluIGNhc2UgY2hhbmdlIG5vdCB2YWxpZFxuXHRpZiAoXG5cdFx0cHJvcGVydHlDaGFuZ2U/Lm9wZXJhdGlvbiAhPT0gXCJVUFNFUlRcIiB8fFxuXHRcdCFwcm9wZXJ0eUNoYW5nZT8ucHJvcGVydHlQYXRoIHx8XG5cdFx0cHJvcGVydHlDaGFuZ2U/LnByb3BlcnR5VmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuXHRcdHByb3BlcnR5Q2hhbmdlPy5wcm9wZXJ0eVBhdGguc3RhcnRzV2l0aChcIi9cIilcblx0KSB7XG5cdFx0TG9nLmVycm9yKFwiQ2hhbmdlIGNvbnRlbnQgaXMgbm90IGEgdmFsaWRcIik7XG5cdFx0cmV0dXJuIG1hbmlmZXN0O1xuXHR9XG5cblx0cmV0dXJuIGNoYW5nZUNvbmZpZ3VyYXRpb24obWFuaWZlc3QsIHBhZ2VJZCwgcHJvcGVydHlDaGFuZ2UucHJvcGVydHlQYXRoLCBwcm9wZXJ0eUNoYW5nZS5wcm9wZXJ0eVZhbHVlKTtcbn1cblxuLyoqXG4gKiBDaGFuZ2VzIHRoZSBwYWdlIGNvbmZpZ3VyYXRpb24gb2YgU0FQIEZpb3JpIGVsZW1lbnRzLlxuICpcbiAqIFRoaXMgbWV0aG9kIGVuYWJsZXMgeW91IHRvIGNoYW5nZSB0aGUgcGFnZSBjb25maWd1cmF0aW9uIG9mIFNBUCBGaW9yaSBlbGVtZW50cy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5jb3JlLm1hbmlmZXN0TWVyZ2VyI2NoYW5nZUNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSBtYW5pZmVzdCBUaGUgb3JpZ2luYWwgbWFuaWZlc3QuXG4gKiBAcGFyYW0gcGFnZUlkIFRoZSBJRCBvZiB0aGUgcGFnZSBmb3Igd2hpY2ggdGhlIGNvbmZpZ3VyYXRpb24gaXMgdG8gYmUgY2hhbmdlZC5cbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIGluIHRoZSBwYWdlIHNldHRpbmdzIGZvciB3aGljaCB0aGUgY29uZmlndXJhdGlvbiBpcyB0byBiZSBjaGFuZ2VkLlxuICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGNvbmZpZ3VyYXRpb24uIFRoaXMgY291bGQgYmUgYSBwbGFpbiB2YWx1ZSBsaWtlIGEgc3RyaW5nLCBvciBhIEJvb2xlYW4sIG9yIGEgc3RydWN0dXJlZCBvYmplY3QuXG4gKiBAcmV0dXJucyBUaGUgY2hhbmdlZCBvciB1bmNoYW5nZWQgbWFuaWZlc3QuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hhbmdlQ29uZmlndXJhdGlvbihtYW5pZmVzdDogTWFuaWZlc3RDb250ZW50LCBwYWdlSWQ6IHN0cmluZywgcGF0aDogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IG9iamVjdCB7XG5cdGNvbnN0IHBhZ2VTZXR0aW5ncyA9IGdldFBhZ2VTZXR0aW5ncyhtYW5pZmVzdCwgcGFnZUlkKTtcblxuXHRpZiAocGFnZVNldHRpbmdzKSB7XG5cdFx0bGV0IHByb3BlcnR5UGF0aCA9IHBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdGlmIChwcm9wZXJ0eVBhdGhbMF0gPT09IFwiY29udHJvbENvbmZpZ3VyYXRpb25cIikge1xuXHRcdFx0bGV0IGFubm90YXRpb25QYXRoID0gXCJcIjtcblx0XHRcdC8vIHRoZSBhbm5vdGF0aW9uIHBhdGggaW4gdGhlIGNvbnRyb2wgY29uZmlndXJhdGlvbiBoYXMgdG8gc3RheSB0b2dldGhlci4gRm9yIG5vdyByZWx5IG9uIHRoZSBmYWN0IHRoZSBAIGlzIGluIHRoZSBsYXN0IHBhcnRcblx0XHRcdGZvciAobGV0IGkgPSAxOyBpIDwgcHJvcGVydHlQYXRoLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGFubm90YXRpb25QYXRoICs9IChpID4gMSA/IFwiL1wiIDogXCJcIikgKyBwcm9wZXJ0eVBhdGhbaV07XG5cdFx0XHRcdGlmIChhbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQFwiKSA+IC0xKSB7XG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoID0gW1wiY29udHJvbENvbmZpZ3VyYXRpb25cIiwgYW5ub3RhdGlvblBhdGhdLmNvbmNhdChwcm9wZXJ0eVBhdGguc2xpY2UoaSArIDEpKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRPYmplY3RQYXRoLnNldChwcm9wZXJ0eVBhdGgsIHZhbHVlLCBwYWdlU2V0dGluZ3MpO1xuXHR9IGVsc2Uge1xuXHRcdExvZy5lcnJvcihgTm8gRmlvcmkgZWxlbWVudHMgcGFnZSB3aXRoIElEICR7cGFnZUlkfSBmb3VuZCBpbiByb3V0aW5nIHRhcmdldHMuYCk7XG5cdH1cblxuXHRyZXR1cm4gbWFuaWZlc3Q7XG59XG5cbi8qKlxuICogU2VhcmNoIHRoZSBwYWdlIHNldHRpbmdzIGluIHRoZSBtYW5pZmVzdCBmb3IgYSBnaXZlbiBwYWdlIElELlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUubWFuaWZlc3RNZXJnZXIjZ2V0UGFnZVNldHRpbmdzXG4gKiBAcGFyYW0gbWFuaWZlc3QgVGhlIG1hbmlmZXN0IHdoZXJlIHRoZSBzZWFyY2ggaXMgY2FycmllZCBvdXQgdG8gZmluZCB0aGUgcGFnZSBzZXR0aW5ncy5cbiAqIEBwYXJhbSBwYWdlSWQgVGhlIElEIG9mIHRoZSBwYWdlLlxuICogQHJldHVybnMgVGhlIHBhZ2Ugc2V0dGluZ3MgZm9yIHRoZSBwYWdlIElEIG9yIHVuZGVmaW5lZCBpZiBub3QgZm91bmQuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBnZXRQYWdlU2V0dGluZ3MobWFuaWZlc3Q6IE1hbmlmZXN0Q29udGVudCwgcGFnZUlkOiBzdHJpbmcpOiBvYmplY3QgfCB1bmRlZmluZWQge1xuXHRsZXQgcGFnZVNldHRpbmdzO1xuXHRjb25zdCB0YXJnZXRzID0gbWFuaWZlc3RbXCJzYXAudWk1XCJdPy5yb3V0aW5nPy50YXJnZXRzID8/IHt9O1xuXHRmb3IgKGNvbnN0IHAgaW4gdGFyZ2V0cykge1xuXHRcdGlmICh0YXJnZXRzW3BdLmlkID09PSBwYWdlSWQgJiYgdGFyZ2V0c1twXS5uYW1lLnN0YXJ0c1dpdGgoXCJzYXAuZmUudGVtcGxhdGVzLlwiKSkge1xuXHRcdFx0cGFnZVNldHRpbmdzID0gdGFyZ2V0c1twXS5vcHRpb25zPy5zZXR0aW5ncyA/PyB7fTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcGFnZVNldHRpbmdzO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQW1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0EsV0FBVyxDQUFDQyxRQUF5QixFQUFFQyxNQUFjLEVBQVU7SUFDOUUsTUFBTUMsYUFBYSxHQUFHRCxNQUFNLENBQUNFLFVBQVUsRUFBRTtJQUN6QyxNQUFNQyxNQUFNLEdBQUdGLGFBQWEsYUFBYkEsYUFBYSx1QkFBYkEsYUFBYSxDQUFFRyxJQUFJO0lBQ2xDLE1BQU1DLGNBQWMsR0FBR0osYUFBYSxhQUFiQSxhQUFhLHVCQUFiQSxhQUFhLENBQUVLLG9CQUFvQjs7SUFFMUQ7SUFDQSxJQUNDLENBQUFELGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFRSxTQUFTLE1BQUssUUFBUSxJQUN0QyxFQUFDRixjQUFjLGFBQWRBLGNBQWMsZUFBZEEsY0FBYyxDQUFFRyxZQUFZLEtBQzdCLENBQUFILGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFSSxhQUFhLE1BQUtDLFNBQVMsSUFDM0NMLGNBQWMsYUFBZEEsY0FBYyxlQUFkQSxjQUFjLENBQUVHLFlBQVksQ0FBQ0csVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUMzQztNQUNEQyxHQUFHLENBQUNDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQztNQUMxQyxPQUFPZCxRQUFRO0lBQ2hCO0lBRUEsT0FBT2UsbUJBQW1CLENBQUNmLFFBQVEsRUFBRUksTUFBTSxFQUFFRSxjQUFjLENBQUNHLFlBQVksRUFBRUgsY0FBYyxDQUFDSSxhQUFhLENBQUM7RUFDeEc7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWJBO0VBY08sU0FBU0ssbUJBQW1CLENBQUNmLFFBQXlCLEVBQUVJLE1BQWMsRUFBRVksSUFBWSxFQUFFQyxLQUFjLEVBQVU7SUFDcEgsTUFBTUMsWUFBWSxHQUFHQyxlQUFlLENBQUNuQixRQUFRLEVBQUVJLE1BQU0sQ0FBQztJQUV0RCxJQUFJYyxZQUFZLEVBQUU7TUFDakIsSUFBSVQsWUFBWSxHQUFHTyxJQUFJLENBQUNJLEtBQUssQ0FBQyxHQUFHLENBQUM7TUFDbEMsSUFBSVgsWUFBWSxDQUFDLENBQUMsQ0FBQyxLQUFLLHNCQUFzQixFQUFFO1FBQy9DLElBQUlZLGNBQWMsR0FBRyxFQUFFO1FBQ3ZCO1FBQ0EsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdiLFlBQVksQ0FBQ2MsTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRTtVQUM3Q0QsY0FBYyxJQUFJLENBQUNDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsSUFBSWIsWUFBWSxDQUFDYSxDQUFDLENBQUM7VUFDdEQsSUFBSUQsY0FBYyxDQUFDRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDckNmLFlBQVksR0FBRyxDQUFDLHNCQUFzQixFQUFFWSxjQUFjLENBQUMsQ0FBQ0ksTUFBTSxDQUFDaEIsWUFBWSxDQUFDaUIsS0FBSyxDQUFDSixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekY7VUFDRDtRQUNEO01BQ0Q7TUFDQUssVUFBVSxDQUFDQyxHQUFHLENBQUNuQixZQUFZLEVBQUVRLEtBQUssRUFBRUMsWUFBWSxDQUFDO0lBQ2xELENBQUMsTUFBTTtNQUNOTCxHQUFHLENBQUNDLEtBQUssQ0FBRSxrQ0FBaUNWLE1BQU8sNEJBQTJCLENBQUM7SUFDaEY7SUFFQSxPQUFPSixRQUFRO0VBQ2hCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBVEE7RUFVQSxTQUFTbUIsZUFBZSxDQUFDbkIsUUFBeUIsRUFBRUksTUFBYyxFQUFzQjtJQUFBO0lBQ3ZGLElBQUljLFlBQVk7SUFDaEIsTUFBTVcsT0FBTyxHQUFHLG9CQUFBN0IsUUFBUSxDQUFDLFNBQVMsQ0FBQyw2RUFBbkIsZ0JBQXFCOEIsT0FBTywwREFBNUIsc0JBQThCRCxPQUFPLEtBQUksQ0FBQyxDQUFDO0lBQzNELEtBQUssTUFBTUUsQ0FBQyxJQUFJRixPQUFPLEVBQUU7TUFDeEIsSUFBSUEsT0FBTyxDQUFDRSxDQUFDLENBQUMsQ0FBQ0MsRUFBRSxLQUFLNUIsTUFBTSxJQUFJeUIsT0FBTyxDQUFDRSxDQUFDLENBQUMsQ0FBQ0UsSUFBSSxDQUFDckIsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEVBQUU7UUFBQTtRQUNoRk0sWUFBWSxHQUFHLHVCQUFBVyxPQUFPLENBQUNFLENBQUMsQ0FBQyxDQUFDRyxPQUFPLHVEQUFsQixtQkFBb0JDLFFBQVEsS0FBSSxDQUFDLENBQUM7UUFDakQ7TUFDRDtJQUNEO0lBQ0EsT0FBT2pCLFlBQVk7RUFDcEI7RUFBQztBQUFBIn0=