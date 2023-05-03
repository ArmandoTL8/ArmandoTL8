/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/TableFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "../../../helpers/BindingHelper", "../../../ManifestSettings"], function (tableFormatters, BindingToolkit, ModelHelper, DataModelPathHelper, BindingHelper, ManifestSettings) {
  "use strict";

  var _exports = {};
  var TemplateType = ManifestSettings.TemplateType;
  var CreationMode = ManifestSettings.CreationMode;
  var UI = BindingHelper.UI;
  var singletonPathVisitor = BindingHelper.singletonPathVisitor;
  var isPathUpdatable = DataModelPathHelper.isPathUpdatable;
  var isPathInsertable = DataModelPathHelper.isPathInsertable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var notEqual = BindingToolkit.notEqual;
  var not = BindingToolkit.not;
  var length = BindingToolkit.length;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var greaterThan = BindingToolkit.greaterThan;
  var greaterOrEqual = BindingToolkit.greaterOrEqual;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var AnnotationHiddenProperty;
  (function (AnnotationHiddenProperty) {
    AnnotationHiddenProperty["CreateHidden"] = "CreateHidden";
    AnnotationHiddenProperty["DeleteHidden"] = "DeleteHidden";
    AnnotationHiddenProperty["UpdateHidden"] = "UpdateHidden";
  })(AnnotationHiddenProperty || (AnnotationHiddenProperty = {}));
  /**
   * Generates the context for the standard actions.
   *
   * @param converterContext
   * @param creationMode
   * @param tableManifestConfiguration
   * @param viewConfiguration
   * @returns  The context for table actions
   */
  function generateStandardActionsContext(converterContext, creationMode, tableManifestConfiguration, viewConfiguration) {
    return {
      collectionPath: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      hiddenAnnotation: {
        create: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.CreateHidden),
        delete: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.DeleteHidden),
        update: isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.UpdateHidden)
      },
      creationMode: creationMode,
      isDraftOrStickySupported: isDraftOrStickySupported(converterContext),
      isViewWithMultipleVisualizations: viewConfiguration ? converterContext.getManifestWrapper().hasMultipleVisualizations(viewConfiguration) : false,
      newAction: getNewAction(converterContext),
      tableManifestConfiguration: tableManifestConfiguration,
      restrictions: getRestrictions(converterContext)
    };
  }

  /**
   * Checks if sticky or draft is supported.
   *
   * @param converterContext
   * @returns `true` if it is supported
   */
  _exports.generateStandardActionsContext = generateStandardActionsContext;
  function isDraftOrStickySupported(converterContext) {
    var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3;
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    const bIsDraftSupported = ModelHelper.isObjectPathDraftSupported(dataModelObjectPath);
    const bIsStickySessionSupported = (_dataModelObjectPath$ = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$ !== void 0 && (_dataModelObjectPath$2 = _dataModelObjectPath$.annotations) !== null && _dataModelObjectPath$2 !== void 0 && (_dataModelObjectPath$3 = _dataModelObjectPath$2.Session) !== null && _dataModelObjectPath$3 !== void 0 && _dataModelObjectPath$3.StickySessionSupported ? true : false;
    return bIsDraftSupported || bIsStickySessionSupported;
  }

  /**
   * Gets the configured newAction into annotation.
   *
   * @param converterContext
   * @returns The new action info
   */
  _exports.isDraftOrStickySupported = isDraftOrStickySupported;
  function getNewAction(converterContext) {
    var _annotations, _annotations$Common, _annotations$Common$D, _annotations2, _annotations2$Session, _annotations2$Session2;
    const currentEntitySet = converterContext.getEntitySet();
    const newAction = !ModelHelper.isSingleton(currentEntitySet) ? (currentEntitySet === null || currentEntitySet === void 0 ? void 0 : (_annotations = currentEntitySet.annotations) === null || _annotations === void 0 ? void 0 : (_annotations$Common = _annotations.Common) === null || _annotations$Common === void 0 ? void 0 : (_annotations$Common$D = _annotations$Common.DraftRoot) === null || _annotations$Common$D === void 0 ? void 0 : _annotations$Common$D.NewAction) || (currentEntitySet === null || currentEntitySet === void 0 ? void 0 : (_annotations2 = currentEntitySet.annotations) === null || _annotations2 === void 0 ? void 0 : (_annotations2$Session = _annotations2.Session) === null || _annotations2$Session === void 0 ? void 0 : (_annotations2$Session2 = _annotations2$Session.StickySessionSupported) === null || _annotations2$Session2 === void 0 ? void 0 : _annotations2$Session2.NewAction) : undefined;
    const newActionName = newAction === null || newAction === void 0 ? void 0 : newAction.toString();
    if (newActionName) {
      var _converterContext$get, _converterContext$get2, _converterContext$get3;
      let availableProperty = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get = converterContext.getEntityType().actions[newActionName]) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.annotations) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.Core) === null || _converterContext$get3 === void 0 ? void 0 : _converterContext$get3.OperationAvailable;
      availableProperty = availableProperty !== undefined ? availableProperty : true;
      return {
        name: newActionName,
        available: getExpressionFromAnnotation(availableProperty)
      };
    }
    return undefined;
  }

  /**
   * Gets the binding expression for the action visibility configured into annotation.
   *
   * @param converterContext
   * @param sAnnotationTerm
   * @param bWithNavigationPath
   * @returns The binding expression for the action visibility
   */
  _exports.getNewAction = getNewAction;
  function isActionAnnotatedHidden(converterContext, sAnnotationTerm) {
    var _currentEntitySet$ann;
    let bWithNavigationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    const currentEntitySet = converterContext.getEntitySet();
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    // Consider only the last level of navigation. The others are already considered in the element binding of the page.
    const visitedNavigationPaths = dataModelObjectPath.navigationProperties.length > 0 && bWithNavigationPath ? [dataModelObjectPath.navigationProperties[dataModelObjectPath.navigationProperties.length - 1].name] : [];
    const actionAnnotationValue = (currentEntitySet === null || currentEntitySet === void 0 ? void 0 : (_currentEntitySet$ann = currentEntitySet.annotations.UI) === null || _currentEntitySet$ann === void 0 ? void 0 : _currentEntitySet$ann[sAnnotationTerm]) || false;
    return currentEntitySet ? getExpressionFromAnnotation(actionAnnotationValue, visitedNavigationPaths, undefined, path => singletonPathVisitor(path, converterContext.getConvertedTypes(), visitedNavigationPaths)) : constant(false);
  }

  /**
   * Gets the annotated restrictions for the actions.
   *
   * @param converterContext
   * @returns The restriction information
   */
  _exports.isActionAnnotatedHidden = isActionAnnotatedHidden;
  function getRestrictions(converterContext) {
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    const restrictionsDef = [{
      key: "isInsertable",
      function: isPathInsertable
    }, {
      key: "isUpdatable",
      function: isPathUpdatable
    }, {
      key: "isDeletable",
      function: isPathDeletable
    }];
    const result = {};
    restrictionsDef.forEach(function (def) {
      const defFunction = def["function"];
      result[def.key] = {
        expression: defFunction.apply(null, [dataModelObjectPath, {
          pathVisitor: (path, navigationPaths) => singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths)
        }]),
        navigationExpression: defFunction.apply(null, [dataModelObjectPath, {
          ignoreTargetCollection: true,
          authorizeUnresolvable: true,
          pathVisitor: (path, navigationPaths) => singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths)
        }])
      };
    });
    return result;
  }

  /**
   * Checks if templating for insert/update actions is mandatory.
   *
   * @param standardActionsContext
   * @param isDraftOrSticky
   * @param isCreateAlwaysHidden
   * @returns The
   */
  _exports.getRestrictions = getRestrictions;
  function getInsertUpdateActionsTemplating(standardActionsContext, isDraftOrSticky, isCreateAlwaysHidden) {
    return (isDraftOrSticky || standardActionsContext.creationMode === CreationMode.External) && !isCreateAlwaysHidden;
  }

  /**
   * Gets the binding expressions for the properties of the 'Create' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The standard action info
   */
  _exports.getInsertUpdateActionsTemplating = getInsertUpdateActionsTemplating;
  function getStandardActionCreate(converterContext, standardActionsContext) {
    const createVisibility = getCreateVisibility(converterContext, standardActionsContext);
    return {
      isTemplated: compileExpression(getCreateTemplating(standardActionsContext, createVisibility)),
      visible: compileExpression(createVisibility),
      enabled: compileExpression(getCreateEnablement(converterContext, standardActionsContext, createVisibility))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'Delete' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expressions for the properties of the 'Delete' action.
   */
  _exports.getStandardActionCreate = getStandardActionCreate;
  function getStandardActionDelete(converterContext, standardActionsContext) {
    const deleteVisibility = getDeleteVisibility(converterContext, standardActionsContext);
    return {
      isTemplated: compileExpression(getDefaultTemplating(deleteVisibility)),
      visible: compileExpression(deleteVisibility),
      enabled: compileExpression(getDeleteEnablement(converterContext, standardActionsContext, deleteVisibility))
    };
  }

  /**
   * @param converterContext
   * @param standardActionsContext
   * @returns StandardActionConfigType
   */
  _exports.getStandardActionDelete = getStandardActionDelete;
  function getCreationRow(converterContext, standardActionsContext) {
    const creationRowVisibility = getCreateVisibility(converterContext, standardActionsContext, true);
    return {
      isTemplated: compileExpression(getCreateTemplating(standardActionsContext, creationRowVisibility, true)),
      visible: compileExpression(creationRowVisibility),
      enabled: compileExpression(getCreationRowEnablement(converterContext, standardActionsContext, creationRowVisibility))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'Paste' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param isInsertUpdateActionsTemplated
   * @returns The binding expressions for the properties of the 'Paste' action.
   */
  _exports.getCreationRow = getCreationRow;
  function getStandardActionPaste(converterContext, standardActionsContext, isInsertUpdateActionsTemplated) {
    const createVisibility = getCreateVisibility(converterContext, standardActionsContext);
    const createEnablement = getCreateEnablement(converterContext, standardActionsContext, createVisibility);
    const pasteVisibility = getPasteVisibility(converterContext, standardActionsContext, createVisibility, isInsertUpdateActionsTemplated);
    return {
      visible: compileExpression(pasteVisibility),
      enabled: compileExpression(getPasteEnablement(pasteVisibility, createEnablement))
    };
  }

  /**
   * Gets the binding expressions for the properties of the 'MassEdit' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expressions for the properties of the 'MassEdit' action.
   */
  _exports.getStandardActionPaste = getStandardActionPaste;
  function getStandardActionMassEdit(converterContext, standardActionsContext) {
    const massEditVisibility = getMassEditVisibility(converterContext, standardActionsContext);
    return {
      isTemplated: compileExpression(getDefaultTemplating(massEditVisibility)),
      visible: compileExpression(massEditVisibility),
      enabled: compileExpression(getMassEditEnablement(converterContext, standardActionsContext, massEditVisibility))
    };
  }

  /**
   * Gets the binding expression for the templating of the 'Create' action.
   *
   * @param standardActionsContext
   * @param createVisibility
   * @param isForCreationRow
   * @returns The create binding expression
   */
  _exports.getStandardActionMassEdit = getStandardActionMassEdit;
  function getCreateTemplating(standardActionsContext, createVisibility) {
    let isForCreationRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    //Templating of Create Button is not done:
    // 	 - If Button is never visible(covered the External create button, new Action)
    //	 - or CreationMode is on CreationRow for Create Button
    //	 - or CreationMode is not on CreationRow for CreationRow Button

    return and(
    //XNOR gate
    or(and(isForCreationRow, standardActionsContext.creationMode === CreationMode.CreationRow), and(!isForCreationRow, standardActionsContext.creationMode !== CreationMode.CreationRow)), or(not(isConstant(createVisibility)), createVisibility));
  }

  /**
   * Gets the binding expression for the templating of the non-Create actions.
   *
   * @param actionVisibility
   * @returns The binding expression for the templating of the non-Create actions.
   */
  _exports.getCreateTemplating = getCreateTemplating;
  function getDefaultTemplating(actionVisibility) {
    return or(not(isConstant(actionVisibility)), actionVisibility);
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'Create' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param isForCreationRow
   * @returns The binding expression for the 'visible' property of the 'Create' action.
   */
  _exports.getDefaultTemplating = getDefaultTemplating;
  function getCreateVisibility(converterContext, standardActionsContext) {
    var _standardActionsConte, _standardActionsConte2;
    let isForCreationRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const isInsertable = standardActionsContext.restrictions.isInsertable.expression;
    const isCreateHidden = isForCreationRow ? isActionAnnotatedHidden(converterContext, AnnotationHiddenProperty.CreateHidden, false) : standardActionsContext.hiddenAnnotation.create;
    const newAction = standardActionsContext.newAction;
    //Create Button is visible:
    // 	 - If the creation mode is external
    //      - If we're on the list report and create is not hidden
    //		- Otherwise this depends on the value of the UI.IsEditable
    //	 - Otherwise
    //		- If any of the following conditions is valid then create button isn't visible
    //			- no newAction available
    //			- It's not insertable and there is not a new action
    //			- create is hidden
    //			- There are multiple visualizations
    //			- It's an Analytical List Page
    //			- Uses InlineCreationRows mode and a Responsive table type, with the parameter inlineCreationRowsHiddenInEditMode to true while not in create mode
    //   - Otherwise
    // 	 	- If we're on the list report ->
    // 	 		- If UI.CreateHidden points to a property path -> provide a negated binding to this path
    // 	 		- Otherwise, create is visible
    // 	 	- Otherwise
    // 	  	 - This depends on the value of the UI.IsEditable
    return ifElse(standardActionsContext.creationMode === CreationMode.External, and(not(isCreateHidden), or(converterContext.getTemplateType() === TemplateType.ListReport, UI.IsEditable)), ifElse(or(and(isConstant(newAction === null || newAction === void 0 ? void 0 : newAction.available), equal(newAction === null || newAction === void 0 ? void 0 : newAction.available, false)), and(isConstant(isInsertable), equal(isInsertable, false), !newAction), and(isConstant(isCreateHidden), equal(isCreateHidden, true)), and(standardActionsContext.creationMode === CreationMode.InlineCreationRows, ((_standardActionsConte = standardActionsContext.tableManifestConfiguration) === null || _standardActionsConte === void 0 ? void 0 : _standardActionsConte.type) === "ResponsiveTable", ifElse((standardActionsContext === null || standardActionsContext === void 0 ? void 0 : (_standardActionsConte2 = standardActionsContext.tableManifestConfiguration) === null || _standardActionsConte2 === void 0 ? void 0 : _standardActionsConte2.inlineCreationRowsHiddenInEditMode) === false, true, UI.IsCreateMode))), false, ifElse(converterContext.getTemplateType() === TemplateType.ListReport, or(not(isPathInModelExpression(isCreateHidden)), not(isCreateHidden)), and(not(isCreateHidden), UI.IsEditable))));
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'Delete' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expression for the 'visible' property of the 'Delete' action.
   */
  _exports.getCreateVisibility = getCreateVisibility;
  function getDeleteVisibility(converterContext, standardActionsContext) {
    const isDeleteHidden = standardActionsContext.hiddenAnnotation.delete;
    const pathDeletableExpression = standardActionsContext.restrictions.isDeletable.expression;

    //Delete Button is visible:
    // 	 Prerequisites:
    //	 - If we're not on ALP
    //   - If restrictions on deletable set to false -> not visible
    //   - Otherwise
    //			- If UI.DeleteHidden is true -> not visible
    //			- Otherwise
    // 	 			- If we're on OP -> depending if UI is editable and restrictions on deletable
    //				- Otherwise
    //				 	- If UI.DeleteHidden points to a property path -> provide a negated binding to this path
    //	 	 		 	- Otherwise, delete is visible

    return ifElse(converterContext.getTemplateType() === TemplateType.AnalyticalListPage, false, ifElse(and(isConstant(pathDeletableExpression), equal(pathDeletableExpression, false)), false, ifElse(and(isConstant(isDeleteHidden), equal(isDeleteHidden, constant(true))), false, ifElse(converterContext.getTemplateType() !== TemplateType.ListReport, and(not(isDeleteHidden), UI.IsEditable), not(and(isPathInModelExpression(isDeleteHidden), isDeleteHidden))))));
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'Paste' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param createVisibility
   * @param isInsertUpdateActionsTemplated
   * @returns The binding expression for the 'visible' property of the 'Paste' action.
   */
  _exports.getDeleteVisibility = getDeleteVisibility;
  function getPasteVisibility(converterContext, standardActionsContext, createVisibility, isInsertUpdateActionsTemplated) {
    // If Create is visible, enablePaste is not disabled into manifest and we are on OP/blocks outside Fiori elements templates
    // Then button will be visible according to insertable restrictions and create visibility
    // Otherwise it's not visible
    return and(notEqual(standardActionsContext.tableManifestConfiguration.enablePaste, false), createVisibility, isInsertUpdateActionsTemplated, [TemplateType.ListReport, TemplateType.AnalyticalListPage].indexOf(converterContext.getTemplateType()) === -1, standardActionsContext.restrictions.isInsertable.expression);
  }

  /**
   * Gets the binding expression for the 'visible' property of the 'MassEdit' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @returns The binding expression for the 'visible' property of the 'MassEdit' action.
   */
  _exports.getPasteVisibility = getPasteVisibility;
  function getMassEditVisibility(converterContext, standardActionsContext) {
    var _standardActionsConte3;
    const isUpdateHidden = standardActionsContext.hiddenAnnotation.update,
      pathUpdatableExpression = standardActionsContext.restrictions.isUpdatable.expression,
      bMassEditEnabledInManifest = ((_standardActionsConte3 = standardActionsContext.tableManifestConfiguration) === null || _standardActionsConte3 === void 0 ? void 0 : _standardActionsConte3.enableMassEdit) || false;
    const templateBindingExpression = converterContext.getTemplateType() === TemplateType.ObjectPage ? UI.IsEditable : converterContext.getTemplateType() === TemplateType.ListReport;
    //MassEdit is visible
    // If
    //		- there is no static restrictions set to false
    //		- and enableMassEdit is not set to false into the manifest
    //		- and the selectionMode is relevant
    //	Then MassEdit is always visible in LR or dynamically visible in OP according to ui>Editable and hiddenAnnotation
    //  Button is hidden for all other cases
    return and(not(and(isConstant(pathUpdatableExpression), equal(pathUpdatableExpression, false))), bMassEditEnabledInManifest, templateBindingExpression, not(isUpdateHidden));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the creationRow.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param creationRowVisibility
   * @returns The binding expression for the 'enabled' property of the creationRow.
   */
  _exports.getMassEditVisibility = getMassEditVisibility;
  function getCreationRowEnablement(converterContext, standardActionsContext, creationRowVisibility) {
    const restrictionsInsertable = isPathInsertable(converterContext.getDataModelObjectPath(), {
      ignoreTargetCollection: true,
      authorizeUnresolvable: true,
      pathVisitor: (path, navigationPaths) => {
        if (path.indexOf("/") === 0) {
          path = singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths);
          return path;
        }
        const navigationProperties = converterContext.getDataModelObjectPath().navigationProperties;
        if (navigationProperties) {
          const lastNav = navigationProperties[navigationProperties.length - 1];
          const partner = lastNav._type === "NavigationProperty" && lastNav.partner;
          if (partner) {
            path = `${partner}/${path}`;
          }
        }
        return path;
      }
    });
    const isInsertable = restrictionsInsertable._type === "Unresolvable" ? isPathInsertable(converterContext.getDataModelObjectPath(), {
      pathVisitor: path => singletonPathVisitor(path, converterContext.getConvertedTypes(), [])
    }) : restrictionsInsertable;
    return and(creationRowVisibility, isInsertable, or(!standardActionsContext.tableManifestConfiguration.disableAddRowButtonForEmptyData, formatResult([pathInModel("creationRowFieldValidity", "internal")], tableFormatters.validateCreationRowFields)));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'Create' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param createVisibility
   * @returns The binding expression for the 'enabled' property of the 'Create' action.
   */
  _exports.getCreationRowEnablement = getCreationRowEnablement;
  function getCreateEnablement(converterContext, standardActionsContext, createVisibility) {
    var _converterContext$res;
    const isInsertable = standardActionsContext.restrictions.isInsertable.expression;
    const CollectionType = (_converterContext$res = converterContext.resolveAbsolutePath(standardActionsContext.collectionPath).target) === null || _converterContext$res === void 0 ? void 0 : _converterContext$res._type;
    return and(createVisibility, or(CollectionType === "EntitySet", and(isInsertable, or(converterContext.getTemplateType() !== TemplateType.ObjectPage, UI.IsEditable))));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'Delete' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param deleteVisibility
   * @returns The binding expression for the 'enabled' property of the 'Delete' action.
   */
  _exports.getCreateEnablement = getCreateEnablement;
  function getDeleteEnablement(converterContext, standardActionsContext, deleteVisibility) {
    const deletableContexts = pathInModel("deletableContexts", "internal");
    const unSavedContexts = pathInModel("unSavedContexts", "internal");
    const draftsWithDeletableActive = pathInModel("draftsWithDeletableActive", "internal");
    const draftsWithNonDeletableActive = pathInModel("draftsWithNonDeletableActive", "internal");
    return and(deleteVisibility, ifElse(converterContext.getTemplateType() === TemplateType.ObjectPage, or(and(notEqual(deletableContexts, undefined), greaterThan(length(deletableContexts), 0)), and(notEqual(draftsWithDeletableActive, undefined), greaterThan(length(draftsWithDeletableActive), 0))), or(and(notEqual(deletableContexts, undefined), greaterThan(length(deletableContexts), 0)), and(notEqual(draftsWithDeletableActive, undefined), greaterThan(length(draftsWithDeletableActive), 0)),
    // on LR, also enable delete button to cancel drafts
    and(notEqual(draftsWithNonDeletableActive, undefined), greaterThan(length(draftsWithNonDeletableActive), 0)),
    // deletable contexts with unsaved changes are counted separately (LR only)
    and(notEqual(unSavedContexts, undefined), greaterThan(length(unSavedContexts), 0)))));
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'Paste' action.
   *
   * @param pasteVisibility
   * @param createEnablement
   * @returns The binding expression for the 'enabled' property of the 'Paste' action.
   */
  _exports.getDeleteEnablement = getDeleteEnablement;
  function getPasteEnablement(pasteVisibility, createEnablement) {
    return and(pasteVisibility, createEnablement);
  }

  /**
   * Gets the binding expression for the 'enabled' property of the 'MassEdit' action.
   *
   * @param converterContext
   * @param standardActionsContext
   * @param massEditVisibility
   * @returns The binding expression for the 'enabled' property of the 'MassEdit' action.
   */
  _exports.getPasteEnablement = getPasteEnablement;
  function getMassEditEnablement(converterContext, standardActionsContext, massEditVisibility) {
    const pathUpdatableExpression = standardActionsContext.restrictions.isUpdatable.expression;
    const isOnlyDynamicOnCurrentEntity = !isConstant(pathUpdatableExpression) && standardActionsContext.restrictions.isUpdatable.navigationExpression._type === "Unresolvable";
    const numberOfSelectedContexts = greaterOrEqual(pathInModel("numberOfSelectedContexts", "internal"), 1);
    const numberOfUpdatableContexts = greaterOrEqual(length(pathInModel("updatableContexts", "internal")), 1);
    const bIsDraftSupported = ModelHelper.isObjectPathDraftSupported(converterContext.getDataModelObjectPath());
    const bDisplayMode = isInDisplayMode(converterContext);

    // numberOfUpdatableContexts needs to be added to the binding in case
    // 1. Update is dependent on current entity property (isOnlyDynamicOnCurrentEntity is true).
    // 2. The table is read only and draft enabled(like LR), in this case only active contexts can be mass edited.
    //    So, update depends on 'IsActiveEntity' value which needs to be checked runtime.
    const runtimeBinding = ifElse(or(and(bDisplayMode, bIsDraftSupported), isOnlyDynamicOnCurrentEntity), and(numberOfSelectedContexts, numberOfUpdatableContexts), and(numberOfSelectedContexts));
    return and(massEditVisibility, ifElse(isOnlyDynamicOnCurrentEntity, runtimeBinding, and(runtimeBinding, pathUpdatableExpression)));
  }

  /**
   * Tells if the table in template is in display mode.
   *
   * @param converterContext
   * @param viewConfiguration
   * @returns `true` if the table is in display mode
   */
  _exports.getMassEditEnablement = getMassEditEnablement;
  function isInDisplayMode(converterContext, viewConfiguration) {
    const templateType = converterContext.getTemplateType();
    if (templateType === TemplateType.ListReport || templateType === TemplateType.AnalyticalListPage || viewConfiguration && converterContext.getManifestWrapper().hasMultipleVisualizations(viewConfiguration)) {
      return true;
    }
    // updatable will be handled at the property level
    return false;
  }
  _exports.isInDisplayMode = isInDisplayMode;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbm5vdGF0aW9uSGlkZGVuUHJvcGVydHkiLCJnZW5lcmF0ZVN0YW5kYXJkQWN0aW9uc0NvbnRleHQiLCJjb252ZXJ0ZXJDb250ZXh0IiwiY3JlYXRpb25Nb2RlIiwidGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24iLCJ2aWV3Q29uZmlndXJhdGlvbiIsImNvbGxlY3Rpb25QYXRoIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJoaWRkZW5Bbm5vdGF0aW9uIiwiY3JlYXRlIiwiaXNBY3Rpb25Bbm5vdGF0ZWRIaWRkZW4iLCJDcmVhdGVIaWRkZW4iLCJkZWxldGUiLCJEZWxldGVIaWRkZW4iLCJ1cGRhdGUiLCJVcGRhdGVIaWRkZW4iLCJpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQiLCJpc1ZpZXdXaXRoTXVsdGlwbGVWaXN1YWxpemF0aW9ucyIsImdldE1hbmlmZXN0V3JhcHBlciIsImhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMiLCJuZXdBY3Rpb24iLCJnZXROZXdBY3Rpb24iLCJyZXN0cmljdGlvbnMiLCJnZXRSZXN0cmljdGlvbnMiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwiYklzRHJhZnRTdXBwb3J0ZWQiLCJNb2RlbEhlbHBlciIsImlzT2JqZWN0UGF0aERyYWZ0U3VwcG9ydGVkIiwiYklzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsInN0YXJ0aW5nRW50aXR5U2V0IiwiYW5ub3RhdGlvbnMiLCJTZXNzaW9uIiwiU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsImN1cnJlbnRFbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJpc1NpbmdsZXRvbiIsIkNvbW1vbiIsIkRyYWZ0Um9vdCIsIk5ld0FjdGlvbiIsInVuZGVmaW5lZCIsIm5ld0FjdGlvbk5hbWUiLCJ0b1N0cmluZyIsImF2YWlsYWJsZVByb3BlcnR5IiwiZ2V0RW50aXR5VHlwZSIsImFjdGlvbnMiLCJDb3JlIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwibmFtZSIsImF2YWlsYWJsZSIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsInNBbm5vdGF0aW9uVGVybSIsImJXaXRoTmF2aWdhdGlvblBhdGgiLCJ2aXNpdGVkTmF2aWdhdGlvblBhdGhzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJsZW5ndGgiLCJhY3Rpb25Bbm5vdGF0aW9uVmFsdWUiLCJVSSIsInBhdGgiLCJzaW5nbGV0b25QYXRoVmlzaXRvciIsImdldENvbnZlcnRlZFR5cGVzIiwiY29uc3RhbnQiLCJyZXN0cmljdGlvbnNEZWYiLCJrZXkiLCJmdW5jdGlvbiIsImlzUGF0aEluc2VydGFibGUiLCJpc1BhdGhVcGRhdGFibGUiLCJpc1BhdGhEZWxldGFibGUiLCJyZXN1bHQiLCJmb3JFYWNoIiwiZGVmIiwiZGVmRnVuY3Rpb24iLCJleHByZXNzaW9uIiwiYXBwbHkiLCJwYXRoVmlzaXRvciIsIm5hdmlnYXRpb25QYXRocyIsIm5hdmlnYXRpb25FeHByZXNzaW9uIiwiaWdub3JlVGFyZ2V0Q29sbGVjdGlvbiIsImF1dGhvcml6ZVVucmVzb2x2YWJsZSIsImdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nIiwic3RhbmRhcmRBY3Rpb25zQ29udGV4dCIsImlzRHJhZnRPclN0aWNreSIsImlzQ3JlYXRlQWx3YXlzSGlkZGVuIiwiQ3JlYXRpb25Nb2RlIiwiRXh0ZXJuYWwiLCJnZXRTdGFuZGFyZEFjdGlvbkNyZWF0ZSIsImNyZWF0ZVZpc2liaWxpdHkiLCJnZXRDcmVhdGVWaXNpYmlsaXR5IiwiaXNUZW1wbGF0ZWQiLCJjb21waWxlRXhwcmVzc2lvbiIsImdldENyZWF0ZVRlbXBsYXRpbmciLCJ2aXNpYmxlIiwiZW5hYmxlZCIsImdldENyZWF0ZUVuYWJsZW1lbnQiLCJnZXRTdGFuZGFyZEFjdGlvbkRlbGV0ZSIsImRlbGV0ZVZpc2liaWxpdHkiLCJnZXREZWxldGVWaXNpYmlsaXR5IiwiZ2V0RGVmYXVsdFRlbXBsYXRpbmciLCJnZXREZWxldGVFbmFibGVtZW50IiwiZ2V0Q3JlYXRpb25Sb3ciLCJjcmVhdGlvblJvd1Zpc2liaWxpdHkiLCJnZXRDcmVhdGlvblJvd0VuYWJsZW1lbnQiLCJnZXRTdGFuZGFyZEFjdGlvblBhc3RlIiwiaXNJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGVkIiwiY3JlYXRlRW5hYmxlbWVudCIsInBhc3RlVmlzaWJpbGl0eSIsImdldFBhc3RlVmlzaWJpbGl0eSIsImdldFBhc3RlRW5hYmxlbWVudCIsImdldFN0YW5kYXJkQWN0aW9uTWFzc0VkaXQiLCJtYXNzRWRpdFZpc2liaWxpdHkiLCJnZXRNYXNzRWRpdFZpc2liaWxpdHkiLCJnZXRNYXNzRWRpdEVuYWJsZW1lbnQiLCJpc0ZvckNyZWF0aW9uUm93IiwiYW5kIiwib3IiLCJDcmVhdGlvblJvdyIsIm5vdCIsImlzQ29uc3RhbnQiLCJhY3Rpb25WaXNpYmlsaXR5IiwiaXNJbnNlcnRhYmxlIiwiaXNDcmVhdGVIaWRkZW4iLCJpZkVsc2UiLCJnZXRUZW1wbGF0ZVR5cGUiLCJUZW1wbGF0ZVR5cGUiLCJMaXN0UmVwb3J0IiwiSXNFZGl0YWJsZSIsImVxdWFsIiwiSW5saW5lQ3JlYXRpb25Sb3dzIiwidHlwZSIsImlubGluZUNyZWF0aW9uUm93c0hpZGRlbkluRWRpdE1vZGUiLCJJc0NyZWF0ZU1vZGUiLCJpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbiIsImlzRGVsZXRlSGlkZGVuIiwicGF0aERlbGV0YWJsZUV4cHJlc3Npb24iLCJpc0RlbGV0YWJsZSIsIkFuYWx5dGljYWxMaXN0UGFnZSIsIm5vdEVxdWFsIiwiZW5hYmxlUGFzdGUiLCJpbmRleE9mIiwiaXNVcGRhdGVIaWRkZW4iLCJwYXRoVXBkYXRhYmxlRXhwcmVzc2lvbiIsImlzVXBkYXRhYmxlIiwiYk1hc3NFZGl0RW5hYmxlZEluTWFuaWZlc3QiLCJlbmFibGVNYXNzRWRpdCIsInRlbXBsYXRlQmluZGluZ0V4cHJlc3Npb24iLCJPYmplY3RQYWdlIiwicmVzdHJpY3Rpb25zSW5zZXJ0YWJsZSIsImxhc3ROYXYiLCJwYXJ0bmVyIiwiX3R5cGUiLCJkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhIiwiZm9ybWF0UmVzdWx0IiwicGF0aEluTW9kZWwiLCJ0YWJsZUZvcm1hdHRlcnMiLCJ2YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzIiwiQ29sbGVjdGlvblR5cGUiLCJyZXNvbHZlQWJzb2x1dGVQYXRoIiwidGFyZ2V0IiwiZGVsZXRhYmxlQ29udGV4dHMiLCJ1blNhdmVkQ29udGV4dHMiLCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlIiwiZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSIsImdyZWF0ZXJUaGFuIiwiaXNPbmx5RHluYW1pY09uQ3VycmVudEVudGl0eSIsIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyIsImdyZWF0ZXJPckVxdWFsIiwibnVtYmVyT2ZVcGRhdGFibGVDb250ZXh0cyIsImJEaXNwbGF5TW9kZSIsImlzSW5EaXNwbGF5TW9kZSIsInJ1bnRpbWVCaW5kaW5nIiwidGVtcGxhdGVUeXBlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTdGFuZGFyZEFjdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXQsIFByb3BlcnR5QW5ub3RhdGlvblZhbHVlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdGFibGVGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1RhYmxlRm9ybWF0dGVyXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGVxdWFsLFxuXHRmb3JtYXRSZXN1bHQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0Z3JlYXRlck9yRXF1YWwsXG5cdGdyZWF0ZXJUaGFuLFxuXHRpZkVsc2UsXG5cdGlzQ29uc3RhbnQsXG5cdGlzUGF0aEluTW9kZWxFeHByZXNzaW9uLFxuXHRsZW5ndGgsXG5cdG5vdCxcblx0bm90RXF1YWwsXG5cdG9yLFxuXHRwYXRoSW5Nb2RlbFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRUYXJnZXRPYmplY3RQYXRoLCBpc1BhdGhEZWxldGFibGUsIGlzUGF0aEluc2VydGFibGUsIGlzUGF0aFVwZGF0YWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IHNpbmdsZXRvblBhdGhWaXNpdG9yLCBVSSB9IGZyb20gXCIuLi8uLi8uLi9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgVmlld1BhdGhDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IENyZWF0aW9uTW9kZSwgVGVtcGxhdGVUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB0eXBlIHsgVGFibGVDb250cm9sQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9UYWJsZVwiO1xuXG5lbnVtIEFubm90YXRpb25IaWRkZW5Qcm9wZXJ0eSB7XG5cdENyZWF0ZUhpZGRlbiA9IFwiQ3JlYXRlSGlkZGVuXCIsXG5cdERlbGV0ZUhpZGRlbiA9IFwiRGVsZXRlSGlkZGVuXCIsXG5cdFVwZGF0ZUhpZGRlbiA9IFwiVXBkYXRlSGlkZGVuXCJcbn1cblxuZXhwb3J0IHR5cGUgU3RhbmRhcmRBY3Rpb25Db25maWdUeXBlID0ge1xuXHRpc1RlbXBsYXRlZD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR2aXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0ZW5hYmxlZDogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG59O1xuXG50eXBlIEV4cHJlc3Npb25SZXN0cmljdGlvbnNUeXBlID0ge1xuXHRleHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdG5hdmlnYXRpb25FeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG59O1xudHlwZSBTdGFuZGFyZEFjdGlvbnNSZXN0cmljdGlvbnNUeXBlID0gUmVjb3JkPHN0cmluZywgRXhwcmVzc2lvblJlc3RyaWN0aW9uc1R5cGU+O1xuXG5leHBvcnQgdHlwZSBTdGFuZGFyZEFjdGlvbnNDb250ZXh0ID0ge1xuXHRjb2xsZWN0aW9uUGF0aDogc3RyaW5nO1xuXHRoaWRkZW5Bbm5vdGF0aW9uOiB7XG5cdFx0Y3JlYXRlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdFx0ZGVsZXRlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdFx0dXBkYXRlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdH07XG5cdGNyZWF0aW9uTW9kZTogQ3JlYXRpb25Nb2RlO1xuXHRpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQ6IGJvb2xlYW47XG5cdGlzVmlld1dpdGhNdWx0aXBsZVZpc3VhbGl6YXRpb25zOiBib29sZWFuO1xuXHRuZXdBY3Rpb24/OiB7XG5cdFx0bmFtZT86IHN0cmluZztcblx0XHRhdmFpbGFibGU/OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdH07XG5cdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uO1xuXHRyZXN0cmljdGlvbnM6IFN0YW5kYXJkQWN0aW9uc1Jlc3RyaWN0aW9uc1R5cGU7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgY29udGV4dCBmb3IgdGhlIHN0YW5kYXJkIGFjdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBjcmVhdGlvbk1vZGVcbiAqIEBwYXJhbSB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvblxuICogQHBhcmFtIHZpZXdDb25maWd1cmF0aW9uXG4gKiBAcmV0dXJucyAgVGhlIGNvbnRleHQgZm9yIHRhYmxlIGFjdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU3RhbmRhcmRBY3Rpb25zQ29udGV4dChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0Y3JlYXRpb25Nb2RlOiBDcmVhdGlvbk1vZGUsXG5cdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uLFxuXHR2aWV3Q29uZmlndXJhdGlvbj86IFZpZXdQYXRoQ29uZmlndXJhdGlvblxuKTogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCB7XG5cdHJldHVybiB7XG5cdFx0Y29sbGVjdGlvblBhdGg6IGdldFRhcmdldE9iamVjdFBhdGgoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpLFxuXHRcdGhpZGRlbkFubm90YXRpb246IHtcblx0XHRcdGNyZWF0ZTogaXNBY3Rpb25Bbm5vdGF0ZWRIaWRkZW4oY29udmVydGVyQ29udGV4dCwgQW5ub3RhdGlvbkhpZGRlblByb3BlcnR5LkNyZWF0ZUhpZGRlbiksXG5cdFx0XHRkZWxldGU6IGlzQWN0aW9uQW5ub3RhdGVkSGlkZGVuKGNvbnZlcnRlckNvbnRleHQsIEFubm90YXRpb25IaWRkZW5Qcm9wZXJ0eS5EZWxldGVIaWRkZW4pLFxuXHRcdFx0dXBkYXRlOiBpc0FjdGlvbkFubm90YXRlZEhpZGRlbihjb252ZXJ0ZXJDb250ZXh0LCBBbm5vdGF0aW9uSGlkZGVuUHJvcGVydHkuVXBkYXRlSGlkZGVuKVxuXHRcdH0sXG5cdFx0Y3JlYXRpb25Nb2RlOiBjcmVhdGlvbk1vZGUsXG5cdFx0aXNEcmFmdE9yU3RpY2t5U3VwcG9ydGVkOiBpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQoY29udmVydGVyQ29udGV4dCksXG5cdFx0aXNWaWV3V2l0aE11bHRpcGxlVmlzdWFsaXphdGlvbnM6IHZpZXdDb25maWd1cmF0aW9uXG5cdFx0XHQ/IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyh2aWV3Q29uZmlndXJhdGlvbilcblx0XHRcdDogZmFsc2UsXG5cdFx0bmV3QWN0aW9uOiBnZXROZXdBY3Rpb24oY29udmVydGVyQ29udGV4dCksXG5cdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRcdHJlc3RyaWN0aW9uczogZ2V0UmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQpXG5cdH07XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHN0aWNreSBvciBkcmFmdCBpcyBzdXBwb3J0ZWQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBzdXBwb3J0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRHJhZnRPclN0aWNreVN1cHBvcnRlZChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0Y29uc3QgYklzRHJhZnRTdXBwb3J0ZWQgPSBNb2RlbEhlbHBlci5pc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZChkYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0Y29uc3QgYklzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCA9IChkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkXG5cdFx0PyB0cnVlXG5cdFx0OiBmYWxzZTtcblxuXHRyZXR1cm4gYklzRHJhZnRTdXBwb3J0ZWQgfHwgYklzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBjb25maWd1cmVkIG5ld0FjdGlvbiBpbnRvIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBuZXcgYWN0aW9uIGluZm9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5ld0FjdGlvbihjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYW55IHtcblx0Y29uc3QgY3VycmVudEVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdGNvbnN0IG5ld0FjdGlvbiA9ICFNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihjdXJyZW50RW50aXR5U2V0KVxuXHRcdD8gKGN1cnJlbnRFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnRSb290Py5OZXdBY3Rpb24gfHxcblx0XHQgIChjdXJyZW50RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy5OZXdBY3Rpb25cblx0XHQ6IHVuZGVmaW5lZDtcblx0Y29uc3QgbmV3QWN0aW9uTmFtZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gPSBuZXdBY3Rpb24/LnRvU3RyaW5nKCk7XG5cdGlmIChuZXdBY3Rpb25OYW1lKSB7XG5cdFx0bGV0IGF2YWlsYWJsZVByb3BlcnR5OiBhbnkgPSBjb252ZXJ0ZXJDb250ZXh0Py5nZXRFbnRpdHlUeXBlKCkuYWN0aW9uc1tuZXdBY3Rpb25OYW1lXT8uYW5ub3RhdGlvbnM/LkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZTtcblx0XHRhdmFpbGFibGVQcm9wZXJ0eSA9IGF2YWlsYWJsZVByb3BlcnR5ICE9PSB1bmRlZmluZWQgPyBhdmFpbGFibGVQcm9wZXJ0eSA6IHRydWU7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6IG5ld0FjdGlvbk5hbWUsXG5cdFx0XHRhdmFpbGFibGU6IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihhdmFpbGFibGVQcm9wZXJ0eSlcblx0XHR9O1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgYWN0aW9uIHZpc2liaWxpdHkgY29uZmlndXJlZCBpbnRvIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzQW5ub3RhdGlvblRlcm1cbiAqIEBwYXJhbSBiV2l0aE5hdmlnYXRpb25QYXRoXG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgYWN0aW9uIHZpc2liaWxpdHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQWN0aW9uQW5ub3RhdGVkSGlkZGVuKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzQW5ub3RhdGlvblRlcm06IHN0cmluZyxcblx0YldpdGhOYXZpZ2F0aW9uUGF0aCA9IHRydWVcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGN1cnJlbnRFbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRjb25zdCBkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdC8vIENvbnNpZGVyIG9ubHkgdGhlIGxhc3QgbGV2ZWwgb2YgbmF2aWdhdGlvbi4gVGhlIG90aGVycyBhcmUgYWxyZWFkeSBjb25zaWRlcmVkIGluIHRoZSBlbGVtZW50IGJpbmRpbmcgb2YgdGhlIHBhZ2UuXG5cdGNvbnN0IHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMgPVxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoID4gMCAmJiBiV2l0aE5hdmlnYXRpb25QYXRoXG5cdFx0XHQ/IFtkYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzW2RhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoIC0gMV0ubmFtZV1cblx0XHRcdDogW107XG5cdGNvbnN0IGFjdGlvbkFubm90YXRpb25WYWx1ZSA9XG5cdFx0KChjdXJyZW50RW50aXR5U2V0Py5hbm5vdGF0aW9ucy5VSSBhcyBhbnkpPy5bc0Fubm90YXRpb25UZXJtXSBhcyBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxib29sZWFuPikgfHwgZmFsc2U7XG5cblx0cmV0dXJuIGN1cnJlbnRFbnRpdHlTZXRcblx0XHQ/IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihhY3Rpb25Bbm5vdGF0aW9uVmFsdWUsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHVuZGVmaW5lZCwgKHBhdGg6IHN0cmluZykgPT5cblx0XHRcdFx0c2luZ2xldG9uUGF0aFZpc2l0b3IocGF0aCwgY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZWRUeXBlcygpLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzKVxuXHRcdCAgKVxuXHRcdDogY29uc3RhbnQoZmFsc2UpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGFubm90YXRlZCByZXN0cmljdGlvbnMgZm9yIHRoZSBhY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogU3RhbmRhcmRBY3Rpb25zUmVzdHJpY3Rpb25zVHlwZSB7XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0Y29uc3QgcmVzdHJpY3Rpb25zRGVmID0gW1xuXHRcdHtcblx0XHRcdGtleTogXCJpc0luc2VydGFibGVcIixcblx0XHRcdGZ1bmN0aW9uOiBpc1BhdGhJbnNlcnRhYmxlXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRrZXk6IFwiaXNVcGRhdGFibGVcIixcblx0XHRcdGZ1bmN0aW9uOiBpc1BhdGhVcGRhdGFibGVcblx0XHR9LFxuXHRcdHtcblx0XHRcdGtleTogXCJpc0RlbGV0YWJsZVwiLFxuXHRcdFx0ZnVuY3Rpb246IGlzUGF0aERlbGV0YWJsZVxuXHRcdH1cblx0XTtcblx0Y29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBFeHByZXNzaW9uUmVzdHJpY3Rpb25zVHlwZT4gPSB7fTtcblx0cmVzdHJpY3Rpb25zRGVmLmZvckVhY2goZnVuY3Rpb24gKGRlZikge1xuXHRcdGNvbnN0IGRlZkZ1bmN0aW9uID0gZGVmW1wiZnVuY3Rpb25cIl07XG5cdFx0cmVzdWx0W2RlZi5rZXldID0ge1xuXHRcdFx0ZXhwcmVzc2lvbjogZGVmRnVuY3Rpb24uYXBwbHkobnVsbCwgW1xuXHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGF0aFZpc2l0b3I6IChwYXRoOiBzdHJpbmcsIG5hdmlnYXRpb25QYXRoczogc3RyaW5nW10pID0+XG5cdFx0XHRcdFx0XHRzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIG5hdmlnYXRpb25QYXRocylcblx0XHRcdFx0fVxuXHRcdFx0XSksXG5cdFx0XHRuYXZpZ2F0aW9uRXhwcmVzc2lvbjogZGVmRnVuY3Rpb24uYXBwbHkobnVsbCwgW1xuXHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWdub3JlVGFyZ2V0Q29sbGVjdGlvbjogdHJ1ZSxcblx0XHRcdFx0XHRhdXRob3JpemVVbnJlc29sdmFibGU6IHRydWUsXG5cdFx0XHRcdFx0cGF0aFZpc2l0b3I6IChwYXRoOiBzdHJpbmcsIG5hdmlnYXRpb25QYXRoczogc3RyaW5nW10pID0+XG5cdFx0XHRcdFx0XHRzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIG5hdmlnYXRpb25QYXRocylcblx0XHRcdFx0fVxuXHRcdFx0XSlcblx0XHR9O1xuXHR9KTtcblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGVtcGxhdGluZyBmb3IgaW5zZXJ0L3VwZGF0ZSBhY3Rpb25zIGlzIG1hbmRhdG9yeS5cbiAqXG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHBhcmFtIGlzRHJhZnRPclN0aWNreVxuICogQHBhcmFtIGlzQ3JlYXRlQWx3YXlzSGlkZGVuXG4gKiBAcmV0dXJucyBUaGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nKFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRpc0RyYWZ0T3JTdGlja3k6IGJvb2xlYW4sXG5cdGlzQ3JlYXRlQWx3YXlzSGlkZGVuOiBib29sZWFuXG4pOiBib29sZWFuIHtcblx0cmV0dXJuIChpc0RyYWZ0T3JTdGlja3kgfHwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5FeHRlcm5hbCkgJiYgIWlzQ3JlYXRlQWx3YXlzSGlkZGVuO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSAnQ3JlYXRlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgc3RhbmRhcmQgYWN0aW9uIGluZm9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN0YW5kYXJkQWN0aW9uQ3JlYXRlKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4pOiBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUge1xuXHRjb25zdCBjcmVhdGVWaXNpYmlsaXR5ID0gZ2V0Q3JlYXRlVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblx0cmV0dXJuIHtcblx0XHRpc1RlbXBsYXRlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0Q3JlYXRlVGVtcGxhdGluZyhzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBjcmVhdGVWaXNpYmlsaXR5KSksXG5cdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oY3JlYXRlVmlzaWJpbGl0eSksXG5cdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0Q3JlYXRlRW5hYmxlbWVudChjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBjcmVhdGVWaXNpYmlsaXR5KSlcblx0fTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb25zIGZvciB0aGUgcHJvcGVydGllcyBvZiB0aGUgJ0RlbGV0ZScgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSAnRGVsZXRlJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGFuZGFyZEFjdGlvbkRlbGV0ZShcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuKTogU3RhbmRhcmRBY3Rpb25Db25maWdUeXBlIHtcblx0Y29uc3QgZGVsZXRlVmlzaWJpbGl0eSA9IGdldERlbGV0ZVZpc2liaWxpdHkoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCk7XG5cblx0cmV0dXJuIHtcblx0XHRpc1RlbXBsYXRlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0RGVmYXVsdFRlbXBsYXRpbmcoZGVsZXRlVmlzaWJpbGl0eSkpLFxuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKGRlbGV0ZVZpc2liaWxpdHkpLFxuXHRcdGVuYWJsZWQ6IGNvbXBpbGVFeHByZXNzaW9uKGdldERlbGV0ZUVuYWJsZW1lbnQoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgZGVsZXRlVmlzaWJpbGl0eSkpXG5cdH07XG59XG5cbi8qKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcmV0dXJucyBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENyZWF0aW9uUm93KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4pOiBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUge1xuXHRjb25zdCBjcmVhdGlvblJvd1Zpc2liaWxpdHkgPSBnZXRDcmVhdGVWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIHRydWUpO1xuXG5cdHJldHVybiB7XG5cdFx0aXNUZW1wbGF0ZWQ6IGNvbXBpbGVFeHByZXNzaW9uKGdldENyZWF0ZVRlbXBsYXRpbmcoc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgY3JlYXRpb25Sb3dWaXNpYmlsaXR5LCB0cnVlKSksXG5cdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oY3JlYXRpb25Sb3dWaXNpYmlsaXR5KSxcblx0XHRlbmFibGVkOiBjb21waWxlRXhwcmVzc2lvbihnZXRDcmVhdGlvblJvd0VuYWJsZW1lbnQoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgY3JlYXRpb25Sb3dWaXNpYmlsaXR5KSlcblx0fTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb25zIGZvciB0aGUgcHJvcGVydGllcyBvZiB0aGUgJ1Bhc3RlJyBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gaXNJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGVkXG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9ucyBmb3IgdGhlIHByb3BlcnRpZXMgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RhbmRhcmRBY3Rpb25QYXN0ZShcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0aXNJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGVkOiBib29sZWFuXG4pOiBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUge1xuXHRjb25zdCBjcmVhdGVWaXNpYmlsaXR5ID0gZ2V0Q3JlYXRlVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblx0Y29uc3QgY3JlYXRlRW5hYmxlbWVudCA9IGdldENyZWF0ZUVuYWJsZW1lbnQoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgY3JlYXRlVmlzaWJpbGl0eSk7XG5cdGNvbnN0IHBhc3RlVmlzaWJpbGl0eSA9IGdldFBhc3RlVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBjcmVhdGVWaXNpYmlsaXR5LCBpc0luc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0ZWQpO1xuXHRyZXR1cm4ge1xuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKHBhc3RlVmlzaWJpbGl0eSksXG5cdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oZ2V0UGFzdGVFbmFibGVtZW50KHBhc3RlVmlzaWJpbGl0eSwgY3JlYXRlRW5hYmxlbWVudCkpXG5cdH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9ucyBmb3IgdGhlIHByb3BlcnRpZXMgb2YgdGhlICdNYXNzRWRpdCcgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSAnTWFzc0VkaXQnIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN0YW5kYXJkQWN0aW9uTWFzc0VkaXQoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IFN0YW5kYXJkQWN0aW9uQ29uZmlnVHlwZSB7XG5cdGNvbnN0IG1hc3NFZGl0VmlzaWJpbGl0eSA9IGdldE1hc3NFZGl0VmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KTtcblxuXHRyZXR1cm4ge1xuXHRcdGlzVGVtcGxhdGVkOiBjb21waWxlRXhwcmVzc2lvbihnZXREZWZhdWx0VGVtcGxhdGluZyhtYXNzRWRpdFZpc2liaWxpdHkpKSxcblx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihtYXNzRWRpdFZpc2liaWxpdHkpLFxuXHRcdGVuYWJsZWQ6IGNvbXBpbGVFeHByZXNzaW9uKGdldE1hc3NFZGl0RW5hYmxlbWVudChjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LCBtYXNzRWRpdFZpc2liaWxpdHkpKVxuXHR9O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIHRlbXBsYXRpbmcgb2YgdGhlICdDcmVhdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHBhcmFtIGNyZWF0ZVZpc2liaWxpdHlcbiAqIEBwYXJhbSBpc0ZvckNyZWF0aW9uUm93XG4gKiBAcmV0dXJucyBUaGUgY3JlYXRlIGJpbmRpbmcgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3JlYXRlVGVtcGxhdGluZyhcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Y3JlYXRlVmlzaWJpbGl0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+LFxuXHRpc0ZvckNyZWF0aW9uUm93ID0gZmFsc2Vcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdC8vVGVtcGxhdGluZyBvZiBDcmVhdGUgQnV0dG9uIGlzIG5vdCBkb25lOlxuXHQvLyBcdCAtIElmIEJ1dHRvbiBpcyBuZXZlciB2aXNpYmxlKGNvdmVyZWQgdGhlIEV4dGVybmFsIGNyZWF0ZSBidXR0b24sIG5ldyBBY3Rpb24pXG5cdC8vXHQgLSBvciBDcmVhdGlvbk1vZGUgaXMgb24gQ3JlYXRpb25Sb3cgZm9yIENyZWF0ZSBCdXR0b25cblx0Ly9cdCAtIG9yIENyZWF0aW9uTW9kZSBpcyBub3Qgb24gQ3JlYXRpb25Sb3cgZm9yIENyZWF0aW9uUm93IEJ1dHRvblxuXG5cdHJldHVybiBhbmQoXG5cdFx0Ly9YTk9SIGdhdGVcblx0XHRvcihcblx0XHRcdGFuZChpc0ZvckNyZWF0aW9uUm93LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LmNyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93KSxcblx0XHRcdGFuZCghaXNGb3JDcmVhdGlvblJvdywgc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdylcblx0XHQpLFxuXHRcdG9yKG5vdChpc0NvbnN0YW50KGNyZWF0ZVZpc2liaWxpdHkpKSwgY3JlYXRlVmlzaWJpbGl0eSlcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSB0ZW1wbGF0aW5nIG9mIHRoZSBub24tQ3JlYXRlIGFjdGlvbnMuXG4gKlxuICogQHBhcmFtIGFjdGlvblZpc2liaWxpdHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSB0ZW1wbGF0aW5nIG9mIHRoZSBub24tQ3JlYXRlIGFjdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0VGVtcGxhdGluZyhhY3Rpb25WaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gb3Iobm90KGlzQ29uc3RhbnQoYWN0aW9uVmlzaWJpbGl0eSkpLCBhY3Rpb25WaXNpYmlsaXR5KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdDcmVhdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEBwYXJhbSBpc0ZvckNyZWF0aW9uUm93XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ3Zpc2libGUnIHByb3BlcnR5IG9mIHRoZSAnQ3JlYXRlJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDcmVhdGVWaXNpYmlsaXR5KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRpc0ZvckNyZWF0aW9uUm93ID0gZmFsc2Vcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzSW5zZXJ0YWJsZSA9IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQucmVzdHJpY3Rpb25zLmlzSW5zZXJ0YWJsZS5leHByZXNzaW9uO1xuXHRjb25zdCBpc0NyZWF0ZUhpZGRlbiA9IGlzRm9yQ3JlYXRpb25Sb3dcblx0XHQ/IGlzQWN0aW9uQW5ub3RhdGVkSGlkZGVuKGNvbnZlcnRlckNvbnRleHQsIEFubm90YXRpb25IaWRkZW5Qcm9wZXJ0eS5DcmVhdGVIaWRkZW4sIGZhbHNlKVxuXHRcdDogc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5oaWRkZW5Bbm5vdGF0aW9uLmNyZWF0ZTtcblx0Y29uc3QgbmV3QWN0aW9uID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5uZXdBY3Rpb247XG5cdC8vQ3JlYXRlIEJ1dHRvbiBpcyB2aXNpYmxlOlxuXHQvLyBcdCAtIElmIHRoZSBjcmVhdGlvbiBtb2RlIGlzIGV4dGVybmFsXG5cdC8vICAgICAgLSBJZiB3ZSdyZSBvbiB0aGUgbGlzdCByZXBvcnQgYW5kIGNyZWF0ZSBpcyBub3QgaGlkZGVuXG5cdC8vXHRcdC0gT3RoZXJ3aXNlIHRoaXMgZGVwZW5kcyBvbiB0aGUgdmFsdWUgb2YgdGhlIFVJLklzRWRpdGFibGVcblx0Ly9cdCAtIE90aGVyd2lzZVxuXHQvL1x0XHQtIElmIGFueSBvZiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgaXMgdmFsaWQgdGhlbiBjcmVhdGUgYnV0dG9uIGlzbid0IHZpc2libGVcblx0Ly9cdFx0XHQtIG5vIG5ld0FjdGlvbiBhdmFpbGFibGVcblx0Ly9cdFx0XHQtIEl0J3Mgbm90IGluc2VydGFibGUgYW5kIHRoZXJlIGlzIG5vdCBhIG5ldyBhY3Rpb25cblx0Ly9cdFx0XHQtIGNyZWF0ZSBpcyBoaWRkZW5cblx0Ly9cdFx0XHQtIFRoZXJlIGFyZSBtdWx0aXBsZSB2aXN1YWxpemF0aW9uc1xuXHQvL1x0XHRcdC0gSXQncyBhbiBBbmFseXRpY2FsIExpc3QgUGFnZVxuXHQvL1x0XHRcdC0gVXNlcyBJbmxpbmVDcmVhdGlvblJvd3MgbW9kZSBhbmQgYSBSZXNwb25zaXZlIHRhYmxlIHR5cGUsIHdpdGggdGhlIHBhcmFtZXRlciBpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlIHRvIHRydWUgd2hpbGUgbm90IGluIGNyZWF0ZSBtb2RlXG5cdC8vICAgLSBPdGhlcndpc2Vcblx0Ly8gXHQgXHQtIElmIHdlJ3JlIG9uIHRoZSBsaXN0IHJlcG9ydCAtPlxuXHQvLyBcdCBcdFx0LSBJZiBVSS5DcmVhdGVIaWRkZW4gcG9pbnRzIHRvIGEgcHJvcGVydHkgcGF0aCAtPiBwcm92aWRlIGEgbmVnYXRlZCBiaW5kaW5nIHRvIHRoaXMgcGF0aFxuXHQvLyBcdCBcdFx0LSBPdGhlcndpc2UsIGNyZWF0ZSBpcyB2aXNpYmxlXG5cdC8vIFx0IFx0LSBPdGhlcndpc2Vcblx0Ly8gXHQgIFx0IC0gVGhpcyBkZXBlbmRzIG9uIHRoZSB2YWx1ZSBvZiB0aGUgVUkuSXNFZGl0YWJsZVxuXHRyZXR1cm4gaWZFbHNlKFxuXHRcdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuRXh0ZXJuYWwsXG5cdFx0YW5kKG5vdChpc0NyZWF0ZUhpZGRlbiksIG9yKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0LCBVSS5Jc0VkaXRhYmxlKSksXG5cdFx0aWZFbHNlKFxuXHRcdFx0b3IoXG5cdFx0XHRcdGFuZChpc0NvbnN0YW50KG5ld0FjdGlvbj8uYXZhaWxhYmxlKSwgZXF1YWwobmV3QWN0aW9uPy5hdmFpbGFibGUsIGZhbHNlKSksXG5cdFx0XHRcdGFuZChpc0NvbnN0YW50KGlzSW5zZXJ0YWJsZSksIGVxdWFsKGlzSW5zZXJ0YWJsZSwgZmFsc2UpLCAhbmV3QWN0aW9uKSxcblx0XHRcdFx0YW5kKGlzQ29uc3RhbnQoaXNDcmVhdGVIaWRkZW4pLCBlcXVhbChpc0NyZWF0ZUhpZGRlbiwgdHJ1ZSkpLFxuXHRcdFx0XHRhbmQoXG5cdFx0XHRcdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5JbmxpbmVDcmVhdGlvblJvd3MsXG5cdFx0XHRcdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC50YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbj8udHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIixcblx0XHRcdFx0XHRpZkVsc2UoXG5cdFx0XHRcdFx0XHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0Py50YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbj8uaW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZSA9PT0gZmFsc2UsXG5cdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0VUkuSXNDcmVhdGVNb2RlXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHRpZkVsc2UoXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0LFxuXHRcdFx0XHRvcihub3QoaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24oaXNDcmVhdGVIaWRkZW4pKSwgbm90KGlzQ3JlYXRlSGlkZGVuKSksXG5cdFx0XHRcdGFuZChub3QoaXNDcmVhdGVIaWRkZW4pLCBVSS5Jc0VkaXRhYmxlKVxuXHRcdFx0KVxuXHRcdClcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdEZWxldGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdEZWxldGUnIGFjdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlbGV0ZVZpc2liaWxpdHkoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzRGVsZXRlSGlkZGVuID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5oaWRkZW5Bbm5vdGF0aW9uLmRlbGV0ZTtcblx0Y29uc3QgcGF0aERlbGV0YWJsZUV4cHJlc3Npb24gPSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnJlc3RyaWN0aW9ucy5pc0RlbGV0YWJsZS5leHByZXNzaW9uO1xuXG5cdC8vRGVsZXRlIEJ1dHRvbiBpcyB2aXNpYmxlOlxuXHQvLyBcdCBQcmVyZXF1aXNpdGVzOlxuXHQvL1x0IC0gSWYgd2UncmUgbm90IG9uIEFMUFxuXHQvLyAgIC0gSWYgcmVzdHJpY3Rpb25zIG9uIGRlbGV0YWJsZSBzZXQgdG8gZmFsc2UgLT4gbm90IHZpc2libGVcblx0Ly8gICAtIE90aGVyd2lzZVxuXHQvL1x0XHRcdC0gSWYgVUkuRGVsZXRlSGlkZGVuIGlzIHRydWUgLT4gbm90IHZpc2libGVcblx0Ly9cdFx0XHQtIE90aGVyd2lzZVxuXHQvLyBcdCBcdFx0XHQtIElmIHdlJ3JlIG9uIE9QIC0+IGRlcGVuZGluZyBpZiBVSSBpcyBlZGl0YWJsZSBhbmQgcmVzdHJpY3Rpb25zIG9uIGRlbGV0YWJsZVxuXHQvL1x0XHRcdFx0LSBPdGhlcndpc2Vcblx0Ly9cdFx0XHRcdCBcdC0gSWYgVUkuRGVsZXRlSGlkZGVuIHBvaW50cyB0byBhIHByb3BlcnR5IHBhdGggLT4gcHJvdmlkZSBhIG5lZ2F0ZWQgYmluZGluZyB0byB0aGlzIHBhdGhcblx0Ly9cdCBcdCBcdFx0IFx0LSBPdGhlcndpc2UsIGRlbGV0ZSBpcyB2aXNpYmxlXG5cblx0cmV0dXJuIGlmRWxzZShcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlLFxuXHRcdGZhbHNlLFxuXHRcdGlmRWxzZShcblx0XHRcdGFuZChpc0NvbnN0YW50KHBhdGhEZWxldGFibGVFeHByZXNzaW9uKSwgZXF1YWwocGF0aERlbGV0YWJsZUV4cHJlc3Npb24sIGZhbHNlKSksXG5cdFx0XHRmYWxzZSxcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0YW5kKGlzQ29uc3RhbnQoaXNEZWxldGVIaWRkZW4pLCBlcXVhbChpc0RlbGV0ZUhpZGRlbiwgY29uc3RhbnQodHJ1ZSkpKSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpICE9PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCxcblx0XHRcdFx0XHRhbmQobm90KGlzRGVsZXRlSGlkZGVuKSwgVUkuSXNFZGl0YWJsZSksXG5cdFx0XHRcdFx0bm90KGFuZChpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihpc0RlbGV0ZUhpZGRlbiksIGlzRGVsZXRlSGlkZGVuKSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdClcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHBhcmFtIGNyZWF0ZVZpc2liaWxpdHlcbiAqIEBwYXJhbSBpc0luc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0ZWRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdQYXN0ZScgYWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFzdGVWaXNpYmlsaXR5KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRjcmVhdGVWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4sXG5cdGlzSW5zZXJ0VXBkYXRlQWN0aW9uc1RlbXBsYXRlZDogYm9vbGVhblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Ly8gSWYgQ3JlYXRlIGlzIHZpc2libGUsIGVuYWJsZVBhc3RlIGlzIG5vdCBkaXNhYmxlZCBpbnRvIG1hbmlmZXN0IGFuZCB3ZSBhcmUgb24gT1AvYmxvY2tzIG91dHNpZGUgRmlvcmkgZWxlbWVudHMgdGVtcGxhdGVzXG5cdC8vIFRoZW4gYnV0dG9uIHdpbGwgYmUgdmlzaWJsZSBhY2NvcmRpbmcgdG8gaW5zZXJ0YWJsZSByZXN0cmljdGlvbnMgYW5kIGNyZWF0ZSB2aXNpYmlsaXR5XG5cdC8vIE90aGVyd2lzZSBpdCdzIG5vdCB2aXNpYmxlXG5cdHJldHVybiBhbmQoXG5cdFx0bm90RXF1YWwoc3RhbmRhcmRBY3Rpb25zQ29udGV4dC50YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5lbmFibGVQYXN0ZSwgZmFsc2UpLFxuXHRcdGNyZWF0ZVZpc2liaWxpdHksXG5cdFx0aXNJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGVkLFxuXHRcdFtUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCwgVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZV0uaW5kZXhPZihjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpKSA9PT0gLTEsXG5cdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC5yZXN0cmljdGlvbnMuaXNJbnNlcnRhYmxlLmV4cHJlc3Npb25cblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlICdNYXNzRWRpdCcgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICd2aXNpYmxlJyBwcm9wZXJ0eSBvZiB0aGUgJ01hc3NFZGl0JyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXNzRWRpdFZpc2liaWxpdHkoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzVXBkYXRlSGlkZGVuID0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dC5oaWRkZW5Bbm5vdGF0aW9uLnVwZGF0ZSxcblx0XHRwYXRoVXBkYXRhYmxlRXhwcmVzc2lvbiA9IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQucmVzdHJpY3Rpb25zLmlzVXBkYXRhYmxlLmV4cHJlc3Npb24sXG5cdFx0Yk1hc3NFZGl0RW5hYmxlZEluTWFuaWZlc3Q6IGJvb2xlYW4gPSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0LnRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uPy5lbmFibGVNYXNzRWRpdCB8fCBmYWxzZTtcblx0Y29uc3QgdGVtcGxhdGVCaW5kaW5nRXhwcmVzc2lvbiA9XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLk9iamVjdFBhZ2Vcblx0XHRcdD8gVUkuSXNFZGl0YWJsZVxuXHRcdFx0OiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydDtcblx0Ly9NYXNzRWRpdCBpcyB2aXNpYmxlXG5cdC8vIElmXG5cdC8vXHRcdC0gdGhlcmUgaXMgbm8gc3RhdGljIHJlc3RyaWN0aW9ucyBzZXQgdG8gZmFsc2Vcblx0Ly9cdFx0LSBhbmQgZW5hYmxlTWFzc0VkaXQgaXMgbm90IHNldCB0byBmYWxzZSBpbnRvIHRoZSBtYW5pZmVzdFxuXHQvL1x0XHQtIGFuZCB0aGUgc2VsZWN0aW9uTW9kZSBpcyByZWxldmFudFxuXHQvL1x0VGhlbiBNYXNzRWRpdCBpcyBhbHdheXMgdmlzaWJsZSBpbiBMUiBvciBkeW5hbWljYWxseSB2aXNpYmxlIGluIE9QIGFjY29yZGluZyB0byB1aT5FZGl0YWJsZSBhbmQgaGlkZGVuQW5ub3RhdGlvblxuXHQvLyAgQnV0dG9uIGlzIGhpZGRlbiBmb3IgYWxsIG90aGVyIGNhc2VzXG5cdHJldHVybiBhbmQoXG5cdFx0bm90KGFuZChpc0NvbnN0YW50KHBhdGhVcGRhdGFibGVFeHByZXNzaW9uKSwgZXF1YWwocGF0aFVwZGF0YWJsZUV4cHJlc3Npb24sIGZhbHNlKSkpLFxuXHRcdGJNYXNzRWRpdEVuYWJsZWRJbk1hbmlmZXN0LFxuXHRcdHRlbXBsYXRlQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0bm90KGlzVXBkYXRlSGlkZGVuKVxuXHQpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgY3JlYXRpb25Sb3cuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBzdGFuZGFyZEFjdGlvbnNDb250ZXh0XG4gKiBAcGFyYW0gY3JlYXRpb25Sb3dWaXNpYmlsaXR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSBjcmVhdGlvblJvdy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENyZWF0aW9uUm93RW5hYmxlbWVudChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dDogU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Y3JlYXRpb25Sb3dWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IHJlc3RyaWN0aW9uc0luc2VydGFibGUgPSBpc1BhdGhJbnNlcnRhYmxlKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCB7XG5cdFx0aWdub3JlVGFyZ2V0Q29sbGVjdGlvbjogdHJ1ZSxcblx0XHRhdXRob3JpemVVbnJlc29sdmFibGU6IHRydWUsXG5cdFx0cGF0aFZpc2l0b3I6IChwYXRoOiBzdHJpbmcsIG5hdmlnYXRpb25QYXRoczogc3RyaW5nW10pID0+IHtcblx0XHRcdGlmIChwYXRoLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHRcdHBhdGggPSBzaW5nbGV0b25QYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCksIG5hdmlnYXRpb25QYXRocyk7XG5cdFx0XHRcdHJldHVybiBwYXRoO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS5uYXZpZ2F0aW9uUHJvcGVydGllcztcblx0XHRcdGlmIChuYXZpZ2F0aW9uUHJvcGVydGllcykge1xuXHRcdFx0XHRjb25zdCBsYXN0TmF2ID0gbmF2aWdhdGlvblByb3BlcnRpZXNbbmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoIC0gMV07XG5cdFx0XHRcdGNvbnN0IHBhcnRuZXIgPSBsYXN0TmF2Ll90eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIGxhc3ROYXYucGFydG5lcjtcblx0XHRcdFx0aWYgKHBhcnRuZXIpIHtcblx0XHRcdFx0XHRwYXRoID0gYCR7cGFydG5lcn0vJHtwYXRofWA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwYXRoO1xuXHRcdH1cblx0fSk7XG5cdGNvbnN0IGlzSW5zZXJ0YWJsZSA9XG5cdFx0cmVzdHJpY3Rpb25zSW5zZXJ0YWJsZS5fdHlwZSA9PT0gXCJVbnJlc29sdmFibGVcIlxuXHRcdFx0PyBpc1BhdGhJbnNlcnRhYmxlKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCB7XG5cdFx0XHRcdFx0cGF0aFZpc2l0b3I6IChwYXRoOiBzdHJpbmcpID0+IHNpbmdsZXRvblBhdGhWaXNpdG9yKHBhdGgsIGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVkVHlwZXMoKSwgW10pXG5cdFx0XHQgIH0pXG5cdFx0XHQ6IHJlc3RyaWN0aW9uc0luc2VydGFibGU7XG5cblx0cmV0dXJuIGFuZChcblx0XHRjcmVhdGlvblJvd1Zpc2liaWxpdHksXG5cdFx0aXNJbnNlcnRhYmxlLFxuXHRcdG9yKFxuXHRcdFx0IXN0YW5kYXJkQWN0aW9uc0NvbnRleHQudGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSxcblx0XHRcdGZvcm1hdFJlc3VsdChbcGF0aEluTW9kZWwoXCJjcmVhdGlvblJvd0ZpZWxkVmFsaWRpdHlcIiwgXCJpbnRlcm5hbFwiKV0sIHRhYmxlRm9ybWF0dGVycy52YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzKVxuXHRcdClcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlICdDcmVhdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEBwYXJhbSBjcmVhdGVWaXNpYmlsaXR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnQ3JlYXRlJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDcmVhdGVFbmFibGVtZW50KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRjcmVhdGVWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGlzSW5zZXJ0YWJsZSA9IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQucmVzdHJpY3Rpb25zLmlzSW5zZXJ0YWJsZS5leHByZXNzaW9uO1xuXHRjb25zdCBDb2xsZWN0aW9uVHlwZSA9IGNvbnZlcnRlckNvbnRleHQucmVzb2x2ZUFic29sdXRlUGF0aDxhbnk+KHN0YW5kYXJkQWN0aW9uc0NvbnRleHQuY29sbGVjdGlvblBhdGgpLnRhcmdldD8uX3R5cGU7XG5cdHJldHVybiBhbmQoXG5cdFx0Y3JlYXRlVmlzaWJpbGl0eSxcblx0XHRvcihcblx0XHRcdENvbGxlY3Rpb25UeXBlID09PSBcIkVudGl0eVNldFwiLFxuXHRcdFx0YW5kKGlzSW5zZXJ0YWJsZSwgb3IoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSAhPT0gVGVtcGxhdGVUeXBlLk9iamVjdFBhZ2UsIFVJLklzRWRpdGFibGUpKVxuXHRcdClcblx0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlICdEZWxldGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9uc0NvbnRleHRcbiAqIEBwYXJhbSBkZWxldGVWaXNpYmlsaXR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnRGVsZXRlJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWxldGVFbmFibGVtZW50KFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdGFuZGFyZEFjdGlvbnNDb250ZXh0OiBTdGFuZGFyZEFjdGlvbnNDb250ZXh0LFxuXHRkZWxldGVWaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGRlbGV0YWJsZUNvbnRleHRzID0gcGF0aEluTW9kZWwoXCJkZWxldGFibGVDb250ZXh0c1wiLCBcImludGVybmFsXCIpO1xuXHRjb25zdCB1blNhdmVkQ29udGV4dHMgPSBwYXRoSW5Nb2RlbChcInVuU2F2ZWRDb250ZXh0c1wiLCBcImludGVybmFsXCIpO1xuXHRjb25zdCBkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlID0gcGF0aEluTW9kZWwoXCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlXCIsIFwiaW50ZXJuYWxcIik7XG5cdGNvbnN0IGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUgPSBwYXRoSW5Nb2RlbChcImRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmVcIiwgXCJpbnRlcm5hbFwiKTtcblxuXHRyZXR1cm4gYW5kKFxuXHRcdGRlbGV0ZVZpc2liaWxpdHksXG5cdFx0aWZFbHNlKFxuXHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLk9iamVjdFBhZ2UsXG5cdFx0XHRvcihcblx0XHRcdFx0YW5kKG5vdEVxdWFsKGRlbGV0YWJsZUNvbnRleHRzLCB1bmRlZmluZWQpLCBncmVhdGVyVGhhbihsZW5ndGgoZGVsZXRhYmxlQ29udGV4dHMpLCAwKSksXG5cdFx0XHRcdGFuZChub3RFcXVhbChkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlLCB1bmRlZmluZWQpLCBncmVhdGVyVGhhbihsZW5ndGgoZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSksIDApKVxuXHRcdFx0KSxcblx0XHRcdG9yKFxuXHRcdFx0XHRhbmQobm90RXF1YWwoZGVsZXRhYmxlQ29udGV4dHMsIHVuZGVmaW5lZCksIGdyZWF0ZXJUaGFuKGxlbmd0aChkZWxldGFibGVDb250ZXh0cyksIDApKSxcblx0XHRcdFx0YW5kKG5vdEVxdWFsKGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUsIHVuZGVmaW5lZCksIGdyZWF0ZXJUaGFuKGxlbmd0aChkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlKSwgMCkpLFxuXHRcdFx0XHQvLyBvbiBMUiwgYWxzbyBlbmFibGUgZGVsZXRlIGJ1dHRvbiB0byBjYW5jZWwgZHJhZnRzXG5cdFx0XHRcdGFuZChub3RFcXVhbChkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLCB1bmRlZmluZWQpLCBncmVhdGVyVGhhbihsZW5ndGgoZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSksIDApKSxcblx0XHRcdFx0Ly8gZGVsZXRhYmxlIGNvbnRleHRzIHdpdGggdW5zYXZlZCBjaGFuZ2VzIGFyZSBjb3VudGVkIHNlcGFyYXRlbHkgKExSIG9ubHkpXG5cdFx0XHRcdGFuZChub3RFcXVhbCh1blNhdmVkQ29udGV4dHMsIHVuZGVmaW5lZCksIGdyZWF0ZXJUaGFuKGxlbmd0aCh1blNhdmVkQ29udGV4dHMpLCAwKSlcblx0XHRcdClcblx0XHQpXG5cdCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSAnUGFzdGUnIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gcGFzdGVWaXNpYmlsaXR5XG4gKiBAcGFyYW0gY3JlYXRlRW5hYmxlbWVudFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgJ1Bhc3RlJyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXN0ZUVuYWJsZW1lbnQoXG5cdHBhc3RlVmlzaWJpbGl0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+LFxuXHRjcmVhdGVFbmFibGVtZW50OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBhbmQocGFzdGVWaXNpYmlsaXR5LCBjcmVhdGVFbmFibGVtZW50KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlICdNYXNzRWRpdCcgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gc3RhbmRhcmRBY3Rpb25zQ29udGV4dFxuICogQHBhcmFtIG1hc3NFZGl0VmlzaWJpbGl0eVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgJ01hc3NFZGl0JyBhY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXNzRWRpdEVuYWJsZW1lbnQoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHN0YW5kYXJkQWN0aW9uc0NvbnRleHQ6IFN0YW5kYXJkQWN0aW9uc0NvbnRleHQsXG5cdG1hc3NFZGl0VmlzaWJpbGl0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBwYXRoVXBkYXRhYmxlRXhwcmVzc2lvbiA9IHN0YW5kYXJkQWN0aW9uc0NvbnRleHQucmVzdHJpY3Rpb25zLmlzVXBkYXRhYmxlLmV4cHJlc3Npb247XG5cdGNvbnN0IGlzT25seUR5bmFtaWNPbkN1cnJlbnRFbnRpdHk6IGFueSA9XG5cdFx0IWlzQ29uc3RhbnQocGF0aFVwZGF0YWJsZUV4cHJlc3Npb24pICYmXG5cdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dC5yZXN0cmljdGlvbnMuaXNVcGRhdGFibGUubmF2aWdhdGlvbkV4cHJlc3Npb24uX3R5cGUgPT09IFwiVW5yZXNvbHZhYmxlXCI7XG5cdGNvbnN0IG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9IGdyZWF0ZXJPckVxdWFsKHBhdGhJbk1vZGVsKFwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXCIsIFwiaW50ZXJuYWxcIiksIDEpO1xuXHRjb25zdCBudW1iZXJPZlVwZGF0YWJsZUNvbnRleHRzID0gZ3JlYXRlck9yRXF1YWwobGVuZ3RoKHBhdGhJbk1vZGVsKFwidXBkYXRhYmxlQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKSksIDEpO1xuXHRjb25zdCBiSXNEcmFmdFN1cHBvcnRlZCA9IE1vZGVsSGVscGVyLmlzT2JqZWN0UGF0aERyYWZ0U3VwcG9ydGVkKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpKTtcblx0Y29uc3QgYkRpc3BsYXlNb2RlID0gaXNJbkRpc3BsYXlNb2RlKGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdC8vIG51bWJlck9mVXBkYXRhYmxlQ29udGV4dHMgbmVlZHMgdG8gYmUgYWRkZWQgdG8gdGhlIGJpbmRpbmcgaW4gY2FzZVxuXHQvLyAxLiBVcGRhdGUgaXMgZGVwZW5kZW50IG9uIGN1cnJlbnQgZW50aXR5IHByb3BlcnR5IChpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5IGlzIHRydWUpLlxuXHQvLyAyLiBUaGUgdGFibGUgaXMgcmVhZCBvbmx5IGFuZCBkcmFmdCBlbmFibGVkKGxpa2UgTFIpLCBpbiB0aGlzIGNhc2Ugb25seSBhY3RpdmUgY29udGV4dHMgY2FuIGJlIG1hc3MgZWRpdGVkLlxuXHQvLyAgICBTbywgdXBkYXRlIGRlcGVuZHMgb24gJ0lzQWN0aXZlRW50aXR5JyB2YWx1ZSB3aGljaCBuZWVkcyB0byBiZSBjaGVja2VkIHJ1bnRpbWUuXG5cdGNvbnN0IHJ1bnRpbWVCaW5kaW5nID0gaWZFbHNlKFxuXHRcdG9yKGFuZChiRGlzcGxheU1vZGUsIGJJc0RyYWZ0U3VwcG9ydGVkKSwgaXNPbmx5RHluYW1pY09uQ3VycmVudEVudGl0eSksXG5cdFx0YW5kKG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cywgbnVtYmVyT2ZVcGRhdGFibGVDb250ZXh0cyksXG5cdFx0YW5kKG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cylcblx0KTtcblxuXHRyZXR1cm4gYW5kKG1hc3NFZGl0VmlzaWJpbGl0eSwgaWZFbHNlKGlzT25seUR5bmFtaWNPbkN1cnJlbnRFbnRpdHksIHJ1bnRpbWVCaW5kaW5nLCBhbmQocnVudGltZUJpbmRpbmcsIHBhdGhVcGRhdGFibGVFeHByZXNzaW9uKSkpO1xufVxuXG4vKipcbiAqIFRlbGxzIGlmIHRoZSB0YWJsZSBpbiB0ZW1wbGF0ZSBpcyBpbiBkaXNwbGF5IG1vZGUuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSB2aWV3Q29uZmlndXJhdGlvblxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSB0YWJsZSBpcyBpbiBkaXNwbGF5IG1vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSW5EaXNwbGF5TW9kZShjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCB2aWV3Q29uZmlndXJhdGlvbj86IFZpZXdQYXRoQ29uZmlndXJhdGlvbik6IGJvb2xlYW4ge1xuXHRjb25zdCB0ZW1wbGF0ZVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpO1xuXHRpZiAoXG5cdFx0dGVtcGxhdGVUeXBlID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCB8fFxuXHRcdHRlbXBsYXRlVHlwZSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZSB8fFxuXHRcdCh2aWV3Q29uZmlndXJhdGlvbiAmJiBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnModmlld0NvbmZpZ3VyYXRpb24pKVxuXHQpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHQvLyB1cGRhdGFibGUgd2lsbCBiZSBoYW5kbGVkIGF0IHRoZSBwcm9wZXJ0eSBsZXZlbFxuXHRyZXR1cm4gZmFsc2U7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BNkJLQSx3QkFBd0I7RUFBQSxXQUF4QkEsd0JBQXdCO0lBQXhCQSx3QkFBd0I7SUFBeEJBLHdCQUF3QjtJQUF4QkEsd0JBQXdCO0VBQUEsR0FBeEJBLHdCQUF3QixLQUF4QkEsd0JBQXdCO0VBb0M3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTQyw4QkFBOEIsQ0FDN0NDLGdCQUFrQyxFQUNsQ0MsWUFBMEIsRUFDMUJDLDBCQUFxRCxFQUNyREMsaUJBQXlDLEVBQ2hCO0lBQ3pCLE9BQU87TUFDTkMsY0FBYyxFQUFFQyxtQkFBbUIsQ0FBQ0wsZ0JBQWdCLENBQUNNLHNCQUFzQixFQUFFLENBQUM7TUFD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