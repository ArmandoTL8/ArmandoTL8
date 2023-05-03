import MacroMetadata from "sap/fe/macros/MacroMetadata";

/**
 * @classdesc
 * Building block used to create a paginator control.
 *
 * Usage example:
 * <pre>
 * &lt;macro:Paginator /&gt;
 * </pre>
 * @class sap.fe.macros.Paginator
 * @hideconstructor
 * @public
 * @since 1.94.0
 */
const Paginator = MacroMetadata.extend("sap.fe.macros.paginator.Paginator", {
	/**
	 * Name of the building block control.
	 */
	name: "Paginator",
	/**
	 * Namespace of the building block control
	 */
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.paginator.Paginator",
	/**
	 * The metadata describing the macro control.
	 */
	metadata: {
		/**
		 * Defines the macro stereotype used in documentation.
		 */
		stereotype: "xmlmacro",
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * The identifier of the Paginator control.
			 */
			id: {
				type: "string",
				isPublic: true
			}
		}
	}
});
export default Paginator;
