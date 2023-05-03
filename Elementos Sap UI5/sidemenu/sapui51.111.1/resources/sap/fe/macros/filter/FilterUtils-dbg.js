/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/ConverterContext", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticDateOperators", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/DraftEditState", "sap/fe/macros/ODataMetaModelUtil", "sap/ui/core/Core", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/condition/ConditionConverter", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/odata/v4/TypeUtil", "sap/ui/mdc/p13n/StateUtil", "sap/ui/mdc/util/FilterUtil", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/odata/v4/ODataUtils"], function (Log, deepClone, merge, CommonUtils, FilterBarConverter, ConverterContext, MetaModelConverter, ModelHelper, SemanticDateOperators, DisplayModeFormatter, CommonHelper, DelegateUtil, EDITSTATE, MetaModelUtil, Core, Condition, ConditionConverter, ConditionValidated, TypeUtil, StateUtil, FilterUtil, Filter, FilterOperator, ODataUtils) {
  "use strict";

  var ODATA_TYPE_MAPPING = DisplayModeFormatter.ODATA_TYPE_MAPPING;
  const oFilterUtils = {
    getFilter: function (vIFilter) {
      const aFilters = oFilterUtils.getFilterInfo(vIFilter).filters;
      return aFilters.length ? new Filter(oFilterUtils.getFilterInfo(vIFilter).filters, false) : undefined;
    },
    getFilterField: function (propertyPath, converterContext, entityType) {
      return FilterBarConverter.getFilterField(propertyPath, converterContext, entityType);
    },
    buildProperyInfo: function (propertyInfoField, converterContext) {
      let oPropertyInfo;
      const aTypeConfig = {};
      const propertyConvertyContext = converterContext.getConverterContextFor(propertyInfoField.annotationPath);
      const propertyTargetObject = propertyConvertyContext.getDataModelObjectPath().targetObject;
      const oTypeConfig = FilterBarConverter.fetchTypeConfig(propertyTargetObject);
      oPropertyInfo = FilterBarConverter.fetchPropertyInfo(converterContext, propertyInfoField, oTypeConfig);
      aTypeConfig[propertyInfoField.key] = oTypeConfig;
      oPropertyInfo = FilterBarConverter.assignDataTypeToPropertyInfo(oPropertyInfo, converterContext, [], aTypeConfig);
      return oPropertyInfo;
    },
    createConverterContext: function (oFilterControl, sEntityTypePath, metaModel, appComponent) {
      const sFilterEntityTypePath = DelegateUtil.getCustomData(oFilterControl, "entityType"),
        contextPath = sEntityTypePath || sFilterEntityTypePath;
      const oView = oFilterControl.isA ? CommonUtils.getTargetView(oFilterControl) : null;
      const oMetaModel = metaModel || oFilterControl.getModel().getMetaModel();
      const oAppComponent = appComponent || oView && CommonUtils.getAppComponent(oView);
      const oVisualizationObjectPath = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.createBindingContext(contextPath));
      let manifestSettings;
      if (oFilterControl.isA && !oFilterControl.isA("sap.ui.mdc.filterbar.vh.FilterBar")) {
        manifestSettings = oView && oView.getViewData() || {};
      }
      return ConverterContext.createConverterContextForMacro(oVisualizationObjectPath.startingEntitySet.name, oMetaModel, oAppComponent === null || oAppComponent === void 0 ? void 0 : oAppComponent.getDiagnostics(), merge, oVisualizationObjectPath.contextLocation, manifestSettings);
    },
    getConvertedFilterFields: function (oFilterControl, sEntityTypePath, includeHidden, metaModel, appComponent, oModifier, lineItemTerm) {
      const oMetaModel = this._getFilterMetaModel(oFilterControl, metaModel);
      const sFilterEntityTypePath = DelegateUtil.getCustomData(oFilterControl, "entityType"),
        contextPath = sEntityTypePath || sFilterEntityTypePath;
      const lrTables = this._getFieldsForTable(oFilterControl, sEntityTypePath);
      const oConverterContext = this.createConverterContext(oFilterControl, sEntityTypePath, metaModel, appComponent);

      //aSelectionFields = FilterBarConverter.getSelectionFields(oConverterContext);
      return this._getSelectionFields(oFilterControl, sEntityTypePath, sFilterEntityTypePath, contextPath, lrTables, oMetaModel, oConverterContext, includeHidden, oModifier, lineItemTerm);
    },
    getBindingPathForParameters: function (oIFilter, mConditions, aFilterPropertiesMetadata, aParameters) {
      const aParams = [];
      aFilterPropertiesMetadata = oFilterUtils.setTypeConfigToProperties(aFilterPropertiesMetadata);
      // Collecting all parameter values from conditions
      for (let i = 0; i < aParameters.length; i++) {
        const sFieldPath = aParameters[i];
        if (mConditions[sFieldPath] && mConditions[sFieldPath].length > 0) {
          // We would be using only the first condition for parameter value.
          const oConditionInternal = merge({}, mConditions[sFieldPath][0]);
          const oProperty = FilterUtil.getPropertyByKey(aFilterPropertiesMetadata, sFieldPath);
          const oTypeConfig = oProperty.typeConfig || TypeUtil.getTypeConfig(oProperty.dataType, oProperty.formatOptions, oProperty.constraints);
          const mInternalParameterCondition = ConditionConverter.toType(oConditionInternal, oTypeConfig, oIFilter.getTypeUtil());
          const sEdmType = ODATA_TYPE_MAPPING[oTypeConfig.className];
          aParams.push(`${sFieldPath}=${encodeURIComponent(ODataUtils.formatLiteral(mInternalParameterCondition.values[0], sEdmType))}`);
        }
      }

      // Binding path from EntityType
      const sEntityTypePath = oIFilter.data("entityType");
      const sEntitySetPath = sEntityTypePath.substring(0, sEntityTypePath.length - 1);
      const sParameterEntitySet = sEntitySetPath.slice(0, sEntitySetPath.lastIndexOf("/"));
      const sTargetNavigation = sEntitySetPath.substring(sEntitySetPath.lastIndexOf("/") + 1);
      // create parameter context
      return `${sParameterEntitySet}(${aParams.toString()})/${sTargetNavigation}`;
    },
    getEditStateIsHideDraft: function (mConditions) {
      let bIsHideDraft = false;
      if (mConditions && mConditions.$editState) {
        const oCondition = mConditions.$editState.find(function (condition) {
          return condition.operator === "DRAFT_EDIT_STATE";
        });
        if (oCondition && (oCondition.values.includes("ALL_HIDING_DRAFTS") || oCondition.values.includes("SAVED_ONLY"))) {
          bIsHideDraft = true;
        }
      }
      return bIsHideDraft;
    },
    /**
     * Gets all filters that originate from the MDC FilterBar.
     *
     * @param vIFilter String or object instance related to
     *  - MDC_FilterBar/Table/Chart
     * @param mProperties Properties on filters that are to be retrieved. Available parameters:
     * 	 - ignoredProperties: Array of property names which should be not considered for filtering
     *	 - propertiesMetadata: Array with all the property metadata. If not provided, properties will be retrieved from vIFilter.
     *	 - targetControl: MDC_table or chart. If provided, property names which are not relevant for the target control entitySet are not considered.
     * @param mFilterConditions Map with externalized filter conditions.
     * @returns FilterBar filters and basic search
     * @private
     * @ui5-restricted
     */
    getFilterInfo: function (vIFilter, mProperties, mFilterConditions) {
      let aIgnoreProperties = mProperties && mProperties.ignoredProperties || [];
      const oTargetControl = mProperties && mProperties.targetControl,
        sTargetEntityPath = oTargetControl ? oTargetControl.data("entityType") : undefined;
      let oIFilter = vIFilter,
        sSearch,
        aFilters = [],
        sBindingPath,
        aPropertiesMetadata = mProperties && mProperties.propertiesMetadata;
      if (typeof vIFilter === "string") {
        oIFilter = Core.byId(vIFilter);
      }
      if (oIFilter) {
        sSearch = this._getSearchField(oIFilter, aIgnoreProperties);
        const mConditions = this._getFilterConditions(mProperties, mFilterConditions, oIFilter);
        let aFilterPropertiesMetadata = oIFilter.getPropertyInfoSet ? oIFilter.getPropertyInfoSet() : null;
        aFilterPropertiesMetadata = this._getFilterPropertiesMetadata(aFilterPropertiesMetadata, oIFilter);
        if (mProperties && mProperties.targetControl && mProperties.targetControl.isA("sap.ui.mdc.Chart")) {
          Object.keys(mConditions).forEach(function (sKey) {
            if (sKey === "$editState") {
              delete mConditions["$editState"];
            }
          });
        }
        let aParameters = oIFilter.data("parameters") || [];
        aParameters = typeof aParameters === "string" ? JSON.parse(aParameters) : aParameters;
        if (aParameters && aParameters.length > 0) {
          // Binding path changes in case of parameters.
          sBindingPath = oFilterUtils.getBindingPathForParameters(oIFilter, mConditions, aFilterPropertiesMetadata, aParameters);
        }
        if (mConditions) {
          //Exclude Interface Filter properties that are not relevant for the Target control entitySet
          if (sTargetEntityPath && oIFilter.data("entityType") !== sTargetEntityPath) {
            const oMetaModel = oIFilter.getModel().getMetaModel();
            const aTargetPropertiesMetadata = oIFilter.getControlDelegate().fetchPropertiesForEntity(sTargetEntityPath, oMetaModel, oIFilter);
            aPropertiesMetadata = aTargetPropertiesMetadata;
            const mEntityProperties = {};
            for (const i in aTargetPropertiesMetadata) {
              const oEntityProperty = aTargetPropertiesMetadata[i];
              mEntityProperties[oEntityProperty.name] = {
                hasProperty: true,
                dataType: oEntityProperty.dataType
              };
            }
            const _aIgnoreProperties = this._getIgnoredProperties(aFilterPropertiesMetadata, mEntityProperties);
            if (_aIgnoreProperties.length > 0) {
              aIgnoreProperties = aIgnoreProperties.concat(_aIgnoreProperties);
            }
          } else if (!aPropertiesMetadata) {
            aPropertiesMetadata = aFilterPropertiesMetadata;
          }
          // var aParamKeys = [];
          // aParameters.forEach(function (oParam) {
          // 	aParamKeys.push(oParam.key);
          // });
          const oFilter = FilterUtil.getFilterInfo(oIFilter, mConditions, oFilterUtils.setTypeConfigToProperties(aPropertiesMetadata), aIgnoreProperties.concat(aParameters)).filters;
          aFilters = oFilter ? [oFilter] : [];
        }
      }
      return {
        filters: aFilters,
        search: sSearch || undefined,
        bindingPath: sBindingPath
      };
    },
    setTypeConfigToProperties: function (aProperties) {
      if (aProperties && aProperties.length) {
        aProperties.forEach(function (oIFilterProperty) {
          if (oIFilterProperty.typeConfig && oIFilterProperty.typeConfig.typeInstance && oIFilterProperty.typeConfig.typeInstance.getConstraints instanceof Function) {
            return;
          }
          if (oIFilterProperty.path === "$editState") {
            oIFilterProperty.typeConfig = TypeUtil.getTypeConfig("sap.ui.model.odata.type.String", {}, {});
          } else if (oIFilterProperty.path === "$search") {
            oIFilterProperty.typeConfig = TypeUtil.getTypeConfig("sap.ui.model.odata.type.String", {}, {});
          } else if (oIFilterProperty.dataType || oIFilterProperty.typeConfig && oIFilterProperty.typeConfig.className) {
            oIFilterProperty.typeConfig = TypeUtil.getTypeConfig(oIFilterProperty.dataType || oIFilterProperty.typeConfig.className, oIFilterProperty.formatOptions, oIFilterProperty.constraints);
          }
        });
      }
      return aProperties;
    },
    getNotApplicableFilters: function (oFilterBar, oControl) {
      const sTargetEntityTypePath = oControl.data("entityType"),
        oFilterBarEntityPath = oFilterBar.data("entityType"),
        oFilterBarEntitySetAnnotations = oFilterBar.getModel().getMetaModel().getObject(oFilterBarEntityPath),
        aNotApplicable = [],
        mConditions = oFilterBar.getConditions(),
        oMetaModel = oFilterBar.getModel().getMetaModel(),
        bIsFilterBarEntityType = sTargetEntityTypePath === oFilterBar.data("entityType"),
        bIsChart = oControl.isA("sap.ui.mdc.Chart"),
        bIsAnalyticalTable = !bIsChart && oControl.getParent().getTableDefinition().enableAnalytics,
        bEnableSearch = bIsChart ? CommonHelper.parseCustomData(DelegateUtil.getCustomData(oControl, "applySupported")).enableSearch : !bIsAnalyticalTable || oControl.getParent().getTableDefinition().enableAnalyticsSearch;
      if (mConditions && (!bIsFilterBarEntityType || bIsAnalyticalTable || bIsChart)) {
        // We don't need to calculate the difference on property Level if entity sets are identical
        const aTargetProperties = bIsFilterBarEntityType ? [] : oFilterBar.getControlDelegate().fetchPropertiesForEntity(sTargetEntityTypePath, oMetaModel, oFilterBar),
          mTargetProperties = aTargetProperties.reduce(function (mProp, oProp) {
            mProp[oProp.name] = oProp;
            return mProp;
          }, {}),
          mTableAggregates = !bIsChart && oControl.getParent().getTableDefinition().aggregates || {},
          mAggregatedProperties = {};
        Object.keys(mTableAggregates).forEach(function (sAggregateName) {
          const oAggregate = mTableAggregates[sAggregateName];
          mAggregatedProperties[oAggregate.relativePath] = oAggregate;
        });
        const chartEntityTypeAnnotations = oControl.getModel().getMetaModel().getObject(oControl.data("targetCollectionPath") + "/");
        if (oControl.isA("sap.ui.mdc.Chart")) {
          const oEntitySetAnnotations = oControl.getModel().getMetaModel().getObject(`${oControl.data("targetCollectionPath")}@`),
            mChartCustomAggregates = MetaModelUtil.getAllCustomAggregates(oEntitySetAnnotations);
          Object.keys(mChartCustomAggregates).forEach(function (sAggregateName) {
            if (!mAggregatedProperties[sAggregateName]) {
              const oAggregate = mChartCustomAggregates[sAggregateName];
              mAggregatedProperties[sAggregateName] = oAggregate;
            }
          });
        }
        for (const sProperty in mConditions) {
          // Need to check the length of mConditions[sProperty] since previous filtered properties are kept into mConditions with empty array as definition
          const aConditionProperty = mConditions[sProperty];
          let typeCheck = true;
          if (chartEntityTypeAnnotations[sProperty] && oFilterBarEntitySetAnnotations[sProperty]) {
            typeCheck = chartEntityTypeAnnotations[sProperty]["$Type"] === oFilterBarEntitySetAnnotations[sProperty]["$Type"];
          }
          if (Array.isArray(aConditionProperty) && aConditionProperty.length > 0 && ((!mTargetProperties[sProperty] || mTargetProperties[sProperty] && !typeCheck) && (!bIsFilterBarEntityType || sProperty === "$editState" && bIsChart) || mAggregatedProperties[sProperty])) {
            aNotApplicable.push(sProperty.replace(/\+|\*/g, ""));
          }
        }
      }
      if (!bEnableSearch && oFilterBar.getSearch()) {
        aNotApplicable.push("$search");
      }
      return aNotApplicable;
    },
    /**
     * Gets the value list information of a property as defined for a given filter bar.
     *
     * @param filterBar The filter bar to get the value list information for
     * @param propertyName The property to get the value list information for
     * @returns The value list information
     */
    async _getValueListInfo(filterBar, propertyName) {
      var _filterBar$getModel;
      const metaModel = (_filterBar$getModel = filterBar.getModel()) === null || _filterBar$getModel === void 0 ? void 0 : _filterBar$getModel.getMetaModel();
      if (!metaModel) {
        return undefined;
      }
      const entityType = filterBar.data("entityType") ?? "";
      const valueListInfos = await metaModel.requestValueListInfo(entityType + propertyName, true, undefined).catch(() => null);
      return valueListInfos === null || valueListInfos === void 0 ? void 0 : valueListInfos[""];
    },
    /**
     * Gets the {@link ConditionValidated} state for a single value. This decides whether the value is treated as a selected value
     * in a value help, meaning that its description is loaded and displayed if existing, or whether it is displayed as a
     * condition (e.g. "=1").
     *
     * Values for properties without value list info are always treated as {@link ConditionValidated.NotValidated}.
     *
     * @param valueListInfo The value list info from the {@link MetaModel}
     * @param conditionPath Path to the property to set the value as condition for
     * @param value The single value to get the state for
     */
    _getConditionValidated: async function (valueListInfo, conditionPath, value) {
      if (!valueListInfo) {
        return ConditionValidated.NotValidated;
      }
      const filter = new Filter({
        path: conditionPath,
        operator: FilterOperator.EQ,
        value1: value
      });
      const listBinding = valueListInfo.$model.bindList(`/${valueListInfo.CollectionPath}`, undefined, undefined, filter, {
        $select: conditionPath
      });
      const valueExists = (await listBinding.requestContexts()).length > 0;
      if (valueExists) {
        return ConditionValidated.Validated;
      } else {
        return ConditionValidated.NotValidated;
      }
    },
    /**
     * Clears all input values of visible filter fields in the filter bar.
     *
     * @param oFilterBar The filter bar that contains the filter field
     */
    clearFilterValues: async function (oFilterBar) {
      var _state$filter$editSta;
      // Do nothing when the filter bar is hidden
      if (!oFilterBar) {
        return;
      }
      const state = await StateUtil.retrieveExternalState(oFilterBar);
      const editStatePath = "$editState";
      const editStateDefaultValue = EDITSTATE.ALL.id;
      const currentEditStateCondition = deepClone((_state$filter$editSta = state.filter[editStatePath]) === null || _state$filter$editSta === void 0 ? void 0 : _state$filter$editSta[0]);
      const currentEditStateIsDefault = (currentEditStateCondition === null || currentEditStateCondition === void 0 ? void 0 : currentEditStateCondition.values[0]) === editStateDefaultValue;

      // Clear all conditions
      for (const conditionPath of Object.keys(state.filter)) {
        if (conditionPath === editStatePath && currentEditStateIsDefault) {
          // Do not clear edit state condition if it is already "ALL"
          continue;
        }
        for (const condition of state.filter[conditionPath]) {
          condition.filtered = false;
        }
      }
      await StateUtil.applyExternalState(oFilterBar, {
        filter: state.filter
      });

      // Set edit state to 'ALL' if it wasn't before
      if (currentEditStateCondition && !currentEditStateIsDefault) {
        currentEditStateCondition.values = [editStateDefaultValue];
        await StateUtil.applyExternalState(oFilterBar, {
          filter: {
            [editStatePath]: [currentEditStateCondition]
          }
        });
      }

      // Allow app developers to update filters after clearing
      oFilterBar.getParent().fireAfterClear();
    },
    /**
     * Clear the filter value for a specific property in the filter bar.
     * This is a prerequisite before new values can be set cleanly.
     *
     * @param filterBar The filter bar that contains the filter field
     * @param conditionPath The path to the property as a condition path
     */
    async _clearFilterValue(filterBar, conditionPath) {
      const oState = await StateUtil.retrieveExternalState(filterBar);
      if (oState.filter[conditionPath]) {
        oState.filter[conditionPath].forEach(oCondition => {
          oCondition.filtered = false;
        });
        await StateUtil.applyExternalState(filterBar, {
          filter: {
            [conditionPath]: oState.filter[conditionPath]
          }
        });
      }
    },
    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param oFilterBar The filter bar that contains the filter field
     * @param sConditionPath The path to the property as a condition path
     * @param args List of optional parameters
     *  [sOperator] The operator to be used - if not set, the default operator (EQ) will be used
     *  [vValues] The values to be applied - if sOperator is missing, vValues is used as 3rd parameter
     */
    setFilterValues: async function (oFilterBar, sConditionPath) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }
      let sOperator = args === null || args === void 0 ? void 0 : args[0];
      let vValues = args === null || args === void 0 ? void 0 : args[1];

      // Do nothing when the filter bar is hidden
      if (!oFilterBar) {
        return;
      }

      // common filter Operators need a value. Do nothing if this value is undefined
      // BCP: 2270135274
      if (args.length === 2 && (vValues === undefined || vValues === null || vValues === "") && sOperator && Object.keys(FilterOperator).indexOf(sOperator) !== -1) {
        Log.warning(`An empty filter value cannot be applied with the ${sOperator} operator`);
        return;
      }

      // The 4th parameter is optional; if sOperator is missing, vValues is used as 3rd parameter
      // This does not apply for semantic dates, as these do not require vValues (exception: "LASTDAYS", 3)
      if (vValues === undefined && !SemanticDateOperators.getSemanticDateOperations().includes(sOperator || "")) {
        vValues = sOperator ?? [];
        sOperator = undefined;
      }

      // If sOperator is not set, use EQ as default
      if (!sOperator) {
        sOperator = FilterOperator.EQ;
      }

      // Supported array types:
      //  - Single Values:	"2" | ["2"]
      //  - Multiple Values:	["2", "3"]
      //  - Ranges:			["2","3"]
      // Unsupported array types:
      //  - Multiple Ranges:	[["2","3"]] | [["2","3"],["4","5"]]
      const supportedValueTypes = ["string", "number", "boolean"];
      if (vValues !== undefined && (!Array.isArray(vValues) && !supportedValueTypes.includes(typeof vValues) || Array.isArray(vValues) && vValues.length > 0 && !supportedValueTypes.includes(typeof vValues[0]))) {
        throw new Error("FilterUtils.js#_setFilterValues: Filter value not supported; only primitive values or an array thereof can be used.");
      }
      let values;
      if (vValues !== undefined) {
        values = Array.isArray(vValues) ? vValues : [vValues];
      }

      // Get the value list info of the property to later check whether the values exist
      const valueListInfo = await this._getValueListInfo(oFilterBar, sConditionPath);
      const filter = {};
      if (sConditionPath) {
        if (values && values.length) {
          if (sOperator === FilterOperator.BT) {
            // The operator BT requires one condition with both thresholds
            filter[sConditionPath] = [Condition.createCondition(sOperator, values, null, null, ConditionValidated.NotValidated)];
          } else {
            // Regular single and multi value conditions, if there are no values, we do not want any conditions
            filter[sConditionPath] = await Promise.all(values.map(async value => {
              // For the EQ case, tell MDC to validate the value (e.g. display the description), if it exists in the associated entity, otherwise never validate
              const conditionValidatedStatus = sOperator === FilterOperator.EQ ? await this._getConditionValidated(valueListInfo, sConditionPath, value) : ConditionValidated.NotValidated;
              return Condition.createCondition(sOperator, [value], null, null, conditionValidatedStatus);
            }));
          }
        } else if (SemanticDateOperators.getSemanticDateOperations().includes(sOperator || "")) {
          // vValues is undefined, so the operator is a semantic date that does not need values (see above)
          filter[sConditionPath] = [Condition.createCondition(sOperator, [], null, null, ConditionValidated.NotValidated)];
        }
      }

      // Always clear the current value as we do not want to add filter values but replace them
      await this._clearFilterValue(oFilterBar, sConditionPath);
      if (filter[sConditionPath]) {
        // This is not called in the reset case, i.e. setFilterValue("Property")
        await StateUtil.applyExternalState(oFilterBar, {
          filter
        });
      }
    },
    conditionToModelPath: function (sConditionPath) {
      // make the path usable as model property, therefore slashes become backslashes
      return sConditionPath.replace(/\//g, "\\");
    },
    _getFilterMetaModel: function (oFilterControl, metaModel) {
      return metaModel || oFilterControl.getModel().getMetaModel();
    },
    _getEntitySetPath: function (sEntityTypePath) {
      return sEntityTypePath && ModelHelper.getEntitySetPath(sEntityTypePath);
    },
    _getFieldsForTable: function (oFilterControl, sEntityTypePath) {
      const lrTables = [];
      /**
       * Gets fields from
       * 	- direct entity properties,
       * 	- navigateProperties key in the manifest if these properties are known by the entity
       *  - annotation "SelectionFields"
       */
      if (sEntityTypePath) {
        const oView = CommonUtils.getTargetView(oFilterControl);
        const tableControls = oView && oView.getController() && oView.getController()._getControls && oView.getController()._getControls("table"); //[0].getParent().getTableDefinition();
        if (tableControls) {
          tableControls.forEach(function (oTable) {
            lrTables.push(oTable.getParent().getTableDefinition());
          });
        }
        return lrTables;
      }
      return [];
    },
    _getSelectionFields: function (oFilterControl, sEntityTypePath, sFilterEntityTypePath, contextPath, lrTables, oMetaModel, oConverterContext, includeHidden, oModifier, lineItemTerm) {
      let aSelectionFields = FilterBarConverter.getSelectionFields(oConverterContext, lrTables, undefined, includeHidden, lineItemTerm).selectionFields;
      if ((oModifier ? oModifier.getControlType(oFilterControl) === "sap.ui.mdc.FilterBar" : oFilterControl.isA("sap.ui.mdc.FilterBar")) && sEntityTypePath !== sFilterEntityTypePath) {
        /**
         * We are on multi entity sets scenario so we add annotation "SelectionFields"
         * from FilterBar entity if these properties are known by the entity
         */
        const oVisualizationObjectPath = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.createBindingContext(contextPath));
        const oPageContext = oConverterContext.getConverterContextFor(sFilterEntityTypePath);
        const aFilterBarSelectionFieldsAnnotation = oPageContext.getEntityTypeAnnotation("@com.sap.vocabularies.UI.v1.SelectionFields").annotation || [];
        const mapSelectionFields = {};
        aSelectionFields.forEach(function (oSelectionField) {
          mapSelectionFields[oSelectionField.conditionPath] = true;
        });
        aFilterBarSelectionFieldsAnnotation.forEach(function (oFilterBarSelectionFieldAnnotation) {
          const sPath = oFilterBarSelectionFieldAnnotation.value;
          if (!mapSelectionFields[sPath]) {
            const oFilterField = FilterBarConverter.getFilterField(sPath, oConverterContext, oVisualizationObjectPath.startingEntitySet.entityType);
            if (oFilterField) {
              aSelectionFields.push(oFilterField);
            }
          }
        });
      }
      if (aSelectionFields) {
        const fieldNames = [];
        aSelectionFields.forEach(function (oField) {
          fieldNames.push(oField.key);
        });
        aSelectionFields = this._getSelectionFieldsFromPropertyInfos(oFilterControl, fieldNames, aSelectionFields);
      }
      return aSelectionFields;
    },
    _getSelectionFieldsFromPropertyInfos: function (oFilterControl, fieldNames, aSelectionFields) {
      const propertyInfoFields = oFilterControl.getPropertyInfo && oFilterControl.getPropertyInfo() || [];
      propertyInfoFields.forEach(function (oProp) {
        if (oProp.name === "$search" || oProp.name === "$editState") {
          return;
        }
        const selField = aSelectionFields[fieldNames.indexOf(oProp.key)];
        if (fieldNames.indexOf(oProp.key) !== -1 && selField.annotationPath) {
          oProp.group = selField.group;
          oProp.groupLabel = selField.groupLabel;
          oProp.settings = selField.settings;
          oProp.visualFilter = selField.visualFilter;
          oProp.label = selField.label;
          aSelectionFields[fieldNames.indexOf(oProp.key)] = oProp;
        }
        if (fieldNames.indexOf(oProp.key) === -1 && !oProp.annotationPath) {
          aSelectionFields.push(oProp);
        }
      });
      return aSelectionFields;
    },
    _getSearchField: function (oIFilter, aIgnoreProperties) {
      return oIFilter.getSearch && aIgnoreProperties.indexOf("search") === -1 ? oIFilter.getSearch() : null;
    },
    _getFilterConditions: function (mProperties, mFilterConditions, oIFilter) {
      const mConditions = mFilterConditions || oIFilter.getConditions();
      if (mProperties && mProperties.targetControl && mProperties.targetControl.isA("sap.ui.mdc.Chart")) {
        Object.keys(mConditions).forEach(function (sKey) {
          if (sKey === "$editState") {
            delete mConditions["$editState"];
          }
        });
      }
      return mConditions;
    },
    _getFilterPropertiesMetadata: function (aFilterPropertiesMetadata, oIFilter) {
      if (!(aFilterPropertiesMetadata && aFilterPropertiesMetadata.length)) {
        if (oIFilter.getPropertyInfo) {
          aFilterPropertiesMetadata = oIFilter.getPropertyInfo();
        } else {
          aFilterPropertiesMetadata = null;
        }
      }
      return aFilterPropertiesMetadata;
    },
    _getIgnoredProperties: function (aFilterPropertiesMetadata, mEntityProperties) {
      const aIgnoreProperties = [];
      aFilterPropertiesMetadata.forEach(function (oIFilterProperty) {
        const sIFilterPropertyName = oIFilterProperty.name;
        const mEntityPropertiesCurrent = mEntityProperties[sIFilterPropertyName];
        if (mEntityPropertiesCurrent && (!mEntityPropertiesCurrent["hasProperty"] || mEntityPropertiesCurrent["hasProperty"] && oIFilterProperty.dataType !== mEntityPropertiesCurrent.dataType)) {
          aIgnoreProperties.push(sIFilterPropertyName);
        }
      });
      return aIgnoreProperties;
    },
    getFilters: function (filterBar) {
      const {
        filters,
        search
      } = this.getFilterInfo(filterBar);
      return {
        filters,
        search
      };
    }
  };
  return oFilterUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvRmlsdGVyVXRpbHMiLCJnZXRGaWx0ZXIiLCJ2SUZpbHRlciIsImFGaWx0ZXJzIiwiZ2V0RmlsdGVySW5mbyIsImZpbHRlcnMiLCJsZW5ndGgiLCJGaWx0ZXIiLCJ1bmRlZmluZWQiLCJnZXRGaWx0ZXJGaWVsZCIsInByb3BlcnR5UGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJlbnRpdHlUeXBlIiwiRmlsdGVyQmFyQ29udmVydGVyIiwiYnVpbGRQcm9wZXJ5SW5mbyIsInByb3BlcnR5SW5mb0ZpZWxkIiwib1Byb3BlcnR5SW5mbyIsImFUeXBlQ29uZmlnIiwicHJvcGVydHlDb252ZXJ0eUNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yIiwiYW5ub3RhdGlvblBhdGgiLCJwcm9wZXJ0eVRhcmdldE9iamVjdCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJ0YXJnZXRPYmplY3QiLCJvVHlwZUNvbmZpZyIsImZldGNoVHlwZUNvbmZpZyIsImZldGNoUHJvcGVydHlJbmZvIiwia2V5IiwiYXNzaWduRGF0YVR5cGVUb1Byb3BlcnR5SW5mbyIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHQiLCJvRmlsdGVyQ29udHJvbCIsInNFbnRpdHlUeXBlUGF0aCIsIm1ldGFNb2RlbCIsImFwcENvbXBvbmVudCIsInNGaWx0ZXJFbnRpdHlUeXBlUGF0aCIsIkRlbGVnYXRlVXRpbCIsImdldEN1c3RvbURhdGEiLCJjb250ZXh0UGF0aCIsIm9WaWV3IiwiaXNBIiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwibWFuaWZlc3RTZXR0aW5ncyIsImdldFZpZXdEYXRhIiwiQ29udmVydGVyQ29udGV4dCIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyIsInN0YXJ0aW5nRW50aXR5U2V0IiwibmFtZSIsImdldERpYWdub3N0aWNzIiwibWVyZ2UiLCJjb250ZXh0TG9jYXRpb24iLCJnZXRDb252ZXJ0ZWRGaWx0ZXJGaWVsZHMiLCJpbmNsdWRlSGlkZGVuIiwib01vZGlmaWVyIiwibGluZUl0ZW1UZXJtIiwiX2dldEZpbHRlck1ldGFNb2RlbCIsImxyVGFibGVzIiwiX2dldEZpZWxkc0ZvclRhYmxlIiwib0NvbnZlcnRlckNvbnRleHQiLCJfZ2V0U2VsZWN0aW9uRmllbGRzIiwiZ2V0QmluZGluZ1BhdGhGb3JQYXJhbWV0ZXJzIiwib0lGaWx0ZXIiLCJtQ29uZGl0aW9ucyIsImFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGEiLCJhUGFyYW1ldGVycyIsImFQYXJhbXMiLCJzZXRUeXBlQ29uZmlnVG9Qcm9wZXJ0aWVzIiwiaSIsInNGaWVsZFBhdGgiLCJvQ29uZGl0aW9uSW50ZXJuYWwiLCJvUHJvcGVydHkiLCJGaWx0ZXJVdGlsIiwiZ2V0UHJvcGVydHlCeUtleSIsInR5cGVDb25maWciLCJUeXBlVXRpbCIsImdldFR5cGVDb25maWciLCJkYXRhVHlwZSIsImZvcm1hdE9wdGlvbnMiLCJjb25zdHJhaW50cyIsIm1JbnRlcm5hbFBhcmFtZXRlckNvbmRpdGlvbiIsIkNvbmRpdGlvbkNvbnZlcnRlciIsInRvVHlwZSIsImdldFR5cGVVdGlsIiwic0VkbVR5cGUiLCJPREFUQV9UWVBFX01BUFBJTkciLCJjbGFzc05hbWUiLCJwdXNoIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiT0RhdGFVdGlscyIsImZvcm1hdExpdGVyYWwiLCJ2YWx1ZXMiLCJkYXRhIiwic0VudGl0eVNldFBhdGgiLCJzdWJzdHJpbmciLCJzUGFyYW1ldGVyRW50aXR5U2V0Iiwic2xpY2UiLCJsYXN0SW5kZXhPZiIsInNUYXJnZXROYXZpZ2F0aW9uIiwidG9TdHJpbmciLCJnZXRFZGl0U3RhdGVJc0hpZGVEcmFmdCIsImJJc0hpZGVEcmFmdCIsIiRlZGl0U3RhdGUiLCJvQ29uZGl0aW9uIiwiZmluZCIsImNvbmRpdGlvbiIsIm9wZXJhdG9yIiwiaW5jbHVkZXMiLCJtUHJvcGVydGllcyIsIm1GaWx0ZXJDb25kaXRpb25zIiwiYUlnbm9yZVByb3BlcnRpZXMiLCJpZ25vcmVkUHJvcGVydGllcyIsIm9UYXJnZXRDb250cm9sIiwidGFyZ2V0Q29udHJvbCIsInNUYXJnZXRFbnRpdHlQYXRoIiwic1NlYXJjaCIsInNCaW5kaW5nUGF0aCIsImFQcm9wZXJ0aWVzTWV0YWRhdGEiLCJwcm9wZXJ0aWVzTWV0YWRhdGEiLCJDb3JlIiwiYnlJZCIsIl9nZXRTZWFyY2hGaWVsZCIsIl9nZXRGaWx0ZXJDb25kaXRpb25zIiwiZ2V0UHJvcGVydHlJbmZvU2V0IiwiX2dldEZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwic0tleSIsIkpTT04iLCJwYXJzZSIsImFUYXJnZXRQcm9wZXJ0aWVzTWV0YWRhdGEiLCJnZXRDb250cm9sRGVsZWdhdGUiLCJmZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkiLCJtRW50aXR5UHJvcGVydGllcyIsIm9FbnRpdHlQcm9wZXJ0eSIsImhhc1Byb3BlcnR5IiwiX2FJZ25vcmVQcm9wZXJ0aWVzIiwiX2dldElnbm9yZWRQcm9wZXJ0aWVzIiwiY29uY2F0Iiwib0ZpbHRlciIsInNlYXJjaCIsImJpbmRpbmdQYXRoIiwiYVByb3BlcnRpZXMiLCJvSUZpbHRlclByb3BlcnR5IiwidHlwZUluc3RhbmNlIiwiZ2V0Q29uc3RyYWludHMiLCJGdW5jdGlvbiIsInBhdGgiLCJnZXROb3RBcHBsaWNhYmxlRmlsdGVycyIsIm9GaWx0ZXJCYXIiLCJvQ29udHJvbCIsInNUYXJnZXRFbnRpdHlUeXBlUGF0aCIsIm9GaWx0ZXJCYXJFbnRpdHlQYXRoIiwib0ZpbHRlckJhckVudGl0eVNldEFubm90YXRpb25zIiwiZ2V0T2JqZWN0IiwiYU5vdEFwcGxpY2FibGUiLCJnZXRDb25kaXRpb25zIiwiYklzRmlsdGVyQmFyRW50aXR5VHlwZSIsImJJc0NoYXJ0IiwiYklzQW5hbHl0aWNhbFRhYmxlIiwiZ2V0UGFyZW50IiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiZW5hYmxlQW5hbHl0aWNzIiwiYkVuYWJsZVNlYXJjaCIsIkNvbW1vbkhlbHBlciIsInBhcnNlQ3VzdG9tRGF0YSIsImVuYWJsZVNlYXJjaCIsImVuYWJsZUFuYWx5dGljc1NlYXJjaCIsImFUYXJnZXRQcm9wZXJ0aWVzIiwibVRhcmdldFByb3BlcnRpZXMiLCJyZWR1Y2UiLCJtUHJvcCIsIm9Qcm9wIiwibVRhYmxlQWdncmVnYXRlcyIsImFnZ3JlZ2F0ZXMiLCJtQWdncmVnYXRlZFByb3BlcnRpZXMiLCJzQWdncmVnYXRlTmFtZSIsIm9BZ2dyZWdhdGUiLCJyZWxhdGl2ZVBhdGgiLCJjaGFydEVudGl0eVR5cGVBbm5vdGF0aW9ucyIsIm9FbnRpdHlTZXRBbm5vdGF0aW9ucyIsIm1DaGFydEN1c3RvbUFnZ3JlZ2F0ZXMiLCJNZXRhTW9kZWxVdGlsIiwiZ2V0QWxsQ3VzdG9tQWdncmVnYXRlcyIsInNQcm9wZXJ0eSIsImFDb25kaXRpb25Qcm9wZXJ0eSIsInR5cGVDaGVjayIsIkFycmF5IiwiaXNBcnJheSIsInJlcGxhY2UiLCJnZXRTZWFyY2giLCJfZ2V0VmFsdWVMaXN0SW5mbyIsImZpbHRlckJhciIsInByb3BlcnR5TmFtZSIsInZhbHVlTGlzdEluZm9zIiwicmVxdWVzdFZhbHVlTGlzdEluZm8iLCJjYXRjaCIsIl9nZXRDb25kaXRpb25WYWxpZGF0ZWQiLCJ2YWx1ZUxpc3RJbmZvIiwiY29uZGl0aW9uUGF0aCIsInZhbHVlIiwiQ29uZGl0aW9uVmFsaWRhdGVkIiwiTm90VmFsaWRhdGVkIiwiZmlsdGVyIiwiRmlsdGVyT3BlcmF0b3IiLCJFUSIsInZhbHVlMSIsImxpc3RCaW5kaW5nIiwiJG1vZGVsIiwiYmluZExpc3QiLCJDb2xsZWN0aW9uUGF0aCIsIiRzZWxlY3QiLCJ2YWx1ZUV4aXN0cyIsInJlcXVlc3RDb250ZXh0cyIsIlZhbGlkYXRlZCIsImNsZWFyRmlsdGVyVmFsdWVzIiwic3RhdGUiLCJTdGF0ZVV0aWwiLCJyZXRyaWV2ZUV4dGVybmFsU3RhdGUiLCJlZGl0U3RhdGVQYXRoIiwiZWRpdFN0YXRlRGVmYXVsdFZhbHVlIiwiRURJVFNUQVRFIiwiQUxMIiwiaWQiLCJjdXJyZW50RWRpdFN0YXRlQ29uZGl0aW9uIiwiZGVlcENsb25lIiwiY3VycmVudEVkaXRTdGF0ZUlzRGVmYXVsdCIsImZpbHRlcmVkIiwiYXBwbHlFeHRlcm5hbFN0YXRlIiwiZmlyZUFmdGVyQ2xlYXIiLCJfY2xlYXJGaWx0ZXJWYWx1ZSIsIm9TdGF0ZSIsInNldEZpbHRlclZhbHVlcyIsInNDb25kaXRpb25QYXRoIiwiYXJncyIsInNPcGVyYXRvciIsInZWYWx1ZXMiLCJpbmRleE9mIiwiTG9nIiwid2FybmluZyIsIlNlbWFudGljRGF0ZU9wZXJhdG9ycyIsImdldFNlbWFudGljRGF0ZU9wZXJhdGlvbnMiLCJzdXBwb3J0ZWRWYWx1ZVR5cGVzIiwiRXJyb3IiLCJCVCIsIkNvbmRpdGlvbiIsImNyZWF0ZUNvbmRpdGlvbiIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJjb25kaXRpb25WYWxpZGF0ZWRTdGF0dXMiLCJjb25kaXRpb25Ub01vZGVsUGF0aCIsIl9nZXRFbnRpdHlTZXRQYXRoIiwiTW9kZWxIZWxwZXIiLCJnZXRFbnRpdHlTZXRQYXRoIiwidGFibGVDb250cm9scyIsImdldENvbnRyb2xsZXIiLCJfZ2V0Q29udHJvbHMiLCJvVGFibGUiLCJhU2VsZWN0aW9uRmllbGRzIiwiZ2V0U2VsZWN0aW9uRmllbGRzIiwic2VsZWN0aW9uRmllbGRzIiwiZ2V0Q29udHJvbFR5cGUiLCJvUGFnZUNvbnRleHQiLCJhRmlsdGVyQmFyU2VsZWN0aW9uRmllbGRzQW5ub3RhdGlvbiIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwiYW5ub3RhdGlvbiIsIm1hcFNlbGVjdGlvbkZpZWxkcyIsIm9TZWxlY3Rpb25GaWVsZCIsIm9GaWx0ZXJCYXJTZWxlY3Rpb25GaWVsZEFubm90YXRpb24iLCJzUGF0aCIsIm9GaWx0ZXJGaWVsZCIsImZpZWxkTmFtZXMiLCJvRmllbGQiLCJfZ2V0U2VsZWN0aW9uRmllbGRzRnJvbVByb3BlcnR5SW5mb3MiLCJwcm9wZXJ0eUluZm9GaWVsZHMiLCJnZXRQcm9wZXJ0eUluZm8iLCJzZWxGaWVsZCIsImdyb3VwIiwiZ3JvdXBMYWJlbCIsInNldHRpbmdzIiwidmlzdWFsRmlsdGVyIiwibGFiZWwiLCJzSUZpbHRlclByb3BlcnR5TmFtZSIsIm1FbnRpdHlQcm9wZXJ0aWVzQ3VycmVudCIsImdldEZpbHRlcnMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlclV0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudGl0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGRlZXBDbG9uZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwQ2xvbmVcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgKiBhcyBGaWx0ZXJCYXJDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXJcIjtcbmltcG9ydCBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IEJhc2VNYW5pZmVzdFNldHRpbmdzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2VtYW50aWNEYXRlT3BlcmF0b3JzIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljRGF0ZU9wZXJhdG9yc1wiO1xuaW1wb3J0IHsgT0RBVEFfVFlQRV9NQVBQSU5HIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGlzcGxheU1vZGVGb3JtYXR0ZXJcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IEVESVRTVEFURSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRHJhZnRFZGl0U3RhdGVcIjtcbmltcG9ydCBNZXRhTW9kZWxVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL09EYXRhTWV0YU1vZGVsVXRpbFwiO1xuaW1wb3J0IHsgRXh0ZXJuYWxTdGF0ZVR5cGUgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy92YWx1ZWhlbHAvVmFsdWVIZWxwRGVsZWdhdGVcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBDb25kaXRpb25Db252ZXJ0ZXIgZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvbkNvbnZlcnRlclwiO1xuaW1wb3J0IENvbmRpdGlvblZhbGlkYXRlZCBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0NvbmRpdGlvblZhbGlkYXRlZFwiO1xuaW1wb3J0IEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCBUeXBlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9vZGF0YS92NC9UeXBlVXRpbFwiO1xuaW1wb3J0IFN0YXRlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9wMTNuL1N0YXRlVXRpbFwiO1xuaW1wb3J0IEZpbHRlclV0aWwgZnJvbSBcInNhcC91aS9tZGMvdXRpbC9GaWx0ZXJVdGlsXCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgRmlsdGVyT3BlcmF0b3IgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJPcGVyYXRvclwiO1xuaW1wb3J0IE1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL01ldGFNb2RlbFwiO1xuaW1wb3J0IE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCBPRGF0YVV0aWxzIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFVdGlsc1wiO1xuXG5jb25zdCBvRmlsdGVyVXRpbHMgPSB7XG5cdGdldEZpbHRlcjogZnVuY3Rpb24gKHZJRmlsdGVyOiBhbnkpIHtcblx0XHRjb25zdCBhRmlsdGVycyA9IG9GaWx0ZXJVdGlscy5nZXRGaWx0ZXJJbmZvKHZJRmlsdGVyKS5maWx0ZXJzO1xuXHRcdHJldHVybiBhRmlsdGVycy5sZW5ndGggPyBuZXcgRmlsdGVyKG9GaWx0ZXJVdGlscy5nZXRGaWx0ZXJJbmZvKHZJRmlsdGVyKS5maWx0ZXJzLCBmYWxzZSkgOiB1bmRlZmluZWQ7XG5cdH0sXG5cdGdldEZpbHRlckZpZWxkOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBzdHJpbmcsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGU6IEVudGl0eVR5cGUpIHtcblx0XHRyZXR1cm4gRmlsdGVyQmFyQ29udmVydGVyLmdldEZpbHRlckZpZWxkKHByb3BlcnR5UGF0aCwgY29udmVydGVyQ29udGV4dCwgZW50aXR5VHlwZSk7XG5cdH0sXG5cdGJ1aWxkUHJvcGVyeUluZm86IGZ1bmN0aW9uIChwcm9wZXJ0eUluZm9GaWVsZDogYW55LCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdFx0bGV0IG9Qcm9wZXJ0eUluZm87XG5cdFx0Y29uc3QgYVR5cGVDb25maWc6IGFueSA9IHt9O1xuXHRcdGNvbnN0IHByb3BlcnR5Q29udmVydHlDb250ZXh0ID0gY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZXJDb250ZXh0Rm9yKHByb3BlcnR5SW5mb0ZpZWxkLmFubm90YXRpb25QYXRoKTtcblx0XHRjb25zdCBwcm9wZXJ0eVRhcmdldE9iamVjdCA9IHByb3BlcnR5Q29udmVydHlDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS50YXJnZXRPYmplY3Q7XG5cdFx0Y29uc3Qgb1R5cGVDb25maWcgPSBGaWx0ZXJCYXJDb252ZXJ0ZXIuZmV0Y2hUeXBlQ29uZmlnKHByb3BlcnR5VGFyZ2V0T2JqZWN0KTtcblx0XHRvUHJvcGVydHlJbmZvID0gRmlsdGVyQmFyQ29udmVydGVyLmZldGNoUHJvcGVydHlJbmZvKGNvbnZlcnRlckNvbnRleHQsIHByb3BlcnR5SW5mb0ZpZWxkLCBvVHlwZUNvbmZpZyk7XG5cdFx0YVR5cGVDb25maWdbcHJvcGVydHlJbmZvRmllbGQua2V5XSA9IG9UeXBlQ29uZmlnO1xuXHRcdG9Qcm9wZXJ0eUluZm8gPSBGaWx0ZXJCYXJDb252ZXJ0ZXIuYXNzaWduRGF0YVR5cGVUb1Byb3BlcnR5SW5mbyhvUHJvcGVydHlJbmZvLCBjb252ZXJ0ZXJDb250ZXh0LCBbXSwgYVR5cGVDb25maWcpO1xuXHRcdHJldHVybiBvUHJvcGVydHlJbmZvO1xuXHR9LFxuXHRjcmVhdGVDb252ZXJ0ZXJDb250ZXh0OiBmdW5jdGlvbiAob0ZpbHRlckNvbnRyb2w6IGFueSwgc0VudGl0eVR5cGVQYXRoOiBzdHJpbmcsIG1ldGFNb2RlbD86IE1ldGFNb2RlbCwgYXBwQ29tcG9uZW50PzogQXBwQ29tcG9uZW50KSB7XG5cdFx0Y29uc3Qgc0ZpbHRlckVudGl0eVR5cGVQYXRoID0gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob0ZpbHRlckNvbnRyb2wsIFwiZW50aXR5VHlwZVwiKSxcblx0XHRcdGNvbnRleHRQYXRoID0gc0VudGl0eVR5cGVQYXRoIHx8IHNGaWx0ZXJFbnRpdHlUeXBlUGF0aDtcblxuXHRcdGNvbnN0IG9WaWV3ID0gb0ZpbHRlckNvbnRyb2wuaXNBID8gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvRmlsdGVyQ29udHJvbCkgOiBudWxsO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBtZXRhTW9kZWwgfHwgb0ZpbHRlckNvbnRyb2wuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gYXBwQ29tcG9uZW50IHx8IChvVmlldyAmJiBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpKTtcblx0XHRjb25zdCBvVmlzdWFsaXphdGlvbk9iamVjdFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoY29udGV4dFBhdGgpKTtcblx0XHRsZXQgbWFuaWZlc3RTZXR0aW5nczogQmFzZU1hbmlmZXN0U2V0dGluZ3MgfCB1bmRlZmluZWQ7XG5cdFx0aWYgKG9GaWx0ZXJDb250cm9sLmlzQSAmJiAhb0ZpbHRlckNvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5maWx0ZXJiYXIudmguRmlsdGVyQmFyXCIpKSB7XG5cdFx0XHRtYW5pZmVzdFNldHRpbmdzID0gKChvVmlldyAmJiBvVmlldy5nZXRWaWV3RGF0YSgpKSB8fCB7fSkgYXMgQmFzZU1hbmlmZXN0U2V0dGluZ3M7XG5cdFx0fVxuXHRcdHJldHVybiBDb252ZXJ0ZXJDb250ZXh0LmNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyhcblx0XHRcdG9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdG9BcHBDb21wb25lbnQ/LmdldERpYWdub3N0aWNzKCkgYXMgYW55LFxuXHRcdFx0bWVyZ2UsXG5cdFx0XHRvVmlzdWFsaXphdGlvbk9iamVjdFBhdGguY29udGV4dExvY2F0aW9uLFxuXHRcdFx0bWFuaWZlc3RTZXR0aW5nc1xuXHRcdCk7XG5cdH0sXG5cdGdldENvbnZlcnRlZEZpbHRlckZpZWxkczogZnVuY3Rpb24gKFxuXHRcdG9GaWx0ZXJDb250cm9sOiBhbnksXG5cdFx0c0VudGl0eVR5cGVQYXRoPzogYW55LFxuXHRcdGluY2x1ZGVIaWRkZW4/OiBib29sZWFuLFxuXHRcdG1ldGFNb2RlbD86IE1ldGFNb2RlbCxcblx0XHRhcHBDb21wb25lbnQ/OiBBcHBDb21wb25lbnQsXG5cdFx0b01vZGlmaWVyPzogYW55LFxuXHRcdGxpbmVJdGVtVGVybT86IHN0cmluZ1xuXHQpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gdGhpcy5fZ2V0RmlsdGVyTWV0YU1vZGVsKG9GaWx0ZXJDb250cm9sLCBtZXRhTW9kZWwpO1xuXHRcdGNvbnN0IHNGaWx0ZXJFbnRpdHlUeXBlUGF0aCA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9GaWx0ZXJDb250cm9sLCBcImVudGl0eVR5cGVcIiksXG5cdFx0XHRjb250ZXh0UGF0aCA9IHNFbnRpdHlUeXBlUGF0aCB8fCBzRmlsdGVyRW50aXR5VHlwZVBhdGg7XG5cblx0XHRjb25zdCBsclRhYmxlczogYW55W10gPSB0aGlzLl9nZXRGaWVsZHNGb3JUYWJsZShvRmlsdGVyQ29udHJvbCwgc0VudGl0eVR5cGVQYXRoKTtcblxuXHRcdGNvbnN0IG9Db252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5jcmVhdGVDb252ZXJ0ZXJDb250ZXh0KG9GaWx0ZXJDb250cm9sLCBzRW50aXR5VHlwZVBhdGgsIG1ldGFNb2RlbCwgYXBwQ29tcG9uZW50KTtcblxuXHRcdC8vYVNlbGVjdGlvbkZpZWxkcyA9IEZpbHRlckJhckNvbnZlcnRlci5nZXRTZWxlY3Rpb25GaWVsZHMob0NvbnZlcnRlckNvbnRleHQpO1xuXHRcdHJldHVybiB0aGlzLl9nZXRTZWxlY3Rpb25GaWVsZHMoXG5cdFx0XHRvRmlsdGVyQ29udHJvbCxcblx0XHRcdHNFbnRpdHlUeXBlUGF0aCxcblx0XHRcdHNGaWx0ZXJFbnRpdHlUeXBlUGF0aCxcblx0XHRcdGNvbnRleHRQYXRoLFxuXHRcdFx0bHJUYWJsZXMsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b0NvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRpbmNsdWRlSGlkZGVuLFxuXHRcdFx0b01vZGlmaWVyLFxuXHRcdFx0bGluZUl0ZW1UZXJtXG5cdFx0KTtcblx0fSxcblxuXHRnZXRCaW5kaW5nUGF0aEZvclBhcmFtZXRlcnM6IGZ1bmN0aW9uIChvSUZpbHRlcjogYW55LCBtQ29uZGl0aW9uczogYW55LCBhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhOiBhbnksIGFQYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRjb25zdCBhUGFyYW1zOiBhbnlbXSA9IFtdO1xuXHRcdGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGEgPSBvRmlsdGVyVXRpbHMuc2V0VHlwZUNvbmZpZ1RvUHJvcGVydGllcyhhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhKTtcblx0XHQvLyBDb2xsZWN0aW5nIGFsbCBwYXJhbWV0ZXIgdmFsdWVzIGZyb20gY29uZGl0aW9uc1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVBhcmFtZXRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHNGaWVsZFBhdGggPSBhUGFyYW1ldGVyc1tpXTtcblx0XHRcdGlmIChtQ29uZGl0aW9uc1tzRmllbGRQYXRoXSAmJiBtQ29uZGl0aW9uc1tzRmllbGRQYXRoXS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdC8vIFdlIHdvdWxkIGJlIHVzaW5nIG9ubHkgdGhlIGZpcnN0IGNvbmRpdGlvbiBmb3IgcGFyYW1ldGVyIHZhbHVlLlxuXHRcdFx0XHRjb25zdCBvQ29uZGl0aW9uSW50ZXJuYWwgPSBtZXJnZSh7fSwgbUNvbmRpdGlvbnNbc0ZpZWxkUGF0aF1bMF0pIGFzIGFueTtcblx0XHRcdFx0Y29uc3Qgb1Byb3BlcnR5ID0gRmlsdGVyVXRpbC5nZXRQcm9wZXJ0eUJ5S2V5KGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGEsIHNGaWVsZFBhdGgpIGFzIGFueTtcblx0XHRcdFx0Y29uc3Qgb1R5cGVDb25maWcgPVxuXHRcdFx0XHRcdG9Qcm9wZXJ0eS50eXBlQ29uZmlnIHx8IFR5cGVVdGlsLmdldFR5cGVDb25maWcob1Byb3BlcnR5LmRhdGFUeXBlLCBvUHJvcGVydHkuZm9ybWF0T3B0aW9ucywgb1Byb3BlcnR5LmNvbnN0cmFpbnRzKTtcblx0XHRcdFx0Y29uc3QgbUludGVybmFsUGFyYW1ldGVyQ29uZGl0aW9uID0gQ29uZGl0aW9uQ29udmVydGVyLnRvVHlwZShvQ29uZGl0aW9uSW50ZXJuYWwsIG9UeXBlQ29uZmlnLCBvSUZpbHRlci5nZXRUeXBlVXRpbCgpKTtcblx0XHRcdFx0Y29uc3Qgc0VkbVR5cGUgPSBPREFUQV9UWVBFX01BUFBJTkdbb1R5cGVDb25maWcuY2xhc3NOYW1lXTtcblx0XHRcdFx0YVBhcmFtcy5wdXNoKFxuXHRcdFx0XHRcdGAke3NGaWVsZFBhdGh9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KE9EYXRhVXRpbHMuZm9ybWF0TGl0ZXJhbChtSW50ZXJuYWxQYXJhbWV0ZXJDb25kaXRpb24udmFsdWVzWzBdLCBzRWRtVHlwZSkpfWBcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBCaW5kaW5nIHBhdGggZnJvbSBFbnRpdHlUeXBlXG5cdFx0Y29uc3Qgc0VudGl0eVR5cGVQYXRoID0gb0lGaWx0ZXIuZGF0YShcImVudGl0eVR5cGVcIik7XG5cdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBzRW50aXR5VHlwZVBhdGguc3Vic3RyaW5nKDAsIHNFbnRpdHlUeXBlUGF0aC5sZW5ndGggLSAxKTtcblx0XHRjb25zdCBzUGFyYW1ldGVyRW50aXR5U2V0ID0gc0VudGl0eVNldFBhdGguc2xpY2UoMCwgc0VudGl0eVNldFBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0XHRjb25zdCBzVGFyZ2V0TmF2aWdhdGlvbiA9IHNFbnRpdHlTZXRQYXRoLnN1YnN0cmluZyhzRW50aXR5U2V0UGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKTtcblx0XHQvLyBjcmVhdGUgcGFyYW1ldGVyIGNvbnRleHRcblx0XHRyZXR1cm4gYCR7c1BhcmFtZXRlckVudGl0eVNldH0oJHthUGFyYW1zLnRvU3RyaW5nKCl9KS8ke3NUYXJnZXROYXZpZ2F0aW9ufWA7XG5cdH0sXG5cblx0Z2V0RWRpdFN0YXRlSXNIaWRlRHJhZnQ6IGZ1bmN0aW9uIChtQ29uZGl0aW9uczogYW55KSB7XG5cdFx0bGV0IGJJc0hpZGVEcmFmdCA9IGZhbHNlO1xuXHRcdGlmIChtQ29uZGl0aW9ucyAmJiBtQ29uZGl0aW9ucy4kZWRpdFN0YXRlKSB7XG5cdFx0XHRjb25zdCBvQ29uZGl0aW9uID0gbUNvbmRpdGlvbnMuJGVkaXRTdGF0ZS5maW5kKGZ1bmN0aW9uIChjb25kaXRpb246IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gY29uZGl0aW9uLm9wZXJhdG9yID09PSBcIkRSQUZUX0VESVRfU1RBVEVcIjtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKG9Db25kaXRpb24gJiYgKG9Db25kaXRpb24udmFsdWVzLmluY2x1ZGVzKFwiQUxMX0hJRElOR19EUkFGVFNcIikgfHwgb0NvbmRpdGlvbi52YWx1ZXMuaW5jbHVkZXMoXCJTQVZFRF9PTkxZXCIpKSkge1xuXHRcdFx0XHRiSXNIaWRlRHJhZnQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYklzSGlkZURyYWZ0O1xuXHR9LFxuXHQvKipcblx0ICogR2V0cyBhbGwgZmlsdGVycyB0aGF0IG9yaWdpbmF0ZSBmcm9tIHRoZSBNREMgRmlsdGVyQmFyLlxuXHQgKlxuXHQgKiBAcGFyYW0gdklGaWx0ZXIgU3RyaW5nIG9yIG9iamVjdCBpbnN0YW5jZSByZWxhdGVkIHRvXG5cdCAqICAtIE1EQ19GaWx0ZXJCYXIvVGFibGUvQ2hhcnRcblx0ICogQHBhcmFtIG1Qcm9wZXJ0aWVzIFByb3BlcnRpZXMgb24gZmlsdGVycyB0aGF0IGFyZSB0byBiZSByZXRyaWV2ZWQuIEF2YWlsYWJsZSBwYXJhbWV0ZXJzOlxuXHQgKiBcdCAtIGlnbm9yZWRQcm9wZXJ0aWVzOiBBcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyB3aGljaCBzaG91bGQgYmUgbm90IGNvbnNpZGVyZWQgZm9yIGZpbHRlcmluZ1xuXHQgKlx0IC0gcHJvcGVydGllc01ldGFkYXRhOiBBcnJheSB3aXRoIGFsbCB0aGUgcHJvcGVydHkgbWV0YWRhdGEuIElmIG5vdCBwcm92aWRlZCwgcHJvcGVydGllcyB3aWxsIGJlIHJldHJpZXZlZCBmcm9tIHZJRmlsdGVyLlxuXHQgKlx0IC0gdGFyZ2V0Q29udHJvbDogTURDX3RhYmxlIG9yIGNoYXJ0LiBJZiBwcm92aWRlZCwgcHJvcGVydHkgbmFtZXMgd2hpY2ggYXJlIG5vdCByZWxldmFudCBmb3IgdGhlIHRhcmdldCBjb250cm9sIGVudGl0eVNldCBhcmUgbm90IGNvbnNpZGVyZWQuXG5cdCAqIEBwYXJhbSBtRmlsdGVyQ29uZGl0aW9ucyBNYXAgd2l0aCBleHRlcm5hbGl6ZWQgZmlsdGVyIGNvbmRpdGlvbnMuXG5cdCAqIEByZXR1cm5zIEZpbHRlckJhciBmaWx0ZXJzIGFuZCBiYXNpYyBzZWFyY2hcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRGaWx0ZXJJbmZvOiBmdW5jdGlvbiAodklGaWx0ZXI6IHN0cmluZyB8IG9iamVjdCwgbVByb3BlcnRpZXM/OiBhbnksIG1GaWx0ZXJDb25kaXRpb25zPzogYW55KSB7XG5cdFx0bGV0IGFJZ25vcmVQcm9wZXJ0aWVzID0gKG1Qcm9wZXJ0aWVzICYmIG1Qcm9wZXJ0aWVzLmlnbm9yZWRQcm9wZXJ0aWVzKSB8fCBbXTtcblx0XHRjb25zdCBvVGFyZ2V0Q29udHJvbCA9IG1Qcm9wZXJ0aWVzICYmIG1Qcm9wZXJ0aWVzLnRhcmdldENvbnRyb2wsXG5cdFx0XHRzVGFyZ2V0RW50aXR5UGF0aCA9IG9UYXJnZXRDb250cm9sID8gb1RhcmdldENvbnRyb2wuZGF0YShcImVudGl0eVR5cGVcIikgOiB1bmRlZmluZWQ7XG5cdFx0bGV0IG9JRmlsdGVyOiBhbnkgPSB2SUZpbHRlcixcblx0XHRcdHNTZWFyY2gsXG5cdFx0XHRhRmlsdGVyczogYW55W10gPSBbXSxcblx0XHRcdHNCaW5kaW5nUGF0aCxcblx0XHRcdGFQcm9wZXJ0aWVzTWV0YWRhdGEgPSBtUHJvcGVydGllcyAmJiBtUHJvcGVydGllcy5wcm9wZXJ0aWVzTWV0YWRhdGE7XG5cdFx0aWYgKHR5cGVvZiB2SUZpbHRlciA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0b0lGaWx0ZXIgPSBDb3JlLmJ5SWQodklGaWx0ZXIpIGFzIGFueTtcblx0XHR9XG5cdFx0aWYgKG9JRmlsdGVyKSB7XG5cdFx0XHRzU2VhcmNoID0gdGhpcy5fZ2V0U2VhcmNoRmllbGQob0lGaWx0ZXIsIGFJZ25vcmVQcm9wZXJ0aWVzKTtcblx0XHRcdGNvbnN0IG1Db25kaXRpb25zID0gdGhpcy5fZ2V0RmlsdGVyQ29uZGl0aW9ucyhtUHJvcGVydGllcywgbUZpbHRlckNvbmRpdGlvbnMsIG9JRmlsdGVyKTtcblx0XHRcdGxldCBhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhID0gb0lGaWx0ZXIuZ2V0UHJvcGVydHlJbmZvU2V0ID8gb0lGaWx0ZXIuZ2V0UHJvcGVydHlJbmZvU2V0KCkgOiBudWxsO1xuXHRcdFx0YUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSA9IHRoaXMuX2dldEZpbHRlclByb3BlcnRpZXNNZXRhZGF0YShhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhLCBvSUZpbHRlcik7XG5cdFx0XHRpZiAobVByb3BlcnRpZXMgJiYgbVByb3BlcnRpZXMudGFyZ2V0Q29udHJvbCAmJiBtUHJvcGVydGllcy50YXJnZXRDb250cm9sLmlzQShcInNhcC51aS5tZGMuQ2hhcnRcIikpIHtcblx0XHRcdFx0T2JqZWN0LmtleXMobUNvbmRpdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0XHRcdGlmIChzS2V5ID09PSBcIiRlZGl0U3RhdGVcIikge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG1Db25kaXRpb25zW1wiJGVkaXRTdGF0ZVwiXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0bGV0IGFQYXJhbWV0ZXJzID0gb0lGaWx0ZXIuZGF0YShcInBhcmFtZXRlcnNcIikgfHwgW107XG5cdFx0XHRhUGFyYW1ldGVycyA9IHR5cGVvZiBhUGFyYW1ldGVycyA9PT0gXCJzdHJpbmdcIiA/IEpTT04ucGFyc2UoYVBhcmFtZXRlcnMpIDogYVBhcmFtZXRlcnM7XG5cdFx0XHRpZiAoYVBhcmFtZXRlcnMgJiYgYVBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHQvLyBCaW5kaW5nIHBhdGggY2hhbmdlcyBpbiBjYXNlIG9mIHBhcmFtZXRlcnMuXG5cdFx0XHRcdHNCaW5kaW5nUGF0aCA9IG9GaWx0ZXJVdGlscy5nZXRCaW5kaW5nUGF0aEZvclBhcmFtZXRlcnMob0lGaWx0ZXIsIG1Db25kaXRpb25zLCBhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhLCBhUGFyYW1ldGVycyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAobUNvbmRpdGlvbnMpIHtcblx0XHRcdFx0Ly9FeGNsdWRlIEludGVyZmFjZSBGaWx0ZXIgcHJvcGVydGllcyB0aGF0IGFyZSBub3QgcmVsZXZhbnQgZm9yIHRoZSBUYXJnZXQgY29udHJvbCBlbnRpdHlTZXRcblx0XHRcdFx0aWYgKHNUYXJnZXRFbnRpdHlQYXRoICYmIG9JRmlsdGVyLmRhdGEoXCJlbnRpdHlUeXBlXCIpICE9PSBzVGFyZ2V0RW50aXR5UGF0aCkge1xuXHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvSUZpbHRlci5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRcdGNvbnN0IGFUYXJnZXRQcm9wZXJ0aWVzTWV0YWRhdGEgPSBvSUZpbHRlclxuXHRcdFx0XHRcdFx0LmdldENvbnRyb2xEZWxlZ2F0ZSgpXG5cdFx0XHRcdFx0XHQuZmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5KHNUYXJnZXRFbnRpdHlQYXRoLCBvTWV0YU1vZGVsLCBvSUZpbHRlcik7XG5cdFx0XHRcdFx0YVByb3BlcnRpZXNNZXRhZGF0YSA9IGFUYXJnZXRQcm9wZXJ0aWVzTWV0YWRhdGE7XG5cblx0XHRcdFx0XHRjb25zdCBtRW50aXR5UHJvcGVydGllczogYW55ID0ge307XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFUYXJnZXRQcm9wZXJ0aWVzTWV0YWRhdGEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9FbnRpdHlQcm9wZXJ0eSA9IGFUYXJnZXRQcm9wZXJ0aWVzTWV0YWRhdGFbaV07XG5cdFx0XHRcdFx0XHRtRW50aXR5UHJvcGVydGllc1tvRW50aXR5UHJvcGVydHkubmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRcdGhhc1Byb3BlcnR5OiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRkYXRhVHlwZTogb0VudGl0eVByb3BlcnR5LmRhdGFUeXBlXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBfYUlnbm9yZVByb3BlcnRpZXM6IGFueSA9IHRoaXMuX2dldElnbm9yZWRQcm9wZXJ0aWVzKGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGEsIG1FbnRpdHlQcm9wZXJ0aWVzKTtcblx0XHRcdFx0XHRpZiAoX2FJZ25vcmVQcm9wZXJ0aWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGFJZ25vcmVQcm9wZXJ0aWVzID0gYUlnbm9yZVByb3BlcnRpZXMuY29uY2F0KF9hSWdub3JlUHJvcGVydGllcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKCFhUHJvcGVydGllc01ldGFkYXRhKSB7XG5cdFx0XHRcdFx0YVByb3BlcnRpZXNNZXRhZGF0YSA9IGFGaWx0ZXJQcm9wZXJ0aWVzTWV0YWRhdGE7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gdmFyIGFQYXJhbUtleXMgPSBbXTtcblx0XHRcdFx0Ly8gYVBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob1BhcmFtKSB7XG5cdFx0XHRcdC8vIFx0YVBhcmFtS2V5cy5wdXNoKG9QYXJhbS5rZXkpO1xuXHRcdFx0XHQvLyB9KTtcblx0XHRcdFx0Y29uc3Qgb0ZpbHRlciA9IChcblx0XHRcdFx0XHRGaWx0ZXJVdGlsLmdldEZpbHRlckluZm8oXG5cdFx0XHRcdFx0XHRvSUZpbHRlcixcblx0XHRcdFx0XHRcdG1Db25kaXRpb25zLFxuXHRcdFx0XHRcdFx0b0ZpbHRlclV0aWxzLnNldFR5cGVDb25maWdUb1Byb3BlcnRpZXMoYVByb3BlcnRpZXNNZXRhZGF0YSksXG5cdFx0XHRcdFx0XHRhSWdub3JlUHJvcGVydGllcy5jb25jYXQoYVBhcmFtZXRlcnMpXG5cdFx0XHRcdFx0KSBhcyBhbnlcblx0XHRcdFx0KS5maWx0ZXJzO1xuXHRcdFx0XHRhRmlsdGVycyA9IG9GaWx0ZXIgPyBbb0ZpbHRlcl0gOiBbXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHsgZmlsdGVyczogYUZpbHRlcnMsIHNlYXJjaDogc1NlYXJjaCB8fCB1bmRlZmluZWQsIGJpbmRpbmdQYXRoOiBzQmluZGluZ1BhdGggfTtcblx0fSxcblx0c2V0VHlwZUNvbmZpZ1RvUHJvcGVydGllczogZnVuY3Rpb24gKGFQcm9wZXJ0aWVzOiBhbnkpIHtcblx0XHRpZiAoYVByb3BlcnRpZXMgJiYgYVByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0XHRhUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChvSUZpbHRlclByb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkudHlwZUNvbmZpZyAmJlxuXHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkudHlwZUNvbmZpZy50eXBlSW5zdGFuY2UgJiZcblx0XHRcdFx0XHRvSUZpbHRlclByb3BlcnR5LnR5cGVDb25maWcudHlwZUluc3RhbmNlLmdldENvbnN0cmFpbnRzIGluc3RhbmNlb2YgRnVuY3Rpb25cblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvSUZpbHRlclByb3BlcnR5LnBhdGggPT09IFwiJGVkaXRTdGF0ZVwiKSB7XG5cdFx0XHRcdFx0b0lGaWx0ZXJQcm9wZXJ0eS50eXBlQ29uZmlnID0gVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiLCB7fSwge30pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9JRmlsdGVyUHJvcGVydHkucGF0aCA9PT0gXCIkc2VhcmNoXCIpIHtcblx0XHRcdFx0XHRvSUZpbHRlclByb3BlcnR5LnR5cGVDb25maWcgPSBUeXBlVXRpbC5nZXRUeXBlQ29uZmlnKFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCIsIHt9LCB7fSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAob0lGaWx0ZXJQcm9wZXJ0eS5kYXRhVHlwZSB8fCAob0lGaWx0ZXJQcm9wZXJ0eS50eXBlQ29uZmlnICYmIG9JRmlsdGVyUHJvcGVydHkudHlwZUNvbmZpZy5jbGFzc05hbWUpKSB7XG5cdFx0XHRcdFx0b0lGaWx0ZXJQcm9wZXJ0eS50eXBlQ29uZmlnID0gVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhcblx0XHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkuZGF0YVR5cGUgfHwgb0lGaWx0ZXJQcm9wZXJ0eS50eXBlQ29uZmlnLmNsYXNzTmFtZSxcblx0XHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0XHRcdG9JRmlsdGVyUHJvcGVydHkuY29uc3RyYWludHNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFQcm9wZXJ0aWVzO1xuXHR9LFxuXHRnZXROb3RBcHBsaWNhYmxlRmlsdGVyczogZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IGFueSwgb0NvbnRyb2w6IGFueSkge1xuXHRcdGNvbnN0IHNUYXJnZXRFbnRpdHlUeXBlUGF0aCA9IG9Db250cm9sLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0b0ZpbHRlckJhckVudGl0eVBhdGggPSBvRmlsdGVyQmFyLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0b0ZpbHRlckJhckVudGl0eVNldEFubm90YXRpb25zID0gb0ZpbHRlckJhci5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChvRmlsdGVyQmFyRW50aXR5UGF0aCksXG5cdFx0XHRhTm90QXBwbGljYWJsZSA9IFtdLFxuXHRcdFx0bUNvbmRpdGlvbnMgPSBvRmlsdGVyQmFyLmdldENvbmRpdGlvbnMoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvRmlsdGVyQmFyLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRiSXNGaWx0ZXJCYXJFbnRpdHlUeXBlID0gc1RhcmdldEVudGl0eVR5cGVQYXRoID09PSBvRmlsdGVyQmFyLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0YklzQ2hhcnQgPSBvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpLFxuXHRcdFx0YklzQW5hbHl0aWNhbFRhYmxlID0gIWJJc0NoYXJ0ICYmIG9Db250cm9sLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpLmVuYWJsZUFuYWx5dGljcyxcblx0XHRcdGJFbmFibGVTZWFyY2ggPSBiSXNDaGFydFxuXHRcdFx0XHQ/IENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob0NvbnRyb2wsIFwiYXBwbHlTdXBwb3J0ZWRcIikpLmVuYWJsZVNlYXJjaFxuXHRcdFx0XHQ6ICFiSXNBbmFseXRpY2FsVGFibGUgfHwgb0NvbnRyb2wuZ2V0UGFyZW50KCkuZ2V0VGFibGVEZWZpbml0aW9uKCkuZW5hYmxlQW5hbHl0aWNzU2VhcmNoO1xuXG5cdFx0aWYgKG1Db25kaXRpb25zICYmICghYklzRmlsdGVyQmFyRW50aXR5VHlwZSB8fCBiSXNBbmFseXRpY2FsVGFibGUgfHwgYklzQ2hhcnQpKSB7XG5cdFx0XHQvLyBXZSBkb24ndCBuZWVkIHRvIGNhbGN1bGF0ZSB0aGUgZGlmZmVyZW5jZSBvbiBwcm9wZXJ0eSBMZXZlbCBpZiBlbnRpdHkgc2V0cyBhcmUgaWRlbnRpY2FsXG5cdFx0XHRjb25zdCBhVGFyZ2V0UHJvcGVydGllcyA9IGJJc0ZpbHRlckJhckVudGl0eVR5cGVcblx0XHRcdFx0XHQ/IFtdXG5cdFx0XHRcdFx0OiBvRmlsdGVyQmFyLmdldENvbnRyb2xEZWxlZ2F0ZSgpLmZldGNoUHJvcGVydGllc0ZvckVudGl0eShzVGFyZ2V0RW50aXR5VHlwZVBhdGgsIG9NZXRhTW9kZWwsIG9GaWx0ZXJCYXIpLFxuXHRcdFx0XHRtVGFyZ2V0UHJvcGVydGllcyA9IGFUYXJnZXRQcm9wZXJ0aWVzLnJlZHVjZShmdW5jdGlvbiAobVByb3A6IGFueSwgb1Byb3A6IGFueSkge1xuXHRcdFx0XHRcdG1Qcm9wW29Qcm9wLm5hbWVdID0gb1Byb3A7XG5cdFx0XHRcdFx0cmV0dXJuIG1Qcm9wO1xuXHRcdFx0XHR9LCB7fSksXG5cdFx0XHRcdG1UYWJsZUFnZ3JlZ2F0ZXMgPSAoIWJJc0NoYXJ0ICYmIG9Db250cm9sLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpLmFnZ3JlZ2F0ZXMpIHx8IHt9LFxuXHRcdFx0XHRtQWdncmVnYXRlZFByb3BlcnRpZXM6IGFueSA9IHt9O1xuXG5cdFx0XHRPYmplY3Qua2V5cyhtVGFibGVBZ2dyZWdhdGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChzQWdncmVnYXRlTmFtZTogc3RyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IG9BZ2dyZWdhdGUgPSBtVGFibGVBZ2dyZWdhdGVzW3NBZ2dyZWdhdGVOYW1lXTtcblx0XHRcdFx0bUFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzW29BZ2dyZWdhdGUucmVsYXRpdmVQYXRoXSA9IG9BZ2dyZWdhdGU7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGNoYXJ0RW50aXR5VHlwZUFubm90YXRpb25zID0gb0NvbnRyb2xcblx0XHRcdFx0LmdldE1vZGVsKClcblx0XHRcdFx0LmdldE1ldGFNb2RlbCgpXG5cdFx0XHRcdC5nZXRPYmplY3Qob0NvbnRyb2wuZGF0YShcInRhcmdldENvbGxlY3Rpb25QYXRoXCIpICsgXCIvXCIpO1xuXHRcdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuQ2hhcnRcIikpIHtcblx0XHRcdFx0Y29uc3Qgb0VudGl0eVNldEFubm90YXRpb25zID0gb0NvbnRyb2xcblx0XHRcdFx0XHRcdC5nZXRNb2RlbCgpXG5cdFx0XHRcdFx0XHQuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0XHRcdC5nZXRPYmplY3QoYCR7b0NvbnRyb2wuZGF0YShcInRhcmdldENvbGxlY3Rpb25QYXRoXCIpfUBgKSxcblx0XHRcdFx0XHRtQ2hhcnRDdXN0b21BZ2dyZWdhdGVzID0gTWV0YU1vZGVsVXRpbC5nZXRBbGxDdXN0b21BZ2dyZWdhdGVzKG9FbnRpdHlTZXRBbm5vdGF0aW9ucyk7XG5cdFx0XHRcdE9iamVjdC5rZXlzKG1DaGFydEN1c3RvbUFnZ3JlZ2F0ZXMpLmZvckVhY2goZnVuY3Rpb24gKHNBZ2dyZWdhdGVOYW1lOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRpZiAoIW1BZ2dyZWdhdGVkUHJvcGVydGllc1tzQWdncmVnYXRlTmFtZV0pIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9BZ2dyZWdhdGUgPSBtQ2hhcnRDdXN0b21BZ2dyZWdhdGVzW3NBZ2dyZWdhdGVOYW1lXTtcblx0XHRcdFx0XHRcdG1BZ2dyZWdhdGVkUHJvcGVydGllc1tzQWdncmVnYXRlTmFtZV0gPSBvQWdncmVnYXRlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGZvciAoY29uc3Qgc1Byb3BlcnR5IGluIG1Db25kaXRpb25zKSB7XG5cdFx0XHRcdC8vIE5lZWQgdG8gY2hlY2sgdGhlIGxlbmd0aCBvZiBtQ29uZGl0aW9uc1tzUHJvcGVydHldIHNpbmNlIHByZXZpb3VzIGZpbHRlcmVkIHByb3BlcnRpZXMgYXJlIGtlcHQgaW50byBtQ29uZGl0aW9ucyB3aXRoIGVtcHR5IGFycmF5IGFzIGRlZmluaXRpb25cblx0XHRcdFx0Y29uc3QgYUNvbmRpdGlvblByb3BlcnR5ID0gbUNvbmRpdGlvbnNbc1Byb3BlcnR5XTtcblx0XHRcdFx0bGV0IHR5cGVDaGVjayA9IHRydWU7XG5cdFx0XHRcdGlmIChjaGFydEVudGl0eVR5cGVBbm5vdGF0aW9uc1tzUHJvcGVydHldICYmIG9GaWx0ZXJCYXJFbnRpdHlTZXRBbm5vdGF0aW9uc1tzUHJvcGVydHldKSB7XG5cdFx0XHRcdFx0dHlwZUNoZWNrID0gY2hhcnRFbnRpdHlUeXBlQW5ub3RhdGlvbnNbc1Byb3BlcnR5XVtcIiRUeXBlXCJdID09PSBvRmlsdGVyQmFyRW50aXR5U2V0QW5ub3RhdGlvbnNbc1Byb3BlcnR5XVtcIiRUeXBlXCJdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRBcnJheS5pc0FycmF5KGFDb25kaXRpb25Qcm9wZXJ0eSkgJiZcblx0XHRcdFx0XHRhQ29uZGl0aW9uUHJvcGVydHkubGVuZ3RoID4gMCAmJlxuXHRcdFx0XHRcdCgoKCFtVGFyZ2V0UHJvcGVydGllc1tzUHJvcGVydHldIHx8IChtVGFyZ2V0UHJvcGVydGllc1tzUHJvcGVydHldICYmICF0eXBlQ2hlY2spKSAmJlxuXHRcdFx0XHRcdFx0KCFiSXNGaWx0ZXJCYXJFbnRpdHlUeXBlIHx8IChzUHJvcGVydHkgPT09IFwiJGVkaXRTdGF0ZVwiICYmIGJJc0NoYXJ0KSkpIHx8XG5cdFx0XHRcdFx0XHRtQWdncmVnYXRlZFByb3BlcnRpZXNbc1Byb3BlcnR5XSlcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0YU5vdEFwcGxpY2FibGUucHVzaChzUHJvcGVydHkucmVwbGFjZSgvXFwrfFxcKi9nLCBcIlwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCFiRW5hYmxlU2VhcmNoICYmIG9GaWx0ZXJCYXIuZ2V0U2VhcmNoKCkpIHtcblx0XHRcdGFOb3RBcHBsaWNhYmxlLnB1c2goXCIkc2VhcmNoXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gYU5vdEFwcGxpY2FibGU7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHZhbHVlIGxpc3QgaW5mb3JtYXRpb24gb2YgYSBwcm9wZXJ0eSBhcyBkZWZpbmVkIGZvciBhIGdpdmVuIGZpbHRlciBiYXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJCYXIgVGhlIGZpbHRlciBiYXIgdG8gZ2V0IHRoZSB2YWx1ZSBsaXN0IGluZm9ybWF0aW9uIGZvclxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFRoZSBwcm9wZXJ0eSB0byBnZXQgdGhlIHZhbHVlIGxpc3QgaW5mb3JtYXRpb24gZm9yXG5cdCAqIEByZXR1cm5zIFRoZSB2YWx1ZSBsaXN0IGluZm9ybWF0aW9uXG5cdCAqL1xuXHRhc3luYyBfZ2V0VmFsdWVMaXN0SW5mbyhmaWx0ZXJCYXI6IEZpbHRlckJhciwgcHJvcGVydHlOYW1lOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IG1ldGFNb2RlbCA9IGZpbHRlckJhci5nZXRNb2RlbCgpPy5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblxuXHRcdGlmICghbWV0YU1vZGVsKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGNvbnN0IGVudGl0eVR5cGUgPSBmaWx0ZXJCYXIuZGF0YShcImVudGl0eVR5cGVcIikgPz8gXCJcIjtcblx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvcyA9IGF3YWl0IG1ldGFNb2RlbC5yZXF1ZXN0VmFsdWVMaXN0SW5mbyhlbnRpdHlUeXBlICsgcHJvcGVydHlOYW1lLCB0cnVlLCB1bmRlZmluZWQpLmNhdGNoKCgpID0+IG51bGwpO1xuXHRcdHJldHVybiB2YWx1ZUxpc3RJbmZvcz8uW1wiXCJdO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSB7QGxpbmsgQ29uZGl0aW9uVmFsaWRhdGVkfSBzdGF0ZSBmb3IgYSBzaW5nbGUgdmFsdWUuIFRoaXMgZGVjaWRlcyB3aGV0aGVyIHRoZSB2YWx1ZSBpcyB0cmVhdGVkIGFzIGEgc2VsZWN0ZWQgdmFsdWVcblx0ICogaW4gYSB2YWx1ZSBoZWxwLCBtZWFuaW5nIHRoYXQgaXRzIGRlc2NyaXB0aW9uIGlzIGxvYWRlZCBhbmQgZGlzcGxheWVkIGlmIGV4aXN0aW5nLCBvciB3aGV0aGVyIGl0IGlzIGRpc3BsYXllZCBhcyBhXG5cdCAqIGNvbmRpdGlvbiAoZS5nLiBcIj0xXCIpLlxuXHQgKlxuXHQgKiBWYWx1ZXMgZm9yIHByb3BlcnRpZXMgd2l0aG91dCB2YWx1ZSBsaXN0IGluZm8gYXJlIGFsd2F5cyB0cmVhdGVkIGFzIHtAbGluayBDb25kaXRpb25WYWxpZGF0ZWQuTm90VmFsaWRhdGVkfS5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlTGlzdEluZm8gVGhlIHZhbHVlIGxpc3QgaW5mbyBmcm9tIHRoZSB7QGxpbmsgTWV0YU1vZGVsfVxuXHQgKiBAcGFyYW0gY29uZGl0aW9uUGF0aCBQYXRoIHRvIHRoZSBwcm9wZXJ0eSB0byBzZXQgdGhlIHZhbHVlIGFzIGNvbmRpdGlvbiBmb3Jcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBzaW5nbGUgdmFsdWUgdG8gZ2V0IHRoZSBzdGF0ZSBmb3Jcblx0ICovXG5cdF9nZXRDb25kaXRpb25WYWxpZGF0ZWQ6IGFzeW5jIGZ1bmN0aW9uIChcblx0XHR2YWx1ZUxpc3RJbmZvOiBhbnksXG5cdFx0Y29uZGl0aW9uUGF0aDogc3RyaW5nLFxuXHRcdHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZFxuXHQpOiBQcm9taXNlPENvbmRpdGlvblZhbGlkYXRlZD4ge1xuXHRcdGlmICghdmFsdWVMaXN0SW5mbykge1xuXHRcdFx0cmV0dXJuIENvbmRpdGlvblZhbGlkYXRlZC5Ob3RWYWxpZGF0ZWQ7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZmlsdGVyID0gbmV3IEZpbHRlcih7XG5cdFx0XHRwYXRoOiBjb25kaXRpb25QYXRoLFxuXHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLFxuXHRcdFx0dmFsdWUxOiB2YWx1ZVxuXHRcdH0pO1xuXHRcdGNvbnN0IGxpc3RCaW5kaW5nID0gdmFsdWVMaXN0SW5mby4kbW9kZWwuYmluZExpc3QoYC8ke3ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9YCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZpbHRlciwge1xuXHRcdFx0JHNlbGVjdDogY29uZGl0aW9uUGF0aFxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgdmFsdWVFeGlzdHMgPSAoYXdhaXQgbGlzdEJpbmRpbmcucmVxdWVzdENvbnRleHRzKCkpLmxlbmd0aCA+IDA7XG5cdFx0aWYgKHZhbHVlRXhpc3RzKSB7XG5cdFx0XHRyZXR1cm4gQ29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIENvbmRpdGlvblZhbGlkYXRlZC5Ob3RWYWxpZGF0ZWQ7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQ2xlYXJzIGFsbCBpbnB1dCB2YWx1ZXMgb2YgdmlzaWJsZSBmaWx0ZXIgZmllbGRzIGluIHRoZSBmaWx0ZXIgYmFyLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0ZpbHRlckJhciBUaGUgZmlsdGVyIGJhciB0aGF0IGNvbnRhaW5zIHRoZSBmaWx0ZXIgZmllbGRcblx0ICovXG5cdGNsZWFyRmlsdGVyVmFsdWVzOiBhc3luYyBmdW5jdGlvbiAob0ZpbHRlckJhcjogYW55KSB7XG5cdFx0Ly8gRG8gbm90aGluZyB3aGVuIHRoZSBmaWx0ZXIgYmFyIGlzIGhpZGRlblxuXHRcdGlmICghb0ZpbHRlckJhcikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHN0YXRlOiBFeHRlcm5hbFN0YXRlVHlwZSA9IGF3YWl0IFN0YXRlVXRpbC5yZXRyaWV2ZUV4dGVybmFsU3RhdGUob0ZpbHRlckJhcik7XG5cdFx0Y29uc3QgZWRpdFN0YXRlUGF0aCA9IFwiJGVkaXRTdGF0ZVwiO1xuXHRcdGNvbnN0IGVkaXRTdGF0ZURlZmF1bHRWYWx1ZSA9IEVESVRTVEFURS5BTEwuaWQ7XG5cdFx0Y29uc3QgY3VycmVudEVkaXRTdGF0ZUNvbmRpdGlvbiA9IGRlZXBDbG9uZShzdGF0ZS5maWx0ZXJbZWRpdFN0YXRlUGF0aF0/LlswXSk7XG5cdFx0Y29uc3QgY3VycmVudEVkaXRTdGF0ZUlzRGVmYXVsdCA9IGN1cnJlbnRFZGl0U3RhdGVDb25kaXRpb24/LnZhbHVlc1swXSA9PT0gZWRpdFN0YXRlRGVmYXVsdFZhbHVlO1xuXG5cdFx0Ly8gQ2xlYXIgYWxsIGNvbmRpdGlvbnNcblx0XHRmb3IgKGNvbnN0IGNvbmRpdGlvblBhdGggb2YgT2JqZWN0LmtleXMoc3RhdGUuZmlsdGVyKSkge1xuXHRcdFx0aWYgKGNvbmRpdGlvblBhdGggPT09IGVkaXRTdGF0ZVBhdGggJiYgY3VycmVudEVkaXRTdGF0ZUlzRGVmYXVsdCkge1xuXHRcdFx0XHQvLyBEbyBub3QgY2xlYXIgZWRpdCBzdGF0ZSBjb25kaXRpb24gaWYgaXQgaXMgYWxyZWFkeSBcIkFMTFwiXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0Zm9yIChjb25zdCBjb25kaXRpb24gb2Ygc3RhdGUuZmlsdGVyW2NvbmRpdGlvblBhdGhdKSB7XG5cdFx0XHRcdGNvbmRpdGlvbi5maWx0ZXJlZCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRhd2FpdCBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIsIHsgZmlsdGVyOiBzdGF0ZS5maWx0ZXIgfSk7XG5cblx0XHQvLyBTZXQgZWRpdCBzdGF0ZSB0byAnQUxMJyBpZiBpdCB3YXNuJ3QgYmVmb3JlXG5cdFx0aWYgKGN1cnJlbnRFZGl0U3RhdGVDb25kaXRpb24gJiYgIWN1cnJlbnRFZGl0U3RhdGVJc0RlZmF1bHQpIHtcblx0XHRcdGN1cnJlbnRFZGl0U3RhdGVDb25kaXRpb24udmFsdWVzID0gW2VkaXRTdGF0ZURlZmF1bHRWYWx1ZV07XG5cdFx0XHRhd2FpdCBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIsIHsgZmlsdGVyOiB7IFtlZGl0U3RhdGVQYXRoXTogW2N1cnJlbnRFZGl0U3RhdGVDb25kaXRpb25dIH0gfSk7XG5cdFx0fVxuXG5cdFx0Ly8gQWxsb3cgYXBwIGRldmVsb3BlcnMgdG8gdXBkYXRlIGZpbHRlcnMgYWZ0ZXIgY2xlYXJpbmdcblx0XHRvRmlsdGVyQmFyLmdldFBhcmVudCgpLmZpcmVBZnRlckNsZWFyKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENsZWFyIHRoZSBmaWx0ZXIgdmFsdWUgZm9yIGEgc3BlY2lmaWMgcHJvcGVydHkgaW4gdGhlIGZpbHRlciBiYXIuXG5cdCAqIFRoaXMgaXMgYSBwcmVyZXF1aXNpdGUgYmVmb3JlIG5ldyB2YWx1ZXMgY2FuIGJlIHNldCBjbGVhbmx5LlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlsdGVyQmFyIFRoZSBmaWx0ZXIgYmFyIHRoYXQgY29udGFpbnMgdGhlIGZpbHRlciBmaWVsZFxuXHQgKiBAcGFyYW0gY29uZGl0aW9uUGF0aCBUaGUgcGF0aCB0byB0aGUgcHJvcGVydHkgYXMgYSBjb25kaXRpb24gcGF0aFxuXHQgKi9cblx0YXN5bmMgX2NsZWFyRmlsdGVyVmFsdWUoZmlsdGVyQmFyOiBGaWx0ZXJCYXIsIGNvbmRpdGlvblBhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IG9TdGF0ZSA9IGF3YWl0IFN0YXRlVXRpbC5yZXRyaWV2ZUV4dGVybmFsU3RhdGUoZmlsdGVyQmFyKTtcblx0XHRpZiAob1N0YXRlLmZpbHRlcltjb25kaXRpb25QYXRoXSkge1xuXHRcdFx0b1N0YXRlLmZpbHRlcltjb25kaXRpb25QYXRoXS5mb3JFYWNoKChvQ29uZGl0aW9uOiBhbnkpID0+IHtcblx0XHRcdFx0b0NvbmRpdGlvbi5maWx0ZXJlZCA9IGZhbHNlO1xuXHRcdFx0fSk7XG5cdFx0XHRhd2FpdCBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKGZpbHRlckJhciwgeyBmaWx0ZXI6IHsgW2NvbmRpdGlvblBhdGhdOiBvU3RhdGUuZmlsdGVyW2NvbmRpdGlvblBhdGhdIH0gfSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGZpbHRlciB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eSBpbiB0aGUgZmlsdGVyIGJhci5cblx0ICogVGhlIGZpbHRlciB2YWx1ZXMgY2FuIGJlIGVpdGhlciBhIHNpbmdsZSB2YWx1ZSBvciBhbiBhcnJheSBvZiB2YWx1ZXMuXG5cdCAqIEVhY2ggZmlsdGVyIHZhbHVlIG11c3QgYmUgcmVwcmVzZW50ZWQgYXMgYSBwcmltaXRpdmUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyIFRoZSBmaWx0ZXIgYmFyIHRoYXQgY29udGFpbnMgdGhlIGZpbHRlciBmaWVsZFxuXHQgKiBAcGFyYW0gc0NvbmRpdGlvblBhdGggVGhlIHBhdGggdG8gdGhlIHByb3BlcnR5IGFzIGEgY29uZGl0aW9uIHBhdGhcblx0ICogQHBhcmFtIGFyZ3MgTGlzdCBvZiBvcHRpb25hbCBwYXJhbWV0ZXJzXG5cdCAqICBbc09wZXJhdG9yXSBUaGUgb3BlcmF0b3IgdG8gYmUgdXNlZCAtIGlmIG5vdCBzZXQsIHRoZSBkZWZhdWx0IG9wZXJhdG9yIChFUSkgd2lsbCBiZSB1c2VkXG5cdCAqICBbdlZhbHVlc10gVGhlIHZhbHVlcyB0byBiZSBhcHBsaWVkIC0gaWYgc09wZXJhdG9yIGlzIG1pc3NpbmcsIHZWYWx1ZXMgaXMgdXNlZCBhcyAzcmQgcGFyYW1ldGVyXG5cdCAqL1xuXHRzZXRGaWx0ZXJWYWx1ZXM6IGFzeW5jIGZ1bmN0aW9uIChvRmlsdGVyQmFyOiBhbnksIHNDb25kaXRpb25QYXRoOiBzdHJpbmcsIC4uLmFyZ3M6IGFueSkge1xuXHRcdGxldCBzT3BlcmF0b3I6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGFyZ3M/LlswXTtcblx0XHRsZXQgdlZhbHVlczogdW5kZWZpbmVkIHwgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZ1tdIHwgbnVtYmVyW10gfCBib29sZWFuW10gPSBhcmdzPy5bMV07XG5cblx0XHQvLyBEbyBub3RoaW5nIHdoZW4gdGhlIGZpbHRlciBiYXIgaXMgaGlkZGVuXG5cdFx0aWYgKCFvRmlsdGVyQmFyKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gY29tbW9uIGZpbHRlciBPcGVyYXRvcnMgbmVlZCBhIHZhbHVlLiBEbyBub3RoaW5nIGlmIHRoaXMgdmFsdWUgaXMgdW5kZWZpbmVkXG5cdFx0Ly8gQkNQOiAyMjcwMTM1Mjc0XG5cdFx0aWYgKFxuXHRcdFx0YXJncy5sZW5ndGggPT09IDIgJiZcblx0XHRcdCh2VmFsdWVzID09PSB1bmRlZmluZWQgfHwgdlZhbHVlcyA9PT0gbnVsbCB8fCB2VmFsdWVzID09PSBcIlwiKSAmJlxuXHRcdFx0c09wZXJhdG9yICYmXG5cdFx0XHRPYmplY3Qua2V5cyhGaWx0ZXJPcGVyYXRvcikuaW5kZXhPZihzT3BlcmF0b3IpICE9PSAtMVxuXHRcdCkge1xuXHRcdFx0TG9nLndhcm5pbmcoYEFuIGVtcHR5IGZpbHRlciB2YWx1ZSBjYW5ub3QgYmUgYXBwbGllZCB3aXRoIHRoZSAke3NPcGVyYXRvcn0gb3BlcmF0b3JgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBUaGUgNHRoIHBhcmFtZXRlciBpcyBvcHRpb25hbDsgaWYgc09wZXJhdG9yIGlzIG1pc3NpbmcsIHZWYWx1ZXMgaXMgdXNlZCBhcyAzcmQgcGFyYW1ldGVyXG5cdFx0Ly8gVGhpcyBkb2VzIG5vdCBhcHBseSBmb3Igc2VtYW50aWMgZGF0ZXMsIGFzIHRoZXNlIGRvIG5vdCByZXF1aXJlIHZWYWx1ZXMgKGV4Y2VwdGlvbjogXCJMQVNUREFZU1wiLCAzKVxuXHRcdGlmICh2VmFsdWVzID09PSB1bmRlZmluZWQgJiYgIVNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zKCkuaW5jbHVkZXMoc09wZXJhdG9yIHx8IFwiXCIpKSB7XG5cdFx0XHR2VmFsdWVzID0gc09wZXJhdG9yID8/IFtdO1xuXHRcdFx0c09wZXJhdG9yID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdC8vIElmIHNPcGVyYXRvciBpcyBub3Qgc2V0LCB1c2UgRVEgYXMgZGVmYXVsdFxuXHRcdGlmICghc09wZXJhdG9yKSB7XG5cdFx0XHRzT3BlcmF0b3IgPSBGaWx0ZXJPcGVyYXRvci5FUTtcblx0XHR9XG5cblx0XHQvLyBTdXBwb3J0ZWQgYXJyYXkgdHlwZXM6XG5cdFx0Ly8gIC0gU2luZ2xlIFZhbHVlczpcdFwiMlwiIHwgW1wiMlwiXVxuXHRcdC8vICAtIE11bHRpcGxlIFZhbHVlczpcdFtcIjJcIiwgXCIzXCJdXG5cdFx0Ly8gIC0gUmFuZ2VzOlx0XHRcdFtcIjJcIixcIjNcIl1cblx0XHQvLyBVbnN1cHBvcnRlZCBhcnJheSB0eXBlczpcblx0XHQvLyAgLSBNdWx0aXBsZSBSYW5nZXM6XHRbW1wiMlwiLFwiM1wiXV0gfCBbW1wiMlwiLFwiM1wiXSxbXCI0XCIsXCI1XCJdXVxuXHRcdGNvbnN0IHN1cHBvcnRlZFZhbHVlVHlwZXMgPSBbXCJzdHJpbmdcIiwgXCJudW1iZXJcIiwgXCJib29sZWFuXCJdO1xuXHRcdGlmIChcblx0XHRcdHZWYWx1ZXMgIT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0KCghQXJyYXkuaXNBcnJheSh2VmFsdWVzKSAmJiAhc3VwcG9ydGVkVmFsdWVUeXBlcy5pbmNsdWRlcyh0eXBlb2YgdlZhbHVlcykpIHx8XG5cdFx0XHRcdChBcnJheS5pc0FycmF5KHZWYWx1ZXMpICYmIHZWYWx1ZXMubGVuZ3RoID4gMCAmJiAhc3VwcG9ydGVkVmFsdWVUeXBlcy5pbmNsdWRlcyh0eXBlb2YgdlZhbHVlc1swXSkpKVxuXHRcdCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcIkZpbHRlclV0aWxzLmpzI19zZXRGaWx0ZXJWYWx1ZXM6IEZpbHRlciB2YWx1ZSBub3Qgc3VwcG9ydGVkOyBvbmx5IHByaW1pdGl2ZSB2YWx1ZXMgb3IgYW4gYXJyYXkgdGhlcmVvZiBjYW4gYmUgdXNlZC5cIlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0bGV0IHZhbHVlczogKHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBudWxsKVtdIHwgdW5kZWZpbmVkO1xuXHRcdGlmICh2VmFsdWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHZhbHVlcyA9IEFycmF5LmlzQXJyYXkodlZhbHVlcykgPyB2VmFsdWVzIDogW3ZWYWx1ZXNdO1xuXHRcdH1cblxuXHRcdC8vIEdldCB0aGUgdmFsdWUgbGlzdCBpbmZvIG9mIHRoZSBwcm9wZXJ0eSB0byBsYXRlciBjaGVjayB3aGV0aGVyIHRoZSB2YWx1ZXMgZXhpc3Rcblx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvID0gYXdhaXQgdGhpcy5fZ2V0VmFsdWVMaXN0SW5mbyhvRmlsdGVyQmFyLCBzQ29uZGl0aW9uUGF0aCk7XG5cblx0XHRjb25zdCBmaWx0ZXI6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcblx0XHRpZiAoc0NvbmRpdGlvblBhdGgpIHtcblx0XHRcdGlmICh2YWx1ZXMgJiYgdmFsdWVzLmxlbmd0aCkge1xuXHRcdFx0XHRpZiAoc09wZXJhdG9yID09PSBGaWx0ZXJPcGVyYXRvci5CVCkge1xuXHRcdFx0XHRcdC8vIFRoZSBvcGVyYXRvciBCVCByZXF1aXJlcyBvbmUgY29uZGl0aW9uIHdpdGggYm90aCB0aHJlc2hvbGRzXG5cdFx0XHRcdFx0ZmlsdGVyW3NDb25kaXRpb25QYXRoXSA9IFtDb25kaXRpb24uY3JlYXRlQ29uZGl0aW9uKHNPcGVyYXRvciwgdmFsdWVzLCBudWxsLCBudWxsLCBDb25kaXRpb25WYWxpZGF0ZWQuTm90VmFsaWRhdGVkKV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gUmVndWxhciBzaW5nbGUgYW5kIG11bHRpIHZhbHVlIGNvbmRpdGlvbnMsIGlmIHRoZXJlIGFyZSBubyB2YWx1ZXMsIHdlIGRvIG5vdCB3YW50IGFueSBjb25kaXRpb25zXG5cdFx0XHRcdFx0ZmlsdGVyW3NDb25kaXRpb25QYXRoXSA9IGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdFx0dmFsdWVzLm1hcChhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdFx0Ly8gRm9yIHRoZSBFUSBjYXNlLCB0ZWxsIE1EQyB0byB2YWxpZGF0ZSB0aGUgdmFsdWUgKGUuZy4gZGlzcGxheSB0aGUgZGVzY3JpcHRpb24pLCBpZiBpdCBleGlzdHMgaW4gdGhlIGFzc29jaWF0ZWQgZW50aXR5LCBvdGhlcndpc2UgbmV2ZXIgdmFsaWRhdGVcblx0XHRcdFx0XHRcdFx0Y29uc3QgY29uZGl0aW9uVmFsaWRhdGVkU3RhdHVzID1cblx0XHRcdFx0XHRcdFx0XHRzT3BlcmF0b3IgPT09IEZpbHRlck9wZXJhdG9yLkVRXG5cdFx0XHRcdFx0XHRcdFx0XHQ/IGF3YWl0IHRoaXMuX2dldENvbmRpdGlvblZhbGlkYXRlZCh2YWx1ZUxpc3RJbmZvLCBzQ29uZGl0aW9uUGF0aCwgdmFsdWUpXG5cdFx0XHRcdFx0XHRcdFx0XHQ6IENvbmRpdGlvblZhbGlkYXRlZC5Ob3RWYWxpZGF0ZWQ7XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oc09wZXJhdG9yISwgW3ZhbHVlXSwgbnVsbCwgbnVsbCwgY29uZGl0aW9uVmFsaWRhdGVkU3RhdHVzKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChTZW1hbnRpY0RhdGVPcGVyYXRvcnMuZ2V0U2VtYW50aWNEYXRlT3BlcmF0aW9ucygpLmluY2x1ZGVzKHNPcGVyYXRvciB8fCBcIlwiKSkge1xuXHRcdFx0XHQvLyB2VmFsdWVzIGlzIHVuZGVmaW5lZCwgc28gdGhlIG9wZXJhdG9yIGlzIGEgc2VtYW50aWMgZGF0ZSB0aGF0IGRvZXMgbm90IG5lZWQgdmFsdWVzIChzZWUgYWJvdmUpXG5cdFx0XHRcdGZpbHRlcltzQ29uZGl0aW9uUGF0aF0gPSBbQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihzT3BlcmF0b3IsIFtdLCBudWxsLCBudWxsLCBDb25kaXRpb25WYWxpZGF0ZWQuTm90VmFsaWRhdGVkKV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQWx3YXlzIGNsZWFyIHRoZSBjdXJyZW50IHZhbHVlIGFzIHdlIGRvIG5vdCB3YW50IHRvIGFkZCBmaWx0ZXIgdmFsdWVzIGJ1dCByZXBsYWNlIHRoZW1cblx0XHRhd2FpdCB0aGlzLl9jbGVhckZpbHRlclZhbHVlKG9GaWx0ZXJCYXIsIHNDb25kaXRpb25QYXRoKTtcblxuXHRcdGlmIChmaWx0ZXJbc0NvbmRpdGlvblBhdGhdKSB7XG5cdFx0XHQvLyBUaGlzIGlzIG5vdCBjYWxsZWQgaW4gdGhlIHJlc2V0IGNhc2UsIGkuZS4gc2V0RmlsdGVyVmFsdWUoXCJQcm9wZXJ0eVwiKVxuXHRcdFx0YXdhaXQgU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZShvRmlsdGVyQmFyLCB7IGZpbHRlciB9KTtcblx0XHR9XG5cdH0sXG5cdGNvbmRpdGlvblRvTW9kZWxQYXRoOiBmdW5jdGlvbiAoc0NvbmRpdGlvblBhdGg6IHN0cmluZykge1xuXHRcdC8vIG1ha2UgdGhlIHBhdGggdXNhYmxlIGFzIG1vZGVsIHByb3BlcnR5LCB0aGVyZWZvcmUgc2xhc2hlcyBiZWNvbWUgYmFja3NsYXNoZXNcblx0XHRyZXR1cm4gc0NvbmRpdGlvblBhdGgucmVwbGFjZSgvXFwvL2csIFwiXFxcXFwiKTtcblx0fSxcblx0X2dldEZpbHRlck1ldGFNb2RlbDogZnVuY3Rpb24gKG9GaWx0ZXJDb250cm9sOiBhbnksIG1ldGFNb2RlbD86IE1ldGFNb2RlbCkge1xuXHRcdHJldHVybiBtZXRhTW9kZWwgfHwgb0ZpbHRlckNvbnRyb2wuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0fSxcblx0X2dldEVudGl0eVNldFBhdGg6IGZ1bmN0aW9uIChzRW50aXR5VHlwZVBhdGg6IGFueSkge1xuXHRcdHJldHVybiBzRW50aXR5VHlwZVBhdGggJiYgTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzRW50aXR5VHlwZVBhdGgpO1xuXHR9LFxuXG5cdF9nZXRGaWVsZHNGb3JUYWJsZTogZnVuY3Rpb24gKG9GaWx0ZXJDb250cm9sOiBhbnksIHNFbnRpdHlUeXBlUGF0aD86IGFueSkge1xuXHRcdGNvbnN0IGxyVGFibGVzOiBhbnlbXSA9IFtdO1xuXHRcdC8qKlxuXHRcdCAqIEdldHMgZmllbGRzIGZyb21cblx0XHQgKiBcdC0gZGlyZWN0IGVudGl0eSBwcm9wZXJ0aWVzLFxuXHRcdCAqIFx0LSBuYXZpZ2F0ZVByb3BlcnRpZXMga2V5IGluIHRoZSBtYW5pZmVzdCBpZiB0aGVzZSBwcm9wZXJ0aWVzIGFyZSBrbm93biBieSB0aGUgZW50aXR5XG5cdFx0ICogIC0gYW5ub3RhdGlvbiBcIlNlbGVjdGlvbkZpZWxkc1wiXG5cdFx0ICovXG5cdFx0aWYgKHNFbnRpdHlUeXBlUGF0aCkge1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9GaWx0ZXJDb250cm9sKTtcblx0XHRcdGNvbnN0IHRhYmxlQ29udHJvbHMgPVxuXHRcdFx0XHRvVmlldyAmJlxuXHRcdFx0XHRvVmlldy5nZXRDb250cm9sbGVyKCkgJiZcblx0XHRcdFx0KG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLl9nZXRDb250cm9scyAmJlxuXHRcdFx0XHQob1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkuX2dldENvbnRyb2xzKFwidGFibGVcIik7IC8vWzBdLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpO1xuXHRcdFx0aWYgKHRhYmxlQ29udHJvbHMpIHtcblx0XHRcdFx0dGFibGVDb250cm9scy5mb3JFYWNoKGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdFx0XHRcdGxyVGFibGVzLnB1c2gob1RhYmxlLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbHJUYWJsZXM7XG5cdFx0fVxuXHRcdHJldHVybiBbXTtcblx0fSxcblx0X2dldFNlbGVjdGlvbkZpZWxkczogZnVuY3Rpb24gKFxuXHRcdG9GaWx0ZXJDb250cm9sOiBhbnksXG5cdFx0c0VudGl0eVR5cGVQYXRoOiBzdHJpbmcsXG5cdFx0c0ZpbHRlckVudGl0eVR5cGVQYXRoOiBzdHJpbmcsXG5cdFx0Y29udGV4dFBhdGg6IHN0cmluZyxcblx0XHRsclRhYmxlczogYW55W10sXG5cdFx0b01ldGFNb2RlbDogYW55LFxuXHRcdG9Db252ZXJ0ZXJDb250ZXh0OiBhbnksXG5cdFx0aW5jbHVkZUhpZGRlbj86IGJvb2xlYW4sXG5cdFx0b01vZGlmaWVyPzogYW55LFxuXHRcdGxpbmVJdGVtVGVybT86IHN0cmluZ1xuXHQpIHtcblx0XHRsZXQgYVNlbGVjdGlvbkZpZWxkcyA9IEZpbHRlckJhckNvbnZlcnRlci5nZXRTZWxlY3Rpb25GaWVsZHMoXG5cdFx0XHRvQ29udmVydGVyQ29udGV4dCxcblx0XHRcdGxyVGFibGVzLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0aW5jbHVkZUhpZGRlbixcblx0XHRcdGxpbmVJdGVtVGVybVxuXHRcdCkuc2VsZWN0aW9uRmllbGRzO1xuXHRcdGlmIChcblx0XHRcdChvTW9kaWZpZXJcblx0XHRcdFx0PyBvTW9kaWZpZXIuZ2V0Q29udHJvbFR5cGUob0ZpbHRlckNvbnRyb2wpID09PSBcInNhcC51aS5tZGMuRmlsdGVyQmFyXCJcblx0XHRcdFx0OiBvRmlsdGVyQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckJhclwiKSkgJiZcblx0XHRcdHNFbnRpdHlUeXBlUGF0aCAhPT0gc0ZpbHRlckVudGl0eVR5cGVQYXRoXG5cdFx0KSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIFdlIGFyZSBvbiBtdWx0aSBlbnRpdHkgc2V0cyBzY2VuYXJpbyBzbyB3ZSBhZGQgYW5ub3RhdGlvbiBcIlNlbGVjdGlvbkZpZWxkc1wiXG5cdFx0XHQgKiBmcm9tIEZpbHRlckJhciBlbnRpdHkgaWYgdGhlc2UgcHJvcGVydGllcyBhcmUga25vd24gYnkgdGhlIGVudGl0eVxuXHRcdFx0ICovXG5cdFx0XHRjb25zdCBvVmlzdWFsaXphdGlvbk9iamVjdFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoY29udGV4dFBhdGgpKTtcblx0XHRcdGNvbnN0IG9QYWdlQ29udGV4dCA9IG9Db252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlckNvbnRleHRGb3Ioc0ZpbHRlckVudGl0eVR5cGVQYXRoKTtcblx0XHRcdGNvbnN0IGFGaWx0ZXJCYXJTZWxlY3Rpb25GaWVsZHNBbm5vdGF0aW9uOiBhbnkgPVxuXHRcdFx0XHRvUGFnZUNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIpLmFubm90YXRpb24gfHwgW107XG5cdFx0XHRjb25zdCBtYXBTZWxlY3Rpb25GaWVsZHM6IGFueSA9IHt9O1xuXHRcdFx0YVNlbGVjdGlvbkZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VsZWN0aW9uRmllbGQ6IGFueSkge1xuXHRcdFx0XHRtYXBTZWxlY3Rpb25GaWVsZHNbb1NlbGVjdGlvbkZpZWxkLmNvbmRpdGlvblBhdGhdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhRmlsdGVyQmFyU2VsZWN0aW9uRmllbGRzQW5ub3RhdGlvbi5mb3JFYWNoKGZ1bmN0aW9uIChvRmlsdGVyQmFyU2VsZWN0aW9uRmllbGRBbm5vdGF0aW9uOiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgc1BhdGggPSBvRmlsdGVyQmFyU2VsZWN0aW9uRmllbGRBbm5vdGF0aW9uLnZhbHVlO1xuXHRcdFx0XHRpZiAoIW1hcFNlbGVjdGlvbkZpZWxkc1tzUGF0aF0pIHtcblx0XHRcdFx0XHRjb25zdCBvRmlsdGVyRmllbGQgPSBGaWx0ZXJCYXJDb252ZXJ0ZXIuZ2V0RmlsdGVyRmllbGQoXG5cdFx0XHRcdFx0XHRzUGF0aCxcblx0XHRcdFx0XHRcdG9Db252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0b1Zpc3VhbGl6YXRpb25PYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0LmVudGl0eVR5cGVcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGlmIChvRmlsdGVyRmllbGQpIHtcblx0XHRcdFx0XHRcdGFTZWxlY3Rpb25GaWVsZHMucHVzaChvRmlsdGVyRmllbGQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmIChhU2VsZWN0aW9uRmllbGRzKSB7XG5cdFx0XHRjb25zdCBmaWVsZE5hbWVzOiBhbnlbXSA9IFtdO1xuXHRcdFx0YVNlbGVjdGlvbkZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChvRmllbGQ6IGFueSkge1xuXHRcdFx0XHRmaWVsZE5hbWVzLnB1c2gob0ZpZWxkLmtleSk7XG5cdFx0XHR9KTtcblx0XHRcdGFTZWxlY3Rpb25GaWVsZHMgPSB0aGlzLl9nZXRTZWxlY3Rpb25GaWVsZHNGcm9tUHJvcGVydHlJbmZvcyhvRmlsdGVyQ29udHJvbCwgZmllbGROYW1lcywgYVNlbGVjdGlvbkZpZWxkcyk7XG5cdFx0fVxuXHRcdHJldHVybiBhU2VsZWN0aW9uRmllbGRzO1xuXHR9LFxuXHRfZ2V0U2VsZWN0aW9uRmllbGRzRnJvbVByb3BlcnR5SW5mb3M6IGZ1bmN0aW9uIChvRmlsdGVyQ29udHJvbDogYW55LCBmaWVsZE5hbWVzOiBhbnksIGFTZWxlY3Rpb25GaWVsZHM6IGFueSkge1xuXHRcdGNvbnN0IHByb3BlcnR5SW5mb0ZpZWxkcyA9IChvRmlsdGVyQ29udHJvbC5nZXRQcm9wZXJ0eUluZm8gJiYgb0ZpbHRlckNvbnRyb2wuZ2V0UHJvcGVydHlJbmZvKCkpIHx8IFtdO1xuXHRcdHByb3BlcnR5SW5mb0ZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChvUHJvcDogYW55KSB7XG5cdFx0XHRpZiAob1Byb3AubmFtZSA9PT0gXCIkc2VhcmNoXCIgfHwgb1Byb3AubmFtZSA9PT0gXCIkZWRpdFN0YXRlXCIpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qgc2VsRmllbGQgPSBhU2VsZWN0aW9uRmllbGRzW2ZpZWxkTmFtZXMuaW5kZXhPZihvUHJvcC5rZXkpXTtcblx0XHRcdGlmIChmaWVsZE5hbWVzLmluZGV4T2Yob1Byb3Aua2V5KSAhPT0gLTEgJiYgc2VsRmllbGQuYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdFx0b1Byb3AuZ3JvdXAgPSBzZWxGaWVsZC5ncm91cDtcblx0XHRcdFx0b1Byb3AuZ3JvdXBMYWJlbCA9IHNlbEZpZWxkLmdyb3VwTGFiZWw7XG5cdFx0XHRcdG9Qcm9wLnNldHRpbmdzID0gc2VsRmllbGQuc2V0dGluZ3M7XG5cdFx0XHRcdG9Qcm9wLnZpc3VhbEZpbHRlciA9IHNlbEZpZWxkLnZpc3VhbEZpbHRlcjtcblx0XHRcdFx0b1Byb3AubGFiZWwgPSBzZWxGaWVsZC5sYWJlbDtcblx0XHRcdFx0YVNlbGVjdGlvbkZpZWxkc1tmaWVsZE5hbWVzLmluZGV4T2Yob1Byb3Aua2V5KV0gPSBvUHJvcDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGZpZWxkTmFtZXMuaW5kZXhPZihvUHJvcC5rZXkpID09PSAtMSAmJiAhb1Byb3AuYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdFx0YVNlbGVjdGlvbkZpZWxkcy5wdXNoKG9Qcm9wKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gYVNlbGVjdGlvbkZpZWxkcztcblx0fSxcblx0X2dldFNlYXJjaEZpZWxkOiBmdW5jdGlvbiAob0lGaWx0ZXI6IGFueSwgYUlnbm9yZVByb3BlcnRpZXM6IGFueSkge1xuXHRcdHJldHVybiBvSUZpbHRlci5nZXRTZWFyY2ggJiYgYUlnbm9yZVByb3BlcnRpZXMuaW5kZXhPZihcInNlYXJjaFwiKSA9PT0gLTEgPyBvSUZpbHRlci5nZXRTZWFyY2goKSA6IG51bGw7XG5cdH0sXG5cdF9nZXRGaWx0ZXJDb25kaXRpb25zOiBmdW5jdGlvbiAobVByb3BlcnRpZXM6IGFueSwgbUZpbHRlckNvbmRpdGlvbnM6IGFueSwgb0lGaWx0ZXI6IGFueSkge1xuXHRcdGNvbnN0IG1Db25kaXRpb25zID0gbUZpbHRlckNvbmRpdGlvbnMgfHwgb0lGaWx0ZXIuZ2V0Q29uZGl0aW9ucygpO1xuXHRcdGlmIChtUHJvcGVydGllcyAmJiBtUHJvcGVydGllcy50YXJnZXRDb250cm9sICYmIG1Qcm9wZXJ0aWVzLnRhcmdldENvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5DaGFydFwiKSkge1xuXHRcdFx0T2JqZWN0LmtleXMobUNvbmRpdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0XHRpZiAoc0tleSA9PT0gXCIkZWRpdFN0YXRlXCIpIHtcblx0XHRcdFx0XHRkZWxldGUgbUNvbmRpdGlvbnNbXCIkZWRpdFN0YXRlXCJdO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIG1Db25kaXRpb25zO1xuXHR9LFxuXHRfZ2V0RmlsdGVyUHJvcGVydGllc01ldGFkYXRhOiBmdW5jdGlvbiAoYUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YTogYW55LCBvSUZpbHRlcjogYW55KSB7XG5cdFx0aWYgKCEoYUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSAmJiBhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhLmxlbmd0aCkpIHtcblx0XHRcdGlmIChvSUZpbHRlci5nZXRQcm9wZXJ0eUluZm8pIHtcblx0XHRcdFx0YUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSA9IG9JRmlsdGVyLmdldFByb3BlcnR5SW5mbygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhO1xuXHR9LFxuXHRfZ2V0SWdub3JlZFByb3BlcnRpZXM6IGZ1bmN0aW9uIChhRmlsdGVyUHJvcGVydGllc01ldGFkYXRhOiBhbnksIG1FbnRpdHlQcm9wZXJ0aWVzOiBhbnkpIHtcblx0XHRjb25zdCBhSWdub3JlUHJvcGVydGllczogYW55ID0gW107XG5cdFx0YUZpbHRlclByb3BlcnRpZXNNZXRhZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChvSUZpbHRlclByb3BlcnR5OiBhbnkpIHtcblx0XHRcdGNvbnN0IHNJRmlsdGVyUHJvcGVydHlOYW1lID0gb0lGaWx0ZXJQcm9wZXJ0eS5uYW1lO1xuXHRcdFx0Y29uc3QgbUVudGl0eVByb3BlcnRpZXNDdXJyZW50ID0gbUVudGl0eVByb3BlcnRpZXNbc0lGaWx0ZXJQcm9wZXJ0eU5hbWVdO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRtRW50aXR5UHJvcGVydGllc0N1cnJlbnQgJiZcblx0XHRcdFx0KCFtRW50aXR5UHJvcGVydGllc0N1cnJlbnRbXCJoYXNQcm9wZXJ0eVwiXSB8fFxuXHRcdFx0XHRcdChtRW50aXR5UHJvcGVydGllc0N1cnJlbnRbXCJoYXNQcm9wZXJ0eVwiXSAmJiBvSUZpbHRlclByb3BlcnR5LmRhdGFUeXBlICE9PSBtRW50aXR5UHJvcGVydGllc0N1cnJlbnQuZGF0YVR5cGUpKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGFJZ25vcmVQcm9wZXJ0aWVzLnB1c2goc0lGaWx0ZXJQcm9wZXJ0eU5hbWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBhSWdub3JlUHJvcGVydGllcztcblx0fSxcblx0Z2V0RmlsdGVyczogZnVuY3Rpb24gKGZpbHRlckJhcjogRmlsdGVyQmFyKSB7XG5cdFx0Y29uc3QgeyBmaWx0ZXJzLCBzZWFyY2ggfSA9IHRoaXMuZ2V0RmlsdGVySW5mbyhmaWx0ZXJCYXIpO1xuXG5cdFx0cmV0dXJuIHsgZmlsdGVycywgc2VhcmNoIH07XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9GaWx0ZXJVdGlscztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFnQ0EsTUFBTUEsWUFBWSxHQUFHO0lBQ3BCQyxTQUFTLEVBQUUsVUFBVUMsUUFBYSxFQUFFO01BQ25DLE1BQU1DLFFBQVEsR0FBR0gsWUFBWSxDQUFDSSxhQUFhLENBQUNGLFFBQVEsQ0FBQyxDQUFDRyxPQUFPO01BQzdELE9BQU9GLFFBQVEsQ0FBQ0csTUFBTSxHQUFHLElBQUlDLE1BQU0sQ0FBQ1AsWUFBWSxDQUFDSSxhQUFhLENBQUNGLFFBQVEsQ0FBQyxDQUFDRyxPQUFPLEVBQUUsS0FBSyxDQUFDLEdBQUdHLFNBQVM7SUFDckcsQ0FBQztJQUNEQyxjQUFjLEVBQUUsVUFBVUMsWUFBb0IsRUFBRUMsZ0JBQWtDLEVBQUVDLFVBQXNCLEVBQUU7TUFDM0csT0FBT0Msa0JBQWtCLENBQUNKLGNBQWMsQ0FBQ0MsWUFBWSxFQUFFQyxnQkFBZ0IsRUFBRUMsVUFBVSxDQUFDO0lBQ3JGLENBQUM7SUFDREUsZ0JBQWdCLEVBQUUsVUFBVUMsaUJBQXNCLEVBQUVKLGdCQUFrQyxFQUFFO01BQ3ZGLElBQUlLLGFBQWE7TUFDakIsTUFBTUMsV0FBZ0IsR0FBRyxDQUFDLENBQUM7TUFDM0IsTUFBTUMsdUJBQXVCLEdBQUdQLGdCQUFnQixDQUFDUSxzQkFBc0IsQ0FBQ0osaUJBQWlCLENBQUNLLGNBQWMsQ0FBQztNQUN6RyxNQUFNQyxvQkFBb0IsR0FBR0gsdUJBQXVCLENBQUNJLHNCQUFzQixFQUFFLENBQUNDLFlBQVk7TUFDMUYsTUFBTUMsV0FBVyxHQUFHWCxrQkFBa0IsQ0FBQ1ksZUFBZSxDQUFDSixvQkFBb0IsQ0FBQztNQUM1RUwsYUFBYSxHQUFHSCxrQkFBa0IsQ0FBQ2EsaUJBQWlCLENBQUNmLGdCQUFnQixFQUFFSSxpQkFBaUIsRUFBRVMs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