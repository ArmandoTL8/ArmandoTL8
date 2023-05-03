/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/CommonHelper", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/ODataMetaModelUtil", "sap/ui/mdc/library", "sap/ui/mdc/odata/v4/util/DelegateUtil", "sap/ui/mdc/odata/v4/vizChart/ChartDelegate", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, merge, CommonUtils, ChartUtils, CommonHelper, FilterUtils, ODataMetaModelUtil, MDCLib, DelegateUtil, BaseChartDelegate, Filter, FilterOperator) {
  "use strict";

  const ChartItemRoleType = MDCLib.ChartItemRoleType;
  // /**
  //  * Helper class for sap.ui.mdc.Chart.
  //  * <h3><b>Note:</b></h3>
  //  * The class is experimental and the API/behaviour is not finalised
  //  * and hence this should not be used for productive usage.
  //  * Especially this class is not intended to be used for the FE scenario,
  //  * here we shall use sap.fe.macros.ChartDelegate that is especially tailored for V4
  //  * meta model
  //  *
  //  * @author SAP SE
  //  * @private
  //  * @experimental
  //  * @since 1.62
  //  * @alias sap.fe.macros.ChartDelegate
  //  */
  const ChartDelegate = Object.assign({}, BaseChartDelegate);
  ChartDelegate._setChartNoDataText = function (oChart, oBindingInfo) {
    let sNoDataKey = "";
    const oChartFilterInfo = ChartUtils.getAllFilterInfo(oChart),
      suffixResourceKey = oBindingInfo.path.startsWith("/") ? oBindingInfo.path.substr(1) : oBindingInfo.path;
    const _getNoDataTextWithFilters = function () {
      if (oChart.data("multiViews")) {
        return "M_TABLE_AND_CHART_NO_DATA_TEXT_MULTI_VIEW";
      } else {
        return "T_TABLE_AND_CHART_NO_DATA_TEXT_WITH_FILTER";
      }
    };
    if (oChart.getFilter()) {
      if (oChartFilterInfo.search || oChartFilterInfo.filters && oChartFilterInfo.filters.length) {
        sNoDataKey = _getNoDataTextWithFilters();
      } else {
        sNoDataKey = "T_TABLE_AND_CHART_NO_DATA_TEXT";
      }
    } else if (oChartFilterInfo.search || oChartFilterInfo.filters && oChartFilterInfo.filters.length) {
      sNoDataKey = _getNoDataTextWithFilters();
    } else {
      sNoDataKey = "M_TABLE_AND_CHART_NO_FILTERS_NO_DATA_TEXT";
    }
    return oChart.getModel("sap.fe.i18n").getResourceBundle().then(function (oResourceBundle) {
      oChart.setNoDataText(CommonUtils.getTranslatedText(sNoDataKey, oResourceBundle, undefined, suffixResourceKey));
    }).catch(function (error) {
      Log.error(error);
    });
  };
  ChartDelegate._handleProperty = function (oMDCChart, mEntitySetAnnotations, mKnownAggregatableProps, mCustomAggregates, aProperties, sCriticality) {
    const oApplySupported = CommonHelper.parseCustomData(oMDCChart.data("applySupported"));
    const sortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(mEntitySetAnnotations);
    const oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
    const oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);
    const oObj = this.getModel().getObject(this.getPath());
    const sKey = this.getModel().getObject(`${this.getPath()}@sapui.name`);
    const oMetaModel = this.getModel();
    if (oObj && oObj.$kind === "Property") {
      // ignore (as for now) all complex properties
      // not clear if they might be nesting (complex in complex)
      // not clear how they are represented in non-filterable annotation
      // etc.
      if (oObj.$isCollection) {
        //Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
        return;
      }
      const oPropertyAnnotations = oMetaModel.getObject(`${this.getPath()}@`);
      const sPath = oMetaModel.getObject("@sapui.name", oMetaModel.getMetaContext(this.getPath()));
      const aGroupableProperties = oApplySupported && oApplySupported.GroupableProperties;
      const aAggregatableProperties = oApplySupported && oApplySupported.AggregatableProperties;
      let bGroupable = false,
        bAggregatable = false;
      if (aGroupableProperties && aGroupableProperties.length) {
        for (let i = 0; i < aGroupableProperties.length; i++) {
          if (aGroupableProperties[i].$PropertyPath === sPath) {
            bGroupable = true;
            break;
          }
        }
      }
      if (aAggregatableProperties && aAggregatableProperties.length) {
        for (let j = 0; j < aAggregatableProperties.length; j++) {
          if (aAggregatableProperties[j].Property.$PropertyPath === sPath) {
            bAggregatable = true;
            break;
          }
        }
      }
      if (!aGroupableProperties || aGroupableProperties && !aGroupableProperties.length) {
        bGroupable = oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"];
      }
      if (!aAggregatableProperties || aAggregatableProperties && !aAggregatableProperties.length) {
        bAggregatable = oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"];
      }

      //Right now: skip them, since we can't create a chart from it
      if (!bGroupable && !bAggregatable) {
        return;
      }
      if (bAggregatable) {
        const aAggregateProperties = ChartDelegate._createPropertyInfosForAggregatable(oMDCChart, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, mKnownAggregatableProps, mCustomAggregates);
        aAggregateProperties.forEach(function (oAggregateProperty) {
          aProperties.push(oAggregateProperty);
        });
      }
      if (bGroupable) {
        const sName = sKey || "",
          sTextProperty = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path : null;
        let bIsNavigationText = false;
        if (sName && sName.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Property: ${sName} from an association cannot be used`);
          return;
        }
        if (sTextProperty && sTextProperty.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Text Property: ${sTextProperty} from an association cannot be used`);
          bIsNavigationText = true;
        }
        aProperties.push({
          name: "_fe_groupable_" + sKey,
          propertyPath: sKey,
          label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
          sortable: ChartDelegate._getSortable(oMDCChart, sortRestrictionsInfo.propertyInfo[sKey], false),
          filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
          groupable: true,
          aggregatable: false,
          maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
          sortKey: sKey,
          role: ChartItemRoleType.category,
          //standard, normally this should be interpreted from UI.Chart annotation
          criticality: sCriticality,
          //To be implemented by FE
          textProperty: !bIsNavigationText && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path : null,
          //To be implemented by FE
          textFormatter: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]
        });
      }
    }
  };
  ChartDelegate.formatText = function (oValue1, oValue2) {
    const oTextArrangementAnnotation = this.textFormatter;
    if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst") {
      return `${oValue2} (${oValue1})`;
    } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
      return `${oValue1} (${oValue2})`;
    } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
      return oValue2;
    }
    return oValue2 ? oValue2 : oValue1;
  };
  ChartDelegate.updateBindingInfo = function (oChart, oBindingInfo) {
    ChartDelegate._setChartNoDataText(oChart, oBindingInfo);
    const oFilter = sap.ui.getCore().byId(oChart.getFilter());
    if (oFilter) {
      const mConditions = oFilter.getConditions();
      if (mConditions) {
        if (!oBindingInfo) {
          oBindingInfo = {};
        }
        oBindingInfo.sorter = this.getSorters(oChart);
        const oInnerChart = oChart.getControlDelegate().getInnerChart(oChart);
        let oFilterInfo;
        if (oInnerChart) {
          // if the action is a drill down, chart selections must be considered
          if (ChartUtils.getChartSelectionsExist(oChart)) {
            oFilterInfo = ChartUtils.getAllFilterInfo(oChart);
          }
        }
        oFilterInfo = oFilterInfo ? oFilterInfo : ChartUtils.getFilterBarFilterInfo(oChart);
        if (oFilterInfo) {
          oBindingInfo.filters = oFilterInfo.filters;
        }
        const sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
        if (sParameterPath) {
          oBindingInfo.path = sParameterPath;
        }
      }

      // Search
      const oInfo = FilterUtils.getFilterInfo(oFilter, {});
      const oApplySupported = CommonHelper.parseCustomData(oChart.data("applySupported"));
      if (oApplySupported && oApplySupported.enableSearch && oInfo.search) {
        oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oInfo.search);
      } else if (oBindingInfo.parameters.$search) {
        delete oBindingInfo.parameters.$search;
      }
    } else {
      if (!oBindingInfo) {
        oBindingInfo = {};
      }
      oBindingInfo.sorter = this.getSorters(oChart);
    }
    ChartDelegate._checkAndAddDraftFilter(oChart, oBindingInfo);
  };
  ChartDelegate.fetchProperties = function (oMDCChart) {
    const oModel = this._getModel(oMDCChart);
    let pCreatePropertyInfos;
    if (!oModel) {
      pCreatePropertyInfos = new Promise(resolve => {
        oMDCChart.attachModelContextChange({
          resolver: resolve
        }, onModelContextChange, this);
      }).then(oRetrievedModel => {
        return this._createPropertyInfos(oMDCChart, oRetrievedModel);
      });
    } else {
      pCreatePropertyInfos = this._createPropertyInfos(oMDCChart, oModel);
    }
    return pCreatePropertyInfos.then(function (aProperties) {
      if (oMDCChart.data) {
        oMDCChart.data("$mdcChartPropertyInfo", aProperties);
      }
      return aProperties;
    });
  };
  function onModelContextChange(oEvent, oData) {
    const oMDCChart = oEvent.getSource();
    const oModel = this._getModel(oMDCChart);
    if (oModel) {
      oMDCChart.detachModelContextChange(onModelContextChange);
      oData.resolver(oModel);
    }
  }
  ChartDelegate._createPropertyInfos = async function (oMDCChart, oModel) {
    const sEntitySetPath = `/${oMDCChart.data("entitySet")}`;
    const oMetaModel = oModel.getMetaModel();
    const aResults = await Promise.all([oMetaModel.requestObject(`${sEntitySetPath}/`), oMetaModel.requestObject(`${sEntitySetPath}@`)]);
    const aProperties = [];
    const oEntityType = aResults[0],
      mEntitySetAnnotations = aResults[1];
    const mCustomAggregates = CommonHelper.parseCustomData(oMDCChart.data("customAgg"));
    let sAnno;
    const aPropertyPromise = [];
    for (const sAnnoKey in mEntitySetAnnotations) {
      if (sAnnoKey.startsWith("@Org.OData.Aggregation.V1.CustomAggregate")) {
        sAnno = sAnnoKey.replace("@Org.OData.Aggregation.V1.CustomAggregate#", "");
        const aAnno = sAnno.split("@");
        if (aAnno.length == 2 && aAnno[1] == "com.sap.vocabularies.Common.v1.Label") {
          mCustomAggregates[aAnno[0]] = mEntitySetAnnotations[sAnnoKey];
        }
      }
    }
    const aDimensions = [],
      aMeasures = [];
    if (Object.keys(mCustomAggregates).length >= 1) {
      const aChartItems = oMDCChart.getItems();
      for (const key in aChartItems) {
        if (aChartItems[key].isA("sap.ui.mdc.chart.DimensionItem")) {
          aDimensions.push(aChartItems[key].getKey());
        } else if (aChartItems[key].isA("sap.ui.mdc.chart.MeasureItem")) {
          aMeasures.push(aChartItems[key].getKey());
        }
      }
      if (aMeasures.filter(function (val) {
        return aDimensions.indexOf(val) != -1;
      }).length >= 1) {
        Log.error("Dimension and Measure has the sameProperty Configured");
      }
    }
    const mTypeAggregatableProps = CommonHelper.parseCustomData(oMDCChart.data("transAgg"));
    const mKnownAggregatableProps = {};
    for (const sAggregatable in mTypeAggregatableProps) {
      const sPropKey = mTypeAggregatableProps[sAggregatable].propertyPath;
      mKnownAggregatableProps[sPropKey] = mKnownAggregatableProps[sPropKey] || {};
      mKnownAggregatableProps[sPropKey][mTypeAggregatableProps[sAggregatable].aggregationMethod] = {
        name: mTypeAggregatableProps[sAggregatable].name,
        label: mTypeAggregatableProps[sAggregatable].label
      };
    }
    for (const sKey in oEntityType) {
      if (sKey.indexOf("$") !== 0) {
        aPropertyPromise.push(ODataMetaModelUtil.fetchCriticality(oMetaModel, oMetaModel.createBindingContext(`${sEntitySetPath}/${sKey}`)).then(ChartDelegate._handleProperty.bind(oMetaModel.getMetaContext(`${sEntitySetPath}/${sKey}`), oMDCChart, mEntitySetAnnotations, mKnownAggregatableProps, mCustomAggregates, aProperties)));
      }
    }
    await Promise.all(aPropertyPromise);
    return aProperties;
  };
  ChartDelegate._createPropertyInfosForAggregatable = function (oMDCChart, sKey, oPropertyAnnotations, oFilterRestrictionsInfo, sortRestrictionsInfo, mKnownAggregatableProps, mCustomAggregates) {
    const aAggregateProperties = [];
    if (Object.keys(mKnownAggregatableProps).indexOf(sKey) > -1) {
      for (const sAggregatable in mKnownAggregatableProps[sKey]) {
        aAggregateProperties.push({
          name: "_fe_aggregatable_" + mKnownAggregatableProps[sKey][sAggregatable].name,
          propertyPath: sKey,
          label: mKnownAggregatableProps[sKey][sAggregatable].label || `${oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"]} (${sAggregatable})` || `${sKey} (${sAggregatable})`,
          sortable: sortRestrictionsInfo.propertyInfo[sKey] ? sortRestrictionsInfo.propertyInfo[sKey].sortable : true,
          filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
          groupable: false,
          aggregatable: true,
          aggregationMethod: sAggregatable,
          maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
          role: ChartItemRoleType.axis1,
          datapoint: null //To be implemented by FE
        });
      }
    }

    if (Object.keys(mCustomAggregates).indexOf(sKey) > -1) {
      for (const sCustom in mCustomAggregates) {
        if (sCustom === sKey) {
          const oItem = merge({}, mCustomAggregates[sCustom], {
            name: "_fe_aggregatable_" + sCustom,
            groupable: false,
            aggregatable: true,
            role: ChartItemRoleType.axis1,
            datapoint: null //To be implemented by FE
          });

          aAggregateProperties.push(oItem);
          break;
        }
      }
    }
    return aAggregateProperties;
  };
  ChartDelegate.rebind = function (oMDCChart, oBindingInfo) {
    const sSearch = oBindingInfo.parameters.$search;
    if (sSearch) {
      delete oBindingInfo.parameters.$search;
    }
    BaseChartDelegate.rebind(oMDCChart, oBindingInfo);
    if (sSearch) {
      const oInnerChart = oMDCChart.getControlDelegate().getInnerChart(oMDCChart),
        oChartBinding = oInnerChart && oInnerChart.getBinding("data");

      // Temporary workaround until this is fixed in MDCChart / UI5 Chart
      // In order to avoid having 2 OData requests, we need to suspend the binding before setting some aggregation properties
      // and resume it once the chart has added other aggregation properties (in onBeforeRendering)
      oChartBinding.suspend();
      oChartBinding.setAggregation({
        search: sSearch
      });
      const oInnerChartDelegate = {
        onBeforeRendering: function () {
          oChartBinding.resume();
          oInnerChart.removeEventDelegate(oInnerChartDelegate);
        }
      };
      oInnerChart.addEventDelegate(oInnerChartDelegate);
    }
    oMDCChart.fireEvent("bindingUpdated");
  };
  ChartDelegate._setChart = function (oMDCChart, oInnerChart) {
    const oChartAPI = oMDCChart.getParent();
    oInnerChart.setVizProperties(oMDCChart.data("vizProperties"));
    oInnerChart.detachSelectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.detachDeselectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.detachDrilledUp(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.attachSelectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.attachDeselectData(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.attachDrilledUp(oChartAPI.handleSelectionChange.bind(oChartAPI));
    oInnerChart.setSelectionMode(oMDCChart.getPayload().selectionMode.toUpperCase());
    BaseChartDelegate._setChart(oMDCChart, oInnerChart);
  };
  ChartDelegate._getBindingInfo = function (oMDCChart) {
    if (this._getBindingInfoFromState(oMDCChart)) {
      return this._getBindingInfoFromState(oMDCChart);
    }
    const oMetadataInfo = oMDCChart.getDelegate().payload;
    const oMetaModel = oMDCChart.getModel() && oMDCChart.getModel().getMetaModel();
    const sTargetCollectionPath = oMDCChart.data("targetCollectionPath");
    const sEntitySetPath = (oMetaModel.getObject(`${sTargetCollectionPath}/$kind`) !== "NavigationProperty" ? "/" : "") + oMetadataInfo.contextPath;
    const oParams = merge({}, oMetadataInfo.parameters, {
      entitySet: oMDCChart.data("entitySet")
    });
    return {
      path: sEntitySetPath,
      events: {
        dataRequested: oMDCChart.getParent().onInternalDataRequested.bind(oMDCChart.getParent())
      },
      parameters: oParams
    };
  };
  ChartDelegate.removeItemFromInnerChart = function (oMDCChart, oMDCChartItem) {
    BaseChartDelegate.removeItemFromInnerChart.call(this, oMDCChart, oMDCChartItem);
    if (oMDCChartItem.getType() === "groupable") {
      const oInnerChart = this._getChart(oMDCChart);
      oInnerChart.fireDeselectData();
    }
  };
  ChartDelegate._getSortable = function (oMDCChart, sortRestrictionsProperty, bIsTransAggregate) {
    if (bIsTransAggregate) {
      if (oMDCChart.data("draftSupported") === "true") {
        return false;
      } else {
        return sortRestrictionsProperty ? sortRestrictionsProperty.sortable : true;
      }
    }
    return sortRestrictionsProperty ? sortRestrictionsProperty.sortable : true;
  };
  ChartDelegate._checkAndAddDraftFilter = function (oChart, oBindingInfo) {
    if (oChart.data("draftSupported") === "true") {
      if (!oBindingInfo) {
        oBindingInfo = {};
      }
      if (!oBindingInfo.filters) {
        oBindingInfo.filters = [];
      }
      oBindingInfo.filters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
    }
  };

  /**
   * This function returns an ID which should be used in the internal chart for the measure/dimension.
   * For standard cases, this is just the id of the property.
   * If it is necessary to use another id internally inside the chart (e.g. on duplicate property ids) this method can be overwritten.
   * In this case, <code>getPropertyFromNameAndKind</code> needs to be overwritten as well.
   *
   * @param {string} name ID of the property
   * @param {string} kind Type of the Property (Measure/Dimension)
   * @returns {string} Internal id for the sap.chart.Chart
   */
  ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function (name, kind) {
    return name.replace("_fe_" + kind + "_", "");
  };

  /**
   * This maps an id of an internal chart dimension/measure & type of a property to its corresponding property entry.
   *
   * @param {string} name ID of internal chart measure/dimension
   * @param {string} kind Kind of the property
   * @param {sap.ui.mdc.Chart} mdcChart Reference to the MDC chart
   * @returns {object} PropertyInfo object
   */
  ChartDelegate.getPropertyFromNameAndKind = function (name, kind, mdcChart) {
    return mdcChart.getPropertyHelper().getProperty("_fe_" + kind + "_" + name);
  };
  return ChartDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFydEl0ZW1Sb2xlVHlwZSIsIk1EQ0xpYiIsIkNoYXJ0RGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJCYXNlQ2hhcnREZWxlZ2F0ZSIsIl9zZXRDaGFydE5vRGF0YVRleHQiLCJvQ2hhcnQiLCJvQmluZGluZ0luZm8iLCJzTm9EYXRhS2V5Iiwib0NoYXJ0RmlsdGVySW5mbyIsIkNoYXJ0VXRpbHMiLCJnZXRBbGxGaWx0ZXJJbmZvIiwic3VmZml4UmVzb3VyY2VLZXkiLCJwYXRoIiwic3RhcnRzV2l0aCIsInN1YnN0ciIsIl9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMiLCJkYXRhIiwiZ2V0RmlsdGVyIiwic2VhcmNoIiwiZmlsdGVycyIsImxlbmd0aCIsImdldE1vZGVsIiwiZ2V0UmVzb3VyY2VCdW5kbGUiLCJ0aGVuIiwib1Jlc291cmNlQnVuZGxlIiwic2V0Tm9EYXRhVGV4dCIsIkNvbW1vblV0aWxzIiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJ1bmRlZmluZWQiLCJjYXRjaCIsImVycm9yIiwiTG9nIiwiX2hhbmRsZVByb3BlcnR5Iiwib01EQ0NoYXJ0IiwibUVudGl0eVNldEFubm90YXRpb25zIiwibUtub3duQWdncmVnYXRhYmxlUHJvcHMiLCJtQ3VzdG9tQWdncmVnYXRlcyIsImFQcm9wZXJ0aWVzIiwic0NyaXRpY2FsaXR5Iiwib0FwcGx5U3VwcG9ydGVkIiwiQ29tbW9uSGVscGVyIiwicGFyc2VDdXN0b21EYXRhIiwic29ydFJlc3RyaWN0aW9uc0luZm8iLCJPRGF0YU1ldGFNb2RlbFV0aWwiLCJnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyIsIm9GaWx0ZXJSZXN0cmljdGlvbnMiLCJvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8iLCJvT2JqIiwiZ2V0T2JqZWN0IiwiZ2V0UGF0aCIsInNLZXkiLCJvTWV0YU1vZGVsIiwiJGtpbmQiLCIkaXNDb2xsZWN0aW9uIiwib1Byb3BlcnR5QW5ub3RhdGlvbnMiLCJzUGF0aCIsImdldE1ldGFDb250ZXh0IiwiYUdyb3VwYWJsZVByb3BlcnRpZXMiLCJHcm91cGFibGVQcm9wZXJ0aWVzIiwiYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIiwiYkdyb3VwYWJsZSIsImJBZ2dyZWdhdGFibGUiLCJpIiwiJFByb3BlcnR5UGF0aCIsImoiLCJQcm9wZXJ0eSIsImFBZ2dyZWdhdGVQcm9wZXJ0aWVzIiwiX2NyZWF0ZVByb3BlcnR5SW5mb3NGb3JBZ2dyZWdhdGFibGUiLCJmb3JFYWNoIiwib0FnZ3JlZ2F0ZVByb3BlcnR5IiwicHVzaCIsInNOYW1lIiwic1RleHRQcm9wZXJ0eSIsIiRQYXRoIiwiYklzTmF2aWdhdGlvblRleHQiLCJpbmRleE9mIiwibmFtZSIsInByb3BlcnR5UGF0aCIsImxhYmVsIiwic29ydGFibGUiLCJfZ2V0U29ydGFibGUiLCJwcm9wZXJ0eUluZm8iLCJmaWx0ZXJhYmxlIiwiZ3JvdXBhYmxlIiwiYWdncmVnYXRhYmxlIiwibWF4Q29uZGl0aW9ucyIsImlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24iLCJzb3J0S2V5Iiwicm9sZSIsImNhdGVnb3J5IiwiY3JpdGljYWxpdHkiLCJ0ZXh0UHJvcGVydHkiLCJ0ZXh0Rm9ybWF0dGVyIiwiZm9ybWF0VGV4dCIsIm9WYWx1ZTEiLCJvVmFsdWUyIiwib1RleHRBcnJhbmdlbWVudEFubm90YXRpb24iLCIkRW51bU1lbWJlciIsInVwZGF0ZUJpbmRpbmdJbmZvIiwib0ZpbHRlciIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImJ5SWQiLCJtQ29uZGl0aW9ucyIsImdldENvbmRpdGlvbnMiLCJzb3J0ZXIiLCJnZXRTb3J0ZXJzIiwib0lubmVyQ2hhcnQiLCJnZXRDb250cm9sRGVsZWdhdGUiLCJnZXRJbm5lckNoYXJ0Iiwib0ZpbHRlckluZm8iLCJnZXRDaGFydFNlbGVjdGlvbnNFeGlzdCIsImdldEZpbHRlckJhckZpbHRlckluZm8iLCJzUGFyYW1ldGVyUGF0aCIsIkRlbGVnYXRlVXRpbCIsImdldFBhcmFtZXRlcnNJbmZvIiwib0luZm8iLCJGaWx0ZXJVdGlscyIsImdldEZpbHRlckluZm8iLCJlbmFibGVTZWFyY2giLCJwYXJhbWV0ZXJzIiwiJHNlYXJjaCIsIm5vcm1hbGl6ZVNlYXJjaFRlcm0iLCJfY2hlY2tBbmRBZGREcmFmdEZpbHRlciIsImZldGNoUHJvcGVydGllcyIsIm9Nb2RlbCIsIl9nZXRNb2RlbCIsInBDcmVhdGVQcm9wZXJ0eUluZm9zIiwiUHJvbWlzZSIsInJlc29sdmUiLCJhdHRhY2hNb2RlbENvbnRleHRDaGFuZ2UiLCJyZXNvbHZlciIsIm9uTW9kZWxDb250ZXh0Q2hhbmdlIiwib1JldHJpZXZlZE1vZGVsIiwiX2NyZWF0ZVByb3BlcnR5SW5mb3MiLCJvRXZlbnQiLCJvRGF0YSIsImdldFNvdXJjZSIsImRldGFjaE1vZGVsQ29udGV4dENoYW5nZSIsInNFbnRpdHlTZXRQYXRoIiwiZ2V0TWV0YU1vZGVsIiwiYVJlc3VsdHMiLCJhbGwiLCJyZXF1ZXN0T2JqZWN0Iiwib0VudGl0eVR5cGUiLCJzQW5ubyIsImFQcm9wZXJ0eVByb21pc2UiLCJzQW5ub0tleSIsInJlcGxhY2UiLCJhQW5ubyIsInNwbGl0IiwiYURpbWVuc2lvbnMiLCJhTWVhc3VyZXMiLCJrZXlzIiwiYUNoYXJ0SXRlbXMiLCJnZXRJdGVtcyIsImtleSIsImlzQSIsImdldEtleSIsImZpbHRlciIsInZhbCIsIm1UeXBlQWdncmVnYXRhYmxlUHJvcHMiLCJzQWdncmVnYXRhYmxlIiwic1Byb3BLZXkiLCJhZ2dyZWdhdGlvbk1ldGhvZCIsImZldGNoQ3JpdGljYWxpdHkiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImJpbmQiLCJheGlzMSIsImRhdGFwb2ludCIsInNDdXN0b20iLCJvSXRlbSIsIm1lcmdlIiwicmViaW5kIiwic1NlYXJjaCIsIm9DaGFydEJpbmRpbmciLCJnZXRCaW5kaW5nIiwic3VzcGVuZCIsInNldEFnZ3JlZ2F0aW9uIiwib0lubmVyQ2hhcnREZWxlZ2F0ZSIsIm9uQmVmb3JlUmVuZGVyaW5nIiwicmVzdW1lIiwicmVtb3ZlRXZlbnREZWxlZ2F0ZSIsImFkZEV2ZW50RGVsZWdhdGUiLCJmaXJlRXZlbnQiLCJfc2V0Q2hhcnQiLCJvQ2hhcnRBUEkiLCJnZXRQYXJlbnQiLCJzZXRWaXpQcm9wZXJ0aWVzIiwiZGV0YWNoU2VsZWN0RGF0YSIsImhhbmRsZVNlbGVjdGlvbkNoYW5nZSIsImRldGFjaERlc2VsZWN0RGF0YSIsImRldGFjaERyaWxsZWRVcCIsImF0dGFjaFNlbGVjdERhdGEiLCJhdHRhY2hEZXNlbGVjdERhdGEiLCJhdHRhY2hEcmlsbGVkVXAiLCJzZXRTZWxlY3Rpb25Nb2RlIiwiZ2V0UGF5bG9hZCIsInNlbGVjdGlvbk1vZGUiLCJ0b1VwcGVyQ2FzZSIsIl9nZXRCaW5kaW5nSW5mbyIsIl9nZXRCaW5kaW5nSW5mb0Zyb21TdGF0ZSIsIm9NZXRhZGF0YUluZm8iLCJnZXREZWxlZ2F0ZSIsInBheWxvYWQiLCJzVGFyZ2V0Q29sbGVjdGlvblBhdGgiLCJjb250ZXh0UGF0aCIsIm9QYXJhbXMiLCJlbnRpdHlTZXQiLCJldmVudHMiLCJkYXRhUmVxdWVzdGVkIiwib25JbnRlcm5hbERhdGFSZXF1ZXN0ZWQiLCJyZW1vdmVJdGVtRnJvbUlubmVyQ2hhcnQiLCJvTURDQ2hhcnRJdGVtIiwiY2FsbCIsImdldFR5cGUiLCJfZ2V0Q2hhcnQiLCJmaXJlRGVzZWxlY3REYXRhIiwic29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5IiwiYklzVHJhbnNBZ2dyZWdhdGUiLCJGaWx0ZXIiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwiZ2V0SW50ZXJuYWxDaGFydE5hbWVGcm9tUHJvcGVydHlOYW1lQW5kS2luZCIsImtpbmQiLCJnZXRQcm9wZXJ0eUZyb21OYW1lQW5kS2luZCIsIm1kY0NoYXJ0IiwiZ2V0UHJvcGVydHlIZWxwZXIiLCJnZXRQcm9wZXJ0eSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhcnREZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgbWVyZ2UgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBDaGFydFV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0VXRpbHNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWxVdGlsLCB7IHR5cGUgU29ydFJlc3RyaWN0aW9uc0luZm9UeXBlLCB0eXBlIFNvcnRSZXN0cmljdGlvbnNQcm9wZXJ0eUluZm9UeXBlIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvT0RhdGFNZXRhTW9kZWxVdGlsXCI7XG5pbXBvcnQgdHlwZSBDaGFydCBmcm9tIFwic2FwL3VpL21kYy9DaGFydFwiO1xuaW1wb3J0IE1EQ0xpYiBmcm9tIFwic2FwL3VpL21kYy9saWJyYXJ5XCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL29kYXRhL3Y0L3V0aWwvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgQmFzZUNoYXJ0RGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvb2RhdGEvdjQvdml6Q2hhcnQvQ2hhcnREZWxlZ2F0ZVwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcblxuY29uc3QgQ2hhcnRJdGVtUm9sZVR5cGUgPSAoTURDTGliIGFzIGFueSkuQ2hhcnRJdGVtUm9sZVR5cGU7XG4vLyAvKipcbi8vICAqIEhlbHBlciBjbGFzcyBmb3Igc2FwLnVpLm1kYy5DaGFydC5cbi8vICAqIDxoMz48Yj5Ob3RlOjwvYj48L2gzPlxuLy8gICogVGhlIGNsYXNzIGlzIGV4cGVyaW1lbnRhbCBhbmQgdGhlIEFQSS9iZWhhdmlvdXIgaXMgbm90IGZpbmFsaXNlZFxuLy8gICogYW5kIGhlbmNlIHRoaXMgc2hvdWxkIG5vdCBiZSB1c2VkIGZvciBwcm9kdWN0aXZlIHVzYWdlLlxuLy8gICogRXNwZWNpYWxseSB0aGlzIGNsYXNzIGlzIG5vdCBpbnRlbmRlZCB0byBiZSB1c2VkIGZvciB0aGUgRkUgc2NlbmFyaW8sXG4vLyAgKiBoZXJlIHdlIHNoYWxsIHVzZSBzYXAuZmUubWFjcm9zLkNoYXJ0RGVsZWdhdGUgdGhhdCBpcyBlc3BlY2lhbGx5IHRhaWxvcmVkIGZvciBWNFxuLy8gICogbWV0YSBtb2RlbFxuLy8gICpcbi8vICAqIEBhdXRob3IgU0FQIFNFXG4vLyAgKiBAcHJpdmF0ZVxuLy8gICogQGV4cGVyaW1lbnRhbFxuLy8gICogQHNpbmNlIDEuNjJcbi8vICAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLkNoYXJ0RGVsZWdhdGVcbi8vICAqL1xuY29uc3QgQ2hhcnREZWxlZ2F0ZSA9IE9iamVjdC5hc3NpZ24oe30sIEJhc2VDaGFydERlbGVnYXRlKTtcblxuQ2hhcnREZWxlZ2F0ZS5fc2V0Q2hhcnROb0RhdGFUZXh0ID0gZnVuY3Rpb24gKG9DaGFydDogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRsZXQgc05vRGF0YUtleSA9IFwiXCI7XG5cdGNvbnN0IG9DaGFydEZpbHRlckluZm8gPSBDaGFydFV0aWxzLmdldEFsbEZpbHRlckluZm8ob0NoYXJ0KSxcblx0XHRzdWZmaXhSZXNvdXJjZUtleSA9IG9CaW5kaW5nSW5mby5wYXRoLnN0YXJ0c1dpdGgoXCIvXCIpID8gb0JpbmRpbmdJbmZvLnBhdGguc3Vic3RyKDEpIDogb0JpbmRpbmdJbmZvLnBhdGg7XG5cdGNvbnN0IF9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKG9DaGFydC5kYXRhKFwibXVsdGlWaWV3c1wiKSkge1xuXHRcdFx0cmV0dXJuIFwiTV9UQUJMRV9BTkRfQ0hBUlRfTk9fREFUQV9URVhUX01VTFRJX1ZJRVdcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiVF9UQUJMRV9BTkRfQ0hBUlRfTk9fREFUQV9URVhUX1dJVEhfRklMVEVSXCI7XG5cdFx0fVxuXHR9O1xuXHRpZiAob0NoYXJ0LmdldEZpbHRlcigpKSB7XG5cdFx0aWYgKG9DaGFydEZpbHRlckluZm8uc2VhcmNoIHx8IChvQ2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnMgJiYgb0NoYXJ0RmlsdGVySW5mby5maWx0ZXJzLmxlbmd0aCkpIHtcblx0XHRcdHNOb0RhdGFLZXkgPSBfZ2V0Tm9EYXRhVGV4dFdpdGhGaWx0ZXJzKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNOb0RhdGFLZXkgPSBcIlRfVEFCTEVfQU5EX0NIQVJUX05PX0RBVEFfVEVYVFwiO1xuXHRcdH1cblx0fSBlbHNlIGlmIChvQ2hhcnRGaWx0ZXJJbmZvLnNlYXJjaCB8fCAob0NoYXJ0RmlsdGVySW5mby5maWx0ZXJzICYmIG9DaGFydEZpbHRlckluZm8uZmlsdGVycy5sZW5ndGgpKSB7XG5cdFx0c05vRGF0YUtleSA9IF9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMoKTtcblx0fSBlbHNlIHtcblx0XHRzTm9EYXRhS2V5ID0gXCJNX1RBQkxFX0FORF9DSEFSVF9OT19GSUxURVJTX05PX0RBVEFfVEVYVFwiO1xuXHR9XG5cdHJldHVybiAob0NoYXJ0LmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIikuZ2V0UmVzb3VyY2VCdW5kbGUoKSBhcyBQcm9taXNlPFJlc291cmNlQnVuZGxlPilcblx0XHQudGhlbihmdW5jdGlvbiAob1Jlc291cmNlQnVuZGxlKSB7XG5cdFx0XHRvQ2hhcnQuc2V0Tm9EYXRhVGV4dChDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChzTm9EYXRhS2V5LCBvUmVzb3VyY2VCdW5kbGUsIHVuZGVmaW5lZCwgc3VmZml4UmVzb3VyY2VLZXkpKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcblx0XHRcdExvZy5lcnJvcihlcnJvcik7XG5cdFx0fSk7XG59O1xuXG5DaGFydERlbGVnYXRlLl9oYW5kbGVQcm9wZXJ0eSA9IGZ1bmN0aW9uIChcblx0b01EQ0NoYXJ0OiBDaGFydCxcblx0bUVudGl0eVNldEFubm90YXRpb25zOiBhbnksXG5cdG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzOiBhbnksXG5cdG1DdXN0b21BZ2dyZWdhdGVzOiBhbnksXG5cdGFQcm9wZXJ0aWVzOiBhbnlbXSxcblx0c0NyaXRpY2FsaXR5OiBzdHJpbmdcbikge1xuXHRjb25zdCBvQXBwbHlTdXBwb3J0ZWQgPSBDb21tb25IZWxwZXIucGFyc2VDdXN0b21EYXRhKG9NRENDaGFydC5kYXRhKFwiYXBwbHlTdXBwb3J0ZWRcIikpO1xuXHRjb25zdCBzb3J0UmVzdHJpY3Rpb25zSW5mbyA9IE9EYXRhTWV0YU1vZGVsVXRpbC5nZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyhtRW50aXR5U2V0QW5ub3RhdGlvbnMpO1xuXHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zID0gbUVudGl0eVNldEFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zXCJdO1xuXHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyA9IE9EYXRhTWV0YU1vZGVsVXRpbC5nZXRGaWx0ZXJSZXN0cmljdGlvbnNJbmZvKG9GaWx0ZXJSZXN0cmljdGlvbnMpO1xuXHRjb25zdCBvT2JqID0gdGhpcy5nZXRNb2RlbCgpLmdldE9iamVjdCh0aGlzLmdldFBhdGgoKSk7XG5cdGNvbnN0IHNLZXkgPSB0aGlzLmdldE1vZGVsKCkuZ2V0T2JqZWN0KGAke3RoaXMuZ2V0UGF0aCgpfUBzYXB1aS5uYW1lYCkgYXMgc3RyaW5nO1xuXHRjb25zdCBvTWV0YU1vZGVsID0gdGhpcy5nZXRNb2RlbCgpO1xuXHRpZiAob09iaiAmJiBvT2JqLiRraW5kID09PSBcIlByb3BlcnR5XCIpIHtcblx0XHQvLyBpZ25vcmUgKGFzIGZvciBub3cpIGFsbCBjb21wbGV4IHByb3BlcnRpZXNcblx0XHQvLyBub3QgY2xlYXIgaWYgdGhleSBtaWdodCBiZSBuZXN0aW5nIChjb21wbGV4IGluIGNvbXBsZXgpXG5cdFx0Ly8gbm90IGNsZWFyIGhvdyB0aGV5IGFyZSByZXByZXNlbnRlZCBpbiBub24tZmlsdGVyYWJsZSBhbm5vdGF0aW9uXG5cdFx0Ly8gZXRjLlxuXHRcdGlmIChvT2JqLiRpc0NvbGxlY3Rpb24pIHtcblx0XHRcdC8vTG9nLndhcm5pbmcoXCJDb21wbGV4IHByb3BlcnR5IHdpdGggdHlwZSBcIiArIG9PYmouJFR5cGUgKyBcIiBoYXMgYmVlbiBpZ25vcmVkXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9Qcm9wZXJ0eUFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7dGhpcy5nZXRQYXRoKCl9QGApO1xuXHRcdGNvbnN0IHNQYXRoID0gb01ldGFNb2RlbC5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiLCBvTWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KHRoaXMuZ2V0UGF0aCgpKSk7XG5cblx0XHRjb25zdCBhR3JvdXBhYmxlUHJvcGVydGllcyA9IG9BcHBseVN1cHBvcnRlZCAmJiBvQXBwbHlTdXBwb3J0ZWQuR3JvdXBhYmxlUHJvcGVydGllcztcblx0XHRjb25zdCBhQWdncmVnYXRhYmxlUHJvcGVydGllcyA9IG9BcHBseVN1cHBvcnRlZCAmJiBvQXBwbHlTdXBwb3J0ZWQuQWdncmVnYXRhYmxlUHJvcGVydGllcztcblx0XHRsZXQgYkdyb3VwYWJsZSA9IGZhbHNlLFxuXHRcdFx0YkFnZ3JlZ2F0YWJsZSA9IGZhbHNlO1xuXHRcdGlmIChhR3JvdXBhYmxlUHJvcGVydGllcyAmJiBhR3JvdXBhYmxlUHJvcGVydGllcy5sZW5ndGgpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUdyb3VwYWJsZVByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGFHcm91cGFibGVQcm9wZXJ0aWVzW2ldLiRQcm9wZXJ0eVBhdGggPT09IHNQYXRoKSB7XG5cdFx0XHRcdFx0Ykdyb3VwYWJsZSA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzICYmIGFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzLmxlbmd0aCkge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhQWdncmVnYXRhYmxlUHJvcGVydGllcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRpZiAoYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXNbal0uUHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gc1BhdGgpIHtcblx0XHRcdFx0XHRiQWdncmVnYXRhYmxlID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWFHcm91cGFibGVQcm9wZXJ0aWVzIHx8IChhR3JvdXBhYmxlUHJvcGVydGllcyAmJiAhYUdyb3VwYWJsZVByb3BlcnRpZXMubGVuZ3RoKSkge1xuXHRcdFx0Ykdyb3VwYWJsZSA9IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5Hcm91cGFibGVcIl07XG5cdFx0fVxuXHRcdGlmICghYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMgfHwgKGFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzICYmICFhQWdncmVnYXRhYmxlUHJvcGVydGllcy5sZW5ndGgpKSB7XG5cdFx0XHRiQWdncmVnYXRhYmxlID0gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkFnZ3JlZ2F0YWJsZVwiXTtcblx0XHR9XG5cblx0XHQvL1JpZ2h0IG5vdzogc2tpcCB0aGVtLCBzaW5jZSB3ZSBjYW4ndCBjcmVhdGUgYSBjaGFydCBmcm9tIGl0XG5cdFx0aWYgKCFiR3JvdXBhYmxlICYmICFiQWdncmVnYXRhYmxlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKGJBZ2dyZWdhdGFibGUpIHtcblx0XHRcdGNvbnN0IGFBZ2dyZWdhdGVQcm9wZXJ0aWVzID0gQ2hhcnREZWxlZ2F0ZS5fY3JlYXRlUHJvcGVydHlJbmZvc0ZvckFnZ3JlZ2F0YWJsZShcblx0XHRcdFx0b01EQ0NoYXJ0LFxuXHRcdFx0XHRzS2V5LFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9ucyxcblx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9uc0luZm8sXG5cdFx0XHRcdHNvcnRSZXN0cmljdGlvbnNJbmZvLFxuXHRcdFx0XHRtS25vd25BZ2dyZWdhdGFibGVQcm9wcyxcblx0XHRcdFx0bUN1c3RvbUFnZ3JlZ2F0ZXNcblx0XHRcdCk7XG5cdFx0XHRhQWdncmVnYXRlUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChvQWdncmVnYXRlUHJvcGVydHk6IGFueSkge1xuXHRcdFx0XHRhUHJvcGVydGllcy5wdXNoKG9BZ2dyZWdhdGVQcm9wZXJ0eSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoYkdyb3VwYWJsZSkge1xuXHRcdFx0Y29uc3Qgc05hbWUgPSBzS2V5IHx8IFwiXCIsXG5cdFx0XHRcdHNUZXh0UHJvcGVydHkgPSBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXVxuXHRcdFx0XHRcdD8gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0uJFBhdGhcblx0XHRcdFx0XHQ6IG51bGw7XG5cdFx0XHRsZXQgYklzTmF2aWdhdGlvblRleHQgPSBmYWxzZTtcblx0XHRcdGlmIChzTmFtZSAmJiBzTmFtZS5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHRcdExvZy5lcnJvcihgJGV4cGFuZCBpcyBub3QgeWV0IHN1cHBvcnRlZC4gUHJvcGVydHk6ICR7c05hbWV9IGZyb20gYW4gYXNzb2NpYXRpb24gY2Fubm90IGJlIHVzZWRgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNUZXh0UHJvcGVydHkgJiYgc1RleHRQcm9wZXJ0eS5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHRcdExvZy5lcnJvcihgJGV4cGFuZCBpcyBub3QgeWV0IHN1cHBvcnRlZC4gVGV4dCBQcm9wZXJ0eTogJHtzVGV4dFByb3BlcnR5fSBmcm9tIGFuIGFzc29jaWF0aW9uIGNhbm5vdCBiZSB1c2VkYCk7XG5cdFx0XHRcdGJJc05hdmlnYXRpb25UZXh0ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGFQcm9wZXJ0aWVzLnB1c2goe1xuXHRcdFx0XHRuYW1lOiBcIl9mZV9ncm91cGFibGVfXCIgKyBzS2V5LFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGg6IHNLZXksXG5cdFx0XHRcdGxhYmVsOiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIl0gfHwgc0tleSxcblx0XHRcdFx0c29ydGFibGU6IENoYXJ0RGVsZWdhdGUuX2dldFNvcnRhYmxlKG9NRENDaGFydCwgc29ydFJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3NLZXldLCBmYWxzZSksXG5cdFx0XHRcdGZpbHRlcmFibGU6IG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvW3NLZXldID8gb0ZpbHRlclJlc3RyaWN0aW9uc0luZm9bc0tleV0uZmlsdGVyYWJsZSA6IHRydWUsXG5cdFx0XHRcdGdyb3VwYWJsZTogdHJ1ZSxcblx0XHRcdFx0YWdncmVnYXRhYmxlOiBmYWxzZSxcblx0XHRcdFx0bWF4Q29uZGl0aW9uczogT0RhdGFNZXRhTW9kZWxVdGlsLmlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24ob0ZpbHRlclJlc3RyaWN0aW9uc0luZm8ucHJvcGVydHlJbmZvW3NLZXldKSA/IC0xIDogMSxcblx0XHRcdFx0c29ydEtleTogc0tleSxcblx0XHRcdFx0cm9sZTogQ2hhcnRJdGVtUm9sZVR5cGUuY2F0ZWdvcnksIC8vc3RhbmRhcmQsIG5vcm1hbGx5IHRoaXMgc2hvdWxkIGJlIGludGVycHJldGVkIGZyb20gVUkuQ2hhcnQgYW5ub3RhdGlvblxuXHRcdFx0XHRjcml0aWNhbGl0eTogc0NyaXRpY2FsaXR5LCAvL1RvIGJlIGltcGxlbWVudGVkIGJ5IEZFXG5cdFx0XHRcdHRleHRQcm9wZXJ0eTpcblx0XHRcdFx0XHQhYklzTmF2aWdhdGlvblRleHQgJiYgb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl1cblx0XHRcdFx0XHRcdD8gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0uJFBhdGhcblx0XHRcdFx0XHRcdDogbnVsbCwgLy9UbyBiZSBpbXBsZW1lbnRlZCBieSBGRVxuXHRcdFx0XHR0ZXh0Rm9ybWF0dGVyOiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufTtcblxuQ2hhcnREZWxlZ2F0ZS5mb3JtYXRUZXh0ID0gZnVuY3Rpb24gKG9WYWx1ZTE6IGFueSwgb1ZhbHVlMjogYW55KSB7XG5cdGNvbnN0IG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID0gdGhpcy50ZXh0Rm9ybWF0dGVyO1xuXHRpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0Rmlyc3RcIikge1xuXHRcdHJldHVybiBgJHtvVmFsdWUyfSAoJHtvVmFsdWUxfSlgO1xuXHR9IGVsc2UgaWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dExhc3RcIikge1xuXHRcdHJldHVybiBgJHtvVmFsdWUxfSAoJHtvVmFsdWUyfSlgO1xuXHR9IGVsc2UgaWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIikge1xuXHRcdHJldHVybiBvVmFsdWUyO1xuXHR9XG5cdHJldHVybiBvVmFsdWUyID8gb1ZhbHVlMiA6IG9WYWx1ZTE7XG59O1xuXG5DaGFydERlbGVnYXRlLnVwZGF0ZUJpbmRpbmdJbmZvID0gZnVuY3Rpb24gKG9DaGFydDogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRDaGFydERlbGVnYXRlLl9zZXRDaGFydE5vRGF0YVRleHQob0NoYXJ0LCBvQmluZGluZ0luZm8pO1xuXG5cdGNvbnN0IG9GaWx0ZXIgPSBzYXAudWkuZ2V0Q29yZSgpLmJ5SWQob0NoYXJ0LmdldEZpbHRlcigpKSBhcyBhbnk7XG5cdGlmIChvRmlsdGVyKSB7XG5cdFx0Y29uc3QgbUNvbmRpdGlvbnMgPSBvRmlsdGVyLmdldENvbmRpdGlvbnMoKTtcblxuXHRcdGlmIChtQ29uZGl0aW9ucykge1xuXHRcdFx0aWYgKCFvQmluZGluZ0luZm8pIHtcblx0XHRcdFx0b0JpbmRpbmdJbmZvID0ge307XG5cdFx0XHR9XG5cdFx0XHRvQmluZGluZ0luZm8uc29ydGVyID0gdGhpcy5nZXRTb3J0ZXJzKG9DaGFydCk7XG5cdFx0XHRjb25zdCBvSW5uZXJDaGFydCA9IG9DaGFydC5nZXRDb250cm9sRGVsZWdhdGUoKS5nZXRJbm5lckNoYXJ0KG9DaGFydCk7XG5cdFx0XHRsZXQgb0ZpbHRlckluZm87XG5cdFx0XHRpZiAob0lubmVyQ2hhcnQpIHtcblx0XHRcdFx0Ly8gaWYgdGhlIGFjdGlvbiBpcyBhIGRyaWxsIGRvd24sIGNoYXJ0IHNlbGVjdGlvbnMgbXVzdCBiZSBjb25zaWRlcmVkXG5cdFx0XHRcdGlmIChDaGFydFV0aWxzLmdldENoYXJ0U2VsZWN0aW9uc0V4aXN0KG9DaGFydCkpIHtcblx0XHRcdFx0XHRvRmlsdGVySW5mbyA9IENoYXJ0VXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhvQ2hhcnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRvRmlsdGVySW5mbyA9IG9GaWx0ZXJJbmZvID8gb0ZpbHRlckluZm8gOiBDaGFydFV0aWxzLmdldEZpbHRlckJhckZpbHRlckluZm8ob0NoYXJ0KTtcblx0XHRcdGlmIChvRmlsdGVySW5mbykge1xuXHRcdFx0XHRvQmluZGluZ0luZm8uZmlsdGVycyA9IG9GaWx0ZXJJbmZvLmZpbHRlcnM7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHNQYXJhbWV0ZXJQYXRoID0gRGVsZWdhdGVVdGlsLmdldFBhcmFtZXRlcnNJbmZvKG9GaWx0ZXIsIG1Db25kaXRpb25zKTtcblx0XHRcdGlmIChzUGFyYW1ldGVyUGF0aCkge1xuXHRcdFx0XHRvQmluZGluZ0luZm8ucGF0aCA9IHNQYXJhbWV0ZXJQYXRoO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFNlYXJjaFxuXHRcdGNvbnN0IG9JbmZvID0gRmlsdGVyVXRpbHMuZ2V0RmlsdGVySW5mbyhvRmlsdGVyLCB7fSk7XG5cdFx0Y29uc3Qgb0FwcGx5U3VwcG9ydGVkID0gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvQ2hhcnQuZGF0YShcImFwcGx5U3VwcG9ydGVkXCIpKTtcblx0XHRpZiAob0FwcGx5U3VwcG9ydGVkICYmIG9BcHBseVN1cHBvcnRlZC5lbmFibGVTZWFyY2ggJiYgb0luZm8uc2VhcmNoKSB7XG5cdFx0XHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoID0gQ29tbW9uVXRpbHMubm9ybWFsaXplU2VhcmNoVGVybShvSW5mby5zZWFyY2gpO1xuXHRcdH0gZWxzZSBpZiAob0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaCkge1xuXHRcdFx0ZGVsZXRlIG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2g7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGlmICghb0JpbmRpbmdJbmZvKSB7XG5cdFx0XHRvQmluZGluZ0luZm8gPSB7fTtcblx0XHR9XG5cdFx0b0JpbmRpbmdJbmZvLnNvcnRlciA9IHRoaXMuZ2V0U29ydGVycyhvQ2hhcnQpO1xuXHR9XG5cdENoYXJ0RGVsZWdhdGUuX2NoZWNrQW5kQWRkRHJhZnRGaWx0ZXIob0NoYXJ0LCBvQmluZGluZ0luZm8pO1xufTtcblxuQ2hhcnREZWxlZ2F0ZS5mZXRjaFByb3BlcnRpZXMgPSBmdW5jdGlvbiAob01EQ0NoYXJ0OiBDaGFydCkge1xuXHRjb25zdCBvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbChvTURDQ2hhcnQpO1xuXHRsZXQgcENyZWF0ZVByb3BlcnR5SW5mb3M7XG5cblx0aWYgKCFvTW9kZWwpIHtcblx0XHRwQ3JlYXRlUHJvcGVydHlJbmZvcyA9IG5ldyBQcm9taXNlKChyZXNvbHZlOiBhbnkpID0+IHtcblx0XHRcdG9NRENDaGFydC5hdHRhY2hNb2RlbENvbnRleHRDaGFuZ2UoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXNvbHZlcjogcmVzb2x2ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvbk1vZGVsQ29udGV4dENoYW5nZSBhcyBhbnksXG5cdFx0XHRcdHRoaXNcblx0XHRcdCk7XG5cdFx0fSkudGhlbigob1JldHJpZXZlZE1vZGVsOiBhbnkpID0+IHtcblx0XHRcdHJldHVybiB0aGlzLl9jcmVhdGVQcm9wZXJ0eUluZm9zKG9NRENDaGFydCwgb1JldHJpZXZlZE1vZGVsKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRwQ3JlYXRlUHJvcGVydHlJbmZvcyA9IHRoaXMuX2NyZWF0ZVByb3BlcnR5SW5mb3Mob01EQ0NoYXJ0LCBvTW9kZWwpO1xuXHR9XG5cblx0cmV0dXJuIHBDcmVhdGVQcm9wZXJ0eUluZm9zLnRoZW4oZnVuY3Rpb24gKGFQcm9wZXJ0aWVzOiBhbnkpIHtcblx0XHRpZiAob01EQ0NoYXJ0LmRhdGEpIHtcblx0XHRcdG9NRENDaGFydC5kYXRhKFwiJG1kY0NoYXJ0UHJvcGVydHlJbmZvXCIsIGFQcm9wZXJ0aWVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFQcm9wZXJ0aWVzO1xuXHR9KTtcbn07XG5mdW5jdGlvbiBvbk1vZGVsQ29udGV4dENoYW5nZSh0aGlzOiB0eXBlb2YgQ2hhcnREZWxlZ2F0ZSwgb0V2ZW50OiBhbnksIG9EYXRhOiBhbnkpIHtcblx0Y29uc3Qgb01EQ0NoYXJ0ID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRjb25zdCBvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbChvTURDQ2hhcnQpO1xuXG5cdGlmIChvTW9kZWwpIHtcblx0XHRvTURDQ2hhcnQuZGV0YWNoTW9kZWxDb250ZXh0Q2hhbmdlKG9uTW9kZWxDb250ZXh0Q2hhbmdlKTtcblx0XHRvRGF0YS5yZXNvbHZlcihvTW9kZWwpO1xuXHR9XG59XG5DaGFydERlbGVnYXRlLl9jcmVhdGVQcm9wZXJ0eUluZm9zID0gYXN5bmMgZnVuY3Rpb24gKG9NRENDaGFydDogYW55LCBvTW9kZWw6IGFueSkge1xuXHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IGAvJHtvTURDQ2hhcnQuZGF0YShcImVudGl0eVNldFwiKX1gO1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXG5cdGNvbnN0IGFSZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGwoW29NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH0vYCksIG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH1AYCldKTtcblx0Y29uc3QgYVByb3BlcnRpZXM6IGFueVtdID0gW107XG5cdGNvbnN0IG9FbnRpdHlUeXBlID0gYVJlc3VsdHNbMF0sXG5cdFx0bUVudGl0eVNldEFubm90YXRpb25zID0gYVJlc3VsdHNbMV07XG5cdGNvbnN0IG1DdXN0b21BZ2dyZWdhdGVzID0gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvTURDQ2hhcnQuZGF0YShcImN1c3RvbUFnZ1wiKSk7XG5cdGxldCBzQW5ubztcblx0Y29uc3QgYVByb3BlcnR5UHJvbWlzZSA9IFtdO1xuXHRmb3IgKGNvbnN0IHNBbm5vS2V5IGluIG1FbnRpdHlTZXRBbm5vdGF0aW9ucykge1xuXHRcdGlmIChzQW5ub0tleS5zdGFydHNXaXRoKFwiQE9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5DdXN0b21BZ2dyZWdhdGVcIikpIHtcblx0XHRcdHNBbm5vID0gc0Fubm9LZXkucmVwbGFjZShcIkBPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQ3VzdG9tQWdncmVnYXRlI1wiLCBcIlwiKTtcblx0XHRcdGNvbnN0IGFBbm5vID0gc0Fubm8uc3BsaXQoXCJAXCIpO1xuXG5cdFx0XHRpZiAoYUFubm8ubGVuZ3RoID09IDIgJiYgYUFubm9bMV0gPT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIikge1xuXHRcdFx0XHRtQ3VzdG9tQWdncmVnYXRlc1thQW5ub1swXV0gPSBtRW50aXR5U2V0QW5ub3RhdGlvbnNbc0Fubm9LZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRjb25zdCBhRGltZW5zaW9uczogYW55W10gPSBbXSxcblx0XHRhTWVhc3VyZXMgPSBbXTtcblx0aWYgKE9iamVjdC5rZXlzKG1DdXN0b21BZ2dyZWdhdGVzKS5sZW5ndGggPj0gMSkge1xuXHRcdGNvbnN0IGFDaGFydEl0ZW1zID0gb01EQ0NoYXJ0LmdldEl0ZW1zKCk7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gYUNoYXJ0SXRlbXMpIHtcblx0XHRcdGlmIChhQ2hhcnRJdGVtc1trZXldLmlzQShcInNhcC51aS5tZGMuY2hhcnQuRGltZW5zaW9uSXRlbVwiKSkge1xuXHRcdFx0XHRhRGltZW5zaW9ucy5wdXNoKGFDaGFydEl0ZW1zW2tleV0uZ2V0S2V5KCkpO1xuXHRcdFx0fSBlbHNlIGlmIChhQ2hhcnRJdGVtc1trZXldLmlzQShcInNhcC51aS5tZGMuY2hhcnQuTWVhc3VyZUl0ZW1cIikpIHtcblx0XHRcdFx0YU1lYXN1cmVzLnB1c2goYUNoYXJ0SXRlbXNba2V5XS5nZXRLZXkoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChcblx0XHRcdGFNZWFzdXJlcy5maWx0ZXIoZnVuY3Rpb24gKHZhbDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBhRGltZW5zaW9ucy5pbmRleE9mKHZhbCkgIT0gLTE7XG5cdFx0XHR9KS5sZW5ndGggPj0gMVxuXHRcdCkge1xuXHRcdFx0TG9nLmVycm9yKFwiRGltZW5zaW9uIGFuZCBNZWFzdXJlIGhhcyB0aGUgc2FtZVByb3BlcnR5IENvbmZpZ3VyZWRcIik7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgbVR5cGVBZ2dyZWdhdGFibGVQcm9wcyA9IENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEob01EQ0NoYXJ0LmRhdGEoXCJ0cmFuc0FnZ1wiKSk7XG5cdGNvbnN0IG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzOiBhbnkgPSB7fTtcblx0Zm9yIChjb25zdCBzQWdncmVnYXRhYmxlIGluIG1UeXBlQWdncmVnYXRhYmxlUHJvcHMpIHtcblx0XHRjb25zdCBzUHJvcEtleSA9IG1UeXBlQWdncmVnYXRhYmxlUHJvcHNbc0FnZ3JlZ2F0YWJsZV0ucHJvcGVydHlQYXRoO1xuXHRcdG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzW3NQcm9wS2V5XSA9IG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzW3NQcm9wS2V5XSB8fCB7fTtcblx0XHRtS25vd25BZ2dyZWdhdGFibGVQcm9wc1tzUHJvcEtleV1bbVR5cGVBZ2dyZWdhdGFibGVQcm9wc1tzQWdncmVnYXRhYmxlXS5hZ2dyZWdhdGlvbk1ldGhvZF0gPSB7XG5cdFx0XHRuYW1lOiBtVHlwZUFnZ3JlZ2F0YWJsZVByb3BzW3NBZ2dyZWdhdGFibGVdLm5hbWUsXG5cdFx0XHRsYWJlbDogbVR5cGVBZ2dyZWdhdGFibGVQcm9wc1tzQWdncmVnYXRhYmxlXS5sYWJlbFxuXHRcdH07XG5cdH1cblx0Zm9yIChjb25zdCBzS2V5IGluIG9FbnRpdHlUeXBlKSB7XG5cdFx0aWYgKHNLZXkuaW5kZXhPZihcIiRcIikgIT09IDApIHtcblx0XHRcdGFQcm9wZXJ0eVByb21pc2UucHVzaChcblx0XHRcdFx0T0RhdGFNZXRhTW9kZWxVdGlsLmZldGNoQ3JpdGljYWxpdHkob01ldGFNb2RlbCwgb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgJHtzRW50aXR5U2V0UGF0aH0vJHtzS2V5fWApKS50aGVuKFxuXHRcdFx0XHRcdENoYXJ0RGVsZWdhdGUuX2hhbmRsZVByb3BlcnR5LmJpbmQoXG5cdFx0XHRcdFx0XHRvTWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KGAke3NFbnRpdHlTZXRQYXRofS8ke3NLZXl9YCksXG5cdFx0XHRcdFx0XHRvTURDQ2hhcnQsXG5cdFx0XHRcdFx0XHRtRW50aXR5U2V0QW5ub3RhdGlvbnMsXG5cdFx0XHRcdFx0XHRtS25vd25BZ2dyZWdhdGFibGVQcm9wcyxcblx0XHRcdFx0XHRcdG1DdXN0b21BZ2dyZWdhdGVzLFxuXHRcdFx0XHRcdFx0YVByb3BlcnRpZXNcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cdGF3YWl0IFByb21pc2UuYWxsKGFQcm9wZXJ0eVByb21pc2UpO1xuXG5cdHJldHVybiBhUHJvcGVydGllcztcbn07XG5cbkNoYXJ0RGVsZWdhdGUuX2NyZWF0ZVByb3BlcnR5SW5mb3NGb3JBZ2dyZWdhdGFibGUgPSBmdW5jdGlvbiAoXG5cdG9NRENDaGFydDogQ2hhcnQsXG5cdHNLZXk6IHN0cmluZyxcblx0b1Byb3BlcnR5QW5ub3RhdGlvbnM6IGFueSxcblx0b0ZpbHRlclJlc3RyaWN0aW9uc0luZm86IGFueSxcblx0c29ydFJlc3RyaWN0aW9uc0luZm86IFNvcnRSZXN0cmljdGlvbnNJbmZvVHlwZSxcblx0bUtub3duQWdncmVnYXRhYmxlUHJvcHM6IGFueSxcblx0bUN1c3RvbUFnZ3JlZ2F0ZXM6IGFueVxuKSB7XG5cdGNvbnN0IGFBZ2dyZWdhdGVQcm9wZXJ0aWVzID0gW107XG5cdGlmIChPYmplY3Qua2V5cyhtS25vd25BZ2dyZWdhdGFibGVQcm9wcykuaW5kZXhPZihzS2V5KSA+IC0xKSB7XG5cdFx0Zm9yIChjb25zdCBzQWdncmVnYXRhYmxlIGluIG1Lbm93bkFnZ3JlZ2F0YWJsZVByb3BzW3NLZXldKSB7XG5cdFx0XHRhQWdncmVnYXRlUHJvcGVydGllcy5wdXNoKHtcblx0XHRcdFx0bmFtZTogXCJfZmVfYWdncmVnYXRhYmxlX1wiICsgbUtub3duQWdncmVnYXRhYmxlUHJvcHNbc0tleV1bc0FnZ3JlZ2F0YWJsZV0ubmFtZSxcblx0XHRcdFx0cHJvcGVydHlQYXRoOiBzS2V5LFxuXHRcdFx0XHRsYWJlbDpcblx0XHRcdFx0XHRtS25vd25BZ2dyZWdhdGFibGVQcm9wc1tzS2V5XVtzQWdncmVnYXRhYmxlXS5sYWJlbCB8fFxuXHRcdFx0XHRcdGAke29Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbFwiXX0gKCR7c0FnZ3JlZ2F0YWJsZX0pYCB8fFxuXHRcdFx0XHRcdGAke3NLZXl9ICgke3NBZ2dyZWdhdGFibGV9KWAsXG5cdFx0XHRcdHNvcnRhYmxlOiBzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bc0tleV0gPyBzb3J0UmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bc0tleV0uc29ydGFibGUgOiB0cnVlLFxuXHRcdFx0XHRmaWx0ZXJhYmxlOiBvRmlsdGVyUmVzdHJpY3Rpb25zSW5mb1tzS2V5XSA/IG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvW3NLZXldLmZpbHRlcmFibGUgOiB0cnVlLFxuXHRcdFx0XHRncm91cGFibGU6IGZhbHNlLFxuXHRcdFx0XHRhZ2dyZWdhdGFibGU6IHRydWUsXG5cdFx0XHRcdGFnZ3JlZ2F0aW9uTWV0aG9kOiBzQWdncmVnYXRhYmxlLFxuXHRcdFx0XHRtYXhDb25kaXRpb25zOiBPRGF0YU1ldGFNb2RlbFV0aWwuaXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bc0tleV0pID8gLTEgOiAxLFxuXHRcdFx0XHRyb2xlOiBDaGFydEl0ZW1Sb2xlVHlwZS5heGlzMSxcblx0XHRcdFx0ZGF0YXBvaW50OiBudWxsIC8vVG8gYmUgaW1wbGVtZW50ZWQgYnkgRkVcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRpZiAoT2JqZWN0LmtleXMobUN1c3RvbUFnZ3JlZ2F0ZXMpLmluZGV4T2Yoc0tleSkgPiAtMSkge1xuXHRcdGZvciAoY29uc3Qgc0N1c3RvbSBpbiBtQ3VzdG9tQWdncmVnYXRlcykge1xuXHRcdFx0aWYgKHNDdXN0b20gPT09IHNLZXkpIHtcblx0XHRcdFx0Y29uc3Qgb0l0ZW0gPSBtZXJnZSh7fSwgbUN1c3RvbUFnZ3JlZ2F0ZXNbc0N1c3RvbV0sIHtcblx0XHRcdFx0XHRuYW1lOiBcIl9mZV9hZ2dyZWdhdGFibGVfXCIgKyBzQ3VzdG9tLFxuXHRcdFx0XHRcdGdyb3VwYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0YWdncmVnYXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHJvbGU6IENoYXJ0SXRlbVJvbGVUeXBlLmF4aXMxLFxuXHRcdFx0XHRcdGRhdGFwb2ludDogbnVsbCAvL1RvIGJlIGltcGxlbWVudGVkIGJ5IEZFXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRhQWdncmVnYXRlUHJvcGVydGllcy5wdXNoKG9JdGVtKTtcblxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGFBZ2dyZWdhdGVQcm9wZXJ0aWVzO1xufTtcbkNoYXJ0RGVsZWdhdGUucmViaW5kID0gZnVuY3Rpb24gKG9NRENDaGFydDogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRjb25zdCBzU2VhcmNoID0gb0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaDtcblxuXHRpZiAoc1NlYXJjaCkge1xuXHRcdGRlbGV0ZSBvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoO1xuXHR9XG5cblx0QmFzZUNoYXJ0RGVsZWdhdGUucmViaW5kKG9NRENDaGFydCwgb0JpbmRpbmdJbmZvKTtcblxuXHRpZiAoc1NlYXJjaCkge1xuXHRcdGNvbnN0IG9Jbm5lckNoYXJ0ID0gb01EQ0NoYXJ0LmdldENvbnRyb2xEZWxlZ2F0ZSgpLmdldElubmVyQ2hhcnQob01EQ0NoYXJ0KSxcblx0XHRcdG9DaGFydEJpbmRpbmcgPSBvSW5uZXJDaGFydCAmJiBvSW5uZXJDaGFydC5nZXRCaW5kaW5nKFwiZGF0YVwiKTtcblxuXHRcdC8vIFRlbXBvcmFyeSB3b3JrYXJvdW5kIHVudGlsIHRoaXMgaXMgZml4ZWQgaW4gTURDQ2hhcnQgLyBVSTUgQ2hhcnRcblx0XHQvLyBJbiBvcmRlciB0byBhdm9pZCBoYXZpbmcgMiBPRGF0YSByZXF1ZXN0cywgd2UgbmVlZCB0byBzdXNwZW5kIHRoZSBiaW5kaW5nIGJlZm9yZSBzZXR0aW5nIHNvbWUgYWdncmVnYXRpb24gcHJvcGVydGllc1xuXHRcdC8vIGFuZCByZXN1bWUgaXQgb25jZSB0aGUgY2hhcnQgaGFzIGFkZGVkIG90aGVyIGFnZ3JlZ2F0aW9uIHByb3BlcnRpZXMgKGluIG9uQmVmb3JlUmVuZGVyaW5nKVxuXHRcdG9DaGFydEJpbmRpbmcuc3VzcGVuZCgpO1xuXHRcdG9DaGFydEJpbmRpbmcuc2V0QWdncmVnYXRpb24oeyBzZWFyY2g6IHNTZWFyY2ggfSk7XG5cblx0XHRjb25zdCBvSW5uZXJDaGFydERlbGVnYXRlID0ge1xuXHRcdFx0b25CZWZvcmVSZW5kZXJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0b0NoYXJ0QmluZGluZy5yZXN1bWUoKTtcblx0XHRcdFx0b0lubmVyQ2hhcnQucmVtb3ZlRXZlbnREZWxlZ2F0ZShvSW5uZXJDaGFydERlbGVnYXRlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdG9Jbm5lckNoYXJ0LmFkZEV2ZW50RGVsZWdhdGUob0lubmVyQ2hhcnREZWxlZ2F0ZSk7XG5cdH1cblxuXHRvTURDQ2hhcnQuZmlyZUV2ZW50KFwiYmluZGluZ1VwZGF0ZWRcIik7XG59O1xuQ2hhcnREZWxlZ2F0ZS5fc2V0Q2hhcnQgPSBmdW5jdGlvbiAob01EQ0NoYXJ0OiBhbnksIG9Jbm5lckNoYXJ0OiBhbnkpIHtcblx0Y29uc3Qgb0NoYXJ0QVBJID0gb01EQ0NoYXJ0LmdldFBhcmVudCgpO1xuXHRvSW5uZXJDaGFydC5zZXRWaXpQcm9wZXJ0aWVzKG9NRENDaGFydC5kYXRhKFwidml6UHJvcGVydGllc1wiKSk7XG5cdG9Jbm5lckNoYXJ0LmRldGFjaFNlbGVjdERhdGEob0NoYXJ0QVBJLmhhbmRsZVNlbGVjdGlvbkNoYW5nZS5iaW5kKG9DaGFydEFQSSkpO1xuXHRvSW5uZXJDaGFydC5kZXRhY2hEZXNlbGVjdERhdGEob0NoYXJ0QVBJLmhhbmRsZVNlbGVjdGlvbkNoYW5nZS5iaW5kKG9DaGFydEFQSSkpO1xuXHRvSW5uZXJDaGFydC5kZXRhY2hEcmlsbGVkVXAob0NoYXJ0QVBJLmhhbmRsZVNlbGVjdGlvbkNoYW5nZS5iaW5kKG9DaGFydEFQSSkpO1xuXHRvSW5uZXJDaGFydC5hdHRhY2hTZWxlY3REYXRhKG9DaGFydEFQSS5oYW5kbGVTZWxlY3Rpb25DaGFuZ2UuYmluZChvQ2hhcnRBUEkpKTtcblx0b0lubmVyQ2hhcnQuYXR0YWNoRGVzZWxlY3REYXRhKG9DaGFydEFQSS5oYW5kbGVTZWxlY3Rpb25DaGFuZ2UuYmluZChvQ2hhcnRBUEkpKTtcblx0b0lubmVyQ2hhcnQuYXR0YWNoRHJpbGxlZFVwKG9DaGFydEFQSS5oYW5kbGVTZWxlY3Rpb25DaGFuZ2UuYmluZChvQ2hhcnRBUEkpKTtcblxuXHRvSW5uZXJDaGFydC5zZXRTZWxlY3Rpb25Nb2RlKG9NRENDaGFydC5nZXRQYXlsb2FkKCkuc2VsZWN0aW9uTW9kZS50b1VwcGVyQ2FzZSgpKTtcblx0QmFzZUNoYXJ0RGVsZWdhdGUuX3NldENoYXJ0KG9NRENDaGFydCwgb0lubmVyQ2hhcnQpO1xufTtcbkNoYXJ0RGVsZWdhdGUuX2dldEJpbmRpbmdJbmZvID0gZnVuY3Rpb24gKG9NRENDaGFydDogYW55KSB7XG5cdGlmICh0aGlzLl9nZXRCaW5kaW5nSW5mb0Zyb21TdGF0ZShvTURDQ2hhcnQpKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldEJpbmRpbmdJbmZvRnJvbVN0YXRlKG9NRENDaGFydCk7XG5cdH1cblxuXHRjb25zdCBvTWV0YWRhdGFJbmZvID0gb01EQ0NoYXJ0LmdldERlbGVnYXRlKCkucGF5bG9hZDtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9NRENDaGFydC5nZXRNb2RlbCgpICYmIG9NRENDaGFydC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRjb25zdCBzVGFyZ2V0Q29sbGVjdGlvblBhdGggPSBvTURDQ2hhcnQuZGF0YShcInRhcmdldENvbGxlY3Rpb25QYXRoXCIpO1xuXHRjb25zdCBzRW50aXR5U2V0UGF0aCA9XG5cdFx0KG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NUYXJnZXRDb2xsZWN0aW9uUGF0aH0vJGtpbmRgKSAhPT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiA/IFwiL1wiIDogXCJcIikgKyBvTWV0YWRhdGFJbmZvLmNvbnRleHRQYXRoO1xuXHRjb25zdCBvUGFyYW1zID0gbWVyZ2Uoe30sIG9NZXRhZGF0YUluZm8ucGFyYW1ldGVycywge1xuXHRcdGVudGl0eVNldDogb01EQ0NoYXJ0LmRhdGEoXCJlbnRpdHlTZXRcIilcblx0fSk7XG5cdHJldHVybiB7XG5cdFx0cGF0aDogc0VudGl0eVNldFBhdGgsXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHRkYXRhUmVxdWVzdGVkOiBvTURDQ2hhcnQuZ2V0UGFyZW50KCkub25JbnRlcm5hbERhdGFSZXF1ZXN0ZWQuYmluZChvTURDQ2hhcnQuZ2V0UGFyZW50KCkpXG5cdFx0fSxcblx0XHRwYXJhbWV0ZXJzOiBvUGFyYW1zXG5cdH07XG59O1xuQ2hhcnREZWxlZ2F0ZS5yZW1vdmVJdGVtRnJvbUlubmVyQ2hhcnQgPSBmdW5jdGlvbiAob01EQ0NoYXJ0OiBhbnksIG9NRENDaGFydEl0ZW06IGFueSkge1xuXHRCYXNlQ2hhcnREZWxlZ2F0ZS5yZW1vdmVJdGVtRnJvbUlubmVyQ2hhcnQuY2FsbCh0aGlzLCBvTURDQ2hhcnQsIG9NRENDaGFydEl0ZW0pO1xuXHRpZiAob01EQ0NoYXJ0SXRlbS5nZXRUeXBlKCkgPT09IFwiZ3JvdXBhYmxlXCIpIHtcblx0XHRjb25zdCBvSW5uZXJDaGFydCA9IHRoaXMuX2dldENoYXJ0KG9NRENDaGFydCk7XG5cdFx0b0lubmVyQ2hhcnQuZmlyZURlc2VsZWN0RGF0YSgpO1xuXHR9XG59O1xuQ2hhcnREZWxlZ2F0ZS5fZ2V0U29ydGFibGUgPSBmdW5jdGlvbiAoXG5cdG9NRENDaGFydDogYW55LFxuXHRzb3J0UmVzdHJpY3Rpb25zUHJvcGVydHk6IFNvcnRSZXN0cmljdGlvbnNQcm9wZXJ0eUluZm9UeXBlIHwgdW5kZWZpbmVkLFxuXHRiSXNUcmFuc0FnZ3JlZ2F0ZTogYW55XG4pIHtcblx0aWYgKGJJc1RyYW5zQWdncmVnYXRlKSB7XG5cdFx0aWYgKG9NRENDaGFydC5kYXRhKFwiZHJhZnRTdXBwb3J0ZWRcIikgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBzb3J0UmVzdHJpY3Rpb25zUHJvcGVydHkgPyBzb3J0UmVzdHJpY3Rpb25zUHJvcGVydHkuc29ydGFibGUgOiB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gc29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5ID8gc29ydFJlc3RyaWN0aW9uc1Byb3BlcnR5LnNvcnRhYmxlIDogdHJ1ZTtcbn07XG5DaGFydERlbGVnYXRlLl9jaGVja0FuZEFkZERyYWZ0RmlsdGVyID0gZnVuY3Rpb24gKG9DaGFydDogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRpZiAob0NoYXJ0LmRhdGEoXCJkcmFmdFN1cHBvcnRlZFwiKSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRpZiAoIW9CaW5kaW5nSW5mbykge1xuXHRcdFx0b0JpbmRpbmdJbmZvID0ge307XG5cdFx0fVxuXHRcdGlmICghb0JpbmRpbmdJbmZvLmZpbHRlcnMpIHtcblx0XHRcdG9CaW5kaW5nSW5mby5maWx0ZXJzID0gW107XG5cdFx0fVxuXHRcdG9CaW5kaW5nSW5mby5maWx0ZXJzLnB1c2gobmV3IEZpbHRlcihcIklzQWN0aXZlRW50aXR5XCIsIEZpbHRlck9wZXJhdG9yLkVRLCB0cnVlKSk7XG5cdH1cbn07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGFuIElEIHdoaWNoIHNob3VsZCBiZSB1c2VkIGluIHRoZSBpbnRlcm5hbCBjaGFydCBmb3IgdGhlIG1lYXN1cmUvZGltZW5zaW9uLlxuICogRm9yIHN0YW5kYXJkIGNhc2VzLCB0aGlzIGlzIGp1c3QgdGhlIGlkIG9mIHRoZSBwcm9wZXJ0eS5cbiAqIElmIGl0IGlzIG5lY2Vzc2FyeSB0byB1c2UgYW5vdGhlciBpZCBpbnRlcm5hbGx5IGluc2lkZSB0aGUgY2hhcnQgKGUuZy4gb24gZHVwbGljYXRlIHByb3BlcnR5IGlkcykgdGhpcyBtZXRob2QgY2FuIGJlIG92ZXJ3cml0dGVuLlxuICogSW4gdGhpcyBjYXNlLCA8Y29kZT5nZXRQcm9wZXJ0eUZyb21OYW1lQW5kS2luZDwvY29kZT4gbmVlZHMgdG8gYmUgb3ZlcndyaXR0ZW4gYXMgd2VsbC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBJRCBvZiB0aGUgcHJvcGVydHlcbiAqIEBwYXJhbSB7c3RyaW5nfSBraW5kIFR5cGUgb2YgdGhlIFByb3BlcnR5IChNZWFzdXJlL0RpbWVuc2lvbilcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEludGVybmFsIGlkIGZvciB0aGUgc2FwLmNoYXJ0LkNoYXJ0XG4gKi9cbkNoYXJ0RGVsZWdhdGUuZ2V0SW50ZXJuYWxDaGFydE5hbWVGcm9tUHJvcGVydHlOYW1lQW5kS2luZCA9IGZ1bmN0aW9uIChuYW1lOiBzdHJpbmcsIGtpbmQ6IHN0cmluZykge1xuXHRyZXR1cm4gbmFtZS5yZXBsYWNlKFwiX2ZlX1wiICsga2luZCArIFwiX1wiLCBcIlwiKTtcbn07XG5cbi8qKlxuICogVGhpcyBtYXBzIGFuIGlkIG9mIGFuIGludGVybmFsIGNoYXJ0IGRpbWVuc2lvbi9tZWFzdXJlICYgdHlwZSBvZiBhIHByb3BlcnR5IHRvIGl0cyBjb3JyZXNwb25kaW5nIHByb3BlcnR5IGVudHJ5LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIElEIG9mIGludGVybmFsIGNoYXJ0IG1lYXN1cmUvZGltZW5zaW9uXG4gKiBAcGFyYW0ge3N0cmluZ30ga2luZCBLaW5kIG9mIHRoZSBwcm9wZXJ0eVxuICogQHBhcmFtIHtzYXAudWkubWRjLkNoYXJ0fSBtZGNDaGFydCBSZWZlcmVuY2UgdG8gdGhlIE1EQyBjaGFydFxuICogQHJldHVybnMge29iamVjdH0gUHJvcGVydHlJbmZvIG9iamVjdFxuICovXG5DaGFydERlbGVnYXRlLmdldFByb3BlcnR5RnJvbU5hbWVBbmRLaW5kID0gZnVuY3Rpb24gKG5hbWU6IHN0cmluZywga2luZDogc3RyaW5nLCBtZGNDaGFydDogYW55KSB7XG5cdHJldHVybiBtZGNDaGFydC5nZXRQcm9wZXJ0eUhlbHBlcigpLmdldFByb3BlcnR5KFwiX2ZlX1wiICsga2luZCArIFwiX1wiICsgbmFtZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDaGFydERlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBZUEsTUFBTUEsaUJBQWlCLEdBQUlDLE1BQU0sQ0FBU0QsaUJBQWlCO0VBQzNEO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLE1BQU1FLGFB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