import Core from "sap/ui/core/Core";
import "sap/ui/core/library";

/**
 * Test library for SAP Fiori elements
 *
 * @namespace
 * @name sap.fe.test
 * @public
 */

// library dependencies
const thisLib = Core.initLibrary({
	name: "sap.fe.test",
	dependencies: ["sap.ui.core"],
	types: [],
	interfaces: [],
	controls: [],
	elements: [],
	// eslint-disable-next-line no-template-curly-in-string
	version: "${version}",
	noLibraryCSS: true
});

export default thisLib;
