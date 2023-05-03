/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/helpers/BindingToolkit", "../controls/Common/DataVisualization", "../controls/Common/KPI", "../helpers/ID", "../ManifestSettings"], function (Action, FilterBar, ConfigurableObject, BindingToolkit, DataVisualization, KPI, ID, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var getTableID = ID.getTableID;
  var getIconTabBarID = ID.getIconTabBarID;
  var getFilterVariantManagementID = ID.getFilterVariantManagementID;
  var getFilterBarID = ID.getFilterBarID;
  var getDynamicListReportID = ID.getDynamicListReportID;
  var getCustomTabID = ID.getCustomTabID;
  var getChartID = ID.getChartID;
  var getKPIDefinitions = KPI.getKPIDefinitions;
  var isSelectionPresentationCompliant = DataVisualization.isSelectionPresentationCompliant;
  var isPresentationCompliant = DataVisualization.isPresentationCompliant;
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var getSelectionPresentationVariant = DataVisualization.getSelectionPresentationVariant;
  var getDefaultPresentationVariant = DataVisualization.getDefaultPresentationVariant;
  var getDefaultLineItem = DataVisualization.getDefaultLineItem;
  var getDefaultChart = DataVisualization.getDefaultChart;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getSelectionFields = FilterBar.getSelectionFields;
  var getManifestFilterFields = FilterBar.getManifestFilterFields;
  var getFilterBarhideBasicSearch = FilterBar.getFilterBarhideBasicSearch;
  var getActionsFromManifest = Action.getActionsFromManifest;
  /**
   * Retrieves all list report tables.
   *
   * @param views The list report views configured in the manifest
   * @returns The list report table
   */
  function getTableVisualizations(views) {
    const tables = [];
    views.forEach(function (view) {
      if (!view.type) {
        const visualizations = view.secondaryVisualization ? view.secondaryVisualization.visualizations : view.presentation.visualizations;
        visualizations.forEach(function (visualization) {
          if (visualization.type === VisualizationType.Table) {
            tables.push(visualization);
          }
        });
      }
    });
    return tables;
  }
  function getChartVisualizations(views) {
    const charts = [];
    views.forEach(function (view) {
      if (!view.type) {
        const visualizations = view.primaryVisualization ? view.primaryVisualization.visualizations : view.presentation.visualizations;
        visualizations.forEach(function (visualization) {
          if (visualization.type === VisualizationType.Chart) {
            charts.push(visualization);
          }
        });
      }
    });
    return charts;
  }
  const getDefaultSemanticDates = function (filterFields) {
    const defaultSemanticDates = {};
    for (const filterField in filterFields) {
      var _filterFields$filterF, _filterFields$filterF2, _filterFields$filterF3;
      if ((_filterFields$filterF = filterFields[filterField]) !== null && _filterFields$filterF !== void 0 && (_filterFields$filterF2 = _filterFields$filterF.settings) !== null && _filterFields$filterF2 !== void 0 && (_filterFields$filterF3 = _filterFields$filterF2.defaultValues) !== null && _filterFields$filterF3 !== void 0 && _filterFields$filterF3.length) {
        var _filterFields$filterF4, _filterFields$filterF5;
        defaultSemanticDates[filterField] = (_filterFields$filterF4 = filterFields[filterField]) === null || _filterFields$filterF4 === void 0 ? void 0 : (_filterFields$filterF5 = _filterFields$filterF4.settings) === null || _filterFields$filterF5 === void 0 ? void 0 : _filterFields$filterF5.defaultValues;
      }
    }
    return defaultSemanticDates;
  };

  /**
   * Find a visualization annotation that can be used for rendering the list report.
   *
   * @param entityType The current EntityType
   * @param converterContext
   * @param bIsALP
   * @returns A compliant annotation for rendering the list report
   */
  function getCompliantVisualizationAnnotation(entityType, converterContext, bIsALP) {
    const annotationPath = converterContext.getManifestWrapper().getDefaultTemplateAnnotationPath();
    const selectionPresentationVariant = getSelectionPresentationVariant(entityType, annotationPath, converterContext);
    const sErrorForALP = "ALP flavor needs both chart and table to load the application";
    if (annotationPath && selectionPresentationVariant) {
      const presentationVariant = selectionPresentationVariant.PresentationVariant;
      if (!presentationVariant) {
        throw new Error("Presentation Variant is not configured in the SPV mentioned in the manifest");
      }
      const bPVComplaint = isPresentationCompliant(presentationVariant, bIsALP);
      if (!bPVComplaint) {
        if (bIsALP) {
          throw new Error(sErrorForALP);
        } else {
          return undefined;
        }
      }
      if (isSelectionPresentationCompliant(selectionPresentationVariant, bIsALP)) {
        return selectionPresentationVariant;
      }
    }
    if (selectionPresentationVariant) {
      if (isSelectionPresentationCompliant(selectionPresentationVariant, bIsALP)) {
        return selectionPresentationVariant;
      } else if (bIsALP) {
        throw new Error(sErrorForALP);
      }
    }
    const presentationVariant = getDefaultPresentationVariant(entityType);
    if (presentationVariant) {
      if (isPresentationCompliant(presentationVariant, bIsALP)) {
        return presentationVariant;
      } else if (bIsALP) {
        throw new Error(sErrorForALP);
      }
    }
    if (!bIsALP) {
      const defaultLineItem = getDefaultLineItem(entityType);
      if (defaultLineItem) {
        return defaultLineItem;
      }
    }
    return undefined;
  }
  const getView = function (viewConverterConfiguration) {
    let config = viewConverterConfiguration;
    if (config.converterContext) {
      var _presentation, _presentation$visuali;
      let converterContext = config.converterContext;
      config = config;
      const isMultipleViewConfiguration = function (currentConfig) {
        return currentConfig.key !== undefined;
      };
      let presentation = getDataVisualizationConfiguration(config.annotation ? converterContext.getRelativeAnnotationPath(config.annotation.fullyQualifiedName, converterContext.getEntityType()) : "", true, converterContext, config, undefined, undefined, isMultipleViewConfiguration(config));
      let tableControlId = "";
      let chartControlId = "";
      let title = "";
      let selectionVariantPath = "";
      const createVisualization = function (currentPresentation, isPrimary) {
        let defaultVisualization;
        for (const visualization of currentPresentation.visualizations) {
          if (isPrimary && visualization.type === VisualizationType.Chart) {
            defaultVisualization = visualization;
            break;
          }
          if (!isPrimary && visualization.type === VisualizationType.Table) {
            defaultVisualization = visualization;
            break;
          }
        }
        const presentationCreated = Object.assign({}, currentPresentation);
        if (defaultVisualization) {
          presentationCreated.visualizations = [defaultVisualization];
        } else {
          throw new Error((isPrimary ? "Primary" : "Secondary") + " visualisation needs valid " + (isPrimary ? "chart" : "table"));
        }
        return presentationCreated;
      };
      const getPresentation = function (item, isPrimary) {
        const resolvedTarget = converterContext.getEntityTypeAnnotation(item.annotationPath);
        const targetAnnotation = resolvedTarget.annotation;
        converterContext = resolvedTarget.converterContext;
        const annotation = targetAnnotation;
        if (annotation || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
          presentation = getDataVisualizationConfiguration(annotation ? converterContext.getRelativeAnnotationPath(annotation.fullyQualifiedName, converterContext.getEntityType()) : "", true, converterContext, config);
          return presentation;
        } else {
          const sError = "Annotation Path for the " + (isPrimary ? "primary" : "secondary") + " visualisation mentioned in the manifest is not found";
          throw new Error(sError);
        }
      };
      const createAlpView = function (presentations, defaultPath) {
        var _primaryVisualization, _secondaryVisualizati, _secondaryVisualizati2;
        const primaryVisualization = createVisualization(presentations[0], true);
        chartControlId = primaryVisualization === null || primaryVisualization === void 0 ? void 0 : (_primaryVisualization = primaryVisualization.visualizations[0]) === null || _primaryVisualization === void 0 ? void 0 : _primaryVisualization.id;
        const secondaryVisualization = createVisualization(presentations[1] ? presentations[1] : presentations[0], false);
        tableControlId = secondaryVisualization === null || secondaryVisualization === void 0 ? void 0 : (_secondaryVisualizati = secondaryVisualization.visualizations[0]) === null || _secondaryVisualizati === void 0 ? void 0 : (_secondaryVisualizati2 = _secondaryVisualizati.annotation) === null || _secondaryVisualizati2 === void 0 ? void 0 : _secondaryVisualizati2.id;
        if (primaryVisualization && secondaryVisualization) {
          config = config;
          const visible = config.visible;
          const view = {
            primaryVisualization,
            secondaryVisualization,
            tableControlId,
            chartControlId,
            defaultPath,
            visible
          };
          return view;
        }
      };
      if (((_presentation = presentation) === null || _presentation === void 0 ? void 0 : (_presentation$visuali = _presentation.visualizations) === null || _presentation$visuali === void 0 ? void 0 : _presentation$visuali.length) === 2 && converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        const view = createAlpView([presentation], "both");
        if (view) {
          return view;
        }
      } else if (converterContext.getManifestWrapper().hasMultipleVisualizations(config) || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        const {
          primary,
          secondary
        } = config;
        if (primary && primary.length && secondary && secondary.length) {
          const view = createAlpView([getPresentation(primary[0], true), getPresentation(secondary[0], false)], config.defaultPath);
          if (view) {
            return view;
          }
        } else {
          throw new Error("SecondaryItems in the Views is not present");
        }
      } else if (isMultipleViewConfiguration(config)) {
        // key exists only on multi tables mode
        const resolvedTarget = converterContext.getEntityTypeAnnotation(config.annotationPath);
        const viewAnnotation = resolvedTarget.annotation;
        converterContext = resolvedTarget.converterContext;
        title = compileExpression(getExpressionFromAnnotation(viewAnnotation.Text));
        // Need to loop on table into views since multi table mode get specific configuration (hidden filters or Table Id)
        presentation.visualizations.forEach((visualizationDefinition, index) => {
          switch (visualizationDefinition.type) {
            case VisualizationType.Table:
              const tableVisualization = presentation.visualizations[index];
              const filters = tableVisualization.control.filters || {};
              filters.hiddenFilters = filters.hiddenFilters || {
                paths: []
              };
              if (!config.keepPreviousPersonalization) {
                // Need to override Table Id to match with Tab Key (currently only table is managed in multiple view mode)
                tableVisualization.annotation.id = getTableID(config.key || "", "LineItem");
              }
              config = config;
              if (config && config.annotation && config.annotation.term === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
                selectionVariantPath = `@${config.annotation.SelectionVariant.fullyQualifiedName.split("@")[1]}`;
              } else {
                selectionVariantPath = config.annotationPath;
              }
              //Provide Selection Variant to hiddenFilters in order to set the SV filters to the table.
              //MDC Table overrides binding Filter and from SAP FE the only method where we are able to add
              //additional filter is 'rebindTable' into Table delegate.
              //To avoid implementing specific LR feature to SAP FE Macro Table, the filter(s) related to the Tab (multi table mode)
              //can be passed to macro table via parameter/context named filters and key hiddenFilters.
              filters.hiddenFilters.paths.push({
                annotationPath: selectionVariantPath
              });
              tableVisualization.control.filters = filters;
              break;
            case VisualizationType.Chart:
              const chartVisualization = presentation.visualizations[index];
              chartVisualization.id = getChartID(config.key || "", "Chart");
              chartVisualization.multiViews = true;
              break;
            default:
              break;
          }
        });
      }
      presentation.visualizations.forEach(visualizationDefinition => {
        if (visualizationDefinition.type === VisualizationType.Table) {
          tableControlId = visualizationDefinition.annotation.id;
        } else if (visualizationDefinition.type === VisualizationType.Chart) {
          chartControlId = visualizationDefinition.id;
        }
      });
      config = config;
      const visible = config.visible;
      return {
        presentation,
        tableControlId,
        chartControlId,
        title,
        selectionVariantPath,
        visible
      };
    } else {
      config = config;
      const title = config.label,
        fragment = config.template,
        type = config.type,
        customTabId = getCustomTabID(config.key || ""),
        visible = config.visible;
      return {
        title,
        fragment,
        type,
        customTabId,
        visible
      };
    }
  };
  const getViews = function (converterContext, settingsViews) {
    let viewConverterConfigs = [];
    if (settingsViews) {
      settingsViews.paths.forEach(path => {
        if (converterContext.getManifestWrapper().hasMultipleVisualizations(path)) {
          if (settingsViews.paths.length > 1) {
            throw new Error("ALP flavor cannot have multiple views");
          } else {
            path = path;
            viewConverterConfigs.push({
              converterContext: converterContext,
              primary: path.primary,
              secondary: path.secondary,
              defaultPath: path.defaultPath
            });
          }
        } else if (path.template) {
          path = path;
          viewConverterConfigs.push({
            key: path.key,
            label: path.label,
            template: path.template,
            type: "Custom",
            visible: path.visible
          });
        } else {
          path = path;
          const viewConverterContext = converterContext.getConverterContextFor(path.contextPath || path.entitySet && `/${path.entitySet}` || converterContext.getContextPath()),
            entityType = viewConverterContext.getEntityType();
          if (entityType && viewConverterContext) {
            let annotation;
            const resolvedTarget = viewConverterContext.getEntityTypeAnnotation(path.annotationPath);
            const targetAnnotation = resolvedTarget.annotation;
            if (targetAnnotation) {
              annotation = targetAnnotation.term === "com.sap.vocabularies.UI.v1.SelectionVariant" ? getCompliantVisualizationAnnotation(entityType, viewConverterContext, false) : targetAnnotation;
              viewConverterConfigs.push({
                converterContext: viewConverterContext,
                annotation,
                annotationPath: path.annotationPath,
                keepPreviousPersonalization: path.keepPreviousPersonalization,
                key: path.key,
                visible: path.visible
              });
            }
          } else {
            // TODO Diagnostics message
          }
        }
      });
    } else {
      const entityType = converterContext.getEntityType();
      if (converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        viewConverterConfigs = getAlpViewConfig(converterContext, viewConverterConfigs);
      } else {
        viewConverterConfigs.push({
          annotation: getCompliantVisualizationAnnotation(entityType, converterContext, false),
          converterContext: converterContext
        });
      }
    }
    return viewConverterConfigs.map(viewConverterConfig => {
      return getView(viewConverterConfig);
    });
  };
  const getMultiViewsControl = function (converterContext, views) {
    const manifestWrapper = converterContext.getManifestWrapper();
    const viewsDefinition = manifestWrapper.getViewConfiguration();
    if (views.length > 1 && !hasMultiVisualizations(converterContext)) {
      return {
        showTabCounts: viewsDefinition ? (viewsDefinition === null || viewsDefinition === void 0 ? void 0 : viewsDefinition.showCounts) || manifestWrapper.hasMultipleEntitySets() : undefined,
        // with multi EntitySets, tab counts are displayed by default
        id: getIconTabBarID()
      };
    }
    return undefined;
  };
  function getAlpViewConfig(converterContext, viewConfigs) {
    const entityType = converterContext.getEntityType();
    const annotation = getCompliantVisualizationAnnotation(entityType, converterContext, true);
    let chart, table;
    if (annotation) {
      viewConfigs.push({
        annotation: annotation,
        converterContext
      });
    } else {
      chart = getDefaultChart(entityType);
      table = getDefaultLineItem(entityType);
      if (chart && table) {
        const primary = [{
          annotationPath: "@" + chart.term
        }];
        const secondary = [{
          annotationPath: "@" + table.term
        }];
        viewConfigs.push({
          converterContext: converterContext,
          primary: primary,
          secondary: secondary,
          defaultPath: "both"
        });
      } else {
        throw new Error("ALP flavor needs both chart and table to load the application");
      }
    }
    return viewConfigs;
  }
  function hasMultiVisualizations(converterContext) {
    return converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
  }
  const getHeaderActions = function (converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    return insertCustomElements([], getActionsFromManifest(manifestWrapper.getHeaderActions(), converterContext).actions);
  };
  _exports.getHeaderActions = getHeaderActions;
  const checkChartFilterBarId = function (views, filterBarId) {
    views.forEach(view => {
      if (!view.type) {
        const presentation = view.presentation;
        presentation.visualizations.forEach(visualizationDefinition => {
          if (visualizationDefinition.type === VisualizationType.Chart && visualizationDefinition.filterId !== filterBarId) {
            visualizationDefinition.filterId = filterBarId;
          }
        });
      }
    });
  };

  /**
   * Creates the ListReportDefinition for multiple entity sets (multiple table mode).
   *
   * @param converterContext The converter context
   * @returns The list report definition based on annotation + manifest
   */
  _exports.checkChartFilterBarId = checkChartFilterBarId;
  const convertPage = function (converterContext) {
    const entityType = converterContext.getEntityType();
    const sContextPath = converterContext.getContextPath();
    if (!sContextPath) {
      // If we don't have an entitySet at this point we have an issue I'd say
      throw new Error("An EntitySet is required to be able to display a ListReport, please adjust your `entitySet` property to point to one.");
    }
    const manifestWrapper = converterContext.getManifestWrapper();
    const viewsDefinition = manifestWrapper.getViewConfiguration();
    const hasMultipleEntitySets = manifestWrapper.hasMultipleEntitySets();
    const views = getViews(converterContext, viewsDefinition);
    const lrTableVisualizations = getTableVisualizations(views);
    const lrChartVisualizations = getChartVisualizations(views);
    const showPinnableToggle = lrTableVisualizations.some(table => table.control.type === "ResponsiveTable");
    let singleTableId = "";
    let singleChartId = "";
    const dynamicListReportId = getDynamicListReportID();
    const filterBarId = getFilterBarID(sContextPath);
    const filterVariantManagementID = getFilterVariantManagementID(filterBarId);
    const fbConfig = manifestWrapper.getFilterConfiguration();
    const filterInitialLayout = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.initialLayout) !== undefined ? fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.initialLayout.toLowerCase() : "compact";
    const filterLayout = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.layout) !== undefined ? fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.layout.toLowerCase() : "compact";
    const useSemanticDateRange = fbConfig.useSemanticDateRange !== undefined ? fbConfig.useSemanticDateRange : true;
    const showClearButton = fbConfig.showClearButton !== undefined ? fbConfig.showClearButton : false;
    const oConfig = getContentAreaId(converterContext, views);
    if (oConfig) {
      singleChartId = oConfig.chartId;
      singleTableId = oConfig.tableId;
    }
    const useHiddenFilterBar = manifestWrapper.useHiddenFilterBar();
    // Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
    // Until then, hiding filter bar is now allowed if a chart is being used on LR.
    const hideFilterBar = (manifestWrapper.isFilterBarHidden() || useHiddenFilterBar) && singleChartId === "";
    const lrFilterProperties = getSelectionFields(converterContext, lrTableVisualizations);
    const selectionFields = lrFilterProperties.selectionFields;
    const propertyInfoFields = lrFilterProperties.sPropertyInfo;
    const hideBasicSearch = getFilterBarhideBasicSearch(lrTableVisualizations, lrChartVisualizations, converterContext);
    const multiViewControl = getMultiViewsControl(converterContext, views);
    const selectionVariant = multiViewControl ? undefined : getSelectionVariant(entityType, converterContext);
    const defaultSemanticDates = useSemanticDateRange ? getDefaultSemanticDates(getManifestFilterFields(entityType, converterContext)) : {};

    // Sort header actions according to position attributes in manifest
    const headerActions = getHeaderActions(converterContext);
    if (hasMultipleEntitySets) {
      checkChartFilterBarId(views, filterBarId);
    }
    const visualizationIds = lrTableVisualizations.map(visualization => {
      return visualization.annotation.id;
    }).concat(lrChartVisualizations.map(visualization => {
      return visualization.id;
    }));
    const targetControlIds = [...(hideFilterBar && !useHiddenFilterBar ? [] : [filterBarId]), ...(manifestWrapper.getVariantManagement() !== VariantManagementType.Control ? visualizationIds : []), ...(multiViewControl ? [multiViewControl.id] : [])];
    const stickySubheaderProvider = multiViewControl && manifestWrapper.getStickyMultiTabHeaderConfiguration() ? multiViewControl.id : undefined;
    return {
      mainEntitySet: sContextPath,
      mainEntityType: `${sContextPath}/`,
      multiViewsControl: multiViewControl,
      stickySubheaderProvider,
      singleTableId,
      singleChartId,
      dynamicListReportId,
      headerActions,
      showPinnableToggle: showPinnableToggle,
      filterBar: {
        propertyInfo: propertyInfoFields,
        selectionFields,
        hideBasicSearch,
        showClearButton
      },
      views: views,
      filterBarId: hideFilterBar && !useHiddenFilterBar ? "" : filterBarId,
      filterConditions: {
        selectionVariant: selectionVariant,
        defaultSemanticDates: defaultSemanticDates
      },
      variantManagement: {
        id: filterVariantManagementID,
        targetControlIds: targetControlIds.join(",")
      },
      hasMultiVisualizations: hasMultiVisualizations(converterContext),
      templateType: manifestWrapper.getTemplateType(),
      useSemanticDateRange,
      filterInitialLayout,
      filterLayout,
      kpiDefinitions: getKPIDefinitions(converterContext),
      hideFilterBar,
      useHiddenFilterBar
    };
  };
  _exports.convertPage = convertPage;
  function getContentAreaId(converterContext, views) {
    let singleTableId = "",
      singleChartId = "";
    if (converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
      for (let view of views) {
        view = view;
        if (view.chartControlId && view.tableControlId) {
          singleChartId = view.chartControlId;
          singleTableId = view.tableControlId;
          break;
        }
      }
    } else {
      for (let view of views) {
        view = view;
        if (!singleTableId && view.tableControlId) {
          singleTableId = view.tableControlId || "";
        }
        if (!singleChartId && view.chartControlId) {
          singleChartId = view.chartControlId || "";
        }
        if (singleChartId && singleTableId) {
          break;
        }
      }
    }
    if (singleTableId || singleChartId) {
      return {
        chartId: singleChartId,
        tableId: singleTableId
      };
    }
    return undefined;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRUYWJsZVZpc3VhbGl6YXRpb25zIiwidmlld3MiLCJ0YWJsZXMiLCJmb3JFYWNoIiwidmlldyIsInR5cGUiLCJ2aXN1YWxpemF0aW9ucyIsInNlY29uZGFyeVZpc3VhbGl6YXRpb24iLCJwcmVzZW50YXRpb24iLCJ2aXN1YWxpemF0aW9uIiwiVmlzdWFsaXphdGlvblR5cGUiLCJUYWJsZSIsInB1c2giLCJnZXRDaGFydFZpc3VhbGl6YXRpb25zIiwiY2hhcnRzIiwicHJpbWFyeVZpc3VhbGl6YXRpb24iLCJDaGFydCIsImdldERlZmF1bHRTZW1hbnRpY0RhdGVzIiwiZmlsdGVyRmllbGRzIiwiZGVmYXVsdFNlbWFudGljRGF0ZXMiLCJmaWx0ZXJGaWVsZCIsInNldHRpbmdzIiwiZGVmYXVsdFZhbHVlcyIsImxlbmd0aCIsImdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uIiwiZW50aXR5VHlwZSIsImNvbnZlcnRlckNvbnRleHQiLCJiSXNBTFAiLCJhbm5vdGF0aW9uUGF0aCIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldERlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoIiwic2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCIsImdldFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQiLCJzRXJyb3JGb3JBTFAiLCJwcmVzZW50YXRpb25WYXJpYW50IiwiUHJlc2VudGF0aW9uVmFyaWFudCIsIkVycm9yIiwiYlBWQ29tcGxhaW50IiwiaXNQcmVzZW50YXRpb25Db21wbGlhbnQiLCJ1bmRlZmluZWQiLCJpc1NlbGVjdGlvblByZXNlbnRhdGlvbkNvbXBsaWFudCIsImdldERlZmF1bHRQcmVzZW50YXRpb25WYXJpYW50IiwiZGVmYXVsdExpbmVJdGVtIiwiZ2V0RGVmYXVsdExpbmVJdGVtIiwiZ2V0VmlldyIsInZpZXdDb252ZXJ0ZXJDb25maWd1cmF0aW9uIiwiY29uZmlnIiwiaXNNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uIiwiY3VycmVudENvbmZpZyIsImtleSIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsImFubm90YXRpb24iLCJnZXRSZWxhdGl2ZUFubm90YXRpb25QYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiZ2V0RW50aXR5VHlwZSIsInRhYmxlQ29udHJvbElkIiwiY2hhcnRDb250cm9sSWQiLCJ0aXRsZSIsInNlbGVjdGlvblZhcmlhbnRQYXRoIiwiY3JlYXRlVmlzdWFsaXphdGlvbiIsImN1cnJlbnRQcmVzZW50YXRpb24iLCJpc1ByaW1hcnkiLCJkZWZhdWx0VmlzdWFsaXphdGlvbiIsInByZXNlbnRhdGlvbkNyZWF0ZWQiLCJPYmplY3QiLCJhc3NpZ24iLCJnZXRQcmVzZW50YXRpb24iLCJpdGVtIiwicmVzb2x2ZWRUYXJnZXQiLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsInRhcmdldEFubm90YXRpb24iLCJnZXRUZW1wbGF0ZVR5cGUiLCJUZW1wbGF0ZVR5cGUiLCJBbmFseXRpY2FsTGlzdFBhZ2UiLCJzRXJyb3IiLCJjcmVhdGVBbHBWaWV3IiwicHJlc2VudGF0aW9ucyIsImRlZmF1bHRQYXRoIiwiaWQiLCJ2aXNpYmxlIiwiaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyIsInByaW1hcnkiLCJzZWNvbmRhcnkiLCJ2aWV3QW5ub3RhdGlvbiIsImNvbXBpbGVFeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiVGV4dCIsInZpc3VhbGl6YXRpb25EZWZpbml0aW9uIiwiaW5kZXgiLCJ0YWJsZVZpc3VhbGl6YXRpb24iLCJmaWx0ZXJzIiwiY29udHJvbCIsImhpZGRlbkZpbHRlcnMiLCJwYXRocyIsImtlZXBQcmV2aW91c1BlcnNvbmFsaXphdGlvbiIsImdldFRhYmxlSUQiLCJ0ZXJtIiwiU2VsZWN0aW9uVmFyaWFudCIsInNwbGl0IiwiY2hhcnRWaXN1YWxpemF0aW9uIiwiZ2V0Q2hhcnRJRCIsIm11bHRpVmlld3MiLCJsYWJlbCIsImZyYWdtZW50IiwidGVtcGxhdGUiLCJjdXN0b21UYWJJZCIsImdldEN1c3RvbVRhYklEIiwiZ2V0Vmlld3MiLCJzZXR0aW5nc1ZpZXdzIiwidmlld0NvbnZlcnRlckNvbmZpZ3MiLCJwYXRoIiwidmlld0NvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yIiwiY29udGV4dFBhdGgiLCJlbnRpdHlTZXQiLCJnZXRDb250ZXh0UGF0aCIsImdldEFscFZpZXdDb25maWciLCJtYXAiLCJ2aWV3Q29udmVydGVyQ29uZmlnIiwiZ2V0TXVsdGlWaWV3c0NvbnRyb2wiLCJtYW5pZmVzdFdyYXBwZXIiLCJ2aWV3c0RlZmluaXRpb24iLCJnZXRWaWV3Q29uZmlndXJhdGlvbiIsImhhc011bHRpVmlzdWFsaXphdGlvbnMiLCJzaG93VGFiQ291bnRzIiwic2hvd0NvdW50cyIsImhhc011bHRpcGxlRW50aXR5U2V0cyIsImdldEljb25UYWJCYXJJRCIsInZpZXdDb25maWdzIiwiY2hhcnQiLCJ0YWJsZSIsImdldERlZmF1bHRDaGFydCIsImdldEhlYWRlckFjdGlvbnMiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJhY3Rpb25zIiwiY2hlY2tDaGFydEZpbHRlckJhcklkIiwiZmlsdGVyQmFySWQiLCJmaWx0ZXJJZCIsImNvbnZlcnRQYWdlIiwic0NvbnRleHRQYXRoIiwibHJUYWJsZVZpc3VhbGl6YXRpb25zIiwibHJDaGFydFZpc3VhbGl6YXRpb25zIiwic2hvd1Bpbm5hYmxlVG9nZ2xlIiwic29tZSIsInNpbmdsZVRhYmxlSWQiLCJzaW5nbGVDaGFydElkIiwiZHluYW1pY0xpc3RSZXBvcnRJZCIsImdldER5bmFtaWNMaXN0UmVwb3J0SUQiLCJnZXRGaWx0ZXJCYXJJRCIsImZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQiLCJnZXRGaWx0ZXJWYXJpYW50TWFuYWdlbWVudElEIiwiZmJDb25maWciLCJnZXRGaWx0ZXJDb25maWd1cmF0aW9uIiwiZmlsdGVySW5pdGlhbExheW91dCIsImluaXRpYWxMYXlvdXQiLCJ0b0xvd2VyQ2FzZSIsImZpbHRlckxheW91dCIsImxheW91dCIsInVzZVNlbWFudGljRGF0ZVJhbmdlIiwic2hvd0NsZWFyQnV0dG9uIiwib0NvbmZpZyIsImdldENvbnRlbnRBcmVhSWQiLCJjaGFydElkIiwidGFibGVJZCIsInVzZUhpZGRlbkZpbHRlckJhciIsImhpZGVGaWx0ZXJCYXIiLCJpc0ZpbHRlckJhckhpZGRlbiIsImxyRmlsdGVyUHJvcGVydGllcyIsImdldFNlbGVjdGlvbkZpZWxkcyIsInNlbGVjdGlvbkZpZWxkcyIsInByb3BlcnR5SW5mb0ZpZWxkcyIsInNQcm9wZXJ0eUluZm8iLCJoaWRlQmFzaWNTZWFyY2giLCJnZXRGaWx0ZXJCYXJoaWRlQmFzaWNTZWFyY2giLCJtdWx0aVZpZXdDb250cm9sIiwic2VsZWN0aW9uVmFyaWFudCIsImdldFNlbGVjdGlvblZhcmlhbnQiLCJnZXRNYW5pZmVzdEZpbHRlckZpZWxkcyIsImhlYWRlckFjdGlvbnMiLCJ2aXN1YWxpemF0aW9uSWRzIiwiY29uY2F0IiwidGFyZ2V0Q29udHJvbElkcyIsImdldFZhcmlhbnRNYW5hZ2VtZW50IiwiVmFyaWFudE1hbmFnZW1lbnRUeXBlIiwiQ29udHJvbCIsInN0aWNreVN1YmhlYWRlclByb3ZpZGVyIiwiZ2V0U3RpY2t5TXVsdGlUYWJIZWFkZXJDb25maWd1cmF0aW9uIiwibWFpbkVudGl0eVNldCIsIm1haW5FbnRpdHlUeXBlIiwibXVsdGlWaWV3c0NvbnRyb2wiLCJmaWx0ZXJCYXIiLCJwcm9wZXJ0eUluZm8iLCJmaWx0ZXJDb25kaXRpb25zIiwidmFyaWFudE1hbmFnZW1lbnQiLCJqb2luIiwidGVtcGxhdGVUeXBlIiwia3BpRGVmaW5pdGlvbnMiLCJnZXRLUElEZWZpbml0aW9ucyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTGlzdFJlcG9ydENvbnZlcnRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVudGl0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHtcblx0TGluZUl0ZW0sXG5cdFByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFNlbGVjdGlvblZhcmlhbnRcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgdHlwZSB7IEJhc2VBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBDaGFydFZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQ2hhcnRcIjtcbmltcG9ydCB0eXBlIHsgVGFibGVWaXN1YWxpemF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSB7IEN1c3RvbUVsZW1lbnRGaWx0ZXJGaWVsZCwgRmlsdGVyRmllbGQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L0ZpbHRlckJhclwiO1xuaW1wb3J0IHtcblx0Z2V0RmlsdGVyQmFyaGlkZUJhc2ljU2VhcmNoLFxuXHRnZXRNYW5pZmVzdEZpbHRlckZpZWxkcyxcblx0Z2V0U2VsZWN0aW9uRmllbGRzXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvRmlsdGVyQmFyXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlndXJhYmxlT2JqZWN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhVmlzdWFsaXphdGlvbkFubm90YXRpb25zLCBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb24gfSBmcm9tIFwiLi4vY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQge1xuXHRnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24sXG5cdGdldERlZmF1bHRDaGFydCxcblx0Z2V0RGVmYXVsdExpbmVJdGVtLFxuXHRnZXREZWZhdWx0UHJlc2VudGF0aW9uVmFyaWFudCxcblx0Z2V0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCxcblx0Z2V0U2VsZWN0aW9uVmFyaWFudCxcblx0aXNQcmVzZW50YXRpb25Db21wbGlhbnQsXG5cdGlzU2VsZWN0aW9uUHJlc2VudGF0aW9uQ29tcGxpYW50XG59IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB0eXBlIHsgS1BJRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vS1BJXCI7XG5pbXBvcnQgeyBnZXRLUElEZWZpbml0aW9ucyB9IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vS1BJXCI7XG5pbXBvcnQge1xuXHRnZXRDaGFydElELFxuXHRnZXRDdXN0b21UYWJJRCxcblx0Z2V0RHluYW1pY0xpc3RSZXBvcnRJRCxcblx0Z2V0RmlsdGVyQmFySUQsXG5cdGdldEZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQsXG5cdGdldEljb25UYWJCYXJJRCxcblx0Z2V0VGFibGVJRFxufSBmcm9tIFwiLi4vaGVscGVycy9JRFwiO1xuaW1wb3J0IHR5cGUge1xuXHRDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0Q3VzdG9tVmlld1RlbXBsYXRlQ29uZmlndXJhdGlvbixcblx0TXVsdGlwbGVWaWV3c0NvbmZpZ3VyYXRpb24sXG5cdFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0Vmlld1BhdGhDb25maWd1cmF0aW9uXG59IGZyb20gXCIuLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZVR5cGUsIFZhcmlhbnRNYW5hZ2VtZW50VHlwZSwgVmlzdWFsaXphdGlvblR5cGUgfSBmcm9tIFwiLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuXG50eXBlIFZpZXdBbm5vdGF0aW9ucyA9IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgfCBTZWxlY3Rpb25WYXJpYW50O1xudHlwZSBWYXJpYW50TWFuYWdlbWVudERlZmluaXRpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHRhcmdldENvbnRyb2xJZHM6IHN0cmluZztcbn07XG5cbnR5cGUgTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiA9IFZpZXdQYXRoQ29uZmlndXJhdGlvbiAmIHtcblx0YW5ub3RhdGlvbj86IERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG59O1xuXG50eXBlIFNpbmdsZVZpZXdDb25maWd1cmF0aW9uID0ge1xuXHRhbm5vdGF0aW9uPzogRGF0YVZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucztcbn07XG5cbnR5cGUgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb24gPSBDdXN0b21WaWV3VGVtcGxhdGVDb25maWd1cmF0aW9uICYge1xuXHR0eXBlOiBzdHJpbmc7XG59O1xuXG50eXBlIFZpZXdDb25maWd1cmF0aW9uID0gTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiB8IFNpbmdsZVZpZXdDb25maWd1cmF0aW9uIHwgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb247XG50eXBlIFZpZXdBbm5vdGF0aW9uQ29uZmlndXJhdGlvbiA9IE11bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24gfCBTaW5nbGVWaWV3Q29uZmlndXJhdGlvbjtcblxudHlwZSBWaWV3Q29udmVydGVyU2V0dGluZ3MgPSBWaWV3Q29uZmlndXJhdGlvbiAmIHtcblx0Y29udmVydGVyQ29udGV4dD86IENvbnZlcnRlckNvbnRleHQ7XG59O1xuXG50eXBlIERlZmF1bHRTZW1hbnRpY0RhdGUgPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdG9wZXJhdG9yOiBzdHJpbmc7XG59O1xuXG50eXBlIE11bHRpVmlld3NDb250cm9sQ29uZmlndXJhdGlvbiA9IHtcblx0aWQ6IHN0cmluZztcblx0c2hvd1RhYkNvdW50cz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBMaXN0UmVwb3J0RGVmaW5pdGlvbiA9IHtcblx0bWFpbkVudGl0eVNldDogc3RyaW5nO1xuXHRtYWluRW50aXR5VHlwZTogc3RyaW5nOyAvLyBlbnRpdHlUeXBlPiBhdCB0aGUgc3RhcnQgb2YgTFIgdGVtcGxhdGluZ1xuXHRzaW5nbGVUYWJsZUlkPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggc2luZ2xlIFRhYmxlIG1vZGVcblx0c2luZ2xlQ2hhcnRJZD86IHN0cmluZzsgLy8gb25seSB3aXRoIHNpbmdsZSBUYWJsZSBtb2RlXG5cdGR5bmFtaWNMaXN0UmVwb3J0SWQ6IHN0cmluZztcblx0c3RpY2t5U3ViaGVhZGVyUHJvdmlkZXI/OiBzdHJpbmc7XG5cdG11bHRpVmlld3NDb250cm9sPzogTXVsdGlWaWV3c0NvbnRyb2xDb25maWd1cmF0aW9uOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRoZWFkZXJBY3Rpb25zOiBCYXNlQWN0aW9uW107XG5cdHNob3dQaW5uYWJsZVRvZ2dsZT86IGJvb2xlYW47XG5cdGZpbHRlckJhcjoge1xuXHRcdHByb3BlcnR5SW5mbzogYW55O1xuXHRcdHNlbGVjdGlvbkZpZWxkczogRmlsdGVyRmllbGRbXTtcblx0XHRoaWRlQmFzaWNTZWFyY2g6IGJvb2xlYW47XG5cdFx0c2hvd0NsZWFyQnV0dG9uPzogYm9vbGVhbjtcblx0fTtcblx0dmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdO1xuXHRmaWx0ZXJDb25kaXRpb25zOiB7XG5cdFx0c2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCB8IHVuZGVmaW5lZDtcblx0XHRkZWZhdWx0U2VtYW50aWNEYXRlczogUmVjb3JkPHN0cmluZywgRGVmYXVsdFNlbWFudGljRGF0ZT4gfCB7fTtcblx0fTtcblx0ZmlsdGVyQmFySWQ6IHN0cmluZztcblx0dmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50RGVmaW5pdGlvbjtcblx0aGFzTXVsdGlWaXN1YWxpemF0aW9uczogYm9vbGVhbjtcblx0dGVtcGxhdGVUeXBlOiBUZW1wbGF0ZVR5cGU7XG5cdHVzZVNlbWFudGljRGF0ZVJhbmdlPzogYm9vbGVhbjtcblx0ZmlsdGVySW5pdGlhbExheW91dD86IHN0cmluZztcblx0ZmlsdGVyTGF5b3V0Pzogc3RyaW5nO1xuXHRrcGlEZWZpbml0aW9uczogS1BJRGVmaW5pdGlvbltdO1xuXHRoaWRlRmlsdGVyQmFyOiBib29sZWFuO1xuXHR1c2VIaWRkZW5GaWx0ZXJCYXI6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb24gPSBTaW5nbGVWaWV3RGVmaW5pdGlvbiB8IEN1c3RvbVZpZXdEZWZpbml0aW9uIHwgQ29tYmluZWRWaWV3RGVmaW5pdGlvbjtcblxuZXhwb3J0IHR5cGUgQ29tYmluZWRWaWV3RGVmaW5pdGlvbiA9IHtcblx0c2VsZWN0aW9uVmFyaWFudFBhdGg/OiBzdHJpbmc7IC8vIG9ubHkgd2l0aCBvbiBtdWx0aSBUYWJsZSBtb2RlXG5cdHRpdGxlPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRwcmltYXJ5VmlzdWFsaXphdGlvbjogRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uO1xuXHRzZWNvbmRhcnlWaXN1YWxpemF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb247XG5cdHRhYmxlQ29udHJvbElkOiBzdHJpbmc7XG5cdGNoYXJ0Q29udHJvbElkOiBzdHJpbmc7XG5cdGRlZmF1bHRQYXRoPzogc3RyaW5nO1xuXHR2aXNpYmxlPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgQ3VzdG9tVmlld0RlZmluaXRpb24gPSB7XG5cdHRpdGxlPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRmcmFnbWVudDogc3RyaW5nO1xuXHR0eXBlOiBzdHJpbmc7XG5cdGN1c3RvbVRhYklkOiBzdHJpbmc7XG5cdHZpc2libGU/OiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgU2luZ2xlVmlld0RlZmluaXRpb24gPSBTaW5nbGVUYWJsZVZpZXdEZWZpbml0aW9uIHwgU2luZ2xlQ2hhcnRWaWV3RGVmaW5pdGlvbjtcblxuZXhwb3J0IHR5cGUgQmFzZVNpbmdsZVZpZXdEZWZpbml0aW9uID0ge1xuXHRzZWxlY3Rpb25WYXJpYW50UGF0aD86IHN0cmluZzsgLy8gb25seSB3aXRoIG9uIG11bHRpIFRhYmxlIG1vZGVcblx0dGl0bGU/OiBzdHJpbmc7IC8vIG9ubHkgd2l0aCBtdWx0aSBUYWJsZSBtb2RlXG5cdHByZXNlbnRhdGlvbjogRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgU2luZ2xlVGFibGVWaWV3RGVmaW5pdGlvbiA9IEJhc2VTaW5nbGVWaWV3RGVmaW5pdGlvbiAmIHtcblx0dGFibGVDb250cm9sSWQ/OiBzdHJpbmc7XG5cdHZpc2libGU/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBTaW5nbGVDaGFydFZpZXdEZWZpbml0aW9uID0gQmFzZVNpbmdsZVZpZXdEZWZpbml0aW9uICYge1xuXHRjaGFydENvbnRyb2xJZD86IHN0cmluZztcblx0dmlzaWJsZT86IHN0cmluZztcbn07XG5cbnR5cGUgQ29udGVudEFyZWFJRCA9IHtcblx0Y2hhcnRJZDogc3RyaW5nO1xuXHR0YWJsZUlkOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyBhbGwgbGlzdCByZXBvcnQgdGFibGVzLlxuICpcbiAqIEBwYXJhbSB2aWV3cyBUaGUgbGlzdCByZXBvcnQgdmlld3MgY29uZmlndXJlZCBpbiB0aGUgbWFuaWZlc3RcbiAqIEByZXR1cm5zIFRoZSBsaXN0IHJlcG9ydCB0YWJsZVxuICovXG5mdW5jdGlvbiBnZXRUYWJsZVZpc3VhbGl6YXRpb25zKHZpZXdzOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXSk6IFRhYmxlVmlzdWFsaXphdGlvbltdIHtcblx0Y29uc3QgdGFibGVzOiBUYWJsZVZpc3VhbGl6YXRpb25bXSA9IFtdO1xuXHR2aWV3cy5mb3JFYWNoKGZ1bmN0aW9uICh2aWV3KSB7XG5cdFx0aWYgKCEodmlldyBhcyBDdXN0b21WaWV3RGVmaW5pdGlvbikudHlwZSkge1xuXHRcdFx0Y29uc3QgdmlzdWFsaXphdGlvbnMgPSAodmlldyBhcyBDb21iaW5lZFZpZXdEZWZpbml0aW9uKS5zZWNvbmRhcnlWaXN1YWxpemF0aW9uXG5cdFx0XHRcdD8gKHZpZXcgYXMgQ29tYmluZWRWaWV3RGVmaW5pdGlvbikuc2Vjb25kYXJ5VmlzdWFsaXphdGlvbi52aXN1YWxpemF0aW9uc1xuXHRcdFx0XHQ6ICh2aWV3IGFzIFNpbmdsZVZpZXdEZWZpbml0aW9uKS5wcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnM7XG5cblx0XHRcdHZpc3VhbGl6YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKHZpc3VhbGl6YXRpb24pIHtcblx0XHRcdFx0aWYgKHZpc3VhbGl6YXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuVGFibGUpIHtcblx0XHRcdFx0XHR0YWJsZXMucHVzaCh2aXN1YWxpemF0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHRhYmxlcztcbn1cblxuZnVuY3Rpb24gZ2V0Q2hhcnRWaXN1YWxpemF0aW9ucyh2aWV3czogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW10pOiBDaGFydFZpc3VhbGl6YXRpb25bXSB7XG5cdGNvbnN0IGNoYXJ0czogQ2hhcnRWaXN1YWxpemF0aW9uW10gPSBbXTtcblx0dmlld3MuZm9yRWFjaChmdW5jdGlvbiAodmlldykge1xuXHRcdGlmICghKHZpZXcgYXMgQ3VzdG9tVmlld0RlZmluaXRpb24pLnR5cGUpIHtcblx0XHRcdGNvbnN0IHZpc3VhbGl6YXRpb25zID0gKHZpZXcgYXMgQ29tYmluZWRWaWV3RGVmaW5pdGlvbikucHJpbWFyeVZpc3VhbGl6YXRpb25cblx0XHRcdFx0PyAodmlldyBhcyBDb21iaW5lZFZpZXdEZWZpbml0aW9uKS5wcmltYXJ5VmlzdWFsaXphdGlvbi52aXN1YWxpemF0aW9uc1xuXHRcdFx0XHQ6ICh2aWV3IGFzIFNpbmdsZVZpZXdEZWZpbml0aW9uKS5wcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnM7XG5cblx0XHRcdHZpc3VhbGl6YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKHZpc3VhbGl6YXRpb24pIHtcblx0XHRcdFx0aWYgKHZpc3VhbGl6YXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQpIHtcblx0XHRcdFx0XHRjaGFydHMucHVzaCh2aXN1YWxpemF0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIGNoYXJ0cztcbn1cblxuY29uc3QgZ2V0RGVmYXVsdFNlbWFudGljRGF0ZXMgPSBmdW5jdGlvbiAoZmlsdGVyRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21FbGVtZW50RmlsdGVyRmllbGQ+KTogUmVjb3JkPHN0cmluZywgRGVmYXVsdFNlbWFudGljRGF0ZT4ge1xuXHRjb25zdCBkZWZhdWx0U2VtYW50aWNEYXRlczogYW55ID0ge307XG5cdGZvciAoY29uc3QgZmlsdGVyRmllbGQgaW4gZmlsdGVyRmllbGRzKSB7XG5cdFx0aWYgKGZpbHRlckZpZWxkc1tmaWx0ZXJGaWVsZF0/LnNldHRpbmdzPy5kZWZhdWx0VmFsdWVzPy5sZW5ndGgpIHtcblx0XHRcdGRlZmF1bHRTZW1hbnRpY0RhdGVzW2ZpbHRlckZpZWxkXSA9IGZpbHRlckZpZWxkc1tmaWx0ZXJGaWVsZF0/LnNldHRpbmdzPy5kZWZhdWx0VmFsdWVzO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZGVmYXVsdFNlbWFudGljRGF0ZXM7XG59O1xuXG4vKipcbiAqIEZpbmQgYSB2aXN1YWxpemF0aW9uIGFubm90YXRpb24gdGhhdCBjYW4gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBsaXN0IHJlcG9ydC5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgY3VycmVudCBFbnRpdHlUeXBlXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIGJJc0FMUFxuICogQHJldHVybnMgQSBjb21wbGlhbnQgYW5ub3RhdGlvbiBmb3IgcmVuZGVyaW5nIHRoZSBsaXN0IHJlcG9ydFxuICovXG5mdW5jdGlvbiBnZXRDb21wbGlhbnRWaXN1YWxpemF0aW9uQW5ub3RhdGlvbihcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0YklzQUxQOiBib29sZWFuXG4pOiBMaW5lSXRlbSB8IFByZXNlbnRhdGlvblZhcmlhbnQgfCBTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50IHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgYW5ub3RhdGlvblBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmdldERlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoKCk7XG5cdGNvbnN0IHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgPSBnZXRTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50KGVudGl0eVR5cGUsIGFubm90YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3Qgc0Vycm9yRm9yQUxQID0gXCJBTFAgZmxhdm9yIG5lZWRzIGJvdGggY2hhcnQgYW5kIHRhYmxlIHRvIGxvYWQgdGhlIGFwcGxpY2F0aW9uXCI7XG5cdGlmIChhbm5vdGF0aW9uUGF0aCAmJiBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0Y29uc3QgcHJlc2VudGF0aW9uVmFyaWFudCA9IHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQuUHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHRpZiAoIXByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlByZXNlbnRhdGlvbiBWYXJpYW50IGlzIG5vdCBjb25maWd1cmVkIGluIHRoZSBTUFYgbWVudGlvbmVkIGluIHRoZSBtYW5pZmVzdFwiKTtcblx0XHR9XG5cdFx0Y29uc3QgYlBWQ29tcGxhaW50ID0gaXNQcmVzZW50YXRpb25Db21wbGlhbnQocHJlc2VudGF0aW9uVmFyaWFudCwgYklzQUxQKTtcblx0XHRpZiAoIWJQVkNvbXBsYWludCkge1xuXHRcdFx0aWYgKGJJc0FMUCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3Ioc0Vycm9yRm9yQUxQKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChpc1NlbGVjdGlvblByZXNlbnRhdGlvbkNvbXBsaWFudChzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LCBiSXNBTFApKSB7XG5cdFx0XHRyZXR1cm4gc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHR9XG5cdH1cblx0aWYgKHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRpZiAoaXNTZWxlY3Rpb25QcmVzZW50YXRpb25Db21wbGlhbnQoc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCwgYklzQUxQKSkge1xuXHRcdFx0cmV0dXJuIHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0fSBlbHNlIGlmIChiSXNBTFApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihzRXJyb3JGb3JBTFApO1xuXHRcdH1cblx0fVxuXHRjb25zdCBwcmVzZW50YXRpb25WYXJpYW50ID0gZ2V0RGVmYXVsdFByZXNlbnRhdGlvblZhcmlhbnQoZW50aXR5VHlwZSk7XG5cdGlmIChwcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0aWYgKGlzUHJlc2VudGF0aW9uQ29tcGxpYW50KHByZXNlbnRhdGlvblZhcmlhbnQsIGJJc0FMUCkpIHtcblx0XHRcdHJldHVybiBwcmVzZW50YXRpb25WYXJpYW50O1xuXHRcdH0gZWxzZSBpZiAoYklzQUxQKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3Ioc0Vycm9yRm9yQUxQKTtcblx0XHR9XG5cdH1cblx0aWYgKCFiSXNBTFApIHtcblx0XHRjb25zdCBkZWZhdWx0TGluZUl0ZW0gPSBnZXREZWZhdWx0TGluZUl0ZW0oZW50aXR5VHlwZSk7XG5cdFx0aWYgKGRlZmF1bHRMaW5lSXRlbSkge1xuXHRcdFx0cmV0dXJuIGRlZmF1bHRMaW5lSXRlbTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuY29uc3QgZ2V0VmlldyA9IGZ1bmN0aW9uICh2aWV3Q29udmVydGVyQ29uZmlndXJhdGlvbjogVmlld0NvbnZlcnRlclNldHRpbmdzKTogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uIHtcblx0bGV0IGNvbmZpZyA9IHZpZXdDb252ZXJ0ZXJDb25maWd1cmF0aW9uO1xuXHRpZiAoY29uZmlnLmNvbnZlcnRlckNvbnRleHQpIHtcblx0XHRsZXQgY29udmVydGVyQ29udGV4dCA9IGNvbmZpZy5jb252ZXJ0ZXJDb250ZXh0O1xuXHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBWaWV3QW5ub3RhdGlvbkNvbmZpZ3VyYXRpb247XG5cdFx0Y29uc3QgaXNNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uID0gZnVuY3Rpb24gKGN1cnJlbnRDb25maWc6IFZpZXdDb25maWd1cmF0aW9uKTogY3VycmVudENvbmZpZyBpcyBNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uIHtcblx0XHRcdHJldHVybiAoY3VycmVudENvbmZpZyBhcyBNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uKS5rZXkgIT09IHVuZGVmaW5lZDtcblx0XHR9O1xuXHRcdGxldCBwcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiA9IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdGNvbmZpZy5hbm5vdGF0aW9uXG5cdFx0XHRcdD8gY29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZUFubm90YXRpb25QYXRoKGNvbmZpZy5hbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkpXG5cdFx0XHRcdDogXCJcIixcblx0XHRcdHRydWUsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0Y29uZmlnIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdGlzTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbihjb25maWcpXG5cdFx0KTtcblx0XHRsZXQgdGFibGVDb250cm9sSWQgPSBcIlwiO1xuXHRcdGxldCBjaGFydENvbnRyb2xJZCA9IFwiXCI7XG5cdFx0bGV0IHRpdGxlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBcIlwiO1xuXHRcdGxldCBzZWxlY3Rpb25WYXJpYW50UGF0aCA9IFwiXCI7XG5cdFx0Y29uc3QgY3JlYXRlVmlzdWFsaXphdGlvbiA9IGZ1bmN0aW9uIChjdXJyZW50UHJlc2VudGF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb24sIGlzUHJpbWFyeT86IGJvb2xlYW4pIHtcblx0XHRcdGxldCBkZWZhdWx0VmlzdWFsaXphdGlvbjtcblx0XHRcdGZvciAoY29uc3QgdmlzdWFsaXphdGlvbiBvZiBjdXJyZW50UHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRcdGlmIChpc1ByaW1hcnkgJiYgdmlzdWFsaXphdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCkge1xuXHRcdFx0XHRcdGRlZmF1bHRWaXN1YWxpemF0aW9uID0gdmlzdWFsaXphdGlvbjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIWlzUHJpbWFyeSAmJiB2aXN1YWxpemF0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlKSB7XG5cdFx0XHRcdFx0ZGVmYXVsdFZpc3VhbGl6YXRpb24gPSB2aXN1YWxpemF0aW9uO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBwcmVzZW50YXRpb25DcmVhdGVkID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFByZXNlbnRhdGlvbik7XG5cdFx0XHRpZiAoZGVmYXVsdFZpc3VhbGl6YXRpb24pIHtcblx0XHRcdFx0cHJlc2VudGF0aW9uQ3JlYXRlZC52aXN1YWxpemF0aW9ucyA9IFtkZWZhdWx0VmlzdWFsaXphdGlvbl07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKGlzUHJpbWFyeSA/IFwiUHJpbWFyeVwiIDogXCJTZWNvbmRhcnlcIikgKyBcIiB2aXN1YWxpc2F0aW9uIG5lZWRzIHZhbGlkIFwiICsgKGlzUHJpbWFyeSA/IFwiY2hhcnRcIiA6IFwidGFibGVcIikpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByZXNlbnRhdGlvbkNyZWF0ZWQ7XG5cdFx0fTtcblx0XHRjb25zdCBnZXRQcmVzZW50YXRpb24gPSBmdW5jdGlvbiAoaXRlbTogU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uLCBpc1ByaW1hcnk6IGJvb2xlYW4pIHtcblx0XHRcdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihpdGVtLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHRhcmdldEFubm90YXRpb24gPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uIGFzIERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0ID0gcmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dDtcblx0XHRcdGNvbnN0IGFubm90YXRpb24gPSB0YXJnZXRBbm5vdGF0aW9uO1xuXHRcdFx0aWYgKGFubm90YXRpb24gfHwgY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZSkge1xuXHRcdFx0XHRwcmVzZW50YXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHRcdFx0YW5ub3RhdGlvblxuXHRcdFx0XHRcdFx0PyBjb252ZXJ0ZXJDb250ZXh0LmdldFJlbGF0aXZlQW5ub3RhdGlvblBhdGgoYW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUsIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpKVxuXHRcdFx0XHRcdFx0OiBcIlwiLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRjb25maWcgYXMgVmlld1BhdGhDb25maWd1cmF0aW9uXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBwcmVzZW50YXRpb247XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzRXJyb3IgPVxuXHRcdFx0XHRcdFwiQW5ub3RhdGlvbiBQYXRoIGZvciB0aGUgXCIgK1xuXHRcdFx0XHRcdChpc1ByaW1hcnkgPyBcInByaW1hcnlcIiA6IFwic2Vjb25kYXJ5XCIpICtcblx0XHRcdFx0XHRcIiB2aXN1YWxpc2F0aW9uIG1lbnRpb25lZCBpbiB0aGUgbWFuaWZlc3QgaXMgbm90IGZvdW5kXCI7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihzRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y29uc3QgY3JlYXRlQWxwVmlldyA9IGZ1bmN0aW9uIChcblx0XHRcdHByZXNlbnRhdGlvbnM6IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbltdLFxuXHRcdFx0ZGVmYXVsdFBhdGg6IFwiYm90aFwiIHwgXCJwcmltYXJ5XCIgfCBcInNlY29uZGFyeVwiIHwgdW5kZWZpbmVkXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBwcmltYXJ5VmlzdWFsaXphdGlvbjogRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uIHwgdW5kZWZpbmVkID0gY3JlYXRlVmlzdWFsaXphdGlvbihwcmVzZW50YXRpb25zWzBdLCB0cnVlKTtcblx0XHRcdGNoYXJ0Q29udHJvbElkID0gKHByaW1hcnlWaXN1YWxpemF0aW9uPy52aXN1YWxpemF0aW9uc1swXSBhcyBDaGFydFZpc3VhbGl6YXRpb24pPy5pZDtcblx0XHRcdGNvbnN0IHNlY29uZGFyeVZpc3VhbGl6YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCA9IGNyZWF0ZVZpc3VhbGl6YXRpb24oXG5cdFx0XHRcdHByZXNlbnRhdGlvbnNbMV0gPyBwcmVzZW50YXRpb25zWzFdIDogcHJlc2VudGF0aW9uc1swXSxcblx0XHRcdFx0ZmFsc2Vcblx0XHRcdCk7XG5cdFx0XHR0YWJsZUNvbnRyb2xJZCA9IChzZWNvbmRhcnlWaXN1YWxpemF0aW9uPy52aXN1YWxpemF0aW9uc1swXSBhcyBUYWJsZVZpc3VhbGl6YXRpb24pPy5hbm5vdGF0aW9uPy5pZDtcblx0XHRcdGlmIChwcmltYXJ5VmlzdWFsaXphdGlvbiAmJiBzZWNvbmRhcnlWaXN1YWxpemF0aW9uKSB7XG5cdFx0XHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0XHRcdGNvbnN0IHZpc2libGUgPSBjb25maWcudmlzaWJsZTtcblx0XHRcdFx0Y29uc3QgdmlldzogQ29tYmluZWRWaWV3RGVmaW5pdGlvbiA9IHtcblx0XHRcdFx0XHRwcmltYXJ5VmlzdWFsaXphdGlvbixcblx0XHRcdFx0XHRzZWNvbmRhcnlWaXN1YWxpemF0aW9uLFxuXHRcdFx0XHRcdHRhYmxlQ29udHJvbElkLFxuXHRcdFx0XHRcdGNoYXJ0Q29udHJvbElkLFxuXHRcdFx0XHRcdGRlZmF1bHRQYXRoLFxuXHRcdFx0XHRcdHZpc2libGVcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpZiAocHJlc2VudGF0aW9uPy52aXN1YWxpemF0aW9ucz8ubGVuZ3RoID09PSAyICYmIGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2UpIHtcblx0XHRcdGNvbnN0IHZpZXc6IENvbWJpbmVkVmlld0RlZmluaXRpb24gfCB1bmRlZmluZWQgPSBjcmVhdGVBbHBWaWV3KFtwcmVzZW50YXRpb25dLCBcImJvdGhcIik7XG5cdFx0XHRpZiAodmlldykge1xuXHRcdFx0XHRyZXR1cm4gdmlldztcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKGNvbmZpZyBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb24pIHx8XG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlXG5cdFx0KSB7XG5cdFx0XHRjb25zdCB7IHByaW1hcnksIHNlY29uZGFyeSB9ID0gY29uZmlnIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdFx0aWYgKHByaW1hcnkgJiYgcHJpbWFyeS5sZW5ndGggJiYgc2Vjb25kYXJ5ICYmIHNlY29uZGFyeS5sZW5ndGgpIHtcblx0XHRcdFx0Y29uc3QgdmlldzogQ29tYmluZWRWaWV3RGVmaW5pdGlvbiB8IHVuZGVmaW5lZCA9IGNyZWF0ZUFscFZpZXcoXG5cdFx0XHRcdFx0W2dldFByZXNlbnRhdGlvbihwcmltYXJ5WzBdLCB0cnVlKSwgZ2V0UHJlc2VudGF0aW9uKHNlY29uZGFyeVswXSwgZmFsc2UpXSxcblx0XHRcdFx0XHQoY29uZmlnIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uKS5kZWZhdWx0UGF0aFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAodmlldykge1xuXHRcdFx0XHRcdHJldHVybiB2aWV3O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZWNvbmRhcnlJdGVtcyBpbiB0aGUgVmlld3MgaXMgbm90IHByZXNlbnRcIik7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChpc011bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24oY29uZmlnKSkge1xuXHRcdFx0Ly8ga2V5IGV4aXN0cyBvbmx5IG9uIG11bHRpIHRhYmxlcyBtb2RlXG5cdFx0XHRjb25zdCByZXNvbHZlZFRhcmdldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oKGNvbmZpZyBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb24pLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHZpZXdBbm5vdGF0aW9uOiBWaWV3QW5ub3RhdGlvbnMgPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uO1xuXHRcdFx0Y29udmVydGVyQ29udGV4dCA9IHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQ7XG5cdFx0XHR0aXRsZSA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbih2aWV3QW5ub3RhdGlvbi5UZXh0KSk7XG5cdFx0XHQvLyBOZWVkIHRvIGxvb3Agb24gdGFibGUgaW50byB2aWV3cyBzaW5jZSBtdWx0aSB0YWJsZSBtb2RlIGdldCBzcGVjaWZpYyBjb25maWd1cmF0aW9uIChoaWRkZW4gZmlsdGVycyBvciBUYWJsZSBJZClcblx0XHRcdHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9ucy5mb3JFYWNoKCh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbiwgaW5kZXgpID0+IHtcblx0XHRcdFx0c3dpdGNoICh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi50eXBlKSB7XG5cdFx0XHRcdFx0Y2FzZSBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZTpcblx0XHRcdFx0XHRcdGNvbnN0IHRhYmxlVmlzdWFsaXphdGlvbiA9IHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9uc1tpbmRleF0gYXMgVGFibGVWaXN1YWxpemF0aW9uO1xuXHRcdFx0XHRcdFx0Y29uc3QgZmlsdGVycyA9IHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLmZpbHRlcnMgfHwge307XG5cdFx0XHRcdFx0XHRmaWx0ZXJzLmhpZGRlbkZpbHRlcnMgPSBmaWx0ZXJzLmhpZGRlbkZpbHRlcnMgfHwgeyBwYXRoczogW10gfTtcblx0XHRcdFx0XHRcdGlmICghKGNvbmZpZyBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb24pLmtlZXBQcmV2aW91c1BlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0XHRcdFx0XHQvLyBOZWVkIHRvIG92ZXJyaWRlIFRhYmxlIElkIHRvIG1hdGNoIHdpdGggVGFiIEtleSAoY3VycmVudGx5IG9ubHkgdGFibGUgaXMgbWFuYWdlZCBpbiBtdWx0aXBsZSB2aWV3IG1vZGUpXG5cdFx0XHRcdFx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5hbm5vdGF0aW9uLmlkID0gZ2V0VGFibGVJRCgoY29uZmlnIGFzIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbikua2V5IHx8IFwiXCIsIFwiTGluZUl0ZW1cIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25maWcgPSBjb25maWcgYXMgVmlld0Fubm90YXRpb25Db25maWd1cmF0aW9uO1xuXHRcdFx0XHRcdFx0aWYgKGNvbmZpZyAmJiBjb25maWcuYW5ub3RhdGlvbiAmJiBjb25maWcuYW5ub3RhdGlvbi50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnRQYXRoID0gYEAke2NvbmZpZy5hbm5vdGF0aW9uLlNlbGVjdGlvblZhcmlhbnQuZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KFwiQFwiKVsxXX1gO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudFBhdGggPSAoY29uZmlnIGFzIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbikuYW5ub3RhdGlvblBhdGg7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvL1Byb3ZpZGUgU2VsZWN0aW9uIFZhcmlhbnQgdG8gaGlkZGVuRmlsdGVycyBpbiBvcmRlciB0byBzZXQgdGhlIFNWIGZpbHRlcnMgdG8gdGhlIHRhYmxlLlxuXHRcdFx0XHRcdFx0Ly9NREMgVGFibGUgb3ZlcnJpZGVzIGJpbmRpbmcgRmlsdGVyIGFuZCBmcm9tIFNBUCBGRSB0aGUgb25seSBtZXRob2Qgd2hlcmUgd2UgYXJlIGFibGUgdG8gYWRkXG5cdFx0XHRcdFx0XHQvL2FkZGl0aW9uYWwgZmlsdGVyIGlzICdyZWJpbmRUYWJsZScgaW50byBUYWJsZSBkZWxlZ2F0ZS5cblx0XHRcdFx0XHRcdC8vVG8gYXZvaWQgaW1wbGVtZW50aW5nIHNwZWNpZmljIExSIGZlYXR1cmUgdG8gU0FQIEZFIE1hY3JvIFRhYmxlLCB0aGUgZmlsdGVyKHMpIHJlbGF0ZWQgdG8gdGhlIFRhYiAobXVsdGkgdGFibGUgbW9kZSlcblx0XHRcdFx0XHRcdC8vY2FuIGJlIHBhc3NlZCB0byBtYWNybyB0YWJsZSB2aWEgcGFyYW1ldGVyL2NvbnRleHQgbmFtZWQgZmlsdGVycyBhbmQga2V5IGhpZGRlbkZpbHRlcnMuXG5cdFx0XHRcdFx0XHRmaWx0ZXJzLmhpZGRlbkZpbHRlcnMucGF0aHMucHVzaCh7IGFubm90YXRpb25QYXRoOiBzZWxlY3Rpb25WYXJpYW50UGF0aCB9KTtcblx0XHRcdFx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLmZpbHRlcnMgPSBmaWx0ZXJzO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBWaXN1YWxpemF0aW9uVHlwZS5DaGFydDpcblx0XHRcdFx0XHRcdGNvbnN0IGNoYXJ0VmlzdWFsaXphdGlvbiA9IHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9uc1tpbmRleF0gYXMgQ2hhcnRWaXN1YWxpemF0aW9uO1xuXHRcdFx0XHRcdFx0Y2hhcnRWaXN1YWxpemF0aW9uLmlkID0gZ2V0Q2hhcnRJRCgoY29uZmlnIGFzIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbikua2V5IHx8IFwiXCIsIFwiQ2hhcnRcIik7XG5cdFx0XHRcdFx0XHRjaGFydFZpc3VhbGl6YXRpb24ubXVsdGlWaWV3cyA9IHRydWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRwcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnMuZm9yRWFjaCgodmlzdWFsaXphdGlvbkRlZmluaXRpb24pID0+IHtcblx0XHRcdGlmICh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZSkge1xuXHRcdFx0XHR0YWJsZUNvbnRyb2xJZCA9IHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLmFubm90YXRpb24uaWQ7XG5cdFx0XHR9IGVsc2UgaWYgKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0KSB7XG5cdFx0XHRcdGNoYXJ0Q29udHJvbElkID0gdmlzdWFsaXphdGlvbkRlZmluaXRpb24uaWQ7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y29uZmlnID0gY29uZmlnIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvbjtcblx0XHRjb25zdCB2aXNpYmxlID0gY29uZmlnLnZpc2libGU7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHByZXNlbnRhdGlvbixcblx0XHRcdHRhYmxlQ29udHJvbElkLFxuXHRcdFx0Y2hhcnRDb250cm9sSWQsXG5cdFx0XHR0aXRsZSxcblx0XHRcdHNlbGVjdGlvblZhcmlhbnRQYXRoLFxuXHRcdFx0dmlzaWJsZVxuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0Y29uZmlnID0gY29uZmlnIGFzIEN1c3RvbVZpZXdDb25maWd1cmF0aW9uO1xuXHRcdGNvbnN0IHRpdGxlID0gY29uZmlnLmxhYmVsLFxuXHRcdFx0ZnJhZ21lbnQgPSBjb25maWcudGVtcGxhdGUsXG5cdFx0XHR0eXBlID0gY29uZmlnLnR5cGUsXG5cdFx0XHRjdXN0b21UYWJJZCA9IGdldEN1c3RvbVRhYklEKGNvbmZpZy5rZXkgfHwgXCJcIiksXG5cdFx0XHR2aXNpYmxlID0gY29uZmlnLnZpc2libGU7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRpdGxlLFxuXHRcdFx0ZnJhZ21lbnQsXG5cdFx0XHR0eXBlLFxuXHRcdFx0Y3VzdG9tVGFiSWQsXG5cdFx0XHR2aXNpYmxlXG5cdFx0fTtcblx0fVxufTtcblxuY29uc3QgZ2V0Vmlld3MgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHNldHRpbmdzVmlld3M6IE11bHRpcGxlVmlld3NDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkXG4pOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXSB7XG5cdGxldCB2aWV3Q29udmVydGVyQ29uZmlnczogVmlld0NvbnZlcnRlclNldHRpbmdzW10gPSBbXTtcblx0aWYgKHNldHRpbmdzVmlld3MpIHtcblx0XHRzZXR0aW5nc1ZpZXdzLnBhdGhzLmZvckVhY2goKHBhdGg6IFZpZXdQYXRoQ29uZmlndXJhdGlvbiB8IEN1c3RvbVZpZXdUZW1wbGF0ZUNvbmZpZ3VyYXRpb24pID0+IHtcblx0XHRcdGlmIChjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMocGF0aCBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb24pKSB7XG5cdFx0XHRcdGlmIChzZXR0aW5nc1ZpZXdzLnBhdGhzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBTFAgZmxhdm9yIGNhbm5vdCBoYXZlIG11bHRpcGxlIHZpZXdzXCIpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBhdGggPSBwYXRoIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdFx0XHRcdHZpZXdDb252ZXJ0ZXJDb25maWdzLnB1c2goe1xuXHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogY29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdHByaW1hcnk6IHBhdGgucHJpbWFyeSxcblx0XHRcdFx0XHRcdHNlY29uZGFyeTogcGF0aC5zZWNvbmRhcnksXG5cdFx0XHRcdFx0XHRkZWZhdWx0UGF0aDogcGF0aC5kZWZhdWx0UGF0aFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKChwYXRoIGFzIEN1c3RvbVZpZXdDb25maWd1cmF0aW9uKS50ZW1wbGF0ZSkge1xuXHRcdFx0XHRwYXRoID0gcGF0aCBhcyBDdXN0b21WaWV3Q29uZmlndXJhdGlvbjtcblx0XHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdFx0a2V5OiBwYXRoLmtleSxcblx0XHRcdFx0XHRsYWJlbDogcGF0aC5sYWJlbCxcblx0XHRcdFx0XHR0ZW1wbGF0ZTogcGF0aC50ZW1wbGF0ZSxcblx0XHRcdFx0XHR0eXBlOiBcIkN1c3RvbVwiLFxuXHRcdFx0XHRcdHZpc2libGU6IHBhdGgudmlzaWJsZVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBhdGggPSBwYXRoIGFzIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbjtcblx0XHRcdFx0Y29uc3Qgdmlld0NvbnZlcnRlckNvbnRleHQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlckNvbnRleHRGb3IoXG5cdFx0XHRcdFx0XHRwYXRoLmNvbnRleHRQYXRoIHx8IChwYXRoLmVudGl0eVNldCAmJiBgLyR7cGF0aC5lbnRpdHlTZXR9YCkgfHwgY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRlbnRpdHlUeXBlID0gdmlld0NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXG5cdFx0XHRcdGlmIChlbnRpdHlUeXBlICYmIHZpZXdDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdFx0XHRcdFx0bGV0IGFubm90YXRpb247XG5cdFx0XHRcdFx0Y29uc3QgcmVzb2x2ZWRUYXJnZXQgPSB2aWV3Q29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihwYXRoLmFubm90YXRpb25QYXRoKTtcblx0XHRcdFx0XHRjb25zdCB0YXJnZXRBbm5vdGF0aW9uID0gcmVzb2x2ZWRUYXJnZXQuYW5ub3RhdGlvbiBhcyBEYXRhVmlzdWFsaXphdGlvbkFubm90YXRpb25zO1xuXHRcdFx0XHRcdGlmICh0YXJnZXRBbm5vdGF0aW9uKSB7XG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9uID1cblx0XHRcdFx0XHRcdFx0dGFyZ2V0QW5ub3RhdGlvbi50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25WYXJpYW50XG5cdFx0XHRcdFx0XHRcdFx0PyBnZXRDb21wbGlhbnRWaXN1YWxpemF0aW9uQW5ub3RhdGlvbihlbnRpdHlUeXBlLCB2aWV3Q29udmVydGVyQ29udGV4dCwgZmFsc2UpXG5cdFx0XHRcdFx0XHRcdFx0OiB0YXJnZXRBbm5vdGF0aW9uO1xuXHRcdFx0XHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IHZpZXdDb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uLFxuXHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogcGF0aC5hbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0XHRcdFx0a2VlcFByZXZpb3VzUGVyc29uYWxpemF0aW9uOiBwYXRoLmtlZXBQcmV2aW91c1BlcnNvbmFsaXphdGlvbixcblx0XHRcdFx0XHRcdFx0a2V5OiBwYXRoLmtleSxcblx0XHRcdFx0XHRcdFx0dmlzaWJsZTogcGF0aC52aXNpYmxlXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gVE9ETyBEaWFnbm9zdGljcyBtZXNzYWdlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdFx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2UpIHtcblx0XHRcdHZpZXdDb252ZXJ0ZXJDb25maWdzID0gZ2V0QWxwVmlld0NvbmZpZyhjb252ZXJ0ZXJDb250ZXh0LCB2aWV3Q29udmVydGVyQ29uZmlncyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZpZXdDb252ZXJ0ZXJDb25maWdzLnB1c2goe1xuXHRcdFx0XHRhbm5vdGF0aW9uOiBnZXRDb21wbGlhbnRWaXN1YWxpemF0aW9uQW5ub3RhdGlvbihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0LCBmYWxzZSksXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IGNvbnZlcnRlckNvbnRleHRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdmlld0NvbnZlcnRlckNvbmZpZ3MubWFwKCh2aWV3Q29udmVydGVyQ29uZmlnKSA9PiB7XG5cdFx0cmV0dXJuIGdldFZpZXcodmlld0NvbnZlcnRlckNvbmZpZyk7XG5cdH0pO1xufTtcblxuY29uc3QgZ2V0TXVsdGlWaWV3c0NvbnRyb2wgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHZpZXdzOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXVxuKTogTXVsdGlWaWV3c0NvbnRyb2xDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3Qgdmlld3NEZWZpbml0aW9uOiBNdWx0aXBsZVZpZXdzQ29uZmlndXJhdGlvbiB8IHVuZGVmaW5lZCA9IG1hbmlmZXN0V3JhcHBlci5nZXRWaWV3Q29uZmlndXJhdGlvbigpO1xuXHRpZiAodmlld3MubGVuZ3RoID4gMSAmJiAhaGFzTXVsdGlWaXN1YWxpemF0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KSkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzaG93VGFiQ291bnRzOiB2aWV3c0RlZmluaXRpb24gPyB2aWV3c0RlZmluaXRpb24/LnNob3dDb3VudHMgfHwgbWFuaWZlc3RXcmFwcGVyLmhhc011bHRpcGxlRW50aXR5U2V0cygpIDogdW5kZWZpbmVkLCAvLyB3aXRoIG11bHRpIEVudGl0eVNldHMsIHRhYiBjb3VudHMgYXJlIGRpc3BsYXllZCBieSBkZWZhdWx0XG5cdFx0XHRpZDogZ2V0SWNvblRhYkJhcklEKClcblx0XHR9O1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5mdW5jdGlvbiBnZXRBbHBWaWV3Q29uZmlnKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIHZpZXdDb25maWdzOiBWaWV3Q29udmVydGVyU2V0dGluZ3NbXSk6IFZpZXdDb252ZXJ0ZXJTZXR0aW5nc1tdIHtcblx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRjb25zdCBhbm5vdGF0aW9uID0gZ2V0Q29tcGxpYW50VmlzdWFsaXphdGlvbkFubm90YXRpb24oZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCwgdHJ1ZSk7XG5cdGxldCBjaGFydCwgdGFibGU7XG5cdGlmIChhbm5vdGF0aW9uKSB7XG5cdFx0dmlld0NvbmZpZ3MucHVzaCh7XG5cdFx0XHRhbm5vdGF0aW9uOiBhbm5vdGF0aW9uLFxuXHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGNoYXJ0ID0gZ2V0RGVmYXVsdENoYXJ0KGVudGl0eVR5cGUpO1xuXHRcdHRhYmxlID0gZ2V0RGVmYXVsdExpbmVJdGVtKGVudGl0eVR5cGUpO1xuXHRcdGlmIChjaGFydCAmJiB0YWJsZSkge1xuXHRcdFx0Y29uc3QgcHJpbWFyeTogU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uW10gPSBbeyBhbm5vdGF0aW9uUGF0aDogXCJAXCIgKyBjaGFydC50ZXJtIH1dO1xuXHRcdFx0Y29uc3Qgc2Vjb25kYXJ5OiBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb25bXSA9IFt7IGFubm90YXRpb25QYXRoOiBcIkBcIiArIHRhYmxlLnRlcm0gfV07XG5cdFx0XHR2aWV3Q29uZmlncy5wdXNoKHtcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogY29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0cHJpbWFyeTogcHJpbWFyeSxcblx0XHRcdFx0c2Vjb25kYXJ5OiBzZWNvbmRhcnksXG5cdFx0XHRcdGRlZmF1bHRQYXRoOiBcImJvdGhcIlxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFMUCBmbGF2b3IgbmVlZHMgYm90aCBjaGFydCBhbmQgdGFibGUgdG8gbG9hZCB0aGUgYXBwbGljYXRpb25cIik7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB2aWV3Q29uZmlncztcbn1cblxuZnVuY3Rpb24gaGFzTXVsdGlWaXN1YWxpemF0aW9ucyhjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKCkgfHxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlXG5cdCk7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRIZWFkZXJBY3Rpb25zID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBCYXNlQWN0aW9uW10ge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRyZXR1cm4gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoW10sIGdldEFjdGlvbnNGcm9tTWFuaWZlc3QobWFuaWZlc3RXcmFwcGVyLmdldEhlYWRlckFjdGlvbnMoKSwgY29udmVydGVyQ29udGV4dCkuYWN0aW9ucyk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hlY2tDaGFydEZpbHRlckJhcklkID0gZnVuY3Rpb24gKHZpZXdzOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXSwgZmlsdGVyQmFySWQ6IHN0cmluZykge1xuXHR2aWV3cy5mb3JFYWNoKCh2aWV3KSA9PiB7XG5cdFx0aWYgKCEodmlldyBhcyBDdXN0b21WaWV3RGVmaW5pdGlvbikudHlwZSkge1xuXHRcdFx0Y29uc3QgcHJlc2VudGF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb24gPSAodmlldyBhcyBTaW5nbGVWaWV3RGVmaW5pdGlvbikucHJlc2VudGF0aW9uO1xuXHRcdFx0cHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zLmZvckVhY2goKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uKSA9PiB7XG5cdFx0XHRcdGlmICh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCAmJiB2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi5maWx0ZXJJZCAhPT0gZmlsdGVyQmFySWQpIHtcblx0XHRcdFx0XHR2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi5maWx0ZXJJZCA9IGZpbHRlckJhcklkO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBMaXN0UmVwb3J0RGVmaW5pdGlvbiBmb3IgbXVsdGlwbGUgZW50aXR5IHNldHMgKG11bHRpcGxlIHRhYmxlIG1vZGUpLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGxpc3QgcmVwb3J0IGRlZmluaXRpb24gYmFzZWQgb24gYW5ub3RhdGlvbiArIG1hbmlmZXN0XG4gKi9cbmV4cG9ydCBjb25zdCBjb252ZXJ0UGFnZSA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogTGlzdFJlcG9ydERlZmluaXRpb24ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IHNDb250ZXh0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKTtcblxuXHRpZiAoIXNDb250ZXh0UGF0aCkge1xuXHRcdC8vIElmIHdlIGRvbid0IGhhdmUgYW4gZW50aXR5U2V0IGF0IHRoaXMgcG9pbnQgd2UgaGF2ZSBhbiBpc3N1ZSBJJ2Qgc2F5XG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XCJBbiBFbnRpdHlTZXQgaXMgcmVxdWlyZWQgdG8gYmUgYWJsZSB0byBkaXNwbGF5IGEgTGlzdFJlcG9ydCwgcGxlYXNlIGFkanVzdCB5b3VyIGBlbnRpdHlTZXRgIHByb3BlcnR5IHRvIHBvaW50IHRvIG9uZS5cIlxuXHRcdCk7XG5cdH1cblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3Qgdmlld3NEZWZpbml0aW9uOiBNdWx0aXBsZVZpZXdzQ29uZmlndXJhdGlvbiB8IHVuZGVmaW5lZCA9IG1hbmlmZXN0V3JhcHBlci5nZXRWaWV3Q29uZmlndXJhdGlvbigpO1xuXHRjb25zdCBoYXNNdWx0aXBsZUVudGl0eVNldHMgPSBtYW5pZmVzdFdyYXBwZXIuaGFzTXVsdGlwbGVFbnRpdHlTZXRzKCk7XG5cdGNvbnN0IHZpZXdzOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXSA9IGdldFZpZXdzKGNvbnZlcnRlckNvbnRleHQsIHZpZXdzRGVmaW5pdGlvbik7XG5cdGNvbnN0IGxyVGFibGVWaXN1YWxpemF0aW9ucyA9IGdldFRhYmxlVmlzdWFsaXphdGlvbnModmlld3MpO1xuXHRjb25zdCBsckNoYXJ0VmlzdWFsaXphdGlvbnMgPSBnZXRDaGFydFZpc3VhbGl6YXRpb25zKHZpZXdzKTtcblx0Y29uc3Qgc2hvd1Bpbm5hYmxlVG9nZ2xlID0gbHJUYWJsZVZpc3VhbGl6YXRpb25zLnNvbWUoKHRhYmxlKSA9PiB0YWJsZS5jb250cm9sLnR5cGUgPT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIpO1xuXHRsZXQgc2luZ2xlVGFibGVJZCA9IFwiXCI7XG5cdGxldCBzaW5nbGVDaGFydElkID0gXCJcIjtcblx0Y29uc3QgZHluYW1pY0xpc3RSZXBvcnRJZCA9IGdldER5bmFtaWNMaXN0UmVwb3J0SUQoKTtcblx0Y29uc3QgZmlsdGVyQmFySWQgPSBnZXRGaWx0ZXJCYXJJRChzQ29udGV4dFBhdGgpO1xuXHRjb25zdCBmaWx0ZXJWYXJpYW50TWFuYWdlbWVudElEID0gZ2V0RmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRChmaWx0ZXJCYXJJZCk7XG5cdGNvbnN0IGZiQ29uZmlnID0gbWFuaWZlc3RXcmFwcGVyLmdldEZpbHRlckNvbmZpZ3VyYXRpb24oKTtcblx0Y29uc3QgZmlsdGVySW5pdGlhbExheW91dCA9IGZiQ29uZmlnPy5pbml0aWFsTGF5b3V0ICE9PSB1bmRlZmluZWQgPyBmYkNvbmZpZz8uaW5pdGlhbExheW91dC50b0xvd2VyQ2FzZSgpIDogXCJjb21wYWN0XCI7XG5cdGNvbnN0IGZpbHRlckxheW91dCA9IGZiQ29uZmlnPy5sYXlvdXQgIT09IHVuZGVmaW5lZCA/IGZiQ29uZmlnPy5sYXlvdXQudG9Mb3dlckNhc2UoKSA6IFwiY29tcGFjdFwiO1xuXHRjb25zdCB1c2VTZW1hbnRpY0RhdGVSYW5nZSA9IGZiQ29uZmlnLnVzZVNlbWFudGljRGF0ZVJhbmdlICE9PSB1bmRlZmluZWQgPyBmYkNvbmZpZy51c2VTZW1hbnRpY0RhdGVSYW5nZSA6IHRydWU7XG5cdGNvbnN0IHNob3dDbGVhckJ1dHRvbiA9IGZiQ29uZmlnLnNob3dDbGVhckJ1dHRvbiAhPT0gdW5kZWZpbmVkID8gZmJDb25maWcuc2hvd0NsZWFyQnV0dG9uIDogZmFsc2U7XG5cblx0Y29uc3Qgb0NvbmZpZyA9IGdldENvbnRlbnRBcmVhSWQoY29udmVydGVyQ29udGV4dCwgdmlld3MpO1xuXHRpZiAob0NvbmZpZykge1xuXHRcdHNpbmdsZUNoYXJ0SWQgPSBvQ29uZmlnLmNoYXJ0SWQ7XG5cdFx0c2luZ2xlVGFibGVJZCA9IG9Db25maWcudGFibGVJZDtcblx0fVxuXG5cdGNvbnN0IHVzZUhpZGRlbkZpbHRlckJhciA9IG1hbmlmZXN0V3JhcHBlci51c2VIaWRkZW5GaWx0ZXJCYXIoKTtcblx0Ly8gQ2hhcnQgaGFzIGEgZGVwZW5kZW5jeSB0byBmaWx0ZXIgYmFyIChpc3N1ZSB3aXRoIGxvYWRpbmcgZGF0YSkuIE9uY2UgcmVzb2x2ZWQsIHRoZSBjaGVjayBmb3IgY2hhcnQgc2hvdWxkIGJlIHJlbW92ZWQgaGVyZS5cblx0Ly8gVW50aWwgdGhlbiwgaGlkaW5nIGZpbHRlciBiYXIgaXMgbm93IGFsbG93ZWQgaWYgYSBjaGFydCBpcyBiZWluZyB1c2VkIG9uIExSLlxuXHRjb25zdCBoaWRlRmlsdGVyQmFyID0gKG1hbmlmZXN0V3JhcHBlci5pc0ZpbHRlckJhckhpZGRlbigpIHx8IHVzZUhpZGRlbkZpbHRlckJhcikgJiYgc2luZ2xlQ2hhcnRJZCA9PT0gXCJcIjtcblx0Y29uc3QgbHJGaWx0ZXJQcm9wZXJ0aWVzID0gZ2V0U2VsZWN0aW9uRmllbGRzKGNvbnZlcnRlckNvbnRleHQsIGxyVGFibGVWaXN1YWxpemF0aW9ucyk7XG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkcyA9IGxyRmlsdGVyUHJvcGVydGllcy5zZWxlY3Rpb25GaWVsZHM7XG5cdGNvbnN0IHByb3BlcnR5SW5mb0ZpZWxkcyA9IGxyRmlsdGVyUHJvcGVydGllcy5zUHJvcGVydHlJbmZvO1xuXHRjb25zdCBoaWRlQmFzaWNTZWFyY2ggPSBnZXRGaWx0ZXJCYXJoaWRlQmFzaWNTZWFyY2gobHJUYWJsZVZpc3VhbGl6YXRpb25zLCBsckNoYXJ0VmlzdWFsaXphdGlvbnMsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBtdWx0aVZpZXdDb250cm9sID0gZ2V0TXVsdGlWaWV3c0NvbnRyb2woY29udmVydGVyQ29udGV4dCwgdmlld3MpO1xuXG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBtdWx0aVZpZXdDb250cm9sID8gdW5kZWZpbmVkIDogZ2V0U2VsZWN0aW9uVmFyaWFudChlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgZGVmYXVsdFNlbWFudGljRGF0ZXMgPSB1c2VTZW1hbnRpY0RhdGVSYW5nZSA/IGdldERlZmF1bHRTZW1hbnRpY0RhdGVzKGdldE1hbmlmZXN0RmlsdGVyRmllbGRzKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpKSA6IHt9O1xuXG5cdC8vIFNvcnQgaGVhZGVyIGFjdGlvbnMgYWNjb3JkaW5nIHRvIHBvc2l0aW9uIGF0dHJpYnV0ZXMgaW4gbWFuaWZlc3Rcblx0Y29uc3QgaGVhZGVyQWN0aW9ucyA9IGdldEhlYWRlckFjdGlvbnMoY29udmVydGVyQ29udGV4dCk7XG5cdGlmIChoYXNNdWx0aXBsZUVudGl0eVNldHMpIHtcblx0XHRjaGVja0NoYXJ0RmlsdGVyQmFySWQodmlld3MsIGZpbHRlckJhcklkKTtcblx0fVxuXG5cdGNvbnN0IHZpc3VhbGl6YXRpb25JZHMgPSBsclRhYmxlVmlzdWFsaXphdGlvbnNcblx0XHQubWFwKCh2aXN1YWxpemF0aW9uKSA9PiB7XG5cdFx0XHRyZXR1cm4gdmlzdWFsaXphdGlvbi5hbm5vdGF0aW9uLmlkO1xuXHRcdH0pXG5cdFx0LmNvbmNhdChcblx0XHRcdGxyQ2hhcnRWaXN1YWxpemF0aW9ucy5tYXAoKHZpc3VhbGl6YXRpb24pID0+IHtcblx0XHRcdFx0cmV0dXJuIHZpc3VhbGl6YXRpb24uaWQ7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdGNvbnN0IHRhcmdldENvbnRyb2xJZHMgPSBbXG5cdFx0Li4uKGhpZGVGaWx0ZXJCYXIgJiYgIXVzZUhpZGRlbkZpbHRlckJhciA/IFtdIDogW2ZpbHRlckJhcklkXSksXG5cdFx0Li4uKG1hbmlmZXN0V3JhcHBlci5nZXRWYXJpYW50TWFuYWdlbWVudCgpICE9PSBWYXJpYW50TWFuYWdlbWVudFR5cGUuQ29udHJvbCA/IHZpc3VhbGl6YXRpb25JZHMgOiBbXSksXG5cdFx0Li4uKG11bHRpVmlld0NvbnRyb2wgPyBbbXVsdGlWaWV3Q29udHJvbC5pZF0gOiBbXSlcblx0XTtcblxuXHRjb25zdCBzdGlja3lTdWJoZWFkZXJQcm92aWRlciA9XG5cdFx0bXVsdGlWaWV3Q29udHJvbCAmJiBtYW5pZmVzdFdyYXBwZXIuZ2V0U3RpY2t5TXVsdGlUYWJIZWFkZXJDb25maWd1cmF0aW9uKCkgPyBtdWx0aVZpZXdDb250cm9sLmlkIDogdW5kZWZpbmVkO1xuXG5cdHJldHVybiB7XG5cdFx0bWFpbkVudGl0eVNldDogc0NvbnRleHRQYXRoLFxuXHRcdG1haW5FbnRpdHlUeXBlOiBgJHtzQ29udGV4dFBhdGh9L2AsXG5cdFx0bXVsdGlWaWV3c0NvbnRyb2w6IG11bHRpVmlld0NvbnRyb2wsXG5cdFx0c3RpY2t5U3ViaGVhZGVyUHJvdmlkZXIsXG5cdFx0c2luZ2xlVGFibGVJZCxcblx0XHRzaW5nbGVDaGFydElkLFxuXHRcdGR5bmFtaWNMaXN0UmVwb3J0SWQsXG5cdFx0aGVhZGVyQWN0aW9ucyxcblx0XHRzaG93UGlubmFibGVUb2dnbGU6IHNob3dQaW5uYWJsZVRvZ2dsZSxcblx0XHRmaWx0ZXJCYXI6IHtcblx0XHRcdHByb3BlcnR5SW5mbzogcHJvcGVydHlJbmZvRmllbGRzLFxuXHRcdFx0c2VsZWN0aW9uRmllbGRzLFxuXHRcdFx0aGlkZUJhc2ljU2VhcmNoLFxuXHRcdFx0c2hvd0NsZWFyQnV0dG9uXG5cdFx0fSxcblx0XHR2aWV3czogdmlld3MsXG5cdFx0ZmlsdGVyQmFySWQ6IGhpZGVGaWx0ZXJCYXIgJiYgIXVzZUhpZGRlbkZpbHRlckJhciA/IFwiXCIgOiBmaWx0ZXJCYXJJZCxcblx0XHRmaWx0ZXJDb25kaXRpb25zOiB7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50OiBzZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0ZGVmYXVsdFNlbWFudGljRGF0ZXM6IGRlZmF1bHRTZW1hbnRpY0RhdGVzXG5cdFx0fSxcblx0XHR2YXJpYW50TWFuYWdlbWVudDoge1xuXHRcdFx0aWQ6IGZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQsXG5cdFx0XHR0YXJnZXRDb250cm9sSWRzOiB0YXJnZXRDb250cm9sSWRzLmpvaW4oXCIsXCIpXG5cdFx0fSxcblx0XHRoYXNNdWx0aVZpc3VhbGl6YXRpb25zOiBoYXNNdWx0aVZpc3VhbGl6YXRpb25zKGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdHRlbXBsYXRlVHlwZTogbWFuaWZlc3RXcmFwcGVyLmdldFRlbXBsYXRlVHlwZSgpLFxuXHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdGZpbHRlckluaXRpYWxMYXlvdXQsXG5cdFx0ZmlsdGVyTGF5b3V0LFxuXHRcdGtwaURlZmluaXRpb25zOiBnZXRLUElEZWZpbml0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRoaWRlRmlsdGVyQmFyLFxuXHRcdHVzZUhpZGRlbkZpbHRlckJhclxuXHR9O1xufTtcblxuZnVuY3Rpb24gZ2V0Q29udGVudEFyZWFJZChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCB2aWV3czogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW10pOiBDb250ZW50QXJlYUlEIHwgdW5kZWZpbmVkIHtcblx0bGV0IHNpbmdsZVRhYmxlSWQgPSBcIlwiLFxuXHRcdHNpbmdsZUNoYXJ0SWQgPSBcIlwiO1xuXHRpZiAoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKCkgfHxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlXG5cdCkge1xuXHRcdGZvciAobGV0IHZpZXcgb2Ygdmlld3MpIHtcblx0XHRcdHZpZXcgPSB2aWV3IGFzIENvbWJpbmVkVmlld0RlZmluaXRpb247XG5cdFx0XHRpZiAodmlldy5jaGFydENvbnRyb2xJZCAmJiB2aWV3LnRhYmxlQ29udHJvbElkKSB7XG5cdFx0XHRcdHNpbmdsZUNoYXJ0SWQgPSB2aWV3LmNoYXJ0Q29udHJvbElkO1xuXHRcdFx0XHRzaW5nbGVUYWJsZUlkID0gdmlldy50YWJsZUNvbnRyb2xJZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvciAobGV0IHZpZXcgb2Ygdmlld3MpIHtcblx0XHRcdHZpZXcgPSB2aWV3IGFzIFNpbmdsZVZpZXdEZWZpbml0aW9uO1xuXHRcdFx0aWYgKCFzaW5nbGVUYWJsZUlkICYmICh2aWV3IGFzIFNpbmdsZVRhYmxlVmlld0RlZmluaXRpb24pLnRhYmxlQ29udHJvbElkKSB7XG5cdFx0XHRcdHNpbmdsZVRhYmxlSWQgPSAodmlldyBhcyBTaW5nbGVUYWJsZVZpZXdEZWZpbml0aW9uKS50YWJsZUNvbnRyb2xJZCB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFzaW5nbGVDaGFydElkICYmICh2aWV3IGFzIFNpbmdsZUNoYXJ0Vmlld0RlZmluaXRpb24pLmNoYXJ0Q29udHJvbElkKSB7XG5cdFx0XHRcdHNpbmdsZUNoYXJ0SWQgPSAodmlldyBhcyBTaW5nbGVDaGFydFZpZXdEZWZpbml0aW9uKS5jaGFydENvbnRyb2xJZCB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNpbmdsZUNoYXJ0SWQgJiYgc2luZ2xlVGFibGVJZCkge1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0aWYgKHNpbmdsZVRhYmxlSWQgfHwgc2luZ2xlQ2hhcnRJZCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjaGFydElkOiBzaW5nbGVDaGFydElkLFxuXHRcdFx0dGFibGVJZDogc2luZ2xlVGFibGVJZFxuXHRcdH07XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW1LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQSxzQkFBc0IsQ0FBQ0MsS0FBaUMsRUFBd0I7SUFDeEYsTUFBTUMsTUFBNEIsR0FBRyxFQUFFO0lBQ3ZDRCxLQUFLLENBQUNFLE9BQU8sQ0FBQyxVQUFVQyxJQUFJLEVBQUU7TUFDN0IsSUFBSSxDQUFFQSxJQUFJLENBQTBCQyxJQUFJLEVBQUU7UUFDekMsTUFBTUMsY0FBYyxHQUFJRixJQUFJLENBQTRCRyxzQkFBc0IsR0FDMUVILElBQUksQ0FBNEJHLHNCQUFzQixDQUFDRCxjQUFjLEdBQ3JFRixJQUFJLENBQTBCSSxZQUFZLENBQUNGLGNBQWM7UUFFN0RBLGNBQWMsQ0FBQ0gsT0FBTyxDQUFDLFVBQVVNLGFBQWEsRUFBRTtVQUMvQyxJQUFJQSxhQUFhLENBQUNKLElBQUksS0FBS0ssaUJBQWlCLENBQUNDLEtBQUssRUFBRTtZQUNuRFQsTUFBTSxDQUFDVSxJQUFJLENBQUNILGFBQWEsQ0FBQztVQUMzQjtRQUNELENBQUMsQ0FBQztNQUNIO0lBQ0QsQ0FBQyxDQUFDO0lBQ0YsT0FBT1AsTUFBTTtFQUNkO0VBRUEsU0FBU1csc0JBQXNCLENBQUNaLEtBQWlDLEVBQXdCO0lBQ3hGLE1BQU1hLE1BQTRCLEdBQUcsRUFBRTtJQUN2Q2IsS0FBSyxDQUFDRSxPQUFPLENBQUMsVUFBVUMsSUFBSSxFQUFFO01BQzdCLElBQUksQ0FBRUEsSUFBSSxDQUEwQkMsSUFBSSxFQUFFO1FBQ3pDLE1BQU1DLGNBQWMsR0FBSUYsSUFBSSxDQUE0Qlcsb0JBQW9CLEdBQ3hFWCxJQUFJLENBQTRCVyxvQkFBb0IsQ0FBQ1QsY0FBYyxHQUNuRUYsSUFBSSxDQUEwQkksWUFBWSxDQUFDRixjQUFjO1FBRTdEQSxjQUFjLENBQUNILE9BQU8sQ0FBQyxVQUFVTSxhQUFhLEVBQUU7VUFDL0MsSUFBSUEsYUFBYSxDQUFDSixJQUFJLEtBQUtLLGlCQUFpQixDQUFDTSxLQUFLLEVBQUU7WUFDbkRGLE1BQU0sQ0FBQ0YsSUFBSSxDQUFDSCxhQUFhLENBQUM7VUFDM0I7UUFDRCxDQUFDLENBQUM7TUFDSDtJQUNELENBQUMsQ0FBQztJQUNGLE9BQU9LLE1BQU07RUFDZDtFQUVBLE1BQU1HLHVCQUF1QixHQUFHLFVBQVVDLFlBQXNELEVBQXVDO0lBQ3RJLE1BQU1DLG9CQUF5QixHQUFHLENBQUMsQ0FBQztJQUNwQyxLQUFLLE1BQU1DLFdBQVcsSUFBSUYsWUFBWSxFQUFFO01BQUE7TUFDdkMsNkJBQUlBLFlBQVksQ0FBQ0UsV0FBVyxDQUFDLDRFQUF6QixzQkFBMkJDLFFBQVEsNkVBQW5DLHVCQUFxQ0MsYUFBYSxtREFBbEQsdUJBQW9EQyxNQUFNLEVBQUU7UUFBQTtRQUMvREosb0JBQW9CLENBQUNDLFdBQVcsQ0FBQyw2QkFBR0YsWUFBWSxDQUFDRSxXQUFXLENBQUMscUZBQXpCLHVCQUEyQkMsUUFBUSwyREFBbkMsdUJBQXFDQyxhQUFhO01BQ3ZGO0lBQ0Q7SUFDQSxPQUFPSCxvQkFBb0I7RUFDNUIsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0ssbUNBQW1DLENBQzNDQyxVQUFzQixFQUN0QkMsZ0JBQWtDLEVBQ2xDQyxNQUFlLEVBQzZEO0lBQzVFLE1BQU1DLGNBQWMsR0FBR0YsZ0JBQWdCLENBQUNHLGtCQUFrQixFQUFFLENBQUNDLGdDQUFnQyxFQUFFO0lBQy9GLE1BQU1DLDRCQUE0QixHQUFHQywrQkFBK0IsQ0FBQ1AsVUFBVSxFQUFFRyxjQUFjLEVBQUVGLGdCQUFnQixDQUFDO0lBQ2xILE1BQU1PLFlBQVksR0FBRywrREFBK0Q7SUFDcEYsSUFBSUwsY0FBYyxJQUFJRyw0QkFBNEIsRUFBRTtNQUNuRCxNQUFNRyxtQkFBbUIsR0FBR0gsNEJBQTRCLENBQUNJLG1CQUFtQjtNQUM1RSxJQUFJLENBQUNELG1CQUFtQixFQUFFO1FBQ3pCLE1BQU0sSUFBSUUsS0FBSyxDQUFDLDZFQUE2RSxDQUFDO01BQy9GO01BQ0EsTUFBTUMsWUFBWSxHQUFHQyx1QkFBdUIsQ0FBQ0osbUJBQW1CLEVBQUVQLE1BQU0sQ0FBQztNQUN6RSxJQUFJLENBQUNVLFlBQVksRUFBRTtRQUNsQixJQUFJVixNQUFNLEVBQUU7VUFDWCxNQUFNLElBQUlTLEtBQUssQ0FBQ0gsWUFBWSxDQUFDO1FBQzlCLENBQUMsTUFBTTtVQUNOLE9BQU9NLFNBQVM7UUFDakI7TUFDRDtNQUNBLElBQUlDLGdDQUFnQyxDQUFDVCw0QkFBNEIsRUFBRUosTUFBTSxDQUFDLEVBQUU7UUFDM0UsT0FBT0ksNEJBQTRCO01BQ3BDO0lBQ0Q7SUFDQSxJQUFJQSw0QkFBNEIsRUFBRTtNQUNqQyxJQUFJUyxnQ0FBZ0MsQ0FBQ1QsNEJBQTRCLEVBQUVKLE1BQU0sQ0FBQyxFQUFFO1FBQzNFLE9BQU9JLDRCQUE0QjtNQUNwQyxDQUFDLE1BQU0sSUFBSUosTUFBTSxFQUFFO1FBQ2xCLE1BQU0sSUFBSVMsS0FBSyxDQUFDSCxZQUFZLENBQUM7TUFDOUI7SUFDRDtJQUNBLE1BQU1DLG1CQUFtQixHQUFHTyw2QkFBNkIsQ0FBQ2hCLFVBQVUsQ0FBQztJQUNyRSxJQUFJUyxtQkFBbUIsRUFBRTtNQUN4QixJQUFJSSx1QkFBdUIsQ0FBQ0osbUJBQW1CLEVBQUVQLE1BQU0sQ0FBQyxFQUFFO1FBQ3pELE9BQU9PLG1CQUFtQjtNQUMzQixDQUFDLE1BQU0sSUFBSVAsTUFBTSxFQUFFO1FBQ2xCLE1BQU0sSUFBSVMsS0FBSyxDQUFDSCxZQUFZLENBQUM7TUFDOUI7SUFDRDtJQUNBLElBQUksQ0FBQ04sTUFBTSxFQUFFO01BQ1osTUFBTWUsZUFBZSxHQUFHQyxrQkFBa0IsQ0FBQ2xCLFVBQVUsQ0FBQztNQUN0RCxJQUFJaUIsZUFBZSxFQUFFO1FBQ3BCLE9BQU9BLGVBQWU7TUFDdkI7SUFDRDtJQUNBLE9BQU9ILFNBQVM7RUFDakI7RUFFQSxNQUFNSyxPQUFPLEdBQUcsVUFBVUMsMEJBQWlELEVBQTRCO0lBQ3RHLElBQUlDLE1BQU0sR0FBR0QsMEJBQTBCO0lBQ3ZDLElBQUlDLE1BQU0sQ0FBQ3BCLGdCQUFnQixFQUFFO01BQUE7TUFDNUIsSUFBSUEsZ0JBQWdCLEdBQUdvQixNQUFNLENBQUNwQixnQkFBZ0I7TUFDOUNvQixNQUFNLEdBQUdBLE1BQXFDO01BQzlDLE1BQU1DLDJCQUEyQixHQUFHLFVBQVVDLGFBQWdDLEVBQThDO1FBQzNILE9BQVFBLGFBQWEsQ0FBK0JDLEdBQUcsS0FBS1YsU0FBUztNQUN0RSxDQUFDO01BQ0QsSUFBSS9CLFlBQXlDLEdBQUcwQyxpQ0FBaUMsQ0FDaEZKLE1BQU0sQ0FBQ0ssVUFBVSxHQUNkekIsZ0JBQWdCLENBQUMwQix5QkFBeUIsQ0FBQ04sTUFBTSxDQUFDSyxVQUFVLENBQUNFLGtCQUFrQixFQUFFM0IsZ0JBQWdCLENBQUM0QixhQUFhLEVBQUUsQ0FBQyxHQUNsSCxFQUFFLEVBQ0wsSUFBSSxFQUNKNUIsZ0JBQWdCLEVBQ2hCb0IsTUFBTSxFQUNOUCxTQUFTLEVBQ1RBLFNBQVMsRUFDVFEsMkJBQTJCLENBQUNELE1BQU0sQ0FBQyxDQUNuQztNQUNELElBQUlTLGNBQWMsR0FBRyxFQUFFO01BQ3ZCLElBQUlDLGNBQWMsR0FBRyxFQUFFO01BQ3ZCLElBQUlDLEtBQXlCLEdBQUcsRUFBRTtNQUNsQyxJQUFJQyxvQkFBb0IsR0FBRyxFQUFFO01BQzdCLE1BQU1DLG1CQUFtQixHQUFHLFVBQVVDLG1CQUFnRCxFQUFFQyxTQUFtQixFQUFFO1FBQzVHLElBQUlDLG9CQUFvQjtRQUN4QixLQUFLLE1BQU1yRCxhQUFhLElBQUltRCxtQkFBbUIsQ0FBQ3RELGNBQWMsRUFBRTtVQUMvRCxJQUFJdUQsU0FBUyxJQUFJcEQsYUFBYSxDQUFDSixJQUFJLEtBQUtLLGlCQUFpQixDQUFDTSxLQUFLLEVBQUU7WUFDaEU4QyxvQkFBb0IsR0FBR3JELGFBQWE7WUFDcEM7VUFDRDtVQUNBLElBQUksQ0FBQ29ELFNBQVMsSUFBSXBELGFBQWEsQ0FBQ0osSUFBSSxLQUFLSyxpQkFBaUIsQ0FBQ0MsS0FBSyxFQUFFO1lBQ2pFbUQsb0JBQW9CLEdBQUdyRCxhQUFhO1lBQ3BDO1VBQ0Q7UUFDRDtRQUNBLE1BQU1zRCxtQkFBbUIsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVMLG1CQUFtQixDQUFDO1FBQ2xFLElBQUlFLG9CQUFvQixFQUFFO1VBQ3pCQyxtQkFBbUIsQ0FBQ3pELGNBQWMsR0FBRyxDQUFDd0Qsb0JBQW9CLENBQUM7UUFDNUQsQ0FBQyxNQUFNO1VBQ04sTUFBTSxJQUFJMUIsS0FBSyxDQUFDLENBQUN5QixTQUFTLEdBQUcsU0FBUyxHQUFHLFdBQVcsSUFBSSw2QkFBNkIsSUFBSUEsU0FBUyxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQztRQUN6SDtRQUNBLE9BQU9FLG1CQUFtQjtNQUMzQixDQUFDO01BQ0QsTUFBTUcsZUFBZSxHQUFHLFVBQVVDLElBQWlDLEVBQUVOLFNBQWtCLEVBQUU7UUFDeEYsTUFBTU8sY0FBYyxHQUFHMUMsZ0JBQWdCLENBQUMyQyx1QkFBdUIsQ0FBQ0YsSUFBSSxDQUFDdkMsY0FBYyxDQUFDO1FBQ3BGLE1BQU0wQyxnQkFBZ0IsR0FBR0YsY0FBYyxDQUFDakIsVUFBMEM7UUFDbEZ6QixnQkFBZ0IsR0FBRzBDLGNBQWMsQ0FBQzFDLGdCQUFnQjtRQUNsRCxNQUFNeUIsVUFBVSxHQUFHbUIsZ0JBQWdCO1FBQ25DLElBQUluQixVQUFVLElBQUl6QixnQkFBZ0IsQ0FBQzZDLGVBQWUsRUFBRSxLQUFLQyxZQUFZLENBQUNDLGtCQUFrQixFQUFFO1VBQ3pGakUsWUFBWSxHQUFHMEMsaUNBQWlDLENBQy9DQyxVQUFVLEdBQ1B6QixnQkFBZ0IsQ0FBQzBCLHlCQUF5QixDQUFDRCxVQUFVLENBQUNFLGtCQUFrQixFQUFFM0IsZ0JBQWdCLENBQUM0QixhQUFhLEVBQUUsQ0FBQyxHQUMzRyxFQUFFLEVBQ0wsSUFBSSxFQUNKNUIsZ0JBQWdCLEVBQ2hCb0IsTUFBTSxDQUNOO1VBQ0QsT0FBT3RDLFlBQVk7UUFDcEIsQ0FBQyxNQUFNO1VBQ04sTUFBTWtFLE1BQU0sR0FDWCwwQkFBMEIsSUFDekJiLFNBQVMsR0FBRyxTQUFTLEdBQUcsV0FBVyxDQUFDLEdBQ3JDLHVEQUF1RDtVQUN4RCxNQUFNLElBQUl6QixLQUFLLENBQUNzQyxNQUFNLENBQUM7UUFDeEI7TUFDRCxDQUFDO01BQ0QsTUFBTUMsYUFBYSxHQUFHLFVBQ3JCQyxhQUE0QyxFQUM1Q0MsV0FBeUQsRUFDeEQ7UUFBQTtRQUNELE1BQU05RCxvQkFBNkQsR0FBRzRDLG1CQUFtQixDQUFDaUIsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztRQUNqSHBCLGNBQWMsR0FBSXpDLG9CQUFvQixhQUFwQkEsb0JBQW9CLGdEQUFwQkEsb0JBQW9CLENBQUVULGNBQWMsQ0FBQyxDQUFDLENBQUMsMERBQXhDLHNCQUFpRXdFLEVBQUU7UUFDcEYsTUFBTXZFLHNCQUErRCxHQUFHb0QsbUJBQW1CLENBQzFGaUIsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUdBLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFDdEQsS0FBSyxDQUNMO1FBQ0RyQixjQUFjLEdBQUloRCxzQkFBc0IsYUFBdEJBLHNCQUFzQixnREFBdEJBLHNCQUFzQixDQUFFRCxjQUFjLENBQUMsQ0FBQyxDQUFDLG9GQUExQyxzQkFBbUU2QyxVQUFVLDJEQUE3RSx1QkFBK0UyQixFQUFFO1FBQ2xHLElBQUkvRCxvQkFBb0IsSUFBSVIsc0JBQXNCLEVBQUU7VUFDbkR1QyxNQUFNLEdBQUdBLE1BQStCO1VBQ3hDLE1BQU1pQyxPQUFPLEdBQUdqQyxNQUFNLENBQUNpQyxPQUFPO1VBQzlCLE1BQU0zRSxJQUE0QixHQUFHO1lBQ3BDVyxvQkFBb0I7WUFDcEJSLHNCQUFzQjtZQUN0QmdELGNBQWM7WUFDZEMsY0FBYztZQUNkcUIsV0FBVztZQUNYRTtVQUNELENBQUM7VUFDRCxPQUFPM0UsSUFBSTtRQUNaO01BQ0QsQ0FBQztNQUNELElBQUksa0JBQUFJLFlBQVksMkVBQVosY0FBY0YsY0FBYywwREFBNUIsc0JBQThCaUIsTUFBTSxNQUFLLENBQUMsSUFBSUcsZ0JBQWdCLENBQUM2QyxlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDQyxrQkFBa0IsRUFBRTtRQUN6SCxNQUFNckUsSUFBd0MsR0FBR3VFLGFBQWEsQ0FBQyxDQUFDbkUsWUFBWSxDQUFDLEVBQUUsTUFBTSxDQUFDO1FBQ3RGLElBQUlKLElBQUksRUFBRTtVQUNULE9BQU9BLElBQUk7UUFDWjtNQUNELENBQUMsTUFBTSxJQUNOc0IsZ0JBQWdCLENBQUNHLGtCQUFrQixFQUFFLENBQUNtRCx5QkFBeUIsQ0FBQ2xDLE1BQU0sQ0FBMEIsSUFDaEdwQixnQkFBZ0IsQ0FBQzZDLGVBQWUsRUFBRSxLQUFLQyxZQUFZLENBQUNDLGtCQUFrQixFQUNyRTtRQUNELE1BQU07VUFBRVEsT0FBTztVQUFFQztRQUFVLENBQUMsR0FBR3BDLE1BQXVDO1FBQ3RFLElBQUltQyxPQUFPLElBQUlBLE9BQU8sQ0FBQzFELE1BQU0sSUFBSTJELFNBQVMsSUFBSUEsU0FBUyxDQUFDM0QsTUFBTSxFQUFFO1VBQy9ELE1BQU1uQixJQUF3QyxHQUFHdUUsYUFBYSxDQUM3RCxDQUFDVCxlQUFlLENBQUNlLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRWYsZUFBZSxDQUFDZ0IsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQ3hFcEMsTUFBTSxDQUFtQytCLFdBQVcsQ0FDckQ7VUFDRCxJQUFJekUsSUFBSSxFQUFFO1lBQ1QsT0FBT0EsSUFBSTtVQUNaO1FBQ0QsQ0FBQyxNQUFNO1VBQ04sTUFBTSxJQUFJZ0MsS0FBSyxDQUFDLDRDQUE0QyxDQUFDO1FBQzlEO01BQ0QsQ0FBQyxNQUFNLElBQUlXLDJCQUEyQixDQUFDRCxNQUFNLENBQUMsRUFBRTtRQUMvQztRQUNBLE1BQU1zQixjQUFjLEdBQUcxQyxnQkFBZ0IsQ0FBQzJDLHVCQUF1QixDQUFFdkIsTUFBTSxDQUFpQ2xCLGNBQWMsQ0FBQztRQUN2SCxNQUFNdUQsY0FBK0IsR0FBR2YsY0FBYyxDQUFDakIsVUFBVTtRQUNqRXpCLGdCQUFnQixHQUFHMEMsY0FBYyxDQUFDMUMsZ0JBQWdCO1FBQ2xEK0IsS0FBSyxHQUFHMkIsaUJBQWlCLENBQUNDLDJCQUEyQixDQUFDRixjQUFjLENBQUNHLElBQUksQ0FBQyxDQUFDO1FBQzNFO1FBQ0E5RSxZQUFZLENBQUNGLGNBQWMsQ0FBQ0gsT0FBTyxDQUFDLENBQUNvRix1QkFBdUIsRUFBRUMsS0FBSyxLQUFLO1VBQ3ZFLFFBQVFELHVCQUF1QixDQUFDbEYsSUFBSTtZQUNuQyxLQUFLSyxpQkFBaUIsQ0FBQ0MsS0FBSztjQUMzQixNQUFNOEUsa0JBQWtCLEdBQUdqRixZQUFZLENBQUNGLGNBQWMsQ0FBQ2tGLEtBQUssQ0FBdUI7Y0FDbkYsTUFBTUUsT0FBTyxHQUFHRCxrQkFBa0IsQ0FBQ0UsT0FBTyxDQUFDRCxPQUFPLElBQUksQ0FBQyxDQUFDO2NBQ3hEQSxPQUFPLENBQUNFLGFBQWEsR0FBR0YsT0FBTyxDQUFDRSxhQUFhLElBQUk7Z0JBQUVDLEtBQUssRUFBRTtjQUFHLENBQUM7Y0FDOUQsSUFBSSxDQUFFL0MsTUFBTSxDQUFpQ2dELDJCQUEyQixFQUFFO2dCQUN6RTtnQkFDQUwsa0JBQWtCLENBQUN0QyxVQUFVLENBQUMyQixFQUFFLEdBQUdpQixVQUFVLENBQUVqRCxNQUFNLENBQWlDRyxHQUFHLElBQUksRUFBRSxFQUFFLFVBQVUsQ0FBQztjQUM3RztjQUNBSCxNQUFNLEdBQUdBLE1BQXFDO2NBQzlDLElBQUlBLE1BQU0sSUFBSUEsTUFBTSxDQUFDSyxVQUFVLElBQUlMLE1BQU0sQ0FBQ0ssVUFBVSxDQUFDNkMsSUFBSSw4REFBbUQsRUFBRTtnQkFDN0d0QyxvQkFBb0IsR0FBSSxJQUFHWixNQUFNLENBQUNLLFVBQVUsQ0FBQzhDLGdCQUFnQixDQUFDNUMsa0JBQWtCLENBQUM2QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFLEVBQUM7Y0FDakcsQ0FBQyxNQUFNO2dCQUNOeEMsb0JBQW9CLEdBQUlaLE1BQU0sQ0FBaUNsQixjQUFjO2NBQzlFO2NBQ0E7Y0FDQTtjQUNBO2NBQ0E7Y0FDQTtjQUNBOEQsT0FBTyxDQUFDRSxhQUFhLENBQUNDLEtBQUssQ0FBQ2pGLElBQUksQ0FBQztnQkFBRWdCLGNBQWMsRUFBRThCO2NBQXFCLENBQUMsQ0FBQztjQUMxRStCLGtCQUFrQixDQUFDRSxPQUFPLENBQUNELE9BQU8sR0FBR0EsT0FBTztjQUM1QztZQUNELEtBQUtoRixpQkFBaUIsQ0FBQ00sS0FBSztjQUMzQixNQUFNbUYsa0JBQWtCLEdBQUczRixZQUFZLENBQUNGLGNBQWMsQ0FBQ2tGLEtBQUssQ0FBdUI7Y0FDbkZXLGtCQUFrQixDQUFDckIsRUFBRSxHQUFHc0IsVUFBVSxDQUFFdEQsTUFBTSxDQUFpQ0csR0FBRyxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUM7Y0FDOUZrRCxrQkFBa0IsQ0FBQ0UsVUFBVSxHQUFHLElBQUk7Y0FDcEM7WUFDRDtjQUNDO1VBQU07UUFFVCxDQUFDLENBQUM7TUFDSDtNQUNBN0YsWUFBWSxDQUFDRixjQUFjLENBQUNILE9BQU8sQ0FBRW9GLHVCQUF1QixJQUFLO1FBQ2hFLElBQUlBLHVCQUF1QixDQUFDbEYsSUFBSSxLQUFLSyxpQkFBaUIsQ0FBQ0MsS0FBSyxFQUFFO1VBQzdENEMsY0FBYyxHQUFHZ0MsdUJBQXVCLENBQUNwQyxVQUFVLENBQUMyQixFQUFFO1FBQ3ZELENBQUMsTUFBTSxJQUFJUyx1QkFBdUIsQ0FBQ2xGLElBQUksS0FBS0ssaUJBQWlCLENBQUNNLEtBQUssRUFBRTtVQUNwRXdDLGNBQWMsR0FBRytCLHVCQUF1QixDQUFDVCxFQUFFO1FBQzVDO01BQ0QsQ0FBQyxDQUFDO01BQ0ZoQyxNQUFNLEdBQUdBLE1BQStCO01BQ3hDLE1BQU1pQyxPQUFPLEdBQUdqQyxNQUFNLENBQUNpQyxPQUFPO01BQzlCLE9BQU87UUFDTnZFLFlBQVk7UUFDWitDLGNBQWM7UUFDZEMsY0FBYztRQUNkQyxLQUFLO1FBQ0xDLG9CQUFvQjtRQUNwQnFCO01BQ0QsQ0FBQztJQUNGLENBQUMsTUFBTTtNQUNOakMsTUFBTSxHQUFHQSxNQUFpQztNQUMxQyxNQUFNVyxLQUFLLEdBQUdYLE1BQU0sQ0FBQ3dELEtBQUs7UUFDekJDLFFBQVEsR0FBR3pELE1BQU0sQ0FBQzBELFFBQVE7UUFDMUJuRyxJQUFJLEdBQUd5QyxNQUFNLENBQUN6QyxJQUFJO1FBQ2xCb0csV0FBVyxHQUFHQyxjQUFjLENBQUM1RCxNQUFNLENBQUNHLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDOUM4QixPQUFPLEdBQUdqQyxNQUFNLENBQUNpQyxPQUFPO01BQ3pCLE9BQU87UUFDTnRCLEtBQUs7UUFDTDhDLFFBQVE7UUFDUmxHLElBQUk7UUFDSm9HLFdBQVc7UUFDWDFCO01BQ0QsQ0FBQztJQUNGO0VBQ0QsQ0FBQztFQUVELE1BQU00QixRQUFRLEdBQUcsVUFDaEJqRixnQkFBa0MsRUFDbENrRixhQUFxRCxFQUN4QjtJQUM3QixJQUFJQyxvQkFBNkMsR0FBRyxFQUFFO0lBQ3RELElBQUlELGFBQWEsRUFBRTtNQUNsQkEsYUFBYSxDQUFDZixLQUFLLENBQUMxRixPQUFPLENBQUUyRyxJQUE2RCxJQUFLO1FBQzlGLElBQUlwRixnQkFBZ0IsQ0FBQ0csa0JBQWtCLEVBQUUsQ0FBQ21ELHlCQUF5QixDQUFDOEIsSUFBSSxDQUEwQixFQUFFO1VBQ25HLElBQUlGLGFBQWEsQ0FBQ2YsS0FBSyxDQUFDdEUsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuQyxNQUFNLElBQUlhLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQztVQUN6RCxDQUFDLE1BQU07WUFDTjBFLElBQUksR0FBR0EsSUFBcUM7WUFDNUNELG9CQUFvQixDQUFDakcsSUFBSSxDQUFDO2NBQ3pCYyxnQkFBZ0IsRUFBRUEsZ0JBQWdCO2NBQ2xDdUQsT0FBTyxFQUFFNkIsSUFBSSxDQUFDN0IsT0FBTztjQUNyQkMsU0FBUyxFQUFFNEIsSUFBSSxDQUFDNUIsU0FBUztjQUN6QkwsV0FBVyxFQUFFaUMsSUFBSSxDQUFDakM7WUFDbkIsQ0FBQyxDQUFDO1VBQ0g7UUFDRCxDQUFDLE1BQU0sSUFBS2lDLElBQUksQ0FBNkJOLFFBQVEsRUFBRTtVQUN0RE0sSUFBSSxHQUFHQSxJQUErQjtVQUN0Q0Qsb0JBQW9CLENBQUNqRyxJQUFJLENBQUM7WUFDekJxQyxHQUFHLEVBQUU2RCxJQUFJLENBQUM3RCxHQUFHO1lBQ2JxRCxLQUFLLEVBQUVRLElBQUksQ0FBQ1IsS0FBSztZQUNqQkUsUUFBUSxFQUFFTSxJQUFJLENBQUNOLFFBQVE7WUFDdkJuRyxJQUFJLEVBQUUsUUFBUTtZQUNkMEUsT0FBTyxFQUFFK0IsSUFBSSxDQUFDL0I7VUFDZixDQUFDLENBQUM7UUFDSCxDQUFDLE1BQU07VUFDTitCLElBQUksR0FBR0EsSUFBbUM7VUFDMUMsTUFBTUMsb0JBQW9CLEdBQUdyRixnQkFBZ0IsQ0FBQ3NGLHNCQUFzQixDQUNsRUYsSUFBSSxDQUFDRyxXQUFXLElBQUtILElBQUksQ0FBQ0ksU0FBUyxJQUFLLElBQUdKLElBQUksQ0FBQ0ksU0FBVSxFQUFFLElBQUl4RixnQkFBZ0IsQ0FBQ3lGLGNBQWMsRUFBRSxDQUNqRztZQUNEMUYsVUFBVSxHQUFHc0Ysb0JBQW9CLENBQUN6RCxhQUFhLEVBQUU7VUFFbEQsSUFBSTdCLFVBQVUsSUFBSXNGLG9CQUFvQixFQUFFO1lBQ3ZDLElBQUk1RCxVQUFVO1lBQ2QsTUFBTWlCLGNBQWMsR0FBRzJDLG9CQUFvQixDQUFDMUMsdUJBQXVCLENBQUN5QyxJQUFJLENBQUNsRixjQUFjLENBQUM7WUFDeEYsTUFBTTBDLGdCQUFnQixHQUFHRixjQUFjLENBQUNqQixVQUEwQztZQUNsRixJQUFJbUIsZ0JBQWdCLEVBQUU7Y0FDckJuQixVQUFVLEdBQ1RtQixnQkFBZ0IsQ0FBQzBCLElBQUksa0RBQXVDLEdBQ3pEeEUsbUNBQW1DLENBQUNDLFVBQVUsRUFBRXNGLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxHQUM1RXpDLGdCQUFnQjtjQUNwQnVDLG9CQUFvQixDQUFDakcsSUFBSSxDQUFDO2dCQUN6QmMsZ0JBQWdCLEVBQUVxRixvQkFBb0I7Z0JBQ3RDNUQsVUFBVTtnQkFDVnZCLGNBQWMsRUFBRWtGLElBQUksQ0FBQ2xGLGNBQWM7Z0JBQ25Da0UsMkJBQTJCLEVBQUVnQixJQUFJLENBQUNoQiwyQkFBMkI7Z0JBQzdEN0MsR0FBRyxFQUFFNkQsSUFBSSxDQUFDN0QsR0FBRztnQkFDYjhCLE9BQU8sRUFBRStCLElBQUksQ0FBQy9CO2NBQ2YsQ0FBQyxDQUFDO1lBQ0g7VUFDRCxDQUFDLE1BQU07WUFDTjtVQUFBO1FBRUY7TUFDRCxDQUFDLENBQUM7SUFDSCxDQUFDLE1BQU07TUFDTixNQUFNdEQsVUFBVSxHQUFHQyxnQkFBZ0IsQ0FBQzRCLGFBQWEsRUFBRTtNQUNuRCxJQUFJNUIsZ0JBQWdCLENBQUM2QyxlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDQyxrQkFBa0IsRUFBRTtRQUMzRW9DLG9CQUFvQixHQUFHTyxnQkFBZ0IsQ0FBQzFGLGdCQUFnQixFQUFFbUYsb0JBQW9CLENBQUM7TUFDaEYsQ0FBQyxNQUFNO1FBQ05BLG9CQUFvQixDQUFDakcsSUFBSSxDQUFDO1VBQ3pCdUMsVUFBVSxFQUFFM0IsbUNBQW1DLENBQUNDLFVBQVUsRUFBRUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDO1VBQ3BGQSxnQkFBZ0IsRUFBRUE7UUFDbkIsQ0FBQyxDQUFDO01BQ0g7SUFDRDtJQUNBLE9BQU9tRixvQkFBb0IsQ0FBQ1EsR0FBRyxDQUFFQyxtQkFBbUIsSUFBSztNQUN4RCxPQUFPMUUsT0FBTyxDQUFDMEUsbUJBQW1CLENBQUM7SUFDcEMsQ0FBQyxDQUFDO0VBQ0gsQ0FBQztFQUVELE1BQU1DLG9CQUFvQixHQUFHLFVBQzVCN0YsZ0JBQWtDLEVBQ2xDekIsS0FBaUMsRUFDWTtJQUM3QyxNQUFNdUgsZUFBZSxHQUFHOUYsZ0JBQWdCLENBQUNHLGtCQUFrQixFQUFFO0lBQzdELE1BQU00RixlQUF1RCxHQUFHRCxlQUFlLENBQUNFLG9CQUFvQixFQUFFO0lBQ3RHLElBQUl6SCxLQUFLLENBQUNzQixNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUNvRyxzQkFBc0IsQ0FBQ2pHLGdCQUFnQixDQUFDLEVBQUU7TUFDbEUsT0FBTztRQUNOa0csYUFBYSxFQUFFSCxlQUFlLEdBQUcsQ0FBQUEsZUFBZSxhQUFmQSxlQUFlLHVCQUFmQSxlQUFlLENBQUVJLFVBQVUsS0FBSUwsZUFBZSxDQUFDTSxxQkFBcUIsRUFBRSxHQUFHdkYsU0FBUztRQUFFO1FBQ3JIdUMsRUFBRSxFQUFFaUQsZUFBZTtNQUNwQixDQUFDO0lBQ0Y7SUFDQSxPQUFPeEYsU0FBUztFQUNqQixDQUFDO0VBRUQsU0FBUzZFLGdCQUFnQixDQUFDMUYsZ0JBQWtDLEVBQUVzRyxXQUFvQyxFQUEyQjtJQUM1SCxNQUFNdkcsVUFBVSxHQUFHQyxnQkFBZ0IsQ0FBQzRCLGFBQWEsRUFBRTtJQUNuRCxNQUFNSCxVQUFVLEdBQUczQixtQ0FBbUMsQ0FBQ0MsVUFBVSxFQUFFQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUM7SUFDMUYsSUFBSXVHLEtBQUssRUFBRUMsS0FBSztJQUNoQixJQUFJL0UsVUFBVSxFQUFFO01BQ2Y2RSxXQUFXLENBQUNwSCxJQUFJLENBQUM7UUFDaEJ1QyxVQUFVLEVBQUVBLFVBQVU7UUFDdEJ6QjtNQUNELENBQUMsQ0FBQztJQUNILENBQUMsTUFBTTtNQUNOdUcsS0FBSyxHQUFHRSxlQUFlLENBQUMxRyxVQUFVLENBQUM7TUFDbkN5RyxLQUFLLEdBQUd2RixrQkFBa0IsQ0FBQ2xCLFVBQVUsQ0FBQztNQUN0QyxJQUFJd0csS0FBSyxJQUFJQyxLQUFLLEVBQUU7UUFDbkIsTUFBTWpELE9BQXNDLEdBQUcsQ0FBQztVQUFFckQsY0FBYyxFQUFFLEdBQUcsR0FBR3FHLEtBQUssQ0FBQ2pDO1FBQUssQ0FBQyxDQUFDO1FBQ3JGLE1BQU1kLFNBQXdDLEdBQUcsQ0FBQztVQUFFdEQsY0FBYyxFQUFFLEdBQUcsR0FBR3NHLEtBQUssQ0FBQ2xDO1FBQUssQ0FBQyxDQUFDO1FBQ3ZGZ0MsV0FBVyxDQUFDcEgsSUFBSSxDQUFDO1VBQ2hCYyxnQkFBZ0IsRUFBRUEsZ0JBQWdCO1VBQ2xDdUQsT0FBTyxFQUFFQSxPQUFPO1VBQ2hCQyxTQUFTLEVBQUVBLFNBQVM7VUFDcEJMLFdBQVcsRUFBRTtRQUNkLENBQUMsQ0FBQztNQUNILENBQUMsTUFBTTtRQUNOLE1BQU0sSUFBSXpDLEtBQUssQ0FBQywrREFBK0QsQ0FBQztNQUNqRjtJQUNEO0lBQ0EsT0FBTzRGLFdBQVc7RUFDbkI7RUFFQSxTQUFTTCxzQkFBc0IsQ0FBQ2pHLGdCQUFrQyxFQUFXO0lBQzVFLE9BQ0NBLGdCQUFnQixDQUFDRyxrQkFBa0IsRUFBRSxDQUFDbUQseUJBQXlCLEVBQUUsSUFDakV0RCxnQkFBZ0IsQ0FBQzZDLGVBQWUsRUFBRSxLQUFLQyxZQUFZLENBQUNDLGtCQUFrQjtFQUV4RTtFQUVPLE1BQU0yRCxnQkFBZ0IsR0FBRyxVQUFVMUcsZ0JBQWtDLEVBQWdCO0lBQzNGLE1BQU04RixlQUFlLEdBQUc5RixnQkFBZ0IsQ0FBQ0csa0JBQWtCLEVBQUU7SUFDN0QsT0FBT3dHLG9CQUFvQixDQUFDLEVBQUUsRUFBRUMsc0JBQXNCLENBQUNkLGVBQWUsQ0FBQ1ksZ0JBQWdCLEVBQUUsRUFBRTFHLGdCQUFnQixDQUFDLENBQUM2RyxPQUFPLENBQUM7RUFDdEgsQ0FBQztFQUFDO0VBRUssTUFBTUMscUJBQXFCLEdBQUcsVUFBVXZJLEtBQWlDLEVBQUV3SSxXQUFtQixFQUFFO0lBQ3RHeEksS0FBSyxDQUFDRSxPQUFPLENBQUVDLElBQUksSUFBSztNQUN2QixJQUFJLENBQUVBLElBQUksQ0FBMEJDLElBQUksRUFBRTtRQUN6QyxNQUFNRyxZQUF5QyxHQUFJSixJQUFJLENBQTBCSSxZQUFZO1FBQzdGQSxZQUFZLENBQUNGLGNBQWMsQ0FBQ0gsT0FBTyxDQUFFb0YsdUJBQXVCLElBQUs7VUFDaEUsSUFBSUEsdUJBQXVCLENBQUNsRixJQUFJLEtBQUtLLGlCQUFpQixDQUFDTSxLQUFLLElBQUl1RSx1QkFBdUIsQ0FBQ21ELFFBQVEsS0FBS0QsV0FBVyxFQUFFO1lBQ2pIbEQsdUJBQXVCLENBQUNtRCxRQUFRLEdBQUdELFdBQVc7VUFDL0M7UUFDRCxDQUFDLENBQUM7TUFDSDtJQUNELENBQUMsQ0FBQztFQUNILENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEE7RUFNTyxNQUFNRSxXQUFXLEdBQUcsVUFBVWpILGdCQUFrQyxFQUF3QjtJQUM5RixNQUFNRCxVQUFVLEdBQUdDLGdCQUFnQixDQUFDNEIsYUFBYSxFQUFFO0lBQ25ELE1BQU1zRixZQUFZLEdBQUdsSCxnQkFBZ0IsQ0FBQ3lGLGNBQWMsRUFBRTtJQUV0RCxJQUFJLENBQUN5QixZQUFZLEVBQUU7TUFDbEI7TUFDQSxNQUFNLElBQUl4RyxLQUFLLENBQ2QsdUhBQXVILENBQ3ZIO0lBQ0Y7SUFDQSxNQUFNb0YsZUFBZSxHQUFHOUYsZ0JBQWdCLENBQUNHLGtCQUFrQixFQUFFO0lBQzdELE1BQU00RixlQUF1RCxHQUFHRCxlQUFlLENBQUNFLG9CQUFvQixFQUFFO0lBQ3RHLE1BQU1JLHFCQUFxQixHQUFHTixlQUFlLENBQUNNLHFCQUFxQixFQUFFO0lBQ3JFLE1BQU03SCxLQUFpQyxHQUFHMEcsUUFBUSxDQUFDakYsZ0JBQWdCLEVBQUUrRixlQUFlLENBQUM7SUFDckYsTUFBTW9CLHFCQUFxQixHQUFHN0ksc0JBQXNCLENBQUNDLEtBQUssQ0FBQztJQUMzRCxNQUFNNkkscUJBQXFCLEdBQUdqSSxzQkFBc0IsQ0FBQ1osS0FBSyxDQUFDO0lBQzNELE1BQU04SSxrQkFBa0IsR0FBR0YscUJBQXFCLENBQUNHLElBQUksQ0FBRWQsS0FBSyxJQUFLQSxLQUFLLENBQUN2QyxPQUFPLENBQUN0RixJQUFJLEtBQUssaUJBQWlCLENBQUM7SUFDMUcsSUFBSTRJLGFBQWEsR0FBRyxFQUFFO0lBQ3RCLElBQUlDLGFBQWEsR0FBRyxFQUFFO0lBQ3RCLE1BQU1DLG1CQUFtQixHQUFHQyxzQkFBc0IsRUFBRTtJQUNwRCxNQUFNWCxXQUFXLEdBQUdZLGNBQWMsQ0FBQ1QsWUFBWSxDQUFDO0lBQ2hELE1BQU1VLHlCQUF5QixHQUFHQyw0QkFBNEIsQ0FBQ2QsV0FBVyxDQUFDO0lBQzNFLE1BQU1lLFFBQVEsR0FBR2hDLGVBQWUsQ0FBQ2lDLHNCQUFzQixFQUFFO0lBQ3pELE1BQU1DLG1CQUFtQixHQUFHLENBQUFGLFFBQVEsYUFBUkEsUUFBUSx1QkFBUkEsUUFBUSxDQUFFRyxhQUFhLE1BQUtwSCxTQUFTLEdBQUdpSCxRQUFRLGFBQVJBLFFBQVEsdUJBQVJBLFFBQVEsQ0FBRUcsYUFBYSxDQUFDQyxXQUFXLEVBQUUsR0FBRyxTQUFTO0lBQ3JILE1BQU1DLFlBQVksR0FBRyxDQUFBTCxRQUFRLGFBQVJBLFFBQVEsdUJBQVJBLFFBQVEsQ0FBRU0sTUFBTSxNQUFLdkgsU0FBUyxHQUFHaUgsUUFBUSxhQUFSQSxRQUFRLHVCQUFSQSxRQUFRLENBQUVNLE1BQU0sQ0FBQ0YsV0FBVyxFQUFFLEdBQUcsU0FBUztJQUNoRyxNQUFNRyxvQkFBb0IsR0FBR1AsUUFBUSxDQUFDTyxvQkFBb0IsS0FBS3hILFNBQVMsR0FBR2lILFFBQVEsQ0FBQ08sb0JBQW9CLEdBQUcsSUFBSTtJQUMvRyxNQUFNQyxlQUFlLEdBQUdSLFFBQVEsQ0FBQ1EsZUFBZSxLQUFLekgsU0FBUyxHQUFHaUgsUUFBUSxDQUFDUSxlQUFlLEdBQUcsS0FBSztJQUVqRyxNQUFNQyxPQUFPLEdBQUdDLGdCQUFnQixDQUFDeEksZ0JBQWdCLEVBQUV6QixLQUFLLENBQUM7SUFDekQsSUFBSWdLLE9BQU8sRUFBRTtNQUNaZixhQUFhLEdBQUdlLE9BQU8sQ0FBQ0UsT0FBTztNQUMvQmxCLGFBQWEsR0FBR2dCLE9BQU8sQ0FBQ0csT0FBTztJQUNoQztJQUVBLE1BQU1DLGtCQUFrQixHQUFHN0MsZUFBZSxDQUFDNkMsa0JBQWtCLEVBQUU7SUFDL0Q7SUFDQTtJQUNBLE1BQU1DLGFBQWEsR0FBRyxDQUFDOUMsZUFBZSxDQUFDK0MsaUJBQWlCLEVBQUUsSUFBSUYsa0JBQWtCLEtBQUtuQixhQUFhLEtBQUssRUFBRTtJQUN6RyxNQUFNc0Isa0JBQWtCLEdBQUdDLGtCQUFrQixDQUFDL0ksZ0JBQWdCLEVBQUVtSCxxQkFBcUIsQ0FBQztJQUN0RixNQUFNNkIsZUFBZSxHQUFHRixrQkFBa0IsQ0FBQ0UsZUFBZTtJQUMxRCxNQUFNQyxrQkFBa0IsR0FBR0gsa0JBQWtCLENBQUNJLGFBQWE7SUFDM0QsTUFBTUMsZUFBZSxHQUFHQywyQkFBMkIsQ0FBQ2pDLHFCQUFxQixFQUFFQyxxQkFBcUIsRUFBRXBILGdCQUFnQixDQUFDO0lBQ25ILE1BQU1xSixnQkFBZ0IsR0FBR3hELG9CQUFvQixDQUFDN0YsZ0JBQWdCLEVBQUV6QixLQUFLLENBQUM7SUFFdEUsTUFBTStLLGdCQUFnQixHQUFHRCxnQkFBZ0IsR0FBR3hJLFNBQVMsR0FBRzBJLG1CQUFtQixDQUFDeEosVUFBVSxFQUFFQyxnQkFBZ0IsQ0FBQztJQUN6RyxNQUFNUCxvQkFBb0IsR0FBRzRJLG9CQUFvQixHQUFHOUksdUJBQXVCLENBQUNpSyx1QkFBdUIsQ0FBQ3pKLFVBQVUsRUFBRUMsZ0JBQWdCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFdkk7SUFDQSxNQUFNeUosYUFBYSxHQUFHL0MsZ0JBQWdCLENBQUMxRyxnQkFBZ0IsQ0FBQztJQUN4RCxJQUFJb0cscUJBQXFCLEVBQUU7TUFDMUJVLHFCQUFxQixDQUFDdkksS0FBSyxFQUFFd0ksV0FBVyxDQUFDO0lBQzFDO0lBRUEsTUFBTTJDLGdCQUFnQixHQUFHdkMscUJBQXFCLENBQzVDeEIsR0FBRyxDQUFFNUcsYUFBYSxJQUFLO01BQ3ZCLE9BQU9BLGFBQWEsQ0FBQzBDLFVBQVUsQ0FBQzJCLEVBQUU7SUFDbkMsQ0FBQyxDQUFDLENBQ0R1RyxNQUFNLENBQ052QyxxQkFBcUIsQ0FBQ3pCLEdBQUcsQ0FBRTVHLGFBQWEsSUFBSztNQUM1QyxPQUFPQSxhQUFhLENBQUNxRSxFQUFFO0lBQ3hCLENBQUMsQ0FBQyxDQUNGO0lBQ0YsTUFBTXdHLGdCQUFnQixHQUFHLENBQ3hCLElBQUloQixhQUFhLElBQUksQ0FBQ0Qsa0JBQWtCLEdBQUcsRUFBRSxHQUFHLENBQUM1QixXQUFXLENBQUMsQ0FBQyxFQUM5RCxJQUFJakIsZUFBZSxDQUFDK0Qsb0JBQW9CLEVBQUUsS0FBS0MscUJBQXFCLENBQUNDLE9BQU8sR0FBR0wsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLEVBQ3JHLElBQUlMLGdCQUFnQixHQUFHLENBQUNBLGdCQUFnQixDQUFDakcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQ2xEO0lBRUQsTUFBTTRHLHVCQUF1QixHQUM1QlgsZ0JBQWdCLElBQUl2RCxlQUFlLENBQUNtRSxvQ0FBb0MsRUFBRSxHQUFHWixnQkFBZ0IsQ0FBQ2pHLEVBQUUsR0FBR3ZDLFNBQVM7SUFFN0csT0FBTztNQUNOcUosYUFBYSxFQUFFaEQsWUFBWTtNQUMzQmlELGNBQWMsRUFBRyxHQUFFakQsWUFBYSxHQUFFO01BQ2xDa0QsaUJBQWlCLEVBQUVmLGdCQUFnQjtNQUNuQ1csdUJBQXVCO01BQ3ZCekMsYUFBYTtNQUNiQyxhQUFhO01BQ2JDLG1CQUFtQjtNQUNuQmdDLGFBQWE7TUFDYnBDLGtCQUFrQixFQUFFQSxrQkFBa0I7TUFDdENnRCxTQUFTLEVBQUU7UUFDVkMsWUFBWSxFQUFFckIsa0JBQWtCO1FBQ2hDRCxlQUFlO1FBQ2ZHLGVBQWU7UUFDZmI7TUFDRCxDQUFDO01BQ0QvSixLQUFLLEVBQUVBLEtBQUs7TUFDWndJLFdBQVcsRUFBRTZCLGFBQWEsSUFBSSxDQUFDRCxrQkFBa0IsR0FBRyxFQUFFLEdBQUc1QixXQUFXO01BQ3BFd0QsZ0JBQWdCLEVBQUU7UUFDakJqQixnQkFBZ0IsRUFBRUEsZ0JBQWdCO1FBQ2xDN0osb0JBQW9CLEVBQUVBO01BQ3ZCLENBQUM7TUFDRCtLLGlCQUFpQixFQUFFO1FBQ2xCcEgsRUFBRSxFQUFFd0UseUJBQXlCO1FBQzdCZ0MsZ0JBQWdCLEVBQUVBLGdCQUFnQixDQUFDYSxJQUFJLENBQUMsR0FBRztNQUM1QyxDQUFDO01BQ0R4RSxzQkFBc0IsRUFBRUEsc0JBQXNCLENBQUNqRyxnQkFBZ0IsQ0FBQztNQUNoRTBLLFlBQVksRUFBRTVFLGVBQWUsQ0FBQ2pELGVBQWUsRUFBRTtNQUMvQ3dGLG9CQUFvQjtNQUNwQkwsbUJBQW1CO01BQ25CRyxZQUFZO01BQ1p3QyxjQUFjLEVBQUVDLGlCQUFpQixDQUFDNUssZ0JBQWdCLENBQUM7TUFDbkQ0SSxhQUFhO01BQ2JEO0lBQ0QsQ0FBQztFQUNGLENBQUM7RUFBQztFQUVGLFNBQVNILGdCQUFnQixDQUFDeEksZ0JBQWtDLEVBQUV6QixLQUFpQyxFQUE2QjtJQUMzSCxJQUFJZ0osYUFBYSxHQUFHLEVBQUU7TUFDckJDLGFBQWEsR0FBRyxFQUFFO0lBQ25CLElBQ0N4SCxnQkFBZ0IsQ0FBQ0csa0JBQWtCLEVBQUUsQ0FBQ21ELHlCQUF5QixFQUFFLElBQ2pFdEQsZ0JBQWdCLENBQUM2QyxlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDQyxrQkFBa0IsRUFDckU7TUFDRCxLQUFLLElBQUlyRSxJQUFJLElBQUlILEtBQUssRUFBRTtRQUN2QkcsSUFBSSxHQUFHQSxJQUE4QjtRQUNyQyxJQUFJQSxJQUFJLENBQUNvRCxjQUFjLElBQUlwRCxJQUFJLENBQUNtRCxjQUFjLEVBQUU7VUFDL0MyRixhQUFhLEdBQUc5SSxJQUFJLENBQUNvRCxjQUFjO1VBQ25DeUYsYUFBYSxHQUFHN0ksSUFBSSxDQUFDbUQsY0FBYztVQUNuQztRQUNEO01BQ0Q7SUFDRCxDQUFDLE1BQU07TUFDTixLQUFLLElBQUluRCxJQUFJLElBQUlILEtBQUssRUFBRTtRQUN2QkcsSUFBSSxHQUFHQSxJQUE0QjtRQUNuQyxJQUFJLENBQUM2SSxhQUFhLElBQUs3SSxJQUFJLENBQStCbUQsY0FBYyxFQUFFO1VBQ3pFMEYsYUFBYSxHQUFJN0ksSUFBSSxDQUErQm1ELGNBQWMsSUFBSSxFQUFFO1FBQ3pFO1FBQ0EsSUFBSSxDQUFDMkYsYUFBYSxJQUFLOUksSUFBSSxDQUErQm9ELGNBQWMsRUFBRTtVQUN6RTBGLGFBQWEsR0FBSTlJLElBQUksQ0FBK0JvRCxjQUFjLElBQUksRUFBRTtRQUN6RTtRQUNBLElBQUkwRixhQUFhLElBQUlELGFBQWEsRUFBRTtVQUNuQztRQUNEO01BQ0Q7SUFDRDtJQUNBLElBQUlBLGFBQWEsSUFBSUMsYUFBYSxFQUFFO01BQ25DLE9BQU87UUFDTmlCLE9BQU8sRUFBRWpCLGFBQWE7UUFDdEJrQixPQUFPLEVBQUVuQjtNQUNWLENBQUM7SUFDRjtJQUNBLE9BQU8xRyxTQUFTO0VBQ2pCO0VBQUM7QUFBQSJ9