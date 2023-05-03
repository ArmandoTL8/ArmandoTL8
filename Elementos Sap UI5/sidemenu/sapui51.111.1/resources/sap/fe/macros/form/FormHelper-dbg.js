/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/library"], function (library) {
  "use strict";

  var TitleLevel = library.TitleLevel;
  /**
   * Helper class used by MDC controls for OData(V4) specific handling
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const FormHelper = {
    /*
     * Method that checks, if a reference facet needs to be assigned to either "blocks" or "moreBlocks" (tagged by subsection property "partOfPreview!)
     * @function isReferenceFacetPartOfPreview
     * @memberof sap.fe.macros.form.FormHelper.js
     * @param {Object} - oReferenceFacet : Reference facet that needs to be assigned
     * @param {String} - sPartOfPreview : Subsection property "partOfPreview" that needs to aligned with the reference facet's annotation "PartOfPreview!
     * @return : {boolean} True, if the ReferenceFacet has the same annotation as the subsection's property "partOfPreview"
     */
    isReferenceFacetPartOfPreview: function (oReferenceFacet, sPartOfPreview) {
      sPartOfPreview = sPartOfPreview.toString();
      if (oReferenceFacet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        const annotatedTerm = oReferenceFacet["@com.sap.vocabularies.UI.v1.PartOfPreview"];
        return sPartOfPreview === "true" && annotatedTerm !== false || sPartOfPreview === "false" && annotatedTerm === false;
      }
      return false;
    },
    /**
     * Creates and returns a select query with the selected fields from the parameters passed.
     *
     * @param aSemanticKeys SemanticKeys included in the entity set
     * @returns The fields to be included in the select query
     */
    create$Select: function (aSemanticKeys) {
      let sSelectedFields = "";
      aSemanticKeys.forEach(function (oSemanticKey) {
        sSelectedFields += sSelectedFields ? `,${oSemanticKey.$PropertyPath}` : oSemanticKey.$PropertyPath;
      });
      return sSelectedFields;
    },
    /**
     * Generates the binding expression for the form.
     *
     * @param sNavigationPath The navigation path defined for the entity
     * @param aSemanticKeys SemanticKeys included in the entity set
     * @returns The Binding expression including path and $select query as parameter depending on the function parameters
     */
    generateBindingExpression: function (sNavigationPath, aSemanticKeys) {
      if (!sNavigationPath && !aSemanticKeys) {
        return "";
      }
      const oBinding = {
        path: sNavigationPath || ""
      };
      if (aSemanticKeys) {
        oBinding.parameters = {
          $select: FormHelper.create$Select(aSemanticKeys)
        };
      }
      return JSON.stringify(oBinding);
    },
    /**
     * Calculates the title level for the containers in this form.
     *
     * If there is no form title, the form containers get the same header level as the form, otherwise the levels are incremented to reflect the deeper nesting.
     *
     * @param [title] The title of the form
     * @param [titleLevel] The title level of the form
     * @returns The title level of the form containers
     */
    getFormContainerTitleLevel: function (title, titleLevel) {
      if (!title) {
        return titleLevel;
      }
      switch (titleLevel) {
        case TitleLevel.H1:
          return TitleLevel.H2;
        case TitleLevel.H2:
          return TitleLevel.H3;
        case TitleLevel.H3:
          return TitleLevel.H4;
        case TitleLevel.H4:
          return TitleLevel.H5;
        case TitleLevel.H5:
        case TitleLevel.H6:
          return TitleLevel.H6;
        default:
          return TitleLevel.Auto;
      }
    }
  };
  return FormHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtSGVscGVyIiwiaXNSZWZlcmVuY2VGYWNldFBhcnRPZlByZXZpZXciLCJvUmVmZXJlbmNlRmFjZXQiLCJzUGFydE9mUHJldmlldyIsInRvU3RyaW5nIiwiJFR5cGUiLCJhbm5vdGF0ZWRUZXJtIiwiY3JlYXRlJFNlbGVjdCIsImFTZW1hbnRpY0tleXMiLCJzU2VsZWN0ZWRGaWVsZHMiLCJmb3JFYWNoIiwib1NlbWFudGljS2V5IiwiJFByb3BlcnR5UGF0aCIsImdlbmVyYXRlQmluZGluZ0V4cHJlc3Npb24iLCJzTmF2aWdhdGlvblBhdGgiLCJvQmluZGluZyIsInBhdGgiLCJwYXJhbWV0ZXJzIiwiJHNlbGVjdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZXRGb3JtQ29udGFpbmVyVGl0bGVMZXZlbCIsInRpdGxlIiwidGl0bGVMZXZlbCIsIlRpdGxlTGV2ZWwiLCJIMSIsIkgyIiwiSDMiLCJINCIsIkg1IiwiSDYiLCJBdXRvIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGb3JtSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRpdGxlTGV2ZWwgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuXG4vKipcbiAqIEhlbHBlciBjbGFzcyB1c2VkIGJ5IE1EQyBjb250cm9scyBmb3IgT0RhdGEoVjQpIHNwZWNpZmljIGhhbmRsaW5nXG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgaW50ZXJuYWwvZXhwZXJpbWVudGFsIHVzZSFcbiAqL1xuY29uc3QgRm9ybUhlbHBlciA9IHtcblx0Lypcblx0ICogTWV0aG9kIHRoYXQgY2hlY2tzLCBpZiBhIHJlZmVyZW5jZSBmYWNldCBuZWVkcyB0byBiZSBhc3NpZ25lZCB0byBlaXRoZXIgXCJibG9ja3NcIiBvciBcIm1vcmVCbG9ja3NcIiAodGFnZ2VkIGJ5IHN1YnNlY3Rpb24gcHJvcGVydHkgXCJwYXJ0T2ZQcmV2aWV3ISlcblx0ICogQGZ1bmN0aW9uIGlzUmVmZXJlbmNlRmFjZXRQYXJ0T2ZQcmV2aWV3XG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLmZvcm0uRm9ybUhlbHBlci5qc1xuXHQgKiBAcGFyYW0ge09iamVjdH0gLSBvUmVmZXJlbmNlRmFjZXQgOiBSZWZlcmVuY2UgZmFjZXQgdGhhdCBuZWVkcyB0byBiZSBhc3NpZ25lZFxuXHQgKiBAcGFyYW0ge1N0cmluZ30gLSBzUGFydE9mUHJldmlldyA6IFN1YnNlY3Rpb24gcHJvcGVydHkgXCJwYXJ0T2ZQcmV2aWV3XCIgdGhhdCBuZWVkcyB0byBhbGlnbmVkIHdpdGggdGhlIHJlZmVyZW5jZSBmYWNldCdzIGFubm90YXRpb24gXCJQYXJ0T2ZQcmV2aWV3IVxuXHQgKiBAcmV0dXJuIDoge2Jvb2xlYW59IFRydWUsIGlmIHRoZSBSZWZlcmVuY2VGYWNldCBoYXMgdGhlIHNhbWUgYW5ub3RhdGlvbiBhcyB0aGUgc3Vic2VjdGlvbidzIHByb3BlcnR5IFwicGFydE9mUHJldmlld1wiXG5cdCAqL1xuXHRpc1JlZmVyZW5jZUZhY2V0UGFydE9mUHJldmlldzogZnVuY3Rpb24gKG9SZWZlcmVuY2VGYWNldDogYW55LCBzUGFydE9mUHJldmlldzogYW55KSB7XG5cdFx0c1BhcnRPZlByZXZpZXcgPSBzUGFydE9mUHJldmlldy50b1N0cmluZygpO1xuXHRcdGlmIChvUmVmZXJlbmNlRmFjZXQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXRcIikge1xuXHRcdFx0Y29uc3QgYW5ub3RhdGVkVGVybSA9IG9SZWZlcmVuY2VGYWNldFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QYXJ0T2ZQcmV2aWV3XCJdO1xuXHRcdFx0cmV0dXJuIChzUGFydE9mUHJldmlldyA9PT0gXCJ0cnVlXCIgJiYgYW5ub3RhdGVkVGVybSAhPT0gZmFsc2UpIHx8IChzUGFydE9mUHJldmlldyA9PT0gXCJmYWxzZVwiICYmIGFubm90YXRlZFRlcm0gPT09IGZhbHNlKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgc2VsZWN0IHF1ZXJ5IHdpdGggdGhlIHNlbGVjdGVkIGZpZWxkcyBmcm9tIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZC5cblx0ICpcblx0ICogQHBhcmFtIGFTZW1hbnRpY0tleXMgU2VtYW50aWNLZXlzIGluY2x1ZGVkIGluIHRoZSBlbnRpdHkgc2V0XG5cdCAqIEByZXR1cm5zIFRoZSBmaWVsZHMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIHNlbGVjdCBxdWVyeVxuXHQgKi9cblx0Y3JlYXRlJFNlbGVjdDogZnVuY3Rpb24gKGFTZW1hbnRpY0tleXM6IGFueVtdKSB7XG5cdFx0bGV0IHNTZWxlY3RlZEZpZWxkcyA9IFwiXCI7XG5cdFx0YVNlbWFudGljS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VtYW50aWNLZXk6IGFueSkge1xuXHRcdFx0c1NlbGVjdGVkRmllbGRzICs9IHNTZWxlY3RlZEZpZWxkcyA/IGAsJHtvU2VtYW50aWNLZXkuJFByb3BlcnR5UGF0aH1gIDogb1NlbWFudGljS2V5LiRQcm9wZXJ0eVBhdGg7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHNTZWxlY3RlZEZpZWxkcztcblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBmb3JtLlxuXHQgKlxuXHQgKiBAcGFyYW0gc05hdmlnYXRpb25QYXRoIFRoZSBuYXZpZ2F0aW9uIHBhdGggZGVmaW5lZCBmb3IgdGhlIGVudGl0eVxuXHQgKiBAcGFyYW0gYVNlbWFudGljS2V5cyBTZW1hbnRpY0tleXMgaW5jbHVkZWQgaW4gdGhlIGVudGl0eSBzZXRcblx0ICogQHJldHVybnMgVGhlIEJpbmRpbmcgZXhwcmVzc2lvbiBpbmNsdWRpbmcgcGF0aCBhbmQgJHNlbGVjdCBxdWVyeSBhcyBwYXJhbWV0ZXIgZGVwZW5kaW5nIG9uIHRoZSBmdW5jdGlvbiBwYXJhbWV0ZXJzXG5cdCAqL1xuXHRnZW5lcmF0ZUJpbmRpbmdFeHByZXNzaW9uOiBmdW5jdGlvbiAoc05hdmlnYXRpb25QYXRoOiBzdHJpbmcsIGFTZW1hbnRpY0tleXM6IGFueVtdKSB7XG5cdFx0aWYgKCFzTmF2aWdhdGlvblBhdGggJiYgIWFTZW1hbnRpY0tleXMpIHtcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0XHRjb25zdCBvQmluZGluZzogYW55ID0ge1xuXHRcdFx0cGF0aDogc05hdmlnYXRpb25QYXRoIHx8IFwiXCJcblx0XHR9O1xuXHRcdGlmIChhU2VtYW50aWNLZXlzKSB7XG5cdFx0XHRvQmluZGluZy5wYXJhbWV0ZXJzID0geyAkc2VsZWN0OiBGb3JtSGVscGVyLmNyZWF0ZSRTZWxlY3QoYVNlbWFudGljS2V5cykgfTtcblx0XHR9XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9CaW5kaW5nKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyB0aGUgdGl0bGUgbGV2ZWwgZm9yIHRoZSBjb250YWluZXJzIGluIHRoaXMgZm9ybS5cblx0ICpcblx0ICogSWYgdGhlcmUgaXMgbm8gZm9ybSB0aXRsZSwgdGhlIGZvcm0gY29udGFpbmVycyBnZXQgdGhlIHNhbWUgaGVhZGVyIGxldmVsIGFzIHRoZSBmb3JtLCBvdGhlcndpc2UgdGhlIGxldmVscyBhcmUgaW5jcmVtZW50ZWQgdG8gcmVmbGVjdCB0aGUgZGVlcGVyIG5lc3RpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBbdGl0bGVdIFRoZSB0aXRsZSBvZiB0aGUgZm9ybVxuXHQgKiBAcGFyYW0gW3RpdGxlTGV2ZWxdIFRoZSB0aXRsZSBsZXZlbCBvZiB0aGUgZm9ybVxuXHQgKiBAcmV0dXJucyBUaGUgdGl0bGUgbGV2ZWwgb2YgdGhlIGZvcm0gY29udGFpbmVyc1xuXHQgKi9cblx0Z2V0Rm9ybUNvbnRhaW5lclRpdGxlTGV2ZWw6IGZ1bmN0aW9uICh0aXRsZT86IHN0cmluZywgdGl0bGVMZXZlbD86IFRpdGxlTGV2ZWwpOiBUaXRsZUxldmVsIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoIXRpdGxlKSB7XG5cdFx0XHRyZXR1cm4gdGl0bGVMZXZlbDtcblx0XHR9XG5cdFx0c3dpdGNoICh0aXRsZUxldmVsKSB7XG5cdFx0XHRjYXNlIFRpdGxlTGV2ZWwuSDE6XG5cdFx0XHRcdHJldHVybiBUaXRsZUxldmVsLkgyO1xuXHRcdFx0Y2FzZSBUaXRsZUxldmVsLkgyOlxuXHRcdFx0XHRyZXR1cm4gVGl0bGVMZXZlbC5IMztcblx0XHRcdGNhc2UgVGl0bGVMZXZlbC5IMzpcblx0XHRcdFx0cmV0dXJuIFRpdGxlTGV2ZWwuSDQ7XG5cdFx0XHRjYXNlIFRpdGxlTGV2ZWwuSDQ6XG5cdFx0XHRcdHJldHVybiBUaXRsZUxldmVsLkg1O1xuXHRcdFx0Y2FzZSBUaXRsZUxldmVsLkg1OlxuXHRcdFx0Y2FzZSBUaXRsZUxldmVsLkg2OlxuXHRcdFx0XHRyZXR1cm4gVGl0bGVMZXZlbC5INjtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBUaXRsZUxldmVsLkF1dG87XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBGb3JtSGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1BLFVBQVUsR0FBRztJQUNsQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLDZCQUE2QixFQUFFLFVBQVVDLGVBQW9CLEVBQUVDLGNBQW1CLEVBQUU7TUFDbkZBLGNBQWMsR0FBR0EsY0FBYyxDQUFDQyxRQUFRLEVBQUU7TUFDMUMsSUFBSUYsZUFBZSxDQUFDRyxLQUFLLEtBQUssMkNBQTJDLEVBQUU7UUFDMUUsTUFBTUMsYUFBYSxHQUFHSixlQUFlLENBQUMsMkNBQTJDLENBQUM7UUFDbEYsT0FBUUMsY0FBYyxLQUFLLE1BQU0sSUFBSUcsYUFBYSxLQUFLLEtBQUssSUFBTUgsY0FBYyxLQUFLLE9BQU8sSUFBSUcsYUFBYSxLQUFLLEtBQU07TUFDekg7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLGFBQWEsRUFBRSxVQUFVQyxhQUFvQixFQUFFO01BQzlDLElBQUlDLGVBQWUsR0FBRyxFQUFFO01BQ3hCRCxhQUFhLENBQUNFLE9BQU8sQ0FBQyxVQUFVQyxZQUFpQixFQUFFO1FBQ2xERixlQUFlLElBQUlBLGVBQWUsR0FBSSxJQUFHRSxZQUFZLENBQUNDLGFBQWMsRUFBQyxHQUFHRCxZQUFZLENBQUNDLGFBQWE7TUFDbkcsQ0FBQyxDQUFDO01BQ0YsT0FBT0gsZUFBZTtJQUN2QixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0kseUJBQXlCLEVBQUUsVUFBVUMsZUFBdUIsRUFBRU4sYUFBb0IsRUFBRTtNQUNuRixJQUFJLENBQUNNLGVBQWUsSUFBSSxDQUFDTixhQUFhLEVBQUU7UUFDdkMsT0FBTyxFQUFFO01BQ1Y7TUFDQSxNQUFNTyxRQUFhLEdBQUc7UUFDckJDLElBQUksRUFBRUYsZUFBZSxJQUFJO01BQzFCLENBQUM7TUFDRCxJQUFJTixhQUFhLEVBQUU7UUFDbEJPLFFBQVEsQ0FBQ0UsVUFBVSxHQUFHO1VBQUVDLE9BQU8sRUFBRWxCLFVBQVUsQ0FBQ08sYUFBYSxDQUFDQyxhQUFhO1FBQUUsQ0FBQztNQUMzRTtNQUNBLE9BQU9XLElBQUksQ0FBQ0MsU0FBUyxDQUFDTCxRQUFRLENBQUM7SUFDaEMsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDTSwwQkFBMEIsRUFBRSxVQUFVQyxLQUFjLEVBQUVDLFVBQXVCLEVBQTBCO01BQ3RHLElBQUksQ0FBQ0QsS0FBSyxFQUFFO1FBQ1gsT0FBT0MsVUFBVTtNQUNsQjtNQUNBLFFBQVFBLFVBQVU7UUFDakIsS0FBS0MsVUFBVSxDQUFDQyxFQUFFO1VBQ2pCLE9BQU9ELFVBQVUsQ0FBQ0UsRUFBRTtRQUNyQixLQUFLRixVQUFVLENBQUNFLEVBQUU7VUFDakIsT0FBT0YsVUFBVSxDQUFDRyxFQUFFO1FBQ3JCLEtBQUtILFVBQVUsQ0FBQ0csRUFBRTtVQUNqQixPQUFPSCxVQUFVLENBQUNJLEVBQUU7UUFDckIsS0FBS0osVUFBVSxDQUFDSSxFQUFFO1VBQ2pCLE9BQU9KLFVBQVUsQ0FBQ0ssRUFBRTtRQUNyQixLQUFLTCxVQUFVLENBQUNLLEVBQUU7UUFDbEIsS0FBS0wsVUFBVSxDQUFDTSxFQUFFO1VBQ2pCLE9BQU9OLFVBQVUsQ0FBQ00sRUFBRTtRQUNyQjtVQUNDLE9BQU9OLFVBQVUsQ0FBQ08sSUFBSTtNQUFDO0lBRTFCO0VBQ0QsQ0FBQztFQUFDLE9BRWEvQixVQUFVO0FBQUEifQ==