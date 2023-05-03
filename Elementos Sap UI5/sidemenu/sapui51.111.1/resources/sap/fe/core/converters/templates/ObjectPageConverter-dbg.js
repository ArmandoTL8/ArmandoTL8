/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/objectPage/HeaderAndFooterAction", "sap/fe/core/helpers/BindingToolkit", "../controls/ObjectPage/Avatar", "../controls/ObjectPage/HeaderFacet", "../controls/ObjectPage/SubSection", "../helpers/BindingHelper", "../helpers/ConfigurableObject", "../helpers/ID", "../ManifestSettings"], function (Action, HeaderAndFooterAction, BindingToolkit, Avatar, HeaderFacet, SubSection, BindingHelper, ConfigurableObject, ID, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var TemplateType = ManifestSettings.TemplateType;
  var getSectionID = ID.getSectionID;
  var getEditableHeaderSectionID = ID.getEditableHeaderSectionID;
  var getCustomSectionID = ID.getCustomSectionID;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var UI = BindingHelper.UI;
  var SubSectionType = SubSection.SubSectionType;
  var createSubSections = SubSection.createSubSections;
  var createCustomSubSections = SubSection.createCustomSubSections;
  var createCustomHeaderFacetSubSections = SubSection.createCustomHeaderFacetSubSections;
  var getHeaderFacetsFromManifest = HeaderFacet.getHeaderFacetsFromManifest;
  var getHeaderFacetsFromAnnotations = HeaderFacet.getHeaderFacetsFromAnnotations;
  var getAvatar = Avatar.getAvatar;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var getHiddenHeaderActions = HeaderAndFooterAction.getHiddenHeaderActions;
  var getHeaderDefaultActions = HeaderAndFooterAction.getHeaderDefaultActions;
  var getFooterDefaultActions = HeaderAndFooterAction.getFooterDefaultActions;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var getActionsFromManifest = Action.getActionsFromManifest;
  const getSectionKey = (facetDefinition, fallback) => {
    var _facetDefinition$ID, _facetDefinition$Labe;
    return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
  };

  /**
   * Creates a section that represents the editable header part; it is only visible in edit mode.
   *
   * @param converterContext The converter context
   * @param allHeaderFacets The converter context
   * @returns The section representing the editable header parts
   */
  function createEditableHeaderSection(converterContext, allHeaderFacets) {
    var _converterContext$get, _converterContext$get2;
    const editableHeaderSectionID = getEditableHeaderSectionID();
    const headerFacets = (_converterContext$get = converterContext.getEntityType().annotations) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.UI) === null || _converterContext$get2 === void 0 ? void 0 : _converterContext$get2.HeaderFacets;
    const headerfacetSubSections = headerFacets ? createSubSections(headerFacets, converterContext, true) : [];
    const customHeaderFacetSubSections = createCustomHeaderFacetSubSections(converterContext);
    let allHeaderFacetsSubSections = [];
    if (customHeaderFacetSubSections.length > 0) {
      // merge annotation based header facets and custom header facets in the right order
      let i = 0;
      allHeaderFacets.forEach(function (item) {
        // hidden header facets are not included in allHeaderFacets array => add them anyway
        while (headerfacetSubSections.length > i && headerfacetSubSections[i].visible === "false") {
          allHeaderFacetsSubSections.push(headerfacetSubSections[i]);
          i++;
        }
        if (headerfacetSubSections.length > i && (item.key === headerfacetSubSections[i].key ||
        // for header facets with no id the keys of header facet and subsection are different => check only the last part
        item.key.slice(item.key.lastIndexOf("::") + 2) === headerfacetSubSections[i].key.slice(headerfacetSubSections[i].key.lastIndexOf("::") + 2))) {
          allHeaderFacetsSubSections.push(headerfacetSubSections[i]);
          i++;
        } else {
          customHeaderFacetSubSections.forEach(function (customItem) {
            if (item.key === customItem.key) {
              allHeaderFacetsSubSections.push(customItem);
            }
          });
        }
      });
    } else {
      allHeaderFacetsSubSections = headerfacetSubSections;
    }
    const headerSection = {
      id: editableHeaderSectionID,
      key: "EditableHeaderContent",
      title: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_HEADER_SECTION}",
      visible: compileExpression(UI.IsEditable),
      subSections: allHeaderFacetsSubSections
    };
    return headerSection;
  }

  /**
   * Creates a definition for a section based on the Facet annotation.
   *
   * @param converterContext The converter context
   * @returns All sections
   */
  _exports.createEditableHeaderSection = createEditableHeaderSection;
  function getSectionsFromAnnotation(converterContext) {
    var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3;
    const entityType = converterContext.getEntityType();
    const objectPageSections = ((_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.Facets) === null || _entityType$annotatio3 === void 0 ? void 0 : _entityType$annotatio3.map(facetDefinition => getSectionFromAnnotation(facetDefinition, converterContext))) || [];
    return objectPageSections;
  }

  /**
   * Create an annotation based section.
   *
   * @param facet
   * @param converterContext
   * @returns The current section
   */
  function getSectionFromAnnotation(facet, converterContext) {
    var _facet$annotations, _facet$annotations$UI, _facet$annotations$UI2;
    const sectionID = getSectionID(facet);
    const section = {
      id: sectionID,
      key: getSectionKey(facet, sectionID),
      title: compileExpression(getExpressionFromAnnotation(facet.Label)),
      showTitle: !!facet.Label,
      visible: compileExpression(not(equal(getExpressionFromAnnotation((_facet$annotations = facet.annotations) === null || _facet$annotations === void 0 ? void 0 : (_facet$annotations$UI = _facet$annotations.UI) === null || _facet$annotations$UI === void 0 ? void 0 : (_facet$annotations$UI2 = _facet$annotations$UI.Hidden) === null || _facet$annotations$UI2 === void 0 ? void 0 : _facet$annotations$UI2.valueOf()), true))),
      subSections: createSubSections([facet], converterContext)
    };
    return section;
  }

  /**
   * Creates section definitions based on the manifest definitions.
   *
   * @param manifestSections The sections defined in the manifest
   * @param converterContext
   * @returns The sections defined in the manifest
   */
  function getSectionsFromManifest(manifestSections, converterContext) {
    const sections = {};
    Object.keys(manifestSections).forEach(manifestSectionKey => {
      sections[manifestSectionKey] = getSectionFromManifest(manifestSections[manifestSectionKey], manifestSectionKey, converterContext);
    });
    return sections;
  }

  /**
   * Create a manifest-based custom section.
   *
   * @param customSectionDefinition
   * @param sectionKey
   * @param converterContext
   * @returns The current custom section
   */
  function getSectionFromManifest(customSectionDefinition, sectionKey, converterContext) {
    const customSectionID = customSectionDefinition.id || getCustomSectionID(sectionKey);
    let position = customSectionDefinition.position;
    if (!position) {
      position = {
        placement: Placement.After
      };
    }
    let manifestSubSections;
    if (!customSectionDefinition.subSections) {
      // If there is no subSection defined, we add the content of the custom section as subsections
      // and make sure to set the visibility to 'true', as the actual visibility is handled by the section itself
      manifestSubSections = {
        [sectionKey]: {
          ...customSectionDefinition,
          position: undefined,
          visible: "true"
        }
      };
    } else {
      manifestSubSections = customSectionDefinition.subSections;
    }
    const subSections = createCustomSubSections(manifestSubSections, converterContext);
    const customSection = {
      id: customSectionID,
      key: sectionKey,
      title: customSectionDefinition.title,
      showTitle: !!customSectionDefinition.title,
      visible: customSectionDefinition.visible !== undefined ? customSectionDefinition.visible : "true",
      position: position,
      subSections: subSections
    };
    return customSection;
  }

  /**
   * Retrieves the ObjectPage header actions (both the default ones and the custom ones defined in the manifest).
   *
   * @param converterContext The converter context
   * @returns An array containing all the actions for this ObjectPage header
   */
  const getHeaderActions = function (converterContext) {
    const aAnnotationHeaderActions = getHeaderDefaultActions(converterContext);
    const manifestWrapper = converterContext.getManifestWrapper();
    const manifestActions = getActionsFromManifest(manifestWrapper.getHeaderActions(), converterContext, aAnnotationHeaderActions, undefined, undefined, getHiddenHeaderActions(converterContext));
    const actionOverwriteConfig = {
      isNavigable: OverrideType.overwrite,
      enabled: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      defaultValuesExtensionFunction: OverrideType.overwrite,
      command: OverrideType.overwrite
    };
    const headerActions = insertCustomElements(aAnnotationHeaderActions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions: removeDuplicateActions(headerActions),
      commandActions: manifestActions.commandActions
    };
  };

  /**
   * Retrieves the ObjectPage footer actions (both the default ones and the custom ones defined in the manifest).
   *
   * @param converterContext The converter context
   * @returns An array containing all the actions for this ObjectPage footer
   */
  _exports.getHeaderActions = getHeaderActions;
  const getFooterActions = function (converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    const aAnnotationFooterActions = getFooterDefaultActions(manifestWrapper.getViewLevel(), converterContext);
    const manifestActions = getActionsFromManifest(manifestWrapper.getFooterActions(), converterContext, aAnnotationFooterActions);
    const actionOverwriteConfig = {
      isNavigable: OverrideType.overwrite,
      enabled: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      defaultValuesExtensionFunction: OverrideType.overwrite,
      command: OverrideType.overwrite
    };
    const footerActions = insertCustomElements(aAnnotationFooterActions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions: footerActions,
      commandActions: manifestActions.commandActions
    };
  };
  _exports.getFooterActions = getFooterActions;
  function _getSubSectionVisualization(subSection) {
    var _subSection$presentat;
    return subSection !== null && subSection !== void 0 && (_subSection$presentat = subSection.presentation) !== null && _subSection$presentat !== void 0 && _subSection$presentat.visualizations[0] ? subSection.presentation.visualizations[0] : undefined;
  }
  function _isFacetHasGridTableVisible(dataVisualizationSubSection, subSectionVisualization) {
    var _dataVisualizationSub, _subSectionVisualizat;
    return dataVisualizationSubSection.visible === "true" && (dataVisualizationSubSection === null || dataVisualizationSubSection === void 0 ? void 0 : (_dataVisualizationSub = dataVisualizationSubSection.presentation) === null || _dataVisualizationSub === void 0 ? void 0 : _dataVisualizationSub.visualizations) && (subSectionVisualization === null || subSectionVisualization === void 0 ? void 0 : subSectionVisualization.type) === "Table" && (subSectionVisualization === null || subSectionVisualization === void 0 ? void 0 : (_subSectionVisualizat = subSectionVisualization.control) === null || _subSectionVisualizat === void 0 ? void 0 : _subSectionVisualizat.type) === "GridTable";
  }
  function _setGridTableVisualizationInformation(sections, dataVisualizationSubSection, subSectionVisualization, sectionLayout) {
    if (_isFacetHasGridTableVisible(dataVisualizationSubSection, subSectionVisualization)) {
      const tableControlConfiguration = subSectionVisualization.control;
      if (!(sectionLayout === "Page" && sections.length > 1)) {
        tableControlConfiguration.rowCountMode = "Auto";
      }
      if (sectionLayout !== "Tabs") {
        tableControlConfiguration.useCondensedTableLayout = false;
      }
    }
  }
  function _setGridTableWithMixFacetsInformation(subSection, sectionLayout) {
    var _subSection$content;
    if ((subSection === null || subSection === void 0 ? void 0 : (_subSection$content = subSection.content) === null || _subSection$content === void 0 ? void 0 : _subSection$content.length) === 1) {
      var _presentation;
      const tableControl = ((_presentation = subSection.content[0].presentation) === null || _presentation === void 0 ? void 0 : _presentation.visualizations[0]).control;
      if (tableControl.type === "GridTable") {
        tableControl.rowCountMode = "Auto";
        if (sectionLayout !== "Tabs") {
          tableControl.useCondensedTableLayout = false;
        }
      }
    }
  }

  /**
   * Set the GridTable display information.
   *
   * @param sections The ObjectPage sections
   * @param section The current ObjectPage section processed
   * @param sectionLayout
   */
  function _setGridTableSubSectionControlConfiguration(sections, section, sectionLayout) {
    let dataVisualizationSubSection;
    let subSectionVisualization;
    const subSections = section.subSections;
    if (subSections.length === 1) {
      dataVisualizationSubSection = subSections[0];
      switch (subSections[0].type) {
        case "DataVisualization":
          subSectionVisualization = _getSubSectionVisualization(dataVisualizationSubSection);
          _setGridTableVisualizationInformation(sections, dataVisualizationSubSection, subSectionVisualization, sectionLayout);
          break;
        case "Mixed":
          _setGridTableWithMixFacetsInformation(dataVisualizationSubSection, sectionLayout);
          break;
        default:
          break;
      }
      return;
    }
    _removeCondensedFromSubSections(subSections);
  }

  /**
   * Remove the condense layout mode from the subsections.
   *
   * @param subSections The subSections where we need to remove the condensed layout
   */
  function _removeCondensedFromSubSections(subSections) {
    let dataVisualizationSubSection;
    // We check in each subsection if there is visualizations
    subSections.forEach(subSection => {
      var _dataVisualizationSub2, _dataVisualizationSub3, _dataVisualizationSub6;
      dataVisualizationSubSection = subSection;
      if ((_dataVisualizationSub2 = dataVisualizationSubSection) !== null && _dataVisualizationSub2 !== void 0 && (_dataVisualizationSub3 = _dataVisualizationSub2.presentation) !== null && _dataVisualizationSub3 !== void 0 && _dataVisualizationSub3.visualizations) {
        var _dataVisualizationSub4, _dataVisualizationSub5;
        (_dataVisualizationSub4 = dataVisualizationSubSection) === null || _dataVisualizationSub4 === void 0 ? void 0 : (_dataVisualizationSub5 = _dataVisualizationSub4.presentation) === null || _dataVisualizationSub5 === void 0 ? void 0 : _dataVisualizationSub5.visualizations.forEach(singleVisualization => {
          if (singleVisualization.type === VisualizationType.Table) {
            singleVisualization.control.useCondensedTableLayout = false;
          }
        });
      }
      // Then we check the content of the subsection, and in each content we check if there is a table to set its condensed layout to false
      if ((_dataVisualizationSub6 = dataVisualizationSubSection) !== null && _dataVisualizationSub6 !== void 0 && _dataVisualizationSub6.content) {
        dataVisualizationSubSection.content.forEach(singleContent => {
          var _presentation2;
          (_presentation2 = singleContent.presentation) === null || _presentation2 === void 0 ? void 0 : _presentation2.visualizations.forEach(singleVisualization => {
            if (singleVisualization.type === VisualizationType.Table) {
              singleVisualization.control.useCondensedTableLayout = false;
            }
          });
        });
      }
    });
  }
  /**
   * Retrieves and merges the ObjectPage sections defined in the annotation and in the manifest.
   *
   * @param converterContext The converter context
   * @returns An array of sections.
   */

  const getSections = function (converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    const sections = insertCustomElements(getSectionsFromAnnotation(converterContext), getSectionsFromManifest(manifestWrapper.getSections(), converterContext), {
      title: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      subSections: {
        actions: OverrideType.merge,
        title: OverrideType.overwrite,
        sideContent: OverrideType.overwrite
      }
    });
    // Level Adjustment for "Mixed" Collection Facets:
    // ==============================================
    // The manifest definition of custom side contents and actions still needs to be aligned for "Mixed" collection facets:
    // Collection facets containing tables gain an extra reference facet as a table wrapper to ensure, that the table is always
    // placed in an own individual Object Page Block; this additional hierarchy level is unknown to app developers, which are
    // defining the side content and actions in the manifest at collection facet level; now, since the sideContent always needs
    // to be assigned to a block, and actions always need to be assigned to a form,
    // we need to move the sideContent and actions from a mixed collection facet to its content.
    // ==============================================
    sections.forEach(function (section) {
      var _section$subSections;
      _setGridTableSubSectionControlConfiguration(sections, section, manifestWrapper.getSectionLayout());
      (_section$subSections = section.subSections) === null || _section$subSections === void 0 ? void 0 : _section$subSections.forEach(function (subSection) {
        var _subSection$content2;
        subSection.title = subSection.title === "undefined" ? undefined : subSection.title;
        if (subSection.type === "Mixed" && (_subSection$content2 = subSection.content) !== null && _subSection$content2 !== void 0 && _subSection$content2.length) {
          var _actions;
          const firstForm = subSection.content.find(element => element.type === SubSectionType.Form);

          // 1. Copy sideContent to the SubSection's first form; or -- if unavailable -- to its first content
          // 2. Copy actions to the first form of the SubSection's content
          // 3. Delete sideContent / actions at the (invalid) manifest level

          if (subSection.sideContent) {
            if (firstForm) {
              // If there is a form, it always needs to be attached to the form, as the form inherits the ID of the SubSection
              firstForm.sideContent = subSection.sideContent;
            } else {
              subSection.content[0].sideContent = subSection.sideContent;
            }
            subSection.sideContent = undefined;
          }
          if (firstForm && (_actions = subSection.actions) !== null && _actions !== void 0 && _actions.length) {
            firstForm.actions = subSection.actions;
            subSection.actions = [];
          }
        }
      });
    });
    return sections;
  };

  /**
   * Determines if the ObjectPage has header content.
   *
   * @param converterContext The instance of the converter context
   * @returns `true` if there is at least on header facet
   */
  _exports.getSections = getSections;
  function hasHeaderContent(converterContext) {
    var _converterContext$get3, _converterContext$get4;
    const manifestWrapper = converterContext.getManifestWrapper();
    return (((_converterContext$get3 = converterContext.getEntityType().annotations) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.UI) === null || _converterContext$get4 === void 0 ? void 0 : _converterContext$get4.HeaderFacets) || []).length > 0 || Object.keys(manifestWrapper.getHeaderFacets()).length > 0;
  }

  /**
   * Gets the expression to evaluate the visibility of the header content.
   *
   * @param converterContext The instance of the converter context
   * @returns The binding expression for the Delete button
   */
  function getShowHeaderContentExpression(converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    return ifElse(!hasHeaderContent(converterContext), constant(false), ifElse(equal(manifestWrapper.isHeaderEditable(), false), constant(true), not(UI.IsEditable)));
  }

  /**
   * Gets the binding expression to evaluate the visibility of the header content.
   *
   * @param converterContext The instance of the converter context
   * @returns The binding expression for the Delete button
   */
  const getShowHeaderContent = function (converterContext) {
    return compileExpression(getShowHeaderContentExpression(converterContext));
  };

  /**
   * Gets the binding expression to evaluate the visibility of the avatar when the header is in expanded state.
   *
   * @param converterContext The instance of the converter context
   * @returns The binding expression for the Delete button
   */
  _exports.getShowHeaderContent = getShowHeaderContent;
  const getExpandedImageVisible = function (converterContext) {
    return compileExpression(not(getShowHeaderContentExpression(converterContext)));
  };
  _exports.getExpandedImageVisible = getExpandedImageVisible;
  const convertPage = function (converterContext) {
    var _entityType$annotatio4, _entityType$annotatio5;
    const manifestWrapper = converterContext.getManifestWrapper();
    let headerSection;
    const entityType = converterContext.getEntityType();

    // Retrieve all header facets (from annotations & custom)
    const headerFacets = insertCustomElements(getHeaderFacetsFromAnnotations(converterContext), getHeaderFacetsFromManifest(manifestWrapper.getHeaderFacets()));

    // Retrieve the page header actions
    const headerActions = getHeaderActions(converterContext);

    // Retrieve the page footer actions
    const footerActions = getFooterActions(converterContext);
    if (manifestWrapper.isHeaderEditable() && ((_entityType$annotatio4 = entityType.annotations.UI) !== null && _entityType$annotatio4 !== void 0 && _entityType$annotatio4.HeaderFacets || (_entityType$annotatio5 = entityType.annotations.UI) !== null && _entityType$annotatio5 !== void 0 && _entityType$annotatio5.HeaderInfo)) {
      headerSection = createEditableHeaderSection(converterContext, headerFacets);
    }
    const sections = getSections(converterContext);
    return {
      template: TemplateType.ObjectPage,
      header: {
        visible: manifestWrapper.getShowObjectPageHeader(),
        section: headerSection,
        facets: headerFacets,
        actions: headerActions.actions,
        showContent: getShowHeaderContent(converterContext),
        hasContent: hasHeaderContent(converterContext),
        avatar: getAvatar(converterContext),
        title: {
          expandedImageVisible: getExpandedImageVisible(converterContext)
        }
      },
      sections: sections,
      footerActions: footerActions.actions,
      headerCommandActions: headerActions.commandActions,
      footerCommandActions: footerActions.commandActions,
      showAnchorBar: manifestWrapper.getShowAnchorBar(),
      useIconTabBar: manifestWrapper.useIconTabBar()
    };
  };
  _exports.convertPage = convertPage;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRTZWN0aW9uS2V5IiwiZmFjZXREZWZpbml0aW9uIiwiZmFsbGJhY2siLCJJRCIsInRvU3RyaW5nIiwiTGFiZWwiLCJjcmVhdGVFZGl0YWJsZUhlYWRlclNlY3Rpb24iLCJjb252ZXJ0ZXJDb250ZXh0IiwiYWxsSGVhZGVyRmFjZXRzIiwiZWRpdGFibGVIZWFkZXJTZWN0aW9uSUQiLCJnZXRFZGl0YWJsZUhlYWRlclNlY3Rpb25JRCIsImhlYWRlckZhY2V0cyIsImdldEVudGl0eVR5cGUiLCJhbm5vdGF0aW9ucyIsIlVJIiwiSGVhZGVyRmFjZXRzIiwiaGVhZGVyZmFjZXRTdWJTZWN0aW9ucyIsImNyZWF0ZVN1YlNlY3Rpb25zIiwiY3VzdG9tSGVhZGVyRmFjZXRTdWJTZWN0aW9ucyIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbnMiLCJhbGxIZWFkZXJGYWNldHNTdWJTZWN0aW9ucyIsImxlbmd0aCIsImkiLCJmb3JFYWNoIiwiaXRlbSIsInZpc2libGUiLCJwdXNoIiwia2V5Iiwic2xpY2UiLCJsYXN0SW5kZXhPZiIsImN1c3RvbUl0ZW0iLCJoZWFkZXJTZWN0aW9uIiwiaWQiLCJ0aXRsZSIsImNvbXBpbGVFeHByZXNzaW9uIiwiSXNFZGl0YWJsZSIsInN1YlNlY3Rpb25zIiwiZ2V0U2VjdGlvbnNGcm9tQW5ub3RhdGlvbiIsImVudGl0eVR5cGUiLCJvYmplY3RQYWdlU2VjdGlvbnMiLCJGYWNldHMiLCJtYXAiLCJnZXRTZWN0aW9uRnJvbUFubm90YXRpb24iLCJmYWNldCIsInNlY3Rpb25JRCIsImdldFNlY3Rpb25JRCIsInNlY3Rpb24iLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJzaG93VGl0bGUiLCJub3QiLCJlcXVhbCIsIkhpZGRlbiIsInZhbHVlT2YiLCJnZXRTZWN0aW9uc0Zyb21NYW5pZmVzdCIsIm1hbmlmZXN0U2VjdGlvbnMiLCJzZWN0aW9ucyIsIk9iamVjdCIsImtleXMiLCJtYW5pZmVzdFNlY3Rpb25LZXkiLCJnZXRTZWN0aW9uRnJvbU1hbmlmZXN0IiwiY3VzdG9tU2VjdGlvbkRlZmluaXRpb24iLCJzZWN0aW9uS2V5IiwiY3VzdG9tU2VjdGlvbklEIiwiZ2V0Q3VzdG9tU2VjdGlvbklEIiwicG9zaXRpb24iLCJwbGFjZW1lbnQiLCJQbGFjZW1lbnQiLCJBZnRlciIsIm1hbmlmZXN0U3ViU2VjdGlvbnMiLCJ1bmRlZmluZWQiLCJjcmVhdGVDdXN0b21TdWJTZWN0aW9ucyIsImN1c3RvbVNlY3Rpb24iLCJnZXRIZWFkZXJBY3Rpb25zIiwiYUFubm90YXRpb25IZWFkZXJBY3Rpb25zIiwiZ2V0SGVhZGVyRGVmYXVsdEFjdGlvbnMiLCJtYW5pZmVzdFdyYXBwZXIiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJtYW5pZmVzdEFjdGlvbnMiLCJnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IiwiZ2V0SGlkZGVuSGVhZGVyQWN0aW9ucyIsImFjdGlvbk92ZXJ3cml0ZUNvbmZpZyIsImlzTmF2aWdhYmxlIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiZW5hYmxlZCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsImNvbW1hbmQiLCJoZWFkZXJBY3Rpb25zIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJhY3Rpb25zIiwicmVtb3ZlRHVwbGljYXRlQWN0aW9ucyIsImNvbW1hbmRBY3Rpb25zIiwiZ2V0Rm9vdGVyQWN0aW9ucyIsImFBbm5vdGF0aW9uRm9vdGVyQWN0aW9ucyIsImdldEZvb3RlckRlZmF1bHRBY3Rpb25zIiwiZ2V0Vmlld0xldmVsIiwiZm9vdGVyQWN0aW9ucyIsIl9nZXRTdWJTZWN0aW9uVmlzdWFsaXphdGlvbiIsInN1YlNlY3Rpb24iLCJwcmVzZW50YXRpb24iLCJ2aXN1YWxpemF0aW9ucyIsIl9pc0ZhY2V0SGFzR3JpZFRhYmxlVmlzaWJsZSIsImRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiIsInN1YlNlY3Rpb25WaXN1YWxpemF0aW9uIiwidHlwZSIsImNvbnRyb2wiLCJfc2V0R3JpZFRhYmxlVmlzdWFsaXphdGlvbkluZm9ybWF0aW9uIiwic2VjdGlvbkxheW91dCIsInRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24iLCJyb3dDb3VudE1vZGUiLCJ1c2VDb25kZW5zZWRUYWJsZUxheW91dCIsIl9zZXRHcmlkVGFibGVXaXRoTWl4RmFjZXRzSW5mb3JtYXRpb24iLCJjb250ZW50IiwidGFibGVDb250cm9sIiwiX3NldEdyaWRUYWJsZVN1YlNlY3Rpb25Db250cm9sQ29uZmlndXJhdGlvbiIsIl9yZW1vdmVDb25kZW5zZWRGcm9tU3ViU2VjdGlvbnMiLCJzaW5nbGVWaXN1YWxpemF0aW9uIiwiVmlzdWFsaXphdGlvblR5cGUiLCJUYWJsZSIsInNpbmdsZUNvbnRlbnQiLCJnZXRTZWN0aW9ucyIsIm1lcmdlIiwic2lkZUNvbnRlbnQiLCJnZXRTZWN0aW9uTGF5b3V0IiwiZmlyc3RGb3JtIiwiZmluZCIsImVsZW1lbnQiLCJTdWJTZWN0aW9uVHlwZSIsIkZvcm0iLCJoYXNIZWFkZXJDb250ZW50IiwiZ2V0SGVhZGVyRmFjZXRzIiwiZ2V0U2hvd0hlYWRlckNvbnRlbnRFeHByZXNzaW9uIiwiaWZFbHNlIiwiY29uc3RhbnQiLCJpc0hlYWRlckVkaXRhYmxlIiwiZ2V0U2hvd0hlYWRlckNvbnRlbnQiLCJnZXRFeHBhbmRlZEltYWdlVmlzaWJsZSIsImNvbnZlcnRQYWdlIiwiZ2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zIiwiZ2V0SGVhZGVyRmFjZXRzRnJvbU1hbmlmZXN0IiwiSGVhZGVySW5mbyIsInRlbXBsYXRlIiwiVGVtcGxhdGVUeXBlIiwiT2JqZWN0UGFnZSIsImhlYWRlciIsImdldFNob3dPYmplY3RQYWdlSGVhZGVyIiwiZmFjZXRzIiwic2hvd0NvbnRlbnQiLCJoYXNDb250ZW50IiwiYXZhdGFyIiwiZ2V0QXZhdGFyIiwiZXhwYW5kZWRJbWFnZVZpc2libGUiLCJoZWFkZXJDb21tYW5kQWN0aW9ucyIsImZvb3RlckNvbW1hbmRBY3Rpb25zIiwic2hvd0FuY2hvckJhciIsImdldFNob3dBbmNob3JCYXIiLCJ1c2VJY29uVGFiQmFyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJPYmplY3RQYWdlQ29udmVydGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5VHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBGYWNldFR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgeyBCYXNlQWN0aW9uLCBDb21iaW5lZEFjdGlvbiwgQ3VzdG9tQWN0aW9uLCBPdmVycmlkZVR5cGVBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0LCByZW1vdmVEdXBsaWNhdGVBY3Rpb25zIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uLCBUYWJsZVZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7XG5cdGdldEZvb3RlckRlZmF1bHRBY3Rpb25zLFxuXHRnZXRIZWFkZXJEZWZhdWx0QWN0aW9ucyxcblx0Z2V0SGlkZGVuSGVhZGVyQWN0aW9uc1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9vYmplY3RQYWdlL0hlYWRlckFuZEZvb3RlckFjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBjb25zdGFudCwgZXF1YWwsIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiwgaWZFbHNlLCBub3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBBdmF0YXIgfSBmcm9tIFwiLi4vY29udHJvbHMvT2JqZWN0UGFnZS9BdmF0YXJcIjtcbmltcG9ydCB7IGdldEF2YXRhciB9IGZyb20gXCIuLi9jb250cm9scy9PYmplY3RQYWdlL0F2YXRhclwiO1xuaW1wb3J0IHR5cGUgeyBPYmplY3RQYWdlSGVhZGVyRmFjZXQgfSBmcm9tIFwiLi4vY29udHJvbHMvT2JqZWN0UGFnZS9IZWFkZXJGYWNldFwiO1xuaW1wb3J0IHsgZ2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zLCBnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QgfSBmcm9tIFwiLi4vY29udHJvbHMvT2JqZWN0UGFnZS9IZWFkZXJGYWNldFwiO1xuaW1wb3J0IHR5cGUge1xuXHRDdXN0b21PYmplY3RQYWdlU2VjdGlvbixcblx0RGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uLFxuXHRGb3JtU3ViU2VjdGlvbixcblx0T2JqZWN0UGFnZVNlY3Rpb24sXG5cdE9iamVjdFBhZ2VTdWJTZWN0aW9uXG59IGZyb20gXCIuLi9jb250cm9scy9PYmplY3RQYWdlL1N1YlNlY3Rpb25cIjtcbmltcG9ydCB7XG5cdGNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbnMsXG5cdGNyZWF0ZUN1c3RvbVN1YlNlY3Rpb25zLFxuXHRjcmVhdGVTdWJTZWN0aW9ucyxcblx0U3ViU2VjdGlvblR5cGVcbn0gZnJvbSBcIi4uL2NvbnRyb2xzL09iamVjdFBhZ2UvU3ViU2VjdGlvblwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi4vaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZVJlY29yZCwgUG9zaXRpb24gfSBmcm9tIFwiLi4vaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzLCBPdmVycmlkZVR5cGUsIFBsYWNlbWVudCB9IGZyb20gXCIuLi9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgZ2V0Q3VzdG9tU2VjdGlvbklELCBnZXRFZGl0YWJsZUhlYWRlclNlY3Rpb25JRCwgZ2V0U2VjdGlvbklEIH0gZnJvbSBcIi4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB0eXBlIHsgTWFuaWZlc3RTZWN0aW9uLCBNYW5pZmVzdFN1YlNlY3Rpb24gfSBmcm9tIFwiLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgVGVtcGxhdGVUeXBlLCBWaXN1YWxpemF0aW9uVHlwZSB9IGZyb20gXCIuLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgdHlwZSB7IFBhZ2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL1RlbXBsYXRlQ29udmVydGVyXCI7XG5cbmV4cG9ydCB0eXBlIE9iamVjdFBhZ2VEZWZpbml0aW9uID0gUGFnZURlZmluaXRpb24gJiB7XG5cdGhlYWRlcjoge1xuXHRcdHZpc2libGU6IGJvb2xlYW47XG5cdFx0c2VjdGlvbj86IE9iamVjdFBhZ2VTZWN0aW9uO1xuXHRcdGZhY2V0czogT2JqZWN0UGFnZUhlYWRlckZhY2V0W107XG5cdFx0YWN0aW9uczogQmFzZUFjdGlvbltdO1xuXHRcdHNob3dDb250ZW50OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0XHRoYXNDb250ZW50OiBib29sZWFuO1xuXHRcdGF2YXRhcj86IEF2YXRhcjtcblx0XHR0aXRsZToge1xuXHRcdFx0ZXhwYW5kZWRJbWFnZVZpc2libGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRcdH07XG5cdH07XG5cdHNlY3Rpb25zOiBPYmplY3RQYWdlU2VjdGlvbltdO1xuXHRmb290ZXJBY3Rpb25zOiBCYXNlQWN0aW9uW107XG5cdGhlYWRlckNvbW1hbmRBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+O1xuXHRmb290ZXJDb21tYW5kQWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPjtcblx0c2hvd0FuY2hvckJhcjogYm9vbGVhbjtcblx0dXNlSWNvblRhYkJhcjogYm9vbGVhbjtcbn07XG5cbmNvbnN0IGdldFNlY3Rpb25LZXkgPSAoZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLCBmYWxsYmFjazogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0cmV0dXJuIGZhY2V0RGVmaW5pdGlvbi5JRD8udG9TdHJpbmcoKSB8fCBmYWNldERlZmluaXRpb24uTGFiZWw/LnRvU3RyaW5nKCkgfHwgZmFsbGJhY2s7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzZWN0aW9uIHRoYXQgcmVwcmVzZW50cyB0aGUgZWRpdGFibGUgaGVhZGVyIHBhcnQ7IGl0IGlzIG9ubHkgdmlzaWJsZSBpbiBlZGl0IG1vZGUuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gYWxsSGVhZGVyRmFjZXRzIFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIHNlY3Rpb24gcmVwcmVzZW50aW5nIHRoZSBlZGl0YWJsZSBoZWFkZXIgcGFydHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVkaXRhYmxlSGVhZGVyU2VjdGlvbihcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0YWxsSGVhZGVyRmFjZXRzOiBPYmplY3RQYWdlSGVhZGVyRmFjZXRbXVxuKTogT2JqZWN0UGFnZVNlY3Rpb24ge1xuXHRjb25zdCBlZGl0YWJsZUhlYWRlclNlY3Rpb25JRCA9IGdldEVkaXRhYmxlSGVhZGVyU2VjdGlvbklEKCk7XG5cdGNvbnN0IGhlYWRlckZhY2V0cyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLmFubm90YXRpb25zPy5VST8uSGVhZGVyRmFjZXRzO1xuXHRjb25zdCBoZWFkZXJmYWNldFN1YlNlY3Rpb25zID0gaGVhZGVyRmFjZXRzID8gY3JlYXRlU3ViU2VjdGlvbnMoaGVhZGVyRmFjZXRzLCBjb252ZXJ0ZXJDb250ZXh0LCB0cnVlKSA6IFtdO1xuXHRjb25zdCBjdXN0b21IZWFkZXJGYWNldFN1YlNlY3Rpb25zID0gY3JlYXRlQ3VzdG9tSGVhZGVyRmFjZXRTdWJTZWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0bGV0IGFsbEhlYWRlckZhY2V0c1N1YlNlY3Rpb25zOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdID0gW107XG5cdGlmIChjdXN0b21IZWFkZXJGYWNldFN1YlNlY3Rpb25zLmxlbmd0aCA+IDApIHtcblx0XHQvLyBtZXJnZSBhbm5vdGF0aW9uIGJhc2VkIGhlYWRlciBmYWNldHMgYW5kIGN1c3RvbSBoZWFkZXIgZmFjZXRzIGluIHRoZSByaWdodCBvcmRlclxuXHRcdGxldCBpID0gMDtcblx0XHRhbGxIZWFkZXJGYWNldHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0Ly8gaGlkZGVuIGhlYWRlciBmYWNldHMgYXJlIG5vdCBpbmNsdWRlZCBpbiBhbGxIZWFkZXJGYWNldHMgYXJyYXkgPT4gYWRkIHRoZW0gYW55d2F5XG5cdFx0XHR3aGlsZSAoaGVhZGVyZmFjZXRTdWJTZWN0aW9ucy5sZW5ndGggPiBpICYmIGhlYWRlcmZhY2V0U3ViU2VjdGlvbnNbaV0udmlzaWJsZSA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRcdGFsbEhlYWRlckZhY2V0c1N1YlNlY3Rpb25zLnB1c2goaGVhZGVyZmFjZXRTdWJTZWN0aW9uc1tpXSk7XG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHRcdGlmIChcblx0XHRcdFx0aGVhZGVyZmFjZXRTdWJTZWN0aW9ucy5sZW5ndGggPiBpICYmXG5cdFx0XHRcdChpdGVtLmtleSA9PT0gaGVhZGVyZmFjZXRTdWJTZWN0aW9uc1tpXS5rZXkgfHxcblx0XHRcdFx0XHQvLyBmb3IgaGVhZGVyIGZhY2V0cyB3aXRoIG5vIGlkIHRoZSBrZXlzIG9mIGhlYWRlciBmYWNldCBhbmQgc3Vic2VjdGlvbiBhcmUgZGlmZmVyZW50ID0+IGNoZWNrIG9ubHkgdGhlIGxhc3QgcGFydFxuXHRcdFx0XHRcdGl0ZW0ua2V5LnNsaWNlKGl0ZW0ua2V5Lmxhc3RJbmRleE9mKFwiOjpcIikgKyAyKSA9PT1cblx0XHRcdFx0XHRcdGhlYWRlcmZhY2V0U3ViU2VjdGlvbnNbaV0ua2V5LnNsaWNlKGhlYWRlcmZhY2V0U3ViU2VjdGlvbnNbaV0ua2V5Lmxhc3RJbmRleE9mKFwiOjpcIikgKyAyKSlcblx0XHRcdCkge1xuXHRcdFx0XHRhbGxIZWFkZXJGYWNldHNTdWJTZWN0aW9ucy5wdXNoKGhlYWRlcmZhY2V0U3ViU2VjdGlvbnNbaV0pO1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXN0b21IZWFkZXJGYWNldFN1YlNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGN1c3RvbUl0ZW0pIHtcblx0XHRcdFx0XHRpZiAoaXRlbS5rZXkgPT09IGN1c3RvbUl0ZW0ua2V5KSB7XG5cdFx0XHRcdFx0XHRhbGxIZWFkZXJGYWNldHNTdWJTZWN0aW9ucy5wdXNoKGN1c3RvbUl0ZW0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0YWxsSGVhZGVyRmFjZXRzU3ViU2VjdGlvbnMgPSBoZWFkZXJmYWNldFN1YlNlY3Rpb25zO1xuXHR9XG5cdGNvbnN0IGhlYWRlclNlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uID0ge1xuXHRcdGlkOiBlZGl0YWJsZUhlYWRlclNlY3Rpb25JRCxcblx0XHRrZXk6IFwiRWRpdGFibGVIZWFkZXJDb250ZW50XCIsXG5cdFx0dGl0bGU6IFwie3NhcC5mZS5pMThuPlRfQ09NTU9OX09CSkVDVF9QQUdFX0hFQURFUl9TRUNUSU9OfVwiLFxuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKFVJLklzRWRpdGFibGUpLFxuXHRcdHN1YlNlY3Rpb25zOiBhbGxIZWFkZXJGYWNldHNTdWJTZWN0aW9uc1xuXHR9O1xuXHRyZXR1cm4gaGVhZGVyU2VjdGlvbjtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVmaW5pdGlvbiBmb3IgYSBzZWN0aW9uIGJhc2VkIG9uIHRoZSBGYWNldCBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgQWxsIHNlY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldFNlY3Rpb25zRnJvbUFubm90YXRpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IE9iamVjdFBhZ2VTZWN0aW9uW10ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IG9iamVjdFBhZ2VTZWN0aW9uczogT2JqZWN0UGFnZVNlY3Rpb25bXSA9XG5cdFx0ZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LkZhY2V0cz8ubWFwKChmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMpID0+XG5cdFx0XHRnZXRTZWN0aW9uRnJvbUFubm90YXRpb24oZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdCkgfHwgW107XG5cdHJldHVybiBvYmplY3RQYWdlU2VjdGlvbnM7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIGFubm90YXRpb24gYmFzZWQgc2VjdGlvbi5cbiAqXG4gKiBAcGFyYW0gZmFjZXRcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY3VycmVudCBzZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldFNlY3Rpb25Gcm9tQW5ub3RhdGlvbihmYWNldDogRmFjZXRUeXBlcywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IE9iamVjdFBhZ2VTZWN0aW9uIHtcblx0Y29uc3Qgc2VjdGlvbklEID0gZ2V0U2VjdGlvbklEKGZhY2V0KTtcblx0Y29uc3Qgc2VjdGlvbjogT2JqZWN0UGFnZVNlY3Rpb24gPSB7XG5cdFx0aWQ6IHNlY3Rpb25JRCxcblx0XHRrZXk6IGdldFNlY3Rpb25LZXkoZmFjZXQsIHNlY3Rpb25JRCksXG5cdFx0dGl0bGU6IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihmYWNldC5MYWJlbCkpLFxuXHRcdHNob3dUaXRsZTogISFmYWNldC5MYWJlbCxcblx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGZhY2V0LmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkpLCB0cnVlKSkpLFxuXHRcdHN1YlNlY3Rpb25zOiBjcmVhdGVTdWJTZWN0aW9ucyhbZmFjZXRdLCBjb252ZXJ0ZXJDb250ZXh0KVxuXHR9O1xuXHRyZXR1cm4gc2VjdGlvbjtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHNlY3Rpb24gZGVmaW5pdGlvbnMgYmFzZWQgb24gdGhlIG1hbmlmZXN0IGRlZmluaXRpb25zLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdFNlY3Rpb25zIFRoZSBzZWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBzZWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICovXG5mdW5jdGlvbiBnZXRTZWN0aW9uc0Zyb21NYW5pZmVzdChcblx0bWFuaWZlc3RTZWN0aW9uczogQ29uZmlndXJhYmxlUmVjb3JkPE1hbmlmZXN0U2VjdGlvbj4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VTZWN0aW9uPiB7XG5cdGNvbnN0IHNlY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21PYmplY3RQYWdlU2VjdGlvbj4gPSB7fTtcblx0T2JqZWN0LmtleXMobWFuaWZlc3RTZWN0aW9ucykuZm9yRWFjaCgobWFuaWZlc3RTZWN0aW9uS2V5KSA9PiB7XG5cdFx0c2VjdGlvbnNbbWFuaWZlc3RTZWN0aW9uS2V5XSA9IGdldFNlY3Rpb25Gcm9tTWFuaWZlc3QobWFuaWZlc3RTZWN0aW9uc1ttYW5pZmVzdFNlY3Rpb25LZXldLCBtYW5pZmVzdFNlY3Rpb25LZXksIGNvbnZlcnRlckNvbnRleHQpO1xuXHR9KTtcblx0cmV0dXJuIHNlY3Rpb25zO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1hbmlmZXN0LWJhc2VkIGN1c3RvbSBzZWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjdXN0b21TZWN0aW9uRGVmaW5pdGlvblxuICogQHBhcmFtIHNlY3Rpb25LZXlcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY3VycmVudCBjdXN0b20gc2VjdGlvblxuICovXG5mdW5jdGlvbiBnZXRTZWN0aW9uRnJvbU1hbmlmZXN0KFxuXHRjdXN0b21TZWN0aW9uRGVmaW5pdGlvbjogTWFuaWZlc3RTZWN0aW9uLFxuXHRzZWN0aW9uS2V5OiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEN1c3RvbU9iamVjdFBhZ2VTZWN0aW9uIHtcblx0Y29uc3QgY3VzdG9tU2VjdGlvbklEID0gY3VzdG9tU2VjdGlvbkRlZmluaXRpb24uaWQgfHwgZ2V0Q3VzdG9tU2VjdGlvbklEKHNlY3Rpb25LZXkpO1xuXHRsZXQgcG9zaXRpb246IFBvc2l0aW9uIHwgdW5kZWZpbmVkID0gY3VzdG9tU2VjdGlvbkRlZmluaXRpb24ucG9zaXRpb247XG5cdGlmICghcG9zaXRpb24pIHtcblx0XHRwb3NpdGlvbiA9IHtcblx0XHRcdHBsYWNlbWVudDogUGxhY2VtZW50LkFmdGVyXG5cdFx0fTtcblx0fVxuXHRsZXQgbWFuaWZlc3RTdWJTZWN0aW9uczogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RTdWJTZWN0aW9uPjtcblx0aWYgKCFjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi5zdWJTZWN0aW9ucykge1xuXHRcdC8vIElmIHRoZXJlIGlzIG5vIHN1YlNlY3Rpb24gZGVmaW5lZCwgd2UgYWRkIHRoZSBjb250ZW50IG9mIHRoZSBjdXN0b20gc2VjdGlvbiBhcyBzdWJzZWN0aW9uc1xuXHRcdC8vIGFuZCBtYWtlIHN1cmUgdG8gc2V0IHRoZSB2aXNpYmlsaXR5IHRvICd0cnVlJywgYXMgdGhlIGFjdHVhbCB2aXNpYmlsaXR5IGlzIGhhbmRsZWQgYnkgdGhlIHNlY3Rpb24gaXRzZWxmXG5cdFx0bWFuaWZlc3RTdWJTZWN0aW9ucyA9IHtcblx0XHRcdFtzZWN0aW9uS2V5XToge1xuXHRcdFx0XHQuLi5jdXN0b21TZWN0aW9uRGVmaW5pdGlvbixcblx0XHRcdFx0cG9zaXRpb246IHVuZGVmaW5lZCxcblx0XHRcdFx0dmlzaWJsZTogXCJ0cnVlXCJcblx0XHRcdH1cblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdG1hbmlmZXN0U3ViU2VjdGlvbnMgPSBjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi5zdWJTZWN0aW9ucztcblx0fVxuXHRjb25zdCBzdWJTZWN0aW9ucyA9IGNyZWF0ZUN1c3RvbVN1YlNlY3Rpb25zKG1hbmlmZXN0U3ViU2VjdGlvbnMsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdGNvbnN0IGN1c3RvbVNlY3Rpb246IEN1c3RvbU9iamVjdFBhZ2VTZWN0aW9uID0ge1xuXHRcdGlkOiBjdXN0b21TZWN0aW9uSUQsXG5cdFx0a2V5OiBzZWN0aW9uS2V5LFxuXHRcdHRpdGxlOiBjdXN0b21TZWN0aW9uRGVmaW5pdGlvbi50aXRsZSxcblx0XHRzaG93VGl0bGU6ICEhY3VzdG9tU2VjdGlvbkRlZmluaXRpb24udGl0bGUsXG5cdFx0dmlzaWJsZTogY3VzdG9tU2VjdGlvbkRlZmluaXRpb24udmlzaWJsZSAhPT0gdW5kZWZpbmVkID8gY3VzdG9tU2VjdGlvbkRlZmluaXRpb24udmlzaWJsZSA6IFwidHJ1ZVwiLFxuXHRcdHBvc2l0aW9uOiBwb3NpdGlvbixcblx0XHRzdWJTZWN0aW9uczogc3ViU2VjdGlvbnMgYXMgYW55XG5cdH07XG5cdHJldHVybiBjdXN0b21TZWN0aW9uO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgT2JqZWN0UGFnZSBoZWFkZXIgYWN0aW9ucyAoYm90aCB0aGUgZGVmYXVsdCBvbmVzIGFuZCB0aGUgY3VzdG9tIG9uZXMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QpLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgQW4gYXJyYXkgY29udGFpbmluZyBhbGwgdGhlIGFjdGlvbnMgZm9yIHRoaXMgT2JqZWN0UGFnZSBoZWFkZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEhlYWRlckFjdGlvbnMgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENvbWJpbmVkQWN0aW9uIHtcblx0Y29uc3QgYUFubm90YXRpb25IZWFkZXJBY3Rpb25zOiBCYXNlQWN0aW9uW10gPSBnZXRIZWFkZXJEZWZhdWx0QWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3QgbWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRtYW5pZmVzdFdyYXBwZXIuZ2V0SGVhZGVyQWN0aW9ucygpLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0YUFubm90YXRpb25IZWFkZXJBY3Rpb25zLFxuXHRcdHVuZGVmaW5lZCxcblx0XHR1bmRlZmluZWQsXG5cdFx0Z2V0SGlkZGVuSGVhZGVyQWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KVxuXHQpO1xuXHRjb25zdCBhY3Rpb25PdmVyd3JpdGVDb25maWc6IE92ZXJyaWRlVHlwZUFjdGlvbiA9IHtcblx0XHRpc05hdmlnYWJsZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRlbmFibGVkOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHZpc2libGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGNvbW1hbmQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGVcblx0fTtcblx0Y29uc3QgaGVhZGVyQWN0aW9ucyA9IGluc2VydEN1c3RvbUVsZW1lbnRzKGFBbm5vdGF0aW9uSGVhZGVyQWN0aW9ucywgbWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMsIGFjdGlvbk92ZXJ3cml0ZUNvbmZpZyk7XG5cdHJldHVybiB7XG5cdFx0YWN0aW9uczogcmVtb3ZlRHVwbGljYXRlQWN0aW9ucyhoZWFkZXJBY3Rpb25zKSxcblx0XHRjb21tYW5kQWN0aW9uczogbWFuaWZlc3RBY3Rpb25zLmNvbW1hbmRBY3Rpb25zXG5cdH07XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgT2JqZWN0UGFnZSBmb290ZXIgYWN0aW9ucyAoYm90aCB0aGUgZGVmYXVsdCBvbmVzIGFuZCB0aGUgY3VzdG9tIG9uZXMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QpLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgQW4gYXJyYXkgY29udGFpbmluZyBhbGwgdGhlIGFjdGlvbnMgZm9yIHRoaXMgT2JqZWN0UGFnZSBmb290ZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEZvb3RlckFjdGlvbnMgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENvbWJpbmVkQWN0aW9uIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3QgYUFubm90YXRpb25Gb290ZXJBY3Rpb25zOiBCYXNlQWN0aW9uW10gPSBnZXRGb290ZXJEZWZhdWx0QWN0aW9ucyhtYW5pZmVzdFdyYXBwZXIuZ2V0Vmlld0xldmVsKCksIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBtYW5pZmVzdEFjdGlvbnMgPSBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KG1hbmlmZXN0V3JhcHBlci5nZXRGb290ZXJBY3Rpb25zKCksIGNvbnZlcnRlckNvbnRleHQsIGFBbm5vdGF0aW9uRm9vdGVyQWN0aW9ucyk7XG5cblx0Y29uc3QgYWN0aW9uT3ZlcndyaXRlQ29uZmlnOiBPdmVycmlkZVR5cGVBY3Rpb24gPSB7XG5cdFx0aXNOYXZpZ2FibGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZW5hYmxlZDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHR2aXNpYmxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbjogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRjb21tYW5kOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlXG5cdH07XG5cdGNvbnN0IGZvb3RlckFjdGlvbnMgPSBpbnNlcnRDdXN0b21FbGVtZW50cyhhQW5ub3RhdGlvbkZvb3RlckFjdGlvbnMsIG1hbmlmZXN0QWN0aW9ucy5hY3Rpb25zLCBhY3Rpb25PdmVyd3JpdGVDb25maWcpO1xuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnM6IGZvb3RlckFjdGlvbnMsXG5cdFx0Y29tbWFuZEFjdGlvbnM6IG1hbmlmZXN0QWN0aW9ucy5jb21tYW5kQWN0aW9uc1xuXHR9O1xufTtcblxuZnVuY3Rpb24gX2dldFN1YlNlY3Rpb25WaXN1YWxpemF0aW9uKHN1YlNlY3Rpb246IERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbik6IFRhYmxlVmlzdWFsaXphdGlvbiB7XG5cdHJldHVybiAoc3ViU2VjdGlvbj8ucHJlc2VudGF0aW9uPy52aXN1YWxpemF0aW9uc1swXSA/IHN1YlNlY3Rpb24ucHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zWzBdIDogdW5kZWZpbmVkKSBhcyBUYWJsZVZpc3VhbGl6YXRpb247XG59XG5cbmZ1bmN0aW9uIF9pc0ZhY2V0SGFzR3JpZFRhYmxlVmlzaWJsZShcblx0ZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uOiBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24sXG5cdHN1YlNlY3Rpb25WaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb25cbik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gKFxuXHRcdGRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbi52aXNpYmxlID09PSBcInRydWVcIiAmJlxuXHRcdGRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbj8ucHJlc2VudGF0aW9uPy52aXN1YWxpemF0aW9ucyAmJlxuXHRcdHN1YlNlY3Rpb25WaXN1YWxpemF0aW9uPy50eXBlID09PSBcIlRhYmxlXCIgJiZcblx0XHRzdWJTZWN0aW9uVmlzdWFsaXphdGlvbj8uY29udHJvbD8udHlwZSA9PT0gXCJHcmlkVGFibGVcIlxuXHQpO1xufVxuXG5mdW5jdGlvbiBfc2V0R3JpZFRhYmxlVmlzdWFsaXphdGlvbkluZm9ybWF0aW9uKFxuXHRzZWN0aW9uczogT2JqZWN0UGFnZVNlY3Rpb25bXSxcblx0ZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uOiBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24sXG5cdHN1YlNlY3Rpb25WaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb24sXG5cdHNlY3Rpb25MYXlvdXQ6IHN0cmluZ1xuKTogdm9pZCB7XG5cdGlmIChfaXNGYWNldEhhc0dyaWRUYWJsZVZpc2libGUoZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uLCBzdWJTZWN0aW9uVmlzdWFsaXphdGlvbikpIHtcblx0XHRjb25zdCB0YWJsZUNvbnRyb2xDb25maWd1cmF0aW9uOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uID0gc3ViU2VjdGlvblZpc3VhbGl6YXRpb24uY29udHJvbDtcblx0XHRpZiAoIShzZWN0aW9uTGF5b3V0ID09PSBcIlBhZ2VcIiAmJiBzZWN0aW9ucy5sZW5ndGggPiAxKSkge1xuXHRcdFx0dGFibGVDb250cm9sQ29uZmlndXJhdGlvbi5yb3dDb3VudE1vZGUgPSBcIkF1dG9cIjtcblx0XHR9XG5cdFx0aWYgKHNlY3Rpb25MYXlvdXQgIT09IFwiVGFic1wiKSB7XG5cdFx0XHR0YWJsZUNvbnRyb2xDb25maWd1cmF0aW9uLnVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0ID0gZmFsc2U7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIF9zZXRHcmlkVGFibGVXaXRoTWl4RmFjZXRzSW5mb3JtYXRpb24oc3ViU2VjdGlvbjogRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uLCBzZWN0aW9uTGF5b3V0OiBzdHJpbmcpOiB2b2lkIHtcblx0aWYgKHN1YlNlY3Rpb24/LmNvbnRlbnQ/Lmxlbmd0aCA9PT0gMSkge1xuXHRcdGNvbnN0IHRhYmxlQ29udHJvbCA9ICgoc3ViU2VjdGlvbi5jb250ZW50WzBdIGFzIERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbikucHJlc2VudGF0aW9uPy52aXN1YWxpemF0aW9uc1swXSBhcyBUYWJsZVZpc3VhbGl6YXRpb24pXG5cdFx0XHQuY29udHJvbDtcblx0XHRpZiAodGFibGVDb250cm9sLnR5cGUgPT09IFwiR3JpZFRhYmxlXCIpIHtcblx0XHRcdHRhYmxlQ29udHJvbC5yb3dDb3VudE1vZGUgPSBcIkF1dG9cIjtcblx0XHRcdGlmIChzZWN0aW9uTGF5b3V0ICE9PSBcIlRhYnNcIikge1xuXHRcdFx0XHR0YWJsZUNvbnRyb2wudXNlQ29uZGVuc2VkVGFibGVMYXlvdXQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBTZXQgdGhlIEdyaWRUYWJsZSBkaXNwbGF5IGluZm9ybWF0aW9uLlxuICpcbiAqIEBwYXJhbSBzZWN0aW9ucyBUaGUgT2JqZWN0UGFnZSBzZWN0aW9uc1xuICogQHBhcmFtIHNlY3Rpb24gVGhlIGN1cnJlbnQgT2JqZWN0UGFnZSBzZWN0aW9uIHByb2Nlc3NlZFxuICogQHBhcmFtIHNlY3Rpb25MYXlvdXRcbiAqL1xuZnVuY3Rpb24gX3NldEdyaWRUYWJsZVN1YlNlY3Rpb25Db250cm9sQ29uZmlndXJhdGlvbihcblx0c2VjdGlvbnM6IE9iamVjdFBhZ2VTZWN0aW9uW10sXG5cdHNlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uLFxuXHRzZWN0aW9uTGF5b3V0OiBzdHJpbmdcbik6IHZvaWQge1xuXHRsZXQgZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uOiBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb247XG5cdGxldCBzdWJTZWN0aW9uVmlzdWFsaXphdGlvbjogVGFibGVWaXN1YWxpemF0aW9uO1xuXHRjb25zdCBzdWJTZWN0aW9ucyA9IHNlY3Rpb24uc3ViU2VjdGlvbnM7XG5cdGlmIChzdWJTZWN0aW9ucy5sZW5ndGggPT09IDEpIHtcblx0XHRkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24gPSBzdWJTZWN0aW9uc1swXSBhcyBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb247XG5cdFx0c3dpdGNoIChzdWJTZWN0aW9uc1swXS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiRGF0YVZpc3VhbGl6YXRpb25cIjpcblx0XHRcdFx0c3ViU2VjdGlvblZpc3VhbGl6YXRpb24gPSBfZ2V0U3ViU2VjdGlvblZpc3VhbGl6YXRpb24oZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uKTtcblx0XHRcdFx0X3NldEdyaWRUYWJsZVZpc3VhbGl6YXRpb25JbmZvcm1hdGlvbihzZWN0aW9ucywgZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uLCBzdWJTZWN0aW9uVmlzdWFsaXphdGlvbiwgc2VjdGlvbkxheW91dCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk1peGVkXCI6XG5cdFx0XHRcdF9zZXRHcmlkVGFibGVXaXRoTWl4RmFjZXRzSW5mb3JtYXRpb24oZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uLCBzZWN0aW9uTGF5b3V0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cmV0dXJuO1xuXHR9XG5cdF9yZW1vdmVDb25kZW5zZWRGcm9tU3ViU2VjdGlvbnMoc3ViU2VjdGlvbnMpO1xufVxuXG4vKipcbiAqIFJlbW92ZSB0aGUgY29uZGVuc2UgbGF5b3V0IG1vZGUgZnJvbSB0aGUgc3Vic2VjdGlvbnMuXG4gKlxuICogQHBhcmFtIHN1YlNlY3Rpb25zIFRoZSBzdWJTZWN0aW9ucyB3aGVyZSB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgY29uZGVuc2VkIGxheW91dFxuICovXG5mdW5jdGlvbiBfcmVtb3ZlQ29uZGVuc2VkRnJvbVN1YlNlY3Rpb25zKHN1YlNlY3Rpb25zOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdKSB7XG5cdGxldCBkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb246IERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbjtcblx0Ly8gV2UgY2hlY2sgaW4gZWFjaCBzdWJzZWN0aW9uIGlmIHRoZXJlIGlzIHZpc3VhbGl6YXRpb25zXG5cdHN1YlNlY3Rpb25zLmZvckVhY2goKHN1YlNlY3Rpb24pID0+IHtcblx0XHRkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24gPSBzdWJTZWN0aW9uIGFzIERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbjtcblx0XHRpZiAoZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uPy5wcmVzZW50YXRpb24/LnZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24/LnByZXNlbnRhdGlvbj8udmlzdWFsaXphdGlvbnMuZm9yRWFjaCgoc2luZ2xlVmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0XHRpZiAoc2luZ2xlVmlzdWFsaXphdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZSkge1xuXHRcdFx0XHRcdHNpbmdsZVZpc3VhbGl6YXRpb24uY29udHJvbC51c2VDb25kZW5zZWRUYWJsZUxheW91dCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Ly8gVGhlbiB3ZSBjaGVjayB0aGUgY29udGVudCBvZiB0aGUgc3Vic2VjdGlvbiwgYW5kIGluIGVhY2ggY29udGVudCB3ZSBjaGVjayBpZiB0aGVyZSBpcyBhIHRhYmxlIHRvIHNldCBpdHMgY29uZGVuc2VkIGxheW91dCB0byBmYWxzZVxuXHRcdGlmIChkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24/LmNvbnRlbnQpIHtcblx0XHRcdGRhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbi5jb250ZW50LmZvckVhY2goKHNpbmdsZUNvbnRlbnQpID0+IHtcblx0XHRcdFx0KHNpbmdsZUNvbnRlbnQgYXMgRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uKS5wcmVzZW50YXRpb24/LnZpc3VhbGl6YXRpb25zLmZvckVhY2goKHNpbmdsZVZpc3VhbGl6YXRpb24pID0+IHtcblx0XHRcdFx0XHRpZiAoc2luZ2xlVmlzdWFsaXphdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZSkge1xuXHRcdFx0XHRcdFx0c2luZ2xlVmlzdWFsaXphdGlvbi5jb250cm9sLnVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0ID0gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59XG4vKipcbiAqIFJldHJpZXZlcyBhbmQgbWVyZ2VzIHRoZSBPYmplY3RQYWdlIHNlY3Rpb25zIGRlZmluZWQgaW4gdGhlIGFubm90YXRpb24gYW5kIGluIHRoZSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHNlY3Rpb25zLlxuICovXG5cbmV4cG9ydCBjb25zdCBnZXRTZWN0aW9ucyA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogT2JqZWN0UGFnZVNlY3Rpb25bXSB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IHNlY3Rpb25zID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoXG5cdFx0Z2V0U2VjdGlvbnNGcm9tQW5ub3RhdGlvbihjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRnZXRTZWN0aW9uc0Zyb21NYW5pZmVzdChtYW5pZmVzdFdyYXBwZXIuZ2V0U2VjdGlvbnMoKSwgY29udmVydGVyQ29udGV4dCksXG5cdFx0e1xuXHRcdFx0dGl0bGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0XHR2aXNpYmxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdFx0c3ViU2VjdGlvbnM6IHtcblx0XHRcdFx0YWN0aW9uczogT3ZlcnJpZGVUeXBlLm1lcmdlLFxuXHRcdFx0XHR0aXRsZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRcdFx0c2lkZUNvbnRlbnQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGVcblx0XHRcdH1cblx0XHR9XG5cdCk7XG5cdC8vIExldmVsIEFkanVzdG1lbnQgZm9yIFwiTWl4ZWRcIiBDb2xsZWN0aW9uIEZhY2V0czpcblx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQvLyBUaGUgbWFuaWZlc3QgZGVmaW5pdGlvbiBvZiBjdXN0b20gc2lkZSBjb250ZW50cyBhbmQgYWN0aW9ucyBzdGlsbCBuZWVkcyB0byBiZSBhbGlnbmVkIGZvciBcIk1peGVkXCIgY29sbGVjdGlvbiBmYWNldHM6XG5cdC8vIENvbGxlY3Rpb24gZmFjZXRzIGNvbnRhaW5pbmcgdGFibGVzIGdhaW4gYW4gZXh0cmEgcmVmZXJlbmNlIGZhY2V0IGFzIGEgdGFibGUgd3JhcHBlciB0byBlbnN1cmUsIHRoYXQgdGhlIHRhYmxlIGlzIGFsd2F5c1xuXHQvLyBwbGFjZWQgaW4gYW4gb3duIGluZGl2aWR1YWwgT2JqZWN0IFBhZ2UgQmxvY2s7IHRoaXMgYWRkaXRpb25hbCBoaWVyYXJjaHkgbGV2ZWwgaXMgdW5rbm93biB0byBhcHAgZGV2ZWxvcGVycywgd2hpY2ggYXJlXG5cdC8vIGRlZmluaW5nIHRoZSBzaWRlIGNvbnRlbnQgYW5kIGFjdGlvbnMgaW4gdGhlIG1hbmlmZXN0IGF0IGNvbGxlY3Rpb24gZmFjZXQgbGV2ZWw7IG5vdywgc2luY2UgdGhlIHNpZGVDb250ZW50IGFsd2F5cyBuZWVkc1xuXHQvLyB0byBiZSBhc3NpZ25lZCB0byBhIGJsb2NrLCBhbmQgYWN0aW9ucyBhbHdheXMgbmVlZCB0byBiZSBhc3NpZ25lZCB0byBhIGZvcm0sXG5cdC8vIHdlIG5lZWQgdG8gbW92ZSB0aGUgc2lkZUNvbnRlbnQgYW5kIGFjdGlvbnMgZnJvbSBhIG1peGVkIGNvbGxlY3Rpb24gZmFjZXQgdG8gaXRzIGNvbnRlbnQuXG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0c2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2VjdGlvbikge1xuXHRcdF9zZXRHcmlkVGFibGVTdWJTZWN0aW9uQ29udHJvbENvbmZpZ3VyYXRpb24oc2VjdGlvbnMsIHNlY3Rpb24sIG1hbmlmZXN0V3JhcHBlci5nZXRTZWN0aW9uTGF5b3V0KCkpO1xuXHRcdHNlY3Rpb24uc3ViU2VjdGlvbnM/LmZvckVhY2goZnVuY3Rpb24gKHN1YlNlY3Rpb24pIHtcblx0XHRcdHN1YlNlY3Rpb24udGl0bGUgPSBzdWJTZWN0aW9uLnRpdGxlID09PSBcInVuZGVmaW5lZFwiID8gdW5kZWZpbmVkIDogc3ViU2VjdGlvbi50aXRsZTtcblx0XHRcdGlmIChzdWJTZWN0aW9uLnR5cGUgPT09IFwiTWl4ZWRcIiAmJiBzdWJTZWN0aW9uLmNvbnRlbnQ/Lmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCBmaXJzdEZvcm0gPSBzdWJTZWN0aW9uLmNvbnRlbnQuZmluZChcblx0XHRcdFx0XHQoZWxlbWVudCkgPT4gKGVsZW1lbnQgYXMgRm9ybVN1YlNlY3Rpb24pLnR5cGUgPT09IFN1YlNlY3Rpb25UeXBlLkZvcm1cblx0XHRcdFx0KSBhcyBGb3JtU3ViU2VjdGlvbjtcblxuXHRcdFx0XHQvLyAxLiBDb3B5IHNpZGVDb250ZW50IHRvIHRoZSBTdWJTZWN0aW9uJ3MgZmlyc3QgZm9ybTsgb3IgLS0gaWYgdW5hdmFpbGFibGUgLS0gdG8gaXRzIGZpcnN0IGNvbnRlbnRcblx0XHRcdFx0Ly8gMi4gQ29weSBhY3Rpb25zIHRvIHRoZSBmaXJzdCBmb3JtIG9mIHRoZSBTdWJTZWN0aW9uJ3MgY29udGVudFxuXHRcdFx0XHQvLyAzLiBEZWxldGUgc2lkZUNvbnRlbnQgLyBhY3Rpb25zIGF0IHRoZSAoaW52YWxpZCkgbWFuaWZlc3QgbGV2ZWxcblxuXHRcdFx0XHRpZiAoc3ViU2VjdGlvbi5zaWRlQ29udGVudCkge1xuXHRcdFx0XHRcdGlmIChmaXJzdEZvcm0pIHtcblx0XHRcdFx0XHRcdC8vIElmIHRoZXJlIGlzIGEgZm9ybSwgaXQgYWx3YXlzIG5lZWRzIHRvIGJlIGF0dGFjaGVkIHRvIHRoZSBmb3JtLCBhcyB0aGUgZm9ybSBpbmhlcml0cyB0aGUgSUQgb2YgdGhlIFN1YlNlY3Rpb25cblx0XHRcdFx0XHRcdGZpcnN0Rm9ybS5zaWRlQ29udGVudCA9IHN1YlNlY3Rpb24uc2lkZUNvbnRlbnQ7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHN1YlNlY3Rpb24uY29udGVudFswXS5zaWRlQ29udGVudCA9IHN1YlNlY3Rpb24uc2lkZUNvbnRlbnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN1YlNlY3Rpb24uc2lkZUNvbnRlbnQgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZmlyc3RGb3JtICYmIChzdWJTZWN0aW9uIGFzIEZvcm1TdWJTZWN0aW9uKS5hY3Rpb25zPy5sZW5ndGgpIHtcblx0XHRcdFx0XHRmaXJzdEZvcm0uYWN0aW9ucyA9IChzdWJTZWN0aW9uIGFzIEZvcm1TdWJTZWN0aW9uKS5hY3Rpb25zO1xuXHRcdFx0XHRcdChzdWJTZWN0aW9uIGFzIEZvcm1TdWJTZWN0aW9uKS5hY3Rpb25zID0gW107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cdHJldHVybiBzZWN0aW9ucztcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgT2JqZWN0UGFnZSBoYXMgaGVhZGVyIGNvbnRlbnQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZXJlIGlzIGF0IGxlYXN0IG9uIGhlYWRlciBmYWNldFxuICovXG5mdW5jdGlvbiBoYXNIZWFkZXJDb250ZW50KGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0cmV0dXJuIChcblx0XHQoY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkuYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJGYWNldHMgfHwgW10pLmxlbmd0aCA+IDAgfHxcblx0XHRPYmplY3Qua2V5cyhtYW5pZmVzdFdyYXBwZXIuZ2V0SGVhZGVyRmFjZXRzKCkpLmxlbmd0aCA+IDBcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBleHByZXNzaW9uIHRvIGV2YWx1YXRlIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBoZWFkZXIgY29udGVudC5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgRGVsZXRlIGJ1dHRvblxuICovXG5mdW5jdGlvbiBnZXRTaG93SGVhZGVyQ29udGVudEV4cHJlc3Npb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+IHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0cmV0dXJuIGlmRWxzZShcblx0XHQhaGFzSGVhZGVyQ29udGVudChjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRjb25zdGFudChmYWxzZSksXG5cdFx0aWZFbHNlKGVxdWFsKG1hbmlmZXN0V3JhcHBlci5pc0hlYWRlckVkaXRhYmxlKCksIGZhbHNlKSwgY29uc3RhbnQodHJ1ZSksIG5vdChVSS5Jc0VkaXRhYmxlKSlcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gZXZhbHVhdGUgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGhlYWRlciBjb250ZW50LlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBEZWxldGUgYnV0dG9uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTaG93SGVhZGVyQ29udGVudCA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZ2V0U2hvd0hlYWRlckNvbnRlbnRFeHByZXNzaW9uKGNvbnZlcnRlckNvbnRleHQpKTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGV2YWx1YXRlIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBhdmF0YXIgd2hlbiB0aGUgaGVhZGVyIGlzIGluIGV4cGFuZGVkIHN0YXRlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBEZWxldGUgYnV0dG9uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeHBhbmRlZEltYWdlVmlzaWJsZSA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24obm90KGdldFNob3dIZWFkZXJDb250ZW50RXhwcmVzc2lvbihjb252ZXJ0ZXJDb250ZXh0KSkpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNvbnZlcnRQYWdlID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBPYmplY3RQYWdlRGVmaW5pdGlvbiB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGxldCBoZWFkZXJTZWN0aW9uOiBPYmplY3RQYWdlU2VjdGlvbiB8IHVuZGVmaW5lZDtcblx0Y29uc3QgZW50aXR5VHlwZTogRW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXG5cdC8vIFJldHJpZXZlIGFsbCBoZWFkZXIgZmFjZXRzIChmcm9tIGFubm90YXRpb25zICYgY3VzdG9tKVxuXHRjb25zdCBoZWFkZXJGYWNldHMgPSBpbnNlcnRDdXN0b21FbGVtZW50cyhcblx0XHRnZXRIZWFkZXJGYWNldHNGcm9tQW5ub3RhdGlvbnMoY29udmVydGVyQ29udGV4dCksXG5cdFx0Z2V0SGVhZGVyRmFjZXRzRnJvbU1hbmlmZXN0KG1hbmlmZXN0V3JhcHBlci5nZXRIZWFkZXJGYWNldHMoKSlcblx0KTtcblxuXHQvLyBSZXRyaWV2ZSB0aGUgcGFnZSBoZWFkZXIgYWN0aW9uc1xuXHRjb25zdCBoZWFkZXJBY3Rpb25zID0gZ2V0SGVhZGVyQWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHQvLyBSZXRyaWV2ZSB0aGUgcGFnZSBmb290ZXIgYWN0aW9uc1xuXHRjb25zdCBmb290ZXJBY3Rpb25zID0gZ2V0Rm9vdGVyQWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRpZiAobWFuaWZlc3RXcmFwcGVyLmlzSGVhZGVyRWRpdGFibGUoKSAmJiAoZW50aXR5VHlwZS5hbm5vdGF0aW9ucy5VST8uSGVhZGVyRmFjZXRzIHx8IGVudGl0eVR5cGUuYW5ub3RhdGlvbnMuVUk/LkhlYWRlckluZm8pKSB7XG5cdFx0aGVhZGVyU2VjdGlvbiA9IGNyZWF0ZUVkaXRhYmxlSGVhZGVyU2VjdGlvbihjb252ZXJ0ZXJDb250ZXh0LCBoZWFkZXJGYWNldHMpO1xuXHR9XG5cblx0Y29uc3Qgc2VjdGlvbnMgPSBnZXRTZWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRyZXR1cm4ge1xuXHRcdHRlbXBsYXRlOiBUZW1wbGF0ZVR5cGUuT2JqZWN0UGFnZSxcblx0XHRoZWFkZXI6IHtcblx0XHRcdHZpc2libGU6IG1hbmlmZXN0V3JhcHBlci5nZXRTaG93T2JqZWN0UGFnZUhlYWRlcigpLFxuXHRcdFx0c2VjdGlvbjogaGVhZGVyU2VjdGlvbixcblx0XHRcdGZhY2V0czogaGVhZGVyRmFjZXRzLFxuXHRcdFx0YWN0aW9uczogaGVhZGVyQWN0aW9ucy5hY3Rpb25zLFxuXHRcdFx0c2hvd0NvbnRlbnQ6IGdldFNob3dIZWFkZXJDb250ZW50KGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0aGFzQ29udGVudDogaGFzSGVhZGVyQ29udGVudChjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdGF2YXRhcjogZ2V0QXZhdGFyKGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0dGl0bGU6IHtcblx0XHRcdFx0ZXhwYW5kZWRJbWFnZVZpc2libGU6IGdldEV4cGFuZGVkSW1hZ2VWaXNpYmxlKGNvbnZlcnRlckNvbnRleHQpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzZWN0aW9uczogc2VjdGlvbnMsXG5cdFx0Zm9vdGVyQWN0aW9uczogZm9vdGVyQWN0aW9ucy5hY3Rpb25zLFxuXHRcdGhlYWRlckNvbW1hbmRBY3Rpb25zOiBoZWFkZXJBY3Rpb25zLmNvbW1hbmRBY3Rpb25zLFxuXHRcdGZvb3RlckNvbW1hbmRBY3Rpb25zOiBmb290ZXJBY3Rpb25zLmNvbW1hbmRBY3Rpb25zLFxuXHRcdHNob3dBbmNob3JCYXI6IG1hbmlmZXN0V3JhcHBlci5nZXRTaG93QW5jaG9yQmFyKCksXG5cdFx0dXNlSWNvblRhYkJhcjogbWFuaWZlc3RXcmFwcGVyLnVzZUljb25UYWJCYXIoKVxuXHR9O1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUEyREEsTUFBTUEsYUFBYSxHQUFHLENBQUNDLGVBQTJCLEVBQUVDLFFBQWdCLEtBQWE7SUFBQTtJQUNoRixPQUFPLHdCQUFBRCxlQUFlLENBQUNFLEVBQUUsd0RBQWxCLG9CQUFvQkMsUUFBUSxFQUFFLCtCQUFJSCxlQUFlLENBQUNJLEtBQUssMERBQXJCLHNCQUF1QkQsUUFBUSxFQUFFLEtBQUlGLFFBQVE7RUFDdkYsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNJLDJCQUEyQixDQUMxQ0MsZ0JBQWtDLEVBQ2xDQyxlQUF3QyxFQUNwQjtJQUFBO0lBQ3BCLE1BQU1DLHVCQUF1QixHQUFHQywwQkFBMEIsRUFBRTtJQUM1RCxNQUFNQyxZQUFZLDRCQUFHSixnQkFBZ0IsQ0FBQ0ssYUFBYSxFQUFFLENBQUNDLFdBQVcsb0ZBQTVDLHNCQUE4Q0MsRUFBRSwyREFBaEQsdUJBQWtEQyxZQUFZO0lBQ25GLE1BQU1DLHNCQUFzQixHQUFHTCxZQUFZLEdBQUdNLGlCQUFpQixDQUFDTixZQUFZLEVBQUVKLGdCQUFnQixFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7SUFDMUcsTUFBTVcsNEJBQTRCLEdBQUdDLGtDQUFrQyxDQUFDWixnQkFBZ0IsQ0FBQztJQUN6RixJQUFJYSwwQkFBa0QsR0FBRyxFQUFFO0lBQzNELElBQUlGLDRCQUE0QixDQUFDRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQzVDO01BQ0EsSUFBSUMsQ0FBQyxHQUFHLENBQUM7TUFDVGQsZUFBZSxDQUFDZSxPQUFPLENBQUMsVUFBVUMsSUFBSSxFQUFFO1FBQ3ZDO1FBQ0EsT0FBT1Isc0JBQXNCLENBQUNLLE1BQU0sR0FBR0MsQ0FBQyxJQUFJTixzQkFBc0IsQ0FBQ00sQ0FBQyxDQUFDLENBQUNHLE9BQU8sS0FBSyxPQUFPLEVBQUU7VUFDMUZMLDBCQUEwQixDQUFDTSxJQUFJLENBQUNWLHNCQUFzQixDQUFDTSxDQUFDLENBQUMsQ0FBQztVQUMxREEsQ0FBQyxFQUFFO1FBQ0o7UUFDQSxJQUNDTixzQkFBc0IsQ0FBQ0ssTUFBTSxHQUFHQyxDQUFDLEtBQ2hDRSxJQUFJLENBQUNHLEdBQUcsS0FBS1gsc0JBQXNCLENBQUNNLENBQUMsQ0FBQyxDQUFDSyxHQUFHO1FBQzFDO1FBQ0FILElBQUksQ0FBQ0csR0FBRyxDQUFDQyxLQUFLLENBQUNKLElBQUksQ0FBQ0csR0FBRyxDQUFDRSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQzdDYixzQkFBc0IsQ0FBQ00sQ0FBQyxDQUFDLENBQUNLLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDWixzQkFBc0IsQ0FBQ00sQ0FBQyxDQUFDLENBQUNLLEdBQUcsQ0FBQ0UsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzFGO1VBQ0RULDBCQUEwQixDQUFDTSxJQUFJLENBQUNWLHNCQUFzQixDQUFDTSxDQUFDLENBQUMsQ0FBQztVQUMxREEsQ0FBQyxFQUFFO1FBQ0osQ0FBQyxNQUFNO1VBQ05KLDRCQUE0QixDQUFDSyxPQUFPLENBQUMsVUFBVU8sVUFBVSxFQUFFO1lBQzFELElBQUlOLElBQUksQ0FBQ0csR0FBRyxLQUFLRyxVQUFVLENBQUNILEdBQUcsRUFBRTtjQUNoQ1AsMEJBQTBCLENBQUNNLElBQUksQ0FBQ0ksVUFBVSxDQUFDO1lBQzVDO1VBQ0QsQ0FBQyxDQUFDO1FBQ0g7TUFDRCxDQUFDLENBQUM7SUFDSCxDQUFDLE1BQU07TUFDTlYsMEJBQTBCLEdBQUdKLHNCQUFzQjtJQUNwRDtJQUNBLE1BQU1lLGFBQWdDLEdBQUc7TUFDeENDLEVBQUUsRUFBRXZCLHVCQUF1QjtNQUMzQmtCLEdBQUcsRUFBRSx1QkFBdUI7TUFDNUJNLEtBQUssRUFBRSxtREFBbUQ7TUFDMURSLE9BQU8sRUFBRVMsaUJBQWlCLENBQUNwQixFQUFFLENBQUNxQixVQUFVLENBQUM7TUFDekNDLFdBQVcsRUFBRWhCO0lBQ2QsQ0FBQztJQUNELE9BQU9XLGFBQWE7RUFDckI7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEE7RUFNQSxTQUFTTSx5QkFBeUIsQ0FBQzlCLGdCQUFrQyxFQUF1QjtJQUFBO0lBQzNGLE1BQU0rQixVQUFVLEdBQUcvQixnQkFBZ0IsQ0FBQ0ssYUFBYSxFQUFFO0lBQ25ELE1BQU0yQixrQkFBdUMsR0FDNUMsMEJBQUFELFVBQVUsQ0FBQ3pCLFdBQVcsb0ZBQXRCLHNCQUF3QkMsRUFBRSxxRkFBMUIsdUJBQTRCMEIsTUFBTSwyREFBbEMsdUJBQW9DQyxHQUFHLENBQUV4QyxlQUEyQixJQUNuRXlDLHdCQUF3QixDQUFDekMsZUFBZSxFQUFFTSxnQkFBZ0IsQ0FBQyxDQUMzRCxLQUFJLEVBQUU7SUFDUixPQUFPZ0Msa0JBQWtCO0VBQzFCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0csd0JBQXdCLENBQUNDLEtBQWlCLEVBQUVwQyxnQkFBa0MsRUFBcUI7SUFBQTtJQUMzRyxNQUFNcUMsU0FBUyxHQUFHQyxZQUFZLENBQUNGLEtBQUssQ0FBQztJQUNyQyxNQUFNRyxPQUEwQixHQUFHO01BQ2xDZCxFQUFFLEVBQUVZLFNBQVM7TUFDYmpCLEdBQUcsRUFBRTNCLGFBQWEsQ0FBQzJDLEtBQUssRUFBRUMsU0FBUyxDQUFDO01BQ3BDWCxLQUFLLEVBQUVDLGlCQUFpQixDQUFDYSwyQkFBMkIsQ0FBQ0osS0FBSyxDQUFDdEMsS0FBSyxDQUFDLENBQUM7TUFDbEUyQyxTQUFTLEVBQUUsQ0FBQyxDQUFDTCxLQUFLLENBQUN0QyxLQUFLO01BQ3hCb0IsT0FBTyxFQUFFUyxpQkFBaUIsQ0FBQ2UsR0FBRyxDQUFDQyxLQUFLLENBQUNILDJCQUEyQix1QkFBQ0osS0FBSyxDQUFDOUIsV0FBVyxnRkFBakIsbUJBQW1CQyxFQUFFLG9GQUFyQixzQkFBdUJxQyxNQUFNLDJEQUE3Qix1QkFBK0JDLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztNQUNuSGhCLFdBQVcsRUFBRW5CLGlCQUFpQixDQUFDLENBQUMwQixLQUFLLENBQUMsRUFBRXBDLGdCQUFnQjtJQUN6RCxDQUFDO0lBQ0QsT0FBT3VDLE9BQU87RUFDZjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNPLHVCQUF1QixDQUMvQkMsZ0JBQXFELEVBQ3JEL0MsZ0JBQWtDLEVBQ1E7SUFDMUMsTUFBTWdELFFBQWlELEdBQUcsQ0FBQyxDQUFDO0lBQzVEQyxNQUFNLENBQUNDLElBQUksQ0FBQ0gsZ0JBQWdCLENBQUMsQ0FBQy9CLE9BQU8sQ0FBRW1DLGtCQUFrQixJQUFLO01BQzdESCxRQUFRLENBQUNHLGtCQUFrQixDQUFDLEdBQUdDLHNCQUFzQixDQUFDTCxnQkFBZ0IsQ0FBQ0ksa0JBQWtCLENBQUMsRUFBRUEsa0JBQWtCLEVBQUVuRCxnQkFBZ0IsQ0FBQztJQUNsSSxDQUFDLENBQUM7SUFDRixPQUFPZ0QsUUFBUTtFQUNoQjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0ksc0JBQXNCLENBQzlCQyx1QkFBd0MsRUFDeENDLFVBQWtCLEVBQ2xCdEQsZ0JBQWtDLEVBQ1I7SUFDMUIsTUFBTXVELGVBQWUsR0FBR0YsdUJBQXVCLENBQUM1QixFQUFFLElBQUkrQixrQkFBa0IsQ0FBQ0YsVUFBVSxDQUFDO0lBQ3BGLElBQUlHLFFBQThCLEdBQUdKLHVCQUF1QixDQUFDSSxRQUFRO0lBQ3JFLElBQUksQ0FBQ0EsUUFBUSxFQUFFO01BQ2RBLFFBQVEsR0FBRztRQUNWQyxTQUFTLEVBQUVDLFNBQVMsQ0FBQ0M7TUFDdEIsQ0FBQztJQUNGO0lBQ0EsSUFBSUMsbUJBQXVEO0lBQzNELElBQUksQ0FBQ1IsdUJBQXVCLENBQUN4QixXQUFXLEVBQUU7TUFDekM7TUFDQTtNQUNBZ0MsbUJBQW1CLEdBQUc7UUFDckIsQ0FBQ1AsVUFBVSxHQUFHO1VBQ2IsR0FBR0QsdUJBQXVCO1VBQzFCSSxRQUFRLEVBQUVLLFNBQVM7VUFDbkI1QyxPQUFPLEVBQUU7UUFDVjtNQUNELENBQUM7SUFDRixDQUFDLE1BQU07TUFDTjJDLG1CQUFtQixHQUFHUix1QkFBdUIsQ0FBQ3hCLFdBQVc7SUFDMUQ7SUFDQSxNQUFNQSxXQUFXLEdBQUdrQyx1QkFBdUIsQ0FBQ0YsbUJBQW1CLEVBQUU3RCxnQkFBZ0IsQ0FBQztJQUVsRixNQUFNZ0UsYUFBc0MsR0FBRztNQUM5Q3ZDLEVBQUUsRUFBRThCLGVBQWU7TUFDbkJuQyxHQUFHLEVBQUVrQyxVQUFVO01BQ2Y1QixLQUFLLEVBQUUyQix1QkFBdUIsQ0FBQzNCLEtBQUs7TUFDcENlLFNBQVMsRUFBRSxDQUFDLENBQUNZLHVCQUF1QixDQUFDM0IsS0FBSztNQUMxQ1IsT0FBTyxFQUFFbUMsdUJBQXVCLENBQUNuQyxPQUFPLEtBQUs0QyxTQUFTLEdBQUdULHVCQUF1QixDQUFDbkMsT0FBTyxHQUFHLE1BQU07TUFDakd1QyxRQUFRLEVBQUVBLFFBQVE7TUFDbEI1QixXQUFXLEVBQUVBO0lBQ2QsQ0FBQztJQUNELE9BQU9tQyxhQUFhO0VBQ3JCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU1DLGdCQUFnQixHQUFHLFVBQVVqRSxnQkFBa0MsRUFBa0I7SUFDN0YsTUFBTWtFLHdCQUFzQyxHQUFHQyx1QkFBdUIsQ0FBQ25FLGdCQUFnQixDQUFDO0lBQ3hGLE1BQU1vRSxlQUFlLEdBQUdwRSxnQkFBZ0IsQ0FBQ3FFLGtCQUFrQixFQUFFO0lBQzdELE1BQU1DLGVBQWUsR0FBR0Msc0JBQXNCLENBQzdDSCxlQUFlLENBQUNILGdCQUFnQixFQUFFLEVBQ2xDakUsZ0JBQWdCLEVBQ2hCa0Usd0JBQXdCLEVBQ3hCSixTQUFTLEVBQ1RBLFNBQVMsRUFDVFUsc0JBQXNCLENBQUN4RSxnQkFBZ0IsQ0FBQyxDQUN4QztJQUNELE1BQU15RSxxQkFBeUMsR0FBRztNQUNqREMsV0FBVyxFQUFFQyxZQUFZLENBQUNDLFNBQVM7TUFDbkNDLE9BQU8sRUFBRUYsWUFBWSxDQUFDQyxTQUFTO01BQy9CMUQsT0FBTyxFQUFFeUQsWUFBWSxDQUFDQyxTQUFTO01BQy9CRSw4QkFBOEIsRUFBRUgsWUFBWSxDQUFDQyxTQUFTO01BQ3RERyxPQUFPLEVBQUVKLFlBQVksQ0FBQ0M7SUFDdkIsQ0FBQztJQUNELE1BQU1JLGFBQWEsR0FBR0Msb0JBQW9CLENBQUNmLHdCQUF3QixFQUFFSSxlQUFlLENBQUNZLE9BQU8sRUFBRVQscUJBQXFCLENBQUM7SUFDcEgsT0FBTztNQUNOUyxPQUFPLEVBQUVDLHNCQUFzQixDQUFDSCxhQUFhLENBQUM7TUFDOUNJLGNBQWMsRUFBRWQsZUFBZSxDQUFDYztJQUNqQyxDQUFDO0VBQ0YsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQTtFQU1PLE1BQU1DLGdCQUFnQixHQUFHLFVBQVVyRixnQkFBa0MsRUFBa0I7SUFDN0YsTUFBTW9FLGVBQWUsR0FBR3BFLGdCQUFnQixDQUFDcUUsa0JBQWtCLEVBQUU7SUFDN0QsTUFBTWlCLHdCQUFzQyxHQUFHQyx1QkFBdUIsQ0FBQ25CLGVBQWUsQ0FBQ29CLFlBQVksRUFBRSxFQUFFeEYsZ0JBQWdCLENBQUM7SUFDeEgsTUFBTXNFLGVBQWUsR0FBR0Msc0JBQXNCLENBQUNILGVBQWUsQ0FBQ2lCLGdCQUFnQixFQUFFLEVBQUVyRixnQkFBZ0IsRUFBRXNGLHdCQUF3QixDQUFDO0lBRTlILE1BQU1iLHFCQUF5QyxHQUFHO01BQ2pEQyxXQUFXLEVBQUVDLFlBQVksQ0FBQ0MsU0FBUztNQUNuQ0MsT0FBTyxFQUFFRixZQUFZLENBQUNDLFNBQVM7TUFDL0IxRCxPQUFPLEVBQUV5RCxZQUFZLENBQUNDLFNBQVM7TUFDL0JFLDhCQUE4QixFQUFFSCxZQUFZLENBQUNDLFNBQVM7TUFDdERHLE9BQU8sRUFBRUosWUFBWSxDQUFDQztJQUN2QixDQUFDO0lBQ0QsTUFBTWEsYUFBYSxHQUFHUixvQkFBb0IsQ0FBQ0ssd0JBQXdCLEVBQUVoQixlQUFlLENBQUNZLE9BQU8sRUFBRVQscUJBQXFCLENBQUM7SUFDcEgsT0FBTztNQUNOUyxPQUFPLEVBQUVPLGFBQWE7TUFDdEJMLGNBQWMsRUFBRWQsZUFBZSxDQUFDYztJQUNqQyxDQUFDO0VBQ0YsQ0FBQztFQUFDO0VBRUYsU0FBU00sMkJBQTJCLENBQUNDLFVBQXVDLEVBQXNCO0lBQUE7SUFDakcsT0FBUUEsVUFBVSxhQUFWQSxVQUFVLHdDQUFWQSxVQUFVLENBQUVDLFlBQVksa0RBQXhCLHNCQUEwQkMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHRixVQUFVLENBQUNDLFlBQVksQ0FBQ0MsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHL0IsU0FBUztFQUM1RztFQUVBLFNBQVNnQywyQkFBMkIsQ0FDbkNDLDJCQUF3RCxFQUN4REMsdUJBQTJDLEVBQ2pDO0lBQUE7SUFDVixPQUNDRCwyQkFBMkIsQ0FBQzdFLE9BQU8sS0FBSyxNQUFNLEtBQzlDNkUsMkJBQTJCLGFBQTNCQSwyQkFBMkIsZ0RBQTNCQSwyQkFBMkIsQ0FBRUgsWUFBWSwwREFBekMsc0JBQTJDQyxjQUFjLEtBQ3pELENBQUFHLHVCQUF1QixhQUF2QkEsdUJBQXVCLHVCQUF2QkEsdUJBQXVCLENBQUVDLElBQUksTUFBSyxPQUFPLElBQ3pDLENBQUFELHVCQUF1QixhQUF2QkEsdUJBQXVCLGdEQUF2QkEsdUJBQXVCLENBQUVFLE9BQU8sMERBQWhDLHNCQUFrQ0QsSUFBSSxNQUFLLFdBQVc7RUFFeEQ7RUFFQSxTQUFTRSxxQ0FBcUMsQ0FDN0NuRCxRQUE2QixFQUM3QitDLDJCQUF3RCxFQUN4REMsdUJBQTJDLEVBQzNDSSxhQUFxQixFQUNkO0lBQ1AsSUFBSU4sMkJBQTJCLENBQUNDLDJCQUEyQixFQUFFQyx1QkFBdUIsQ0FBQyxFQUFFO01BQ3RGLE1BQU1LLHlCQUFvRCxHQUFHTCx1QkFBdUIsQ0FBQ0UsT0FBTztNQUM1RixJQUFJLEVBQUVFLGFBQWEsS0FBSyxNQUFNLElBQUlwRCxRQUFRLENBQUNsQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDdkR1Rix5QkFBeUIsQ0FBQ0MsWUFBWSxHQUFHLE1BQU07TUFDaEQ7TUFDQSxJQUFJRixhQUFhLEtBQUssTUFBTSxFQUFFO1FBQzdCQyx5QkFBeUIsQ0FBQ0UsdUJBQXVCLEdBQUcsS0FBSztNQUMxRDtJQUNEO0VBQ0Q7RUFFQSxTQUFTQyxxQ0FBcUMsQ0FBQ2IsVUFBdUMsRUFBRVMsYUFBcUIsRUFBUTtJQUFBO0lBQ3BILElBQUksQ0FBQVQsVUFBVSxhQUFWQSxVQUFVLDhDQUFWQSxVQUFVLENBQUVjLE9BQU8sd0RBQW5CLG9CQUFxQjNGLE1BQU0sTUFBSyxDQUFDLEVBQUU7TUFBQTtNQUN0QyxNQUFNNEYsWUFBWSxHQUFHLGtCQUFFZixVQUFVLENBQUNjLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBaUNiLFlBQVksa0RBQW5FLGNBQXFFQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQzFHSyxPQUFPO01BQ1QsSUFBSVEsWUFBWSxDQUFDVCxJQUFJLEtBQUssV0FBVyxFQUFFO1FBQ3RDUyxZQUFZLENBQUNKLFlBQVksR0FBRyxNQUFNO1FBQ2xDLElBQUlGLGFBQWEsS0FBSyxNQUFNLEVBQUU7VUFDN0JNLFlBQVksQ0FBQ0gsdUJBQXVCLEdBQUcsS0FBSztRQUM3QztNQUNEO0lBQ0Q7RUFDRDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNJLDJDQUEyQyxDQUNuRDNELFFBQTZCLEVBQzdCVCxPQUEwQixFQUMxQjZELGFBQXFCLEVBQ2Q7SUFDUCxJQUFJTCwyQkFBd0Q7SUFDNUQsSUFBSUMsdUJBQTJDO0lBQy9DLE1BQU1uRSxXQUFXLEdBQUdVLE9BQU8sQ0FBQ1YsV0FBVztJQUN2QyxJQUFJQSxXQUFXLENBQUNmLE1BQU0sS0FBSyxDQUFDLEVBQUU7TUFDN0JpRiwyQkFBMkIsR0FBR2xFLFdBQVcsQ0FBQyxDQUFDLENBQWdDO01BQzNFLFFBQVFBLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQ29FLElBQUk7UUFDMUIsS0FBSyxtQkFBbUI7VUFDdkJELHVCQUF1QixHQUFHTiwyQkFBMkIsQ0FBQ0ssMkJBQTJCLENBQUM7VUFDbEZJLHFDQUFxQyxDQUFDbkQsUUFBUSxFQUFFK0MsMkJBQTJCLEVBQUVDLHVCQUF1QixFQUFFSSxhQUFhLENBQUM7VUFDcEg7UUFDRCxLQUFLLE9BQU87VUFDWEkscUNBQXFDLENBQUNULDJCQUEyQixFQUFFSyxhQUFhLENBQUM7VUFDakY7UUFDRDtVQUNDO01BQU07TUFFUjtJQUNEO0lBQ0FRLCtCQUErQixDQUFDL0UsV0FBVyxDQUFDO0VBQzdDOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTK0UsK0JBQStCLENBQUMvRSxXQUFtQyxFQUFFO0lBQzdFLElBQUlrRSwyQkFBd0Q7SUFDNUQ7SUFDQWxFLFdBQVcsQ0FBQ2IsT0FBTyxDQUFFMkUsVUFBVSxJQUFLO01BQUE7TUFDbkNJLDJCQUEyQixHQUFHSixVQUF5QztNQUN2RSw4QkFBSUksMkJBQTJCLDZFQUEzQix1QkFBNkJILFlBQVksbURBQXpDLHVCQUEyQ0MsY0FBYyxFQUFFO1FBQUE7UUFDOUQsMEJBQUFFLDJCQUEyQixxRkFBM0IsdUJBQTZCSCxZQUFZLDJEQUF6Qyx1QkFBMkNDLGNBQWMsQ0FBQzdFLE9BQU8sQ0FBRTZGLG1CQUFtQixJQUFLO1VBQzFGLElBQUlBLG1CQUFtQixDQUFDWixJQUFJLEtBQUthLGlCQUFpQixDQUFDQyxLQUFLLEVBQUU7WUFDekRGLG1CQUFtQixDQUFDWCxPQUFPLENBQUNLLHVCQUF1QixHQUFHLEtBQUs7VUFDNUQ7UUFDRCxDQUFDLENBQUM7TUFDSDtNQUNBO01BQ0EsOEJBQUlSLDJCQUEyQixtREFBM0IsdUJBQTZCVSxPQUFPLEVBQUU7UUFDekNWLDJCQUEyQixDQUFDVSxPQUFPLENBQUN6RixPQUFPLENBQUVnRyxhQUFhLElBQUs7VUFBQTtVQUM5RCxrQkFBQ0EsYUFBYSxDQUFpQ3BCLFlBQVksbURBQTNELGVBQTZEQyxjQUFjLENBQUM3RSxPQUFPLENBQUU2RixtQkFBbUIsSUFBSztZQUM1RyxJQUFJQSxtQkFBbUIsQ0FBQ1osSUFBSSxLQUFLYSxpQkFBaUIsQ0FBQ0MsS0FBSyxFQUFFO2NBQ3pERixtQkFBbUIsQ0FBQ1gsT0FBTyxDQUFDSyx1QkFBdUIsR0FBRyxLQUFLO1lBQzVEO1VBQ0QsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDO01BQ0g7SUFDRCxDQUFDLENBQUM7RUFDSDtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFTyxNQUFNVSxXQUFXLEdBQUcsVUFBVWpILGdCQUFrQyxFQUF1QjtJQUM3RixNQUFNb0UsZUFBZSxHQUFHcEUsZ0JBQWdCLENBQUNxRSxrQkFBa0IsRUFBRTtJQUM3RCxNQUFNckIsUUFBUSxHQUFHaUMsb0JBQW9CLENBQ3BDbkQseUJBQXlCLENBQUM5QixnQkFBZ0IsQ0FBQyxFQUMzQzhDLHVCQUF1QixDQUFDc0IsZUFBZSxDQUFDNkMsV0FBVyxFQUFFLEVBQUVqSCxnQkFBZ0IsQ0FBQyxFQUN4RTtNQUNDMEIsS0FBSyxFQUFFaUQsWUFBWSxDQUFDQyxTQUFTO01BQzdCMUQsT0FBTyxFQUFFeUQsWUFBWSxDQUFDQyxTQUFTO01BQy9CL0MsV0FBVyxFQUFFO1FBQ1pxRCxPQUFPLEVBQUVQLFlBQVksQ0FBQ3VDLEtBQUs7UUFDM0J4RixLQUFLLEVBQUVpRCxZQUFZLENBQUNDLFNBQVM7UUFDN0J1QyxXQUFXLEVBQUV4QyxZQUFZLENBQUNDO01BQzNCO0lBQ0QsQ0FBQyxDQUNEO0lBQ0Q7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E1QixRQUFRLENBQUNoQyxPQUFPLENBQUMsVUFBVXVCLE9BQU8sRUFBRTtNQUFBO01BQ25Db0UsMkNBQTJDLENBQUMzRCxRQUFRLEVBQUVULE9BQU8sRUFBRTZCLGVBQWUsQ0FBQ2dELGdCQUFnQixFQUFFLENBQUM7TUFDbEcsd0JBQUE3RSxPQUFPLENBQUNWLFdBQVcseURBQW5CLHFCQUFxQmIsT0FBTyxDQUFDLFVBQVUyRSxVQUFVLEVBQUU7UUFBQTtRQUNsREEsVUFBVSxDQUFDakUsS0FBSyxHQUFHaUUsVUFBVSxDQUFDakUsS0FBSyxLQUFLLFdBQVcsR0FBR29DLFNBQVMsR0FBRzZCLFVBQVUsQ0FBQ2pFLEtBQUs7UUFDbEYsSUFBSWlFLFVBQVUsQ0FBQ00sSUFBSSxLQUFLLE9BQU8sNEJBQUlOLFVBQVUsQ0FBQ2MsT0FBTyxpREFBbEIscUJBQW9CM0YsTUFBTSxFQUFFO1VBQUE7VUFDOUQsTUFBTXVHLFNBQVMsR0FBRzFCLFVBQVUsQ0FBQ2MsT0FBTyxDQUFDYSxJQUFJLENBQ3ZDQyxPQUFPLElBQU1BLE9BQU8sQ0FBb0J0QixJQUFJLEtBQUt1QixjQUFjLENBQUNDLElBQUksQ0FDbkQ7O1VBRW5CO1VBQ0E7VUFDQTs7VUFFQSxJQUFJOUIsVUFBVSxDQUFDd0IsV0FBVyxFQUFFO1lBQzNCLElBQUlFLFNBQVMsRUFBRTtjQUNkO2NBQ0FBLFNBQVMsQ0FBQ0YsV0FBVyxHQUFHeEIsVUFBVSxDQUFDd0IsV0FBVztZQUMvQyxDQUFDLE1BQU07Y0FDTnhCLFVBQVUsQ0FBQ2MsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDVSxXQUFXLEdBQUd4QixVQUFVLENBQUN3QixXQUFXO1lBQzNEO1lBQ0F4QixVQUFVLENBQUN3QixXQUFXLEdBQUdyRCxTQUFTO1VBQ25DO1VBRUEsSUFBSXVELFNBQVMsZ0JBQUsxQixVQUFVLENBQW9CVCxPQUFPLHFDQUF0QyxTQUF3Q3BFLE1BQU0sRUFBRTtZQUNoRXVHLFNBQVMsQ0FBQ25DLE9BQU8sR0FBSVMsVUFBVSxDQUFvQlQsT0FBTztZQUN6RFMsVUFBVSxDQUFvQlQsT0FBTyxHQUFHLEVBQUU7VUFDNUM7UUFDRDtNQUNELENBQUMsQ0FBQztJQUNILENBQUMsQ0FBQztJQUNGLE9BQU9sQyxRQUFRO0VBQ2hCLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEE7RUFNQSxTQUFTMEUsZ0JBQWdCLENBQUMxSCxnQkFBa0MsRUFBVztJQUFBO0lBQ3RFLE1BQU1vRSxlQUFlLEdBQUdwRSxnQkFBZ0IsQ0FBQ3FFLGtCQUFrQixFQUFFO0lBQzdELE9BQ0MsQ0FBQywyQkFBQXJFLGdCQUFnQixDQUFDSyxhQUFhLEVBQUUsQ0FBQ0MsV0FBVyxxRkFBNUMsdUJBQThDQyxFQUFFLDJEQUFoRCx1QkFBa0RDLFlBQVksS0FBSSxFQUFFLEVBQUVNLE1BQU0sR0FBRyxDQUFDLElBQ2pGbUMsTUFBTSxDQUFDQyxJQUFJLENBQUNrQixlQUFlLENBQUN1RCxlQUFlLEVBQUUsQ0FBQyxDQUFDN0csTUFBTSxHQUFHLENBQUM7RUFFM0Q7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBUzhHLDhCQUE4QixDQUFDNUgsZ0JBQWtDLEVBQWlDO0lBQzFHLE1BQU1vRSxlQUFlLEdBQUdwRSxnQkFBZ0IsQ0FBQ3FFLGtCQUFrQixFQUFFO0lBQzdELE9BQU93RCxNQUFNLENBQ1osQ0FBQ0gsZ0JBQWdCLENBQUMxSCxnQkFBZ0IsQ0FBQyxFQUNuQzhILFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFDZkQsTUFBTSxDQUFDbEYsS0FBSyxDQUFDeUIsZUFBZSxDQUFDMkQsZ0JBQWdCLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRUQsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFcEYsR0FBRyxDQUFDbkMsRUFBRSxDQUFDcUIsVUFBVSxDQUFDLENBQUMsQ0FDNUY7RUFDRjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNb0csb0JBQW9CLEdBQUcsVUFBVWhJLGdCQUFrQyxFQUFvQztJQUNuSCxPQUFPMkIsaUJBQWlCLENBQUNpRyw4QkFBOEIsQ0FBQzVILGdCQUFnQixDQUFDLENBQUM7RUFDM0UsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQTtFQU1PLE1BQU1pSSx1QkFBdUIsR0FBRyxVQUFVakksZ0JBQWtDLEVBQW9DO0lBQ3RILE9BQU8yQixpQkFBaUIsQ0FBQ2UsR0FBRyxDQUFDa0YsOEJBQThCLENBQUM1SCxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7RUFDaEYsQ0FBQztFQUFDO0VBRUssTUFBTWtJLFdBQVcsR0FBRyxVQUFVbEksZ0JBQWtDLEVBQXdCO0lBQUE7SUFDOUYsTUFBTW9FLGVBQWUsR0FBR3BFLGdCQUFnQixDQUFDcUUsa0JBQWtCLEVBQUU7SUFDN0QsSUFBSTdDLGFBQTRDO0lBQ2hELE1BQU1PLFVBQXNCLEdBQUcvQixnQkFBZ0IsQ0FBQ0ssYUFBYSxFQUFFOztJQUUvRDtJQUNBLE1BQU1ELFlBQVksR0FBRzZFLG9CQUFvQixDQUN4Q2tELDhCQUE4QixDQUFDbkksZ0JBQWdCLENBQUMsRUFDaERvSSwyQkFBMkIsQ0FBQ2hFLGVBQWUsQ0FBQ3VELGVBQWUsRUFBRSxDQUFDLENBQzlEOztJQUVEO0lBQ0EsTUFBTTNDLGFBQWEsR0FBR2YsZ0JBQWdCLENBQUNqRSxnQkFBZ0IsQ0FBQzs7SUFFeEQ7SUFDQSxNQUFNeUYsYUFBYSxHQUFHSixnQkFBZ0IsQ0FBQ3JGLGdCQUFnQixDQUFDO0lBRXhELElBQUlvRSxlQUFlLENBQUMyRCxnQkFBZ0IsRUFBRSxLQUFLLDBCQUFBaEcsVUFBVSxDQUFDekIsV0FBVyxDQUFDQyxFQUFFLG1EQUF6Qix1QkFBMkJDLFlBQVksOEJBQUl1QixVQUFVLENBQUN6QixXQUFXLENBQUNDLEVBQUUsbURBQXpCLHVCQUEyQjhILFVBQVUsQ0FBQyxFQUFFO01BQzdIN0csYUFBYSxHQUFHekIsMkJBQTJCLENBQUNDLGdCQUFnQixFQUFFSSxZQUFZLENBQUM7SUFDNUU7SUFFQSxNQUFNNEMsUUFBUSxHQUFHaUUsV0FBVyxDQUFDakgsZ0JBQWdCLENBQUM7SUFFOUMsT0FBTztNQUNOc0ksUUFBUSxFQUFFQyxZQUFZLENBQUNDLFVBQVU7TUFDakNDLE1BQU0sRUFBRTtRQUNQdkgsT0FBTyxFQUFFa0QsZUFBZSxDQUFDc0UsdUJBQXVCLEVBQUU7UUFDbERuRyxPQUFPLEVBQUVmLGFBQWE7UUFDdEJtSCxNQUFNLEVBQUV2SSxZQUFZO1FBQ3BCOEUsT0FBTyxFQUFFRixhQUFhLENBQUNFLE9BQU87UUFDOUIwRCxXQUFXLEVBQUVaLG9CQUFvQixDQUFDaEksZ0JBQWdCLENBQUM7UUFDbkQ2SSxVQUFVLEVBQUVuQixnQkFBZ0IsQ0FBQzFILGdCQUFnQixDQUFDO1FBQzlDOEksTUFBTSxFQUFFQyxTQUFTLENBQUMvSSxnQkFBZ0IsQ0FBQztRQUNuQzBCLEtBQUssRUFBRTtVQUNOc0gsb0JBQW9CLEVBQUVmLHVCQUF1QixDQUFDakksZ0JBQWdCO1FBQy9EO01BQ0QsQ0FBQztNQUNEZ0QsUUFBUSxFQUFFQSxRQUFRO01BQ2xCeUMsYUFBYSxFQUFFQSxhQUFhLENBQUNQLE9BQU87TUFDcEMrRCxvQkFBb0IsRUFBRWpFLGFBQWEsQ0FBQ0ksY0FBYztNQUNsRDhELG9CQUFvQixFQUFFekQsYUFBYSxDQUFDTCxjQUFjO01BQ2xEK0QsYUFBYSxFQUFFL0UsZUFBZSxDQUFDZ0YsZ0JBQWdCLEVBQUU7TUFDakRDLGFBQWEsRUFBRWpGLGVBQWUsQ0FBQ2lGLGFBQWE7SUFDN0MsQ0FBQztFQUNGLENBQUM7RUFBQztFQUFBO0FBQUEifQ==