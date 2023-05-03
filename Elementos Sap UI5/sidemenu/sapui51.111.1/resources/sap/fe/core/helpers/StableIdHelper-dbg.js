/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Generates the Id from an IBN.
   *
   * The id contains the value, the potential action and context.
   *
   * @param dataField The IBN annotation
   * @returns The Id
   */
  const _getStableIdPartFromIBN = dataField => {
    var _dataField$Action;
    const idParts = [dataField.SemanticObject.valueOf(), (_dataField$Action = dataField.Action) === null || _dataField$Action === void 0 ? void 0 : _dataField$Action.valueOf()];
    if (dataField.RequiresContext) {
      idParts.push("RequiresContext");
    }
    return idParts.filter(id => id).join("::");
  };

  /**
   * Generates the Id part related to the value of the dataField.
   *
   * @param dataField The dataField
   * @returns String related to the dataField value
   */
  const _getStableIdPartFromValue = dataField => {
    const value = dataField.Value;
    if (value.path) {
      return value.path;
    } else if (value.Apply && value.Function === "odata.concat") {
      return value.Apply.map(app => app.$Path).join("::");
    }
    return replaceSpecialChars(value.replace(/ /g, "_"));
  };

  /**
   * Copy for the Core.isValid function to be independent.
   *
   * @param value String to validate
   * @returns Whether the value is valid or not
   */
  const _isValid = value => {
    return /^([A-Za-z_][-A-Za-z0-9_.:]*)$/.test(value);
  };

  /**
   * Removes the annotation namespaces.
   *
   * @param id String to manipulate
   * @returns String without the annotation namespaces
   */
  const _removeNamespaces = id => {
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
  const createIdForAnnotation = annotation => {
    let id;
    switch (annotation.$Type) {
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        id = annotation.ID ?? annotation.Target.value;
        break;
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        id = annotation.ID ?? "undefined"; // CollectionFacet without Id is not supported but doesn't necessary fail right now
        break;
      case "com.sap.vocabularies.UI.v1.FieldGroupType":
        id = annotation.Label;
        break;
      default:
        id = getStableIdPartFromDataField(annotation);
        break;
    }
    return id ? prepareId(id) : id;
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
  _exports.createIdForAnnotation = createIdForAnnotation;
  const generate = stableIdParts => {
    const ids = stableIdParts.map(element => {
      if (typeof element === "string" || !element) {
        return element;
      }
      return createIdForAnnotation(element.targetObject || element);
    });
    const result = ids.filter(id => id).join("::");
    return prepareId(result);
  };

  /**
   * Generates the Id from a dataField.
   *
   * @param dataField The dataField
   * @param ignoreForCompatibility Ignore a part of the Id on the DataFieldWithNavigationPath to be aligned with previous version
   * @returns The Id
   */
  _exports.generate = generate;
  const getStableIdPartFromDataField = function (dataField) {
    let ignoreForCompatibility = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let id = "";
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        id = `DataFieldForAction::${dataField.Action}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        id = `DataFieldForIntentBasedNavigation::${_getStableIdPartFromIBN(dataField)}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        id = `DataFieldForAnnotation::${dataField.Target.value}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        id = `DataFieldWithAction::${_getStableIdPartFromValue(dataField)}::${dataField.Action}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataField":
        id = `DataField::${_getStableIdPartFromValue(dataField)}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        id = `DataFieldWithIntentBasedNavigation::${_getStableIdPartFromValue(dataField)}::${_getStableIdPartFromIBN(dataField)}`;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        id = `DataFieldWithNavigationPath::${_getStableIdPartFromValue(dataField)}`;
        if (dataField.Target.type === "NavigationPropertyPath" && !ignoreForCompatibility) {
          id = `${id}::${dataField.Target.value}`;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
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
  _exports.getStableIdPartFromDataField = getStableIdPartFromDataField;
  const replaceSpecialChars = id => {
    if (id.indexOf(" ") >= 0) {
      throw Error(`${id} - Spaces are not allowed in ID parts.`);
    }
    id = id.replace(/^\/|^@|^#|^\*/, "") // remove special characters from the beginning of the string
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
  _exports.replaceSpecialChars = replaceSpecialChars;
  const prepareId = function (id) {
    id = replaceSpecialChars(_removeNamespaces(id));
    if (_isValid(id)) {
      return id;
    } else {
      throw Error(`${id} - Stable Id could not be generated due to insufficient information.`);
    }
  };
  _exports.prepareId = prepareId;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ2V0U3RhYmxlSWRQYXJ0RnJvbUlCTiIsImRhdGFGaWVsZCIsImlkUGFydHMiLCJTZW1hbnRpY09iamVjdCIsInZhbHVlT2YiLCJBY3Rpb24iLCJSZXF1aXJlc0NvbnRleHQiLCJwdXNoIiwiZmlsdGVyIiwiaWQiLCJqb2luIiwiX2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZSIsInZhbHVlIiwiVmFsdWUiLCJwYXRoIiwiQXBwbHkiLCJGdW5jdGlvbiIsIm1hcCIsImFwcCIsIiRQYXRoIiwicmVwbGFjZVNwZWNpYWxDaGFycyIsInJlcGxhY2UiLCJfaXNWYWxpZCIsInRlc3QiLCJfcmVtb3ZlTmFtZXNwYWNlcyIsImNyZWF0ZUlkRm9yQW5ub3RhdGlvbiIsImFubm90YXRpb24iLCIkVHlwZSIsIklEIiwiVGFyZ2V0IiwiTGFiZWwiLCJnZXRTdGFibGVJZFBhcnRGcm9tRGF0YUZpZWxkIiwicHJlcGFyZUlkIiwiZ2VuZXJhdGUiLCJzdGFibGVJZFBhcnRzIiwiaWRzIiwiZWxlbWVudCIsInRhcmdldE9iamVjdCIsInJlc3VsdCIsImlnbm9yZUZvckNvbXBhdGliaWxpdHkiLCJ0eXBlIiwidW5kZWZpbmVkIiwiaW5kZXhPZiIsIkVycm9yIiwic2xpY2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlN0YWJsZUlkSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHREYXRhRmllbGRXaXRoQWN0aW9uLFxuXHREYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHREYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGgsXG5cdERhdGFGaWVsZFdpdGhVcmwsXG5cdEZhY2V0VHlwZXMsXG5cdEZpZWxkR3JvdXAsXG5cdFVJQW5ub3RhdGlvblR5cGVzXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwiLi4vdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5cbmV4cG9ydCB0eXBlIEF1dGhvcml6ZWRJZEFubm90YXRpb25zVHlwZSA9IEZhY2V0VHlwZXMgfCBGaWVsZEdyb3VwIHwgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIElkIGZyb20gYW4gSUJOLlxuICpcbiAqIFRoZSBpZCBjb250YWlucyB0aGUgdmFsdWUsIHRoZSBwb3RlbnRpYWwgYWN0aW9uIGFuZCBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIElCTiBhbm5vdGF0aW9uXG4gKiBAcmV0dXJucyBUaGUgSWRcbiAqL1xuY29uc3QgX2dldFN0YWJsZUlkUGFydEZyb21JQk4gPSAoZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gfCBEYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uKSA9PiB7XG5cdGNvbnN0IGlkUGFydHMgPSBbZGF0YUZpZWxkLlNlbWFudGljT2JqZWN0LnZhbHVlT2YoKSwgZGF0YUZpZWxkLkFjdGlvbj8udmFsdWVPZigpXTtcblx0aWYgKChkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKS5SZXF1aXJlc0NvbnRleHQpIHtcblx0XHRpZFBhcnRzLnB1c2goXCJSZXF1aXJlc0NvbnRleHRcIik7XG5cdH1cblx0cmV0dXJuIGlkUGFydHMuZmlsdGVyKChpZCkgPT4gaWQpLmpvaW4oXCI6OlwiKTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBJZCBwYXJ0IHJlbGF0ZWQgdG8gdGhlIHZhbHVlIG9mIHRoZSBkYXRhRmllbGQuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgZGF0YUZpZWxkXG4gKiBAcmV0dXJucyBTdHJpbmcgcmVsYXRlZCB0byB0aGUgZGF0YUZpZWxkIHZhbHVlXG4gKi9cbmNvbnN0IF9nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUgPSAoXG5cdGRhdGFGaWVsZDogRGF0YUZpZWxkIHwgRGF0YUZpZWxkV2l0aEFjdGlvbiB8IERhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb24gfCBEYXRhRmllbGRXaXRoVXJsIHwgRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXG4pOiBzdHJpbmcgPT4ge1xuXHRjb25zdCB2YWx1ZSA9IGRhdGFGaWVsZC5WYWx1ZTtcblx0aWYgKHZhbHVlLnBhdGgpIHtcblx0XHRyZXR1cm4gdmFsdWUucGF0aCBhcyBzdHJpbmc7XG5cdH0gZWxzZSBpZiAodmFsdWUuQXBwbHkgJiYgdmFsdWUuRnVuY3Rpb24gPT09IFwib2RhdGEuY29uY2F0XCIpIHtcblx0XHRyZXR1cm4gdmFsdWUuQXBwbHkubWFwKChhcHA6IGFueSkgPT4gYXBwLiRQYXRoIGFzIHN0cmluZyB8IHVuZGVmaW5lZCkuam9pbihcIjo6XCIpO1xuXHR9XG5cdHJldHVybiByZXBsYWNlU3BlY2lhbENoYXJzKHZhbHVlLnJlcGxhY2UoLyAvZywgXCJfXCIpKTtcbn07XG5cbi8qKlxuICogQ29weSBmb3IgdGhlIENvcmUuaXNWYWxpZCBmdW5jdGlvbiB0byBiZSBpbmRlcGVuZGVudC5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgU3RyaW5nIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB2YWx1ZSBpcyB2YWxpZCBvciBub3RcbiAqL1xuY29uc3QgX2lzVmFsaWQgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuXHRyZXR1cm4gL14oW0EtWmEtel9dWy1BLVphLXowLTlfLjpdKikkLy50ZXN0KHZhbHVlKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgYW5ub3RhdGlvbiBuYW1lc3BhY2VzLlxuICpcbiAqIEBwYXJhbSBpZCBTdHJpbmcgdG8gbWFuaXB1bGF0ZVxuICogQHJldHVybnMgU3RyaW5nIHdpdGhvdXQgdGhlIGFubm90YXRpb24gbmFtZXNwYWNlc1xuICovXG5jb25zdCBfcmVtb3ZlTmFtZXNwYWNlcyA9IChpZDogc3RyaW5nKSA9PiB7XG5cdGlkID0gaWQucmVwbGFjZShcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlwiLCBcIlwiKTtcblx0aWQgPSBpZC5yZXBsYWNlKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5cIiwgXCJcIik7XG5cdHJldHVybiBpZDtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBJZCBmcm9tIGFuIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGFubm90YXRpb24gVGhlIGFubm90YXRpb25cbiAqIEByZXR1cm5zIFRoZSBJZFxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlSWRGb3JBbm5vdGF0aW9uID0gKGFubm90YXRpb246IEF1dGhvcml6ZWRJZEFubm90YXRpb25zVHlwZSkgPT4ge1xuXHRsZXQgaWQ7XG5cdHN3aXRjaCAoYW5ub3RhdGlvbi4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQ6XG5cdFx0XHRpZCA9IGFubm90YXRpb24uSUQgPz8gYW5ub3RhdGlvbi5UYXJnZXQudmFsdWU7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkNvbGxlY3Rpb25GYWNldDpcblx0XHRcdGlkID0gYW5ub3RhdGlvbi5JRCA/PyBcInVuZGVmaW5lZFwiOyAvLyBDb2xsZWN0aW9uRmFjZXQgd2l0aG91dCBJZCBpcyBub3Qgc3VwcG9ydGVkIGJ1dCBkb2Vzbid0IG5lY2Vzc2FyeSBmYWlsIHJpZ2h0IG5vd1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5GaWVsZEdyb3VwVHlwZTpcblx0XHRcdGlkID0gYW5ub3RhdGlvbi5MYWJlbDtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRpZCA9IGdldFN0YWJsZUlkUGFydEZyb21EYXRhRmllbGQoYW5ub3RhdGlvbiBhcyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKTtcblx0XHRcdGJyZWFrO1xuXHR9XG5cdHJldHVybiBpZCA/IHByZXBhcmVJZChpZCBhcyBzdHJpbmcpIDogaWQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHN0YWJsZSBJZCBiYXNlZCBvbiB0aGUgZ2l2ZW4gcGFyYW1ldGVycy5cbiAqXG4gKiBwYXJhbWV0ZXJzIGFyZSBjb21iaW5lZCBpbiB0aGUgc2FtZSBvcmRlciB0aGF0IHRoZXkgYXJlIHByb3ZpZGVkIGFuZCBhcmUgc2VwYXJhdGVkIGJ5ICc6OicuXG4gKiBnZW5lcmF0ZShbJ1N0YWJsZScsICdJZCddKSB3b3VsZCByZXN1bHQgaW4gJ1N0YWJsZTo6SWQnIGFzIHRoZSBTdGFibGUgSWQuXG4gKiBDdXJyZW50bHkgc3VwcG9ydGVkIGFubm90YXRpb25zIGFyZSBGYWNldHMsIEZpZWxkR3JvdXAgYW5kIGFsbCBraW5kcyBvZiBEYXRhRmllbGQuXG4gKlxuICogQHBhcmFtIHN0YWJsZUlkUGFydHMgQXJyYXkgb2Ygc3RyaW5ncywgdW5kZWZpbmVkLCBkYXRhTW9kZWxPYmplY3RQYXRoIG9yIGFubm90YXRpb25zXG4gKiBAcmV0dXJucyBTdGFibGUgSWQgY29uc3RydWN0ZWQgZnJvbSB0aGUgcHJvdmlkZWQgcGFyYW1ldGVyc1xuICovXG5leHBvcnQgY29uc3QgZ2VuZXJhdGUgPSAoc3RhYmxlSWRQYXJ0czogQXJyYXk8c3RyaW5nIHwgdW5kZWZpbmVkIHwgRGF0YU1vZGVsT2JqZWN0UGF0aCB8IEF1dGhvcml6ZWRJZEFubm90YXRpb25zVHlwZT4pID0+IHtcblx0Y29uc3QgaWRzOiAoc3RyaW5nIHwgdW5kZWZpbmVkKVtdID0gc3RhYmxlSWRQYXJ0cy5tYXAoKGVsZW1lbnQpID0+IHtcblx0XHRpZiAodHlwZW9mIGVsZW1lbnQgPT09IFwic3RyaW5nXCIgfHwgIWVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBlbGVtZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gY3JlYXRlSWRGb3JBbm5vdGF0aW9uKChlbGVtZW50IGFzIERhdGFNb2RlbE9iamVjdFBhdGgpLnRhcmdldE9iamVjdCB8fCBlbGVtZW50KTtcblx0fSk7XG5cdGNvbnN0IHJlc3VsdCA9IGlkcy5maWx0ZXIoKGlkKSA9PiBpZCkuam9pbihcIjo6XCIpO1xuXHRyZXR1cm4gcHJlcGFyZUlkKHJlc3VsdCk7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgSWQgZnJvbSBhIGRhdGFGaWVsZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBkYXRhRmllbGRcbiAqIEBwYXJhbSBpZ25vcmVGb3JDb21wYXRpYmlsaXR5IElnbm9yZSBhIHBhcnQgb2YgdGhlIElkIG9uIHRoZSBEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGggdG8gYmUgYWxpZ25lZCB3aXRoIHByZXZpb3VzIHZlcnNpb25cbiAqIEByZXR1cm5zIFRoZSBJZFxuICovXG5leHBvcnQgY29uc3QgZ2V0U3RhYmxlSWRQYXJ0RnJvbURhdGFGaWVsZCA9IChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIGlnbm9yZUZvckNvbXBhdGliaWxpdHkgPSBmYWxzZSk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG5cdGxldCBpZCA9IFwiXCI7XG5cdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRGb3JBY3Rpb246OiR7ZGF0YUZpZWxkLkFjdGlvbn1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246OiR7X2dldFN0YWJsZUlkUGFydEZyb21JQk4oZGF0YUZpZWxkKX1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0aWQgPSBgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjo6JHtkYXRhRmllbGQuVGFyZ2V0LnZhbHVlfWA7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoQWN0aW9uOjoke19nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUoZGF0YUZpZWxkKX06OiR7ZGF0YUZpZWxkLkFjdGlvbn1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0XHRpZCA9IGBEYXRhRmllbGQ6OiR7X2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZShkYXRhRmllbGQpfWA7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOjoke19nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUoZGF0YUZpZWxkKX06OiR7X2dldFN0YWJsZUlkUGFydEZyb21JQk4oZGF0YUZpZWxkKX1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6OiR7X2dldFN0YWJsZUlkUGFydEZyb21WYWx1ZShkYXRhRmllbGQpfWA7XG5cdFx0XHRpZiAoZGF0YUZpZWxkLlRhcmdldC50eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIiAmJiAhaWdub3JlRm9yQ29tcGF0aWJpbGl0eSkge1xuXHRcdFx0XHRpZCA9IGAke2lkfTo6JHtkYXRhRmllbGQuVGFyZ2V0LnZhbHVlfWA7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0XHRpZCA9IGBEYXRhRmllbGRXaXRoVXJsOjoke19nZXRTdGFibGVJZFBhcnRGcm9tVmFsdWUoZGF0YUZpZWxkKX1gO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG5cdHJldHVybiBpZCA/IHByZXBhcmVJZChpZCkgOiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgb3IgcmVwbGFjZXMgd2l0aCBcIjo6XCIgc29tZSBzcGVjaWFsIGNoYXJhY3RlcnMuXG4gKiBTcGVjaWFsIGNoYXJhY3RlcnMgKEAsIC8sICMpIGFyZSByZXBsYWNlZCBieSAnOjonIGlmIHRoZXkgYXJlIGluIHRoZSBtaWRkbGUgb2YgdGhlIFN0YWJsZSBJZCBhbmQgcmVtb3ZlZCBhbGwgdG9nZXRoZXIgaWYgdGhlIGFyZSBwYXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3IgZW5kLlxuICpcbiAqIEBwYXJhbSBpZCBTdHJpbmcgdG8gbWFuaXB1bGF0ZVxuICogQHJldHVybnMgU3RyaW5nIHdpdGhvdXQgdGhlIHNwZWNpYWwgY2hhcmFjdGVyc1xuICovXG5leHBvcnQgY29uc3QgcmVwbGFjZVNwZWNpYWxDaGFycyA9IChpZDogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0aWYgKGlkLmluZGV4T2YoXCIgXCIpID49IDApIHtcblx0XHR0aHJvdyBFcnJvcihgJHtpZH0gLSBTcGFjZXMgYXJlIG5vdCBhbGxvd2VkIGluIElEIHBhcnRzLmApO1xuXHR9XG5cdGlkID0gaWRcblx0XHQucmVwbGFjZSgvXlxcL3xeQHxeI3xeXFwqLywgXCJcIikgLy8gcmVtb3ZlIHNwZWNpYWwgY2hhcmFjdGVycyBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuXHRcdC5yZXBsYWNlKC9cXC8kfEAkfCMkfFxcKiQvLCBcIlwiKSAvLyByZW1vdmUgc3BlY2lhbCBjaGFyYWN0ZXJzIGZyb20gdGhlIGVuZCBvZiB0aGUgc3RyaW5nXG5cdFx0LnJlcGxhY2UoL1xcL3xAfFxcKHxcXCl8I3xcXCovZywgXCI6OlwiKTsgLy8gcmVwbGFjZSBzcGVjaWFsIGNoYXJhY3RlcnMgd2l0aCA6OlxuXG5cdC8vIFJlcGxhY2UgZG91YmxlIG9jY3VycmVuY2VzIG9mIHRoZSBzZXBhcmF0b3Igd2l0aCBhIHNpbmdsZSBzZXBhcmF0b3Jcblx0d2hpbGUgKGlkLmluZGV4T2YoXCI6Ojo6XCIpID4gLTEpIHtcblx0XHRpZCA9IGlkLnJlcGxhY2UoXCI6Ojo6XCIsIFwiOjpcIik7XG5cdH1cblxuXHQvLyBJZiB0aGVyZSBpcyBhIDo6IGF0IHRoZSBlbmQgb2YgdGhlIElEIHJlbW92ZSBpdFxuXHRpZiAoaWQuc2xpY2UoLTIpID09IFwiOjpcIikge1xuXHRcdGlkID0gaWQuc2xpY2UoMCwgLTIpO1xuXHR9XG5cblx0cmV0dXJuIGlkO1xufTtcblxuLyoqXG4gKiBQcmVwYXJlcyB0aGUgSWQuXG4gKlxuICogUmVtb3ZlcyBuYW1lc3BhY2VzIGFuZCBzcGVjaWFsIGNoYXJhY3RlcnMgYW5kIGNoZWNrcyB0aGUgdmFsaWRpdHkgb2YgdGhpcyBJZC5cbiAqXG4gKiBAcGFyYW0gaWQgVGhlIGlkXG4gKiBAcmV0dXJucyBUaGUgSWQgb3IgdGhyb3cgYW4gZXJyb3JcbiAqL1xuZXhwb3J0IGNvbnN0IHByZXBhcmVJZCA9IGZ1bmN0aW9uIChpZDogc3RyaW5nKSB7XG5cdGlkID0gcmVwbGFjZVNwZWNpYWxDaGFycyhfcmVtb3ZlTmFtZXNwYWNlcyhpZCkpO1xuXHRpZiAoX2lzVmFsaWQoaWQpKSB7XG5cdFx0cmV0dXJuIGlkO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IEVycm9yKGAke2lkfSAtIFN0YWJsZSBJZCBjb3VsZCBub3QgYmUgZ2VuZXJhdGVkIGR1ZSB0byBpbnN1ZmZpY2llbnQgaW5mb3JtYXRpb24uYCk7XG5cdH1cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBZ0JBO0FBQ0E7QUFDQTtB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