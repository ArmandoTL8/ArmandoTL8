/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/TemplateModel", "sap/fe/macros/MacroMetadata"], function (Log, FilterBar, MetaModelConverter, ModelHelper, TemplateModel, MacroMetadata) {
  "use strict";

  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getSelectionFields = FilterBar.getSelectionFields;
  var getExpandFilterFields = FilterBar.getExpandFilterFields;
  const ValueHelpFilterBar = MacroMetadata.extend("sap.fe.macros.valuehelp.ValueHelpFilterBar", {
    /**
     * Name of the macro control.
     */
    name: "ValueHelpFilterBar",
    /**
     * Namespace of the macro control
     */
    namespace: "sap.fe.macros.valuehelp",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
     */
    fragment: "sap.fe.macros.valuehelp.ValueHelpFilterBar",
    /**
     * The metadata describing the macro control.
     */
    metadata: {
      /**
       * Define macro stereotype for documentation
       */
      stereotype: "xmlmacro",
      /**
       * Location of the designtime info
       */
      designtime: "sap/fe/macros/valuehelp/ValueHelpFilterBar.designtime",
      /**
       * Properties.
       */
      properties: {
        /**
         * ID of the FilterBar
         */
        id: {
          type: "string"
        },
        contextPath: {
          type: "sap.ui.model.Context"
        },
        /**
         * Don't show the basic search field
         */
        hideBasicSearch: {
          type: "boolean",
          defaultValue: false
        },
        /**
         * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
         */
        enableFallback: {
          type: "boolean",
          defaultValue: false
        },
        /**
         * Specifies the personalization options for the filter bar.
         */
        p13nMode: {
          type: "sap.ui.mdc.FilterBarP13nMode[]"
        },
        /**
         * Specifies the Sematic Date Range option for the filter bar.
         */
        useSemanticDateRange: {
          type: "boolean",
          defaultValue: true
        },
        /**
         * If set the search will be automatically triggered, when a filter value was changed.
         */
        liveMode: {
          type: "boolean",
          defaultValue: false
        },
        /**
         * Temporary workaround only
         * path to valuelist
         */
        _valueList: {
          type: "sap.ui.model.Context",
          required: false
        },
        /**
         * selectionFields to be displayed
         */
        selectionFields: {
          type: "sap.ui.model.Context",
          required: false
        },
        /**
         * Filter conditions to be applied to the filter bar
         */
        filterConditions: {
          type: "string",
          required: false
        },
        /**
         * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
         * a search is triggered immediately if one or more search requests have been triggered in the meantime
         * but were ignored based on the setting.
         */
        suspendSelection: {
          type: "boolean",
          defaultValue: false
        },
        /**
         * Determines whether the Show/Hide Filters button is in the state show or hide.
         */
        expandFilterFields: {
          type: "boolean",
          defaultValue: true
        }
      },
      events: {
        /**
         * Search handler name
         */
        search: {
          type: "function"
        },
        /**
         * Filters changed handler name
         */
        filterChanged: {
          type: "function"
        }
      }
    },
    create: function (oProps, oControlConfiguration, mSettings) {
      const oContext = oProps.contextPath;
      if (!oContext) {
        Log.error("Context Path not available for FilterBar Macro.");
        return;
      }
      const sContextPath = oContext.getPath();
      const sEntitySetPath = ModelHelper.getEntitySetPath(sContextPath);
      const oMetaModel = oContext.getModel();
      let oConverterContext;
      if (!oProps.selectionFields) {
        const oMetaPathContext = oProps.metaPath;
        const sMetaPath = oMetaPathContext && oMetaPathContext.getPath();
        const oVisualizationObjectPath = getInvolvedDataModelObjects(oContext);
        oConverterContext = this.getConverterContext(oVisualizationObjectPath, undefined, mSettings);
        const oSelectionFields = getSelectionFields(oConverterContext, [], sMetaPath).selectionFields;
        oProps.selectionFields = new TemplateModel(oSelectionFields, oMetaModel).createBindingContext("/");
      }

      // TODO: this could be also moved into a central place
      if (oMetaModel.getObject(sEntitySetPath + "@com.sap.vocabularies.Common.v1.DraftRoot") || oMetaModel.getObject(sEntitySetPath + "@com.sap.vocabularies.Common.v1.DraftNode")) {
        oProps.showDraftEditState = true;
      }
      const oFilterRestrictionsAnnotation = oMetaModel.getObject(sEntitySetPath + "@Org.OData.Capabilities.V1.FilterRestrictions");
      oProps.expandFilterFields = getExpandFilterFields(oConverterContext, oFilterRestrictionsAnnotation, oProps._valueList);
      return oProps;
    }
  });
  return ValueHelpFilterBar;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUhlbHBGaWx0ZXJCYXIiLCJNYWNyb01ldGFkYXRhIiwiZXh0ZW5kIiwibmFtZSIsIm5hbWVzcGFjZSIsImZyYWdtZW50IiwibWV0YWRhdGEiLCJzdGVyZW90eXBlIiwiZGVzaWdudGltZSIsInByb3BlcnRpZXMiLCJpZCIsInR5cGUiLCJjb250ZXh0UGF0aCIsImhpZGVCYXNpY1NlYXJjaCIsImRlZmF1bHRWYWx1ZSIsImVuYWJsZUZhbGxiYWNrIiwicDEzbk1vZGUiLCJ1c2VTZW1hbnRpY0RhdGVSYW5nZSIsImxpdmVNb2RlIiwiX3ZhbHVlTGlzdCIsInJlcXVpcmVkIiwic2VsZWN0aW9uRmllbGRzIiwiZmlsdGVyQ29uZGl0aW9ucyIsInN1c3BlbmRTZWxlY3Rpb24iLCJleHBhbmRGaWx0ZXJGaWVsZHMiLCJldmVudHMiLCJzZWFyY2giLCJmaWx0ZXJDaGFuZ2VkIiwiY3JlYXRlIiwib1Byb3BzIiwib0NvbnRyb2xDb25maWd1cmF0aW9uIiwibVNldHRpbmdzIiwib0NvbnRleHQiLCJMb2ciLCJlcnJvciIsInNDb250ZXh0UGF0aCIsImdldFBhdGgiLCJzRW50aXR5U2V0UGF0aCIsIk1vZGVsSGVscGVyIiwiZ2V0RW50aXR5U2V0UGF0aCIsIm9NZXRhTW9kZWwiLCJnZXRNb2RlbCIsIm9Db252ZXJ0ZXJDb250ZXh0Iiwib01ldGFQYXRoQ29udGV4dCIsIm1ldGFQYXRoIiwic01ldGFQYXRoIiwib1Zpc3VhbGl6YXRpb25PYmplY3RQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiZ2V0Q29udmVydGVyQ29udGV4dCIsInVuZGVmaW5lZCIsIm9TZWxlY3Rpb25GaWVsZHMiLCJnZXRTZWxlY3Rpb25GaWVsZHMiLCJUZW1wbGF0ZU1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJnZXRPYmplY3QiLCJzaG93RHJhZnRFZGl0U3RhdGUiLCJvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiIsImdldEV4cGFuZEZpbHRlckZpZWxkcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmFsdWVIZWxwRmlsdGVyQmFyLm1ldGFkYXRhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGNsYXNzZGVzY1xuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmlsdGVyQmFyIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBPRGF0YSBWNCBtZXRhZGF0YS5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86RmlsdGVyQmFyXG4gKiAgIGlkPVwiU29tZUlEXCJcbiAqICAgZW50aXR5U2V0PVwie2VudGl0eVNldD59XCJcbiAqICAgaGlkZUJhc2ljU2VhcmNoPVwiZmFsc2VcIlxuICogICBwMTNuTW9kZT1bXCJJdGVtXCIsXCJWYWx1ZVwiXVxuICogICBsaXN0QmluZGluZ05hbWVzID0gXCJzYXAuZmUudGFibGVCaW5kaW5nXCJcbiAqICAgbGl2ZU1vZGU9XCJ0cnVlXCJcbiAqICAgc2VhcmNoPVwiLmhhbmRsZXJzLm9uU2VhcmNoXCJcbiAqICAgZmlsdGVyQ2hhbmdlZD1cIi5oYW5kbGVycy5vbkZpbHRlcnNDaGFuZ2VkXCJcbiAqIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGaWx0ZXJCYXIgYmFzZWQgb24gdGhlIHByb3ZpZGVkIE9EYXRhIFY0IG1ldGFkYXRhLlxuICogQGNsYXNzIHNhcC5mZS5tYWNyb3MuRmlsdGVyQmFyXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGdldEV4cGFuZEZpbHRlckZpZWxkcywgZ2V0U2VsZWN0aW9uRmllbGRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXJcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgVGVtcGxhdGVNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVNb2RlbFwiO1xuaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuXG5jb25zdCBWYWx1ZUhlbHBGaWx0ZXJCYXIgPSBNYWNyb01ldGFkYXRhLmV4dGVuZChcInNhcC5mZS5tYWNyb3MudmFsdWVoZWxwLlZhbHVlSGVscEZpbHRlckJhclwiLCB7XG5cdC8qKlxuXHQgKiBOYW1lIG9mIHRoZSBtYWNybyBjb250cm9sLlxuXHQgKi9cblx0bmFtZTogXCJWYWx1ZUhlbHBGaWx0ZXJCYXJcIixcblx0LyoqXG5cdCAqIE5hbWVzcGFjZSBvZiB0aGUgbWFjcm8gY29udHJvbFxuXHQgKi9cblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MudmFsdWVoZWxwXCIsXG5cdC8qKlxuXHQgKiBGcmFnbWVudCBzb3VyY2Ugb2YgdGhlIG1hY3JvIChvcHRpb25hbCkgLSBpZiBub3Qgc2V0LCBmcmFnbWVudCBpcyBnZW5lcmF0ZWQgZnJvbSBuYW1lc3BhY2UgYW5kIG5hbWVcblx0ICovXG5cdGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MudmFsdWVoZWxwLlZhbHVlSGVscEZpbHRlckJhclwiLFxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0YWRhdGEgZGVzY3JpYmluZyB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lIG1hY3JvIHN0ZXJlb3R5cGUgZm9yIGRvY3VtZW50YXRpb25cblx0XHQgKi9cblx0XHRzdGVyZW90eXBlOiBcInhtbG1hY3JvXCIsXG5cdFx0LyoqXG5cdFx0ICogTG9jYXRpb24gb2YgdGhlIGRlc2lnbnRpbWUgaW5mb1xuXHRcdCAqL1xuXHRcdGRlc2lnbnRpbWU6IFwic2FwL2ZlL21hY3Jvcy92YWx1ZWhlbHAvVmFsdWVIZWxwRmlsdGVyQmFyLmRlc2lnbnRpbWVcIixcblx0XHQvKipcblx0XHQgKiBQcm9wZXJ0aWVzLlxuXHRcdCAqL1xuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdC8qKlxuXHRcdFx0ICogSUQgb2YgdGhlIEZpbHRlckJhclxuXHRcdFx0ICovXG5cdFx0XHRpZDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0Y29udGV4dFBhdGg6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEb24ndCBzaG93IHRoZSBiYXNpYyBzZWFyY2ggZmllbGRcblx0XHRcdCAqL1xuXHRcdFx0aGlkZUJhc2ljU2VhcmNoOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVuYWJsZXMgdGhlIGZhbGxiYWNrIHRvIHNob3cgYWxsIGZpZWxkcyBvZiB0aGUgRW50aXR5VHlwZSBhcyBmaWx0ZXIgZmllbGRzIGlmIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkcyBhcmUgbm90IHByZXNlbnRcblx0XHRcdCAqL1xuXHRcdFx0ZW5hYmxlRmFsbGJhY2s6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHRoZSBwZXJzb25hbGl6YXRpb24gb3B0aW9ucyBmb3IgdGhlIGZpbHRlciBiYXIuXG5cdFx0XHQgKi9cblx0XHRcdHAxM25Nb2RlOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1kYy5GaWx0ZXJCYXJQMTNuTW9kZVtdXCJcblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHRoZSBTZW1hdGljIERhdGUgUmFuZ2Ugb3B0aW9uIGZvciB0aGUgZmlsdGVyIGJhci5cblx0XHRcdCAqL1xuXHRcdFx0dXNlU2VtYW50aWNEYXRlUmFuZ2U6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogdHJ1ZVxuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJZiBzZXQgdGhlIHNlYXJjaCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgdHJpZ2dlcmVkLCB3aGVuIGEgZmlsdGVyIHZhbHVlIHdhcyBjaGFuZ2VkLlxuXHRcdFx0ICovXG5cdFx0XHRsaXZlTW9kZToge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogVGVtcG9yYXJ5IHdvcmthcm91bmQgb25seVxuXHRcdFx0ICogcGF0aCB0byB2YWx1ZWxpc3Rcblx0XHRcdCAqL1xuXHRcdFx0X3ZhbHVlTGlzdDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogc2VsZWN0aW9uRmllbGRzIHRvIGJlIGRpc3BsYXllZFxuXHRcdFx0ICovXG5cdFx0XHRzZWxlY3Rpb25GaWVsZHM6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEZpbHRlciBjb25kaXRpb25zIHRvIGJlIGFwcGxpZWQgdG8gdGhlIGZpbHRlciBiYXJcblx0XHRcdCAqL1xuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uczoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRyZXF1aXJlZDogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIElmIHNldCB0byA8Y29kZT50cnVlPC9jb2RlPiwgYWxsIHNlYXJjaCByZXF1ZXN0cyBhcmUgaWdub3JlZC4gT25jZSBpdCBoYXMgYmVlbiBzZXQgdG8gPGNvZGU+ZmFsc2U8L2NvZGU+LFxuXHRcdFx0ICogYSBzZWFyY2ggaXMgdHJpZ2dlcmVkIGltbWVkaWF0ZWx5IGlmIG9uZSBvciBtb3JlIHNlYXJjaCByZXF1ZXN0cyBoYXZlIGJlZW4gdHJpZ2dlcmVkIGluIHRoZSBtZWFudGltZVxuXHRcdFx0ICogYnV0IHdlcmUgaWdub3JlZCBiYXNlZCBvbiB0aGUgc2V0dGluZy5cblx0XHRcdCAqL1xuXHRcdFx0c3VzcGVuZFNlbGVjdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBTaG93L0hpZGUgRmlsdGVycyBidXR0b24gaXMgaW4gdGhlIHN0YXRlIHNob3cgb3IgaGlkZS5cblx0XHRcdCAqL1xuXHRcdFx0ZXhwYW5kRmlsdGVyRmllbGRzOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0XHRcdH1cblx0XHR9LFxuXHRcdGV2ZW50czoge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBTZWFyY2ggaGFuZGxlciBuYW1lXG5cdFx0XHQgKi9cblx0XHRcdHNlYXJjaDoge1xuXHRcdFx0XHR0eXBlOiBcImZ1bmN0aW9uXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEZpbHRlcnMgY2hhbmdlZCBoYW5kbGVyIG5hbWVcblx0XHRcdCAqL1xuXHRcdFx0ZmlsdGVyQ2hhbmdlZDoge1xuXHRcdFx0XHR0eXBlOiBcImZ1bmN0aW9uXCJcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGNyZWF0ZTogZnVuY3Rpb24gKG9Qcm9wczogYW55LCBvQ29udHJvbENvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IG9Qcm9wcy5jb250ZXh0UGF0aDtcblxuXHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdExvZy5lcnJvcihcIkNvbnRleHQgUGF0aCBub3QgYXZhaWxhYmxlIGZvciBGaWx0ZXJCYXIgTWFjcm8uXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNDb250ZXh0UGF0aCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0bGV0IG9Db252ZXJ0ZXJDb250ZXh0O1xuXHRcdGlmICghb1Byb3BzLnNlbGVjdGlvbkZpZWxkcykge1xuXHRcdFx0Y29uc3Qgb01ldGFQYXRoQ29udGV4dCA9IG9Qcm9wcy5tZXRhUGF0aDtcblx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhUGF0aENvbnRleHQgJiYgb01ldGFQYXRoQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRjb25zdCBvVmlzdWFsaXphdGlvbk9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob0NvbnRleHQpO1xuXHRcdFx0b0NvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQob1Zpc3VhbGl6YXRpb25PYmplY3RQYXRoLCB1bmRlZmluZWQsIG1TZXR0aW5ncyk7XG5cblx0XHRcdGNvbnN0IG9TZWxlY3Rpb25GaWVsZHMgPSBnZXRTZWxlY3Rpb25GaWVsZHMob0NvbnZlcnRlckNvbnRleHQsIFtdLCBzTWV0YVBhdGgpLnNlbGVjdGlvbkZpZWxkcztcblx0XHRcdG9Qcm9wcy5zZWxlY3Rpb25GaWVsZHMgPSBuZXcgVGVtcGxhdGVNb2RlbChvU2VsZWN0aW9uRmllbGRzLCBvTWV0YU1vZGVsKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdFx0fVxuXG5cdFx0Ly8gVE9ETzogdGhpcyBjb3VsZCBiZSBhbHNvIG1vdmVkIGludG8gYSBjZW50cmFsIHBsYWNlXG5cdFx0aWYgKFxuXHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVNldFBhdGggKyBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCIpIHx8XG5cdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChzRW50aXR5U2V0UGF0aCArIFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVcIilcblx0XHQpIHtcblx0XHRcdG9Qcm9wcy5zaG93RHJhZnRFZGl0U3RhdGUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVNldFBhdGggKyBcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlclJlc3RyaWN0aW9uc1wiKTtcblx0XHRvUHJvcHMuZXhwYW5kRmlsdGVyRmllbGRzID0gZ2V0RXhwYW5kRmlsdGVyRmllbGRzKG9Db252ZXJ0ZXJDb250ZXh0LCBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiwgb1Byb3BzLl92YWx1ZUxpc3QpO1xuXG5cdFx0cmV0dXJuIG9Qcm9wcztcblx0fVxufSk7XG5leHBvcnQgZGVmYXVsdCBWYWx1ZUhlbHBGaWx0ZXJCYXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7RUFnQ0EsTUFBTUEsa0JBQWtCLEdBQUdDLGFBQWEsQ0FBQ0MsTUFBTSxDQUFDLDRDQUE0QyxFQUFFO0lBQzdGO0FBQ0Q7QUFDQTtJQUNDQyxJQUFJLEVBQUUsb0JBQW9CO0lBQzFCO0FB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