import { defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import MacroAPI from "../MacroAPI";

/**
 * Building block for creating a Form based on the metadata provided by OData V4.
 * <br>
 * It is designed to work based on a FieldGroup annotation but can also work if you provide a ReferenceFacet or a CollectionFacet
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Form id="MyForm" metaPath="@com.sap.vocabularies.UI.v1.FieldGroup#GeneralInformation" /&gt;
 * </pre>
 *
 * @alias sap.fe.macros.Form
 * @public
 */
@defineUI5Class("sap.fe.macros.form.FormAPI")
class FormAPI extends MacroAPI {
	/**
	 * The identifier of the form control.
	 *
	 * @public
	 */
	@property({ type: "string" })
	id!: string;

	/**
	 * Defines the relative path of the property in the metamodel, based on the current contextPath.
	 *
	 * @public
	 */
	@property({
		type: "string",
		expectedAnnotations: [
			"@com.sap.vocabularies.UI.v1.FieldGroup",
			"@com.sap.vocabularies.UI.v1.CollectionFacet",
			"@com.sap.vocabularies.UI.v1.ReferenceFacet"
		],
		expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"]
	})
	metaPath!: string;

	/**
	 * The title of the form control.
	 *
	 * @public
	 */
	@property({ type: "string" })
	title!: string;
}

export default FormAPI;
