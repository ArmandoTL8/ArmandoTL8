/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controls/filterbar/utils/VisualFilterUtils", "sap/fe/core/templating/FilterHelper", "sap/fe/core/type/TypeUtil", "sap/fe/macros/CommonHelper", "sap/fe/macros/filter/FilterUtils", "sap/ui/core/Core", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/util/FilterUtil", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, VisualFilterUtils, FilterHelper, TypeUtil, CommonHelper, FilterUtils, Core, Condition, MdcFilterUtil, Filter, FilterOperator) {
  "use strict";

  var getFiltersConditionsFromSelectionVariant = FilterHelper.getFiltersConditionsFromSelectionVariant;
  /**
   * Static class used by Visual Filter during runtime
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const VisualFilterRuntime = {
    selectionChanged(oEvent) {
      const oInteractiveChart = oEvent.getSource();
      const sOutParameter = oInteractiveChart.data("outParameter");
      const sValueListProperty = oInteractiveChart.data("valuelistProperty");
      const sDimension = oInteractiveChart.data("dimension");
      const sDimensionText = oInteractiveChart.data("dimensionText");
      const bMultipleSelectionAllowed = oInteractiveChart.data("multipleSelectionAllowed");
      const sDimensionType = oInteractiveChart.data("dimensionType");
      const oSelectedAggregation = oEvent.getParameter("bar") || oEvent.getParameter("point") || oEvent.getParameter("segment");
      const bIsAggregationSelected = oEvent.getParameter("selected");
      const oConditionModel = oInteractiveChart.getModel("$field");
      let aConditions = oConditionModel.getProperty("/conditions");
      if (!sOutParameter || sValueListProperty !== sDimension) {
        Log.error("VisualFilter: Cannot sync values with regular filter as out parameter is not configured properly!");
      } else {
        let sSelectionChangedValue = oSelectedAggregation.getBindingContext().getObject(sValueListProperty);
        if (sSelectionChangedValue) {
          let sSelectionChangedValueText = oSelectedAggregation.getBindingContext().getObject(sDimensionText);
          if (typeof sSelectionChangedValueText !== "string" && !(sSelectionChangedValueText instanceof String)) {
            sSelectionChangedValueText = undefined;
          }
          // if selection has been done on the aggregation then add to conditions
          if (bIsAggregationSelected) {
            if (bMultipleSelectionAllowed === "false") {
              aConditions = [];
            }
            if (sDimensionType === "Edm.DateTimeOffset") {
              sSelectionChangedValue = VisualFilterUtils._parseDateTime(sSelectionChangedValue);
            }
            const oCondition = Condition.createItemCondition(sSelectionChangedValue, sSelectionChangedValueText || undefined, {}, {});
            aConditions.push(oCondition);
          } else {
            // because selection was removed on the aggregation hence remove this from conditions
            aConditions = aConditions.filter(function (oCondition) {
              if (sDimensionType === "Edm.DateTimeOffset") {
                return oCondition.operator !== "EQ" || Date.parse(oCondition.values[0]) !== Date.parse(sSelectionChangedValue);
              }
              return oCondition.operator !== "EQ" || oCondition.values[0] !== sSelectionChangedValue;
            });
          }
          oConditionModel.setProperty("/conditions", aConditions);
        } else {
          Log.error("VisualFilter: No vaue found for the outParameter");
        }
      }
    },
    // THIS IS A FORMATTER
    getAggregationSelected(aConditions) {
      var _this$getBindingConte;
      const aSelectableValues = [];
      if (!this.getBindingContext()) {
        return;
      }
      for (let i = 0; i <= aConditions.length - 1; i++) {
        const oCondition = aConditions[i];
        // 1. get conditions with EQ operator (since visual filter can only deal with EQ operators) and get their values
        if (oCondition.operator === "EQ") {
          aSelectableValues.push(oCondition.values[0]);
        }
      }

      // access the interactive chart from the control.
      const oInteractiveChart = this.getParent();
      const sDimension = oInteractiveChart.data("dimension");
      const sDimensionType = oInteractiveChart.data("dimensionType");
      let sDimensionValue = (_this$getBindingConte = this.getBindingContext()) === null || _this$getBindingConte === void 0 ? void 0 : _this$getBindingConte.getObject(sDimension);
      if (sDimensionType === "Edm.DateTimeOffset") {
        sDimensionValue = VisualFilterUtils._parseDateTime(sDimensionValue);
      }
      return aSelectableValues.indexOf(sDimensionValue) > -1;
    },
    // THIS IS A FORMATTER
    getFiltersFromConditions() {
      var _oInteractiveChart$ge, _oInteractiveChart$ge2, _oInteractiveChart$ge3;
      for (var _len = arguments.length, aArguments = new Array(_len), _key = 0; _key < _len; _key++) {
        aArguments[_key] = arguments[_key];
      }
      const oInteractiveChart = this.getParent();
      const oFilterBar = (_oInteractiveChart$ge = oInteractiveChart.getParent()) === null || _oInteractiveChart$ge === void 0 ? void 0 : (_oInteractiveChart$ge2 = _oInteractiveChart$ge.getParent()) === null || _oInteractiveChart$ge2 === void 0 ? void 0 : (_oInteractiveChart$ge3 = _oInteractiveChart$ge2.getParent()) === null || _oInteractiveChart$ge3 === void 0 ? void 0 : _oInteractiveChart$ge3.getParent();
      const aInParameters = oInteractiveChart.data("inParameters").customData;
      const bIsDraftSupported = oInteractiveChart.data("draftSupported") === "true";
      const aPropertyInfoSet = oFilterBar.getPropertyInfo();
      const mConditions = {};
      const aValueListPropertyInfoSet = [];
      let oFilters;
      let aFilters = [];
      const aParameters = oInteractiveChart.data("parameters").customData;
      const oSelectionVariantAnnotation = CommonHelper.parseCustomData(oInteractiveChart.data("selectionVariantAnnotation"));
      const oInteractiveChartListBinding = oInteractiveChart.getBinding("bars") || oInteractiveChart.getBinding("points") || oInteractiveChart.getBinding("segments");
      const sPath = oInteractiveChartListBinding.getPath();
      const oMetaModel = oInteractiveChart.getModel().getMetaModel();
      const sEntitySetPath = oInteractiveChartListBinding.getPath();
      const filterConditions = getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, oSelectionVariantAnnotation, VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils));
      for (const i in aPropertyInfoSet) {
        aPropertyInfoSet[i].typeConfig = TypeUtil.getTypeConfig(aPropertyInfoSet[i].dataType, {}, {});
      }
      const oSelectionVariantConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
      // aInParameters and the bindings to in parameters are in the same order so we can rely on it to create our conditions
      Object.keys(oSelectionVariantConditions).forEach(function (sKey) {
        mConditions[sKey] = oSelectionVariantConditions[sKey];
        //fetch localDataProperty if selection variant key is based on vaue list property
        const inParameterForKey = aInParameters.find(function (inParameter) {
          return inParameter.valueListProperty === sKey;
        });
        const localDataProperty = inParameterForKey ? inParameterForKey.localDataProperty : sKey;
        if (!aParameters || aParameters && aParameters.indexOf(sKey) === -1) {
          for (const i in aPropertyInfoSet) {
            const propertyInfoSet = aPropertyInfoSet[i];
            if (localDataProperty === propertyInfoSet.name) {
              if (propertyInfoSet.typeConfig.baseType === "DateTime") {
                if (mConditions[sKey]) {
                  mConditions[sKey].forEach(function (condition) {
                    condition.values[0] = VisualFilterUtils._formatDateTime(condition.values[0]);
                  });
                }
              }
              aValueListPropertyInfoSet.push({
                name: sKey,
                typeConfig: propertyInfoSet.typeConfig
              });
            }
          }
        }
      });
      aInParameters.forEach(function (oInParameter, index) {
        if (aArguments[index].length > 0) {
          // store conditions with value list property since we are filtering on the value list collection path
          mConditions[oInParameter.valueListProperty] = aArguments[index];
          if (!aParameters || aParameters && aParameters.indexOf(oInParameter.valueListProperty) === -1) {
            // aPropertyInfoSet is list of properties from the filter bar but we need to create conditions for the value list
            // which could have a different collectionPath.
            // Only typeConfig from aPropertyInfoSet is required for getting the converted filters from conditions
            // so we update aPropertyInfoSet to have the valueListProperties only
            // This way conditions will be converted to sap.ui.model.Filter for the value list
            // This works because for in parameter mapping the property from the main entity type should be of the same type as the value list entity type
            // TODO: Follow up with MDC to check if they can provide a clean api to convert conditions into filters
            for (const i in aPropertyInfoSet) {
              // store conditions with value list property since we are filtering on the value list collection path
              const propertyInfoSet = aPropertyInfoSet[i];
              if (propertyInfoSet.name === oInParameter.localDataProperty) {
                if (propertyInfoSet.typeConfig.baseType === "DateTime") {
                  if (mConditions[oInParameter.valueListProperty]) {
                    mConditions[oInParameter.valueListProperty].forEach(function (condition) {
                      condition.values[0] = VisualFilterUtils._formatDateTime(condition.values[0]);
                    });
                  }
                }
                aValueListPropertyInfoSet.push({
                  name: oInParameter.valueListProperty,
                  typeConfig: propertyInfoSet.typeConfig
                });
              }
            }
          }
        }
      });
      const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      const sInfoPath = oInteractiveChart.data("infoPath");
      let bEnableBinding;
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      const aRequiredProperties = CommonHelper.parseCustomData(oInteractiveChart.data("requiredProperties"));
      if (aRequiredProperties.length) {
        const aConditions = Object.keys(mConditions) || [];
        const aNotMatchedConditions = [];
        aRequiredProperties.forEach(function (requiredPropertyPath) {
          if (aConditions.indexOf(requiredPropertyPath) === -1) {
            aNotMatchedConditions.push(requiredPropertyPath);
          }
        });
        if (!aNotMatchedConditions.length) {
          bEnableBinding = oInternalModelContext.getProperty(`${sInfoPath}/showError`);
          oInternalModelContext.setProperty(sInfoPath, {
            errorMessageTitle: "",
            errorMessage: "",
            showError: false
          });
        } else if (aNotMatchedConditions.length > 1) {
          oInternalModelContext.setProperty(sInfoPath, {
            errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
            errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF"),
            showError: true
          });
          return;
        } else {
          const sLabel = oMetaModel.getObject(`${sEntitySetPath}/${aNotMatchedConditions[0]}@com.sap.vocabularies.Common.v1.Label`) || aNotMatchedConditions[0];
          oInternalModelContext.setProperty(sInfoPath, {
            errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
            errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel),
            showError: true
          });
          return;
        }
      } else {
        bEnableBinding = oInternalModelContext.getProperty(`${sInfoPath}/showError`);
        oInternalModelContext.setProperty(sInfoPath, {
          errorMessageTitle: "",
          errorMessage: "",
          showError: false
        });
      }
      const sFilterEntityName = oFilterBar.data("entityType").split("/")[1];
      const sChartEntityName = sPath.split("/")[1].split("(")[0];
      if (aParameters && aParameters.length && sFilterEntityName === sChartEntityName) {
        const sBindingPath = bEnableBinding ? FilterUtils.getBindingPathForParameters(oFilterBar, mConditions, aPropertyInfoSet, aParameters) : undefined;
        if (sBindingPath) {
          oInteractiveChartListBinding.sPath = sBindingPath;
        }
      }
      if (aParameters && aParameters.length) {
        //Remove parameters from mConditions since it should not be a part of $filter
        aParameters.forEach(function (parameter) {
          if (mConditions[parameter]) {
            delete mConditions[parameter];
          }
        });
      }

      //Only keep the actual value of filters and remove type informations
      Object.keys(mConditions).forEach(function (key) {
        mConditions[key].forEach(function (condition) {
          if (condition.values.length > 1) {
            condition.values = condition.values.slice(0, 1);
          }
        });
      });
      // On InitialLoad when initiallayout is visual, aPropertyInfoSet is always empty and we cannot get filters from MDCFilterUtil.
      // Also when SVQualifier is there then we should not change the listbinding filters to empty as we are not getting filters from MDCFilterUtil but
      // instead we need to not call listbinding.filter and use the template time binding itself.
      if (Object.keys(mConditions).length > 0 && aValueListPropertyInfoSet.length) {
        oFilters = MdcFilterUtil.getFilterInfo(oFilterBar, mConditions, aValueListPropertyInfoSet, []).filters;
        if (oFilters) {
          if (!oFilters.aFilters) {
            aFilters.push(oFilters);
          } else if (oFilters.aFilters) {
            aFilters = oFilters.aFilters;
          }
        }
      }
      if (bIsDraftSupported) {
        aFilters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
      }
      if (aFilters && aFilters.length > 0) {
        oInteractiveChartListBinding.filter(aFilters);
      } else if (!Object.keys(mConditions).length) {
        oInteractiveChartListBinding.filter();
      }
      // update the interactive chart binding
      if (bEnableBinding && oInteractiveChartListBinding.isSuspended()) {
        oInteractiveChartListBinding.resume();
      }
      return aFilters;
    },
    getFilterCounts(oConditions) {
      if (oConditions.length > 0) {
        return `(${oConditions.length})`;
      } else {
        return undefined;
      }
    },
    scaleVisualFilterValue(oValue, scaleFactor, numberOfFractionalDigits, currency, oRawValue) {
      // ScaleFactor if defined is priority for formatting
      if (scaleFactor) {
        return VisualFilterUtils.getFormattedNumber(oRawValue, scaleFactor, numberOfFractionalDigits);
        // If Scale Factor is not defined, use currency formatting
      } else if (currency) {
        return VisualFilterUtils.getFormattedNumber(oRawValue, undefined, undefined, currency);
        // No ScaleFactor and no Currency, use numberOfFractionalDigits defined in DataPoint
      } else if (numberOfFractionalDigits > 0) {
        // Number of fractional digits shall not exceed 2, unless required by currency
        numberOfFractionalDigits = numberOfFractionalDigits > 2 ? 2 : numberOfFractionalDigits;
        return VisualFilterUtils.getFormattedNumber(oRawValue, undefined, numberOfFractionalDigits);
      } else {
        return oValue;
      }
    },
    fireValueHelp(oEvent) {
      oEvent.getSource().getParent().getParent().getParent().fireValueHelpRequest();
    }
  };

  /**
   * @global
   */
  return VisualFilterRuntime;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXJSdW50aW1lIiwic2VsZWN0aW9uQ2hhbmdlZCIsIm9FdmVudCIsIm9JbnRlcmFjdGl2ZUNoYXJ0IiwiZ2V0U291cmNlIiwic091dFBhcmFtZXRlciIsImRhdGEiLCJzVmFsdWVMaXN0UHJvcGVydHkiLCJzRGltZW5zaW9uIiwic0RpbWVuc2lvblRleHQiLCJiTXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkIiwic0RpbWVuc2lvblR5cGUiLCJvU2VsZWN0ZWRBZ2dyZWdhdGlvbiIsImdldFBhcmFtZXRlciIsImJJc0FnZ3JlZ2F0aW9uU2VsZWN0ZWQiLCJvQ29uZGl0aW9uTW9kZWwiLCJnZXRNb2RlbCIsImFDb25kaXRpb25zIiwiZ2V0UHJvcGVydHkiLCJMb2ciLCJlcnJvciIsInNTZWxlY3Rpb25DaGFuZ2VkVmFsdWUiLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldE9iamVjdCIsInNTZWxlY3Rpb25DaGFuZ2VkVmFsdWVUZXh0IiwiU3RyaW5nIiwidW5kZWZpbmVkIiwiVmlzdWFsRmlsdGVyVXRpbHMiLCJfcGFyc2VEYXRlVGltZSIsIm9Db25kaXRpb24iLCJDb25kaXRpb24iLCJjcmVhdGVJdGVtQ29uZGl0aW9uIiwicHVzaCIsImZpbHRlciIsIm9wZXJhdG9yIiwiRGF0ZSIsInBhcnNlIiwidmFsdWVzIiwic2V0UHJvcGVydHkiLCJnZXRBZ2dyZWdhdGlvblNlbGVjdGVkIiwiYVNlbGVjdGFibGVWYWx1ZXMiLCJpIiwibGVuZ3RoIiwiZ2V0UGFyZW50Iiwic0RpbWVuc2lvblZhbHVlIiwiaW5kZXhPZiIsImdldEZpbHRlcnNGcm9tQ29uZGl0aW9ucyIsImFBcmd1bWVudHMiLCJvRmlsdGVyQmFyIiwiYUluUGFyYW1ldGVycyIsImN1c3RvbURhdGEiLCJiSXNEcmFmdFN1cHBvcnRlZCIsImFQcm9wZXJ0eUluZm9TZXQiLCJnZXRQcm9wZXJ0eUluZm8iLCJtQ29uZGl0aW9ucyIsImFWYWx1ZUxpc3RQcm9wZXJ0eUluZm9TZXQiLCJvRmlsdGVycyIsImFGaWx0ZXJzIiwiYVBhcmFtZXRlcnMiLCJvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24iLCJDb21tb25IZWxwZXIiLCJwYXJzZUN1c3RvbURhdGEiLCJvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nIiwiZ2V0QmluZGluZyIsInNQYXRoIiwiZ2V0UGF0aCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJzRW50aXR5U2V0UGF0aCIsImZpbHRlckNvbmRpdGlvbnMiLCJnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50IiwiZ2V0Q3VzdG9tQ29uZGl0aW9ucyIsImJpbmQiLCJ0eXBlQ29uZmlnIiwiVHlwZVV0aWwiLCJnZXRUeXBlQ29uZmlnIiwiZGF0YVR5cGUiLCJvU2VsZWN0aW9uVmFyaWFudENvbmRpdGlvbnMiLCJjb252ZXJ0RmlsdGVyQ29uZGlvbnMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInNLZXkiLCJpblBhcmFtZXRlckZvcktleSIsImZpbmQiLCJpblBhcmFtZXRlciIsInZhbHVlTGlzdFByb3BlcnR5IiwibG9jYWxEYXRhUHJvcGVydHkiLCJwcm9wZXJ0eUluZm9TZXQiLCJuYW1lIiwiYmFzZVR5cGUiLCJjb25kaXRpb24iLCJfZm9ybWF0RGF0ZVRpbWUiLCJvSW5QYXJhbWV0ZXIiLCJpbmRleCIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsInNJbmZvUGF0aCIsImJFbmFibGVCaW5kaW5nIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImFSZXF1aXJlZFByb3BlcnRpZXMiLCJhTm90TWF0Y2hlZENvbmRpdGlvbnMiLCJyZXF1aXJlZFByb3BlcnR5UGF0aCIsImVycm9yTWVzc2FnZVRpdGxlIiwiZXJyb3JNZXNzYWdlIiwic2hvd0Vycm9yIiwiZ2V0VGV4dCIsInNMYWJlbCIsInNGaWx0ZXJFbnRpdHlOYW1lIiwic3BsaXQiLCJzQ2hhcnRFbnRpdHlOYW1lIiwic0JpbmRpbmdQYXRoIiwiRmlsdGVyVXRpbHMiLCJnZXRCaW5kaW5nUGF0aEZvclBhcmFtZXRlcnMiLCJwYXJhbWV0ZXIiLCJrZXkiLCJzbGljZSIsIk1kY0ZpbHRlclV0aWwiLCJnZXRGaWx0ZXJJbmZvIiwiZmlsdGVycyIsIkZpbHRlciIsIkZpbHRlck9wZXJhdG9yIiwiRVEiLCJpc1N1c3BlbmRlZCIsInJlc3VtZSIsImdldEZpbHRlckNvdW50cyIsIm9Db25kaXRpb25zIiwic2NhbGVWaXN1YWxGaWx0ZXJWYWx1ZSIsIm9WYWx1ZSIsInNjYWxlRmFjdG9yIiwibnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzIiwiY3VycmVuY3kiLCJvUmF3VmFsdWUiLCJnZXRGb3JtYXR0ZWROdW1iZXIiLCJmaXJlVmFsdWVIZWxwIiwiZmlyZVZhbHVlSGVscFJlcXVlc3QiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZpc3VhbEZpbHRlclJ1bnRpbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgVmlzdWFsRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL2ZpbHRlcmJhci91dGlscy9WaXN1YWxGaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRmlsdGVySGVscGVyXCI7XG5pbXBvcnQgVHlwZVV0aWwgZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvVHlwZVV0aWxcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgTWRjRmlsdGVyVXRpbCBmcm9tIFwic2FwL3VpL21kYy91dGlsL0ZpbHRlclV0aWxcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbi8qKlxuICogU3RhdGljIGNsYXNzIHVzZWQgYnkgVmlzdWFsIEZpbHRlciBkdXJpbmcgcnVudGltZVxuICpcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGludGVybmFsL2V4cGVyaW1lbnRhbCB1c2UhXG4gKi9cbmNvbnN0IFZpc3VhbEZpbHRlclJ1bnRpbWUgPSB7XG5cdHNlbGVjdGlvbkNoYW5nZWQob0V2ZW50OiBhbnkpIHtcblx0XHRjb25zdCBvSW50ZXJhY3RpdmVDaGFydCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBzT3V0UGFyYW1ldGVyID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcIm91dFBhcmFtZXRlclwiKTtcblx0XHRjb25zdCBzVmFsdWVMaXN0UHJvcGVydHkgPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwidmFsdWVsaXN0UHJvcGVydHlcIik7XG5cdFx0Y29uc3Qgc0RpbWVuc2lvbiA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJkaW1lbnNpb25cIik7XG5cdFx0Y29uc3Qgc0RpbWVuc2lvblRleHQgPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwiZGltZW5zaW9uVGV4dFwiKTtcblx0XHRjb25zdCBiTXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcIm11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZFwiKTtcblx0XHRjb25zdCBzRGltZW5zaW9uVHlwZSA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJkaW1lbnNpb25UeXBlXCIpO1xuXHRcdGNvbnN0IG9TZWxlY3RlZEFnZ3JlZ2F0aW9uID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImJhclwiKSB8fCBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicG9pbnRcIikgfHwgb0V2ZW50LmdldFBhcmFtZXRlcihcInNlZ21lbnRcIik7XG5cdFx0Y29uc3QgYklzQWdncmVnYXRpb25TZWxlY3RlZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJzZWxlY3RlZFwiKTtcblx0XHRjb25zdCBvQ29uZGl0aW9uTW9kZWwgPSBvSW50ZXJhY3RpdmVDaGFydC5nZXRNb2RlbChcIiRmaWVsZFwiKTtcblx0XHRsZXQgYUNvbmRpdGlvbnMgPSBvQ29uZGl0aW9uTW9kZWwuZ2V0UHJvcGVydHkoXCIvY29uZGl0aW9uc1wiKTtcblxuXHRcdGlmICghc091dFBhcmFtZXRlciB8fCBzVmFsdWVMaXN0UHJvcGVydHkgIT09IHNEaW1lbnNpb24pIHtcblx0XHRcdExvZy5lcnJvcihcIlZpc3VhbEZpbHRlcjogQ2Fubm90IHN5bmMgdmFsdWVzIHdpdGggcmVndWxhciBmaWx0ZXIgYXMgb3V0IHBhcmFtZXRlciBpcyBub3QgY29uZmlndXJlZCBwcm9wZXJseSFcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlID0gb1NlbGVjdGVkQWdncmVnYXRpb24uZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRPYmplY3Qoc1ZhbHVlTGlzdFByb3BlcnR5KTtcblx0XHRcdGlmIChzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlKSB7XG5cdFx0XHRcdGxldCBzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlVGV4dCA9IG9TZWxlY3RlZEFnZ3JlZ2F0aW9uLmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0T2JqZWN0KHNEaW1lbnNpb25UZXh0KTtcblx0XHRcdFx0aWYgKHR5cGVvZiBzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlVGV4dCAhPT0gXCJzdHJpbmdcIiAmJiAhKHNTZWxlY3Rpb25DaGFuZ2VkVmFsdWVUZXh0IGluc3RhbmNlb2YgU3RyaW5nKSkge1xuXHRcdFx0XHRcdHNTZWxlY3Rpb25DaGFuZ2VkVmFsdWVUZXh0ID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGlmIHNlbGVjdGlvbiBoYXMgYmVlbiBkb25lIG9uIHRoZSBhZ2dyZWdhdGlvbiB0aGVuIGFkZCB0byBjb25kaXRpb25zXG5cdFx0XHRcdGlmIChiSXNBZ2dyZWdhdGlvblNlbGVjdGVkKSB7XG5cdFx0XHRcdFx0aWYgKGJNdWx0aXBsZVNlbGVjdGlvbkFsbG93ZWQgPT09IFwiZmFsc2VcIikge1xuXHRcdFx0XHRcdFx0YUNvbmRpdGlvbnMgPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHNEaW1lbnNpb25UeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiKSB7XG5cdFx0XHRcdFx0XHRzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlID0gVmlzdWFsRmlsdGVyVXRpbHMuX3BhcnNlRGF0ZVRpbWUoc1NlbGVjdGlvbkNoYW5nZWRWYWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IG9Db25kaXRpb24gPSBDb25kaXRpb24uY3JlYXRlSXRlbUNvbmRpdGlvbihcblx0XHRcdFx0XHRcdHNTZWxlY3Rpb25DaGFuZ2VkVmFsdWUsXG5cdFx0XHRcdFx0XHRzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlVGV4dCB8fCB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHR7fSxcblx0XHRcdFx0XHRcdHt9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhQ29uZGl0aW9ucy5wdXNoKG9Db25kaXRpb24pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGJlY2F1c2Ugc2VsZWN0aW9uIHdhcyByZW1vdmVkIG9uIHRoZSBhZ2dyZWdhdGlvbiBoZW5jZSByZW1vdmUgdGhpcyBmcm9tIGNvbmRpdGlvbnNcblx0XHRcdFx0XHRhQ29uZGl0aW9ucyA9IGFDb25kaXRpb25zLmZpbHRlcihmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAoc0RpbWVuc2lvblR5cGUgPT09IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9Db25kaXRpb24ub3BlcmF0b3IgIT09IFwiRVFcIiB8fCBEYXRlLnBhcnNlKG9Db25kaXRpb24udmFsdWVzWzBdKSAhPT0gRGF0ZS5wYXJzZShzU2VsZWN0aW9uQ2hhbmdlZFZhbHVlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBvQ29uZGl0aW9uLm9wZXJhdG9yICE9PSBcIkVRXCIgfHwgb0NvbmRpdGlvbi52YWx1ZXNbMF0gIT09IHNTZWxlY3Rpb25DaGFuZ2VkVmFsdWU7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0NvbmRpdGlvbk1vZGVsLnNldFByb3BlcnR5KFwiL2NvbmRpdGlvbnNcIiwgYUNvbmRpdGlvbnMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiVmlzdWFsRmlsdGVyOiBObyB2YXVlIGZvdW5kIGZvciB0aGUgb3V0UGFyYW1ldGVyXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Ly8gVEhJUyBJUyBBIEZPUk1BVFRFUlxuXHRnZXRBZ2dyZWdhdGlvblNlbGVjdGVkKHRoaXM6IE1hbmFnZWRPYmplY3QsIGFDb25kaXRpb25zOiBhbnkpIHtcblx0XHRjb25zdCBhU2VsZWN0YWJsZVZhbHVlcyA9IFtdO1xuXHRcdGlmICghdGhpcy5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDw9IGFDb25kaXRpb25zLmxlbmd0aCAtIDE7IGkrKykge1xuXHRcdFx0Y29uc3Qgb0NvbmRpdGlvbiA9IGFDb25kaXRpb25zW2ldO1xuXHRcdFx0Ly8gMS4gZ2V0IGNvbmRpdGlvbnMgd2l0aCBFUSBvcGVyYXRvciAoc2luY2UgdmlzdWFsIGZpbHRlciBjYW4gb25seSBkZWFsIHdpdGggRVEgb3BlcmF0b3JzKSBhbmQgZ2V0IHRoZWlyIHZhbHVlc1xuXHRcdFx0aWYgKG9Db25kaXRpb24ub3BlcmF0b3IgPT09IFwiRVFcIikge1xuXHRcdFx0XHRhU2VsZWN0YWJsZVZhbHVlcy5wdXNoKG9Db25kaXRpb24udmFsdWVzWzBdKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBhY2Nlc3MgdGhlIGludGVyYWN0aXZlIGNoYXJ0IGZyb20gdGhlIGNvbnRyb2wuXG5cdFx0Y29uc3Qgb0ludGVyYWN0aXZlQ2hhcnQgPSB0aGlzLmdldFBhcmVudCgpIGFzIENvbnRyb2w7XG5cdFx0Y29uc3Qgc0RpbWVuc2lvbiA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJkaW1lbnNpb25cIik7XG5cdFx0Y29uc3Qgc0RpbWVuc2lvblR5cGUgPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwiZGltZW5zaW9uVHlwZVwiKTtcblx0XHRsZXQgc0RpbWVuc2lvblZhbHVlID0gdGhpcy5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRPYmplY3Qoc0RpbWVuc2lvbik7XG5cdFx0aWYgKHNEaW1lbnNpb25UeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiKSB7XG5cdFx0XHRzRGltZW5zaW9uVmFsdWUgPSBWaXN1YWxGaWx0ZXJVdGlscy5fcGFyc2VEYXRlVGltZShzRGltZW5zaW9uVmFsdWUpIGFzIGFueTtcblx0XHR9XG5cdFx0cmV0dXJuIGFTZWxlY3RhYmxlVmFsdWVzLmluZGV4T2Yoc0RpbWVuc2lvblZhbHVlKSA+IC0xO1xuXHR9LFxuXHQvLyBUSElTIElTIEEgRk9STUFUVEVSXG5cdGdldEZpbHRlcnNGcm9tQ29uZGl0aW9ucyh0aGlzOiBNYW5hZ2VkT2JqZWN0LCAuLi5hQXJndW1lbnRzOiBhbnlbXSkge1xuXHRcdGNvbnN0IG9JbnRlcmFjdGl2ZUNoYXJ0ID0gdGhpcy5nZXRQYXJlbnQoKSBhcyBDb250cm9sO1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBvSW50ZXJhY3RpdmVDaGFydC5nZXRQYXJlbnQoKT8uZ2V0UGFyZW50KCk/LmdldFBhcmVudCgpPy5nZXRQYXJlbnQoKSBhcyBhbnk7XG5cdFx0Y29uc3QgYUluUGFyYW1ldGVycyA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJpblBhcmFtZXRlcnNcIikuY3VzdG9tRGF0YTtcblx0XHRjb25zdCBiSXNEcmFmdFN1cHBvcnRlZCA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJkcmFmdFN1cHBvcnRlZFwiKSA9PT0gXCJ0cnVlXCI7XG5cdFx0Y29uc3QgYVByb3BlcnR5SW5mb1NldCA9IG9GaWx0ZXJCYXIuZ2V0UHJvcGVydHlJbmZvKCk7XG5cdFx0Y29uc3QgbUNvbmRpdGlvbnM6IGFueSA9IHt9O1xuXHRcdGNvbnN0IGFWYWx1ZUxpc3RQcm9wZXJ0eUluZm9TZXQ6IGFueVtdID0gW107XG5cdFx0bGV0IG9GaWx0ZXJzO1xuXHRcdGxldCBhRmlsdGVycyA9IFtdO1xuXHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInBhcmFtZXRlcnNcIikuY3VzdG9tRGF0YTtcblx0XHRjb25zdCBvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24gPSBDb21tb25IZWxwZXIucGFyc2VDdXN0b21EYXRhKG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvblwiKSk7XG5cdFx0Y29uc3Qgb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZyA9IChvSW50ZXJhY3RpdmVDaGFydC5nZXRCaW5kaW5nKFwiYmFyc1wiKSB8fFxuXHRcdFx0b0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZyhcInBvaW50c1wiKSB8fFxuXHRcdFx0b0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZyhcInNlZ21lbnRzXCIpKSBhcyBhbnk7XG5cdFx0Y29uc3Qgc1BhdGggPSBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLmdldFBhdGgoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0ludGVyYWN0aXZlQ2hhcnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGZpbHRlckNvbmRpdGlvbnMgPSBnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50KFxuXHRcdFx0c0VudGl0eVNldFBhdGgsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0VmlzdWFsRmlsdGVyVXRpbHMuZ2V0Q3VzdG9tQ29uZGl0aW9ucy5iaW5kKFZpc3VhbEZpbHRlclV0aWxzKVxuXHRcdCk7XG5cdFx0Zm9yIChjb25zdCBpIGluIGFQcm9wZXJ0eUluZm9TZXQpIHtcblx0XHRcdGFQcm9wZXJ0eUluZm9TZXRbaV0udHlwZUNvbmZpZyA9IFR5cGVVdGlsLmdldFR5cGVDb25maWcoYVByb3BlcnR5SW5mb1NldFtpXS5kYXRhVHlwZSwge30sIHt9KTtcblx0XHR9XG5cdFx0Y29uc3Qgb1NlbGVjdGlvblZhcmlhbnRDb25kaXRpb25zID0gVmlzdWFsRmlsdGVyVXRpbHMuY29udmVydEZpbHRlckNvbmRpb25zKGZpbHRlckNvbmRpdGlvbnMpO1xuXHRcdC8vIGFJblBhcmFtZXRlcnMgYW5kIHRoZSBiaW5kaW5ncyB0byBpbiBwYXJhbWV0ZXJzIGFyZSBpbiB0aGUgc2FtZSBvcmRlciBzbyB3ZSBjYW4gcmVseSBvbiBpdCB0byBjcmVhdGUgb3VyIGNvbmRpdGlvbnNcblx0XHRPYmplY3Qua2V5cyhvU2VsZWN0aW9uVmFyaWFudENvbmRpdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0bUNvbmRpdGlvbnNbc0tleV0gPSBvU2VsZWN0aW9uVmFyaWFudENvbmRpdGlvbnNbc0tleV07XG5cdFx0XHQvL2ZldGNoIGxvY2FsRGF0YVByb3BlcnR5IGlmIHNlbGVjdGlvbiB2YXJpYW50IGtleSBpcyBiYXNlZCBvbiB2YXVlIGxpc3QgcHJvcGVydHlcblx0XHRcdGNvbnN0IGluUGFyYW1ldGVyRm9yS2V5ID0gYUluUGFyYW1ldGVycy5maW5kKGZ1bmN0aW9uIChpblBhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRcdHJldHVybiBpblBhcmFtZXRlci52YWx1ZUxpc3RQcm9wZXJ0eSA9PT0gc0tleTtcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgbG9jYWxEYXRhUHJvcGVydHkgPSBpblBhcmFtZXRlckZvcktleSA/IGluUGFyYW1ldGVyRm9yS2V5LmxvY2FsRGF0YVByb3BlcnR5IDogc0tleTtcblx0XHRcdGlmICghYVBhcmFtZXRlcnMgfHwgKGFQYXJhbWV0ZXJzICYmIGFQYXJhbWV0ZXJzLmluZGV4T2Yoc0tleSkgPT09IC0xKSkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gYVByb3BlcnR5SW5mb1NldCkge1xuXHRcdFx0XHRcdGNvbnN0IHByb3BlcnR5SW5mb1NldCA9IGFQcm9wZXJ0eUluZm9TZXRbaV07XG5cdFx0XHRcdFx0aWYgKGxvY2FsRGF0YVByb3BlcnR5ID09PSBwcm9wZXJ0eUluZm9TZXQubmFtZSkge1xuXHRcdFx0XHRcdFx0aWYgKHByb3BlcnR5SW5mb1NldC50eXBlQ29uZmlnLmJhc2VUeXBlID09PSBcIkRhdGVUaW1lXCIpIHtcblx0XHRcdFx0XHRcdFx0aWYgKG1Db25kaXRpb25zW3NLZXldKSB7XG5cdFx0XHRcdFx0XHRcdFx0bUNvbmRpdGlvbnNbc0tleV0uZm9yRWFjaChmdW5jdGlvbiAoY29uZGl0aW9uOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbmRpdGlvbi52YWx1ZXNbMF0gPSBWaXN1YWxGaWx0ZXJVdGlscy5fZm9ybWF0RGF0ZVRpbWUoY29uZGl0aW9uLnZhbHVlc1swXSk7XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGFWYWx1ZUxpc3RQcm9wZXJ0eUluZm9TZXQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdG5hbWU6IHNLZXksXG5cdFx0XHRcdFx0XHRcdHR5cGVDb25maWc6IHByb3BlcnR5SW5mb1NldC50eXBlQ29uZmlnXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRhSW5QYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9JblBhcmFtZXRlcjogYW55LCBpbmRleDogYW55KSB7XG5cdFx0XHRpZiAoYUFyZ3VtZW50c1tpbmRleF0ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHQvLyBzdG9yZSBjb25kaXRpb25zIHdpdGggdmFsdWUgbGlzdCBwcm9wZXJ0eSBzaW5jZSB3ZSBhcmUgZmlsdGVyaW5nIG9uIHRoZSB2YWx1ZSBsaXN0IGNvbGxlY3Rpb24gcGF0aFxuXHRcdFx0XHRtQ29uZGl0aW9uc1tvSW5QYXJhbWV0ZXIudmFsdWVMaXN0UHJvcGVydHldID0gYUFyZ3VtZW50c1tpbmRleF07XG5cdFx0XHRcdGlmICghYVBhcmFtZXRlcnMgfHwgKGFQYXJhbWV0ZXJzICYmIGFQYXJhbWV0ZXJzLmluZGV4T2Yob0luUGFyYW1ldGVyLnZhbHVlTGlzdFByb3BlcnR5KSA9PT0gLTEpKSB7XG5cdFx0XHRcdFx0Ly8gYVByb3BlcnR5SW5mb1NldCBpcyBsaXN0IG9mIHByb3BlcnRpZXMgZnJvbSB0aGUgZmlsdGVyIGJhciBidXQgd2UgbmVlZCB0byBjcmVhdGUgY29uZGl0aW9ucyBmb3IgdGhlIHZhbHVlIGxpc3Rcblx0XHRcdFx0XHQvLyB3aGljaCBjb3VsZCBoYXZlIGEgZGlmZmVyZW50IGNvbGxlY3Rpb25QYXRoLlxuXHRcdFx0XHRcdC8vIE9ubHkgdHlwZUNvbmZpZyBmcm9tIGFQcm9wZXJ0eUluZm9TZXQgaXMgcmVxdWlyZWQgZm9yIGdldHRpbmcgdGhlIGNvbnZlcnRlZCBmaWx0ZXJzIGZyb20gY29uZGl0aW9uc1xuXHRcdFx0XHRcdC8vIHNvIHdlIHVwZGF0ZSBhUHJvcGVydHlJbmZvU2V0IHRvIGhhdmUgdGhlIHZhbHVlTGlzdFByb3BlcnRpZXMgb25seVxuXHRcdFx0XHRcdC8vIFRoaXMgd2F5IGNvbmRpdGlvbnMgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gc2FwLnVpLm1vZGVsLkZpbHRlciBmb3IgdGhlIHZhbHVlIGxpc3Rcblx0XHRcdFx0XHQvLyBUaGlzIHdvcmtzIGJlY2F1c2UgZm9yIGluIHBhcmFtZXRlciBtYXBwaW5nIHRoZSBwcm9wZXJ0eSBmcm9tIHRoZSBtYWluIGVudGl0eSB0eXBlIHNob3VsZCBiZSBvZiB0aGUgc2FtZSB0eXBlIGFzIHRoZSB2YWx1ZSBsaXN0IGVudGl0eSB0eXBlXG5cdFx0XHRcdFx0Ly8gVE9ETzogRm9sbG93IHVwIHdpdGggTURDIHRvIGNoZWNrIGlmIHRoZXkgY2FuIHByb3ZpZGUgYSBjbGVhbiBhcGkgdG8gY29udmVydCBjb25kaXRpb25zIGludG8gZmlsdGVyc1xuXHRcdFx0XHRcdGZvciAoY29uc3QgaSBpbiBhUHJvcGVydHlJbmZvU2V0KSB7XG5cdFx0XHRcdFx0XHQvLyBzdG9yZSBjb25kaXRpb25zIHdpdGggdmFsdWUgbGlzdCBwcm9wZXJ0eSBzaW5jZSB3ZSBhcmUgZmlsdGVyaW5nIG9uIHRoZSB2YWx1ZSBsaXN0IGNvbGxlY3Rpb24gcGF0aFxuXHRcdFx0XHRcdFx0Y29uc3QgcHJvcGVydHlJbmZvU2V0ID0gYVByb3BlcnR5SW5mb1NldFtpXTtcblx0XHRcdFx0XHRcdGlmIChwcm9wZXJ0eUluZm9TZXQubmFtZSA9PT0gb0luUGFyYW1ldGVyLmxvY2FsRGF0YVByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChwcm9wZXJ0eUluZm9TZXQudHlwZUNvbmZpZy5iYXNlVHlwZSA9PT0gXCJEYXRlVGltZVwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG1Db25kaXRpb25zW29JblBhcmFtZXRlci52YWx1ZUxpc3RQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdG1Db25kaXRpb25zW29JblBhcmFtZXRlci52YWx1ZUxpc3RQcm9wZXJ0eV0uZm9yRWFjaChmdW5jdGlvbiAoY29uZGl0aW9uOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uZGl0aW9uLnZhbHVlc1swXSA9IFZpc3VhbEZpbHRlclV0aWxzLl9mb3JtYXREYXRlVGltZShjb25kaXRpb24udmFsdWVzWzBdKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRhVmFsdWVMaXN0UHJvcGVydHlJbmZvU2V0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdG5hbWU6IG9JblBhcmFtZXRlci52YWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0XHR0eXBlQ29uZmlnOiBwcm9wZXJ0eUluZm9TZXQudHlwZUNvbmZpZ1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0Y29uc3Qgc0luZm9QYXRoID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcImluZm9QYXRoXCIpO1xuXHRcdGxldCBiRW5hYmxlQmluZGluZztcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cdFx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllcyA9IENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEob0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInJlcXVpcmVkUHJvcGVydGllc1wiKSk7XG5cdFx0aWYgKGFSZXF1aXJlZFByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBhQ29uZGl0aW9ucyA9IE9iamVjdC5rZXlzKG1Db25kaXRpb25zKSB8fCBbXTtcblx0XHRcdGNvbnN0IGFOb3RNYXRjaGVkQ29uZGl0aW9uczogYW55W10gPSBbXTtcblx0XHRcdGFSZXF1aXJlZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAocmVxdWlyZWRQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdFx0XHRpZiAoYUNvbmRpdGlvbnMuaW5kZXhPZihyZXF1aXJlZFByb3BlcnR5UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0YU5vdE1hdGNoZWRDb25kaXRpb25zLnB1c2gocmVxdWlyZWRQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGlmICghYU5vdE1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCkge1xuXHRcdFx0XHRiRW5hYmxlQmluZGluZyA9IG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShgJHtzSW5mb1BhdGh9L3Nob3dFcnJvcmApO1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0luZm9QYXRoLCB7XG5cdFx0XHRcdFx0ZXJyb3JNZXNzYWdlVGl0bGU6IFwiXCIsXG5cdFx0XHRcdFx0ZXJyb3JNZXNzYWdlOiBcIlwiLFxuXHRcdFx0XHRcdHNob3dFcnJvcjogZmFsc2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2UgaWYgKGFOb3RNYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW5mb1BhdGgsIHtcblx0XHRcdFx0XHRlcnJvck1lc3NhZ2VUaXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIiksXG5cdFx0XHRcdFx0ZXJyb3JNZXNzYWdlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX01VTFRJUExFVkZcIiksXG5cdFx0XHRcdFx0c2hvd0Vycm9yOiB0cnVlXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzTGFiZWwgPVxuXHRcdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS8ke2FOb3RNYXRjaGVkQ29uZGl0aW9uc1swXX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYCkgfHxcblx0XHRcdFx0XHRhTm90TWF0Y2hlZENvbmRpdGlvbnNbMF07XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW5mb1BhdGgsIHtcblx0XHRcdFx0XHRlcnJvck1lc3NhZ2VUaXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIiksXG5cdFx0XHRcdFx0ZXJyb3JNZXNzYWdlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX1NJTkdMRVZGXCIsIHNMYWJlbCksXG5cdFx0XHRcdFx0c2hvd0Vycm9yOiB0cnVlXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGJFbmFibGVCaW5kaW5nID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KGAke3NJbmZvUGF0aH0vc2hvd0Vycm9yYCk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0luZm9QYXRoLCB7IGVycm9yTWVzc2FnZVRpdGxlOiBcIlwiLCBlcnJvck1lc3NhZ2U6IFwiXCIsIHNob3dFcnJvcjogZmFsc2UgfSk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc0ZpbHRlckVudGl0eU5hbWUgPSBvRmlsdGVyQmFyLmRhdGEoXCJlbnRpdHlUeXBlXCIpLnNwbGl0KFwiL1wiKVsxXTtcblx0XHRjb25zdCBzQ2hhcnRFbnRpdHlOYW1lID0gc1BhdGguc3BsaXQoXCIvXCIpWzFdLnNwbGl0KFwiKFwiKVswXTtcblx0XHRpZiAoYVBhcmFtZXRlcnMgJiYgYVBhcmFtZXRlcnMubGVuZ3RoICYmIHNGaWx0ZXJFbnRpdHlOYW1lID09PSBzQ2hhcnRFbnRpdHlOYW1lKSB7XG5cdFx0XHRjb25zdCBzQmluZGluZ1BhdGggPSBiRW5hYmxlQmluZGluZ1xuXHRcdFx0XHQ/IEZpbHRlclV0aWxzLmdldEJpbmRpbmdQYXRoRm9yUGFyYW1ldGVycyhvRmlsdGVyQmFyLCBtQ29uZGl0aW9ucywgYVByb3BlcnR5SW5mb1NldCwgYVBhcmFtZXRlcnMpXG5cdFx0XHRcdDogdW5kZWZpbmVkO1xuXG5cdFx0XHRpZiAoc0JpbmRpbmdQYXRoKSB7XG5cdFx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuc1BhdGggPSBzQmluZGluZ1BhdGg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGFQYXJhbWV0ZXJzICYmIGFQYXJhbWV0ZXJzLmxlbmd0aCkge1xuXHRcdFx0Ly9SZW1vdmUgcGFyYW1ldGVycyBmcm9tIG1Db25kaXRpb25zIHNpbmNlIGl0IHNob3VsZCBub3QgYmUgYSBwYXJ0IG9mICRmaWx0ZXJcblx0XHRcdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRcdGlmIChtQ29uZGl0aW9uc1twYXJhbWV0ZXJdKSB7XG5cdFx0XHRcdFx0ZGVsZXRlIG1Db25kaXRpb25zW3BhcmFtZXRlcl07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vT25seSBrZWVwIHRoZSBhY3R1YWwgdmFsdWUgb2YgZmlsdGVycyBhbmQgcmVtb3ZlIHR5cGUgaW5mb3JtYXRpb25zXG5cdFx0T2JqZWN0LmtleXMobUNvbmRpdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRtQ29uZGl0aW9uc1trZXldLmZvckVhY2goZnVuY3Rpb24gKGNvbmRpdGlvbjogYW55KSB7XG5cdFx0XHRcdGlmIChjb25kaXRpb24udmFsdWVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRjb25kaXRpb24udmFsdWVzID0gY29uZGl0aW9uLnZhbHVlcy5zbGljZSgwLCAxKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0Ly8gT24gSW5pdGlhbExvYWQgd2hlbiBpbml0aWFsbGF5b3V0IGlzIHZpc3VhbCwgYVByb3BlcnR5SW5mb1NldCBpcyBhbHdheXMgZW1wdHkgYW5kIHdlIGNhbm5vdCBnZXQgZmlsdGVycyBmcm9tIE1EQ0ZpbHRlclV0aWwuXG5cdFx0Ly8gQWxzbyB3aGVuIFNWUXVhbGlmaWVyIGlzIHRoZXJlIHRoZW4gd2Ugc2hvdWxkIG5vdCBjaGFuZ2UgdGhlIGxpc3RiaW5kaW5nIGZpbHRlcnMgdG8gZW1wdHkgYXMgd2UgYXJlIG5vdCBnZXR0aW5nIGZpbHRlcnMgZnJvbSBNRENGaWx0ZXJVdGlsIGJ1dFxuXHRcdC8vIGluc3RlYWQgd2UgbmVlZCB0byBub3QgY2FsbCBsaXN0YmluZGluZy5maWx0ZXIgYW5kIHVzZSB0aGUgdGVtcGxhdGUgdGltZSBiaW5kaW5nIGl0c2VsZi5cblx0XHRpZiAoT2JqZWN0LmtleXMobUNvbmRpdGlvbnMpLmxlbmd0aCA+IDAgJiYgYVZhbHVlTGlzdFByb3BlcnR5SW5mb1NldC5sZW5ndGgpIHtcblx0XHRcdG9GaWx0ZXJzID0gKE1kY0ZpbHRlclV0aWwuZ2V0RmlsdGVySW5mbyhvRmlsdGVyQmFyLCBtQ29uZGl0aW9ucywgYVZhbHVlTGlzdFByb3BlcnR5SW5mb1NldCwgW10pIGFzIGFueSkuZmlsdGVycztcblx0XHRcdGlmIChvRmlsdGVycykge1xuXHRcdFx0XHRpZiAoIW9GaWx0ZXJzLmFGaWx0ZXJzKSB7XG5cdFx0XHRcdFx0YUZpbHRlcnMucHVzaChvRmlsdGVycyk7XG5cdFx0XHRcdH0gZWxzZSBpZiAob0ZpbHRlcnMuYUZpbHRlcnMpIHtcblx0XHRcdFx0XHRhRmlsdGVycyA9IG9GaWx0ZXJzLmFGaWx0ZXJzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChiSXNEcmFmdFN1cHBvcnRlZCkge1xuXHRcdFx0YUZpbHRlcnMucHVzaChuZXcgRmlsdGVyKFwiSXNBY3RpdmVFbnRpdHlcIiwgRmlsdGVyT3BlcmF0b3IuRVEsIHRydWUpKTtcblx0XHR9XG5cdFx0aWYgKGFGaWx0ZXJzICYmIGFGaWx0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuZmlsdGVyKGFGaWx0ZXJzKTtcblx0XHR9IGVsc2UgaWYgKCFPYmplY3Qua2V5cyhtQ29uZGl0aW9ucykubGVuZ3RoKSB7XG5cdFx0XHRvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLmZpbHRlcigpO1xuXHRcdH1cblx0XHQvLyB1cGRhdGUgdGhlIGludGVyYWN0aXZlIGNoYXJ0IGJpbmRpbmdcblx0XHRpZiAoYkVuYWJsZUJpbmRpbmcgJiYgb0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5pc1N1c3BlbmRlZCgpKSB7XG5cdFx0XHRvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLnJlc3VtZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gYUZpbHRlcnM7XG5cdH0sXG5cdGdldEZpbHRlckNvdW50cyhvQ29uZGl0aW9uczogYW55KSB7XG5cdFx0aWYgKG9Db25kaXRpb25zLmxlbmd0aCA+IDApIHtcblx0XHRcdHJldHVybiBgKCR7b0NvbmRpdGlvbnMubGVuZ3RofSlgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fSxcblxuXHRzY2FsZVZpc3VhbEZpbHRlclZhbHVlKG9WYWx1ZTogYW55LCBzY2FsZUZhY3RvcjogYW55LCBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHM6IGFueSwgY3VycmVuY3k6IGFueSwgb1Jhd1ZhbHVlOiBhbnkpIHtcblx0XHQvLyBTY2FsZUZhY3RvciBpZiBkZWZpbmVkIGlzIHByaW9yaXR5IGZvciBmb3JtYXR0aW5nXG5cdFx0aWYgKHNjYWxlRmFjdG9yKSB7XG5cdFx0XHRyZXR1cm4gVmlzdWFsRmlsdGVyVXRpbHMuZ2V0Rm9ybWF0dGVkTnVtYmVyKG9SYXdWYWx1ZSwgc2NhbGVGYWN0b3IsIG51bWJlck9mRnJhY3Rpb25hbERpZ2l0cyk7XG5cdFx0XHQvLyBJZiBTY2FsZSBGYWN0b3IgaXMgbm90IGRlZmluZWQsIHVzZSBjdXJyZW5jeSBmb3JtYXR0aW5nXG5cdFx0fSBlbHNlIGlmIChjdXJyZW5jeSkge1xuXHRcdFx0cmV0dXJuIFZpc3VhbEZpbHRlclV0aWxzLmdldEZvcm1hdHRlZE51bWJlcihvUmF3VmFsdWUsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjdXJyZW5jeSk7XG5cdFx0XHQvLyBObyBTY2FsZUZhY3RvciBhbmQgbm8gQ3VycmVuY3ksIHVzZSBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMgZGVmaW5lZCBpbiBEYXRhUG9pbnRcblx0XHR9IGVsc2UgaWYgKG51bWJlck9mRnJhY3Rpb25hbERpZ2l0cyA+IDApIHtcblx0XHRcdC8vIE51bWJlciBvZiBmcmFjdGlvbmFsIGRpZ2l0cyBzaGFsbCBub3QgZXhjZWVkIDIsIHVubGVzcyByZXF1aXJlZCBieSBjdXJyZW5jeVxuXHRcdFx0bnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzID0gbnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzID4gMiA/IDIgOiBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHM7XG5cdFx0XHRyZXR1cm4gVmlzdWFsRmlsdGVyVXRpbHMuZ2V0Rm9ybWF0dGVkTnVtYmVyKG9SYXdWYWx1ZSwgdW5kZWZpbmVkLCBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gb1ZhbHVlO1xuXHRcdH1cblx0fSxcblx0ZmlyZVZhbHVlSGVscChvRXZlbnQ6IGFueSkge1xuXHRcdG9FdmVudC5nZXRTb3VyY2UoKS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKS5maXJlVmFsdWVIZWxwUmVxdWVzdCgpO1xuXHR9XG59O1xuXG4vKipcbiAqIEBnbG9iYWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgVmlzdWFsRmlsdGVyUnVudGltZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUEsbUJBQW1CLEdBQUc7SUFDM0JDLGdCQUFnQixDQUFDQyxNQUFXLEVBQUU7TUFDN0IsTUFBTUMsaUJBQWlCLEdBQUdELE1BQU0sQ0FBQ0UsU0FBUyxFQUFFO01BQzVDLE1BQU1DLGFBQWEsR0FBR0YsaUJBQWlCLENBQUNHLElBQUksQ0FBQyxjQUFjLENBQUM7TUFDNUQsTUFBTUMsa0JBQWtCLEdBQUdKLGlCQUFpQixDQUFDRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7TUFDdEUsTUFBTUUsVUFBVSxHQUFHTCxpQkFBaUIsQ0FBQ0csSUFBSSxDQUFDLFdBQVcsQ0FBQztNQUN0RCxNQUFNRyxjQUFjLEdBQUdOLGlCQUFpQixDQUFDRyxJQUFJLENBQUMsZUFBZSxDQUFDO01BQzlELE1BQU1JLHlCQUF5QixHQUFHUCxpQkFBaUIsQ0FBQ0csSUFBSSxDQUFDLDBCQUEwQixDQUFDO01BQ3BGLE1BQU1LLGNBQWMsR0FBR1IsaUJBQWlCLENBQUNHLElBQUksQ0FBQyxlQUFlLENBQUM7TUFDOUQsTUFBTU0sb0JBQW9CLEdBQUdWLE1BQU0sQ0FBQ1csWUFBWSxDQUFDLEtBQUssQ0FBQyxJ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