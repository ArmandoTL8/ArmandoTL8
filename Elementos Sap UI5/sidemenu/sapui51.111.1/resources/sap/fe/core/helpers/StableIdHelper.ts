import {
	DataField,
	DataFieldAbstractTypes,
	DataFieldForIntentBasedNavigation,
	DataFieldWithAction,
	DataFieldWithIntentBasedNavigation,
	DataFieldWithNavigationPath,
	DataFieldWithUrl,
	FacetTypes,
	FieldGroup,
	UIAnnotationTypes
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { DataModelObjectPath } from "../templating/DataModelPathHelper";

export type AuthorizedIdAnnotationsType = FacetTypes | FieldGroup | DataFieldAbstractTypes;

/**
 * Generates the Id from an IBN.
 *
 * The id contains the value, the potential action and context.
 *
 * @param dataField The IBN annotation
 * @returns The Id
 */
const _getStableIdPartFromIBN = (dataField: DataFieldForIntentBasedNavigation | DataFieldWithIntentBasedNavigation) => {
	const idParts = [dataField.SemanticObject.valueOf(), dataField.Action?.valueOf()];
	if ((dataField as DataFieldForIntentBasedNavigation).RequiresContext) {
		idParts.push("RequiresContext");
	}
	return idParts.filter((id) => id).join("::");
};

/**
 * Generates the Id part related to the value of the dataField.
 *
 * @param dataField The dataField
 * @returns String related to the dataField value
 */
const _getStableIdPartFromValue = (
	dataField: DataField | DataFieldWithAction | DataFieldWithIntentBasedNavigation | DataFieldWithUrl | DataFieldWithNavigationPath
): string => {
	const value = dataField.Value;
	if (value.path) {
		return value.path as string;
	} else if (value.Apply && value.Function === "odata.concat") {
		return value.Apply.map((app: any) => app.$Path as string | undefined).join("::");
	}
	return replaceSpecialChars(value.replace(/ /g, "_"));
};

/**
 * Copy for the Core.isValid function to be independent.
 *
 * @param value String to validate
 * @returns Whether the value is valid or not
 */
const _isValid = (value: string) => {
	return /^([A-Za-z_][-A-Za-z0-9_.:]*)$/.test(value);
};

/**
 * Removes the annotation namespaces.
 *
 * @param id String to manipulate
 * @returns String without the annotation namespaces
 */
const _removeNamespaces = (id: string) => {
	id = id.replace("com.sap.vocabularies.UI.v1.", "");
	id = id.replace("com.sap.vocabularies.Communication.v1.", "");
	return id;
};

/**
 * Generates the Id from an annotation.
 *
 * @param annotation The annotation
 * @returns The Id
 */
export const createIdForAnnotation = (annotation: AuthorizedIdAnnotationsType) => {
	let id;
	switch (annotation.$Type) {
		case UIAnnotationTypes.ReferenceFacet:
			id = annotation.ID ?? annotation.Target.value;
			break;
		case UIAnnotationTypes.CollectionFacet:
			id = annotation.ID ?? "undefined"; // CollectionFacet without Id is not supported but doesn't necessary fail right now
			break;
		case UIAnnotationTypes.FieldGroupType:
			id = annotation.Label;
			break;
		default:
			id = getStableIdPartFromDataField(annotation as DataFieldAbstractTypes);
			break;
	}
	return id ? prepareId(id as string) : id;
};

/**
 * Generates a stable Id based on the given parameters.
 *
 * parameters are combined in the same order that they are provided and are separated by '::'.
 * generate(['Stable', 'Id']) would result in 'Stable::Id' as the Stable Id.
 * Currently supported annotations are Facets, FieldGroup and all kinds of DataField.
 *
 * @param stableIdParts Array of strings, undefined, dataModelObjectPath or annotations
 * @returns Stable Id constructed from the provided parameters
 */
export const generate = (stableIdParts: Array<string | undefined | DataModelObjectPath | AuthorizedIdAnnotationsType>) => {
	const ids: (string | undefined)[] = stableIdParts.map((element) => {
		if (typeof element === "string" || !element) {
			return element;
		}
		return createIdForAnnotation((element as DataModelObjectPath).targetObject || element);
	});
	const result = ids.filter((id) => id).join("::");
	return prepareId(result);
};

/**
 * Generates the Id from a dataField.
 *
 * @param dataField The dataField
 * @param ignoreForCompatibility Ignore a part of the Id on the DataFieldWithNavigationPath to be aligned with previous version
 * @returns The Id
 */
export const getStableIdPartFromDataField = (dataField: DataFieldAbstractTypes, ignoreForCompatibility = false): string | undefined => {
	let id = "";
	switch (dataField.$Type) {
		case UIAnnotationTypes.DataFieldForAction:
			id = `DataFieldForAction::${dataField.Action}`;
			break;
		case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
			id = `DataFieldForIntentBasedNavigation::${_getStableIdPartFromIBN(dataField)}`;
			break;
		case UIAnnotationTypes.DataFieldForAnnotation:
			id = `DataFieldForAnnotation::${dataField.Target.value}`;
			break;
		case UIAnnotationTypes.DataFieldWithAction:
			id = `DataFieldWithAction::${_getStableIdPartFromValue(dataField)}::${dataField.Action}`;
			break;
		case UIAnnotationTypes.DataField:
			id = `DataField::${_getStableIdPartFromValue(dataField)}`;
			break;
		case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
			id = `DataFieldWithIntentBasedNavigation::${_getStableIdPartFromValue(dataField)}::${_getStableIdPartFromIBN(dataField)}`;
			break;
		case UIAnnotationTypes.DataFieldWithNavigationPath:
			id = `DataFieldWithNavigationPath::${_getStableIdPartFromValue(dataField)}`;
			if (dataField.Target.type === "NavigationPropertyPath" && !ignoreForCompatibility) {
				id = `${id}::${dataField.Target.value}`;
			}
			break;
		case UIAnnotationTypes.DataFieldWithUrl:
			id = `DataFieldWithUrl::${_getStableIdPartFromValue(dataField)}`;
			break;
		default:
			break;
	}
	return id ? prepareId(id) : undefined;
};

/**
 * Removes or replaces with "::" some special characters.
 * Special characters (@, /, #) are replaced by '::' if they are in the middle of the Stable Id and removed all together if the are part at the beginning or end.
 *
 * @param id String to manipulate
 * @returns String without the special characters
 */
export const replaceSpecialChars = (id: string): string => {
	if (id.indexOf(" ") >= 0) {
		throw Error(`${id} - Spaces are not allowed in ID parts.`);
	}
	id = id
		.replace(/^\/|^@|^#|^\*/, "") // remove special characters from the beginning of the string
		.replace(/\/$|@$|#$|\*$/, "") // remove special characters from the end of the string
		.replace(/\/|@|\(|\)|#|\*/g, "::"); // replace special characters with ::

	// Replace double occurrences of the separator with a single separator
	while (id.indexOf("::::") > -1) {
		id = id.replace("::::", "::");
	}

	// If there is a :: at the end of the ID remove it
	if (id.slice(-2) == "::") {
		id = id.slice(0, -2);
	}

	return id;
};

/**
 * Prepares the Id.
 *
 * Removes namespaces and special characters and checks the validity of this Id.
 *
 * @param id The id
 * @returns The Id or throw an error
 */
export const prepareId = function (id: string) {
	id = replaceSpecialChars(_removeNamespaces(id));
	if (_isValid(id)) {
		return id;
	} else {
		throw Error(`${id} - Stable Id could not be generated due to insufficient information.`);
	}
};
