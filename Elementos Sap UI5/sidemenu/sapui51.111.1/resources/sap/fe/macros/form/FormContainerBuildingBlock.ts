import {
	blockAggregation,
	blockAttribute,
	blockEvent,
	BuildingBlockBase,
	defineBuildingBlock
} from "sap/fe/core/buildingBlocks/BuildingBlock";
import { createFormDefinition } from "sap/fe/core/converters/controls/Common/Form";
import type { ConfigurableObject } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import type Context from "sap/ui/model/odata/v4/Context";

/**
 * @classdesc
 * Building block for creating a FormContainer based on the provided OData V4 metadata.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:FormContainer
 *   id="SomeId"
 *   entitySet="{entitySet>}"
 *   dataFieldCollection ="{dataFieldCollection>}"
 *   title="someTitle"
 *   navigationPath="{ToSupplier}"
 *   visible=true
 *   onChange=".handlers.onFieldValueChange"
 * /&gt;
 * </pre>
 * @class sap.fe.macros.FormContainer
 * @hideconstructor
 * @private
 * @experimental
 */
@defineBuildingBlock({ name: "FormContainer", namespace: "sap.fe.macros", fragment: "sap.fe.macros.form.FormContainer" })
export default class FormContainerBuildingBlock extends BuildingBlockBase {
	@blockAttribute({ type: "string" })
	id!: string;

	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		isPublic: true,
		$kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
	})
	contextPath!: Context;
	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	entitySet!: Context;

	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true,
		required: true
	})
	metaPath!: Context;

	/**
	 * Metadata path to the dataFieldCollection
	 */
	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	dataFieldCollection?: any;

	/**
	 * Control whether the form is in displayMode or not
	 */
	@blockAttribute({
		type: "boolean"
	})
	displayMode: boolean = false;
	/**
	 * Title of the form container
	 */
	@blockAttribute({ type: "string" })
	title?: string;
	/**
	 * Defines the "aria-level" of the form title, titles of internally used form containers are nested subsequently
	 */
	@blockAttribute({ type: "sap.ui.core.TitleLevel", isPublic: true, defaultValue: "Auto" })
	titleLevel?: string;

	/**
	 * Binding the form container using a navigation path
	 */
	@blockAttribute({ type: "string" })
	navigationPath?: string;
	/**
	 * Binding the visibility of the form container using an expression binding or Boolean
	 */
	@blockAttribute({ type: "string" })
	visible?: string;
	/**
	 * Flex designtime settings to be applied
	 */
	@blockAttribute({ type: "string", defaultValue: "sap/fe/macros/form/FormContainer.designtime" })
	designtimeSettings!: string;
	@blockAttribute({ type: "sap.ui.model.Context" })
	actions!: any[];

	@blockAggregation({ type: "sap.fe.macros.form.FormElement" })
	formElements: Record<string, ConfigurableObject> = {};

	// Just proxied down to the Field may need to see if needed or not
	@blockEvent()
	onChange!: Function;

	definition: any;
	constructor(oProps: PropertiesOf<FormContainerBuildingBlock>, externalConfiguration: any, mSettings: any) {
		super(oProps);
		this.entitySet = oProps.contextPath!;
		if (this.formElements && Object.keys(this.formElements).length > 0) {
			const oContextObjectPath = getInvolvedDataModelObjects(this.metaPath, this.contextPath);
			const mExtraSettings: Record<string, any> = {};
			let oFacetDefinition = oContextObjectPath.targetObject;
			// Wrap the facet in a fake Facet annotation
			oFacetDefinition = {
				$Type: "com.sap.vocabularies.UI.v1.ReferenceFacet",
				Label: oFacetDefinition.Label,
				Target: {
					$target: oFacetDefinition,
					fullyQualifiedName: oFacetDefinition.fullyQualifiedName,
					path: "",
					term: "",
					type: "AnnotationPath",
					value: getContextRelativeTargetObjectPath(oContextObjectPath)
				},
				annotations: {},
				fullyQualifiedName: oFacetDefinition.fullyQualifiedName
			};
			mExtraSettings[oFacetDefinition.Target.value] = { fields: this.formElements };
			const oConverterContext = this.getConverterContext(
				oContextObjectPath,
				/*this.contextPath*/ undefined,
				mSettings,
				mExtraSettings
			);
			const oFormDefinition = createFormDefinition(oFacetDefinition, "true", oConverterContext);

			this.dataFieldCollection = oFormDefinition.formContainers[0].formElements;
		}
	}
}
