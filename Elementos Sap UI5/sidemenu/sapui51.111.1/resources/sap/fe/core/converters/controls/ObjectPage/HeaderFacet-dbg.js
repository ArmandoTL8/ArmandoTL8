/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/ID", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "../../../helpers/StableIdHelper", "../../helpers/DataFieldHelper", "../Common/Form"], function (DataField, ConfigurableObject, ID, Key, BindingToolkit, StableIdHelper, DataFieldHelper, Form) {
  "use strict";

  var _exports = {};
  var getFormElementsFromManifest = Form.getFormElementsFromManifest;
  var FormElementType = Form.FormElementType;
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var isAnnotationFieldStaticallyHidden = DataFieldHelper.isAnnotationFieldStaticallyHidden;
  var createIdForAnnotation = StableIdHelper.createIdForAnnotation;
  var not = BindingToolkit.not;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var getHeaderFacetID = ID.getHeaderFacetID;
  var getHeaderFacetFormID = ID.getHeaderFacetFormID;
  var getHeaderFacetContainerID = ID.getHeaderFacetContainerID;
  var getCustomHeaderFacetID = ID.getCustomHeaderFacetID;
  var Placement = ConfigurableObject.Placement;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getSemanticObjectPath = DataField.getSemanticObjectPath;
  // region definitions
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Definitions: Header Facet Types, Generic OP Header Facet, Manifest Properties for Custom Header Facet
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  let HeaderFacetType;
  (function (HeaderFacetType) {
    HeaderFacetType["Annotation"] = "Annotation";
    HeaderFacetType["XMLFragment"] = "XMLFragment";
  })(HeaderFacetType || (HeaderFacetType = {}));
  _exports.HeaderFacetType = HeaderFacetType;
  let FacetType;
  (function (FacetType) {
    FacetType["Reference"] = "Reference";
    FacetType["Collection"] = "Collection";
  })(FacetType || (FacetType = {}));
  _exports.FacetType = FacetType;
  let FlexDesignTimeType;
  (function (FlexDesignTimeType) {
    FlexDesignTimeType["Default"] = "Default";
    FlexDesignTimeType["NotAdaptable"] = "not-adaptable";
    FlexDesignTimeType["NotAdaptableTree"] = "not-adaptable-tree";
    FlexDesignTimeType["NotAdaptableVisibility"] = "not-adaptable-visibility";
  })(FlexDesignTimeType || (FlexDesignTimeType = {}));
  _exports.FlexDesignTimeType = FlexDesignTimeType;
  var HeaderDataPointType;
  (function (HeaderDataPointType) {
    HeaderDataPointType["ProgressIndicator"] = "ProgressIndicator";
    HeaderDataPointType["RatingIndicator"] = "RatingIndicator";
    HeaderDataPointType["Content"] = "Content";
  })(HeaderDataPointType || (HeaderDataPointType = {}));
  var TargetAnnotationType;
  (function (TargetAnnotationType) {
    TargetAnnotationType["None"] = "None";
    TargetAnnotationType["DataPoint"] = "DataPoint";
    TargetAnnotationType["Chart"] = "Chart";
    TargetAnnotationType["Identification"] = "Identification";
    TargetAnnotationType["Contact"] = "Contact";
    TargetAnnotationType["Address"] = "Address";
    TargetAnnotationType["FieldGroup"] = "FieldGroup";
  })(TargetAnnotationType || (TargetAnnotationType = {}));
  // endregion definitions

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Collect All Header Facets: Custom (via Manifest) and Annotation Based (via Metamodel)
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Retrieve header facets from annotations.
   *
   * @param converterContext
   * @returns Header facets from annotations
   */
  function getHeaderFacetsFromAnnotations(converterContext) {
    var _converterContext$get, _converterContext$get2, _converterContext$get3;
    const headerFacets = [];
    (_converterContext$get = converterContext.getEntityType().annotations) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.UI) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.HeaderFacets) === null || _converterContext$get3 === void 0 ? void 0 : _converterContext$get3.forEach(facet => {
      const headerFacet = createHeaderFacet(facet, converterContext);
      if (headerFacet) {
        headerFacets.push(headerFacet);
      }
    });
    return headerFacets;
  }

  /**
   * Retrieve custom header facets from manifest.
   *
   * @param manifestCustomHeaderFacets
   * @returns HeaderFacets from manifest
   */
  _exports.getHeaderFacetsFromAnnotations = getHeaderFacetsFromAnnotations;
  function getHeaderFacetsFromManifest(manifestCustomHeaderFacets) {
    const customHeaderFacets = {};
    Object.keys(manifestCustomHeaderFacets).forEach(manifestHeaderFacetKey => {
      const customHeaderFacet = manifestCustomHeaderFacets[manifestHeaderFacetKey];
      customHeaderFacets[manifestHeaderFacetKey] = createCustomHeaderFacet(customHeaderFacet, manifestHeaderFacetKey);
    });
    return customHeaderFacets;
  }

  /**
   * Retrieve stashed settings for header facets from manifest.
   *
   * @param facetDefinition
   * @param collectionFacetDefinition
   * @param converterContext
   * @returns Stashed setting for header facet or false
   */
  _exports.getHeaderFacetsFromManifest = getHeaderFacetsFromManifest;
  function getStashedSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext) {
    var _headerFacetsControlC;
    // When a HeaderFacet is nested inside a CollectionFacet, stashing is not supported
    if (facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && collectionFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet") {
      return false;
    }
    const headerFacetID = createIdForAnnotation(facetDefinition) ?? "";
    const headerFacetsControlConfig = converterContext.getManifestWrapper().getHeaderFacets();
    const stashedSetting = (_headerFacetsControlC = headerFacetsControlConfig[headerFacetID]) === null || _headerFacetsControlC === void 0 ? void 0 : _headerFacetsControlC.stashed;
    return stashedSetting === true;
  }

  /**
   * Retrieve flexibility designtime settings from manifest.
   *
   * @param facetDefinition
   * @param collectionFacetDefinition
   * @param converterContext
   * @returns Designtime setting or default
   */
  _exports.getStashedSettingsForHeaderFacet = getStashedSettingsForHeaderFacet;
  function getDesignTimeMetadataSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext) {
    let designTimeMetadata = FlexDesignTimeType.Default;
    const headerFacetID = createIdForAnnotation(facetDefinition);

    // For HeaderFacets nested inside CollectionFacet RTA should be disabled, therefore set to "not-adaptable-tree"
    if (facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && collectionFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet") {
      designTimeMetadata = FlexDesignTimeType.NotAdaptableTree;
    } else {
      const headerFacetsControlConfig = converterContext.getManifestWrapper().getHeaderFacets();
      if (headerFacetID) {
        var _headerFacetsControlC2, _headerFacetsControlC3;
        const designTime = (_headerFacetsControlC2 = headerFacetsControlConfig[headerFacetID]) === null || _headerFacetsControlC2 === void 0 ? void 0 : (_headerFacetsControlC3 = _headerFacetsControlC2.flexSettings) === null || _headerFacetsControlC3 === void 0 ? void 0 : _headerFacetsControlC3.designtime;
        switch (designTime) {
          case FlexDesignTimeType.NotAdaptable:
          case FlexDesignTimeType.NotAdaptableTree:
          case FlexDesignTimeType.NotAdaptableVisibility:
            designTimeMetadata = designTime;
            break;
          default:
            break;
        }
      }
    }
    return designTimeMetadata;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Convert & Build Annotation Based Header Facets
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  _exports.getDesignTimeMetadataSettingsForHeaderFacet = getDesignTimeMetadataSettingsForHeaderFacet;
  function createReferenceHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext) {
    var _facetDefinition$anno, _facetDefinition$anno2, _facetDefinition$anno3;
    if (facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && !(((_facetDefinition$anno = facetDefinition.annotations) === null || _facetDefinition$anno === void 0 ? void 0 : (_facetDefinition$anno2 = _facetDefinition$anno.UI) === null || _facetDefinition$anno2 === void 0 ? void 0 : (_facetDefinition$anno3 = _facetDefinition$anno2.Hidden) === null || _facetDefinition$anno3 === void 0 ? void 0 : _facetDefinition$anno3.valueOf()) === true)) {
      var _facetDefinition$Targ, _facetDefinition$Targ2;
      const headerFacetID = getHeaderFacetID(facetDefinition),
        getHeaderFacetKey = (facetDefinitionToCheck, fallback) => {
          var _facetDefinitionToChe, _facetDefinitionToChe2;
          return ((_facetDefinitionToChe = facetDefinitionToCheck.ID) === null || _facetDefinitionToChe === void 0 ? void 0 : _facetDefinitionToChe.toString()) || ((_facetDefinitionToChe2 = facetDefinitionToCheck.Label) === null || _facetDefinitionToChe2 === void 0 ? void 0 : _facetDefinitionToChe2.toString()) || fallback;
        },
        targetAnnotationValue = facetDefinition.Target.value,
        targetAnnotationType = getTargetAnnotationType(facetDefinition);
      let headerFormData;
      let headerDataPointData;
      switch (targetAnnotationType) {
        case TargetAnnotationType.FieldGroup:
          headerFormData = getFieldGroupFormData(facetDefinition, converterContext);
          break;
        case TargetAnnotationType.DataPoint:
          headerDataPointData = getDataPointData(facetDefinition, converterContext);
          break;
        // ToDo: Handle other cases
        default:
          break;
      }
      const {
        annotations
      } = facetDefinition;
      if (((_facetDefinition$Targ = facetDefinition.Target) === null || _facetDefinition$Targ === void 0 ? void 0 : (_facetDefinition$Targ2 = _facetDefinition$Targ.$target) === null || _facetDefinition$Targ2 === void 0 ? void 0 : _facetDefinition$Targ2.term) === "com.sap.vocabularies.UI.v1.Chart" && isAnnotationFieldStaticallyHidden(facetDefinition)) {
        return undefined;
      } else {
        var _annotations$UI, _annotations$UI$Hidde;
        return {
          type: HeaderFacetType.Annotation,
          facetType: FacetType.Reference,
          id: headerFacetID,
          containerId: getHeaderFacetContainerID(facetDefinition),
          key: getHeaderFacetKey(facetDefinition, headerFacetID),
          flexSettings: {
            designtime: getDesignTimeMetadataSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext)
          },
          stashed: getStashedSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext),
          visible: compileExpression(not(equal(getExpressionFromAnnotation(annotations === null || annotations === void 0 ? void 0 : (_annotations$UI = annotations.UI) === null || _annotations$UI === void 0 ? void 0 : (_annotations$UI$Hidde = _annotations$UI.Hidden) === null || _annotations$UI$Hidde === void 0 ? void 0 : _annotations$UI$Hidde.valueOf()), true))),
          annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName)}/`,
          targetAnnotationValue,
          targetAnnotationType,
          headerFormData,
          headerDataPointData
        };
      }
    }
    return undefined;
  }
  function createCollectionHeaderFacet(collectionFacetDefinition, converterContext) {
    if (collectionFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet") {
      var _collectionFacetDefin, _collectionFacetDefin2, _collectionFacetDefin3;
      const facets = [],
        headerFacetID = getHeaderFacetID(collectionFacetDefinition),
        getHeaderFacetKey = (facetDefinition, fallback) => {
          var _facetDefinition$ID, _facetDefinition$Labe;
          return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
        };
      collectionFacetDefinition.Facets.forEach(facetDefinition => {
        const facet = createReferenceHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext);
        if (facet) {
          facets.push(facet);
        }
      });
      return {
        type: HeaderFacetType.Annotation,
        facetType: FacetType.Collection,
        id: headerFacetID,
        containerId: getHeaderFacetContainerID(collectionFacetDefinition),
        key: getHeaderFacetKey(collectionFacetDefinition, headerFacetID),
        flexSettings: {
          designtime: getDesignTimeMetadataSettingsForHeaderFacet(collectionFacetDefinition, collectionFacetDefinition, converterContext)
        },
        stashed: getStashedSettingsForHeaderFacet(collectionFacetDefinition, collectionFacetDefinition, converterContext),
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_collectionFacetDefin = collectionFacetDefinition.annotations) === null || _collectionFacetDefin === void 0 ? void 0 : (_collectionFacetDefin2 = _collectionFacetDefin.UI) === null || _collectionFacetDefin2 === void 0 ? void 0 : (_collectionFacetDefin3 = _collectionFacetDefin2.Hidden) === null || _collectionFacetDefin3 === void 0 ? void 0 : _collectionFacetDefin3.valueOf()), true))),
        annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(collectionFacetDefinition.fullyQualifiedName)}/`,
        facets
      };
    }
    return undefined;
  }
  function getTargetAnnotationType(facetDefinition) {
    let annotationType = TargetAnnotationType.None;
    const annotationTypeMap = {
      "com.sap.vocabularies.UI.v1.DataPoint": TargetAnnotationType.DataPoint,
      "com.sap.vocabularies.UI.v1.Chart": TargetAnnotationType.Chart,
      "com.sap.vocabularies.UI.v1.Identification": TargetAnnotationType.Identification,
      "com.sap.vocabularies.Communication.v1.Contact": TargetAnnotationType.Contact,
      "com.sap.vocabularies.Communication.v1.Address": TargetAnnotationType.Address,
      "com.sap.vocabularies.UI.v1.FieldGroup": TargetAnnotationType.FieldGroup
    };
    // ReferenceURLFacet and CollectionFacet do not have Target property.
    if (facetDefinition.$Type !== "com.sap.vocabularies.UI.v1.ReferenceURLFacet" && facetDefinition.$Type !== "com.sap.vocabularies.UI.v1.CollectionFacet") {
      var _facetDefinition$Targ3, _facetDefinition$Targ4;
      annotationType = annotationTypeMap[(_facetDefinition$Targ3 = facetDefinition.Target) === null || _facetDefinition$Targ3 === void 0 ? void 0 : (_facetDefinition$Targ4 = _facetDefinition$Targ3.$target) === null || _facetDefinition$Targ4 === void 0 ? void 0 : _facetDefinition$Targ4.term] || TargetAnnotationType.None;
    }
    return annotationType;
  }
  function getFieldGroupFormData(facetDefinition, converterContext) {
    var _facetDefinition$Labe2;
    // split in this from annotation + getFieldGroupFromDefault
    if (!facetDefinition) {
      throw new Error("Cannot get FieldGroup form data without facet definition");
    }
    const formElements = insertCustomElements(getFormElementsFromAnnotations(facetDefinition, converterContext), getFormElementsFromManifest(facetDefinition, converterContext));
    return {
      id: getHeaderFacetFormID(facetDefinition),
      label: (_facetDefinition$Labe2 = facetDefinition.Label) === null || _facetDefinition$Labe2 === void 0 ? void 0 : _facetDefinition$Labe2.toString(),
      formElements
    };
  }

  /**
   * Creates an array of manifest-based FormElements.
   *
   * @param facetDefinition The definition of the facet
   * @param converterContext The converter context for the facet
   * @returns Annotation-based FormElements
   */
  function getFormElementsFromAnnotations(facetDefinition, converterContext) {
    const annotationBasedFormElements = [];

    // ReferenceURLFacet and CollectionFacet do not have Target property.
    if (facetDefinition.$Type !== "com.sap.vocabularies.UI.v1.ReferenceURLFacet" && facetDefinition.$Type !== "com.sap.vocabularies.UI.v1.CollectionFacet") {
      var _facetDefinition$Targ5, _facetDefinition$Targ6;
      (_facetDefinition$Targ5 = facetDefinition.Target) === null || _facetDefinition$Targ5 === void 0 ? void 0 : (_facetDefinition$Targ6 = _facetDefinition$Targ5.$target) === null || _facetDefinition$Targ6 === void 0 ? void 0 : _facetDefinition$Targ6.Data.forEach(dataField => {
        var _dataField$annotation, _dataField$annotation2, _dataField$annotation3;
        if (!(((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === true)) {
          const semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, dataField);
          if ((dataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction") && !isReferencePropertyStaticallyHidden(dataField)) {
            var _dataField$Value, _dataField$Value$$tar, _dataField$Value$$tar2, _dataField$Value$$tar3, _dataField$Value$$tar4, _annotations$UI2, _annotations$UI2$Hidd, _dataField$Value2, _dataField$Value2$$ta, _dataField$Value2$$ta2, _dataField$Value2$$ta3;
            const {
              annotations
            } = dataField;
            annotationBasedFormElements.push({
              isValueMultilineText: ((_dataField$Value = dataField.Value) === null || _dataField$Value === void 0 ? void 0 : (_dataField$Value$$tar = _dataField$Value.$target) === null || _dataField$Value$$tar === void 0 ? void 0 : (_dataField$Value$$tar2 = _dataField$Value$$tar.annotations) === null || _dataField$Value$$tar2 === void 0 ? void 0 : (_dataField$Value$$tar3 = _dataField$Value$$tar2.UI) === null || _dataField$Value$$tar3 === void 0 ? void 0 : (_dataField$Value$$tar4 = _dataField$Value$$tar3.MultiLineText) === null || _dataField$Value$$tar4 === void 0 ? void 0 : _dataField$Value$$tar4.valueOf()) === true,
              type: FormElementType.Annotation,
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation(annotations === null || annotations === void 0 ? void 0 : (_annotations$UI2 = annotations.UI) === null || _annotations$UI2 === void 0 ? void 0 : (_annotations$UI2$Hidd = _annotations$UI2.Hidden) === null || _annotations$UI2$Hidd === void 0 ? void 0 : _annotations$UI2$Hidd.valueOf()), true))),
              label: ((_dataField$Value2 = dataField.Value) === null || _dataField$Value2 === void 0 ? void 0 : (_dataField$Value2$$ta = _dataField$Value2.$target) === null || _dataField$Value2$$ta === void 0 ? void 0 : (_dataField$Value2$$ta2 = _dataField$Value2$$ta.annotations) === null || _dataField$Value2$$ta2 === void 0 ? void 0 : (_dataField$Value2$$ta3 = _dataField$Value2$$ta2.Common) === null || _dataField$Value2$$ta3 === void 0 ? void 0 : _dataField$Value2$$ta3.Label) || dataField.Label,
              idPrefix: getHeaderFacetFormID(facetDefinition, dataField),
              annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName)}/`,
              semanticObjectPath: semanticObjectAnnotationPath
            });
          } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && !isReferencePropertyStaticallyHidden(dataField)) {
            var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2, _dataField$Target$$ta3, _dataField$Target$$ta4, _annotations$UI3, _annotations$UI3$Hidd, _dataField$Target2, _dataField$Target2$$t, _dataField$Target2$$t2, _dataField$Target2$$t3, _dataField$Target2$$t4, _dataField$Label;
            const {
              annotations
            } = dataField;
            annotationBasedFormElements.push({
              // FIXME this is wrong, the annotation should exist, so the target is not properly identified
              isValueMultilineText: ((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$ta = _dataField$Target.$target) === null || _dataField$Target$$ta === void 0 ? void 0 : (_dataField$Target$$ta2 = _dataField$Target$$ta.annotations) === null || _dataField$Target$$ta2 === void 0 ? void 0 : (_dataField$Target$$ta3 = _dataField$Target$$ta2.UI) === null || _dataField$Target$$ta3 === void 0 ? void 0 : (_dataField$Target$$ta4 = _dataField$Target$$ta3.MultiLineText) === null || _dataField$Target$$ta4 === void 0 ? void 0 : _dataField$Target$$ta4.valueOf()) === true,
              type: FormElementType.Annotation,
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation(annotations === null || annotations === void 0 ? void 0 : (_annotations$UI3 = annotations.UI) === null || _annotations$UI3 === void 0 ? void 0 : (_annotations$UI3$Hidd = _annotations$UI3.Hidden) === null || _annotations$UI3$Hidd === void 0 ? void 0 : _annotations$UI3$Hidd.valueOf()), true))),
              label: ((_dataField$Target2 = dataField.Target) === null || _dataField$Target2 === void 0 ? void 0 : (_dataField$Target2$$t = _dataField$Target2.$target) === null || _dataField$Target2$$t === void 0 ? void 0 : (_dataField$Target2$$t2 = _dataField$Target2$$t.annotations) === null || _dataField$Target2$$t2 === void 0 ? void 0 : (_dataField$Target2$$t3 = _dataField$Target2$$t2.Common) === null || _dataField$Target2$$t3 === void 0 ? void 0 : (_dataField$Target2$$t4 = _dataField$Target2$$t3.Label) === null || _dataField$Target2$$t4 === void 0 ? void 0 : _dataField$Target2$$t4.toString()) || ((_dataField$Label = dataField.Label) === null || _dataField$Label === void 0 ? void 0 : _dataField$Label.toString()),
              idPrefix: getHeaderFacetFormID(facetDefinition, dataField),
              annotationPath: `${converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName)}/`,
              semanticObjectPath: semanticObjectAnnotationPath
            });
          }
        }
      });
    }
    return annotationBasedFormElements;
  }
  function getDataPointData(facetDefinition, converterContext) {
    let type = HeaderDataPointType.Content;
    let semanticObjectPath;
    if (facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && !isAnnotationFieldStaticallyHidden(facetDefinition)) {
      var _facetDefinition$Targ7, _facetDefinition$Targ8, _facetDefinition$Targ9, _facetDefinition$Targ10, _facetDefinition$Targ11;
      if (((_facetDefinition$Targ7 = facetDefinition.Target) === null || _facetDefinition$Targ7 === void 0 ? void 0 : (_facetDefinition$Targ8 = _facetDefinition$Targ7.$target) === null || _facetDefinition$Targ8 === void 0 ? void 0 : _facetDefinition$Targ8.Visualization) === "UI.VisualizationType/Progress") {
        type = HeaderDataPointType.ProgressIndicator;
      } else if (((_facetDefinition$Targ9 = facetDefinition.Target) === null || _facetDefinition$Targ9 === void 0 ? void 0 : (_facetDefinition$Targ10 = _facetDefinition$Targ9.$target) === null || _facetDefinition$Targ10 === void 0 ? void 0 : _facetDefinition$Targ10.Visualization) === "UI.VisualizationType/Rating") {
        type = HeaderDataPointType.RatingIndicator;
      }
      const dataPoint = (_facetDefinition$Targ11 = facetDefinition.Target) === null || _facetDefinition$Targ11 === void 0 ? void 0 : _facetDefinition$Targ11.$target;
      if (typeof dataPoint === "object") {
        var _dataPoint$Value;
        if (dataPoint !== null && dataPoint !== void 0 && (_dataPoint$Value = dataPoint.Value) !== null && _dataPoint$Value !== void 0 && _dataPoint$Value.$target) {
          var _property$annotations, _property$annotations2;
          const property = dataPoint.Value.$target;
          if ((property === null || property === void 0 ? void 0 : (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.SemanticObject) !== undefined) {
            semanticObjectPath = converterContext.getEntitySetBasedAnnotationPath(property === null || property === void 0 ? void 0 : property.fullyQualifiedName);
          }
        }
      }
    }
    return {
      type,
      semanticObjectPath
    };
  }

  /**
   * Creates an annotation-based header facet.
   *
   * @param facetDefinition The definition of the facet
   * @param converterContext The converter context
   * @returns The created annotation-based header facet
   */
  function createHeaderFacet(facetDefinition, converterContext) {
    let headerFacet;
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        headerFacet = createReferenceHeaderFacet(facetDefinition, facetDefinition, converterContext);
        break;
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        headerFacet = createCollectionHeaderFacet(facetDefinition, converterContext);
        break;
      default:
        break;
    }
    return headerFacet;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Convert & Build Manifest Based Header Facets
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function generateBinding(requestGroupId) {
    if (!requestGroupId) {
      return undefined;
    }
    const groupId = ["Heroes", "Decoration", "Workers", "LongRunners"].indexOf(requestGroupId) !== -1 ? `$auto.${requestGroupId}` : requestGroupId;
    return `{ path : '', parameters : { $$groupId : '${groupId}' } }`;
  }

  /**
   * Create a manifest based custom header facet.
   *
   * @param customHeaderFacetDefinition
   * @param headerFacetKey
   * @returns The manifest based custom header facet created
   */
  function createCustomHeaderFacet(customHeaderFacetDefinition, headerFacetKey) {
    const customHeaderFacetID = getCustomHeaderFacetID(headerFacetKey);
    let position = customHeaderFacetDefinition.position;
    if (!position) {
      position = {
        placement: Placement.After
      };
    }
    // TODO for an non annotation fragment the name is mandatory -> Not checked
    return {
      facetType: FacetType.Reference,
      facets: [],
      type: customHeaderFacetDefinition.type,
      id: customHeaderFacetID,
      containerId: customHeaderFacetID,
      key: headerFacetKey,
      position: position,
      visible: customHeaderFacetDefinition.visible,
      fragmentName: customHeaderFacetDefinition.template || customHeaderFacetDefinition.name,
      title: customHeaderFacetDefinition.title,
      subTitle: customHeaderFacetDefinition.subTitle,
      stashed: customHeaderFacetDefinition.stashed || false,
      flexSettings: {
        ...{
          designtime: FlexDesignTimeType.Default
        },
        ...customHeaderFacetDefinition.flexSettings
      },
      binding: generateBinding(customHeaderFacetDefinition.requestGroupId),
      templateEdit: customHeaderFacetDefinition.templateEdit
    };
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIZWFkZXJGYWNldFR5cGUiLCJGYWNldFR5cGUiLCJGbGV4RGVzaWduVGltZVR5cGUiLCJIZWFkZXJEYXRhUG9pbnRUeXBlIiwiVGFyZ2V0QW5ub3RhdGlvblR5cGUiLCJnZXRIZWFkZXJGYWNldHNGcm9tQW5ub3RhdGlvbnMiLCJjb252ZXJ0ZXJDb250ZXh0IiwiaGVhZGVyRmFjZXRzIiwiZ2V0RW50aXR5VHlwZSIsImFubm90YXRpb25zIiwiVUkiLCJIZWFkZXJGYWNldHMiLCJmb3JFYWNoIiwiZmFjZXQiLCJoZWFkZXJGYWNldCIsImNyZWF0ZUhlYWRlckZhY2V0IiwicHVzaCIsImdldEhlYWRlckZhY2V0c0Zyb21NYW5pZmVzdCIsIm1hbmlmZXN0Q3VzdG9tSGVhZGVyRmFjZXRzIiwiY3VzdG9tSGVhZGVyRmFjZXRzIiwiT2JqZWN0Iiwia2V5cyIsIm1hbmlmZXN0SGVhZGVyRmFjZXRLZXkiLCJjdXN0b21IZWFkZXJGYWNldCIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0IiwiZ2V0U3Rhc2hlZFNldHRpbmdzRm9ySGVhZGVyRmFjZXQiLCJmYWNldERlZmluaXRpb24iLCJjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uIiwiJFR5cGUiLCJoZWFkZXJGYWNldElEIiwiY3JlYXRlSWRGb3JBbm5vdGF0aW9uIiwiaGVhZGVyRmFjZXRzQ29udHJvbENvbmZpZyIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldEhlYWRlckZhY2V0cyIsInN0YXNoZWRTZXR0aW5nIiwic3Rhc2hlZCIsImdldERlc2lnblRpbWVNZXRhZGF0YVNldHRpbmdzRm9ySGVhZGVyRmFjZXQiLCJkZXNpZ25UaW1lTWV0YWRhdGEiLCJEZWZhdWx0IiwiTm90QWRhcHRhYmxlVHJlZSIsImRlc2lnblRpbWUiLCJmbGV4U2V0dGluZ3MiLCJkZXNpZ250aW1lIiwiTm90QWRhcHRhYmxlIiwiTm90QWRhcHRhYmxlVmlzaWJpbGl0eSIsImNyZWF0ZVJlZmVyZW5jZUhlYWRlckZhY2V0IiwiSGlkZGVuIiwidmFsdWVPZiIsImdldEhlYWRlckZhY2V0SUQiLCJnZXRIZWFkZXJGYWNldEtleSIsImZhY2V0RGVmaW5pdGlvblRvQ2hlY2siLCJmYWxsYmFjayIsIklEIiwidG9TdHJpbmciLCJMYWJlbCIsInRhcmdldEFubm90YXRpb25WYWx1ZSIsIlRhcmdldCIsInZhbHVlIiwidGFyZ2V0QW5ub3RhdGlvblR5cGUiLCJnZXRUYXJnZXRBbm5vdGF0aW9uVHlwZSIsImhlYWRlckZvcm1EYXRhIiwiaGVhZGVyRGF0YVBvaW50RGF0YSIsIkZpZWxkR3JvdXAiLCJnZXRGaWVsZEdyb3VwRm9ybURhdGEiLCJEYXRhUG9pbnQiLCJnZXREYXRhUG9pbnREYXRhIiwiJHRhcmdldCIsInRlcm0iLCJpc0Fubm90YXRpb25GaWVsZFN0YXRpY2FsbHlIaWRkZW4iLCJ1bmRlZmluZWQiLCJ0eXBlIiwiQW5ub3RhdGlvbiIsImZhY2V0VHlwZSIsIlJlZmVyZW5jZSIsImlkIiwiY29udGFpbmVySWQiLCJnZXRIZWFkZXJGYWNldENvbnRhaW5lcklEIiwia2V5IiwidmlzaWJsZSIsImNvbXBpbGVFeHByZXNzaW9uIiwibm90IiwiZXF1YWwiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJhbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJjcmVhdGVDb2xsZWN0aW9uSGVhZGVyRmFjZXQiLCJmYWNldHMiLCJGYWNldHMiLCJDb2xsZWN0aW9uIiwiYW5ub3RhdGlvblR5cGUiLCJOb25lIiwiYW5ub3RhdGlvblR5cGVNYXAiLCJDaGFydCIsIklkZW50aWZpY2F0aW9uIiwiQ29udGFjdCIsIkFkZHJlc3MiLCJFcnJvciIsImZvcm1FbGVtZW50cyIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiZ2V0Rm9ybUVsZW1lbnRzRnJvbUFubm90YXRpb25zIiwiZ2V0Rm9ybUVsZW1lbnRzRnJvbU1hbmlmZXN0IiwiZ2V0SGVhZGVyRmFjZXRGb3JtSUQiLCJsYWJlbCIsImFubm90YXRpb25CYXNlZEZvcm1FbGVtZW50cyIsIkRhdGEiLCJkYXRhRmllbGQiLCJzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoIiwiZ2V0U2VtYW50aWNPYmplY3RQYXRoIiwiaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4iLCJpc1ZhbHVlTXVsdGlsaW5lVGV4dCIsIlZhbHVlIiwiTXVsdGlMaW5lVGV4dCIsIkZvcm1FbGVtZW50VHlwZSIsIktleUhlbHBlciIsImdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZCIsIkNvbW1vbiIsImlkUHJlZml4Iiwic2VtYW50aWNPYmplY3RQYXRoIiwiQ29udGVudCIsIlZpc3VhbGl6YXRpb24iLCJQcm9ncmVzc0luZGljYXRvciIsIlJhdGluZ0luZGljYXRvciIsImRhdGFQb2ludCIsInByb3BlcnR5IiwiU2VtYW50aWNPYmplY3QiLCJnZW5lcmF0ZUJpbmRpbmciLCJyZXF1ZXN0R3JvdXBJZCIsImdyb3VwSWQiLCJpbmRleE9mIiwiY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uIiwiaGVhZGVyRmFjZXRLZXkiLCJjdXN0b21IZWFkZXJGYWNldElEIiwiZ2V0Q3VzdG9tSGVhZGVyRmFjZXRJRCIsInBvc2l0aW9uIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJmcmFnbWVudE5hbWUiLCJ0ZW1wbGF0ZSIsIm5hbWUiLCJ0aXRsZSIsInN1YlRpdGxlIiwiYmluZGluZyIsInRlbXBsYXRlRWRpdCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSGVhZGVyRmFjZXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUge1xuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhUG9pbnQsXG5cdEZhY2V0VHlwZXMsXG5cdEZpZWxkR3JvdXAsXG5cdFJlZmVyZW5jZUZhY2V0VHlwZXNcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgZ2V0U2VtYW50aWNPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZU9iamVjdCwgQ29uZmlndXJhYmxlUmVjb3JkLCBDdXN0b21FbGVtZW50LCBQb3NpdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBpbnNlcnRDdXN0b21FbGVtZW50cywgUGxhY2VtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7XG5cdGdldEN1c3RvbUhlYWRlckZhY2V0SUQsXG5cdGdldEhlYWRlckZhY2V0Q29udGFpbmVySUQsXG5cdGdldEhlYWRlckZhY2V0Rm9ybUlELFxuXHRnZXRIZWFkZXJGYWNldElEXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSURcIjtcbmltcG9ydCB7IEtleUhlbHBlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvS2V5XCI7XG5pbXBvcnQgdHlwZSB7IE1hbmlmZXN0SGVhZGVyRmFjZXQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBlcXVhbCwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLCBub3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY3JlYXRlSWRGb3JBbm5vdGF0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IGlzQW5ub3RhdGlvbkZpZWxkU3RhdGljYWxseUhpZGRlbiwgaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4gfSBmcm9tIFwiLi4vLi4vaGVscGVycy9EYXRhRmllbGRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgQW5ub3RhdGlvbkZvcm1FbGVtZW50LCBGb3JtRWxlbWVudCB9IGZyb20gXCIuLi9Db21tb24vRm9ybVwiO1xuaW1wb3J0IHsgRm9ybUVsZW1lbnRUeXBlLCBnZXRGb3JtRWxlbWVudHNGcm9tTWFuaWZlc3QgfSBmcm9tIFwiLi4vQ29tbW9uL0Zvcm1cIjtcblxuLy8gcmVnaW9uIGRlZmluaXRpb25zXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIERlZmluaXRpb25zOiBIZWFkZXIgRmFjZXQgVHlwZXMsIEdlbmVyaWMgT1AgSGVhZGVyIEZhY2V0LCBNYW5pZmVzdCBQcm9wZXJ0aWVzIGZvciBDdXN0b20gSGVhZGVyIEZhY2V0XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZXhwb3J0IGVudW0gSGVhZGVyRmFjZXRUeXBlIHtcblx0QW5ub3RhdGlvbiA9IFwiQW5ub3RhdGlvblwiLFxuXHRYTUxGcmFnbWVudCA9IFwiWE1MRnJhZ21lbnRcIlxufVxuXG5leHBvcnQgZW51bSBGYWNldFR5cGUge1xuXHRSZWZlcmVuY2UgPSBcIlJlZmVyZW5jZVwiLFxuXHRDb2xsZWN0aW9uID0gXCJDb2xsZWN0aW9uXCJcbn1cblxuZXhwb3J0IGVudW0gRmxleERlc2lnblRpbWVUeXBlIHtcblx0RGVmYXVsdCA9IFwiRGVmYXVsdFwiLFxuXHROb3RBZGFwdGFibGUgPSBcIm5vdC1hZGFwdGFibGVcIiwgLy8gZGlzYWJsZSBhbGwgYWN0aW9ucyBvbiB0aGF0IGluc3RhbmNlXG5cdE5vdEFkYXB0YWJsZVRyZWUgPSBcIm5vdC1hZGFwdGFibGUtdHJlZVwiLCAvLyBkaXNhYmxlIGFsbCBhY3Rpb25zIG9uIHRoYXQgaW5zdGFuY2UgYW5kIG9uIGFsbCBjaGlsZHJlbiBvZiB0aGF0IGluc3RhbmNlXG5cdE5vdEFkYXB0YWJsZVZpc2liaWxpdHkgPSBcIm5vdC1hZGFwdGFibGUtdmlzaWJpbGl0eVwiIC8vIGRpc2FibGUgYWxsIGFjdGlvbnMgdGhhdCBpbmZsdWVuY2UgdGhlIHZpc2liaWxpdHksIG5hbWVseSByZXZlYWwgYW5kIHJlbW92ZVxufVxuXG5leHBvcnQgdHlwZSBGbGV4U2V0dGluZ3MgPSB7XG5cdGRlc2lnbnRpbWU/OiBGbGV4RGVzaWduVGltZVR5cGU7XG59O1xuXG50eXBlIEhlYWRlckZvcm1EYXRhID0ge1xuXHRpZDogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZztcblx0Zm9ybUVsZW1lbnRzOiBGb3JtRWxlbWVudFtdO1xufTtcblxuZW51bSBIZWFkZXJEYXRhUG9pbnRUeXBlIHtcblx0UHJvZ3Jlc3NJbmRpY2F0b3IgPSBcIlByb2dyZXNzSW5kaWNhdG9yXCIsXG5cdFJhdGluZ0luZGljYXRvciA9IFwiUmF0aW5nSW5kaWNhdG9yXCIsXG5cdENvbnRlbnQgPSBcIkNvbnRlbnRcIlxufVxuXG50eXBlIEhlYWRlckRhdGFQb2ludERhdGEgPSB7XG5cdHR5cGU6IEhlYWRlckRhdGFQb2ludFR5cGU7XG5cdHNlbWFudGljT2JqZWN0UGF0aD86IHN0cmluZztcbn07XG5cbmVudW0gVGFyZ2V0QW5ub3RhdGlvblR5cGUge1xuXHROb25lID0gXCJOb25lXCIsXG5cdERhdGFQb2ludCA9IFwiRGF0YVBvaW50XCIsXG5cdENoYXJ0ID0gXCJDaGFydFwiLFxuXHRJZGVudGlmaWNhdGlvbiA9IFwiSWRlbnRpZmljYXRpb25cIixcblx0Q29udGFjdCA9IFwiQ29udGFjdFwiLFxuXHRBZGRyZXNzID0gXCJBZGRyZXNzXCIsXG5cdEZpZWxkR3JvdXAgPSBcIkZpZWxkR3JvdXBcIlxufVxuXG50eXBlIEJhc2VIZWFkZXJGYWNldCA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0dHlwZT86IEhlYWRlckZhY2V0VHlwZTsgLy8gTWFuaWZlc3Qgb3IgTWV0YWRhdGFcblx0aWQ6IHN0cmluZztcblx0Y29udGFpbmVySWQ6IHN0cmluZztcblx0YW5ub3RhdGlvblBhdGg/OiBzdHJpbmc7XG5cdGZsZXhTZXR0aW5nczogRmxleFNldHRpbmdzO1xuXHRzdGFzaGVkOiBib29sZWFuO1xuXHR2aXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0dGFyZ2V0QW5ub3RhdGlvblZhbHVlPzogc3RyaW5nO1xuXHR0YXJnZXRBbm5vdGF0aW9uVHlwZT86IFRhcmdldEFubm90YXRpb25UeXBlO1xufTtcblxudHlwZSBCYXNlUmVmZXJlbmNlRmFjZXQgPSBCYXNlSGVhZGVyRmFjZXQgJiB7XG5cdGZhY2V0VHlwZTogRmFjZXRUeXBlLlJlZmVyZW5jZTtcbn07XG5cbmV4cG9ydCB0eXBlIEZpZWxkR3JvdXBGYWNldCA9IEJhc2VSZWZlcmVuY2VGYWNldCAmIHtcblx0aGVhZGVyRm9ybURhdGE6IEhlYWRlckZvcm1EYXRhO1xufTtcblxudHlwZSBEYXRhUG9pbnRGYWNldCA9IEJhc2VSZWZlcmVuY2VGYWNldCAmIHtcblx0aGVhZGVyRGF0YVBvaW50RGF0YT86IEhlYWRlckRhdGFQb2ludERhdGE7XG59O1xuXG50eXBlIFJlZmVyZW5jZUZhY2V0ID0gRmllbGRHcm91cEZhY2V0IHwgRGF0YVBvaW50RmFjZXQ7XG5cbmV4cG9ydCB0eXBlIENvbGxlY3Rpb25GYWNldCA9IEJhc2VIZWFkZXJGYWNldCAmIHtcblx0ZmFjZXRUeXBlOiBGYWNldFR5cGUuQ29sbGVjdGlvbjtcblx0ZmFjZXRzOiBSZWZlcmVuY2VGYWNldFtdO1xufTtcblxuZXhwb3J0IHR5cGUgT2JqZWN0UGFnZUhlYWRlckZhY2V0ID0gUmVmZXJlbmNlRmFjZXQgfCBDb2xsZWN0aW9uRmFjZXQ7XG5cbmV4cG9ydCB0eXBlIEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldCA9IEN1c3RvbUVsZW1lbnQ8T2JqZWN0UGFnZUhlYWRlckZhY2V0PiAmIHtcblx0ZnJhZ21lbnROYW1lPzogc3RyaW5nO1xuXHR0aXRsZT86IHN0cmluZztcblx0c3ViVGl0bGU/OiBzdHJpbmc7XG5cdHN0YXNoZWQ/OiBib29sZWFuO1xuXHRiaW5kaW5nPzogc3RyaW5nO1xuXHR0ZW1wbGF0ZUVkaXQ/OiBzdHJpbmc7XG59O1xuXG4vLyBlbmRyZWdpb24gZGVmaW5pdGlvbnNcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBDb2xsZWN0IEFsbCBIZWFkZXIgRmFjZXRzOiBDdXN0b20gKHZpYSBNYW5pZmVzdCkgYW5kIEFubm90YXRpb24gQmFzZWQgKHZpYSBNZXRhbW9kZWwpXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBSZXRyaWV2ZSBoZWFkZXIgZmFjZXRzIGZyb20gYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIEhlYWRlciBmYWNldHMgZnJvbSBhbm5vdGF0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBPYmplY3RQYWdlSGVhZGVyRmFjZXRbXSB7XG5cdGNvbnN0IGhlYWRlckZhY2V0czogT2JqZWN0UGFnZUhlYWRlckZhY2V0W10gPSBbXTtcblx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkuYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJGYWNldHM/LmZvckVhY2goKGZhY2V0KSA9PiB7XG5cdFx0Y29uc3QgaGVhZGVyRmFjZXQ6IE9iamVjdFBhZ2VIZWFkZXJGYWNldCB8IHVuZGVmaW5lZCA9IGNyZWF0ZUhlYWRlckZhY2V0KGZhY2V0LCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRpZiAoaGVhZGVyRmFjZXQpIHtcblx0XHRcdGhlYWRlckZhY2V0cy5wdXNoKGhlYWRlckZhY2V0KTtcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBoZWFkZXJGYWNldHM7XG59XG5cbi8qKlxuICogUmV0cmlldmUgY3VzdG9tIGhlYWRlciBmYWNldHMgZnJvbSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gbWFuaWZlc3RDdXN0b21IZWFkZXJGYWNldHNcbiAqIEByZXR1cm5zIEhlYWRlckZhY2V0cyBmcm9tIG1hbmlmZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QoXG5cdG1hbmlmZXN0Q3VzdG9tSGVhZGVyRmFjZXRzOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RIZWFkZXJGYWNldD5cbik6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldD4ge1xuXHRjb25zdCBjdXN0b21IZWFkZXJGYWNldHM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldD4gPSB7fTtcblxuXHRPYmplY3Qua2V5cyhtYW5pZmVzdEN1c3RvbUhlYWRlckZhY2V0cykuZm9yRWFjaCgobWFuaWZlc3RIZWFkZXJGYWNldEtleSkgPT4ge1xuXHRcdGNvbnN0IGN1c3RvbUhlYWRlckZhY2V0OiBNYW5pZmVzdEhlYWRlckZhY2V0ID0gbWFuaWZlc3RDdXN0b21IZWFkZXJGYWNldHNbbWFuaWZlc3RIZWFkZXJGYWNldEtleV07XG5cdFx0Y3VzdG9tSGVhZGVyRmFjZXRzW21hbmlmZXN0SGVhZGVyRmFjZXRLZXldID0gY3JlYXRlQ3VzdG9tSGVhZGVyRmFjZXQoY3VzdG9tSGVhZGVyRmFjZXQsIG1hbmlmZXN0SGVhZGVyRmFjZXRLZXkpO1xuXHR9KTtcblxuXHRyZXR1cm4gY3VzdG9tSGVhZGVyRmFjZXRzO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHN0YXNoZWQgc2V0dGluZ3MgZm9yIGhlYWRlciBmYWNldHMgZnJvbSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uXG4gKiBAcGFyYW0gY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvblxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFN0YXNoZWQgc2V0dGluZyBmb3IgaGVhZGVyIGZhY2V0IG9yIGZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGFzaGVkU2V0dGluZ3NGb3JIZWFkZXJGYWNldChcblx0ZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBib29sZWFuIHtcblx0Ly8gV2hlbiBhIEhlYWRlckZhY2V0IGlzIG5lc3RlZCBpbnNpZGUgYSBDb2xsZWN0aW9uRmFjZXQsIHN0YXNoaW5nIGlzIG5vdCBzdXBwb3J0ZWRcblx0aWYgKFxuXHRcdGZhY2V0RGVmaW5pdGlvbi4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQgJiZcblx0XHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXRcblx0KSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGNvbnN0IGhlYWRlckZhY2V0SUQgPSBjcmVhdGVJZEZvckFubm90YXRpb24oZmFjZXREZWZpbml0aW9uKSA/PyBcIlwiO1xuXHRjb25zdCBoZWFkZXJGYWNldHNDb250cm9sQ29uZmlnID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXRIZWFkZXJGYWNldHMoKTtcblx0Y29uc3Qgc3Rhc2hlZFNldHRpbmcgPSBoZWFkZXJGYWNldHNDb250cm9sQ29uZmlnW2hlYWRlckZhY2V0SURdPy5zdGFzaGVkO1xuXHRyZXR1cm4gc3Rhc2hlZFNldHRpbmcgPT09IHRydWU7XG59XG5cbi8qKlxuICogUmV0cmlldmUgZmxleGliaWxpdHkgZGVzaWdudGltZSBzZXR0aW5ncyBmcm9tIG1hbmlmZXN0LlxuICpcbiAqIEBwYXJhbSBmYWNldERlZmluaXRpb25cbiAqIEBwYXJhbSBjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgRGVzaWdudGltZSBzZXR0aW5nIG9yIGRlZmF1bHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlc2lnblRpbWVNZXRhZGF0YVNldHRpbmdzRm9ySGVhZGVyRmFjZXQoXG5cdGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcyxcblx0Y29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogRmxleERlc2lnblRpbWVUeXBlIHtcblx0bGV0IGRlc2lnblRpbWVNZXRhZGF0YTogRmxleERlc2lnblRpbWVUeXBlID0gRmxleERlc2lnblRpbWVUeXBlLkRlZmF1bHQ7XG5cdGNvbnN0IGhlYWRlckZhY2V0SUQgPSBjcmVhdGVJZEZvckFubm90YXRpb24oZmFjZXREZWZpbml0aW9uKTtcblxuXHQvLyBGb3IgSGVhZGVyRmFjZXRzIG5lc3RlZCBpbnNpZGUgQ29sbGVjdGlvbkZhY2V0IFJUQSBzaG91bGQgYmUgZGlzYWJsZWQsIHRoZXJlZm9yZSBzZXQgdG8gXCJub3QtYWRhcHRhYmxlLXRyZWVcIlxuXHRpZiAoXG5cdFx0ZmFjZXREZWZpbml0aW9uLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldCAmJlxuXHRcdGNvbGxlY3Rpb25GYWNldERlZmluaXRpb24uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkNvbGxlY3Rpb25GYWNldFxuXHQpIHtcblx0XHRkZXNpZ25UaW1lTWV0YWRhdGEgPSBGbGV4RGVzaWduVGltZVR5cGUuTm90QWRhcHRhYmxlVHJlZTtcblx0fSBlbHNlIHtcblx0XHRjb25zdCBoZWFkZXJGYWNldHNDb250cm9sQ29uZmlnID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXRIZWFkZXJGYWNldHMoKTtcblx0XHRpZiAoaGVhZGVyRmFjZXRJRCkge1xuXHRcdFx0Y29uc3QgZGVzaWduVGltZSA9IGhlYWRlckZhY2V0c0NvbnRyb2xDb25maWdbaGVhZGVyRmFjZXRJRF0/LmZsZXhTZXR0aW5ncz8uZGVzaWdudGltZTtcblx0XHRcdHN3aXRjaCAoZGVzaWduVGltZSkge1xuXHRcdFx0XHRjYXNlIEZsZXhEZXNpZ25UaW1lVHlwZS5Ob3RBZGFwdGFibGU6XG5cdFx0XHRcdGNhc2UgRmxleERlc2lnblRpbWVUeXBlLk5vdEFkYXB0YWJsZVRyZWU6XG5cdFx0XHRcdGNhc2UgRmxleERlc2lnblRpbWVUeXBlLk5vdEFkYXB0YWJsZVZpc2liaWxpdHk6XG5cdFx0XHRcdFx0ZGVzaWduVGltZU1ldGFkYXRhID0gZGVzaWduVGltZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGRlc2lnblRpbWVNZXRhZGF0YTtcbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBDb252ZXJ0ICYgQnVpbGQgQW5ub3RhdGlvbiBCYXNlZCBIZWFkZXIgRmFjZXRzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmZ1bmN0aW9uIGNyZWF0ZVJlZmVyZW5jZUhlYWRlckZhY2V0KFxuXHRmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsXG5cdGNvbGxlY3Rpb25GYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlZmVyZW5jZUZhY2V0IHwgdW5kZWZpbmVkIHtcblx0aWYgKGZhY2V0RGVmaW5pdGlvbi4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQgJiYgIShmYWNldERlZmluaXRpb24uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkpIHtcblx0XHRjb25zdCBoZWFkZXJGYWNldElEID0gZ2V0SGVhZGVyRmFjZXRJRChmYWNldERlZmluaXRpb24pLFxuXHRcdFx0Z2V0SGVhZGVyRmFjZXRLZXkgPSAoZmFjZXREZWZpbml0aW9uVG9DaGVjazogRmFjZXRUeXBlcywgZmFsbGJhY2s6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdFx0XHRcdHJldHVybiBmYWNldERlZmluaXRpb25Ub0NoZWNrLklEPy50b1N0cmluZygpIHx8IGZhY2V0RGVmaW5pdGlvblRvQ2hlY2suTGFiZWw/LnRvU3RyaW5nKCkgfHwgZmFsbGJhY2s7XG5cdFx0XHR9LFxuXHRcdFx0dGFyZ2V0QW5ub3RhdGlvblZhbHVlID0gZmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZSxcblx0XHRcdHRhcmdldEFubm90YXRpb25UeXBlID0gZ2V0VGFyZ2V0QW5ub3RhdGlvblR5cGUoZmFjZXREZWZpbml0aW9uKTtcblxuXHRcdGxldCBoZWFkZXJGb3JtRGF0YTogSGVhZGVyRm9ybURhdGEgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IGhlYWRlckRhdGFQb2ludERhdGE6IEhlYWRlckRhdGFQb2ludERhdGEgfCB1bmRlZmluZWQ7XG5cblx0XHRzd2l0Y2ggKHRhcmdldEFubm90YXRpb25UeXBlKSB7XG5cdFx0XHRjYXNlIFRhcmdldEFubm90YXRpb25UeXBlLkZpZWxkR3JvdXA6XG5cdFx0XHRcdGhlYWRlckZvcm1EYXRhID0gZ2V0RmllbGRHcm91cEZvcm1EYXRhKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFRhcmdldEFubm90YXRpb25UeXBlLkRhdGFQb2ludDpcblx0XHRcdFx0aGVhZGVyRGF0YVBvaW50RGF0YSA9IGdldERhdGFQb2ludERhdGEoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHQvLyBUb0RvOiBIYW5kbGUgb3RoZXIgY2FzZXNcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdGNvbnN0IHsgYW5ub3RhdGlvbnMgfSA9IGZhY2V0RGVmaW5pdGlvbjtcblx0XHRpZiAoXG5cdFx0XHRmYWNldERlZmluaXRpb24uVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5DaGFydCAmJlxuXHRcdFx0aXNBbm5vdGF0aW9uRmllbGRTdGF0aWNhbGx5SGlkZGVuKGZhY2V0RGVmaW5pdGlvbiBhcyBhbnkpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBIZWFkZXJGYWNldFR5cGUuQW5ub3RhdGlvbixcblx0XHRcdFx0ZmFjZXRUeXBlOiBGYWNldFR5cGUuUmVmZXJlbmNlLFxuXHRcdFx0XHRpZDogaGVhZGVyRmFjZXRJRCxcblx0XHRcdFx0Y29udGFpbmVySWQ6IGdldEhlYWRlckZhY2V0Q29udGFpbmVySUQoZmFjZXREZWZpbml0aW9uKSxcblx0XHRcdFx0a2V5OiBnZXRIZWFkZXJGYWNldEtleShmYWNldERlZmluaXRpb24sIGhlYWRlckZhY2V0SUQpLFxuXHRcdFx0XHRmbGV4U2V0dGluZ3M6IHtcblx0XHRcdFx0XHRkZXNpZ250aW1lOiBnZXREZXNpZ25UaW1lTWV0YWRhdGFTZXR0aW5nc0ZvckhlYWRlckZhY2V0KGZhY2V0RGVmaW5pdGlvbiwgY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dClcblx0XHRcdFx0fSxcblx0XHRcdFx0c3Rhc2hlZDogZ2V0U3Rhc2hlZFNldHRpbmdzRm9ySGVhZGVyRmFjZXQoZmFjZXREZWZpbml0aW9uLCBjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24obm90KGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihhbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpKSwgdHJ1ZSkpKSxcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGAke2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChmYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lKX0vYCxcblx0XHRcdFx0dGFyZ2V0QW5ub3RhdGlvblZhbHVlLFxuXHRcdFx0XHR0YXJnZXRBbm5vdGF0aW9uVHlwZSxcblx0XHRcdFx0aGVhZGVyRm9ybURhdGEsXG5cdFx0XHRcdGhlYWRlckRhdGFQb2ludERhdGFcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29sbGVjdGlvbkhlYWRlckZhY2V0KFxuXHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBDb2xsZWN0aW9uRmFjZXQgfCB1bmRlZmluZWQge1xuXHRpZiAoY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbi4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0KSB7XG5cdFx0Y29uc3QgZmFjZXRzOiBSZWZlcmVuY2VGYWNldFtdID0gW10sXG5cdFx0XHRoZWFkZXJGYWNldElEID0gZ2V0SGVhZGVyRmFjZXRJRChjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uKSxcblx0XHRcdGdldEhlYWRlckZhY2V0S2V5ID0gKGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcywgZmFsbGJhY2s6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdFx0XHRcdHJldHVybiBmYWNldERlZmluaXRpb24uSUQ/LnRvU3RyaW5nKCkgfHwgZmFjZXREZWZpbml0aW9uLkxhYmVsPy50b1N0cmluZygpIHx8IGZhbGxiYWNrO1xuXHRcdFx0fTtcblxuXHRcdGNvbGxlY3Rpb25GYWNldERlZmluaXRpb24uRmFjZXRzLmZvckVhY2goKGZhY2V0RGVmaW5pdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgZmFjZXQ6IFJlZmVyZW5jZUZhY2V0IHwgdW5kZWZpbmVkID0gY3JlYXRlUmVmZXJlbmNlSGVhZGVyRmFjZXQoXG5cdFx0XHRcdGZhY2V0RGVmaW5pdGlvbixcblx0XHRcdFx0Y29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbixcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0KTtcblx0XHRcdGlmIChmYWNldCkge1xuXHRcdFx0XHRmYWNldHMucHVzaChmYWNldCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogSGVhZGVyRmFjZXRUeXBlLkFubm90YXRpb24sXG5cdFx0XHRmYWNldFR5cGU6IEZhY2V0VHlwZS5Db2xsZWN0aW9uLFxuXHRcdFx0aWQ6IGhlYWRlckZhY2V0SUQsXG5cdFx0XHRjb250YWluZXJJZDogZ2V0SGVhZGVyRmFjZXRDb250YWluZXJJRChjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uKSxcblx0XHRcdGtleTogZ2V0SGVhZGVyRmFjZXRLZXkoY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbiwgaGVhZGVyRmFjZXRJRCksXG5cdFx0XHRmbGV4U2V0dGluZ3M6IHtcblx0XHRcdFx0ZGVzaWdudGltZTogZ2V0RGVzaWduVGltZU1ldGFkYXRhU2V0dGluZ3NGb3JIZWFkZXJGYWNldChcblx0XHRcdFx0XHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLFxuXHRcdFx0XHRcdGNvbGxlY3Rpb25GYWNldERlZmluaXRpb24sXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0XHQpXG5cdFx0XHR9LFxuXHRcdFx0c3Rhc2hlZDogZ2V0U3Rhc2hlZFNldHRpbmdzRm9ySGVhZGVyRmFjZXQoY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbiwgY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0bm90KGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkpLCB0cnVlKSlcblx0XHRcdCksXG5cdFx0XHRhbm5vdGF0aW9uUGF0aDogYCR7Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGNvbGxlY3Rpb25GYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lKX0vYCxcblx0XHRcdGZhY2V0c1xuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBnZXRUYXJnZXRBbm5vdGF0aW9uVHlwZShmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMpOiBUYXJnZXRBbm5vdGF0aW9uVHlwZSB7XG5cdGxldCBhbm5vdGF0aW9uVHlwZSA9IFRhcmdldEFubm90YXRpb25UeXBlLk5vbmU7XG5cdGNvbnN0IGFubm90YXRpb25UeXBlTWFwOiBSZWNvcmQ8c3RyaW5nLCBUYXJnZXRBbm5vdGF0aW9uVHlwZT4gPSB7XG5cdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIjogVGFyZ2V0QW5ub3RhdGlvblR5cGUuRGF0YVBvaW50LFxuXHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIjogVGFyZ2V0QW5ub3RhdGlvblR5cGUuQ2hhcnQsXG5cdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JZGVudGlmaWNhdGlvblwiOiBUYXJnZXRBbm5vdGF0aW9uVHlwZS5JZGVudGlmaWNhdGlvbixcblx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFwiOiBUYXJnZXRBbm5vdGF0aW9uVHlwZS5Db250YWN0LFxuXHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5BZGRyZXNzXCI6IFRhcmdldEFubm90YXRpb25UeXBlLkFkZHJlc3MsXG5cdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwXCI6IFRhcmdldEFubm90YXRpb25UeXBlLkZpZWxkR3JvdXBcblx0fTtcblx0Ly8gUmVmZXJlbmNlVVJMRmFjZXQgYW5kIENvbGxlY3Rpb25GYWNldCBkbyBub3QgaGF2ZSBUYXJnZXQgcHJvcGVydHkuXG5cdGlmIChmYWNldERlZmluaXRpb24uJFR5cGUgIT09IFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZVVSTEZhY2V0ICYmIGZhY2V0RGVmaW5pdGlvbi4kVHlwZSAhPT0gVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0KSB7XG5cdFx0YW5ub3RhdGlvblR5cGUgPSBhbm5vdGF0aW9uVHlwZU1hcFtmYWNldERlZmluaXRpb24uVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtXSB8fCBUYXJnZXRBbm5vdGF0aW9uVHlwZS5Ob25lO1xuXHR9XG5cblx0cmV0dXJuIGFubm90YXRpb25UeXBlO1xufVxuXG5mdW5jdGlvbiBnZXRGaWVsZEdyb3VwRm9ybURhdGEoZmFjZXREZWZpbml0aW9uOiBSZWZlcmVuY2VGYWNldFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogSGVhZGVyRm9ybURhdGEge1xuXHQvLyBzcGxpdCBpbiB0aGlzIGZyb20gYW5ub3RhdGlvbiArIGdldEZpZWxkR3JvdXBGcm9tRGVmYXVsdFxuXHRpZiAoIWZhY2V0RGVmaW5pdGlvbikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBnZXQgRmllbGRHcm91cCBmb3JtIGRhdGEgd2l0aG91dCBmYWNldCBkZWZpbml0aW9uXCIpO1xuXHR9XG5cblx0Y29uc3QgZm9ybUVsZW1lbnRzID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoXG5cdFx0Z2V0Rm9ybUVsZW1lbnRzRnJvbUFubm90YXRpb25zKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0Z2V0Rm9ybUVsZW1lbnRzRnJvbU1hbmlmZXN0KGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dClcblx0KTtcblxuXHRyZXR1cm4ge1xuXHRcdGlkOiBnZXRIZWFkZXJGYWNldEZvcm1JRChmYWNldERlZmluaXRpb24pLFxuXHRcdGxhYmVsOiBmYWNldERlZmluaXRpb24uTGFiZWw/LnRvU3RyaW5nKCksXG5cdFx0Zm9ybUVsZW1lbnRzXG5cdH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBtYW5pZmVzdC1iYXNlZCBGb3JtRWxlbWVudHMuXG4gKlxuICogQHBhcmFtIGZhY2V0RGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiBvZiB0aGUgZmFjZXRcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dCBmb3IgdGhlIGZhY2V0XG4gKiBAcmV0dXJucyBBbm5vdGF0aW9uLWJhc2VkIEZvcm1FbGVtZW50c1xuICovXG5mdW5jdGlvbiBnZXRGb3JtRWxlbWVudHNGcm9tQW5ub3RhdGlvbnMoZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQW5ub3RhdGlvbkZvcm1FbGVtZW50W10ge1xuXHRjb25zdCBhbm5vdGF0aW9uQmFzZWRGb3JtRWxlbWVudHM6IEFubm90YXRpb25Gb3JtRWxlbWVudFtdID0gW107XG5cblx0Ly8gUmVmZXJlbmNlVVJMRmFjZXQgYW5kIENvbGxlY3Rpb25GYWNldCBkbyBub3QgaGF2ZSBUYXJnZXQgcHJvcGVydHkuXG5cdGlmIChmYWNldERlZmluaXRpb24uJFR5cGUgIT09IFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZVVSTEZhY2V0ICYmIGZhY2V0RGVmaW5pdGlvbi4kVHlwZSAhPT0gVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0KSB7XG5cdFx0KGZhY2V0RGVmaW5pdGlvbi5UYXJnZXQ/LiR0YXJnZXQgYXMgRmllbGRHcm91cCk/LkRhdGEuZm9yRWFjaCgoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0XHRpZiAoIShkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkpIHtcblx0XHRcdFx0Y29uc3Qgc2VtYW50aWNPYmplY3RBbm5vdGF0aW9uUGF0aCA9IGdldFNlbWFudGljT2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0LCBkYXRhRmllbGQpO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0KGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkIHx8XG5cdFx0XHRcdFx0XHRkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmwgfHxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoIHx8XG5cdFx0XHRcdFx0XHRkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb24gfHxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbikgJiZcblx0XHRcdFx0XHQhaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4oZGF0YUZpZWxkKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRjb25zdCB7IGFubm90YXRpb25zIH0gPSBkYXRhRmllbGQ7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbkJhc2VkRm9ybUVsZW1lbnRzLnB1c2goe1xuXHRcdFx0XHRcdFx0aXNWYWx1ZU11bHRpbGluZVRleHQ6IGRhdGFGaWVsZC5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LlVJPy5NdWx0aUxpbmVUZXh0Py52YWx1ZU9mKCkgPT09IHRydWUsXG5cdFx0XHRcdFx0XHR0eXBlOiBGb3JtRWxlbWVudFR5cGUuQW5ub3RhdGlvbixcblx0XHRcdFx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpLFxuXHRcdFx0XHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24obm90KGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihhbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpKSwgdHJ1ZSkpKSxcblx0XHRcdFx0XHRcdGxhYmVsOiBkYXRhRmllbGQuVmFsdWU/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsIHx8IGRhdGFGaWVsZC5MYWJlbCxcblx0XHRcdFx0XHRcdGlkUHJlZml4OiBnZXRIZWFkZXJGYWNldEZvcm1JRChmYWNldERlZmluaXRpb24sIGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogYCR7Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGRhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpfS9gLFxuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3RQYXRoOiBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0XHRcdFx0IWlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuKGRhdGFGaWVsZClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBhbm5vdGF0aW9ucyB9ID0gZGF0YUZpZWxkO1xuXHRcdFx0XHRcdGFubm90YXRpb25CYXNlZEZvcm1FbGVtZW50cy5wdXNoKHtcblx0XHRcdFx0XHRcdC8vIEZJWE1FIHRoaXMgaXMgd3JvbmcsIHRoZSBhbm5vdGF0aW9uIHNob3VsZCBleGlzdCwgc28gdGhlIHRhcmdldCBpcyBub3QgcHJvcGVybHkgaWRlbnRpZmllZFxuXHRcdFx0XHRcdFx0aXNWYWx1ZU11bHRpbGluZVRleHQ6IChkYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uVUkgYXMgYW55KT8uTXVsdGlMaW5lVGV4dD8udmFsdWVPZigpID09PSB0cnVlLFxuXHRcdFx0XHRcdFx0dHlwZTogRm9ybUVsZW1lbnRUeXBlLkFubm90YXRpb24sXG5cdFx0XHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKSxcblx0XHRcdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSksIHRydWUpKSksXG5cdFx0XHRcdFx0XHRsYWJlbDogZGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnRvU3RyaW5nKCkgfHwgZGF0YUZpZWxkLkxhYmVsPy50b1N0cmluZygpLFxuXHRcdFx0XHRcdFx0aWRQcmVmaXg6IGdldEhlYWRlckZhY2V0Rm9ybUlEKGZhY2V0RGVmaW5pdGlvbiwgZGF0YUZpZWxkKSxcblx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBgJHtjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSl9L2AsXG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdFBhdGg6IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGhcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIGFubm90YXRpb25CYXNlZEZvcm1FbGVtZW50cztcbn1cblxuZnVuY3Rpb24gZ2V0RGF0YVBvaW50RGF0YShmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBIZWFkZXJEYXRhUG9pbnREYXRhIHtcblx0bGV0IHR5cGUgPSBIZWFkZXJEYXRhUG9pbnRUeXBlLkNvbnRlbnQ7XG5cdGxldCBzZW1hbnRpY09iamVjdFBhdGg7XG5cdGlmIChmYWNldERlZmluaXRpb24uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0ICYmICFpc0Fubm90YXRpb25GaWVsZFN0YXRpY2FsbHlIaWRkZW4oZmFjZXREZWZpbml0aW9uIGFzIGFueSkpIHtcblx0XHRpZiAoKGZhY2V0RGVmaW5pdGlvbi5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50KT8uVmlzdWFsaXphdGlvbiA9PT0gXCJVSS5WaXN1YWxpemF0aW9uVHlwZS9Qcm9ncmVzc1wiKSB7XG5cdFx0XHR0eXBlID0gSGVhZGVyRGF0YVBvaW50VHlwZS5Qcm9ncmVzc0luZGljYXRvcjtcblx0XHR9IGVsc2UgaWYgKChmYWNldERlZmluaXRpb24uVGFyZ2V0Py4kdGFyZ2V0IGFzIERhdGFQb2ludCk/LlZpc3VhbGl6YXRpb24gPT09IFwiVUkuVmlzdWFsaXphdGlvblR5cGUvUmF0aW5nXCIpIHtcblx0XHRcdHR5cGUgPSBIZWFkZXJEYXRhUG9pbnRUeXBlLlJhdGluZ0luZGljYXRvcjtcblx0XHR9XG5cdFx0Y29uc3QgZGF0YVBvaW50ID0gZmFjZXREZWZpbml0aW9uLlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQ7XG5cblx0XHRpZiAodHlwZW9mIGRhdGFQb2ludCA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0aWYgKGRhdGFQb2ludD8uVmFsdWU/LiR0YXJnZXQpIHtcblx0XHRcdFx0Y29uc3QgcHJvcGVydHkgPSBkYXRhUG9pbnQuVmFsdWUuJHRhcmdldDtcblx0XHRcdFx0aWYgKHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKHByb3BlcnR5Py5mdWxseVF1YWxpZmllZE5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHsgdHlwZSwgc2VtYW50aWNPYmplY3RQYXRoIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhbm5vdGF0aW9uLWJhc2VkIGhlYWRlciBmYWNldC5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIG9mIHRoZSBmYWNldFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBhbm5vdGF0aW9uLWJhc2VkIGhlYWRlciBmYWNldFxuICovXG5mdW5jdGlvbiBjcmVhdGVIZWFkZXJGYWNldChmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBPYmplY3RQYWdlSGVhZGVyRmFjZXQgfCB1bmRlZmluZWQge1xuXHRsZXQgaGVhZGVyRmFjZXQ6IE9iamVjdFBhZ2VIZWFkZXJGYWNldCB8IHVuZGVmaW5lZDtcblx0c3dpdGNoIChmYWNldERlZmluaXRpb24uJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0OlxuXHRcdFx0aGVhZGVyRmFjZXQgPSBjcmVhdGVSZWZlcmVuY2VIZWFkZXJGYWNldChmYWNldERlZmluaXRpb24sIGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0aGVhZGVyRmFjZXQgPSBjcmVhdGVDb2xsZWN0aW9uSGVhZGVyRmFjZXQoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiBoZWFkZXJGYWNldDtcbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBDb252ZXJ0ICYgQnVpbGQgTWFuaWZlc3QgQmFzZWQgSGVhZGVyIEZhY2V0c1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIGdlbmVyYXRlQmluZGluZyhyZXF1ZXN0R3JvdXBJZD86IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmICghcmVxdWVzdEdyb3VwSWQpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGNvbnN0IGdyb3VwSWQgPVxuXHRcdFtcIkhlcm9lc1wiLCBcIkRlY29yYXRpb25cIiwgXCJXb3JrZXJzXCIsIFwiTG9uZ1J1bm5lcnNcIl0uaW5kZXhPZihyZXF1ZXN0R3JvdXBJZCkgIT09IC0xID8gYCRhdXRvLiR7cmVxdWVzdEdyb3VwSWR9YCA6IHJlcXVlc3RHcm91cElkO1xuXG5cdHJldHVybiBgeyBwYXRoIDogJycsIHBhcmFtZXRlcnMgOiB7ICQkZ3JvdXBJZCA6ICcke2dyb3VwSWR9JyB9IH1gO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1hbmlmZXN0IGJhc2VkIGN1c3RvbSBoZWFkZXIgZmFjZXQuXG4gKlxuICogQHBhcmFtIGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvblxuICogQHBhcmFtIGhlYWRlckZhY2V0S2V5XG4gKiBAcmV0dXJucyBUaGUgbWFuaWZlc3QgYmFzZWQgY3VzdG9tIGhlYWRlciBmYWNldCBjcmVhdGVkXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0KGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbjogTWFuaWZlc3RIZWFkZXJGYWNldCwgaGVhZGVyRmFjZXRLZXk6IHN0cmluZyk6IEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldCB7XG5cdGNvbnN0IGN1c3RvbUhlYWRlckZhY2V0SUQgPSBnZXRDdXN0b21IZWFkZXJGYWNldElEKGhlYWRlckZhY2V0S2V5KTtcblxuXHRsZXQgcG9zaXRpb246IFBvc2l0aW9uIHwgdW5kZWZpbmVkID0gY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnBvc2l0aW9uO1xuXHRpZiAoIXBvc2l0aW9uKSB7XG5cdFx0cG9zaXRpb24gPSB7XG5cdFx0XHRwbGFjZW1lbnQ6IFBsYWNlbWVudC5BZnRlclxuXHRcdH07XG5cdH1cblx0Ly8gVE9ETyBmb3IgYW4gbm9uIGFubm90YXRpb24gZnJhZ21lbnQgdGhlIG5hbWUgaXMgbWFuZGF0b3J5IC0+IE5vdCBjaGVja2VkXG5cdHJldHVybiB7XG5cdFx0ZmFjZXRUeXBlOiBGYWNldFR5cGUuUmVmZXJlbmNlLFxuXHRcdGZhY2V0czogW10sXG5cdFx0dHlwZTogY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnR5cGUsXG5cdFx0aWQ6IGN1c3RvbUhlYWRlckZhY2V0SUQsXG5cdFx0Y29udGFpbmVySWQ6IGN1c3RvbUhlYWRlckZhY2V0SUQsXG5cdFx0a2V5OiBoZWFkZXJGYWNldEtleSxcblx0XHRwb3NpdGlvbjogcG9zaXRpb24sXG5cdFx0dmlzaWJsZTogY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnZpc2libGUsXG5cdFx0ZnJhZ21lbnROYW1lOiBjdXN0b21IZWFkZXJGYWNldERlZmluaXRpb24udGVtcGxhdGUgfHwgY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLm5hbWUsXG5cdFx0dGl0bGU6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi50aXRsZSxcblx0XHRzdWJUaXRsZTogY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnN1YlRpdGxlLFxuXHRcdHN0YXNoZWQ6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi5zdGFzaGVkIHx8IGZhbHNlLFxuXHRcdGZsZXhTZXR0aW5nczogeyAuLi57IGRlc2lnbnRpbWU6IEZsZXhEZXNpZ25UaW1lVHlwZS5EZWZhdWx0IH0sIC4uLmN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi5mbGV4U2V0dGluZ3MgfSxcblx0XHRiaW5kaW5nOiBnZW5lcmF0ZUJpbmRpbmcoY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnJlcXVlc3RHcm91cElkKSxcblx0XHR0ZW1wbGF0ZUVkaXQ6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi50ZW1wbGF0ZUVkaXRcblx0fTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQTJCQTtFQUNBO0VBQ0E7RUFDQTtFQUFBLElBRVlBLGVBQWU7RUFBQSxXQUFmQSxlQUFlO0lBQWZBLGVBQWU7SUFBZkEsZUFBZTtFQUFBLEdBQWZBLGVBQWUsS0FBZkEsZUFBZTtFQUFBO0VBQUEsSUFLZkMsU0FBUztFQUFBLFdBQVRBLFNBQVM7SUFBVEEsU0FBUztJQUFUQSxTQUFTO0VBQUEsR0FBVEEsU0FBUyxLQUFUQSxTQUFTO0VBQUE7RUFBQSxJQUtUQyxrQkFBa0I7RUFBQSxXQUFsQkEsa0JBQWtCO0lBQWxCQSxrQkFBa0I7SUFBbEJBLGtCQUFrQjtJQUFsQkEsa0JBQWtCO0lBQWxCQSxrQkFBa0I7RUFBQSxHQUFsQkEsa0JBQWtCLEtBQWxCQSxrQkFBa0I7RUFBQTtFQUFBLElBaUJ6QkMsbUJBQW1CO0VBQUEsV0FBbkJBLG1CQUFtQjtJQUFuQkEsbUJBQW1CO0lBQW5CQSxtQkFBbUI7SUFBbkJBLG1CQUFtQjtFQUFBLEdBQW5CQSxtQkFBbUIsS0FBbkJBLG1CQUFtQjtFQUFBLElBV25CQyxvQkFBb0I7RUFBQSxXQUFwQkEsb0JBQW9CO0lBQXBCQSxvQkFBb0I7SUFBcEJBLG9CQUFvQjtJQUFwQkEsb0JBQW9CO0lBQXBCQSxvQkFBb0I7SUFBcEJBLG9CQUFvQjtJQUFwQkEsb0JBQW9CO0lBQXBCQSxvQkFBb0I7RUFBQSxHQUFwQkEsb0JBQW9CLEtBQXBCQSxvQkFBb0I7RUFvRHpC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