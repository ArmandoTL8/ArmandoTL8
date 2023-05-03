/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/ID", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/formatters/FPMFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper"], function (Log, BindingHelper, ConfigurableObject, ID, ManifestSettings, fpmFormatter, BindingToolkit, StableIdHelper) {
  "use strict";

  var _exports = {};
  var replaceSpecialChars = StableIdHelper.replaceSpecialChars;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var greaterOrEqual = BindingToolkit.greaterOrEqual;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var ActionType = ManifestSettings.ActionType;
  var getCustomActionID = ID.getCustomActionID;
  var Placement = ConfigurableObject.Placement;
  var bindingContextPathVisitor = BindingHelper.bindingContextPathVisitor;
  let ButtonType;
  (function (ButtonType) {
    ButtonType["Accept"] = "Accept";
    ButtonType["Attention"] = "Attention";
    ButtonType["Back"] = "Back";
    ButtonType["Critical"] = "Critical";
    ButtonType["Default"] = "Default";
    ButtonType["Emphasized"] = "Emphasized";
    ButtonType["Ghost"] = "Ghost";
    ButtonType["Negative"] = "Negative";
    ButtonType["Neutral"] = "Neutral";
    ButtonType["Reject"] = "Reject";
    ButtonType["Success"] = "Success";
    ButtonType["Transparent"] = "Transparent";
    ButtonType["Unstyled"] = "Unstyled";
    ButtonType["Up"] = "Up";
  })(ButtonType || (ButtonType = {}));
  _exports.ButtonType = ButtonType;
  /**
   * Maps an action by its key, based on the given annotation actions and manifest configuration. The result already represents the
   * merged action from both configuration sources.
   *
   * This function also returns an indication whether the action can be a menu item, saying whether it is visible or of a specific type
   * that allows this.
   *
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   * @param actionKey Key to look up
   * @returns Merged action and indicator whether it can be a menu item
   */
  function mapActionByKey(manifestActions, annotationActions, hiddenActions, actionKey) {
    const annotationAction = annotationActions.find(action => action.key === actionKey);
    const manifestAction = manifestActions[actionKey];
    const resultAction = {
      ...(annotationAction ?? manifestAction)
    };

    // Annotation action and manifest configuration already has to be merged here as insertCustomElements only considers top-level actions
    if (annotationAction) {
      // If enabled or visible is not set in the manifest, use the annotation value and hence do not overwrite
      resultAction.enabled = (manifestAction === null || manifestAction === void 0 ? void 0 : manifestAction.enabled) ?? annotationAction.enabled;
      resultAction.visible = (manifestAction === null || manifestAction === void 0 ? void 0 : manifestAction.visible) ?? annotationAction.visible;
      for (const prop in manifestAction || {}) {
        if (!annotationAction[prop] && prop !== "menu") {
          resultAction[prop] = manifestAction[prop];
        }
      }
    }
    const canBeMenuItem = ((resultAction === null || resultAction === void 0 ? void 0 : resultAction.visible) || (resultAction === null || resultAction === void 0 ? void 0 : resultAction.type) === ActionType.DataFieldForAction || (resultAction === null || resultAction === void 0 ? void 0 : resultAction.type) === ActionType.DataFieldForIntentBasedNavigation) && !hiddenActions.find(hiddenAction => hiddenAction.key === (resultAction === null || resultAction === void 0 ? void 0 : resultAction.key));
    return {
      action: resultAction,
      canBeMenuItem
    };
  }

  /**
   * Map the default action key of a menu to its actual action configuration and identify whether this default action is a command.
   *
   * @param menuAction Menu action to map the default action for
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param commandActions Array of command actions to push the default action to if applicable
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   */
  function mapMenuDefaultAction(menuAction, manifestActions, annotationActions, commandActions, hiddenActions) {
    const {
      action,
      canBeMenuItem
    } = mapActionByKey(manifestActions, annotationActions, hiddenActions, menuAction.defaultAction);
    if (canBeMenuItem) {
      menuAction.defaultAction = action;
    }
    if (action.command) {
      commandActions[action.key] = action;
    }
  }

  /**
   * Map the menu item keys of a menu to their actual action configurations and identify whether they are commands.
   *
   * @param menuAction Menu action to map the menu items for
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param commandActions Array of command actions to push the menu item actions to if applicable
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   */
  function mapMenuItems(menuAction, manifestActions, annotationActions, commandActions, hiddenActions) {
    const mappedMenuItems = [];
    for (const menuItemKey of menuAction.menu ?? []) {
      const {
        action,
        canBeMenuItem
      } = mapActionByKey(manifestActions, annotationActions, hiddenActions, menuItemKey);
      if (canBeMenuItem) {
        mappedMenuItems.push(action);
      }
      if (action.command) {
        commandActions[menuItemKey] = action;
      }
    }
    menuAction.menu = mappedMenuItems;

    // If the menu is set to invisible, it should be invisible, otherwise the visibility should be calculated from the items
    const visibleExpressions = mappedMenuItems.map(menuItem => resolveBindingString(menuItem.visible, "boolean"));
    menuAction.visible = compileExpression(and(resolveBindingString(menuAction.visible, "boolean"), or(...visibleExpressions)));
  }

  /**
   * Transforms the flat collection of actions into a nested structures of menus. The result is a record of actions that are either menus or
   * ones that do not appear in menus as menu items. It also returns a list of actions that have an assigned command.
   *
   * Note that menu items are already the merged result of annotation actions and their manifest configuration, as {@link insertCustomElements}
   * only considers root-level actions.
   *
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   * @returns The transformed actions from the manifest and a list of command actions
   */
  function transformMenuActionsAndIdentifyCommands(manifestActions, annotationActions, hiddenActions) {
    const allActions = {};
    const actionKeysToDelete = [];
    const commandActions = {};
    for (const actionKey in manifestActions) {
      const manifestAction = manifestActions[actionKey];
      if (manifestAction.defaultAction !== undefined) {
        mapMenuDefaultAction(manifestAction, manifestActions, annotationActions, commandActions, hiddenActions);
      }
      if (manifestAction.type === ActionType.Menu) {
        var _manifestAction$menu;
        // Menu items should not appear as top-level actions themselves
        actionKeysToDelete.push(...manifestAction.menu);
        mapMenuItems(manifestAction, manifestActions, annotationActions, commandActions, hiddenActions);

        // Menu has no visible items, so remove it
        if (!((_manifestAction$menu = manifestAction.menu) !== null && _manifestAction$menu !== void 0 && _manifestAction$menu.length)) {
          actionKeysToDelete.push(manifestAction.key);
        }
      }
      if (manifestAction.command) {
        commandActions[actionKey] = manifestAction;
      }
      allActions[actionKey] = manifestAction;
    }
    actionKeysToDelete.forEach(actionKey => delete allActions[actionKey]);
    return {
      actions: allActions,
      commandActions: commandActions
    };
  }

  /**
   * Gets the binding expression for the enablement of a manifest action.
   *
   * @param manifestAction The action configured in the manifest
   * @param isAnnotationAction Whether the action, defined in manifest, corresponds to an existing annotation action.
   * @param converterContext
   * @returns Determined property value for the enablement
   */
  const _getManifestEnabled = function (manifestAction, isAnnotationAction, converterContext) {
    if (isAnnotationAction && manifestAction.enabled === undefined) {
      // If annotation action has no property defined in manifest,
      // do not overwrite it with manifest action's default value.
      return undefined;
    }
    const result = getManifestActionBooleanPropertyWithFormatter(manifestAction.enabled, converterContext);

    // Consider requiresSelection property to include selectedContexts in the binding expression
    return compileExpression(ifElse(manifestAction.requiresSelection === true, and(greaterOrEqual(pathInModel("numberOfSelectedContexts", "internal"), 1), result), result));
  };

  /**
   * Gets the binding expression for the visibility of a manifest action.
   *
   * @param manifestAction The action configured in the manifest
   * @param isAnnotationAction Whether the action, defined in manifest, corresponds to an existing annotation action.
   * @param converterContext
   * @returns Determined property value for the visibility
   */
  const _getManifestVisible = function (manifestAction, isAnnotationAction, converterContext) {
    if (isAnnotationAction && manifestAction.visible === undefined) {
      // If annotation action has no property defined in manifest,
      // do not overwrite it with manifest action's default value.
      return undefined;
    }
    const result = getManifestActionBooleanPropertyWithFormatter(manifestAction.visible, converterContext);
    return compileExpression(result);
  };

  /**
   * As some properties should not be overridable by the manifest, make sure that the manifest configuration gets the annotation values for these.
   *
   * @param manifestAction Action defined in the manifest
   * @param annotationAction Action defined through annotations
   */
  function overrideManifestConfigurationWithAnnotation(manifestAction, annotationAction) {
    if (!annotationAction) {
      return;
    }

    // Do not override the 'type' given in an annotation action
    manifestAction.type = annotationAction.type;
    manifestAction.annotationPath = annotationAction.annotationPath;
    manifestAction.press = annotationAction.press;

    // Only use the annotation values for enablement and visibility if not set in the manifest
    manifestAction.enabled = manifestAction.enabled ?? annotationAction.enabled;
    manifestAction.visible = manifestAction.visible ?? annotationAction.visible;
  }

  /**
   * Hide an action if it is a hidden header action.
   *
   * @param action The action to hide
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   */
  function hideActionIfHiddenAction(action, hiddenActions) {
    if (hiddenActions !== null && hiddenActions !== void 0 && hiddenActions.find(hiddenAction => hiddenAction.key === action.key)) {
      action.visible = "false";
    }
  }

  /**
   * Creates the action configuration based on the manifest settings.
   *
   * @param manifestActions The manifest actions
   * @param converterContext The converter context
   * @param annotationActions The annotation actions definition
   * @param navigationSettings The navigation settings
   * @param considerNavigationSettings The navigation settings to be considered
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   * @param facetName The facet where an action is displayed if it is inline
   * @returns The actions from the manifest
   */
  function getActionsFromManifest(manifestActions, converterContext, annotationActions, navigationSettings, considerNavigationSettings, hiddenActions, facetName) {
    const actions = {};
    for (const actionKey in manifestActions) {
      var _manifestAction$press, _manifestAction$posit;
      const manifestAction = manifestActions[actionKey];
      const lastDotIndex = ((_manifestAction$press = manifestAction.press) === null || _manifestAction$press === void 0 ? void 0 : _manifestAction$press.lastIndexOf(".")) || -1;
      const oAnnotationAction = annotationActions === null || annotationActions === void 0 ? void 0 : annotationActions.find(obj => obj.key === actionKey);

      // To identify the annotation action property overwrite via manifest use-case.
      const isAnnotationAction = !!oAnnotationAction;
      if (manifestAction.facetName) {
        facetName = manifestAction.facetName;
      }
      actions[actionKey] = {
        id: oAnnotationAction ? actionKey : getCustomActionID(actionKey),
        type: manifestAction.menu ? ActionType.Menu : ActionType.Default,
        visible: _getManifestVisible(manifestAction, isAnnotationAction, converterContext),
        enabled: _getManifestEnabled(manifestAction, isAnnotationAction, converterContext),
        handlerModule: manifestAction.press && manifestAction.press.substring(0, lastDotIndex).replace(/\./gi, "/"),
        handlerMethod: manifestAction.press && manifestAction.press.substring(lastDotIndex + 1),
        press: manifestAction.press,
        text: manifestAction.text,
        noWrap: manifestAction.__noWrap,
        key: replaceSpecialChars(actionKey),
        enableOnSelect: manifestAction.enableOnSelect,
        defaultValuesExtensionFunction: manifestAction.defaultValuesFunction,
        position: {
          anchor: (_manifestAction$posit = manifestAction.position) === null || _manifestAction$posit === void 0 ? void 0 : _manifestAction$posit.anchor,
          placement: manifestAction.position === undefined ? Placement.After : manifestAction.position.placement
        },
        isNavigable: isActionNavigable(manifestAction, navigationSettings, considerNavigationSettings),
        command: manifestAction.command,
        requiresSelection: manifestAction.requiresSelection === undefined ? false : manifestAction.requiresSelection,
        enableAutoScroll: enableAutoScroll(manifestAction),
        menu: manifestAction.menu ?? [],
        facetName: manifestAction.inline ? facetName : undefined,
        defaultAction: manifestAction.defaultAction
      };
      overrideManifestConfigurationWithAnnotation(actions[actionKey], oAnnotationAction);
      hideActionIfHiddenAction(actions[actionKey], hiddenActions);
    }
    return transformMenuActionsAndIdentifyCommands(actions, annotationActions ?? [], hiddenActions ?? []);
  }

  /**
   * Gets a binding expression representing a Boolean manifest property that can either be represented by a static value, a binding string,
   * or a runtime formatter function.
   *
   * @param propertyValue String representing the configured property value
   * @param converterContext
   * @returns A binding expression representing the property
   */
  _exports.getActionsFromManifest = getActionsFromManifest;
  function getManifestActionBooleanPropertyWithFormatter(propertyValue, converterContext) {
    const resolvedBinding = resolveBindingString(propertyValue, "boolean");
    let result;
    if (isConstant(resolvedBinding) && resolvedBinding.value === undefined) {
      // No property value configured in manifest for the custom action --> default value is true
      result = true;
    } else if (isConstant(resolvedBinding) && typeof resolvedBinding.value === "boolean") {
      // true / false
      result = resolvedBinding.value;
    } else if (isConstant(resolvedBinding) && typeof resolvedBinding.value === "string") {
      var _converterContext$get;
      // Then it's a module-method reference "sap.xxx.yyy.doSomething"
      const methodPath = resolvedBinding.value;
      // FIXME: The custom "isEnabled" check does not trigger (because none of the bound values changes)
      result = formatResult([pathInModel("/", "$view"), methodPath, pathInModel("selectedContexts", "internal")], fpmFormatter.customBooleanPropertyCheck, ((_converterContext$get = converterContext.getDataModelObjectPath().contextLocation) === null || _converterContext$get === void 0 ? void 0 : _converterContext$get.targetEntityType) || converterContext.getEntityType());
    } else {
      // then it's a binding
      result = resolvedBinding;
    }
    return result;
  }
  const removeDuplicateActions = actions => {
    let oMenuItemKeys = {};
    actions.forEach(action => {
      var _action$menu;
      if (action !== null && action !== void 0 && (_action$menu = action.menu) !== null && _action$menu !== void 0 && _action$menu.length) {
        oMenuItemKeys = action.menu.reduce((item, _ref) => {
          let {
            key
          } = _ref;
          if (key && !item[key]) {
            item[key] = true;
          }
          return item;
        }, oMenuItemKeys);
      }
    });
    return actions.filter(action => !oMenuItemKeys[action.key]);
  };

  /**
   * Method to determine the value of the 'enabled' property of an annotation-based action.
   *
   * @param converterContext The instance of the converter context
   * @param actionTarget The instance of the action
   * @returns The binding expression for the 'enabled' property of the action button.
   */
  _exports.removeDuplicateActions = removeDuplicateActions;
  function getEnabledForAnnotationAction(converterContext, actionTarget) {
    var _actionTarget$paramet;
    if ((actionTarget === null || actionTarget === void 0 ? void 0 : actionTarget.isBound) !== true) {
      return "true";
    }
    if (actionTarget !== null && actionTarget !== void 0 && (_actionTarget$paramet = actionTarget.parameters) !== null && _actionTarget$paramet !== void 0 && _actionTarget$paramet.length) {
      var _actionTarget$annotat, _actionTarget$annotat2;
      const bindingParameterFullName = actionTarget === null || actionTarget === void 0 ? void 0 : actionTarget.parameters[0].fullyQualifiedName,
        operationAvailableExpression = getExpressionFromAnnotation(actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat = actionTarget.annotations.Core) === null || _actionTarget$annotat === void 0 ? void 0 : _actionTarget$annotat.OperationAvailable, [], undefined, path => bindingContextPathVisitor(path, converterContext, bindingParameterFullName));
      if ((actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat2 = actionTarget.annotations.Core) === null || _actionTarget$annotat2 === void 0 ? void 0 : _actionTarget$annotat2.OperationAvailable) !== undefined) {
        return compileExpression(equal(operationAvailableExpression, true));
      }
    }
    return "true";
  }
  _exports.getEnabledForAnnotationAction = getEnabledForAnnotationAction;
  function getSemanticObjectMapping(mappings) {
    return mappings ? mappings.map(mapping => {
      return {
        LocalProperty: {
          $PropertyPath: mapping.LocalProperty.value
        },
        SemanticObjectProperty: mapping.SemanticObjectProperty
      };
    }) : [];
  }
  _exports.getSemanticObjectMapping = getSemanticObjectMapping;
  function isActionNavigable(action, navigationSettings, considerNavigationSettings) {
    var _action$afterExecutio, _action$afterExecutio2;
    let bIsNavigationConfigured = true;
    if (considerNavigationSettings) {
      const detailOrDisplay = navigationSettings && (navigationSettings.detail || navigationSettings.display);
      bIsNavigationConfigured = detailOrDisplay !== null && detailOrDisplay !== void 0 && detailOrDisplay.route ? true : false;
    }
    // when enableAutoScroll is true the navigateToInstance feature is disabled
    if (action && action.afterExecution && (((_action$afterExecutio = action.afterExecution) === null || _action$afterExecutio === void 0 ? void 0 : _action$afterExecutio.navigateToInstance) === false || ((_action$afterExecutio2 = action.afterExecution) === null || _action$afterExecutio2 === void 0 ? void 0 : _action$afterExecutio2.enableAutoScroll) === true) || !bIsNavigationConfigured) {
      return false;
    }
    return true;
  }
  _exports.isActionNavigable = isActionNavigable;
  function enableAutoScroll(action) {
    var _action$afterExecutio3;
    return (action === null || action === void 0 ? void 0 : (_action$afterExecutio3 = action.afterExecution) === null || _action$afterExecutio3 === void 0 ? void 0 : _action$afterExecutio3.enableAutoScroll) === true;
  }
  _exports.enableAutoScroll = enableAutoScroll;
  function dataFieldIsCopyAction(dataField) {
    var _dataField$annotation, _dataField$annotation2, _dataField$annotation3;
    return ((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.IsCopyAction) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === true && dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction";
  }
  _exports.dataFieldIsCopyAction = dataFieldIsCopyAction;
  function getCopyAction(copyDataFields) {
    if (copyDataFields.length === 1) {
      return copyDataFields[0];
    }
    if (copyDataFields.length > 1) {
      Log.error("Multiple actions are annotated with isCopyAction. There can be only one standard copy action.");
    }
    return undefined;
  }
  _exports.getCopyAction = getCopyAction;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibWFwQWN0aW9uQnlLZXkiLCJtYW5pZmVzdEFjdGlvbnMiLCJhbm5vdGF0aW9uQWN0aW9ucyIsImhpZGRlbkFjdGlvbnMiLCJhY3Rpb25LZXkiLCJhbm5vdGF0aW9uQWN0aW9uIiwiZmluZCIsImFjdGlvbiIsImtleSIsIm1hbmlmZXN0QWN0aW9uIiwicmVzdWx0QWN0aW9uIiwiZW5hYmxlZCIsInZpc2libGUiLCJwcm9wIiwiY2FuQmVNZW51SXRlbSIsInR5cGUiLCJBY3Rpb25UeXBlIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiaGlkZGVuQWN0aW9uIiwibWFwTWVudURlZmF1bHRBY3Rpb24iLCJtZW51QWN0aW9uIiwiY29tbWFuZEFjdGlvbnMiLCJkZWZhdWx0QWN0aW9uIiwiY29tbWFuZCIsIm1hcE1lbnVJdGVtcyIsIm1hcHBlZE1lbnVJdGVtcyIsIm1lbnVJdGVtS2V5IiwibWVudSIsInB1c2giLCJ2aXNpYmxlRXhwcmVzc2lvbnMiLCJtYXAiLCJtZW51SXRlbSIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiY29tcGlsZUV4cHJlc3Npb24iLCJhbmQiLCJvciIsInRyYW5zZm9ybU1lbnVBY3Rpb25zQW5kSWRlbnRpZnlDb21tYW5kcyIsImFsbEFjdGlvbnMiLCJhY3Rpb25LZXlzVG9EZWxldGUiLCJ1bmRlZmluZWQiLCJNZW51IiwibGVuZ3RoIiwiZm9yRWFjaCIsImFjdGlvbnMiLCJfZ2V0TWFuaWZlc3RFbmFibGVkIiwiaXNBbm5vdGF0aW9uQWN0aW9uIiwiY29udmVydGVyQ29udGV4dCIsInJlc3VsdCIsImdldE1hbmlmZXN0QWN0aW9uQm9vbGVhblByb3BlcnR5V2l0aEZvcm1hdHRlciIsImlmRWxzZSIsInJlcXVpcmVzU2VsZWN0aW9uIiwiZ3JlYXRlck9yRXF1YWwiLCJwYXRoSW5Nb2RlbCIsIl9nZXRNYW5pZmVzdFZpc2libGUiLCJvdmVycmlkZU1hbmlmZXN0Q29uZmlndXJhdGlvbldpdGhBbm5vdGF0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJwcmVzcyIsImhpZGVBY3Rpb25JZkhpZGRlbkFjdGlvbiIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJuYXZpZ2F0aW9uU2V0dGluZ3MiLCJjb25zaWRlck5hdmlnYXRpb25TZXR0aW5ncyIsImZhY2V0TmFtZSIsImxhc3REb3RJbmRleCIsImxhc3RJbmRleE9mIiwib0Fubm90YXRpb25BY3Rpb24iLCJvYmoiLCJpZCIsImdldEN1c3RvbUFjdGlvbklEIiwiRGVmYXVsdCIsImhhbmRsZXJNb2R1bGUiLCJzdWJzdHJpbmciLCJyZXBsYWNlIiwiaGFuZGxlck1ldGhvZCIsInRleHQiLCJub1dyYXAiLCJfX25vV3JhcCIsInJlcGxhY2VTcGVjaWFsQ2hhcnMiLCJlbmFibGVPblNlbGVjdCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsImRlZmF1bHRWYWx1ZXNGdW5jdGlvbiIsInBvc2l0aW9uIiwiYW5jaG9yIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJpc05hdmlnYWJsZSIsImlzQWN0aW9uTmF2aWdhYmxlIiwiZW5hYmxlQXV0b1Njcm9sbCIsImlubGluZSIsInByb3BlcnR5VmFsdWUiLCJyZXNvbHZlZEJpbmRpbmciLCJpc0NvbnN0YW50IiwidmFsdWUiLCJtZXRob2RQYXRoIiwiZm9ybWF0UmVzdWx0IiwiZnBtRm9ybWF0dGVyIiwiY3VzdG9tQm9vbGVhblByb3BlcnR5Q2hlY2siLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwiY29udGV4dExvY2F0aW9uIiwidGFyZ2V0RW50aXR5VHlwZSIsImdldEVudGl0eVR5cGUiLCJyZW1vdmVEdXBsaWNhdGVBY3Rpb25zIiwib01lbnVJdGVtS2V5cyIsInJlZHVjZSIsIml0ZW0iLCJmaWx0ZXIiLCJnZXRFbmFibGVkRm9yQW5ub3RhdGlvbkFjdGlvbiIsImFjdGlvblRhcmdldCIsImlzQm91bmQiLCJwYXJhbWV0ZXJzIiwiYmluZGluZ1BhcmFtZXRlckZ1bGxOYW1lIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwib3BlcmF0aW9uQXZhaWxhYmxlRXhwcmVzc2lvbiIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiQ29yZSIsIk9wZXJhdGlvbkF2YWlsYWJsZSIsInBhdGgiLCJiaW5kaW5nQ29udGV4dFBhdGhWaXNpdG9yIiwiZXF1YWwiLCJnZXRTZW1hbnRpY09iamVjdE1hcHBpbmciLCJtYXBwaW5ncyIsIm1hcHBpbmciLCJMb2NhbFByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIlNlbWFudGljT2JqZWN0UHJvcGVydHkiLCJiSXNOYXZpZ2F0aW9uQ29uZmlndXJlZCIsImRldGFpbE9yRGlzcGxheSIsImRldGFpbCIsImRpc3BsYXkiLCJyb3V0ZSIsImFmdGVyRXhlY3V0aW9uIiwibmF2aWdhdGVUb0luc3RhbmNlIiwiZGF0YUZpZWxkSXNDb3B5QWN0aW9uIiwiZGF0YUZpZWxkIiwiVUkiLCJJc0NvcHlBY3Rpb24iLCJ2YWx1ZU9mIiwiJFR5cGUiLCJnZXRDb3B5QWN0aW9uIiwiY29weURhdGFGaWVsZHMiLCJMb2ciLCJlcnJvciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQWN0aW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IFNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHsgRGF0YUZpZWxkRm9yQWN0aW9uVHlwZXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBiaW5kaW5nQ29udGV4dFBhdGhWaXNpdG9yIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZU9iamVjdCwgQ3VzdG9tRWxlbWVudCwgT3ZlcnJpZGVUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IFBsYWNlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBnZXRDdXN0b21BY3Rpb25JRCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSURcIjtcbmltcG9ydCB0eXBlIHtcblx0Q3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUsXG5cdE1hbmlmZXN0QWN0aW9uLFxuXHROYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgZnBtRm9ybWF0dGVyIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL0ZQTUZvcm1hdHRlclwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7XG5cdGFuZCxcblx0Y29tcGlsZUV4cHJlc3Npb24sXG5cdGVxdWFsLFxuXHRmb3JtYXRSZXN1bHQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0Z3JlYXRlck9yRXF1YWwsXG5cdGlmRWxzZSxcblx0aXNDb25zdGFudCxcblx0b3IsXG5cdHBhdGhJbk1vZGVsLFxuXHRyZXNvbHZlQmluZGluZ1N0cmluZ1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgcmVwbGFjZVNwZWNpYWxDaGFycyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IE1ldGFNb2RlbFR5cGUgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCIuLi8uLi9Db252ZXJ0ZXJDb250ZXh0XCI7XG5cbmV4cG9ydCBlbnVtIEJ1dHRvblR5cGUge1xuXHRBY2NlcHQgPSBcIkFjY2VwdFwiLFxuXHRBdHRlbnRpb24gPSBcIkF0dGVudGlvblwiLFxuXHRCYWNrID0gXCJCYWNrXCIsXG5cdENyaXRpY2FsID0gXCJDcml0aWNhbFwiLFxuXHREZWZhdWx0ID0gXCJEZWZhdWx0XCIsXG5cdEVtcGhhc2l6ZWQgPSBcIkVtcGhhc2l6ZWRcIixcblx0R2hvc3QgPSBcIkdob3N0XCIsXG5cdE5lZ2F0aXZlID0gXCJOZWdhdGl2ZVwiLFxuXHROZXV0cmFsID0gXCJOZXV0cmFsXCIsXG5cdFJlamVjdCA9IFwiUmVqZWN0XCIsXG5cdFN1Y2Nlc3MgPSBcIlN1Y2Nlc3NcIixcblx0VHJhbnNwYXJlbnQgPSBcIlRyYW5zcGFyZW50XCIsXG5cdFVuc3R5bGVkID0gXCJVbnN0eWxlZFwiLFxuXHRVcCA9IFwiVXBcIlxufVxuXG5leHBvcnQgdHlwZSBCYXNlQWN0aW9uID0gQ29uZmlndXJhYmxlT2JqZWN0ICYge1xuXHRpZD86IHN0cmluZztcblx0dGV4dD86IHN0cmluZztcblx0dHlwZT86IEFjdGlvblR5cGU7XG5cdHByZXNzPzogc3RyaW5nO1xuXHRlbmFibGVkPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdHZpc2libGU/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0ZW5hYmxlT25TZWxlY3Q/OiBzdHJpbmc7XG5cdGFubm90YXRpb25QYXRoPzogc3RyaW5nO1xuXHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24/OiBzdHJpbmc7XG5cdGlzTmF2aWdhYmxlPzogYm9vbGVhbjtcblx0ZW5hYmxlQXV0b1Njcm9sbD86IGJvb2xlYW47XG5cdHJlcXVpcmVzRGlhbG9nPzogc3RyaW5nO1xuXHRiaW5kaW5nPzogc3RyaW5nO1xuXHRidXR0b25UeXBlPzogQnV0dG9uVHlwZS5HaG9zdCB8IEJ1dHRvblR5cGUuVHJhbnNwYXJlbnQgfCBzdHJpbmc7XG5cdHBhcmVudEVudGl0eURlbGV0ZUVuYWJsZWQ/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0bWVudT86IChzdHJpbmcgfCBDdXN0b21BY3Rpb24gfCBCYXNlQWN0aW9uKVtdO1xuXHRmYWNldE5hbWU/OiBzdHJpbmc7XG5cdGNvbW1hbmQ/OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBBbm5vdGF0aW9uQWN0aW9uID0gQmFzZUFjdGlvbiAmIHtcblx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gfCBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbjtcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0aWQ/OiBzdHJpbmc7XG5cdGN1c3RvbURhdGE/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIERlZmluaXRpb24gZm9yIGN1c3RvbSBhY3Rpb25zXG4gKlxuICogQHR5cGVkZWYgQ3VzdG9tQWN0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIEN1c3RvbUFjdGlvbiA9IEN1c3RvbUVsZW1lbnQ8XG5cdEJhc2VBY3Rpb24gJiB7XG5cdFx0dHlwZT86IEFjdGlvblR5cGU7XG5cdFx0aGFuZGxlck1ldGhvZD86IHN0cmluZztcblx0XHRoYW5kbGVyTW9kdWxlPzogc3RyaW5nO1xuXHRcdG1lbnU/OiAoc3RyaW5nIHwgQ3VzdG9tQWN0aW9uIHwgQmFzZUFjdGlvbilbXTtcblx0XHRub1dyYXA/OiBib29sZWFuOyAvLyBJbmRpY2F0ZXMgdGhhdCB3ZSB3YW50IHRvIGF2b2lkIHRoZSB3cmFwcGluZyBmcm9tIHRoZSBGUE1IZWxwZXJcblx0XHRyZXF1aXJlc1NlbGVjdGlvbj86IGJvb2xlYW47XG5cdFx0ZGVmYXVsdEFjdGlvbj86IHN0cmluZyB8IEN1c3RvbUFjdGlvbiB8IEJhc2VBY3Rpb247IC8vSW5kaWNhdGVzIHdoZXRoZXIgYSBkZWZhdWx0IGFjdGlvbiBleGlzdHMgaW4gdGhpcyBjb250ZXh0XG5cdH1cbj47XG5cbi8vIFJldXNlIG9mIENvbmZpZ3VyYWJsZU9iamVjdCBhbmQgQ3VzdG9tRWxlbWVudCBpcyBkb25lIGZvciBvcmRlcmluZ1xuZXhwb3J0IHR5cGUgQ29udmVydGVyQWN0aW9uID0gQW5ub3RhdGlvbkFjdGlvbiB8IEN1c3RvbUFjdGlvbjtcblxuZXhwb3J0IHR5cGUgQ29tYmluZWRBY3Rpb24gPSB7XG5cdGFjdGlvbnM6IEJhc2VBY3Rpb25bXTtcblx0Y29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG59O1xuXG5leHBvcnQgdHlwZSBPdmVycmlkZVR5cGVBY3Rpb24gPSB7XG5cdGVuYWJsZUF1dG9TY3JvbGw/OiBPdmVycmlkZVR5cGUub3ZlcndyaXRlO1xuXHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24/OiBPdmVycmlkZVR5cGUub3ZlcndyaXRlO1xuXHRpc05hdmlnYWJsZT86IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGU7XG5cdGVuYWJsZU9uU2VsZWN0PzogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZTtcblxuXHQvLyBDYW4gYmUgb3ZlcndyaXR0ZW4gYnkgbWFuaWZlc3QgY29uZmlndXJhdGlvbiBhbmQgc2hvdWxkIGJlIGFsaWduZWQgZm9yIGFsbCBhY3Rpb25zXG5cdGVuYWJsZWQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGU7XG5cdHZpc2libGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGU7XG5cdGNvbW1hbmQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGU7XG59O1xuXG4vKipcbiAqIE1hcHMgYW4gYWN0aW9uIGJ5IGl0cyBrZXksIGJhc2VkIG9uIHRoZSBnaXZlbiBhbm5vdGF0aW9uIGFjdGlvbnMgYW5kIG1hbmlmZXN0IGNvbmZpZ3VyYXRpb24uIFRoZSByZXN1bHQgYWxyZWFkeSByZXByZXNlbnRzIHRoZVxuICogbWVyZ2VkIGFjdGlvbiBmcm9tIGJvdGggY29uZmlndXJhdGlvbiBzb3VyY2VzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gYWxzbyByZXR1cm5zIGFuIGluZGljYXRpb24gd2hldGhlciB0aGUgYWN0aW9uIGNhbiBiZSBhIG1lbnUgaXRlbSwgc2F5aW5nIHdoZXRoZXIgaXQgaXMgdmlzaWJsZSBvciBvZiBhIHNwZWNpZmljIHR5cGVcbiAqIHRoYXQgYWxsb3dzIHRoaXMuXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBBY3Rpb25zIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcGFyYW0gYW5ub3RhdGlvbkFjdGlvbnMgQWN0aW9ucyBkZWZpbmVkIHRocm91Z2ggYW5ub3RhdGlvbnNcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKiBAcGFyYW0gYWN0aW9uS2V5IEtleSB0byBsb29rIHVwXG4gKiBAcmV0dXJucyBNZXJnZWQgYWN0aW9uIGFuZCBpbmRpY2F0b3Igd2hldGhlciBpdCBjYW4gYmUgYSBtZW51IGl0ZW1cbiAqL1xuZnVuY3Rpb24gbWFwQWN0aW9uQnlLZXkoXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPixcblx0YW5ub3RhdGlvbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSxcblx0aGlkZGVuQWN0aW9uczogQmFzZUFjdGlvbltdLFxuXHRhY3Rpb25LZXk6IHN0cmluZ1xuKSB7XG5cdGNvbnN0IGFubm90YXRpb25BY3Rpb246IEJhc2VBY3Rpb24gfCBDdXN0b21BY3Rpb24gfCB1bmRlZmluZWQgPSBhbm5vdGF0aW9uQWN0aW9ucy5maW5kKFxuXHRcdChhY3Rpb246IEJhc2VBY3Rpb24pID0+IGFjdGlvbi5rZXkgPT09IGFjdGlvbktleVxuXHQpO1xuXHRjb25zdCBtYW5pZmVzdEFjdGlvbiA9IG1hbmlmZXN0QWN0aW9uc1thY3Rpb25LZXldO1xuXHRjb25zdCByZXN1bHRBY3Rpb24gPSB7IC4uLihhbm5vdGF0aW9uQWN0aW9uID8/IG1hbmlmZXN0QWN0aW9uKSB9O1xuXG5cdC8vIEFubm90YXRpb24gYWN0aW9uIGFuZCBtYW5pZmVzdCBjb25maWd1cmF0aW9uIGFscmVhZHkgaGFzIHRvIGJlIG1lcmdlZCBoZXJlIGFzIGluc2VydEN1c3RvbUVsZW1lbnRzIG9ubHkgY29uc2lkZXJzIHRvcC1sZXZlbCBhY3Rpb25zXG5cdGlmIChhbm5vdGF0aW9uQWN0aW9uKSB7XG5cdFx0Ly8gSWYgZW5hYmxlZCBvciB2aXNpYmxlIGlzIG5vdCBzZXQgaW4gdGhlIG1hbmlmZXN0LCB1c2UgdGhlIGFubm90YXRpb24gdmFsdWUgYW5kIGhlbmNlIGRvIG5vdCBvdmVyd3JpdGVcblx0XHRyZXN1bHRBY3Rpb24uZW5hYmxlZCA9IG1hbmlmZXN0QWN0aW9uPy5lbmFibGVkID8/IGFubm90YXRpb25BY3Rpb24uZW5hYmxlZDtcblx0XHRyZXN1bHRBY3Rpb24udmlzaWJsZSA9IG1hbmlmZXN0QWN0aW9uPy52aXNpYmxlID8/IGFubm90YXRpb25BY3Rpb24udmlzaWJsZTtcblxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBtYW5pZmVzdEFjdGlvbiB8fCB7fSkge1xuXHRcdFx0aWYgKCEoYW5ub3RhdGlvbkFjdGlvbiBhcyBhbnkpW3Byb3BdICYmIHByb3AgIT09IFwibWVudVwiKSB7XG5cdFx0XHRcdChyZXN1bHRBY3Rpb24gYXMgYW55KVtwcm9wXSA9IChtYW5pZmVzdEFjdGlvbiBhcyBhbnkpW3Byb3BdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGNhbkJlTWVudUl0ZW0gPVxuXHRcdChyZXN1bHRBY3Rpb24/LnZpc2libGUgfHxcblx0XHRcdHJlc3VsdEFjdGlvbj8udHlwZSA9PT0gQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHRcdHJlc3VsdEFjdGlvbj8udHlwZSA9PT0gQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pICYmXG5cdFx0IWhpZGRlbkFjdGlvbnMuZmluZCgoaGlkZGVuQWN0aW9uKSA9PiBoaWRkZW5BY3Rpb24ua2V5ID09PSByZXN1bHRBY3Rpb24/LmtleSk7XG5cblx0cmV0dXJuIHtcblx0XHRhY3Rpb246IHJlc3VsdEFjdGlvbixcblx0XHRjYW5CZU1lbnVJdGVtXG5cdH07XG59XG5cbi8qKlxuICogTWFwIHRoZSBkZWZhdWx0IGFjdGlvbiBrZXkgb2YgYSBtZW51IHRvIGl0cyBhY3R1YWwgYWN0aW9uIGNvbmZpZ3VyYXRpb24gYW5kIGlkZW50aWZ5IHdoZXRoZXIgdGhpcyBkZWZhdWx0IGFjdGlvbiBpcyBhIGNvbW1hbmQuXG4gKlxuICogQHBhcmFtIG1lbnVBY3Rpb24gTWVudSBhY3Rpb24gdG8gbWFwIHRoZSBkZWZhdWx0IGFjdGlvbiBmb3JcbiAqIEBwYXJhbSBtYW5pZmVzdEFjdGlvbnMgQWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGFubm90YXRpb25BY3Rpb25zIEFjdGlvbnMgZGVmaW5lZCB0aHJvdWdoIGFubm90YXRpb25zXG4gKiBAcGFyYW0gY29tbWFuZEFjdGlvbnMgQXJyYXkgb2YgY29tbWFuZCBhY3Rpb25zIHRvIHB1c2ggdGhlIGRlZmF1bHQgYWN0aW9uIHRvIGlmIGFwcGxpY2FibGVcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKi9cbmZ1bmN0aW9uIG1hcE1lbnVEZWZhdWx0QWN0aW9uKFxuXHRtZW51QWN0aW9uOiBDdXN0b21BY3Rpb24sXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPixcblx0YW5ub3RhdGlvbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSxcblx0Y29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4sXG5cdGhpZGRlbkFjdGlvbnM6IEJhc2VBY3Rpb25bXVxuKSB7XG5cdGNvbnN0IHsgYWN0aW9uLCBjYW5CZU1lbnVJdGVtIH0gPSBtYXBBY3Rpb25CeUtleShtYW5pZmVzdEFjdGlvbnMsIGFubm90YXRpb25BY3Rpb25zLCBoaWRkZW5BY3Rpb25zLCBtZW51QWN0aW9uLmRlZmF1bHRBY3Rpb24gYXMgc3RyaW5nKTtcblxuXHRpZiAoY2FuQmVNZW51SXRlbSkge1xuXHRcdG1lbnVBY3Rpb24uZGVmYXVsdEFjdGlvbiA9IGFjdGlvbjtcblx0fVxuXG5cdGlmIChhY3Rpb24uY29tbWFuZCkge1xuXHRcdChjb21tYW5kQWN0aW9ucyBhcyBhbnkpW2FjdGlvbi5rZXldID0gYWN0aW9uO1xuXHR9XG59XG5cbi8qKlxuICogTWFwIHRoZSBtZW51IGl0ZW0ga2V5cyBvZiBhIG1lbnUgdG8gdGhlaXIgYWN0dWFsIGFjdGlvbiBjb25maWd1cmF0aW9ucyBhbmQgaWRlbnRpZnkgd2hldGhlciB0aGV5IGFyZSBjb21tYW5kcy5cbiAqXG4gKiBAcGFyYW0gbWVudUFjdGlvbiBNZW51IGFjdGlvbiB0byBtYXAgdGhlIG1lbnUgaXRlbXMgZm9yXG4gKiBAcGFyYW0gbWFuaWZlc3RBY3Rpb25zIEFjdGlvbnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3RcbiAqIEBwYXJhbSBhbm5vdGF0aW9uQWN0aW9ucyBBY3Rpb25zIGRlZmluZWQgdGhyb3VnaCBhbm5vdGF0aW9uc1xuICogQHBhcmFtIGNvbW1hbmRBY3Rpb25zIEFycmF5IG9mIGNvbW1hbmQgYWN0aW9ucyB0byBwdXNoIHRoZSBtZW51IGl0ZW0gYWN0aW9ucyB0byBpZiBhcHBsaWNhYmxlXG4gKiBAcGFyYW0gaGlkZGVuQWN0aW9ucyBBY3Rpb25zIHRoYXQgYXJlIGNvbmZpZ3VyZWQgYXMgaGlkZGVuIChhZGRpdGlvbmFsIHRvIHRoZSB2aXNpYmxlIHByb3BlcnR5KVxuICovXG5mdW5jdGlvbiBtYXBNZW51SXRlbXMoXG5cdG1lbnVBY3Rpb246IEN1c3RvbUFjdGlvbixcblx0bWFuaWZlc3RBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+LFxuXHRhbm5vdGF0aW9uQWN0aW9uczogQmFzZUFjdGlvbltdLFxuXHRjb21tYW5kQWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPixcblx0aGlkZGVuQWN0aW9uczogQmFzZUFjdGlvbltdXG4pIHtcblx0Y29uc3QgbWFwcGVkTWVudUl0ZW1zOiAoQ3VzdG9tQWN0aW9uIHwgQmFzZUFjdGlvbilbXSA9IFtdO1xuXG5cdGZvciAoY29uc3QgbWVudUl0ZW1LZXkgb2YgbWVudUFjdGlvbi5tZW51ID8/IFtdKSB7XG5cdFx0Y29uc3QgeyBhY3Rpb24sIGNhbkJlTWVudUl0ZW0gfSA9IG1hcEFjdGlvbkJ5S2V5KG1hbmlmZXN0QWN0aW9ucywgYW5ub3RhdGlvbkFjdGlvbnMsIGhpZGRlbkFjdGlvbnMsIG1lbnVJdGVtS2V5KTtcblxuXHRcdGlmIChjYW5CZU1lbnVJdGVtKSB7XG5cdFx0XHRtYXBwZWRNZW51SXRlbXMucHVzaChhY3Rpb24pO1xuXHRcdH1cblxuXHRcdGlmIChhY3Rpb24uY29tbWFuZCkge1xuXHRcdFx0KGNvbW1hbmRBY3Rpb25zIGFzIGFueSlbbWVudUl0ZW1LZXldID0gYWN0aW9uO1xuXHRcdH1cblx0fVxuXG5cdG1lbnVBY3Rpb24ubWVudSA9IG1hcHBlZE1lbnVJdGVtcztcblxuXHQvLyBJZiB0aGUgbWVudSBpcyBzZXQgdG8gaW52aXNpYmxlLCBpdCBzaG91bGQgYmUgaW52aXNpYmxlLCBvdGhlcndpc2UgdGhlIHZpc2liaWxpdHkgc2hvdWxkIGJlIGNhbGN1bGF0ZWQgZnJvbSB0aGUgaXRlbXNcblx0Y29uc3QgdmlzaWJsZUV4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IG1hcHBlZE1lbnVJdGVtcy5tYXAoKG1lbnVJdGVtKSA9PlxuXHRcdHJlc29sdmVCaW5kaW5nU3RyaW5nKG1lbnVJdGVtLnZpc2libGUgYXMgc3RyaW5nLCBcImJvb2xlYW5cIilcblx0KTtcblx0bWVudUFjdGlvbi52aXNpYmxlID0gY29tcGlsZUV4cHJlc3Npb24oYW5kKHJlc29sdmVCaW5kaW5nU3RyaW5nKG1lbnVBY3Rpb24udmlzaWJsZSBhcyBzdHJpbmcsIFwiYm9vbGVhblwiKSwgb3IoLi4udmlzaWJsZUV4cHJlc3Npb25zKSkpO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIGZsYXQgY29sbGVjdGlvbiBvZiBhY3Rpb25zIGludG8gYSBuZXN0ZWQgc3RydWN0dXJlcyBvZiBtZW51cy4gVGhlIHJlc3VsdCBpcyBhIHJlY29yZCBvZiBhY3Rpb25zIHRoYXQgYXJlIGVpdGhlciBtZW51cyBvclxuICogb25lcyB0aGF0IGRvIG5vdCBhcHBlYXIgaW4gbWVudXMgYXMgbWVudSBpdGVtcy4gSXQgYWxzbyByZXR1cm5zIGEgbGlzdCBvZiBhY3Rpb25zIHRoYXQgaGF2ZSBhbiBhc3NpZ25lZCBjb21tYW5kLlxuICpcbiAqIE5vdGUgdGhhdCBtZW51IGl0ZW1zIGFyZSBhbHJlYWR5IHRoZSBtZXJnZWQgcmVzdWx0IG9mIGFubm90YXRpb24gYWN0aW9ucyBhbmQgdGhlaXIgbWFuaWZlc3QgY29uZmlndXJhdGlvbiwgYXMge0BsaW5rIGluc2VydEN1c3RvbUVsZW1lbnRzfVxuICogb25seSBjb25zaWRlcnMgcm9vdC1sZXZlbCBhY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdEFjdGlvbnMgQWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGFubm90YXRpb25BY3Rpb25zIEFjdGlvbnMgZGVmaW5lZCB0aHJvdWdoIGFubm90YXRpb25zXG4gKiBAcGFyYW0gaGlkZGVuQWN0aW9ucyBBY3Rpb25zIHRoYXQgYXJlIGNvbmZpZ3VyZWQgYXMgaGlkZGVuIChhZGRpdGlvbmFsIHRvIHRoZSB2aXNpYmxlIHByb3BlcnR5KVxuICogQHJldHVybnMgVGhlIHRyYW5zZm9ybWVkIGFjdGlvbnMgZnJvbSB0aGUgbWFuaWZlc3QgYW5kIGEgbGlzdCBvZiBjb21tYW5kIGFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gdHJhbnNmb3JtTWVudUFjdGlvbnNBbmRJZGVudGlmeUNvbW1hbmRzKFxuXHRtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4sXG5cdGFubm90YXRpb25BY3Rpb25zOiBCYXNlQWN0aW9uW10sXG5cdGhpZGRlbkFjdGlvbnM6IEJhc2VBY3Rpb25bXVxuKTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPj4ge1xuXHRjb25zdCBhbGxBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+ID0ge307XG5cdGNvbnN0IGFjdGlvbktleXNUb0RlbGV0ZTogc3RyaW5nW10gPSBbXTtcblx0Y29uc3QgY29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4gPSB7fTtcblxuXHRmb3IgKGNvbnN0IGFjdGlvbktleSBpbiBtYW5pZmVzdEFjdGlvbnMpIHtcblx0XHRjb25zdCBtYW5pZmVzdEFjdGlvbjogQ3VzdG9tQWN0aW9uID0gbWFuaWZlc3RBY3Rpb25zW2FjdGlvbktleV07XG5cblx0XHRpZiAobWFuaWZlc3RBY3Rpb24uZGVmYXVsdEFjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtYXBNZW51RGVmYXVsdEFjdGlvbihtYW5pZmVzdEFjdGlvbiwgbWFuaWZlc3RBY3Rpb25zLCBhbm5vdGF0aW9uQWN0aW9ucywgY29tbWFuZEFjdGlvbnMsIGhpZGRlbkFjdGlvbnMpO1xuXHRcdH1cblxuXHRcdGlmIChtYW5pZmVzdEFjdGlvbi50eXBlID09PSBBY3Rpb25UeXBlLk1lbnUpIHtcblx0XHRcdC8vIE1lbnUgaXRlbXMgc2hvdWxkIG5vdCBhcHBlYXIgYXMgdG9wLWxldmVsIGFjdGlvbnMgdGhlbXNlbHZlc1xuXHRcdFx0YWN0aW9uS2V5c1RvRGVsZXRlLnB1c2goLi4uKG1hbmlmZXN0QWN0aW9uLm1lbnUgYXMgc3RyaW5nW10pKTtcblxuXHRcdFx0bWFwTWVudUl0ZW1zKG1hbmlmZXN0QWN0aW9uLCBtYW5pZmVzdEFjdGlvbnMsIGFubm90YXRpb25BY3Rpb25zLCBjb21tYW5kQWN0aW9ucywgaGlkZGVuQWN0aW9ucyk7XG5cblx0XHRcdC8vIE1lbnUgaGFzIG5vIHZpc2libGUgaXRlbXMsIHNvIHJlbW92ZSBpdFxuXHRcdFx0aWYgKCFtYW5pZmVzdEFjdGlvbi5tZW51Py5sZW5ndGgpIHtcblx0XHRcdFx0YWN0aW9uS2V5c1RvRGVsZXRlLnB1c2gobWFuaWZlc3RBY3Rpb24ua2V5KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobWFuaWZlc3RBY3Rpb24uY29tbWFuZCkge1xuXHRcdFx0Y29tbWFuZEFjdGlvbnNbYWN0aW9uS2V5XSA9IG1hbmlmZXN0QWN0aW9uO1xuXHRcdH1cblxuXHRcdGFsbEFjdGlvbnNbYWN0aW9uS2V5XSA9IG1hbmlmZXN0QWN0aW9uO1xuXHR9XG5cblx0YWN0aW9uS2V5c1RvRGVsZXRlLmZvckVhY2goKGFjdGlvbktleTogc3RyaW5nKSA9PiBkZWxldGUgYWxsQWN0aW9uc1thY3Rpb25LZXldKTtcblxuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnM6IGFsbEFjdGlvbnMsXG5cdFx0Y29tbWFuZEFjdGlvbnM6IGNvbW1hbmRBY3Rpb25zXG5cdH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgZW5hYmxlbWVudCBvZiBhIG1hbmlmZXN0IGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gbWFuaWZlc3RBY3Rpb24gVGhlIGFjdGlvbiBjb25maWd1cmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGlzQW5ub3RhdGlvbkFjdGlvbiBXaGV0aGVyIHRoZSBhY3Rpb24sIGRlZmluZWQgaW4gbWFuaWZlc3QsIGNvcnJlc3BvbmRzIHRvIGFuIGV4aXN0aW5nIGFubm90YXRpb24gYWN0aW9uLlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIERldGVybWluZWQgcHJvcGVydHkgdmFsdWUgZm9yIHRoZSBlbmFibGVtZW50XG4gKi9cbmNvbnN0IF9nZXRNYW5pZmVzdEVuYWJsZWQgPSBmdW5jdGlvbiAoXG5cdG1hbmlmZXN0QWN0aW9uOiBNYW5pZmVzdEFjdGlvbixcblx0aXNBbm5vdGF0aW9uQWN0aW9uOiBib29sZWFuLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHVuZGVmaW5lZCB7XG5cdGlmIChpc0Fubm90YXRpb25BY3Rpb24gJiYgbWFuaWZlc3RBY3Rpb24uZW5hYmxlZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gSWYgYW5ub3RhdGlvbiBhY3Rpb24gaGFzIG5vIHByb3BlcnR5IGRlZmluZWQgaW4gbWFuaWZlc3QsXG5cdFx0Ly8gZG8gbm90IG92ZXJ3cml0ZSBpdCB3aXRoIG1hbmlmZXN0IGFjdGlvbidzIGRlZmF1bHQgdmFsdWUuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGNvbnN0IHJlc3VsdCA9IGdldE1hbmlmZXN0QWN0aW9uQm9vbGVhblByb3BlcnR5V2l0aEZvcm1hdHRlcihtYW5pZmVzdEFjdGlvbi5lbmFibGVkLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHQvLyBDb25zaWRlciByZXF1aXJlc1NlbGVjdGlvbiBwcm9wZXJ0eSB0byBpbmNsdWRlIHNlbGVjdGVkQ29udGV4dHMgaW4gdGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0aWZFbHNlKFxuXHRcdFx0bWFuaWZlc3RBY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24gPT09IHRydWUsXG5cdFx0XHRhbmQoZ3JlYXRlck9yRXF1YWwocGF0aEluTW9kZWwoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKSwgMSksIHJlc3VsdCksXG5cdFx0XHRyZXN1bHRcblx0XHQpXG5cdCk7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIHZpc2liaWxpdHkgb2YgYSBtYW5pZmVzdCBhY3Rpb24uXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9uIFRoZSBhY3Rpb24gY29uZmlndXJlZCBpbiB0aGUgbWFuaWZlc3RcbiAqIEBwYXJhbSBpc0Fubm90YXRpb25BY3Rpb24gV2hldGhlciB0aGUgYWN0aW9uLCBkZWZpbmVkIGluIG1hbmlmZXN0LCBjb3JyZXNwb25kcyB0byBhbiBleGlzdGluZyBhbm5vdGF0aW9uIGFjdGlvbi5cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBEZXRlcm1pbmVkIHByb3BlcnR5IHZhbHVlIGZvciB0aGUgdmlzaWJpbGl0eVxuICovXG5jb25zdCBfZ2V0TWFuaWZlc3RWaXNpYmxlID0gZnVuY3Rpb24gKFxuXHRtYW5pZmVzdEFjdGlvbjogTWFuaWZlc3RBY3Rpb24sXG5cdGlzQW5ub3RhdGlvbkFjdGlvbjogYm9vbGVhbixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCB1bmRlZmluZWQge1xuXHRpZiAoaXNBbm5vdGF0aW9uQWN0aW9uICYmIG1hbmlmZXN0QWN0aW9uLnZpc2libGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIElmIGFubm90YXRpb24gYWN0aW9uIGhhcyBubyBwcm9wZXJ0eSBkZWZpbmVkIGluIG1hbmlmZXN0LFxuXHRcdC8vIGRvIG5vdCBvdmVyd3JpdGUgaXQgd2l0aCBtYW5pZmVzdCBhY3Rpb24ncyBkZWZhdWx0IHZhbHVlLlxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRjb25zdCByZXN1bHQgPSBnZXRNYW5pZmVzdEFjdGlvbkJvb2xlYW5Qcm9wZXJ0eVdpdGhGb3JtYXR0ZXIobWFuaWZlc3RBY3Rpb24udmlzaWJsZSwgY29udmVydGVyQ29udGV4dCk7XG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihyZXN1bHQpO1xufTtcblxuLyoqXG4gKiBBcyBzb21lIHByb3BlcnRpZXMgc2hvdWxkIG5vdCBiZSBvdmVycmlkYWJsZSBieSB0aGUgbWFuaWZlc3QsIG1ha2Ugc3VyZSB0aGF0IHRoZSBtYW5pZmVzdCBjb25maWd1cmF0aW9uIGdldHMgdGhlIGFubm90YXRpb24gdmFsdWVzIGZvciB0aGVzZS5cbiAqXG4gKiBAcGFyYW0gbWFuaWZlc3RBY3Rpb24gQWN0aW9uIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcGFyYW0gYW5ub3RhdGlvbkFjdGlvbiBBY3Rpb24gZGVmaW5lZCB0aHJvdWdoIGFubm90YXRpb25zXG4gKi9cbmZ1bmN0aW9uIG92ZXJyaWRlTWFuaWZlc3RDb25maWd1cmF0aW9uV2l0aEFubm90YXRpb24obWFuaWZlc3RBY3Rpb246IEN1c3RvbUFjdGlvbiwgYW5ub3RhdGlvbkFjdGlvbj86IEJhc2VBY3Rpb24pIHtcblx0aWYgKCFhbm5vdGF0aW9uQWN0aW9uKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gRG8gbm90IG92ZXJyaWRlIHRoZSAndHlwZScgZ2l2ZW4gaW4gYW4gYW5ub3RhdGlvbiBhY3Rpb25cblx0bWFuaWZlc3RBY3Rpb24udHlwZSA9IGFubm90YXRpb25BY3Rpb24udHlwZTtcblx0bWFuaWZlc3RBY3Rpb24uYW5ub3RhdGlvblBhdGggPSBhbm5vdGF0aW9uQWN0aW9uLmFubm90YXRpb25QYXRoO1xuXHRtYW5pZmVzdEFjdGlvbi5wcmVzcyA9IGFubm90YXRpb25BY3Rpb24ucHJlc3M7XG5cblx0Ly8gT25seSB1c2UgdGhlIGFubm90YXRpb24gdmFsdWVzIGZvciBlbmFibGVtZW50IGFuZCB2aXNpYmlsaXR5IGlmIG5vdCBzZXQgaW4gdGhlIG1hbmlmZXN0XG5cdG1hbmlmZXN0QWN0aW9uLmVuYWJsZWQgPSBtYW5pZmVzdEFjdGlvbi5lbmFibGVkID8/IGFubm90YXRpb25BY3Rpb24uZW5hYmxlZDtcblx0bWFuaWZlc3RBY3Rpb24udmlzaWJsZSA9IG1hbmlmZXN0QWN0aW9uLnZpc2libGUgPz8gYW5ub3RhdGlvbkFjdGlvbi52aXNpYmxlO1xufVxuXG4vKipcbiAqIEhpZGUgYW4gYWN0aW9uIGlmIGl0IGlzIGEgaGlkZGVuIGhlYWRlciBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGFjdGlvbiBUaGUgYWN0aW9uIHRvIGhpZGVcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKi9cbmZ1bmN0aW9uIGhpZGVBY3Rpb25JZkhpZGRlbkFjdGlvbihhY3Rpb246IEN1c3RvbUFjdGlvbiwgaGlkZGVuQWN0aW9ucz86IEJhc2VBY3Rpb25bXSkge1xuXHRpZiAoaGlkZGVuQWN0aW9ucz8uZmluZCgoaGlkZGVuQWN0aW9uKSA9PiBoaWRkZW5BY3Rpb24ua2V5ID09PSBhY3Rpb24ua2V5KSkge1xuXHRcdGFjdGlvbi52aXNpYmxlID0gXCJmYWxzZVwiO1xuXHR9XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgYWN0aW9uIGNvbmZpZ3VyYXRpb24gYmFzZWQgb24gdGhlIG1hbmlmZXN0IHNldHRpbmdzLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdEFjdGlvbnMgVGhlIG1hbmlmZXN0IGFjdGlvbnNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGFubm90YXRpb25BY3Rpb25zIFRoZSBhbm5vdGF0aW9uIGFjdGlvbnMgZGVmaW5pdGlvblxuICogQHBhcmFtIG5hdmlnYXRpb25TZXR0aW5ncyBUaGUgbmF2aWdhdGlvbiBzZXR0aW5nc1xuICogQHBhcmFtIGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzIFRoZSBuYXZpZ2F0aW9uIHNldHRpbmdzIHRvIGJlIGNvbnNpZGVyZWRcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKiBAcGFyYW0gZmFjZXROYW1lIFRoZSBmYWNldCB3aGVyZSBhbiBhY3Rpb24gaXMgZGlzcGxheWVkIGlmIGl0IGlzIGlubGluZVxuICogQHJldHVybnMgVGhlIGFjdGlvbnMgZnJvbSB0aGUgbWFuaWZlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGlvbnNGcm9tTWFuaWZlc3QoXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RBY3Rpb24+IHwgdW5kZWZpbmVkLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRhbm5vdGF0aW9uQWN0aW9ucz86IEJhc2VBY3Rpb25bXSxcblx0bmF2aWdhdGlvblNldHRpbmdzPzogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0Y29uc2lkZXJOYXZpZ2F0aW9uU2V0dGluZ3M/OiBib29sZWFuLFxuXHRoaWRkZW5BY3Rpb25zPzogQmFzZUFjdGlvbltdLFxuXHRmYWNldE5hbWU/OiBzdHJpbmdcbik6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4+IHtcblx0Y29uc3QgYWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPiA9IHt9O1xuXHRmb3IgKGNvbnN0IGFjdGlvbktleSBpbiBtYW5pZmVzdEFjdGlvbnMpIHtcblx0XHRjb25zdCBtYW5pZmVzdEFjdGlvbjogTWFuaWZlc3RBY3Rpb24gPSBtYW5pZmVzdEFjdGlvbnNbYWN0aW9uS2V5XTtcblx0XHRjb25zdCBsYXN0RG90SW5kZXggPSBtYW5pZmVzdEFjdGlvbi5wcmVzcz8ubGFzdEluZGV4T2YoXCIuXCIpIHx8IC0xO1xuXHRcdGNvbnN0IG9Bbm5vdGF0aW9uQWN0aW9uID0gYW5ub3RhdGlvbkFjdGlvbnM/LmZpbmQoKG9iaikgPT4gb2JqLmtleSA9PT0gYWN0aW9uS2V5KTtcblxuXHRcdC8vIFRvIGlkZW50aWZ5IHRoZSBhbm5vdGF0aW9uIGFjdGlvbiBwcm9wZXJ0eSBvdmVyd3JpdGUgdmlhIG1hbmlmZXN0IHVzZS1jYXNlLlxuXHRcdGNvbnN0IGlzQW5ub3RhdGlvbkFjdGlvbiA9ICEhb0Fubm90YXRpb25BY3Rpb247XG5cdFx0aWYgKG1hbmlmZXN0QWN0aW9uLmZhY2V0TmFtZSkge1xuXHRcdFx0ZmFjZXROYW1lID0gbWFuaWZlc3RBY3Rpb24uZmFjZXROYW1lO1xuXHRcdH1cblxuXHRcdGFjdGlvbnNbYWN0aW9uS2V5XSA9IHtcblx0XHRcdGlkOiBvQW5ub3RhdGlvbkFjdGlvbiA/IGFjdGlvbktleSA6IGdldEN1c3RvbUFjdGlvbklEKGFjdGlvbktleSksXG5cdFx0XHR0eXBlOiBtYW5pZmVzdEFjdGlvbi5tZW51ID8gQWN0aW9uVHlwZS5NZW51IDogQWN0aW9uVHlwZS5EZWZhdWx0LFxuXHRcdFx0dmlzaWJsZTogX2dldE1hbmlmZXN0VmlzaWJsZShtYW5pZmVzdEFjdGlvbiwgaXNBbm5vdGF0aW9uQWN0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdGVuYWJsZWQ6IF9nZXRNYW5pZmVzdEVuYWJsZWQobWFuaWZlc3RBY3Rpb24sIGlzQW5ub3RhdGlvbkFjdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRoYW5kbGVyTW9kdWxlOiBtYW5pZmVzdEFjdGlvbi5wcmVzcyAmJiBtYW5pZmVzdEFjdGlvbi5wcmVzcy5zdWJzdHJpbmcoMCwgbGFzdERvdEluZGV4KS5yZXBsYWNlKC9cXC4vZ2ksIFwiL1wiKSxcblx0XHRcdGhhbmRsZXJNZXRob2Q6IG1hbmlmZXN0QWN0aW9uLnByZXNzICYmIG1hbmlmZXN0QWN0aW9uLnByZXNzLnN1YnN0cmluZyhsYXN0RG90SW5kZXggKyAxKSxcblx0XHRcdHByZXNzOiBtYW5pZmVzdEFjdGlvbi5wcmVzcyxcblx0XHRcdHRleHQ6IG1hbmlmZXN0QWN0aW9uLnRleHQsXG5cdFx0XHRub1dyYXA6IG1hbmlmZXN0QWN0aW9uLl9fbm9XcmFwLFxuXHRcdFx0a2V5OiByZXBsYWNlU3BlY2lhbENoYXJzKGFjdGlvbktleSksXG5cdFx0XHRlbmFibGVPblNlbGVjdDogbWFuaWZlc3RBY3Rpb24uZW5hYmxlT25TZWxlY3QsXG5cdFx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IG1hbmlmZXN0QWN0aW9uLmRlZmF1bHRWYWx1ZXNGdW5jdGlvbixcblx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdGFuY2hvcjogbWFuaWZlc3RBY3Rpb24ucG9zaXRpb24/LmFuY2hvcixcblx0XHRcdFx0cGxhY2VtZW50OiBtYW5pZmVzdEFjdGlvbi5wb3NpdGlvbiA9PT0gdW5kZWZpbmVkID8gUGxhY2VtZW50LkFmdGVyIDogbWFuaWZlc3RBY3Rpb24ucG9zaXRpb24ucGxhY2VtZW50XG5cdFx0XHR9LFxuXHRcdFx0aXNOYXZpZ2FibGU6IGlzQWN0aW9uTmF2aWdhYmxlKG1hbmlmZXN0QWN0aW9uLCBuYXZpZ2F0aW9uU2V0dGluZ3MsIGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzKSxcblx0XHRcdGNvbW1hbmQ6IG1hbmlmZXN0QWN0aW9uLmNvbW1hbmQsXG5cdFx0XHRyZXF1aXJlc1NlbGVjdGlvbjogbWFuaWZlc3RBY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogbWFuaWZlc3RBY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24sXG5cdFx0XHRlbmFibGVBdXRvU2Nyb2xsOiBlbmFibGVBdXRvU2Nyb2xsKG1hbmlmZXN0QWN0aW9uKSxcblx0XHRcdG1lbnU6IG1hbmlmZXN0QWN0aW9uLm1lbnUgPz8gW10sXG5cdFx0XHRmYWNldE5hbWU6IG1hbmlmZXN0QWN0aW9uLmlubGluZSA/IGZhY2V0TmFtZSA6IHVuZGVmaW5lZCxcblx0XHRcdGRlZmF1bHRBY3Rpb246IG1hbmlmZXN0QWN0aW9uLmRlZmF1bHRBY3Rpb25cblx0XHR9O1xuXG5cdFx0b3ZlcnJpZGVNYW5pZmVzdENvbmZpZ3VyYXRpb25XaXRoQW5ub3RhdGlvbihhY3Rpb25zW2FjdGlvbktleV0sIG9Bbm5vdGF0aW9uQWN0aW9uKTtcblx0XHRoaWRlQWN0aW9uSWZIaWRkZW5BY3Rpb24oYWN0aW9uc1thY3Rpb25LZXldLCBoaWRkZW5BY3Rpb25zKTtcblx0fVxuXG5cdHJldHVybiB0cmFuc2Zvcm1NZW51QWN0aW9uc0FuZElkZW50aWZ5Q29tbWFuZHMoYWN0aW9ucywgYW5ub3RhdGlvbkFjdGlvbnMgPz8gW10sIGhpZGRlbkFjdGlvbnMgPz8gW10pO1xufVxuXG4vKipcbiAqIEdldHMgYSBiaW5kaW5nIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIGEgQm9vbGVhbiBtYW5pZmVzdCBwcm9wZXJ0eSB0aGF0IGNhbiBlaXRoZXIgYmUgcmVwcmVzZW50ZWQgYnkgYSBzdGF0aWMgdmFsdWUsIGEgYmluZGluZyBzdHJpbmcsXG4gKiBvciBhIHJ1bnRpbWUgZm9ybWF0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eVZhbHVlIFN0cmluZyByZXByZXNlbnRpbmcgdGhlIGNvbmZpZ3VyZWQgcHJvcGVydHkgdmFsdWVcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBBIGJpbmRpbmcgZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIHByb3BlcnR5XG4gKi9cbmZ1bmN0aW9uIGdldE1hbmlmZXN0QWN0aW9uQm9vbGVhblByb3BlcnR5V2l0aEZvcm1hdHRlcihcblx0cHJvcGVydHlWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gfCBib29sZWFuIHtcblx0Y29uc3QgcmVzb2x2ZWRCaW5kaW5nID0gcmVzb2x2ZUJpbmRpbmdTdHJpbmcocHJvcGVydHlWYWx1ZSBhcyBzdHJpbmcsIFwiYm9vbGVhblwiKTtcblx0bGV0IHJlc3VsdDogYW55O1xuXHRpZiAoaXNDb25zdGFudChyZXNvbHZlZEJpbmRpbmcpICYmIHJlc29sdmVkQmluZGluZy52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gTm8gcHJvcGVydHkgdmFsdWUgY29uZmlndXJlZCBpbiBtYW5pZmVzdCBmb3IgdGhlIGN1c3RvbSBhY3Rpb24gLS0+IGRlZmF1bHQgdmFsdWUgaXMgdHJ1ZVxuXHRcdHJlc3VsdCA9IHRydWU7XG5cdH0gZWxzZSBpZiAoaXNDb25zdGFudChyZXNvbHZlZEJpbmRpbmcpICYmIHR5cGVvZiByZXNvbHZlZEJpbmRpbmcudmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0Ly8gdHJ1ZSAvIGZhbHNlXG5cdFx0cmVzdWx0ID0gcmVzb2x2ZWRCaW5kaW5nLnZhbHVlO1xuXHR9IGVsc2UgaWYgKGlzQ29uc3RhbnQocmVzb2x2ZWRCaW5kaW5nKSAmJiB0eXBlb2YgcmVzb2x2ZWRCaW5kaW5nLnZhbHVlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0Ly8gVGhlbiBpdCdzIGEgbW9kdWxlLW1ldGhvZCByZWZlcmVuY2UgXCJzYXAueHh4Lnl5eS5kb1NvbWV0aGluZ1wiXG5cdFx0Y29uc3QgbWV0aG9kUGF0aCA9IHJlc29sdmVkQmluZGluZy52YWx1ZTtcblx0XHQvLyBGSVhNRTogVGhlIGN1c3RvbSBcImlzRW5hYmxlZFwiIGNoZWNrIGRvZXMgbm90IHRyaWdnZXIgKGJlY2F1c2Ugbm9uZSBvZiB0aGUgYm91bmQgdmFsdWVzIGNoYW5nZXMpXG5cdFx0cmVzdWx0ID0gZm9ybWF0UmVzdWx0KFxuXHRcdFx0W3BhdGhJbk1vZGVsKFwiL1wiLCBcIiR2aWV3XCIpLCBtZXRob2RQYXRoLCBwYXRoSW5Nb2RlbChcInNlbGVjdGVkQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKV0sXG5cdFx0XHRmcG1Gb3JtYXR0ZXIuY3VzdG9tQm9vbGVhblByb3BlcnR5Q2hlY2sgYXMgYW55LFxuXHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkuY29udGV4dExvY2F0aW9uPy50YXJnZXRFbnRpdHlUeXBlIHx8IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpXG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHQvLyB0aGVuIGl0J3MgYSBiaW5kaW5nXG5cdFx0cmVzdWx0ID0gcmVzb2x2ZWRCaW5kaW5nO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGNvbnN0IHJlbW92ZUR1cGxpY2F0ZUFjdGlvbnMgPSAoYWN0aW9uczogQmFzZUFjdGlvbltdKTogQmFzZUFjdGlvbltdID0+IHtcblx0bGV0IG9NZW51SXRlbUtleXM6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcblx0YWN0aW9ucy5mb3JFYWNoKChhY3Rpb24pID0+IHtcblx0XHRpZiAoYWN0aW9uPy5tZW51Py5sZW5ndGgpIHtcblx0XHRcdG9NZW51SXRlbUtleXMgPSBhY3Rpb24ubWVudS5yZWR1Y2UoKGl0ZW0sIHsga2V5IH06IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoa2V5ICYmICFpdGVtW2tleV0pIHtcblx0XHRcdFx0XHRpdGVtW2tleV0gPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBpdGVtO1xuXHRcdFx0fSwgb01lbnVJdGVtS2V5cyk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIGFjdGlvbnMuZmlsdGVyKChhY3Rpb24pID0+ICFvTWVudUl0ZW1LZXlzW2FjdGlvbi5rZXldKTtcbn07XG5cbi8qKlxuICogTWV0aG9kIHRvIGRldGVybWluZSB0aGUgdmFsdWUgb2YgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiBhbiBhbm5vdGF0aW9uLWJhc2VkIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gYWN0aW9uVGFyZ2V0IFRoZSBpbnN0YW5jZSBvZiB0aGUgYWN0aW9uXG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSBhY3Rpb24gYnV0dG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24oXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGFjdGlvblRhcmdldDogQWN0aW9uIHwgdW5kZWZpbmVkXG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGlmIChhY3Rpb25UYXJnZXQ/LmlzQm91bmQgIT09IHRydWUpIHtcblx0XHRyZXR1cm4gXCJ0cnVlXCI7XG5cdH1cblx0aWYgKGFjdGlvblRhcmdldD8ucGFyYW1ldGVycz8ubGVuZ3RoKSB7XG5cdFx0Y29uc3QgYmluZGluZ1BhcmFtZXRlckZ1bGxOYW1lID0gYWN0aW9uVGFyZ2V0Py5wYXJhbWV0ZXJzWzBdLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdG9wZXJhdGlvbkF2YWlsYWJsZUV4cHJlc3Npb24gPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdGFjdGlvblRhcmdldD8uYW5ub3RhdGlvbnMuQ29yZT8uT3BlcmF0aW9uQXZhaWxhYmxlLFxuXHRcdFx0XHRbXSxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHQocGF0aDogc3RyaW5nKSA9PiBiaW5kaW5nQ29udGV4dFBhdGhWaXNpdG9yKHBhdGgsIGNvbnZlcnRlckNvbnRleHQsIGJpbmRpbmdQYXJhbWV0ZXJGdWxsTmFtZSlcblx0XHRcdCk7XG5cdFx0aWYgKGFjdGlvblRhcmdldD8uYW5ub3RhdGlvbnMuQ29yZT8uT3BlcmF0aW9uQXZhaWxhYmxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihlcXVhbChvcGVyYXRpb25BdmFpbGFibGVFeHByZXNzaW9uLCB0cnVlKSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBcInRydWVcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbWFudGljT2JqZWN0TWFwcGluZyhtYXBwaW5ncz86IFNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGVbXSk6IE1ldGFNb2RlbFR5cGU8U2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZT5bXSB7XG5cdHJldHVybiBtYXBwaW5nc1xuXHRcdD8gbWFwcGluZ3MubWFwKChtYXBwaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0TG9jYWxQcm9wZXJ0eToge1xuXHRcdFx0XHRcdFx0JFByb3BlcnR5UGF0aDogbWFwcGluZy5Mb2NhbFByb3BlcnR5LnZhbHVlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRTZW1hbnRpY09iamVjdFByb3BlcnR5OiBtYXBwaW5nLlNlbWFudGljT2JqZWN0UHJvcGVydHlcblx0XHRcdFx0fTtcblx0XHQgIH0pXG5cdFx0OiBbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQWN0aW9uTmF2aWdhYmxlKFxuXHRhY3Rpb246IE1hbmlmZXN0QWN0aW9uIHwgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUsXG5cdG5hdmlnYXRpb25TZXR0aW5ncz86IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzPzogYm9vbGVhblxuKTogYm9vbGVhbiB7XG5cdGxldCBiSXNOYXZpZ2F0aW9uQ29uZmlndXJlZDogYm9vbGVhbiA9IHRydWU7XG5cdGlmIChjb25zaWRlck5hdmlnYXRpb25TZXR0aW5ncykge1xuXHRcdGNvbnN0IGRldGFpbE9yRGlzcGxheSA9IG5hdmlnYXRpb25TZXR0aW5ncyAmJiAobmF2aWdhdGlvblNldHRpbmdzLmRldGFpbCB8fCBuYXZpZ2F0aW9uU2V0dGluZ3MuZGlzcGxheSk7XG5cdFx0YklzTmF2aWdhdGlvbkNvbmZpZ3VyZWQgPSBkZXRhaWxPckRpc3BsYXk/LnJvdXRlID8gdHJ1ZSA6IGZhbHNlO1xuXHR9XG5cdC8vIHdoZW4gZW5hYmxlQXV0b1Njcm9sbCBpcyB0cnVlIHRoZSBuYXZpZ2F0ZVRvSW5zdGFuY2UgZmVhdHVyZSBpcyBkaXNhYmxlZFxuXHRpZiAoXG5cdFx0KGFjdGlvbiAmJlxuXHRcdFx0YWN0aW9uLmFmdGVyRXhlY3V0aW9uICYmXG5cdFx0XHQoYWN0aW9uLmFmdGVyRXhlY3V0aW9uPy5uYXZpZ2F0ZVRvSW5zdGFuY2UgPT09IGZhbHNlIHx8IGFjdGlvbi5hZnRlckV4ZWN1dGlvbj8uZW5hYmxlQXV0b1Njcm9sbCA9PT0gdHJ1ZSkpIHx8XG5cdFx0IWJJc05hdmlnYXRpb25Db25maWd1cmVkXG5cdCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZUF1dG9TY3JvbGwoYWN0aW9uOiBNYW5pZmVzdEFjdGlvbik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gYWN0aW9uPy5hZnRlckV4ZWN1dGlvbj8uZW5hYmxlQXV0b1Njcm9sbCA9PT0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGFGaWVsZElzQ29weUFjdGlvbihkYXRhRmllbGQ6IERhdGFGaWVsZEZvckFjdGlvblR5cGVzKTogYm9vbGVhbiB7XG5cdHJldHVybiBkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5Jc0NvcHlBY3Rpb24/LnZhbHVlT2YoKSA9PT0gdHJ1ZSAmJiBkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvcHlBY3Rpb24oY29weURhdGFGaWVsZHM6IERhdGFGaWVsZEZvckFjdGlvblR5cGVzW10pOiBEYXRhRmllbGRGb3JBY3Rpb25UeXBlcyB8IHVuZGVmaW5lZCB7XG5cdGlmIChjb3B5RGF0YUZpZWxkcy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gY29weURhdGFGaWVsZHNbMF07XG5cdH1cblx0aWYgKGNvcHlEYXRhRmllbGRzLmxlbmd0aCA+IDEpIHtcblx0XHRMb2cuZXJyb3IoXCJNdWx0aXBsZSBhY3Rpb25zIGFyZSBhbm5vdGF0ZWQgd2l0aCBpc0NvcHlBY3Rpb24uIFRoZXJlIGNhbiBiZSBvbmx5IG9uZSBzdGFuZGFyZCBjb3B5IGFjdGlvbi5cIik7XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BaUNZQSxVQUFVO0VBQUEsV0FBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7RUFBQSxHQUFWQSxVQUFVLEtBQVZBLFVBQVU7RUFBQTtFQWtGdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQyxjQUFjLENBQ3RCQyxlQUE2QyxFQUM3Q0MsaUJBQStCLEVBQy9CQyxhQUEyQixFQUMzQkMsU0FBaUIsRUFDaEI7SUFDRCxNQUFNQyxnQkFBdUQsR0FBR0gsaUJBQWlCLENBQUNJLElBQUksQ0FDcEZDLE1BQWtCLElBQUtBLE1BQU0sQ0FBQ0MsR0FBRyxLQUFLSixTQUFTLENBQ2hEO0lBQ0QsTUFBTUssY0FBYyxHQUFHUixlQUFlLENBQUNHLFNBQVMsQ0FBQztJQUNqRCxNQUFNTSxZ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