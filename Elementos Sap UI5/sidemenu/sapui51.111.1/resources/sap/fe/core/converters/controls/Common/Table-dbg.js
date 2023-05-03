/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/formatters/TableFormatter", "sap/fe/core/formatters/TableFormatterTypes", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/EntitySetHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/internal/helpers/ActionHelper", "sap/ui/core/Core", "../../helpers/Aggregation", "../../helpers/DataFieldHelper", "../../helpers/ID", "../../ManifestSettings", "./Criticality", "./table/StandardActions"], function (DataField, Action, BindingHelper, ConfigurableObject, IssueManager, Key, tableFormatters, TableFormatterTypes, BindingToolkit, ModelHelper, StableIdHelper, DataModelPathHelper, DisplayModeFormatter, EntitySetHelper, PropertyHelper, UIFormatters, ActionHelper, Core, Aggregation, DataFieldHelper, ID, ManifestSettings, Criticality, StandardActions) {
  "use strict";

  var _exports = {};
  var isInDisplayMode = StandardActions.isInDisplayMode;
  var isDraftOrStickySupported = StandardActions.isDraftOrStickySupported;
  var getStandardActionPaste = StandardActions.getStandardActionPaste;
  var getStandardActionMassEdit = StandardActions.getStandardActionMassEdit;
  var getStandardActionDelete = StandardActions.getStandardActionDelete;
  var getStandardActionCreate = StandardActions.getStandardActionCreate;
  var getRestrictions = StandardActions.getRestrictions;
  var getMassEditVisibility = StandardActions.getMassEditVisibility;
  var getInsertUpdateActionsTemplating = StandardActions.getInsertUpdateActionsTemplating;
  var getDeleteVisibility = StandardActions.getDeleteVisibility;
  var getCreationRow = StandardActions.getCreationRow;
  var getCreateVisibility = StandardActions.getCreateVisibility;
  var generateStandardActionsContext = StandardActions.generateStandardActionsContext;
  var getMessageTypeFromCriticalityType = Criticality.getMessageTypeFromCriticalityType;
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var SelectionMode = ManifestSettings.SelectionMode;
  var Importance = ManifestSettings.Importance;
  var HorizontalAlign = ManifestSettings.HorizontalAlign;
  var CreationMode = ManifestSettings.CreationMode;
  var AvailabilityType = ManifestSettings.AvailabilityType;
  var ActionType = ManifestSettings.ActionType;
  var getTableID = ID.getTableID;
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var AggregationHelper = Aggregation.AggregationHelper;
  var isMultiValueField = UIFormatters.isMultiValueField;
  var isProperty = PropertyHelper.isProperty;
  var isPathExpression = PropertyHelper.isPathExpression;
  var isNavigationProperty = PropertyHelper.isNavigationProperty;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var getNonSortablePropertiesRestrictions = EntitySetHelper.getNonSortablePropertiesRestrictions;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var isPathUpdatable = DataModelPathHelper.isPathUpdatable;
  var isPathSearchable = DataModelPathHelper.isPathSearchable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var replaceSpecialChars = StableIdHelper.replaceSpecialChars;
  var generate = StableIdHelper.generate;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var EDM_TYPE_MAPPING = BindingToolkit.EDM_TYPE_MAPPING;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var MessageType = TableFormatterTypes.MessageType;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategoryType = IssueManager.IssueCategoryType;
  var IssueCategory = IssueManager.IssueCategory;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var isActionNavigable = Action.isActionNavigable;
  var getCopyAction = Action.getCopyAction;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var dataFieldIsCopyAction = Action.dataFieldIsCopyAction;
  var isDataPointFromDataFieldDefault = DataField.isDataPointFromDataFieldDefault;
  var isDataFieldTypes = DataField.isDataFieldTypes;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  var getTargetValueOnDataPoint = DataField.getTargetValueOnDataPoint;
  var getSemanticObjectPath = DataField.getSemanticObjectPath;
  var getDataFieldDataType = DataField.getDataFieldDataType;
  var collectRelatedPropertiesRecursively = DataField.collectRelatedPropertiesRecursively;
  var collectRelatedProperties = DataField.collectRelatedProperties;
  var ColumnType; // Custom Column from Manifest
  (function (ColumnType) {
    ColumnType["Default"] = "Default";
    ColumnType["Annotation"] = "Annotation";
    ColumnType["Slot"] = "Slot";
  })(ColumnType || (ColumnType = {}));
  /**
   * Returns an array of all annotation-based and manifest-based table actions.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @param navigationSettings
   * @returns The complete table actions
   */
  function getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings) {
    const aTableActions = getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext);
    const aAnnotationActions = aTableActions.tableActions;
    const aHiddenActions = aTableActions.hiddenTableActions;
    const manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, aAnnotationActions, navigationSettings, true, aHiddenActions);
    const actionOverwriteConfig = {
      isNavigable: OverrideType.overwrite,
      enableOnSelect: OverrideType.overwrite,
      enableAutoScroll: OverrideType.overwrite,
      enabled: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      defaultValuesExtensionFunction: OverrideType.overwrite,
      command: OverrideType.overwrite
    };
    const actions = insertCustomElements(aAnnotationActions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions,
      commandActions: manifestActions.commandActions
    };
  }

  /**
   * Returns an array of all columns, annotation-based as well as manifest based.
   * They are sorted and some properties can be overwritten via the manifest (check out the keys that can be overwritten).
   *
   * @param lineItemAnnotation Collection of data fields for representation in a table or list
   * @param visualizationPath
   * @param converterContext
   * @param navigationSettings
   * @returns Returns all table columns that should be available, regardless of templating or personalization or their origin
   */
  _exports.getTableActions = getTableActions;
  function getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings) {
    const annotationColumns = getColumnsFromAnnotations(lineItemAnnotation, visualizationPath, converterContext);
    const manifestColumns = getColumnsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).columns, annotationColumns, converterContext, converterContext.getAnnotationEntityType(lineItemAnnotation), navigationSettings);
    return insertCustomElements(annotationColumns, manifestColumns, {
      width: OverrideType.overwrite,
      importance: OverrideType.overwrite,
      horizontalAlign: OverrideType.overwrite,
      availability: OverrideType.overwrite,
      isNavigable: OverrideType.overwrite,
      settings: OverrideType.overwrite,
      formatOptions: OverrideType.overwrite
    });
  }

  /**
   * Retrieve the custom aggregation definitions from the entityType.
   *
   * @param entityType The target entity type.
   * @param tableColumns The array of columns for the entity type.
   * @param converterContext The converter context.
   * @returns The aggregate definitions from the entityType, or undefined if the entity doesn't support analytical queries.
   */
  _exports.getTableColumns = getTableColumns;
  const getAggregateDefinitionsFromEntityType = function (entityType, tableColumns, converterContext) {
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    function findColumnFromPath(path) {
      return tableColumns.find(column => {
        const annotationColumn = column;
        return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
      });
    }
    if (!aggregationHelper.isAnalyticsSupported()) {
      return undefined;
    }

    // Keep a set of all currency/unit properties, as we don't want to consider them as aggregates
    // They are aggregates for technical reasons (to manage multi-units situations) but it doesn't make sense from a user standpoint
    const currencyOrUnitProperties = new Set();
    tableColumns.forEach(column => {
      const tableColumn = column;
      if (tableColumn.unit) {
        currencyOrUnitProperties.add(tableColumn.unit);
      }
    });
    const customAggregateAnnotations = aggregationHelper.getCustomAggregateDefinitions();
    const definitions = {};
    customAggregateAnnotations.forEach(annotation => {
      const aggregatedProperty = aggregationHelper._entityType.entityProperties.find(property => {
        return property.name === annotation.qualifier;
      });
      if (aggregatedProperty) {
        var _annotation$annotatio, _annotation$annotatio2;
        const contextDefiningProperties = (_annotation$annotatio = annotation.annotations) === null || _annotation$annotatio === void 0 ? void 0 : (_annotation$annotatio2 = _annotation$annotatio.Aggregation) === null || _annotation$annotatio2 === void 0 ? void 0 : _annotation$annotatio2.ContextDefiningProperties;
        definitions[aggregatedProperty.name] = contextDefiningProperties ? contextDefiningProperties.map(ctxDefProperty => {
          return ctxDefProperty.value;
        }) : [];
      }
    });
    const result = {};
    tableColumns.forEach(column => {
      const tableColumn = column;
      if (tableColumn.propertyInfos === undefined && tableColumn.relativePath) {
        const rawContextDefiningProperties = definitions[tableColumn.relativePath];

        // Ignore aggregates corresponding to currencies or units of measure
        if (rawContextDefiningProperties && !currencyOrUnitProperties.has(tableColumn.name)) {
          result[tableColumn.name] = {
            defaultAggregate: {},
            relativePath: tableColumn.relativePath
          };
          const contextDefiningProperties = [];
          rawContextDefiningProperties.forEach(contextDefiningPropertyName => {
            const foundColumn = findColumnFromPath(contextDefiningPropertyName);
            if (foundColumn) {
              contextDefiningProperties.push(foundColumn.name);
            }
          });
          if (contextDefiningProperties.length) {
            result[tableColumn.name].defaultAggregate.contextDefiningProperties = contextDefiningProperties;
          }
        }
      }
    });
    return result;
  };

  /**
   * Updates a table visualization for analytical use cases.
   *
   * @param tableVisualization The visualization to be updated
   * @param entityType The entity type displayed in the table
   * @param converterContext The converter context
   * @param presentationVariantAnnotation The presentationVariant annotation (if any)
   */
  _exports.getAggregateDefinitionsFromEntityType = getAggregateDefinitionsFromEntityType;
  function updateTableVisualizationForType(tableVisualization, entityType, converterContext, presentationVariantAnnotation) {
    if (tableVisualization.control.type === "AnalyticalTable") {
      const aggregatesDefinitions = getAggregateDefinitionsFromEntityType(entityType, tableVisualization.columns, converterContext),
        aggregationHelper = new AggregationHelper(entityType, converterContext);
      if (aggregatesDefinitions) {
        tableVisualization.enableAnalytics = true;
        tableVisualization.enable$select = false;
        tableVisualization.enable$$getKeepAliveContext = false;
        tableVisualization.aggregates = aggregatesDefinitions;
        _updatePropertyInfosWithAggregatesDefinitions(tableVisualization);
        const allowedTransformations = aggregationHelper.getAllowedTransformations();
        tableVisualization.enableAnalyticsSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;

        // Add group and sort conditions from the presentation variant
        tableVisualization.annotation.groupConditions = getGroupConditions(presentationVariantAnnotation, tableVisualization.columns, tableVisualization.control.type);
        tableVisualization.annotation.aggregateConditions = getAggregateConditions(presentationVariantAnnotation, tableVisualization.columns);
      }
      tableVisualization.control.type = "GridTable"; // AnalyticalTable isn't a real type for the MDC:Table, so we always switch back to Grid
    } else if (tableVisualization.control.type === "ResponsiveTable") {
      tableVisualization.annotation.groupConditions = getGroupConditions(presentationVariantAnnotation, tableVisualization.columns, tableVisualization.control.type);
    } else if (tableVisualization.control.type === "TreeTable") {
      tableVisualization.enable$$getKeepAliveContext = false;
    }
  }

  /**
   * Get the navigation target path from manifest settings.
   *
   * @param converterContext The converter context
   * @param navigationPropertyPath The navigation path to check in the manifest settings
   * @returns Navigation path from manifest settings
   */
  _exports.updateTableVisualizationForType = updateTableVisualizationForType;
  function getNavigationTargetPath(converterContext, navigationPropertyPath) {
    const manifestWrapper = converterContext.getManifestWrapper();
    if (navigationPropertyPath && manifestWrapper.getNavigationConfiguration(navigationPropertyPath)) {
      const navConfig = manifestWrapper.getNavigationConfiguration(navigationPropertyPath);
      if (Object.keys(navConfig).length > 0) {
        return navigationPropertyPath;
      }
    }
    const dataModelPath = converterContext.getDataModelObjectPath();
    const contextPath = converterContext.getContextPath();
    const navConfigForContextPath = manifestWrapper.getNavigationConfiguration(contextPath);
    if (navConfigForContextPath && Object.keys(navConfigForContextPath).length > 0) {
      return contextPath;
    }
    return dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
  }

  /**
   * Sets the 'unit' and 'textArrangement' properties in columns when necessary.
   *
   * @param entityType The entity type displayed in the table
   * @param tableColumns The columns to be updated
   */
  function updateLinkedProperties(entityType, tableColumns) {
    function findColumnByPath(path) {
      return tableColumns.find(column => {
        const annotationColumn = column;
        return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
      });
    }
    tableColumns.forEach(oColumn => {
      const oTableColumn = oColumn;
      if (oTableColumn.propertyInfos === undefined && oTableColumn.relativePath) {
        const oProperty = entityType.entityProperties.find(oProp => oProp.name === oTableColumn.relativePath);
        if (oProperty) {
          var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation7;
          const oUnit = getAssociatedCurrencyProperty(oProperty) || getAssociatedUnitProperty(oProperty);
          const oTimezone = getAssociatedTimezoneProperty(oProperty);
          const sTimezone = oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation = oProperty.annotations) === null || _oProperty$annotation === void 0 ? void 0 : (_oProperty$annotation2 = _oProperty$annotation.Common) === null || _oProperty$annotation2 === void 0 ? void 0 : _oProperty$annotation2.Timezone;
          if (oUnit) {
            const oUnitColumn = findColumnByPath(oUnit.name);
            oTableColumn.unit = oUnitColumn === null || oUnitColumn === void 0 ? void 0 : oUnitColumn.name;
          } else {
            var _oProperty$annotation3, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6;
            const sUnit = (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation3 = oProperty.annotations) === null || _oProperty$annotation3 === void 0 ? void 0 : (_oProperty$annotation4 = _oProperty$annotation3.Measures) === null || _oProperty$annotation4 === void 0 ? void 0 : _oProperty$annotation4.ISOCurrency) || (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation5 = oProperty.annotations) === null || _oProperty$annotation5 === void 0 ? void 0 : (_oProperty$annotation6 = _oProperty$annotation5.Measures) === null || _oProperty$annotation6 === void 0 ? void 0 : _oProperty$annotation6.Unit);
            if (sUnit) {
              oTableColumn.unitText = `${sUnit}`;
            }
          }
          if (oTimezone) {
            const oTimezoneColumn = findColumnByPath(oTimezone.name);
            oTableColumn.timezone = oTimezoneColumn === null || oTimezoneColumn === void 0 ? void 0 : oTimezoneColumn.name;
          } else if (sTimezone) {
            oTableColumn.timezoneText = sTimezone.toString();
          }
          const displayMode = getDisplayMode(oProperty),
            textAnnotation = (_oProperty$annotation7 = oProperty.annotations.Common) === null || _oProperty$annotation7 === void 0 ? void 0 : _oProperty$annotation7.Text;
          if (isPathExpression(textAnnotation) && displayMode !== "Value") {
            const oTextColumn = findColumnByPath(textAnnotation.path);
            if (oTextColumn && oTextColumn.name !== oTableColumn.name) {
              oTableColumn.textArrangement = {
                textProperty: oTextColumn.name,
                mode: displayMode
              };
            }
          }
        }
      }
    });
  }
  _exports.updateLinkedProperties = updateLinkedProperties;
  function getSemanticKeysAndTitleInfo(converterContext) {
    var _converterContext$get, _converterContext$get2, _converterContext$get3, _converterContext$get4, _converterContext$get5, _converterContext$get6, _converterContext$get7, _converterContext$get8, _converterContext$get9, _converterContext$get10, _converterContext$get11, _converterContext$get12, _converterContext$get13;
    const headerInfoTitlePath = (_converterContext$get = converterContext.getAnnotationEntityType()) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.annotations) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.UI) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.HeaderInfo) === null || _converterContext$get4 === void 0 ? void 0 : (_converterContext$get5 = _converterContext$get4.Title) === null || _converterContext$get5 === void 0 ? void 0 : (_converterContext$get6 = _converterContext$get5.Value) === null || _converterContext$get6 === void 0 ? void 0 : _converterContext$get6.path;
    const semanticKeyAnnotations = (_converterContext$get7 = converterContext.getAnnotationEntityType()) === null || _converterContext$get7 === void 0 ? void 0 : (_converterContext$get8 = _converterContext$get7.annotations) === null || _converterContext$get8 === void 0 ? void 0 : (_converterContext$get9 = _converterContext$get8.Common) === null || _converterContext$get9 === void 0 ? void 0 : _converterContext$get9.SemanticKey;
    const headerInfoTypeName = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get10 = converterContext.getAnnotationEntityType()) === null || _converterContext$get10 === void 0 ? void 0 : (_converterContext$get11 = _converterContext$get10.annotations) === null || _converterContext$get11 === void 0 ? void 0 : (_converterContext$get12 = _converterContext$get11.UI) === null || _converterContext$get12 === void 0 ? void 0 : (_converterContext$get13 = _converterContext$get12.HeaderInfo) === null || _converterContext$get13 === void 0 ? void 0 : _converterContext$get13.TypeName;
    const semanticKeyColumns = [];
    if (semanticKeyAnnotations) {
      semanticKeyAnnotations.forEach(function (oColumn) {
        semanticKeyColumns.push(oColumn.value);
      });
    }
    return {
      headerInfoTitlePath,
      semanticKeyColumns,
      headerInfoTypeName
    };
  }
  function createTableVisualization(lineItemAnnotation, visualizationPath, converterContext, presentationVariantAnnotation, isCondensedTableLayoutCompliant, viewConfiguration) {
    const tableManifestConfig = getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext, isCondensedTableLayoutCompliant);
    const {
      navigationPropertyPath
    } = splitPath(visualizationPath);
    const navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
    const navigationSettings = converterContext.getManifestWrapper().getNavigationConfiguration(navigationTargetPath);
    const columns = getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings);
    const operationAvailableMap = getOperationAvailableMap(lineItemAnnotation, converterContext);
    const semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
    const tableActions = getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings);
    const oVisualization = {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfig, columns, presentationVariantAnnotation, viewConfiguration),
      control: tableManifestConfig,
      actions: removeDuplicateActions(tableActions.actions),
      commandActions: tableActions.commandActions,
      columns: columns,
      operationAvailableMap: JSON.stringify(operationAvailableMap),
      operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
      headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
      semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
      headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName,
      enable$select: true,
      enable$$getKeepAliveContext: true
    };
    updateLinkedProperties(converterContext.getAnnotationEntityType(lineItemAnnotation), columns);
    updateTableVisualizationForType(oVisualization, converterContext.getAnnotationEntityType(lineItemAnnotation), converterContext, presentationVariantAnnotation);
    return oVisualization;
  }
  _exports.createTableVisualization = createTableVisualization;
  function createDefaultTableVisualization(converterContext, isBlankTable) {
    const tableManifestConfig = getTableManifestConfiguration(undefined, "", converterContext, false);
    const columns = getColumnsFromEntityType({}, converterContext.getEntityType(), [], [], converterContext, tableManifestConfig.type, []);
    const operationAvailableMap = getOperationAvailableMap(undefined, converterContext);
    const semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
    const oVisualization = {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(undefined, "", converterContext, tableManifestConfig, isBlankTable ? [] : columns),
      control: tableManifestConfig,
      actions: [],
      columns: columns,
      operationAvailableMap: JSON.stringify(operationAvailableMap),
      operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
      headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
      semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
      headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName,
      enable$select: true,
      enable$$getKeepAliveContext: true
    };
    updateLinkedProperties(converterContext.getEntityType(), columns);
    updateTableVisualizationForType(oVisualization, converterContext.getEntityType(), converterContext);
    return oVisualization;
  }

  /**
   * Gets the map of Core.OperationAvailable property paths for all DataFieldForActions.
   *
   * @param lineItemAnnotation The instance of the line item
   * @param converterContext The instance of the converter context
   * @returns The record containing all action names and their corresponding Core.OperationAvailable property paths
   */
  _exports.createDefaultTableVisualization = createDefaultTableVisualization;
  function getOperationAvailableMap(lineItemAnnotation, converterContext) {
    return ActionHelper.getOperationAvailableMap(lineItemAnnotation, "table", converterContext);
  }

  /**
   * Gets updatable propertyPath for the current entityset if valid.
   *
   * @param converterContext The instance of the converter context
   * @returns The updatable property for the rows
   */
  function getCurrentEntitySetUpdatablePath(converterContext) {
    var _entitySet$annotation, _entitySet$annotation2, _entitySet$annotation3;
    const restrictions = getRestrictions(converterContext);
    const entitySet = converterContext.getEntitySet();
    const updatable = restrictions.isUpdatable;
    const isOnlyDynamicOnCurrentEntity = !isConstant(updatable.expression) && updatable.navigationExpression._type === "Unresolvable";
    const updatablePropertyPath = entitySet === null || entitySet === void 0 ? void 0 : (_entitySet$annotation = entitySet.annotations.Capabilities) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.UpdateRestrictions) === null || _entitySet$annotation2 === void 0 ? void 0 : (_entitySet$annotation3 = _entitySet$annotation2.Updatable) === null || _entitySet$annotation3 === void 0 ? void 0 : _entitySet$annotation3.path;
    return isOnlyDynamicOnCurrentEntity ? updatablePropertyPath : "";
  }

  /**
   * Method to retrieve all property paths assigned to the Core.OperationAvailable annotation.
   *
   * @param operationAvailableMap The record consisting of actions and their Core.OperationAvailable property paths
   * @param converterContext The instance of the converter context
   * @returns The CSV string of all property paths associated with the Core.OperationAvailable annotation
   */
  function getOperationAvailableProperties(operationAvailableMap, converterContext) {
    const properties = new Set();
    for (const actionName in operationAvailableMap) {
      const propertyName = operationAvailableMap[actionName];
      if (propertyName === null) {
        // Annotation configured with explicit 'null' (action advertisement relevant)
        properties.add(actionName);
      } else if (typeof propertyName === "string") {
        // Add property paths and not Constant values.
        properties.add(propertyName);
      }
    }
    if (properties.size) {
      var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3, _entityType$annotatio4, _entityType$annotatio5;
      // Some actions have an operation available based on property --> we need to load the HeaderInfo.Title property
      // so that the dialog on partial actions is displayed properly (BCP 2180271425)
      const entityType = converterContext.getEntityType();
      const titleProperty = (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.HeaderInfo) === null || _entityType$annotatio3 === void 0 ? void 0 : (_entityType$annotatio4 = _entityType$annotatio3.Title) === null || _entityType$annotatio4 === void 0 ? void 0 : (_entityType$annotatio5 = _entityType$annotatio4.Value) === null || _entityType$annotatio5 === void 0 ? void 0 : _entityType$annotatio5.path;
      if (titleProperty) {
        properties.add(titleProperty);
      }
    }
    return Array.from(properties).join(",");
  }

  /**
   * Iterates over the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and
   * returns all the UI.Hidden annotation expressions.
   *
   * @param lineItemAnnotation Collection of data fields used for representation in a table or list
   * @param currentEntityType Current entity type
   * @param contextDataModelObjectPath Object path of the data model
   * @param isEntitySet
   * @returns All the `UI.Hidden` path expressions found in the relevant actions
   */
  function getUIHiddenExpForActionsRequiringContext(lineItemAnnotation, currentEntityType, contextDataModelObjectPath, isEntitySet) {
    const aUiHiddenPathExpressions = [];
    lineItemAnnotation.forEach(dataField => {
      var _dataField$ActionTarg, _dataField$Inline;
      // Check if the lineItem context is the same as that of the action:
      if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && dataField !== null && dataField !== void 0 && (_dataField$ActionTarg = dataField.ActionTarget) !== null && _dataField$ActionTarg !== void 0 && _dataField$ActionTarg.isBound && currentEntityType === (dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget.sourceEntityType) || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && dataField.RequiresContext && (dataField === null || dataField === void 0 ? void 0 : (_dataField$Inline = dataField.Inline) === null || _dataField$Inline === void 0 ? void 0 : _dataField$Inline.valueOf()) !== true) {
        var _dataField$annotation, _dataField$annotation2, _dataField$annotation3;
        if (typeof ((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === "object") {
          aUiHiddenPathExpressions.push(equal(getBindingExpFromContext(dataField, contextDataModelObjectPath, isEntitySet), false));
        }
      }
    });
    return aUiHiddenPathExpressions;
  }

  /**
   * This method is used to change the context currently referenced by this binding by removing the last navigation property.
   *
   * It is used (specifically in this case), to transform a binding made for a NavProp context /MainObject/NavProp1/NavProp2,
   * into a binding on the previous context /MainObject/NavProp1.
   *
   * @param source DataFieldForAction | DataFieldForIntentBasedNavigation | CustomAction
   * @param contextDataModelObjectPath DataModelObjectPath
   * @param isEntitySet
   * @returns The binding expression
   */
  function getBindingExpFromContext(source, contextDataModelObjectPath, isEntitySet) {
    var _sExpression;
    let sExpression;
    if ((source === null || source === void 0 ? void 0 : source.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAction" || (source === null || source === void 0 ? void 0 : source.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
      var _annotations, _annotations$UI;
      sExpression = source === null || source === void 0 ? void 0 : (_annotations = source.annotations) === null || _annotations === void 0 ? void 0 : (_annotations$UI = _annotations.UI) === null || _annotations$UI === void 0 ? void 0 : _annotations$UI.Hidden;
    } else {
      sExpression = source === null || source === void 0 ? void 0 : source.visible;
    }
    let sPath;
    if ((_sExpression = sExpression) !== null && _sExpression !== void 0 && _sExpression.path) {
      sPath = sExpression.path;
    } else {
      sPath = sExpression;
    }
    if (sPath) {
      if (source !== null && source !== void 0 && source.visible) {
        sPath = sPath.substring(1, sPath.length - 1);
      }
      if (sPath.indexOf("/") > 0) {
        var _contextDataModelObje;
        //check if the navigation property is correct:
        const aSplitPath = sPath.split("/");
        const sNavigationPath = aSplitPath[0];
        if ((contextDataModelObjectPath === null || contextDataModelObjectPath === void 0 ? void 0 : (_contextDataModelObje = contextDataModelObjectPath.targetObject) === null || _contextDataModelObje === void 0 ? void 0 : _contextDataModelObje._type) === "NavigationProperty" && contextDataModelObjectPath.targetObject.partner === sNavigationPath) {
          return pathInModel(aSplitPath.slice(1).join("/"));
        } else {
          return constant(true);
        }
        // In case there is no navigation property, if it's an entitySet, the expression binding has to be returned:
      } else if (isEntitySet) {
        return pathInModel(sPath);
        // otherwise the expression binding cannot be taken into account for the selection mode evaluation:
      } else {
        return constant(true);
      }
    }
    return constant(true);
  }

  /**
   * Loop through the manifest actions and check the following:
   *
   * If the data field is also referenced as a custom action.
   * If the underlying manifest action is either a bound action or has the 'RequiresContext' property set to true.
   *
   * If so, the 'requiresSelection' property is forced to 'true' in the manifest.
   *
   * @param dataFieldId Id of the DataField evaluated
   * @param dataField DataField evaluated
   * @param manifestActions The actions defined in the manifest
   * @returns `true` if the DataField is found among the manifest actions
   */
  function updateManifestActionAndTagIt(dataFieldId, dataField, manifestActions) {
    return Object.keys(manifestActions).some(actionKey => {
      if (actionKey === dataFieldId) {
        var _ActionTarget;
        if (dataField !== null && dataField !== void 0 && (_ActionTarget = dataField.ActionTarget) !== null && _ActionTarget !== void 0 && _ActionTarget.isBound || dataField !== null && dataField !== void 0 && dataField.RequiresContext) {
          manifestActions[dataFieldId].requiresSelection = true;
        }
        return true;
      }
      return false;
    });
  }

  /**
   * Loop through the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and
   * check the following:
   * If at least one of them is always visible in the table toolbar and requires a context
   * If an action is also defined in the manifest, it is set aside and will be considered
   * when going through the manifest.
   *
   * @param lineItemAnnotation Collection of data fields for representation in a table or list
   * @param manifestActions The actions defined in the manifest
   * @param currentEntityType Current Entity Type
   * @returns `true` if there is at least 1 action that meets the criteria
   */
  function hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation, manifestActions, currentEntityType) {
    return lineItemAnnotation.some(dataField => {
      var _dataField$Inline2, _dataField$annotation4, _dataField$annotation5, _dataField$annotation6, _dataField$annotation7, _dataField$annotation8, _dataField$annotation9;
      if ((dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") && (dataField === null || dataField === void 0 ? void 0 : (_dataField$Inline2 = dataField.Inline) === null || _dataField$Inline2 === void 0 ? void 0 : _dataField$Inline2.valueOf()) !== true && (((_dataField$annotation4 = dataField.annotations) === null || _dataField$annotation4 === void 0 ? void 0 : (_dataField$annotation5 = _dataField$annotation4.UI) === null || _dataField$annotation5 === void 0 ? void 0 : (_dataField$annotation6 = _dataField$annotation5.Hidden) === null || _dataField$annotation6 === void 0 ? void 0 : _dataField$annotation6.valueOf()) === false || ((_dataField$annotation7 = dataField.annotations) === null || _dataField$annotation7 === void 0 ? void 0 : (_dataField$annotation8 = _dataField$annotation7.UI) === null || _dataField$annotation8 === void 0 ? void 0 : (_dataField$annotation9 = _dataField$annotation8.Hidden) === null || _dataField$annotation9 === void 0 ? void 0 : _dataField$annotation9.valueOf()) === undefined)) {
        if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
          var _dataField$ActionTarg2;
          const manifestActionId = generate(["DataFieldForAction", dataField.Action]);
          // if the DataFieldForActon from annotation also exists in the manifest, its visibility will be evaluated later on
          if (updateManifestActionAndTagIt(manifestActionId, dataField, manifestActions)) {
            return false;
          }
          // Check if the lineItem context is the same as that of the action:
          return (dataField === null || dataField === void 0 ? void 0 : (_dataField$ActionTarg2 = dataField.ActionTarget) === null || _dataField$ActionTarg2 === void 0 ? void 0 : _dataField$ActionTarg2.isBound) && currentEntityType === (dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget.sourceEntityType);
        } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
          // if the DataFieldForIntentBasedNavigation from annotation also exists in the manifest, its visibility will be evaluated later on
          if (updateManifestActionAndTagIt(`DataFieldForIntentBasedNavigation::${dataField.SemanticObject}::${dataField.Action}`, dataField, manifestActions)) {
            return false;
          }
          return dataField.RequiresContext;
        }
      }
      return false;
    });
  }
  function hasCustomActionsAlwaysVisibleInToolBar(manifestActions) {
    return Object.keys(manifestActions).some(actionKey => {
      var _action$visible;
      const action = manifestActions[actionKey];
      if (action.requiresSelection && ((_action$visible = action.visible) === null || _action$visible === void 0 ? void 0 : _action$visible.toString()) === "true") {
        return true;
      }
      return false;
    });
  }

  /**
   * Iterates over the custom actions (with key requiresSelection) declared in the manifest for the current line item and returns all the
   * visible key values as an expression.
   *
   * @param manifestActions The actions defined in the manifest
   * @returns Array<Expression<boolean>> All the visible path expressions of the actions that meet the criteria
   */
  function getVisibleExpForCustomActionsRequiringContext(manifestActions) {
    const aVisiblePathExpressions = [];
    if (manifestActions) {
      Object.keys(manifestActions).forEach(actionKey => {
        const action = manifestActions[actionKey];
        if (action.requiresSelection === true && action.visible !== undefined) {
          if (typeof action.visible === "string") {
            var _action$visible2;
            /*The final aim would be to check if the path expression depends on the parent context
            and considers only those expressions for the expression evaluation,
            but currently not possible from the manifest as the visible key is bound on the parent entity.
            Tricky to differentiate the path as it's done for the Hidden annotation.
            For the time being we consider all the paths of the manifest*/

            aVisiblePathExpressions.push(resolveBindingString(action === null || action === void 0 ? void 0 : (_action$visible2 = action.visible) === null || _action$visible2 === void 0 ? void 0 : _action$visible2.valueOf()));
          }
        }
      });
    }
    return aVisiblePathExpressions;
  }

  /**
   * Evaluate if the path is statically deletable or updatable.
   *
   * @param converterContext
   * @returns The table capabilities
   */
  function getCapabilityRestriction(converterContext) {
    const isDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
    const isUpdatable = isPathUpdatable(converterContext.getDataModelObjectPath());
    return {
      isDeletable: !(isConstant(isDeletable) && isDeletable.value === false),
      isUpdatable: !(isConstant(isUpdatable) && isUpdatable.value === false)
    };
  }
  _exports.getCapabilityRestriction = getCapabilityRestriction;
  function getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, isEntitySet, targetCapabilities, deleteButtonVisibilityExpression) {
    var _tableManifestSetting;
    let massEditVisibilityExpression = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : constant(false);
    if (!lineItemAnnotation) {
      return SelectionMode.None;
    }
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    let selectionMode = (_tableManifestSetting = tableManifestSettings.tableSettings) === null || _tableManifestSetting === void 0 ? void 0 : _tableManifestSetting.selectionMode;
    let aHiddenBindingExpressions = [],
      aVisibleBindingExpressions = [];
    const manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, [], undefined, false);
    let isParentDeletable, parentEntitySetDeletable;
    if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
      isParentDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
      parentEntitySetDeletable = isParentDeletable ? compileExpression(isParentDeletable, true) : isParentDeletable;
    }
    const bMassEditEnabled = !isConstant(massEditVisibilityExpression) || massEditVisibilityExpression.value !== false;
    if (selectionMode && selectionMode === SelectionMode.None && deleteButtonVisibilityExpression) {
      if (converterContext.getTemplateType() === TemplateType.ObjectPage && bMassEditEnabled) {
        // Mass Edit in OP is enabled only in edit mode.
        return compileExpression(ifElse(and(UI.IsEditable, massEditVisibilityExpression), constant("Multi"), ifElse(deleteButtonVisibilityExpression, constant("Multi"), constant("None"))));
      } else if (bMassEditEnabled) {
        return SelectionMode.Multi;
      }
      return compileExpression(ifElse(deleteButtonVisibilityExpression, constant("Multi"), constant("None")));
    }
    if (!selectionMode || selectionMode === SelectionMode.Auto) {
      selectionMode = SelectionMode.Multi;
    }
    if (bMassEditEnabled) {
      // Override default selection mode when mass edit is visible
      selectionMode = selectionMode === SelectionMode.Single ? SelectionMode.Single : SelectionMode.Multi;
    }
    if (hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation, manifestActions.actions, converterContext.getEntityType()) || hasCustomActionsAlwaysVisibleInToolBar(manifestActions.actions)) {
      return selectionMode;
    }
    aHiddenBindingExpressions = getUIHiddenExpForActionsRequiringContext(lineItemAnnotation, converterContext.getEntityType(), converterContext.getDataModelObjectPath(), isEntitySet);
    aVisibleBindingExpressions = getVisibleExpForCustomActionsRequiringContext(manifestActions.actions);

    // No action requiring a context:
    if (aHiddenBindingExpressions.length === 0 && aVisibleBindingExpressions.length === 0 && (deleteButtonVisibilityExpression || bMassEditEnabled)) {
      if (!isEntitySet) {
        // Example: OP case
        if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
          // Building expression for delete and mass edit
          const buttonVisibilityExpression = or(deleteButtonVisibilityExpression || true,
          // default delete visibility as true
          massEditVisibilityExpression);
          return compileExpression(ifElse(and(UI.IsEditable, buttonVisibilityExpression), constant(selectionMode), constant(SelectionMode.None)));
        } else {
          return SelectionMode.None;
        }
        // EntitySet deletable:
      } else if (bMassEditEnabled) {
        // example: LR scenario
        return selectionMode;
      } else if (targetCapabilities.isDeletable && deleteButtonVisibilityExpression) {
        return compileExpression(ifElse(deleteButtonVisibilityExpression, constant(selectionMode), constant("None")));
        // EntitySet not deletable:
      } else {
        return SelectionMode.None;
      }
      // There are actions requiring a context:
    } else if (!isEntitySet) {
      // Example: OP case
      if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
        // Use selectionMode in edit mode if delete is enabled or mass edit is visible
        const editModebuttonVisibilityExpression = ifElse(bMassEditEnabled && !targetCapabilities.isDeletable, massEditVisibilityExpression, constant(true));
        return compileExpression(ifElse(and(UI.IsEditable, editModebuttonVisibilityExpression), constant(selectionMode), ifElse(or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions)), constant(selectionMode), constant(SelectionMode.None))));
      } else {
        return compileExpression(ifElse(or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions)), constant(selectionMode), constant(SelectionMode.None)));
      }
      //EntitySet deletable:
    } else if (targetCapabilities.isDeletable || bMassEditEnabled) {
      // Example: LR scenario
      return selectionMode;
      //EntitySet not deletable:
    } else {
      return compileExpression(ifElse(or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions), massEditVisibilityExpression), constant(selectionMode), constant(SelectionMode.None)));
    }
  }

  /**
   * Method to retrieve all table actions from annotations.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns The table annotation actions
   */
  _exports.getSelectionMode = getSelectionMode;
  function getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext) {
    const tableActions = [];
    const hiddenTableActions = [];
    const copyDataField = getCopyAction(lineItemAnnotation.filter(dataField => {
      return dataFieldIsCopyAction(dataField);
    }));
    if (copyDataField) {
      var _copyDataField$annota, _copyDataField$annota2, _copyDataField$Label;
      tableActions.push({
        type: ActionType.Copy,
        annotationPath: converterContext.getEntitySetBasedAnnotationPath(copyDataField.fullyQualifiedName),
        key: KeyHelper.generateKeyFromDataField(copyDataField),
        enabled: compileExpression(equal(pathInModel("numberOfSelectedContexts", "internal"), 1)),
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_copyDataField$annota = copyDataField.annotations) === null || _copyDataField$annota === void 0 ? void 0 : (_copyDataField$annota2 = _copyDataField$annota.UI) === null || _copyDataField$annota2 === void 0 ? void 0 : _copyDataField$annota2.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true))),
        text: ((_copyDataField$Label = copyDataField.Label) === null || _copyDataField$Label === void 0 ? void 0 : _copyDataField$Label.toString()) ?? Core.getLibraryResourceBundle("sap.fe.core").getText("C_COMMON_COPY"),
        isNavigable: true
      });
    }
    lineItemAnnotation.filter(dataField => {
      return !dataFieldIsCopyAction(dataField);
    }).forEach(dataField => {
      var _dataField$annotation10, _dataField$annotation11, _dataField$annotation12, _dataField$Inline3, _dataField$Determinin, _dataField$annotation13, _dataField$annotation14, _dataField$annotation15, _dataField$annotation16;
      if (((_dataField$annotation10 = dataField.annotations) === null || _dataField$annotation10 === void 0 ? void 0 : (_dataField$annotation11 = _dataField$annotation10.UI) === null || _dataField$annotation11 === void 0 ? void 0 : (_dataField$annotation12 = _dataField$annotation11.Hidden) === null || _dataField$annotation12 === void 0 ? void 0 : _dataField$annotation12.valueOf()) === true) {
        hiddenTableActions.push({
          type: ActionType.Default,
          key: KeyHelper.generateKeyFromDataField(dataField)
        });
      } else if (isDataFieldForActionAbstract(dataField) && ((_dataField$Inline3 = dataField.Inline) === null || _dataField$Inline3 === void 0 ? void 0 : _dataField$Inline3.valueOf()) !== true && ((_dataField$Determinin = dataField.Determining) === null || _dataField$Determinin === void 0 ? void 0 : _dataField$Determinin.valueOf()) !== true) {
        switch (dataField.$Type) {
          case "com.sap.vocabularies.UI.v1.DataFieldForAction":
            tableActions.push({
              type: ActionType.DataFieldForAction,
              annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation13 = dataField.annotations) === null || _dataField$annotation13 === void 0 ? void 0 : (_dataField$annotation14 = _dataField$annotation13.UI) === null || _dataField$annotation14 === void 0 ? void 0 : _dataField$annotation14.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true))),
              isNavigable: true
            });
            break;
          case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
            tableActions.push({
              type: ActionType.DataFieldForIntentBasedNavigation,
              annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation15 = dataField.annotations) === null || _dataField$annotation15 === void 0 ? void 0 : (_dataField$annotation16 = _dataField$annotation15.UI) === null || _dataField$annotation16 === void 0 ? void 0 : _dataField$annotation16.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true)))
            });
            break;
          default:
            break;
        }
      }
    });
    return {
      tableActions,
      hiddenTableActions
    };
  }
  function getHighlightRowBinding(criticalityAnnotation, isDraftRoot, targetEntityType) {
    let defaultHighlightRowDefinition = MessageType.None;
    if (criticalityAnnotation) {
      if (typeof criticalityAnnotation === "object") {
        defaultHighlightRowDefinition = getExpressionFromAnnotation(criticalityAnnotation);
      } else {
        // Enum Value so we get the corresponding static part
        defaultHighlightRowDefinition = getMessageTypeFromCriticalityType(criticalityAnnotation);
      }
    }
    const aMissingKeys = [];
    targetEntityType === null || targetEntityType === void 0 ? void 0 : targetEntityType.keys.forEach(key => {
      if (key.name !== "IsActiveEntity") {
        aMissingKeys.push(pathInModel(key.name, undefined));
      }
    });
    return formatResult([defaultHighlightRowDefinition, pathInModel(`filteredMessages`, "internal"), isDraftRoot && Entity.HasActive, isDraftRoot && Entity.IsActive, `${isDraftRoot}`, ...aMissingKeys], tableFormatters.rowHighlighting, targetEntityType);
  }
  function _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings, visualizationPath) {
    var _newAction2;
    const navigation = (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.create) || (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.detail);
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const originalTableSettings = tableManifestSettings && tableManifestSettings.tableSettings || {};
    // cross-app
    if (navigation !== null && navigation !== void 0 && navigation.outbound && navigation.outboundDetail && navigationSettings !== null && navigationSettings !== void 0 && navigationSettings.create) {
      return {
        mode: "External",
        outbound: navigation.outbound,
        outboundDetail: navigation.outboundDetail,
        navigationSettings: navigationSettings
      };
    }
    let newAction;
    if (lineItemAnnotation) {
      var _converterContext$get14, _targetAnnotationsCom, _targetAnnotationsSes;
      // in-app
      const targetAnnotations = (_converterContext$get14 = converterContext.getEntitySet()) === null || _converterContext$get14 === void 0 ? void 0 : _converterContext$get14.annotations;
      const targetAnnotationsCommon = targetAnnotations === null || targetAnnotations === void 0 ? void 0 : targetAnnotations.Common,
        targetAnnotationsSession = targetAnnotations === null || targetAnnotations === void 0 ? void 0 : targetAnnotations.Session;
      newAction = (targetAnnotationsCommon === null || targetAnnotationsCommon === void 0 ? void 0 : (_targetAnnotationsCom = targetAnnotationsCommon.DraftRoot) === null || _targetAnnotationsCom === void 0 ? void 0 : _targetAnnotationsCom.NewAction) || (targetAnnotationsSession === null || targetAnnotationsSession === void 0 ? void 0 : (_targetAnnotationsSes = targetAnnotationsSession.StickySessionSupported) === null || _targetAnnotationsSes === void 0 ? void 0 : _targetAnnotationsSes.NewAction);
      if (tableManifestConfiguration.creationMode === CreationMode.CreationRow && newAction) {
        // A combination of 'CreationRow' and 'NewAction' does not make sense
        throw Error(`Creation mode '${CreationMode.CreationRow}' can not be used with a custom 'new' action (${newAction})`);
      }
      if (navigation !== null && navigation !== void 0 && navigation.route) {
        var _newAction;
        // route specified
        return {
          mode: tableManifestConfiguration.creationMode,
          append: tableManifestConfiguration.createAtEnd,
          newAction: (_newAction = newAction) === null || _newAction === void 0 ? void 0 : _newAction.toString(),
          navigateToTarget: tableManifestConfiguration.creationMode === CreationMode.NewPage ? navigation.route : undefined // navigate only in NewPage mode
        };
      }
    }

    // no navigation or no route specified - fallback to inline create if original creation mode was 'NewPage'
    if (tableManifestConfiguration.creationMode === CreationMode.NewPage) {
      var _originalTableSetting;
      tableManifestConfiguration.creationMode = CreationMode.Inline;
      // In case there was no specific configuration for the createAtEnd we force it to false
      if (((_originalTableSetting = originalTableSettings.creationMode) === null || _originalTableSetting === void 0 ? void 0 : _originalTableSetting.createAtEnd) === undefined) {
        tableManifestConfiguration.createAtEnd = false;
      }
    }
    return {
      mode: tableManifestConfiguration.creationMode,
      append: tableManifestConfiguration.createAtEnd,
      newAction: (_newAction2 = newAction) === null || _newAction2 === void 0 ? void 0 : _newAction2.toString()
    };
  }
  const _getRowConfigurationProperty = function (lineItemAnnotation, converterContext, navigationSettings, targetPath, tableType) {
    let pressProperty, navigationTarget;
    let criticalityProperty = constant(MessageType.None);
    const targetEntityType = converterContext.getEntityType();
    if (navigationSettings && lineItemAnnotation) {
      var _navigationSettings$d, _navigationSettings$d2;
      navigationTarget = ((_navigationSettings$d = navigationSettings.display) === null || _navigationSettings$d === void 0 ? void 0 : _navigationSettings$d.target) || ((_navigationSettings$d2 = navigationSettings.detail) === null || _navigationSettings$d2 === void 0 ? void 0 : _navigationSettings$d2.outbound);
      if (navigationTarget) {
        pressProperty = ".handlers.onChevronPressNavigateOutBound( $controller ,'" + navigationTarget + "', ${$parameters>bindingContext})";
      } else if (targetEntityType) {
        var _navigationSettings$d3;
        const targetEntitySet = converterContext.getEntitySet();
        navigationTarget = (_navigationSettings$d3 = navigationSettings.detail) === null || _navigationSettings$d3 === void 0 ? void 0 : _navigationSettings$d3.route;
        if (navigationTarget && !ModelHelper.isSingleton(targetEntitySet)) {
          var _lineItemAnnotation$a, _lineItemAnnotation$a2;
          criticalityProperty = getHighlightRowBinding((_lineItemAnnotation$a = lineItemAnnotation.annotations) === null || _lineItemAnnotation$a === void 0 ? void 0 : (_lineItemAnnotation$a2 = _lineItemAnnotation$a.UI) === null || _lineItemAnnotation$a2 === void 0 ? void 0 : _lineItemAnnotation$a2.Criticality, !!ModelHelper.getDraftRoot(targetEntitySet) || !!ModelHelper.getDraftNode(targetEntitySet), targetEntityType);
          pressProperty = "API.onTableRowPress($event, $controller, ${$parameters>bindingContext}, { callExtension: true, targetPath: '" + targetPath + "', editable : " + (ModelHelper.getDraftRoot(targetEntitySet) || ModelHelper.getDraftNode(targetEntitySet) ? "!${$parameters>bindingContext}.getProperty('IsActiveEntity')" : "undefined") + (tableType === "AnalyticalTable" || tableType === "TreeTable" ? ", bRecreateContext: true" : "") + "})"; //Need to access to DraftRoot and DraftNode !!!!!!!
        } else {
          var _lineItemAnnotation$a3, _lineItemAnnotation$a4;
          criticalityProperty = getHighlightRowBinding((_lineItemAnnotation$a3 = lineItemAnnotation.annotations) === null || _lineItemAnnotation$a3 === void 0 ? void 0 : (_lineItemAnnotation$a4 = _lineItemAnnotation$a3.UI) === null || _lineItemAnnotation$a4 === void 0 ? void 0 : _lineItemAnnotation$a4.Criticality, false, targetEntityType);
        }
      }
    }
    const rowNavigatedExpression = formatResult([pathInModel("/deepestPath", "internal")], tableFormatters.navigatedRow, targetEntityType);
    return {
      press: pressProperty,
      action: pressProperty ? "Navigation" : undefined,
      rowHighlighting: compileExpression(criticalityProperty),
      rowNavigated: compileExpression(rowNavigatedExpression),
      visible: compileExpression(not(UI.IsInactive))
    };
  };

  /**
   * Retrieve the columns from the entityType.
   *
   * @param columnsToBeCreated The columns to be created.
   * @param entityType The target entity type.
   * @param annotationColumns The array of columns created based on LineItem annotations.
   * @param nonSortableColumns The array of all non sortable column names.
   * @param converterContext The converter context.
   * @param tableType The table type.
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The column from the entityType
   */
  const getColumnsFromEntityType = function (columnsToBeCreated, entityType) {
    let annotationColumns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    let nonSortableColumns = arguments.length > 3 ? arguments[3] : undefined;
    let converterContext = arguments.length > 4 ? arguments[4] : undefined;
    let tableType = arguments.length > 5 ? arguments[5] : undefined;
    let textOnlyColumnsFromTextAnnotation = arguments.length > 6 ? arguments[6] : undefined;
    const tableColumns = annotationColumns;
    // Catch already existing columns - which were added before by LineItem Annotations
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    entityType.entityProperties.forEach(property => {
      // Catch already existing columns - which were added before by LineItem Annotations
      const exists = annotationColumns.some(column => {
        return column.name === property.name;
      });

      // if target type exists, it is a complex property and should be ignored
      if (!property.targetType && !exists) {
        const relatedPropertiesInfo = collectRelatedProperties(property.name, property, converterContext, true, tableType);
        const relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties);
        const additionalPropertyNames = Object.keys(relatedPropertiesInfo.additionalProperties);
        if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
          // Include text properties found during analysis on getColumnsFromAnnotations
          textOnlyColumnsFromTextAnnotation.push(...relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation);
        }
        const columnInfo = getColumnDefinitionFromProperty(property, converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName), property.name, true, true, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
        const semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
        const oColumnDraftIndicator = getDefaultDraftIndicatorForColumn(columnInfo.name, semanticKeys, false, null);
        if (Object.keys(oColumnDraftIndicator).length > 0) {
          columnInfo.formatOptions = {
            ...oColumnDraftIndicator
          };
        }
        if (relatedPropertyNames.length > 0) {
          columnInfo.propertyInfos = relatedPropertyNames;
          columnInfo.exportSettings = {
            ...columnInfo.exportSettings,
            template: relatedPropertiesInfo.exportSettingsTemplate,
            wrap: relatedPropertiesInfo.exportSettingsWrapping
          };
          columnInfo.exportSettings.type = _getExportDataType(property.type, relatedPropertyNames.length > 1);
          if (relatedPropertiesInfo.exportUnitName) {
            columnInfo.exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
            columnInfo.exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
          } else if (relatedPropertiesInfo.exportUnitString) {
            columnInfo.exportSettings.unit = relatedPropertiesInfo.exportUnitString;
          }
          if (relatedPropertiesInfo.exportTimezoneName) {
            columnInfo.exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
            columnInfo.exportSettings.utc = false;
          } else if (relatedPropertiesInfo.exportTimezoneString) {
            columnInfo.exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
          }
          if (relatedPropertiesInfo.exportDataPointTargetValue) {
            columnInfo.exportDataPointTargetValue = relatedPropertiesInfo.exportDataPointTargetValue;
            columnInfo.exportSettings.type = "String";
          }

          // Collect information of related columns to be created.
          relatedPropertyNames.forEach(name => {
            columnsToBeCreated[name] = relatedPropertiesInfo.properties[name];
          });
        }
        if (additionalPropertyNames.length > 0) {
          columnInfo.additionalPropertyInfos = additionalPropertyNames;
          // Create columns for additional properties identified for ALP use case.
          additionalPropertyNames.forEach(name => {
            // Intentional overwrite as we require only one new PropertyInfo for a related Property.
            columnsToBeCreated[name] = relatedPropertiesInfo.additionalProperties[name];
          });
        }
        tableColumns.push(columnInfo);
      }
      // In case a property has defined a #TextOnly text arrangement don't only create the complex property with the text property as a child property,
      // but also the property itself as it can be used as within the sortConditions or on custom columns.
      // This step must be valide also from the columns added via LineItems or from a column available on the p13n.
      if (getDisplayMode(property) === "Description") {
        nonSortableColumns = nonSortableColumns.concat(property.name);
        tableColumns.push(getColumnDefinitionFromProperty(property, converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName), property.name, false, false, nonSortableColumns, aggregationHelper, converterContext, []));
      }
    });

    // Create a propertyInfo for each related property.
    const relatedColumns = _createRelatedColumns(columnsToBeCreated, tableColumns, nonSortableColumns, converterContext, entityType, textOnlyColumnsFromTextAnnotation);
    return tableColumns.concat(relatedColumns);
  };

  /**
   * Create a column definition from a property.
   *
   * @param property Entity type property for which the column is created
   * @param fullPropertyPath The full path to the target property
   * @param relativePath The relative path to the target property based on the context
   * @param useDataFieldPrefix Should be prefixed with "DataField::", else it will be prefixed with "Property::"
   * @param availableForAdaptation Decides whether the column should be available for adaptation
   * @param nonSortableColumns The array of all non-sortable column names
   * @param aggregationHelper The aggregationHelper for the entity
   * @param converterContext The converter context
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The annotation column definition
   */
  _exports.getColumnsFromEntityType = getColumnsFromEntityType;
  const getColumnDefinitionFromProperty = function (property, fullPropertyPath, relativePath, useDataFieldPrefix, availableForAdaptation, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation) {
    var _property$annotations, _property$annotations2, _property$annotations3, _annotations2, _annotations2$UI;
    const name = useDataFieldPrefix ? relativePath : `Property::${relativePath}`;
    const key = (useDataFieldPrefix ? "DataField::" : "Property::") + replaceSpecialChars(relativePath);
    const semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, property);
    const isHidden = ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf()) === true;
    const groupPath = property.name ? _sliceAtSlash(property.name, true, false) : undefined;
    const isGroup = groupPath != property.name;
    const exportType = _getExportDataType(property.type);
    const sDateInputFormat = property.type === "Edm.Date" ? "YYYY-MM-DD" : undefined;
    const dataType = getDataFieldDataType(property);
    const propertyTypeConfig = getTypeConfig(property, dataType);
    const semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
    const isAPropertyFromTextOnlyAnnotation = textOnlyColumnsFromTextAnnotation && textOnlyColumnsFromTextAnnotation.indexOf(relativePath) >= 0;
    const sortable = (!isHidden || isAPropertyFromTextOnlyAnnotation) && nonSortableColumns.indexOf(relativePath) === -1;
    const typeConfig = {
      className: property.type || dataType,
      formatOptions: propertyTypeConfig.formatOptions,
      constraints: propertyTypeConfig.constraints
    };
    let exportSettings = null;
    if (_isExportableColumn(property)) {
      var _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8, _property$annotations9;
      const unitProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
      const timezoneProperty = getAssociatedTimezoneProperty(property);
      const unitText = ((_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.Measures) === null || _property$annotations5 === void 0 ? void 0 : _property$annotations5.ISOCurrency) || ((_property$annotations6 = property.annotations) === null || _property$annotations6 === void 0 ? void 0 : (_property$annotations7 = _property$annotations6.Measures) === null || _property$annotations7 === void 0 ? void 0 : _property$annotations7.Unit);
      const timezoneText = (_property$annotations8 = property.annotations) === null || _property$annotations8 === void 0 ? void 0 : (_property$annotations9 = _property$annotations8.Common) === null || _property$annotations9 === void 0 ? void 0 : _property$annotations9.Timezone;
      exportSettings = {
        type: exportType,
        inputFormat: sDateInputFormat,
        scale: property.scale,
        delimiter: property.type === "Edm.Int64"
      };
      if (unitProperty) {
        exportSettings.unitProperty = unitProperty.name;
        exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
      } else if (unitText) {
        exportSettings.unit = `${unitText}`;
      }
      if (timezoneProperty) {
        exportSettings.timezoneProperty = timezoneProperty.name;
        exportSettings.utc = false;
      } else if (timezoneText) {
        exportSettings.timezone = timezoneText.toString();
      }
    }
    const collectedNavigationPropertyLabels = _getCollectedNavigationPropertyLabels(relativePath, converterContext);
    const column = {
      key: key,
      type: ColumnType.Annotation,
      label: getLabel(property, isGroup),
      groupLabel: isGroup ? getLabel(property) : undefined,
      group: isGroup ? groupPath : undefined,
      annotationPath: fullPropertyPath,
      semanticObjectPath: semanticObjectAnnotationPath,
      availability: !availableForAdaptation || isHidden ? AvailabilityType.Hidden : AvailabilityType.Adaptation,
      name: name,
      relativePath: relativePath,
      sortable: sortable,
      isGroupable: aggregationHelper.isAnalyticsSupported() ? !!aggregationHelper.isPropertyGroupable(property) : sortable,
      isKey: property.isKey,
      exportSettings: exportSettings,
      caseSensitive: isFilteringCaseSensitive(converterContext),
      typeConfig: typeConfig,
      importance: getImportance((_annotations2 = property.annotations) === null || _annotations2 === void 0 ? void 0 : (_annotations2$UI = _annotations2.UI) === null || _annotations2$UI === void 0 ? void 0 : _annotations2$UI.DataFieldDefault, semanticKeys),
      additionalLabels: collectedNavigationPropertyLabels
    };
    const sTooltip = _getTooltip(property);
    if (sTooltip) {
      column.tooltip = sTooltip;
    }
    const targetValuefromDP = getTargetValueOnDataPoint(property);
    if (isDataPointFromDataFieldDefault(property) && typeof targetValuefromDP === "string" && column.exportSettings) {
      column.exportDataPointTargetValue = targetValuefromDP;
      column.exportSettings.template = "{0}/" + targetValuefromDP;
    }
    return column;
  };

  /**
   * Returns Boolean true for exportable columns, false for non exportable columns.
   *
   * @param source The dataField or property to be evaluated
   * @returns True for exportable column, false for non exportable column
   * @private
   */

  function _isExportableColumn(source) {
    var _annotations$UI2;
    let propertyType, property;
    const dataFieldDefaultProperty = (_annotations$UI2 = source.annotations.UI) === null || _annotations$UI2 === void 0 ? void 0 : _annotations$UI2.DataFieldDefault;
    if (isProperty(source) && dataFieldDefaultProperty !== null && dataFieldDefaultProperty !== void 0 && dataFieldDefaultProperty.$Type) {
      if (isReferencePropertyStaticallyHidden(dataFieldDefaultProperty) === true) {
        return false;
      }
      propertyType = dataFieldDefaultProperty === null || dataFieldDefaultProperty === void 0 ? void 0 : dataFieldDefaultProperty.$Type;
    } else if (isReferencePropertyStaticallyHidden(source) === true) {
      return false;
    } else {
      var _Target, _Target$$target, _Value, _Value$$target, _Value$$target$annota, _Value$$target$annota2, _Value$$target$annota3, _Value2, _Value2$$target, _Value2$$target$annot, _Value2$$target$annot2;
      property = source;
      propertyType = property.$Type;
      if (propertyType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (_Target = property.Target) !== null && _Target !== void 0 && (_Target$$target = _Target.$target) !== null && _Target$$target !== void 0 && _Target$$target.$Type) {
        var _Target2, _Target2$$target;
        //For Chart
        propertyType = (_Target2 = property.Target) === null || _Target2 === void 0 ? void 0 : (_Target2$$target = _Target2.$target) === null || _Target2$$target === void 0 ? void 0 : _Target2$$target.$Type;
        return "com.sap.vocabularies.UI.v1.ChartDefinitionType".indexOf(propertyType) === -1;
      } else if (((_Value = property.Value) === null || _Value === void 0 ? void 0 : (_Value$$target = _Value.$target) === null || _Value$$target === void 0 ? void 0 : (_Value$$target$annota = _Value$$target.annotations) === null || _Value$$target$annota === void 0 ? void 0 : (_Value$$target$annota2 = _Value$$target$annota.Core) === null || _Value$$target$annota2 === void 0 ? void 0 : (_Value$$target$annota3 = _Value$$target$annota2.MediaType) === null || _Value$$target$annota3 === void 0 ? void 0 : _Value$$target$annota3.term) === "Org.OData.Core.V1.MediaType" && ((_Value2 = property.Value) === null || _Value2 === void 0 ? void 0 : (_Value2$$target = _Value2.$target) === null || _Value2$$target === void 0 ? void 0 : (_Value2$$target$annot = _Value2$$target.annotations) === null || _Value2$$target$annot === void 0 ? void 0 : (_Value2$$target$annot2 = _Value2$$target$annot.Core) === null || _Value2$$target$annot2 === void 0 ? void 0 : _Value2$$target$annot2.isURL) !== true) {
        //For Stream
        return false;
      }
    }
    return propertyType ? ["com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldForActionGroup"].indexOf(propertyType) === -1 : true;
  }

  /**
   * Returns Boolean true for valid columns, false for invalid columns.
   *
   * @param dataField Different DataField types defined in the annotations
   * @returns True for valid columns, false for invalid columns
   * @private
   */
  const _isValidColumn = function (dataField) {
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        return !!dataField.Inline;
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        return true;
      default:
      // Todo: Replace with proper Log statement once available
      //  throw new Error("Unhandled DataField Abstract type: " + dataField.$Type);
    }
  };
  /**
   * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
   *
   * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
   *
   * @param dataFieldModelPath The metapath referring to the annotation that is evaluated by SAP Fiori elements.
   * @param [formatOptions] FormatOptions optional.
   * @param formatOptions.isAnalytics This flag is used to check if the analytic table has GroupHeader expanded.
   * @returns An expression that you can bind to the UI.
   */
  const _getVisibleExpression = function (dataFieldModelPath, formatOptions) {
    var _targetObject$Target, _targetObject$Target$, _targetObject$annotat, _targetObject$annotat2, _propertyValue$annota, _propertyValue$annota2;
    const targetObject = dataFieldModelPath.targetObject;
    let propertyValue;
    if (targetObject) {
      switch (targetObject.$Type) {
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        case "com.sap.vocabularies.UI.v1.DataPointType":
          propertyValue = targetObject.Value.$target;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          // if it is a DataFieldForAnnotation pointing to a DataPoint we look at the dataPoint's value
          if ((targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$Target = targetObject.Target) === null || _targetObject$Target === void 0 ? void 0 : (_targetObject$Target$ = _targetObject$Target.$target) === null || _targetObject$Target$ === void 0 ? void 0 : _targetObject$Target$.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _targetObject$Target$2;
            propertyValue = (_targetObject$Target$2 = targetObject.Target.$target) === null || _targetObject$Target$2 === void 0 ? void 0 : _targetObject$Target$2.Value.$target;
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        default:
          propertyValue = undefined;
      }
    }
    const isAnalyticalGroupHeaderExpanded = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? UI.IsExpanded : constant(false);
    const isAnalyticalLeaf = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? equal(UI.NodeLevel, 0) : constant(false);

    // A data field is visible if:
    // - the UI.Hidden expression in the original annotation does not evaluate to 'true'
    // - the UI.Hidden expression in the target property does not evaluate to 'true'
    // - in case of Analytics it's not visible for an expanded GroupHeader
    return and(...[not(equal(getExpressionFromAnnotation(targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$annotat = targetObject.annotations) === null || _targetObject$annotat === void 0 ? void 0 : (_targetObject$annotat2 = _targetObject$annotat.UI) === null || _targetObject$annotat2 === void 0 ? void 0 : _targetObject$annotat2.Hidden), true)), ifElse(!!propertyValue, propertyValue && not(equal(getExpressionFromAnnotation((_propertyValue$annota = propertyValue.annotations) === null || _propertyValue$annota === void 0 ? void 0 : (_propertyValue$annota2 = _propertyValue$annota.UI) === null || _propertyValue$annota2 === void 0 ? void 0 : _propertyValue$annota2.Hidden), true)), true), or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)]);
  };

  /**
   * Returns hidden binding expressions for a field group.
   *
   * @param dataFieldGroup DataField defined in the annotations
   * @param fieldFormatOptions FormatOptions optional.
   * @returns Compile binding of field group expressions.
   * @private
   */
  _exports._getVisibleExpression = _getVisibleExpression;
  const _getFieldGroupHiddenExpressions = function (dataFieldGroup, fieldFormatOptions) {
    var _dataFieldGroup$Targe, _dataFieldGroup$Targe2;
    const fieldGroupHiddenExpressions = [];
    if (dataFieldGroup.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_dataFieldGroup$Targe = dataFieldGroup.Target) === null || _dataFieldGroup$Targe === void 0 ? void 0 : (_dataFieldGroup$Targe2 = _dataFieldGroup$Targe.$target) === null || _dataFieldGroup$Targe2 === void 0 ? void 0 : _dataFieldGroup$Targe2.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
      var _dataFieldGroup$annot, _dataFieldGroup$annot2;
      if (dataFieldGroup !== null && dataFieldGroup !== void 0 && (_dataFieldGroup$annot = dataFieldGroup.annotations) !== null && _dataFieldGroup$annot !== void 0 && (_dataFieldGroup$annot2 = _dataFieldGroup$annot.UI) !== null && _dataFieldGroup$annot2 !== void 0 && _dataFieldGroup$annot2.Hidden) {
        return compileExpression(not(equal(getExpressionFromAnnotation(dataFieldGroup.annotations.UI.Hidden), true)));
      } else {
        var _dataFieldGroup$Targe3;
        (_dataFieldGroup$Targe3 = dataFieldGroup.Target.$target.Data) === null || _dataFieldGroup$Targe3 === void 0 ? void 0 : _dataFieldGroup$Targe3.forEach(innerDataField => {
          fieldGroupHiddenExpressions.push(_getVisibleExpression({
            targetObject: innerDataField
          }, fieldFormatOptions));
        });
        return compileExpression(ifElse(or(...fieldGroupHiddenExpressions), constant(true), constant(false)));
      }
    } else {
      return undefined;
    }
  };

  /**
   * Returns the label for the property and dataField.
   *
   * @param [property] Property, DataField or Navigation Property defined in the annotations
   * @param isGroup
   * @returns Label of the property or DataField
   * @private
   */
  const getLabel = function (property) {
    let isGroup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!property) {
      return undefined;
    }
    if (isProperty(property) || isNavigationProperty(property)) {
      var _annotations3, _annotations3$UI, _dataFieldDefault$Lab, _property$annotations10, _property$annotations11;
      const dataFieldDefault = (_annotations3 = property.annotations) === null || _annotations3 === void 0 ? void 0 : (_annotations3$UI = _annotations3.UI) === null || _annotations3$UI === void 0 ? void 0 : _annotations3$UI.DataFieldDefault;
      if (dataFieldDefault && !dataFieldDefault.qualifier && (_dataFieldDefault$Lab = dataFieldDefault.Label) !== null && _dataFieldDefault$Lab !== void 0 && _dataFieldDefault$Lab.valueOf()) {
        var _dataFieldDefault$Lab2;
        return compileExpression(getExpressionFromAnnotation((_dataFieldDefault$Lab2 = dataFieldDefault.Label) === null || _dataFieldDefault$Lab2 === void 0 ? void 0 : _dataFieldDefault$Lab2.valueOf()));
      }
      return compileExpression(getExpressionFromAnnotation(((_property$annotations10 = property.annotations.Common) === null || _property$annotations10 === void 0 ? void 0 : (_property$annotations11 = _property$annotations10.Label) === null || _property$annotations11 === void 0 ? void 0 : _property$annotations11.valueOf()) || property.name));
    } else if (isDataFieldTypes(property)) {
      var _property$Label2, _property$Value, _property$Value$$targ, _property$Value$$targ2, _property$Value$$targ3, _property$Value$$targ4, _property$Value2, _property$Value2$$tar;
      if (!!isGroup && property.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation") {
        var _property$Label;
        return compileExpression(getExpressionFromAnnotation((_property$Label = property.Label) === null || _property$Label === void 0 ? void 0 : _property$Label.valueOf()));
      }
      return compileExpression(getExpressionFromAnnotation(((_property$Label2 = property.Label) === null || _property$Label2 === void 0 ? void 0 : _property$Label2.valueOf()) || ((_property$Value = property.Value) === null || _property$Value === void 0 ? void 0 : (_property$Value$$targ = _property$Value.$target) === null || _property$Value$$targ === void 0 ? void 0 : (_property$Value$$targ2 = _property$Value$$targ.annotations) === null || _property$Value$$targ2 === void 0 ? void 0 : (_property$Value$$targ3 = _property$Value$$targ2.Common) === null || _property$Value$$targ3 === void 0 ? void 0 : (_property$Value$$targ4 = _property$Value$$targ3.Label) === null || _property$Value$$targ4 === void 0 ? void 0 : _property$Value$$targ4.valueOf()) || ((_property$Value2 = property.Value) === null || _property$Value2 === void 0 ? void 0 : (_property$Value2$$tar = _property$Value2.$target) === null || _property$Value2$$tar === void 0 ? void 0 : _property$Value2$$tar.name)));
    } else if (property.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      var _property$Label3, _property$Target, _property$Target$$tar, _property$Target$$tar2, _property$Target$$tar3, _property$Target$$tar4, _property$Target$$tar5, _property$Target$$tar6;
      return compileExpression(getExpressionFromAnnotation(((_property$Label3 = property.Label) === null || _property$Label3 === void 0 ? void 0 : _property$Label3.valueOf()) || ((_property$Target = property.Target) === null || _property$Target === void 0 ? void 0 : (_property$Target$$tar = _property$Target.$target) === null || _property$Target$$tar === void 0 ? void 0 : (_property$Target$$tar2 = _property$Target$$tar.Value) === null || _property$Target$$tar2 === void 0 ? void 0 : (_property$Target$$tar3 = _property$Target$$tar2.$target) === null || _property$Target$$tar3 === void 0 ? void 0 : (_property$Target$$tar4 = _property$Target$$tar3.annotations) === null || _property$Target$$tar4 === void 0 ? void 0 : (_property$Target$$tar5 = _property$Target$$tar4.Common) === null || _property$Target$$tar5 === void 0 ? void 0 : (_property$Target$$tar6 = _property$Target$$tar5.Label) === null || _property$Target$$tar6 === void 0 ? void 0 : _property$Target$$tar6.valueOf())));
    } else {
      var _property$Label4;
      return compileExpression(getExpressionFromAnnotation((_property$Label4 = property.Label) === null || _property$Label4 === void 0 ? void 0 : _property$Label4.valueOf()));
    }
  };
  const _getTooltip = function (source) {
    var _source$annotations, _source$annotations$C;
    if (!source) {
      return undefined;
    }
    if (isProperty(source) || (_source$annotations = source.annotations) !== null && _source$annotations !== void 0 && (_source$annotations$C = _source$annotations.Common) !== null && _source$annotations$C !== void 0 && _source$annotations$C.QuickInfo) {
      var _source$annotations2, _source$annotations2$;
      return (_source$annotations2 = source.annotations) !== null && _source$annotations2 !== void 0 && (_source$annotations2$ = _source$annotations2.Common) !== null && _source$annotations2$ !== void 0 && _source$annotations2$.QuickInfo ? compileExpression(getExpressionFromAnnotation(source.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else if (isDataFieldTypes(source)) {
      var _source$Value, _source$Value$$target, _source$Value$$target2, _source$Value$$target3;
      return (_source$Value = source.Value) !== null && _source$Value !== void 0 && (_source$Value$$target = _source$Value.$target) !== null && _source$Value$$target !== void 0 && (_source$Value$$target2 = _source$Value$$target.annotations) !== null && _source$Value$$target2 !== void 0 && (_source$Value$$target3 = _source$Value$$target2.Common) !== null && _source$Value$$target3 !== void 0 && _source$Value$$target3.QuickInfo ? compileExpression(getExpressionFromAnnotation(source.Value.$target.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else if (source.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      var _source$Target, _datapointTarget$Valu, _datapointTarget$Valu2, _datapointTarget$Valu3, _datapointTarget$Valu4;
      const datapointTarget = (_source$Target = source.Target) === null || _source$Target === void 0 ? void 0 : _source$Target.$target;
      return datapointTarget !== null && datapointTarget !== void 0 && (_datapointTarget$Valu = datapointTarget.Value) !== null && _datapointTarget$Valu !== void 0 && (_datapointTarget$Valu2 = _datapointTarget$Valu.$target) !== null && _datapointTarget$Valu2 !== void 0 && (_datapointTarget$Valu3 = _datapointTarget$Valu2.annotations) !== null && _datapointTarget$Valu3 !== void 0 && (_datapointTarget$Valu4 = _datapointTarget$Valu3.Common) !== null && _datapointTarget$Valu4 !== void 0 && _datapointTarget$Valu4.QuickInfo ? compileExpression(getExpressionFromAnnotation(datapointTarget.Value.$target.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else {
      return undefined;
    }
  };
  function getRowStatusVisibility(colName, isSemanticKeyInFieldGroup) {
    return formatResult([pathInModel(`semanticKeyHasDraftIndicator`, "internal"), pathInModel(`filteredMessages`, "internal"), colName, isSemanticKeyInFieldGroup], tableFormatters.getErrorStatusTextVisibilityFormatter);
  }

  /**
   * Creates a PropertyInfo for each identified property consumed by a LineItem.
   *
   * @param columnsToBeCreated Identified properties.
   * @param existingColumns The list of columns created for LineItems and Properties of entityType.
   * @param nonSortableColumns The array of column names which cannot be sorted.
   * @param converterContext The converter context.
   * @param entityType The entity type for the LineItem
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The array of columns created.
   */
  _exports.getRowStatusVisibility = getRowStatusVisibility;
  const _createRelatedColumns = function (columnsToBeCreated, existingColumns, nonSortableColumns, converterContext, entityType, textOnlyColumnsFromTextAnnotation) {
    const relatedColumns = [];
    const relatedPropertyNameMap = {};
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    Object.keys(columnsToBeCreated).forEach(name => {
      const property = columnsToBeCreated[name],
        annotationPath = converterContext.getAbsoluteAnnotationPath(name),
        // Check whether the related column already exists.
        relatedColumn = existingColumns.find(column => column.name === name);
      if (relatedColumn === undefined) {
        // Case 1: Key contains DataField prefix to ensure all property columns have the same key format.
        // New created property column is set to hidden.
        relatedColumns.push(getColumnDefinitionFromProperty(property, annotationPath, name, true, false, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation));
      } else if (relatedColumn.annotationPath !== annotationPath || relatedColumn.propertyInfos) {
        // Case 2: The existing column points to a LineItem (or)
        // Case 3: This is a self reference from an existing column

        const newName = `Property::${name}`;

        // Checking whether the related property column has already been created in a previous iteration.
        if (!existingColumns.some(column => column.name === newName)) {
          // Create a new property column with 'Property::' prefix,
          // Set it to hidden as it is only consumed by Complex property infos.
          const column = getColumnDefinitionFromProperty(property, annotationPath, name, false, false, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
          column.isPartOfLineItem = relatedColumn.isPartOfLineItem;
          relatedColumns.push(column);
          relatedPropertyNameMap[name] = newName;
        } else if (existingColumns.some(column => column.name === newName) && existingColumns.some(column => {
          var _column$propertyInfos;
          return (_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.includes(name);
        })) {
          relatedPropertyNameMap[name] = newName;
        }
      }
    });

    // The property 'name' has been prefixed with 'Property::' for uniqueness.
    // Update the same in other propertyInfos[] references which point to this property.
    existingColumns.forEach(column => {
      var _column$propertyInfos2, _column$additionalPro;
      column.propertyInfos = (_column$propertyInfos2 = column.propertyInfos) === null || _column$propertyInfos2 === void 0 ? void 0 : _column$propertyInfos2.map(propertyInfo => relatedPropertyNameMap[propertyInfo] ?? propertyInfo);
      column.additionalPropertyInfos = (_column$additionalPro = column.additionalPropertyInfos) === null || _column$additionalPro === void 0 ? void 0 : _column$additionalPro.map(propertyInfo => relatedPropertyNameMap[propertyInfo] ?? propertyInfo);
    });
    return relatedColumns;
  };

  /**
   * Getting the Column Name
   * If it points to a DataField with one property or DataPoint with one property, it will use the property name
   * here to be consistent with the existing flex changes.
   *
   * @param dataField Different DataField types defined in the annotations
   * @returns The name of annotation columns
   * @private
   */
  const _getAnnotationColumnName = function (dataField) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    // This is needed as we have flexibility changes already that we have to check against
    if (isDataFieldTypes(dataField)) {
      var _dataField$Value;
      return (_dataField$Value = dataField.Value) === null || _dataField$Value === void 0 ? void 0 : _dataField$Value.path;
    } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (_dataField$Target = dataField.Target) !== null && _dataField$Target !== void 0 && (_dataField$Target$$ta = _dataField$Target.$target) !== null && _dataField$Target$$ta !== void 0 && (_dataField$Target$$ta2 = _dataField$Target$$ta.Value) !== null && _dataField$Target$$ta2 !== void 0 && _dataField$Target$$ta2.path) {
      var _dataField$Target2, _dataField$Target2$$t;
      // This is for removing duplicate properties. For example, 'Progress' Property is removed if it is already defined as a DataPoint
      return (_dataField$Target2 = dataField.Target) === null || _dataField$Target2 === void 0 ? void 0 : (_dataField$Target2$$t = _dataField$Target2.$target) === null || _dataField$Target2$$t === void 0 ? void 0 : _dataField$Target2$$t.Value.path;
    } else {
      return KeyHelper.generateKeyFromDataField(dataField);
    }
  };

  /**
   * Creates a PropertyInfo for the identified additional property for the ALP table use-case.
   *
   * For e.g. If UI.Hidden points to a property, include this technical property in the additionalProperties of ComplexPropertyInfo object.
   *
   * @param name The name of the property to be created.
   * @param columns The list of columns created for LineItems and Properties of entityType from the table visualization.
   * @returns The propertyInfo of the technical property to be added to the list of columns.
   * @private
   */

  const createTechnicalProperty = function (name, columns, relatedAdditionalPropertyNameMap) {
    const key = `Property_Technical::${name}`;
    // Validate if the technical property hasn't yet been created on previous iterations.
    const columnExists = columns.find(column => column.key === key);
    // Retrieve the simple property used by the hidden annotation, it will be used as a base for the mandatory attributes of newly created technical property. For e.g. relativePath
    const additionalProperty = !columnExists && columns.find(column => column.name === name && !column.propertyInfos);
    if (additionalProperty) {
      const technicalColumn = {
        key: key,
        type: ColumnType.Annotation,
        label: additionalProperty.label,
        annotationPath: additionalProperty.annotationPath,
        availability: AvailabilityType.Hidden,
        name: key,
        relativePath: additionalProperty.relativePath,
        sortable: false,
        isGroupable: false,
        isKey: false,
        exportSettings: null,
        caseSensitive: false,
        aggregatable: false,
        extension: {
          technicallyGroupable: true,
          technicallyAggregatable: true
        }
      };
      columns.push(technicalColumn);
      relatedAdditionalPropertyNameMap[name] = technicalColumn.name;
    }
  };

  /**
   * Determines if the data field labels have to be displayed in the table.
   *
   * @param fieldGroupName The `DataField` name being processed.
   * @param visualizationPath
   * @param converterContext
   * @returns `showDataFieldsLabel` value from the manifest
   * @private
   */
  const _getShowDataFieldsLabel = function (fieldGroupName, visualizationPath, converterContext) {
    var _converterContext$get15;
    const oColumns = (_converterContext$get15 = converterContext.getManifestControlConfiguration(visualizationPath)) === null || _converterContext$get15 === void 0 ? void 0 : _converterContext$get15.columns;
    const aColumnKeys = oColumns && Object.keys(oColumns);
    return aColumnKeys && !!aColumnKeys.find(function (key) {
      return key === fieldGroupName && oColumns[key].showDataFieldsLabel;
    });
  };

  /**
   * Determines the relative path of the property with respect to the root entity.
   *
   * @param dataField The `DataField` being processed.
   * @returns The relative path
   */
  const _getRelativePath = function (dataField) {
    var _Value3, _dataField$Target3;
    let relativePath = "";
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        relativePath = dataField === null || dataField === void 0 ? void 0 : (_Value3 = dataField.Value) === null || _Value3 === void 0 ? void 0 : _Value3.path;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        relativePath = dataField === null || dataField === void 0 ? void 0 : (_dataField$Target3 = dataField.Target) === null || _dataField$Target3 === void 0 ? void 0 : _dataField$Target3.value;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldForActionGroup":
      case "com.sap.vocabularies.UI.v1.DataFieldWithActionGroup":
        relativePath = KeyHelper.generateKeyFromDataField(dataField);
        break;
    }
    return relativePath;
  };
  const _sliceAtSlash = function (path, isLastSlash, isLastPart) {
    const iSlashIndex = isLastSlash ? path.lastIndexOf("/") : path.indexOf("/");
    if (iSlashIndex === -1) {
      return path;
    }
    return isLastPart ? path.substring(iSlashIndex + 1, path.length) : path.substring(0, iSlashIndex);
  };

  /**
   * Determines if the column contains a multi-value field.
   *
   * @param dataField The DataField being processed
   * @param converterContext The converter context
   * @returns True if the DataField corresponds to a multi-value field.
   */
  const _isColumnMultiValued = function (dataField, converterContext) {
    if (isDataFieldTypes(dataField) && isPathExpression(dataField.Value)) {
      const propertyObjectPath = enhanceDataModelPath(converterContext.getDataModelObjectPath(), dataField.Value.path);
      return isMultiValueField(propertyObjectPath);
    } else {
      return false;
    }
  };

  /**
   * Determine whether a column is sortable.
   *
   * @param dataField The data field being processed
   * @param propertyPath The property path
   * @param nonSortableColumns Collection of non-sortable column names as per annotation
   * @returns True if the column is sortable
   */
  const _isColumnSortable = function (dataField, propertyPath, nonSortableColumns) {
    return nonSortableColumns.indexOf(propertyPath) === -1 && (
    // Column is not marked as non-sortable via annotation
    dataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction");
  };

  /**
   * Returns whether filtering on the table is case sensitive.
   *
   * @param converterContext The instance of the converter context
   * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
   */
  const isFilteringCaseSensitive = function (converterContext) {
    const filterFunctions = _getFilterFunctions(converterContext);
    return Array.isArray(filterFunctions) ? filterFunctions.indexOf("tolower") === -1 : true;
  };
  _exports.isFilteringCaseSensitive = isFilteringCaseSensitive;
  function _getFilterFunctions(ConverterContext) {
    var _ConverterContext$get, _ConverterContext$get2, _ConverterContext$get3, _ConverterContext$get4, _ConverterContext$get5;
    if (ModelHelper.isSingleton(ConverterContext.getEntitySet())) {
      return undefined;
    }
    const capabilities = (_ConverterContext$get = ConverterContext.getEntitySet()) === null || _ConverterContext$get === void 0 ? void 0 : (_ConverterContext$get2 = _ConverterContext$get.annotations) === null || _ConverterContext$get2 === void 0 ? void 0 : _ConverterContext$get2.Capabilities;
    return (capabilities === null || capabilities === void 0 ? void 0 : capabilities.FilterFunctions) || ((_ConverterContext$get3 = ConverterContext.getEntityContainer()) === null || _ConverterContext$get3 === void 0 ? void 0 : (_ConverterContext$get4 = _ConverterContext$get3.annotations) === null || _ConverterContext$get4 === void 0 ? void 0 : (_ConverterContext$get5 = _ConverterContext$get4.Capabilities) === null || _ConverterContext$get5 === void 0 ? void 0 : _ConverterContext$get5.FilterFunctions);
  }

  /**
   * Returns default format options for text fields in a table.
   *
   * @param formatOptions
   * @returns Collection of format options with default values
   */
  function _getDefaultFormatOptionsForTable(formatOptions) {
    return formatOptions === undefined ? undefined : {
      textLinesEdit: 4,
      ...formatOptions
    };
  }
  function _findSemanticKeyValues(semanticKeys, name) {
    const aSemanticKeyValues = [];
    let bSemanticKeyFound = false;
    for (let i = 0; i < semanticKeys.length; i++) {
      aSemanticKeyValues.push(semanticKeys[i].value);
      if (semanticKeys[i].value === name) {
        bSemanticKeyFound = true;
      }
    }
    return {
      values: aSemanticKeyValues,
      semanticKeyFound: bSemanticKeyFound
    };
  }
  function _findProperties(semanticKeyValues, fieldGroupProperties) {
    let semanticKeyHasPropertyInFieldGroup = false;
    let sPropertyPath;
    if (semanticKeyValues && semanticKeyValues.length >= 1 && fieldGroupProperties && fieldGroupProperties.length >= 1) {
      for (let i = 0; i < semanticKeyValues.length; i++) {
        if ([semanticKeyValues[i]].some(tmp => fieldGroupProperties.indexOf(tmp) >= 0)) {
          semanticKeyHasPropertyInFieldGroup = true;
          sPropertyPath = semanticKeyValues[i];
          break;
        }
      }
    }
    return {
      semanticKeyHasPropertyInFieldGroup: semanticKeyHasPropertyInFieldGroup,
      fieldGroupPropertyPath: sPropertyPath
    };
  }
  function _findSemanticKeyValuesInFieldGroup(dataFieldGroup, semanticKeyValues) {
    var _dataFieldGroup$Targe4, _dataFieldGroup$Targe5;
    const aProperties = [];
    let _propertiesFound = {
      semanticKeyHasPropertyInFieldGroup: false,
      fieldGroupPropertyPath: undefined
    };
    if (dataFieldGroup && dataFieldGroup.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_dataFieldGroup$Targe4 = dataFieldGroup.Target) === null || _dataFieldGroup$Targe4 === void 0 ? void 0 : (_dataFieldGroup$Targe5 = _dataFieldGroup$Targe4.$target) === null || _dataFieldGroup$Targe5 === void 0 ? void 0 : _dataFieldGroup$Targe5.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
      var _dataFieldGroup$Targe6;
      (_dataFieldGroup$Targe6 = dataFieldGroup.Target.$target.Data) === null || _dataFieldGroup$Targe6 === void 0 ? void 0 : _dataFieldGroup$Targe6.forEach(innerDataField => {
        if ((innerDataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || innerDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") && innerDataField.Value) {
          aProperties.push(innerDataField.Value.path);
        }
        _propertiesFound = _findProperties(semanticKeyValues, aProperties);
      });
    }
    return {
      semanticKeyHasPropertyInFieldGroup: _propertiesFound.semanticKeyHasPropertyInFieldGroup,
      propertyPath: _propertiesFound.fieldGroupPropertyPath
    };
  }

  /**
   * Returns default format options with draftIndicator for a column.
   *
   * @param name
   * @param semanticKeys
   * @param isFieldGroupColumn
   * @param dataFieldGroup
   * @returns Collection of format options with default values
   */
  function getDefaultDraftIndicatorForColumn(name, semanticKeys, isFieldGroupColumn, dataFieldGroup) {
    if (!semanticKeys) {
      return {};
    }
    const semanticKey = _findSemanticKeyValues(semanticKeys, name);
    const semanticKeyInFieldGroup = _findSemanticKeyValuesInFieldGroup(dataFieldGroup, semanticKey.values);
    if (semanticKey.semanticKeyFound) {
      const formatOptionsObj = {
        hasDraftIndicator: true,
        semantickeys: semanticKey.values,
        objectStatusTextVisibility: compileExpression(getRowStatusVisibility(name, false))
      };
      if (isFieldGroupColumn && semanticKeyInFieldGroup.semanticKeyHasPropertyInFieldGroup) {
        formatOptionsObj["objectStatusTextVisibility"] = compileExpression(getRowStatusVisibility(name, true));
        formatOptionsObj["fieldGroupDraftIndicatorPropertyPath"] = semanticKeyInFieldGroup.propertyPath;
      }
      return formatOptionsObj;
    } else if (!semanticKeyInFieldGroup.semanticKeyHasPropertyInFieldGroup) {
      return {};
    } else {
      // Semantic Key has a property in a FieldGroup
      return {
        fieldGroupDraftIndicatorPropertyPath: semanticKeyInFieldGroup.propertyPath,
        fieldGroupName: name,
        objectStatusTextVisibility: compileExpression(getRowStatusVisibility(name, true))
      };
    }
  }
  function _getImpNumber(dataField) {
    var _dataField$annotation17, _dataField$annotation18;
    const importance = dataField === null || dataField === void 0 ? void 0 : (_dataField$annotation17 = dataField.annotations) === null || _dataField$annotation17 === void 0 ? void 0 : (_dataField$annotation18 = _dataField$annotation17.UI) === null || _dataField$annotation18 === void 0 ? void 0 : _dataField$annotation18.Importance;
    if (importance && importance.includes("UI.ImportanceType/High")) {
      return 3;
    }
    if (importance && importance.includes("UI.ImportanceType/Medium")) {
      return 2;
    }
    if (importance && importance.includes("UI.ImportanceType/Low")) {
      return 1;
    }
    return 0;
  }
  function _getDataFieldImportance(dataField) {
    var _dataField$annotation19, _dataField$annotation20;
    const importance = dataField === null || dataField === void 0 ? void 0 : (_dataField$annotation19 = dataField.annotations) === null || _dataField$annotation19 === void 0 ? void 0 : (_dataField$annotation20 = _dataField$annotation19.UI) === null || _dataField$annotation20 === void 0 ? void 0 : _dataField$annotation20.Importance;
    return importance ? importance.split("/")[1] : Importance.None;
  }
  function _getMaxImportance(fields) {
    if (fields && fields.length > 0) {
      let maxImpNumber = -1;
      let impNumber = -1;
      let DataFieldWithMaxImportance;
      for (const field of fields) {
        impNumber = _getImpNumber(field);
        if (impNumber > maxImpNumber) {
          maxImpNumber = impNumber;
          DataFieldWithMaxImportance = field;
        }
      }
      return _getDataFieldImportance(DataFieldWithMaxImportance);
    }
    return Importance.None;
  }

  /**
   * Returns the importance value for a column.
   *
   * @param dataField
   * @param semanticKeys
   * @returns The importance value
   */
  function getImportance(dataField, semanticKeys) {
    var _Value6;
    //Evaluate default Importance is not set explicitly
    let fieldsWithImportance, mapSemanticKeys;
    //Check if semanticKeys are defined at the EntitySet level
    if (semanticKeys && semanticKeys.length > 0) {
      mapSemanticKeys = semanticKeys.map(function (key) {
        return key.value;
      });
    }
    if (!dataField) {
      return undefined;
    }
    if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      const fieldGroupData = dataField.Target["$target"]["Data"],
        fieldGroupHasSemanticKey = fieldGroupData && fieldGroupData.some(function (fieldGroupDataField) {
          var _Value4, _Value5;
          return (fieldGroupDataField === null || fieldGroupDataField === void 0 ? void 0 : (_Value4 = fieldGroupDataField.Value) === null || _Value4 === void 0 ? void 0 : _Value4.path) && fieldGroupDataField.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && mapSemanticKeys && mapSemanticKeys.includes(fieldGroupDataField === null || fieldGroupDataField === void 0 ? void 0 : (_Value5 = fieldGroupDataField.Value) === null || _Value5 === void 0 ? void 0 : _Value5.path);
        });
      //If a FieldGroup contains a semanticKey, importance set to High
      if (fieldGroupHasSemanticKey) {
        return Importance.High;
      } else {
        var _dataField$annotation21, _dataField$annotation22;
        //If the DataFieldForAnnotation has an Importance we take it
        if (dataField !== null && dataField !== void 0 && (_dataField$annotation21 = dataField.annotations) !== null && _dataField$annotation21 !== void 0 && (_dataField$annotation22 = _dataField$annotation21.UI) !== null && _dataField$annotation22 !== void 0 && _dataField$annotation22.Importance) {
          return _getDataFieldImportance(dataField);
        }
        // else the highest importance (if any) is returned
        fieldsWithImportance = fieldGroupData && fieldGroupData.filter(function (item) {
          var _item$annotations, _item$annotations$UI;
          return item === null || item === void 0 ? void 0 : (_item$annotations = item.annotations) === null || _item$annotations === void 0 ? void 0 : (_item$annotations$UI = _item$annotations.UI) === null || _item$annotations$UI === void 0 ? void 0 : _item$annotations$UI.Importance;
        });
        return _getMaxImportance(fieldsWithImportance);
      }
      //If the current field is a semanticKey, importance set to High
    }

    return dataField.Value && dataField !== null && dataField !== void 0 && (_Value6 = dataField.Value) !== null && _Value6 !== void 0 && _Value6.path && mapSemanticKeys && mapSemanticKeys.includes(dataField.Value.path) ? Importance.High : _getDataFieldImportance(dataField);
  }

  /**
   * Returns line items from metadata annotations.
   *
   * @param lineItemAnnotation Collection of data fields with their annotations
   * @param visualizationPath The visualization path
   * @param converterContext The converter context
   * @returns The columns from the annotations
   */
  _exports.getImportance = getImportance;
  const getColumnsFromAnnotations = function (lineItemAnnotation, visualizationPath, converterContext) {
    var _tableManifestSetting2;
    const entityType = converterContext.getAnnotationEntityType(lineItemAnnotation),
      annotationColumns = [],
      columnsToBeCreated = {},
      nonSortableColumns = getNonSortablePropertiesRestrictions(converterContext.getEntitySet()),
      tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath),
      tableType = (tableManifestSettings === null || tableManifestSettings === void 0 ? void 0 : (_tableManifestSetting2 = tableManifestSettings.tableSettings) === null || _tableManifestSetting2 === void 0 ? void 0 : _tableManifestSetting2.type) || "ResponsiveTable";
    const textOnlyColumnsFromTextAnnotation = [];
    const semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
    if (lineItemAnnotation) {
      const tableConverterContext = converterContext.getConverterContextFor(getTargetObjectPath(converterContext.getDataModelObjectPath()));
      lineItemAnnotation.forEach(lineItem => {
        var _lineItem$Value, _lineItem$Value$$targ, _lineItem$Target, _lineItem$Target$$tar, _lineItem$annotations, _lineItem$annotations2, _lineItem$annotations3, _lineItem$annotations4, _exportSettings;
        if (!_isValidColumn(lineItem)) {
          return;
        }
        let exportSettings = null;
        const semanticObjectAnnotationPath = isDataFieldTypes(lineItem) && (_lineItem$Value = lineItem.Value) !== null && _lineItem$Value !== void 0 && (_lineItem$Value$$targ = _lineItem$Value.$target) !== null && _lineItem$Value$$targ !== void 0 && _lineItem$Value$$targ.fullyQualifiedName ? getSemanticObjectPath(converterContext, lineItem) : undefined;
        const relativePath = _getRelativePath(lineItem);

        // Determine properties which are consumed by this LineItem.
        const relatedPropertiesInfo = collectRelatedPropertiesRecursively(lineItem, converterContext, tableType);
        const relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties);
        const additionalPropertyNames = Object.keys(relatedPropertiesInfo.additionalProperties);
        const groupPath = _sliceAtSlash(relativePath, true, false);
        const isGroup = groupPath != relativePath;
        const sLabel = getLabel(lineItem, isGroup);
        const name = _getAnnotationColumnName(lineItem);
        const isFieldGroupColumn = groupPath.indexOf(`@${"com.sap.vocabularies.UI.v1.FieldGroup"}`) > -1;
        const showDataFieldsLabel = isFieldGroupColumn ? _getShowDataFieldsLabel(name, visualizationPath, converterContext) : false;
        const dataType = getDataFieldDataType(lineItem);
        const sDateInputFormat = dataType === "Edm.Date" ? "YYYY-MM-DD" : undefined;
        const formatOptions = _getDefaultFormatOptionsForTable(getDefaultDraftIndicatorForColumn(name, semanticKeys, isFieldGroupColumn, lineItem));
        let fieldGroupHiddenExpressions;
        if (lineItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_lineItem$Target = lineItem.Target) === null || _lineItem$Target === void 0 ? void 0 : (_lineItem$Target$$tar = _lineItem$Target.$target) === null || _lineItem$Target$$tar === void 0 ? void 0 : _lineItem$Target$$tar.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
          fieldGroupHiddenExpressions = _getFieldGroupHiddenExpressions(lineItem, formatOptions);
        }
        if (_isExportableColumn(lineItem)) {
          //exclude the types listed above for the Export (generates error on Export as PDF)
          exportSettings = {
            template: relatedPropertiesInfo.exportSettingsTemplate,
            wrap: relatedPropertiesInfo.exportSettingsWrapping,
            type: dataType ? _getExportDataType(dataType, relatedPropertyNames.length > 1) : undefined,
            inputFormat: sDateInputFormat,
            delimiter: dataType === "Edm.Int64"
          };
          if (relatedPropertiesInfo.exportUnitName) {
            exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
            exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
          } else if (relatedPropertiesInfo.exportUnitString) {
            exportSettings.unit = relatedPropertiesInfo.exportUnitString;
          }
          if (relatedPropertiesInfo.exportTimezoneName) {
            exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
          } else if (relatedPropertiesInfo.exportTimezoneString) {
            exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
          }
        }
        const propertyTypeConfig = dataType && getTypeConfig(lineItem, dataType);
        const typeConfig = {
          className: dataType,
          formatOptions: {
            ...formatOptions,
            ...(propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : propertyTypeConfig.formatOptions)
          },
          constraints: propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : propertyTypeConfig.constraints
        };
        const visualSettings = {};
        if (!dataType || !typeConfig) {
          // for charts
          visualSettings.widthCalculation = null;
        }
        const isMultiValue = _isColumnMultiValued(lineItem, tableConverterContext);
        const sortable = !isMultiValue && _isColumnSortable(lineItem, relativePath, nonSortableColumns);
        const column = {
          key: KeyHelper.generateKeyFromDataField(lineItem),
          type: ColumnType.Annotation,
          label: sLabel,
          groupLabel: isGroup ? getLabel(lineItem) : undefined,
          group: isGroup ? groupPath : undefined,
          FieldGroupHiddenExpressions: fieldGroupHiddenExpressions,
          annotationPath: converterContext.getEntitySetBasedAnnotationPath(lineItem.fullyQualifiedName),
          semanticObjectPath: semanticObjectAnnotationPath,
          availability: isReferencePropertyStaticallyHidden(lineItem) ? AvailabilityType.Hidden : AvailabilityType.Default,
          name: name,
          showDataFieldsLabel: showDataFieldsLabel,
          relativePath: relativePath,
          sortable: sortable,
          propertyInfos: relatedPropertyNames.length ? relatedPropertyNames : undefined,
          additionalPropertyInfos: additionalPropertyNames.length > 0 ? additionalPropertyNames : undefined,
          exportSettings: exportSettings,
          width: ((_lineItem$annotations = lineItem.annotations) === null || _lineItem$annotations === void 0 ? void 0 : (_lineItem$annotations2 = _lineItem$annotations.HTML5) === null || _lineItem$annotations2 === void 0 ? void 0 : (_lineItem$annotations3 = _lineItem$annotations2.CssDefaults) === null || _lineItem$annotations3 === void 0 ? void 0 : (_lineItem$annotations4 = _lineItem$annotations3.width) === null || _lineItem$annotations4 === void 0 ? void 0 : _lineItem$annotations4.valueOf()) || undefined,
          importance: getImportance(lineItem, semanticKeys),
          isNavigable: true,
          formatOptions: formatOptions,
          caseSensitive: isFilteringCaseSensitive(converterContext),
          typeConfig: typeConfig,
          visualSettings: visualSettings,
          timezoneText: (_exportSettings = exportSettings) === null || _exportSettings === void 0 ? void 0 : _exportSettings.timezone,
          isPartOfLineItem: true
        };
        const sTooltip = _getTooltip(lineItem);
        if (sTooltip) {
          column.tooltip = sTooltip;
        }
        if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
          textOnlyColumnsFromTextAnnotation.push(...relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation);
        }
        if (relatedPropertiesInfo.exportDataPointTargetValue && column.exportSettings) {
          column.exportDataPointTargetValue = relatedPropertiesInfo.exportDataPointTargetValue;
          column.exportSettings.type = "String";
        }
        annotationColumns.push(column);

        // Collect information of related columns to be created.
        relatedPropertyNames.forEach(relatedPropertyName => {
          columnsToBeCreated[relatedPropertyName] = relatedPropertiesInfo.properties[relatedPropertyName];

          // In case of a multi-value, related properties cannot be sorted as we go through a 1-n relation
          if (isMultiValue) {
            nonSortableColumns.push(relatedPropertyName);
          }
        });

        // Create columns for additional properties identified for ALP use case.
        additionalPropertyNames.forEach(additionalPropertyName => {
          // Intentional overwrite as we require only one new PropertyInfo for a related Property.
          columnsToBeCreated[additionalPropertyName] = relatedPropertiesInfo.additionalProperties[additionalPropertyName];
        });
      });
    }

    // Get columns from the Properties of EntityType
    return getColumnsFromEntityType(columnsToBeCreated, entityType, annotationColumns, nonSortableColumns, converterContext, tableType, textOnlyColumnsFromTextAnnotation);
  };

  /**
   * Gets the property names from the manifest and checks against existing properties already added by annotations.
   * If a not yet stored property is found it adds it for sorting and filtering only to the annotationColumns.
   *
   * @param properties
   * @param annotationColumns
   * @param converterContext
   * @param entityType
   * @returns The columns from the annotations
   */
  const _getPropertyNames = function (properties, annotationColumns, converterContext, entityType) {
    let matchedProperties;
    if (properties) {
      matchedProperties = properties.map(function (propertyPath) {
        const annotationColumn = annotationColumns.find(function (annotationColumn) {
          return annotationColumn.relativePath === propertyPath && annotationColumn.propertyInfos === undefined;
        });
        if (annotationColumn) {
          return annotationColumn.name;
        } else {
          const relatedColumns = _createRelatedColumns({
            [propertyPath]: entityType.resolvePath(propertyPath)
          }, annotationColumns, [], converterContext, entityType, []);
          annotationColumns.push(relatedColumns[0]);
          return relatedColumns[0].name;
        }
      });
    }
    return matchedProperties;
  };
  const _appendCustomTemplate = function (properties) {
    return properties.map(property => {
      return `{${properties.indexOf(property)}}`;
    }).join(`${"\n"}`);
  };

  /**
   * Returns table column definitions from manifest.
   *
   * These may be custom columns defined in the manifest, slot columns coming through
   * a building block, or annotation columns to overwrite annotation-based columns.
   *
   * @param columns
   * @param annotationColumns
   * @param converterContext
   * @param entityType
   * @param navigationSettings
   * @returns The columns from the manifest
   */
  const getColumnsFromManifest = function (columns, annotationColumns, converterContext, entityType, navigationSettings) {
    const internalColumns = {};
    function isAnnotationColumn(column, key) {
      return annotationColumns.some(annotationColumn => annotationColumn.key === key);
    }
    function isSlotColumn(manifestColumn) {
      return manifestColumn.type === ColumnType.Slot;
    }
    function isCustomColumn(manifestColumn) {
      return manifestColumn.type === undefined && !!manifestColumn.template;
    }
    function _updateLinkedPropertiesOnCustomColumns(propertyInfos, annotationTableColumns) {
      const nonSortableColumns = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
      propertyInfos.forEach(property => {
        annotationTableColumns.forEach(prop => {
          if (prop.name === property) {
            prop.sortable = nonSortableColumns.indexOf(property.replace("Property::", "")) === -1;
            prop.isGroupable = prop.sortable;
          }
        });
      });
    }
    for (const key in columns) {
      var _manifestColumn$posit;
      const manifestColumn = columns[key];
      KeyHelper.validateKey(key);

      // BaseTableColumn
      const baseTableColumn = {
        key: key,
        width: manifestColumn.width || undefined,
        position: {
          anchor: (_manifestColumn$posit = manifestColumn.position) === null || _manifestColumn$posit === void 0 ? void 0 : _manifestColumn$posit.anchor,
          placement: manifestColumn.position === undefined ? Placement.After : manifestColumn.position.placement
        },
        caseSensitive: isFilteringCaseSensitive(converterContext)
      };
      if (isAnnotationColumn(manifestColumn, key)) {
        const propertiesToOverwriteAnnotationColumn = {
          ...baseTableColumn,
          importance: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.importance,
          horizontalAlign: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.horizontalAlign,
          availability: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.availability,
          type: ColumnType.Annotation,
          isNavigable: isAnnotationColumn(manifestColumn, key) ? undefined : isActionNavigable(manifestColumn, navigationSettings, true),
          settings: manifestColumn.settings,
          formatOptions: _getDefaultFormatOptionsForTable(manifestColumn.formatOptions)
        };
        internalColumns[key] = propertiesToOverwriteAnnotationColumn;
      } else {
        const propertyInfos = _getPropertyNames(manifestColumn.properties, annotationColumns, converterContext, entityType);
        const baseManifestColumn = {
          ...baseTableColumn,
          header: manifestColumn.header,
          importance: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.importance) || Importance.None,
          horizontalAlign: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.horizontalAlign) || HorizontalAlign.Begin,
          availability: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.availability) || AvailabilityType.Default,
          template: manifestColumn.template,
          propertyInfos: propertyInfos,
          exportSettings: propertyInfos ? {
            template: _appendCustomTemplate(propertyInfos),
            wrap: !!(propertyInfos.length > 1)
          } : null,
          id: `CustomColumn::${key}`,
          name: `CustomColumn::${key}`,
          //Needed for MDC:
          formatOptions: {
            textLinesEdit: 4
          },
          isGroupable: false,
          isNavigable: false,
          sortable: false,
          visualSettings: {
            widthCalculation: null
          },
          properties: manifestColumn.properties
        };
        if (propertyInfos) {
          _updateLinkedPropertiesOnCustomColumns(propertyInfos, annotationColumns);
        }
        if (isSlotColumn(manifestColumn)) {
          const customTableColumn = {
            ...baseManifestColumn,
            type: ColumnType.Slot
          };
          internalColumns[key] = customTableColumn;
        } else if (isCustomColumn(manifestColumn)) {
          const customTableColumn = {
            ...baseManifestColumn,
            type: ColumnType.Default
          };
          internalColumns[key] = customTableColumn;
        } else {
          var _IssueCategoryType$An;
          const message = `The annotation column '${key}' referenced in the manifest is not found`;
          converterContext.getDiagnostics().addIssue(IssueCategory.Manifest, IssueSeverity.Low, message, IssueCategoryType, IssueCategoryType === null || IssueCategoryType === void 0 ? void 0 : (_IssueCategoryType$An = IssueCategoryType.AnnotationColumns) === null || _IssueCategoryType$An === void 0 ? void 0 : _IssueCategoryType$An.InvalidKey);
        }
      }
    }
    return internalColumns;
  };
  function getP13nMode(visualizationPath, converterContext, tableManifestConfiguration) {
    var _tableManifestSetting3;
    const manifestWrapper = converterContext.getManifestWrapper();
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const variantManagement = manifestWrapper.getVariantManagement();
    const aPersonalization = [];
    const isAnalyticalTable = tableManifestConfiguration.type === "AnalyticalTable";
    const isResponsiveTable = tableManifestConfiguration.type === "ResponsiveTable";
    if ((tableManifestSettings === null || tableManifestSettings === void 0 ? void 0 : (_tableManifestSetting3 = tableManifestSettings.tableSettings) === null || _tableManifestSetting3 === void 0 ? void 0 : _tableManifestSetting3.personalization) !== undefined) {
      // Personalization configured in manifest.
      const personalization = tableManifestSettings.tableSettings.personalization;
      if (personalization === true) {
        // Table personalization fully enabled.
        switch (tableManifestConfiguration.type) {
          case "AnalyticalTable":
            return "Sort,Column,Filter,Group,Aggregate";
          case "ResponsiveTable":
            return "Sort,Column,Filter,Group";
          default:
            return "Sort,Column,Filter";
        }
      } else if (typeof personalization === "object") {
        // Specific personalization options enabled in manifest. Use them as is.
        if (personalization.sort) {
          aPersonalization.push("Sort");
        }
        if (personalization.column) {
          aPersonalization.push("Column");
        }
        if (personalization.filter) {
          aPersonalization.push("Filter");
        }
        if (personalization.group && (isAnalyticalTable || isResponsiveTable)) {
          aPersonalization.push("Group");
        }
        if (personalization.aggregate && isAnalyticalTable) {
          aPersonalization.push("Aggregate");
        }
        return aPersonalization.length > 0 ? aPersonalization.join(",") : undefined;
      }
    } else {
      // No personalization configured in manifest.
      aPersonalization.push("Sort");
      aPersonalization.push("Column");
      if (converterContext.getTemplateType() === TemplateType.ListReport) {
        if (variantManagement === VariantManagementType.Control || _isFilterBarHidden(manifestWrapper, converterContext)) {
          // Feature parity with V2.
          // Enable table filtering by default only in case of Control level variant management.
          // Or when the LR filter bar is hidden via manifest setting
          aPersonalization.push("Filter");
        }
      } else {
        aPersonalization.push("Filter");
      }
      if (isAnalyticalTable) {
        aPersonalization.push("Group");
        aPersonalization.push("Aggregate");
      }
      if (isResponsiveTable) {
        aPersonalization.push("Group");
      }
      return aPersonalization.join(",");
    }
    return undefined;
  }

  /**
   * Returns a Boolean value suggesting if a filter bar is being used on the page.
   *
   * Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
   * Until then, hiding filter bar is now allowed if a chart is being used on LR.
   *
   * @param manifestWrapper Manifest settings getter for the page
   * @param converterContext The instance of the converter context
   * @returns Boolean suggesting if a filter bar is being used on the page.
   */
  _exports.getP13nMode = getP13nMode;
  function _isFilterBarHidden(manifestWrapper, converterContext) {
    return manifestWrapper.isFilterBarHidden() && !converterContext.getManifestWrapper().hasMultipleVisualizations() && converterContext.getTemplateType() !== TemplateType.AnalyticalListPage;
  }

  /**
   * Returns a JSON string containing the sort conditions for the presentation variant.
   *
   * @param converterContext The instance of the converter context
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Table columns processed by the converter
   * @returns Sort conditions for a presentation variant.
   */
  function getSortConditions(converterContext, presentationVariantAnnotation, columns) {
    // Currently navigation property is not supported as sorter
    const nonSortableProperties = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
    let sortConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.SortOrder) {
      const sorters = [];
      const conditions = {
        sorters: sorters
      };
      presentationVariantAnnotation.SortOrder.forEach(condition => {
        var _conditionProperty$$t;
        const conditionProperty = condition.Property;
        if (conditionProperty && nonSortableProperties.indexOf((_conditionProperty$$t = conditionProperty.$target) === null || _conditionProperty$$t === void 0 ? void 0 : _conditionProperty$$t.name) === -1) {
          const infoName = convertPropertyPathsToInfoNames([conditionProperty], columns)[0];
          if (infoName) {
            conditions.sorters.push({
              name: infoName,
              descending: !!condition.Descending
            });
          }
        }
      });
      sortConditions = conditions.sorters.length ? JSON.stringify(conditions) : undefined;
    }
    return sortConditions;
  }
  function getInitialExpansionLevel(presentationVariantAnnotation) {
    var _presentationVariantA;
    if (!presentationVariantAnnotation) {
      return undefined;
    }
    const level = (_presentationVariantA = presentationVariantAnnotation.InitialExpansionLevel) === null || _presentationVariantA === void 0 ? void 0 : _presentationVariantA.valueOf();
    return typeof level === "number" ? level : undefined;
  }
  /**
   * Converts an array of propertyPath to an array of propertyInfo names.
   *
   * @param paths the array to be converted
   * @param columns the array of propertyInfos
   * @returns an array of propertyInfo names
   */

  function convertPropertyPathsToInfoNames(paths, columns) {
    const infoNames = [];
    let propertyInfo, annotationColumn;
    paths.forEach(currentPath => {
      if (currentPath !== null && currentPath !== void 0 && currentPath.value) {
        propertyInfo = columns.find(column => {
          annotationColumn = column;
          return !annotationColumn.propertyInfos && annotationColumn.relativePath === (currentPath === null || currentPath === void 0 ? void 0 : currentPath.value);
        });
        if (propertyInfo) {
          infoNames.push(propertyInfo.name);
        }
      }
    });
    return infoNames;
  }

  /**
   * Returns a JSON string containing Presentation Variant group conditions.
   *
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Converter processed table columns
   * @param tableType The table type.
   * @returns Group conditions for a Presentation variant.
   */
  function getGroupConditions(presentationVariantAnnotation, columns, tableType) {
    let groupConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.GroupBy) {
      let aGroupBy = presentationVariantAnnotation.GroupBy;
      if (tableType === "ResponsiveTable") {
        aGroupBy = aGroupBy.slice(0, 1);
      }
      const aGroupLevels = convertPropertyPathsToInfoNames(aGroupBy, columns).map(infoName => {
        return {
          name: infoName
        };
      });
      groupConditions = aGroupLevels.length ? JSON.stringify({
        groupLevels: aGroupLevels
      }) : undefined;
    }
    return groupConditions;
  }
  /**
   * Updates the column's propertyInfos of a analytical table integrating all extensions and binding-relevant property info part.
   *
   * @param tableVisualization The visualization to be updated
   */

  function _updatePropertyInfosWithAggregatesDefinitions(tableVisualization) {
    const relatedAdditionalPropertyNameMap = {};
    tableVisualization.columns.forEach(column => {
      var _column$additionalPro2;
      column = column;
      const aggregatablePropertyName = Object.keys(tableVisualization.aggregates).find(aggregate => aggregate === column.name);
      if (aggregatablePropertyName) {
        const aggregatablePropertyDefinition = tableVisualization.aggregates[aggregatablePropertyName];
        column.aggregatable = true;
        column.extension = {
          customAggregate: aggregatablePropertyDefinition.defaultAggregate ?? {}
        };
      }
      if ((_column$additionalPro2 = column.additionalPropertyInfos) !== null && _column$additionalPro2 !== void 0 && _column$additionalPro2.length) {
        column.additionalPropertyInfos.forEach(additionalPropertyInfo => {
          // Create propertyInfo for each additional property.
          // The new property 'name' has been prefixed with 'Property_Technical::' for uniqueness and it has been named technical property as it requires dedicated MDC attributes (technicallyGroupable and technicallyAggregatable).
          createTechnicalProperty(additionalPropertyInfo, tableVisualization.columns, relatedAdditionalPropertyNameMap);
        });
      }
    });
    tableVisualization.columns.forEach(column => {
      column = column;
      if (column.additionalPropertyInfos) {
        var _column$propertyInfos3;
        column.additionalPropertyInfos = column.additionalPropertyInfos.map(propertyInfo => relatedAdditionalPropertyNameMap[propertyInfo] ?? propertyInfo);
        // Add additional properties to the complex property using the hidden annotation.
        column.propertyInfos = (_column$propertyInfos3 = column.propertyInfos) === null || _column$propertyInfos3 === void 0 ? void 0 : _column$propertyInfos3.concat(column.additionalPropertyInfos);
      }
    });
  }

  /**
   * Returns a JSON string containing Presentation Variant aggregate conditions.
   *
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Converter processed table columns
   * @returns Group conditions for a Presentation variant.
   */
  function getAggregateConditions(presentationVariantAnnotation, columns) {
    let aggregateConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.Total) {
      const aTotals = presentationVariantAnnotation.Total;
      const aggregates = {};
      convertPropertyPathsToInfoNames(aTotals, columns).forEach(infoName => {
        aggregates[infoName] = {};
      });
      aggregateConditions = JSON.stringify(aggregates);
    }
    return aggregateConditions;
  }
  function getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfiguration, columns, presentationVariantAnnotation, viewConfiguration) {
    var _converterContext$get16, _converterContext$get17, _converterContext$get18;
    // Need to get the target
    const {
      navigationPropertyPath
    } = splitPath(visualizationPath);
    const title = (_converterContext$get16 = converterContext.getDataModelObjectPath().targetEntityType.annotations) === null || _converterContext$get16 === void 0 ? void 0 : (_converterContext$get17 = _converterContext$get16.UI) === null || _converterContext$get17 === void 0 ? void 0 : (_converterContext$get18 = _converterContext$get17.HeaderInfo) === null || _converterContext$get18 === void 0 ? void 0 : _converterContext$get18.TypeNamePlural;
    const entitySet = converterContext.getDataModelObjectPath().targetEntitySet;
    const pageManifestSettings = converterContext.getManifestWrapper();
    const hasAbsolutePath = navigationPropertyPath.length === 0,
      p13nMode = getP13nMode(visualizationPath, converterContext, tableManifestConfiguration),
      id = navigationPropertyPath ? getTableID(visualizationPath) : getTableID(converterContext.getContextPath(), "LineItem");
    const targetCapabilities = getCapabilityRestriction(converterContext);
    const navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
    const navigationSettings = pageManifestSettings.getNavigationConfiguration(navigationTargetPath);
    const creationBehaviour = _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings, visualizationPath);
    const standardActionsContext = generateStandardActionsContext(converterContext, creationBehaviour.mode, tableManifestConfiguration, viewConfiguration);
    const deleteButtonVisibilityExpression = getDeleteVisibility(converterContext, standardActionsContext);
    const createButtonVisibilityExpression = getCreateVisibility(converterContext, standardActionsContext);
    const massEditButtonVisibilityExpression = getMassEditVisibility(converterContext, standardActionsContext);
    const isInsertUpdateTemplated = getInsertUpdateActionsTemplating(standardActionsContext, isDraftOrStickySupported(converterContext), compileExpression(createButtonVisibilityExpression) === "false");
    const selectionMode = getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, hasAbsolutePath, targetCapabilities, deleteButtonVisibilityExpression, massEditButtonVisibilityExpression);
    let threshold = navigationPropertyPath ? 10 : 30;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.MaxItems) {
      threshold = presentationVariantAnnotation.MaxItems.valueOf();
    }
    const variantManagement = pageManifestSettings.getVariantManagement();
    const isSearchable = isPathSearchable(converterContext.getDataModelObjectPath());
    const standardActions = {
      create: getStandardActionCreate(converterContext, standardActionsContext),
      delete: getStandardActionDelete(converterContext, standardActionsContext),
      paste: getStandardActionPaste(converterContext, standardActionsContext, isInsertUpdateTemplated),
      massEdit: getStandardActionMassEdit(converterContext, standardActionsContext),
      creationRow: getCreationRow(converterContext, standardActionsContext)
    };
    return {
      id: id,
      entityName: entitySet ? entitySet.name : "",
      collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      navigationPath: navigationPropertyPath,
      row: _getRowConfigurationProperty(lineItemAnnotation, converterContext, navigationSettings, navigationTargetPath, tableManifestConfiguration.type),
      p13nMode: p13nMode,
      standardActions: {
        actions: standardActions,
        isInsertUpdateTemplated: isInsertUpdateTemplated,
        updatablePropertyPath: getCurrentEntitySetUpdatablePath(converterContext)
      },
      displayMode: isInDisplayMode(converterContext, viewConfiguration),
      create: creationBehaviour,
      selectionMode: selectionMode,
      autoBindOnInit: _isFilterBarHidden(pageManifestSettings, converterContext) || converterContext.getTemplateType() !== TemplateType.ListReport && converterContext.getTemplateType() !== TemplateType.AnalyticalListPage && !(viewConfiguration && pageManifestSettings.hasMultipleVisualizations(viewConfiguration)),
      variantManagement: variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement,
      threshold: threshold,
      sortConditions: getSortConditions(converterContext, presentationVariantAnnotation, columns),
      title: title,
      searchable: tableManifestConfiguration.type !== "AnalyticalTable" && !(isConstant(isSearchable) && isSearchable.value === false),
      initialExpansionLevel: getInitialExpansionLevel(presentationVariantAnnotation)
    };
  }
  _exports.getTableAnnotationConfiguration = getTableAnnotationConfiguration;
  function _getExportDataType(dataType) {
    let isComplexProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let exportDataType = "String";
    if (isComplexProperty) {
      if (dataType === "Edm.DateTimeOffset") {
        exportDataType = "DateTime";
      }
      return exportDataType;
    } else {
      switch (dataType) {
        case "Edm.Decimal":
        case "Edm.Int32":
        case "Edm.Int64":
        case "Edm.Double":
        case "Edm.Byte":
          exportDataType = "Number";
          break;
        case "Edm.DateOfTime":
        case "Edm.Date":
          exportDataType = "Date";
          break;
        case "Edm.DateTimeOffset":
          exportDataType = "DateTime";
          break;
        case "Edm.TimeOfDay":
          exportDataType = "Time";
          break;
        case "Edm.Boolean":
          exportDataType = "Boolean";
          break;
        default:
          exportDataType = "String";
      }
    }
    return exportDataType;
  }

  /**
   * Split the visualization path into the navigation property path and annotation.
   *
   * @param visualizationPath
   * @returns The split path
   */
  function splitPath(visualizationPath) {
    let [navigationPropertyPath, annotationPath] = visualizationPath.split("@");
    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }
    return {
      navigationPropertyPath,
      annotationPath
    };
  }
  _exports.splitPath = splitPath;
  function getSelectionVariantConfiguration(selectionVariantPath, converterContext) {
    const resolvedTarget = converterContext.getEntityTypeAnnotation(selectionVariantPath);
    const selection = resolvedTarget.annotation;
    if (selection) {
      var _selection$SelectOpti, _selection$Text;
      const propertyNames = [];
      (_selection$SelectOpti = selection.SelectOptions) === null || _selection$SelectOpti === void 0 ? void 0 : _selection$SelectOpti.forEach(selectOption => {
        const propertyName = selectOption.PropertyName;
        const propertyPath = propertyName.value;
        if (propertyNames.indexOf(propertyPath) === -1) {
          propertyNames.push(propertyPath);
        }
      });
      return {
        text: selection === null || selection === void 0 ? void 0 : (_selection$Text = selection.Text) === null || _selection$Text === void 0 ? void 0 : _selection$Text.toString(),
        propertyNames: propertyNames
      };
    }
    return undefined;
  }
  _exports.getSelectionVariantConfiguration = getSelectionVariantConfiguration;
  function _getFullScreenBasedOnDevice(tableSettings, converterContext, isIphone) {
    // If enableFullScreen is not set, use as default true on phone and false otherwise
    let enableFullScreen = tableSettings.enableFullScreen ?? isIphone;
    // Make sure that enableFullScreen is not set on ListReport for desktop or tablet
    if (!isIphone && enableFullScreen && converterContext.getTemplateType() === TemplateType.ListReport) {
      enableFullScreen = false;
      converterContext.getDiagnostics().addIssue(IssueCategory.Manifest, IssueSeverity.Low, IssueType.FULLSCREENMODE_NOT_ON_LISTREPORT);
    }
    return enableFullScreen;
  }
  function _getMultiSelectMode(tableSettings, tableType, converterContext) {
    let multiSelectMode;
    if (tableType !== "ResponsiveTable") {
      return undefined;
    }
    switch (converterContext.getTemplateType()) {
      case TemplateType.ListReport:
      case TemplateType.AnalyticalListPage:
        multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
        break;
      case TemplateType.ObjectPage:
        multiSelectMode = tableSettings.selectAll === false ? "ClearAll" : "Default";
        if (converterContext.getManifestWrapper().useIconTabBar()) {
          multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
        }
        break;
      default:
    }
    return multiSelectMode;
  }
  function _getTableType(tableSettings, aggregationHelper, converterContext) {
    let tableType = (tableSettings === null || tableSettings === void 0 ? void 0 : tableSettings.type) || "ResponsiveTable";
    /*  Now, we keep the configuration in the manifest, even if it leads to errors.
    	We only change if we're not on desktop from Analytical/Tree to Responsive.
     */
    if ((tableType === "AnalyticalTable" || tableType === "TreeTable") && !converterContext.getManifestWrapper().isDesktop()) {
      tableType = "ResponsiveTable";
    }
    return tableType;
  }
  function _getGridTableMode(tableType, tableSettings, isTemplateListReport) {
    if (tableType === "GridTable") {
      if (isTemplateListReport) {
        return {
          rowCountMode: "Auto",
          rowCount: "3"
        };
      } else {
        return {
          rowCountMode: tableSettings.rowCountMode ? tableSettings.rowCountMode : "Fixed",
          rowCount: tableSettings.rowCount ? tableSettings.rowCount : 5
        };
      }
    } else {
      return {};
    }
  }
  function _getCondensedTableLayout(_tableType, _tableSettings) {
    return _tableSettings.condensedTableLayout !== undefined && _tableType !== "ResponsiveTable" ? _tableSettings.condensedTableLayout : false;
  }
  function _getTableSelectionLimit(_tableSettings) {
    return _tableSettings.selectAll === true || _tableSettings.selectionLimit === 0 ? 0 : _tableSettings.selectionLimit || 200;
  }
  function _getTableInlineCreationRowCount(_tableSettings) {
    var _tableSettings$creati, _tableSettings$creati2;
    return (_tableSettings$creati = _tableSettings.creationMode) !== null && _tableSettings$creati !== void 0 && _tableSettings$creati.inlineCreationRowCount ? (_tableSettings$creati2 = _tableSettings.creationMode) === null || _tableSettings$creati2 === void 0 ? void 0 : _tableSettings$creati2.inlineCreationRowCount : 2;
  }
  function _getFilters(tableSettings, quickFilterPaths, quickSelectionVariant, path, converterContext) {
    var _tableSettings$quickV;
    if (quickSelectionVariant) {
      quickFilterPaths.push({
        annotationPath: path.annotationPath
      });
    }
    return {
      quickFilters: {
        enabled: converterContext.getTemplateType() !== TemplateType.ListReport,
        showCounts: tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV = tableSettings.quickVariantSelection) === null || _tableSettings$quickV === void 0 ? void 0 : _tableSettings$quickV.showCounts,
        paths: quickFilterPaths
      }
    };
  }
  function _getEnableExport(tableSettings, converterContext, enablePaste) {
    return tableSettings.enableExport !== undefined ? tableSettings.enableExport : converterContext.getTemplateType() !== "ObjectPage" || enablePaste;
  }
  function _getFilterConfiguration(tableSettings, lineItemAnnotation, converterContext) {
    var _tableSettings$quickV2, _tableSettings$quickV3, _tableSettings$quickV4;
    if (!lineItemAnnotation) {
      return {};
    }
    const quickFilterPaths = [];
    const targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
    let quickSelectionVariant;
    let filters;
    tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV2 = tableSettings.quickVariantSelection) === null || _tableSettings$quickV2 === void 0 ? void 0 : (_tableSettings$quickV3 = _tableSettings$quickV2.paths) === null || _tableSettings$quickV3 === void 0 ? void 0 : _tableSettings$quickV3.forEach(path => {
      quickSelectionVariant = targetEntityType.resolvePath(path.annotationPath);
      filters = _getFilters(tableSettings, quickFilterPaths, quickSelectionVariant, path, converterContext);
    });
    let hideTableTitle = false;
    hideTableTitle = !!((_tableSettings$quickV4 = tableSettings.quickVariantSelection) !== null && _tableSettings$quickV4 !== void 0 && _tableSettings$quickV4.hideTableTitle);
    return {
      filters: filters,
      headerVisible: !(quickSelectionVariant && hideTableTitle)
    };
  }
  function _getCollectedNavigationPropertyLabels(relativePath, converterContext) {
    const navigationProperties = enhanceDataModelPath(converterContext.getDataModelObjectPath(), relativePath).navigationProperties;
    if ((navigationProperties === null || navigationProperties === void 0 ? void 0 : navigationProperties.length) > 0) {
      const collectedNavigationPropertyLabels = [];
      navigationProperties.forEach(navProperty => {
        collectedNavigationPropertyLabels.push(getLabel(navProperty) || navProperty.name);
      });
      return collectedNavigationPropertyLabels;
    }
  }
  function getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext) {
    var _tableSettings$creati3, _tableSettings$creati4, _tableSettings$creati5, _tableSettings$creati6, _tableSettings$creati7, _tableSettings$creati8, _tableSettings$quickV5, _manifestWrapper$getV;
    let checkCondensedLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const _manifestWrapper = converterContext.getManifestWrapper();
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const tableSettings = tableManifestSettings && tableManifestSettings.tableSettings || {};
    const creationMode = ((_tableSettings$creati3 = tableSettings.creationMode) === null || _tableSettings$creati3 === void 0 ? void 0 : _tableSettings$creati3.name) || CreationMode.NewPage;
    const enableAutoColumnWidth = !_manifestWrapper.isPhone();
    const enablePaste = tableSettings.enablePaste !== undefined ? tableSettings.enablePaste : converterContext.getTemplateType() === "ObjectPage"; // Paste is disabled by default excepted for OP
    const templateType = converterContext.getTemplateType();
    const dataStateIndicatorFilter = templateType === TemplateType.ListReport ? "API.dataStateIndicatorFilter" : undefined;
    const isCondensedTableLayoutCompliant = checkCondensedLayout && _manifestWrapper.isCondensedLayoutCompliant();
    const oFilterConfiguration = _getFilterConfiguration(tableSettings, lineItemAnnotation, converterContext);
    const customValidationFunction = (_tableSettings$creati4 = tableSettings.creationMode) === null || _tableSettings$creati4 === void 0 ? void 0 : _tableSettings$creati4.customValidationFunction;
    const entityType = converterContext.getEntityType();
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    const tableType = _getTableType(tableSettings, aggregationHelper, converterContext);
    const gridTableRowMode = _getGridTableMode(tableType, tableSettings, templateType === TemplateType.ListReport);
    const condensedTableLayout = _getCondensedTableLayout(tableType, tableSettings);
    const oConfiguration = {
      // If no createAtEnd is specified it will be false for Inline create and true otherwise
      createAtEnd: ((_tableSettings$creati5 = tableSettings.creationMode) === null || _tableSettings$creati5 === void 0 ? void 0 : _tableSettings$creati5.createAtEnd) !== undefined ? (_tableSettings$creati6 = tableSettings.creationMode) === null || _tableSettings$creati6 === void 0 ? void 0 : _tableSettings$creati6.createAtEnd : creationMode !== CreationMode.Inline,
      creationMode: creationMode,
      customValidationFunction: customValidationFunction,
      dataStateIndicatorFilter: dataStateIndicatorFilter,
      // if a custom validation function is provided, disableAddRowButtonForEmptyData should not be considered, i.e. set to false
      disableAddRowButtonForEmptyData: !customValidationFunction ? !!((_tableSettings$creati7 = tableSettings.creationMode) !== null && _tableSettings$creati7 !== void 0 && _tableSettings$creati7.disableAddRowButtonForEmptyData) : false,
      enableAutoColumnWidth: enableAutoColumnWidth,
      enableExport: _getEnableExport(tableSettings, converterContext, enablePaste),
      enableFullScreen: _getFullScreenBasedOnDevice(tableSettings, converterContext, _manifestWrapper.isPhone()),
      enableMassEdit: tableSettings === null || tableSettings === void 0 ? void 0 : tableSettings.enableMassEdit,
      enablePaste: enablePaste,
      headerVisible: true,
      multiSelectMode: _getMultiSelectMode(tableSettings, tableType, converterContext),
      selectionLimit: _getTableSelectionLimit(tableSettings),
      inlineCreationRowCount: _getTableInlineCreationRowCount(tableSettings),
      inlineCreationRowsHiddenInEditMode: (tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$creati8 = tableSettings.creationMode) === null || _tableSettings$creati8 === void 0 ? void 0 : _tableSettings$creati8.inlineCreationRowsHiddenInEditMode) ?? false,
      showRowCount: !(tableSettings !== null && tableSettings !== void 0 && (_tableSettings$quickV5 = tableSettings.quickVariantSelection) !== null && _tableSettings$quickV5 !== void 0 && _tableSettings$quickV5.showCounts) && !((_manifestWrapper$getV = _manifestWrapper.getViewConfiguration()) !== null && _manifestWrapper$getV !== void 0 && _manifestWrapper$getV.showCounts),
      type: tableType,
      useCondensedTableLayout: condensedTableLayout && isCondensedTableLayoutCompliant,
      isCompactType: _manifestWrapper.isCompactType()
    };
    const tableConfiguration = {
      ...oConfiguration,
      ...gridTableRowMode,
      ...oFilterConfiguration
    };
    if (tableType === "TreeTable") {
      tableConfiguration.hierarchyQualifier = tableSettings.hierarchyQualifier;
    }
    return tableConfiguration;
  }
  _exports.getTableManifestConfiguration = getTableManifestConfiguration;
  function getTypeConfig(oProperty, dataType) {
    var _targetType, _oTargetMapping, _propertyTypeConfig$t, _propertyTypeConfig$t2, _propertyTypeConfig$t3, _propertyTypeConfig$t4;
    let oTargetMapping = EDM_TYPE_MAPPING[oProperty === null || oProperty === void 0 ? void 0 : oProperty.type] || (dataType ? EDM_TYPE_MAPPING[dataType] : undefined);
    if (!oTargetMapping && oProperty !== null && oProperty !== void 0 && oProperty.targetType && ((_targetType = oProperty.targetType) === null || _targetType === void 0 ? void 0 : _targetType._type) === "TypeDefinition") {
      oTargetMapping = EDM_TYPE_MAPPING[oProperty.targetType.underlyingType];
    }
    const propertyTypeConfig = {
      type: (_oTargetMapping = oTargetMapping) === null || _oTargetMapping === void 0 ? void 0 : _oTargetMapping.type,
      constraints: {},
      formatOptions: {}
    };
    if (isProperty(oProperty)) {
      var _oTargetMapping$const, _oTargetMapping$const2, _oTargetMapping$const3, _oTargetMapping$const4, _oTargetMapping$const5, _oProperty$annotation8, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oTargetMapping$const6, _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14, _oProperty$annotation15, _oTargetMapping$const7, _oProperty$annotation16, _oProperty$annotation17;
      propertyTypeConfig.constraints = {
        scale: (_oTargetMapping$const = oTargetMapping.constraints) !== null && _oTargetMapping$const !== void 0 && _oTargetMapping$const.$Scale ? oProperty.scale : undefined,
        precision: (_oTargetMapping$const2 = oTargetMapping.constraints) !== null && _oTargetMapping$const2 !== void 0 && _oTargetMapping$const2.$Precision ? oProperty.precision : undefined,
        maxLength: (_oTargetMapping$const3 = oTargetMapping.constraints) !== null && _oTargetMapping$const3 !== void 0 && _oTargetMapping$const3.$MaxLength ? oProperty.maxLength : undefined,
        nullable: (_oTargetMapping$const4 = oTargetMapping.constraints) !== null && _oTargetMapping$const4 !== void 0 && _oTargetMapping$const4.$Nullable ? oProperty.nullable : undefined,
        minimum: (_oTargetMapping$const5 = oTargetMapping.constraints) !== null && _oTargetMapping$const5 !== void 0 && _oTargetMapping$const5["@Org.OData.Validation.V1.Minimum/$Decimal"] && !isNaN((_oProperty$annotation8 = oProperty.annotations) === null || _oProperty$annotation8 === void 0 ? void 0 : (_oProperty$annotation9 = _oProperty$annotation8.Validation) === null || _oProperty$annotation9 === void 0 ? void 0 : _oProperty$annotation9.Minimum) ? `${(_oProperty$annotation10 = oProperty.annotations) === null || _oProperty$annotation10 === void 0 ? void 0 : (_oProperty$annotation11 = _oProperty$annotation10.Validation) === null || _oProperty$annotation11 === void 0 ? void 0 : _oProperty$annotation11.Minimum}` : undefined,
        maximum: (_oTargetMapping$const6 = oTargetMapping.constraints) !== null && _oTargetMapping$const6 !== void 0 && _oTargetMapping$const6["@Org.OData.Validation.V1.Maximum/$Decimal"] && !isNaN((_oProperty$annotation12 = oProperty.annotations) === null || _oProperty$annotation12 === void 0 ? void 0 : (_oProperty$annotation13 = _oProperty$annotation12.Validation) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.Maximum) ? `${(_oProperty$annotation14 = oProperty.annotations) === null || _oProperty$annotation14 === void 0 ? void 0 : (_oProperty$annotation15 = _oProperty$annotation14.Validation) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Maximum}` : undefined,
        isDigitSequence: propertyTypeConfig.type === "sap.ui.model.odata.type.String" && (_oTargetMapping$const7 = oTargetMapping.constraints) !== null && _oTargetMapping$const7 !== void 0 && _oTargetMapping$const7[`@${"com.sap.vocabularies.Common.v1.IsDigitSequence"}`] && (_oProperty$annotation16 = oProperty.annotations) !== null && _oProperty$annotation16 !== void 0 && (_oProperty$annotation17 = _oProperty$annotation16.Common) !== null && _oProperty$annotation17 !== void 0 && _oProperty$annotation17.IsDigitSequence ? true : undefined
      };
    }
    propertyTypeConfig.formatOptions = {
      parseAsString: (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t = propertyTypeConfig.type) === null || _propertyTypeConfig$t === void 0 ? void 0 : _propertyTypeConfig$t.indexOf("sap.ui.model.odata.type.Int")) === 0 || (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t2 = propertyTypeConfig.type) === null || _propertyTypeConfig$t2 === void 0 ? void 0 : _propertyTypeConfig$t2.indexOf("sap.ui.model.odata.type.Double")) === 0 ? false : undefined,
      emptyString: (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t3 = propertyTypeConfig.type) === null || _propertyTypeConfig$t3 === void 0 ? void 0 : _propertyTypeConfig$t3.indexOf("sap.ui.model.odata.type.Int")) === 0 || (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t4 = propertyTypeConfig.type) === null || _propertyTypeConfig$t4 === void 0 ? void 0 : _propertyTypeConfig$t4.indexOf("sap.ui.model.odata.type.Double")) === 0 ? "" : undefined,
      parseKeepsEmptyString: propertyTypeConfig.type === "sap.ui.model.odata.type.String" ? true : undefined
    };
    return propertyTypeConfig;
  }
  _exports.getTypeConfig = getTypeConfig;
  return {
    getTableActions,
    getTableColumns,
    getColumnsFromEntityType,
    updateLinkedProperties,
    createTableVisualization,
    createDefaultTableVisualization,
    getCapabilityRestriction,
    getSelectionMode,
    getRowStatusVisibility,
    getImportance,
    getP13nMode,
    getTableAnnotationConfiguration,
    isFilteringCaseSensitive,
    splitPath,
    getSelectionVariantConfiguration,
    getTableManifestConfiguration,
    getTypeConfig,
    updateTableVisualizationForType
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2x1bW5UeXBlIiwiZ2V0VGFibGVBY3Rpb25zIiwibGluZUl0ZW1Bbm5vdGF0aW9uIiwidmlzdWFsaXphdGlvblBhdGgiLCJjb252ZXJ0ZXJDb250ZXh0IiwibmF2aWdhdGlvblNldHRpbmdzIiwiYVRhYmxlQWN0aW9ucyIsImdldFRhYmxlQW5ub3RhdGlvbkFjdGlvbnMiLCJhQW5ub3RhdGlvbkFjdGlvbnMiLCJ0YWJsZUFjdGlvbnMiLCJhSGlkZGVuQWN0aW9ucyIsImhpZGRlblRhYmxlQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uIiwiYWN0aW9ucyIsImFjdGlvbk92ZXJ3cml0ZUNvbmZpZyIsImlzTmF2aWdhYmxlIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiZW5hYmxlT25TZWxlY3QiLCJlbmFibGVBdXRvU2Nyb2xsIiwiZW5hYmxlZCIsInZpc2libGUiLCJkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24iLCJjb21tYW5kIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJjb21tYW5kQWN0aW9ucyIsImdldFRhYmxlQ29sdW1ucyIsImFubm90YXRpb25Db2x1bW5zIiwiZ2V0Q29sdW1uc0Zyb21Bbm5vdGF0aW9ucyIsIm1hbmlmZXN0Q29sdW1ucyIsImdldENvbHVtbnNGcm9tTWFuaWZlc3QiLCJjb2x1bW5zIiwiZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUiLCJ3aWR0aCIsImltcG9ydGFuY2UiLCJob3Jpem9udGFsQWxpZ24iLCJhdmFpbGFiaWxpdHkiLCJzZXR0aW5ncyIsImZvcm1hdE9wdGlvbnMiLCJnZXRBZ2dyZWdhdGVEZWZpbml0aW9uc0Zyb21FbnRpdHlUeXBlIiwiZW50aXR5VHlwZSIsInRhYmxlQ29sdW1ucyIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiQWdncmVnYXRpb25IZWxwZXIiLCJmaW5kQ29sdW1uRnJvbVBhdGgiLCJwYXRoIiwiZmluZCIsImNvbHVtbiIsImFubm90YXRpb25Db2x1bW4iLCJwcm9wZXJ0eUluZm9zIiwidW5kZWZpbmVkIiwicmVsYXRpdmVQYXRoIiwiaXNBbmFseXRpY3NTdXBwb3J0ZWQiLCJjdXJyZW5jeU9yVW5pdFByb3BlcnRpZXMiLCJTZXQiLCJmb3JFYWNoIiwidGFibGVDb2x1bW4iLCJ1bml0IiwiYWRkIiwiY3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnMiLCJnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucyIsImRlZmluaXRpb25zIiwiYW5ub3RhdGlvbiIsImFnZ3JlZ2F0ZWRQcm9wZXJ0eSIsIl9lbnRpdHlUeXBlIiwiZW50aXR5UHJvcGVydGllcyIsInByb3BlcnR5IiwibmFtZSIsInF1YWxpZmllciIsImNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMiLCJhbm5vdGF0aW9ucyIsIkFnZ3JlZ2F0aW9uIiwiQ29udGV4dERlZmluaW5nUHJvcGVydGllcyIsIm1hcCIsImN0eERlZlByb3BlcnR5IiwidmFsdWUiLCJyZXN1bHQiLCJyYXdDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzIiwiaGFzIiwiZGVmYXVsdEFnZ3JlZ2F0ZSIsImNvbnRleHREZWZpbmluZ1Byb3BlcnR5TmFtZSIsImZvdW5kQ29sdW1uIiwicHVzaCIsImxlbmd0aCIsInVwZGF0ZVRhYmxlVmlzdWFsaXphdGlvbkZvclR5cGUiLCJ0YWJsZVZpc3VhbGl6YXRpb24iLCJwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiIsImNvbnRyb2wiLCJ0eXBlIiwiYWdncmVnYXRlc0RlZmluaXRpb25zIiwiZW5hYmxlQW5hbHl0aWNzIiwiZW5hYmxlJHNlbGVjdCIsImVuYWJsZSQkZ2V0S2VlcEFsaXZlQ29udGV4dCIsImFnZ3JlZ2F0ZXMiLCJfdXBkYXRlUHJvcGVydHlJbmZvc1dpdGhBZ2dyZWdhdGVzRGVmaW5pdGlvbnMiLCJhbGxvd2VkVHJhbnNmb3JtYXRpb25zIiwiZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucyIsImVuYWJsZUFuYWx5dGljc1NlYXJjaCIsImluZGV4T2YiLCJncm91cENvbmRpdGlvbnMiLCJnZXRHcm91cENvbmRpdGlvbnMiLCJhZ2dyZWdhdGVDb25kaXRpb25zIiwiZ2V0QWdncmVnYXRlQ29uZGl0aW9ucyIsImdldE5hdmlnYXRpb25UYXJnZXRQYXRoIiwibmF2aWdhdGlvblByb3BlcnR5UGF0aCIsIm1hbmlmZXN0V3JhcHBlciIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uIiwibmF2Q29uZmlnIiwiT2JqZWN0Iiwia2V5cyIsImRhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwiY29udGV4dFBhdGgiLCJnZXRDb250ZXh0UGF0aCIsIm5hdkNvbmZpZ0ZvckNvbnRleHRQYXRoIiwidGFyZ2V0RW50aXR5U2V0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJ1cGRhdGVMaW5rZWRQcm9wZXJ0aWVzIiwiZmluZENvbHVtbkJ5UGF0aCIsIm9Db2x1bW4iLCJvVGFibGVDb2x1bW4iLCJvUHJvcGVydHkiLCJvUHJvcCIsIm9Vbml0IiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5Iiwib1RpbWV6b25lIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkiLCJzVGltZXpvbmUiLCJDb21tb24iLCJUaW1lem9uZSIsIm9Vbml0Q29sdW1uIiwic1VuaXQiLCJNZWFzdXJlcyIsIklTT0N1cnJlbmN5IiwiVW5pdCIsInVuaXRUZXh0Iiwib1RpbWV6b25lQ29sdW1uIiwidGltZXpvbmUiLCJ0aW1lem9uZVRleHQiLCJ0b1N0cmluZyIsImRpc3BsYXlNb2RlIiwiZ2V0RGlzcGxheU1vZGUiLCJ0ZXh0QW5ub3RhdGlvbiIsIlRleHQiLCJpc1BhdGhFeHByZXNzaW9uIiwib1RleHRDb2x1bW4iLCJ0ZXh0QXJyYW5nZW1lbnQiLCJ0ZXh0UHJvcGVydHkiLCJtb2RlIiwiZ2V0U2VtYW50aWNLZXlzQW5kVGl0bGVJbmZvIiwiaGVhZGVySW5mb1RpdGxlUGF0aCIsIlVJIiwiSGVhZGVySW5mbyIsIlRpdGxlIiwiVmFsdWUiLCJzZW1hbnRpY0tleUFubm90YXRpb25zIiwiU2VtYW50aWNLZXkiLCJoZWFkZXJJbmZvVHlwZU5hbWUiLCJUeXBlTmFtZSIsInNlbWFudGljS2V5Q29sdW1ucyIsImNyZWF0ZVRhYmxlVmlzdWFsaXphdGlvbiIsImlzQ29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbnQiLCJ2aWV3Q29uZmlndXJhdGlvbiIsInRhYmxlTWFuaWZlc3RDb25maWciLCJnZXRUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiIsInNwbGl0UGF0aCIsIm5hdmlnYXRpb25UYXJnZXRQYXRoIiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwic2VtYW50aWNLZXlzQW5kSGVhZGVySW5mb1RpdGxlIiwib1Zpc3VhbGl6YXRpb24iLCJWaXN1YWxpemF0aW9uVHlwZSIsIlRhYmxlIiwiZ2V0VGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbiIsInJlbW92ZUR1cGxpY2F0ZUFjdGlvbnMiLCJKU09OIiwic3RyaW5naWZ5Iiwib3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyIsImdldE9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMiLCJoZWFkZXJJbmZvVGl0bGUiLCJzZW1hbnRpY0tleXMiLCJjcmVhdGVEZWZhdWx0VGFibGVWaXN1YWxpemF0aW9uIiwiaXNCbGFua1RhYmxlIiwiZ2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlIiwiZ2V0RW50aXR5VHlwZSIsIkFjdGlvbkhlbHBlciIsImdldEN1cnJlbnRFbnRpdHlTZXRVcGRhdGFibGVQYXRoIiwicmVzdHJpY3Rpb25zIiwiZ2V0UmVzdHJpY3Rpb25zIiwiZW50aXR5U2V0IiwiZ2V0RW50aXR5U2V0IiwidXBkYXRhYmxlIiwiaXNVcGRhdGFibGUiLCJpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5IiwiaXNDb25zdGFudCIsImV4cHJlc3Npb24iLCJuYXZpZ2F0aW9uRXhwcmVzc2lvbiIsIl90eXBlIiwidXBkYXRhYmxlUHJvcGVydHlQYXRoIiwiQ2FwYWJpbGl0aWVzIiwiVXBkYXRlUmVzdHJpY3Rpb25zIiwiVXBkYXRhYmxlIiwicHJvcGVydGllcyIsImFjdGlvbk5hbWUiLCJwcm9wZXJ0eU5hbWUiLCJzaXplIiwidGl0bGVQcm9wZXJ0eSIsIkFycmF5IiwiZnJvbSIsImpvaW4iLCJnZXRVSUhpZGRlbkV4cEZvckFjdGlvbnNSZXF1aXJpbmdDb250ZXh0IiwiY3VycmVudEVudGl0eVR5cGUiLCJjb250ZXh0RGF0YU1vZGVsT2JqZWN0UGF0aCIsImlzRW50aXR5U2V0IiwiYVVpSGlkZGVuUGF0aEV4cHJlc3Npb25zIiwiZGF0YUZpZWxkIiwiJFR5cGUiLCJBY3Rpb25UYXJnZXQiLCJpc0JvdW5kIiwic291cmNlRW50aXR5VHlwZSIsIlJlcXVpcmVzQ29udGV4dCIsIklubGluZSIsInZhbHVlT2YiLCJIaWRkZW4iLCJlcXVhbCIsImdldEJpbmRpbmdFeHBGcm9tQ29udGV4dCIsInNvdXJjZSIsInNFeHByZXNzaW9uIiwic1BhdGgiLCJzdWJzdHJpbmciLCJhU3BsaXRQYXRoIiwic3BsaXQiLCJzTmF2aWdhdGlvblBhdGgiLCJ0YXJnZXRPYmplY3QiLCJwYXJ0bmVyIiwicGF0aEluTW9kZWwiLCJzbGljZSIsImNvbnN0YW50IiwidXBkYXRlTWFuaWZlc3RBY3Rpb25BbmRUYWdJdCIsImRhdGFGaWVsZElkIiwic29tZSIsImFjdGlvbktleSIsInJlcXVpcmVzU2VsZWN0aW9uIiwiaGFzQm91bmRBY3Rpb25zQWx3YXlzVmlzaWJsZUluVG9vbEJhciIsIm1hbmlmZXN0QWN0aW9uSWQiLCJnZW5lcmF0ZSIsIkFjdGlvbiIsIlNlbWFudGljT2JqZWN0IiwiaGFzQ3VzdG9tQWN0aW9uc0Fsd2F5c1Zpc2libGVJblRvb2xCYXIiLCJhY3Rpb24iLCJnZXRWaXNpYmxlRXhwRm9yQ3VzdG9tQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQiLCJhVmlzaWJsZVBhdGhFeHByZXNzaW9ucyIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiZ2V0Q2FwYWJpbGl0eVJlc3RyaWN0aW9uIiwiaXNEZWxldGFibGUiLCJpc1BhdGhEZWxldGFibGUiLCJpc1BhdGhVcGRhdGFibGUiLCJnZXRTZWxlY3Rpb25Nb2RlIiwidGFyZ2V0Q2FwYWJpbGl0aWVzIiwiZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24iLCJtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uIiwiU2VsZWN0aW9uTW9kZSIsIk5vbmUiLCJ0YWJsZU1hbmlmZXN0U2V0dGluZ3MiLCJzZWxlY3Rpb25Nb2RlIiwidGFibGVTZXR0aW5ncyIsImFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMiLCJhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucyIsImlzUGFyZW50RGVsZXRhYmxlIiwicGFyZW50RW50aXR5U2V0RGVsZXRhYmxlIiwiZ2V0VGVtcGxhdGVUeXBlIiwiVGVtcGxhdGVUeXBlIiwiT2JqZWN0UGFnZSIsImNvbXBpbGVFeHByZXNzaW9uIiwiYk1hc3NFZGl0RW5hYmxlZCIsImlmRWxzZSIsImFuZCIsIklzRWRpdGFibGUiLCJNdWx0aSIsIkF1dG8iLCJTaW5nbGUiLCJidXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiIsIm9yIiwiZWRpdE1vZGVidXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiIsImNvbmNhdCIsImNvcHlEYXRhRmllbGQiLCJnZXRDb3B5QWN0aW9uIiwiZmlsdGVyIiwiZGF0YUZpZWxkSXNDb3B5QWN0aW9uIiwiQWN0aW9uVHlwZSIsIkNvcHkiLCJhbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJrZXkiLCJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCJub3QiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJnZXRSZWxhdGl2ZU1vZGVsUGF0aEZ1bmN0aW9uIiwidGV4dCIsIkxhYmVsIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImdldFRleHQiLCJEZWZhdWx0IiwiaXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdCIsIkRldGVybWluaW5nIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiZ2V0SGlnaGxpZ2h0Um93QmluZGluZyIsImNyaXRpY2FsaXR5QW5ub3RhdGlvbiIsImlzRHJhZnRSb290IiwidGFyZ2V0RW50aXR5VHlwZSIsImRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uIiwiTWVzc2FnZVR5cGUiLCJnZXRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVR5cGUiLCJhTWlzc2luZ0tleXMiLCJmb3JtYXRSZXN1bHQiLCJFbnRpdHkiLCJIYXNBY3RpdmUiLCJJc0FjdGl2ZSIsInRhYmxlRm9ybWF0dGVycyIsInJvd0hpZ2hsaWdodGluZyIsIl9nZXRDcmVhdGlvbkJlaGF2aW91ciIsInRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uIiwibmF2aWdhdGlvbiIsImNyZWF0ZSIsImRldGFpbCIsIm9yaWdpbmFsVGFibGVTZXR0aW5ncyIsIm91dGJvdW5kIiwib3V0Ym91bmREZXRhaWwiLCJuZXdBY3Rpb24iLCJ0YXJnZXRBbm5vdGF0aW9ucyIsInRhcmdldEFubm90YXRpb25zQ29tbW9uIiwidGFyZ2V0QW5ub3RhdGlvbnNTZXNzaW9uIiwiU2Vzc2lvbiIsIkRyYWZ0Um9vdCIsIk5ld0FjdGlvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJjcmVhdGlvbk1vZGUiLCJDcmVhdGlvbk1vZGUiLCJDcmVhdGlvblJvdyIsIkVycm9yIiwicm91dGUiLCJhcHBlbmQiLCJjcmVhdGVBdEVuZCIsIm5hdmlnYXRlVG9UYXJnZXQiLCJOZXdQYWdlIiwiX2dldFJvd0NvbmZpZ3VyYXRpb25Qcm9wZXJ0eSIsInRhcmdldFBhdGgiLCJ0YWJsZVR5cGUiLCJwcmVzc1Byb3BlcnR5IiwibmF2aWdhdGlvblRhcmdldCIsImNyaXRpY2FsaXR5UHJvcGVydHkiLCJkaXNwbGF5IiwidGFyZ2V0IiwiTW9kZWxIZWxwZXIiLCJpc1NpbmdsZXRvbiIsIkNyaXRpY2FsaXR5IiwiZ2V0RHJhZnRSb290IiwiZ2V0RHJhZnROb2RlIiwicm93TmF2aWdhdGVkRXhwcmVzc2lvbiIsIm5hdmlnYXRlZFJvdyIsInByZXNzIiwicm93TmF2aWdhdGVkIiwiSXNJbmFjdGl2ZSIsImNvbHVtbnNUb0JlQ3JlYXRlZCIsIm5vblNvcnRhYmxlQ29sdW1ucyIsInRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiIsImV4aXN0cyIsInRhcmdldFR5cGUiLCJyZWxhdGVkUHJvcGVydGllc0luZm8iLCJjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMiLCJyZWxhdGVkUHJvcGVydHlOYW1lcyIsImFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJ0ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24iLCJjb2x1bW5JbmZvIiwiZ2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eSIsImdldEFubm90YXRpb25zQnlUZXJtIiwib0NvbHVtbkRyYWZ0SW5kaWNhdG9yIiwiZ2V0RGVmYXVsdERyYWZ0SW5kaWNhdG9yRm9yQ29sdW1uIiwiZXhwb3J0U2V0dGluZ3MiLCJ0ZW1wbGF0ZSIsImV4cG9ydFNldHRpbmdzVGVtcGxhdGUiLCJ3cmFwIiwiZXhwb3J0U2V0dGluZ3NXcmFwcGluZyIsIl9nZXRFeHBvcnREYXRhVHlwZSIsImV4cG9ydFVuaXROYW1lIiwidW5pdFByb3BlcnR5IiwiZXhwb3J0VW5pdFN0cmluZyIsImV4cG9ydFRpbWV6b25lTmFtZSIsInRpbWV6b25lUHJvcGVydHkiLCJ1dGMiLCJleHBvcnRUaW1lem9uZVN0cmluZyIsImV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlIiwiYWRkaXRpb25hbFByb3BlcnR5SW5mb3MiLCJyZWxhdGVkQ29sdW1ucyIsIl9jcmVhdGVSZWxhdGVkQ29sdW1ucyIsImZ1bGxQcm9wZXJ0eVBhdGgiLCJ1c2VEYXRhRmllbGRQcmVmaXgiLCJhdmFpbGFibGVGb3JBZGFwdGF0aW9uIiwicmVwbGFjZVNwZWNpYWxDaGFycyIsInNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGgiLCJnZXRTZW1hbnRpY09iamVjdFBhdGgiLCJpc0hpZGRlbiIsImdyb3VwUGF0aCIsIl9zbGljZUF0U2xhc2giLCJpc0dyb3VwIiwiZXhwb3J0VHlwZSIsInNEYXRlSW5wdXRGb3JtYXQiLCJkYXRhVHlwZSIsImdldERhdGFGaWVsZERhdGFUeXBlIiwicHJvcGVydHlUeXBlQ29uZmlnIiwiZ2V0VHlwZUNvbmZpZyIsImlzQVByb3BlcnR5RnJvbVRleHRPbmx5QW5ub3RhdGlvbiIsInNvcnRhYmxlIiwidHlwZUNvbmZpZyIsImNsYXNzTmFtZSIsImNvbnN0cmFpbnRzIiwiX2lzRXhwb3J0YWJsZUNvbHVtbiIsImlucHV0Rm9ybWF0Iiwic2NhbGUiLCJkZWxpbWl0ZXIiLCJjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHMiLCJfZ2V0Q29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzIiwiQW5ub3RhdGlvbiIsImxhYmVsIiwiZ2V0TGFiZWwiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJzZW1hbnRpY09iamVjdFBhdGgiLCJBdmFpbGFiaWxpdHlUeXBlIiwiQWRhcHRhdGlvbiIsImlzR3JvdXBhYmxlIiwiaXNQcm9wZXJ0eUdyb3VwYWJsZSIsImlzS2V5IiwiY2FzZVNlbnNpdGl2ZSIsImlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSIsImdldEltcG9ydGFuY2UiLCJEYXRhRmllbGREZWZhdWx0IiwiYWRkaXRpb25hbExhYmVscyIsInNUb29sdGlwIiwiX2dldFRvb2x0aXAiLCJ0b29sdGlwIiwidGFyZ2V0VmFsdWVmcm9tRFAiLCJnZXRUYXJnZXRWYWx1ZU9uRGF0YVBvaW50IiwiaXNEYXRhUG9pbnRGcm9tRGF0YUZpZWxkRGVmYXVsdCIsInByb3BlcnR5VHlwZSIsImRhdGFGaWVsZERlZmF1bHRQcm9wZXJ0eSIsImlzUHJvcGVydHkiLCJpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbiIsIlRhcmdldCIsIiR0YXJnZXQiLCJNZWRpYVR5cGUiLCJ0ZXJtIiwiaXNVUkwiLCJfaXNWYWxpZENvbHVtbiIsIl9nZXRWaXNpYmxlRXhwcmVzc2lvbiIsImRhdGFGaWVsZE1vZGVsUGF0aCIsInByb3BlcnR5VmFsdWUiLCJpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkIiwiaXNBbmFseXRpY3MiLCJJc0V4cGFuZGVkIiwiaXNBbmFseXRpY2FsTGVhZiIsIk5vZGVMZXZlbCIsIl9nZXRGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMiLCJkYXRhRmllbGRHcm91cCIsImZpZWxkRm9ybWF0T3B0aW9ucyIsImZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyIsIkRhdGEiLCJpbm5lckRhdGFGaWVsZCIsImlzTmF2aWdhdGlvblByb3BlcnR5IiwiZGF0YUZpZWxkRGVmYXVsdCIsImlzRGF0YUZpZWxkVHlwZXMiLCJRdWlja0luZm8iLCJkYXRhcG9pbnRUYXJnZXQiLCJnZXRSb3dTdGF0dXNWaXNpYmlsaXR5IiwiY29sTmFtZSIsImlzU2VtYW50aWNLZXlJbkZpZWxkR3JvdXAiLCJnZXRFcnJvclN0YXR1c1RleHRWaXNpYmlsaXR5Rm9ybWF0dGVyIiwiZXhpc3RpbmdDb2x1bW5zIiwicmVsYXRlZFByb3BlcnR5TmFtZU1hcCIsImdldEFic29sdXRlQW5ub3RhdGlvblBhdGgiLCJyZWxhdGVkQ29sdW1uIiwibmV3TmFtZSIsImlzUGFydE9mTGluZUl0ZW0iLCJpbmNsdWRlcyIsInByb3BlcnR5SW5mbyIsIl9nZXRBbm5vdGF0aW9uQ29sdW1uTmFtZSIsImNyZWF0ZVRlY2huaWNhbFByb3BlcnR5IiwicmVsYXRlZEFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVNYXAiLCJjb2x1bW5FeGlzdHMiLCJhZGRpdGlvbmFsUHJvcGVydHkiLCJ0ZWNobmljYWxDb2x1bW4iLCJhZ2dyZWdhdGFibGUiLCJleHRlbnNpb24iLCJ0ZWNobmljYWxseUdyb3VwYWJsZSIsInRlY2huaWNhbGx5QWdncmVnYXRhYmxlIiwiX2dldFNob3dEYXRhRmllbGRzTGFiZWwiLCJmaWVsZEdyb3VwTmFtZSIsIm9Db2x1bW5zIiwiYUNvbHVtbktleXMiLCJzaG93RGF0YUZpZWxkc0xhYmVsIiwiX2dldFJlbGF0aXZlUGF0aCIsImlzTGFzdFNsYXNoIiwiaXNMYXN0UGFydCIsImlTbGFzaEluZGV4IiwibGFzdEluZGV4T2YiLCJfaXNDb2x1bW5NdWx0aVZhbHVlZCIsInByb3BlcnR5T2JqZWN0UGF0aCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiaXNNdWx0aVZhbHVlRmllbGQiLCJfaXNDb2x1bW5Tb3J0YWJsZSIsInByb3BlcnR5UGF0aCIsImZpbHRlckZ1bmN0aW9ucyIsIl9nZXRGaWx0ZXJGdW5jdGlvbnMiLCJpc0FycmF5IiwiQ29udmVydGVyQ29udGV4dCIsImNhcGFiaWxpdGllcyIsIkZpbHRlckZ1bmN0aW9ucyIsImdldEVudGl0eUNvbnRhaW5lciIsIl9nZXREZWZhdWx0Rm9ybWF0T3B0aW9uc0ZvclRhYmxlIiwidGV4dExpbmVzRWRpdCIsIl9maW5kU2VtYW50aWNLZXlWYWx1ZXMiLCJhU2VtYW50aWNLZXlWYWx1ZXMiLCJiU2VtYW50aWNLZXlGb3VuZCIsImkiLCJ2YWx1ZXMiLCJzZW1hbnRpY0tleUZvdW5kIiwiX2ZpbmRQcm9wZXJ0aWVzIiwic2VtYW50aWNLZXlWYWx1ZXMiLCJmaWVsZEdyb3VwUHJvcGVydGllcyIsInNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXAiLCJzUHJvcGVydHlQYXRoIiwidG1wIiwiZmllbGRHcm91cFByb3BlcnR5UGF0aCIsIl9maW5kU2VtYW50aWNLZXlWYWx1ZXNJbkZpZWxkR3JvdXAiLCJhUHJvcGVydGllcyIsIl9wcm9wZXJ0aWVzRm91bmQiLCJpc0ZpZWxkR3JvdXBDb2x1bW4iLCJzZW1hbnRpY0tleSIsInNlbWFudGljS2V5SW5GaWVsZEdyb3VwIiwiZm9ybWF0T3B0aW9uc09iaiIsImhhc0RyYWZ0SW5kaWNhdG9yIiwic2VtYW50aWNrZXlzIiwib2JqZWN0U3RhdHVzVGV4dFZpc2liaWxpdHkiLCJmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGgiLCJfZ2V0SW1wTnVtYmVyIiwiSW1wb3J0YW5jZSIsIl9nZXREYXRhRmllbGRJbXBvcnRhbmNlIiwiX2dldE1heEltcG9ydGFuY2UiLCJmaWVsZHMiLCJtYXhJbXBOdW1iZXIiLCJpbXBOdW1iZXIiLCJEYXRhRmllbGRXaXRoTWF4SW1wb3J0YW5jZSIsImZpZWxkIiwiZmllbGRzV2l0aEltcG9ydGFuY2UiLCJtYXBTZW1hbnRpY0tleXMiLCJmaWVsZEdyb3VwRGF0YSIsImZpZWxkR3JvdXBIYXNTZW1hbnRpY0tleSIsImZpZWxkR3JvdXBEYXRhRmllbGQiLCJIaWdoIiwiaXRlbSIsImdldE5vblNvcnRhYmxlUHJvcGVydGllc1Jlc3RyaWN0aW9ucyIsInRhYmxlQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwibGluZUl0ZW0iLCJjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXNSZWN1cnNpdmVseSIsInNMYWJlbCIsInZpc3VhbFNldHRpbmdzIiwid2lkdGhDYWxjdWxhdGlvbiIsImlzTXVsdGlWYWx1ZSIsIkZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyIsIkhUTUw1IiwiQ3NzRGVmYXVsdHMiLCJyZWxhdGVkUHJvcGVydHlOYW1lIiwiYWRkaXRpb25hbFByb3BlcnR5TmFtZSIsIl9nZXRQcm9wZXJ0eU5hbWVzIiwibWF0Y2hlZFByb3BlcnRpZXMiLCJyZXNvbHZlUGF0aCIsIl9hcHBlbmRDdXN0b21UZW1wbGF0ZSIsImludGVybmFsQ29sdW1ucyIsImlzQW5ub3RhdGlvbkNvbHVtbiIsImlzU2xvdENvbHVtbiIsIm1hbmlmZXN0Q29sdW1uIiwiU2xvdCIsImlzQ3VzdG9tQ29sdW1uIiwiX3VwZGF0ZUxpbmtlZFByb3BlcnRpZXNPbkN1c3RvbUNvbHVtbnMiLCJhbm5vdGF0aW9uVGFibGVDb2x1bW5zIiwicHJvcCIsInJlcGxhY2UiLCJ2YWxpZGF0ZUtleSIsImJhc2VUYWJsZUNvbHVtbiIsInBvc2l0aW9uIiwiYW5jaG9yIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJwcm9wZXJ0aWVzVG9PdmVyd3JpdGVBbm5vdGF0aW9uQ29sdW1uIiwiaXNBY3Rpb25OYXZpZ2FibGUiLCJiYXNlTWFuaWZlc3RDb2x1bW4iLCJoZWFkZXIiLCJIb3Jpem9udGFsQWxpZ24iLCJCZWdpbiIsImlkIiwiY3VzdG9tVGFibGVDb2x1bW4iLCJtZXNzYWdlIiwiZ2V0RGlhZ25vc3RpY3MiLCJhZGRJc3N1ZSIsIklzc3VlQ2F0ZWdvcnkiLCJNYW5pZmVzdCIsIklzc3VlU2V2ZXJpdHkiLCJMb3ciLCJJc3N1ZUNhdGVnb3J5VHlwZSIsIkFubm90YXRpb25Db2x1bW5zIiwiSW52YWxpZEtleSIsImdldFAxM25Nb2RlIiwidmFyaWFudE1hbmFnZW1lbnQiLCJnZXRWYXJpYW50TWFuYWdlbWVudCIsImFQZXJzb25hbGl6YXRpb24iLCJpc0FuYWx5dGljYWxUYWJsZSIsImlzUmVzcG9uc2l2ZVRhYmxlIiwicGVyc29uYWxpemF0aW9uIiwic29ydCIsImFnZ3JlZ2F0ZSIsIkxpc3RSZXBvcnQiLCJWYXJpYW50TWFuYWdlbWVudFR5cGUiLCJDb250cm9sIiwiX2lzRmlsdGVyQmFySGlkZGVuIiwiaXNGaWx0ZXJCYXJIaWRkZW4iLCJoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zIiwiQW5hbHl0aWNhbExpc3RQYWdlIiwiZ2V0U29ydENvbmRpdGlvbnMiLCJub25Tb3J0YWJsZVByb3BlcnRpZXMiLCJzb3J0Q29uZGl0aW9ucyIsIlNvcnRPcmRlciIsInNvcnRlcnMiLCJjb25kaXRpb25zIiwiY29uZGl0aW9uIiwiY29uZGl0aW9uUHJvcGVydHkiLCJQcm9wZXJ0eSIsImluZm9OYW1lIiwiY29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyIsImRlc2NlbmRpbmciLCJEZXNjZW5kaW5nIiwiZ2V0SW5pdGlhbEV4cGFuc2lvbkxldmVsIiwibGV2ZWwiLCJJbml0aWFsRXhwYW5zaW9uTGV2ZWwiLCJwYXRocyIsImluZm9OYW1lcyIsImN1cnJlbnRQYXRoIiwiR3JvdXBCeSIsImFHcm91cEJ5IiwiYUdyb3VwTGV2ZWxzIiwiZ3JvdXBMZXZlbHMiLCJhZ2dyZWdhdGFibGVQcm9wZXJ0eU5hbWUiLCJhZ2dyZWdhdGFibGVQcm9wZXJ0eURlZmluaXRpb24iLCJjdXN0b21BZ2dyZWdhdGUiLCJhZGRpdGlvbmFsUHJvcGVydHlJbmZvIiwiVG90YWwiLCJhVG90YWxzIiwidGl0bGUiLCJUeXBlTmFtZVBsdXJhbCIsInBhZ2VNYW5pZmVzdFNldHRpbmdzIiwiaGFzQWJzb2x1dGVQYXRoIiwicDEzbk1vZGUiLCJnZXRUYWJsZUlEIiwiY3JlYXRpb25CZWhhdmlvdXIiLCJzdGFuZGFyZEFjdGlvbnNDb250ZXh0IiwiZ2VuZXJhdGVTdGFuZGFyZEFjdGlvbnNDb250ZXh0IiwiZ2V0RGVsZXRlVmlzaWJpbGl0eSIsImNyZWF0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uIiwiZ2V0Q3JlYXRlVmlzaWJpbGl0eSIsIm1hc3NFZGl0QnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24iLCJnZXRNYXNzRWRpdFZpc2liaWxpdHkiLCJpc0luc2VydFVwZGF0ZVRlbXBsYXRlZCIsImdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nIiwiaXNEcmFmdE9yU3RpY2t5U3VwcG9ydGVkIiwidGhyZXNob2xkIiwiTWF4SXRlbXMiLCJpc1NlYXJjaGFibGUiLCJpc1BhdGhTZWFyY2hhYmxlIiwic3RhbmRhcmRBY3Rpb25zIiwiZ2V0U3RhbmRhcmRBY3Rpb25DcmVhdGUiLCJkZWxldGUiLCJnZXRTdGFuZGFyZEFjdGlvbkRlbGV0ZSIsInBhc3RlIiwiZ2V0U3RhbmRhcmRBY3Rpb25QYXN0ZSIsIm1hc3NFZGl0IiwiZ2V0U3RhbmRhcmRBY3Rpb25NYXNzRWRpdCIsImNyZWF0aW9uUm93IiwiZ2V0Q3JlYXRpb25Sb3ciLCJlbnRpdHlOYW1lIiwiY29sbGVjdGlvbiIsIm5hdmlnYXRpb25QYXRoIiwicm93IiwiaXNJbkRpc3BsYXlNb2RlIiwiYXV0b0JpbmRPbkluaXQiLCJzZWFyY2hhYmxlIiwiaW5pdGlhbEV4cGFuc2lvbkxldmVsIiwiaXNDb21wbGV4UHJvcGVydHkiLCJleHBvcnREYXRhVHlwZSIsInN1YnN0ciIsImdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uIiwic2VsZWN0aW9uVmFyaWFudFBhdGgiLCJyZXNvbHZlZFRhcmdldCIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwic2VsZWN0aW9uIiwicHJvcGVydHlOYW1lcyIsIlNlbGVjdE9wdGlvbnMiLCJzZWxlY3RPcHRpb24iLCJQcm9wZXJ0eU5hbWUiLCJfZ2V0RnVsbFNjcmVlbkJhc2VkT25EZXZpY2UiLCJpc0lwaG9uZSIsImVuYWJsZUZ1bGxTY3JlZW4iLCJJc3N1ZVR5cGUiLCJGVUxMU0NSRUVOTU9ERV9OT1RfT05fTElTVFJFUE9SVCIsIl9nZXRNdWx0aVNlbGVjdE1vZGUiLCJtdWx0aVNlbGVjdE1vZGUiLCJzZWxlY3RBbGwiLCJ1c2VJY29uVGFiQmFyIiwiX2dldFRhYmxlVHlwZSIsImlzRGVza3RvcCIsIl9nZXRHcmlkVGFibGVNb2RlIiwiaXNUZW1wbGF0ZUxpc3RSZXBvcnQiLCJyb3dDb3VudE1vZGUiLCJyb3dDb3VudCIsIl9nZXRDb25kZW5zZWRUYWJsZUxheW91dCIsIl90YWJsZVR5cGUiLCJfdGFibGVTZXR0aW5ncyIsImNvbmRlbnNlZFRhYmxlTGF5b3V0IiwiX2dldFRhYmxlU2VsZWN0aW9uTGltaXQiLCJzZWxlY3Rpb25MaW1pdCIsIl9nZXRUYWJsZUlubGluZUNyZWF0aW9uUm93Q291bnQiLCJpbmxpbmVDcmVhdGlvblJvd0NvdW50IiwiX2dldEZpbHRlcnMiLCJxdWlja0ZpbHRlclBhdGhzIiwicXVpY2tTZWxlY3Rpb25WYXJpYW50IiwicXVpY2tGaWx0ZXJzIiwic2hvd0NvdW50cyIsInF1aWNrVmFyaWFudFNlbGVjdGlvbiIsIl9nZXRFbmFibGVFeHBvcnQiLCJlbmFibGVQYXN0ZSIsImVuYWJsZUV4cG9ydCIsIl9nZXRGaWx0ZXJDb25maWd1cmF0aW9uIiwiZmlsdGVycyIsImhpZGVUYWJsZVRpdGxlIiwiaGVhZGVyVmlzaWJsZSIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibmF2UHJvcGVydHkiLCJjaGVja0NvbmRlbnNlZExheW91dCIsIl9tYW5pZmVzdFdyYXBwZXIiLCJlbmFibGVBdXRvQ29sdW1uV2lkdGgiLCJpc1Bob25lIiwidGVtcGxhdGVUeXBlIiwiZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyIiwiaXNDb25kZW5zZWRMYXlvdXRDb21wbGlhbnQiLCJvRmlsdGVyQ29uZmlndXJhdGlvbiIsImN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiIsImdyaWRUYWJsZVJvd01vZGUiLCJvQ29uZmlndXJhdGlvbiIsImRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEiLCJlbmFibGVNYXNzRWRpdCIsImlubGluZUNyZWF0aW9uUm93c0hpZGRlbkluRWRpdE1vZGUiLCJzaG93Um93Q291bnQiLCJnZXRWaWV3Q29uZmlndXJhdGlvbiIsInVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0IiwiaXNDb21wYWN0VHlwZSIsInRhYmxlQ29uZmlndXJhdGlvbiIsImhpZXJhcmNoeVF1YWxpZmllciIsIm9UYXJnZXRNYXBwaW5nIiwiRURNX1RZUEVfTUFQUElORyIsInVuZGVybHlpbmdUeXBlIiwiJFNjYWxlIiwicHJlY2lzaW9uIiwiJFByZWNpc2lvbiIsIm1heExlbmd0aCIsIiRNYXhMZW5ndGgiLCJudWxsYWJsZSIsIiROdWxsYWJsZSIsIm1pbmltdW0iLCJpc05hTiIsIlZhbGlkYXRpb24iLCJNaW5pbXVtIiwibWF4aW11bSIsIk1heGltdW0iLCJpc0RpZ2l0U2VxdWVuY2UiLCJJc0RpZ2l0U2VxdWVuY2UiLCJwYXJzZUFzU3RyaW5nIiwiZW1wdHlTdHJpbmciLCJwYXJzZUtlZXBzRW1wdHlTdHJpbmciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0RW50aXR5VHlwZSxcblx0RW51bVZhbHVlLFxuXHROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0UHJvcGVydHksXG5cdFByb3BlcnR5QW5ub3RhdGlvblZhbHVlLFxuXHRQcm9wZXJ0eVBhdGgsXG5cdFR5cGVEZWZpbml0aW9uXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBGaWx0ZXJGdW5jdGlvbnMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NhcGFiaWxpdGllc1wiO1xuaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NhcGFiaWxpdGllc19FZG1cIjtcbmltcG9ydCB0eXBlIHsgU2VtYW50aWNLZXkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHsgQ29tbW9uQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB0eXBlIHsgRW50aXR5U2V0QW5ub3RhdGlvbnNfQ29tbW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25fRWRtXCI7XG5pbXBvcnQgdHlwZSB7IEVudGl0eVNldEFubm90YXRpb25zX1Nlc3Npb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1Nlc3Npb25fRWRtXCI7XG5pbXBvcnQge1xuXHRDcml0aWNhbGl0eVR5cGUsXG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQWN0aW9uLFxuXHREYXRhRmllbGRGb3JBY3Rpb25UeXBlcyxcblx0RGF0YUZpZWxkRm9yQW5ub3RhdGlvbixcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHREYXRhRmllbGRUeXBlcyxcblx0RGF0YVBvaW50LFxuXHREYXRhUG9pbnRUeXBlVHlwZXMsXG5cdEZpZWxkR3JvdXBUeXBlLFxuXHRMaW5lSXRlbSxcblx0UHJlc2VudGF0aW9uVmFyaWFudFR5cGUsXG5cdFNlbGVjdGlvblZhcmlhbnRUeXBlLFxuXHRTZWxlY3RPcHRpb25UeXBlLFxuXHRVSUFubm90YXRpb25UZXJtcyxcblx0VUlBbm5vdGF0aW9uVHlwZXNcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHtcblx0Y29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzLFxuXHRjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXNSZWN1cnNpdmVseSxcblx0Q29tcGxleFByb3BlcnR5SW5mbyxcblx0Z2V0RGF0YUZpZWxkRGF0YVR5cGUsXG5cdGdldFNlbWFudGljT2JqZWN0UGF0aCxcblx0Z2V0VGFyZ2V0VmFsdWVPbkRhdGFQb2ludCxcblx0aXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdCxcblx0aXNEYXRhRmllbGRUeXBlcyxcblx0aXNEYXRhUG9pbnRGcm9tRGF0YUZpZWxkRGVmYXVsdFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9hbm5vdGF0aW9ucy9EYXRhRmllbGRcIjtcbmltcG9ydCB7XG5cdEJhc2VBY3Rpb24sXG5cdENvbWJpbmVkQWN0aW9uLFxuXHRDdXN0b21BY3Rpb24sXG5cdGRhdGFGaWVsZElzQ29weUFjdGlvbixcblx0Z2V0QWN0aW9uc0Zyb21NYW5pZmVzdCxcblx0Z2V0Q29weUFjdGlvbixcblx0aXNBY3Rpb25OYXZpZ2FibGUsXG5cdE92ZXJyaWRlVHlwZUFjdGlvbixcblx0cmVtb3ZlRHVwbGljYXRlQWN0aW9uc1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBFbnRpdHksIFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZU9iamVjdCwgQ3VzdG9tRWxlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBpbnNlcnRDdXN0b21FbGVtZW50cywgT3ZlcnJpZGVUeXBlLCBQbGFjZW1lbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgSXNzdWVDYXRlZ29yeSwgSXNzdWVDYXRlZ29yeVR5cGUsIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHRhYmxlRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclR5cGVzXCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0RURNX1RZUEVfTUFQUElORyxcblx0ZXF1YWwsXG5cdGZvcm1hdFJlc3VsdCxcblx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLFxuXHRpZkVsc2UsXG5cdGlzQ29uc3RhbnQsXG5cdG5vdCxcblx0b3IsXG5cdHBhdGhJbk1vZGVsLFxuXHRyZXNvbHZlQmluZGluZ1N0cmluZ1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSwgcmVwbGFjZVNwZWNpYWxDaGFycyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQge1xuXHRlbmhhbmNlRGF0YU1vZGVsUGF0aCxcblx0Z2V0VGFyZ2V0T2JqZWN0UGF0aCxcblx0aXNQYXRoRGVsZXRhYmxlLFxuXHRpc1BhdGhTZWFyY2hhYmxlLFxuXHRpc1BhdGhVcGRhdGFibGVcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUsIHR5cGUgRGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EaXNwbGF5TW9kZUZvcm1hdHRlclwiO1xuaW1wb3J0IHsgZ2V0Tm9uU29ydGFibGVQcm9wZXJ0aWVzUmVzdHJpY3Rpb25zIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRW50aXR5U2V0SGVscGVyXCI7XG5pbXBvcnQge1xuXHRnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHksXG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHksXG5cdGlzTmF2aWdhdGlvblByb3BlcnR5LFxuXHRpc1BhdGhFeHByZXNzaW9uLFxuXHRpc1Byb3BlcnR5XG59IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgeyBpc011bHRpVmFsdWVGaWVsZCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHsgRGVmYXVsdFR5cGVGb3JFZG1UeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvRURNXCI7XG5pbXBvcnQgQWN0aW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL2hlbHBlcnMvQWN0aW9uSGVscGVyXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgQWdncmVnYXRpb25IZWxwZXIgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9BZ2dyZWdhdGlvblwiO1xuaW1wb3J0IHsgaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4gfSBmcm9tIFwiLi4vLi4vaGVscGVycy9EYXRhRmllbGRIZWxwZXJcIjtcbmltcG9ydCB7IGdldFRhYmxlSUQgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9JRFwiO1xuaW1wb3J0IHR5cGUge1xuXHRDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4sXG5cdEN1c3RvbURlZmluZWRUYWJsZUNvbHVtbkZvck92ZXJyaWRlLFxuXHRGb3JtYXRPcHRpb25zVHlwZSxcblx0TmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0TmF2aWdhdGlvblRhcmdldENvbmZpZ3VyYXRpb24sXG5cdFRhYmxlQ29sdW1uU2V0dGluZ3MsXG5cdFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRWaWV3UGF0aENvbmZpZ3VyYXRpb25cbn0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7XG5cdEFjdGlvblR5cGUsXG5cdEF2YWlsYWJpbGl0eVR5cGUsXG5cdENyZWF0aW9uTW9kZSxcblx0SG9yaXpvbnRhbEFsaWduLFxuXHRJbXBvcnRhbmNlLFxuXHRTZWxlY3Rpb25Nb2RlLFxuXHRUZW1wbGF0ZVR5cGUsXG5cdFZhcmlhbnRNYW5hZ2VtZW50VHlwZSxcblx0VmlzdWFsaXphdGlvblR5cGVcbn0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB0eXBlIE1hbmlmZXN0V3JhcHBlciBmcm9tIFwiLi4vLi4vTWFuaWZlc3RXcmFwcGVyXCI7XG5pbXBvcnQgeyBnZXRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVR5cGUgfSBmcm9tIFwiLi9Dcml0aWNhbGl0eVwiO1xuaW1wb3J0IHR5cGUgeyBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUgfSBmcm9tIFwiLi90YWJsZS9TdGFuZGFyZEFjdGlvbnNcIjtcbmltcG9ydCB7XG5cdGdlbmVyYXRlU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Z2V0Q3JlYXRlVmlzaWJpbGl0eSxcblx0Z2V0Q3JlYXRpb25Sb3csXG5cdGdldERlbGV0ZVZpc2liaWxpdHksXG5cdGdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nLFxuXHRnZXRNYXNzRWRpdFZpc2liaWxpdHksXG5cdGdldFJlc3RyaWN0aW9ucyxcblx0Z2V0U3RhbmRhcmRBY3Rpb25DcmVhdGUsXG5cdGdldFN0YW5kYXJkQWN0aW9uRGVsZXRlLFxuXHRnZXRTdGFuZGFyZEFjdGlvbk1hc3NFZGl0LFxuXHRnZXRTdGFuZGFyZEFjdGlvblBhc3RlLFxuXHRpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQsXG5cdGlzSW5EaXNwbGF5TW9kZVxufSBmcm9tIFwiLi90YWJsZS9TdGFuZGFyZEFjdGlvbnNcIjtcblxuZXhwb3J0IHR5cGUgVGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbiA9IHtcblx0YXV0b0JpbmRPbkluaXQ6IGJvb2xlYW47XG5cdGNvbGxlY3Rpb246IHN0cmluZztcblx0dmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50VHlwZTtcblx0ZmlsdGVySWQ/OiBzdHJpbmc7XG5cdGlkOiBzdHJpbmc7XG5cdG5hdmlnYXRpb25QYXRoOiBzdHJpbmc7XG5cdHAxM25Nb2RlPzogc3RyaW5nO1xuXHRyb3c/OiB7XG5cdFx0YWN0aW9uPzogc3RyaW5nO1xuXHRcdHByZXNzPzogc3RyaW5nO1xuXHRcdHJvd0hpZ2hsaWdodGluZzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdFx0cm93TmF2aWdhdGVkOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0XHR2aXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdH07XG5cdHNlbGVjdGlvbk1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c3RhbmRhcmRBY3Rpb25zOiB7XG5cdFx0YWN0aW9uczogUmVjb3JkPHN0cmluZywgU3RhbmRhcmRBY3Rpb25Db25maWdUeXBlPjtcblx0XHRpc0luc2VydFVwZGF0ZVRlbXBsYXRlZDogYm9vbGVhbjtcblx0XHR1cGRhdGFibGVQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0fTtcblx0ZGlzcGxheU1vZGU/OiBib29sZWFuO1xuXHR0aHJlc2hvbGQ6IG51bWJlcjtcblx0ZW50aXR5TmFtZTogc3RyaW5nO1xuXHRzb3J0Q29uZGl0aW9ucz86IHN0cmluZztcblx0Z3JvdXBDb25kaXRpb25zPzogc3RyaW5nO1xuXHRhZ2dyZWdhdGVDb25kaXRpb25zPzogc3RyaW5nO1xuXHRpbml0aWFsRXhwYW5zaW9uTGV2ZWw/OiBudW1iZXI7XG5cblx0LyoqIENyZWF0ZSBuZXcgZW50cmllcyAqL1xuXHRjcmVhdGU6IENyZWF0ZUJlaGF2aW9yIHwgQ3JlYXRlQmVoYXZpb3JFeHRlcm5hbDtcblx0dGl0bGU6IHN0cmluZztcblx0c2VhcmNoYWJsZTogYm9vbGVhbjtcblxuXHRpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogTmV3IGVudHJpZXMgYXJlIGNyZWF0ZWQgd2l0aGluIHRoZSBhcHAgKGRlZmF1bHQgY2FzZSlcbiAqL1xudHlwZSBDcmVhdGVCZWhhdmlvciA9IHtcblx0bW9kZTogQ3JlYXRpb25Nb2RlO1xuXHRhcHBlbmQ6IGJvb2xlYW47XG5cdG5ld0FjdGlvbj86IHN0cmluZztcblx0bmF2aWdhdGVUb1RhcmdldD86IHN0cmluZztcbn07XG5cbi8qKlxuICogTmV3IGVudHJpZXMgYXJlIGNyZWF0ZWQgYnkgbmF2aWdhdGluZyB0byBzb21lIHRhcmdldFxuICovXG50eXBlIENyZWF0ZUJlaGF2aW9yRXh0ZXJuYWwgPSB7XG5cdG1vZGU6IFwiRXh0ZXJuYWxcIjtcblx0b3V0Ym91bmQ6IHN0cmluZztcblx0b3V0Ym91bmREZXRhaWw6IE5hdmlnYXRpb25UYXJnZXRDb25maWd1cmF0aW9uW1wib3V0Ym91bmREZXRhaWxcIl07XG5cdG5hdmlnYXRpb25TZXR0aW5nczogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbjtcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlQ2FwYWJpbGl0eVJlc3RyaWN0aW9uID0ge1xuXHRpc0RlbGV0YWJsZTogYm9vbGVhbjtcblx0aXNVcGRhdGFibGU6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBUYWJsZUZpbHRlcnNDb25maWd1cmF0aW9uID0ge1xuXHRlbmFibGVkPzogc3RyaW5nIHwgYm9vbGVhbjtcblx0cGF0aHM6IFtcblx0XHR7XG5cdFx0XHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHRcdH1cblx0XTtcblx0c2hvd0NvdW50cz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbiA9IHtcblx0cHJvcGVydHlOYW1lczogc3RyaW5nW107XG5cdHRleHQ/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uID0ge1xuXHRjcmVhdGVBdEVuZDogYm9vbGVhbjtcblx0Y3JlYXRpb25Nb2RlOiBDcmVhdGlvbk1vZGU7XG5cdGRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGE6IGJvb2xlYW47XG5cdGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHR1c2VDb25kZW5zZWRUYWJsZUxheW91dDogYm9vbGVhbjtcblx0ZW5hYmxlRXhwb3J0OiBib29sZWFuO1xuXHRoZWFkZXJWaXNpYmxlOiBib29sZWFuO1xuXHRmaWx0ZXJzPzogUmVjb3JkPHN0cmluZywgVGFibGVGaWx0ZXJzQ29uZmlndXJhdGlvbj47XG5cdHR5cGU6IFRhYmxlVHlwZTtcblx0cm93Q291bnRNb2RlOiBHcmlkVGFibGVSb3dDb3VudE1vZGU7XG5cdHJvd0NvdW50OiBudW1iZXI7XG5cdHNlbGVjdEFsbD86IGJvb2xlYW47XG5cdHNlbGVjdGlvbkxpbWl0OiBudW1iZXI7XG5cdG11bHRpU2VsZWN0TW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRlbmFibGVQYXN0ZTogYm9vbGVhbjtcblx0ZW5hYmxlRnVsbFNjcmVlbjogYm9vbGVhbjtcblx0c2hvd1Jvd0NvdW50OiBib29sZWFuO1xuXHRpbmxpbmVDcmVhdGlvblJvd0NvdW50PzogbnVtYmVyO1xuXHRpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlPzogYm9vbGVhbjtcblx0ZW5hYmxlTWFzc0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdGVuYWJsZUF1dG9Db2x1bW5XaWR0aDogYm9vbGVhbjtcblx0ZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGlzQ29tcGFjdFR5cGU/OiBib29sZWFuO1xuXHRoaWVyYXJjaHlRdWFsaWZpZXI/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUYWJsZVR5cGUgPSBcIkdyaWRUYWJsZVwiIHwgXCJSZXNwb25zaXZlVGFibGVcIiB8IFwiQW5hbHl0aWNhbFRhYmxlXCIgfCBcIlRyZWVUYWJsZVwiO1xuZXhwb3J0IHR5cGUgR3JpZFRhYmxlUm93Q291bnRNb2RlID0gXCJBdXRvXCIgfCBcIkZpeGVkXCI7XG5cbmVudW0gQ29sdW1uVHlwZSB7XG5cdERlZmF1bHQgPSBcIkRlZmF1bHRcIiwgLy8gRGVmYXVsdCBUeXBlIChDdXN0b20gQ29sdW1uKVxuXHRBbm5vdGF0aW9uID0gXCJBbm5vdGF0aW9uXCIsXG5cdFNsb3QgPSBcIlNsb3RcIlxufVxuXG4vLyBDdXN0b20gQ29sdW1uIGZyb20gTWFuaWZlc3RcbmV4cG9ydCB0eXBlIE1hbmlmZXN0RGVmaW5lZEN1c3RvbUNvbHVtbiA9IEN1c3RvbURlZmluZWRUYWJsZUNvbHVtbiAmIHtcblx0dHlwZT86IENvbHVtblR5cGUuRGVmYXVsdDtcbn07XG5cbi8vIFNsb3QgQ29sdW1uIGZyb20gQnVpbGRpbmcgQmxvY2tcbmV4cG9ydCB0eXBlIEZyYWdtZW50RGVmaW5lZFNsb3RDb2x1bW4gPSBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4gJiB7XG5cdHR5cGU6IENvbHVtblR5cGUuU2xvdDtcbn07XG5cbi8vIFByb3BlcnRpZXMgYWxsIENvbHVtblR5cGVzIGhhdmU6XG5leHBvcnQgdHlwZSBCYXNlVGFibGVDb2x1bW4gPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdHR5cGU6IENvbHVtblR5cGU7IC8vT3JpZ2luIG9mIHRoZSBzb3VyY2Ugd2hlcmUgd2UgYXJlIGdldHRpbmcgdGhlIHRlbXBsYXRlZCBpbmZvcm1hdGlvbiBmcm9tXG5cdHdpZHRoPzogc3RyaW5nO1xuXHRpbXBvcnRhbmNlPzogSW1wb3J0YW5jZTtcblx0aG9yaXpvbnRhbEFsaWduPzogSG9yaXpvbnRhbEFsaWduO1xuXHRhdmFpbGFiaWxpdHk/OiBBdmFpbGFiaWxpdHlUeXBlO1xuXHRpc05hdmlnYWJsZT86IGJvb2xlYW47XG5cdGNhc2VTZW5zaXRpdmU6IGJvb2xlYW47XG59O1xuXG4vLyBQcm9wZXJ0aWVzIG9uIEN1c3RvbSBDb2x1bW5zIGFuZCBTbG90IENvbHVtbnNcbmV4cG9ydCB0eXBlIEN1c3RvbUJhc2VkVGFibGVDb2x1bW4gPSBCYXNlVGFibGVDb2x1bW4gJiB7XG5cdGlkOiBzdHJpbmc7XG5cdG5hbWU6IHN0cmluZztcblx0aGVhZGVyPzogc3RyaW5nO1xuXHR0ZW1wbGF0ZTogc3RyaW5nO1xuXHRwcm9wZXJ0eUluZm9zPzogc3RyaW5nW107XG5cdGV4cG9ydFNldHRpbmdzPzoge1xuXHRcdHRlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0d3JhcDogYm9vbGVhbjtcblx0fSB8IG51bGw7XG5cdGZvcm1hdE9wdGlvbnM6IHsgdGV4dExpbmVzRWRpdDogbnVtYmVyIH07XG5cdGlzR3JvdXBhYmxlOiBib29sZWFuO1xuXHRpc05hdmlnYWJsZTogYm9vbGVhbjtcblx0c29ydGFibGU6IGJvb2xlYW47XG5cdHZpc3VhbFNldHRpbmdzOiB7IHdpZHRoQ2FsY3VsYXRpb246IG51bGwgfTtcblx0cHJvcGVydGllcz86IHN0cmluZ1tdOyAvL1dlIG5lZWQgdGhlIHByb3BlcnRpZXMgcmVsYXRpdmVQYXRoIHRvIGJlIGFkZGVkIHRvIHRoZSAkU2VsZWN0IHJlcXVlc3QgZm9yIGV4cG9ydGluZ1xufTtcblxuLy8gUHJvcGVydGllcyBkZXJpdmVkIGZyb20gTWFuaWZlc3QgdG8gb3ZlcnJpZGUgQW5ub3RhdGlvbiBjb25maWd1cmF0aW9uc1xuZXhwb3J0IHR5cGUgQW5ub3RhdGlvblRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUgPSBCYXNlVGFibGVDb2x1bW4gJiB7XG5cdHNldHRpbmdzPzogVGFibGVDb2x1bW5TZXR0aW5ncztcblx0Zm9ybWF0T3B0aW9ucz86IEZvcm1hdE9wdGlvbnNUeXBlO1xufTtcblxuZXhwb3J0IHR5cGUgY29uZmlnVHlwZUNvbnN0cmFpbnRzID0gUGFydGlhbDx7XG5cdHNjYWxlOiBudW1iZXI7XG5cdHByZWNpc2lvbjogbnVtYmVyO1xuXHRtYXhMZW5ndGg6IG51bWJlcjtcblx0bnVsbGFibGU6IGJvb2xlYW47XG5cdG1pbmltdW06IHN0cmluZztcblx0bWF4aW11bTogc3RyaW5nO1xuXHRpc0RpZ2l0U2VxdWVuY2U6IGJvb2xlYW47XG59PjtcblxuZXhwb3J0IHR5cGUgY29uZmlnVHlwZWZvcm1hdE9wdGlvbnMgPSBQYXJ0aWFsPHtcblx0cGFyc2VBc1N0cmluZzogYm9vbGVhbjtcblx0ZW1wdHlTdHJpbmc6IHN0cmluZztcblx0cGFyc2VLZWVwc0VtcHR5U3RyaW5nOiBib29sZWFuO1xufT47XG5cbmV4cG9ydCB0eXBlIGNvbmZpZ1R5cGUgPSB7XG5cdHR5cGU/OiBzdHJpbmc7XG5cdGNvbnN0cmFpbnRzOiBjb25maWdUeXBlQ29uc3RyYWludHM7XG5cdGZvcm1hdE9wdGlvbnM6IGNvbmZpZ1R5cGVmb3JtYXRPcHRpb25zO1xuXHR0eXBlSW5zdGFuY2U/OiBJbnN0YW5jZVR5cGU8YW55Pjtcblx0YmFzZVR5cGU/OiBzdHJpbmc7XG5cdGNsYXNzTmFtZT86IGtleW9mIHR5cGVvZiBEZWZhdWx0VHlwZUZvckVkbVR5cGU7XG59O1xuXG5leHBvcnQgdHlwZSBleHBvcnRTZXR0aW5ncyA9IFBhcnRpYWw8e1xuXHR0ZW1wbGF0ZTogc3RyaW5nO1xuXHRsYWJlbDogc3RyaW5nO1xuXHR3cmFwOiBib29sZWFuO1xuXHR0eXBlOiBzdHJpbmc7XG5cdGlucHV0Rm9ybWF0OiBzdHJpbmc7XG5cdGZvcm1hdDogc3RyaW5nO1xuXHRzY2FsZTogbnVtYmVyO1xuXHRkZWxpbWl0ZXI6IGJvb2xlYW47XG5cdHVuaXQ6IHN0cmluZztcblx0dW5pdFByb3BlcnR5OiBzdHJpbmc7XG5cdHRpbWV6b25lOiBzdHJpbmc7XG5cdHRpbWV6b25lUHJvcGVydHk6IHN0cmluZztcblx0dXRjOiBib29sZWFuO1xufT47XG5cbi8vIFByb3BlcnRpZXMgZm9yIEFubm90YXRpb24gQ29sdW1uc1xuZXhwb3J0IHR5cGUgQW5ub3RhdGlvblRhYmxlQ29sdW1uID0gQW5ub3RhdGlvblRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUgJiB7XG5cdG5hbWU6IHN0cmluZztcblx0cHJvcGVydHlJbmZvcz86IHN0cmluZ1tdO1xuXHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHRyZWxhdGl2ZVBhdGg6IHN0cmluZztcblx0bGFiZWw/OiBzdHJpbmc7XG5cdHRvb2x0aXA/OiBzdHJpbmc7XG5cdGdyb3VwTGFiZWw/OiBzdHJpbmc7XG5cdGdyb3VwPzogc3RyaW5nO1xuXHRGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0c2hvd0RhdGFGaWVsZHNMYWJlbD86IGJvb2xlYW47XG5cdGlzS2V5PzogYm9vbGVhbjtcblx0aXNHcm91cGFibGU/OiBib29sZWFuO1xuXHR1bml0Pzogc3RyaW5nO1xuXHR1bml0VGV4dD86IHN0cmluZztcblx0dGltZXpvbmVUZXh0Pzogc3RyaW5nO1xuXHR0aW1lem9uZT86IHN0cmluZztcblx0c2VtYW50aWNPYmplY3RQYXRoPzogc3RyaW5nO1xuXHRzb3J0YWJsZTogYm9vbGVhbjtcblx0ZXhwb3J0U2V0dGluZ3M/OiBleHBvcnRTZXR0aW5ncyB8IG51bGw7XG5cdHRleHRBcnJhbmdlbWVudD86IHtcblx0XHR0ZXh0UHJvcGVydHk6IHN0cmluZztcblx0XHRtb2RlOiBEaXNwbGF5TW9kZTtcblx0fTtcblx0YWRkaXRpb25hbFByb3BlcnR5SW5mb3M/OiBzdHJpbmdbXTtcblx0dmlzdWFsU2V0dGluZ3M/OiBWaXN1YWxTZXR0aW5ncztcblx0dHlwZUNvbmZpZz86IGNvbmZpZ1R5cGU7XG5cdGlzUGFydE9mTGluZUl0ZW0/OiBib29sZWFuOyAvLyB0ZW1wb3JhcnkgaW5kaWNhdG9yIHRvIG9ubHkgYWxsb3cgZmlsdGVyaW5nIG9uIG5hdmlnYXRpb24gcHJvcGVydGllcyB3aGVuIHRoZXkncmUgcGFydCBvZiBhIGxpbmUgaXRlbVxuXHRhZGRpdGlvbmFsTGFiZWxzPzogc3RyaW5nW107XG5cdGV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlPzogc3RyaW5nO1xuXHRhZ2dyZWdhdGFibGU/OiBib29sZWFuO1xuXHRleHRlbnNpb24/OiBFeHRlbnNpb25Gb3JBbmFseXRpY3M7XG59O1xuXG5leHBvcnQgdHlwZSBFeHRlbnNpb25Gb3JBbmFseXRpY3MgPSB7XG5cdGN1c3RvbUFnZ3JlZ2F0ZT86IHtcblx0XHRjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdH07XG59O1xuXG5leHBvcnQgdHlwZSBUZWNobmljYWxDb2x1bW4gPSBBbm5vdGF0aW9uVGFibGVDb2x1bW4gJiB7XG5cdGV4dGVuc2lvbj86IHtcblx0XHR0ZWNobmljYWxseUdyb3VwYWJsZTogYm9vbGVhbjtcblx0XHR0ZWNobmljYWxseUFnZ3JlZ2F0YWJsZTogYm9vbGVhbjtcblx0fTtcbn07XG5cbmV4cG9ydCB0eXBlIFZpc3VhbFNldHRpbmdzID0ge1xuXHR3aWR0aENhbGN1bGF0aW9uPzogV2lkdGhDYWxjdWxhdGlvbjtcbn07XG5cbmV4cG9ydCB0eXBlIFdpZHRoQ2FsY3VsYXRpb24gPSBudWxsIHwge1xuXHRtaW5XaWR0aD86IG51bWJlcjtcblx0bWF4V2lkdGg/OiBudW1iZXI7XG5cdGRlZmF1bHRXaWR0aD86IG51bWJlcjtcblx0aW5jbHVkZUxhYmVsPzogYm9vbGVhbjtcblx0Z2FwPzogbnVtYmVyO1xuXHQvLyBvbmx5IHJlbGV2YW50IGZvciBjb21wbGV4IHR5cGVzXG5cdGV4Y2x1ZGVQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdHZlcnRpY2FsQXJyYW5nZW1lbnQ/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVDb2x1bW4gPSBDdXN0b21CYXNlZFRhYmxlQ29sdW1uIHwgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuZXhwb3J0IHR5cGUgTWFuaWZlc3RDb2x1bW4gPSBDdXN0b21FbGVtZW50PEN1c3RvbUJhc2VkVGFibGVDb2x1bW4gfCBBbm5vdGF0aW9uVGFibGVDb2x1bW5Gb3JPdmVycmlkZT47XG5cbmV4cG9ydCB0eXBlIEFnZ3JlZ2F0ZURhdGEgPSB7XG5cdGRlZmF1bHRBZ2dyZWdhdGU6IHtcblx0XHRjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdH07XG5cdHJlbGF0aXZlUGF0aDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVWaXN1YWxpemF0aW9uID0ge1xuXHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZTtcblx0YW5ub3RhdGlvbjogVGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbjtcblx0Y29udHJvbDogVGFibGVDb250cm9sQ29uZmlndXJhdGlvbjtcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXTtcblx0YWN0aW9uczogQmFzZUFjdGlvbltdO1xuXHRjb21tYW5kQWN0aW9ucz86IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG5cdGFnZ3JlZ2F0ZXM/OiBSZWNvcmQ8c3RyaW5nLCBBZ2dyZWdhdGVEYXRhPjtcblx0ZW5hYmxlQW5hbHl0aWNzPzogYm9vbGVhbjtcblx0ZW5hYmxlQW5hbHl0aWNzU2VhcmNoPzogYm9vbGVhbjtcblx0b3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmc7XG5cdG9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXM6IHN0cmluZztcblx0aGVhZGVySW5mb1RpdGxlOiBzdHJpbmc7XG5cdHNlbWFudGljS2V5czogc3RyaW5nW107XG5cdGhlYWRlckluZm9UeXBlTmFtZTogUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8U3RyaW5nPiB8IHVuZGVmaW5lZDtcblx0ZW5hYmxlJHNlbGVjdDogYm9vbGVhbjtcblx0ZW5hYmxlJCRnZXRLZWVwQWxpdmVDb250ZXh0OiBib29sZWFuO1xufTtcblxudHlwZSBTb3J0ZXJUeXBlID0ge1xuXHRuYW1lOiBzdHJpbmc7XG5cdGRlc2NlbmRpbmc6IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIGFubm90YXRpb24tYmFzZWQgYW5kIG1hbmlmZXN0LWJhc2VkIHRhYmxlIGFjdGlvbnMuXG4gKlxuICogQHBhcmFtIGxpbmVJdGVtQW5ub3RhdGlvblxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIG5hdmlnYXRpb25TZXR0aW5nc1xuICogQHJldHVybnMgVGhlIGNvbXBsZXRlIHRhYmxlIGFjdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYmxlQWN0aW9ucyhcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0bmF2aWdhdGlvblNldHRpbmdzPzogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvblxuKTogQ29tYmluZWRBY3Rpb24ge1xuXHRjb25zdCBhVGFibGVBY3Rpb25zID0gZ2V0VGFibGVBbm5vdGF0aW9uQWN0aW9ucyhsaW5lSXRlbUFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgYUFubm90YXRpb25BY3Rpb25zID0gYVRhYmxlQWN0aW9ucy50YWJsZUFjdGlvbnM7XG5cdGNvbnN0IGFIaWRkZW5BY3Rpb25zID0gYVRhYmxlQWN0aW9ucy5oaWRkZW5UYWJsZUFjdGlvbnM7XG5cdGNvbnN0IG1hbmlmZXN0QWN0aW9ucyA9IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKS5hY3Rpb25zLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0YUFubm90YXRpb25BY3Rpb25zLFxuXHRcdG5hdmlnYXRpb25TZXR0aW5ncyxcblx0XHR0cnVlLFxuXHRcdGFIaWRkZW5BY3Rpb25zXG5cdCk7XG5cdGNvbnN0IGFjdGlvbk92ZXJ3cml0ZUNvbmZpZzogT3ZlcnJpZGVUeXBlQWN0aW9uID0ge1xuXHRcdGlzTmF2aWdhYmxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGVuYWJsZU9uU2VsZWN0OiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGVuYWJsZUF1dG9TY3JvbGw6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZW5hYmxlZDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHR2aXNpYmxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbjogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRjb21tYW5kOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlXG5cdH07XG5cdGNvbnN0IGFjdGlvbnMgPSBpbnNlcnRDdXN0b21FbGVtZW50cyhhQW5ub3RhdGlvbkFjdGlvbnMsIG1hbmlmZXN0QWN0aW9ucy5hY3Rpb25zLCBhY3Rpb25PdmVyd3JpdGVDb25maWcpO1xuXG5cdHJldHVybiB7XG5cdFx0YWN0aW9ucyxcblx0XHRjb21tYW5kQWN0aW9uczogbWFuaWZlc3RBY3Rpb25zLmNvbW1hbmRBY3Rpb25zXG5cdH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgY29sdW1ucywgYW5ub3RhdGlvbi1iYXNlZCBhcyB3ZWxsIGFzIG1hbmlmZXN0IGJhc2VkLlxuICogVGhleSBhcmUgc29ydGVkIGFuZCBzb21lIHByb3BlcnRpZXMgY2FuIGJlIG92ZXJ3cml0dGVuIHZpYSB0aGUgbWFuaWZlc3QgKGNoZWNrIG91dCB0aGUga2V5cyB0aGF0IGNhbiBiZSBvdmVyd3JpdHRlbikuXG4gKlxuICogQHBhcmFtIGxpbmVJdGVtQW5ub3RhdGlvbiBDb2xsZWN0aW9uIG9mIGRhdGEgZmllbGRzIGZvciByZXByZXNlbnRhdGlvbiBpbiBhIHRhYmxlIG9yIGxpc3RcbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBuYXZpZ2F0aW9uU2V0dGluZ3NcbiAqIEByZXR1cm5zIFJldHVybnMgYWxsIHRhYmxlIGNvbHVtbnMgdGhhdCBzaG91bGQgYmUgYXZhaWxhYmxlLCByZWdhcmRsZXNzIG9mIHRlbXBsYXRpbmcgb3IgcGVyc29uYWxpemF0aW9uIG9yIHRoZWlyIG9yaWdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVDb2x1bW5zKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M/OiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uXG4pOiBUYWJsZUNvbHVtbltdIHtcblx0Y29uc3QgYW5ub3RhdGlvbkNvbHVtbnMgPSBnZXRDb2x1bW5zRnJvbUFubm90YXRpb25zKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBtYW5pZmVzdENvbHVtbnMgPSBnZXRDb2x1bW5zRnJvbU1hbmlmZXN0KFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCkuY29sdW1ucyxcblx0XHRhbm5vdGF0aW9uQ29sdW1ucyxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUobGluZUl0ZW1Bbm5vdGF0aW9uKSxcblx0XHRuYXZpZ2F0aW9uU2V0dGluZ3Ncblx0KTtcblxuXHRyZXR1cm4gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoYW5ub3RhdGlvbkNvbHVtbnMgYXMgVGFibGVDb2x1bW5bXSwgbWFuaWZlc3RDb2x1bW5zIGFzIFJlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnQ8VGFibGVDb2x1bW4+Piwge1xuXHRcdHdpZHRoOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGltcG9ydGFuY2U6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0aG9yaXpvbnRhbEFsaWduOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGF2YWlsYWJpbGl0eTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRpc05hdmlnYWJsZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRzZXR0aW5nczogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRmb3JtYXRPcHRpb25zOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlXG5cdH0pO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBjdXN0b20gYWdncmVnYXRpb24gZGVmaW5pdGlvbnMgZnJvbSB0aGUgZW50aXR5VHlwZS5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgdGFyZ2V0IGVudGl0eSB0eXBlLlxuICogQHBhcmFtIHRhYmxlQ29sdW1ucyBUaGUgYXJyYXkgb2YgY29sdW1ucyBmb3IgdGhlIGVudGl0eSB0eXBlLlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0LlxuICogQHJldHVybnMgVGhlIGFnZ3JlZ2F0ZSBkZWZpbml0aW9ucyBmcm9tIHRoZSBlbnRpdHlUeXBlLCBvciB1bmRlZmluZWQgaWYgdGhlIGVudGl0eSBkb2Vzbid0IHN1cHBvcnQgYW5hbHl0aWNhbCBxdWVyaWVzLlxuICovXG5leHBvcnQgY29uc3QgZ2V0QWdncmVnYXRlRGVmaW5pdGlvbnNGcm9tRW50aXR5VHlwZSA9IGZ1bmN0aW9uIChcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0dGFibGVDb2x1bW5zOiBUYWJsZUNvbHVtbltdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBSZWNvcmQ8c3RyaW5nLCBBZ2dyZWdhdGVEYXRhPiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdGZ1bmN0aW9uIGZpbmRDb2x1bW5Gcm9tUGF0aChwYXRoOiBzdHJpbmcpOiBUYWJsZUNvbHVtbiB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRhYmxlQ29sdW1ucy5maW5kKChjb2x1bW4pID0+IHtcblx0XHRcdGNvbnN0IGFubm90YXRpb25Db2x1bW4gPSBjb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdFx0cmV0dXJuIGFubm90YXRpb25Db2x1bW4ucHJvcGVydHlJbmZvcyA9PT0gdW5kZWZpbmVkICYmIGFubm90YXRpb25Db2x1bW4ucmVsYXRpdmVQYXRoID09PSBwYXRoO1xuXHRcdH0pO1xuXHR9XG5cblx0aWYgKCFhZ2dyZWdhdGlvbkhlbHBlci5pc0FuYWx5dGljc1N1cHBvcnRlZCgpKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8vIEtlZXAgYSBzZXQgb2YgYWxsIGN1cnJlbmN5L3VuaXQgcHJvcGVydGllcywgYXMgd2UgZG9uJ3Qgd2FudCB0byBjb25zaWRlciB0aGVtIGFzIGFnZ3JlZ2F0ZXNcblx0Ly8gVGhleSBhcmUgYWdncmVnYXRlcyBmb3IgdGVjaG5pY2FsIHJlYXNvbnMgKHRvIG1hbmFnZSBtdWx0aS11bml0cyBzaXR1YXRpb25zKSBidXQgaXQgZG9lc24ndCBtYWtlIHNlbnNlIGZyb20gYSB1c2VyIHN0YW5kcG9pbnRcblx0Y29uc3QgY3VycmVuY3lPclVuaXRQcm9wZXJ0aWVzID0gbmV3IFNldCgpO1xuXHR0YWJsZUNvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0Y29uc3QgdGFibGVDb2x1bW4gPSBjb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdGlmICh0YWJsZUNvbHVtbi51bml0KSB7XG5cdFx0XHRjdXJyZW5jeU9yVW5pdFByb3BlcnRpZXMuYWRkKHRhYmxlQ29sdW1uLnVuaXQpO1xuXHRcdH1cblx0fSk7XG5cblx0Y29uc3QgY3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucygpO1xuXHRjb25zdCBkZWZpbml0aW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XG5cblx0Y3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnMuZm9yRWFjaCgoYW5ub3RhdGlvbikgPT4ge1xuXHRcdGNvbnN0IGFnZ3JlZ2F0ZWRQcm9wZXJ0eSA9IGFnZ3JlZ2F0aW9uSGVscGVyLl9lbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmluZCgocHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiBwcm9wZXJ0eS5uYW1lID09PSBhbm5vdGF0aW9uLnF1YWxpZmllcjtcblx0XHR9KTtcblxuXHRcdGlmIChhZ2dyZWdhdGVkUHJvcGVydHkpIHtcblx0XHRcdGNvbnN0IGNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMgPSBhbm5vdGF0aW9uLmFubm90YXRpb25zPy5BZ2dyZWdhdGlvbj8uQ29udGV4dERlZmluaW5nUHJvcGVydGllcztcblx0XHRcdGRlZmluaXRpb25zW2FnZ3JlZ2F0ZWRQcm9wZXJ0eS5uYW1lXSA9IGNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXNcblx0XHRcdFx0PyBjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzLm1hcCgoY3R4RGVmUHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBjdHhEZWZQcm9wZXJ0eS52YWx1ZTtcblx0XHRcdFx0ICB9KVxuXHRcdFx0XHQ6IFtdO1xuXHRcdH1cblx0fSk7XG5cdGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgQWdncmVnYXRlRGF0YT4gPSB7fTtcblxuXHR0YWJsZUNvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0Y29uc3QgdGFibGVDb2x1bW4gPSBjb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdGlmICh0YWJsZUNvbHVtbi5wcm9wZXJ0eUluZm9zID09PSB1bmRlZmluZWQgJiYgdGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoKSB7XG5cdFx0XHRjb25zdCByYXdDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzID0gZGVmaW5pdGlvbnNbdGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoXTtcblxuXHRcdFx0Ly8gSWdub3JlIGFnZ3JlZ2F0ZXMgY29ycmVzcG9uZGluZyB0byBjdXJyZW5jaWVzIG9yIHVuaXRzIG9mIG1lYXN1cmVcblx0XHRcdGlmIChyYXdDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzICYmICFjdXJyZW5jeU9yVW5pdFByb3BlcnRpZXMuaGFzKHRhYmxlQ29sdW1uLm5hbWUpKSB7XG5cdFx0XHRcdHJlc3VsdFt0YWJsZUNvbHVtbi5uYW1lXSA9IHtcblx0XHRcdFx0XHRkZWZhdWx0QWdncmVnYXRlOiB7fSxcblx0XHRcdFx0XHRyZWxhdGl2ZVBhdGg6IHRhYmxlQ29sdW1uLnJlbGF0aXZlUGF0aFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRjb25zdCBjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRyYXdDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzLmZvckVhY2goKGNvbnRleHREZWZpbmluZ1Byb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGZvdW5kQ29sdW1uID0gZmluZENvbHVtbkZyb21QYXRoKGNvbnRleHREZWZpbmluZ1Byb3BlcnR5TmFtZSk7XG5cdFx0XHRcdFx0aWYgKGZvdW5kQ29sdW1uKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzLnB1c2goZm91bmRDb2x1bW4ubmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoY29udGV4dERlZmluaW5nUHJvcGVydGllcy5sZW5ndGgpIHtcblx0XHRcdFx0XHRyZXN1bHRbdGFibGVDb2x1bW4ubmFtZV0uZGVmYXVsdEFnZ3JlZ2F0ZS5jb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzID0gY29udGV4dERlZmluaW5nUHJvcGVydGllcztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogVXBkYXRlcyBhIHRhYmxlIHZpc3VhbGl6YXRpb24gZm9yIGFuYWx5dGljYWwgdXNlIGNhc2VzLlxuICpcbiAqIEBwYXJhbSB0YWJsZVZpc3VhbGl6YXRpb24gVGhlIHZpc3VhbGl6YXRpb24gdG8gYmUgdXBkYXRlZFxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGVudGl0eSB0eXBlIGRpc3BsYXllZCBpbiB0aGUgdGFibGVcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uIFRoZSBwcmVzZW50YXRpb25WYXJpYW50IGFubm90YXRpb24gKGlmIGFueSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVRhYmxlVmlzdWFsaXphdGlvbkZvclR5cGUoXG5cdHRhYmxlVmlzdWFsaXphdGlvbjogVGFibGVWaXN1YWxpemF0aW9uLFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj86IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlXG4pIHtcblx0aWYgKHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLnR5cGUgPT09IFwiQW5hbHl0aWNhbFRhYmxlXCIpIHtcblx0XHRjb25zdCBhZ2dyZWdhdGVzRGVmaW5pdGlvbnMgPSBnZXRBZ2dyZWdhdGVEZWZpbml0aW9uc0Zyb21FbnRpdHlUeXBlKGVudGl0eVR5cGUsIHRhYmxlVmlzdWFsaXphdGlvbi5jb2x1bW5zLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdFx0aWYgKGFnZ3JlZ2F0ZXNEZWZpbml0aW9ucykge1xuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmVuYWJsZUFuYWx5dGljcyA9IHRydWU7XG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uZW5hYmxlJHNlbGVjdCA9IGZhbHNlO1xuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmVuYWJsZSQkZ2V0S2VlcEFsaXZlQ29udGV4dCA9IGZhbHNlO1xuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmFnZ3JlZ2F0ZXMgPSBhZ2dyZWdhdGVzRGVmaW5pdGlvbnM7XG5cdFx0XHRfdXBkYXRlUHJvcGVydHlJbmZvc1dpdGhBZ2dyZWdhdGVzRGVmaW5pdGlvbnModGFibGVWaXN1YWxpemF0aW9uKTtcblxuXHRcdFx0Y29uc3QgYWxsb3dlZFRyYW5zZm9ybWF0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMoKTtcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5lbmFibGVBbmFseXRpY3NTZWFyY2ggPSBhbGxvd2VkVHJhbnNmb3JtYXRpb25zID8gYWxsb3dlZFRyYW5zZm9ybWF0aW9ucy5pbmRleE9mKFwic2VhcmNoXCIpID49IDAgOiB0cnVlO1xuXG5cdFx0XHQvLyBBZGQgZ3JvdXAgYW5kIHNvcnQgY29uZGl0aW9ucyBmcm9tIHRoZSBwcmVzZW50YXRpb24gdmFyaWFudFxuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmFubm90YXRpb24uZ3JvdXBDb25kaXRpb25zID0gZ2V0R3JvdXBDb25kaXRpb25zKFxuXHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbixcblx0XHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnMsXG5cdFx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLnR5cGVcblx0XHRcdCk7XG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uYW5ub3RhdGlvbi5hZ2dyZWdhdGVDb25kaXRpb25zID0gZ2V0QWdncmVnYXRlQ29uZGl0aW9ucyhcblx0XHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb2x1bW5zXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLnR5cGUgPSBcIkdyaWRUYWJsZVwiOyAvLyBBbmFseXRpY2FsVGFibGUgaXNuJ3QgYSByZWFsIHR5cGUgZm9yIHRoZSBNREM6VGFibGUsIHNvIHdlIGFsd2F5cyBzd2l0Y2ggYmFjayB0byBHcmlkXG5cdH0gZWxzZSBpZiAodGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wudHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIikge1xuXHRcdHRhYmxlVmlzdWFsaXphdGlvbi5hbm5vdGF0aW9uLmdyb3VwQ29uZGl0aW9ucyA9IGdldEdyb3VwQ29uZGl0aW9ucyhcblx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnMsXG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC50eXBlXG5cdFx0KTtcblx0fSBlbHNlIGlmICh0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC50eXBlID09PSBcIlRyZWVUYWJsZVwiKSB7XG5cdFx0dGFibGVWaXN1YWxpemF0aW9uLmVuYWJsZSQkZ2V0S2VlcEFsaXZlQ29udGV4dCA9IGZhbHNlO1xuXHR9XG59XG5cbi8qKlxuICogR2V0IHRoZSBuYXZpZ2F0aW9uIHRhcmdldCBwYXRoIGZyb20gbWFuaWZlc3Qgc2V0dGluZ3MuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gbmF2aWdhdGlvblByb3BlcnR5UGF0aCBUaGUgbmF2aWdhdGlvbiBwYXRoIHRvIGNoZWNrIGluIHRoZSBtYW5pZmVzdCBzZXR0aW5nc1xuICogQHJldHVybnMgTmF2aWdhdGlvbiBwYXRoIGZyb20gbWFuaWZlc3Qgc2V0dGluZ3NcbiAqL1xuZnVuY3Rpb24gZ2V0TmF2aWdhdGlvblRhcmdldFBhdGgoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGlmIChuYXZpZ2F0aW9uUHJvcGVydHlQYXRoICYmIG1hbmlmZXN0V3JhcHBlci5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKSkge1xuXHRcdGNvbnN0IG5hdkNvbmZpZyA9IG1hbmlmZXN0V3JhcHBlci5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0XHRpZiAoT2JqZWN0LmtleXMobmF2Q29uZmlnKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRyZXR1cm4gbmF2aWdhdGlvblByb3BlcnR5UGF0aDtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBkYXRhTW9kZWxQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdGNvbnN0IGNvbnRleHRQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpO1xuXHRjb25zdCBuYXZDb25maWdGb3JDb250ZXh0UGF0aCA9IG1hbmlmZXN0V3JhcHBlci5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihjb250ZXh0UGF0aCk7XG5cdGlmIChuYXZDb25maWdGb3JDb250ZXh0UGF0aCAmJiBPYmplY3Qua2V5cyhuYXZDb25maWdGb3JDb250ZXh0UGF0aCkubGVuZ3RoID4gMCkge1xuXHRcdHJldHVybiBjb250ZXh0UGF0aDtcblx0fVxuXG5cdHJldHVybiBkYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldCA/IGRhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0Lm5hbWUgOiBkYXRhTW9kZWxQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWU7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgJ3VuaXQnIGFuZCAndGV4dEFycmFuZ2VtZW50JyBwcm9wZXJ0aWVzIGluIGNvbHVtbnMgd2hlbiBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGVudGl0eSB0eXBlIGRpc3BsYXllZCBpbiB0aGUgdGFibGVcbiAqIEBwYXJhbSB0YWJsZUNvbHVtbnMgVGhlIGNvbHVtbnMgdG8gYmUgdXBkYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTGlua2VkUHJvcGVydGllcyhlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLCB0YWJsZUNvbHVtbnM6IFRhYmxlQ29sdW1uW10pIHtcblx0ZnVuY3Rpb24gZmluZENvbHVtbkJ5UGF0aChwYXRoOiBzdHJpbmcpOiBUYWJsZUNvbHVtbiB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRhYmxlQ29sdW1ucy5maW5kKChjb2x1bW4pID0+IHtcblx0XHRcdGNvbnN0IGFubm90YXRpb25Db2x1bW4gPSBjb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdFx0cmV0dXJuIGFubm90YXRpb25Db2x1bW4ucHJvcGVydHlJbmZvcyA9PT0gdW5kZWZpbmVkICYmIGFubm90YXRpb25Db2x1bW4ucmVsYXRpdmVQYXRoID09PSBwYXRoO1xuXHRcdH0pO1xuXHR9XG5cblx0dGFibGVDb2x1bW5zLmZvckVhY2goKG9Db2x1bW4pID0+IHtcblx0XHRjb25zdCBvVGFibGVDb2x1bW4gPSBvQ29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRpZiAob1RhYmxlQ29sdW1uLnByb3BlcnR5SW5mb3MgPT09IHVuZGVmaW5lZCAmJiBvVGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoKSB7XG5cdFx0XHRjb25zdCBvUHJvcGVydHkgPSBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmluZCgob1Byb3A6IFByb3BlcnR5KSA9PiBvUHJvcC5uYW1lID09PSBvVGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoKTtcblx0XHRcdGlmIChvUHJvcGVydHkpIHtcblx0XHRcdFx0Y29uc3Qgb1VuaXQgPSBnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eShvUHJvcGVydHkpIHx8IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkob1Byb3BlcnR5KTtcblx0XHRcdFx0Y29uc3Qgb1RpbWV6b25lID0gZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkob1Byb3BlcnR5KTtcblx0XHRcdFx0Y29uc3Qgc1RpbWV6b25lID0gb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZTtcblx0XHRcdFx0aWYgKG9Vbml0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1VuaXRDb2x1bW4gPSBmaW5kQ29sdW1uQnlQYXRoKG9Vbml0Lm5hbWUpO1xuXHRcdFx0XHRcdG9UYWJsZUNvbHVtbi51bml0ID0gb1VuaXRDb2x1bW4/Lm5hbWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1VuaXQgPSBvUHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgfHwgb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQ7XG5cdFx0XHRcdFx0aWYgKHNVbml0KSB7XG5cdFx0XHRcdFx0XHRvVGFibGVDb2x1bW4udW5pdFRleHQgPSBgJHtzVW5pdH1gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1RpbWV6b25lKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RpbWV6b25lQ29sdW1uID0gZmluZENvbHVtbkJ5UGF0aChvVGltZXpvbmUubmFtZSk7XG5cdFx0XHRcdFx0b1RhYmxlQ29sdW1uLnRpbWV6b25lID0gb1RpbWV6b25lQ29sdW1uPy5uYW1lO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHNUaW1lem9uZSkge1xuXHRcdFx0XHRcdG9UYWJsZUNvbHVtbi50aW1lem9uZVRleHQgPSBzVGltZXpvbmUudG9TdHJpbmcoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGRpc3BsYXlNb2RlID0gZ2V0RGlzcGxheU1vZGUob1Byb3BlcnR5KSxcblx0XHRcdFx0XHR0ZXh0QW5ub3RhdGlvbiA9IG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db21tb24/LlRleHQ7XG5cdFx0XHRcdGlmIChpc1BhdGhFeHByZXNzaW9uKHRleHRBbm5vdGF0aW9uKSAmJiBkaXNwbGF5TW9kZSAhPT0gXCJWYWx1ZVwiKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RleHRDb2x1bW4gPSBmaW5kQ29sdW1uQnlQYXRoKHRleHRBbm5vdGF0aW9uLnBhdGgpO1xuXHRcdFx0XHRcdGlmIChvVGV4dENvbHVtbiAmJiBvVGV4dENvbHVtbi5uYW1lICE9PSBvVGFibGVDb2x1bW4ubmFtZSkge1xuXHRcdFx0XHRcdFx0b1RhYmxlQ29sdW1uLnRleHRBcnJhbmdlbWVudCA9IHtcblx0XHRcdFx0XHRcdFx0dGV4dFByb3BlcnR5OiBvVGV4dENvbHVtbi5uYW1lLFxuXHRcdFx0XHRcdFx0XHRtb2RlOiBkaXNwbGF5TW9kZVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTZW1hbnRpY0tleXNBbmRUaXRsZUluZm8oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRjb25zdCBoZWFkZXJJbmZvVGl0bGVQYXRoID0gKGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUoKT8uYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJJbmZvPy5UaXRsZSBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlXG5cdFx0Py5wYXRoO1xuXHRjb25zdCBzZW1hbnRpY0tleUFubm90YXRpb25zOiBhbnlbXSB8IHVuZGVmaW5lZCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUoKT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNLZXk7XG5cdGNvbnN0IGhlYWRlckluZm9UeXBlTmFtZSA9IGNvbnZlcnRlckNvbnRleHQ/LmdldEFubm90YXRpb25FbnRpdHlUeXBlKCk/LmFubm90YXRpb25zPy5VST8uSGVhZGVySW5mbz8uVHlwZU5hbWU7XG5cdGNvbnN0IHNlbWFudGljS2V5Q29sdW1uczogc3RyaW5nW10gPSBbXTtcblx0aWYgKHNlbWFudGljS2V5QW5ub3RhdGlvbnMpIHtcblx0XHRzZW1hbnRpY0tleUFubm90YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0c2VtYW50aWNLZXlDb2x1bW5zLnB1c2gob0NvbHVtbi52YWx1ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4geyBoZWFkZXJJbmZvVGl0bGVQYXRoLCBzZW1hbnRpY0tleUNvbHVtbnMsIGhlYWRlckluZm9UeXBlTmFtZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGFibGVWaXN1YWxpemF0aW9uKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj86IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlLFxuXHRpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50PzogYm9vbGVhbixcblx0dmlld0NvbmZpZ3VyYXRpb24/OiBWaWV3UGF0aENvbmZpZ3VyYXRpb25cbik6IFRhYmxlVmlzdWFsaXphdGlvbiB7XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RDb25maWcgPSBnZXRUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbihcblx0XHRsaW5lSXRlbUFubm90YXRpb24sXG5cdFx0dmlzdWFsaXphdGlvblBhdGgsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50XG5cdCk7XG5cdGNvbnN0IHsgbmF2aWdhdGlvblByb3BlcnR5UGF0aCB9ID0gc3BsaXRQYXRoKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0Y29uc3QgbmF2aWdhdGlvblRhcmdldFBhdGggPSBnZXROYXZpZ2F0aW9uVGFyZ2V0UGF0aChjb252ZXJ0ZXJDb250ZXh0LCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0Y29uc3QgbmF2aWdhdGlvblNldHRpbmdzID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihuYXZpZ2F0aW9uVGFyZ2V0UGF0aCk7XG5cdGNvbnN0IGNvbHVtbnMgPSBnZXRUYWJsZUNvbHVtbnMobGluZUl0ZW1Bbm5vdGF0aW9uLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblNldHRpbmdzKTtcblx0Y29uc3Qgb3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKGxpbmVJdGVtQW5ub3RhdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZSA9IGdldFNlbWFudGljS2V5c0FuZFRpdGxlSW5mbyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgdGFibGVBY3Rpb25zID0gZ2V0VGFibGVBY3Rpb25zKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQsIG5hdmlnYXRpb25TZXR0aW5ncyk7XG5cblx0Y29uc3Qgb1Zpc3VhbGl6YXRpb246IFRhYmxlVmlzdWFsaXphdGlvbiA9IHtcblx0XHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZSxcblx0XHRhbm5vdGF0aW9uOiBnZXRUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uKFxuXHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLFxuXHRcdFx0dmlzdWFsaXphdGlvblBhdGgsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0dGFibGVNYW5pZmVzdENvbmZpZyxcblx0XHRcdGNvbHVtbnMsXG5cdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbixcblx0XHRcdHZpZXdDb25maWd1cmF0aW9uXG5cdFx0KSxcblx0XHRjb250cm9sOiB0YWJsZU1hbmlmZXN0Q29uZmlnLFxuXHRcdGFjdGlvbnM6IHJlbW92ZUR1cGxpY2F0ZUFjdGlvbnModGFibGVBY3Rpb25zLmFjdGlvbnMpLFxuXHRcdGNvbW1hbmRBY3Rpb25zOiB0YWJsZUFjdGlvbnMuY29tbWFuZEFjdGlvbnMsXG5cdFx0Y29sdW1uczogY29sdW1ucyxcblx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IEpTT04uc3RyaW5naWZ5KG9wZXJhdGlvbkF2YWlsYWJsZU1hcCksXG5cdFx0b3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllczogZ2V0T3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyhvcGVyYXRpb25BdmFpbGFibGVNYXAsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdGhlYWRlckluZm9UaXRsZTogc2VtYW50aWNLZXlzQW5kSGVhZGVySW5mb1RpdGxlLmhlYWRlckluZm9UaXRsZVBhdGgsXG5cdFx0c2VtYW50aWNLZXlzOiBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUuc2VtYW50aWNLZXlDb2x1bW5zLFxuXHRcdGhlYWRlckluZm9UeXBlTmFtZTogc2VtYW50aWNLZXlzQW5kSGVhZGVySW5mb1RpdGxlLmhlYWRlckluZm9UeXBlTmFtZSxcblx0XHRlbmFibGUkc2VsZWN0OiB0cnVlLFxuXHRcdGVuYWJsZSQkZ2V0S2VlcEFsaXZlQ29udGV4dDogdHJ1ZVxuXHR9O1xuXG5cdHVwZGF0ZUxpbmtlZFByb3BlcnRpZXMoY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZShsaW5lSXRlbUFubm90YXRpb24pLCBjb2x1bW5zKTtcblx0dXBkYXRlVGFibGVWaXN1YWxpemF0aW9uRm9yVHlwZShcblx0XHRvVmlzdWFsaXphdGlvbixcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKGxpbmVJdGVtQW5ub3RhdGlvbiksXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvblxuXHQpO1xuXG5cdHJldHVybiBvVmlzdWFsaXphdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRUYWJsZVZpc3VhbGl6YXRpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCwgaXNCbGFua1RhYmxlPzogYm9vbGVhbik6IFRhYmxlVmlzdWFsaXphdGlvbiB7XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RDb25maWcgPSBnZXRUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbih1bmRlZmluZWQsIFwiXCIsIGNvbnZlcnRlckNvbnRleHQsIGZhbHNlKTtcblx0Y29uc3QgY29sdW1ucyA9IGdldENvbHVtbnNGcm9tRW50aXR5VHlwZSh7fSwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksIFtdLCBbXSwgY29udmVydGVyQ29udGV4dCwgdGFibGVNYW5pZmVzdENvbmZpZy50eXBlLCBbXSk7XG5cdGNvbnN0IG9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IGdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcCh1bmRlZmluZWQsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUgPSBnZXRTZW1hbnRpY0tleXNBbmRUaXRsZUluZm8oY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG9WaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb24gPSB7XG5cdFx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuVGFibGUsXG5cdFx0YW5ub3RhdGlvbjogZ2V0VGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbih1bmRlZmluZWQsIFwiXCIsIGNvbnZlcnRlckNvbnRleHQsIHRhYmxlTWFuaWZlc3RDb25maWcsIGlzQmxhbmtUYWJsZSA/IFtdIDogY29sdW1ucyksXG5cdFx0Y29udHJvbDogdGFibGVNYW5pZmVzdENvbmZpZyxcblx0XHRhY3Rpb25zOiBbXSxcblx0XHRjb2x1bW5zOiBjb2x1bW5zLFxuXHRcdG9wZXJhdGlvbkF2YWlsYWJsZU1hcDogSlNPTi5zdHJpbmdpZnkob3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRvcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzOiBnZXRPcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzKG9wZXJhdGlvbkF2YWlsYWJsZU1hcCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0aGVhZGVySW5mb1RpdGxlOiBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUuaGVhZGVySW5mb1RpdGxlUGF0aCxcblx0XHRzZW1hbnRpY0tleXM6IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZS5zZW1hbnRpY0tleUNvbHVtbnMsXG5cdFx0aGVhZGVySW5mb1R5cGVOYW1lOiBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUuaGVhZGVySW5mb1R5cGVOYW1lLFxuXHRcdGVuYWJsZSRzZWxlY3Q6IHRydWUsXG5cdFx0ZW5hYmxlJCRnZXRLZWVwQWxpdmVDb250ZXh0OiB0cnVlXG5cdH07XG5cblx0dXBkYXRlTGlua2VkUHJvcGVydGllcyhjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgY29sdW1ucyk7XG5cdHVwZGF0ZVRhYmxlVmlzdWFsaXphdGlvbkZvclR5cGUob1Zpc3VhbGl6YXRpb24sIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRyZXR1cm4gb1Zpc3VhbGl6YXRpb247XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbWFwIG9mIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIHByb3BlcnR5IHBhdGhzIGZvciBhbGwgRGF0YUZpZWxkRm9yQWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIFRoZSBpbnN0YW5jZSBvZiB0aGUgbGluZSBpdGVtXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgcmVjb3JkIGNvbnRhaW5pbmcgYWxsIGFjdGlvbiBuYW1lcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBDb3JlLk9wZXJhdGlvbkF2YWlsYWJsZSBwcm9wZXJ0eSBwYXRoc1xuICovXG5mdW5jdGlvbiBnZXRPcGVyYXRpb25BdmFpbGFibGVNYXAobGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuXHRyZXR1cm4gQWN0aW9uSGVscGVyLmdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChsaW5lSXRlbUFubm90YXRpb24sIFwidGFibGVcIiwgY29udmVydGVyQ29udGV4dCk7XG59XG5cbi8qKlxuICogR2V0cyB1cGRhdGFibGUgcHJvcGVydHlQYXRoIGZvciB0aGUgY3VycmVudCBlbnRpdHlzZXQgaWYgdmFsaWQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIHVwZGF0YWJsZSBwcm9wZXJ0eSBmb3IgdGhlIHJvd3NcbiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEVudGl0eVNldFVwZGF0YWJsZVBhdGgoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB7XG5cdGNvbnN0IHJlc3RyaWN0aW9ucyA9IGdldFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgZW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0Y29uc3QgdXBkYXRhYmxlID0gcmVzdHJpY3Rpb25zLmlzVXBkYXRhYmxlO1xuXHRjb25zdCBpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5OiBhbnkgPSAhaXNDb25zdGFudCh1cGRhdGFibGUuZXhwcmVzc2lvbikgJiYgdXBkYXRhYmxlLm5hdmlnYXRpb25FeHByZXNzaW9uLl90eXBlID09PSBcIlVucmVzb2x2YWJsZVwiO1xuXHRjb25zdCB1cGRhdGFibGVQcm9wZXJ0eVBhdGggPSAoZW50aXR5U2V0Py5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/LlVwZGF0ZVJlc3RyaWN0aW9ucz8uVXBkYXRhYmxlIGFzIGFueSk/LnBhdGg7XG5cblx0cmV0dXJuIGlzT25seUR5bmFtaWNPbkN1cnJlbnRFbnRpdHkgPyAodXBkYXRhYmxlUHJvcGVydHlQYXRoIGFzIHN0cmluZykgOiBcIlwiO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byByZXRyaWV2ZSBhbGwgcHJvcGVydHkgcGF0aHMgYXNzaWduZWQgdG8gdGhlIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIG9wZXJhdGlvbkF2YWlsYWJsZU1hcCBUaGUgcmVjb3JkIGNvbnNpc3Rpbmcgb2YgYWN0aW9ucyBhbmQgdGhlaXIgQ29yZS5PcGVyYXRpb25BdmFpbGFibGUgcHJvcGVydHkgcGF0aHNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBDU1Ygc3RyaW5nIG9mIGFsbCBwcm9wZXJ0eSBwYXRocyBhc3NvY2lhdGVkIHdpdGggdGhlIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIGFubm90YXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0T3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyhvcGVyYXRpb25BdmFpbGFibGVNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4sIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBzdHJpbmcge1xuXHRjb25zdCBwcm9wZXJ0aWVzID0gbmV3IFNldCgpO1xuXG5cdGZvciAoY29uc3QgYWN0aW9uTmFtZSBpbiBvcGVyYXRpb25BdmFpbGFibGVNYXApIHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBvcGVyYXRpb25BdmFpbGFibGVNYXBbYWN0aW9uTmFtZV07XG5cdFx0aWYgKHByb3BlcnR5TmFtZSA9PT0gbnVsbCkge1xuXHRcdFx0Ly8gQW5ub3RhdGlvbiBjb25maWd1cmVkIHdpdGggZXhwbGljaXQgJ251bGwnIChhY3Rpb24gYWR2ZXJ0aXNlbWVudCByZWxldmFudClcblx0XHRcdHByb3BlcnRpZXMuYWRkKGFjdGlvbk5hbWUpO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHByb3BlcnR5TmFtZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0Ly8gQWRkIHByb3BlcnR5IHBhdGhzIGFuZCBub3QgQ29uc3RhbnQgdmFsdWVzLlxuXHRcdFx0cHJvcGVydGllcy5hZGQocHJvcGVydHlOYW1lKTtcblx0XHR9XG5cdH1cblxuXHRpZiAocHJvcGVydGllcy5zaXplKSB7XG5cdFx0Ly8gU29tZSBhY3Rpb25zIGhhdmUgYW4gb3BlcmF0aW9uIGF2YWlsYWJsZSBiYXNlZCBvbiBwcm9wZXJ0eSAtLT4gd2UgbmVlZCB0byBsb2FkIHRoZSBIZWFkZXJJbmZvLlRpdGxlIHByb3BlcnR5XG5cdFx0Ly8gc28gdGhhdCB0aGUgZGlhbG9nIG9uIHBhcnRpYWwgYWN0aW9ucyBpcyBkaXNwbGF5ZWQgcHJvcGVybHkgKEJDUCAyMTgwMjcxNDI1KVxuXHRcdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0XHRjb25zdCB0aXRsZVByb3BlcnR5ID0gKGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJJbmZvPy5UaXRsZSBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy5wYXRoO1xuXHRcdGlmICh0aXRsZVByb3BlcnR5KSB7XG5cdFx0XHRwcm9wZXJ0aWVzLmFkZCh0aXRsZVByb3BlcnR5KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gQXJyYXkuZnJvbShwcm9wZXJ0aWVzKS5qb2luKFwiLFwiKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIHRoZSBEYXRhRmllbGRGb3JBY3Rpb24gYW5kIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiBvZiBhIGxpbmUgaXRlbSBhbmRcbiAqIHJldHVybnMgYWxsIHRoZSBVSS5IaWRkZW4gYW5ub3RhdGlvbiBleHByZXNzaW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgdXNlZCBmb3IgcmVwcmVzZW50YXRpb24gaW4gYSB0YWJsZSBvciBsaXN0XG4gKiBAcGFyYW0gY3VycmVudEVudGl0eVR5cGUgQ3VycmVudCBlbnRpdHkgdHlwZVxuICogQHBhcmFtIGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoIE9iamVjdCBwYXRoIG9mIHRoZSBkYXRhIG1vZGVsXG4gKiBAcGFyYW0gaXNFbnRpdHlTZXRcbiAqIEByZXR1cm5zIEFsbCB0aGUgYFVJLkhpZGRlbmAgcGF0aCBleHByZXNzaW9ucyBmb3VuZCBpbiB0aGUgcmVsZXZhbnQgYWN0aW9uc1xuICovXG5mdW5jdGlvbiBnZXRVSUhpZGRlbkV4cEZvckFjdGlvbnNSZXF1aXJpbmdDb250ZXh0KFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHRjdXJyZW50RW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udGV4dERhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdGlzRW50aXR5U2V0OiBib29sZWFuXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSB7XG5cdGNvbnN0IGFVaUhpZGRlblBhdGhFeHByZXNzaW9uczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10gPSBbXTtcblx0bGluZUl0ZW1Bbm5vdGF0aW9uLmZvckVhY2goKGRhdGFGaWVsZCkgPT4ge1xuXHRcdC8vIENoZWNrIGlmIHRoZSBsaW5lSXRlbSBjb250ZXh0IGlzIHRoZSBzYW1lIGFzIHRoYXQgb2YgdGhlIGFjdGlvbjpcblx0XHRpZiAoXG5cdFx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gJiZcblx0XHRcdFx0ZGF0YUZpZWxkPy5BY3Rpb25UYXJnZXQ/LmlzQm91bmQgJiZcblx0XHRcdFx0Y3VycmVudEVudGl0eVR5cGUgPT09IGRhdGFGaWVsZD8uQWN0aW9uVGFyZ2V0LnNvdXJjZUVudGl0eVR5cGUpIHx8XG5cdFx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gJiZcblx0XHRcdFx0ZGF0YUZpZWxkLlJlcXVpcmVzQ29udGV4dCAmJlxuXHRcdFx0XHRkYXRhRmllbGQ/LklubGluZT8udmFsdWVPZigpICE9PSB0cnVlKVxuXHRcdCkge1xuXHRcdFx0aWYgKHR5cGVvZiBkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRhVWlIaWRkZW5QYXRoRXhwcmVzc2lvbnMucHVzaChlcXVhbChnZXRCaW5kaW5nRXhwRnJvbUNvbnRleHQoZGF0YUZpZWxkLCBjb250ZXh0RGF0YU1vZGVsT2JqZWN0UGF0aCwgaXNFbnRpdHlTZXQpLCBmYWxzZSkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiBhVWlIaWRkZW5QYXRoRXhwcmVzc2lvbnM7XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBjaGFuZ2UgdGhlIGNvbnRleHQgY3VycmVudGx5IHJlZmVyZW5jZWQgYnkgdGhpcyBiaW5kaW5nIGJ5IHJlbW92aW5nIHRoZSBsYXN0IG5hdmlnYXRpb24gcHJvcGVydHkuXG4gKlxuICogSXQgaXMgdXNlZCAoc3BlY2lmaWNhbGx5IGluIHRoaXMgY2FzZSksIHRvIHRyYW5zZm9ybSBhIGJpbmRpbmcgbWFkZSBmb3IgYSBOYXZQcm9wIGNvbnRleHQgL01haW5PYmplY3QvTmF2UHJvcDEvTmF2UHJvcDIsXG4gKiBpbnRvIGEgYmluZGluZyBvbiB0aGUgcHJldmlvdXMgY29udGV4dCAvTWFpbk9iamVjdC9OYXZQcm9wMS5cbiAqXG4gKiBAcGFyYW0gc291cmNlIERhdGFGaWVsZEZvckFjdGlvbiB8IERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiB8IEN1c3RvbUFjdGlvblxuICogQHBhcmFtIGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoIERhdGFNb2RlbE9iamVjdFBhdGhcbiAqIEBwYXJhbSBpc0VudGl0eVNldFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuICovXG5mdW5jdGlvbiBnZXRCaW5kaW5nRXhwRnJvbUNvbnRleHQoXG5cdHNvdXJjZTogRGF0YUZpZWxkRm9yQWN0aW9uIHwgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIHwgQ3VzdG9tQWN0aW9uLFxuXHRjb250ZXh0RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0aXNFbnRpdHlTZXQ6IGJvb2xlYW5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+IHtcblx0bGV0IHNFeHByZXNzaW9uOiBhbnkgfCB1bmRlZmluZWQ7XG5cdGlmIChcblx0XHQoc291cmNlIGFzIERhdGFGaWVsZEZvckFjdGlvbik/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHQoc291cmNlIGFzIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbik/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cblx0KSB7XG5cdFx0c0V4cHJlc3Npb24gPSAoc291cmNlIGFzIERhdGFGaWVsZEZvckFjdGlvbiB8IERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbik/LmFubm90YXRpb25zPy5VST8uSGlkZGVuO1xuXHR9IGVsc2Uge1xuXHRcdHNFeHByZXNzaW9uID0gKHNvdXJjZSBhcyBDdXN0b21BY3Rpb24pPy52aXNpYmxlO1xuXHR9XG5cdGxldCBzUGF0aDogc3RyaW5nO1xuXHRpZiAoc0V4cHJlc3Npb24/LnBhdGgpIHtcblx0XHRzUGF0aCA9IHNFeHByZXNzaW9uLnBhdGg7XG5cdH0gZWxzZSB7XG5cdFx0c1BhdGggPSBzRXhwcmVzc2lvbjtcblx0fVxuXHRpZiAoc1BhdGgpIHtcblx0XHRpZiAoKHNvdXJjZSBhcyBDdXN0b21BY3Rpb24pPy52aXNpYmxlKSB7XG5cdFx0XHRzUGF0aCA9IHNQYXRoLnN1YnN0cmluZygxLCBzUGF0aC5sZW5ndGggLSAxKTtcblx0XHR9XG5cdFx0aWYgKHNQYXRoLmluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0Ly9jaGVjayBpZiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBpcyBjb3JyZWN0OlxuXHRcdFx0Y29uc3QgYVNwbGl0UGF0aCA9IHNQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IGFTcGxpdFBhdGhbMF07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoPy50YXJnZXRPYmplY3Q/Ll90eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmXG5cdFx0XHRcdGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5wYXJ0bmVyID09PSBzTmF2aWdhdGlvblBhdGhcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwoYVNwbGl0UGF0aC5zbGljZSgxKS5qb2luKFwiL1wiKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29uc3RhbnQodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBJbiBjYXNlIHRoZXJlIGlzIG5vIG5hdmlnYXRpb24gcHJvcGVydHksIGlmIGl0J3MgYW4gZW50aXR5U2V0LCB0aGUgZXhwcmVzc2lvbiBiaW5kaW5nIGhhcyB0byBiZSByZXR1cm5lZDpcblx0XHR9IGVsc2UgaWYgKGlzRW50aXR5U2V0KSB7XG5cdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwoc1BhdGgpO1xuXHRcdFx0Ly8gb3RoZXJ3aXNlIHRoZSBleHByZXNzaW9uIGJpbmRpbmcgY2Fubm90IGJlIHRha2VuIGludG8gYWNjb3VudCBmb3IgdGhlIHNlbGVjdGlvbiBtb2RlIGV2YWx1YXRpb246XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25zdGFudCh0cnVlKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNvbnN0YW50KHRydWUpO1xufVxuXG4vKipcbiAqIExvb3AgdGhyb3VnaCB0aGUgbWFuaWZlc3QgYWN0aW9ucyBhbmQgY2hlY2sgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiBJZiB0aGUgZGF0YSBmaWVsZCBpcyBhbHNvIHJlZmVyZW5jZWQgYXMgYSBjdXN0b20gYWN0aW9uLlxuICogSWYgdGhlIHVuZGVybHlpbmcgbWFuaWZlc3QgYWN0aW9uIGlzIGVpdGhlciBhIGJvdW5kIGFjdGlvbiBvciBoYXMgdGhlICdSZXF1aXJlc0NvbnRleHQnIHByb3BlcnR5IHNldCB0byB0cnVlLlxuICpcbiAqIElmIHNvLCB0aGUgJ3JlcXVpcmVzU2VsZWN0aW9uJyBwcm9wZXJ0eSBpcyBmb3JjZWQgdG8gJ3RydWUnIGluIHRoZSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkSWQgSWQgb2YgdGhlIERhdGFGaWVsZCBldmFsdWF0ZWRcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIGV2YWx1YXRlZFxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBEYXRhRmllbGQgaXMgZm91bmQgYW1vbmcgdGhlIG1hbmlmZXN0IGFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gdXBkYXRlTWFuaWZlc3RBY3Rpb25BbmRUYWdJdChcblx0ZGF0YUZpZWxkSWQ6IHN0cmluZyxcblx0ZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JBY3Rpb24gfCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPlxuKTogYm9vbGVhbiB7XG5cdHJldHVybiBPYmplY3Qua2V5cyhtYW5pZmVzdEFjdGlvbnMpLnNvbWUoKGFjdGlvbktleSkgPT4ge1xuXHRcdGlmIChhY3Rpb25LZXkgPT09IGRhdGFGaWVsZElkKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQWN0aW9uKT8uQWN0aW9uVGFyZ2V0Py5pc0JvdW5kIHx8XG5cdFx0XHRcdChkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKT8uUmVxdWlyZXNDb250ZXh0XG5cdFx0XHQpIHtcblx0XHRcdFx0bWFuaWZlc3RBY3Rpb25zW2RhdGFGaWVsZElkXS5yZXF1aXJlc1NlbGVjdGlvbiA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBMb29wIHRocm91Z2ggdGhlIERhdGFGaWVsZEZvckFjdGlvbiBhbmQgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIG9mIGEgbGluZSBpdGVtIGFuZFxuICogY2hlY2sgdGhlIGZvbGxvd2luZzpcbiAqIElmIGF0IGxlYXN0IG9uZSBvZiB0aGVtIGlzIGFsd2F5cyB2aXNpYmxlIGluIHRoZSB0YWJsZSB0b29sYmFyIGFuZCByZXF1aXJlcyBhIGNvbnRleHRcbiAqIElmIGFuIGFjdGlvbiBpcyBhbHNvIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LCBpdCBpcyBzZXQgYXNpZGUgYW5kIHdpbGwgYmUgY29uc2lkZXJlZFxuICogd2hlbiBnb2luZyB0aHJvdWdoIHRoZSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgZm9yIHJlcHJlc2VudGF0aW9uIGluIGEgdGFibGUgb3IgbGlzdFxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGN1cnJlbnRFbnRpdHlUeXBlIEN1cnJlbnQgRW50aXR5IFR5cGVcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGVyZSBpcyBhdCBsZWFzdCAxIGFjdGlvbiB0aGF0IG1lZXRzIHRoZSBjcml0ZXJpYVxuICovXG5mdW5jdGlvbiBoYXNCb3VuZEFjdGlvbnNBbHdheXNWaXNpYmxlSW5Ub29sQmFyKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHRtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4sXG5cdGN1cnJlbnRFbnRpdHlUeXBlOiBFbnRpdHlUeXBlXG4pOiBib29sZWFuIHtcblx0cmV0dXJuIGxpbmVJdGVtQW5ub3RhdGlvbi5zb21lKChkYXRhRmllbGQpID0+IHtcblx0XHRpZiAoXG5cdFx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pICYmXG5cdFx0XHRkYXRhRmllbGQ/LklubGluZT8udmFsdWVPZigpICE9PSB0cnVlICYmXG5cdFx0XHQoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IGZhbHNlIHx8IGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpID09PSB1bmRlZmluZWQpXG5cdFx0KSB7XG5cdFx0XHRpZiAoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24pIHtcblx0XHRcdFx0Y29uc3QgbWFuaWZlc3RBY3Rpb25JZCA9IGdlbmVyYXRlKFtcIkRhdGFGaWVsZEZvckFjdGlvblwiLCBkYXRhRmllbGQuQWN0aW9uIGFzIHN0cmluZ10pO1xuXHRcdFx0XHQvLyBpZiB0aGUgRGF0YUZpZWxkRm9yQWN0b24gZnJvbSBhbm5vdGF0aW9uIGFsc28gZXhpc3RzIGluIHRoZSBtYW5pZmVzdCwgaXRzIHZpc2liaWxpdHkgd2lsbCBiZSBldmFsdWF0ZWQgbGF0ZXIgb25cblx0XHRcdFx0aWYgKHVwZGF0ZU1hbmlmZXN0QWN0aW9uQW5kVGFnSXQobWFuaWZlc3RBY3Rpb25JZCwgZGF0YUZpZWxkLCBtYW5pZmVzdEFjdGlvbnMpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIENoZWNrIGlmIHRoZSBsaW5lSXRlbSBjb250ZXh0IGlzIHRoZSBzYW1lIGFzIHRoYXQgb2YgdGhlIGFjdGlvbjpcblx0XHRcdFx0cmV0dXJuIGRhdGFGaWVsZD8uQWN0aW9uVGFyZ2V0Py5pc0JvdW5kICYmIGN1cnJlbnRFbnRpdHlUeXBlID09PSBkYXRhRmllbGQ/LkFjdGlvblRhcmdldC5zb3VyY2VFbnRpdHlUeXBlO1xuXHRcdFx0fSBlbHNlIGlmIChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHQvLyBpZiB0aGUgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gYW5ub3RhdGlvbiBhbHNvIGV4aXN0cyBpbiB0aGUgbWFuaWZlc3QsIGl0cyB2aXNpYmlsaXR5IHdpbGwgYmUgZXZhbHVhdGVkIGxhdGVyIG9uXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHR1cGRhdGVNYW5pZmVzdEFjdGlvbkFuZFRhZ0l0KFxuXHRcdFx0XHRcdFx0YERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjo6JHtkYXRhRmllbGQuU2VtYW50aWNPYmplY3R9Ojoke2RhdGFGaWVsZC5BY3Rpb259YCxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZCxcblx0XHRcdFx0XHRcdG1hbmlmZXN0QWN0aW9uc1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYXNDdXN0b21BY3Rpb25zQWx3YXlzVmlzaWJsZUluVG9vbEJhcihtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4pOiBib29sZWFuIHtcblx0cmV0dXJuIE9iamVjdC5rZXlzKG1hbmlmZXN0QWN0aW9ucykuc29tZSgoYWN0aW9uS2V5KSA9PiB7XG5cdFx0Y29uc3QgYWN0aW9uID0gbWFuaWZlc3RBY3Rpb25zW2FjdGlvbktleV07XG5cdFx0aWYgKGFjdGlvbi5yZXF1aXJlc1NlbGVjdGlvbiAmJiBhY3Rpb24udmlzaWJsZT8udG9TdHJpbmcoKSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufVxuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgdGhlIGN1c3RvbSBhY3Rpb25zICh3aXRoIGtleSByZXF1aXJlc1NlbGVjdGlvbikgZGVjbGFyZWQgaW4gdGhlIG1hbmlmZXN0IGZvciB0aGUgY3VycmVudCBsaW5lIGl0ZW0gYW5kIHJldHVybnMgYWxsIHRoZVxuICogdmlzaWJsZSBrZXkgdmFsdWVzIGFzIGFuIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHJldHVybnMgQXJyYXk8RXhwcmVzc2lvbjxib29sZWFuPj4gQWxsIHRoZSB2aXNpYmxlIHBhdGggZXhwcmVzc2lvbnMgb2YgdGhlIGFjdGlvbnMgdGhhdCBtZWV0IHRoZSBjcml0ZXJpYVxuICovXG5mdW5jdGlvbiBnZXRWaXNpYmxlRXhwRm9yQ3VzdG9tQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQobWFuaWZlc3RBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+KTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10ge1xuXHRjb25zdCBhVmlzaWJsZVBhdGhFeHByZXNzaW9uczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10gPSBbXTtcblx0aWYgKG1hbmlmZXN0QWN0aW9ucykge1xuXHRcdE9iamVjdC5rZXlzKG1hbmlmZXN0QWN0aW9ucykuZm9yRWFjaCgoYWN0aW9uS2V5KSA9PiB7XG5cdFx0XHRjb25zdCBhY3Rpb24gPSBtYW5pZmVzdEFjdGlvbnNbYWN0aW9uS2V5XTtcblx0XHRcdGlmIChhY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24gPT09IHRydWUgJiYgYWN0aW9uLnZpc2libGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGFjdGlvbi52aXNpYmxlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0LypUaGUgZmluYWwgYWltIHdvdWxkIGJlIHRvIGNoZWNrIGlmIHRoZSBwYXRoIGV4cHJlc3Npb24gZGVwZW5kcyBvbiB0aGUgcGFyZW50IGNvbnRleHRcblx0XHRcdFx0XHRhbmQgY29uc2lkZXJzIG9ubHkgdGhvc2UgZXhwcmVzc2lvbnMgZm9yIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb24sXG5cdFx0XHRcdFx0YnV0IGN1cnJlbnRseSBub3QgcG9zc2libGUgZnJvbSB0aGUgbWFuaWZlc3QgYXMgdGhlIHZpc2libGUga2V5IGlzIGJvdW5kIG9uIHRoZSBwYXJlbnQgZW50aXR5LlxuXHRcdFx0XHRcdFRyaWNreSB0byBkaWZmZXJlbnRpYXRlIHRoZSBwYXRoIGFzIGl0J3MgZG9uZSBmb3IgdGhlIEhpZGRlbiBhbm5vdGF0aW9uLlxuXHRcdFx0XHRcdEZvciB0aGUgdGltZSBiZWluZyB3ZSBjb25zaWRlciBhbGwgdGhlIHBhdGhzIG9mIHRoZSBtYW5pZmVzdCovXG5cblx0XHRcdFx0XHRhVmlzaWJsZVBhdGhFeHByZXNzaW9ucy5wdXNoKHJlc29sdmVCaW5kaW5nU3RyaW5nKGFjdGlvbj8udmlzaWJsZT8udmFsdWVPZigpKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYVZpc2libGVQYXRoRXhwcmVzc2lvbnM7XG59XG5cbi8qKlxuICogRXZhbHVhdGUgaWYgdGhlIHBhdGggaXMgc3RhdGljYWxseSBkZWxldGFibGUgb3IgdXBkYXRhYmxlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgdGFibGUgY2FwYWJpbGl0aWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYXBhYmlsaXR5UmVzdHJpY3Rpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IFRhYmxlQ2FwYWJpbGl0eVJlc3RyaWN0aW9uIHtcblx0Y29uc3QgaXNEZWxldGFibGUgPSBpc1BhdGhEZWxldGFibGUoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpO1xuXHRjb25zdCBpc1VwZGF0YWJsZSA9IGlzUGF0aFVwZGF0YWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSk7XG5cdHJldHVybiB7XG5cdFx0aXNEZWxldGFibGU6ICEoaXNDb25zdGFudChpc0RlbGV0YWJsZSkgJiYgaXNEZWxldGFibGUudmFsdWUgPT09IGZhbHNlKSxcblx0XHRpc1VwZGF0YWJsZTogIShpc0NvbnN0YW50KGlzVXBkYXRhYmxlKSAmJiBpc1VwZGF0YWJsZS52YWx1ZSA9PT0gZmFsc2UpXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWxlY3Rpb25Nb2RlKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRpc0VudGl0eVNldDogYm9vbGVhbixcblx0dGFyZ2V0Q2FwYWJpbGl0aWVzOiBUYWJsZUNhcGFiaWxpdHlSZXN0cmljdGlvbixcblx0ZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24/OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4sXG5cdG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiA9IGNvbnN0YW50KGZhbHNlKVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKCFsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHRyZXR1cm4gU2VsZWN0aW9uTW9kZS5Ob25lO1xuXHR9XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RTZXR0aW5ncyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGxldCBzZWxlY3Rpb25Nb2RlID0gdGFibGVNYW5pZmVzdFNldHRpbmdzLnRhYmxlU2V0dGluZ3M/LnNlbGVjdGlvbk1vZGU7XG5cdGxldCBhSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IFtdLFxuXHRcdGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IFtdO1xuXHRjb25zdCBtYW5pZmVzdEFjdGlvbnMgPSBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCkuYWN0aW9ucyxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFtdLFxuXHRcdHVuZGVmaW5lZCxcblx0XHRmYWxzZVxuXHQpO1xuXHRsZXQgaXNQYXJlbnREZWxldGFibGUsIHBhcmVudEVudGl0eVNldERlbGV0YWJsZTtcblx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlKSB7XG5cdFx0aXNQYXJlbnREZWxldGFibGUgPSBpc1BhdGhEZWxldGFibGUoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpO1xuXHRcdHBhcmVudEVudGl0eVNldERlbGV0YWJsZSA9IGlzUGFyZW50RGVsZXRhYmxlID8gY29tcGlsZUV4cHJlc3Npb24oaXNQYXJlbnREZWxldGFibGUsIHRydWUpIDogaXNQYXJlbnREZWxldGFibGU7XG5cdH1cblxuXHRjb25zdCBiTWFzc0VkaXRFbmFibGVkOiBib29sZWFuID0gIWlzQ29uc3RhbnQobWFzc0VkaXRWaXNpYmlsaXR5RXhwcmVzc2lvbikgfHwgbWFzc0VkaXRWaXNpYmlsaXR5RXhwcmVzc2lvbi52YWx1ZSAhPT0gZmFsc2U7XG5cdGlmIChzZWxlY3Rpb25Nb2RlICYmIHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuTm9uZSAmJiBkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbikge1xuXHRcdGlmIChjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuT2JqZWN0UGFnZSAmJiBiTWFzc0VkaXRFbmFibGVkKSB7XG5cdFx0XHQvLyBNYXNzIEVkaXQgaW4gT1AgaXMgZW5hYmxlZCBvbmx5IGluIGVkaXQgbW9kZS5cblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRcdGFuZChVSS5Jc0VkaXRhYmxlLCBtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uKSxcblx0XHRcdFx0XHRjb25zdGFudChcIk11bHRpXCIpLFxuXHRcdFx0XHRcdGlmRWxzZShkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiwgY29uc3RhbnQoXCJNdWx0aVwiKSwgY29uc3RhbnQoXCJOb25lXCIpKVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoYk1hc3NFZGl0RW5hYmxlZCkge1xuXHRcdFx0cmV0dXJuIFNlbGVjdGlvbk1vZGUuTXVsdGk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiwgY29uc3RhbnQoXCJNdWx0aVwiKSwgY29uc3RhbnQoXCJOb25lXCIpKSk7XG5cdH1cblx0aWYgKCFzZWxlY3Rpb25Nb2RlIHx8IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuQXV0bykge1xuXHRcdHNlbGVjdGlvbk1vZGUgPSBTZWxlY3Rpb25Nb2RlLk11bHRpO1xuXHR9XG5cdGlmIChiTWFzc0VkaXRFbmFibGVkKSB7XG5cdFx0Ly8gT3ZlcnJpZGUgZGVmYXVsdCBzZWxlY3Rpb24gbW9kZSB3aGVuIG1hc3MgZWRpdCBpcyB2aXNpYmxlXG5cdFx0c2VsZWN0aW9uTW9kZSA9IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuU2luZ2xlID8gU2VsZWN0aW9uTW9kZS5TaW5nbGUgOiBTZWxlY3Rpb25Nb2RlLk11bHRpO1xuXHR9XG5cblx0aWYgKFxuXHRcdGhhc0JvdW5kQWN0aW9uc0Fsd2F5c1Zpc2libGVJblRvb2xCYXIobGluZUl0ZW1Bbm5vdGF0aW9uLCBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucywgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkpIHx8XG5cdFx0aGFzQ3VzdG9tQWN0aW9uc0Fsd2F5c1Zpc2libGVJblRvb2xCYXIobWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMpXG5cdCkge1xuXHRcdHJldHVybiBzZWxlY3Rpb25Nb2RlO1xuXHR9XG5cdGFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMgPSBnZXRVSUhpZGRlbkV4cEZvckFjdGlvbnNSZXF1aXJpbmdDb250ZXh0KFxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbixcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSxcblx0XHRpc0VudGl0eVNldFxuXHQpO1xuXHRhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucyA9IGdldFZpc2libGVFeHBGb3JDdXN0b21BY3Rpb25zUmVxdWlyaW5nQ29udGV4dChtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucyk7XG5cblx0Ly8gTm8gYWN0aW9uIHJlcXVpcmluZyBhIGNvbnRleHQ6XG5cdGlmIChcblx0XHRhSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zLmxlbmd0aCA9PT0gMCAmJlxuXHRcdGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zLmxlbmd0aCA9PT0gMCAmJlxuXHRcdChkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiB8fCBiTWFzc0VkaXRFbmFibGVkKVxuXHQpIHtcblx0XHRpZiAoIWlzRW50aXR5U2V0KSB7XG5cdFx0XHQvLyBFeGFtcGxlOiBPUCBjYXNlXG5cdFx0XHRpZiAodGFyZ2V0Q2FwYWJpbGl0aWVzLmlzRGVsZXRhYmxlIHx8IHBhcmVudEVudGl0eVNldERlbGV0YWJsZSAhPT0gXCJmYWxzZVwiIHx8IGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHRcdFx0Ly8gQnVpbGRpbmcgZXhwcmVzc2lvbiBmb3IgZGVsZXRlIGFuZCBtYXNzIGVkaXRcblx0XHRcdFx0Y29uc3QgYnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24gPSBvcihcblx0XHRcdFx0XHRkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiB8fCB0cnVlLCAvLyBkZWZhdWx0IGRlbGV0ZSB2aXNpYmlsaXR5IGFzIHRydWVcblx0XHRcdFx0XHRtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0XHRpZkVsc2UoYW5kKFVJLklzRWRpdGFibGUsIGJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uKSwgY29uc3RhbnQoc2VsZWN0aW9uTW9kZSksIGNvbnN0YW50KFNlbGVjdGlvbk1vZGUuTm9uZSkpXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gU2VsZWN0aW9uTW9kZS5Ob25lO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRW50aXR5U2V0IGRlbGV0YWJsZTpcblx0XHR9IGVsc2UgaWYgKGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHRcdC8vIGV4YW1wbGU6IExSIHNjZW5hcmlvXG5cdFx0XHRyZXR1cm4gc2VsZWN0aW9uTW9kZTtcblx0XHR9IGVsc2UgaWYgKHRhcmdldENhcGFiaWxpdGllcy5pc0RlbGV0YWJsZSAmJiBkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbikge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiwgY29uc3RhbnQoc2VsZWN0aW9uTW9kZSksIGNvbnN0YW50KFwiTm9uZVwiKSkpO1xuXHRcdFx0Ly8gRW50aXR5U2V0IG5vdCBkZWxldGFibGU6XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBTZWxlY3Rpb25Nb2RlLk5vbmU7XG5cdFx0fVxuXHRcdC8vIFRoZXJlIGFyZSBhY3Rpb25zIHJlcXVpcmluZyBhIGNvbnRleHQ6XG5cdH0gZWxzZSBpZiAoIWlzRW50aXR5U2V0KSB7XG5cdFx0Ly8gRXhhbXBsZTogT1AgY2FzZVxuXHRcdGlmICh0YXJnZXRDYXBhYmlsaXRpZXMuaXNEZWxldGFibGUgfHwgcGFyZW50RW50aXR5U2V0RGVsZXRhYmxlICE9PSBcImZhbHNlXCIgfHwgYk1hc3NFZGl0RW5hYmxlZCkge1xuXHRcdFx0Ly8gVXNlIHNlbGVjdGlvbk1vZGUgaW4gZWRpdCBtb2RlIGlmIGRlbGV0ZSBpcyBlbmFibGVkIG9yIG1hc3MgZWRpdCBpcyB2aXNpYmxlXG5cdFx0XHRjb25zdCBlZGl0TW9kZWJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uID0gaWZFbHNlKFxuXHRcdFx0XHRiTWFzc0VkaXRFbmFibGVkICYmICF0YXJnZXRDYXBhYmlsaXRpZXMuaXNEZWxldGFibGUsXG5cdFx0XHRcdG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb24sXG5cdFx0XHRcdGNvbnN0YW50KHRydWUpXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRpZkVsc2UoXG5cdFx0XHRcdFx0YW5kKFVJLklzRWRpdGFibGUsIGVkaXRNb2RlYnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24pLFxuXHRcdFx0XHRcdGNvbnN0YW50KHNlbGVjdGlvbk1vZGUpLFxuXHRcdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRcdG9yKC4uLmFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMuY29uY2F0KGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zKSksXG5cdFx0XHRcdFx0XHRjb25zdGFudChzZWxlY3Rpb25Nb2RlKSxcblx0XHRcdFx0XHRcdGNvbnN0YW50KFNlbGVjdGlvbk1vZGUuTm9uZSlcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRcdG9yKC4uLmFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMuY29uY2F0KGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zKSksXG5cdFx0XHRcdFx0Y29uc3RhbnQoc2VsZWN0aW9uTW9kZSksXG5cdFx0XHRcdFx0Y29uc3RhbnQoU2VsZWN0aW9uTW9kZS5Ob25lKVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHQvL0VudGl0eVNldCBkZWxldGFibGU6XG5cdH0gZWxzZSBpZiAodGFyZ2V0Q2FwYWJpbGl0aWVzLmlzRGVsZXRhYmxlIHx8IGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHQvLyBFeGFtcGxlOiBMUiBzY2VuYXJpb1xuXHRcdHJldHVybiBzZWxlY3Rpb25Nb2RlO1xuXHRcdC8vRW50aXR5U2V0IG5vdCBkZWxldGFibGU6XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRvciguLi5hSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zLmNvbmNhdChhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucyksIG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb24pLFxuXHRcdFx0XHRjb25zdGFudChzZWxlY3Rpb25Nb2RlKSxcblx0XHRcdFx0Y29uc3RhbnQoU2VsZWN0aW9uTW9kZS5Ob25lKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gcmV0cmlldmUgYWxsIHRhYmxlIGFjdGlvbnMgZnJvbSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgdGFibGUgYW5ub3RhdGlvbiBhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldFRhYmxlQW5ub3RhdGlvbkFjdGlvbnMobGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSwgdmlzdWFsaXphdGlvblBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRjb25zdCB0YWJsZUFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IFtdO1xuXHRjb25zdCBoaWRkZW5UYWJsZUFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IFtdO1xuXG5cdGNvbnN0IGNvcHlEYXRhRmllbGQgPSBnZXRDb3B5QWN0aW9uKFxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbi5maWx0ZXIoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuIGRhdGFGaWVsZElzQ29weUFjdGlvbihkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQWN0aW9uVHlwZXMpO1xuXHRcdH0pIGFzIERhdGFGaWVsZEZvckFjdGlvblR5cGVzW11cblx0KTtcblxuXHRpZiAoY29weURhdGFGaWVsZCkge1xuXHRcdHRhYmxlQWN0aW9ucy5wdXNoKHtcblx0XHRcdHR5cGU6IEFjdGlvblR5cGUuQ29weSxcblx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoY29weURhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGNvcHlEYXRhRmllbGQpLFxuXHRcdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oZXF1YWwocGF0aEluTW9kZWwoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKSwgMSkpLFxuXHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdG5vdChcblx0XHRcdFx0XHRlcXVhbChcblx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdFx0Y29weURhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbixcblx0XHRcdFx0XHRcdFx0W10sXG5cdFx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZU1vZGVsUGF0aEZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0dGV4dDogY29weURhdGFGaWVsZC5MYWJlbD8udG9TdHJpbmcoKSA/PyBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJDX0NPTU1PTl9DT1BZXCIpLFxuXHRcdFx0aXNOYXZpZ2FibGU6IHRydWVcblx0XHR9KTtcblx0fVxuXG5cdGxpbmVJdGVtQW5ub3RhdGlvblxuXHRcdC5maWx0ZXIoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuICFkYXRhRmllbGRJc0NvcHlBY3Rpb24oZGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFjdGlvbik7XG5cdFx0fSlcblx0XHQuZm9yRWFjaCgoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0XHRpZiAoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IHRydWUpIHtcblx0XHRcdFx0aGlkZGVuVGFibGVBY3Rpb25zLnB1c2goe1xuXHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGVmYXVsdCxcblx0XHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdGlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QoZGF0YUZpZWxkKSAmJlxuXHRcdFx0XHRkYXRhRmllbGQuSW5saW5lPy52YWx1ZU9mKCkgIT09IHRydWUgJiZcblx0XHRcdFx0ZGF0YUZpZWxkLkRldGVybWluaW5nPy52YWx1ZU9mKCkgIT09IHRydWVcblx0XHRcdCkge1xuXHRcdFx0XHRzd2l0Y2ggKGRhdGFGaWVsZC4kVHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdFx0XHRcdFx0dGFibGVBY3Rpb25zLnB1c2goe1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdFx0XHRcdG5vdChcblx0XHRcdFx0XHRcdFx0XHRcdGVxdWFsKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFtdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFJlbGF0aXZlTW9kZWxQYXRoRnVuY3Rpb24oKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRpc05hdmlnYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0XHRcdFx0dGFibGVBY3Rpb25zLnB1c2goe1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdFx0XHRcdG5vdChcblx0XHRcdFx0XHRcdFx0XHRcdGVxdWFsKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFtdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFJlbGF0aXZlTW9kZWxQYXRoRnVuY3Rpb24oKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0dGFibGVBY3Rpb25zLFxuXHRcdGhpZGRlblRhYmxlQWN0aW9uc1xuXHR9O1xufVxuXG5mdW5jdGlvbiBnZXRIaWdobGlnaHRSb3dCaW5kaW5nKFxuXHRjcml0aWNhbGl0eUFubm90YXRpb246IFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxDcml0aWNhbGl0eVR5cGU+IHwgRW51bVZhbHVlPENyaXRpY2FsaXR5VHlwZT4gfCB1bmRlZmluZWQsXG5cdGlzRHJhZnRSb290OiBib29sZWFuLFxuXHR0YXJnZXRFbnRpdHlUeXBlPzogRW50aXR5VHlwZVxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPE1lc3NhZ2VUeXBlPiB7XG5cdGxldCBkZWZhdWx0SGlnaGxpZ2h0Um93RGVmaW5pdGlvbjogTWVzc2FnZVR5cGUgfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248TWVzc2FnZVR5cGU+ID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0aWYgKGNyaXRpY2FsaXR5QW5ub3RhdGlvbikge1xuXHRcdGlmICh0eXBlb2YgY3JpdGljYWxpdHlBbm5vdGF0aW9uID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRkZWZhdWx0SGlnaGxpZ2h0Um93RGVmaW5pdGlvbiA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjcml0aWNhbGl0eUFubm90YXRpb24pIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxNZXNzYWdlVHlwZT47XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEVudW0gVmFsdWUgc28gd2UgZ2V0IHRoZSBjb3JyZXNwb25kaW5nIHN0YXRpYyBwYXJ0XG5cdFx0XHRkZWZhdWx0SGlnaGxpZ2h0Um93RGVmaW5pdGlvbiA9IGdldE1lc3NhZ2VUeXBlRnJvbUNyaXRpY2FsaXR5VHlwZShjcml0aWNhbGl0eUFubm90YXRpb24pO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGFNaXNzaW5nS2V5czogYW55W10gPSBbXTtcblx0dGFyZ2V0RW50aXR5VHlwZT8ua2V5cy5mb3JFYWNoKChrZXk6IGFueSkgPT4ge1xuXHRcdGlmIChrZXkubmFtZSAhPT0gXCJJc0FjdGl2ZUVudGl0eVwiKSB7XG5cdFx0XHRhTWlzc2luZ0tleXMucHVzaChwYXRoSW5Nb2RlbChrZXkubmFtZSwgdW5kZWZpbmVkKSk7XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gZm9ybWF0UmVzdWx0KFxuXHRcdFtcblx0XHRcdGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uLFxuXHRcdFx0cGF0aEluTW9kZWwoYGZpbHRlcmVkTWVzc2FnZXNgLCBcImludGVybmFsXCIpLFxuXHRcdFx0aXNEcmFmdFJvb3QgJiYgRW50aXR5Lkhhc0FjdGl2ZSxcblx0XHRcdGlzRHJhZnRSb290ICYmIEVudGl0eS5Jc0FjdGl2ZSxcblx0XHRcdGAke2lzRHJhZnRSb290fWAsXG5cdFx0XHQuLi5hTWlzc2luZ0tleXNcblx0XHRdLFxuXHRcdHRhYmxlRm9ybWF0dGVycy5yb3dIaWdobGlnaHRpbmcsXG5cdFx0dGFyZ2V0RW50aXR5VHlwZVxuXHQpO1xufVxuXG5mdW5jdGlvbiBfZ2V0Q3JlYXRpb25CZWhhdmlvdXIoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M6IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmdcbik6IFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb25bXCJjcmVhdGVcIl0ge1xuXHRjb25zdCBuYXZpZ2F0aW9uID0gbmF2aWdhdGlvblNldHRpbmdzPy5jcmVhdGUgfHwgbmF2aWdhdGlvblNldHRpbmdzPy5kZXRhaWw7XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RTZXR0aW5nczogVGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpO1xuXHRjb25zdCBvcmlnaW5hbFRhYmxlU2V0dGluZ3MgPSAodGFibGVNYW5pZmVzdFNldHRpbmdzICYmIHRhYmxlTWFuaWZlc3RTZXR0aW5ncy50YWJsZVNldHRpbmdzKSB8fCB7fTtcblx0Ly8gY3Jvc3MtYXBwXG5cdGlmIChuYXZpZ2F0aW9uPy5vdXRib3VuZCAmJiBuYXZpZ2F0aW9uLm91dGJvdW5kRGV0YWlsICYmIG5hdmlnYXRpb25TZXR0aW5ncz8uY3JlYXRlKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG1vZGU6IFwiRXh0ZXJuYWxcIixcblx0XHRcdG91dGJvdW5kOiBuYXZpZ2F0aW9uLm91dGJvdW5kLFxuXHRcdFx0b3V0Ym91bmREZXRhaWw6IG5hdmlnYXRpb24ub3V0Ym91bmREZXRhaWwsXG5cdFx0XHRuYXZpZ2F0aW9uU2V0dGluZ3M6IG5hdmlnYXRpb25TZXR0aW5nc1xuXHRcdH07XG5cdH1cblxuXHRsZXQgbmV3QWN0aW9uO1xuXHRpZiAobGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0Ly8gaW4tYXBwXG5cdFx0Y29uc3QgdGFyZ2V0QW5ub3RhdGlvbnMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpPy5hbm5vdGF0aW9ucztcblx0XHRjb25zdCB0YXJnZXRBbm5vdGF0aW9uc0NvbW1vbiA9IHRhcmdldEFubm90YXRpb25zPy5Db21tb24gYXMgRW50aXR5U2V0QW5ub3RhdGlvbnNfQ29tbW9uLFxuXHRcdFx0dGFyZ2V0QW5ub3RhdGlvbnNTZXNzaW9uID0gdGFyZ2V0QW5ub3RhdGlvbnM/LlNlc3Npb24gYXMgRW50aXR5U2V0QW5ub3RhdGlvbnNfU2Vzc2lvbjtcblx0XHRuZXdBY3Rpb24gPSB0YXJnZXRBbm5vdGF0aW9uc0NvbW1vbj8uRHJhZnRSb290Py5OZXdBY3Rpb24gfHwgdGFyZ2V0QW5ub3RhdGlvbnNTZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy5OZXdBY3Rpb247XG5cblx0XHRpZiAodGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cgJiYgbmV3QWN0aW9uKSB7XG5cdFx0XHQvLyBBIGNvbWJpbmF0aW9uIG9mICdDcmVhdGlvblJvdycgYW5kICdOZXdBY3Rpb24nIGRvZXMgbm90IG1ha2Ugc2Vuc2Vcblx0XHRcdHRocm93IEVycm9yKGBDcmVhdGlvbiBtb2RlICcke0NyZWF0aW9uTW9kZS5DcmVhdGlvblJvd30nIGNhbiBub3QgYmUgdXNlZCB3aXRoIGEgY3VzdG9tICduZXcnIGFjdGlvbiAoJHtuZXdBY3Rpb259KWApO1xuXHRcdH1cblx0XHRpZiAobmF2aWdhdGlvbj8ucm91dGUpIHtcblx0XHRcdC8vIHJvdXRlIHNwZWNpZmllZFxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bW9kZTogdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlLFxuXHRcdFx0XHRhcHBlbmQ6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0ZUF0RW5kLFxuXHRcdFx0XHRuZXdBY3Rpb246IG5ld0FjdGlvbj8udG9TdHJpbmcoKSxcblx0XHRcdFx0bmF2aWdhdGVUb1RhcmdldDogdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuTmV3UGFnZSA/IG5hdmlnYXRpb24ucm91dGUgOiB1bmRlZmluZWQgLy8gbmF2aWdhdGUgb25seSBpbiBOZXdQYWdlIG1vZGVcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0Ly8gbm8gbmF2aWdhdGlvbiBvciBubyByb3V0ZSBzcGVjaWZpZWQgLSBmYWxsYmFjayB0byBpbmxpbmUgY3JlYXRlIGlmIG9yaWdpbmFsIGNyZWF0aW9uIG1vZGUgd2FzICdOZXdQYWdlJ1xuXHRpZiAodGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuTmV3UGFnZSkge1xuXHRcdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0aW9uTW9kZSA9IENyZWF0aW9uTW9kZS5JbmxpbmU7XG5cdFx0Ly8gSW4gY2FzZSB0aGVyZSB3YXMgbm8gc3BlY2lmaWMgY29uZmlndXJhdGlvbiBmb3IgdGhlIGNyZWF0ZUF0RW5kIHdlIGZvcmNlIGl0IHRvIGZhbHNlXG5cdFx0aWYgKG9yaWdpbmFsVGFibGVTZXR0aW5ncy5jcmVhdGlvbk1vZGU/LmNyZWF0ZUF0RW5kID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0ZUF0RW5kID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRtb2RlOiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUsXG5cdFx0YXBwZW5kOiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGVBdEVuZCxcblx0XHRuZXdBY3Rpb246IG5ld0FjdGlvbj8udG9TdHJpbmcoKVxuXHR9O1xufVxuXG5jb25zdCBfZ2V0Um93Q29uZmlndXJhdGlvblByb3BlcnR5ID0gZnVuY3Rpb24gKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M6IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdHRhcmdldFBhdGg6IHN0cmluZyxcblx0dGFibGVUeXBlOiBUYWJsZVR5cGVcbikge1xuXHRsZXQgcHJlc3NQcm9wZXJ0eSwgbmF2aWdhdGlvblRhcmdldDtcblx0bGV0IGNyaXRpY2FsaXR5UHJvcGVydHk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxNZXNzYWdlVHlwZT4gPSBjb25zdGFudChNZXNzYWdlVHlwZS5Ob25lKTtcblx0Y29uc3QgdGFyZ2V0RW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRpZiAobmF2aWdhdGlvblNldHRpbmdzICYmIGxpbmVJdGVtQW5ub3RhdGlvbikge1xuXHRcdG5hdmlnYXRpb25UYXJnZXQgPSBuYXZpZ2F0aW9uU2V0dGluZ3MuZGlzcGxheT8udGFyZ2V0IHx8IG5hdmlnYXRpb25TZXR0aW5ncy5kZXRhaWw/Lm91dGJvdW5kO1xuXHRcdGlmIChuYXZpZ2F0aW9uVGFyZ2V0KSB7XG5cdFx0XHRwcmVzc1Byb3BlcnR5ID1cblx0XHRcdFx0XCIuaGFuZGxlcnMub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKCAkY29udHJvbGxlciAsJ1wiICsgbmF2aWdhdGlvblRhcmdldCArIFwiJywgJHskcGFyYW1ldGVycz5iaW5kaW5nQ29udGV4dH0pXCI7XG5cdFx0fSBlbHNlIGlmICh0YXJnZXRFbnRpdHlUeXBlKSB7XG5cdFx0XHRjb25zdCB0YXJnZXRFbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRcdFx0bmF2aWdhdGlvblRhcmdldCA9IG5hdmlnYXRpb25TZXR0aW5ncy5kZXRhaWw/LnJvdXRlO1xuXHRcdFx0aWYgKG5hdmlnYXRpb25UYXJnZXQgJiYgIU1vZGVsSGVscGVyLmlzU2luZ2xldG9uKHRhcmdldEVudGl0eVNldCkpIHtcblx0XHRcdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IGdldEhpZ2hsaWdodFJvd0JpbmRpbmcoXG5cdFx0XHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLmFubm90YXRpb25zPy5VST8uQ3JpdGljYWxpdHksXG5cdFx0XHRcdFx0ISFNb2RlbEhlbHBlci5nZXREcmFmdFJvb3QodGFyZ2V0RW50aXR5U2V0KSB8fCAhIU1vZGVsSGVscGVyLmdldERyYWZ0Tm9kZSh0YXJnZXRFbnRpdHlTZXQpLFxuXHRcdFx0XHRcdHRhcmdldEVudGl0eVR5cGVcblx0XHRcdFx0KTtcblx0XHRcdFx0cHJlc3NQcm9wZXJ0eSA9XG5cdFx0XHRcdFx0XCJBUEkub25UYWJsZVJvd1ByZXNzKCRldmVudCwgJGNvbnRyb2xsZXIsICR7JHBhcmFtZXRlcnM+YmluZGluZ0NvbnRleHR9LCB7IGNhbGxFeHRlbnNpb246IHRydWUsIHRhcmdldFBhdGg6ICdcIiArXG5cdFx0XHRcdFx0dGFyZ2V0UGF0aCArXG5cdFx0XHRcdFx0XCInLCBlZGl0YWJsZSA6IFwiICtcblx0XHRcdFx0XHQoTW9kZWxIZWxwZXIuZ2V0RHJhZnRSb290KHRhcmdldEVudGl0eVNldCkgfHwgTW9kZWxIZWxwZXIuZ2V0RHJhZnROb2RlKHRhcmdldEVudGl0eVNldClcblx0XHRcdFx0XHRcdD8gXCIhJHskcGFyYW1ldGVycz5iaW5kaW5nQ29udGV4dH0uZ2V0UHJvcGVydHkoJ0lzQWN0aXZlRW50aXR5JylcIlxuXHRcdFx0XHRcdFx0OiBcInVuZGVmaW5lZFwiKSArXG5cdFx0XHRcdFx0KHRhYmxlVHlwZSA9PT0gXCJBbmFseXRpY2FsVGFibGVcIiB8fCB0YWJsZVR5cGUgPT09IFwiVHJlZVRhYmxlXCIgPyBcIiwgYlJlY3JlYXRlQ29udGV4dDogdHJ1ZVwiIDogXCJcIikgK1xuXHRcdFx0XHRcdFwifSlcIjsgLy9OZWVkIHRvIGFjY2VzcyB0byBEcmFmdFJvb3QgYW5kIERyYWZ0Tm9kZSAhISEhISEhXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gZ2V0SGlnaGxpZ2h0Um93QmluZGluZyhsaW5lSXRlbUFubm90YXRpb24uYW5ub3RhdGlvbnM/LlVJPy5Dcml0aWNhbGl0eSwgZmFsc2UsIHRhcmdldEVudGl0eVR5cGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRjb25zdCByb3dOYXZpZ2F0ZWRFeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gPSBmb3JtYXRSZXN1bHQoXG5cdFx0W3BhdGhJbk1vZGVsKFwiL2RlZXBlc3RQYXRoXCIsIFwiaW50ZXJuYWxcIildLFxuXHRcdHRhYmxlRm9ybWF0dGVycy5uYXZpZ2F0ZWRSb3csXG5cdFx0dGFyZ2V0RW50aXR5VHlwZVxuXHQpO1xuXHRyZXR1cm4ge1xuXHRcdHByZXNzOiBwcmVzc1Byb3BlcnR5LFxuXHRcdGFjdGlvbjogcHJlc3NQcm9wZXJ0eSA/IFwiTmF2aWdhdGlvblwiIDogdW5kZWZpbmVkLFxuXHRcdHJvd0hpZ2hsaWdodGluZzogY29tcGlsZUV4cHJlc3Npb24oY3JpdGljYWxpdHlQcm9wZXJ0eSksXG5cdFx0cm93TmF2aWdhdGVkOiBjb21waWxlRXhwcmVzc2lvbihyb3dOYXZpZ2F0ZWRFeHByZXNzaW9uKSxcblx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoVUkuSXNJbmFjdGl2ZSkpXG5cdH07XG59O1xuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBjb2x1bW5zIGZyb20gdGhlIGVudGl0eVR5cGUuXG4gKlxuICogQHBhcmFtIGNvbHVtbnNUb0JlQ3JlYXRlZCBUaGUgY29sdW1ucyB0byBiZSBjcmVhdGVkLlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIHRhcmdldCBlbnRpdHkgdHlwZS5cbiAqIEBwYXJhbSBhbm5vdGF0aW9uQ29sdW1ucyBUaGUgYXJyYXkgb2YgY29sdW1ucyBjcmVhdGVkIGJhc2VkIG9uIExpbmVJdGVtIGFubm90YXRpb25zLlxuICogQHBhcmFtIG5vblNvcnRhYmxlQ29sdW1ucyBUaGUgYXJyYXkgb2YgYWxsIG5vbiBzb3J0YWJsZSBjb2x1bW4gbmFtZXMuXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHQuXG4gKiBAcGFyYW0gdGFibGVUeXBlIFRoZSB0YWJsZSB0eXBlLlxuICogQHBhcmFtIHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiBUaGUgYXJyYXkgb2YgY29sdW1ucyBmcm9tIGEgcHJvcGVydHkgdXNpbmcgYSB0ZXh0IGFubm90YXRpb24gd2l0aCB0ZXh0T25seSBhcyB0ZXh0IGFycmFuZ2VtZW50LlxuICogQHJldHVybnMgVGhlIGNvbHVtbiBmcm9tIHRoZSBlbnRpdHlUeXBlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDb2x1bW5zRnJvbUVudGl0eVR5cGUgPSBmdW5jdGlvbiAoXG5cdGNvbHVtbnNUb0JlQ3JlYXRlZDogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+LFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRhbm5vdGF0aW9uQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10gPSBbXSxcblx0bm9uU29ydGFibGVDb2x1bW5zOiBzdHJpbmdbXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dGFibGVUeXBlOiBUYWJsZVR5cGUsXG5cdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbjogc3RyaW5nW11cbik6IEFubm90YXRpb25UYWJsZUNvbHVtbltdIHtcblx0Y29uc3QgdGFibGVDb2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSA9IGFubm90YXRpb25Db2x1bW5zO1xuXHQvLyBDYXRjaCBhbHJlYWR5IGV4aXN0aW5nIGNvbHVtbnMgLSB3aGljaCB3ZXJlIGFkZGVkIGJlZm9yZSBieSBMaW5lSXRlbSBBbm5vdGF0aW9uc1xuXHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IFByb3BlcnR5KSA9PiB7XG5cdFx0Ly8gQ2F0Y2ggYWxyZWFkeSBleGlzdGluZyBjb2x1bW5zIC0gd2hpY2ggd2VyZSBhZGRlZCBiZWZvcmUgYnkgTGluZUl0ZW0gQW5ub3RhdGlvbnNcblx0XHRjb25zdCBleGlzdHMgPSBhbm5vdGF0aW9uQ29sdW1ucy5zb21lKChjb2x1bW4pID0+IHtcblx0XHRcdHJldHVybiBjb2x1bW4ubmFtZSA9PT0gcHJvcGVydHkubmFtZTtcblx0XHR9KTtcblxuXHRcdC8vIGlmIHRhcmdldCB0eXBlIGV4aXN0cywgaXQgaXMgYSBjb21wbGV4IHByb3BlcnR5IGFuZCBzaG91bGQgYmUgaWdub3JlZFxuXHRcdGlmICghcHJvcGVydHkudGFyZ2V0VHlwZSAmJiAhZXhpc3RzKSB7XG5cdFx0XHRjb25zdCByZWxhdGVkUHJvcGVydGllc0luZm86IENvbXBsZXhQcm9wZXJ0eUluZm8gPSBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoXG5cdFx0XHRcdHByb3BlcnR5Lm5hbWUsXG5cdFx0XHRcdHByb3BlcnR5LFxuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHR0YWJsZVR5cGVcblx0XHRcdCk7XG5cdFx0XHRjb25zdCByZWxhdGVkUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8ucHJvcGVydGllcyk7XG5cdFx0XHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8uYWRkaXRpb25hbFByb3BlcnRpZXMpO1xuXHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby50ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHQvLyBJbmNsdWRlIHRleHQgcHJvcGVydGllcyBmb3VuZCBkdXJpbmcgYW5hbHlzaXMgb24gZ2V0Q29sdW1uc0Zyb21Bbm5vdGF0aW9uc1xuXHRcdFx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb24ucHVzaCguLi5yZWxhdGVkUHJvcGVydGllc0luZm8udGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGNvbHVtbkluZm8gPSBnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5KFxuXHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKHByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdHByb3BlcnR5Lm5hbWUsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdG5vblNvcnRhYmxlQ29sdW1ucyxcblx0XHRcdFx0YWdncmVnYXRpb25IZWxwZXIsXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvblxuXHRcdFx0KTtcblxuXHRcdFx0Y29uc3Qgc2VtYW50aWNLZXlzID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcIkNvbW1vblwiLCBDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNLZXksIFtcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKClcblx0XHRcdF0pWzBdO1xuXHRcdFx0Y29uc3Qgb0NvbHVtbkRyYWZ0SW5kaWNhdG9yID0gZ2V0RGVmYXVsdERyYWZ0SW5kaWNhdG9yRm9yQ29sdW1uKGNvbHVtbkluZm8ubmFtZSwgc2VtYW50aWNLZXlzLCBmYWxzZSwgbnVsbCk7XG5cdFx0XHRpZiAoT2JqZWN0LmtleXMob0NvbHVtbkRyYWZ0SW5kaWNhdG9yKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbHVtbkluZm8uZm9ybWF0T3B0aW9ucyA9IHtcblx0XHRcdFx0XHQuLi5vQ29sdW1uRHJhZnRJbmRpY2F0b3Jcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdGlmIChyZWxhdGVkUHJvcGVydHlOYW1lcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbHVtbkluZm8ucHJvcGVydHlJbmZvcyA9IHJlbGF0ZWRQcm9wZXJ0eU5hbWVzO1xuXHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzID0ge1xuXHRcdFx0XHRcdC4uLmNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MsXG5cdFx0XHRcdFx0dGVtcGxhdGU6IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRTZXR0aW5nc1RlbXBsYXRlLFxuXHRcdFx0XHRcdHdyYXA6IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRTZXR0aW5nc1dyYXBwaW5nXG5cdFx0XHRcdH07XG5cdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudHlwZSA9IF9nZXRFeHBvcnREYXRhVHlwZShwcm9wZXJ0eS50eXBlLCByZWxhdGVkUHJvcGVydHlOYW1lcy5sZW5ndGggPiAxKTtcblxuXHRcdFx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXROYW1lKSB7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy51bml0UHJvcGVydHkgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VW5pdE5hbWU7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy50eXBlID0gXCJDdXJyZW5jeVwiOyAvLyBGb3JjZSB0byBhIGN1cnJlbmN5IGJlY2F1c2UgdGhlcmUncyBhIHVuaXRQcm9wZXJ0eSAob3RoZXJ3aXNlIHRoZSB2YWx1ZSBpc24ndCBwcm9wZXJseSBmb3JtYXR0ZWQgd2hlbiBleHBvcnRlZClcblx0XHRcdFx0fSBlbHNlIGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VW5pdFN0cmluZykge1xuXHRcdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudW5pdCA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0U3RyaW5nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVOYW1lKSB7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy50aW1lem9uZVByb3BlcnR5ID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFRpbWV6b25lTmFtZTtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnV0YyA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZVN0cmluZykge1xuXHRcdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudGltZXpvbmUgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVTdHJpbmc7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSkge1xuXHRcdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWU7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy50eXBlID0gXCJTdHJpbmdcIjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENvbGxlY3QgaW5mb3JtYXRpb24gb2YgcmVsYXRlZCBjb2x1bW5zIHRvIGJlIGNyZWF0ZWQuXG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcblx0XHRcdFx0XHRjb2x1bW5zVG9CZUNyZWF0ZWRbbmFtZV0gPSByZWxhdGVkUHJvcGVydGllc0luZm8ucHJvcGVydGllc1tuYW1lXTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhZGRpdGlvbmFsUHJvcGVydHlOYW1lcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbHVtbkluZm8uYWRkaXRpb25hbFByb3BlcnR5SW5mb3MgPSBhZGRpdGlvbmFsUHJvcGVydHlOYW1lcztcblx0XHRcdFx0Ly8gQ3JlYXRlIGNvbHVtbnMgZm9yIGFkZGl0aW9uYWwgcHJvcGVydGllcyBpZGVudGlmaWVkIGZvciBBTFAgdXNlIGNhc2UuXG5cdFx0XHRcdGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcblx0XHRcdFx0XHQvLyBJbnRlbnRpb25hbCBvdmVyd3JpdGUgYXMgd2UgcmVxdWlyZSBvbmx5IG9uZSBuZXcgUHJvcGVydHlJbmZvIGZvciBhIHJlbGF0ZWQgUHJvcGVydHkuXG5cdFx0XHRcdFx0Y29sdW1uc1RvQmVDcmVhdGVkW25hbWVdID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmFkZGl0aW9uYWxQcm9wZXJ0aWVzW25hbWVdO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHRhYmxlQ29sdW1ucy5wdXNoKGNvbHVtbkluZm8pO1xuXHRcdH1cblx0XHQvLyBJbiBjYXNlIGEgcHJvcGVydHkgaGFzIGRlZmluZWQgYSAjVGV4dE9ubHkgdGV4dCBhcnJhbmdlbWVudCBkb24ndCBvbmx5IGNyZWF0ZSB0aGUgY29tcGxleCBwcm9wZXJ0eSB3aXRoIHRoZSB0ZXh0IHByb3BlcnR5IGFzIGEgY2hpbGQgcHJvcGVydHksXG5cdFx0Ly8gYnV0IGFsc28gdGhlIHByb3BlcnR5IGl0c2VsZiBhcyBpdCBjYW4gYmUgdXNlZCBhcyB3aXRoaW4gdGhlIHNvcnRDb25kaXRpb25zIG9yIG9uIGN1c3RvbSBjb2x1bW5zLlxuXHRcdC8vIFRoaXMgc3RlcCBtdXN0IGJlIHZhbGlkZSBhbHNvIGZyb20gdGhlIGNvbHVtbnMgYWRkZWQgdmlhIExpbmVJdGVtcyBvciBmcm9tIGEgY29sdW1uIGF2YWlsYWJsZSBvbiB0aGUgcDEzbi5cblx0XHRpZiAoZ2V0RGlzcGxheU1vZGUocHJvcGVydHkpID09PSBcIkRlc2NyaXB0aW9uXCIpIHtcblx0XHRcdG5vblNvcnRhYmxlQ29sdW1ucyA9IG5vblNvcnRhYmxlQ29sdW1ucy5jb25jYXQocHJvcGVydHkubmFtZSk7XG5cdFx0XHR0YWJsZUNvbHVtbnMucHVzaChcblx0XHRcdFx0Z2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eShcblx0XHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgocHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0XHRwcm9wZXJ0eS5uYW1lLFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdG5vblNvcnRhYmxlQ29sdW1ucyxcblx0XHRcdFx0XHRhZ2dyZWdhdGlvbkhlbHBlcixcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFtdXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBDcmVhdGUgYSBwcm9wZXJ0eUluZm8gZm9yIGVhY2ggcmVsYXRlZCBwcm9wZXJ0eS5cblx0Y29uc3QgcmVsYXRlZENvbHVtbnMgPSBfY3JlYXRlUmVsYXRlZENvbHVtbnMoXG5cdFx0Y29sdW1uc1RvQmVDcmVhdGVkLFxuXHRcdHRhYmxlQ29sdW1ucyxcblx0XHRub25Tb3J0YWJsZUNvbHVtbnMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRlbnRpdHlUeXBlLFxuXHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvblxuXHQpO1xuXG5cdHJldHVybiB0YWJsZUNvbHVtbnMuY29uY2F0KHJlbGF0ZWRDb2x1bW5zKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgY29sdW1uIGRlZmluaXRpb24gZnJvbSBhIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBFbnRpdHkgdHlwZSBwcm9wZXJ0eSBmb3Igd2hpY2ggdGhlIGNvbHVtbiBpcyBjcmVhdGVkXG4gKiBAcGFyYW0gZnVsbFByb3BlcnR5UGF0aCBUaGUgZnVsbCBwYXRoIHRvIHRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEBwYXJhbSByZWxhdGl2ZVBhdGggVGhlIHJlbGF0aXZlIHBhdGggdG8gdGhlIHRhcmdldCBwcm9wZXJ0eSBiYXNlZCBvbiB0aGUgY29udGV4dFxuICogQHBhcmFtIHVzZURhdGFGaWVsZFByZWZpeCBTaG91bGQgYmUgcHJlZml4ZWQgd2l0aCBcIkRhdGFGaWVsZDo6XCIsIGVsc2UgaXQgd2lsbCBiZSBwcmVmaXhlZCB3aXRoIFwiUHJvcGVydHk6OlwiXG4gKiBAcGFyYW0gYXZhaWxhYmxlRm9yQWRhcHRhdGlvbiBEZWNpZGVzIHdoZXRoZXIgdGhlIGNvbHVtbiBzaG91bGQgYmUgYXZhaWxhYmxlIGZvciBhZGFwdGF0aW9uXG4gKiBAcGFyYW0gbm9uU29ydGFibGVDb2x1bW5zIFRoZSBhcnJheSBvZiBhbGwgbm9uLXNvcnRhYmxlIGNvbHVtbiBuYW1lc1xuICogQHBhcmFtIGFnZ3JlZ2F0aW9uSGVscGVyIFRoZSBhZ2dyZWdhdGlvbkhlbHBlciBmb3IgdGhlIGVudGl0eVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gdGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uIFRoZSBhcnJheSBvZiBjb2x1bW5zIGZyb20gYSBwcm9wZXJ0eSB1c2luZyBhIHRleHQgYW5ub3RhdGlvbiB3aXRoIHRleHRPbmx5IGFzIHRleHQgYXJyYW5nZW1lbnQuXG4gKiBAcmV0dXJucyBUaGUgYW5ub3RhdGlvbiBjb2x1bW4gZGVmaW5pdGlvblxuICovXG5jb25zdCBnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5ID0gZnVuY3Rpb24gKFxuXHRwcm9wZXJ0eTogUHJvcGVydHksXG5cdGZ1bGxQcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0cmVsYXRpdmVQYXRoOiBzdHJpbmcsXG5cdHVzZURhdGFGaWVsZFByZWZpeDogYm9vbGVhbixcblx0YXZhaWxhYmxlRm9yQWRhcHRhdGlvbjogYm9vbGVhbixcblx0bm9uU29ydGFibGVDb2x1bW5zOiBzdHJpbmdbXSxcblx0YWdncmVnYXRpb25IZWxwZXI6IEFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb246IHN0cmluZ1tdXG4pOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4ge1xuXHRjb25zdCBuYW1lID0gdXNlRGF0YUZpZWxkUHJlZml4ID8gcmVsYXRpdmVQYXRoIDogYFByb3BlcnR5Ojoke3JlbGF0aXZlUGF0aH1gO1xuXHRjb25zdCBrZXkgPSAodXNlRGF0YUZpZWxkUHJlZml4ID8gXCJEYXRhRmllbGQ6OlwiIDogXCJQcm9wZXJ0eTo6XCIpICsgcmVwbGFjZVNwZWNpYWxDaGFycyhyZWxhdGl2ZVBhdGgpO1xuXHRjb25zdCBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoID0gZ2V0U2VtYW50aWNPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQsIHByb3BlcnR5KTtcblx0Y29uc3QgaXNIaWRkZW4gPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpID09PSB0cnVlO1xuXHRjb25zdCBncm91cFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHByb3BlcnR5Lm5hbWUgPyBfc2xpY2VBdFNsYXNoKHByb3BlcnR5Lm5hbWUsIHRydWUsIGZhbHNlKSA6IHVuZGVmaW5lZDtcblx0Y29uc3QgaXNHcm91cDogYm9vbGVhbiA9IGdyb3VwUGF0aCAhPSBwcm9wZXJ0eS5uYW1lO1xuXHRjb25zdCBleHBvcnRUeXBlOiBzdHJpbmcgPSBfZ2V0RXhwb3J0RGF0YVR5cGUocHJvcGVydHkudHlwZSk7XG5cdGNvbnN0IHNEYXRlSW5wdXRGb3JtYXQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHByb3BlcnR5LnR5cGUgPT09IFwiRWRtLkRhdGVcIiA/IFwiWVlZWS1NTS1ERFwiIDogdW5kZWZpbmVkO1xuXHRjb25zdCBkYXRhVHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gZ2V0RGF0YUZpZWxkRGF0YVR5cGUocHJvcGVydHkpO1xuXHRjb25zdCBwcm9wZXJ0eVR5cGVDb25maWcgPSBnZXRUeXBlQ29uZmlnKHByb3BlcnR5LCBkYXRhVHlwZSk7XG5cdGNvbnN0IHNlbWFudGljS2V5czogU2VtYW50aWNLZXkgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25zQnlUZXJtKFwiQ29tbW9uXCIsIENvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY0tleSwgW1xuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpXG5cdF0pWzBdO1xuXHRjb25zdCBpc0FQcm9wZXJ0eUZyb21UZXh0T25seUFubm90YXRpb24gPVxuXHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiAmJiB0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb24uaW5kZXhPZihyZWxhdGl2ZVBhdGgpID49IDA7XG5cdGNvbnN0IHNvcnRhYmxlID0gKCFpc0hpZGRlbiB8fCBpc0FQcm9wZXJ0eUZyb21UZXh0T25seUFubm90YXRpb24pICYmIG5vblNvcnRhYmxlQ29sdW1ucy5pbmRleE9mKHJlbGF0aXZlUGF0aCkgPT09IC0xO1xuXHRjb25zdCB0eXBlQ29uZmlnID0ge1xuXHRcdGNsYXNzTmFtZTogcHJvcGVydHkudHlwZSB8fCBkYXRhVHlwZSxcblx0XHRmb3JtYXRPcHRpb25zOiBwcm9wZXJ0eVR5cGVDb25maWcuZm9ybWF0T3B0aW9ucyxcblx0XHRjb25zdHJhaW50czogcHJvcGVydHlUeXBlQ29uZmlnLmNvbnN0cmFpbnRzXG5cdH07XG5cdGxldCBleHBvcnRTZXR0aW5nczogZXhwb3J0U2V0dGluZ3MgfCBudWxsID0gbnVsbDtcblx0aWYgKF9pc0V4cG9ydGFibGVDb2x1bW4ocHJvcGVydHkpKSB7XG5cdFx0Y29uc3QgdW5pdFByb3BlcnR5ID0gZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkocHJvcGVydHkpIHx8IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkocHJvcGVydHkpO1xuXHRcdGNvbnN0IHRpbWV6b25lUHJvcGVydHkgPSBnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eShwcm9wZXJ0eSk7XG5cdFx0Y29uc3QgdW5pdFRleHQgPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5IHx8IHByb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdDtcblx0XHRjb25zdCB0aW1lem9uZVRleHQgPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZTtcblxuXHRcdGV4cG9ydFNldHRpbmdzID0ge1xuXHRcdFx0dHlwZTogZXhwb3J0VHlwZSxcblx0XHRcdGlucHV0Rm9ybWF0OiBzRGF0ZUlucHV0Rm9ybWF0LFxuXHRcdFx0c2NhbGU6IHByb3BlcnR5LnNjYWxlLFxuXHRcdFx0ZGVsaW1pdGVyOiBwcm9wZXJ0eS50eXBlID09PSBcIkVkbS5JbnQ2NFwiXG5cdFx0fTtcblxuXHRcdGlmICh1bml0UHJvcGVydHkpIHtcblx0XHRcdGV4cG9ydFNldHRpbmdzLnVuaXRQcm9wZXJ0eSA9IHVuaXRQcm9wZXJ0eS5uYW1lO1xuXHRcdFx0ZXhwb3J0U2V0dGluZ3MudHlwZSA9IFwiQ3VycmVuY3lcIjsgLy8gRm9yY2UgdG8gYSBjdXJyZW5jeSBiZWNhdXNlIHRoZXJlJ3MgYSB1bml0UHJvcGVydHkgKG90aGVyd2lzZSB0aGUgdmFsdWUgaXNuJ3QgcHJvcGVybHkgZm9ybWF0dGVkIHdoZW4gZXhwb3J0ZWQpXG5cdFx0fSBlbHNlIGlmICh1bml0VGV4dCkge1xuXHRcdFx0ZXhwb3J0U2V0dGluZ3MudW5pdCA9IGAke3VuaXRUZXh0fWA7XG5cdFx0fVxuXHRcdGlmICh0aW1lem9uZVByb3BlcnR5KSB7XG5cdFx0XHRleHBvcnRTZXR0aW5ncy50aW1lem9uZVByb3BlcnR5ID0gdGltZXpvbmVQcm9wZXJ0eS5uYW1lO1xuXHRcdFx0ZXhwb3J0U2V0dGluZ3MudXRjID0gZmFsc2U7XG5cdFx0fSBlbHNlIGlmICh0aW1lem9uZVRleHQpIHtcblx0XHRcdGV4cG9ydFNldHRpbmdzLnRpbWV6b25lID0gdGltZXpvbmVUZXh0LnRvU3RyaW5nKCk7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgY29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IF9nZXRDb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHMocmVsYXRpdmVQYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRjb25zdCBjb2x1bW46IEFubm90YXRpb25UYWJsZUNvbHVtbiA9IHtcblx0XHRrZXk6IGtleSxcblx0XHR0eXBlOiBDb2x1bW5UeXBlLkFubm90YXRpb24sXG5cdFx0bGFiZWw6IGdldExhYmVsKHByb3BlcnR5LCBpc0dyb3VwKSxcblx0XHRncm91cExhYmVsOiBpc0dyb3VwID8gZ2V0TGFiZWwocHJvcGVydHkpIDogdW5kZWZpbmVkLFxuXHRcdGdyb3VwOiBpc0dyb3VwID8gZ3JvdXBQYXRoIDogdW5kZWZpbmVkLFxuXHRcdGFubm90YXRpb25QYXRoOiBmdWxsUHJvcGVydHlQYXRoLFxuXHRcdHNlbWFudGljT2JqZWN0UGF0aDogc2VtYW50aWNPYmplY3RBbm5vdGF0aW9uUGF0aCxcblx0XHRhdmFpbGFiaWxpdHk6ICFhdmFpbGFibGVGb3JBZGFwdGF0aW9uIHx8IGlzSGlkZGVuID8gQXZhaWxhYmlsaXR5VHlwZS5IaWRkZW4gOiBBdmFpbGFiaWxpdHlUeXBlLkFkYXB0YXRpb24sXG5cdFx0bmFtZTogbmFtZSxcblx0XHRyZWxhdGl2ZVBhdGg6IHJlbGF0aXZlUGF0aCxcblx0XHRzb3J0YWJsZTogc29ydGFibGUsXG5cdFx0aXNHcm91cGFibGU6IGFnZ3JlZ2F0aW9uSGVscGVyLmlzQW5hbHl0aWNzU3VwcG9ydGVkKCkgPyAhIWFnZ3JlZ2F0aW9uSGVscGVyLmlzUHJvcGVydHlHcm91cGFibGUocHJvcGVydHkpIDogc29ydGFibGUsXG5cdFx0aXNLZXk6IHByb3BlcnR5LmlzS2V5LFxuXHRcdGV4cG9ydFNldHRpbmdzOiBleHBvcnRTZXR0aW5ncyxcblx0XHRjYXNlU2Vuc2l0aXZlOiBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dCksXG5cdFx0dHlwZUNvbmZpZzogdHlwZUNvbmZpZyBhcyBjb25maWdUeXBlLFxuXHRcdGltcG9ydGFuY2U6IGdldEltcG9ydGFuY2UoKHByb3BlcnR5IGFzIGFueSkuYW5ub3RhdGlvbnM/LlVJPy5EYXRhRmllbGREZWZhdWx0LCBzZW1hbnRpY0tleXMpLFxuXHRcdGFkZGl0aW9uYWxMYWJlbHM6IGNvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVsc1xuXHR9O1xuXHRjb25zdCBzVG9vbHRpcCA9IF9nZXRUb29sdGlwKHByb3BlcnR5KTtcblx0aWYgKHNUb29sdGlwKSB7XG5cdFx0Y29sdW1uLnRvb2x0aXAgPSBzVG9vbHRpcDtcblx0fVxuXHRjb25zdCB0YXJnZXRWYWx1ZWZyb21EUCA9IGdldFRhcmdldFZhbHVlT25EYXRhUG9pbnQocHJvcGVydHkpO1xuXHRpZiAoaXNEYXRhUG9pbnRGcm9tRGF0YUZpZWxkRGVmYXVsdChwcm9wZXJ0eSkgJiYgdHlwZW9mIHRhcmdldFZhbHVlZnJvbURQID09PSBcInN0cmluZ1wiICYmIGNvbHVtbi5leHBvcnRTZXR0aW5ncykge1xuXHRcdGNvbHVtbi5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSA9IHRhcmdldFZhbHVlZnJvbURQO1xuXHRcdGNvbHVtbi5leHBvcnRTZXR0aW5ncy50ZW1wbGF0ZSA9IFwiezB9L1wiICsgdGFyZ2V0VmFsdWVmcm9tRFA7XG5cdH1cblx0cmV0dXJuIGNvbHVtbjtcbn07XG5cbi8qKlxuICogUmV0dXJucyBCb29sZWFuIHRydWUgZm9yIGV4cG9ydGFibGUgY29sdW1ucywgZmFsc2UgZm9yIG5vbiBleHBvcnRhYmxlIGNvbHVtbnMuXG4gKlxuICogQHBhcmFtIHNvdXJjZSBUaGUgZGF0YUZpZWxkIG9yIHByb3BlcnR5IHRvIGJlIGV2YWx1YXRlZFxuICogQHJldHVybnMgVHJ1ZSBmb3IgZXhwb3J0YWJsZSBjb2x1bW4sIGZhbHNlIGZvciBub24gZXhwb3J0YWJsZSBjb2x1bW5cbiAqIEBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gX2lzRXhwb3J0YWJsZUNvbHVtbihzb3VyY2U6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRsZXQgcHJvcGVydHlUeXBlLCBwcm9wZXJ0eTtcblx0Y29uc3QgZGF0YUZpZWxkRGVmYXVsdFByb3BlcnR5ID0gKHNvdXJjZSBhcyBQcm9wZXJ0eSkuYW5ub3RhdGlvbnMuVUk/LkRhdGFGaWVsZERlZmF1bHQ7XG5cdGlmIChpc1Byb3BlcnR5KHNvdXJjZSkgJiYgZGF0YUZpZWxkRGVmYXVsdFByb3BlcnR5Py4kVHlwZSkge1xuXHRcdGlmIChpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihkYXRhRmllbGREZWZhdWx0UHJvcGVydHkpID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHByb3BlcnR5VHlwZSA9IGRhdGFGaWVsZERlZmF1bHRQcm9wZXJ0eT8uJFR5cGU7XG5cdH0gZWxzZSBpZiAoaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4oc291cmNlIGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXMpID09PSB0cnVlKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdHByb3BlcnR5ID0gc291cmNlIGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXM7XG5cdFx0cHJvcGVydHlUeXBlID0gcHJvcGVydHkuJFR5cGU7XG5cdFx0aWYgKHByb3BlcnR5VHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJiAocHJvcGVydHkgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSkge1xuXHRcdFx0Ly9Gb3IgQ2hhcnRcblx0XHRcdHByb3BlcnR5VHlwZSA9IChwcm9wZXJ0eSBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlO1xuXHRcdFx0cmV0dXJuIFVJQW5ub3RhdGlvblR5cGVzLkNoYXJ0RGVmaW5pdGlvblR5cGUuaW5kZXhPZihwcm9wZXJ0eVR5cGUpID09PSAtMTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0KHByb3BlcnR5IGFzIERhdGFGaWVsZCkuVmFsdWU/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db3JlPy5NZWRpYVR5cGU/LnRlcm0gPT09IFwiT3JnLk9EYXRhLkNvcmUuVjEuTWVkaWFUeXBlXCIgJiZcblx0XHRcdChwcm9wZXJ0eSBhcyBEYXRhRmllbGQpLlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29yZT8uaXNVUkwgIT09IHRydWVcblx0XHQpIHtcblx0XHRcdC8vRm9yIFN0cmVhbVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcHJvcGVydHlUeXBlXG5cdFx0PyBbXG5cdFx0XHRcdFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0VUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRcdFx0XHRVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb25Hcm91cFxuXHRcdCAgXS5pbmRleE9mKHByb3BlcnR5VHlwZSkgPT09IC0xXG5cdFx0OiB0cnVlO1xufVxuXG4vKipcbiAqIFJldHVybnMgQm9vbGVhbiB0cnVlIGZvciB2YWxpZCBjb2x1bW5zLCBmYWxzZSBmb3IgaW52YWxpZCBjb2x1bW5zLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGlmZmVyZW50IERhdGFGaWVsZCB0eXBlcyBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHJldHVybnMgVHJ1ZSBmb3IgdmFsaWQgY29sdW1ucywgZmFsc2UgZm9yIGludmFsaWQgY29sdW1uc1xuICogQHByaXZhdGVcbiAqL1xuY29uc3QgX2lzVmFsaWRDb2x1bW4gPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSB7XG5cdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRyZXR1cm4gISFkYXRhRmllbGQuSW5saW5lO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGRlZmF1bHQ6XG5cdFx0Ly8gVG9kbzogUmVwbGFjZSB3aXRoIHByb3BlciBMb2cgc3RhdGVtZW50IG9uY2UgYXZhaWxhYmxlXG5cdFx0Ly8gIHRocm93IG5ldyBFcnJvcihcIlVuaGFuZGxlZCBEYXRhRmllbGQgQWJzdHJhY3QgdHlwZTogXCIgKyBkYXRhRmllbGQuJFR5cGUpO1xuXHR9XG59O1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gZXZhbHVhdGUgdGhlIHZpc2liaWxpdHkgb2YgYSBEYXRhRmllbGQgb3IgRGF0YVBvaW50IGFubm90YXRpb24uXG4gKlxuICogU0FQIEZpb3JpIGVsZW1lbnRzIHdpbGwgZXZhbHVhdGUgZWl0aGVyIHRoZSBVSS5IaWRkZW4gYW5ub3RhdGlvbiBkZWZpbmVkIG9uIHRoZSBhbm5vdGF0aW9uIGl0c2VsZiBvciBvbiB0aGUgdGFyZ2V0IHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRNb2RlbFBhdGggVGhlIG1ldGFwYXRoIHJlZmVycmluZyB0byB0aGUgYW5ub3RhdGlvbiB0aGF0IGlzIGV2YWx1YXRlZCBieSBTQVAgRmlvcmkgZWxlbWVudHMuXG4gKiBAcGFyYW0gW2Zvcm1hdE9wdGlvbnNdIEZvcm1hdE9wdGlvbnMgb3B0aW9uYWwuXG4gKiBAcGFyYW0gZm9ybWF0T3B0aW9ucy5pc0FuYWx5dGljcyBUaGlzIGZsYWcgaXMgdXNlZCB0byBjaGVjayBpZiB0aGUgYW5hbHl0aWMgdGFibGUgaGFzIEdyb3VwSGVhZGVyIGV4cGFuZGVkLlxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiB0aGF0IHlvdSBjYW4gYmluZCB0byB0aGUgVUkuXG4gKi9cbmV4cG9ydCBjb25zdCBfZ2V0VmlzaWJsZUV4cHJlc3Npb24gPSBmdW5jdGlvbiAoXG5cdGRhdGFGaWVsZE1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0Zm9ybWF0T3B0aW9ucz86IGFueVxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4ge1xuXHRjb25zdCB0YXJnZXRPYmplY3Q6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBEYXRhUG9pbnRUeXBlVHlwZXMgPSBkYXRhRmllbGRNb2RlbFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRsZXQgcHJvcGVydHlWYWx1ZTtcblx0aWYgKHRhcmdldE9iamVjdCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0T2JqZWN0LiRUeXBlKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdGFyZ2V0T2JqZWN0LlZhbHVlLiR0YXJnZXQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0XHQvLyBpZiBpdCBpcyBhIERhdGFGaWVsZEZvckFubm90YXRpb24gcG9pbnRpbmcgdG8gYSBEYXRhUG9pbnQgd2UgbG9vayBhdCB0aGUgZGF0YVBvaW50J3MgdmFsdWVcblx0XHRcdFx0aWYgKHRhcmdldE9iamVjdD8uVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZSkge1xuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWUgPSB0YXJnZXRPYmplY3QuVGFyZ2V0LiR0YXJnZXQ/LlZhbHVlLiR0YXJnZXQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cHJvcGVydHlWYWx1ZSA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblx0Y29uc3QgaXNBbmFseXRpY2FsR3JvdXBIZWFkZXJFeHBhbmRlZCA9IGZvcm1hdE9wdGlvbnM/LmlzQW5hbHl0aWNzID8gVUkuSXNFeHBhbmRlZCA6IGNvbnN0YW50KGZhbHNlKTtcblx0Y29uc3QgaXNBbmFseXRpY2FsTGVhZiA9IGZvcm1hdE9wdGlvbnM/LmlzQW5hbHl0aWNzID8gZXF1YWwoVUkuTm9kZUxldmVsLCAwKSA6IGNvbnN0YW50KGZhbHNlKTtcblxuXHQvLyBBIGRhdGEgZmllbGQgaXMgdmlzaWJsZSBpZjpcblx0Ly8gLSB0aGUgVUkuSGlkZGVuIGV4cHJlc3Npb24gaW4gdGhlIG9yaWdpbmFsIGFubm90YXRpb24gZG9lcyBub3QgZXZhbHVhdGUgdG8gJ3RydWUnXG5cdC8vIC0gdGhlIFVJLkhpZGRlbiBleHByZXNzaW9uIGluIHRoZSB0YXJnZXQgcHJvcGVydHkgZG9lcyBub3QgZXZhbHVhdGUgdG8gJ3RydWUnXG5cdC8vIC0gaW4gY2FzZSBvZiBBbmFseXRpY3MgaXQncyBub3QgdmlzaWJsZSBmb3IgYW4gZXhwYW5kZWQgR3JvdXBIZWFkZXJcblx0cmV0dXJuIGFuZChcblx0XHQuLi5bXG5cdFx0XHRub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pLCB0cnVlKSksXG5cdFx0XHRpZkVsc2UoXG5cdFx0XHRcdCEhcHJvcGVydHlWYWx1ZSxcblx0XHRcdFx0cHJvcGVydHlWYWx1ZSAmJiBub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5VmFsdWUuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pLCB0cnVlKSksXG5cdFx0XHRcdHRydWVcblx0XHRcdCksXG5cdFx0XHRvcihub3QoaXNBbmFseXRpY2FsR3JvdXBIZWFkZXJFeHBhbmRlZCksIGlzQW5hbHl0aWNhbExlYWYpXG5cdFx0XVxuXHQpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGhpZGRlbiBiaW5kaW5nIGV4cHJlc3Npb25zIGZvciBhIGZpZWxkIGdyb3VwLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRHcm91cCBEYXRhRmllbGQgZGVmaW5lZCBpbiB0aGUgYW5ub3RhdGlvbnNcbiAqIEBwYXJhbSBmaWVsZEZvcm1hdE9wdGlvbnMgRm9ybWF0T3B0aW9ucyBvcHRpb25hbC5cbiAqIEByZXR1cm5zIENvbXBpbGUgYmluZGluZyBvZiBmaWVsZCBncm91cCBleHByZXNzaW9ucy5cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IF9nZXRGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMgPSBmdW5jdGlvbiAoXG5cdGRhdGFGaWVsZEdyb3VwOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IGFueVxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCB1bmRlZmluZWQge1xuXHRjb25zdCBmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+W10gPSBbXTtcblx0aWYgKFxuXHRcdGRhdGFGaWVsZEdyb3VwLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0ZGF0YUZpZWxkR3JvdXAuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRmllbGRHcm91cFR5cGVcblx0KSB7XG5cdFx0aWYgKGRhdGFGaWVsZEdyb3VwPy5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbikge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkR3JvdXAuYW5ub3RhdGlvbnMuVUkuSGlkZGVuKSwgdHJ1ZSkpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGF0YUZpZWxkR3JvdXAuVGFyZ2V0LiR0YXJnZXQuRGF0YT8uZm9yRWFjaCgoaW5uZXJEYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBEYXRhUG9pbnRUeXBlVHlwZXMpID0+IHtcblx0XHRcdFx0ZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zLnB1c2goXG5cdFx0XHRcdFx0X2dldFZpc2libGVFeHByZXNzaW9uKHsgdGFyZ2V0T2JqZWN0OiBpbm5lckRhdGFGaWVsZCB9IGFzIERhdGFNb2RlbE9iamVjdFBhdGgsIGZpZWxkRm9ybWF0T3B0aW9ucylcblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShvciguLi5maWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMpLCBjb25zdGFudCh0cnVlKSwgY29uc3RhbnQoZmFsc2UpKSk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGFiZWwgZm9yIHRoZSBwcm9wZXJ0eSBhbmQgZGF0YUZpZWxkLlxuICpcbiAqIEBwYXJhbSBbcHJvcGVydHldIFByb3BlcnR5LCBEYXRhRmllbGQgb3IgTmF2aWdhdGlvbiBQcm9wZXJ0eSBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHBhcmFtIGlzR3JvdXBcbiAqIEByZXR1cm5zIExhYmVsIG9mIHRoZSBwcm9wZXJ0eSBvciBEYXRhRmllbGRcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGdldExhYmVsID0gZnVuY3Rpb24gKHByb3BlcnR5OiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHksIGlzR3JvdXAgPSBmYWxzZSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmICghcHJvcGVydHkpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGlmIChpc1Byb3BlcnR5KHByb3BlcnR5KSB8fCBpc05hdmlnYXRpb25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcblx0XHRjb25zdCBkYXRhRmllbGREZWZhdWx0ID0gKHByb3BlcnR5IGFzIFByb3BlcnR5KS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQ7XG5cdFx0aWYgKGRhdGFGaWVsZERlZmF1bHQgJiYgIWRhdGFGaWVsZERlZmF1bHQucXVhbGlmaWVyICYmIGRhdGFGaWVsZERlZmF1bHQuTGFiZWw/LnZhbHVlT2YoKSkge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGREZWZhdWx0LkxhYmVsPy52YWx1ZU9mKCkpKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db21tb24/LkxhYmVsPy52YWx1ZU9mKCkgfHwgcHJvcGVydHkubmFtZSkpO1xuXHR9IGVsc2UgaWYgKGlzRGF0YUZpZWxkVHlwZXMocHJvcGVydHkpKSB7XG5cdFx0aWYgKCEhaXNHcm91cCAmJiBwcm9wZXJ0eS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5MYWJlbD8udmFsdWVPZigpKSk7XG5cdFx0fVxuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0cHJvcGVydHkuTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5WYWx1ZT8uJHRhcmdldD8ubmFtZVxuXHRcdFx0KVxuXHRcdCk7XG5cdH0gZWxzZSBpZiAocHJvcGVydHkuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24pIHtcblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdHByb3BlcnR5LkxhYmVsPy52YWx1ZU9mKCkgfHwgKHByb3BlcnR5LlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQpPy5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5MYWJlbD8udmFsdWVPZigpKSk7XG5cdH1cbn07XG5cbmNvbnN0IF9nZXRUb29sdGlwID0gZnVuY3Rpb24gKHNvdXJjZTogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IFByb3BlcnR5KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKCFzb3VyY2UpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKGlzUHJvcGVydHkoc291cmNlKSB8fCBzb3VyY2UuYW5ub3RhdGlvbnM/LkNvbW1vbj8uUXVpY2tJbmZvKSB7XG5cdFx0cmV0dXJuIHNvdXJjZS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm9cblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHNvdXJjZS5hbm5vdGF0aW9ucy5Db21tb24uUXVpY2tJbmZvLnZhbHVlT2YoKSkpXG5cdFx0XHQ6IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmIChpc0RhdGFGaWVsZFR5cGVzKHNvdXJjZSkpIHtcblx0XHRyZXR1cm4gc291cmNlLlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm9cblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHNvdXJjZS5WYWx1ZS4kdGFyZ2V0LmFubm90YXRpb25zLkNvbW1vbi5RdWlja0luZm8udmFsdWVPZigpKSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKHNvdXJjZS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikge1xuXHRcdGNvbnN0IGRhdGFwb2ludFRhcmdldCA9IHNvdXJjZS5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50O1xuXHRcdHJldHVybiBkYXRhcG9pbnRUYXJnZXQ/LlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm9cblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFwb2ludFRhcmdldC5WYWx1ZS4kdGFyZ2V0LmFubm90YXRpb25zLkNvbW1vbi5RdWlja0luZm8udmFsdWVPZigpKSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3dTdGF0dXNWaXNpYmlsaXR5KGNvbE5hbWU6IHN0cmluZywgaXNTZW1hbnRpY0tleUluRmllbGRHcm91cD86IEJvb2xlYW4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gZm9ybWF0UmVzdWx0KFxuXHRcdFtcblx0XHRcdHBhdGhJbk1vZGVsKGBzZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yYCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdHBhdGhJbk1vZGVsKGBmaWx0ZXJlZE1lc3NhZ2VzYCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdGNvbE5hbWUsXG5cdFx0XHRpc1NlbWFudGljS2V5SW5GaWVsZEdyb3VwXG5cdFx0XSxcblx0XHR0YWJsZUZvcm1hdHRlcnMuZ2V0RXJyb3JTdGF0dXNUZXh0VmlzaWJpbGl0eUZvcm1hdHRlclxuXHQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBQcm9wZXJ0eUluZm8gZm9yIGVhY2ggaWRlbnRpZmllZCBwcm9wZXJ0eSBjb25zdW1lZCBieSBhIExpbmVJdGVtLlxuICpcbiAqIEBwYXJhbSBjb2x1bW5zVG9CZUNyZWF0ZWQgSWRlbnRpZmllZCBwcm9wZXJ0aWVzLlxuICogQHBhcmFtIGV4aXN0aW5nQ29sdW1ucyBUaGUgbGlzdCBvZiBjb2x1bW5zIGNyZWF0ZWQgZm9yIExpbmVJdGVtcyBhbmQgUHJvcGVydGllcyBvZiBlbnRpdHlUeXBlLlxuICogQHBhcmFtIG5vblNvcnRhYmxlQ29sdW1ucyBUaGUgYXJyYXkgb2YgY29sdW1uIG5hbWVzIHdoaWNoIGNhbm5vdCBiZSBzb3J0ZWQuXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHQuXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgZW50aXR5IHR5cGUgZm9yIHRoZSBMaW5lSXRlbVxuICogQHBhcmFtIHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiBUaGUgYXJyYXkgb2YgY29sdW1ucyBmcm9tIGEgcHJvcGVydHkgdXNpbmcgYSB0ZXh0IGFubm90YXRpb24gd2l0aCB0ZXh0T25seSBhcyB0ZXh0IGFycmFuZ2VtZW50LlxuICogQHJldHVybnMgVGhlIGFycmF5IG9mIGNvbHVtbnMgY3JlYXRlZC5cbiAqL1xuY29uc3QgX2NyZWF0ZVJlbGF0ZWRDb2x1bW5zID0gZnVuY3Rpb24gKFxuXHRjb2x1bW5zVG9CZUNyZWF0ZWQ6IFJlY29yZDxzdHJpbmcsIFByb3BlcnR5Pixcblx0ZXhpc3RpbmdDb2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSxcblx0bm9uU29ydGFibGVDb2x1bW5zOiBzdHJpbmdbXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uOiBzdHJpbmdbXVxuKTogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCByZWxhdGVkQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10gPSBbXTtcblx0Y29uc3QgcmVsYXRlZFByb3BlcnR5TmFtZU1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRPYmplY3Qua2V5cyhjb2x1bW5zVG9CZUNyZWF0ZWQpLmZvckVhY2goKG5hbWUpID0+IHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IGNvbHVtbnNUb0JlQ3JlYXRlZFtuYW1lXSxcblx0XHRcdGFubm90YXRpb25QYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKG5hbWUpLFxuXHRcdFx0Ly8gQ2hlY2sgd2hldGhlciB0aGUgcmVsYXRlZCBjb2x1bW4gYWxyZWFkeSBleGlzdHMuXG5cdFx0XHRyZWxhdGVkQ29sdW1uID0gZXhpc3RpbmdDb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4gY29sdW1uLm5hbWUgPT09IG5hbWUpO1xuXHRcdGlmIChyZWxhdGVkQ29sdW1uID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIENhc2UgMTogS2V5IGNvbnRhaW5zIERhdGFGaWVsZCBwcmVmaXggdG8gZW5zdXJlIGFsbCBwcm9wZXJ0eSBjb2x1bW5zIGhhdmUgdGhlIHNhbWUga2V5IGZvcm1hdC5cblx0XHRcdC8vIE5ldyBjcmVhdGVkIHByb3BlcnR5IGNvbHVtbiBpcyBzZXQgdG8gaGlkZGVuLlxuXHRcdFx0cmVsYXRlZENvbHVtbnMucHVzaChcblx0XHRcdFx0Z2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eShcblx0XHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdFx0XHRcdGFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChyZWxhdGVkQ29sdW1uLmFubm90YXRpb25QYXRoICE9PSBhbm5vdGF0aW9uUGF0aCB8fCByZWxhdGVkQ29sdW1uLnByb3BlcnR5SW5mb3MpIHtcblx0XHRcdC8vIENhc2UgMjogVGhlIGV4aXN0aW5nIGNvbHVtbiBwb2ludHMgdG8gYSBMaW5lSXRlbSAob3IpXG5cdFx0XHQvLyBDYXNlIDM6IFRoaXMgaXMgYSBzZWxmIHJlZmVyZW5jZSBmcm9tIGFuIGV4aXN0aW5nIGNvbHVtblxuXG5cdFx0XHRjb25zdCBuZXdOYW1lID0gYFByb3BlcnR5Ojoke25hbWV9YDtcblxuXHRcdFx0Ly8gQ2hlY2tpbmcgd2hldGhlciB0aGUgcmVsYXRlZCBwcm9wZXJ0eSBjb2x1bW4gaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkIGluIGEgcHJldmlvdXMgaXRlcmF0aW9uLlxuXHRcdFx0aWYgKCFleGlzdGluZ0NvbHVtbnMuc29tZSgoY29sdW1uKSA9PiBjb2x1bW4ubmFtZSA9PT0gbmV3TmFtZSkpIHtcblx0XHRcdFx0Ly8gQ3JlYXRlIGEgbmV3IHByb3BlcnR5IGNvbHVtbiB3aXRoICdQcm9wZXJ0eTo6JyBwcmVmaXgsXG5cdFx0XHRcdC8vIFNldCBpdCB0byBoaWRkZW4gYXMgaXQgaXMgb25seSBjb25zdW1lZCBieSBDb21wbGV4IHByb3BlcnR5IGluZm9zLlxuXHRcdFx0XHRjb25zdCBjb2x1bW4gPSBnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5KFxuXHRcdFx0XHRcdHByb3BlcnR5LFxuXHRcdFx0XHRcdGFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdFx0XHRcdGFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGNvbHVtbi5pc1BhcnRPZkxpbmVJdGVtID0gcmVsYXRlZENvbHVtbi5pc1BhcnRPZkxpbmVJdGVtO1xuXHRcdFx0XHRyZWxhdGVkQ29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbbmFtZV0gPSBuZXdOYW1lO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0ZXhpc3RpbmdDb2x1bW5zLnNvbWUoKGNvbHVtbikgPT4gY29sdW1uLm5hbWUgPT09IG5ld05hbWUpICYmXG5cdFx0XHRcdGV4aXN0aW5nQ29sdW1ucy5zb21lKChjb2x1bW4pID0+IGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5pbmNsdWRlcyhuYW1lKSlcblx0XHRcdCkge1xuXHRcdFx0XHRyZWxhdGVkUHJvcGVydHlOYW1lTWFwW25hbWVdID0gbmV3TmFtZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vIFRoZSBwcm9wZXJ0eSAnbmFtZScgaGFzIGJlZW4gcHJlZml4ZWQgd2l0aCAnUHJvcGVydHk6OicgZm9yIHVuaXF1ZW5lc3MuXG5cdC8vIFVwZGF0ZSB0aGUgc2FtZSBpbiBvdGhlciBwcm9wZXJ0eUluZm9zW10gcmVmZXJlbmNlcyB3aGljaCBwb2ludCB0byB0aGlzIHByb3BlcnR5LlxuXHRleGlzdGluZ0NvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0Y29sdW1uLnByb3BlcnR5SW5mb3MgPSBjb2x1bW4ucHJvcGVydHlJbmZvcz8ubWFwKChwcm9wZXJ0eUluZm8pID0+IHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbcHJvcGVydHlJbmZvXSA/PyBwcm9wZXJ0eUluZm8pO1xuXHRcdGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcyA9IGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcz8ubWFwKFxuXHRcdFx0KHByb3BlcnR5SW5mbykgPT4gcmVsYXRlZFByb3BlcnR5TmFtZU1hcFtwcm9wZXJ0eUluZm9dID8/IHByb3BlcnR5SW5mb1xuXHRcdCk7XG5cdH0pO1xuXG5cdHJldHVybiByZWxhdGVkQ29sdW1ucztcbn07XG5cbi8qKlxuICogR2V0dGluZyB0aGUgQ29sdW1uIE5hbWVcbiAqIElmIGl0IHBvaW50cyB0byBhIERhdGFGaWVsZCB3aXRoIG9uZSBwcm9wZXJ0eSBvciBEYXRhUG9pbnQgd2l0aCBvbmUgcHJvcGVydHksIGl0IHdpbGwgdXNlIHRoZSBwcm9wZXJ0eSBuYW1lXG4gKiBoZXJlIHRvIGJlIGNvbnNpc3RlbnQgd2l0aCB0aGUgZXhpc3RpbmcgZmxleCBjaGFuZ2VzLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGlmZmVyZW50IERhdGFGaWVsZCB0eXBlcyBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHJldHVybnMgVGhlIG5hbWUgb2YgYW5ub3RhdGlvbiBjb2x1bW5zXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUgPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSB7XG5cdC8vIFRoaXMgaXMgbmVlZGVkIGFzIHdlIGhhdmUgZmxleGliaWxpdHkgY2hhbmdlcyBhbHJlYWR5IHRoYXQgd2UgaGF2ZSB0byBjaGVjayBhZ2FpbnN0XG5cdGlmIChpc0RhdGFGaWVsZFR5cGVzKGRhdGFGaWVsZCkpIHtcblx0XHRyZXR1cm4gZGF0YUZpZWxkLlZhbHVlPy5wYXRoO1xuXHR9IGVsc2UgaWYgKGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJiAoZGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQpPy5WYWx1ZT8ucGF0aCkge1xuXHRcdC8vIFRoaXMgaXMgZm9yIHJlbW92aW5nIGR1cGxpY2F0ZSBwcm9wZXJ0aWVzLiBGb3IgZXhhbXBsZSwgJ1Byb2dyZXNzJyBQcm9wZXJ0eSBpcyByZW1vdmVkIGlmIGl0IGlzIGFscmVhZHkgZGVmaW5lZCBhcyBhIERhdGFQb2ludFxuXHRcdHJldHVybiAoZGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQpPy5WYWx1ZS5wYXRoO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCk7XG5cdH1cbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIFByb3BlcnR5SW5mbyBmb3IgdGhlIGlkZW50aWZpZWQgYWRkaXRpb25hbCBwcm9wZXJ0eSBmb3IgdGhlIEFMUCB0YWJsZSB1c2UtY2FzZS5cbiAqXG4gKiBGb3IgZS5nLiBJZiBVSS5IaWRkZW4gcG9pbnRzIHRvIGEgcHJvcGVydHksIGluY2x1ZGUgdGhpcyB0ZWNobmljYWwgcHJvcGVydHkgaW4gdGhlIGFkZGl0aW9uYWxQcm9wZXJ0aWVzIG9mIENvbXBsZXhQcm9wZXJ0eUluZm8gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBiZSBjcmVhdGVkLlxuICogQHBhcmFtIGNvbHVtbnMgVGhlIGxpc3Qgb2YgY29sdW1ucyBjcmVhdGVkIGZvciBMaW5lSXRlbXMgYW5kIFByb3BlcnRpZXMgb2YgZW50aXR5VHlwZSBmcm9tIHRoZSB0YWJsZSB2aXN1YWxpemF0aW9uLlxuICogQHJldHVybnMgVGhlIHByb3BlcnR5SW5mbyBvZiB0aGUgdGVjaG5pY2FsIHByb3BlcnR5IHRvIGJlIGFkZGVkIHRvIHRoZSBsaXN0IG9mIGNvbHVtbnMuXG4gKiBAcHJpdmF0ZVxuICovXG5cbmNvbnN0IGNyZWF0ZVRlY2huaWNhbFByb3BlcnR5ID0gZnVuY3Rpb24gKG5hbWU6IHN0cmluZywgY29sdW1uczogVGFibGVDb2x1bW5bXSwgcmVsYXRlZEFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcblx0Y29uc3Qga2V5ID0gYFByb3BlcnR5X1RlY2huaWNhbDo6JHtuYW1lfWA7XG5cdC8vIFZhbGlkYXRlIGlmIHRoZSB0ZWNobmljYWwgcHJvcGVydHkgaGFzbid0IHlldCBiZWVuIGNyZWF0ZWQgb24gcHJldmlvdXMgaXRlcmF0aW9ucy5cblx0Y29uc3QgY29sdW1uRXhpc3RzID0gY29sdW1ucy5maW5kKChjb2x1bW4pID0+IGNvbHVtbi5rZXkgPT09IGtleSk7XG5cdC8vIFJldHJpZXZlIHRoZSBzaW1wbGUgcHJvcGVydHkgdXNlZCBieSB0aGUgaGlkZGVuIGFubm90YXRpb24sIGl0IHdpbGwgYmUgdXNlZCBhcyBhIGJhc2UgZm9yIHRoZSBtYW5kYXRvcnkgYXR0cmlidXRlcyBvZiBuZXdseSBjcmVhdGVkIHRlY2huaWNhbCBwcm9wZXJ0eS4gRm9yIGUuZy4gcmVsYXRpdmVQYXRoXG5cdGNvbnN0IGFkZGl0aW9uYWxQcm9wZXJ0eSA9XG5cdFx0IWNvbHVtbkV4aXN0cyAmJiAoY29sdW1ucy5maW5kKChjb2x1bW4pID0+IGNvbHVtbi5uYW1lID09PSBuYW1lICYmICFjb2x1bW4ucHJvcGVydHlJbmZvcykgYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uKSE7XG5cdGlmIChhZGRpdGlvbmFsUHJvcGVydHkpIHtcblx0XHRjb25zdCB0ZWNobmljYWxDb2x1bW46IFRlY2huaWNhbENvbHVtbiA9IHtcblx0XHRcdGtleToga2V5LFxuXHRcdFx0dHlwZTogQ29sdW1uVHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0bGFiZWw6IGFkZGl0aW9uYWxQcm9wZXJ0eS5sYWJlbCxcblx0XHRcdGFubm90YXRpb25QYXRoOiBhZGRpdGlvbmFsUHJvcGVydHkuYW5ub3RhdGlvblBhdGgsXG5cdFx0XHRhdmFpbGFiaWxpdHk6IEF2YWlsYWJpbGl0eVR5cGUuSGlkZGVuLFxuXHRcdFx0bmFtZToga2V5LFxuXHRcdFx0cmVsYXRpdmVQYXRoOiBhZGRpdGlvbmFsUHJvcGVydHkucmVsYXRpdmVQYXRoLFxuXHRcdFx0c29ydGFibGU6IGZhbHNlLFxuXHRcdFx0aXNHcm91cGFibGU6IGZhbHNlLFxuXHRcdFx0aXNLZXk6IGZhbHNlLFxuXHRcdFx0ZXhwb3J0U2V0dGluZ3M6IG51bGwsXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBmYWxzZSxcblx0XHRcdGFnZ3JlZ2F0YWJsZTogZmFsc2UsXG5cdFx0XHRleHRlbnNpb246IHtcblx0XHRcdFx0dGVjaG5pY2FsbHlHcm91cGFibGU6IHRydWUsXG5cdFx0XHRcdHRlY2huaWNhbGx5QWdncmVnYXRhYmxlOiB0cnVlXG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb2x1bW5zLnB1c2godGVjaG5pY2FsQ29sdW1uKTtcblx0XHRyZWxhdGVkQWRkaXRpb25hbFByb3BlcnR5TmFtZU1hcFtuYW1lXSA9IHRlY2huaWNhbENvbHVtbi5uYW1lO1xuXHR9XG59O1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIGRhdGEgZmllbGQgbGFiZWxzIGhhdmUgdG8gYmUgZGlzcGxheWVkIGluIHRoZSB0YWJsZS5cbiAqXG4gKiBAcGFyYW0gZmllbGRHcm91cE5hbWUgVGhlIGBEYXRhRmllbGRgIG5hbWUgYmVpbmcgcHJvY2Vzc2VkLlxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgYHNob3dEYXRhRmllbGRzTGFiZWxgIHZhbHVlIGZyb20gdGhlIG1hbmlmZXN0XG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfZ2V0U2hvd0RhdGFGaWVsZHNMYWJlbCA9IGZ1bmN0aW9uIChmaWVsZEdyb3VwTmFtZTogc3RyaW5nLCB2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdGNvbnN0IG9Db2x1bW5zID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKT8uY29sdW1ucztcblx0Y29uc3QgYUNvbHVtbktleXMgPSBvQ29sdW1ucyAmJiBPYmplY3Qua2V5cyhvQ29sdW1ucyk7XG5cdHJldHVybiAoXG5cdFx0YUNvbHVtbktleXMgJiZcblx0XHQhIWFDb2x1bW5LZXlzLmZpbmQoZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4ga2V5ID09PSBmaWVsZEdyb3VwTmFtZSAmJiBvQ29sdW1uc1trZXldLnNob3dEYXRhRmllbGRzTGFiZWw7XG5cdFx0fSlcblx0KTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgd2l0aCByZXNwZWN0IHRvIHRoZSByb290IGVudGl0eS5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBgRGF0YUZpZWxkYCBiZWluZyBwcm9jZXNzZWQuXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRpdmUgcGF0aFxuICovXG5jb25zdCBfZ2V0UmVsYXRpdmVQYXRoID0gZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyk6IHN0cmluZyB7XG5cdGxldCByZWxhdGl2ZVBhdGg6IHN0cmluZyA9IFwiXCI7XG5cblx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdHJlbGF0aXZlUGF0aCA9IChkYXRhRmllbGQgYXMgRGF0YUZpZWxkKT8uVmFsdWU/LnBhdGg7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRcdHJlbGF0aXZlUGF0aCA9IGRhdGFGaWVsZD8uVGFyZ2V0Py52YWx1ZTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb25Hcm91cDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb25Hcm91cDpcblx0XHRcdHJlbGF0aXZlUGF0aCA9IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKTtcblx0XHRcdGJyZWFrO1xuXHR9XG5cblx0cmV0dXJuIHJlbGF0aXZlUGF0aDtcbn07XG5cbmNvbnN0IF9zbGljZUF0U2xhc2ggPSBmdW5jdGlvbiAocGF0aDogc3RyaW5nLCBpc0xhc3RTbGFzaDogYm9vbGVhbiwgaXNMYXN0UGFydDogYm9vbGVhbikge1xuXHRjb25zdCBpU2xhc2hJbmRleCA9IGlzTGFzdFNsYXNoID8gcGF0aC5sYXN0SW5kZXhPZihcIi9cIikgOiBwYXRoLmluZGV4T2YoXCIvXCIpO1xuXG5cdGlmIChpU2xhc2hJbmRleCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gcGF0aDtcblx0fVxuXHRyZXR1cm4gaXNMYXN0UGFydCA/IHBhdGguc3Vic3RyaW5nKGlTbGFzaEluZGV4ICsgMSwgcGF0aC5sZW5ndGgpIDogcGF0aC5zdWJzdHJpbmcoMCwgaVNsYXNoSW5kZXgpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBjb2x1bW4gY29udGFpbnMgYSBtdWx0aS12YWx1ZSBmaWVsZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBEYXRhRmllbGQgYmVpbmcgcHJvY2Vzc2VkXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIERhdGFGaWVsZCBjb3JyZXNwb25kcyB0byBhIG11bHRpLXZhbHVlIGZpZWxkLlxuICovXG5jb25zdCBfaXNDb2x1bW5NdWx0aVZhbHVlZCA9IGZ1bmN0aW9uIChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0aWYgKGlzRGF0YUZpZWxkVHlwZXMoZGF0YUZpZWxkKSAmJiBpc1BhdGhFeHByZXNzaW9uKGRhdGFGaWVsZC5WYWx1ZSkpIHtcblx0XHRjb25zdCBwcm9wZXJ0eU9iamVjdFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSwgZGF0YUZpZWxkLlZhbHVlLnBhdGgpO1xuXHRcdHJldHVybiBpc011bHRpVmFsdWVGaWVsZChwcm9wZXJ0eU9iamVjdFBhdGgpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hldGhlciBhIGNvbHVtbiBpcyBzb3J0YWJsZS5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBkYXRhIGZpZWxkIGJlaW5nIHByb2Nlc3NlZFxuICogQHBhcmFtIHByb3BlcnR5UGF0aCBUaGUgcHJvcGVydHkgcGF0aFxuICogQHBhcmFtIG5vblNvcnRhYmxlQ29sdW1ucyBDb2xsZWN0aW9uIG9mIG5vbi1zb3J0YWJsZSBjb2x1bW4gbmFtZXMgYXMgcGVyIGFubm90YXRpb25cbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGNvbHVtbiBpcyBzb3J0YWJsZVxuICovXG5jb25zdCBfaXNDb2x1bW5Tb3J0YWJsZSA9IGZ1bmN0aW9uIChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIHByb3BlcnR5UGF0aDogc3RyaW5nLCBub25Tb3J0YWJsZUNvbHVtbnM6IHN0cmluZ1tdKTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0bm9uU29ydGFibGVDb2x1bW5zLmluZGV4T2YocHJvcGVydHlQYXRoKSA9PT0gLTEgJiYgLy8gQ29sdW1uIGlzIG5vdCBtYXJrZWQgYXMgbm9uLXNvcnRhYmxlIHZpYSBhbm5vdGF0aW9uXG5cdFx0KGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkIHx8XG5cdFx0XHRkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmwgfHxcblx0XHRcdGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbiB8fFxuXHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uKVxuXHQpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgZmlsdGVyaW5nIG9uIHRoZSB0YWJsZSBpcyBjYXNlIHNlbnNpdGl2ZS5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBSZXR1cm5zICdmYWxzZScgaWYgRmlsdGVyRnVuY3Rpb25zIGFubm90YXRpb24gc3VwcG9ydHMgJ3RvbG93ZXInLCBlbHNlICd0cnVlJ1xuICovXG5leHBvcnQgY29uc3QgaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0Y29uc3QgZmlsdGVyRnVuY3Rpb25zOiBGaWx0ZXJGdW5jdGlvbnMgfCB1bmRlZmluZWQgPSBfZ2V0RmlsdGVyRnVuY3Rpb25zKGNvbnZlcnRlckNvbnRleHQpO1xuXHRyZXR1cm4gQXJyYXkuaXNBcnJheShmaWx0ZXJGdW5jdGlvbnMpID8gKGZpbHRlckZ1bmN0aW9ucyBhcyBTdHJpbmdbXSkuaW5kZXhPZihcInRvbG93ZXJcIikgPT09IC0xIDogdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9nZXRGaWx0ZXJGdW5jdGlvbnMoQ29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IEZpbHRlckZ1bmN0aW9ucyB8IHVuZGVmaW5lZCB7XG5cdGlmIChNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihDb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpKSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0Y29uc3QgY2FwYWJpbGl0aWVzID0gQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKT8uYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcyBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXM7XG5cdHJldHVybiBjYXBhYmlsaXRpZXM/LkZpbHRlckZ1bmN0aW9ucyB8fCBDb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eUNvbnRhaW5lcigpPy5hbm5vdGF0aW9ucz8uQ2FwYWJpbGl0aWVzPy5GaWx0ZXJGdW5jdGlvbnM7XG59XG5cbi8qKlxuICogUmV0dXJucyBkZWZhdWx0IGZvcm1hdCBvcHRpb25zIGZvciB0ZXh0IGZpZWxkcyBpbiBhIHRhYmxlLlxuICpcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zXG4gKiBAcmV0dXJucyBDb2xsZWN0aW9uIG9mIGZvcm1hdCBvcHRpb25zIHdpdGggZGVmYXVsdCB2YWx1ZXNcbiAqL1xuZnVuY3Rpb24gX2dldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yVGFibGUoZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9uc1R5cGUgfCB1bmRlZmluZWQpOiBGb3JtYXRPcHRpb25zVHlwZSB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBmb3JtYXRPcHRpb25zID09PSB1bmRlZmluZWRcblx0XHQ/IHVuZGVmaW5lZFxuXHRcdDoge1xuXHRcdFx0XHR0ZXh0TGluZXNFZGl0OiA0LFxuXHRcdFx0XHQuLi5mb3JtYXRPcHRpb25zXG5cdFx0ICB9O1xufVxuXG5mdW5jdGlvbiBfZmluZFNlbWFudGljS2V5VmFsdWVzKHNlbWFudGljS2V5czogYW55W10sIG5hbWU6IHN0cmluZyk6IGFueSB7XG5cdGNvbnN0IGFTZW1hbnRpY0tleVZhbHVlczogc3RyaW5nW10gPSBbXTtcblx0bGV0IGJTZW1hbnRpY0tleUZvdW5kID0gZmFsc2U7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc2VtYW50aWNLZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0YVNlbWFudGljS2V5VmFsdWVzLnB1c2goc2VtYW50aWNLZXlzW2ldLnZhbHVlKTtcblx0XHRpZiAoc2VtYW50aWNLZXlzW2ldLnZhbHVlID09PSBuYW1lKSB7XG5cdFx0XHRiU2VtYW50aWNLZXlGb3VuZCA9IHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7XG5cdFx0dmFsdWVzOiBhU2VtYW50aWNLZXlWYWx1ZXMsXG5cdFx0c2VtYW50aWNLZXlGb3VuZDogYlNlbWFudGljS2V5Rm91bmRcblx0fTtcbn1cblxuZnVuY3Rpb24gX2ZpbmRQcm9wZXJ0aWVzKHNlbWFudGljS2V5VmFsdWVzOiBhbnlbXSwgZmllbGRHcm91cFByb3BlcnRpZXM6IGFueVtdKSB7XG5cdGxldCBzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwID0gZmFsc2U7XG5cdGxldCBzUHJvcGVydHlQYXRoO1xuXHRpZiAoc2VtYW50aWNLZXlWYWx1ZXMgJiYgc2VtYW50aWNLZXlWYWx1ZXMubGVuZ3RoID49IDEgJiYgZmllbGRHcm91cFByb3BlcnRpZXMgJiYgZmllbGRHcm91cFByb3BlcnRpZXMubGVuZ3RoID49IDEpIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNlbWFudGljS2V5VmFsdWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoW3NlbWFudGljS2V5VmFsdWVzW2ldXS5zb21lKCh0bXApID0+IGZpZWxkR3JvdXBQcm9wZXJ0aWVzLmluZGV4T2YodG1wKSA+PSAwKSkge1xuXHRcdFx0XHRzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwID0gdHJ1ZTtcblx0XHRcdFx0c1Byb3BlcnR5UGF0aCA9IHNlbWFudGljS2V5VmFsdWVzW2ldO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHtcblx0XHRzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwOiBzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwLFxuXHRcdGZpZWxkR3JvdXBQcm9wZXJ0eVBhdGg6IHNQcm9wZXJ0eVBhdGhcblx0fTtcbn1cblxuZnVuY3Rpb24gX2ZpbmRTZW1hbnRpY0tleVZhbHVlc0luRmllbGRHcm91cChkYXRhRmllbGRHcm91cDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IG51bGwsIHNlbWFudGljS2V5VmFsdWVzOiBbXSk6IGFueSB7XG5cdGNvbnN0IGFQcm9wZXJ0aWVzOiBhbnlbXSA9IFtdO1xuXHRsZXQgX3Byb3BlcnRpZXNGb3VuZDogeyBzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwOiBib29sZWFuOyBmaWVsZEdyb3VwUHJvcGVydHlQYXRoOiBhbnkgfSA9IHtcblx0XHRzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwOiBmYWxzZSxcblx0XHRmaWVsZEdyb3VwUHJvcGVydHlQYXRoOiB1bmRlZmluZWRcblx0fTtcblx0aWYgKFxuXHRcdGRhdGFGaWVsZEdyb3VwICYmXG5cdFx0ZGF0YUZpZWxkR3JvdXAuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiZcblx0XHRkYXRhRmllbGRHcm91cC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5GaWVsZEdyb3VwVHlwZVxuXHQpIHtcblx0XHRkYXRhRmllbGRHcm91cC5UYXJnZXQuJHRhcmdldC5EYXRhPy5mb3JFYWNoKChpbm5lckRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQoaW5uZXJEYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZCB8fCBpbm5lckRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCkgJiZcblx0XHRcdFx0aW5uZXJEYXRhRmllbGQuVmFsdWVcblx0XHRcdCkge1xuXHRcdFx0XHRhUHJvcGVydGllcy5wdXNoKGlubmVyRGF0YUZpZWxkLlZhbHVlLnBhdGgpO1xuXHRcdFx0fVxuXHRcdFx0X3Byb3BlcnRpZXNGb3VuZCA9IF9maW5kUHJvcGVydGllcyhzZW1hbnRpY0tleVZhbHVlcywgYVByb3BlcnRpZXMpO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0c2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cDogX3Byb3BlcnRpZXNGb3VuZC5zZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwLFxuXHRcdHByb3BlcnR5UGF0aDogX3Byb3BlcnRpZXNGb3VuZC5maWVsZEdyb3VwUHJvcGVydHlQYXRoXG5cdH07XG59XG5cbi8qKlxuICogUmV0dXJucyBkZWZhdWx0IGZvcm1hdCBvcHRpb25zIHdpdGggZHJhZnRJbmRpY2F0b3IgZm9yIGEgY29sdW1uLlxuICpcbiAqIEBwYXJhbSBuYW1lXG4gKiBAcGFyYW0gc2VtYW50aWNLZXlzXG4gKiBAcGFyYW0gaXNGaWVsZEdyb3VwQ29sdW1uXG4gKiBAcGFyYW0gZGF0YUZpZWxkR3JvdXBcbiAqIEByZXR1cm5zIENvbGxlY3Rpb24gb2YgZm9ybWF0IG9wdGlvbnMgd2l0aCBkZWZhdWx0IHZhbHVlc1xuICovXG5mdW5jdGlvbiBnZXREZWZhdWx0RHJhZnRJbmRpY2F0b3JGb3JDb2x1bW4oXG5cdG5hbWU6IHN0cmluZyxcblx0c2VtYW50aWNLZXlzOiBhbnlbXSxcblx0aXNGaWVsZEdyb3VwQ29sdW1uOiBib29sZWFuLFxuXHRkYXRhRmllbGRHcm91cDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IG51bGxcbikge1xuXHRpZiAoIXNlbWFudGljS2V5cykge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXHRjb25zdCBzZW1hbnRpY0tleSA9IF9maW5kU2VtYW50aWNLZXlWYWx1ZXMoc2VtYW50aWNLZXlzLCBuYW1lKTtcblx0Y29uc3Qgc2VtYW50aWNLZXlJbkZpZWxkR3JvdXAgPSBfZmluZFNlbWFudGljS2V5VmFsdWVzSW5GaWVsZEdyb3VwKGRhdGFGaWVsZEdyb3VwLCBzZW1hbnRpY0tleS52YWx1ZXMpO1xuXHRpZiAoc2VtYW50aWNLZXkuc2VtYW50aWNLZXlGb3VuZCkge1xuXHRcdGNvbnN0IGZvcm1hdE9wdGlvbnNPYmo6IGFueSA9IHtcblx0XHRcdGhhc0RyYWZ0SW5kaWNhdG9yOiB0cnVlLFxuXHRcdFx0c2VtYW50aWNrZXlzOiBzZW1hbnRpY0tleS52YWx1ZXMsXG5cdFx0XHRvYmplY3RTdGF0dXNUZXh0VmlzaWJpbGl0eTogY29tcGlsZUV4cHJlc3Npb24oZ2V0Um93U3RhdHVzVmlzaWJpbGl0eShuYW1lLCBmYWxzZSkpXG5cdFx0fTtcblx0XHRpZiAoaXNGaWVsZEdyb3VwQ29sdW1uICYmIHNlbWFudGljS2V5SW5GaWVsZEdyb3VwLnNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXApIHtcblx0XHRcdGZvcm1hdE9wdGlvbnNPYmpbXCJvYmplY3RTdGF0dXNUZXh0VmlzaWJpbGl0eVwiXSA9IGNvbXBpbGVFeHByZXNzaW9uKGdldFJvd1N0YXR1c1Zpc2liaWxpdHkobmFtZSwgdHJ1ZSkpO1xuXHRcdFx0Zm9ybWF0T3B0aW9uc09ialtcImZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aFwiXSA9IHNlbWFudGljS2V5SW5GaWVsZEdyb3VwLnByb3BlcnR5UGF0aDtcblx0XHR9XG5cdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnNPYmo7XG5cdH0gZWxzZSBpZiAoIXNlbWFudGljS2V5SW5GaWVsZEdyb3VwLnNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXApIHtcblx0XHRyZXR1cm4ge307XG5cdH0gZWxzZSB7XG5cdFx0Ly8gU2VtYW50aWMgS2V5IGhhcyBhIHByb3BlcnR5IGluIGEgRmllbGRHcm91cFxuXHRcdHJldHVybiB7XG5cdFx0XHRmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGg6IHNlbWFudGljS2V5SW5GaWVsZEdyb3VwLnByb3BlcnR5UGF0aCxcblx0XHRcdGZpZWxkR3JvdXBOYW1lOiBuYW1lLFxuXHRcdFx0b2JqZWN0U3RhdHVzVGV4dFZpc2liaWxpdHk6IGNvbXBpbGVFeHByZXNzaW9uKGdldFJvd1N0YXR1c1Zpc2liaWxpdHkobmFtZSwgdHJ1ZSkpXG5cdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBfZ2V0SW1wTnVtYmVyKGRhdGFGaWVsZDogRGF0YUZpZWxkVHlwZXMpOiBudW1iZXIge1xuXHRjb25zdCBpbXBvcnRhbmNlID0gZGF0YUZpZWxkPy5hbm5vdGF0aW9ucz8uVUk/LkltcG9ydGFuY2UgYXMgc3RyaW5nO1xuXG5cdGlmIChpbXBvcnRhbmNlICYmIGltcG9ydGFuY2UuaW5jbHVkZXMoXCJVSS5JbXBvcnRhbmNlVHlwZS9IaWdoXCIpKSB7XG5cdFx0cmV0dXJuIDM7XG5cdH1cblx0aWYgKGltcG9ydGFuY2UgJiYgaW1wb3J0YW5jZS5pbmNsdWRlcyhcIlVJLkltcG9ydGFuY2VUeXBlL01lZGl1bVwiKSkge1xuXHRcdHJldHVybiAyO1xuXHR9XG5cdGlmIChpbXBvcnRhbmNlICYmIGltcG9ydGFuY2UuaW5jbHVkZXMoXCJVSS5JbXBvcnRhbmNlVHlwZS9Mb3dcIikpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXHRyZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gX2dldERhdGFGaWVsZEltcG9ydGFuY2UoZGF0YUZpZWxkOiBEYXRhRmllbGRUeXBlcyk6IEltcG9ydGFuY2Uge1xuXHRjb25zdCBpbXBvcnRhbmNlID0gZGF0YUZpZWxkPy5hbm5vdGF0aW9ucz8uVUk/LkltcG9ydGFuY2UgYXMgc3RyaW5nO1xuXHRyZXR1cm4gaW1wb3J0YW5jZSA/IChpbXBvcnRhbmNlLnNwbGl0KFwiL1wiKVsxXSBhcyBJbXBvcnRhbmNlKSA6IEltcG9ydGFuY2UuTm9uZTtcbn1cblxuZnVuY3Rpb24gX2dldE1heEltcG9ydGFuY2UoZmllbGRzOiBEYXRhRmllbGRUeXBlc1tdKTogSW1wb3J0YW5jZSB7XG5cdGlmIChmaWVsZHMgJiYgZmllbGRzLmxlbmd0aCA+IDApIHtcblx0XHRsZXQgbWF4SW1wTnVtYmVyID0gLTE7XG5cdFx0bGV0IGltcE51bWJlciA9IC0xO1xuXHRcdGxldCBEYXRhRmllbGRXaXRoTWF4SW1wb3J0YW5jZTtcblx0XHRmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xuXHRcdFx0aW1wTnVtYmVyID0gX2dldEltcE51bWJlcihmaWVsZCk7XG5cdFx0XHRpZiAoaW1wTnVtYmVyID4gbWF4SW1wTnVtYmVyKSB7XG5cdFx0XHRcdG1heEltcE51bWJlciA9IGltcE51bWJlcjtcblx0XHRcdFx0RGF0YUZpZWxkV2l0aE1heEltcG9ydGFuY2UgPSBmaWVsZDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIF9nZXREYXRhRmllbGRJbXBvcnRhbmNlKERhdGFGaWVsZFdpdGhNYXhJbXBvcnRhbmNlIGFzIERhdGFGaWVsZFR5cGVzKTtcblx0fVxuXHRyZXR1cm4gSW1wb3J0YW5jZS5Ob25lO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGltcG9ydGFuY2UgdmFsdWUgZm9yIGEgY29sdW1uLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRcbiAqIEBwYXJhbSBzZW1hbnRpY0tleXNcbiAqIEByZXR1cm5zIFRoZSBpbXBvcnRhbmNlIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbXBvcnRhbmNlKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcywgc2VtYW50aWNLZXlzOiBTZW1hbnRpY0tleSk6IEltcG9ydGFuY2UgfCB1bmRlZmluZWQge1xuXHQvL0V2YWx1YXRlIGRlZmF1bHQgSW1wb3J0YW5jZSBpcyBub3Qgc2V0IGV4cGxpY2l0bHlcblx0bGV0IGZpZWxkc1dpdGhJbXBvcnRhbmNlLCBtYXBTZW1hbnRpY0tleXM6IGFueTtcblx0Ly9DaGVjayBpZiBzZW1hbnRpY0tleXMgYXJlIGRlZmluZWQgYXQgdGhlIEVudGl0eVNldCBsZXZlbFxuXHRpZiAoc2VtYW50aWNLZXlzICYmIHNlbWFudGljS2V5cy5sZW5ndGggPiAwKSB7XG5cdFx0bWFwU2VtYW50aWNLZXlzID0gc2VtYW50aWNLZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4ga2V5LnZhbHVlO1xuXHRcdH0pO1xuXHR9XG5cdGlmICghZGF0YUZpZWxkKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRpZiAoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uKSB7XG5cdFx0Y29uc3QgZmllbGRHcm91cERhdGEgPSAoZGF0YUZpZWxkIGFzIGFueSkuVGFyZ2V0W1wiJHRhcmdldFwiXVtcIkRhdGFcIl0gYXMgRmllbGRHcm91cFR5cGUsXG5cdFx0XHRmaWVsZEdyb3VwSGFzU2VtYW50aWNLZXkgPVxuXHRcdFx0XHRmaWVsZEdyb3VwRGF0YSAmJlxuXHRcdFx0XHQoZmllbGRHcm91cERhdGEgYXMgYW55KS5zb21lKGZ1bmN0aW9uIChmaWVsZEdyb3VwRGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdChmaWVsZEdyb3VwRGF0YUZpZWxkIGFzIHVua25vd24gYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZT8ucGF0aCAmJlxuXHRcdFx0XHRcdFx0ZmllbGRHcm91cERhdGFGaWVsZC4kVHlwZSAhPT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJlxuXHRcdFx0XHRcdFx0bWFwU2VtYW50aWNLZXlzICYmXG5cdFx0XHRcdFx0XHRtYXBTZW1hbnRpY0tleXMuaW5jbHVkZXMoKGZpZWxkR3JvdXBEYXRhRmllbGQgYXMgdW5rbm93biBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy5wYXRoKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXHRcdC8vSWYgYSBGaWVsZEdyb3VwIGNvbnRhaW5zIGEgc2VtYW50aWNLZXksIGltcG9ydGFuY2Ugc2V0IHRvIEhpZ2hcblx0XHRpZiAoZmllbGRHcm91cEhhc1NlbWFudGljS2V5KSB7XG5cdFx0XHRyZXR1cm4gSW1wb3J0YW5jZS5IaWdoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL0lmIHRoZSBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIGhhcyBhbiBJbXBvcnRhbmNlIHdlIHRha2UgaXRcblx0XHRcdGlmIChkYXRhRmllbGQ/LmFubm90YXRpb25zPy5VST8uSW1wb3J0YW5jZSkge1xuXHRcdFx0XHRyZXR1cm4gX2dldERhdGFGaWVsZEltcG9ydGFuY2UoZGF0YUZpZWxkIGFzIHVua25vd24gYXMgRGF0YUZpZWxkVHlwZXMpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gZWxzZSB0aGUgaGlnaGVzdCBpbXBvcnRhbmNlIChpZiBhbnkpIGlzIHJldHVybmVkXG5cdFx0XHRmaWVsZHNXaXRoSW1wb3J0YW5jZSA9XG5cdFx0XHRcdGZpZWxkR3JvdXBEYXRhICYmXG5cdFx0XHRcdChmaWVsZEdyb3VwRGF0YSBhcyBhbnkpLmZpbHRlcihmdW5jdGlvbiAoaXRlbTogRGF0YUZpZWxkVHlwZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gaXRlbT8uYW5ub3RhdGlvbnM/LlVJPy5JbXBvcnRhbmNlO1xuXHRcdFx0XHR9KTtcblx0XHRcdHJldHVybiBfZ2V0TWF4SW1wb3J0YW5jZShmaWVsZHNXaXRoSW1wb3J0YW5jZSBhcyBEYXRhRmllbGRUeXBlc1tdKTtcblx0XHR9XG5cdFx0Ly9JZiB0aGUgY3VycmVudCBmaWVsZCBpcyBhIHNlbWFudGljS2V5LCBpbXBvcnRhbmNlIHNldCB0byBIaWdoXG5cdH1cblx0cmV0dXJuIChkYXRhRmllbGQgYXMgRGF0YUZpZWxkVHlwZXMpLlZhbHVlICYmXG5cdFx0KGRhdGFGaWVsZCBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy5wYXRoICYmXG5cdFx0bWFwU2VtYW50aWNLZXlzICYmXG5cdFx0bWFwU2VtYW50aWNLZXlzLmluY2x1ZGVzKChkYXRhRmllbGQgYXMgRGF0YUZpZWxkVHlwZXMpLlZhbHVlLnBhdGgpXG5cdFx0PyBJbXBvcnRhbmNlLkhpZ2hcblx0XHQ6IF9nZXREYXRhRmllbGRJbXBvcnRhbmNlKGRhdGFGaWVsZCBhcyB1bmtub3duIGFzIERhdGFGaWVsZFR5cGVzKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGxpbmUgaXRlbXMgZnJvbSBtZXRhZGF0YSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgd2l0aCB0aGVpciBhbm5vdGF0aW9uc1xuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoIFRoZSB2aXN1YWxpemF0aW9uIHBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGNvbHVtbnMgZnJvbSB0aGUgYW5ub3RhdGlvbnNcbiAqL1xuY29uc3QgZ2V0Q29sdW1uc0Zyb21Bbm5vdGF0aW9ucyA9IGZ1bmN0aW9uIChcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZShsaW5lSXRlbUFubm90YXRpb24pLFxuXHRcdGFubm90YXRpb25Db2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSA9IFtdLFxuXHRcdGNvbHVtbnNUb0JlQ3JlYXRlZDogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+ID0ge30sXG5cdFx0bm9uU29ydGFibGVDb2x1bW5zOiBzdHJpbmdbXSA9IGdldE5vblNvcnRhYmxlUHJvcGVydGllc1Jlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpKSxcblx0XHR0YWJsZU1hbmlmZXN0U2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKSxcblx0XHR0YWJsZVR5cGU6IFRhYmxlVHlwZSA9IHRhYmxlTWFuaWZlc3RTZXR0aW5ncz8udGFibGVTZXR0aW5ncz8udHlwZSB8fCBcIlJlc3BvbnNpdmVUYWJsZVwiO1xuXHRjb25zdCB0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb246IHN0cmluZ1tdID0gW107XG5cdGNvbnN0IHNlbWFudGljS2V5czogU2VtYW50aWNLZXkgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25zQnlUZXJtKFwiQ29tbW9uXCIsIENvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY0tleSwgW1xuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpXG5cdF0pWzBdO1xuXHRpZiAobGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0Y29uc3QgdGFibGVDb252ZXJ0ZXJDb250ZXh0ID0gY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZXJDb250ZXh0Rm9yKFxuXHRcdFx0Z2V0VGFyZ2V0T2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSlcblx0XHQpO1xuXG5cdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLmZvckVhY2goKGxpbmVJdGVtKSA9PiB7XG5cdFx0XHRpZiAoIV9pc1ZhbGlkQ29sdW1uKGxpbmVJdGVtKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRsZXQgZXhwb3J0U2V0dGluZ3M6IGV4cG9ydFNldHRpbmdzIHwgbnVsbCA9IG51bGw7XG5cdFx0XHRjb25zdCBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoID1cblx0XHRcdFx0aXNEYXRhRmllbGRUeXBlcyhsaW5lSXRlbSkgJiYgbGluZUl0ZW0uVmFsdWU/LiR0YXJnZXQ/LmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0XHRcdD8gZ2V0U2VtYW50aWNPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQsIGxpbmVJdGVtKVxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgcmVsYXRpdmVQYXRoID0gX2dldFJlbGF0aXZlUGF0aChsaW5lSXRlbSk7XG5cblx0XHRcdC8vIERldGVybWluZSBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBjb25zdW1lZCBieSB0aGlzIExpbmVJdGVtLlxuXHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnRpZXNJbmZvOiBDb21wbGV4UHJvcGVydHlJbmZvID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzUmVjdXJzaXZlbHkobGluZUl0ZW0sIGNvbnZlcnRlckNvbnRleHQsIHRhYmxlVHlwZSk7XG5cdFx0XHRjb25zdCByZWxhdGVkUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8ucHJvcGVydGllcyk7XG5cdFx0XHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8uYWRkaXRpb25hbFByb3BlcnRpZXMpO1xuXHRcdFx0Y29uc3QgZ3JvdXBQYXRoOiBzdHJpbmcgPSBfc2xpY2VBdFNsYXNoKHJlbGF0aXZlUGF0aCwgdHJ1ZSwgZmFsc2UpO1xuXHRcdFx0Y29uc3QgaXNHcm91cDogYm9vbGVhbiA9IGdyb3VwUGF0aCAhPSByZWxhdGl2ZVBhdGg7XG5cdFx0XHRjb25zdCBzTGFiZWw6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGdldExhYmVsKGxpbmVJdGVtLCBpc0dyb3VwKTtcblx0XHRcdGNvbnN0IG5hbWUgPSBfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUobGluZUl0ZW0pO1xuXHRcdFx0Y29uc3QgaXNGaWVsZEdyb3VwQ29sdW1uOiBib29sZWFuID0gZ3JvdXBQYXRoLmluZGV4T2YoYEAke1VJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXB9YCkgPiAtMTtcblx0XHRcdGNvbnN0IHNob3dEYXRhRmllbGRzTGFiZWw6IGJvb2xlYW4gPSBpc0ZpZWxkR3JvdXBDb2x1bW5cblx0XHRcdFx0PyBfZ2V0U2hvd0RhdGFGaWVsZHNMYWJlbChuYW1lLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dClcblx0XHRcdFx0OiBmYWxzZTtcblx0XHRcdGNvbnN0IGRhdGFUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBnZXREYXRhRmllbGREYXRhVHlwZShsaW5lSXRlbSk7XG5cdFx0XHRjb25zdCBzRGF0ZUlucHV0Rm9ybWF0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBkYXRhVHlwZSA9PT0gXCJFZG0uRGF0ZVwiID8gXCJZWVlZLU1NLUREXCIgOiB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCBmb3JtYXRPcHRpb25zID0gX2dldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yVGFibGUoXG5cdFx0XHRcdGdldERlZmF1bHREcmFmdEluZGljYXRvckZvckNvbHVtbihuYW1lLCBzZW1hbnRpY0tleXMsIGlzRmllbGRHcm91cENvbHVtbiwgbGluZUl0ZW0pXG5cdFx0XHQpO1xuXHRcdFx0bGV0IGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9uczogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGxpbmVJdGVtLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0XHRcdGxpbmVJdGVtLlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlXG5cdFx0XHQpIHtcblx0XHRcdFx0ZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zID0gX2dldEZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyhsaW5lSXRlbSwgZm9ybWF0T3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoX2lzRXhwb3J0YWJsZUNvbHVtbihsaW5lSXRlbSkpIHtcblx0XHRcdFx0Ly9leGNsdWRlIHRoZSB0eXBlcyBsaXN0ZWQgYWJvdmUgZm9yIHRoZSBFeHBvcnQgKGdlbmVyYXRlcyBlcnJvciBvbiBFeHBvcnQgYXMgUERGKVxuXHRcdFx0XHRleHBvcnRTZXR0aW5ncyA9IHtcblx0XHRcdFx0XHR0ZW1wbGF0ZTogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzVGVtcGxhdGUsXG5cdFx0XHRcdFx0d3JhcDogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzV3JhcHBpbmcsXG5cdFx0XHRcdFx0dHlwZTogZGF0YVR5cGUgPyBfZ2V0RXhwb3J0RGF0YVR5cGUoZGF0YVR5cGUsIHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmxlbmd0aCA+IDEpIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdGlucHV0Rm9ybWF0OiBzRGF0ZUlucHV0Rm9ybWF0LFxuXHRcdFx0XHRcdGRlbGltaXRlcjogZGF0YVR5cGUgPT09IFwiRWRtLkludDY0XCJcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXROYW1lKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudW5pdFByb3BlcnR5ID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXROYW1lO1xuXHRcdFx0XHRcdGV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIkN1cnJlbmN5XCI7IC8vIEZvcmNlIHRvIGEgY3VycmVuY3kgYmVjYXVzZSB0aGVyZSdzIGEgdW5pdFByb3BlcnR5IChvdGhlcndpc2UgdGhlIHZhbHVlIGlzbid0IHByb3Blcmx5IGZvcm1hdHRlZCB3aGVuIGV4cG9ydGVkKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0U3RyaW5nKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudW5pdCA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0U3RyaW5nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVOYW1lKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudGltZXpvbmVQcm9wZXJ0eSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZU5hbWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFRpbWV6b25lU3RyaW5nKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudGltZXpvbmUgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVTdHJpbmc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcHJvcGVydHlUeXBlQ29uZmlnID0gZGF0YVR5cGUgJiYgZ2V0VHlwZUNvbmZpZyhsaW5lSXRlbSwgZGF0YVR5cGUpO1xuXHRcdFx0Y29uc3QgdHlwZUNvbmZpZzogY29uZmlnVHlwZSA9IHtcblx0XHRcdFx0Y2xhc3NOYW1lOiBkYXRhVHlwZSBhcyBrZXlvZiB0eXBlb2YgRGVmYXVsdFR5cGVGb3JFZG1UeXBlLFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zOiB7XG5cdFx0XHRcdFx0Li4uZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0XHQuLi5wcm9wZXJ0eVR5cGVDb25maWc/LmZvcm1hdE9wdGlvbnNcblx0XHRcdFx0fSxcblx0XHRcdFx0Y29uc3RyYWludHM6IHByb3BlcnR5VHlwZUNvbmZpZz8uY29uc3RyYWludHNcblx0XHRcdH07XG5cdFx0XHRjb25zdCB2aXN1YWxTZXR0aW5nczogVmlzdWFsU2V0dGluZ3MgPSB7fTtcblx0XHRcdGlmICghZGF0YVR5cGUgfHwgIXR5cGVDb25maWcpIHtcblx0XHRcdFx0Ly8gZm9yIGNoYXJ0c1xuXHRcdFx0XHR2aXN1YWxTZXR0aW5ncy53aWR0aENhbGN1bGF0aW9uID0gbnVsbDtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGlzTXVsdGlWYWx1ZSA9IF9pc0NvbHVtbk11bHRpVmFsdWVkKGxpbmVJdGVtLCB0YWJsZUNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0Y29uc3Qgc29ydGFibGUgPSAhaXNNdWx0aVZhbHVlICYmIF9pc0NvbHVtblNvcnRhYmxlKGxpbmVJdGVtLCByZWxhdGl2ZVBhdGgsIG5vblNvcnRhYmxlQ29sdW1ucyk7XG5cdFx0XHRjb25zdCBjb2x1bW46IEFubm90YXRpb25UYWJsZUNvbHVtbiA9IHtcblx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGxpbmVJdGVtKSxcblx0XHRcdFx0dHlwZTogQ29sdW1uVHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0XHRsYWJlbDogc0xhYmVsLFxuXHRcdFx0XHRncm91cExhYmVsOiBpc0dyb3VwID8gZ2V0TGFiZWwobGluZUl0ZW0pIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRncm91cDogaXNHcm91cCA/IGdyb3VwUGF0aCA6IHVuZGVmaW5lZCxcblx0XHRcdFx0RmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zOiBmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMsXG5cdFx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgobGluZUl0ZW0uZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0c2VtYW50aWNPYmplY3RQYXRoOiBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRhdmFpbGFiaWxpdHk6IGlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuKGxpbmVJdGVtKSA/IEF2YWlsYWJpbGl0eVR5cGUuSGlkZGVuIDogQXZhaWxhYmlsaXR5VHlwZS5EZWZhdWx0LFxuXHRcdFx0XHRuYW1lOiBuYW1lLFxuXHRcdFx0XHRzaG93RGF0YUZpZWxkc0xhYmVsOiBzaG93RGF0YUZpZWxkc0xhYmVsLFxuXHRcdFx0XHRyZWxhdGl2ZVBhdGg6IHJlbGF0aXZlUGF0aCxcblx0XHRcdFx0c29ydGFibGU6IHNvcnRhYmxlLFxuXHRcdFx0XHRwcm9wZXJ0eUluZm9zOiByZWxhdGVkUHJvcGVydHlOYW1lcy5sZW5ndGggPyByZWxhdGVkUHJvcGVydHlOYW1lcyA6IHVuZGVmaW5lZCxcblx0XHRcdFx0YWRkaXRpb25hbFByb3BlcnR5SW5mb3M6IGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzLmxlbmd0aCA+IDAgPyBhZGRpdGlvbmFsUHJvcGVydHlOYW1lcyA6IHVuZGVmaW5lZCxcblx0XHRcdFx0ZXhwb3J0U2V0dGluZ3M6IGV4cG9ydFNldHRpbmdzLFxuXHRcdFx0XHR3aWR0aDogKGxpbmVJdGVtLmFubm90YXRpb25zPy5IVE1MNT8uQ3NzRGVmYXVsdHM/LndpZHRoPy52YWx1ZU9mKCkgYXMgc3RyaW5nKSB8fCB1bmRlZmluZWQsXG5cdFx0XHRcdGltcG9ydGFuY2U6IGdldEltcG9ydGFuY2UobGluZUl0ZW0gYXMgRGF0YUZpZWxkVHlwZXMsIHNlbWFudGljS2V5cyksXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlLFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zOiBmb3JtYXRPcHRpb25zLFxuXHRcdFx0XHRjYXNlU2Vuc2l0aXZlOiBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRcdHR5cGVDb25maWc6IHR5cGVDb25maWcsXG5cdFx0XHRcdHZpc3VhbFNldHRpbmdzOiB2aXN1YWxTZXR0aW5ncyxcblx0XHRcdFx0dGltZXpvbmVUZXh0OiBleHBvcnRTZXR0aW5ncz8udGltZXpvbmUsXG5cdFx0XHRcdGlzUGFydE9mTGluZUl0ZW06IHRydWVcblx0XHRcdH07XG5cdFx0XHRjb25zdCBzVG9vbHRpcCA9IF9nZXRUb29sdGlwKGxpbmVJdGVtKTtcblx0XHRcdGlmIChzVG9vbHRpcCkge1xuXHRcdFx0XHRjb2x1bW4udG9vbHRpcCA9IHNUb29sdGlwO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby50ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb24ucHVzaCguLi5yZWxhdGVkUHJvcGVydGllc0luZm8udGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uKTtcblx0XHRcdH1cblx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUgJiYgY29sdW1uLmV4cG9ydFNldHRpbmdzKSB7XG5cdFx0XHRcdGNvbHVtbi5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZTtcblx0XHRcdFx0Y29sdW1uLmV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdFx0fVxuXG5cdFx0XHRhbm5vdGF0aW9uQ29sdW1ucy5wdXNoKGNvbHVtbik7XG5cblx0XHRcdC8vIENvbGxlY3QgaW5mb3JtYXRpb24gb2YgcmVsYXRlZCBjb2x1bW5zIHRvIGJlIGNyZWF0ZWQuXG5cdFx0XHRyZWxhdGVkUHJvcGVydHlOYW1lcy5mb3JFYWNoKChyZWxhdGVkUHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRcdGNvbHVtbnNUb0JlQ3JlYXRlZFtyZWxhdGVkUHJvcGVydHlOYW1lXSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5wcm9wZXJ0aWVzW3JlbGF0ZWRQcm9wZXJ0eU5hbWVdO1xuXG5cdFx0XHRcdC8vIEluIGNhc2Ugb2YgYSBtdWx0aS12YWx1ZSwgcmVsYXRlZCBwcm9wZXJ0aWVzIGNhbm5vdCBiZSBzb3J0ZWQgYXMgd2UgZ28gdGhyb3VnaCBhIDEtbiByZWxhdGlvblxuXHRcdFx0XHRpZiAoaXNNdWx0aVZhbHVlKSB7XG5cdFx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLnB1c2gocmVsYXRlZFByb3BlcnR5TmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBDcmVhdGUgY29sdW1ucyBmb3IgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGlkZW50aWZpZWQgZm9yIEFMUCB1c2UgY2FzZS5cblx0XHRcdGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzLmZvckVhY2goKGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdFx0Ly8gSW50ZW50aW9uYWwgb3ZlcndyaXRlIGFzIHdlIHJlcXVpcmUgb25seSBvbmUgbmV3IFByb3BlcnR5SW5mbyBmb3IgYSByZWxhdGVkIFByb3BlcnR5LlxuXHRcdFx0XHRjb2x1bW5zVG9CZUNyZWF0ZWRbYWRkaXRpb25hbFByb3BlcnR5TmFtZV0gPSByZWxhdGVkUHJvcGVydGllc0luZm8uYWRkaXRpb25hbFByb3BlcnRpZXNbYWRkaXRpb25hbFByb3BlcnR5TmFtZV07XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIEdldCBjb2x1bW5zIGZyb20gdGhlIFByb3BlcnRpZXMgb2YgRW50aXR5VHlwZVxuXHRyZXR1cm4gZ2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlKFxuXHRcdGNvbHVtbnNUb0JlQ3JlYXRlZCxcblx0XHRlbnRpdHlUeXBlLFxuXHRcdGFubm90YXRpb25Db2x1bW5zLFxuXHRcdG5vblNvcnRhYmxlQ29sdW1ucyxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdHRhYmxlVHlwZSxcblx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb25cblx0KTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgcHJvcGVydHkgbmFtZXMgZnJvbSB0aGUgbWFuaWZlc3QgYW5kIGNoZWNrcyBhZ2FpbnN0IGV4aXN0aW5nIHByb3BlcnRpZXMgYWxyZWFkeSBhZGRlZCBieSBhbm5vdGF0aW9ucy5cbiAqIElmIGEgbm90IHlldCBzdG9yZWQgcHJvcGVydHkgaXMgZm91bmQgaXQgYWRkcyBpdCBmb3Igc29ydGluZyBhbmQgZmlsdGVyaW5nIG9ubHkgdG8gdGhlIGFubm90YXRpb25Db2x1bW5zLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0gYW5ub3RhdGlvbkNvbHVtbnNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gZW50aXR5VHlwZVxuICogQHJldHVybnMgVGhlIGNvbHVtbnMgZnJvbSB0aGUgYW5ub3RhdGlvbnNcbiAqL1xuY29uc3QgX2dldFByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiAoXG5cdHByb3BlcnRpZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxuXHRhbm5vdGF0aW9uQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGVcbik6IHN0cmluZ1tdIHwgdW5kZWZpbmVkIHtcblx0bGV0IG1hdGNoZWRQcm9wZXJ0aWVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcblx0aWYgKHByb3BlcnRpZXMpIHtcblx0XHRtYXRjaGVkUHJvcGVydGllcyA9IHByb3BlcnRpZXMubWFwKGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGgpIHtcblx0XHRcdGNvbnN0IGFubm90YXRpb25Db2x1bW4gPSBhbm5vdGF0aW9uQ29sdW1ucy5maW5kKGZ1bmN0aW9uIChhbm5vdGF0aW9uQ29sdW1uKSB7XG5cdFx0XHRcdHJldHVybiBhbm5vdGF0aW9uQ29sdW1uLnJlbGF0aXZlUGF0aCA9PT0gcHJvcGVydHlQYXRoICYmIGFubm90YXRpb25Db2x1bW4ucHJvcGVydHlJbmZvcyA9PT0gdW5kZWZpbmVkO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoYW5ub3RhdGlvbkNvbHVtbikge1xuXHRcdFx0XHRyZXR1cm4gYW5ub3RhdGlvbkNvbHVtbi5uYW1lO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgcmVsYXRlZENvbHVtbnMgPSBfY3JlYXRlUmVsYXRlZENvbHVtbnMoXG5cdFx0XHRcdFx0eyBbcHJvcGVydHlQYXRoXTogZW50aXR5VHlwZS5yZXNvbHZlUGF0aChwcm9wZXJ0eVBhdGgpIH0sXG5cdFx0XHRcdFx0YW5ub3RhdGlvbkNvbHVtbnMsXG5cdFx0XHRcdFx0W10sXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRlbnRpdHlUeXBlLFxuXHRcdFx0XHRcdFtdXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFubm90YXRpb25Db2x1bW5zLnB1c2gocmVsYXRlZENvbHVtbnNbMF0pO1xuXHRcdFx0XHRyZXR1cm4gcmVsYXRlZENvbHVtbnNbMF0ubmFtZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBtYXRjaGVkUHJvcGVydGllcztcbn07XG5cbmNvbnN0IF9hcHBlbmRDdXN0b21UZW1wbGF0ZSA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG5cdHJldHVybiBwcm9wZXJ0aWVzXG5cdFx0Lm1hcCgocHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiBgeyR7cHJvcGVydGllcy5pbmRleE9mKHByb3BlcnR5KX19YDtcblx0XHR9KVxuXHRcdC5qb2luKGAke1wiXFxuXCJ9YCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGFibGUgY29sdW1uIGRlZmluaXRpb25zIGZyb20gbWFuaWZlc3QuXG4gKlxuICogVGhlc2UgbWF5IGJlIGN1c3RvbSBjb2x1bW5zIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LCBzbG90IGNvbHVtbnMgY29taW5nIHRocm91Z2hcbiAqIGEgYnVpbGRpbmcgYmxvY2ssIG9yIGFubm90YXRpb24gY29sdW1ucyB0byBvdmVyd3JpdGUgYW5ub3RhdGlvbi1iYXNlZCBjb2x1bW5zLlxuICpcbiAqIEBwYXJhbSBjb2x1bW5zXG4gKiBAcGFyYW0gYW5ub3RhdGlvbkNvbHVtbnNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gZW50aXR5VHlwZVxuICogQHBhcmFtIG5hdmlnYXRpb25TZXR0aW5nc1xuICogQHJldHVybnMgVGhlIGNvbHVtbnMgZnJvbSB0aGUgbWFuaWZlc3RcbiAqL1xuY29uc3QgZ2V0Q29sdW1uc0Zyb21NYW5pZmVzdCA9IGZ1bmN0aW9uIChcblx0Y29sdW1uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uIHwgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGU+LFxuXHRhbm5vdGF0aW9uQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdG5hdmlnYXRpb25TZXR0aW5ncz86IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb25cbik6IFJlY29yZDxzdHJpbmcsIE1hbmlmZXN0Q29sdW1uPiB7XG5cdGNvbnN0IGludGVybmFsQ29sdW1uczogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RDb2x1bW4+ID0ge307XG5cblx0ZnVuY3Rpb24gaXNBbm5vdGF0aW9uQ29sdW1uKFxuXHRcdGNvbHVtbjogQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uIHwgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUsXG5cdFx0a2V5OiBzdHJpbmdcblx0KTogY29sdW1uIGlzIEN1c3RvbURlZmluZWRUYWJsZUNvbHVtbkZvck92ZXJyaWRlIHtcblx0XHRyZXR1cm4gYW5ub3RhdGlvbkNvbHVtbnMuc29tZSgoYW5ub3RhdGlvbkNvbHVtbikgPT4gYW5ub3RhdGlvbkNvbHVtbi5rZXkgPT09IGtleSk7XG5cdH1cblxuXHRmdW5jdGlvbiBpc1Nsb3RDb2x1bW4obWFuaWZlc3RDb2x1bW46IGFueSk6IG1hbmlmZXN0Q29sdW1uIGlzIEZyYWdtZW50RGVmaW5lZFNsb3RDb2x1bW4ge1xuXHRcdHJldHVybiBtYW5pZmVzdENvbHVtbi50eXBlID09PSBDb2x1bW5UeXBlLlNsb3Q7XG5cdH1cblxuXHRmdW5jdGlvbiBpc0N1c3RvbUNvbHVtbihtYW5pZmVzdENvbHVtbjogYW55KTogbWFuaWZlc3RDb2x1bW4gaXMgTWFuaWZlc3REZWZpbmVkQ3VzdG9tQ29sdW1uIHtcblx0XHRyZXR1cm4gbWFuaWZlc3RDb2x1bW4udHlwZSA9PT0gdW5kZWZpbmVkICYmICEhbWFuaWZlc3RDb2x1bW4udGVtcGxhdGU7XG5cdH1cblxuXHRmdW5jdGlvbiBfdXBkYXRlTGlua2VkUHJvcGVydGllc09uQ3VzdG9tQ29sdW1ucyhwcm9wZXJ0eUluZm9zOiBzdHJpbmdbXSwgYW5ub3RhdGlvblRhYmxlQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10pIHtcblx0XHRjb25zdCBub25Tb3J0YWJsZUNvbHVtbnM6IHN0cmluZ1tdID0gZ2V0Tm9uU29ydGFibGVQcm9wZXJ0aWVzUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpO1xuXHRcdHByb3BlcnR5SW5mb3MuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdGFubm90YXRpb25UYWJsZUNvbHVtbnMuZm9yRWFjaCgocHJvcCkgPT4ge1xuXHRcdFx0XHRpZiAocHJvcC5uYW1lID09PSBwcm9wZXJ0eSkge1xuXHRcdFx0XHRcdHByb3Auc29ydGFibGUgPSBub25Tb3J0YWJsZUNvbHVtbnMuaW5kZXhPZihwcm9wZXJ0eS5yZXBsYWNlKFwiUHJvcGVydHk6OlwiLCBcIlwiKSkgPT09IC0xO1xuXHRcdFx0XHRcdHByb3AuaXNHcm91cGFibGUgPSBwcm9wLnNvcnRhYmxlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdGZvciAoY29uc3Qga2V5IGluIGNvbHVtbnMpIHtcblx0XHRjb25zdCBtYW5pZmVzdENvbHVtbiA9IGNvbHVtbnNba2V5XTtcblx0XHRLZXlIZWxwZXIudmFsaWRhdGVLZXkoa2V5KTtcblxuXHRcdC8vIEJhc2VUYWJsZUNvbHVtblxuXHRcdGNvbnN0IGJhc2VUYWJsZUNvbHVtbiA9IHtcblx0XHRcdGtleToga2V5LFxuXHRcdFx0d2lkdGg6IG1hbmlmZXN0Q29sdW1uLndpZHRoIHx8IHVuZGVmaW5lZCxcblx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdGFuY2hvcjogbWFuaWZlc3RDb2x1bW4ucG9zaXRpb24/LmFuY2hvcixcblx0XHRcdFx0cGxhY2VtZW50OiBtYW5pZmVzdENvbHVtbi5wb3NpdGlvbiA9PT0gdW5kZWZpbmVkID8gUGxhY2VtZW50LkFmdGVyIDogbWFuaWZlc3RDb2x1bW4ucG9zaXRpb24ucGxhY2VtZW50XG5cdFx0XHR9LFxuXHRcdFx0Y2FzZVNlbnNpdGl2ZTogaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlKGNvbnZlcnRlckNvbnRleHQpXG5cdFx0fTtcblxuXHRcdGlmIChpc0Fubm90YXRpb25Db2x1bW4obWFuaWZlc3RDb2x1bW4sIGtleSkpIHtcblx0XHRcdGNvbnN0IHByb3BlcnRpZXNUb092ZXJ3cml0ZUFubm90YXRpb25Db2x1bW46IEN1c3RvbUVsZW1lbnQ8QW5ub3RhdGlvblRhYmxlQ29sdW1uRm9yT3ZlcnJpZGU+ID0ge1xuXHRcdFx0XHQuLi5iYXNlVGFibGVDb2x1bW4sXG5cdFx0XHRcdGltcG9ydGFuY2U6IG1hbmlmZXN0Q29sdW1uPy5pbXBvcnRhbmNlLFxuXHRcdFx0XHRob3Jpem9udGFsQWxpZ246IG1hbmlmZXN0Q29sdW1uPy5ob3Jpem9udGFsQWxpZ24sXG5cdFx0XHRcdGF2YWlsYWJpbGl0eTogbWFuaWZlc3RDb2x1bW4/LmF2YWlsYWJpbGl0eSxcblx0XHRcdFx0dHlwZTogQ29sdW1uVHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0XHRpc05hdmlnYWJsZTogaXNBbm5vdGF0aW9uQ29sdW1uKG1hbmlmZXN0Q29sdW1uLCBrZXkpXG5cdFx0XHRcdFx0PyB1bmRlZmluZWRcblx0XHRcdFx0XHQ6IGlzQWN0aW9uTmF2aWdhYmxlKG1hbmlmZXN0Q29sdW1uLCBuYXZpZ2F0aW9uU2V0dGluZ3MsIHRydWUpLFxuXHRcdFx0XHRzZXR0aW5nczogbWFuaWZlc3RDb2x1bW4uc2V0dGluZ3MsXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IF9nZXREZWZhdWx0Rm9ybWF0T3B0aW9uc0ZvclRhYmxlKG1hbmlmZXN0Q29sdW1uLmZvcm1hdE9wdGlvbnMpXG5cdFx0XHR9O1xuXHRcdFx0aW50ZXJuYWxDb2x1bW5zW2tleV0gPSBwcm9wZXJ0aWVzVG9PdmVyd3JpdGVBbm5vdGF0aW9uQ29sdW1uO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eUluZm9zOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IF9nZXRQcm9wZXJ0eU5hbWVzKFxuXHRcdFx0XHRtYW5pZmVzdENvbHVtbi5wcm9wZXJ0aWVzLFxuXHRcdFx0XHRhbm5vdGF0aW9uQ29sdW1ucyxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0ZW50aXR5VHlwZVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGJhc2VNYW5pZmVzdENvbHVtbiA9IHtcblx0XHRcdFx0Li4uYmFzZVRhYmxlQ29sdW1uLFxuXHRcdFx0XHRoZWFkZXI6IG1hbmlmZXN0Q29sdW1uLmhlYWRlcixcblx0XHRcdFx0aW1wb3J0YW5jZTogbWFuaWZlc3RDb2x1bW4/LmltcG9ydGFuY2UgfHwgSW1wb3J0YW5jZS5Ob25lLFxuXHRcdFx0XHRob3Jpem9udGFsQWxpZ246IG1hbmlmZXN0Q29sdW1uPy5ob3Jpem9udGFsQWxpZ24gfHwgSG9yaXpvbnRhbEFsaWduLkJlZ2luLFxuXHRcdFx0XHRhdmFpbGFiaWxpdHk6IG1hbmlmZXN0Q29sdW1uPy5hdmFpbGFiaWxpdHkgfHwgQXZhaWxhYmlsaXR5VHlwZS5EZWZhdWx0LFxuXHRcdFx0XHR0ZW1wbGF0ZTogbWFuaWZlc3RDb2x1bW4udGVtcGxhdGUsXG5cdFx0XHRcdHByb3BlcnR5SW5mb3M6IHByb3BlcnR5SW5mb3MsXG5cdFx0XHRcdGV4cG9ydFNldHRpbmdzOiBwcm9wZXJ0eUluZm9zXG5cdFx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRcdHRlbXBsYXRlOiBfYXBwZW5kQ3VzdG9tVGVtcGxhdGUocHJvcGVydHlJbmZvcyksXG5cdFx0XHRcdFx0XHRcdHdyYXA6ICEhKHByb3BlcnR5SW5mb3MubGVuZ3RoID4gMSlcblx0XHRcdFx0XHQgIH1cblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdGlkOiBgQ3VzdG9tQ29sdW1uOjoke2tleX1gLFxuXHRcdFx0XHRuYW1lOiBgQ3VzdG9tQ29sdW1uOjoke2tleX1gLFxuXHRcdFx0XHQvL05lZWRlZCBmb3IgTURDOlxuXHRcdFx0XHRmb3JtYXRPcHRpb25zOiB7IHRleHRMaW5lc0VkaXQ6IDQgfSxcblx0XHRcdFx0aXNHcm91cGFibGU6IGZhbHNlLFxuXHRcdFx0XHRpc05hdmlnYWJsZTogZmFsc2UsXG5cdFx0XHRcdHNvcnRhYmxlOiBmYWxzZSxcblx0XHRcdFx0dmlzdWFsU2V0dGluZ3M6IHsgd2lkdGhDYWxjdWxhdGlvbjogbnVsbCB9LFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiBtYW5pZmVzdENvbHVtbi5wcm9wZXJ0aWVzXG5cdFx0XHR9O1xuXHRcdFx0aWYgKHByb3BlcnR5SW5mb3MpIHtcblx0XHRcdFx0X3VwZGF0ZUxpbmtlZFByb3BlcnRpZXNPbkN1c3RvbUNvbHVtbnMocHJvcGVydHlJbmZvcywgYW5ub3RhdGlvbkNvbHVtbnMpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaXNTbG90Q29sdW1uKG1hbmlmZXN0Q29sdW1uKSkge1xuXHRcdFx0XHRjb25zdCBjdXN0b21UYWJsZUNvbHVtbjogQ3VzdG9tRWxlbWVudDxDdXN0b21CYXNlZFRhYmxlQ29sdW1uPiA9IHtcblx0XHRcdFx0XHQuLi5iYXNlTWFuaWZlc3RDb2x1bW4sXG5cdFx0XHRcdFx0dHlwZTogQ29sdW1uVHlwZS5TbG90XG5cdFx0XHRcdH07XG5cdFx0XHRcdGludGVybmFsQ29sdW1uc1trZXldID0gY3VzdG9tVGFibGVDb2x1bW47XG5cdFx0XHR9IGVsc2UgaWYgKGlzQ3VzdG9tQ29sdW1uKG1hbmlmZXN0Q29sdW1uKSkge1xuXHRcdFx0XHRjb25zdCBjdXN0b21UYWJsZUNvbHVtbjogQ3VzdG9tRWxlbWVudDxDdXN0b21CYXNlZFRhYmxlQ29sdW1uPiA9IHtcblx0XHRcdFx0XHQuLi5iYXNlTWFuaWZlc3RDb2x1bW4sXG5cdFx0XHRcdFx0dHlwZTogQ29sdW1uVHlwZS5EZWZhdWx0XG5cdFx0XHRcdH07XG5cdFx0XHRcdGludGVybmFsQ29sdW1uc1trZXldID0gY3VzdG9tVGFibGVDb2x1bW47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBtZXNzYWdlID0gYFRoZSBhbm5vdGF0aW9uIGNvbHVtbiAnJHtrZXl9JyByZWZlcmVuY2VkIGluIHRoZSBtYW5pZmVzdCBpcyBub3QgZm91bmRgO1xuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHRcdFx0LmdldERpYWdub3N0aWNzKClcblx0XHRcdFx0XHQuYWRkSXNzdWUoXG5cdFx0XHRcdFx0XHRJc3N1ZUNhdGVnb3J5Lk1hbmlmZXN0LFxuXHRcdFx0XHRcdFx0SXNzdWVTZXZlcml0eS5Mb3csXG5cdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0SXNzdWVDYXRlZ29yeVR5cGUsXG5cdFx0XHRcdFx0XHRJc3N1ZUNhdGVnb3J5VHlwZT8uQW5ub3RhdGlvbkNvbHVtbnM/LkludmFsaWRLZXlcblx0XHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gaW50ZXJuYWxDb2x1bW5zO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFAxM25Nb2RlKFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHR0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbjogVGFibGVDb250cm9sQ29uZmlndXJhdGlvblxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyOiBNYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCB0YWJsZU1hbmlmZXN0U2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0Y29uc3QgdmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50VHlwZSA9IG1hbmlmZXN0V3JhcHBlci5nZXRWYXJpYW50TWFuYWdlbWVudCgpO1xuXHRjb25zdCBhUGVyc29uYWxpemF0aW9uOiBzdHJpbmdbXSA9IFtdO1xuXHRjb25zdCBpc0FuYWx5dGljYWxUYWJsZSA9IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLnR5cGUgPT09IFwiQW5hbHl0aWNhbFRhYmxlXCI7XG5cdGNvbnN0IGlzUmVzcG9uc2l2ZVRhYmxlID0gdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24udHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIjtcblx0aWYgKHRhYmxlTWFuaWZlc3RTZXR0aW5ncz8udGFibGVTZXR0aW5ncz8ucGVyc29uYWxpemF0aW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHQvLyBQZXJzb25hbGl6YXRpb24gY29uZmlndXJlZCBpbiBtYW5pZmVzdC5cblx0XHRjb25zdCBwZXJzb25hbGl6YXRpb246IGFueSA9IHRhYmxlTWFuaWZlc3RTZXR0aW5ncy50YWJsZVNldHRpbmdzLnBlcnNvbmFsaXphdGlvbjtcblx0XHRpZiAocGVyc29uYWxpemF0aW9uID09PSB0cnVlKSB7XG5cdFx0XHQvLyBUYWJsZSBwZXJzb25hbGl6YXRpb24gZnVsbHkgZW5hYmxlZC5cblx0XHRcdHN3aXRjaCAodGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24udHlwZSkge1xuXHRcdFx0XHRjYXNlIFwiQW5hbHl0aWNhbFRhYmxlXCI6XG5cdFx0XHRcdFx0cmV0dXJuIFwiU29ydCxDb2x1bW4sRmlsdGVyLEdyb3VwLEFnZ3JlZ2F0ZVwiO1xuXHRcdFx0XHRjYXNlIFwiUmVzcG9uc2l2ZVRhYmxlXCI6XG5cdFx0XHRcdFx0cmV0dXJuIFwiU29ydCxDb2x1bW4sRmlsdGVyLEdyb3VwXCI7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIFwiU29ydCxDb2x1bW4sRmlsdGVyXCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgcGVyc29uYWxpemF0aW9uID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHQvLyBTcGVjaWZpYyBwZXJzb25hbGl6YXRpb24gb3B0aW9ucyBlbmFibGVkIGluIG1hbmlmZXN0LiBVc2UgdGhlbSBhcyBpcy5cblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24uc29ydCkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJTb3J0XCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5jb2x1bW4pIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiQ29sdW1uXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5maWx0ZXIpIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiRmlsdGVyXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5ncm91cCAmJiAoaXNBbmFseXRpY2FsVGFibGUgfHwgaXNSZXNwb25zaXZlVGFibGUpKSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkdyb3VwXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5hZ2dyZWdhdGUgJiYgaXNBbmFseXRpY2FsVGFibGUpIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiQWdncmVnYXRlXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGFQZXJzb25hbGl6YXRpb24ubGVuZ3RoID4gMCA/IGFQZXJzb25hbGl6YXRpb24uam9pbihcIixcIikgOiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIE5vIHBlcnNvbmFsaXphdGlvbiBjb25maWd1cmVkIGluIG1hbmlmZXN0LlxuXHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIlNvcnRcIik7XG5cdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiQ29sdW1uXCIpO1xuXHRcdGlmIChjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCkge1xuXHRcdFx0aWYgKHZhcmlhbnRNYW5hZ2VtZW50ID09PSBWYXJpYW50TWFuYWdlbWVudFR5cGUuQ29udHJvbCB8fCBfaXNGaWx0ZXJCYXJIaWRkZW4obWFuaWZlc3RXcmFwcGVyLCBjb252ZXJ0ZXJDb250ZXh0KSkge1xuXHRcdFx0XHQvLyBGZWF0dXJlIHBhcml0eSB3aXRoIFYyLlxuXHRcdFx0XHQvLyBFbmFibGUgdGFibGUgZmlsdGVyaW5nIGJ5IGRlZmF1bHQgb25seSBpbiBjYXNlIG9mIENvbnRyb2wgbGV2ZWwgdmFyaWFudCBtYW5hZ2VtZW50LlxuXHRcdFx0XHQvLyBPciB3aGVuIHRoZSBMUiBmaWx0ZXIgYmFyIGlzIGhpZGRlbiB2aWEgbWFuaWZlc3Qgc2V0dGluZ1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJGaWx0ZXJcIik7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkZpbHRlclwiKTtcblx0XHR9XG5cblx0XHRpZiAoaXNBbmFseXRpY2FsVGFibGUpIHtcblx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkdyb3VwXCIpO1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiQWdncmVnYXRlXCIpO1xuXHRcdH1cblx0XHRpZiAoaXNSZXNwb25zaXZlVGFibGUpIHtcblx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkdyb3VwXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gYVBlcnNvbmFsaXphdGlvbi5qb2luKFwiLFwiKTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBCb29sZWFuIHZhbHVlIHN1Z2dlc3RpbmcgaWYgYSBmaWx0ZXIgYmFyIGlzIGJlaW5nIHVzZWQgb24gdGhlIHBhZ2UuXG4gKlxuICogQ2hhcnQgaGFzIGEgZGVwZW5kZW5jeSB0byBmaWx0ZXIgYmFyIChpc3N1ZSB3aXRoIGxvYWRpbmcgZGF0YSkuIE9uY2UgcmVzb2x2ZWQsIHRoZSBjaGVjayBmb3IgY2hhcnQgc2hvdWxkIGJlIHJlbW92ZWQgaGVyZS5cbiAqIFVudGlsIHRoZW4sIGhpZGluZyBmaWx0ZXIgYmFyIGlzIG5vdyBhbGxvd2VkIGlmIGEgY2hhcnQgaXMgYmVpbmcgdXNlZCBvbiBMUi5cbiAqXG4gKiBAcGFyYW0gbWFuaWZlc3RXcmFwcGVyIE1hbmlmZXN0IHNldHRpbmdzIGdldHRlciBmb3IgdGhlIHBhZ2VcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIEJvb2xlYW4gc3VnZ2VzdGluZyBpZiBhIGZpbHRlciBiYXIgaXMgYmVpbmcgdXNlZCBvbiB0aGUgcGFnZS5cbiAqL1xuZnVuY3Rpb24gX2lzRmlsdGVyQmFySGlkZGVuKG1hbmlmZXN0V3JhcHBlcjogTWFuaWZlc3RXcmFwcGVyLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0bWFuaWZlc3RXcmFwcGVyLmlzRmlsdGVyQmFySGlkZGVuKCkgJiZcblx0XHQhY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKCkgJiZcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpICE9PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlXG5cdCk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIEpTT04gc3RyaW5nIGNvbnRhaW5pbmcgdGhlIHNvcnQgY29uZGl0aW9ucyBmb3IgdGhlIHByZXNlbnRhdGlvbiB2YXJpYW50LlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiBQcmVzZW50YXRpb24gdmFyaWFudCBhbm5vdGF0aW9uXG4gKiBAcGFyYW0gY29sdW1ucyBUYWJsZSBjb2x1bW5zIHByb2Nlc3NlZCBieSB0aGUgY29udmVydGVyXG4gKiBAcmV0dXJucyBTb3J0IGNvbmRpdGlvbnMgZm9yIGEgcHJlc2VudGF0aW9uIHZhcmlhbnQuXG4gKi9cbmZ1bmN0aW9uIGdldFNvcnRDb25kaXRpb25zKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbjogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUgfCB1bmRlZmluZWQsXG5cdGNvbHVtbnM6IFRhYmxlQ29sdW1uW11cbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdC8vIEN1cnJlbnRseSBuYXZpZ2F0aW9uIHByb3BlcnR5IGlzIG5vdCBzdXBwb3J0ZWQgYXMgc29ydGVyXG5cdGNvbnN0IG5vblNvcnRhYmxlUHJvcGVydGllcyA9IGdldE5vblNvcnRhYmxlUHJvcGVydGllc1Jlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpKTtcblx0bGV0IHNvcnRDb25kaXRpb25zOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGlmIChwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj8uU29ydE9yZGVyKSB7XG5cdFx0Y29uc3Qgc29ydGVyczogU29ydGVyVHlwZVtdID0gW107XG5cdFx0Y29uc3QgY29uZGl0aW9ucyA9IHtcblx0XHRcdHNvcnRlcnM6IHNvcnRlcnNcblx0XHR9O1xuXHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLlNvcnRPcmRlci5mb3JFYWNoKChjb25kaXRpb24pID0+IHtcblx0XHRcdGNvbnN0IGNvbmRpdGlvblByb3BlcnR5ID0gY29uZGl0aW9uLlByb3BlcnR5O1xuXHRcdFx0aWYgKGNvbmRpdGlvblByb3BlcnR5ICYmIG5vblNvcnRhYmxlUHJvcGVydGllcy5pbmRleE9mKGNvbmRpdGlvblByb3BlcnR5LiR0YXJnZXQ/Lm5hbWUpID09PSAtMSkge1xuXHRcdFx0XHRjb25zdCBpbmZvTmFtZSA9IGNvbnZlcnRQcm9wZXJ0eVBhdGhzVG9JbmZvTmFtZXMoW2NvbmRpdGlvblByb3BlcnR5XSwgY29sdW1ucylbMF07XG5cdFx0XHRcdGlmIChpbmZvTmFtZSkge1xuXHRcdFx0XHRcdGNvbmRpdGlvbnMuc29ydGVycy5wdXNoKHtcblx0XHRcdFx0XHRcdG5hbWU6IGluZm9OYW1lLFxuXHRcdFx0XHRcdFx0ZGVzY2VuZGluZzogISFjb25kaXRpb24uRGVzY2VuZGluZ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0c29ydENvbmRpdGlvbnMgPSBjb25kaXRpb25zLnNvcnRlcnMubGVuZ3RoID8gSlNPTi5zdHJpbmdpZnkoY29uZGl0aW9ucykgOiB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIHNvcnRDb25kaXRpb25zO1xufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsRXhwYW5zaW9uTGV2ZWwocHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb246IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcblx0aWYgKCFwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbikge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRjb25zdCBsZXZlbCA9IHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLkluaXRpYWxFeHBhbnNpb25MZXZlbD8udmFsdWVPZigpO1xuXG5cdHJldHVybiB0eXBlb2YgbGV2ZWwgPT09IFwibnVtYmVyXCIgPyBsZXZlbCA6IHVuZGVmaW5lZDtcbn1cbi8qKlxuICogQ29udmVydHMgYW4gYXJyYXkgb2YgcHJvcGVydHlQYXRoIHRvIGFuIGFycmF5IG9mIHByb3BlcnR5SW5mbyBuYW1lcy5cbiAqXG4gKiBAcGFyYW0gcGF0aHMgdGhlIGFycmF5IHRvIGJlIGNvbnZlcnRlZFxuICogQHBhcmFtIGNvbHVtbnMgdGhlIGFycmF5IG9mIHByb3BlcnR5SW5mb3NcbiAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHByb3BlcnR5SW5mbyBuYW1lc1xuICovXG5cbmZ1bmN0aW9uIGNvbnZlcnRQcm9wZXJ0eVBhdGhzVG9JbmZvTmFtZXMocGF0aHM6IFByb3BlcnR5UGF0aFtdLCBjb2x1bW5zOiBUYWJsZUNvbHVtbltdKTogc3RyaW5nW10ge1xuXHRjb25zdCBpbmZvTmFtZXM6IHN0cmluZ1tdID0gW107XG5cdGxldCBwcm9wZXJ0eUluZm86IFRhYmxlQ29sdW1uIHwgdW5kZWZpbmVkLCBhbm5vdGF0aW9uQ29sdW1uOiBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdHBhdGhzLmZvckVhY2goKGN1cnJlbnRQYXRoKSA9PiB7XG5cdFx0aWYgKGN1cnJlbnRQYXRoPy52YWx1ZSkge1xuXHRcdFx0cHJvcGVydHlJbmZvID0gY29sdW1ucy5maW5kKChjb2x1bW4pID0+IHtcblx0XHRcdFx0YW5ub3RhdGlvbkNvbHVtbiA9IGNvbHVtbiBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdFx0XHRcdHJldHVybiAhYW5ub3RhdGlvbkNvbHVtbi5wcm9wZXJ0eUluZm9zICYmIGFubm90YXRpb25Db2x1bW4ucmVsYXRpdmVQYXRoID09PSBjdXJyZW50UGF0aD8udmFsdWU7XG5cdFx0XHR9KTtcblx0XHRcdGlmIChwcm9wZXJ0eUluZm8pIHtcblx0XHRcdFx0aW5mb05hbWVzLnB1c2gocHJvcGVydHlJbmZvLm5hbWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIGluZm9OYW1lcztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZyBQcmVzZW50YXRpb24gVmFyaWFudCBncm91cCBjb25kaXRpb25zLlxuICpcbiAqIEBwYXJhbSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiBQcmVzZW50YXRpb24gdmFyaWFudCBhbm5vdGF0aW9uXG4gKiBAcGFyYW0gY29sdW1ucyBDb252ZXJ0ZXIgcHJvY2Vzc2VkIHRhYmxlIGNvbHVtbnNcbiAqIEBwYXJhbSB0YWJsZVR5cGUgVGhlIHRhYmxlIHR5cGUuXG4gKiBAcmV0dXJucyBHcm91cCBjb25kaXRpb25zIGZvciBhIFByZXNlbnRhdGlvbiB2YXJpYW50LlxuICovXG5mdW5jdGlvbiBnZXRHcm91cENvbmRpdGlvbnMoXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZCxcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXSxcblx0dGFibGVUeXBlOiBzdHJpbmdcbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGxldCBncm91cENvbmRpdGlvbnM6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5Hcm91cEJ5KSB7XG5cdFx0bGV0IGFHcm91cEJ5ID0gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uR3JvdXBCeTtcblx0XHRpZiAodGFibGVUeXBlID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiKSB7XG5cdFx0XHRhR3JvdXBCeSA9IGFHcm91cEJ5LnNsaWNlKDAsIDEpO1xuXHRcdH1cblx0XHRjb25zdCBhR3JvdXBMZXZlbHMgPSBjb252ZXJ0UHJvcGVydHlQYXRoc1RvSW5mb05hbWVzKGFHcm91cEJ5LCBjb2x1bW5zKS5tYXAoKGluZm9OYW1lKSA9PiB7XG5cdFx0XHRyZXR1cm4geyBuYW1lOiBpbmZvTmFtZSB9O1xuXHRcdH0pO1xuXG5cdFx0Z3JvdXBDb25kaXRpb25zID0gYUdyb3VwTGV2ZWxzLmxlbmd0aCA/IEpTT04uc3RyaW5naWZ5KHsgZ3JvdXBMZXZlbHM6IGFHcm91cExldmVscyB9KSA6IHVuZGVmaW5lZDtcblx0fVxuXHRyZXR1cm4gZ3JvdXBDb25kaXRpb25zO1xufVxuLyoqXG4gKiBVcGRhdGVzIHRoZSBjb2x1bW4ncyBwcm9wZXJ0eUluZm9zIG9mIGEgYW5hbHl0aWNhbCB0YWJsZSBpbnRlZ3JhdGluZyBhbGwgZXh0ZW5zaW9ucyBhbmQgYmluZGluZy1yZWxldmFudCBwcm9wZXJ0eSBpbmZvIHBhcnQuXG4gKlxuICogQHBhcmFtIHRhYmxlVmlzdWFsaXphdGlvbiBUaGUgdmlzdWFsaXphdGlvbiB0byBiZSB1cGRhdGVkXG4gKi9cblxuZnVuY3Rpb24gX3VwZGF0ZVByb3BlcnR5SW5mb3NXaXRoQWdncmVnYXRlc0RlZmluaXRpb25zKHRhYmxlVmlzdWFsaXphdGlvbjogVGFibGVWaXN1YWxpemF0aW9uKSB7XG5cdGNvbnN0IHJlbGF0ZWRBZGRpdGlvbmFsUHJvcGVydHlOYW1lTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cdHRhYmxlVmlzdWFsaXphdGlvbi5jb2x1bW5zLmZvckVhY2goKGNvbHVtbikgPT4ge1xuXHRcdGNvbHVtbiA9IGNvbHVtbiBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdFx0Y29uc3QgYWdncmVnYXRhYmxlUHJvcGVydHlOYW1lID0gT2JqZWN0LmtleXModGFibGVWaXN1YWxpemF0aW9uLmFnZ3JlZ2F0ZXMhKS5maW5kKChhZ2dyZWdhdGUpID0+IGFnZ3JlZ2F0ZSA9PT0gY29sdW1uLm5hbWUpO1xuXHRcdGlmIChhZ2dyZWdhdGFibGVQcm9wZXJ0eU5hbWUpIHtcblx0XHRcdGNvbnN0IGFnZ3JlZ2F0YWJsZVByb3BlcnR5RGVmaW5pdGlvbiA9IHRhYmxlVmlzdWFsaXphdGlvbi5hZ2dyZWdhdGVzIVthZ2dyZWdhdGFibGVQcm9wZXJ0eU5hbWVdO1xuXHRcdFx0Y29sdW1uLmFnZ3JlZ2F0YWJsZSA9IHRydWU7XG5cdFx0XHRjb2x1bW4uZXh0ZW5zaW9uID0ge1xuXHRcdFx0XHRjdXN0b21BZ2dyZWdhdGU6IGFnZ3JlZ2F0YWJsZVByb3BlcnR5RGVmaW5pdGlvbi5kZWZhdWx0QWdncmVnYXRlID8/IHt9XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRpZiAoY29sdW1uLmFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zPy5sZW5ndGgpIHtcblx0XHRcdGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcy5mb3JFYWNoKChhZGRpdGlvbmFsUHJvcGVydHlJbmZvKSA9PiB7XG5cdFx0XHRcdC8vIENyZWF0ZSBwcm9wZXJ0eUluZm8gZm9yIGVhY2ggYWRkaXRpb25hbCBwcm9wZXJ0eS5cblx0XHRcdFx0Ly8gVGhlIG5ldyBwcm9wZXJ0eSAnbmFtZScgaGFzIGJlZW4gcHJlZml4ZWQgd2l0aCAnUHJvcGVydHlfVGVjaG5pY2FsOjonIGZvciB1bmlxdWVuZXNzIGFuZCBpdCBoYXMgYmVlbiBuYW1lZCB0ZWNobmljYWwgcHJvcGVydHkgYXMgaXQgcmVxdWlyZXMgZGVkaWNhdGVkIE1EQyBhdHRyaWJ1dGVzICh0ZWNobmljYWxseUdyb3VwYWJsZSBhbmQgdGVjaG5pY2FsbHlBZ2dyZWdhdGFibGUpLlxuXHRcdFx0XHRjcmVhdGVUZWNobmljYWxQcm9wZXJ0eShhZGRpdGlvbmFsUHJvcGVydHlJbmZvLCB0YWJsZVZpc3VhbGl6YXRpb24uY29sdW1ucywgcmVsYXRlZEFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVNYXApO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcblx0dGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0Y29sdW1uID0gY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRpZiAoY29sdW1uLmFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRjb2x1bW4uYWRkaXRpb25hbFByb3BlcnR5SW5mb3MgPSBjb2x1bW4uYWRkaXRpb25hbFByb3BlcnR5SW5mb3MubWFwKFxuXHRcdFx0XHQocHJvcGVydHlJbmZvKSA9PiByZWxhdGVkQWRkaXRpb25hbFByb3BlcnR5TmFtZU1hcFtwcm9wZXJ0eUluZm9dID8/IHByb3BlcnR5SW5mb1xuXHRcdFx0KTtcblx0XHRcdC8vIEFkZCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgdG8gdGhlIGNvbXBsZXggcHJvcGVydHkgdXNpbmcgdGhlIGhpZGRlbiBhbm5vdGF0aW9uLlxuXHRcdFx0Y29sdW1uLnByb3BlcnR5SW5mb3MgPSBjb2x1bW4ucHJvcGVydHlJbmZvcz8uY29uY2F0KGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcyk7XG5cdFx0fVxuXHR9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZyBQcmVzZW50YXRpb24gVmFyaWFudCBhZ2dyZWdhdGUgY29uZGl0aW9ucy5cbiAqXG4gKiBAcGFyYW0gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24gUHJlc2VudGF0aW9uIHZhcmlhbnQgYW5ub3RhdGlvblxuICogQHBhcmFtIGNvbHVtbnMgQ29udmVydGVyIHByb2Nlc3NlZCB0YWJsZSBjb2x1bW5zXG4gKiBAcmV0dXJucyBHcm91cCBjb25kaXRpb25zIGZvciBhIFByZXNlbnRhdGlvbiB2YXJpYW50LlxuICovXG5mdW5jdGlvbiBnZXRBZ2dyZWdhdGVDb25kaXRpb25zKFxuXHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbjogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUgfCB1bmRlZmluZWQsXG5cdGNvbHVtbnM6IFRhYmxlQ29sdW1uW11cbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGxldCBhZ2dyZWdhdGVDb25kaXRpb25zOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGlmIChwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj8uVG90YWwpIHtcblx0XHRjb25zdCBhVG90YWxzID0gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uVG90YWw7XG5cdFx0Y29uc3QgYWdncmVnYXRlczogUmVjb3JkPHN0cmluZywgb2JqZWN0PiA9IHt9O1xuXHRcdGNvbnZlcnRQcm9wZXJ0eVBhdGhzVG9JbmZvTmFtZXMoYVRvdGFscywgY29sdW1ucykuZm9yRWFjaCgoaW5mb05hbWUpID0+IHtcblx0XHRcdGFnZ3JlZ2F0ZXNbaW5mb05hbWVdID0ge307XG5cdFx0fSk7XG5cblx0XHRhZ2dyZWdhdGVDb25kaXRpb25zID0gSlNPTi5zdHJpbmdpZnkoYWdncmVnYXRlcyk7XG5cdH1cblxuXHRyZXR1cm4gYWdncmVnYXRlQ29uZGl0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24oXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uLFxuXHRjb2x1bW5zOiBUYWJsZUNvbHVtbltdLFxuXHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj86IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlLFxuXHR2aWV3Q29uZmlndXJhdGlvbj86IFZpZXdQYXRoQ29uZmlndXJhdGlvblxuKTogVGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbiB7XG5cdC8vIE5lZWQgdG8gZ2V0IHRoZSB0YXJnZXRcblx0Y29uc3QgeyBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIH0gPSBzcGxpdFBhdGgodmlzdWFsaXphdGlvblBhdGgpO1xuXHRjb25zdCB0aXRsZTogYW55ID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkudGFyZ2V0RW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LkhlYWRlckluZm8/LlR5cGVOYW1lUGx1cmFsO1xuXHRjb25zdCBlbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS50YXJnZXRFbnRpdHlTZXQ7XG5cdGNvbnN0IHBhZ2VNYW5pZmVzdFNldHRpbmdzOiBNYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCBoYXNBYnNvbHV0ZVBhdGggPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCA9PT0gMCxcblx0XHRwMTNuTW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gZ2V0UDEzbk1vZGUodmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQsIHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKSxcblx0XHRpZCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPyBnZXRUYWJsZUlEKHZpc3VhbGl6YXRpb25QYXRoKSA6IGdldFRhYmxlSUQoY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpLCBcIkxpbmVJdGVtXCIpO1xuXHRjb25zdCB0YXJnZXRDYXBhYmlsaXRpZXMgPSBnZXRDYXBhYmlsaXR5UmVzdHJpY3Rpb24oY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG5hdmlnYXRpb25UYXJnZXRQYXRoID0gZ2V0TmF2aWdhdGlvblRhcmdldFBhdGgoY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aCk7XG5cdGNvbnN0IG5hdmlnYXRpb25TZXR0aW5ncyA9IHBhZ2VNYW5pZmVzdFNldHRpbmdzLmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKG5hdmlnYXRpb25UYXJnZXRQYXRoKTtcblx0Y29uc3QgY3JlYXRpb25CZWhhdmlvdXIgPSBfZ2V0Q3JlYXRpb25CZWhhdmlvdXIoXG5cdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLFxuXHRcdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0bmF2aWdhdGlvblNldHRpbmdzLFxuXHRcdHZpc3VhbGl6YXRpb25QYXRoXG5cdCk7XG5cdGNvbnN0IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQgPSBnZW5lcmF0ZVN0YW5kYXJkQWN0aW9uc0NvbnRleHQoXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRjcmVhdGlvbkJlaGF2aW91ci5tb2RlIGFzIENyZWF0aW9uTW9kZSxcblx0XHR0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0XHR2aWV3Q29uZmlndXJhdGlvblxuXHQpO1xuXG5cdGNvbnN0IGRlbGV0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uID0gZ2V0RGVsZXRlVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblx0Y29uc3QgY3JlYXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24gPSBnZXRDcmVhdGVWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpO1xuXHRjb25zdCBtYXNzRWRpdEJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uID0gZ2V0TWFzc0VkaXRWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpO1xuXHRjb25zdCBpc0luc2VydFVwZGF0ZVRlbXBsYXRlZCA9IGdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nKFxuXHRcdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsXG5cdFx0aXNEcmFmdE9yU3RpY2t5U3VwcG9ydGVkKGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdGNvbXBpbGVFeHByZXNzaW9uKGNyZWF0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uKSA9PT0gXCJmYWxzZVwiXG5cdCk7XG5cblx0Y29uc3Qgc2VsZWN0aW9uTW9kZSA9IGdldFNlbGVjdGlvbk1vZGUoXG5cdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLFxuXHRcdHZpc3VhbGl6YXRpb25QYXRoLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0aGFzQWJzb2x1dGVQYXRoLFxuXHRcdHRhcmdldENhcGFiaWxpdGllcyxcblx0XHRkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbixcblx0XHRtYXNzRWRpdEJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uXG5cdCk7XG5cdGxldCB0aHJlc2hvbGQgPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID8gMTAgOiAzMDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5NYXhJdGVtcykge1xuXHRcdHRocmVzaG9sZCA9IHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLk1heEl0ZW1zLnZhbHVlT2YoKSBhcyBudW1iZXI7XG5cdH1cblxuXHRjb25zdCB2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnRUeXBlID0gcGFnZU1hbmlmZXN0U2V0dGluZ3MuZ2V0VmFyaWFudE1hbmFnZW1lbnQoKTtcblx0Y29uc3QgaXNTZWFyY2hhYmxlID0gaXNQYXRoU2VhcmNoYWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSk7XG5cdGNvbnN0IHN0YW5kYXJkQWN0aW9ucyA9IHtcblx0XHRjcmVhdGU6IGdldFN0YW5kYXJkQWN0aW9uQ3JlYXRlKGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpLFxuXHRcdGRlbGV0ZTogZ2V0U3RhbmRhcmRBY3Rpb25EZWxldGUoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCksXG5cdFx0cGFzdGU6IGdldFN0YW5kYXJkQWN0aW9uUGFzdGUoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgaXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQpLFxuXHRcdG1hc3NFZGl0OiBnZXRTdGFuZGFyZEFjdGlvbk1hc3NFZGl0KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpLFxuXHRcdGNyZWF0aW9uUm93OiBnZXRDcmVhdGlvblJvdyhjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KVxuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0aWQ6IGlkLFxuXHRcdGVudGl0eU5hbWU6IGVudGl0eVNldCA/IGVudGl0eVNldC5uYW1lIDogXCJcIixcblx0XHRjb2xsZWN0aW9uOiBnZXRUYXJnZXRPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpKSxcblx0XHRuYXZpZ2F0aW9uUGF0aDogbmF2aWdhdGlvblByb3BlcnR5UGF0aCxcblx0XHRyb3c6IF9nZXRSb3dDb25maWd1cmF0aW9uUHJvcGVydHkoXG5cdFx0XHRsaW5lSXRlbUFubm90YXRpb24sXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0bmF2aWdhdGlvblNldHRpbmdzLFxuXHRcdFx0bmF2aWdhdGlvblRhcmdldFBhdGgsXG5cdFx0XHR0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlXG5cdFx0KSxcblx0XHRwMTNuTW9kZTogcDEzbk1vZGUsXG5cdFx0c3RhbmRhcmRBY3Rpb25zOiB7XG5cdFx0XHRhY3Rpb25zOiBzdGFuZGFyZEFjdGlvbnMsXG5cdFx0XHRpc0luc2VydFVwZGF0ZVRlbXBsYXRlZDogaXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQsXG5cdFx0XHR1cGRhdGFibGVQcm9wZXJ0eVBhdGg6IGdldEN1cnJlbnRFbnRpdHlTZXRVcGRhdGFibGVQYXRoKGNvbnZlcnRlckNvbnRleHQpXG5cdFx0fSxcblx0XHRkaXNwbGF5TW9kZTogaXNJbkRpc3BsYXlNb2RlKGNvbnZlcnRlckNvbnRleHQsIHZpZXdDb25maWd1cmF0aW9uKSxcblx0XHRjcmVhdGU6IGNyZWF0aW9uQmVoYXZpb3VyLFxuXHRcdHNlbGVjdGlvbk1vZGU6IHNlbGVjdGlvbk1vZGUsXG5cdFx0YXV0b0JpbmRPbkluaXQ6XG5cdFx0XHRfaXNGaWx0ZXJCYXJIaWRkZW4ocGFnZU1hbmlmZXN0U2V0dGluZ3MsIGNvbnZlcnRlckNvbnRleHQpIHx8XG5cdFx0XHQoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSAhPT0gVGVtcGxhdGVUeXBlLkxpc3RSZXBvcnQgJiZcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSAhPT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZSAmJlxuXHRcdFx0XHQhKHZpZXdDb25maWd1cmF0aW9uICYmIHBhZ2VNYW5pZmVzdFNldHRpbmdzLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnModmlld0NvbmZpZ3VyYXRpb24pKSksXG5cdFx0dmFyaWFudE1hbmFnZW1lbnQ6IHZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIkNvbnRyb2xcIiAmJiAhcDEzbk1vZGUgPyBWYXJpYW50TWFuYWdlbWVudFR5cGUuTm9uZSA6IHZhcmlhbnRNYW5hZ2VtZW50LFxuXHRcdHRocmVzaG9sZDogdGhyZXNob2xkLFxuXHRcdHNvcnRDb25kaXRpb25zOiBnZXRTb3J0Q29uZGl0aW9ucyhjb252ZXJ0ZXJDb250ZXh0LCBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiwgY29sdW1ucyksXG5cdFx0dGl0bGU6IHRpdGxlLFxuXHRcdHNlYXJjaGFibGU6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLnR5cGUgIT09IFwiQW5hbHl0aWNhbFRhYmxlXCIgJiYgIShpc0NvbnN0YW50KGlzU2VhcmNoYWJsZSkgJiYgaXNTZWFyY2hhYmxlLnZhbHVlID09PSBmYWxzZSksXG5cdFx0aW5pdGlhbEV4cGFuc2lvbkxldmVsOiBnZXRJbml0aWFsRXhwYW5zaW9uTGV2ZWwocHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24pXG5cdH07XG59XG5cbmZ1bmN0aW9uIF9nZXRFeHBvcnREYXRhVHlwZShkYXRhVHlwZTogc3RyaW5nLCBpc0NvbXBsZXhQcm9wZXJ0eTogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcblx0bGV0IGV4cG9ydERhdGFUeXBlOiBzdHJpbmcgPSBcIlN0cmluZ1wiO1xuXHRpZiAoaXNDb21wbGV4UHJvcGVydHkpIHtcblx0XHRpZiAoZGF0YVR5cGUgPT09IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIpIHtcblx0XHRcdGV4cG9ydERhdGFUeXBlID0gXCJEYXRlVGltZVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gZXhwb3J0RGF0YVR5cGU7XG5cdH0gZWxzZSB7XG5cdFx0c3dpdGNoIChkYXRhVHlwZSkge1xuXHRcdFx0Y2FzZSBcIkVkbS5EZWNpbWFsXCI6XG5cdFx0XHRjYXNlIFwiRWRtLkludDMyXCI6XG5cdFx0XHRjYXNlIFwiRWRtLkludDY0XCI6XG5cdFx0XHRjYXNlIFwiRWRtLkRvdWJsZVwiOlxuXHRcdFx0Y2FzZSBcIkVkbS5CeXRlXCI6XG5cdFx0XHRcdGV4cG9ydERhdGFUeXBlID0gXCJOdW1iZXJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRWRtLkRhdGVPZlRpbWVcIjpcblx0XHRcdGNhc2UgXCJFZG0uRGF0ZVwiOlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiRGF0ZVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjpcblx0XHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIkRhdGVUaW1lXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVkbS5UaW1lT2ZEYXlcIjpcblx0XHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIlRpbWVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRWRtLkJvb2xlYW5cIjpcblx0XHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIkJvb2xlYW5cIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBleHBvcnREYXRhVHlwZTtcbn1cblxuLyoqXG4gKiBTcGxpdCB0aGUgdmlzdWFsaXphdGlvbiBwYXRoIGludG8gdGhlIG5hdmlnYXRpb24gcHJvcGVydHkgcGF0aCBhbmQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEByZXR1cm5zIFRoZSBzcGxpdCBwYXRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdFBhdGgodmlzdWFsaXphdGlvblBhdGg6IHN0cmluZykge1xuXHRsZXQgW25hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIGFubm90YXRpb25QYXRoXSA9IHZpc3VhbGl6YXRpb25QYXRoLnNwbGl0KFwiQFwiKTtcblxuXHRpZiAobmF2aWdhdGlvblByb3BlcnR5UGF0aC5sYXN0SW5kZXhPZihcIi9cIikgPT09IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoIC0gMSkge1xuXHRcdC8vIERyb3AgdHJhaWxpbmcgc2xhc2hcblx0XHRuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5zdWJzdHIoMCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggLSAxKTtcblx0fVxuXHRyZXR1cm4geyBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBhbm5vdGF0aW9uUGF0aCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb24oXG5cdHNlbGVjdGlvblZhcmlhbnRQYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgcmVzb2x2ZWRUYXJnZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKHNlbGVjdGlvblZhcmlhbnRQYXRoKTtcblx0Y29uc3Qgc2VsZWN0aW9uOiBTZWxlY3Rpb25WYXJpYW50VHlwZSA9IHJlc29sdmVkVGFyZ2V0LmFubm90YXRpb24gYXMgU2VsZWN0aW9uVmFyaWFudFR5cGU7XG5cblx0aWYgKHNlbGVjdGlvbikge1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0c2VsZWN0aW9uLlNlbGVjdE9wdGlvbnM/LmZvckVhY2goKHNlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uVHlwZSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lOiBhbnkgPSBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lO1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoOiBzdHJpbmcgPSBwcm9wZXJ0eU5hbWUudmFsdWU7XG5cdFx0XHRpZiAocHJvcGVydHlOYW1lcy5pbmRleE9mKHByb3BlcnR5UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdHByb3BlcnR5TmFtZXMucHVzaChwcm9wZXJ0eVBhdGgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0ZXh0OiBzZWxlY3Rpb24/LlRleHQ/LnRvU3RyaW5nKCksXG5cdFx0XHRwcm9wZXJ0eU5hbWVzOiBwcm9wZXJ0eU5hbWVzXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBfZ2V0RnVsbFNjcmVlbkJhc2VkT25EZXZpY2UoXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGlzSXBob25lOiBib29sZWFuXG4pOiBib29sZWFuIHtcblx0Ly8gSWYgZW5hYmxlRnVsbFNjcmVlbiBpcyBub3Qgc2V0LCB1c2UgYXMgZGVmYXVsdCB0cnVlIG9uIHBob25lIGFuZCBmYWxzZSBvdGhlcndpc2Vcblx0bGV0IGVuYWJsZUZ1bGxTY3JlZW4gPSB0YWJsZVNldHRpbmdzLmVuYWJsZUZ1bGxTY3JlZW4gPz8gaXNJcGhvbmU7XG5cdC8vIE1ha2Ugc3VyZSB0aGF0IGVuYWJsZUZ1bGxTY3JlZW4gaXMgbm90IHNldCBvbiBMaXN0UmVwb3J0IGZvciBkZXNrdG9wIG9yIHRhYmxldFxuXHRpZiAoIWlzSXBob25lICYmIGVuYWJsZUZ1bGxTY3JlZW4gJiYgY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkxpc3RSZXBvcnQpIHtcblx0XHRlbmFibGVGdWxsU2NyZWVuID0gZmFsc2U7XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXREaWFnbm9zdGljcygpLmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuTWFuaWZlc3QsIElzc3VlU2V2ZXJpdHkuTG93LCBJc3N1ZVR5cGUuRlVMTFNDUkVFTk1PREVfTk9UX09OX0xJU1RSRVBPUlQpO1xuXHR9XG5cdHJldHVybiBlbmFibGVGdWxsU2NyZWVuO1xufVxuXG5mdW5jdGlvbiBfZ2V0TXVsdGlTZWxlY3RNb2RlKFxuXHR0YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IG11bHRpU2VsZWN0TW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRpZiAodGFibGVUeXBlICE9PSBcIlJlc3BvbnNpdmVUYWJsZVwiKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRzd2l0Y2ggKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkpIHtcblx0XHRjYXNlIFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0OlxuXHRcdGNhc2UgVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZTpcblx0XHRcdG11bHRpU2VsZWN0TW9kZSA9ICF0YWJsZVNldHRpbmdzLnNlbGVjdEFsbCA/IFwiQ2xlYXJBbGxcIiA6IFwiRGVmYXVsdFwiO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBUZW1wbGF0ZVR5cGUuT2JqZWN0UGFnZTpcblx0XHRcdG11bHRpU2VsZWN0TW9kZSA9IHRhYmxlU2V0dGluZ3Muc2VsZWN0QWxsID09PSBmYWxzZSA/IFwiQ2xlYXJBbGxcIiA6IFwiRGVmYXVsdFwiO1xuXHRcdFx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkudXNlSWNvblRhYkJhcigpKSB7XG5cdFx0XHRcdG11bHRpU2VsZWN0TW9kZSA9ICF0YWJsZVNldHRpbmdzLnNlbGVjdEFsbCA/IFwiQ2xlYXJBbGxcIiA6IFwiRGVmYXVsdFwiO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0fVxuXG5cdHJldHVybiBtdWx0aVNlbGVjdE1vZGU7XG59XG5cbmZ1bmN0aW9uIF9nZXRUYWJsZVR5cGUoXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGFnZ3JlZ2F0aW9uSGVscGVyOiBBZ2dyZWdhdGlvbkhlbHBlcixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogVGFibGVUeXBlIHtcblx0bGV0IHRhYmxlVHlwZSA9IHRhYmxlU2V0dGluZ3M/LnR5cGUgfHwgXCJSZXNwb25zaXZlVGFibGVcIjtcblx0LyogIE5vdywgd2Uga2VlcCB0aGUgY29uZmlndXJhdGlvbiBpbiB0aGUgbWFuaWZlc3QsIGV2ZW4gaWYgaXQgbGVhZHMgdG8gZXJyb3JzLlxuXHRcdFdlIG9ubHkgY2hhbmdlIGlmIHdlJ3JlIG5vdCBvbiBkZXNrdG9wIGZyb20gQW5hbHl0aWNhbC9UcmVlIHRvIFJlc3BvbnNpdmUuXG5cdCAqL1xuXHRpZiAoKHRhYmxlVHlwZSA9PT0gXCJBbmFseXRpY2FsVGFibGVcIiB8fCB0YWJsZVR5cGUgPT09IFwiVHJlZVRhYmxlXCIpICYmICFjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmlzRGVza3RvcCgpKSB7XG5cdFx0dGFibGVUeXBlID0gXCJSZXNwb25zaXZlVGFibGVcIjtcblx0fVxuXHRyZXR1cm4gdGFibGVUeXBlO1xufVxuXG5mdW5jdGlvbiBfZ2V0R3JpZFRhYmxlTW9kZSh0YWJsZVR5cGU6IFRhYmxlVHlwZSwgdGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbiwgaXNUZW1wbGF0ZUxpc3RSZXBvcnQ6IGJvb2xlYW4pOiBhbnkge1xuXHRpZiAodGFibGVUeXBlID09PSBcIkdyaWRUYWJsZVwiKSB7XG5cdFx0aWYgKGlzVGVtcGxhdGVMaXN0UmVwb3J0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyb3dDb3VudE1vZGU6IFwiQXV0b1wiLFxuXHRcdFx0XHRyb3dDb3VudDogXCIzXCJcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHJvd0NvdW50TW9kZTogdGFibGVTZXR0aW5ncy5yb3dDb3VudE1vZGUgPyB0YWJsZVNldHRpbmdzLnJvd0NvdW50TW9kZSA6IFwiRml4ZWRcIixcblx0XHRcdFx0cm93Q291bnQ6IHRhYmxlU2V0dGluZ3Mucm93Q291bnQgPyB0YWJsZVNldHRpbmdzLnJvd0NvdW50IDogNVxuXHRcdFx0fTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9nZXRDb25kZW5zZWRUYWJsZUxheW91dChfdGFibGVUeXBlOiBUYWJsZVR5cGUsIF90YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uKTogYm9vbGVhbiB7XG5cdHJldHVybiBfdGFibGVTZXR0aW5ncy5jb25kZW5zZWRUYWJsZUxheW91dCAhPT0gdW5kZWZpbmVkICYmIF90YWJsZVR5cGUgIT09IFwiUmVzcG9uc2l2ZVRhYmxlXCJcblx0XHQ/IF90YWJsZVNldHRpbmdzLmNvbmRlbnNlZFRhYmxlTGF5b3V0XG5cdFx0OiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gX2dldFRhYmxlU2VsZWN0aW9uTGltaXQoX3RhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24pOiBudW1iZXIge1xuXHRyZXR1cm4gX3RhYmxlU2V0dGluZ3Muc2VsZWN0QWxsID09PSB0cnVlIHx8IF90YWJsZVNldHRpbmdzLnNlbGVjdGlvbkxpbWl0ID09PSAwID8gMCA6IF90YWJsZVNldHRpbmdzLnNlbGVjdGlvbkxpbWl0IHx8IDIwMDtcbn1cblxuZnVuY3Rpb24gX2dldFRhYmxlSW5saW5lQ3JlYXRpb25Sb3dDb3VudChfdGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbik6IG51bWJlciB7XG5cdHJldHVybiBfdGFibGVTZXR0aW5ncy5jcmVhdGlvbk1vZGU/LmlubGluZUNyZWF0aW9uUm93Q291bnQgPyBfdGFibGVTZXR0aW5ncy5jcmVhdGlvbk1vZGU/LmlubGluZUNyZWF0aW9uUm93Q291bnQgOiAyO1xufVxuXG5mdW5jdGlvbiBfZ2V0RmlsdGVycyhcblx0dGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0cXVpY2tGaWx0ZXJQYXRoczogeyBhbm5vdGF0aW9uUGF0aDogc3RyaW5nIH1bXSxcblx0cXVpY2tTZWxlY3Rpb25WYXJpYW50OiBhbnksXG5cdHBhdGg6IHsgYW5ub3RhdGlvblBhdGg6IHN0cmluZyB9LFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBhbnkge1xuXHRpZiAocXVpY2tTZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0cXVpY2tGaWx0ZXJQYXRocy5wdXNoKHsgYW5ub3RhdGlvblBhdGg6IHBhdGguYW5ub3RhdGlvblBhdGggfSk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRxdWlja0ZpbHRlcnM6IHtcblx0XHRcdGVuYWJsZWQ6IGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0LFxuXHRcdFx0c2hvd0NvdW50czogdGFibGVTZXR0aW5ncz8ucXVpY2tWYXJpYW50U2VsZWN0aW9uPy5zaG93Q291bnRzLFxuXHRcdFx0cGF0aHM6IHF1aWNrRmlsdGVyUGF0aHNcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIF9nZXRFbmFibGVFeHBvcnQoXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGVuYWJsZVBhc3RlOiBib29sZWFuXG4pOiBib29sZWFuIHtcblx0cmV0dXJuIHRhYmxlU2V0dGluZ3MuZW5hYmxlRXhwb3J0ICE9PSB1bmRlZmluZWRcblx0XHQ/IHRhYmxlU2V0dGluZ3MuZW5hYmxlRXhwb3J0XG5cdFx0OiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpICE9PSBcIk9iamVjdFBhZ2VcIiB8fCBlbmFibGVQYXN0ZTtcbn1cblxuZnVuY3Rpb24gX2dldEZpbHRlckNvbmZpZ3VyYXRpb24oXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IGFueSB7XG5cdGlmICghbGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cdGNvbnN0IHF1aWNrRmlsdGVyUGF0aHM6IHsgYW5ub3RhdGlvblBhdGg6IHN0cmluZyB9W10gPSBbXTtcblx0Y29uc3QgdGFyZ2V0RW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUobGluZUl0ZW1Bbm5vdGF0aW9uKTtcblx0bGV0IHF1aWNrU2VsZWN0aW9uVmFyaWFudDogYW55O1xuXHRsZXQgZmlsdGVycztcblx0dGFibGVTZXR0aW5ncz8ucXVpY2tWYXJpYW50U2VsZWN0aW9uPy5wYXRocz8uZm9yRWFjaCgocGF0aDogeyBhbm5vdGF0aW9uUGF0aDogc3RyaW5nIH0pID0+IHtcblx0XHRxdWlja1NlbGVjdGlvblZhcmlhbnQgPSB0YXJnZXRFbnRpdHlUeXBlLnJlc29sdmVQYXRoKHBhdGguYW5ub3RhdGlvblBhdGgpO1xuXHRcdGZpbHRlcnMgPSBfZ2V0RmlsdGVycyh0YWJsZVNldHRpbmdzLCBxdWlja0ZpbHRlclBhdGhzLCBxdWlja1NlbGVjdGlvblZhcmlhbnQsIHBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHR9KTtcblxuXHRsZXQgaGlkZVRhYmxlVGl0bGUgPSBmYWxzZTtcblx0aGlkZVRhYmxlVGl0bGUgPSAhIXRhYmxlU2V0dGluZ3MucXVpY2tWYXJpYW50U2VsZWN0aW9uPy5oaWRlVGFibGVUaXRsZTtcblx0cmV0dXJuIHtcblx0XHRmaWx0ZXJzOiBmaWx0ZXJzLFxuXHRcdGhlYWRlclZpc2libGU6ICEocXVpY2tTZWxlY3Rpb25WYXJpYW50ICYmIGhpZGVUYWJsZVRpdGxlKVxuXHR9O1xufVxuXG5mdW5jdGlvbiBfZ2V0Q29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzKHJlbGF0aXZlUGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCksIHJlbGF0aXZlUGF0aCkubmF2aWdhdGlvblByb3BlcnRpZXM7XG5cdGlmIChuYXZpZ2F0aW9uUHJvcGVydGllcz8ubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IGNvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVsczogc3RyaW5nW10gPSBbXTtcblx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcy5mb3JFYWNoKChuYXZQcm9wZXJ0eTogYW55KSA9PiB7XG5cdFx0XHRjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHMucHVzaChnZXRMYWJlbChuYXZQcm9wZXJ0eSkgfHwgbmF2UHJvcGVydHkubmFtZSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGNvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVscztcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24oXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGNoZWNrQ29uZGVuc2VkTGF5b3V0ID0gZmFsc2Vcbik6IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24ge1xuXHRjb25zdCBfbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzOiBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IHRhYmxlU2V0dGluZ3MgPSAodGFibGVNYW5pZmVzdFNldHRpbmdzICYmIHRhYmxlTWFuaWZlc3RTZXR0aW5ncy50YWJsZVNldHRpbmdzKSB8fCB7fTtcblx0Y29uc3QgY3JlYXRpb25Nb2RlID0gdGFibGVTZXR0aW5ncy5jcmVhdGlvbk1vZGU/Lm5hbWUgfHwgQ3JlYXRpb25Nb2RlLk5ld1BhZ2U7XG5cdGNvbnN0IGVuYWJsZUF1dG9Db2x1bW5XaWR0aCA9ICFfbWFuaWZlc3RXcmFwcGVyLmlzUGhvbmUoKTtcblx0Y29uc3QgZW5hYmxlUGFzdGUgPVxuXHRcdHRhYmxlU2V0dGluZ3MuZW5hYmxlUGFzdGUgIT09IHVuZGVmaW5lZCA/IHRhYmxlU2V0dGluZ3MuZW5hYmxlUGFzdGUgOiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBcIk9iamVjdFBhZ2VcIjsgLy8gUGFzdGUgaXMgZGlzYWJsZWQgYnkgZGVmYXVsdCBleGNlcHRlZCBmb3IgT1Bcblx0Y29uc3QgdGVtcGxhdGVUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKTtcblx0Y29uc3QgZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyID0gdGVtcGxhdGVUeXBlID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCA/IFwiQVBJLmRhdGFTdGF0ZUluZGljYXRvckZpbHRlclwiIDogdW5kZWZpbmVkO1xuXHRjb25zdCBpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50ID0gY2hlY2tDb25kZW5zZWRMYXlvdXQgJiYgX21hbmlmZXN0V3JhcHBlci5pc0NvbmRlbnNlZExheW91dENvbXBsaWFudCgpO1xuXHRjb25zdCBvRmlsdGVyQ29uZmlndXJhdGlvbiA9IF9nZXRGaWx0ZXJDb25maWd1cmF0aW9uKHRhYmxlU2V0dGluZ3MsIGxpbmVJdGVtQW5ub3RhdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiA9IHRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5jdXN0b21WYWxpZGF0aW9uRnVuY3Rpb247XG5cdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0Y29uc3QgYWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IHRhYmxlVHlwZTogVGFibGVUeXBlID0gX2dldFRhYmxlVHlwZSh0YWJsZVNldHRpbmdzLCBhZ2dyZWdhdGlvbkhlbHBlciwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IGdyaWRUYWJsZVJvd01vZGUgPSBfZ2V0R3JpZFRhYmxlTW9kZSh0YWJsZVR5cGUsIHRhYmxlU2V0dGluZ3MsIHRlbXBsYXRlVHlwZSA9PT0gVGVtcGxhdGVUeXBlLkxpc3RSZXBvcnQpO1xuXHRjb25zdCBjb25kZW5zZWRUYWJsZUxheW91dCA9IF9nZXRDb25kZW5zZWRUYWJsZUxheW91dCh0YWJsZVR5cGUsIHRhYmxlU2V0dGluZ3MpO1xuXHRjb25zdCBvQ29uZmlndXJhdGlvbiA9IHtcblx0XHQvLyBJZiBubyBjcmVhdGVBdEVuZCBpcyBzcGVjaWZpZWQgaXQgd2lsbCBiZSBmYWxzZSBmb3IgSW5saW5lIGNyZWF0ZSBhbmQgdHJ1ZSBvdGhlcndpc2Vcblx0XHRjcmVhdGVBdEVuZDpcblx0XHRcdHRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5jcmVhdGVBdEVuZCAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdD8gdGFibGVTZXR0aW5ncy5jcmVhdGlvbk1vZGU/LmNyZWF0ZUF0RW5kXG5cdFx0XHRcdDogY3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuSW5saW5lLFxuXHRcdGNyZWF0aW9uTW9kZTogY3JlYXRpb25Nb2RlLFxuXHRcdGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbjogY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLFxuXHRcdGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcjogZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyLFxuXHRcdC8vIGlmIGEgY3VzdG9tIHZhbGlkYXRpb24gZnVuY3Rpb24gaXMgcHJvdmlkZWQsIGRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEgc2hvdWxkIG5vdCBiZSBjb25zaWRlcmVkLCBpLmUuIHNldCB0byBmYWxzZVxuXHRcdGRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGE6ICFjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24gPyAhIXRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5kaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhIDogZmFsc2UsXG5cdFx0ZW5hYmxlQXV0b0NvbHVtbldpZHRoOiBlbmFibGVBdXRvQ29sdW1uV2lkdGgsXG5cdFx0ZW5hYmxlRXhwb3J0OiBfZ2V0RW5hYmxlRXhwb3J0KHRhYmxlU2V0dGluZ3MsIGNvbnZlcnRlckNvbnRleHQsIGVuYWJsZVBhc3RlKSxcblx0XHRlbmFibGVGdWxsU2NyZWVuOiBfZ2V0RnVsbFNjcmVlbkJhc2VkT25EZXZpY2UodGFibGVTZXR0aW5ncywgY29udmVydGVyQ29udGV4dCwgX21hbmlmZXN0V3JhcHBlci5pc1Bob25lKCkpLFxuXHRcdGVuYWJsZU1hc3NFZGl0OiB0YWJsZVNldHRpbmdzPy5lbmFibGVNYXNzRWRpdCxcblx0XHRlbmFibGVQYXN0ZTogZW5hYmxlUGFzdGUsXG5cdFx0aGVhZGVyVmlzaWJsZTogdHJ1ZSxcblx0XHRtdWx0aVNlbGVjdE1vZGU6IF9nZXRNdWx0aVNlbGVjdE1vZGUodGFibGVTZXR0aW5ncywgdGFibGVUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRzZWxlY3Rpb25MaW1pdDogX2dldFRhYmxlU2VsZWN0aW9uTGltaXQodGFibGVTZXR0aW5ncyksXG5cdFx0aW5saW5lQ3JlYXRpb25Sb3dDb3VudDogX2dldFRhYmxlSW5saW5lQ3JlYXRpb25Sb3dDb3VudCh0YWJsZVNldHRpbmdzKSxcblx0XHRpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlOiB0YWJsZVNldHRpbmdzPy5jcmVhdGlvbk1vZGU/LmlubGluZUNyZWF0aW9uUm93c0hpZGRlbkluRWRpdE1vZGUgPz8gZmFsc2UsXG5cdFx0c2hvd1Jvd0NvdW50OiAhdGFibGVTZXR0aW5ncz8ucXVpY2tWYXJpYW50U2VsZWN0aW9uPy5zaG93Q291bnRzICYmICFfbWFuaWZlc3RXcmFwcGVyLmdldFZpZXdDb25maWd1cmF0aW9uKCk/LnNob3dDb3VudHMsXG5cdFx0dHlwZTogdGFibGVUeXBlLFxuXHRcdHVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0OiBjb25kZW5zZWRUYWJsZUxheW91dCAmJiBpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50LFxuXHRcdGlzQ29tcGFjdFR5cGU6IF9tYW5pZmVzdFdyYXBwZXIuaXNDb21wYWN0VHlwZSgpXG5cdH07XG5cblx0Y29uc3QgdGFibGVDb25maWd1cmF0aW9uOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uID0geyAuLi5vQ29uZmlndXJhdGlvbiwgLi4uZ3JpZFRhYmxlUm93TW9kZSwgLi4ub0ZpbHRlckNvbmZpZ3VyYXRpb24gfTtcblxuXHRpZiAodGFibGVUeXBlID09PSBcIlRyZWVUYWJsZVwiKSB7XG5cdFx0dGFibGVDb25maWd1cmF0aW9uLmhpZXJhcmNoeVF1YWxpZmllciA9IHRhYmxlU2V0dGluZ3MuaGllcmFyY2h5UXVhbGlmaWVyO1xuXHR9XG5cblx0cmV0dXJuIHRhYmxlQ29uZmlndXJhdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVDb25maWcob1Byb3BlcnR5OiBQcm9wZXJ0eSB8IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIGRhdGFUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBhbnkge1xuXHRsZXQgb1RhcmdldE1hcHBpbmcgPSBFRE1fVFlQRV9NQVBQSU5HWyhvUHJvcGVydHkgYXMgUHJvcGVydHkpPy50eXBlXSB8fCAoZGF0YVR5cGUgPyBFRE1fVFlQRV9NQVBQSU5HW2RhdGFUeXBlXSA6IHVuZGVmaW5lZCk7XG5cdGlmICghb1RhcmdldE1hcHBpbmcgJiYgKG9Qcm9wZXJ0eSBhcyBQcm9wZXJ0eSk/LnRhcmdldFR5cGUgJiYgKG9Qcm9wZXJ0eSBhcyBQcm9wZXJ0eSkudGFyZ2V0VHlwZT8uX3R5cGUgPT09IFwiVHlwZURlZmluaXRpb25cIikge1xuXHRcdG9UYXJnZXRNYXBwaW5nID0gRURNX1RZUEVfTUFQUElOR1soKG9Qcm9wZXJ0eSBhcyBQcm9wZXJ0eSkudGFyZ2V0VHlwZSBhcyBUeXBlRGVmaW5pdGlvbikudW5kZXJseWluZ1R5cGVdO1xuXHR9XG5cdGNvbnN0IHByb3BlcnR5VHlwZUNvbmZpZzogY29uZmlnVHlwZSA9IHtcblx0XHR0eXBlOiBvVGFyZ2V0TWFwcGluZz8udHlwZSxcblx0XHRjb25zdHJhaW50czoge30sXG5cdFx0Zm9ybWF0T3B0aW9uczoge31cblx0fTtcblx0aWYgKGlzUHJvcGVydHkob1Byb3BlcnR5KSkge1xuXHRcdHByb3BlcnR5VHlwZUNvbmZpZy5jb25zdHJhaW50cyA9IHtcblx0XHRcdHNjYWxlOiBvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uJFNjYWxlID8gb1Byb3BlcnR5LnNjYWxlIDogdW5kZWZpbmVkLFxuXHRcdFx0cHJlY2lzaW9uOiBvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uJFByZWNpc2lvbiA/IG9Qcm9wZXJ0eS5wcmVjaXNpb24gOiB1bmRlZmluZWQsXG5cdFx0XHRtYXhMZW5ndGg6IG9UYXJnZXRNYXBwaW5nLmNvbnN0cmFpbnRzPy4kTWF4TGVuZ3RoID8gb1Byb3BlcnR5Lm1heExlbmd0aCA6IHVuZGVmaW5lZCxcblx0XHRcdG51bGxhYmxlOiBvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uJE51bGxhYmxlID8gb1Byb3BlcnR5Lm51bGxhYmxlIDogdW5kZWZpbmVkLFxuXHRcdFx0bWluaW11bTpcblx0XHRcdFx0b1RhcmdldE1hcHBpbmcuY29uc3RyYWludHM/LltcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NaW5pbXVtLyREZWNpbWFsXCJdICYmXG5cdFx0XHRcdCFpc05hTihvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1pbmltdW0pXG5cdFx0XHRcdFx0PyBgJHtvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1pbmltdW19YFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdFx0bWF4aW11bTpcblx0XHRcdFx0b1RhcmdldE1hcHBpbmcuY29uc3RyYWludHM/LltcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NYXhpbXVtLyREZWNpbWFsXCJdICYmXG5cdFx0XHRcdCFpc05hTihvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1heGltdW0pXG5cdFx0XHRcdFx0PyBgJHtvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1heGltdW19YFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdFx0aXNEaWdpdFNlcXVlbmNlOlxuXHRcdFx0XHRwcm9wZXJ0eVR5cGVDb25maWcudHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJpbmdcIiAmJlxuXHRcdFx0XHRvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uW2BAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNEaWdpdFNlcXVlbmNlfWBdICYmXG5cdFx0XHRcdG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5Jc0RpZ2l0U2VxdWVuY2Vcblx0XHRcdFx0XHQ/IHRydWVcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZFxuXHRcdH07XG5cdH1cblx0cHJvcGVydHlUeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnMgPSB7XG5cdFx0cGFyc2VBc1N0cmluZzpcblx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZz8udHlwZT8uaW5kZXhPZihcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludFwiKSA9PT0gMCB8fFxuXHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnPy50eXBlPy5pbmRleE9mKFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRG91YmxlXCIpID09PSAwXG5cdFx0XHRcdD8gZmFsc2Vcblx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0ZW1wdHlTdHJpbmc6XG5cdFx0XHRwcm9wZXJ0eVR5cGVDb25maWc/LnR5cGU/LmluZGV4T2YoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnRcIikgPT09IDAgfHxcblx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZz8udHlwZT8uaW5kZXhPZihcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRvdWJsZVwiKSA9PT0gMFxuXHRcdFx0XHQ/IFwiXCJcblx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0cGFyc2VLZWVwc0VtcHR5U3RyaW5nOiBwcm9wZXJ0eVR5cGVDb25maWcudHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJpbmdcIiA/IHRydWUgOiB1bmRlZmluZWRcblx0fTtcblx0cmV0dXJuIHByb3BlcnR5VHlwZUNvbmZpZztcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuXHRnZXRUYWJsZUFjdGlvbnMsXG5cdGdldFRhYmxlQ29sdW1ucyxcblx0Z2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlLFxuXHR1cGRhdGVMaW5rZWRQcm9wZXJ0aWVzLFxuXHRjcmVhdGVUYWJsZVZpc3VhbGl6YXRpb24sXG5cdGNyZWF0ZURlZmF1bHRUYWJsZVZpc3VhbGl6YXRpb24sXG5cdGdldENhcGFiaWxpdHlSZXN0cmljdGlvbixcblx0Z2V0U2VsZWN0aW9uTW9kZSxcblx0Z2V0Um93U3RhdHVzVmlzaWJpbGl0eSxcblx0Z2V0SW1wb3J0YW5jZSxcblx0Z2V0UDEzbk1vZGUsXG5cdGdldFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24sXG5cdGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSxcblx0c3BsaXRQYXRoLFxuXHRnZXRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbixcblx0Z2V0VGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdGdldFR5cGVDb25maWcsXG5cdHVwZGF0ZVRhYmxlVmlzdWFsaXphdGlvbkZvclR5cGVcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQWlRS0EsVUFBVSxFQU1mO0VBQUEsV0FOS0EsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtFQUFBLEdBQVZBLFVBQVUsS0FBVkEsVUFBVTtFQThMZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTQyxlQUFlLENBQzlCQyxrQkFBNEIsRUFDNUJDLGlCQUF5QixFQUN6QkMsZ0JBQWtDLEVBQ2xDQyxrQkFBb0QsRUFDbkM7SUFDakIsTUFBTUMsYUFBYSxHQUFHQyx5QkFBeUIsQ0FBQ0wsa0JBQWtCLEVBQUVDLGlCQUFpQixFQUFFQyxnQkFBZ0IsQ0FBQztJQUN4RyxNQUFNSSxrQkFBa0IsR0FBR0YsYUFBYSxDQUFDRyxZQUFZO0lBQ3JELE1BQU1DLGNBQWMsR0FBR0osYUFBYSxDQUFDSyxrQkFBa0I7SUFDdkQsTUFBTUMsZUFBZSxHQUFHQyxzQkFBc0IsQ0FDN0NULGdCQUFnQixDQUFDVSwrQkFBK0IsQ0FBQ1gsaUJBQWlCLENBQUMsQ0FBQ1ksT0FBTyxFQUMzRVgsZ0JBQWdCLEVBQ2hCSSxrQkFBa0IsRUFDbEJILGtCQUFrQixFQUNsQixJQUFJLEVBQ0pLLGNBQWMsQ0FDZDtJQUNELE1BQU1NLHFCQUF5QyxHQUFHO01BQ2pEQyxXQUFXLEVBQUVDLFlBQVksQ0FBQ0MsU0FBUztNQUNuQ0MsY0FBYyxFQUFFRixZQUFZLENBQUNDLFNBQVM7TUFDdENFLGdCQUFnQixFQUFFSCxZQUFZLENBQUNDLFNBQVM7TUFDeENHLE9BQU8sRUFBRUosWUFBWSxDQUFDQyxTQUFTO01BQy9CSSxPQUFPLEVBQUVMLFlBQVksQ0FBQ0MsU0FBUztNQUMvQkssOEJBQThCLEVBQUVOLFlBQVksQ0FBQ0MsU0FBUztNQUN0RE0sT0FBTyxFQUFFUCxZQUFZLENBQUNDO0lBQ3ZCLENBQUM7SUFDRCxNQUFNSixPQUFPLEdBQUdXLG9CQUFvQixDQUFDbEIsa0JBQWtCLEVBQUVJLGVBQWUsQ0FBQ0csT0FBTyxFQUFFQyxxQkFBcUIsQ0FBQztJQUV4RyxPQUFPO01BQ05ELE9BQU87TUFDUFksY0FBYyxFQUFFZixlQUFlLENBQUNlO0lBQ2pDLENBQUM7RUFDRjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVRBO0VBVU8sU0FBU0MsZUFBZSxDQUM5QjFCLGtCQUE0QixFQUM1QkMsaUJBQXlCLEVBQ3pCQyxnQkFBa0MsRUFDbENDLGtCQUFvRCxFQUNwQztJQUNoQixNQUFNd0IsaUJBQWlCLEdBQUdDLHlCQUF5QixDQUFDNUIsa0JBQWtCLEVBQUVDLGlCQUFpQixFQUFFQyxnQkFBZ0IsQ0FBQztJQUM1RyxNQUFNMkIsZUFBZSxHQUFHQyxzQkFBc0IsQ0FDN0M1QixnQkFBZ0IsQ0FBQ1UsK0JBQStCLENBQUNYLGlCQUFpQixDQUFDLENBQUM4QixPQUFPLEVBQzNFSixpQkFBaUIsRUFDakJ6QixnQkFBZ0IsRUFDaEJBLGdCQUFnQixDQUFDOEIsdUJBQXVCLENBQUNoQyxrQkFBa0IsQ0FBQyxFQUM1REcsa0JBQWtCLENBQ2xCO0lBRUQsT0FBT3FCLG9CQUFvQixDQUFDRyxpQkFBaUIsRUFBbUJFLGVBQWUsRUFBZ0Q7TUFDOUhJLEtBQUssRUFBRWpCLFlBQVksQ0FBQ0MsU0FBUztNQUM3QmlCLFVBQVUsRUFBRWxCLFlBQVksQ0FBQ0MsU0FBUztNQUNsQ2tCLGVBQWUsRUFBRW5CLFlBQVksQ0FBQ0MsU0FBUztNQUN2Q21CLFlBQVksRUFBRXBCLFlBQVksQ0FBQ0MsU0FBUztNQUNwQ0YsV0FBVyxFQUFFQyxZQUFZLENBQUNDLFNBQVM7TUFDbkNvQixRQUFRLEVBQUVyQixZQUFZLENBQUNDLFNBQVM7TUFDaENxQixhQUFhLEVBQUV0QixZQUFZLENBQUNDO0lBQzdCLENBQUMsQ0FBQztFQUNIOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQTtFQVFPLE1BQU1zQixxQ0FBcUMsR0FBRyxVQUNwREMsVUFBc0IsRUFDdEJDLFlBQTJCLEVBQzNCdkMsZ0JBQWtDLEVBQ1U7SUFDNUMsTUFBTXdDLGlCQUFpQixHQUFHLElBQUlDLGlCQUFpQixDQUFDSCxVQUFVLEVBQUV0QyxnQkFBZ0IsQ0FBQztJQUU3RSxTQUFTMEMsa0JBQWtCLENBQUNDLElBQVksRUFBMkI7TUFDbEUsT0FBT0osWUFBWSxDQUFDSyxJQUFJLENBQUVDLE1BQU0sSUFBSztRQUNwQyxNQUFNQyxnQkFBZ0IsR0FBR0QsTUFBK0I7UUFDeEQsT0FBT0MsZ0JBQWdCLENBQUNDLGFBQWEsS0FBS0MsU0FBUyxJQUFJRixnQkFBZ0IsQ0FBQ0csWUFBWSxLQUFLTixJQUFJO01BQzlGLENBQUMsQ0FBQztJQUNIO0lBRUEsSUFBSSxDQUFDSCxpQkFBaUIsQ0FBQ1Usb0JBQW9CLEVBQUUsRUFBRTtNQUM5QyxPQUFPRixTQUFTO0lBQ2pCOztJQUVBO0lBQ0E7SUFDQSxNQUFNRyx3QkFBd0IsR0FBRyxJQUFJQyxHQUFHLEVBQUU7SUFDMUNiLFlBQVksQ0FBQ2MsT0FBTyxDQUFFUixNQUFNLElBQUs7TUFDaEMsTUFBTVMsV0FBVyxHQUFHVCxNQUErQjtNQUNuRCxJQUFJUyxXQUFXLENBQUNDLElBQUksRUFBRTtRQUNyQkosd0JBQXdCLENBQUNLLEdBQUcsQ0FBQ0YsV0FBVyxDQUFDQyxJQUFJLENBQUM7TUFDL0M7SUFDRCxDQUFDLENBQUM7SUFFRixNQUFNRSwwQkFBMEIsR0FBR2pCLGlCQUFpQixDQUFDa0IsNkJBQTZCLEVBQUU7SUFDcEYsTUFBTUMsV0FBcUMsR0FBRyxDQUFDLENBQUM7SUFFaERGLDBCQUEwQixDQUFDSixPQUFPLENBQUVPLFVBQVUsSUFBSztNQUNsRCxNQUFNQyxrQkFBa0IsR0FBR3JCLGlCQUFpQixDQUFDc0IsV0FBVyxDQUFDQyxnQkFBZ0IsQ0FBQ25CLElBQUksQ0FBRW9CLFFBQVEsSUFBSztRQUM1RixPQUFPQSxRQUFRLENBQUNDLElBQUksS0FBS0wsVUFBVSxDQUFDTSxTQUFTO01BQzlDLENBQUMsQ0FBQztNQUVGLElBQUlMLGtCQUFrQixFQUFFO1FBQUE7UUFDdkIsTUFBTU0seUJBQXlCLDRCQUFHUCxVQUFVLENBQUNRLFdBQVcsb0ZBQXRCLHNCQUF3QkMsV0FBVywyREFBbkMsdUJBQXFDQyx5QkFBeUI7UUFDaEdYLFdBQVcsQ0FBQ0Usa0JBQWtCLENBQUNJLElBQUksQ0FBQyxHQUFHRSx5QkFBeUIsR0FDN0RBLHlCQUF5QixDQUFDSSxHQUFHLENBQUVDLGNBQWMsSUFBSztVQUNsRCxPQUFPQSxjQUFjLENBQUNDLEtBQUs7UUFDM0IsQ0FBQyxDQUFDLEdBQ0YsRUFBRTtNQUNOO0lBQ0QsQ0FBQyxDQUFDO0lBQ0YsTUFBTUMsTUFBcUMsR0FBRyxDQUFDLENBQUM7SUFFaERuQyxZQUFZLENBQUNjLE9BQU8sQ0FBRVIsTUFBTSxJQUFLO01BQ2hDLE1BQU1TLFdBQVcsR0FBR1QsTUFBK0I7TUFDbkQsSUFBSVMsV0FBVyxDQUFDUCxhQUFhLEtBQUtDLFNBQVMsSUFBSU0sV0FBVyxDQUFDTCxZQUFZLEVBQUU7UUFDeEUsTUFBTTBCLDRCQUE0QixHQUFHaEIsV0FBVyxDQUFDTCxXQUFXLENBQUNMLFlBQVksQ0FBQzs7UUFFMUU7UUFDQSxJQUFJMEIsNEJBQTRCLElBQUksQ0FBQ3hCLHdCQUF3QixDQUFDeUIsR0FBRyxDQUFDdEIsV0FBVyxDQUFDVyxJQUFJLENBQUMsRUFBRTtVQUNwRlMsTUFBTSxDQUFDcEIsV0FBVyxDQUFDVyxJQUFJLENBQUMsR0FBRztZQUMxQlksZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1lBQ3BCNUIsWUFBWSxFQUFFSyxXQUFXLENBQUNMO1VBQzNCLENBQUM7VUFDRCxNQUFNa0IseUJBQW1DLEdBQUcsRUFBRTtVQUM5Q1EsNEJBQTRCLENBQUN0QixPQUFPLENBQUV5QiwyQkFBMkIsSUFBSztZQUNyRSxNQUFNQyxXQUFXLEdBQUdyQyxrQkFBa0IsQ0FBQ29DLDJCQUEyQixDQUFDO1lBQ25FLElBQUlDLFdBQVcsRUFBRTtjQUNoQloseUJBQXlCLENBQUNhLElBQUksQ0FBQ0QsV0FBVyxDQUFDZCxJQUFJLENBQUM7WUFDakQ7VUFDRCxDQUFDLENBQUM7VUFFRixJQUFJRSx5QkFBeUIsQ0FBQ2MsTUFBTSxFQUFFO1lBQ3JDUCxNQUFNLENBQUNwQixXQUFXLENBQUNXLElBQUksQ0FBQyxDQUFDWSxnQkFBZ0IsQ0FBQ1YseUJBQXlCLEdBQUdBLHlCQUF5QjtVQUNoRztRQUNEO01BQ0Q7SUFDRCxDQUFDLENBQUM7SUFFRixPQUFPTyxNQUFNO0VBQ2QsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUEE7RUFRTyxTQUFTUSwrQkFBK0IsQ0FDOUNDLGtCQUFzQyxFQUN0QzdDLFVBQXNCLEVBQ3RCdEMsZ0JBQWtDLEVBQ2xDb0YsNkJBQXVELEVBQ3REO0lBQ0QsSUFBSUQsa0JBQWtCLENBQUNFLE9BQU8sQ0FBQ0MsSUFBSSxLQUFLLGlCQUFpQixFQUFFO01BQzFELE1BQU1DLHFCQUFxQixHQUFHbEQscUNBQXFDLENBQUNDLFVBQVUsRUFBRTZDLGtCQUFrQixDQUFDdEQsT0FBTyxFQUFFN0IsZ0JBQWdCLENBQUM7UUFDNUh3QyxpQkFBaUIsR0FBRyxJQUFJQyxpQkFBaUIsQ0FBQ0gsVUFBVSxFQUFFdEMsZ0JBQWdCLENBQUM7TUFFeEUsSUFBSXVGLHFCQUFxQixFQUFFO1FBQzFCSixrQkFBa0IsQ0FBQ0ssZUFBZSxHQUFHLElBQUk7UUFDekNMLGtCQUFrQixDQUFDTSxhQUFhLEdBQUcsS0FBSztRQUN4Q04sa0JBQWtCLENBQUNPLDJCQUEyQixHQUFHLEtBQUs7UUFDdERQLGtCQUFrQixDQUFDUSxVQUFVLEdBQUdKLHFCQUFxQjtRQUNyREssNkNBQTZDLENBQUNULGtCQUFrQixDQUFDO1FBRWpFLE1BQU1VLHNCQUFzQixHQUFHckQsaUJBQWlCLENBQUNzRCx5QkFBeUIsRUFBRTtRQUM1RVgsa0JBQWtCLENBQUNZLHFCQUFxQixHQUFHRixzQkFBc0IsR0FBR0Esc0JBQXNCLENBQUNHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSTs7UUFFeEg7UUFDQWIsa0JBQWtCLENBQUN2QixVQUFVLENBQUNxQyxlQUFlLEdBQUdDLGtCQUFrQixDQUNqRWQsNkJBQTZCLEVBQzdCRCxrQkFBa0IsQ0FBQ3RELE9BQU8sRUFDMUJzRCxrQkFBa0IsQ0FBQ0UsT0FBTyxDQUFDQyxJQUFJLENBQy9CO1FBQ0RILGtCQUFrQixDQUFDdkIsVUFBVSxDQUFDdUMsbUJBQW1CLEdBQUdDLHNCQUFzQixDQUN6RWhCLDZCQUE2QixFQUM3QkQsa0JBQWtCLENBQUN0RCxPQUFPLENBQzFCO01BQ0Y7TUFFQXNELGtCQUFrQixDQUFDRSxPQUFPLENBQUNDLElBQUksR0FBRyxXQUFXLENBQUMsQ0FBQztJQUNoRCxDQUFDLE1BQU0sSUFBSUgsa0JBQWtCLENBQUNFLE9BQU8sQ0FBQ0MsSUFBSSxLQUFLLGlCQUFpQixFQUFFO01BQ2pFSCxrQkFBa0IsQ0FBQ3ZCLFVBQVUsQ0FBQ3FDLGVBQWUsR0FBR0Msa0JBQWtCLENBQ2pFZCw2QkFBNkIsRUFDN0JELGtCQUFrQixDQUFDdEQsT0FBTyxFQUMxQnNELGtCQUFrQixDQUFDRSxPQUFPLENBQUNDLElBQUksQ0FDL0I7SUFDRixDQUFDLE1BQU0sSUFBSUgsa0JBQWtCLENBQUNFLE9BQU8sQ0FBQ0MsSUFBSSxLQUFLLFdBQVcsRUFBRTtNQUMzREgsa0JBQWtCLENBQUNPLDJCQUEyQixHQUFHLEtBQUs7SUFDdkQ7RUFDRDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BO0VBT0EsU0FBU1csdUJBQXVCLENBQUNyRyxnQkFBa0MsRUFBRXNHLHNCQUE4QixFQUFFO0lBQ3BHLE1BQU1DLGVBQWUsR0FBR3ZHLGdCQUFnQixDQUFDd0csa0JBQWtCLEVBQUU7SUFDN0QsSUFBSUYsc0JBQXNCLElBQUlDLGVBQWUsQ0FBQ0UsMEJBQTBCLENBQUNILHNCQUFzQixDQUFDLEVBQUU7TUFDakcsTUFBTUksU0FBUyxHQUFHSCxlQUFlLENBQUNFLDBCQUEwQixDQUFDSCxzQkFBc0IsQ0FBQztNQUNwRixJQUFJSyxNQUFNLENBQUNDLElBQUksQ0FBQ0YsU0FBUyxDQUFDLENBQUN6QixNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3RDLE9BQU9xQixzQkFBc0I7TUFDOUI7SUFDRDtJQUVBLE1BQU1PLGFBQWEsR0FBRzdHLGdCQUFnQixDQUFDOEcsc0JBQXNCLEVBQUU7SUFDL0QsTUFBTUMsV0FBVyxHQUFHL0csZ0JBQWdCLENBQUNnSCxjQUFjLEVBQUU7SUFDckQsTUFBTUMsdUJBQXVCLEdBQUdWLGVBQWUsQ0FBQ0UsMEJBQTBCLENBQUNNLFdBQVcsQ0FBQztJQUN2RixJQUFJRSx1QkFBdUIsSUFBSU4sTUFBTSxDQUFDQyxJQUFJLENBQUNLLHVCQUF1QixDQUFDLENBQUNoQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQy9FLE9BQU84QixXQUFXO0lBQ25CO0lBRUEsT0FBT0YsYUFBYSxDQUFDSyxlQUFlLEdBQUdMLGFBQWEsQ0FBQ0ssZUFBZSxDQUFDakQsSUFBSSxHQUFHNEMsYUFBYSxDQUFDTSxpQkFBaUIsQ0FBQ2xELElBQUk7RUFDakg7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU21ELHNCQUFzQixDQUFDOUUsVUFBc0IsRUFBRUMsWUFBMkIsRUFBRTtJQUMzRixTQUFTOEUsZ0JBQWdCLENBQUMxRSxJQUFZLEVBQTJCO01BQ2hFLE9BQU9KLFlBQVksQ0FBQ0ssSUFBSSxDQUFFQyxNQUFNLElBQUs7UUFDcEMsTUFBTUMsZ0JBQWdCLEdBQUdELE1BQStCO1FBQ3hELE9BQU9DLGdCQUFnQixDQUFDQyxhQUFhLEtBQUtDLFNBQVMsSUFBSUYsZ0JBQWdCLENBQUNHLFlBQVksS0FBS04sSUFBSTtNQUM5RixDQUFDLENBQUM7SUFDSDtJQUVBSixZQUFZLENBQUNjLE9BQU8sQ0FBRWlFLE9BQU8sSUFBSztNQUNqQyxNQUFNQyxZQUFZLEdBQUdELE9BQWdDO01BQ3JELElBQUlDLFlBQVksQ0FBQ3hFLGFBQWEsS0FBS0MsU0FBUyxJQUFJdUUsWUFBWSxDQUFDdEUsWUFBWSxFQUFFO1FBQzFFLE1BQU11RSxTQUFTLEdBQUdsRixVQUFVLENBQUN5QixnQkFBZ0IsQ0FBQ25CLElBQUksQ0FBRTZFLEtBQWUsSUFBS0EsS0FBSyxDQUFDeEQsSUFBSSxLQUFLc0QsWUFBWSxDQUFDdEUsWUFBWSxDQUFDO1FBQ2pILElBQUl1RSxTQUFTLEVBQUU7VUFBQTtVQUNkLE1BQU1FLEtBQUssR0FBR0MsNkJBQTZCLENBQUNILFNBQVMsQ0FBQyxJQUFJSSx5QkFBeUIsQ0FBQ0osU0FBUyxDQUFDO1VBQzlGLE1BQU1LLFNBQVMsR0FBR0MsNkJBQTZCLENBQUNOLFNBQVMsQ0FBQztVQUMxRCxNQUFNTyxTQUFTLEdBQUdQLFNBQVMsYUFBVEEsU0FBUyxnREFBVEEsU0FBUyxDQUFFcEQsV0FBVyxvRkFBdEIsc0JBQXdCNEQsTUFBTSwyREFBOUIsdUJBQWdDQyxRQUFRO1VBQzFELElBQUlQLEtBQUssRUFBRTtZQUNWLE1BQU1RLFdBQVcsR0FBR2IsZ0JBQWdCLENBQUNLLEtBQUssQ0FBQ3pELElBQUksQ0FBQztZQUNoRHNELFlBQVksQ0FBQ2hFLElBQUksR0FBRzJFLFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFakUsSUFBSTtVQUN0QyxDQUFDLE1BQU07WUFBQTtZQUNOLE1BQU1rRSxLQUFLLEdBQUcsQ0FBQVgsU0FBUyxhQUFUQSxTQUFTLGlEQUFUQSxTQUFTLENBQUVwRCxXQUFXLHFGQUF0Qix1QkFBd0JnRSxRQUFRLDJEQUFoQyx1QkFBa0NDLFdBQVcsTUFBSWIsU0FBUyxhQUFUQSxTQUFTLGlEQUFUQSxTQUFTLENBQUVwRCxXQUFXLHFGQUF0Qix1QkFBd0JnRSxRQUFRLDJEQUFoQyx1QkFBa0NFLElBQUk7WUFDckcsSUFBSUgsS0FBSyxFQUFFO2NBQ1ZaLFlBQVksQ0FBQ2dCLFFBQVEsR0FBSSxHQUFFSixLQUFNLEVBQUM7WUFDbkM7VUFDRDtVQUNBLElBQUlOLFNBQVMsRUFBRTtZQUNkLE1BQU1XLGVBQWUsR0FBR25CLGdCQUFnQixDQUFDUSxTQUFTLENBQUM1RCxJQUFJLENBQUM7WUFDeERzRCxZQUFZLENBQUNrQixRQUFRLEdBQUdELGVBQWUsYUFBZkEsZUFBZSx1QkFBZkEsZUFBZSxDQUFFdkUsSUFBSTtVQUM5QyxDQUFDLE1BQU0sSUFBSThELFNBQVMsRUFBRTtZQUNyQlIsWUFBWSxDQUFDbUIsWUFBWSxHQUFHWCxTQUFTLENBQUNZLFFBQVEsRUFBRTtVQUNqRDtVQUVBLE1BQU1DLFdBQVcsR0FBR0MsY0FBYyxDQUFDckIsU0FBUyxDQUFDO1lBQzVDc0IsY0FBYyw2QkFBR3RCLFNBQVMsQ0FBQ3BELFdBQVcsQ0FBQzRELE1BQU0sMkRBQTVCLHVCQUE4QmUsSUFBSTtVQUNwRCxJQUFJQyxnQkFBZ0IsQ0FBQ0YsY0FBYyxDQUFDLElBQUlGLFdBQVcsS0FBSyxPQUFPLEVBQUU7WUFDaEUsTUFBTUssV0FBVyxHQUFHNUIsZ0JBQWdCLENBQUN5QixjQUFjLENBQUNuRyxJQUFJLENBQUM7WUFDekQsSUFBSXNHLFdBQVcsSUFBSUEsV0FBVyxDQUFDaEYsSUFBSSxLQUFLc0QsWUFBWSxDQUFDdEQsSUFBSSxFQUFFO2NBQzFEc0QsWUFBWSxDQUFDMkIsZUFBZSxHQUFHO2dCQUM5QkMsWUFBWSxFQUFFRixXQUFXLENBQUNoRixJQUFJO2dCQUM5Qm1GLElBQUksRUFBRVI7Y0FDUCxDQUFDO1lBQ0Y7VUFDRDtRQUNEO01BQ0Q7SUFDRCxDQUFDLENBQUM7RUFDSDtFQUFDO0VBRUQsU0FBU1MsMkJBQTJCLENBQUNySixnQkFBa0MsRUFBRTtJQUFBO0lBQ3hFLE1BQU1zSixtQkFBbUIsNEJBQUl0SixnQkFBZ0IsQ0FBQzhCLHVCQUF1QixFQUFFLG9GQUExQyxzQkFBNENzQyxXQUFXLHFGQUF2RCx1QkFBeURtRixFQUFFLHFGQUEzRCx1QkFBNkRDLFVBQVUscUZBQXZFLHVCQUF5RUMsS0FBSyxxRkFBL0UsdUJBQW9HQyxLQUFLLDJEQUF6Ryx1QkFDekIvRyxJQUFJO0lBQ1AsTUFBTWdILHNCQUF5Qyw2QkFBRzNKLGdCQUFnQixDQUFDOEIsdUJBQXVCLEVBQUUscUZBQTFDLHVCQUE0Q3NDLFdBQVcscUZBQXZELHVCQUF5RDRELE1BQU0sMkRBQS9ELHVCQUFpRTRCLFdBQVc7SUFDOUgsTUFBTUMsa0JBQWtCLEdBQUc3SixnQkFBZ0IsYUFBaEJBLGdCQUFnQixrREFBaEJBLGdCQUFnQixDQUFFOEIsdUJBQXVCLEVBQUUsdUZBQTNDLHdCQUE2Q3NDLFdBQVcsdUZBQXhELHdCQUEwRG1GLEVBQUUsdUZBQTVELHdCQUE4REMsVUFBVSw0REFBeEUsd0JBQTBFTSxRQUFRO0lBQzdHLE1BQU1DLGtCQUE0QixHQUFHLEVBQUU7SUFDdkMsSUFBSUosc0JBQXNCLEVBQUU7TUFDM0JBLHNCQUFzQixDQUFDdEcsT0FBTyxDQUFDLFVBQVVpRSxPQUFZLEVBQUU7UUFDdER5QyxrQkFBa0IsQ0FBQy9FLElBQUksQ0FBQ3NDLE9BQU8sQ0FBQzdDLEtBQUssQ0FBQztNQUN2QyxDQUFDLENBQUM7SUFDSDtJQUVBLE9BQU87TUFBRTZFLG1CQUFtQjtNQUFFUyxrQkFBa0I7TUFBRUY7SUFBbUIsQ0FBQztFQUN2RTtFQUVPLFNBQVNHLHdCQUF3QixDQUN2Q2xLLGtCQUE0QixFQUM1QkMsaUJBQXlCLEVBQ3pCQyxnQkFBa0MsRUFDbENvRiw2QkFBdUQsRUFDdkQ2RSwrQkFBeUMsRUFDekNDLGlCQUF5QyxFQUNwQjtJQUNyQixNQUFNQyxtQkFBbUIsR0FBR0MsNkJBQTZCLENBQ3hEdEssa0JBQWtCLEVBQ2xCQyxpQkFBaUIsRUFDakJDLGdCQUFnQixFQUNoQmlLLCtCQUErQixDQUMvQjtJQUNELE1BQU07TUFBRTNEO0lBQXVCLENBQUMsR0FBRytELFNBQVMsQ0FBQ3RLLGlCQUFpQixDQUFDO0lBQy9ELE1BQU11SyxvQkFBb0IsR0FBR2pFLHVCQUF1QixDQUFDckcsZ0JBQWdCLEVBQUVzRyxzQkFBc0IsQ0FBQztJQUM5RixNQUFNckcsa0JBQWtCLEdBQUdELGdCQUFnQixDQUFDd0csa0JBQWtCLEVBQUUsQ0FBQ0MsMEJBQTBCLENBQUM2RCxvQkFBb0IsQ0FBQztJQUNqSCxNQUFNekksT0FBTyxHQUFHTCxlQUFlLENBQUMxQixrQkFBa0IsRUFBRUMsaUJBQWlCLEVBQUVDLGdCQUFnQixFQUFFQyxrQkFBa0IsQ0FBQztJQUM1RyxNQUFNc0sscUJBQXFCLEdBQUdDLHdCQUF3QixDQUFDMUssa0JBQWtCLEVBQUVFLGdCQUFnQixDQUFDO0lBQzVGLE1BQU15Syw4QkFBOEIsR0FBR3BCLDJCQUEyQixDQUFDckosZ0JBQWdCLENBQUM7SUFDcEYsTUFBTUssWUFBWSxHQUFHUixlQUFlLENBQUNDLGtCQUFrQixFQUFFQyxpQkFBaUIsRUFBRUMsZ0JBQWdCLEVBQUVDLGtCQUFrQixDQUFDO0lBRWpILE1BQU15SyxjQUFrQyxHQUFHO01BQzFDcEYsSUFBSSxFQUFFcUYsaUJBQWlCLENBQUNDLEtBQUs7TUFDN0JoSCxVQUFVLEVBQUVpSCwrQkFBK0IsQ0FDMUMvSyxrQkFBa0IsRUFDbEJDLGlCQUFpQixFQUNqQkMsZ0JBQWdCLEVBQ2hCbUssbUJBQW1CLEVBQ25CdEksT0FBTyxFQUNQdUQsNkJBQTZCLEVBQzdCOEUsaUJBQWlCLENBQ2pCO01BQ0Q3RSxPQUFPLEVBQUU4RSxtQkFBbUI7TUFDNUJ4SixPQUFPLEVBQUVtSyxzQkFBc0IsQ0FBQ3pLLFlBQVksQ0FBQ00sT0FBTyxDQUFDO01BQ3JEWSxjQUFjLEVBQUVsQixZQUFZLENBQUNrQixjQUFjO01BQzNDTSxPQUFPLEVBQUVBLE9BQU87TUFDaEIwSSxxQkFBcUIsRUFBRVEsSUFBSSxDQUFDQyxTQUFTLENBQUNULHFCQUFxQixDQUFDO01BQzVEVSw0QkFBNEIsRUFBRUMsK0JBQStCLENBQUNYLHFCQUFxQixFQUFFdkssZ0JBQWdCLENBQUM7TUFDdEdtTCxlQUFlLEVBQUVWLDhCQUE4QixDQUFDbkIsbUJBQW1CO01BQ25FOEIsWUFBWSxFQUFFWCw4QkFBOEIsQ0FBQ1Ysa0JBQWtCO01BQy9ERixrQkFBa0IsRUFBRVksOEJBQThCLENBQUNaLGtCQUFrQjtNQUNyRXBFLGFBQWEsRUFBRSxJQUFJO01BQ25CQywyQkFBMkIsRUFBRTtJQUM5QixDQUFDO0lBRUQwQixzQkFBc0IsQ0FBQ3BILGdCQUFnQixDQUFDOEIsdUJBQXVCLENBQUNoQyxrQkFBa0IsQ0FBQyxFQUFFK0IsT0FBTyxDQUFDO0lBQzdGcUQsK0JBQStCLENBQzlCd0YsY0FBYyxFQUNkMUssZ0JBQWdCLENBQUM4Qix1QkFBdUIsQ0FBQ2hDLGtCQUFrQixDQUFDLEVBQzVERSxnQkFBZ0IsRUFDaEJvRiw2QkFBNkIsQ0FDN0I7SUFFRCxPQUFPc0YsY0FBYztFQUN0QjtFQUFDO0VBRU0sU0FBU1csK0JBQStCLENBQUNyTCxnQkFBa0MsRUFBRXNMLFlBQXNCLEVBQXNCO0lBQy9ILE1BQU1uQixtQkFBbUIsR0FBR0MsNkJBQTZCLENBQUNwSCxTQUFTLEVBQUUsRUFBRSxFQUFFaEQsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDO0lBQ2pHLE1BQU02QixPQUFPLEdBQUcwSix3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRXZMLGdCQUFnQixDQUFDd0wsYUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRXhMLGdCQUFnQixFQUFFbUssbUJBQW1CLENBQUM3RSxJQUFJLEVBQUUsRUFBRSxDQUFDO0lBQ3RJLE1BQU1pRixxQkFBcUIsR0FBR0Msd0JBQXdCLENBQUN4SCxTQUFTLEVBQUVoRCxnQkFBZ0IsQ0FBQztJQUNuRixNQUFNeUssOEJBQThCLEdBQUdwQiwyQkFBMkIsQ0FBQ3JKLGdCQUFnQixDQUFDO0lBQ3BGLE1BQU0wSyxjQUFrQyxHQUFHO01BQzFDcEYsSUFBSSxFQUFFcUYsaUJBQWlCLENBQUNDLEtBQUs7TUFDN0JoSCxVQUFVLEVBQUVpSCwrQkFBK0IsQ0FBQzdILFNBQVMsRUFBRSxFQUFFLEVBQUVoRCxnQkFBZ0IsRUFBRW1LLG1CQUFtQixFQUFFbUIsWUFBWSxHQUFHLEVBQUUsR0FBR3pKLE9BQU8sQ0FBQztNQUM5SHdELE9BQU8sRUFBRThFLG1CQUFtQjtNQUM1QnhKLE9BQU8sRUFBRSxFQUFFO01BQ1hrQixPQUFPLEVBQUVBLE9BQU87TUFDaEIwSSxxQkFBcUIsRUFBRVEsSUFBSSxDQUFDQyxTQUFTLENBQUNULHFCQUFxQixDQUFDO01BQzVEVSw0QkFBNEIsRUFBRUMsK0JBQStCLENBQUNYLHFCQUFxQixFQUFFdkssZ0JBQWdCLENBQUM7TUFDdEdtTCxlQUFlLEVBQUVWLDhCQUE4QixDQUFDbkIsbUJBQW1CO01BQ25FOEIsWUFBWSxFQUFFWCw4QkFBOEIsQ0FBQ1Ysa0JBQWtCO01BQy9ERixrQkFBa0IsRUFBRVksOEJBQThCLENBQUNaLGtCQUFrQjtNQUNyRXBFLGFBQWEsRUFBRSxJQUFJO01BQ25CQywyQkFBMkIsRUFBRTtJQUM5QixDQUFDO0lBRUQwQixzQkFBc0IsQ0FBQ3BILGdCQUFnQixDQUFDd0wsYUFBYSxFQUFFLEVBQUUzSixPQUFPLENBQUM7SUFDakVxRCwrQkFBK0IsQ0FBQ3dGLGNBQWMsRUFBRTFLLGdCQUFnQixDQUFDd0wsYUFBYSxFQUFFLEVBQUV4TCxnQkFBZ0IsQ0FBQztJQUVuRyxPQUFPMEssY0FBYztFQUN0Qjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BO0VBT0EsU0FBU0Ysd0JBQXdCLENBQUMxSyxrQkFBd0MsRUFBRUUsZ0JBQWtDLEVBQXVCO0lBQ3BJLE9BQU95TCxZQUFZLENBQUNqQix3QkFBd0IsQ0FBQzFLLGtCQUFrQixFQUFFLE9BQU8sRUFBRUUsZ0JBQWdCLENBQUM7RUFDNUY7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBUzBMLGdDQUFnQyxDQUFDMUwsZ0JBQWtDLEVBQVU7SUFBQTtJQUNyRixNQUFNMkwsWUFBWSxHQUFHQyxlQUFlLENBQUM1TCxnQkFBZ0IsQ0FBQztJQUN0RCxNQUFNNkwsU0FBUyxHQUFHN0wsZ0JBQWdCLENBQUM4TCxZQUFZLEVBQUU7SUFDakQsTUFBTUMsU0FBUyxHQUFHSixZQUFZLENBQUNLLFdBQVc7SUFDMUMsTUFBTUMsNEJBQWlDLEdBQUcsQ0FBQ0MsVUFBVSxDQUFDSCxTQUFTLENBQUNJLFVBQVUsQ0FBQyxJQUFJSixTQUFTLENBQUNLLG9CQUFvQixDQUFDQyxLQUFLLEtBQUssY0FBYztJQUN0SSxNQUFNQyxxQkFBcUIsR0FBSVQsU0FBUyxhQUFUQSxTQUFTLGdEQUFUQSxTQUFTLENBQUV6SCxXQUFXLENBQUNtSSxZQUFZLG9GQUFuQyxzQkFBcUNDLGtCQUFrQixxRkFBdkQsdUJBQXlEQyxTQUFTLDJEQUFuRSx1QkFBNkU5SixJQUFJO0lBRS9HLE9BQU9zSiw0QkFBNEIsR0FBSUsscUJBQXFCLEdBQWMsRUFBRTtFQUM3RTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNwQiwrQkFBK0IsQ0FBQ1gscUJBQTBDLEVBQUV2SyxnQkFBa0MsRUFBVTtJQUNoSSxNQUFNME0sVUFBVSxHQUFHLElBQUl0SixHQUFHLEVBQUU7SUFFNUIsS0FBSyxNQUFNdUosVUFBVSxJQUFJcEMscUJBQXFCLEVBQUU7TUFDL0MsTUFBTXFDLFlBQVksR0FBR3JDLHFCQUFxQixDQUFDb0MsVUFBVSxDQUFDO01BQ3RELElBQUlDLFlBQVksS0FBSyxJQUFJLEVBQUU7UUFDMUI7UUFDQUYsVUFBVSxDQUFDbEosR0FBRyxDQUFDbUosVUFBVSxDQUFDO01BQzNCLENBQUMsTUFBTSxJQUFJLE9BQU9DLFlBQVksS0FBSyxRQUFRLEVBQUU7UUFDNUM7UUFDQUYsVUFBVSxDQUFDbEosR0FBRyxDQUFDb0osWUFBWSxDQUFDO01BQzdCO0lBQ0Q7SUFFQSxJQUFJRixVQUFVLENBQUNHLElBQUksRUFBRTtNQUFBO01BQ3BCO01BQ0E7TUFDQSxNQUFNdkssVUFBVSxHQUFHdEMsZ0JBQWdCLENBQUN3TCxhQUFhLEVBQUU7TUFDbkQsTUFBTXNCLGFBQWEsNEJBQUl4SyxVQUFVLENBQUM4QixXQUFXLG9GQUF0QixzQkFBd0JtRixFQUFFLHFGQUExQix1QkFBNEJDLFVBQVUscUZBQXRDLHVCQUF3Q0MsS0FBSyxxRkFBOUMsdUJBQW1FQyxLQUFLLDJEQUF4RSx1QkFBMEUvRyxJQUFJO01BQ3BHLElBQUltSyxhQUFhLEVBQUU7UUFDbEJKLFVBQVUsQ0FBQ2xKLEdBQUcsQ0FBQ3NKLGFBQWEsQ0FBQztNQUM5QjtJQUNEO0lBRUEsT0FBT0MsS0FBSyxDQUFDQyxJQUFJLENBQUNOLFVBQVUsQ0FBQyxDQUFDTyxJQUFJLENBQUMsR0FBRyxDQUFDO0VBQ3hDOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0Msd0NBQXdDLENBQ2hEcE4sa0JBQTRCLEVBQzVCcU4saUJBQTZCLEVBQzdCQywwQkFBK0MsRUFDL0NDLFdBQW9CLEVBQ2tCO0lBQ3RDLE1BQU1DLHdCQUE2RCxHQUFHLEVBQUU7SUFDeEV4TixrQkFBa0IsQ0FBQ3VELE9BQU8sQ0FBRWtLLFNBQVMsSUFBSztNQUFBO01BQ3pDO01BQ0EsSUFDRUEsU0FBUyxDQUFDQyxLQUFLLG9EQUF5QyxJQUN4REQsU0FBUyxhQUFUQSxTQUFTLHdDQUFUQSxTQUFTLENBQUVFLFlBQVksa0RBQXZCLHNCQUF5QkMsT0FBTyxJQUNoQ1AsaUJBQWlCLE1BQUtJLFNBQVMsYUFBVEEsU0FBUyx1QkFBVEEsU0FBUyxDQUFFRSxZQUFZLENBQUNFLGdCQUFnQixLQUM5REosU0FBUyxDQUFDQyxLQUFLLG1FQUF3RCxJQUN2RUQsU0FBUyxDQUFDSyxlQUFlLElBQ3pCLENBQUFMLFNBQVMsYUFBVEEsU0FBUyw0Q0FBVEEsU0FBUyxDQUFFTSxNQUFNLHNEQUFqQixrQkFBbUJDLE9BQU8sRUFBRSxNQUFLLElBQUssRUFDdEM7UUFBQTtRQUNELElBQUksaUNBQU9QLFNBQVMsQ0FBQ25KLFdBQVcsb0ZBQXJCLHNCQUF1Qm1GLEVBQUUscUZBQXpCLHVCQUEyQndFLE1BQU0sMkRBQWpDLHVCQUFtQ0QsT0FBTyxFQUFFLE1BQUssUUFBUSxFQUFFO1VBQ3JFUix3QkFBd0IsQ0FBQ3RJLElBQUksQ0FBQ2dKLEtBQUssQ0FBQ0Msd0JBQXdCLENBQUNWLFNBQVMsRUFBRUgsMEJBQTBCLEVBQUVDLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFIO01BQ0Q7SUFDRCxDQUFDLENBQUM7SUFDRixPQUFPQyx3QkFBd0I7RUFDaEM7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNXLHdCQUF3QixDQUNoQ0MsTUFBNkUsRUFDN0VkLDBCQUErQyxFQUMvQ0MsV0FBb0IsRUFDWTtJQUFBO0lBQ2hDLElBQUljLFdBQTRCO0lBQ2hDLElBQ0MsQ0FBQ0QsTUFBTSxhQUFOQSxNQUFNLHVCQUFOQSxNQUFNLENBQXlCVixLQUFLLHFEQUF5QyxJQUM5RSxDQUFDVSxNQUFNLGFBQU5BLE1BQU0sdUJBQU5BLE1BQU0sQ0FBd0NWLEtBQUssb0VBQXdELEVBQzNHO01BQUE7TUFDRFcsV0FBVyxHQUFJRCxNQUFNLGFBQU5BLE1BQU0sdUNBQU5BLE1BQU0sQ0FBNkQ5SixXQUFXLG9FQUEvRSxhQUFpRm1GLEVBQUUsb0RBQW5GLGdCQUFxRndFLE1BQU07SUFDMUcsQ0FBQyxNQUFNO01BQ05JLFdBQVcsR0FBSUQsTUFBTSxhQUFOQSxNQUFNLHVCQUFOQSxNQUFNLENBQW1CL00sT0FBTztJQUNoRDtJQUNBLElBQUlpTixLQUFhO0lBQ2pCLG9CQUFJRCxXQUFXLHlDQUFYLGFBQWF4TCxJQUFJLEVBQUU7TUFDdEJ5TCxLQUFLLEdBQUdELFdBQVcsQ0FBQ3hMLElBQUk7SUFDekIsQ0FBQyxNQUFNO01BQ055TCxLQUFLLEdBQUdELFdBQVc7SUFDcEI7SUFDQSxJQUFJQyxLQUFLLEVBQUU7TUFDVixJQUFLRixNQUFNLGFBQU5BLE1BQU0sZUFBTkEsTUFBTSxDQUFtQi9NLE9BQU8sRUFBRTtRQUN0Q2lOLEtBQUssR0FBR0EsS0FBSyxDQUFDQyxTQUFTLENBQUMsQ0FBQyxFQUFFRCxLQUFLLENBQUNuSixNQUFNLEdBQUcsQ0FBQyxDQUFDO01BQzdDO01BQ0EsSUFBSW1KLEtBQUssQ0FBQ3BJLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFBQTtRQUMzQjtRQUNBLE1BQU1zSSxVQUFVLEdBQUdGLEtBQUssQ0FBQ0csS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUNuQyxNQUFNQyxlQUFlLEdBQUdGLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDckMsSUFDQyxDQUFBbEIsMEJBQTBCLGFBQTFCQSwwQkFBMEIsZ0RBQTFCQSwwQkFBMEIsQ0FBRXFCLFlBQVksMERBQXhDLHNCQUEwQ3BDLEtBQUssTUFBSyxvQkFBb0IsSUFDeEVlLDBCQUEwQixDQUFDcUIsWUFBWSxDQUFDQyxPQUFPLEtBQUtGLGVBQWUsRUFDbEU7VUFDRCxPQUFPRyxXQUFXLENBQUNMLFVBQVUsQ0FBQ00sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELENBQUMsTUFBTTtVQUNOLE9BQU80QixRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3RCO1FBQ0E7TUFDRCxDQUFDLE1BQU0sSUFBSXhCLFdBQVcsRUFBRTtRQUN2QixPQUFPc0IsV0FBVyxDQUFDUCxLQUFLLENBQUM7UUFDekI7TUFDRCxDQUFDLE1BQU07UUFDTixPQUFPUyxRQUFRLENBQUMsSUFBSSxDQUFDO01BQ3RCO0lBQ0Q7SUFDQSxPQUFPQSxRQUFRLENBQUMsSUFBSSxDQUFDO0VBQ3RCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0MsNEJBQTRCLENBQ3BDQyxXQUFtQixFQUNuQnhCLFNBQWlFLEVBQ2pFL00sZUFBNkMsRUFDbkM7SUFDVixPQUFPbUcsTUFBTSxDQUFDQyxJQUFJLENBQUNwRyxlQUFlLENBQUMsQ0FBQ3dPLElBQUksQ0FBRUMsU0FBUyxJQUFLO01BQ3ZELElBQUlBLFNBQVMsS0FBS0YsV0FBVyxFQUFFO1FBQUE7UUFDOUIsSUFDRXhCLFNBQVMsYUFBVEEsU0FBUyxnQ0FBVEEsU0FBUyxDQUF5QkUsWUFBWSwwQ0FBL0MsY0FBaURDLE9BQU8sSUFDdkRILFNBQVMsYUFBVEEsU0FBUyxlQUFUQSxTQUFTLENBQXdDSyxlQUFlLEVBQ2hFO1VBQ0RwTixlQUFlLENBQUN1TyxXQUFXLENBQUMsQ0FBQ0csaUJBQWlCLEdBQUcsSUFBSTtRQUN0RDtRQUNBLE9BQU8sSUFBSTtNQUNaO01BQ0EsT0FBTyxLQUFLO0lBQ2IsQ0FBQyxDQUFDO0VBQ0g7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0MscUNBQXFDLENBQzdDclAsa0JBQTRCLEVBQzVCVSxlQUE2QyxFQUM3QzJNLGlCQUE2QixFQUNuQjtJQUNWLE9BQU9yTixrQkFBa0IsQ0FBQ2tQLElBQUksQ0FBRXpCLFNBQVMsSUFBSztNQUFBO01BQzdDLElBQ0MsQ0FBQ0EsU0FBUyxDQUFDQyxLQUFLLG9EQUF5QyxJQUN4REQsU0FBUyxDQUFDQyxLQUFLLG1FQUF3RCxLQUN4RSxDQUFBRCxTQUFTLGFBQVRBLFNBQVMsNkNBQVRBLFNBQVMsQ0FBRU0sTUFBTSx1REFBakIsbUJBQW1CQyxPQUFPLEVBQUUsTUFBSyxJQUFJLEtBQ3BDLDJCQUFBUCxTQUFTLENBQUNuSixXQUFXLHFGQUFyQix1QkFBdUJtRixFQUFFLHFGQUF6Qix1QkFBMkJ3RSxNQUFNLDJEQUFqQyx1QkFBbUNELE9BQU8sRUFBRSxNQUFLLEtBQUssSUFBSSwyQkFBQVAsU0FBUyxDQUFDbkosV0FBVyxxRkFBckIsdUJBQXVCbUYsRUFBRSxxRkFBekIsdUJBQTJCd0UsTUFBTSwyREFBakMsdUJBQW1DRCxPQUFPLEVBQUUsTUFBSzlLLFNBQVMsQ0FBQyxFQUNySDtRQUNELElBQUl1SyxTQUFTLENBQUNDLEtBQUssb0RBQXlDLEVBQUU7VUFBQTtVQUM3RCxNQUFNNEIsZ0JBQWdCLEdBQUdDLFFBQVEsQ0FBQyxDQUFDLG9CQUFvQixFQUFFOUIsU0FBUyxDQUFDK0IsTUFBTSxDQUFXLENBQUM7VUFDckY7VUFDQSxJQUFJUiw0QkFBNEIsQ0FBQ00sZ0JBQWdCLEVBQUU3QixTQUFTLEVBQUUvTSxlQUFlLENBQUMsRUFBRTtZQUMvRSxPQUFPLEtBQUs7VUFDYjtVQUNBO1VBQ0EsT0FBTyxDQUFBK00sU0FBUyxhQUFUQSxTQUFTLGlEQUFUQSxTQUFTLENBQUVFLFlBQVksMkRBQXZCLHVCQUF5QkMsT0FBTyxLQUFJUCxpQkFBaUIsTUFBS0ksU0FBUyxhQUFUQSxTQUFTLHVCQUFUQSxTQUFTLENBQUVFLFlBQVksQ0FBQ0UsZ0JBQWdCO1FBQzFHLENBQUMsTUFBTSxJQUFJSixTQUFTLENBQUNDLEtBQUssbUVBQXdELEVBQUU7VUFDbkY7VUFDQSxJQUNDc0IsNEJBQTRCLENBQzFCLHNDQUFxQ3ZCLFNBQVMsQ0FBQ2dDLGNBQWUsS0FBSWhDLFNBQVMsQ0FBQytCLE1BQU8sRUFBQyxFQUNyRi9CLFNBQVMsRUFDVC9NLGVBQWUsQ0FDZixFQUNBO1lBQ0QsT0FBTyxLQUFLO1VBQ2I7VUFDQSxPQUFPK00sU0FBUyxDQUFDSyxlQUFlO1FBQ2pDO01BQ0Q7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDLENBQUM7RUFDSDtFQUVBLFNBQVM0QixzQ0FBc0MsQ0FBQ2hQLGVBQTZDLEVBQVc7SUFDdkcsT0FBT21HLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDcEcsZUFBZSxDQUFDLENBQUN3TyxJQUFJLENBQUVDLFNBQVMsSUFBSztNQUFBO01BQ3ZELE1BQU1RLE1BQU0sR0FBR2pQLGVBQWUsQ0FBQ3lPLFNBQVMsQ0FBQztNQUN6QyxJQUFJUSxNQUFNLENBQUNQLGlCQUFpQixJQUFJLG9CQUFBTyxNQUFNLENBQUN0TyxPQUFPLG9EQUFkLGdCQUFnQndILFFBQVEsRUFBRSxNQUFLLE1BQU0sRUFBRTtRQUN0RSxPQUFPLElBQUk7TUFDWjtNQUNBLE9BQU8sS0FBSztJQUNiLENBQUMsQ0FBQztFQUNIOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBUytHLDZDQUE2QyxDQUFDbFAsZUFBNkMsRUFBdUM7SUFDMUksTUFBTW1QLHVCQUE0RCxHQUFHLEVBQUU7SUFDdkUsSUFBSW5QLGVBQWUsRUFBRTtNQUNwQm1HLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDcEcsZUFBZSxDQUFDLENBQUM2QyxPQUFPLENBQUU0TCxTQUFTLElBQUs7UUFDbkQsTUFBTVEsTUFBTSxHQUFHalAsZUFBZSxDQUFDeU8sU0FBUyxDQUFDO1FBQ3pDLElBQUlRLE1BQU0sQ0FBQ1AsaUJBQWlCLEtBQUssSUFBSSxJQUFJTyxNQUFNLENBQUN0TyxPQUFPLEtBQUs2QixTQUFTLEVBQUU7VUFDdEUsSUFBSSxPQUFPeU0sTUFBTSxDQUFDdE8sT0FBTyxLQUFLLFFBQVEsRUFBRTtZQUFBO1lBQ3ZDO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O1lBRUt3Tyx1QkFBdUIsQ0FBQzNLLElBQUksQ0FBQzRLLG9CQUFvQixDQUFDSCxNQUFNLGFBQU5BLE1BQU0sMkNBQU5BLE1BQU0sQ0FBRXRPLE9BQU8scURBQWYsaUJBQWlCMk0sT0FBTyxFQUFFLENBQUMsQ0FBQztVQUMvRTtRQUNEO01BQ0QsQ0FBQyxDQUFDO0lBQ0g7SUFDQSxPQUFPNkIsdUJBQXVCO0VBQy9COztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNFLHdCQUF3QixDQUFDN1AsZ0JBQWtDLEVBQThCO0lBQ3hHLE1BQU04UCxXQUFXLEdBQUdDLGVBQWUsQ0FBQy9QLGdCQUFnQixDQUFDOEcsc0JBQXNCLEVBQUUsQ0FBQztJQUM5RSxNQUFNa0YsV0FBVyxHQUFHZ0UsZUFBZSxDQUFDaFEsZ0JBQWdCLENBQUM4RyxzQkFBc0IsRUFBRSxDQUFDO0lBQzlFLE9BQU87TUFDTmdKLFdBQVcsRUFBRSxFQUFFNUQsVUFBVSxDQUFDNEQsV0FBVyxDQUFDLElBQUlBLFdBQVcsQ0FBQ3JMLEtBQUssS0FBSyxLQUFLLENBQUM7TUFDdEV1SCxXQUFXLEVBQUUsRUFBRUUsVUFBVSxDQUFDRixXQUFXLENBQUMsSUFBSUEsV0FBVyxDQUFDdkgsS0FBSyxLQUFLLEtBQUs7SUFDdEUsQ0FBQztFQUNGO0VBQUM7RUFFTSxTQUFTd0wsZ0JBQWdCLENBQy9CblEsa0JBQXdDLEVBQ3hDQyxpQkFBeUIsRUFDekJDLGdCQUFrQyxFQUNsQ3FOLFdBQW9CLEVBQ3BCNkMsa0JBQThDLEVBQzlDQyxnQ0FBb0UsRUFFL0M7SUFBQTtJQUFBLElBRHJCQyw0QkFBK0QsdUVBQUd2QixRQUFRLENBQUMsS0FBSyxDQUFDO0lBRWpGLElBQUksQ0FBQy9PLGtCQUFrQixFQUFFO01BQ3hCLE9BQU91USxhQUFhLENBQUNDLElBQUk7SUFDMUI7SUFDQSxNQUFNQyxxQkFBcUIsR0FBR3ZRLGdCQUFnQixDQUFDVSwrQkFBK0IsQ0FBQ1gsaUJBQWlCLENBQUM7SUFDakcsSUFBSXlRLGFBQWEsNEJBQUdELHFCQUFxQixDQUFDRSxhQUFhLDBEQUFuQyxzQkFBcUNELGFBQWE7SUFDdEUsSUFBSUUseUJBQThELEdBQUcsRUFBRTtNQUN0RUMsMEJBQStELEdBQUcsRUFBRTtJQUNyRSxNQUFNblEsZUFBZSxHQUFHQyxzQkFBc0IsQ0FDN0NULGdCQUFnQixDQUFDVSwrQkFBK0IsQ0FBQ1gsaUJBQWlCLENBQUMsQ0FBQ1ksT0FBTyxFQUMzRVgsZ0JBQWdCLEVBQ2hCLEVBQUUsRUFDRmdELFNBQVMsRUFDVCxLQUFLLENBQ0w7SUFDRCxJQUFJNE4saUJBQWlCLEVBQUVDLHdCQUF3QjtJQUMvQyxJQUFJN1EsZ0JBQWdCLENBQUM4USxlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDQyxVQUFVLEVBQUU7TUFDbkVKLGlCQUFpQixHQUFHYixlQUFlLENBQUMvUCxnQkFBZ0IsQ0FBQzhHLHNCQUFzQixFQUFFLENBQUM7TUFDOUUrSix3QkFBd0IsR0FBR0QsaUJBQWlCLEdBQUdLLGlCQUFpQixDQUFDTCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsR0FBR0EsaUJBQWlCO0lBQzlHO0lBRUEsTUFBTU0sZ0JBQXlCLEdBQUcsQ0FBQ2hGLFVBQVUsQ0FBQ2tFLDRCQUE0QixDQUFDLElBQUlBLDRCQUE0QixDQUFDM0wsS0FBSyxLQUFLLEtBQUs7SUFDM0gsSUFBSStMLGFBQWEsSUFBSUEsYUFBYSxLQUFLSCxhQUFhLENBQUNDLElBQUksSUFBSUgsZ0NBQWdDLEVBQUU7TUFDOUYsSUFBSW5RLGdCQUFnQixDQUFDOFEsZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQ0MsVUFBVSxJQUFJRSxnQkFBZ0IsRUFBRTtRQUN2RjtRQUNBLE9BQU9ELGlCQUFpQixDQUN2QkUsTUFBTSxDQUNMQyxHQUFHLENBQUM3SCxFQUFFLENBQUM4SCxVQUFVLEVBQUVqQiw0QkFBNEIsQ0FBQyxFQUNoRHZCLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFDakJzQyxNQUFNLENBQUNoQixnQ0FBZ0MsRUFBRXRCLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRUEsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQzdFLENBQ0Q7TUFDRixDQUFDLE1BQU0sSUFBSXFDLGdCQUFnQixFQUFFO1FBQzVCLE9BQU9iLGFBQWEsQ0FBQ2lCLEtBQUs7TUFDM0I7TUFFQSxPQUFPTCxpQkFBaUIsQ0FBQ0UsTUFBTSxDQUFDaEIsZ0NBQWdDLEVBQUV0QixRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUVBLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3hHO0lBQ0EsSUFBSSxDQUFDMkIsYUFBYSxJQUFJQSxhQUFhLEtBQUtILGFBQWEsQ0FBQ2tCLElBQUksRUFBRTtNQUMzRGYsYUFBYSxHQUFHSCxhQUFhLENBQUNpQixLQUFLO0lBQ3BDO0lBQ0EsSUFBSUosZ0JBQWdCLEVBQUU7TUFDckI7TUFDQVYsYUFBYSxHQUFHQSxhQUFhLEtBQUtILGFBQWEsQ0FBQ21CLE1BQU0sR0FBR25CLGFBQWEsQ0FBQ21CLE1BQU0sR0FBR25CLGFBQWEsQ0FBQ2lCLEtBQUs7SUFDcEc7SUFFQSxJQUNDbkMscUNBQXFDLENBQUNyUCxrQkFBa0IsRUFBRVUsZUFBZSxDQUFDRyxPQUFPLEVBQUVYLGdCQUFnQixDQUFDd0wsYUFBYSxFQUFFLENBQUMsSUFDcEhnRSxzQ0FBc0MsQ0FBQ2hQLGVBQWUsQ0FBQ0csT0FBTyxDQUFDLEVBQzlEO01BQ0QsT0FBTzZQLGFBQWE7SUFDckI7SUFDQUUseUJBQXlCLEdBQUd4RCx3Q0FBd0MsQ0FDbkVwTixrQkFBa0IsRUFDbEJFLGdCQUFnQixDQUFDd0wsYUFBYSxFQUFFLEVBQ2hDeEwsZ0JBQWdCLENBQUM4RyxzQkFBc0IsRUFBRSxFQUN6Q3VHLFdBQVcsQ0FDWDtJQUNEc0QsMEJBQTBCLEdBQUdqQiw2Q0FBNkMsQ0FBQ2xQLGVBQWUsQ0FBQ0csT0FBTyxDQUFDOztJQUVuRztJQUNBLElBQ0MrUCx5QkFBeUIsQ0FBQ3pMLE1BQU0sS0FBSyxDQUFDLElBQ3RDMEwsMEJBQTBCLENBQUMxTCxNQUFNLEtBQUssQ0FBQyxLQUN0Q2tMLGdDQUFnQyxJQUFJZSxnQkFBZ0IsQ0FBQyxFQUNyRDtNQUNELElBQUksQ0FBQzdELFdBQVcsRUFBRTtRQUNqQjtRQUNBLElBQUk2QyxrQkFBa0IsQ0FBQ0osV0FBVyxJQUFJZSx3QkFBd0IsS0FBSyxPQUFPLElBQUlLLGdCQUFnQixFQUFFO1VBQy9GO1VBQ0EsTUFBTU8sMEJBQTBCLEdBQUdDLEVBQUUsQ0FDcEN2QixnQ0FBZ0MsSUFBSSxJQUFJO1VBQUU7VUFDMUNDLDRCQUE0QixDQUM1QjtVQUNELE9BQU9hLGlCQUFpQixDQUN2QkUsTUFBTSxDQUFDQyxHQUFHLENBQUM3SCxFQUFFLENBQUM4SCxVQUFVLEVBQUVJLDBCQUEwQixDQUFDLEVBQUU1QyxRQUFRLENBQUMyQixhQUFhLENBQUMsRUFBRTNCLFFBQVEsQ0FBQ3dCLGFBQWEsQ0FBQ0MsSUFBSSxDQUFDLENBQUMsQ0FDN0c7UUFDRixDQUFDLE1BQU07VUFDTixPQUFPRCxhQUFhLENBQUNDLElBQUk7UUFDMUI7UUFDQTtNQUNELENBQUMsTUFBTSxJQUFJWSxnQkFBZ0IsRUFBRTtRQUM1QjtRQUNBLE9BQU9WLGFBQWE7TUFDckIsQ0FBQyxNQUFNLElBQUlOLGtCQUFrQixDQUFDSixXQUFXLElBQUlLLGdDQUFnQyxFQUFFO1FBQzlFLE9BQU9jLGlCQUFpQixDQUFDRSxNQUFNLENBQUNoQixnQ0FBZ0MsRUFBRXRCLFFBQVEsQ0FBQzJCLGFBQWEsQ0FBQyxFQUFFM0IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDN0c7TUFDRCxDQUFDLE1BQU07UUFDTixPQUFPd0IsYUFBYSxDQUFDQyxJQUFJO01BQzFCO01BQ0E7SUFDRCxDQUFDLE1BQU0sSUFBSSxDQUFDakQsV0FBVyxFQUFFO01BQ3hCO01BQ0EsSUFBSTZDLGtCQUFrQixDQUFDSixXQUFXLElBQUllLHdCQUF3QixLQUFLLE9BQU8sSUFBSUssZ0JBQWdCLEVBQUU7UUFDL0Y7UUFDQSxNQUFNUyxrQ0FBa0MsR0FBR1IsTUFBTSxDQUNoREQsZ0JBQWdCLElBQUksQ0FBQ2hCLGtCQUFrQixDQUFDSixXQUFXLEVBQ25ETSw0QkFBNEIsRUFDNUJ2QixRQUFRLENBQUMsSUFBSSxDQUFDLENBQ2Q7UUFDRCxPQUFPb0MsaUJBQWlCLENBQ3ZCRSxNQUFNLENBQ0xDLEdBQUcsQ0FBQzdILEVBQUUsQ0FBQzhILFVBQVUsRUFBRU0sa0NBQWtDLENBQUMsRUFDdEQ5QyxRQUFRLENBQUMyQixhQUFhLENBQUMsRUFDdkJXLE1BQU0sQ0FDTE8sRUFBRSxDQUFDLEdBQUdoQix5QkFBeUIsQ0FBQ2tCLE1BQU0sQ0FBQ2pCLDBCQUEwQixDQUFDLENBQUMsRUFDbkU5QixRQUFRLENBQUMyQixhQUFhLENBQUMsRUFDdkIzQixRQUFRLENBQUN3QixhQUFhLENBQUNDLElBQUksQ0FBQyxDQUM1QixDQUNELENBQ0Q7TUFDRixDQUFDLE1BQU07UUFDTixPQUFPVyxpQkFBaUIsQ0FDdkJFLE1BQU0sQ0FDTE8sRUFBRSxDQUFDLEdBQUdoQix5QkFBeUIsQ0FBQ2tCLE1BQU0sQ0FBQ2pCLDBCQUEwQixDQUFDLENBQUMsRUFDbkU5QixRQUFRLENBQUMyQixhQUFhLENBQUMsRUFDdkIzQixRQUFRLENBQUN3QixhQUFhLENBQUNDLElBQUksQ0FBQyxDQUM1QixDQUNEO01BQ0Y7TUFDQTtJQUNELENBQUMsTUFBTSxJQUFJSixrQkFBa0IsQ0FBQ0osV0FBVyxJQUFJb0IsZ0JBQWdCLEVBQUU7TUFDOUQ7TUFDQSxPQUFPVixhQUFhO01BQ3BCO0lBQ0QsQ0FBQyxNQUFNO01BQ04sT0FBT1MsaUJBQWlCLENBQ3ZCRSxNQUFNLENBQ0xPLEVBQUUsQ0FBQyxHQUFHaEIseUJBQXlCLENBQUNrQixNQUFNLENBQUNqQiwwQkFBMEIsQ0FBQyxFQUFFUCw0QkFBNEIsQ0FBQyxFQUNqR3ZCLFFBQVEsQ0FBQzJCLGFBQWEsQ0FBQyxFQUN2QjNCLFFBQVEsQ0FBQ3dCLGFBQWEsQ0FBQ0MsSUFBSSxDQUFDLENBQzVCLENBQ0Q7SUFDRjtFQUNEOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQTtFQVFBLFNBQVNuUSx5QkFBeUIsQ0FBQ0wsa0JBQTRCLEVBQUVDLGlCQUF5QixFQUFFQyxnQkFBa0MsRUFBRTtJQUMvSCxNQUFNSyxZQUEwQixHQUFHLEVBQUU7SUFDckMsTUFBTUUsa0JBQWdDLEdBQUcsRUFBRTtJQUUzQyxNQUFNc1IsYUFBYSxHQUFHQyxhQUFhLENBQ2xDaFMsa0JBQWtCLENBQUNpUyxNQUFNLENBQUV4RSxTQUFTLElBQUs7TUFDeEMsT0FBT3lFLHFCQUFxQixDQUFDekUsU0FBUyxDQUE0QjtJQUNuRSxDQUFDLENBQUMsQ0FDRjtJQUVELElBQUlzRSxhQUFhLEVBQUU7TUFBQTtNQUNsQnhSLFlBQVksQ0FBQzJFLElBQUksQ0FBQztRQUNqQk0sSUFBSSxFQUFFMk0sVUFBVSxDQUFDQyxJQUFJO1FBQ3JCQyxjQUFjLEVBQUVuUyxnQkFBZ0IsQ0FBQ29TLCtCQUErQixDQUFDUCxhQUFhLENBQUNRLGtCQUFrQixDQUFDO1FBQ2xHQyxHQUFHLEVBQUVDLFNBQVMsQ0FBQ0Msd0JBQXdCLENBQUNYLGFBQWEsQ0FBQztRQUN0RDNRLE9BQU8sRUFBRStQLGlCQUFpQixDQUFDakQsS0FBSyxDQUFDVyxXQUFXLENBQUMsMEJBQTBCLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekZ4TixPQUFPLEVBQUU4UCxpQkFBaUIsQ0FDekJ3QixHQUFHLENBQ0Z6RSxLQUFLLENBQ0owRSwyQkFBMkIsMEJBQzFCYixhQUFhLENBQUN6TixXQUFXLG9GQUF6QixzQkFBMkJtRixFQUFFLDJEQUE3Qix1QkFBK0J3RSxNQUFNLEVBQ3JDLEVBQUUsRUFDRi9LLFNBQVMsRUFDVGhELGdCQUFnQixDQUFDMlMsNEJBQTRCLEVBQUUsQ0FDL0MsRUFDRCxJQUFJLENBQ0osQ0FDRCxDQUNEO1FBQ0RDLElBQUksRUFBRSx5QkFBQWYsYUFBYSxDQUFDZ0IsS0FBSyx5REFBbkIscUJBQXFCbEssUUFBUSxFQUFFLEtBQUltSyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxDQUFDQyxPQUFPLENBQUMsZUFBZSxDQUFDO1FBQzlHblMsV0FBVyxFQUFFO01BQ2QsQ0FBQyxDQUFDO0lBQ0g7SUFFQWYsa0JBQWtCLENBQ2hCaVMsTUFBTSxDQUFFeEUsU0FBUyxJQUFLO01BQ3RCLE9BQU8sQ0FBQ3lFLHFCQUFxQixDQUFDekUsU0FBUyxDQUF1QjtJQUMvRCxDQUFDLENBQUMsQ0FDRGxLLE9BQU8sQ0FBRWtLLFNBQWlDLElBQUs7TUFBQTtNQUMvQyxJQUFJLDRCQUFBQSxTQUFTLENBQUNuSixXQUFXLHVGQUFyQix3QkFBdUJtRixFQUFFLHVGQUF6Qix3QkFBMkJ3RSxNQUFNLDREQUFqQyx3QkFBbUNELE9BQU8sRUFBRSxNQUFLLElBQUksRUFBRTtRQUMxRHZOLGtCQUFrQixDQUFDeUUsSUFBSSxDQUFDO1VBQ3ZCTSxJQUFJLEVBQUUyTSxVQUFVLENBQUNnQixPQUFPO1VBQ3hCWCxHQUFHLEVBQUVDLFNBQVMsQ0FBQ0Msd0JBQXdCLENBQUNqRixTQUFTO1FBQ2xELENBQUMsQ0FBQztNQUNILENBQUMsTUFBTSxJQUNOMkYsNEJBQTRCLENBQUMzRixTQUFTLENBQUMsSUFDdkMsdUJBQUFBLFNBQVMsQ0FBQ00sTUFBTSx1REFBaEIsbUJBQWtCQyxPQUFPLEVBQUUsTUFBSyxJQUFJLElBQ3BDLDBCQUFBUCxTQUFTLENBQUM0RixXQUFXLDBEQUFyQixzQkFBdUJyRixPQUFPLEVBQUUsTUFBSyxJQUFJLEVBQ3hDO1FBQ0QsUUFBUVAsU0FBUyxDQUFDQyxLQUFLO1VBQ3RCO1lBQ0NuTixZQUFZLENBQUMyRSxJQUFJLENBQUM7Y0FDakJNLElBQUksRUFBRTJNLFVBQVUsQ0FBQ21CLGtCQUFrQjtjQUNuQ2pCLGNBQWMsRUFBRW5TLGdCQUFnQixDQUFDb1MsK0JBQStCLENBQUM3RSxTQUFTLENBQUM4RSxrQkFBa0IsQ0FBQztjQUM5RkMsR0FBRyxFQUFFQyxTQUFTLENBQUNDLHdCQUF3QixDQUFDakYsU0FBUyxDQUFDO2NBQ2xEcE0sT0FBTyxFQUFFOFAsaUJBQWlCLENBQ3pCd0IsR0FBRyxDQUNGekUsS0FBSyxDQUNKMEUsMkJBQTJCLDRCQUMxQm5GLFNBQVMsQ0FBQ25KLFdBQVcsdUZBQXJCLHdCQUF1Qm1GLEVBQUUsNERBQXpCLHdCQUEyQndFLE1BQU0sRUFDakMsRUFBRSxFQUNGL0ssU0FBUyxFQUNUaEQsZ0JBQWdCLENBQUMyUyw0QkFBNEIsRUFBRSxDQUMvQyxFQUNELElBQUksQ0FDSixDQUNELENBQ0Q7Y0FDRDlSLFdBQVcsRUFBRTtZQUNkLENBQUMsQ0FBQztZQUNGO1VBRUQ7WUFDQ1IsWUFBWSxDQUFDMkUsSUFBSSxDQUFDO2NBQ2pCTSxJQUFJLEVBQUUyTSxVQUFVLENBQUNvQixpQ0FBaUM7Y0FDbERsQixjQUFjLEVBQUVuUyxnQkFBZ0IsQ0FBQ29TLCtCQUErQixDQUFDN0UsU0FBUyxDQUFDOEUsa0JBQWtCLENBQUM7Y0FDOUZDLEdBQUcsRUFBRUMsU0FBUyxDQUFDQyx3QkFBd0IsQ0FBQ2pGLFNBQVMsQ0FBQztjQUNsRHBNLE9BQU8sRUFBRThQLGlCQUFpQixDQUN6QndCLEdBQUcsQ0FDRnpFLEtBQUssQ0FDSjBFLDJCQUEyQiw0QkFDMUJuRixTQUFTLENBQUNuSixXQUFXLHVGQUFyQix3QkFBdUJtRixFQUFFLDREQUF6Qix3QkFBMkJ3RSxNQUFNLEVBQ2pDLEVBQUUsRUFDRi9LLFNBQVMsRUFDVGhELGdCQUFnQixDQUFDMlMsNEJBQTRCLEVBQUUsQ0FDL0MsRUFDRCxJQUFJLENBQ0osQ0FDRDtZQUVILENBQUMsQ0FBQztZQUNGO1VBQ0Q7WUFDQztRQUFNO01BRVQ7SUFDRCxDQUFDLENBQUM7SUFFSCxPQUFPO01BQ050UyxZQUFZO01BQ1pFO0lBQ0QsQ0FBQztFQUNGO0VBRUEsU0FBUytTLHNCQUFzQixDQUM5QkMscUJBQXlHLEVBQ3pHQyxXQUFvQixFQUNwQkMsZ0JBQTZCLEVBQ1c7SUFDeEMsSUFBSUMsNkJBQWtGLEdBQUdDLFdBQVcsQ0FBQ3JELElBQUk7SUFDekcsSUFBSWlELHFCQUFxQixFQUFFO01BQzFCLElBQUksT0FBT0EscUJBQXFCLEtBQUssUUFBUSxFQUFFO1FBQzlDRyw2QkFBNkIsR0FBR2hCLDJCQUEyQixDQUFDYSxxQkFBcUIsQ0FBMEM7TUFDNUgsQ0FBQyxNQUFNO1FBQ047UUFDQUcsNkJBQTZCLEdBQUdFLGlDQUFpQyxDQUFDTCxxQkFBcUIsQ0FBQztNQUN6RjtJQUNEO0lBRUEsTUFBTU0sWUFBbUIsR0FBRyxFQUFFO0lBQzlCSixnQkFBZ0IsYUFBaEJBLGdCQUFnQix1QkFBaEJBLGdCQUFnQixDQUFFN00sSUFBSSxDQUFDdkQsT0FBTyxDQUFFaVAsR0FBUSxJQUFLO01BQzVDLElBQUlBLEdBQUcsQ0FBQ3JPLElBQUksS0FBSyxnQkFBZ0IsRUFBRTtRQUNsQzRQLFlBQVksQ0FBQzdPLElBQUksQ0FBQzJKLFdBQVcsQ0FBQzJELEdBQUcsQ0FBQ3JPLElBQUksRUFBRWpCLFNBQVMsQ0FBQyxDQUFDO01BQ3BEO0lBQ0QsQ0FBQyxDQUFDO0lBRUYsT0FBTzhRLFlBQVksQ0FDbEIsQ0FDQ0osNkJBQTZCLEVBQzdCL0UsV0FBVyxDQUFFLGtCQUFpQixFQUFFLFVBQVUsQ0FBQyxFQUMzQzZFLFdBQVcsSUFBSU8sTUFBTSxDQUFDQyxTQUFTLEVBQy9CUixXQUFXLElBQUlPLE1BQU0sQ0FBQ0UsUUFBUSxFQUM3QixHQUFFVCxXQUFZLEVBQUMsRUFDaEIsR0FBR0ssWUFBWSxDQUNmLEVBQ0RLLGVBQWUsQ0FBQ0MsZUFBZSxFQUMvQlYsZ0JBQWdCLENBQ2hCO0VBQ0Y7RUFFQSxTQUFTVyxxQkFBcUIsQ0FDN0J0VSxrQkFBd0MsRUFDeEN1VSwwQkFBcUQsRUFDckRyVSxnQkFBa0MsRUFDbENDLGtCQUFtRCxFQUNuREYsaUJBQXlCLEVBQ2dCO0lBQUE7SUFDekMsTUFBTXVVLFVBQVUsR0FBRyxDQUFBclUsa0JBQWtCLGFBQWxCQSxrQkFBa0IsdUJBQWxCQSxrQkFBa0IsQ0FBRXNVLE1BQU0sTUFBSXRVLGtCQUFrQixhQUFsQkEsa0JBQWtCLHVCQUFsQkEsa0JBQWtCLENBQUV1VSxNQUFNO0lBQzNFLE1BQU1qRSxxQkFBaUQsR0FBR3ZRLGdCQUFnQixDQUFDVSwrQkFBK0IsQ0FBQ1gsaUJBQWlCLENBQUM7SUFDN0gsTUFBTTBVLHFCQUFxQixHQUFJbEUscUJBQXFCLElBQUlBLHFCQUFxQixDQUFDRSxhQUFhLElBQUssQ0FBQyxDQUFDO0lBQ2xHO0lBQ0EsSUFBSTZELFVBQVUsYUFBVkEsVUFBVSxlQUFWQSxVQUFVLENBQUVJLFFBQVEsSUFBSUosVUFBVSxDQUFDSyxjQUFjLElBQUkxVSxrQkFBa0IsYUFBbEJBLGtCQUFrQixlQUFsQkEsa0JBQWtCLENBQUVzVSxNQUFNLEVBQUU7TUFDcEYsT0FBTztRQUNObkwsSUFBSSxFQUFFLFVBQVU7UUFDaEJzTCxRQUFRLEVBQUVKLFVBQVUsQ0FBQ0ksUUFBUTtRQUM3QkMsY0FBYyxFQUFFTCxVQUFVLENBQUNLLGNBQWM7UUFDekMxVSxrQkFBa0IsRUFBRUE7TUFDckIsQ0FBQztJQUNGO0lBRUEsSUFBSTJVLFNBQVM7SUFDYixJQUFJOVUsa0JBQWtCLEVBQUU7TUFBQTtNQUN2QjtNQUNBLE1BQU0rVSxpQkFBaUIsOEJBQUc3VSxnQkFBZ0IsQ0FBQzhMLFlBQVksRUFBRSw0REFBL0Isd0JBQWlDMUgsV0FBVztNQUN0RSxNQUFNMFEsdUJBQXVCLEdBQUdELGlCQUFpQixhQUFqQkEsaUJBQWlCLHVCQUFqQkEsaUJBQWlCLENBQUU3TSxNQUFxQztRQUN2RitNLHdCQUF3QixHQUFHRixpQkFBaUIsYUFBakJBLGlCQUFpQix1QkFBakJBLGlCQUFpQixDQUFFRyxPQUF1QztNQUN0RkosU0FBUyxHQUFHLENBQUFFLHVCQUF1QixhQUF2QkEsdUJBQXVCLGdEQUF2QkEsdUJBQXVCLENBQUVHLFNBQVMsMERBQWxDLHNCQUFvQ0MsU0FBUyxNQUFJSCx3QkFBd0IsYUFBeEJBLHdCQUF3QixnREFBeEJBLHdCQUF3QixDQUFFSSxzQkFBc0IsMERBQWhELHNCQUFrREQsU0FBUztNQUV4SCxJQUFJYiwwQkFBMEIsQ0FBQ2UsWUFBWSxLQUFLQyxZQUFZLENBQUNDLFdBQVcsSUFBSVYsU0FBUyxFQUFFO1FBQ3RGO1FBQ0EsTUFBTVcsS0FBSyxDQUFFLGtCQUFpQkYsWUFBWSxDQUFDQyxXQUFZLGlEQUFnRFYsU0FBVSxHQUFFLENBQUM7TUFDckg7TUFDQSxJQUFJTixVQUFVLGFBQVZBLFVBQVUsZUFBVkEsVUFBVSxDQUFFa0IsS0FBSyxFQUFFO1FBQUE7UUFDdEI7UUFDQSxPQUFPO1VBQ05wTSxJQUFJLEVBQUVpTCwwQkFBMEIsQ0FBQ2UsWUFBWTtVQUM3Q0ssTUFBTSxFQUFFcEIsMEJBQTBCLENBQUNxQixXQUFXO1VBQzlDZCxTQUFTLGdCQUFFQSxTQUFTLCtDQUFULFdBQVdqTSxRQUFRLEVBQUU7VUFDaENnTixnQkFBZ0IsRUFBRXRCLDBCQUEwQixDQUFDZSxZQUFZLEtBQUtDLFlBQVksQ0FBQ08sT0FBTyxHQUFHdEIsVUFBVSxDQUFDa0IsS0FBSyxHQUFHeFMsU0FBUyxDQUFDO1FBQ25ILENBQUM7TUFDRjtJQUNEOztJQUVBO0lBQ0EsSUFBSXFSLDBCQUEwQixDQUFDZSxZQUFZLEtBQUtDLFlBQVksQ0FBQ08sT0FBTyxFQUFFO01BQUE7TUFDckV2QiwwQkFBMEIsQ0FBQ2UsWUFBWSxHQUFHQyxZQUFZLENBQUN4SCxNQUFNO01BQzdEO01BQ0EsSUFBSSwwQkFBQTRHLHFCQUFxQixDQUFDVyxZQUFZLDBEQUFsQyxzQkFBb0NNLFdBQVcsTUFBSzFTLFNBQVMsRUFBRTtRQUNsRXFSLDBCQUEwQixDQUFDcUIsV0FBVyxHQUFHLEtBQUs7TUFDL0M7SUFDRDtJQUVBLE9BQU87TUFDTnRNLElBQUksRUFBRWlMLDBCQUEwQixDQUFDZSxZQUFZO01BQzdDSyxNQUFNLEVBQUVwQiwwQkFBMEIsQ0FBQ3FCLFdBQVc7TUFDOUNkLFNBQVMsaUJBQUVBLFNBQVMsZ0RBQVQsWUFBV2pNLFFBQVE7SUFDL0IsQ0FBQztFQUNGO0VBRUEsTUFBTWtOLDRCQUE0QixHQUFHLFVBQ3BDL1Ysa0JBQXdDLEVBQ3hDRSxnQkFBa0MsRUFDbENDLGtCQUFtRCxFQUNuRDZWLFVBQWtCLEVBQ2xCQyxTQUFvQixFQUNuQjtJQUNELElBQUlDLGFBQWEsRUFBRUMsZ0JBQWdCO0lBQ25DLElBQUlDLG1CQUEwRCxHQUFHckgsUUFBUSxDQUFDOEUsV0FBVyxDQUFDckQsSUFBSSxDQUFDO0lBQzNGLE1BQU1tRCxnQkFBZ0IsR0FBR3pULGdCQUFnQixDQUFDd0wsYUFBYSxFQUFFO0lBQ3pELElBQUl2TCxrQkFBa0IsSUFBSUgsa0JBQWtCLEVBQUU7TUFBQTtNQUM3Q21XLGdCQUFnQixHQUFHLDBCQUFBaFcsa0JBQWtCLENBQUNrVyxPQUFPLDBEQUExQixzQkFBNEJDLE1BQU0sZ0NBQUluVyxrQkFBa0IsQ0FBQ3VVLE1BQU0sMkRBQXpCLHVCQUEyQkUsUUFBUTtNQUM1RixJQUFJdUIsZ0JBQWdCLEVBQUU7UUFDckJELGFBQWEsR0FDWiwwREFBMEQsR0FBR0MsZ0JBQWdCLEdBQUcsbUNBQW1DO01BQ3JILENBQUMsTUFBTSxJQUFJeEMsZ0JBQWdCLEVBQUU7UUFBQTtRQUM1QixNQUFNdk0sZUFBZSxHQUFHbEgsZ0JBQWdCLENBQUM4TCxZQUFZLEVBQUU7UUFDdkRtSyxnQkFBZ0IsNkJBQUdoVyxrQkFBa0IsQ0FBQ3VVLE1BQU0sMkRBQXpCLHVCQUEyQmdCLEtBQUs7UUFDbkQsSUFBSVMsZ0JBQWdCLElBQUksQ0FBQ0ksV0FBVyxDQUFDQyxXQUFXLENBQUNwUCxlQUFlLENBQUMsRUFBRTtVQUFBO1VBQ2xFZ1AsbUJBQW1CLEdBQUc1QyxzQkFBc0IsMEJBQzNDeFQsa0JBQWtCLENBQUNzRSxXQUFXLG9GQUE5QixzQkFBZ0NtRixFQUFFLDJEQUFsQyx1QkFBb0NnTixXQUFXLEVBQy9DLENBQUMsQ0FBQ0YsV0FBVyxDQUFDRyxZQUFZLENBQUN0UCxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUNtUCxXQUFXLENBQUNJLFlBQVksQ0FBQ3ZQLGVBQWUsQ0FBQyxFQUMxRnVNLGdCQUFnQixDQUNoQjtVQUNEdUMsYUFBYSxHQUNaLDhHQUE4RyxHQUM5R0YsVUFBVSxHQUNWLGdCQUFnQixJQUNmTyxXQUFXLENBQUNHLFlBQVksQ0FBQ3RQLGVBQWUsQ0FBQyxJQUFJbVAsV0FBVyxDQUFDSSxZQUFZLENBQUN2UCxlQUFlLENBQUMsR0FDcEYsOERBQThELEdBQzlELFdBQVcsQ0FBQyxJQUNkNk8sU0FBUyxLQUFLLGlCQUFpQixJQUFJQSxTQUFTLEtBQUssV0FBVyxHQUFHLDBCQUEwQixHQUFHLEVBQUUsQ0FBQyxHQUNoRyxJQUFJLENBQUMsQ0FBQztRQUNSLENBQUMsTUFBTTtVQUFBO1VBQ05HLG1CQUFtQixHQUFHNUMsc0JBQXNCLDJCQUFDeFQsa0JBQWtCLENBQUNzRSxXQUFXLHFGQUE5Qix1QkFBZ0NtRixFQUFFLDJEQUFsQyx1QkFBb0NnTixXQUFXLEVBQUUsS0FBSyxFQUFFOUMsZ0JBQWdCLENBQUM7UUFDdkg7TUFDRDtJQUNEO0lBQ0EsTUFBTWlELHNCQUF5RCxHQUFHNUMsWUFBWSxDQUM3RSxDQUFDbkYsV0FBVyxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUN6Q3VGLGVBQWUsQ0FBQ3lDLFlBQVksRUFDNUJsRCxnQkFBZ0IsQ0FDaEI7SUFDRCxPQUFPO01BQ05tRCxLQUFLLEVBQUVaLGFBQWE7TUFDcEJ2RyxNQUFNLEVBQUV1RyxhQUFhLEdBQUcsWUFBWSxHQUFHaFQsU0FBUztNQUNoRG1SLGVBQWUsRUFBRWxELGlCQUFpQixDQUFDaUYsbUJBQW1CLENBQUM7TUFDdkRXLFlBQVksRUFBRTVGLGlCQUFpQixDQUFDeUYsc0JBQXNCLENBQUM7TUFDdkR2VixPQUFPLEVBQUU4UCxpQkFBaUIsQ0FBQ3dCLEdBQUcsQ0FBQ2xKLEVBQUUsQ0FBQ3VOLFVBQVUsQ0FBQztJQUM5QyxDQUFDO0VBQ0YsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNdkwsd0JBQXdCLEdBQUcsVUFDdkN3TCxrQkFBNEMsRUFDNUN6VSxVQUFzQixFQU1JO0lBQUEsSUFMMUJiLGlCQUEwQyx1RUFBRyxFQUFFO0lBQUEsSUFDL0N1VixrQkFBNEI7SUFBQSxJQUM1QmhYLGdCQUFrQztJQUFBLElBQ2xDK1YsU0FBb0I7SUFBQSxJQUNwQmtCLGlDQUEyQztJQUUzQyxNQUFNMVUsWUFBcUMsR0FBR2QsaUJBQWlCO0lBQy9EO0lBQ0EsTUFBTWUsaUJBQWlCLEdBQUcsSUFBSUMsaUJBQWlCLENBQUNILFVBQVUsRUFBRXRDLGdCQUFnQixDQUFDO0lBRTdFc0MsVUFBVSxDQUFDeUIsZ0JBQWdCLENBQUNWLE9BQU8sQ0FBRVcsUUFBa0IsSUFBSztNQUMzRDtNQUNBLE1BQU1rVCxNQUFNLEdBQUd6VixpQkFBaUIsQ0FBQ3VOLElBQUksQ0FBRW5NLE1BQU0sSUFBSztRQUNqRCxPQUFPQSxNQUFNLENBQUNvQixJQUFJLEtBQUtELFFBQVEsQ0FBQ0MsSUFBSTtNQUNyQyxDQUFDLENBQUM7O01BRUY7TUFDQSxJQUFJLENBQUNELFFBQVEsQ0FBQ21ULFVBQVUsSUFBSSxDQUFDRCxNQUFNLEVBQUU7UUFDcEMsTUFBTUUscUJBQTBDLEdBQUdDLHdCQUF3QixDQUMxRXJULFFBQVEsQ0FBQ0MsSUFBSSxFQUNiRCxRQUFRLEVBQ1JoRSxnQkFBZ0IsRUFDaEIsSUFBSSxFQUNKK1YsU0FBUyxDQUNUO1FBQ0QsTUFBTXVCLG9CQUE4QixHQUFHM1EsTUFBTSxDQUFDQyxJQUFJLENBQUN3USxxQkFBcUIsQ0FBQzFLLFVBQVUsQ0FBQztRQUNwRixNQUFNNkssdUJBQWlDLEdBQUc1USxNQUFNLENBQUNDLElBQUksQ0FBQ3dRLHFCQUFxQixDQUFDSSxvQkFBb0IsQ0FBQztRQUNqRyxJQUFJSixxQkFBcUIsQ0FBQ0ssb0NBQW9DLENBQUN4UyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQzFFO1VBQ0FnUyxpQ0FBaUMsQ0FBQ2pTLElBQUksQ0FBQyxHQUFHb1MscUJBQXFCLENBQUNLLG9DQUFvQyxDQUFDO1FBQ3RHO1FBQ0EsTUFBTUMsVUFBVSxHQUFHQywrQkFBK0IsQ0FDakQzVCxRQUFRLEVBQ1JoRSxnQkFBZ0IsQ0FBQ29TLCtCQUErQixDQUFDcE8sUUFBUSxDQUFDcU8sa0JBQWtCLENBQUMsRUFDN0VyTyxRQUFRLENBQUNDLElBQUksRUFDYixJQUFJLEVBQ0osSUFBSSxFQUNKK1Msa0JBQWtCLEVBQ2xCeFUsaUJBQWlCLEVBQ2pCeEMsZ0JBQWdCLEVBQ2hCaVgsaUNBQWlDLENBQ2pDO1FBRUQsTUFBTTdMLFlBQVksR0FBR3BMLGdCQUFnQixDQUFDNFgsb0JBQW9CLENBQUMsUUFBUSxnREFBcUMsQ0FDdkc1WCxnQkFBZ0IsQ0FBQ3dMLGFBQWEsRUFBRSxDQUNoQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsTUFBTXFNLHFCQUFxQixHQUFHQyxpQ0FBaUMsQ0FBQ0osVUFBVSxDQUFDelQsSUFBSSxFQUFFbUgsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUM7UUFDM0csSUFBSXpFLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDaVIscUJBQXFCLENBQUMsQ0FBQzVTLE1BQU0sR0FBRyxDQUFDLEVBQUU7VUFDbER5UyxVQUFVLENBQUN0VixhQUFhLEdBQUc7WUFDMUIsR0FBR3lWO1VBQ0osQ0FBQztRQUNGO1FBQ0EsSUFBSVAsb0JBQW9CLENBQUNyUyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ3BDeVMsVUFBVSxDQUFDM1UsYUFBYSxHQUFHdVUsb0JBQW9CO1VBQy9DSSxVQUFVLENBQUNLLGNBQWMsR0FBRztZQUMzQixHQUFHTCxVQUFVLENBQUNLLGNBQWM7WUFDNUJDLFFBQVEsRUFBRVoscUJBQXFCLENBQUNhLHNCQUFzQjtZQUN0REMsSUFBSSxFQUFFZCxxQkFBcUIsQ0FBQ2U7VUFDN0IsQ0FBQztVQUNEVCxVQUFVLENBQUNLLGNBQWMsQ0FBQ3pTLElBQUksR0FBRzhTLGtCQUFrQixDQUFDcFUsUUFBUSxDQUFDc0IsSUFBSSxFQUFFZ1Msb0JBQW9CLENBQUNyUyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1VBRW5HLElBQUltUyxxQkFBcUIsQ0FBQ2lCLGNBQWMsRUFBRTtZQUN6Q1gsVUFBVSxDQUFDSyxjQUFjLENBQUNPLFlBQVksR0FBR2xCLHFCQUFxQixDQUFDaUIsY0FBYztZQUM3RVgsVUFBVSxDQUFDSyxjQUFjLENBQUN6UyxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUM7VUFDOUMsQ0FBQyxNQUFNLElBQUk4UixxQkFBcUIsQ0FBQ21CLGdCQUFnQixFQUFFO1lBQ2xEYixVQUFVLENBQUNLLGNBQWMsQ0FBQ3hVLElBQUksR0FBRzZULHFCQUFxQixDQUFDbUIsZ0JBQWdCO1VBQ3hFO1VBQ0EsSUFBSW5CLHFCQUFxQixDQUFDb0Isa0JBQWtCLEVBQUU7WUFDN0NkLFVBQVUsQ0FBQ0ssY0FBYyxDQUFDVSxnQkFBZ0IsR0FBR3JCLHFCQUFxQixDQUFDb0Isa0JBQWtCO1lBQ3JGZCxVQUFVLENBQUNLLGNBQWMsQ0FBQ1csR0FBRyxHQUFHLEtBQUs7VUFDdEMsQ0FBQyxNQUFNLElBQUl0QixxQkFBcUIsQ0FBQ3VCLG9CQUFvQixFQUFFO1lBQ3REakIsVUFBVSxDQUFDSyxjQUFjLENBQUN0UCxRQUFRLEdBQUcyTyxxQkFBcUIsQ0FBQ3VCLG9CQUFvQjtVQUNoRjtVQUNBLElBQUl2QixxQkFBcUIsQ0FBQ3dCLDBCQUEwQixFQUFFO1lBQ3JEbEIsVUFBVSxDQUFDa0IsMEJBQTBCLEdBQUd4QixxQkFBcUIsQ0FBQ3dCLDBCQUEwQjtZQUN4RmxCLFVBQVUsQ0FBQ0ssY0FBYyxDQUFDelMsSUFBSSxHQUFHLFFBQVE7VUFDMUM7O1VBRUE7VUFDQWdTLG9CQUFvQixDQUFDalUsT0FBTyxDQUFFWSxJQUFJLElBQUs7WUFDdEM4UyxrQkFBa0IsQ0FBQzlTLElBQUksQ0FBQyxHQUFHbVQscUJBQXFCLENBQUMxSyxVQUFVLENBQUN6SSxJQUFJLENBQUM7VUFDbEUsQ0FBQyxDQUFDO1FBQ0g7UUFFQSxJQUFJc1QsdUJBQXVCLENBQUN0UyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ3ZDeVMsVUFBVSxDQUFDbUIsdUJBQXVCLEdBQUd0Qix1QkFBdUI7VUFDNUQ7VUFDQUEsdUJBQXVCLENBQUNsVSxPQUFPLENBQUVZLElBQUksSUFBSztZQUN6QztZQUNBOFMsa0JBQWtCLENBQUM5UyxJQUFJLENBQUMsR0FBR21ULHFCQUFxQixDQUFDSSxvQkFBb0IsQ0FBQ3ZULElBQUksQ0FBQztVQUM1RSxDQUFDLENBQUM7UUFDSDtRQUNBMUIsWUFBWSxDQUFDeUMsSUFBSSxDQUFDMFMsVUFBVSxDQUFDO01BQzlCO01BQ0E7TUFDQTtNQUNBO01BQ0EsSUFBSTdPLGNBQWMsQ0FBQzdFLFFBQVEsQ0FBQyxLQUFLLGFBQWEsRUFBRTtRQUMvQ2dULGtCQUFrQixHQUFHQSxrQkFBa0IsQ0FBQ3BGLE1BQU0sQ0FBQzVOLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDO1FBQzdEMUIsWUFBWSxDQUFDeUMsSUFBSSxDQUNoQjJTLCtCQUErQixDQUM5QjNULFFBQVEsRUFDUmhFLGdCQUFnQixDQUFDb1MsK0JBQStCLENBQUNwTyxRQUFRLENBQUNxTyxrQkFBa0IsQ0FBQyxFQUM3RXJPLFFBQVEsQ0FBQ0MsSUFBSSxFQUNiLEtBQUssRUFDTCxLQUFLLEVBQ0wrUyxrQkFBa0IsRUFDbEJ4VSxpQkFBaUIsRUFDakJ4QyxnQkFBZ0IsRUFDaEIsRUFBRSxDQUNGLENBQ0Q7TUFDRjtJQUNELENBQUMsQ0FBQzs7SUFFRjtJQUNBLE1BQU04WSxjQUFjLEdBQUdDLHFCQUFxQixDQUMzQ2hDLGtCQUFrQixFQUNsQnhVLFlBQVksRUFDWnlVLGtCQUFrQixFQUNsQmhYLGdCQUFnQixFQUNoQnNDLFVBQVUsRUFDVjJVLGlDQUFpQyxDQUNqQztJQUVELE9BQU8xVSxZQUFZLENBQUNxUCxNQUFNLENBQUNrSCxjQUFjLENBQUM7RUFDM0MsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkE7RUFjQSxNQUFNbkIsK0JBQStCLEdBQUcsVUFDdkMzVCxRQUFrQixFQUNsQmdWLGdCQUF3QixFQUN4Qi9WLFlBQW9CLEVBQ3BCZ1csa0JBQTJCLEVBQzNCQyxzQkFBK0IsRUFDL0JsQyxrQkFBNEIsRUFDNUJ4VSxpQkFBb0MsRUFDcEN4QyxnQkFBa0MsRUFDbENpWCxpQ0FBMkMsRUFDbkI7SUFBQTtJQUN4QixNQUFNaFQsSUFBSSxHQUFHZ1Ysa0JBQWtCLEdBQUdoVyxZQUFZLEdBQUksYUFBWUEsWUFBYSxFQUFDO0lBQzVFLE1BQU1xUCxHQUFHLEdBQUcsQ0FBQzJHLGtCQUFrQixHQUFHLGFBQWEsR0FBRyxZQUFZLElBQUlFLG1CQUFtQixDQUFDbFcsWUFBWSxDQUFDO0lBQ25HLE1BQU1tVyw0QkFBNEIsR0FBR0MscUJBQXFCLENBQUNyWixnQkFBZ0IsRUFBRWdFLFFBQVEsQ0FBQztJQUN0RixNQUFNc1YsUUFBUSxHQUFHLDBCQUFBdFYsUUFBUSxDQUFDSSxXQUFXLG9GQUFwQixzQkFBc0JtRixFQUFFLHFGQUF4Qix1QkFBMEJ3RSxNQUFNLDJEQUFoQyx1QkFBa0NELE9BQU8sRUFBRSxNQUFLLElBQUk7SUFDckUsTUFBTXlMLFNBQTZCLEdBQUd2VixRQUFRLENBQUNDLElBQUksR0FBR3VWLGFBQWEsQ0FBQ3hWLFFBQVEsQ0FBQ0MsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsR0FBR2pCLFNBQVM7SUFDM0csTUFBTXlXLE9BQWdCLEdBQUdGLFNBQVMsSUFBSXZWLFFBQVEsQ0FBQ0MsSUFBSTtJQUNuRCxNQUFNeVYsVUFBa0IsR0FBR3RCLGtCQUFrQixDQUFDcFUsUUFBUSxDQUFDc0IsSUFBSSxDQUFDO0lBQzVELE1BQU1xVSxnQkFBb0MsR0FBRzNWLFFBQVEsQ0FBQ3NCLElBQUksS0FBSyxVQUFVLEdBQUcsWUFBWSxHQUFHdEMsU0FBUztJQUNwRyxNQUFNNFcsUUFBNEIsR0FBR0Msb0JBQW9CLENBQUM3VixRQUFRLENBQUM7SUFDbkUsTUFBTThWLGtCQUFrQixHQUFHQyxhQUFhLENBQUMvVixRQUFRLEVBQUU0VixRQUFRLENBQUM7SUFDNUQsTUFBTXhPLFlBQXlCLEdBQUdwTCxnQkFBZ0IsQ0FBQzRYLG9CQUFvQixDQUFDLFFBQVEsZ0RBQXFDLENBQ3BINVgsZ0JBQWdCLENBQUN3TCxhQUFhLEVBQUUsQ0FDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLE1BQU13TyxpQ0FBaUMsR0FDdEMvQyxpQ0FBaUMsSUFBSUEsaUNBQWlDLENBQUNqUixPQUFPLENBQUMvQyxZQUFZLENBQUMsSUFBSSxDQUFDO0lBQ2xHLE1BQU1nWCxRQUFRLEdBQUcsQ0FBQyxDQUFDWCxRQUFRLElBQUlVLGlDQUFpQyxLQUFLaEQsa0JBQWtCLENBQUNoUixPQUFPLENBQUMvQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEgsTUFBTWlYLFVBQVUsR0FBRztNQUNsQkMsU0FBUyxFQUFFblcsUUFBUSxDQUFDc0IsSUFBSSxJQUFJc1UsUUFBUTtNQUNwQ3hYLGFBQWEsRUFBRTBYLGtCQUFrQixDQUFDMVgsYUFBYTtNQUMvQ2dZLFdBQVcsRUFBRU4sa0JBQWtCLENBQUNNO0lBQ2pDLENBQUM7SUFDRCxJQUFJckMsY0FBcUMsR0FBRyxJQUFJO0lBQ2hELElBQUlzQyxtQkFBbUIsQ0FBQ3JXLFFBQVEsQ0FBQyxFQUFFO01BQUE7TUFDbEMsTUFBTXNVLFlBQVksR0FBRzNRLDZCQUE2QixDQUFDM0QsUUFBUSxDQUFDLElBQUk0RCx5QkFBeUIsQ0FBQzVELFFBQVEsQ0FBQztNQUNuRyxNQUFNeVUsZ0JBQWdCLEdBQUczUSw2QkFBNkIsQ0FBQzlELFFBQVEsQ0FBQztNQUNoRSxNQUFNdUUsUUFBUSxHQUFHLDJCQUFBdkUsUUFBUSxDQUFDSSxXQUFXLHFGQUFwQix1QkFBc0JnRSxRQUFRLDJEQUE5Qix1QkFBZ0NDLFdBQVcsZ0NBQUlyRSxRQUFRLENBQUNJLFdBQVcscUZBQXBCLHVCQUFzQmdFLFFBQVEsMkRBQTlCLHVCQUFnQ0UsSUFBSTtNQUNwRyxNQUFNSSxZQUFZLDZCQUFHMUUsUUFBUSxDQUFDSSxXQUFXLHFGQUFwQix1QkFBc0I0RCxNQUFNLDJEQUE1Qix1QkFBOEJDLFFBQVE7TUFFM0Q4UCxjQUFjLEdBQUc7UUFDaEJ6UyxJQUFJLEVBQUVvVSxVQUFVO1FBQ2hCWSxXQUFXLEVBQUVYLGdCQUFnQjtRQUM3QlksS0FBSyxFQUFFdlcsUUFBUSxDQUFDdVcsS0FBSztRQUNyQkMsU0FBUyxFQUFFeFcsUUFBUSxDQUFDc0IsSUFBSSxLQUFLO01BQzlCLENBQUM7TUFFRCxJQUFJZ1QsWUFBWSxFQUFFO1FBQ2pCUCxjQUFjLENBQUNPLFlBQVksR0FBR0EsWUFBWSxDQUFDclUsSUFBSTtRQUMvQzhULGNBQWMsQ0FBQ3pTLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQztNQUNuQyxDQUFDLE1BQU0sSUFBSWlELFFBQVEsRUFBRTtRQUNwQndQLGNBQWMsQ0FBQ3hVLElBQUksR0FBSSxHQUFFZ0YsUUFBUyxFQUFDO01BQ3BDO01BQ0EsSUFBSWtRLGdCQUFnQixFQUFFO1FBQ3JCVixjQUFjLENBQUNVLGdCQUFnQixHQUFHQSxnQkFBZ0IsQ0FBQ3hVLElBQUk7UUFDdkQ4VCxjQUFjLENBQUNXLEdBQUcsR0FBRyxLQUFLO01BQzNCLENBQUMsTUFBTSxJQUFJaFEsWUFBWSxFQUFFO1FBQ3hCcVAsY0FBYyxDQUFDdFAsUUFBUSxHQUFHQyxZQUFZLENBQUNDLFFBQVEsRUFBRTtNQUNsRDtJQUNEO0lBRUEsTUFBTThSLGlDQUF1RCxHQUFHQyxxQ0FBcUMsQ0FBQ3pYLFlBQVksRUFBRWpELGdCQUFnQixDQUFDO0lBRXJJLE1BQU02QyxNQUE2QixHQUFHO01BQ3JDeVAsR0FBRyxFQUFFQSxHQUFHO01BQ1JoTixJQUFJLEVBQUUxRixVQUFVLENBQUMrYSxVQUFVO01BQzNCQyxLQUFLLEVBQUVDLFFBQVEsQ0FBQzdXLFFBQVEsRUFBRXlWLE9BQU8sQ0FBQztNQUNsQ3FCLFVBQVUsRUFBRXJCLE9BQU8sR0FBR29CLFFBQVEsQ0FBQzdXLFFBQVEsQ0FBQyxHQUFHaEIsU0FBUztNQUNwRCtYLEtBQUssRUFBRXRCLE9BQU8sR0FBR0YsU0FBUyxHQUFHdlcsU0FBUztNQUN0Q21QLGNBQWMsRUFBRTZHLGdCQUFnQjtNQUNoQ2dDLGtCQUFrQixFQUFFNUIsNEJBQTRCO01BQ2hEbFgsWUFBWSxFQUFFLENBQUNnWCxzQkFBc0IsSUFBSUksUUFBUSxHQUFHMkIsZ0JBQWdCLENBQUNsTixNQUFNLEdBQUdrTixnQkFBZ0IsQ0FBQ0MsVUFBVTtNQUN6R2pYLElBQUksRUFBRUEsSUFBSTtNQUNWaEIsWUFBWSxFQUFFQSxZQUFZO01BQzFCZ1gsUUFBUSxFQUFFQSxRQUFRO01BQ2xCa0IsV0FBVyxFQUFFM1ksaUJBQWlCLENBQUNVLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDVixpQkFBaUIsQ0FBQzRZLG1CQUFtQixDQUFDcFgsUUFBUSxDQUFDLEdBQUdpVyxRQUFRO01BQ3BIb0IsS0FBSyxFQUFFclgsUUFBUSxDQUFDcVgsS0FBSztNQUNyQnRELGNBQWMsRUFBRUEsY0FBYztNQUM5QnVELGFBQWEsRUFBRUMsd0JBQXdCLENBQUN2YixnQkFBZ0IsQ0FBQztNQUN6RGthLFVBQVUsRUFBRUEsVUFBd0I7TUFDcENsWSxVQUFVLEVBQUV3WixhQUFhLGtCQUFFeFgsUUFBUSxDQUFTSSxXQUFXLHNFQUE3QixjQUErQm1GLEVBQUUscURBQWpDLGlCQUFtQ2tTLGdCQUFnQixFQUFFclEsWUFBWSxDQUFDO01BQzVGc1EsZ0JBQWdCLEVBQUVqQjtJQUNuQixDQUFDO0lBQ0QsTUFBTWtCLFFBQVEsR0FBR0MsV0FBVyxDQUFDNVgsUUFBUSxDQUFDO0lBQ3RDLElBQUkyWCxRQUFRLEVBQUU7TUFDYjlZLE1BQU0sQ0FBQ2daLE9BQU8sR0FBR0YsUUFBUTtJQUMxQjtJQUNBLE1BQU1HLGlCQUFpQixHQUFHQyx5QkFBeUIsQ0FBQy9YLFFBQVEsQ0FBQztJQUM3RCxJQUFJZ1ksK0JBQStCLENBQUNoWSxRQUFRLENBQUMsSUFBSSxPQUFPOFgsaUJBQWlCLEtBQUssUUFBUSxJQUFJalosTUFBTSxDQUFDa1YsY0FBYyxFQUFFO01BQ2hIbFYsTUFBTSxDQUFDK1YsMEJBQTBCLEdBQUdrRCxpQkFBaUI7TUFDckRqWixNQUFNLENBQUNrVixjQUFjLENBQUNDLFFBQVEsR0FBRyxNQUFNLEdBQUc4RCxpQkFBaUI7SUFDNUQ7SUFDQSxPQUFPalosTUFBTTtFQUNkLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUEsU0FBU3dYLG1CQUFtQixDQUFDbk0sTUFBeUMsRUFBVztJQUFBO0lBQ2hGLElBQUkrTixZQUFZLEVBQUVqWSxRQUFRO0lBQzFCLE1BQU1rWSx3QkFBd0IsdUJBQUloTyxNQUFNLENBQWM5SixXQUFXLENBQUNtRixFQUFFLHFEQUFuQyxpQkFBcUNrUyxnQkFBZ0I7SUFDdEYsSUFBSVUsVUFBVSxDQUFDak8sTUFBTSxDQUFDLElBQUlnTyx3QkFBd0IsYUFBeEJBLHdCQUF3QixlQUF4QkEsd0JBQXdCLENBQUUxTyxLQUFLLEVBQUU7TUFDMUQsSUFBSTRPLG1DQUFtQyxDQUFDRix3QkFBd0IsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUMzRSxPQUFPLEtBQUs7TUFDYjtNQUNBRCxZQUFZLEdBQUdDLHdCQUF3QixhQUF4QkEsd0JBQXdCLHVCQUF4QkEsd0JBQXdCLENBQUUxTyxLQUFLO0lBQy9DLENBQUMsTUFBTSxJQUFJNE8sbUNBQW1DLENBQUNsTyxNQUFNLENBQTJCLEtBQUssSUFBSSxFQUFFO01BQzFGLE9BQU8sS0FBSztJQUNiLENBQUMsTUFBTTtNQUFBO01BQ05sSyxRQUFRLEdBQUdrSyxNQUFnQztNQUMzQytOLFlBQVksR0FBR2pZLFFBQVEsQ0FBQ3dKLEtBQUs7TUFDN0IsSUFBSXlPLFlBQVksd0RBQTZDLGVBQUtqWSxRQUFRLENBQTRCcVksTUFBTSx1REFBM0MsUUFBNkNDLE9BQU8sNENBQXBELGdCQUFzRDlPLEtBQUssRUFBRTtRQUFBO1FBQzdIO1FBQ0F5TyxZQUFZLGVBQUlqWSxRQUFRLENBQTRCcVksTUFBTSxpRUFBM0MsU0FBNkNDLE9BQU8scURBQXBELGlCQUFzRDlPLEtBQUs7UUFDMUUsT0FBTyxpREFBc0N4SCxPQUFPLENBQUNpVyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7TUFDMUUsQ0FBQyxNQUFNLElBQ04sV0FBQ2pZLFFBQVEsQ0FBZTBGLEtBQUssNkRBQTdCLE9BQStCNFMsT0FBTyw0RUFBdEMsZUFBd0NsWSxXQUFXLG9GQUFuRCxzQkFBcUQwTyxJQUFJLHFGQUF6RCx1QkFBMkR5SixTQUFTLDJEQUFwRSx1QkFBc0VDLElBQUksTUFBSyw2QkFBNkIsSUFDNUcsWUFBQ3hZLFFBQVEsQ0FBZTBGLEtBQUssK0RBQTdCLFFBQStCNFMsT0FBTyw2RUFBdEMsZ0JBQXdDbFksV0FBVyxvRkFBbkQsc0JBQXFEME8sSUFBSSwyREFBekQsdUJBQTJEMkosS0FBSyxNQUFLLElBQUksRUFDeEU7UUFDRDtRQUNBLE9BQU8sS0FBSztNQUNiO0lBQ0Q7SUFDQSxPQUFPUixZQUFZLEdBQ2hCLHVLQUlDLENBQUNqVyxPQUFPLENBQUNpVyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsR0FDOUIsSUFBSTtFQUNSOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTVMsY0FBYyxHQUFHLFVBQVVuUCxTQUFpQyxFQUFFO0lBQ25FLFFBQVFBLFNBQVMsQ0FBQ0MsS0FBSztNQUN0QjtNQUNBO1FBQ0MsT0FBTyxDQUFDLENBQUNELFNBQVMsQ0FBQ00sTUFBTTtNQUMxQjtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7UUFDQyxPQUFPLElBQUk7TUFDWjtNQUNBO01BQ0E7SUFBQTtFQUVGLENBQUM7RUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU04TyxxQkFBcUIsR0FBRyxVQUNwQ0Msa0JBQXVDLEVBQ3ZDeGEsYUFBbUIsRUFDYTtJQUFBO0lBQ2hDLE1BQU1xTSxZQUF5RCxHQUFHbU8sa0JBQWtCLENBQUNuTyxZQUFZO0lBQ2pHLElBQUlvTyxhQUFhO0lBQ2pCLElBQUlwTyxZQUFZLEVBQUU7TUFDakIsUUFBUUEsWUFBWSxDQUFDakIsS0FBSztRQUN6QjtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7VUFDQ3FQLGFBQWEsR0FBR3BPLFlBQVksQ0FBQy9FLEtBQUssQ0FBQzRTLE9BQU87VUFDMUM7UUFDRDtVQUNDO1VBQ0EsSUFBSSxDQUFBN04sWUFBWSxhQUFaQSxZQUFZLCtDQUFaQSxZQUFZLENBQUU0TixNQUFNLGtGQUFwQixxQkFBc0JDLE9BQU8sMERBQTdCLHNCQUErQjlPLEtBQUssZ0RBQW9DLEVBQUU7WUFBQTtZQUM3RXFQLGFBQWEsNkJBQUdwTyxZQUFZLENBQUM0TixNQUFNLENBQUNDLE9BQU8sMkRBQTNCLHVCQUE2QjVTLEtBQUssQ0FBQzRTLE9BQU87VUFDM0Q7VUFDQTtRQUNEO1FBQ0E7UUFDQTtVQUNDTyxhQUFhLEdBQUc3WixTQUFTO01BQUM7SUFFN0I7SUFDQSxNQUFNOFosK0JBQStCLEdBQUcxYSxhQUFhLGFBQWJBLGFBQWEsZUFBYkEsYUFBYSxDQUFFMmEsV0FBVyxHQUFHeFQsRUFBRSxDQUFDeVQsVUFBVSxHQUFHbk8sUUFBUSxDQUFDLEtBQUssQ0FBQztJQUNwRyxNQUFNb08sZ0JBQWdCLEdBQUc3YSxhQUFhLGFBQWJBLGFBQWEsZUFBYkEsYUFBYSxDQUFFMmEsV0FBVyxHQUFHL08sS0FBSyxDQUFDekUsRUFBRSxDQUFDMlQsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHck8sUUFBUSxDQUFDLEtBQUssQ0FBQzs7SUFFOUY7SUFDQTtJQUNBO0lBQ0E7SUFDQSxPQUFPdUMsR0FBRyxDQUNULEdBQUcsQ0FDRnFCLEdBQUcsQ0FBQ3pFLEtBQUssQ0FBQzBFLDJCQUEyQixDQUFDakUsWUFBWSxhQUFaQSxZQUFZLGdEQUFaQSxZQUFZLENBQUVySyxXQUFXLG9GQUF6QixzQkFBMkJtRixFQUFFLDJEQUE3Qix1QkFBK0J3RSxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUNwRm9ELE1BQU0sQ0FDTCxDQUFDLENBQUMwTCxhQUFhLEVBQ2ZBLGFBQWEsSUFBSXBLLEdBQUcsQ0FBQ3pFLEtBQUssQ0FBQzBFLDJCQUEyQiwwQkFBQ21LLGFBQWEsQ0FBQ3pZLFdBQVcsb0ZBQXpCLHNCQUEyQm1GLEVBQUUsMkRBQTdCLHVCQUErQndFLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQ3JHLElBQUksQ0FDSixFQUNEMkQsRUFBRSxDQUFDZSxHQUFHLENBQUNxSywrQkFBK0IsQ0FBQyxFQUFFRyxnQkFBZ0IsQ0FBQyxDQUMxRCxDQUNEO0VBQ0YsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUEE7RUFRQSxNQUFNRSwrQkFBK0IsR0FBRyxVQUN2Q0MsY0FBc0MsRUFDdENDLGtCQUF1QixFQUN3QjtJQUFBO0lBQy9DLE1BQU1DLDJCQUE0RCxHQUFHLEVBQUU7SUFDdkUsSUFDQ0YsY0FBYyxDQUFDNVAsS0FBSyx3REFBNkMsSUFDakUsMEJBQUE0UCxjQUFjLENBQUNmLE1BQU0sb0ZBQXJCLHNCQUF1QkMsT0FBTywyREFBOUIsdUJBQWdDOU8sS0FBSyxpREFBcUMsRUFDekU7TUFBQTtNQUNELElBQUk0UCxjQUFjLGFBQWRBLGNBQWMsd0NBQWRBLGNBQWMsQ0FBRWhaLFdBQVcsNEVBQTNCLHNCQUE2Qm1GLEVBQUUsbURBQS9CLHVCQUFpQ3dFLE1BQU0sRUFBRTtRQUM1QyxPQUFPa0QsaUJBQWlCLENBQUN3QixHQUFHLENBQUN6RSxLQUFLLENBQUMwRSwyQkFBMkIsQ0FBQzBLLGNBQWMsQ0FBQ2haLFdBQVcsQ0FBQ21GLEVBQUUsQ0FBQ3dFLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7TUFDOUcsQ0FBQyxNQUFNO1FBQUE7UUFDTiwwQkFBQXFQLGNBQWMsQ0FBQ2YsTUFBTSxDQUFDQyxPQUFPLENBQUNpQixJQUFJLDJEQUFsQyx1QkFBb0NsYSxPQUFPLENBQUVtYSxjQUEyRCxJQUFLO1VBQzVHRiwyQkFBMkIsQ0FBQ3RZLElBQUksQ0FDL0IyWCxxQkFBcUIsQ0FBQztZQUFFbE8sWUFBWSxFQUFFK087VUFBZSxDQUFDLEVBQXlCSCxrQkFBa0IsQ0FBQyxDQUNsRztRQUNGLENBQUMsQ0FBQztRQUNGLE9BQU9wTSxpQkFBaUIsQ0FBQ0UsTUFBTSxDQUFDTyxFQUFFLENBQUMsR0FBRzRMLDJCQUEyQixDQUFDLEVBQUV6TyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUVBLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO01BQ3RHO0lBQ0QsQ0FBQyxNQUFNO01BQ04sT0FBTzdMLFNBQVM7SUFDakI7RUFDRCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNNlgsUUFBUSxHQUFHLFVBQVU3VyxRQUFnRSxFQUF1QztJQUFBLElBQXJDeVYsT0FBTyx1RUFBRyxLQUFLO0lBQzNHLElBQUksQ0FBQ3pWLFFBQVEsRUFBRTtNQUNkLE9BQU9oQixTQUFTO0lBQ2pCO0lBQ0EsSUFBSW1aLFVBQVUsQ0FBQ25ZLFFBQVEsQ0FBQyxJQUFJeVosb0JBQW9CLENBQUN6WixRQUFRLENBQUMsRUFBRTtNQUFBO01BQzNELE1BQU0wWixnQkFBZ0Isb0JBQUkxWixRQUFRLENBQWNJLFdBQVcsc0VBQWxDLGNBQW9DbUYsRUFBRSxxREFBdEMsaUJBQXdDa1MsZ0JBQWdCO01BQ2pGLElBQUlpQyxnQkFBZ0IsSUFBSSxDQUFDQSxnQkFBZ0IsQ0FBQ3haLFNBQVMsNkJBQUl3WixnQkFBZ0IsQ0FBQzdLLEtBQUssa0RBQXRCLHNCQUF3Qi9FLE9BQU8sRUFBRSxFQUFFO1FBQUE7UUFDekYsT0FBT21ELGlCQUFpQixDQUFDeUIsMkJBQTJCLDJCQUFDZ0wsZ0JBQWdCLENBQUM3SyxLQUFLLDJEQUF0Qix1QkFBd0IvRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO01BQ3pGO01BQ0EsT0FBT21ELGlCQUFpQixDQUFDeUIsMkJBQTJCLENBQUMsNEJBQUExTyxRQUFRLENBQUNJLFdBQVcsQ0FBQzRELE1BQU0sdUZBQTNCLHdCQUE2QjZLLEtBQUssNERBQWxDLHdCQUFvQy9FLE9BQU8sRUFBRSxLQUFJOUosUUFBUSxDQUFDQyxJQUFJLENBQUMsQ0FBQztJQUN0SCxDQUFDLE1BQU0sSUFBSTBaLGdCQUFnQixDQUFDM1osUUFBUSxDQUFDLEVBQUU7TUFBQTtNQUN0QyxJQUFJLENBQUMsQ0FBQ3lWLE9BQU8sSUFBSXpWLFFBQVEsQ0FBQ3dKLEtBQUssb0VBQXlELEVBQUU7UUFBQTtRQUN6RixPQUFPeUQsaUJBQWlCLENBQUN5QiwyQkFBMkIsb0JBQUMxTyxRQUFRLENBQUM2TyxLQUFLLG9EQUFkLGdCQUFnQi9FLE9BQU8sRUFBRSxDQUFDLENBQUM7TUFDakY7TUFDQSxPQUFPbUQsaUJBQWlCLENBQ3ZCeUIsMkJBQTJCLENBQzFCLHFCQUFBMU8sUUFBUSxDQUFDNk8sS0FBSyxxREFBZCxpQkFBZ0IvRSxPQUFPLEVBQUUseUJBQUk5SixRQUFRLENBQUMwRixLQUFLLDZFQUFkLGdCQUFnQjRTLE9BQU8sb0ZBQXZCLHNCQUF5QmxZLFdBQVcscUZBQXBDLHVCQUFzQzRELE1BQU0scUZBQTVDLHVCQUE4QzZLLEtBQUssMkRBQW5ELHVCQUFxRC9FLE9BQU8sRUFBRSwwQkFBSTlKLFFBQVEsQ0FBQzBGLEtBQUssOEVBQWQsaUJBQWdCNFMsT0FBTywwREFBdkIsc0JBQXlCclksSUFBSSxFQUM1SCxDQUNEO0lBQ0YsQ0FBQyxNQUFNLElBQUlELFFBQVEsQ0FBQ3dKLEtBQUssd0RBQTZDLEVBQUU7TUFBQTtNQUN2RSxPQUFPeUQsaUJBQWlCLENBQ3ZCeUIsMkJBQTJCLENBQzFCLHFCQUFBMU8sUUFBUSxDQUFDNk8sS0FBSyxxREFBZCxpQkFBZ0IvRSxPQUFPLEVBQUUsMEJBQUs5SixRQUFRLENBQUNxWSxNQUFNLDhFQUFmLGlCQUFpQkMsT0FBTyxvRkFBekIsc0JBQXlDNVMsS0FBSyxxRkFBOUMsdUJBQWdENFMsT0FBTyxxRkFBdkQsdUJBQXlEbFksV0FBVyxxRkFBcEUsdUJBQXNFNEQsTUFBTSxxRkFBNUUsdUJBQThFNkssS0FBSywyREFBbkYsdUJBQXFGL0UsT0FBTyxFQUFFLEVBQzNILENBQ0Q7SUFDRixDQUFDLE1BQU07TUFBQTtNQUNOLE9BQU9tRCxpQkFBaUIsQ0FBQ3lCLDJCQUEyQixxQkFBQzFPLFFBQVEsQ0FBQzZPLEtBQUsscURBQWQsaUJBQWdCL0UsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNqRjtFQUNELENBQUM7RUFFRCxNQUFNOE4sV0FBVyxHQUFHLFVBQVUxTixNQUF5QyxFQUFzQjtJQUFBO0lBQzVGLElBQUksQ0FBQ0EsTUFBTSxFQUFFO01BQ1osT0FBT2xMLFNBQVM7SUFDakI7SUFFQSxJQUFJbVosVUFBVSxDQUFDak8sTUFBTSxDQUFDLDJCQUFJQSxNQUFNLENBQUM5SixXQUFXLHlFQUFsQixvQkFBb0I0RCxNQUFNLGtEQUExQixzQkFBNEI0VixTQUFTLEVBQUU7TUFBQTtNQUNoRSxPQUFPLHdCQUFBMVAsTUFBTSxDQUFDOUosV0FBVywwRUFBbEIscUJBQW9CNEQsTUFBTSxrREFBMUIsc0JBQTRCNFYsU0FBUyxHQUN6QzNNLGlCQUFpQixDQUFDeUIsMkJBQTJCLENBQUN4RSxNQUFNLENBQUM5SixXQUFXLENBQUM0RCxNQUFNLENBQUM0VixTQUFTLENBQUM5UCxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQzdGOUssU0FBUztJQUNiLENBQUMsTUFBTSxJQUFJMmEsZ0JBQWdCLENBQUN6UCxNQUFNLENBQUMsRUFBRTtNQUFBO01BQ3BDLE9BQU8saUJBQUFBLE1BQU0sQ0FBQ3hFLEtBQUssbUVBQVosY0FBYzRTLE9BQU8sNEVBQXJCLHNCQUF1QmxZLFdBQVcsNkVBQWxDLHVCQUFvQzRELE1BQU0sbURBQTFDLHVCQUE0QzRWLFNBQVMsR0FDekQzTSxpQkFBaUIsQ0FBQ3lCLDJCQUEyQixDQUFDeEUsTUFBTSxDQUFDeEUsS0FBSyxDQUFDNFMsT0FBTyxDQUFDbFksV0FBVyxDQUFDNEQsTUFBTSxDQUFDNFYsU0FBUyxDQUFDOVAsT0FBTyxFQUFFLENBQUMsQ0FBQyxHQUMzRzlLLFNBQVM7SUFDYixDQUFDLE1BQU0sSUFBSWtMLE1BQU0sQ0FBQ1YsS0FBSyx3REFBNkMsRUFBRTtNQUFBO01BQ3JFLE1BQU1xUSxlQUFlLHFCQUFHM1AsTUFBTSxDQUFDbU8sTUFBTSxtREFBYixlQUFlQyxPQUFvQjtNQUMzRCxPQUFPdUIsZUFBZSxhQUFmQSxlQUFlLHdDQUFmQSxlQUFlLENBQUVuVSxLQUFLLDRFQUF0QixzQkFBd0I0UyxPQUFPLDZFQUEvQix1QkFBaUNsWSxXQUFXLDZFQUE1Qyx1QkFBOEM0RCxNQUFNLG1EQUFwRCx1QkFBc0Q0VixTQUFTLEdBQ25FM00saUJBQWlCLENBQUN5QiwyQkFBMkIsQ0FBQ21MLGVBQWUsQ0FBQ25VLEtBQUssQ0FBQzRTLE9BQU8sQ0FBQ2xZLFdBQVcsQ0FBQzRELE1BQU0sQ0FBQzRWLFNBQVMsQ0FBQzlQLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FDcEg5SyxTQUFTO0lBQ2IsQ0FBQyxNQUFNO01BQ04sT0FBT0EsU0FBUztJQUNqQjtFQUNELENBQUM7RUFFTSxTQUFTOGEsc0JBQXNCLENBQUNDLE9BQWUsRUFBRUMseUJBQW1DLEVBQXFDO0lBQy9ILE9BQU9sSyxZQUFZLENBQ2xCLENBQ0NuRixXQUFXLENBQUUsOEJBQTZCLEVBQUUsVUFBVSxDQUFDLEVBQ3ZEQSxXQUFXLENBQUUsa0JBQWlCLEVBQUUsVUFBVSxDQUFDLEVBQzNDb1AsT0FBTyxFQUNQQyx5QkFBeUIsQ0FDekIsRUFDRDlKLGVBQWUsQ0FBQytKLHFDQUFxQyxDQUNyRDtFQUNGOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFWQTtFQVdBLE1BQU1sRixxQkFBcUIsR0FBRyxVQUM3QmhDLGtCQUE0QyxFQUM1Q21ILGVBQXdDLEVBQ3hDbEgsa0JBQTRCLEVBQzVCaFgsZ0JBQWtDLEVBQ2xDc0MsVUFBc0IsRUFDdEIyVSxpQ0FBMkMsRUFDakI7SUFDMUIsTUFBTTZCLGNBQXVDLEdBQUcsRUFBRTtJQUNsRCxNQUFNcUYsc0JBQThDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pELE1BQU0zYixpQkFBaUIsR0FBRyxJQUFJQyxpQkFBaUIsQ0FBQ0gsVUFBVSxFQUFFdEMsZ0JBQWdCLENBQUM7SUFFN0UyRyxNQUFNLENBQUNDLElBQUksQ0FBQ21RLGtCQUFrQixDQUFDLENBQUMxVCxPQUFPLENBQUVZLElBQUksSUFBSztNQUNqRCxNQUFNRCxRQUFRLEdBQUcrUyxrQkFBa0IsQ0FBQzlTLElBQUksQ0FBQztRQUN4Q2tPLGNBQWMsR0FBR25TLGdCQUFnQixDQUFDb2UseUJBQXlCLENBQUNuYSxJQUFJLENBQUM7UUFDakU7UUFDQW9hLGFBQWEsR0FBR0gsZUFBZSxDQUFDdGIsSUFBSSxDQUFFQyxNQUFNLElBQUtBLE1BQU0sQ0FBQ29CLElBQUksS0FBS0EsSUFBSSxDQUFDO01BQ3ZFLElBQUlvYSxhQUFhLEtBQUtyYixTQUFTLEVBQUU7UUFDaEM7UUFDQTtRQUNBOFYsY0FBYyxDQUFDOVQsSUFBSSxDQUNsQjJTLCtCQUErQixDQUM5QjNULFFBQVEsRUFDUm1PLGNBQWMsRUFDZGxPLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMK1Msa0JBQWtCLEVBQ2xCeFUsaUJBQWlCLEVBQ2pCeEMsZ0JBQWdCLEVBQ2hCaVgsaUNBQWlDLENBQ2pDLENBQ0Q7TUFDRixDQUFDLE1BQU0sSUFBSW9ILGFBQWEsQ0FBQ2xNLGNBQWMsS0FBS0EsY0FBYyxJQUFJa00sYUFBYSxDQUFDdGIsYUFBYSxFQUFFO1FBQzFGO1FBQ0E7O1FBRUEsTUFBTXViLE9BQU8sR0FBSSxhQUFZcmEsSUFBSyxFQUFDOztRQUVuQztRQUNBLElBQUksQ0FBQ2lhLGVBQWUsQ0FBQ2xQLElBQUksQ0FBRW5NLE1BQU0sSUFBS0EsTUFBTSxDQUFDb0IsSUFBSSxLQUFLcWEsT0FBTyxDQUFDLEVBQUU7VUFDL0Q7VUFDQTtVQUNBLE1BQU16YixNQUFNLEdBQUc4VSwrQkFBK0IsQ0FDN0MzVCxRQUFRLEVBQ1JtTyxjQUFjLEVBQ2RsTyxJQUFJLEVBQ0osS0FBSyxFQUNMLEtBQUssRUFDTCtTLGtCQUFrQixFQUNsQnhVLGlCQUFpQixFQUNqQnhDLGdCQUFnQixFQUNoQmlYLGlDQUFpQyxDQUNqQztVQUNEcFUsTUFBTSxDQUFDMGIsZ0JBQWdCLEdBQUdGLGFBQWEsQ0FBQ0UsZ0JBQWdCO1VBQ3hEekYsY0FBYyxDQUFDOVQsSUFBSSxDQUFDbkMsTUFBTSxDQUFDO1VBQzNCc2Isc0JBQXNCLENBQUNsYSxJQUFJLENBQUMsR0FBR3FhLE9BQU87UUFDdkMsQ0FBQyxNQUFNLElBQ05KLGVBQWUsQ0FBQ2xQLElBQUksQ0FBRW5NLE1BQU0sSUFBS0EsTUFBTSxDQUFDb0IsSUFBSSxLQUFLcWEsT0FBTyxDQUFDLElBQ3pESixlQUFlLENBQUNsUCxJQUFJLENBQUVuTSxNQUFNO1VBQUE7VUFBQSxnQ0FBS0EsTUFBTSxDQUFDRSxhQUFhLDBEQUFwQixzQkFBc0J5YixRQUFRLENBQUN2YSxJQUFJLENBQUM7UUFBQSxFQUFDLEVBQ3JFO1VBQ0RrYSxzQkFBc0IsQ0FBQ2xhLElBQUksQ0FBQyxHQUFHcWEsT0FBTztRQUN2QztNQUNEO0lBQ0QsQ0FBQyxDQUFDOztJQUVGO0lBQ0E7SUFDQUosZUFBZSxDQUFDN2EsT0FBTyxDQUFFUixNQUFNLElBQUs7TUFBQTtNQUNuQ0EsTUFBTSxDQUFDRSxhQUFhLDZCQUFHRixNQUFNLENBQUNFLGFBQWEsMkRBQXBCLHVCQUFzQndCLEdBQUcsQ0FBRWthLFlBQVksSUFBS04sc0JBQXNCLENBQUNNLFlBQVksQ0FBQyxJQUFJQSxZQUFZLENBQUM7TUFDeEg1YixNQUFNLENBQUNnVyx1QkFBdUIsNEJBQUdoVyxNQUFNLENBQUNnVyx1QkFBdUIsMERBQTlCLHNCQUFnQ3RVLEdBQUcsQ0FDbEVrYSxZQUFZLElBQUtOLHNCQUFzQixDQUFDTSxZQUFZLENBQUMsSUFBSUEsWUFBWSxDQUN0RTtJQUNGLENBQUMsQ0FBQztJQUVGLE9BQU8zRixjQUFjO0VBQ3RCLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTTRGLHdCQUF3QixHQUFHLFVBQVVuUixTQUFpQyxFQUFFO0lBQUE7SUFDN0U7SUFDQSxJQUFJb1EsZ0JBQWdCLENBQUNwUSxTQUFTLENBQUMsRUFBRTtNQUFBO01BQ2hDLDJCQUFPQSxTQUFTLENBQUM3RCxLQUFLLHFEQUFmLGlCQUFpQi9HLElBQUk7SUFDN0IsQ0FBQyxNQUFNLElBQUk0SyxTQUFTLENBQUNDLEtBQUssd0RBQTZDLHlCQUFLRCxTQUFTLENBQUM4TyxNQUFNLHVFQUFoQixrQkFBa0JDLE9BQU8sNEVBQTFCLHNCQUEwQzVTLEtBQUssbURBQS9DLHVCQUFpRC9HLElBQUksRUFBRTtNQUFBO01BQ2pJO01BQ0EsNkJBQVE0SyxTQUFTLENBQUM4TyxNQUFNLGdGQUFoQixtQkFBa0JDLE9BQU8sMERBQTFCLHNCQUEwQzVTLEtBQUssQ0FBQy9HLElBQUk7SUFDNUQsQ0FBQyxNQUFNO01BQ04sT0FBTzRQLFNBQVMsQ0FBQ0Msd0JBQXdCLENBQUNqRixTQUFTLENBQUM7SUFDckQ7RUFDRCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztFQUVBLE1BQU1vUix1QkFBdUIsR0FBRyxVQUFVMWEsSUFBWSxFQUFFcEMsT0FBc0IsRUFBRStjLGdDQUF3RCxFQUFFO0lBQ3pJLE1BQU10TSxHQUFHLEdBQUksdUJBQXNCck8sSUFBSyxFQUFDO0lBQ3pDO0lBQ0EsTUFBTTRhLFlBQVksR0FBR2hkLE9BQU8sQ0FBQ2UsSUFBSSxDQUFFQyxNQUFNLElBQUtBLE1BQU0sQ0FBQ3lQLEdBQUcsS0FBS0EsR0FBRyxDQUFDO0lBQ2pFO0lBQ0EsTUFBTXdNLGtCQUFrQixHQUN2QixDQUFDRCxZQUFZLElBQUtoZCxPQUFPLENBQUNlLElBQUksQ0FBRUMsTUFBTSxJQUFLQSxNQUFNLENBQUNvQixJQUFJLEtBQUtBLElBQUksSUFBSSxDQUFDcEIsTUFBTSxDQUFDRSxhQUFhLENBQTRCO0lBQ3JILElBQUkrYixrQkFBa0IsRUFBRTtNQUN2QixNQUFNQyxlQUFnQyxHQUFHO1FBQ3hDek0sR0FBRyxFQUFFQSxHQUFHO1FBQ1JoTixJQUFJLEVBQUUxRixVQUFVLENBQUMrYSxVQUFVO1FBQzNCQyxLQUFLLEVBQUVrRSxrQkFBa0IsQ0FBQ2xFLEtBQUs7UUFDL0J6SSxjQUFjLEVBQUUyTSxrQkFBa0IsQ0FBQzNNLGNBQWM7UUFDakRqUSxZQUFZLEVBQUUrWSxnQkFBZ0IsQ0FBQ2xOLE1BQU07UUFDckM5SixJQUFJLEVBQUVxTyxHQUFHO1FBQ1RyUCxZQUFZLEVBQUU2YixrQkFBa0IsQ0FBQzdiLFlBQVk7UUFDN0NnWCxRQUFRLEVBQUUsS0FBSztRQUNma0IsV0FBVyxFQUFFLEtBQUs7UUFDbEJFLEtBQUssRUFBRSxLQUFLO1FBQ1p0RCxjQUFjLEVBQUUsSUFBSTtRQUNwQnVELGFBQWEsRUFBRSxLQUFLO1FBQ3BCMEQsWUFBWSxFQUFFLEtBQUs7UUFDbkJDLFNBQVMsRUFBRTtVQUNWQyxvQkFBb0IsRUFBRSxJQUFJO1VBQzFCQyx1QkFBdUIsRUFBRTtRQUMxQjtNQUNELENBQUM7TUFDRHRkLE9BQU8sQ0FBQ21ELElBQUksQ0FBQytaLGVBQWUsQ0FBQztNQUM3QkgsZ0NBQWdDLENBQUMzYSxJQUFJLENBQUMsR0FBRzhhLGVBQWUsQ0FBQzlhLElBQUk7SUFDOUQ7RUFDRCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1tYix1QkFBdUIsR0FBRyxVQUFVQyxjQUFzQixFQUFFdGYsaUJBQXlCLEVBQUVDLGdCQUFrQyxFQUFXO0lBQUE7SUFDekksTUFBTXNmLFFBQVEsOEJBQUd0ZixnQkFBZ0IsQ0FBQ1UsK0JBQStCLENBQUNYLGlCQUFpQixDQUFDLDREQUFuRSx3QkFBcUU4QixPQUFPO0lBQzdGLE1BQU0wZCxXQUFXLEdBQUdELFFBQVEsSUFBSTNZLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDMFksUUFBUSxDQUFDO0lBQ3JELE9BQ0NDLFdBQVcsSUFDWCxDQUFDLENBQUNBLFdBQVcsQ0FBQzNjLElBQUksQ0FBQyxVQUFVMFAsR0FBVyxFQUFFO01BQ3pDLE9BQU9BLEdBQUcsS0FBSytNLGNBQWMsSUFBSUMsUUFBUSxDQUFDaE4sR0FBRyxDQUFDLENBQUNrTixtQkFBbUI7SUFDbkUsQ0FBQyxDQUFDO0VBRUosQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxVQUFVbFMsU0FBaUMsRUFBVTtJQUFBO0lBQzdFLElBQUl0SyxZQUFvQixHQUFHLEVBQUU7SUFFN0IsUUFBUXNLLFNBQVMsQ0FBQ0MsS0FBSztNQUN0QjtNQUNBO01BQ0E7TUFDQTtNQUNBO1FBQ0N2SyxZQUFZLEdBQUlzSyxTQUFTLGFBQVRBLFNBQVMsa0NBQVRBLFNBQVMsQ0FBZ0I3RCxLQUFLLDRDQUEvQixRQUFpQy9HLElBQUk7UUFDcEQ7TUFFRDtRQUNDTSxZQUFZLEdBQUdzSyxTQUFTLGFBQVRBLFNBQVMsNkNBQVRBLFNBQVMsQ0FBRThPLE1BQU0sdURBQWpCLG1CQUFtQjVYLEtBQUs7UUFDdkM7TUFFRDtNQUNBO01BQ0E7TUFDQTtRQUNDeEIsWUFBWSxHQUFHc1AsU0FBUyxDQUFDQyx3QkFBd0IsQ0FBQ2pGLFNBQVMsQ0FBQztRQUM1RDtJQUFNO0lBR1IsT0FBT3RLLFlBQVk7RUFDcEIsQ0FBQztFQUVELE1BQU11VyxhQUFhLEdBQUcsVUFBVTdXLElBQVksRUFBRStjLFdBQW9CLEVBQUVDLFVBQW1CLEVBQUU7SUFDeEYsTUFBTUMsV0FBVyxHQUFHRixXQUFXLEdBQUcvYyxJQUFJLENBQUNrZCxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUdsZCxJQUFJLENBQUNxRCxPQUFPLENBQUMsR0FBRyxDQUFDO0lBRTNFLElBQUk0WixXQUFXLEtBQUssQ0FBQyxDQUFDLEVBQUU7TUFDdkIsT0FBT2pkLElBQUk7SUFDWjtJQUNBLE9BQU9nZCxVQUFVLEdBQUdoZCxJQUFJLENBQUMwTCxTQUFTLENBQUN1UixXQUFXLEdBQUcsQ0FBQyxFQUFFamQsSUFBSSxDQUFDc0MsTUFBTSxDQUFDLEdBQUd0QyxJQUFJLENBQUMwTCxTQUFTLENBQUMsQ0FBQyxFQUFFdVIsV0FBVyxDQUFDO0VBQ2xHLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNRSxvQkFBb0IsR0FBRyxVQUFVdlMsU0FBaUMsRUFBRXZOLGdCQUFrQyxFQUFXO0lBQ3RILElBQUkyZCxnQkFBZ0IsQ0FBQ3BRLFNBQVMsQ0FBQyxJQUFJdkUsZ0JBQWdCLENBQUN1RSxTQUFTLENBQUM3RCxLQUFLLENBQUMsRUFBRTtNQUNyRSxNQUFNcVcsa0JBQWtCLEdBQUdDLG9CQUFvQixDQUFDaGdCLGdCQUFnQixDQUFDOEcsc0JBQXNCLEVBQUUsRUFBRXlHLFNBQVMsQ0FBQzdELEtBQUssQ0FBQy9HLElBQUksQ0FBQztNQUNoSCxPQUFPc2QsaUJBQWlCLENBQUNGLGtCQUFrQixDQUFDO0lBQzdDLENBQUMsTUFBTTtNQUNOLE9BQU8sS0FBSztJQUNiO0VBQ0QsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUcsaUJBQWlCLEdBQUcsVUFBVTNTLFNBQWlDLEVBQUU0UyxZQUFvQixFQUFFbkosa0JBQTRCLEVBQVc7SUFDbkksT0FDQ0Esa0JBQWtCLENBQUNoUixPQUFPLENBQUNtYSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFBSTtJQUNsRDVTLFNBQVMsQ0FBQ0MsS0FBSywyQ0FBZ0MsSUFDL0NELFNBQVMsQ0FBQ0MsS0FBSyxrREFBdUMsSUFDdERELFNBQVMsQ0FBQ0MsS0FBSyxvRUFBeUQsSUFDeEVELFNBQVMsQ0FBQ0MsS0FBSyxxREFBMEMsQ0FBQztFQUU3RCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU0rTix3QkFBd0IsR0FBRyxVQUFVdmIsZ0JBQWtDLEVBQVc7SUFDOUYsTUFBTW9nQixlQUE0QyxHQUFHQyxtQkFBbUIsQ0FBQ3JnQixnQkFBZ0IsQ0FBQztJQUMxRixPQUFPK00sS0FBSyxDQUFDdVQsT0FBTyxDQUFDRixlQUFlLENBQUMsR0FBSUEsZUFBZSxDQUFjcGEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUk7RUFDdkcsQ0FBQztFQUFDO0VBRUYsU0FBU3FhLG1CQUFtQixDQUFDRSxnQkFBa0MsRUFBK0I7SUFBQTtJQUM3RixJQUFJbEssV0FBVyxDQUFDQyxXQUFXLENBQUNpSyxnQkFBZ0IsQ0FBQ3pVLFlBQVksRUFBRSxDQUFDLEVBQUU7TUFDN0QsT0FBTzlJLFNBQVM7SUFDakI7SUFDQSxNQUFNd2QsWUFBWSw0QkFBR0QsZ0JBQWdCLENBQUN6VSxZQUFZLEVBQUUsb0ZBQS9CLHNCQUFpQzFILFdBQVcsMkRBQTVDLHVCQUE4Q21JLFlBQWlEO0lBQ3BILE9BQU8sQ0FBQWlVLFlBQVksYUFBWkEsWUFBWSx1QkFBWkEsWUFBWSxDQUFFQyxlQUFlLGdDQUFJRixnQkFBZ0IsQ0FBQ0csa0JBQWtCLEVBQUUscUZBQXJDLHVCQUF1Q3RjLFdBQVcscUZBQWxELHVCQUFvRG1JLFlBQVksMkRBQWhFLHVCQUFrRWtVLGVBQWU7RUFDMUg7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0UsZ0NBQWdDLENBQUN2ZSxhQUE0QyxFQUFpQztJQUN0SCxPQUFPQSxhQUFhLEtBQUtZLFNBQVMsR0FDL0JBLFNBQVMsR0FDVDtNQUNBNGQsYUFBYSxFQUFFLENBQUM7TUFDaEIsR0FBR3hlO0lBQ0gsQ0FBQztFQUNMO0VBRUEsU0FBU3llLHNCQUFzQixDQUFDelYsWUFBbUIsRUFBRW5ILElBQVksRUFBTztJQUN2RSxNQUFNNmMsa0JBQTRCLEdBQUcsRUFBRTtJQUN2QyxJQUFJQyxpQkFBaUIsR0FBRyxLQUFLO0lBQzdCLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHNVYsWUFBWSxDQUFDbkcsTUFBTSxFQUFFK2IsQ0FBQyxFQUFFLEVBQUU7TUFDN0NGLGtCQUFrQixDQUFDOWIsSUFBSSxDQUFDb0csWUFBWSxDQUFDNFYsQ0FBQyxDQUFDLENBQUN2YyxLQUFLLENBQUM7TUFDOUMsSUFBSTJHLFlBQVksQ0FBQzRWLENBQUMsQ0FBQyxDQUFDdmMsS0FBSyxLQUFLUixJQUFJLEVBQUU7UUFDbkM4YyxpQkFBaUIsR0FBRyxJQUFJO01BQ3pCO0lBQ0Q7SUFDQSxPQUFPO01BQ05FLE1BQU0sRUFBRUgsa0JBQWtCO01BQzFCSSxnQkFBZ0IsRUFBRUg7SUFDbkIsQ0FBQztFQUNGO0VBRUEsU0FBU0ksZUFBZSxDQUFDQyxpQkFBd0IsRUFBRUMsb0JBQTJCLEVBQUU7SUFDL0UsSUFBSUMsa0NBQWtDLEdBQUcsS0FBSztJQUM5QyxJQUFJQyxhQUFhO0lBQ2pCLElBQUlILGlCQUFpQixJQUFJQSxpQkFBaUIsQ0FBQ25jLE1BQU0sSUFBSSxDQUFDLElBQUlvYyxvQkFBb0IsSUFBSUEsb0JBQW9CLENBQUNwYyxNQUFNLElBQUksQ0FBQyxFQUFFO01BQ25ILEtBQUssSUFBSStiLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0ksaUJBQWlCLENBQUNuYyxNQUFNLEVBQUUrYixDQUFDLEVBQUUsRUFBRTtRQUNsRCxJQUFJLENBQUNJLGlCQUFpQixDQUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDaFMsSUFBSSxDQUFFd1MsR0FBRyxJQUFLSCxvQkFBb0IsQ0FBQ3JiLE9BQU8sQ0FBQ3diLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1VBQ2pGRixrQ0FBa0MsR0FBRyxJQUFJO1VBQ3pDQyxhQUFhLEdBQUdILGlCQUFpQixDQUFDSixDQUFDLENBQUM7VUFDcEM7UUFDRDtNQUNEO0lBQ0Q7SUFDQSxPQUFPO01BQ05NLGtDQUFrQyxFQUFFQSxrQ0FBa0M7TUFDdEVHLHNCQUFzQixFQUFFRjtJQUN6QixDQUFDO0VBQ0Y7RUFFQSxTQUFTRyxrQ0FBa0MsQ0FBQ3RFLGNBQTZDLEVBQUVnRSxpQkFBcUIsRUFBTztJQUFBO0lBQ3RILE1BQU1PLFdBQWtCLEdBQUcsRUFBRTtJQUM3QixJQUFJQyxnQkFBOEYsR0FBRztNQUNwR04sa0NBQWtDLEVBQUUsS0FBSztNQUN6Q0csc0JBQXNCLEVBQUV6ZTtJQUN6QixDQUFDO0lBQ0QsSUFDQ29hLGNBQWMsSUFDZEEsY0FBYyxDQUFDNVAsS0FBSyx3REFBNkMsSUFDakUsMkJBQUE0UCxjQUFjLENBQUNmLE1BQU0scUZBQXJCLHVCQUF1QkMsT0FBTywyREFBOUIsdUJBQWdDOU8sS0FBSyxpREFBcUMsRUFDekU7TUFBQTtNQUNELDBCQUFBNFAsY0FBYyxDQUFDZixNQUFNLENBQUNDLE9BQU8sQ0FBQ2lCLElBQUksMkRBQWxDLHVCQUFvQ2xhLE9BQU8sQ0FBRW1hLGNBQXNDLElBQUs7UUFDdkYsSUFDQyxDQUFDQSxjQUFjLENBQUNoUSxLQUFLLDJDQUFnQyxJQUFJZ1EsY0FBYyxDQUFDaFEsS0FBSyxrREFBdUMsS0FDcEhnUSxjQUFjLENBQUM5VCxLQUFLLEVBQ25CO1VBQ0RpWSxXQUFXLENBQUMzYyxJQUFJLENBQUN3WSxjQUFjLENBQUM5VCxLQUFLLENBQUMvRyxJQUFJLENBQUM7UUFDNUM7UUFDQWlmLGdCQUFnQixHQUFHVCxlQUFlLENBQUNDLGlCQUFpQixFQUFFTyxXQUFXLENBQUM7TUFDbkUsQ0FBQyxDQUFDO0lBQ0g7SUFDQSxPQUFPO01BQ05MLGtDQUFrQyxFQUFFTSxnQkFBZ0IsQ0FBQ04sa0NBQWtDO01BQ3ZGbkIsWUFBWSxFQUFFeUIsZ0JBQWdCLENBQUNIO0lBQ2hDLENBQUM7RUFDRjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTM0osaUNBQWlDLENBQ3pDN1QsSUFBWSxFQUNabUgsWUFBbUIsRUFDbkJ5VyxrQkFBMkIsRUFDM0J6RSxjQUE2QyxFQUM1QztJQUNELElBQUksQ0FBQ2hTLFlBQVksRUFBRTtNQUNsQixPQUFPLENBQUMsQ0FBQztJQUNWO0lBQ0EsTUFBTTBXLFdBQVcsR0FBR2pCLHNCQUFzQixDQUFDelYsWUFBWSxFQUFFbkgsSUFBSSxDQUFDO0lBQzlELE1BQU04ZCx1QkFBdUIsR0FBR0wsa0NBQWtDLENBQUN0RSxjQUFjLEVBQUUwRSxXQUFXLENBQUNiLE1BQU0sQ0FBQztJQUN0RyxJQUFJYSxXQUFXLENBQUNaLGdCQUFnQixFQUFFO01BQ2pDLE1BQU1jLGdCQUFxQixHQUFHO1FBQzdCQyxpQkFBaUIsRUFBRSxJQUFJO1FBQ3ZCQyxZQUFZLEVBQUVKLFdBQVcsQ0FBQ2IsTUFBTTtRQUNoQ2tCLDBCQUEwQixFQUFFbFIsaUJBQWlCLENBQUM2TSxzQkFBc0IsQ0FBQzdaLElBQUksRUFBRSxLQUFLLENBQUM7TUFDbEYsQ0FBQztNQUNELElBQUk0ZCxrQkFBa0IsSUFBSUUsdUJBQXVCLENBQUNULGtDQUFrQyxFQUFFO1FBQ3JGVSxnQkFBZ0IsQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHL1EsaUJBQWlCLENBQUM2TSxzQkFBc0IsQ0FBQzdaLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RytkLGdCQUFnQixDQUFDLHNDQUFzQyxDQUFDLEdBQUdELHVCQUF1QixDQUFDNUIsWUFBWTtNQUNoRztNQUNBLE9BQU82QixnQkFBZ0I7SUFDeEIsQ0FBQyxNQUFNLElBQUksQ0FBQ0QsdUJBQXVCLENBQUNULGtDQUFrQyxFQUFFO01BQ3ZFLE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQyxNQUFNO01BQ047TUFDQSxPQUFPO1FBQ05jLG9DQUFvQyxFQUFFTCx1QkFBdUIsQ0FBQzVCLFlBQVk7UUFDMUVkLGNBQWMsRUFBRXBiLElBQUk7UUFDcEJrZSwwQkFBMEIsRUFBRWxSLGlCQUFpQixDQUFDNk0sc0JBQXNCLENBQUM3WixJQUFJLEVBQUUsSUFBSSxDQUFDO01BQ2pGLENBQUM7SUFDRjtFQUNEO0VBRUEsU0FBU29lLGFBQWEsQ0FBQzlVLFNBQXlCLEVBQVU7SUFBQTtJQUN6RCxNQUFNdkwsVUFBVSxHQUFHdUwsU0FBUyxhQUFUQSxTQUFTLGtEQUFUQSxTQUFTLENBQUVuSixXQUFXLHVGQUF0Qix3QkFBd0JtRixFQUFFLDREQUExQix3QkFBNEIrWSxVQUFvQjtJQUVuRSxJQUFJdGdCLFVBQVUsSUFBSUEsVUFBVSxDQUFDd2MsUUFBUSxDQUFDLHdCQUF3QixDQUFDLEVBQUU7TUFDaEUsT0FBTyxDQUFDO0lBQ1Q7SUFDQSxJQUFJeGMsVUFBVSxJQUFJQSxVQUFVLENBQUN3YyxRQUFRLENBQUMsMEJBQTBCLENBQUMsRUFBRTtNQUNsRSxPQUFPLENBQUM7SUFDVDtJQUNBLElBQUl4YyxVQUFVLElBQUlBLFVBQVUsQ0FBQ3djLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFO01BQy9ELE9BQU8sQ0FBQztJQUNUO0lBQ0EsT0FBTyxDQUFDO0VBQ1Q7RUFFQSxTQUFTK0QsdUJBQXVCLENBQUNoVixTQUF5QixFQUFjO0lBQUE7SUFDdkUsTUFBTXZMLFVBQVUsR0FBR3VMLFNBQVMsYUFBVEEsU0FBUyxrREFBVEEsU0FBUyxDQUFFbkosV0FBVyx1RkFBdEIsd0JBQXdCbUYsRUFBRSw0REFBMUIsd0JBQTRCK1ksVUFBb0I7SUFDbkUsT0FBT3RnQixVQUFVLEdBQUlBLFVBQVUsQ0FBQ3VNLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBa0IrVCxVQUFVLENBQUNoUyxJQUFJO0VBQy9FO0VBRUEsU0FBU2tTLGlCQUFpQixDQUFDQyxNQUF3QixFQUFjO0lBQ2hFLElBQUlBLE1BQU0sSUFBSUEsTUFBTSxDQUFDeGQsTUFBTSxHQUFHLENBQUMsRUFBRTtNQUNoQyxJQUFJeWQsWUFBWSxHQUFHLENBQUMsQ0FBQztNQUNyQixJQUFJQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO01BQ2xCLElBQUlDLDBCQUEwQjtNQUM5QixLQUFLLE1BQU1DLEtBQUssSUFBSUosTUFBTSxFQUFFO1FBQzNCRSxTQUFTLEdBQUdOLGFBQWEsQ0FBQ1EsS0FBSyxDQUFDO1FBQ2hDLElBQUlGLFNBQVMsR0FBR0QsWUFBWSxFQUFFO1VBQzdCQSxZQUFZLEdBQUdDLFNBQVM7VUFDeEJDLDBCQUEwQixHQUFHQyxLQUFLO1FBQ25DO01BQ0Q7TUFDQSxPQUFPTix1QkFBdUIsQ0FBQ0ssMEJBQTBCLENBQW1CO0lBQzdFO0lBQ0EsT0FBT04sVUFBVSxDQUFDaFMsSUFBSTtFQUN2Qjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNrTCxhQUFhLENBQUNqTyxTQUFpQyxFQUFFbkMsWUFBeUIsRUFBMEI7SUFBQTtJQUNuSDtJQUNBLElBQUkwWCxvQkFBb0IsRUFBRUMsZUFBb0I7SUFDOUM7SUFDQSxJQUFJM1gsWUFBWSxJQUFJQSxZQUFZLENBQUNuRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQzVDOGQsZUFBZSxHQUFHM1gsWUFBWSxDQUFDN0csR0FBRyxDQUFDLFVBQVUrTixHQUFHLEVBQUU7UUFDakQsT0FBT0EsR0FBRyxDQUFDN04sS0FBSztNQUNqQixDQUFDLENBQUM7SUFDSDtJQUNBLElBQUksQ0FBQzhJLFNBQVMsRUFBRTtNQUNmLE9BQU92SyxTQUFTO0lBQ2pCO0lBQ0EsSUFBSXVLLFNBQVMsQ0FBQ0MsS0FBSyx3REFBNkMsRUFBRTtNQUNqRSxNQUFNd1YsY0FBYyxHQUFJelYsU0FBUyxDQUFTOE8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBbUI7UUFDcEY0Ryx3QkFBd0IsR0FDdkJELGNBQWMsSUFDYkEsY0FBYyxDQUFTaFUsSUFBSSxDQUFDLFVBQVVrVSxtQkFBMkMsRUFBRTtVQUFBO1VBQ25GLE9BQ0MsQ0FBQ0EsbUJBQW1CLGFBQW5CQSxtQkFBbUIsa0NBQW5CQSxtQkFBbUIsQ0FBZ0N4WixLQUFLLDRDQUF6RCxRQUEyRC9HLElBQUksS0FDL0R1Z0IsbUJBQW1CLENBQUMxVixLQUFLLHdEQUE2QyxJQUN0RXVWLGVBQWUsSUFDZkEsZUFBZSxDQUFDdkUsUUFBUSxDQUFFMEUsbUJBQW1CLGFBQW5CQSxtQkFBbUIsa0NBQW5CQSxtQkFBbUIsQ0FBZ0N4WixLQUFLLDRDQUF6RCxRQUEyRC9HLElBQUksQ0FBQztRQUUzRixDQUFDLENBQUM7TUFDSjtNQUNBLElBQUlzZ0Isd0JBQXdCLEVBQUU7UUFDN0IsT0FBT1gsVUFBVSxDQUFDYSxJQUFJO01BQ3ZCLENBQUMsTUFBTTtRQUFBO1FBQ047UUFDQSxJQUFJNVYsU0FBUyxhQUFUQSxTQUFTLDBDQUFUQSxTQUFTLENBQUVuSixXQUFXLCtFQUF0Qix3QkFBd0JtRixFQUFFLG9EQUExQix3QkFBNEIrWSxVQUFVLEVBQUU7VUFDM0MsT0FBT0MsdUJBQXVCLENBQUNoVixTQUFTLENBQThCO1FBQ3ZFO1FBQ0E7UUFDQXVWLG9CQUFvQixHQUNuQkUsY0FBYyxJQUNiQSxjQUFjLENBQVNqUixNQUFNLENBQUMsVUFBVXFSLElBQW9CLEVBQUU7VUFBQTtVQUM5RCxPQUFPQSxJQUFJLGFBQUpBLElBQUksNENBQUpBLElBQUksQ0FBRWhmLFdBQVcsOEVBQWpCLGtCQUFtQm1GLEVBQUUseURBQXJCLHFCQUF1QitZLFVBQVU7UUFDekMsQ0FBQyxDQUFDO1FBQ0gsT0FBT0UsaUJBQWlCLENBQUNNLG9CQUFvQixDQUFxQjtNQUNuRTtNQUNBO0lBQ0Q7O0lBQ0EsT0FBUXZWLFNBQVMsQ0FBb0I3RCxLQUFLLElBQ3hDNkQsU0FBUyxhQUFUQSxTQUFTLDBCQUFUQSxTQUFTLENBQXFCN0QsS0FBSyxvQ0FBcEMsUUFBc0MvRyxJQUFJLElBQzFDb2dCLGVBQWUsSUFDZkEsZUFBZSxDQUFDdkUsUUFBUSxDQUFFalIsU0FBUyxDQUFvQjdELEtBQUssQ0FBQy9HLElBQUksQ0FBQyxHQUNoRTJmLFVBQVUsQ0FBQ2EsSUFBSSxHQUNmWix1QkFBdUIsQ0FBQ2hWLFNBQVMsQ0FBOEI7RUFDbkU7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVBBO0VBUUEsTUFBTTdMLHlCQUF5QixHQUFHLFVBQ2pDNUIsa0JBQTRCLEVBQzVCQyxpQkFBeUIsRUFDekJDLGdCQUFrQyxFQUNSO0lBQUE7SUFDMUIsTUFBTXNDLFVBQVUsR0FBR3RDLGdCQUFnQixDQUFDOEIsdUJBQXVCLENBQUNoQyxrQkFBa0IsQ0FBQztNQUM5RTJCLGlCQUEwQyxHQUFHLEVBQUU7TUFDL0NzVixrQkFBNEMsR0FBRyxDQUFDLENBQUM7TUFDakRDLGtCQUE0QixHQUFHcU0sb0NBQW9DLENBQUNyakIsZ0JBQWdCLENBQUM4TCxZQUFZLEVBQUUsQ0FBQztNQUNwR3lFLHFCQUFpRCxHQUFHdlEsZ0JBQWdCLENBQUNVLCtCQUErQixDQUFDWCxpQkFBaUIsQ0FBQztNQUN2SGdXLFNBQW9CLEdBQUcsQ0FBQXhGLHFCQUFxQixhQUFyQkEscUJBQXFCLGlEQUFyQkEscUJBQXFCLENBQUVFLGFBQWEsMkRBQXBDLHVCQUFzQ25MLElBQUksS0FBSSxpQkFBaUI7SUFDdkYsTUFBTTJSLGlDQUEyQyxHQUFHLEVBQUU7SUFDdEQsTUFBTTdMLFlBQXlCLEdBQUdwTCxnQkFBZ0IsQ0FBQzRYLG9CQUFvQixDQUFDLFFBQVEsZ0RBQXFDLENBQ3BINVgsZ0JBQWdCLENBQUN3TCxhQUFhLEVBQUUsQ0FDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLElBQUkxTCxrQkFBa0IsRUFBRTtNQUN2QixNQUFNd2pCLHFCQUFxQixHQUFHdGpCLGdCQUFnQixDQUFDdWpCLHNCQUFzQixDQUNwRUMsbUJBQW1CLENBQUN4akIsZ0JBQWdCLENBQUM4RyxzQkFBc0IsRUFBRSxDQUFDLENBQzlEO01BRURoSCxrQkFBa0IsQ0FBQ3VELE9BQU8sQ0FBRW9nQixRQUFRLElBQUs7UUFBQTtRQUN4QyxJQUFJLENBQUMvRyxjQUFjLENBQUMrRyxRQUFRLENBQUMsRUFBRTtVQUM5QjtRQUNEO1FBQ0EsSUFBSTFMLGNBQXFDLEdBQUcsSUFBSTtRQUNoRCxNQUFNcUIsNEJBQTRCLEdBQ2pDdUUsZ0JBQWdCLENBQUM4RixRQUFRLENBQUMsdUJBQUlBLFFBQVEsQ0FBQy9aLEtBQUsscUVBQWQsZ0JBQWdCNFMsT0FBTyxrREFBdkIsc0JBQXlCakssa0JBQWtCLEdBQ3RFZ0gscUJBQXFCLENBQUNyWixnQkFBZ0IsRUFBRXlqQixRQUFRLENBQUMsR0FDakR6Z0IsU0FBUztRQUNiLE1BQU1DLFlBQVksR0FBR3djLGdCQUFnQixDQUFDZ0UsUUFBUSxDQUFDOztRQUUvQztRQUNBLE1BQU1yTSxxQkFBMEMsR0FBR3NNLG1DQUFtQyxDQUFDRCxRQUFRLEVBQUV6akIsZ0JBQWdCLEVBQUUrVixTQUFTLENBQUM7UUFDN0gsTUFBTXVCLG9CQUE4QixHQUFHM1EsTUFBTSxDQUFDQyxJQUFJLENBQUN3USxxQkFBcUIsQ0FBQzFLLFVBQVUsQ0FBQztRQUNwRixNQUFNNkssdUJBQWlDLEdBQUc1USxNQUFNLENBQUNDLElBQUksQ0FBQ3dRLHFCQUFxQixDQUFDSSxvQkFBb0IsQ0FBQztRQUNqRyxNQUFNK0IsU0FBaUIsR0FBR0MsYUFBYSxDQUFDdlcsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7UUFDbEUsTUFBTXdXLE9BQWdCLEdBQUdGLFNBQVMsSUFBSXRXLFlBQVk7UUFDbEQsTUFBTTBnQixNQUEwQixHQUFHOUksUUFBUSxDQUFDNEksUUFBUSxFQUFFaEssT0FBTyxDQUFDO1FBQzlELE1BQU14VixJQUFJLEdBQUd5YSx3QkFBd0IsQ0FBQytFLFFBQVEsQ0FBQztRQUMvQyxNQUFNNUIsa0JBQTJCLEdBQUd0SSxTQUFTLENBQUN2VCxPQUFPLENBQUUsSUFBQyx1Q0FBK0IsRUFBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlGLE1BQU13WixtQkFBNEIsR0FBR3FDLGtCQUFrQixHQUNwRHpDLHVCQUF1QixDQUFDbmIsSUFBSSxFQUFFbEUsaUJBQWlCLEVBQUVDLGdCQUFnQixDQUFDLEdBQ2xFLEtBQUs7UUFDUixNQUFNNFosUUFBNEIsR0FBR0Msb0JBQW9CLENBQUM0SixRQUFRLENBQUM7UUFDbkUsTUFBTTlKLGdCQUFvQyxHQUFHQyxRQUFRLEtBQUssVUFBVSxHQUFHLFlBQVksR0FBRzVXLFNBQVM7UUFDL0YsTUFBTVosYUFBYSxHQUFHdWUsZ0NBQWdDLENBQ3JEN0ksaUNBQWlDLENBQUM3VCxJQUFJLEVBQUVtSCxZQUFZLEVBQUV5VyxrQkFBa0IsRUFBRTRCLFFBQVEsQ0FBQyxDQUNuRjtRQUNELElBQUluRywyQkFBNkQ7UUFDakUsSUFDQ21HLFFBQVEsQ0FBQ2pXLEtBQUssd0RBQTZDLElBQzNELHFCQUFBaVcsUUFBUSxDQUFDcEgsTUFBTSw4RUFBZixpQkFBaUJDLE9BQU8sMERBQXhCLHNCQUEwQjlPLEtBQUssaURBQXFDLEVBQ25FO1VBQ0Q4UCwyQkFBMkIsR0FBR0gsK0JBQStCLENBQUNzRyxRQUFRLEVBQUVyaEIsYUFBYSxDQUFDO1FBQ3ZGO1FBQ0EsSUFBSWlZLG1CQUFtQixDQUFDb0osUUFBUSxDQUFDLEVBQUU7VUFDbEM7VUFDQTFMLGNBQWMsR0FBRztZQUNoQkMsUUFBUSxFQUFFWixxQkFBcUIsQ0FBQ2Esc0JBQXNCO1lBQ3REQyxJQUFJLEVBQUVkLHFCQUFxQixDQUFDZSxzQkFBc0I7WUFDbEQ3UyxJQUFJLEVBQUVzVSxRQUFRLEdBQUd4QixrQkFBa0IsQ0FBQ3dCLFFBQVEsRUFBRXRDLG9CQUFvQixDQUFDclMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHakMsU0FBUztZQUMxRnNYLFdBQVcsRUFBRVgsZ0JBQWdCO1lBQzdCYSxTQUFTLEVBQUVaLFFBQVEsS0FBSztVQUN6QixDQUFDO1VBRUQsSUFBSXhDLHFCQUFxQixDQUFDaUIsY0FBYyxFQUFFO1lBQ3pDTixjQUFjLENBQUNPLFlBQVksR0FBR2xCLHFCQUFxQixDQUFDaUIsY0FBYztZQUNsRU4sY0FBYyxDQUFDelMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1VBQ25DLENBQUMsTUFBTSxJQUFJOFIscUJBQXFCLENBQUNtQixnQkFBZ0IsRUFBRTtZQUNsRFIsY0FBYyxDQUFDeFUsSUFBSSxHQUFHNlQscUJBQXFCLENBQUNtQixnQkFBZ0I7VUFDN0Q7VUFDQSxJQUFJbkIscUJBQXFCLENBQUNvQixrQkFBa0IsRUFBRTtZQUM3Q1QsY0FBYyxDQUFDVSxnQkFBZ0IsR0FBR3JCLHFCQUFxQixDQUFDb0Isa0JBQWtCO1VBQzNFLENBQUMsTUFBTSxJQUFJcEIscUJBQXFCLENBQUN1QixvQkFBb0IsRUFBRTtZQUN0RFosY0FBYyxDQUFDdFAsUUFBUSxHQUFHMk8scUJBQXFCLENBQUN1QixvQkFBb0I7VUFDckU7UUFDRDtRQUVBLE1BQU1tQixrQkFBa0IsR0FBR0YsUUFBUSxJQUFJRyxhQUFhLENBQUMwSixRQUFRLEVBQUU3SixRQUFRLENBQUM7UUFDeEUsTUFBTU0sVUFBc0IsR0FBRztVQUM5QkMsU0FBUyxFQUFFUCxRQUE4QztVQUN6RHhYLGFBQWEsRUFBRTtZQUNkLEdBQUdBLGFBQWE7WUFDaEIsSUFBRzBYLGtCQUFrQixhQUFsQkEsa0JBQWtCLHVCQUFsQkEsa0JBQWtCLENBQUUxWCxhQUFhO1VBQ3JDLENBQUM7VUFDRGdZLFdBQVcsRUFBRU4sa0JBQWtCLGFBQWxCQSxrQkFBa0IsdUJBQWxCQSxrQkFBa0IsQ0FBRU07UUFDbEMsQ0FBQztRQUNELE1BQU13SixjQUE4QixHQUFHLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUNoSyxRQUFRLElBQUksQ0FBQ00sVUFBVSxFQUFFO1VBQzdCO1VBQ0EwSixjQUFjLENBQUNDLGdCQUFnQixHQUFHLElBQUk7UUFDdkM7UUFDQSxNQUFNQyxZQUFZLEdBQUdoRSxvQkFBb0IsQ0FBQzJELFFBQVEsRUFBRUgscUJBQXFCLENBQUM7UUFDMUUsTUFBTXJKLFFBQVEsR0FBRyxDQUFDNkosWUFBWSxJQUFJNUQsaUJBQWlCLENBQUN1RCxRQUFRLEVBQUV4Z0IsWUFBWSxFQUFFK1Qsa0JBQWtCLENBQUM7UUFDL0YsTUFBTW5VLE1BQTZCLEdBQUc7VUFDckN5UCxHQUFHLEVBQUVDLFNBQVMsQ0FBQ0Msd0JBQXdCLENBQUNpUixRQUFRLENBQUM7VUFDakRuZSxJQUFJLEVBQUUxRixVQUFVLENBQUMrYSxVQUFVO1VBQzNCQyxLQUFLLEVBQUUrSSxNQUFNO1VBQ2I3SSxVQUFVLEVBQUVyQixPQUFPLEdBQUdvQixRQUFRLENBQUM0SSxRQUFRLENBQUMsR0FBR3pnQixTQUFTO1VBQ3BEK1gsS0FBSyxFQUFFdEIsT0FBTyxHQUFHRixTQUFTLEdBQUd2VyxTQUFTO1VBQ3RDK2dCLDJCQUEyQixFQUFFekcsMkJBQTJCO1VBQ3hEbkwsY0FBYyxFQUFFblMsZ0JBQWdCLENBQUNvUywrQkFBK0IsQ0FBQ3FSLFFBQVEsQ0FBQ3BSLGtCQUFrQixDQUFDO1VBQzdGMkksa0JBQWtCLEVBQUU1Qiw0QkFBNEI7VUFDaERsWCxZQUFZLEVBQUVrYSxtQ0FBbUMsQ0FBQ3FILFFBQVEsQ0FBQyxHQUFHeEksZ0JBQWdCLENBQUNsTixNQUFNLEdBQUdrTixnQkFBZ0IsQ0FBQ2hJLE9BQU87VUFDaEhoUCxJQUFJLEVBQUVBLElBQUk7VUFDVnViLG1CQUFtQixFQUFFQSxtQkFBbUI7VUFDeEN2YyxZQUFZLEVBQUVBLFlBQVk7VUFDMUJnWCxRQUFRLEVBQUVBLFFBQVE7VUFDbEJsWCxhQUFhLEVBQUV1VSxvQkFBb0IsQ0FBQ3JTLE1BQU0sR0FBR3FTLG9CQUFvQixHQUFHdFUsU0FBUztVQUM3RTZWLHVCQUF1QixFQUFFdEIsdUJBQXVCLENBQUN0UyxNQUFNLEdBQUcsQ0FBQyxHQUFHc1MsdUJBQXVCLEdBQUd2VSxTQUFTO1VBQ2pHK1UsY0FBYyxFQUFFQSxjQUFjO1VBQzlCaFcsS0FBSyxFQUFFLDBCQUFDMGhCLFFBQVEsQ0FBQ3JmLFdBQVcsb0ZBQXBCLHNCQUFzQjRmLEtBQUsscUZBQTNCLHVCQUE2QkMsV0FBVyxxRkFBeEMsdUJBQTBDbGlCLEtBQUssMkRBQS9DLHVCQUFpRCtMLE9BQU8sRUFBRSxLQUFlOUssU0FBUztVQUMxRmhCLFVBQVUsRUFBRXdaLGFBQWEsQ0FBQ2lJLFFBQVEsRUFBb0JyWSxZQUFZLENBQUM7VUFDbkV2SyxXQUFXLEVBQUUsSUFBSTtVQUNqQnVCLGFBQWEsRUFBRUEsYUFBYTtVQUM1QmtaLGFBQWEsRUFBRUMsd0JBQXdCLENBQUN2YixnQkFBZ0IsQ0FBQztVQUN6RGthLFVBQVUsRUFBRUEsVUFBVTtVQUN0QjBKLGNBQWMsRUFBRUEsY0FBYztVQUM5QmxiLFlBQVkscUJBQUVxUCxjQUFjLG9EQUFkLGdCQUFnQnRQLFFBQVE7VUFDdEM4VixnQkFBZ0IsRUFBRTtRQUNuQixDQUFDO1FBQ0QsTUFBTTVDLFFBQVEsR0FBR0MsV0FBVyxDQUFDNkgsUUFBUSxDQUFDO1FBQ3RDLElBQUk5SCxRQUFRLEVBQUU7VUFDYjlZLE1BQU0sQ0FBQ2daLE9BQU8sR0FBR0YsUUFBUTtRQUMxQjtRQUNBLElBQUl2RSxxQkFBcUIsQ0FBQ0ssb0NBQW9DLENBQUN4UyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQzFFZ1MsaUNBQWlDLENBQUNqUyxJQUFJLENBQUMsR0FBR29TLHFCQUFxQixDQUFDSyxvQ0FBb0MsQ0FBQztRQUN0RztRQUNBLElBQUlMLHFCQUFxQixDQUFDd0IsMEJBQTBCLElBQUkvVixNQUFNLENBQUNrVixjQUFjLEVBQUU7VUFDOUVsVixNQUFNLENBQUMrViwwQkFBMEIsR0FBR3hCLHFCQUFxQixDQUFDd0IsMEJBQTBCO1VBQ3BGL1YsTUFBTSxDQUFDa1YsY0FBYyxDQUFDelMsSUFBSSxHQUFHLFFBQVE7UUFDdEM7UUFFQTdELGlCQUFpQixDQUFDdUQsSUFBSSxDQUFDbkMsTUFBTSxDQUFDOztRQUU5QjtRQUNBeVUsb0JBQW9CLENBQUNqVSxPQUFPLENBQUU2Z0IsbUJBQW1CLElBQUs7VUFDckRuTixrQkFBa0IsQ0FBQ21OLG1CQUFtQixDQUFDLEdBQUc5TSxxQkFBcUIsQ0FBQzFLLFVBQVUsQ0FBQ3dYLG1CQUFtQixDQUFDOztVQUUvRjtVQUNBLElBQUlKLFlBQVksRUFBRTtZQUNqQjlNLGtCQUFrQixDQUFDaFMsSUFBSSxDQUFDa2YsbUJBQW1CLENBQUM7VUFDN0M7UUFDRCxDQUFDLENBQUM7O1FBRUY7UUFDQTNNLHVCQUF1QixDQUFDbFUsT0FBTyxDQUFFOGdCLHNCQUFzQixJQUFLO1VBQzNEO1VBQ0FwTixrQkFBa0IsQ0FBQ29OLHNCQUFzQixDQUFDLEdBQUcvTSxxQkFBcUIsQ0FBQ0ksb0JBQW9CLENBQUMyTSxzQkFBc0IsQ0FBQztRQUNoSCxDQUFDLENBQUM7TUFDSCxDQUFDLENBQUM7SUFDSDs7SUFFQTtJQUNBLE9BQU81WSx3QkFBd0IsQ0FDOUJ3TCxrQkFBa0IsRUFDbEJ6VSxVQUFVLEVBQ1ZiLGlCQUFpQixFQUNqQnVWLGtCQUFrQixFQUNsQmhYLGdCQUFnQixFQUNoQitWLFNBQVMsRUFDVGtCLGlDQUFpQyxDQUNqQztFQUNGLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNbU4saUJBQWlCLEdBQUcsVUFDekIxWCxVQUFnQyxFQUNoQ2pMLGlCQUEwQyxFQUMxQ3pCLGdCQUFrQyxFQUNsQ3NDLFVBQXNCLEVBQ0M7SUFDdkIsSUFBSStoQixpQkFBdUM7SUFDM0MsSUFBSTNYLFVBQVUsRUFBRTtNQUNmMlgsaUJBQWlCLEdBQUczWCxVQUFVLENBQUNuSSxHQUFHLENBQUMsVUFBVTRiLFlBQVksRUFBRTtRQUMxRCxNQUFNcmQsZ0JBQWdCLEdBQUdyQixpQkFBaUIsQ0FBQ21CLElBQUksQ0FBQyxVQUFVRSxnQkFBZ0IsRUFBRTtVQUMzRSxPQUFPQSxnQkFBZ0IsQ0FBQ0csWUFBWSxLQUFLa2QsWUFBWSxJQUFJcmQsZ0JBQWdCLENBQUNDLGFBQWEsS0FBS0MsU0FBUztRQUN0RyxDQUFDLENBQUM7UUFDRixJQUFJRixnQkFBZ0IsRUFBRTtVQUNyQixPQUFPQSxnQkFBZ0IsQ0FBQ21CLElBQUk7UUFDN0IsQ0FBQyxNQUFNO1VBQ04sTUFBTTZVLGNBQWMsR0FBR0MscUJBQXFCLENBQzNDO1lBQUUsQ0FBQ29ILFlBQVksR0FBRzdkLFVBQVUsQ0FBQ2dpQixXQUFXLENBQUNuRSxZQUFZO1VBQUUsQ0FBQyxFQUN4RDFlLGlCQUFpQixFQUNqQixFQUFFLEVBQ0Z6QixnQkFBZ0IsRUFDaEJzQyxVQUFVLEVBQ1YsRUFBRSxDQUNGO1VBQ0RiLGlCQUFpQixDQUFDdUQsSUFBSSxDQUFDOFQsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ3pDLE9BQU9BLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzdVLElBQUk7UUFDOUI7TUFDRCxDQUFDLENBQUM7SUFDSDtJQUVBLE9BQU9vZ0IsaUJBQWlCO0VBQ3pCLENBQUM7RUFFRCxNQUFNRSxxQkFBcUIsR0FBRyxVQUFVN1gsVUFBb0IsRUFBVTtJQUNyRSxPQUFPQSxVQUFVLENBQ2ZuSSxHQUFHLENBQUVQLFFBQVEsSUFBSztNQUNsQixPQUFRLElBQUcwSSxVQUFVLENBQUMxRyxPQUFPLENBQUNoQyxRQUFRLENBQUUsR0FBRTtJQUMzQyxDQUFDLENBQUMsQ0FDRGlKLElBQUksQ0FBRSxHQUFFLElBQUssRUFBQyxDQUFDO0VBQ2xCLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNckwsc0JBQXNCLEdBQUcsVUFDOUJDLE9BQXVGLEVBQ3ZGSixpQkFBMEMsRUFDMUN6QixnQkFBa0MsRUFDbENzQyxVQUFzQixFQUN0QnJDLGtCQUFvRCxFQUNuQjtJQUNqQyxNQUFNdWtCLGVBQStDLEdBQUcsQ0FBQyxDQUFDO0lBRTFELFNBQVNDLGtCQUFrQixDQUMxQjVoQixNQUFzRSxFQUN0RXlQLEdBQVcsRUFDcUM7TUFDaEQsT0FBTzdRLGlCQUFpQixDQUFDdU4sSUFBSSxDQUFFbE0sZ0JBQWdCLElBQUtBLGdCQUFnQixDQUFDd1AsR0FBRyxLQUFLQSxHQUFHLENBQUM7SUFDbEY7SUFFQSxTQUFTb1MsWUFBWSxDQUFDQyxjQUFtQixFQUErQztNQUN2RixPQUFPQSxjQUFjLENBQUNyZixJQUFJLEtBQUsxRixVQUFVLENBQUNnbEIsSUFBSTtJQUMvQztJQUVBLFNBQVNDLGNBQWMsQ0FBQ0YsY0FBbUIsRUFBaUQ7TUFDM0YsT0FBT0EsY0FBYyxDQUFDcmYsSUFBSSxLQUFLdEMsU0FBUyxJQUFJLENBQUMsQ0FBQzJoQixjQUFjLENBQUMzTSxRQUFRO0lBQ3RFO0lBRUEsU0FBUzhNLHNDQUFzQyxDQUFDL2hCLGFBQXVCLEVBQUVnaUIsc0JBQStDLEVBQUU7TUFDekgsTUFBTS9OLGtCQUE0QixHQUFHcU0sb0NBQW9DLENBQUNyakIsZ0JBQWdCLENBQUM4TCxZQUFZLEVBQUUsQ0FBQztNQUMxRy9JLGFBQWEsQ0FBQ00sT0FBTyxDQUFFVyxRQUFRLElBQUs7UUFDbkMrZ0Isc0JBQXNCLENBQUMxaEIsT0FBTyxDQUFFMmhCLElBQUksSUFBSztVQUN4QyxJQUFJQSxJQUFJLENBQUMvZ0IsSUFBSSxLQUFLRCxRQUFRLEVBQUU7WUFDM0JnaEIsSUFBSSxDQUFDL0ssUUFBUSxHQUFHakQsa0JBQWtCLENBQUNoUixPQUFPLENBQUNoQyxRQUFRLENBQUNpaEIsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRkQsSUFBSSxDQUFDN0osV0FBVyxHQUFHNkosSUFBSSxDQUFDL0ssUUFBUTtVQUNqQztRQUNELENBQUMsQ0FBQztNQUNILENBQUMsQ0FBQztJQUNIO0lBRUEsS0FBSyxNQUFNM0gsR0FBRyxJQUFJelEsT0FBTyxFQUFFO01BQUE7TUFDMUIsTUFBTThpQixjQUFjLEdBQUc5aUIsT0FBTyxDQUFDeVEsR0FBRyxDQUFDO01BQ25DQyxTQUFTLENBQUMyUyxXQUFXLENBQUM1UyxHQUFHLENBQUM7O01BRTFCO01BQ0EsTUFBTTZTLGVBQWUsR0FBRztRQUN2QjdTLEdBQUcsRUFBRUEsR0FBRztRQUNSdlEsS0FBSyxFQUFFNGlCLGNBQWMsQ0FBQzVpQixLQUFLLElBQUlpQixTQUFTO1FBQ3hDb2lCLFFBQVEsRUFBRTtVQUNUQyxNQUFNLDJCQUFFVixjQUFjLENBQUNTLFFBQVEsMERBQXZCLHNCQUF5QkMsTUFBTTtVQUN2Q0MsU0FBUyxFQUFFWCxjQUFjLENBQUNTLFFBQVEsS0FBS3BpQixTQUFTLEdBQUd1aUIsU0FBUyxDQUFDQyxLQUFLLEdBQUdiLGNBQWMsQ0FBQ1MsUUFBUSxDQUFDRTtRQUM5RixDQUFDO1FBQ0RoSyxhQUFhLEVBQUVDLHdCQUF3QixDQUFDdmIsZ0JBQWdCO01BQ3pELENBQUM7TUFFRCxJQUFJeWtCLGtCQUFrQixDQUFDRSxjQUFjLEVBQUVyUyxHQUFHLENBQUMsRUFBRTtRQUM1QyxNQUFNbVQscUNBQXNGLEdBQUc7VUFDOUYsR0FBR04sZUFBZTtVQUNsQm5qQixVQUFVLEVBQUUyaUIsY0FBYyxhQUFkQSxjQUFjLHVCQUFkQSxjQUFjLENBQUUzaUIsVUFBVTtVQUN0Q0MsZUFBZSxFQUFFMGlCLGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFMWlCLGVBQWU7VUFDaERDLFlBQVksRUFBRXlpQixjQUFjLGFBQWRBLGNBQWMsdUJBQWRBLGNBQWMsQ0FBRXppQixZQUFZO1VBQzFDb0QsSUFBSSxFQUFFMUYsVUFBVSxDQUFDK2EsVUFBVTtVQUMzQjlaLFdBQVcsRUFBRTRqQixrQkFBa0IsQ0FBQ0UsY0FBYyxFQUFFclMsR0FBRyxDQUFDLEdBQ2pEdFAsU0FBUyxHQUNUMGlCLGlCQUFpQixDQUFDZixjQUFjLEVBQUUxa0Isa0JBQWtCLEVBQUUsSUFBSSxDQUFDO1VBQzlEa0MsUUFBUSxFQUFFd2lCLGNBQWMsQ0FBQ3hpQixRQUFRO1VBQ2pDQyxhQUFhLEVBQUV1ZSxnQ0FBZ0MsQ0FBQ2dFLGNBQWMsQ0FBQ3ZpQixhQUFhO1FBQzdFLENBQUM7UUFDRG9pQixlQUFlLENBQUNsUyxHQUFHLENBQUMsR0FBR21ULHFDQUFxQztNQUM3RCxDQUFDLE1BQU07UUFDTixNQUFNMWlCLGFBQW1DLEdBQUdxaEIsaUJBQWlCLENBQzVETyxjQUFjLENBQUNqWSxVQUFVLEVBQ3pCakwsaUJBQWlCLEVBQ2pCekIsZ0JBQWdCLEVBQ2hCc0MsVUFBVSxDQUNWO1FBQ0QsTUFBTXFqQixrQkFBa0IsR0FBRztVQUMxQixHQUFHUixlQUFlO1VBQ2xCUyxNQUFNLEVBQUVqQixjQUFjLENBQUNpQixNQUFNO1VBQzdCNWpCLFVBQVUsRUFBRSxDQUFBMmlCLGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFM2lCLFVBQVUsS0FBSXNnQixVQUFVLENBQUNoUyxJQUFJO1VBQ3pEck8sZUFBZSxFQUFFLENBQUEwaUIsY0FBYyxhQUFkQSxjQUFjLHVCQUFkQSxjQUFjLENBQUUxaUIsZUFBZSxLQUFJNGpCLGVBQWUsQ0FBQ0MsS0FBSztVQUN6RTVqQixZQUFZLEVBQUUsQ0FBQXlpQixjQUFjLGFBQWRBLGNBQWMsdUJBQWRBLGNBQWMsQ0FBRXppQixZQUFZLEtBQUkrWSxnQkFBZ0IsQ0FBQ2hJLE9BQU87VUFDdEUrRSxRQUFRLEVBQUUyTSxjQUFjLENBQUMzTSxRQUFRO1VBQ2pDalYsYUFBYSxFQUFFQSxhQUFhO1VBQzVCZ1YsY0FBYyxFQUFFaFYsYUFBYSxHQUMxQjtZQUNBaVYsUUFBUSxFQUFFdU0scUJBQXFCLENBQUN4aEIsYUFBYSxDQUFDO1lBQzlDbVYsSUFBSSxFQUFFLENBQUMsRUFBRW5WLGFBQWEsQ0FBQ2tDLE1BQU0sR0FBRyxDQUFDO1VBQ2pDLENBQUMsR0FDRCxJQUFJO1VBQ1A4Z0IsRUFBRSxFQUFHLGlCQUFnQnpULEdBQUksRUFBQztVQUMxQnJPLElBQUksRUFBRyxpQkFBZ0JxTyxHQUFJLEVBQUM7VUFDNUI7VUFDQWxRLGFBQWEsRUFBRTtZQUFFd2UsYUFBYSxFQUFFO1VBQUUsQ0FBQztVQUNuQ3pGLFdBQVcsRUFBRSxLQUFLO1VBQ2xCdGEsV0FBVyxFQUFFLEtBQUs7VUFDbEJvWixRQUFRLEVBQUUsS0FBSztVQUNmMkosY0FBYyxFQUFFO1lBQUVDLGdCQUFnQixFQUFFO1VBQUssQ0FBQztVQUMxQ25YLFVBQVUsRUFBRWlZLGNBQWMsQ0FBQ2pZO1FBQzVCLENBQUM7UUFDRCxJQUFJM0osYUFBYSxFQUFFO1VBQ2xCK2hCLHNDQUFzQyxDQUFDL2hCLGFBQWEsRUFBRXRCLGlCQUFpQixDQUFDO1FBQ3pFO1FBRUEsSUFBSWlqQixZQUFZLENBQUNDLGNBQWMsQ0FBQyxFQUFFO1VBQ2pDLE1BQU1xQixpQkFBd0QsR0FBRztZQUNoRSxHQUFHTCxrQkFBa0I7WUFDckJyZ0IsSUFBSSxFQUFFMUYsVUFBVSxDQUFDZ2xCO1VBQ2xCLENBQUM7VUFDREosZUFBZSxDQUFDbFMsR0FBRyxDQUFDLEdBQUcwVCxpQkFBaUI7UUFDekMsQ0FBQyxNQUFNLElBQUluQixjQUFjLENBQUNGLGNBQWMsQ0FBQyxFQUFFO1VBQzFDLE1BQU1xQixpQkFBd0QsR0FBRztZQUNoRSxHQUFHTCxrQkFBa0I7WUFDckJyZ0IsSUFBSSxFQUFFMUYsVUFBVSxDQUFDcVQ7VUFDbEIsQ0FBQztVQUNEdVIsZUFBZSxDQUFDbFMsR0FBRyxDQUFDLEdBQUcwVCxpQkFBaUI7UUFDekMsQ0FBQyxNQUFNO1VBQUE7VUFDTixNQUFNQyxPQUFPLEdBQUksMEJBQXlCM1QsR0FBSSwyQ0FBMEM7VUFDeEZ0UyxnQkFBZ0IsQ0FDZGttQixjQUFjLEVBQUUsQ0FDaEJDLFFBQVEsQ0FDUkMsYUFBYSxDQUFDQyxRQUFRLEVBQ3RCQyxhQUFhLENBQUNDLEdBQUcsRUFDakJOLE9BQU8sRUFDUE8saUJBQWlCLEVBQ2pCQSxpQkFBaUIsYUFBakJBLGlCQUFpQixnREFBakJBLGlCQUFpQixDQUFFQyxpQkFBaUIsMERBQXBDLHNCQUFzQ0MsVUFBVSxDQUNoRDtRQUNIO01BQ0Q7SUFDRDtJQUNBLE9BQU9sQyxlQUFlO0VBQ3ZCLENBQUM7RUFFTSxTQUFTbUMsV0FBVyxDQUMxQjVtQixpQkFBeUIsRUFDekJDLGdCQUFrQyxFQUNsQ3FVLDBCQUFxRCxFQUNoQztJQUFBO0lBQ3JCLE1BQU05TixlQUFnQyxHQUFHdkcsZ0JBQWdCLENBQUN3RyxrQkFBa0IsRUFBRTtJQUM5RSxNQUFNK0oscUJBQWlELEdBQUd2USxnQkFBZ0IsQ0FBQ1UsK0JBQStCLENBQUNYLGlCQUFpQixDQUFDO0lBQzdILE1BQU02bUIsaUJBQXdDLEdBQUdyZ0IsZUFBZSxDQUFDc2dCLG9CQUFvQixFQUFFO0lBQ3ZGLE1BQU1DLGdCQUEwQixHQUFHLEVBQUU7SUFDckMsTUFBTUMsaUJBQWlCLEdBQUcxUywwQkFBMEIsQ0FBQy9PLElBQUksS0FBSyxpQkFBaUI7SUFDL0UsTUFBTTBoQixpQkFBaUIsR0FBRzNTLDBCQUEwQixDQUFDL08sSUFBSSxLQUFLLGlCQUFpQjtJQUMvRSxJQUFJLENBQUFpTCxxQkFBcUIsYUFBckJBLHFCQUFxQixpREFBckJBLHFCQUFxQixDQUFFRSxhQUFhLDJEQUFwQyx1QkFBc0N3VyxlQUFlLE1BQUtqa0IsU0FBUyxFQUFFO01BQ3hFO01BQ0EsTUFBTWlrQixlQUFvQixHQUFHMVcscUJBQXFCLENBQUNFLGFBQWEsQ0FBQ3dXLGVBQWU7TUFDaEYsSUFBSUEsZUFBZSxLQUFLLElBQUksRUFBRTtRQUM3QjtRQUNBLFFBQVE1UywwQkFBMEIsQ0FBQy9PLElBQUk7VUFDdEMsS0FBSyxpQkFBaUI7WUFDckIsT0FBTyxvQ0FBb0M7VUFDNUMsS0FBSyxpQkFBaUI7WUFDckIsT0FBTywwQkFBMEI7VUFDbEM7WUFDQyxPQUFPLG9CQUFvQjtRQUFDO01BRS9CLENBQUMsTUFBTSxJQUFJLE9BQU8yaEIsZUFBZSxLQUFLLFFBQVEsRUFBRTtRQUMvQztRQUNBLElBQUlBLGVBQWUsQ0FBQ0MsSUFBSSxFQUFFO1VBQ3pCSixnQkFBZ0IsQ0FBQzloQixJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzlCO1FBQ0EsSUFBSWlpQixlQUFlLENBQUNwa0IsTUFBTSxFQUFFO1VBQzNCaWtCLGdCQUFnQixDQUFDOWhCLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDaEM7UUFDQSxJQUFJaWlCLGVBQWUsQ0FBQ2xWLE1BQU0sRUFBRTtVQUMzQitVLGdCQUFnQixDQUFDOWhCLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDaEM7UUFDQSxJQUFJaWlCLGVBQWUsQ0FBQ2xNLEtBQUssS0FBS2dNLGlCQUFpQixJQUFJQyxpQkFBaUIsQ0FBQyxFQUFFO1VBQ3RFRixnQkFBZ0IsQ0FBQzloQixJQUFJLENBQUMsT0FBTyxDQUFDO1FBQy9CO1FBQ0EsSUFBSWlpQixlQUFlLENBQUNFLFNBQVMsSUFBSUosaUJBQWlCLEVBQUU7VUFDbkRELGdCQUFnQixDQUFDOWhCLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDbkM7UUFDQSxPQUFPOGhCLGdCQUFnQixDQUFDN2hCLE1BQU0sR0FBRyxDQUFDLEdBQUc2aEIsZ0JBQWdCLENBQUM3WixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUdqSyxTQUFTO01BQzVFO0lBQ0QsQ0FBQyxNQUFNO01BQ047TUFDQThqQixnQkFBZ0IsQ0FBQzloQixJQUFJLENBQUMsTUFBTSxDQUFDO01BQzdCOGhCLGdCQUFnQixDQUFDOWhCLElBQUksQ0FBQyxRQUFRLENBQUM7TUFDL0IsSUFBSWhGLGdCQUFnQixDQUFDOFEsZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQ3FXLFVBQVUsRUFBRTtRQUNuRSxJQUFJUixpQkFBaUIsS0FBS1MscUJBQXFCLENBQUNDLE9BQU8sSUFBSUMsa0JBQWtCLENBQUNoaEIsZUFBZSxFQUFFdkcsZ0JBQWdCLENBQUMsRUFBRTtVQUNqSDtVQUNBO1VBQ0E7VUFDQThtQixnQkFBZ0IsQ0FBQzloQixJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2hDO01BQ0QsQ0FBQyxNQUFNO1FBQ044aEIsZ0JBQWdCLENBQUM5aEIsSUFBSSxDQUFDLFFBQVEsQ0FBQztNQUNoQztNQUVBLElBQUkraEIsaUJBQWlCLEVBQUU7UUFDdEJELGdCQUFnQixDQUFDOWhCLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDOUI4aEIsZ0JBQWdCLENBQUM5aEIsSUFBSSxDQUFDLFdBQVcsQ0FBQztNQUNuQztNQUNBLElBQUlnaUIsaUJBQWlCLEVBQUU7UUFDdEJGLGdCQUFnQixDQUFDOWhCLElBQUksQ0FBQyxPQUFPLENBQUM7TUFDL0I7TUFDQSxPQUFPOGhCLGdCQUFnQixDQUFDN1osSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNsQztJQUNBLE9BQU9qSyxTQUFTO0VBQ2pCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBVEE7RUFVQSxTQUFTdWtCLGtCQUFrQixDQUFDaGhCLGVBQWdDLEVBQUV2RyxnQkFBa0MsRUFBVztJQUMxRyxPQUNDdUcsZUFBZSxDQUFDaWhCLGlCQUFpQixFQUFFLElBQ25DLENBQUN4bkIsZ0JBQWdCLENBQUN3RyxrQkFBa0IsRUFBRSxDQUFDaWhCLHlCQUF5QixFQUFFLElBQ2xFem5CLGdCQUFnQixDQUFDOFEsZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQzJXLGtCQUFrQjtFQUV4RTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0MsaUJBQWlCLENBQ3pCM25CLGdCQUFrQyxFQUNsQ29GLDZCQUFrRSxFQUNsRXZELE9BQXNCLEVBQ0Q7SUFDckI7SUFDQSxNQUFNK2xCLHFCQUFxQixHQUFHdkUsb0NBQW9DLENBQUNyakIsZ0JBQWdCLENBQUM4TCxZQUFZLEVBQUUsQ0FBQztJQUNuRyxJQUFJK2IsY0FBa0M7SUFDdEMsSUFBSXppQiw2QkFBNkIsYUFBN0JBLDZCQUE2QixlQUE3QkEsNkJBQTZCLENBQUUwaUIsU0FBUyxFQUFFO01BQzdDLE1BQU1DLE9BQXFCLEdBQUcsRUFBRTtNQUNoQyxNQUFNQyxVQUFVLEdBQUc7UUFDbEJELE9BQU8sRUFBRUE7TUFDVixDQUFDO01BQ0QzaUIsNkJBQTZCLENBQUMwaUIsU0FBUyxDQUFDemtCLE9BQU8sQ0FBRTRrQixTQUFTLElBQUs7UUFBQTtRQUM5RCxNQUFNQyxpQkFBaUIsR0FBR0QsU0FBUyxDQUFDRSxRQUFRO1FBQzVDLElBQUlELGlCQUFpQixJQUFJTixxQkFBcUIsQ0FBQzVoQixPQUFPLDBCQUFDa2lCLGlCQUFpQixDQUFDNUwsT0FBTywwREFBekIsc0JBQTJCclksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7VUFDL0YsTUFBTW1rQixRQUFRLEdBQUdDLCtCQUErQixDQUFDLENBQUNILGlCQUFpQixDQUFDLEVBQUVybUIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ2pGLElBQUl1bUIsUUFBUSxFQUFFO1lBQ2JKLFVBQVUsQ0FBQ0QsT0FBTyxDQUFDL2lCLElBQUksQ0FBQztjQUN2QmYsSUFBSSxFQUFFbWtCLFFBQVE7Y0FDZEUsVUFBVSxFQUFFLENBQUMsQ0FBQ0wsU0FBUyxDQUFDTTtZQUN6QixDQUFDLENBQUM7VUFDSDtRQUNEO01BQ0QsQ0FBQyxDQUFDO01BQ0ZWLGNBQWMsR0FBR0csVUFBVSxDQUFDRCxPQUFPLENBQUM5aUIsTUFBTSxHQUFHOEYsSUFBSSxDQUFDQyxTQUFTLENBQUNnZCxVQUFVLENBQUMsR0FBR2hsQixTQUFTO0lBQ3BGO0lBQ0EsT0FBTzZrQixjQUFjO0VBQ3RCO0VBRUEsU0FBU1csd0JBQXdCLENBQUNwakIsNkJBQWtFLEVBQXNCO0lBQUE7SUFDekgsSUFBSSxDQUFDQSw2QkFBNkIsRUFBRTtNQUNuQyxPQUFPcEMsU0FBUztJQUNqQjtJQUVBLE1BQU15bEIsS0FBSyw0QkFBR3JqQiw2QkFBNkIsQ0FBQ3NqQixxQkFBcUIsMERBQW5ELHNCQUFxRDVhLE9BQU8sRUFBRTtJQUU1RSxPQUFPLE9BQU8yYSxLQUFLLEtBQUssUUFBUSxHQUFHQSxLQUFLLEdBQUd6bEIsU0FBUztFQUNyRDtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztFQUVBLFNBQVNxbEIsK0JBQStCLENBQUNNLEtBQXFCLEVBQUU5bUIsT0FBc0IsRUFBWTtJQUNqRyxNQUFNK21CLFNBQW1CLEdBQUcsRUFBRTtJQUM5QixJQUFJbkssWUFBcUMsRUFBRTNiLGdCQUF1QztJQUNsRjZsQixLQUFLLENBQUN0bEIsT0FBTyxDQUFFd2xCLFdBQVcsSUFBSztNQUM5QixJQUFJQSxXQUFXLGFBQVhBLFdBQVcsZUFBWEEsV0FBVyxDQUFFcGtCLEtBQUssRUFBRTtRQUN2QmdhLFlBQVksR0FBRzVjLE9BQU8sQ0FBQ2UsSUFBSSxDQUFFQyxNQUFNLElBQUs7VUFDdkNDLGdCQUFnQixHQUFHRCxNQUErQjtVQUNsRCxPQUFPLENBQUNDLGdCQUFnQixDQUFDQyxhQUFhLElBQUlELGdCQUFnQixDQUFDRyxZQUFZLE1BQUs0bEIsV0FBVyxhQUFYQSxXQUFXLHVCQUFYQSxXQUFXLENBQUVwa0IsS0FBSztRQUMvRixDQUFDLENBQUM7UUFDRixJQUFJZ2EsWUFBWSxFQUFFO1VBQ2pCbUssU0FBUyxDQUFDNWpCLElBQUksQ0FBQ3laLFlBQVksQ0FBQ3hhLElBQUksQ0FBQztRQUNsQztNQUNEO0lBQ0QsQ0FBQyxDQUFDO0lBRUYsT0FBTzJrQixTQUFTO0VBQ2pCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTMWlCLGtCQUFrQixDQUMxQmQsNkJBQWtFLEVBQ2xFdkQsT0FBc0IsRUFDdEJrVSxTQUFpQixFQUNJO0lBQ3JCLElBQUk5UCxlQUFtQztJQUN2QyxJQUFJYiw2QkFBNkIsYUFBN0JBLDZCQUE2QixlQUE3QkEsNkJBQTZCLENBQUUwakIsT0FBTyxFQUFFO01BQzNDLElBQUlDLFFBQVEsR0FBRzNqQiw2QkFBNkIsQ0FBQzBqQixPQUFPO01BQ3BELElBQUkvUyxTQUFTLEtBQUssaUJBQWlCLEVBQUU7UUFDcENnVCxRQUFRLEdBQUdBLFFBQVEsQ0FBQ25hLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO01BQ2hDO01BQ0EsTUFBTW9hLFlBQVksR0FBR1gsK0JBQStCLENBQUNVLFFBQVEsRUFBRWxuQixPQUFPLENBQUMsQ0FBQzBDLEdBQUcsQ0FBRTZqQixRQUFRLElBQUs7UUFDekYsT0FBTztVQUFFbmtCLElBQUksRUFBRW1rQjtRQUFTLENBQUM7TUFDMUIsQ0FBQyxDQUFDO01BRUZuaUIsZUFBZSxHQUFHK2lCLFlBQVksQ0FBQy9qQixNQUFNLEdBQUc4RixJQUFJLENBQUNDLFNBQVMsQ0FBQztRQUFFaWUsV0FBVyxFQUFFRDtNQUFhLENBQUMsQ0FBQyxHQUFHaG1CLFNBQVM7SUFDbEc7SUFDQSxPQUFPaUQsZUFBZTtFQUN2QjtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0VBRUEsU0FBU0wsNkNBQTZDLENBQUNULGtCQUFzQyxFQUFFO0lBQzlGLE1BQU15WixnQ0FBd0QsR0FBRyxDQUFDLENBQUM7SUFDbkV6WixrQkFBa0IsQ0FBQ3RELE9BQU8sQ0FBQ3dCLE9BQU8sQ0FBRVIsTUFBTSxJQUFLO01BQUE7TUFDOUNBLE1BQU0sR0FBR0EsTUFBK0I7TUFDeEMsTUFBTXFtQix3QkFBd0IsR0FBR3ZpQixNQUFNLENBQUNDLElBQUksQ0FBQ3pCLGtCQUFrQixDQUFDUSxVQUFVLENBQUUsQ0FBQy9DLElBQUksQ0FBRXVrQixTQUFTLElBQUtBLFNBQVMsS0FBS3RrQixNQUFNLENBQUNvQixJQUFJLENBQUM7TUFDM0gsSUFBSWlsQix3QkFBd0IsRUFBRTtRQUM3QixNQUFNQyw4QkFBOEIsR0FBR2hrQixrQkFBa0IsQ0FBQ1EsVUFBVSxDQUFFdWpCLHdCQUF3QixDQUFDO1FBQy9Gcm1CLE1BQU0sQ0FBQ21jLFlBQVksR0FBRyxJQUFJO1FBQzFCbmMsTUFBTSxDQUFDb2MsU0FBUyxHQUFHO1VBQ2xCbUssZUFBZSxFQUFFRCw4QkFBOEIsQ0FBQ3RrQixnQkFBZ0IsSUFBSSxDQUFDO1FBQ3RFLENBQUM7TUFDRjtNQUNBLDhCQUFJaEMsTUFBTSxDQUFDZ1csdUJBQXVCLG1EQUE5Qix1QkFBZ0M1VCxNQUFNLEVBQUU7UUFDM0NwQyxNQUFNLENBQUNnVyx1QkFBdUIsQ0FBQ3hWLE9BQU8sQ0FBRWdtQixzQkFBc0IsSUFBSztVQUNsRTtVQUNBO1VBQ0ExSyx1QkFBdUIsQ0FBQzBLLHNCQUFzQixFQUFFbGtCLGtCQUFrQixDQUFDdEQsT0FBTyxFQUFFK2MsZ0NBQWdDLENBQUM7UUFDOUcsQ0FBQyxDQUFDO01BQ0g7SUFDRCxDQUFDLENBQUM7SUFDRnpaLGtCQUFrQixDQUFDdEQsT0FBTyxDQUFDd0IsT0FBTyxDQUFFUixNQUFNLElBQUs7TUFDOUNBLE1BQU0sR0FBR0EsTUFBK0I7TUFDeEMsSUFBSUEsTUFBTSxDQUFDZ1csdUJBQXVCLEVBQUU7UUFBQTtRQUNuQ2hXLE1BQU0sQ0FBQ2dXLHVCQUF1QixHQUFHaFcsTUFBTSxDQUFDZ1csdUJBQXVCLENBQUN0VSxHQUFHLENBQ2pFa2EsWUFBWSxJQUFLRyxnQ0FBZ0MsQ0FBQ0gsWUFBWSxDQUFDLElBQUlBLFlBQVksQ0FDaEY7UUFDRDtRQUNBNWIsTUFBTSxDQUFDRSxhQUFhLDZCQUFHRixNQUFNLENBQUNFLGFBQWEsMkRBQXBCLHVCQUFzQjZPLE1BQU0sQ0FBQy9PLE1BQU0sQ0FBQ2dXLHVCQUF1QixDQUFDO01BQ3BGO0lBQ0QsQ0FBQyxDQUFDO0VBQ0g7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTelMsc0JBQXNCLENBQzlCaEIsNkJBQWtFLEVBQ2xFdkQsT0FBc0IsRUFDRDtJQUNyQixJQUFJc0UsbUJBQXVDO0lBQzNDLElBQUlmLDZCQUE2QixhQUE3QkEsNkJBQTZCLGVBQTdCQSw2QkFBNkIsQ0FBRWtrQixLQUFLLEVBQUU7TUFDekMsTUFBTUMsT0FBTyxHQUFHbmtCLDZCQUE2QixDQUFDa2tCLEtBQUs7TUFDbkQsTUFBTTNqQixVQUFrQyxHQUFHLENBQUMsQ0FBQztNQUM3QzBpQiwrQkFBK0IsQ0FBQ2tCLE9BQU8sRUFBRTFuQixPQUFPLENBQUMsQ0FBQ3dCLE9BQU8sQ0FBRStrQixRQUFRLElBQUs7UUFDdkV6aUIsVUFBVSxDQUFDeWlCLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUMxQixDQUFDLENBQUM7TUFFRmppQixtQkFBbUIsR0FBRzRFLElBQUksQ0FBQ0MsU0FBUyxDQUFDckYsVUFBVSxDQUFDO0lBQ2pEO0lBRUEsT0FBT1EsbUJBQW1CO0VBQzNCO0VBRU8sU0FBUzBFLCtCQUErQixDQUM5Qy9LLGtCQUF3QyxFQUN4Q0MsaUJBQXlCLEVBQ3pCQyxnQkFBa0MsRUFDbENxVSwwQkFBcUQsRUFDckR4UyxPQUFzQixFQUN0QnVELDZCQUF1RCxFQUN2RDhFLGlCQUF5QyxFQUNWO0lBQUE7SUFDL0I7SUFDQSxNQUFNO01BQUU1RDtJQUF1QixDQUFDLEdBQUcrRCxTQUFTLENBQUN0SyxpQkFBaUIsQ0FBQztJQUMvRCxNQUFNeXBCLEtBQVUsOEJBQUd4cEIsZ0JBQWdCLENBQUM4RyxzQkFBc0IsRUFBRSxDQUFDMk0sZ0JBQWdCLENBQUNyUCxXQUFXLHVGQUF0RSx3QkFBd0VtRixFQUFFLHVGQUExRSx3QkFBNEVDLFVBQVUsNERBQXRGLHdCQUF3RmlnQixjQUFjO0lBQ3pILE1BQU01ZCxTQUFTLEdBQUc3TCxnQkFBZ0IsQ0FBQzhHLHNCQUFzQixFQUFFLENBQUNJLGVBQWU7SUFDM0UsTUFBTXdpQixvQkFBcUMsR0FBRzFwQixnQkFBZ0IsQ0FBQ3dHLGtCQUFrQixFQUFFO0lBQ25GLE1BQU1takIsZUFBZSxHQUFHcmpCLHNCQUFzQixDQUFDckIsTUFBTSxLQUFLLENBQUM7TUFDMUQya0IsUUFBNEIsR0FBR2pELFdBQVcsQ0FBQzVtQixpQkFBaUIsRUFBRUMsZ0JBQWdCLEVBQUVxVSwwQkFBMEIsQ0FBQztNQUMzRzBSLEVBQUUsR0FBR3pmLHNCQUFzQixHQUFHdWpCLFVBQVUsQ0FBQzlwQixpQkFBaUIsQ0FBQyxHQUFHOHBCLFVBQVUsQ0FBQzdwQixnQkFBZ0IsQ0FBQ2dILGNBQWMsRUFBRSxFQUFFLFVBQVUsQ0FBQztJQUN4SCxNQUFNa0osa0JBQWtCLEdBQUdMLHdCQUF3QixDQUFDN1AsZ0JBQWdCLENBQUM7SUFDckUsTUFBTXNLLG9CQUFvQixHQUFHakUsdUJBQXVCLENBQUNyRyxnQkFBZ0IsRUFBRXNHLHNCQUFzQixDQUFDO0lBQzlGLE1BQU1yRyxrQkFBa0IsR0FBR3lwQixvQkFBb0IsQ0FBQ2pqQiwwQkFBMEIsQ0FBQzZELG9CQUFvQixDQUFDO0lBQ2hHLE1BQU13ZixpQkFBaUIsR0FBRzFWLHFCQUFxQixDQUM5Q3RVLGtCQUFrQixFQUNsQnVVLDBCQUEwQixFQUMxQnJVLGdCQUFnQixFQUNoQkMsa0JBQWtCLEVBQ2xCRixpQkFBaUIsQ0FDakI7SUFDRCxNQUFNZ3FCLHNCQUFzQixHQUFHQyw4QkFBOEIsQ0FDNURocUIsZ0JBQWdCLEVBQ2hCOHBCLGlCQUFpQixDQUFDMWdCLElBQUksRUFDdEJpTCwwQkFBMEIsRUFDMUJuSyxpQkFBaUIsQ0FDakI7SUFFRCxNQUFNaUcsZ0NBQWdDLEdBQUc4WixtQkFBbUIsQ0FBQ2pxQixnQkFBZ0IsRUFBRStwQixzQkFBc0IsQ0FBQztJQUN0RyxNQUFNRyxnQ0FBZ0MsR0FBR0MsbUJBQW1CLENBQUNucUIsZ0JBQWdCLEVBQUUrcEIsc0JBQXNCLENBQUM7SUFDdEcsTUFBTUssa0NBQWtDLEdBQUdDLHFCQUFxQixDQUFDcnFCLGdCQUFnQixFQUFFK3BCLHNCQUFzQixDQUFDO0lBQzFHLE1BQU1PLHVCQUF1QixHQUFHQyxnQ0FBZ0MsQ0FDL0RSLHNCQUFzQixFQUN0QlMsd0JBQXdCLENBQUN4cUIsZ0JBQWdCLENBQUMsRUFDMUNpUixpQkFBaUIsQ0FBQ2laLGdDQUFnQyxDQUFDLEtBQUssT0FBTyxDQUMvRDtJQUVELE1BQU0xWixhQUFhLEdBQUdQLGdCQUFnQixDQUNyQ25RLGtCQUFrQixFQUNsQkMsaUJBQWlCLEVBQ2pCQyxnQkFBZ0IsRUFDaEIycEIsZUFBZSxFQUNmelosa0JBQWtCLEVBQ2xCQyxnQ0FBZ0MsRUFDaENpYSxrQ0FBa0MsQ0FDbEM7SUFDRCxJQUFJSyxTQUFTLEdBQUdua0Isc0JBQXNCLEdBQUcsRUFBRSxHQUFHLEVBQUU7SUFDaEQsSUFBSWxCLDZCQUE2QixhQUE3QkEsNkJBQTZCLGVBQTdCQSw2QkFBNkIsQ0FBRXNsQixRQUFRLEVBQUU7TUFDNUNELFNBQVMsR0FBR3JsQiw2QkFBNkIsQ0FBQ3NsQixRQUFRLENBQUM1YyxPQUFPLEVBQVk7SUFDdkU7SUFFQSxNQUFNOFksaUJBQXdDLEdBQUc4QyxvQkFBb0IsQ0FBQzdDLG9CQUFvQixFQUFFO0lBQzVGLE1BQU04RCxZQUFZLEdBQUdDLGdCQUFnQixDQUFDNXFCLGdCQUFnQixDQUFDOEcsc0JBQXNCLEVBQUUsQ0FBQztJQUNoRixNQUFNK2pCLGVBQWUsR0FBRztNQUN2QnRXLE1BQU0sRUFBRXVXLHVCQUF1QixDQUFDOXFCLGdCQUFnQixFQUFFK3BCLHNCQUFzQixDQUFDO01BQ3pFZ0IsTUFBTSxFQUFFQyx1QkFBdUIsQ0FBQ2hyQixnQkFBZ0IsRUFBRStwQixzQkFBc0IsQ0FBQztNQUN6RWtCLEtBQUssRUFBRUMsc0JBQXNCLENBQUNsckIsZ0JBQWdCLEVBQUUrcEIsc0JBQXNCLEVBQUVPLHVCQUF1QixDQUFDO01BQ2hHYSxRQUFRLEVBQUVDLHlCQUF5QixDQUFDcHJCLGdCQUFnQixFQUFFK3BCLHNCQUFzQixDQUFDO01BQzdFc0IsV0FBVyxFQUFFQyxjQUFjLENBQUN0ckIsZ0JBQWdCLEVBQUUrcEIsc0JBQXNCO0lBQ3JFLENBQUM7SUFFRCxPQUFPO01BQ05oRSxFQUFFLEVBQUVBLEVBQUU7TUFDTndGLFVBQVUsRUFBRTFmLFNBQVMsR0FBR0EsU0FBUyxDQUFDNUgsSUFBSSxHQUFHLEVBQUU7TUFDM0N1bkIsVUFBVSxFQUFFaEksbUJBQW1CLENBQUN4akIsZ0JBQWdCLENBQUM4RyxzQkFBc0IsRUFBRSxDQUFDO01BQzFFMmtCLGNBQWMsRUFBRW5sQixzQkFBc0I7TUFDdENvbEIsR0FBRyxFQUFFN1YsNEJBQTRCLENBQ2hDL1Ysa0JBQWtCLEVBQ2xCRSxnQkFBZ0IsRUFDaEJDLGtCQUFrQixFQUNsQnFLLG9CQUFvQixFQUNwQitKLDBCQUEwQixDQUFDL08sSUFBSSxDQUMvQjtNQUNEc2tCLFFBQVEsRUFBRUEsUUFBUTtNQUNsQmlCLGVBQWUsRUFBRTtRQUNoQmxxQixPQUFPLEVBQUVrcUIsZUFBZTtRQUN4QlAsdUJBQXVCLEVBQUVBLHVCQUF1QjtRQUNoRGhlLHFCQUFxQixFQUFFWixnQ0FBZ0MsQ0FBQzFMLGdCQUFnQjtNQUN6RSxDQUFDO01BQ0Q0SSxXQUFXLEVBQUUraUIsZUFBZSxDQUFDM3JCLGdCQUFnQixFQUFFa0ssaUJBQWlCLENBQUM7TUFDakVxSyxNQUFNLEVBQUV1VixpQkFBaUI7TUFDekJ0WixhQUFhLEVBQUVBLGFBQWE7TUFDNUJvYixjQUFjLEVBQ2JyRSxrQkFBa0IsQ0FBQ21DLG9CQUFvQixFQUFFMXBCLGdCQUFnQixDQUFDLElBQ3pEQSxnQkFBZ0IsQ0FBQzhRLGVBQWUsRUFBRSxLQUFLQyxZQUFZLENBQUNxVyxVQUFVLElBQzlEcG5CLGdCQUFnQixDQUFDOFEsZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQzJXLGtCQUFrQixJQUN0RSxFQUFFeGQsaUJBQWlCLElBQUl3ZixvQkFBb0IsQ0FBQ2pDLHlCQUF5QixDQUFDdmQsaUJBQWlCLENBQUMsQ0FBRTtNQUM1RjBjLGlCQUFpQixFQUFFQSxpQkFBaUIsS0FBSyxTQUFTLElBQUksQ0FBQ2dELFFBQVEsR0FBR3ZDLHFCQUFxQixDQUFDL1csSUFBSSxHQUFHc1csaUJBQWlCO01BQ2hINkQsU0FBUyxFQUFFQSxTQUFTO01BQ3BCNUMsY0FBYyxFQUFFRixpQkFBaUIsQ0FBQzNuQixnQkFBZ0IsRUFBRW9GLDZCQUE2QixFQUFFdkQsT0FBTyxDQUFDO01BQzNGMm5CLEtBQUssRUFBRUEsS0FBSztNQUNacUMsVUFBVSxFQUFFeFgsMEJBQTBCLENBQUMvTyxJQUFJLEtBQUssaUJBQWlCLElBQUksRUFBRTRHLFVBQVUsQ0FBQ3llLFlBQVksQ0FBQyxJQUFJQSxZQUFZLENBQUNsbUIsS0FBSyxLQUFLLEtBQUssQ0FBQztNQUNoSXFuQixxQkFBcUIsRUFBRXRELHdCQUF3QixDQUFDcGpCLDZCQUE2QjtJQUM5RSxDQUFDO0VBQ0Y7RUFBQztFQUVELFNBQVNnVCxrQkFBa0IsQ0FBQ3dCLFFBQWdCLEVBQThDO0lBQUEsSUFBNUNtUyxpQkFBMEIsdUVBQUcsS0FBSztJQUMvRSxJQUFJQyxjQUFzQixHQUFHLFFBQVE7SUFDckMsSUFBSUQsaUJBQWlCLEVBQUU7TUFDdEIsSUFBSW5TLFFBQVEsS0FBSyxvQkFBb0IsRUFBRTtRQUN0Q29TLGNBQWMsR0FBRyxVQUFVO01BQzVCO01BQ0EsT0FBT0EsY0FBYztJQUN0QixDQUFDLE1BQU07TUFDTixRQUFRcFMsUUFBUTtRQUNmLEtBQUssYUFBYTtRQUNsQixLQUFLLFdBQVc7UUFDaEIsS0FBSyxXQUFXO1FBQ2hCLEtBQUssWUFBWTtRQUNqQixLQUFLLFVBQVU7VUFDZG9TLGNBQWMsR0FBRyxRQUFRO1VBQ3pCO1FBQ0QsS0FBSyxnQkFBZ0I7UUFDckIsS0FBSyxVQUFVO1VBQ2RBLGNBQWMsR0FBRyxNQUFNO1VBQ3ZCO1FBQ0QsS0FBSyxvQkFBb0I7VUFDeEJBLGNBQWMsR0FBRyxVQUFVO1VBQzNCO1FBQ0QsS0FBSyxlQUFlO1VBQ25CQSxjQUFjLEdBQUcsTUFBTTtVQUN2QjtRQUNELEtBQUssYUFBYTtVQUNqQkEsY0FBYyxHQUFHLFNBQVM7VUFDMUI7UUFDRDtVQUNDQSxjQUFjLEdBQUcsUUFBUTtNQUFDO0lBRTdCO0lBQ0EsT0FBT0EsY0FBYztFQUN0Qjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTM2hCLFNBQVMsQ0FBQ3RLLGlCQUF5QixFQUFFO0lBQ3BELElBQUksQ0FBQ3VHLHNCQUFzQixFQUFFNkwsY0FBYyxDQUFDLEdBQUdwUyxpQkFBaUIsQ0FBQ3dPLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFFM0UsSUFBSWpJLHNCQUFzQixDQUFDdVosV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLdlosc0JBQXNCLENBQUNyQixNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQ2xGO01BQ0FxQixzQkFBc0IsR0FBR0Esc0JBQXNCLENBQUMybEIsTUFBTSxDQUFDLENBQUMsRUFBRTNsQixzQkFBc0IsQ0FBQ3JCLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDN0Y7SUFDQSxPQUFPO01BQUVxQixzQkFBc0I7TUFBRTZMO0lBQWUsQ0FBQztFQUNsRDtFQUFDO0VBRU0sU0FBUytaLGdDQUFnQyxDQUMvQ0Msb0JBQTRCLEVBQzVCbnNCLGdCQUFrQyxFQUNVO0lBQzVDLE1BQU1vc0IsY0FBYyxHQUFHcHNCLGdCQUFnQixDQUFDcXNCLHVCQUF1QixDQUFDRixvQkFBb0IsQ0FBQztJQUNyRixNQUFNRyxTQUErQixHQUFHRixjQUFjLENBQUN4b0IsVUFBa0M7SUFFekYsSUFBSTBvQixTQUFTLEVBQUU7TUFBQTtNQUNkLE1BQU1DLGFBQXVCLEdBQUcsRUFBRTtNQUNsQyx5QkFBQUQsU0FBUyxDQUFDRSxhQUFhLDBEQUF2QixzQkFBeUJucEIsT0FBTyxDQUFFb3BCLFlBQThCLElBQUs7UUFDcEUsTUFBTTdmLFlBQWlCLEdBQUc2ZixZQUFZLENBQUNDLFlBQVk7UUFDbkQsTUFBTXZNLFlBQW9CLEdBQUd2VCxZQUFZLENBQUNuSSxLQUFLO1FBQy9DLElBQUk4bkIsYUFBYSxDQUFDdm1CLE9BQU8sQ0FBQ21hLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1VBQy9Db00sYUFBYSxDQUFDdm5CLElBQUksQ0FBQ21iLFlBQVksQ0FBQztRQUNqQztNQUNELENBQUMsQ0FBQztNQUNGLE9BQU87UUFDTnZOLElBQUksRUFBRTBaLFNBQVMsYUFBVEEsU0FBUywwQ0FBVEEsU0FBUyxDQUFFdmpCLElBQUksb0RBQWYsZ0JBQWlCSixRQUFRLEVBQUU7UUFDakM0akIsYUFBYSxFQUFFQTtNQUNoQixDQUFDO0lBQ0Y7SUFDQSxPQUFPdnBCLFNBQVM7RUFDakI7RUFBQztFQUVELFNBQVMycEIsMkJBQTJCLENBQ25DbGMsYUFBaUQsRUFDakR6USxnQkFBa0MsRUFDbEM0c0IsUUFBaUIsRUFDUDtJQUNWO0lBQ0EsSUFBSUMsZ0JBQWdCLEdBQUdwYyxhQUFhLENBQUNvYyxnQkFBZ0IsSUFBSUQsUUFBUTtJQUNqRTtJQUNBLElBQUksQ0FBQ0EsUUFBUSxJQUFJQyxnQkFBZ0IsSUFBSTdzQixnQkFBZ0IsQ0FBQzhRLGVBQWUsRUFBRSxLQUFLQyxZQUFZLENBQUNxVyxVQUFVLEVBQUU7TUFDcEd5RixnQkFBZ0IsR0FBRyxLQUFLO01BQ3hCN3NCLGdCQUFnQixDQUFDa21CLGNBQWMsRUFBRSxDQUFDQyxRQUFRLENBQUNDLGFBQWEsQ0FBQ0MsUUFBUSxFQUFFQyxhQUFhLENBQUNDLEdBQUcsRUFBRXVHLFNBQVMsQ0FBQ0MsZ0NBQWdDLENBQUM7SUFDbEk7SUFDQSxPQUFPRixnQkFBZ0I7RUFDeEI7RUFFQSxTQUFTRyxtQkFBbUIsQ0FDM0J2YyxhQUFpRCxFQUNqRHNGLFNBQW9CLEVBQ3BCL1YsZ0JBQWtDLEVBQ2I7SUFDckIsSUFBSWl0QixlQUFtQztJQUN2QyxJQUFJbFgsU0FBUyxLQUFLLGlCQUFpQixFQUFFO01BQ3BDLE9BQU8vUyxTQUFTO0lBQ2pCO0lBQ0EsUUFBUWhELGdCQUFnQixDQUFDOFEsZUFBZSxFQUFFO01BQ3pDLEtBQUtDLFlBQVksQ0FBQ3FXLFVBQVU7TUFDNUIsS0FBS3JXLFlBQVksQ0FBQzJXLGtCQUFrQjtRQUNuQ3VGLGVBQWUsR0FBRyxDQUFDeGMsYUFBYSxDQUFDeWMsU0FBUyxHQUFHLFVBQVUsR0FBRyxTQUFTO1FBQ25FO01BQ0QsS0FBS25jLFlBQVksQ0FBQ0MsVUFBVTtRQUMzQmljLGVBQWUsR0FBR3hjLGFBQWEsQ0FBQ3ljLFNBQVMsS0FBSyxLQUFLLEdBQUcsVUFBVSxHQUFHLFNBQVM7UUFDNUUsSUFBSWx0QixnQkFBZ0IsQ0FBQ3dHLGtCQUFrQixFQUFFLENBQUMybUIsYUFBYSxFQUFFLEVBQUU7VUFDMURGLGVBQWUsR0FBRyxDQUFDeGMsYUFBYSxDQUFDeWMsU0FBUyxHQUFHLFVBQVUsR0FBRyxTQUFTO1FBQ3BFO1FBQ0E7TUFDRDtJQUFRO0lBR1QsT0FBT0QsZUFBZTtFQUN2QjtFQUVBLFNBQVNHLGFBQWEsQ0FDckIzYyxhQUFpRCxFQUNqRGpPLGlCQUFvQyxFQUNwQ3hDLGdCQUFrQyxFQUN0QjtJQUNaLElBQUkrVixTQUFTLEdBQUcsQ0FBQXRGLGFBQWEsYUFBYkEsYUFBYSx1QkFBYkEsYUFBYSxDQUFFbkwsSUFBSSxLQUFJLGlCQUFpQjtJQUN4RDtBQUNEO0FBQ0E7SUFDQyxJQUFJLENBQUN5USxTQUFTLEtBQUssaUJBQWlCLElBQUlBLFNBQVMsS0FBSyxXQUFXLEtBQUssQ0FBQy9WLGdCQUFnQixDQUFDd0csa0JBQWtCLEVBQUUsQ0FBQzZtQixTQUFTLEVBQUUsRUFBRTtNQUN6SHRYLFNBQVMsR0FBRyxpQkFBaUI7SUFDOUI7SUFDQSxPQUFPQSxTQUFTO0VBQ2pCO0VBRUEsU0FBU3VYLGlCQUFpQixDQUFDdlgsU0FBb0IsRUFBRXRGLGFBQWlELEVBQUU4YyxvQkFBNkIsRUFBTztJQUN2SSxJQUFJeFgsU0FBUyxLQUFLLFdBQVcsRUFBRTtNQUM5QixJQUFJd1gsb0JBQW9CLEVBQUU7UUFDekIsT0FBTztVQUNOQyxZQUFZLEVBQUUsTUFBTTtVQUNwQkMsUUFBUSxFQUFFO1FBQ1gsQ0FBQztNQUNGLENBQUMsTUFBTTtRQUNOLE9BQU87VUFDTkQsWUFBWSxFQUFFL2MsYUFBYSxDQUFDK2MsWUFBWSxHQUFHL2MsYUFBYSxDQUFDK2MsWUFBWSxHQUFHLE9BQU87VUFDL0VDLFFBQVEsRUFBRWhkLGFBQWEsQ0FBQ2dkLFFBQVEsR0FBR2hkLGFBQWEsQ0FBQ2dkLFFBQVEsR0FBRztRQUM3RCxDQUFDO01BQ0Y7SUFDRCxDQUFDLE1BQU07TUFDTixPQUFPLENBQUMsQ0FBQztJQUNWO0VBQ0Q7RUFFQSxTQUFTQyx3QkFBd0IsQ0FBQ0MsVUFBcUIsRUFBRUMsY0FBa0QsRUFBVztJQUNySCxPQUFPQSxjQUFjLENBQUNDLG9CQUFvQixLQUFLN3FCLFNBQVMsSUFBSTJxQixVQUFVLEtBQUssaUJBQWlCLEdBQ3pGQyxjQUFjLENBQUNDLG9CQUFvQixHQUNuQyxLQUFLO0VBQ1Q7RUFFQSxTQUFTQyx1QkFBdUIsQ0FBQ0YsY0FBa0QsRUFBVTtJQUM1RixPQUFPQSxjQUFjLENBQUNWLFNBQVMsS0FBSyxJQUFJLElBQUlVLGNBQWMsQ0FBQ0csY0FBYyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUdILGNBQWMsQ0FBQ0csY0FBYyxJQUFJLEdBQUc7RUFDM0g7RUFFQSxTQUFTQywrQkFBK0IsQ0FBQ0osY0FBa0QsRUFBVTtJQUFBO0lBQ3BHLE9BQU8seUJBQUFBLGNBQWMsQ0FBQ3hZLFlBQVksa0RBQTNCLHNCQUE2QjZZLHNCQUFzQiw2QkFBR0wsY0FBYyxDQUFDeFksWUFBWSwyREFBM0IsdUJBQTZCNlksc0JBQXNCLEdBQUcsQ0FBQztFQUNySDtFQUVBLFNBQVNDLFdBQVcsQ0FDbkJ6ZCxhQUFpRCxFQUNqRDBkLGdCQUE4QyxFQUM5Q0MscUJBQTBCLEVBQzFCenJCLElBQWdDLEVBQ2hDM0MsZ0JBQWtDLEVBQzVCO0lBQUE7SUFDTixJQUFJb3VCLHFCQUFxQixFQUFFO01BQzFCRCxnQkFBZ0IsQ0FBQ25wQixJQUFJLENBQUM7UUFBRW1OLGNBQWMsRUFBRXhQLElBQUksQ0FBQ3dQO01BQWUsQ0FBQyxDQUFDO0lBQy9EO0lBQ0EsT0FBTztNQUNOa2MsWUFBWSxFQUFFO1FBQ2JudEIsT0FBTyxFQUFFbEIsZ0JBQWdCLENBQUM4USxlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDcVcsVUFBVTtRQUN2RWtILFVBQVUsRUFBRTdkLGFBQWEsYUFBYkEsYUFBYSxnREFBYkEsYUFBYSxDQUFFOGQscUJBQXFCLDBEQUFwQyxzQkFBc0NELFVBQVU7UUFDNUQzRixLQUFLLEVBQUV3RjtNQUNSO0lBQ0QsQ0FBQztFQUNGO0VBRUEsU0FBU0ssZ0JBQWdCLENBQ3hCL2QsYUFBaUQsRUFDakR6USxnQkFBa0MsRUFDbEN5dUIsV0FBb0IsRUFDVjtJQUNWLE9BQU9oZSxhQUFhLENBQUNpZSxZQUFZLEtBQUsxckIsU0FBUyxHQUM1Q3lOLGFBQWEsQ0FBQ2llLFlBQVksR0FDMUIxdUIsZ0JBQWdCLENBQUM4USxlQUFlLEVBQUUsS0FBSyxZQUFZLElBQUkyZCxXQUFXO0VBQ3RFO0VBRUEsU0FBU0UsdUJBQXVCLENBQy9CbGUsYUFBaUQsRUFDakQzUSxrQkFBd0MsRUFDeENFLGdCQUFrQyxFQUM1QjtJQUFBO0lBQ04sSUFBSSxDQUFDRixrQkFBa0IsRUFBRTtNQUN4QixPQUFPLENBQUMsQ0FBQztJQUNWO0lBQ0EsTUFBTXF1QixnQkFBOEMsR0FBRyxFQUFFO0lBQ3pELE1BQU0xYSxnQkFBZ0IsR0FBR3pULGdCQUFnQixDQUFDOEIsdUJBQXVCLENBQUNoQyxrQkFBa0IsQ0FBQztJQUNyRixJQUFJc3VCLHFCQUEwQjtJQUM5QixJQUFJUSxPQUFPO0lBQ1huZSxhQUFhLGFBQWJBLGFBQWEsaURBQWJBLGFBQWEsQ0FBRThkLHFCQUFxQixxRkFBcEMsdUJBQXNDNUYsS0FBSywyREFBM0MsdUJBQTZDdGxCLE9BQU8sQ0FBRVYsSUFBZ0MsSUFBSztNQUMxRnlyQixxQkFBcUIsR0FBRzNhLGdCQUFnQixDQUFDNlEsV0FBVyxDQUFDM2hCLElBQUksQ0FBQ3dQLGNBQWMsQ0FBQztNQUN6RXljLE9BQU8sR0FBR1YsV0FBVyxDQUFDemQsYUFBYSxFQUFFMGQsZ0JBQWdCLEVBQUVDLHFCQUFxQixFQUFFenJCLElBQUksRUFBRTNDLGdCQUFnQixDQUFDO0lBQ3RHLENBQUMsQ0FBQztJQUVGLElBQUk2dUIsY0FBYyxHQUFHLEtBQUs7SUFDMUJBLGNBQWMsR0FBRyxDQUFDLDRCQUFDcGUsYUFBYSxDQUFDOGQscUJBQXFCLG1EQUFuQyx1QkFBcUNNLGNBQWM7SUFDdEUsT0FBTztNQUNORCxPQUFPLEVBQUVBLE9BQU87TUFDaEJFLGFBQWEsRUFBRSxFQUFFVixxQkFBcUIsSUFBSVMsY0FBYztJQUN6RCxDQUFDO0VBQ0Y7RUFFQSxTQUFTblUscUNBQXFDLENBQUN6WCxZQUFvQixFQUFFakQsZ0JBQWtDLEVBQUU7SUFDeEcsTUFBTSt1QixvQkFBb0IsR0FBRy9PLG9CQUFvQixDQUFDaGdCLGdCQUFnQixDQUFDOEcsc0JBQXNCLEVBQUUsRUFBRTdELFlBQVksQ0FBQyxDQUFDOHJCLG9CQUFvQjtJQUMvSCxJQUFJLENBQUFBLG9CQUFvQixhQUFwQkEsb0JBQW9CLHVCQUFwQkEsb0JBQW9CLENBQUU5cEIsTUFBTSxJQUFHLENBQUMsRUFBRTtNQUNyQyxNQUFNd1YsaUNBQTJDLEdBQUcsRUFBRTtNQUN0RHNVLG9CQUFvQixDQUFDMXJCLE9BQU8sQ0FBRTJyQixXQUFnQixJQUFLO1FBQ2xEdlUsaUNBQWlDLENBQUN6VixJQUFJLENBQUM2VixRQUFRLENBQUNtVSxXQUFXLENBQUMsSUFBSUEsV0FBVyxDQUFDL3FCLElBQUksQ0FBQztNQUNsRixDQUFDLENBQUM7TUFDRixPQUFPd1csaUNBQWlDO0lBQ3pDO0VBQ0Q7RUFFTyxTQUFTclEsNkJBQTZCLENBQzVDdEssa0JBQXdDLEVBQ3hDQyxpQkFBeUIsRUFDekJDLGdCQUFrQyxFQUVOO0lBQUE7SUFBQSxJQUQ1Qml2QixvQkFBb0IsdUVBQUcsS0FBSztJQUU1QixNQUFNQyxnQkFBZ0IsR0FBR2x2QixnQkFBZ0IsQ0FBQ3dHLGtCQUFrQixFQUFFO0lBQzlELE1BQU0rSixxQkFBaUQsR0FBR3ZRLGdCQUFnQixDQUFDVSwrQkFBK0IsQ0FBQ1gsaUJBQWlCLENBQUM7SUFDN0gsTUFBTTBRLGFBQWEsR0FBSUYscUJBQXFCLElBQUlBLHFCQUFxQixDQUFDRSxhQUFhLElBQUssQ0FBQyxDQUFDO0lBQzFGLE1BQU0yRSxZQUFZLEdBQUcsMkJBQUEzRSxhQUFhLENBQUMyRSxZQUFZLDJEQUExQix1QkFBNEJuUixJQUFJLEtBQUlvUixZQUFZLENBQUNPLE9BQU87SUFDN0UsTUFBTXVaLHFCQUFxQixHQUFHLENBQUNELGdCQUFnQixDQUFDRSxPQUFPLEVBQUU7SUFDekQsTUFBTVgsV0FBVyxHQUNoQmhlLGFBQWEsQ0FBQ2dlLFdBQVcsS0FBS3pyQixTQUFTLEdBQUd5TixhQUFhLENBQUNnZSxXQUFXLEdBQUd6dUIsZ0JBQWdCLENBQUM4USxlQUFlLEVBQUUsS0FBSyxZQUFZLENBQUMsQ0FBQztJQUM1SCxNQUFNdWUsWUFBWSxHQUFHcnZCLGdCQUFnQixDQUFDOFEsZUFBZSxFQUFFO0lBQ3ZELE1BQU13ZSx3QkFBd0IsR0FBR0QsWUFBWSxLQUFLdGUsWUFBWSxDQUFDcVcsVUFBVSxHQUFHLDhCQUE4QixHQUFHcGtCLFNBQVM7SUFDdEgsTUFBTWlILCtCQUErQixHQUFHZ2xCLG9CQUFvQixJQUFJQyxnQkFBZ0IsQ0FBQ0ssMEJBQTBCLEVBQUU7SUFDN0csTUFBTUMsb0JBQW9CLEdBQUdiLHVCQUF1QixDQUFDbGUsYUFBYSxFQUFFM1Esa0JBQWtCLEVBQUVFLGdCQUFnQixDQUFDO0lBQ3pHLE1BQU15dkIsd0JBQXdCLDZCQUFHaGYsYUFBYSxDQUFDMkUsWUFBWSwyREFBMUIsdUJBQTRCcWEsd0JBQXdCO0lBQ3JGLE1BQU1udEIsVUFBVSxHQUFHdEMsZ0JBQWdCLENBQUN3TCxhQUFhLEVBQUU7SUFDbkQsTUFBTWhKLGlCQUFpQixHQUFHLElBQUlDLGlCQUFpQixDQUFDSCxVQUFVLEVBQUV0QyxnQkFBZ0IsQ0FBQztJQUM3RSxNQUFNK1YsU0FBb0IsR0FBR3FYLGFBQWEsQ0FBQzNjLGFBQWEsRUFBRWpPLGlCQUFpQixFQUFFeEMsZ0JBQWdCLENBQUM7SUFDOUYsTUFBTTB2QixnQkFBZ0IsR0FBR3BDLGlCQUFpQixDQUFDdlgsU0FBUyxFQUFFdEYsYUFBYSxFQUFFNGUsWUFBWSxLQUFLdGUsWUFBWSxDQUFDcVcsVUFBVSxDQUFDO0lBQzlHLE1BQU15RyxvQkFBb0IsR0FBR0gsd0JBQXdCLENBQUMzWCxTQUFTLEVBQUV0RixhQUFhLENBQUM7SUFDL0UsTUFBTWtmLGNBQWMsR0FBRztNQUN0QjtNQUNBamEsV0FBVyxFQUNWLDJCQUFBakYsYUFBYSxDQUFDMkUsWUFBWSwyREFBMUIsdUJBQTRCTSxXQUFXLE1BQUsxUyxTQUFTLDZCQUNsRHlOLGFBQWEsQ0FBQzJFLFlBQVksMkRBQTFCLHVCQUE0Qk0sV0FBVyxHQUN2Q04sWUFBWSxLQUFLQyxZQUFZLENBQUN4SCxNQUFNO01BQ3hDdUgsWUFBWSxFQUFFQSxZQUFZO01BQzFCcWEsd0JBQXdCLEVBQUVBLHdCQUF3QjtNQUNsREgsd0JBQXdCLEVBQUVBLHdCQUF3QjtNQUNsRDtNQUNBTSwrQkFBK0IsRUFBRSxDQUFDSCx3QkFBd0IsR0FBRyxDQUFDLDRCQUFDaGYsYUFBYSxDQUFDMkUsWUFBWSxtREFBMUIsdUJBQTRCd2EsK0JBQStCLElBQUcsS0FBSztNQUNsSVQscUJBQXFCLEVBQUVBLHFCQUFxQjtNQUM1Q1QsWUFBWSxFQUFFRixnQkFBZ0IsQ0FBQy9kLGFBQWEsRUFBRXpRLGdCQUFnQixFQUFFeXVCLFdBQVcsQ0FBQztNQUM1RTVCLGdCQUFnQixFQUFFRiwyQkFBMkIsQ0FBQ2xjLGFBQWEsRUFBRXpRLGdCQUFnQixFQUFFa3ZCLGdCQUFnQixDQUFDRSxPQUFPLEVBQUUsQ0FBQztNQUMxR1MsY0FBYyxFQUFFcGYsYUFBYSxhQUFiQSxhQUFhLHVCQUFiQSxhQUFhLENBQUVvZixjQUFjO01BQzdDcEIsV0FBVyxFQUFFQSxXQUFXO01BQ3hCSyxhQUFhLEVBQUUsSUFBSTtNQUNuQjdCLGVBQWUsRUFBRUQsbUJBQW1CLENBQUN2YyxhQUFhLEVBQUVzRixTQUFTLEVBQUUvVixnQkFBZ0IsQ0FBQztNQUNoRit0QixjQUFjLEVBQUVELHVCQUF1QixDQUFDcmQsYUFBYSxDQUFDO01BQ3REd2Qsc0JBQXNCLEVBQUVELCtCQUErQixDQUFDdmQsYUFBYSxDQUFDO01BQ3RFcWYsa0NBQWtDLEVBQUUsQ0FBQXJmLGFBQWEsYUFBYkEsYUFBYSxpREFBYkEsYUFBYSxDQUFFMkUsWUFBWSwyREFBM0IsdUJBQTZCMGEsa0NBQWtDLEtBQUksS0FBSztNQUM1R0MsWUFBWSxFQUFFLEVBQUN0ZixhQUFhLGFBQWJBLGFBQWEseUNBQWJBLGFBQWEsQ0FBRThkLHFCQUFxQixtREFBcEMsdUJBQXNDRCxVQUFVLEtBQUksMkJBQUNZLGdCQUFnQixDQUFDYyxvQkFBb0IsRUFBRSxrREFBdkMsc0JBQXlDMUIsVUFBVTtNQUN2SGhwQixJQUFJLEVBQUV5USxTQUFTO01BQ2ZrYSx1QkFBdUIsRUFBRXBDLG9CQUFvQixJQUFJNWpCLCtCQUErQjtNQUNoRmltQixhQUFhLEVBQUVoQixnQkFBZ0IsQ0FBQ2dCLGFBQWE7SUFDOUMsQ0FBQztJQUVELE1BQU1DLGtCQUE2QyxHQUFHO01BQUUsR0FBR1IsY0FBYztNQUFFLEdBQUdELGdCQUFnQjtNQUFFLEdBQUdGO0lBQXFCLENBQUM7SUFFekgsSUFBSXpaLFNBQVMsS0FBSyxXQUFXLEVBQUU7TUFDOUJvYSxrQkFBa0IsQ0FBQ0Msa0JBQWtCLEdBQUczZixhQUFhLENBQUMyZixrQkFBa0I7SUFDekU7SUFFQSxPQUFPRCxrQkFBa0I7RUFDMUI7RUFBQztFQUVNLFNBQVNwVyxhQUFhLENBQUN2UyxTQUE0QyxFQUFFb1MsUUFBNEIsRUFBTztJQUFBO0lBQzlHLElBQUl5VyxjQUFjLEdBQUdDLGdCQUFnQixDQUFFOW9CLFNBQVMsYUFBVEEsU0FBUyx1QkFBVEEsU0FBUyxDQUFlbEMsSUFBSSxDQUFDLEtBQUtzVSxRQUFRLEdBQUcwVyxnQkFBZ0IsQ0FBQzFXLFFBQVEsQ0FBQyxHQUFHNVcsU0FBUyxDQUFDO0lBQzNILElBQUksQ0FBQ3F0QixjQUFjLElBQUs3b0IsU0FBUyxhQUFUQSxTQUFTLGVBQVRBLFNBQVMsQ0FBZTJQLFVBQVUsSUFBSSxnQkFBQzNQLFNBQVMsQ0FBYzJQLFVBQVUsZ0RBQWxDLFlBQW9DOUssS0FBSyxNQUFLLGdCQUFnQixFQUFFO01BQzdIZ2tCLGNBQWMsR0FBR0MsZ0JBQWdCLENBQUc5b0IsU0FBUyxDQUFjMlAsVUFBVSxDQUFvQm9aLGNBQWMsQ0FBQztJQUN6RztJQUNBLE1BQU16VyxrQkFBOEIsR0FBRztNQUN0Q3hVLElBQUkscUJBQUUrcUIsY0FBYyxvREFBZCxnQkFBZ0IvcUIsSUFBSTtNQUMxQjhVLFdBQVcsRUFBRSxDQUFDLENBQUM7TUFDZmhZLGFBQWEsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFDRCxJQUFJK1osVUFBVSxDQUFDM1UsU0FBUyxDQUFDLEVBQUU7TUFBQTtNQUMxQnNTLGtCQUFrQixDQUFDTSxXQUFXLEdBQUc7UUFDaENHLEtBQUssRUFBRSx5QkFBQThWLGNBQWMsQ0FBQ2pXLFdBQVcsa0RBQTFCLHNCQUE0Qm9XLE1BQU0sR0FBR2hwQixTQUFTLENBQUMrUyxLQUFLLEdBQUd2WCxTQUFTO1FBQ3ZFeXRCLFNBQVMsRUFBRSwwQkFBQUosY0FBYyxDQUFDalcsV0FBVyxtREFBMUIsdUJBQTRCc1csVUFBVSxHQUFHbHBCLFNBQVMsQ0FBQ2lwQixTQUFTLEdBQUd6dEIsU0FBUztRQUNuRjJ0QixTQUFTLEVBQUUsMEJBQUFOLGNBQWMsQ0FBQ2pXLFdBQVcsbURBQTFCLHVCQUE0QndXLFVBQVUsR0FBR3BwQixTQUFTLENBQUNtcEIsU0FBUyxHQUFHM3RCLFNBQVM7UUFDbkY2dEIsUUFBUSxFQUFFLDBCQUFBUixjQUFjLENBQUNqVyxXQUFXLG1EQUExQix1QkFBNEIwVyxTQUFTLEdBQUd0cEIsU0FBUyxDQUFDcXBCLFFBQVEsR0FBRzd0QixTQUFTO1FBQ2hGK3RCLE9BQU8sRUFDTiwwQkFBQVYsY0FBYyxDQUFDalcsV0FBVyxtREFBMUIsdUJBQTZCLDJDQUEyQyxDQUFDLElBQ3pFLENBQUM0VyxLQUFLLDJCQUFDeHBCLFNBQVMsQ0FBQ3BELFdBQVcscUZBQXJCLHVCQUF1QjZzQixVQUFVLDJEQUFqQyx1QkFBbUNDLE9BQU8sQ0FBQyxHQUM5Qyw4QkFBRTFwQixTQUFTLENBQUNwRCxXQUFXLHVGQUFyQix3QkFBdUI2c0IsVUFBVSw0REFBakMsd0JBQW1DQyxPQUFRLEVBQUMsR0FDL0NsdUIsU0FBUztRQUNibXVCLE9BQU8sRUFDTiwwQkFBQWQsY0FBYyxDQUFDalcsV0FBVyxtREFBMUIsdUJBQTZCLDJDQUEyQyxDQUFDLElBQ3pFLENBQUM0VyxLQUFLLDRCQUFDeHBCLFNBQVMsQ0FBQ3BELFdBQVcsdUZBQXJCLHdCQUF1QjZzQixVQUFVLDREQUFqQyx3QkFBbUNHLE9BQU8sQ0FBQyxHQUM5Qyw4QkFBRTVwQixTQUFTLENBQUNwRCxXQUFXLHVGQUFyQix3QkFBdUI2c0IsVUFBVSw0REFBakMsd0JBQW1DRyxPQUFRLEVBQUMsR0FDL0NwdUIsU0FBUztRQUNicXVCLGVBQWUsRUFDZHZYLGtCQUFrQixDQUFDeFUsSUFBSSxLQUFLLGdDQUFnQyw4QkFDNUQrcUIsY0FBYyxDQUFDalcsV0FBVyxtREFBMUIsdUJBQThCLElBQUMsZ0RBQXdDLEVBQUMsQ0FBQywrQkFDekU1UyxTQUFTLENBQUNwRCxXQUFXLCtFQUFyQix3QkFBdUI0RCxNQUFNLG9EQUE3Qix3QkFBK0JzcEIsZUFBZSxHQUMzQyxJQUFJLEdBQ0p0dUI7TUFDTCxDQUFDO0lBQ0Y7SUFDQThXLGtCQUFrQixDQUFDMVgsYUFBYSxHQUFHO01BQ2xDbXZCLGFBQWEsRUFDWixDQUFBelgsa0JBQWtCLGFBQWxCQSxrQkFBa0IsZ0RBQWxCQSxrQkFBa0IsQ0FBRXhVLElBQUksMERBQXhCLHNCQUEwQlUsT0FBTyxDQUFDLDZCQUE2QixDQUFDLE1BQUssQ0FBQyxJQUN0RSxDQUFBOFQsa0JBQWtCLGFBQWxCQSxrQkFBa0IsaURBQWxCQSxrQkFBa0IsQ0FBRXhVLElBQUksMkRBQXhCLHVCQUEwQlUsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLE1BQUssQ0FBQyxHQUN0RSxLQUFLLEdBQ0xoRCxTQUFTO01BQ2J3dUIsV0FBVyxFQUNWLENBQUExWCxrQkFBa0IsYUFBbEJBLGtCQUFrQixpREFBbEJBLGtCQUFrQixDQUFFeFUsSUFBSSwyREFBeEIsdUJBQTBCVSxPQUFPLENBQUMsNkJBQTZCLENBQUMsTUFBSyxDQUFDLElBQ3RFLENBQUE4VCxrQkFBa0IsYUFBbEJBLGtCQUFrQixpREFBbEJBLGtCQUFrQixDQUFFeFUsSUFBSSwyREFBeEIsdUJBQTBCVSxPQUFPLENBQUMsZ0NBQWdDLENBQUMsTUFBSyxDQUFDLEdBQ3RFLEVBQUUsR0FDRmhELFNBQVM7TUFDYnl1QixxQkFBcUIsRUFBRTNYLGtCQUFrQixDQUFDeFUsSUFBSSxLQUFLLGdDQUFnQyxHQUFHLElBQUksR0FBR3RDO0lBQzlGLENBQUM7SUFDRCxPQUFPOFcsa0JBQWtCO0VBQzFCO0VBQUM7RUFBQSxPQUVjO0lBQ2RqYSxlQUFlO0lBQ2YyQixlQUFlO0lBQ2YrSix3QkFBd0I7SUFDeEJuRSxzQkFBc0I7SUFDdEI0Qyx3QkFBd0I7SUFDeEJxQiwrQkFBK0I7SUFDL0J3RSx3QkFBd0I7SUFDeEJJLGdCQUFnQjtJQUNoQjZOLHNCQUFzQjtJQUN0QnRDLGFBQWE7SUFDYm1MLFdBQVc7SUFDWDliLCtCQUErQjtJQUMvQjBRLHdCQUF3QjtJQUN4QmxSLFNBQVM7SUFDVDZoQixnQ0FBZ0M7SUFDaEM5aEIsNkJBQTZCO0lBQzdCMlAsYUFBYTtJQUNiN1U7RUFDRCxDQUFDO0FBQUEifQ==