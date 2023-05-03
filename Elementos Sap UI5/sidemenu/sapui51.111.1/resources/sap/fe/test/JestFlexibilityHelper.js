/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  function createFlexibilityChangesObject(viewId, flexChanges) {
    const FILENAME = "id_1656068872000_483";
    const viewIdPrefix = viewId + "--";
    const variantDependentControlChanges = getVariantDependentControlChanges(flexChanges, FILENAME, viewIdPrefix) ?? [];
    const changes = getChanges(flexChanges) ?? [];
    return {
      appDescriptorChanges: [],
      changes: changes,
      ui2personalization: {},
      comp: {
        variants: [],
        changes: [],
        defaultVariants: [],
        standardVariants: []
      },
      variants: [{
        fileName: FILENAME,
        fileType: "ctrl_variant",
        variantManagementReference: `${viewIdPrefix}fe::PageVariantManagement`,
        variantReference: `${viewIdPrefix}fe::PageVariantManagement`,
        reference: "catalog-admin-ui.Component",
        packageName: "$TMP",
        content: {
          title: "Default with additional fields and cols"
        },
        self: `apps/catalog-admin-ui/variants/${FILENAME}.ctrl_variant`,
        layer: "USER",
        texts: {},
        namespace: "apps/catalog-admin-ui/variants/",
        creation: "2022-06-24T11:07:52.139Z",
        originalLanguage: "EN",
        conditions: {},
        contexts: {},
        support: {
          generator: "Change.createInitialFileContent",
          service: "",
          user: "",
          sapui5Version: "1.80.0"
        }
      }],
      variantChanges: [{
        fileName: "id_1656068872134_509_setExecuteOnSelect",
        fileType: "ctrl_variant_change",
        changeType: "setExecuteOnSelect",
        moduleName: "",
        reference: "catalog-admin-ui.Component",
        packageName: "$TMP",
        content: {
          executeOnSelect: true
        },
        selector: {
          id: FILENAME,
          idIsLocal: false
        },
        layer: "USER",
        texts: {},
        namespace: "apps/catalog-admin-ui/changes/",
        projectId: "catalog-admin-ui",
        creation: "2022-06-24T11:07:52.146Z",
        originalLanguage: "EN",
        support: {
          generator: "Change.createInitialFileContent",
          service: "",
          user: "",
          sapui5Version: "1.80.0",
          sourceChangeFileName: "",
          compositeCommand: "",
          command: ""
        },
        oDataInformation: {},
        dependentSelector: {},
        jsOnly: false,
        variantReference: "",
        appDescriptorChange: false
      }],
      variantDependentControlChanges: variantDependentControlChanges,
      variantManagementChanges: [{
        fileName: "id_1656068872132_508_setDefault",
        fileType: "ctrl_variant_management_change",
        changeType: "setDefault",
        moduleName: "",
        reference: "catalog-admin-ui.Component",
        packageName: "$TMP",
        content: {
          defaultVariant: FILENAME
        },
        selector: {
          id: `${viewIdPrefix}fe::PageVariantManagement`,
          idIsLocal: false
        },
        layer: "USER",
        texts: {},
        namespace: "apps/catalog-admin-ui/changes/",
        projectId: "catalog-admin-ui",
        creation: "2022-06-24T11:07:52.145Z",
        originalLanguage: "EN",
        support: {
          generator: "Change.createInitialFileContent",
          service: "",
          user: "",
          sapui5Version: "1.80.0",
          sourceChangeFileName: "",
          compositeCommand: "",
          command: ""
        },
        oDataInformation: {},
        dependentSelector: {},
        jsOnly: false,
        variantReference: "",
        appDescriptorChange: false
      }],
      cacheKey: "1432039092"
    };
  }
  _exports.createFlexibilityChangesObject = createFlexibilityChangesObject;
  function getVariantDependentControlChanges(flexChanges, filename, viewIdPrefix) {
    var _flexChanges$variantD;
    return (_flexChanges$variantD = flexChanges.variantDependentControlChanges) === null || _flexChanges$variantD === void 0 ? void 0 : _flexChanges$variantD.map(variant => {
      variant.variantReference = filename;
      variant.selector.id = viewIdPrefix + variant.selector.id;
      return variant;
    });
  }
  function getChanges(flexChanges) {
    var _flexChanges$changes;
    return (_flexChanges$changes = flexChanges.changes) === null || _flexChanges$changes === void 0 ? void 0 : _flexChanges$changes.map(variant => {
      return variant;
    });
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVGbGV4aWJpbGl0eUNoYW5nZXNPYmplY3QiLCJ2aWV3SWQiLCJmbGV4Q2hhbmdlcyIsIkZJTEVOQU1FIiwidmlld0lkUHJlZml4IiwidmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzIiwiZ2V0VmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzIiwiY2hhbmdlcyIsImdldENoYW5nZXMiLCJhcHBEZXNjcmlwdG9yQ2hhbmdlcyIsInVpMnBlcnNvbmFsaXphdGlvbiIsImNvbXAiLCJ2YXJpYW50cyIsImRlZmF1bHRWYXJpYW50cyIsInN0YW5kYXJkVmFyaWFudHMiLCJmaWxlTmFtZSIsImZpbGVUeXBlIiwidmFyaWFudE1hbmFnZW1lbnRSZWZlcmVuY2UiLCJ2YXJpYW50UmVmZXJlbmNlIiwicmVmZXJlbmNlIiwicGFja2FnZU5hbWUiLCJjb250ZW50IiwidGl0bGUiLCJzZWxmIiwibGF5ZXIiLCJ0ZXh0cyIsIm5hbWVzcGFjZSIsImNyZWF0aW9uIiwib3JpZ2luYWxMYW5ndWFnZSIsImNvbmRpdGlvbnMiLCJjb250ZXh0cyIsInN1cHBvcnQiLCJnZW5lcmF0b3IiLCJzZXJ2aWNlIiwidXNlciIsInNhcHVpNVZlcnNpb24iLCJ2YXJpYW50Q2hhbmdlcyIsImNoYW5nZVR5cGUiLCJtb2R1bGVOYW1lIiwiZXhlY3V0ZU9uU2VsZWN0Iiwic2VsZWN0b3IiLCJpZCIsImlkSXNMb2NhbCIsInByb2plY3RJZCIsInNvdXJjZUNoYW5nZUZpbGVOYW1lIiwiY29tcG9zaXRlQ29tbWFuZCIsImNvbW1hbmQiLCJvRGF0YUluZm9ybWF0aW9uIiwiZGVwZW5kZW50U2VsZWN0b3IiLCJqc09ubHkiLCJhcHBEZXNjcmlwdG9yQ2hhbmdlIiwidmFyaWFudE1hbmFnZW1lbnRDaGFuZ2VzIiwiZGVmYXVsdFZhcmlhbnQiLCJjYWNoZUtleSIsImZpbGVuYW1lIiwibWFwIiwidmFyaWFudCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSmVzdEZsZXhpYmlsaXR5SGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGbGV4aWJpbGl0eUNoYW5nZXNPYmplY3Qodmlld0lkOiBTdHJpbmcsIGZsZXhDaGFuZ2VzOiB7IFt4OiBzdHJpbmddOiBvYmplY3RbXSB9KTogb2JqZWN0IHtcblx0Y29uc3QgRklMRU5BTUUgPSBcImlkXzE2NTYwNjg4NzIwMDBfNDgzXCI7XG5cdGNvbnN0IHZpZXdJZFByZWZpeCA9IHZpZXdJZCArIFwiLS1cIjtcblx0Y29uc3QgdmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzID0gZ2V0VmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzKGZsZXhDaGFuZ2VzLCBGSUxFTkFNRSwgdmlld0lkUHJlZml4KSA/PyBbXTtcblx0Y29uc3QgY2hhbmdlcyA9IGdldENoYW5nZXMoZmxleENoYW5nZXMpID8/IFtdO1xuXG5cdHJldHVybiB7XG5cdFx0YXBwRGVzY3JpcHRvckNoYW5nZXM6IFtdLFxuXHRcdGNoYW5nZXM6IGNoYW5nZXMsXG5cdFx0dWkycGVyc29uYWxpemF0aW9uOiB7fSxcblx0XHRjb21wOiB7XG5cdFx0XHR2YXJpYW50czogW10sXG5cdFx0XHRjaGFuZ2VzOiBbXSxcblx0XHRcdGRlZmF1bHRWYXJpYW50czogW10sXG5cdFx0XHRzdGFuZGFyZFZhcmlhbnRzOiBbXVxuXHRcdH0sXG5cdFx0dmFyaWFudHM6IFtcblx0XHRcdHtcblx0XHRcdFx0ZmlsZU5hbWU6IEZJTEVOQU1FLFxuXHRcdFx0XHRmaWxlVHlwZTogXCJjdHJsX3ZhcmlhbnRcIixcblx0XHRcdFx0dmFyaWFudE1hbmFnZW1lbnRSZWZlcmVuY2U6IGAke3ZpZXdJZFByZWZpeH1mZTo6UGFnZVZhcmlhbnRNYW5hZ2VtZW50YCxcblx0XHRcdFx0dmFyaWFudFJlZmVyZW5jZTogYCR7dmlld0lkUHJlZml4fWZlOjpQYWdlVmFyaWFudE1hbmFnZW1lbnRgLFxuXHRcdFx0XHRyZWZlcmVuY2U6IFwiY2F0YWxvZy1hZG1pbi11aS5Db21wb25lbnRcIixcblx0XHRcdFx0cGFja2FnZU5hbWU6IFwiJFRNUFwiLFxuXHRcdFx0XHRjb250ZW50OiB7XG5cdFx0XHRcdFx0dGl0bGU6IFwiRGVmYXVsdCB3aXRoIGFkZGl0aW9uYWwgZmllbGRzIGFuZCBjb2xzXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0c2VsZjogYGFwcHMvY2F0YWxvZy1hZG1pbi11aS92YXJpYW50cy8ke0ZJTEVOQU1FfS5jdHJsX3ZhcmlhbnRgLFxuXHRcdFx0XHRsYXllcjogXCJVU0VSXCIsXG5cdFx0XHRcdHRleHRzOiB7fSxcblx0XHRcdFx0bmFtZXNwYWNlOiBcImFwcHMvY2F0YWxvZy1hZG1pbi11aS92YXJpYW50cy9cIixcblx0XHRcdFx0Y3JlYXRpb246IFwiMjAyMi0wNi0yNFQxMTowNzo1Mi4xMzlaXCIsXG5cdFx0XHRcdG9yaWdpbmFsTGFuZ3VhZ2U6IFwiRU5cIixcblx0XHRcdFx0Y29uZGl0aW9uczoge30sXG5cdFx0XHRcdGNvbnRleHRzOiB7fSxcblx0XHRcdFx0c3VwcG9ydDoge1xuXHRcdFx0XHRcdGdlbmVyYXRvcjogXCJDaGFuZ2UuY3JlYXRlSW5pdGlhbEZpbGVDb250ZW50XCIsXG5cdFx0XHRcdFx0c2VydmljZTogXCJcIixcblx0XHRcdFx0XHR1c2VyOiBcIlwiLFxuXHRcdFx0XHRcdHNhcHVpNVZlcnNpb246IFwiMS44MC4wXCJcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdF0sXG5cdFx0dmFyaWFudENoYW5nZXM6IFtcblx0XHRcdHtcblx0XHRcdFx0ZmlsZU5hbWU6IFwiaWRfMTY1NjA2ODg3MjEzNF81MDlfc2V0RXhlY3V0ZU9uU2VsZWN0XCIsXG5cdFx0XHRcdGZpbGVUeXBlOiBcImN0cmxfdmFyaWFudF9jaGFuZ2VcIixcblx0XHRcdFx0Y2hhbmdlVHlwZTogXCJzZXRFeGVjdXRlT25TZWxlY3RcIixcblx0XHRcdFx0bW9kdWxlTmFtZTogXCJcIixcblx0XHRcdFx0cmVmZXJlbmNlOiBcImNhdGFsb2ctYWRtaW4tdWkuQ29tcG9uZW50XCIsXG5cdFx0XHRcdHBhY2thZ2VOYW1lOiBcIiRUTVBcIixcblx0XHRcdFx0Y29udGVudDoge1xuXHRcdFx0XHRcdGV4ZWN1dGVPblNlbGVjdDogdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZWxlY3Rvcjoge1xuXHRcdFx0XHRcdGlkOiBGSUxFTkFNRSxcblx0XHRcdFx0XHRpZElzTG9jYWw6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGxheWVyOiBcIlVTRVJcIixcblx0XHRcdFx0dGV4dHM6IHt9LFxuXHRcdFx0XHRuYW1lc3BhY2U6IFwiYXBwcy9jYXRhbG9nLWFkbWluLXVpL2NoYW5nZXMvXCIsXG5cdFx0XHRcdHByb2plY3RJZDogXCJjYXRhbG9nLWFkbWluLXVpXCIsXG5cdFx0XHRcdGNyZWF0aW9uOiBcIjIwMjItMDYtMjRUMTE6MDc6NTIuMTQ2WlwiLFxuXHRcdFx0XHRvcmlnaW5hbExhbmd1YWdlOiBcIkVOXCIsXG5cdFx0XHRcdHN1cHBvcnQ6IHtcblx0XHRcdFx0XHRnZW5lcmF0b3I6IFwiQ2hhbmdlLmNyZWF0ZUluaXRpYWxGaWxlQ29udGVudFwiLFxuXHRcdFx0XHRcdHNlcnZpY2U6IFwiXCIsXG5cdFx0XHRcdFx0dXNlcjogXCJcIixcblx0XHRcdFx0XHRzYXB1aTVWZXJzaW9uOiBcIjEuODAuMFwiLFxuXHRcdFx0XHRcdHNvdXJjZUNoYW5nZUZpbGVOYW1lOiBcIlwiLFxuXHRcdFx0XHRcdGNvbXBvc2l0ZUNvbW1hbmQ6IFwiXCIsXG5cdFx0XHRcdFx0Y29tbWFuZDogXCJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvRGF0YUluZm9ybWF0aW9uOiB7fSxcblx0XHRcdFx0ZGVwZW5kZW50U2VsZWN0b3I6IHt9LFxuXHRcdFx0XHRqc09ubHk6IGZhbHNlLFxuXHRcdFx0XHR2YXJpYW50UmVmZXJlbmNlOiBcIlwiLFxuXHRcdFx0XHRhcHBEZXNjcmlwdG9yQ2hhbmdlOiBmYWxzZVxuXHRcdFx0fVxuXHRcdF0sXG5cdFx0dmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzOiB2YXJpYW50RGVwZW5kZW50Q29udHJvbENoYW5nZXMsXG5cdFx0dmFyaWFudE1hbmFnZW1lbnRDaGFuZ2VzOiBbXG5cdFx0XHR7XG5cdFx0XHRcdGZpbGVOYW1lOiBcImlkXzE2NTYwNjg4NzIxMzJfNTA4X3NldERlZmF1bHRcIixcblx0XHRcdFx0ZmlsZVR5cGU6IFwiY3RybF92YXJpYW50X21hbmFnZW1lbnRfY2hhbmdlXCIsXG5cdFx0XHRcdGNoYW5nZVR5cGU6IFwic2V0RGVmYXVsdFwiLFxuXHRcdFx0XHRtb2R1bGVOYW1lOiBcIlwiLFxuXHRcdFx0XHRyZWZlcmVuY2U6IFwiY2F0YWxvZy1hZG1pbi11aS5Db21wb25lbnRcIixcblx0XHRcdFx0cGFja2FnZU5hbWU6IFwiJFRNUFwiLFxuXHRcdFx0XHRjb250ZW50OiB7XG5cdFx0XHRcdFx0ZGVmYXVsdFZhcmlhbnQ6IEZJTEVOQU1FXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNlbGVjdG9yOiB7XG5cdFx0XHRcdFx0aWQ6IGAke3ZpZXdJZFByZWZpeH1mZTo6UGFnZVZhcmlhbnRNYW5hZ2VtZW50YCxcblx0XHRcdFx0XHRpZElzTG9jYWw6IGZhbHNlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGxheWVyOiBcIlVTRVJcIixcblx0XHRcdFx0dGV4dHM6IHt9LFxuXHRcdFx0XHRuYW1lc3BhY2U6IFwiYXBwcy9jYXRhbG9nLWFkbWluLXVpL2NoYW5nZXMvXCIsXG5cdFx0XHRcdHByb2plY3RJZDogXCJjYXRhbG9nLWFkbWluLXVpXCIsXG5cdFx0XHRcdGNyZWF0aW9uOiBcIjIwMjItMDYtMjRUMTE6MDc6NTIuMTQ1WlwiLFxuXHRcdFx0XHRvcmlnaW5hbExhbmd1YWdlOiBcIkVOXCIsXG5cdFx0XHRcdHN1cHBvcnQ6IHtcblx0XHRcdFx0XHRnZW5lcmF0b3I6IFwiQ2hhbmdlLmNyZWF0ZUluaXRpYWxGaWxlQ29udGVudFwiLFxuXHRcdFx0XHRcdHNlcnZpY2U6IFwiXCIsXG5cdFx0XHRcdFx0dXNlcjogXCJcIixcblx0XHRcdFx0XHRzYXB1aTVWZXJzaW9uOiBcIjEuODAuMFwiLFxuXHRcdFx0XHRcdHNvdXJjZUNoYW5nZUZpbGVOYW1lOiBcIlwiLFxuXHRcdFx0XHRcdGNvbXBvc2l0ZUNvbW1hbmQ6IFwiXCIsXG5cdFx0XHRcdFx0Y29tbWFuZDogXCJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvRGF0YUluZm9ybWF0aW9uOiB7fSxcblx0XHRcdFx0ZGVwZW5kZW50U2VsZWN0b3I6IHt9LFxuXHRcdFx0XHRqc09ubHk6IGZhbHNlLFxuXHRcdFx0XHR2YXJpYW50UmVmZXJlbmNlOiBcIlwiLFxuXHRcdFx0XHRhcHBEZXNjcmlwdG9yQ2hhbmdlOiBmYWxzZVxuXHRcdFx0fVxuXHRcdF0sXG5cdFx0Y2FjaGVLZXk6IFwiMTQzMjAzOTA5MlwiXG5cdH07XG59XG5cbmZ1bmN0aW9uIGdldFZhcmlhbnREZXBlbmRlbnRDb250cm9sQ2hhbmdlcyhmbGV4Q2hhbmdlczogeyBbeDogc3RyaW5nXTogYW55W10gfSwgZmlsZW5hbWU6IHN0cmluZywgdmlld0lkUHJlZml4OiBzdHJpbmcpIHtcblx0cmV0dXJuIGZsZXhDaGFuZ2VzLnZhcmlhbnREZXBlbmRlbnRDb250cm9sQ2hhbmdlcz8ubWFwKCh2YXJpYW50KSA9PiB7XG5cdFx0dmFyaWFudC52YXJpYW50UmVmZXJlbmNlID0gZmlsZW5hbWU7XG5cdFx0dmFyaWFudC5zZWxlY3Rvci5pZCA9IHZpZXdJZFByZWZpeCArIHZhcmlhbnQuc2VsZWN0b3IuaWQ7XG5cdFx0cmV0dXJuIHZhcmlhbnQ7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRDaGFuZ2VzKGZsZXhDaGFuZ2VzOiB7IFt4OiBzdHJpbmddOiBhbnlbXSB9KSB7XG5cdHJldHVybiBmbGV4Q2hhbmdlcy5jaGFuZ2VzPy5tYXAoKHZhcmlhbnQpID0+IHtcblx0XHRyZXR1cm4gdmFyaWFudDtcblx0fSk7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBQU8sU0FBU0EsOEJBQThCLENBQUNDLE1BQWMsRUFBRUMsV0FBc0MsRUFBVTtJQUM5RyxNQUFNQyxRQUFRLEdBQUcsc0JBQXNCO0lBQ3ZDLE1BQU1DLFlBQVksR0FBR0gsTUFBTSxHQUFHLElBQUk7SUFDbEMsTUFBTUksOEJBQThCLEdBQUdDLGlDQUFpQyxDQUFDSixXQUFXLEVBQUVDLFFBQVEsRUFBRUMsWUFBWSxDQUFDLElBQUksRUFBRTtJQUNuSCxNQUFNRyxPQUFPLEdBQUdDLFVBQVUsQ0FBQ04sV0FBVyxDQUFDLElBQUksRUFBRTtJQUU3QyxPQUFPO01BQ05PLG9CQUFvQixFQUFFLEVBQUU7TUFDeEJGLE9BQU8sRUFBRUEsT0FBTztNQUNoQkcsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO01BQ3RCQyxJQUFJLEVBQUU7UUFDTEMsUUFBUSxFQUFFLEVBQUU7UUFDWkwsT0FBTyxFQUFFLEVBQUU7UUFDWE0sZUFBZSxFQUFFLEVBQUU7UUFDbkJDLGdCQUFnQixFQUFFO01BQ25CLENBQUM7TUFDREYsUUFBUSxFQUFFLENBQ1Q7UUFDQ0csUUFBUSxFQUFFWixRQUFRO1FBQ2xCYSxRQUFRLEVBQUUsY0FBYztRQUN4QkMsMEJBQTBCLEVBQUcsR0FBRWIsWUFBYSwyQkFBMEI7UUFDdEVjLGdCQUFnQixFQUFHLEdBQUVkLFlBQWEsMkJBQTBCO1FBQzVEZSxTQUFTLEVBQUUsNEJBQTRCO1FBQ3ZDQyxXQUFXLEVBQUUsTUFBTTtRQUNuQkMsT0FBTyxFQUFFO1VBQ1JDLEtBQUssRUFBRTtRQUNSLENBQUM7UUFDREMsSUFBSSxFQUFHLGtDQUFpQ3BCLFFBQVMsZUFBYztRQUMvRHFCLEtBQUssRUFBRSxNQUFNO1FBQ2JDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDVEMsU0FBUyxFQUFFLGlDQUFpQztRQUM1Q0MsUUFBUSxFQUFFLDBCQUEwQjtRQUNwQ0MsZ0JBQWdCLEVBQUUsSUFBSTtRQUN0QkMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUNkQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ1pDLE9BQU8sRUFBRTtVQUNSQyxTQUFTLEVBQUUsaUNBQWlDO1VBQzVDQyxPQUFPLEVBQUUsRUFBRTtVQUNYQyxJQUFJLEVBQUUsRUFBRTtVQUNSQyxhQUFhLEVBQUU7UUFDaEI7TUFDRCxDQUFDLENBQ0Q7TUFDREMsY0FBYyxFQUFFLENBQ2Y7UUFDQ3JCLFFBQVEsRUFBRSx5Q0FBeUM7UUFDbkRDLFFBQVEsRUFBRSxxQkFBcUI7UUFDL0JxQixVQUFVLEVBQUUsb0JBQW9CO1FBQ2hDQyxVQUFVLEVBQUUsRUFBRTtRQUNkbkIsU0FBUyxFQUFFLDRCQUE0QjtRQUN2Q0MsV0FBVyxFQUFFLE1BQU07UUFDbkJDLE9BQU8sRUFBRTtVQUNSa0IsZUFBZSxFQUFFO1FBQ2xCLENBQUM7UUFDREMsUUFBUSxFQUFFO1VBQ1RDLEVBQUUsRUFBRXRDLFFBQVE7VUFDWnVDLFNBQVMsRUFBRTtRQUNaLENBQUM7UUFDRGxCLEtBQUssRUFBRSxNQUFNO1FBQ2JDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDVEMsU0FBUyxFQUFFLGdDQUFnQztRQUMzQ2lCLFNBQVMsRUFBRSxrQkFBa0I7UUFDN0JoQixRQUFRLEVBQUUsMEJBQTBCO1FBQ3BDQyxnQkFBZ0IsRUFBRSxJQUFJO1FBQ3RCRyxPQUFPLEVBQUU7VUFDUkMsU0FBUyxFQUFFLGlDQUFpQztVQUM1Q0MsT0FBTyxFQUFFLEVBQUU7VUFDWEMsSUFBSSxFQUFFLEVBQUU7VUFDUkMsYUFBYSxFQUFFLFFBQVE7VUFDdkJTLG9CQUFvQixFQUFFLEVBQUU7VUFDeEJDLGdCQUFnQixFQUFFLEVBQUU7VUFDcEJDLE9BQU8sRUFBRTtRQUNWLENBQUM7UUFDREMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3BCQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDckJDLE1BQU0sRUFBRSxLQUFLO1FBQ2IvQixnQkFBZ0IsRUFBRSxFQUFFO1FBQ3BCZ0MsbUJBQW1CLEVBQUU7TUFDdEIsQ0FBQyxDQUNEO01BQ0Q3Qyw4QkFBOEIsRUFBRUEsOEJBQThCO01BQzlEOEMsd0JBQXdCLEVBQUUsQ0FDekI7UUFDQ3BDLFFBQVEsRUFBRSxpQ0FBaUM7UUFDM0NDLFFBQVEsRUFBRSxnQ0FBZ0M7UUFDMUNxQixVQUFVLEVBQUUsWUFBWTtRQUN4QkMsVUFBVSxFQUFFLEVBQUU7UUFDZG5CLFNBQVMsRUFBRSw0QkFBNEI7UUFDdkNDLFdBQVcsRUFBRSxNQUFNO1FBQ25CQyxPQUFPLEVBQUU7VUFDUitCLGNBQWMsRUFBRWpEO1FBQ2pCLENBQUM7UUFDRHFDLFFBQVEsRUFBRTtVQUNUQyxFQUFFLEVBQUcsR0FBRXJDLFlBQWEsMkJBQTBCO1VBQzlDc0MsU0FBUyxFQUFFO1FBQ1osQ0FBQztRQUNEbEIsS0FBSyxFQUFFLE1BQU07UUFDYkMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNUQyxTQUFTLEVBQUUsZ0NBQWdDO1FBQzNDaUIsU0FBUyxFQUFFLGtCQUFrQjtRQUM3QmhCLFFBQVEsRUFBRSwwQkFBMEI7UUFDcENDLGdCQUFnQixFQUFFLElBQUk7UUFDdEJHLE9BQU8sRUFBRTtVQUNSQyxTQUFTLEVBQUUsaUNBQWlDO1VBQzVDQyxPQUFPLEVBQUUsRUFBRTtVQUNYQyxJQUFJLEVBQUUsRUFBRTtVQUNSQyxhQUFhLEVBQUUsUUFBUTtVQUN2QlMsb0JBQW9CLEVBQUUsRUFBRTtVQUN4QkMsZ0JBQWdCLEVBQUUsRUFBRTtVQUNwQkMsT0FBTyxFQUFFO1FBQ1YsQ0FBQztRQUNEQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFDcEJDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztRQUNyQkMsTUFBTSxFQUFFLEtBQUs7UUFDYi9CLGdCQUFnQixFQUFFLEVBQUU7UUFDcEJnQyxtQkFBbUIsRUFBRTtNQUN0QixDQUFDLENBQ0Q7TUFDREcsUUFBUSxFQUFFO0lBQ1gsQ0FBQztFQUNGO0VBQUM7RUFFRCxTQUFTL0MsaUNBQWlDLENBQUNKLFdBQW1DLEVBQUVvRCxRQUFnQixFQUFFbEQsWUFBb0IsRUFBRTtJQUFBO0lBQ3ZILGdDQUFPRixXQUFXLENBQUNHLDhCQUE4QiwwREFBMUMsc0JBQTRDa0QsR0FBRyxDQUFFQyxPQUFPLElBQUs7TUFDbkVBLE9BQU8sQ0FBQ3RDLGdCQUFnQixHQUFHb0MsUUFBUTtNQUNuQ0UsT0FBTyxDQUFDaEIsUUFBUSxDQUFDQyxFQUFFLEdBQUdyQyxZQUFZLEdBQUdvRCxPQUFPLENBQUNoQixRQUFRLENBQUNDLEVBQUU7TUFDeEQsT0FBT2UsT0FBTztJQUNmLENBQUMsQ0FBQztFQUNIO0VBRUEsU0FBU2hELFVBQVUsQ0FBQ04sV0FBbUMsRUFBRTtJQUFBO0lBQ3hELCtCQUFPQSxXQUFXLENBQUNLLE9BQU8seURBQW5CLHFCQUFxQmdELEdBQUcsQ0FBRUMsT0FBTyxJQUFLO01BQzVDLE9BQU9BLE9BQU87SUFDZixDQUFDLENBQUM7RUFDSDtFQUFDO0FBQUEifQ==