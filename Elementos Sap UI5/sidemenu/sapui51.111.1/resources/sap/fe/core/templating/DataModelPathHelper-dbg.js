/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/PropertyHelper"], function (BindingToolkit, PropertyHelper) {
  "use strict";

  var _exports = {};
  var isPathExpression = PropertyHelper.isPathExpression;
  var isAnnotationPathExpression = PropertyHelper.isAnnotationPathExpression;
  var unresolvableExpression = BindingToolkit.unresolvableExpression;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  /**
   * Function that returns the relative path to the property from the DataModelObjectPath.
   *
   * @param contextPath The DataModelObjectPath object to the property
   * @returns The path from the root entity set.
   */
  const getRelativePaths = function (contextPath) {
    return getPathRelativeLocation(contextPath === null || contextPath === void 0 ? void 0 : contextPath.contextLocation, contextPath === null || contextPath === void 0 ? void 0 : contextPath.navigationProperties).map(np => np.name);
  };
  _exports.getRelativePaths = getRelativePaths;
  const getPathRelativeLocation = function (contextPath) {
    let visitedNavProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    if (!contextPath) {
      return visitedNavProps;
    } else if (visitedNavProps.length >= contextPath.navigationProperties.length) {
      let remainingNavProps = [];
      contextPath.navigationProperties.forEach((navProp, navIndex) => {
        if (visitedNavProps[navIndex] !== navProp) {
          remainingNavProps.push(visitedNavProps[navIndex]);
        }
      });
      remainingNavProps = remainingNavProps.concat(visitedNavProps.slice(contextPath.navigationProperties.length));
      // Clean up NavProp -> Owner
      let currentIdx = 0;
      while (remainingNavProps.length > 1 && currentIdx != remainingNavProps.length - 1) {
        const currentNav = remainingNavProps[currentIdx];
        const nextNavProp = remainingNavProps[currentIdx + 1];
        if (currentNav._type === "NavigationProperty" && currentNav.partner === nextNavProp.name) {
          remainingNavProps.splice(0, 2);
        } else {
          currentIdx++;
        }
      }
      return remainingNavProps;
    } else {
      let extraNavProp = [];
      visitedNavProps.forEach((navProp, navIndex) => {
        if (contextPath.navigationProperties[navIndex] !== navProp) {
          extraNavProp.push(visitedNavProps[navIndex]);
        }
      });
      extraNavProp = extraNavProp.concat(contextPath.navigationProperties.slice(visitedNavProps.length));
      // Clean up NavProp -> Owner
      let currentIdx = 0;
      while (extraNavProp.length > 1 && currentIdx != extraNavProp.length - 1) {
        const currentNav = extraNavProp[currentIdx];
        const nextNavProp = extraNavProp[currentIdx + 1];
        if (currentNav._type === "NavigationProperty" && currentNav.partner === nextNavProp.name) {
          extraNavProp.splice(0, 2);
        } else {
          currentIdx++;
        }
      }
      extraNavProp = extraNavProp.map(navProp => {
        return navProp._type === "NavigationProperty" ? navProp.targetType.navigationProperties.find(np => np.name === navProp.partner) : navProp;
      });
      return extraNavProp;
    }
  };
  _exports.getPathRelativeLocation = getPathRelativeLocation;
  const enhanceDataModelPath = function (dataModelObjectPath, propertyPath) {
    let sPropertyPath = "";
    if ((isPathExpression(propertyPath) || isAnnotationPathExpression(propertyPath)) && propertyPath.path) {
      sPropertyPath = propertyPath.path;
    } else if (typeof propertyPath === "string") {
      sPropertyPath = propertyPath;
    }
    let oTarget;
    if (isPathExpression(propertyPath) || isAnnotationPathExpression(propertyPath)) {
      oTarget = propertyPath.$target;
    } else if (dataModelObjectPath.targetEntityType) {
      oTarget = dataModelObjectPath.targetEntityType.resolvePath(sPropertyPath);
    } else {
      oTarget = dataModelObjectPath.targetObject;
    }
    const aPathSplit = sPropertyPath.split("/");
    let currentEntitySet = dataModelObjectPath.targetEntitySet;
    let currentEntityType = dataModelObjectPath.targetEntityType;
    const navigationProperties = dataModelObjectPath.navigationProperties.concat();
    // Process only if we have to go through navigation properties

    let reducedEntityType = dataModelObjectPath.targetEntityType;
    aPathSplit.forEach(pathPart => {
      if (!reducedEntityType) {
        return;
      }
      const potentialNavProp = reducedEntityType.navigationProperties.find(navProp => navProp.name === pathPart);
      if (potentialNavProp) {
        navigationProperties.push(potentialNavProp);
        currentEntityType = potentialNavProp.targetType;
        if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(pathPart)) {
          currentEntitySet = currentEntitySet.navigationPropertyBinding[pathPart];
        }
        reducedEntityType = currentEntityType;
      } else {
        const potentialComplexType = reducedEntityType.entityProperties.find(navProp => navProp.name === pathPart);
        if (potentialComplexType !== null && potentialComplexType !== void 0 && potentialComplexType.targetType) {
          navigationProperties.push(potentialComplexType);
          reducedEntityType = currentEntityType;
        } else {
          reducedEntityType = undefined;
        }
      }
    });
    return {
      startingEntitySet: dataModelObjectPath.startingEntitySet,
      navigationProperties: navigationProperties,
      contextLocation: dataModelObjectPath.contextLocation,
      targetEntitySet: currentEntitySet,
      targetEntityType: currentEntityType,
      targetObject: oTarget,
      convertedTypes: dataModelObjectPath.convertedTypes
    };
  };
  _exports.enhanceDataModelPath = enhanceDataModelPath;
  const getTargetEntitySetPath = function (dataModelObjectPath) {
    let targetEntitySetPath = `/${dataModelObjectPath.startingEntitySet.name}`;
    let currentEntitySet = dataModelObjectPath.startingEntitySet;
    let navigatedPaths = [];
    dataModelObjectPath.navigationProperties.forEach(navProp => {
      navigatedPaths.push(navProp.name);
      if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(navigatedPaths.join("/"))) {
        targetEntitySetPath += `/$NavigationPropertyBinding/${navigatedPaths.join("/")}/$`;
        currentEntitySet = currentEntitySet.navigationPropertyBinding[navigatedPaths.join("/")];
        navigatedPaths = [];
      }
    });
    return targetEntitySetPath;
  };
  _exports.getTargetEntitySetPath = getTargetEntitySetPath;
  const getTargetObjectPath = function (dataModelObjectPath) {
    var _dataModelObjectPath$;
    let bRelative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let path = "";
    if (!dataModelObjectPath.startingEntitySet) {
      return "/";
    }
    if (!bRelative) {
      path += `/${dataModelObjectPath.startingEntitySet.name}`;
    }
    if (dataModelObjectPath.navigationProperties.length > 0) {
      path = setTrailingSlash(path);
      path += dataModelObjectPath.navigationProperties.map(navProp => navProp.name).join("/");
    }
    if ((_dataModelObjectPath$ = dataModelObjectPath.targetObject) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.name && dataModelObjectPath.targetObject._type !== "NavigationProperty" && dataModelObjectPath.targetObject._type !== "EntityType" && dataModelObjectPath.targetObject._type !== "EntitySet" && dataModelObjectPath.targetObject !== dataModelObjectPath.startingEntitySet) {
      path = setTrailingSlash(path);
      path += `${dataModelObjectPath.targetObject.name}`;
    } else if (dataModelObjectPath.targetObject && dataModelObjectPath.targetObject.hasOwnProperty("term")) {
      path = setTrailingSlash(path);
      path += `@${dataModelObjectPath.targetObject.term}`;
      if (dataModelObjectPath.targetObject.hasOwnProperty("qualifier") && !!dataModelObjectPath.targetObject.qualifier) {
        path += `#${dataModelObjectPath.targetObject.qualifier}`;
      }
    }
    return path;
  };
  _exports.getTargetObjectPath = getTargetObjectPath;
  const getContextRelativeTargetObjectPath = function (dataModelObjectPath) {
    var _dataModelObjectPath$2;
    let forBindingExpression = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let forFilterConditionPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (((_dataModelObjectPath$2 = dataModelObjectPath.contextLocation) === null || _dataModelObjectPath$2 === void 0 ? void 0 : _dataModelObjectPath$2.startingEntitySet) !== dataModelObjectPath.startingEntitySet) {
      return getTargetObjectPath(dataModelObjectPath);
    }
    return _getContextRelativeTargetObjectPath(dataModelObjectPath, forBindingExpression, forFilterConditionPath);
  };
  _exports.getContextRelativeTargetObjectPath = getContextRelativeTargetObjectPath;
  const _getContextRelativeTargetObjectPath = function (dataModelObjectPath) {
    let forBindingExpression = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let forFilterConditionPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const navProperties = getPathRelativeLocation(dataModelObjectPath.contextLocation, dataModelObjectPath.navigationProperties);
    if (forBindingExpression) {
      if (navProperties.find(np => np._type === "NavigationProperty" && np.isCollection)) {
        return undefined;
      }
    }
    let path = forFilterConditionPath ? navProperties.map(navProp => {
      const isCollection = navProp._type === "NavigationProperty" && navProp.isCollection;
      return isCollection ? `${navProp.name}*` : navProp.name;
    }).join("/") : navProperties.map(navProp => navProp.name).join("/");
    if (dataModelObjectPath.targetObject && (dataModelObjectPath.targetObject.name || dataModelObjectPath.targetObject.type === "PropertyPath" && dataModelObjectPath.targetObject.value) && dataModelObjectPath.targetObject._type !== "NavigationProperty" && dataModelObjectPath.targetObject._type !== "EntityType" && dataModelObjectPath.targetObject._type !== "EntitySet" && dataModelObjectPath.targetObject !== dataModelObjectPath.startingEntitySet) {
      path = setTrailingSlash(path);
      path += dataModelObjectPath.targetObject.type === "PropertyPath" ? `${dataModelObjectPath.targetObject.value}` : `${dataModelObjectPath.targetObject.name}`;
    } else if (dataModelObjectPath.targetObject && dataModelObjectPath.targetObject.hasOwnProperty("term")) {
      path = setTrailingSlash(path);
      path += `@${dataModelObjectPath.targetObject.term}`;
      if (dataModelObjectPath.targetObject.hasOwnProperty("qualifier") && !!dataModelObjectPath.targetObject.qualifier) {
        path += `#${dataModelObjectPath.targetObject.qualifier}`;
      }
    } else if (!dataModelObjectPath.targetObject) {
      return undefined;
    }
    return path;
  };
  const isPathUpdatable = function (dataModelObjectPath, extractionParametersOnPath) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      var _annotationObject$Upd;
      return annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Upd = annotationObject.UpdateRestrictions) === null || _annotationObject$Upd === void 0 ? void 0 : _annotationObject$Upd.Updatable;
    }, extractionParametersOnPath);
  };
  _exports.isPathUpdatable = isPathUpdatable;
  const isPathSearchable = function (dataModelObjectPath, extractionParametersOnPath) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      var _annotationObject$Sea;
      return annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Sea = annotationObject.SearchRestrictions) === null || _annotationObject$Sea === void 0 ? void 0 : _annotationObject$Sea.Searchable;
    }, extractionParametersOnPath);
  };
  _exports.isPathSearchable = isPathSearchable;
  const isPathDeletable = function (dataModelObjectPath, extractionParametersOnPath) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      var _annotationObject$Del;
      return annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Del = annotationObject.DeleteRestrictions) === null || _annotationObject$Del === void 0 ? void 0 : _annotationObject$Del.Deletable;
    }, extractionParametersOnPath);
  };
  _exports.isPathDeletable = isPathDeletable;
  const isPathInsertable = function (dataModelObjectPath, extractionParametersOnPath) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      var _annotationObject$Ins;
      return annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Ins = annotationObject.InsertRestrictions) === null || _annotationObject$Ins === void 0 ? void 0 : _annotationObject$Ins.Insertable;
    }, extractionParametersOnPath);
  };
  _exports.isPathInsertable = isPathInsertable;
  const checkFilterExpressionRestrictions = function (dataModelObjectPath, allowedExpression) {
    return checkOnPath(dataModelObjectPath, annotationObject => {
      if (annotationObject && "FilterRestrictions" in annotationObject) {
        var _annotationObject$Fil;
        const filterExpressionRestrictions = (annotationObject === null || annotationObject === void 0 ? void 0 : (_annotationObject$Fil = annotationObject.FilterRestrictions) === null || _annotationObject$Fil === void 0 ? void 0 : _annotationObject$Fil.FilterExpressionRestrictions) || [];
        const currentObjectRestriction = filterExpressionRestrictions.find(restriction => {
          return restriction.Property.$target === dataModelObjectPath.targetObject;
        });
        if (currentObjectRestriction) {
          var _currentObjectRestric;
          return allowedExpression.indexOf(currentObjectRestriction === null || currentObjectRestriction === void 0 ? void 0 : (_currentObjectRestric = currentObjectRestriction.AllowedExpressions) === null || _currentObjectRestric === void 0 ? void 0 : _currentObjectRestric.toString()) !== -1;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  };
  _exports.checkFilterExpressionRestrictions = checkFilterExpressionRestrictions;
  const checkOnPath = function (dataModelObjectPath, checkFunction, extractionParametersOnPath) {
    if (!dataModelObjectPath || !dataModelObjectPath.startingEntitySet) {
      return constant(true);
    }
    dataModelObjectPath = enhanceDataModelPath(dataModelObjectPath, extractionParametersOnPath === null || extractionParametersOnPath === void 0 ? void 0 : extractionParametersOnPath.propertyPath);
    let currentEntitySet = dataModelObjectPath.startingEntitySet;
    let parentEntitySet = null;
    let visitedNavigationPropsName = [];
    const allVisitedNavigationProps = [];
    let targetEntitySet = currentEntitySet;
    const targetEntityType = dataModelObjectPath.targetEntityType;
    let resetVisitedNavProps = false;
    dataModelObjectPath.navigationProperties.forEach(navigationProperty => {
      if (resetVisitedNavProps) {
        visitedNavigationPropsName = [];
      }
      visitedNavigationPropsName.push(navigationProperty.name);
      allVisitedNavigationProps.push(navigationProperty);
      if (navigationProperty._type === "Property" || !navigationProperty.containsTarget) {
        // We should have a navigationPropertyBinding associated with the path so far which can consist of ([ContainmentNavProp]/)*[NavProp]
        const fullNavigationPath = visitedNavigationPropsName.join("/");
        if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(fullNavigationPath)) {
          parentEntitySet = currentEntitySet;
          currentEntitySet = currentEntitySet.navigationPropertyBinding[fullNavigationPath];
          targetEntitySet = currentEntitySet;
          // If we reached a navigation property with a navigationpropertybinding, we need to reset the visited path on the next iteration (if there is one)
          resetVisitedNavProps = true;
        } else {
          // We really should not end up here but at least let's try to avoid incorrect behavior
          parentEntitySet = currentEntitySet;
          currentEntitySet = null;
          resetVisitedNavProps = true;
        }
      } else {
        parentEntitySet = currentEntitySet;
        targetEntitySet = null;
      }
    });

    // At this point we have navigated down all the nav prop and we should have
    // The target entitySet pointing to either null (in case of containment navprop a last part), or the actual target (non containment as target)
    // The parent entitySet pointing to the previous entitySet used in the path
    // VisitedNavigationPath should contain the path up to this property

    // Restrictions should then be evaluated as ParentEntitySet.NavRestrictions[NavPropertyPath] || TargetEntitySet.Restrictions
    const fullNavigationPath = visitedNavigationPropsName.join("/");
    let restrictions, visitedNavProps;
    if (parentEntitySet !== null) {
      var _parentEntitySet$anno, _parentEntitySet$anno2, _parentEntitySet$anno3;
      const _parentEntitySet = parentEntitySet;
      (_parentEntitySet$anno = _parentEntitySet.annotations) === null || _parentEntitySet$anno === void 0 ? void 0 : (_parentEntitySet$anno2 = _parentEntitySet$anno.Capabilities) === null || _parentEntitySet$anno2 === void 0 ? void 0 : (_parentEntitySet$anno3 = _parentEntitySet$anno2.NavigationRestrictions) === null || _parentEntitySet$anno3 === void 0 ? void 0 : _parentEntitySet$anno3.RestrictedProperties.forEach(restrictedNavProp => {
        var _restrictedNavProp$Na;
        if (((_restrictedNavProp$Na = restrictedNavProp.NavigationProperty) === null || _restrictedNavProp$Na === void 0 ? void 0 : _restrictedNavProp$Na.type) === "NavigationPropertyPath") {
          const restrictionDefinition = checkFunction(restrictedNavProp);
          if (fullNavigationPath === restrictedNavProp.NavigationProperty.value && restrictionDefinition !== undefined) {
            var _dataModelObjectPath;
            const _allVisitedNavigationProps = allVisitedNavigationProps.slice(0, -1);
            visitedNavProps = _allVisitedNavigationProps;
            const pathRelativeLocation = getPathRelativeLocation((_dataModelObjectPath = dataModelObjectPath) === null || _dataModelObjectPath === void 0 ? void 0 : _dataModelObjectPath.contextLocation, visitedNavProps).map(np => np.name);
            const pathVisitorFunction = extractionParametersOnPath !== null && extractionParametersOnPath !== void 0 && extractionParametersOnPath.pathVisitor ? getPathVisitorForSingleton(extractionParametersOnPath.pathVisitor, pathRelativeLocation) : undefined; // send pathVisitor function only when it is defined and only send function or defined as a parameter
            restrictions = equal(getExpressionFromAnnotation(restrictionDefinition, pathRelativeLocation, undefined, pathVisitorFunction), true);
          }
        }
      });
    }
    let targetRestrictions;
    if (!(extractionParametersOnPath !== null && extractionParametersOnPath !== void 0 && extractionParametersOnPath.ignoreTargetCollection)) {
      var _targetEntitySet, _targetEntitySet$anno;
      let restrictionDefinition = checkFunction((_targetEntitySet = targetEntitySet) === null || _targetEntitySet === void 0 ? void 0 : (_targetEntitySet$anno = _targetEntitySet.annotations) === null || _targetEntitySet$anno === void 0 ? void 0 : _targetEntitySet$anno.Capabilities);
      if (targetEntitySet === null && restrictionDefinition === undefined) {
        var _targetEntityType$ann;
        restrictionDefinition = checkFunction(targetEntityType === null || targetEntityType === void 0 ? void 0 : (_targetEntityType$ann = targetEntityType.annotations) === null || _targetEntityType$ann === void 0 ? void 0 : _targetEntityType$ann.Capabilities);
      }
      if (restrictionDefinition !== undefined) {
        const pathRelativeLocation = getPathRelativeLocation(dataModelObjectPath.contextLocation, allVisitedNavigationProps).map(np => np.name);
        const pathVisitorFunction = extractionParametersOnPath !== null && extractionParametersOnPath !== void 0 && extractionParametersOnPath.pathVisitor ? getPathVisitorForSingleton(extractionParametersOnPath.pathVisitor, pathRelativeLocation) : undefined;
        targetRestrictions = equal(getExpressionFromAnnotation(restrictionDefinition, pathRelativeLocation, undefined, pathVisitorFunction), true);
      }
    }
    return restrictions || targetRestrictions || (extractionParametersOnPath !== null && extractionParametersOnPath !== void 0 && extractionParametersOnPath.authorizeUnresolvable ? unresolvableExpression : constant(true));
  };

  /**
   * Set a trailing slash to a path if not already set.
   *
   * @param path The path
   * @returns The path with a trailing slash
   */
  _exports.checkOnPath = checkOnPath;
  const setTrailingSlash = function (path) {
    if (path.length && !path.endsWith("/")) {
      return `${path}/`;
    }
    return path;
  };

  // This helper method is used to add relative path location argument to singletonPathVisitorFunction i.e. pathVisitor
  // pathVisitor method is used later to get the correct bindings for singleton entity
  // method is invoked later in pathInModel() method to get the correct binding.
  const getPathVisitorForSingleton = function (pathVisitor, pathRelativeLocation) {
    return function (path) {
      return pathVisitor(path, pathRelativeLocation);
    };
  };
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRSZWxhdGl2ZVBhdGhzIiwiY29udGV4dFBhdGgiLCJnZXRQYXRoUmVsYXRpdmVMb2NhdGlvbiIsImNvbnRleHRMb2NhdGlvbiIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibWFwIiwibnAiLCJuYW1lIiwidmlzaXRlZE5hdlByb3BzIiwibGVuZ3RoIiwicmVtYWluaW5nTmF2UHJvcHMiLCJmb3JFYWNoIiwibmF2UHJvcCIsIm5hdkluZGV4IiwicHVzaCIsImNvbmNhdCIsInNsaWNlIiwiY3VycmVudElkeCIsImN1cnJlbnROYXYiLCJuZXh0TmF2UHJvcCIsIl90eXBlIiwicGFydG5lciIsInNwbGljZSIsImV4dHJhTmF2UHJvcCIsInRhcmdldFR5cGUiLCJmaW5kIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwicHJvcGVydHlQYXRoIiwic1Byb3BlcnR5UGF0aCIsImlzUGF0aEV4cHJlc3Npb24iLCJpc0Fubm90YXRpb25QYXRoRXhwcmVzc2lvbiIsInBhdGgiLCJvVGFyZ2V0IiwiJHRhcmdldCIsInRhcmdldEVudGl0eVR5cGUiLCJyZXNvbHZlUGF0aCIsInRhcmdldE9iamVjdCIsImFQYXRoU3BsaXQiLCJzcGxpdCIsImN1cnJlbnRFbnRpdHlTZXQiLCJ0YXJnZXRFbnRpdHlTZXQiLCJjdXJyZW50RW50aXR5VHlwZSIsInJlZHVjZWRFbnRpdHlUeXBlIiwicGF0aFBhcnQiLCJwb3RlbnRpYWxOYXZQcm9wIiwibmF2aWdhdGlvblByb3BlcnR5QmluZGluZyIsImhhc093blByb3BlcnR5IiwicG90ZW50aWFsQ29tcGxleFR5cGUiLCJlbnRpdHlQcm9wZXJ0aWVzIiwidW5kZWZpbmVkIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJjb252ZXJ0ZWRUeXBlcyIsImdldFRhcmdldEVudGl0eVNldFBhdGgiLCJ0YXJnZXRFbnRpdHlTZXRQYXRoIiwibmF2aWdhdGVkUGF0aHMiLCJqb2luIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsImJSZWxhdGl2ZSIsInNldFRyYWlsaW5nU2xhc2giLCJ0ZXJtIiwicXVhbGlmaWVyIiwiZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCIsImZvckJpbmRpbmdFeHByZXNzaW9uIiwiZm9yRmlsdGVyQ29uZGl0aW9uUGF0aCIsIl9nZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwibmF2UHJvcGVydGllcyIsImlzQ29sbGVjdGlvbiIsInR5cGUiLCJ2YWx1ZSIsImlzUGF0aFVwZGF0YWJsZSIsImV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoIiwiY2hlY2tPblBhdGgiLCJhbm5vdGF0aW9uT2JqZWN0IiwiVXBkYXRlUmVzdHJpY3Rpb25zIiwiVXBkYXRhYmxlIiwiaXNQYXRoU2VhcmNoYWJsZSIsIlNlYXJjaFJlc3RyaWN0aW9ucyIsIlNlYXJjaGFibGUiLCJpc1BhdGhEZWxldGFibGUiLCJEZWxldGVSZXN0cmljdGlvbnMiLCJEZWxldGFibGUiLCJpc1BhdGhJbnNlcnRhYmxlIiwiSW5zZXJ0UmVzdHJpY3Rpb25zIiwiSW5zZXJ0YWJsZSIsImNoZWNrRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyIsImFsbG93ZWRFeHByZXNzaW9uIiwiZmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyIsIkZpbHRlclJlc3RyaWN0aW9ucyIsIkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMiLCJjdXJyZW50T2JqZWN0UmVzdHJpY3Rpb24iLCJyZXN0cmljdGlvbiIsIlByb3BlcnR5IiwiaW5kZXhPZiIsIkFsbG93ZWRFeHByZXNzaW9ucyIsInRvU3RyaW5nIiwiY2hlY2tGdW5jdGlvbiIsImNvbnN0YW50IiwicGFyZW50RW50aXR5U2V0IiwidmlzaXRlZE5hdmlnYXRpb25Qcm9wc05hbWUiLCJhbGxWaXNpdGVkTmF2aWdhdGlvblByb3BzIiwicmVzZXRWaXNpdGVkTmF2UHJvcHMiLCJuYXZpZ2F0aW9uUHJvcGVydHkiLCJjb250YWluc1RhcmdldCIsImZ1bGxOYXZpZ2F0aW9uUGF0aCIsInJlc3RyaWN0aW9ucyIsIl9wYXJlbnRFbnRpdHlTZXQiLCJhbm5vdGF0aW9ucyIsIkNhcGFiaWxpdGllcyIsIk5hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJSZXN0cmljdGVkUHJvcGVydGllcyIsInJlc3RyaWN0ZWROYXZQcm9wIiwiTmF2aWdhdGlvblByb3BlcnR5IiwicmVzdHJpY3Rpb25EZWZpbml0aW9uIiwiX2FsbFZpc2l0ZWROYXZpZ2F0aW9uUHJvcHMiLCJwYXRoUmVsYXRpdmVMb2NhdGlvbiIsInBhdGhWaXNpdG9yRnVuY3Rpb24iLCJwYXRoVmlzaXRvciIsImdldFBhdGhWaXNpdG9yRm9yU2luZ2xldG9uIiwiZXF1YWwiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJ0YXJnZXRSZXN0cmljdGlvbnMiLCJpZ25vcmVUYXJnZXRDb2xsZWN0aW9uIiwiYXV0aG9yaXplVW5yZXNvbHZhYmxlIiwidW5yZXNvbHZhYmxlRXhwcmVzc2lvbiIsImVuZHNXaXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJEYXRhTW9kZWxQYXRoSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0Q29udmVydGVkTWV0YWRhdGEsXG5cdEVudGl0eVNldCxcblx0RW50aXR5VHlwZSxcblx0TmF2aWdhdGlvblByb3BlcnR5LFxuXHRQcm9wZXJ0eSxcblx0UHJvcGVydHlQYXRoLFxuXHRTaW5nbGV0b25cbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvblR5cGVUeXBlcyxcblx0TmF2aWdhdGlvblByb3BlcnR5UmVzdHJpY3Rpb24sXG5cdE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uVHlwZXNcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9DYXBhYmlsaXRpZXNcIjtcbmltcG9ydCB0eXBlIHtcblx0RW50aXR5U2V0QW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzLFxuXHRFbnRpdHlUeXBlQW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ2FwYWJpbGl0aWVzX0VkbVwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY29uc3RhbnQsIGVxdWFsLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sIHVucmVzb2x2YWJsZUV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eU9yUGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0Rpc3BsYXlNb2RlRm9ybWF0dGVyXCI7XG5pbXBvcnQgeyBpc0Fubm90YXRpb25QYXRoRXhwcmVzc2lvbiwgaXNQYXRoRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5cbmV4cG9ydCB0eXBlIERhdGFNb2RlbE9iamVjdFBhdGggPSB7XG5cdHN0YXJ0aW5nRW50aXR5U2V0OiBTaW5nbGV0b24gfCBFbnRpdHlTZXQ7XG5cdGNvbnRleHRMb2NhdGlvbj86IERhdGFNb2RlbE9iamVjdFBhdGg7XG5cdG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiAoTmF2aWdhdGlvblByb3BlcnR5IHwgUHJvcGVydHkpW107XG5cdHRhcmdldEVudGl0eVNldD86IFNpbmdsZXRvbiB8IEVudGl0eVNldDtcblx0dGFyZ2V0RW50aXR5VHlwZTogRW50aXR5VHlwZTtcblx0dGFyZ2V0T2JqZWN0OiBhbnk7XG5cdGNvbnZlcnRlZFR5cGVzOiBDb252ZXJ0ZWRNZXRhZGF0YTtcbn07XG5cbnR5cGUgRXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGggPSB7XG5cdHByb3BlcnR5UGF0aD86IFByb3BlcnR5T3JQYXRoPFByb3BlcnR5Pjtcblx0cGF0aFZpc2l0b3I/OiBGdW5jdGlvbjtcblx0aWdub3JlVGFyZ2V0Q29sbGVjdGlvbj86IGJvb2xlYW47XG5cdGF1dGhvcml6ZVVucmVzb2x2YWJsZT86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgcmVsYXRpdmUgcGF0aCB0byB0aGUgcHJvcGVydHkgZnJvbSB0aGUgRGF0YU1vZGVsT2JqZWN0UGF0aC5cbiAqXG4gKiBAcGFyYW0gY29udGV4dFBhdGggVGhlIERhdGFNb2RlbE9iamVjdFBhdGggb2JqZWN0IHRvIHRoZSBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIHBhdGggZnJvbSB0aGUgcm9vdCBlbnRpdHkgc2V0LlxuICovXG5leHBvcnQgY29uc3QgZ2V0UmVsYXRpdmVQYXRocyA9IGZ1bmN0aW9uIChjb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRyZXR1cm4gZ2V0UGF0aFJlbGF0aXZlTG9jYXRpb24oY29udGV4dFBhdGg/LmNvbnRleHRMb2NhdGlvbiwgY29udGV4dFBhdGg/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzKS5tYXAoKG5wKSA9PiBucC5uYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRQYXRoUmVsYXRpdmVMb2NhdGlvbiA9IGZ1bmN0aW9uIChcblx0Y29udGV4dFBhdGg/OiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHR2aXNpdGVkTmF2UHJvcHM6IChOYXZpZ2F0aW9uUHJvcGVydHkgfCBQcm9wZXJ0eSlbXSA9IFtdXG4pOiAoTmF2aWdhdGlvblByb3BlcnR5IHwgUHJvcGVydHkpW10ge1xuXHRpZiAoIWNvbnRleHRQYXRoKSB7XG5cdFx0cmV0dXJuIHZpc2l0ZWROYXZQcm9wcztcblx0fSBlbHNlIGlmICh2aXNpdGVkTmF2UHJvcHMubGVuZ3RoID49IGNvbnRleHRQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmxlbmd0aCkge1xuXHRcdGxldCByZW1haW5pbmdOYXZQcm9wczogKE5hdmlnYXRpb25Qcm9wZXJ0eSB8IFByb3BlcnR5KVtdID0gW107XG5cdFx0Y29udGV4dFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMuZm9yRWFjaCgobmF2UHJvcCwgbmF2SW5kZXgpID0+IHtcblx0XHRcdGlmICh2aXNpdGVkTmF2UHJvcHNbbmF2SW5kZXhdICE9PSBuYXZQcm9wKSB7XG5cdFx0XHRcdHJlbWFpbmluZ05hdlByb3BzLnB1c2godmlzaXRlZE5hdlByb3BzW25hdkluZGV4XSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmVtYWluaW5nTmF2UHJvcHMgPSByZW1haW5pbmdOYXZQcm9wcy5jb25jYXQodmlzaXRlZE5hdlByb3BzLnNsaWNlKGNvbnRleHRQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmxlbmd0aCkpO1xuXHRcdC8vIENsZWFuIHVwIE5hdlByb3AgLT4gT3duZXJcblx0XHRsZXQgY3VycmVudElkeCA9IDA7XG5cdFx0d2hpbGUgKHJlbWFpbmluZ05hdlByb3BzLmxlbmd0aCA+IDEgJiYgY3VycmVudElkeCAhPSByZW1haW5pbmdOYXZQcm9wcy5sZW5ndGggLSAxKSB7XG5cdFx0XHRjb25zdCBjdXJyZW50TmF2ID0gcmVtYWluaW5nTmF2UHJvcHNbY3VycmVudElkeF07XG5cdFx0XHRjb25zdCBuZXh0TmF2UHJvcCA9IHJlbWFpbmluZ05hdlByb3BzW2N1cnJlbnRJZHggKyAxXTtcblx0XHRcdGlmIChjdXJyZW50TmF2Ll90eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIGN1cnJlbnROYXYucGFydG5lciA9PT0gbmV4dE5hdlByb3AubmFtZSkge1xuXHRcdFx0XHRyZW1haW5pbmdOYXZQcm9wcy5zcGxpY2UoMCwgMik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXJyZW50SWR4Kys7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZW1haW5pbmdOYXZQcm9wcztcblx0fSBlbHNlIHtcblx0XHRsZXQgZXh0cmFOYXZQcm9wOiAoTmF2aWdhdGlvblByb3BlcnR5IHwgUHJvcGVydHkpW10gPSBbXTtcblx0XHR2aXNpdGVkTmF2UHJvcHMuZm9yRWFjaCgobmF2UHJvcCwgbmF2SW5kZXgpID0+IHtcblx0XHRcdGlmIChjb250ZXh0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllc1tuYXZJbmRleF0gIT09IG5hdlByb3ApIHtcblx0XHRcdFx0ZXh0cmFOYXZQcm9wLnB1c2godmlzaXRlZE5hdlByb3BzW25hdkluZGV4XSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0ZXh0cmFOYXZQcm9wID0gZXh0cmFOYXZQcm9wLmNvbmNhdChjb250ZXh0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5zbGljZSh2aXNpdGVkTmF2UHJvcHMubGVuZ3RoKSk7XG5cdFx0Ly8gQ2xlYW4gdXAgTmF2UHJvcCAtPiBPd25lclxuXHRcdGxldCBjdXJyZW50SWR4ID0gMDtcblx0XHR3aGlsZSAoZXh0cmFOYXZQcm9wLmxlbmd0aCA+IDEgJiYgY3VycmVudElkeCAhPSBleHRyYU5hdlByb3AubGVuZ3RoIC0gMSkge1xuXHRcdFx0Y29uc3QgY3VycmVudE5hdiA9IGV4dHJhTmF2UHJvcFtjdXJyZW50SWR4XTtcblx0XHRcdGNvbnN0IG5leHROYXZQcm9wID0gZXh0cmFOYXZQcm9wW2N1cnJlbnRJZHggKyAxXTtcblx0XHRcdGlmIChjdXJyZW50TmF2Ll90eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIGN1cnJlbnROYXYucGFydG5lciA9PT0gbmV4dE5hdlByb3AubmFtZSkge1xuXHRcdFx0XHRleHRyYU5hdlByb3Auc3BsaWNlKDAsIDIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3VycmVudElkeCsrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRleHRyYU5hdlByb3AgPSBleHRyYU5hdlByb3AubWFwKChuYXZQcm9wKSA9PiB7XG5cdFx0XHRyZXR1cm4gbmF2UHJvcC5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIlxuXHRcdFx0XHQ/IChuYXZQcm9wLnRhcmdldFR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMuZmluZCgobnApID0+IG5wLm5hbWUgPT09IG5hdlByb3AucGFydG5lcikgYXMgTmF2aWdhdGlvblByb3BlcnR5KVxuXHRcdFx0XHQ6IG5hdlByb3A7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGV4dHJhTmF2UHJvcDtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGVuaGFuY2VEYXRhTW9kZWxQYXRoID0gZnVuY3Rpb24gKFxuXHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRwcm9wZXJ0eVBhdGg/OiBQcm9wZXJ0eU9yUGF0aDxQcm9wZXJ0eT5cbik6IERhdGFNb2RlbE9iamVjdFBhdGgge1xuXHRsZXQgc1Byb3BlcnR5UGF0aDogc3RyaW5nID0gXCJcIjtcblx0aWYgKChpc1BhdGhFeHByZXNzaW9uKHByb3BlcnR5UGF0aCkgfHwgaXNBbm5vdGF0aW9uUGF0aEV4cHJlc3Npb24ocHJvcGVydHlQYXRoKSkgJiYgcHJvcGVydHlQYXRoLnBhdGgpIHtcblx0XHRzUHJvcGVydHlQYXRoID0gcHJvcGVydHlQYXRoLnBhdGg7XG5cdH0gZWxzZSBpZiAodHlwZW9mIHByb3BlcnR5UGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdHNQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eVBhdGg7XG5cdH1cblx0bGV0IG9UYXJnZXQ7XG5cdGlmIChpc1BhdGhFeHByZXNzaW9uKHByb3BlcnR5UGF0aCkgfHwgaXNBbm5vdGF0aW9uUGF0aEV4cHJlc3Npb24ocHJvcGVydHlQYXRoKSkge1xuXHRcdG9UYXJnZXQgPSBwcm9wZXJ0eVBhdGguJHRhcmdldDtcblx0fSBlbHNlIGlmIChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVR5cGUpIHtcblx0XHRvVGFyZ2V0ID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLnJlc29sdmVQYXRoKHNQcm9wZXJ0eVBhdGgpO1xuXHR9IGVsc2Uge1xuXHRcdG9UYXJnZXQgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdDtcblx0fVxuXHRjb25zdCBhUGF0aFNwbGl0ID0gc1Byb3BlcnR5UGF0aC5zcGxpdChcIi9cIik7XG5cdGxldCBjdXJyZW50RW50aXR5U2V0ID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlTZXQ7XG5cdGxldCBjdXJyZW50RW50aXR5VHlwZSA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZTtcblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXMgPSBkYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmNvbmNhdCgpO1xuXHQvLyBQcm9jZXNzIG9ubHkgaWYgd2UgaGF2ZSB0byBnbyB0aHJvdWdoIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXG5cdGxldCByZWR1Y2VkRW50aXR5VHlwZTogRW50aXR5VHlwZSB8IHVuZGVmaW5lZCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZTtcblx0YVBhdGhTcGxpdC5mb3JFYWNoKChwYXRoUGFydDogc3RyaW5nKSA9PiB7XG5cdFx0aWYgKCFyZWR1Y2VkRW50aXR5VHlwZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBwb3RlbnRpYWxOYXZQcm9wID0gcmVkdWNlZEVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMuZmluZCgobmF2UHJvcCkgPT4gbmF2UHJvcC5uYW1lID09PSBwYXRoUGFydCk7XG5cdFx0aWYgKHBvdGVudGlhbE5hdlByb3ApIHtcblx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2gocG90ZW50aWFsTmF2UHJvcCk7XG5cdFx0XHRjdXJyZW50RW50aXR5VHlwZSA9IHBvdGVudGlhbE5hdlByb3AudGFyZ2V0VHlwZTtcblx0XHRcdGlmIChjdXJyZW50RW50aXR5U2V0ICYmIGN1cnJlbnRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZy5oYXNPd25Qcm9wZXJ0eShwYXRoUGFydCkpIHtcblx0XHRcdFx0Y3VycmVudEVudGl0eVNldCA9IGN1cnJlbnRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1twYXRoUGFydF0gYXMgRW50aXR5U2V0O1xuXHRcdFx0fVxuXHRcdFx0cmVkdWNlZEVudGl0eVR5cGUgPSBjdXJyZW50RW50aXR5VHlwZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgcG90ZW50aWFsQ29tcGxleFR5cGUgPSByZWR1Y2VkRW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLmZpbmQoKG5hdlByb3ApID0+IG5hdlByb3AubmFtZSA9PT0gcGF0aFBhcnQpO1xuXHRcdFx0aWYgKHBvdGVudGlhbENvbXBsZXhUeXBlPy50YXJnZXRUeXBlKSB7XG5cdFx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2gocG90ZW50aWFsQ29tcGxleFR5cGUpO1xuXHRcdFx0XHRyZWR1Y2VkRW50aXR5VHlwZSA9IGN1cnJlbnRFbnRpdHlUeXBlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVkdWNlZEVudGl0eVR5cGUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHN0YXJ0aW5nRW50aXR5U2V0OiBkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0LFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiBuYXZpZ2F0aW9uUHJvcGVydGllcyxcblx0XHRjb250ZXh0TG9jYXRpb246IGRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uLFxuXHRcdHRhcmdldEVudGl0eVNldDogY3VycmVudEVudGl0eVNldCxcblx0XHR0YXJnZXRFbnRpdHlUeXBlOiBjdXJyZW50RW50aXR5VHlwZSxcblx0XHR0YXJnZXRPYmplY3Q6IG9UYXJnZXQsXG5cdFx0Y29udmVydGVkVHlwZXM6IGRhdGFNb2RlbE9iamVjdFBhdGguY29udmVydGVkVHlwZXNcblx0fTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRUYXJnZXRFbnRpdHlTZXRQYXRoID0gZnVuY3Rpb24gKGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBzdHJpbmcge1xuXHRsZXQgdGFyZ2V0RW50aXR5U2V0UGF0aDogc3RyaW5nID0gYC8ke2RhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZX1gO1xuXHRsZXQgY3VycmVudEVudGl0eVNldCA9IGRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQ7XG5cdGxldCBuYXZpZ2F0ZWRQYXRoczogc3RyaW5nW10gPSBbXTtcblx0ZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5mb3JFYWNoKChuYXZQcm9wKSA9PiB7XG5cdFx0bmF2aWdhdGVkUGF0aHMucHVzaChuYXZQcm9wLm5hbWUpO1xuXHRcdGlmIChjdXJyZW50RW50aXR5U2V0ICYmIGN1cnJlbnRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZy5oYXNPd25Qcm9wZXJ0eShuYXZpZ2F0ZWRQYXRocy5qb2luKFwiL1wiKSkpIHtcblx0XHRcdHRhcmdldEVudGl0eVNldFBhdGggKz0gYC8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy8ke25hdmlnYXRlZFBhdGhzLmpvaW4oXCIvXCIpfS8kYDtcblx0XHRcdGN1cnJlbnRFbnRpdHlTZXQgPSBjdXJyZW50RW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdbbmF2aWdhdGVkUGF0aHMuam9pbihcIi9cIildIGFzIEVudGl0eVNldDtcblx0XHRcdG5hdmlnYXRlZFBhdGhzID0gW107XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHRhcmdldEVudGl0eVNldFBhdGg7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0VGFyZ2V0T2JqZWN0UGF0aCA9IGZ1bmN0aW9uIChkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLCBiUmVsYXRpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG5cdGxldCBwYXRoID0gXCJcIjtcblx0aWYgKCFkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0KSB7XG5cdFx0cmV0dXJuIFwiL1wiO1xuXHR9XG5cdGlmICghYlJlbGF0aXZlKSB7XG5cdFx0cGF0aCArPSBgLyR7ZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lfWA7XG5cdH1cblx0aWYgKGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuXHRcdHBhdGggPSBzZXRUcmFpbGluZ1NsYXNoKHBhdGgpO1xuXHRcdHBhdGggKz0gZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5tYXAoKG5hdlByb3ApID0+IG5hdlByb3AubmFtZSkuam9pbihcIi9cIik7XG5cdH1cblxuXHRpZiAoXG5cdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/Lm5hbWUgJiZcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5fdHlwZSAhPT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiAmJlxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Ll90eXBlICE9PSBcIkVudGl0eVR5cGVcIiAmJlxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Ll90eXBlICE9PSBcIkVudGl0eVNldFwiICYmXG5cdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgIT09IGRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXRcblx0KSB7XG5cdFx0cGF0aCA9IHNldFRyYWlsaW5nU2xhc2gocGF0aCk7XG5cdFx0cGF0aCArPSBgJHtkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5uYW1lfWA7XG5cdH0gZWxzZSBpZiAoZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgJiYgZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuaGFzT3duUHJvcGVydHkoXCJ0ZXJtXCIpKSB7XG5cdFx0cGF0aCA9IHNldFRyYWlsaW5nU2xhc2gocGF0aCk7XG5cdFx0cGF0aCArPSBgQCR7ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybX1gO1xuXHRcdGlmIChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5oYXNPd25Qcm9wZXJ0eShcInF1YWxpZmllclwiKSAmJiAhIWRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnF1YWxpZmllcikge1xuXHRcdFx0cGF0aCArPSBgIyR7ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QucXVhbGlmaWVyfWA7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBwYXRoO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGggPSBmdW5jdGlvbiAoXG5cdGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdGZvckJpbmRpbmdFeHByZXNzaW9uOiBib29sZWFuID0gZmFsc2UsXG5cdGZvckZpbHRlckNvbmRpdGlvblBhdGg6IGJvb2xlYW4gPSBmYWxzZVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKGRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uPy5zdGFydGluZ0VudGl0eVNldCAhPT0gZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldCkge1xuXHRcdHJldHVybiBnZXRUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHR9XG5cdHJldHVybiBfZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChkYXRhTW9kZWxPYmplY3RQYXRoLCBmb3JCaW5kaW5nRXhwcmVzc2lvbiwgZm9yRmlsdGVyQ29uZGl0aW9uUGF0aCk7XG59O1xuXG5jb25zdCBfZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCA9IGZ1bmN0aW9uIChcblx0ZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0Zm9yQmluZGluZ0V4cHJlc3Npb246IGJvb2xlYW4gPSBmYWxzZSxcblx0Zm9yRmlsdGVyQ29uZGl0aW9uUGF0aDogYm9vbGVhbiA9IGZhbHNlXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBuYXZQcm9wZXJ0aWVzID0gZ2V0UGF0aFJlbGF0aXZlTG9jYXRpb24oZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24sIGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMpO1xuXHRpZiAoZm9yQmluZGluZ0V4cHJlc3Npb24pIHtcblx0XHRpZiAobmF2UHJvcGVydGllcy5maW5kKChucCkgPT4gbnAuX3R5cGUgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIgJiYgbnAuaXNDb2xsZWN0aW9uKSkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblx0bGV0IHBhdGggPSBmb3JGaWx0ZXJDb25kaXRpb25QYXRoXG5cdFx0PyBuYXZQcm9wZXJ0aWVzXG5cdFx0XHRcdC5tYXAoKG5hdlByb3ApID0+IHtcblx0XHRcdFx0XHRjb25zdCBpc0NvbGxlY3Rpb24gPSBuYXZQcm9wLl90eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIG5hdlByb3AuaXNDb2xsZWN0aW9uO1xuXHRcdFx0XHRcdHJldHVybiBpc0NvbGxlY3Rpb24gPyBgJHtuYXZQcm9wLm5hbWV9KmAgOiBuYXZQcm9wLm5hbWU7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5qb2luKFwiL1wiKVxuXHRcdDogbmF2UHJvcGVydGllcy5tYXAoKG5hdlByb3ApID0+IG5hdlByb3AubmFtZSkuam9pbihcIi9cIik7XG5cblx0aWYgKFxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0ICYmXG5cdFx0KGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Lm5hbWUgfHxcblx0XHRcdChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC50eXBlID09PSBcIlByb3BlcnR5UGF0aFwiICYmIGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnZhbHVlKSkgJiZcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5fdHlwZSAhPT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiAmJlxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Ll90eXBlICE9PSBcIkVudGl0eVR5cGVcIiAmJlxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Ll90eXBlICE9PSBcIkVudGl0eVNldFwiICYmXG5cdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgIT09IGRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXRcblx0KSB7XG5cdFx0cGF0aCA9IHNldFRyYWlsaW5nU2xhc2gocGF0aCk7XG5cdFx0cGF0aCArPVxuXHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudHlwZSA9PT0gXCJQcm9wZXJ0eVBhdGhcIlxuXHRcdFx0XHQ/IGAke2RhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnZhbHVlfWBcblx0XHRcdFx0OiBgJHtkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5uYW1lfWA7XG5cdH0gZWxzZSBpZiAoZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgJiYgZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuaGFzT3duUHJvcGVydHkoXCJ0ZXJtXCIpKSB7XG5cdFx0cGF0aCA9IHNldFRyYWlsaW5nU2xhc2gocGF0aCk7XG5cdFx0cGF0aCArPSBgQCR7ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybX1gO1xuXHRcdGlmIChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5oYXNPd25Qcm9wZXJ0eShcInF1YWxpZmllclwiKSAmJiAhIWRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnF1YWxpZmllcikge1xuXHRcdFx0cGF0aCArPSBgIyR7ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QucXVhbGlmaWVyfWA7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKCFkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIHBhdGg7XG59O1xuXG5leHBvcnQgY29uc3QgaXNQYXRoVXBkYXRhYmxlID0gZnVuY3Rpb24gKFxuXHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoIHwgdW5kZWZpbmVkLFxuXHRleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aD86IEV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gY2hlY2tPblBhdGgoXG5cdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHQoYW5ub3RhdGlvbk9iamVjdDogTmF2aWdhdGlvblByb3BlcnR5UmVzdHJpY3Rpb24gfCBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXMpID0+IHtcblx0XHRcdHJldHVybiBhbm5vdGF0aW9uT2JqZWN0Py5VcGRhdGVSZXN0cmljdGlvbnM/LlVwZGF0YWJsZTtcblx0XHR9LFxuXHRcdGV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoXG5cdCk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNQYXRoU2VhcmNoYWJsZSA9IGZ1bmN0aW9uIChcblx0ZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCB8IHVuZGVmaW5lZCxcblx0ZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGg/OiBFeHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aFxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0cmV0dXJuIGNoZWNrT25QYXRoKFxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0KGFubm90YXRpb25PYmplY3Q6IE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uIHwgRW50aXR5U2V0QW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzKSA9PiB7XG5cdFx0XHRyZXR1cm4gYW5ub3RhdGlvbk9iamVjdD8uU2VhcmNoUmVzdHJpY3Rpb25zPy5TZWFyY2hhYmxlO1xuXHRcdH0sXG5cdFx0ZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGhcblx0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1BhdGhEZWxldGFibGUgPSBmdW5jdGlvbiAoXG5cdGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGggfCB1bmRlZmluZWQsXG5cdGV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoPzogRXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGhcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBjaGVja09uUGF0aChcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdChhbm5vdGF0aW9uT2JqZWN0OiBOYXZpZ2F0aW9uUHJvcGVydHlSZXN0cmljdGlvbiB8IEVudGl0eVNldEFubm90YXRpb25zX0NhcGFiaWxpdGllcykgPT4ge1xuXHRcdFx0cmV0dXJuIGFubm90YXRpb25PYmplY3Q/LkRlbGV0ZVJlc3RyaWN0aW9ucz8uRGVsZXRhYmxlO1xuXHRcdH0sXG5cdFx0ZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGhcblx0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1BhdGhJbnNlcnRhYmxlID0gZnVuY3Rpb24gKFxuXHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoIHwgdW5kZWZpbmVkLFxuXHRleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aD86IEV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gY2hlY2tPblBhdGgoXG5cdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHQoYW5ub3RhdGlvbk9iamVjdDogTmF2aWdhdGlvblByb3BlcnR5UmVzdHJpY3Rpb24gfCBFbnRpdHlTZXRBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXMpID0+IHtcblx0XHRcdHJldHVybiBhbm5vdGF0aW9uT2JqZWN0Py5JbnNlcnRSZXN0cmljdGlvbnM/Lkluc2VydGFibGU7XG5cdFx0fSxcblx0XHRleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aFxuXHQpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIChcblx0ZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0YWxsb3dlZEV4cHJlc3Npb246IChzdHJpbmcgfCB1bmRlZmluZWQpW11cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBjaGVja09uUGF0aChcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdChhbm5vdGF0aW9uT2JqZWN0OiBOYXZpZ2F0aW9uUHJvcGVydHlSZXN0cmljdGlvbiB8IEVudGl0eVNldEFubm90YXRpb25zX0NhcGFiaWxpdGllcyB8IEVudGl0eVR5cGVBbm5vdGF0aW9uc19DYXBhYmlsaXRpZXMpID0+IHtcblx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0ICYmIFwiRmlsdGVyUmVzdHJpY3Rpb25zXCIgaW4gYW5ub3RhdGlvbk9iamVjdCkge1xuXHRcdFx0XHRjb25zdCBmaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zOiBGaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlVHlwZXNbXSA9XG5cdFx0XHRcdFx0KGFubm90YXRpb25PYmplY3Q/LkZpbHRlclJlc3RyaWN0aW9ucz8uRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyBhcyBGaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlVHlwZXNbXSkgfHwgW107XG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRPYmplY3RSZXN0cmljdGlvbiA9IGZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMuZmluZCgocmVzdHJpY3Rpb24pID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gKHJlc3RyaWN0aW9uLlByb3BlcnR5IGFzIFByb3BlcnR5UGF0aCkuJHRhcmdldCA9PT0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoY3VycmVudE9iamVjdFJlc3RyaWN0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFsbG93ZWRFeHByZXNzaW9uLmluZGV4T2YoY3VycmVudE9iamVjdFJlc3RyaWN0aW9uPy5BbGxvd2VkRXhwcmVzc2lvbnM/LnRvU3RyaW5nKCkpICE9PSAtMTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hlY2tPblBhdGggPSBmdW5jdGlvbiAoXG5cdGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGggfCB1bmRlZmluZWQsXG5cdGNoZWNrRnVuY3Rpb246IEZ1bmN0aW9uLFxuXHRleHRyYWN0aW9uUGFyYW1ldGVyc09uUGF0aD86IEV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRpZiAoIWRhdGFNb2RlbE9iamVjdFBhdGggfHwgIWRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQodHJ1ZSk7XG5cdH1cblxuXHRkYXRhTW9kZWxPYmplY3RQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZGF0YU1vZGVsT2JqZWN0UGF0aCwgZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGg/LnByb3BlcnR5UGF0aCk7XG5cblx0bGV0IGN1cnJlbnRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IG51bGwgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0O1xuXHRsZXQgcGFyZW50RW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCBudWxsID0gbnVsbDtcblx0bGV0IHZpc2l0ZWROYXZpZ2F0aW9uUHJvcHNOYW1lOiBzdHJpbmdbXSA9IFtdO1xuXHRjb25zdCBhbGxWaXNpdGVkTmF2aWdhdGlvblByb3BzOiAoTmF2aWdhdGlvblByb3BlcnR5IHwgUHJvcGVydHkpW10gPSBbXTtcblx0bGV0IHRhcmdldEVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgbnVsbCA9IGN1cnJlbnRFbnRpdHlTZXQ7XG5cdGNvbnN0IHRhcmdldEVudGl0eVR5cGU6IEVudGl0eVR5cGUgfCBudWxsID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlO1xuXHRsZXQgcmVzZXRWaXNpdGVkTmF2UHJvcHMgPSBmYWxzZTtcblxuXHRkYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZvckVhY2goKG5hdmlnYXRpb25Qcm9wZXJ0eSkgPT4ge1xuXHRcdGlmIChyZXNldFZpc2l0ZWROYXZQcm9wcykge1xuXHRcdFx0dmlzaXRlZE5hdmlnYXRpb25Qcm9wc05hbWUgPSBbXTtcblx0XHR9XG5cdFx0dmlzaXRlZE5hdmlnYXRpb25Qcm9wc05hbWUucHVzaChuYXZpZ2F0aW9uUHJvcGVydHkubmFtZSk7XG5cdFx0YWxsVmlzaXRlZE5hdmlnYXRpb25Qcm9wcy5wdXNoKG5hdmlnYXRpb25Qcm9wZXJ0eSk7XG5cdFx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eS5fdHlwZSA9PT0gXCJQcm9wZXJ0eVwiIHx8ICFuYXZpZ2F0aW9uUHJvcGVydHkuY29udGFpbnNUYXJnZXQpIHtcblx0XHRcdC8vIFdlIHNob3VsZCBoYXZlIGEgbmF2aWdhdGlvblByb3BlcnR5QmluZGluZyBhc3NvY2lhdGVkIHdpdGggdGhlIHBhdGggc28gZmFyIHdoaWNoIGNhbiBjb25zaXN0IG9mIChbQ29udGFpbm1lbnROYXZQcm9wXS8pKltOYXZQcm9wXVxuXHRcdFx0Y29uc3QgZnVsbE5hdmlnYXRpb25QYXRoID0gdmlzaXRlZE5hdmlnYXRpb25Qcm9wc05hbWUuam9pbihcIi9cIik7XG5cdFx0XHRpZiAoY3VycmVudEVudGl0eVNldCAmJiBjdXJyZW50RW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcuaGFzT3duUHJvcGVydHkoZnVsbE5hdmlnYXRpb25QYXRoKSkge1xuXHRcdFx0XHRwYXJlbnRFbnRpdHlTZXQgPSBjdXJyZW50RW50aXR5U2V0O1xuXHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gY3VycmVudEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW2Z1bGxOYXZpZ2F0aW9uUGF0aF07XG5cdFx0XHRcdHRhcmdldEVudGl0eVNldCA9IGN1cnJlbnRFbnRpdHlTZXQ7XG5cdFx0XHRcdC8vIElmIHdlIHJlYWNoZWQgYSBuYXZpZ2F0aW9uIHByb3BlcnR5IHdpdGggYSBuYXZpZ2F0aW9ucHJvcGVydHliaW5kaW5nLCB3ZSBuZWVkIHRvIHJlc2V0IHRoZSB2aXNpdGVkIHBhdGggb24gdGhlIG5leHQgaXRlcmF0aW9uIChpZiB0aGVyZSBpcyBvbmUpXG5cdFx0XHRcdHJlc2V0VmlzaXRlZE5hdlByb3BzID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIFdlIHJlYWxseSBzaG91bGQgbm90IGVuZCB1cCBoZXJlIGJ1dCBhdCBsZWFzdCBsZXQncyB0cnkgdG8gYXZvaWQgaW5jb3JyZWN0IGJlaGF2aW9yXG5cdFx0XHRcdHBhcmVudEVudGl0eVNldCA9IGN1cnJlbnRFbnRpdHlTZXQ7XG5cdFx0XHRcdGN1cnJlbnRFbnRpdHlTZXQgPSBudWxsO1xuXHRcdFx0XHRyZXNldFZpc2l0ZWROYXZQcm9wcyA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhcmVudEVudGl0eVNldCA9IGN1cnJlbnRFbnRpdHlTZXQ7XG5cdFx0XHR0YXJnZXRFbnRpdHlTZXQgPSBudWxsO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gQXQgdGhpcyBwb2ludCB3ZSBoYXZlIG5hdmlnYXRlZCBkb3duIGFsbCB0aGUgbmF2IHByb3AgYW5kIHdlIHNob3VsZCBoYXZlXG5cdC8vIFRoZSB0YXJnZXQgZW50aXR5U2V0IHBvaW50aW5nIHRvIGVpdGhlciBudWxsIChpbiBjYXNlIG9mIGNvbnRhaW5tZW50IG5hdnByb3AgYSBsYXN0IHBhcnQpLCBvciB0aGUgYWN0dWFsIHRhcmdldCAobm9uIGNvbnRhaW5tZW50IGFzIHRhcmdldClcblx0Ly8gVGhlIHBhcmVudCBlbnRpdHlTZXQgcG9pbnRpbmcgdG8gdGhlIHByZXZpb3VzIGVudGl0eVNldCB1c2VkIGluIHRoZSBwYXRoXG5cdC8vIFZpc2l0ZWROYXZpZ2F0aW9uUGF0aCBzaG91bGQgY29udGFpbiB0aGUgcGF0aCB1cCB0byB0aGlzIHByb3BlcnR5XG5cblx0Ly8gUmVzdHJpY3Rpb25zIHNob3VsZCB0aGVuIGJlIGV2YWx1YXRlZCBhcyBQYXJlbnRFbnRpdHlTZXQuTmF2UmVzdHJpY3Rpb25zW05hdlByb3BlcnR5UGF0aF0gfHwgVGFyZ2V0RW50aXR5U2V0LlJlc3RyaWN0aW9uc1xuXHRjb25zdCBmdWxsTmF2aWdhdGlvblBhdGggPSB2aXNpdGVkTmF2aWdhdGlvblByb3BzTmFtZS5qb2luKFwiL1wiKTtcblx0bGV0IHJlc3RyaWN0aW9ucywgdmlzaXRlZE5hdlByb3BzO1xuXHRpZiAocGFyZW50RW50aXR5U2V0ICE9PSBudWxsKSB7XG5cdFx0Y29uc3QgX3BhcmVudEVudGl0eVNldDogRW50aXR5U2V0ID0gcGFyZW50RW50aXR5U2V0O1xuXHRcdF9wYXJlbnRFbnRpdHlTZXQuYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcz8uTmF2aWdhdGlvblJlc3RyaWN0aW9ucz8uUmVzdHJpY3RlZFByb3BlcnRpZXMuZm9yRWFjaChcblx0XHRcdChyZXN0cmljdGVkTmF2UHJvcDogTmF2aWdhdGlvblByb3BlcnR5UmVzdHJpY3Rpb25UeXBlcykgPT4ge1xuXHRcdFx0XHRpZiAocmVzdHJpY3RlZE5hdlByb3AuTmF2aWdhdGlvblByb3BlcnR5Py50eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIikge1xuXHRcdFx0XHRcdGNvbnN0IHJlc3RyaWN0aW9uRGVmaW5pdGlvbiA9IGNoZWNrRnVuY3Rpb24ocmVzdHJpY3RlZE5hdlByb3ApO1xuXHRcdFx0XHRcdGlmIChmdWxsTmF2aWdhdGlvblBhdGggPT09IHJlc3RyaWN0ZWROYXZQcm9wLk5hdmlnYXRpb25Qcm9wZXJ0eS52YWx1ZSAmJiByZXN0cmljdGlvbkRlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgX2FsbFZpc2l0ZWROYXZpZ2F0aW9uUHJvcHMgPSBhbGxWaXNpdGVkTmF2aWdhdGlvblByb3BzLnNsaWNlKDAsIC0xKTtcblx0XHRcdFx0XHRcdHZpc2l0ZWROYXZQcm9wcyA9IF9hbGxWaXNpdGVkTmF2aWdhdGlvblByb3BzO1xuXHRcdFx0XHRcdFx0Y29uc3QgcGF0aFJlbGF0aXZlTG9jYXRpb24gPSBnZXRQYXRoUmVsYXRpdmVMb2NhdGlvbihkYXRhTW9kZWxPYmplY3RQYXRoPy5jb250ZXh0TG9jYXRpb24sIHZpc2l0ZWROYXZQcm9wcykubWFwKFxuXHRcdFx0XHRcdFx0XHQobnApID0+IG5wLm5hbWVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRjb25zdCBwYXRoVmlzaXRvckZ1bmN0aW9uID0gZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGg/LnBhdGhWaXNpdG9yXG5cdFx0XHRcdFx0XHRcdD8gZ2V0UGF0aFZpc2l0b3JGb3JTaW5nbGV0b24oZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGgucGF0aFZpc2l0b3IsIHBhdGhSZWxhdGl2ZUxvY2F0aW9uKVxuXHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZDsgLy8gc2VuZCBwYXRoVmlzaXRvciBmdW5jdGlvbiBvbmx5IHdoZW4gaXQgaXMgZGVmaW5lZCBhbmQgb25seSBzZW5kIGZ1bmN0aW9uIG9yIGRlZmluZWQgYXMgYSBwYXJhbWV0ZXJcblx0XHRcdFx0XHRcdHJlc3RyaWN0aW9ucyA9IGVxdWFsKFxuXHRcdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ocmVzdHJpY3Rpb25EZWZpbml0aW9uLCBwYXRoUmVsYXRpdmVMb2NhdGlvbiwgdW5kZWZpbmVkLCBwYXRoVmlzaXRvckZ1bmN0aW9uKSxcblx0XHRcdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHQpO1xuXHR9XG5cdGxldCB0YXJnZXRSZXN0cmljdGlvbnM7XG5cdGlmICghZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGg/Lmlnbm9yZVRhcmdldENvbGxlY3Rpb24pIHtcblx0XHRsZXQgcmVzdHJpY3Rpb25EZWZpbml0aW9uID0gY2hlY2tGdW5jdGlvbih0YXJnZXRFbnRpdHlTZXQ/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXMpO1xuXHRcdGlmICh0YXJnZXRFbnRpdHlTZXQgPT09IG51bGwgJiYgcmVzdHJpY3Rpb25EZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJlc3RyaWN0aW9uRGVmaW5pdGlvbiA9IGNoZWNrRnVuY3Rpb24odGFyZ2V0RW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcyk7XG5cdFx0fVxuXHRcdGlmIChyZXN0cmljdGlvbkRlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgcGF0aFJlbGF0aXZlTG9jYXRpb24gPSBnZXRQYXRoUmVsYXRpdmVMb2NhdGlvbihkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbiwgYWxsVmlzaXRlZE5hdmlnYXRpb25Qcm9wcykubWFwKFxuXHRcdFx0XHQobnApID0+IG5wLm5hbWVcblx0XHRcdCk7XG5cdFx0XHRjb25zdCBwYXRoVmlzaXRvckZ1bmN0aW9uID0gZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGg/LnBhdGhWaXNpdG9yXG5cdFx0XHRcdD8gZ2V0UGF0aFZpc2l0b3JGb3JTaW5nbGV0b24oZXh0cmFjdGlvblBhcmFtZXRlcnNPblBhdGgucGF0aFZpc2l0b3IsIHBhdGhSZWxhdGl2ZUxvY2F0aW9uKVxuXHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdHRhcmdldFJlc3RyaWN0aW9ucyA9IGVxdWFsKFxuXHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ocmVzdHJpY3Rpb25EZWZpbml0aW9uLCBwYXRoUmVsYXRpdmVMb2NhdGlvbiwgdW5kZWZpbmVkLCBwYXRoVmlzaXRvckZ1bmN0aW9uKSxcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gKFxuXHRcdHJlc3RyaWN0aW9ucyB8fCB0YXJnZXRSZXN0cmljdGlvbnMgfHwgKGV4dHJhY3Rpb25QYXJhbWV0ZXJzT25QYXRoPy5hdXRob3JpemVVbnJlc29sdmFibGUgPyB1bnJlc29sdmFibGVFeHByZXNzaW9uIDogY29uc3RhbnQodHJ1ZSkpXG5cdCk7XG59O1xuXG4vKipcbiAqIFNldCBhIHRyYWlsaW5nIHNsYXNoIHRvIGEgcGF0aCBpZiBub3QgYWxyZWFkeSBzZXQuXG4gKlxuICogQHBhcmFtIHBhdGggVGhlIHBhdGhcbiAqIEByZXR1cm5zIFRoZSBwYXRoIHdpdGggYSB0cmFpbGluZyBzbGFzaFxuICovXG5jb25zdCBzZXRUcmFpbGluZ1NsYXNoID0gZnVuY3Rpb24gKHBhdGg6IHN0cmluZykge1xuXHRpZiAocGF0aC5sZW5ndGggJiYgIXBhdGguZW5kc1dpdGgoXCIvXCIpKSB7XG5cdFx0cmV0dXJuIGAke3BhdGh9L2A7XG5cdH1cblx0cmV0dXJuIHBhdGg7XG59O1xuXG4vLyBUaGlzIGhlbHBlciBtZXRob2QgaXMgdXNlZCB0byBhZGQgcmVsYXRpdmUgcGF0aCBsb2NhdGlvbiBhcmd1bWVudCB0byBzaW5nbGV0b25QYXRoVmlzaXRvckZ1bmN0aW9uIGkuZS4gcGF0aFZpc2l0b3Jcbi8vIHBhdGhWaXNpdG9yIG1ldGhvZCBpcyB1c2VkIGxhdGVyIHRvIGdldCB0aGUgY29ycmVjdCBiaW5kaW5ncyBmb3Igc2luZ2xldG9uIGVudGl0eVxuLy8gbWV0aG9kIGlzIGludm9rZWQgbGF0ZXIgaW4gcGF0aEluTW9kZWwoKSBtZXRob2QgdG8gZ2V0IHRoZSBjb3JyZWN0IGJpbmRpbmcuXG5jb25zdCBnZXRQYXRoVmlzaXRvckZvclNpbmdsZXRvbiA9IGZ1bmN0aW9uIChwYXRoVmlzaXRvcjogRnVuY3Rpb24sIHBhdGhSZWxhdGl2ZUxvY2F0aW9uOiBzdHJpbmdbXSkge1xuXHRyZXR1cm4gZnVuY3Rpb24gKHBhdGg6IHN0cmluZykge1xuXHRcdHJldHVybiBwYXRoVmlzaXRvcihwYXRoLCBwYXRoUmVsYXRpdmVMb2NhdGlvbik7XG5cdH07XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7OztFQXdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxnQkFBZ0IsR0FBRyxVQUFVQyxXQUFnQyxFQUFFO0lBQzNFLE9BQU9DLHVCQUF1QixDQUFDRCxXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRUUsZUFBZSxFQUFFRixXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRUcsb0JBQW9CLENBQUMsQ0FBQ0MsR0FBRyxDQUFFQyxFQUFFLElBQUtBLEVBQUUsQ0FBQ0MsSUFBSSxDQUFDO0VBQ3JILENBQUM7RUFBQztFQUVLLE1BQU1MLHVCQUF1QixHQUFHLFVBQ3RDRCxXQUFpQyxFQUVHO0lBQUEsSUFEcENPLGVBQWtELHVFQUFH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