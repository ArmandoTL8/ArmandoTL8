/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Table", "sap/fe/core/converters/controls/ListReport/VisualFilters", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "../../ManifestSettings", "../Common/DataVisualization"], function (Table, VisualFilters, ConfigurableObject, IssueManager, Key, BindingToolkit, ModelHelper, ManifestSettings, DataVisualization) {
  "use strict";

  var _exports = {};
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var AvailabilityType = ManifestSettings.AvailabilityType;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getVisualFilters = VisualFilters.getVisualFilters;
  var isFilteringCaseSensitive = Table.isFilteringCaseSensitive;
  var getTypeConfig = Table.getTypeConfig;
  var getSelectionVariantConfiguration = Table.getSelectionVariantConfiguration;
  var filterFieldType;
  (function (filterFieldType) {
    filterFieldType["Default"] = "Default";
    filterFieldType["Slot"] = "Slot";
  })(filterFieldType || (filterFieldType = {}));
  const sEdmString = "Edm.String";
  const sStringDataType = "sap.ui.model.odata.type.String";
  /**
   * Enter all DataFields of a given FieldGroup into the filterFacetMap.
   *
   * @param fieldGroup
   * @returns The map of facets for the given FieldGroup
   */
  function getFieldGroupFilterGroups(fieldGroup) {
    const filterFacetMap = {};
    fieldGroup.Data.forEach(dataField => {
      if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataField") {
        var _fieldGroup$annotatio, _fieldGroup$annotatio2;
        filterFacetMap[dataField.Value.path] = {
          group: fieldGroup.fullyQualifiedName,
          groupLabel: compileExpression(getExpressionFromAnnotation(fieldGroup.Label || ((_fieldGroup$annotatio = fieldGroup.annotations) === null || _fieldGroup$annotatio === void 0 ? void 0 : (_fieldGroup$annotatio2 = _fieldGroup$annotatio.Common) === null || _fieldGroup$annotatio2 === void 0 ? void 0 : _fieldGroup$annotatio2.Label) || fieldGroup.qualifier)) || fieldGroup.qualifier
        };
      }
    });
    return filterFacetMap;
  }
  function getExcludedFilterProperties(selectionVariants) {
    return selectionVariants.reduce((previousValue, selectionVariant) => {
      selectionVariant.propertyNames.forEach(propertyName => {
        previousValue[propertyName] = true;
      });
      return previousValue;
    }, {});
  }

  /**
   * Check that all the tables for a dedicated entity set are configured as analytical tables.
   *
   * @param listReportTables List report tables
   * @param contextPath
   * @returns Is FilterBar search field hidden or not
   */
  function checkAllTableForEntitySetAreAnalytical(listReportTables, contextPath) {
    if (contextPath && listReportTables.length > 0) {
      return listReportTables.every(visualization => {
        return visualization.enableAnalytics && contextPath === visualization.annotation.collection;
      });
    }
    return false;
  }
  function getSelectionVariants(lrTableVisualizations, converterContext) {
    const selectionVariantPaths = [];
    return lrTableVisualizations.map(visualization => {
      const tableFilters = visualization.control.filters;
      const tableSVConfigs = [];
      for (const key in tableFilters) {
        if (Array.isArray(tableFilters[key].paths)) {
          const paths = tableFilters[key].paths;
          paths.forEach(path => {
            if (path && path.annotationPath && selectionVariantPaths.indexOf(path.annotationPath) === -1) {
              selectionVariantPaths.push(path.annotationPath);
              const selectionVariantConfig = getSelectionVariantConfiguration(path.annotationPath, converterContext);
              if (selectionVariantConfig) {
                tableSVConfigs.push(selectionVariantConfig);
              }
            }
          });
        }
      }
      return tableSVConfigs;
    }).reduce((svConfigs, selectionVariant) => svConfigs.concat(selectionVariant), []);
  }

  /**
   * Returns the condition path required for the condition model. It looks as follows:
   * <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
   *
   * @param entityType The root EntityType
   * @param propertyPath The full path to the target property
   * @returns The formatted condition path
   */
  const _getConditionPath = function (entityType, propertyPath) {
    const parts = propertyPath.split("/");
    let partialPath;
    let key = "";
    while (parts.length) {
      let part = parts.shift();
      partialPath = partialPath ? `${partialPath}/${part}` : part;
      const property = entityType.resolvePath(partialPath);
      if (property._type === "NavigationProperty" && property.isCollection) {
        part += "*";
      }
      key = key ? `${key}/${part}` : part;
    }
    return key;
  };
  const _createFilterSelectionField = function (entityType, property, fullPropertyPath, includeHidden, converterContext) {
    var _property$annotations, _property$annotations2, _property$annotations3;
    // ignore complex property types and hidden annotated ones
    if (property !== undefined && property.targetType === undefined && (includeHidden || ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf()) !== true)) {
      var _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8, _targetEntityType$ann, _targetEntityType$ann2, _targetEntityType$ann3;
      const targetEntityType = converterContext.getAnnotationEntityType(property);
      return {
        key: KeyHelper.getSelectionFieldKeyFromPath(fullPropertyPath),
        annotationPath: converterContext.getAbsoluteAnnotationPath(fullPropertyPath),
        conditionPath: _getConditionPath(entityType, fullPropertyPath),
        availability: ((_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.UI) === null || _property$annotations5 === void 0 ? void 0 : (_property$annotations6 = _property$annotations5.HiddenFilter) === null || _property$annotations6 === void 0 ? void 0 : _property$annotations6.valueOf()) === true ? AvailabilityType.Hidden : AvailabilityType.Adaptation,
        label: compileExpression(getExpressionFromAnnotation(((_property$annotations7 = property.annotations.Common) === null || _property$annotations7 === void 0 ? void 0 : (_property$annotations8 = _property$annotations7.Label) === null || _property$annotations8 === void 0 ? void 0 : _property$annotations8.valueOf()) || property.name)),
        group: targetEntityType.name,
        groupLabel: compileExpression(getExpressionFromAnnotation((targetEntityType === null || targetEntityType === void 0 ? void 0 : (_targetEntityType$ann = targetEntityType.annotations) === null || _targetEntityType$ann === void 0 ? void 0 : (_targetEntityType$ann2 = _targetEntityType$ann.Common) === null || _targetEntityType$ann2 === void 0 ? void 0 : (_targetEntityType$ann3 = _targetEntityType$ann2.Label) === null || _targetEntityType$ann3 === void 0 ? void 0 : _targetEntityType$ann3.valueOf()) || targetEntityType.name))
      };
    }
    return undefined;
  };
  const _getSelectionFields = function (entityType, navigationPath, properties, includeHidden, converterContext) {
    const selectionFieldMap = {};
    if (properties) {
      properties.forEach(property => {
        const propertyPath = property.name;
        const fullPath = (navigationPath ? `${navigationPath}/` : "") + propertyPath;
        const selectionField = _createFilterSelectionField(entityType, property, fullPath, includeHidden, converterContext);
        if (selectionField) {
          selectionFieldMap[fullPath] = selectionField;
        }
      });
    }
    return selectionFieldMap;
  };
  const _getSelectionFieldsByPath = function (entityType, propertyPaths, includeHidden, converterContext) {
    let selectionFields = {};
    if (propertyPaths) {
      propertyPaths.forEach(propertyPath => {
        let localSelectionFields;
        const property = entityType.resolvePath(propertyPath);
        if (property === undefined) {
          return;
        }
        if (property._type === "NavigationProperty") {
          // handle navigation properties
          localSelectionFields = _getSelectionFields(entityType, propertyPath, property.targetType.entityProperties, includeHidden, converterContext);
        } else if (property.targetType !== undefined && property.targetType._type === "ComplexType") {
          // handle ComplexType properties
          localSelectionFields = _getSelectionFields(entityType, propertyPath, property.targetType.properties, includeHidden, converterContext);
        } else {
          const navigationPath = propertyPath.includes("/") ? propertyPath.split("/").splice(0, 1).join("/") : "";
          localSelectionFields = _getSelectionFields(entityType, navigationPath, [property], includeHidden, converterContext);
        }
        selectionFields = {
          ...selectionFields,
          ...localSelectionFields
        };
      });
    }
    return selectionFields;
  };
  const _getFilterField = function (filterFields, propertyPath, converterContext, entityType) {
    let filterField = filterFields[propertyPath];
    if (filterField) {
      delete filterFields[propertyPath];
    } else {
      filterField = _createFilterSelectionField(entityType, entityType.resolvePath(propertyPath), propertyPath, true, converterContext);
    }
    if (!filterField) {
      var _converterContext$get;
      (_converterContext$get = converterContext.getDiagnostics()) === null || _converterContext$get === void 0 ? void 0 : _converterContext$get.addIssue(IssueCategory.Annotation, IssueSeverity.High, IssueType.MISSING_SELECTIONFIELD);
    }
    // defined SelectionFields are available by default
    if (filterField) {
      var _entityType$annotatio, _entityType$annotatio2;
      filterField.availability = filterField.availability === AvailabilityType.Hidden ? AvailabilityType.Hidden : AvailabilityType.Default;
      filterField.isParameter = !!((_entityType$annotatio = entityType.annotations) !== null && _entityType$annotatio !== void 0 && (_entityType$annotatio2 = _entityType$annotatio.Common) !== null && _entityType$annotatio2 !== void 0 && _entityType$annotatio2.ResultContext);
    }
    return filterField;
  };
  const _getDefaultFilterFields = function (aSelectOptions, entityType, converterContext, excludedFilterProperties, annotatedSelectionFields) {
    const selectionFields = [];
    const UISelectionFields = {};
    const properties = entityType.entityProperties;
    // Using entityType instead of entitySet
    annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.forEach(SelectionField => {
      UISelectionFields[SelectionField.value] = true;
    });
    if (aSelectOptions && aSelectOptions.length > 0) {
      aSelectOptions === null || aSelectOptions === void 0 ? void 0 : aSelectOptions.forEach(selectOption => {
        const propertyName = selectOption.PropertyName;
        const sPropertyPath = propertyName.value;
        const currentSelectionFields = {};
        annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.forEach(SelectionField => {
          currentSelectionFields[SelectionField.value] = true;
        });
        if (!(sPropertyPath in excludedFilterProperties)) {
          if (!(sPropertyPath in currentSelectionFields)) {
            const FilterField = getFilterField(sPropertyPath, converterContext, entityType);
            if (FilterField) {
              selectionFields.push(FilterField);
            }
          }
        }
      });
    } else if (properties) {
      properties.forEach(property => {
        var _property$annotations9, _property$annotations10;
        const defaultFilterValue = (_property$annotations9 = property.annotations) === null || _property$annotations9 === void 0 ? void 0 : (_property$annotations10 = _property$annotations9.Common) === null || _property$annotations10 === void 0 ? void 0 : _property$annotations10.FilterDefaultValue;
        const propertyPath = property.name;
        if (!(propertyPath in excludedFilterProperties)) {
          if (defaultFilterValue && !(propertyPath in UISelectionFields)) {
            const FilterField = getFilterField(propertyPath, converterContext, entityType);
            if (FilterField) {
              selectionFields.push(FilterField);
            }
          }
        }
      });
    }
    return selectionFields;
  };

  /**
   * Get all parameter filter fields in case of a parameterized service.
   *
   * @param converterContext
   * @returns An array of parameter FilterFields
   */
  function _getParameterFields(converterContext) {
    var _parameterEntityType$, _parameterEntityType$2;
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    const parameterEntityType = dataModelObjectPath.startingEntitySet.entityType;
    const isParameterized = !!((_parameterEntityType$ = parameterEntityType.annotations) !== null && _parameterEntityType$ !== void 0 && (_parameterEntityType$2 = _parameterEntityType$.Common) !== null && _parameterEntityType$2 !== void 0 && _parameterEntityType$2.ResultContext) && !dataModelObjectPath.targetEntitySet;
    const parameterConverterContext = isParameterized && converterContext.getConverterContextFor(`/${dataModelObjectPath.startingEntitySet.name}`);
    return parameterConverterContext ? parameterEntityType.entityProperties.map(function (property) {
      return _getFilterField({}, property.name, parameterConverterContext, parameterEntityType);
    }) : [];
  }

  /**
   * Determines if the FilterBar search field is hidden or not.
   *
   * @param listReportTables The list report tables
   * @param charts The ALP charts
   * @param converterContext The converter context
   * @returns The information if the FilterBar search field is hidden or not
   */
  const getFilterBarhideBasicSearch = function (listReportTables, charts, converterContext) {
    // Check if charts allow search
    const noSearchInCharts = charts.length === 0 || charts.every(chart => !chart.applySupported.enableSearch);

    // Check if all tables are analytical and none of them allow for search
    const noSearchInTables = listReportTables.length === 0 || listReportTables.every(table => table.enableAnalytics && !table.enableAnalyticsSearch);
    const contextPath = converterContext.getContextPath();
    if (contextPath && noSearchInCharts && noSearchInTables) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Retrieves filter fields from the manifest.
   *
   * @param entityType The current entityType
   * @param converterContext The converter context
   * @returns The filter fields defined in the manifest
   */
  _exports.getFilterBarhideBasicSearch = getFilterBarhideBasicSearch;
  const getManifestFilterFields = function (entityType, converterContext) {
    const fbConfig = converterContext.getManifestWrapper().getFilterConfiguration();
    const definedFilterFields = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.filterFields) || {};
    const selectionFields = _getSelectionFieldsByPath(entityType, Object.keys(definedFilterFields).map(key => KeyHelper.getPathFromSelectionFieldKey(key)), true, converterContext);
    const filterFields = {};
    for (const sKey in definedFilterFields) {
      const filterField = definedFilterFields[sKey];
      const propertyName = KeyHelper.getPathFromSelectionFieldKey(sKey);
      const selectionField = selectionFields[propertyName];
      const type = filterField.type === "Slot" ? filterFieldType.Slot : filterFieldType.Default;
      const visualFilter = filterField && filterField !== null && filterField !== void 0 && filterField.visualFilter ? getVisualFilters(entityType, converterContext, sKey, definedFilterFields) : undefined;
      filterFields[sKey] = {
        key: sKey,
        type: type,
        slotName: (filterField === null || filterField === void 0 ? void 0 : filterField.slotName) || sKey,
        annotationPath: selectionField === null || selectionField === void 0 ? void 0 : selectionField.annotationPath,
        conditionPath: (selectionField === null || selectionField === void 0 ? void 0 : selectionField.conditionPath) || propertyName,
        template: filterField.template,
        label: filterField.label,
        position: filterField.position || {
          placement: Placement.After
        },
        availability: filterField.availability || AvailabilityType.Default,
        settings: filterField.settings,
        visualFilter: visualFilter,
        required: filterField.required
      };
    }
    return filterFields;
  };
  _exports.getManifestFilterFields = getManifestFilterFields;
  const getFilterField = function (propertyPath, converterContext, entityType) {
    return _getFilterField({}, propertyPath, converterContext, entityType);
  };
  _exports.getFilterField = getFilterField;
  const getFilterRestrictions = function (oFilterRestrictionsAnnotation, sRestriction) {
    if (sRestriction === "RequiredProperties" || sRestriction === "NonFilterableProperties") {
      let aProps = [];
      if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
        aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty) {
          return oProperty.$PropertyPath || oProperty.value;
        });
      }
      return aProps;
    } else if (sRestriction === "FilterAllowedExpressions") {
      const mAllowedExpressions = {};
      if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions) {
        oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty) {
          //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
          if (mAllowedExpressions[oProperty.Property.value]) {
            mAllowedExpressions[oProperty.Property.value].push(oProperty.AllowedExpressions);
          } else {
            mAllowedExpressions[oProperty.Property.value] = [oProperty.AllowedExpressions];
          }
        });
      }
      return mAllowedExpressions;
    }
    return oFilterRestrictionsAnnotation;
  };
  _exports.getFilterRestrictions = getFilterRestrictions;
  const getSearchFilterPropertyInfo = function () {
    return {
      name: "$search",
      path: "$search",
      dataType: sStringDataType,
      maxConditions: 1
    };
  };
  const getEditStateFilterPropertyInfo = function () {
    return {
      name: "$editState",
      path: "$editState",
      groupLabel: "",
      group: "",
      dataType: sStringDataType,
      hiddenFilter: false
    };
  };
  const getSearchRestrictions = function (converterContext) {
    let searchRestrictions;
    if (!ModelHelper.isSingleton(converterContext.getEntitySet())) {
      var _converterContext$get2, _converterContext$get3;
      const capabilites = (_converterContext$get2 = converterContext.getEntitySet()) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.annotations) === null || _converterContext$get3 === void 0 ? void 0 : _converterContext$get3.Capabilities;
      searchRestrictions = capabilites === null || capabilites === void 0 ? void 0 : capabilites.SearchRestrictions;
    }
    return searchRestrictions;
  };
  const getNavigationRestrictions = function (converterContext, sNavigationPath) {
    var _converterContext$get4, _converterContext$get5, _converterContext$get6;
    const oNavigationRestrictions = (_converterContext$get4 = converterContext.getEntitySet()) === null || _converterContext$get4 === void 0 ? void 0 : (_converterContext$get5 = _converterContext$get4.annotations) === null || _converterContext$get5 === void 0 ? void 0 : (_converterContext$get6 = _converterContext$get5.Capabilities) === null || _converterContext$get6 === void 0 ? void 0 : _converterContext$get6.NavigationRestrictions;
    const aRestrictedProperties = oNavigationRestrictions && oNavigationRestrictions.RestrictedProperties;
    return aRestrictedProperties && aRestrictedProperties.find(function (oRestrictedProperty) {
      return oRestrictedProperty && oRestrictedProperty.NavigationProperty && (oRestrictedProperty.NavigationProperty.$NavigationPropertyPath === sNavigationPath || oRestrictedProperty.NavigationProperty.value === sNavigationPath);
    });
  };
  _exports.getNavigationRestrictions = getNavigationRestrictions;
  const _fetchBasicPropertyInfo = function (oFilterFieldInfo) {
    return {
      key: oFilterFieldInfo.key,
      annotationPath: oFilterFieldInfo.annotationPath,
      conditionPath: oFilterFieldInfo.conditionPath,
      name: oFilterFieldInfo.conditionPath,
      label: oFilterFieldInfo.label,
      hiddenFilter: oFilterFieldInfo.availability === "Hidden",
      display: "Value",
      isParameter: oFilterFieldInfo.isParameter,
      caseSensitive: oFilterFieldInfo.caseSensitive,
      availability: oFilterFieldInfo.availability,
      position: oFilterFieldInfo.position,
      type: oFilterFieldInfo.type,
      template: oFilterFieldInfo.template,
      menu: oFilterFieldInfo.menu,
      required: oFilterFieldInfo.required
    };
  };
  const getSpecificAllowedExpression = function (aExpressions) {
    const aAllowedExpressionsPriority = ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"];
    aExpressions.sort(function (a, b) {
      return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
    });
    return aExpressions[0];
  };
  _exports.getSpecificAllowedExpression = getSpecificAllowedExpression;
  const displayMode = function (oPropertyAnnotations, oCollectionAnnotations) {
    var _oPropertyAnnotations, _oPropertyAnnotations2, _oPropertyAnnotations3, _oPropertyAnnotations4, _oPropertyAnnotations5, _oCollectionAnnotatio;
    const oTextAnnotation = oPropertyAnnotations === null || oPropertyAnnotations === void 0 ? void 0 : (_oPropertyAnnotations = oPropertyAnnotations.Common) === null || _oPropertyAnnotations === void 0 ? void 0 : _oPropertyAnnotations.Text,
      oTextArrangmentAnnotation = oTextAnnotation && (oPropertyAnnotations && (oPropertyAnnotations === null || oPropertyAnnotations === void 0 ? void 0 : (_oPropertyAnnotations2 = oPropertyAnnotations.Common) === null || _oPropertyAnnotations2 === void 0 ? void 0 : (_oPropertyAnnotations3 = _oPropertyAnnotations2.Text) === null || _oPropertyAnnotations3 === void 0 ? void 0 : (_oPropertyAnnotations4 = _oPropertyAnnotations3.annotations) === null || _oPropertyAnnotations4 === void 0 ? void 0 : (_oPropertyAnnotations5 = _oPropertyAnnotations4.UI) === null || _oPropertyAnnotations5 === void 0 ? void 0 : _oPropertyAnnotations5.TextArrangement) || oCollectionAnnotations && (oCollectionAnnotations === null || oCollectionAnnotations === void 0 ? void 0 : (_oCollectionAnnotatio = oCollectionAnnotations.UI) === null || _oCollectionAnnotatio === void 0 ? void 0 : _oCollectionAnnotatio.TextArrangement));
    if (oTextArrangmentAnnotation) {
      if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextOnly") {
        return "Description";
      } else if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextLast") {
        return "ValueDescription";
      }
      return "DescriptionValue"; //TextFirst
    }

    return oTextAnnotation ? "DescriptionValue" : "Value";
  };
  _exports.displayMode = displayMode;
  const fetchPropertyInfo = function (converterContext, oFilterFieldInfo, oTypeConfig) {
    var _converterContext$get7;
    let oPropertyInfo = _fetchBasicPropertyInfo(oFilterFieldInfo);
    const sAnnotationPath = oFilterFieldInfo.annotationPath;
    if (!sAnnotationPath) {
      return oPropertyInfo;
    }
    const targetPropertyObject = converterContext.getConverterContextFor(sAnnotationPath).getDataModelObjectPath().targetObject;
    const oPropertyAnnotations = targetPropertyObject === null || targetPropertyObject === void 0 ? void 0 : targetPropertyObject.annotations;
    const oCollectionAnnotations = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get7 = converterContext.getDataModelObjectPath().targetObject) === null || _converterContext$get7 === void 0 ? void 0 : _converterContext$get7.annotations;
    const oFormatOptions = oTypeConfig.formatOptions;
    const oConstraints = oTypeConfig.constraints;
    oPropertyInfo = Object.assign(oPropertyInfo, {
      formatOptions: oFormatOptions,
      constraints: oConstraints,
      display: displayMode(oPropertyAnnotations, oCollectionAnnotations)
    });
    return oPropertyInfo;
  };
  _exports.fetchPropertyInfo = fetchPropertyInfo;
  const isMultiValue = function (oProperty) {
    let bIsMultiValue = true;
    //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
    switch (oProperty.filterExpression) {
      case "SearchExpression":
      case "SingleRange":
      case "SingleValue":
        bIsMultiValue = false;
        break;
      default:
        break;
    }
    if (oProperty.type && oProperty.type.indexOf("Boolean") > 0) {
      bIsMultiValue = false;
    }
    return bIsMultiValue;
  };
  _exports.isMultiValue = isMultiValue;
  const _isFilterableNavigationProperty = function (entry) {
    return (entry.$Type === "com.sap.vocabularies.UI.v1.DataField" || entry.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || entry.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath") && entry.Value.path.includes("/");
  };
  const getAnnotatedSelectionFieldData = function (converterContext) {
    var _converterContext$get8, _entityType$annotatio3, _entityType$annotatio4;
    let lrTables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let annotationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    let includeHidden = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let lineItemTerm = arguments.length > 4 ? arguments[4] : undefined;
    // Fetch all selectionVariants defined in the different visualizations and different views (multi table mode)
    const selectionVariants = getSelectionVariants(lrTables, converterContext);

    // create a map of properties to be used in selection variants
    const excludedFilterProperties = getExcludedFilterProperties(selectionVariants);
    const entityType = converterContext.getEntityType();
    //Filters which has to be added which is part of SV/Default annotations but not present in the SelectionFields
    const annotatedSelectionFields = annotationPath && ((_converterContext$get8 = converterContext.getEntityTypeAnnotation(annotationPath)) === null || _converterContext$get8 === void 0 ? void 0 : _converterContext$get8.annotation) || ((_entityType$annotatio3 = entityType.annotations) === null || _entityType$annotatio3 === void 0 ? void 0 : (_entityType$annotatio4 = _entityType$annotatio3.UI) === null || _entityType$annotatio4 === void 0 ? void 0 : _entityType$annotatio4.SelectionFields) || [];
    const navProperties = [];
    if (lrTables.length === 0 && !!lineItemTerm) {
      var _converterContext$get9;
      (_converterContext$get9 = converterContext.getEntityTypeAnnotation(lineItemTerm).annotation) === null || _converterContext$get9 === void 0 ? void 0 : _converterContext$get9.forEach(entry => {
        if (_isFilterableNavigationProperty(entry)) {
          const entityPath = entry.Value.path.slice(0, entry.Value.path.lastIndexOf("/"));
          if (!navProperties.includes(entityPath)) {
            navProperties.push(entityPath);
          }
        }
      });
    }

    // create a map of all potential filter fields based on...
    const filterFields = {
      // ...non hidden properties of the entity
      ..._getSelectionFields(entityType, "", entityType.entityProperties, includeHidden, converterContext),
      // ... non hidden properties of navigation properties
      ..._getSelectionFieldsByPath(entityType, navProperties, false, converterContext),
      // ...additional manifest defined navigation properties
      ..._getSelectionFieldsByPath(entityType, converterContext.getManifestWrapper().getFilterConfiguration().navigationProperties, includeHidden, converterContext)
    };
    let aSelectOptions = [];
    const selectionVariant = getSelectionVariant(entityType, converterContext);
    if (selectionVariant) {
      aSelectOptions = selectionVariant.SelectOptions;
    }
    const propertyInfoFields = (annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.reduce((selectionFields, selectionField) => {
      const propertyPath = selectionField.value;
      if (!(propertyPath in excludedFilterProperties)) {
        let navigationPath;
        if (annotationPath.startsWith("@com.sap.vocabularies.UI.v1.SelectionFields")) {
          navigationPath = "";
        } else {
          navigationPath = annotationPath.split("/@com.sap.vocabularies.UI.v1.SelectionFields")[0];
        }
        const filterPropertyPath = navigationPath ? navigationPath + "/" + propertyPath : propertyPath;
        const filterField = _getFilterField(filterFields, filterPropertyPath, converterContext, entityType);
        if (filterField) {
          filterField.group = "";
          filterField.groupLabel = "";
          selectionFields.push(filterField);
        }
      }
      return selectionFields;
    }, [])) || [];
    const defaultFilterFields = _getDefaultFilterFields(aSelectOptions, entityType, converterContext, excludedFilterProperties, annotatedSelectionFields);
    return {
      excludedFilterProperties: excludedFilterProperties,
      entityType: entityType,
      annotatedSelectionFields: annotatedSelectionFields,
      filterFields: filterFields,
      propertyInfoFields: propertyInfoFields,
      defaultFilterFields: defaultFilterFields
    };
  };
  const fetchTypeConfig = function (property) {
    const oTypeConfig = getTypeConfig(property, property === null || property === void 0 ? void 0 : property.type);
    if ((property === null || property === void 0 ? void 0 : property.type) === sEdmString && (oTypeConfig.constraints.nullable === undefined || oTypeConfig.constraints.nullable === true)) {
      oTypeConfig.formatOptions.parseKeepsEmptyString = false;
    }
    return oTypeConfig;
  };
  _exports.fetchTypeConfig = fetchTypeConfig;
  const assignDataTypeToPropertyInfo = function (propertyInfoField, converterContext, aRequiredProps, aTypeConfig) {
    let oPropertyInfo = fetchPropertyInfo(converterContext, propertyInfoField, aTypeConfig[propertyInfoField.key]),
      sPropertyPath = "";
    if (propertyInfoField.conditionPath) {
      sPropertyPath = propertyInfoField.conditionPath.replace(/\+|\*/g, "");
    }
    if (oPropertyInfo) {
      oPropertyInfo = Object.assign(oPropertyInfo, {
        maxConditions: !oPropertyInfo.isParameter && isMultiValue(oPropertyInfo) ? -1 : 1,
        required: propertyInfoField.required ?? (oPropertyInfo.isParameter || aRequiredProps.indexOf(sPropertyPath) >= 0),
        caseSensitive: isFilteringCaseSensitive(converterContext),
        dataType: aTypeConfig[propertyInfoField.key].type
      });
    }
    return oPropertyInfo;
  };
  _exports.assignDataTypeToPropertyInfo = assignDataTypeToPropertyInfo;
  const processSelectionFields = function (propertyInfoFields, converterContext, defaultValuePropertyFields) {
    //get TypeConfig function
    const selectionFieldTypes = [];
    const aTypeConfig = {};
    if (defaultValuePropertyFields) {
      propertyInfoFields = propertyInfoFields.concat(defaultValuePropertyFields);
    }
    //add typeConfig
    propertyInfoFields.forEach(function (parameterField) {
      if (parameterField.annotationPath) {
        const propertyConvertyContext = converterContext.getConverterContextFor(parameterField.annotationPath);
        const propertyTargetObject = propertyConvertyContext.getDataModelObjectPath().targetObject;
        selectionFieldTypes.push(propertyTargetObject === null || propertyTargetObject === void 0 ? void 0 : propertyTargetObject.type);
        const oTypeConfig = fetchTypeConfig(propertyTargetObject);
        aTypeConfig[parameterField.key] = oTypeConfig;
      } else {
        selectionFieldTypes.push(sEdmString);
        aTypeConfig[parameterField.key] = {
          type: sStringDataType
        };
      }
    });

    // filterRestrictions
    let _oFilterrestrictions;
    if (!ModelHelper.isSingleton(converterContext.getEntitySet())) {
      var _converterContext$get10, _converterContext$get11, _converterContext$get12;
      _oFilterrestrictions = (_converterContext$get10 = converterContext.getEntitySet()) === null || _converterContext$get10 === void 0 ? void 0 : (_converterContext$get11 = _converterContext$get10.annotations) === null || _converterContext$get11 === void 0 ? void 0 : (_converterContext$get12 = _converterContext$get11.Capabilities) === null || _converterContext$get12 === void 0 ? void 0 : _converterContext$get12.FilterRestrictions;
    }
    const oFilterRestrictions = _oFilterrestrictions;
    const oRet = {};
    oRet["RequiredProperties"] = getFilterRestrictions(oFilterRestrictions, "RequiredProperties") || [];
    oRet["NonFilterableProperties"] = getFilterRestrictions(oFilterRestrictions, "NonFilterableProperties") || [];
    oRet["FilterAllowedExpressions"] = getFilterRestrictions(oFilterRestrictions, "FilterAllowedExpressions") || {};
    const sEntitySetPath = converterContext.getContextPath();
    const aPathParts = sEntitySetPath.split("/");
    if (aPathParts.length > 2) {
      const sNavigationPath = aPathParts[aPathParts.length - 1];
      aPathParts.splice(-1, 1);
      const oNavigationRestrictions = getNavigationRestrictions(converterContext, sNavigationPath);
      const oNavigationFilterRestrictions = oNavigationRestrictions && oNavigationRestrictions.FilterRestrictions;
      oRet.RequiredProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "RequiredProperties") || []);
      oRet.NonFilterableProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "NonFilterableProperties") || []);
      oRet.FilterAllowedExpressions = {
        ...(getFilterRestrictions(oNavigationFilterRestrictions, "FilterAllowedExpressions") || {}),
        ...oRet.FilterAllowedExpressions
      };
    }
    const aRequiredProps = oRet.RequiredProperties;
    const aNonFilterableProps = oRet.NonFilterableProperties;
    const aFetchedProperties = [];

    // process the fields to add necessary properties
    propertyInfoFields.forEach(function (propertyInfoField) {
      let sPropertyPath;
      if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
        const oPropertyInfo = assignDataTypeToPropertyInfo(propertyInfoField, converterContext, aRequiredProps, aTypeConfig);
        aFetchedProperties.push(oPropertyInfo);
      }
    });

    //add edit
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    if (ModelHelper.isObjectPathDraftSupported(dataModelObjectPath)) {
      aFetchedProperties.push(getEditStateFilterPropertyInfo());
    }
    // add search
    const searchRestrictions = getSearchRestrictions(converterContext);
    const hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
    if (sEntitySetPath && hideBasicSearch !== true) {
      if (!searchRestrictions || searchRestrictions !== null && searchRestrictions !== void 0 && searchRestrictions.Searchable) {
        aFetchedProperties.push(getSearchFilterPropertyInfo());
      }
    }
    return aFetchedProperties;
  };
  _exports.processSelectionFields = processSelectionFields;
  const insertCustomManifestElements = function (filterFields, entityType, converterContext) {
    return insertCustomElements(filterFields, getManifestFilterFields(entityType, converterContext), {
      availability: OverrideType.overwrite,
      label: OverrideType.overwrite,
      type: OverrideType.overwrite,
      position: OverrideType.overwrite,
      slotName: OverrideType.overwrite,
      template: OverrideType.overwrite,
      settings: OverrideType.overwrite,
      visualFilter: OverrideType.overwrite,
      required: OverrideType.overwrite
    });
  };

  /**
   * Retrieve the configuration for the selection fields that will be used within the filter bar
   * This configuration takes into account the annotation and the selection variants.
   *
   * @param converterContext
   * @param lrTables
   * @param annotationPath
   * @param [includeHidden]
   * @param [lineItemTerm]
   * @returns An array of selection fields
   */
  _exports.insertCustomManifestElements = insertCustomManifestElements;
  const getSelectionFields = function (converterContext) {
    var _entityType$annotatio5, _entityType$annotatio6;
    let lrTables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let annotationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    let includeHidden = arguments.length > 3 ? arguments[3] : undefined;
    let lineItemTerm = arguments.length > 4 ? arguments[4] : undefined;
    const oAnnotatedSelectionFieldData = getAnnotatedSelectionFieldData(converterContext, lrTables, annotationPath, includeHidden, lineItemTerm);
    const parameterFields = _getParameterFields(converterContext);
    let propertyInfoFields = JSON.parse(JSON.stringify(oAnnotatedSelectionFieldData.propertyInfoFields));
    const entityType = oAnnotatedSelectionFieldData.entityType;
    propertyInfoFields = parameterFields.concat(propertyInfoFields);
    propertyInfoFields = insertCustomManifestElements(propertyInfoFields, entityType, converterContext);
    const aFetchedProperties = processSelectionFields(propertyInfoFields, converterContext, oAnnotatedSelectionFieldData.defaultFilterFields);
    aFetchedProperties.sort(function (a, b) {
      if (a.groupLabel === undefined || a.groupLabel === null) {
        return -1;
      }
      if (b.groupLabel === undefined || b.groupLabel === null) {
        return 1;
      }
      return a.groupLabel.localeCompare(b.groupLabel);
    });
    let sFetchProperties = JSON.stringify(aFetchedProperties);
    sFetchProperties = sFetchProperties.replace(/\{/g, "\\{");
    sFetchProperties = sFetchProperties.replace(/\}/g, "\\}");
    const sPropertyInfo = sFetchProperties;
    // end of propertyFields processing

    // to populate selection fields
    let propSelectionFields = JSON.parse(JSON.stringify(oAnnotatedSelectionFieldData.propertyInfoFields));
    propSelectionFields = parameterFields.concat(propSelectionFields);
    // create a map of properties to be used in selection variants
    const excludedFilterProperties = oAnnotatedSelectionFieldData.excludedFilterProperties;
    const filterFacets = entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio5 = entityType.annotations) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.UI) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.FilterFacets;
    let filterFacetMap = {};
    const aFieldGroups = converterContext.getAnnotationsByTerm("UI", "com.sap.vocabularies.UI.v1.FieldGroup");
    if (filterFacets === undefined || filterFacets.length < 0) {
      for (const i in aFieldGroups) {
        filterFacetMap = {
          ...filterFacetMap,
          ...getFieldGroupFilterGroups(aFieldGroups[i])
        };
      }
    } else {
      filterFacetMap = filterFacets.reduce((previousValue, filterFacet) => {
        for (let i = 0; i < (filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Target = filterFacet.Target) === null || _filterFacet$Target === void 0 ? void 0 : (_filterFacet$Target$$ = _filterFacet$Target.$target) === null || _filterFacet$Target$$ === void 0 ? void 0 : (_filterFacet$Target$$2 = _filterFacet$Target$$.Data) === null || _filterFacet$Target$$2 === void 0 ? void 0 : _filterFacet$Target$$2.length); i++) {
          var _filterFacet$Target, _filterFacet$Target$$, _filterFacet$Target$$2, _filterFacet$Target2, _filterFacet$Target2$, _filterFacet$Target2$2, _filterFacet$Target2$3, _filterFacet$ID, _filterFacet$Label;
          previousValue[filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Target2 = filterFacet.Target) === null || _filterFacet$Target2 === void 0 ? void 0 : (_filterFacet$Target2$ = _filterFacet$Target2.$target) === null || _filterFacet$Target2$ === void 0 ? void 0 : (_filterFacet$Target2$2 = _filterFacet$Target2$.Data[i]) === null || _filterFacet$Target2$2 === void 0 ? void 0 : (_filterFacet$Target2$3 = _filterFacet$Target2$2.Value) === null || _filterFacet$Target2$3 === void 0 ? void 0 : _filterFacet$Target2$3.path] = {
            group: filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$ID = filterFacet.ID) === null || _filterFacet$ID === void 0 ? void 0 : _filterFacet$ID.toString(),
            groupLabel: filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Label = filterFacet.Label) === null || _filterFacet$Label === void 0 ? void 0 : _filterFacet$Label.toString()
          };
        }
        return previousValue;
      }, {});
    }

    // create a map of all potential filter fields based on...
    const filterFields = oAnnotatedSelectionFieldData.filterFields;

    // finally create final list of filter fields by adding the SelectionFields first (order matters)...
    let allFilters = propSelectionFields

    // ...and adding remaining filter fields, that are not used in a SelectionVariant (order doesn't matter)
    .concat(Object.keys(filterFields).filter(propertyPath => !(propertyPath in excludedFilterProperties)).map(propertyPath => {
      return Object.assign(filterFields[propertyPath], filterFacetMap[propertyPath]);
    }));
    const sContextPath = converterContext.getContextPath();

    //if all tables are analytical tables "aggregatable" properties must be excluded
    if (checkAllTableForEntitySetAreAnalytical(lrTables, sContextPath)) {
      // Currently all agregates are root entity properties (no properties coming from navigation) and all
      // tables with same entitySet gets same aggreagte configuration that's why we can use first table into
      // LR to get aggregates (without currency/unit properties since we expect to be able to filter them).
      const aggregates = lrTables[0].aggregates;
      if (aggregates) {
        const aggregatableProperties = Object.keys(aggregates).map(aggregateKey => aggregates[aggregateKey].relativePath);
        allFilters = allFilters.filter(filterField => {
          return aggregatableProperties.indexOf(filterField.key) === -1;
        });
      }
    }
    const selectionFields = insertCustomManifestElements(allFilters, entityType, converterContext);

    // Add caseSensitive property to all selection fields.
    const isCaseSensitive = isFilteringCaseSensitive(converterContext);
    selectionFields.forEach(filterField => {
      filterField.caseSensitive = isCaseSensitive;
    });
    return {
      selectionFields,
      sPropertyInfo
    };
  };

  /**
   * Determines whether the filter bar inside a value help dialog should be expanded. This is true if one of the following conditions hold:
   * (1) a filter property is mandatory,
   * (2) no search field exists (entity isn't search enabled),
   * (3) when the data isn't loaded by default (annotation FetchValues = 2).
   *
   * @param converterContext The converter context
   * @param filterRestrictionsAnnotation The FilterRestriction annotation
   * @param valueListAnnotation The ValueList annotation
   * @returns The value for expandFilterFields
   */
  _exports.getSelectionFields = getSelectionFields;
  const getExpandFilterFields = function (converterContext, filterRestrictionsAnnotation, valueListAnnotation) {
    const requiredProperties = getFilterRestrictions(filterRestrictionsAnnotation, "RequiredProperties");
    const searchRestrictions = getSearchRestrictions(converterContext);
    const hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
    const valueList = valueListAnnotation.getObject();
    if (requiredProperties.length > 0 || hideBasicSearch || (valueList === null || valueList === void 0 ? void 0 : valueList.FetchValues) === 2) {
      return true;
    }
    return false;
  };
  _exports.getExpandFilterFields = getExpandFilterFields;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWx0ZXJGaWVsZFR5cGUiLCJzRWRtU3RyaW5nIiwic1N0cmluZ0RhdGFUeXBlIiwiZ2V0RmllbGRHcm91cEZpbHRlckdyb3VwcyIsImZpZWxkR3JvdXAiLCJmaWx0ZXJGYWNldE1hcCIsIkRhdGEiLCJmb3JFYWNoIiwiZGF0YUZpZWxkIiwiJFR5cGUiLCJWYWx1ZSIsInBhdGgiLCJncm91cCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImdyb3VwTGFiZWwiLCJjb21waWxlRXhwcmVzc2lvbiIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIkxhYmVsIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJxdWFsaWZpZXIiLCJnZXRFeGNsdWRlZEZpbHRlclByb3BlcnRpZXMiLCJzZWxlY3Rpb25WYXJpYW50cyIsInJlZHVjZSIsInByZXZpb3VzVmFsdWUiLCJzZWxlY3Rpb25WYXJpYW50IiwicHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZSIsImNoZWNrQWxsVGFibGVGb3JFbnRpdHlTZXRBcmVBbmFseXRpY2FsIiwibGlzdFJlcG9ydFRhYmxlcyIsImNvbnRleHRQYXRoIiwibGVuZ3RoIiwiZXZlcnkiLCJ2aXN1YWxpemF0aW9uIiwiZW5hYmxlQW5hbHl0aWNzIiwiYW5ub3RhdGlvbiIsImNvbGxlY3Rpb24iLCJnZXRTZWxlY3Rpb25WYXJpYW50cyIsImxyVGFibGVWaXN1YWxpemF0aW9ucyIsImNvbnZlcnRlckNvbnRleHQiLCJzZWxlY3Rpb25WYXJpYW50UGF0aHMiLCJtYXAiLCJ0YWJsZUZpbHRlcnMiLCJjb250cm9sIiwiZmlsdGVycyIsInRhYmxlU1ZDb25maWdzIiwia2V5IiwiQXJyYXkiLCJpc0FycmF5IiwicGF0aHMiLCJhbm5vdGF0aW9uUGF0aCIsImluZGV4T2YiLCJwdXNoIiwic2VsZWN0aW9uVmFyaWFudENvbmZpZyIsImdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uIiwic3ZDb25maWdzIiwiY29uY2F0IiwiX2dldENvbmRpdGlvblBhdGgiLCJlbnRpdHlUeXBlIiwicHJvcGVydHlQYXRoIiwicGFydHMiLCJzcGxpdCIsInBhcnRpYWxQYXRoIiwicGFydCIsInNoaWZ0IiwicHJvcGVydHkiLCJyZXNvbHZlUGF0aCIsIl90eXBlIiwiaXNDb2xsZWN0aW9uIiwiX2NyZWF0ZUZpbHRlclNlbGVjdGlvbkZpZWxkIiwiZnVsbFByb3BlcnR5UGF0aCIsImluY2x1ZGVIaWRkZW4iLCJ1bmRlZmluZWQiLCJ0YXJnZXRUeXBlIiwiVUkiLCJIaWRkZW4iLCJ2YWx1ZU9mIiwidGFyZ2V0RW50aXR5VHlwZSIsImdldEFubm90YXRpb25FbnRpdHlUeXBlIiwiS2V5SGVscGVyIiwiZ2V0U2VsZWN0aW9uRmllbGRLZXlGcm9tUGF0aCIsImdldEFic29sdXRlQW5ub3RhdGlvblBhdGgiLCJjb25kaXRpb25QYXRoIiwiYXZhaWxhYmlsaXR5IiwiSGlkZGVuRmlsdGVyIiwiQXZhaWxhYmlsaXR5VHlwZSIsIkFkYXB0YXRpb24iLCJsYWJlbCIsIm5hbWUiLCJfZ2V0U2VsZWN0aW9uRmllbGRzIiwibmF2aWdhdGlvblBhdGgiLCJwcm9wZXJ0aWVzIiwic2VsZWN0aW9uRmllbGRNYXAiLCJmdWxsUGF0aCIsInNlbGVjdGlvbkZpZWxkIiwiX2dldFNlbGVjdGlvbkZpZWxkc0J5UGF0aCIsInByb3BlcnR5UGF0aHMiLCJzZWxlY3Rpb25GaWVsZHMiLCJsb2NhbFNlbGVjdGlvbkZpZWxkcyIsImVudGl0eVByb3BlcnRpZXMiLCJpbmNsdWRlcyIsInNwbGljZSIsImpvaW4iLCJfZ2V0RmlsdGVyRmllbGQiLCJmaWx0ZXJGaWVsZHMiLCJmaWx0ZXJGaWVsZCIsImdldERpYWdub3N0aWNzIiwiYWRkSXNzdWUiLCJJc3N1ZUNhdGVnb3J5IiwiQW5ub3RhdGlvbiIsIklzc3VlU2V2ZXJpdHkiLCJIaWdoIiwiSXNzdWVUeXBlIiwiTUlTU0lOR19TRUxFQ1RJT05GSUVMRCIsIkRlZmF1bHQiLCJpc1BhcmFtZXRlciIsIlJlc3VsdENvbnRleHQiLCJfZ2V0RGVmYXVsdEZpbHRlckZpZWxkcyIsImFTZWxlY3RPcHRpb25zIiwiZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzIiwiYW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzIiwiVUlTZWxlY3Rpb25GaWVsZHMiLCJTZWxlY3Rpb25GaWVsZCIsInZhbHVlIiwic2VsZWN0T3B0aW9uIiwiUHJvcGVydHlOYW1lIiwic1Byb3BlcnR5UGF0aCIsImN1cnJlbnRTZWxlY3Rpb25GaWVsZHMiLCJGaWx0ZXJGaWVsZCIsImdldEZpbHRlckZpZWxkIiwiZGVmYXVsdEZpbHRlclZhbHVlIiwiRmlsdGVyRGVmYXVsdFZhbHVlIiwiX2dldFBhcmFtZXRlckZpZWxkcyIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwicGFyYW1ldGVyRW50aXR5VHlwZSIsInN0YXJ0aW5nRW50aXR5U2V0IiwiaXNQYXJhbWV0ZXJpemVkIiwidGFyZ2V0RW50aXR5U2V0IiwicGFyYW1ldGVyQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJnZXRGaWx0ZXJCYXJoaWRlQmFzaWNTZWFyY2giLCJjaGFydHMiLCJub1NlYXJjaEluQ2hhcnRzIiwiY2hhcnQiLCJhcHBseVN1cHBvcnRlZCIsImVuYWJsZVNlYXJjaCIsIm5vU2VhcmNoSW5UYWJsZXMiLCJ0YWJsZSIsImVuYWJsZUFuYWx5dGljc1NlYXJjaCIsImdldENvbnRleHRQYXRoIiwiZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMiLCJmYkNvbmZpZyIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldEZpbHRlckNvbmZpZ3VyYXRpb24iLCJkZWZpbmVkRmlsdGVyRmllbGRzIiwiT2JqZWN0Iiwia2V5cyIsImdldFBhdGhGcm9tU2VsZWN0aW9uRmllbGRLZXkiLCJzS2V5IiwidHlwZSIsIlNsb3QiLCJ2aXN1YWxGaWx0ZXIiLCJnZXRWaXN1YWxGaWx0ZXJzIiwic2xvdE5hbWUiLCJ0ZW1wbGF0ZSIsInBvc2l0aW9uIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJzZXR0aW5ncyIsInJlcXVpcmVkIiwiZ2V0RmlsdGVyUmVzdHJpY3Rpb25zIiwib0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24iLCJzUmVzdHJpY3Rpb24iLCJhUHJvcHMiLCJvUHJvcGVydHkiLCIkUHJvcGVydHlQYXRoIiwibUFsbG93ZWRFeHByZXNzaW9ucyIsIkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMiLCJQcm9wZXJ0eSIsIkFsbG93ZWRFeHByZXNzaW9ucyIsImdldFNlYXJjaEZpbHRlclByb3BlcnR5SW5mbyIsImRhdGFUeXBlIiwibWF4Q29uZGl0aW9ucyIsImdldEVkaXRTdGF0ZUZpbHRlclByb3BlcnR5SW5mbyIsImhpZGRlbkZpbHRlciIsImdldFNlYXJjaFJlc3RyaWN0aW9ucyIsInNlYXJjaFJlc3RyaWN0aW9ucyIsIk1vZGVsSGVscGVyIiwiaXNTaW5nbGV0b24iLCJnZXRFbnRpdHlTZXQiLCJjYXBhYmlsaXRlcyIsIkNhcGFiaWxpdGllcyIsIlNlYXJjaFJlc3RyaWN0aW9ucyIsImdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJzTmF2aWdhdGlvblBhdGgiLCJvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyIsIk5hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJhUmVzdHJpY3RlZFByb3BlcnRpZXMiLCJSZXN0cmljdGVkUHJvcGVydGllcyIsImZpbmQiLCJvUmVzdHJpY3RlZFByb3BlcnR5IiwiTmF2aWdhdGlvblByb3BlcnR5IiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJfZmV0Y2hCYXNpY1Byb3BlcnR5SW5mbyIsIm9GaWx0ZXJGaWVsZEluZm8iLCJkaXNwbGF5IiwiY2FzZVNlbnNpdGl2ZSIsIm1lbnUiLCJnZXRTcGVjaWZpY0FsbG93ZWRFeHByZXNzaW9uIiwiYUV4cHJlc3Npb25zIiwiYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5Iiwic29ydCIsImEiLCJiIiwiZGlzcGxheU1vZGUiLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsIm9Db2xsZWN0aW9uQW5ub3RhdGlvbnMiLCJvVGV4dEFubm90YXRpb24iLCJUZXh0Iiwib1RleHRBcnJhbmdtZW50QW5ub3RhdGlvbiIsIlRleHRBcnJhbmdlbWVudCIsImZldGNoUHJvcGVydHlJbmZvIiwib1R5cGVDb25maWciLCJvUHJvcGVydHlJbmZvIiwic0Fubm90YXRpb25QYXRoIiwidGFyZ2V0UHJvcGVydHlPYmplY3QiLCJ0YXJnZXRPYmplY3QiLCJvRm9ybWF0T3B0aW9ucyIsImZvcm1hdE9wdGlvbnMiLCJvQ29uc3RyYWludHMiLCJjb25zdHJhaW50cyIsImFzc2lnbiIsImlzTXVsdGlWYWx1ZSIsImJJc011bHRpVmFsdWUiLCJmaWx0ZXJFeHByZXNzaW9uIiwiX2lzRmlsdGVyYWJsZU5hdmlnYXRpb25Qcm9wZXJ0eSIsImVudHJ5IiwiZ2V0QW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhIiwibHJUYWJsZXMiLCJsaW5lSXRlbVRlcm0iLCJnZXRFbnRpdHlUeXBlIiwiZ2V0RW50aXR5VHlwZUFubm90YXRpb24iLCJTZWxlY3Rpb25GaWVsZHMiLCJuYXZQcm9wZXJ0aWVzIiwiZW50aXR5UGF0aCIsInNsaWNlIiwibGFzdEluZGV4T2YiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsImdldFNlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3RPcHRpb25zIiwicHJvcGVydHlJbmZvRmllbGRzIiwic3RhcnRzV2l0aCIsImZpbHRlclByb3BlcnR5UGF0aCIsImRlZmF1bHRGaWx0ZXJGaWVsZHMiLCJmZXRjaFR5cGVDb25maWciLCJnZXRUeXBlQ29uZmlnIiwibnVsbGFibGUiLCJwYXJzZUtlZXBzRW1wdHlTdHJpbmciLCJhc3NpZ25EYXRhVHlwZVRvUHJvcGVydHlJbmZvIiwicHJvcGVydHlJbmZvRmllbGQiLCJhUmVxdWlyZWRQcm9wcyIsImFUeXBlQ29uZmlnIiwicmVwbGFjZSIsImlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSIsInByb2Nlc3NTZWxlY3Rpb25GaWVsZHMiLCJkZWZhdWx0VmFsdWVQcm9wZXJ0eUZpZWxkcyIsInNlbGVjdGlvbkZpZWxkVHlwZXMiLCJwYXJhbWV0ZXJGaWVsZCIsInByb3BlcnR5Q29udmVydHlDb250ZXh0IiwicHJvcGVydHlUYXJnZXRPYmplY3QiLCJfb0ZpbHRlcnJlc3RyaWN0aW9ucyIsIkZpbHRlclJlc3RyaWN0aW9ucyIsIm9GaWx0ZXJSZXN0cmljdGlvbnMiLCJvUmV0Iiwic0VudGl0eVNldFBhdGgiLCJhUGF0aFBhcnRzIiwib05hdmlnYXRpb25GaWx0ZXJSZXN0cmljdGlvbnMiLCJSZXF1aXJlZFByb3BlcnRpZXMiLCJOb25GaWx0ZXJhYmxlUHJvcGVydGllcyIsIkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyIsImFOb25GaWx0ZXJhYmxlUHJvcHMiLCJhRmV0Y2hlZFByb3BlcnRpZXMiLCJpc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZCIsImhpZGVCYXNpY1NlYXJjaCIsIkJvb2xlYW4iLCJTZWFyY2hhYmxlIiwiaW5zZXJ0Q3VzdG9tTWFuaWZlc3RFbGVtZW50cyIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiZ2V0U2VsZWN0aW9uRmllbGRzIiwib0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YSIsInBhcmFtZXRlckZpZWxkcyIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsImxvY2FsZUNvbXBhcmUiLCJzRmV0Y2hQcm9wZXJ0aWVzIiwic1Byb3BlcnR5SW5mbyIsInByb3BTZWxlY3Rpb25GaWVsZHMiLCJmaWx0ZXJGYWNldHMiLCJGaWx0ZXJGYWNldHMiLCJhRmllbGRHcm91cHMiLCJnZXRBbm5vdGF0aW9uc0J5VGVybSIsImkiLCJmaWx0ZXJGYWNldCIsIlRhcmdldCIsIiR0YXJnZXQiLCJJRCIsInRvU3RyaW5nIiwiYWxsRmlsdGVycyIsImZpbHRlciIsInNDb250ZXh0UGF0aCIsImFnZ3JlZ2F0ZXMiLCJhZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIiwiYWdncmVnYXRlS2V5IiwicmVsYXRpdmVQYXRoIiwiaXNDYXNlU2Vuc2l0aXZlIiwiZ2V0RXhwYW5kRmlsdGVyRmllbGRzIiwiZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiIsInZhbHVlTGlzdEFubm90YXRpb24iLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJ2YWx1ZUxpc3QiLCJnZXRPYmplY3QiLCJGZXRjaFZhbHVlcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQW5ub3RhdGlvblRlcm0sIEVudGl0eVR5cGUsIE5hdmlnYXRpb25Qcm9wZXJ0eSwgUHJvcGVydHksIFByb3BlcnR5UGF0aCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NhcGFiaWxpdGllc19FZG1cIjtcbmltcG9ydCB0eXBlIHtcblx0RGF0YUZpZWxkLFxuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhRmllbGRUeXBlcyxcblx0RGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoLFxuXHREYXRhRmllbGRXaXRoVXJsLFxuXHRGaWVsZEdyb3VwLFxuXHRMaW5lSXRlbSxcblx0UmVmZXJlbmNlRmFjZXRUeXBlcyxcblx0U2VsZWN0T3B0aW9uVHlwZVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcywgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgdHlwZSB7IENoYXJ0VmlzdWFsaXphdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9DaGFydFwiO1xuaW1wb3J0IHR5cGUgeyBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbiwgVGFibGVWaXN1YWxpemF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgeyBnZXRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbiwgZ2V0VHlwZUNvbmZpZywgaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSB7IFZpc3VhbEZpbHRlcnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L1Zpc3VhbEZpbHRlcnNcIjtcbmltcG9ydCB7IGdldFZpc3VhbEZpbHRlcnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L1Zpc3VhbEZpbHRlcnNcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgeyBDb25maWd1cmFibGVPYmplY3QsIEN1c3RvbUVsZW1lbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgaW5zZXJ0Q3VzdG9tRWxlbWVudHMsIE92ZXJyaWRlVHlwZSwgUGxhY2VtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IElzc3VlQ2F0ZWdvcnksIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRmlsdGVyRmllbGRNYW5pZmVzdENvbmZpZ3VyYXRpb24sIEZpbHRlck1hbmlmZXN0Q29uZmlndXJhdGlvbiwgRmlsdGVyU2V0dGluZ3MgfSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgQXZhaWxhYmlsaXR5VHlwZSB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBnZXRTZWxlY3Rpb25WYXJpYW50IH0gZnJvbSBcIi4uL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuLy9pbXBvcnQgeyBoYXNWYWx1ZUhlbHAgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuXG5leHBvcnQgdHlwZSBGaWx0ZXJGaWVsZCA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0dHlwZT86IHN0cmluZztcblx0Y29uZGl0aW9uUGF0aDogc3RyaW5nO1xuXHRhdmFpbGFiaWxpdHk6IEF2YWlsYWJpbGl0eVR5cGU7XG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHR0ZW1wbGF0ZT86IHN0cmluZztcblx0Z3JvdXA/OiBzdHJpbmc7XG5cdGdyb3VwTGFiZWw/OiBzdHJpbmc7XG5cdHNldHRpbmdzPzogRmlsdGVyU2V0dGluZ3M7XG5cdGlzUGFyYW1ldGVyPzogYm9vbGVhbjtcblx0dmlzdWFsRmlsdGVyPzogVmlzdWFsRmlsdGVycztcblx0Y2FzZVNlbnNpdGl2ZT86IGJvb2xlYW47XG5cdHJlcXVpcmVkPzogYm9vbGVhbjtcbn07XG5cbnR5cGUgTWFuaWZlc3RGaWx0ZXJGaWVsZCA9IEZpbHRlckZpZWxkICYge1xuXHRzbG90TmFtZT86IHN0cmluZztcbn07XG5cbnR5cGUgRmlsdGVyR3JvdXAgPSB7XG5cdGdyb3VwPzogc3RyaW5nO1xuXHRncm91cExhYmVsPzogc3RyaW5nO1xufTtcblxuZW51bSBmaWx0ZXJGaWVsZFR5cGUge1xuXHREZWZhdWx0ID0gXCJEZWZhdWx0XCIsXG5cdFNsb3QgPSBcIlNsb3RcIlxufVxuXG5jb25zdCBzRWRtU3RyaW5nID0gXCJFZG0uU3RyaW5nXCI7XG5jb25zdCBzU3RyaW5nRGF0YVR5cGUgPSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiO1xuXG5leHBvcnQgdHlwZSBDdXN0b21FbGVtZW50RmlsdGVyRmllbGQgPSBDdXN0b21FbGVtZW50PE1hbmlmZXN0RmlsdGVyRmllbGQ+O1xuXG4vKipcbiAqIEVudGVyIGFsbCBEYXRhRmllbGRzIG9mIGEgZ2l2ZW4gRmllbGRHcm91cCBpbnRvIHRoZSBmaWx0ZXJGYWNldE1hcC5cbiAqXG4gKiBAcGFyYW0gZmllbGRHcm91cFxuICogQHJldHVybnMgVGhlIG1hcCBvZiBmYWNldHMgZm9yIHRoZSBnaXZlbiBGaWVsZEdyb3VwXG4gKi9cbmZ1bmN0aW9uIGdldEZpZWxkR3JvdXBGaWx0ZXJHcm91cHMoZmllbGRHcm91cDogRmllbGRHcm91cCk6IFJlY29yZDxzdHJpbmcsIEZpbHRlckdyb3VwPiB7XG5cdGNvbnN0IGZpbHRlckZhY2V0TWFwOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJHcm91cD4gPSB7fTtcblx0ZmllbGRHcm91cC5EYXRhLmZvckVhY2goKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdGlmIChkYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIpIHtcblx0XHRcdGZpbHRlckZhY2V0TWFwW2RhdGFGaWVsZC5WYWx1ZS5wYXRoXSA9IHtcblx0XHRcdFx0Z3JvdXA6IGZpZWxkR3JvdXAuZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHRncm91cExhYmVsOlxuXHRcdFx0XHRcdGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGZpZWxkR3JvdXAuTGFiZWwgfHwgZmllbGRHcm91cC5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbCB8fCBmaWVsZEdyb3VwLnF1YWxpZmllcilcblx0XHRcdFx0XHQpIHx8IGZpZWxkR3JvdXAucXVhbGlmaWVyXG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBmaWx0ZXJGYWNldE1hcDtcbn1cblxuZnVuY3Rpb24gZ2V0RXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzKHNlbGVjdGlvblZhcmlhbnRzOiBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbltdKTogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4ge1xuXHRyZXR1cm4gc2VsZWN0aW9uVmFyaWFudHMucmVkdWNlKChwcmV2aW91c1ZhbHVlOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiwgc2VsZWN0aW9uVmFyaWFudCkgPT4ge1xuXHRcdHNlbGVjdGlvblZhcmlhbnQucHJvcGVydHlOYW1lcy5mb3JFYWNoKChwcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdHByZXZpb3VzVmFsdWVbcHJvcGVydHlOYW1lXSA9IHRydWU7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHByZXZpb3VzVmFsdWU7XG5cdH0sIHt9KTtcbn1cblxuLyoqXG4gKiBDaGVjayB0aGF0IGFsbCB0aGUgdGFibGVzIGZvciBhIGRlZGljYXRlZCBlbnRpdHkgc2V0IGFyZSBjb25maWd1cmVkIGFzIGFuYWx5dGljYWwgdGFibGVzLlxuICpcbiAqIEBwYXJhbSBsaXN0UmVwb3J0VGFibGVzIExpc3QgcmVwb3J0IHRhYmxlc1xuICogQHBhcmFtIGNvbnRleHRQYXRoXG4gKiBAcmV0dXJucyBJcyBGaWx0ZXJCYXIgc2VhcmNoIGZpZWxkIGhpZGRlbiBvciBub3RcbiAqL1xuZnVuY3Rpb24gY2hlY2tBbGxUYWJsZUZvckVudGl0eVNldEFyZUFuYWx5dGljYWwobGlzdFJlcG9ydFRhYmxlczogVGFibGVWaXN1YWxpemF0aW9uW10sIGNvbnRleHRQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblx0aWYgKGNvbnRleHRQYXRoICYmIGxpc3RSZXBvcnRUYWJsZXMubGVuZ3RoID4gMCkge1xuXHRcdHJldHVybiBsaXN0UmVwb3J0VGFibGVzLmV2ZXJ5KCh2aXN1YWxpemF0aW9uKSA9PiB7XG5cdFx0XHRyZXR1cm4gdmlzdWFsaXphdGlvbi5lbmFibGVBbmFseXRpY3MgJiYgY29udGV4dFBhdGggPT09IHZpc3VhbGl6YXRpb24uYW5ub3RhdGlvbi5jb2xsZWN0aW9uO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2V0U2VsZWN0aW9uVmFyaWFudHMoXG5cdGxyVGFibGVWaXN1YWxpemF0aW9uczogVGFibGVWaXN1YWxpemF0aW9uW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uW10ge1xuXHRjb25zdCBzZWxlY3Rpb25WYXJpYW50UGF0aHM6IHN0cmluZ1tdID0gW107XG5cdHJldHVybiBsclRhYmxlVmlzdWFsaXphdGlvbnNcblx0XHQubWFwKCh2aXN1YWxpemF0aW9uKSA9PiB7XG5cdFx0XHRjb25zdCB0YWJsZUZpbHRlcnMgPSB2aXN1YWxpemF0aW9uLmNvbnRyb2wuZmlsdGVycztcblx0XHRcdGNvbnN0IHRhYmxlU1ZDb25maWdzOiBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbltdID0gW107XG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiB0YWJsZUZpbHRlcnMpIHtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGFibGVGaWx0ZXJzW2tleV0ucGF0aHMpKSB7XG5cdFx0XHRcdFx0Y29uc3QgcGF0aHMgPSB0YWJsZUZpbHRlcnNba2V5XS5wYXRocztcblx0XHRcdFx0XHRwYXRocy5mb3JFYWNoKChwYXRoKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAocGF0aCAmJiBwYXRoLmFubm90YXRpb25QYXRoICYmIHNlbGVjdGlvblZhcmlhbnRQYXRocy5pbmRleE9mKHBhdGguYW5ub3RhdGlvblBhdGgpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50UGF0aHMucHVzaChwYXRoLmFubm90YXRpb25QYXRoKTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2VsZWN0aW9uVmFyaWFudENvbmZpZyA9IGdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uKHBhdGguYW5ub3RhdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0XHRcdFx0XHRpZiAoc2VsZWN0aW9uVmFyaWFudENvbmZpZykge1xuXHRcdFx0XHRcdFx0XHRcdHRhYmxlU1ZDb25maWdzLnB1c2goc2VsZWN0aW9uVmFyaWFudENvbmZpZyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRhYmxlU1ZDb25maWdzO1xuXHRcdH0pXG5cdFx0LnJlZHVjZSgoc3ZDb25maWdzLCBzZWxlY3Rpb25WYXJpYW50KSA9PiBzdkNvbmZpZ3MuY29uY2F0KHNlbGVjdGlvblZhcmlhbnQpLCBbXSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY29uZGl0aW9uIHBhdGggcmVxdWlyZWQgZm9yIHRoZSBjb25kaXRpb24gbW9kZWwuIEl0IGxvb2tzIGFzIGZvbGxvd3M6XG4gKiA8MTpOLVByb3BlcnR5TmFtZT4qXFwvPDE6MS1Qcm9wZXJ0eU5hbWU+LzxQcm9wZXJ0eU5hbWU+LlxuICpcbiAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSByb290IEVudGl0eVR5cGVcbiAqIEBwYXJhbSBwcm9wZXJ0eVBhdGggVGhlIGZ1bGwgcGF0aCB0byB0aGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIGNvbmRpdGlvbiBwYXRoXG4gKi9cbmNvbnN0IF9nZXRDb25kaXRpb25QYXRoID0gZnVuY3Rpb24gKGVudGl0eVR5cGU6IEVudGl0eVR5cGUsIHByb3BlcnR5UGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0Y29uc3QgcGFydHMgPSBwcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRsZXQgcGFydGlhbFBhdGg7XG5cdGxldCBrZXkgPSBcIlwiO1xuXHR3aGlsZSAocGFydHMubGVuZ3RoKSB7XG5cdFx0bGV0IHBhcnQgPSBwYXJ0cy5zaGlmdCgpIGFzIHN0cmluZztcblx0XHRwYXJ0aWFsUGF0aCA9IHBhcnRpYWxQYXRoID8gYCR7cGFydGlhbFBhdGh9LyR7cGFydH1gIDogcGFydDtcblx0XHRjb25zdCBwcm9wZXJ0eTogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgPSBlbnRpdHlUeXBlLnJlc29sdmVQYXRoKHBhcnRpYWxQYXRoKTtcblx0XHRpZiAocHJvcGVydHkuX3R5cGUgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIgJiYgcHJvcGVydHkuaXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRwYXJ0ICs9IFwiKlwiO1xuXHRcdH1cblx0XHRrZXkgPSBrZXkgPyBgJHtrZXl9LyR7cGFydH1gIDogcGFydDtcblx0fVxuXHRyZXR1cm4ga2V5O1xufTtcblxuY29uc3QgX2NyZWF0ZUZpbHRlclNlbGVjdGlvbkZpZWxkID0gZnVuY3Rpb24gKFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRwcm9wZXJ0eTogUHJvcGVydHksXG5cdGZ1bGxQcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0aW5jbHVkZUhpZGRlbjogYm9vbGVhbixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQge1xuXHQvLyBpZ25vcmUgY29tcGxleCBwcm9wZXJ0eSB0eXBlcyBhbmQgaGlkZGVuIGFubm90YXRlZCBvbmVzXG5cdGlmIChcblx0XHRwcm9wZXJ0eSAhPT0gdW5kZWZpbmVkICYmXG5cdFx0cHJvcGVydHkudGFyZ2V0VHlwZSA9PT0gdW5kZWZpbmVkICYmXG5cdFx0KGluY2x1ZGVIaWRkZW4gfHwgcHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSAhPT0gdHJ1ZSlcblx0KSB7XG5cdFx0Y29uc3QgdGFyZ2V0RW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUocHJvcGVydHkpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRrZXk6IEtleUhlbHBlci5nZXRTZWxlY3Rpb25GaWVsZEtleUZyb21QYXRoKGZ1bGxQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0QWJzb2x1dGVBbm5vdGF0aW9uUGF0aChmdWxsUHJvcGVydHlQYXRoKSxcblx0XHRcdGNvbmRpdGlvblBhdGg6IF9nZXRDb25kaXRpb25QYXRoKGVudGl0eVR5cGUsIGZ1bGxQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0YXZhaWxhYmlsaXR5OlxuXHRcdFx0XHRwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbkZpbHRlcj8udmFsdWVPZigpID09PSB0cnVlID8gQXZhaWxhYmlsaXR5VHlwZS5IaWRkZW4gOiBBdmFpbGFiaWxpdHlUeXBlLkFkYXB0YXRpb24sXG5cdFx0XHRsYWJlbDogY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5LmFubm90YXRpb25zLkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5uYW1lKSksXG5cdFx0XHRncm91cDogdGFyZ2V0RW50aXR5VHlwZS5uYW1lLFxuXHRcdFx0Z3JvdXBMYWJlbDogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbih0YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbD8udmFsdWVPZigpIHx8IHRhcmdldEVudGl0eVR5cGUubmFtZSlcblx0XHRcdClcblx0XHR9O1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5jb25zdCBfZ2V0U2VsZWN0aW9uRmllbGRzID0gZnVuY3Rpb24gKFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRuYXZpZ2F0aW9uUGF0aDogc3RyaW5nLFxuXHRwcm9wZXJ0aWVzOiBBcnJheTxQcm9wZXJ0eT4gfCB1bmRlZmluZWQsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiB7XG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkTWFwOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4gPSB7fTtcblx0aWYgKHByb3BlcnRpZXMpIHtcblx0XHRwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoOiBzdHJpbmcgPSBwcm9wZXJ0eS5uYW1lO1xuXHRcdFx0Y29uc3QgZnVsbFBhdGg6IHN0cmluZyA9IChuYXZpZ2F0aW9uUGF0aCA/IGAke25hdmlnYXRpb25QYXRofS9gIDogXCJcIikgKyBwcm9wZXJ0eVBhdGg7XG5cdFx0XHRjb25zdCBzZWxlY3Rpb25GaWVsZCA9IF9jcmVhdGVGaWx0ZXJTZWxlY3Rpb25GaWVsZChlbnRpdHlUeXBlLCBwcm9wZXJ0eSwgZnVsbFBhdGgsIGluY2x1ZGVIaWRkZW4sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0aWYgKHNlbGVjdGlvbkZpZWxkKSB7XG5cdFx0XHRcdHNlbGVjdGlvbkZpZWxkTWFwW2Z1bGxQYXRoXSA9IHNlbGVjdGlvbkZpZWxkO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBzZWxlY3Rpb25GaWVsZE1hcDtcbn07XG5cbmNvbnN0IF9nZXRTZWxlY3Rpb25GaWVsZHNCeVBhdGggPSBmdW5jdGlvbiAoXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdHByb3BlcnR5UGF0aHM6IEFycmF5PHN0cmluZz4gfCB1bmRlZmluZWQsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiB7XG5cdGxldCBzZWxlY3Rpb25GaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiA9IHt9O1xuXHRpZiAocHJvcGVydHlQYXRocykge1xuXHRcdHByb3BlcnR5UGF0aHMuZm9yRWFjaCgocHJvcGVydHlQYXRoOiBzdHJpbmcpID0+IHtcblx0XHRcdGxldCBsb2NhbFNlbGVjdGlvbkZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+O1xuXG5cdFx0XHRjb25zdCBwcm9wZXJ0eTogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgPSBlbnRpdHlUeXBlLnJlc29sdmVQYXRoKHByb3BlcnR5UGF0aCk7XG5cdFx0XHRpZiAocHJvcGVydHkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAocHJvcGVydHkuX3R5cGUgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIpIHtcblx0XHRcdFx0Ly8gaGFuZGxlIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRcdFx0XHRsb2NhbFNlbGVjdGlvbkZpZWxkcyA9IF9nZXRTZWxlY3Rpb25GaWVsZHMoXG5cdFx0XHRcdFx0ZW50aXR5VHlwZSxcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0cHJvcGVydHkudGFyZ2V0VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdGluY2x1ZGVIaWRkZW4sXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eS50YXJnZXRUeXBlICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydHkudGFyZ2V0VHlwZS5fdHlwZSA9PT0gXCJDb21wbGV4VHlwZVwiKSB7XG5cdFx0XHRcdC8vIGhhbmRsZSBDb21wbGV4VHlwZSBwcm9wZXJ0aWVzXG5cdFx0XHRcdGxvY2FsU2VsZWN0aW9uRmllbGRzID0gX2dldFNlbGVjdGlvbkZpZWxkcyhcblx0XHRcdFx0XHRlbnRpdHlUeXBlLFxuXHRcdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRwcm9wZXJ0eS50YXJnZXRUeXBlLnByb3BlcnRpZXMsXG5cdFx0XHRcdFx0aW5jbHVkZUhpZGRlbixcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBuYXZpZ2F0aW9uUGF0aCA9IHByb3BlcnR5UGF0aC5pbmNsdWRlcyhcIi9cIikgPyBwcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpLnNwbGljZSgwLCAxKS5qb2luKFwiL1wiKSA6IFwiXCI7XG5cdFx0XHRcdGxvY2FsU2VsZWN0aW9uRmllbGRzID0gX2dldFNlbGVjdGlvbkZpZWxkcyhlbnRpdHlUeXBlLCBuYXZpZ2F0aW9uUGF0aCwgW3Byb3BlcnR5XSwgaW5jbHVkZUhpZGRlbiwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHR9XG5cblx0XHRcdHNlbGVjdGlvbkZpZWxkcyA9IHtcblx0XHRcdFx0Li4uc2VsZWN0aW9uRmllbGRzLFxuXHRcdFx0XHQuLi5sb2NhbFNlbGVjdGlvbkZpZWxkc1xuXHRcdFx0fTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gc2VsZWN0aW9uRmllbGRzO1xufTtcblxuY29uc3QgX2dldEZpbHRlckZpZWxkID0gZnVuY3Rpb24gKFxuXHRmaWx0ZXJGaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPixcblx0cHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGVcbik6IEZpbHRlckZpZWxkIHwgdW5kZWZpbmVkIHtcblx0bGV0IGZpbHRlckZpZWxkOiBGaWx0ZXJGaWVsZCB8IHVuZGVmaW5lZCA9IGZpbHRlckZpZWxkc1twcm9wZXJ0eVBhdGhdO1xuXHRpZiAoZmlsdGVyRmllbGQpIHtcblx0XHRkZWxldGUgZmlsdGVyRmllbGRzW3Byb3BlcnR5UGF0aF07XG5cdH0gZWxzZSB7XG5cdFx0ZmlsdGVyRmllbGQgPSBfY3JlYXRlRmlsdGVyU2VsZWN0aW9uRmllbGQoZW50aXR5VHlwZSwgZW50aXR5VHlwZS5yZXNvbHZlUGF0aChwcm9wZXJ0eVBhdGgpLCBwcm9wZXJ0eVBhdGgsIHRydWUsIGNvbnZlcnRlckNvbnRleHQpO1xuXHR9XG5cdGlmICghZmlsdGVyRmllbGQpIHtcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldERpYWdub3N0aWNzKCk/LmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5IaWdoLCBJc3N1ZVR5cGUuTUlTU0lOR19TRUxFQ1RJT05GSUVMRCk7XG5cdH1cblx0Ly8gZGVmaW5lZCBTZWxlY3Rpb25GaWVsZHMgYXJlIGF2YWlsYWJsZSBieSBkZWZhdWx0XG5cdGlmIChmaWx0ZXJGaWVsZCkge1xuXHRcdGZpbHRlckZpZWxkLmF2YWlsYWJpbGl0eSA9XG5cdFx0XHRmaWx0ZXJGaWVsZC5hdmFpbGFiaWxpdHkgPT09IEF2YWlsYWJpbGl0eVR5cGUuSGlkZGVuID8gQXZhaWxhYmlsaXR5VHlwZS5IaWRkZW4gOiBBdmFpbGFiaWxpdHlUeXBlLkRlZmF1bHQ7XG5cdFx0ZmlsdGVyRmllbGQuaXNQYXJhbWV0ZXIgPSAhIWVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LkNvbW1vbj8uUmVzdWx0Q29udGV4dDtcblx0fVxuXHRyZXR1cm4gZmlsdGVyRmllbGQ7XG59O1xuXG5jb25zdCBfZ2V0RGVmYXVsdEZpbHRlckZpZWxkcyA9IGZ1bmN0aW9uIChcblx0YVNlbGVjdE9wdGlvbnM6IGFueVtdLFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRleGNsdWRlZEZpbHRlclByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+LFxuXHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM6IFByb3BlcnR5UGF0aFtdXG4pOiBGaWx0ZXJGaWVsZFtdIHtcblx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzOiBGaWx0ZXJGaWVsZFtdID0gW107XG5cdGNvbnN0IFVJU2VsZWN0aW9uRmllbGRzOiBhbnkgPSB7fTtcblx0Y29uc3QgcHJvcGVydGllcyA9IGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcztcblx0Ly8gVXNpbmcgZW50aXR5VHlwZSBpbnN0ZWFkIG9mIGVudGl0eVNldFxuXHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM/LmZvckVhY2goKFNlbGVjdGlvbkZpZWxkKSA9PiB7XG5cdFx0VUlTZWxlY3Rpb25GaWVsZHNbU2VsZWN0aW9uRmllbGQudmFsdWVdID0gdHJ1ZTtcblx0fSk7XG5cdGlmIChhU2VsZWN0T3B0aW9ucyAmJiBhU2VsZWN0T3B0aW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0YVNlbGVjdE9wdGlvbnM/LmZvckVhY2goKHNlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uVHlwZSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lOiBhbnkgPSBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lO1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aDogc3RyaW5nID0gcHJvcGVydHlOYW1lLnZhbHVlO1xuXHRcdFx0Y29uc3QgY3VycmVudFNlbGVjdGlvbkZpZWxkczogYW55ID0ge307XG5cdFx0XHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM/LmZvckVhY2goKFNlbGVjdGlvbkZpZWxkKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb25GaWVsZHNbU2VsZWN0aW9uRmllbGQudmFsdWVdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKCEoc1Byb3BlcnR5UGF0aCBpbiBleGNsdWRlZEZpbHRlclByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdGlmICghKHNQcm9wZXJ0eVBhdGggaW4gY3VycmVudFNlbGVjdGlvbkZpZWxkcykpIHtcblx0XHRcdFx0XHRjb25zdCBGaWx0ZXJGaWVsZDogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQgPSBnZXRGaWx0ZXJGaWVsZChzUHJvcGVydHlQYXRoLCBjb252ZXJ0ZXJDb250ZXh0LCBlbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRpZiAoRmlsdGVyRmllbGQpIHtcblx0XHRcdFx0XHRcdHNlbGVjdGlvbkZpZWxkcy5wdXNoKEZpbHRlckZpZWxkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIGlmIChwcm9wZXJ0aWVzKSB7XG5cdFx0cHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eTogUHJvcGVydHkpID0+IHtcblx0XHRcdGNvbnN0IGRlZmF1bHRGaWx0ZXJWYWx1ZSA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LkZpbHRlckRlZmF1bHRWYWx1ZTtcblx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aCA9IHByb3BlcnR5Lm5hbWU7XG5cdFx0XHRpZiAoIShwcm9wZXJ0eVBhdGggaW4gZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzKSkge1xuXHRcdFx0XHRpZiAoZGVmYXVsdEZpbHRlclZhbHVlICYmICEocHJvcGVydHlQYXRoIGluIFVJU2VsZWN0aW9uRmllbGRzKSkge1xuXHRcdFx0XHRcdGNvbnN0IEZpbHRlckZpZWxkOiBGaWx0ZXJGaWVsZCB8IHVuZGVmaW5lZCA9IGdldEZpbHRlckZpZWxkKHByb3BlcnR5UGF0aCwgY29udmVydGVyQ29udGV4dCwgZW50aXR5VHlwZSk7XG5cdFx0XHRcdFx0aWYgKEZpbHRlckZpZWxkKSB7XG5cdFx0XHRcdFx0XHRzZWxlY3Rpb25GaWVsZHMucHVzaChGaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIHNlbGVjdGlvbkZpZWxkcztcbn07XG5cbi8qKlxuICogR2V0IGFsbCBwYXJhbWV0ZXIgZmlsdGVyIGZpZWxkcyBpbiBjYXNlIG9mIGEgcGFyYW1ldGVyaXplZCBzZXJ2aWNlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBwYXJhbWV0ZXIgRmlsdGVyRmllbGRzXG4gKi9cbmZ1bmN0aW9uIF9nZXRQYXJhbWV0ZXJGaWVsZHMoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IEZpbHRlckZpZWxkW10ge1xuXHRjb25zdCBkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdGNvbnN0IHBhcmFtZXRlckVudGl0eVR5cGUgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0LmVudGl0eVR5cGU7XG5cdGNvbnN0IGlzUGFyYW1ldGVyaXplZCA9ICEhcGFyYW1ldGVyRW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5SZXN1bHRDb250ZXh0ICYmICFkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVNldDtcblx0Y29uc3QgcGFyYW1ldGVyQ29udmVydGVyQ29udGV4dCA9XG5cdFx0aXNQYXJhbWV0ZXJpemVkICYmIGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihgLyR7ZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lfWApO1xuXG5cdHJldHVybiAoXG5cdFx0cGFyYW1ldGVyQ29udmVydGVyQ29udGV4dFxuXHRcdFx0PyBwYXJhbWV0ZXJFbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMubWFwKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuXHRcdFx0XHRcdHJldHVybiBfZ2V0RmlsdGVyRmllbGQoXG5cdFx0XHRcdFx0XHR7fSBhcyBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4sXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eS5uYW1lLFxuXHRcdFx0XHRcdFx0cGFyYW1ldGVyQ29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdHBhcmFtZXRlckVudGl0eVR5cGVcblx0XHRcdFx0XHQpO1xuXHRcdFx0ICB9KVxuXHRcdFx0OiBbXVxuXHQpIGFzIEZpbHRlckZpZWxkW107XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgRmlsdGVyQmFyIHNlYXJjaCBmaWVsZCBpcyBoaWRkZW4gb3Igbm90LlxuICpcbiAqIEBwYXJhbSBsaXN0UmVwb3J0VGFibGVzIFRoZSBsaXN0IHJlcG9ydCB0YWJsZXNcbiAqIEBwYXJhbSBjaGFydHMgVGhlIEFMUCBjaGFydHNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGluZm9ybWF0aW9uIGlmIHRoZSBGaWx0ZXJCYXIgc2VhcmNoIGZpZWxkIGlzIGhpZGRlbiBvciBub3RcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEZpbHRlckJhcmhpZGVCYXNpY1NlYXJjaCA9IGZ1bmN0aW9uIChcblx0bGlzdFJlcG9ydFRhYmxlczogVGFibGVWaXN1YWxpemF0aW9uW10sXG5cdGNoYXJ0czogQ2hhcnRWaXN1YWxpemF0aW9uW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IGJvb2xlYW4ge1xuXHQvLyBDaGVjayBpZiBjaGFydHMgYWxsb3cgc2VhcmNoXG5cdGNvbnN0IG5vU2VhcmNoSW5DaGFydHMgPSBjaGFydHMubGVuZ3RoID09PSAwIHx8IGNoYXJ0cy5ldmVyeSgoY2hhcnQpID0+ICFjaGFydC5hcHBseVN1cHBvcnRlZC5lbmFibGVTZWFyY2gpO1xuXG5cdC8vIENoZWNrIGlmIGFsbCB0YWJsZXMgYXJlIGFuYWx5dGljYWwgYW5kIG5vbmUgb2YgdGhlbSBhbGxvdyBmb3Igc2VhcmNoXG5cdGNvbnN0IG5vU2VhcmNoSW5UYWJsZXMgPVxuXHRcdGxpc3RSZXBvcnRUYWJsZXMubGVuZ3RoID09PSAwIHx8IGxpc3RSZXBvcnRUYWJsZXMuZXZlcnkoKHRhYmxlKSA9PiB0YWJsZS5lbmFibGVBbmFseXRpY3MgJiYgIXRhYmxlLmVuYWJsZUFuYWx5dGljc1NlYXJjaCk7XG5cblx0Y29uc3QgY29udGV4dFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKCk7XG5cdGlmIChjb250ZXh0UGF0aCAmJiBub1NlYXJjaEluQ2hhcnRzICYmIG5vU2VhcmNoSW5UYWJsZXMpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKlxuICogUmV0cmlldmVzIGZpbHRlciBmaWVsZHMgZnJvbSB0aGUgbWFuaWZlc3QuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGN1cnJlbnQgZW50aXR5VHlwZVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgZmlsdGVyIGZpZWxkcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICovXG5leHBvcnQgY29uc3QgZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMgPSBmdW5jdGlvbiAoXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnRGaWx0ZXJGaWVsZD4ge1xuXHRjb25zdCBmYkNvbmZpZzogRmlsdGVyTWFuaWZlc3RDb25maWd1cmF0aW9uID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXRGaWx0ZXJDb25maWd1cmF0aW9uKCk7XG5cdGNvbnN0IGRlZmluZWRGaWx0ZXJGaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkTWFuaWZlc3RDb25maWd1cmF0aW9uPiA9IGZiQ29uZmlnPy5maWx0ZXJGaWVsZHMgfHwge307XG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+ID0gX2dldFNlbGVjdGlvbkZpZWxkc0J5UGF0aChcblx0XHRlbnRpdHlUeXBlLFxuXHRcdE9iamVjdC5rZXlzKGRlZmluZWRGaWx0ZXJGaWVsZHMpLm1hcCgoa2V5KSA9PiBLZXlIZWxwZXIuZ2V0UGF0aEZyb21TZWxlY3Rpb25GaWVsZEtleShrZXkpKSxcblx0XHR0cnVlLFxuXHRcdGNvbnZlcnRlckNvbnRleHRcblx0KTtcblx0Y29uc3QgZmlsdGVyRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21FbGVtZW50RmlsdGVyRmllbGQ+ID0ge307XG5cblx0Zm9yIChjb25zdCBzS2V5IGluIGRlZmluZWRGaWx0ZXJGaWVsZHMpIHtcblx0XHRjb25zdCBmaWx0ZXJGaWVsZCA9IGRlZmluZWRGaWx0ZXJGaWVsZHNbc0tleV07XG5cdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gS2V5SGVscGVyLmdldFBhdGhGcm9tU2VsZWN0aW9uRmllbGRLZXkoc0tleSk7XG5cdFx0Y29uc3Qgc2VsZWN0aW9uRmllbGQgPSBzZWxlY3Rpb25GaWVsZHNbcHJvcGVydHlOYW1lXTtcblx0XHRjb25zdCB0eXBlID0gZmlsdGVyRmllbGQudHlwZSA9PT0gXCJTbG90XCIgPyBmaWx0ZXJGaWVsZFR5cGUuU2xvdCA6IGZpbHRlckZpZWxkVHlwZS5EZWZhdWx0O1xuXHRcdGNvbnN0IHZpc3VhbEZpbHRlciA9XG5cdFx0XHRmaWx0ZXJGaWVsZCAmJiBmaWx0ZXJGaWVsZD8udmlzdWFsRmlsdGVyXG5cdFx0XHRcdD8gZ2V0VmlzdWFsRmlsdGVycyhlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0LCBzS2V5LCBkZWZpbmVkRmlsdGVyRmllbGRzKVxuXHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRmaWx0ZXJGaWVsZHNbc0tleV0gPSB7XG5cdFx0XHRrZXk6IHNLZXksXG5cdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0c2xvdE5hbWU6IGZpbHRlckZpZWxkPy5zbG90TmFtZSB8fCBzS2V5LFxuXHRcdFx0YW5ub3RhdGlvblBhdGg6IHNlbGVjdGlvbkZpZWxkPy5hbm5vdGF0aW9uUGF0aCxcblx0XHRcdGNvbmRpdGlvblBhdGg6IHNlbGVjdGlvbkZpZWxkPy5jb25kaXRpb25QYXRoIHx8IHByb3BlcnR5TmFtZSxcblx0XHRcdHRlbXBsYXRlOiBmaWx0ZXJGaWVsZC50ZW1wbGF0ZSxcblx0XHRcdGxhYmVsOiBmaWx0ZXJGaWVsZC5sYWJlbCxcblx0XHRcdHBvc2l0aW9uOiBmaWx0ZXJGaWVsZC5wb3NpdGlvbiB8fCB7IHBsYWNlbWVudDogUGxhY2VtZW50LkFmdGVyIH0sXG5cdFx0XHRhdmFpbGFiaWxpdHk6IGZpbHRlckZpZWxkLmF2YWlsYWJpbGl0eSB8fCBBdmFpbGFiaWxpdHlUeXBlLkRlZmF1bHQsXG5cdFx0XHRzZXR0aW5nczogZmlsdGVyRmllbGQuc2V0dGluZ3MsXG5cdFx0XHR2aXN1YWxGaWx0ZXI6IHZpc3VhbEZpbHRlcixcblx0XHRcdHJlcXVpcmVkOiBmaWx0ZXJGaWVsZC5yZXF1aXJlZFxuXHRcdH07XG5cdH1cblx0cmV0dXJuIGZpbHRlckZpZWxkcztcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRGaWx0ZXJGaWVsZCA9IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCwgZW50aXR5VHlwZTogRW50aXR5VHlwZSkge1xuXHRyZXR1cm4gX2dldEZpbHRlckZpZWxkKHt9LCBwcm9wZXJ0eVBhdGgsIGNvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGUpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEZpbHRlclJlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbjogYW55LCBzUmVzdHJpY3Rpb246IGFueSkge1xuXHRpZiAoc1Jlc3RyaWN0aW9uID09PSBcIlJlcXVpcmVkUHJvcGVydGllc1wiIHx8IHNSZXN0cmljdGlvbiA9PT0gXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB7XG5cdFx0bGV0IGFQcm9wcyA9IFtdO1xuXHRcdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbltzUmVzdHJpY3Rpb25dKSB7XG5cdFx0XHRhUHJvcHMgPSBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbltzUmVzdHJpY3Rpb25dLm1hcChmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoIHx8IG9Qcm9wZXJ0eS52YWx1ZTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gYVByb3BzO1xuXHR9IGVsc2UgaWYgKHNSZXN0cmljdGlvbiA9PT0gXCJGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnNcIikge1xuXHRcdGNvbnN0IG1BbGxvd2VkRXhwcmVzc2lvbnMgPSB7fSBhcyBhbnk7XG5cdFx0aWYgKG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uICYmIG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMpIHtcblx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdFx0XHRpZiAobUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHkudmFsdWVdKSB7XG5cdFx0XHRcdFx0bUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHkudmFsdWVdLnB1c2gob1Byb3BlcnR5LkFsbG93ZWRFeHByZXNzaW9ucyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHkudmFsdWVdID0gW29Qcm9wZXJ0eS5BbGxvd2VkRXhwcmVzc2lvbnNdO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIG1BbGxvd2VkRXhwcmVzc2lvbnM7XG5cdH1cblx0cmV0dXJuIG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uO1xufTtcblxuY29uc3QgZ2V0U2VhcmNoRmlsdGVyUHJvcGVydHlJbmZvID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IFwiJHNlYXJjaFwiLFxuXHRcdHBhdGg6IFwiJHNlYXJjaFwiLFxuXHRcdGRhdGFUeXBlOiBzU3RyaW5nRGF0YVR5cGUsXG5cdFx0bWF4Q29uZGl0aW9uczogMVxuXHR9O1xufTtcblxuY29uc3QgZ2V0RWRpdFN0YXRlRmlsdGVyUHJvcGVydHlJbmZvID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IFwiJGVkaXRTdGF0ZVwiLFxuXHRcdHBhdGg6IFwiJGVkaXRTdGF0ZVwiLFxuXHRcdGdyb3VwTGFiZWw6IFwiXCIsXG5cdFx0Z3JvdXA6IFwiXCIsXG5cdFx0ZGF0YVR5cGU6IHNTdHJpbmdEYXRhVHlwZSxcblx0XHRoaWRkZW5GaWx0ZXI6IGZhbHNlXG5cdH07XG59O1xuXG5jb25zdCBnZXRTZWFyY2hSZXN0cmljdGlvbnMgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRsZXQgc2VhcmNoUmVzdHJpY3Rpb25zO1xuXHRpZiAoIU1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpKSB7XG5cdFx0Y29uc3QgY2FwYWJpbGl0ZXMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpPy5hbm5vdGF0aW9ucz8uQ2FwYWJpbGl0aWVzIGFzIEVudGl0eVNldEFubm90YXRpb25zX0NhcGFiaWxpdGllcztcblx0XHRzZWFyY2hSZXN0cmljdGlvbnMgPSBjYXBhYmlsaXRlcz8uU2VhcmNoUmVzdHJpY3Rpb25zO1xuXHR9XG5cdHJldHVybiBzZWFyY2hSZXN0cmljdGlvbnM7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBzTmF2aWdhdGlvblBhdGg6IHN0cmluZykge1xuXHRjb25zdCBvTmF2aWdhdGlvblJlc3RyaWN0aW9uczogYW55ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKT8uYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcz8uTmF2aWdhdGlvblJlc3RyaWN0aW9ucztcblx0Y29uc3QgYVJlc3RyaWN0ZWRQcm9wZXJ0aWVzID0gb05hdmlnYXRpb25SZXN0cmljdGlvbnMgJiYgb05hdmlnYXRpb25SZXN0cmljdGlvbnMuUmVzdHJpY3RlZFByb3BlcnRpZXM7XG5cdHJldHVybiAoXG5cdFx0YVJlc3RyaWN0ZWRQcm9wZXJ0aWVzICYmXG5cdFx0YVJlc3RyaWN0ZWRQcm9wZXJ0aWVzLmZpbmQoZnVuY3Rpb24gKG9SZXN0cmljdGVkUHJvcGVydHk6IGFueSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0b1Jlc3RyaWN0ZWRQcm9wZXJ0eSAmJlxuXHRcdFx0XHRvUmVzdHJpY3RlZFByb3BlcnR5Lk5hdmlnYXRpb25Qcm9wZXJ0eSAmJlxuXHRcdFx0XHQob1Jlc3RyaWN0ZWRQcm9wZXJ0eS5OYXZpZ2F0aW9uUHJvcGVydHkuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPT09IHNOYXZpZ2F0aW9uUGF0aCB8fFxuXHRcdFx0XHRcdG9SZXN0cmljdGVkUHJvcGVydHkuTmF2aWdhdGlvblByb3BlcnR5LnZhbHVlID09PSBzTmF2aWdhdGlvblBhdGgpXG5cdFx0XHQpO1xuXHRcdH0pXG5cdCk7XG59O1xuXG5jb25zdCBfZmV0Y2hCYXNpY1Byb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChvRmlsdGVyRmllbGRJbmZvOiBhbnkpIHtcblx0cmV0dXJuIHtcblx0XHRrZXk6IG9GaWx0ZXJGaWVsZEluZm8ua2V5LFxuXHRcdGFubm90YXRpb25QYXRoOiBvRmlsdGVyRmllbGRJbmZvLmFubm90YXRpb25QYXRoLFxuXHRcdGNvbmRpdGlvblBhdGg6IG9GaWx0ZXJGaWVsZEluZm8uY29uZGl0aW9uUGF0aCxcblx0XHRuYW1lOiBvRmlsdGVyRmllbGRJbmZvLmNvbmRpdGlvblBhdGgsXG5cdFx0bGFiZWw6IG9GaWx0ZXJGaWVsZEluZm8ubGFiZWwsXG5cdFx0aGlkZGVuRmlsdGVyOiBvRmlsdGVyRmllbGRJbmZvLmF2YWlsYWJpbGl0eSA9PT0gXCJIaWRkZW5cIixcblx0XHRkaXNwbGF5OiBcIlZhbHVlXCIsXG5cdFx0aXNQYXJhbWV0ZXI6IG9GaWx0ZXJGaWVsZEluZm8uaXNQYXJhbWV0ZXIsXG5cdFx0Y2FzZVNlbnNpdGl2ZTogb0ZpbHRlckZpZWxkSW5mby5jYXNlU2Vuc2l0aXZlLFxuXHRcdGF2YWlsYWJpbGl0eTogb0ZpbHRlckZpZWxkSW5mby5hdmFpbGFiaWxpdHksXG5cdFx0cG9zaXRpb246IG9GaWx0ZXJGaWVsZEluZm8ucG9zaXRpb24sXG5cdFx0dHlwZTogb0ZpbHRlckZpZWxkSW5mby50eXBlLFxuXHRcdHRlbXBsYXRlOiBvRmlsdGVyRmllbGRJbmZvLnRlbXBsYXRlLFxuXHRcdG1lbnU6IG9GaWx0ZXJGaWVsZEluZm8ubWVudSxcblx0XHRyZXF1aXJlZDogb0ZpbHRlckZpZWxkSW5mby5yZXF1aXJlZFxuXHR9O1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24gPSBmdW5jdGlvbiAoYUV4cHJlc3Npb25zOiBhbnkpIHtcblx0Y29uc3QgYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5ID0gW1xuXHRcdFwiU2luZ2xlVmFsdWVcIixcblx0XHRcIk11bHRpVmFsdWVcIixcblx0XHRcIlNpbmdsZVJhbmdlXCIsXG5cdFx0XCJNdWx0aVJhbmdlXCIsXG5cdFx0XCJTZWFyY2hFeHByZXNzaW9uXCIsXG5cdFx0XCJNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXCJcblx0XTtcblxuXHRhRXhwcmVzc2lvbnMuc29ydChmdW5jdGlvbiAoYTogYW55LCBiOiBhbnkpIHtcblx0XHRyZXR1cm4gYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5LmluZGV4T2YoYSkgLSBhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkuaW5kZXhPZihiKTtcblx0fSk7XG5cblx0cmV0dXJuIGFFeHByZXNzaW9uc1swXTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNwbGF5TW9kZSA9IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55LCBvQ29sbGVjdGlvbkFubm90YXRpb25zOiBhbnkpIHtcblx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dCxcblx0XHRvVGV4dEFycmFuZ21lbnRBbm5vdGF0aW9uID1cblx0XHRcdG9UZXh0QW5ub3RhdGlvbiAmJlxuXHRcdFx0KChvUHJvcGVydHlBbm5vdGF0aW9ucyAmJiBvUHJvcGVydHlBbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0Py5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudCkgfHxcblx0XHRcdFx0KG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMgJiYgb0NvbGxlY3Rpb25Bbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudCkpO1xuXG5cdGlmIChvVGV4dEFycmFuZ21lbnRBbm5vdGF0aW9uKSB7XG5cdFx0aWYgKG9UZXh0QXJyYW5nbWVudEFubm90YXRpb24udmFsdWVPZigpID09PSBcIlVJLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIikge1xuXHRcdFx0cmV0dXJuIFwiRGVzY3JpcHRpb25cIjtcblx0XHR9IGVsc2UgaWYgKG9UZXh0QXJyYW5nbWVudEFubm90YXRpb24udmFsdWVPZigpID09PSBcIlVJLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dExhc3RcIikge1xuXHRcdFx0cmV0dXJuIFwiVmFsdWVEZXNjcmlwdGlvblwiO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJEZXNjcmlwdGlvblZhbHVlXCI7IC8vVGV4dEZpcnN0XG5cdH1cblx0cmV0dXJuIG9UZXh0QW5ub3RhdGlvbiA/IFwiRGVzY3JpcHRpb25WYWx1ZVwiIDogXCJWYWx1ZVwiO1xufTtcblxuZXhwb3J0IGNvbnN0IGZldGNoUHJvcGVydHlJbmZvID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIG9GaWx0ZXJGaWVsZEluZm86IGFueSwgb1R5cGVDb25maWc6IGFueSkge1xuXHRsZXQgb1Byb3BlcnR5SW5mbyA9IF9mZXRjaEJhc2ljUHJvcGVydHlJbmZvKG9GaWx0ZXJGaWVsZEluZm8pO1xuXHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBvRmlsdGVyRmllbGRJbmZvLmFubm90YXRpb25QYXRoO1xuXG5cdGlmICghc0Fubm90YXRpb25QYXRoKSB7XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG5cdH1cblx0Y29uc3QgdGFyZ2V0UHJvcGVydHlPYmplY3QgPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlckNvbnRleHRGb3Ioc0Fubm90YXRpb25QYXRoKS5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkudGFyZ2V0T2JqZWN0O1xuXG5cdGNvbnN0IG9Qcm9wZXJ0eUFubm90YXRpb25zID0gdGFyZ2V0UHJvcGVydHlPYmplY3Q/LmFubm90YXRpb25zO1xuXHRjb25zdCBvQ29sbGVjdGlvbkFubm90YXRpb25zID0gY29udmVydGVyQ29udGV4dD8uZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM7XG5cblx0Y29uc3Qgb0Zvcm1hdE9wdGlvbnMgPSBvVHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zO1xuXHRjb25zdCBvQ29uc3RyYWludHMgPSBvVHlwZUNvbmZpZy5jb25zdHJhaW50cztcblx0b1Byb3BlcnR5SW5mbyA9IE9iamVjdC5hc3NpZ24ob1Byb3BlcnR5SW5mbywge1xuXHRcdGZvcm1hdE9wdGlvbnM6IG9Gb3JtYXRPcHRpb25zLFxuXHRcdGNvbnN0cmFpbnRzOiBvQ29uc3RyYWludHMsXG5cdFx0ZGlzcGxheTogZGlzcGxheU1vZGUob1Byb3BlcnR5QW5ub3RhdGlvbnMsIG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMpXG5cdH0pO1xuXHRyZXR1cm4gb1Byb3BlcnR5SW5mbztcbn07XG5cbmV4cG9ydCBjb25zdCBpc011bHRpVmFsdWUgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnkpIHtcblx0bGV0IGJJc011bHRpVmFsdWUgPSB0cnVlO1xuXHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdHN3aXRjaCAob1Byb3BlcnR5LmZpbHRlckV4cHJlc3Npb24pIHtcblx0XHRjYXNlIFwiU2VhcmNoRXhwcmVzc2lvblwiOlxuXHRcdGNhc2UgXCJTaW5nbGVSYW5nZVwiOlxuXHRcdGNhc2UgXCJTaW5nbGVWYWx1ZVwiOlxuXHRcdFx0YklzTXVsdGlWYWx1ZSA9IGZhbHNlO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG5cdGlmIChvUHJvcGVydHkudHlwZSAmJiBvUHJvcGVydHkudHlwZS5pbmRleE9mKFwiQm9vbGVhblwiKSA+IDApIHtcblx0XHRiSXNNdWx0aVZhbHVlID0gZmFsc2U7XG5cdH1cblx0cmV0dXJuIGJJc011bHRpVmFsdWU7XG59O1xuXG5jb25zdCBfaXNGaWx0ZXJhYmxlTmF2aWdhdGlvblByb3BlcnR5ID0gZnVuY3Rpb24gKFxuXHRlbnRyeTogRGF0YUZpZWxkQWJzdHJhY3RUeXBlc1xuKTogZW50cnkgaXMgQW5ub3RhdGlvblRlcm08RGF0YUZpZWxkIHwgRGF0YUZpZWxkV2l0aFVybCB8IERhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aD4ge1xuXHRyZXR1cm4gKFxuXHRcdChlbnRyeS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkIHx8XG5cdFx0XHRlbnRyeS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCB8fFxuXHRcdFx0ZW50cnkuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCkgJiZcblx0XHRlbnRyeS5WYWx1ZS5wYXRoLmluY2x1ZGVzKFwiL1wiKVxuXHQpO1xufTtcblxuY29uc3QgZ2V0QW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhID0gZnVuY3Rpb24gKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRsclRhYmxlczogVGFibGVWaXN1YWxpemF0aW9uW10gPSBbXSxcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZyA9IFwiXCIsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4gPSBmYWxzZSxcblx0bGluZUl0ZW1UZXJtPzogc3RyaW5nXG4pIHtcblx0Ly8gRmV0Y2ggYWxsIHNlbGVjdGlvblZhcmlhbnRzIGRlZmluZWQgaW4gdGhlIGRpZmZlcmVudCB2aXN1YWxpemF0aW9ucyBhbmQgZGlmZmVyZW50IHZpZXdzIChtdWx0aSB0YWJsZSBtb2RlKVxuXHRjb25zdCBzZWxlY3Rpb25WYXJpYW50czogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb25bXSA9IGdldFNlbGVjdGlvblZhcmlhbnRzKGxyVGFibGVzLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHQvLyBjcmVhdGUgYSBtYXAgb2YgcHJvcGVydGllcyB0byBiZSB1c2VkIGluIHNlbGVjdGlvbiB2YXJpYW50c1xuXHRjb25zdCBleGNsdWRlZEZpbHRlclByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0gZ2V0RXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzKHNlbGVjdGlvblZhcmlhbnRzKTtcblx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHQvL0ZpbHRlcnMgd2hpY2ggaGFzIHRvIGJlIGFkZGVkIHdoaWNoIGlzIHBhcnQgb2YgU1YvRGVmYXVsdCBhbm5vdGF0aW9ucyBidXQgbm90IHByZXNlbnQgaW4gdGhlIFNlbGVjdGlvbkZpZWxkc1xuXHRjb25zdCBhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHMgPSAoKGFubm90YXRpb25QYXRoICYmIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oYW5ub3RhdGlvblBhdGgpPy5hbm5vdGF0aW9uKSB8fFxuXHRcdGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5TZWxlY3Rpb25GaWVsZHMgfHxcblx0XHRbXSkgYXMgUHJvcGVydHlQYXRoW107XG5cblx0Y29uc3QgbmF2UHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblx0aWYgKGxyVGFibGVzLmxlbmd0aCA9PT0gMCAmJiAhIWxpbmVJdGVtVGVybSkge1xuXHRcdChjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKGxpbmVJdGVtVGVybSkuYW5ub3RhdGlvbiBhcyBMaW5lSXRlbSk/LmZvckVhY2goKGVudHJ5KSA9PiB7XG5cdFx0XHRpZiAoX2lzRmlsdGVyYWJsZU5hdmlnYXRpb25Qcm9wZXJ0eShlbnRyeSkpIHtcblx0XHRcdFx0Y29uc3QgZW50aXR5UGF0aCA9IGVudHJ5LlZhbHVlLnBhdGguc2xpY2UoMCwgZW50cnkuVmFsdWUucGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xuXHRcdFx0XHRpZiAoIW5hdlByb3BlcnRpZXMuaW5jbHVkZXMoZW50aXR5UGF0aCkpIHtcblx0XHRcdFx0XHRuYXZQcm9wZXJ0aWVzLnB1c2goZW50aXR5UGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIGNyZWF0ZSBhIG1hcCBvZiBhbGwgcG90ZW50aWFsIGZpbHRlciBmaWVsZHMgYmFzZWQgb24uLi5cblx0Y29uc3QgZmlsdGVyRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4gPSB7XG5cdFx0Ly8gLi4ubm9uIGhpZGRlbiBwcm9wZXJ0aWVzIG9mIHRoZSBlbnRpdHlcblx0XHQuLi5fZ2V0U2VsZWN0aW9uRmllbGRzKGVudGl0eVR5cGUsIFwiXCIsIGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcywgaW5jbHVkZUhpZGRlbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0Ly8gLi4uIG5vbiBoaWRkZW4gcHJvcGVydGllcyBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcblx0XHQuLi5fZ2V0U2VsZWN0aW9uRmllbGRzQnlQYXRoKGVudGl0eVR5cGUsIG5hdlByb3BlcnRpZXMsIGZhbHNlLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHQvLyAuLi5hZGRpdGlvbmFsIG1hbmlmZXN0IGRlZmluZWQgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG5cdFx0Li4uX2dldFNlbGVjdGlvbkZpZWxkc0J5UGF0aChcblx0XHRcdGVudGl0eVR5cGUsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmdldEZpbHRlckNvbmZpZ3VyYXRpb24oKS5uYXZpZ2F0aW9uUHJvcGVydGllcyxcblx0XHRcdGluY2x1ZGVIaWRkZW4sXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0KVxuXHR9O1xuXHRsZXQgYVNlbGVjdE9wdGlvbnM6IGFueVtdID0gW107XG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBnZXRTZWxlY3Rpb25WYXJpYW50KGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRpZiAoc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdGFTZWxlY3RPcHRpb25zID0gc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zO1xuXHR9XG5cblx0Y29uc3QgcHJvcGVydHlJbmZvRmllbGRzOiBhbnkgPVxuXHRcdGFubm90YXRlZFNlbGVjdGlvbkZpZWxkcz8ucmVkdWNlKChzZWxlY3Rpb25GaWVsZHM6IEZpbHRlckZpZWxkW10sIHNlbGVjdGlvbkZpZWxkKSA9PiB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBzZWxlY3Rpb25GaWVsZC52YWx1ZTtcblx0XHRcdGlmICghKHByb3BlcnR5UGF0aCBpbiBleGNsdWRlZEZpbHRlclByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdGxldCBuYXZpZ2F0aW9uUGF0aDogc3RyaW5nO1xuXHRcdFx0XHRpZiAoYW5ub3RhdGlvblBhdGguc3RhcnRzV2l0aChcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIikpIHtcblx0XHRcdFx0XHRuYXZpZ2F0aW9uUGF0aCA9IFwiXCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGggPSBhbm5vdGF0aW9uUGF0aC5zcGxpdChcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIpWzBdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgZmlsdGVyUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblBhdGggPyBuYXZpZ2F0aW9uUGF0aCArIFwiL1wiICsgcHJvcGVydHlQYXRoIDogcHJvcGVydHlQYXRoO1xuXHRcdFx0XHRjb25zdCBmaWx0ZXJGaWVsZDogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQgPSBfZ2V0RmlsdGVyRmllbGQoXG5cdFx0XHRcdFx0ZmlsdGVyRmllbGRzLFxuXHRcdFx0XHRcdGZpbHRlclByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdGVudGl0eVR5cGVcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKGZpbHRlckZpZWxkKSB7XG5cdFx0XHRcdFx0ZmlsdGVyRmllbGQuZ3JvdXAgPSBcIlwiO1xuXHRcdFx0XHRcdGZpbHRlckZpZWxkLmdyb3VwTGFiZWwgPSBcIlwiO1xuXHRcdFx0XHRcdHNlbGVjdGlvbkZpZWxkcy5wdXNoKGZpbHRlckZpZWxkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNlbGVjdGlvbkZpZWxkcztcblx0XHR9LCBbXSkgfHwgW107XG5cblx0Y29uc3QgZGVmYXVsdEZpbHRlckZpZWxkcyA9IF9nZXREZWZhdWx0RmlsdGVyRmllbGRzKFxuXHRcdGFTZWxlY3RPcHRpb25zLFxuXHRcdGVudGl0eVR5cGUsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRleGNsdWRlZEZpbHRlclByb3BlcnRpZXMsXG5cdFx0YW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzXG5cdCk7XG5cblx0cmV0dXJuIHtcblx0XHRleGNsdWRlZEZpbHRlclByb3BlcnRpZXM6IGV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcyxcblx0XHRlbnRpdHlUeXBlOiBlbnRpdHlUeXBlLFxuXHRcdGFubm90YXRlZFNlbGVjdGlvbkZpZWxkczogYW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzLFxuXHRcdGZpbHRlckZpZWxkczogZmlsdGVyRmllbGRzLFxuXHRcdHByb3BlcnR5SW5mb0ZpZWxkczogcHJvcGVydHlJbmZvRmllbGRzLFxuXHRcdGRlZmF1bHRGaWx0ZXJGaWVsZHM6IGRlZmF1bHRGaWx0ZXJGaWVsZHNcblx0fTtcbn07XG5cbmV4cG9ydCBjb25zdCBmZXRjaFR5cGVDb25maWcgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KSB7XG5cdGNvbnN0IG9UeXBlQ29uZmlnID0gZ2V0VHlwZUNvbmZpZyhwcm9wZXJ0eSwgcHJvcGVydHk/LnR5cGUpO1xuXHRpZiAocHJvcGVydHk/LnR5cGUgPT09IHNFZG1TdHJpbmcgJiYgKG9UeXBlQ29uZmlnLmNvbnN0cmFpbnRzLm51bGxhYmxlID09PSB1bmRlZmluZWQgfHwgb1R5cGVDb25maWcuY29uc3RyYWludHMubnVsbGFibGUgPT09IHRydWUpKSB7XG5cdFx0b1R5cGVDb25maWcuZm9ybWF0T3B0aW9ucy5wYXJzZUtlZXBzRW1wdHlTdHJpbmcgPSBmYWxzZTtcblx0fVxuXHRyZXR1cm4gb1R5cGVDb25maWc7XG59O1xuXG5leHBvcnQgY29uc3QgYXNzaWduRGF0YVR5cGVUb1Byb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChcblx0cHJvcGVydHlJbmZvRmllbGQ6IGFueSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0YVJlcXVpcmVkUHJvcHM6IGFueSxcblx0YVR5cGVDb25maWc6IGFueVxuKSB7XG5cdGxldCBvUHJvcGVydHlJbmZvOiBhbnkgPSBmZXRjaFByb3BlcnR5SW5mbyhjb252ZXJ0ZXJDb250ZXh0LCBwcm9wZXJ0eUluZm9GaWVsZCwgYVR5cGVDb25maWdbcHJvcGVydHlJbmZvRmllbGQua2V5XSksXG5cdFx0c1Byb3BlcnR5UGF0aDogc3RyaW5nID0gXCJcIjtcblx0aWYgKHByb3BlcnR5SW5mb0ZpZWxkLmNvbmRpdGlvblBhdGgpIHtcblx0XHRzUHJvcGVydHlQYXRoID0gcHJvcGVydHlJbmZvRmllbGQuY29uZGl0aW9uUGF0aC5yZXBsYWNlKC9cXCt8XFwqL2csIFwiXCIpO1xuXHR9XG5cdGlmIChvUHJvcGVydHlJbmZvKSB7XG5cdFx0b1Byb3BlcnR5SW5mbyA9IE9iamVjdC5hc3NpZ24ob1Byb3BlcnR5SW5mbywge1xuXHRcdFx0bWF4Q29uZGl0aW9uczogIW9Qcm9wZXJ0eUluZm8uaXNQYXJhbWV0ZXIgJiYgaXNNdWx0aVZhbHVlKG9Qcm9wZXJ0eUluZm8pID8gLTEgOiAxLFxuXHRcdFx0cmVxdWlyZWQ6IHByb3BlcnR5SW5mb0ZpZWxkLnJlcXVpcmVkID8/IChvUHJvcGVydHlJbmZvLmlzUGFyYW1ldGVyIHx8IGFSZXF1aXJlZFByb3BzLmluZGV4T2Yoc1Byb3BlcnR5UGF0aCkgPj0gMCksXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRkYXRhVHlwZTogYVR5cGVDb25maWdbcHJvcGVydHlJbmZvRmllbGQua2V5XS50eXBlXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG59O1xuXG5leHBvcnQgY29uc3QgcHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyA9IGZ1bmN0aW9uIChcblx0cHJvcGVydHlJbmZvRmllbGRzOiBhbnksXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGRlZmF1bHRWYWx1ZVByb3BlcnR5RmllbGRzPzogYW55XG4pIHtcblx0Ly9nZXQgVHlwZUNvbmZpZyBmdW5jdGlvblxuXHRjb25zdCBzZWxlY3Rpb25GaWVsZFR5cGVzOiBhbnkgPSBbXTtcblx0Y29uc3QgYVR5cGVDb25maWc6IGFueSA9IHt9O1xuXG5cdGlmIChkZWZhdWx0VmFsdWVQcm9wZXJ0eUZpZWxkcykge1xuXHRcdHByb3BlcnR5SW5mb0ZpZWxkcyA9IHByb3BlcnR5SW5mb0ZpZWxkcy5jb25jYXQoZGVmYXVsdFZhbHVlUHJvcGVydHlGaWVsZHMpO1xuXHR9XG5cdC8vYWRkIHR5cGVDb25maWdcblx0cHJvcGVydHlJbmZvRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtZXRlckZpZWxkOiBhbnkpIHtcblx0XHRpZiAocGFyYW1ldGVyRmllbGQuYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5Q29udmVydHlDb250ZXh0ID0gY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZXJDb250ZXh0Rm9yKHBhcmFtZXRlckZpZWxkLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHByb3BlcnR5VGFyZ2V0T2JqZWN0ID0gcHJvcGVydHlDb252ZXJ0eUNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdDtcblx0XHRcdHNlbGVjdGlvbkZpZWxkVHlwZXMucHVzaChwcm9wZXJ0eVRhcmdldE9iamVjdD8udHlwZSk7XG5cdFx0XHRjb25zdCBvVHlwZUNvbmZpZyA9IGZldGNoVHlwZUNvbmZpZyhwcm9wZXJ0eVRhcmdldE9iamVjdCk7XG5cdFx0XHRhVHlwZUNvbmZpZ1twYXJhbWV0ZXJGaWVsZC5rZXldID0gb1R5cGVDb25maWc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdGlvbkZpZWxkVHlwZXMucHVzaChzRWRtU3RyaW5nKTtcblx0XHRcdGFUeXBlQ29uZmlnW3BhcmFtZXRlckZpZWxkLmtleV0gPSB7IHR5cGU6IHNTdHJpbmdEYXRhVHlwZSB9O1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gZmlsdGVyUmVzdHJpY3Rpb25zXG5cdGxldCBfb0ZpbHRlcnJlc3RyaWN0aW9ucztcblx0aWYgKCFNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpKSkge1xuXHRcdF9vRmlsdGVycmVzdHJpY3Rpb25zID0gKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXMgYXMgRW50aXR5U2V0QW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzKVxuXHRcdFx0Py5GaWx0ZXJSZXN0cmljdGlvbnM7XG5cdH1cblx0Y29uc3Qgb0ZpbHRlclJlc3RyaWN0aW9ucyA9IF9vRmlsdGVycmVzdHJpY3Rpb25zO1xuXHRjb25zdCBvUmV0ID0ge30gYXMgYW55O1xuXHRvUmV0W1wiUmVxdWlyZWRQcm9wZXJ0aWVzXCJdID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9GaWx0ZXJSZXN0cmljdGlvbnMsIFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIpIHx8IFtdO1xuXHRvUmV0W1wiTm9uRmlsdGVyYWJsZVByb3BlcnRpZXNcIl0gPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9ucywgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXTtcblx0b1JldFtcIkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1wiXSA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zLCBcIkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1wiKSB8fCB7fTtcblxuXHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKTtcblx0Y29uc3QgYVBhdGhQYXJ0cyA9IHNFbnRpdHlTZXRQYXRoLnNwbGl0KFwiL1wiKTtcblx0aWYgKGFQYXRoUGFydHMubGVuZ3RoID4gMikge1xuXHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IGFQYXRoUGFydHNbYVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRhUGF0aFBhcnRzLnNwbGljZSgtMSwgMSk7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25SZXN0cmljdGlvbnMgPSBnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQsIHNOYXZpZ2F0aW9uUGF0aCk7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25GaWx0ZXJSZXN0cmljdGlvbnMgPSBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyAmJiBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucy5GaWx0ZXJSZXN0cmljdGlvbnM7XG5cdFx0b1JldC5SZXF1aXJlZFByb3BlcnRpZXMuY29uY2F0KGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2aWdhdGlvbkZpbHRlclJlc3RyaWN0aW9ucywgXCJSZXF1aXJlZFByb3BlcnRpZXNcIikgfHwgW10pO1xuXHRcdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMuY29uY2F0KGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2aWdhdGlvbkZpbHRlclJlc3RyaWN0aW9ucywgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXSk7XG5cdFx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgPSB7XG5cdFx0XHQuLi4oZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9OYXZpZ2F0aW9uRmlsdGVyUmVzdHJpY3Rpb25zLCBcIkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1wiKSB8fCB7fSksXG5cdFx0XHQuLi5vUmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1xuXHRcdH07XG5cdH1cblx0Y29uc3QgYVJlcXVpcmVkUHJvcHMgPSBvUmV0LlJlcXVpcmVkUHJvcGVydGllcztcblx0Y29uc3QgYU5vbkZpbHRlcmFibGVQcm9wcyA9IG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXM7XG5cdGNvbnN0IGFGZXRjaGVkUHJvcGVydGllczogYW55ID0gW107XG5cblx0Ly8gcHJvY2VzcyB0aGUgZmllbGRzIHRvIGFkZCBuZWNlc3NhcnkgcHJvcGVydGllc1xuXHRwcm9wZXJ0eUluZm9GaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHlJbmZvRmllbGQ6IGFueSkge1xuXHRcdGxldCBzUHJvcGVydHlQYXRoO1xuXHRcdGlmIChhTm9uRmlsdGVyYWJsZVByb3BzLmluZGV4T2Yoc1Byb3BlcnR5UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRjb25zdCBvUHJvcGVydHlJbmZvID0gYXNzaWduRGF0YVR5cGVUb1Byb3BlcnR5SW5mbyhwcm9wZXJ0eUluZm9GaWVsZCwgY29udmVydGVyQ29udGV4dCwgYVJlcXVpcmVkUHJvcHMsIGFUeXBlQ29uZmlnKTtcblx0XHRcdGFGZXRjaGVkUHJvcGVydGllcy5wdXNoKG9Qcm9wZXJ0eUluZm8pO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9hZGQgZWRpdFxuXHRjb25zdCBkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdGlmIChNb2RlbEhlbHBlci5pc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZChkYXRhTW9kZWxPYmplY3RQYXRoKSkge1xuXHRcdGFGZXRjaGVkUHJvcGVydGllcy5wdXNoKGdldEVkaXRTdGF0ZUZpbHRlclByb3BlcnR5SW5mbygpKTtcblx0fVxuXHQvLyBhZGQgc2VhcmNoXG5cdGNvbnN0IHNlYXJjaFJlc3RyaWN0aW9ucyA9IGdldFNlYXJjaFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgaGlkZUJhc2ljU2VhcmNoID0gQm9vbGVhbihzZWFyY2hSZXN0cmljdGlvbnMgJiYgIXNlYXJjaFJlc3RyaWN0aW9ucy5TZWFyY2hhYmxlKTtcblx0aWYgKHNFbnRpdHlTZXRQYXRoICYmIGhpZGVCYXNpY1NlYXJjaCAhPT0gdHJ1ZSkge1xuXHRcdGlmICghc2VhcmNoUmVzdHJpY3Rpb25zIHx8IHNlYXJjaFJlc3RyaWN0aW9ucz8uU2VhcmNoYWJsZSkge1xuXHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2goZ2V0U2VhcmNoRmlsdGVyUHJvcGVydHlJbmZvKCkpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBhRmV0Y2hlZFByb3BlcnRpZXM7XG59O1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0Q3VzdG9tTWFuaWZlc3RFbGVtZW50cyA9IGZ1bmN0aW9uIChcblx0ZmlsdGVyRmllbGRzOiBNYW5pZmVzdEZpbHRlckZpZWxkW10sXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbikge1xuXHRyZXR1cm4gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoZmlsdGVyRmllbGRzLCBnZXRNYW5pZmVzdEZpbHRlckZpZWxkcyhlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KSwge1xuXHRcdGF2YWlsYWJpbGl0eTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRsYWJlbDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHR0eXBlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHBvc2l0aW9uOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHNsb3ROYW1lOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHRlbXBsYXRlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHNldHRpbmdzOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHZpc3VhbEZpbHRlcjogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRyZXF1aXJlZDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZVxuXHR9KTtcbn07XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzZWxlY3Rpb24gZmllbGRzIHRoYXQgd2lsbCBiZSB1c2VkIHdpdGhpbiB0aGUgZmlsdGVyIGJhclxuICogVGhpcyBjb25maWd1cmF0aW9uIHRha2VzIGludG8gYWNjb3VudCB0aGUgYW5ub3RhdGlvbiBhbmQgdGhlIHNlbGVjdGlvbiB2YXJpYW50cy5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIGxyVGFibGVzXG4gKiBAcGFyYW0gYW5ub3RhdGlvblBhdGhcbiAqIEBwYXJhbSBbaW5jbHVkZUhpZGRlbl1cbiAqIEBwYXJhbSBbbGluZUl0ZW1UZXJtXVxuICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc2VsZWN0aW9uIGZpZWxkc1xuICovXG5leHBvcnQgY29uc3QgZ2V0U2VsZWN0aW9uRmllbGRzID0gZnVuY3Rpb24gKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRsclRhYmxlczogVGFibGVWaXN1YWxpemF0aW9uW10gPSBbXSxcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZyA9IFwiXCIsXG5cdGluY2x1ZGVIaWRkZW4/OiBib29sZWFuLFxuXHRsaW5lSXRlbVRlcm0/OiBzdHJpbmdcbik6IGFueSB7XG5cdGNvbnN0IG9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEgPSBnZXRBbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEoXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRsclRhYmxlcyxcblx0XHRhbm5vdGF0aW9uUGF0aCxcblx0XHRpbmNsdWRlSGlkZGVuLFxuXHRcdGxpbmVJdGVtVGVybVxuXHQpO1xuXHRjb25zdCBwYXJhbWV0ZXJGaWVsZHMgPSBfZ2V0UGFyYW1ldGVyRmllbGRzKGNvbnZlcnRlckNvbnRleHQpO1xuXHRsZXQgcHJvcGVydHlJbmZvRmllbGRzOiBGaWx0ZXJGaWVsZFtdID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLnByb3BlcnR5SW5mb0ZpZWxkcykpO1xuXHRjb25zdCBlbnRpdHlUeXBlID0gb0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YS5lbnRpdHlUeXBlO1xuXG5cdHByb3BlcnR5SW5mb0ZpZWxkcyA9IHBhcmFtZXRlckZpZWxkcy5jb25jYXQocHJvcGVydHlJbmZvRmllbGRzKTtcblxuXHRwcm9wZXJ0eUluZm9GaWVsZHMgPSBpbnNlcnRDdXN0b21NYW5pZmVzdEVsZW1lbnRzKHByb3BlcnR5SW5mb0ZpZWxkcywgZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cblx0Y29uc3QgYUZldGNoZWRQcm9wZXJ0aWVzID0gcHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyhcblx0XHRwcm9wZXJ0eUluZm9GaWVsZHMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLmRlZmF1bHRGaWx0ZXJGaWVsZHNcblx0KTtcblx0YUZldGNoZWRQcm9wZXJ0aWVzLnNvcnQoZnVuY3Rpb24gKGE6IGFueSwgYjogYW55KSB7XG5cdFx0aWYgKGEuZ3JvdXBMYWJlbCA9PT0gdW5kZWZpbmVkIHx8IGEuZ3JvdXBMYWJlbCA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdH1cblx0XHRpZiAoYi5ncm91cExhYmVsID09PSB1bmRlZmluZWQgfHwgYi5ncm91cExhYmVsID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cdFx0cmV0dXJuIGEuZ3JvdXBMYWJlbC5sb2NhbGVDb21wYXJlKGIuZ3JvdXBMYWJlbCk7XG5cdH0pO1xuXG5cdGxldCBzRmV0Y2hQcm9wZXJ0aWVzID0gSlNPTi5zdHJpbmdpZnkoYUZldGNoZWRQcm9wZXJ0aWVzKTtcblx0c0ZldGNoUHJvcGVydGllcyA9IHNGZXRjaFByb3BlcnRpZXMucmVwbGFjZSgvXFx7L2csIFwiXFxcXHtcIik7XG5cdHNGZXRjaFByb3BlcnRpZXMgPSBzRmV0Y2hQcm9wZXJ0aWVzLnJlcGxhY2UoL1xcfS9nLCBcIlxcXFx9XCIpO1xuXHRjb25zdCBzUHJvcGVydHlJbmZvID0gc0ZldGNoUHJvcGVydGllcztcblx0Ly8gZW5kIG9mIHByb3BlcnR5RmllbGRzIHByb2Nlc3NpbmdcblxuXHQvLyB0byBwb3B1bGF0ZSBzZWxlY3Rpb24gZmllbGRzXG5cdGxldCBwcm9wU2VsZWN0aW9uRmllbGRzOiBGaWx0ZXJGaWVsZFtdID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLnByb3BlcnR5SW5mb0ZpZWxkcykpO1xuXHRwcm9wU2VsZWN0aW9uRmllbGRzID0gcGFyYW1ldGVyRmllbGRzLmNvbmNhdChwcm9wU2VsZWN0aW9uRmllbGRzKTtcblx0Ly8gY3JlYXRlIGEgbWFwIG9mIHByb3BlcnRpZXMgdG8gYmUgdXNlZCBpbiBzZWxlY3Rpb24gdmFyaWFudHNcblx0Y29uc3QgZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiA9IG9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEuZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzO1xuXHRjb25zdCBmaWx0ZXJGYWNldHMgPSBlbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LkZpbHRlckZhY2V0cztcblx0bGV0IGZpbHRlckZhY2V0TWFwOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJHcm91cD4gPSB7fTtcblxuXHRjb25zdCBhRmllbGRHcm91cHMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25zQnlUZXJtKFwiVUlcIiwgVUlBbm5vdGF0aW9uVGVybXMuRmllbGRHcm91cCk7XG5cblx0aWYgKGZpbHRlckZhY2V0cyA9PT0gdW5kZWZpbmVkIHx8IGZpbHRlckZhY2V0cy5sZW5ndGggPCAwKSB7XG5cdFx0Zm9yIChjb25zdCBpIGluIGFGaWVsZEdyb3Vwcykge1xuXHRcdFx0ZmlsdGVyRmFjZXRNYXAgPSB7XG5cdFx0XHRcdC4uLmZpbHRlckZhY2V0TWFwLFxuXHRcdFx0XHQuLi5nZXRGaWVsZEdyb3VwRmlsdGVyR3JvdXBzKGFGaWVsZEdyb3Vwc1tpXSlcblx0XHRcdH07XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZpbHRlckZhY2V0TWFwID0gZmlsdGVyRmFjZXRzLnJlZHVjZSgocHJldmlvdXNWYWx1ZTogUmVjb3JkPHN0cmluZywgRmlsdGVyR3JvdXA+LCBmaWx0ZXJGYWNldDogUmVmZXJlbmNlRmFjZXRUeXBlcykgPT4ge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCAoZmlsdGVyRmFjZXQ/LlRhcmdldD8uJHRhcmdldCBhcyBGaWVsZEdyb3VwKT8uRGF0YT8ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0cHJldmlvdXNWYWx1ZVsoKGZpbHRlckZhY2V0Py5UYXJnZXQ/LiR0YXJnZXQgYXMgRmllbGRHcm91cCk/LkRhdGFbaV0gYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZT8ucGF0aF0gPSB7XG5cdFx0XHRcdFx0Z3JvdXA6IGZpbHRlckZhY2V0Py5JRD8udG9TdHJpbmcoKSxcblx0XHRcdFx0XHRncm91cExhYmVsOiBmaWx0ZXJGYWNldD8uTGFiZWw/LnRvU3RyaW5nKClcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwcmV2aW91c1ZhbHVlO1xuXHRcdH0sIHt9KTtcblx0fVxuXG5cdC8vIGNyZWF0ZSBhIG1hcCBvZiBhbGwgcG90ZW50aWFsIGZpbHRlciBmaWVsZHMgYmFzZWQgb24uLi5cblx0Y29uc3QgZmlsdGVyRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4gPSBvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLmZpbHRlckZpZWxkcztcblxuXHQvLyBmaW5hbGx5IGNyZWF0ZSBmaW5hbCBsaXN0IG9mIGZpbHRlciBmaWVsZHMgYnkgYWRkaW5nIHRoZSBTZWxlY3Rpb25GaWVsZHMgZmlyc3QgKG9yZGVyIG1hdHRlcnMpLi4uXG5cdGxldCBhbGxGaWx0ZXJzID0gcHJvcFNlbGVjdGlvbkZpZWxkc1xuXG5cdFx0Ly8gLi4uYW5kIGFkZGluZyByZW1haW5pbmcgZmlsdGVyIGZpZWxkcywgdGhhdCBhcmUgbm90IHVzZWQgaW4gYSBTZWxlY3Rpb25WYXJpYW50IChvcmRlciBkb2Vzbid0IG1hdHRlcilcblx0XHQuY29uY2F0KFxuXHRcdFx0T2JqZWN0LmtleXMoZmlsdGVyRmllbGRzKVxuXHRcdFx0XHQuZmlsdGVyKChwcm9wZXJ0eVBhdGgpID0+ICEocHJvcGVydHlQYXRoIGluIGV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcykpXG5cdFx0XHRcdC5tYXAoKHByb3BlcnR5UGF0aCkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBPYmplY3QuYXNzaWduKGZpbHRlckZpZWxkc1twcm9wZXJ0eVBhdGhdLCBmaWx0ZXJGYWNldE1hcFtwcm9wZXJ0eVBhdGhdKTtcblx0XHRcdFx0fSlcblx0XHQpO1xuXHRjb25zdCBzQ29udGV4dFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKCk7XG5cblx0Ly9pZiBhbGwgdGFibGVzIGFyZSBhbmFseXRpY2FsIHRhYmxlcyBcImFnZ3JlZ2F0YWJsZVwiIHByb3BlcnRpZXMgbXVzdCBiZSBleGNsdWRlZFxuXHRpZiAoY2hlY2tBbGxUYWJsZUZvckVudGl0eVNldEFyZUFuYWx5dGljYWwobHJUYWJsZXMsIHNDb250ZXh0UGF0aCkpIHtcblx0XHQvLyBDdXJyZW50bHkgYWxsIGFncmVnYXRlcyBhcmUgcm9vdCBlbnRpdHkgcHJvcGVydGllcyAobm8gcHJvcGVydGllcyBjb21pbmcgZnJvbSBuYXZpZ2F0aW9uKSBhbmQgYWxsXG5cdFx0Ly8gdGFibGVzIHdpdGggc2FtZSBlbnRpdHlTZXQgZ2V0cyBzYW1lIGFnZ3JlYWd0ZSBjb25maWd1cmF0aW9uIHRoYXQncyB3aHkgd2UgY2FuIHVzZSBmaXJzdCB0YWJsZSBpbnRvXG5cdFx0Ly8gTFIgdG8gZ2V0IGFnZ3JlZ2F0ZXMgKHdpdGhvdXQgY3VycmVuY3kvdW5pdCBwcm9wZXJ0aWVzIHNpbmNlIHdlIGV4cGVjdCB0byBiZSBhYmxlIHRvIGZpbHRlciB0aGVtKS5cblx0XHRjb25zdCBhZ2dyZWdhdGVzID0gbHJUYWJsZXNbMF0uYWdncmVnYXRlcztcblx0XHRpZiAoYWdncmVnYXRlcykge1xuXHRcdFx0Y29uc3QgYWdncmVnYXRhYmxlUHJvcGVydGllczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhhZ2dyZWdhdGVzKS5tYXAoKGFnZ3JlZ2F0ZUtleSkgPT4gYWdncmVnYXRlc1thZ2dyZWdhdGVLZXldLnJlbGF0aXZlUGF0aCk7XG5cdFx0XHRhbGxGaWx0ZXJzID0gYWxsRmlsdGVycy5maWx0ZXIoKGZpbHRlckZpZWxkKSA9PiB7XG5cdFx0XHRcdHJldHVybiBhZ2dyZWdhdGFibGVQcm9wZXJ0aWVzLmluZGV4T2YoZmlsdGVyRmllbGQua2V5KSA9PT0gLTE7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBzZWxlY3Rpb25GaWVsZHMgPSBpbnNlcnRDdXN0b21NYW5pZmVzdEVsZW1lbnRzKGFsbEZpbHRlcnMsIGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdC8vIEFkZCBjYXNlU2Vuc2l0aXZlIHByb3BlcnR5IHRvIGFsbCBzZWxlY3Rpb24gZmllbGRzLlxuXHRjb25zdCBpc0Nhc2VTZW5zaXRpdmUgPSBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dCk7XG5cdHNlbGVjdGlvbkZpZWxkcy5mb3JFYWNoKChmaWx0ZXJGaWVsZCkgPT4ge1xuXHRcdGZpbHRlckZpZWxkLmNhc2VTZW5zaXRpdmUgPSBpc0Nhc2VTZW5zaXRpdmU7XG5cdH0pO1xuXG5cdHJldHVybiB7IHNlbGVjdGlvbkZpZWxkcywgc1Byb3BlcnR5SW5mbyB9O1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGZpbHRlciBiYXIgaW5zaWRlIGEgdmFsdWUgaGVscCBkaWFsb2cgc2hvdWxkIGJlIGV4cGFuZGVkLiBUaGlzIGlzIHRydWUgaWYgb25lIG9mIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBob2xkOlxuICogKDEpIGEgZmlsdGVyIHByb3BlcnR5IGlzIG1hbmRhdG9yeSxcbiAqICgyKSBubyBzZWFyY2ggZmllbGQgZXhpc3RzIChlbnRpdHkgaXNuJ3Qgc2VhcmNoIGVuYWJsZWQpLFxuICogKDMpIHdoZW4gdGhlIGRhdGEgaXNuJ3QgbG9hZGVkIGJ5IGRlZmF1bHQgKGFubm90YXRpb24gRmV0Y2hWYWx1ZXMgPSAyKS5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSBmaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uIFRoZSBGaWx0ZXJSZXN0cmljdGlvbiBhbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmFsdWVMaXN0QW5ub3RhdGlvbiBUaGUgVmFsdWVMaXN0IGFubm90YXRpb25cbiAqIEByZXR1cm5zIFRoZSB2YWx1ZSBmb3IgZXhwYW5kRmlsdGVyRmllbGRzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeHBhbmRGaWx0ZXJGaWVsZHMgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb246IGFueSxcblx0dmFsdWVMaXN0QW5ub3RhdGlvbjogYW55XG4pOiBib29sZWFuIHtcblx0Y29uc3QgcmVxdWlyZWRQcm9wZXJ0aWVzID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKGZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24sIFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIpO1xuXHRjb25zdCBzZWFyY2hSZXN0cmljdGlvbnMgPSBnZXRTZWFyY2hSZXN0cmljdGlvbnMoY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IGhpZGVCYXNpY1NlYXJjaCA9IEJvb2xlYW4oc2VhcmNoUmVzdHJpY3Rpb25zICYmICFzZWFyY2hSZXN0cmljdGlvbnMuU2VhcmNoYWJsZSk7XG5cdGNvbnN0IHZhbHVlTGlzdCA9IHZhbHVlTGlzdEFubm90YXRpb24uZ2V0T2JqZWN0KCk7XG5cdGlmIChyZXF1aXJlZFByb3BlcnRpZXMubGVuZ3RoID4gMCB8fCBoaWRlQmFzaWNTZWFyY2ggfHwgdmFsdWVMaXN0Py5GZXRjaFZhbHVlcyA9PT0gMikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01Bd0RLQSxlQUFlO0VBQUEsV0FBZkEsZUFBZTtJQUFmQSxlQUFlO0lBQWZBLGVBQWU7RUFBQSxHQUFmQSxlQUFlLEtBQWZBLGVBQWU7RUFLcEIsTUFBTUMsVUFBVSxHQUFHLFlBQVk7RUFDL0IsTUFBTUMsZUFBZSxHQUFHLGdDQUFnQztFQUl4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQyx5QkFBeUIsQ0FBQ0MsVUFBc0IsRUFBK0I7SUFDdkYsTUFBTUMsY0FBMkMsR0FBRyxDQUFDLENBQUM7SUFDdERELFVBQVUsQ0FBQ0UsSUFBSSxDQUFDQyxPQUFPLENBQUVDLFNBQWlDLElBQUs7TUFDOUQsSUFBSUEsU0FBUyxDQUFDQyxLQUFLLEtBQUssc0NBQXNDLEVBQUU7UUFBQTtRQUMvREosY0FBYyxDQUFDRyxTQUFTLENBQUNFLEtBQUssQ0FBQ0MsSUFBSSxDQUFDLEdBQUc7VUFDdENDLEtBQUssRUFBRVIsVUFBVSxDQUFDUyxrQkFBa0I7VUFDcENDLFVBQVUsRUFDVEMsaUJBQWlCLENBQ2hCQywyQkFBMkIsQ0FBQ1osVUFBVSxDQUFDYSxLQUFLLDhCQUFJYixVQUFVLENBQUNjLFdBQVcsb0ZBQXRCLHNCQUF3QkMs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