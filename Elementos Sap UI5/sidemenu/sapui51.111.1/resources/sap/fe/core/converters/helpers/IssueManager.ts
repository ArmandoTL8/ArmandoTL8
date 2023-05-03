export enum IssueSeverity {
	High,
	Low,
	Medium
}

export const IssueCategoryType = {
	Facets: {
		MissingID: "MissingID",
		UnSupportedLevel: "UnsupportedLevel"
	},
	AnnotationColumns: {
		InvalidKey: "InvalidKey"
	},
	Annotations: {
		IgnoredAnnotation: "IgnoredAnnotation"
	}
};

export enum IssueCategory {
	Annotation = "Annotation",
	Template = "Template",
	Manifest = "Manifest",
	Facets = "Facets"
}
export const IssueType = {
	MISSING_LINEITEM: "We couldn't find a line item annotation for the current entitySet, you should consider adding one.",
	MISSING_SELECTIONFIELD: "Defined Selection Field is not found",
	MALFORMED_DATAFIELD_FOR_IBN: {
		REQUIRESCONTEXT: "DataFieldForIntentBasedNavigation cannot use requires context in form/header.",
		INLINE: "DataFieldForIntentBasedNavigation cannot use Inline in form/header.",
		DETERMINING: "DataFieldForIntentBasedNavigation cannot use Determining in form/header."
	},
	MALFORMED_VISUALFILTERS: {
		VALUELIST: "ValueList Path mentioned in the manifest is not found",
		PRESENTATIONVARIANT: "Presentation Variant Annotation is missing for the VisualFilters",
		CHART: "Chart Annotation is missing from the PV configured for the VisualFilters",
		VALUELISTCONFIG: "ValueList is not been configured inside the Visual Filter Settings"
	},
	FULLSCREENMODE_NOT_ON_LISTREPORT: "enableFullScreenMode is not supported on list report pages.",
	KPI_ISSUES: {
		KPI_NOT_FOUND: "Couldn't find KPI or SPV with qualifier ",
		KPI_DETAIL_NOT_FOUND: "Can't find proper datapoint or chart definition for KPI ",
		NO_ANALYTICS: "The following entitySet used in a KPI definition doesn't support $apply queries:",
		MAIN_PROPERTY_NOT_AGGREGATABLE: "Main property used in KPI cannot be aggregated "
	}
};
