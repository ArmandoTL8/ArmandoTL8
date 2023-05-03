/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  // Provides the Design Time Metadata for the sap.fe.macros.FilterBar macro.
  return {
    annotations: {
      /**
       * Defines a collection of properties that might be relevant for filtering a collection of entities.
       * These properties are rendered as filter fields on the UI.
       *
       * <br>
       * <i>Example in OData V4 notation defining selection fields in the Filter Bar</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.SalesOrderManage"&gt;
       *   &lt;Annotation Term="com.sap.vocabularies.UI.v1"&gt;
       *     &lt;Collection&gt;
       *     &lt;PropertyPath&gt;SalesOrder&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;SoldToParty&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;OverallSDProcessStatus&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;SalesOrderDate&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;ShippingCondition&lt;/PropertyPath&gt;
       *     &lt;PropertyPath&gt;LastChangedDateTime&lt;/PropertyPath&gt;
       *     &lt;/Collection&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#SelectionFields  com.sap.vocabularies.UI.v1.SelectionFields}</b><br/>
       *   </li>
       * </ul>
       */
      selectionFields: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "SelectionFields",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Defines if the Search Field in the filter bar is enabled.
       * Property "hideBasicSearch" must not be true.
       *
       * <br>
       * <i>Example in OData V4 Search Field in Filter Bar be rendered.</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.SalesOrderManage"&gt;
       *   &lt;Annotation Term="Org.OData.Capabilities.V1.SearchRestrictions"&gt;
       *     &lt;Record&gt;
       *       &lt;PropertyValue Property="Searchable" Bool="true" /&gt;
       *     &lt;/Record&gt;
       *   &lt;/Annotation&gt;
       * &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Capabilities.V1.md#SearchRestrictions org.OData.Capabilities.V1.SearchRestrictions}</b><br/>
       *   </li>
       * </ul>
       */
      searchRestrictions: {
        namespace: "org.OData.Capabilities.V1",
        annotation: "SearchRestrictions",
        target: ["EntitySet"],
        since: "1.75"
      }
    }
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsInNlbGVjdGlvbkZpZWxkcyIsIm5hbWVzcGFjZSIsImFubm90YXRpb24iLCJ0YXJnZXQiLCJzaW5jZSIsInNlYXJjaFJlc3RyaWN0aW9ucyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmFsdWVIZWxwRmlsdGVyQmFyLmRlc2lnbnRpbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUHJvdmlkZXMgdGhlIERlc2lnbiBUaW1lIE1ldGFkYXRhIGZvciB0aGUgc2FwLmZlLm1hY3Jvcy5GaWx0ZXJCYXIgbWFjcm8uXG5leHBvcnQgZGVmYXVsdCB7XG5cdGFubm90YXRpb25zOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyBhIGNvbGxlY3Rpb24gb2YgcHJvcGVydGllcyB0aGF0IG1pZ2h0IGJlIHJlbGV2YW50IGZvciBmaWx0ZXJpbmcgYSBjb2xsZWN0aW9uIG9mIGVudGl0aWVzLlxuXHRcdCAqIFRoZXNlIHByb3BlcnRpZXMgYXJlIHJlbmRlcmVkIGFzIGZpbHRlciBmaWVsZHMgb24gdGhlIFVJLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gZGVmaW5pbmcgc2VsZWN0aW9uIGZpZWxkcyBpbiB0aGUgRmlsdGVyIEJhcjwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogJmx0O0Fubm90YXRpb25zIFRhcmdldD1cImNvbS5jX3NhbGVzb3JkZXJtYW5hZ2Vfc2QuU2FsZXNPcmRlck1hbmFnZVwiJmd0O1xuXHRcdCAqICAgJmx0O0Fubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCImZ3Q7XG5cdFx0ICogICAgICZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAmbHQ7UHJvcGVydHlQYXRoJmd0O1NhbGVzT3JkZXImbHQ7L1Byb3BlcnR5UGF0aCZndDtcblx0XHQgKiAgICAgJmx0O1Byb3BlcnR5UGF0aCZndDtTb2xkVG9QYXJ0eSZsdDsvUHJvcGVydHlQYXRoJmd0O1xuXHRcdCAqICAgICAmbHQ7UHJvcGVydHlQYXRoJmd0O092ZXJhbGxTRFByb2Nlc3NTdGF0dXMmbHQ7L1Byb3BlcnR5UGF0aCZndDtcblx0XHQgKiAgICAgJmx0O1Byb3BlcnR5UGF0aCZndDtTYWxlc09yZGVyRGF0ZSZsdDsvUHJvcGVydHlQYXRoJmd0O1xuXHRcdCAqICAgICAmbHQ7UHJvcGVydHlQYXRoJmd0O1NoaXBwaW5nQ29uZGl0aW9uJmx0Oy9Qcm9wZXJ0eVBhdGgmZ3Q7XG5cdFx0ICogICAgICZsdDtQcm9wZXJ0eVBhdGgmZ3Q7TGFzdENoYW5nZWREYXRlVGltZSZsdDsvUHJvcGVydHlQYXRoJmd0O1xuXHRcdCAqICAgICAmbHQ7L0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAmbHQ7L0Fubm90YXRpb24mZ3Q7XG5cdFx0ICogJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNTZWxlY3Rpb25GaWVsZHMgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc308L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHRzZWxlY3Rpb25GaWVsZHM6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJTZWxlY3Rpb25GaWVsZHNcIixcblx0XHRcdHRhcmdldDogW1wiRW50aXR5VHlwZVwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyBpZiB0aGUgU2VhcmNoIEZpZWxkIGluIHRoZSBmaWx0ZXIgYmFyIGlzIGVuYWJsZWQuXG5cdFx0ICogUHJvcGVydHkgXCJoaWRlQmFzaWNTZWFyY2hcIiBtdXN0IG5vdCBiZSB0cnVlLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgU2VhcmNoIEZpZWxkIGluIEZpbHRlciBCYXIgYmUgcmVuZGVyZWQuPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PVwiY29tLmNfc2FsZXNvcmRlcm1hbmFnZV9zZC5TYWxlc09yZGVyTWFuYWdlXCImZ3Q7XG5cdFx0ICogICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TZWFyY2hSZXN0cmljdGlvbnNcIiZndDtcblx0XHQgKiAgICAgJmx0O1JlY29yZCZndDtcblx0XHQgKiAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlNlYXJjaGFibGVcIiBCb29sPVwidHJ1ZVwiIC8mZ3Q7XG5cdFx0ICogICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vb2FzaXMtdGNzL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5tZCNTZWFyY2hSZXN0cmljdGlvbnMgb3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TZWFyY2hSZXN0cmljdGlvbnN9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0c2VhcmNoUmVzdHJpY3Rpb25zOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwib3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJTZWFyY2hSZXN0cmljdGlvbnNcIixcblx0XHRcdHRhcmdldDogW1wiRW50aXR5U2V0XCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fVxuXHR9XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBQUE7RUFBQSxPQUNlO0lBQ2RBLFdBQVcsRUFBRTtNQUNaO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUMsZUFBZSxFQUFFO1FBQ2hCQyxTQUFTLEVBQUUsNEJBQTRCO1FBQ3ZDQyxVQUFVLEVBQUUsaUJBQWlCO1FBQzdCQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDdEJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUMsa0JBQWtCLEVBQUU7UUFDbkJKLFNBQVMsRUFBRSwyQkFBMkI7UUFDdENDLFVBQVUsRUFBRSxvQkFBb0I7UUFDaENDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUNyQkMsS0FBSyxFQUFFO01BQ1I7SUFDRDtFQUNELENBQUM7QUFBQSJ9