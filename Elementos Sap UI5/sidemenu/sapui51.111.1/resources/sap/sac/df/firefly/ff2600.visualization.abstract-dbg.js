/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0200.io"
],
function(oFF)
{
"use strict";

oFF.SacTableConstants = {

	TD_L_ROWS:"rows",
	TD_S_ID:"id",
	TD_L_COLUMN_SETTINGS:"columnSettings",
	TD_B_PARTIAL:"partial",
	TD_B_SCROLL_TO_TOP:"scrollToTop",
	TD_B_SHOW_GRID:"showGrid",
	TD_N_TOTAL_HEIGHT:"totalHeight",
	TD_N_TOTAL_WIDTH:"totalWidth",
	TD_N_WIDGET_HEIGHT:"widgetHeight",
	TD_N_WIDGET_WIDTH:"widgetWidth",
	TD_N_LAST_ROW_INDEX:"lastRowIndex",
	TD_B_SHOW_COORDINATE_HEADER:"showCoordinateHeader",
	TD_B_HAS_FIXED_ROWS_COLS:"hasFixedRowsCols",
	TD_M_ROW_HEIGHT_SETTING:"RowHeightSetting",
	TD_N_DATA_REGION_START_COL:"dataRegionStartCol",
	TD_N_DATA_REGION_START_ROW:"dataRegionStartRow",
	TD_N_DATA_REGION_END_COL:"dataRegionEndCol",
	TD_N_DATA_REGION_END_ROW:"dataRegionEndRow",
	TD_N_DATA_REGION_CORNER_COL:"dataRegionCornerCol",
	TD_N_DATA_REGION_CORNER_ROW:"dataRegionCornerRow",
	TD_N_DATA_REGION_HEADER_END_ROW:"dataRegionHeaderEndRow",
	TD_M_DIMENSION_CELL_COORDINATES_IN_HEADER:"dimensionCellCoordinatesInHeader",
	TD_DCCIH_N_START_COL:"startCol",
	TD_DCCIH_N_START_ROW:"startRow",
	TD_DCCIH_N_END_COL:"endCol",
	TD_DCCIH_N_END_ROW:"endRow",
	TD_M_SCROLL_POSITION:"scrollPosition",
	TD_B_USE_SECTIONS:"useSections",
	TD_N_ROW_HEIGHT_CUSTOM_PIXELS:"rowHeightCustomPixels",
	TD_M_CELL_CHART_DATA:"cellChartData",
	TD_M_TITLE:"title",
	TD_M_STYLE:"style",
	TD_B_DESIGN_MODE:"designMode",
	TD_B_HAS_LA_DATAPOINT_SELECTION:"hasLADatapointSelection",
	TD_B_EDIT_MODE:"editMode",
	TD_B_MOBILE:"mobile",
	TD_B_DEVICE_PREVIEW:"devicePreview",
	TD_M_FONT_OVERRIDE:"fontOverride",
	TD_B_REVERSED_HIERARCHY:"reversedHierarchy",
	TD_B_RESPONSIVE:"responsive",
	TD_M_FORMULA_CELL_STYLE_MAP:"formulaCellStyleMap",
	TD_L_HIGHLIGHTED_CELLS:"highlightedCells",
	TD_B_SHOW_FREEZE_LINES:"showFreezeLines",
	TD_M_FOCUSED_CELL:"focusedCell",
	TD_L_CLASSES_TO_IGNORE:"classesToIgnore",
	TD_N_FREEZE_END_ROW:"freezeEndRow",
	TD_N_FREEZE_END_COL:"freezeEndCol",
	TD_N_PREFETCHED_HEIGHT_BELOW_TABLE:"prefetchedHeightBelowTable",
	TD_M_ACTIVE_NEW_LINE_MEMBER_CELL:"activeNewLineMemberCell",
	TD_M_FEATURE_TOGGLES:"featureToggles",
	TD_M_FEATURE_TOGGLES_DIM_HEADER_CELLS_WITH_ICONS:"dimHeaderCellsWithIcons",
	TD_M_FEATURE_TOGGLES_ACCESSIBILITY_KEYBOARD_SUPPORT:"accessibilityKeyboardSupport",
	TD_M_FEATURE_TOGGLES_ACCESSIBILITY_SCREEN_READER_SUPPORT:"accessibilityScreenReaderSupport",
	FS_N_SIZE:"size",
	FS_S_COLOR:"color",
	FS_S_FAMILY:"family",
	FS_B_BOLD:"bold",
	FS_B_ITALIC:"italic",
	FS_B_UNDERLINE:"underline",
	FS_B_STRIKETHROUGH:"strikethrough",
	FO_N_ALLTEXT:"alltext",
	FO_N_TITLE:"title",
	FO_N_SUBTITLE:"subtitle",
	TSI_L_ROWS:"rows",
	TSI_L_COLUMN_SETTINGS:"columnSettings",
	TSI_M_STYLE:"style",
	TSI_M_FONT_OVERRIDE:"fontOverride",
	FCSM_L_STYLE:"style",
	CS_S_ID:"id",
	CS_N_COLUMN:"column",
	CS_N_WIDTH:"width",
	CS_B_FIXED:"fixed",
	CS_N_MIN_WIDTH:"minWidth",
	CS_B_HAS_WRAP_CELL:"hasWrapCell",
	CS_B_EMPTY_COLUMN:"emptyColumn",
	CS_B_ADDED_ON_THE_FLY_UNRESPONSIVE:"addedOnTheFlyUnresponsive",
	R_S_ID:"id",
	R_N_ROW:"row",
	R_B_FIXED:"fixed",
	R_L_CELLS:"cells",
	R_N_HEIGHT:"height",
	DF_R_N_HEIGHT_REDUCED:18,
	DF_R_N_HEIGHT:27,
	DF_R_N_HEIGHT_VERTICAL_CHARTS:294,
	R_B_CHANGED_ON_THE_FLY_UNRESPONSIVE:"changedOnTheFlyUnresponsive",
	C_S_ID:"id",
	C_B_ALLOW_DRAG_DROP:"allowDragDrop",
	C_N_ROW:"row",
	C_N_COLUMN:"column",
	C_M_CONTEXT:"context",
	C_N_CELL_TYPE:"cellType",
	C_B_DRAGGABLE:"draggable",
	C_S_FORMATTED:"formatted",
	C_S_FORMAT_STRING:"formatString",
	C_SN_PLAIN:"plain",
	C_B_EDITABLE:"editable",
	C_B_IS_IN_HIERARCHY:"isInHierarchy",
	C_B_STYLE_UPDATED_BY_USER:"styleUpdatedByUser",
	C_B_VERSION_EDITED:"versionEdited",
	C_B_LOCKED:"locked",
	C_M_STYLE:"style",
	C_M_CELL_CHART:"cellChart",
	C_M_DATA_LOCKING:"dataLocking",
	C_M_VALIDATION:"validation",
	C_B_EXPANDED:"expanded",
	C_B_REVERSED_HIERARCHY:"reversedHierarchy",
	C_B_SHOW_DRILL_ICON:"showDrillIcon",
	C_S_DRILL_ICON_COLOR:"drillIconColor",
	C_N_LEVEL:"level",
	C_N_COMMENT_TYPE:"commentType",
	C_B_MODIFIED:"modified",
	C_B_MODIFIED_MDE:"modifiedMDE",
	C_B_SHOW_HYPERLINK:"showHyperlink",
	C_B_REFERENCE_TO_LOCKED_CELL:"referenceToLockedCell",
	C_M_MERGED:"merged",
	CM_N_COLUMNS:"columns",
	CM_N_ROWS:"rows",
	CM_N_ORIGINAL_COLUMN:"originalColumn",
	CM_N_ORIGINAL_ROW:"originalRow",
	C_N_HIERARCHY_PADDING_LEFT:"hierarchyPaddingLeft",
	C_N_HIERARCHY_PADDING_TOP:"hierarchyPaddingTop",
	DF_C_N_HIERARCHY_PADDING_TOP:16,
	DF_C_N_HIERARCHY_PADDING_LEFT:16,
	C_B_REPEATED_MEMBER_NAME:"repeatedMemberName",
	C_M_REFERENCE:"reference",
	C_S_CATEGORY:"category",
	C_B_IS_INA_TOTALS_CONTEXT:"isInATotalsContext",
	C_L_CELL_ICONS_RIGHT:"cellIconsRight",
	CI_S_CLASS_NAME:"className",
	CI_SV_CLASS_NAME_SAP_UI_ICON:"sapUiIcon",
	CI_M_DATA_ATTRIBUTES:"dataAttributes",
	CIA_S_DATA_SAP_UI_ICON_CONTENT:"data-sap-ui-icon-content",
	CI_M_STYLE:"style",
	CIS_S_FONT_FAMILY:"fontFamily",
	CIS_SV_SAP_ICONS:"SAP-icons",
	CIS_N_MARGIN_LEFT:"marginLeft",
	CIS_S_ROTATE:"rotate",
	CIS_SV_ROTATE:"z 270deg",
	CIS_N_MARGIN_RIGHT:"marginRight",
	CIS_NV_MARGIN_RIGHT:5,
	CI_B_ICON_AFTER:"iconAfter",
	CC_N_ROW:"row",
	CC_N_COL:"col",
	CC_S_CHART_TYPE:"chartType",
	CC_B_SHOW_VALUE:"showValue",
	CC_S_BAR_COLOR:"barColor",
	CC_SU_LINE_COLOR:"lineColor",
	CC_S_CELL_CHART_ORIENTATION:"orientation",
	CC_S_MEMBER_ID:"memberId",
	CC_M_IN_CELL_CHART_CONTEXT:"InCellChartContext",
	CC_L_DIMENSIONS:"dimensions",
	CC_S_ORIGINAL_DIMENSION:"originalDimension",
	DC_S_ID:"id",
	DC_S_HASH:"hash",
	DC_M_MEMBER:"member",
	BMC_S_ID:"id",
	BMC_S_HASH:"hash",
	MC_S_DESCRIPTION:"description",
	MC_N_LEVEL:"level",
	MC_S_PARENT:"parent",
	ST_M_FONT:"font",
	ST_M_ALIGNMENT:"alignment",
	STAL_N_VERTICAL:"vertical",
	STAL_N_HORIZONTAL:"horizontal",
	ST_S_FILL_COLOR:"fillColor",
	ST_B_WRAP:"wrap",
	ST_L_LINES:"lines",
	ST_S_THRESHOLD_ICON_TYPE:"thresholdIconType",
	ST_S_THRESHOLD_COLOR:"thresholdColor",
	ST_M_SUBTITLE_FONT:"subtitleFont",
	ST_M_TITLE_FONT:"titleFont",
	SL_N_SIZE:"size",
	SL_N_POSITION:"position",
	SL_S_COLOR:"color",
	SL_M_PATTERN:"pattern",
	SL_N_STYLE:"style",
	SL_M_PADDING:"padding",
	SLP_N_LEFT:"left",
	SLP_N_RIGHT:"right",
	SLP_N_TOP:"top",
	SLP_N_BOTTOM:"bottom",
	SLA_N_START_COL:"startCol",
	SLA_N_START_ROW:"startRow",
	SLA_N_END_COL:"endCol",
	SLA_N_END_ROW:"endRow",
	SLA_N_MERGED_START_COL:"mergedStartCol",
	SLA_N_MERGED_START_ROW:"mergedStartRow",
	SLA_N_CORNER_COL:"cornerCol",
	SLA_N_CORNER_ROW:"cornerRow",
	SLA_S_TYPE:"type",
	SLA_B_IS_CELL_CHART_SELECTION:"isCellChartSelection",
	SLA_M_IN_CELL_CHART_CONTEXT:"inCellChartContext",
	SAM_N_MERGED_START_COL:"mergedStartCol",
	SAM_N_MERGED_START_ROW:"mergedStartRow",
	TS_L_SELECTED_REGIONS:"selectedRegions",
	TS_N_SELECTION_CONTEXT_TYPE:"selectionContextType",
	TH_N_HOVER_CONTEXT_TYPE:"hoverContextType",
	TH_N_ROW:"row",
	TH_N_COLUMN:"column",
	TH_S_DIMENSION_ID:"dimensionId",
	TH_B_DOUBLE_OVERLAY:"doubleOverlay",
	RCS_N_INDEX:"index",
	RCS_N_SIZE:"size",
	LP_S_BACKGROUND:"background",
	LP_N_STYLE:"style",
	LP_N_WIDTH:"width",
	LP_S_COLOR:"color",
	LP_S_BORDER_COLOR:"borderColor",
	DL_N_TYPE:"type",
	DL_S_TOOLTIP:"tooltip",
	V_S_TYPE:"type",
	V_S_TOOLTIP:"tooltip",
	CCD_N_MIN:"min",
	CCD_N_MAX:"max",
	CCD_N_MAX_TEXT_WIDTH:"maxTextWidth",
	CCD_N_MAX_TEXT_HEIGHT:"maxTextHeight",
	CCD_L_COLUMNS:"columns",
	CCD_N_START_COL:"startCol",
	CCD_N_START_ROW:"startRow",
	CCD_N_END_COL:"endCol",
	CCD_N_END_ROW:"endRow",
	CCV_S_VALUE:"value",
	CCV_SN_WIDTH_BAR_FILLED:"widthBarFilled",
	CCV_SN_HEIGHT_BAR_FILLED:"heightBarFilled",
	CCV_SN_WIDTH_LINE:"widthLine",
	CCV_SN_HEIGHT_LINE:"heightLine",
	CCV_SN_X_BAR:"xBar",
	CCV_SN_Y_BAR:"yBar",
	CCV_SN_X_TEXT:"xText",
	CCV_SN_Y_TEXT:"yText",
	CCV_SN_X_LINE:"xLine",
	CCV_SN_Y_LINE:"yLine",
	CCV_N_PLAIN:"plain",
	CCV_SN_X_PIN:"xPin",
	CCV_SN_Y_PIN:"yPin",
	CCV_S_DOMINANT_BASE_LINE:"dominantBaseLine",
	CCV_S_TEXT_ANCHOR:"textAnchor",
	CCV_B_HIDE_VALUE:"hideValue",
	TD_S_TABLE_ID:"tableId",
	TD_L_TITLE_CHUNKS:"titleChunks",
	TD_S_TITLE_TEXT:"titleText",
	TD_B_TITLE_VISIBLE:"titleVisible",
	TD_B_SUBTITLE_VISIBLE:"subtitleVisible",
	TD_B_DETAILS_VISIBLE:"detailsVisible",
	TD_B_EDITABLE:"editable",
	TD_M_TITLE_STYLE:"titleStyle",
	TD_M_SUBTITLE_STYLE:"subtitleStyle",
	TD_M_TOKEN_DATA:"tokenData",
	TD_N_ROW:"row",
	TD_N_COLUMN:"column",
	TE_S_TAG:"tag",
	TE_O_STYLES:"styles",
	TE_O_ATTRIBUTES:"attributes",
	TE_L_CLASSES:"classes",
	TE_L_CHILDREN:"children",
	TE_S_TEXT:"text",
	TS_N_HEIGHT:"height",
	ICCC_S_ID:"id",
	C_N_X:"x",
	C_N_Y:"y",
	HC_S_BACKGROUND_COLOR:"backgroundColor",
	CCO_HORIZONTAL:"horizontal",
	CCO_VERTICAL:"vertical",
	CT_NONE:0,
	CT_SELF:1,
	CT_CHILD:2,
	CS_COMMENT_DOCUMENT_ID:"commentDocumentId",
	SRT_BOX:"box",
	SRT_ROWS:"rows",
	SRT_COLUMNS:"columns",
	SRT_REGION:"region",
	SRT_ALL:"all",
	SRT_MIXED:"mixed",
	SCT_WIDGET:0,
	SCT_TITLE_REGION:2,
	SCT_HEADER_REGION:3,
	SCT_DATACELL_REGION:4,
	SCT_DIMENSION:5,
	SCT_DIMENSION_MEMBER:6,
	SCT_DATA_CELL:7,
	SCT_CUSTOM_CELL:8,
	SCT_CELL_CHART:9,
	SCT_HEADER_CELL:10,
	SCT_TITLE:11,
	SCT_SUBTITLE:12,
	SCT_ROW:13,
	SCT_COLUMN:14,
	SCT_ATTRIBUTE:15,
	SCT_MULTI_CELL:17,
	SCT_MULTI_REGION:18,
	CT_VALUE:0,
	CT_HEADER:1,
	CT_INPUT:2,
	CT_CHART:3,
	CT_MEMBER_SELECTOR:4,
	CT_UNBOOKED:5,
	CT_THRESHOLD:6,
	CT_DATA_LOCKING:7,
	CT_VALIDATION:8,
	CT_MARQUEE:9,
	CT_COLUMN_COORDINATE:10,
	CT_ROW_COORDINATE:11,
	CT_ATTRIBUTE:12,
	CT_EMPTY:13,
	CT_ROW_DIM_HEADER:14,
	CT_COL_DIM_HEADER:15,
	CT_COL_DIM_MEMBER:16,
	CT_ROW_DIM_MEMBER:17,
	CT_ATTRIBUTE_ROW_DIM_HEADER:18,
	CT_ATTRIBUTE_COL_DIM_HEADER:19,
	CT_ATTRIBUTE_ROW_DIM_MEMBER:20,
	CT_ATTRIBUTE_COL_DIM_MEMBER:21,
	CT_TITLE:22,
	CT_CUSTOM:23,
	CT_COORDINATE_CORNER:24,
	CT_COMMENT:25,
	CT_COLUMN_COORDINATE_SELECTED_DESIGN_MODE:26,
	CT_ROW_COORDINATE_SELECTED_DESIGN_MODE:27,
	CT_COLUMN_COORDINATE_SELECTED_VIEW_MODE:28,
	CT_ROW_COORDINATE_SELECTED_VIEW_MODE:29,
	CT_MERGED_DUMMY_CELL:30,
	CT_IMAGE:31,
	CT_NEW_LINE_ON_ROW:32,
	CT_NEW_LINE_ON_COLUMN:33,
	CT_EMPTY_AXIS_ROW_HEADER:34,
	CT_EMPTY_AXIS_COLUMN_HEADER:35,
	VA_TOP:0,
	VA_MIDDLE:1,
	VA_BOTTOM:2,
	HA_LEFT:-1,
	HA_CENTER:0,
	HA_RIGHT:1,
	LP_TOP:0,
	LP_BOTTOM:1,
	LP_TOP_BOTTOM:2,
	LP_LEFT:3,
	LP_RIGHT:4,
	LP_LEFT_RIGHT:5,
	LP_ALL:6,
	LP_NONE:7,
	LS_NONE:0,
	LS_SOLID:1,
	LS_DASHED:2,
	LS_DOTTED:3,
	B_TOP:"Top",
	B_BOTTOM:"Bottom",
	B_LEFT:"Left",
	B_RIGHT:"Right",
	LPT_NON_FILL:9,
	LPT_SOLID:10,
	LPT_BACKGROUND_IMAGE:11,
	LPT_WHITE_FILL:12,
	TIT_GOOD:"good",
	TIT_WARNING:"warning",
	TIT_ALERT:"alert",
	TIT_DIAMOND:"diamond",
	DLT_LOCKED:"locked",
	DLT_LOADING:"loading",
	DLT_MIXED:"mixed",
	DLT_UNKNOWN:"unknown",
	VT_INVALID:"INVALID",
	VT_VALID:"VALID",
	VT_UNDEFINED:"UNDEFINED",
	CCT_BAR:"bar",
	CCT_VARIANCE_BAR:"varianceBar",
	CCT_VARIANCE_PIN:"pin",
	RHS_COMPACT:0,
	RHS_CONDENSED:1,
	RHS_COZY:2,
	RHS_CUSTOM:3,
	RHS_SUPER_CONDENSED:4,
	C_ACTUAL:"AC",
	C_BUDGET:"BU",
	C_PLANNING:"PL",
	C_FORECAST:"FC",
	C_ROLLING_FORECAST:"RF",
	C_NONE:"none",
	S_DIMENSION_INDEX:"DIMENSION_INDEX",
	L_ROW_DIMENSION_PATHS:"ROW_DIMENSION_PATHS",
	L_COLUMN_DIMENSION_PATHS:"COLUMN_DIMENSION_PATHS",
	S_DIMENSION_TO_COLORATE:"DIMENSION_TO_COLORATE",
	L_DIMENSION_COLOR_PALETTE:"DIMENSION_COLOR_PALETTE",
	N_ROW_INDEX:"ROW_INDEX",
	N_COLUMN_INDEX:"COLUMN_INDEX",
	L_REFERENCE_PATH:"REFERENCE_PATH",
	S_DIMENSION_NAME:"DIMENSION_NAME",
	S_MEMBER_NAME:"MEMBER_NAME",
	N_CELL_VALUE_HIGH:"CELL_VALUE_HIGH",
	N_CELL_VALUE_LOW:"CELL_VALUE_LOW",
	S_CELL_VALUE_COMPARATOR:"CELL_VALUE_COMPARATOR",
	S_CELL_VALUE_SET_SIGN:"CELL_VALUE_SET_SIGN",
	S_AXIS_TYPE:"AXIS_TYPE",
	S_CELL_VALUE_COMPARATOR_BETWEEN:"CELL_VALUE_BETWEEN",
	S_CELL_VALUE_COMPARATOR_NOT_BETWEEN:"CELL_VALUE_NOT_BETWEEN",
	S_CELL_VALUE_COMPARATOR_NOT_BETWEEN_EXCLUDING:"CELL_VALUE_NOT_BETWEEN_EXCLUDING",
	S_CELL_VALUE_COMPARATOR_BETWEEN_EXCLUDING:"CELL_VALUE_BETWEEN_EXCLUDING",
	S_CELL_VALUE_COMPARATOR_EQUAL:"CELL_VALUE_EQUAL",
	S_CELL_VALUE_COMPARATOR_LESS_THAN:"CELL_VALUE_LESS_THAN",
	S_CELL_VALUE_COMPARATOR_LESS_EQUAL:"CELL_VALUE_LESS_EQUAL",
	S_CELL_VALUE_COMPARATOR_GREATER_THAN:"CELL_VALUE_GREATER_THAN",
	S_CELL_VALUE_COMPARATOR_GREATER_EQUAL:"CELL_VALUE_GREATER_EQUAL",
	S_CELL_COLOR:"CELL_COLOR",
	S_CELL_FONT_COLOR:"CELL_FONT_COLOR",
	S_CELL_CHART_BAR_COLOR:"CELL_CHART_BAR_COLOR",
	S_CELL_CHART_LINE_COLOR:"CELL_CHART_LINE_COLOR",
	SV_ROW_STRIPE_COLOR:"rgba(220, 220, 220, 1)",
	SV_COLUMN_STRIPE_COLOR:"rgba(220, 220, 220, 0.5)",
	N_INSERT_POSITION_OFFSET:"INSERT_POSITION_OFFSET",
	S_INSERT_TYPE:"INSERT_TYPE",
	B_STRIPE_DATA_ROWS:"STRIPE_DATA_ROWS",
	B_STRIPE_DATA_COLUMNS:"STRIPE_DATA_COLUMNS",
	B_FREEZE_ROWS:"FREEZE_ROWS",
	B_FREEZE_COLUMNS:"FREEZE_COLUMNS",
	B_SHOW_FREEZE_LINES:"SHOW_FREEZE_LINES",
	B_SHOW_GRID:"SHOW_GRID",
	B_SHOW_TABLE_TITLE:"SHOW_TABLE_TITLE",
	B_SHOW_SUBTITLE:"SHOW_SUBTITLE",
	B_SHOW_TABLE_DETAILS:"SHOW_TABLE_DETAILS",
	B_SHOW_FORMULAS:"SHOW_FORMULAS",
	B_DIMENSION_TITLES:"SHOW_DIMENSION_TITLES",
	B_REPETITIVE_MEMBER_NAMES:"SHOW_REPETITIVE_MEMBER_NAMES",
	B_MERGE_REPETITIVE_HEADERS:"MERGE_REPETITIVE_HEADERS",
	B_COORDINATE_HEADER:"SHOW_COORDINATE_HEADER",
	B_SHOW_REFERENCES:"SHOW_REFERENCES",
	S_TOTAL_LEVEL_0_COLOR:"TOTAL_LEVEL_0_COLOR",
	S_TOTAL_LEVEL_1_COLOR:"TOTAL_LEVEL_1_COLOR",
	S_TOTAL_LEVEL_2_COLOR:"TOTAL_LEVEL_2_COLOR",
	S_TOTAL_LEVEL_3_COLOR:"TOTAL_LEVEL_3_COLOR",
	S_TOTAL_LEVEL_4_COLOR:"TOTAL_LEVEL_4_COLOR",
	S_TOTAL_LEVEL_5_COLOR:"TOTAL_LEVEL_5_COLOR",
	S_TOTAL_LEVEL_6_COLOR:"TOTAL_LEVEL_6_COLOR",
	S_TITLE:"TITLE",
	S_HEADER_COLOR:"HEADER_COLOR",
	I_WIDTH:"WIDTH",
	I_HEIGHT:"HEIGHT",
	I_MIN_CELL_WIDTH:"MIN_CELL_WIDTH",
	I_MAX_CELL_WIDTH:"MAX_CELL_WIDTH",
	S_MEASURE_DIMENSION_OVERWRITE_TEXT:"MEASURE_DIMENSION_OVERWRITE_TEXT",
	S_STRUCTURE_DIMENSION_OVERWRITE_TEXT:"STRUCTURE_DIMENSION_OVERWRITE_TEXT",
	S_TOTAL_MEMBER_OVERWRITE_TEXT:"TOTAL_MEMBER_OVERWRITE_TEXT",
	S_TOTAL_INCLUDING_MEMBER_OVERWRITE_TEXT:"TOTAL_INCLUDING_MEMBER_OVERWRITE_TEXT",
	S_TOTAL_REMAINING_MEMBER_OVERWRITE_TEXT:"TOTAL_REMAINING_MEMBER_OVERWRITE_TEXT",
	S_VALUE_EXCEPTION_NULL:"S_VALUE_EXCEPTION_NULL",
	S_VALUE_EXCEPTION_UNDEFINED:"S_VALUE_EXCEPTION_UNDEFINED",
	S_VALUE_EXCEPTION_ERROR:"S_VALUE_EXCEPTION_ERROR",
	S_VALUE_EXCEPTION_OTHER:"S_VALUE_EXCEPTION_OTHER",
	S_VALUE_EXCEPTION_NO_VALUE:"S_VALUE_EXCEPTION_NO_VALUE",
	S_PRETTY_PRINTED_TITLE:"PrettyPrintedTitle",
	S_QUERY_NAME:"QueryName",
	S_QUERY_TEXT:"QueryText",
	M_FILTER_INFO:"FilterInfo",
	M_FILTER_INFO_QM:"QueryModelFilter",
	M_FILTER_INFO_LINKED:"LinkedFilter",
	M_CONDITIONS_INFO:"ConditionsInfo",
	M_RANKING_INFO:"RankingInfo",
	M_VARIABLE_INFO:"VariableInfo",
	S_INFO_PROVIDER_NAME:"InfoProviderName",
	S_SCALE_SHORT_THOUSAND:"ScaleShortThousand",
	S_SCALE_SHORT_MILLION:"ScaleShortMillion",
	S_SCALE_SHORT_BILLION:"ScaleShortBillion",
	S_SCALE_LONG_THOUSAND:"ScaleLongThousand",
	S_SCALE_LONG_MILLION:"ScaleLongMillion",
	S_SCALE_LONG_BILLION:"ScaleLongBillion",
	N_MEMBER_SORT_ICONS_NONE:-1,
	N_MEMBER_SORT_ICONS_MINIMAL:0,
	N_MEMBER_SORT_ICONS_EXTENSIVE:1,
	N_MEMBER_SORT_ICONS_MAXIMAL:2,
	I_SIZE:"size",
	I_INDEX:"index",
	C_SN_FIELD:"FIELD",
	TDP_N_ROW_HEIGHT:"rowHeight",
	TDP_N_TOTAL_ROWS:"totalRows",
	TD_N_TOTAL_ROWS_DIFF:"totalRowsDiff",
	CCD_B_MEASURE_ON_COLUMN:"measureOnColumn",
	CCD_L_ROWS:"rows",
	N_TUPLE_INDEX:"tupleIndex",
	S_DATA_SECTION_BOTTOM_LINE_COLOR:"dataSectionBottomLineColor",
	S_HEADER_END_ROW_LINE_COLOR:"headerEndRowLineColor",
	V_S_THRESHOLD_TYPE_BAD:"warning",
	V_S_THRESHOLD_TYPE_GOOD:"good",
	V_S_THRESHOLD_TYPE_NORMAL:"good",
	V_S_THRESHOLD_TYPE_CRITICAL:"alert",
	V_S_THRESHOLD_COLOR_BAD:"#E78C07",
	V_S_THRESHOLD_COLOR_GOOD:"#77D36F",
	V_S_THRESHOLD_COLOR_NORMAL:"#4242FF",
	V_S_THRESHOLD_COLOR_CRITICAL:"#f24269",
	BASE64_SVG_HATCHING_1:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJoYXRjaGluZzEtc3ZnLXBhdHRlcm4tX19wYXR0ZXJuNSIgaGVpZ2h0PSI2IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNiI+PHJlY3Qgd2lkdGg9IjYiIGhlaWdodD0iNiIgZmlsbD0iI0ZGRkZGRiI+PC9yZWN0PjxwYXRoIGQ9Ik0tMSwxIGwyLC0yIE0wLDYgbDYsLTYgTTUsNyBsMiwtMiIgc3Ryb2tlPSJyZ2IoNjYsIDY2LCA2NikiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hhdGNoaW5nMS1zdmctcGF0dGVybi1fX3BhdHRlcm41KSI+PC9yZWN0Pjwvc3ZnPg==",
	BASE64_SVG_HATCHING_2:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJoYXRjaGluZzItc3ZnLXBhdHRlcm4tX19wYXR0ZXJuNiIgaGVpZ2h0PSI4IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iOCI+PHJlY3Qgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI0ZGRkZGRiI+PC9yZWN0PjxwYXRoIGQ9Ik0tMSwxIGwyLC0yIE0wLDggbDgsLTggTTcsOSBsMiwtMiIgc3Ryb2tlPSJyZ2IoNjYsIDY2LCA2NikiIHN0cm9rZS13aWR0aD0iMiI+PC9wYXRoPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hhdGNoaW5nMi1zdmctcGF0dGVybi1fX3BhdHRlcm42KSI+PC9yZWN0Pjwvc3ZnPg==",
	BASE64_SVG_HATCHING_3:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJoYXRjaGluZzMtc3ZnLXBhdHRlcm4tX19wYXR0ZXJuNyIgaGVpZ2h0PSIxMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9InJnYig2NiwgNjYsIDY2KSI+PC9yZWN0PjxwYXRoIGQ9Ik0tMSwxIGwyLC0yIE0wLDEwIGwxMCwtMTAgTTksMTEgbDIsLTIiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjaGF0Y2hpbmczLXN2Zy1wYXR0ZXJuLV9fcGF0dGVybjcpIj48L3JlY3Q+PC9zdmc+",
	BASE64_SVG_HATCHING_4:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJoYXRjaGluZzQtc3ZnLXBhdHRlcm4tX19wYXR0ZXJuOCIgaGVpZ2h0PSIyNSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjguMzMzMzMzMzMzMzMzMzM0Ij48cmVjdCB3aWR0aD0iOC4zMzMzMzMzMzMzMzMzMzQiIGhlaWdodD0iMjUiIGZpbGw9IiNGRkZGRkYiPjwvcmVjdD48Y2lyY2xlIGN4PSI2LjI1IiBjeT0iMi4wODMzMzMzMzMzMzMzMzM1IiByPSIxIiBmaWxsPSJyZ2IoNjYsIDY2LCA2NikiPjwvY2lyY2xlPjxjaXJjbGUgY3g9IjIuMDgzMzMzMzMzMzMzMzMzNSIgY3k9IjYuMjUiIHI9IjEiIGZpbGw9InJnYig2NiwgNjYsIDY2KSI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iNi4yNSIgY3k9IjEwLjQxNjY2NjY2NjY2NjY2OCIgcj0iMSIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48Y2lyY2xlIGN4PSIyLjA4MzMzMzMzMzMzMzMzMzUiIGN5PSIxNC41ODMzMzMzMzMzMzMzMzQiIHI9IjEiIGZpbGw9InJnYig2NiwgNjYsIDY2KSI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iNi4yNSIgY3k9IjE4Ljc1IiByPSIxIiBmaWxsPSJyZ2IoNjYsIDY2LCA2NikiPjwvY2lyY2xlPjxjaXJjbGUgY3g9IjIuMDgzMzMzMzMzMzMzMzMzNSIgY3k9IjIyLjkxNjY2NjY2NjY2NjY2OCIgcj0iMSIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48L3BhdHRlcm4+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNoYXRjaGluZzQtc3ZnLXBhdHRlcm4tX19wYXR0ZXJuOCkiPjwvcmVjdD48L3N2Zz4=",
	BASE64_SVG_HATCHING_5:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJoYXRjaGluZzUtc3ZnLXBhdHRlcm4tX19wYXR0ZXJuOSIgaGVpZ2h0PSIzNSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjExLjY2NjY2NjY2NjY2NjY2NiI+PHJlY3Qgd2lkdGg9IjExLjY2NjY2NjY2NjY2NjY2NiIgaGVpZ2h0PSIzNSIgZmlsbD0iI0ZGRkZGRiI+PC9yZWN0PjxjaXJjbGUgY3g9IjguNzUiIGN5PSIyLjkxNjY2NjY2NjY2NjY2NjUiIHI9IjEiIGZpbGw9InJnYig2NiwgNjYsIDY2KSI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMi45MTY2NjY2NjY2NjY2NjY1IiBjeT0iOC43NSIgcj0iMSIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48Y2lyY2xlIGN4PSI4Ljc1IiBjeT0iMTQuNTgzMzMzMzMzMzMzMzMyIiByPSIxIiBmaWxsPSJyZ2IoNjYsIDY2LCA2NikiPjwvY2lyY2xlPjxjaXJjbGUgY3g9IjIuOTE2NjY2NjY2NjY2NjY2NSIgY3k9IjIwLjQxNjY2NjY2NjY2NjY2NCIgcj0iMSIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48Y2lyY2xlIGN4PSI4Ljc1IiBjeT0iMjYuMjUiIHI9IjEiIGZpbGw9InJnYig2NiwgNjYsIDY2KSI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMi45MTY2NjY2NjY2NjY2NjY1IiBjeT0iMzIuMDgzMzMzMzMzMzMzMzMiIHI9IjEiIGZpbGw9InJnYig2NiwgNjYsIDY2KSI+PC9jaXJjbGU+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjaGF0Y2hpbmc1LXN2Zy1wYXR0ZXJuLV9fcGF0dGVybjkpIj48L3JlY3Q+PC9zdmc+",
	BASE64_SVG_HATCHING_6:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJoYXRjaGluZzYtc3ZnLXBhdHRlcm4tX19wYXR0ZXJuMTAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMy4zMzMzMzMzMzMzMzMzMzQiPjxyZWN0IHdpZHRoPSIxMy4zMzMzMzMzMzMzMzMzMzQiIGhlaWdodD0iNDAiIGZpbGw9IiNGRkZGRkYiPjwvcmVjdD48Y2lyY2xlIGN4PSIxMCIgY3k9IjMuMzMzMzMzMzMzMzMzMzMzNSIgcj0iMSIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48Y2lyY2xlIGN4PSIzLjMzMzMzMzMzMzMzMzMzMzUiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48Y2lyY2xlIGN4PSIxMCIgY3k9IjE2LjY2NjY2NjY2NjY2NjY2OCIgcj0iMSIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48Y2lyY2xlIGN4PSIzLjMzMzMzMzMzMzMzMzMzMzUiIGN5PSIyMy4zMzMzMzMzMzMzMzMzMzYiIHI9IjEiIGZpbGw9InJnYig2NiwgNjYsIDY2KSI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48Y2lyY2xlIGN4PSIzLjMzMzMzMzMzMzMzMzMzMzUiIGN5PSIzNi42NjY2NjY2NjY2NjY2NyIgcj0iMSIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48L3BhdHRlcm4+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNoYXRjaGluZzYtc3ZnLXBhdHRlcm4tX19wYXR0ZXJuMTApIj48L3JlY3Q+PC9zdmc+",
	BASE64_SVG_HATCHING_7:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJoYXRjaGluZzctc3ZnLXBhdHRlcm4tX19wYXR0ZXJuMTEiIGhlaWdodD0iMTUiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxNSI+PHJlY3Qgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjRkZGRkZGIj48L3JlY3Q+PGNpcmNsZSBjeD0iMy43NSIgY3k9IjMuNzUiIHI9IjEiIGZpbGw9InJnYig2NiwgNjYsIDY2KSI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMy43NSIgY3k9IjExLjI1IiByPSIyIiBmaWxsPSJyZ2IoNjYsIDY2LCA2NikiPjwvY2lyY2xlPjxjaXJjbGUgY3g9IjExLjI1IiBjeT0iMy43NSIgcj0iMiIgZmlsbD0icmdiKDY2LCA2NiwgNjYpIj48L2NpcmNsZT48Y2lyY2xlIGN4PSIxMS4yNSIgY3k9IjExLjI1IiByPSIxIiBmaWxsPSJyZ2IoNjYsIDY2LCA2NikiPjwvY2lyY2xlPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2hhdGNoaW5nNy1zdmctcGF0dGVybi1fX3BhdHRlcm4xMSkiPjwvcmVjdD48L3N2Zz4=",
	BASE64_SVG_HATCHING_8:"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJoYXRjaGluZzgtc3ZnLXBhdHRlcm4tX19wYXR0ZXJuMTIiIGhlaWdodD0iOCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNGRkZGRkYiPjwvcmVjdD48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJyZ2IoNjYsIDY2LCA2NikiIHg9IjAiIHk9IjAiPjwvcmVjdD48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJyZ2IoNjYsIDY2LCA2NikiIHg9IjQiIHk9IjQiPjwvcmVjdD48L3BhdHRlcm4+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNoYXRjaGluZzgtc3ZnLXBhdHRlcm4tX19wYXR0ZXJuMTIpIj48L3JlY3Q+PC9zdmc+",
	IMG_B64_PREFIX_SHORT:"data:image/svg+xml;base64,",
	IMG_B64_PREFIX:"url(data:image/svg+xml;base64,",
	IMG_B64_SUFFIX:")"
};

oFF.SacTableFactory = {

	s_instance:null,
	setInstance:function(theFactory)
	{
			oFF.SacTableFactory.s_instance = theFactory;
	},
	createTableObject:function()
	{
			return oFF.SacTableFactory.s_instance.newTableObject();
	},
	createGridRenderer:function(table)
	{
			return oFF.SacTableFactory.s_instance.newGridRenderer(table);
	}
};

oFF.SacAlertCategory = function() {};
oFF.SacAlertCategory.prototype = new oFF.XConstant();
oFF.SacAlertCategory.prototype._ff_c = "SacAlertCategory";

oFF.SacAlertCategory.NORMAL = null;
oFF.SacAlertCategory.GOOD = null;
oFF.SacAlertCategory.CRITICAL = null;
oFF.SacAlertCategory.BAD = null;
oFF.SacAlertCategory.staticSetup = function()
{
	oFF.SacAlertCategory.NORMAL = oFF.SacAlertCategory.create("NORMAL", 0);
	oFF.SacAlertCategory.GOOD = oFF.SacAlertCategory.create("GOOD", 1);
	oFF.SacAlertCategory.CRITICAL = oFF.SacAlertCategory.create("CRITICAL", 2);
	oFF.SacAlertCategory.BAD = oFF.SacAlertCategory.create("BAD", 3);
};
oFF.SacAlertCategory.create = function(name, priority)
{
	var object = oFF.XConstant.setupName(new oFF.SacAlertCategory(), name);
	object.m_priority = priority;
	return object;
};
oFF.SacAlertCategory.prototype.m_priority = 0;
oFF.SacAlertCategory.prototype.getPriority = function()
{
	return this.m_priority;
};

oFF.SacAlertLevel = function() {};
oFF.SacAlertLevel.prototype = new oFF.XConstant();
oFF.SacAlertLevel.prototype._ff_c = "SacAlertLevel";

oFF.SacAlertLevel.NORMAL = null;
oFF.SacAlertLevel.GOOD_1 = null;
oFF.SacAlertLevel.GOOD_2 = null;
oFF.SacAlertLevel.GOOD_3 = null;
oFF.SacAlertLevel.CRITICAL_1 = null;
oFF.SacAlertLevel.CRITICAL_2 = null;
oFF.SacAlertLevel.CRITICAL_3 = null;
oFF.SacAlertLevel.BAD_1 = null;
oFF.SacAlertLevel.BAD_2 = null;
oFF.SacAlertLevel.BAD_3 = null;
oFF.SacAlertLevel.staticSetup = function()
{
	oFF.SacAlertLevel.NORMAL = oFF.SacAlertLevel.create(0, oFF.SacAlertCategory.NORMAL, 1);
	oFF.SacAlertLevel.GOOD_1 = oFF.SacAlertLevel.create(1, oFF.SacAlertCategory.GOOD, 1);
	oFF.SacAlertLevel.GOOD_2 = oFF.SacAlertLevel.create(2, oFF.SacAlertCategory.GOOD, 2);
	oFF.SacAlertLevel.GOOD_3 = oFF.SacAlertLevel.create(3, oFF.SacAlertCategory.GOOD, 3);
	oFF.SacAlertLevel.CRITICAL_1 = oFF.SacAlertLevel.create(4, oFF.SacAlertCategory.CRITICAL, 1);
	oFF.SacAlertLevel.CRITICAL_2 = oFF.SacAlertLevel.create(5, oFF.SacAlertCategory.CRITICAL, 2);
	oFF.SacAlertLevel.CRITICAL_3 = oFF.SacAlertLevel.create(6, oFF.SacAlertCategory.CRITICAL, 3);
	oFF.SacAlertLevel.BAD_1 = oFF.SacAlertLevel.create(7, oFF.SacAlertCategory.BAD, 1);
	oFF.SacAlertLevel.BAD_2 = oFF.SacAlertLevel.create(8, oFF.SacAlertCategory.BAD, 2);
	oFF.SacAlertLevel.BAD_3 = oFF.SacAlertLevel.create(9, oFF.SacAlertCategory.BAD, 3);
};
oFF.SacAlertLevel.create = function(value, category, priority)
{
	var object = new oFF.SacAlertLevel();
	object.setupExt(value, priority, category);
	return object;
};
oFF.SacAlertLevel.getByLevelValue = function(level)
{
	switch (level)
	{
		case 0:
			return oFF.SacAlertLevel.NORMAL;

		case 1:
			return oFF.SacAlertLevel.GOOD_1;

		case 2:
			return oFF.SacAlertLevel.GOOD_2;

		case 3:
			return oFF.SacAlertLevel.GOOD_3;

		case 4:
			return oFF.SacAlertLevel.CRITICAL_1;

		case 5:
			return oFF.SacAlertLevel.CRITICAL_2;

		case 6:
			return oFF.SacAlertLevel.CRITICAL_3;

		case 7:
			return oFF.SacAlertLevel.BAD_1;

		case 8:
			return oFF.SacAlertLevel.BAD_2;

		case 9:
			return oFF.SacAlertLevel.BAD_3;

		default:
			return null;
	}
};
oFF.SacAlertLevel.prototype.m_priority = 0;
oFF.SacAlertLevel.prototype.m_category = null;
oFF.SacAlertLevel.prototype.m_level = 0;
oFF.SacAlertLevel.prototype.setupExt = function(value, priority, category)
{
	this._setupInternal(oFF.XInteger.convertToString(value));
	this.m_priority = priority;
	this.m_level = value;
	this.m_category = category;
};
oFF.SacAlertLevel.prototype.getPriority = function()
{
	return this.m_priority;
};
oFF.SacAlertLevel.prototype.getLevel = function()
{
	return this.m_level;
};
oFF.SacAlertLevel.prototype.getCategory = function()
{
	return this.m_category;
};

oFF.SacAlertSymbol = function() {};
oFF.SacAlertSymbol.prototype = new oFF.XConstant();
oFF.SacAlertSymbol.prototype._ff_c = "SacAlertSymbol";

oFF.SacAlertSymbol.s_instances = null;
oFF.SacAlertSymbol.GOOD = null;
oFF.SacAlertSymbol.WARNING = null;
oFF.SacAlertSymbol.ALERT = null;
oFF.SacAlertSymbol.DIAMOND = null;
oFF.SacAlertSymbol.staticSetup = function()
{
	oFF.SacAlertSymbol.s_instances = oFF.XHashMapByString.create();
	oFF.SacAlertSymbol.GOOD = oFF.SacAlertSymbol.create("Good");
	oFF.SacAlertSymbol.WARNING = oFF.SacAlertSymbol.create("Warning");
	oFF.SacAlertSymbol.ALERT = oFF.SacAlertSymbol.create("Alert");
	oFF.SacAlertSymbol.DIAMOND = oFF.SacAlertSymbol.create("Diamond");
};
oFF.SacAlertSymbol.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacAlertSymbol(), name);
	oFF.SacAlertSymbol.s_instances.put(name, object);
	return object;
};
oFF.SacAlertSymbol.lookup = function(name)
{
	return oFF.SacAlertSymbol.s_instances.getByKey(name);
};

oFF.SacCellChartOrientation = function() {};
oFF.SacCellChartOrientation.prototype = new oFF.XConstant();
oFF.SacCellChartOrientation.prototype._ff_c = "SacCellChartOrientation";

oFF.SacCellChartOrientation.s_instances = null;
oFF.SacCellChartOrientation.HORIZONTAL = null;
oFF.SacCellChartOrientation.VERTICAL = null;
oFF.SacCellChartOrientation.staticSetup = function()
{
	oFF.SacCellChartOrientation.s_instances = oFF.XHashMapByString.create();
	oFF.SacCellChartOrientation.HORIZONTAL = oFF.SacCellChartOrientation.create("Horizontal");
	oFF.SacCellChartOrientation.VERTICAL = oFF.SacCellChartOrientation.create("Vertical");
};
oFF.SacCellChartOrientation.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacCellChartOrientation(), name);
	oFF.SacCellChartOrientation.s_instances.put(name, object);
	return object;
};
oFF.SacCellChartOrientation.lookup = function(name)
{
	return oFF.SacCellChartOrientation.s_instances.getByKey(name);
};

oFF.SacCellChartType = function() {};
oFF.SacCellChartType.prototype = new oFF.XConstant();
oFF.SacCellChartType.prototype._ff_c = "SacCellChartType";

oFF.SacCellChartType.s_instances = null;
oFF.SacCellChartType.BAR = null;
oFF.SacCellChartType.VARIANCE_BAR = null;
oFF.SacCellChartType.PIN = null;
oFF.SacCellChartType.staticSetup = function()
{
	oFF.SacCellChartType.s_instances = oFF.XHashMapByString.create();
	oFF.SacCellChartType.BAR = oFF.SacCellChartType.create("Bar");
	oFF.SacCellChartType.VARIANCE_BAR = oFF.SacCellChartType.create("VarianceBar");
	oFF.SacCellChartType.PIN = oFF.SacCellChartType.create("Pin");
};
oFF.SacCellChartType.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacCellChartType(), name);
	oFF.SacCellChartType.s_instances.put(name, object);
	return object;
};
oFF.SacCellChartType.lookup = function(name)
{
	return oFF.SacCellChartType.s_instances.getByKey(name);
};

oFF.SacLinePatternType = function() {};
oFF.SacLinePatternType.prototype = new oFF.XConstant();
oFF.SacLinePatternType.prototype._ff_c = "SacLinePatternType";

oFF.SacLinePatternType.s_instances = null;
oFF.SacLinePatternType.HATCHIING_1 = null;
oFF.SacLinePatternType.HATCHIING_2 = null;
oFF.SacLinePatternType.HATCHIING_3 = null;
oFF.SacLinePatternType.HATCHIING_4 = null;
oFF.SacLinePatternType.HATCHIING_5 = null;
oFF.SacLinePatternType.HATCHIING_6 = null;
oFF.SacLinePatternType.HATCHIING_7 = null;
oFF.SacLinePatternType.HATCHIING_8 = null;
oFF.SacLinePatternType.NOFILL = null;
oFF.SacLinePatternType.SOLID = null;
oFF.SacLinePatternType.BACKGROUND_IMAGE = null;
oFF.SacLinePatternType.WHITE_FILL = null;
oFF.SacLinePatternType.INHERIT = null;
oFF.SacLinePatternType.staticSetup = function()
{
	oFF.SacLinePatternType.s_instances = oFF.XHashMapByString.create();
	oFF.SacLinePatternType.HATCHIING_1 = oFF.SacLinePatternType.create("Hatching1");
	oFF.SacLinePatternType.HATCHIING_2 = oFF.SacLinePatternType.create("Hatching2");
	oFF.SacLinePatternType.HATCHIING_3 = oFF.SacLinePatternType.create("Hatching3");
	oFF.SacLinePatternType.HATCHIING_4 = oFF.SacLinePatternType.create("Hatching4");
	oFF.SacLinePatternType.HATCHIING_5 = oFF.SacLinePatternType.create("Hatching5");
	oFF.SacLinePatternType.HATCHIING_6 = oFF.SacLinePatternType.create("Hatching6");
	oFF.SacLinePatternType.HATCHIING_7 = oFF.SacLinePatternType.create("Hatching7");
	oFF.SacLinePatternType.HATCHIING_8 = oFF.SacLinePatternType.create("Hatching8");
	oFF.SacLinePatternType.NOFILL = oFF.SacLinePatternType.create("Nofill");
	oFF.SacLinePatternType.SOLID = oFF.SacLinePatternType.create("Solid");
	oFF.SacLinePatternType.BACKGROUND_IMAGE = oFF.SacLinePatternType.create("BackgroundImage");
	oFF.SacLinePatternType.WHITE_FILL = oFF.SacLinePatternType.create("WhiteFill");
	oFF.SacLinePatternType.INHERIT = oFF.SacLinePatternType.create("Inherit");
};
oFF.SacLinePatternType.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacLinePatternType(), name);
	oFF.SacLinePatternType.s_instances.put(name, object);
	return object;
};
oFF.SacLinePatternType.lookup = function(name)
{
	return oFF.SacLinePatternType.s_instances.getByKey(name);
};

oFF.SacTableAxisType = function() {};
oFF.SacTableAxisType.prototype = new oFF.XConstant();
oFF.SacTableAxisType.prototype._ff_c = "SacTableAxisType";

oFF.SacTableAxisType.s_instances = null;
oFF.SacTableAxisType.ROWS = null;
oFF.SacTableAxisType.COLUMNS = null;
oFF.SacTableAxisType.staticSetup = function()
{
	oFF.SacTableAxisType.s_instances = oFF.XHashMapByString.create();
	oFF.SacTableAxisType.ROWS = oFF.SacTableAxisType.create("Rows");
	oFF.SacTableAxisType.COLUMNS = oFF.SacTableAxisType.create("Columns");
};
oFF.SacTableAxisType.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacTableAxisType(), name);
	oFF.SacTableAxisType.s_instances.put(name, object);
	return object;
};
oFF.SacTableAxisType.lookup = function(name)
{
	return oFF.SacTableAxisType.s_instances.getByKey(name);
};

oFF.SacTableCellHorizontalAlignment = function() {};
oFF.SacTableCellHorizontalAlignment.prototype = new oFF.XConstant();
oFF.SacTableCellHorizontalAlignment.prototype._ff_c = "SacTableCellHorizontalAlignment";

oFF.SacTableCellHorizontalAlignment.s_instances = null;
oFF.SacTableCellHorizontalAlignment.LEFT = null;
oFF.SacTableCellHorizontalAlignment.CENTER = null;
oFF.SacTableCellHorizontalAlignment.RIGHT = null;
oFF.SacTableCellHorizontalAlignment.INHERIT = null;
oFF.SacTableCellHorizontalAlignment.staticSetup = function()
{
	oFF.SacTableCellHorizontalAlignment.s_instances = oFF.XHashMapByString.create();
	oFF.SacTableCellHorizontalAlignment.LEFT = oFF.SacTableCellHorizontalAlignment.create("Left");
	oFF.SacTableCellHorizontalAlignment.CENTER = oFF.SacTableCellHorizontalAlignment.create("Center");
	oFF.SacTableCellHorizontalAlignment.RIGHT = oFF.SacTableCellHorizontalAlignment.create("Right");
	oFF.SacTableCellHorizontalAlignment.INHERIT = oFF.SacTableCellHorizontalAlignment.create("Inherit");
};
oFF.SacTableCellHorizontalAlignment.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacTableCellHorizontalAlignment(), name);
	oFF.SacTableCellHorizontalAlignment.s_instances.put(name, object);
	return object;
};
oFF.SacTableCellHorizontalAlignment.lookup = function(name)
{
	return oFF.SacTableCellHorizontalAlignment.s_instances.getByKey(name);
};

oFF.SacTableCellVerticalAlignment = function() {};
oFF.SacTableCellVerticalAlignment.prototype = new oFF.XConstant();
oFF.SacTableCellVerticalAlignment.prototype._ff_c = "SacTableCellVerticalAlignment";

oFF.SacTableCellVerticalAlignment.s_instances = null;
oFF.SacTableCellVerticalAlignment.TOP = null;
oFF.SacTableCellVerticalAlignment.MIDDLE = null;
oFF.SacTableCellVerticalAlignment.BOTTOM = null;
oFF.SacTableCellVerticalAlignment.INHERIT = null;
oFF.SacTableCellVerticalAlignment.staticSetup = function()
{
	oFF.SacTableCellVerticalAlignment.s_instances = oFF.XHashMapByString.create();
	oFF.SacTableCellVerticalAlignment.TOP = oFF.SacTableCellVerticalAlignment.create("Top");
	oFF.SacTableCellVerticalAlignment.MIDDLE = oFF.SacTableCellVerticalAlignment.create("Middle");
	oFF.SacTableCellVerticalAlignment.BOTTOM = oFF.SacTableCellVerticalAlignment.create("Bottom");
	oFF.SacTableCellVerticalAlignment.INHERIT = oFF.SacTableCellVerticalAlignment.create("Inherit");
};
oFF.SacTableCellVerticalAlignment.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacTableCellVerticalAlignment(), name);
	oFF.SacTableCellVerticalAlignment.s_instances.put(name, object);
	return object;
};
oFF.SacTableCellVerticalAlignment.lookup = function(name)
{
	return oFF.SacTableCellVerticalAlignment.s_instances.getByKey(name);
};

oFF.SacTableLineStyle = function() {};
oFF.SacTableLineStyle.prototype = new oFF.XConstant();
oFF.SacTableLineStyle.prototype._ff_c = "SacTableLineStyle";

oFF.SacTableLineStyle.s_instances = null;
oFF.SacTableLineStyle.NONE = null;
oFF.SacTableLineStyle.SOLID = null;
oFF.SacTableLineStyle.DASHED = null;
oFF.SacTableLineStyle.DOTTED = null;
oFF.SacTableLineStyle.INHERIT = null;
oFF.SacTableLineStyle.staticSetup = function()
{
	oFF.SacTableLineStyle.s_instances = oFF.XHashMapByString.create();
	oFF.SacTableLineStyle.NONE = oFF.SacTableLineStyle.create("None");
	oFF.SacTableLineStyle.SOLID = oFF.SacTableLineStyle.create("Solid");
	oFF.SacTableLineStyle.DASHED = oFF.SacTableLineStyle.create("Dashed");
	oFF.SacTableLineStyle.DOTTED = oFF.SacTableLineStyle.create("Dotted");
	oFF.SacTableLineStyle.INHERIT = oFF.SacTableLineStyle.create("Inherit");
};
oFF.SacTableLineStyle.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacTableLineStyle(), name);
	oFF.SacTableLineStyle.s_instances.put(name, object);
	return object;
};
oFF.SacTableLineStyle.lookup = function(name)
{
	return oFF.SacTableLineStyle.s_instances.getByKey(name);
};

oFF.SacTableMemberHeaderHandling = function() {};
oFF.SacTableMemberHeaderHandling.prototype = new oFF.XConstant();
oFF.SacTableMemberHeaderHandling.prototype._ff_c = "SacTableMemberHeaderHandling";

oFF.SacTableMemberHeaderHandling.s_instances = null;
oFF.SacTableMemberHeaderHandling.BAND = null;
oFF.SacTableMemberHeaderHandling.FIRST_MEMBER = null;
oFF.SacTableMemberHeaderHandling.REPETITIVE = null;
oFF.SacTableMemberHeaderHandling.MERGE = null;
oFF.SacTableMemberHeaderHandling.INHERIT = null;
oFF.SacTableMemberHeaderHandling.staticSetup = function()
{
	oFF.SacTableMemberHeaderHandling.s_instances = oFF.XHashMapByString.create();
	oFF.SacTableMemberHeaderHandling.BAND = oFF.SacTableMemberHeaderHandling.create("Band");
	oFF.SacTableMemberHeaderHandling.FIRST_MEMBER = oFF.SacTableMemberHeaderHandling.create("FirstMember");
	oFF.SacTableMemberHeaderHandling.REPETITIVE = oFF.SacTableMemberHeaderHandling.create("Repetitive");
	oFF.SacTableMemberHeaderHandling.MERGE = oFF.SacTableMemberHeaderHandling.create("Merge");
	oFF.SacTableMemberHeaderHandling.INHERIT = oFF.SacTableMemberHeaderHandling.create("Inherit");
};
oFF.SacTableMemberHeaderHandling.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacTableMemberHeaderHandling(), name);
	oFF.SacTableMemberHeaderHandling.s_instances.put(name, object);
	return object;
};
oFF.SacTableMemberHeaderHandling.lookup = function(name)
{
	return oFF.SacTableMemberHeaderHandling.s_instances.getByKey(name);
};

oFF.SacTablePageBreakHandling = function() {};
oFF.SacTablePageBreakHandling.prototype = new oFF.XConstant();
oFF.SacTablePageBreakHandling.prototype._ff_c = "SacTablePageBreakHandling";

oFF.SacTablePageBreakHandling.s_instances = null;
oFF.SacTablePageBreakHandling.AUTOMATIC = null;
oFF.SacTablePageBreakHandling.ALWAYS = null;
oFF.SacTablePageBreakHandling.AVOID = null;
oFF.SacTablePageBreakHandling.staticSetup = function()
{
	oFF.SacTablePageBreakHandling.s_instances = oFF.XHashMapByString.create();
	oFF.SacTablePageBreakHandling.AUTOMATIC = oFF.SacTablePageBreakHandling.create("Automatic");
	oFF.SacTablePageBreakHandling.ALWAYS = oFF.SacTablePageBreakHandling.create("Always");
	oFF.SacTablePageBreakHandling.AVOID = oFF.SacTablePageBreakHandling.create("Avoid");
};
oFF.SacTablePageBreakHandling.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.SacTablePageBreakHandling(), name);
	oFF.SacTablePageBreakHandling.s_instances.put(name, object);
	return object;
};
oFF.SacTablePageBreakHandling.lookup = function(name)
{
	return oFF.SacTablePageBreakHandling.s_instances.getByKey(name);
};

oFF.SacValueSign = function() {};
oFF.SacValueSign.prototype = new oFF.XConstant();
oFF.SacValueSign.prototype._ff_c = "SacValueSign";

oFF.SacValueSign.NORMAL = null;
oFF.SacValueSign.POSITIVE = null;
oFF.SacValueSign.ZERO = null;
oFF.SacValueSign.NEGATIVE = null;
oFF.SacValueSign.NULL_VALUE = null;
oFF.SacValueSign.UNDEFINED = null;
oFF.SacValueSign.UNBOOKED = null;
oFF.SacValueSign.staticSetup = function()
{
	oFF.SacValueSign.NORMAL = oFF.SacValueSign.create("Normal");
	oFF.SacValueSign.POSITIVE = oFF.SacValueSign.create("Positive");
	oFF.SacValueSign.ZERO = oFF.SacValueSign.create("Zero");
	oFF.SacValueSign.NEGATIVE = oFF.SacValueSign.create("Negative");
	oFF.SacValueSign.NULL_VALUE = oFF.SacValueSign.create("Null");
	oFF.SacValueSign.UNDEFINED = oFF.SacValueSign.create("Undefined");
	oFF.SacValueSign.UNBOOKED = oFF.SacValueSign.create("Unbooked");
};
oFF.SacValueSign.create = function(name)
{
	var object = new oFF.SacValueSign();
	object._setupInternal(name);
	return object;
};

oFF.ChartAxisDomainType = function() {};
oFF.ChartAxisDomainType.prototype = new oFF.XConstantWithParent();
oFF.ChartAxisDomainType.prototype._ff_c = "ChartAxisDomainType";

oFF.ChartAxisDomainType.CATEGORIAL = null;
oFF.ChartAxisDomainType.NOMINAL = null;
oFF.ChartAxisDomainType.ORDINAL = null;
oFF.ChartAxisDomainType.SCALAR = null;
oFF.ChartAxisDomainType.DIFFERENTIAL = null;
oFF.ChartAxisDomainType.RELATIONAL = null;
oFF.ChartAxisDomainType.s_all = null;
oFF.ChartAxisDomainType.staticSetup = function()
{
	oFF.ChartAxisDomainType.s_all = oFF.XListOfNameObject.create();
	oFF.ChartAxisDomainType.CATEGORIAL = oFF.ChartAxisDomainType.create("Categorial", null);
	oFF.ChartAxisDomainType.NOMINAL = oFF.ChartAxisDomainType.create("Nominal", oFF.ChartAxisDomainType.CATEGORIAL);
	oFF.ChartAxisDomainType.ORDINAL = oFF.ChartAxisDomainType.create("Nominal", oFF.ChartAxisDomainType.CATEGORIAL);
	oFF.ChartAxisDomainType.SCALAR = oFF.ChartAxisDomainType.create("Scalar", null);
	oFF.ChartAxisDomainType.DIFFERENTIAL = oFF.ChartAxisDomainType.create("Differential", oFF.ChartAxisDomainType.SCALAR);
	oFF.ChartAxisDomainType.RELATIONAL = oFF.ChartAxisDomainType.create("Relational", oFF.ChartAxisDomainType.SCALAR);
};
oFF.ChartAxisDomainType.create = function(name, parent)
{
	var newConstant = new oFF.ChartAxisDomainType();
	newConstant.setupExt(name, parent);
	oFF.ChartAxisDomainType.s_all.add(newConstant);
	return newConstant;
};
oFF.ChartAxisDomainType.getAll = function()
{
	return oFF.ChartAxisDomainType.s_all.getValuesAsReadOnlyList();
};
oFF.ChartAxisDomainType.lookup = function(name)
{
	return oFF.ChartAxisDomainType.s_all.getByKey(name);
};

oFF.ChartAxisPosition = function() {};
oFF.ChartAxisPosition.prototype = new oFF.XConstantWithParent();
oFF.ChartAxisPosition.prototype._ff_c = "ChartAxisPosition";

oFF.ChartAxisPosition.X = null;
oFF.ChartAxisPosition.X_BOTTOM = null;
oFF.ChartAxisPosition.X_TOP = null;
oFF.ChartAxisPosition.Y = null;
oFF.ChartAxisPosition.Y_LEFT = null;
oFF.ChartAxisPosition.Y_RIGHT = null;
oFF.ChartAxisPosition.Z = null;
oFF.ChartAxisPosition.s_all = null;
oFF.ChartAxisPosition.staticSetup = function()
{
	oFF.ChartAxisPosition.s_all = oFF.XListOfNameObject.create();
	oFF.ChartAxisPosition.X = oFF.ChartAxisPosition.create("X", false, null);
	oFF.ChartAxisPosition.X_BOTTOM = oFF.ChartAxisPosition.create("XBottom", false, oFF.ChartAxisPosition.X);
	oFF.ChartAxisPosition.X_TOP = oFF.ChartAxisPosition.create("XTop", true, oFF.ChartAxisPosition.X);
	oFF.ChartAxisPosition.Y = oFF.ChartAxisPosition.create("Y", false, null);
	oFF.ChartAxisPosition.Y_LEFT = oFF.ChartAxisPosition.create("YLeft", false, oFF.ChartAxisPosition.Y);
	oFF.ChartAxisPosition.Y_RIGHT = oFF.ChartAxisPosition.create("YRight", true, oFF.ChartAxisPosition.Y);
	oFF.ChartAxisPosition.Z = oFF.ChartAxisPosition.create("Z", false, null);
};
oFF.ChartAxisPosition.create = function(name, opposite, parent)
{
	var newConstant = new oFF.ChartAxisPosition();
	newConstant.setupExt(name, parent);
	newConstant.m_opposite = opposite;
	oFF.ChartAxisPosition.s_all.add(newConstant);
	return newConstant;
};
oFF.ChartAxisPosition.getAll = function()
{
	return oFF.ChartAxisPosition.s_all.getValuesAsReadOnlyList();
};
oFF.ChartAxisPosition.lookup = function(name)
{
	return oFF.ChartAxisPosition.s_all.getByKey(name);
};
oFF.ChartAxisPosition.getOpposite = function(orig)
{
	if (orig === oFF.ChartAxisPosition.Y_RIGHT)
	{
		return oFF.ChartAxisPosition.Y_LEFT;
	}
	if (orig === oFF.ChartAxisPosition.Y_LEFT)
	{
		return oFF.ChartAxisPosition.Y_RIGHT;
	}
	if (orig === oFF.ChartAxisPosition.X_BOTTOM)
	{
		return oFF.ChartAxisPosition.X_TOP;
	}
	if (orig === oFF.ChartAxisPosition.X_TOP)
	{
		return oFF.ChartAxisPosition.X_BOTTOM;
	}
	return orig;
};
oFF.ChartAxisPosition.getSwapped = function(orig)
{
	if (orig === oFF.ChartAxisPosition.Y_RIGHT)
	{
		return oFF.ChartAxisPosition.X_TOP;
	}
	if (orig === oFF.ChartAxisPosition.Y_LEFT)
	{
		return oFF.ChartAxisPosition.X_BOTTOM;
	}
	if (orig === oFF.ChartAxisPosition.X_BOTTOM)
	{
		return oFF.ChartAxisPosition.Y_LEFT;
	}
	if (orig === oFF.ChartAxisPosition.X_TOP)
	{
		return oFF.ChartAxisPosition.Y_RIGHT;
	}
	return orig;
};
oFF.ChartAxisPosition.prototype.m_opposite = false;
oFF.ChartAxisPosition.prototype.isOpposite = function()
{
	return this.m_opposite;
};

oFF.VisualizationAbstractModule = function() {};
oFF.VisualizationAbstractModule.prototype = new oFF.DfModule();
oFF.VisualizationAbstractModule.prototype._ff_c = "VisualizationAbstractModule";

oFF.VisualizationAbstractModule.s_module = null;
oFF.VisualizationAbstractModule.getInstance = function()
{
	if (oFF.isNull(oFF.VisualizationAbstractModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.IoModule.getInstance());
		oFF.VisualizationAbstractModule.s_module = oFF.DfModule.startExt(new oFF.VisualizationAbstractModule());
		oFF.SacTableCellVerticalAlignment.staticSetup();
		oFF.SacTableCellHorizontalAlignment.staticSetup();
		oFF.SacAlertSymbol.staticSetup();
		oFF.SacAlertCategory.staticSetup();
		oFF.SacAlertLevel.staticSetup();
		oFF.SacCellChartOrientation.staticSetup();
		oFF.SacCellChartType.staticSetup();
		oFF.SacTableLineStyle.staticSetup();
		oFF.SacTableMemberHeaderHandling.staticSetup();
		oFF.SacLinePatternType.staticSetup();
		oFF.SacTablePageBreakHandling.staticSetup();
		oFF.SacTableAxisType.staticSetup();
		oFF.SacValueSign.staticSetup();
		oFF.ChartAxisPosition.staticSetup();
		oFF.ChartAxisDomainType.staticSetup();
		oFF.DfModule.stopExt(oFF.VisualizationAbstractModule.s_module);
	}
	return oFF.VisualizationAbstractModule.s_module;
};
oFF.VisualizationAbstractModule.prototype.getName = function()
{
	return "ff2600.visualization.abstract";
};

oFF.VisualizationAbstractModule.getInstance();

return sap.firefly;
	} );