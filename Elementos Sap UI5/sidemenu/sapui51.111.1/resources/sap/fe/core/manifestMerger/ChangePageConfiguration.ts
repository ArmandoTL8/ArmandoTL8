import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import { ManifestContent } from "sap/fe/core/AppComponent";

export type Change = {
	getContent(): ChangeContent;
};

type ChangeContent = {
	page: string; // ID of the page to be changed
	entityPropertyChange: EntityPropertyChange;
};

type EntityPropertyChange = {
	propertyPath: string; // path to the property to be changed
	operation: string; // only UPSERT supported
	propertyValue: string | Object; //what to be changed
};

/**
 * Apply change method.
 *
 * This method is being called by the FLEX framework in case a manifest change with the change type
 * 'appdescr_fe_changePageConfiguration' was created for the current application. This method is not meant to be
 * called by anyone else but the FLEX framework.
 *
 * @function
 * @name sap.fe.core.manifestMerger#applyChange
 * @param manifest The original manifest.
 * @param change The change content.
 * @returns The changed or unchanged manifest.
 * @private
 */
export function applyChange(manifest: ManifestContent, change: Change): object {
	const changeContent = change.getContent();
	const pageId = changeContent?.page;
	const propertyChange = changeContent?.entityPropertyChange;

	// return unmodified manifest in case change not valid
	if (
		propertyChange?.operation !== "UPSERT" ||
		!propertyChange?.propertyPath ||
		propertyChange?.propertyValue === undefined ||
		propertyChange?.propertyPath.startsWith("/")
	) {
		Log.error("Change content is not a valid");
		return manifest;
	}

	return changeConfiguration(manifest, pageId, propertyChange.propertyPath, propertyChange.propertyValue);
}

/**
 * Changes the page configuration of SAP Fiori elements.
 *
 * This method enables you to change the page configuration of SAP Fiori elements.
 *
 * @function
 * @name sap.fe.core.manifestMerger#changeConfiguration
 * @param manifest The original manifest.
 * @param pageId The ID of the page for which the configuration is to be changed.
 * @param path The path in the page settings for which the configuration is to be changed.
 * @param value The new value of the configuration. This could be a plain value like a string, or a Boolean, or a structured object.
 * @returns The changed or unchanged manifest.
 * @private
 */
export function changeConfiguration(manifest: ManifestContent, pageId: string, path: string, value: unknown): object {
	const pageSettings = getPageSettings(manifest, pageId);

	if (pageSettings) {
		let propertyPath = path.split("/");
		if (propertyPath[0] === "controlConfiguration") {
			let annotationPath = "";
			// the annotation path in the control configuration has to stay together. For now rely on the fact the @ is in the last part
			for (let i = 1; i < propertyPath.length; i++) {
				annotationPath += (i > 1 ? "/" : "") + propertyPath[i];
				if (annotationPath.indexOf("@") > -1) {
					propertyPath = ["controlConfiguration", annotationPath].concat(propertyPath.slice(i + 1));
					break;
				}
			}
		}
		ObjectPath.set(propertyPath, value, pageSettings);
	} else {
		Log.error(`No Fiori elements page with ID ${pageId} found in routing targets.`);
	}

	return manifest;
}

/**
 * Search the page settings in the manifest for a given page ID.
 *
 * @function
 * @name sap.fe.core.manifestMerger#getPageSettings
 * @param manifest The manifest where the search is carried out to find the page settings.
 * @param pageId The ID of the page.
 * @returns The page settings for the page ID or undefined if not found.
 * @private
 */
function getPageSettings(manifest: ManifestContent, pageId: string): object | undefined {
	let pageSettings;
	const targets = manifest["sap.ui5"]?.routing?.targets ?? {};
	for (const p in targets) {
		if (targets[p].id === pageId && targets[p].name.startsWith("sap.fe.templates.")) {
			pageSettings = targets[p].options?.settings ?? {};
			break;
		}
	}
	return pageSettings;
}
