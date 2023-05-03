/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/ManifestSettings"], function (ManifestSettings) {
  "use strict";

  var VariantManagementType = ManifestSettings.VariantManagementType;
  function ensureAnnotationPath(obj, property) {
    const propertyValue = obj === null || obj === void 0 ? void 0 : obj[property];
    if (Array.isArray(propertyValue)) {
      propertyValue.forEach(entry => ensureAnnotationPath(entry, "annotationPath"));
    } else if (propertyValue && !propertyValue.includes("@")) {
      obj[property] = "@" + propertyValue;
    }
  }

  /**
   *
   */
  let ManifestWrapper = /*#__PURE__*/function () {
    /**
     * Creates a wrapper object to ensure the data returned from the manifest is consistent and everything is merged correctly.
     *
     * @param oManifestSettings The manifest settings for the current page
     * @param mergeFn A function that will be used to perform the merge
     * @returns The manifest wrapper object
     */
    function ManifestWrapper(oManifestSettings, mergeFn) {
      var _views;
      this.oManifestSettings = oManifestSettings;
      this.mergeFn = mergeFn;
      // Ensure that properties which are meant to contain an *annotation* path contain a '@'
      ensureAnnotationPath(this.oManifestSettings, "defaultTemplateAnnotationPath");
      (_views = this.oManifestSettings.views) === null || _views === void 0 ? void 0 : _views.paths.forEach(path => {
        ensureAnnotationPath(path, "annotationPath");
        ensureAnnotationPath(path, "primary");
        ensureAnnotationPath(path, "secondary");
      });
      if (this.oManifestSettings.controlConfiguration) {
        for (const controlConfiguration of Object.values(this.oManifestSettings.controlConfiguration)) {
          var _tableSettings;
          const quickVariantSelection = (_tableSettings = controlConfiguration.tableSettings) === null || _tableSettings === void 0 ? void 0 : _tableSettings.quickVariantSelection;
          ensureAnnotationPath(quickVariantSelection, "paths");
        }
      }
    }

    /**
     * Returns the current template type.
     *
     * @returns The type of the current template
     */
    var _proto = ManifestWrapper.prototype;
    _proto.getTemplateType = function getTemplateType() {
      return this.oManifestSettings.converterType;
    }

    /**
     * Checks whether the current template should display the filter bar.
     *
     * @returns `true` if the filter bar should be hidden
     */;
    _proto.isFilterBarHidden = function isFilterBarHidden() {
      var _this$oManifestSettin;
      return !!((_this$oManifestSettin = this.oManifestSettings) !== null && _this$oManifestSettin !== void 0 && _this$oManifestSettin.hideFilterBar);
    };
    _proto.useHiddenFilterBar = function useHiddenFilterBar() {
      var _this$oManifestSettin2;
      return !!((_this$oManifestSettin2 = this.oManifestSettings) !== null && _this$oManifestSettin2 !== void 0 && _this$oManifestSettin2.useHiddenFilterBar);
    }

    /**
     * Checks whether the current environment is a desktop or not.
     *
     * @returns `true` if we are on a desktop
     */;
    _proto.isDesktop = function isDesktop() {
      return !!this.oManifestSettings.isDesktop;
    }

    /**
     * Checks whether the current environment is a mobile phone or not.
     *
     * @returns `true` if we are on a mobile phone
     */;
    _proto.isPhone = function isPhone() {
      return !!this.oManifestSettings.isPhone;
    }

    /**
     * Retrieves the form containers (field groups or identification) defined in the manifest.
     *
     * @param facetTarget The target annotation path for this form
     * @returns A set of form containers defined in the manifest indexed by an iterable key
     */;
    _proto.getFormContainer = function getFormContainer(facetTarget) {
      var _this$oManifestSettin3;
      return (_this$oManifestSettin3 = this.oManifestSettings.controlConfiguration) === null || _this$oManifestSettin3 === void 0 ? void 0 : _this$oManifestSettin3[facetTarget];
    }
    /**
     * Retrieves the header facets defined in the manifest.
     *
     * @returns A set of header facets defined in the manifest indexed by an iterable key
     */;
    _proto.getHeaderFacets = function getHeaderFacets() {
      var _this$oManifestSettin4, _this$oManifestSettin5, _content, _content$header;
      return this.mergeFn({}, (_this$oManifestSettin4 = this.oManifestSettings.controlConfiguration) === null || _this$oManifestSettin4 === void 0 ? void 0 : (_this$oManifestSettin5 = _this$oManifestSettin4["@com.sap.vocabularies.UI.v1.HeaderFacets"]) === null || _this$oManifestSettin5 === void 0 ? void 0 : _this$oManifestSettin5.facets, (_content = this.oManifestSettings.content) === null || _content === void 0 ? void 0 : (_content$header = _content.header) === null || _content$header === void 0 ? void 0 : _content$header.facets);
    }
    /**
     * Retrieves the header actions defined in the manifest.
     *
     * @returns A set of actions defined in the manifest indexed by an iterable key
     */;
    _proto.getHeaderActions = function getHeaderActions() {
      var _this$oManifestSettin6, _this$oManifestSettin7;
      return ((_this$oManifestSettin6 = this.oManifestSettings.content) === null || _this$oManifestSettin6 === void 0 ? void 0 : (_this$oManifestSettin7 = _this$oManifestSettin6.header) === null || _this$oManifestSettin7 === void 0 ? void 0 : _this$oManifestSettin7.actions) || {};
    }
    /**
     * Retrieves the footer actions defined in the manifest.
     *
     * @returns A set of actions defined in the manifest indexed by an iterable key
     */;
    _proto.getFooterActions = function getFooterActions() {
      var _this$oManifestSettin8, _this$oManifestSettin9;
      return ((_this$oManifestSettin8 = this.oManifestSettings.content) === null || _this$oManifestSettin8 === void 0 ? void 0 : (_this$oManifestSettin9 = _this$oManifestSettin8.footer) === null || _this$oManifestSettin9 === void 0 ? void 0 : _this$oManifestSettin9.actions) || {};
    }

    /**
     * Retrieves the variant management as defined in the manifest.
     *
     * @returns A type of variant management
     */;
    _proto.getVariantManagement = function getVariantManagement() {
      return this.oManifestSettings.variantManagement || VariantManagementType.None;
    }

    /**
     * Retrieves the annotation Path for the SPV in the manifest.
     *
     * @returns The annotation path for the default SPV or undefined.
     */;
    _proto.getDefaultTemplateAnnotationPath = function getDefaultTemplateAnnotationPath() {
      return this.oManifestSettings.defaultTemplateAnnotationPath;
    }

    /**
     * Retrieves the control configuration as defined in the manifest for a specific annotation path.
     *
     * @param sAnnotationPath The relative annotation path
     * @private
     * @returns The control configuration
     */;
    _proto.getControlConfiguration = function getControlConfiguration(sAnnotationPath) {
      var _this$oManifestSettin10, _this$oManifestSettin11;
      return ((_this$oManifestSettin10 = this.oManifestSettings) === null || _this$oManifestSettin10 === void 0 ? void 0 : (_this$oManifestSettin11 = _this$oManifestSettin10.controlConfiguration) === null || _this$oManifestSettin11 === void 0 ? void 0 : _this$oManifestSettin11[sAnnotationPath]) || {};
    }
    /**
     * Retrieves the configured settings for a given navigation target.
     *
     * @param navigationOrCollectionName The name of the navigation to check
     * @returns The navigation settings configuration
     */;
    _proto.getNavigationConfiguration = function getNavigationConfiguration(navigationOrCollectionName) {
      var _this$oManifestSettin12, _this$oManifestSettin13;
      return ((_this$oManifestSettin12 = this.oManifestSettings) === null || _this$oManifestSettin12 === void 0 ? void 0 : (_this$oManifestSettin13 = _this$oManifestSettin12.navigation) === null || _this$oManifestSettin13 === void 0 ? void 0 : _this$oManifestSettin13[navigationOrCollectionName]) || {};
    }

    /**
     * Retrieves the view level.
     *
     * @returns The current view level
     */;
    _proto.getViewLevel = function getViewLevel() {
      var _this$oManifestSettin14;
      return ((_this$oManifestSettin14 = this.oManifestSettings) === null || _this$oManifestSettin14 === void 0 ? void 0 : _this$oManifestSettin14.viewLevel) || -1;
    }

    /**
     * Retrieves the contentDensities setting of the application.
     *
     * @returns The current content density
     */;
    _proto.getContentDensities = function getContentDensities() {
      var _this$oManifestSettin15;
      return ((_this$oManifestSettin15 = this.oManifestSettings) === null || _this$oManifestSettin15 === void 0 ? void 0 : _this$oManifestSettin15.contentDensities) || {
        cozy: false,
        compact: false
      };
    }

    /**
     * Checks whether we are in FCL mode or not.
     *
     * @returns `true` if we are in FCL
     */;
    _proto.isFclEnabled = function isFclEnabled() {
      var _this$oManifestSettin16;
      return !!((_this$oManifestSettin16 = this.oManifestSettings) !== null && _this$oManifestSettin16 !== void 0 && _this$oManifestSettin16.fclEnabled);
    }

    /**
     * Checks whether the current settings (application / shell) allows us to use condensed layout.
     *
     * @returns `true` if we can use the condensed layout, false otherwise
     */;
    _proto.isCondensedLayoutCompliant = function isCondensedLayoutCompliant() {
      var _this$oManifestSettin17, _this$oManifestSettin18;
      const manifestContentDensity = ((_this$oManifestSettin17 = this.oManifestSettings) === null || _this$oManifestSettin17 === void 0 ? void 0 : _this$oManifestSettin17.contentDensities) || {
        cozy: false,
        compact: false
      };
      const shellContentDensity = ((_this$oManifestSettin18 = this.oManifestSettings) === null || _this$oManifestSettin18 === void 0 ? void 0 : _this$oManifestSettin18.shellContentDensity) || "compact";
      let isCondensedLayoutCompliant = true;
      if ((manifestContentDensity === null || manifestContentDensity === void 0 ? void 0 : manifestContentDensity.cozy) === true && (manifestContentDensity === null || manifestContentDensity === void 0 ? void 0 : manifestContentDensity.compact) !== true || shellContentDensity === "cozy") {
        isCondensedLayoutCompliant = false;
      }
      return isCondensedLayoutCompliant;
    }
    /**
     * Checks whether the current settings (application / shell) uses compact mode as content density.
     *
     * @returns `true` if compact mode is set as content density, false otherwise
     */;
    _proto.isCompactType = function isCompactType() {
      var _this$oManifestSettin19;
      const manifestContentDensity = this.getContentDensities();
      const shellContentDensity = ((_this$oManifestSettin19 = this.oManifestSettings) === null || _this$oManifestSettin19 === void 0 ? void 0 : _this$oManifestSettin19.shellContentDensity) || "compact";
      return manifestContentDensity.compact !== false || shellContentDensity === "compact" ? true : false;
    }

    //region OP Specific

    /**
     * Retrieves the section layout defined in the manifest.
     *
     * @returns The type of section layout of the object page
     */;
    _proto.getSectionLayout = function getSectionLayout() {
      return this.oManifestSettings.sectionLayout;
    }

    /**
     * Retrieves the sections defined in the manifest.
     *
     * @returns A set of manifest sections indexed by an iterable key
     */;
    _proto.getSections = function getSections() {
      var _this$oManifestSettin20, _this$oManifestSettin21, _content2, _content2$body;
      return this.mergeFn({}, (_this$oManifestSettin20 = this.oManifestSettings.controlConfiguration) === null || _this$oManifestSettin20 === void 0 ? void 0 : (_this$oManifestSettin21 = _this$oManifestSettin20["@com.sap.vocabularies.UI.v1.Facets"]) === null || _this$oManifestSettin21 === void 0 ? void 0 : _this$oManifestSettin21.sections, (_content2 = this.oManifestSettings.content) === null || _content2 === void 0 ? void 0 : (_content2$body = _content2.body) === null || _content2$body === void 0 ? void 0 : _content2$body.sections);
    }

    /**
     * Returns true of the header of the application is editable and should appear in the facets.
     *
     * @returns `true` if the header if editable
     */;
    _proto.isHeaderEditable = function isHeaderEditable() {
      return this.getShowObjectPageHeader() && this.oManifestSettings.editableHeaderContent;
    }
    /**
     * Returns true if we should show the object page header.
     *
     * @returns `true` if the header should be displayed
     */;
    _proto.getShowAnchorBar = function getShowAnchorBar() {
      var _content3, _content3$header, _content4, _content4$header;
      return ((_content3 = this.oManifestSettings.content) === null || _content3 === void 0 ? void 0 : (_content3$header = _content3.header) === null || _content3$header === void 0 ? void 0 : _content3$header.anchorBarVisible) !== undefined ? !!((_content4 = this.oManifestSettings.content) !== null && _content4 !== void 0 && (_content4$header = _content4.header) !== null && _content4$header !== void 0 && _content4$header.anchorBarVisible) : true;
    }

    /**
     * Defines whether or not the section will be displayed in different tabs.
     *
     * @returns `true` if the icon tab bar should be used instead of scrolling
     */;
    _proto.useIconTabBar = function useIconTabBar() {
      return this.getShowAnchorBar() && this.oManifestSettings.sectionLayout === "Tabs";
    }

    /**
     * Returns true if the object page header is to be shown.
     *
     * @returns `true` if the object page header is to be displayed
     */;
    _proto.getShowObjectPageHeader = function getShowObjectPageHeader() {
      var _content5, _content5$header, _content6, _content6$header;
      return ((_content5 = this.oManifestSettings.content) === null || _content5 === void 0 ? void 0 : (_content5$header = _content5.header) === null || _content5$header === void 0 ? void 0 : _content5$header.visible) !== undefined ? !!((_content6 = this.oManifestSettings.content) !== null && _content6 !== void 0 && (_content6$header = _content6.header) !== null && _content6$header !== void 0 && _content6$header.visible) : true;
    }

    //endregion OP Specific

    //region LR Specific

    /**
     * Retrieves the multiple view configuration from the manifest.
     *
     * @returns The views that represent the manifest object
     */;
    _proto.getViewConfiguration = function getViewConfiguration() {
      return this.oManifestSettings.views;
    }

    /**
     * Retrieves the stickyMultiTabHeader configuration from the manifest.
     *
     * @returns Returns True if stickyMultiTabHeader is enabled or undefined
     */;
    _proto.getStickyMultiTabHeaderConfiguration = function getStickyMultiTabHeaderConfiguration() {
      const bStickyMultiTabHeader = this.oManifestSettings.stickyMultiTabHeader;
      return bStickyMultiTabHeader !== undefined ? bStickyMultiTabHeader : true;
    }

    /**
     * Retrieves the KPI configuration from the manifest.
     *
     * @returns Returns a map between KPI names and their respective configuration
     */;
    _proto.getKPIConfiguration = function getKPIConfiguration() {
      return this.oManifestSettings.keyPerformanceIndicators || {};
    }

    /**
     * Retrieves the filter configuration from the manifest.
     *
     * @returns The filter configuration from the manifest
     */;
    _proto.getFilterConfiguration = function getFilterConfiguration() {
      return this.getControlConfiguration("@com.sap.vocabularies.UI.v1.SelectionFields");
    }
    /**
     * Returns true if there are multiple entity sets to be displayed.
     *
     * @returns `true` if there are multiple entity sets
     */;
    _proto.hasMultipleEntitySets = function hasMultipleEntitySets() {
      const viewConfig = this.getViewConfiguration() || {
        paths: []
      };
      const manifestEntitySet = this.oManifestSettings.entitySet;
      return viewConfig.paths.find(path => {
        var _path;
        if ((_path = path) !== null && _path !== void 0 && _path.template) {
          return undefined;
        } else if (this.hasMultipleVisualizations(path)) {
          const {
            primary,
            secondary
          } = path;
          return primary.some(primaryPath => primaryPath.entitySet && primaryPath.entitySet !== manifestEntitySet) || secondary.some(secondaryPath => secondaryPath.entitySet && secondaryPath.entitySet !== manifestEntitySet);
        } else {
          path = path;
          return path.entitySet && path.entitySet !== manifestEntitySet;
        }
      }) !== undefined;
    }

    /**
     * Returns the context path for the template if it is specified in the manifest.
     *
     * @returns The context path for the template
     */;
    _proto.getContextPath = function getContextPath() {
      var _this$oManifestSettin22;
      return (_this$oManifestSettin22 = this.oManifestSettings) === null || _this$oManifestSettin22 === void 0 ? void 0 : _this$oManifestSettin22.contextPath;
    }

    /**
     * Returns true if there are multiple visualizations.
     *
     * @param path The path from the view
     * @returns `true` if there are multiple visualizations
     */;
    _proto.hasMultipleVisualizations = function hasMultipleVisualizations(path) {
      var _primary2, _secondary2;
      if (!path) {
        const viewConfig = this.getViewConfiguration() || {
          paths: []
        };
        return viewConfig.paths.some(viewPath => {
          var _primary, _secondary;
          return ((_primary = viewPath.primary) === null || _primary === void 0 ? void 0 : _primary.length) > 0 && ((_secondary = viewPath.secondary) === null || _secondary === void 0 ? void 0 : _secondary.length) > 0;
        });
      }
      return ((_primary2 = path.primary) === null || _primary2 === void 0 ? void 0 : _primary2.length) > 0 && ((_secondary2 = path.secondary) === null || _secondary2 === void 0 ? void 0 : _secondary2.length) > 0;
    }

    /**
     * Retrieves the entity set defined in the manifest.
     *
     * @returns The entity set defined in the manifest
     */;
    _proto.getEntitySet = function getEntitySet() {
      return this.oManifestSettings.entitySet;
    }

    //end region LR Specific
    ;
    return ManifestWrapper;
  }();
  return ManifestWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlbnN1cmVBbm5vdGF0aW9uUGF0aCIsIm9iaiIsInByb3BlcnR5IiwicHJvcGVydHlWYWx1ZSIsIkFycmF5IiwiaXNBcnJheSIsImZvckVhY2giLCJlbnRyeSIsImluY2x1ZGVzIiwiTWFuaWZlc3RXcmFwcGVyIiwib01hbmlmZXN0U2V0dGluZ3MiLCJtZXJnZUZuIiwidmlld3MiLCJwYXRocyIsInBhdGgiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsIk9iamVjdCIsInZhbHVlcyIsInF1aWNrVmFyaWFudFNlbGVjdGlvbiIsInRhYmxlU2V0dGluZ3MiLCJnZXRUZW1wbGF0ZVR5cGUiLCJjb252ZXJ0ZXJUeXBlIiwiaXNGaWx0ZXJCYXJIaWRkZW4iLCJoaWRlRmlsdGVyQmFyIiwidXNlSGlkZGVuRmlsdGVyQmFyIiwiaXNEZXNrdG9wIiwiaXNQaG9uZSIsImdldEZvcm1Db250YWluZXIiLCJmYWNldFRhcmdldCIsImdldEhlYWRlckZhY2V0cyIsImZhY2V0cyIsImNvbnRlbnQiLCJoZWFkZXIiLCJnZXRIZWFkZXJBY3Rpb25zIiwiYWN0aW9ucyIsImdldEZvb3RlckFjdGlvbnMiLCJmb290ZXIiLCJnZXRWYXJpYW50TWFuYWdlbWVudCIsInZhcmlhbnRNYW5hZ2VtZW50IiwiVmFyaWFudE1hbmFnZW1lbnRUeXBlIiwiTm9uZSIsImdldERlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoIiwiZGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGgiLCJnZXRDb250cm9sQ29uZmlndXJhdGlvbiIsInNBbm5vdGF0aW9uUGF0aCIsImdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uIiwibmF2aWdhdGlvbk9yQ29sbGVjdGlvbk5hbWUiLCJuYXZpZ2F0aW9uIiwiZ2V0Vmlld0xldmVsIiwidmlld0xldmVsIiwiZ2V0Q29udGVudERlbnNpdGllcyIsImNvbnRlbnREZW5zaXRpZXMiLCJjb3p5IiwiY29tcGFjdCIsImlzRmNsRW5hYmxlZCIsImZjbEVuYWJsZWQiLCJpc0NvbmRlbnNlZExheW91dENvbXBsaWFudCIsIm1hbmlmZXN0Q29udGVudERlbnNpdHkiLCJzaGVsbENvbnRlbnREZW5zaXR5IiwiaXNDb21wYWN0VHlwZSIsImdldFNlY3Rpb25MYXlvdXQiLCJzZWN0aW9uTGF5b3V0IiwiZ2V0U2VjdGlvbnMiLCJzZWN0aW9ucyIsImJvZHkiLCJpc0hlYWRlckVkaXRhYmxlIiwiZ2V0U2hvd09iamVjdFBhZ2VIZWFkZXIiLCJlZGl0YWJsZUhlYWRlckNvbnRlbnQiLCJnZXRTaG93QW5jaG9yQmFyIiwiYW5jaG9yQmFyVmlzaWJsZSIsInVuZGVmaW5lZCIsInVzZUljb25UYWJCYXIiLCJ2aXNpYmxlIiwiZ2V0Vmlld0NvbmZpZ3VyYXRpb24iLCJnZXRTdGlja3lNdWx0aVRhYkhlYWRlckNvbmZpZ3VyYXRpb24iLCJiU3RpY2t5TXVsdGlUYWJIZWFkZXIiLCJzdGlja3lNdWx0aVRhYkhlYWRlciIsImdldEtQSUNvbmZpZ3VyYXRpb24iLCJrZXlQZXJmb3JtYW5jZUluZGljYXRvcnMiLCJnZXRGaWx0ZXJDb25maWd1cmF0aW9uIiwiaGFzTXVsdGlwbGVFbnRpdHlTZXRzIiwidmlld0NvbmZpZyIsIm1hbmlmZXN0RW50aXR5U2V0IiwiZW50aXR5U2V0IiwiZmluZCIsInRlbXBsYXRlIiwiaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyIsInByaW1hcnkiLCJzZWNvbmRhcnkiLCJzb21lIiwicHJpbWFyeVBhdGgiLCJzZWNvbmRhcnlQYXRoIiwiZ2V0Q29udGV4dFBhdGgiLCJjb250ZXh0UGF0aCIsInZpZXdQYXRoIiwibGVuZ3RoIiwiZ2V0RW50aXR5U2V0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNYW5pZmVzdFdyYXBwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb25maWd1cmFibGVSZWNvcmQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHR5cGUge1xuXHRCYXNlTWFuaWZlc3RTZXR0aW5ncyxcblx0Q29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb24sXG5cdENvbnRlbnREZW5zaXRpZXNUeXBlLFxuXHRDdXN0b21WaWV3VGVtcGxhdGVDb25maWd1cmF0aW9uLFxuXHRGaWx0ZXJNYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdEZvcm1NYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdEtQSUNvbmZpZ3VyYXRpb24sXG5cdExpc3RSZXBvcnRNYW5pZmVzdFNldHRpbmdzLFxuXHRNYW5pZmVzdEFjdGlvbixcblx0TWFuaWZlc3RIZWFkZXJGYWNldCxcblx0TWFuaWZlc3RTZWN0aW9uLFxuXHRNdWx0aXBsZVZpZXdzQ29uZmlndXJhdGlvbixcblx0TmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0T2JqZWN0UGFnZU1hbmlmZXN0U2V0dGluZ3MsXG5cdFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0VGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdFRlbXBsYXRlVHlwZSxcblx0Vmlld0NvbmZpZ3VyYXRpb24sXG5cdFZpZXdQYXRoQ29uZmlndXJhdGlvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBWYXJpYW50TWFuYWdlbWVudFR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5cbmZ1bmN0aW9uIGVuc3VyZUFubm90YXRpb25QYXRoPFQgZXh0ZW5kcyB7IFtrZXk6IHN0cmluZ106IGFueSB9PihvYmo6IFQgfCB1bmRlZmluZWQsIHByb3BlcnR5OiBrZXlvZiBUKSB7XG5cdGNvbnN0IHByb3BlcnR5VmFsdWUgPSBvYmo/Lltwcm9wZXJ0eV07XG5cdGlmIChBcnJheS5pc0FycmF5KHByb3BlcnR5VmFsdWUpKSB7XG5cdFx0cHJvcGVydHlWYWx1ZS5mb3JFYWNoKChlbnRyeTogYW55KSA9PiBlbnN1cmVBbm5vdGF0aW9uUGF0aChlbnRyeSwgXCJhbm5vdGF0aW9uUGF0aFwiKSk7XG5cdH0gZWxzZSBpZiAocHJvcGVydHlWYWx1ZSAmJiAhcHJvcGVydHlWYWx1ZS5pbmNsdWRlcyhcIkBcIikpIHtcblx0XHRvYmpbcHJvcGVydHldID0gKFwiQFwiICsgcHJvcGVydHlWYWx1ZSkgYXMgYW55O1xuXHR9XG59XG5cbi8qKlxuICpcbiAqL1xuY2xhc3MgTWFuaWZlc3RXcmFwcGVyIHtcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB3cmFwcGVyIG9iamVjdCB0byBlbnN1cmUgdGhlIGRhdGEgcmV0dXJuZWQgZnJvbSB0aGUgbWFuaWZlc3QgaXMgY29uc2lzdGVudCBhbmQgZXZlcnl0aGluZyBpcyBtZXJnZWQgY29ycmVjdGx5LlxuXHQgKlxuXHQgKiBAcGFyYW0gb01hbmlmZXN0U2V0dGluZ3MgVGhlIG1hbmlmZXN0IHNldHRpbmdzIGZvciB0aGUgY3VycmVudCBwYWdlXG5cdCAqIEBwYXJhbSBtZXJnZUZuIEEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gcGVyZm9ybSB0aGUgbWVyZ2Vcblx0ICogQHJldHVybnMgVGhlIG1hbmlmZXN0IHdyYXBwZXIgb2JqZWN0XG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIG9NYW5pZmVzdFNldHRpbmdzOiBCYXNlTWFuaWZlc3RTZXR0aW5ncywgcHJpdmF0ZSBtZXJnZUZuOiBGdW5jdGlvbikge1xuXHRcdC8vIEVuc3VyZSB0aGF0IHByb3BlcnRpZXMgd2hpY2ggYXJlIG1lYW50IHRvIGNvbnRhaW4gYW4gKmFubm90YXRpb24qIHBhdGggY29udGFpbiBhICdAJ1xuXHRcdGVuc3VyZUFubm90YXRpb25QYXRoKHRoaXMub01hbmlmZXN0U2V0dGluZ3MsIFwiZGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGhcIik7XG5cblx0XHQodGhpcy5vTWFuaWZlc3RTZXR0aW5ncyBhcyBMaXN0UmVwb3J0TWFuaWZlc3RTZXR0aW5ncykudmlld3M/LnBhdGhzLmZvckVhY2goKHBhdGgpID0+IHtcblx0XHRcdGVuc3VyZUFubm90YXRpb25QYXRoKHBhdGggYXMgU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uLCBcImFubm90YXRpb25QYXRoXCIpO1xuXHRcdFx0ZW5zdXJlQW5ub3RhdGlvblBhdGgocGF0aCBhcyBDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbiwgXCJwcmltYXJ5XCIpO1xuXHRcdFx0ZW5zdXJlQW5ub3RhdGlvblBhdGgocGF0aCBhcyBDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbiwgXCJzZWNvbmRhcnlcIik7XG5cdFx0fSk7XG5cblx0XHRpZiAodGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5jb250cm9sQ29uZmlndXJhdGlvbikge1xuXHRcdFx0Zm9yIChjb25zdCBjb250cm9sQ29uZmlndXJhdGlvbiBvZiBPYmplY3QudmFsdWVzKHRoaXMub01hbmlmZXN0U2V0dGluZ3MuY29udHJvbENvbmZpZ3VyYXRpb24pKSB7XG5cdFx0XHRcdGNvbnN0IHF1aWNrVmFyaWFudFNlbGVjdGlvbiA9IChjb250cm9sQ29uZmlndXJhdGlvbiBhcyBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbikudGFibGVTZXR0aW5ncz8ucXVpY2tWYXJpYW50U2VsZWN0aW9uO1xuXHRcdFx0XHRlbnN1cmVBbm5vdGF0aW9uUGF0aChxdWlja1ZhcmlhbnRTZWxlY3Rpb24sIFwicGF0aHNcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgdGVtcGxhdGUgdHlwZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHR5cGUgb2YgdGhlIGN1cnJlbnQgdGVtcGxhdGVcblx0ICovXG5cdGdldFRlbXBsYXRlVHlwZSgpOiBUZW1wbGF0ZVR5cGUge1xuXHRcdHJldHVybiB0aGlzLm9NYW5pZmVzdFNldHRpbmdzLmNvbnZlcnRlclR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgdGVtcGxhdGUgc2hvdWxkIGRpc3BsYXkgdGhlIGZpbHRlciBiYXIuXG5cdCAqXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgZmlsdGVyIGJhciBzaG91bGQgYmUgaGlkZGVuXG5cdCAqL1xuXHRpc0ZpbHRlckJhckhpZGRlbigpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gISEodGhpcy5vTWFuaWZlc3RTZXR0aW5ncyBhcyBMaXN0UmVwb3J0TWFuaWZlc3RTZXR0aW5ncyk/LmhpZGVGaWx0ZXJCYXI7XG5cdH1cblxuXHR1c2VIaWRkZW5GaWx0ZXJCYXIoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICEhKHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgTGlzdFJlcG9ydE1hbmlmZXN0U2V0dGluZ3MpPy51c2VIaWRkZW5GaWx0ZXJCYXI7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgYSBkZXNrdG9wIG9yIG5vdC5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHdlIGFyZSBvbiBhIGRlc2t0b3Bcblx0ICovXG5cdGlzRGVza3RvcCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gISF0aGlzLm9NYW5pZmVzdFNldHRpbmdzLmlzRGVza3RvcDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpcyBhIG1vYmlsZSBwaG9uZSBvciBub3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB3ZSBhcmUgb24gYSBtb2JpbGUgcGhvbmVcblx0ICovXG5cdGlzUGhvbmUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICEhdGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5pc1Bob25lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgZm9ybSBjb250YWluZXJzIChmaWVsZCBncm91cHMgb3IgaWRlbnRpZmljYXRpb24pIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gZmFjZXRUYXJnZXQgVGhlIHRhcmdldCBhbm5vdGF0aW9uIHBhdGggZm9yIHRoaXMgZm9ybVxuXHQgKiBAcmV0dXJucyBBIHNldCBvZiBmb3JtIGNvbnRhaW5lcnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QgaW5kZXhlZCBieSBhbiBpdGVyYWJsZSBrZXlcblx0ICovXG5cdGdldEZvcm1Db250YWluZXIoZmFjZXRUYXJnZXQ6IHN0cmluZyk6IEZvcm1NYW5pZmVzdENvbmZpZ3VyYXRpb24ge1xuXHRcdHJldHVybiB0aGlzLm9NYW5pZmVzdFNldHRpbmdzLmNvbnRyb2xDb25maWd1cmF0aW9uPy5bZmFjZXRUYXJnZXRdIGFzIEZvcm1NYW5pZmVzdENvbmZpZ3VyYXRpb247XG5cdH1cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgaGVhZGVyIGZhY2V0cyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgQSBzZXQgb2YgaGVhZGVyIGZhY2V0cyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCBpbmRleGVkIGJ5IGFuIGl0ZXJhYmxlIGtleVxuXHQgKi9cblx0Z2V0SGVhZGVyRmFjZXRzKCk6IENvbmZpZ3VyYWJsZVJlY29yZDxNYW5pZmVzdEhlYWRlckZhY2V0PiB7XG5cdFx0cmV0dXJuIHRoaXMubWVyZ2VGbihcblx0XHRcdHt9LFxuXHRcdFx0dGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5jb250cm9sQ29uZmlndXJhdGlvbj8uW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckZhY2V0c1wiXT8uZmFjZXRzLFxuXHRcdFx0KHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgT2JqZWN0UGFnZU1hbmlmZXN0U2V0dGluZ3MpLmNvbnRlbnQ/LmhlYWRlcj8uZmFjZXRzXG5cdFx0KTtcblx0fVxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBoZWFkZXIgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgQSBzZXQgb2YgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCBpbmRleGVkIGJ5IGFuIGl0ZXJhYmxlIGtleVxuXHQgKi9cblx0Z2V0SGVhZGVyQWN0aW9ucygpOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RBY3Rpb24+IHtcblx0XHRyZXR1cm4gdGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5jb250ZW50Py5oZWFkZXI/LmFjdGlvbnMgfHwge307XG5cdH1cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgZm9vdGVyIGFjdGlvbnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgc2V0IG9mIGFjdGlvbnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QgaW5kZXhlZCBieSBhbiBpdGVyYWJsZSBrZXlcblx0ICovXG5cdGdldEZvb3RlckFjdGlvbnMoKTogQ29uZmlndXJhYmxlUmVjb3JkPE1hbmlmZXN0QWN0aW9uPiB7XG5cdFx0cmV0dXJuIHRoaXMub01hbmlmZXN0U2V0dGluZ3MuY29udGVudD8uZm9vdGVyPy5hY3Rpb25zIHx8IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgdmFyaWFudCBtYW5hZ2VtZW50IGFzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBIHR5cGUgb2YgdmFyaWFudCBtYW5hZ2VtZW50XG5cdCAqL1xuXHRnZXRWYXJpYW50TWFuYWdlbWVudCgpOiBWYXJpYW50TWFuYWdlbWVudFR5cGUge1xuXHRcdHJldHVybiB0aGlzLm9NYW5pZmVzdFNldHRpbmdzLnZhcmlhbnRNYW5hZ2VtZW50IHx8IFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Ob25lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgYW5ub3RhdGlvbiBQYXRoIGZvciB0aGUgU1BWIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGFubm90YXRpb24gcGF0aCBmb3IgdGhlIGRlZmF1bHQgU1BWIG9yIHVuZGVmaW5lZC5cblx0ICovXG5cdGdldERlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMub01hbmlmZXN0U2V0dGluZ3MuZGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBjb250cm9sIGNvbmZpZ3VyYXRpb24gYXMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QgZm9yIGEgc3BlY2lmaWMgYW5ub3RhdGlvbiBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0Fubm90YXRpb25QYXRoIFRoZSByZWxhdGl2ZSBhbm5vdGF0aW9uIHBhdGhcblx0ICogQHByaXZhdGVcblx0ICogQHJldHVybnMgVGhlIGNvbnRyb2wgY29uZmlndXJhdGlvblxuXHQgKi9cblx0Z2V0Q29udHJvbENvbmZpZ3VyYXRpb24oc0Fubm90YXRpb25QYXRoOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLm9NYW5pZmVzdFNldHRpbmdzPy5jb250cm9sQ29uZmlndXJhdGlvbj8uW3NBbm5vdGF0aW9uUGF0aF0gfHwge307XG5cdH1cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgY29uZmlndXJlZCBzZXR0aW5ncyBmb3IgYSBnaXZlbiBuYXZpZ2F0aW9uIHRhcmdldC5cblx0ICpcblx0ICogQHBhcmFtIG5hdmlnYXRpb25PckNvbGxlY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBuYXZpZ2F0aW9uIHRvIGNoZWNrXG5cdCAqIEByZXR1cm5zIFRoZSBuYXZpZ2F0aW9uIHNldHRpbmdzIGNvbmZpZ3VyYXRpb25cblx0ICovXG5cdGdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKG5hdmlnYXRpb25PckNvbGxlY3Rpb25OYW1lOiBzdHJpbmcpOiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uIHtcblx0XHRyZXR1cm4gdGhpcy5vTWFuaWZlc3RTZXR0aW5ncz8ubmF2aWdhdGlvbj8uW25hdmlnYXRpb25PckNvbGxlY3Rpb25OYW1lXSB8fCB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHZpZXcgbGV2ZWwuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHZpZXcgbGV2ZWxcblx0ICovXG5cdGdldFZpZXdMZXZlbCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLm9NYW5pZmVzdFNldHRpbmdzPy52aWV3TGV2ZWwgfHwgLTE7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBjb250ZW50RGVuc2l0aWVzIHNldHRpbmcgb2YgdGhlIGFwcGxpY2F0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBjb250ZW50IGRlbnNpdHlcblx0ICovXG5cdGdldENvbnRlbnREZW5zaXRpZXMoKTogQ29udGVudERlbnNpdGllc1R5cGUge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0aGlzLm9NYW5pZmVzdFNldHRpbmdzPy5jb250ZW50RGVuc2l0aWVzIHx8IHtcblx0XHRcdFx0Y296eTogZmFsc2UsXG5cdFx0XHRcdGNvbXBhY3Q6IGZhbHNlXG5cdFx0XHR9XG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciB3ZSBhcmUgaW4gRkNMIG1vZGUgb3Igbm90LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgd2UgYXJlIGluIEZDTFxuXHQgKi9cblx0aXNGY2xFbmFibGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAhIXRoaXMub01hbmlmZXN0U2V0dGluZ3M/LmZjbEVuYWJsZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2V0dGluZ3MgKGFwcGxpY2F0aW9uIC8gc2hlbGwpIGFsbG93cyB1cyB0byB1c2UgY29uZGVuc2VkIGxheW91dC5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHdlIGNhbiB1c2UgdGhlIGNvbmRlbnNlZCBsYXlvdXQsIGZhbHNlIG90aGVyd2lzZVxuXHQgKi9cblx0aXNDb25kZW5zZWRMYXlvdXRDb21wbGlhbnQoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgbWFuaWZlc3RDb250ZW50RGVuc2l0eSA9IHRoaXMub01hbmlmZXN0U2V0dGluZ3M/LmNvbnRlbnREZW5zaXRpZXMgfHwge1xuXHRcdFx0Y296eTogZmFsc2UsXG5cdFx0XHRjb21wYWN0OiBmYWxzZVxuXHRcdH07XG5cdFx0Y29uc3Qgc2hlbGxDb250ZW50RGVuc2l0eSA9IHRoaXMub01hbmlmZXN0U2V0dGluZ3M/LnNoZWxsQ29udGVudERlbnNpdHkgfHwgXCJjb21wYWN0XCI7XG5cdFx0bGV0IGlzQ29uZGVuc2VkTGF5b3V0Q29tcGxpYW50ID0gdHJ1ZTtcblx0XHRpZiAoKG1hbmlmZXN0Q29udGVudERlbnNpdHk/LmNvenkgPT09IHRydWUgJiYgbWFuaWZlc3RDb250ZW50RGVuc2l0eT8uY29tcGFjdCAhPT0gdHJ1ZSkgfHwgc2hlbGxDb250ZW50RGVuc2l0eSA9PT0gXCJjb3p5XCIpIHtcblx0XHRcdGlzQ29uZGVuc2VkTGF5b3V0Q29tcGxpYW50ID0gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiBpc0NvbmRlbnNlZExheW91dENvbXBsaWFudDtcblx0fVxuXHQvKipcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2V0dGluZ3MgKGFwcGxpY2F0aW9uIC8gc2hlbGwpIHVzZXMgY29tcGFjdCBtb2RlIGFzIGNvbnRlbnQgZGVuc2l0eS5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIGNvbXBhY3QgbW9kZSBpcyBzZXQgYXMgY29udGVudCBkZW5zaXR5LCBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdGlzQ29tcGFjdFR5cGUoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgbWFuaWZlc3RDb250ZW50RGVuc2l0eSA9IHRoaXMuZ2V0Q29udGVudERlbnNpdGllcygpO1xuXHRcdGNvbnN0IHNoZWxsQ29udGVudERlbnNpdHkgPSB0aGlzLm9NYW5pZmVzdFNldHRpbmdzPy5zaGVsbENvbnRlbnREZW5zaXR5IHx8IFwiY29tcGFjdFwiO1xuXHRcdHJldHVybiBtYW5pZmVzdENvbnRlbnREZW5zaXR5LmNvbXBhY3QgIT09IGZhbHNlIHx8IHNoZWxsQ29udGVudERlbnNpdHkgPT09IFwiY29tcGFjdFwiID8gdHJ1ZSA6IGZhbHNlO1xuXHR9XG5cblx0Ly9yZWdpb24gT1AgU3BlY2lmaWNcblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBzZWN0aW9uIGxheW91dCBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHR5cGUgb2Ygc2VjdGlvbiBsYXlvdXQgb2YgdGhlIG9iamVjdCBwYWdlXG5cdCAqL1xuXHRnZXRTZWN0aW9uTGF5b3V0KCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuICh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIE9iamVjdFBhZ2VNYW5pZmVzdFNldHRpbmdzKS5zZWN0aW9uTGF5b3V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgc2VjdGlvbnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgc2V0IG9mIG1hbmlmZXN0IHNlY3Rpb25zIGluZGV4ZWQgYnkgYW4gaXRlcmFibGUga2V5XG5cdCAqL1xuXHRnZXRTZWN0aW9ucygpOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RTZWN0aW9uPiB7XG5cdFx0cmV0dXJuIHRoaXMubWVyZ2VGbihcblx0XHRcdHt9LFxuXHRcdFx0dGhpcy5vTWFuaWZlc3RTZXR0aW5ncy5jb250cm9sQ29uZmlndXJhdGlvbj8uW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZhY2V0c1wiXT8uc2VjdGlvbnMsXG5cdFx0XHQodGhpcy5vTWFuaWZlc3RTZXR0aW5ncyBhcyBPYmplY3RQYWdlTWFuaWZlc3RTZXR0aW5ncykuY29udGVudD8uYm9keT8uc2VjdGlvbnNcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBvZiB0aGUgaGVhZGVyIG9mIHRoZSBhcHBsaWNhdGlvbiBpcyBlZGl0YWJsZSBhbmQgc2hvdWxkIGFwcGVhciBpbiB0aGUgZmFjZXRzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGhlYWRlciBpZiBlZGl0YWJsZVxuXHQgKi9cblx0aXNIZWFkZXJFZGl0YWJsZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRTaG93T2JqZWN0UGFnZUhlYWRlcigpICYmICh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIE9iamVjdFBhZ2VNYW5pZmVzdFNldHRpbmdzKS5lZGl0YWJsZUhlYWRlckNvbnRlbnQ7XG5cdH1cblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiB3ZSBzaG91bGQgc2hvdyB0aGUgb2JqZWN0IHBhZ2UgaGVhZGVyLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGhlYWRlciBzaG91bGQgYmUgZGlzcGxheWVkXG5cdCAqL1xuXHRnZXRTaG93QW5jaG9yQmFyKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAodGhpcy5vTWFuaWZlc3RTZXR0aW5ncyBhcyBPYmplY3RQYWdlTWFuaWZlc3RTZXR0aW5ncykuY29udGVudD8uaGVhZGVyPy5hbmNob3JCYXJWaXNpYmxlICE9PSB1bmRlZmluZWRcblx0XHRcdD8gISEodGhpcy5vTWFuaWZlc3RTZXR0aW5ncyBhcyBPYmplY3RQYWdlTWFuaWZlc3RTZXR0aW5ncykuY29udGVudD8uaGVhZGVyPy5hbmNob3JCYXJWaXNpYmxlXG5cdFx0XHQ6IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lcyB3aGV0aGVyIG9yIG5vdCB0aGUgc2VjdGlvbiB3aWxsIGJlIGRpc3BsYXllZCBpbiBkaWZmZXJlbnQgdGFicy5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpY29uIHRhYiBiYXIgc2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBvZiBzY3JvbGxpbmdcblx0ICovXG5cdHVzZUljb25UYWJCYXIoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0U2hvd0FuY2hvckJhcigpICYmICh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIE9iamVjdFBhZ2VNYW5pZmVzdFNldHRpbmdzKS5zZWN0aW9uTGF5b3V0ID09PSBcIlRhYnNcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdCBwYWdlIGhlYWRlciBpcyB0byBiZSBzaG93bi5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3QgcGFnZSBoZWFkZXIgaXMgdG8gYmUgZGlzcGxheWVkXG5cdCAqL1xuXHRnZXRTaG93T2JqZWN0UGFnZUhlYWRlcigpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgT2JqZWN0UGFnZU1hbmlmZXN0U2V0dGluZ3MpLmNvbnRlbnQ/LmhlYWRlcj8udmlzaWJsZSAhPT0gdW5kZWZpbmVkXG5cdFx0XHQ/ICEhKHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgT2JqZWN0UGFnZU1hbmlmZXN0U2V0dGluZ3MpLmNvbnRlbnQ/LmhlYWRlcj8udmlzaWJsZVxuXHRcdFx0OiB0cnVlO1xuXHR9XG5cblx0Ly9lbmRyZWdpb24gT1AgU3BlY2lmaWNcblxuXHQvL3JlZ2lvbiBMUiBTcGVjaWZpY1xuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIG11bHRpcGxlIHZpZXcgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHZpZXdzIHRoYXQgcmVwcmVzZW50IHRoZSBtYW5pZmVzdCBvYmplY3Rcblx0ICovXG5cdGdldFZpZXdDb25maWd1cmF0aW9uKCk6IE11bHRpcGxlVmlld3NDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gKHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgTGlzdFJlcG9ydE1hbmlmZXN0U2V0dGluZ3MpLnZpZXdzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgc3RpY2t5TXVsdGlUYWJIZWFkZXIgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgUmV0dXJucyBUcnVlIGlmIHN0aWNreU11bHRpVGFiSGVhZGVyIGlzIGVuYWJsZWQgb3IgdW5kZWZpbmVkXG5cdCAqL1xuXHRnZXRTdGlja3lNdWx0aVRhYkhlYWRlckNvbmZpZ3VyYXRpb24oKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgYlN0aWNreU11bHRpVGFiSGVhZGVyID0gKHRoaXMub01hbmlmZXN0U2V0dGluZ3MgYXMgTGlzdFJlcG9ydE1hbmlmZXN0U2V0dGluZ3MpLnN0aWNreU11bHRpVGFiSGVhZGVyO1xuXHRcdHJldHVybiBiU3RpY2t5TXVsdGlUYWJIZWFkZXIgIT09IHVuZGVmaW5lZCA/IGJTdGlja3lNdWx0aVRhYkhlYWRlciA6IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBLUEkgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgUmV0dXJucyBhIG1hcCBiZXR3ZWVuIEtQSSBuYW1lcyBhbmQgdGhlaXIgcmVzcGVjdGl2ZSBjb25maWd1cmF0aW9uXG5cdCAqL1xuXHRnZXRLUElDb25maWd1cmF0aW9uKCk6IHsgW2twaU5hbWU6IHN0cmluZ106IEtQSUNvbmZpZ3VyYXRpb24gfSB7XG5cdFx0cmV0dXJuICh0aGlzLm9NYW5pZmVzdFNldHRpbmdzIGFzIExpc3RSZXBvcnRNYW5pZmVzdFNldHRpbmdzKS5rZXlQZXJmb3JtYW5jZUluZGljYXRvcnMgfHwge307XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBmaWx0ZXIgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGZpbHRlciBjb25maWd1cmF0aW9uIGZyb20gdGhlIG1hbmlmZXN0XG5cdCAqL1xuXHRnZXRGaWx0ZXJDb25maWd1cmF0aW9uKCk6IEZpbHRlck1hbmlmZXN0Q29uZmlndXJhdGlvbiB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0Q29udHJvbENvbmZpZ3VyYXRpb24oXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIpO1xuXHR9XG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGVudGl0eSBzZXRzIHRvIGJlIGRpc3BsYXllZC5cblx0ICpcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBlbnRpdHkgc2V0c1xuXHQgKi9cblx0aGFzTXVsdGlwbGVFbnRpdHlTZXRzKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHZpZXdDb25maWcgPSB0aGlzLmdldFZpZXdDb25maWd1cmF0aW9uKCkgfHwgeyBwYXRoczogW10gfTtcblx0XHRjb25zdCBtYW5pZmVzdEVudGl0eVNldCA9IHRoaXMub01hbmlmZXN0U2V0dGluZ3MuZW50aXR5U2V0O1xuXHRcdHJldHVybiAoXG5cdFx0XHR2aWV3Q29uZmlnLnBhdGhzLmZpbmQoKHBhdGg6IFZpZXdDb25maWd1cmF0aW9uKSA9PiB7XG5cdFx0XHRcdGlmICgocGF0aCBhcyBDdXN0b21WaWV3VGVtcGxhdGVDb25maWd1cmF0aW9uKT8udGVtcGxhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyhwYXRoIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uKSkge1xuXHRcdFx0XHRcdGNvbnN0IHsgcHJpbWFyeSwgc2Vjb25kYXJ5IH0gPSBwYXRoIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRwcmltYXJ5LnNvbWUoKHByaW1hcnlQYXRoKSA9PiBwcmltYXJ5UGF0aC5lbnRpdHlTZXQgJiYgcHJpbWFyeVBhdGguZW50aXR5U2V0ICE9PSBtYW5pZmVzdEVudGl0eVNldCkgfHxcblx0XHRcdFx0XHRcdHNlY29uZGFyeS5zb21lKChzZWNvbmRhcnlQYXRoKSA9PiBzZWNvbmRhcnlQYXRoLmVudGl0eVNldCAmJiBzZWNvbmRhcnlQYXRoLmVudGl0eVNldCAhPT0gbWFuaWZlc3RFbnRpdHlTZXQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwYXRoID0gcGF0aCBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0XHRcdFx0cmV0dXJuIHBhdGguZW50aXR5U2V0ICYmIHBhdGguZW50aXR5U2V0ICE9PSBtYW5pZmVzdEVudGl0eVNldDtcblx0XHRcdFx0fVxuXHRcdFx0fSkgIT09IHVuZGVmaW5lZFxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY29udGV4dCBwYXRoIGZvciB0aGUgdGVtcGxhdGUgaWYgaXQgaXMgc3BlY2lmaWVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRleHQgcGF0aCBmb3IgdGhlIHRlbXBsYXRlXG5cdCAqL1xuXHRnZXRDb250ZXh0UGF0aCgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLm9NYW5pZmVzdFNldHRpbmdzPy5jb250ZXh0UGF0aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhlcmUgYXJlIG11bHRpcGxlIHZpc3VhbGl6YXRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBmcm9tIHRoZSB2aWV3XG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgdmlzdWFsaXphdGlvbnNcblx0ICovXG5cdGhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMocGF0aD86IFZpZXdQYXRoQ29uZmlndXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdGlmICghcGF0aCkge1xuXHRcdFx0Y29uc3Qgdmlld0NvbmZpZyA9IHRoaXMuZ2V0Vmlld0NvbmZpZ3VyYXRpb24oKSB8fCB7IHBhdGhzOiBbXSB9O1xuXHRcdFx0cmV0dXJuIHZpZXdDb25maWcucGF0aHMuc29tZSgodmlld1BhdGgpID0+IHtcblx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHQodmlld1BhdGggYXMgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb24pLnByaW1hcnk/Lmxlbmd0aCA+IDAgJiZcblx0XHRcdFx0XHQodmlld1BhdGggYXMgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb24pLnNlY29uZGFyeT8ubGVuZ3RoID4gMFxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiAocGF0aCBhcyBDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbikucHJpbWFyeT8ubGVuZ3RoID4gMCAmJiAocGF0aCBhcyBDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbikuc2Vjb25kYXJ5Py5sZW5ndGggPiAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgZW50aXR5IHNldCBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGVudGl0eSBzZXQgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3Rcblx0ICovXG5cdGdldEVudGl0eVNldCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLm9NYW5pZmVzdFNldHRpbmdzLmVudGl0eVNldDtcblx0fVxuXG5cdC8vZW5kIHJlZ2lvbiBMUiBTcGVjaWZpY1xufVxuXG5leHBvcnQgZGVmYXVsdCBNYW5pZmVzdFdyYXBwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBd0JBLFNBQVNBLG9CQUFvQixDQUFtQ0MsR0FBa0IsRUFBRUMsUUFBaUIsRUFBRTtJQUN0RyxNQUFNQyxhQUFhLEdBQUdGLEdBQUcsYUFB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