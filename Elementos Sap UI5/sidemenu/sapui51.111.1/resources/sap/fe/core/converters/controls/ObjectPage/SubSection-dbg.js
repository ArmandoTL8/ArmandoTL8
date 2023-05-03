/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/controls/ObjectPage/HeaderFacet", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "../../helpers/ConfigurableObject", "../../helpers/ID", "../../ManifestSettings", "../../objectPage/FormMenuActions", "../Common/DataVisualization", "../Common/Form"], function (Log, Action, HeaderFacet, IssueManager, Key, BindingToolkit, ConfigurableObject, ID, ManifestSettings, FormMenuActions, DataVisualization, Form) {
  "use strict";

  var _exports = {};
  var isReferenceFacet = Form.isReferenceFacet;
  var createFormDefinition = Form.createFormDefinition;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var getVisibilityEnablementFormMenuActions = FormMenuActions.getVisibilityEnablementFormMenuActions;
  var getFormHiddenActions = FormMenuActions.getFormHiddenActions;
  var getFormActions = FormMenuActions.getFormActions;
  var ActionType = ManifestSettings.ActionType;
  var getSubSectionID = ID.getSubSectionID;
  var getSideContentID = ID.getSideContentID;
  var getFormID = ID.getFormID;
  var getCustomSubSectionID = ID.getCustomSubSectionID;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ref = BindingToolkit.ref;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var notEqual = BindingToolkit.notEqual;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var fn = BindingToolkit.fn;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  var getStashedSettingsForHeaderFacet = HeaderFacet.getStashedSettingsForHeaderFacet;
  var getHeaderFacetsFromManifest = HeaderFacet.getHeaderFacetsFromManifest;
  var getDesignTimeMetadataSettingsForHeaderFacet = HeaderFacet.getDesignTimeMetadataSettingsForHeaderFacet;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var isActionNavigable = Action.isActionNavigable;
  var getSemanticObjectMapping = Action.getSemanticObjectMapping;
  var getEnabledForAnnotationAction = Action.getEnabledForAnnotationAction;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var ButtonType = Action.ButtonType;
  let SubSectionType;
  (function (SubSectionType) {
    SubSectionType["Unknown"] = "Unknown";
    SubSectionType["Form"] = "Form";
    SubSectionType["DataVisualization"] = "DataVisualization";
    SubSectionType["XMLFragment"] = "XMLFragment";
    SubSectionType["Placeholder"] = "Placeholder";
    SubSectionType["Mixed"] = "Mixed";
  })(SubSectionType || (SubSectionType = {}));
  _exports.SubSectionType = SubSectionType;
  const visualizationTerms = ["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.Chart", "com.sap.vocabularies.UI.v1.PresentationVariant", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant"];

  /**
   * Create subsections based on facet definition.
   *
   * @param facetCollection Collection of facets
   * @param converterContext The converter context
   * @param isHeaderSection True if header section is generated in this iteration
   * @returns The current subsections
   */
  function createSubSections(facetCollection, converterContext, isHeaderSection) {
    // First we determine which sub section we need to create
    const facetsToCreate = facetCollection.reduce((facetsToCreate, facetDefinition) => {
      switch (facetDefinition.$Type) {
        case "com.sap.vocabularies.UI.v1.ReferenceFacet":
          facetsToCreate.push(facetDefinition);
          break;
        case "com.sap.vocabularies.UI.v1.CollectionFacet":
          // TODO If the Collection Facet has a child of type Collection Facet we bring them up one level (Form + Table use case) ?
          // first case facet Collection is combination of collection and reference facet or not all facets are reference facets.
          if (facetDefinition.Facets.find(facetType => facetType.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet")) {
            facetsToCreate.splice(facetsToCreate.length, 0, ...facetDefinition.Facets);
          } else {
            facetsToCreate.push(facetDefinition);
          }
          break;
        case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
          // Not supported
          break;
      }
      return facetsToCreate;
    }, []);

    // Then we create the actual subsections
    return facetsToCreate.map(facet => {
      var _Facets;
      return createSubSection(facet, facetsToCreate, converterContext, 0, !(facet !== null && facet !== void 0 && (_Facets = facet.Facets) !== null && _Facets !== void 0 && _Facets.length), isHeaderSection);
    });
  }

  /**
   * Creates subsections based on the definition of the custom header facet.
   *
   * @param converterContext The converter context
   * @returns The current subsections
   */
  _exports.createSubSections = createSubSections;
  function createCustomHeaderFacetSubSections(converterContext) {
    const customHeaderFacets = getHeaderFacetsFromManifest(converterContext.getManifestWrapper().getHeaderFacets());
    const aCustomHeaderFacets = [];
    Object.keys(customHeaderFacets).forEach(function (key) {
      aCustomHeaderFacets.push(customHeaderFacets[key]);
      return aCustomHeaderFacets;
    });
    const facetsToCreate = aCustomHeaderFacets.reduce((facetsToCreate, customHeaderFacet) => {
      if (customHeaderFacet.templateEdit) {
        facetsToCreate.push(customHeaderFacet);
      }
      return facetsToCreate;
    }, []);
    return facetsToCreate.map(customHeaderFacet => createCustomHeaderFacetSubSection(customHeaderFacet));
  }

  /**
   * Creates a subsection based on a custom header facet.
   *
   * @param customHeaderFacet A custom header facet
   * @returns A definition for a subsection
   */
  _exports.createCustomHeaderFacetSubSections = createCustomHeaderFacetSubSections;
  function createCustomHeaderFacetSubSection(customHeaderFacet) {
    const subSectionID = getCustomSubSectionID(customHeaderFacet.key);
    const subSection = {
      id: subSectionID,
      key: customHeaderFacet.key,
      title: customHeaderFacet.title,
      type: SubSectionType.XMLFragment,
      template: customHeaderFacet.templateEdit || "",
      visible: customHeaderFacet.visible,
      level: 1,
      sideContent: undefined,
      stashed: customHeaderFacet.stashed,
      flexSettings: customHeaderFacet.flexSettings,
      actions: {}
    };
    return subSection;
  }

  // function isTargetForCompliant(annotationPath: AnnotationPath) {
  // 	return /.*com\.sap\.vocabularies\.UI\.v1\.(FieldGroup|Identification|DataPoint|StatusInfo).*/.test(annotationPath.value);
  // }
  const getSubSectionKey = (facetDefinition, fallback) => {
    var _facetDefinition$ID, _facetDefinition$Labe;
    return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
  };
  /**
   * Adds Form menu action to all form actions, removes duplicate actions and hidden actions.
   *
   * @param actions The actions involved
   * @param facetDefinition The definition for the facet
   * @param converterContext The converter context
   * @returns The form menu actions
   */
  function addFormMenuActions(actions, facetDefinition, converterContext) {
    const hiddenActions = getFormHiddenActions(facetDefinition, converterContext) || [],
      formActions = getFormActions(facetDefinition, converterContext),
      manifestActions = getActionsFromManifest(formActions, converterContext, actions, undefined, undefined, hiddenActions),
      actionOverwriteConfig = {
        enabled: OverrideType.overwrite,
        visible: OverrideType.overwrite,
        command: OverrideType.overwrite
      },
      formAllActions = insertCustomElements(actions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions: formAllActions ? getVisibilityEnablementFormMenuActions(removeDuplicateActions(formAllActions)) : actions,
      commandActions: manifestActions.commandActions
    };
  }

  /**
   * Retrieves the action form a facet.
   *
   * @param facetDefinition
   * @param converterContext
   * @returns The current facet actions
   */
  function getFacetActions(facetDefinition, converterContext) {
    let actions = [];
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        actions = facetDefinition.Facets.filter(subFacetDefinition => isReferenceFacet(subFacetDefinition)).reduce((actionReducer, referenceFacet) => createFormActionReducer(actionReducer, referenceFacet, converterContext), []);
        break;
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        actions = createFormActionReducer([], facetDefinition, converterContext);
        break;
      default:
        break;
    }
    return addFormMenuActions(actions, facetDefinition, converterContext);
  }
  /**
   * Returns the button type based on @UI.Emphasized annotation.
   *
   * @param emphasized Emphasized annotation value.
   * @returns The button type or path based expression.
   */
  function getButtonType(emphasized) {
    // Emphasized is a boolean so if it's equal to true we show the button as Ghost, otherwise as Transparent
    const buttonTypeCondition = equal(getExpressionFromAnnotation(emphasized), true);
    return compileExpression(ifElse(buttonTypeCondition, ButtonType.Ghost, ButtonType.Transparent));
  }

  /**
   * Create a subsection based on FacetTypes.
   *
   * @param facetDefinition
   * @param facetsToCreate
   * @param converterContext
   * @param level
   * @param hasSingleContent
   * @param isHeaderSection
   * @returns A subsection definition
   */
  function createSubSection(facetDefinition, facetsToCreate, converterContext, level, hasSingleContent, isHeaderSection) {
    var _facetDefinition$anno, _facetDefinition$anno2, _presentation$visuali, _presentation$visuali2, _presentation$visuali3;
    const subSectionID = getSubSectionID(facetDefinition);
    const oHiddenAnnotation = (_facetDefinition$anno = facetDefinition.annotations) === null || _facetDefinition$anno === void 0 ? void 0 : (_facetDefinition$anno2 = _facetDefinition$anno.UI) === null || _facetDefinition$anno2 === void 0 ? void 0 : _facetDefinition$anno2.Hidden;
    const isVisible = compileExpression(not(equal(true, getExpressionFromAnnotation(oHiddenAnnotation))));
    const isDynamicExpression = isVisible && typeof isVisible === "string" && isVisible.indexOf("{=") === 0 && (oHiddenAnnotation === null || oHiddenAnnotation === void 0 ? void 0 : oHiddenAnnotation.type) !== "Path";
    const isVisibleDynamicExpression = isVisible && isDynamicExpression ? isVisible.substring(isVisible.indexOf("{=") + 2, isVisible.lastIndexOf("}")) : false;
    const title = compileExpression(getExpressionFromAnnotation(facetDefinition.Label));
    const subSection = {
      id: subSectionID,
      key: getSubSectionKey(facetDefinition, subSectionID),
      title: title,
      type: SubSectionType.Unknown,
      annotationPath: converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName),
      visible: isVisible,
      isVisibilityDynamic: isDynamicExpression,
      level: level,
      sideContent: undefined
    };
    if (isHeaderSection) {
      subSection.stashed = getStashedSettingsForHeaderFacet(facetDefinition, facetDefinition, converterContext);
      subSection.flexSettings = {
        designtime: getDesignTimeMetadataSettingsForHeaderFacet(facetDefinition, facetDefinition, converterContext)
      };
    }
    let unsupportedText = "";
    level++;
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        const facets = facetDefinition.Facets;

        // Filter for all facets of this subsection that are referring to an annotation describing a visualization (e.g. table or chart)
        const visualizationFacets = facets.map((facet, index) => ({
          index,
          facet
        })) // Remember the index assigned to each facet
        .filter(_ref => {
          var _Target, _Target$$target;
          let {
            facet
          } = _ref;
          return visualizationTerms.includes((_Target = facet.Target) === null || _Target === void 0 ? void 0 : (_Target$$target = _Target.$target) === null || _Target$$target === void 0 ? void 0 : _Target$$target.term);
        });

        // Filter out all visualization facets; "visualizationFacets" and "nonVisualizationFacets" are disjoint
        const nonVisualizationFacets = facets.filter(facet => !visualizationFacets.find(visualization => visualization.facet === facet));
        if (visualizationFacets.length > 0) {
          // CollectionFacets with visualizations must be handled separately as they cannot be included in forms
          const visualizationContent = [];
          const formContent = [];
          const mixedContent = [];

          // Create each visualization facet as if it was its own subsection (via recursion), and keep their relative ordering
          for (const {
            facet
          } of visualizationFacets) {
            visualizationContent.push(createSubSection(facet, [], converterContext, level, facets.length === 1, isHeaderSection));
          }
          if (nonVisualizationFacets.length > 0) {
            // This subsection includes visualizations and other content, so it is a "Mixed" subsection
            Log.warning(`Warning: CollectionFacet '${facetDefinition.ID}' includes a combination of either a chart or a table and other content. This can lead to rendering issues. Consider moving the chart or table into a separate CollectionFacet.`);
            facetDefinition.Facets = nonVisualizationFacets;
            // Create a joined form of all facets that are not referring to visualizations
            formContent.push(createSubSection(facetDefinition, [], converterContext, level, hasSingleContent, isHeaderSection));
          }

          // Merge the visualization content with the form content
          if (visualizationFacets.find(_ref2 => {
            let {
              index
            } = _ref2;
            return index === 0;
          })) {
            // If the first facet is a visualization, display the visualizations first
            mixedContent.push(...visualizationContent);
            mixedContent.push(...formContent);
          } else {
            // Otherwise, display the form first
            mixedContent.push(...formContent);
            mixedContent.push(...visualizationContent);
          }
          const mixedSubSection = {
            ...subSection,
            type: SubSectionType.Mixed,
            level: level,
            content: mixedContent
          };
          return mixedSubSection;
        } else {
          // This CollectionFacet only includes content that can be rendered in a merged form
          const facetActions = getFacetActions(facetDefinition, converterContext),
            formCollectionSubSection = {
              ...subSection,
              type: SubSectionType.Form,
              formDefinition: createFormDefinition(facetDefinition, isVisible, converterContext, facetActions.actions),
              level: level,
              actions: facetActions.actions.filter(action => action.facetName === undefined),
              commandActions: facetActions.commandActions
            };
          return formCollectionSubSection;
        }
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        if (!facetDefinition.Target.$target) {
          unsupportedText = `Unable to find annotationPath ${facetDefinition.Target.value}`;
        } else {
          switch (facetDefinition.Target.$target.term) {
            case "com.sap.vocabularies.UI.v1.LineItem":
            case "com.sap.vocabularies.UI.v1.Chart":
            case "com.sap.vocabularies.UI.v1.PresentationVariant":
            case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
              const presentation = getDataVisualizationConfiguration(facetDefinition.Target.value, getCondensedTableLayoutCompliance(facetDefinition, facetsToCreate, converterContext), converterContext, undefined, isHeaderSection);
              const subSectionTitle = subSection.title ? subSection.title : "";
              const controlTitle = ((_presentation$visuali = presentation.visualizations[0]) === null || _presentation$visuali === void 0 ? void 0 : (_presentation$visuali2 = _presentation$visuali.annotation) === null || _presentation$visuali2 === void 0 ? void 0 : _presentation$visuali2.title) || ((_presentation$visuali3 = presentation.visualizations[0]) === null || _presentation$visuali3 === void 0 ? void 0 : _presentation$visuali3.title);
              const showTitle = getTitleVisibility(controlTitle, subSectionTitle, hasSingleContent);
              const titleVisibleExpression = isVisible && title !== "undefined" && (title ? isVisible : false);
              const dataVisualizationSubSection = {
                ...subSection,
                type: SubSectionType.DataVisualization,
                level: level,
                presentation: presentation,
                showTitle: showTitle,
                titleVisible: isDynamicExpression ? `{= (${isVisibleDynamicExpression}) && ('${title}' !=='undefined') && (${showTitle} ? true : false) }` : titleVisibleExpression
              };
              return dataVisualizationSubSection;
            case "com.sap.vocabularies.UI.v1.FieldGroup":
            case "com.sap.vocabularies.UI.v1.Identification":
            case "com.sap.vocabularies.UI.v1.DataPoint":
            case "com.sap.vocabularies.UI.v1.StatusInfo":
            case "com.sap.vocabularies.Communication.v1.Contact":
              // All those element belong to a from facet
              const facetActions = getFacetActions(facetDefinition, converterContext),
                formElementSubSection = {
                  ...subSection,
                  type: SubSectionType.Form,
                  level: level,
                  formDefinition: createFormDefinition(facetDefinition, isVisible, converterContext, facetActions.actions),
                  actions: facetActions.actions.filter(action => action.facetName === undefined),
                  commandActions: facetActions.commandActions
                };
              return formElementSubSection;
            default:
              unsupportedText = `For ${facetDefinition.Target.$target.term} Fragment`;
              break;
          }
        }
        break;
      case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
        unsupportedText = "For Reference URL Facet";
        break;
      default:
        break;
    }
    // If we reach here we ended up with an unsupported SubSection type
    const unsupportedSubSection = {
      ...subSection,
      text: unsupportedText
    };
    return unsupportedSubSection;
  }
  /**
   * Checks whether to hide or show subsection title
   *
   * @param controlTitle
   * @param sectionTitle
   * @param hasSingleContent
   * @returns Boolean value  or expression for showTitle
   */
  _exports.createSubSection = createSubSection;
  function getTitleVisibility(controlTitle, subSectionTitle, hasSingleContent) {
    // visible shall be true if there are multiple content or if the control and subsection title are different
    return compileExpression(or(not(hasSingleContent), notEqual(resolveBindingString(controlTitle), resolveBindingString(subSectionTitle))));
  }
  _exports.getTitleVisibility = getTitleVisibility;
  function createFormActionReducer(actions, facetDefinition, converterContext) {
    const referenceTarget = facetDefinition.Target.$target;
    const targetValue = facetDefinition.Target.value;
    let manifestActions = {};
    let dataFieldCollection = [];
    let [navigationPropertyPath] = targetValue.split("@");
    if (navigationPropertyPath.length > 0) {
      if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
        navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
      }
    } else {
      navigationPropertyPath = undefined;
    }
    if (referenceTarget) {
      switch (referenceTarget.term) {
        case "com.sap.vocabularies.UI.v1.FieldGroup":
          dataFieldCollection = referenceTarget.Data;
          manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(referenceTarget).actions, converterContext, undefined, undefined, undefined, undefined, facetDefinition.fullyQualifiedName).actions;
          break;
        case "com.sap.vocabularies.UI.v1.Identification":
        case "com.sap.vocabularies.UI.v1.StatusInfo":
          if (referenceTarget.qualifier) {
            dataFieldCollection = referenceTarget;
          }
          break;
        default:
          break;
      }
    }
    actions = dataFieldCollection.reduce((actionReducer, dataField) => {
      var _dataField$RequiresCo, _dataField$Inline, _dataField$Determinin, _dataField$Label, _dataField$Navigation, _dataField$annotation, _dataField$annotation2, _dataField$annotation3, _dataField$annotation4, _dataField$annotation5, _dataField$Label2, _dataField$annotation6, _dataField$annotation7, _dataField$annotation8, _dataField$annotation9, _dataField$annotation10;
      switch (dataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          if (((_dataField$RequiresCo = dataField.RequiresContext) === null || _dataField$RequiresCo === void 0 ? void 0 : _dataField$RequiresCo.valueOf()) === true) {
            converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.REQUIRESCONTEXT);
          }
          if (((_dataField$Inline = dataField.Inline) === null || _dataField$Inline === void 0 ? void 0 : _dataField$Inline.valueOf()) === true) {
            converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.INLINE);
          }
          if (((_dataField$Determinin = dataField.Determining) === null || _dataField$Determinin === void 0 ? void 0 : _dataField$Determinin.valueOf()) === true) {
            converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.DETERMINING);
          }
          const mNavigationParameters = {};
          if (dataField.Mapping) {
            mNavigationParameters.semanticObjectMapping = getSemanticObjectMapping(dataField.Mapping);
          }
          actionReducer.push({
            type: ActionType.DataFieldForIntentBasedNavigation,
            id: getFormID(facetDefinition, dataField),
            key: KeyHelper.generateKeyFromDataField(dataField),
            text: (_dataField$Label = dataField.Label) === null || _dataField$Label === void 0 ? void 0 : _dataField$Label.toString(),
            annotationPath: "",
            enabled: dataField.NavigationAvailable !== undefined ? compileExpression(equal(getExpressionFromAnnotation((_dataField$Navigation = dataField.NavigationAvailable) === null || _dataField$Navigation === void 0 ? void 0 : _dataField$Navigation.valueOf()), true)) : "true",
            visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()), true))),
            buttonType: getButtonType((_dataField$annotation4 = dataField.annotations) === null || _dataField$annotation4 === void 0 ? void 0 : (_dataField$annotation5 = _dataField$annotation4.UI) === null || _dataField$annotation5 === void 0 ? void 0 : _dataField$annotation5.Emphasized),
            press: compileExpression(fn("._intentBasedNavigation.navigate", [getExpressionFromAnnotation(dataField.SemanticObject), getExpressionFromAnnotation(dataField.Action), mNavigationParameters])),
            customData: compileExpression({
              semanticObject: getExpressionFromAnnotation(dataField.SemanticObject),
              action: getExpressionFromAnnotation(dataField.Action)
            })
          });
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          const formManifestActionsConfiguration = converterContext.getManifestControlConfiguration(referenceTarget).actions;
          const key = KeyHelper.generateKeyFromDataField(dataField);
          actionReducer.push({
            type: ActionType.DataFieldForAction,
            id: getFormID(facetDefinition, dataField),
            key: key,
            text: (_dataField$Label2 = dataField.Label) === null || _dataField$Label2 === void 0 ? void 0 : _dataField$Label2.toString(),
            annotationPath: "",
            enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
            binding: navigationPropertyPath ? `{ 'path' : '${navigationPropertyPath}'}` : undefined,
            visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation6 = dataField.annotations) === null || _dataField$annotation6 === void 0 ? void 0 : (_dataField$annotation7 = _dataField$annotation6.UI) === null || _dataField$annotation7 === void 0 ? void 0 : (_dataField$annotation8 = _dataField$annotation7.Hidden) === null || _dataField$annotation8 === void 0 ? void 0 : _dataField$annotation8.valueOf()), true))),
            requiresDialog: isDialog(dataField.ActionTarget),
            buttonType: getButtonType((_dataField$annotation9 = dataField.annotations) === null || _dataField$annotation9 === void 0 ? void 0 : (_dataField$annotation10 = _dataField$annotation9.UI) === null || _dataField$annotation10 === void 0 ? void 0 : _dataField$annotation10.Emphasized),
            press: compileExpression(fn("invokeAction", [dataField.Action, {
              contexts: fn("getBindingContext", [], pathInModel("", "$source")),
              invocationGrouping: dataField.InvocationGrouping === "UI.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated",
              label: getExpressionFromAnnotation(dataField.Label),
              model: fn("getModel", [], pathInModel("/", "$source")),
              isNavigable: isActionNavigable(formManifestActionsConfiguration && formManifestActionsConfiguration[key])
            }], ref(".editFlow"))),
            facetName: dataField.Inline ? facetDefinition.fullyQualifiedName : undefined
          });
          break;
        default:
          break;
      }
      return actionReducer;
    }, actions);
    // Overwriting of actions happens in addFormMenuActions
    return insertCustomElements(actions, manifestActions);
  }
  function isDialog(actionDefinition) {
    if (actionDefinition) {
      var _actionDefinition$ann, _actionDefinition$ann2;
      const bCritical = (_actionDefinition$ann = actionDefinition.annotations) === null || _actionDefinition$ann === void 0 ? void 0 : (_actionDefinition$ann2 = _actionDefinition$ann.Common) === null || _actionDefinition$ann2 === void 0 ? void 0 : _actionDefinition$ann2.IsActionCritical;
      if (actionDefinition.parameters.length > 1 || bCritical) {
        return "Dialog";
      } else {
        return "None";
      }
    } else {
      return "None";
    }
  }
  _exports.isDialog = isDialog;
  function createCustomSubSections(manifestSubSections, converterContext) {
    const subSections = {};
    Object.keys(manifestSubSections).forEach(subSectionKey => subSections[subSectionKey] = createCustomSubSection(manifestSubSections[subSectionKey], subSectionKey, converterContext));
    return subSections;
  }
  _exports.createCustomSubSections = createCustomSubSections;
  function createCustomSubSection(manifestSubSection, subSectionKey, converterContext) {
    const sideContent = manifestSubSection.sideContent ? {
      template: manifestSubSection.sideContent.template,
      id: getSideContentID(subSectionKey),
      visible: false,
      equalSplit: manifestSubSection.sideContent.equalSplit
    } : undefined;
    let position = manifestSubSection.position;
    if (!position) {
      position = {
        placement: Placement.After
      };
    }
    const isVisible = manifestSubSection.visible !== undefined ? manifestSubSection.visible : true;
    const isDynamicExpression = isVisible && typeof isVisible === "string" && isVisible.indexOf("{=") === 0;
    const manifestActions = getActionsFromManifest(manifestSubSection.actions, converterContext);
    const subSectionDefinition = {
      type: SubSectionType.Unknown,
      id: manifestSubSection.id || getCustomSubSectionID(subSectionKey),
      actions: manifestActions.actions,
      key: subSectionKey,
      title: manifestSubSection.title,
      level: 1,
      position: position,
      visible: manifestSubSection.visible !== undefined ? manifestSubSection.visible : true,
      sideContent: sideContent,
      isVisibilityDynamic: isDynamicExpression
    };
    if (manifestSubSection.template || manifestSubSection.name) {
      subSectionDefinition.type = SubSectionType.XMLFragment;
      subSectionDefinition.template = manifestSubSection.template || manifestSubSection.name || "";
    } else {
      subSectionDefinition.type = SubSectionType.Placeholder;
    }
    return subSectionDefinition;
  }

  /**
   * Evaluate if the condensed mode can be appli3ed on the table.
   *
   * @param currentFacet
   * @param facetsToCreateInSection
   * @param converterContext
   * @returns `true` for compliant, false otherwise
   */
  _exports.createCustomSubSection = createCustomSubSection;
  function getCondensedTableLayoutCompliance(currentFacet, facetsToCreateInSection, converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    if (manifestWrapper.useIconTabBar()) {
      // If the OP use the tab based we check if the facets that will be created for this section are all non visible
      return hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection);
    } else {
      var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3, _entityType$annotatio4, _entityType$annotatio5, _entityType$annotatio6;
      const entityType = converterContext.getEntityType();
      if ((_entityType$annotatio = entityType.annotations) !== null && _entityType$annotatio !== void 0 && (_entityType$annotatio2 = _entityType$annotatio.UI) !== null && _entityType$annotatio2 !== void 0 && (_entityType$annotatio3 = _entityType$annotatio2.Facets) !== null && _entityType$annotatio3 !== void 0 && _entityType$annotatio3.length && ((_entityType$annotatio4 = entityType.annotations) === null || _entityType$annotatio4 === void 0 ? void 0 : (_entityType$annotatio5 = _entityType$annotatio4.UI) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.Facets) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.length) > 1) {
        return hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection);
      } else {
        return true;
      }
    }
  }
  function hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection) {
    return facetsToCreateInSection.every(function (subFacet) {
      if (subFacet !== currentFacet) {
        if (subFacet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
          var _refFacet$Target, _refFacet$Target$$tar, _refFacet$Target2, _refFacet$Target2$$ta, _refFacet$Target$$tar2;
          const refFacet = subFacet;
          if (((_refFacet$Target = refFacet.Target) === null || _refFacet$Target === void 0 ? void 0 : (_refFacet$Target$$tar = _refFacet$Target.$target) === null || _refFacet$Target$$tar === void 0 ? void 0 : _refFacet$Target$$tar.term) === "com.sap.vocabularies.UI.v1.LineItem" || ((_refFacet$Target2 = refFacet.Target) === null || _refFacet$Target2 === void 0 ? void 0 : (_refFacet$Target2$$ta = _refFacet$Target2.$target) === null || _refFacet$Target2$$ta === void 0 ? void 0 : _refFacet$Target2$$ta.term) === "com.sap.vocabularies.UI.v1.PresentationVariant" || ((_refFacet$Target$$tar2 = refFacet.Target.$target) === null || _refFacet$Target$$tar2 === void 0 ? void 0 : _refFacet$Target$$tar2.term) === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
            var _refFacet$annotations, _refFacet$annotations2, _refFacet$annotations3, _refFacet$annotations4;
            return ((_refFacet$annotations = refFacet.annotations) === null || _refFacet$annotations === void 0 ? void 0 : (_refFacet$annotations2 = _refFacet$annotations.UI) === null || _refFacet$annotations2 === void 0 ? void 0 : _refFacet$annotations2.Hidden) !== undefined ? (_refFacet$annotations3 = refFacet.annotations) === null || _refFacet$annotations3 === void 0 ? void 0 : (_refFacet$annotations4 = _refFacet$annotations3.UI) === null || _refFacet$annotations4 === void 0 ? void 0 : _refFacet$annotations4.Hidden : false;
          }
          return true;
        } else {
          const subCollectionFacet = subFacet;
          return subCollectionFacet.Facets.every(function (facet) {
            var _subRefFacet$Target, _subRefFacet$Target$$, _subRefFacet$Target2, _subRefFacet$Target2$, _subRefFacet$Target3, _subRefFacet$Target3$;
            const subRefFacet = facet;
            if (((_subRefFacet$Target = subRefFacet.Target) === null || _subRefFacet$Target === void 0 ? void 0 : (_subRefFacet$Target$$ = _subRefFacet$Target.$target) === null || _subRefFacet$Target$$ === void 0 ? void 0 : _subRefFacet$Target$$.term) === "com.sap.vocabularies.UI.v1.LineItem" || ((_subRefFacet$Target2 = subRefFacet.Target) === null || _subRefFacet$Target2 === void 0 ? void 0 : (_subRefFacet$Target2$ = _subRefFacet$Target2.$target) === null || _subRefFacet$Target2$ === void 0 ? void 0 : _subRefFacet$Target2$.term) === "com.sap.vocabularies.UI.v1.PresentationVariant" || ((_subRefFacet$Target3 = subRefFacet.Target) === null || _subRefFacet$Target3 === void 0 ? void 0 : (_subRefFacet$Target3$ = _subRefFacet$Target3.$target) === null || _subRefFacet$Target3$ === void 0 ? void 0 : _subRefFacet$Target3$.term) === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
              var _subRefFacet$annotati, _subRefFacet$annotati2, _subRefFacet$annotati3, _subRefFacet$annotati4;
              return ((_subRefFacet$annotati = subRefFacet.annotations) === null || _subRefFacet$annotati === void 0 ? void 0 : (_subRefFacet$annotati2 = _subRefFacet$annotati.UI) === null || _subRefFacet$annotati2 === void 0 ? void 0 : _subRefFacet$annotati2.Hidden) !== undefined ? (_subRefFacet$annotati3 = subRefFacet.annotations) === null || _subRefFacet$annotati3 === void 0 ? void 0 : (_subRefFacet$annotati4 = _subRefFacet$annotati3.UI) === null || _subRefFacet$annotati4 === void 0 ? void 0 : _subRefFacet$annotati4.Hidden : false;
            }
            return true;
          });
        }
      }
      return true;
    });
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdWJTZWN0aW9uVHlwZSIsInZpc3VhbGl6YXRpb25UZXJtcyIsImNyZWF0ZVN1YlNlY3Rpb25zIiwiZmFjZXRDb2xsZWN0aW9uIiwiY29udmVydGVyQ29udGV4dCIsImlzSGVhZGVyU2VjdGlvbiIsImZhY2V0c1RvQ3JlYXRlIiwicmVkdWNlIiwiZmFjZXREZWZpbml0aW9uIiwiJFR5cGUiLCJwdXNoIiwiRmFjZXRzIiwiZmluZCIsImZhY2V0VHlwZSIsInNwbGljZSIsImxlbmd0aCIsIm1hcCIsImZhY2V0IiwiY3JlYXRlU3ViU2VjdGlvbiIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbnMiLCJjdXN0b21IZWFkZXJGYWNldHMiLCJnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJnZXRIZWFkZXJGYWNldHMiLCJhQ3VzdG9tSGVhZGVyRmFjZXRzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJjdXN0b21IZWFkZXJGYWNldCIsInRlbXBsYXRlRWRpdCIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbiIsInN1YlNlY3Rpb25JRCIsImdldEN1c3RvbVN1YlNlY3Rpb25JRCIsInN1YlNlY3Rpb24iLCJpZCIsInRpdGxlIiwidHlwZSIsIlhNTEZyYWdtZW50IiwidGVtcGxhdGUiLCJ2aXNpYmxlIiwibGV2ZWwiLCJzaWRlQ29udGVudCIsInVuZGVmaW5lZCIsInN0YXNoZWQiLCJmbGV4U2V0dGluZ3MiLCJhY3Rpb25zIiwiZ2V0U3ViU2VjdGlvbktleSIsImZhbGxiYWNrIiwiSUQiLCJ0b1N0cmluZyIsIkxhYmVsIiwiYWRkRm9ybU1lbnVBY3Rpb25zIiwiaGlkZGVuQWN0aW9ucyIsImdldEZvcm1IaWRkZW5BY3Rpb25zIiwiZm9ybUFjdGlvbnMiLCJnZXRGb3JtQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJhY3Rpb25PdmVyd3JpdGVDb25maWciLCJlbmFibGVkIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiY29tbWFuZCIsImZvcm1BbGxBY3Rpb25zIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJnZXRWaXNpYmlsaXR5RW5hYmxlbWVudEZvcm1NZW51QWN0aW9ucyIsInJlbW92ZUR1cGxpY2F0ZUFjdGlvbnMiLCJjb21tYW5kQWN0aW9ucyIsImdldEZhY2V0QWN0aW9ucyIsImZpbHRlciIsInN1YkZhY2V0RGVmaW5pdGlvbiIsImlzUmVmZXJlbmNlRmFjZXQiLCJhY3Rpb25SZWR1Y2VyIiwicmVmZXJlbmNlRmFjZXQiLCJjcmVhdGVGb3JtQWN0aW9uUmVkdWNlciIsImdldEJ1dHRvblR5cGUiLCJlbXBoYXNpemVkIiwiYnV0dG9uVHlwZUNvbmRpdGlvbiIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJCdXR0b25UeXBlIiwiR2hvc3QiLCJUcmFuc3BhcmVudCIsImhhc1NpbmdsZUNvbnRlbnQiLCJnZXRTdWJTZWN0aW9uSUQiLCJvSGlkZGVuQW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiVUkiLCJIaWRkZW4iLCJpc1Zpc2libGUiLCJub3QiLCJpc0R5bmFtaWNFeHByZXNzaW9uIiwiaW5kZXhPZiIsImlzVmlzaWJsZUR5bmFtaWNFeHByZXNzaW9uIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJVbmtub3duIiwiYW5ub3RhdGlvblBhdGgiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiaXNWaXNpYmlsaXR5RHluYW1pYyIsImdldFN0YXNoZWRTZXR0aW5nc0ZvckhlYWRlckZhY2V0IiwiZGVzaWdudGltZSIsImdldERlc2lnblRpbWVNZXRhZGF0YVNldHRpbmdzRm9ySGVhZGVyRmFjZXQiLCJ1bnN1cHBvcnRlZFRleHQiLCJmYWNldHMiLCJ2aXN1YWxpemF0aW9uRmFjZXRzIiwiaW5kZXgiLCJpbmNsdWRlcyIsIlRhcmdldCIsIiR0YXJnZXQiLCJ0ZXJtIiwibm9uVmlzdWFsaXphdGlvbkZhY2V0cyIsInZpc3VhbGl6YXRpb24iLCJ2aXN1YWxpemF0aW9uQ29udGVudCIsImZvcm1Db250ZW50IiwibWl4ZWRDb250ZW50IiwiTG9nIiwid2FybmluZyIsIm1peGVkU3ViU2VjdGlvbiIsIk1peGVkIiwiY29udGVudCIsImZhY2V0QWN0aW9ucyIsImZvcm1Db2xsZWN0aW9uU3ViU2VjdGlvbiIsIkZvcm0iLCJmb3JtRGVmaW5pdGlvbiIsImNyZWF0ZUZvcm1EZWZpbml0aW9uIiwiYWN0aW9uIiwiZmFjZXROYW1lIiwidmFsdWUiLCJwcmVzZW50YXRpb24iLCJnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24iLCJnZXRDb25kZW5zZWRUYWJsZUxheW91dENvbXBsaWFuY2UiLCJzdWJTZWN0aW9uVGl0bGUiLCJjb250cm9sVGl0bGUiLCJ2aXN1YWxpemF0aW9ucyIsImFubm90YXRpb24iLCJzaG93VGl0bGUiLCJnZXRUaXRsZVZpc2liaWxpdHkiLCJ0aXRsZVZpc2libGVFeHByZXNzaW9uIiwiZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uIiwiRGF0YVZpc3VhbGl6YXRpb24iLCJ0aXRsZVZpc2libGUiLCJmb3JtRWxlbWVudFN1YlNlY3Rpb24iLCJ1bnN1cHBvcnRlZFN1YlNlY3Rpb24iLCJ0ZXh0Iiwib3IiLCJub3RFcXVhbCIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwicmVmZXJlbmNlVGFyZ2V0IiwidGFyZ2V0VmFsdWUiLCJkYXRhRmllbGRDb2xsZWN0aW9uIiwibmF2aWdhdGlvblByb3BlcnR5UGF0aCIsInNwbGl0Iiwic3Vic3RyIiwiRGF0YSIsImdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24iLCJxdWFsaWZpZXIiLCJkYXRhRmllbGQiLCJSZXF1aXJlc0NvbnRleHQiLCJ2YWx1ZU9mIiwiZ2V0RGlhZ25vc3RpY3MiLCJhZGRJc3N1ZSIsIklzc3VlQ2F0ZWdvcnkiLCJBbm5vdGF0aW9uIiwiSXNzdWVTZXZlcml0eSIsIkxvdyIsIklzc3VlVHlwZSIsIk1BTEZPUk1FRF9EQVRBRklFTERfRk9SX0lCTiIsIlJFUVVJUkVTQ09OVEVYVCIsIklubGluZSIsIklOTElORSIsIkRldGVybWluaW5nIiwiREVURVJNSU5JTkciLCJtTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJNYXBwaW5nIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwiZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nIiwiQWN0aW9uVHlwZSIsIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldEZvcm1JRCIsIktleUhlbHBlciIsImdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZCIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCJidXR0b25UeXBlIiwiRW1waGFzaXplZCIsInByZXNzIiwiZm4iLCJTZW1hbnRpY09iamVjdCIsIkFjdGlvbiIsImN1c3RvbURhdGEiLCJzZW1hbnRpY09iamVjdCIsImZvcm1NYW5pZmVzdEFjdGlvbnNDb25maWd1cmF0aW9uIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24iLCJBY3Rpb25UYXJnZXQiLCJiaW5kaW5nIiwicmVxdWlyZXNEaWFsb2ciLCJpc0RpYWxvZyIsImNvbnRleHRzIiwicGF0aEluTW9kZWwiLCJpbnZvY2F0aW9uR3JvdXBpbmciLCJJbnZvY2F0aW9uR3JvdXBpbmciLCJsYWJlbCIsIm1vZGVsIiwiaXNOYXZpZ2FibGUiLCJpc0FjdGlvbk5hdmlnYWJsZSIsInJlZiIsImFjdGlvbkRlZmluaXRpb24iLCJiQ3JpdGljYWwiLCJDb21tb24iLCJJc0FjdGlvbkNyaXRpY2FsIiwicGFyYW1ldGVycyIsImNyZWF0ZUN1c3RvbVN1YlNlY3Rpb25zIiwibWFuaWZlc3RTdWJTZWN0aW9ucyIsInN1YlNlY3Rpb25zIiwic3ViU2VjdGlvbktleSIsImNyZWF0ZUN1c3RvbVN1YlNlY3Rpb24iLCJtYW5pZmVzdFN1YlNlY3Rpb24iLCJnZXRTaWRlQ29udGVudElEIiwiZXF1YWxTcGxpdCIsInBvc2l0aW9uIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJzdWJTZWN0aW9uRGVmaW5pdGlvbiIsIm5hbWUiLCJQbGFjZWhvbGRlciIsImN1cnJlbnRGYWNldCIsImZhY2V0c1RvQ3JlYXRlSW5TZWN0aW9uIiwibWFuaWZlc3RXcmFwcGVyIiwidXNlSWNvblRhYkJhciIsImhhc05vT3RoZXJWaXNpYmxlVGFibGVJblRhcmdldHMiLCJlbnRpdHlUeXBlIiwiZ2V0RW50aXR5VHlwZSIsImV2ZXJ5Iiwic3ViRmFjZXQiLCJyZWZGYWNldCIsInN1YkNvbGxlY3Rpb25GYWNldCIsInN1YlJlZkZhY2V0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTdWJTZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW11bmljYXRpb25cIjtcbmltcG9ydCB0eXBlIHtcblx0Q29sbGVjdGlvbkZhY2V0VHlwZXMsXG5cdERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdEVtcGhhc2l6ZWQsXG5cdEZhY2V0VHlwZXMsXG5cdEZpZWxkR3JvdXAsXG5cdE9wZXJhdGlvbkdyb3VwaW5nVHlwZSxcblx0UmVmZXJlbmNlRmFjZXQsXG5cdFJlZmVyZW5jZUZhY2V0VHlwZXNcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEJhc2VBY3Rpb24sXG5cdENvbWJpbmVkQWN0aW9uLFxuXHRDb252ZXJ0ZXJBY3Rpb24sXG5cdEN1c3RvbUFjdGlvbixcblx0T3ZlcnJpZGVUeXBlQWN0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7XG5cdEJ1dHRvblR5cGUsXG5cdGdldEFjdGlvbnNGcm9tTWFuaWZlc3QsXG5cdGdldEVuYWJsZWRGb3JBbm5vdGF0aW9uQWN0aW9uLFxuXHRnZXRTZW1hbnRpY09iamVjdE1hcHBpbmcsXG5cdGlzQWN0aW9uTmF2aWdhYmxlLFxuXHRyZW1vdmVEdXBsaWNhdGVBY3Rpb25zXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB0eXBlIHsgQ3VzdG9tT2JqZWN0UGFnZUhlYWRlckZhY2V0LCBGbGV4U2V0dGluZ3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9PYmplY3RQYWdlL0hlYWRlckZhY2V0XCI7XG5pbXBvcnQge1xuXHRnZXREZXNpZ25UaW1lTWV0YWRhdGFTZXR0aW5nc0ZvckhlYWRlckZhY2V0LFxuXHRnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QsXG5cdGdldFN0YXNoZWRTZXR0aW5nc0ZvckhlYWRlckZhY2V0XG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL09iamVjdFBhZ2UvSGVhZGVyRmFjZXRcIjtcbmltcG9ydCB7IElzc3VlQ2F0ZWdvcnksIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHtcblx0Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRlcXVhbCxcblx0Zm4sXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRub3QsXG5cdG5vdEVxdWFsLFxuXHRvcixcblx0cGF0aEluTW9kZWwsXG5cdHJlZixcblx0cmVzb2x2ZUJpbmRpbmdTdHJpbmdcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlndXJhYmxlT2JqZWN0LCBDb25maWd1cmFibGVSZWNvcmQsIEN1c3RvbUVsZW1lbnQgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzLCBPdmVycmlkZVR5cGUsIFBsYWNlbWVudCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgZ2V0Q3VzdG9tU3ViU2VjdGlvbklELCBnZXRGb3JtSUQsIGdldFNpZGVDb250ZW50SUQsIGdldFN1YlNlY3Rpb25JRCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgdHlwZSB7IE1hbmlmZXN0QWN0aW9uLCBNYW5pZmVzdFN1YlNlY3Rpb24gfSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBnZXRGb3JtQWN0aW9ucywgZ2V0Rm9ybUhpZGRlbkFjdGlvbnMsIGdldFZpc2liaWxpdHlFbmFibGVtZW50Rm9ybU1lbnVBY3Rpb25zIH0gZnJvbSBcIi4uLy4uL29iamVjdFBhZ2UvRm9ybU1lbnVBY3Rpb25zXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB7IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB0eXBlIHsgRm9ybURlZmluaXRpb24gfSBmcm9tIFwiLi4vQ29tbW9uL0Zvcm1cIjtcbmltcG9ydCB7IGNyZWF0ZUZvcm1EZWZpbml0aW9uLCBpc1JlZmVyZW5jZUZhY2V0IH0gZnJvbSBcIi4uL0NvbW1vbi9Gb3JtXCI7XG5cbmV4cG9ydCBlbnVtIFN1YlNlY3Rpb25UeXBlIHtcblx0VW5rbm93biA9IFwiVW5rbm93blwiLCAvLyBEZWZhdWx0IFR5cGVcblx0Rm9ybSA9IFwiRm9ybVwiLFxuXHREYXRhVmlzdWFsaXphdGlvbiA9IFwiRGF0YVZpc3VhbGl6YXRpb25cIixcblx0WE1MRnJhZ21lbnQgPSBcIlhNTEZyYWdtZW50XCIsXG5cdFBsYWNlaG9sZGVyID0gXCJQbGFjZWhvbGRlclwiLFxuXHRNaXhlZCA9IFwiTWl4ZWRcIlxufVxuXG5leHBvcnQgdHlwZSBPYmplY3RQYWdlU3ViU2VjdGlvbiA9XG5cdHwgVW5zdXBwb3J0ZWRTdWJTZWN0aW9uXG5cdHwgRm9ybVN1YlNlY3Rpb25cblx0fCBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb25cblx0fCBDb250YWN0U3ViU2VjdGlvblxuXHR8IFhNTEZyYWdtZW50U3ViU2VjdGlvblxuXHR8IFBsYWNlaG9sZGVyRnJhZ21lbnRTdWJTZWN0aW9uXG5cdHwgTWl4ZWRTdWJTZWN0aW9uO1xuXG50eXBlIEJhc2VTdWJTZWN0aW9uID0ge1xuXHRpZDogc3RyaW5nO1xuXHRrZXk6IHN0cmluZztcblx0dGl0bGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZTtcblx0dmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGlzVmlzaWJpbGl0eUR5bmFtaWM/OiBib29sZWFuIHwgXCJcIjtcblx0ZmxleFNldHRpbmdzPzogRmxleFNldHRpbmdzO1xuXHRzdGFzaGVkPzogYm9vbGVhbjtcblx0bGV2ZWw6IG51bWJlcjtcblx0Y29udGVudD86IEFycmF5PE9iamVjdFBhZ2VTdWJTZWN0aW9uPjtcblx0c2lkZUNvbnRlbnQ/OiBTaWRlQ29udGVudERlZjtcbn07XG5cbnR5cGUgVW5zdXBwb3J0ZWRTdWJTZWN0aW9uID0gQmFzZVN1YlNlY3Rpb24gJiB7XG5cdHRleHQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiA9IEJhc2VTdWJTZWN0aW9uICYge1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5EYXRhVmlzdWFsaXphdGlvbjtcblx0cHJlc2VudGF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb247XG5cdHNob3dUaXRsZTogYm9vbGVhbiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR0aXRsZVZpc2libGU/OiBzdHJpbmcgfCBib29sZWFuO1xufTtcblxudHlwZSBDb250YWN0U3ViU2VjdGlvbiA9IFVuc3VwcG9ydGVkU3ViU2VjdGlvbjtcblxudHlwZSBYTUxGcmFnbWVudFN1YlNlY3Rpb24gPSBPbWl0PEJhc2VTdWJTZWN0aW9uLCBcImFubm90YXRpb25QYXRoXCI+ICYge1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5YTUxGcmFnbWVudDtcblx0dGVtcGxhdGU6IHN0cmluZztcblx0YWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPjtcbn07XG5cbnR5cGUgUGxhY2Vob2xkZXJGcmFnbWVudFN1YlNlY3Rpb24gPSBPbWl0PEJhc2VTdWJTZWN0aW9uLCBcImFubm90YXRpb25QYXRoXCI+ICYge1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5QbGFjZWhvbGRlcjtcblx0YWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPjtcbn07XG5cbnR5cGUgTWl4ZWRTdWJTZWN0aW9uID0gQmFzZVN1YlNlY3Rpb24gJiB7XG5cdGNvbnRlbnQ6IEFycmF5PE9iamVjdFBhZ2VTdWJTZWN0aW9uPjtcbn07XG5cbmV4cG9ydCB0eXBlIEZvcm1TdWJTZWN0aW9uID0gQmFzZVN1YlNlY3Rpb24gJiB7XG5cdHR5cGU6IFN1YlNlY3Rpb25UeXBlLkZvcm07XG5cdGZvcm1EZWZpbml0aW9uOiBGb3JtRGVmaW5pdGlvbjtcblx0YWN0aW9uczogQ29udmVydGVyQWN0aW9uW10gfCBCYXNlQWN0aW9uW107XG5cdGNvbW1hbmRBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+O1xufTtcblxuZXhwb3J0IHR5cGUgT2JqZWN0UGFnZVNlY3Rpb24gPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdGlkOiBzdHJpbmc7XG5cdHRpdGxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0c2hvd1RpdGxlPzogYm9vbGVhbjtcblx0dmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdHN1YlNlY3Rpb25zOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdO1xufTtcblxudHlwZSBTaWRlQ29udGVudERlZiA9IHtcblx0dGVtcGxhdGU/OiBzdHJpbmc7XG5cdGlkPzogc3RyaW5nO1xuXHRzaWRlQ29udGVudEZhbGxEb3duPzogc3RyaW5nO1xuXHRjb250YWluZXJRdWVyeT86IHN0cmluZztcblx0dmlzaWJsZT86IGJvb2xlYW47XG5cdGVxdWFsU3BsaXQ/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgQ3VzdG9tT2JqZWN0UGFnZVNlY3Rpb24gPSBDdXN0b21FbGVtZW50PE9iamVjdFBhZ2VTZWN0aW9uPjtcblxuZXhwb3J0IHR5cGUgQ3VzdG9tT2JqZWN0UGFnZVN1YlNlY3Rpb24gPSBDdXN0b21FbGVtZW50PE9iamVjdFBhZ2VTdWJTZWN0aW9uPjtcblxuY29uc3QgdmlzdWFsaXphdGlvblRlcm1zOiBzdHJpbmdbXSA9IFtcblx0VUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0sXG5cdFVJQW5ub3RhdGlvblRlcm1zLkNoYXJ0LFxuXHRVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50LFxuXHRVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XG5dO1xuXG4vKipcbiAqIENyZWF0ZSBzdWJzZWN0aW9ucyBiYXNlZCBvbiBmYWNldCBkZWZpbml0aW9uLlxuICpcbiAqIEBwYXJhbSBmYWNldENvbGxlY3Rpb24gQ29sbGVjdGlvbiBvZiBmYWNldHNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGlzSGVhZGVyU2VjdGlvbiBUcnVlIGlmIGhlYWRlciBzZWN0aW9uIGlzIGdlbmVyYXRlZCBpbiB0aGlzIGl0ZXJhdGlvblxuICogQHJldHVybnMgVGhlIGN1cnJlbnQgc3Vic2VjdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN1YlNlY3Rpb25zKFxuXHRmYWNldENvbGxlY3Rpb246IEZhY2V0VHlwZXNbXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0aXNIZWFkZXJTZWN0aW9uPzogYm9vbGVhblxuKTogT2JqZWN0UGFnZVN1YlNlY3Rpb25bXSB7XG5cdC8vIEZpcnN0IHdlIGRldGVybWluZSB3aGljaCBzdWIgc2VjdGlvbiB3ZSBuZWVkIHRvIGNyZWF0ZVxuXHRjb25zdCBmYWNldHNUb0NyZWF0ZSA9IGZhY2V0Q29sbGVjdGlvbi5yZWR1Y2UoKGZhY2V0c1RvQ3JlYXRlOiBGYWNldFR5cGVzW10sIGZhY2V0RGVmaW5pdGlvbikgPT4ge1xuXHRcdHN3aXRjaCAoZmFjZXREZWZpbml0aW9uLiRUeXBlKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0OlxuXHRcdFx0XHRmYWNldHNUb0NyZWF0ZS5wdXNoKGZhY2V0RGVmaW5pdGlvbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXQ6XG5cdFx0XHRcdC8vIFRPRE8gSWYgdGhlIENvbGxlY3Rpb24gRmFjZXQgaGFzIGEgY2hpbGQgb2YgdHlwZSBDb2xsZWN0aW9uIEZhY2V0IHdlIGJyaW5nIHRoZW0gdXAgb25lIGxldmVsIChGb3JtICsgVGFibGUgdXNlIGNhc2UpID9cblx0XHRcdFx0Ly8gZmlyc3QgY2FzZSBmYWNldCBDb2xsZWN0aW9uIGlzIGNvbWJpbmF0aW9uIG9mIGNvbGxlY3Rpb24gYW5kIHJlZmVyZW5jZSBmYWNldCBvciBub3QgYWxsIGZhY2V0cyBhcmUgcmVmZXJlbmNlIGZhY2V0cy5cblx0XHRcdFx0aWYgKGZhY2V0RGVmaW5pdGlvbi5GYWNldHMuZmluZCgoZmFjZXRUeXBlKSA9PiBmYWNldFR5cGUuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkNvbGxlY3Rpb25GYWNldCkpIHtcblx0XHRcdFx0XHRmYWNldHNUb0NyZWF0ZS5zcGxpY2UoZmFjZXRzVG9DcmVhdGUubGVuZ3RoLCAwLCAuLi5mYWNldERlZmluaXRpb24uRmFjZXRzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmYWNldHNUb0NyZWF0ZS5wdXNoKGZhY2V0RGVmaW5pdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZVVSTEZhY2V0OlxuXHRcdFx0XHQvLyBOb3Qgc3VwcG9ydGVkXG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFjZXRzVG9DcmVhdGU7XG5cdH0sIFtdKTtcblxuXHQvLyBUaGVuIHdlIGNyZWF0ZSB0aGUgYWN0dWFsIHN1YnNlY3Rpb25zXG5cdHJldHVybiBmYWNldHNUb0NyZWF0ZS5tYXAoKGZhY2V0KSA9PlxuXHRcdGNyZWF0ZVN1YlNlY3Rpb24oZmFjZXQsIGZhY2V0c1RvQ3JlYXRlLCBjb252ZXJ0ZXJDb250ZXh0LCAwLCAhKGZhY2V0IGFzIGFueSk/LkZhY2V0cz8ubGVuZ3RoLCBpc0hlYWRlclNlY3Rpb24pXG5cdCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBzdWJzZWN0aW9ucyBiYXNlZCBvbiB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgY3VzdG9tIGhlYWRlciBmYWNldC5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHN1YnNlY3Rpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21IZWFkZXJGYWNldFN1YlNlY3Rpb25zKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdIHtcblx0Y29uc3QgY3VzdG9tSGVhZGVyRmFjZXRzOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21PYmplY3RQYWdlSGVhZGVyRmFjZXQ+ID0gZ2V0SGVhZGVyRmFjZXRzRnJvbU1hbmlmZXN0KFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuZ2V0SGVhZGVyRmFjZXRzKClcblx0KTtcblx0Y29uc3QgYUN1c3RvbUhlYWRlckZhY2V0czogQ3VzdG9tT2JqZWN0UGFnZUhlYWRlckZhY2V0W10gPSBbXTtcblx0T2JqZWN0LmtleXMoY3VzdG9tSGVhZGVyRmFjZXRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRhQ3VzdG9tSGVhZGVyRmFjZXRzLnB1c2goY3VzdG9tSGVhZGVyRmFjZXRzW2tleV0pO1xuXHRcdHJldHVybiBhQ3VzdG9tSGVhZGVyRmFjZXRzO1xuXHR9KTtcblx0Y29uc3QgZmFjZXRzVG9DcmVhdGUgPSBhQ3VzdG9tSGVhZGVyRmFjZXRzLnJlZHVjZSgoZmFjZXRzVG9DcmVhdGU6IEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldFtdLCBjdXN0b21IZWFkZXJGYWNldCkgPT4ge1xuXHRcdGlmIChjdXN0b21IZWFkZXJGYWNldC50ZW1wbGF0ZUVkaXQpIHtcblx0XHRcdGZhY2V0c1RvQ3JlYXRlLnB1c2goY3VzdG9tSGVhZGVyRmFjZXQpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFjZXRzVG9DcmVhdGU7XG5cdH0sIFtdKTtcblxuXHRyZXR1cm4gZmFjZXRzVG9DcmVhdGUubWFwKChjdXN0b21IZWFkZXJGYWNldCkgPT4gY3JlYXRlQ3VzdG9tSGVhZGVyRmFjZXRTdWJTZWN0aW9uKGN1c3RvbUhlYWRlckZhY2V0KSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN1YnNlY3Rpb24gYmFzZWQgb24gYSBjdXN0b20gaGVhZGVyIGZhY2V0LlxuICpcbiAqIEBwYXJhbSBjdXN0b21IZWFkZXJGYWNldCBBIGN1c3RvbSBoZWFkZXIgZmFjZXRcbiAqIEByZXR1cm5zIEEgZGVmaW5pdGlvbiBmb3IgYSBzdWJzZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbihjdXN0b21IZWFkZXJGYWNldDogQ3VzdG9tT2JqZWN0UGFnZUhlYWRlckZhY2V0KTogT2JqZWN0UGFnZVN1YlNlY3Rpb24ge1xuXHRjb25zdCBzdWJTZWN0aW9uSUQgPSBnZXRDdXN0b21TdWJTZWN0aW9uSUQoY3VzdG9tSGVhZGVyRmFjZXQua2V5KTtcblx0Y29uc3Qgc3ViU2VjdGlvbjogWE1MRnJhZ21lbnRTdWJTZWN0aW9uID0ge1xuXHRcdGlkOiBzdWJTZWN0aW9uSUQsXG5cdFx0a2V5OiBjdXN0b21IZWFkZXJGYWNldC5rZXksXG5cdFx0dGl0bGU6IGN1c3RvbUhlYWRlckZhY2V0LnRpdGxlLFxuXHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLlhNTEZyYWdtZW50LFxuXHRcdHRlbXBsYXRlOiBjdXN0b21IZWFkZXJGYWNldC50ZW1wbGF0ZUVkaXQgfHwgXCJcIixcblx0XHR2aXNpYmxlOiBjdXN0b21IZWFkZXJGYWNldC52aXNpYmxlLFxuXHRcdGxldmVsOiAxLFxuXHRcdHNpZGVDb250ZW50OiB1bmRlZmluZWQsXG5cdFx0c3Rhc2hlZDogY3VzdG9tSGVhZGVyRmFjZXQuc3Rhc2hlZCxcblx0XHRmbGV4U2V0dGluZ3M6IGN1c3RvbUhlYWRlckZhY2V0LmZsZXhTZXR0aW5ncyxcblx0XHRhY3Rpb25zOiB7fVxuXHR9O1xuXHRyZXR1cm4gc3ViU2VjdGlvbjtcbn1cblxuLy8gZnVuY3Rpb24gaXNUYXJnZXRGb3JDb21wbGlhbnQoYW5ub3RhdGlvblBhdGg6IEFubm90YXRpb25QYXRoKSB7XG4vLyBcdHJldHVybiAvLipjb21cXC5zYXBcXC52b2NhYnVsYXJpZXNcXC5VSVxcLnYxXFwuKEZpZWxkR3JvdXB8SWRlbnRpZmljYXRpb258RGF0YVBvaW50fFN0YXR1c0luZm8pLiovLnRlc3QoYW5ub3RhdGlvblBhdGgudmFsdWUpO1xuLy8gfVxuY29uc3QgZ2V0U3ViU2VjdGlvbktleSA9IChmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuXHRyZXR1cm4gZmFjZXREZWZpbml0aW9uLklEPy50b1N0cmluZygpIHx8IGZhY2V0RGVmaW5pdGlvbi5MYWJlbD8udG9TdHJpbmcoKSB8fCBmYWxsYmFjaztcbn07XG4vKipcbiAqIEFkZHMgRm9ybSBtZW51IGFjdGlvbiB0byBhbGwgZm9ybSBhY3Rpb25zLCByZW1vdmVzIGR1cGxpY2F0ZSBhY3Rpb25zIGFuZCBoaWRkZW4gYWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gYWN0aW9ucyBUaGUgYWN0aW9ucyBpbnZvbHZlZFxuICogQHBhcmFtIGZhY2V0RGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiBmb3IgdGhlIGZhY2V0XG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBmb3JtIG1lbnUgYWN0aW9uc1xuICovXG5mdW5jdGlvbiBhZGRGb3JtTWVudUFjdGlvbnMoYWN0aW9uczogQ29udmVydGVyQWN0aW9uW10sIGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENvbWJpbmVkQWN0aW9uIHtcblx0Y29uc3QgaGlkZGVuQWN0aW9uczogQmFzZUFjdGlvbltdID0gZ2V0Rm9ybUhpZGRlbkFjdGlvbnMoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSB8fCBbXSxcblx0XHRmb3JtQWN0aW9uczogQ29uZmlndXJhYmxlUmVjb3JkPE1hbmlmZXN0QWN0aW9uPiA9IGdldEZvcm1BY3Rpb25zKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0bWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChmb3JtQWN0aW9ucywgY29udmVydGVyQ29udGV4dCwgYWN0aW9ucywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGhpZGRlbkFjdGlvbnMpLFxuXHRcdGFjdGlvbk92ZXJ3cml0ZUNvbmZpZzogT3ZlcnJpZGVUeXBlQWN0aW9uID0ge1xuXHRcdFx0ZW5hYmxlZDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRcdHZpc2libGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0XHRjb21tYW5kOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlXG5cdFx0fSxcblx0XHRmb3JtQWxsQWN0aW9ucyA9IGluc2VydEN1c3RvbUVsZW1lbnRzKGFjdGlvbnMsIG1hbmlmZXN0QWN0aW9ucy5hY3Rpb25zLCBhY3Rpb25PdmVyd3JpdGVDb25maWcpO1xuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnM6IGZvcm1BbGxBY3Rpb25zID8gZ2V0VmlzaWJpbGl0eUVuYWJsZW1lbnRGb3JtTWVudUFjdGlvbnMocmVtb3ZlRHVwbGljYXRlQWN0aW9ucyhmb3JtQWxsQWN0aW9ucykpIDogYWN0aW9ucyxcblx0XHRjb21tYW5kQWN0aW9uczogbWFuaWZlc3RBY3Rpb25zLmNvbW1hbmRBY3Rpb25zXG5cdH07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBhY3Rpb24gZm9ybSBhIGZhY2V0LlxuICpcbiAqIEBwYXJhbSBmYWNldERlZmluaXRpb25cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY3VycmVudCBmYWNldCBhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldEZhY2V0QWN0aW9ucyhmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBDb21iaW5lZEFjdGlvbiB7XG5cdGxldCBhY3Rpb25zOiBDb252ZXJ0ZXJBY3Rpb25bXSA9IFtdO1xuXHRzd2l0Y2ggKGZhY2V0RGVmaW5pdGlvbi4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0YWN0aW9ucyA9IChcblx0XHRcdFx0ZmFjZXREZWZpbml0aW9uLkZhY2V0cy5maWx0ZXIoKHN1YkZhY2V0RGVmaW5pdGlvbikgPT4gaXNSZWZlcmVuY2VGYWNldChzdWJGYWNldERlZmluaXRpb24pKSBhcyBSZWZlcmVuY2VGYWNldFR5cGVzW11cblx0XHRcdCkucmVkdWNlKFxuXHRcdFx0XHQoYWN0aW9uUmVkdWNlcjogQ29udmVydGVyQWN0aW9uW10sIHJlZmVyZW5jZUZhY2V0KSA9PlxuXHRcdFx0XHRcdGNyZWF0ZUZvcm1BY3Rpb25SZWR1Y2VyKGFjdGlvblJlZHVjZXIsIHJlZmVyZW5jZUZhY2V0LCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0W11cblx0XHRcdCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0OlxuXHRcdFx0YWN0aW9ucyA9IGNyZWF0ZUZvcm1BY3Rpb25SZWR1Y2VyKFtdLCBmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG5cdHJldHVybiBhZGRGb3JtTWVudUFjdGlvbnMoYWN0aW9ucywgZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcbn1cbi8qKlxuICogUmV0dXJucyB0aGUgYnV0dG9uIHR5cGUgYmFzZWQgb24gQFVJLkVtcGhhc2l6ZWQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gZW1waGFzaXplZCBFbXBoYXNpemVkIGFubm90YXRpb24gdmFsdWUuXG4gKiBAcmV0dXJucyBUaGUgYnV0dG9uIHR5cGUgb3IgcGF0aCBiYXNlZCBleHByZXNzaW9uLlxuICovXG5mdW5jdGlvbiBnZXRCdXR0b25UeXBlKGVtcGhhc2l6ZWQ6IEVtcGhhc2l6ZWQgfCB1bmRlZmluZWQpOiBCdXR0b25UeXBlIHtcblx0Ly8gRW1waGFzaXplZCBpcyBhIGJvb2xlYW4gc28gaWYgaXQncyBlcXVhbCB0byB0cnVlIHdlIHNob3cgdGhlIGJ1dHRvbiBhcyBHaG9zdCwgb3RoZXJ3aXNlIGFzIFRyYW5zcGFyZW50XG5cdGNvbnN0IGJ1dHRvblR5cGVDb25kaXRpb24gPSBlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZW1waGFzaXplZCksIHRydWUpO1xuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKGJ1dHRvblR5cGVDb25kaXRpb24sIEJ1dHRvblR5cGUuR2hvc3QsIEJ1dHRvblR5cGUuVHJhbnNwYXJlbnQpKSBhcyBCdXR0b25UeXBlO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHN1YnNlY3Rpb24gYmFzZWQgb24gRmFjZXRUeXBlcy5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uXG4gKiBAcGFyYW0gZmFjZXRzVG9DcmVhdGVcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gbGV2ZWxcbiAqIEBwYXJhbSBoYXNTaW5nbGVDb250ZW50XG4gKiBAcGFyYW0gaXNIZWFkZXJTZWN0aW9uXG4gKiBAcmV0dXJucyBBIHN1YnNlY3Rpb24gZGVmaW5pdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ViU2VjdGlvbihcblx0ZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRmYWNldHNUb0NyZWF0ZTogRmFjZXRUeXBlc1tdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRsZXZlbDogbnVtYmVyLFxuXHRoYXNTaW5nbGVDb250ZW50OiBib29sZWFuLFxuXHRpc0hlYWRlclNlY3Rpb24/OiBib29sZWFuXG4pOiBPYmplY3RQYWdlU3ViU2VjdGlvbiB7XG5cdGNvbnN0IHN1YlNlY3Rpb25JRCA9IGdldFN1YlNlY3Rpb25JRChmYWNldERlZmluaXRpb24pO1xuXHRjb25zdCBvSGlkZGVuQW5ub3RhdGlvbjogYW55ID0gZmFjZXREZWZpbml0aW9uLmFubm90YXRpb25zPy5VST8uSGlkZGVuO1xuXHRjb25zdCBpc1Zpc2libGUgPSBjb21waWxlRXhwcmVzc2lvbihub3QoZXF1YWwodHJ1ZSwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9IaWRkZW5Bbm5vdGF0aW9uKSkpKTtcblx0Y29uc3QgaXNEeW5hbWljRXhwcmVzc2lvbiA9XG5cdFx0aXNWaXNpYmxlICYmIHR5cGVvZiBpc1Zpc2libGUgPT09IFwic3RyaW5nXCIgJiYgaXNWaXNpYmxlLmluZGV4T2YoXCJ7PVwiKSA9PT0gMCAmJiBvSGlkZGVuQW5ub3RhdGlvbj8udHlwZSAhPT0gXCJQYXRoXCI7XG5cdGNvbnN0IGlzVmlzaWJsZUR5bmFtaWNFeHByZXNzaW9uID1cblx0XHRpc1Zpc2libGUgJiYgaXNEeW5hbWljRXhwcmVzc2lvbiA/IGlzVmlzaWJsZS5zdWJzdHJpbmcoaXNWaXNpYmxlLmluZGV4T2YoXCJ7PVwiKSArIDIsIGlzVmlzaWJsZS5sYXN0SW5kZXhPZihcIn1cIikpIDogZmFsc2U7XG5cdGNvbnN0IHRpdGxlID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGZhY2V0RGVmaW5pdGlvbi5MYWJlbCkpO1xuXHRjb25zdCBzdWJTZWN0aW9uOiBCYXNlU3ViU2VjdGlvbiA9IHtcblx0XHRpZDogc3ViU2VjdGlvbklELFxuXHRcdGtleTogZ2V0U3ViU2VjdGlvbktleShmYWNldERlZmluaXRpb24sIHN1YlNlY3Rpb25JRCksXG5cdFx0dGl0bGU6IHRpdGxlLFxuXHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLlVua25vd24sXG5cdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChmYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHR2aXNpYmxlOiBpc1Zpc2libGUsXG5cdFx0aXNWaXNpYmlsaXR5RHluYW1pYzogaXNEeW5hbWljRXhwcmVzc2lvbixcblx0XHRsZXZlbDogbGV2ZWwsXG5cdFx0c2lkZUNvbnRlbnQ6IHVuZGVmaW5lZFxuXHR9O1xuXHRpZiAoaXNIZWFkZXJTZWN0aW9uKSB7XG5cdFx0c3ViU2VjdGlvbi5zdGFzaGVkID0gZ2V0U3Rhc2hlZFNldHRpbmdzRm9ySGVhZGVyRmFjZXQoZmFjZXREZWZpbml0aW9uLCBmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdHN1YlNlY3Rpb24uZmxleFNldHRpbmdzID0ge1xuXHRcdFx0ZGVzaWdudGltZTogZ2V0RGVzaWduVGltZU1ldGFkYXRhU2V0dGluZ3NGb3JIZWFkZXJGYWNldChmYWNldERlZmluaXRpb24sIGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dClcblx0XHR9O1xuXHR9XG5cdGxldCB1bnN1cHBvcnRlZFRleHQgPSBcIlwiO1xuXHRsZXZlbCsrO1xuXHRzd2l0Y2ggKGZhY2V0RGVmaW5pdGlvbi4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0Y29uc3QgZmFjZXRzID0gZmFjZXREZWZpbml0aW9uLkZhY2V0cztcblxuXHRcdFx0Ly8gRmlsdGVyIGZvciBhbGwgZmFjZXRzIG9mIHRoaXMgc3Vic2VjdGlvbiB0aGF0IGFyZSByZWZlcnJpbmcgdG8gYW4gYW5ub3RhdGlvbiBkZXNjcmliaW5nIGEgdmlzdWFsaXphdGlvbiAoZS5nLiB0YWJsZSBvciBjaGFydClcblx0XHRcdGNvbnN0IHZpc3VhbGl6YXRpb25GYWNldHMgPSBmYWNldHNcblx0XHRcdFx0Lm1hcCgoZmFjZXQsIGluZGV4KSA9PiAoeyBpbmRleCwgZmFjZXQgfSkpIC8vIFJlbWVtYmVyIHRoZSBpbmRleCBhc3NpZ25lZCB0byBlYWNoIGZhY2V0XG5cdFx0XHRcdC5maWx0ZXIoKHsgZmFjZXQgfSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiB2aXN1YWxpemF0aW9uVGVybXMuaW5jbHVkZXMoKGZhY2V0IGFzIFJlZmVyZW5jZUZhY2V0KS5UYXJnZXQ/LiR0YXJnZXQ/LnRlcm0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0Ly8gRmlsdGVyIG91dCBhbGwgdmlzdWFsaXphdGlvbiBmYWNldHM7IFwidmlzdWFsaXphdGlvbkZhY2V0c1wiIGFuZCBcIm5vblZpc3VhbGl6YXRpb25GYWNldHNcIiBhcmUgZGlzam9pbnRcblx0XHRcdGNvbnN0IG5vblZpc3VhbGl6YXRpb25GYWNldHMgPSBmYWNldHMuZmlsdGVyKFxuXHRcdFx0XHQoZmFjZXQpID0+ICF2aXN1YWxpemF0aW9uRmFjZXRzLmZpbmQoKHZpc3VhbGl6YXRpb24pID0+IHZpc3VhbGl6YXRpb24uZmFjZXQgPT09IGZhY2V0KVxuXHRcdFx0KTtcblxuXHRcdFx0aWYgKHZpc3VhbGl6YXRpb25GYWNldHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHQvLyBDb2xsZWN0aW9uRmFjZXRzIHdpdGggdmlzdWFsaXphdGlvbnMgbXVzdCBiZSBoYW5kbGVkIHNlcGFyYXRlbHkgYXMgdGhleSBjYW5ub3QgYmUgaW5jbHVkZWQgaW4gZm9ybXNcblx0XHRcdFx0Y29uc3QgdmlzdWFsaXphdGlvbkNvbnRlbnQ6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW10gPSBbXTtcblx0XHRcdFx0Y29uc3QgZm9ybUNvbnRlbnQ6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW10gPSBbXTtcblx0XHRcdFx0Y29uc3QgbWl4ZWRDb250ZW50OiBPYmplY3RQYWdlU3ViU2VjdGlvbltdID0gW107XG5cblx0XHRcdFx0Ly8gQ3JlYXRlIGVhY2ggdmlzdWFsaXphdGlvbiBmYWNldCBhcyBpZiBpdCB3YXMgaXRzIG93biBzdWJzZWN0aW9uICh2aWEgcmVjdXJzaW9uKSwgYW5kIGtlZXAgdGhlaXIgcmVsYXRpdmUgb3JkZXJpbmdcblx0XHRcdFx0Zm9yIChjb25zdCB7IGZhY2V0IH0gb2YgdmlzdWFsaXphdGlvbkZhY2V0cykge1xuXHRcdFx0XHRcdHZpc3VhbGl6YXRpb25Db250ZW50LnB1c2goY3JlYXRlU3ViU2VjdGlvbihmYWNldCwgW10sIGNvbnZlcnRlckNvbnRleHQsIGxldmVsLCBmYWNldHMubGVuZ3RoID09PSAxLCBpc0hlYWRlclNlY3Rpb24pKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChub25WaXN1YWxpemF0aW9uRmFjZXRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHQvLyBUaGlzIHN1YnNlY3Rpb24gaW5jbHVkZXMgdmlzdWFsaXphdGlvbnMgYW5kIG90aGVyIGNvbnRlbnQsIHNvIGl0IGlzIGEgXCJNaXhlZFwiIHN1YnNlY3Rpb25cblx0XHRcdFx0XHRMb2cud2FybmluZyhcblx0XHRcdFx0XHRcdGBXYXJuaW5nOiBDb2xsZWN0aW9uRmFjZXQgJyR7ZmFjZXREZWZpbml0aW9uLklEfScgaW5jbHVkZXMgYSBjb21iaW5hdGlvbiBvZiBlaXRoZXIgYSBjaGFydCBvciBhIHRhYmxlIGFuZCBvdGhlciBjb250ZW50LiBUaGlzIGNhbiBsZWFkIHRvIHJlbmRlcmluZyBpc3N1ZXMuIENvbnNpZGVyIG1vdmluZyB0aGUgY2hhcnQgb3IgdGFibGUgaW50byBhIHNlcGFyYXRlIENvbGxlY3Rpb25GYWNldC5gXG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdGZhY2V0RGVmaW5pdGlvbi5GYWNldHMgPSBub25WaXN1YWxpemF0aW9uRmFjZXRzO1xuXHRcdFx0XHRcdC8vIENyZWF0ZSBhIGpvaW5lZCBmb3JtIG9mIGFsbCBmYWNldHMgdGhhdCBhcmUgbm90IHJlZmVycmluZyB0byB2aXN1YWxpemF0aW9uc1xuXHRcdFx0XHRcdGZvcm1Db250ZW50LnB1c2goY3JlYXRlU3ViU2VjdGlvbihmYWNldERlZmluaXRpb24sIFtdLCBjb252ZXJ0ZXJDb250ZXh0LCBsZXZlbCwgaGFzU2luZ2xlQ29udGVudCwgaXNIZWFkZXJTZWN0aW9uKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBNZXJnZSB0aGUgdmlzdWFsaXphdGlvbiBjb250ZW50IHdpdGggdGhlIGZvcm0gY29udGVudFxuXHRcdFx0XHRpZiAodmlzdWFsaXphdGlvbkZhY2V0cy5maW5kKCh7IGluZGV4IH0pID0+IGluZGV4ID09PSAwKSkge1xuXHRcdFx0XHRcdC8vIElmIHRoZSBmaXJzdCBmYWNldCBpcyBhIHZpc3VhbGl6YXRpb24sIGRpc3BsYXkgdGhlIHZpc3VhbGl6YXRpb25zIGZpcnN0XG5cdFx0XHRcdFx0bWl4ZWRDb250ZW50LnB1c2goLi4udmlzdWFsaXphdGlvbkNvbnRlbnQpO1xuXHRcdFx0XHRcdG1peGVkQ29udGVudC5wdXNoKC4uLmZvcm1Db250ZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBPdGhlcndpc2UsIGRpc3BsYXkgdGhlIGZvcm0gZmlyc3Rcblx0XHRcdFx0XHRtaXhlZENvbnRlbnQucHVzaCguLi5mb3JtQ29udGVudCk7XG5cdFx0XHRcdFx0bWl4ZWRDb250ZW50LnB1c2goLi4udmlzdWFsaXphdGlvbkNvbnRlbnQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgbWl4ZWRTdWJTZWN0aW9uOiBNaXhlZFN1YlNlY3Rpb24gPSB7XG5cdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5NaXhlZCxcblx0XHRcdFx0XHRsZXZlbDogbGV2ZWwsXG5cdFx0XHRcdFx0Y29udGVudDogbWl4ZWRDb250ZW50XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBtaXhlZFN1YlNlY3Rpb247XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUaGlzIENvbGxlY3Rpb25GYWNldCBvbmx5IGluY2x1ZGVzIGNvbnRlbnQgdGhhdCBjYW4gYmUgcmVuZGVyZWQgaW4gYSBtZXJnZWQgZm9ybVxuXHRcdFx0XHRjb25zdCBmYWNldEFjdGlvbnMgPSBnZXRGYWNldEFjdGlvbnMoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0XHRmb3JtQ29sbGVjdGlvblN1YlNlY3Rpb246IEZvcm1TdWJTZWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLkZvcm0sXG5cdFx0XHRcdFx0XHRmb3JtRGVmaW5pdGlvbjogY3JlYXRlRm9ybURlZmluaXRpb24oZmFjZXREZWZpbml0aW9uLCBpc1Zpc2libGUsIGNvbnZlcnRlckNvbnRleHQsIGZhY2V0QWN0aW9ucy5hY3Rpb25zKSxcblx0XHRcdFx0XHRcdGxldmVsOiBsZXZlbCxcblx0XHRcdFx0XHRcdGFjdGlvbnM6IGZhY2V0QWN0aW9ucy5hY3Rpb25zLmZpbHRlcigoYWN0aW9uKSA9PiBhY3Rpb24uZmFjZXROYW1lID09PSB1bmRlZmluZWQpLFxuXHRcdFx0XHRcdFx0Y29tbWFuZEFjdGlvbnM6IGZhY2V0QWN0aW9ucy5jb21tYW5kQWN0aW9uc1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBmb3JtQ29sbGVjdGlvblN1YlNlY3Rpb247XG5cdFx0XHR9XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldDpcblx0XHRcdGlmICghZmFjZXREZWZpbml0aW9uLlRhcmdldC4kdGFyZ2V0KSB7XG5cdFx0XHRcdHVuc3VwcG9ydGVkVGV4dCA9IGBVbmFibGUgdG8gZmluZCBhbm5vdGF0aW9uUGF0aCAke2ZhY2V0RGVmaW5pdGlvbi5UYXJnZXQudmFsdWV9YDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN3aXRjaCAoZmFjZXREZWZpbml0aW9uLlRhcmdldC4kdGFyZ2V0LnRlcm0pIHtcblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtOlxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQ6XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0XHRcdGNvbnN0IHByZXNlbnRhdGlvbiA9IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdFx0XHRcdFx0ZmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZSxcblx0XHRcdFx0XHRcdFx0Z2V0Q29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbmNlKGZhY2V0RGVmaW5pdGlvbiwgZmFjZXRzVG9DcmVhdGUsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdGlzSGVhZGVyU2VjdGlvblxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGNvbnN0IHN1YlNlY3Rpb25UaXRsZTogc3RyaW5nID0gc3ViU2VjdGlvbi50aXRsZSA/IHN1YlNlY3Rpb24udGl0bGUgOiBcIlwiO1xuXHRcdFx0XHRcdFx0Y29uc3QgY29udHJvbFRpdGxlID1cblx0XHRcdFx0XHRcdFx0KHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9uc1swXSBhcyBhbnkpPy5hbm5vdGF0aW9uPy50aXRsZSB8fCAocHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zWzBdIGFzIGFueSk/LnRpdGxlO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc2hvd1RpdGxlID0gZ2V0VGl0bGVWaXNpYmlsaXR5KGNvbnRyb2xUaXRsZSwgc3ViU2VjdGlvblRpdGxlLCBoYXNTaW5nbGVDb250ZW50KTtcblx0XHRcdFx0XHRcdGNvbnN0IHRpdGxlVmlzaWJsZUV4cHJlc3Npb24gPSBpc1Zpc2libGUgJiYgdGl0bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgKHRpdGxlID8gaXNWaXNpYmxlIDogZmFsc2UpO1xuXHRcdFx0XHRcdFx0Y29uc3QgZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uOiBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdC4uLnN1YlNlY3Rpb24sXG5cdFx0XHRcdFx0XHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLkRhdGFWaXN1YWxpemF0aW9uLFxuXHRcdFx0XHRcdFx0XHRsZXZlbDogbGV2ZWwsXG5cdFx0XHRcdFx0XHRcdHByZXNlbnRhdGlvbjogcHJlc2VudGF0aW9uLFxuXHRcdFx0XHRcdFx0XHRzaG93VGl0bGU6IHNob3dUaXRsZSxcblx0XHRcdFx0XHRcdFx0dGl0bGVWaXNpYmxlOiBpc0R5bmFtaWNFeHByZXNzaW9uXG5cdFx0XHRcdFx0XHRcdFx0PyBgez0gKCR7aXNWaXNpYmxlRHluYW1pY0V4cHJlc3Npb259KSAmJiAoJyR7dGl0bGV9JyAhPT0ndW5kZWZpbmVkJykgJiYgKCR7c2hvd1RpdGxlfSA/IHRydWUgOiBmYWxzZSkgfWBcblx0XHRcdFx0XHRcdFx0XHQ6IHRpdGxlVmlzaWJsZUV4cHJlc3Npb25cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZXR1cm4gZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uO1xuXG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwOlxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuSWRlbnRpZmljYXRpb246XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5EYXRhUG9pbnQ6XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TdGF0dXNJbmZvOlxuXHRcdFx0XHRcdGNhc2UgQ29tbXVuaWNhdGlvbkFubm90YXRpb25UZXJtcy5Db250YWN0OlxuXHRcdFx0XHRcdFx0Ly8gQWxsIHRob3NlIGVsZW1lbnQgYmVsb25nIHRvIGEgZnJvbSBmYWNldFxuXHRcdFx0XHRcdFx0Y29uc3QgZmFjZXRBY3Rpb25zID0gZ2V0RmFjZXRBY3Rpb25zKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRcdFx0XHRcdGZvcm1FbGVtZW50U3ViU2VjdGlvbjogRm9ybVN1YlNlY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5Gb3JtLFxuXHRcdFx0XHRcdFx0XHRcdGxldmVsOiBsZXZlbCxcblx0XHRcdFx0XHRcdFx0XHRmb3JtRGVmaW5pdGlvbjogY3JlYXRlRm9ybURlZmluaXRpb24oZmFjZXREZWZpbml0aW9uLCBpc1Zpc2libGUsIGNvbnZlcnRlckNvbnRleHQsIGZhY2V0QWN0aW9ucy5hY3Rpb25zKSxcblx0XHRcdFx0XHRcdFx0XHRhY3Rpb25zOiBmYWNldEFjdGlvbnMuYWN0aW9ucy5maWx0ZXIoKGFjdGlvbikgPT4gYWN0aW9uLmZhY2V0TmFtZSA9PT0gdW5kZWZpbmVkKSxcblx0XHRcdFx0XHRcdFx0XHRjb21tYW5kQWN0aW9uczogZmFjZXRBY3Rpb25zLmNvbW1hbmRBY3Rpb25zXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZXR1cm4gZm9ybUVsZW1lbnRTdWJTZWN0aW9uO1xuXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHVuc3VwcG9ydGVkVGV4dCA9IGBGb3IgJHtmYWNldERlZmluaXRpb24uVGFyZ2V0LiR0YXJnZXQudGVybX0gRnJhZ21lbnRgO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlVVJMRmFjZXQ6XG5cdFx0XHR1bnN1cHBvcnRlZFRleHQgPSBcIkZvciBSZWZlcmVuY2UgVVJMIEZhY2V0XCI7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0YnJlYWs7XG5cdH1cblx0Ly8gSWYgd2UgcmVhY2ggaGVyZSB3ZSBlbmRlZCB1cCB3aXRoIGFuIHVuc3VwcG9ydGVkIFN1YlNlY3Rpb24gdHlwZVxuXHRjb25zdCB1bnN1cHBvcnRlZFN1YlNlY3Rpb246IFVuc3VwcG9ydGVkU3ViU2VjdGlvbiA9IHtcblx0XHQuLi5zdWJTZWN0aW9uLFxuXHRcdHRleHQ6IHVuc3VwcG9ydGVkVGV4dFxuXHR9O1xuXHRyZXR1cm4gdW5zdXBwb3J0ZWRTdWJTZWN0aW9uO1xufVxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0byBoaWRlIG9yIHNob3cgc3Vic2VjdGlvbiB0aXRsZVxuICpcbiAqIEBwYXJhbSBjb250cm9sVGl0bGVcbiAqIEBwYXJhbSBzZWN0aW9uVGl0bGVcbiAqIEBwYXJhbSBoYXNTaW5nbGVDb250ZW50XG4gKiBAcmV0dXJucyBCb29sZWFuIHZhbHVlICBvciBleHByZXNzaW9uIGZvciBzaG93VGl0bGVcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGl0bGVWaXNpYmlsaXR5KFxuXHRjb250cm9sVGl0bGU6IHN0cmluZyxcblx0c3ViU2VjdGlvblRpdGxlOiBzdHJpbmcsXG5cdGhhc1NpbmdsZUNvbnRlbnQ6IGJvb2xlYW5cbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Ly8gdmlzaWJsZSBzaGFsbCBiZSB0cnVlIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBjb250ZW50IG9yIGlmIHRoZSBjb250cm9sIGFuZCBzdWJzZWN0aW9uIHRpdGxlIGFyZSBkaWZmZXJlbnRcblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdG9yKG5vdChoYXNTaW5nbGVDb250ZW50KSwgbm90RXF1YWwocmVzb2x2ZUJpbmRpbmdTdHJpbmcoY29udHJvbFRpdGxlKSwgcmVzb2x2ZUJpbmRpbmdTdHJpbmcoc3ViU2VjdGlvblRpdGxlKSkpXG5cdCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZvcm1BY3Rpb25SZWR1Y2VyKFxuXHRhY3Rpb25zOiBDb252ZXJ0ZXJBY3Rpb25bXSxcblx0ZmFjZXREZWZpbml0aW9uOiBSZWZlcmVuY2VGYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBDb252ZXJ0ZXJBY3Rpb25bXSB7XG5cdGNvbnN0IHJlZmVyZW5jZVRhcmdldCA9IGZhY2V0RGVmaW5pdGlvbi5UYXJnZXQuJHRhcmdldDtcblx0Y29uc3QgdGFyZ2V0VmFsdWUgPSBmYWNldERlZmluaXRpb24uVGFyZ2V0LnZhbHVlO1xuXHRsZXQgbWFuaWZlc3RBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+ID0ge307XG5cdGxldCBkYXRhRmllbGRDb2xsZWN0aW9uOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzW10gPSBbXTtcblx0bGV0IFtuYXZpZ2F0aW9uUHJvcGVydHlQYXRoXTogYW55ID0gdGFyZ2V0VmFsdWUuc3BsaXQoXCJAXCIpO1xuXHRpZiAobmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggPiAwKSB7XG5cdFx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGFzdEluZGV4T2YoXCIvXCIpID09PSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpIHtcblx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLnN1YnN0cigwLCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKHJlZmVyZW5jZVRhcmdldCkge1xuXHRcdHN3aXRjaCAocmVmZXJlbmNlVGFyZ2V0LnRlcm0pIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuRmllbGRHcm91cDpcblx0XHRcdFx0ZGF0YUZpZWxkQ29sbGVjdGlvbiA9IChyZWZlcmVuY2VUYXJnZXQgYXMgRmllbGRHcm91cCkuRGF0YTtcblx0XHRcdFx0bWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24ocmVmZXJlbmNlVGFyZ2V0KS5hY3Rpb25zLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdGZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWVcblx0XHRcdFx0KS5hY3Rpb25zO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuSWRlbnRpZmljYXRpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlN0YXR1c0luZm86XG5cdFx0XHRcdGlmIChyZWZlcmVuY2VUYXJnZXQucXVhbGlmaWVyKSB7XG5cdFx0XHRcdFx0ZGF0YUZpZWxkQ29sbGVjdGlvbiA9IHJlZmVyZW5jZVRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdGFjdGlvbnMgPSBkYXRhRmllbGRDb2xsZWN0aW9uLnJlZHVjZSgoYWN0aW9uUmVkdWNlciwgZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0XHRpZiAoZGF0YUZpZWxkLlJlcXVpcmVzQ29udGV4dD8udmFsdWVPZigpID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0XHRcdFx0LmdldERpYWdub3N0aWNzKClcblx0XHRcdFx0XHRcdC5hZGRJc3N1ZShJc3N1ZUNhdGVnb3J5LkFubm90YXRpb24sIElzc3VlU2V2ZXJpdHkuTG93LCBJc3N1ZVR5cGUuTUFMRk9STUVEX0RBVEFGSUVMRF9GT1JfSUJOLlJFUVVJUkVTQ09OVEVYVCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGRhdGFGaWVsZC5JbmxpbmU/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHRcdC5nZXREaWFnbm9zdGljcygpXG5cdFx0XHRcdFx0XHQuYWRkSXNzdWUoSXNzdWVDYXRlZ29yeS5Bbm5vdGF0aW9uLCBJc3N1ZVNldmVyaXR5LkxvdywgSXNzdWVUeXBlLk1BTEZPUk1FRF9EQVRBRklFTERfRk9SX0lCTi5JTkxJTkUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRhRmllbGQuRGV0ZXJtaW5pbmc/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHRcdC5nZXREaWFnbm9zdGljcygpXG5cdFx0XHRcdFx0XHQuYWRkSXNzdWUoSXNzdWVDYXRlZ29yeS5Bbm5vdGF0aW9uLCBJc3N1ZVNldmVyaXR5LkxvdywgSXNzdWVUeXBlLk1BTEZPUk1FRF9EQVRBRklFTERfRk9SX0lCTi5ERVRFUk1JTklORyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgbU5hdmlnYXRpb25QYXJhbWV0ZXJzOiBhbnkgPSB7fTtcblx0XHRcdFx0aWYgKGRhdGFGaWVsZC5NYXBwaW5nKSB7XG5cdFx0XHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzLnNlbWFudGljT2JqZWN0TWFwcGluZyA9IGdldFNlbWFudGljT2JqZWN0TWFwcGluZyhkYXRhRmllbGQuTWFwcGluZyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YWN0aW9uUmVkdWNlci5wdXNoKHtcblx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRcdFx0XHRpZDogZ2V0Rm9ybUlEKGZhY2V0RGVmaW5pdGlvbiwgZGF0YUZpZWxkKSxcblx0XHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKSxcblx0XHRcdFx0XHR0ZXh0OiBkYXRhRmllbGQuTGFiZWw/LnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IFwiXCIsXG5cdFx0XHRcdFx0ZW5hYmxlZDpcblx0XHRcdFx0XHRcdGRhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlICE9PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdFx0PyBjb21waWxlRXhwcmVzc2lvbihlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLk5hdmlnYXRpb25BdmFpbGFibGU/LnZhbHVlT2YoKSksIHRydWUpKVxuXHRcdFx0XHRcdFx0XHQ6IFwidHJ1ZVwiLFxuXHRcdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkpLCB0cnVlKSkpLFxuXHRcdFx0XHRcdGJ1dHRvblR5cGU6IGdldEJ1dHRvblR5cGUoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uRW1waGFzaXplZCksXG5cdFx0XHRcdFx0cHJlc3M6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdFx0Zm4oXCIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZVwiLCBbXG5cdFx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuU2VtYW50aWNPYmplY3QpLFxuXHRcdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLkFjdGlvbiksXG5cdFx0XHRcdFx0XHRcdG1OYXZpZ2F0aW9uUGFyYW1ldGVyc1xuXHRcdFx0XHRcdFx0XSlcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdGN1c3RvbURhdGE6IGNvbXBpbGVFeHByZXNzaW9uKHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLlNlbWFudGljT2JqZWN0KSxcblx0XHRcdFx0XHRcdGFjdGlvbjogZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5BY3Rpb24pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRcdGNvbnN0IGZvcm1NYW5pZmVzdEFjdGlvbnNDb25maWd1cmF0aW9uOiBhbnkgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24ocmVmZXJlbmNlVGFyZ2V0KS5hY3Rpb25zO1xuXHRcdFx0XHRjb25zdCBrZXk6IHN0cmluZyA9IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKTtcblx0XHRcdFx0YWN0aW9uUmVkdWNlci5wdXNoKHtcblx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0XHRpZDogZ2V0Rm9ybUlEKGZhY2V0RGVmaW5pdGlvbiwgZGF0YUZpZWxkKSxcblx0XHRcdFx0XHRrZXk6IGtleSxcblx0XHRcdFx0XHR0ZXh0OiBkYXRhRmllbGQuTGFiZWw/LnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IFwiXCIsXG5cdFx0XHRcdFx0ZW5hYmxlZDogZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24oY29udmVydGVyQ29udGV4dCwgZGF0YUZpZWxkLkFjdGlvblRhcmdldCksXG5cdFx0XHRcdFx0YmluZGluZzogbmF2aWdhdGlvblByb3BlcnR5UGF0aCA/IGB7ICdwYXRoJyA6ICcke25hdmlnYXRpb25Qcm9wZXJ0eVBhdGh9J31gIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkpLCB0cnVlKSkpLFxuXHRcdFx0XHRcdHJlcXVpcmVzRGlhbG9nOiBpc0RpYWxvZyhkYXRhRmllbGQuQWN0aW9uVGFyZ2V0KSxcblx0XHRcdFx0XHRidXR0b25UeXBlOiBnZXRCdXR0b25UeXBlKGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkVtcGhhc2l6ZWQpLFxuXHRcdFx0XHRcdHByZXNzOiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0XHRcdGZuKFxuXHRcdFx0XHRcdFx0XHRcImludm9rZUFjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRbXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLkFjdGlvbixcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0czogZm4oXCJnZXRCaW5kaW5nQ29udGV4dFwiLCBbXSwgcGF0aEluTW9kZWwoXCJcIiwgXCIkc291cmNlXCIpKSxcblx0XHRcdFx0XHRcdFx0XHRcdGludm9jYXRpb25Hcm91cGluZzogKGRhdGFGaWVsZC5JbnZvY2F0aW9uR3JvdXBpbmcgPT09IFwiVUkuT3BlcmF0aW9uR3JvdXBpbmdUeXBlL0NoYW5nZVNldFwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdD8gXCJDaGFuZ2VTZXRcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ6IFwiSXNvbGF0ZWRcIikgYXMgT3BlcmF0aW9uR3JvdXBpbmdUeXBlLFxuXHRcdFx0XHRcdFx0XHRcdFx0bGFiZWw6IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuTGFiZWwpLFxuXHRcdFx0XHRcdFx0XHRcdFx0bW9kZWw6IGZuKFwiZ2V0TW9kZWxcIiwgW10sIHBhdGhJbk1vZGVsKFwiL1wiLCBcIiRzb3VyY2VcIikpLFxuXHRcdFx0XHRcdFx0XHRcdFx0aXNOYXZpZ2FibGU6IGlzQWN0aW9uTmF2aWdhYmxlKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRmb3JtTWFuaWZlc3RBY3Rpb25zQ29uZmlndXJhdGlvbiAmJiBmb3JtTWFuaWZlc3RBY3Rpb25zQ29uZmlndXJhdGlvbltrZXldXG5cdFx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdFx0XHRyZWYoXCIuZWRpdEZsb3dcIilcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdGZhY2V0TmFtZTogZGF0YUZpZWxkLklubGluZSA/IGZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWUgOiB1bmRlZmluZWRcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHJldHVybiBhY3Rpb25SZWR1Y2VyO1xuXHR9LCBhY3Rpb25zKTtcblx0Ly8gT3ZlcndyaXRpbmcgb2YgYWN0aW9ucyBoYXBwZW5zIGluIGFkZEZvcm1NZW51QWN0aW9uc1xuXHRyZXR1cm4gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoYWN0aW9ucywgbWFuaWZlc3RBY3Rpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGlhbG9nKGFjdGlvbkRlZmluaXRpb246IGFueSB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG5cdGlmIChhY3Rpb25EZWZpbml0aW9uKSB7XG5cdFx0Y29uc3QgYkNyaXRpY2FsID0gYWN0aW9uRGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uQ29tbW9uPy5Jc0FjdGlvbkNyaXRpY2FsO1xuXHRcdGlmIChhY3Rpb25EZWZpbml0aW9uLnBhcmFtZXRlcnMubGVuZ3RoID4gMSB8fCBiQ3JpdGljYWwpIHtcblx0XHRcdHJldHVybiBcIkRpYWxvZ1wiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJOb25lXCI7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIk5vbmVcIjtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VzdG9tU3ViU2VjdGlvbnMoXG5cdG1hbmlmZXN0U3ViU2VjdGlvbnM6IFJlY29yZDxzdHJpbmcsIE1hbmlmZXN0U3ViU2VjdGlvbj4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VTdWJTZWN0aW9uPiB7XG5cdGNvbnN0IHN1YlNlY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21PYmplY3RQYWdlU3ViU2VjdGlvbj4gPSB7fTtcblx0T2JqZWN0LmtleXMobWFuaWZlc3RTdWJTZWN0aW9ucykuZm9yRWFjaChcblx0XHQoc3ViU2VjdGlvbktleSkgPT5cblx0XHRcdChzdWJTZWN0aW9uc1tzdWJTZWN0aW9uS2V5XSA9IGNyZWF0ZUN1c3RvbVN1YlNlY3Rpb24obWFuaWZlc3RTdWJTZWN0aW9uc1tzdWJTZWN0aW9uS2V5XSwgc3ViU2VjdGlvbktleSwgY29udmVydGVyQ29udGV4dCkpXG5cdCk7XG5cdHJldHVybiBzdWJTZWN0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUN1c3RvbVN1YlNlY3Rpb24oXG5cdG1hbmlmZXN0U3ViU2VjdGlvbjogTWFuaWZlc3RTdWJTZWN0aW9uLFxuXHRzdWJTZWN0aW9uS2V5OiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEN1c3RvbU9iamVjdFBhZ2VTdWJTZWN0aW9uIHtcblx0Y29uc3Qgc2lkZUNvbnRlbnQ6IFNpZGVDb250ZW50RGVmIHwgdW5kZWZpbmVkID0gbWFuaWZlc3RTdWJTZWN0aW9uLnNpZGVDb250ZW50XG5cdFx0PyB7XG5cdFx0XHRcdHRlbXBsYXRlOiBtYW5pZmVzdFN1YlNlY3Rpb24uc2lkZUNvbnRlbnQudGVtcGxhdGUsXG5cdFx0XHRcdGlkOiBnZXRTaWRlQ29udGVudElEKHN1YlNlY3Rpb25LZXkpLFxuXHRcdFx0XHR2aXNpYmxlOiBmYWxzZSxcblx0XHRcdFx0ZXF1YWxTcGxpdDogbWFuaWZlc3RTdWJTZWN0aW9uLnNpZGVDb250ZW50LmVxdWFsU3BsaXRcblx0XHQgIH1cblx0XHQ6IHVuZGVmaW5lZDtcblx0bGV0IHBvc2l0aW9uID0gbWFuaWZlc3RTdWJTZWN0aW9uLnBvc2l0aW9uO1xuXHRpZiAoIXBvc2l0aW9uKSB7XG5cdFx0cG9zaXRpb24gPSB7XG5cdFx0XHRwbGFjZW1lbnQ6IFBsYWNlbWVudC5BZnRlclxuXHRcdH07XG5cdH1cblx0Y29uc3QgaXNWaXNpYmxlID0gbWFuaWZlc3RTdWJTZWN0aW9uLnZpc2libGUgIT09IHVuZGVmaW5lZCA/IG1hbmlmZXN0U3ViU2VjdGlvbi52aXNpYmxlIDogdHJ1ZTtcblx0Y29uc3QgaXNEeW5hbWljRXhwcmVzc2lvbiA9IGlzVmlzaWJsZSAmJiB0eXBlb2YgaXNWaXNpYmxlID09PSBcInN0cmluZ1wiICYmIGlzVmlzaWJsZS5pbmRleE9mKFwiez1cIikgPT09IDA7XG5cdGNvbnN0IG1hbmlmZXN0QWN0aW9ucyA9IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QobWFuaWZlc3RTdWJTZWN0aW9uLmFjdGlvbnMsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBzdWJTZWN0aW9uRGVmaW5pdGlvbiA9IHtcblx0XHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5Vbmtub3duLFxuXHRcdGlkOiBtYW5pZmVzdFN1YlNlY3Rpb24uaWQgfHwgZ2V0Q3VzdG9tU3ViU2VjdGlvbklEKHN1YlNlY3Rpb25LZXkpLFxuXHRcdGFjdGlvbnM6IG1hbmlmZXN0QWN0aW9ucy5hY3Rpb25zLFxuXHRcdGtleTogc3ViU2VjdGlvbktleSxcblx0XHR0aXRsZTogbWFuaWZlc3RTdWJTZWN0aW9uLnRpdGxlLFxuXHRcdGxldmVsOiAxLFxuXHRcdHBvc2l0aW9uOiBwb3NpdGlvbixcblx0XHR2aXNpYmxlOiBtYW5pZmVzdFN1YlNlY3Rpb24udmlzaWJsZSAhPT0gdW5kZWZpbmVkID8gbWFuaWZlc3RTdWJTZWN0aW9uLnZpc2libGUgOiB0cnVlLFxuXHRcdHNpZGVDb250ZW50OiBzaWRlQ29udGVudCxcblx0XHRpc1Zpc2liaWxpdHlEeW5hbWljOiBpc0R5bmFtaWNFeHByZXNzaW9uXG5cdH07XG5cdGlmIChtYW5pZmVzdFN1YlNlY3Rpb24udGVtcGxhdGUgfHwgbWFuaWZlc3RTdWJTZWN0aW9uLm5hbWUpIHtcblx0XHRzdWJTZWN0aW9uRGVmaW5pdGlvbi50eXBlID0gU3ViU2VjdGlvblR5cGUuWE1MRnJhZ21lbnQ7XG5cdFx0KHN1YlNlY3Rpb25EZWZpbml0aW9uIGFzIHVua25vd24gYXMgWE1MRnJhZ21lbnRTdWJTZWN0aW9uKS50ZW1wbGF0ZSA9IG1hbmlmZXN0U3ViU2VjdGlvbi50ZW1wbGF0ZSB8fCBtYW5pZmVzdFN1YlNlY3Rpb24ubmFtZSB8fCBcIlwiO1xuXHR9IGVsc2Uge1xuXHRcdHN1YlNlY3Rpb25EZWZpbml0aW9uLnR5cGUgPSBTdWJTZWN0aW9uVHlwZS5QbGFjZWhvbGRlcjtcblx0fVxuXHRyZXR1cm4gc3ViU2VjdGlvbkRlZmluaXRpb24gYXMgQ3VzdG9tT2JqZWN0UGFnZVN1YlNlY3Rpb247XG59XG5cbi8qKlxuICogRXZhbHVhdGUgaWYgdGhlIGNvbmRlbnNlZCBtb2RlIGNhbiBiZSBhcHBsaTNlZCBvbiB0aGUgdGFibGUuXG4gKlxuICogQHBhcmFtIGN1cnJlbnRGYWNldFxuICogQHBhcmFtIGZhY2V0c1RvQ3JlYXRlSW5TZWN0aW9uXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgYHRydWVgIGZvciBjb21wbGlhbnQsIGZhbHNlIG90aGVyd2lzZVxuICovXG5mdW5jdGlvbiBnZXRDb25kZW5zZWRUYWJsZUxheW91dENvbXBsaWFuY2UoXG5cdGN1cnJlbnRGYWNldDogRmFjZXRUeXBlcyxcblx0ZmFjZXRzVG9DcmVhdGVJblNlY3Rpb246IEZhY2V0VHlwZXNbXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogYm9vbGVhbiB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGlmIChtYW5pZmVzdFdyYXBwZXIudXNlSWNvblRhYkJhcigpKSB7XG5cdFx0Ly8gSWYgdGhlIE9QIHVzZSB0aGUgdGFiIGJhc2VkIHdlIGNoZWNrIGlmIHRoZSBmYWNldHMgdGhhdCB3aWxsIGJlIGNyZWF0ZWQgZm9yIHRoaXMgc2VjdGlvbiBhcmUgYWxsIG5vbiB2aXNpYmxlXG5cdFx0cmV0dXJuIGhhc05vT3RoZXJWaXNpYmxlVGFibGVJblRhcmdldHMoY3VycmVudEZhY2V0LCBmYWNldHNUb0NyZWF0ZUluU2VjdGlvbik7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRcdGlmIChlbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uRmFjZXRzPy5sZW5ndGggJiYgZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LkZhY2V0cz8ubGVuZ3RoID4gMSkge1xuXHRcdFx0cmV0dXJuIGhhc05vT3RoZXJWaXNpYmxlVGFibGVJblRhcmdldHMoY3VycmVudEZhY2V0LCBmYWNldHNUb0NyZWF0ZUluU2VjdGlvbik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBoYXNOb090aGVyVmlzaWJsZVRhYmxlSW5UYXJnZXRzKGN1cnJlbnRGYWNldDogRmFjZXRUeXBlcywgZmFjZXRzVG9DcmVhdGVJblNlY3Rpb246IEZhY2V0VHlwZXNbXSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gZmFjZXRzVG9DcmVhdGVJblNlY3Rpb24uZXZlcnkoZnVuY3Rpb24gKHN1YkZhY2V0KSB7XG5cdFx0aWYgKHN1YkZhY2V0ICE9PSBjdXJyZW50RmFjZXQpIHtcblx0XHRcdGlmIChzdWJGYWNldC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQpIHtcblx0XHRcdFx0Y29uc3QgcmVmRmFjZXQgPSBzdWJGYWNldDtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHJlZkZhY2V0LlRhcmdldD8uJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0gfHxcblx0XHRcdFx0XHRyZWZGYWNldC5UYXJnZXQ/LiR0YXJnZXQ/LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnQgfHxcblx0XHRcdFx0XHRyZWZGYWNldC5UYXJnZXQuJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVmRmFjZXQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4gIT09IHVuZGVmaW5lZCA/IHJlZkZhY2V0LmFubm90YXRpb25zPy5VST8uSGlkZGVuIDogZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzdWJDb2xsZWN0aW9uRmFjZXQgPSBzdWJGYWNldCBhcyBDb2xsZWN0aW9uRmFjZXRUeXBlcztcblx0XHRcdFx0cmV0dXJuIHN1YkNvbGxlY3Rpb25GYWNldC5GYWNldHMuZXZlcnkoZnVuY3Rpb24gKGZhY2V0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc3ViUmVmRmFjZXQgPSBmYWNldCBhcyBSZWZlcmVuY2VGYWNldFR5cGVzO1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdHN1YlJlZkZhY2V0LlRhcmdldD8uJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0gfHxcblx0XHRcdFx0XHRcdHN1YlJlZkZhY2V0LlRhcmdldD8uJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudCB8fFxuXHRcdFx0XHRcdFx0c3ViUmVmRmFjZXQuVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc3ViUmVmRmFjZXQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4gIT09IHVuZGVmaW5lZCA/IHN1YlJlZkZhY2V0LmFubm90YXRpb25zPy5VST8uSGlkZGVuIDogZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0pO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BOERZQSxjQUFjO0VBQUEsV0FBZEEsY0FBYztJQUFkQSxjQUFjO0lBQWRBLGNBQWM7SUFBZEEsY0FBYztJQUFkQSxjQUFjO0lBQWRBLGNBQWM7SUFBZEEsY0FBYztFQUFBLEdBQWRBLGNBQWMsS0FBZEEsY0FBYztFQUFBO0VBeUYxQixNQUFNQyxrQkFBNEIsR0FBRyx3TEFLcEM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNDLGlCQUFpQixDQUNoQ0MsZUFBNkIsRUFDN0JDLGdCQUFrQyxFQUNsQ0MsZUFBeUIsRUFDQTtJQUN6QjtJQUNBLE1BQU1DLGNBQWMsR0FBR0gsZUFBZSxDQUFDSSxNQUFNLENBQUMsQ0FBQ0QsY0FBNEIsRUFBRUUsZUFBZSxL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