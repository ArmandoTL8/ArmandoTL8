import Log from "sap/base/Log";
import { getUiControl } from "sap/fe/core/converters/controls/Common/DataVisualization";
import CommonHelper from "sap/fe/macros/CommonHelper";
import ActionHelper from "sap/fe/macros/internal/helpers/ActionHelper";
import ODataMetaModelUtil from "sap/fe/macros/ODataMetaModelUtil";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModelAnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
function formatJSONToString(oCrit: any) {
	if (!oCrit) {
		return undefined;
	}

	let sCriticality = JSON.stringify(oCrit);
	sCriticality = sCriticality.replace(new RegExp("{", "g"), "\\{");
	sCriticality = sCriticality.replace(new RegExp("}", "g"), "\\}");
	return sCriticality;
}
function getEntitySetPath(oAnnotationContext: any) {
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
	getP13nMode(oViewData: any) {
		const aPersonalization = [],
			bVariantManagement =
				oViewData.variantManagement && (oViewData.variantManagement === "Page" || oViewData.variantManagement === "Control"),
			personalization = true; // by default enabled
		if (bVariantManagement && personalization) {
			if (personalization) {
				// full personalization scope
				return "Sort,Type,Item";
			} else if (typeof personalization === "object") {
				if ((personalization as any).type) {
					aPersonalization.push("Type");
				}
				if ((personalization as any).sort) {
					aPersonalization.push("Sort");
				}
				return aPersonalization.join(",");
			}
		}
	},
	formatChartType(oChartType: any) {
		return (mChartType as any)[oChartType.$EnumMember];
	},
	formatDimensions(oAnnotationContext: any) {
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
				Log.error(
					`$expand is not yet supported. Text Property: ${oText.$Path} from an association cannot be used for the dimension ${sKey}`
				);
				bIsNavigationText = true;
			}
			const oDimension: any = {
				key: sKey,
				textPath: !bIsNavigationText ? oText.$Path : undefined,
				label: oMetaModel.getObject(`${sEntitySetPath + sKey}@com.sap.vocabularies.Common.v1.Label`),
				role: "category"
			};

			for (j = 0; j < oAnnotation.DimensionAttributes.length; j++) {
				const oAttribute = oAnnotation.DimensionAttributes[j];

				if (oDimension.key === oAttribute.Dimension.$PropertyPath) {
					oDimension.role = mDimensionRole[oAttribute.Role.$EnumMember as keyof typeof mDimensionRole] || oDimension.role;
					break;
				}
			}

			oDimension.criticality = ODataMetaModelUtil.fetchCriticality(
				oMetaModel,
				oMetaModel.createBindingContext(sEntitySetPath + sKey)
			).then(formatJSONToString);

			aDimensions.push(oDimension);
		}

		const oDimensionModel = new JSONModel(aDimensions);
		(oDimensionModel as any).$$valueAsPromise = true;
		return oDimensionModel.createBindingContext("/");
	},

	formatMeasures(oAnnotationContext: any) {
		return oAnnotationContext.getModel().getData();
	},

	getUiChart(oPresentationContext: any) {
		return getUiControl(oPresentationContext, "@com.sap.vocabularies.UI.v1.Chart");
	},
	getOperationAvailableMap(oChartContext: any, oContext: any) {
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
	getSortConditions: function (oContext: any, oPresentationVariant: any, sPresentationVariantPath: string, oApplySupported: any) {
		if (
			oPresentationVariant &&
			CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath) &&
			oPresentationVariant.SortOrder
		) {
			const aSortConditions: any = {
				sorters: []
			};
			const sEntityPath = oContext.getPath(0).split("@")[0];
			oPresentationVariant.SortOrder.forEach(function (oCondition: any = {}) {
				let oSortProperty: any = "";
				const oSorter: any = {};
				if (oCondition.DynamicProperty) {
					oSortProperty =
						"_fe_aggregatable_" +
						oContext.getModel(0).getObject(sEntityPath + oCondition.DynamicProperty.$AnnotationPath)?.Name;
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
					} else if (
						oContext
							.getModel(0)
							.getObject(sEntityPath + oCondition.Property.$PropertyPath + "@Org.OData.Aggregation.V1.Groupable")
					) {
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
	getBindingData(sTargetCollection: any, oContext: any, aActions: any) {
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
		return (
			"'{path: '" +
			(oContext.getObject("$kind") === "EntitySet" ? "/" : "") +
			oContext.getObject("@sapui.name") +
			"'" +
			(sSelect ? ",parameters:{" + sSelect + "}" : "") +
			"}'"
		);
	},
	_getModel(oCollection: any, oInterface: any) {
		return oInterface.context;
	},
	// TODO: combine this one with the one from the table
	isDataFieldForActionButtonEnabled(
		bIsBound: boolean,
		sAction: string,
		oCollection: Context,
		sOperationAvailableMap: string,
		sEnableSelectOn: string
	) {
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
	getHiddenPathExpressionForTableActionsAndIBN(sHiddenPath: any, oDetails: any) {
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
	getPressEventForDataFieldForActionButton(sId: string, oAction: any, sOperationAvailableMap: string) {
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
	getActionType(oAction: any) {
		return (
			(oAction["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") > -1 ||
				oAction["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForAction") > -1) &&
			oAction["Inline"]
		);
	},
	getCollectionName(sCollection: any) {
		return sCollection.split("/")[sCollection.split("/").length - 1];
	}
};
(ChartHelper.getSortConditions as any).requiresIContext = true;

export default ChartHelper;
