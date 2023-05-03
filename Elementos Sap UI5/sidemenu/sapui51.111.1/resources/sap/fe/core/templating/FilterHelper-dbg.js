/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/type/EDM", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enum/ConditionValidated"], function (Log, EDM, Condition, ConditionValidated) {
  "use strict";

  var _exports = {};
  var isTypeFilterable = EDM.isTypeFilterable;
  const oExcludeMap = {
    Contains: "NotContains",
    StartsWith: "NotStartsWith",
    EndsWith: "NotEndsWith",
    Empty: "NotEmpty",
    NotEmpty: "Empty",
    LE: "NOTLE",
    GE: "NOTGE",
    LT: "NOTLT",
    GT: "NOTGT",
    BT: "NOTBT",
    NE: "EQ",
    EQ: "NE"
  };
  function _getDateTimeOffsetCompliantValue(sValue) {
    let oValue;
    if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)) {
      oValue = sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)[0];
    } else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)) {
      oValue = `${sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0]}+0000`;
    } else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)) {
      oValue = `${sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0]}T00:00:00+0000`;
    } else if (sValue.indexOf("Z") === sValue.length - 1) {
      oValue = `${sValue.split("Z")[0]}+0100`;
    } else {
      oValue = undefined;
    }
    return oValue;
  }
  _exports._getDateTimeOffsetCompliantValue = _getDateTimeOffsetCompliantValue;
  function _getDateCompliantValue(sValue) {
    return sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/) ? sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0] : sValue.match(/^(\d{8})/) && sValue.match(/^(\d{8})/)[0];
  }

  /**
   * Method to get the compliant value type based on the data type.
   *
   * @param  sValue Raw value
   * @param  sType The property type
   * @returns Value to be propagated to the condition.
   */
  _exports._getDateCompliantValue = _getDateCompliantValue;
  function getTypeCompliantValue(sValue, sType) {
    let oValue;
    if (!isTypeFilterable(sType)) {
      return undefined;
    }
    oValue = sValue;
    switch (sType) {
      case "Edm.Boolean":
        if (typeof sValue === "boolean") {
          oValue = sValue;
        } else {
          oValue = sValue === "true" || (sValue === "false" ? false : undefined);
        }
        break;
      case "Edm.Double":
      case "Edm.Single":
        oValue = isNaN(sValue) ? undefined : parseFloat(sValue);
        break;
      case "Edm.Byte":
      case "Edm.Int16":
      case "Edm.Int32":
      case "Edm.SByte":
        oValue = isNaN(sValue) ? undefined : parseInt(sValue, 10);
        break;
      case "Edm.Date":
        oValue = _getDateCompliantValue(sValue);
        break;
      case "Edm.DateTimeOffset":
        oValue = _getDateTimeOffsetCompliantValue(sValue);
        break;
      case "Edm.TimeOfDay":
        oValue = sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/) ? sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0] : undefined;
        break;
      default:
    }
    return oValue === null ? undefined : oValue;
  }

  /**
   * Method to create a condition.
   *
   * @param  sOption Operator to be used.
   * @param  oV1 Lower value
   * @param  oV2 Higher value
   * @param sSign
   * @returns Condition to be created
   */
  _exports.getTypeCompliantValue = getTypeCompliantValue;
  function resolveConditionValues(sOption, oV1, oV2, sSign) {
    let oValue = oV1,
      oValue2,
      sInternalOperation;
    const oCondition = {};
    oCondition.values = [];
    oCondition.isEmpty = null;
    if (oV1 === undefined || oV1 === null) {
      return undefined;
    }
    switch (sOption) {
      case "CP":
        sInternalOperation = "Contains";
        if (oValue) {
          const nIndexOf = oValue.indexOf("*");
          const nLastIndex = oValue.lastIndexOf("*");

          // only when there are '*' at all
          if (nIndexOf > -1) {
            if (nIndexOf === 0 && nLastIndex !== oValue.length - 1) {
              sInternalOperation = "EndsWith";
              oValue = oValue.substring(1, oValue.length);
            } else if (nIndexOf !== 0 && nLastIndex === oValue.length - 1) {
              sInternalOperation = "StartsWith";
              oValue = oValue.substring(0, oValue.length - 1);
            } else {
              oValue = oValue.substring(1, oValue.length - 1);
            }
          } else {
            Log.warning("Contains Option cannot be used without '*'.");
            return undefined;
          }
        }
        break;
      case "EQ":
        sInternalOperation = oV1 === "" ? "Empty" : sOption;
        break;
      case "NE":
        sInternalOperation = oV1 === "" ? "NotEmpty" : sOption;
        break;
      case "BT":
        if (oV2 === undefined || oV2 === null) {
          return;
        }
        oValue2 = oV2;
        sInternalOperation = sOption;
        break;
      case "LE":
      case "GE":
      case "GT":
      case "LT":
        sInternalOperation = sOption;
        break;
      default:
        Log.warning(`Selection Option is not supported : '${sOption}'`);
        return undefined;
    }
    if (sSign === "E") {
      sInternalOperation = oExcludeMap[sInternalOperation];
    }
    oCondition.operator = sInternalOperation;
    if (sInternalOperation !== "Empty") {
      oCondition.values.push(oValue);
      if (oValue2) {
        oCondition.values.push(oValue2);
      }
    }
    return oCondition;
  }

  /* Method to get the Range property from the Selection Option */
  _exports.resolveConditionValues = resolveConditionValues;
  function getRangeProperty(sProperty) {
    return sProperty.indexOf("/") > 0 ? sProperty.split("/")[1] : sProperty;
  }
  _exports.getRangeProperty = getRangeProperty;
  function _buildConditionsFromSelectionRanges(Ranges, oProperty, sPropertyName, getCustomConditions) {
    const aConditions = [];
    Ranges === null || Ranges === void 0 ? void 0 : Ranges.forEach(Range => {
      const oCondition = getCustomConditions ? getCustomConditions(Range, oProperty, sPropertyName) : getConditions(Range, oProperty);
      if (oCondition) {
        aConditions.push(oCondition);
      }
    });
    return aConditions;
  }
  function _getProperty(propertyName, metaModel, entitySetPath) {
    const lastSlashIndex = propertyName.lastIndexOf("/");
    const navigationPath = lastSlashIndex > -1 ? propertyName.substring(0, propertyName.lastIndexOf("/") + 1) : "";
    const collection = metaModel.getObject(`${entitySetPath}/${navigationPath}`);
    return collection === null || collection === void 0 ? void 0 : collection[propertyName.replace(navigationPath, "")];
  }
  function _buildFiltersConditionsFromSelectOption(selectOption, metaModel, entitySetPath, getCustomConditions) {
    const propertyName = selectOption.PropertyName,
      filterConditions = {},
      propertyPath = propertyName.value || propertyName.$PropertyPath,
      Ranges = selectOption.Ranges;
    const targetProperty = _getProperty(propertyPath, metaModel, entitySetPath);
    if (targetProperty) {
      const conditions = _buildConditionsFromSelectionRanges(Ranges, targetProperty, propertyPath, getCustomConditions);
      if (conditions.length) {
        filterConditions[propertyPath] = (filterConditions[propertyPath] || []).concat(conditions);
      }
    }
    return filterConditions;
  }
  function getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, selectionVariant, getCustomConditions) {
    let oFilterConditions = {};
    if (!selectionVariant) {
      return oFilterConditions;
    }
    const aSelectOptions = selectionVariant.SelectOptions,
      aParameters = selectionVariant.Parameters;
    aSelectOptions === null || aSelectOptions === void 0 ? void 0 : aSelectOptions.forEach(selectOption => {
      const propertyName = selectOption.PropertyName,
        sPropertyName = propertyName.value || propertyName.$PropertyPath;
      if (Object.keys(oFilterConditions).includes(sPropertyName)) {
        oFilterConditions[sPropertyName] = oFilterConditions[sPropertyName].concat(_buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions)[sPropertyName]);
      } else {
        oFilterConditions = {
          ...oFilterConditions,
          ..._buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions)
        };
      }
    });
    aParameters === null || aParameters === void 0 ? void 0 : aParameters.forEach(parameter => {
      const sPropertyPath = parameter.PropertyName.value || parameter.PropertyName.$PropertyPath;
      const oCondition = getCustomConditions ? {
        operator: "EQ",
        value1: parameter.PropertyValue,
        value2: null,
        path: sPropertyPath,
        isParameter: true
      } : {
        operator: "EQ",
        values: [parameter.PropertyValue],
        isEmpty: null,
        validated: ConditionValidated.Validated,
        isParameter: true
      };
      oFilterConditions[sPropertyPath] = [oCondition];
    });
    return oFilterConditions;
  }
  _exports.getFiltersConditionsFromSelectionVariant = getFiltersConditionsFromSelectionVariant;
  function getConditions(Range, oValidProperty) {
    let oCondition;
    const sign = Range.Sign ? getRangeProperty(Range.Sign) : undefined;
    const sOption = Range.Option ? getRangeProperty(Range.Option) : undefined;
    const oValue1 = getTypeCompliantValue(Range.Low, oValidProperty.$Type || oValidProperty.type);
    const oValue2 = Range.High ? getTypeCompliantValue(Range.High, oValidProperty.$Type || oValidProperty.type) : undefined;
    const oConditionValues = resolveConditionValues(sOption, oValue1, oValue2, sign);
    if (oConditionValues) {
      oCondition = Condition.createCondition(oConditionValues.operator, oConditionValues.values, null, null, ConditionValidated.Validated);
    }
    return oCondition;
  }
  _exports.getConditions = getConditions;
  const getDefaultValueFilters = function (oContext, properties) {
    const filterConditions = {};
    const entitySetPath = oContext.getInterface(1).getPath(),
      oMetaModel = oContext.getInterface(1).getModel();
    if (properties) {
      for (const key in properties) {
        const defaultFilterValue = oMetaModel.getObject(`${entitySetPath}/${key}@com.sap.vocabularies.Common.v1.FilterDefaultValue`);
        if (defaultFilterValue !== undefined) {
          const PropertyName = key;
          filterConditions[PropertyName] = [Condition.createCondition("EQ", [defaultFilterValue], null, null, ConditionValidated.Validated)];
        }
      }
    }
    return filterConditions;
  };
  const getDefaultSemanticDateFilters = function (oContext, properties, defaultSemanticDates) {
    const filterConditions = {};
    const oInterface = oContext.getInterface(1);
    const oMetaModel = oInterface.getModel();
    const sEntityTypePath = oInterface.getPath();
    for (const key in defaultSemanticDates) {
      if (defaultSemanticDates[key][0]) {
        const aPropertyPathParts = key.split("::");
        let sPath = "";
        const iPropertyPathLength = aPropertyPathParts.length;
        const sNavigationPath = aPropertyPathParts.slice(0, aPropertyPathParts.length - 1).join("/");
        const sProperty = aPropertyPathParts[iPropertyPathLength - 1];
        if (sNavigationPath) {
          //Create Proper Condition Path e.g. _Item*/Property or _Item/Property
          const vProperty = oMetaModel.getObject(sEntityTypePath + "/" + sNavigationPath);
          if (vProperty.$kind === "NavigationProperty" && vProperty.$isCollection) {
            sPath += `${sNavigationPath}*/`;
          } else if (vProperty.$kind === "NavigationProperty") {
            sPath += `${sNavigationPath}/`;
          }
        }
        sPath += sProperty;
        const operatorParamsArr = "values" in defaultSemanticDates[key][0] ? defaultSemanticDates[key][0].values : [];
        filterConditions[sPath] = [Condition.createCondition(defaultSemanticDates[key][0].operator, operatorParamsArr, null, null, null)];
      }
    }
    return filterConditions;
  };
  function getEditStatusFilter() {
    const ofilterConditions = {};
    ofilterConditions["$editState"] = [Condition.createCondition("DRAFT_EDIT_STATE", ["ALL"], null, null, ConditionValidated.Validated)];
    return ofilterConditions;
  }
  function getFilterConditions(oContext, filterConditions) {
    var _filterConditions, _filterConditions2;
    let editStateFilter;
    const entitySetPath = oContext.getInterface(1).getPath(),
      oMetaModel = oContext.getInterface(1).getModel(),
      entityTypeAnnotations = oMetaModel.getObject(`${entitySetPath}@`),
      entityTypeProperties = oMetaModel.getObject(`${entitySetPath}/`);
    if (entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] || entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftNode"]) {
      editStateFilter = getEditStatusFilter();
    }
    const selectionVariant = (_filterConditions = filterConditions) === null || _filterConditions === void 0 ? void 0 : _filterConditions.selectionVariant;
    const defaultSemanticDates = ((_filterConditions2 = filterConditions) === null || _filterConditions2 === void 0 ? void 0 : _filterConditions2.defaultSemanticDates) || {};
    const defaultFilters = getDefaultValueFilters(oContext, entityTypeProperties);
    const defaultSemanticDateFilters = getDefaultSemanticDateFilters(oContext, entityTypeProperties, defaultSemanticDates);
    if (selectionVariant) {
      filterConditions = getFiltersConditionsFromSelectionVariant(entitySetPath, oMetaModel, selectionVariant);
    } else if (defaultFilters) {
      filterConditions = defaultFilters;
    }
    if (defaultSemanticDateFilters) {
      // only for semantic date:
      // 1. value from manifest get merged with SV
      // 2. manifest value is given preference when there is same semantic date property in SV and manifest
      filterConditions = {
        ...filterConditions,
        ...defaultSemanticDateFilters
      };
    }
    if (editStateFilter) {
      filterConditions = {
        ...filterConditions,
        ...editStateFilter
      };
    }
    return Object.keys(filterConditions).length > 0 ? JSON.stringify(filterConditions).replace(/([\{\}])/g, "\\$1") : undefined;
  }
  _exports.getFilterConditions = getFilterConditions;
  getFilterConditions.requiresIContext = true;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvRXhjbHVkZU1hcCIsIkNvbnRhaW5zIiwiU3RhcnRzV2l0aCIsIkVuZHNXaXRoIiwiRW1wdHkiLCJOb3RFbXB0eSIsIkxFIiwiR0UiLCJMVCIsIkdUIiwiQlQiLCJORSIsIkVRIiwiX2dldERhdGVUaW1lT2Zmc2V0Q29tcGxpYW50VmFsdWUiLCJzVmFsdWUiLCJvVmFsdWUiLCJtYXRjaCIsImluZGV4T2YiLCJsZW5ndGgiLCJzcGxpdCIsInVuZGVmaW5lZCIsIl9nZXREYXRlQ29tcGxpYW50VmFsdWUiLCJnZXRUeXBlQ29tcGxpYW50VmFsdWUiLCJzVHlwZSIsImlzVHlwZUZpbHRlcmFibGUiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJwYXJzZUludCIsInJlc29sdmVDb25kaXRpb25WYWx1ZXMiLCJzT3B0aW9uIiwib1YxIiwib1YyIiwic1NpZ24iLCJvVmFsdWUyIiwic0ludGVybmFsT3BlcmF0aW9uIiwib0NvbmRpdGlvbiIsInZhbHVlcyIsImlzRW1wdHkiLCJuSW5kZXhPZiIsIm5MYXN0SW5kZXgiLCJsYXN0SW5kZXhPZiIsInN1YnN0cmluZyIsIkxvZyIsIndhcm5pbmciLCJvcGVyYXRvciIsInB1c2giLCJnZXRSYW5nZVByb3BlcnR5Iiwic1Byb3BlcnR5IiwiX2J1aWxkQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25SYW5nZXMiLCJSYW5nZXMiLCJvUHJvcGVydHkiLCJzUHJvcGVydHlOYW1lIiwiZ2V0Q3VzdG9tQ29uZGl0aW9ucyIsImFDb25kaXRpb25zIiwiZm9yRWFjaCIsIlJhbmdlIiwiZ2V0Q29uZGl0aW9ucyIsIl9nZXRQcm9wZXJ0eSIsInByb3BlcnR5TmFtZSIsIm1ldGFNb2RlbCIsImVudGl0eVNldFBhdGgiLCJsYXN0U2xhc2hJbmRleCIsIm5hdmlnYXRpb25QYXRoIiwiY29sbGVjdGlvbiIsImdldE9iamVjdCIsInJlcGxhY2UiLCJfYnVpbGRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3RPcHRpb24iLCJzZWxlY3RPcHRpb24iLCJQcm9wZXJ0eU5hbWUiLCJmaWx0ZXJDb25kaXRpb25zIiwicHJvcGVydHlQYXRoIiwidmFsdWUiLCIkUHJvcGVydHlQYXRoIiwidGFyZ2V0UHJvcGVydHkiLCJjb25kaXRpb25zIiwiY29uY2F0IiwiZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudCIsInNFbnRpdHlTZXRQYXRoIiwib01ldGFNb2RlbCIsInNlbGVjdGlvblZhcmlhbnQiLCJvRmlsdGVyQ29uZGl0aW9ucyIsImFTZWxlY3RPcHRpb25zIiwiU2VsZWN0T3B0aW9ucyIsImFQYXJhbWV0ZXJzIiwiUGFyYW1ldGVycyIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInBhcmFtZXRlciIsInNQcm9wZXJ0eVBhdGgiLCJ2YWx1ZTEiLCJQcm9wZXJ0eVZhbHVlIiwidmFsdWUyIiwicGF0aCIsImlzUGFyYW1ldGVyIiwidmFsaWRhdGVkIiwiQ29uZGl0aW9uVmFsaWRhdGVkIiwiVmFsaWRhdGVkIiwib1ZhbGlkUHJvcGVydHkiLCJzaWduIiwiU2lnbiIsIk9wdGlvbiIsIm9WYWx1ZTEiLCJMb3ciLCIkVHlwZSIsInR5cGUiLCJIaWdoIiwib0NvbmRpdGlvblZhbHVlcyIsIkNvbmRpdGlvbiIsImNyZWF0ZUNvbmRpdGlvbiIsImdldERlZmF1bHRWYWx1ZUZpbHRlcnMiLCJvQ29udGV4dCIsInByb3BlcnRpZXMiLCJnZXRJbnRlcmZhY2UiLCJnZXRQYXRoIiwiZ2V0TW9kZWwiLCJrZXkiLCJkZWZhdWx0RmlsdGVyVmFsdWUiLCJnZXREZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyIsImRlZmF1bHRTZW1hbnRpY0RhdGVzIiwib0ludGVyZmFjZSIsInNFbnRpdHlUeXBlUGF0aCIsImFQcm9wZXJ0eVBhdGhQYXJ0cyIsInNQYXRoIiwiaVByb3BlcnR5UGF0aExlbmd0aCIsInNOYXZpZ2F0aW9uUGF0aCIsInNsaWNlIiwiam9pbiIsInZQcm9wZXJ0eSIsIiRraW5kIiwiJGlzQ29sbGVjdGlvbiIsIm9wZXJhdG9yUGFyYW1zQXJyIiwiZ2V0RWRpdFN0YXR1c0ZpbHRlciIsIm9maWx0ZXJDb25kaXRpb25zIiwiZ2V0RmlsdGVyQ29uZGl0aW9ucyIsImVkaXRTdGF0ZUZpbHRlciIsImVudGl0eVR5cGVBbm5vdGF0aW9ucyIsImVudGl0eVR5cGVQcm9wZXJ0aWVzIiwiZGVmYXVsdEZpbHRlcnMiLCJkZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWx0ZXJIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTZWxlY3Rpb25SYW5nZVR5cGVUeXBlcywgU2VsZWN0aW9uVmFyaWFudFR5cGVUeXBlcywgU2VsZWN0T3B0aW9uVHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgRGVmYXVsdFR5cGVGb3JFZG1UeXBlLCBpc1R5cGVGaWx0ZXJhYmxlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvRURNXCI7XG5pbXBvcnQgdHlwZSB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBDb25kaXRpb24gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IENvbmRpdGlvblZhbGlkYXRlZCBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0NvbmRpdGlvblZhbGlkYXRlZFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuZXhwb3J0IHR5cGUgRmlsdGVyQ29uZGl0aW9ucyA9IHtcblx0b3BlcmF0b3I6IHN0cmluZztcblx0dmFsdWVzOiBBcnJheTxzdHJpbmc+O1xuXHRpc0VtcHR5PzogYm9vbGVhbiB8IG51bGw7XG5cdHZhbGlkYXRlZD86IHN0cmluZztcbn07XG5cbmNvbnN0IG9FeGNsdWRlTWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge1xuXHRDb250YWluczogXCJOb3RDb250YWluc1wiLFxuXHRTdGFydHNXaXRoOiBcIk5vdFN0YXJ0c1dpdGhcIixcblx0RW5kc1dpdGg6IFwiTm90RW5kc1dpdGhcIixcblx0RW1wdHk6IFwiTm90RW1wdHlcIixcblx0Tm90RW1wdHk6IFwiRW1wdHlcIixcblx0TEU6IFwiTk9UTEVcIixcblx0R0U6IFwiTk9UR0VcIixcblx0TFQ6IFwiTk9UTFRcIixcblx0R1Q6IFwiTk9UR1RcIixcblx0QlQ6IFwiTk9UQlRcIixcblx0TkU6IFwiRVFcIixcblx0RVE6IFwiTkVcIlxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIF9nZXREYXRlVGltZU9mZnNldENvbXBsaWFudFZhbHVlKHNWYWx1ZTogYW55KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IG9WYWx1ZTtcblx0aWYgKHNWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KVQoXFxkezEsMn0pOihcXGR7MSwyfSk6KFxcZHsxLDJ9KVxcKyhcXGR7MSw0fSkvKSkge1xuXHRcdG9WYWx1ZSA9IHNWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KVQoXFxkezEsMn0pOihcXGR7MSwyfSk6KFxcZHsxLDJ9KVxcKyhcXGR7MSw0fSkvKVswXTtcblx0fSBlbHNlIGlmIChzVmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezEsMn0pLShcXGR7MSwyfSlUKFxcZHsxLDJ9KTooXFxkezEsMn0pOihcXGR7MSwyfSkvKSkge1xuXHRcdG9WYWx1ZSA9IGAke3NWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KVQoXFxkezEsMn0pOihcXGR7MSwyfSk6KFxcZHsxLDJ9KS8pWzBdfSswMDAwYDtcblx0fSBlbHNlIGlmIChzVmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezEsMn0pLShcXGR7MSwyfSkvKSkge1xuXHRcdG9WYWx1ZSA9IGAke3NWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KS8pWzBdfVQwMDowMDowMCswMDAwYDtcblx0fSBlbHNlIGlmIChzVmFsdWUuaW5kZXhPZihcIlpcIikgPT09IHNWYWx1ZS5sZW5ndGggLSAxKSB7XG5cdFx0b1ZhbHVlID0gYCR7c1ZhbHVlLnNwbGl0KFwiWlwiKVswXX0rMDEwMGA7XG5cdH0gZWxzZSB7XG5cdFx0b1ZhbHVlID0gdW5kZWZpbmVkO1xuXHR9XG5cdHJldHVybiBvVmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZ2V0RGF0ZUNvbXBsaWFudFZhbHVlKHNWYWx1ZTogYW55KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIHNWYWx1ZS5tYXRjaCgvXihcXGR7NH0pLShcXGR7MSwyfSktKFxcZHsxLDJ9KS8pXG5cdFx0PyBzVmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezEsMn0pLShcXGR7MSwyfSkvKVswXVxuXHRcdDogc1ZhbHVlLm1hdGNoKC9eKFxcZHs4fSkvKSAmJiBzVmFsdWUubWF0Y2goL14oXFxkezh9KS8pWzBdO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBnZXQgdGhlIGNvbXBsaWFudCB2YWx1ZSB0eXBlIGJhc2VkIG9uIHRoZSBkYXRhIHR5cGUuXG4gKlxuICogQHBhcmFtICBzVmFsdWUgUmF3IHZhbHVlXG4gKiBAcGFyYW0gIHNUeXBlIFRoZSBwcm9wZXJ0eSB0eXBlXG4gKiBAcmV0dXJucyBWYWx1ZSB0byBiZSBwcm9wYWdhdGVkIHRvIHRoZSBjb25kaXRpb24uXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVDb21wbGlhbnRWYWx1ZShzVmFsdWU6IGFueSwgc1R5cGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGxldCBvVmFsdWU7XG5cdGlmICghaXNUeXBlRmlsdGVyYWJsZShzVHlwZSBhcyBrZXlvZiB0eXBlb2YgRGVmYXVsdFR5cGVGb3JFZG1UeXBlKSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0b1ZhbHVlID0gc1ZhbHVlO1xuXHRzd2l0Y2ggKHNUeXBlKSB7XG5cdFx0Y2FzZSBcIkVkbS5Cb29sZWFuXCI6XG5cdFx0XHRpZiAodHlwZW9mIHNWYWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0b1ZhbHVlID0gc1ZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1ZhbHVlID0gc1ZhbHVlID09PSBcInRydWVcIiB8fCAoc1ZhbHVlID09PSBcImZhbHNlXCIgPyBmYWxzZSA6IHVuZGVmaW5lZCk7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiRWRtLkRvdWJsZVwiOlxuXHRcdGNhc2UgXCJFZG0uU2luZ2xlXCI6XG5cdFx0XHRvVmFsdWUgPSBpc05hTihzVmFsdWUpID8gdW5kZWZpbmVkIDogcGFyc2VGbG9hdChzVmFsdWUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkVkbS5CeXRlXCI6XG5cdFx0Y2FzZSBcIkVkbS5JbnQxNlwiOlxuXHRcdGNhc2UgXCJFZG0uSW50MzJcIjpcblx0XHRjYXNlIFwiRWRtLlNCeXRlXCI6XG5cdFx0XHRvVmFsdWUgPSBpc05hTihzVmFsdWUpID8gdW5kZWZpbmVkIDogcGFyc2VJbnQoc1ZhbHVlLCAxMCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiRWRtLkRhdGVcIjpcblx0XHRcdG9WYWx1ZSA9IF9nZXREYXRlQ29tcGxpYW50VmFsdWUoc1ZhbHVlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjpcblx0XHRcdG9WYWx1ZSA9IF9nZXREYXRlVGltZU9mZnNldENvbXBsaWFudFZhbHVlKHNWYWx1ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiRWRtLlRpbWVPZkRheVwiOlxuXHRcdFx0b1ZhbHVlID0gc1ZhbHVlLm1hdGNoKC8oXFxkezEsMn0pOihcXGR7MSwyfSk6KFxcZHsxLDJ9KS8pID8gc1ZhbHVlLm1hdGNoKC8oXFxkezEsMn0pOihcXGR7MSwyfSk6KFxcZHsxLDJ9KS8pWzBdIDogdW5kZWZpbmVkO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0fVxuXG5cdHJldHVybiBvVmFsdWUgPT09IG51bGwgPyB1bmRlZmluZWQgOiBvVmFsdWU7XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIGNyZWF0ZSBhIGNvbmRpdGlvbi5cbiAqXG4gKiBAcGFyYW0gIHNPcHRpb24gT3BlcmF0b3IgdG8gYmUgdXNlZC5cbiAqIEBwYXJhbSAgb1YxIExvd2VyIHZhbHVlXG4gKiBAcGFyYW0gIG9WMiBIaWdoZXIgdmFsdWVcbiAqIEBwYXJhbSBzU2lnblxuICogQHJldHVybnMgQ29uZGl0aW9uIHRvIGJlIGNyZWF0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVDb25kaXRpb25WYWx1ZXMoc09wdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkLCBvVjE6IGFueSwgb1YyOiBhbnksIHNTaWduOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblx0bGV0IG9WYWx1ZSA9IG9WMSxcblx0XHRvVmFsdWUyLFxuXHRcdHNJbnRlcm5hbE9wZXJhdGlvbjogYW55O1xuXHRjb25zdCBvQ29uZGl0aW9uOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+ID0ge307XG5cdG9Db25kaXRpb24udmFsdWVzID0gW107XG5cdG9Db25kaXRpb24uaXNFbXB0eSA9IG51bGwgYXMgYW55O1xuXHRpZiAob1YxID09PSB1bmRlZmluZWQgfHwgb1YxID09PSBudWxsKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdHN3aXRjaCAoc09wdGlvbikge1xuXHRcdGNhc2UgXCJDUFwiOlxuXHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gXCJDb250YWluc1wiO1xuXHRcdFx0aWYgKG9WYWx1ZSkge1xuXHRcdFx0XHRjb25zdCBuSW5kZXhPZiA9IG9WYWx1ZS5pbmRleE9mKFwiKlwiKTtcblx0XHRcdFx0Y29uc3Qgbkxhc3RJbmRleCA9IG9WYWx1ZS5sYXN0SW5kZXhPZihcIipcIik7XG5cblx0XHRcdFx0Ly8gb25seSB3aGVuIHRoZXJlIGFyZSAnKicgYXQgYWxsXG5cdFx0XHRcdGlmIChuSW5kZXhPZiA+IC0xKSB7XG5cdFx0XHRcdFx0aWYgKG5JbmRleE9mID09PSAwICYmIG5MYXN0SW5kZXggIT09IG9WYWx1ZS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0XHRzSW50ZXJuYWxPcGVyYXRpb24gPSBcIkVuZHNXaXRoXCI7XG5cdFx0XHRcdFx0XHRvVmFsdWUgPSBvVmFsdWUuc3Vic3RyaW5nKDEsIG9WYWx1ZS5sZW5ndGgpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAobkluZGV4T2YgIT09IDAgJiYgbkxhc3RJbmRleCA9PT0gb1ZhbHVlLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0XHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IFwiU3RhcnRzV2l0aFwiO1xuXHRcdFx0XHRcdFx0b1ZhbHVlID0gb1ZhbHVlLnN1YnN0cmluZygwLCBvVmFsdWUubGVuZ3RoIC0gMSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9WYWx1ZSA9IG9WYWx1ZS5zdWJzdHJpbmcoMSwgb1ZhbHVlLmxlbmd0aCAtIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRMb2cud2FybmluZyhcIkNvbnRhaW5zIE9wdGlvbiBjYW5ub3QgYmUgdXNlZCB3aXRob3V0ICcqJy5cIik7XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkVRXCI6XG5cdFx0XHRzSW50ZXJuYWxPcGVyYXRpb24gPSBvVjEgPT09IFwiXCIgPyBcIkVtcHR5XCIgOiBzT3B0aW9uO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIk5FXCI6XG5cdFx0XHRzSW50ZXJuYWxPcGVyYXRpb24gPSBvVjEgPT09IFwiXCIgPyBcIk5vdEVtcHR5XCIgOiBzT3B0aW9uO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkJUXCI6XG5cdFx0XHRpZiAob1YyID09PSB1bmRlZmluZWQgfHwgb1YyID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdG9WYWx1ZTIgPSBvVjI7XG5cdFx0XHRzSW50ZXJuYWxPcGVyYXRpb24gPSBzT3B0aW9uO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkxFXCI6XG5cdFx0Y2FzZSBcIkdFXCI6XG5cdFx0Y2FzZSBcIkdUXCI6XG5cdFx0Y2FzZSBcIkxUXCI6XG5cdFx0XHRzSW50ZXJuYWxPcGVyYXRpb24gPSBzT3B0aW9uO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdExvZy53YXJuaW5nKGBTZWxlY3Rpb24gT3B0aW9uIGlzIG5vdCBzdXBwb3J0ZWQgOiAnJHtzT3B0aW9ufSdgKTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0aWYgKHNTaWduID09PSBcIkVcIikge1xuXHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IG9FeGNsdWRlTWFwW3NJbnRlcm5hbE9wZXJhdGlvbl07XG5cdH1cblx0b0NvbmRpdGlvbi5vcGVyYXRvciA9IHNJbnRlcm5hbE9wZXJhdGlvbjtcblx0aWYgKHNJbnRlcm5hbE9wZXJhdGlvbiAhPT0gXCJFbXB0eVwiKSB7XG5cdFx0b0NvbmRpdGlvbi52YWx1ZXMucHVzaChvVmFsdWUpO1xuXHRcdGlmIChvVmFsdWUyKSB7XG5cdFx0XHRvQ29uZGl0aW9uLnZhbHVlcy5wdXNoKG9WYWx1ZTIpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb0NvbmRpdGlvbjtcbn1cblxuLyogTWV0aG9kIHRvIGdldCB0aGUgUmFuZ2UgcHJvcGVydHkgZnJvbSB0aGUgU2VsZWN0aW9uIE9wdGlvbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmdlUHJvcGVydHkoc1Byb3BlcnR5OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gc1Byb3BlcnR5LmluZGV4T2YoXCIvXCIpID4gMCA/IHNQcm9wZXJ0eS5zcGxpdChcIi9cIilbMV0gOiBzUHJvcGVydHk7XG59XG5cbmZ1bmN0aW9uIF9idWlsZENvbmRpdGlvbnNGcm9tU2VsZWN0aW9uUmFuZ2VzKFxuXHRSYW5nZXM6IFNlbGVjdGlvblJhbmdlVHlwZVR5cGVzW10sXG5cdG9Qcm9wZXJ0eTogUmVjb3JkPHN0cmluZywgb2JqZWN0Pixcblx0c1Byb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRnZXRDdXN0b21Db25kaXRpb25zPzogRnVuY3Rpb25cbik6IGFueVtdIHtcblx0Y29uc3QgYUNvbmRpdGlvbnM6IGFueVtdID0gW107XG5cdFJhbmdlcz8uZm9yRWFjaCgoUmFuZ2U6IGFueSkgPT4ge1xuXHRcdGNvbnN0IG9Db25kaXRpb24gPSBnZXRDdXN0b21Db25kaXRpb25zID8gZ2V0Q3VzdG9tQ29uZGl0aW9ucyhSYW5nZSwgb1Byb3BlcnR5LCBzUHJvcGVydHlOYW1lKSA6IGdldENvbmRpdGlvbnMoUmFuZ2UsIG9Qcm9wZXJ0eSk7XG5cdFx0aWYgKG9Db25kaXRpb24pIHtcblx0XHRcdGFDb25kaXRpb25zLnB1c2gob0NvbmRpdGlvbik7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIGFDb25kaXRpb25zO1xufVxuXG5mdW5jdGlvbiBfZ2V0UHJvcGVydHkocHJvcGVydHlOYW1lOiBzdHJpbmcsIG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIGVudGl0eVNldFBhdGg6IHN0cmluZyk6IFJlY29yZDxzdHJpbmcsIG9iamVjdD4ge1xuXHRjb25zdCBsYXN0U2xhc2hJbmRleCA9IHByb3BlcnR5TmFtZS5sYXN0SW5kZXhPZihcIi9cIik7XG5cdGNvbnN0IG5hdmlnYXRpb25QYXRoID0gbGFzdFNsYXNoSW5kZXggPiAtMSA/IHByb3BlcnR5TmFtZS5zdWJzdHJpbmcoMCwgcHJvcGVydHlOYW1lLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpIDogXCJcIjtcblx0Y29uc3QgY29sbGVjdGlvbiA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH0vJHtuYXZpZ2F0aW9uUGF0aH1gKTtcblx0cmV0dXJuIGNvbGxlY3Rpb24/Lltwcm9wZXJ0eU5hbWUucmVwbGFjZShuYXZpZ2F0aW9uUGF0aCwgXCJcIildO1xufVxuXG5mdW5jdGlvbiBfYnVpbGRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3RPcHRpb24oXG5cdHNlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uVHlwZSxcblx0bWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0ZW50aXR5U2V0UGF0aDogc3RyaW5nLFxuXHRnZXRDdXN0b21Db25kaXRpb25zPzogRnVuY3Rpb25cbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRjb25zdCBwcm9wZXJ0eU5hbWU6IGFueSA9IHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUsXG5cdFx0ZmlsdGVyQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiA9IHt9LFxuXHRcdHByb3BlcnR5UGF0aDogc3RyaW5nID0gcHJvcGVydHlOYW1lLnZhbHVlIHx8IHByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoLFxuXHRcdFJhbmdlczogU2VsZWN0aW9uUmFuZ2VUeXBlVHlwZXNbXSA9IHNlbGVjdE9wdGlvbi5SYW5nZXM7XG5cdGNvbnN0IHRhcmdldFByb3BlcnR5ID0gX2dldFByb3BlcnR5KHByb3BlcnR5UGF0aCwgbWV0YU1vZGVsLCBlbnRpdHlTZXRQYXRoKTtcblx0aWYgKHRhcmdldFByb3BlcnR5KSB7XG5cdFx0Y29uc3QgY29uZGl0aW9uczogYW55W10gPSBfYnVpbGRDb25kaXRpb25zRnJvbVNlbGVjdGlvblJhbmdlcyhSYW5nZXMsIHRhcmdldFByb3BlcnR5LCBwcm9wZXJ0eVBhdGgsIGdldEN1c3RvbUNvbmRpdGlvbnMpO1xuXHRcdGlmIChjb25kaXRpb25zLmxlbmd0aCkge1xuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uc1twcm9wZXJ0eVBhdGhdID0gKGZpbHRlckNvbmRpdGlvbnNbcHJvcGVydHlQYXRoXSB8fCBbXSkuY29uY2F0KGNvbmRpdGlvbnMpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmlsdGVyQ29uZGl0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdGlvblZhcmlhbnQoXG5cdHNFbnRpdHlTZXRQYXRoOiBzdHJpbmcsXG5cdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRzZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50VHlwZVR5cGVzLFxuXHRnZXRDdXN0b21Db25kaXRpb25zPzogRnVuY3Rpb25cbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRsZXQgb0ZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fTtcblx0aWYgKCFzZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0cmV0dXJuIG9GaWx0ZXJDb25kaXRpb25zO1xuXHR9XG5cdGNvbnN0IGFTZWxlY3RPcHRpb25zID0gc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zLFxuXHRcdGFQYXJhbWV0ZXJzID0gc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzO1xuXHRhU2VsZWN0T3B0aW9ucz8uZm9yRWFjaCgoc2VsZWN0T3B0aW9uOiBTZWxlY3RPcHRpb25UeXBlKSA9PiB7XG5cdFx0Y29uc3QgcHJvcGVydHlOYW1lOiBhbnkgPSBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lLFxuXHRcdFx0c1Byb3BlcnR5TmFtZTogc3RyaW5nID0gcHJvcGVydHlOYW1lLnZhbHVlIHx8IHByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoO1xuXHRcdGlmIChPYmplY3Qua2V5cyhvRmlsdGVyQ29uZGl0aW9ucykuaW5jbHVkZXMoc1Byb3BlcnR5TmFtZSkpIHtcblx0XHRcdG9GaWx0ZXJDb25kaXRpb25zW3NQcm9wZXJ0eU5hbWVdID0gb0ZpbHRlckNvbmRpdGlvbnNbc1Byb3BlcnR5TmFtZV0uY29uY2F0KFxuXHRcdFx0XHRfYnVpbGRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3RPcHRpb24oc2VsZWN0T3B0aW9uLCBvTWV0YU1vZGVsLCBzRW50aXR5U2V0UGF0aCwgZ2V0Q3VzdG9tQ29uZGl0aW9ucylbc1Byb3BlcnR5TmFtZV1cblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9GaWx0ZXJDb25kaXRpb25zID0ge1xuXHRcdFx0XHQuLi5vRmlsdGVyQ29uZGl0aW9ucyxcblx0XHRcdFx0Li4uX2J1aWxkRmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0T3B0aW9uKHNlbGVjdE9wdGlvbiwgb01ldGFNb2RlbCwgc0VudGl0eVNldFBhdGgsIGdldEN1c3RvbUNvbmRpdGlvbnMpXG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG5cdGFQYXJhbWV0ZXJzPy5mb3JFYWNoKChwYXJhbWV0ZXI6IGFueSkgPT4ge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBwYXJhbWV0ZXIuUHJvcGVydHlOYW1lLnZhbHVlIHx8IHBhcmFtZXRlci5Qcm9wZXJ0eU5hbWUuJFByb3BlcnR5UGF0aDtcblx0XHRjb25zdCBvQ29uZGl0aW9uOiBhbnkgPSBnZXRDdXN0b21Db25kaXRpb25zXG5cdFx0XHQ/IHsgb3BlcmF0b3I6IFwiRVFcIiwgdmFsdWUxOiBwYXJhbWV0ZXIuUHJvcGVydHlWYWx1ZSwgdmFsdWUyOiBudWxsLCBwYXRoOiBzUHJvcGVydHlQYXRoLCBpc1BhcmFtZXRlcjogdHJ1ZSB9XG5cdFx0XHQ6IHtcblx0XHRcdFx0XHRvcGVyYXRvcjogXCJFUVwiLFxuXHRcdFx0XHRcdHZhbHVlczogW3BhcmFtZXRlci5Qcm9wZXJ0eVZhbHVlXSxcblx0XHRcdFx0XHRpc0VtcHR5OiBudWxsLFxuXHRcdFx0XHRcdHZhbGlkYXRlZDogQ29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZCxcblx0XHRcdFx0XHRpc1BhcmFtZXRlcjogdHJ1ZVxuXHRcdFx0ICB9O1xuXHRcdG9GaWx0ZXJDb25kaXRpb25zW3NQcm9wZXJ0eVBhdGhdID0gW29Db25kaXRpb25dO1xuXHR9KTtcblxuXHRyZXR1cm4gb0ZpbHRlckNvbmRpdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25kaXRpb25zKFJhbmdlOiBhbnksIG9WYWxpZFByb3BlcnR5OiBhbnkpOiBDb25kaXRpb25PYmplY3QgfCB1bmRlZmluZWQge1xuXHRsZXQgb0NvbmRpdGlvbjtcblx0Y29uc3Qgc2lnbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gUmFuZ2UuU2lnbiA/IGdldFJhbmdlUHJvcGVydHkoUmFuZ2UuU2lnbikgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IHNPcHRpb246IHN0cmluZyB8IHVuZGVmaW5lZCA9IFJhbmdlLk9wdGlvbiA/IGdldFJhbmdlUHJvcGVydHkoUmFuZ2UuT3B0aW9uKSA6IHVuZGVmaW5lZDtcblx0Y29uc3Qgb1ZhbHVlMTogYW55ID0gZ2V0VHlwZUNvbXBsaWFudFZhbHVlKFJhbmdlLkxvdywgb1ZhbGlkUHJvcGVydHkuJFR5cGUgfHwgb1ZhbGlkUHJvcGVydHkudHlwZSk7XG5cdGNvbnN0IG9WYWx1ZTI6IGFueSA9IFJhbmdlLkhpZ2ggPyBnZXRUeXBlQ29tcGxpYW50VmFsdWUoUmFuZ2UuSGlnaCwgb1ZhbGlkUHJvcGVydHkuJFR5cGUgfHwgb1ZhbGlkUHJvcGVydHkudHlwZSkgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IG9Db25kaXRpb25WYWx1ZXMgPSByZXNvbHZlQ29uZGl0aW9uVmFsdWVzKHNPcHRpb24sIG9WYWx1ZTEsIG9WYWx1ZTIsIHNpZ24pIGFzIGFueTtcblx0aWYgKG9Db25kaXRpb25WYWx1ZXMpIHtcblx0XHRvQ29uZGl0aW9uID0gQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcblx0XHRcdG9Db25kaXRpb25WYWx1ZXMub3BlcmF0b3IsXG5cdFx0XHRvQ29uZGl0aW9uVmFsdWVzLnZhbHVlcyxcblx0XHRcdG51bGwsXG5cdFx0XHRudWxsLFxuXHRcdFx0Q29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZFxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIG9Db25kaXRpb247XG59XG5cbmNvbnN0IGdldERlZmF1bHRWYWx1ZUZpbHRlcnMgPSBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSwgcHJvcGVydGllczogYW55KTogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiB7XG5cdGNvbnN0IGZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fTtcblx0Y29uc3QgZW50aXR5U2V0UGF0aCA9IG9Db250ZXh0LmdldEludGVyZmFjZSgxKS5nZXRQYXRoKCksXG5cdFx0b01ldGFNb2RlbCA9IG9Db250ZXh0LmdldEludGVyZmFjZSgxKS5nZXRNb2RlbCgpO1xuXHRpZiAocHJvcGVydGllcykge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIHByb3BlcnRpZXMpIHtcblx0XHRcdGNvbnN0IGRlZmF1bHRGaWx0ZXJWYWx1ZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9LyR7a2V5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmlsdGVyRGVmYXVsdFZhbHVlYCk7XG5cdFx0XHRpZiAoZGVmYXVsdEZpbHRlclZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y29uc3QgUHJvcGVydHlOYW1lID0ga2V5O1xuXHRcdFx0XHRmaWx0ZXJDb25kaXRpb25zW1Byb3BlcnR5TmFtZV0gPSBbXG5cdFx0XHRcdFx0Q29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcIkVRXCIsIFtkZWZhdWx0RmlsdGVyVmFsdWVdLCBudWxsLCBudWxsLCBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkKSBhcyBGaWx0ZXJDb25kaXRpb25zXG5cdFx0XHRcdF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmaWx0ZXJDb25kaXRpb25zO1xufTtcblxuY29uc3QgZ2V0RGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMgPSBmdW5jdGlvbiAoXG5cdG9Db250ZXh0OiBhbnksXG5cdHByb3BlcnRpZXM6IGFueSxcblx0ZGVmYXVsdFNlbWFudGljRGF0ZXM6IGFueVxuKTogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiB7XG5cdGNvbnN0IGZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fTtcblx0Y29uc3Qgb0ludGVyZmFjZSA9IG9Db250ZXh0LmdldEludGVyZmFjZSgxKTtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblx0Y29uc3Qgc0VudGl0eVR5cGVQYXRoID0gb0ludGVyZmFjZS5nZXRQYXRoKCk7XG5cdGZvciAoY29uc3Qga2V5IGluIGRlZmF1bHRTZW1hbnRpY0RhdGVzKSB7XG5cdFx0aWYgKGRlZmF1bHRTZW1hbnRpY0RhdGVzW2tleV1bMF0pIHtcblx0XHRcdGNvbnN0IGFQcm9wZXJ0eVBhdGhQYXJ0cyA9IGtleS5zcGxpdChcIjo6XCIpO1xuXHRcdFx0bGV0IHNQYXRoID0gXCJcIjtcblx0XHRcdGNvbnN0IGlQcm9wZXJ0eVBhdGhMZW5ndGggPSBhUHJvcGVydHlQYXRoUGFydHMubGVuZ3RoO1xuXHRcdFx0Y29uc3Qgc05hdmlnYXRpb25QYXRoID0gYVByb3BlcnR5UGF0aFBhcnRzLnNsaWNlKDAsIGFQcm9wZXJ0eVBhdGhQYXJ0cy5sZW5ndGggLSAxKS5qb2luKFwiL1wiKTtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eSA9IGFQcm9wZXJ0eVBhdGhQYXJ0c1tpUHJvcGVydHlQYXRoTGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAoc05hdmlnYXRpb25QYXRoKSB7XG5cdFx0XHRcdC8vQ3JlYXRlIFByb3BlciBDb25kaXRpb24gUGF0aCBlLmcuIF9JdGVtKi9Qcm9wZXJ0eSBvciBfSXRlbS9Qcm9wZXJ0eVxuXHRcdFx0XHRjb25zdCB2UHJvcGVydHkgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzRW50aXR5VHlwZVBhdGggKyBcIi9cIiArIHNOYXZpZ2F0aW9uUGF0aCk7XG5cdFx0XHRcdGlmICh2UHJvcGVydHkuJGtpbmQgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIgJiYgdlByb3BlcnR5LiRpc0NvbGxlY3Rpb24pIHtcblx0XHRcdFx0XHRzUGF0aCArPSBgJHtzTmF2aWdhdGlvblBhdGh9Ki9gO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHZQcm9wZXJ0eS4ka2luZCA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdHNQYXRoICs9IGAke3NOYXZpZ2F0aW9uUGF0aH0vYDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0c1BhdGggKz0gc1Byb3BlcnR5O1xuXHRcdFx0Y29uc3Qgb3BlcmF0b3JQYXJhbXNBcnIgPSBcInZhbHVlc1wiIGluIGRlZmF1bHRTZW1hbnRpY0RhdGVzW2tleV1bMF0gPyBkZWZhdWx0U2VtYW50aWNEYXRlc1trZXldWzBdLnZhbHVlcyA6IFtdO1xuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uc1tzUGF0aF0gPSBbXG5cdFx0XHRcdENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oZGVmYXVsdFNlbWFudGljRGF0ZXNba2V5XVswXS5vcGVyYXRvciwgb3BlcmF0b3JQYXJhbXNBcnIsIG51bGwsIG51bGwsIG51bGwpIGFzIEZpbHRlckNvbmRpdGlvbnNcblx0XHRcdF07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmaWx0ZXJDb25kaXRpb25zO1xufTtcblxuZnVuY3Rpb24gZ2V0RWRpdFN0YXR1c0ZpbHRlcigpOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+IHtcblx0Y29uc3Qgb2ZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fTtcblx0b2ZpbHRlckNvbmRpdGlvbnNbXCIkZWRpdFN0YXRlXCJdID0gW1xuXHRcdENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oXCJEUkFGVF9FRElUX1NUQVRFXCIsIFtcIkFMTFwiXSwgbnVsbCwgbnVsbCwgQ29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZCkgYXMgRmlsdGVyQ29uZGl0aW9uc1xuXHRdO1xuXHRyZXR1cm4gb2ZpbHRlckNvbmRpdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWx0ZXJDb25kaXRpb25zKG9Db250ZXh0OiBhbnksIGZpbHRlckNvbmRpdGlvbnM6IGFueSk6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRsZXQgZWRpdFN0YXRlRmlsdGVyO1xuXHRjb25zdCBlbnRpdHlTZXRQYXRoID0gb0NvbnRleHQuZ2V0SW50ZXJmYWNlKDEpLmdldFBhdGgoKSxcblx0XHRvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0SW50ZXJmYWNlKDEpLmdldE1vZGVsKCksXG5cdFx0ZW50aXR5VHlwZUFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH1AYCksXG5cdFx0ZW50aXR5VHlwZVByb3BlcnRpZXMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofS9gKTtcblx0aWYgKFxuXHRcdGVudGl0eVR5cGVBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdIHx8XG5cdFx0ZW50aXR5VHlwZUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVcIl1cblx0KSB7XG5cdFx0ZWRpdFN0YXRlRmlsdGVyID0gZ2V0RWRpdFN0YXR1c0ZpbHRlcigpO1xuXHR9XG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBmaWx0ZXJDb25kaXRpb25zPy5zZWxlY3Rpb25WYXJpYW50O1xuXHRjb25zdCBkZWZhdWx0U2VtYW50aWNEYXRlcyA9IGZpbHRlckNvbmRpdGlvbnM/LmRlZmF1bHRTZW1hbnRpY0RhdGVzIHx8IHt9O1xuXHRjb25zdCBkZWZhdWx0RmlsdGVycyA9IGdldERlZmF1bHRWYWx1ZUZpbHRlcnMob0NvbnRleHQsIGVudGl0eVR5cGVQcm9wZXJ0aWVzKTtcblx0Y29uc3QgZGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMgPSBnZXREZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyhvQ29udGV4dCwgZW50aXR5VHlwZVByb3BlcnRpZXMsIGRlZmF1bHRTZW1hbnRpY0RhdGVzKTtcblx0aWYgKHNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRmaWx0ZXJDb25kaXRpb25zID0gZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudChlbnRpdHlTZXRQYXRoLCBvTWV0YU1vZGVsLCBzZWxlY3Rpb25WYXJpYW50KTtcblx0fSBlbHNlIGlmIChkZWZhdWx0RmlsdGVycykge1xuXHRcdGZpbHRlckNvbmRpdGlvbnMgPSBkZWZhdWx0RmlsdGVycztcblx0fVxuXHRpZiAoZGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMpIHtcblx0XHQvLyBvbmx5IGZvciBzZW1hbnRpYyBkYXRlOlxuXHRcdC8vIDEuIHZhbHVlIGZyb20gbWFuaWZlc3QgZ2V0IG1lcmdlZCB3aXRoIFNWXG5cdFx0Ly8gMi4gbWFuaWZlc3QgdmFsdWUgaXMgZ2l2ZW4gcHJlZmVyZW5jZSB3aGVuIHRoZXJlIGlzIHNhbWUgc2VtYW50aWMgZGF0ZSBwcm9wZXJ0eSBpbiBTViBhbmQgbWFuaWZlc3Rcblx0XHRmaWx0ZXJDb25kaXRpb25zID0geyAuLi5maWx0ZXJDb25kaXRpb25zLCAuLi5kZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyB9O1xuXHR9XG5cdGlmIChlZGl0U3RhdGVGaWx0ZXIpIHtcblx0XHRmaWx0ZXJDb25kaXRpb25zID0geyAuLi5maWx0ZXJDb25kaXRpb25zLCAuLi5lZGl0U3RhdGVGaWx0ZXIgfTtcblx0fVxuXHRyZXR1cm4gKE9iamVjdC5rZXlzKGZpbHRlckNvbmRpdGlvbnMpLmxlbmd0aCA+IDAgPyBKU09OLnN0cmluZ2lmeShmaWx0ZXJDb25kaXRpb25zKS5yZXBsYWNlKC8oW1xce1xcfV0pL2csIFwiXFxcXCQxXCIpIDogdW5kZWZpbmVkKSBhcyBhbnk7XG59XG5cbmdldEZpbHRlckNvbmRpdGlvbnMucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQWNBLE1BQU1BLFdBQWdDLEdBQUc7SUFDeENDLFFBQVEsRUFBRSxhQUFhO0lBQ3ZCQyxVQUFVLEVBQUUsZUFBZTtJQUMzQkMsUUFBUSxFQUFFLGFBQWE7SUFDdkJDLEtBQUssRUFBRSxVQUFVO0lBQ2pCQyxRQUFRLEVBQUUsT0FBTztJQUNqQkMsRUFBRSxFQUFFLE9BQU87SUFDWEMsRUFBRSxFQUFFLE9BQU87SUFDWEMsRUFBRSxFQUFFLE9BQU87SUFDWEMsRUFBRSxFQUFFLE9BQU87SUFDWEMsRUFBRSxFQUFFLE9BQU87SUFDWEMsRUFBRSxFQUFFLElBQUk7SUFDUkMsRUFBRSxFQUFFO0VBQ0wsQ0FBQztFQUVNLFNBQVNDLGdDQUFnQyxDQUFDQyxNQUFXLEVBQXNCO0lBQ2pGLElBQUlDLE1BQU07SUFDVixJQUFJRCxNQUFNLENBQUNFLEtBQUssQ0FBQyx1RUFBdUUsQ0FBQyxFQUFFO01BQzFGRCxNQUFNLEdBQUdELE1BQU0sQ0FBQ0UsS0FBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xHLENBQUMsTUFBTSxJQUFJRixNQUFNLENBQUNFLEtBQUssQ0FBQyw0REFBNEQsQ0FBQyxFQUFFO01BQ3RGRCxNQUFNLEdBQUksR0FBRUQsTUFBTSxDQUFDRSxLQUFLLENBQUMsNERBQTRELENBQUMsQ0FBQyxDQUFDLENBQUUsT0FBTTtJQUNqRyxDQUFDLE1BQU0sSUFBSUYsTUFBTSxDQUFDRSxLQUFLLENBQUMsOEJBQThCLENBQUMsRUFBRTtNQUN4REQsTUFBTSxHQUFJLEdBQUVELE1BQU0sQ0FBQ0UsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFFLGdCQUFlO0lBQzVFLENBQUMsTUFB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