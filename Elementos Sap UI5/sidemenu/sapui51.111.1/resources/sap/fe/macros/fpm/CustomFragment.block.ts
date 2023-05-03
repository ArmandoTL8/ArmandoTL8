import { blockAttribute, BuildingBlockBase, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlock";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import { V4Context } from "../../../../../../../types/extension_types";

/**
 * Content of a custom fragment
 *
 * @private
 * @experimental
 */
@defineBuildingBlock({
	name: "CustomFragment",
	namespace: "sap.fe.macros.fpm"
})
export default class CustomFragment extends BuildingBlockBase {
	/**
	 * ID of the custom fragment
	 */
	@blockAttribute({ type: "string", required: true })
	public id!: string;

	/**
	 * Context Path
	 */
	@blockAttribute({ type: "sap.ui.model.Context", required: false })
	public contextPath!: V4Context;

	/**
	 *  Name of the custom fragment
	 */
	@blockAttribute({ type: "string", required: true })
	public fragmentName!: string;

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string
	 */
	getTemplate() {
		const fragmentInstanceName = this.fragmentName + "-JS".replace(/\//g, ".");

		return xml`<core:Fragment
			xmlns:compo="http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1"
			fragmentName="${fragmentInstanceName}"
			id="${this.id}"
			type="CUSTOM"
		>
			<compo:fragmentContent>
				<core:FragmentDefinition>
					<core:Fragment fragmentName="${this.fragmentName}" type="XML" />
				</core:FragmentDefinition>
			</compo:fragmentContent>
		</core:Fragment>`;
	}
}
