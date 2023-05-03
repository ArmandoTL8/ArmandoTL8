/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/macros/CommonHelper", "sap/fe/macros/internal/helpers/ActionHelper", "sap/fe/macros/ODataMetaModelUtil", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, DataVisualization, CommonHelper, ActionHelper, ODataMetaModelUtil, JSONModel, ODataModelAnnotationHelper) {
  "use strict";

  var getUiControl = DataVisualization.getUiControl;
  function formatJSONToString(oCrit) {
    if (!oCrit) {
      return undefined;
    }
    let sCriticality = JSON.stringify(oCrit);
    sCriticality = sCriticality.replace(new RegExp("{", "g"), "\\{");
    sCriticality = sCriticality.replace(new RegExp("}", "g"), "\\}");
    return sCriticality;
  }
  function getEntitySetPath(oAnnotationContext) {
    const sAnnoPath = oAnnotationContext.getPath(),
      sPathEntitySetPath = sAnnoPath.replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant).*/, "");
    return sPathEntitySetPath;
  }
  const mChartType = {
    "com.sap.vocabularies.UI.v1.ChartType/Column": "column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnStacked": "stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnDual": "dual_column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual": "dual_stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnStacked100": "100_stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual100": "100_dual_stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/Bar": "bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarStacked": "stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarDual": "dual_bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarStackedDual": "dual_stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarStacked100": "100_stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarStackedDual100": "100_dual_stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/Area": "area",
    "com.sap.vocabularies.UI.v1.ChartType/AreaStacked": "stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/AreaStacked100": "100_stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalArea": "bar",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked": "stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked100": "100_stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/Line": "line",
    "com.sap.vocabularies.UI.v1.ChartType/LineDual": "dual_line",
    "com.sap.vocabularies.UI.v1.ChartType/Combination": "combination",
    "com.sap.vocabularies.UI.v1.ChartType/CombinationStacked": "stacked_combination",
    "com.sap.vocabularies.UI.v1.ChartType/CombinationDual": "dual_combination",
    "com.sap.vocabularies.UI.v1.ChartType/CombinationStackedDual": "dual_stacked_combination",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStacked": "horizontal_stacked_combination",
    "com.sap.vocabularies.UI.v1.ChartType/Pie": "pie",
    "com.sap.vocabularies.UI.v1.ChartType/Donut": "donut",
    "com.sap.vocabularies.UI.v1.ChartType/Scatter": "scatter",
    "com.sap.vocabularies.UI.v1.ChartType/Bubble": "bubble",
    "com.sap.vocabularies.UI.v1.ChartType/Radar": "line",
    "com.sap.vocabularies.UI.v1.ChartType/HeatMap": "heatmap",
    "com.sap.vocabularies.UI.v1.ChartType/TreeMap": "treemap",
    "com.sap.vocabularies.UI.v1.ChartType/Waterfall": "waterfall",
    "com.sap.vocabularies.UI.v1.ChartType/Bullet": "bullet",
    "com.sap.vocabularies.UI.v1.ChartType/VerticalBullet": "vertical_bullet",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalWaterfall": "horizontal_waterfall",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationDual": "dual_horizontal_combination",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStackedDual": "dual_horizontal_stacked_combination"
  };
  const mDimensionRole = {
    "com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category": "category",
    "com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Series": "series",
    "com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category2": "category2"
  };
  /**
   * Helper class for sap.fe.macros Chart phantom control for prepecosseing.
   * <h3><b>Note:</b></h3>
   * The class is experimental and the API/behaviour is not finalised
   * and hence this should not be used for productive usage.
   * Especially this class is not intended to be used for the FE scenario,
   * here we shall use sap.fe.macros.ChartHelper that is especially tailored for V4
   * meta model
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.62
   * @alias sap.fe.macros.ChartHelper
   */
  const ChartHelper = {
    getP13nMode(oViewData) {
      const aPersonalization = [],
        bVariantManagement = oViewData.variantManagement && (oViewData.variantManagement === "Page" || oViewData.variantManagement === "Control"),
        personalization = true; // by default enabled
      if (bVariantManagement && personalization) {
        if (personalization) {
          // full personalization scope
          return "Sort,Type,Item";
        } else if (typeof personalization === "object") {
          if (personalization.type) {
            aPersonalization.push("Type");
          }
          if (personalization.sort) {
            aPersonalization.push("Sort");
          }
          return aPersonalization.join(",");
        }
      }
    },
    formatChartType(oChartType) {
      return mChartType[oChartType.$EnumMember];
    },
    formatDimensions(oAnnotationContext) {
      const oAnnotation = oAnnotationContext.getObject("./"),
        oMetaModel = oAnnotationContext.getModel(),
        sEntitySetPath = getEntitySetPath(oAnnotationContext),
        aDimensions = [];
      let i, j;
      let bIsNavigationText = false;

      //perhaps there are no dimension attributes
      oAnnotation.DimensionAttributes = oAnnotation.DimensionAttributes || [];
      for (i = 0; i < oAnnotation.Dimensions.length; i++) {
        const sKey = oAnnotation.Dimensions[i].$PropertyPath;
        const oText = oMetaModel.getObject(`${sEntitySetPath + sKey}@com.sap.vocabularies.Common.v1.Text`) || {};
        if (sKey.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Dimension: ${sKey} from an association cannot be used`);
        }
        if (oText.$Path && oText.$Path.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Text Property: ${oText.$Path} from an association cannot be used for the dimension ${sKey}`);
          bIsNavigationText = true;
        }
        const oDimension = {
          key: sKey,
          textPath: !bIsNavigationText ? oText.$Path : undefined,
          label: oMetaModel.getObject(`${sEntitySetPath + sKey}@com.sap.vocabularies.Common.v1.Label`),
          role: "category"
        };
        for (j = 0; j < oAnnotation.DimensionAttributes.length; j++) {
          const oAttribute = oAnnotation.DimensionAttributes[j];
          if (oDimension.key === oAttribute.Dimension.$PropertyPath) {
            oDimension.role = mDimensionRole[oAttribute.Role.$EnumMember] || oDimension.role;
            break;
          }
        }
        oDimension.criticality = ODataMetaModelUtil.fetchCriticality(oMetaModel, oMetaModel.createBindingContext(sEntitySetPath + sKey)).then(formatJSONToString);
        aDimensions.push(oDimension);
      }
      const oDimensionModel = new JSONModel(aDimensions);
      oDimensionModel.$$valueAsPromise = true;
      return oDimensionModel.createBindingContext("/");
    },
    formatMeasures(oAnnotationContext) {
      return oAnnotationContext.getModel().getData();
    },
    getUiChart(oPresentationContext) {
      return getUiControl(oPresentationContext, "@com.sap.vocabularies.UI.v1.Chart");
    },
    getOperationAvailableMap(oChartContext, oContext) {
      const aChartCollection = oChartContext.Actions || [];
      return JSON.stringify(ActionHelper.getOperationAvailableMap(aChartCollection, "chart", oContext));
    },
    /**
     * Returns a stringified JSON object containing Presentation Variant sort conditions.
     *
     * @param oContext
     * @param oPresentationVariant Presentation Variant annotation
     * @param sPresentationVariantPath
     * @param oApplySupported
     * @returns Stringified JSON object
     */
    getSortConditions: function (oContext, oPresentationVariant, sPresentationVariantPath, oApplySupported) {
      if (oPresentationVariant && CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath) && oPresentationVariant.SortOrder) {
        const aSortConditions = {
          sorters: []
        };
        const sEntityPath = oContext.getPath(0).split("@")[0];
        oPresentationVariant.SortOrder.forEach(function () {
          let oCondition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          let oSortProperty = "";
          const oSorter = {};
          if (oCondition.DynamicProperty) {
            var _oContext$getModel$ge;
            oSortProperty = "_fe_aggregatable_" + ((_oContext$getModel$ge = oContext.getModel(0).getObject(sEntityPath + oCondition.DynamicProperty.$AnnotationPath)) === null || _oContext$getModel$ge === void 0 ? void 0 : _oContext$getModel$ge.Name);
          } else if (oCondition.Property) {
            const aGroupableProperties = oApplySupported.GroupableProperties;
            if (aGroupableProperties && aGroupableProperties.length) {
              for (let i = 0; i < aGroupableProperties.length; i++) {
                if (aGroupableProperties[i].$PropertyPath === oCondition.Property.$PropertyPath) {
                  oSortProperty = "_fe_groupable_" + oCondition.Property.$PropertyPath;
                  break;
                }
                if (!oSortProperty) {
                  oSortProperty = "_fe_aggregatable_" + oCondition.Property.$PropertyPath;
                }
              }
            } else if (oContext.getModel(0).getObject(sEntityPath + oCondition.Property.$PropertyPath + "@Org.OData.Aggregation.V1.Groupable")) {
              oSortProperty = "_fe_groupable_" + oCondition.Property.$PropertyPath;
            } else {
              oSortProperty = "_fe_aggregatable_" + oCondition.Property.$PropertyPath;
            }
          }
          if (oSortProperty) {
            oSorter.name = oSortProperty;
            oSorter.descending = !!oCondition.Descending;
            aSortConditions.sorters.push(oSorter);
          } else {
            throw new Error("Please define the right path to the sort property");
          }
        });
        return JSON.stringify(aSortConditions);
      }
      return undefined;
    },
    getBindingData(sTargetCollection, oContext, aActions) {
      const aOperationAvailablePath = [];
      let sSelect;
      for (const i in aActions) {
        if (aActions[i].$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
          const sActionName = aActions[i].Action;
          const oActionOperationAvailable = CommonHelper.getActionPath(oContext, false, sActionName, true);
          if (oActionOperationAvailable && oActionOperationAvailable.$Path) {
            aOperationAvailablePath.push(`'${oActionOperationAvailable.$Path}'`);
          } else if (oActionOperationAvailable === null) {
            // We disabled action advertisement but kept it in the code for the time being
            //aOperationAvailablePath.push(sActionName);
          }
        }
      }
      if (aOperationAvailablePath.length > 0) {
        //TODO: request fails with $select. check this with odata v4 model
        sSelect = " $select: '" + aOperationAvailablePath.join() + "'";
      }
      return "'{path: '" + (oContext.getObject("$kind") === "EntitySet" ? "/" : "") + oContext.getObject("@sapui.name") + "'" + (sSelect ? ",parameters:{" + sSelect + "}" : "") + "}'";
    },
    _getModel(oCollection, oInterface) {
      return oInterface.context;
    },
    // TODO: combine this one with the one from the table
    isDataFieldForActionButtonEnabled(bIsBound, sAction, oCollection, sOperationAvailableMap, sEnableSelectOn) {
      if (bIsBound !== true) {
        return "true";
      }
      const oModel = oCollection.getModel();
      const sNavPath = oCollection.getPath();
      const sPartner = oModel.getObject(sNavPath).$Partner;
      const oOperationAvailableMap = sOperationAvailableMap && JSON.parse(sOperationAvailableMap);
      const aPath = oOperationAvailableMap && oOperationAvailableMap[sAction] && oOperationAvailableMap[sAction].split("/");
      const sNumberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(sEnableSelectOn);
      if (aPath && aPath[0] === sPartner) {
        const sPath = oOperationAvailableMap[sAction].replace(sPartner + "/", "");
        return "{= ${" + sNumberOfSelectedContexts + " && ${" + sPath + "}}";
      } else {
        return "{= ${" + sNumberOfSelectedContexts + "}";
      }
    },
    getHiddenPathExpressionForTableActionsAndIBN(sHiddenPath, oDetails) {
      const oContext = oDetails.context,
        sPropertyPath = oContext.getPath(),
        sEntitySetPath = ODataModelAnnotationHelper.getNavigationPath(sPropertyPath);
      if (sHiddenPath.indexOf("/") > 0) {
        const aSplitHiddenPath = sHiddenPath.split("/");
        const sNavigationPath = aSplitHiddenPath[0];
        // supports visiblity based on the property from the partner association
        if (oContext.getObject(sEntitySetPath + "/$Partner") === sNavigationPath) {
          return "{= !%{" + aSplitHiddenPath.slice(1).join("/") + "} }";
        }
        // any other association will be ignored and the button will be made visible
      }

      return true;
    },
    /**
     * Method to get press event for DataFieldForActionButton.
     *
     * @function
     * @name getPressEventForDataFieldForActionButton
     * @param sId Id of the current control
     * @param oAction Action model
     * @param sOperationAvailableMap OperationAvailableMap Stringified JSON object
     * @returns A binding expression for press property of DataFieldForActionButton
     */
    getPressEventForDataFieldForActionButton(sId, oAction, sOperationAvailableMap) {
      const oParams = {
        contexts: "${internal>selectedContexts}"
      };
      return ActionHelper.getPressEventDataFieldForActionButton(sId, oAction, oParams, sOperationAvailableMap);
    },
    /**
     * @function
     * @name getActionType
     * @param oAction Action model
     * @returns A Boolean value depending on the action type
     */
    getActionType(oAction) {
      return (oAction["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") > -1 || oAction["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForAction") > -1) && oAction["Inline"];
    },
    getCollectionName(sCollection) {
      return sCollection.split("/")[sCollection.split("/").length - 1];
    }
  };
  ChartHelper.getSortConditions.requiresIContext = true;
  return ChartHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmb3JtYXRKU09OVG9TdHJpbmciLCJvQ3JpdCIsInVuZGVmaW5lZCIsInNDcml0aWNhbGl0eSIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXBsYWNlIiwiUmVnRXhwIiwiZ2V0RW50aXR5U2V0UGF0aCIsIm9Bbm5vdGF0aW9uQ29udGV4dCIsInNBbm5vUGF0aCIsImdldFBhdGgiLCJzUGF0aEVudGl0eVNldFBhdGgiLCJtQ2hhcnRUeXBlIiwibURpbWVuc2lvblJvbGUiLCJDaGFydEhlbHBlciIsImdldFAxM25Nb2RlIiwib1ZpZXdEYXRhIiwiYVBlcnNvbmFsaXphdGlvbiIsImJWYXJpYW50TWFuYWdlbWVudCIsInZhcmlhbnRNYW5hZ2VtZW50IiwicGVyc29uYWxpemF0aW9uIiwidHlwZSIsInB1c2giLCJzb3J0Iiwiam9pbiIsImZvcm1hdENoYXJ0VHlwZSIsIm9DaGFydFR5cGUiLCIkRW51bU1lbWJlciIsImZvcm1hdERpbWVuc2lvbnMiLCJvQW5ub3RhdGlvbiIsImdldE9iamVjdCIsIm9NZXRhTW9kZWwiLCJnZXRNb2RlbCIsInNFbnRpdHlTZXRQYXRoIiwiYURpbWVuc2lvbnMiLCJpIiwiaiIsImJJc05hdmlnYXRpb25UZXh0IiwiRGltZW5zaW9uQXR0cmlidXRlcyIsIkRpbWVuc2lvbnMiLCJsZW5ndGgiLCJzS2V5IiwiJFByb3BlcnR5UGF0aCIsIm9UZXh0IiwiaW5kZXhPZiIsIkxvZyIsImVycm9yIiwiJFBhdGgiLCJvRGltZW5zaW9uIiwia2V5IiwidGV4dFBhdGgiLCJsYWJlbCIsInJvbGUiLCJvQXR0cmlidXRlIiwiRGltZW5zaW9uIiwiUm9sZSIsImNyaXRpY2FsaXR5IiwiT0RhdGFNZXRhTW9kZWxVdGlsIiwiZmV0Y2hDcml0aWNhbGl0eSIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwidGhlbiIsIm9EaW1lbnNpb25Nb2RlbCIsIkpTT05Nb2RlbCIsIiQkdmFsdWVBc1Byb21pc2UiLCJmb3JtYXRNZWFzdXJlcyIsImdldERhdGEiLCJnZXRVaUNoYXJ0Iiwib1ByZXNlbnRhdGlvbkNvbnRleHQiLCJnZXRVaUNvbnRyb2wiLCJnZXRPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJvQ2hhcnRDb250ZXh0Iiwib0NvbnRleHQiLCJhQ2hhcnRDb2xsZWN0aW9uIiwiQWN0aW9ucyIsIkFjdGlvbkhlbHBlciIsImdldFNvcnRDb25kaXRpb25zIiwib1ByZXNlbnRhdGlvblZhcmlhbnQiLCJzUHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJvQXBwbHlTdXBwb3J0ZWQiLCJDb21tb25IZWxwZXIiLCJfaXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiIsIlNvcnRPcmRlciIsImFTb3J0Q29uZGl0aW9ucyIsInNvcnRlcnMiLCJzRW50aXR5UGF0aCIsInNwbGl0IiwiZm9yRWFjaCIsIm9Db25kaXRpb24iLCJvU29ydFByb3BlcnR5Iiwib1NvcnRlciIsIkR5bmFtaWNQcm9wZXJ0eSIsIiRBbm5vdGF0aW9uUGF0aCIsIk5hbWUiLCJQcm9wZXJ0eSIsImFHcm91cGFibGVQcm9wZXJ0aWVzIiwiR3JvdXBhYmxlUHJvcGVydGllcyIsIm5hbWUiLCJkZXNjZW5kaW5nIiwiRGVzY2VuZGluZyIsIkVycm9yIiwiZ2V0QmluZGluZ0RhdGEiLCJzVGFyZ2V0Q29sbGVjdGlvbiIsImFBY3Rpb25zIiwiYU9wZXJhdGlvbkF2YWlsYWJsZVBhdGgiLCJzU2VsZWN0IiwiJFR5cGUiLCJzQWN0aW9uTmFtZSIsIkFjdGlvbiIsIm9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGUiLCJnZXRBY3Rpb25QYXRoIiwiX2dldE1vZGVsIiwib0NvbGxlY3Rpb24iLCJvSW50ZXJmYWNlIiwiY29udGV4dCIsImlzRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uRW5hYmxlZCIsImJJc0JvdW5kIiwic0FjdGlvbiIsInNPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJzRW5hYmxlU2VsZWN0T24iLCJvTW9kZWwiLCJzTmF2UGF0aCIsInNQYXJ0bmVyIiwiJFBhcnRuZXIiLCJvT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwicGFyc2UiLCJhUGF0aCIsInNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMiLCJnZXROdW1iZXJPZkNvbnRleHRzRXhwcmVzc2lvbiIsInNQYXRoIiwiZ2V0SGlkZGVuUGF0aEV4cHJlc3Npb25Gb3JUYWJsZUFjdGlvbnNBbmRJQk4iLCJzSGlkZGVuUGF0aCIsIm9EZXRhaWxzIiwic1Byb3BlcnR5UGF0aCIsIk9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyIiwiZ2V0TmF2aWdhdGlvblBhdGgiLCJhU3BsaXRIaWRkZW5QYXRoIiwic05hdmlnYXRpb25QYXRoIiwic2xpY2UiLCJnZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uIiwic0lkIiwib0FjdGlvbiIsIm9QYXJhbXMiLCJjb250ZXh0cyIsImdldFByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJnZXRBY3Rpb25UeXBlIiwiZ2V0Q29sbGVjdGlvbk5hbWUiLCJzQ29sbGVjdGlvbiIsInJlcXVpcmVzSUNvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNoYXJ0SGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgZ2V0VWlDb250cm9sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IEFjdGlvbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9oZWxwZXJzL0FjdGlvbkhlbHBlclwiO1xuaW1wb3J0IE9EYXRhTWV0YU1vZGVsVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9PRGF0YU1ldGFNb2RlbFV0aWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBPRGF0YU1vZGVsQW5ub3RhdGlvbkhlbHBlciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0Fubm90YXRpb25IZWxwZXJcIjtcbmZ1bmN0aW9uIGZvcm1hdEpTT05Ub1N0cmluZyhvQ3JpdDogYW55KSB7XG5cdGlmICghb0NyaXQpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0bGV0IHNDcml0aWNhbGl0eSA9IEpTT04uc3RyaW5naWZ5KG9Dcml0KTtcblx0c0NyaXRpY2FsaXR5ID0gc0NyaXRpY2FsaXR5LnJlcGxhY2UobmV3IFJlZ0V4cChcIntcIiwgXCJnXCIpLCBcIlxcXFx7XCIpO1xuXHRzQ3JpdGljYWxpdHkgPSBzQ3JpdGljYWxpdHkucmVwbGFjZShuZXcgUmVnRXhwKFwifVwiLCBcImdcIiksIFwiXFxcXH1cIik7XG5cdHJldHVybiBzQ3JpdGljYWxpdHk7XG59XG5mdW5jdGlvbiBnZXRFbnRpdHlTZXRQYXRoKG9Bbm5vdGF0aW9uQ29udGV4dDogYW55KSB7XG5cdGNvbnN0IHNBbm5vUGF0aCA9IG9Bbm5vdGF0aW9uQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0c1BhdGhFbnRpdHlTZXRQYXRoID0gc0Fubm9QYXRoLnJlcGxhY2UoL0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS4oQ2hhcnR8UHJlc2VudGF0aW9uVmFyaWFudCkuKi8sIFwiXCIpO1xuXG5cdHJldHVybiBzUGF0aEVudGl0eVNldFBhdGg7XG59XG5cbmNvbnN0IG1DaGFydFR5cGUgPSB7XG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0NvbHVtblwiOiBcImNvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db2x1bW5TdGFja2VkXCI6IFwic3RhY2tlZF9jb2x1bW5cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29sdW1uRHVhbFwiOiBcImR1YWxfY29sdW1uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0NvbHVtblN0YWNrZWREdWFsXCI6IFwiZHVhbF9zdGFja2VkX2NvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db2x1bW5TdGFja2VkMTAwXCI6IFwiMTAwX3N0YWNrZWRfY29sdW1uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0NvbHVtblN0YWNrZWREdWFsMTAwXCI6IFwiMTAwX2R1YWxfc3RhY2tlZF9jb2x1bW5cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQmFyXCI6IFwiYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0JhclN0YWNrZWRcIjogXCJzdGFja2VkX2JhclwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9CYXJEdWFsXCI6IFwiZHVhbF9iYXJcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQmFyU3RhY2tlZER1YWxcIjogXCJkdWFsX3N0YWNrZWRfYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0JhclN0YWNrZWQxMDBcIjogXCIxMDBfc3RhY2tlZF9iYXJcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQmFyU3RhY2tlZER1YWwxMDBcIjogXCIxMDBfZHVhbF9zdGFja2VkX2JhclwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9BcmVhXCI6IFwiYXJlYVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9BcmVhU3RhY2tlZFwiOiBcInN0YWNrZWRfY29sdW1uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0FyZWFTdGFja2VkMTAwXCI6IFwiMTAwX3N0YWNrZWRfY29sdW1uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hvcml6b250YWxBcmVhXCI6IFwiYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hvcml6b250YWxBcmVhU3RhY2tlZFwiOiBcInN0YWNrZWRfYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hvcml6b250YWxBcmVhU3RhY2tlZDEwMFwiOiBcIjEwMF9zdGFja2VkX2JhclwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9MaW5lXCI6IFwibGluZVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9MaW5lRHVhbFwiOiBcImR1YWxfbGluZVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db21iaW5hdGlvblwiOiBcImNvbWJpbmF0aW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0NvbWJpbmF0aW9uU3RhY2tlZFwiOiBcInN0YWNrZWRfY29tYmluYXRpb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29tYmluYXRpb25EdWFsXCI6IFwiZHVhbF9jb21iaW5hdGlvblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db21iaW5hdGlvblN0YWNrZWREdWFsXCI6IFwiZHVhbF9zdGFja2VkX2NvbWJpbmF0aW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hvcml6b250YWxDb21iaW5hdGlvblN0YWNrZWRcIjogXCJob3Jpem9udGFsX3N0YWNrZWRfY29tYmluYXRpb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvUGllXCI6IFwicGllXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0RvbnV0XCI6IFwiZG9udXRcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvU2NhdHRlclwiOiBcInNjYXR0ZXJcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQnViYmxlXCI6IFwiYnViYmxlXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL1JhZGFyXCI6IFwibGluZVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9IZWF0TWFwXCI6IFwiaGVhdG1hcFwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9UcmVlTWFwXCI6IFwidHJlZW1hcFwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9XYXRlcmZhbGxcIjogXCJ3YXRlcmZhbGxcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQnVsbGV0XCI6IFwiYnVsbGV0XCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL1ZlcnRpY2FsQnVsbGV0XCI6IFwidmVydGljYWxfYnVsbGV0XCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hvcml6b250YWxXYXRlcmZhbGxcIjogXCJob3Jpem9udGFsX3dhdGVyZmFsbFwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Ib3Jpem9udGFsQ29tYmluYXRpb25EdWFsXCI6IFwiZHVhbF9ob3Jpem9udGFsX2NvbWJpbmF0aW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0hvcml6b250YWxDb21iaW5hdGlvblN0YWNrZWREdWFsXCI6IFwiZHVhbF9ob3Jpem9udGFsX3N0YWNrZWRfY29tYmluYXRpb25cIlxufTtcbmNvbnN0IG1EaW1lbnNpb25Sb2xlID0ge1xuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0RGltZW5zaW9uUm9sZVR5cGUvQ2F0ZWdvcnlcIjogXCJjYXRlZ29yeVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0RGltZW5zaW9uUm9sZVR5cGUvU2VyaWVzXCI6IFwic2VyaWVzXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnREaW1lbnNpb25Sb2xlVHlwZS9DYXRlZ29yeTJcIjogXCJjYXRlZ29yeTJcIlxufTtcbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciBzYXAuZmUubWFjcm9zIENoYXJ0IHBoYW50b20gY29udHJvbCBmb3IgcHJlcGVjb3NzZWluZy5cbiAqIDxoMz48Yj5Ob3RlOjwvYj48L2gzPlxuICogVGhlIGNsYXNzIGlzIGV4cGVyaW1lbnRhbCBhbmQgdGhlIEFQSS9iZWhhdmlvdXIgaXMgbm90IGZpbmFsaXNlZFxuICogYW5kIGhlbmNlIHRoaXMgc2hvdWxkIG5vdCBiZSB1c2VkIGZvciBwcm9kdWN0aXZlIHVzYWdlLlxuICogRXNwZWNpYWxseSB0aGlzIGNsYXNzIGlzIG5vdCBpbnRlbmRlZCB0byBiZSB1c2VkIGZvciB0aGUgRkUgc2NlbmFyaW8sXG4gKiBoZXJlIHdlIHNoYWxsIHVzZSBzYXAuZmUubWFjcm9zLkNoYXJ0SGVscGVyIHRoYXQgaXMgZXNwZWNpYWxseSB0YWlsb3JlZCBmb3IgVjRcbiAqIG1ldGEgbW9kZWxcbiAqXG4gKiBAYXV0aG9yIFNBUCBTRVxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqIEBzaW5jZSAxLjYyXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5DaGFydEhlbHBlclxuICovXG5jb25zdCBDaGFydEhlbHBlciA9IHtcblx0Z2V0UDEzbk1vZGUob1ZpZXdEYXRhOiBhbnkpIHtcblx0XHRjb25zdCBhUGVyc29uYWxpemF0aW9uID0gW10sXG5cdFx0XHRiVmFyaWFudE1hbmFnZW1lbnQgPVxuXHRcdFx0XHRvVmlld0RhdGEudmFyaWFudE1hbmFnZW1lbnQgJiYgKG9WaWV3RGF0YS52YXJpYW50TWFuYWdlbWVudCA9PT0gXCJQYWdlXCIgfHwgb1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIkNvbnRyb2xcIiksXG5cdFx0XHRwZXJzb25hbGl6YXRpb24gPSB0cnVlOyAvLyBieSBkZWZhdWx0IGVuYWJsZWRcblx0XHRpZiAoYlZhcmlhbnRNYW5hZ2VtZW50ICYmIHBlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0XHQvLyBmdWxsIHBlcnNvbmFsaXphdGlvbiBzY29wZVxuXHRcdFx0XHRyZXR1cm4gXCJTb3J0LFR5cGUsSXRlbVwiO1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgcGVyc29uYWxpemF0aW9uID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGlmICgocGVyc29uYWxpemF0aW9uIGFzIGFueSkudHlwZSkge1xuXHRcdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIlR5cGVcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKChwZXJzb25hbGl6YXRpb24gYXMgYW55KS5zb3J0KSB7XG5cdFx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiU29ydFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gYVBlcnNvbmFsaXphdGlvbi5qb2luKFwiLFwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGZvcm1hdENoYXJ0VHlwZShvQ2hhcnRUeXBlOiBhbnkpIHtcblx0XHRyZXR1cm4gKG1DaGFydFR5cGUgYXMgYW55KVtvQ2hhcnRUeXBlLiRFbnVtTWVtYmVyXTtcblx0fSxcblx0Zm9ybWF0RGltZW5zaW9ucyhvQW5ub3RhdGlvbkNvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IG9Bbm5vdGF0aW9uID0gb0Fubm90YXRpb25Db250ZXh0LmdldE9iamVjdChcIi4vXCIpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9Bbm5vdGF0aW9uQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0c0VudGl0eVNldFBhdGggPSBnZXRFbnRpdHlTZXRQYXRoKG9Bbm5vdGF0aW9uQ29udGV4dCksXG5cdFx0XHRhRGltZW5zaW9ucyA9IFtdO1xuXHRcdGxldCBpLCBqO1xuXHRcdGxldCBiSXNOYXZpZ2F0aW9uVGV4dCA9IGZhbHNlO1xuXG5cdFx0Ly9wZXJoYXBzIHRoZXJlIGFyZSBubyBkaW1lbnNpb24gYXR0cmlidXRlc1xuXHRcdG9Bbm5vdGF0aW9uLkRpbWVuc2lvbkF0dHJpYnV0ZXMgPSBvQW5ub3RhdGlvbi5EaW1lbnNpb25BdHRyaWJ1dGVzIHx8IFtdO1xuXG5cdFx0Zm9yIChpID0gMDsgaSA8IG9Bbm5vdGF0aW9uLkRpbWVuc2lvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHNLZXkgPSBvQW5ub3RhdGlvbi5EaW1lbnNpb25zW2ldLiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRjb25zdCBvVGV4dCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRoICsgc0tleX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgKSB8fCB7fTtcblx0XHRcdGlmIChzS2V5LmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdFx0TG9nLmVycm9yKGAkZXhwYW5kIGlzIG5vdCB5ZXQgc3VwcG9ydGVkLiBEaW1lbnNpb246ICR7c0tleX0gZnJvbSBhbiBhc3NvY2lhdGlvbiBjYW5ub3QgYmUgdXNlZGApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9UZXh0LiRQYXRoICYmIG9UZXh0LiRQYXRoLmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdFx0TG9nLmVycm9yKFxuXHRcdFx0XHRcdGAkZXhwYW5kIGlzIG5vdCB5ZXQgc3VwcG9ydGVkLiBUZXh0IFByb3BlcnR5OiAke29UZXh0LiRQYXRofSBmcm9tIGFuIGFzc29jaWF0aW9uIGNhbm5vdCBiZSB1c2VkIGZvciB0aGUgZGltZW5zaW9uICR7c0tleX1gXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGJJc05hdmlnYXRpb25UZXh0ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IG9EaW1lbnNpb246IGFueSA9IHtcblx0XHRcdFx0a2V5OiBzS2V5LFxuXHRcdFx0XHR0ZXh0UGF0aDogIWJJc05hdmlnYXRpb25UZXh0ID8gb1RleHQuJFBhdGggOiB1bmRlZmluZWQsXG5cdFx0XHRcdGxhYmVsOiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aCArIHNLZXl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbGApLFxuXHRcdFx0XHRyb2xlOiBcImNhdGVnb3J5XCJcblx0XHRcdH07XG5cblx0XHRcdGZvciAoaiA9IDA7IGogPCBvQW5ub3RhdGlvbi5EaW1lbnNpb25BdHRyaWJ1dGVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGNvbnN0IG9BdHRyaWJ1dGUgPSBvQW5ub3RhdGlvbi5EaW1lbnNpb25BdHRyaWJ1dGVzW2pdO1xuXG5cdFx0XHRcdGlmIChvRGltZW5zaW9uLmtleSA9PT0gb0F0dHJpYnV0ZS5EaW1lbnNpb24uJFByb3BlcnR5UGF0aCkge1xuXHRcdFx0XHRcdG9EaW1lbnNpb24ucm9sZSA9IG1EaW1lbnNpb25Sb2xlW29BdHRyaWJ1dGUuUm9sZS4kRW51bU1lbWJlciBhcyBrZXlvZiB0eXBlb2YgbURpbWVuc2lvblJvbGVdIHx8IG9EaW1lbnNpb24ucm9sZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRvRGltZW5zaW9uLmNyaXRpY2FsaXR5ID0gT0RhdGFNZXRhTW9kZWxVdGlsLmZldGNoQ3JpdGljYWxpdHkoXG5cdFx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRcdG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVNldFBhdGggKyBzS2V5KVxuXHRcdFx0KS50aGVuKGZvcm1hdEpTT05Ub1N0cmluZyk7XG5cblx0XHRcdGFEaW1lbnNpb25zLnB1c2gob0RpbWVuc2lvbik7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb0RpbWVuc2lvbk1vZGVsID0gbmV3IEpTT05Nb2RlbChhRGltZW5zaW9ucyk7XG5cdFx0KG9EaW1lbnNpb25Nb2RlbCBhcyBhbnkpLiQkdmFsdWVBc1Byb21pc2UgPSB0cnVlO1xuXHRcdHJldHVybiBvRGltZW5zaW9uTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHR9LFxuXG5cdGZvcm1hdE1lYXN1cmVzKG9Bbm5vdGF0aW9uQ29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIG9Bbm5vdGF0aW9uQ29udGV4dC5nZXRNb2RlbCgpLmdldERhdGEoKTtcblx0fSxcblxuXHRnZXRVaUNoYXJ0KG9QcmVzZW50YXRpb25Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gZ2V0VWlDb250cm9sKG9QcmVzZW50YXRpb25Db250ZXh0LCBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiKTtcblx0fSxcblx0Z2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKG9DaGFydENvbnRleHQ6IGFueSwgb0NvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IGFDaGFydENvbGxlY3Rpb24gPSBvQ2hhcnRDb250ZXh0LkFjdGlvbnMgfHwgW107XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KEFjdGlvbkhlbHBlci5nZXRPcGVyYXRpb25BdmFpbGFibGVNYXAoYUNoYXJ0Q29sbGVjdGlvbiwgXCJjaGFydFwiLCBvQ29udGV4dCkpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyBhIHN0cmluZ2lmaWVkIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgUHJlc2VudGF0aW9uIFZhcmlhbnQgc29ydCBjb25kaXRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHRcblx0ICogQHBhcmFtIG9QcmVzZW50YXRpb25WYXJpYW50IFByZXNlbnRhdGlvbiBWYXJpYW50IGFubm90YXRpb25cblx0ICogQHBhcmFtIHNQcmVzZW50YXRpb25WYXJpYW50UGF0aFxuXHQgKiBAcGFyYW0gb0FwcGx5U3VwcG9ydGVkXG5cdCAqIEByZXR1cm5zIFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqL1xuXHRnZXRTb3J0Q29uZGl0aW9uczogZnVuY3Rpb24gKG9Db250ZXh0OiBhbnksIG9QcmVzZW50YXRpb25WYXJpYW50OiBhbnksIHNQcmVzZW50YXRpb25WYXJpYW50UGF0aDogc3RyaW5nLCBvQXBwbHlTdXBwb3J0ZWQ6IGFueSkge1xuXHRcdGlmIChcblx0XHRcdG9QcmVzZW50YXRpb25WYXJpYW50ICYmXG5cdFx0XHRDb21tb25IZWxwZXIuX2lzUHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24oc1ByZXNlbnRhdGlvblZhcmlhbnRQYXRoKSAmJlxuXHRcdFx0b1ByZXNlbnRhdGlvblZhcmlhbnQuU29ydE9yZGVyXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBhU29ydENvbmRpdGlvbnM6IGFueSA9IHtcblx0XHRcdFx0c29ydGVyczogW11cblx0XHRcdH07XG5cdFx0XHRjb25zdCBzRW50aXR5UGF0aCA9IG9Db250ZXh0LmdldFBhdGgoMCkuc3BsaXQoXCJAXCIpWzBdO1xuXHRcdFx0b1ByZXNlbnRhdGlvblZhcmlhbnQuU29ydE9yZGVyLmZvckVhY2goZnVuY3Rpb24gKG9Db25kaXRpb246IGFueSA9IHt9KSB7XG5cdFx0XHRcdGxldCBvU29ydFByb3BlcnR5OiBhbnkgPSBcIlwiO1xuXHRcdFx0XHRjb25zdCBvU29ydGVyOiBhbnkgPSB7fTtcblx0XHRcdFx0aWYgKG9Db25kaXRpb24uRHluYW1pY1Byb3BlcnR5KSB7XG5cdFx0XHRcdFx0b1NvcnRQcm9wZXJ0eSA9XG5cdFx0XHRcdFx0XHRcIl9mZV9hZ2dyZWdhdGFibGVfXCIgK1xuXHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0TW9kZWwoMCkuZ2V0T2JqZWN0KHNFbnRpdHlQYXRoICsgb0NvbmRpdGlvbi5EeW5hbWljUHJvcGVydHkuJEFubm90YXRpb25QYXRoKT8uTmFtZTtcblx0XHRcdFx0fSBlbHNlIGlmIChvQ29uZGl0aW9uLlByb3BlcnR5KSB7XG5cdFx0XHRcdFx0Y29uc3QgYUdyb3VwYWJsZVByb3BlcnRpZXMgPSBvQXBwbHlTdXBwb3J0ZWQuR3JvdXBhYmxlUHJvcGVydGllcztcblx0XHRcdFx0XHRpZiAoYUdyb3VwYWJsZVByb3BlcnRpZXMgJiYgYUdyb3VwYWJsZVByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFHcm91cGFibGVQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChhR3JvdXBhYmxlUHJvcGVydGllc1tpXS4kUHJvcGVydHlQYXRoID09PSBvQ29uZGl0aW9uLlByb3BlcnR5LiRQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHRvU29ydFByb3BlcnR5ID0gXCJfZmVfZ3JvdXBhYmxlX1wiICsgb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmICghb1NvcnRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdG9Tb3J0UHJvcGVydHkgPSBcIl9mZV9hZ2dyZWdhdGFibGVfXCIgKyBvQ29uZGl0aW9uLlByb3BlcnR5LiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0b0NvbnRleHRcblx0XHRcdFx0XHRcdFx0LmdldE1vZGVsKDApXG5cdFx0XHRcdFx0XHRcdC5nZXRPYmplY3Qoc0VudGl0eVBhdGggKyBvQ29uZGl0aW9uLlByb3BlcnR5LiRQcm9wZXJ0eVBhdGggKyBcIkBPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuR3JvdXBhYmxlXCIpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRvU29ydFByb3BlcnR5ID0gXCJfZmVfZ3JvdXBhYmxlX1wiICsgb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvU29ydFByb3BlcnR5ID0gXCJfZmVfYWdncmVnYXRhYmxlX1wiICsgb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1NvcnRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9Tb3J0ZXIubmFtZSA9IG9Tb3J0UHJvcGVydHk7XG5cdFx0XHRcdFx0b1NvcnRlci5kZXNjZW5kaW5nID0gISFvQ29uZGl0aW9uLkRlc2NlbmRpbmc7XG5cdFx0XHRcdFx0YVNvcnRDb25kaXRpb25zLnNvcnRlcnMucHVzaChvU29ydGVyKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQbGVhc2UgZGVmaW5lIHRoZSByaWdodCBwYXRoIHRvIHRoZSBzb3J0IHByb3BlcnR5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShhU29ydENvbmRpdGlvbnMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHRnZXRCaW5kaW5nRGF0YShzVGFyZ2V0Q29sbGVjdGlvbjogYW55LCBvQ29udGV4dDogYW55LCBhQWN0aW9uczogYW55KSB7XG5cdFx0Y29uc3QgYU9wZXJhdGlvbkF2YWlsYWJsZVBhdGggPSBbXTtcblx0XHRsZXQgc1NlbGVjdDtcblx0XHRmb3IgKGNvbnN0IGkgaW4gYUFjdGlvbnMpIHtcblx0XHRcdGlmIChhQWN0aW9uc1tpXS4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIikge1xuXHRcdFx0XHRjb25zdCBzQWN0aW9uTmFtZSA9IGFBY3Rpb25zW2ldLkFjdGlvbjtcblx0XHRcdFx0Y29uc3Qgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSA9IENvbW1vbkhlbHBlci5nZXRBY3Rpb25QYXRoKG9Db250ZXh0LCBmYWxzZSwgc0FjdGlvbk5hbWUsIHRydWUpO1xuXHRcdFx0XHRpZiAob0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSAmJiBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlLiRQYXRoKSB7XG5cdFx0XHRcdFx0YU9wZXJhdGlvbkF2YWlsYWJsZVBhdGgucHVzaChgJyR7b0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZS4kUGF0aH0nYCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAob0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdC8vIFdlIGRpc2FibGVkIGFjdGlvbiBhZHZlcnRpc2VtZW50IGJ1dCBrZXB0IGl0IGluIHRoZSBjb2RlIGZvciB0aGUgdGltZSBiZWluZ1xuXHRcdFx0XHRcdC8vYU9wZXJhdGlvbkF2YWlsYWJsZVBhdGgucHVzaChzQWN0aW9uTmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGFPcGVyYXRpb25BdmFpbGFibGVQYXRoLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vVE9ETzogcmVxdWVzdCBmYWlscyB3aXRoICRzZWxlY3QuIGNoZWNrIHRoaXMgd2l0aCBvZGF0YSB2NCBtb2RlbFxuXHRcdFx0c1NlbGVjdCA9IFwiICRzZWxlY3Q6ICdcIiArIGFPcGVyYXRpb25BdmFpbGFibGVQYXRoLmpvaW4oKSArIFwiJ1wiO1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdFx0XCIne3BhdGg6ICdcIiArXG5cdFx0XHQob0NvbnRleHQuZ2V0T2JqZWN0KFwiJGtpbmRcIikgPT09IFwiRW50aXR5U2V0XCIgPyBcIi9cIiA6IFwiXCIpICtcblx0XHRcdG9Db250ZXh0LmdldE9iamVjdChcIkBzYXB1aS5uYW1lXCIpICtcblx0XHRcdFwiJ1wiICtcblx0XHRcdChzU2VsZWN0ID8gXCIscGFyYW1ldGVyczp7XCIgKyBzU2VsZWN0ICsgXCJ9XCIgOiBcIlwiKSArXG5cdFx0XHRcIn0nXCJcblx0XHQpO1xuXHR9LFxuXHRfZ2V0TW9kZWwob0NvbGxlY3Rpb246IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0cmV0dXJuIG9JbnRlcmZhY2UuY29udGV4dDtcblx0fSxcblx0Ly8gVE9ETzogY29tYmluZSB0aGlzIG9uZSB3aXRoIHRoZSBvbmUgZnJvbSB0aGUgdGFibGVcblx0aXNEYXRhRmllbGRGb3JBY3Rpb25CdXR0b25FbmFibGVkKFxuXHRcdGJJc0JvdW5kOiBib29sZWFuLFxuXHRcdHNBY3Rpb246IHN0cmluZyxcblx0XHRvQ29sbGVjdGlvbjogQ29udGV4dCxcblx0XHRzT3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmcsXG5cdFx0c0VuYWJsZVNlbGVjdE9uOiBzdHJpbmdcblx0KSB7XG5cdFx0aWYgKGJJc0JvdW5kICE9PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gXCJ0cnVlXCI7XG5cdFx0fVxuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db2xsZWN0aW9uLmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc05hdlBhdGggPSBvQ29sbGVjdGlvbi5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc1BhcnRuZXIgPSBvTW9kZWwuZ2V0T2JqZWN0KHNOYXZQYXRoKS4kUGFydG5lcjtcblx0XHRjb25zdCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gc09wZXJhdGlvbkF2YWlsYWJsZU1hcCAmJiBKU09OLnBhcnNlKHNPcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHRcdGNvbnN0IGFQYXRoID0gb09wZXJhdGlvbkF2YWlsYWJsZU1hcCAmJiBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwW3NBY3Rpb25dICYmIG9PcGVyYXRpb25BdmFpbGFibGVNYXBbc0FjdGlvbl0uc3BsaXQoXCIvXCIpO1xuXHRcdGNvbnN0IHNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPSBBY3Rpb25IZWxwZXIuZ2V0TnVtYmVyT2ZDb250ZXh0c0V4cHJlc3Npb24oc0VuYWJsZVNlbGVjdE9uKTtcblx0XHRpZiAoYVBhdGggJiYgYVBhdGhbMF0gPT09IHNQYXJ0bmVyKSB7XG5cdFx0XHRjb25zdCBzUGF0aCA9IG9PcGVyYXRpb25BdmFpbGFibGVNYXBbc0FjdGlvbl0ucmVwbGFjZShzUGFydG5lciArIFwiL1wiLCBcIlwiKTtcblx0XHRcdHJldHVybiBcIns9ICR7XCIgKyBzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzICsgXCIgJiYgJHtcIiArIHNQYXRoICsgXCJ9fVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJ7PSAke1wiICsgc051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyArIFwifVwiO1xuXHRcdH1cblx0fSxcblx0Z2V0SGlkZGVuUGF0aEV4cHJlc3Npb25Gb3JUYWJsZUFjdGlvbnNBbmRJQk4oc0hpZGRlblBhdGg6IGFueSwgb0RldGFpbHM6IGFueSkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gb0RldGFpbHMuY29udGV4dCxcblx0XHRcdHNQcm9wZXJ0eVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzRW50aXR5U2V0UGF0aCA9IE9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKHNQcm9wZXJ0eVBhdGgpO1xuXHRcdGlmIChzSGlkZGVuUGF0aC5pbmRleE9mKFwiL1wiKSA+IDApIHtcblx0XHRcdGNvbnN0IGFTcGxpdEhpZGRlblBhdGggPSBzSGlkZGVuUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRjb25zdCBzTmF2aWdhdGlvblBhdGggPSBhU3BsaXRIaWRkZW5QYXRoWzBdO1xuXHRcdFx0Ly8gc3VwcG9ydHMgdmlzaWJsaXR5IGJhc2VkIG9uIHRoZSBwcm9wZXJ0eSBmcm9tIHRoZSBwYXJ0bmVyIGFzc29jaWF0aW9uXG5cdFx0XHRpZiAob0NvbnRleHQuZ2V0T2JqZWN0KHNFbnRpdHlTZXRQYXRoICsgXCIvJFBhcnRuZXJcIikgPT09IHNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0XHRyZXR1cm4gXCJ7PSAhJXtcIiArIGFTcGxpdEhpZGRlblBhdGguc2xpY2UoMSkuam9pbihcIi9cIikgKyBcIn0gfVwiO1xuXHRcdFx0fVxuXHRcdFx0Ly8gYW55IG90aGVyIGFzc29jaWF0aW9uIHdpbGwgYmUgaWdub3JlZCBhbmQgdGhlIGJ1dHRvbiB3aWxsIGJlIG1hZGUgdmlzaWJsZVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgcHJlc3MgZXZlbnQgZm9yIERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRGb3JBY3Rpb25CdXR0b25cblx0ICogQHBhcmFtIHNJZCBJZCBvZiB0aGUgY3VycmVudCBjb250cm9sXG5cdCAqIEBwYXJhbSBvQWN0aW9uIEFjdGlvbiBtb2RlbFxuXHQgKiBAcGFyYW0gc09wZXJhdGlvbkF2YWlsYWJsZU1hcCBPcGVyYXRpb25BdmFpbGFibGVNYXAgU3RyaW5naWZpZWQgSlNPTiBvYmplY3Rcblx0ICogQHJldHVybnMgQSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHByZXNzIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvblxuXHQgKi9cblx0Z2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbihzSWQ6IHN0cmluZywgb0FjdGlvbjogYW55LCBzT3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmcpIHtcblx0XHRjb25zdCBvUGFyYW1zID0ge1xuXHRcdFx0Y29udGV4dHM6IFwiJHtpbnRlcm5hbD5zZWxlY3RlZENvbnRleHRzfVwiXG5cdFx0fTtcblx0XHRyZXR1cm4gQWN0aW9uSGVscGVyLmdldFByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24oc0lkLCBvQWN0aW9uLCBvUGFyYW1zLCBzT3BlcmF0aW9uQXZhaWxhYmxlTWFwKTtcblx0fSxcblx0LyoqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRBY3Rpb25UeXBlXG5cdCAqIEBwYXJhbSBvQWN0aW9uIEFjdGlvbiBtb2RlbFxuXHQgKiBAcmV0dXJucyBBIEJvb2xlYW4gdmFsdWUgZGVwZW5kaW5nIG9uIHRoZSBhY3Rpb24gdHlwZVxuXHQgKi9cblx0Z2V0QWN0aW9uVHlwZShvQWN0aW9uOiBhbnkpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0KG9BY3Rpb25bXCIkVHlwZVwiXS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCIpID4gLTEgfHxcblx0XHRcdFx0b0FjdGlvbltcIiRUeXBlXCJdLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIikgPiAtMSkgJiZcblx0XHRcdG9BY3Rpb25bXCJJbmxpbmVcIl1cblx0XHQpO1xuXHR9LFxuXHRnZXRDb2xsZWN0aW9uTmFtZShzQ29sbGVjdGlvbjogYW55KSB7XG5cdFx0cmV0dXJuIHNDb2xsZWN0aW9uLnNwbGl0KFwiL1wiKVtzQ29sbGVjdGlvbi5zcGxpdChcIi9cIikubGVuZ3RoIC0gMV07XG5cdH1cbn07XG4oQ2hhcnRIZWxwZXIuZ2V0U29ydENvbmRpdGlvbnMgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgQ2hhcnRIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBUUEsU0FBU0Esa0JBQWtCLENBQUNDLEtBQVUsRUFBRTtJQUN2QyxJQUFJLENBQUNBLEtBQUssRUFBRTtNQUNYLE9BQU9DLFNBQVM7SUFDakI7SUFFQSxJQUFJQyxZQUFZLEdBQUdDLElBQUksQ0FBQ0MsU0FBUyxDQUFDSixLQUFLLENBQUM7SUFDeENFLFlBQVksR0FBR0EsWUFBWSxD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