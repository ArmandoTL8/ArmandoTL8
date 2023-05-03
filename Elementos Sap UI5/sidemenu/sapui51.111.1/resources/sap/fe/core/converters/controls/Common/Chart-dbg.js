/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper", "sap/ui/core/Core", "../../helpers/Aggregation", "../../helpers/ID", "../../ManifestSettings"], function (Log, DataField, Action, ConfigurableObject, Key, BindingToolkit, DataModelPathHelper, Core, Aggregation, ID, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var ActionType = ManifestSettings.ActionType;
  var getFilterBarID = ID.getFilterBarID;
  var getChartID = ID.getChartID;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var not = BindingToolkit.not;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  /**
   * Method to retrieve all chart actions from annotations.
   *
   * @param chartAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns The table annotation actions
   */
  function getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext) {
    const chartActions = [];
    if (chartAnnotation) {
      const aActions = chartAnnotation.Actions || [];
      aActions.forEach(dataField => {
        var _dataField$annotation, _dataField$annotation2, _dataField$annotation3, _ActionTarget;
        let chartAction;
        if (isDataFieldForActionAbstract(dataField) && !(((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === true) && !dataField.Inline && !dataField.Determining && !(dataField !== null && dataField !== void 0 && (_ActionTarget = dataField.ActionTarget) !== null && _ActionTarget !== void 0 && _ActionTarget.isBound)) {
          const key = KeyHelper.generateKeyFromDataField(dataField);
          switch (dataField.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              chartAction = {
                type: ActionType.DataFieldForAction,
                annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
                key: key,
                visible: getCompileExpressionForAction(dataField, converterContext)
              };
              break;
            case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
              chartAction = {
                type: ActionType.DataFieldForIntentBasedNavigation,
                annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
                key: key,
                visible: getCompileExpressionForAction(dataField, converterContext),
                isNavigable: true
              };
              break;
          }
        }
        if (chartAction) {
          chartActions.push(chartAction);
        }
      });
    }
    return chartActions;
  }
  function getChartActions(chartAnnotation, visualizationPath, converterContext) {
    const aAnnotationActions = getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext);
    const manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, aAnnotationActions);
    const actionOverwriteConfig = {
      enabled: OverrideType.overwrite,
      enableOnSelect: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      command: OverrideType.overwrite
    };
    const chartActions = insertCustomElements(aAnnotationActions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions: chartActions,
      commandActions: manifestActions.commandActions
    };
  }
  _exports.getChartActions = getChartActions;
  function getP13nMode(visualizationPath, converterContext) {
    var _chartManifestSetting;
    const chartManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    let personalization = true;
    const aPersonalization = [];
    if ((chartManifestSettings === null || chartManifestSettings === void 0 ? void 0 : (_chartManifestSetting = chartManifestSettings.chartSettings) === null || _chartManifestSetting === void 0 ? void 0 : _chartManifestSetting.personalization) !== undefined) {
      personalization = chartManifestSettings.chartSettings.personalization;
    }
    if (personalization) {
      //Variant Management should be enabled when personalization is enabled. Irrespective of wheather or not variant management is enabled, personalization should be enabled.
      if (personalization === true) {
        return "Sort,Type,Item";
      } else if (typeof personalization === "object") {
        if (personalization.type) {
          aPersonalization.push("Type");
        }
        if (personalization.item) {
          aPersonalization.push("Item");
        }
        if (personalization.sort) {
          aPersonalization.push("Sort");
        }
        return aPersonalization.join(",");
      }
    }
    return undefined;
  }

  /**
   * Create the ChartVisualization configuration that will be used to display a chart using the Chart building block.
   *
   * @param chartAnnotation The target chart annotation
   * @param visualizationPath The current visualization annotation path
   * @param converterContext The converter context
   * @param doNotCheckApplySupported Flag that indicates whether applysupported needs to be checked or not
   * @returns The chart visualization based on the annotation
   */
  _exports.getP13nMode = getP13nMode;
  function createChartVisualization(chartAnnotation, visualizationPath, converterContext, doNotCheckApplySupported) {
    const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
    if (!doNotCheckApplySupported && !aggregationHelper.isAnalyticsSupported()) {
      throw new Error("ApplySupported is not added to the annotations");
    }
    const aTransAggregations = aggregationHelper.getTransAggregations();
    const aCustomAggregates = aggregationHelper.getCustomAggregateDefinitions();
    const mCustomAggregates = {};
    const pageManifestSettings = converterContext.getManifestWrapper();
    const variantManagement = pageManifestSettings.getVariantManagement();
    const p13nMode = getP13nMode(visualizationPath, converterContext);
    if (p13nMode === undefined && variantManagement === "Control") {
      Log.warning("Variant Management cannot be enabled when personalization is disabled");
    }
    if (aCustomAggregates) {
      const entityType = aggregationHelper.getEntityType();
      for (const customAggregate of aCustomAggregates) {
        var _customAggregate$anno, _customAggregate$anno2, _relatedCustomAggrega, _relatedCustomAggrega2, _relatedCustomAggrega3;
        const aContextDefiningProperties = customAggregate === null || customAggregate === void 0 ? void 0 : (_customAggregate$anno = customAggregate.annotations) === null || _customAggregate$anno === void 0 ? void 0 : (_customAggregate$anno2 = _customAggregate$anno.Aggregation) === null || _customAggregate$anno2 === void 0 ? void 0 : _customAggregate$anno2.ContextDefiningProperties;
        const qualifier = customAggregate === null || customAggregate === void 0 ? void 0 : customAggregate.qualifier;
        const relatedCustomAggregateProperty = qualifier && entityType.entityProperties.find(property => property.name === qualifier);
        const label = relatedCustomAggregateProperty && (relatedCustomAggregateProperty === null || relatedCustomAggregateProperty === void 0 ? void 0 : (_relatedCustomAggrega = relatedCustomAggregateProperty.annotations) === null || _relatedCustomAggrega === void 0 ? void 0 : (_relatedCustomAggrega2 = _relatedCustomAggrega.Common) === null || _relatedCustomAggrega2 === void 0 ? void 0 : (_relatedCustomAggrega3 = _relatedCustomAggrega2.Label) === null || _relatedCustomAggrega3 === void 0 ? void 0 : _relatedCustomAggrega3.toString());
        mCustomAggregates[qualifier] = {
          name: qualifier,
          label: label || `Custom Aggregate (${qualifier})`,
          sortable: true,
          sortOrder: "both",
          contextDefiningProperty: aContextDefiningProperties ? aContextDefiningProperties.map(oCtxDefProperty => {
            return oCtxDefProperty.value;
          }) : []
        };
      }
    }
    const mTransAggregations = {};
    const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
    if (aTransAggregations) {
      for (let i = 0; i < aTransAggregations.length; i++) {
        var _aTransAggregations$i, _aTransAggregations$i2, _aTransAggregations$i3, _aTransAggregations$i4, _aTransAggregations$i5, _aTransAggregations$i6;
        mTransAggregations[aTransAggregations[i].Name] = {
          name: aTransAggregations[i].Name,
          propertyPath: aTransAggregations[i].AggregatableProperty.valueOf().value,
          aggregationMethod: aTransAggregations[i].AggregationMethod,
          label: (_aTransAggregations$i = aTransAggregations[i]) !== null && _aTransAggregations$i !== void 0 && (_aTransAggregations$i2 = _aTransAggregations$i.annotations) !== null && _aTransAggregations$i2 !== void 0 && (_aTransAggregations$i3 = _aTransAggregations$i2.Common) !== null && _aTransAggregations$i3 !== void 0 && _aTransAggregations$i3.Label ? (_aTransAggregations$i4 = aTransAggregations[i]) === null || _aTransAggregations$i4 === void 0 ? void 0 : (_aTransAggregations$i5 = _aTransAggregations$i4.annotations) === null || _aTransAggregations$i5 === void 0 ? void 0 : (_aTransAggregations$i6 = _aTransAggregations$i5.Common) === null || _aTransAggregations$i6 === void 0 ? void 0 : _aTransAggregations$i6.Label.toString() : `${oResourceBundleCore.getText("AGGREGATABLE_PROPERTY")} (${aTransAggregations[i].Name})`,
          sortable: true,
          sortOrder: "both",
          custom: false
        };
      }
    }
    const aAggProps = aggregationHelper.getAggregatableProperties();
    const aGrpProps = aggregationHelper.getGroupableProperties();
    const mApplySupported = {};
    mApplySupported.$Type = "Org.OData.Aggregation.V1.ApplySupportedType";
    mApplySupported.AggregatableProperties = [];
    mApplySupported.GroupableProperties = [];
    for (let i = 0; aAggProps && i < aAggProps.length; i++) {
      var _aAggProps$i, _aAggProps$i2, _aAggProps$i2$Propert;
      const obj = {
        $Type: (_aAggProps$i = aAggProps[i]) === null || _aAggProps$i === void 0 ? void 0 : _aAggProps$i.$Type,
        Property: {
          $PropertyPath: (_aAggProps$i2 = aAggProps[i]) === null || _aAggProps$i2 === void 0 ? void 0 : (_aAggProps$i2$Propert = _aAggProps$i2.Property) === null || _aAggProps$i2$Propert === void 0 ? void 0 : _aAggProps$i2$Propert.value
        }
      };
      mApplySupported.AggregatableProperties.push(obj);
    }
    for (let i = 0; aGrpProps && i < aGrpProps.length; i++) {
      var _aGrpProps$i;
      const obj = {
        $PropertyPath: (_aGrpProps$i = aGrpProps[i]) === null || _aGrpProps$i === void 0 ? void 0 : _aGrpProps$i.value
      };
      mApplySupported.GroupableProperties.push(obj);
    }
    const chartActions = getChartActions(chartAnnotation, visualizationPath, converterContext);
    let [navigationPropertyPath /*, annotationPath*/] = visualizationPath.split("@");
    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }
    const title = chartAnnotation.Title; // read title from chart annotation
    const dataModelPath = converterContext.getDataModelObjectPath();
    const isEntitySet = navigationPropertyPath.length === 0;
    const entityName = dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
    const sFilterbarId = isEntitySet ? getFilterBarID(converterContext.getContextPath()) : undefined;
    const oVizProperties = {
      legendGroup: {
        layout: {
          position: "bottom"
        }
      }
    };
    let autoBindOnInit;
    if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
      autoBindOnInit = true;
    } else if (converterContext.getTemplateType() === TemplateType.ListReport || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
      autoBindOnInit = false;
    }
    const hasMultipleVisualizations = converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === "AnalyticalListPage";
    const onSegmentedButtonPressed = hasMultipleVisualizations ? ".handlers.onSegmentedButtonPressed" : "";
    const visible = hasMultipleVisualizations ? "{= ${pageInternal>alpContentView} !== 'Table'}" : "true";
    const allowedTransformations = aggregationHelper.getAllowedTransformations();
    mApplySupported.enableSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;
    let qualifier = "";
    if (chartAnnotation.fullyQualifiedName.split("#").length > 1) {
      qualifier = chartAnnotation.fullyQualifiedName.split("#")[1];
    }
    return {
      type: VisualizationType.Chart,
      id: qualifier ? getChartID(isEntitySet ? entityName : navigationPropertyPath, qualifier, VisualizationType.Chart) : getChartID(isEntitySet ? entityName : navigationPropertyPath, VisualizationType.Chart),
      collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      entityName: entityName,
      personalization: getP13nMode(visualizationPath, converterContext),
      navigationPath: navigationPropertyPath,
      annotationPath: converterContext.getAbsoluteAnnotationPath(visualizationPath),
      filterId: sFilterbarId,
      vizProperties: JSON.stringify(oVizProperties),
      actions: chartActions.actions,
      commandActions: chartActions.commandActions,
      title: title,
      autoBindOnInit: autoBindOnInit,
      onSegmentedButtonPressed: onSegmentedButtonPressed,
      visible: visible,
      customAgg: mCustomAggregates,
      transAgg: mTransAggregations,
      applySupported: mApplySupported,
      variantManagement: findVariantManagement(p13nMode, variantManagement)
    };
  }
  /**
   * Method to determine variant management.
   *
   * @param p13nMode
   * @param variantManagement
   * @returns The variant management for chart
   */
  _exports.createChartVisualization = createChartVisualization;
  function findVariantManagement(p13nMode, variantManagement) {
    return variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement;
  }

  /**
   * Method to get compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation.
   *
   * @param dataField
   * @param converterContext
   * @returns Compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation
   */
  function getCompileExpressionForAction(dataField, converterContext) {
    var _dataField$annotation4, _dataField$annotation5;
    return compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation4 = dataField.annotations) === null || _dataField$annotation4 === void 0 ? void 0 : (_dataField$annotation5 = _dataField$annotation4.UI) === null || _dataField$annotation5 === void 0 ? void 0 : _dataField$annotation5.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true)));
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDaGFydEFjdGlvbnNGcm9tQW5ub3RhdGlvbnMiLCJjaGFydEFubm90YXRpb24iLCJ2aXN1YWxpemF0aW9uUGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJjaGFydEFjdGlvbnMiLCJhQWN0aW9ucyIsIkFjdGlvbnMiLCJmb3JFYWNoIiwiZGF0YUZpZWxkIiwiY2hhcnRBY3Rpb24iLCJpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IiwiYW5ub3RhdGlvbnMiLCJVSSIsIkhpZGRlbiIsInZhbHVlT2YiLCJJbmxpbmUiLCJEZXRlcm1pbmluZyIsIkFjdGlvblRhcmdldCIsImlzQm91bmQiLCJrZXkiLCJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCIkVHlwZSIsInR5cGUiLCJBY3Rpb25UeXBlIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwidmlzaWJsZSIsImdldENvbXBpbGVFeHByZXNzaW9uRm9yQWN0aW9uIiwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiaXNOYXZpZ2FibGUiLCJwdXNoIiwiZ2V0Q2hhcnRBY3Rpb25zIiwiYUFubm90YXRpb25BY3Rpb25zIiwibWFuaWZlc3RBY3Rpb25zIiwiZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdCIsImdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24iLCJhY3Rpb25zIiwiYWN0aW9uT3ZlcndyaXRlQ29uZmlnIiwiZW5hYmxlZCIsIk92ZXJyaWRlVHlwZSIsIm92ZXJ3cml0ZSIsImVuYWJsZU9uU2VsZWN0IiwiY29tbWFuZCIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiY29tbWFuZEFjdGlvbnMiLCJnZXRQMTNuTW9kZSIsImNoYXJ0TWFuaWZlc3RTZXR0aW5ncyIsInBlcnNvbmFsaXphdGlvbiIsImFQZXJzb25hbGl6YXRpb24iLCJjaGFydFNldHRpbmdzIiwidW5kZWZpbmVkIiwiaXRlbSIsInNvcnQiLCJqb2luIiwiY3JlYXRlQ2hhcnRWaXN1YWxpemF0aW9uIiwiZG9Ob3RDaGVja0FwcGx5U3VwcG9ydGVkIiwiYWdncmVnYXRpb25IZWxwZXIiLCJBZ2dyZWdhdGlvbkhlbHBlciIsImdldEVudGl0eVR5cGUiLCJpc0FuYWx5dGljc1N1cHBvcnRlZCIsIkVycm9yIiwiYVRyYW5zQWdncmVnYXRpb25zIiwiZ2V0VHJhbnNBZ2dyZWdhdGlvbnMiLCJhQ3VzdG9tQWdncmVnYXRlcyIsImdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zIiwibUN1c3RvbUFnZ3JlZ2F0ZXMiLCJwYWdlTWFuaWZlc3RTZXR0aW5ncyIsImdldE1hbmlmZXN0V3JhcHBlciIsInZhcmlhbnRNYW5hZ2VtZW50IiwiZ2V0VmFyaWFudE1hbmFnZW1lbnQiLCJwMTNuTW9kZSIsIkxvZyIsIndhcm5pbmciLCJlbnRpdHlUeXBlIiwiY3VzdG9tQWdncmVnYXRlIiwiYUNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMiLCJBZ2dyZWdhdGlvbiIsIkNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMiLCJxdWFsaWZpZXIiLCJyZWxhdGVkQ3VzdG9tQWdncmVnYXRlUHJvcGVydHkiLCJlbnRpdHlQcm9wZXJ0aWVzIiwiZmluZCIsInByb3BlcnR5IiwibmFtZSIsImxhYmVsIiwiQ29tbW9uIiwiTGFiZWwiLCJ0b1N0cmluZyIsInNvcnRhYmxlIiwic29ydE9yZGVyIiwiY29udGV4dERlZmluaW5nUHJvcGVydHkiLCJtYXAiLCJvQ3R4RGVmUHJvcGVydHkiLCJ2YWx1ZSIsIm1UcmFuc0FnZ3JlZ2F0aW9ucyIsIm9SZXNvdXJjZUJ1bmRsZUNvcmUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiaSIsImxlbmd0aCIsIk5hbWUiLCJwcm9wZXJ0eVBhdGgiLCJBZ2dyZWdhdGFibGVQcm9wZXJ0eSIsImFnZ3JlZ2F0aW9uTWV0aG9kIiwiQWdncmVnYXRpb25NZXRob2QiLCJnZXRUZXh0IiwiY3VzdG9tIiwiYUFnZ1Byb3BzIiwiZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllcyIsImFHcnBQcm9wcyIsImdldEdyb3VwYWJsZVByb3BlcnRpZXMiLCJtQXBwbHlTdXBwb3J0ZWQiLCJBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIiwiR3JvdXBhYmxlUHJvcGVydGllcyIsIm9iaiIsIlByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIm5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJzcGxpdCIsImxhc3RJbmRleE9mIiwic3Vic3RyIiwidGl0bGUiLCJUaXRsZSIsImRhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwiaXNFbnRpdHlTZXQiLCJlbnRpdHlOYW1lIiwidGFyZ2V0RW50aXR5U2V0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJzRmlsdGVyYmFySWQiLCJnZXRGaWx0ZXJCYXJJRCIsImdldENvbnRleHRQYXRoIiwib1ZpelByb3BlcnRpZXMiLCJsZWdlbmRHcm91cCIsImxheW91dCIsInBvc2l0aW9uIiwiYXV0b0JpbmRPbkluaXQiLCJnZXRUZW1wbGF0ZVR5cGUiLCJUZW1wbGF0ZVR5cGUiLCJPYmplY3RQYWdlIiwiTGlzdFJlcG9ydCIsIkFuYWx5dGljYWxMaXN0UGFnZSIsImhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMiLCJvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQiLCJhbGxvd2VkVHJhbnNmb3JtYXRpb25zIiwiZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucyIsImVuYWJsZVNlYXJjaCIsImluZGV4T2YiLCJWaXN1YWxpemF0aW9uVHlwZSIsIkNoYXJ0IiwiaWQiLCJnZXRDaGFydElEIiwiY29sbGVjdGlvbiIsImdldFRhcmdldE9iamVjdFBhdGgiLCJuYXZpZ2F0aW9uUGF0aCIsImdldEFic29sdXRlQW5ub3RhdGlvblBhdGgiLCJmaWx0ZXJJZCIsInZpelByb3BlcnRpZXMiLCJKU09OIiwic3RyaW5naWZ5IiwiY3VzdG9tQWdnIiwidHJhbnNBZ2ciLCJhcHBseVN1cHBvcnRlZCIsImZpbmRWYXJpYW50TWFuYWdlbWVudCIsIlZhcmlhbnRNYW5hZ2VtZW50VHlwZSIsIk5vbmUiLCJjb21waWxlRXhwcmVzc2lvbiIsIm5vdCIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiZ2V0UmVsYXRpdmVNb2RlbFBhdGhGdW5jdGlvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDaGFydCwgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEFubm90YXRpb25BY3Rpb24sXG5cdEJhc2VBY3Rpb24sXG5cdENvbWJpbmVkQWN0aW9uLFxuXHRDdXN0b21BY3Rpb24sXG5cdE92ZXJyaWRlVHlwZUFjdGlvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHsgaW5zZXJ0Q3VzdG9tRWxlbWVudHMsIE92ZXJyaWRlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGVxdWFsLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sIG5vdCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IEFnZ3JlZ2F0aW9uSGVscGVyIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IGdldENoYXJ0SUQsIGdldEZpbHRlckJhcklEIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB0eXBlIHsgQ2hhcnRNYW5pZmVzdENvbmZpZ3VyYXRpb24sIENoYXJ0UGVyc29uYWxpemF0aW9uTWFuaWZlc3RTZXR0aW5ncyB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBBY3Rpb25UeXBlLCBUZW1wbGF0ZVR5cGUsIFZhcmlhbnRNYW5hZ2VtZW50VHlwZSwgVmlzdWFsaXphdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHR5cGUgTWFuaWZlc3RXcmFwcGVyIGZyb20gXCIuLi8uLi9NYW5pZmVzdFdyYXBwZXJcIjtcblxuLyoqXG4gKiBAdHlwZWRlZiBDaGFydFZpc3VhbGl6YXRpb25cbiAqL1xuZXhwb3J0IHR5cGUgQ2hhcnRWaXN1YWxpemF0aW9uID0ge1xuXHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5DaGFydDtcblx0aWQ6IHN0cmluZztcblx0Y29sbGVjdGlvbjogc3RyaW5nO1xuXHRlbnRpdHlOYW1lOiBzdHJpbmc7XG5cdHBlcnNvbmFsaXphdGlvbj86IHN0cmluZztcblx0bmF2aWdhdGlvblBhdGg6IHN0cmluZztcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0ZmlsdGVySWQ/OiBzdHJpbmc7XG5cdHZpelByb3BlcnRpZXM6IHN0cmluZztcblx0YWN0aW9uczogQmFzZUFjdGlvbltdO1xuXHRjb21tYW5kQWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPjtcblx0dGl0bGU6IHN0cmluZztcblx0YXV0b0JpbmRPbkluaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZDogc3RyaW5nO1xuXHR2aXNpYmxlOiBzdHJpbmc7XG5cdGN1c3RvbUFnZzogb2JqZWN0O1xuXHR0cmFuc0FnZzogb2JqZWN0O1xuXHRhcHBseVN1cHBvcnRlZDoge1xuXHRcdCRUeXBlOiBzdHJpbmc7XG5cdFx0ZW5hYmxlU2VhcmNoOiBib29sZWFuO1xuXHRcdEFnZ3JlZ2F0YWJsZVByb3BlcnRpZXM6IGFueVtdO1xuXHRcdEdyb3VwYWJsZVByb3BlcnRpZXM6IGFueVtdO1xuXHR9O1xuXHRtdWx0aVZpZXdzPzogYm9vbGVhbjtcblx0dmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50VHlwZTtcbn07XG5cbi8qKlxuICogTWV0aG9kIHRvIHJldHJpZXZlIGFsbCBjaGFydCBhY3Rpb25zIGZyb20gYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNoYXJ0QW5ub3RhdGlvblxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgVGhlIHRhYmxlIGFubm90YXRpb24gYWN0aW9uc1xuICovXG5mdW5jdGlvbiBnZXRDaGFydEFjdGlvbnNGcm9tQW5ub3RhdGlvbnMoXG5cdGNoYXJ0QW5ub3RhdGlvbjogQ2hhcnQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEJhc2VBY3Rpb25bXSB7XG5cdGNvbnN0IGNoYXJ0QWN0aW9uczogQmFzZUFjdGlvbltdID0gW107XG5cdGlmIChjaGFydEFubm90YXRpb24pIHtcblx0XHRjb25zdCBhQWN0aW9ucyA9IGNoYXJ0QW5ub3RhdGlvbi5BY3Rpb25zIHx8IFtdO1xuXHRcdGFBY3Rpb25zLmZvckVhY2goKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdFx0bGV0IGNoYXJ0QWN0aW9uOiBBbm5vdGF0aW9uQWN0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0KGRhdGFGaWVsZCkgJiZcblx0XHRcdFx0IShkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkgJiZcblx0XHRcdFx0IWRhdGFGaWVsZC5JbmxpbmUgJiZcblx0XHRcdFx0IWRhdGFGaWVsZC5EZXRlcm1pbmluZyAmJlxuXHRcdFx0XHQhKGRhdGFGaWVsZCBhcyBhbnkpPy5BY3Rpb25UYXJnZXQ/LmlzQm91bmRcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBrZXkgPSBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCk7XG5cdFx0XHRcdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRcdFx0XHRjaGFydEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JBY3Rpb24sXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdFx0XHRcdGtleToga2V5LFxuXHRcdFx0XHRcdFx0XHR2aXNpYmxlOiBnZXRDb21waWxlRXhwcmVzc2lvbkZvckFjdGlvbihkYXRhRmllbGQsIGNvbnZlcnRlckNvbnRleHQpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdFx0XHRcdGNoYXJ0QWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0XHRcdFx0a2V5OiBrZXksXG5cdFx0XHRcdFx0XHRcdHZpc2libGU6IGdldENvbXBpbGVFeHByZXNzaW9uRm9yQWN0aW9uKGRhdGFGaWVsZCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRcdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChjaGFydEFjdGlvbikge1xuXHRcdFx0XHRjaGFydEFjdGlvbnMucHVzaChjaGFydEFjdGlvbik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNoYXJ0QWN0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENoYXJ0QWN0aW9ucyhjaGFydEFubm90YXRpb246IENoYXJ0LCB2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tYmluZWRBY3Rpb24ge1xuXHRjb25zdCBhQW5ub3RhdGlvbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IGdldENoYXJ0QWN0aW9uc0Zyb21Bbm5vdGF0aW9ucyhjaGFydEFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgbWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpLmFjdGlvbnMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRhQW5ub3RhdGlvbkFjdGlvbnNcblx0KTtcblx0Y29uc3QgYWN0aW9uT3ZlcndyaXRlQ29uZmlnOiBPdmVycmlkZVR5cGVBY3Rpb24gPSB7XG5cdFx0ZW5hYmxlZDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRlbmFibGVPblNlbGVjdDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHR2aXNpYmxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGNvbW1hbmQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGVcblx0fTtcblx0Y29uc3QgY2hhcnRBY3Rpb25zID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoYUFubm90YXRpb25BY3Rpb25zLCBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucywgYWN0aW9uT3ZlcndyaXRlQ29uZmlnKTtcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zOiBjaGFydEFjdGlvbnMsXG5cdFx0Y29tbWFuZEFjdGlvbnM6IG1hbmlmZXN0QWN0aW9ucy5jb21tYW5kQWN0aW9uc1xuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDEzbk1vZGUodmlzdWFsaXphdGlvblBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IGNoYXJ0TWFuaWZlc3RTZXR0aW5nczogQ2hhcnRNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpO1xuXHRsZXQgcGVyc29uYWxpemF0aW9uOiBDaGFydFBlcnNvbmFsaXphdGlvbk1hbmlmZXN0U2V0dGluZ3MgPSB0cnVlO1xuXHRjb25zdCBhUGVyc29uYWxpemF0aW9uOiBzdHJpbmdbXSA9IFtdO1xuXHRpZiAoY2hhcnRNYW5pZmVzdFNldHRpbmdzPy5jaGFydFNldHRpbmdzPy5wZXJzb25hbGl6YXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdHBlcnNvbmFsaXphdGlvbiA9IGNoYXJ0TWFuaWZlc3RTZXR0aW5ncy5jaGFydFNldHRpbmdzLnBlcnNvbmFsaXphdGlvbjtcblx0fVxuXHRpZiAocGVyc29uYWxpemF0aW9uKSB7XG5cdFx0Ly9WYXJpYW50IE1hbmFnZW1lbnQgc2hvdWxkIGJlIGVuYWJsZWQgd2hlbiBwZXJzb25hbGl6YXRpb24gaXMgZW5hYmxlZC4gSXJyZXNwZWN0aXZlIG9mIHdoZWF0aGVyIG9yIG5vdCB2YXJpYW50IG1hbmFnZW1lbnQgaXMgZW5hYmxlZCwgcGVyc29uYWxpemF0aW9uIHNob3VsZCBiZSBlbmFibGVkLlxuXHRcdGlmIChwZXJzb25hbGl6YXRpb24gPT09IHRydWUpIHtcblx0XHRcdHJldHVybiBcIlNvcnQsVHlwZSxJdGVtXCI7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgcGVyc29uYWxpemF0aW9uID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLnR5cGUpIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiVHlwZVwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24uaXRlbSkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJJdGVtXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5zb3J0KSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIlNvcnRcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYVBlcnNvbmFsaXphdGlvbi5qb2luKFwiLFwiKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgdGhlIENoYXJ0VmlzdWFsaXphdGlvbiBjb25maWd1cmF0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGRpc3BsYXkgYSBjaGFydCB1c2luZyB0aGUgQ2hhcnQgYnVpbGRpbmcgYmxvY2suXG4gKlxuICogQHBhcmFtIGNoYXJ0QW5ub3RhdGlvbiBUaGUgdGFyZ2V0IGNoYXJ0IGFubm90YXRpb25cbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aCBUaGUgY3VycmVudCB2aXN1YWxpemF0aW9uIGFubm90YXRpb24gcGF0aFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gZG9Ob3RDaGVja0FwcGx5U3VwcG9ydGVkIEZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBhcHBseXN1cHBvcnRlZCBuZWVkcyB0byBiZSBjaGVja2VkIG9yIG5vdFxuICogQHJldHVybnMgVGhlIGNoYXJ0IHZpc3VhbGl6YXRpb24gYmFzZWQgb24gdGhlIGFubm90YXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNoYXJ0VmlzdWFsaXphdGlvbihcblx0Y2hhcnRBbm5vdGF0aW9uOiBDaGFydCxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZG9Ob3RDaGVja0FwcGx5U3VwcG9ydGVkPzogYm9vbGVhblxuKTogQ2hhcnRWaXN1YWxpemF0aW9uIHtcblx0Y29uc3QgYWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIoY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksIGNvbnZlcnRlckNvbnRleHQpO1xuXHRpZiAoIWRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZCAmJiAhYWdncmVnYXRpb25IZWxwZXIuaXNBbmFseXRpY3NTdXBwb3J0ZWQoKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkFwcGx5U3VwcG9ydGVkIGlzIG5vdCBhZGRlZCB0byB0aGUgYW5ub3RhdGlvbnNcIik7XG5cdH1cblx0Y29uc3QgYVRyYW5zQWdncmVnYXRpb25zID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0VHJhbnNBZ2dyZWdhdGlvbnMoKTtcblx0Y29uc3QgYUN1c3RvbUFnZ3JlZ2F0ZXMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucygpO1xuXHRjb25zdCBtQ3VzdG9tQWdncmVnYXRlcyA9IHt9IGFzIGFueTtcblx0Y29uc3QgcGFnZU1hbmlmZXN0U2V0dGluZ3M6IE1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudFR5cGUgPSBwYWdlTWFuaWZlc3RTZXR0aW5ncy5nZXRWYXJpYW50TWFuYWdlbWVudCgpO1xuXHRjb25zdCBwMTNuTW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gZ2V0UDEzbk1vZGUodmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRpZiAocDEzbk1vZGUgPT09IHVuZGVmaW5lZCAmJiB2YXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIpIHtcblx0XHRMb2cud2FybmluZyhcIlZhcmlhbnQgTWFuYWdlbWVudCBjYW5ub3QgYmUgZW5hYmxlZCB3aGVuIHBlcnNvbmFsaXphdGlvbiBpcyBkaXNhYmxlZFwiKTtcblx0fVxuXHRpZiAoYUN1c3RvbUFnZ3JlZ2F0ZXMpIHtcblx0XHRjb25zdCBlbnRpdHlUeXBlID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0RW50aXR5VHlwZSgpO1xuXHRcdGZvciAoY29uc3QgY3VzdG9tQWdncmVnYXRlIG9mIGFDdXN0b21BZ2dyZWdhdGVzKSB7XG5cdFx0XHRjb25zdCBhQ29udGV4dERlZmluaW5nUHJvcGVydGllcyA9IGN1c3RvbUFnZ3JlZ2F0ZT8uYW5ub3RhdGlvbnM/LkFnZ3JlZ2F0aW9uPy5Db250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzO1xuXHRcdFx0Y29uc3QgcXVhbGlmaWVyID0gY3VzdG9tQWdncmVnYXRlPy5xdWFsaWZpZXI7XG5cdFx0XHRjb25zdCByZWxhdGVkQ3VzdG9tQWdncmVnYXRlUHJvcGVydHkgPSBxdWFsaWZpZXIgJiYgZW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLmZpbmQoKHByb3BlcnR5KSA9PiBwcm9wZXJ0eS5uYW1lID09PSBxdWFsaWZpZXIpO1xuXHRcdFx0Y29uc3QgbGFiZWwgPSByZWxhdGVkQ3VzdG9tQWdncmVnYXRlUHJvcGVydHkgJiYgcmVsYXRlZEN1c3RvbUFnZ3JlZ2F0ZVByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbD8udG9TdHJpbmcoKTtcblx0XHRcdG1DdXN0b21BZ2dyZWdhdGVzW3F1YWxpZmllcl0gPSB7XG5cdFx0XHRcdG5hbWU6IHF1YWxpZmllcixcblx0XHRcdFx0bGFiZWw6IGxhYmVsIHx8IGBDdXN0b20gQWdncmVnYXRlICgke3F1YWxpZmllcn0pYCxcblx0XHRcdFx0c29ydGFibGU6IHRydWUsXG5cdFx0XHRcdHNvcnRPcmRlcjogXCJib3RoXCIsXG5cdFx0XHRcdGNvbnRleHREZWZpbmluZ1Byb3BlcnR5OiBhQ29udGV4dERlZmluaW5nUHJvcGVydGllc1xuXHRcdFx0XHRcdD8gYUNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMubWFwKChvQ3R4RGVmUHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9DdHhEZWZQcm9wZXJ0eS52YWx1ZTtcblx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0OiBbXVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBtVHJhbnNBZ2dyZWdhdGlvbnMgPSB7fSBhcyBhbnk7XG5cdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZUNvcmUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRpZiAoYVRyYW5zQWdncmVnYXRpb25zKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhVHJhbnNBZ2dyZWdhdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdG1UcmFuc0FnZ3JlZ2F0aW9uc1thVHJhbnNBZ2dyZWdhdGlvbnNbaV0uTmFtZV0gPSB7XG5cdFx0XHRcdG5hbWU6IGFUcmFuc0FnZ3JlZ2F0aW9uc1tpXS5OYW1lLFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGg6IGFUcmFuc0FnZ3JlZ2F0aW9uc1tpXS5BZ2dyZWdhdGFibGVQcm9wZXJ0eS52YWx1ZU9mKCkudmFsdWUsXG5cdFx0XHRcdGFnZ3JlZ2F0aW9uTWV0aG9kOiBhVHJhbnNBZ2dyZWdhdGlvbnNbaV0uQWdncmVnYXRpb25NZXRob2QsXG5cdFx0XHRcdGxhYmVsOiBhVHJhbnNBZ2dyZWdhdGlvbnNbaV0/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsXG5cdFx0XHRcdFx0PyBhVHJhbnNBZ2dyZWdhdGlvbnNbaV0/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsLnRvU3RyaW5nKClcblx0XHRcdFx0XHQ6IGAke29SZXNvdXJjZUJ1bmRsZUNvcmUuZ2V0VGV4dChcIkFHR1JFR0FUQUJMRV9QUk9QRVJUWVwiKX0gKCR7YVRyYW5zQWdncmVnYXRpb25zW2ldLk5hbWV9KWAsXG5cdFx0XHRcdHNvcnRhYmxlOiB0cnVlLFxuXHRcdFx0XHRzb3J0T3JkZXI6IFwiYm90aFwiLFxuXHRcdFx0XHRjdXN0b206IGZhbHNlXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGFBZ2dQcm9wcyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMoKTtcblx0Y29uc3QgYUdycFByb3BzID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0R3JvdXBhYmxlUHJvcGVydGllcygpO1xuXHRjb25zdCBtQXBwbHlTdXBwb3J0ZWQgPSB7fSBhcyBhbnk7XG5cdG1BcHBseVN1cHBvcnRlZC4kVHlwZSA9IFwiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkFwcGx5U3VwcG9ydGVkVHlwZVwiO1xuXHRtQXBwbHlTdXBwb3J0ZWQuQWdncmVnYXRhYmxlUHJvcGVydGllcyA9IFtdO1xuXHRtQXBwbHlTdXBwb3J0ZWQuR3JvdXBhYmxlUHJvcGVydGllcyA9IFtdO1xuXG5cdGZvciAobGV0IGkgPSAwOyBhQWdnUHJvcHMgJiYgaSA8IGFBZ2dQcm9wcy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IG9iaiA9IHtcblx0XHRcdCRUeXBlOiBhQWdnUHJvcHNbaV0/LiRUeXBlLFxuXHRcdFx0UHJvcGVydHk6IHtcblx0XHRcdFx0JFByb3BlcnR5UGF0aDogYUFnZ1Byb3BzW2ldPy5Qcm9wZXJ0eT8udmFsdWVcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0bUFwcGx5U3VwcG9ydGVkLkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMucHVzaChvYmopO1xuXHR9XG5cblx0Zm9yIChsZXQgaSA9IDA7IGFHcnBQcm9wcyAmJiBpIDwgYUdycFByb3BzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3Qgb2JqID0geyAkUHJvcGVydHlQYXRoOiBhR3JwUHJvcHNbaV0/LnZhbHVlIH07XG5cblx0XHRtQXBwbHlTdXBwb3J0ZWQuR3JvdXBhYmxlUHJvcGVydGllcy5wdXNoKG9iaik7XG5cdH1cblxuXHRjb25zdCBjaGFydEFjdGlvbnMgPSBnZXRDaGFydEFjdGlvbnMoY2hhcnRBbm5vdGF0aW9uLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCk7XG5cdGxldCBbbmF2aWdhdGlvblByb3BlcnR5UGF0aCAvKiwgYW5ub3RhdGlvblBhdGgqL10gPSB2aXN1YWxpemF0aW9uUGF0aC5zcGxpdChcIkBcIik7XG5cdGlmIChuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSA9PT0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggLSAxKSB7XG5cdFx0Ly8gRHJvcCB0cmFpbGluZyBzbGFzaFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLnN1YnN0cigwLCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpO1xuXHR9XG5cdGNvbnN0IHRpdGxlOiBhbnkgPSBjaGFydEFubm90YXRpb24uVGl0bGU7IC8vIHJlYWQgdGl0bGUgZnJvbSBjaGFydCBhbm5vdGF0aW9uXG5cdGNvbnN0IGRhdGFNb2RlbFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0Y29uc3QgaXNFbnRpdHlTZXQ6IGJvb2xlYW4gPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCA9PT0gMDtcblx0Y29uc3QgZW50aXR5TmFtZTogc3RyaW5nID0gZGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQgPyBkYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldC5uYW1lIDogZGF0YU1vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lO1xuXHRjb25zdCBzRmlsdGVyYmFySWQgPSBpc0VudGl0eVNldCA/IGdldEZpbHRlckJhcklEKGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKSkgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IG9WaXpQcm9wZXJ0aWVzID0ge1xuXHRcdGxlZ2VuZEdyb3VwOiB7XG5cdFx0XHRsYXlvdXQ6IHtcblx0XHRcdFx0cG9zaXRpb246IFwiYm90dG9tXCJcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdGxldCBhdXRvQmluZE9uSW5pdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlKSB7XG5cdFx0YXV0b0JpbmRPbkluaXQgPSB0cnVlO1xuXHR9IGVsc2UgaWYgKFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0IHx8XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZVxuXHQpIHtcblx0XHRhdXRvQmluZE9uSW5pdCA9IGZhbHNlO1xuXHR9XG5cdGNvbnN0IGhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMgPVxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucygpIHx8IGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFwiQW5hbHl0aWNhbExpc3RQYWdlXCI7XG5cdGNvbnN0IG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCA9IGhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMgPyBcIi5oYW5kbGVycy5vblNlZ21lbnRlZEJ1dHRvblByZXNzZWRcIiA6IFwiXCI7XG5cdGNvbnN0IHZpc2libGUgPSBoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zID8gXCJ7PSAke3BhZ2VJbnRlcm5hbD5hbHBDb250ZW50Vmlld30gIT09ICdUYWJsZSd9XCIgOiBcInRydWVcIjtcblx0Y29uc3QgYWxsb3dlZFRyYW5zZm9ybWF0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMoKTtcblx0bUFwcGx5U3VwcG9ydGVkLmVuYWJsZVNlYXJjaCA9IGFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMgPyBhbGxvd2VkVHJhbnNmb3JtYXRpb25zLmluZGV4T2YoXCJzZWFyY2hcIikgPj0gMCA6IHRydWU7XG5cdGxldCBxdWFsaWZpZXI6IHN0cmluZyA9IFwiXCI7XG5cdGlmIChjaGFydEFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KFwiI1wiKS5sZW5ndGggPiAxKSB7XG5cdFx0cXVhbGlmaWVyID0gY2hhcnRBbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdChcIiNcIilbMV07XG5cdH1cblx0cmV0dXJuIHtcblx0XHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCxcblx0XHRpZDogcXVhbGlmaWVyXG5cdFx0XHQ/IGdldENoYXJ0SUQoaXNFbnRpdHlTZXQgPyBlbnRpdHlOYW1lIDogbmF2aWdhdGlvblByb3BlcnR5UGF0aCwgcXVhbGlmaWVyLCBWaXN1YWxpemF0aW9uVHlwZS5DaGFydClcblx0XHRcdDogZ2V0Q2hhcnRJRChpc0VudGl0eVNldCA/IGVudGl0eU5hbWUgOiBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCksXG5cdFx0Y29sbGVjdGlvbjogZ2V0VGFyZ2V0T2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSksXG5cdFx0ZW50aXR5TmFtZTogZW50aXR5TmFtZSxcblx0XHRwZXJzb25hbGl6YXRpb246IGdldFAxM25Nb2RlKHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRuYXZpZ2F0aW9uUGF0aDogbmF2aWdhdGlvblByb3BlcnR5UGF0aCxcblx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKHZpc3VhbGl6YXRpb25QYXRoKSxcblx0XHRmaWx0ZXJJZDogc0ZpbHRlcmJhcklkLFxuXHRcdHZpelByb3BlcnRpZXM6IEpTT04uc3RyaW5naWZ5KG9WaXpQcm9wZXJ0aWVzKSxcblx0XHRhY3Rpb25zOiBjaGFydEFjdGlvbnMuYWN0aW9ucyxcblx0XHRjb21tYW5kQWN0aW9uczogY2hhcnRBY3Rpb25zLmNvbW1hbmRBY3Rpb25zLFxuXHRcdHRpdGxlOiB0aXRsZSxcblx0XHRhdXRvQmluZE9uSW5pdDogYXV0b0JpbmRPbkluaXQsXG5cdFx0b25TZWdtZW50ZWRCdXR0b25QcmVzc2VkOiBvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQsXG5cdFx0dmlzaWJsZTogdmlzaWJsZSxcblx0XHRjdXN0b21BZ2c6IG1DdXN0b21BZ2dyZWdhdGVzLFxuXHRcdHRyYW5zQWdnOiBtVHJhbnNBZ2dyZWdhdGlvbnMsXG5cdFx0YXBwbHlTdXBwb3J0ZWQ6IG1BcHBseVN1cHBvcnRlZCxcblx0XHR2YXJpYW50TWFuYWdlbWVudDogZmluZFZhcmlhbnRNYW5hZ2VtZW50KHAxM25Nb2RlLCB2YXJpYW50TWFuYWdlbWVudClcblx0fTtcbn1cbi8qKlxuICogTWV0aG9kIHRvIGRldGVybWluZSB2YXJpYW50IG1hbmFnZW1lbnQuXG4gKlxuICogQHBhcmFtIHAxM25Nb2RlXG4gKiBAcGFyYW0gdmFyaWFudE1hbmFnZW1lbnRcbiAqIEByZXR1cm5zIFRoZSB2YXJpYW50IG1hbmFnZW1lbnQgZm9yIGNoYXJ0XG4gKi9cbmZ1bmN0aW9uIGZpbmRWYXJpYW50TWFuYWdlbWVudChwMTNuTW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkLCB2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnRUeXBlKSB7XG5cdHJldHVybiB2YXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIgJiYgIXAxM25Nb2RlID8gVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmUgOiB2YXJpYW50TWFuYWdlbWVudDtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gZ2V0IGNvbXBpbGUgZXhwcmVzc2lvbiBmb3IgRGF0YUZpZWxkRm9yQWN0aW9uIGFuZCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24uXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIENvbXBpbGUgZXhwcmVzc2lvbiBmb3IgRGF0YUZpZWxkRm9yQWN0aW9uIGFuZCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0Q29tcGlsZUV4cHJlc3Npb25Gb3JBY3Rpb24oZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRub3QoXG5cdFx0XHRlcXVhbChcblx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0XHRcdGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbixcblx0XHRcdFx0XHRbXSxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZU1vZGVsUGF0aEZ1bmN0aW9uKClcblx0XHRcdFx0KSxcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0KVxuXHRcdClcblx0KTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0EsOEJBQThCLENBQ3RDQyxlQUFzQixFQUN0QkMsaUJBQXlCLEVBQ3pCQyxnQkFBa0MsRUFDbkI7SUFDZixNQUFNQyxZQUEwQixHQUFHLEVBQUU7SUFDckMsSUFBSUgsZUFBZSxFQUFFO01BQ3BCLE1BQU1JLFFBQVEsR0FBR0osZUFBZSxDQUFDSyxPQUFPLElBQUksRUFBRTtNQUM5Q0QsUUFBUSxDQUFDRSxPQUFPLENBQUVDLFNBQWlDLElBQUs7UUFBQTtRQUN2RCxJQUFJQyxXQUF5QztRQUM3QyxJQUNDQyw0QkFBNEIsQ0FBQ0YsU0FBUyxDQUFDLElBQ3ZDLEVBQUUsMEJBQUFBLFNBQVMsQ0FBQ0csV0FBVyxvRkFBckIsc0JBQXVCQyxFQUFFLHFGQUF6Qix1QkFBMkJDLE1BQU0sMkRBQWpDLHVCQUFtQ0MsT0FBTyxFQUFFLE1BQUssSUFBSSxDQUFDLElBQ3hELENBQUNOLFNBQVMs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