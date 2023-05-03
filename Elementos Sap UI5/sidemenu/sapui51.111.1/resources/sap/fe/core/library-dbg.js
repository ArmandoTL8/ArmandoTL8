/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/formatters/FPMFormatter", "sap/fe/core/formatters/StandardFormatter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/services/AsyncComponentServiceFactory", "sap/fe/core/services/CacheHandlerServiceFactory", "sap/fe/core/services/EnvironmentServiceFactory", "sap/fe/core/services/NavigationServiceFactory", "sap/fe/core/services/ResourceModelServiceFactory", "sap/fe/core/services/RoutingServiceFactory", "sap/fe/core/services/ShellServicesFactory", "sap/fe/core/services/SideEffectsServiceFactory", "sap/fe/core/services/TemplatedViewServiceFactory", "sap/fe/core/type/DateTimeWithTimezone", "sap/fe/core/type/Email", "sap/fe/core/type/FiscalDate", "sap/fe/navigation/library", "sap/fe/placeholder/library", "sap/ui/base/DataType", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/service/ServiceFactoryRegistry", "sap/ui/fl/library", "sap/ui/mdc/library"], function (Log, _FPMFormatter, _StandardFormatter, _ValueFormatter, AsyncComponentServiceFactory, CacheHandlerServiceFactory, EnvironmentServiceFactory, NavigationService, ResourceModelServiceFactory, RoutingServiceFactory, ShellServicesFactory, SideEffectsServiceFactory, TemplatedViewServiceFactory, _DateTimeWithTimezone, _Email, _FiscalDate, _library, _library2, DataType, Core, _library3, ServiceFactoryRegistry, _library4, _library5) {
  "use strict";

  var _exports = {};
  /**
   * Root namespace for all the libraries related to SAP Fiori elements.
   *
   * @namespace
   * @name sap.fe
   * @public
   */
  const feNamespace = "sap.fe";
  /**
   * Library providing the core functionality of the runtime for SAP Fiori elements for OData V4.
   *
   * @namespace
   * @name sap.fe.core
   * @public
   */
  _exports.feNamespace = feNamespace;
  const feCoreNamespace = "sap.fe.core";
  /**
   * Collection of controller extensions used internally in SAP Fiori elements exposing a method that you can override to allow more flexibility.
   *
   * @namespace
   * @name sap.fe.core.controllerextensions
   * @public
   */
  _exports.feCoreNamespace = feCoreNamespace;
  const feCextNamespace = "sap.fe.controllerextensions";
  /**
   * Collection of classes provided by SAP Fiori elements for the Flexible Programming Model
   *
   * @namespace
   * @name sap.fe.core.fpm
   * @public
   */
  _exports.feCextNamespace = feCextNamespace;
  const feFpmNamespace = "sap.fe.core.fpm";
  _exports.feFpmNamespace = feFpmNamespace;
  const thisLib = Core.initLibrary({
    name: "sap.fe.core",
    dependencies: ["sap.ui.core", "sap.fe.navigation", "sap.fe.placeholder", "sap.ui.fl", "sap.ui.mdc", "sap.f"],
    types: ["sap.fe.core.CreationMode", "sap.fe.core.VariantManagement"],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.111.1",
    noLibraryCSS: true,
    extensions: {
      //Configuration used for rule loading of Support Assistant
      "sap.ui.support": {
        publicRules: true,
        internalRules: true
      },
      flChangeHandlers: {
        "sap.fe.core.controls.FilterBar": "sap/ui/mdc/flexibility/FilterBar"
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  });

  /**
   * Available values for invocation grouping.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.InvocationGrouping = {
    /**
     * Isolated.
     *
     * @constant
     * @type {string}
     * @public
     */
    Isolated: "Isolated",
    /**
     * ChangeSet.
     *
     * @constant
     * @type {string}
     * @public
     */
    ChangeSet: "ChangeSet"
  };
  /**
   * Available values for creation mode.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.CreationMode = {
    /**
     * New Page.
     *
     * @constant
     * @type {string}
     * @public
     */
    NewPage: "NewPage",
    /**
     * Sync.
     *
     * @constant
     * @type {string}
     * @public
     */
    Sync: "Sync",
    /**
     * Async.
     *
     * @constant
     * @type {string}
     * @public
     */
    Async: "Async",
    /**
     * Deferred.
     *
     * @constant
     * @type {string}
     * @public
     */
    Deferred: "Deferred",
    /**
     * Inline.
     *
     * @constant
     * @type {string}
     * @public
     */
    Inline: "Inline",
    /**
     * Creation row.
     *
     * @constant
     * @type {string}
     * @public
     */
    CreationRow: "CreationRow",
    /**
     * Inline creation rows.
     *
     * @constant
     * @type {string}
     * @public
     */
    InlineCreationRows: "InlineCreationRows",
    /**
     * External (by outbound navigation).
     *
     * @constant
     * @type {string}
     * @public
     */
    External: "External"
  };
  /**
   * Available values for Variant Management.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.VariantManagement = {
    /**
     * No variant management at all.
     *
     * @constant
     * @type {string}
     * @public
     */
    None: "None",
    /**
     * One variant configuration for the whole page.
     *
     * @constant
     * @type {string}
     * @public
     */
    Page: "Page",
    /**
     * Variant management on control level.
     *
     * @constant
     * @type {string}
     * @public
     */
    Control: "Control"
  };
  /**
   * Available constants.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.Constants = {
    /*
     * Indicates cancelling of an action dialog.
     *
     * @constant
     * @type {string}
     * @public
     */
    CancelActionDialog: "cancel",
    /*
     * Indicates failure returned from backend during the execution of an action
     *
     * @constant
     * @type {string}
     * @public
     */
    ActionExecutionFailed: "actionExecutionFailed",
    /*
     * Indicates failure returned from backend during creation of a business object (via direct POST)
     *
     * @constant
     * @type {string}
     * @public
     */
    CreationFailed: "creationFailed"
  };
  /**
   * Available values for programming model.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.ProgrammingModel = {
    /*
     * Draft.
     *
     * @constant
     * @type {string}
     * @public
     */
    Draft: "Draft",
    /**
     * Sticky.
     *
     * @constant
     * @type {string}
     * @public
     */
    Sticky: "Sticky",
    /**
     * NonDraft.
     *
     * @constant
     * @type {string}
     * @public
     */
    NonDraft: "NonDraft"
  };
  /**
   * Available values for draft status.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.DraftStatus = {
    /**
     * Saving.
     *
     * @constant
     * @type {string}
     * @public
     */
    Saving: "Saving",
    /**
     * Saved.
     *
     * @constant
     * @type {string}
     * @public
     */
    Saved: "Saved",
    /**
     * Clear.
     *
     * @constant
     * @type {string}
     * @public
     */
    Clear: "Clear"
  };
  /**
   * Edit mode values.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.EditMode = {
    /**
     * View is currently displaying only.
     *
     * @constant
     * @type {string}
     * @public
     */
    Display: "Display",
    /**
     * View is currently editable.
     *
     * @constant
     * @type {string}
     * @public
     */
    Editable: "Editable"
  };
  /**
   * Template views.
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.TemplateContentView = {
    /**
     * Hybrid.
     *
     * @constant
     * @type {string}
     */
    Hybrid: "Hybrid",
    /**
     * Chart.
     *
     * @constant
     * @type {string}
     */
    Chart: "Chart",
    /**
     * Table.
     *
     * @constant
     * @type {string}
     */
    Table: "Table"
  };
  /**
   * Possible initial load (first app startup) modes for a ListReport.
   *
   * @enum {string}
   * @name sap.fe.core.InitialLoadMode
   * @readonly
   * @public
   * @since 1.86.0
   */
  let InitialLoadMode;
  (function (InitialLoadMode) {
    InitialLoadMode["Enabled"] = "Enabled";
    InitialLoadMode["Disabled"] = "Disabled";
    InitialLoadMode["Auto"] = "Auto";
  })(InitialLoadMode || (InitialLoadMode = {}));
  _exports.InitialLoadMode = InitialLoadMode;
  thisLib.InitialLoadMode = InitialLoadMode;

  /**
   * Value of the startup mode
   *
   * @readonly
   * @enum {string}
   * @private
   */
  thisLib.StartupMode = {
    /**
     * App has been started normally.
     *
     * @constant
     * @type {string}
     */
    Normal: "Normal",
    /**
     * App has been started with startup keys (deeplink).
     *
     * @constant
     * @type {string}
     */
    Deeplink: "Deeplink",
    /**
     * App has been started in 'create' mode.
     *
     * @constant
     * @type {string}
     */
    Create: "Create",
    /**
     * App has been started in 'auto create' mode which means to skip any dialogs on startup
     *
     * @constant
     * @type {string}
     */
    AutoCreate: "AutoCreate"
  };
  // explicit type to handle backward compatibility with boolean values
  const InitialLoadType = DataType.createType("sap.fe.core.InitialLoadMode", {
    defaultValue: thisLib.InitialLoadMode.Auto,
    isValid: function (vValue) {
      if (typeof vValue === "boolean") {
        Log.warning("DEPRECATED: boolean value not allowed for 'initialLoad' manifest setting - supported values are: Disabled|Enabled|Auto");
      }
      return vValue === undefined || vValue === null || typeof vValue === "boolean" || thisLib.InitialLoadMode.hasOwnProperty(vValue);
    }
  });
  // normalize a value, taking care of boolean type
  InitialLoadType.setNormalizer(function (vValue) {
    if (!vValue) {
      // undefined, null or false
      return thisLib.InitialLoadMode.Disabled;
    }
    return vValue === true ? thisLib.InitialLoadMode.Enabled : vValue;
  });
  ServiceFactoryRegistry.register("sap.fe.core.services.TemplatedViewService", new TemplatedViewServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.ResourceModelService", new ResourceModelServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.CacheHandlerService", new CacheHandlerServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.NavigationService", new NavigationService());
  ServiceFactoryRegistry.register("sap.fe.core.services.RoutingService", new RoutingServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.SideEffectsService", new SideEffectsServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.ShellServices", new ShellServicesFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.EnvironmentService", new EnvironmentServiceFactory());
  ServiceFactoryRegistry.register("sap.fe.core.services.AsyncComponentService", new AsyncComponentServiceFactory());
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmZU5hbWVzcGFjZSIsImZlQ29yZU5hbWVzcGFjZSIsImZlQ2V4dE5hbWVzcGFjZSIsImZlRnBtTmFtZXNwYWNlIiwidGhpc0xpYiIsIkNvcmUiLCJpbml0TGlicmFyeSIsIm5hbWUiLCJkZXBlbmRlbmNpZXMiLCJ0eXBlcyIsImludGVyZmFjZXMiLCJjb250cm9scyIsImVsZW1lbnRzIiwidmVyc2lvbiIsIm5vTGlicmFyeUNTUyIsImV4dGVuc2lvbnMiLCJwdWJsaWNSdWxlcyIsImludGVybmFsUnVsZXMiLCJmbENoYW5nZUhhbmRsZXJzIiwiSW52b2NhdGlvbkdyb3VwaW5nIiwiSXNvbGF0ZWQiLCJDaGFuZ2VTZXQiLCJDcmVhdGlvbk1vZGUiLCJOZXdQYWdlIiwiU3luYyIsIkFzeW5jIiwiRGVmZXJyZWQiLCJJbmxpbmUiLCJDcmVhdGlvblJvdyIsIklubGluZUNyZWF0aW9uUm93cyIsIkV4dGVybmFsIiwiVmFyaWFudE1hbmFnZW1lbnQiLCJOb25lIiwiUGFnZSIsIkNvbnRyb2wiLCJDb25zdGFudHMiLCJDYW5jZWxBY3Rpb25EaWFsb2ciLCJBY3Rpb25FeGVjdXRpb25GYWlsZWQiLCJDcmVhdGlvbkZhaWxlZCIsIlByb2dyYW1taW5nTW9kZWwiLCJEcmFmdCIsIlN0aWNreSIsIk5vbkRyYWZ0IiwiRHJhZnRTdGF0dXMiLCJTYXZpbmciLCJTYXZlZCIsIkNsZWFyIiwiRWRpdE1vZGUiLCJEaXNwbGF5IiwiRWRpdGFibGUiLCJUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiSHlicmlkIiwiQ2hhcnQiLCJUYWJsZSIsIkluaXRpYWxMb2FkTW9kZSIsIlN0YXJ0dXBNb2RlIiwiTm9ybWFsIiwiRGVlcGxpbmsiLCJDcmVhdGUiLCJBdXRvQ3JlYXRlIiwiSW5pdGlhbExvYWRUeXBlIiwiRGF0YVR5cGUiLCJjcmVhdGVUeXBlIiwiZGVmYXVsdFZhbHVlIiwiQXV0byIsImlzVmFsaWQiLCJ2VmFsdWUiLCJMb2ciLCJ3YXJuaW5nIiwidW5kZWZpbmVkIiwiaGFzT3duUHJvcGVydHkiLCJzZXROb3JtYWxpemVyIiwiRGlzYWJsZWQiLCJFbmFibGVkIiwiU2VydmljZUZhY3RvcnlSZWdpc3RyeSIsInJlZ2lzdGVyIiwiVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5IiwiUmVzb3VyY2VNb2RlbFNlcnZpY2VGYWN0b3J5IiwiQ2FjaGVIYW5kbGVyU2VydmljZUZhY3RvcnkiLCJOYXZpZ2F0aW9uU2VydmljZSIsIlJvdXRpbmdTZXJ2aWNlRmFjdG9yeSIsIlNpZGVFZmZlY3RzU2VydmljZUZhY3RvcnkiLCJTaGVsbFNlcnZpY2VzRmFjdG9yeSIsIkVudmlyb25tZW50U2VydmljZUZhY3RvcnkiLCJBc3luY0NvbXBvbmVudFNlcnZpY2VGYWN0b3J5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJsaWJyYXJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9GUE1Gb3JtYXR0ZXJcIjtcbmltcG9ydCBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvU3RhbmRhcmRGb3JtYXR0ZXJcIjtcbmltcG9ydCBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvVmFsdWVGb3JtYXR0ZXJcIjtcbmltcG9ydCBBc3luY0NvbXBvbmVudFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9Bc3luY0NvbXBvbmVudFNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgQ2FjaGVIYW5kbGVyU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL0NhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgRW52aXJvbm1lbnRTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvRW52aXJvbm1lbnRTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IE5hdmlnYXRpb25TZXJ2aWNlIGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9OYXZpZ2F0aW9uU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1Jlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IFJvdXRpbmdTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvUm91dGluZ1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgU2hlbGxTZXJ2aWNlc0ZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NoZWxsU2VydmljZXNGYWN0b3J5XCI7XG5pbXBvcnQgU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgXCJzYXAvZmUvY29yZS90eXBlL0RhdGVUaW1lV2l0aFRpbWV6b25lXCI7XG5pbXBvcnQgXCJzYXAvZmUvY29yZS90eXBlL0VtYWlsXCI7XG5pbXBvcnQgXCJzYXAvZmUvY29yZS90eXBlL0Zpc2NhbERhdGVcIjtcbmltcG9ydCBcInNhcC9mZS9uYXZpZ2F0aW9uL2xpYnJhcnlcIjtcbmltcG9ydCBcInNhcC9mZS9wbGFjZWhvbGRlci9saWJyYXJ5XCI7XG5pbXBvcnQgRGF0YVR5cGUgZnJvbSBcInNhcC91aS9iYXNlL0RhdGFUeXBlXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5UmVnaXN0cnkgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZUZhY3RvcnlSZWdpc3RyeVwiO1xuaW1wb3J0IFwic2FwL3VpL2ZsL2xpYnJhcnlcIjtcbmltcG9ydCBcInNhcC91aS9tZGMvbGlicmFyeVwiO1xuXG4vKipcbiAqIFJvb3QgbmFtZXNwYWNlIGZvciBhbGwgdGhlIGxpYnJhcmllcyByZWxhdGVkIHRvIFNBUCBGaW9yaSBlbGVtZW50cy5cbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAbmFtZSBzYXAuZmVcbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGZlTmFtZXNwYWNlID0gXCJzYXAuZmVcIjtcbi8qKlxuICogTGlicmFyeSBwcm92aWRpbmcgdGhlIGNvcmUgZnVuY3Rpb25hbGl0eSBvZiB0aGUgcnVudGltZSBmb3IgU0FQIEZpb3JpIGVsZW1lbnRzIGZvciBPRGF0YSBWNC5cbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAbmFtZSBzYXAuZmUuY29yZVxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgZmVDb3JlTmFtZXNwYWNlID0gXCJzYXAuZmUuY29yZVwiO1xuLyoqXG4gKiBDb2xsZWN0aW9uIG9mIGNvbnRyb2xsZXIgZXh0ZW5zaW9ucyB1c2VkIGludGVybmFsbHkgaW4gU0FQIEZpb3JpIGVsZW1lbnRzIGV4cG9zaW5nIGEgbWV0aG9kIHRoYXQgeW91IGNhbiBvdmVycmlkZSB0byBhbGxvdyBtb3JlIGZsZXhpYmlsaXR5LlxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCBmZUNleHROYW1lc3BhY2UgPSBcInNhcC5mZS5jb250cm9sbGVyZXh0ZW5zaW9uc1wiO1xuLyoqXG4gKiBDb2xsZWN0aW9uIG9mIGNsYXNzZXMgcHJvdmlkZWQgYnkgU0FQIEZpb3JpIGVsZW1lbnRzIGZvciB0aGUgRmxleGlibGUgUHJvZ3JhbW1pbmcgTW9kZWxcbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5mcG1cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IGZlRnBtTmFtZXNwYWNlID0gXCJzYXAuZmUuY29yZS5mcG1cIjtcblxuY29uc3QgdGhpc0xpYiA9IENvcmUuaW5pdExpYnJhcnkoe1xuXHRuYW1lOiBcInNhcC5mZS5jb3JlXCIsXG5cdGRlcGVuZGVuY2llczogW1wic2FwLnVpLmNvcmVcIiwgXCJzYXAuZmUubmF2aWdhdGlvblwiLCBcInNhcC5mZS5wbGFjZWhvbGRlclwiLCBcInNhcC51aS5mbFwiLCBcInNhcC51aS5tZGNcIiwgXCJzYXAuZlwiXSxcblx0dHlwZXM6IFtcInNhcC5mZS5jb3JlLkNyZWF0aW9uTW9kZVwiLCBcInNhcC5mZS5jb3JlLlZhcmlhbnRNYW5hZ2VtZW50XCJdLFxuXHRpbnRlcmZhY2VzOiBbXSxcblx0Y29udHJvbHM6IFtdLFxuXHRlbGVtZW50czogW10sXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10ZW1wbGF0ZS1jdXJseS1pbi1zdHJpbmdcblx0dmVyc2lvbjogXCIke3ZlcnNpb259XCIsXG5cdG5vTGlicmFyeUNTUzogdHJ1ZSxcblx0ZXh0ZW5zaW9uczoge1xuXHRcdC8vQ29uZmlndXJhdGlvbiB1c2VkIGZvciBydWxlIGxvYWRpbmcgb2YgU3VwcG9ydCBBc3Npc3RhbnRcblx0XHRcInNhcC51aS5zdXBwb3J0XCI6IHtcblx0XHRcdHB1YmxpY1J1bGVzOiB0cnVlLFxuXHRcdFx0aW50ZXJuYWxSdWxlczogdHJ1ZVxuXHRcdH0sXG5cdFx0ZmxDaGFuZ2VIYW5kbGVyczoge1xuXHRcdFx0XCJzYXAuZmUuY29yZS5jb250cm9scy5GaWx0ZXJCYXJcIjogXCJzYXAvdWkvbWRjL2ZsZXhpYmlsaXR5L0ZpbHRlckJhclwiXG5cdFx0fVxuXHR9XG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG59KSBhcyBhbnk7XG5cbi8qKlxuICogQXZhaWxhYmxlIHZhbHVlcyBmb3IgaW52b2NhdGlvbiBncm91cGluZy5cbiAqXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG50aGlzTGliLkludm9jYXRpb25Hcm91cGluZyA9IHtcblx0LyoqXG5cdCAqIElzb2xhdGVkLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0SXNvbGF0ZWQ6IFwiSXNvbGF0ZWRcIixcblx0LyoqXG5cdCAqIENoYW5nZVNldC5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdENoYW5nZVNldDogXCJDaGFuZ2VTZXRcIlxufTtcbi8qKlxuICogQXZhaWxhYmxlIHZhbHVlcyBmb3IgY3JlYXRpb24gbW9kZS5cbiAqXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG50aGlzTGliLkNyZWF0aW9uTW9kZSA9IHtcblx0LyoqXG5cdCAqIE5ldyBQYWdlLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0TmV3UGFnZTogXCJOZXdQYWdlXCIsXG5cdC8qKlxuXHQgKiBTeW5jLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0U3luYzogXCJTeW5jXCIsXG5cdC8qKlxuXHQgKiBBc3luYy5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEFzeW5jOiBcIkFzeW5jXCIsXG5cdC8qKlxuXHQgKiBEZWZlcnJlZC5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdERlZmVycmVkOiBcIkRlZmVycmVkXCIsXG5cdC8qKlxuXHQgKiBJbmxpbmUuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRJbmxpbmU6IFwiSW5saW5lXCIsXG5cdC8qKlxuXHQgKiBDcmVhdGlvbiByb3cuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRDcmVhdGlvblJvdzogXCJDcmVhdGlvblJvd1wiLFxuXHQvKipcblx0ICogSW5saW5lIGNyZWF0aW9uIHJvd3MuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRJbmxpbmVDcmVhdGlvblJvd3M6IFwiSW5saW5lQ3JlYXRpb25Sb3dzXCIsXG5cdC8qKlxuXHQgKiBFeHRlcm5hbCAoYnkgb3V0Ym91bmQgbmF2aWdhdGlvbikuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRFeHRlcm5hbDogXCJFeHRlcm5hbFwiXG59O1xuLyoqXG4gKiBBdmFpbGFibGUgdmFsdWVzIGZvciBWYXJpYW50IE1hbmFnZW1lbnQuXG4gKlxuICogQHJlYWRvbmx5XG4gKiBAZW51bSB7c3RyaW5nfVxuICogQHByaXZhdGVcbiAqL1xudGhpc0xpYi5WYXJpYW50TWFuYWdlbWVudCA9IHtcblx0LyoqXG5cdCAqIE5vIHZhcmlhbnQgbWFuYWdlbWVudCBhdCBhbGwuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHROb25lOiBcIk5vbmVcIixcblxuXHQvKipcblx0ICogT25lIHZhcmlhbnQgY29uZmlndXJhdGlvbiBmb3IgdGhlIHdob2xlIHBhZ2UuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRQYWdlOiBcIlBhZ2VcIixcblxuXHQvKipcblx0ICogVmFyaWFudCBtYW5hZ2VtZW50IG9uIGNvbnRyb2wgbGV2ZWwuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRDb250cm9sOiBcIkNvbnRyb2xcIlxufTtcbi8qKlxuICogQXZhaWxhYmxlIGNvbnN0YW50cy5cbiAqXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG50aGlzTGliLkNvbnN0YW50cyA9IHtcblx0Lypcblx0ICogSW5kaWNhdGVzIGNhbmNlbGxpbmcgb2YgYW4gYWN0aW9uIGRpYWxvZy5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdENhbmNlbEFjdGlvbkRpYWxvZzogXCJjYW5jZWxcIixcblx0Lypcblx0ICogSW5kaWNhdGVzIGZhaWx1cmUgcmV0dXJuZWQgZnJvbSBiYWNrZW5kIGR1cmluZyB0aGUgZXhlY3V0aW9uIG9mIGFuIGFjdGlvblxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QWN0aW9uRXhlY3V0aW9uRmFpbGVkOiBcImFjdGlvbkV4ZWN1dGlvbkZhaWxlZFwiLFxuXHQvKlxuXHQgKiBJbmRpY2F0ZXMgZmFpbHVyZSByZXR1cm5lZCBmcm9tIGJhY2tlbmQgZHVyaW5nIGNyZWF0aW9uIG9mIGEgYnVzaW5lc3Mgb2JqZWN0ICh2aWEgZGlyZWN0IFBPU1QpXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRDcmVhdGlvbkZhaWxlZDogXCJjcmVhdGlvbkZhaWxlZFwiXG59O1xuLyoqXG4gKiBBdmFpbGFibGUgdmFsdWVzIGZvciBwcm9ncmFtbWluZyBtb2RlbC5cbiAqXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG50aGlzTGliLlByb2dyYW1taW5nTW9kZWwgPSB7XG5cdC8qXG5cdCAqIERyYWZ0LlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0RHJhZnQ6IFwiRHJhZnRcIixcblx0LyoqXG5cdCAqIFN0aWNreS5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFN0aWNreTogXCJTdGlja3lcIixcblx0LyoqXG5cdCAqIE5vbkRyYWZ0LlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Tm9uRHJhZnQ6IFwiTm9uRHJhZnRcIlxufTtcbi8qKlxuICogQXZhaWxhYmxlIHZhbHVlcyBmb3IgZHJhZnQgc3RhdHVzLlxuICpcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbnRoaXNMaWIuRHJhZnRTdGF0dXMgPSB7XG5cdC8qKlxuXHQgKiBTYXZpbmcuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRTYXZpbmc6IFwiU2F2aW5nXCIsXG5cdC8qKlxuXHQgKiBTYXZlZC5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdFNhdmVkOiBcIlNhdmVkXCIsXG5cdC8qKlxuXHQgKiBDbGVhci5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdENsZWFyOiBcIkNsZWFyXCJcbn07XG4vKipcbiAqIEVkaXQgbW9kZSB2YWx1ZXMuXG4gKlxuICogQHJlYWRvbmx5XG4gKiBAZW51bSB7c3RyaW5nfVxuICogQHByaXZhdGVcbiAqL1xudGhpc0xpYi5FZGl0TW9kZSA9IHtcblx0LyoqXG5cdCAqIFZpZXcgaXMgY3VycmVudGx5IGRpc3BsYXlpbmcgb25seS5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdERpc3BsYXk6IFwiRGlzcGxheVwiLFxuXHQvKipcblx0ICogVmlldyBpcyBjdXJyZW50bHkgZWRpdGFibGUuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRFZGl0YWJsZTogXCJFZGl0YWJsZVwiXG59O1xuLyoqXG4gKiBUZW1wbGF0ZSB2aWV3cy5cbiAqXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG50aGlzTGliLlRlbXBsYXRlQ29udGVudFZpZXcgPSB7XG5cdC8qKlxuXHQgKiBIeWJyaWQuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0SHlicmlkOiBcIkh5YnJpZFwiLFxuXHQvKipcblx0ICogQ2hhcnQuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0Q2hhcnQ6IFwiQ2hhcnRcIixcblx0LyoqXG5cdCAqIFRhYmxlLlxuXHQgKlxuXHQgKiBAY29uc3RhbnRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdFRhYmxlOiBcIlRhYmxlXCJcbn07XG4vKipcbiAqIFBvc3NpYmxlIGluaXRpYWwgbG9hZCAoZmlyc3QgYXBwIHN0YXJ0dXApIG1vZGVzIGZvciBhIExpc3RSZXBvcnQuXG4gKlxuICogQGVudW0ge3N0cmluZ31cbiAqIEBuYW1lIHNhcC5mZS5jb3JlLkluaXRpYWxMb2FkTW9kZVxuICogQHJlYWRvbmx5XG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS44Ni4wXG4gKi9cbmV4cG9ydCBlbnVtIEluaXRpYWxMb2FkTW9kZSB7XG5cdC8qKlxuXHQgKiBEYXRhIHdpbGwgYmUgbG9hZGVkIGluaXRpYWxseS5cblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuSW5pdGlhbExvYWRNb2RlLkVuYWJsZWRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0RW5hYmxlZCA9IFwiRW5hYmxlZFwiLFxuXG5cdC8qKlxuXHQgKiBEYXRhIHdpbGwgbm90IGJlIGxvYWRlZCBpbml0aWFsbHkuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLkluaXRpYWxMb2FkTW9kZS5EaXNhYmxlZFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHREaXNhYmxlZCA9IFwiRGlzYWJsZWRcIixcblxuXHQvKipcblx0ICogRGF0YSB3aWxsIGJlIGxvYWRlZCBpbml0aWFsbHkgaWYgZmlsdGVycyBhcmUgc2V0LlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5Jbml0aWFsTG9hZE1vZGUuQXV0b1xuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRBdXRvID0gXCJBdXRvXCJcbn1cbnRoaXNMaWIuSW5pdGlhbExvYWRNb2RlID0gSW5pdGlhbExvYWRNb2RlO1xuXG4vKipcbiAqIFZhbHVlIG9mIHRoZSBzdGFydHVwIG1vZGVcbiAqXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG50aGlzTGliLlN0YXJ0dXBNb2RlID0ge1xuXHQvKipcblx0ICogQXBwIGhhcyBiZWVuIHN0YXJ0ZWQgbm9ybWFsbHkuXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0Tm9ybWFsOiBcIk5vcm1hbFwiLFxuXHQvKipcblx0ICogQXBwIGhhcyBiZWVuIHN0YXJ0ZWQgd2l0aCBzdGFydHVwIGtleXMgKGRlZXBsaW5rKS5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHREZWVwbGluazogXCJEZWVwbGlua1wiLFxuXHQvKipcblx0ICogQXBwIGhhcyBiZWVuIHN0YXJ0ZWQgaW4gJ2NyZWF0ZScgbW9kZS5cblx0ICpcblx0ICogQGNvbnN0YW50XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHRDcmVhdGU6IFwiQ3JlYXRlXCIsXG5cdC8qKlxuXHQgKiBBcHAgaGFzIGJlZW4gc3RhcnRlZCBpbiAnYXV0byBjcmVhdGUnIG1vZGUgd2hpY2ggbWVhbnMgdG8gc2tpcCBhbnkgZGlhbG9ncyBvbiBzdGFydHVwXG5cdCAqXG5cdCAqIEBjb25zdGFudFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0QXV0b0NyZWF0ZTogXCJBdXRvQ3JlYXRlXCJcbn07XG4vLyBleHBsaWNpdCB0eXBlIHRvIGhhbmRsZSBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggYm9vbGVhbiB2YWx1ZXNcbmNvbnN0IEluaXRpYWxMb2FkVHlwZSA9IERhdGFUeXBlLmNyZWF0ZVR5cGUoXCJzYXAuZmUuY29yZS5Jbml0aWFsTG9hZE1vZGVcIiwge1xuXHRkZWZhdWx0VmFsdWU6IHRoaXNMaWIuSW5pdGlhbExvYWRNb2RlLkF1dG8sXG5cdGlzVmFsaWQ6IGZ1bmN0aW9uICh2VmFsdWU6IHN0cmluZyB8IGJvb2xlYW4gfCB1bmRlZmluZWQpIHtcblx0XHRpZiAodHlwZW9mIHZWYWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcIkRFUFJFQ0FURUQ6IGJvb2xlYW4gdmFsdWUgbm90IGFsbG93ZWQgZm9yICdpbml0aWFsTG9hZCcgbWFuaWZlc3Qgc2V0dGluZyAtIHN1cHBvcnRlZCB2YWx1ZXMgYXJlOiBEaXNhYmxlZHxFbmFibGVkfEF1dG9cIlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHZWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZWYWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdlZhbHVlID09PSBcImJvb2xlYW5cIiB8fCB0aGlzTGliLkluaXRpYWxMb2FkTW9kZS5oYXNPd25Qcm9wZXJ0eSh2VmFsdWUpO1xuXHR9XG59KTtcbi8vIG5vcm1hbGl6ZSBhIHZhbHVlLCB0YWtpbmcgY2FyZSBvZiBib29sZWFuIHR5cGVcbkluaXRpYWxMb2FkVHlwZS5zZXROb3JtYWxpemVyKGZ1bmN0aW9uICh2VmFsdWU6IHN0cmluZyB8IGJvb2xlYW4gfCB1bmRlZmluZWQpIHtcblx0aWYgKCF2VmFsdWUpIHtcblx0XHQvLyB1bmRlZmluZWQsIG51bGwgb3IgZmFsc2Vcblx0XHRyZXR1cm4gdGhpc0xpYi5Jbml0aWFsTG9hZE1vZGUuRGlzYWJsZWQ7XG5cdH1cblx0cmV0dXJuIHZWYWx1ZSA9PT0gdHJ1ZSA/IHRoaXNMaWIuSW5pdGlhbExvYWRNb2RlLkVuYWJsZWQgOiB2VmFsdWU7XG59KTtcblNlcnZpY2VGYWN0b3J5UmVnaXN0cnkucmVnaXN0ZXIoXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5UZW1wbGF0ZWRWaWV3U2VydmljZVwiLCBuZXcgVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5KCkpO1xuU2VydmljZUZhY3RvcnlSZWdpc3RyeS5yZWdpc3RlcihcInNhcC5mZS5jb3JlLnNlcnZpY2VzLlJlc291cmNlTW9kZWxTZXJ2aWNlXCIsIG5ldyBSZXNvdXJjZU1vZGVsU2VydmljZUZhY3RvcnkoKSk7XG5TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LnJlZ2lzdGVyKFwic2FwLmZlLmNvcmUuc2VydmljZXMuQ2FjaGVIYW5kbGVyU2VydmljZVwiLCBuZXcgQ2FjaGVIYW5kbGVyU2VydmljZUZhY3RvcnkoKSk7XG5TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LnJlZ2lzdGVyKFwic2FwLmZlLmNvcmUuc2VydmljZXMuTmF2aWdhdGlvblNlcnZpY2VcIiwgbmV3IE5hdmlnYXRpb25TZXJ2aWNlKCkpO1xuU2VydmljZUZhY3RvcnlSZWdpc3RyeS5yZWdpc3RlcihcInNhcC5mZS5jb3JlLnNlcnZpY2VzLlJvdXRpbmdTZXJ2aWNlXCIsIG5ldyBSb3V0aW5nU2VydmljZUZhY3RvcnkoKSk7XG5TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LnJlZ2lzdGVyKFwic2FwLmZlLmNvcmUuc2VydmljZXMuU2lkZUVmZmVjdHNTZXJ2aWNlXCIsIG5ldyBTaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5KCkpO1xuU2VydmljZUZhY3RvcnlSZWdpc3RyeS5yZWdpc3RlcihcInNhcC5mZS5jb3JlLnNlcnZpY2VzLlNoZWxsU2VydmljZXNcIiwgbmV3IFNoZWxsU2VydmljZXNGYWN0b3J5KCkpO1xuU2VydmljZUZhY3RvcnlSZWdpc3RyeS5yZWdpc3RlcihcInNhcC5mZS5jb3JlLnNlcnZpY2VzLkVudmlyb25tZW50U2VydmljZVwiLCBuZXcgRW52aXJvbm1lbnRTZXJ2aWNlRmFjdG9yeSgpKTtcblNlcnZpY2VGYWN0b3J5UmVnaXN0cnkucmVnaXN0ZXIoXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5Bc3luY0NvbXBvbmVudFNlcnZpY2VcIiwgbmV3IEFzeW5jQ29tcG9uZW50U2VydmljZUZhY3RvcnkoKSk7XG5cbmV4cG9ydCBkZWZhdWx0IHRoaXNMaWI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBeUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sTUFBTUEsV0FBVyxHQUFHLFFBQVE7RUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLE1BQU1DLGVBQWUsR0FBRyxhQUFhO0VBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkE7RUFPTyxNQUFNQyxlQUFlLEdBQUcsNkJBQTZCO0VBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkE7RUFPTyxNQUFNQyxjQUFjLEdBQUcsaUJBQWlCO0VBQUM7RUFFaEQsTUFBTUMsT0FBTyxHQUFHQyxJQUFJLENBQUNDLFdBQVcsQ0FBQztJQUNoQ0MsSUFBSSxFQUFFLGFBQWE7SUFDbkJDLFlBQVksRUFBRSxDQUFDLGFBQWEsRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FB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