/**
 *
 * @classdesc
 * Building block for creating a FilterBar based on the metadata provided by OData V4.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:FilterBar
 *   id="SomeID"
 *   showAdaptFiltersButton="true"
 *   p13nMode=["Item","Value"]
 *   listBindingNames = "sap.fe.tableBinding"
 *   liveMode="true"
 *   search=".handlers.onSearch"
 *   filterChanged=".handlers.onFiltersChanged"
 * /&gt;
 * </pre>
 *
 * Building block for creating a FilterBar based on the metadata provided by OData V4.
 * @class sap.fe.macros.FilterBar
 * @hideconstructor
 * @public
 * @since 1.94.0
 */

import {
	blockAggregation,
	blockAttribute,
	blockEvent,
	BuildingBlockBase,
	defineBuildingBlock
} from "sap/fe/core/buildingBlocks/BuildingBlock";

import { SelectionFields } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import CommonUtils from "sap/fe/core/CommonUtils";
import { getSelectionVariant } from "sap/fe/core/converters/controls/Common/DataVisualization";
import { getSelectionFields } from "sap/fe/core/converters/controls/ListReport/FilterBar";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import TemplateModel from "sap/fe/core/TemplateModel";
import { FilterConditions, getFilterConditions } from "sap/fe/core/templating/FilterHelper";
import CommonHelper from "sap/fe/macros/CommonHelper";
import { FilterBarP13nMode } from "sap/ui/mdc/library";
import Context from "sap/ui/model/Context";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import { V4Context } from "types/extension_types";
import { PropertyInfo } from "../DelegateUtil";
import ResourceModel from "../ResourceModel";
import { FilterField } from "./FilterBarAPI";

const setCustomFilterFieldProperties = function (childFilterField: Element, aggregationObject: any): FilterField {
	aggregationObject.slotName = aggregationObject.key;
	aggregationObject.key = aggregationObject.key.replace("InlineXML_", "");
	aggregationObject.label = childFilterField.getAttribute("label");
	aggregationObject.required = childFilterField.getAttribute("required") === "true";
	return aggregationObject;
};

@defineBuildingBlock({
	name: "FilterBar",
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros"
})
export default class FilterBarBuildingBlock extends BuildingBlockBase {
	/**
	 * ID of the FilterBar
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	id!: string;

	@blockAttribute({
		type: "boolean",
		isPublic: true
	})
	visible!: string;

	/**
	 * selectionFields to be displayed
	 */
	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	selectionFields!: SelectionFields;

	@blockAttribute({ type: "string" })
	filterBarDelegate?: string;

	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true
	})
	metaPath!: V4Context;

	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true
	})
	contextPath!: Context;

	/**
	 * Displays possible errors during the search in a message box
	 */
	@blockAttribute({
		type: "boolean",
		defaultValue: false,
		isPublic: true
	})
	showMessages!: boolean;

	/**
	 * ID of the assigned variant management
	 */
	@blockAttribute({
		type: "string"
	})
	variantBackreference!: string | undefined;

	/**
	 * Don't show the basic search field
	 */
	@blockAttribute({
		type: "boolean"
	})
	hideBasicSearch!: boolean;

	/**
	 * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
	 */
	@blockAttribute({
		type: "boolean",
		defaultValue: false
	})
	enableFallback!: boolean;

	/**
	 * Handles visibility of the 'Adapt Filters' button on the FilterBar
	 */
	@blockAttribute({
		type: "boolean",
		defaultValue: true
	})
	showAdaptFiltersButton!: boolean;

	/**
	 * Specifies the personalization options for the filter bar.
	 */
	@blockAttribute({
		type: "sap.ui.mdc.FilterBarP13nMode[]",
		defaultValue: "Item,Value"
	})
	p13nMode!: FilterBarP13nMode;

	@blockAttribute({
		type: "string"
	})
	propertyInfo!: string;

	/**
	 * Specifies the Sematic Date Range option for the filter bar.
	 */
	@blockAttribute({
		type: "boolean",
		defaultValue: true
	})
	useSemanticDateRange!: boolean;

	/**
	 * If set the search will be automatically triggered, when a filter value was changed.
	 */
	@blockAttribute({
		type: "boolean",
		defaultValue: false,
		isPublic: true
	})
	liveMode!: boolean;

	/**
	 * Filter conditions to be applied to the filter bar
	 */
	@blockAttribute({
		type: "string",
		required: false
	})
	filterConditions!: Record<string, FilterConditions[]>;

	/**
	 * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
	 * a search is triggered immediately if one or more search requests have been triggered in the meantime
	 * but were ignored based on the setting.
	 */
	@blockAttribute({
		type: "boolean",
		defaultValue: false
	})
	suspendSelection!: boolean;

	@blockAttribute({
		type: "boolean",
		defaultValue: false
	})
	showDraftEditState!: boolean;

	@blockAttribute({
		type: "boolean",
		defaultValue: false
	})
	isDraftCollaborative!: boolean;

	/**
	 * Id of control that will allow for switching between normal and visual filter
	 */
	@blockAttribute({
		type: "string"
	})
	toggleControlId!: string;

	@blockAttribute({
		type: "string",
		defaultValue: "compact"
	})
	initialLayout!: string;

	/**
	 * Handles the visibility of the 'Clear' button on the FilterBar.
	 */
	@blockAttribute({
		type: "boolean",
		defaultValue: false,
		isPublic: true
	})
	showClearButton!: boolean;

	@blockAttribute({
		type: "boolean",
		defaultValue: false
	})
	_applyIdToContent!: boolean;

	/**
	 * Temporary workaround only
	 * path to contextPath to be used by child filterfields
	 */
	_internalContextPath!: V4Context;

	_parameters: string | undefined;

	/**
	 * Event handler to react to the search event of the FilterBar
	 */
	@blockEvent()
	search!: string;

	/**
	 * Event handler to react to the filterChange event of the FilterBar
	 */
	@blockEvent()
	filterChanged!: string;

	/**
	 * Event handler to react to the stateChange event of the FilterBar.
	 */
	@blockEvent()
	stateChange!: string;

	/**
	 * Event handler to react to the filterChanged event of the FilterBar. Exposes parameters from the MDC filter bar
	 */
	@blockEvent()
	internalFilterChanged!: string;

	/**
	 * Event handler to react to the search event of the FilterBar. Exposes parameteres from the MDC filter bar
	 */
	@blockEvent()
	internalSearch!: string;

	/**
	 * Event handler to react to the afterClear event of the FilterBar
	 */
	@blockEvent()
	afterClear!: string;

	@blockAggregation({
		type: "sap.fe.macros.FilterField",
		isPublic: true,
		hasVirtualNode: true,
		processAggregations: setCustomFilterFieldProperties
	})
	filterFields!: FilterField;

	_apiId: string | undefined;
	_contentId: string | undefined;
	_valueHelps: Array<string> | "" | undefined;
	_filterFields: Array<string> | "" | undefined;

	constructor(oProps: PropertiesOf<FilterBarBuildingBlock>, configuration: any, mSettings: any) {
		super(oProps, configuration, mSettings);
		const oContext = oProps.contextPath;
		const oMetaPathContext = oProps.metaPath;
		if (!oMetaPathContext) {
			Log.error("Context Path not available for FilterBar Macro.");
			return;
		}
		const sMetaPath = oMetaPathContext?.getPath();
		let entityTypePath = "";
		const metaPathParts = sMetaPath?.split("/@com.sap.vocabularies.UI.v1.SelectionFields") || []; // [0]: entityTypePath, [1]: SF Qualifier.
		if (metaPathParts.length > 0) {
			entityTypePath = this.getEntityTypePath(metaPathParts);
		}
		const sEntitySetPath = ModelHelper.getEntitySetPath(entityTypePath);
		const oMetaModel = oContext?.getModel();
		this._internalContextPath = oMetaModel?.createBindingContext(entityTypePath) as V4Context;
		const sObjectPath = "@com.sap.vocabularies.UI.v1.SelectionFields";
		const annotationPath: string = "@com.sap.vocabularies.UI.v1.SelectionFields" + ((metaPathParts.length && metaPathParts[1]) || "");
		const oExtraParams: any = {};
		oExtraParams[sObjectPath] = {
			filterFields: oProps.filterFields
		};
		const oVisualizationObjectPath = getInvolvedDataModelObjects(this._internalContextPath);
		const oConverterContext = this.getConverterContext(oVisualizationObjectPath, undefined, mSettings, oExtraParams);
		if (!oProps.propertyInfo) {
			this.propertyInfo = getSelectionFields(oConverterContext, [], annotationPath).sPropertyInfo;
		}

		//Filter Fields and values to the field are filled based on the selectionFields and this would be empty in case of macro outside the FE template
		if (!oProps.selectionFields) {
			const oSelectionFields = getSelectionFields(oConverterContext, [], annotationPath).selectionFields;
			this.selectionFields = new TemplateModel(oSelectionFields, oMetaModel as ODataMetaModel).createBindingContext("/");
			const oEntityType = oConverterContext.getEntityType(),
				oSelectionVariant = getSelectionVariant(oEntityType, oConverterContext),
				oEntitySetContext = (oMetaModel as ODataMetaModel).getContext(sEntitySetPath),
				oFilterConditions = getFilterConditions(oEntitySetContext, { selectionVariant: oSelectionVariant });
			this.filterConditions = oFilterConditions;
		}
		this._processPropertyInfos(this.propertyInfo);

		const targetDataModelObject = getInvolvedDataModelObjects(oContext as Context).targetObject;
		if (targetDataModelObject.annotations?.Common?.DraftRoot || targetDataModelObject.annotations?.Common?.DraftNode) {
			this.showDraftEditState = true;
			this.checkIfCollaborationDraftSupported(oMetaModel as ODataMetaModel);
		}

		if (oProps._applyIdToContent) {
			this._apiId = oProps.id + "::FilterBar";
			this._contentId = oProps.id;
		} else {
			this._apiId = oProps.id;
			this._contentId = this.getContentId(oProps.id + "");
		}

		if (oProps.hideBasicSearch !== true) {
			const oSearchRestrictionAnnotation = CommonUtils.getSearchRestrictions(sEntitySetPath, oMetaModel as ODataMetaModel);
			this.hideBasicSearch = Boolean(oSearchRestrictionAnnotation && !oSearchRestrictionAnnotation.Searchable);
		}
		this.processSelectionFields();
	}

	getContentId(sMacroId: string) {
		return `${sMacroId}-content`;
	}

	_processPropertyInfos(propertyInfo: string) {
		const aParameterFields: string[] = [];
		if (propertyInfo) {
			const sFetchedProperties = propertyInfo.replace(/\\{/g, "{").replace(/\\}/g, "}");
			const aFetchedProperties = JSON.parse(sFetchedProperties);
			aFetchedProperties.forEach(function (propInfo: PropertyInfo) {
				if (propInfo.isParameter) {
					aParameterFields.push(propInfo.name);
				}
				if (propInfo.path === "$editState") {
					propInfo.label = ResourceModel.getText("FILTERBAR_EDITING_STATUS");
				}
			});

			this.propertyInfo = JSON.stringify(aFetchedProperties).replace(/\{/g, "\\{").replace(/\}/g, "\\}");
		}
		this._parameters = JSON.stringify(aParameterFields);
	}

	checkIfCollaborationDraftSupported = (oMetaModel: ODataMetaModel | undefined) => {
		if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
			this.isDraftCollaborative = true;
		}
	};

	getEntityTypePath = (metaPathParts: string[]) => {
		return metaPathParts[0].endsWith("/") ? metaPathParts[0] : metaPathParts[0] + "/";
	};

	getSearch = () => {
		if (!this.hideBasicSearch) {
			return xml`<control:basicSearchField>
			<mdc:FilterField
				id="${generate([this.id, "BasicSearchField"])}"
				placeholder="{sap.fe.i18n>M_FILTERBAR_SEARCH}"
				conditions="{$filters>/conditions/$search}"
				dataType="sap.ui.model.odata.type.String"
				maxConditions="1"
			/>
		</control:basicSearchField>`;
		}
		return xml``;
	};

	processSelectionFields = () => {
		let draftEditState = xml``;
		if (this.showDraftEditState) {
			draftEditState = `<core:Fragment fragmentName="sap.fe.macros.filter.DraftEditState" type="XML" />`;
		}
		this._valueHelps = [];
		this._filterFields = [];
		this._filterFields?.push(draftEditState);
		if (!Array.isArray(this.selectionFields)) {
			this.selectionFields = (this.selectionFields as V4Context).getObject();
		}
		this.selectionFields?.forEach((selectionField: any, selectionFieldIdx) => {
			if (selectionField.availability === "Default") {
				this.setFilterFieldsAndValueHelps(selectionField, selectionFieldIdx);
			}
		});
		this._filterFields = this._filterFields?.length > 0 ? this._filterFields : "";
		this._valueHelps = this._valueHelps?.length > 0 ? this._valueHelps : "";
	};

	setFilterFieldsAndValueHelps = (selectionField: any, selectionFieldIdx: number) => {
		if (selectionField.template === undefined && selectionField.type !== "Slot") {
			this.pushFilterFieldsAndValueHelps(selectionField);
		} else if (Array.isArray(this._filterFields)) {
			this._filterFields?.push(
				xml`<template:with path="selectionFields>${selectionFieldIdx}" var="item">
					<core:Fragment fragmentName="sap.fe.macros.filter.CustomFilter" type="XML" />
				</template:with>`
			);
		}
	};

	_getContextPathForFilterField(selectionField: any, filterBarContextPath: V4Context): string | V4Context {
		let contextPath: string | V4Context = filterBarContextPath;
		if (selectionField.isParameter) {
			// Example:
			// FilterBarContextPath: /Customer/Set
			// ParameterPropertyPath: /Customer/P_CC
			// ContextPathForFilterField: /Customer
			const annoPath = selectionField.annotationPath;
			contextPath = annoPath.substring(0, annoPath.lastIndexOf("/") + 1);
		}
		return contextPath;
	}

	pushFilterFieldsAndValueHelps = (selectionField: any) => {
		if (Array.isArray(this._filterFields)) {
			this._filterFields?.push(
				xml`<internalMacro:FilterField
			idPrefix="${generate([this.id, "FilterField", CommonHelper.getNavigationPath(selectionField.annotationPath)])}"
			vhIdPrefix="${generate([this.id, "FilterFieldValueHelp"])}"
			property="${selectionField.annotationPath}"
			contextPath="${this._getContextPathForFilterField(selectionField, this._internalContextPath)}"
			useSemanticDateRange="${this.useSemanticDateRange}"
			settings="${CommonHelper.stringifyCustomData(selectionField.settings)}"
			visualFilter="${selectionField.visualFilter}"
			/>`
			);
		}
		if (Array.isArray(this._valueHelps)) {
			this._valueHelps?.push(
				xml`<macro:ValueHelp
			idPrefix="${generate([this.id, "FilterFieldValueHelp"])}"
			conditionModel="$filters"
			property="${selectionField.annotationPath}"
			contextPath="${this._getContextPathForFilterField(selectionField, this._internalContextPath)}"
			filterFieldValueHelp="true"
			useSemanticDateRange="${this.useSemanticDateRange}"
		/>`
			);
		}
	};

	getTemplate() {
		const internalContextPath = this._internalContextPath?.getPath();
		let filterDelegate = "";
		if (this.filterBarDelegate) {
			filterDelegate = this.filterBarDelegate;
		} else {
			filterDelegate = "{name:'sap/fe/macros/filterBar/FilterBarDelegate', payload: {entityTypePath: '" + internalContextPath + "'}}";
		}
		return xml`<macroFilterBar:FilterBarAPI
        xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
        xmlns:core="sap.ui.core"
        xmlns:mdc="sap.ui.mdc"
        xmlns:control="sap.fe.core.controls"
        xmlns:macroFilterBar="sap.fe.macros.filterBar"
        xmlns:macro="sap.fe.macros"
        xmlns:internalMacro="sap.fe.macros.internal"
        xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		id="${this._apiId}"
		search="${this.search}"
		filterChanged="${this.filterChanged}"
		afterClear="${this.afterClear}"
		internalSearch="${this.internalSearch}"
		internalFilterChanged="${this.internalFilterChanged}"
		stateChange="${this.stateChange}"
	>
		<control:FilterBar
			core:require="{API: 'sap/fe/macros/filterBar/FilterBarAPI'}"
			id="${this._contentId}"
			liveMode="${this.liveMode}"
			delegate="${filterDelegate}"
			variantBackreference="${this.variantBackreference}"
			showAdaptFiltersButton="${this.showAdaptFiltersButton}"
			showClearButton="${this.showClearButton}"
			p13nMode="${this.p13nMode}"
			search="API.handleSearch($event)"
			filtersChanged="API.handleFilterChanged($event)"
			filterConditions="${this.filterConditions}"
			suspendSelection="${this.suspendSelection}"
			showMessages="${this.showMessages}"
			toggleControl="${this.toggleControlId}"
			initialLayout="${this.initialLayout}"
			propertyInfo="${this.propertyInfo}"
			customData:localId="${this.id}"
			visible="${this.visible}"
			customData:hideBasicSearch="${this.hideBasicSearch}"
			customData:showDraftEditState="${this.showDraftEditState}"
			customData:useSemanticDateRange="${this.useSemanticDateRange}"
			customData:entityType="${internalContextPath}"
			customData:parameters="${this._parameters}"
		>
			<control:dependents>
				${this._valueHelps}
			</control:dependents>
			${this.getSearch()}
			<control:filterItems>
				${this._filterFields}
			</control:filterItems>
		</control:FilterBar>
	</macroFilterBar:FilterBarAPI>`;
	}
}
