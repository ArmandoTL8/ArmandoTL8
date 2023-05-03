import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Core from "sap/ui/core/Core";
import UI5ResourceModel from "sap/ui/model/resource/ResourceModel";

const oResourceModel = new UI5ResourceModel({ bundleName: "sap.fe.macros.messagebundle", async: true }),
	oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
let oApplicationResourceBundle: ResourceBundle;

const ResourceModel = {
	/**
	 * Returns the resource model for the library.
	 *
	 * @private
	 * @returns The resource model for this library
	 */
	getModel() {
		return oResourceModel;
	},
	/**
	 * Returns a text from the resource bundle of this library.
	 *
	 * @param sText Text
	 * @param aParameter Parameter
	 * @param sEntitySetName Entity set name
	 * @returns Text from resource bundle
	 */
	getText(sText: string, aParameter?: any[], sEntitySetName?: string) {
		let sResourceKey = sText;
		let sBundleText;
		if (oApplicationResourceBundle) {
			if (sEntitySetName) {
				//Create resource key appended with the entity set name
				sResourceKey = `${sText}|${sEntitySetName}`;
			}
			sBundleText = oApplicationResourceBundle.getText(sResourceKey, aParameter, true);
			return sBundleText ? sBundleText : oResourceBundle.getText(sText, aParameter);
		}
		return oResourceBundle.getText(sText, aParameter);
	},
	/**
	 * Sets the resource bundle of the application.
	 *
	 * @param oApplicationi18nBundle Resource bundle of the application
	 */
	setApplicationI18nBundle(oApplicationi18nBundle: ResourceBundle) {
		oApplicationResourceBundle = oApplicationi18nBundle;
	}
};

export default ResourceModel;
