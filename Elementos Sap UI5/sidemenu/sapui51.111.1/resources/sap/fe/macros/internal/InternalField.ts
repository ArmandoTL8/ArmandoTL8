import type { EntitySet, Property } from "@sap-ux/vocabularies-types";
import type { SemanticObject } from "@sap-ux/vocabularies-types/vocabularies/Common";
import type { DataPointType } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { blockAttribute, blockEvent, BuildingBlockBase, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlock";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import CommonUtils from "sap/fe/core/CommonUtils";
import { Entity } from "sap/fe/core/converters/helpers/BindingHelper";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import * as CollaborationFormatters from "sap/fe/core/formatters/CollaborationFormatter";
import valueFormatters from "sap/fe/core/formatters/ValueFormatter";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	and,
	compileExpression,
	constant,
	formatResult,
	formatWithTypeInformation,
	getExpressionFromAnnotation,
	ifElse,
	not,
	pathInModel
} from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf, StrictPropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import TemplateModel from "sap/fe/core/TemplateModel";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getContextRelativeTargetObjectPath, getRelativePaths, getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { isSemanticKey } from "sap/fe/core/templating/PropertyHelper";
import type { DisplayMode } from "sap/fe/core/templating/UIFormatters";
import * as UIFormatters from "sap/fe/core/templating/UIFormatters";
import type { SemanticObjectCustomData } from "sap/fe/macros/field/FieldTemplating";
import * as FieldTemplating from "sap/fe/macros/field/FieldTemplating";
import SituationsIndicator from "sap/fe/macros/situations/SituationsIndicator.fragment";
import EditMode from "sap/ui/mdc/enum/EditMode";
import type Context from "sap/ui/model/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

type DisplayStyle =
	| "Text"
	| "Avatar"
	| "File"
	| "DataPoint"
	| "Contact"
	| "Button"
	| "Link"
	| "ObjectStatus"
	| "AmountWithCurrency"
	| "SemanticKeyWithDraftIndicator"
	| "ObjectIdentifier"
	| "LabelSemanticKey"
	| "LinkWithQuickView"
	| "LinkWrapper"
	| "ExpandableText";

type EditStyle =
	| "InputWithValueHelp"
	| "TextArea"
	| "File"
	| "DatePicker"
	| "TimePicker"
	| "DateTimePicker"
	| "CheckBox"
	| "InputWithUnit"
	| "Input"
	| "RatingIndicator";

type FieldFormatOptions = Partial<{
	/** expression for ObjectStatus visible property */
	containsErrorVisibility: string;
	displayMode: DisplayMode;
	fieldMode: string;
	hasDraftIndicator: boolean;
	isAnalytics: boolean;
	/** If true then navigationavailable property will not be used for enablement of IBN button */
	ignoreNavigationAvailable: boolean;
	isCurrencyAligned: boolean;
	measureDisplayMode: string;
	/** Enables the fallback feature for usage the text annotation from the value lists */
	retrieveTextFromValueList: boolean;
	semantickeys: string[];
	/** Preferred control to visualize semantic key properties */
	semanticKeyStyle: string;
	/** If set to 'true', SAP Fiori elements shows an empty indicator in display mode for the text and links */
	showEmptyIndicator: boolean;
	/** If true then sets the given icon instead of text in Action/IBN Button */
	showIconUrl: boolean;
	/** Describe how the alignment works between Table mode (Date and Numeric End alignment) and Form mode (numeric aligned End in edit and Begin in display) */
	textAlignMode: string;
	/** Maximum number of lines for multiline texts in edit mode */
	textLinesEdit: string;
	/** Maximum number of lines that multiline texts in edit mode can grow to */
	textMaxLines: string;
	compactSemanticKey: string;
	fieldGroupDraftIndicatorPropertyPath: string;
	fieldGroupName: string;
	textMaxLength: number;
	/** Maximum number of characters from the beginning of the text field that are shown initially. */
	textMaxCharactersDisplay: number;
	/** Defines how the full text will be displayed - InPlace or Popover */
	textExpandBehaviorDisplay: string;
	dateFormatOptions?: UIFormatters.dateFormatOptions; // showTime here is used for text formatting only
}>;

export type FieldProperties = StrictPropertiesOf<Field>;

/**
 * Building block for creating a Field based on the metadata provided by OData V4.
 * <br>
 * Usually, a DataField annotation is expected
 *
 * Usage example:
 * <pre>
 * <internalMacro:Field
 *   idPrefix="SomePrefix"
 *   contextPath="{entitySet>}"
 *   metaPath="{dataField>}"
 * />
 * </pre>
 *
 * @hideconstructor
 * @private
 * @experimental
 * @since 1.94.0
 */
@defineBuildingBlock({
	name: "Field",
	namespace: "sap.fe.macros.internal",
	designtime: "sap/fe/macros/internal/Field.designtime"
})
export default class Field extends BuildingBlockBase {
	@blockAttribute({
		type: "string"
	})
	public dataSourcePath?: string;

	@blockAttribute({
		type: "string"
	})
	public emptyIndicatorMode?: string;

	@blockAttribute({
		type: "string"
	})
	public _flexId?: string;

	@blockAttribute({
		type: "string"
	})
	public idPrefix?: string;

	@blockAttribute({
		type: "string"
	})
	public _apiId?: string;

	@blockAttribute({
		type: "string"
	})
	public noWrapperId?: string;

	@blockAttribute({
		type: "string",
		defaultValue: "FieldValueHelp"
	})
	public vhIdPrefix!: string;

	@blockAttribute({
		type: "string",
		computed: true
	})
	public _vhFlexId!: string;

	/**
	 * Metadata path to the entity set
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		$kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
	})
	public entitySet!: Context;

	/**
	 * Metadata path to the entity set
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: false,
		computed: true,
		$kind: ["EntityType"]
	})
	public entityType!: Context;

	/**
	 * Flag indicating whether action will navigate after execution
	 */
	@blockAttribute({
		type: "boolean",
		defaultValue: true
	})
	public navigateAfterAction!: boolean;

	/**
	 * Metadata path to the dataField.
	 * This property is usually a metadataContext pointing to a DataField having
	 * $Type of DataField, DataFieldWithUrl, DataFieldForAnnotation, DataFieldForAction, DataFieldForIntentBasedNavigation, DataFieldWithNavigationPath, or DataPointType.
	 * But it can also be a Property with $kind="Property"
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		$kind: ["Property"],
		$Type: [
			"com.sap.vocabularies.UI.v1.DataField",
			"com.sap.vocabularies.UI.v1.DataFieldWithUrl",
			"com.sap.vocabularies.UI.v1.DataFieldForAnnotation",
			"com.sap.vocabularies.UI.v1.DataFieldForAction",
			"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation",
			"com.sap.vocabularies.UI.v1.DataFieldWithAction",
			"com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation",
			"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath",
			"com.sap.vocabularies.UI.v1.DataPointType"
		]
	})
	public dataField!: Context;

	/**
	 * Context pointing to an array of the property's semantic objects
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: false,
		computed: true
	})
	public semanticObjects!: Context;

	/**
	 * Edit Mode of the field.
	 *
	 * If the editMode is undefined then we compute it based on the metadata
	 * Otherwise we use the value provided here.
	 */
	@blockAttribute({
		type: "sap.ui.mdc.enum.EditMode"
	})
	public editMode?: EditMode | CompiledBindingToolkitExpression;

	/**
	 * Wrap field
	 */
	@blockAttribute({
		type: "boolean"
	})
	public wrap?: boolean;

	/**
	 * CSS class for margin
	 */
	@blockAttribute({
		type: "string"
	})
	public class?: string;

	/**
	 * Property added to associate the label with the Field
	 */
	@blockAttribute({
		type: "string"
	})
	public ariaLabelledBy?: string;

	@blockAttribute({
		type: "sap.ui.core.TextAlign"
	})
	public textAlign?: string;

	@blockAttribute({
		type: "string",
		computed: true
	})
	public editableExpression!: string | CompiledBindingToolkitExpression;

	@blockAttribute({
		type: "string",
		computed: true
	})
	public enabledExpression!: string | CompiledBindingToolkitExpression;

	@blockAttribute({
		type: "boolean",
		computed: true
	})
	public collaborationEnabled!: boolean;

	@blockAttribute({
		type: "string",
		computed: true
	})
	public collaborationHasActivityExpression!: string | CompiledBindingToolkitExpression;

	@blockAttribute({
		type: "string",
		computed: true
	})
	public collaborationInitialsExpression!: string | CompiledBindingToolkitExpression;

	@blockAttribute({
		type: "string",
		computed: true
	})
	public collaborationColorExpression!: string | CompiledBindingToolkitExpression;

	/**
	 * Option to add a semantic object to a field
	 */
	@blockAttribute({
		type: "string",
		required: false
	})
	public semanticObject?: string | SemanticObject;

	@blockAttribute({
		type: "boolean",
		required: false
	})
	public hasSemanticObjectOnNavigation?: boolean;

	@blockAttribute({
		type: "string"
	})
	public requiredExpression?: string;

	@blockAttribute({
		type: "boolean"
	})
	public visible?: boolean | CompiledBindingToolkitExpression;

	@blockAttribute({
		type: "object",
		validate: function (formatOptionsInput: FieldFormatOptions) {
			if (formatOptionsInput.textAlignMode && !["Table", "Form"].includes(formatOptionsInput.textAlignMode)) {
				throw new Error(`Allowed value ${formatOptionsInput.textAlignMode} for textAlignMode does not match`);
			}

			if (
				formatOptionsInput.displayMode &&
				!["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)
			) {
				throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
			}

			if (formatOptionsInput.fieldMode && !["nowrapper", ""].includes(formatOptionsInput.fieldMode)) {
				throw new Error(`Allowed value ${formatOptionsInput.fieldMode} for fieldMode does not match`);
			}

			if (formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput.measureDisplayMode)) {
				throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
			}

			if (
				formatOptionsInput.textExpandBehaviorDisplay &&
				!["InPlace", "Popover"].includes(formatOptionsInput.textExpandBehaviorDisplay)
			) {
				throw new Error(
					`Allowed value ${formatOptionsInput.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`
				);
			}

			if (formatOptionsInput.semanticKeyStyle && !["ObjectIdentifier", "Label", ""].includes(formatOptionsInput.semanticKeyStyle)) {
				throw new Error(`Allowed value ${formatOptionsInput.semanticKeyStyle} for semanticKeyStyle does not match`);
			}

			/*
			Historical default values are currently disabled
			if (!formatOptionsInput.semanticKeyStyle) {
				formatOptionsInput.semanticKeyStyle = "";
			}
			*/

			return formatOptionsInput;
		}
	})
	public formatOptions: FieldFormatOptions = {};

	/**
	 * Event handler for change event
	 */
	@blockEvent()
	onChange: string = "";

	// Computed properties
	descriptionBindingExpression?: string;

	displayVisible?: string | boolean;

	editModeAsObject?: any;

	editStyle?: EditStyle | null;

	hasQuickViewFacets?: boolean;

	navigationAvailable?: boolean | string;

	showTimezone?: boolean;

	text?: string | BindingToolkitExpression<string> | CompiledBindingToolkitExpression;

	identifierTitle?: string | BindingToolkitExpression<string> | CompiledBindingToolkitExpression;

	identifierText?: string | BindingToolkitExpression<string> | CompiledBindingToolkitExpression;

	textBindingExpression?: CompiledBindingToolkitExpression;

	unitBindingExpression?: string;

	unitEditable?: string;

	valueBindingExpression?: CompiledBindingToolkitExpression;

	valueAsStringBindingExpression?: CompiledBindingToolkitExpression;

	linkUrl?: string | CompiledBindingToolkitExpression;

	iconUrl?: string | CompiledBindingToolkitExpression;

	displayStyle?: DisplayStyle | null;

	hasSituationsIndicator?: boolean;

	avatarVisible?: CompiledBindingToolkitExpression;

	avatarSrc?: CompiledBindingToolkitExpression;
	fileSrc?: CompiledBindingToolkitExpression;

	static getOverrides(mControlConfiguration: any, sID: string) {
		const oProps: { [index: string]: any } = {};
		if (mControlConfiguration) {
			const oControlConfig = mControlConfiguration[sID];
			if (oControlConfig) {
				Object.keys(oControlConfig).forEach(function (sConfigKey) {
					oProps[sConfigKey] = oControlConfig[sConfigKey];
				});
			}
		}
		return oProps;
	}

	static getObjectIdentifierTitle(
		fieldFormatOptions: FieldFormatOptions,
		oPropertyDataModelObjectPath: DataModelObjectPath
	): BindingToolkitExpression<string> | CompiledBindingToolkitExpression {
		let propertyBindingExpression: BindingToolkitExpression<any> = pathInModel(
			getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath)
		);
		let targetDisplayMode = fieldFormatOptions?.displayMode;
		const oPropertyDefinition =
			oPropertyDataModelObjectPath.targetObject.type === "PropertyPath"
				? (oPropertyDataModelObjectPath.targetObject.$target as Property)
				: (oPropertyDataModelObjectPath.targetObject as Property);
		propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);

		const commonText = oPropertyDefinition.annotations?.Common?.Text;
		if (commonText === undefined) {
			// there is no property for description
			targetDisplayMode = "Value";
		}
		const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);

		const parametersForFormatter = [];

		parametersForFormatter.push(pathInModel("T_NEW_OBJECT", "sap.fe.i18n"));
		parametersForFormatter.push(pathInModel("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO", "sap.fe.i18n"));

		if (
			!!(oPropertyDataModelObjectPath.targetEntitySet as EntitySet)?.annotations?.Common?.DraftRoot ||
			!!(oPropertyDataModelObjectPath.targetEntitySet as EntitySet)?.annotations?.Common?.DraftNode
		) {
			parametersForFormatter.push(Entity.HasDraft);
			parametersForFormatter.push(Entity.IsActive);
		} else {
			parametersForFormatter.push(constant(null));
			parametersForFormatter.push(constant(null));
		}

		switch (targetDisplayMode) {
			case "Value":
				parametersForFormatter.push(propertyBindingExpression);
				parametersForFormatter.push(constant(null));
				break;
			case "Description":
				parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>);
				parametersForFormatter.push(constant(null));
				break;
			case "ValueDescription":
				parametersForFormatter.push(propertyBindingExpression);
				parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>);
				break;
			default:
				if (commonText?.annotations?.UI?.TextArrangement) {
					parametersForFormatter.push(
						getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>
					);
					parametersForFormatter.push(propertyBindingExpression);
				} else {
					// if DescriptionValue is set by default and not by TextArrangement
					// we show description in ObjectIdentifier Title and value in ObjectIdentifier Text
					parametersForFormatter.push(
						getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>
					);
					// if DescriptionValue is set by default and property has a semantic object
					// we show description and value in ObjectIdentifier Title
					if (oPropertyDataModelObjectPath.targetObject?.annotations?.Common?.SemanticObject) {
						parametersForFormatter.push(propertyBindingExpression);
					} else {
						parametersForFormatter.push(constant(null));
					}
				}
				break;
		}
		return compileExpression(formatResult(parametersForFormatter as any, valueFormatters.formatOPTitle));
	}

	static getObjectIdentifierText(
		fieldFormatOptions: FieldFormatOptions,
		oPropertyDataModelObjectPath: DataModelObjectPath
	): BindingToolkitExpression<string> | CompiledBindingToolkitExpression {
		let propertyBindingExpression: BindingToolkitExpression<any> = pathInModel(
			getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath)
		);
		const targetDisplayMode = fieldFormatOptions?.displayMode;
		const oPropertyDefinition =
			oPropertyDataModelObjectPath.targetObject.type === "PropertyPath"
				? (oPropertyDataModelObjectPath.targetObject.$target as Property)
				: (oPropertyDataModelObjectPath.targetObject as Property);

		const commonText = oPropertyDefinition.annotations?.Common?.Text;
		if (commonText === undefined || commonText?.annotations?.UI?.TextArrangement) {
			return undefined;
		}
		propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);

		switch (targetDisplayMode) {
			case "ValueDescription":
				const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
				return compileExpression(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>);
			case "DescriptionValue":
				return compileExpression(formatResult([propertyBindingExpression], valueFormatters.formatToKeepWhitespace));
			default:
				return undefined;
		}
	}

	static setUpDataPointType(oDataField: any) {
		// data point annotations need not have $Type defined, so add it if missing
		if (oDataField?.term === "com.sap.vocabularies.UI.v1.DataPoint") {
			oDataField.$Type = oDataField.$Type || UIAnnotationTypes.DataPointType;
		}
	}

	static setUpVisibleProperties(oFieldProps: FieldProperties, oPropertyDataModelObjectPath: DataModelObjectPath) {
		// we do this before enhancing the dataModelPath so that it still points at the DataField
		oFieldProps.visible = FieldTemplating.getVisibleExpression(oPropertyDataModelObjectPath, oFieldProps.formatOptions);
		oFieldProps.displayVisible = oFieldProps.formatOptions.fieldMode === "nowrapper" ? oFieldProps.visible : undefined;
	}

	static getContentId(sMacroId: string) {
		return `${sMacroId}-content`;
	}

	static setUpSemanticObjects(oProps: FieldProperties, oDataModelPath: DataModelObjectPath): void {
		let aSemObjExprToResolve: SemanticObjectCustomData[] = [];
		aSemObjExprToResolve = FieldTemplating.getSemanticObjectExpressionToResolve(oDataModelPath?.targetObject?.annotations?.Common);

		/**
		 * If the field building block has a binding expression in the custom semantic objects,
		 * it is then used by the QuickView Form BB.
		 * This is needed to resolve the link at runtime. The QuickViewDelegate.js then gets the resolved
		 * binding expression from the custom data.
		 * All other semanticObjects are processed in the QuickView building block.
		 */
		if (!!oProps.semanticObject && typeof oProps.semanticObject === "string" && oProps.semanticObject[0] === "{") {
			aSemObjExprToResolve.push({
				key: oProps.semanticObject.substr(1, oProps.semanticObject.length - 2),
				value: oProps.semanticObject
			});
		}
		oProps.semanticObjects = FieldTemplating.getSemanticObjects(aSemObjExprToResolve);
		// This sets up the semantic links found in the navigation property, if there is no semantic links define before.
		if (!oProps.semanticObject && oDataModelPath.navigationProperties.length > 0) {
			oDataModelPath.navigationProperties.forEach(function (navProperty) {
				if (navProperty?.annotations?.Common?.SemanticObject) {
					oProps.semanticObject = navProperty.annotations.Common.SemanticObject;
					oProps.hasSemanticObjectOnNavigation = true;
				}
			});
		}
	}

	static setUpEditableProperties(oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath, oMetaModel: any): void {
		const oPropertyForFieldControl = oDataModelPath?.targetObject?.Value
			? oDataModelPath.targetObject.Value
			: oDataModelPath?.targetObject;
		if (oProps.editMode !== undefined && oProps.editMode !== null) {
			// Even if it provided as a string it's a valid part of a binding expression that can be later combined into something else.
			oProps.editModeAsObject = oProps.editMode;
		} else {
			const bMeasureReadOnly = oProps.formatOptions.measureDisplayMode
				? oProps.formatOptions.measureDisplayMode === "ReadOnly"
				: false;

			oProps.editModeAsObject = UIFormatters.getEditMode(
				oPropertyForFieldControl,
				oDataModelPath,
				bMeasureReadOnly,
				true,
				oDataField
			);
			oProps.editMode = compileExpression(oProps.editModeAsObject);
		}
		const editableExpression = UIFormatters.getEditableExpressionAsObject(oPropertyForFieldControl, oDataField, oDataModelPath);
		const aRequiredPropertiesFromInsertRestrictions = CommonUtils.getRequiredPropertiesFromInsertRestrictions(
			oProps.entitySet?.getPath().replaceAll("/$NavigationPropertyBinding/", "/"),
			oMetaModel
		);
		const aRequiredPropertiesFromUpdateRestrictions = CommonUtils.getRequiredPropertiesFromUpdateRestrictions(
			oProps.entitySet?.getPath().replaceAll("/$NavigationPropertyBinding/", "/"),
			oMetaModel
		);
		const oRequiredProperties = {
			requiredPropertiesFromInsertRestrictions: aRequiredPropertiesFromInsertRestrictions,
			requiredPropertiesFromUpdateRestrictions: aRequiredPropertiesFromUpdateRestrictions
		};
		if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
			oProps.collaborationEnabled = true;
			// Expressions needed for Collaboration Visualization
			const collaborationExpression = UIFormatters.getCollaborationExpression(
				oDataModelPath,
				CollaborationFormatters.hasCollaborationActivity
			);
			oProps.collaborationHasActivityExpression = compileExpression(collaborationExpression);
			oProps.collaborationInitialsExpression = compileExpression(
				UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityInitials)
			);
			oProps.collaborationColorExpression = compileExpression(
				UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityColor)
			);
			oProps.editableExpression = compileExpression(and(editableExpression, not(collaborationExpression)));

			oProps.editMode = compileExpression(ifElse(collaborationExpression, constant("ReadOnly"), oProps.editModeAsObject));
		} else {
			oProps.editableExpression = compileExpression(editableExpression);
		}
		oProps.enabledExpression = UIFormatters.getEnabledExpression(
			oPropertyForFieldControl,
			oDataField,
			false,
			oDataModelPath
		) as CompiledBindingToolkitExpression;
		oProps.requiredExpression = UIFormatters.getRequiredExpression(
			oPropertyForFieldControl,
			oDataField,
			false,
			false,
			oRequiredProperties,
			oDataModelPath
		) as CompiledBindingToolkitExpression;
	}

	static setUpFormatOptions(oProps: FieldProperties, oDataModelPath: DataModelObjectPath, oControlConfiguration: any, mSettings: any) {
		const oOverrideProps = Field.getOverrides(oControlConfiguration, oProps.dataField.getPath());

		if (!oProps.formatOptions.displayMode) {
			oProps.formatOptions.displayMode = UIFormatters.getDisplayMode(oDataModelPath);
		}
		oProps.formatOptions.textLinesEdit =
			oOverrideProps.textLinesEdit ||
			(oOverrideProps.formatOptions && oOverrideProps.formatOptions.textLinesEdit) ||
			oProps.formatOptions.textLinesEdit ||
			4;
		oProps.formatOptions.textMaxLines =
			oOverrideProps.textMaxLines ||
			(oOverrideProps.formatOptions && oOverrideProps.formatOptions.textMaxLines) ||
			oProps.formatOptions.textMaxLines;

		// Retrieve text from value list as fallback feature for missing text annotation on the property
		if (mSettings.models.viewData?.getProperty("/retrieveTextFromValueList")) {
			oProps.formatOptions.retrieveTextFromValueList = FieldTemplating.isRetrieveTextFromValueListEnabled(
				oDataModelPath.targetObject,
				oProps.formatOptions
			);
			if (oProps.formatOptions.retrieveTextFromValueList) {
				// Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
				const hasEntityTextArrangement = !!oDataModelPath?.targetEntityType?.annotations?.UI?.TextArrangement;
				oProps.formatOptions.displayMode = hasEntityTextArrangement ? oProps.formatOptions.displayMode : "DescriptionValue";
			}
		}
		if (oProps.formatOptions.fieldMode === "nowrapper" && oProps.editMode === "Display") {
			if (oProps._flexId) {
				oProps.noWrapperId = oProps._flexId;
			} else {
				oProps.noWrapperId = oProps.idPrefix ? generate([oProps.idPrefix, "Field-content"]) : undefined;
			}
		}
	}

	static setUpDisplayStyle(oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath): void {
		const oProperty: Property = oDataModelPath.targetObject as Property;
		if (!oDataModelPath.targetObject) {
			oProps.displayStyle = "Text";
			return;
		}
		if (oProperty.type === "Edm.Stream") {
			oProps.fileSrc = compileExpression(getExpressionFromAnnotation(oDataField.Value));
			oProps.displayStyle = "File";
			return;
		}
		if (oProperty.annotations?.UI?.IsImageURL) {
			oProps.avatarVisible = FieldTemplating.getVisibleExpression(oDataModelPath);
			oProps.avatarSrc = compileExpression(getExpressionFromAnnotation(oDataField.Value));
			oProps.displayStyle = "Avatar";
			return;
		}
		const hasQuickViewFacets = oProperty ? FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, oProperty) : false;

		switch (oDataField.$Type) {
			case UIAnnotationTypes.DataPointType:
				oProps.displayStyle = "DataPoint";
				return;
			case UIAnnotationTypes.DataFieldForAnnotation:
				if (oDataField.Target?.$target?.$Type === UIAnnotationTypes.DataPointType) {
					oProps.displayStyle = "DataPoint";
					return;
				} else if (oDataField.Target?.$target?.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
					oProps.displayStyle = "Contact";
					return;
				}
				break;
			case UIAnnotationTypes.DataFieldForAction:
				oProps.displayStyle = "Button";
				return;
			case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
				Field.setUpNavigationAvailable(oProps, oDataField);
				oProps.displayStyle = "Button";
				return;
			case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
				oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			// falls through
			case UIAnnotationTypes.DataFieldWithNavigationPath:
			case UIAnnotationTypes.DataFieldWithAction:
				oProps.displayStyle = "Link";
				return;
		}
		if (isSemanticKey(oProperty, oDataModelPath) && oProps.formatOptions.semanticKeyStyle) {
			oProps.hasQuickViewFacets = hasQuickViewFacets;
			oProps.hasSituationsIndicator =
				SituationsIndicator.getSituationsNavigationProperty(oDataModelPath.targetEntityType) !== undefined;
			Field.setUpObjectIdentifierTitleAndText(oProps, oDataModelPath);
			if ((oDataModelPath.targetEntitySet as EntitySet)?.annotations?.Common?.DraftRoot) {
				oProps.displayStyle = "SemanticKeyWithDraftIndicator";
				return;
			}
			oProps.displayStyle = oProps.formatOptions.semanticKeyStyle === "ObjectIdentifier" ? "ObjectIdentifier" : "LabelSemanticKey";
			return;
		}
		if (oDataField.Criticality) {
			oProps.hasQuickViewFacets = hasQuickViewFacets;
			oProps.displayStyle = "ObjectStatus";
			return;
		}
		if (oProperty.annotations?.Measures?.ISOCurrency && String(oProps.formatOptions.isCurrencyAligned) === "true") {
			if (oProps.formatOptions.measureDisplayMode === "Hidden") {
				oProps.displayStyle = "Text";
				return;
			}
			oProps.valueAsStringBindingExpression = FieldTemplating.getValueBinding(
				oDataModelPath,
				oProps.formatOptions,
				true,
				true,
				undefined,
				true
			);
			oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
			oProps.displayStyle = "AmountWithCurrency";
			return;
		}
		if (oProperty.annotations?.Communication?.IsEmailAddress || oProperty.annotations?.Communication?.IsPhoneNumber) {
			oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.displayStyle = "Link";
			return;
		}
		if (oProperty.annotations?.UI?.MultiLineText) {
			oProps.displayStyle = "ExpandableText";
			return;
		}

		if (hasQuickViewFacets) {
			oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.hasQuickViewFacets = true;
			oProps.displayStyle = "LinkWithQuickView";
			return;
		}

		if (
			oProps.semanticObject &&
			!(oProperty?.annotations?.Communication?.IsEmailAddress || oProperty?.annotations?.Communication?.IsPhoneNumber)
		) {
			oProps.hasQuickViewFacets = hasQuickViewFacets;
			oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.displayStyle = "LinkWithQuickView";
			return;
		}
		if (FieldTemplating.hasSemanticObjectInNavigationOrProperty(oDataModelPath)) {
			oProps.hasQuickViewFacets = hasQuickViewFacets;
			oProps.displayStyle = "LinkWrapper";
			return;
		}
		const _oPropertyCommonAnnotations = oProperty.annotations?.Common;
		const _oPropertyNavigationPropertyAnnotations = oDataModelPath?.navigationProperties[0]?.annotations?.Common;
		for (const key in _oPropertyCommonAnnotations) {
			if (key.indexOf("SemanticObject") === 0) {
				oProps.hasQuickViewFacets = hasQuickViewFacets;
				oProps.displayStyle = "LinkWrapper";
				return;
			}
		}
		for (const key in _oPropertyNavigationPropertyAnnotations) {
			if (key.indexOf("SemanticObject") === 0) {
				oProps.hasQuickViewFacets = hasQuickViewFacets;
				oProps.displayStyle = "LinkWrapper";
				return;
			}
		}

		if (oDataField.$Type === UIAnnotationTypes.DataFieldWithUrl) {
			oProps.text = Field.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.displayStyle = "Link";
			oProps.iconUrl = oDataField.IconUrl ? compileExpression(getExpressionFromAnnotation(oDataField.IconUrl)) : undefined;
			oProps.linkUrl = compileExpression(getExpressionFromAnnotation(oDataField.Url));
			return;
		}
		oProps.displayStyle = "Text";
	}

	static setUpEditStyle(oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath): void {
		FieldTemplating.setEditStyleProperties(oProps, oDataField, oDataModelPath);
	}

	static setUpObjectIdentifierTitleAndText(_oProps: FieldProperties, oPropertyDataModelObjectPath: DataModelObjectPath) {
		if (_oProps.formatOptions?.semanticKeyStyle === "ObjectIdentifier") {
			_oProps.identifierTitle = Field.getObjectIdentifierTitle(_oProps.formatOptions, oPropertyDataModelObjectPath);
			if (!oPropertyDataModelObjectPath.targetObject?.annotations?.Common?.SemanticObject) {
				_oProps.identifierText = Field.getObjectIdentifierText(_oProps.formatOptions, oPropertyDataModelObjectPath);
			} else {
				_oProps.identifierText = undefined;
			}
		} else {
			_oProps.identifierTitle = undefined;
			_oProps.identifierText = undefined;
		}
	}

	static getTextWithWhiteSpace(formatOptions: FieldFormatOptions, oDataModelPath: DataModelObjectPath) {
		const text = FieldTemplating.getTextBinding(oDataModelPath, formatOptions, true);
		return (text as any)._type === "PathInModel" || typeof text === "string"
			? compileExpression(formatResult([text], "WSR"))
			: compileExpression(text);
	}

	static setUpNavigationAvailable(oProps: FieldProperties, oDataField: any): void {
		oProps.navigationAvailable = true;
		if (
			oDataField?.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation &&
			oDataField.NavigationAvailable !== undefined &&
			String(oProps.formatOptions.ignoreNavigationAvailable) !== "true"
		) {
			oProps.navigationAvailable = compileExpression(getExpressionFromAnnotation(oDataField.NavigationAvailable));
		}
	}

	constructor(props: PropertiesOf<Field>, controlConfiguration: any, settings: any) {
		super(props);

		const oDataFieldConverted = MetaModelConverter.convertMetaModelContext(this.dataField);
		let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(this.dataField, this.entitySet);
		Field.setUpDataPointType(oDataFieldConverted);
		Field.setUpVisibleProperties(this, oDataModelPath);

		if (this._flexId) {
			this._apiId = this._flexId;
			this._flexId = Field.getContentId(this._flexId);
			this._vhFlexId = `${this._flexId}_${this.vhIdPrefix}`;
		}
		const valueDataModelPath = FieldTemplating.getDataModelObjectPathForValue(oDataModelPath);
		oDataModelPath = valueDataModelPath || oDataModelPath;
		Field.setUpSemanticObjects(this, oDataModelPath);
		this.dataSourcePath = getTargetObjectPath(oDataModelPath);
		const oMetaModel = settings.models.metaModel || settings.models.entitySet;
		this.entityType = oMetaModel.createBindingContext(`/${oDataModelPath.targetEntityType.fullyQualifiedName}`);

		Field.setUpEditableProperties(this, oDataFieldConverted, oDataModelPath, oMetaModel);
		Field.setUpFormatOptions(this, oDataModelPath, controlConfiguration, settings);
		Field.setUpDisplayStyle(this, oDataFieldConverted, oDataModelPath);
		Field.setUpEditStyle(this, oDataFieldConverted, oDataModelPath);

		// ---------------------------------------- compute bindings----------------------------------------------------
		const aDisplayStylesWithoutPropText = ["Avatar", "AmountWithCurrency"];
		if (this.displayStyle && aDisplayStylesWithoutPropText.indexOf(this.displayStyle) === -1 && oDataModelPath.targetObject) {
			this.text = this.text ?? FieldTemplating.getTextBinding(oDataModelPath, this.formatOptions);
			Field.setUpObjectIdentifierTitleAndText(this, oDataModelPath);
		} else {
			this.text = "";
		}

		//TODO this is fixed twice
		// data point annotations need not have $Type defined, so add it if missing
		if ((this.dataField.getObject("@sapui.name") as unknown as string)?.indexOf("com.sap.vocabularies.UI.v1.DataPoint") > -1) {
			const oDataPoint = this.dataField.getObject() as DataPointType;
			oDataPoint.$Type = oDataPoint.$Type || UIAnnotationTypes.DataPointType;
			this.dataField = new TemplateModel(oDataPoint, this.dataField.getModel() as ODataMetaModel).createBindingContext("/");
		}

		this.emptyIndicatorMode = this.formatOptions.showEmptyIndicator ? "On" : undefined;
	}

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate() {
		if (this.formatOptions.fieldMode === "nowrapper" && this.editMode === EditMode.Display) {
			return xml`<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />`;
		} else {
			let id;
			if (this._apiId) {
				id = this._apiId;
			} else if (this.idPrefix) {
				id = generate([this.idPrefix, "Field"]);
			} else {
				id = undefined;
			}

			if (this.onChange !== null && this.onChange !== "null") {
				return xml`
					<macroField:FieldAPI
						xmlns:macroField="sap.fe.macros.field"
						change="${this.onChange}"
						id="${id}"
						required="${this.requiredExpression}"
						editable="${this.editableExpression}"
						collaborationEnabled="${this.collaborationEnabled}"
						visible="${this.visible}"
					>
						<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />
					</macroField:FieldAPI>
				`;
			} else {
				return xml`<macroField:FieldAPI
						xmlns:macroField="sap.fe.macros.field"
						id="${id}"
						required="${this.requiredExpression}"
						editable="${this.editableExpression}"
						collaborationEnabled="${this.collaborationEnabled}"
						visible="${this.visible}"
					>
						<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />
					</macroField:FieldAPI>
					`;
			}
		}
	}
}
