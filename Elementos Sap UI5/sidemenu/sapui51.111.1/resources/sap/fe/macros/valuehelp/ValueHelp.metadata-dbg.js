/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ModelHelper", "sap/fe/macros/MacroMetadata"], function (ModelHelper, MacroMetadata) {
  "use strict";

  const ValueHelp = MacroMetadata.extend("sap.fe.macros.ValueHelp", {
    /**
     * Name of the macro control.
     */
    name: "ValueHelp",
    /**
     * Namespace of the macro control.
     */
    namespace: "sap.fe.macros",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name.
     */
    fragment: "sap.fe.macros.internal.valuehelp.ValueHelp",
    /**
     * The metadata describing the macro control.
     */
    metadata: {
      /**
       * Macro stereotype for documentation generation. Not visible in documentation.
       */
      stereotype: "xmlmacro",
      /**
       * Location of the designtime information.
       */
      designtime: "sap/fe/macros/valuehelp/ValueHelp.designtime",
      /**
       * Properties.
       */
      properties: {
        /**
         * A prefix that is added to the generated ID of the value help.
         */
        idPrefix: {
          type: "string",
          defaultValue: "ValueHelp"
        },
        /**
         * Defines the metadata path to the property.
         */
        property: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: ["Property"]
        },
        contextPath: {
          type: "sap.ui.model.Context",
          required: true
        },
        /**
         * Indicator whether the value help is for a filter field.
         */
        conditionModel: {
          type: "string",
          defaultValue: ""
        },
        /**
         * Indicates that this is a value help of a filter field. Necessary to decide if a
         * validation should occur on the back end or already on the client.
         */
        filterFieldValueHelp: {
          type: "boolean",
          defaultValue: false
        },
        /**
         * Specifies the Sematic Date Range option for the filter field.
         */
        useSemanticDateRange: {
          type: "boolean",
          defaultValue: true
        },
        /**
         * GroupId for the valueHelp table
         */
        requestGroupId: {
          type: "string",
          defaultValue: "",
          computed: true
        },
        /**
         * Specifies whether the ValueHelp can be used with a MultiValueField
         */
        useMultiValueField: {
          type: "boolean",
          defaultValue: false
        },
        navigationPrefix: {
          type: "string"
        },
        collaborationEnabled: {
          type: "boolean",
          computed: true
        },
        requiresValidation: {
          type: "boolean",
          defaultValue: false
        }
      },
      events: {}
    },
    create: function (oProps, oControlConfiguration, oAppComponent) {
      Object.keys(this.metadata.properties).forEach(sPropertyName => {
        const oProperty = this.metadata.properties[sPropertyName];
        if (oProperty.type === "boolean") {
          if (typeof oProps[sPropertyName] === "string") {
            oProps[sPropertyName] = oProps[sPropertyName] === "true";
          }
        }
      });
      oProps.requestGroupId = "$auto.Workers";
      const oMetaModel = oAppComponent.models.metaModel || oAppComponent.models.entitySet;
      if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
        oProps.collaborationEnabled = true;
      }
      return oProps;
    }
  });
  return ValueHelp;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUhlbHAiLCJNYWNyb01ldGFkYXRhIiwiZXh0ZW5kIiwibmFtZSIsIm5hbWVzcGFjZSIsImZyYWdtZW50IiwibWV0YWRhdGEiLCJzdGVyZW90eXBlIiwiZGVzaWdudGltZSIsInByb3BlcnRpZXMiLCJpZFByZWZpeCIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJwcm9wZXJ0eSIsInJlcXVpcmVkIiwiJGtpbmQiLCJjb250ZXh0UGF0aCIsImNvbmRpdGlvbk1vZGVsIiwiZmlsdGVyRmllbGRWYWx1ZUhlbHAiLCJ1c2VTZW1hbnRpY0RhdGVSYW5nZSIsInJlcXVlc3RHcm91cElkIiwiY29tcHV0ZWQiLCJ1c2VNdWx0aVZhbHVlRmllbGQiLCJuYXZpZ2F0aW9uUHJlZml4IiwiY29sbGFib3JhdGlvbkVuYWJsZWQiLCJyZXF1aXJlc1ZhbGlkYXRpb24iLCJldmVudHMiLCJjcmVhdGUiLCJvUHJvcHMiLCJvQ29udHJvbENvbmZpZ3VyYXRpb24iLCJvQXBwQ29tcG9uZW50IiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzUHJvcGVydHlOYW1lIiwib1Byb3BlcnR5Iiwib01ldGFNb2RlbCIsIm1vZGVscyIsIm1ldGFNb2RlbCIsImVudGl0eVNldCIsIk1vZGVsSGVscGVyIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZhbHVlSGVscC5tZXRhZGF0YS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBjbGFzc2Rlc2NcbiAqIE1hY3JvIGZvciBjcmVhdGluZyBhIFZhbHVlSGVscCBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgT0RhdGEgVjQgbWV0YWRhdGEuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOlZhbHVlSGVscFxuICogICBpZFByZWZpeD1cIlNvbWVQcmVmaXhcIlxuICogICBwcm9wZXJ0eT1cIntzb21lUHJvcGVydHkmZ3Q7fVwiXG4gKiAgIGNvbmRpdGlvbk1vZGVsPVwiJGZpbHRlcnNcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICogQGNsYXNzIHNhcC5mZS5tYWNyb3MuVmFsdWVIZWxwXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNYWNyb01ldGFkYXRhIGZyb20gXCJzYXAvZmUvbWFjcm9zL01hY3JvTWV0YWRhdGFcIjtcblxuY29uc3QgVmFsdWVIZWxwID0gTWFjcm9NZXRhZGF0YS5leHRlbmQoXCJzYXAuZmUubWFjcm9zLlZhbHVlSGVscFwiLCB7XG5cdC8qKlxuXHQgKiBOYW1lIG9mIHRoZSBtYWNybyBjb250cm9sLlxuXHQgKi9cblx0bmFtZTogXCJWYWx1ZUhlbHBcIixcblx0LyoqXG5cdCAqIE5hbWVzcGFjZSBvZiB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdC8qKlxuXHQgKiBGcmFnbWVudCBzb3VyY2Ugb2YgdGhlIG1hY3JvIChvcHRpb25hbCkgLSBpZiBub3Qgc2V0LCBmcmFnbWVudCBpcyBnZW5lcmF0ZWQgZnJvbSBuYW1lc3BhY2UgYW5kIG5hbWUuXG5cdCAqL1xuXHRmcmFnbWVudDogXCJzYXAuZmUubWFjcm9zLmludGVybmFsLnZhbHVlaGVscC5WYWx1ZUhlbHBcIixcblxuXHQvKipcblx0ICogVGhlIG1ldGFkYXRhIGRlc2NyaWJpbmcgdGhlIG1hY3JvIGNvbnRyb2wuXG5cdCAqL1xuXHRtZXRhZGF0YToge1xuXHRcdC8qKlxuXHRcdCAqIE1hY3JvIHN0ZXJlb3R5cGUgZm9yIGRvY3VtZW50YXRpb24gZ2VuZXJhdGlvbi4gTm90IHZpc2libGUgaW4gZG9jdW1lbnRhdGlvbi5cblx0XHQgKi9cblx0XHRzdGVyZW90eXBlOiBcInhtbG1hY3JvXCIsXG5cdFx0LyoqXG5cdFx0ICogTG9jYXRpb24gb2YgdGhlIGRlc2lnbnRpbWUgaW5mb3JtYXRpb24uXG5cdFx0ICovXG5cdFx0ZGVzaWdudGltZTogXCJzYXAvZmUvbWFjcm9zL3ZhbHVlaGVscC9WYWx1ZUhlbHAuZGVzaWdudGltZVwiLFxuXHRcdC8qKlxuXHRcdCAqIFByb3BlcnRpZXMuXG5cdFx0ICovXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBBIHByZWZpeCB0aGF0IGlzIGFkZGVkIHRvIHRoZSBnZW5lcmF0ZWQgSUQgb2YgdGhlIHZhbHVlIGhlbHAuXG5cdFx0XHQgKi9cblx0XHRcdGlkUHJlZml4OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJWYWx1ZUhlbHBcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogRGVmaW5lcyB0aGUgbWV0YWRhdGEgcGF0aCB0byB0aGUgcHJvcGVydHkuXG5cdFx0XHQgKi9cblx0XHRcdHByb3BlcnR5OiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0XHRcdCRraW5kOiBbXCJQcm9wZXJ0eVwiXVxuXHRcdFx0fSxcblx0XHRcdGNvbnRleHRQYXRoOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEluZGljYXRvciB3aGV0aGVyIHRoZSB2YWx1ZSBoZWxwIGlzIGZvciBhIGZpbHRlciBmaWVsZC5cblx0XHRcdCAqL1xuXHRcdFx0Y29uZGl0aW9uTW9kZWw6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBcIlwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJbmRpY2F0ZXMgdGhhdCB0aGlzIGlzIGEgdmFsdWUgaGVscCBvZiBhIGZpbHRlciBmaWVsZC4gTmVjZXNzYXJ5IHRvIGRlY2lkZSBpZiBhXG5cdFx0XHQgKiB2YWxpZGF0aW9uIHNob3VsZCBvY2N1ciBvbiB0aGUgYmFjayBlbmQgb3IgYWxyZWFkeSBvbiB0aGUgY2xpZW50LlxuXHRcdFx0ICovXG5cdFx0XHRmaWx0ZXJGaWVsZFZhbHVlSGVscDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHRoZSBTZW1hdGljIERhdGUgUmFuZ2Ugb3B0aW9uIGZvciB0aGUgZmlsdGVyIGZpZWxkLlxuXHRcdFx0ICovXG5cdFx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZToge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBHcm91cElkIGZvciB0aGUgdmFsdWVIZWxwIHRhYmxlXG5cdFx0XHQgKi9cblx0XHRcdHJlcXVlc3RHcm91cElkOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJcIixcblx0XHRcdFx0Y29tcHV0ZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBWYWx1ZUhlbHAgY2FuIGJlIHVzZWQgd2l0aCBhIE11bHRpVmFsdWVGaWVsZFxuXHRcdFx0ICovXG5cdFx0XHR1c2VNdWx0aVZhbHVlRmllbGQ6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0XHRcdH0sXG5cblx0XHRcdG5hdmlnYXRpb25QcmVmaXg6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdGNvbGxhYm9yYXRpb25FbmFibGVkOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRjb21wdXRlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdHJlcXVpcmVzVmFsaWRhdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRldmVudHM6IHt9XG5cdH0sXG5cdGNyZWF0ZTogZnVuY3Rpb24gKG9Qcm9wczogYW55LCBvQ29udHJvbENvbmZpZ3VyYXRpb246IGFueSwgb0FwcENvbXBvbmVudDogYW55KSB7XG5cdFx0T2JqZWN0LmtleXModGhpcy5tZXRhZGF0YS5wcm9wZXJ0aWVzKS5mb3JFYWNoKChzUHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRjb25zdCBvUHJvcGVydHkgPSB0aGlzLm1ldGFkYXRhLnByb3BlcnRpZXNbc1Byb3BlcnR5TmFtZV07XG5cdFx0XHRpZiAob1Byb3BlcnR5LnR5cGUgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygb1Byb3BzW3NQcm9wZXJ0eU5hbWVdID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0b1Byb3BzW3NQcm9wZXJ0eU5hbWVdID0gb1Byb3BzW3NQcm9wZXJ0eU5hbWVdID09PSBcInRydWVcIjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG9Qcm9wcy5yZXF1ZXN0R3JvdXBJZCA9IFwiJGF1dG8uV29ya2Vyc1wiO1xuXG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9BcHBDb21wb25lbnQubW9kZWxzLm1ldGFNb2RlbCB8fCBvQXBwQ29tcG9uZW50Lm1vZGVscy5lbnRpdHlTZXQ7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkKG9NZXRhTW9kZWwpKSB7XG5cdFx0XHRvUHJvcHMuY29sbGFib3JhdGlvbkVuYWJsZWQgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gb1Byb3BzO1xuXHR9XG59KTtcbmV4cG9ydCBkZWZhdWx0IFZhbHVlSGVscDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQXFCQSxNQUFNQSxTQUFTLEdBQUdDLGFBQWEsQ0FBQ0MsTUFBTSxDQUFDLHlCQUF5QixFQUFFO0lBQ2pFO0FBQ0Q7QUFDQTtJQUNDQyxJQUFJLEVBQUUsV0FBVztJQUNqQjtBQUNEO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFLGVBQWU7SUFDMUI7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRSw0Q0FBNEM7SUFFdEQ7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRTtNQUNUO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUUsVUFBVTtNQUN0QjtBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFLDhDQUE4QztNQUMxRDtBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFO1FBQ1g7QUFDSDtBQUNBO1FBQ0dDLFFBQVEsRUFBRTtVQUNUQyxJQUFJLEVBQUUsUUFBUTtVQUNkQyxZQUFZLEVBQUU7UUFDZixDQUFDO1FBQ0Q7QUFDSDtBQUNBO1FBQ0dDLFFBQVEsRUFBRTtVQUNURixJQUFJLEVBQUUsc0JBQXNCO1VBQzVCRyxRQUFRLEVBQUUsSUFBSTtVQUNkQyxLQUFLLEVBQUUsQ0FBQyxVQUFVO1FBQ25CLENBQUM7UUFDREMsV0FBVyxFQUFFO1VBQ1pMLElBQUksRUFBRSxzQkFBc0I7VUFDNUJHLFFBQVEsRUFBRTtRQUNYLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0csY0FBYyxFQUFFO1VBQ2ZOLElBQUksRUFBRSxRQUFRO1VBQ2RDLFlBQVksRUFBRTtRQUNmLENBQUM7UUFDRDtBQUNIO0FBQ0E7QUFDQTtRQUNHTSxvQkFBb0IsRUFBRTtVQUNyQlAsSUFBSSxFQUFFLFNBQVM7VUFDZkMsWUFBWSxFQUFFO1FBQ2YsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHTyxvQkFBb0IsRUFBRTtVQUNyQlIsSUFBSSxFQUFFLFNBQVM7VUFDZkMsWUFBWSxFQUFFO1FBQ2YsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHUSxjQUFjLEVBQUU7VUFDZlQsSUFBSSxFQUFFLFFBQVE7VUFDZEMsWUFBWSxFQUFFLEVBQUU7VUFDaEJTLFFBQVEsRUFBRTtRQUNYLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0Msa0JBQWtCLEVBQUU7VUFDbkJYLElBQUksRUFBRSxTQUFTO1VBQ2ZDLFlBQVksRUFBRTtRQUNmLENBQUM7UUFFRFcsZ0JBQWdCLEVBQUU7VUFDakJaLElBQUksRUFBRTtRQUNQLENBQUM7UUFDRGEsb0JBQW9CLEVBQUU7VUFDckJiLElBQUksRUFBRSxTQUFTO1VBQ2ZVLFFBQVEsRUFBRTtRQUNYLENBQUM7UUFDREksa0JBQWtCLEVBQUU7VUFDbkJkLElBQUksRUFBRSxTQUFTO1VBQ2ZDLFlBQVksRUFBRTtRQUNmO01BQ0QsQ0FBQztNQUVEYyxNQUFNLEVBQUUsQ0FBQztJQUNWLENBQUM7SUFDREMsTUFBTSxFQUFFLFVBQVVDLE1BQVcsRUFBRUMscUJBQTBCLEVBQUVDLGFBQWtCLEVBQUU7TUFDOUVDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQzFCLFFBQVEsQ0FBQ0csVUFBVSxDQUFDLENBQUN3QixPQUFPLENBQUVDLGFBQWEsSUFBSztRQUNoRSxNQUFNQyxTQUFTLEdBQUcsSUFBSSxDQUFDN0IsUUFBUSxDQUFDRyxVQUFVLENBQUN5QixhQUFhLENBQUM7UUFDekQsSUFBSUMsU0FBUyxDQUFDeEIsSUFBSSxLQUFLLFNBQVMsRUFBRTtVQUNqQyxJQUFJLE9BQU9pQixNQUFNLENBQUNNLGFBQWEsQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUM5Q04sTUFBTSxDQUFDTSxhQUFhLENBQUMsR0FBR04sTUFBTSxDQUFDTSxhQUFhLENBQUMsS0FBSyxNQUFNO1VBQ3pEO1FBQ0Q7TUFDRCxDQUFDLENBQUM7TUFDRk4sTUFBTSxDQUFDUixjQUFjLEdBQUcsZUFBZTtNQUV2QyxNQUFNZ0IsVUFBVSxHQUFHTixhQUFhLENBQUNPLE1BQU0sQ0FBQ0MsU0FBUyxJQUFJUixhQUFhLENBQUNPLE1BQU0sQ0FBQ0UsU0FBUztNQUNuRixJQUFJQyxXQUFXLENBQUNDLDZCQUE2QixDQUFDTCxVQUFVLENBQUMsRUFBRTtRQUMxRFIsTUFBTSxDQUFDSixvQkFBb0IsR0FBRyxJQUFJO01BQ25DO01BQ0EsT0FBT0ksTUFBTTtJQUNkO0VBQ0QsQ0FBQyxDQUFDO0VBQUMsT0FDWTVCLFNBQVM7QUFBQSJ9