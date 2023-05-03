/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  /**
   * Utitlity class for metadata interpretation inside delegate classes.
   *
   * @private
   * @since 1.62
   */
  const ODataMetaModelUtil = {
    fetchAllAnnotations(oMetaModel, sEntityPath) {
      const oCtx = oMetaModel.getMetaContext(sEntityPath);
      return oMetaModel.requestObject("@", oCtx).then(function (mAnnos) {
        return mAnnos;
      });
    },
    /**
     * The mapping of all annotations of a given entity set.
     *
     * @param mAnnos A list of annotations of the entity set
     * @returns A map to the custom aggregates keyed by their qualifiers
     */
    getAllCustomAggregates(mAnnos) {
      const mCustomAggregates = {};
      let sAnno;
      for (const sAnnoKey in mAnnos) {
        if (sAnnoKey.startsWith("@Org.OData.Aggregation.V1.CustomAggregate")) {
          sAnno = sAnnoKey.replace("@Org.OData.Aggregation.V1.CustomAggregate#", "");
          const aAnno = sAnno.split("@");
          if (aAnno.length == 2) {
            if (!mCustomAggregates[aAnno[0]]) {
              mCustomAggregates[aAnno[0]] = {};
            }
            //inner annotation that is not part of 	Validation.AggregatableTerms
            if (aAnno[1] == "Org.OData.Aggregation.V1.ContextDefiningProperties") {
              mCustomAggregates[aAnno[0]].contextDefiningProperties = mAnnos[sAnnoKey];
            }
            if (aAnno[1] == "com.sap.vocabularies.Common.v1.Label") {
              mCustomAggregates[aAnno[0]].label = mAnnos[sAnnoKey];
            }
          } else if (aAnno.length == 1) {
            mCustomAggregates[aAnno[0]] = {
              name: aAnno[0],
              propertyPath: aAnno[0],
              label: `Custom Aggregate (${sAnno})`,
              sortable: true,
              sortOrder: "both",
              custom: true
            };
          }
        }
      }
      return mCustomAggregates;
    },
    getAllAggregatableProperties(mAnnos) {
      const mAggregatableProperties = {};
      let aProperties, oProperty;
      if (mAnnos["@com.sap.vocabularies.Analytics.v1.AggregatedProperties"]) {
        aProperties = mAnnos["@com.sap.vocabularies.Analytics.v1.AggregatedProperties"];
        for (let i = 0; i < aProperties.length; i++) {
          oProperty = aProperties[i];
          mAggregatableProperties[oProperty.Name] = {
            name: oProperty.Name,
            propertyPath: oProperty.AggregatableProperty.$PropertyPath,
            aggregationMethod: oProperty.AggregationMethod,
            label: oProperty["@com.sap.vocabularies.Common.v1.Label"] || `Aggregatable property (${oProperty.Name})`,
            sortable: true,
            sortOrder: "both",
            custom: false
          };
        }
      }
      return mAggregatableProperties;
    },
    /**
     * Retrieve and order all data points by their property and qualifier.
     *
     * @param mAnnos A named map of annotations from a given entity set
     * @returns A keyed mapped ordered by
     * <ul>
     *     <li> The properties value path </li>
     *     <li> The qualifier of the data point <(li>
     * </ul>
     */
    getAllDataPoints(mAnnos) {
      const mDataPoints = {};
      for (const sAnnoKey in mAnnos) {
        if (sAnnoKey.startsWith("@com.sap.vocabularies.UI.v1.DataPoint")) {
          const sQualifier = sAnnoKey.replace("@com.sap.vocabularies.UI.v1.DataPoint#", "");
          const sValue = mAnnos[sAnnoKey].Value.$Path;
          mDataPoints[sValue] = mDataPoints[sValue] || {};
          mDataPoints[sValue][sQualifier] = ODataMetaModelUtil.createDataPointProperty(mAnnos[sAnnoKey]);
        }
      }
      return mDataPoints;
    },
    /**
     * Format the data point as a JSON object.
     *
     * @param oDataPointAnno
     * @returns The formatted json object
     */
    createDataPointProperty(oDataPointAnno) {
      const oDataPoint = {};
      if (oDataPointAnno.TargetValue) {
        oDataPoint.targetValue = oDataPointAnno.TargetValue.$Path;
      }
      if (oDataPointAnno.ForeCastValue) {
        oDataPoint.foreCastValue = oDataPointAnno.ForeCastValue.$Path;
      }
      let oCriticality = null;
      if (oDataPointAnno.Criticality) {
        if (oDataPointAnno.Criticality.$Path) {
          //will be an aggregated property or custom aggregate
          oCriticality = {
            Calculated: oDataPointAnno.Criticality.$Path
          };
        } else {
          oCriticality = {
            Static: oDataPointAnno.Criticality.$EnumMember.replace("com.sap.vocabularies.UI.v1.CriticalityType/", "")
          };
        }
      } else if (oDataPointAnno.CriticalityCalculation) {
        const oThresholds = {};
        const bConstant = ODataMetaModelUtil._buildThresholds(oThresholds, oDataPointAnno.CriticalityCalculation);
        if (bConstant) {
          oCriticality = {
            ConstantThresholds: oThresholds
          };
        } else {
          oCriticality = {
            DynamicThresholds: oThresholds
          };
        }
      }
      if (oCriticality) {
        oDataPoint.criticality = oCriticality;
      }
      return oDataPoint;
    },
    /**
     * Checks whether the thresholds are dynamic or constant.
     *
     * @param oThresholds The threshold skeleton
     * @param oCriticalityCalculation The UI.DataPoint.CriticalityCalculation annotation
     * @returns `true` if the threshold should be supplied as ConstantThresholds, <code>false</code> if the threshold should
     * be supplied as DynamicThresholds
     * @private
     */
    _buildThresholds(oThresholds, oCriticalityCalculation) {
      const aKeys = ["AcceptanceRangeLowValue", "AcceptanceRangeHighValue", "ToleranceRangeLowValue", "ToleranceRangeHighValue", "DeviationRangeLowValue", "DeviationRangeHighValue"];
      let bConstant = true,
        sKey,
        i,
        j;
      oThresholds.ImprovementDirection = oCriticalityCalculation.ImprovementDirection.$EnumMember.replace("com.sap.vocabularies.UI.v1.ImprovementDirectionType/", "");
      const oDynamicThresholds = {
        oneSupplied: false,
        usedMeasures: []
        // combination to check whether at least one is supplied
      };

      const oConstantThresholds = {
        oneSupplied: false
        // combination to check whether at least one is supplied
      };

      for (i = 0; i < aKeys.length; i++) {
        sKey = aKeys[i];
        oDynamicThresholds[sKey] = oCriticalityCalculation[sKey] ? oCriticalityCalculation[sKey].$Path : undefined;
        oDynamicThresholds.oneSupplied = oDynamicThresholds.oneSupplied || oDynamicThresholds[sKey];
        if (!oDynamicThresholds.oneSupplied) {
          // only consider in case no dynamic threshold is supplied
          oConstantThresholds[sKey] = oCriticalityCalculation[sKey];
          oConstantThresholds.oneSupplied = oConstantThresholds.oneSupplied || oConstantThresholds[sKey];
        } else if (oDynamicThresholds[sKey]) {
          oDynamicThresholds.usedMeasures.push(oDynamicThresholds[sKey]);
        }
      }

      // dynamic definition shall overrule constant definition
      if (oDynamicThresholds.oneSupplied) {
        bConstant = false;
        for (i = 0; i < aKeys.length; i++) {
          if (oDynamicThresholds[aKeys[i]]) {
            oThresholds[aKeys[i]] = oDynamicThresholds[aKeys[i]];
          }
        }
        oThresholds.usedMeasures = oDynamicThresholds.usedMeasures;
      } else {
        let oAggregationLevel;
        oThresholds.AggregationLevels = [];

        // check if at least one static value is supplied
        if (oConstantThresholds.oneSupplied) {
          // add one entry in the aggregation level
          oAggregationLevel = {
            VisibleDimensions: null
          };
          for (i = 0; i < aKeys.length; i++) {
            if (oConstantThresholds[aKeys[i]]) {
              oAggregationLevel[aKeys[i]] = oConstantThresholds[aKeys[i]];
            }
          }
          oThresholds.AggregationLevels.push(oAggregationLevel);
        }

        // further check for ConstantThresholds
        if (oCriticalityCalculation.ConstantThresholds && oCriticalityCalculation.ConstantThresholds.length > 0) {
          for (i = 0; i < oCriticalityCalculation.ConstantThresholds.length; i++) {
            const oAggregationLevelInfo = oCriticalityCalculation.ConstantThresholds[i];
            const aVisibleDimensions = oAggregationLevelInfo.AggregationLevel ? [] : null;
            if (oAggregationLevelInfo.AggregationLevel && oAggregationLevelInfo.AggregationLevel.length > 0) {
              for (j = 0; j < oAggregationLevelInfo.AggregationLevel.length; j++) {
                aVisibleDimensions.push(oAggregationLevelInfo.AggregationLevel[j].$PropertyPath);
              }
            }
            oAggregationLevel = {
              VisibleDimensions: aVisibleDimensions
            };
            for (j = 0; j < aKeys.length; j++) {
              const nValue = oAggregationLevelInfo[aKeys[j]];
              if (nValue) {
                oAggregationLevel[aKeys[j]] = nValue;
              }
            }
            oThresholds.AggregationLevels.push(oAggregationLevel);
          }
        }
      }
      return bConstant;
    },
    /**
     * Determines the sorting information from the restriction annotation.
     *
     * @param entitySetAnnotations EntitySet or collection annotations with the sort restrictions annotation
     * @returns An object containing the sort restriction information
     */
    getSortRestrictionsInfo(entitySetAnnotations) {
      const sortRestrictionsInfo = {
        sortable: true,
        propertyInfo: {}
      };
      const sortRestrictions = entitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"];
      if (!sortRestrictions) {
        return sortRestrictionsInfo;
      }
      sortRestrictionsInfo.sortable = sortRestrictions.Sortable ?? true;
      for (const propertyItem of sortRestrictions.NonSortableProperties || []) {
        const propertyName = propertyItem.$PropertyPath;
        sortRestrictionsInfo.propertyInfo[propertyName] = {
          sortable: false
        };
      }
      for (const propertyItem of sortRestrictions.AscendingOnlyProperties || []) {
        const propertyName = propertyItem.$PropertyPath;
        sortRestrictionsInfo.propertyInfo[propertyName] = {
          sortable: true,
          sortDirection: "asc" // not used, yet
        };
      }

      for (const propertyItem of sortRestrictions.DescendingOnlyProperties || []) {
        const propertyName = propertyItem.$PropertyPath;
        sortRestrictionsInfo.propertyInfo[propertyName] = {
          sortable: true,
          sortDirection: "desc" // not used, yet
        };
      }

      return sortRestrictionsInfo;
    },
    /**
     * Determines the filter information based on the filter restrictions annoation.
     *
     * @param oFilterRestrictions The filter restrictions annotation
     * @returns An object containing the filter restriction information
     */
    getFilterRestrictionsInfo(oFilterRestrictions) {
      let i, sPropertyName;
      const oFilterRestrictionsInfo = {
        filterable: true,
        propertyInfo: {}
      };
      if (oFilterRestrictions) {
        oFilterRestrictionsInfo.filterable = oFilterRestrictions.Filterable != null ? oFilterRestrictions.Filterable : true;
        oFilterRestrictionsInfo.requiresFilter = oFilterRestrictions.RequiresFilter != null ? oFilterRestrictions.RequiresFilter : false;

        //Hierarchical Case
        oFilterRestrictionsInfo.requiredProperties = [];
        if (oFilterRestrictionsInfo.RequiredProperties) {
          for (i = 0; i < oFilterRestrictions.RequiredProperties.length; i++) {
            sPropertyName = oFilterRestrictions.RequiredProperties[i].$PropertyPath;
            oFilterRestrictionsInfo.requiredProperties.push(sPropertyName);
          }
        }
        if (oFilterRestrictions.NonFilterableProperties) {
          for (i = 0; i < oFilterRestrictions.NonFilterableProperties.length; i++) {
            sPropertyName = oFilterRestrictions.NonFilterableProperties[i].$PropertyPath;
            oFilterRestrictionsInfo[sPropertyName] = {
              filterable: false
            };
          }
        }
        if (oFilterRestrictions.FilterExpressionRestrictions) {
          //TBD
          for (i = 0; i < oFilterRestrictions.FilterExpressionRestrictions.length; i++) {
            sPropertyName = oFilterRestrictions.FilterExpressionRestrictions[i].$PropertyPath;
            oFilterRestrictionsInfo[sPropertyName] = {
              filterable: true,
              allowedExpressions: oFilterRestrictions.FilterExpressionRestrictions[i].AllowedExpressions
            };
          }
        }
      }
      return oFilterRestrictionsInfo;
    },
    /**
     * Provides the information if the FilterExpression is a multiValue Filter Expression.
     *
     * @param sFilterExpression The FilterExpressionType
     * @returns A boolean value wether it is a multiValue Filter Expression or not
     */
    isMultiValueFilterExpression(sFilterExpression) {
      let bIsMultiValue = true;

      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression

      switch (sFilterExpression) {
        case "SearchExpression":
        case "SingleRange":
        case "SingleValue":
          bIsMultiValue = false;
          break;
        default:
          break;
      }
      return bIsMultiValue;
    },
    /**
     *
     * @param oProperty The entity property
     * @param oFilterRestrictionInfo The filter restrictions
     */
    addFilterInfoForProperty(oProperty, oFilterRestrictionInfo) {
      const oPropertyInfo = oFilterRestrictionInfo[oProperty.name];
      oProperty.filterable = oFilterRestrictionInfo.filterable && oPropertyInfo ? oPropertyInfo.filterable : true;
      if (oProperty.filterable) {
        oProperty.allowedExpressions = oPropertyInfo ? oPropertyInfo.allowedExpressions : null;
      }
    },
    fetchCalendarTag(oMetaModel, oCtx) {
      const COMMON = "@com.sap.vocabularies.Common.v1.";
      return Promise.all([oMetaModel.requestObject(`${COMMON}IsCalendarYear`, oCtx), oMetaModel.requestObject(`${COMMON}IsCalendarHalfyear`, oCtx), oMetaModel.requestObject(`${COMMON}IsCalendarQuarter`, oCtx), oMetaModel.requestObject(`${COMMON}IsCalendarMonth`, oCtx), oMetaModel.requestObject(`${COMMON}IsCalendarWeek`, oCtx), oMetaModel.requestObject(`${COMMON}IsDayOfCalendarMonth`, oCtx), oMetaModel.requestObject(`${COMMON}IsDayOfCalendarYear`, oCtx), oMetaModel.requestObject(`${COMMON}IsCalendarYearHalfyear`, oCtx), oMetaModel.requestObject(`${COMMON}IsCalendarYearQuarter`, oCtx), oMetaModel.requestObject(`${COMMON}IsCalendarYearMonth`, oCtx), oMetaModel.requestObject(`${COMMON}IsCalendarYearWeek`, oCtx), oMetaModel.requestObject(`${COMMON}IsCalendarDate`, oCtx)]).then(function (aTag) {
        if (aTag[0]) {
          return "year";
        }
        if (aTag[1]) {
          return "halfYear";
        }
        if (aTag[2]) {
          return "quarter";
        }
        if (aTag[3]) {
          return "month";
        }
        if (aTag[4]) {
          return "week";
        }
        if (aTag[5]) {
          return "dayOfMonth";
        }
        if (aTag[6]) {
          return "dayOfYear";
        }
        if (aTag[7]) {
          return "yearHalfYear";
        }
        if (aTag[8]) {
          return "yearQuarter";
        }
        if (aTag[9]) {
          return "yearMonth";
        }
        if (aTag[10]) {
          return "yearWeek";
        }
        if (aTag[11]) {
          return "date";
        }
        return undefined;
      });
    },
    fetchFiscalTag(oMetaModel, oCtx) {
      const COMMON = "@com.sap.vocabularies.Common.v1.";
      return Promise.all([oMetaModel.requestObject(`${COMMON}IsFiscalYear`, oCtx), oMetaModel.requestObject(`${COMMON}IsFiscalPeriod`, oCtx), oMetaModel.requestObject(`${COMMON}IsFiscalYearPeriod`, oCtx), oMetaModel.requestObject(`${COMMON}IsFiscalQuarter`, oCtx), oMetaModel.requestObject(`${COMMON}IsFiscalYearQuarter`, oCtx), oMetaModel.requestObject(`${COMMON}IsFiscalWeek`, oCtx), oMetaModel.requestObject(`${COMMON}IsFiscalYearWeek`, oCtx), oMetaModel.requestObject(`${COMMON}IsDayOfFiscalYear`, oCtx), oMetaModel.requestObject(`${COMMON}IsFiscalYearVariant`, oCtx)]).then(function (aTag) {
        if (aTag[0]) {
          return "year";
        }
        if (aTag[1]) {
          return "period";
        }
        if (aTag[2]) {
          return "yearPeriod";
        }
        if (aTag[3]) {
          return "quarter";
        }
        if (aTag[4]) {
          return "yearQuarter";
        }
        if (aTag[5]) {
          return "week";
        }
        if (aTag[6]) {
          return "yearWeek";
        }
        if (aTag[7]) {
          return "dayOfYear";
        }
        if (aTag[8]) {
          return "yearVariant";
        }
        return undefined;
      });
    },
    fetchCriticality(oMetaModel, oCtx) {
      const UI = "@com.sap.vocabularies.UI.v1";
      return oMetaModel.requestObject(`${UI}.ValueCriticality`, oCtx).then(function (aValueCriticality) {
        let oCriticality, oValueCriticality;
        if (aValueCriticality) {
          oCriticality = {
            VeryPositive: [],
            Positive: [],
            Critical: [],
            VeryNegative: [],
            Negative: [],
            Neutral: []
          };
          for (let i = 0; i < aValueCriticality.length; i++) {
            oValueCriticality = aValueCriticality[i];
            if (oValueCriticality.Criticality.$EnumMember.endsWith("VeryPositive")) {
              oCriticality.VeryPositive.push(oValueCriticality.Value);
            } else if (oValueCriticality.Criticality.$EnumMember.endsWith("Positive")) {
              oCriticality.Positive.push(oValueCriticality.Value);
            } else if (oValueCriticality.Criticality.$EnumMember.endsWith("Critical")) {
              oCriticality.Critical.push(oValueCriticality.Value);
            } else if (oValueCriticality.Criticality.$EnumMember.endsWith("VeryNegative")) {
              oCriticality.VeryNegative.push(oValueCriticality.Value);
            } else if (oValueCriticality.Criticality.$EnumMember.endsWith("Negative")) {
              oCriticality.Negative.push(oValueCriticality.Value);
            } else {
              oCriticality.Neutral.push(oValueCriticality.Value);
            }
          }
          for (const sKey in oCriticality) {
            if (oCriticality[sKey].length == 0) {
              delete oCriticality[sKey];
            }
          }
        }
        return oCriticality;
      });
    }
  };
  return ODataMetaModelUtil;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPRGF0YU1ldGFNb2RlbFV0aWwiLCJmZXRjaEFsbEFubm90YXRpb25zIiwib01ldGFNb2RlbCIsInNFbnRpdHlQYXRoIiwib0N0eCIsImdldE1ldGFDb250ZXh0IiwicmVxdWVzdE9iamVjdCIsInRoZW4iLCJtQW5ub3MiLCJnZXRBbGxDdXN0b21BZ2dyZWdhdGVzIiwibUN1c3RvbUFnZ3JlZ2F0ZXMiLCJzQW5ubyIsInNBbm5vS2V5Iiwic3RhcnRzV2l0aCIsInJlcGxhY2UiLCJhQW5ubyIsInNwbGl0IiwibGVuZ3RoIiwiY29udGV4dERlZmluaW5nUHJvcGVydGllcyIsImxhYmVsIiwibmFtZSIsInByb3BlcnR5UGF0aCIsInNvcnRhYmxlIiwic29ydE9yZGVyIiwiY3VzdG9tIiwiZ2V0QWxsQWdncmVnYXRhYmxlUHJvcGVydGllcyIsIm1BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIiwiYVByb3BlcnRpZXMiLCJvUHJvcGVydHkiLCJpIiwiTmFtZSIsIkFnZ3JlZ2F0YWJsZVByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsImFnZ3JlZ2F0aW9uTWV0aG9kIiwiQWdncmVnYXRpb25NZXRob2QiLCJnZXRBbGxEYXRhUG9pbnRzIiwibURhdGFQb2ludHMiLCJzUXVhbGlmaWVyIiwic1ZhbHVlIiwiVmFsdWUiLCIkUGF0aCIsImNyZWF0ZURhdGFQb2ludFByb3BlcnR5Iiwib0RhdGFQb2ludEFubm8iLCJvRGF0YVBvaW50IiwiVGFyZ2V0VmFsdWUiLCJ0YXJnZXRWYWx1ZSIsIkZvcmVDYXN0VmFsdWUiLCJmb3JlQ2FzdFZhbHVlIiwib0NyaXRpY2FsaXR5IiwiQ3JpdGljYWxpdHkiLCJDYWxjdWxhdGVkIiwiU3RhdGljIiwiJEVudW1NZW1iZXIiLCJDcml0aWNhbGl0eUNhbGN1bGF0aW9uIiwib1RocmVzaG9sZHMiLCJiQ29uc3RhbnQiLCJfYnVpbGRUaHJlc2hvbGRzIiwiQ29uc3RhbnRUaHJlc2hvbGRzIiwiRHluYW1pY1RocmVzaG9sZHMiLCJjcml0aWNhbGl0eSIsIm9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uIiwiYUtleXMiLCJzS2V5IiwiaiIsIkltcHJvdmVtZW50RGlyZWN0aW9uIiwib0R5bmFtaWNUaHJlc2hvbGRzIiwib25lU3VwcGxpZWQiLCJ1c2VkTWVhc3VyZXMiLCJvQ29uc3RhbnRUaHJlc2hvbGRzIiwidW5kZWZpbmVkIiwicHVzaCIsIm9BZ2dyZWdhdGlvbkxldmVsIiwiQWdncmVnYXRpb25MZXZlbHMiLCJWaXNpYmxlRGltZW5zaW9ucyIsIm9BZ2dyZWdhdGlvbkxldmVsSW5mbyIsImFWaXNpYmxlRGltZW5zaW9ucyIsIkFnZ3JlZ2F0aW9uTGV2ZWwiLCJuVmFsdWUiLCJnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyIsImVudGl0eVNldEFubm90YXRpb25zIiwic29ydFJlc3RyaWN0aW9uc0luZm8iLCJwcm9wZXJ0eUluZm8iLCJzb3J0UmVzdHJpY3Rpb25zIiwiU29ydGFibGUiLCJwcm9wZXJ0eUl0ZW0iLCJOb25Tb3J0YWJsZVByb3BlcnRpZXMiLCJwcm9wZXJ0eU5hbWUiLCJBc2NlbmRpbmdPbmx5UHJvcGVydGllcyIsInNvcnREaXJlY3Rpb24iLCJEZXNjZW5kaW5nT25seVByb3BlcnRpZXMiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNJbmZvIiwib0ZpbHRlclJlc3RyaWN0aW9ucyIsInNQcm9wZXJ0eU5hbWUiLCJvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyIsImZpbHRlcmFibGUiLCJGaWx0ZXJhYmxlIiwicmVxdWlyZXNGaWx0ZXIiLCJSZXF1aXJlc0ZpbHRlciIsInJlcXVpcmVkUHJvcGVydGllcyIsIlJlcXVpcmVkUHJvcGVydGllcyIsIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwiRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyIsImFsbG93ZWRFeHByZXNzaW9ucyIsIkFsbG93ZWRFeHByZXNzaW9ucyIsImlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24iLCJzRmlsdGVyRXhwcmVzc2lvbiIsImJJc011bHRpVmFsdWUiLCJhZGRGaWx0ZXJJbmZvRm9yUHJvcGVydHkiLCJvRmlsdGVyUmVzdHJpY3Rpb25JbmZvIiwib1Byb3BlcnR5SW5mbyIsImZldGNoQ2FsZW5kYXJUYWciLCJDT01NT04iLCJQcm9taXNlIiwiYWxsIiwiYVRhZyIsImZldGNoRmlzY2FsVGFnIiwiZmV0Y2hDcml0aWNhbGl0eSIsIlVJIiwiYVZhbHVlQ3JpdGljYWxpdHkiLCJvVmFsdWVDcml0aWNhbGl0eSIsIlZlcnlQb3NpdGl2ZSIsIlBvc2l0aXZlIiwiQ3JpdGljYWwiLCJWZXJ5TmVnYXRpdmUiLCJOZWdhdGl2ZSIsIk5ldXRyYWwiLCJlbmRzV2l0aCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiT0RhdGFNZXRhTW9kZWxVdGlsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIEFubm90YXRpb25zRm9yQ29sbGVjdGlvbiA9IHtcblx0Ly8gYW5kIEFubm90YXRpb25zRm9yRW50aXR5U2V0XG5cdFwiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zXCI/OiB7XG5cdFx0U2VhcmNoYWJsZT86IGJvb2xlYW47XG5cdH07XG5cdFwiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU29ydFJlc3RyaWN0aW9uc1wiPzoge1xuXHRcdFNvcnRhYmxlPzogYm9vbGVhbjtcblx0XHROb25Tb3J0YWJsZVByb3BlcnRpZXM/OiB7XG5cdFx0XHQkUHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdFx0fVtdO1xuXHRcdEFzY2VuZGluZ09ubHlQcm9wZXJ0aWVzPzoge1xuXHRcdFx0JFByb3BlcnR5UGF0aDogc3RyaW5nO1xuXHRcdH1bXTtcblx0XHREZXNjZW5kaW5nT25seVByb3BlcnRpZXM/OiB7XG5cdFx0XHQkUHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdFx0fVtdO1xuXHR9O1xufTtcblxuZXhwb3J0IHR5cGUgU29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5SW5mb1R5cGUgPSB7XG5cdHNvcnRhYmxlOiBib29sZWFuO1xuXHRzb3J0RGlyZWN0aW9uPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgU29ydFJlc3RyaWN0aW9uc0luZm9UeXBlID0ge1xuXHRzb3J0YWJsZTogYm9vbGVhbjtcblx0cHJvcGVydHlJbmZvOiBSZWNvcmQ8c3RyaW5nLCBTb3J0UmVzdHJpY3Rpb25zUHJvcGVydHlJbmZvVHlwZT47XG59O1xuXG4vKipcbiAqIFV0aXRsaXR5IGNsYXNzIGZvciBtZXRhZGF0YSBpbnRlcnByZXRhdGlvbiBpbnNpZGUgZGVsZWdhdGUgY2xhc3Nlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHNpbmNlIDEuNjJcbiAqL1xuY29uc3QgT0RhdGFNZXRhTW9kZWxVdGlsID0ge1xuXHRmZXRjaEFsbEFubm90YXRpb25zKG9NZXRhTW9kZWw6IGFueSwgc0VudGl0eVBhdGg6IGFueSkge1xuXHRcdGNvbnN0IG9DdHggPSBvTWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KHNFbnRpdHlQYXRoKTtcblx0XHRyZXR1cm4gb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KFwiQFwiLCBvQ3R4KS50aGVuKGZ1bmN0aW9uIChtQW5ub3M6IGFueSkge1xuXHRcdFx0cmV0dXJuIG1Bbm5vcztcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIFRoZSBtYXBwaW5nIG9mIGFsbCBhbm5vdGF0aW9ucyBvZiBhIGdpdmVuIGVudGl0eSBzZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBtQW5ub3MgQSBsaXN0IG9mIGFubm90YXRpb25zIG9mIHRoZSBlbnRpdHkgc2V0XG5cdCAqIEByZXR1cm5zIEEgbWFwIHRvIHRoZSBjdXN0b20gYWdncmVnYXRlcyBrZXllZCBieSB0aGVpciBxdWFsaWZpZXJzXG5cdCAqL1xuXHRnZXRBbGxDdXN0b21BZ2dyZWdhdGVzKG1Bbm5vczogYW55KSB7XG5cdFx0Y29uc3QgbUN1c3RvbUFnZ3JlZ2F0ZXM6IGFueSA9IHt9O1xuXHRcdGxldCBzQW5ubztcblx0XHRmb3IgKGNvbnN0IHNBbm5vS2V5IGluIG1Bbm5vcykge1xuXHRcdFx0aWYgKHNBbm5vS2V5LnN0YXJ0c1dpdGgoXCJAT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkN1c3RvbUFnZ3JlZ2F0ZVwiKSkge1xuXHRcdFx0XHRzQW5ubyA9IHNBbm5vS2V5LnJlcGxhY2UoXCJAT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkN1c3RvbUFnZ3JlZ2F0ZSNcIiwgXCJcIik7XG5cdFx0XHRcdGNvbnN0IGFBbm5vID0gc0Fubm8uc3BsaXQoXCJAXCIpO1xuXG5cdFx0XHRcdGlmIChhQW5uby5sZW5ndGggPT0gMikge1xuXHRcdFx0XHRcdGlmICghbUN1c3RvbUFnZ3JlZ2F0ZXNbYUFubm9bMF1dKSB7XG5cdFx0XHRcdFx0XHRtQ3VzdG9tQWdncmVnYXRlc1thQW5ub1swXV0gPSB7fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly9pbm5lciBhbm5vdGF0aW9uIHRoYXQgaXMgbm90IHBhcnQgb2YgXHRWYWxpZGF0aW9uLkFnZ3JlZ2F0YWJsZVRlcm1zXG5cdFx0XHRcdFx0aWYgKGFBbm5vWzFdID09IFwiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXNcIikge1xuXHRcdFx0XHRcdFx0bUN1c3RvbUFnZ3JlZ2F0ZXNbYUFubm9bMF1dLmNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMgPSBtQW5ub3Nbc0Fubm9LZXldO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChhQW5ub1sxXSA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbFwiKSB7XG5cdFx0XHRcdFx0XHRtQ3VzdG9tQWdncmVnYXRlc1thQW5ub1swXV0ubGFiZWwgPSBtQW5ub3Nbc0Fubm9LZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChhQW5uby5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdG1DdXN0b21BZ2dyZWdhdGVzW2FBbm5vWzBdXSA9IHtcblx0XHRcdFx0XHRcdG5hbWU6IGFBbm5vWzBdLFxuXHRcdFx0XHRcdFx0cHJvcGVydHlQYXRoOiBhQW5ub1swXSxcblx0XHRcdFx0XHRcdGxhYmVsOiBgQ3VzdG9tIEFnZ3JlZ2F0ZSAoJHtzQW5ub30pYCxcblx0XHRcdFx0XHRcdHNvcnRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0c29ydE9yZGVyOiBcImJvdGhcIixcblx0XHRcdFx0XHRcdGN1c3RvbTogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbUN1c3RvbUFnZ3JlZ2F0ZXM7XG5cdH0sXG5cdGdldEFsbEFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMobUFubm9zOiBhbnkpIHtcblx0XHRjb25zdCBtQWdncmVnYXRhYmxlUHJvcGVydGllczogYW55ID0ge307XG5cdFx0bGV0IGFQcm9wZXJ0aWVzLCBvUHJvcGVydHk7XG5cdFx0aWYgKG1Bbm5vc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuQWdncmVnYXRlZFByb3BlcnRpZXNcIl0pIHtcblx0XHRcdGFQcm9wZXJ0aWVzID0gbUFubm9zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BZ2dyZWdhdGVkUHJvcGVydGllc1wiXTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhUHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRvUHJvcGVydHkgPSBhUHJvcGVydGllc1tpXTtcblxuXHRcdFx0XHRtQWdncmVnYXRhYmxlUHJvcGVydGllc1tvUHJvcGVydHkuTmFtZV0gPSB7XG5cdFx0XHRcdFx0bmFtZTogb1Byb3BlcnR5Lk5hbWUsXG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoOiBvUHJvcGVydHkuQWdncmVnYXRhYmxlUHJvcGVydHkuJFByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRhZ2dyZWdhdGlvbk1ldGhvZDogb1Byb3BlcnR5LkFnZ3JlZ2F0aW9uTWV0aG9kLFxuXHRcdFx0XHRcdGxhYmVsOiBvUHJvcGVydHlbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCJdIHx8IGBBZ2dyZWdhdGFibGUgcHJvcGVydHkgKCR7b1Byb3BlcnR5Lk5hbWV9KWAsXG5cdFx0XHRcdFx0c29ydGFibGU6IHRydWUsXG5cdFx0XHRcdFx0c29ydE9yZGVyOiBcImJvdGhcIixcblx0XHRcdFx0XHRjdXN0b206IGZhbHNlXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzO1xuXHR9LFxuXHQvKipcblx0ICogUmV0cmlldmUgYW5kIG9yZGVyIGFsbCBkYXRhIHBvaW50cyBieSB0aGVpciBwcm9wZXJ0eSBhbmQgcXVhbGlmaWVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gbUFubm9zIEEgbmFtZWQgbWFwIG9mIGFubm90YXRpb25zIGZyb20gYSBnaXZlbiBlbnRpdHkgc2V0XG5cdCAqIEByZXR1cm5zIEEga2V5ZWQgbWFwcGVkIG9yZGVyZWQgYnlcblx0ICogPHVsPlxuXHQgKiAgICAgPGxpPiBUaGUgcHJvcGVydGllcyB2YWx1ZSBwYXRoIDwvbGk+XG5cdCAqICAgICA8bGk+IFRoZSBxdWFsaWZpZXIgb2YgdGhlIGRhdGEgcG9pbnQgPChsaT5cblx0ICogPC91bD5cblx0ICovXG5cdGdldEFsbERhdGFQb2ludHMobUFubm9zOiBhbnlbXSkge1xuXHRcdGNvbnN0IG1EYXRhUG9pbnRzOiBhbnkgPSB7fTtcblx0XHRmb3IgKGNvbnN0IHNBbm5vS2V5IGluIG1Bbm5vcykge1xuXHRcdFx0aWYgKHNBbm5vS2V5LnN0YXJ0c1dpdGgoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCIpKSB7XG5cdFx0XHRcdGNvbnN0IHNRdWFsaWZpZXIgPSBzQW5ub0tleS5yZXBsYWNlKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludCNcIiwgXCJcIik7XG5cdFx0XHRcdGNvbnN0IHNWYWx1ZSA9IG1Bbm5vc1tzQW5ub0tleV0uVmFsdWUuJFBhdGg7XG5cdFx0XHRcdG1EYXRhUG9pbnRzW3NWYWx1ZV0gPSBtRGF0YVBvaW50c1tzVmFsdWVdIHx8IHt9O1xuXHRcdFx0XHRtRGF0YVBvaW50c1tzVmFsdWVdW3NRdWFsaWZpZXJdID0gT0RhdGFNZXRhTW9kZWxVdGlsLmNyZWF0ZURhdGFQb2ludFByb3BlcnR5KG1Bbm5vc1tzQW5ub0tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBtRGF0YVBvaW50cztcblx0fSxcblx0LyoqXG5cdCAqIEZvcm1hdCB0aGUgZGF0YSBwb2ludCBhcyBhIEpTT04gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGFQb2ludEFubm9cblx0ICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBqc29uIG9iamVjdFxuXHQgKi9cblx0Y3JlYXRlRGF0YVBvaW50UHJvcGVydHkob0RhdGFQb2ludEFubm86IGFueSkge1xuXHRcdGNvbnN0IG9EYXRhUG9pbnQ6IGFueSA9IHt9O1xuXG5cdFx0aWYgKG9EYXRhUG9pbnRBbm5vLlRhcmdldFZhbHVlKSB7XG5cdFx0XHRvRGF0YVBvaW50LnRhcmdldFZhbHVlID0gb0RhdGFQb2ludEFubm8uVGFyZ2V0VmFsdWUuJFBhdGg7XG5cdFx0fVxuXG5cdFx0aWYgKG9EYXRhUG9pbnRBbm5vLkZvcmVDYXN0VmFsdWUpIHtcblx0XHRcdG9EYXRhUG9pbnQuZm9yZUNhc3RWYWx1ZSA9IG9EYXRhUG9pbnRBbm5vLkZvcmVDYXN0VmFsdWUuJFBhdGg7XG5cdFx0fVxuXG5cdFx0bGV0IG9Dcml0aWNhbGl0eSA9IG51bGw7XG5cdFx0aWYgKG9EYXRhUG9pbnRBbm5vLkNyaXRpY2FsaXR5KSB7XG5cdFx0XHRpZiAob0RhdGFQb2ludEFubm8uQ3JpdGljYWxpdHkuJFBhdGgpIHtcblx0XHRcdFx0Ly93aWxsIGJlIGFuIGFnZ3JlZ2F0ZWQgcHJvcGVydHkgb3IgY3VzdG9tIGFnZ3JlZ2F0ZVxuXHRcdFx0XHRvQ3JpdGljYWxpdHkgPSB7XG5cdFx0XHRcdFx0Q2FsY3VsYXRlZDogb0RhdGFQb2ludEFubm8uQ3JpdGljYWxpdHkuJFBhdGhcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Dcml0aWNhbGl0eSA9IHtcblx0XHRcdFx0XHRTdGF0aWM6IG9EYXRhUG9pbnRBbm5vLkNyaXRpY2FsaXR5LiRFbnVtTWVtYmVyLnJlcGxhY2UoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvXCIsIFwiXCIpXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChvRGF0YVBvaW50QW5uby5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uKSB7XG5cdFx0XHRjb25zdCBvVGhyZXNob2xkcyA9IHt9O1xuXHRcdFx0Y29uc3QgYkNvbnN0YW50ID0gT0RhdGFNZXRhTW9kZWxVdGlsLl9idWlsZFRocmVzaG9sZHMob1RocmVzaG9sZHMsIG9EYXRhUG9pbnRBbm5vLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24pO1xuXG5cdFx0XHRpZiAoYkNvbnN0YW50KSB7XG5cdFx0XHRcdG9Dcml0aWNhbGl0eSA9IHtcblx0XHRcdFx0XHRDb25zdGFudFRocmVzaG9sZHM6IG9UaHJlc2hvbGRzXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvQ3JpdGljYWxpdHkgPSB7XG5cdFx0XHRcdFx0RHluYW1pY1RocmVzaG9sZHM6IG9UaHJlc2hvbGRzXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG9Dcml0aWNhbGl0eSkge1xuXHRcdFx0b0RhdGFQb2ludC5jcml0aWNhbGl0eSA9IG9Dcml0aWNhbGl0eTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb0RhdGFQb2ludDtcblx0fSxcblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSB0aHJlc2hvbGRzIGFyZSBkeW5hbWljIG9yIGNvbnN0YW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RocmVzaG9sZHMgVGhlIHRocmVzaG9sZCBza2VsZXRvblxuXHQgKiBAcGFyYW0gb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24gVGhlIFVJLkRhdGFQb2ludC5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uIGFubm90YXRpb25cblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSB0aHJlc2hvbGQgc2hvdWxkIGJlIHN1cHBsaWVkIGFzIENvbnN0YW50VGhyZXNob2xkcywgPGNvZGU+ZmFsc2U8L2NvZGU+IGlmIHRoZSB0aHJlc2hvbGQgc2hvdWxkXG5cdCAqIGJlIHN1cHBsaWVkIGFzIER5bmFtaWNUaHJlc2hvbGRzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfYnVpbGRUaHJlc2hvbGRzKG9UaHJlc2hvbGRzOiBhbnksIG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uOiBhbnkpIHtcblx0XHRjb25zdCBhS2V5cyA9IFtcblx0XHRcdFwiQWNjZXB0YW5jZVJhbmdlTG93VmFsdWVcIixcblx0XHRcdFwiQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlXCIsXG5cdFx0XHRcIlRvbGVyYW5jZVJhbmdlTG93VmFsdWVcIixcblx0XHRcdFwiVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWVcIixcblx0XHRcdFwiRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZVwiLFxuXHRcdFx0XCJEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZVwiXG5cdFx0XTtcblx0XHRsZXQgYkNvbnN0YW50ID0gdHJ1ZSxcblx0XHRcdHNLZXksXG5cdFx0XHRpLFxuXHRcdFx0ajtcblxuXHRcdG9UaHJlc2hvbGRzLkltcHJvdmVtZW50RGlyZWN0aW9uID0gb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24uSW1wcm92ZW1lbnREaXJlY3Rpb24uJEVudW1NZW1iZXIucmVwbGFjZShcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wcm92ZW1lbnREaXJlY3Rpb25UeXBlL1wiLFxuXHRcdFx0XCJcIlxuXHRcdCk7XG5cblx0XHRjb25zdCBvRHluYW1pY1RocmVzaG9sZHM6IGFueSA9IHtcblx0XHRcdG9uZVN1cHBsaWVkOiBmYWxzZSxcblx0XHRcdHVzZWRNZWFzdXJlczogW11cblx0XHRcdC8vIGNvbWJpbmF0aW9uIHRvIGNoZWNrIHdoZXRoZXIgYXQgbGVhc3Qgb25lIGlzIHN1cHBsaWVkXG5cdFx0fTtcblx0XHRjb25zdCBvQ29uc3RhbnRUaHJlc2hvbGRzOiBhbnkgPSB7XG5cdFx0XHRvbmVTdXBwbGllZDogZmFsc2Vcblx0XHRcdC8vIGNvbWJpbmF0aW9uIHRvIGNoZWNrIHdoZXRoZXIgYXQgbGVhc3Qgb25lIGlzIHN1cHBsaWVkXG5cdFx0fTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCBhS2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c0tleSA9IGFLZXlzW2ldO1xuXHRcdFx0b0R5bmFtaWNUaHJlc2hvbGRzW3NLZXldID0gb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb25bc0tleV0gPyBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbltzS2V5XS4kUGF0aCA6IHVuZGVmaW5lZDtcblx0XHRcdG9EeW5hbWljVGhyZXNob2xkcy5vbmVTdXBwbGllZCA9IG9EeW5hbWljVGhyZXNob2xkcy5vbmVTdXBwbGllZCB8fCBvRHluYW1pY1RocmVzaG9sZHNbc0tleV07XG5cblx0XHRcdGlmICghb0R5bmFtaWNUaHJlc2hvbGRzLm9uZVN1cHBsaWVkKSB7XG5cdFx0XHRcdC8vIG9ubHkgY29uc2lkZXIgaW4gY2FzZSBubyBkeW5hbWljIHRocmVzaG9sZCBpcyBzdXBwbGllZFxuXHRcdFx0XHRvQ29uc3RhbnRUaHJlc2hvbGRzW3NLZXldID0gb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb25bc0tleV07XG5cdFx0XHRcdG9Db25zdGFudFRocmVzaG9sZHMub25lU3VwcGxpZWQgPSBvQ29uc3RhbnRUaHJlc2hvbGRzLm9uZVN1cHBsaWVkIHx8IG9Db25zdGFudFRocmVzaG9sZHNbc0tleV07XG5cdFx0XHR9IGVsc2UgaWYgKG9EeW5hbWljVGhyZXNob2xkc1tzS2V5XSkge1xuXHRcdFx0XHRvRHluYW1pY1RocmVzaG9sZHMudXNlZE1lYXN1cmVzLnB1c2gob0R5bmFtaWNUaHJlc2hvbGRzW3NLZXldKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBkeW5hbWljIGRlZmluaXRpb24gc2hhbGwgb3ZlcnJ1bGUgY29uc3RhbnQgZGVmaW5pdGlvblxuXHRcdGlmIChvRHluYW1pY1RocmVzaG9sZHMub25lU3VwcGxpZWQpIHtcblx0XHRcdGJDb25zdGFudCA9IGZhbHNlO1xuXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgYUtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKG9EeW5hbWljVGhyZXNob2xkc1thS2V5c1tpXV0pIHtcblx0XHRcdFx0XHRvVGhyZXNob2xkc1thS2V5c1tpXV0gPSBvRHluYW1pY1RocmVzaG9sZHNbYUtleXNbaV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRvVGhyZXNob2xkcy51c2VkTWVhc3VyZXMgPSBvRHluYW1pY1RocmVzaG9sZHMudXNlZE1lYXN1cmVzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgb0FnZ3JlZ2F0aW9uTGV2ZWw6IGFueTtcblx0XHRcdG9UaHJlc2hvbGRzLkFnZ3JlZ2F0aW9uTGV2ZWxzID0gW107XG5cblx0XHRcdC8vIGNoZWNrIGlmIGF0IGxlYXN0IG9uZSBzdGF0aWMgdmFsdWUgaXMgc3VwcGxpZWRcblx0XHRcdGlmIChvQ29uc3RhbnRUaHJlc2hvbGRzLm9uZVN1cHBsaWVkKSB7XG5cdFx0XHRcdC8vIGFkZCBvbmUgZW50cnkgaW4gdGhlIGFnZ3JlZ2F0aW9uIGxldmVsXG5cdFx0XHRcdG9BZ2dyZWdhdGlvbkxldmVsID0ge1xuXHRcdFx0XHRcdFZpc2libGVEaW1lbnNpb25zOiBudWxsXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGFLZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKG9Db25zdGFudFRocmVzaG9sZHNbYUtleXNbaV1dKSB7XG5cdFx0XHRcdFx0XHRvQWdncmVnYXRpb25MZXZlbFthS2V5c1tpXV0gPSBvQ29uc3RhbnRUaHJlc2hvbGRzW2FLZXlzW2ldXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvVGhyZXNob2xkcy5BZ2dyZWdhdGlvbkxldmVscy5wdXNoKG9BZ2dyZWdhdGlvbkxldmVsKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZnVydGhlciBjaGVjayBmb3IgQ29uc3RhbnRUaHJlc2hvbGRzXG5cdFx0XHRpZiAob0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24uQ29uc3RhbnRUaHJlc2hvbGRzICYmIG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLkNvbnN0YW50VGhyZXNob2xkcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Db25zdGFudFRocmVzaG9sZHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCBvQWdncmVnYXRpb25MZXZlbEluZm8gPSBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Db25zdGFudFRocmVzaG9sZHNbaV07XG5cblx0XHRcdFx0XHRjb25zdCBhVmlzaWJsZURpbWVuc2lvbnM6IGFueSA9IG9BZ2dyZWdhdGlvbkxldmVsSW5mby5BZ2dyZWdhdGlvbkxldmVsID8gW10gOiBudWxsO1xuXG5cdFx0XHRcdFx0aWYgKG9BZ2dyZWdhdGlvbkxldmVsSW5mby5BZ2dyZWdhdGlvbkxldmVsICYmIG9BZ2dyZWdhdGlvbkxldmVsSW5mby5BZ2dyZWdhdGlvbkxldmVsLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGZvciAoaiA9IDA7IGogPCBvQWdncmVnYXRpb25MZXZlbEluZm8uQWdncmVnYXRpb25MZXZlbC5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRhVmlzaWJsZURpbWVuc2lvbnMucHVzaChvQWdncmVnYXRpb25MZXZlbEluZm8uQWdncmVnYXRpb25MZXZlbFtqXS4kUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvQWdncmVnYXRpb25MZXZlbCA9IHtcblx0XHRcdFx0XHRcdFZpc2libGVEaW1lbnNpb25zOiBhVmlzaWJsZURpbWVuc2lvbnNcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IGFLZXlzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBuVmFsdWUgPSBvQWdncmVnYXRpb25MZXZlbEluZm9bYUtleXNbal1dO1xuXHRcdFx0XHRcdFx0aWYgKG5WYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRvQWdncmVnYXRpb25MZXZlbFthS2V5c1tqXV0gPSBuVmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b1RocmVzaG9sZHMuQWdncmVnYXRpb25MZXZlbHMucHVzaChvQWdncmVnYXRpb25MZXZlbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gYkNvbnN0YW50O1xuXHR9LFxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB0aGUgc29ydGluZyBpbmZvcm1hdGlvbiBmcm9tIHRoZSByZXN0cmljdGlvbiBhbm5vdGF0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gZW50aXR5U2V0QW5ub3RhdGlvbnMgRW50aXR5U2V0IG9yIGNvbGxlY3Rpb24gYW5ub3RhdGlvbnMgd2l0aCB0aGUgc29ydCByZXN0cmljdGlvbnMgYW5ub3RhdGlvblxuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgc29ydCByZXN0cmljdGlvbiBpbmZvcm1hdGlvblxuXHQgKi9cblx0Z2V0U29ydFJlc3RyaWN0aW9uc0luZm8oZW50aXR5U2V0QW5ub3RhdGlvbnM6IEFubm90YXRpb25zRm9yQ29sbGVjdGlvbikge1xuXHRcdGNvbnN0IHNvcnRSZXN0cmljdGlvbnNJbmZvOiBTb3J0UmVzdHJpY3Rpb25zSW5mb1R5cGUgPSB7XG5cdFx0XHRzb3J0YWJsZTogdHJ1ZSxcblx0XHRcdHByb3BlcnR5SW5mbzoge31cblx0XHR9O1xuXHRcdGNvbnN0IHNvcnRSZXN0cmljdGlvbnMgPSBlbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNvcnRSZXN0cmljdGlvbnNcIl07XG5cblx0XHRpZiAoIXNvcnRSZXN0cmljdGlvbnMpIHtcblx0XHRcdHJldHVybiBzb3J0UmVzdHJpY3Rpb25zSW5mbztcblx0XHR9XG5cblx0XHRzb3J0UmVzdHJpY3Rpb25zSW5mby5zb3J0YWJsZSA9IHNvcnRSZXN0cmljdGlvbnMuU29ydGFibGUgPz8gdHJ1ZTtcblxuXHRcdGZvciAoY29uc3QgcHJvcGVydHlJdGVtIG9mIHNvcnRSZXN0cmljdGlvbnMuTm9uU29ydGFibGVQcm9wZXJ0aWVzIHx8IFtdKSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eUl0ZW0uJFByb3BlcnR5UGF0aDtcblx0XHRcdHNvcnRSZXN0cmljdGlvbnNJbmZvLnByb3BlcnR5SW5mb1twcm9wZXJ0eU5hbWVdID0ge1xuXHRcdFx0XHRzb3J0YWJsZTogZmFsc2Vcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBwcm9wZXJ0eUl0ZW0gb2Ygc29ydFJlc3RyaWN0aW9ucy5Bc2NlbmRpbmdPbmx5UHJvcGVydGllcyB8fCBbXSkge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gcHJvcGVydHlJdGVtLiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bcHJvcGVydHlOYW1lXSA9IHtcblx0XHRcdFx0c29ydGFibGU6IHRydWUsXG5cdFx0XHRcdHNvcnREaXJlY3Rpb246IFwiYXNjXCIgLy8gbm90IHVzZWQsIHlldFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IHByb3BlcnR5SXRlbSBvZiBzb3J0UmVzdHJpY3Rpb25zLkRlc2NlbmRpbmdPbmx5UHJvcGVydGllcyB8fCBbXSkge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gcHJvcGVydHlJdGVtLiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bcHJvcGVydHlOYW1lXSA9IHtcblx0XHRcdFx0c29ydGFibGU6IHRydWUsXG5cdFx0XHRcdHNvcnREaXJlY3Rpb246IFwiZGVzY1wiIC8vIG5vdCB1c2VkLCB5ZXRcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNvcnRSZXN0cmljdGlvbnNJbmZvO1xuXHR9LFxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB0aGUgZmlsdGVyIGluZm9ybWF0aW9uIGJhc2VkIG9uIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zIGFubm9hdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9GaWx0ZXJSZXN0cmljdGlvbnMgVGhlIGZpbHRlciByZXN0cmljdGlvbnMgYW5ub3RhdGlvblxuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgZmlsdGVyIHJlc3RyaWN0aW9uIGluZm9ybWF0aW9uXG5cdCAqL1xuXHRnZXRGaWx0ZXJSZXN0cmljdGlvbnNJbmZvKG9GaWx0ZXJSZXN0cmljdGlvbnM6IGFueSkge1xuXHRcdGxldCBpLCBzUHJvcGVydHlOYW1lO1xuXHRcdGNvbnN0IG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnkgPSB7XG5cdFx0XHRmaWx0ZXJhYmxlOiB0cnVlLFxuXHRcdFx0cHJvcGVydHlJbmZvOiB7fVxuXHRcdH07XG5cblx0XHRpZiAob0ZpbHRlclJlc3RyaWN0aW9ucykge1xuXHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9uc0luZm8uZmlsdGVyYWJsZSA9IG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyYWJsZSAhPSBudWxsID8gb0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJhYmxlIDogdHJ1ZTtcblx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvLnJlcXVpcmVzRmlsdGVyID1cblx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9ucy5SZXF1aXJlc0ZpbHRlciAhPSBudWxsID8gb0ZpbHRlclJlc3RyaWN0aW9ucy5SZXF1aXJlc0ZpbHRlciA6IGZhbHNlO1xuXG5cdFx0XHQvL0hpZXJhcmNoaWNhbCBDYXNlXG5cdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zSW5mby5yZXF1aXJlZFByb3BlcnRpZXMgPSBbXTtcblx0XHRcdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zSW5mby5SZXF1aXJlZFByb3BlcnRpZXMpIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG9GaWx0ZXJSZXN0cmljdGlvbnMuUmVxdWlyZWRQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0c1Byb3BlcnR5TmFtZSA9IG9GaWx0ZXJSZXN0cmljdGlvbnMuUmVxdWlyZWRQcm9wZXJ0aWVzW2ldLiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9uc0luZm8ucmVxdWlyZWRQcm9wZXJ0aWVzLnB1c2goc1Byb3BlcnR5TmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKG9GaWx0ZXJSZXN0cmljdGlvbnMuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMpIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG9GaWx0ZXJSZXN0cmljdGlvbnMuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRzUHJvcGVydHlOYW1lID0gb0ZpbHRlclJlc3RyaWN0aW9ucy5Ob25GaWx0ZXJhYmxlUHJvcGVydGllc1tpXS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvW3NQcm9wZXJ0eU5hbWVdID0ge1xuXHRcdFx0XHRcdFx0ZmlsdGVyYWJsZTogZmFsc2Vcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMpIHtcblx0XHRcdFx0Ly9UQkRcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHNQcm9wZXJ0eU5hbWUgPSBvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnNbaV0uJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zSW5mb1tzUHJvcGVydHlOYW1lXSA9IHtcblx0XHRcdFx0XHRcdGZpbHRlcmFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRhbGxvd2VkRXhwcmVzc2lvbnM6IG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9uc1tpXS5BbGxvd2VkRXhwcmVzc2lvbnNcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvO1xuXHR9LFxuXHQvKipcblx0ICogUHJvdmlkZXMgdGhlIGluZm9ybWF0aW9uIGlmIHRoZSBGaWx0ZXJFeHByZXNzaW9uIGlzIGEgbXVsdGlWYWx1ZSBGaWx0ZXIgRXhwcmVzc2lvbi5cblx0ICpcblx0ICogQHBhcmFtIHNGaWx0ZXJFeHByZXNzaW9uIFRoZSBGaWx0ZXJFeHByZXNzaW9uVHlwZVxuXHQgKiBAcmV0dXJucyBBIGJvb2xlYW4gdmFsdWUgd2V0aGVyIGl0IGlzIGEgbXVsdGlWYWx1ZSBGaWx0ZXIgRXhwcmVzc2lvbiBvciBub3Rcblx0ICovXG5cdGlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24oc0ZpbHRlckV4cHJlc3Npb246IFN0cmluZykge1xuXHRcdGxldCBiSXNNdWx0aVZhbHVlID0gdHJ1ZTtcblxuXHRcdC8vU2luZ2xlVmFsdWUgfCBNdWx0aVZhbHVlIHwgU2luZ2xlUmFuZ2UgfCBNdWx0aVJhbmdlIHwgU2VhcmNoRXhwcmVzc2lvbiB8IE11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cblxuXHRcdHN3aXRjaCAoc0ZpbHRlckV4cHJlc3Npb24pIHtcblx0XHRcdGNhc2UgXCJTZWFyY2hFeHByZXNzaW9uXCI6XG5cdFx0XHRjYXNlIFwiU2luZ2xlUmFuZ2VcIjpcblx0XHRcdGNhc2UgXCJTaW5nbGVWYWx1ZVwiOlxuXHRcdFx0XHRiSXNNdWx0aVZhbHVlID0gZmFsc2U7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGJJc011bHRpVmFsdWU7XG5cdH0sXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSBlbnRpdHkgcHJvcGVydHlcblx0ICogQHBhcmFtIG9GaWx0ZXJSZXN0cmljdGlvbkluZm8gVGhlIGZpbHRlciByZXN0cmljdGlvbnNcblx0ICovXG5cdGFkZEZpbHRlckluZm9Gb3JQcm9wZXJ0eShvUHJvcGVydHk6IGFueSwgb0ZpbHRlclJlc3RyaWN0aW9uSW5mbzogYW55KSB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5SW5mbyA9IG9GaWx0ZXJSZXN0cmljdGlvbkluZm9bb1Byb3BlcnR5Lm5hbWVdO1xuXHRcdG9Qcm9wZXJ0eS5maWx0ZXJhYmxlID0gb0ZpbHRlclJlc3RyaWN0aW9uSW5mby5maWx0ZXJhYmxlICYmIG9Qcm9wZXJ0eUluZm8gPyBvUHJvcGVydHlJbmZvLmZpbHRlcmFibGUgOiB0cnVlO1xuXG5cdFx0aWYgKG9Qcm9wZXJ0eS5maWx0ZXJhYmxlKSB7XG5cdFx0XHRvUHJvcGVydHkuYWxsb3dlZEV4cHJlc3Npb25zID0gb1Byb3BlcnR5SW5mbyA/IG9Qcm9wZXJ0eUluZm8uYWxsb3dlZEV4cHJlc3Npb25zIDogbnVsbDtcblx0XHR9XG5cdH0sXG5cdGZldGNoQ2FsZW5kYXJUYWcob01ldGFNb2RlbDogYW55LCBvQ3R4OiBhbnkpIHtcblx0XHRjb25zdCBDT01NT04gPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuXCI7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKFtcblx0XHRcdG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtDT01NT059SXNDYWxlbmRhclllYXJgLCBvQ3R4KSxcblx0XHRcdG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtDT01NT059SXNDYWxlbmRhckhhbGZ5ZWFyYCwgb0N0eCksXG5cdFx0XHRvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7Q09NTU9OfUlzQ2FsZW5kYXJRdWFydGVyYCwgb0N0eCksXG5cdFx0XHRvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7Q09NTU9OfUlzQ2FsZW5kYXJNb250aGAsIG9DdHgpLFxuXHRcdFx0b01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke0NPTU1PTn1Jc0NhbGVuZGFyV2Vla2AsIG9DdHgpLFxuXHRcdFx0b01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke0NPTU1PTn1Jc0RheU9mQ2FsZW5kYXJNb250aGAsIG9DdHgpLFxuXHRcdFx0b01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke0NPTU1PTn1Jc0RheU9mQ2FsZW5kYXJZZWFyYCwgb0N0eCksXG5cdFx0XHRvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7Q09NTU9OfUlzQ2FsZW5kYXJZZWFySGFsZnllYXJgLCBvQ3R4KSxcblx0XHRcdG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtDT01NT059SXNDYWxlbmRhclllYXJRdWFydGVyYCwgb0N0eCksXG5cdFx0XHRvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7Q09NTU9OfUlzQ2FsZW5kYXJZZWFyTW9udGhgLCBvQ3R4KSxcblx0XHRcdG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtDT01NT059SXNDYWxlbmRhclllYXJXZWVrYCwgb0N0eCksXG5cdFx0XHRvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7Q09NTU9OfUlzQ2FsZW5kYXJEYXRlYCwgb0N0eClcblx0XHRdKS50aGVuKGZ1bmN0aW9uIChhVGFnOiBhbnlbXSkge1xuXHRcdFx0aWYgKGFUYWdbMF0pIHtcblx0XHRcdFx0cmV0dXJuIFwieWVhclwiO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVRhZ1sxXSkge1xuXHRcdFx0XHRyZXR1cm4gXCJoYWxmWWVhclwiO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVRhZ1syXSkge1xuXHRcdFx0XHRyZXR1cm4gXCJxdWFydGVyXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhVGFnWzNdKSB7XG5cdFx0XHRcdHJldHVybiBcIm1vbnRoXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhVGFnWzRdKSB7XG5cdFx0XHRcdHJldHVybiBcIndlZWtcIjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFUYWdbNV0pIHtcblx0XHRcdFx0cmV0dXJuIFwiZGF5T2ZNb250aFwiO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVRhZ1s2XSkge1xuXHRcdFx0XHRyZXR1cm4gXCJkYXlPZlllYXJcIjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFUYWdbN10pIHtcblx0XHRcdFx0cmV0dXJuIFwieWVhckhhbGZZZWFyXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhVGFnWzhdKSB7XG5cdFx0XHRcdHJldHVybiBcInllYXJRdWFydGVyXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhVGFnWzldKSB7XG5cdFx0XHRcdHJldHVybiBcInllYXJNb250aFwiO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVRhZ1sxMF0pIHtcblx0XHRcdFx0cmV0dXJuIFwieWVhcldlZWtcIjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFUYWdbMTFdKSB7XG5cdFx0XHRcdHJldHVybiBcImRhdGVcIjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9KTtcblx0fSxcblx0ZmV0Y2hGaXNjYWxUYWcob01ldGFNb2RlbDogYW55LCBvQ3R4OiBhbnkpIHtcblx0XHRjb25zdCBDT01NT04gPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuXCI7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKFtcblx0XHRcdG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtDT01NT059SXNGaXNjYWxZZWFyYCwgb0N0eCksXG5cdFx0XHRvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7Q09NTU9OfUlzRmlzY2FsUGVyaW9kYCwgb0N0eCksXG5cdFx0XHRvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7Q09NTU9OfUlzRmlzY2FsWWVhclBlcmlvZGAsIG9DdHgpLFxuXHRcdFx0b01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke0NPTU1PTn1Jc0Zpc2NhbFF1YXJ0ZXJgLCBvQ3R4KSxcblx0XHRcdG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtDT01NT059SXNGaXNjYWxZZWFyUXVhcnRlcmAsIG9DdHgpLFxuXHRcdFx0b01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke0NPTU1PTn1Jc0Zpc2NhbFdlZWtgLCBvQ3R4KSxcblx0XHRcdG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtDT01NT059SXNGaXNjYWxZZWFyV2Vla2AsIG9DdHgpLFxuXHRcdFx0b01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke0NPTU1PTn1Jc0RheU9mRmlzY2FsWWVhcmAsIG9DdHgpLFxuXHRcdFx0b01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke0NPTU1PTn1Jc0Zpc2NhbFllYXJWYXJpYW50YCwgb0N0eClcblx0XHRdKS50aGVuKGZ1bmN0aW9uIChhVGFnOiBbYW55LCBhbnksIGFueSwgYW55LCBhbnksIGFueSwgYW55LCBhbnksIGFueV0pIHtcblx0XHRcdGlmIChhVGFnWzBdKSB7XG5cdFx0XHRcdHJldHVybiBcInllYXJcIjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFUYWdbMV0pIHtcblx0XHRcdFx0cmV0dXJuIFwicGVyaW9kXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhVGFnWzJdKSB7XG5cdFx0XHRcdHJldHVybiBcInllYXJQZXJpb2RcIjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFUYWdbM10pIHtcblx0XHRcdFx0cmV0dXJuIFwicXVhcnRlclwiO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVRhZ1s0XSkge1xuXHRcdFx0XHRyZXR1cm4gXCJ5ZWFyUXVhcnRlclwiO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVRhZ1s1XSkge1xuXHRcdFx0XHRyZXR1cm4gXCJ3ZWVrXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhVGFnWzZdKSB7XG5cdFx0XHRcdHJldHVybiBcInllYXJXZWVrXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhVGFnWzddKSB7XG5cdFx0XHRcdHJldHVybiBcImRheU9mWWVhclwiO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVRhZ1s4XSkge1xuXHRcdFx0XHRyZXR1cm4gXCJ5ZWFyVmFyaWFudFwiO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH0pO1xuXHR9LFxuXHRmZXRjaENyaXRpY2FsaXR5KG9NZXRhTW9kZWw6IGFueSwgb0N0eDogYW55KSB7XG5cdFx0Y29uc3QgVUkgPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiO1xuXHRcdHJldHVybiBvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7VUl9LlZhbHVlQ3JpdGljYWxpdHlgLCBvQ3R4KS50aGVuKGZ1bmN0aW9uIChhVmFsdWVDcml0aWNhbGl0eTogYW55KSB7XG5cdFx0XHRsZXQgb0NyaXRpY2FsaXR5LCBvVmFsdWVDcml0aWNhbGl0eTogYW55O1xuXG5cdFx0XHRpZiAoYVZhbHVlQ3JpdGljYWxpdHkpIHtcblx0XHRcdFx0b0NyaXRpY2FsaXR5ID0ge1xuXHRcdFx0XHRcdFZlcnlQb3NpdGl2ZTogW10sXG5cdFx0XHRcdFx0UG9zaXRpdmU6IFtdLFxuXHRcdFx0XHRcdENyaXRpY2FsOiBbXSxcblx0XHRcdFx0XHRWZXJ5TmVnYXRpdmU6IFtdLFxuXHRcdFx0XHRcdE5lZ2F0aXZlOiBbXSxcblx0XHRcdFx0XHROZXV0cmFsOiBbXVxuXHRcdFx0XHR9IGFzIGFueTtcblxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFWYWx1ZUNyaXRpY2FsaXR5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0b1ZhbHVlQ3JpdGljYWxpdHkgPSBhVmFsdWVDcml0aWNhbGl0eVtpXTtcblxuXHRcdFx0XHRcdGlmIChvVmFsdWVDcml0aWNhbGl0eS5Dcml0aWNhbGl0eS4kRW51bU1lbWJlci5lbmRzV2l0aChcIlZlcnlQb3NpdGl2ZVwiKSkge1xuXHRcdFx0XHRcdFx0b0NyaXRpY2FsaXR5LlZlcnlQb3NpdGl2ZS5wdXNoKG9WYWx1ZUNyaXRpY2FsaXR5LlZhbHVlKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG9WYWx1ZUNyaXRpY2FsaXR5LkNyaXRpY2FsaXR5LiRFbnVtTWVtYmVyLmVuZHNXaXRoKFwiUG9zaXRpdmVcIikpIHtcblx0XHRcdFx0XHRcdG9Dcml0aWNhbGl0eS5Qb3NpdGl2ZS5wdXNoKG9WYWx1ZUNyaXRpY2FsaXR5LlZhbHVlKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG9WYWx1ZUNyaXRpY2FsaXR5LkNyaXRpY2FsaXR5LiRFbnVtTWVtYmVyLmVuZHNXaXRoKFwiQ3JpdGljYWxcIikpIHtcblx0XHRcdFx0XHRcdG9Dcml0aWNhbGl0eS5Dcml0aWNhbC5wdXNoKG9WYWx1ZUNyaXRpY2FsaXR5LlZhbHVlKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG9WYWx1ZUNyaXRpY2FsaXR5LkNyaXRpY2FsaXR5LiRFbnVtTWVtYmVyLmVuZHNXaXRoKFwiVmVyeU5lZ2F0aXZlXCIpKSB7XG5cdFx0XHRcdFx0XHRvQ3JpdGljYWxpdHkuVmVyeU5lZ2F0aXZlLnB1c2gob1ZhbHVlQ3JpdGljYWxpdHkuVmFsdWUpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAob1ZhbHVlQ3JpdGljYWxpdHkuQ3JpdGljYWxpdHkuJEVudW1NZW1iZXIuZW5kc1dpdGgoXCJOZWdhdGl2ZVwiKSkge1xuXHRcdFx0XHRcdFx0b0NyaXRpY2FsaXR5Lk5lZ2F0aXZlLnB1c2gob1ZhbHVlQ3JpdGljYWxpdHkuVmFsdWUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvQ3JpdGljYWxpdHkuTmV1dHJhbC5wdXNoKG9WYWx1ZUNyaXRpY2FsaXR5LlZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmb3IgKGNvbnN0IHNLZXkgaW4gb0NyaXRpY2FsaXR5KSB7XG5cdFx0XHRcdFx0aWYgKG9Dcml0aWNhbGl0eVtzS2V5XS5sZW5ndGggPT0gMCkge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG9Dcml0aWNhbGl0eVtzS2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG9Dcml0aWNhbGl0eTtcblx0XHR9KTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgT0RhdGFNZXRhTW9kZWxVdGlsO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBNkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1BLGtCQUFrQixHQUFHO0lBQzFCQyxtQkFBbUIsQ0FBQ0MsVUFBZSxFQUFFQyxXQUFnQixFQUFFO01BQ3RELE1BQU1DLElBQUksR0FBR0YsVUFBVSxDQUFDRyxjQUFjLENBQUNGLFdBQVcsQ0FBQztNQUNuRCxPQUFPRCxVQUFVLENBQUNJLGFBQWEsQ0FBQyxHQUFHLEVBQUVGLElBQUksQ0FBQyxDQUFDRyxJQUFJLENBQUMsVUFBVUMsTUFBVyxFQUFFO1FBQ3RFLE9BQU9BLE1BQU07TUFDZCxDQUFDLENBQUM7SUFDSCxDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHNCQUFzQixDQUFDRCxNQUFXLEVBQUU7TUFDbkMsTUFBTUUsaUJBQXNCLEdBQUcsQ0FBQyxDQUFDO01BQ2pDLElBQUlDLEtBQUs7TUFDVCxLQUFLLE1BQU1DLFFBQVEsSUFBSUosTUFBTSxFQUFFO1FBQzlCLElBQUlJLFFBQVEsQ0FBQ0MsVUFBVSxDQUFDLDJDQUEyQyxDQUFDLEVBQUU7VUFDckVGLEtBQUssR0FBR0MsUUFBUSxDQUFDRSxPQUFPLENBQUMsNENBQTRDLEVBQUUsRUFBRSxDQUFDO1VBQzFFLE1BQU1DLEtBQUssR0FBR0osS0FBSyxDQUFDSyxLQUFLLENB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