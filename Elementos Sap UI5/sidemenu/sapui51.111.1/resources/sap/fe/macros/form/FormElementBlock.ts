import type { ServiceObject } from "@sap-ux/vocabularies-types";
import { blockAggregation, blockAttribute, BuildingBlockBase, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlock";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import type Control from "sap/ui/core/Control";
import type Context from "sap/ui/model/odata/v4/Context";

/**
 * Building block used to create a form element based on the metadata provided by OData V4.
 *
 * @public
 * @since 1.90.0
 */

@defineBuildingBlock({
	name: "FormElement",
	namespace: "sap.fe.macros"
})
export default class FormElementBlock extends BuildingBlockBase {
	/**
	 * The identifier of the FormElement building block.
	 *
	 * @public
	 */
	@blockAttribute({ type: "string", required: true })
	id!: string;

	/**
	 * Defines the path of the context used in the current page or block.
	 * This setting is defined by the framework.
	 *
	 * @public
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true
	})
	contextPath!: Context;

	/**
	 * Defines the relative path of the property in the metamodel, based on the current contextPath.
	 *
	 * @public
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true
	})
	metaPath!: Context;

	/**
	 * Label shown for the field. If not set, the label from the annotations will be shown.
	 *
	 * @public
	 */
	@blockAttribute({ type: "string" })
	label!: string;

	/**
	 * If set to false, the FormElement is not rendered.
	 *
	 * @public
	 */
	@blockAttribute({ type: "boolean" })
	visible?: boolean;

	@blockAttribute({ type: "string" })
	key?: string;

	/**
	 * Optional aggregation of controls that should be displayed inside the FormElement.
	 * If not set, a default Field building block will be rendered
	 *
	 * @public
	 */
	@blockAggregation({ type: "sap.ui.core.Control", slot: "fields", isDefault: true })
	fields?: Control[];

	constructor(oProps: PropertiesOf<FormElementBlock>, configuration: any, mSettings: any) {
		super(oProps, configuration, mSettings);
		const oContextObjectPath = getInvolvedDataModelObjects(this.metaPath, this.contextPath);
		if (this.label === undefined) {
			this.label = (oContextObjectPath.targetObject as ServiceObject).annotations.Common?.Label?.toString() ?? "";
		}
	}

	getFields() {
		if (this.fields) {
			return xml`<slot name="fields" />`;
		} else {
			return xml`<macros:Field
						metaPath="${this.metaPath}"
						contextPath="${this.contextPath}"
						id="${this.createId("FormElementField")}" />`;
		}
	}

	getTemplate() {
		return xml`<f:FormElement xmlns:f="sap.ui.layout.form" id="${this.id}"
			key="${this.key}"
			label="${this.label}"
			visible="${this.visible}">
			<f:fields>
				${this.getFields()}
			</f:fields>
		</f:FormElement>`;
	}
}
