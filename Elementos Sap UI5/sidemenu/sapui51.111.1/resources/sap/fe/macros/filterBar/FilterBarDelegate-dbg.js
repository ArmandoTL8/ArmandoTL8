/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/TemplateModel", "sap/fe/core/templating/PropertyFormatters", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/ResourceModel", "sap/ui/mdc/FilterBarDelegate", "sap/ui/model/json/JSONModel"], function (Log, mergeObjects, CommonUtils, FilterBar, ModelHelper, StableIdHelper, TemplateModel, PropertyFormatters, EDM, TypeUtil, CommonHelper, DelegateUtil, FilterUtils, ResourceModel, FilterBarDelegate, JSONModel) {
  "use strict";

  var getModelType = EDM.getModelType;
  var hasValueHelp = PropertyFormatters.hasValueHelp;
  var generate = StableIdHelper.generate;
  var processSelectionFields = FilterBar.processSelectionFields;
  const ODataFilterBarDelegate = Object.assign({}, FilterBarDelegate);
  const EDIT_STATE_PROPERTY_NAME = "$editState",
    SEARCH_PROPERTY_NAME = "$search",
    VALUE_HELP_TYPE = "FilterFieldValueHelp",
    FETCHED_PROPERTIES_DATA_KEY = "sap_fe_FilterBarDelegate_propertyInfoMap",
    CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /[+*]/g;
  function _templateEditState(sIdPrefix, metaModel, oModifier) {
    const oThis = new JSONModel({
        id: sIdPrefix,
        isDraftCollaborative: ModelHelper.isCollaborationDraftSupported(metaModel)
      }),
      oPreprocessorSettings = {
        bindingContexts: {
          this: oThis.createBindingContext("/")
        },
        models: {
          "this.i18n": ResourceModel.getModel(),
          this: oThis
        }
      };
    return DelegateUtil.templateControlFragment("sap.fe.macros.filter.DraftEditState", oPreprocessorSettings, undefined, oModifier).finally(function () {
      oThis.destroy();
    });
  }
  ODataFilterBarDelegate._templateCustomFilter = async function (oFilterBar, sIdPrefix, oSelectionFieldInfo, oMetaModel, oModifier) {
    const sEntityTypePath = await DelegateUtil.getCustomData(oFilterBar, "entityType", oModifier);
    const oThis = new JSONModel({
        id: sIdPrefix
      }),
      oItemModel = new TemplateModel(oSelectionFieldInfo, oMetaModel),
      oPreprocessorSettings = {
        bindingContexts: {
          contextPath: oMetaModel.createBindingContext(sEntityTypePath),
          this: oThis.createBindingContext("/"),
          item: oItemModel.createBindingContext("/")
        },
        models: {
          contextPath: oMetaModel,
          this: oThis,
          item: oItemModel
        }
      },
      oView = CommonUtils.getTargetView(oFilterBar),
      oController = oView ? oView.getController() : undefined,
      oOptions = {
        controller: oController ? oController : undefined,
        view: oView
      };
    return DelegateUtil.templateControlFragment("sap.fe.macros.filter.CustomFilter", oPreprocessorSettings, oOptions, oModifier).finally(function () {
      oThis.destroy();
      oItemModel.destroy();
    });
  };
  function _getPropertyPath(sConditionPath) {
    return sConditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
  }
  ODataFilterBarDelegate._findSelectionField = function (aSelectionFields, sFlexName) {
    return aSelectionFields.find(function (oSelectionField) {
      return (oSelectionField.conditionPath === sFlexName || oSelectionField.conditionPath.replaceAll(/\*/g, "") === sFlexName) && oSelectionField.availability !== "Hidden";
    });
  };
  function _generateIdPrefix(sFilterBarId, sControlType, sNavigationPrefix) {
    return sNavigationPrefix ? generate([sFilterBarId, sControlType, sNavigationPrefix]) : generate([sFilterBarId, sControlType]);
  }
  function _templateValueHelp(oSettings, oParameters) {
    const oThis = new JSONModel({
      idPrefix: oParameters.sVhIdPrefix,
      conditionModel: "$filters",
      navigationPrefix: oParameters.sNavigationPrefix ? `/${oParameters.sNavigationPrefix}` : "",
      filterFieldValueHelp: true,
      useSemanticDateRange: oParameters.bUseSemanticDateRange
    });
    const oPreprocessorSettings = mergeObjects({}, oSettings, {
      bindingContexts: {
        this: oThis.createBindingContext("/")
      },
      models: {
        this: oThis
      }
    });
    return Promise.resolve(DelegateUtil.templateControlFragment("sap.fe.macros.internal.valuehelp.ValueHelp", oPreprocessorSettings, {
      isXML: oSettings.isXML
    })).then(function (aVHElements) {
      if (aVHElements) {
        const sAggregationName = "dependents";
        //Some filter fields have the PersistenceProvider aggregation besides the FVH :
        if (aVHElements.length) {
          aVHElements.forEach(function (elt) {
            if (oParameters.oModifier) {
              oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, elt, 0);
            } else {
              oParameters.oControl.insertAggregation(sAggregationName, elt, 0, false);
            }
          });
        } else if (oParameters.oModifier) {
          oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, aVHElements, 0);
        } else {
          oParameters.oControl.insertAggregation(sAggregationName, aVHElements, 0, false);
        }
      }
    }).catch(function (oError) {
      Log.error("Error while evaluating DelegateUtil.isValueHelpRequired", oError);
    }).finally(function () {
      oThis.destroy();
    });
  }
  async function _addXMLCustomFilterField(oFilterBar, oModifier, sPropertyPath) {
    try {
      const aDependents = await Promise.resolve(oModifier.getAggregation(oFilterBar, "dependents"));
      let i;
      if (aDependents && aDependents.length > 1) {
        for (i = 0; i <= aDependents.length; i++) {
          const oFilterField = aDependents[i];
          if (oFilterField && oFilterField.isA("sap.ui.mdc.FilterField")) {
            const sDataProperty = oFilterField.getFieldPath(),
              sFilterFieldId = oFilterField.getId();
            if (sPropertyPath === sDataProperty && sFilterFieldId.indexOf("CustomFilterField")) {
              return Promise.resolve(oFilterField);
            }
          }
        }
      }
    } catch (oError) {
      Log.error("Filter Cannot be added", oError);
    }
  }
  function _templateFilterField(oSettings, oParameters, pageModel) {
    const oThis = new JSONModel({
      idPrefix: oParameters.sIdPrefix,
      vhIdPrefix: oParameters.sVhIdPrefix,
      propertyPath: oParameters.sPropertyName,
      navigationPrefix: oParameters.sNavigationPrefix ? `/${oParameters.sNavigationPrefix}` : "",
      useSemanticDateRange: oParameters.bUseSemanticDateRange,
      settings: oParameters.oSettings,
      visualFilter: oParameters.visualFilter
    });
    const oMetaModel = oParameters.oMetaModel;
    const oVisualFilter = new TemplateModel(oParameters.visualFilter, oMetaModel);
    const oPreprocessorSettings = mergeObjects({}, oSettings, {
      bindingContexts: {
        this: oThis.createBindingContext("/"),
        visualFilter: oVisualFilter.createBindingContext("/")
      },
      models: {
        this: oThis,
        visualFilter: oVisualFilter,
        metaModel: oMetaModel,
        converterContext: pageModel
      }
    });
    return DelegateUtil.templateControlFragment("sap.fe.macros.internal.filterField.FilterFieldTemplate", oPreprocessorSettings, {
      isXML: oSettings.isXML
    }).finally(function () {
      oThis.destroy();
    });
  }
  async function _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName) {
    try {
      sPropertyInfoName = sPropertyInfoName.replace("*", "");
      const sPropertyInfoKey = generate([sPropertyInfoName]); //Making sure that navigation property names are generated properly e.g. _Item::Material
      if (mPropertyBag && !mPropertyBag.modifier) {
        throw "FilterBar Delegate method called without modifier.";
      }
      const delegate = await mPropertyBag.modifier.getProperty(oParentControl, "delegate");
      const aPropertyInfo = await mPropertyBag.modifier.getProperty(oParentControl, "propertyInfo");
      //We do not get propertyInfo in case of table filters
      if (aPropertyInfo) {
        const hasPropertyInfo = aPropertyInfo.some(function (prop) {
          return prop.key === sPropertyInfoKey || prop.name === sPropertyInfoKey;
        });
        if (!hasPropertyInfo) {
          const entityTypePath = delegate.payload.entityTypePath;
          const converterContext = FilterUtils.createConverterContext(oParentControl, entityTypePath, oMetaModel, mPropertyBag.appComponent);
          const entityType = converterContext.getEntityType();
          let filterField = FilterUtils.getFilterField(sPropertyInfoName, converterContext, entityType);
          filterField = FilterUtils.buildProperyInfo(filterField, converterContext);
          aPropertyInfo.push(filterField);
          mPropertyBag.modifier.setProperty(oParentControl, "propertyInfo", aPropertyInfo);
        }
      }
    } catch (errorMsg) {
      Log.warning(`${oParentControl.getId()} : ${errorMsg}`);
    }
  }

  /**
   * Method responsible for creating filter field in standalone mode / in the personalization settings of the filter bar.
   *
   * @param sPropertyInfoName Name of the property being added as the filter field
   * @param oParentControl Parent control instance to which the filter field is added
   * @param mPropertyBag Instance of the property bag from Flex API
   * @returns Once resolved, a filter field definition is returned
   */
  ODataFilterBarDelegate.addItem = async function (sPropertyInfoName, oParentControl, mPropertyBag) {
    if (!mPropertyBag) {
      // Invoked during runtime.
      return ODataFilterBarDelegate._addP13nItem(sPropertyInfoName, oParentControl);
    }
    const modifier = mPropertyBag.modifier;
    const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
    const oMetaModel = model && model.getMetaModel();
    if (!oMetaModel) {
      return Promise.resolve(null);
    }
    const isXML = modifier && modifier.targets === "xmlTree";
    if (isXML) {
      await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
    }
    return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oMetaModel, modifier, mPropertyBag.appComponent);
  };

  /**
   * Method responsible for removing filter field in standalone / personalization filter bar.
   *
   * @param oFilterFieldProperty Object of the filter field property being removed as filter field
   * @param oParentControl Parent control instance from which the filter field is removed
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.removeItem = async function (oFilterFieldProperty, oParentControl, mPropertyBag) {
    let doRemoveItem = true;
    const modifier = mPropertyBag.modifier;
    const isXML = modifier && modifier.targets === "xmlTree";
    if (isXML && !oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
      const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
      const oMetaModel = model && model.getMetaModel();
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.getFieldPath()) {
        await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty.getFieldPath());
      } else {
        await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty);
      }
    }
    if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.isA && oFilterFieldProperty.isA("sap.ui.mdc.FilterField")) {
      if (oFilterFieldProperty.data("isSlot") === "true" && mPropertyBag) {
        // Inserting into the modifier creates a change from flex also filter is been removed hence promise is resolved to false
        modifier.insertAggregation(oParentControl, "dependents", oFilterFieldProperty);
        doRemoveItem = false;
      }
    }
    return Promise.resolve(doRemoveItem);
  };

  /**
   * Method responsible for creating filter field condition in standalone / personalization filter bar.
   *
   * @param sPropertyInfoName Name of the property being added as filter field
   * @param oParentControl Parent control instance to which the filter field is added
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.addCondition = async function (sPropertyInfoName, oParentControl, mPropertyBag) {
    const modifier = mPropertyBag.modifier;
    const isXML = modifier && modifier.targets === "xmlTree";
    if (isXML) {
      const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
      const oMetaModel = model && model.getMetaModel();
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
    }
    return Promise.resolve();
  };

  /**
   * Method responsible for removing filter field in standalone / personalization filter bar.
   *
   * @param sPropertyInfoName Name of the property being removed as filter field
   * @param oParentControl Parent control instance from which the filter field is removed
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.removeCondition = async function (sPropertyInfoName, oParentControl, mPropertyBag) {
    if (!oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
      const modifier = mPropertyBag.modifier;
      const isXML = modifier && modifier.targets === "xmlTree";
      if (isXML) {
        const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
        const oMetaModel = model && model.getMetaModel();
        if (!oMetaModel) {
          return Promise.resolve(null);
        }
        await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
      }
    }
    return Promise.resolve();
  };
  /**
   * Clears all input values of visible filter fields in the filter bar.
   *
   * @param oFilterControl Instance of the FilterBar control
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.clearFilters = async function (oFilterControl) {
    return FilterUtils.clearFilterValues(oFilterControl);
  };
  /**
   * Creates the filter field in the table adaptation of the FilterBar.
   *
   * @param sPropertyInfoName The property name of the entity type for which the filter field needs to be created
   * @param oParentControl Instance of the parent control
   * @returns Once resolved, a filter field definition is returned
   */
  ODataFilterBarDelegate._addP13nItem = function (sPropertyInfoName, oParentControl) {
    return DelegateUtil.fetchModel(oParentControl).then(function (oModel) {
      return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oModel.getMetaModel(), undefined);
    }).catch(function (oError) {
      Log.error("Model could not be resolved", oError);
      return null;
    });
  };
  ODataFilterBarDelegate.fetchPropertiesForEntity = function (sEntityTypePath, oMetaModel, oFilterControl) {
    const oEntityType = oMetaModel.getObject(sEntityTypePath);
    const includeHidden = oFilterControl.isA("sap.ui.mdc.filterbar.vh.FilterBar") ? true : undefined;
    if (!oFilterControl || !oEntityType) {
      return [];
    }
    const oConverterContext = FilterUtils.createConverterContext(oFilterControl, sEntityTypePath);
    const sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath);
    const mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath, includeHidden);
    let aFetchedProperties = [];
    mFilterFields.forEach(function (oFilterFieldInfo) {
      if (oFilterFieldInfo.annotationPath) {
        const sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, oFilterFieldInfo.annotationPath);
        const sProperty = oFilterFieldInfo.annotationPath.replace(`${sTargetPropertyPrefix}/`, "");
        if (CommonUtils.isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)) {
          aFetchedProperties.push(oFilterFieldInfo);
        }
      } else {
        //Custom Filters
        aFetchedProperties.push(oFilterFieldInfo);
      }
    });
    const aParameterFields = [];
    const processedFields = processSelectionFields(aFetchedProperties, oConverterContext);
    const processedFieldsKeys = [];
    processedFields.forEach(function (oProps) {
      if (oProps.key) {
        processedFieldsKeys.push(oProps.key);
      }
    });
    aFetchedProperties = aFetchedProperties.filter(function (oProp) {
      return processedFieldsKeys.includes(oProp.key);
    });
    const oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
      mAllowedExpressions = oFR.FilterAllowedExpressions;
    Object.keys(processedFields).forEach(function (sFilterFieldKey) {
      let oProp = processedFields[sFilterFieldKey];
      const oSelField = aFetchedProperties[sFilterFieldKey];
      if (!oSelField || !oSelField.conditionPath) {
        return;
      }
      const sPropertyPath = _getPropertyPath(oSelField.conditionPath);
      //fetchBasic
      oProp = Object.assign(oProp, {
        group: oSelField.group,
        groupLabel: oSelField.groupLabel,
        path: oSelField.conditionPath,
        tooltip: null,
        removeFromAppState: false,
        hasValueHelp: false
      });

      //fetchPropInfo
      if (oSelField.annotationPath) {
        const sAnnotationPath = oSelField.annotationPath;
        const oProperty = oMetaModel.getObject(sAnnotationPath),
          oPropertyAnnotations = oMetaModel.getObject(`${sAnnotationPath}@`),
          oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
        const bRemoveFromAppState = oPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || oPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] || oPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"];
        const sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, oSelField.annotationPath);
        const sProperty = sAnnotationPath.replace(`${sTargetPropertyPrefix}/`, "");
        let oFilterDefaultValueAnnotation;
        let oFilterDefaultValue;
        if (CommonUtils.isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)) {
          oFilterDefaultValueAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.FilterDefaultValue"];
          if (oFilterDefaultValueAnnotation) {
            oFilterDefaultValue = oFilterDefaultValueAnnotation[`$${getModelType(oProperty.$Type)}`];
          }
          oProp = Object.assign(oProp, {
            tooltip: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.QuickInfo"] || undefined,
            removeFromAppState: bRemoveFromAppState,
            hasValueHelp: hasValueHelp(oPropertyContext.getObject(), {
              context: oPropertyContext
            }),
            defaultFilterConditions: oFilterDefaultValue ? [{
              fieldPath: oSelField.conditionPath,
              operator: "EQ",
              values: [oFilterDefaultValue]
            }] : undefined
          });
        }
      }

      //base

      if (oProp) {
        if (mAllowedExpressions[sPropertyPath] && mAllowedExpressions[sPropertyPath].length > 0) {
          oProp.filterExpression = CommonUtils.getSpecificAllowedExpression(mAllowedExpressions[sPropertyPath]);
        } else {
          oProp.filterExpression = "auto";
        }
        oProp = Object.assign(oProp, {
          visible: oSelField.availability === "Default"
        });
      }
      processedFields[sFilterFieldKey] = oProp;
    });
    processedFields.forEach(function (propInfo) {
      if (propInfo.path === "$editState") {
        propInfo.label = ResourceModel.getText("FILTERBAR_EDITING_STATUS");
      }
      propInfo.typeConfig = TypeUtil.getTypeConfig(propInfo.dataType, propInfo.formatOptions, propInfo.constraints);
      propInfo.label = DelegateUtil.getLocalizedText(propInfo.label, oFilterControl) || "";
      if (propInfo.isParameter) {
        aParameterFields.push(propInfo.name);
      }
    });
    aFetchedProperties = processedFields;
    DelegateUtil.setCustomData(oFilterControl, "parameters", aParameterFields);
    return aFetchedProperties;
  };
  function getLineItemQualifierFromTable(oControl, oMetaModel) {
    var _oMetaModel$getObject;
    if (oControl.isA("sap.fe.macros.table.TableAPI")) {
      const annotationPaths = oControl.getMetaPath().split("#")[0].split("/");
      switch (annotationPaths[annotationPaths.length - 1]) {
        case `@${"com.sap.vocabularies.UI.v1.SelectionPresentationVariant"}`:
        case `@${"com.sap.vocabularies.UI.v1.PresentationVariant"}`:
          return (_oMetaModel$getObject = oMetaModel.getObject(oControl.getMetaPath()).Visualizations) === null || _oMetaModel$getObject === void 0 ? void 0 : _oMetaModel$getObject.find(visualization => visualization.$AnnotationPath.includes(`@${"com.sap.vocabularies.UI.v1.LineItem"}`)).$AnnotationPath;
        case `@${"com.sap.vocabularies.UI.v1.LineItem"}`:
          const metaPaths = oControl.getMetaPath().split("/");
          return metaPaths[metaPaths.length - 1];
      }
    }
    return undefined;
  }
  ODataFilterBarDelegate._addFlexItem = function (sFlexPropertyName, oParentControl, oMetaModel, oModifier, oAppComponent) {
    const sFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId(),
      sIdPrefix = oModifier ? "" : "Adaptation",
      aSelectionFields = FilterUtils.getConvertedFilterFields(oParentControl, null, undefined, oMetaModel, oAppComponent, oModifier, oModifier ? undefined : getLineItemQualifierFromTable(oParentControl.getParent(), oMetaModel)),
      oSelectionField = ODataFilterBarDelegate._findSelectionField(aSelectionFields, sFlexPropertyName),
      sPropertyPath = _getPropertyPath(sFlexPropertyName),
      bIsXML = !!oModifier && oModifier.targets === "xmlTree";
    if (sFlexPropertyName === EDIT_STATE_PROPERTY_NAME) {
      return _templateEditState(sFilterBarId, oMetaModel, oModifier);
    } else if (sFlexPropertyName === SEARCH_PROPERTY_NAME) {
      return Promise.resolve(null);
    } else if (oSelectionField && oSelectionField.template) {
      return ODataFilterBarDelegate._templateCustomFilter(oParentControl, _generateIdPrefix(sFilterBarId, `${sIdPrefix}FilterField`), oSelectionField, oMetaModel, oModifier);
    }
    if (oSelectionField.type === "Slot" && oModifier) {
      return _addXMLCustomFilterField(oParentControl, oModifier, sPropertyPath);
    }
    const sNavigationPath = CommonHelper.getNavigationPath(sPropertyPath);
    const sAnnotationPath = oSelectionField.annotationPath;
    let sEntityTypePath;
    let sUseSemanticDateRange;
    let oSettings;
    let sBindingPath;
    let oParameters;
    return Promise.resolve().then(function () {
      if (oSelectionField.isParameter) {
        return sAnnotationPath.substr(0, sAnnotationPath.lastIndexOf("/") + 1);
      }
      return DelegateUtil.getCustomData(oParentControl, "entityType", oModifier);
    }).then(function (sRetrievedEntityTypePath) {
      sEntityTypePath = sRetrievedEntityTypePath;
      return DelegateUtil.getCustomData(oParentControl, "useSemanticDateRange", oModifier);
    }).then(function (sRetrievedUseSemanticDateRange) {
      sUseSemanticDateRange = sRetrievedUseSemanticDateRange;
      const oPropertyContext = oMetaModel.createBindingContext(sEntityTypePath + sPropertyPath);
      const sInFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId();
      oSettings = {
        bindingContexts: {
          contextPath: oMetaModel.createBindingContext(sEntityTypePath),
          property: oPropertyContext
        },
        models: {
          contextPath: oMetaModel,
          property: oMetaModel
        },
        isXML: bIsXML
      };
      sBindingPath = `/${ModelHelper.getEntitySetPath(sEntityTypePath).split("/").filter(ModelHelper.filterOutNavPropBinding).join("/")}`;
      oParameters = {
        sPropertyName: sPropertyPath,
        sBindingPath: sBindingPath,
        sValueHelpType: sIdPrefix + VALUE_HELP_TYPE,
        oControl: oParentControl,
        oMetaModel: oMetaModel,
        oModifier: oModifier,
        sIdPrefix: _generateIdPrefix(sInFilterBarId, `${sIdPrefix}FilterField`, sNavigationPath),
        sVhIdPrefix: _generateIdPrefix(sInFilterBarId, sIdPrefix + VALUE_HELP_TYPE),
        sNavigationPrefix: sNavigationPath,
        bUseSemanticDateRange: sUseSemanticDateRange,
        oSettings: oSelectionField ? oSelectionField.settings : {},
        visualFilter: oSelectionField ? oSelectionField.visualFilter : undefined
      };
      return DelegateUtil.doesValueHelpExist(oParameters);
    }).then(function (bValueHelpExists) {
      if (!bValueHelpExists) {
        return _templateValueHelp(oSettings, oParameters);
      }
      return Promise.resolve();
    }).then(function () {
      let pageModel;
      if (oParameters.visualFilter) {
        //Need to set the convertercontext as pageModel in settings for BuildingBlock 2.0
        pageModel = CommonUtils.getTargetView(oParentControl).getController()._getPageModel();
      }
      return _templateFilterField(oSettings, oParameters, pageModel);
    });
  };
  function _getCachedProperties(oFilterBar) {
    // properties are not cached during templating
    if (oFilterBar instanceof window.Element) {
      return null;
    }
    return DelegateUtil.getCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY);
  }
  function _setCachedProperties(oFilterBar, aFetchedProperties) {
    // do not cache during templating, else it becomes part of the cached view
    if (oFilterBar instanceof window.Element) {
      return;
    }
    DelegateUtil.setCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY, aFetchedProperties);
  }
  function _getCachedOrFetchPropertiesForEntity(sEntityTypePath, oMetaModel, oFilterBar) {
    let aFetchedProperties = _getCachedProperties(oFilterBar);
    let localGroupLabel;
    if (!aFetchedProperties) {
      aFetchedProperties = ODataFilterBarDelegate.fetchPropertiesForEntity(sEntityTypePath, oMetaModel, oFilterBar);
      aFetchedProperties.forEach(function (oGroup) {
        localGroupLabel = null;
        if (oGroup.groupLabel) {
          localGroupLabel = DelegateUtil.getLocalizedText(oGroup.groupLabel, oFilterBar);
          oGroup.groupLabel = localGroupLabel === null ? oGroup.groupLabel : localGroupLabel;
        }
      });
      aFetchedProperties.sort(function (a, b) {
        if (a.groupLabel === undefined || a.groupLabel === null) {
          return -1;
        }
        if (b.groupLabel === undefined || b.groupLabel === null) {
          return 1;
        }
        return a.groupLabel.localeCompare(b.groupLabel);
      });
      _setCachedProperties(oFilterBar, aFetchedProperties);
    }
    return aFetchedProperties;
  }
  ODataFilterBarDelegate.fetchProperties = function (oFilterBar) {
    const sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
    return DelegateUtil.fetchModel(oFilterBar).then(function (oModel) {
      if (!oModel) {
        return [];
      }
      return _getCachedOrFetchPropertiesForEntity(sEntityTypePath, oModel.getMetaModel(), oFilterBar);
      // var aCleanedProperties = aProperties.concat();
      // var aAllowedAttributes = ["name", "label", "visible", "path", "typeConfig", "maxConditions", "group", "groupLabel"];
      // aCleanedProperties.forEach(function(oProperty) {
      // 	Object.keys(oProperty).forEach(function(sPropName) {
      // 		if (aAllowedAttributes.indexOf(sPropName) === -1) {
      // 			delete oProperty[sPropName];
      // 		}
      // 	});
      // });
      // return aCleanedProperties;
    });
  };

  ODataFilterBarDelegate.getTypeUtil = function () {
    return TypeUtil;
  };
  return ODataFilterBarDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPRGF0YUZpbHRlckJhckRlbGVnYXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiRmlsdGVyQmFyRGVsZWdhdGUiLCJFRElUX1NUQVRFX1BST1BFUlRZX05BTUUiLCJTRUFSQ0hfUFJPUEVSVFlfTkFNRSIsIlZBTFVFX0hFTFBfVFlQRSIsIkZFVENIRURfUFJPUEVSVElFU19EQVRBX0tFWSIsIkNPTkRJVElPTl9QQVRIX1RPX1BST1BFUlRZX1BBVEhfUkVHRVgiLCJfdGVtcGxhdGVFZGl0U3RhdGUiLCJzSWRQcmVmaXgiLCJtZXRhTW9kZWwiLCJvTW9kaWZpZXIiLCJvVGhpcyIsIkpTT05Nb2RlbCIsImlkIiwiaXNEcmFmdENvbGxhYm9yYXRpdmUiLCJNb2RlbEhlbHBlciIsImlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwib1ByZXByb2Nlc3NvclNldHRpbmdzIiwiYmluZGluZ0NvbnRleHRzIiwidGhpcyIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwibW9kZWxzIiwiUmVzb3VyY2VNb2RlbCIsImdldE1vZGVsIiwiRGVsZWdhdGVVdGlsIiwidGVtcGxhdGVDb250cm9sRnJhZ21lbnQiLCJ1bmRlZmluZWQiLCJmaW5hbGx5IiwiZGVzdHJveSIsIl90ZW1wbGF0ZUN1c3RvbUZpbHRlciIsIm9GaWx0ZXJCYXIiLCJvU2VsZWN0aW9uRmllbGRJbmZvIiwib01ldGFNb2RlbCIsInNFbnRpdHlUeXBlUGF0aCIsImdldEN1c3RvbURhdGEiLCJvSXRlbU1vZGVsIiwiVGVtcGxhdGVNb2RlbCIsImNvbnRleHRQYXRoIiwiaXRlbSIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwib09wdGlvbnMiLCJjb250cm9sbGVyIiwidmlldyIsIl9nZXRQcm9wZXJ0eVBhdGgiLCJzQ29uZGl0aW9uUGF0aCIsInJlcGxhY2UiLCJfZmluZFNlbGVjdGlvbkZpZWxkIiwiYVNlbGVjdGlvbkZpZWxkcyIsInNGbGV4TmFtZSIsImZpbmQiLCJvU2VsZWN0aW9uRmllbGQiLCJjb25kaXRpb25QYXRoIiwicmVwbGFjZUFsbCIsImF2YWlsYWJpbGl0eSIsIl9nZW5lcmF0ZUlkUHJlZml4Iiwic0ZpbHRlckJhcklkIiwic0NvbnRyb2xUeXBlIiwic05hdmlnYXRpb25QcmVmaXgiLCJnZW5lcmF0ZSIsIl90ZW1wbGF0ZVZhbHVlSGVscCIsIm9TZXR0aW5ncyIsIm9QYXJhbWV0ZXJzIiwiaWRQcmVmaXgiLCJzVmhJZFByZWZpeCIsImNvbmRpdGlvbk1vZGVsIiwibmF2aWdhdGlvblByZWZpeCIsImZpbHRlckZpZWxkVmFsdWVIZWxwIiwidXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJiVXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJtZXJnZU9iamVjdHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsImlzWE1MIiwidGhlbiIsImFWSEVsZW1lbnRzIiwic0FnZ3JlZ2F0aW9uTmFtZSIsImxlbmd0aCIsImZvckVhY2giLCJlbHQiLCJpbnNlcnRBZ2dyZWdhdGlvbiIsIm9Db250cm9sIiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsIl9hZGRYTUxDdXN0b21GaWx0ZXJGaWVsZCIsInNQcm9wZXJ0eVBhdGgiLCJhRGVwZW5kZW50cyIsImdldEFnZ3JlZ2F0aW9uIiwiaSIsIm9GaWx0ZXJGaWVsZCIsImlzQSIsInNEYXRhUHJvcGVydHkiLCJnZXRGaWVsZFBhdGgiLCJzRmlsdGVyRmllbGRJZCIsImdldElkIiwiaW5kZXhPZiIsIl90ZW1wbGF0ZUZpbHRlckZpZWxkIiwicGFnZU1vZGVsIiwidmhJZFByZWZpeCIsInByb3BlcnR5UGF0aCIsInNQcm9wZXJ0eU5hbWUiLCJzZXR0aW5ncyIsInZpc3VhbEZpbHRlciIsIm9WaXN1YWxGaWx0ZXIiLCJjb252ZXJ0ZXJDb250ZXh0IiwiX2FkZFByb3BlcnR5SW5mbyIsIm9QYXJlbnRDb250cm9sIiwibVByb3BlcnR5QmFnIiwic1Byb3BlcnR5SW5mb05hbWUiLCJzUHJvcGVydHlJbmZvS2V5IiwibW9kaWZpZXIiLCJkZWxlZ2F0ZSIsImdldFByb3BlcnR5IiwiYVByb3BlcnR5SW5mbyIsImhhc1Byb3BlcnR5SW5mbyIsInNvbWUiLCJwcm9wIiwia2V5IiwibmFtZSIsImVudGl0eVR5cGVQYXRoIiwicGF5bG9hZCIsIkZpbHRlclV0aWxzIiwiY3JlYXRlQ29udmVydGVyQ29udGV4dCIsImFwcENvbXBvbmVudCIsImVudGl0eVR5cGUiLCJnZXRFbnRpdHlUeXBlIiwiZmlsdGVyRmllbGQiLCJnZXRGaWx0ZXJGaWVsZCIsImJ1aWxkUHJvcGVyeUluZm8iLCJwdXNoIiwic2V0UHJvcGVydHkiLCJlcnJvck1zZyIsIndhcm5pbmciLCJhZGRJdGVtIiwiX2FkZFAxM25JdGVtIiwibW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJ0YXJnZXRzIiwiX2FkZEZsZXhJdGVtIiwicmVtb3ZlSXRlbSIsIm9GaWx0ZXJGaWVsZFByb3BlcnR5IiwiZG9SZW1vdmVJdGVtIiwiZGF0YSIsImFkZENvbmRpdGlvbiIsInJlbW92ZUNvbmRpdGlvbiIsImNsZWFyRmlsdGVycyIsIm9GaWx0ZXJDb250cm9sIiwiY2xlYXJGaWx0ZXJWYWx1ZXMiLCJmZXRjaE1vZGVsIiwib01vZGVsIiwiZmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5Iiwib0VudGl0eVR5cGUiLCJnZXRPYmplY3QiLCJpbmNsdWRlSGlkZGVuIiwib0NvbnZlcnRlckNvbnRleHQiLCJzRW50aXR5U2V0UGF0aCIsImdldEVudGl0eVNldFBhdGgiLCJtRmlsdGVyRmllbGRzIiwiZ2V0Q29udmVydGVkRmlsdGVyRmllbGRzIiwiYUZldGNoZWRQcm9wZXJ0aWVzIiwib0ZpbHRlckZpZWxkSW5mbyIsImFubm90YXRpb25QYXRoIiwic1RhcmdldFByb3BlcnR5UHJlZml4IiwiQ29tbW9uSGVscGVyIiwiZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgiLCJzUHJvcGVydHkiLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsImFQYXJhbWV0ZXJGaWVsZHMiLCJwcm9jZXNzZWRGaWVsZHMiLCJwcm9jZXNzU2VsZWN0aW9uRmllbGRzIiwicHJvY2Vzc2VkRmllbGRzS2V5cyIsIm9Qcm9wcyIsImZpbHRlciIsIm9Qcm9wIiwiaW5jbHVkZXMiLCJvRlIiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgiLCJtQWxsb3dlZEV4cHJlc3Npb25zIiwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIiwia2V5cyIsInNGaWx0ZXJGaWVsZEtleSIsIm9TZWxGaWVsZCIsImdyb3VwIiwiZ3JvdXBMYWJlbCIsInBhdGgiLCJ0b29sdGlwIiwicmVtb3ZlRnJvbUFwcFN0YXRlIiwiaGFzVmFsdWVIZWxwIiwic0Fubm90YXRpb25QYXRoIiwib1Byb3BlcnR5Iiwib1Byb3BlcnR5QW5ub3RhdGlvbnMiLCJvUHJvcGVydHlDb250ZXh0IiwiYlJlbW92ZUZyb21BcHBTdGF0ZSIsIm9GaWx0ZXJEZWZhdWx0VmFsdWVBbm5vdGF0aW9uIiwib0ZpbHRlckRlZmF1bHRWYWx1ZSIsImdldE1vZGVsVHlwZSIsIiRUeXBlIiwiY29udGV4dCIsImRlZmF1bHRGaWx0ZXJDb25kaXRpb25zIiwiZmllbGRQYXRoIiwib3BlcmF0b3IiLCJ2YWx1ZXMiLCJmaWx0ZXJFeHByZXNzaW9uIiwiZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbiIsInZpc2libGUiLCJwcm9wSW5mbyIsImxhYmVsIiwiZ2V0VGV4dCIsInR5cGVDb25maWciLCJUeXBlVXRpbCIsImdldFR5cGVDb25maWciLCJkYXRhVHlwZSIsImZvcm1hdE9wdGlvbnMiLCJjb25zdHJhaW50cyIsImdldExvY2FsaXplZFRleHQiLCJpc1BhcmFtZXRlciIsInNldEN1c3RvbURhdGEiLCJnZXRMaW5lSXRlbVF1YWxpZmllckZyb21UYWJsZSIsImFubm90YXRpb25QYXRocyIsImdldE1ldGFQYXRoIiwic3BsaXQiLCJWaXN1YWxpemF0aW9ucyIsInZpc3VhbGl6YXRpb24iLCIkQW5ub3RhdGlvblBhdGgiLCJtZXRhUGF0aHMiLCJzRmxleFByb3BlcnR5TmFtZSIsIm9BcHBDb21wb25lbnQiLCJnZXRQYXJlbnQiLCJiSXNYTUwiLCJ0ZW1wbGF0ZSIsInR5cGUiLCJzTmF2aWdhdGlvblBhdGgiLCJnZXROYXZpZ2F0aW9uUGF0aCIsInNVc2VTZW1hbnRpY0RhdGVSYW5nZSIsInNCaW5kaW5nUGF0aCIsInN1YnN0ciIsImxhc3RJbmRleE9mIiwic1JldHJpZXZlZEVudGl0eVR5cGVQYXRoIiwic1JldHJpZXZlZFVzZVNlbWFudGljRGF0ZVJhbmdlIiwic0luRmlsdGVyQmFySWQiLCJwcm9wZXJ0eSIsImZpbHRlck91dE5hdlByb3BCaW5kaW5nIiwiam9pbiIsInNWYWx1ZUhlbHBUeXBlIiwiZG9lc1ZhbHVlSGVscEV4aXN0IiwiYlZhbHVlSGVscEV4aXN0cyIsIl9nZXRQYWdlTW9kZWwiLCJfZ2V0Q2FjaGVkUHJvcGVydGllcyIsIndpbmRvdyIsIkVsZW1lbnQiLCJfc2V0Q2FjaGVkUHJvcGVydGllcyIsIl9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eSIsImxvY2FsR3JvdXBMYWJlbCIsIm9Hcm91cCIsInNvcnQiLCJhIiwiYiIsImxvY2FsZUNvbXBhcmUiLCJmZXRjaFByb3BlcnRpZXMiLCJnZXRUeXBlVXRpbCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZU9iamVjdHMgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IHByb2Nlc3NTZWxlY3Rpb25GaWVsZHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L0ZpbHRlckJhclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgVGVtcGxhdGVNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVNb2RlbFwiO1xuaW1wb3J0IHsgaGFzVmFsdWVIZWxwIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgeyBnZXRNb2RlbFR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdHlwZS9FRE1cIjtcbmltcG9ydCBUeXBlVXRpbCBmcm9tIFwic2FwL2ZlL2NvcmUvdHlwZS9UeXBlVXRpbFwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IEZpbHRlckJhckRlbGVnYXRlIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhckRlbGVnYXRlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuY29uc3QgT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZSA9IE9iamVjdC5hc3NpZ24oe30sIEZpbHRlckJhckRlbGVnYXRlKSBhcyBhbnk7XG5jb25zdCBFRElUX1NUQVRFX1BST1BFUlRZX05BTUUgPSBcIiRlZGl0U3RhdGVcIixcblx0U0VBUkNIX1BST1BFUlRZX05BTUUgPSBcIiRzZWFyY2hcIixcblx0VkFMVUVfSEVMUF9UWVBFID0gXCJGaWx0ZXJGaWVsZFZhbHVlSGVscFwiLFxuXHRGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVkgPSBcInNhcF9mZV9GaWx0ZXJCYXJEZWxlZ2F0ZV9wcm9wZXJ0eUluZm9NYXBcIixcblx0Q09ORElUSU9OX1BBVEhfVE9fUFJPUEVSVFlfUEFUSF9SRUdFWCA9IC9bKypdL2c7XG5cbmZ1bmN0aW9uIF90ZW1wbGF0ZUVkaXRTdGF0ZShzSWRQcmVmaXg6IGFueSwgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgb01vZGlmaWVyOiBhbnkpIHtcblx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdGlkOiBzSWRQcmVmaXgsXG5cdFx0XHRpc0RyYWZ0Q29sbGFib3JhdGl2ZTogTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQobWV0YU1vZGVsKVxuXHRcdH0pLFxuXHRcdG9QcmVwcm9jZXNzb3JTZXR0aW5ncyA9IHtcblx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHR0aGlzOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdH0sXG5cdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XCJ0aGlzLmkxOG5cIjogUmVzb3VyY2VNb2RlbC5nZXRNb2RlbCgpLFxuXHRcdFx0XHR0aGlzOiBvVGhpc1xuXHRcdFx0fVxuXHRcdH07XG5cblx0cmV0dXJuIERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChcInNhcC5mZS5tYWNyb3MuZmlsdGVyLkRyYWZ0RWRpdFN0YXRlXCIsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywgdW5kZWZpbmVkLCBvTW9kaWZpZXIpLmZpbmFsbHkoXG5cdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdH1cblx0KTtcbn1cblxuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fdGVtcGxhdGVDdXN0b21GaWx0ZXIgPSBhc3luYyBmdW5jdGlvbiAoXG5cdG9GaWx0ZXJCYXI6IGFueSxcblx0c0lkUHJlZml4OiBhbnksXG5cdG9TZWxlY3Rpb25GaWVsZEluZm86IGFueSxcblx0b01ldGFNb2RlbDogYW55LFxuXHRvTW9kaWZpZXI6IGFueVxuKSB7XG5cdGNvbnN0IHNFbnRpdHlUeXBlUGF0aCA9IGF3YWl0IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9GaWx0ZXJCYXIsIFwiZW50aXR5VHlwZVwiLCBvTW9kaWZpZXIpO1xuXHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0aWQ6IHNJZFByZWZpeFxuXHRcdH0pLFxuXHRcdG9JdGVtTW9kZWwgPSBuZXcgVGVtcGxhdGVNb2RlbChvU2VsZWN0aW9uRmllbGRJbmZvLCBvTWV0YU1vZGVsKSxcblx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0Y29udGV4dFBhdGg6IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVR5cGVQYXRoKSxcblx0XHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRpdGVtOiBvSXRlbU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdFx0fSxcblx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRjb250ZXh0UGF0aDogb01ldGFNb2RlbCxcblx0XHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHRcdGl0ZW06IG9JdGVtTW9kZWxcblx0XHRcdH1cblx0XHR9LFxuXHRcdG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvRmlsdGVyQmFyKSxcblx0XHRvQ29udHJvbGxlciA9IG9WaWV3ID8gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIDogdW5kZWZpbmVkLFxuXHRcdG9PcHRpb25zID0ge1xuXHRcdFx0Y29udHJvbGxlcjogb0NvbnRyb2xsZXIgPyBvQ29udHJvbGxlciA6IHVuZGVmaW5lZCxcblx0XHRcdHZpZXc6IG9WaWV3XG5cdFx0fTtcblxuXHRyZXR1cm4gRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFwic2FwLmZlLm1hY3Jvcy5maWx0ZXIuQ3VzdG9tRmlsdGVyXCIsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywgb09wdGlvbnMsIG9Nb2RpZmllcikuZmluYWxseShcblx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRvVGhpcy5kZXN0cm95KCk7XG5cdFx0XHRvSXRlbU1vZGVsLmRlc3Ryb3koKTtcblx0XHR9XG5cdCk7XG59O1xuZnVuY3Rpb24gX2dldFByb3BlcnR5UGF0aChzQ29uZGl0aW9uUGF0aDogYW55KSB7XG5cdHJldHVybiBzQ29uZGl0aW9uUGF0aC5yZXBsYWNlKENPTkRJVElPTl9QQVRIX1RPX1BST1BFUlRZX1BBVEhfUkVHRVgsIFwiXCIpO1xufVxuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fZmluZFNlbGVjdGlvbkZpZWxkID0gZnVuY3Rpb24gKGFTZWxlY3Rpb25GaWVsZHM6IGFueSwgc0ZsZXhOYW1lOiBhbnkpIHtcblx0cmV0dXJuIGFTZWxlY3Rpb25GaWVsZHMuZmluZChmdW5jdGlvbiAob1NlbGVjdGlvbkZpZWxkOiBhbnkpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0KG9TZWxlY3Rpb25GaWVsZC5jb25kaXRpb25QYXRoID09PSBzRmxleE5hbWUgfHwgb1NlbGVjdGlvbkZpZWxkLmNvbmRpdGlvblBhdGgucmVwbGFjZUFsbCgvXFwqL2csIFwiXCIpID09PSBzRmxleE5hbWUpICYmXG5cdFx0XHRvU2VsZWN0aW9uRmllbGQuYXZhaWxhYmlsaXR5ICE9PSBcIkhpZGRlblwiXG5cdFx0KTtcblx0fSk7XG59O1xuZnVuY3Rpb24gX2dlbmVyYXRlSWRQcmVmaXgoc0ZpbHRlckJhcklkOiBhbnksIHNDb250cm9sVHlwZTogYW55LCBzTmF2aWdhdGlvblByZWZpeD86IGFueSkge1xuXHRyZXR1cm4gc05hdmlnYXRpb25QcmVmaXggPyBnZW5lcmF0ZShbc0ZpbHRlckJhcklkLCBzQ29udHJvbFR5cGUsIHNOYXZpZ2F0aW9uUHJlZml4XSkgOiBnZW5lcmF0ZShbc0ZpbHRlckJhcklkLCBzQ29udHJvbFR5cGVdKTtcbn1cbmZ1bmN0aW9uIF90ZW1wbGF0ZVZhbHVlSGVscChvU2V0dGluZ3M6IGFueSwgb1BhcmFtZXRlcnM6IGFueSkge1xuXHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdGlkUHJlZml4OiBvUGFyYW1ldGVycy5zVmhJZFByZWZpeCxcblx0XHRjb25kaXRpb25Nb2RlbDogXCIkZmlsdGVyc1wiLFxuXHRcdG5hdmlnYXRpb25QcmVmaXg6IG9QYXJhbWV0ZXJzLnNOYXZpZ2F0aW9uUHJlZml4ID8gYC8ke29QYXJhbWV0ZXJzLnNOYXZpZ2F0aW9uUHJlZml4fWAgOiBcIlwiLFxuXHRcdGZpbHRlckZpZWxkVmFsdWVIZWxwOiB0cnVlLFxuXHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlOiBvUGFyYW1ldGVycy5iVXNlU2VtYW50aWNEYXRlUmFuZ2Vcblx0fSk7XG5cdGNvbnN0IG9QcmVwcm9jZXNzb3JTZXR0aW5ncyA9IG1lcmdlT2JqZWN0cyh7fSwgb1NldHRpbmdzLCB7XG5cdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHR0aGlzOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHR9LFxuXHRcdG1vZGVsczoge1xuXHRcdFx0dGhpczogb1RoaXNcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoXG5cdFx0RGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC52YWx1ZWhlbHAuVmFsdWVIZWxwXCIsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywge1xuXHRcdFx0aXNYTUw6IG9TZXR0aW5ncy5pc1hNTFxuXHRcdH0pXG5cdClcblx0XHQudGhlbihmdW5jdGlvbiAoYVZIRWxlbWVudHM6IGFueSkge1xuXHRcdFx0aWYgKGFWSEVsZW1lbnRzKSB7XG5cdFx0XHRcdGNvbnN0IHNBZ2dyZWdhdGlvbk5hbWUgPSBcImRlcGVuZGVudHNcIjtcblx0XHRcdFx0Ly9Tb21lIGZpbHRlciBmaWVsZHMgaGF2ZSB0aGUgUGVyc2lzdGVuY2VQcm92aWRlciBhZ2dyZWdhdGlvbiBiZXNpZGVzIHRoZSBGVkggOlxuXHRcdFx0XHRpZiAoYVZIRWxlbWVudHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0YVZIRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWx0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChvUGFyYW1ldGVycy5vTW9kaWZpZXIpIHtcblx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlcnMub01vZGlmaWVyLmluc2VydEFnZ3JlZ2F0aW9uKG9QYXJhbWV0ZXJzLm9Db250cm9sLCBzQWdncmVnYXRpb25OYW1lLCBlbHQsIDApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlcnMub0NvbnRyb2wuaW5zZXJ0QWdncmVnYXRpb24oc0FnZ3JlZ2F0aW9uTmFtZSwgZWx0LCAwLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAob1BhcmFtZXRlcnMub01vZGlmaWVyKSB7XG5cdFx0XHRcdFx0b1BhcmFtZXRlcnMub01vZGlmaWVyLmluc2VydEFnZ3JlZ2F0aW9uKG9QYXJhbWV0ZXJzLm9Db250cm9sLCBzQWdncmVnYXRpb25OYW1lLCBhVkhFbGVtZW50cywgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b1BhcmFtZXRlcnMub0NvbnRyb2wuaW5zZXJ0QWdncmVnYXRpb24oc0FnZ3JlZ2F0aW9uTmFtZSwgYVZIRWxlbWVudHMsIDAsIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZXZhbHVhdGluZyBEZWxlZ2F0ZVV0aWwuaXNWYWx1ZUhlbHBSZXF1aXJlZFwiLCBvRXJyb3IpO1xuXHRcdH0pXG5cdFx0LmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gX2FkZFhNTEN1c3RvbUZpbHRlckZpZWxkKG9GaWx0ZXJCYXI6IGFueSwgb01vZGlmaWVyOiBhbnksIHNQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHR0cnkge1xuXHRcdGNvbnN0IGFEZXBlbmRlbnRzID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG9Nb2RpZmllci5nZXRBZ2dyZWdhdGlvbihvRmlsdGVyQmFyLCBcImRlcGVuZGVudHNcIikpO1xuXHRcdGxldCBpO1xuXHRcdGlmIChhRGVwZW5kZW50cyAmJiBhRGVwZW5kZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDw9IGFEZXBlbmRlbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IG9GaWx0ZXJGaWVsZCA9IGFEZXBlbmRlbnRzW2ldO1xuXHRcdFx0XHRpZiAob0ZpbHRlckZpZWxkICYmIG9GaWx0ZXJGaWVsZC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc0RhdGFQcm9wZXJ0eSA9IG9GaWx0ZXJGaWVsZC5nZXRGaWVsZFBhdGgoKSxcblx0XHRcdFx0XHRcdHNGaWx0ZXJGaWVsZElkID0gb0ZpbHRlckZpZWxkLmdldElkKCk7XG5cdFx0XHRcdFx0aWYgKHNQcm9wZXJ0eVBhdGggPT09IHNEYXRhUHJvcGVydHkgJiYgc0ZpbHRlckZpZWxkSWQuaW5kZXhPZihcIkN1c3RvbUZpbHRlckZpZWxkXCIpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9GaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdExvZy5lcnJvcihcIkZpbHRlciBDYW5ub3QgYmUgYWRkZWRcIiwgb0Vycm9yKTtcblx0fVxufVxuZnVuY3Rpb24gX3RlbXBsYXRlRmlsdGVyRmllbGQob1NldHRpbmdzOiBhbnksIG9QYXJhbWV0ZXJzOiBhbnksIHBhZ2VNb2RlbD86IEpTT05Nb2RlbCkge1xuXHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdGlkUHJlZml4OiBvUGFyYW1ldGVycy5zSWRQcmVmaXgsXG5cdFx0dmhJZFByZWZpeDogb1BhcmFtZXRlcnMuc1ZoSWRQcmVmaXgsXG5cdFx0cHJvcGVydHlQYXRoOiBvUGFyYW1ldGVycy5zUHJvcGVydHlOYW1lLFxuXHRcdG5hdmlnYXRpb25QcmVmaXg6IG9QYXJhbWV0ZXJzLnNOYXZpZ2F0aW9uUHJlZml4ID8gYC8ke29QYXJhbWV0ZXJzLnNOYXZpZ2F0aW9uUHJlZml4fWAgOiBcIlwiLFxuXHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlOiBvUGFyYW1ldGVycy5iVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0c2V0dGluZ3M6IG9QYXJhbWV0ZXJzLm9TZXR0aW5ncyxcblx0XHR2aXN1YWxGaWx0ZXI6IG9QYXJhbWV0ZXJzLnZpc3VhbEZpbHRlclxuXHR9KTtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9QYXJhbWV0ZXJzLm9NZXRhTW9kZWw7XG5cdGNvbnN0IG9WaXN1YWxGaWx0ZXIgPSBuZXcgVGVtcGxhdGVNb2RlbChvUGFyYW1ldGVycy52aXN1YWxGaWx0ZXIsIG9NZXRhTW9kZWwpO1xuXHRjb25zdCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSBtZXJnZU9iamVjdHMoe30sIG9TZXR0aW5ncywge1xuXHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0dmlzdWFsRmlsdGVyOiBvVmlzdWFsRmlsdGVyLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdH0sXG5cdFx0bW9kZWxzOiB7XG5cdFx0XHR0aGlzOiBvVGhpcyxcblx0XHRcdHZpc3VhbEZpbHRlcjogb1Zpc3VhbEZpbHRlcixcblx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IHBhZ2VNb2RlbFxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuZmlsdGVyRmllbGQuRmlsdGVyRmllbGRUZW1wbGF0ZVwiLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHtcblx0XHRpc1hNTDogb1NldHRpbmdzLmlzWE1MXG5cdH0pLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdG9UaGlzLmRlc3Ryb3koKTtcblx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2w6IEZpbHRlckJhciwgbVByb3BlcnR5QmFnOiBhbnksIG9NZXRhTW9kZWw6IGFueSwgc1Byb3BlcnR5SW5mb05hbWU6IHN0cmluZykge1xuXHR0cnkge1xuXHRcdHNQcm9wZXJ0eUluZm9OYW1lID0gc1Byb3BlcnR5SW5mb05hbWUucmVwbGFjZShcIipcIiwgXCJcIik7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5SW5mb0tleSA9IGdlbmVyYXRlKFtzUHJvcGVydHlJbmZvTmFtZV0pOyAvL01ha2luZyBzdXJlIHRoYXQgbmF2aWdhdGlvbiBwcm9wZXJ0eSBuYW1lcyBhcmUgZ2VuZXJhdGVkIHByb3Blcmx5IGUuZy4gX0l0ZW06Ok1hdGVyaWFsXG5cdFx0aWYgKG1Qcm9wZXJ0eUJhZyAmJiAhbVByb3BlcnR5QmFnLm1vZGlmaWVyKSB7XG5cdFx0XHR0aHJvdyBcIkZpbHRlckJhciBEZWxlZ2F0ZSBtZXRob2QgY2FsbGVkIHdpdGhvdXQgbW9kaWZpZXIuXCI7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZGVsZWdhdGUgPSBhd2FpdCBtUHJvcGVydHlCYWcubW9kaWZpZXIuZ2V0UHJvcGVydHkob1BhcmVudENvbnRyb2wsIFwiZGVsZWdhdGVcIik7XG5cdFx0Y29uc3QgYVByb3BlcnR5SW5mbyA9IGF3YWl0IG1Qcm9wZXJ0eUJhZy5tb2RpZmllci5nZXRQcm9wZXJ0eShvUGFyZW50Q29udHJvbCwgXCJwcm9wZXJ0eUluZm9cIik7XG5cdFx0Ly9XZSBkbyBub3QgZ2V0IHByb3BlcnR5SW5mbyBpbiBjYXNlIG9mIHRhYmxlIGZpbHRlcnNcblx0XHRpZiAoYVByb3BlcnR5SW5mbykge1xuXHRcdFx0Y29uc3QgaGFzUHJvcGVydHlJbmZvID0gYVByb3BlcnR5SW5mby5zb21lKGZ1bmN0aW9uIChwcm9wOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHByb3Aua2V5ID09PSBzUHJvcGVydHlJbmZvS2V5IHx8IHByb3AubmFtZSA9PT0gc1Byb3BlcnR5SW5mb0tleTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKCFoYXNQcm9wZXJ0eUluZm8pIHtcblx0XHRcdFx0Y29uc3QgZW50aXR5VHlwZVBhdGggPSBkZWxlZ2F0ZS5wYXlsb2FkLmVudGl0eVR5cGVQYXRoO1xuXHRcdFx0XHRjb25zdCBjb252ZXJ0ZXJDb250ZXh0ID0gRmlsdGVyVXRpbHMuY3JlYXRlQ29udmVydGVyQ29udGV4dChcblx0XHRcdFx0XHRvUGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRlbnRpdHlUeXBlUGF0aCxcblx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnRcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRcdFx0XHRsZXQgZmlsdGVyRmllbGQgPSBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJGaWVsZChzUHJvcGVydHlJbmZvTmFtZSwgY29udmVydGVyQ29udGV4dCwgZW50aXR5VHlwZSk7XG5cdFx0XHRcdGZpbHRlckZpZWxkID0gRmlsdGVyVXRpbHMuYnVpbGRQcm9wZXJ5SW5mbyhmaWx0ZXJGaWVsZCwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRcdGFQcm9wZXJ0eUluZm8ucHVzaChmaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdG1Qcm9wZXJ0eUJhZy5tb2RpZmllci5zZXRQcm9wZXJ0eShvUGFyZW50Q29udHJvbCwgXCJwcm9wZXJ0eUluZm9cIiwgYVByb3BlcnR5SW5mbyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGNhdGNoIChlcnJvck1zZykge1xuXHRcdExvZy53YXJuaW5nKGAke29QYXJlbnRDb250cm9sLmdldElkKCl9IDogJHtlcnJvck1zZ31gKTtcblx0fVxufVxuXG4vKipcbiAqIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgZmlsdGVyIGZpZWxkIGluIHN0YW5kYWxvbmUgbW9kZSAvIGluIHRoZSBwZXJzb25hbGl6YXRpb24gc2V0dGluZ3Mgb2YgdGhlIGZpbHRlciBiYXIuXG4gKlxuICogQHBhcmFtIHNQcm9wZXJ0eUluZm9OYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5IGJlaW5nIGFkZGVkIGFzIHRoZSBmaWx0ZXIgZmllbGRcbiAqIEBwYXJhbSBvUGFyZW50Q29udHJvbCBQYXJlbnQgY29udHJvbCBpbnN0YW5jZSB0byB3aGljaCB0aGUgZmlsdGVyIGZpZWxkIGlzIGFkZGVkXG4gKiBAcGFyYW0gbVByb3BlcnR5QmFnIEluc3RhbmNlIG9mIHRoZSBwcm9wZXJ0eSBiYWcgZnJvbSBGbGV4IEFQSVxuICogQHJldHVybnMgT25jZSByZXNvbHZlZCwgYSBmaWx0ZXIgZmllbGQgZGVmaW5pdGlvbiBpcyByZXR1cm5lZFxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmFkZEl0ZW0gPSBhc3luYyBmdW5jdGlvbiAoc1Byb3BlcnR5SW5mb05hbWU6IHN0cmluZywgb1BhcmVudENvbnRyb2w6IEZpbHRlckJhciwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0aWYgKCFtUHJvcGVydHlCYWcpIHtcblx0XHQvLyBJbnZva2VkIGR1cmluZyBydW50aW1lLlxuXHRcdHJldHVybiBPRGF0YUZpbHRlckJhckRlbGVnYXRlLl9hZGRQMTNuSXRlbShzUHJvcGVydHlJbmZvTmFtZSwgb1BhcmVudENvbnRyb2wpO1xuXHR9XG5cdGNvbnN0IG1vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyO1xuXHRjb25zdCBtb2RlbCA9IG1Qcm9wZXJ0eUJhZyAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQuZ2V0TW9kZWwoKTtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG1vZGVsICYmIG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRpZiAoIW9NZXRhTW9kZWwpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9XG5cdGNvbnN0IGlzWE1MID0gbW9kaWZpZXIgJiYgbW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJ4bWxUcmVlXCI7XG5cdGlmIChpc1hNTCkge1xuXHRcdGF3YWl0IF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2wsIG1Qcm9wZXJ0eUJhZywgb01ldGFNb2RlbCwgc1Byb3BlcnR5SW5mb05hbWUpO1xuXHR9XG5cdHJldHVybiBPRGF0YUZpbHRlckJhckRlbGVnYXRlLl9hZGRGbGV4SXRlbShzUHJvcGVydHlJbmZvTmFtZSwgb1BhcmVudENvbnRyb2wsIG9NZXRhTW9kZWwsIG1vZGlmaWVyLCBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50KTtcbn07XG5cbi8qKlxuICogTWV0aG9kIHJlc3BvbnNpYmxlIGZvciByZW1vdmluZyBmaWx0ZXIgZmllbGQgaW4gc3RhbmRhbG9uZSAvIHBlcnNvbmFsaXphdGlvbiBmaWx0ZXIgYmFyLlxuICpcbiAqIEBwYXJhbSBvRmlsdGVyRmllbGRQcm9wZXJ0eSBPYmplY3Qgb2YgdGhlIGZpbHRlciBmaWVsZCBwcm9wZXJ0eSBiZWluZyByZW1vdmVkIGFzIGZpbHRlciBmaWVsZFxuICogQHBhcmFtIG9QYXJlbnRDb250cm9sIFBhcmVudCBjb250cm9sIGluc3RhbmNlIGZyb20gd2hpY2ggdGhlIGZpbHRlciBmaWVsZCBpcyByZW1vdmVkXG4gKiBAcGFyYW0gbVByb3BlcnR5QmFnIEluc3RhbmNlIG9mIHByb3BlcnR5IGJhZyBmcm9tIEZsZXggQVBJXG4gKiBAcmV0dXJucyBUaGUgcmVzb2x2ZWQgcHJvbWlzZVxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLnJlbW92ZUl0ZW0gPSBhc3luYyBmdW5jdGlvbiAob0ZpbHRlckZpZWxkUHJvcGVydHk6IGFueSwgb1BhcmVudENvbnRyb2w6IGFueSwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0bGV0IGRvUmVtb3ZlSXRlbSA9IHRydWU7XG5cdGNvbnN0IG1vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyO1xuXHRjb25zdCBpc1hNTCA9IG1vZGlmaWVyICYmIG1vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiO1xuXHRpZiAoaXNYTUwgJiYgIW9QYXJlbnRDb250cm9sLmRhdGEoXCJzYXBfZmVfRmlsdGVyQmFyRGVsZWdhdGVfcHJvcGVydHlJbmZvTWFwXCIpKSB7XG5cdFx0Y29uc3QgbW9kZWwgPSBtUHJvcGVydHlCYWcgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG1vZGVsICYmIG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBvRmlsdGVyRmllbGRQcm9wZXJ0eSAhPT0gXCJzdHJpbmdcIiAmJiBvRmlsdGVyRmllbGRQcm9wZXJ0eS5nZXRGaWVsZFBhdGgoKSkge1xuXHRcdFx0YXdhaXQgX2FkZFByb3BlcnR5SW5mbyhvUGFyZW50Q29udHJvbCwgbVByb3BlcnR5QmFnLCBvTWV0YU1vZGVsLCBvRmlsdGVyRmllbGRQcm9wZXJ0eS5nZXRGaWVsZFBhdGgoKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF3YWl0IF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2wsIG1Qcm9wZXJ0eUJhZywgb01ldGFNb2RlbCwgb0ZpbHRlckZpZWxkUHJvcGVydHkpO1xuXHRcdH1cblx0fVxuXHRpZiAodHlwZW9mIG9GaWx0ZXJGaWVsZFByb3BlcnR5ICE9PSBcInN0cmluZ1wiICYmIG9GaWx0ZXJGaWVsZFByb3BlcnR5LmlzQSAmJiBvRmlsdGVyRmllbGRQcm9wZXJ0eS5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpKSB7XG5cdFx0aWYgKG9GaWx0ZXJGaWVsZFByb3BlcnR5LmRhdGEoXCJpc1Nsb3RcIikgPT09IFwidHJ1ZVwiICYmIG1Qcm9wZXJ0eUJhZykge1xuXHRcdFx0Ly8gSW5zZXJ0aW5nIGludG8gdGhlIG1vZGlmaWVyIGNyZWF0ZXMgYSBjaGFuZ2UgZnJvbSBmbGV4IGFsc28gZmlsdGVyIGlzIGJlZW4gcmVtb3ZlZCBoZW5jZSBwcm9taXNlIGlzIHJlc29sdmVkIHRvIGZhbHNlXG5cdFx0XHRtb2RpZmllci5pbnNlcnRBZ2dyZWdhdGlvbihvUGFyZW50Q29udHJvbCwgXCJkZXBlbmRlbnRzXCIsIG9GaWx0ZXJGaWVsZFByb3BlcnR5KTtcblx0XHRcdGRvUmVtb3ZlSXRlbSA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRvUmVtb3ZlSXRlbSk7XG59O1xuXG4vKipcbiAqIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgZmlsdGVyIGZpZWxkIGNvbmRpdGlvbiBpbiBzdGFuZGFsb25lIC8gcGVyc29uYWxpemF0aW9uIGZpbHRlciBiYXIuXG4gKlxuICogQHBhcmFtIHNQcm9wZXJ0eUluZm9OYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5IGJlaW5nIGFkZGVkIGFzIGZpbHRlciBmaWVsZFxuICogQHBhcmFtIG9QYXJlbnRDb250cm9sIFBhcmVudCBjb250cm9sIGluc3RhbmNlIHRvIHdoaWNoIHRoZSBmaWx0ZXIgZmllbGQgaXMgYWRkZWRcbiAqIEBwYXJhbSBtUHJvcGVydHlCYWcgSW5zdGFuY2Ugb2YgcHJvcGVydHkgYmFnIGZyb20gRmxleCBBUElcbiAqIEByZXR1cm5zIFRoZSByZXNvbHZlZCBwcm9taXNlXG4gKi9cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuYWRkQ29uZGl0aW9uID0gYXN5bmMgZnVuY3Rpb24gKHNQcm9wZXJ0eUluZm9OYW1lOiBzdHJpbmcsIG9QYXJlbnRDb250cm9sOiBGaWx0ZXJCYXIsIG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdGNvbnN0IG1vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyO1xuXHRjb25zdCBpc1hNTCA9IG1vZGlmaWVyICYmIG1vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiO1xuXHRpZiAoaXNYTUwpIHtcblx0XHRjb25zdCBtb2RlbCA9IG1Qcm9wZXJ0eUJhZyAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gbW9kZWwgJiYgbW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0aWYgKCFvTWV0YU1vZGVsKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblx0XHRhd2FpdCBfYWRkUHJvcGVydHlJbmZvKG9QYXJlbnRDb250cm9sLCBtUHJvcGVydHlCYWcsIG9NZXRhTW9kZWwsIHNQcm9wZXJ0eUluZm9OYW1lKTtcblx0fVxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG59O1xuXG4vKipcbiAqIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgcmVtb3ZpbmcgZmlsdGVyIGZpZWxkIGluIHN0YW5kYWxvbmUgLyBwZXJzb25hbGl6YXRpb24gZmlsdGVyIGJhci5cbiAqXG4gKiBAcGFyYW0gc1Byb3BlcnR5SW5mb05hbWUgTmFtZSBvZiB0aGUgcHJvcGVydHkgYmVpbmcgcmVtb3ZlZCBhcyBmaWx0ZXIgZmllbGRcbiAqIEBwYXJhbSBvUGFyZW50Q29udHJvbCBQYXJlbnQgY29udHJvbCBpbnN0YW5jZSBmcm9tIHdoaWNoIHRoZSBmaWx0ZXIgZmllbGQgaXMgcmVtb3ZlZFxuICogQHBhcmFtIG1Qcm9wZXJ0eUJhZyBJbnN0YW5jZSBvZiBwcm9wZXJ0eSBiYWcgZnJvbSBGbGV4IEFQSVxuICogQHJldHVybnMgVGhlIHJlc29sdmVkIHByb21pc2VcbiAqL1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5yZW1vdmVDb25kaXRpb24gPSBhc3luYyBmdW5jdGlvbiAoc1Byb3BlcnR5SW5mb05hbWU6IHN0cmluZywgb1BhcmVudENvbnRyb2w6IGFueSwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0aWYgKCFvUGFyZW50Q29udHJvbC5kYXRhKFwic2FwX2ZlX0ZpbHRlckJhckRlbGVnYXRlX3Byb3BlcnR5SW5mb01hcFwiKSkge1xuXHRcdGNvbnN0IG1vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyO1xuXHRcdGNvbnN0IGlzWE1MID0gbW9kaWZpZXIgJiYgbW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJ4bWxUcmVlXCI7XG5cdFx0aWYgKGlzWE1MKSB7XG5cdFx0XHRjb25zdCBtb2RlbCA9IG1Qcm9wZXJ0eUJhZyAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQuZ2V0TW9kZWwoKTtcblx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBtb2RlbCAmJiBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdFx0fVxuXHRcdFx0YXdhaXQgX2FkZFByb3BlcnR5SW5mbyhvUGFyZW50Q29udHJvbCwgbVByb3BlcnR5QmFnLCBvTWV0YU1vZGVsLCBzUHJvcGVydHlJbmZvTmFtZSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbn07XG4vKipcbiAqIENsZWFycyBhbGwgaW5wdXQgdmFsdWVzIG9mIHZpc2libGUgZmlsdGVyIGZpZWxkcyBpbiB0aGUgZmlsdGVyIGJhci5cbiAqXG4gKiBAcGFyYW0gb0ZpbHRlckNvbnRyb2wgSW5zdGFuY2Ugb2YgdGhlIEZpbHRlckJhciBjb250cm9sXG4gKiBAcmV0dXJucyBUaGUgcmVzb2x2ZWQgcHJvbWlzZVxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmNsZWFyRmlsdGVycyA9IGFzeW5jIGZ1bmN0aW9uIChvRmlsdGVyQ29udHJvbDogdW5rbm93bikge1xuXHRyZXR1cm4gRmlsdGVyVXRpbHMuY2xlYXJGaWx0ZXJWYWx1ZXMob0ZpbHRlckNvbnRyb2wpO1xufTtcbi8qKlxuICogQ3JlYXRlcyB0aGUgZmlsdGVyIGZpZWxkIGluIHRoZSB0YWJsZSBhZGFwdGF0aW9uIG9mIHRoZSBGaWx0ZXJCYXIuXG4gKlxuICogQHBhcmFtIHNQcm9wZXJ0eUluZm9OYW1lIFRoZSBwcm9wZXJ0eSBuYW1lIG9mIHRoZSBlbnRpdHkgdHlwZSBmb3Igd2hpY2ggdGhlIGZpbHRlciBmaWVsZCBuZWVkcyB0byBiZSBjcmVhdGVkXG4gKiBAcGFyYW0gb1BhcmVudENvbnRyb2wgSW5zdGFuY2Ugb2YgdGhlIHBhcmVudCBjb250cm9sXG4gKiBAcmV0dXJucyBPbmNlIHJlc29sdmVkLCBhIGZpbHRlciBmaWVsZCBkZWZpbml0aW9uIGlzIHJldHVybmVkXG4gKi9cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2FkZFAxM25JdGVtID0gZnVuY3Rpb24gKHNQcm9wZXJ0eUluZm9OYW1lOiBzdHJpbmcsIG9QYXJlbnRDb250cm9sOiBvYmplY3QpIHtcblx0cmV0dXJuIERlbGVnYXRlVXRpbC5mZXRjaE1vZGVsKG9QYXJlbnRDb250cm9sKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChvTW9kZWw6IGFueSkge1xuXHRcdFx0cmV0dXJuIE9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2FkZEZsZXhJdGVtKHNQcm9wZXJ0eUluZm9OYW1lLCBvUGFyZW50Q29udHJvbCwgb01vZGVsLmdldE1ldGFNb2RlbCgpLCB1bmRlZmluZWQpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiTW9kZWwgY291bGQgbm90IGJlIHJlc29sdmVkXCIsIG9FcnJvcik7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9KTtcbn07XG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmZldGNoUHJvcGVydGllc0ZvckVudGl0eSA9IGZ1bmN0aW9uIChzRW50aXR5VHlwZVBhdGg6IGFueSwgb01ldGFNb2RlbDogYW55LCBvRmlsdGVyQ29udHJvbDogYW55KSB7XG5cdGNvbnN0IG9FbnRpdHlUeXBlID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVR5cGVQYXRoKTtcblx0Y29uc3QgaW5jbHVkZUhpZGRlbiA9IG9GaWx0ZXJDb250cm9sLmlzQShcInNhcC51aS5tZGMuZmlsdGVyYmFyLnZoLkZpbHRlckJhclwiKSA/IHRydWUgOiB1bmRlZmluZWQ7XG5cdGlmICghb0ZpbHRlckNvbnRyb2wgfHwgIW9FbnRpdHlUeXBlKSB7XG5cdFx0cmV0dXJuIFtdO1xuXHR9XG5cdGNvbnN0IG9Db252ZXJ0ZXJDb250ZXh0ID0gRmlsdGVyVXRpbHMuY3JlYXRlQ29udmVydGVyQ29udGV4dChvRmlsdGVyQ29udHJvbCwgc0VudGl0eVR5cGVQYXRoKTtcblx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNFbnRpdHlUeXBlUGF0aCk7XG5cblx0Y29uc3QgbUZpbHRlckZpZWxkcyA9IEZpbHRlclV0aWxzLmdldENvbnZlcnRlZEZpbHRlckZpZWxkcyhvRmlsdGVyQ29udHJvbCwgc0VudGl0eVR5cGVQYXRoLCBpbmNsdWRlSGlkZGVuKTtcblx0bGV0IGFGZXRjaGVkUHJvcGVydGllczogYW55W10gPSBbXTtcblx0bUZpbHRlckZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChvRmlsdGVyRmllbGRJbmZvOiBhbnkpIHtcblx0XHRpZiAob0ZpbHRlckZpZWxkSW5mby5hbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0Y29uc3Qgc1RhcmdldFByb3BlcnR5UHJlZml4ID0gQ29tbW9uSGVscGVyLmdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoKG9NZXRhTW9kZWwsIG9GaWx0ZXJGaWVsZEluZm8uYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5ID0gb0ZpbHRlckZpZWxkSW5mby5hbm5vdGF0aW9uUGF0aC5yZXBsYWNlKGAke3NUYXJnZXRQcm9wZXJ0eVByZWZpeH0vYCwgXCJcIik7XG5cblx0XHRcdGlmIChDb21tb25VdGlscy5pc1Byb3BlcnR5RmlsdGVyYWJsZShvTWV0YU1vZGVsLCBzVGFyZ2V0UHJvcGVydHlQcmVmaXgsIF9nZXRQcm9wZXJ0eVBhdGgoc1Byb3BlcnR5KSwgdHJ1ZSkpIHtcblx0XHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2gob0ZpbHRlckZpZWxkSW5mbyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vQ3VzdG9tIEZpbHRlcnNcblx0XHRcdGFGZXRjaGVkUHJvcGVydGllcy5wdXNoKG9GaWx0ZXJGaWVsZEluZm8pO1xuXHRcdH1cblx0fSk7XG5cblx0Y29uc3QgYVBhcmFtZXRlckZpZWxkczogYW55W10gPSBbXTtcblx0Y29uc3QgcHJvY2Vzc2VkRmllbGRzID0gcHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyhhRmV0Y2hlZFByb3BlcnRpZXMsIG9Db252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgcHJvY2Vzc2VkRmllbGRzS2V5czogYW55W10gPSBbXTtcblx0cHJvY2Vzc2VkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wczogYW55KSB7XG5cdFx0aWYgKG9Qcm9wcy5rZXkpIHtcblx0XHRcdHByb2Nlc3NlZEZpZWxkc0tleXMucHVzaChvUHJvcHMua2V5KTtcblx0XHR9XG5cdH0pO1xuXG5cdGFGZXRjaGVkUHJvcGVydGllcyA9IGFGZXRjaGVkUHJvcGVydGllcy5maWx0ZXIoZnVuY3Rpb24gKG9Qcm9wOiBhbnkpIHtcblx0XHRyZXR1cm4gcHJvY2Vzc2VkRmllbGRzS2V5cy5pbmNsdWRlcyhvUHJvcC5rZXkpO1xuXHR9KTtcblxuXHRjb25zdCBvRlIgPSBDb21tb25VdGlscy5nZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgoc0VudGl0eVNldFBhdGgsIG9NZXRhTW9kZWwpLFxuXHRcdG1BbGxvd2VkRXhwcmVzc2lvbnMgPSBvRlIuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zO1xuXHRPYmplY3Qua2V5cyhwcm9jZXNzZWRGaWVsZHMpLmZvckVhY2goZnVuY3Rpb24gKHNGaWx0ZXJGaWVsZEtleTogc3RyaW5nKSB7XG5cdFx0bGV0IG9Qcm9wID0gcHJvY2Vzc2VkRmllbGRzW3NGaWx0ZXJGaWVsZEtleV07XG5cdFx0Y29uc3Qgb1NlbEZpZWxkID0gYUZldGNoZWRQcm9wZXJ0aWVzW3NGaWx0ZXJGaWVsZEtleSBhcyBhbnldO1xuXHRcdGlmICghb1NlbEZpZWxkIHx8ICFvU2VsRmllbGQuY29uZGl0aW9uUGF0aCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gX2dldFByb3BlcnR5UGF0aChvU2VsRmllbGQuY29uZGl0aW9uUGF0aCk7XG5cdFx0Ly9mZXRjaEJhc2ljXG5cdFx0b1Byb3AgPSBPYmplY3QuYXNzaWduKG9Qcm9wLCB7XG5cdFx0XHRncm91cDogb1NlbEZpZWxkLmdyb3VwLFxuXHRcdFx0Z3JvdXBMYWJlbDogb1NlbEZpZWxkLmdyb3VwTGFiZWwsXG5cdFx0XHRwYXRoOiBvU2VsRmllbGQuY29uZGl0aW9uUGF0aCxcblx0XHRcdHRvb2x0aXA6IG51bGwsXG5cdFx0XHRyZW1vdmVGcm9tQXBwU3RhdGU6IGZhbHNlLFxuXHRcdFx0aGFzVmFsdWVIZWxwOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0Ly9mZXRjaFByb3BJbmZvXG5cdFx0aWYgKG9TZWxGaWVsZC5hbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gb1NlbEZpZWxkLmFubm90YXRpb25QYXRoO1xuXHRcdFx0Y29uc3Qgb1Byb3BlcnR5ID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0Fubm90YXRpb25QYXRoKSxcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQW5ub3RhdGlvblBhdGh9QGApLFxuXHRcdFx0XHRvUHJvcGVydHlDb250ZXh0ID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzQW5ub3RhdGlvblBhdGgpO1xuXG5cdFx0XHRjb25zdCBiUmVtb3ZlRnJvbUFwcFN0YXRlID1cblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLklzUG90ZW50aWFsbHlTZW5zaXRpdmVcIl0gfHxcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dFwiXSB8fFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuTWVhc3VyZVwiXTtcblxuXHRcdFx0Y29uc3Qgc1RhcmdldFByb3BlcnR5UHJlZml4ID0gQ29tbW9uSGVscGVyLmdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoKG9NZXRhTW9kZWwsIG9TZWxGaWVsZC5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRjb25zdCBzUHJvcGVydHkgPSBzQW5ub3RhdGlvblBhdGgucmVwbGFjZShgJHtzVGFyZ2V0UHJvcGVydHlQcmVmaXh9L2AsIFwiXCIpO1xuXHRcdFx0bGV0IG9GaWx0ZXJEZWZhdWx0VmFsdWVBbm5vdGF0aW9uO1xuXHRcdFx0bGV0IG9GaWx0ZXJEZWZhdWx0VmFsdWU7XG5cdFx0XHRpZiAoQ29tbW9uVXRpbHMuaXNQcm9wZXJ0eUZpbHRlcmFibGUob01ldGFNb2RlbCwgc1RhcmdldFByb3BlcnR5UHJlZml4LCBfZ2V0UHJvcGVydHlQYXRoKHNQcm9wZXJ0eSksIHRydWUpKSB7XG5cdFx0XHRcdG9GaWx0ZXJEZWZhdWx0VmFsdWVBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpbHRlckRlZmF1bHRWYWx1ZVwiXTtcblx0XHRcdFx0aWYgKG9GaWx0ZXJEZWZhdWx0VmFsdWVBbm5vdGF0aW9uKSB7XG5cdFx0XHRcdFx0b0ZpbHRlckRlZmF1bHRWYWx1ZSA9IG9GaWx0ZXJEZWZhdWx0VmFsdWVBbm5vdGF0aW9uW2AkJHtnZXRNb2RlbFR5cGUob1Byb3BlcnR5LiRUeXBlKX1gXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG9Qcm9wID0gT2JqZWN0LmFzc2lnbihvUHJvcCwge1xuXHRcdFx0XHRcdHRvb2x0aXA6IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5RdWlja0luZm9cIl0gfHwgdW5kZWZpbmVkLFxuXHRcdFx0XHRcdHJlbW92ZUZyb21BcHBTdGF0ZTogYlJlbW92ZUZyb21BcHBTdGF0ZSxcblx0XHRcdFx0XHRoYXNWYWx1ZUhlbHA6IGhhc1ZhbHVlSGVscChvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpLCB7IGNvbnRleHQ6IG9Qcm9wZXJ0eUNvbnRleHQgfSksXG5cdFx0XHRcdFx0ZGVmYXVsdEZpbHRlckNvbmRpdGlvbnM6IG9GaWx0ZXJEZWZhdWx0VmFsdWVcblx0XHRcdFx0XHRcdD8gW1xuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpZWxkUGF0aDogb1NlbEZpZWxkLmNvbmRpdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRvcGVyYXRvcjogXCJFUVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0dmFsdWVzOiBbb0ZpbHRlckRlZmF1bHRWYWx1ZV1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQgIF1cblx0XHRcdFx0XHRcdDogdW5kZWZpbmVkXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vYmFzZVxuXG5cdFx0aWYgKG9Qcm9wKSB7XG5cdFx0XHRpZiAobUFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHlQYXRoXSAmJiBtQWxsb3dlZEV4cHJlc3Npb25zW3NQcm9wZXJ0eVBhdGhdLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0b1Byb3AuZmlsdGVyRXhwcmVzc2lvbiA9IENvbW1vblV0aWxzLmdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24obUFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHlQYXRoXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUHJvcC5maWx0ZXJFeHByZXNzaW9uID0gXCJhdXRvXCI7XG5cdFx0XHR9XG5cblx0XHRcdG9Qcm9wID0gT2JqZWN0LmFzc2lnbihvUHJvcCwge1xuXHRcdFx0XHR2aXNpYmxlOiBvU2VsRmllbGQuYXZhaWxhYmlsaXR5ID09PSBcIkRlZmF1bHRcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cHJvY2Vzc2VkRmllbGRzW3NGaWx0ZXJGaWVsZEtleV0gPSBvUHJvcDtcblx0fSk7XG5cdHByb2Nlc3NlZEZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wSW5mbzogYW55KSB7XG5cdFx0aWYgKHByb3BJbmZvLnBhdGggPT09IFwiJGVkaXRTdGF0ZVwiKSB7XG5cdFx0XHRwcm9wSW5mby5sYWJlbCA9IFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkZJTFRFUkJBUl9FRElUSU5HX1NUQVRVU1wiKTtcblx0XHR9XG5cdFx0cHJvcEluZm8udHlwZUNvbmZpZyA9IFR5cGVVdGlsLmdldFR5cGVDb25maWcocHJvcEluZm8uZGF0YVR5cGUsIHByb3BJbmZvLmZvcm1hdE9wdGlvbnMsIHByb3BJbmZvLmNvbnN0cmFpbnRzKTtcblx0XHRwcm9wSW5mby5sYWJlbCA9IERlbGVnYXRlVXRpbC5nZXRMb2NhbGl6ZWRUZXh0KHByb3BJbmZvLmxhYmVsLCBvRmlsdGVyQ29udHJvbCkgfHwgXCJcIjtcblx0XHRpZiAocHJvcEluZm8uaXNQYXJhbWV0ZXIpIHtcblx0XHRcdGFQYXJhbWV0ZXJGaWVsZHMucHVzaChwcm9wSW5mby5uYW1lKTtcblx0XHR9XG5cdH0pO1xuXG5cdGFGZXRjaGVkUHJvcGVydGllcyA9IHByb2Nlc3NlZEZpZWxkcztcblx0RGVsZWdhdGVVdGlsLnNldEN1c3RvbURhdGEob0ZpbHRlckNvbnRyb2wsIFwicGFyYW1ldGVyc1wiLCBhUGFyYW1ldGVyRmllbGRzKTtcblxuXHRyZXR1cm4gYUZldGNoZWRQcm9wZXJ0aWVzO1xufTtcblxuZnVuY3Rpb24gZ2V0TGluZUl0ZW1RdWFsaWZpZXJGcm9tVGFibGUob0NvbnRyb2w6IGFueSwgb01ldGFNb2RlbDogYW55KSB7XG5cdGlmIChvQ29udHJvbC5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0Y29uc3QgYW5ub3RhdGlvblBhdGhzID0gb0NvbnRyb2wuZ2V0TWV0YVBhdGgoKS5zcGxpdChcIiNcIilbMF0uc3BsaXQoXCIvXCIpO1xuXHRcdHN3aXRjaCAoYW5ub3RhdGlvblBhdGhzW2Fubm90YXRpb25QYXRocy5sZW5ndGggLSAxXSkge1xuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudH1gOlxuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudH1gOlxuXHRcdFx0XHRyZXR1cm4gb01ldGFNb2RlbFxuXHRcdFx0XHRcdC5nZXRPYmplY3Qob0NvbnRyb2wuZ2V0TWV0YVBhdGgoKSlcblx0XHRcdFx0XHQuVmlzdWFsaXphdGlvbnM/LmZpbmQoKHZpc3VhbGl6YXRpb246IGFueSkgPT4gdmlzdWFsaXphdGlvbi4kQW5ub3RhdGlvblBhdGguaW5jbHVkZXMoYEAke1VJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtfWApKVxuXHRcdFx0XHRcdC4kQW5ub3RhdGlvblBhdGg7XG5cdFx0XHRjYXNlIGBAJHtVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbX1gOlxuXHRcdFx0XHRjb25zdCBtZXRhUGF0aHMgPSBvQ29udHJvbC5nZXRNZXRhUGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0cmV0dXJuIG1ldGFQYXRoc1ttZXRhUGF0aHMubGVuZ3RoIC0gMV07XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2FkZEZsZXhJdGVtID0gZnVuY3Rpb24gKFxuXHRzRmxleFByb3BlcnR5TmFtZTogYW55LFxuXHRvUGFyZW50Q29udHJvbDogYW55LFxuXHRvTWV0YU1vZGVsOiBhbnksXG5cdG9Nb2RpZmllcjogYW55LFxuXHRvQXBwQ29tcG9uZW50OiBhbnlcbikge1xuXHRjb25zdCBzRmlsdGVyQmFySWQgPSBvTW9kaWZpZXIgPyBvTW9kaWZpZXIuZ2V0SWQob1BhcmVudENvbnRyb2wpIDogb1BhcmVudENvbnRyb2wuZ2V0SWQoKSxcblx0XHRzSWRQcmVmaXggPSBvTW9kaWZpZXIgPyBcIlwiIDogXCJBZGFwdGF0aW9uXCIsXG5cdFx0YVNlbGVjdGlvbkZpZWxkcyA9IEZpbHRlclV0aWxzLmdldENvbnZlcnRlZEZpbHRlckZpZWxkcyhcblx0XHRcdG9QYXJlbnRDb250cm9sLFxuXHRcdFx0bnVsbCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0b01vZGlmaWVyLFxuXHRcdFx0b01vZGlmaWVyID8gdW5kZWZpbmVkIDogZ2V0TGluZUl0ZW1RdWFsaWZpZXJGcm9tVGFibGUob1BhcmVudENvbnRyb2wuZ2V0UGFyZW50KCksIG9NZXRhTW9kZWwpXG5cdFx0KSxcblx0XHRvU2VsZWN0aW9uRmllbGQgPSBPRGF0YUZpbHRlckJhckRlbGVnYXRlLl9maW5kU2VsZWN0aW9uRmllbGQoYVNlbGVjdGlvbkZpZWxkcywgc0ZsZXhQcm9wZXJ0eU5hbWUpLFxuXHRcdHNQcm9wZXJ0eVBhdGggPSBfZ2V0UHJvcGVydHlQYXRoKHNGbGV4UHJvcGVydHlOYW1lKSxcblx0XHRiSXNYTUwgPSAhIW9Nb2RpZmllciAmJiBvTW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJ4bWxUcmVlXCI7XG5cdGlmIChzRmxleFByb3BlcnR5TmFtZSA9PT0gRURJVF9TVEFURV9QUk9QRVJUWV9OQU1FKSB7XG5cdFx0cmV0dXJuIF90ZW1wbGF0ZUVkaXRTdGF0ZShzRmlsdGVyQmFySWQsIG9NZXRhTW9kZWwsIG9Nb2RpZmllcik7XG5cdH0gZWxzZSBpZiAoc0ZsZXhQcm9wZXJ0eU5hbWUgPT09IFNFQVJDSF9QUk9QRVJUWV9OQU1FKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0fSBlbHNlIGlmIChvU2VsZWN0aW9uRmllbGQgJiYgb1NlbGVjdGlvbkZpZWxkLnRlbXBsYXRlKSB7XG5cdFx0cmV0dXJuIE9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX3RlbXBsYXRlQ3VzdG9tRmlsdGVyKFxuXHRcdFx0b1BhcmVudENvbnRyb2wsXG5cdFx0XHRfZ2VuZXJhdGVJZFByZWZpeChzRmlsdGVyQmFySWQsIGAke3NJZFByZWZpeH1GaWx0ZXJGaWVsZGApLFxuXHRcdFx0b1NlbGVjdGlvbkZpZWxkLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdG9Nb2RpZmllclxuXHRcdCk7XG5cdH1cblxuXHRpZiAob1NlbGVjdGlvbkZpZWxkLnR5cGUgPT09IFwiU2xvdFwiICYmIG9Nb2RpZmllcikge1xuXHRcdHJldHVybiBfYWRkWE1MQ3VzdG9tRmlsdGVyRmllbGQob1BhcmVudENvbnRyb2wsIG9Nb2RpZmllciwgc1Byb3BlcnR5UGF0aCk7XG5cdH1cblxuXHRjb25zdCBzTmF2aWdhdGlvblBhdGggPSBDb21tb25IZWxwZXIuZ2V0TmF2aWdhdGlvblBhdGgoc1Byb3BlcnR5UGF0aCk7XG5cdGNvbnN0IHNBbm5vdGF0aW9uUGF0aCA9IG9TZWxlY3Rpb25GaWVsZC5hbm5vdGF0aW9uUGF0aDtcblx0bGV0IHNFbnRpdHlUeXBlUGF0aDogc3RyaW5nO1xuXHRsZXQgc1VzZVNlbWFudGljRGF0ZVJhbmdlO1xuXHRsZXQgb1NldHRpbmdzOiBhbnk7XG5cdGxldCBzQmluZGluZ1BhdGg7XG5cdGxldCBvUGFyYW1ldGVyczogYW55O1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChvU2VsZWN0aW9uRmllbGQuaXNQYXJhbWV0ZXIpIHtcblx0XHRcdFx0cmV0dXJuIHNBbm5vdGF0aW9uUGF0aC5zdWJzdHIoMCwgc0Fubm90YXRpb25QYXRoLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9QYXJlbnRDb250cm9sLCBcImVudGl0eVR5cGVcIiwgb01vZGlmaWVyKTtcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uIChzUmV0cmlldmVkRW50aXR5VHlwZVBhdGg6IGFueSkge1xuXHRcdFx0c0VudGl0eVR5cGVQYXRoID0gc1JldHJpZXZlZEVudGl0eVR5cGVQYXRoO1xuXHRcdFx0cmV0dXJuIERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9QYXJlbnRDb250cm9sLCBcInVzZVNlbWFudGljRGF0ZVJhbmdlXCIsIG9Nb2RpZmllcik7XG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbiAoc1JldHJpZXZlZFVzZVNlbWFudGljRGF0ZVJhbmdlOiBhbnkpIHtcblx0XHRcdHNVc2VTZW1hbnRpY0RhdGVSYW5nZSA9IHNSZXRyaWV2ZWRVc2VTZW1hbnRpY0RhdGVSYW5nZTtcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNFbnRpdHlUeXBlUGF0aCArIHNQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0Y29uc3Qgc0luRmlsdGVyQmFySWQgPSBvTW9kaWZpZXIgPyBvTW9kaWZpZXIuZ2V0SWQob1BhcmVudENvbnRyb2wpIDogb1BhcmVudENvbnRyb2wuZ2V0SWQoKTtcblx0XHRcdG9TZXR0aW5ncyA9IHtcblx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVR5cGVQYXRoKSxcblx0XHRcdFx0XHRwcm9wZXJ0eTogb1Byb3BlcnR5Q29udGV4dFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRjb250ZXh0UGF0aDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRwcm9wZXJ0eTogb01ldGFNb2RlbFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpc1hNTDogYklzWE1MXG5cdFx0XHR9O1xuXHRcdFx0c0JpbmRpbmdQYXRoID0gYC8ke01vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoc0VudGl0eVR5cGVQYXRoKVxuXHRcdFx0XHQuc3BsaXQoXCIvXCIpXG5cdFx0XHRcdC5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpXG5cdFx0XHRcdC5qb2luKFwiL1wiKX1gO1xuXHRcdFx0b1BhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdHNQcm9wZXJ0eU5hbWU6IHNQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdHNCaW5kaW5nUGF0aDogc0JpbmRpbmdQYXRoLFxuXHRcdFx0XHRzVmFsdWVIZWxwVHlwZTogc0lkUHJlZml4ICsgVkFMVUVfSEVMUF9UWVBFLFxuXHRcdFx0XHRvQ29udHJvbDogb1BhcmVudENvbnRyb2wsXG5cdFx0XHRcdG9NZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdG9Nb2RpZmllcjogb01vZGlmaWVyLFxuXHRcdFx0XHRzSWRQcmVmaXg6IF9nZW5lcmF0ZUlkUHJlZml4KHNJbkZpbHRlckJhcklkLCBgJHtzSWRQcmVmaXh9RmlsdGVyRmllbGRgLCBzTmF2aWdhdGlvblBhdGgpLFxuXHRcdFx0XHRzVmhJZFByZWZpeDogX2dlbmVyYXRlSWRQcmVmaXgoc0luRmlsdGVyQmFySWQsIHNJZFByZWZpeCArIFZBTFVFX0hFTFBfVFlQRSksXG5cdFx0XHRcdHNOYXZpZ2F0aW9uUHJlZml4OiBzTmF2aWdhdGlvblBhdGgsXG5cdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZTogc1VzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRvU2V0dGluZ3M6IG9TZWxlY3Rpb25GaWVsZCA/IG9TZWxlY3Rpb25GaWVsZC5zZXR0aW5ncyA6IHt9LFxuXHRcdFx0XHR2aXN1YWxGaWx0ZXI6IG9TZWxlY3Rpb25GaWVsZCA/IG9TZWxlY3Rpb25GaWVsZC52aXN1YWxGaWx0ZXIgOiB1bmRlZmluZWRcblx0XHRcdH07XG5cblx0XHRcdHJldHVybiBEZWxlZ2F0ZVV0aWwuZG9lc1ZhbHVlSGVscEV4aXN0KG9QYXJhbWV0ZXJzKTtcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uIChiVmFsdWVIZWxwRXhpc3RzOiBhbnkpIHtcblx0XHRcdGlmICghYlZhbHVlSGVscEV4aXN0cykge1xuXHRcdFx0XHRyZXR1cm4gX3RlbXBsYXRlVmFsdWVIZWxwKG9TZXR0aW5ncywgb1BhcmFtZXRlcnMpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0bGV0IHBhZ2VNb2RlbDtcblx0XHRcdGlmIChvUGFyYW1ldGVycy52aXN1YWxGaWx0ZXIpIHtcblx0XHRcdFx0Ly9OZWVkIHRvIHNldCB0aGUgY29udmVydGVyY29udGV4dCBhcyBwYWdlTW9kZWwgaW4gc2V0dGluZ3MgZm9yIEJ1aWxkaW5nQmxvY2sgMi4wXG5cdFx0XHRcdHBhZ2VNb2RlbCA9IChDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9QYXJlbnRDb250cm9sKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9nZXRQYWdlTW9kZWwoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBfdGVtcGxhdGVGaWx0ZXJGaWVsZChvU2V0dGluZ3MsIG9QYXJhbWV0ZXJzLCBwYWdlTW9kZWwpO1xuXHRcdH0pO1xufTtcbmZ1bmN0aW9uIF9nZXRDYWNoZWRQcm9wZXJ0aWVzKG9GaWx0ZXJCYXI6IGFueSkge1xuXHQvLyBwcm9wZXJ0aWVzIGFyZSBub3QgY2FjaGVkIGR1cmluZyB0ZW1wbGF0aW5nXG5cdGlmIChvRmlsdGVyQmFyIGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRyZXR1cm4gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob0ZpbHRlckJhciwgRkVUQ0hFRF9QUk9QRVJUSUVTX0RBVEFfS0VZKTtcbn1cbmZ1bmN0aW9uIF9zZXRDYWNoZWRQcm9wZXJ0aWVzKG9GaWx0ZXJCYXI6IGFueSwgYUZldGNoZWRQcm9wZXJ0aWVzOiBhbnkpIHtcblx0Ly8gZG8gbm90IGNhY2hlIGR1cmluZyB0ZW1wbGF0aW5nLCBlbHNlIGl0IGJlY29tZXMgcGFydCBvZiB0aGUgY2FjaGVkIHZpZXdcblx0aWYgKG9GaWx0ZXJCYXIgaW5zdGFuY2VvZiB3aW5kb3cuRWxlbWVudCkge1xuXHRcdHJldHVybjtcblx0fVxuXHREZWxlZ2F0ZVV0aWwuc2V0Q3VzdG9tRGF0YShvRmlsdGVyQmFyLCBGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVksIGFGZXRjaGVkUHJvcGVydGllcyk7XG59XG5mdW5jdGlvbiBfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoc0VudGl0eVR5cGVQYXRoOiBhbnksIG9NZXRhTW9kZWw6IGFueSwgb0ZpbHRlckJhcjogYW55KSB7XG5cdGxldCBhRmV0Y2hlZFByb3BlcnRpZXMgPSBfZ2V0Q2FjaGVkUHJvcGVydGllcyhvRmlsdGVyQmFyKTtcblx0bGV0IGxvY2FsR3JvdXBMYWJlbDtcblxuXHRpZiAoIWFGZXRjaGVkUHJvcGVydGllcykge1xuXHRcdGFGZXRjaGVkUHJvcGVydGllcyA9IE9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5KHNFbnRpdHlUeXBlUGF0aCwgb01ldGFNb2RlbCwgb0ZpbHRlckJhcik7XG5cdFx0YUZldGNoZWRQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKG9Hcm91cDogYW55KSB7XG5cdFx0XHRsb2NhbEdyb3VwTGFiZWwgPSBudWxsO1xuXHRcdFx0aWYgKG9Hcm91cC5ncm91cExhYmVsKSB7XG5cdFx0XHRcdGxvY2FsR3JvdXBMYWJlbCA9IERlbGVnYXRlVXRpbC5nZXRMb2NhbGl6ZWRUZXh0KG9Hcm91cC5ncm91cExhYmVsLCBvRmlsdGVyQmFyKTtcblx0XHRcdFx0b0dyb3VwLmdyb3VwTGFiZWwgPSBsb2NhbEdyb3VwTGFiZWwgPT09IG51bGwgPyBvR3JvdXAuZ3JvdXBMYWJlbCA6IGxvY2FsR3JvdXBMYWJlbDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRhRmV0Y2hlZFByb3BlcnRpZXMuc29ydChmdW5jdGlvbiAoYTogYW55LCBiOiBhbnkpIHtcblx0XHRcdGlmIChhLmdyb3VwTGFiZWwgPT09IHVuZGVmaW5lZCB8fCBhLmdyb3VwTGFiZWwgPT09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGIuZ3JvdXBMYWJlbCA9PT0gdW5kZWZpbmVkIHx8IGIuZ3JvdXBMYWJlbCA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBhLmdyb3VwTGFiZWwubG9jYWxlQ29tcGFyZShiLmdyb3VwTGFiZWwpO1xuXHRcdH0pO1xuXHRcdF9zZXRDYWNoZWRQcm9wZXJ0aWVzKG9GaWx0ZXJCYXIsIGFGZXRjaGVkUHJvcGVydGllcyk7XG5cdH1cblx0cmV0dXJuIGFGZXRjaGVkUHJvcGVydGllcztcbn1cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IGFueSkge1xuXHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvRmlsdGVyQmFyLCBcImVudGl0eVR5cGVcIik7XG5cdHJldHVybiBEZWxlZ2F0ZVV0aWwuZmV0Y2hNb2RlbChvRmlsdGVyQmFyKS50aGVuKGZ1bmN0aW9uIChvTW9kZWw6IGFueSkge1xuXHRcdGlmICghb01vZGVsKSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHRcdHJldHVybiBfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoc0VudGl0eVR5cGVQYXRoLCBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksIG9GaWx0ZXJCYXIpO1xuXHRcdC8vIHZhciBhQ2xlYW5lZFByb3BlcnRpZXMgPSBhUHJvcGVydGllcy5jb25jYXQoKTtcblx0XHQvLyB2YXIgYUFsbG93ZWRBdHRyaWJ1dGVzID0gW1wibmFtZVwiLCBcImxhYmVsXCIsIFwidmlzaWJsZVwiLCBcInBhdGhcIiwgXCJ0eXBlQ29uZmlnXCIsIFwibWF4Q29uZGl0aW9uc1wiLCBcImdyb3VwXCIsIFwiZ3JvdXBMYWJlbFwiXTtcblx0XHQvLyBhQ2xlYW5lZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihvUHJvcGVydHkpIHtcblx0XHQvLyBcdE9iamVjdC5rZXlzKG9Qcm9wZXJ0eSkuZm9yRWFjaChmdW5jdGlvbihzUHJvcE5hbWUpIHtcblx0XHQvLyBcdFx0aWYgKGFBbGxvd2VkQXR0cmlidXRlcy5pbmRleE9mKHNQcm9wTmFtZSkgPT09IC0xKSB7XG5cdFx0Ly8gXHRcdFx0ZGVsZXRlIG9Qcm9wZXJ0eVtzUHJvcE5hbWVdO1xuXHRcdC8vIFx0XHR9XG5cdFx0Ly8gXHR9KTtcblx0XHQvLyB9KTtcblx0XHQvLyByZXR1cm4gYUNsZWFuZWRQcm9wZXJ0aWVzO1xuXHR9KTtcbn07XG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmdldFR5cGVVdGlsID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gVHlwZVV0aWw7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBPRGF0YUZpbHRlckJhckRlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQXFCQSxNQUFNQSxzQkFBc0IsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVDLGlCQUFpQixDQUFRO0VBQzFFLE1BQU1DLHdCQUF3QixHQUFHLFlBQVk7SUFDNUNDLG9CQUFvQixHQUFHLFNBQVM7SUFDaENDLGVBQWUsR0FBRyxzQkFBc0I7SUFDeENDLDJCQUEyQixHQUFHLDBDQUEwQztJQUN4RUMscUNBQXFDLEdBQUcsT0FBTztFQUVoRCxTQUFTQyxrQkFBa0IsQ0FBQ0MsU0FBYyxFQUFFQyxTQUF5QixFQUFFQyxTQUFjLEVBQUU7SUFDdEYsTUFBTUMsS0FBSyxHQUFHLElBQUlDLFNBQVMsQ0FBQztRQUMxQkMsRUFBRSxFQUFFTCxTQUFTO1FBQ2JNLG9CQUFvQixFQUFFQyxXQUFXLENBQUNDLDZCQUE2QixDQUFDUCxTQUFTO01BQzFFLENBQUMsQ0FBQztNQUNGUSxxQkFBcUIsR0FBRztRQUN2QkMsZUFBZSxFQUFFO1VBQ2hCQyxJQUFJLEVBQUVSLEtBQUssQ0FBQ1Msb0JBQW9CLENBQUMsR0FBRztRQUNyQyxDQUFDO1FBQ0RDLE1BQU0sRUFBRTtVQUNQLFdBQVcsRUFBRUMsYUFBYSxDQUFDQyxRQUFRLEVBQUU7VUFDckNKLElBQUksRUFBRVI7UUFDUDtNQUNELENBQUM7SUFFRixPQUFPYSxZQUFZLENBQUNDLHVCQUF1QixDQUFDLHFD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