/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "../../../helpers/StableIdHelper", "../../helpers/ConfigurableObject", "../../helpers/DataFieldHelper", "../../helpers/ID", "../../helpers/Key", "../../ManifestSettings"], function (DataField, BindingToolkit, ModelHelper, DataModelPathHelper, StableIdHelper, ConfigurableObject, DataFieldHelper, ID, Key, ManifestSettings) {
  "use strict";

  var _exports = {};
  var ActionType = ManifestSettings.ActionType;
  var KeyHelper = Key.KeyHelper;
  var getFormStandardActionButtonID = ID.getFormStandardActionButtonID;
  var getFormID = ID.getFormID;
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var createIdForAnnotation = StableIdHelper.createIdForAnnotation;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getTargetEntitySetPath = DataModelPathHelper.getTargetEntitySetPath;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var getSemanticObjectPath = DataField.getSemanticObjectPath;
  let FormElementType;
  (function (FormElementType) {
    FormElementType["Default"] = "Default";
    FormElementType["Slot"] = "Slot";
    FormElementType["Annotation"] = "Annotation";
  })(FormElementType || (FormElementType = {}));
  _exports.FormElementType = FormElementType;
  /**
   * Returns default format options for text fields on a form.
   *
   * @returns Collection of format options with default values
   */
  function getDefaultFormatOptionsForForm() {
    return {
      textLinesEdit: 4
    };
  }
  function isFieldPartOfPreview(field, formPartOfPreview) {
    var _field$annotations, _field$annotations$UI, _field$annotations2, _field$annotations2$U;
    // Both each form and field can have the PartOfPreview annotation. Only if the form is not hidden (not partOfPreview) we allow toggling on field level
    return (formPartOfPreview === null || formPartOfPreview === void 0 ? void 0 : formPartOfPreview.valueOf()) === false || ((_field$annotations = field.annotations) === null || _field$annotations === void 0 ? void 0 : (_field$annotations$UI = _field$annotations.UI) === null || _field$annotations$UI === void 0 ? void 0 : _field$annotations$UI.PartOfPreview) === undefined || ((_field$annotations2 = field.annotations) === null || _field$annotations2 === void 0 ? void 0 : (_field$annotations2$U = _field$annotations2.UI) === null || _field$annotations2$U === void 0 ? void 0 : _field$annotations2$U.PartOfPreview.valueOf()) === true;
  }
  function getFormElementsFromAnnotations(facetDefinition, converterContext) {
    const formElements = [];
    const resolvedTarget = converterContext.getEntityTypeAnnotation(facetDefinition.Target.value);
    const formAnnotation = resolvedTarget.annotation;
    converterContext = resolvedTarget.converterContext;
    function getDataFieldsFromAnnotations(field, formPartOfPreview) {
      var _field$annotations3, _field$annotations3$U, _field$annotations3$U2;
      const semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, field);
      if (field.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForAction" && field.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !isReferencePropertyStaticallyHidden(field) && ((_field$annotations3 = field.annotations) === null || _field$annotations3 === void 0 ? void 0 : (_field$annotations3$U = _field$annotations3.UI) === null || _field$annotations3$U === void 0 ? void 0 : (_field$annotations3$U2 = _field$annotations3$U.Hidden) === null || _field$annotations3$U2 === void 0 ? void 0 : _field$annotations3$U2.valueOf()) !== true) {
        const formElement = {
          key: KeyHelper.generateKeyFromDataField(field),
          type: FormElementType.Annotation,
          annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(field.fullyQualifiedName)}/`,
          semanticObjectPath: semanticObjectAnnotationPath,
          formatOptions: getDefaultFormatOptionsForForm(),
          isPartOfPreview: isFieldPartOfPreview(field, formPartOfPreview)
        };
        if (field.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && field.Target.$target.$Type === "com.sap.vocabularies.UI.v1.ConnectedFieldsType") {
          const connectedFields = Object.values(field.Target.$target.Data).filter(connectedField => connectedField === null || connectedField === void 0 ? void 0 : connectedField.hasOwnProperty("Value"));
          formElement.connectedFields = connectedFields.map(connnectedFieldElement => {
            return {
              semanticObjectPath: getSemanticObjectPath(converterContext, connnectedFieldElement)
            };
          });
        }
        formElements.push(formElement);
      }
    }
    switch (formAnnotation === null || formAnnotation === void 0 ? void 0 : formAnnotation.term) {
      case "com.sap.vocabularies.UI.v1.FieldGroup":
        formAnnotation.Data.forEach(field => {
          var _facetDefinition$anno, _facetDefinition$anno2;
          return getDataFieldsFromAnnotations(field, (_facetDefinition$anno = facetDefinition.annotations) === null || _facetDefinition$anno === void 0 ? void 0 : (_facetDefinition$anno2 = _facetDefinition$anno.UI) === null || _facetDefinition$anno2 === void 0 ? void 0 : _facetDefinition$anno2.PartOfPreview);
        });
        break;
      case "com.sap.vocabularies.UI.v1.Identification":
        formAnnotation.forEach(field => {
          var _facetDefinition$anno3, _facetDefinition$anno4;
          return getDataFieldsFromAnnotations(field, (_facetDefinition$anno3 = facetDefinition.annotations) === null || _facetDefinition$anno3 === void 0 ? void 0 : (_facetDefinition$anno4 = _facetDefinition$anno3.UI) === null || _facetDefinition$anno4 === void 0 ? void 0 : _facetDefinition$anno4.PartOfPreview);
        });
        break;
      case "com.sap.vocabularies.UI.v1.DataPoint":
        formElements.push({
          // key: KeyHelper.generateKeyFromDataField(formAnnotation),
          key: `DataPoint::${formAnnotation.qualifier ? formAnnotation.qualifier : ""}`,
          type: FormElementType.Annotation,
          annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(formAnnotation.fullyQualifiedName)}/`
        });
        break;
      case "com.sap.vocabularies.Communication.v1.Contact":
        formElements.push({
          // key: KeyHelper.generateKeyFromDataField(formAnnotation),
          key: `Contact::${formAnnotation.qualifier ? formAnnotation.qualifier : ""}`,
          type: FormElementType.Annotation,
          annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(formAnnotation.fullyQualifiedName)}/`
        });
        break;
      default:
        break;
    }
    return formElements;
  }
  function getFormElementsFromManifest(facetDefinition, converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    const manifestFormContainer = manifestWrapper.getFormContainer(facetDefinition.Target.value);
    const formElements = {};
    if (manifestFormContainer !== null && manifestFormContainer !== void 0 && manifestFormContainer.fields) {
      Object.keys(manifestFormContainer === null || manifestFormContainer === void 0 ? void 0 : manifestFormContainer.fields).forEach(fieldId => {
        formElements[fieldId] = {
          key: fieldId,
          id: `CustomFormElement::${fieldId}`,
          type: manifestFormContainer.fields[fieldId].type || FormElementType.Default,
          template: manifestFormContainer.fields[fieldId].template,
          label: manifestFormContainer.fields[fieldId].label,
          position: manifestFormContainer.fields[fieldId].position || {
            placement: Placement.After
          },
          formatOptions: {
            ...getDefaultFormatOptionsForForm(),
            ...manifestFormContainer.fields[fieldId].formatOptions
          }
        };
      });
    }
    return formElements;
  }
  _exports.getFormElementsFromManifest = getFormElementsFromManifest;
  function getFormContainer(facetDefinition, converterContext, actions) {
    var _facetDefinition$anno5, _facetDefinition$anno6, _resolvedTarget$conve, _facetDefinition$anno7, _facetDefinition$anno8, _facetDefinition$anno9;
    const sFormContainerId = createIdForAnnotation(facetDefinition);
    const sAnnotationPath = converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName);
    const resolvedTarget = converterContext.getEntityTypeAnnotation(facetDefinition.Target.value);
    const isVisible = compileExpression(not(equal(true, getExpressionFromAnnotation((_facetDefinition$anno5 = facetDefinition.annotations) === null || _facetDefinition$anno5 === void 0 ? void 0 : (_facetDefinition$anno6 = _facetDefinition$anno5.UI) === null || _facetDefinition$anno6 === void 0 ? void 0 : _facetDefinition$anno6.Hidden))));
    let sEntitySetPath;
    // resolvedTarget doesn't have a entitySet in case Containments and Paramterized services.
    if (resolvedTarget.converterContext.getEntitySet() && resolvedTarget.converterContext.getEntitySet() !== converterContext.getEntitySet()) {
      sEntitySetPath = getTargetEntitySetPath(resolvedTarget.converterContext.getDataModelObjectPath());
    } else if (((_resolvedTarget$conve = resolvedTarget.converterContext.getDataModelObjectPath().targetObject) === null || _resolvedTarget$conve === void 0 ? void 0 : _resolvedTarget$conve.containsTarget) === true) {
      sEntitySetPath = getTargetObjectPath(resolvedTarget.converterContext.getDataModelObjectPath(), false);
    } else if (resolvedTarget.converterContext.getEntitySet() && !sEntitySetPath && ModelHelper.isSingleton(resolvedTarget.converterContext.getEntitySet())) {
      var _resolvedTarget$conve2;
      sEntitySetPath = (_resolvedTarget$conve2 = resolvedTarget.converterContext.getEntitySet()) === null || _resolvedTarget$conve2 === void 0 ? void 0 : _resolvedTarget$conve2.fullyQualifiedName;
    }
    const aFormElements = insertCustomElements(getFormElementsFromAnnotations(facetDefinition, converterContext), getFormElementsFromManifest(facetDefinition, converterContext), {
      formatOptions: OverrideType.overwrite
    });
    actions = actions !== undefined ? actions.filter(action => action.facetName == facetDefinition.fullyQualifiedName) : [];
    if (actions.length === 0) {
      actions = undefined;
    }
    const oActionShowDetails = {
      id: getFormStandardActionButtonID(sFormContainerId, "ShowHideDetails"),
      key: "StandardAction::ShowHideDetails",
      text: compileExpression(ifElse(equal(pathInModel("showDetails", "internal"), true), pathInModel("T_COMMON_OBJECT_PAGE_HIDE_FORM_CONTAINER_DETAILS", "sap.fe.i18n"), pathInModel("T_COMMON_OBJECT_PAGE_SHOW_FORM_CONTAINER_DETAILS", "sap.fe.i18n"))),
      type: ActionType.ShowFormDetails,
      press: "FormContainerRuntime.toggleDetails"
    };
    if (((_facetDefinition$anno7 = facetDefinition.annotations) === null || _facetDefinition$anno7 === void 0 ? void 0 : (_facetDefinition$anno8 = _facetDefinition$anno7.UI) === null || _facetDefinition$anno8 === void 0 ? void 0 : (_facetDefinition$anno9 = _facetDefinition$anno8.PartOfPreview) === null || _facetDefinition$anno9 === void 0 ? void 0 : _facetDefinition$anno9.valueOf()) !== false && aFormElements.some(oFormElement => oFormElement.isPartOfPreview === false)) {
      if (actions !== undefined) {
        actions.push(oActionShowDetails);
      } else {
        actions = [oActionShowDetails];
      }
    }
    return {
      id: sFormContainerId,
      formElements: aFormElements,
      annotationPath: sAnnotationPath,
      isVisible: isVisible,
      entitySet: sEntitySetPath,
      actions: actions
    };
  }
  _exports.getFormContainer = getFormContainer;
  function getFormContainersForCollection(facetDefinition, converterContext, actions) {
    var _facetDefinition$Face;
    const formContainers = [];
    (_facetDefinition$Face = facetDefinition.Facets) === null || _facetDefinition$Face === void 0 ? void 0 : _facetDefinition$Face.forEach(facet => {
      // Ignore level 3 collection facet
      if (facet.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet") {
        return;
      }
      formContainers.push(getFormContainer(facet, converterContext, actions));
    });
    return formContainers;
  }
  function isReferenceFacet(facetDefinition) {
    return facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet";
  }
  _exports.isReferenceFacet = isReferenceFacet;
  function createFormDefinition(facetDefinition, isVisible, converterContext, actions) {
    var _facetDefinition$anno10, _facetDefinition$anno11, _facetDefinition$anno12;
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        // Keep only valid children
        return {
          id: getFormID(facetDefinition),
          useFormContainerLabels: true,
          hasFacetsNotPartOfPreview: facetDefinition.Facets.some(childFacet => {
            var _childFacet$annotatio, _childFacet$annotatio2, _childFacet$annotatio3;
            return ((_childFacet$annotatio = childFacet.annotations) === null || _childFacet$annotatio === void 0 ? void 0 : (_childFacet$annotatio2 = _childFacet$annotatio.UI) === null || _childFacet$annotatio2 === void 0 ? void 0 : (_childFacet$annotatio3 = _childFacet$annotatio2.PartOfPreview) === null || _childFacet$annotatio3 === void 0 ? void 0 : _childFacet$annotatio3.valueOf()) === false;
          }),
          formContainers: getFormContainersForCollection(facetDefinition, converterContext, actions),
          isVisible: isVisible
        };
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        return {
          id: getFormID(facetDefinition),
          useFormContainerLabels: false,
          hasFacetsNotPartOfPreview: ((_facetDefinition$anno10 = facetDefinition.annotations) === null || _facetDefinition$anno10 === void 0 ? void 0 : (_facetDefinition$anno11 = _facetDefinition$anno10.UI) === null || _facetDefinition$anno11 === void 0 ? void 0 : (_facetDefinition$anno12 = _facetDefinition$anno11.PartOfPreview) === null || _facetDefinition$anno12 === void 0 ? void 0 : _facetDefinition$anno12.valueOf()) === false,
          formContainers: [getFormContainer(facetDefinition, converterContext, actions)],
          isVisible: isVisible
        };
      default:
        throw new Error("Cannot create form based on ReferenceURLFacet");
    }
  }
  _exports.createFormDefinition = createFormDefinition;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtRWxlbWVudFR5cGUiLCJnZXREZWZhdWx0Rm9ybWF0T3B0aW9uc0ZvckZvcm0iLCJ0ZXh0TGluZXNFZGl0IiwiaXNGaWVsZFBhcnRPZlByZXZpZXciLCJmaWVsZCIsImZvcm1QYXJ0T2ZQcmV2aWV3IiwidmFsdWVPZiIsImFubm90YXRpb25zIiwiVUkiLCJQYXJ0T2ZQcmV2aWV3IiwidW5kZWZpbmVkIiwiZ2V0Rm9ybUVsZW1lbnRzRnJvbUFubm90YXRpb25zIiwiZmFjZXREZWZpbml0aW9uIiwiY29udmVydGVyQ29udGV4dCIsImZvcm1FbGVtZW50cyIsInJlc29sdmVkVGFyZ2V0IiwiZ2V0RW50aXR5VHlwZUFubm90YXRpb24iLCJUYXJnZXQiLCJ2YWx1ZSIsImZvcm1Bbm5vdGF0aW9uIiwiYW5ub3RhdGlvbiIsImdldERhdGFGaWVsZHNGcm9tQW5ub3RhdGlvbnMiLCJzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoIiwiZ2V0U2VtYW50aWNPYmplY3RQYXRoIiwiJFR5cGUiLCJpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbiIsIkhpZGRlbiIsImZvcm1FbGVtZW50Iiwia2V5IiwiS2V5SGVscGVyIiwiZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkIiwidHlwZSIsIkFubm90YXRpb24iLCJhbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJzZW1hbnRpY09iamVjdFBhdGgiLCJmb3JtYXRPcHRpb25zIiwiaXNQYXJ0T2ZQcmV2aWV3IiwiJHRhcmdldCIsImNvbm5lY3RlZEZpZWxkcyIsIk9iamVjdCIsInZhbHVlcyIsIkRhdGEiLCJmaWx0ZXIiLCJjb25uZWN0ZWRGaWVsZCIsImhhc093blByb3BlcnR5IiwibWFwIiwiY29ubm5lY3RlZEZpZWxkRWxlbWVudCIsInB1c2giLCJ0ZXJtIiwiZm9yRWFjaCIsInF1YWxpZmllciIsImdldEZvcm1FbGVtZW50c0Zyb21NYW5pZmVzdCIsIm1hbmlmZXN0V3JhcHBlciIsImdldE1hbmlmZXN0V3JhcHBlciIsIm1hbmlmZXN0Rm9ybUNvbnRhaW5lciIsImdldEZvcm1Db250YWluZXIiLCJmaWVsZHMiLCJrZXlzIiwiZmllbGRJZCIsImlkIiwiRGVmYXVsdCIsInRlbXBsYXRlIiwibGFiZWwiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwiYWN0aW9ucyIsInNGb3JtQ29udGFpbmVySWQiLCJjcmVhdGVJZEZvckFubm90YXRpb24iLCJzQW5ub3RhdGlvblBhdGgiLCJpc1Zpc2libGUiLCJjb21waWxlRXhwcmVzc2lvbiIsIm5vdCIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwic0VudGl0eVNldFBhdGgiLCJnZXRFbnRpdHlTZXQiLCJnZXRUYXJnZXRFbnRpdHlTZXRQYXRoIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsInRhcmdldE9iamVjdCIsImNvbnRhaW5zVGFyZ2V0IiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsIk1vZGVsSGVscGVyIiwiaXNTaW5nbGV0b24iLCJhRm9ybUVsZW1lbnRzIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJPdmVycmlkZVR5cGUiLCJvdmVyd3JpdGUiLCJhY3Rpb24iLCJmYWNldE5hbWUiLCJsZW5ndGgiLCJvQWN0aW9uU2hvd0RldGFpbHMiLCJnZXRGb3JtU3RhbmRhcmRBY3Rpb25CdXR0b25JRCIsInRleHQiLCJpZkVsc2UiLCJwYXRoSW5Nb2RlbCIsIkFjdGlvblR5cGUiLCJTaG93Rm9ybURldGFpbHMiLCJwcmVzcyIsInNvbWUiLCJvRm9ybUVsZW1lbnQiLCJlbnRpdHlTZXQiLCJnZXRGb3JtQ29udGFpbmVyc0ZvckNvbGxlY3Rpb24iLCJmb3JtQ29udGFpbmVycyIsIkZhY2V0cyIsImZhY2V0IiwiaXNSZWZlcmVuY2VGYWNldCIsImNyZWF0ZUZvcm1EZWZpbml0aW9uIiwiZ2V0Rm9ybUlEIiwidXNlRm9ybUNvbnRhaW5lckxhYmVscyIsImhhc0ZhY2V0c05vdFBhcnRPZlByZXZpZXciLCJjaGlsZEZhY2V0IiwiRXJyb3IiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZvcm0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb250YWN0IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uXCI7XG5pbXBvcnQgeyBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uXCI7XG5pbXBvcnQgdHlwZSB7XG5cdENvbGxlY3Rpb25GYWNldFR5cGVzLFxuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhUG9pbnQsXG5cdEZhY2V0VHlwZXMsXG5cdEZpZWxkR3JvdXAsXG5cdElkZW50aWZpY2F0aW9uLFxuXHRQYXJ0T2ZQcmV2aWV3LFxuXHRSZWZlcmVuY2VGYWNldFR5cGVzXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IGdldFNlbWFudGljT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2Fubm90YXRpb25zL0RhdGFGaWVsZFwiO1xuaW1wb3J0IHR5cGUgeyBCYXNlQWN0aW9uLCBDb252ZXJ0ZXJBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBlcXVhbCwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLCBpZkVsc2UsIG5vdCwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRUYXJnZXRFbnRpdHlTZXRQYXRoLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgY3JlYXRlSWRGb3JBbm5vdGF0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlndXJhYmxlT2JqZWN0LCBDdXN0b21FbGVtZW50IH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBpbnNlcnRDdXN0b21FbGVtZW50cywgT3ZlcnJpZGVUeXBlLCBQbGFjZW1lbnQgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvRGF0YUZpZWxkSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRGb3JtSUQsIGdldEZvcm1TdGFuZGFyZEFjdGlvbkJ1dHRvbklEIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB7IEtleUhlbHBlciB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHR5cGUgeyBGb3JtYXRPcHRpb25zVHlwZSwgRm9ybU1hbmlmZXN0Q29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcblxuZXhwb3J0IHR5cGUgRm9ybURlZmluaXRpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHVzZUZvcm1Db250YWluZXJMYWJlbHM6IGJvb2xlYW47XG5cdGhhc0ZhY2V0c05vdFBhcnRPZlByZXZpZXc6IGJvb2xlYW47XG5cdGZvcm1Db250YWluZXJzOiBGb3JtQ29udGFpbmVyW107XG5cdGlzVmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG59O1xuXG5leHBvcnQgZW51bSBGb3JtRWxlbWVudFR5cGUge1xuXHREZWZhdWx0ID0gXCJEZWZhdWx0XCIsXG5cdFNsb3QgPSBcIlNsb3RcIixcblx0QW5ub3RhdGlvbiA9IFwiQW5ub3RhdGlvblwiXG59XG5cbmV4cG9ydCB0eXBlIEJhc2VGb3JtRWxlbWVudCA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0aWQ/OiBzdHJpbmc7XG5cdHR5cGU6IEZvcm1FbGVtZW50VHlwZTtcblx0bGFiZWw/OiBzdHJpbmc7XG5cdHZpc2libGU/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0Zm9ybWF0T3B0aW9ucz86IEZvcm1hdE9wdGlvbnNUeXBlO1xufTtcblxuZXhwb3J0IHR5cGUgQW5ub3RhdGlvbkZvcm1FbGVtZW50ID0gQmFzZUZvcm1FbGVtZW50ICYge1xuXHRpZFByZWZpeD86IHN0cmluZztcblx0YW5ub3RhdGlvblBhdGg/OiBzdHJpbmc7XG5cdGlzVmFsdWVNdWx0aWxpbmVUZXh0PzogYm9vbGVhbjtcblx0c2VtYW50aWNPYmplY3RQYXRoPzogc3RyaW5nO1xuXHRjb25uZWN0ZWRGaWVsZHM/OiB7IHNlbWFudGljT2JqZWN0UGF0aD86IHN0cmluZyB9W107XG5cdGlzUGFydE9mUHJldmlldz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBDdXN0b21Gb3JtRWxlbWVudCA9IEN1c3RvbUVsZW1lbnQ8XG5cdEJhc2VGb3JtRWxlbWVudCAmIHtcblx0XHR0eXBlOiBGb3JtRWxlbWVudFR5cGU7XG5cdFx0dGVtcGxhdGU6IHN0cmluZztcblx0fVxuPjtcblxuZXhwb3J0IHR5cGUgRm9ybUVsZW1lbnQgPSBDdXN0b21Gb3JtRWxlbWVudCB8IEFubm90YXRpb25Gb3JtRWxlbWVudDtcblxuZXhwb3J0IHR5cGUgRm9ybUNvbnRhaW5lciA9IHtcblx0aWQ/OiBzdHJpbmc7XG5cdGZvcm1FbGVtZW50czogRm9ybUVsZW1lbnRbXTtcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0aXNWaXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0ZW50aXR5U2V0Pzogc3RyaW5nO1xuXHRhY3Rpb25zPzogQ29udmVydGVyQWN0aW9uW10gfCBCYXNlQWN0aW9uW107XG59O1xuXG4vKipcbiAqIFJldHVybnMgZGVmYXVsdCBmb3JtYXQgb3B0aW9ucyBmb3IgdGV4dCBmaWVsZHMgb24gYSBmb3JtLlxuICpcbiAqIEByZXR1cm5zIENvbGxlY3Rpb24gb2YgZm9ybWF0IG9wdGlvbnMgd2l0aCBkZWZhdWx0IHZhbHVlc1xuICovXG5mdW5jdGlvbiBnZXREZWZhdWx0Rm9ybWF0T3B0aW9uc0ZvckZvcm0oKTogRm9ybWF0T3B0aW9uc1R5cGUge1xuXHRyZXR1cm4ge1xuXHRcdHRleHRMaW5lc0VkaXQ6IDRcblx0fTtcbn1cblxuZnVuY3Rpb24gaXNGaWVsZFBhcnRPZlByZXZpZXcoZmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIGZvcm1QYXJ0T2ZQcmV2aWV3PzogUGFydE9mUHJldmlldyk6IGJvb2xlYW4ge1xuXHQvLyBCb3RoIGVhY2ggZm9ybSBhbmQgZmllbGQgY2FuIGhhdmUgdGhlIFBhcnRPZlByZXZpZXcgYW5ub3RhdGlvbi4gT25seSBpZiB0aGUgZm9ybSBpcyBub3QgaGlkZGVuIChub3QgcGFydE9mUHJldmlldykgd2UgYWxsb3cgdG9nZ2xpbmcgb24gZmllbGQgbGV2ZWxcblx0cmV0dXJuIChcblx0XHRmb3JtUGFydE9mUHJldmlldz8udmFsdWVPZigpID09PSBmYWxzZSB8fFxuXHRcdGZpZWxkLmFubm90YXRpb25zPy5VST8uUGFydE9mUHJldmlldyA9PT0gdW5kZWZpbmVkIHx8XG5cdFx0ZmllbGQuYW5ub3RhdGlvbnM/LlVJPy5QYXJ0T2ZQcmV2aWV3LnZhbHVlT2YoKSA9PT0gdHJ1ZVxuXHQpO1xufVxuXG5mdW5jdGlvbiBnZXRGb3JtRWxlbWVudHNGcm9tQW5ub3RhdGlvbnMoZmFjZXREZWZpbml0aW9uOiBSZWZlcmVuY2VGYWNldFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQW5ub3RhdGlvbkZvcm1FbGVtZW50W10ge1xuXHRjb25zdCBmb3JtRWxlbWVudHM6IEFubm90YXRpb25Gb3JtRWxlbWVudFtdID0gW107XG5cdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihmYWNldERlZmluaXRpb24uVGFyZ2V0LnZhbHVlKTtcblx0Y29uc3QgZm9ybUFubm90YXRpb246IElkZW50aWZpY2F0aW9uIHwgRmllbGRHcm91cCB8IENvbnRhY3QgfCBEYXRhUG9pbnQgPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uO1xuXHRjb252ZXJ0ZXJDb250ZXh0ID0gcmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dDtcblxuXHRmdW5jdGlvbiBnZXREYXRhRmllbGRzRnJvbUFubm90YXRpb25zKGZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBmb3JtUGFydE9mUHJldmlldzogUGFydE9mUHJldmlldyB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGggPSBnZXRTZW1hbnRpY09iamVjdFBhdGgoY29udmVydGVyQ29udGV4dCwgZmllbGQpO1xuXHRcdGlmIChcblx0XHRcdGZpZWxkLiRUeXBlICE9PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gJiZcblx0XHRcdGZpZWxkLiRUeXBlICE9PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gJiZcblx0XHRcdCFpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihmaWVsZCkgJiZcblx0XHRcdGZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgIT09IHRydWVcblx0XHQpIHtcblx0XHRcdGNvbnN0IGZvcm1FbGVtZW50ID0ge1xuXHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZmllbGQpLFxuXHRcdFx0XHR0eXBlOiBGb3JtRWxlbWVudFR5cGUuQW5ub3RhdGlvbixcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGAke2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChmaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpfS9gLFxuXHRcdFx0XHRzZW1hbnRpY09iamVjdFBhdGg6IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IGdldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yRm9ybSgpLFxuXHRcdFx0XHRpc1BhcnRPZlByZXZpZXc6IGlzRmllbGRQYXJ0T2ZQcmV2aWV3KGZpZWxkLCBmb3JtUGFydE9mUHJldmlldylcblx0XHRcdH07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIiAmJlxuXHRcdFx0XHRmaWVsZC5UYXJnZXQuJHRhcmdldC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db25uZWN0ZWRGaWVsZHNUeXBlXCJcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBjb25uZWN0ZWRGaWVsZHMgPSBPYmplY3QudmFsdWVzKGZpZWxkLlRhcmdldC4kdGFyZ2V0LkRhdGEpLmZpbHRlcigoY29ubmVjdGVkRmllbGQ6IE9iamVjdCkgPT5cblx0XHRcdFx0XHRjb25uZWN0ZWRGaWVsZD8uaGFzT3duUHJvcGVydHkoXCJWYWx1ZVwiKVxuXHRcdFx0XHQpO1xuXHRcdFx0XHQoZm9ybUVsZW1lbnQgYXMgQW5ub3RhdGlvbkZvcm1FbGVtZW50KS5jb25uZWN0ZWRGaWVsZHMgPSBjb25uZWN0ZWRGaWVsZHMubWFwKChjb25ubmVjdGVkRmllbGRFbGVtZW50KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIHsgc2VtYW50aWNPYmplY3RQYXRoOiBnZXRTZW1hbnRpY09iamVjdFBhdGgoY29udmVydGVyQ29udGV4dCwgY29ubm5lY3RlZEZpZWxkRWxlbWVudCkgfTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRmb3JtRWxlbWVudHMucHVzaChmb3JtRWxlbWVudCk7XG5cdFx0fVxuXHR9XG5cblx0c3dpdGNoIChmb3JtQW5ub3RhdGlvbj8udGVybSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuRmllbGRHcm91cDpcblx0XHRcdGZvcm1Bbm5vdGF0aW9uLkRhdGEuZm9yRWFjaCgoZmllbGQpID0+IGdldERhdGFGaWVsZHNGcm9tQW5ub3RhdGlvbnMoZmllbGQsIGZhY2V0RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uVUk/LlBhcnRPZlByZXZpZXcpKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuSWRlbnRpZmljYXRpb246XG5cdFx0XHRmb3JtQW5ub3RhdGlvbi5mb3JFYWNoKChmaWVsZCkgPT4gZ2V0RGF0YUZpZWxkc0Zyb21Bbm5vdGF0aW9ucyhmaWVsZCwgZmFjZXREZWZpbml0aW9uLmFubm90YXRpb25zPy5VST8uUGFydE9mUHJldmlldykpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5EYXRhUG9pbnQ6XG5cdFx0XHRmb3JtRWxlbWVudHMucHVzaCh7XG5cdFx0XHRcdC8vIGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChmb3JtQW5ub3RhdGlvbiksXG5cdFx0XHRcdGtleTogYERhdGFQb2ludDo6JHtmb3JtQW5ub3RhdGlvbi5xdWFsaWZpZXIgPyBmb3JtQW5ub3RhdGlvbi5xdWFsaWZpZXIgOiBcIlwifWAsXG5cdFx0XHRcdHR5cGU6IEZvcm1FbGVtZW50VHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogYCR7Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGZvcm1Bbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSl9L2Bcblx0XHRcdH0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblRlcm1zLkNvbnRhY3Q6XG5cdFx0XHRmb3JtRWxlbWVudHMucHVzaCh7XG5cdFx0XHRcdC8vIGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChmb3JtQW5ub3RhdGlvbiksXG5cdFx0XHRcdGtleTogYENvbnRhY3Q6OiR7Zm9ybUFubm90YXRpb24ucXVhbGlmaWVyID8gZm9ybUFubm90YXRpb24ucXVhbGlmaWVyIDogXCJcIn1gLFxuXHRcdFx0XHR0eXBlOiBGb3JtRWxlbWVudFR5cGUuQW5ub3RhdGlvbixcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGAke2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChmb3JtQW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUpfS9gXG5cdFx0XHR9KTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRicmVhaztcblx0fVxuXHRyZXR1cm4gZm9ybUVsZW1lbnRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Rm9ybUVsZW1lbnRzRnJvbU1hbmlmZXN0KFxuXHRmYWNldERlZmluaXRpb246IFJlZmVyZW5jZUZhY2V0VHlwZXMsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUZvcm1FbGVtZW50PiB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IG1hbmlmZXN0Rm9ybUNvbnRhaW5lcjogRm9ybU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IG1hbmlmZXN0V3JhcHBlci5nZXRGb3JtQ29udGFpbmVyKGZhY2V0RGVmaW5pdGlvbi5UYXJnZXQudmFsdWUpO1xuXHRjb25zdCBmb3JtRWxlbWVudHM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUZvcm1FbGVtZW50PiA9IHt9O1xuXHRpZiAobWFuaWZlc3RGb3JtQ29udGFpbmVyPy5maWVsZHMpIHtcblx0XHRPYmplY3Qua2V5cyhtYW5pZmVzdEZvcm1Db250YWluZXI/LmZpZWxkcykuZm9yRWFjaCgoZmllbGRJZCkgPT4ge1xuXHRcdFx0Zm9ybUVsZW1lbnRzW2ZpZWxkSWRdID0ge1xuXHRcdFx0XHRrZXk6IGZpZWxkSWQsXG5cdFx0XHRcdGlkOiBgQ3VzdG9tRm9ybUVsZW1lbnQ6OiR7ZmllbGRJZH1gLFxuXHRcdFx0XHR0eXBlOiBtYW5pZmVzdEZvcm1Db250YWluZXIuZmllbGRzW2ZpZWxkSWRdLnR5cGUgfHwgRm9ybUVsZW1lbnRUeXBlLkRlZmF1bHQsXG5cdFx0XHRcdHRlbXBsYXRlOiBtYW5pZmVzdEZvcm1Db250YWluZXIuZmllbGRzW2ZpZWxkSWRdLnRlbXBsYXRlLFxuXHRcdFx0XHRsYWJlbDogbWFuaWZlc3RGb3JtQ29udGFpbmVyLmZpZWxkc1tmaWVsZElkXS5sYWJlbCxcblx0XHRcdFx0cG9zaXRpb246IG1hbmlmZXN0Rm9ybUNvbnRhaW5lci5maWVsZHNbZmllbGRJZF0ucG9zaXRpb24gfHwge1xuXHRcdFx0XHRcdHBsYWNlbWVudDogUGxhY2VtZW50LkFmdGVyXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IHtcblx0XHRcdFx0XHQuLi5nZXREZWZhdWx0Rm9ybWF0T3B0aW9uc0ZvckZvcm0oKSxcblx0XHRcdFx0XHQuLi5tYW5pZmVzdEZvcm1Db250YWluZXIuZmllbGRzW2ZpZWxkSWRdLmZvcm1hdE9wdGlvbnNcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gZm9ybUVsZW1lbnRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Rm9ybUNvbnRhaW5lcihcblx0ZmFjZXREZWZpbml0aW9uOiBSZWZlcmVuY2VGYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRhY3Rpb25zPzogQmFzZUFjdGlvbltdIHwgQ29udmVydGVyQWN0aW9uW11cbik6IEZvcm1Db250YWluZXIge1xuXHRjb25zdCBzRm9ybUNvbnRhaW5lcklkID0gY3JlYXRlSWRGb3JBbm5vdGF0aW9uKGZhY2V0RGVmaW5pdGlvbikgYXMgc3RyaW5nO1xuXHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZmFjZXREZWZpbml0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSk7XG5cdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihmYWNldERlZmluaXRpb24uVGFyZ2V0LnZhbHVlKTtcblx0Y29uc3QgaXNWaXNpYmxlID0gY29tcGlsZUV4cHJlc3Npb24obm90KGVxdWFsKHRydWUsIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihmYWNldERlZmluaXRpb24uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4pKSkpO1xuXHRsZXQgc0VudGl0eVNldFBhdGghOiBzdHJpbmc7XG5cdC8vIHJlc29sdmVkVGFyZ2V0IGRvZXNuJ3QgaGF2ZSBhIGVudGl0eVNldCBpbiBjYXNlIENvbnRhaW5tZW50cyBhbmQgUGFyYW10ZXJpemVkIHNlcnZpY2VzLlxuXHRpZiAoXG5cdFx0cmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKSAmJlxuXHRcdHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkgIT09IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KClcblx0KSB7XG5cdFx0c0VudGl0eVNldFBhdGggPSBnZXRUYXJnZXRFbnRpdHlTZXRQYXRoKHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpKTtcblx0fSBlbHNlIGlmIChyZXNvbHZlZFRhcmdldC5jb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS50YXJnZXRPYmplY3Q/LmNvbnRhaW5zVGFyZ2V0ID09PSB0cnVlKSB7XG5cdFx0c0VudGl0eVNldFBhdGggPSBnZXRUYXJnZXRPYmplY3RQYXRoKHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCBmYWxzZSk7XG5cdH0gZWxzZSBpZiAoXG5cdFx0cmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKSAmJlxuXHRcdCFzRW50aXR5U2V0UGF0aCAmJlxuXHRcdE1vZGVsSGVscGVyLmlzU2luZ2xldG9uKHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpXG5cdCkge1xuXHRcdHNFbnRpdHlTZXRQYXRoID0gcmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKT8uZnVsbHlRdWFsaWZpZWROYW1lIGFzIHN0cmluZztcblx0fVxuXHRjb25zdCBhRm9ybUVsZW1lbnRzID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoXG5cdFx0Z2V0Rm9ybUVsZW1lbnRzRnJvbUFubm90YXRpb25zKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0Z2V0Rm9ybUVsZW1lbnRzRnJvbU1hbmlmZXN0KGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0eyBmb3JtYXRPcHRpb25zOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlIH1cblx0KTtcblxuXHRhY3Rpb25zID0gYWN0aW9ucyAhPT0gdW5kZWZpbmVkID8gYWN0aW9ucy5maWx0ZXIoKGFjdGlvbikgPT4gYWN0aW9uLmZhY2V0TmFtZSA9PSBmYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lKSA6IFtdO1xuXHRpZiAoYWN0aW9ucy5sZW5ndGggPT09IDApIHtcblx0XHRhY3Rpb25zID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0Y29uc3Qgb0FjdGlvblNob3dEZXRhaWxzOiBCYXNlQWN0aW9uID0ge1xuXHRcdGlkOiBnZXRGb3JtU3RhbmRhcmRBY3Rpb25CdXR0b25JRChzRm9ybUNvbnRhaW5lcklkLCBcIlNob3dIaWRlRGV0YWlsc1wiKSxcblx0XHRrZXk6IFwiU3RhbmRhcmRBY3Rpb246OlNob3dIaWRlRGV0YWlsc1wiLFxuXHRcdHRleHQ6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRlcXVhbChwYXRoSW5Nb2RlbChcInNob3dEZXRhaWxzXCIsIFwiaW50ZXJuYWxcIiksIHRydWUpLFxuXHRcdFx0XHRwYXRoSW5Nb2RlbChcIlRfQ09NTU9OX09CSkVDVF9QQUdFX0hJREVfRk9STV9DT05UQUlORVJfREVUQUlMU1wiLCBcInNhcC5mZS5pMThuXCIpLFxuXHRcdFx0XHRwYXRoSW5Nb2RlbChcIlRfQ09NTU9OX09CSkVDVF9QQUdFX1NIT1dfRk9STV9DT05UQUlORVJfREVUQUlMU1wiLCBcInNhcC5mZS5pMThuXCIpXG5cdFx0XHQpXG5cdFx0KSxcblx0XHR0eXBlOiBBY3Rpb25UeXBlLlNob3dGb3JtRGV0YWlscyxcblx0XHRwcmVzczogXCJGb3JtQ29udGFpbmVyUnVudGltZS50b2dnbGVEZXRhaWxzXCJcblx0fTtcblxuXHRpZiAoXG5cdFx0ZmFjZXREZWZpbml0aW9uLmFubm90YXRpb25zPy5VST8uUGFydE9mUHJldmlldz8udmFsdWVPZigpICE9PSBmYWxzZSAmJlxuXHRcdGFGb3JtRWxlbWVudHMuc29tZSgob0Zvcm1FbGVtZW50KSA9PiBvRm9ybUVsZW1lbnQuaXNQYXJ0T2ZQcmV2aWV3ID09PSBmYWxzZSlcblx0KSB7XG5cdFx0aWYgKGFjdGlvbnMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0YWN0aW9ucy5wdXNoKG9BY3Rpb25TaG93RGV0YWlscyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFjdGlvbnMgPSBbb0FjdGlvblNob3dEZXRhaWxzXTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGlkOiBzRm9ybUNvbnRhaW5lcklkLFxuXHRcdGZvcm1FbGVtZW50czogYUZvcm1FbGVtZW50cyxcblx0XHRhbm5vdGF0aW9uUGF0aDogc0Fubm90YXRpb25QYXRoLFxuXHRcdGlzVmlzaWJsZTogaXNWaXNpYmxlLFxuXHRcdGVudGl0eVNldDogc0VudGl0eVNldFBhdGgsXG5cdFx0YWN0aW9uczogYWN0aW9uc1xuXHR9O1xufVxuXG5mdW5jdGlvbiBnZXRGb3JtQ29udGFpbmVyc0ZvckNvbGxlY3Rpb24oXG5cdGZhY2V0RGVmaW5pdGlvbjogQ29sbGVjdGlvbkZhY2V0VHlwZXMsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGFjdGlvbnM/OiBCYXNlQWN0aW9uW10gfCBDb252ZXJ0ZXJBY3Rpb25bXVxuKTogRm9ybUNvbnRhaW5lcltdIHtcblx0Y29uc3QgZm9ybUNvbnRhaW5lcnM6IEZvcm1Db250YWluZXJbXSA9IFtdO1xuXHRmYWNldERlZmluaXRpb24uRmFjZXRzPy5mb3JFYWNoKChmYWNldCkgPT4ge1xuXHRcdC8vIElnbm9yZSBsZXZlbCAzIGNvbGxlY3Rpb24gZmFjZXRcblx0XHRpZiAoZmFjZXQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkNvbGxlY3Rpb25GYWNldCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRmb3JtQ29udGFpbmVycy5wdXNoKGdldEZvcm1Db250YWluZXIoZmFjZXQgYXMgUmVmZXJlbmNlRmFjZXRUeXBlcywgY29udmVydGVyQ29udGV4dCwgYWN0aW9ucykpO1xuXHR9KTtcblx0cmV0dXJuIGZvcm1Db250YWluZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWZlcmVuY2VGYWNldChmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMpOiBmYWNldERlZmluaXRpb24gaXMgUmVmZXJlbmNlRmFjZXRUeXBlcyB7XG5cdHJldHVybiBmYWNldERlZmluaXRpb24uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRm9ybURlZmluaXRpb24oXG5cdGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcyxcblx0aXNWaXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0YWN0aW9ucz86IEJhc2VBY3Rpb25bXSB8IENvbnZlcnRlckFjdGlvbltdXG4pOiBGb3JtRGVmaW5pdGlvbiB7XG5cdHN3aXRjaCAoZmFjZXREZWZpbml0aW9uLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXQ6XG5cdFx0XHQvLyBLZWVwIG9ubHkgdmFsaWQgY2hpbGRyZW5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGlkOiBnZXRGb3JtSUQoZmFjZXREZWZpbml0aW9uKSxcblx0XHRcdFx0dXNlRm9ybUNvbnRhaW5lckxhYmVsczogdHJ1ZSxcblx0XHRcdFx0aGFzRmFjZXRzTm90UGFydE9mUHJldmlldzogZmFjZXREZWZpbml0aW9uLkZhY2V0cy5zb21lKFxuXHRcdFx0XHRcdChjaGlsZEZhY2V0KSA9PiBjaGlsZEZhY2V0LmFubm90YXRpb25zPy5VST8uUGFydE9mUHJldmlldz8udmFsdWVPZigpID09PSBmYWxzZVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRmb3JtQ29udGFpbmVyczogZ2V0Rm9ybUNvbnRhaW5lcnNGb3JDb2xsZWN0aW9uKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCwgYWN0aW9ucyksXG5cdFx0XHRcdGlzVmlzaWJsZTogaXNWaXNpYmxlXG5cdFx0XHR9O1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQ6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRpZDogZ2V0Rm9ybUlEKGZhY2V0RGVmaW5pdGlvbiksXG5cdFx0XHRcdHVzZUZvcm1Db250YWluZXJMYWJlbHM6IGZhbHNlLFxuXHRcdFx0XHRoYXNGYWNldHNOb3RQYXJ0T2ZQcmV2aWV3OiBmYWNldERlZmluaXRpb24uYW5ub3RhdGlvbnM/LlVJPy5QYXJ0T2ZQcmV2aWV3Py52YWx1ZU9mKCkgPT09IGZhbHNlLFxuXHRcdFx0XHRmb3JtQ29udGFpbmVyczogW2dldEZvcm1Db250YWluZXIoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0LCBhY3Rpb25zKV0sXG5cdFx0XHRcdGlzVmlzaWJsZTogaXNWaXNpYmxlXG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGZvcm0gYmFzZWQgb24gUmVmZXJlbmNlVVJMRmFjZXRcIik7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFxQ1lBLGVBQWU7RUFBQSxXQUFmQSxlQUFlO0lBQWZBLGVBQWU7SUFBZkEsZUFBZTtJQUFmQSxlQUFlO0VBQUEsR0FBZkEsZUFBZSxLQUFmQSxlQUFlO0VBQUE7RUF5QzNCO0FBQ0E7QUFDQTtBQUNB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