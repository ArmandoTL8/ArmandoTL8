/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/form/FormTemplating", "sap/m/library", "sap/ui/base/ManagedObject", "sap/ui/model/odata/v4/AnnotationHelper"], function (CommonUtils, BindingHelper, BindingToolkit, ModelHelper, DataModelPathHelper, CommonHelper, FieldTemplating, FormTemplating, mLibrary, ManagedObject, ODataModelAnnotationHelper) {
  "use strict";

  var _exports = {};
  var getLabelForConnectedFields = FormTemplating.getLabelForConnectedFields;
  var formatValueRecursively = FieldTemplating.formatValueRecursively;
  var addTextArrangementToBindingExpression = FieldTemplating.addTextArrangementToBindingExpression;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var or = BindingToolkit.or;
  var isEmpty = BindingToolkit.isEmpty;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var constant = BindingToolkit.constant;
  var concat = BindingToolkit.concat;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var Draft = BindingHelper.Draft;
  const ButtonType = mLibrary.ButtonType;
  //```mermaid
  // graph TD
  // A[Object Page Title] -->|Get DataField Value| C{Evaluate Create Mode}
  // C -->|In Create Mode| D{Is DataField Value empty}
  // D -->|Yes| F{Is there a TypeName}
  // F -->|Yes| G[Is there an custom title]
  // G -->|Yes| G1[Show the custom title + 'TypeName']
  // G -->|No| G2[Display the default title 'New + TypeName']
  // F -->|No| H[Is there a custom title]
  // H -->|Yes| I[Show the custom title]
  // H -->|No| J[Show the default 'Unamned Object']
  // D -->|No| E
  // C -->|Not in create mode| E[Show DataField Value]
  // ```
  /**
   * Compute the title for the object page.
   *
   * @param oHeaderInfo The @UI.HeaderInfo annotation content
   * @param oViewData The view data object we're currently on
   * @param fullContextPath The full context path used to reach that object page
   * @param oDraftRoot
   * @returns The binding expression for the object page title
   */
  const getExpressionForTitle = function (oHeaderInfo, oViewData, fullContextPath, oDraftRoot) {
    var _oHeaderInfo$Title, _oHeaderInfo$Title2, _oHeaderInfo$Title5, _oHeaderInfo$Title6;
    const titleNoHeaderInfo = CommonUtils.getTranslatedText("T_NEW_OBJECT", oViewData.resourceBundle, undefined, oViewData.entitySet);
    const titleWithHeaderInfo = CommonUtils.getTranslatedText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE", oViewData.resourceBundle, undefined, oViewData.entitySet);
    const oEmptyHeaderInfoTitle = (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : oHeaderInfo.Title) === undefined || (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : oHeaderInfo.Title) === "" || (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title = oHeaderInfo.Title) === null || _oHeaderInfo$Title === void 0 ? void 0 : _oHeaderInfo$Title.Value) === "";
    const titleForActiveHeaderNoHeaderInfo = !oEmptyHeaderInfoTitle ? CommonUtils.getTranslatedText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO", oViewData.resourceBundle) : "";
    let titleValueExpression,
      connectedFieldsPath,
      titleIsEmpty = constant(true),
      titleBooleanExpression;
    if ((oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title2 = oHeaderInfo.Title) === null || _oHeaderInfo$Title2 === void 0 ? void 0 : _oHeaderInfo$Title2.$Type) === "com.sap.vocabularies.UI.v1.DataField") {
      var _oHeaderInfo$Title3, _oHeaderInfo$Title4, _oHeaderInfo$Title4$V, _oHeaderInfo$Title4$V2, _oHeaderInfo$Title4$V3, _oHeaderInfo$Title4$V4, _oHeaderInfo$Title4$V5, _oHeaderInfo$Title4$V6, _oHeaderInfo$Title4$V7, _titleValueExpression, _titleValueExpression2;
      titleValueExpression = getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title3 = oHeaderInfo.Title) === null || _oHeaderInfo$Title3 === void 0 ? void 0 : _oHeaderInfo$Title3.Value);
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && (_oHeaderInfo$Title4 = oHeaderInfo.Title) !== null && _oHeaderInfo$Title4 !== void 0 && (_oHeaderInfo$Title4$V = _oHeaderInfo$Title4.Value) !== null && _oHeaderInfo$Title4$V !== void 0 && (_oHeaderInfo$Title4$V2 = _oHeaderInfo$Title4$V.$target) !== null && _oHeaderInfo$Title4$V2 !== void 0 && (_oHeaderInfo$Title4$V3 = _oHeaderInfo$Title4$V2.annotations) !== null && _oHeaderInfo$Title4$V3 !== void 0 && (_oHeaderInfo$Title4$V4 = _oHeaderInfo$Title4$V3.Common) !== null && _oHeaderInfo$Title4$V4 !== void 0 && (_oHeaderInfo$Title4$V5 = _oHeaderInfo$Title4$V4.Text) !== null && _oHeaderInfo$Title4$V5 !== void 0 && (_oHeaderInfo$Title4$V6 = _oHeaderInfo$Title4$V5.annotations) !== null && _oHeaderInfo$Title4$V6 !== void 0 && (_oHeaderInfo$Title4$V7 = _oHeaderInfo$Title4$V6.UI) !== null && _oHeaderInfo$Title4$V7 !== void 0 && _oHeaderInfo$Title4$V7.TextArrangement) {
        // In case an explicit text arrangement was set we make use of it in the description as well
        titleValueExpression = addTextArrangementToBindingExpression(titleValueExpression, fullContextPath);
      }
      titleValueExpression = formatValueRecursively(titleValueExpression, fullContextPath);
      titleIsEmpty = ((_titleValueExpression = titleValueExpression) === null || _titleValueExpression === void 0 ? void 0 : _titleValueExpression._type) === "Constant" ? constant(!((_titleValueExpression2 = titleValueExpression) !== null && _titleValueExpression2 !== void 0 && _titleValueExpression2.value)) : isEmpty(titleValueExpression);
    } else if ((oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title5 = oHeaderInfo.Title) === null || _oHeaderInfo$Title5 === void 0 ? void 0 : _oHeaderInfo$Title5.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title6 = oHeaderInfo.Title) === null || _oHeaderInfo$Title6 === void 0 ? void 0 : _oHeaderInfo$Title6.Target.$target.$Type) === "com.sap.vocabularies.UI.v1.ConnectedFieldsType") {
      var _titleValueExpression3, _titleValueExpression4;
      connectedFieldsPath = enhanceDataModelPath(fullContextPath, "$Type/@UI.HeaderInfo/Title/Target/$AnnotationPath");
      titleValueExpression = getLabelForConnectedFields(connectedFieldsPath, false);
      titleBooleanExpression = ((_titleValueExpression3 = titleValueExpression) === null || _titleValueExpression3 === void 0 ? void 0 : _titleValueExpression3._type) === "Constant" ? constant(!((_titleValueExpression4 = titleValueExpression) !== null && _titleValueExpression4 !== void 0 && _titleValueExpression4.value)) : isEmpty(titleValueExpression);
      titleIsEmpty = titleValueExpression ? titleBooleanExpression : constant(true);
    }

    // If there is a TypeName defined, show the default title 'New + TypeName', otherwise show the custom title or the default 'New object'
    const createModeTitle = oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.TypeName ? concat(titleWithHeaderInfo, ": ", resolveBindingString(oHeaderInfo.TypeName.toString())) : titleNoHeaderInfo;
    const activeExpression = oDraftRoot ? Entity.IsActive : true;
    return compileExpression(ifElse(and(UI.IsCreateMode, titleIsEmpty), createModeTitle,
    // Otherwise show the default expression
    ifElse(and(activeExpression, titleIsEmpty), titleForActiveHeaderNoHeaderInfo, titleValueExpression)));
  };

  /**
   * Retrieves the expression for the description of an object page.
   *
   * @param oHeaderInfo The @UI.HeaderInfo annotation content
   * @param fullContextPath The full context path used to reach that object page
   * @returns The binding expression for the object page description
   */
  _exports.getExpressionForTitle = getExpressionForTitle;
  const getExpressionForDescription = function (oHeaderInfo, fullContextPath) {
    var _oHeaderInfo$Descript, _oHeaderInfo$Descript2, _oHeaderInfo$Descript3, _oHeaderInfo$Descript4, _oHeaderInfo$Descript5, _oHeaderInfo$Descript6, _oHeaderInfo$Descript7, _oHeaderInfo$Descript8, _oHeaderInfo$Descript9;
    let pathInModel = getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Descript = oHeaderInfo.Description) === null || _oHeaderInfo$Descript === void 0 ? void 0 : _oHeaderInfo$Descript.Value);
    if (oHeaderInfo !== null && oHeaderInfo !== void 0 && (_oHeaderInfo$Descript2 = oHeaderInfo.Description) !== null && _oHeaderInfo$Descript2 !== void 0 && (_oHeaderInfo$Descript3 = _oHeaderInfo$Descript2.Value) !== null && _oHeaderInfo$Descript3 !== void 0 && (_oHeaderInfo$Descript4 = _oHeaderInfo$Descript3.$target) !== null && _oHeaderInfo$Descript4 !== void 0 && (_oHeaderInfo$Descript5 = _oHeaderInfo$Descript4.annotations) !== null && _oHeaderInfo$Descript5 !== void 0 && (_oHeaderInfo$Descript6 = _oHeaderInfo$Descript5.Common) !== null && _oHeaderInfo$Descript6 !== void 0 && (_oHeaderInfo$Descript7 = _oHeaderInfo$Descript6.Text) !== null && _oHeaderInfo$Descript7 !== void 0 && (_oHeaderInfo$Descript8 = _oHeaderInfo$Descript7.annotations) !== null && _oHeaderInfo$Descript8 !== void 0 && (_oHeaderInfo$Descript9 = _oHeaderInfo$Descript8.UI) !== null && _oHeaderInfo$Descript9 !== void 0 && _oHeaderInfo$Descript9.TextArrangement) {
      // In case an explicit text arrangement was set we make use of it in the description as well
      pathInModel = addTextArrangementToBindingExpression(pathInModel, fullContextPath);
    }
    return compileExpression(formatValueRecursively(pathInModel, fullContextPath));
  };

  /**
   * Return the expression for the save button.
   *
   * @param oViewData The current view data
   * @param fullContextPath The path used up until here
   * @returns The binding expression that shows the right save button text
   */
  _exports.getExpressionForDescription = getExpressionForDescription;
  const getExpressionForSaveButton = function (oViewData, fullContextPath) {
    var _annotations$Session;
    const saveButtonText = CommonUtils.getTranslatedText("T_OP_OBJECT_PAGE_SAVE", oViewData.resourceBundle);
    const createButtonText = CommonUtils.getTranslatedText("T_OP_OBJECT_PAGE_CREATE", oViewData.resourceBundle);
    let saveExpression;
    if ((_annotations$Session = fullContextPath.startingEntitySet.annotations.Session) !== null && _annotations$Session !== void 0 && _annotations$Session.StickySessionSupported) {
      // If we're in sticky mode AND the ui is in create mode, show Create, else show Save
      saveExpression = ifElse(UI.IsCreateMode, createButtonText, saveButtonText);
    } else {
      // If we're in draft AND the draft is a new object (!IsActiveEntity && !HasActiveEntity), show create, else show save
      saveExpression = ifElse(Draft.IsNewObject, createButtonText, saveButtonText);
    }
    return compileExpression(saveExpression);
  };

  /**
   * Method returns whether footer is visible or not on object / subobject page.
   *
   * @function
   * @name getFooterVisible
   * @param footerActions The footer action object coming from the converter
   * @param dataFields Data field array for normal footer visibility processing
   * @returns `true` if any action is true, otherwise compiled Binding or `false`
   */
  _exports.getExpressionForSaveButton = getExpressionForSaveButton;
  const getFooterVisible = function (footerActions, dataFields) {
    const manifestActions = footerActions.filter(action => isManifestAction(action));
    let customActionVisibility;
    if (manifestActions.length) {
      // If we have manifest actions
      const customActionIndividualVisibility = manifestActions.map(action => {
        return resolveBindingString(action.visible, "boolean");
      });
      // construct the footer's visibility-binding out of all actions' visibility-bindings, first the binding of all custom actions ...
      customActionVisibility = or(...customActionIndividualVisibility);
      // and then the binding of all annotation actions inside the footer ...
      const annotationActionVisibility = getDataFieldBasedFooterVisibility(dataFields, true);
      // finally, return everything.
      return compileExpression(or(customActionVisibility, resolveBindingString(annotationActionVisibility, "boolean")));
    }
    return getDataFieldBasedFooterVisibility(dataFields, true);
  };

  /**
   * Checks if the footer is visible or not.
   *
   * @function
   * @static
   * @name sap.fe.templates.ObjectPage.ObjectPageTemplating.getDataFieldBasedFooterVisibility
   * @memberof sap.fe.templates.ObjectPage.ObjectPageTemplating
   * @param aDataFields Array of DataFields in the identification
   * @param bConsiderEditable Whether the edit mode binding is required or not
   * @returns An expression if all the actions are ui.hidden, true otherwise
   * @private
   * @ui5-restricted
   */
  _exports.getFooterVisible = getFooterVisible;
  const getDataFieldBasedFooterVisibility = function (aDataFields, bConsiderEditable) {
    let sHiddenExpression = "";
    let sSemiHiddenExpression;
    const aHiddenActionPath = [];
    for (const i in aDataFields) {
      const oDataField = aDataFields[i];
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && oDataField.Determining === true) {
        const hiddenExpression = oDataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`];
        if (!hiddenExpression) {
          return true;
        } else if (hiddenExpression.$Path) {
          if (aHiddenActionPath.indexOf(hiddenExpression.$Path) === -1) {
            aHiddenActionPath.push(hiddenExpression.$Path);
          }
        }
      }
    }
    if (aHiddenActionPath.length) {
      for (let index = 0; index < aHiddenActionPath.length; index++) {
        if (aHiddenActionPath[index]) {
          sSemiHiddenExpression = "(%{" + aHiddenActionPath[index] + "} === true ? false : true )";
        }
        if (index == aHiddenActionPath.length - 1) {
          sHiddenExpression = sHiddenExpression + sSemiHiddenExpression;
        } else {
          sHiddenExpression = sHiddenExpression + sSemiHiddenExpression + "||";
        }
      }
      return "{= " + (bConsiderEditable ? "(" : "") + sHiddenExpression + (bConsiderEditable ? " || ${ui>/isEditable}) " : " ") + "&& ${internal>isCreateDialogOpen} !== true}";
    } else {
      return "{= " + (bConsiderEditable ? "${ui>/isEditable} && " : "") + "${internal>isCreateDialogOpen} !== true}";
    }
  };

  /**
   * Method returns Whether the action type is manifest or not.
   *
   * @function
   * @name isManifestActionVisible
   * @param oAction The action object
   * @returns `true` if action is coming from manifest, `false` otherwise
   */
  _exports.getDataFieldBasedFooterVisibility = getDataFieldBasedFooterVisibility;
  const isManifestAction = function (oAction) {
    const aActions = ["Primary", "DefaultApply", "Secondary", "ForAction", "ForNavigation", "SwitchToActiveObject", "SwitchToDraftObject", "DraftActions", "Copy"];
    return aActions.indexOf(oAction.type) < 0;
  };

  /**
   * If a critical action is rendered, it is considered to be the primary action.
   * Hence, the primary action of the template is set back to Default.
   *
   * @function
   * @static
   * @name sap.fe.templates.ObjectPage.ObjectPageTemplating.buildEmphasizedButtonExpression
   * @memberof sap.fe.templates.ObjectPage.ObjectPageTemplating
   * @param aIdentification Array of all the DataFields in Identification
   * @returns An expression to deduce if button type is Default or Emphasized
   * @private
   * @ui5-restricted
   */
  _exports.isManifestAction = isManifestAction;
  const buildEmphasizedButtonExpression = function (aIdentification) {
    if (!aIdentification) {
      return ButtonType.Emphasized;
    }
    let sFormatEmphasizedExpression;
    let bIsAlwaysDefault,
      sHiddenSimplePath,
      sHiddenExpression = "";
    aIdentification.forEach(function (oDataField) {
      const oCriticalityProperty = oDataField.Criticality;
      const oDataFieldHidden = oDataField["@com.sap.vocabularies.UI.v1.Hidden"];
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && !bIsAlwaysDefault && oCriticalityProperty) {
        if (!sFormatEmphasizedExpression && oDataFieldHidden === true) {
          // if DataField is set to hidden, we can skip other checks and return Default button type
          sFormatEmphasizedExpression = ButtonType.Emphasized;
          return;
        }
        if (oDataFieldHidden && oDataFieldHidden.$Path) {
          // when visibility of critical button is based on path, collect all paths for expression
          sHiddenSimplePath = oDataFieldHidden.$Path;
          if (sHiddenExpression) {
            sHiddenExpression = sHiddenExpression + " && ";
          }
          sHiddenExpression = sHiddenExpression + "%{" + sHiddenSimplePath + "} === true";
          sFormatEmphasizedExpression = "{= (" + sHiddenExpression + ") ? 'Emphasized' : 'Default' }";
        }
        switch (oCriticalityProperty.$EnumMember) {
          // supported criticality are [Positive/3/'3'] and [Negative/1/'1']
          case "com.sap.vocabularies.UI.v1.CriticalityType/Negative":
          case "com.sap.vocabularies.UI.v1.CriticalityType/Positive":
          case "1":
          case 1:
          case "3":
          case 3:
            if (!oDataFieldHidden) {
              sFormatEmphasizedExpression = ButtonType.Default;
              bIsAlwaysDefault = true;
            }
            sFormatEmphasizedExpression = sFormatEmphasizedExpression || ButtonType.Default;
            break;
          default:
            sFormatEmphasizedExpression = ButtonType.Emphasized;
        }
        if (oCriticalityProperty.$Path) {
          // when Criticality is set using a path, use the path for deducing the Emphsized type for default Primary Action
          const sCombinedHiddenExpression = sHiddenExpression ? "!(" + sHiddenExpression + ") && " : "";
          sFormatEmphasizedExpression = "{= " + sCombinedHiddenExpression + "((${" + oCriticalityProperty.$Path + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Negative') || (${" + oCriticalityProperty.$Path + "} === '1') || (${" + oCriticalityProperty.$Path + "} === 1) " + "|| (${" + oCriticalityProperty.$Path + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Positive') || (${" + oCriticalityProperty.$Path + "} === '3') || (${" + oCriticalityProperty.$Path + "} === 3)) ? " + "'Default'" + " : " + "'Emphasized'" + " }";
        }
      }
    });
    return sFormatEmphasizedExpression || ButtonType.Emphasized;
  };
  _exports.buildEmphasizedButtonExpression = buildEmphasizedButtonExpression;
  const getElementBinding = function (sPath) {
    const sNavigationPath = ODataModelAnnotationHelper.getNavigationPath(sPath);
    if (sNavigationPath) {
      return "{path:'" + sNavigationPath + "'}";
    } else {
      //no navigation property needs empty object
      return "{path: ''}";
    }
  };

  /**
   * Function to check if draft pattern is supported.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns the Boolean value based on draft state
   */
  _exports.getElementBinding = getElementBinding;
  const checkDraftState = function (oAnnotations) {
    if (oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] && oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["EditAction"]) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchToActive button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.checkDraftState = checkDraftState;
  const getSwitchToActiveVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( ${ui>/isEditable} && !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchToDraft button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.getSwitchToActiveVisibility = getSwitchToActiveVisibility;
  const getSwitchToDraftVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !(${ui>/isEditable}) && !${ui>createMode} && ${HasDraftEntity} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchDraftAndActive button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.getSwitchToDraftVisibility = getSwitchToDraftVisibility;
  const getSwitchDraftAndActiveVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to find an action from the array of header actions in the converter context.
   *
   * @param aConverterContextHeaderActions Array of 'header' actions on the object page.
   * @param sActionType The action type
   * @returns The action with the matching action type
   * @private
   */
  _exports.getSwitchDraftAndActiveVisibility = getSwitchDraftAndActiveVisibility;
  const _findAction = function (aConverterContextHeaderActions, sActionType) {
    let oAction;
    if (aConverterContextHeaderActions && aConverterContextHeaderActions.length) {
      oAction = aConverterContextHeaderActions.find(function (oHeaderAction) {
        return oHeaderAction.type === sActionType;
      });
    }
    return oAction;
  };

  /**
   * Function to format the 'enabled' property for the Delete button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports._findAction = _findAction;
  const getDeleteCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.enabled : "true";
  };

  /**
   * Function to format the 'visible' property for the Delete button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionEnabled = getDeleteCommandExecutionEnabled;
  const getDeleteCommandExecutionVisible = function (aConverterContextHeaderActions) {
    const oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.visible : "true";
  };

  /**
   * Function to format the 'visible' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionVisible = getDeleteCommandExecutionVisible;
  const getEditCommandExecutionVisible = function (aConverterContextHeaderActions) {
    const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.visible : "false";
  };

  /**
   * Function to format the 'enabled' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getEditCommandExecutionVisible = getEditCommandExecutionVisible;
  const getEditCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    const oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.enabled : "false";
  };

  /**
   * Function to get the EditAction from the based on a draft-enabled application or a sticky application.
   *
   * @param [oEntitySet] The value from the expression.
   * @returns Returns expression binding or Boolean value based on vRawValue & oDraftNode
   */
  _exports.getEditCommandExecutionEnabled = getEditCommandExecutionEnabled;
  const getEditAction = function (oEntitySet) {
    const sPath = oEntitySet.getPath();
    const aPaths = sPath.split("/");
    const rootEntitySetPath = "/" + aPaths[1];
    // get the edit action from root entity sets
    const rootEntitySetAnnnotations = oEntitySet.getObject(rootEntitySetPath + "@");
    const bDraftRoot = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftRoot");
    const bDraftNode = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftNode");
    const bStickySession = rootEntitySetAnnnotations.hasOwnProperty("@com.sap.vocabularies.Session.v1.StickySessionSupported");
    let sActionName;
    if (bDraftRoot) {
      sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/EditAction`);
    } else if (bDraftNode) {
      sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Common.v1.DraftNode/EditAction`);
    } else if (bStickySession) {
      sActionName = oEntitySet.getObject(`${rootEntitySetPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/EditAction`);
    }
    return !sActionName ? sActionName : `${rootEntitySetPath}/${sActionName}`;
  };
  _exports.getEditAction = getEditAction;
  const isReadOnlyFromStaticAnnotations = function (oAnnotations, oFieldControl) {
    let bComputed, bImmutable, bReadOnly;
    if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Computed"]) {
      bComputed = oAnnotations["@Org.OData.Core.V1.Computed"].Bool ? oAnnotations["@Org.OData.Core.V1.Computed"].Bool == "true" : true;
    }
    if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Immutable"]) {
      bImmutable = oAnnotations["@Org.OData.Core.V1.Immutable"].Bool ? oAnnotations["@Org.OData.Core.V1.Immutable"].Bool == "true" : true;
    }
    bReadOnly = bComputed || bImmutable;
    if (oFieldControl) {
      bReadOnly = bReadOnly || oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly";
    }
    if (bReadOnly) {
      return true;
    } else {
      return false;
    }
  };
  _exports.isReadOnlyFromStaticAnnotations = isReadOnlyFromStaticAnnotations;
  const readOnlyExpressionFromDynamicAnnotations = function (oFieldControl) {
    let sIsFieldControlPathReadOnly;
    if (oFieldControl) {
      if (ManagedObject.bindingParser(oFieldControl)) {
        sIsFieldControlPathReadOnly = "%" + oFieldControl + " === 1 ";
      }
    }
    if (sIsFieldControlPathReadOnly) {
      return "{= " + sIsFieldControlPathReadOnly + "? false : true }";
    } else {
      return undefined;
    }
  };

  /*
   * Function to get the expression for chart Title Press
   *
   * @functionw
   * @param {oConfiguration} [oConfigurations] control configuration from manifest
   *  @param {oManifest} [oManifest] Outbounds from manifest
   * returns {String} [sCollectionName] Collection Name of the Micro Chart
   *
   * returns {String} [Expression] Handler Expression for the title press
   *
   */
  _exports.readOnlyExpressionFromDynamicAnnotations = readOnlyExpressionFromDynamicAnnotations;
  const getExpressionForMicroChartTitlePress = function (oConfiguration, oManifestOutbound, sCollectionName) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] || oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] && oConfiguration["targetSections"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>/},'" + JSON.stringify(oManifestOutbound) + "','" + oConfiguration["targetOutbound"]["outbound"] + "','" + sCollectionName + "' )";
      } else if (oConfiguration["targetSections"]) {
        return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
      } else {
        return undefined;
      }
    }
  };

  /*
   * Function to render Chart Title as Link
   *
   * @function
   * @param {oControlConfiguration} [oConfigurations] control configuration from manifest
   * returns {String} [sKey] For the TargetOutbound and TargetSection
   *
   */
  _exports.getExpressionForMicroChartTitlePress = getExpressionForMicroChartTitlePress;
  const getMicroChartTitleAsLink = function (oControlConfiguration) {
    if (oControlConfiguration && (oControlConfiguration["targetOutbound"] || oControlConfiguration["targetOutbound"] && oControlConfiguration["targetSections"])) {
      return "External";
    } else if (oControlConfiguration && oControlConfiguration["targetSections"]) {
      return "InPage";
    } else {
      return "None";
    }
  };

  /* Get groupId from control configuration
   *
   * @function
   * @param {Object} [oConfigurations] control configuration from manifest
   * @param {String} [sAnnotationPath] Annotation Path for the configuration
   * @description Used to get the groupId for DataPoints and MicroCharts in the Header.
   *
   */
  _exports.getMicroChartTitleAsLink = getMicroChartTitleAsLink;
  const getGroupIdFromConfig = function (oConfigurations, sAnnotationPath, sDefaultGroupId) {
    const oConfiguration = oConfigurations[sAnnotationPath],
      aAutoPatterns = ["Heroes", "Decoration", "Workers", "LongRunners"];
    let sGroupId = sDefaultGroupId;
    if (oConfiguration && oConfiguration.requestGroupId && aAutoPatterns.some(function (autoPattern) {
      return autoPattern === oConfiguration.requestGroupId;
    })) {
      sGroupId = "$auto." + oConfiguration.requestGroupId;
    }
    return sGroupId;
  };

  /*
   * Get Context Binding with groupId from control configuration
   *
   * @function
   * @param {Object} [oConfigurations] control configuration from manifest
   * @param {String} [sKey] Annotation Path for of the configuration
   * @description Used to get the binding for DataPoints in the Header.
   *
   */
  _exports.getGroupIdFromConfig = getGroupIdFromConfig;
  const getBindingWithGroupIdFromConfig = function (oConfigurations, sKey) {
    const sGroupId = getGroupIdFromConfig(oConfigurations, sKey);
    let sBinding;
    if (sGroupId) {
      sBinding = "{ path : '', parameters : { $$groupId : '" + sGroupId + "' } }";
    }
    return sBinding;
  };

  /**
   * Method to check whether a FieldGroup consists of only 1 DataField with MultiLine Text annotation.
   *
   * @param aFormElements A collection of form elements used in the current field group
   * @returns Returns true if only 1 data field with Multiline Text annotation exists.
   */
  _exports.getBindingWithGroupIdFromConfig = getBindingWithGroupIdFromConfig;
  const doesFieldGroupContainOnlyOneMultiLineDataField = function (aFormElements) {
    return aFormElements && aFormElements.length === 1 && !!aFormElements[0].isValueMultilineText;
  };

  /*
   * Get Visiblity of breadcrumbs.
   *
   * @function
   * @param {Object} [oViewData] ViewData model
   * returns {*} Expression or boolean
   */
  _exports.doesFieldGroupContainOnlyOneMultiLineDataField = doesFieldGroupContainOnlyOneMultiLineDataField;
  const getVisibleExpressionForBreadcrumbs = function (oViewData) {
    return oViewData.showBreadCrumbs && oViewData.fclEnabled !== undefined ? "{fclhelper>/breadCrumbIsVisible}" : oViewData.showBreadCrumbs;
  };
  _exports.getVisibleExpressionForBreadcrumbs = getVisibleExpressionForBreadcrumbs;
  const getShareButtonVisibility = function (viewData) {
    let sShareButtonVisibilityExp = "!${ui>createMode}";
    if (viewData.fclEnabled) {
      sShareButtonVisibilityExp = "${fclhelper>/showShareIcon} && " + sShareButtonVisibilityExp;
    }
    return "{= " + sShareButtonVisibilityExp + " }";
  };

  /*
   * Gets the visibility of the header info in edit mode
   *
   * If either the title or description field from the header annotations are editable, then the
   * editable header info is visible.
   *
   * @function
   * @param {object} [oAnnotations] Annotations object for given entity set
   * @param {object} [oFieldControl] field control
   * returns {*}  binding expression or boolean value resolved form funcitons isReadOnlyFromStaticAnnotations and isReadOnlyFromDynamicAnnotations
   */
  _exports.getShareButtonVisibility = getShareButtonVisibility;
  const getVisiblityOfHeaderInfo = function (oTitleAnnotations, oDescriptionAnnotations, oFieldTitleFieldControl, oFieldDescriptionFieldControl) {
    // Check Annotations for Title Field
    // Set to true and don't take into account, if there are no annotations, i.e. no title exists
    const bIsTitleReadOnly = oTitleAnnotations ? isReadOnlyFromStaticAnnotations(oTitleAnnotations, oFieldTitleFieldControl) : true;
    const titleExpression = readOnlyExpressionFromDynamicAnnotations(oFieldTitleFieldControl);
    // There is no expression and the title is not ready only, this is sufficient for an editable header
    if (!bIsTitleReadOnly && !titleExpression) {
      return true;
    }

    // Check Annotations for Description Field
    // Set to true and don't take into account, if there are no annotations, i.e. no description exists
    const bIsDescriptionReadOnly = oDescriptionAnnotations ? isReadOnlyFromStaticAnnotations(oDescriptionAnnotations, oFieldDescriptionFieldControl) : true;
    const descriptionExpression = readOnlyExpressionFromDynamicAnnotations(oFieldDescriptionFieldControl);
    // There is no expression and the description is not ready only, this is sufficient for an editable header
    if (!bIsDescriptionReadOnly && !descriptionExpression) {
      return true;
    }

    // Both title and description are not editable and there are no dynamic annotations
    if (bIsTitleReadOnly && bIsDescriptionReadOnly && !titleExpression && !descriptionExpression) {
      return false;
    }

    // Now combine expressions
    if (titleExpression && !descriptionExpression) {
      return titleExpression;
    } else if (!titleExpression && descriptionExpression) {
      return descriptionExpression;
    } else {
      return combineTitleAndDescriptionExpression(oFieldTitleFieldControl, oFieldDescriptionFieldControl);
    }
  };
  _exports.getVisiblityOfHeaderInfo = getVisiblityOfHeaderInfo;
  const combineTitleAndDescriptionExpression = function (oTitleFieldControl, oDescriptionFieldControl) {
    // If both header and title field are based on dynmaic field control, the editable header
    // is visible if at least one of these is not ready only
    return "{= %" + oTitleFieldControl + " === 1 ? ( %" + oDescriptionFieldControl + " === 1 ? false : true ) : true }";
  };

  /*
   * Get Expression of press event of delete button.
   *
   * @function
   * @param {string} [sEntitySetName] Entity set name
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.combineTitleAndDescriptionExpression = combineTitleAndDescriptionExpression;
  const getPressExpressionForDelete = function (entitySet, oInterface) {
    const sDeletableContexts = "${$view>/getBindingContext}",
      sTitle = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedHeading/getItems/1/getText}",
      sDescription = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedContent/0/getItems/0/getText}";
    const esContext = oInterface && oInterface.context;
    const contextPath = esContext.getPath();
    const contextPathParts = contextPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const sEntitySetName = contextPathParts.length > 1 ? esContext.getModel().getObject(`/${contextPathParts.join("/")}@sapui.name`) : contextPathParts[0];
    const oParams = {
      title: sTitle,
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      description: sDescription
    };
    return CommonHelper.generateFunction(".editFlow.deleteDocument", sDeletableContexts, CommonHelper.objectToString(oParams));
  };
  getPressExpressionForDelete.requiresIContext = true;

  /*
   * Get Expression of press event of Edit button.
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.getPressExpressionForDelete = getPressExpressionForDelete;
  const getPressExpressionForEdit = function (oDataField, sEntitySetName, oHeaderAction) {
    const sEditableContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/getBindingContext}",
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField && oDataField.Label, true),
      isNavigable: oHeaderAction && oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sEditableContexts, CommonHelper.objectToString(oParams));
  };

  /*
   * Method to get the expression for the 'press' event for footer annotation actions
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * returns {string}  Binding expression or function string that is generated from the Commonhelper's function generateFunction
   */
  _exports.getPressExpressionForEdit = getPressExpressionForEdit;
  const getPressExpressionForFooterAnnotationAction = function (oDataField, sEntitySetName, oHeaderAction) {
    const sActionContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField && oDataField.Label, true),
      isNavigable: oHeaderAction && oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sActionContexts, CommonHelper.objectToString(oParams));
  };

  /*
   * Get Expression of execute event expression of primary action.
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * @param {CompiledBindingToolkitExpression | string} The visibility of sematic positive action
   * @param {CompiledBindingToolkitExpression | string} The enablement of semantic positive action
   * @param {CompiledBindingToolkitExpression | string} The Edit button visibility
   * @param {CompiledBindingToolkitExpression | string} The enablement of Edit button
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.getPressExpressionForFooterAnnotationAction = getPressExpressionForFooterAnnotationAction;
  const getPressExpressionForPrimaryAction = function (oDataField, sEntitySetName, oHeaderAction, positiveActionVisible, positiveActionEnabled, editActionVisible, editActionEnabled) {
    const sActionContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    const oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: sEntitySetName ? CommonHelper.addSingleQuotes(sEntitySetName) : "",
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField === null || oDataField === void 0 ? void 0 : oDataField.Label, true),
      isNavigable: oHeaderAction === null || oHeaderAction === void 0 ? void 0 : oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction !== null && oHeaderAction !== void 0 && oHeaderAction.defaultValuesExtensionFunction ? `'${oHeaderAction.defaultValuesExtensionFunction}'` : undefined
    };
    const oConditions = {
      positiveActionVisible,
      positiveActionEnabled,
      editActionVisible,
      editActionEnabled
    };
    return CommonHelper.generateFunction(".handlers.onPrimaryAction", "$controller", "${$view>/}", "${$view>/getBindingContext}", sActionContexts, CommonHelper.objectToString(oParams), CommonHelper.objectToString(oConditions));
  };

  /*
   * Gets the binding of the container HBox for the header facet.
   *
   * @function
   * @param {object} [oControlConfiguration] The control configuration form of the viewData model
   * @param {object} [oHeaderFacet] The object of the header facet
   * returns {*}  The binding expression from function getBindingWithGroupIdFromConfig or undefined.
   */
  _exports.getPressExpressionForPrimaryAction = getPressExpressionForPrimaryAction;
  const getStashableHBoxBinding = function (oControlConfiguration, oHeaderFacet) {
    if (oHeaderFacet && oHeaderFacet.Facet && oHeaderFacet.Facet.targetAnnotationType === "DataPoint") {
      return getBindingWithGroupIdFromConfig(oControlConfiguration, oHeaderFacet.Facet.targetAnnotationValue);
    }
  };

  /*
   * Gets the 'Press' event expression for the external and internal data point link.
   *
   * @function
   * @param {object} [oConfiguration] Control configuration from manifest
   * @param {object} [oManifestOutbound] Outbounds from manifest
   * returns {string} The runtime binding of the 'Press' event
   */
  _exports.getStashableHBoxBinding = getStashableHBoxBinding;
  const getPressExpressionForLink = function (oConfiguration, oManifestOutbound) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>}, " + JSON.stringify(oManifestOutbound) + "," + JSON.stringify(oConfiguration["targetOutbound"]["outbound"]) + ")";
      } else if (oConfiguration["targetSections"]) {
        return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
      } else {
        return undefined;
      }
    }
  };
  _exports.getPressExpressionForLink = getPressExpressionForLink;
  const getHeaderFormHboxRenderType = function (dataField) {
    var _dataField$targetObje;
    if ((dataField === null || dataField === void 0 ? void 0 : (_dataField$targetObje = dataField.targetObject) === null || _dataField$targetObje === void 0 ? void 0 : _dataField$targetObje.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      return undefined;
    }
    return "Bare";
  };

  /**
   * The default action group handler that is invoked when adding the menu button handling appropriately.
   *
   * @param oCtx The current context in which the handler is called
   * @param oAction The current action context
   * @param oDataFieldForDefaultAction The current dataField for the default action
   * @param defaultActionContextOrEntitySet The current context for the default action
   * @returns The appropriate expression string
   */
  _exports.getHeaderFormHboxRenderType = getHeaderFormHboxRenderType;
  function getDefaultActionHandler(oCtx, oAction, oDataFieldForDefaultAction, defaultActionContextOrEntitySet) {
    if (oAction.defaultAction) {
      try {
        switch (oAction.defaultAction.type) {
          case "ForAction":
            {
              return getPressExpressionForEdit(oDataFieldForDefaultAction, defaultActionContextOrEntitySet, oAction.defaultAction);
            }
          case "ForNavigation":
            {
              if (oAction.defaultAction.command) {
                return "cmd:" + oAction.defaultAction.command;
              } else {
                return oAction.defaultAction.press;
              }
            }
          default:
            {
              if (oAction.defaultAction.command) {
                return "cmd:" + oAction.defaultAction.command;
              }
              if (oAction.defaultAction.noWrap) {
                return oAction.defaultAction.press;
              } else {
                return CommonHelper.buildActionWrapper(oAction.defaultAction, {
                  id: "forTheObjectPage"
                });
              }
            }
        }
      } catch (ioEx) {
        return "binding for the default action is not working as expected";
      }
    }
    return undefined;
  }
  _exports.getDefaultActionHandler = getDefaultActionHandler;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibUxpYnJhcnkiLCJnZXRFeHByZXNzaW9uRm9yVGl0bGUiLCJvSGVhZGVySW5mbyIsIm9WaWV3RGF0YSIsImZ1bGxDb250ZXh0UGF0aCIsIm9EcmFmdFJvb3QiLCJ0aXRsZU5vSGVhZGVySW5mbyIsIkNvbW1vblV0aWxzIiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJyZXNvdXJjZUJ1bmRsZSIsInVuZGVmaW5lZCIsImVudGl0eVNldCIsInRpdGxlV2l0aEhlYWRlckluZm8iLCJvRW1wdHlIZWFkZXJJbmZvVGl0bGUiLCJUaXRsZSIsIlZhbHVlIiwidGl0bGVGb3JBY3RpdmVIZWFkZXJOb0hlYWRlckluZm8iLCJ0aXRsZVZhbHVlRXhwcmVzc2lvbiIsImNvbm5lY3RlZEZpZWxkc1BhdGgiLCJ0aXRsZUlzRW1wdHkiLCJjb25zdGFudCIsInRpdGxlQm9vbGVhbkV4cHJlc3Npb24iLCIkVHlwZSIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIiR0YXJnZXQiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlRleHQiLCJVSSIsIlRleHRBcnJhbmdlbWVudCIsImFkZFRleHRBcnJhbmdlbWVudFRvQmluZGluZ0V4cHJlc3Npb24iLCJmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5IiwiX3R5cGUiLCJ2YWx1ZSIsImlzRW1wdHkiLCJUYXJnZXQiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsImdldExhYmVsRm9yQ29ubmVjdGVkRmllbGRzIiwiY3JlYXRlTW9kZVRpdGxlIiwiVHlwZU5hbWUiLCJjb25jYXQiLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsInRvU3RyaW5nIiwiYWN0aXZlRXhwcmVzc2lvbiIsIkVudGl0eSIsIklzQWN0aXZlIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJhbmQiLCJJc0NyZWF0ZU1vZGUiLCJnZXRFeHByZXNzaW9uRm9yRGVzY3JpcHRpb24iLCJwYXRoSW5Nb2RlbCIsIkRlc2NyaXB0aW9uIiwiZ2V0RXhwcmVzc2lvbkZvclNhdmVCdXR0b24iLCJzYXZlQnV0dG9uVGV4dCIsImNyZWF0ZUJ1dHRvblRleHQiLCJzYXZlRXhwcmVzc2lvbiIsInN0YXJ0aW5nRW50aXR5U2V0IiwiU2Vzc2lvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJEcmFmdCIsIklzTmV3T2JqZWN0IiwiZ2V0Rm9vdGVyVmlzaWJsZSIsImZvb3RlckFjdGlvbnMiLCJkYXRhRmllbGRzIiwibWFuaWZlc3RBY3Rpb25zIiwiZmlsdGVyIiwiYWN0aW9uIiwiaXNNYW5pZmVzdEFjdGlvbiIsImN1c3RvbUFjdGlvblZpc2liaWxpdHkiLCJsZW5ndGgiLCJjdXN0b21BY3Rpb25JbmRpdmlkdWFsVmlzaWJpbGl0eSIsIm1hcCIsInZpc2libGUiLCJvciIsImFubm90YXRpb25BY3Rpb25WaXNpYmlsaXR5IiwiZ2V0RGF0YUZpZWxkQmFzZWRGb290ZXJWaXNpYmlsaXR5IiwiYURhdGFGaWVsZHMiLCJiQ29uc2lkZXJFZGl0YWJsZSIsInNIaWRkZW5FeHByZXNzaW9uIiwic1NlbWlIaWRkZW5FeHByZXNzaW9uIiwiYUhpZGRlbkFjdGlvblBhdGgiLCJpIiwib0RhdGFGaWVsZCIsIkRldGVybWluaW5nIiwiaGlkZGVuRXhwcmVzc2lvbiIsIiRQYXRoIiwiaW5kZXhPZiIsInB1c2giLCJpbmRleCIsIm9BY3Rpb24iLCJhQWN0aW9ucyIsInR5cGUiLCJidWlsZEVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uIiwiYUlkZW50aWZpY2F0aW9uIiwiRW1waGFzaXplZCIsInNGb3JtYXRFbXBoYXNpemVkRXhwcmVzc2lvbiIsImJJc0Fsd2F5c0RlZmF1bHQiLCJzSGlkZGVuU2ltcGxlUGF0aCIsImZvckVhY2giLCJvQ3JpdGljYWxpdHlQcm9wZXJ0eSIsIkNyaXRpY2FsaXR5Iiwib0RhdGFGaWVsZEhpZGRlbiIsIiRFbnVtTWVtYmVyIiwiRGVmYXVsdCIsInNDb21iaW5lZEhpZGRlbkV4cHJlc3Npb24iLCJnZXRFbGVtZW50QmluZGluZyIsInNQYXRoIiwic05hdmlnYXRpb25QYXRoIiwiT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIiLCJnZXROYXZpZ2F0aW9uUGF0aCIsImNoZWNrRHJhZnRTdGF0ZSIsIm9Bbm5vdGF0aW9ucyIsImdldFN3aXRjaFRvQWN0aXZlVmlzaWJpbGl0eSIsImdldFN3aXRjaFRvRHJhZnRWaXNpYmlsaXR5IiwiZ2V0U3dpdGNoRHJhZnRBbmRBY3RpdmVWaXNpYmlsaXR5IiwiX2ZpbmRBY3Rpb24iLCJhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMiLCJzQWN0aW9uVHlwZSIsImZpbmQiLCJvSGVhZGVyQWN0aW9uIiwiZ2V0RGVsZXRlQ29tbWFuZEV4ZWN1dGlvbkVuYWJsZWQiLCJvRGVsZXRlQWN0aW9uIiwiZW5hYmxlZCIsImdldERlbGV0ZUNvbW1hbmRFeGVjdXRpb25WaXNpYmxlIiwiZ2V0RWRpdENvbW1hbmRFeGVjdXRpb25WaXNpYmxlIiwib0VkaXRBY3Rpb24iLCJnZXRFZGl0Q29tbWFuZEV4ZWN1dGlvbkVuYWJsZWQiLCJnZXRFZGl0QWN0aW9uIiwib0VudGl0eVNldCIsImdldFBhdGgiLCJhUGF0aHMiLCJzcGxpdCIsInJvb3RFbnRpdHlTZXRQYXRoIiwicm9vdEVudGl0eVNldEFubm5vdGF0aW9ucyIsImdldE9iamVjdCIsImJEcmFmdFJvb3QiLCJoYXNPd25Qcm9wZXJ0eSIsImJEcmFmdE5vZGUiLCJiU3RpY2t5U2Vzc2lvbiIsInNBY3Rpb25OYW1lIiwiaXNSZWFkT25seUZyb21TdGF0aWNBbm5vdGF0aW9ucyIsIm9GaWVsZENvbnRyb2wiLCJiQ29tcHV0ZWQiLCJiSW1tdXRhYmxlIiwiYlJlYWRPbmx5IiwiQm9vbCIsInJlYWRPbmx5RXhwcmVzc2lvbkZyb21EeW5hbWljQW5ub3RhdGlvbnMiLCJzSXNGaWVsZENvbnRyb2xQYXRoUmVhZE9ubHkiLCJNYW5hZ2VkT2JqZWN0IiwiYmluZGluZ1BhcnNlciIsImdldEV4cHJlc3Npb25Gb3JNaWNyb0NoYXJ0VGl0bGVQcmVzcyIsIm9Db25maWd1cmF0aW9uIiwib01hbmlmZXN0T3V0Ym91bmQiLCJzQ29sbGVjdGlvbk5hbWUiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0TWljcm9DaGFydFRpdGxlQXNMaW5rIiwib0NvbnRyb2xDb25maWd1cmF0aW9uIiwiZ2V0R3JvdXBJZEZyb21Db25maWciLCJvQ29uZmlndXJhdGlvbnMiLCJzQW5ub3RhdGlvblBhdGgiLCJzRGVmYXVsdEdyb3VwSWQiLCJhQXV0b1BhdHRlcm5zIiwic0dyb3VwSWQiLCJyZXF1ZXN0R3JvdXBJZCIsInNvbWUiLCJhdXRvUGF0dGVybiIsImdldEJpbmRpbmdXaXRoR3JvdXBJZEZyb21Db25maWciLCJzS2V5Iiwic0JpbmRpbmciLCJkb2VzRmllbGRHcm91cENvbnRhaW5Pbmx5T25lTXVsdGlMaW5lRGF0YUZpZWxkIiwiYUZvcm1FbGVtZW50cyIsImlzVmFsdWVNdWx0aWxpbmVUZXh0IiwiZ2V0VmlzaWJsZUV4cHJlc3Npb25Gb3JCcmVhZGNydW1icyIsInNob3dCcmVhZENydW1icyIsImZjbEVuYWJsZWQiLCJnZXRTaGFyZUJ1dHRvblZpc2liaWxpdHkiLCJ2aWV3RGF0YSIsInNTaGFyZUJ1dHRvblZpc2liaWxpdHlFeHAiLCJnZXRWaXNpYmxpdHlPZkhlYWRlckluZm8iLCJvVGl0bGVBbm5vdGF0aW9ucyIsIm9EZXNjcmlwdGlvbkFubm90YXRpb25zIiwib0ZpZWxkVGl0bGVGaWVsZENvbnRyb2wiLCJvRmllbGREZXNjcmlwdGlvbkZpZWxkQ29udHJvbCIsImJJc1RpdGxlUmVhZE9ubHkiLCJ0aXRsZUV4cHJlc3Npb24iLCJiSXNEZXNjcmlwdGlvblJlYWRPbmx5IiwiZGVzY3JpcHRpb25FeHByZXNzaW9uIiwiY29tYmluZVRpdGxlQW5kRGVzY3JpcHRpb25FeHByZXNzaW9uIiwib1RpdGxlRmllbGRDb250cm9sIiwib0Rlc2NyaXB0aW9uRmllbGRDb250cm9sIiwiZ2V0UHJlc3NFeHByZXNzaW9uRm9yRGVsZXRlIiwib0ludGVyZmFjZSIsInNEZWxldGFibGVDb250ZXh0cyIsInNUaXRsZSIsInNEZXNjcmlwdGlvbiIsImVzQ29udGV4dCIsImNvbnRleHQiLCJjb250ZXh0UGF0aCIsImNvbnRleHRQYXRoUGFydHMiLCJNb2RlbEhlbHBlciIsImZpbHRlck91dE5hdlByb3BCaW5kaW5nIiwic0VudGl0eVNldE5hbWUiLCJnZXRNb2RlbCIsImpvaW4iLCJvUGFyYW1zIiwidGl0bGUiLCJlbnRpdHlTZXROYW1lIiwiQ29tbW9uSGVscGVyIiwiYWRkU2luZ2xlUXVvdGVzIiwiZGVzY3JpcHRpb24iLCJnZW5lcmF0ZUZ1bmN0aW9uIiwib2JqZWN0VG9TdHJpbmciLCJyZXF1aXJlc0lDb250ZXh0IiwiZ2V0UHJlc3NFeHByZXNzaW9uRm9yRWRpdCIsInNFZGl0YWJsZUNvbnRleHRzIiwiQWN0aW9uIiwic0RhdGFGaWVsZEVudW1NZW1iZXIiLCJJbnZvY2F0aW9uR3JvdXBpbmciLCJzSW52b2NhdGlvbkdyb3VwIiwiY29udGV4dHMiLCJpbnZvY2F0aW9uR3JvdXBpbmciLCJtb2RlbCIsImxhYmVsIiwiTGFiZWwiLCJpc05hdmlnYWJsZSIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsImdldFByZXNzRXhwcmVzc2lvbkZvckZvb3RlckFubm90YXRpb25BY3Rpb24iLCJzQWN0aW9uQ29udGV4dHMiLCJnZXRQcmVzc0V4cHJlc3Npb25Gb3JQcmltYXJ5QWN0aW9uIiwicG9zaXRpdmVBY3Rpb25WaXNpYmxlIiwicG9zaXRpdmVBY3Rpb25FbmFibGVkIiwiZWRpdEFjdGlvblZpc2libGUiLCJlZGl0QWN0aW9uRW5hYmxlZCIsIm9Db25kaXRpb25zIiwiZ2V0U3Rhc2hhYmxlSEJveEJpbmRpbmciLCJvSGVhZGVyRmFjZXQiLCJGYWNldCIsInRhcmdldEFubm90YXRpb25UeXBlIiwidGFyZ2V0QW5ub3RhdGlvblZhbHVlIiwiZ2V0UHJlc3NFeHByZXNzaW9uRm9yTGluayIsImdldEhlYWRlckZvcm1IYm94UmVuZGVyVHlwZSIsImRhdGFGaWVsZCIsInRhcmdldE9iamVjdCIsImdldERlZmF1bHRBY3Rpb25IYW5kbGVyIiwib0N0eCIsIm9EYXRhRmllbGRGb3JEZWZhdWx0QWN0aW9uIiwiZGVmYXVsdEFjdGlvbkNvbnRleHRPckVudGl0eVNldCIsImRlZmF1bHRBY3Rpb24iLCJjb21tYW5kIiwicHJlc3MiLCJub1dyYXAiLCJidWlsZEFjdGlvbldyYXBwZXIiLCJpZCIsImlvRXgiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk9iamVjdFBhZ2VUZW1wbGF0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEZvcm1hdHRlcnMgZm9yIHRoZSBPYmplY3QgUGFnZVxuaW1wb3J0IHsgRW50aXR5U2V0IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFGaWVsZCwgRGF0YUZpZWxkVHlwZXMsIEhlYWRlckluZm9UeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIHsgQmFzZUFjdGlvbiwgQ29udmVydGVyQWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHsgRHJhZnQsIEVudGl0eSwgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgTWFuaWZlc3RBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25jYXQsXG5cdGNvbnN0YW50LFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sXG5cdGlmRWxzZSxcblx0aXNFbXB0eSxcblx0b3IsXG5cdHJlc29sdmVCaW5kaW5nU3RyaW5nXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGVuaGFuY2VEYXRhTW9kZWxQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgQ29tcHV0ZWRBbm5vdGF0aW9uSW50ZXJmYWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IHsgYWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbiwgZm9ybWF0VmFsdWVSZWN1cnNpdmVseSB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0IHsgZ2V0TGFiZWxGb3JDb25uZWN0ZWRGaWVsZHMgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9mb3JtL0Zvcm1UZW1wbGF0aW5nXCI7XG5pbXBvcnQgbUxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuXG5jb25zdCBCdXR0b25UeXBlID0gbUxpYnJhcnkuQnV0dG9uVHlwZTtcblxudHlwZSBWaWV3RGF0YSA9IHtcblx0cmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlO1xuXHRlbnRpdHlTZXQ6IHN0cmluZztcbn07XG5cbi8vYGBgbWVybWFpZFxuLy8gZ3JhcGggVERcbi8vIEFbT2JqZWN0IFBhZ2UgVGl0bGVdIC0tPnxHZXQgRGF0YUZpZWxkIFZhbHVlfCBDe0V2YWx1YXRlIENyZWF0ZSBNb2RlfVxuLy8gQyAtLT58SW4gQ3JlYXRlIE1vZGV8IER7SXMgRGF0YUZpZWxkIFZhbHVlIGVtcHR5fVxuLy8gRCAtLT58WWVzfCBGe0lzIHRoZXJlIGEgVHlwZU5hbWV9XG4vLyBGIC0tPnxZZXN8IEdbSXMgdGhlcmUgYW4gY3VzdG9tIHRpdGxlXVxuLy8gRyAtLT58WWVzfCBHMVtTaG93IHRoZSBjdXN0b20gdGl0bGUgKyAnVHlwZU5hbWUnXVxuLy8gRyAtLT58Tm98IEcyW0Rpc3BsYXkgdGhlIGRlZmF1bHQgdGl0bGUgJ05ldyArIFR5cGVOYW1lJ11cbi8vIEYgLS0+fE5vfCBIW0lzIHRoZXJlIGEgY3VzdG9tIHRpdGxlXVxuLy8gSCAtLT58WWVzfCBJW1Nob3cgdGhlIGN1c3RvbSB0aXRsZV1cbi8vIEggLS0+fE5vfCBKW1Nob3cgdGhlIGRlZmF1bHQgJ1VuYW1uZWQgT2JqZWN0J11cbi8vIEQgLS0+fE5vfCBFXG4vLyBDIC0tPnxOb3QgaW4gY3JlYXRlIG1vZGV8IEVbU2hvdyBEYXRhRmllbGQgVmFsdWVdXG4vLyBgYGBcbi8qKlxuICogQ29tcHV0ZSB0aGUgdGl0bGUgZm9yIHRoZSBvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gb0hlYWRlckluZm8gVGhlIEBVSS5IZWFkZXJJbmZvIGFubm90YXRpb24gY29udGVudFxuICogQHBhcmFtIG9WaWV3RGF0YSBUaGUgdmlldyBkYXRhIG9iamVjdCB3ZSdyZSBjdXJyZW50bHkgb25cbiAqIEBwYXJhbSBmdWxsQ29udGV4dFBhdGggVGhlIGZ1bGwgY29udGV4dCBwYXRoIHVzZWQgdG8gcmVhY2ggdGhhdCBvYmplY3QgcGFnZVxuICogQHBhcmFtIG9EcmFmdFJvb3RcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBvYmplY3QgcGFnZSB0aXRsZVxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhwcmVzc2lvbkZvclRpdGxlID0gZnVuY3Rpb24gKFxuXHRvSGVhZGVySW5mbzogSGVhZGVySW5mb1R5cGUgfCB1bmRlZmluZWQsXG5cdG9WaWV3RGF0YTogVmlld0RhdGEsXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0b0RyYWZ0Um9vdDogT2JqZWN0IHwgdW5kZWZpbmVkXG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGNvbnN0IHRpdGxlTm9IZWFkZXJJbmZvID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJUX05FV19PQkpFQ1RcIiwgb1ZpZXdEYXRhLnJlc291cmNlQnVuZGxlLCB1bmRlZmluZWQsIG9WaWV3RGF0YS5lbnRpdHlTZXQpO1xuXG5cdGNvbnN0IHRpdGxlV2l0aEhlYWRlckluZm8gPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcIlRfQU5OT1RBVElPTl9IRUxQRVJfREVGQVVMVF9PQkpFQ1RfUEFHRV9IRUFERVJfVElUTEVcIixcblx0XHRvVmlld0RhdGEucmVzb3VyY2VCdW5kbGUsXG5cdFx0dW5kZWZpbmVkLFxuXHRcdG9WaWV3RGF0YS5lbnRpdHlTZXRcblx0KTtcblxuXHRjb25zdCBvRW1wdHlIZWFkZXJJbmZvVGl0bGUgPVxuXHRcdG9IZWFkZXJJbmZvPy5UaXRsZSA9PT0gdW5kZWZpbmVkIHx8IChvSGVhZGVySW5mbz8uVGl0bGUgYXMgYW55KSA9PT0gXCJcIiB8fCAob0hlYWRlckluZm8/LlRpdGxlIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWUgPT09IFwiXCI7XG5cblx0Y29uc3QgdGl0bGVGb3JBY3RpdmVIZWFkZXJOb0hlYWRlckluZm8gPSAhb0VtcHR5SGVhZGVySW5mb1RpdGxlXG5cdFx0PyBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfQU5OT1RBVElPTl9IRUxQRVJfREVGQVVMVF9PQkpFQ1RfUEFHRV9IRUFERVJfVElUTEVfTk9fSEVBREVSX0lORk9cIiwgb1ZpZXdEYXRhLnJlc291cmNlQnVuZGxlKVxuXHRcdDogXCJcIjtcblx0bGV0IHRpdGxlVmFsdWVFeHByZXNzaW9uLFxuXHRcdGNvbm5lY3RlZEZpZWxkc1BhdGgsXG5cdFx0dGl0bGVJc0VtcHR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gPSBjb25zdGFudCh0cnVlKSxcblx0XHR0aXRsZUJvb2xlYW5FeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gfCBib29sZWFuO1xuXHRpZiAob0hlYWRlckluZm8/LlRpdGxlPy4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIikge1xuXHRcdHRpdGxlVmFsdWVFeHByZXNzaW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKChvSGVhZGVySW5mbz8uVGl0bGUgYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZSk7XG5cdFx0aWYgKChvSGVhZGVySW5mbz8uVGl0bGUgYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHtcblx0XHRcdC8vIEluIGNhc2UgYW4gZXhwbGljaXQgdGV4dCBhcnJhbmdlbWVudCB3YXMgc2V0IHdlIG1ha2UgdXNlIG9mIGl0IGluIHRoZSBkZXNjcmlwdGlvbiBhcyB3ZWxsXG5cdFx0XHR0aXRsZVZhbHVlRXhwcmVzc2lvbiA9IGFkZFRleHRBcnJhbmdlbWVudFRvQmluZGluZ0V4cHJlc3Npb24odGl0bGVWYWx1ZUV4cHJlc3Npb24sIGZ1bGxDb250ZXh0UGF0aCk7XG5cdFx0fVxuXHRcdHRpdGxlVmFsdWVFeHByZXNzaW9uID0gZm9ybWF0VmFsdWVSZWN1cnNpdmVseSh0aXRsZVZhbHVlRXhwcmVzc2lvbiwgZnVsbENvbnRleHRQYXRoKTtcblx0XHR0aXRsZUlzRW1wdHkgPSB0aXRsZVZhbHVlRXhwcmVzc2lvbj8uX3R5cGUgPT09IFwiQ29uc3RhbnRcIiA/IGNvbnN0YW50KCF0aXRsZVZhbHVlRXhwcmVzc2lvbj8udmFsdWUpIDogaXNFbXB0eSh0aXRsZVZhbHVlRXhwcmVzc2lvbik7XG5cdH0gZWxzZSBpZiAoXG5cdFx0b0hlYWRlckluZm8/LlRpdGxlPy4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIgJiZcblx0XHRvSGVhZGVySW5mbz8uVGl0bGU/LlRhcmdldC4kdGFyZ2V0LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNvbm5lY3RlZEZpZWxkc1R5cGVcIlxuXHQpIHtcblx0XHRjb25uZWN0ZWRGaWVsZHNQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZnVsbENvbnRleHRQYXRoLCBcIiRUeXBlL0BVSS5IZWFkZXJJbmZvL1RpdGxlL1RhcmdldC8kQW5ub3RhdGlvblBhdGhcIik7XG5cdFx0dGl0bGVWYWx1ZUV4cHJlc3Npb24gPSBnZXRMYWJlbEZvckNvbm5lY3RlZEZpZWxkcyhjb25uZWN0ZWRGaWVsZHNQYXRoLCBmYWxzZSkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz47XG5cdFx0dGl0bGVCb29sZWFuRXhwcmVzc2lvbiA9XG5cdFx0XHR0aXRsZVZhbHVlRXhwcmVzc2lvbj8uX3R5cGUgPT09IFwiQ29uc3RhbnRcIiA/IGNvbnN0YW50KCF0aXRsZVZhbHVlRXhwcmVzc2lvbj8udmFsdWUpIDogaXNFbXB0eSh0aXRsZVZhbHVlRXhwcmVzc2lvbik7XG5cdFx0dGl0bGVJc0VtcHR5ID0gdGl0bGVWYWx1ZUV4cHJlc3Npb24gPyB0aXRsZUJvb2xlYW5FeHByZXNzaW9uIDogY29uc3RhbnQodHJ1ZSk7XG5cdH1cblxuXHQvLyBJZiB0aGVyZSBpcyBhIFR5cGVOYW1lIGRlZmluZWQsIHNob3cgdGhlIGRlZmF1bHQgdGl0bGUgJ05ldyArIFR5cGVOYW1lJywgb3RoZXJ3aXNlIHNob3cgdGhlIGN1c3RvbSB0aXRsZSBvciB0aGUgZGVmYXVsdCAnTmV3IG9iamVjdCdcblx0Y29uc3QgY3JlYXRlTW9kZVRpdGxlID0gb0hlYWRlckluZm8/LlR5cGVOYW1lXG5cdFx0PyBjb25jYXQodGl0bGVXaXRoSGVhZGVySW5mbywgXCI6IFwiLCByZXNvbHZlQmluZGluZ1N0cmluZyhvSGVhZGVySW5mby5UeXBlTmFtZS50b1N0cmluZygpKSlcblx0XHQ6IHRpdGxlTm9IZWFkZXJJbmZvO1xuXHRjb25zdCBhY3RpdmVFeHByZXNzaW9uID0gb0RyYWZ0Um9vdCA/IEVudGl0eS5Jc0FjdGl2ZSA6IHRydWU7XG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRpZkVsc2UoXG5cdFx0XHRhbmQoVUkuSXNDcmVhdGVNb2RlLCB0aXRsZUlzRW1wdHkpLFxuXHRcdFx0Y3JlYXRlTW9kZVRpdGxlLFxuXG5cdFx0XHQvLyBPdGhlcndpc2Ugc2hvdyB0aGUgZGVmYXVsdCBleHByZXNzaW9uXG5cdFx0XHRpZkVsc2UoYW5kKGFjdGl2ZUV4cHJlc3Npb24sIHRpdGxlSXNFbXB0eSksIHRpdGxlRm9yQWN0aXZlSGVhZGVyTm9IZWFkZXJJbmZvLCB0aXRsZVZhbHVlRXhwcmVzc2lvbilcblx0XHQpXG5cdCk7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgZXhwcmVzc2lvbiBmb3IgdGhlIGRlc2NyaXB0aW9uIG9mIGFuIG9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBvSGVhZGVySW5mbyBUaGUgQFVJLkhlYWRlckluZm8gYW5ub3RhdGlvbiBjb250ZW50XG4gKiBAcGFyYW0gZnVsbENvbnRleHRQYXRoIFRoZSBmdWxsIGNvbnRleHQgcGF0aCB1c2VkIHRvIHJlYWNoIHRoYXQgb2JqZWN0IHBhZ2VcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBvYmplY3QgcGFnZSBkZXNjcmlwdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhwcmVzc2lvbkZvckRlc2NyaXB0aW9uID0gZnVuY3Rpb24gKFxuXHRvSGVhZGVySW5mbzogSGVhZGVySW5mb1R5cGUgfCB1bmRlZmluZWQsXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRsZXQgcGF0aEluTW9kZWwgPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oKG9IZWFkZXJJbmZvPy5EZXNjcmlwdGlvbiBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlKTtcblx0aWYgKChvSGVhZGVySW5mbz8uRGVzY3JpcHRpb24gYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHtcblx0XHQvLyBJbiBjYXNlIGFuIGV4cGxpY2l0IHRleHQgYXJyYW5nZW1lbnQgd2FzIHNldCB3ZSBtYWtlIHVzZSBvZiBpdCBpbiB0aGUgZGVzY3JpcHRpb24gYXMgd2VsbFxuXHRcdHBhdGhJbk1vZGVsID0gYWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbihwYXRoSW5Nb2RlbCwgZnVsbENvbnRleHRQYXRoKTtcblx0fVxuXG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5KHBhdGhJbk1vZGVsLCBmdWxsQ29udGV4dFBhdGgpKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBleHByZXNzaW9uIGZvciB0aGUgc2F2ZSBidXR0b24uXG4gKlxuICogQHBhcmFtIG9WaWV3RGF0YSBUaGUgY3VycmVudCB2aWV3IGRhdGFcbiAqIEBwYXJhbSBmdWxsQ29udGV4dFBhdGggVGhlIHBhdGggdXNlZCB1cCB1bnRpbCBoZXJlXG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIHRoYXQgc2hvd3MgdGhlIHJpZ2h0IHNhdmUgYnV0dG9uIHRleHRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4cHJlc3Npb25Gb3JTYXZlQnV0dG9uID0gZnVuY3Rpb24gKFxuXHRvVmlld0RhdGE6IFZpZXdEYXRhLFxuXHRmdWxsQ29udGV4dFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGhcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Y29uc3Qgc2F2ZUJ1dHRvblRleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfT1BfT0JKRUNUX1BBR0VfU0FWRVwiLCBvVmlld0RhdGEucmVzb3VyY2VCdW5kbGUpO1xuXHRjb25zdCBjcmVhdGVCdXR0b25UZXh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJUX09QX09CSkVDVF9QQUdFX0NSRUFURVwiLCBvVmlld0RhdGEucmVzb3VyY2VCdW5kbGUpO1xuXHRsZXQgc2F2ZUV4cHJlc3Npb247XG5cblx0aWYgKChmdWxsQ29udGV4dFBhdGguc3RhcnRpbmdFbnRpdHlTZXQgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkKSB7XG5cdFx0Ly8gSWYgd2UncmUgaW4gc3RpY2t5IG1vZGUgQU5EIHRoZSB1aSBpcyBpbiBjcmVhdGUgbW9kZSwgc2hvdyBDcmVhdGUsIGVsc2Ugc2hvdyBTYXZlXG5cdFx0c2F2ZUV4cHJlc3Npb24gPSBpZkVsc2UoVUkuSXNDcmVhdGVNb2RlLCBjcmVhdGVCdXR0b25UZXh0LCBzYXZlQnV0dG9uVGV4dCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gSWYgd2UncmUgaW4gZHJhZnQgQU5EIHRoZSBkcmFmdCBpcyBhIG5ldyBvYmplY3QgKCFJc0FjdGl2ZUVudGl0eSAmJiAhSGFzQWN0aXZlRW50aXR5KSwgc2hvdyBjcmVhdGUsIGVsc2Ugc2hvdyBzYXZlXG5cdFx0c2F2ZUV4cHJlc3Npb24gPSBpZkVsc2UoRHJhZnQuSXNOZXdPYmplY3QsIGNyZWF0ZUJ1dHRvblRleHQsIHNhdmVCdXR0b25UZXh0KTtcblx0fVxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oc2F2ZUV4cHJlc3Npb24pO1xufTtcblxuLyoqXG4gKiBNZXRob2QgcmV0dXJucyB3aGV0aGVyIGZvb3RlciBpcyB2aXNpYmxlIG9yIG5vdCBvbiBvYmplY3QgLyBzdWJvYmplY3QgcGFnZS5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGdldEZvb3RlclZpc2libGVcbiAqIEBwYXJhbSBmb290ZXJBY3Rpb25zIFRoZSBmb290ZXIgYWN0aW9uIG9iamVjdCBjb21pbmcgZnJvbSB0aGUgY29udmVydGVyXG4gKiBAcGFyYW0gZGF0YUZpZWxkcyBEYXRhIGZpZWxkIGFycmF5IGZvciBub3JtYWwgZm9vdGVyIHZpc2liaWxpdHkgcHJvY2Vzc2luZ1xuICogQHJldHVybnMgYHRydWVgIGlmIGFueSBhY3Rpb24gaXMgdHJ1ZSwgb3RoZXJ3aXNlIGNvbXBpbGVkIEJpbmRpbmcgb3IgYGZhbHNlYFxuICovXG5leHBvcnQgY29uc3QgZ2V0Rm9vdGVyVmlzaWJsZSA9IGZ1bmN0aW9uIChcblx0Zm9vdGVyQWN0aW9uczogQ29udmVydGVyQWN0aW9uW10sXG5cdGRhdGFGaWVsZHM6IERhdGFGaWVsZFtdXG4pOiBib29sZWFuIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRjb25zdCBtYW5pZmVzdEFjdGlvbnMgPSBmb290ZXJBY3Rpb25zLmZpbHRlcigoYWN0aW9uKSA9PiBpc01hbmlmZXN0QWN0aW9uKGFjdGlvbikpIGFzIE1hbmlmZXN0QWN0aW9uW107XG5cdGxldCBjdXN0b21BY3Rpb25WaXNpYmlsaXR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdGlmIChtYW5pZmVzdEFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0Ly8gSWYgd2UgaGF2ZSBtYW5pZmVzdCBhY3Rpb25zXG5cdFx0Y29uc3QgY3VzdG9tQWN0aW9uSW5kaXZpZHVhbFZpc2liaWxpdHkgPSBtYW5pZmVzdEFjdGlvbnMubWFwKChhY3Rpb24pID0+IHtcblx0XHRcdHJldHVybiByZXNvbHZlQmluZGluZ1N0cmluZzxib29sZWFuPihhY3Rpb24udmlzaWJsZSBhcyBzdHJpbmcgfCBib29sZWFuLCBcImJvb2xlYW5cIik7XG5cdFx0fSk7XG5cdFx0Ly8gY29uc3RydWN0IHRoZSBmb290ZXIncyB2aXNpYmlsaXR5LWJpbmRpbmcgb3V0IG9mIGFsbCBhY3Rpb25zJyB2aXNpYmlsaXR5LWJpbmRpbmdzLCBmaXJzdCB0aGUgYmluZGluZyBvZiBhbGwgY3VzdG9tIGFjdGlvbnMgLi4uXG5cdFx0Y3VzdG9tQWN0aW9uVmlzaWJpbGl0eSA9IG9yKC4uLmN1c3RvbUFjdGlvbkluZGl2aWR1YWxWaXNpYmlsaXR5KTtcblx0XHQvLyBhbmQgdGhlbiB0aGUgYmluZGluZyBvZiBhbGwgYW5ub3RhdGlvbiBhY3Rpb25zIGluc2lkZSB0aGUgZm9vdGVyIC4uLlxuXHRcdGNvbnN0IGFubm90YXRpb25BY3Rpb25WaXNpYmlsaXR5ID0gZ2V0RGF0YUZpZWxkQmFzZWRGb290ZXJWaXNpYmlsaXR5KGRhdGFGaWVsZHMsIHRydWUpO1xuXHRcdC8vIGZpbmFsbHksIHJldHVybiBldmVyeXRoaW5nLlxuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihvcihjdXN0b21BY3Rpb25WaXNpYmlsaXR5LCByZXNvbHZlQmluZGluZ1N0cmluZzxib29sZWFuPihhbm5vdGF0aW9uQWN0aW9uVmlzaWJpbGl0eSwgXCJib29sZWFuXCIpKSk7XG5cdH1cblx0cmV0dXJuIGdldERhdGFGaWVsZEJhc2VkRm9vdGVyVmlzaWJpbGl0eShkYXRhRmllbGRzLCB0cnVlKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBmb290ZXIgaXMgdmlzaWJsZSBvciBub3QuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAc3RhdGljXG4gKiBAbmFtZSBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuT2JqZWN0UGFnZVRlbXBsYXRpbmcuZ2V0RGF0YUZpZWxkQmFzZWRGb290ZXJWaXNpYmlsaXR5XG4gKiBAbWVtYmVyb2Ygc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLk9iamVjdFBhZ2VUZW1wbGF0aW5nXG4gKiBAcGFyYW0gYURhdGFGaWVsZHMgQXJyYXkgb2YgRGF0YUZpZWxkcyBpbiB0aGUgaWRlbnRpZmljYXRpb25cbiAqIEBwYXJhbSBiQ29uc2lkZXJFZGl0YWJsZSBXaGV0aGVyIHRoZSBlZGl0IG1vZGUgYmluZGluZyBpcyByZXF1aXJlZCBvciBub3RcbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gaWYgYWxsIHRoZSBhY3Rpb25zIGFyZSB1aS5oaWRkZW4sIHRydWUgb3RoZXJ3aXNlXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmV4cG9ydCBjb25zdCBnZXREYXRhRmllbGRCYXNlZEZvb3RlclZpc2liaWxpdHkgPSBmdW5jdGlvbiAoYURhdGFGaWVsZHM6IGFueVtdLCBiQ29uc2lkZXJFZGl0YWJsZTogYm9vbGVhbikge1xuXHRsZXQgc0hpZGRlbkV4cHJlc3Npb24gPSBcIlwiO1xuXHRsZXQgc1NlbWlIaWRkZW5FeHByZXNzaW9uO1xuXHRjb25zdCBhSGlkZGVuQWN0aW9uUGF0aCA9IFtdO1xuXG5cdGZvciAoY29uc3QgaSBpbiBhRGF0YUZpZWxkcykge1xuXHRcdGNvbnN0IG9EYXRhRmllbGQgPSBhRGF0YUZpZWxkc1tpXTtcblx0XHRpZiAob0RhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uICYmIG9EYXRhRmllbGQuRGV0ZXJtaW5pbmcgPT09IHRydWUpIHtcblx0XHRcdGNvbnN0IGhpZGRlbkV4cHJlc3Npb24gPSBvRGF0YUZpZWxkW2BAJHtVSUFubm90YXRpb25UZXJtcy5IaWRkZW59YF07XG5cdFx0XHRpZiAoIWhpZGRlbkV4cHJlc3Npb24pIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKGhpZGRlbkV4cHJlc3Npb24uJFBhdGgpIHtcblx0XHRcdFx0aWYgKGFIaWRkZW5BY3Rpb25QYXRoLmluZGV4T2YoaGlkZGVuRXhwcmVzc2lvbi4kUGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0YUhpZGRlbkFjdGlvblBhdGgucHVzaChoaWRkZW5FeHByZXNzaW9uLiRQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChhSGlkZGVuQWN0aW9uUGF0aC5sZW5ndGgpIHtcblx0XHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYUhpZGRlbkFjdGlvblBhdGgubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0XHRpZiAoYUhpZGRlbkFjdGlvblBhdGhbaW5kZXhdKSB7XG5cdFx0XHRcdHNTZW1pSGlkZGVuRXhwcmVzc2lvbiA9IFwiKCV7XCIgKyBhSGlkZGVuQWN0aW9uUGF0aFtpbmRleF0gKyBcIn0gPT09IHRydWUgPyBmYWxzZSA6IHRydWUgKVwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGluZGV4ID09IGFIaWRkZW5BY3Rpb25QYXRoLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0c0hpZGRlbkV4cHJlc3Npb24gPSBzSGlkZGVuRXhwcmVzc2lvbiArIHNTZW1pSGlkZGVuRXhwcmVzc2lvbjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNIaWRkZW5FeHByZXNzaW9uID0gc0hpZGRlbkV4cHJlc3Npb24gKyBzU2VtaUhpZGRlbkV4cHJlc3Npb24gKyBcInx8XCI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0XHRcIns9IFwiICtcblx0XHRcdChiQ29uc2lkZXJFZGl0YWJsZSA/IFwiKFwiIDogXCJcIikgK1xuXHRcdFx0c0hpZGRlbkV4cHJlc3Npb24gK1xuXHRcdFx0KGJDb25zaWRlckVkaXRhYmxlID8gXCIgfHwgJHt1aT4vaXNFZGl0YWJsZX0pIFwiIDogXCIgXCIpICtcblx0XHRcdFwiJiYgJHtpbnRlcm5hbD5pc0NyZWF0ZURpYWxvZ09wZW59ICE9PSB0cnVlfVwiXG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gXCJ7PSBcIiArIChiQ29uc2lkZXJFZGl0YWJsZSA/IFwiJHt1aT4vaXNFZGl0YWJsZX0gJiYgXCIgOiBcIlwiKSArIFwiJHtpbnRlcm5hbD5pc0NyZWF0ZURpYWxvZ09wZW59ICE9PSB0cnVlfVwiO1xuXHR9XG59O1xuXG4vKipcbiAqIE1ldGhvZCByZXR1cm5zIFdoZXRoZXIgdGhlIGFjdGlvbiB0eXBlIGlzIG1hbmlmZXN0IG9yIG5vdC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGlzTWFuaWZlc3RBY3Rpb25WaXNpYmxlXG4gKiBAcGFyYW0gb0FjdGlvbiBUaGUgYWN0aW9uIG9iamVjdFxuICogQHJldHVybnMgYHRydWVgIGlmIGFjdGlvbiBpcyBjb21pbmcgZnJvbSBtYW5pZmVzdCwgYGZhbHNlYCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGNvbnN0IGlzTWFuaWZlc3RBY3Rpb24gPSBmdW5jdGlvbiAob0FjdGlvbjogYW55KSB7XG5cdGNvbnN0IGFBY3Rpb25zID0gW1xuXHRcdFwiUHJpbWFyeVwiLFxuXHRcdFwiRGVmYXVsdEFwcGx5XCIsXG5cdFx0XCJTZWNvbmRhcnlcIixcblx0XHRcIkZvckFjdGlvblwiLFxuXHRcdFwiRm9yTmF2aWdhdGlvblwiLFxuXHRcdFwiU3dpdGNoVG9BY3RpdmVPYmplY3RcIixcblx0XHRcIlN3aXRjaFRvRHJhZnRPYmplY3RcIixcblx0XHRcIkRyYWZ0QWN0aW9uc1wiLFxuXHRcdFwiQ29weVwiXG5cdF07XG5cdHJldHVybiBhQWN0aW9ucy5pbmRleE9mKG9BY3Rpb24udHlwZSkgPCAwO1xufTtcblxuLyoqXG4gKiBJZiBhIGNyaXRpY2FsIGFjdGlvbiBpcyByZW5kZXJlZCwgaXQgaXMgY29uc2lkZXJlZCB0byBiZSB0aGUgcHJpbWFyeSBhY3Rpb24uXG4gKiBIZW5jZSwgdGhlIHByaW1hcnkgYWN0aW9uIG9mIHRoZSB0ZW1wbGF0ZSBpcyBzZXQgYmFjayB0byBEZWZhdWx0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLk9iamVjdFBhZ2VUZW1wbGF0aW5nLmJ1aWxkRW1waGFzaXplZEJ1dHRvbkV4cHJlc3Npb25cbiAqIEBtZW1iZXJvZiBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuT2JqZWN0UGFnZVRlbXBsYXRpbmdcbiAqIEBwYXJhbSBhSWRlbnRpZmljYXRpb24gQXJyYXkgb2YgYWxsIHRoZSBEYXRhRmllbGRzIGluIElkZW50aWZpY2F0aW9uXG4gKiBAcmV0dXJucyBBbiBleHByZXNzaW9uIHRvIGRlZHVjZSBpZiBidXR0b24gdHlwZSBpcyBEZWZhdWx0IG9yIEVtcGhhc2l6ZWRcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGJ1aWxkRW1waGFzaXplZEJ1dHRvbkV4cHJlc3Npb24gPSBmdW5jdGlvbiAoYUlkZW50aWZpY2F0aW9uPzogYW55W10pIHtcblx0aWYgKCFhSWRlbnRpZmljYXRpb24pIHtcblx0XHRyZXR1cm4gQnV0dG9uVHlwZS5FbXBoYXNpemVkO1xuXHR9XG5cdGxldCBzRm9ybWF0RW1waGFzaXplZEV4cHJlc3Npb246IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0bGV0IGJJc0Fsd2F5c0RlZmF1bHQ6IGJvb2xlYW4sXG5cdFx0c0hpZGRlblNpbXBsZVBhdGgsXG5cdFx0c0hpZGRlbkV4cHJlc3Npb24gPSBcIlwiO1xuXHRhSWRlbnRpZmljYXRpb24uZm9yRWFjaChmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55KSB7XG5cdFx0Y29uc3Qgb0NyaXRpY2FsaXR5UHJvcGVydHkgPSBvRGF0YUZpZWxkLkNyaXRpY2FsaXR5O1xuXHRcdGNvbnN0IG9EYXRhRmllbGRIaWRkZW4gPSBvRGF0YUZpZWxkW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXTtcblx0XHRpZiAob0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIiAmJiAhYklzQWx3YXlzRGVmYXVsdCAmJiBvQ3JpdGljYWxpdHlQcm9wZXJ0eSkge1xuXHRcdFx0aWYgKCFzRm9ybWF0RW1waGFzaXplZEV4cHJlc3Npb24gJiYgb0RhdGFGaWVsZEhpZGRlbiA9PT0gdHJ1ZSkge1xuXHRcdFx0XHQvLyBpZiBEYXRhRmllbGQgaXMgc2V0IHRvIGhpZGRlbiwgd2UgY2FuIHNraXAgb3RoZXIgY2hlY2tzIGFuZCByZXR1cm4gRGVmYXVsdCBidXR0b24gdHlwZVxuXHRcdFx0XHRzRm9ybWF0RW1waGFzaXplZEV4cHJlc3Npb24gPSBCdXR0b25UeXBlLkVtcGhhc2l6ZWQ7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChvRGF0YUZpZWxkSGlkZGVuICYmIG9EYXRhRmllbGRIaWRkZW4uJFBhdGgpIHtcblx0XHRcdFx0Ly8gd2hlbiB2aXNpYmlsaXR5IG9mIGNyaXRpY2FsIGJ1dHRvbiBpcyBiYXNlZCBvbiBwYXRoLCBjb2xsZWN0IGFsbCBwYXRocyBmb3IgZXhwcmVzc2lvblxuXHRcdFx0XHRzSGlkZGVuU2ltcGxlUGF0aCA9IG9EYXRhRmllbGRIaWRkZW4uJFBhdGg7XG5cdFx0XHRcdGlmIChzSGlkZGVuRXhwcmVzc2lvbikge1xuXHRcdFx0XHRcdHNIaWRkZW5FeHByZXNzaW9uID0gc0hpZGRlbkV4cHJlc3Npb24gKyBcIiAmJiBcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRzSGlkZGVuRXhwcmVzc2lvbiA9IHNIaWRkZW5FeHByZXNzaW9uICsgXCIle1wiICsgc0hpZGRlblNpbXBsZVBhdGggKyBcIn0gPT09IHRydWVcIjtcblx0XHRcdFx0c0Zvcm1hdEVtcGhhc2l6ZWRFeHByZXNzaW9uID0gXCJ7PSAoXCIgKyBzSGlkZGVuRXhwcmVzc2lvbiArIFwiKSA/ICdFbXBoYXNpemVkJyA6ICdEZWZhdWx0JyB9XCI7XG5cdFx0XHR9XG5cdFx0XHRzd2l0Y2ggKG9Dcml0aWNhbGl0eVByb3BlcnR5LiRFbnVtTWVtYmVyKSB7XG5cdFx0XHRcdC8vIHN1cHBvcnRlZCBjcml0aWNhbGl0eSBhcmUgW1Bvc2l0aXZlLzMvJzMnXSBhbmQgW05lZ2F0aXZlLzEvJzEnXVxuXHRcdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlUeXBlL05lZ2F0aXZlXCI6XG5cdFx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvUG9zaXRpdmVcIjpcblx0XHRcdFx0Y2FzZSBcIjFcIjpcblx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRjYXNlIFwiM1wiOlxuXHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdFx0aWYgKCFvRGF0YUZpZWxkSGlkZGVuKSB7XG5cdFx0XHRcdFx0XHRzRm9ybWF0RW1waGFzaXplZEV4cHJlc3Npb24gPSBCdXR0b25UeXBlLkRlZmF1bHQ7XG5cdFx0XHRcdFx0XHRiSXNBbHdheXNEZWZhdWx0ID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c0Zvcm1hdEVtcGhhc2l6ZWRFeHByZXNzaW9uID0gc0Zvcm1hdEVtcGhhc2l6ZWRFeHByZXNzaW9uIHx8IEJ1dHRvblR5cGUuRGVmYXVsdDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRzRm9ybWF0RW1waGFzaXplZEV4cHJlc3Npb24gPSBCdXR0b25UeXBlLkVtcGhhc2l6ZWQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0NyaXRpY2FsaXR5UHJvcGVydHkuJFBhdGgpIHtcblx0XHRcdFx0Ly8gd2hlbiBDcml0aWNhbGl0eSBpcyBzZXQgdXNpbmcgYSBwYXRoLCB1c2UgdGhlIHBhdGggZm9yIGRlZHVjaW5nIHRoZSBFbXBoc2l6ZWQgdHlwZSBmb3IgZGVmYXVsdCBQcmltYXJ5IEFjdGlvblxuXHRcdFx0XHRjb25zdCBzQ29tYmluZWRIaWRkZW5FeHByZXNzaW9uID0gc0hpZGRlbkV4cHJlc3Npb24gPyBcIiEoXCIgKyBzSGlkZGVuRXhwcmVzc2lvbiArIFwiKSAmJiBcIiA6IFwiXCI7XG5cdFx0XHRcdHNGb3JtYXRFbXBoYXNpemVkRXhwcmVzc2lvbiA9XG5cdFx0XHRcdFx0XCJ7PSBcIiArXG5cdFx0XHRcdFx0c0NvbWJpbmVkSGlkZGVuRXhwcmVzc2lvbiArXG5cdFx0XHRcdFx0XCIoKCR7XCIgK1xuXHRcdFx0XHRcdG9Dcml0aWNhbGl0eVByb3BlcnR5LiRQYXRoICtcblx0XHRcdFx0XHRcIn0gPT09ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvTmVnYXRpdmUnKSB8fCAoJHtcIiArXG5cdFx0XHRcdFx0b0NyaXRpY2FsaXR5UHJvcGVydHkuJFBhdGggK1xuXHRcdFx0XHRcdFwifSA9PT0gJzEnKSB8fCAoJHtcIiArXG5cdFx0XHRcdFx0b0NyaXRpY2FsaXR5UHJvcGVydHkuJFBhdGggK1xuXHRcdFx0XHRcdFwifSA9PT0gMSkgXCIgK1xuXHRcdFx0XHRcdFwifHwgKCR7XCIgK1xuXHRcdFx0XHRcdG9Dcml0aWNhbGl0eVByb3BlcnR5LiRQYXRoICtcblx0XHRcdFx0XHRcIn0gPT09ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvUG9zaXRpdmUnKSB8fCAoJHtcIiArXG5cdFx0XHRcdFx0b0NyaXRpY2FsaXR5UHJvcGVydHkuJFBhdGggK1xuXHRcdFx0XHRcdFwifSA9PT0gJzMnKSB8fCAoJHtcIiArXG5cdFx0XHRcdFx0b0NyaXRpY2FsaXR5UHJvcGVydHkuJFBhdGggK1xuXHRcdFx0XHRcdFwifSA9PT0gMykpID8gXCIgK1xuXHRcdFx0XHRcdFwiJ0RlZmF1bHQnXCIgK1xuXHRcdFx0XHRcdFwiIDogXCIgK1xuXHRcdFx0XHRcdFwiJ0VtcGhhc2l6ZWQnXCIgK1xuXHRcdFx0XHRcdFwiIH1cIjtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gc0Zvcm1hdEVtcGhhc2l6ZWRFeHByZXNzaW9uIHx8IEJ1dHRvblR5cGUuRW1waGFzaXplZDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRFbGVtZW50QmluZGluZyA9IGZ1bmN0aW9uIChzUGF0aDogYW55KSB7XG5cdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IE9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKHNQYXRoKTtcblx0aWYgKHNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdHJldHVybiBcIntwYXRoOidcIiArIHNOYXZpZ2F0aW9uUGF0aCArIFwiJ31cIjtcblx0fSBlbHNlIHtcblx0XHQvL25vIG5hdmlnYXRpb24gcHJvcGVydHkgbmVlZHMgZW1wdHkgb2JqZWN0XG5cdFx0cmV0dXJuIFwie3BhdGg6ICcnfVwiO1xuXHR9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIGRyYWZ0IHBhdHRlcm4gaXMgc3VwcG9ydGVkLlxuICpcbiAqIEBwYXJhbSBvQW5ub3RhdGlvbnMgQW5ub3RhdGlvbnMgb2YgdGhlIGN1cnJlbnQgZW50aXR5IHNldC5cbiAqIEByZXR1cm5zIFJldHVybnMgdGhlIEJvb2xlYW4gdmFsdWUgYmFzZWQgb24gZHJhZnQgc3RhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IGNoZWNrRHJhZnRTdGF0ZSA9IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSkge1xuXHRpZiAoXG5cdFx0b0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RcIl0gJiZcblx0XHRvQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiXVtcIkVkaXRBY3Rpb25cIl1cblx0KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGdldCB0aGUgdmlzaWJpbGl0eSBmb3IgdGhlIFN3aXRjaFRvQWN0aXZlIGJ1dHRvbiBpbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UuXG4gKlxuICogQHBhcmFtIG9Bbm5vdGF0aW9ucyBBbm5vdGF0aW9ucyBvZiB0aGUgY3VycmVudCBlbnRpdHkgc2V0LlxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBiYXNlZCBvbiB0aGUgZHJhZnQgc3RhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFN3aXRjaFRvQWN0aXZlVmlzaWJpbGl0eSA9IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSk6IGFueSB7XG5cdGlmIChjaGVja0RyYWZ0U3RhdGUob0Fubm90YXRpb25zKSkge1xuXHRcdHJldHVybiBcIns9ICgle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0pID8gKCAke3VpPi9pc0VkaXRhYmxlfSAmJiAhJHt1aT5jcmVhdGVNb2RlfSAmJiAle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0gKSA6IGZhbHNlIH1cIjtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSB2aXNpYmlsaXR5IGZvciB0aGUgU3dpdGNoVG9EcmFmdCBidXR0b24gaW4gdGhlIG9iamVjdCBwYWdlIG9yIHN1Ym9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBvQW5ub3RhdGlvbnMgQW5ub3RhdGlvbnMgb2YgdGhlIGN1cnJlbnQgZW50aXR5IHNldC5cbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgYmFzZWQgb24gdGhlIGRyYWZ0IHN0YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTd2l0Y2hUb0RyYWZ0VmlzaWJpbGl0eSA9IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSk6IGFueSB7XG5cdGlmIChjaGVja0RyYWZ0U3RhdGUob0Fubm90YXRpb25zKSkge1xuXHRcdHJldHVybiBcIns9ICgle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0pID8gKCAhKCR7dWk+L2lzRWRpdGFibGV9KSAmJiAhJHt1aT5jcmVhdGVNb2RlfSAmJiAke0hhc0RyYWZ0RW50aXR5fSAmJiAle0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZX0gKSA6IGZhbHNlIH1cIjtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSB2aXNpYmlsaXR5IGZvciB0aGUgU3dpdGNoRHJhZnRBbmRBY3RpdmUgYnV0dG9uIGluIHRoZSBvYmplY3QgcGFnZSBvciBzdWJvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gb0Fubm90YXRpb25zIEFubm90YXRpb25zIG9mIHRoZSBjdXJyZW50IGVudGl0eSBzZXQuXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGJhc2VkIG9uIHRoZSBkcmFmdCBzdGF0ZVxuICovXG5leHBvcnQgY29uc3QgZ2V0U3dpdGNoRHJhZnRBbmRBY3RpdmVWaXNpYmlsaXR5ID0gZnVuY3Rpb24gKG9Bbm5vdGF0aW9uczogYW55KTogYW55IHtcblx0aWYgKGNoZWNrRHJhZnRTdGF0ZShvQW5ub3RhdGlvbnMpKSB7XG5cdFx0cmV0dXJuIFwiez0gKCV7RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRJc0NyZWF0ZWRCeU1lfSkgPyAoICEke3VpPmNyZWF0ZU1vZGV9ICYmICV7RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRJc0NyZWF0ZWRCeU1lfSApIDogZmFsc2UgfVwiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmaW5kIGFuIGFjdGlvbiBmcm9tIHRoZSBhcnJheSBvZiBoZWFkZXIgYWN0aW9ucyBpbiB0aGUgY29udmVydGVyIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucyBBcnJheSBvZiAnaGVhZGVyJyBhY3Rpb25zIG9uIHRoZSBvYmplY3QgcGFnZS5cbiAqIEBwYXJhbSBzQWN0aW9uVHlwZSBUaGUgYWN0aW9uIHR5cGVcbiAqIEByZXR1cm5zIFRoZSBhY3Rpb24gd2l0aCB0aGUgbWF0Y2hpbmcgYWN0aW9uIHR5cGVcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBfZmluZEFjdGlvbiA9IGZ1bmN0aW9uIChhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnM6IGFueVtdLCBzQWN0aW9uVHlwZTogc3RyaW5nKSB7XG5cdGxldCBvQWN0aW9uO1xuXHRpZiAoYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zICYmIGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucy5sZW5ndGgpIHtcblx0XHRvQWN0aW9uID0gYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zLmZpbmQoZnVuY3Rpb24gKG9IZWFkZXJBY3Rpb246IGFueSkge1xuXHRcdFx0cmV0dXJuIG9IZWFkZXJBY3Rpb24udHlwZSA9PT0gc0FjdGlvblR5cGU7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIG9BY3Rpb247XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZvcm1hdCB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IGZvciB0aGUgRGVsZXRlIGJ1dHRvbiBvbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UgaW4gY2FzZSBvZiBhIENvbW1hbmQgRXhlY3V0aW9uLlxuICpcbiAqIEBwYXJhbSBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMgQXJyYXkgb2YgaGVhZGVyIGFjdGlvbnMgb24gdGhlIG9iamVjdCBwYWdlXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGNvbnZlcnRlciBvdXRwdXRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERlbGV0ZUNvbW1hbmRFeGVjdXRpb25FbmFibGVkID0gZnVuY3Rpb24gKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9uczogYW55W10pIHtcblx0Y29uc3Qgb0RlbGV0ZUFjdGlvbiA9IF9maW5kQWN0aW9uKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucywgXCJTZWNvbmRhcnlcIik7XG5cdHJldHVybiBvRGVsZXRlQWN0aW9uID8gb0RlbGV0ZUFjdGlvbi5lbmFibGVkIDogXCJ0cnVlXCI7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZvcm1hdCB0aGUgJ3Zpc2libGUnIHByb3BlcnR5IGZvciB0aGUgRGVsZXRlIGJ1dHRvbiBvbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UgaW4gY2FzZSBvZiBhIENvbW1hbmQgRXhlY3V0aW9uLlxuICpcbiAqIEBwYXJhbSBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMgQXJyYXkgb2YgaGVhZGVyIGFjdGlvbnMgb24gdGhlIG9iamVjdCBwYWdlXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGNvbnZlcnRlciBvdXRwdXRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERlbGV0ZUNvbW1hbmRFeGVjdXRpb25WaXNpYmxlID0gZnVuY3Rpb24gKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9uczogYW55W10pIHtcblx0Y29uc3Qgb0RlbGV0ZUFjdGlvbiA9IF9maW5kQWN0aW9uKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucywgXCJTZWNvbmRhcnlcIik7XG5cdHJldHVybiBvRGVsZXRlQWN0aW9uID8gb0RlbGV0ZUFjdGlvbi52aXNpYmxlIDogXCJ0cnVlXCI7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZvcm1hdCB0aGUgJ3Zpc2libGUnIHByb3BlcnR5IGZvciB0aGUgRWRpdCBidXR0b24gb24gdGhlIG9iamVjdCBwYWdlIG9yIHN1Ym9iamVjdCBwYWdlIGluIGNhc2Ugb2YgYSBDb21tYW5kIEV4ZWN1dGlvbi5cbiAqXG4gKiBAcGFyYW0gYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zIEFycmF5IG9mIGhlYWRlciBhY3Rpb25zIG9uIHRoZSBvYmplY3QgcGFnZVxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBmcm9tIHRoZSBjb252ZXJ0ZXIgb3V0cHV0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFZGl0Q29tbWFuZEV4ZWN1dGlvblZpc2libGUgPSBmdW5jdGlvbiAoYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zOiBhbnlbXSkge1xuXHRjb25zdCBvRWRpdEFjdGlvbiA9IF9maW5kQWN0aW9uKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucywgXCJQcmltYXJ5XCIpO1xuXHRyZXR1cm4gb0VkaXRBY3Rpb24gPyBvRWRpdEFjdGlvbi52aXNpYmxlIDogXCJmYWxzZVwiO1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBmb3JtYXQgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBmb3IgdGhlIEVkaXQgYnV0dG9uIG9uIHRoZSBvYmplY3QgcGFnZSBvciBzdWJvYmplY3QgcGFnZSBpbiBjYXNlIG9mIGEgQ29tbWFuZCBFeGVjdXRpb24uXG4gKlxuICogQHBhcmFtIGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucyBBcnJheSBvZiBoZWFkZXIgYWN0aW9ucyBvbiB0aGUgb2JqZWN0IHBhZ2VcbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgZnJvbSB0aGUgY29udmVydGVyIG91dHB1dFxuICovXG5leHBvcnQgY29uc3QgZ2V0RWRpdENvbW1hbmRFeGVjdXRpb25FbmFibGVkID0gZnVuY3Rpb24gKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9uczogYW55W10pIHtcblx0Y29uc3Qgb0VkaXRBY3Rpb24gPSBfZmluZEFjdGlvbihhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMsIFwiUHJpbWFyeVwiKTtcblx0cmV0dXJuIG9FZGl0QWN0aW9uID8gb0VkaXRBY3Rpb24uZW5hYmxlZCA6IFwiZmFsc2VcIjtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSBFZGl0QWN0aW9uIGZyb20gdGhlIGJhc2VkIG9uIGEgZHJhZnQtZW5hYmxlZCBhcHBsaWNhdGlvbiBvciBhIHN0aWNreSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFyYW0gW29FbnRpdHlTZXRdIFRoZSB2YWx1ZSBmcm9tIHRoZSBleHByZXNzaW9uLlxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBiYXNlZCBvbiB2UmF3VmFsdWUgJiBvRHJhZnROb2RlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFZGl0QWN0aW9uID0gZnVuY3Rpb24gKG9FbnRpdHlTZXQ6IENvbnRleHQpIHtcblx0Y29uc3Qgc1BhdGggPSBvRW50aXR5U2V0LmdldFBhdGgoKTtcblx0Y29uc3QgYVBhdGhzID0gc1BhdGguc3BsaXQoXCIvXCIpO1xuXHRjb25zdCByb290RW50aXR5U2V0UGF0aCA9IFwiL1wiICsgYVBhdGhzWzFdO1xuXHQvLyBnZXQgdGhlIGVkaXQgYWN0aW9uIGZyb20gcm9vdCBlbnRpdHkgc2V0c1xuXHRjb25zdCByb290RW50aXR5U2V0QW5ubm90YXRpb25zID0gb0VudGl0eVNldC5nZXRPYmplY3Qocm9vdEVudGl0eVNldFBhdGggKyBcIkBcIik7XG5cdGNvbnN0IGJEcmFmdFJvb3QgPSByb290RW50aXR5U2V0QW5ubm90YXRpb25zLmhhc093blByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RcIik7XG5cdGNvbnN0IGJEcmFmdE5vZGUgPSByb290RW50aXR5U2V0QW5ubm90YXRpb25zLmhhc093blByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVcIik7XG5cdGNvbnN0IGJTdGlja3lTZXNzaW9uID0gcm9vdEVudGl0eVNldEFubm5vdGF0aW9ucy5oYXNPd25Qcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWRcIik7XG5cdGxldCBzQWN0aW9uTmFtZTtcblx0aWYgKGJEcmFmdFJvb3QpIHtcblx0XHRzQWN0aW9uTmFtZSA9IG9FbnRpdHlTZXQuZ2V0T2JqZWN0KGAke3Jvb3RFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290L0VkaXRBY3Rpb25gKTtcblx0fSBlbHNlIGlmIChiRHJhZnROb2RlKSB7XG5cdFx0c0FjdGlvbk5hbWUgPSBvRW50aXR5U2V0LmdldE9iamVjdChgJHtyb290RW50aXR5U2V0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZS9FZGl0QWN0aW9uYCk7XG5cdH0gZWxzZSBpZiAoYlN0aWNreVNlc3Npb24pIHtcblx0XHRzQWN0aW9uTmFtZSA9IG9FbnRpdHlTZXQuZ2V0T2JqZWN0KGAke3Jvb3RFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWQvRWRpdEFjdGlvbmApO1xuXHR9XG5cdHJldHVybiAhc0FjdGlvbk5hbWUgPyBzQWN0aW9uTmFtZSA6IGAke3Jvb3RFbnRpdHlTZXRQYXRofS8ke3NBY3Rpb25OYW1lfWA7XG59O1xuXG5leHBvcnQgY29uc3QgaXNSZWFkT25seUZyb21TdGF0aWNBbm5vdGF0aW9ucyA9IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSwgb0ZpZWxkQ29udHJvbDogYW55KSB7XG5cdGxldCBiQ29tcHV0ZWQsIGJJbW11dGFibGUsIGJSZWFkT25seTtcblx0aWYgKG9Bbm5vdGF0aW9ucyAmJiBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWRcIl0pIHtcblx0XHRiQ29tcHV0ZWQgPSBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWRcIl0uQm9vbCA/IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5Db21wdXRlZFwiXS5Cb29sID09IFwidHJ1ZVwiIDogdHJ1ZTtcblx0fVxuXHRpZiAob0Fubm90YXRpb25zICYmIG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGVcIl0pIHtcblx0XHRiSW1tdXRhYmxlID0gb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkltbXV0YWJsZVwiXS5Cb29sID8gb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkltbXV0YWJsZVwiXS5Cb29sID09IFwidHJ1ZVwiIDogdHJ1ZTtcblx0fVxuXHRiUmVhZE9ubHkgPSBiQ29tcHV0ZWQgfHwgYkltbXV0YWJsZTtcblxuXHRpZiAob0ZpZWxkQ29udHJvbCkge1xuXHRcdGJSZWFkT25seSA9IGJSZWFkT25seSB8fCBvRmllbGRDb250cm9sID09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFR5cGUvUmVhZE9ubHlcIjtcblx0fVxuXHRpZiAoYlJlYWRPbmx5KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgcmVhZE9ubHlFeHByZXNzaW9uRnJvbUR5bmFtaWNBbm5vdGF0aW9ucyA9IGZ1bmN0aW9uIChvRmllbGRDb250cm9sOiBhbnkpIHtcblx0bGV0IHNJc0ZpZWxkQ29udHJvbFBhdGhSZWFkT25seTtcblx0aWYgKG9GaWVsZENvbnRyb2wpIHtcblx0XHRpZiAoKE1hbmFnZWRPYmplY3QgYXMgYW55KS5iaW5kaW5nUGFyc2VyKG9GaWVsZENvbnRyb2wpKSB7XG5cdFx0XHRzSXNGaWVsZENvbnRyb2xQYXRoUmVhZE9ubHkgPSBcIiVcIiArIG9GaWVsZENvbnRyb2wgKyBcIiA9PT0gMSBcIjtcblx0XHR9XG5cdH1cblx0aWYgKHNJc0ZpZWxkQ29udHJvbFBhdGhSZWFkT25seSkge1xuXHRcdHJldHVybiBcIns9IFwiICsgc0lzRmllbGRDb250cm9sUGF0aFJlYWRPbmx5ICsgXCI/IGZhbHNlIDogdHJ1ZSB9XCI7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcblxuLypcbiAqIEZ1bmN0aW9uIHRvIGdldCB0aGUgZXhwcmVzc2lvbiBmb3IgY2hhcnQgVGl0bGUgUHJlc3NcbiAqXG4gKiBAZnVuY3Rpb253XG4gKiBAcGFyYW0ge29Db25maWd1cmF0aW9ufSBbb0NvbmZpZ3VyYXRpb25zXSBjb250cm9sIGNvbmZpZ3VyYXRpb24gZnJvbSBtYW5pZmVzdFxuICogIEBwYXJhbSB7b01hbmlmZXN0fSBbb01hbmlmZXN0XSBPdXRib3VuZHMgZnJvbSBtYW5pZmVzdFxuICogcmV0dXJucyB7U3RyaW5nfSBbc0NvbGxlY3Rpb25OYW1lXSBDb2xsZWN0aW9uIE5hbWUgb2YgdGhlIE1pY3JvIENoYXJ0XG4gKlxuICogcmV0dXJucyB7U3RyaW5nfSBbRXhwcmVzc2lvbl0gSGFuZGxlciBFeHByZXNzaW9uIGZvciB0aGUgdGl0bGUgcHJlc3NcbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeHByZXNzaW9uRm9yTWljcm9DaGFydFRpdGxlUHJlc3MgPSBmdW5jdGlvbiAob0NvbmZpZ3VyYXRpb246IGFueSwgb01hbmlmZXN0T3V0Ym91bmQ6IGFueSwgc0NvbGxlY3Rpb25OYW1lOiBhbnkpIHtcblx0aWYgKG9Db25maWd1cmF0aW9uKSB7XG5cdFx0aWYgKFxuXHRcdFx0KG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl0gJiYgb0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXVtcIm91dGJvdW5kXCJdKSB8fFxuXHRcdFx0KG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl0gJiYgb0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXVtcIm91dGJvdW5kXCJdICYmIG9Db25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcIi5oYW5kbGVycy5vbkRhdGFQb2ludFRpdGxlUHJlc3NlZCgkY29udHJvbGxlciwgJHskc291cmNlPi99LCdcIiArXG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KG9NYW5pZmVzdE91dGJvdW5kKSArXG5cdFx0XHRcdFwiJywnXCIgK1xuXHRcdFx0XHRvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdW1wib3V0Ym91bmRcIl0gK1xuXHRcdFx0XHRcIicsJ1wiICtcblx0XHRcdFx0c0NvbGxlY3Rpb25OYW1lICtcblx0XHRcdFx0XCInIClcIlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKG9Db25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pIHtcblx0XHRcdHJldHVybiBcIi5oYW5kbGVycy5uYXZpZ2F0ZVRvU3ViU2VjdGlvbigkY29udHJvbGxlciwgJ1wiICsgSlNPTi5zdHJpbmdpZnkob0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRTZWN0aW9uc1wiXSkgKyBcIicpXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG59O1xuXG4vKlxuICogRnVuY3Rpb24gdG8gcmVuZGVyIENoYXJ0IFRpdGxlIGFzIExpbmtcbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7b0NvbnRyb2xDb25maWd1cmF0aW9ufSBbb0NvbmZpZ3VyYXRpb25zXSBjb250cm9sIGNvbmZpZ3VyYXRpb24gZnJvbSBtYW5pZmVzdFxuICogcmV0dXJucyB7U3RyaW5nfSBbc0tleV0gRm9yIHRoZSBUYXJnZXRPdXRib3VuZCBhbmQgVGFyZ2V0U2VjdGlvblxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IGdldE1pY3JvQ2hhcnRUaXRsZUFzTGluayA9IGZ1bmN0aW9uIChvQ29udHJvbENvbmZpZ3VyYXRpb246IGFueSkge1xuXHRpZiAoXG5cdFx0b0NvbnRyb2xDb25maWd1cmF0aW9uICYmXG5cdFx0KG9Db250cm9sQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdIHx8IChvQ29udHJvbENvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXSAmJiBvQ29udHJvbENvbmZpZ3VyYXRpb25bXCJ0YXJnZXRTZWN0aW9uc1wiXSkpXG5cdCkge1xuXHRcdHJldHVybiBcIkV4dGVybmFsXCI7XG5cdH0gZWxzZSBpZiAob0NvbnRyb2xDb25maWd1cmF0aW9uICYmIG9Db250cm9sQ29uZmlndXJhdGlvbltcInRhcmdldFNlY3Rpb25zXCJdKSB7XG5cdFx0cmV0dXJuIFwiSW5QYWdlXCI7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFwiTm9uZVwiO1xuXHR9XG59O1xuXG4vKiBHZXQgZ3JvdXBJZCBmcm9tIGNvbnRyb2wgY29uZmlndXJhdGlvblxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtPYmplY3R9IFtvQ29uZmlndXJhdGlvbnNdIGNvbnRyb2wgY29uZmlndXJhdGlvbiBmcm9tIG1hbmlmZXN0XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NBbm5vdGF0aW9uUGF0aF0gQW5ub3RhdGlvbiBQYXRoIGZvciB0aGUgY29uZmlndXJhdGlvblxuICogQGRlc2NyaXB0aW9uIFVzZWQgdG8gZ2V0IHRoZSBncm91cElkIGZvciBEYXRhUG9pbnRzIGFuZCBNaWNyb0NoYXJ0cyBpbiB0aGUgSGVhZGVyLlxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEdyb3VwSWRGcm9tQ29uZmlnID0gZnVuY3Rpb24gKG9Db25maWd1cmF0aW9uczogYW55LCBzQW5ub3RhdGlvblBhdGg6IGFueSwgc0RlZmF1bHRHcm91cElkPzogYW55KSB7XG5cdGNvbnN0IG9Db25maWd1cmF0aW9uID0gb0NvbmZpZ3VyYXRpb25zW3NBbm5vdGF0aW9uUGF0aF0sXG5cdFx0YUF1dG9QYXR0ZXJucyA9IFtcIkhlcm9lc1wiLCBcIkRlY29yYXRpb25cIiwgXCJXb3JrZXJzXCIsIFwiTG9uZ1J1bm5lcnNcIl07XG5cdGxldCBzR3JvdXBJZCA9IHNEZWZhdWx0R3JvdXBJZDtcblx0aWYgKFxuXHRcdG9Db25maWd1cmF0aW9uICYmXG5cdFx0b0NvbmZpZ3VyYXRpb24ucmVxdWVzdEdyb3VwSWQgJiZcblx0XHRhQXV0b1BhdHRlcm5zLnNvbWUoZnVuY3Rpb24gKGF1dG9QYXR0ZXJuOiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiBhdXRvUGF0dGVybiA9PT0gb0NvbmZpZ3VyYXRpb24ucmVxdWVzdEdyb3VwSWQ7XG5cdFx0fSlcblx0KSB7XG5cdFx0c0dyb3VwSWQgPSBcIiRhdXRvLlwiICsgb0NvbmZpZ3VyYXRpb24ucmVxdWVzdEdyb3VwSWQ7XG5cdH1cblx0cmV0dXJuIHNHcm91cElkO1xufTtcblxuLypcbiAqIEdldCBDb250ZXh0IEJpbmRpbmcgd2l0aCBncm91cElkIGZyb20gY29udHJvbCBjb25maWd1cmF0aW9uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gW29Db25maWd1cmF0aW9uc10gY29udHJvbCBjb25maWd1cmF0aW9uIGZyb20gbWFuaWZlc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc0tleV0gQW5ub3RhdGlvbiBQYXRoIGZvciBvZiB0aGUgY29uZmlndXJhdGlvblxuICogQGRlc2NyaXB0aW9uIFVzZWQgdG8gZ2V0IHRoZSBiaW5kaW5nIGZvciBEYXRhUG9pbnRzIGluIHRoZSBIZWFkZXIuXG4gKlxuICovXG5leHBvcnQgY29uc3QgZ2V0QmluZGluZ1dpdGhHcm91cElkRnJvbUNvbmZpZyA9IGZ1bmN0aW9uIChvQ29uZmlndXJhdGlvbnM6IGFueSwgc0tleTogYW55KSB7XG5cdGNvbnN0IHNHcm91cElkID0gZ2V0R3JvdXBJZEZyb21Db25maWcob0NvbmZpZ3VyYXRpb25zLCBzS2V5KTtcblx0bGV0IHNCaW5kaW5nO1xuXHRpZiAoc0dyb3VwSWQpIHtcblx0XHRzQmluZGluZyA9IFwieyBwYXRoIDogJycsIHBhcmFtZXRlcnMgOiB7ICQkZ3JvdXBJZCA6ICdcIiArIHNHcm91cElkICsgXCInIH0gfVwiO1xuXHR9XG5cdHJldHVybiBzQmluZGluZztcbn07XG5cbi8qKlxuICogTWV0aG9kIHRvIGNoZWNrIHdoZXRoZXIgYSBGaWVsZEdyb3VwIGNvbnNpc3RzIG9mIG9ubHkgMSBEYXRhRmllbGQgd2l0aCBNdWx0aUxpbmUgVGV4dCBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBhRm9ybUVsZW1lbnRzIEEgY29sbGVjdGlvbiBvZiBmb3JtIGVsZW1lbnRzIHVzZWQgaW4gdGhlIGN1cnJlbnQgZmllbGQgZ3JvdXBcbiAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiBvbmx5IDEgZGF0YSBmaWVsZCB3aXRoIE11bHRpbGluZSBUZXh0IGFubm90YXRpb24gZXhpc3RzLlxuICovXG5leHBvcnQgY29uc3QgZG9lc0ZpZWxkR3JvdXBDb250YWluT25seU9uZU11bHRpTGluZURhdGFGaWVsZCA9IGZ1bmN0aW9uIChhRm9ybUVsZW1lbnRzOiBhbnlbXSkge1xuXHRyZXR1cm4gYUZvcm1FbGVtZW50cyAmJiBhRm9ybUVsZW1lbnRzLmxlbmd0aCA9PT0gMSAmJiAhIWFGb3JtRWxlbWVudHNbMF0uaXNWYWx1ZU11bHRpbGluZVRleHQ7XG59O1xuXG4vKlxuICogR2V0IFZpc2libGl0eSBvZiBicmVhZGNydW1icy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb1ZpZXdEYXRhXSBWaWV3RGF0YSBtb2RlbFxuICogcmV0dXJucyB7Kn0gRXhwcmVzc2lvbiBvciBib29sZWFuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRWaXNpYmxlRXhwcmVzc2lvbkZvckJyZWFkY3J1bWJzID0gZnVuY3Rpb24gKG9WaWV3RGF0YTogYW55KSB7XG5cdHJldHVybiBvVmlld0RhdGEuc2hvd0JyZWFkQ3J1bWJzICYmIG9WaWV3RGF0YS5mY2xFbmFibGVkICE9PSB1bmRlZmluZWQgPyBcIntmY2xoZWxwZXI+L2JyZWFkQ3J1bWJJc1Zpc2libGV9XCIgOiBvVmlld0RhdGEuc2hvd0JyZWFkQ3J1bWJzO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFNoYXJlQnV0dG9uVmlzaWJpbGl0eSA9IGZ1bmN0aW9uICh2aWV3RGF0YTogYW55KSB7XG5cdGxldCBzU2hhcmVCdXR0b25WaXNpYmlsaXR5RXhwID0gXCIhJHt1aT5jcmVhdGVNb2RlfVwiO1xuXHRpZiAodmlld0RhdGEuZmNsRW5hYmxlZCkge1xuXHRcdHNTaGFyZUJ1dHRvblZpc2liaWxpdHlFeHAgPSBcIiR7ZmNsaGVscGVyPi9zaG93U2hhcmVJY29ufSAmJiBcIiArIHNTaGFyZUJ1dHRvblZpc2liaWxpdHlFeHA7XG5cdH1cblx0cmV0dXJuIFwiez0gXCIgKyBzU2hhcmVCdXR0b25WaXNpYmlsaXR5RXhwICsgXCIgfVwiO1xufTtcblxuLypcbiAqIEdldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGhlYWRlciBpbmZvIGluIGVkaXQgbW9kZVxuICpcbiAqIElmIGVpdGhlciB0aGUgdGl0bGUgb3IgZGVzY3JpcHRpb24gZmllbGQgZnJvbSB0aGUgaGVhZGVyIGFubm90YXRpb25zIGFyZSBlZGl0YWJsZSwgdGhlbiB0aGVcbiAqIGVkaXRhYmxlIGhlYWRlciBpbmZvIGlzIHZpc2libGUuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gW29Bbm5vdGF0aW9uc10gQW5ub3RhdGlvbnMgb2JqZWN0IGZvciBnaXZlbiBlbnRpdHkgc2V0XG4gKiBAcGFyYW0ge29iamVjdH0gW29GaWVsZENvbnRyb2xdIGZpZWxkIGNvbnRyb2xcbiAqIHJldHVybnMgeyp9ICBiaW5kaW5nIGV4cHJlc3Npb24gb3IgYm9vbGVhbiB2YWx1ZSByZXNvbHZlZCBmb3JtIGZ1bmNpdG9ucyBpc1JlYWRPbmx5RnJvbVN0YXRpY0Fubm90YXRpb25zIGFuZCBpc1JlYWRPbmx5RnJvbUR5bmFtaWNBbm5vdGF0aW9uc1xuICovXG5leHBvcnQgY29uc3QgZ2V0VmlzaWJsaXR5T2ZIZWFkZXJJbmZvID0gZnVuY3Rpb24gKFxuXHRvVGl0bGVBbm5vdGF0aW9uczogYW55LFxuXHRvRGVzY3JpcHRpb25Bbm5vdGF0aW9uczogYW55LFxuXHRvRmllbGRUaXRsZUZpZWxkQ29udHJvbDogYW55LFxuXHRvRmllbGREZXNjcmlwdGlvbkZpZWxkQ29udHJvbDogYW55XG4pIHtcblx0Ly8gQ2hlY2sgQW5ub3RhdGlvbnMgZm9yIFRpdGxlIEZpZWxkXG5cdC8vIFNldCB0byB0cnVlIGFuZCBkb24ndCB0YWtlIGludG8gYWNjb3VudCwgaWYgdGhlcmUgYXJlIG5vIGFubm90YXRpb25zLCBpLmUuIG5vIHRpdGxlIGV4aXN0c1xuXHRjb25zdCBiSXNUaXRsZVJlYWRPbmx5ID0gb1RpdGxlQW5ub3RhdGlvbnMgPyBpc1JlYWRPbmx5RnJvbVN0YXRpY0Fubm90YXRpb25zKG9UaXRsZUFubm90YXRpb25zLCBvRmllbGRUaXRsZUZpZWxkQ29udHJvbCkgOiB0cnVlO1xuXHRjb25zdCB0aXRsZUV4cHJlc3Npb24gPSByZWFkT25seUV4cHJlc3Npb25Gcm9tRHluYW1pY0Fubm90YXRpb25zKG9GaWVsZFRpdGxlRmllbGRDb250cm9sKTtcblx0Ly8gVGhlcmUgaXMgbm8gZXhwcmVzc2lvbiBhbmQgdGhlIHRpdGxlIGlzIG5vdCByZWFkeSBvbmx5LCB0aGlzIGlzIHN1ZmZpY2llbnQgZm9yIGFuIGVkaXRhYmxlIGhlYWRlclxuXHRpZiAoIWJJc1RpdGxlUmVhZE9ubHkgJiYgIXRpdGxlRXhwcmVzc2lvbikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Ly8gQ2hlY2sgQW5ub3RhdGlvbnMgZm9yIERlc2NyaXB0aW9uIEZpZWxkXG5cdC8vIFNldCB0byB0cnVlIGFuZCBkb24ndCB0YWtlIGludG8gYWNjb3VudCwgaWYgdGhlcmUgYXJlIG5vIGFubm90YXRpb25zLCBpLmUuIG5vIGRlc2NyaXB0aW9uIGV4aXN0c1xuXHRjb25zdCBiSXNEZXNjcmlwdGlvblJlYWRPbmx5ID0gb0Rlc2NyaXB0aW9uQW5ub3RhdGlvbnNcblx0XHQ/IGlzUmVhZE9ubHlGcm9tU3RhdGljQW5ub3RhdGlvbnMob0Rlc2NyaXB0aW9uQW5ub3RhdGlvbnMsIG9GaWVsZERlc2NyaXB0aW9uRmllbGRDb250cm9sKVxuXHRcdDogdHJ1ZTtcblx0Y29uc3QgZGVzY3JpcHRpb25FeHByZXNzaW9uID0gcmVhZE9ubHlFeHByZXNzaW9uRnJvbUR5bmFtaWNBbm5vdGF0aW9ucyhvRmllbGREZXNjcmlwdGlvbkZpZWxkQ29udHJvbCk7XG5cdC8vIFRoZXJlIGlzIG5vIGV4cHJlc3Npb24gYW5kIHRoZSBkZXNjcmlwdGlvbiBpcyBub3QgcmVhZHkgb25seSwgdGhpcyBpcyBzdWZmaWNpZW50IGZvciBhbiBlZGl0YWJsZSBoZWFkZXJcblx0aWYgKCFiSXNEZXNjcmlwdGlvblJlYWRPbmx5ICYmICFkZXNjcmlwdGlvbkV4cHJlc3Npb24pIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIEJvdGggdGl0bGUgYW5kIGRlc2NyaXB0aW9uIGFyZSBub3QgZWRpdGFibGUgYW5kIHRoZXJlIGFyZSBubyBkeW5hbWljIGFubm90YXRpb25zXG5cdGlmIChiSXNUaXRsZVJlYWRPbmx5ICYmIGJJc0Rlc2NyaXB0aW9uUmVhZE9ubHkgJiYgIXRpdGxlRXhwcmVzc2lvbiAmJiAhZGVzY3JpcHRpb25FeHByZXNzaW9uKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gTm93IGNvbWJpbmUgZXhwcmVzc2lvbnNcblx0aWYgKHRpdGxlRXhwcmVzc2lvbiAmJiAhZGVzY3JpcHRpb25FeHByZXNzaW9uKSB7XG5cdFx0cmV0dXJuIHRpdGxlRXhwcmVzc2lvbjtcblx0fSBlbHNlIGlmICghdGl0bGVFeHByZXNzaW9uICYmIGRlc2NyaXB0aW9uRXhwcmVzc2lvbikge1xuXHRcdHJldHVybiBkZXNjcmlwdGlvbkV4cHJlc3Npb247XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbWJpbmVUaXRsZUFuZERlc2NyaXB0aW9uRXhwcmVzc2lvbihvRmllbGRUaXRsZUZpZWxkQ29udHJvbCwgb0ZpZWxkRGVzY3JpcHRpb25GaWVsZENvbnRyb2wpO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgY29tYmluZVRpdGxlQW5kRGVzY3JpcHRpb25FeHByZXNzaW9uID0gZnVuY3Rpb24gKG9UaXRsZUZpZWxkQ29udHJvbDogYW55LCBvRGVzY3JpcHRpb25GaWVsZENvbnRyb2w6IGFueSkge1xuXHQvLyBJZiBib3RoIGhlYWRlciBhbmQgdGl0bGUgZmllbGQgYXJlIGJhc2VkIG9uIGR5bm1haWMgZmllbGQgY29udHJvbCwgdGhlIGVkaXRhYmxlIGhlYWRlclxuXHQvLyBpcyB2aXNpYmxlIGlmIGF0IGxlYXN0IG9uZSBvZiB0aGVzZSBpcyBub3QgcmVhZHkgb25seVxuXHRyZXR1cm4gXCJ7PSAlXCIgKyBvVGl0bGVGaWVsZENvbnRyb2wgKyBcIiA9PT0gMSA/ICggJVwiICsgb0Rlc2NyaXB0aW9uRmllbGRDb250cm9sICsgXCIgPT09IDEgPyBmYWxzZSA6IHRydWUgKSA6IHRydWUgfVwiO1xufTtcblxuLypcbiAqIEdldCBFeHByZXNzaW9uIG9mIHByZXNzIGV2ZW50IG9mIGRlbGV0ZSBidXR0b24uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gW3NFbnRpdHlTZXROYW1lXSBFbnRpdHkgc2V0IG5hbWVcbiAqIHJldHVybnMge3N0cmluZ30gIGJpbmRpbmcgZXhwcmVzc2lvbiAvIGZ1bmN0aW9uIHN0cmluZyBnZW5lcmF0ZWQgZnJvbSBjb21tYW5oZWxwZXIncyBmdW5jdGlvbiBnZW5lcmF0ZUZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcmVzc0V4cHJlc3Npb25Gb3JEZWxldGUgPSBmdW5jdGlvbiAoZW50aXR5U2V0OiBPYmplY3QsIG9JbnRlcmZhY2U6IENvbXB1dGVkQW5ub3RhdGlvbkludGVyZmFjZSk6IHN0cmluZyB7XG5cdGNvbnN0IHNEZWxldGFibGVDb250ZXh0cyA9IFwiJHskdmlldz4vZ2V0QmluZGluZ0NvbnRleHR9XCIsXG5cdFx0c1RpdGxlID0gXCIkeyR2aWV3Pi8jZmU6Ok9iamVjdFBhZ2UvZ2V0SGVhZGVyVGl0bGUvZ2V0RXhwYW5kZWRIZWFkaW5nL2dldEl0ZW1zLzEvZ2V0VGV4dH1cIixcblx0XHRzRGVzY3JpcHRpb24gPSBcIiR7JHZpZXc+LyNmZTo6T2JqZWN0UGFnZS9nZXRIZWFkZXJUaXRsZS9nZXRFeHBhbmRlZENvbnRlbnQvMC9nZXRJdGVtcy8wL2dldFRleHR9XCI7XG5cdGNvbnN0IGVzQ29udGV4dCA9IG9JbnRlcmZhY2UgJiYgb0ludGVyZmFjZS5jb250ZXh0O1xuXHRjb25zdCBjb250ZXh0UGF0aCA9IGVzQ29udGV4dC5nZXRQYXRoKCk7XG5cdGNvbnN0IGNvbnRleHRQYXRoUGFydHMgPSBjb250ZXh0UGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0Y29uc3Qgc0VudGl0eVNldE5hbWUgPVxuXHRcdGNvbnRleHRQYXRoUGFydHMubGVuZ3RoID4gMSA/IGVzQ29udGV4dC5nZXRNb2RlbCgpLmdldE9iamVjdChgLyR7Y29udGV4dFBhdGhQYXJ0cy5qb2luKFwiL1wiKX1Ac2FwdWkubmFtZWApIDogY29udGV4dFBhdGhQYXJ0c1swXTtcblx0Y29uc3Qgb1BhcmFtcyA9IHtcblx0XHR0aXRsZTogc1RpdGxlLFxuXHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpLFxuXHRcdGRlc2NyaXB0aW9uOiBzRGVzY3JpcHRpb25cblx0fTtcblx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmVkaXRGbG93LmRlbGV0ZURvY3VtZW50XCIsIHNEZWxldGFibGVDb250ZXh0cywgQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpKTtcbn07XG5cbmdldFByZXNzRXhwcmVzc2lvbkZvckRlbGV0ZS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuLypcbiAqIEdldCBFeHByZXNzaW9uIG9mIHByZXNzIGV2ZW50IG9mIEVkaXQgYnV0dG9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IFtvRGF0YUZpZWxkXSBEYXRhIGZpZWxkIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IFtzRW50aXR5U2V0TmFtZV0gRW50aXR5IHNldCBuYW1lXG4gKiBAcGFyYW0ge29iamVjdH0gW29IZWFkZXJBY3Rpb25dIEhlYWRlciBhY3Rpb24gb2JqZWN0XG4gKiByZXR1cm5zIHtzdHJpbmd9ICBiaW5kaW5nIGV4cHJlc3Npb24gLyBmdW5jdGlvbiBzdHJpbmcgZ2VuZXJhdGVkIGZyb20gY29tbWFuaGVscGVyJ3MgZnVuY3Rpb24gZ2VuZXJhdGVGdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0UHJlc3NFeHByZXNzaW9uRm9yRWRpdCA9IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIHNFbnRpdHlTZXROYW1lOiBhbnksIG9IZWFkZXJBY3Rpb246IGFueSkge1xuXHRjb25zdCBzRWRpdGFibGVDb250ZXh0cyA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkFjdGlvbiksXG5cdFx0c0RhdGFGaWVsZEVudW1NZW1iZXIgPSBvRGF0YUZpZWxkICYmIG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nICYmIG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nW1wiJEVudW1NZW1iZXJcIl0sXG5cdFx0c0ludm9jYXRpb25Hcm91cCA9IHNEYXRhRmllbGRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk9wZXJhdGlvbkdyb3VwaW5nVHlwZS9DaGFuZ2VTZXRcIiA/IFwiQ2hhbmdlU2V0XCIgOiBcIklzb2xhdGVkXCI7XG5cdGNvbnN0IG9QYXJhbXMgPSB7XG5cdFx0Y29udGV4dHM6IFwiJHskdmlldz4vZ2V0QmluZGluZ0NvbnRleHR9XCIsXG5cdFx0ZW50aXR5U2V0TmFtZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzRW50aXR5U2V0TmFtZSksXG5cdFx0aW52b2NhdGlvbkdyb3VwaW5nOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNJbnZvY2F0aW9uR3JvdXApLFxuXHRcdG1vZGVsOiBcIiR7JHNvdXJjZT4vfS5nZXRNb2RlbCgpXCIsXG5cdFx0bGFiZWw6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkxhYmVsLCB0cnVlKSxcblx0XHRpc05hdmlnYWJsZTogb0hlYWRlckFjdGlvbiAmJiBvSGVhZGVyQWN0aW9uLmlzTmF2aWdhYmxlLFxuXHRcdGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbjpcblx0XHRcdG9IZWFkZXJBY3Rpb24gJiYgb0hlYWRlckFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24gPyBgJyR7b0hlYWRlckFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb259J2AgOiB1bmRlZmluZWRcblx0fTtcblx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmhhbmRsZXJzLm9uQ2FsbEFjdGlvblwiLCBcIiR7JHZpZXc+L31cIiwgc0VkaXRhYmxlQ29udGV4dHMsIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUGFyYW1zKSk7XG59O1xuXG4vKlxuICogTWV0aG9kIHRvIGdldCB0aGUgZXhwcmVzc2lvbiBmb3IgdGhlICdwcmVzcycgZXZlbnQgZm9yIGZvb3RlciBhbm5vdGF0aW9uIGFjdGlvbnNcbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0RhdGFGaWVsZF0gRGF0YSBmaWVsZCBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc0VudGl0eVNldE5hbWVdIEVudGl0eSBzZXQgbmFtZVxuICogQHBhcmFtIHtvYmplY3R9IFtvSGVhZGVyQWN0aW9uXSBIZWFkZXIgYWN0aW9uIG9iamVjdFxuICogcmV0dXJucyB7c3RyaW5nfSAgQmluZGluZyBleHByZXNzaW9uIG9yIGZ1bmN0aW9uIHN0cmluZyB0aGF0IGlzIGdlbmVyYXRlZCBmcm9tIHRoZSBDb21tb25oZWxwZXIncyBmdW5jdGlvbiBnZW5lcmF0ZUZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcmVzc0V4cHJlc3Npb25Gb3JGb290ZXJBbm5vdGF0aW9uQWN0aW9uID0gZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgc0VudGl0eVNldE5hbWU6IGFueSwgb0hlYWRlckFjdGlvbjogYW55KSB7XG5cdGNvbnN0IHNBY3Rpb25Db250ZXh0cyA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkFjdGlvbiksXG5cdFx0c0RhdGFGaWVsZEVudW1NZW1iZXIgPSBvRGF0YUZpZWxkICYmIG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nICYmIG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nW1wiJEVudW1NZW1iZXJcIl0sXG5cdFx0c0ludm9jYXRpb25Hcm91cCA9IHNEYXRhRmllbGRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk9wZXJhdGlvbkdyb3VwaW5nVHlwZS9DaGFuZ2VTZXRcIiA/IFwiQ2hhbmdlU2V0XCIgOiBcIklzb2xhdGVkXCI7XG5cdGNvbnN0IG9QYXJhbXMgPSB7XG5cdFx0Y29udGV4dHM6IFwiJHskdmlldz4vI2ZlOjpPYmplY3RQYWdlL30uZ2V0QmluZGluZ0NvbnRleHQoKVwiLFxuXHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpLFxuXHRcdGludm9jYXRpb25Hcm91cGluZzogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzSW52b2NhdGlvbkdyb3VwKSxcblx0XHRtb2RlbDogXCIkeyRzb3VyY2U+L30uZ2V0TW9kZWwoKVwiLFxuXHRcdGxhYmVsOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZC5MYWJlbCwgdHJ1ZSksXG5cdFx0aXNOYXZpZ2FibGU6IG9IZWFkZXJBY3Rpb24gJiYgb0hlYWRlckFjdGlvbi5pc05hdmlnYWJsZSxcblx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246XG5cdFx0XHRvSGVhZGVyQWN0aW9uICYmIG9IZWFkZXJBY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uID8gYCcke29IZWFkZXJBY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9ufSdgIDogdW5kZWZpbmVkXG5cdH07XG5cdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcIi5oYW5kbGVycy5vbkNhbGxBY3Rpb25cIiwgXCIkeyR2aWV3Pi99XCIsIHNBY3Rpb25Db250ZXh0cywgQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpKTtcbn07XG5cbi8qXG4gKiBHZXQgRXhwcmVzc2lvbiBvZiBleGVjdXRlIGV2ZW50IGV4cHJlc3Npb24gb2YgcHJpbWFyeSBhY3Rpb24uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gW29EYXRhRmllbGRdIERhdGEgZmllbGQgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW3NFbnRpdHlTZXROYW1lXSBFbnRpdHkgc2V0IG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0hlYWRlckFjdGlvbl0gSGVhZGVyIGFjdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmd9IFRoZSB2aXNpYmlsaXR5IG9mIHNlbWF0aWMgcG9zaXRpdmUgYWN0aW9uXG4gKiBAcGFyYW0ge0NvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nfSBUaGUgZW5hYmxlbWVudCBvZiBzZW1hbnRpYyBwb3NpdGl2ZSBhY3Rpb25cbiAqIEBwYXJhbSB7Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmd9IFRoZSBFZGl0IGJ1dHRvbiB2aXNpYmlsaXR5XG4gKiBAcGFyYW0ge0NvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nfSBUaGUgZW5hYmxlbWVudCBvZiBFZGl0IGJ1dHRvblxuICogcmV0dXJucyB7c3RyaW5nfSAgYmluZGluZyBleHByZXNzaW9uIC8gZnVuY3Rpb24gc3RyaW5nIGdlbmVyYXRlZCBmcm9tIGNvbW1hbmhlbHBlcidzIGZ1bmN0aW9uIGdlbmVyYXRlRnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFByZXNzRXhwcmVzc2lvbkZvclByaW1hcnlBY3Rpb24gPSBmdW5jdGlvbiAoXG5cdG9EYXRhRmllbGQ6IGFueSxcblx0c0VudGl0eVNldE5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0b0hlYWRlckFjdGlvbjogQmFzZUFjdGlvbiB8IG51bGwsXG5cdHBvc2l0aXZlQWN0aW9uVmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmcsXG5cdHBvc2l0aXZlQWN0aW9uRW5hYmxlZDogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmcsXG5cdGVkaXRBY3Rpb25WaXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHN0cmluZyxcblx0ZWRpdEFjdGlvbkVuYWJsZWQ6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nXG4pIHtcblx0Y29uc3Qgc0FjdGlvbkNvbnRleHRzID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvRGF0YUZpZWxkICYmIG9EYXRhRmllbGQuQWN0aW9uKSxcblx0XHRzRGF0YUZpZWxkRW51bU1lbWJlciA9IG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZC5JbnZvY2F0aW9uR3JvdXBpbmcgJiYgb0RhdGFGaWVsZC5JbnZvY2F0aW9uR3JvdXBpbmdbXCIkRW51bU1lbWJlclwiXSxcblx0XHRzSW52b2NhdGlvbkdyb3VwID0gc0RhdGFGaWVsZEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuT3BlcmF0aW9uR3JvdXBpbmdUeXBlL0NoYW5nZVNldFwiID8gXCJDaGFuZ2VTZXRcIiA6IFwiSXNvbGF0ZWRcIjtcblx0Y29uc3Qgb1BhcmFtcyA9IHtcblx0XHRjb250ZXh0czogXCIkeyR2aWV3Pi8jZmU6Ok9iamVjdFBhZ2UvfS5nZXRCaW5kaW5nQ29udGV4dCgpXCIsXG5cdFx0ZW50aXR5U2V0TmFtZTogc0VudGl0eVNldE5hbWUgPyBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNFbnRpdHlTZXROYW1lKSA6IFwiXCIsXG5cdFx0aW52b2NhdGlvbkdyb3VwaW5nOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNJbnZvY2F0aW9uR3JvdXApLFxuXHRcdG1vZGVsOiBcIiR7JHNvdXJjZT4vfS5nZXRNb2RlbCgpXCIsXG5cdFx0bGFiZWw6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZD8uTGFiZWwsIHRydWUpLFxuXHRcdGlzTmF2aWdhYmxlOiBvSGVhZGVyQWN0aW9uPy5pc05hdmlnYWJsZSxcblx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IG9IZWFkZXJBY3Rpb24/LmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvblxuXHRcdFx0PyBgJyR7b0hlYWRlckFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb259J2Bcblx0XHRcdDogdW5kZWZpbmVkXG5cdH07XG5cdGNvbnN0IG9Db25kaXRpb25zID0ge1xuXHRcdHBvc2l0aXZlQWN0aW9uVmlzaWJsZSxcblx0XHRwb3NpdGl2ZUFjdGlvbkVuYWJsZWQsXG5cdFx0ZWRpdEFjdGlvblZpc2libGUsXG5cdFx0ZWRpdEFjdGlvbkVuYWJsZWRcblx0fTtcblx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFxuXHRcdFwiLmhhbmRsZXJzLm9uUHJpbWFyeUFjdGlvblwiLFxuXHRcdFwiJGNvbnRyb2xsZXJcIixcblx0XHRcIiR7JHZpZXc+L31cIixcblx0XHRcIiR7JHZpZXc+L2dldEJpbmRpbmdDb250ZXh0fVwiLFxuXHRcdHNBY3Rpb25Db250ZXh0cyxcblx0XHRDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcyksXG5cdFx0Q29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9Db25kaXRpb25zKVxuXHQpO1xufTtcblxuLypcbiAqIEdldHMgdGhlIGJpbmRpbmcgb2YgdGhlIGNvbnRhaW5lciBIQm94IGZvciB0aGUgaGVhZGVyIGZhY2V0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IFtvQ29udHJvbENvbmZpZ3VyYXRpb25dIFRoZSBjb250cm9sIGNvbmZpZ3VyYXRpb24gZm9ybSBvZiB0aGUgdmlld0RhdGEgbW9kZWxcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0hlYWRlckZhY2V0XSBUaGUgb2JqZWN0IG9mIHRoZSBoZWFkZXIgZmFjZXRcbiAqIHJldHVybnMgeyp9ICBUaGUgYmluZGluZyBleHByZXNzaW9uIGZyb20gZnVuY3Rpb24gZ2V0QmluZGluZ1dpdGhHcm91cElkRnJvbUNvbmZpZyBvciB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTdGFzaGFibGVIQm94QmluZGluZyA9IGZ1bmN0aW9uIChvQ29udHJvbENvbmZpZ3VyYXRpb246IGFueSwgb0hlYWRlckZhY2V0OiBhbnkpIHtcblx0aWYgKG9IZWFkZXJGYWNldCAmJiBvSGVhZGVyRmFjZXQuRmFjZXQgJiYgb0hlYWRlckZhY2V0LkZhY2V0LnRhcmdldEFubm90YXRpb25UeXBlID09PSBcIkRhdGFQb2ludFwiKSB7XG5cdFx0cmV0dXJuIGdldEJpbmRpbmdXaXRoR3JvdXBJZEZyb21Db25maWcob0NvbnRyb2xDb25maWd1cmF0aW9uLCBvSGVhZGVyRmFjZXQuRmFjZXQudGFyZ2V0QW5ub3RhdGlvblZhbHVlKTtcblx0fVxufTtcblxuLypcbiAqIEdldHMgdGhlICdQcmVzcycgZXZlbnQgZXhwcmVzc2lvbiBmb3IgdGhlIGV4dGVybmFsIGFuZCBpbnRlcm5hbCBkYXRhIHBvaW50IGxpbmsuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gW29Db25maWd1cmF0aW9uXSBDb250cm9sIGNvbmZpZ3VyYXRpb24gZnJvbSBtYW5pZmVzdFxuICogQHBhcmFtIHtvYmplY3R9IFtvTWFuaWZlc3RPdXRib3VuZF0gT3V0Ym91bmRzIGZyb20gbWFuaWZlc3RcbiAqIHJldHVybnMge3N0cmluZ30gVGhlIHJ1bnRpbWUgYmluZGluZyBvZiB0aGUgJ1ByZXNzJyBldmVudFxuICovXG5leHBvcnQgY29uc3QgZ2V0UHJlc3NFeHByZXNzaW9uRm9yTGluayA9IGZ1bmN0aW9uIChvQ29uZmlndXJhdGlvbjogYW55LCBvTWFuaWZlc3RPdXRib3VuZDogYW55KSB7XG5cdGlmIChvQ29uZmlndXJhdGlvbikge1xuXHRcdGlmIChvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdICYmIG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl1bXCJvdXRib3VuZFwiXSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XCIuaGFuZGxlcnMub25EYXRhUG9pbnRUaXRsZVByZXNzZWQoJGNvbnRyb2xsZXIsICR7JHNvdXJjZT59LCBcIiArXG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KG9NYW5pZmVzdE91dGJvdW5kKSArXG5cdFx0XHRcdFwiLFwiICtcblx0XHRcdFx0SlNPTi5zdHJpbmdpZnkob0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXVtcIm91dGJvdW5kXCJdKSArXG5cdFx0XHRcdFwiKVwiXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAob0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRTZWN0aW9uc1wiXSkge1xuXHRcdFx0cmV0dXJuIFwiLmhhbmRsZXJzLm5hdmlnYXRlVG9TdWJTZWN0aW9uKCRjb250cm9sbGVyLCAnXCIgKyBKU09OLnN0cmluZ2lmeShvQ29uZmlndXJhdGlvbltcInRhcmdldFNlY3Rpb25zXCJdKSArIFwiJylcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRIZWFkZXJGb3JtSGJveFJlbmRlclR5cGUgPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKGRhdGFGaWVsZD8udGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIFwiQmFyZVwiO1xufTtcblxuLyoqXG4gKiBUaGUgZGVmYXVsdCBhY3Rpb24gZ3JvdXAgaGFuZGxlciB0aGF0IGlzIGludm9rZWQgd2hlbiBhZGRpbmcgdGhlIG1lbnUgYnV0dG9uIGhhbmRsaW5nIGFwcHJvcHJpYXRlbHkuXG4gKlxuICogQHBhcmFtIG9DdHggVGhlIGN1cnJlbnQgY29udGV4dCBpbiB3aGljaCB0aGUgaGFuZGxlciBpcyBjYWxsZWRcbiAqIEBwYXJhbSBvQWN0aW9uIFRoZSBjdXJyZW50IGFjdGlvbiBjb250ZXh0XG4gKiBAcGFyYW0gb0RhdGFGaWVsZEZvckRlZmF1bHRBY3Rpb24gVGhlIGN1cnJlbnQgZGF0YUZpZWxkIGZvciB0aGUgZGVmYXVsdCBhY3Rpb25cbiAqIEBwYXJhbSBkZWZhdWx0QWN0aW9uQ29udGV4dE9yRW50aXR5U2V0IFRoZSBjdXJyZW50IGNvbnRleHQgZm9yIHRoZSBkZWZhdWx0IGFjdGlvblxuICogQHJldHVybnMgVGhlIGFwcHJvcHJpYXRlIGV4cHJlc3Npb24gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0QWN0aW9uSGFuZGxlcihvQ3R4OiBhbnksIG9BY3Rpb246IGFueSwgb0RhdGFGaWVsZEZvckRlZmF1bHRBY3Rpb246IGFueSwgZGVmYXVsdEFjdGlvbkNvbnRleHRPckVudGl0eVNldDogYW55KSB7XG5cdGlmIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24pIHtcblx0XHR0cnkge1xuXHRcdFx0c3dpdGNoIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24udHlwZSkge1xuXHRcdFx0XHRjYXNlIFwiRm9yQWN0aW9uXCI6IHtcblx0XHRcdFx0XHRyZXR1cm4gZ2V0UHJlc3NFeHByZXNzaW9uRm9yRWRpdChvRGF0YUZpZWxkRm9yRGVmYXVsdEFjdGlvbiwgZGVmYXVsdEFjdGlvbkNvbnRleHRPckVudGl0eVNldCwgb0FjdGlvbi5kZWZhdWx0QWN0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIFwiRm9yTmF2aWdhdGlvblwiOiB7XG5cdFx0XHRcdFx0aWYgKG9BY3Rpb24uZGVmYXVsdEFjdGlvbi5jb21tYW5kKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJjbWQ6XCIgKyBvQWN0aW9uLmRlZmF1bHRBY3Rpb24uY29tbWFuZDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9BY3Rpb24uZGVmYXVsdEFjdGlvbi5wcmVzcztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRcdGlmIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24uY29tbWFuZCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwiY21kOlwiICsgb0FjdGlvbi5kZWZhdWx0QWN0aW9uLmNvbW1hbmQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChvQWN0aW9uLmRlZmF1bHRBY3Rpb24ubm9XcmFwKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5kZWZhdWx0QWN0aW9uLnByZXNzO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmJ1aWxkQWN0aW9uV3JhcHBlcihvQWN0aW9uLmRlZmF1bHRBY3Rpb24sIHsgaWQ6IFwiZm9yVGhlT2JqZWN0UGFnZVwiIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGlvRXgpIHtcblx0XHRcdHJldHVybiBcImJpbmRpbmcgZm9yIHRoZSBkZWZhdWx0IGFjdGlvbiBpcyBub3Qgd29ya2luZyBhcyBleHBlY3RlZFwiO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFrQ0EsTUFBTUEsVUFBVSxHQUFHQyxRQUFRLENBQUNELFVBQVU7RUFPdEM7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU1FLHFCQUFxQixHQUFHLFVBQ3BDQyxXQUF1QyxFQUN2Q0MsU0FBbUIsRUFDbkJDLGVBQW9DLEVBQ3BDQyxVQUE4QixFQUNLO0lBQUE7SUFDbkMsTUFBTUMsaUJBQWlC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