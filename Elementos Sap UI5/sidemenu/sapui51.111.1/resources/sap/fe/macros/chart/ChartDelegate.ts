import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import merge from "sap/base/util/merge";
import CommonUtils from "sap/fe/core/CommonUtils";
import ChartUtils from "sap/fe/macros/chart/ChartUtils";
import CommonHelper from "sap/fe/macros/CommonHelper";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import ODataMetaModelUtil, { type SortRestrictionsInfoType, type SortRestrictionsPropertyInfoType } from "sap/fe/macros/ODataMetaModelUtil";
import type Chart from "sap/ui/mdc/Chart";
import MDCLib from "sap/ui/mdc/library";
import DelegateUtil from "sap/ui/mdc/odata/v4/util/DelegateUtil";
import BaseChartDelegate from "sap/ui/mdc/odata/v4/vizChart/ChartDelegate";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";

const ChartItemRoleType = (MDCLib as any).ChartItemRoleType;
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

ChartDelegate._setChartNoDataText = function (oChart: any, oBindingInfo: any) {
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
		if (oChartFilterInfo.search || (oChartFilterInfo.filters && oChartFilterInfo.filters.length)) {
			sNoDataKey = _getNoDataTextWithFilters();
		} else {
			sNoDataKey = "T_TABLE_AND_CHART_NO_DATA_TEXT";
		}
	} else if (oChartFilterInfo.search || (oChartFilterInfo.filters && oChartFilterInfo.filters.length)) {
		sNoDataKey = _getNoDataTextWithFilters();
	} else {
		sNoDataKey = "M_TABLE_AND_CHART_NO_FILTERS_NO_DATA_TEXT";
	}
	return (oChart.getModel("sap.fe.i18n").getResourceBundle() as Promise<ResourceBundle>)
		.then(function (oResourceBundle) {
			oChart.setNoDataText(CommonUtils.getTranslatedText(sNoDataKey, oResourceBundle, undefined, suffixResourceKey));
		})
		.catch(function (error) {
			Log.error(error);
		});
};

ChartDelegate._handleProperty = function (
	oMDCChart: Chart,
	mEntitySetAnnotations: any,
	mKnownAggregatableProps: any,
	mCustomAggregates: any,
	aProperties: any[],
	sCriticality: string
) {
	const oApplySupported = CommonHelper.parseCustomData(oMDCChart.data("applySupported"));
	const sortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(mEntitySetAnnotations);
	const oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
	const oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);
	const oObj = this.getModel().getObject(this.getPath());
	const sKey = this.getModel().getObject(`${this.getPath()}@sapui.name`) as string;
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
		if (!aGroupableProperties || (aGroupableProperties && !aGroupableProperties.length)) {
			bGroupable = oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"];
		}
		if (!aAggregatableProperties || (aAggregatableProperties && !aAggregatableProperties.length)) {
			bAggregatable = oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"];
		}

		//Right now: skip them, since we can't create a chart from it
		if (!bGroupable && !bAggregatable) {
			return;
		}

		if (bAggregatable) {
			const aAggregateProperties = ChartDelegate._createPropertyInfosForAggregatable(
				oMDCChart,
				sKey,
				oPropertyAnnotations,
				oFilterRestrictionsInfo,
				sortRestrictionsInfo,
				mKnownAggregatableProps,
				mCustomAggregates
			);
			aAggregateProperties.forEach(function (oAggregateProperty: any) {
				aProperties.push(oAggregateProperty);
			});
		}

		if (bGroupable) {
			const sName = sKey || "",
				sTextProperty = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"]
					? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path
					: null;
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
				role: ChartItemRoleType.category, //standard, normally this should be interpreted from UI.Chart annotation
				criticality: sCriticality, //To be implemented by FE
				textProperty:
					!bIsNavigationText && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"]
						? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path
						: null, //To be implemented by FE
				textFormatter: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]
			});
		}
	}
};

ChartDelegate.formatText = function (oValue1: any, oValue2: any) {
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

ChartDelegate.updateBindingInfo = function (oChart: any, oBindingInfo: any) {
	ChartDelegate._setChartNoDataText(oChart, oBindingInfo);

	const oFilter = sap.ui.getCore().byId(oChart.getFilter()) as any;
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

ChartDelegate.fetchProperties = function (oMDCChart: Chart) {
	const oModel = this._getModel(oMDCChart);
	let pCreatePropertyInfos;

	if (!oModel) {
		pCreatePropertyInfos = new Promise((resolve: any) => {
			oMDCChart.attachModelContextChange(
				{
					resolver: resolve
				},
				onModelContextChange as any,
				this
			);
		}).then((oRetrievedModel: any) => {
			return this._createPropertyInfos(oMDCChart, oRetrievedModel);
		});
	} else {
		pCreatePropertyInfos = this._createPropertyInfos(oMDCChart, oModel);
	}

	return pCreatePropertyInfos.then(function (aProperties: any) {
		if (oMDCChart.data) {
			oMDCChart.data("$mdcChartPropertyInfo", aProperties);
		}
		return aProperties;
	});
};
function onModelContextChange(this: typeof ChartDelegate, oEvent: any, oData: any) {
	const oMDCChart = oEvent.getSource();
	const oModel = this._getModel(oMDCChart);

	if (oModel) {
		oMDCChart.detachModelContextChange(onModelContextChange);
		oData.resolver(oModel);
	}
}
ChartDelegate._createPropertyInfos = async function (oMDCChart: any, oModel: any) {
	const sEntitySetPath = `/${oMDCChart.data("entitySet")}`;
	const oMetaModel = oModel.getMetaModel();

	const aResults = await Promise.all([oMetaModel.requestObject(`${sEntitySetPath}/`), oMetaModel.requestObject(`${sEntitySetPath}@`)]);
	const aProperties: any[] = [];
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
	const aDimensions: any[] = [],
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
		if (
			aMeasures.filter(function (val: any) {
				return aDimensions.indexOf(val) != -1;
			}).length >= 1
		) {
			Log.error("Dimension and Measure has the sameProperty Configured");
		}
	}

	const mTypeAggregatableProps = CommonHelper.parseCustomData(oMDCChart.data("transAgg"));
	const mKnownAggregatableProps: any = {};
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
			aPropertyPromise.push(
				ODataMetaModelUtil.fetchCriticality(oMetaModel, oMetaModel.createBindingContext(`${sEntitySetPath}/${sKey}`)).then(
					ChartDelegate._handleProperty.bind(
						oMetaModel.getMetaContext(`${sEntitySetPath}/${sKey}`),
						oMDCChart,
						mEntitySetAnnotations,
						mKnownAggregatableProps,
						mCustomAggregates,
						aProperties
					)
				)
			);
		}
	}
	await Promise.all(aPropertyPromise);

	return aProperties;
};

ChartDelegate._createPropertyInfosForAggregatable = function (
	oMDCChart: Chart,
	sKey: string,
	oPropertyAnnotations: any,
	oFilterRestrictionsInfo: any,
	sortRestrictionsInfo: SortRestrictionsInfoType,
	mKnownAggregatableProps: any,
	mCustomAggregates: any
) {
	const aAggregateProperties = [];
	if (Object.keys(mKnownAggregatableProps).indexOf(sKey) > -1) {
		for (const sAggregatable in mKnownAggregatableProps[sKey]) {
			aAggregateProperties.push({
				name: "_fe_aggregatable_" + mKnownAggregatableProps[sKey][sAggregatable].name,
				propertyPath: sKey,
				label:
					mKnownAggregatableProps[sKey][sAggregatable].label ||
					`${oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"]} (${sAggregatable})` ||
					`${sKey} (${sAggregatable})`,
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
ChartDelegate.rebind = function (oMDCChart: any, oBindingInfo: any) {
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
		oChartBinding.setAggregation({ search: sSearch });

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
ChartDelegate._setChart = function (oMDCChart: any, oInnerChart: any) {
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
ChartDelegate._getBindingInfo = function (oMDCChart: any) {
	if (this._getBindingInfoFromState(oMDCChart)) {
		return this._getBindingInfoFromState(oMDCChart);
	}

	const oMetadataInfo = oMDCChart.getDelegate().payload;
	const oMetaModel = oMDCChart.getModel() && oMDCChart.getModel().getMetaModel();
	const sTargetCollectionPath = oMDCChart.data("targetCollectionPath");
	const sEntitySetPath =
		(oMetaModel.getObject(`${sTargetCollectionPath}/$kind`) !== "NavigationProperty" ? "/" : "") + oMetadataInfo.contextPath;
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
ChartDelegate.removeItemFromInnerChart = function (oMDCChart: any, oMDCChartItem: any) {
	BaseChartDelegate.removeItemFromInnerChart.call(this, oMDCChart, oMDCChartItem);
	if (oMDCChartItem.getType() === "groupable") {
		const oInnerChart = this._getChart(oMDCChart);
		oInnerChart.fireDeselectData();
	}
};
ChartDelegate._getSortable = function (
	oMDCChart: any,
	sortRestrictionsProperty: SortRestrictionsPropertyInfoType | undefined,
	bIsTransAggregate: any
) {
	if (bIsTransAggregate) {
		if (oMDCChart.data("draftSupported") === "true") {
			return false;
		} else {
			return sortRestrictionsProperty ? sortRestrictionsProperty.sortable : true;
		}
	}
	return sortRestrictionsProperty ? sortRestrictionsProperty.sortable : true;
};
ChartDelegate._checkAndAddDraftFilter = function (oChart: any, oBindingInfo: any) {
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
ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function (name: string, kind: string) {
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
ChartDelegate.getPropertyFromNameAndKind = function (name: string, kind: string, mdcChart: any) {
	return mdcChart.getPropertyHelper().getProperty("_fe_" + kind + "_" + name);
};

export default ChartDelegate;
