export type AnnotationsForCollection = {
	// and AnnotationsForEntitySet
	"@Org.OData.Capabilities.V1.SearchRestrictions"?: {
		Searchable?: boolean;
	};
	"@Org.OData.Capabilities.V1.SortRestrictions"?: {
		Sortable?: boolean;
		NonSortableProperties?: {
			$PropertyPath: string;
		}[];
		AscendingOnlyProperties?: {
			$PropertyPath: string;
		}[];
		DescendingOnlyProperties?: {
			$PropertyPath: string;
		}[];
	};
};

export type SortRestrictionsPropertyInfoType = {
	sortable: boolean;
	sortDirection?: string;
};

export type SortRestrictionsInfoType = {
	sortable: boolean;
	propertyInfo: Record<string, SortRestrictionsPropertyInfoType>;
};

/**
 * Utitlity class for metadata interpretation inside delegate classes.
 *
 * @private
 * @since 1.62
 */
const ODataMetaModelUtil = {
	fetchAllAnnotations(oMetaModel: any, sEntityPath: any) {
		const oCtx = oMetaModel.getMetaContext(sEntityPath);
		return oMetaModel.requestObject("@", oCtx).then(function (mAnnos: any) {
			return mAnnos;
		});
	},
	/**
	 * The mapping of all annotations of a given entity set.
	 *
	 * @param mAnnos A list of annotations of the entity set
	 * @returns A map to the custom aggregates keyed by their qualifiers
	 */
	getAllCustomAggregates(mAnnos: any) {
		const mCustomAggregates: any = {};
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
	getAllAggregatableProperties(mAnnos: any) {
		const mAggregatableProperties: any = {};
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
	getAllDataPoints(mAnnos: any[]) {
		const mDataPoints: any = {};
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
	createDataPointProperty(oDataPointAnno: any) {
		const oDataPoint: any = {};

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
	_buildThresholds(oThresholds: any, oCriticalityCalculation: any) {
		const aKeys = [
			"AcceptanceRangeLowValue",
			"AcceptanceRangeHighValue",
			"ToleranceRangeLowValue",
			"ToleranceRangeHighValue",
			"DeviationRangeLowValue",
			"DeviationRangeHighValue"
		];
		let bConstant = true,
			sKey,
			i,
			j;

		oThresholds.ImprovementDirection = oCriticalityCalculation.ImprovementDirection.$EnumMember.replace(
			"com.sap.vocabularies.UI.v1.ImprovementDirectionType/",
			""
		);

		const oDynamicThresholds: any = {
			oneSupplied: false,
			usedMeasures: []
			// combination to check whether at least one is supplied
		};
		const oConstantThresholds: any = {
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
			let oAggregationLevel: any;
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

					const aVisibleDimensions: any = oAggregationLevelInfo.AggregationLevel ? [] : null;

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
	getSortRestrictionsInfo(entitySetAnnotations: AnnotationsForCollection) {
		const sortRestrictionsInfo: SortRestrictionsInfoType = {
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
	getFilterRestrictionsInfo(oFilterRestrictions: any) {
		let i, sPropertyName;
		const oFilterRestrictionsInfo: any = {
			filterable: true,
			propertyInfo: {}
		};

		if (oFilterRestrictions) {
			oFilterRestrictionsInfo.filterable = oFilterRestrictions.Filterable != null ? oFilterRestrictions.Filterable : true;
			oFilterRestrictionsInfo.requiresFilter =
				oFilterRestrictions.RequiresFilter != null ? oFilterRestrictions.RequiresFilter : false;

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
	isMultiValueFilterExpression(sFilterExpression: String) {
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
	addFilterInfoForProperty(oProperty: any, oFilterRestrictionInfo: any) {
		const oPropertyInfo = oFilterRestrictionInfo[oProperty.name];
		oProperty.filterable = oFilterRestrictionInfo.filterable && oPropertyInfo ? oPropertyInfo.filterable : true;

		if (oProperty.filterable) {
			oProperty.allowedExpressions = oPropertyInfo ? oPropertyInfo.allowedExpressions : null;
		}
	},
	fetchCalendarTag(oMetaModel: any, oCtx: any) {
		const COMMON = "@com.sap.vocabularies.Common.v1.";
		return Promise.all([
			oMetaModel.requestObject(`${COMMON}IsCalendarYear`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsCalendarHalfyear`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsCalendarQuarter`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsCalendarMonth`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsCalendarWeek`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsDayOfCalendarMonth`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsDayOfCalendarYear`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsCalendarYearHalfyear`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsCalendarYearQuarter`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsCalendarYearMonth`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsCalendarYearWeek`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsCalendarDate`, oCtx)
		]).then(function (aTag: any[]) {
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
	fetchFiscalTag(oMetaModel: any, oCtx: any) {
		const COMMON = "@com.sap.vocabularies.Common.v1.";
		return Promise.all([
			oMetaModel.requestObject(`${COMMON}IsFiscalYear`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsFiscalPeriod`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsFiscalYearPeriod`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsFiscalQuarter`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsFiscalYearQuarter`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsFiscalWeek`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsFiscalYearWeek`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsDayOfFiscalYear`, oCtx),
			oMetaModel.requestObject(`${COMMON}IsFiscalYearVariant`, oCtx)
		]).then(function (aTag: [any, any, any, any, any, any, any, any, any]) {
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
	fetchCriticality(oMetaModel: any, oCtx: any) {
		const UI = "@com.sap.vocabularies.UI.v1";
		return oMetaModel.requestObject(`${UI}.ValueCriticality`, oCtx).then(function (aValueCriticality: any) {
			let oCriticality, oValueCriticality: any;

			if (aValueCriticality) {
				oCriticality = {
					VeryPositive: [],
					Positive: [],
					Critical: [],
					VeryNegative: [],
					Negative: [],
					Neutral: []
				} as any;

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

export default ODataMetaModelUtil;
